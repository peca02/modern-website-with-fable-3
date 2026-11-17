// All scene timing lives here. Everything is a pure function of story position, time, pointer and controls.

export type Key = readonly [at: number, value: number];

export type Pattern = "miura" | "vault";

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

// Wide screens: text takes one side, the sheet the other. Portrait: the sheet sits below the text.
const shiftX: Track = {
  wide: [
    [0, 0.21],
    [0.8, 0.21],
    [1.2, -0.2],
    [1.8, -0.2],
    [2.2, 0.2],
    [2.8, 0.2],
    [3.2, -0.2],
    [3.8, -0.2],
    [4.2, 0.18],
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
    [0, -0.2],
    [1.1, -0.2],
    [1.4, -0.15],
    [1.9, -0.15],
    [2.1, -0.2],
    [5, -0.2],
  ],
};
// The camera closes in while the sheet packs small, so the block stays a subject and not a speck.
const distance: Track = {
  wide: [
    [0, 9.6],
    [1.05, 9.8],
    [1.3, 7.2],
    [1.58, 4.4],
    [1.75, 4.4],
    [2, 9.6],
    [2.3, 8.6],
    [2.9, 8.6],
    [3.1, 9.6],
    [5, 9.6],
  ],
  portrait: [
    [0, 19],
    [1.05, 19.5],
    [1.3, 14],
    [1.58, 8.5],
    [1.75, 8.5],
    [2, 19],
    [2.3, 16.5],
    [2.9, 16.5],
    [3.1, 19],
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
  [3.1, -0.6],
  [4, -0.8],
  [5, -0.6],
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
  [3.1, -0.24],
  [5, -0.24],
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
  [3.1, 0.18],
  [5, 0.18],
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
  [5, 0.95],
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
// The pack control only acts inside chapter 2.
const packWindow: readonly Key[] = [
  [0.9, 0],
  [1.1, 1],
  [1.88, 1],
  [1.98, 0],
];

const pick = (track: Track, wide: boolean) => (wide ? track.wide : track.portrait);

export function direct(
  story: number,
  time: number,
  pointerX: number,
  pointerY: number,
  wide: boolean,
  pack = 0,
): Shot {
  const scrolled = sample(fold, story, hinge);
  const packed = pack * sample(packWindow, story);
  const turned = sample(turn, story, hinge);
  const pattern: Pattern = turned >= 0.5 ? "vault" : "miura";
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
    fold: pattern === "vault" ? sample(arch, story, hinge) : scrolled + (1 - scrolled) * packed,
    memory: 1,
  };
}
