# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.

## Done (phases 0-4)

- Stack, tokens, fonts, store, quality tiers, gsap setup: see `CLAUDE.md` and the files themselves (`app/globals.css`, `lib/*`). Variants: `pinned`, `loaded`, `scene-live`, `scene-off` (`data-scene` is `none` or `lost`), `fine`, `wide`.
- Fold models in `lib/fold/`, scene in `scene/` (`Sheet`, `PaperMaterial`, `Page`, `ContactMaterial`, `stock`, `Director`, `Stage`), timing in `scene/direction.ts`.
- `lib/content.ts` (all copy; placeholders: `credit.name`, `credit.href`, `site.url`), `lib/beats.ts` (chapter lengths, holds, `pageTurnSpan`, `tagsWindow`, `packWidth`).
- DOM: `Chapter.tsx` + `components/chapters/*`, `Header`, `Footer`, `ScrollRig` (smoother, pins, `store.story`, scroll restore, page turn), `Reveals` (hinges), `PackControl`, `Tags`, `JumpLink`, `ThrowLink`.
- Phase 4:
  - Preloader: `lib/loadClock.ts` (phases fonts, code, context, shaders, frame; `skipScene()` without WebGL), `components/Preloader.tsx` (server-rendered overlay in the sheet color, steps light up, folds shut, sets `data-loaded` and `store.load`; 12 s limit). `Reveals` waits for `store.load.at`. Intro: `introAt()` and the `intro`/`aspect` arguments of `direct()`; the sheet covers the view in its pure color (`shot.pure`) and recedes over 1.8 s. Skipped under reduced motion and when the page loads scrolled past story 0.5.
  - `components/Cursor.tsx`: dog-ear on its own fixed layer, fine pointers only, unfolds over `a, button, input, label, summary`.
  - Page turn: `components/PageTurn.tsx` (two fixed layers) + `turnShapes()` in `ScrollRig` write `--turn`, `--turn-ink`, `--turn-page`, `--turn-flap`; `--backdrop` stays the current page, `--backdrop-ink` flips at half way.
  - Sound: `lib/audio.ts` (room tone per chapter, rustle from `store.velocity` and fold rate, crease bursts on fold steps and on the pack control), `components/SoundToggle.tsx` in the header creates the context on the first click; suspended when off or hidden. The scene writes `store.sheet.crease` and `store.sheet.flight`.
  - Fallback: `lib/drawing.ts` projects the fold models (pose = the chapter's `hold`) into flat facets; `components/SheetDrawing.tsx` renders them in every chapter, shown only under `noscript:` or `scene-off:`. `Stage` detects WebGL 2 and listens for context loss.
  - `app/opengraph-image.tsx` and `app/icon.tsx` use the same drawing code; `metadataBase` comes from `site.url`.
  - The shadow fades while the dart flies out (`ShadeMaterial` in `scene/Page.tsx`).
- Scripts: `serve.sh`, `shots.mjs`, `sheet.mjs`, `checks.mjs`, `intro.mjs` (preloader and handover frames), `fallback.mjs <nojs|nowebgl>`, `cursor.mjs`.

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; `/`, `/icon`, `/opengraph-image` are static.
- `node scripts/checks.mjs` passes (19 checks): the phase 3 list plus preloader covers and lets go with 5 phases done, sound toggle switches, dog-ear unfolds over a link, page turn writes fold shapes, no WebGL releases the preloader and shows the drawing.
- Seen in screenshots at 1280/1440: preloader and the frames after it, two page-turn moments, the no-JavaScript page (all five drawings), the no-WebGL chapter 3, the OG image, the cursor folded and unfolded.
- Not verified: the intro in motion (the cloud draws about one frame a second, so the receding was never seen), the sound itself (only the toggle state), a lost WebGL context, the 12 s stuck-load release, the cursor in motion, the icon by eye, everything at 375 / 768 / 1024 / 1920 for the phase 4 features, plus the phase 3 list: short wide viewports, folds and reveals in motion, real frame rate, real phones, Safari, screen reader.

## Known weak spots

- The OG image sets its text in the default font of `next/og` (Anybody is only reachable through next/font).
- Without WebGL at 720 px height chapter 3's copy (it then shows the tag facts too) is taller than the pinned screen and is cut at the bottom.
- The page-turn mirror is computed in shares of the viewport, so the flap is not a true reflection on non-square screens.
- The vault shows only its outside; `memory` is a constant 1; flecks were dropped.

## Next: phase 5

- Text over the scene legible at every scroll position; the phone gets the same site on a lower tier with its own portrait framing.
- `scripts/flow.mjs` (grow it from `scripts/checks.mjs`) walks through: preloader, keyboard, controls, sound toggle, refresh mid-page, no WebGL, lost context, stuck load, reduced motion, no JavaScript. Screenshots at 375, 768, 1024, 1440 and 1920.
- One pull request against the default branch, text in English.
- A report in Serbian with four parts: done, verified, not verified, weaker than wanted. Plus what the user does by hand: fill the placeholders in `lib/content.ts` (`credit`, `site.url`), import the repository into Vercel.

## Design notes that exist nowhere else

- ScrollTrigger sorts triggers by start. A pin and the chapter that contains it start at the same place, so pins carry `refreshPriority: 1`; without it chapter 1 was measured without its pin spacing.
- ScrollSmoother scrolls to any focused element that is off screen, using its place before pinning. That is wanted for Tab, but not for the targets of header links: `onFocusIn` ignores elements with `tabindex="-1"` (`#top`, `#contact`), and `JumpLink` scrolls to an end of the page itself.
- In the cloud GSAP time runs slow (lag smoothing at about one frame per second), so a script must wait for state or for scroll to stop, never for seconds.
- Fixed layers (canvas, header, tags, later the cursor) stay outside the ScrollSmoother wrapper.
- The sheet is turned over (reverse out) from story 2.24 to 3.9, so chapter 4's halves fold away from the model's front, which is toward the camera.
- The pattern swap happens when the sheet is edge-on during the turn (`turn` = 0.5). The reverse color changes only while that side is hidden.
- Story position is `chapter index + local progress`, so direction keys stay stable when pin lengths change. Under reduced motion the story is `index + hold` of the chapter covering the middle of the screen.
- With JavaScript the page color is one fixed backdrop (`--backdrop`); sections paint their own background only under `noscript:`.
- The shadow plane is at z = 0 parallel to the screen, the sheet floats at `lift`, and all tilt is on the sheet, never on the camera.
- Canvas is `flat` (no tone mapping) so token colors are exact. `shadows` is fixed from the initial tier.
- Headings carry no halo (it smudges on the white sheet); body copy does.

## Cloud notes

- Use `scripts/serve.sh` before screenshots or checks. One build plus one shot takes about 90 seconds; `checks.mjs` about 2 minutes.
- An interrupted `npm ci` leaves a broken `node_modules` (missing type exports, wrong eslint): run `npm ci` again.
- If the permission classifier blocks installs or commits, stop and ask the user to allow them explicitly in chat.

## Open questions

- None for the user. (The placeholders in `lib/content.ts` are theirs to fill in.)
