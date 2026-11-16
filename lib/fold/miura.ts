import { noCrease, type FoldModel } from "@/lib/fold/types";

export type MiuraSpec = {
  columns: number;
  rows: number;
  /** Size of the flat sheet. */
  width: number;
  height: number;
  /** Acute angle of the parallelogram, radians. */
  gamma: number;
  /** Fold angle at driver 1. Short of a right angle, so stacked panels never touch. */
  closed: number;
};

export const miuraSpec: MiuraSpec = {
  columns: 10,
  rows: 6,
  width: 3.4,
  height: 2.4,
  gamma: (72 * Math.PI) / 180,
  closed: (86.5 * Math.PI) / 180,
};

type Cell = { side: number; rise: number; trim: number };

function cellOf(spec: MiuraSpec): Cell {
  const side = spec.width / spec.columns / Math.sin(spec.gamma);
  const zigzag = side * Math.cos(spec.gamma);
  // The zigzag ends are trimmed along their creases so the flat sheet is a true rectangle.
  const rise = (spec.height + zigzag) / spec.rows;
  return { side, rise, trim: zigzag / rise };
}

/** Closed-form Miura-ori (Schenk and Guest): the four lengths of the unit cell at fold angle theta. */
function unit(spec: MiuraSpec, cell: Cell, theta: number) {
  const sinG = Math.sin(spec.gamma);
  const tanG = Math.tan(spec.gamma);
  const root = Math.sqrt(1 + Math.cos(theta) ** 2 * tanG ** 2);
  return {
    stepX: (cell.side * Math.cos(theta) * tanG) / root,
    shiftY: cell.side / root,
    stepY: cell.rise * Math.sqrt(1 - Math.sin(theta) ** 2 * sinG ** 2),
    lift: cell.rise * Math.sin(theta) * sinG,
  };
}

function writeGrid(spec: MiuraSpec, cell: Cell, theta: number, out: Float64Array) {
  const { columns, rows } = spec;
  const { stepX, shiftY, stepY, lift } = unit(spec, cell, theta);
  const stride = columns + 1;
  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i <= columns; i += 1) {
      const at = (j * stride + i) * 3;
      const odd = i % 2 === 1;
      // Border vertices slide along their crease: even ones up at the bottom, odd ones back at the top.
      const along = j === 0 && !odd ? cell.trim : j === rows && odd ? -cell.trim : 0;
      // Height change along the crease in the direction the vertex slides.
      const slope = (j % 2 === 0 ? 1 : -1) * (j === 0 ? 1 : -1);
      out[at] = i * stepX;
      out[at + 1] = j * stepY + (odd ? shiftY : 0) + along * stepY;
      out[at + 2] = (j % 2 === 1 ? lift : 0) + along * slope * lift;
    }
  }
}

function lineDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.abs((px - ax) * dy - (py - ay) * dx) / Math.hypot(dx, dy);
}

const quadCorners = [0, 1, 2, 0, 2, 3] as const;

