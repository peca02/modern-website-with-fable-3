"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera } from "three";
import { store } from "@/lib/store";
import { direct } from "@/scene/direction";

// Frames the subject by shifting the lens, not by turning the camera, so the text keeps its own space.
export function Director() {
  const frames = useRef(0);

  useFrame(({ camera, size, clock }) => {
    const shot = direct(store.story, clock.elapsedTime, store.pointer.x, store.pointer.y, store.viewport.wide);
    if (camera instanceof PerspectiveCamera) {
      camera.position.set(0, 0, shot.distance);
      camera.setViewOffset(
        size.width,
        size.height,
        -shot.shiftX * size.width,
        shot.shiftY * size.height,
        size.width,
        size.height,
      );
    }

    frames.current += 1;
    if (frames.current === 2) document.documentElement.dataset.scene = "live";
  }, -1);

  return null;
}
