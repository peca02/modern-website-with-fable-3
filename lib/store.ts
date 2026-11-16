import type { Store } from "@/types/store";

// The only bridge between the DOM layer and the scene. Mutated in place, never through React state.
export const store: Store = {
  story: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  viewport: { width: 1, height: 1, wide: true },
  controls: { pack: 0 },
  reduced: false,
  tier: 2,
  anchors: {},
};
