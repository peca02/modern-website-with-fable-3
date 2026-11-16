// All scene timing lives here. Everything is a pure function of story position, time and pointer.

export type Key = readonly [at: number, value: number];

export type Shot = {
  /** Lens shift as a share of the viewport: positive x moves the subject right, positive y up. */
  shiftX: number;
  shiftY: number;
  distance: number;
  tiltX: number;
  tiltY: number;
  /** 0 shows the face, 1 shows the reverse. */
  turn: number;
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

// Wide screens: text takes one side, the sheet the other. Portrait: the sheet sits below the text.
const shiftWide: readonly Key[] = [
  [0, 0.2],
  [0.8, 0.2],
  [1.2, -0.2],
  [1.8, -0.2],
  [2.2, 0.2],
  [2.8, 0.2],
  [3.2, -0.2],
  [3.8, -0.2],
  [4.2, 0.18],
  [5, 0.18],
];
const shiftPortrait: readonly Key[] = [
  [0, -0.16],
  [5, -0.16],
];
const turn: readonly Key[] = [
  [0, 0],
  [1.9, 0],
  [2.15, 1],
  [3.9, 1],
  [4.15, 0],
  [5, 0],
];
const tilt: readonly Key[] = [
  [0, -0.9],
  [1, -1.1],
  [2, -0.7],
  [3, -1.2],
  [4, -0.8],
  [5, -0.6],
];

export function direct(story: number, time: number, pointerX: number, pointerY: number, wide: boolean): Shot {
  return {
    shiftX: wide ? sample(shiftWide, story) : 0,
    shiftY: wide ? 0 : sample(shiftPortrait, story),
    distance: wide ? 9 : 12,
    tiltX: sample(tilt, story) + pointerY * 0.08 + Math.sin(time * 0.4) * 0.02,
    tiltY: 0.5 + story * 0.35 + pointerX * 0.12,
    turn: sample(turn, story, hinge),
  };
}
