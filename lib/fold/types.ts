// Shared shape of every fold model. No three imports: the scene uploads these arrays as they are,
// and DOM anchors read the same numbers.

export type FoldMesh = {
  /** Triangle corners (non-indexed, three per triangle). */
  corners: number;
  /** 3 per corner, rewritten by `pose`. */
  positions: Float32Array;
  /** 3 per corner, flat per face, rewritten by `pose`. The front of the sheet faces +z when flat. */
  normals: Float32Array;
  /** 2 per corner: position on the flat sheet, 0-1 across its longer side. */
  flat: Float32Array;
  /** 4 per corner: distance on the flat sheet to each crease bounding the face. */
  crease: Float32Array;
  /** 4 per corner: 1 where that crease is a valley seen from the front, 0 for a mountain. */
  valley: Float32Array;
  /** 1 per corner: how many layers of paper lie stacked behind the face, rewritten by `pose`. */
  layers: Float32Array;
  /** Named points, as corner indices into `positions`. */
  anchors: Record<string, number>;
};

export type FoldModel = {
  mesh: FoldMesh;
  /** Bounding size of the last pose, in sheet units. */
  extent: { x: number; y: number; z: number };
  /** A pose is an array of fold drivers, never of vertex positions. */
  pose(drivers: readonly number[]): void;
};

/** Distance used for an edge that is the border of the sheet, not a crease. */
export const noCrease = 100;
