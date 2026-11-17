"use client";

import { useRef } from "react";
import { tagsWindow } from "@/lib/beats";
import { durations, eases, gsap, media, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

const edge = 24;

type TagsProps = { tags: readonly { anchor: string; label: string }[] };

/**
 * Small paper tags that stay next to points of the 3D vault. Decorative copies: the same facts are in the
 * chapter's own markup for screen readers and for pages without a scene.
 */
export function Tags({ tags }: TagsProps) {
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
          return { holder, chip, hinge, anchor: holder.dataset.tag ?? "", shown: false, width: 0 };
        });

        const tick = () => {
          const inWindow = store.story >= tagsWindow[0] && store.story <= tagsWindow[1];
          for (const item of items) {
            const anchor = store.anchors[item.anchor];
            const show = inWindow && Boolean(anchor?.visible);
            if (show !== item.shown) {
              item.shown = show;
              if (show) {
                item.width = item.chip instanceof HTMLElement ? item.chip.offsetWidth : 0;
                item.hinge.play();
              } else item.hinge.reverse();
            }
            if (anchor && (show || item.hinge.isActive())) {
              // A chip near the right edge slides back along its point instead of leaving the screen.
              const x = Math.min(anchor.x, store.viewport.width - item.width - edge);
              item.holder.style.transform = `translate3d(${x.toFixed(1)}px, ${anchor.y.toFixed(1)}px, 0)`;
            }
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
