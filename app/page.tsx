import { Chapter } from "@/components/Chapter";
import { SceneLoader } from "@/components/SceneLoader";
import { ScrollRig } from "@/components/ScrollRig";
import { chapters } from "@/lib/beats";
import { chapterCopy, site } from "@/lib/content";

export default function Page() {
  return (
    <>
      <SceneLoader />
      <header className="page-grid fixed inset-x-0 top-0 z-20 pt-6 text-backdrop-ink">
        <p className="type-label col-span-full">{site.name}</p>
      </header>
      <ScrollRig>
        <main>
          {chapters.map((chapter, index) => {
            const copy = chapterCopy[index];
            if (!copy) return null;
            const Heading = index === 0 ? "h1" : "h2";
            return (
              <Chapter key={chapter.id} id={chapter.id} stock={chapter.stock} label={copy.name}>
                <p className="type-label col-span-full">
                  {copy.step}. {copy.name}
                </p>
                <Heading className="type-display halo col-span-full mt-4 md:col-span-7">
                  {copy.headline}
                </Heading>
                <div className="col-span-full h-svh" />
              </Chapter>
            );
          })}
        </main>
      </ScrollRig>
    </>
  );
}
