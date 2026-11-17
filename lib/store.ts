import type { Store } from "@/types/store";

// The only bridge between the DOM layer and the scene. Mutated in place, never through React state.
export const store: Store = {
  story: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  viewport: { width: 1, height: 1, wide: true, copy: [] },
  controls: { pack: 0, thrownAt: 0 },
  sheet: { live: false, fold: 0, x: 0, y: 0, z: 0, crease: 0, flight: 0 },
  load: { at: 0, intro: true },
  reduced: false,
  tier: 2,
  anchors: {},
};
