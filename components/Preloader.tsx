"use client";

import { useRef } from "react";
import { durations, eases, gsap, media, useGSAP } from "@/lib/gsap";
import { loadClock, phases, type Phase } from "@/lib/loadClock";
import { store } from "@/lib/store";

type PreloaderProps = { title: string; steps: Record<Phase, string> };

/** Seconds after which a stuck load is released anyway. */
const patience = 12;

/**
 * The preloader is the sheet: a full-screen plane in the sheet's face color listing the real load phases as
 * steps. When it lets go the 3D sheet is behind it in the same color and recedes into chapter 1.
 */
export function Preloader({ title, steps }: PreloaderProps) {
  const overlay = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = document.documentElement;
      const mm = gsap.matchMedia();
      mm.add({ full: media.full, reduced: media.reduced }, (context) => {
        const reduced = Boolean(context.conditions?.reduced);
        const items = gsap.utils.toArray<HTMLElement>("[data-phase]");
        const lines = gsap.utils.toArray<HTMLElement>("[data-line]");
        let released = store.load.at > 0;

        const open = () => {
          // The intro belongs to the top of the page; a reload further down goes straight to its chapter.
          store.load.intro = !reduced && store.story < 0.5;
          store.load.at = performance.now();
          root.dataset.loaded = "";
        };
        const release = () => {
          if (released) return;
          released = true;
          if (reduced) open();
          else {
            gsap.to(lines, {
              rotationX: 92,
              transformPerspective: 800,
              transformOrigin: "50% 0%",
              duration: durations.snap,
              ease: eases.crease,
              stagger: 0.03,
              onComplete: open,
            });
          }
        };
        const update = () => {
          for (const item of items) {
            const phase = phases.find((name) => name === item.dataset.phase);
            if (phase && loadClock.has(phase)) item.dataset.done = "";
          }
          if (loadClock.settled) release();
        };

        const unsubscribe = loadClock.subscribe(update);
        const limit = window.setTimeout(release, patience * 1000);
        void document.fonts.ready.then(() => loadClock.mark("fonts"));
        update();

        return () => {
          unsubscribe();
          window.clearTimeout(limit);
        };
      });
    },
    { scope: overlay },
  );

  return (
    <div
      ref={overlay}
      aria-hidden
      className="stock-fern page-grid fixed inset-0 z-50 content-end bg-sheet pb-16 text-ink loaded:hidden noscript:hidden"
    >
      <div className="col-span-full flex flex-col gap-4">
        <p className="type-label" data-line>
          {title}
        </p>
        <ol className="type-title flex flex-col">
          {phases.map((phase, index) => (
            <li key={phase} data-phase={phase} data-line className="opacity-30 data-done:opacity-100">
              {index + 1}. {steps[phase]}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
