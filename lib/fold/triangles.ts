import { noCrease, type FoldMesh } from "@/lib/fold/types";

/**
 * Shared plumbing for models whose faces are triangles over a fixed set of vertices: the model computes
 * vertex positions, this turns them into the corner arrays the scene uploads.
 */
export function createTriangleSheet(flatXY: Float64Array, indices: readonly number[], span: number) {
  const vertexCount = flatXY.length / 2;
  const corners = indices.length;
  const faces = Int32Array.from(indices);
  const fx = (vertex: number) => flatXY[vertex * 2] ?? 0;
  const fy = (vertex: number) => flatXY[vertex * 2 + 1] ?? 0;
  const at = (corner: number) => faces[corner] ?? 0;

  // Counter-clockwise on the flat sheet, so the front faces +z.
  for (let face = 0; face < corners; face += 3) {
    const [a, b, c] = [at(face), at(face + 1), at(face + 2)];
    const area = (fx(b) - fx(a)) * (fy(c) - fy(a)) - (fy(b) - fy(a)) * (fx(c) - fx(a));
    if (area < 0) {
      faces[face + 1] = c;
      faces[face + 2] = b;
    }
  }

  // Edge e of a face runs from its corner e to the next one. `across` holds the far vertex of the
  // neighboring face, or -1 where the edge is the border of the sheet.
  const across = new Int32Array(corners).fill(-1);
  const seen = new Map<number, number>();
  for (let face = 0; face < corners; face += 3) {
    for (let edge = 0; edge < 3; edge += 1) {
      const from = at(face + edge);
      const to = at(face + ((edge + 1) % 3));
      const key = Math.min(from, to) * vertexCount + Math.max(from, to);
      const other = seen.get(key);
      if (other === undefined) {
        seen.set(key, face + edge);
        continue;
      }
      const otherFace = other - (other % 3);
      across[face + edge] = at(otherFace + (((other % 3) + 2) % 3));
      across[other] = at(face + ((edge + 2) % 3));
    }
  }

  const positions = new Float32Array(corners * 3);
  const normals = new Float32Array(corners * 3);
  const flat = new Float32Array(corners * 2);
  const crease = new Float32Array(corners * 4).fill(noCrease);
  const valley = new Float32Array(corners * 4);
  const layers = new Float32Array(corners);
  const extent = { x: 0, y: 0, z: 0 };

  for (let corner = 0; corner < corners; corner += 1) {
    const vertex = at(corner);
    const face = corner - (corner % 3);
    flat[corner * 2] = fx(vertex) / span;
    flat[corner * 2 + 1] = fy(vertex) / span;
    for (let edge = 0; edge < 3; edge += 1) {
      if ((across[face + edge] ?? -1) < 0) continue;
      const from = at(face + edge);
      const to = at(face + ((edge + 1) % 3));
      const dx = fx(to) - fx(from);
      const dy = fy(to) - fy(from);
      crease[corner * 4 + edge] =
        Math.abs((fx(vertex) - fx(from)) * dy - (fy(vertex) - fy(from)) * dx) / Math.hypot(dx, dy);
    }
  }

  const normal = [0, 0, 1];
  const faceNormal = (vertices: Float64Array, face: number) => {
    const a = at(face) * 3;
    const b = at(face + 1) * 3;
    const c = at(face + 2) * 3;
    const ux = (vertices[b] ?? 0) - (vertices[a] ?? 0);
    const uy = (vertices[b + 1] ?? 0) - (vertices[a + 1] ?? 0);
    const uz = (vertices[b + 2] ?? 0) - (vertices[a + 2] ?? 0);
    const vx = (vertices[c] ?? 0) - (vertices[a] ?? 0);
    const vy = (vertices[c + 1] ?? 0) - (vertices[a + 1] ?? 0);
    const vz = (vertices[c + 2] ?? 0) - (vertices[a + 2] ?? 0);
    const x = uy * vz - uz * vy;
    const y = uz * vx - ux * vz;
    const z = ux * vy - uy * vx;
    const length = Math.hypot(x, y, z) || 1;
    normal[0] = x / length;
    normal[1] = y / length;
    normal[2] = z / length;
  };

  /** A crease is a valley when the neighbor rises toward the front of the face. Call with a folded pose. */
  const markValleys = (vertices: Float64Array) => {
    for (let face = 0; face < corners; face += 3) {
      faceNormal(vertices, face);
      const origin = at(face) * 3;
      for (let edge = 0; edge < 3; edge += 1) {
        const far = across[face + edge] ?? -1;
        if (far < 0) continue;
        let side = 0;
        for (let axis = 0; axis < 3; axis += 1) {
          side += ((vertices[far * 3 + axis] ?? 0) - (vertices[origin + axis] ?? 0)) * (normal[axis] ?? 0);
        }
        for (let corner = 0; corner < 3; corner += 1) valley[(face + corner) * 4 + edge] = side > 0 ? 1 : 0;
      }
    }
  };

  /** Writes corner positions and flat normals, centered on the bounding box. */
  const place = (vertices: Float64Array) => {
    const low = [Infinity, Infinity, Infinity];
    const high = [-Infinity, -Infinity, -Infinity];
    for (let index = 0; index < vertices.length; index += 1) {
      const axis = index % 3;
      const value = vertices[index] ?? 0;
      if (value < (low[axis] ?? 0)) low[axis] = value;
      if (value > (high[axis] ?? 0)) high[axis] = value;
    }
    const size = (axis: number) => (high[axis] ?? 0) - (low[axis] ?? 0);
    const middle = (axis: number) => ((high[axis] ?? 0) + (low[axis] ?? 0)) / 2;
    extent.x = size(0);
    extent.y = size(1);
    extent.z = size(2);

    for (let face = 0; face < corners; face += 3) {
      faceNormal(vertices, face);
      for (let corner = face; corner < face + 3; corner += 1) {
        for (let axis = 0; axis < 3; axis += 1) {
          positions[corner * 3 + axis] = (vertices[at(corner) * 3 + axis] ?? 0) - middle(axis);
          normals[corner * 3 + axis] = normal[axis] ?? 0;
        }
      }
    }
  };

  const cornerOf = (vertex: number) => Math.max(0, faces.indexOf(vertex));

  const mesh: FoldMesh = { corners, positions, normals, flat, crease, valley, layers, anchors: {} };
  return { mesh, extent, place, markValleys, cornerOf };
}
