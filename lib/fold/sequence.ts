import { noCrease, type FoldModel } from "@/lib/fold/types";

/**
 * One simple fold: everything left of the directed line `from` -> `to` rotates about it. The line is
 * given in the folded-flat coordinates the sheet has when the step starts, centered on the sheet.
 */
export type SimpleFold = {
  from: readonly [number, number];
  to: readonly [number, number];
  /** 1 folds toward the front of the stack (valley), -1 away from it (mountain). */
  sign: 1 | -1;
  /** Radians. Only the last folds of a sequence may stop short of a half turn. */
  angle?: number;
  /** Limits the fold to faces whose center on the flat sheet passes this test. */
  only?: (x: number, y: number) => boolean;
};

export type SequenceSpec = {
  width: number;
  height: number;
  /** Steps run strictly one after another; the folds inside one step move together. */
  steps: readonly (readonly SimpleFold[])[];
};

type Matrix = readonly [a: number, b: number, c: number, d: number, tx: number, ty: number];
type Tag = { valley: boolean } | null;
type Line = {
  px: number;
  py: number;
  dx: number;
  dy: number;
  nx: number;
  ny: number;
  angle: number;
  /** A half turn: the moving faces land flat on the rest. */
  closes: boolean;
};
type Moment = {
  matrix: Matrix;
  layer: number;
  layerAfter: number;
  line: Line | null;
  /** An earlier fold that stopped short of flat and stays at its angle. */
  held: Line | null;
};
type Face = {
  /** Polygon on the flat sheet, counter-clockwise. `tags[i]` describes the edge leaving vertex i. */
  points: number[];
  tags: Tag[];
  matrix: Matrix;
  layer: number;
  history: Moment[];
  start: { matrix: Matrix; layer: number; held: Line | null };
  moving: Line | null;
  held: Line | null;
  layerAfter: number;
};

const layerGap = 0.006;
const snap = 1e-9;
const identity: Matrix = [1, 0, 0, 1, 0, 0];

const mapX = (m: Matrix, x: number, y: number) => m[0] * x + m[1] * y + m[4];
const mapY = (m: Matrix, x: number, y: number) => m[2] * x + m[3] * y + m[5];
const flipped = (m: Matrix) => m[0] * m[3] - m[1] * m[2] < 0;

function lineOf(fold: SimpleFold): Line {
  const length = Math.hypot(fold.to[0] - fold.from[0], fold.to[1] - fold.from[1]);
  const dx = (fold.to[0] - fold.from[0]) / length;
  const dy = (fold.to[1] - fold.from[1]) / length;
  const angle = (fold.angle ?? Math.PI) * fold.sign;
  const closes = Math.abs(Math.abs(angle) - Math.PI) < 0.01;
  return { px: fold.from[0], py: fold.from[1], dx, dy, nx: -dy, ny: dx, angle, closes };
}

/** The isometry that mirrors across the line, applied after `m`. */
function mirror(m: Matrix, line: Line): Matrix {
  const { px, py, nx, ny } = line;
  // R(q) = q - 2 ((q - p) . n) n
  const r0 = 1 - 2 * nx * nx;
  const r1 = -2 * nx * ny;
  const r3 = 1 - 2 * ny * ny;
  const offset = 2 * (px * nx + py * ny);
  return [
    r0 * m[0] + r1 * m[2],
    r0 * m[1] + r1 * m[3],
    r1 * m[0] + r3 * m[2],
    r1 * m[1] + r3 * m[3],
    r0 * m[4] + r1 * m[5] + offset * nx,
    r1 * m[4] + r3 * m[5] + offset * ny,
  ];
}

function area(points: readonly number[]) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 2) {
    const j = (i + 2) % points.length;
    sum += (points[i] ?? 0) * (points[j + 1] ?? 0) - (points[j] ?? 0) * (points[i + 1] ?? 0);
  }
  return sum / 2;
}

function center(points: readonly number[]) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < points.length; i += 2) {
    x += points[i] ?? 0;
    y += points[i + 1] ?? 0;
  }
  return [(x * 2) / points.length, (y * 2) / points.length] as const;
}

