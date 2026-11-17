"use client";

import { useState } from "react";
import { LuVolume2, LuVolumeX } from "react-icons/lu";
import { audio } from "@/lib/audio";
import { gsap, useGSAP } from "@/lib/gsap";

/** Sound is off until this is clicked; the click is also what creates the audio context. */
export function SoundToggle({ label }: { label: string }) {
  const [on, setOn] = useState(false);

  useGSAP(() => {
    const tick = (_time: number, deltaTime: number) => audio.frame(deltaTime / 1000);
    const visibility = () => audio.visibility();
    gsap.ticker.add(tick);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener("visibilitychange", visibility);
    };
  });

  const Icon = on ? LuVolume2 : LuVolumeX;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        void audio.toggle().then((next) => {
          setOn(next);
          audio.crease();
        });
      }}
      className="type-label inline-flex cursor-pointer noscript:hidden items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-backdrop-ink"
    >
      <Icon aria-hidden className="size-4" />
      {label}
    </button>
  );
}
