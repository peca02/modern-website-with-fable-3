// The dog-ear cursor, folded and unfolded: node scripts/cursor.mjs
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.SHOTS_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
await page.goto(base);
await page.waitForFunction(() => "loaded" in document.documentElement.dataset, undefined, { timeout: 180000 });
await mkdir("shots", { recursive: true });
// Waits until the ear has stopped moving and its flap has stopped turning.
const settle = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const ear = document.querySelector("div.fixed.size-6");
        let last = "";
        let still = 0;
        let frames = 0;
        const step = () => {
          const now = `${ear?.getAttribute("style")}${ear?.firstElementChild?.getAttribute("style")}`;
          still = now === last ? still + 1 : 0;
          last = now;
          frames += 1;
          if (still > 20 || frames > 600) resolve(null);
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
  );
const link = await page.getByRole("link", { name: "Contact" }).boundingBox();
await page.mouse.move(300, 500);
await page.mouse.move(640, 620);
await settle();
await page.screenshot({ path: "shots/cursor-folded.png", clip: { x: 600, y: 580, width: 160, height: 120 } });
await page.mouse.move(link.x + 8, link.y + 6);
await settle();
await page.screenshot({ path: "shots/cursor-open.png", clip: { x: link.x - 80, y: link.y - 20, width: 160, height: 120 } });
await browser.close();
