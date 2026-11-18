// Contact sheet of several shots, so one image shows a whole width: node scripts/sheet.mjs <name> <shot> <shot> ...
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const [name, ...shots] = process.argv.slice(2);
const images = shots.map((shot) => `<img src="${shot}.png" style="height:812px">`).join("");
const file = resolve("shots", `${name}.html`);
await writeFile(file, `<body style="margin:0;display:flex;gap:6px;background:#000">${images}</body>`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${file}`);
const width = await page.evaluate(() => document.body.scrollWidth);
await page.setViewportSize({ width, height: 812 });
await page.screenshot({ path: resolve("shots", `${name}.png`) });
await browser.close();
