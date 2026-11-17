// The preloader and the handover to the scene: node scripts/intro.mjs [width] [extra query]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const width = Number(process.argv[2] ?? 1280);
const query = process.argv[3] ?? "";
const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const height = width < 600 ? 812 : Math.round((width * 9) / 16);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("shots", { recursive: true });

const started = Date.now();
await page.goto(`${base}/?${query}`, { waitUntil: "commit" });
await page.waitForSelector("[data-phase]");
await page.screenshot({ path: `shots/intro-${width}-0.png` });
await page.waitForFunction(() => "loaded" in document.documentElement.dataset, undefined, { timeout: 180000 });
const state = await page.evaluate(() => ({
  scene: document.documentElement.dataset.scene ?? "",
  done: [...document.querySelectorAll("[data-phase]")].filter((item) => "done" in item.dataset).length,
}));
console.log("released after", Date.now() - started, "ms", JSON.stringify(state));
// Frames of the handover: in the cloud the scene draws about one frame a second.
for (let frame = 1; frame <= 4; frame += 1) {
  await page.screenshot({ path: `shots/intro-${width}-${frame}.png` });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
console.log("errors:", errors.length, errors.slice(0, 3).join(" | "));
await browser.close();
