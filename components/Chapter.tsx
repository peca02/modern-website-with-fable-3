import type { ReactNode } from "react";
import type { StockName } from "@/lib/palette";

const stockClass: Record<StockName, string> = {
  fern: "stock-fern",
  mustard: "stock-mustard",
  rosa: "stock-rosa",
  pulp: "stock-pulp",
  lilac: "stock-lilac",
};

// The text takes the side the sheet leaves free (see shiftX in scene/direction.ts).
const sideClass = {
  left: "wide:col-span-6 wide:col-start-1",
  right: "wide:col-span-6 wide:col-start-7",
};

type ChapterProps = {
  id: string;
  stock: StockName;
  side: keyof typeof sideClass;
  step: string;
  name: string;
  headline: readonly string[];
  hero?: boolean;
  children: ReactNode;
};

/** Ordinary vertical flow in HTML; under `pinned:` the stage becomes one screen that ScrollRig pins. */
export function Chapter({ id, stock, side, step, name, headline, hero = false, children }: ChapterProps) {
  const Heading = hero ? "h1" : "h2";
  // Above the fold the copy opens on load; further down it opens while the chapter scrolls in.
  const at = hero ? "-1" : "-0.12";
  return (
    <section
      id={id}
      data-chapter
      aria-labelledby={`${id}-title`}
      className={`${stockClass[stock]} relative text-ink noscript:bg-page`}
    >
      <div
        data-stage
        className="page-grid min-h-svh content-start pt-24 pb-16 pinned:h-svh pinned:overflow-hidden pinned:pb-24 wide:content-center wide:pt-28"
      >
        <div className={`halo col-span-full flex flex-col gap-4 md:col-span-9 wide:gap-6 ${sideClass[side]}`}>
          <p className="type-label" data-reveal data-at={at}>
            {step}. {name}
          </p>
          <Heading
            id={`${id}-title`}
            className={`${hero ? "type-hero" : "type-display"} whitespace-nowrap text-shadow-none`}
            data-reveal
            data-at={at}
          >
            {headline.map((line) => (
              <span key={line} className="block">
                {line}{" "}
              </span>
            ))}
          </Heading>
          {children}
        </div>
      </div>
    </section>
  );
}
