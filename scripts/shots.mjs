// One chapter, one width per run: node scripts/shots.mjs <chapter 0-4> <width> [local 0-1] [extra query]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const chapter = Number(process.argv[2] ?? 0);
const width = Number(process.argv[3] ?? 1440);
const local = Number(process.argv[4] ?? 0.5);
const query = process.argv[5] ?? "tier=3";
const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const height = width < 600 ? 812 : width < 1100 ? 1024 : Math.round((width * 9) / 16);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(`${base}/?${query}`);
await page.waitForFunction(() => document.documentElement.dataset.scene === "live", undefined, {
  timeout: 180000,
});
await page.evaluate(
  ([index, share]) => {
    const section = document.querySelectorAll("[data-chapter]")[index];
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + section.getBoundingClientRect().height * share);
  },
  [chapter, local],
);
await page.evaluate(
  () =>
    new Promise((resolve) => {
      let frames = 0;
      const step = () => {
        frames += 1;
        if (frames > 6) resolve(null);
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }),
);

await mkdir("shots", { recursive: true });
const file = `shots/ch${chapter}-${width}-${Math.round(local * 100)}.png`;
await page.screenshot({ path: file });
const state = await page.evaluate(() => ({
  motion: document.documentElement.dataset.motion,
  backdrop: document.documentElement.style.getPropertyValue("--backdrop"),
  scrollY: Math.round(window.scrollY),
}));
console.log(file, JSON.stringify(state), "errors:", errors.length, errors.slice(0, 3).join(" | "));
await browser.close();
