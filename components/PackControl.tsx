"use client";

import { useId, useRef } from "react";
import { packWidth } from "@/lib/beats";
import { gsap, useGSAP } from "@/lib/gsap";
import { store } from "@/lib/store";

type PackControlProps = {
  headlineId: string;
  label: string;
  open: string;
  packed: string;
  readout: string;
  flat: string;
};

const thumb =
  "[&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-ink [&::-moz-range-thumb]:size-8 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink";

/** One range input drives the Miura fold. The headline's width axis and the readout follow the sheet itself. */
export function PackControl({ headlineId, label, open, packed, readout, flat }: PackControlProps) {
  const id = useId();
  const output = useRef<HTMLOutputElement>(null);

  useGSAP(() => {
    const headline = document.getElementById(headlineId);
    let shownWidth = "";
    let shownSize = "";
    const tick = () => {
      const { sheet, controls } = store;
      // Without a scene the control still squeezes the headline.
      const fold = sheet.live ? sheet.fold : controls.pack;
      const width = gsap.utils.interpolate(packWidth.open, packWidth.packed, fold).toFixed(1);
      if (width !== shownWidth) {
        shownWidth = width;
        headline?.style.setProperty("--wdth", width);
      }
      if (!sheet.live || !output.current) return;
      const size = `${sheet.x.toFixed(2)} × ${sheet.y.toFixed(2)} × ${sheet.z.toFixed(2)} m`;
      if (size !== shownSize) {
        shownSize = size;
        output.current.textContent = size;
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      headline?.style.removeProperty("--wdth");
    };
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
          store.controls.pack = event.currentTarget.valueAsNumber / 100;
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