/** Cuts a face along the line. Returns the part left of the line and the part right of it. */
function cut(face: Face, line: Line) {
  const count = face.points.length / 2;
  const side: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = face.points[i * 2] ?? 0;
    const y = face.points[i * 2 + 1] ?? 0;
    const qx = mapX(face.matrix, x, y) - line.px;
    const qy = mapY(face.matrix, x, y) - line.py;
    const distance = qx * line.nx + qy * line.ny;
    side.push(Math.abs(distance) < snap ? 0 : distance);
  }
  const crease: Tag = { valley: line.angle > 0 !== flipped(face.matrix) };
  const left = { points: [] as number[], tags: [] as Tag[] };
  const right = { points: [] as number[], tags: [] as Tag[] };
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    const here = side[i] ?? 0;
    const there = side[next] ?? 0;
    const x = face.points[i * 2] ?? 0;
    const y = face.points[i * 2 + 1] ?? 0;
    const tag = face.tags[i] ?? null;
    if (here >= 0) {
      left.points.push(x, y);
      left.tags.push(here === 0 && there < 0 ? crease : tag);
    }
    if (here <= 0) {
      right.points.push(x, y);
      right.tags.push(here === 0 && there > 0 ? crease : tag);
    }
    if (here * there < 0) {
      const share = here / (here - there);
      const ix = x + ((face.points[next * 2] ?? 0) - x) * share;
      const iy = y + ((face.points[next * 2 + 1] ?? 0) - y) * share;
      left.points.push(ix, iy);
      left.tags.push(here > 0 ? crease : tag);
      right.points.push(ix, iy);
      right.tags.push(here < 0 ? crease : tag);
    }
  }
  const real = (part: { points: number[] }) => part.points.length >= 6 && Math.abs(area(part.points)) > 1e-7;
  return { left: real(left) ? left : null, right: real(right) ? right : null };
}

function inside(points: readonly number[], matrix: Matrix, x: number, y: number) {
  const turn = flipped(matrix) ? -1 : 1;
  for (let i = 0; i < points.length; i += 2) {
    const j = (i + 2) % points.length;
    const ax = mapX(matrix, points[i] ?? 0, points[i + 1] ?? 0);
    const ay = mapY(matrix, points[i] ?? 0, points[i + 1] ?? 0);
    const bx = mapX(matrix, points[j] ?? 0, points[j + 1] ?? 0);
    const by = mapY(matrix, points[j] ?? 0, points[j + 1] ?? 0);
    if (((bx - ax) * (y - ay) - (by - ay) * (x - ax)) * turn < -1e-6) return false;
  }
  return true;
}

/** Halves and quarters, folded away from the front. */
export const halvesSpec: SequenceSpec = {
  width: 3.4,
  height: 2.4,
  steps: [
    [{ from: [0, 1.2], to: [0, -1.2], sign: -1 }],
    [{ from: [-1.7, 0], to: [0, 0], sign: -1 }],
  ],
};

const tan225 = Math.tan(Math.PI / 8);
const keel = 0.3;
const wing = (82 * Math.PI) / 180;

/** The paper dart, nose toward +x: corners in, edges in, in half, then one wing each way. */
export const dartSpec: SequenceSpec = {
  width: 3.4,
  height: 2.4,
  steps: [
    [
      { from: [0.5, 1.2], to: [1.7, 0], sign: 1 },
      { from: [1.7, 0], to: [0.5, -1.2], sign: 1 },
    ],
    [
      { from: [1.7 - 1.2 / tan225, 1.2], to: [1.7, 0], sign: 1 },
      { from: [1.7, 0], to: [1.7 - 1.2 / tan225, -1.2], sign: 1 },
    ],
    [{ from: [-1.7, 0], to: [1.7, 0], sign: 1 }],
    [{ from: [1.7, -keel], to: [-1.7, -keel], sign: 1, angle: wing, only: (_x, y) => y > 0 }],
    [{ from: [1.7, -keel], to: [-1.7, -keel], sign: -1, angle: wing, only: (_x, y) => y < 0 }],
  ],
};

