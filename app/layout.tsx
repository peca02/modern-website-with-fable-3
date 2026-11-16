import type { Metadata } from "next";
import { Anybody, Literata } from "next/font/google";
import type { ReactNode } from "react";
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
  title: "Mountain & Valley",
  description: "A folding office for structures that ship flat.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anybody.variable} ${literata.variable}`}>
      <body className="bg-page text-ink font-text">{children}</body>
    </html>
  );
}
