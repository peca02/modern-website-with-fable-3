import { Chapter } from "@/components/Chapter";
import { PackControl } from "@/components/PackControl";
import { chapters } from "@/lib/beats";
import { packSmall } from "@/lib/content";

export function PackSmall() {
  const { id, stock } = chapters[1];
  return (
    <Chapter id={id} stock={stock} side="right" {...packSmall}>
      <p className="max-w-prose" data-reveal data-at="0.03">
        {packSmall.body}
      </p>
      <div data-reveal="block" data-at="0.08">
        <PackControl
          headlineId={`${id}-title`}
          label={packSmall.control}
          open={packSmall.open}
          packed={packSmall.packed}
          readout={packSmall.readout}
          flat={packSmall.flat}
        />
      </div>
    </Chapter>
  );
}
