import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

// Mobile address bars resize the viewport while scrolling; pins must not jump when they do.
ScrollTrigger.config({ ignoreMobileResize: true });

// The motion language: a fold starts fast, stops hard, and may spring back a little.
CustomEase.create("crease", "0.16, 1, 0.3, 1");
CustomEase.create("spring", "0.2, 1.4, 0.4, 1");

export const eases = { crease: "crease", spring: "spring", flat: "none" } as const;
export const durations = { snap: 0.25, fold: 0.6, turn: 1.1 } as const;

export const media = {
  full: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollSmoother, ScrollTrigger, SplitText, useGSAP };
