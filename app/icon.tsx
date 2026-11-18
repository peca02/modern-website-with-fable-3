import { ImageResponse } from "next/og";
import { sheetFace, stocks } from "@/lib/palette";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// One sheet with one folded corner; the fold shows the reverse.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: stocks.fern.page }}>
        <svg viewBox="0 0 64 64" width={64} height={64}>
          <polygon points="12,8 52,8 52,34 30,56 12,56" fill={sheetFace} />
          <polygon points="52,34 30,34 30,56" fill={stocks.fern.ink} />
        </svg>
      </div>
    ),
    size,
  );
}
