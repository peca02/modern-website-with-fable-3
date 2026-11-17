import type { StockName } from "@/lib/palette";

export type ChapterBeat = {
  id: string;
  stock: StockName;
  /** Height of the chapter in viewport heights when motion is allowed: pinned for `length - 1`, then it scrolls away. */
  length: number;
  /** Local progress of the pose the chapter holds under reduced motion. */
  hold: number;
};

// Story position = chapter index + local progress, so chapter i spans [i, i + 1).
export const chapters = [
  { id: "start-flat", stock: "fern", length: 2, hold: 0.3 },
  { id: "pack-small", stock: "mustard", length: 4, hold: 0.2 },
  { id: "stand-up", stock: "rosa", length: 4, hold: 0.7 },
  { id: "stay-creased", stock: "pulp", length: 4, hold: 0.66 },
  { id: "let-go", stock: "lilac", length: 4, hold: 0.86 },
] as const satisfies readonly ChapterBeat[];

export const chapterCount = chapters.length;

/** Share of a chapter's end over which the page color turns into the next stock. */
export const pageTurnSpan = 0.25;

/** Story range in which the vault stands and its tags are shown. */
export const tagsWindow = [2.64, 2.9] as const;

/** Width axis of the pack headline: open sheet to packed block. */
export const packWidth = { open: 100, packed: 50 } as const;
