# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
Work to the end without asking; the only exception is a manual step you cannot do yourself. `PROMPT.md` does not need to be read.

## Done (phases 0-5)

- Phases 0-5 are complete. Pull request [#1](https://github.com/peca02/modern-website-with-fable-3/pull/1) against `main` is open (it updates with every push to the branch), and the Serbian final report was given. The user checked the desktop site by eye and is happy with motion and frame rate; the phone is not yet checked by them.
- Map: fold models `lib/fold/`, scene `scene/` (timing and framing in `scene/direction.ts`), chapters `components/chapters/*` over `components/Chapter.tsx`, preloader `lib/loadClock.ts` + `components/Preloader.tsx`, fallback `lib/drawing.ts` + `components/SheetDrawing.tsx`, OG image `app/opengraph-image.tsx`. Variants: `pinned`, `loaded`, `scene-live`, `scene-off`, `fine`, `wide`, `narrow`.
- Portrait framing follows the copy: `ScrollRig` writes `store.viewport.copy` (how far down each chapter's copy reaches); `direct()` maps the strip below it onto the strip it had on 375x812 (`copyFramed`), shrinking the sheet down to `smallest` (0.5). Below 16:10 the wide camera steps back (`framedAspect`). `Tags` pushes chips off the copy and off each other.
- Scripts: `serve.sh` (build + serve, run first), `flow.mjs checks` (21 behavior checks), `flow.mjs layout` (copy fits its pinned screen at 7 sizes, with and without the scene), `flow.mjs shots <w>x<h> [stories]`, `shots.mjs`, `fallback.mjs <nojs|nowebgl> [width] [story]`, `intro.mjs`, `cursor.mjs`, `sheet.mjs`.
- Verified: lint, typecheck, build (all routes static), `flow.mjs checks` and `layout`; screenshots at 375 to 1920. Not verifiable here: real phones and touch, Safari, sound, screen reader.

## Next: phase 6, polish (one session)

Order matters; commit and push after each step. Run `flow.mjs layout` after layout changes and `flow.mjs checks` once at the end.

1. **Crease memory.** `direct()` returns `memory: 1` (`scene/direction.ts`), so the shader (`scene/PaperMaterial.ts`, `memory` from `vCrease`/`vValley`) shows creases on a sheet that was never folded. Make memory a pure function of story: per pattern, the running maximum of that pattern's own fold track (`fold`, `arch`, `halves`, `dart`) up to `story`, precomputed from the keys (a monotone envelope), never from history. Check with one shot at story 0.1 (no creases) and one in chapter 4 (creases visible).
2. **Headline width follows the sheet.** Today only `PackControl` writes `--wdth` on the chapter 2 headline (`type-hero`/`type-display` read `var(--wdth)`, defaults 56/60). Add one writer: a small client component on the gsap ticker that sets `--wdth` on the current chapter's heading from `direct(store.story, ..., store.controls.pack).fold` (`direction.ts` is three-free; `lib/drawing.ts` already imports it), mapped 70 (flat) to 50 (folded), written only when the rounded value changes. `PackControl` stops writing `--wdth` (keep its readout and sound); the pack value reaches the headline through `direct()`. Reduced motion: set each heading once to its held pose. Keep the `flow.mjs` check that packing narrows the chapter 2 headline. Check no heading overflows at 320 and 375 wide (wider `wdth` at 70).
3. **OG image in Anybody** (rule exception approved by the user, recorded in `CLAUDE.md`). In `app/opengraph-image.tsx` fetch a static instance at build time from the Google Fonts CSS2 API (`family=Anybody:wdth,wght@60,800` and `text=` with the exact strings; with a plain fetch Google answers with TTF, which `next/og` accepts, unlike woff2), pass it as `fonts` to `ImageResponse`, and fall back to the default font if any fetch fails so the build never breaks. A second instance (wide `wdth` 125, weight 500) for the tagline if it reads better. Look at the image at `/opengraph-image`.
4. **Phone.** Not yet checked on a real phone, so do what can be judged here:
   - Add 320x568, 360x740 and 390x844 to `sizes` in `flow.mjs`; add a check that the page never scrolls sideways (`scrollWidth <= innerWidth`) at every phone size.
   - Short phones (375x667): in chapter 3 the tags cover most of the small vault. On `narrow` screens, when the room below the copy is short, show the facts as the static paper-tag row (the `aside` in `StandUp`, today `scene-live:sr-only`) and keep the following `Tags` hidden. In chapter 4 the sheet shrinks to half; try `smallest` 0.65 and check that only the halo-protected body copy is touched.
   - Touch targets: add a `coarse` variant (`pointer: coarse`) and give header links, the sound toggle, the range thumb and the throw link at least a 44 px hit area without changing the look.
   - A touch-emulated run (Playwright `devices["iPhone 13"]`, `isMobile`, `hasTouch`) in `flow.mjs`: lower tier picked (no 1024 shadow map), no dog-ear cursor, the range works by tap, chapters pin.
   - Reduced motion at 375x812: shots of chapters 1 and 3 (text scrolls over the fixed sheet there); fix anything unreadable.
5. **Finish.** Rewrite this file (done, verified, not verified), add a short "Phase 6" section to the PR #1 description, push, and give the user a short Serbian report.

## Known weak spots left on purpose

- The user chose not to fix these: the page-turn flap is not a true reflection on non-square screens; the vault shows only its outside; at 1024x768 and 1440x900 the sheet's edge touches the end of some body lines (the halo keeps them readable).

## Decisions made without asking (phase 4)

- Preloader copy "Step 0. Unwrap" with five steps in the folding-instructions voice; the overlay folds shut line by line.
- The sound toggle is a text button "Sound" with a react-icons speaker; without JavaScript it is hidden.
- `site.url` was added as a third placeholder, needed for `metadataBase` (absolute links to the share image).
- The fallback drawing uses each chapter's reduced-motion pose (`hold`), so no-WebGL and reduced motion show the same moments.

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

- Use `scripts/serve.sh` before screenshots or checks. One build plus one shot takes about 90 seconds; `flow.mjs checks` about 3 minutes, `layout` under one.
- An interrupted `npm ci` leaves a broken `node_modules` (missing type exports, wrong eslint): run `npm ci` again.
- If the permission classifier blocks installs or commits, stop and ask the user to allow them explicitly in chat.

## Open questions

- None. The placeholders in `lib/content.ts` (`credit.name`, `credit.href`, `site.url`) are the user's to fill in.
