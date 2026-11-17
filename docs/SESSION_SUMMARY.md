# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.

## Done (phases 0, 1, 2a, 2b and 3)

- Stack, tokens, fonts, store, quality tiers, gsap setup: see `CLAUDE.md` and the files themselves (`app/globals.css`, `lib/*`). New in phase 3: variant `pinned` (`[data-pinned]` on `<html>`), `text-hero` / `text-display` are capped by viewport height, `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Fold models in `lib/fold/` (Miura, Yoshimura vault, simple-fold sequencer with `halvesSpec` and `dartSpec`), scene in `scene/` (`Sheet`, `PaperMaterial`, `Page`, `ContactMaterial`, `stock`, `Director`, `Stage`). Unchanged this session except: `Sheet` writes `store.sheet` (live Miura fold and bounding size) and passes the time since a throw; `stock.reverseAt` clamps at story 5.
- `lib/content.ts`: the full copy, one object per chapter plus `site`, `navigation`, `footer`, `credit` (two placeholders the user fills in).
- `lib/beats.ts`: `length` (chapter height in screens: 2, 4, 4, 4, 4; pinned for `length - 1`, then it scrolls away; the last one is pinned to the end of the page), `hold` (pose under reduced motion), `tagsWindow`, `packWidth`.
- `components/Chapter.tsx` (server): section + `[data-stage]` + label + heading; `side` puts the text on the side the sheet leaves free. Chapters in `components/chapters/*.tsx`. `Header.tsx`, `Footer.tsx` (lies over the foot of the last stage while pinned).
- `components/ScrollRig.tsx`: ScrollSmoother, one pin per stage (`refreshPriority: 1`, see notes), one span trigger per chapter, `store.story`, backdrop cross-fade, reduced-motion held poses, scroll restore after a reload (story position in `sessionStorage`).
- `components/Reveals.tsx`: hinge reveals. `[data-reveal]` splits into lines (SplitText, `autoSplit`), `[data-reveal="block"]` hinges as one piece; `data-at` is the local chapter progress where it opens; it closes when the chapter has scrolled a quarter screen away; focus inside forces it open.
- `components/PackControl.tsx` (range input writes `store.controls.pack`; headline `--wdth` and the readout follow `store.sheet`), `components/Tags.tsx` (fixed decorative chips on `store.anchors`, outside the smoother; the same facts are in the chapter markup, `scene-live:sr-only`), `components/JumpLink.tsx` (header links), `components/ThrowLink.tsx` (mailto CTA, sets `store.controls.thrownAt`).
- `scene/direction.ts`: the sheet changes sides during the last quarter of a chapter; portrait framing lowered in chapters 3-5; chapter 2 camera closes in later; `thrown()` (dart out, a beat of empty page, back in).
- Scripts: `scripts/serve.sh`, `scripts/shots.mjs` (now waits until smooth scrolling has stopped), `scripts/sheet.mjs <name> <shot>...` (contact sheet of shots), `scripts/checks.mjs` (behavior checks, exit code 1 on failure).

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; the route is static.
- `node scripts/checks.mjs` passes: one h1, pins, page length 18 screens, chapter 1 keeps its page while pinned, the pack control changes the readout and squeezes the headline, tags stay inside the viewport, scroll position restored after reload, the contact link reaches the end and the contact copy opens, a focused control is unfolded, no page errors, reduced motion has no pins and no hinges, without JavaScript each chapter paints its own page color.
- Screenshots: all five chapters at 1440 and at 375 with the real DOM, the chapter 1-2 transition at 1440, the packed block at 1440, the page end with footer at 1440 and 375, the dart before and after a throw at 1280.
- Not verified: 768 / 1024 / 1920 widths, short wide viewports (copy may not fit one screen below about 700 px height), folds and reveals in motion (only stills), the look of reduced motion and of the no-JS page (only checked by assertions), the dart's return after a throw, the readout through a screen reader, real frame rate, real phones (address bar resize with pins), Safari, sound, no-WebGL path.

## Roadmap

`PROMPT.md` does not need to be read again: what phases 4 and 5 need from it (§9.6, §9.7, §12, §13) is written out below.

| Session | Phase | Content | Done when |
| --- | --- | --- | --- |
| 4 | 4 | Preloader, dog-ear cursor, page-turn fold, sound, SVG fallback, OG image, icon | All signature moments work; the site survives no WebGL and no JavaScript |
| 5 | 5 | Phone, reduced motion, full verification, pull request, Serbian report | Everything under "Phase 5" below is complete |

## Next: phase 4

1. Preloader: a server-rendered overlay in the sheet-face color with the real load phases as steps. `lib/loadClock.ts` tracks scene code, WebGL context, shaders, first frame and fonts; the scene's first frame is part of the same progress; a time limit releases a stuck load. It sets `data-loaded` on `<html>`; `Reveals` must wait for it before opening chapter 1 (today the hero copy is visible, snaps shut at hydration and hinges open: the preloader hides that). The intro (sheet full-screen, then receding) is time-based; handover through `PaperMaterial.setPure`.
2. Dog-ear cursor (fine pointers only, own fixed layer outside the smoother).
3. Page turn: the backdrop change as a diagonal fold (`clip-path`) instead of today's cross-fade in `ScrollRig`.
4. Sound (`lib/audio.ts`): an ambient layer that follows the chapter, the scroll speed (`store.velocity`) and the fold state, plus short UI sounds (crease burst on the pack control and on fold steps). The audio context is created only on the first click on a sound toggle in the header, and is suspended when sound is off or the tab is hidden.
5. SVG fallback drawing of the sheet when there is no WebGL, no JavaScript, or the context is lost; check the no-JS page by eye. The cursor may have its own effect only on its small fixed layer.
6. `app/opengraph-image.tsx`, `app/icon.tsx`.
7. Small leftovers: during a throw the shadow map shows a large soft blot while the dart leaves (clamp or fade the shadow with `flight`); flecks were dropped (never tried, not needed); the vault shows only its outside; `memory` is a constant 1.

## Phase 5 (the quality bar and the finish)

- Text over the scene legible at every scroll position; the phone gets the same site on a lower tier with its own portrait framing.
- `scripts/flow.mjs` (grow it from `scripts/checks.mjs`) walks through: preloader, keyboard, controls, sound toggle, refresh mid-page, no WebGL, lost context, stuck load, reduced motion, no JavaScript. Screenshots at 375, 768, 1024, 1440 and 1920.
- One pull request against the default branch, text in English.
- A report in Serbian with four parts: done, verified, not verified, weaker than wanted. Plus what the user does by hand: fill the credit placeholders in `lib/content.ts`, import the repository into Vercel.

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

- None for the user. (The two credit placeholders in `lib/content.ts` are theirs to fill in.)
