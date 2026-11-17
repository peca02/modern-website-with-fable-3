import { Chapter } from "@/components/Chapter";
import { chapters } from "@/lib/beats";
import { standUp } from "@/lib/content";

const projectAt = ["0.26", "0.4", "0.54"];

export function StandUp() {
  const { id, stock } = chapters[2];
  return (
    <Chapter
      id={id}
      stock={stock}
      side="left"
      {...standUp}
      aside={
        // With a live scene the same facts are shown as tags that follow the vault (components/Tags.tsx).
        <div className="flex flex-col gap-2 scene-live:sr-only">
          <h3 className="type-label">{standUp.tagsTitle}</h3>
          <ul className="flex flex-wrap gap-2">
            {standUp.tags.map((tag) => (
              <li key={tag.anchor} className="type-label paper-tag">
                {tag.label}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <p className="max-w-prose" data-reveal data-at="0.04">
        {standUp.body}
      </p>
      <h3 className="type-label" data-reveal data-at="0.2">
        {standUp.projectsTitle}
      </h3>
      <ul className="flex max-w-prose flex-col gap-2 wide:gap-3">
        {standUp.projects.map((project, index) => (
          <li key={project.name} data-reveal="block" data-at={projectAt[index]}>
            <p>
              <strong className="font-semibold">{project.name}.</strong> {project.text}
            </p>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
