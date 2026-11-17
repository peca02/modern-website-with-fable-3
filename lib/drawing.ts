import { chapterCount, chapters } from "@/lib/beats";
import { createMiura } from "@/lib/fold/miura";
import { createSequence, dartSpec, halvesSpec } from "@/lib/fold/sequence";
import type { FoldModel } from "@/lib/fold/types";
import { createVault } from "@/lib/fold/yoshimura";
import { sheetFace, stocks } from "@/lib/palette";
import { direct, type Pattern } from "@/scene/direction";

// The sheet as flat polygons, from the same fold models and the same direction file as the 3D scene.
// Used where there is no WebGL: the fallback drawing in each chapter, the OG image and the icon.

type Vector = [number, number, number];

export type Facet = { points: string; fill: string; depth: number };
export type Drawing = { viewBox: string; facets: Facet[]; shadow: string; ink: string };

const models: Record<Pattern, () => FoldModel> = {
  miura: () => createMiura(),
  vault: () => createVault(),
  halves: () => createSequence(halvesSpec),
  dart: () => createSequence(dartSpec),
};

// Where the scene's key light comes from, normalized.
const light: Vector = [-0.268, 0.358, 0.894];
// Flat stacks lie a hair apart, far less than the tilt moves their centers; their layer order is weighted up.
const layerWeight: Record<Pattern, number> = { miura: 1, vault: 1, halves: 60, dart: 1 };
const shadowOffset = [0.16, 0.22] as const;

function rotate([x, y, z]: Vector, rx: number, ry: number, rz: number): Vector {
  const x1 = x * Math.cos(rz) - y * Math.sin(rz);
  const y1 = x * Math.sin(rz) + y * Math.cos(rz);
  const x2 = x1 * Math.cos(ry) + z * Math.sin(ry);
  const z2 = -x1 * Math.sin(ry) + z * Math.cos(ry);
  return [x2, y1 * Math.cos(rx) - z2 * Math.sin(rx), y1 * Math.sin(rx) + z2 * Math.cos(rx)];
}

function shade(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.min(255, Math.round(((value >> shift) & 255) * amount));
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

/** The pose a chapter holds (the same one reduced motion shows), drawn straight on. */
export function drawChapter(index: number, story = index + (chapters[index]?.hold ?? 0)): Drawing {
  const chapter = chapters[Math.min(chapterCount - 1, Math.max(0, index))] ?? chapters[0];
  const reverse = stocks[(chapters[(index + 1) % chapterCount] ?? chapters[0]).stock].page;
  const shot = direct(story, 0, 0, 0, true);
  const model = models[shot.pattern]();
  model.pose([shot.fold]);
  const { positions, normals, corners } = model.mesh;
  const turn = (at: number, from: Float32Array) =>
    rotate(
      [from[at * 3] ?? 0, from[at * 3 + 1] ?? 0, from[at * 3 + 2] ?? 0],
      shot.tiltX,
      shot.tiltY + shot.turn * Math.PI,
      shot.spin,
    );

  const toward = rotate([0, 0, 1], shot.tiltX, shot.tiltY + shot.turn * Math.PI, shot.spin)[2];
  const stacked = (layerWeight[shot.pattern] - 1) * toward;
  const facets: Facet[] = [];
  const outline: string[] = [];
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (let corner = 0; corner < corners; corner += 3) {
    const triangle = [turn(corner, positions), turn(corner + 1, positions), turn(corner + 2, positions)];
    const normal = turn(corner, normals);
    const front = normal[2] > 0;
    const side = front ? 1 : -1;
    const lit = (normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]) * side;
    const wrap = Math.min(1, Math.max(0, (lit + 0.35) / 1.35));
    const points = triangle.map(([x, y]) => {
      left = Math.min(left, x);
      right = Math.max(right, x + shadowOffset[0]);
      top = Math.min(top, -y);
      bottom = Math.max(bottom, -y + shadowOffset[1]);
      return `${x.toFixed(3)},${(-y).toFixed(3)}`;
    });
    facets.push({
      points: points.join(" "),
      fill: shade(front ? sheetFace : reverse, 0.62 + 0.4 * wrap),
      depth:
        (triangle[0]?.[2] ?? 0) +
        (triangle[1]?.[2] ?? 0) +
        (triangle[2]?.[2] ?? 0) +
        stacked * ((positions[corner * 3 + 2] ?? 0) + (positions[corner * 3 + 5] ?? 0) + (positions[corner * 3 + 8] ?? 0)),
    });
    // One winding for every triangle, so overlapping layers add up in the shadow instead of cancelling.
    outline.push(`M${(front ? points : points.toReversed()).join("L")}Z`);
  }
  facets.sort((a, b) => a.depth - b.depth);

  const margin = 0.1;
  const viewBox = [left - margin, top - margin, right - left + margin * 2, bottom - top + margin * 2]
    .map((value) => value.toFixed(3))
    .join(" ");
  return { viewBox, facets, shadow: outline.join(""), ink: stocks[chapter.stock].ink };
}
