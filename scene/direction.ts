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
  /** 1 paints the sheet in its pure token color, as the preloader does. */
  pure: number;
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

/**
 * The running maximum of a track up to `at`, scaled so the highest key is 1: how far the creases it drives
 * have ever been folded. Precomputed from the keys, so it depends on story position alone.
 */
function envelope(keys: readonly Key[], ease: (t: number) => number = smooth) {
  let highest = 0;
  const reached = keys.map(([at, value]): Key => {
    highest = Math.max(highest, value);
    return [at, highest];
  });
  return (at: number) => {
    let passed = 0;
    for (const [keyAt, value] of reached) {
      if (keyAt > at) break;
      passed = value;
    }
    return highest > 0 ? Math.min(1, Math.max(passed, sample(keys, at, ease)) / highest) : 0;
  };
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
const creased: Record<Pattern, (at: number) => number> = {
  miura: envelope(fold, hinge),
  vault: envelope(arch, hinge),
  halves: envelope(halves, hinge),
  dart: envelope(dart, hinge),
};
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

/** Seconds the sheet takes to recede from the preloader into its chapter. */
const introSeconds = 1.8;

/** 1 while the preloader is up (the sheet lies flat and fills the screen), 0 once it has receded. */
export function introAt(load: { at: number; intro: boolean }, reduced: boolean) {
  if (reduced) return 0;
  if (load.at === 0) return 1;
  if (!load.intro) return 0;
  const seconds = (performance.now() - load.at) / 1000;
  return seconds >= introSeconds ? 0 : 1 - hinge(seconds / introSeconds);
}

// Half the height of the view at distance 1 (the camera's field of view is 30 degrees).
const viewSlope = Math.tan((15 * Math.PI) / 180);

const pick = (track: Track, wide: boolean) => (wide ? track.wide : track.portrait);

// The portrait tracks are framed on a 375 x 812 phone, where each chapter's copy reaches this far down its
// screen. On a shorter screen the copy reaches lower: the strip below it is mapped onto the strip it had there,
// so the sheet moves down and shrinks instead of covering the copy (never below 0.65 of its size).
const copyFramed = [0.606, 0.589, 0.668, 0.759, 0.681];
const smallest = 0.65;
// The wide tracks are framed at 16:10 and wider. The view angle is vertical, so on a squarer wide screen the
// sheet would take more of the width and reach into the copy's half: the camera steps back instead.
const framedAspect = 1.6;

const copyKeys = (shares: readonly number[]) =>
  shares.flatMap((share, index): Key[] => [
    [index, share],
    [index + 0.75, share],
  ]);
const framedKeys = copyKeys(copyFramed);

function copyRoom(story: number, copy: readonly number[]) {
  if (copy.length === 0) return { from: 0, to: 0, scale: 1 };
  const from = sample(framedKeys, story);
  const to = Math.max(from, sample(copyKeys(copy), story));
  return { from, to, scale: Math.max(smallest, (1 - to) / (1 - from)) };
}

export function direct(
  story: number,
  time: number,
  pointerX: number,
  pointerY: number,
  wide: boolean,
  pack = 0,
  sinceThrow = -1,
  intro = 0,
  aspect = 1,
  copy: readonly number[] = [],
): Shot {
  // The intro pose: flat, square to the camera and close enough to cover the whole view.
  const enter = (value: number, target = 0) => value + (target - value) * intro;
  const raised = sample(lift, story);
  const cover = raised + 0.94 * Math.min(1.2 / viewSlope, 1.7 / (viewSlope * aspect));
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
  const room = wide ? { from: 0, to: 0, scale: Math.min(1, aspect / framedAspect) } : copyRoom(story, copy);
  // Screen y of the sheet's center from the top, moved from the framed strip into the free one.
  const center = wide
    ? 0.5 - sample(pick(shiftY, wide), story)
    : room.to + (0.5 - sample(pick(shiftY, wide), story) - room.from) * room.scale;
  return {
    shiftX: enter(sample(pick(shiftX, wide), story)),
    shiftY: enter(0.5 - center),
    distance: enter(sample(pick(distance, wide), story) / room.scale, cover),
    tiltX: enter(sample(tiltX, story) + pointerY * 0.08 + Math.sin(time * 0.4) * 0.015),
    tiltY: enter(sample(tiltY, story) + pointerX * 0.12),
    spin: enter(sample(spin, story)),
    turn: turned,
    pattern,
    lift: raised,
    fold: enter(folds[pattern]),
    memory: enter(creased[pattern](story)),
    ghostMiura: pattern === "miura" ? 0 : 1,
    ghostVault: pattern === "halves" || pattern === "dart" ? 1 : 0,
    backlight: sample(backlight, story),
    flight: sample(flight, story) + (story >= 4.84 ? thrown(sinceThrow) : 0),
    pure: Math.min(1, Math.max(0, intro * 2.5 - 1.5)),
  };
}
