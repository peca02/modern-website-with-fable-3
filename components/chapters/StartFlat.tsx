import { Chapter } from "@/components/Chapter";
import { chapters } from "@/lib/beats";
import { startFlat } from "@/lib/content";

export function StartFlat() {
  const { id, stock } = chapters[0];
  return (
    <Chapter id={id} stock={stock} side="left" hero {...startFlat}>
      <p className="type-title max-w-prose" data-reveal data-at="-1">
        {startFlat.lead}
      </p>
      <p className="max-w-prose" data-reveal data-at="0.06">
        {startFlat.body}
      </p>
      <p className="type-label" data-reveal data-at="-1">
        {startFlat.hint}
      </p>
    </Chapter>
  );
}
