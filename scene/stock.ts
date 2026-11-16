import { Color } from "three";
import { chapterCount, chapters, pageTurnSpan } from "@/lib/beats";
import { stocks } from "@/lib/palette";

const from = new Color();
const to = new Color();

function stockAt(index: number) {
  const chapter = chapters[Math.min(chapterCount - 1, Math.max(0, index))] ?? chapters[0];
  return stocks[chapter.stock];
}

/** The page or ink color under the scene, turning over the same span as the CSS backdrop. */
export function backdropAt(story: number, tone: "page" | "ink", out: Color) {
  const index = Math.min(chapterCount - 1, Math.floor(story));
  const local = story - index;
  const mix = Math.min(1, Math.max(0, (local - (1 - pageTurnSpan)) / pageTurnSpan));
  from.set(stockAt(index)[tone]);
  to.set(stockAt(index + 1)[tone]);
  return out.lerpColors(from, to, mix);
}

/** The reverse of the sheet carries the next page's color; it changes while that side is hidden. */
export function reverseAt(story: number) {
  const next = chapters[(Math.floor(story) + 1) % chapterCount] ?? chapters[0];
  return stocks[next.stock].page;
}
