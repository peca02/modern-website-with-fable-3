"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, Vector3, type Group, type Mesh } from "three";
import { createMiura } from "@/lib/fold/miura";
import { sheetFace } from "@/lib/palette";
import { store } from "@/lib/store";
import { ContactMaterial } from "@/scene/ContactMaterial";
import { direct } from "@/scene/direction";
import { keyLight } from "@/scene/Page";
import { PaperMaterial } from "@/scene/PaperMaterial";
import { SheetGeometry } from "@/scene/SheetGeometry";
import { backdropAt, reverseAt } from "@/scene/stock";

export function Sheet({ shadowMap }: { shadowMap: number }) {
  const group = useRef<Group>(null);
  const contact = useRef<Mesh>(null);
  const [model] = useState(() => createMiura());
  const [geometry] = useState(() => new SheetGeometry(model.mesh));
  const [material] = useState(() => new PaperMaterial());
  const [patch] = useState(() => new ContactMaterial());
  const [page] = useState(() => new Color());
  const [point] = useState(() => new Vector3());

  useFrame(({ clock, camera, size }) => {
    const { story, pointer, viewport, controls } = store;
    const shot = direct(story, clock.elapsedTime, pointer.x, pointer.y, viewport.wide, controls.pack);

    model.pose([shot.fold]);
    geometry.sync();

    material.setColors(sheetFace, reverseAt(story), backdropAt(story, "page", page));
    material.setFold(shot.fold, shot.memory);
    material.setOcclusion(shadowMap > 0 ? 0.45 : 0.8);

    const sheet = group.current;
    if (!sheet) return;
    sheet.position.set(0, 0, shot.lift);
    sheet.rotation.set(shot.tiltX, shot.tiltY + shot.turn * Math.PI, shot.spin);
    sheet.updateMatrixWorld();

    // DOM followers read the same vertices the picture is drawn from.
    for (const [name, corner] of Object.entries(model.mesh.anchors)) {
      point.fromArray(model.mesh.positions, corner * 3).applyMatrix4(sheet.matrixWorld).project(camera);
      const anchor = (store.anchors[name] ??= { x: 0, y: 0, visible: false });
      anchor.x = (point.x * 0.5 + 0.5) * size.width;
      anchor.y = (0.5 - point.y * 0.5) * size.height;
      anchor.visible = Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1;
    }

    const blot = contact.current;
    if (!blot) return;
    const spread = 0.5 + shot.lift * 0.45;
    const { x, y, z } = model.extent;
    blot.position.set((-keyLight[0] / keyLight[2]) * shot.lift, (-keyLight[1] / keyLight[2]) * shot.lift, 0);
    blot.rotation.set(0, 0, shot.spin);
    blot.scale.set(
      x * Math.abs(Math.cos(shot.tiltY)) + z + spread,
      y * Math.abs(Math.cos(shot.tiltX)) + z + spread,
      1,
    );
    backdropAt(story, "ink", patch.ink);
    patch.setSoftness(Math.min(0.95, spread / Math.min(blot.scale.x, blot.scale.y) + 0.35), 0.3);
  });

  return (
    <>
      <group ref={group}>
        <mesh geometry={geometry} material={material} castShadow receiveShadow frustumCulled={false} />
      </group>
      {shadowMap > 0 ? null : (
        <mesh ref={contact} material={patch}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      )}
    </>
  );
}
