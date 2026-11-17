import type { Metadata } from "next";
import { Anybody, Literata } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@/lib/content";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-anybody",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name}. ${site.tagline}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anybody.variable} ${literata.variable}`}>
      <body className="stock-fern type-body bg-backdrop text-ink">{children}</body>
    </html>
  );
}
