import { Chapter } from "@/components/Chapter";
import { chapters } from "@/lib/beats";
import { stayCreased } from "@/lib/content";

const stepAt = ["0.16", "0.3", "0.44", "0.58"];

export function StayCreased() {
  const { id, stock } = chapters[3];
  return (
    <Chapter id={id} stock={stock} side="right" {...stayCreased}>
      <p className="type-title max-w-prose" data-reveal data-at="0.04">
        {stayCreased.body}
      </p>
      <h3 className="type-label" data-reveal data-at="0.12">
        {stayCreased.processTitle}
      </h3>
      <ol className="flex max-w-prose flex-col gap-2 wide:gap-3">
        {stayCreased.process.map((step, index) => (
          <li key={step.name} className="grid grid-cols-[2rem_1fr]" data-reveal="block" data-at={stepAt[index]}>
            <span className="type-label pt-1" aria-hidden>
              {index + 1}
            </span>
            <p>
              <strong className="font-semibold">{step.name}.</strong> {step.text}
            </p>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}
