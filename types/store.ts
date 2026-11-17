export type Anchor = { x: number; y: number; visible: boolean };

export type Store = {
  /** Chapter index + local progress. The scene is a pure function of this, time, pointer and controls. */
  story: number;
  /** Scroll velocity in viewport heights per second, smoothed. */
  velocity: number;
  pointer: { x: number; y: number };
  viewport: { width: number; height: number; wide: boolean };
  /** `pack` is the range control, 0-1. `thrownAt` is the `performance.now()` of the last throw, 0 for never. */
  controls: { pack: number; thrownAt: number };
  /** Live Miura fold amount and bounding size, written by the scene. `live` stays false without a scene. */
  sheet: { live: boolean; fold: number; x: number; y: number; z: number };
  reduced: boolean;
  tier: number;
  /** Screen positions of 3D points, written by the scene, read by DOM followers. */
  anchors: Record<string, Anchor>;
};
