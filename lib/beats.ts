import type { StockName } from "@/lib/palette";

export type ChapterBeat = {
  id: string;
  stock: StockName;
  /** Pin length in viewport heights when motion is allowed. */
  length: number;
};

// Story position = chapter index + local progress, so chapter i spans [i, i + 1).
export const chapters = [
  { id: "start-flat", stock: "fern", length: 2 },
  { id: "pack-small", stock: "mustard", length: 3 },
  { id: "stand-up", stock: "rosa", length: 3 },
  { id: "stay-creased", stock: "pulp", length: 3 },
  { id: "let-go", stock: "lilac", length: 3 },
] as const satisfies readonly ChapterBeat[];

export const chapterCount = chapters.length;

/** Share of a chapter's end over which the page color turns into the next stock. */
export const pageTurnSpan = 0.25;
