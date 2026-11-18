# Session summary

Branch: `claude/festive-hypatia-jick9a`. Rewritten every session; history lives in git.
`PROMPT.md` does not need to be read.

## Done (phases 0-6)

- All six phases are complete. Pull request [#1](https://github.com/peca02/modern-website-with-fable-3/pull/1) against `main` is open and carries a "Phase 6" section. The user checked the desktop site by eye; the phone is not yet checked by them.
- Map: fold models `lib/fold/`, scene `scene/` (timing and framing in `scene/direction.ts`), chapters `components/chapters/*` over `components/Chapter.tsx`, preloader `lib/loadClock.ts` + `components/Preloader.tsx`, fallback `lib/drawing.ts` + `components/SheetDrawing.tsx`, OG image `app/opengraph-image.tsx`. Variants: `pinned`, `loaded`, `scene-live`, `scene-off`, `fine`, `coarse`, `wide`, `narrow`, `motion-full`, `motion-reduced`, `facts-tags`.

## Next

- Nothing is planned: the brief in `PROMPT.md` is complete. What remains is the user's: fill the placeholders in `lib/content.ts`, merge PR #1, import the repository into Vercel, and check a real phone. A new session only fixes what that check finds.

## Phase 6 (polish), what changed

- Crease memory is a pure function of story: per pattern, the running maximum of its own fold track (`envelope()` in `direction.ts`), scaled to its highest key. A fresh sheet shows no creases.
- `components/HeadlineWidth.tsx` is the only writer of `--wdth` on chapter headlines: `direct(...).fold` mapped from 70 (flat) to 50 (folded), pack control included; each headline reads the story clamped to its chapter; reduced motion holds each chapter's pose. Where a flat headline would pass the page margin, its widest value is lowered (`data-widest`, measured on load, fonts ready and resize). `PackControl` keeps only its readout and sound.
- OG image in Anybody: static TrueType instances fetched at build time from the Google Fonts CSS2 API (`wdth` 62.5 / 800 for the name, 125 / 500 for the tagline; 60 is served as two files), default font if any fetch fails.
- Phones: `media.full` in `lib/gsap.ts` now also needs `min-height: 37.5rem`; shorter screens get the reduced-motion layout (no pins), and the header gets a page-color band (`motion-reduced:`). Chapter 3's facts float as tags only on a live, pinned scene with room (`tagsRoom` 0.3 of a portrait screen below the copy, `data-facts` set in `ScrollRig`); otherwise the static paper-tag row shows. `smallest` is 0.65. `touch-target` utility (44 px) on header controls; the range has a 48 px hit area under `coarse:` with the same look. The contact address wraps at 320 px. Stage writes `data-tier` for scripts.
- Scripts: `flow.mjs layout` covers 10 sizes (adds 320x568, 360x740, 390x844) and checks headline fit and no sideways scroll; `flow.mjs checks` adds a touch-emulated iPhone 13 run; `REDUCED=1 node scripts/flow.mjs shots ...` takes reduced-motion shots.

## Verified here

- Typecheck, lint, build (all routes static); `flow.mjs layout` 40/40; `flow.mjs checks` 25/25; shots: story 0.1 and chapter 4 creases, headlines at 375 and 1024, OG image, 320x568, 375x667 chapters 3-4, reduced motion at 375x812 chapters 1 and 3, the touch range.

## Not verifiable here

- Real phones and touch, real frame rate, Safari (range thumb styling under `coarse`), sound, screen readers.

## Known weak spots left on purpose

- The user chose not to fix these: the page-turn flap is not a true reflection on non-square screens; the vault shows only its outside; at 1024x768 and 1440x900 the sheet's edge touches the end of some body lines (the halo keeps them readable).
- At 320 px the wordmark wraps to two lines in the header (the three header items do not fit one line).
- At 375x667 the quarter-folded sheet in chapter 4 touches the last body line (halo-protected).

## Design notes that exist nowhere else

- ScrollTrigger sorts triggers by start. A pin and the chapter that contains it start at the same place, so pins carry `refreshPriority: 1`.
- ScrollSmoother scrolls to any focused element that is off screen; `onFocusIn` ignores elements with `tabindex="-1"` (`#top`, `#contact`), and `JumpLink` scrolls to an end of the page itself.
- In the cloud GSAP time runs slow (about one frame per second), so a script waits for state or for scroll to stop, never for seconds.
- Fixed layers (canvas, header, tags, cursor) stay outside the ScrollSmoother wrapper.
- The sheet is turned over from story 2.24 to 3.9; the pattern swap happens while it is edge-on (`turn` = 0.5).
- Story position is `chapter index + local progress`. Under reduced motion the story is `index + hold` of the chapter covering the middle of the screen.
- With JavaScript the page color is one fixed backdrop (`--backdrop`); sections paint their own background only under `noscript:`.
- The shadow plane is at z = 0, the sheet floats at `lift`, all tilt is on the sheet. Canvas is `flat`; `shadows` is fixed from the initial tier.
- Headings carry no halo; body copy does.
- Showing chapter 3's static facts changes its height when nothing is pinned, so `ScrollRig` refreshes ScrollTrigger when `data-facts` changes.

## Cloud notes

- Run `scripts/serve.sh` before screenshots or checks. One build plus one shot takes about 90 seconds; `flow.mjs checks` about 4 minutes, `layout` about one.
- `scripts/sheet.mjs <name> <shot>...` takes shot names relative to `shots/`, without the folder.
- An interrupted `npm ci` leaves a broken `node_modules`: run `npm ci` again.

## Open questions

- None. The placeholders in `lib/content.ts` (`credit.name`, `credit.href`, `site.url`) are the user's to fill in.
