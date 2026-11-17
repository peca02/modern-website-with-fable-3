import { ImageResponse } from "next/og";
import { site } from "@/lib/content";
import { drawChapter } from "@/lib/drawing";
import { stocks } from "@/lib/palette";

export const alt = `${site.name}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The half-packed Miura sheet on the first page's stock, drawn from the fold model.
export default function OpengraphImage() {
  const { viewBox, facets, shadow, ink } = drawChapter(0, 1.34);
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
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>{site.name}</div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.3 }}>{site.tagline}</div>
        </div>
        <svg viewBox={viewBox} width={600} height={500}>
          <path d={shadow} fill={ink} opacity={0.3} transform="translate(0.16 0.22)" />
          {facets.map((facet, order) => (
            <polygon key={`${order}:${facet.points}`} points={facet.points} fill={facet.fill} stroke={facet.fill} strokeWidth={0.01} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
