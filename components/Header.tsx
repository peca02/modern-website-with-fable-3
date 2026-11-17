import { JumpLink } from "@/components/JumpLink";
import { SoundToggle } from "@/components/SoundToggle";
import { navigation, site } from "@/lib/content";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-baseline justify-between px-4 pt-6 text-backdrop-ink md:px-8">
      <JumpLink href="#top" to="start" label={navigation.home}>
        {site.name}
      </JumpLink>
      <nav aria-label={navigation.label} className="flex items-baseline gap-6">
        <SoundToggle label={navigation.sound} />
        <JumpLink href="#contact" to="end">
          {navigation.contact}
        </JumpLink>
      </nav>
    </header>
  );
}
