# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.

## Done (phases 0, 1, 2a and 2b)

- Stack installed with exact versions (`CLAUDE.md` has versions and the two downgrade reasons).
- `docs/ART_DIRECTION.md`: the approved direction, fold models, signature moments, what must not repeat.
- `app/globals.css`: five stocks (`stock-*` utilities set `--page` and `--ink`), `type-*` classes, `page-grid`, `halo`, variants `wide`, `fine`, `scene-live`, `loaded`, `motion-full`. Scene mirror: `lib/palette.ts`.
- `app/layout.tsx`: Anybody (animate width through the `--wdth` CSS variable) and Literata.
- `lib/store.ts` (+ `types/store.ts`), `lib/beats.ts`, `lib/quality.ts` (four tiers; shadow map 512 / 1024 on tiers 2 / 3), `lib/gsap.ts`, `lib/content.ts` (temporary copy).
- `components/ScrollRig.tsx` (ScrollSmoother, one ScrollTrigger per `[data-chapter]`, writes `store.story`, cross-fades `--backdrop`), `components/Chapter.tsx`, `components/SceneLoader.tsx`, `app/page.tsx` with a temporary DOM.
- `lib/fold/types.ts`: `FoldMesh` (non-indexed flat arrays: positions, normals, flat uv, crease distances, valley flags, layers, named anchors) and `FoldModel` (`pose(drivers)`, `extent`).
- `lib/fold/miura.ts`: closed-form Miura-ori, one driver, 10 x 6 cells, zigzag ends trimmed so the flat sheet is a true 3.4 x 2.4 rectangle. Valley flags are read from a half-folded pose. `extent` is the live bounding size (for the dimension readout).
- `lib/fold/triangles.ts`: shared plumbing for triangle models (orients faces, finds neighbors, crease distances, `markValleys`, `place`, `cornerOf`). `lib/fold/yoshimura.ts`: the vault, one driver, 8 segments x 6 rows on the same 3.4 x 2.4 sheet; the crown is the low point locally because the sheet is turned over in chapter 3. Anchors: `crown`, `foot`, `mouth`.
- `lib/fold/sequence.ts`: simple-fold sequencer. `createSequence(spec)` plays the steps once in folded-flat coordinates (splits faces along each line, tracks isometry, layer and stack count per step), then `pose([progress])` with progress 0..steps rotates the movers of the current step. Folds inside one step move together; a fold with `angle` short of a half turn stays held in later steps; `only` limits a fold to part of the stack. Specs: `halvesSpec` (2 steps, folded away from the front) and `dartSpec` (5 steps, nose toward +x).
- `scene/SheetGeometry.ts` (wraps the model's arrays, `sync()`), `scene/PaperMaterial.ts` (two sides, wrap light, page-colored bounce, translucency by layers, valley occlusion, crease memory, fiber grain, `setPure` for the preloader handover, `setBacklight`, `setGhosts` (crease lines of Miura and vault drawn from flat coordinates with constants taken from the model specs); vertex stage mirrors three's shadow material so the built-in shadow map works), `scene/Page.tsx` (key light + invisible page plane with `ShadowMaterial`), `scene/ContactMaterial.ts` (ink patch for tiers 0-1), `scene/stock.ts` (page / ink / reverse color at a story position), `scene/Sheet.tsx` (one model + geometry per pattern, swaps the mesh's geometry by `shot.pattern`, writes `store.anchors` and hides those of inactive patterns).
- `scene/direction.ts`: `Shot` has `spin`, `lift`, `pattern` (`miura`, `vault`, `halves`, `dart`), `fold` (driver of the current pattern), `memory`, `ghostMiura`, `ghostVault`, `backlight`, `flight`; tracks for all five chapters with wide and portrait values; `direct()` takes `controls.pack` (acts only inside chapter 2). The Miura fold is flat by story 1.98, the turn runs 2.0-2.24 and the pattern swaps at `turn` 0.5. Halves run 3.14-3.9 (pattern from 3.06), the dart 4.2-4.84 (pattern from 3.95), a short glide 4.88-5.
- `scripts/serve.sh` (kill, build, serve, wait), `scripts/shots.mjs <chapter 0-4> <width> [local 0-1] [query]` writes `shots/ch<chapter>-<width>-<local>.png`.

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; the route is static.
- Miura and vault models: every triangle edge keeps its flat length to about 1e-7 across the fold range. Sequencer: total area stays 8.16 at every step and positions are continuous across step boundaries (ad-hoc node checks).
- Headless Chromium screenshots: chapter 1 at 1440 (tier 3 and tier 1) and at 375; chapter 2 packed at 1440; chapter 2 mid-fold at 375; chapter 3 standing vault at 1440 and 375; chapter 4 backlit quarters with ghost creases at 1440 and the half fold at 375; chapter 5 finished dart at 1440. Shadow map, contact patch, two-sided color and lens shift all draw; no console errors.
- Not verified: chapter 5 at 375 (the temporary DOM is too short there for scroll to reach it), folds in motion between the shot poses, the turn-over and the pattern swaps in motion (only end poses were shot), the fully packed pose at 375, the last portrait `shiftY` change in chapter 2 (built, not re-shot), the pack control (no DOM control yet), anchors on screen, real frame rate, real phones, Safari, sound, reduced motion, no-JS and no-WebGL paths, whether Tailwind's `noscript:` variant emits the section background.

## Roadmap (one phase per session; no agents planned, at most one reviewer at the end)

The last column is the only part of `PROMPT.md` a session reads. Everything else it needs is in the three handover files.

| Session | Phase | Content | Done when | PROMPT.md |
| --- | --- | --- | --- | --- |
| 3 | 3 | Full copy, chapters as semantic HTML, pins (`data-pinned`), hinge reveals (SplitText after fonts), pack range control, tags on anchors, header, scroll restore after refresh | The story reads and moves; text legible at every scroll position | §6.1, §9.3, §9.5 |
| 4 | 4 | Preloader + `lib/loadClock.ts` with a time limit, dog-ear cursor, page-turn fold, sound, SVG fallback (no WebGL, lost context, no JS), `app/opengraph-image.tsx`, `app/icon.tsx` | All signature moments work; survives no WebGL and no JS | §9.6, §9.7 |
| 5 | 5 | Phone, reduced motion, `scripts/flow.mjs`, shots at 375/768/1024/1440/1920, pull request, Serbian report | §12 and §13 complete | §12, §13 |

## Next: phase 3

1. Full copy in `lib/content.ts`, chapters as semantic HTML in server components, header.
2. Pins with the lengths in `lib/beats.ts` so `store.story` covers 0-5 at every width (today the temporary DOM is too short on phones), `data-pinned`, scroll restore after refresh.
3. Hinge reveals (SplitText after fonts), reduced-motion variant through `gsap.matchMedia()`.
4. Pack range control: writes `store.controls.pack` and the headline's `--wdth`; readout from `model.extent` (the scene can write it into the store).
5. Tags on `store.anchors` in chapter 3 (`crown`, `foot`, `mouth`).
6. Lay text and scene out together: wide shots put the sheet right in chapters 1, 3, 5 and left in 2, 4; portrait puts it in the lower half. Re-shoot every chapter once the DOM is real and adjust `scene/direction.ts`.
7. Left from phase 2: flecks were not tried (decide from a screenshot or drop them); the vault shows only its outside; `memory` is a constant 1; the dart only glides 1.4 units, the contact CTA should throw it (a control value in the store plus a time-based track).

## Design notes that exist nowhere else

- The sheet is turned over (reverse out) from story 2.24 to 3.9, so chapter 4's halves fold away from the model's front, which is toward the camera. Folding toward the page would cut through the shadow plane.
- The pattern swap happens when the sheet is edge-on during the turn (`turn` = 0.5). The reverse color changes only while that side is hidden.
- Preloader handover: the overlay has the sheet-face color, and the material needs a uniform that mixes lit color to the pure token color, so the 3D sheet can replace the overlay without a cut.
- The pack control writes `store.controls.pack` and the headline's `--wdth`; the dimension readout is computed from the fold model and written with `textContent`.
- Story position is `chapter index + local progress`, so direction keys stay stable when pin lengths change.
- With JavaScript the page color is one fixed backdrop (`--backdrop`); sections paint their own background only under `noscript:`.
- The intro (sheet full-screen, then receding) is time-based and belongs to the preloader (phase 4), not to scroll: at story 0 the sheet is already receded.
- The shadow plane is at z = 0 parallel to the screen, the sheet floats at `lift`, and all tilt is on the sheet, never on the camera.
- Canvas is `flat` (no tone mapping) so token colors are exact. `shadows` is fixed from the initial tier; dropping below tier 2 turns `castShadow` off and shows the contact patch.
- Ink colors were adjusted from the plan so every ink reaches about 7:1 on its page.

## Cloud notes

- Use `scripts/serve.sh` before screenshots; a stale server returns 500 for new chunks. One build plus one shot takes about 90 seconds.
- If the permission classifier blocks installs or commits, stop and ask the user to allow them explicitly in chat.

## Open questions

- None for the user.
