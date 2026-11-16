export type QualityTier = {
  maxDpr: number;
  antialias: boolean;
  /** Shadow map size in pixels; 0 turns the shadow map off in favor of fold-angle shading. */
  shadowMap: number;
  flecks: number;
};

export const tiers: readonly QualityTier[] = [
  { maxDpr: 1, antialias: false, shadowMap: 0, flecks: 0 },
  { maxDpr: 1.5, antialias: true, shadowMap: 0, flecks: 0 },
  { maxDpr: 1.75, antialias: true, shadowMap: 1024, flecks: 120 },
  { maxDpr: 2, antialias: true, shadowMap: 2048, flecks: 240 },
];

export const lowestTier = 0;
export const highestTier = tiers.length - 1;

export function tierAt(index: number): QualityTier {
  const clamped = Math.min(highestTier, Math.max(lowestTier, Math.round(index)));
  return tiers[clamped] ?? { maxDpr: 1, antialias: false, shadowMap: 0, flecks: 0 };
}

function readDeviceMemory() {
  if ("deviceMemory" in navigator && typeof navigator.deviceMemory === "number") {
    return navigator.deviceMemory;
  }
  return 4;
}

export function pickInitialTier(): number {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = readDeviceMemory();
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;

  if (cores <= 2 || memory <= 2) return 0;
  if (coarse || small) return cores >= 8 && memory >= 6 ? 2 : 1;
  if (cores >= 8 && memory >= 8) return 3;
  return 2;
}
