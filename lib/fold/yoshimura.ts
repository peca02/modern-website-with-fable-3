import { createTriangleSheet } from "@/lib/fold/triangles";
import type { FoldModel } from "@/lib/fold/types";

export type VaultSpec = {
  /** Diamonds across the arch and rows along its axis (even, so both ends are straight edges). */
  segments: number;
  rows: number;
  width: number;
  height: number;
  /** Arc angle per segment at driver 1, radians. */
  arc: number;
};

export const vaultSpec: VaultSpec = { segments: 8, rows: 6, width: 3.4, height: 2.4, arc: 0.35 };

type Vertex = { across: number; row: number; mid: boolean };

/**
 * Yoshimura vault. Every row of vertices sits on a polygon of side b inscribed in a circle of radius
 * R = b / (2 sin(phi / 2)); odd rows are turned by half a segment. Rows close up along the axis by
 * h^2 = h0^2 - (b^2 / 4) tan^2(phi / 4), which keeps every diagonal at its flat length.
 */
export function createVault(spec: VaultSpec = vaultSpec): FoldModel {
  const { segments, rows } = spec;
  const side = spec.width / segments;
  const rise = spec.height / rows;

  const vertices: Vertex[] = [];
  const rowStart: number[] = [];
  for (let row = 0; row <= rows; row += 1) {
    rowStart.push(vertices.length);
    if (row % 2 === 0) {
      for (let i = 0; i <= segments; i += 1) vertices.push({ across: i, row, mid: false });
    } else {
      // Odd rows end in the midpoint of a segment, where the border of the sheet cuts a diamond in half.
      vertices.push({ across: 0, row, mid: true });
      for (let i = 0; i < segments; i += 1) vertices.push({ across: i + 0.5, row, mid: false });
      vertices.push({ across: segments, row, mid: true });
    }
  }

  const indices: number[] = [];
  for (let row = 0; row < rows; row += 1) {
    const evenRow = row % 2 === 0 ? row : row + 1;
    const oddRow = row % 2 === 0 ? row + 1 : row;
    const even = rowStart[evenRow] ?? 0;
    const odd = rowStart[oddRow] ?? 0;
    for (let i = 0; i < segments; i += 1) indices.push(even + i, even + i + 1, odd + i + 1);
    for (let i = 0; i <= segments; i += 1) indices.push(odd + i, odd + i + 1, even + i);
  }

  const flatXY = new Float64Array(vertices.length * 2);
  vertices.forEach((vertex, index) => {
    flatXY[index * 2] = vertex.across * side;
    flatXY[index * 2 + 1] = vertex.row * rise;
  });
  const sheet = createTriangleSheet(flatXY, indices, Math.max(spec.width, spec.height));
  const points = new Float64Array(vertices.length * 3);

  const write = (amount: number) => {
    const phi = Math.max(1e-6, amount * spec.arc);
    const radius = side / (2 * Math.sin(phi / 2));
    const step = Math.sqrt(rise * rise - ((side * side) / 4) * Math.tan(phi / 4) ** 2);
    vertices.forEach((vertex, index) => {
      const theta = (vertex.across - segments / 2) * phi;
      const reach = vertex.mid ? radius * Math.cos(phi / 2) : radius;
      points[index * 3] = reach * Math.sin(theta);
      points[index * 3 + 1] = vertex.row * step;
      // The crown is the low point here: the sheet is turned over when it stands up, reverse side out.
      points[index * 3 + 2] = radius - reach * Math.cos(theta);
    });
  };

  write(0.5);
  sheet.markValleys(points);

  const pose = (drivers: readonly number[]) => {
    write(Math.min(1, Math.max(0, drivers[0] ?? 0)));
    sheet.place(points);
  };
  pose([0]);

  const middleRow = rows / 2;
  sheet.mesh.anchors = {
    crown: sheet.cornerOf((rowStart[middleRow] ?? 0) + (middleRow % 2 === 0 ? segments / 2 : segments / 2 + 1)),
    foot: sheet.cornerOf(rowStart[0] ?? 0),
    mouth: sheet.cornerOf((rowStart[rows] ?? 0) + segments / 2),
  };

  return { mesh: sheet.mesh, extent: sheet.extent, pose };
}
