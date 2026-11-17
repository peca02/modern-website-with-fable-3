"use client";

import { chapters } from "@/lib/beats";
import { durations, eases, gsap, media, SplitText, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

type Item = { at: number; until: number; open: boolean; forced: boolean; hinge: gsap.core.Tween | null };

// Scrolling back closes a line a little before the point where it opened, so it never chatters at the threshold.
const slack = 0.02;

/** Share of a screen a chapter scrolls away before its copy closes. */
const leaveAfter = 0.25;

/**
 * Hinge reveals: every `[data-reveal]` opens line by line from its top edge once the story passes the
 * element's `data-at` (local progress of its chapter) and closes again when the chapter leaves. `data-reveal="block"` hinges the element as one piece.
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

      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      sections.forEach((section, index) => {
        // A chapter folds its copy shut once it has scrolled a part of a screen away, before it meets the header.
        const length = chapters[index]?.length ?? 1;
        const until = index === sections.length - 1 ? Infinity : index + 1 - (1 - leaveAfter) / length;
        section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
          const item: Item = { at: index + Number(element.dataset.at ?? 0), until, open: false, forced: false, hinge: null };
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
          const open =
            item.forced || (store.story >= item.at - (item.open ? slack : 0) && store.story < item.until);
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
