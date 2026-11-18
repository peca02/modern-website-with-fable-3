"use client";

import dynamic from "next/dynamic";
import { loadClock } from "@/lib/loadClock";

const Stage = dynamic(
  () =>
    import("@/scene/Stage").then((module) => {
      loadClock.mark("code");
      return module.Stage;
    }),
  {
    ssr: false,
  },
);

export function SceneLoader() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 scene-off:hidden">
      <Stage />
    </div>
  );
}
