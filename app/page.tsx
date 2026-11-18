import { LetGo } from "@/components/chapters/LetGo";
import { PackSmall } from "@/components/chapters/PackSmall";
import { StandUp } from "@/components/chapters/StandUp";
import { StartFlat } from "@/components/chapters/StartFlat";
import { StayCreased } from "@/components/chapters/StayCreased";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeadlineWidth } from "@/components/HeadlineWidth";
import { PageTurn } from "@/components/PageTurn";
import { Preloader } from "@/components/Preloader";
import { Reveals } from "@/components/Reveals";
import { SceneLoader } from "@/components/SceneLoader";
import { ScrollRig } from "@/components/ScrollRig";
import { Tags } from "@/components/Tags";
import { chapters } from "@/lib/beats";
import { preloader, standUp } from "@/lib/content";

export default function Page() {
  return (
    <>
      <PageTurn />
      <SceneLoader />
      <Header />
      <ScrollRig>
        <main id="top" tabIndex={-1} className="outline-none">
          <StartFlat />
          <PackSmall />
          <StandUp />
          <StayCreased />
          <LetGo />
        </main>
        <Footer />
      </ScrollRig>
      <Tags chapter={chapters[2].id} tags={standUp.tags} />
      <Reveals />
      <HeadlineWidth />
      <Cursor />
      <Preloader title={preloader.title} steps={preloader.steps} />
    </>
  );
}
