"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { loadClock } from "@/lib/loadClock";
import { lowestTier, pickInitialTier, tierAt } from "@/lib/quality";
import { store } from "@/lib/store";
import { Director } from "@/scene/Director";
import { Page } from "@/scene/Page";
import { Sheet } from "@/scene/Sheet";

function readForcedTier() {
  const value = new URLSearchParams(window.location.search).get("tier");
  return value === null ? null : Number(value);
}

function hasWebGL() {
  return document.createElement("canvas").getContext("webgl2") !== null;
}

export function Stage() {
  const [supported] = useState(hasWebGL);
  const [forced] = useState(readForcedTier);
  const [tier, setTier] = useState(() => forced ?? pickInitialTier());
  const [antialias] = useState(() => tierAt(tier).antialias);
  const [shadows] = useState(() => tierAt(tier).shadowMap > 0);
  const quality = tierAt(tier);

  useEffect(() => {
    if (supported) return;
    document.documentElement.dataset.scene = "none";
    loadClock.skipScene();
  }, [supported]);

  const lower = () => {
    if (forced !== null) return;
    setTier((current) => {
      const next = Math.max(lowestTier, current - 1);
      store.tier = next;
      return next;
    });
  };

  if (!supported) return null;

  return (
    <Canvas
      flat
      shadows={shadows}
      dpr={[1, quality.maxDpr]}
      gl={{ alpha: true, antialias, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0, 9] }}
      onCreated={({ gl, scene, camera }) => {
        store.tier = tier;
        // For the development scripts: the tier the device was given.
        document.documentElement.dataset.tier = String(tier);
        loadClock.mark("context");
        void gl.compileAsync(scene, camera).then(
          () => loadClock.mark("shaders"),
          () => loadClock.mark("shaders"),
        );
        // A lost context leaves a blank canvas; the drawn fallback stands in until it is back.
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          store.sheet.live = false;
          document.documentElement.dataset.scene = "lost";
        });
        gl.domElement.addEventListener("webglcontextrestored", () => {
          document.documentElement.dataset.scene = "live";
        });
      }}
    >
      <PerformanceMonitor onDecline={lower} flipflops={2} />
      <Director />
      <Page shadowMap={shadows ? quality.shadowMap : 0} />
      <Sheet shadowMap={shadows ? quality.shadowMap : 0} />
    </Canvas>
  );
}
