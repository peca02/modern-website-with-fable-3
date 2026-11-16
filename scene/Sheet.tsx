"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";
import { chapters } from "@/lib/beats";
import { sheetFace, stocks } from "@/lib/palette";
import { store } from "@/lib/store";
import { direct } from "@/scene/direction";
import { PaperMaterial } from "@/scene/PaperMaterial";

function reverseAt(story: number) {
  const next = chapters[(Math.floor(story) + 1) % chapters.length] ?? chapters[0];
  return stocks[next.stock].page;
}

// Placeholder subject for the foundation: a flat sheet. The fold models replace the geometry.
export function Sheet() {
  const group = useRef<Group>(null);
  const [material] = useState(() => new PaperMaterial());

  useFrame(({ clock }) => {
    const shot = direct(store.story, clock.elapsedTime, store.pointer.x, store.pointer.y, store.viewport.wide);
    material.setColors(sheetFace, reverseAt(store.story));
    group.current?.rotation.set(shot.tiltX + shot.turn * Math.PI, 0, shot.tiltY);
  });

  return (
    <group ref={group}>
      <mesh material={material}>
        <planeGeometry args={[3, 3]} />
      </mesh>
    </group>
  );
}
