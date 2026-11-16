import type { ReactNode } from "react";
import type { StockName } from "@/lib/palette";

const stockClass: Record<StockName, string> = {
  fern: "stock-fern",
  mustard: "stock-mustard",
  rosa: "stock-rosa",
  pulp: "stock-pulp",
  lilac: "stock-lilac",
};

type ChapterProps = { id: string; stock: StockName; label: string; children: ReactNode };

export function Chapter({ id, stock, label, children }: ChapterProps) {
  return (
    <section
      id={id}
      data-chapter
      aria-label={label}
      className={`${stockClass[stock]} page-grid relative min-h-svh content-start pt-32 pb-24 text-ink noscript:bg-page`}
    >
      {children}
    </section>
  );
}
