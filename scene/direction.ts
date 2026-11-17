// All scene timing lives here. Everything is a pure function of story position, time, pointer and controls.

export type Key = readonly [at: number, value: number];

export type Pattern = "miura" | "vault" | "halves" | "dart";

export type Shot = {
  /** Lens shift as a share of the viewport: positive x moves the subject right, positive y up. */
  shiftX: number;
  shiftY: number;
  distance: number;
  tiltX: number;
  tiltY: number;
  /** Rotation in the plane of the sheet. */
  spin: number;
  /** 0 shows the face, 1 shows the reverse. */
  turn: number;
  /** Height of the sheet above the page. */
  lift: number;
  /** Which crease pattern the sheet carries. It only changes while the sheet is flat and edge-on. */
  pattern: Pattern;
  /** Driver of the current pattern, 0 flat to 1 fully folded. */
  fold: number;
  /** How visible the creases folded so far are. */
  memory: number;
  /** Creases of patterns folded earlier in the story, still faintly there. */
  ghostMiura: number;
  ghostVault: number;
  /** 1 lights the sheet from behind, so stacked layers read as steps of tone. */
  backlight: number;
  /** How far the dart has glided along its nose, in sheet units. */
  flight: number;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** A fold: fast start, hard stop, a small spring back. */
export const hinge = (t: number) => {
  const eased = 1 - Math.pow(1 - t, 4);
  return eased + Math.sin(t * Math.PI) * Math.pow(t, 3) * 0.06;
};

export function sample(keys: readonly Key[], at: number, ease: (t: number) => number = smooth) {
  const first = keys[0];
  if (!first) return 0;
  if (at <= first[0]) return first[1];
  for (let index = 1; index < keys.length; index += 1) {
    const from = keys[index - 1];
    const to = keys[index];
    if (!from || !to) break;
    if (at <= to[0]) {
      const span = to[0] - from[0];
      const local = span > 0 ? (at - from[0]) / span : 1;
      return from[1] + (to[1] - from[1]) * ease(local);
    }
  }
  return keys[keys.length - 1]?.[1] ?? first[1];
}

type Track = { wide: readonly Key[]; portrait: readonly Key[] };

// The sheet changes sides while a chapter scrolls away (the last quarter), so it has arrived when the next pins.
// Wide screens: text takes one side, the sheet the other. Portrait: the sheet sits below the text.
const shiftX: Track = {
  wide: [
    [0, 0.21],
    [0.55, 0.21],
    [1, -0.2],
    [1.72, -0.2],
    [2, 0.2],
    [2.72, 0.2],
    [3, -0.2],
    [3.72, -0.2],
    [4, 0.18],
    [5, 0.18],
  ],
  portrait: [[0, 0]],
};
const shiftY: Track = {
  wide: [
    [0, -0.02],
    [5, -0.02],
  ],
  portrait: [
    [0, -0.24],
    [1.1, -0.2],
    [1.4, -0.15],
    [1.9, -0.15],
    [2.1, -0.3],
    [3.9, -0.3],
    [4.1, -0.24],
    [5, -0.24],
  ],
};
// The camera closes in while the sheet packs small, so the block stays a subject and not a speck.
const distance: Track = {
  wide: [
    [0, 9.6],
    [1.05, 9.8],
    [1.4, 9.2],
    [1.58, 4.4],
    [1.75, 4.4],
    [2, 9.6],
    [2.3, 8.6],
    [2.9, 8.6],
    [3.1, 9.6],
    [3.3, 8.6],
    [3.58, 7.2],
    [3.74, 7.2],
    [3.9, 9.6],
    [5, 9.6],
  ],
  portrait: [
    [0, 19],
    [1.05, 19.5],
    [1.4, 18],
    [1.58, 8.5],
    [1.75, 8.5],
    [2, 19],
    [2.3, 20],
    [2.9, 20],
    [3.1, 21],
    [3.3, 19],
    [3.58, 14],
    [3.74, 14],
    [3.9, 19],
    [5, 19],
  ],
};
const tiltX: readonly Key[] = [
  [0, -0.42],
  [1, -0.55],
  [1.58, -0.7],
  [1.75, -0.7],
  [1.96, -0.5],
  [2.25, -0.75],
  [2.7, -0.98],
  [2.9, -0.98],
  [3.1, -0.42],
  [4.15, -0.42],
  [4.62, -0.5],
  [4.84, -1.12],
  [5, -1.12],
];
const tiltY: readonly Key[] = [
  [0, -0.22],
  [1, 0.26],
  [1.58, 0.85],
  [1.75, 0.85],
  [1.96, -0.2],
  [2.25, 0.15],
  [2.7, 0.3],
  [2.9, 0.3],
  [3.1, -0.22],
  [3.9, -0.22],
  [4.2, 0.15],
  [4.84, 0.3],
  [5, 0.3],
];
const spin: readonly Key[] = [
  [0, 0.2],
  [1, -0.16],
  [1.58, -0.35],
  [1.75, -0.35],
  [1.96, 0.1],
  [2.25, 0.05],
  [2.7, 0.08],
  [2.9, 0.08],
  [3.1, 0.14],
  [4.62, 0.12],
  [4.84, 0.5],
  [5, 0.56],
];
const lift: readonly Key[] = [
  [0, 0.95],
  [1, 0.95],
  [1.58, 0.7],
  [1.75, 0.7],
  [2, 0.95],
  [2.25, 1.5],
  [2.9, 1.5],
  [3.1, 0.95],
  [4.5, 0.95],
  [4.74, 1.5],
  [5, 1.5],
];
const turn: readonly Key[] = [
  [0, 0],
  [2, 0],
  [2.24, 1],
  [3.9, 1],
  [4.15, 0],
  [5, 0],
];
// Stepped: a steep fold, then a plateau. Chapter 1 relaxes into a shallow relief, chapter 2 packs in two
// folds, holds, and opens again.
const fold: readonly Key[] = [
  [0, 0.1],
  [0.6, 0.2],
  [1.1, 0.2],
  [1.28, 0.62],
  [1.4, 0.62],
  [1.58, 1],
  [1.75, 1],
  [1.9, 0.26],
  [1.98, 0],
];
// Chapter 3: the turned sheet stands up into a vault in two folds, holds, and lies down again.
const arch: readonly Key[] = [
  [2.26, 0],
  [2.4, 0.5],
  [2.5, 0.5],
  [2.66, 1],
  [2.9, 1],
  [3.04, 0],
];
// Chapter 4: in half, in quarters, hold against the light, open again.
const halves: readonly Key[] = [
  [3.14, 0],
  [3.3, 1],
  [3.42, 1],
  [3.58, 2],
  [3.74, 2],
  [3.9, 0],
];
const backlight: readonly Key[] = [
  [3.08, 0],
  [3.24, 1],
  [3.78, 1],
  [3.92, 0],
];
// Chapter 5: five staccato folds, then the dart leaves.
const dart: readonly Key[] = [
  [4.2, 0],
  [4.3, 1],
  [4.36, 1],
  [4.46, 2],
  [4.52, 2],
  [4.62, 3],
  [4.66, 3],
  [4.74, 4],
  [4.76, 4],
  [4.84, 5],
];
const flight: readonly Key[] = [
  [4.88, 0],
  [5, 1.4],
];
// The pack control only acts inside chapter 2.
const packWindow: readonly Key[] = [
  [0.9, 0],
  [1.1, 1],
  [1.88, 1],
  [1.98, 0],
];

/** The contact link throws the dart: out along its nose, a beat of empty page, back in from behind. */
function thrown(seconds: number) {
  if (seconds < 0 || seconds >= 3.4) return 0;
  if (seconds < 1.1) return 16 * Math.pow(seconds / 1.1, 2);
  if (seconds < 1.7) return 16;
  return -16 * Math.pow(1 - (seconds - 1.7) / 1.7, 3);
}

const pick = (track: Track, wide: boolean) => (wide ? track.wide : track.portrait);

export function direct(
  story: number,
  time: number,
  pointerX: number,
  pointerY: number,
  wide: boolean,
  pack = 0,
  sinceThrow = -1,
): Shot {
  const scrolled = sample(fold, story, hinge);
  const packed = pack * sample(packWindow, story);
  const turned = sample(turn, story, hinge);
  // Patterns change only where the tracks above leave the sheet flat.
  const pattern: Pattern =
    story >= 3.95 ? "dart" : story >= 3.06 ? "halves" : story >= 2 && turned >= 0.5 ? "vault" : "miura";
  const folds: Record<Pattern, number> = {
    miura: scrolled + (1 - scrolled) * packed,
    vault: sample(arch, story, hinge),
    halves: sample(halves, story, hinge),
    dart: sample(dart, story, hinge),
  };
  return {
    shiftX: sample(pick(shiftX, wide), story),
    shiftY: sample(pick(shiftY, wide), story),
    distance: sample(pick(distance, wide), story),
    tiltX: sample(tiltX, story) + pointerY * 0.08 + Math.sin(time * 0.4) * 0.015,
    tiltY: sample(tiltY, story) + pointerX * 0.12,
    spin: sample(spin, story),
    turn: turned,
    pattern,
    lift: sample(lift, story),
    fold: folds[pattern],
    memory: 1,
    ghostMiura: pattern === "miura" ? 0 : 1,
    ghostVault: pattern === "halves" || pattern === "dart" ? 1 : 0,
    backlight: sample(backlight, story),
    flight: sample(flight, story) + (story >= 4.84 ? thrown(sinceThrow) : 0),
  };
}
