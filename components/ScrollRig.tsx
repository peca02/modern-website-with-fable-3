"use client";

import { useRef, type ReactNode } from "react";
import { chapters, pageTurnSpan } from "@/lib/beats";
import { gsap, media, ScrollSmoother, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stocks } from "@/lib/palette";
import { store } from "@/lib/store";

const pages = chapters.map((chapter) => stocks[chapter.stock]);

function stockAt(index: number) {
  return pages[Math.min(pages.length - 1, Math.max(0, index))] ?? stocks.fern;
}

export function ScrollRig({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add({ full: media.full, reduced: media.reduced }, (context) => {
      const reduced = Boolean(context.conditions?.reduced);
      store.reduced = reduced;
      root.dataset.motion = reduced ? "reduced" : "full";

      if (!reduced) {
        ScrollSmoother.create({
          wrapper: wrapper.current,
          content: content.current,
          smooth: 1.1,
          smoothTouch: false,
          effects: false,
        });
      }

      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      const progress = sections.map(() => 0);
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: index === sections.length - 1 ? "bottom bottom" : "bottom top",
          onUpdate: (self) => {
            progress[index] = self.progress;
          },
          onRefresh: (self) => {
            progress[index] = self.progress;
          },
        });
      });

      let painted = "";
      let lastScroll = window.scrollY;
      const tick = (_time: number, deltaTime: number) => {
        let story = 0;
        progress.forEach((value, index) => {
          if (value > 0) story = Math.max(story, index + value);
        });
        store.story = story;

        const scroll = window.scrollY;
        const seconds = Math.max(0.001, deltaTime / 1000);
        const target = (scroll - lastScroll) / seconds / Math.max(1, window.innerHeight);
        lastScroll = scroll;
        store.velocity += (target - store.velocity) * 0.15;

        const index = Math.min(pages.length - 1, Math.floor(story));
        const turn = gsap.utils.clamp(0, 1, (story - index - (1 - pageTurnSpan)) / pageTurnSpan);
        const key = `${index}:${turn.toFixed(3)}`;
        if (key !== painted) {
          painted = key;
          const from = stockAt(index);
          const to = stockAt(index + 1);
          root.style.setProperty("--backdrop", gsap.utils.interpolate(from.page, to.page, turn));
          root.style.setProperty("--backdrop-ink", gsap.utils.interpolate(from.ink, to.ink, turn));
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        root.style.removeProperty("--backdrop");
        root.style.removeProperty("--backdrop-ink");
      };
    });

    const measure = () => {
      const { innerWidth: width, innerHeight: height } = window;
      store.viewport.width = width;
      store.viewport.height = height;
      store.viewport.wide = width / height >= 1.25 && width >= 768;
    };
    const point = (event: PointerEvent) => {
      store.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", point, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", point);
    };
  });

  return (
    <div ref={wrapper} className="relative z-10">
      <div ref={content}>{children}</div>
    </div>
  );
}
