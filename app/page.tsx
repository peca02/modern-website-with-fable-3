import { SceneLoader } from "@/components/SceneLoader";
import { TrialMotion } from "@/components/TrialMotion";

export default function Page() {
  return (
    <>
      <SceneLoader />
      <TrialMotion>
        <main className="relative grid min-h-[200vh] grid-cols-4 gap-4 p-8 md:grid-cols-12">
          <h1 className="col-span-full font-display text-7xl font-black" data-split>
            Start with one sheet.
          </h1>
        </main>
      </TrialMotion>
    </>
  );
}
