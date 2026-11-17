import { credit, footer } from "@/lib/content";

export function Footer() {
  return (
    <footer className="stock-lilac type-label relative flex flex-wrap justify-between gap-x-8 gap-y-2 px-4 py-6 text-ink noscript:bg-page md:px-8">
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
