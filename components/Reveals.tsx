"use client";

import { durations, eases, gsap, media, SplitText, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

type Item = { at: number; open: boolean; forced: boolean; hinge: gsap.core.Tween | null };

// Scrolling back closes a line a little before the point where it opened, so it never chatters at the threshold.
const slack = 0.02;

/**
 * Hinge reveals: every `[data-reveal]` opens line by line from its top edge once the story passes the
 * element's `data-at` (local progress of its chapter). `data-reveal="block"` hinges the element as one piece.
 */
export function Reveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(media.full, () => {
      const items: Item[] = [];
      const hingeOpen = (item: Item, targets: Element[]) => {
        item.hinge = gsap.fromTo(
          targets,
          { rotationX: -92, transformPerspective: 800, transformOrigin: "50% 0%" },
          { rotationX: 0, duration: durations.fold, ease: eases.spring, stagger: 0.08, paused: true },
        );
        item.hinge.progress(item.open ? 1 : 0);
        return item.hinge;
      };

      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section, index) => {
        section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
          const item: Item = { at: index + Number(element.dataset.at ?? 0), open: false, forced: false, hinge: null };
          items.push(item);
          // Keyboard focus may land in copy the scroll has not reached; it must not stay folded shut.
          element.addEventListener("focusin", () => {
            item.forced = true;
          });
          element.addEventListener("focusout", () => {
            item.forced = false;
          });
          if (element.dataset.reveal === "block") {
            hingeOpen(item, [element]);
          } else {
            // autoSplit splits again once the fonts have loaded and whenever the line breaks change.
            SplitText.create(element, {
              type: "lines",
              aria: "none",
              autoSplit: true,
              onSplit: (self) => hingeOpen(item, self.lines),
            });
          }
        });
      });

      const tick = () => {
        for (const item of items) {
          const open = item.forced || store.story >= item.at - (item.open ? slack : 0);
          if (open === item.open) continue;
          item.open = open;
          if (open) item.hinge?.play();
          else item.hinge?.reverse();
        }
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    });
  });

  return null;
}
