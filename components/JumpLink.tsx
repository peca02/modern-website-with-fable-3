"use client";

import type { MouseEvent, ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type JumpLinkProps = { href: `#${string}`; to: "start" | "end"; label?: string; children: ReactNode };

/** In-page link. While chapters are pinned an element's own position says little, so it scrolls to an end of the page. */
export function JumpLink({ href, to, label, children }: JumpLinkProps) {
  const jump = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!("pinned" in document.documentElement.dataset)) return;
    event.preventDefault();
    // Focus first: ScrollSmoother answers a focus change by scrolling to the element's own position.
    document.getElementById(href.slice(1))?.focus({ preventScroll: true });
    window.scrollTo(0, to === "start" ? 0 : ScrollTrigger.maxScroll(window));
  };

  return (
    <a
      href={href}
      aria-label={label}
      onClick={jump}
      className="type-label touch-target focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-backdrop-ink"
    >
      {children}
    </a>
  );
}