export function createSequence(spec: SequenceSpec): FoldModel {
  const halfX = spec.width / 2;
  const halfY = spec.height / 2;
  const span = Math.max(spec.width, spec.height);
  const stepCount = spec.steps.length;

  let faces: Face[] = [
    {
      points: [-halfX, -halfY, halfX, -halfY, halfX, halfY, -halfX, halfY],
      tags: [null, null, null, null],
      matrix: identity,
      layer: 0,
      history: [],
      start: { matrix: identity, layer: 0, held: null },
      moving: null,
      held: null,
      layerAfter: 0,
    },
  ];

  // Play the sequence once in folded-flat coordinates: split faces along each line and note who moves.
  for (const step of spec.steps) {
    for (const face of faces) {
      face.start = { matrix: face.matrix, layer: face.layer, held: face.held };
      face.moving = null;
      face.layerAfter = face.layer;
    }
    for (const fold of step) {
      const line = lineOf(fold);
      const next: Face[] = [];
      const movers: Face[] = [];
      for (const face of faces) {
        const [cx, cy] = center(face.points);
        if (face.moving || (fold.only && !fold.only(cx, cy))) {
          next.push(face);
          continue;
        }
        const parts = cut(face, line);
        if (parts.right) next.push({ ...face, ...parts.right, history: [...face.history] });
        if (parts.left) {
          const mover = { ...face, ...parts.left, history: [...face.history], moving: line };
          next.push(mover);
          movers.push(mover);
        }
      }
      const all = next.map((face) => face.layerAfter);
      const moved = movers.map((face) => face.layer);
      const top = Math.max(...all);
      const bottom = Math.min(...all);
      for (const mover of movers) {
        if (!line.closes) {
          mover.held = line;
          continue;
        }
        mover.matrix = mirror(mover.matrix, line);
        // The moving stack lands on the far side of everything else, in reverse order.
        mover.layer =
          line.angle > 0 ? top + 1 + Math.max(...moved) - mover.layer : bottom - 1 - (mover.layer - Math.min(...moved));
        mover.layerAfter = mover.layer;
      }
      faces = next;
    }
    for (const face of faces) {
      face.history.push({ ...face.start, layerAfter: face.layerAfter, line: face.moving });
    }
  }

  // How many other layers lie over each face's center, before every step and after the last one.
  const stacks = faces.map((face) => {
    const [cx, cy] = center(face.points);
    const counts: number[] = [];
    for (let state = 0; state <= stepCount; state += 1) {
      const matrixAt = (other: Face) => (state < stepCount ? other.history[state]?.matrix : other.matrix) ?? identity;
      const own = matrixAt(face);
      const x = mapX(own, cx, cy);
      const y = mapY(own, cx, cy);
      let count = 0;
      for (const other of faces) {
        if (other !== face && inside(other.points, matrixAt(other), x, y)) count += 1;
      }
      // A fold that stops short of flat does not stack anything new.
      const moment = state > 0 ? face.history[state - 1] : undefined;
      const open = moment?.line && !moment.line.closes;
      counts.push(open ? (counts[state - 1] ?? count) : count);
    }
    return counts;
  });

  const offsets: number[] = [];
  let corners = 0;
  for (const face of faces) {
    offsets.push(corners);
    corners += (face.points.length / 2 - 2) * 3;
  }

  const positions = new Float32Array(corners * 3);
  const normals = new Float32Array(corners * 3);
  const flat = new Float32Array(corners * 2);
  const crease = new Float32Array(corners * 4).fill(noCrease);
  const valley = new Float32Array(corners * 4);
  const layers = new Float32Array(corners);
  const extent = { x: spec.width, y: spec.height, z: 0 };

  /** Polygon vertex behind each corner of a face's fan. */
  const fan = (face: Face) => {
    const order: number[] = [];
    for (let i = 1; i < face.points.length / 2 - 1; i += 1) order.push(0, i, i + 1);
    return order;
  };

  faces.forEach((face, index) => {
    const count = face.points.length / 2;
    const creased = face.tags.map((tag, edge) => ({ tag, edge })).filter((entry) => entry.tag);
    fan(face).forEach((vertex, slot) => {
      const corner = (offsets[index] ?? 0) + slot;
      const x = face.points[vertex * 2] ?? 0;
      const y = face.points[vertex * 2 + 1] ?? 0;
      flat[corner * 2] = (x + halfX) / span;
      flat[corner * 2 + 1] = (y + halfY) / span;
      creased.slice(0, 4).forEach(({ tag, edge }, channel) => {
        const next = (edge + 1) % count;
        const ax = face.points[edge * 2] ?? 0;
        const ay = face.points[edge * 2 + 1] ?? 0;
        const dx = (face.points[next * 2] ?? 0) - ax;
        const dy = (face.points[next * 2 + 1] ?? 0) - ay;
        crease[corner * 4 + channel] = Math.abs((x - ax) * dy - (y - ay) * dx) / Math.hypot(dx, dy);
        valley[corner * 4 + channel] = tag?.valley ? 1 : 0;
      });
    });
  });

  const scratch = new Float64Array(64 * 3);

  const pose = (drivers: readonly number[]) => {
    const progress = Math.min(stepCount, Math.max(0, drivers[0] ?? 0));
    const step = Math.min(stepCount - 1, Math.floor(progress));
    const local = progress - step;

    const low = [Infinity, Infinity, Infinity];
    const high = [-Infinity, -Infinity, -Infinity];

    faces.forEach((face, index) => {
      const moment = face.history[step];
      if (!moment) return;
      const { matrix } = moment;
      const line = moment.line ?? moment.held;
      const front = flipped(matrix) ? -1 : 1;
      const angle = line ? line.angle * (moment.line ? local : 1) : 0;
      const turned = Math.abs(angle) / Math.PI;
      // The stack's up direction travels with a moving face and arrives pointing down.
      const height =
        line && line.closes
          ? layerGap * (moment.layer + (-moment.layerAfter - moment.layer) * turned)
          : layerGap * moment.layer;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const upX = line ? -line.nx * sin : 0;
      const upY = line ? -line.ny * sin : 0;
      const upZ = line ? cos : 1;

      const count = face.points.length / 2;
      for (let vertex = 0; vertex < count; vertex += 1) {
        const fx = face.points[vertex * 2] ?? 0;
        const fy = face.points[vertex * 2 + 1] ?? 0;
        let x = mapX(matrix, fx, fy);
        let y = mapY(matrix, fx, fy);
        let z = 0;
        if (line) {
          const along = (x - line.px) * line.dx + (y - line.py) * line.dy;
          const out = (x - line.px) * line.nx + (y - line.py) * line.ny;
          x = line.px + line.dx * along + line.nx * out * cos;
          y = line.py + line.dy * along + line.ny * out * cos;
          z = out * sin;
        }
        scratch[vertex * 3] = x + upX * height;
        scratch[vertex * 3 + 1] = y + upY * height;
        scratch[vertex * 3 + 2] = z + upZ * height;
      }

      const from = stacks[index]?.[step] ?? 0;
      const to = stacks[index]?.[step + 1] ?? from;
      const stacked = from + (to - from) * local;
      fan(face).forEach((vertex, slot) => {
        const corner = (offsets[index] ?? 0) + slot;
        for (let axis = 0; axis < 3; axis += 1) {
          const value = scratch[vertex * 3 + axis] ?? 0;
          positions[corner * 3 + axis] = value;
          if (value < (low[axis] ?? 0)) low[axis] = value;
          if (value > (high[axis] ?? 0)) high[axis] = value;
        }
        normals[corner * 3] = upX * front;
        normals[corner * 3 + 1] = upY * front;
        normals[corner * 3 + 2] = upZ * front;
        layers[corner] = stacked;
      });
    });

    extent.x = (high[0] ?? 0) - (low[0] ?? 0);
    extent.y = (high[1] ?? 0) - (low[1] ?? 0);
    extent.z = (high[2] ?? 0) - (low[2] ?? 0);
    for (let at = 0; at < positions.length; at += 1) {
      const axis = at % 3;
      positions[at] = (positions[at] ?? 0) - ((high[axis] ?? 0) + (low[axis] ?? 0)) / 2;
    }
  };

  pose([0]);

  return { mesh: { corners, positions, normals, flat, crease, valley, layers, anchors: {} }, extent, pose };
}
