// The whole visit, end to end. Needs the production server (scripts/serve.sh).
//   node scripts/flow.mjs checks          behavior: preloader, keyboard, controls, sound, refresh, fallbacks
//   node scripts/flow.mjs layout          copy fits its pinned screen at every width, with and without the scene
//   node scripts/flow.mjs shots <width>x<height> [stories...]   screenshots of the live scene at one width
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const mode = process.argv[2] ?? "checks";
const results = [];
const check = (name, pass, detail = "") => results.push(`${pass ? "ok  " : "FAIL"} ${name} ${detail}`);

const sizes = [
  [375, 812],
  [375, 667],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
];

const html = (page, predicate, timeout = 60000) =>
  page.waitForFunction(predicate, undefined, { timeout }).then(
    () => true,
    () => false,
  );
const live = (page) => html(page, () => document.documentElement.dataset.scene === "live", 180000);
const loaded = (page) => html(page, () => "loaded" in document.documentElement.dataset);

const noWebGL = (page) =>
  page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
      return String(type).startsWith("webgl") ? null : original.call(this, type, ...rest);
    };
  });

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

// Layout boxes ignore transforms, so hinged-shut lines still count at their open size.
const overflow = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-stage]")]
      .map((stage, index) => {
        const bottom = stage.getBoundingClientRect().top + stage.clientHeight;
        const lowest = Math.max(
          ...[...stage.querySelectorAll(":scope > *")]
            .filter((child) => getComputedStyle(child).display !== "none")
            .map((child) => {
              const box = child.getBoundingClientRect();
              return box.top + child.offsetHeight;
            }),
        );
        return { chapter: index + 1, over: Math.round(lowest - bottom) };
      })
      .filter((item) => item.over > 0),
  );

