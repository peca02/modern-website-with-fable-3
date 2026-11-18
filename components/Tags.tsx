"use client";

import { useRef } from "react";
import { tagsWindow } from "@/lib/beats";
import { durations, eases, gsap, media, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

const edge = 24;
// The chip's offset from its point (bottom-2 left-2) and the room it keeps from the copy and other chips.
const inset = 8;
const gap = 8;

type Box = { left: number; right: number; top: number; bottom: number };

type TagsProps = { chapter: string; tags: readonly { anchor: string; label: string }[] };

/**
 * Small paper tags that stay next to points of the 3D vault. Decorative copies: the same facts are in the
 * chapter's own markup for screen readers and for pages without a scene.
 */
export function Tags({ chapter, tags }: TagsProps) {
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ full: media.full, reduced: media.reduced }, (context) => {
        const reduced = Boolean(context.conditions?.reduced);
        const items = gsap.utils.toArray<HTMLElement>("[data-tag]", layer.current).map((holder, index) => {
          const chip = holder.firstElementChild;
          const hinge = gsap.fromTo(
            chip,
            { rotationX: -92, autoAlpha: 0, transformPerspective: 600, transformOrigin: "50% 100%" },
            {
              rotationX: 0,
              autoAlpha: 1,
              duration: reduced ? 0 : durations.fold,
              delay: reduced ? 0 : index * 0.12,
              ease: eases.spring,
              paused: true,
            },
          );
          return { holder, chip, hinge, anchor: holder.dataset.tag ?? "", shown: false, width: 0, height: 0 };
        });
        const copy = document.querySelector(`#${chapter} [data-copy]`);

        const tick = () => {
          const inWindow =
            document.documentElement.dataset.facts === "tags" &&
            store.story >= tagsWindow[0] &&
            store.story <= tagsWindow[1];
          const moving = [];
          for (const item of items) {
            const anchor = store.anchors[item.anchor];
            const show = inWindow && Boolean(anchor?.visible);
            if (show !== item.shown) {
              item.shown = show;
              if (show) {
                item.width = item.chip instanceof HTMLElement ? item.chip.offsetWidth : 0;
                item.height = item.chip instanceof HTMLElement ? item.chip.offsetHeight : 0;
                item.hinge.play();
              } else item.hinge.reverse();
            }
            if (anchor && (show || item.hinge.isActive())) moving.push({ item, x: anchor.x, y: anchor.y });
          }
          if (moving.length === 0) return;
          // Chips never cover the copy or each other: one that would is pushed down below it.
          const placed: Box[] = copy ? [copy.getBoundingClientRect()] : [];
          moving.sort((a, b) => a.y - b.y);
          for (const { item, x: pointX, y: pointY } of moving) {
            // A chip near the right edge slides back along its point instead of leaving the screen.
            const x = Math.min(pointX, store.viewport.width - item.width - edge);
            const left = x + inset;
            const right = left + item.width;
            let y = pointY;
            for (const box of placed) {
              const top = y - inset - item.height;
              if (left < box.right && right > box.left && top < box.bottom + gap && y - inset > box.top - gap) {
                y = box.bottom + gap + item.height + inset;
              }
            }
            y = Math.min(y, store.viewport.height - gap + inset);
            placed.push({ left, right, top: y - inset - item.height, bottom: y - inset });
            item.holder.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          }
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
    },
    { scope: layer },
  );

  return (
    <div ref={layer} aria-hidden className="stock-rosa pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {tags.map((tag) => (
        <div key={tag.anchor} data-tag={tag.anchor} className="absolute top-0 left-0">
          {/* The chip sits above its point; the cut corner is the fold. */}
          <p className="type-label paper-tag invisible absolute bottom-2 left-2 text-ink">
            {tag.label}
          </p>
        </div>
      ))}
    </div>
  );
}
