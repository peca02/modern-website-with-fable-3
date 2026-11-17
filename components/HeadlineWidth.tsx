"use client";

import { chapters, headlineWidth } from "@/lib/beats";
import { gsap, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";
import { direct } from "@/scene/direction";

const contentWidth = (headline: HTMLElement, width: number) => {
  headline.style.setProperty("--wdth", String(width));
  headline.style.width = "max-content";
  const measured = headline.offsetWidth;
  headline.style.width = "";
  return measured;
};

/**
 * Every chapter headline narrows as its sheet folds: the width axis follows the same fold value the scene
 * shows, pack control included. Each headline reads the story clamped to its own chapter, so only the one
 * on screen changes; under reduced motion each one holds its chapter's pose. Where a flat-sheet headline
 * would run past the page margin, its widest setting is lowered to what fits (`data-widest`).
 */
export function HeadlineWidth() {
  useGSAP(() => {
    const headlines = chapters.map((chapter) => document.getElementById(`${chapter.id}-title`));
    const widest = chapters.map((): number => headlineWidth.flat);
    const shown = chapters.map(() => "");

    // Headlines may run over the sheet, never past the margin the copy keeps on the left.
    const measure = () => {
      const present = headlines.filter((headline) => headline !== null);
      const margin = Math.min(...present.map((headline) => headline.getBoundingClientRect().left));
      const limit = document.documentElement.clientWidth - margin;
      headlines.forEach((headline, index) => {
        if (!headline) return;
        const room = limit - headline.getBoundingClientRect().left;
        const folded = contentWidth(headline, headlineWidth.folded);
        const flat = contentWidth(headline, headlineWidth.flat);
        const fits =
          flat > folded
            ? headlineWidth.folded + ((headlineWidth.flat - headlineWidth.folded) * (room - folded)) / (flat - folded)
            : headlineWidth.flat;
        widest[index] = gsap.utils.clamp(headlineWidth.folded, headlineWidth.flat, Math.floor(fits));
        headline.dataset.widest = String(widest[index]);
      });
      // The next tick writes every headline again.
      shown.fill("");
    };

    const tick = () => {
      chapters.forEach((chapter, index) => {
        const headline = headlines[index];
        if (!headline) return;
        const story = store.reduced
          ? index + chapter.hold
          : gsap.utils.clamp(index, index + 0.999, store.story);
        const fold = direct(story, 0, 0, 0, store.viewport.wide, store.controls.pack).fold;
        const width = gsap.utils
          .interpolate(widest[index] ?? headlineWidth.flat, headlineWidth.folded, gsap.utils.clamp(0, 1, fold))
          .toFixed(1);
        if (width === shown[index]) return;
        shown[index] = width;
        headline.style.setProperty("--wdth", width);
      });
    };

    measure();
    void document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("resize", measure);
      gsap.ticker.remove(tick);
      headlines.forEach((headline) => headline?.style.removeProperty("--wdth"));
    };
  });

  return null;
}
