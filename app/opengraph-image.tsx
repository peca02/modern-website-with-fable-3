import { ImageResponse } from "next/og";
import { site } from "@/lib/content";
import { drawChapter } from "@/lib/drawing";
import { stocks } from "@/lib/palette";

export const alt = `${site.name}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Face = { width: number; weight: 500 | 800; text: string };

// next/og cannot use next/font. With a plain fetch the Google Fonts API answers with a TrueType static instance,
// subset to the given text; 62.5 is the nearest named width the API serves as one file.
async function anybody({ width, weight, text }: Face) {
  const query = `family=Anybody:wdth,wght@${width},${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
  const source = /src: url\((.+?)\) format\('truetype'\)/.exec(css)?.[1];
  if (!source) throw new Error("No TrueType source for Anybody");
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Anybody: ${response.status}`);
  return { name: `Anybody ${width}`, data: await response.arrayBuffer(), weight, style: "normal" as const };
}

// The build never breaks for a font: without it the image falls back to the default face.
async function loadFonts() {
  try {
    return await Promise.all([
      anybody({ width: 62.5, weight: 800, text: site.name }),
      anybody({ width: 125, weight: 500, text: site.tagline }),
    ]);
  } catch {
    return [];
  }
}

// The half-packed Miura sheet on the first page's stock, drawn from the fold model.
export default async function OpengraphImage() {
  const { viewBox, facets, shadow, ink } = drawChapter(0, 1.34);
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 64,
          background: stocks.fern.page,
          color: ink,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 470, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ fontFamily: "Anybody 62.5", fontSize: 112, fontWeight: 800, lineHeight: 0.95 }}>{site.name}</div>
          <div style={{ fontFamily: "Anybody 125", marginTop: 28, fontSize: 26, fontWeight: 500, lineHeight: 1.3 }}>
            {site.tagline}
          </div>
        </div>
        <svg viewBox={viewBox} width={600} height={500}>
          <path d={shadow} fill={ink} opacity={0.3} transform="translate(0.16 0.22)" />
          {facets.map((facet, order) => (
            <polygon key={`${order}:${facet.points}`} points={facet.points} fill={facet.fill} stroke={facet.fill} strokeWidth={0.01} />
          ))}
        </svg>
      </div>
    ),
    { ...size, fonts },
  );
}
