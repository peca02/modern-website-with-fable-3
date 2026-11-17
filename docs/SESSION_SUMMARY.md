# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
The plan was approved by the user. Work to the end without asking; the only exception is a manual step you cannot do yourself.
`PROMPT.md` does not need to be read.

## Done (phases 0-5)

- Stack, tokens, fonts, store, quality tiers, gsap setup: see `CLAUDE.md` and the files themselves (`app/globals.css`, `lib/*`). Variants: `pinned`, `loaded`, `scene-live`, `scene-off` (`data-scene` is `none` or `lost`), `fine`, `wide`, `narrow` (its complement).
- Fold models in `lib/fold/`, scene in `scene/`, timing and framing in `scene/direction.ts`. DOM chapters in `components/chapters/*` over `Chapter.tsx`.
- Phase 4: preloader (`lib/loadClock.ts`, `Preloader.tsx`), intro, dog-ear cursor, page turn, synthesized sound, SVG fallback drawing (`lib/drawing.ts`, `SheetDrawing.tsx`), OG image and icon.
- Phase 5:
  - `scripts/flow.mjs` (replaces `checks.mjs`): `checks` (21 behavior checks: preloader, keyboard focus rings, sound toggle, cursor, pins, page turn, pack control from the keyboard, tags, lost context and recovery, refresh mid-page, contact jump, stuck load released at 12 s, reduced motion, no JavaScript, no WebGL), `layout` (copy fits its pinned screen at 375x812, 375x667, 768x1024, 1024x768, 1280x720, 1440x900, 1920x1080, with and without the scene), `shots <w>x<h> [stories]`.
  - Portrait framing follows the copy: `ScrollRig` measures how far down each chapter's copy reaches (`store.viewport.copy`); `direct()` maps the strip below it onto the strip the framing had on 375x812 (`copyFramed`), so on short phones the sheet moves down and shrinks (not below half).
  - Wide framing: the camera steps back below 16:10 (`framedAspect`), so 1024x768 keeps the sheet out of the copy.
  - Vault tags never cover the copy or each other (`Tags` pushes them down).
  - Fallback: the drawing fills the row the copy leaves (grid rows under `pinned:`); chapter 3's facts are a `Chapter` `aside` of paper tags (`paper-tag` utility) over the drawing's foot.
  - `type-title` is capped by viewport height; the last chapter no longer starts a page turn; the header aligns on center.
- Other scripts: `serve.sh`, `shots.mjs` (one chapter, one width), `sheet.mjs`, `intro.mjs`, `fallback.mjs <nojs|nowebgl>`, `cursor.mjs`.

## Verified

- `npm run lint`, `npm run typecheck`, `npm run build` pass; `/`, `/icon`, `/opengraph-image` are static. `three` is not in the initial bundle (initial JS about 240 kB gzip: React/Next and GSAP with ScrollSmoother and SplitText).
- `node scripts/flow.mjs checks` and `layout` pass (21 + 14).
- Seen in screenshots: live scene at 375x812, 375x667, 768x1024, 1024x768, 1440x900, 1920x1080 (chapters 1-5 at their held moments); no WebGL at 375 and 1280; no JavaScript at 375.
- Not verified: anything in motion (the cloud draws about one frame a second: intro, folds, reveals, page turn, cursor, dart flight), the sound itself, real frame rate and tier lowering, real phones and touch, Safari, a screen reader, mobile address-bar resizing.

## Known weak spots

- The OG image sets its text in the default font of `next/og`.
- On a 375x667 phone the sheet is small in chapters 3 and 4 (the copy leaves little room) and the vault tags cover most of the vault.
- At 1024x768 and 1440x900 the sheet's edge still touches the end of some body lines (the halo keeps them readable).
- The page-turn mirror is computed in shares of the viewport, so the flap is not a true reflection on non-square screens.
- The vault shows only its outside; `memory` is a constant 1; flecks were dropped.

## Next

- Phase 5 is done apart from the pull request and the final report, if they are not already there.
- The user: fill the placeholders in `lib/content.ts` (`credit.name`, `credit.href`, `site.url`), import the repository into Vercel, check on a real phone and in Safari.

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

- None for the user. (The placeholders in `lib/content.ts` are theirs to fill in.)
