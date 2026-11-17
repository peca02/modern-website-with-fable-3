"use client";

import { store } from "@/lib/store";

type ThrowLinkProps = { href: string; label: string; detail: string };

/** The contact link. Besides opening the mail client, it throws the dart. */
export function ThrowLink({ href, label, detail }: ThrowLinkProps) {
  return (
    <a
      href={href}
      onClick={() => {
        store.controls.thrownAt = performance.now();
      }}
      className="group inline-flex flex-col bg-ink px-6 py-4 text-page [text-shadow:none] transition-transform duration-200 ease-spring hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <span className="type-title">{label}</span>
      <span className="type-label">{detail}</span>
    </a>
  );
}
