"use client";

import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { ShadowMaterial } from "three";
import { store } from "@/lib/store";
import { backdropAt } from "@/scene/stock";

/** Direction the key light comes from; the contact patch on the low tiers uses the same numbers. */
export const keyLight = [-2.4, 3.2, 8] as const;

class ShadeMaterial extends ShadowMaterial {
  setStrength(opacity: number) {
    this.opacity = opacity;
  }
}

// The page is the plane behind the sheet. It is invisible except for the shadow that falls on it.
export function Page({ shadowMap }: { shadowMap: number }) {
  const [shade] = useState(() => new ShadeMaterial({ opacity: 0.3 }));

  useFrame(() => {
    backdropAt(store.story, "ink", shade.color);
    // A dart on its way out drags its shadow across the whole page; the shadow lets go first.
    const gone = Math.min(1, Math.max(0, (Math.abs(store.sheet.flight) - 1.5) / 2.5));
    shade.setStrength(0.3 * (1 - gone));
  });

  return (
    <>
      <directionalLight
        position={keyLight}
        castShadow={shadowMap > 0}
        shadow-mapSize={[shadowMap || 512, shadowMap || 512]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={7}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 1, 20]} />
      </directionalLight>
      {shadowMap > 0 ? (
        <mesh receiveShadow material={shade}>
          <planeGeometry args={[40, 40]} />
        </mesh>
      ) : null}
    </>
  );
}
