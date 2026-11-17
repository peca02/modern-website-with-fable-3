# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.

## Done (phases 0, 1, 2a and the first half of 2b)

- Stack installed with exact versions (`CLAUDE.md` has versions and the two downgrade reasons).
- `docs/ART_DIRECTION.md`: the approved direction, fold models, signature moments, what must not repeat.
- `app/globals.css`: five stocks (`stock-*` utilities set `--page` and `--ink`), `type-*` classes, `page-grid`, `halo`, variants `wide`, `fine`, `scene-live`, `loaded`, `motion-full`. Scene mirror: `lib/palette.ts`.
- `app/layout.tsx`: Anybody (animate width through the `--wdth` CSS variable) and Literata.
- `lib/store.ts` (+ `types/store.ts`), `lib/beats.ts`, `lib/quality.ts` (four tiers; shadow map 512 / 1024 on tiers 2 / 3), `lib/gsap.ts`, `lib/content.ts` (temporary copy).
- `components/ScrollRig.tsx` (ScrollSmoother, one ScrollTrigger per `[data-chapter]`, writes `store.story`, cross-fades `--backdrop`), `components/Chapter.tsx`, `components/SceneLoader.tsx`, `app/page.tsx` with a temporary DOM.
- `lib/fold/types.ts`: `FoldMesh` (non-indexed flat arrays: positions, normals, flat uv, crease distances, valley flags, layers, named anchors) and `FoldModel` (`pose(drivers)`, `extent`).
- `lib/fold/miura.ts`: closed-form Miura-ori, one driver, 10 x 6 cells, zigzag ends trimmed so the flat sheet is a true 3.4 x 2.4 rectangle. Valley flags are read from a half-folded pose. `extent` is the live bounding size (for the dimension readout).
- `lib/fold/triangles.ts`: shared plumbing for triangle models (orients faces, finds neighbors, crease distances, `markValleys`, `place`, `cornerOf`). `lib/fold/yoshimura.ts`: the vault, one driver, 8 segments x 6 rows on the same 3.4 x 2.4 sheet; the crown is the low point locally because the sheet is turned over in chapter 3. Anchors: `crown`, `foot`, `mouth`.
- `scene/SheetGeometry.ts` (wraps the model's arrays, `sync()`), `scene/PaperMaterial.ts` (two sides, wrap light, page-colored bounce, translucency by layers, valley occlusion, crease memory, fiber grain, `setPure` for the preloader handover; vertex stage mirrors three's shadow material so the built-in shadow map works), `scene/Page.tsx` (key light + invisible page plane with `ShadowMaterial`), `scene/ContactMaterial.ts` (ink patch for tiers 0-1), `scene/stock.ts` (page / ink / reverse color at a story position), `scene/Sheet.tsx` (one model + geometry per pattern, swaps the mesh's geometry by `shot.pattern`, writes `store.anchors` and hides those of inactive patterns).
- `scene/direction.ts`: `Shot` has `spin`, `lift`, `pattern`, `fold` (driver of the current pattern), `memory`; tracks for chapters 1-3 with wide and portrait values; `direct()` takes `controls.pack` (acts only inside chapter 2). The Miura fold is flat by story 1.98, the turn runs 2.0-2.24 and the pattern swaps at `turn` 0.5. Values after story 3.1 are placeholders.
- `scripts/serve.sh` (kill, build, serve, wait), `scripts/shots.mjs <chapter 0-4> <width> [local 0-1] [query]` writes `shots/ch<chapter>-<width>-<local>.png`.

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; the route is static.
- Miura and vault models: every triangle edge keeps its flat length to about 1e-7 across the fold range (ad-hoc node check).
- Headless Chromium screenshots: chapter 1 at 1440 (tier 3 and tier 1) and at 375; chapter 2 packed at 1440; chapter 2 mid-fold at 375; chapter 3 standing vault at 1440 and 375. Shadow map, contact patch, two-sided color and lens shift all draw; no console errors.
- Not verified: the turn-over and the pattern swap in motion (only the end pose was shot), the fully packed pose at 375, the last portrait `shiftY` change in chapter 2 (built, not re-shot), the pack control (no DOM control yet), anchors on screen, real frame rate, real phones, Safari, sound, reduced motion, no-JS and no-WebGL paths, whether Tailwind's `noscript:` variant emits the section background.

## Roadmap (one phase per session; no agents planned, at most one reviewer at the end)

The last column is the only part of `PROMPT.md` a session reads. Everything else it needs is in the three handover files.

| Session | Phase | Content | Done when | PROMPT.md |
| --- | --- | --- | --- | --- |
| 3 | 2b (rest) | Simple-fold sequencer (halves, dart), flecks decision, direction for chapters 4-5 | Every state and shot exists, wide and portrait | none (§10 is fully in `docs/ART_DIRECTION.md`) |
| 4 | 3 | Full copy, chapters as semantic HTML, pins (`data-pinned`), hinge reveals (SplitText after fonts), pack range control, tags on anchors, header, scroll restore after refresh | The story reads and moves; text legible at every scroll position | §6.1, §9.3, §9.5 |
| 5 | 4 | Preloader + `lib/loadClock.ts` with a time limit, dog-ear cursor, page-turn fold, sound, SVG fallback (no WebGL, lost context, no JS), `app/opengraph-image.tsx`, `app/icon.tsx` | All signature moments work; survives no WebGL and no JS | §9.6, §9.7 |
| 6 | 5 | Phone, reduced motion, `scripts/flow.mjs`, shots at 375/768/1024/1440/1920, pull request, Serbian report | §12 and §13 complete | §12, §13 |

## Next: the rest of phase 2b

1. `lib/fold/sequence.ts` implementing `FoldModel`: ordered simple folds (halves and quarters for chapter 4, five folds of the dart for chapter 5). It can build on `lib/fold/triangles.ts` or own its arrays; it must fill `layers` per face. See the sequencer note below.
2. Add the patterns to `Pattern` in `scene/direction.ts` and to `createPatterns()` in `scene/Sheet.tsx`. Swaps happen only while flat: the vault is flat again at story 3.04; chapter 4 to 5 turns back at 3.9-4.15.
3. Direction for chapters 4-5 (replace the placeholder keys after story 3.1), wide and portrait. Chapter 4 needs a backlit shot: raise the weight of the `through` term through a new material setter, do not move the light. `memory` should come from which patterns were folded before the story position.
4. The dart's flight at the end of chapter 5 is a transform of the sheet group driven by story position.
5. Decide on flecks from a screenshot.
6. The vault shot shows only the outside (reverse color); the white inside is not visible from this angle. Revisit only if chapter 3 feels flat once the DOM is in.
7. To see a story position, shoot with the `local` argument (at 1440 `local` is close to the chapter's progress); the temporary DOM does not map 1:1 to chapters yet (pins come in phase 3).

## Design notes that exist nowhere else

- Sequencer: split faces along each fold line in folded-flat coordinates; each face keeps the steps in which it moves; kinematics use exact 180 degrees and a per-layer epsilon offset along the normal; steps run strictly one after another.
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
