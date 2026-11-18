import { Chapter } from "@/components/Chapter";
import { ThrowLink } from "@/components/ThrowLink";
import { chapters } from "@/lib/beats";
import { letGo, site } from "@/lib/content";

export function LetGo() {
  const { id, stock } = chapters[4];
  return (
    <Chapter id={id} stock={stock} side="left" {...letGo}>
      <p className="type-title max-w-prose" data-reveal data-at="0.1">
        {letGo.body}
      </p>
      <div id="contact" tabIndex={-1} className="flex max-w-prose flex-col items-start gap-4 outline-none">
        <h3 className="type-title" data-reveal data-at="0.86">
          {letGo.contactTitle}
        </h3>
        <p data-reveal data-at="0.88">
          {letGo.contactBody}
        </p>
        <div data-reveal="block" data-at="0.9">
          <ThrowLink href={`mailto:${site.email}`} label={letGo.cta} detail={site.email} />
        </div>
      </div>
    </Chapter>
  );
}
