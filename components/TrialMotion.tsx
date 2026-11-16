"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollSmoother, SplitText, useGSAP } from "@/lib/gsap";

export function TrialMotion({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ScrollSmoother.create({ wrapper: wrapper.current, content: content.current, smooth: 1 });
      const split = SplitText.create("[data-split]", { type: "lines" });
      gsap.from(split.lines, { rotateX: -90, transformOrigin: "50% 0%", stagger: 0.1 });
      document.documentElement.dataset.motion = "ready";
    },
    { scope: wrapper },
  );

  return (
    <div ref={wrapper}>
      <div ref={content}>{children}</div>
    </div>
  );
}
