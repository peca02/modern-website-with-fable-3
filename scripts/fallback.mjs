// The page without the scene: node scripts/fallback.mjs <nojs|nowebgl> [width] [story for nowebgl]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const mode = process.argv[2] ?? "nojs";
const width = Number(process.argv[3] ?? 1280);
const story = Number(process.argv[4] ?? 0);
const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const height = width < 600 ? 812 : Math.round((width * 9) / 16);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: mode !== "nojs" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
if (mode === "nowebgl") {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
      return String(type).startsWith("webgl") ? null : original.call(this, type, ...rest);
    };
  });
}
await page.goto(base);
await mkdir("shots", { recursive: true });
const file = `shots/${mode}-${width}${mode === "nowebgl" ? `-${Math.round(story * 100)}` : ""}.png`;
if (mode === "nowebgl") {
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === "none" && "loaded" in document.documentElement.dataset,
    undefined,
    { timeout: 60000 },
  );
  await page.evaluate(
    (at) =>
      new Promise((resolve) => {
        const sections = [...document.querySelectorAll("[data-chapter]")];
        const index = Math.min(sections.length - 1, Math.floor(at));
        let top = 0;
        for (let i = 0; i < index; i += 1) top += sections[i].offsetHeight;
        window.scrollTo(0, top + sections[index].offsetHeight * (at - index));
        let still = 0;
        let last = NaN;
        let frames = 0;
        const step = () => {
          const now = sections[0].getBoundingClientRect().top;
          still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
          last = now;
          frames += 1;
          if (still > 30 || frames > 600) resolve(null);
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    story,
  );
  await page.screenshot({ path: file });
} else {
  await page.screenshot({ path: file, fullPage: true });
}
console.log(file, "errors:", errors.length, errors.slice(0, 3).join(" | "));
await browser.close();
