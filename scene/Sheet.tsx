"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, Vector3, type Group, type Mesh } from "three";
import { createMiura } from "@/lib/fold/miura";
import { createSequence, dartSpec, halvesSpec } from "@/lib/fold/sequence";
import type { FoldModel } from "@/lib/fold/types";
import { createVault } from "@/lib/fold/yoshimura";
import { sheetFace } from "@/lib/palette";
import { store } from "@/lib/store";
import { ContactMaterial } from "@/scene/ContactMaterial";
import { direct, type Pattern } from "@/scene/direction";
import { keyLight } from "@/scene/Page";
import { PaperMaterial } from "@/scene/PaperMaterial";
import { SheetGeometry } from "@/scene/SheetGeometry";
import { backdropAt, reverseAt } from "@/scene/stock";

type Folded = { model: FoldModel; geometry: SheetGeometry };

function createPatterns(): Record<Pattern, Folded> {
  const fold = (model: FoldModel) => ({ model, geometry: new SheetGeometry(model.mesh) });
  return {
    miura: fold(createMiura()),
    vault: fold(createVault()),
    halves: fold(createSequence(halvesSpec)),
    dart: fold(createSequence(dartSpec)),
  };
}

export function Sheet({ shadowMap }: { shadowMap: number }) {
  const group = useRef<Group>(null);
  const paper = useRef<Mesh>(null);
  const contact = useRef<Mesh>(null);
  const [patterns] = useState(createPatterns);
  const [material] = useState(() => new PaperMaterial());
  const [patch] = useState(() => new ContactMaterial());
  const [page] = useState(() => new Color());
  const [point] = useState(() => new Vector3());

  useFrame(({ clock, camera, size }) => {
    const { story, pointer, viewport, controls } = store;
    const sinceThrow =
      controls.thrownAt > 0 && !store.reduced ? (performance.now() - controls.thrownAt) / 1000 : -1;
    const shot = direct(
      story,
      clock.elapsedTime,
      pointer.x,
      pointer.y,
      viewport.wide,
      controls.pack,
      sinceThrow,
    );

    const { model, geometry } = patterns[shot.pattern];
    model.pose([shot.fold]);
    geometry.sync();
    if (shot.pattern === "miura") {
      store.sheet.live = true;
      store.sheet.fold = shot.fold;
      store.sheet.x = model.extent.x;
      store.sheet.y = model.extent.y;
      store.sheet.z = model.extent.z;
    }
    if (paper.current && paper.current.geometry !== geometry) paper.current.geometry = geometry;

    material.setColors(sheetFace, reverseAt(story), backdropAt(story, "page", page));
    material.setFold(Math.min(1, shot.fold), shot.memory);
    material.setGhosts(shot.ghostMiura, shot.ghostVault);
    material.setBacklight(shot.backlight);
    material.setOcclusion(shadowMap > 0 ? 0.45 : 0.8);

    const sheet = group.current;
    if (!sheet) return;
    sheet.position.set(0, 0, shot.lift);
    sheet.rotation.set(shot.tiltX, shot.tiltY + shot.turn * Math.PI, shot.spin);
    sheet.translateX(shot.flight);
    sheet.updateMatrixWorld();

    // DOM followers read the same vertices the picture is drawn from. Anchors of the other patterns hide.
    for (const [name, folded] of Object.entries(patterns)) {
      if (name === shot.pattern) continue;
      for (const key of Object.keys(folded.model.mesh.anchors)) {
        const anchor = store.anchors[key];
        if (anchor) anchor.visible = false;
      }
    }
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
        <mesh
          ref={paper}
          geometry={patterns.miura.geometry}
          material={material}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      </group>
      {shadowMap > 0 ? null : (
        <mesh ref={contact} material={patch}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      )}
    </>
  );
}
