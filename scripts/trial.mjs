import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.goto(url);
await page.waitForFunction(
  () => document.documentElement.dataset.scene === "ready" && document.documentElement.dataset.motion === "ready",
  undefined,
  { timeout: 120000 },
);
const report = await page.evaluate(() => ({
  canvas: document.querySelectorAll("canvas").length,
  smoother: Boolean(document.querySelector("[data-split] div")),
  font: getComputedStyle(document.querySelector("h1")).fontFamily.slice(0, 40),
}));
await page.screenshot({ path: process.argv[3] ?? "shots/trial.png" });
console.log(JSON.stringify(report), "errors:", errors.length, errors.slice(0, 3).join(" | "));
await browser.close();
