import { drawChapter } from "@/lib/drawing";

type SheetDrawingProps = { index: number; className?: string };

/**
 * The drawn stand-in for the 3D sheet: the chapter's held pose as flat facets, rendered on the server.
 * It shows only without JavaScript, without WebGL, or while the WebGL context is lost.
 */
export function SheetDrawing({ index, className = "" }: SheetDrawingProps) {
  const { viewBox, facets, shadow, ink } = drawChapter(index);
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      className={`hidden max-h-64 w-full wide:max-h-none noscript:block scene-off:block ${className}`}
    >
      <path d={shadow} fill={ink} opacity={0.3} transform="translate(0.16 0.22)" />
      {facets.map((facet, order) => (
        <polygon
          key={`${order}:${facet.points}`}
          points={facet.points}
          fill={facet.fill}
          stroke={facet.fill}
          strokeWidth={0.008}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
