"use client";

import dynamic from "next/dynamic";

const Stage = dynamic(() => import("@/scene/Stage").then((module) => module.Stage), {
  ssr: false,
});

export function SceneLoader() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Stage />
    </div>
  );
}
