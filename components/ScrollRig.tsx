"use client";

import { useRef, type ReactNode } from "react";
import { chapters, pageTurnSpan, tagsRoom } from "@/lib/beats";
import { gsap, media, ScrollSmoother, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stocks } from "@/lib/palette";
import { store } from "@/lib/store";

const storyKey = "story";

const pages = chapters.map((chapter) => stocks[chapter.stock]);

function stockAt(index: number) {
  return pages[Math.min(pages.length - 1, Math.max(0, index))] ?? stocks.fern;
}

const polygon = (points: readonly (readonly [number, number])[]) =>
  `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(", ")})`;

/**
 * The page turn as two shapes in shares of the viewport: the part of the next page already showing, and the
 * flap, which is that part mirrored over the fold line. The line runs from the bottom right corner to the top left.
 */
function turnShapes(turn: number): [page: string, flap: string] {
  const k = 2 * (1 - turn);
  if (k >= 1) {
    const c = k - 1;
    return [
      polygon([[1, c], [1, c], [1, 1], [c, 1], [c, 1]]),
      polygon([[1, c], [1, c], [c, c], [c, 1], [c, 1]]),
    ];
  }
  return [
    polygon([[k, 0], [1, 0], [1, 1], [0, 1], [0, k]]),
    polygon([[k, 0], [k, k - 1], [k - 1, k - 1], [k - 1, k], [0, k]]),
  ];
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

      // Pins exist only when motion is allowed; `pinned:` styles turn each chapter's stage into one screen.
      let smoother: ScrollSmoother | null = null;
      if (!reduced) {
        root.dataset.pinned = "";
        smoother = ScrollSmoother.create({
          wrapper: wrapper.current,
          content: content.current,
          smooth: 1.1,
          smoothTouch: false,
          effects: false,
          // Targets of in-page links (tabindex -1) are focused by JumpLink, which scrolls on its own;
          // the smoother's scroll-to-focus would send the page to the element's place before its pin.
          onFocusIn: (_self: ScrollSmoother, event: Event) =>
            !(event.target instanceof HTMLElement && event.target.tabIndex === -1),
        });
      }

      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      const progress = sections.map(() => 0);
      const spans = sections.map((section, index) => {
        const stage = section.querySelector("[data-stage]");
        const length = chapters[index]?.length ?? 1;
        if (!reduced && stage) {
          ScrollTrigger.create({
            trigger: stage,
            pin: true,
            // Pins are measured before the chapters that contain them, so a chapter's length includes its pin.
            refreshPriority: 1,
            start: "top top",
            end: () => `+=${(length - 1) * window.innerHeight}`,
          });
        }
        const last = index === sections.length - 1;
        return ScrollTrigger.create({
          trigger: section,
          // Under reduced motion a chapter owns the story while it covers the middle of the screen.
          start: reduced ? "top center" : "top top",
          end: reduced ? "bottom center" : last ? "bottom bottom" : "bottom top",
          onUpdate: (self) => {
            progress[index] = self.progress;
          },
          onRefresh: (self) => {
            progress[index] = self.progress;
          },
        });
      });

      // The browser would restore the scroll position before the pins exist, so the site does it itself.
      let position = 0;
      const remember = () => sessionStorage.setItem(storyKey, position.toFixed(4));
      ScrollTrigger.clearScrollMemory("manual");
      const [entry] = performance.getEntriesByType("navigation");
      const saved = Number(sessionStorage.getItem(storyKey));
      ScrollTrigger.refresh();
      if (entry instanceof PerformanceNavigationTiming && entry.type === "reload" && saved > 0) {
        const span = spans[Math.min(spans.length - 1, Math.floor(saved))];
        if (span) {
          const top = span.start + (span.end - span.start) * (saved - Math.floor(saved));
          if (smoother) smoother.scrollTop(top);
          else window.scrollTo(0, top);
        }
      }
      window.addEventListener("pagehide", remember);
      ScrollTrigger.addEventListener("scrollEnd", remember);

      let painted = "";
      let lastScroll = window.scrollY;
      const tick = (_time: number, deltaTime: number) => {
        let story = 0;
        progress.forEach((value, index) => {
          if (value > 0) story = Math.max(story, index + value);
        });
        position = story;
        const index = Math.min(pages.length - 1, Math.floor(story));
        // Reduced motion: no scroll-driven folding, each chapter shows the pose it holds.
        store.story = reduced ? index + (chapters[index]?.hold ?? 0) : story;

        const scroll = window.scrollY;
        const seconds = Math.max(0.001, deltaTime / 1000);
        const target = (scroll - lastScroll) / seconds / Math.max(1, window.innerHeight);
        lastScroll = scroll;
        store.velocity += (target - store.velocity) * 0.15;

        // The last page has no page after it to turn to.
        const turn =
          reduced || index >= chapters.length - 1
            ? 0
            : gsap.utils.clamp(0, 1, (story - index - (1 - pageTurnSpan)) / pageTurnSpan);
        const key = `${index}:${turn.toFixed(3)}`;
        if (key !== painted) {
          painted = key;
          const from = stockAt(index);
          const to = stockAt(index + 1);
          const [page, flap] = turnShapes(turn);
          root.style.setProperty("--backdrop", from.page);
          root.style.setProperty("--backdrop-ink", turn > 0.5 ? to.ink : from.ink);
          root.style.setProperty("--turn", to.page);
          root.style.setProperty("--turn-ink", to.ink);
          root.style.setProperty("--turn-page", page);
          root.style.setProperty("--turn-flap", flap);
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pagehide", remember);
        ScrollTrigger.removeEventListener("scrollEnd", remember);
        delete root.dataset.pinned;
        root.style.removeProperty("--backdrop");
        root.style.removeProperty("--backdrop-ink");
        for (const name of ["--turn", "--turn-ink", "--turn-page", "--turn-flap"]) root.style.removeProperty(name);
      };
    });

    const measure = () => {
      const { innerWidth: width, innerHeight: height } = window;
      store.viewport.width = width;
      store.viewport.height = height;
      store.viewport.wide = width / height >= 1.25 && width >= 768;
      // The copy's own box ignores the hinges' transforms on its lines.
      store.viewport.copy = [...document.querySelectorAll("[data-stage]")].map((stage) => {
        const copy = stage.querySelector("[data-copy]");
        if (!copy || stage.clientHeight === 0) return 0;
        return (copy.getBoundingClientRect().bottom - stage.getBoundingClientRect().top) / stage.clientHeight;
      });
      // The vault's facts float as tags only over a live scene with room for them: a pinned screen, and on
      // portrait screens enough of it left below the copy. Otherwise they are a static row of paper tags.
      const standUp = chapters.findIndex((chapter) => chapter.id === "stand-up");
      const room = 1 - (store.viewport.copy[standUp] ?? 1);
      const tags =
        root.dataset.scene === "live" && "pinned" in root.dataset && (store.viewport.wide || room >= tagsRoom);
      const facts = tags ? "tags" : "static";
      if (root.dataset.facts !== facts) {
        root.dataset.facts = facts;
        // Showing the static row changes the chapter's height when nothing is pinned.
        ScrollTrigger.refresh();
      }
    };
    const point = (event: PointerEvent) => {
      store.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    };
    measure();
    void document.fonts.ready.then(measure);
    // Whether the scene is live decides how chapter 3 shows its facts.
    const scene = new MutationObserver(measure);
    scene.observe(document.documentElement, { attributeFilter: ["data-scene"] });
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", point, { passive: true });

    return () => {
      scene.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
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