async function checks(browser) {
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
    await loaded(page);
    const phasesDone = await page.evaluate(
      () => [...document.querySelectorAll("[data-phase]")].filter((item) => "done" in item.dataset).length,
    );
    check("preloader lets go with every phase done", phasesDone === 5, String(phasesDone));

    // Keyboard: every stop shows a focus ring and ends up on screen.
    const stops = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
      stops.push(
        await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return null;
          const style = getComputedStyle(element);
          return {
            name: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
            ring: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0,
          };
        }),
      );
    }
    const reached = stops.filter(Boolean);
    check(
      "keyboard: tab stops show a focus ring",
      reached.length > 4 && reached.every((stop) => stop.ring),
      reached.map((stop) => `${stop.name}${stop.ring ? "" : "(no ring)"}`).join(" "),
    );
    await page.keyboard.press("Shift+Tab");
    await scrollToStory(page, 0);

    const sound = page.getByRole("button", { name: "Sound" });
    await sound.click();
    const on = await html(page, () => document.querySelector("header button")?.getAttribute("aria-pressed") === "true");
    await sound.click();
    const off = await html(page, () => document.querySelector("header button")?.getAttribute("aria-pressed") === "false");
    check("sound toggle switches on and off", on && off);

    const contact = await page.getByRole("link", { name: "Contact" }).boundingBox();
    await page.mouse.move(200, 400);
    await page.mouse.move((contact?.x ?? 0) + 8, (contact?.y ?? 0) + 6);
    check("dog-ear unfolds over a link", await html(page, () => document.querySelector("[data-open]") !== null));

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
    const range = page.locator("input[type=range]");
    const before = await page.locator("output").textContent();
    await range.focus();
    await page.keyboard.press("End");
    const packed = await html(
      page,
      () => Number(document.getElementById("pack-small-title")?.style.getPropertyValue("--wdth")) < 52,
    );
    const after = await page.locator("output").textContent();
    check("pack control folds the sheet from the keyboard", packed && before !== after, `${before} -> ${after}`);
    await page.keyboard.press("Home");

    await scrollToStory(page, 2.72);
    await html(page, () =>
      [...document.querySelectorAll("[data-tag] p")].every((chip) => getComputedStyle(chip).visibility === "visible"),
    );
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-tag] p")].every((chip) => {
        const box = chip.getBoundingClientRect();
        return box.left >= 0 && box.right <= window.innerWidth && box.top >= 0 && box.bottom <= window.innerHeight;
      }),
    );
    check("tags follow the vault inside the viewport", inside);

    // Lost context: the drawing stands in, then the scene comes back.
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
      window.__lose = gl?.getExtension("WEBGL_lose_context");
      window.__lose?.loseContext();
    });
    const lost = await html(page, () => {
      const drawing = document.querySelector("#stand-up svg");
      return document.documentElement.dataset.scene === "lost" && drawing !== null && getComputedStyle(drawing).display !== "none";
    });
    await page.evaluate(() => window.__lose?.restoreContext());
    const back = await live(page);
    check("lost context shows the drawing and recovers", lost && back);

    const scrolled = await page.evaluate(() => window.scrollY);
    await page.reload();
    await live(page);
    const restored = await page.evaluate(() => window.scrollY);
    check("refresh mid-page keeps the place", Math.abs(restored - scrolled) < 8, `${scrolled} -> ${restored}`);

    await page.getByRole("link", { name: "Contact" }).click();
    await html(page, () => window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2);
    check("contact link scrolls to the end", await page.evaluate(() => document.activeElement?.id === "contact"));
    const opened = await html(
      page,
      () => {
        const line = document.querySelector("#contact h3 div");
        const cells = line ? getComputedStyle(line).transform.match(/-?[\d.]+(e-?\d+)?/g) : null;
        return cells !== null && Math.abs(Number(cells[6]) - 1) < 0.01;
      },
      120000,
    );
    check("contact copy opens after the jump", opened);
    check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
    await page.close();
  }

  {
    // Stuck load: the fonts never arrive, so the preloader must let go on its own.
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.route("**/*.woff2", () => {});
    const start = Date.now();
    await page.goto(base, { waitUntil: "commit" });
    const released = await loaded(page);
    const seconds = (Date.now() - start) / 1000;
    check("stuck load is released after its limit", released && seconds > 10, `${seconds.toFixed(1)} s`);
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
    const state = await page.evaluate(() => ({
      colors: new Set(
        [...document.querySelectorAll("[data-chapter]")].map((section) => getComputedStyle(section).backgroundColor),
      ).size,
      drawings: [...document.querySelectorAll("[data-chapter] svg")].filter((svg) => getComputedStyle(svg).display !== "none")
        .length,
    }));
    check("no JavaScript: own pages and drawings", state.colors === 5 && state.drawings === 5, JSON.stringify(state));
    await context.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await noWebGL(page);
    await page.goto(base);
    const released = await html(
      page,
      () => document.documentElement.dataset.scene === "none" && "loaded" in document.documentElement.dataset,
    );
    const drawn = await page.evaluate(() => {
      const drawing = document.querySelector("[data-chapter] svg");
      return drawing !== null && getComputedStyle(drawing).display !== "none";
    });
    check("no WebGL: preloader lets go and the drawing stands in", released && drawn);
    await page.close();
  }
}

// Fast: without WebGL the page settles in seconds. The live layout is the same page with the tag facts hidden.
async function layout(browser) {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } });
    await noWebGL(page);
    await page.goto(base);
    await html(page, () => "loaded" in document.documentElement.dataset && "pinned" in document.documentElement.dataset);
    const off = await overflow(page);
    await page.evaluate(() => {
      document.documentElement.dataset.scene = "live";
    });
    const on = await overflow(page);
    check(`copy fits its screen at ${width}x${height} without the scene`, off.length === 0, JSON.stringify(off));
    check(`copy fits its screen at ${width}x${height} with the scene`, on.length === 0, JSON.stringify(on));
    await page.close();
  }
}

async function shots(browser) {
  const [width, height] = (process.argv[3] ?? "1440x900").split("x").map(Number);
  const stories = process.argv.slice(4).map(Number);
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await live(page);
  await loaded(page);
  await mkdir("shots", { recursive: true });
  for (const story of stories.length > 0 ? stories : [0.4, 2.7]) {
    await scrollToStory(page, story);
    const file = `shots/flow-${width}x${height}-${Math.round(story * 100)}.png`;
    await page.screenshot({ path: file });
    results.push(file);
  }
  check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
}

const browser = await chromium.launch();
await { checks, layout, shots }[mode](browser);
await browser.close();
console.log(results.join("\n"));
process.exit(results.some((line) => line.startsWith("FAIL")) ? 1 : 0);
