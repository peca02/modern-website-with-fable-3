// Behavior checks without pictures: node scripts/checks.mjs. Needs the production server (scripts/serve.sh).
import { chromium } from "playwright";

const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const results = [];
const check = (name, pass, detail = "") => results.push(`${pass ? "ok  " : "FAIL"} ${name} ${detail}`);

const live = (page) =>
  page.waitForFunction(() => document.documentElement.dataset.scene === "live", undefined, { timeout: 180000 });

// Scrolls to a story position and waits until smooth scrolling has stopped.
const scrollToStory = (page, story) =>
  page.evaluate(
    (at) =>
      new Promise((resolve) => {
        const sections = [...document.querySelectorAll("[data-chapter]")];
        const index = Math.min(sections.length - 1, Math.floor(at));
        let top = 0;
        for (let i = 0; i < index; i += 1) top += sections[i].offsetHeight;
        const span = sections[index].offsetHeight - (index === sections.length - 1 ? window.innerHeight : 0);
        window.scrollTo(0, top + span * (at - index));
        let still = 0;
        let last = NaN;
        let frames = 0;
        const step = () => {
          const now = sections[0].getBoundingClientRect().top;
          still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
          last = now;
          frames += 1;
          if (still > 8 || frames > 400) resolve(null);
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    story,
  );

const browser = await chromium.launch();

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "commit" });
  await page.waitForSelector("[data-phase]");
  check(
    "preloader covers the page while loading",
    await page.evaluate(() => {
      const overlay = document.querySelector("[data-phase]")?.closest("div.fixed");
      return !("loaded" in document.documentElement.dataset) && overlay !== null && getComputedStyle(overlay).display !== "none";
    }),
  );
  await live(page);
  await page.waitForFunction(() => "loaded" in document.documentElement.dataset, undefined, { timeout: 60000 });
  const phasesDone = await page.evaluate(
    () => [...document.querySelectorAll("[data-phase]")].filter((item) => "done" in item.dataset).length,
  );
  check("preloader lets go with every phase done", phasesDone === 5, String(phasesDone));

  const sound = page.getByRole("button", { name: "Sound" });
  await sound.click();
  await page.waitForFunction(() => document.querySelector("header button")?.getAttribute("aria-pressed") === "true");
  await sound.click();
  await page.waitForFunction(() => document.querySelector("header button")?.getAttribute("aria-pressed") === "false");
  check("sound toggle switches on and off", true);

  const contact = await page.getByRole("link", { name: "Contact" }).boundingBox();
  await page.mouse.move(200, 400);
  await page.mouse.move((contact?.x ?? 0) + 8, (contact?.y ?? 0) + 6);
  const unfolded = await page
    .waitForFunction(() => document.querySelector("[data-open]") !== null, undefined, { timeout: 60000 })
    .then(() => true, () => false);
  check("dog-ear unfolds over a link", unfolded);

  check("one h1", (await page.locator("h1").count()) === 1);
  check("chapters pinned", await page.evaluate(() => "pinned" in document.documentElement.dataset));
  const total = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
  check("page length in screens", total > 17 && total < 18.5, total.toFixed(2));

  await scrollToStory(page, 0.6);
  const early = await page.evaluate(() => document.documentElement.style.getPropertyValue("--backdrop"));
  check("chapter 1 keeps its page while pinned", early === "#4fbe8a", early);
  await scrollToStory(page, 0.9);
  const turning = await page.evaluate(() => {
    const style = document.documentElement.style;
    return `${style.getPropertyValue("--backdrop")} ${style.getPropertyValue("--turn")} ${style.getPropertyValue("--turn-page")}`;
  });
  check("page turns as a fold", turning.startsWith("#4fbe8a #e3b23c polygon("), turning.slice(0, 40));

  await scrollToStory(page, 1.3);
  const before = await page.locator("output").textContent();
  await page.locator("input[type=range]").fill("100");
  await page.waitForFunction(
    () => Number(document.getElementById("pack-small-title")?.style.getPropertyValue("--wdth")) < 52,
    undefined,
    { timeout: 60000 },
  );
  const after = await page.locator("output").textContent();
  check("pack control folds the sheet", before !== after, `${before} -> ${after}`);
  await page.locator("input[type=range]").fill("0");

  await scrollToStory(page, 2.72);
  await page.waitForFunction(
    () => [...document.querySelectorAll("[data-tag] p")].every((chip) => getComputedStyle(chip).visibility === "visible"),
    undefined,
    { timeout: 60000 },
  );
  const inside = await page.evaluate(() =>
    [...document.querySelectorAll("[data-tag] p")].every((chip) => {
      const box = chip.getBoundingClientRect();
      return box.left >= 0 && box.right <= window.innerWidth && box.top >= 0 && box.bottom <= window.innerHeight;
    }),
  );
  check("tags follow the vault inside the viewport", inside);

  const scrolled = await page.evaluate(() => window.scrollY);
  await page.reload();
  await live(page);
  const restored = await page.evaluate(() => window.scrollY);
  check("scroll restored after reload", Math.abs(restored - scrolled) < 8, `${scrolled} -> ${restored}`);

  await page.getByRole("link", { name: "Contact" }).click();
  await page.waitForFunction(
    () => window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2,
    undefined,
    { timeout: 60000 },
  );
  check("contact link scrolls to the end", await page.evaluate(() => document.activeElement?.id === "contact"));
  // The story must arrive too, not only the scrollbar: the contact copy opens at the very end.
  const opened = await page
    .waitForFunction(
      () => {
        const line = document.querySelector("#contact h3 div");
        const cells = line ? getComputedStyle(line).transform.match(/-?[\d.]+(e-?\d+)?/g) : null;
        return cells !== null && Math.abs(Number(cells[6]) - 1) < 0.01;
      },
      undefined,
      { timeout: 120000 },
    )
    .then(() => true, () => false);
  check("contact copy opens after the jump", opened);

  await scrollToStory(page, 0);
  await page.locator("input[type=range]").focus();
  const focused = await page.evaluate(
    () =>
      new Promise((resolve) =>
        setTimeout(() => {
          const block = document.querySelector("input[type=range]")?.closest("[data-reveal]");
          resolve(block ? getComputedStyle(block).transform : "missing");
        }, 1500),
      ),
  );
  // An open hinge is the identity apart from its perspective term.
  const cells = focused.match(/-?[\d.]+(e-?\d+)?/g)?.map(Number) ?? [];
  check("focused control is unfolded", focused === "none" || Math.abs((cells[6] ?? 1) - 1) < 0.01, focused);
  check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await page.close();
}

