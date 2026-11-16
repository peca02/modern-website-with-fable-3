"use client";

import dynamic from "next/dynamic";

const TrialCanvas = dynamic(() => import("@/scene/TrialCanvas").then((m) => m.TrialCanvas), {
  ssr: false,
});

export function SceneLoader() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      <TrialCanvas />
    </div>
  );
}