export function createMiura(spec: MiuraSpec = miuraSpec): FoldModel {
  const { columns, rows } = spec;
  const cell = cellOf(spec);
  const stride = columns + 1;
  const grid = new Float64Array(stride * (rows + 1) * 3);
  const corners = columns * rows * 6;

  const positions = new Float32Array(corners * 3);
  const normals = new Float32Array(corners * 3);
  const flat = new Float32Array(corners * 2);
  const crease = new Float32Array(corners * 4);
  const valley = new Float32Array(corners * 4);
  const layers = new Float32Array(corners);
  const extent = { x: spec.width, y: spec.height, z: 0 };

  // Grid indices of a quad's corners, counter-clockwise from the front: 00, 10, 11, 01.
  const quad = (i: number, j: number) =>
    [j * stride + i, j * stride + i + 1, (j + 1) * stride + i + 1, (j + 1) * stride + i] as const;

  const centroid = (i: number, j: number, axis: number) => {
    let sum = 0;
    for (const vertex of quad(i, j)) sum += grid[vertex * 3 + axis] ?? 0;
    return sum / 4;
  };

  const normalOf = (i: number, j: number) => {
    const [a, b, , d] = quad(i, j);
    const ux = (grid[b * 3] ?? 0) - (grid[a * 3] ?? 0);
    const uy = (grid[b * 3 + 1] ?? 0) - (grid[a * 3 + 1] ?? 0);
    const uz = (grid[b * 3 + 2] ?? 0) - (grid[a * 3 + 2] ?? 0);
    const vx = (grid[d * 3] ?? 0) - (grid[a * 3] ?? 0);
    const vy = (grid[d * 3 + 1] ?? 0) - (grid[a * 3 + 1] ?? 0);
    const vz = (grid[d * 3 + 2] ?? 0) - (grid[a * 3 + 2] ?? 0);
    const x = uy * vz - uz * vy;
    const y = uz * vx - ux * vz;
    const z = ux * vy - uy * vx;
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length] as const;
  };

  // A crease is a valley when the neighbor rises toward the front of this face. Read from a half-folded pose.
  writeGrid(spec, cell, spec.closed * 0.5, grid);
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const;
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      const normal = normalOf(i, j);
      neighbors.forEach(([di, dj], edge) => {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= columns || nj >= rows) return;
        let side = 0;
        for (let axis = 0; axis < 3; axis += 1) {
          side += (centroid(ni, nj, axis) - centroid(i, j, axis)) * (normal[axis] ?? 0);
        }
        const base = (j * columns + i) * 6;
        for (let corner = 0; corner < 6; corner += 1) valley[(base + corner) * 4 + edge] = side > 0 ? 1 : 0;
      });
    }
  }

  // Static attributes come from the flat pose.
  writeGrid(spec, cell, 0, grid);
  const originY = grid[1] ?? 0;
  const span = Math.max(spec.width, spec.height);
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      const vertices = quad(i, j);
      const x = (index: number) => grid[(vertices[index] ?? 0) * 3] ?? 0;
      const y = (index: number) => grid[(vertices[index] ?? 0) * 3 + 1] ?? 0;
      // Edges in the order left, right, bottom, top, as pairs of quad corners.
      const edges = [
        [0, 3, i === 0],
        [1, 2, i === columns - 1],
        [0, 1, j === 0],
        [3, 2, j === rows - 1],
      ] as const;
      quadCorners.forEach((corner, slot) => {
        const at = (j * columns + i) * 6 + slot;
        flat[at * 2] = x(corner) / span;
        flat[at * 2 + 1] = (y(corner) - originY) / span;
        edges.forEach(([from, to, border], edge) => {
          crease[at * 4 + edge] = border
            ? noCrease
            : lineDistance(x(corner), y(corner), x(from), y(from), x(to), y(to));
        });
      });
    }
  }

  const pose = (drivers: readonly number[]) => {
    const amount = Math.min(1, Math.max(0, drivers[0] ?? 0));
    writeGrid(spec, cell, amount * spec.closed, grid);

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (let at = 0; at < grid.length; at += 3) {
      const x = grid[at] ?? 0;
      const y = grid[at + 1] ?? 0;
      const z = grid[at + 2] ?? 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    extent.x = maxX - minX;
    extent.y = maxY - minY;
    extent.z = maxZ - minZ;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Panels only stack near the end of the fold.
    const packed = Math.min(1, Math.max(0, (amount - 0.55) / 0.45));
    const stacked = packed * packed * 5;

    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < columns; i += 1) {
        const vertices = quad(i, j);
        const normal = normalOf(i, j);
        quadCorners.forEach((corner, slot) => {
          const at = (j * columns + i) * 6 + slot;
          const from = (vertices[corner] ?? 0) * 3;
          positions[at * 3] = (grid[from] ?? 0) - centerX;
          positions[at * 3 + 1] = (grid[from + 1] ?? 0) - centerY;
          positions[at * 3 + 2] = (grid[from + 2] ?? 0) - centerZ;
          normals[at * 3] = normal[0];
          normals[at * 3 + 1] = normal[1];
          normals[at * 3 + 2] = normal[2];
          layers[at] = stacked;
        });
      }
    }
  };

  pose([0]);

  const cornerOf = (i: number, j: number, slot: number) => (j * columns + i) * 6 + slot;
  return {
    mesh: {
      corners,
      positions,
      normals,
      flat,
      crease,
      valley,
      layers,
      anchors: {
        nearCorner: cornerOf(0, 0, 0),
        farCorner: cornerOf(columns - 1, rows - 1, 2),
        middle: cornerOf(Math.floor(columns / 2), Math.floor(rows / 2), 0),
      },
    },
    extent,
    pose,
  };
}
