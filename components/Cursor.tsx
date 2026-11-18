"use client";

import { useRef } from "react";
import { durations, eases, gsap, media, useGSAP } from "@/lib/gsap";

const interactive = "a, button, input, label, summary";

/**
 * The dog-ear: a small square with a folded corner that trails the pointer and unfolds over anything
 * interactive. It lives on its own small fixed layer and never replaces the native cursor.
 */
export function Cursor() {
  const ear = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ fine: "(pointer: fine)", reduced: media.reduced }, (context) => {
      const holder = ear.current;
      const flap = holder?.firstElementChild;
      if (!context.conditions?.fine || !holder || !(flap instanceof HTMLElement)) return;
      const reduced = Boolean(context.conditions.reduced);

      const follow = { duration: reduced ? 0 : durations.snap, ease: eases.crease };
      const toX = gsap.quickTo(holder, "x", follow);
      const toY = gsap.quickTo(holder, "y", follow);
      // The flap turns about the diagonal crease; at half way it shows its other side.
      const state = { open: 0 };
      const unfold = gsap.to(state, {
        open: 1,
        duration: reduced ? 0 : durations.snap,
        ease: eases.crease,
        paused: true,
        onUpdate: () => {
          flap.style.transform = `rotate3d(1, -1, 0, ${(state.open * 180).toFixed(1)}deg)`;
          holder.toggleAttribute("data-open", state.open > 0.5);
        },
      });

      let shown = false;
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        toX(event.clientX);
        toY(event.clientY);
        if (!shown) {
          shown = true;
          gsap.set(holder, { x: event.clientX, y: event.clientY, autoAlpha: 1 });
        }
      };
      const over = (event: PointerEvent) => {
        const hit = event.target instanceof Element && event.target.closest(interactive) !== null;
        if (hit) unfold.play();
        else unfold.reverse();
      };
      const leave = () => {
        shown = false;
        gsap.set(holder, { autoAlpha: 0 });
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
  });

  return (
    <div
      ref={ear}
      aria-hidden
      className="group pointer-events-none invisible fixed top-0 left-0 z-40 mt-5 ml-4 hidden size-6 bg-backdrop-ink [clip-path:polygon(0_0,100%_0,100%_50%,50%_100%,0_100%)] data-open:[clip-path:none] fine:block"
    >
      <div className="absolute right-0 bottom-0 size-3 bg-sheet [clip-path:polygon(0_0,100%_0,0_100%)] group-data-open:bg-backdrop-ink" />
    </div>
  );
}
