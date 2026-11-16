# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.

## Done (phases 0 and 1)

- Plan approved by the user as presented. Direction written to `docs/ART_DIRECTION.md`.
- Stack installed with exact versions and proven by a minimal build (versions and the two downgrade reasons are in `CLAUDE.md`).
- Tokens and type classes: `app/globals.css` (five stocks with `stock-*` utilities, `type-*`, `page-grid`, `halo`, variants `wide`, `fine`, `scene-live`, `loaded`, `motion-full`). Mirror for the scene: `lib/palette.ts`.
- Fonts: Anybody (`wdth` axis, animated through the `--wdth` CSS variable) and Literata, in `app/layout.tsx`.
- `lib/store.ts` (+ `types/store.ts`), `lib/beats.ts` (chapters, stock per chapter, pin lengths, `pageTurnSpan`), `lib/quality.ts` (four tiers, device pick), `lib/gsap.ts` (plugins, eases `crease`/`spring`, durations, media queries), `lib/content.ts` (temporary copy, credit placeholders).
- `components/ScrollRig.tsx`: ScrollSmoother (full motion only), one ScrollTrigger per `[data-chapter]`, writes `store.story` (chapter index + local progress), velocity, pointer, viewport; cross-fades `--backdrop` and `--backdrop-ink` on `<html>` over the last quarter of each chapter.
- `components/Chapter.tsx` (server), `components/SceneLoader.tsx` (`next/dynamic`, `ssr: false`), `app/page.tsx` with a temporary DOM.
- Scene: `scene/Stage.tsx` (Canvas, PerformanceMonitor lowers the tier, `?tier=N` forces one), `scene/Director.tsx` (lens shift through `setViewOffset`, sets `data-scene="live"` on `<html>` after two frames), `scene/direction.ts` (keyframe tracks, `sample`, `hinge` ease, `direct()`), `scene/PaperMaterial.ts` and `scene/Sheet.tsx` (placeholder flat sheet, two-sided colors).
- `scripts/shots.mjs <chapter 0-4> <width> [local 0-1] [query]`: waits for `data-scene="live"`, writes `shots/` (git-ignored).

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass. The route is static.
- Production build in headless Chromium (SwiftShader WebGL2): chapter 1 at 1440 and chapter 3 at 375. Canvas draws, lens shift works in wide and portrait, the backdrop color follows the chapter, the sheet turns to its reverse, no console errors.

## Not verified yet

- Real frame rate, real phones, Safari, reduced motion, no-JS and no-WebGL paths (phases 4 and 5).
- Whether Tailwind's built-in `noscript:` variant emits the section background (check the CSS when the fallback is built).

## Next: phase 2a (read PROMPT.md §9.4, §9.7, §10)

1. `lib/fold/` (no three imports): shared mesh types, Miura-ori with one driver, anchors from the same vertices.
2. Replace the placeholder in `scene/Sheet.tsx`: non-indexed geometry updated from the CPU each frame, flat faces, per-face attributes.
3. Rewrite `scene/PaperMaterial.ts`: two sides, wrap light, translucency, fiber grain, crease memory; one shadow map on tiers 2-3, fold-angle shading and an alpha contact shadow below.
4. Direction for chapters 1-2 in `scene/direction.ts`, wide and portrait framing (on a 375 wide screen the sheet currently overflows the viewport).
5. Phase 2b after that: Yoshimura vault, simple-fold sequencer, dart, all shots.

## Decisions made without asking

- Ink colors were darkened and fern, pulp and lilac adjusted slightly from the plan so that every ink reaches 7:1 on its page (values in `docs/ART_DIRECTION.md`).
- Playwright is a pinned dev dependency (1.63.0, matches the pre-installed Chromium 1243) so ESM scripts can import it.
- Story position is `chapter index + local progress`, not a single 0-1 page progress, so direction keys stay stable when pin lengths change.
- With JavaScript the page color is one fixed backdrop (`--backdrop`); sections paint their own background only under `noscript:`.

## Open questions

- None for the user.

## Cloud notes

- Kill any old `next start` (`pkill -f next-server`) before serving a new build; a stale server returns 500 for new chunks.
- The permission classifier blocked installs and commits until the user approved them explicitly in chat.
