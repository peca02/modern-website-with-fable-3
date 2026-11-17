import { credit, footer } from "@/lib/content";

/** While chapters are pinned the footer lies over the foot of the last stage, so it adds no scroll of its own. */
export function Footer() {
  return (
    <footer className="stock-lilac type-label relative flex flex-wrap content-end items-end justify-between gap-x-8 gap-y-1 px-4 py-4 text-ink noscript:bg-page pinned:-mt-24 pinned:h-24 md:px-8">
      <p>{footer.note}</p>
      <p>
        {footer.creditLabel}:{" "}
        <a
          href={credit.href}
          className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {credit.name}
        </a>
      </p>
    </footer>
  );
}
