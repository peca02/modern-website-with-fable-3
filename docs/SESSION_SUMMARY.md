# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.

## Done (phases 0 and 1)

- Stack installed with exact versions and proven by a minimal build (`CLAUDE.md` has versions and the two downgrade reasons).
- `docs/ART_DIRECTION.md`: the approved direction, fold models, signature moments, what must not repeat.
- `app/globals.css`: five stocks (`stock-*` utilities set `--page` and `--ink`), `type-*` classes, `page-grid`, `halo`, variants `wide`, `fine`, `scene-live`, `loaded`, `motion-full`. Scene mirror: `lib/palette.ts`.
- `app/layout.tsx`: Anybody (animate width through the `--wdth` CSS variable) and Literata.
- `lib/store.ts` (+ `types/store.ts`), `lib/beats.ts` (chapters, stock, pin lengths, `pageTurnSpan`), `lib/quality.ts` (four tiers), `lib/gsap.ts` (plugins, eases `crease`/`spring`, durations, media queries), `lib/content.ts` (temporary copy, credit placeholders).
- `components/ScrollRig.tsx`: ScrollSmoother (full motion only), one ScrollTrigger per `[data-chapter]`, writes `store.story`, velocity, pointer, viewport; cross-fades `--backdrop` and `--backdrop-ink` on `<html>` over the last quarter of each chapter.
- `components/Chapter.tsx` (server), `components/SceneLoader.tsx` (`next/dynamic`, `ssr: false`), `app/page.tsx` with a temporary DOM.
- `scene/Stage.tsx` (Canvas, PerformanceMonitor lowers the tier, `?tier=N` forces one), `scene/Director.tsx` (lens shift through `setViewOffset`; sets `data-scene="live"` on `<html>` after two frames), `scene/direction.ts` (`sample`, `hinge`, `direct()`), `scene/PaperMaterial.ts` and `scene/Sheet.tsx` (placeholder flat sheet).
- `scripts/shots.mjs <chapter 0-4> <width> [local 0-1] [query]`: waits for `data-scene="live"`, writes `shots/` (git-ignored).

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; the route is static.
- Production build in headless Chromium (SwiftShader WebGL2): chapter 1 at 1440 and chapter 3 at 375. Canvas draws, lens shift works wide and portrait, the backdrop follows the chapter, the sheet turns over, no console errors.
- Not verified: real frame rate, real phones, Safari, sound, reduced motion, no-JS and no-WebGL paths, whether Tailwind's `noscript:` variant emits the section background.

## Roadmap (one phase per session; no agents planned, at most one reviewer at the end)

| Session | Phase | Content | Done when | PROMPT.md |
| --- | --- | --- | --- | --- |
| 2 | 2a | `lib/fold/` kernel, Miura-ori, real paper material, shadows, direction and framing for chapters 1-2 | Chapters 1-2 look finished, wide and portrait | §9.4, §9.7, §10 |
| 3 | 2b | Yoshimura vault, simple-fold sequencer (halves, dart), turn-over swap, flecks decision, direction for chapters 3-5 | Every state and shot exists, wide and portrait | §10 |
| 4 | 3 | Full copy, chapters as semantic HTML, pins (`data-pinned`), hinge reveals (SplitText after fonts), pack range control, tags on anchors, header, scroll restore after refresh | The story reads and moves; text legible at every scroll position | §6.1, §9.3, §9.5 |
| 5 | 4 | Preloader + `lib/loadClock.ts` with a time limit, dog-ear cursor, page-turn fold, sound, SVG fallback (no WebGL, lost context, no JS), `app/opengraph-image.tsx`, `app/icon.tsx` | All signature moments work; survives no WebGL and no JS | §9.6, §9.7 |
| 6 | 5 | Phone, reduced motion, `scripts/flow.mjs`, shots at 375/768/1024/1440/1920, pull request, Serbian report | §12 and §13 complete | §12, §13 |

## Next: phase 2a

1. `lib/fold/` (no three imports): shared mesh types (flat arrays), Miura-ori with one driver, anchors from the same vertices.
2. Replace the placeholder in `scene/Sheet.tsx`: non-indexed geometry updated from the CPU each frame, flat faces, per-face attributes (side, layer count, crease distance).
3. Rewrite `scene/PaperMaterial.ts`: two sides, wrap light, translucency darker with stacked layers, fiber grain, crease memory.
4. Shadows: geometry is on the CPU, so three's built-in shadow map works with its default depth material. The paper `ShaderMaterial` needs `lights: true` and the shadow chunks; if they fight three 0.187, use an own depth pass. Tiers 0-1: fold-angle shading plus an alpha contact shadow.
5. Direction for chapters 1-2 in `scene/direction.ts`, with wide and portrait values per shot. At 375 the placeholder sheet overflows the viewport.

## Design notes that exist nowhere else

- Sequencer: split faces along each fold line in folded-flat coordinates; each face keeps the steps in which it moves; kinematics use exact 180 degrees and a per-layer epsilon offset along the normal; steps run strictly one after another.
- The pattern swap happens when the sheet is edge-on during the turn (`turn` = 0.5). The reverse color changes only while that side is hidden.
- Preloader handover: the overlay has the sheet-face color, and the material needs a uniform that mixes lit color to the pure token color, so the 3D sheet can replace the overlay without a cut.
- The pack control writes `store.controls.pack` and the headline's `--wdth`; the dimension readout is computed from the fold model and written with `textContent`.
- Story position is `chapter index + local progress`, so direction keys stay stable when pin lengths change.
- With JavaScript the page color is one fixed backdrop (`--backdrop`); sections paint their own background only under `noscript:`.
- Ink colors were adjusted from the plan so every ink reaches about 7:1 on its page.

## Cloud notes

- Kill any old server before serving a new build (`pkill -f next-server`); a stale one returns 500 for new chunks.
- If the permission classifier blocks installs or commits, stop and ask the user to allow them explicitly in chat.

## Open questions

- None for the user.
