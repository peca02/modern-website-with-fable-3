import { BufferAttribute, BufferGeometry, DynamicDrawUsage } from "three";
import type { FoldMesh } from "@/lib/fold/types";

// Wraps the arrays of a fold model without copying them; `sync` re-uploads what a pose rewrites.
export class SheetGeometry extends BufferGeometry {
  private readonly moving: BufferAttribute[];

  constructor(mesh: FoldMesh) {
    super();
    const position = new BufferAttribute(mesh.positions, 3).setUsage(DynamicDrawUsage);
    const normal = new BufferAttribute(mesh.normals, 3).setUsage(DynamicDrawUsage);
    const layers = new BufferAttribute(mesh.layers, 1).setUsage(DynamicDrawUsage);
    this.setAttribute("position", position);
    this.setAttribute("normal", normal);
    this.setAttribute("aLayers", layers);
    this.setAttribute("aFlat", new BufferAttribute(mesh.flat, 2));
    this.setAttribute("aCrease", new BufferAttribute(mesh.crease, 4));
    this.setAttribute("aValley", new BufferAttribute(mesh.valley, 4));
    this.moving = [position, normal, layers];
  }

  sync() {
    for (const attribute of this.moving) attribute.needsUpdate = true;
  }
}
