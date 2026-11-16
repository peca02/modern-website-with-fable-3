"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { lowestTier, pickInitialTier, tierAt } from "@/lib/quality";
import { store } from "@/lib/store";
import { Director } from "@/scene/Director";
import { Sheet } from "@/scene/Sheet";

function readForcedTier() {
  const value = new URLSearchParams(window.location.search).get("tier");
  return value === null ? null : Number(value);
}

export function Stage() {
  const [forced] = useState(readForcedTier);
  const [tier, setTier] = useState(() => forced ?? pickInitialTier());
  const [antialias] = useState(() => tierAt(tier).antialias);
  const quality = tierAt(tier);

  const lower = () => {
    if (forced !== null) return;
    setTier((current) => {
      const next = Math.max(lowestTier, current - 1);
      store.tier = next;
      return next;
    });
  };

  return (
    <Canvas
      dpr={[1, quality.maxDpr]}
      gl={{ alpha: true, antialias, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0, 9] }}
      onCreated={() => {
        store.tier = tier;
      }}
    >
      <PerformanceMonitor onDecline={lower} flipflops={2} />
      <Director />
      <Sheet />
    </Canvas>
  );
}
