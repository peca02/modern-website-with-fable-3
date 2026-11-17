"use client";

import { useId, useRef } from "react";
import { audio } from "@/lib/audio";
import { gsap, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

type PackControlProps = {
  label: string;
  open: string;
  packed: string;
  readout: string;
  flat: string;
};

const thumb =
  "[&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-ink [&::-moz-range-thumb]:size-8 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink";

/** One range input drives the Miura fold. The readout follows the sheet itself; the headline follows through `direct()`. */
export function PackControl({ label, open, packed, readout, flat }: PackControlProps) {
  const id = useId();
  const output = useRef<HTMLOutputElement>(null);
  const lastPleat = useRef(0);

  useGSAP(() => {
    let shownSize = "";
    const tick = () => {
      const { sheet } = store;
      if (!sheet.live || !output.current) return;
      const size = `${sheet.x.toFixed(2)} × ${sheet.y.toFixed(2)} × ${sheet.z.toFixed(2)} m`;
      if (size !== shownSize) {
        shownSize = size;
        output.current.textContent = size;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  });

  return (
    <div className="flex max-w-prose flex-col gap-3">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        defaultValue={0}
        onInput={(event) => {
          const value = event.currentTarget.valueAsNumber;
          store.controls.pack = value / 100;
          // One crease for every pleat's worth of travel.
          const pleat = Math.round(value / 8);
          if (pleat !== lastPleat.current) {
            lastPleat.current = pleat;
            audio.crease(0.6);
          }
        }}
        className={`h-8 w-full cursor-pointer appearance-none bg-ink/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${thumb}`}
      />
      <div className="type-label flex justify-between" aria-hidden>
        <span>{open}</span>
        <span>{packed}</span>
      </div>
      <p className="type-label flex flex-wrap gap-x-4">
        <span>{readout}</span>
        <output ref={output} htmlFor={id} className="tabular-nums">
          {flat}
        </output>
      </p>
    </div>
  );
}