{
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(base);
  await live(page);
  const state = await page.evaluate(() => ({
    pinned: "pinned" in document.documentElement.dataset,
    motion: document.documentElement.dataset.motion,
    transformed: [...document.querySelectorAll("[data-reveal], [data-reveal] *")].some(
      (element) => getComputedStyle(element).transform !== "none",
    ),
  }));
  check("reduced motion: no pins, no hinges", !state.pinned && state.motion === "reduced" && !state.transformed);
  await context.close();
}

{
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(base);
  const colors = await page.evaluate(() =>
    [...document.querySelectorAll("[data-chapter]")].map((section) => getComputedStyle(section).backgroundColor),
  );
  check("no JavaScript: chapters paint their own page", new Set(colors).size === 5, colors.join(" "));
  await context.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
      return String(type).startsWith("webgl") ? null : original.call(this, type, ...rest);
    };
  });
  await page.goto(base);
  const released = await page
    .waitForFunction(
      () => document.documentElement.dataset.scene === "none" && "loaded" in document.documentElement.dataset,
      undefined,
      { timeout: 60000 },
    )
    .then(() => true, () => false);
  const drawn = await page.evaluate(() => {
    const drawing = document.querySelector("[data-chapter] svg");
    return drawing !== null && getComputedStyle(drawing).display !== "none";
  });
  check("no WebGL: preloader lets go and the drawing stands in", released && drawn);
  await page.close();
}

await browser.close();
console.log(results.join("\n"));
process.exit(results.some((line) => line.startsWith("FAIL")) ? 1 : 0);
