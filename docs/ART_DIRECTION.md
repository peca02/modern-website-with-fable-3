# Art direction: Mountain & Valley

The design spec. Rules of the look live here; values live in `app/globals.css` and `lib/palette.ts`; copy lives in `lib/content.ts`.

## Brand

- **Mountain & Valley** (short: M&V), "a folding office". Fictional studio that engineers crease patterns for structures that ship flat and open into structure: shelters, solar arrays, packaging.
- The name is the two fundamental creases. Set in title case, never in capitals.
- Story: nothing is added and nothing is removed; structure comes from folds alone. Paper remembers: a crease, once made, stays.

## Page tone and palette

The page is a sheet of colored stock. Each chapter has its own saturated mid-tone page color. There is no black: text is the page color printed darker (overprint feel). The sheet's face is always paper white; its reverse carries the next page's color.

| Stock | Page | Ink (text) | Chapter |
| --- | --- | --- | --- |
| fern | `#4fbe8a` | `#072315` | 1 Start Flat |
| mustard | `#e3b23c` | `#3a2a05` | 2 Pack Small |
| rosa | `#ee9fb6` | `#4a1026` | 3 Stand Up |
| pulp | `#b9b2a4` | `#27221b` | 4 Stay Creased |
| lilac | `#b99ae6` | `#25103f` | 5 Let Go |

- Sheet face: paper white `#f6f1e4`. Sheet reverse in chapter N: the page color of chapter N+1 (chapter 5: fern).
- Ink on its page must stay at 7:1 or better. Paper white is used for the sheet and for small filled tags, not for body text.
- Not allowed: orange-red, ultramarine, near-black pages, cold light porcelain pages, cream pages, gradients as decoration.

## Typography

Two families, clearly distinct.

- **Anybody** (variable `wdth` 50-150, `wght` 100-900): headlines, wordmark, small labels. Headlines are tall and compressed like pleats (`wdth` 50-70, heavy). Small labels are wide (`wdth` 120+), medium weight, sentence case. The width axis is alive: it follows the fold state of the sheet.
- **Literata** (variable `opsz`, `wght`): body text. A sturdy book serif, like a printed instruction leaflet.
- No monospace. No all-caps labels. No single accented word inside a headline.
- Numbered markers are used only for real sequences (chapters are steps; the process list is steps).
- Type classes: `type-hero`, `type-display`, `type-title`, `type-body`, `type-label`. Fluid sizes, one definition each.

## Visual signature

- Planes, facets, matte color. A fold reads as a change of tone across a plane, never as a hairline.
- Two sides of the sheet in two colors. Flat faces with slight softness at a crease.
- Soft real shadows; matte light with a little wrap; light passing through the paper, darker with every stacked layer; fine fiber grain from a formula.
- Creases that were folded stay faintly visible after unfolding.
- Not allowed: glow, gloss, mirror reflections, thin lines as a motif, crease-pattern line drawings, cards with rounded corners and grey shadows.
- DOM shapes follow the same rule: filled flat planes with sharp corners; a folded corner is the only ornament.

## Layout

- Left-aligned. Headlines large and compressed, running across the grid; body text in a narrow column (50-75 characters).
- The scene and the text share the screen by lens shift: on wide screens text takes one side and the sheet the other; on portrait screens the sheet sits above or below the text.
- Wide: text left and sheet right in chapters 1, 3, 5; text right and sheet left in 2, 4. The sheet changes sides while a chapter scrolls away.
- Body copy over the scene gets a page-colored halo as insurance. Headlines get none (it smudges on the white sheet) and may run over the sheet.

## Motion language

- Crisp and hinged. A fold starts fast, stops decisively and springs back a few degrees.
- Sequences are staccato: fold, pause, fold.
- DOM text opens on a hinge: each line rotates open from its top edge, and folds shut the same way when its chapter leaves. No mask rises, no fade-and-slide.
- Eases (in `lib/gsap.ts`): `crease` (fast start, hard stop), `spring` (hard stop with a small overshoot), `flat` (linear, for scrubbed values). Durations: `snap` 0.25s, `fold` 0.6s, `turn` 1.1s.
- Reduced motion: no pins, no smooth scroll, no hinge animation; each chapter shows its own held pose.

## Voice

Folding instructions: second person, imperative, short steps, dry humor. Concrete, never salesy.

- "Take one sheet. Do not cut it. Do not glue it. We will know."
- "Fold along the valley. Unfold. The crease stays. That is the point."
- "Step 9. Let go. This is the hard one."

## Chapters and the sheet

| # | Name | Stock | The sheet | DOM |
| --- | --- | --- | --- | --- |
| 1 | Start Flat | fern | Leaves the preloader full-screen and flat, recedes, relaxes into a shallow Miura relief; tilts toward the pointer | H1 "Start with one sheet.", manifesto |
| 2 | Pack Small | mustard | Miura-ori packs into a book-sized block and opens again | Range control, headline that compresses, live dimension readout |
| 3 | Stand Up | rosa | Turns over (pattern swap while edge-on), folds into a Yoshimura vault | Three fictional projects; tags follow facets |
| 4 | Stay Creased | pulp | Unfolded with the memory of every crease; folded in half, then in quarters, backlit | Process as numbered steps |
| 5 | Let Go | lilac | Five staccato folds into a paper dart, then it flies | Contact, footer with concept note and credit |

## Fold models (all closed form, in `lib/fold/`, no three imports)

- **Miura-ori**: one driver (fold amount 0-1).
- **Yoshimura vault**: one driver (arc angle per segment). `R = b / (2 sin(φ/2))`, `h² = h0² − (b²/4) tan²(φ/4)`.
- **Simple-fold sequencer**: ordered simple folds (halves, dart); each step rotates everything on one side of a line; layers are tracked and offset slightly.
- No general rigid-origami solver, no collision handling, and no figure that needs them (a crane, for example).
- Poses are arrays of fold drivers, never vertex positions. Patterns swap only while the sheet is flat or edge-on.
- Folds stop a few degrees short of fully closed and stacked layers are offset slightly, so they never flicker.
- Scroll-driven folds are pure functions of story position: stepped tracks (steep segment, plateau), no history-dependent tweens. Crease memory is computed from the direction file, not from history.
- Vertices are computed on the CPU and uploaded each frame; DOM anchors read the same vertices. No GPGPU, no raymarching. No particles (paper flecks were considered and dropped).

## Signature moments

1. **The preloader is the sheet.** The loading screen is the sheet filling the viewport, with the real load phases as steps. On the first frame the 3D sheet replaces it in the same color and recedes into chapter 1 without a cut.
2. **Pack control.** One accessible `<input type="range">` drives the Miura fold, the headline's width axis, the crease sound and a dimension readout computed from the model.
3. **Tags follow 3D.** Small filled paper tags stay next to corners and facets of the vault.
4. **Dog-ear cursor.** A small folded corner that unfolds over interactive elements, on its own small fixed layer; fine pointers only.
5. **Page turn.** The page color changes as a diagonal fold sweeping the viewport (CSS `clip-path`), tied to scroll.
6. **The dart.** Five folds, then flight; the contact CTA throws it.

## Must not repeat (two earlier sites by the same author)

- Themes: fusion, plasma, magnetic fields, ferrofluid, any shaped liquid. Perfume is forbidden entirely.
- Names: SKEIN, TARN, and the chapter names Winding, Ignition, Inside, Yield, Still, Reach, Crown, Part, Hold, Settle.
- Looks: glowing threads, light streaks, hairline rules, hairline serif; mirror-black mass, gloss, merging black forms; a ring or torus; a drop.
- Type: Archivo, Instrument Sans. Colors: orange-red `#ff5a1f`, ultramarine `#2433ff` and close shades; a near-black page; a cold porcelain page.
- Motion: viscous settling without overshoot; text rising out of a mask.
- Moments: a drop preloader, a field slider that thickens letters, a drop or goo cursor, a wordmark in a reflection.
- Voice: weaving vocabulary (thread, wind, loom, tension); calm descriptive prose built on verbs of matter (pool, bead, crown, reach, settle).

## Sound

Paper is filtered noise: a short band-passed burst for a crease, a soft rustle that follows scroll speed, a quiet room tone per chapter. Off until the user clicks.

## Rendering

WebGL + GLSL, no post-processing. Transparent canvas over the CSS page color. The page is a desk seen from straight above: the sheet floats over it and drops its shadow on it. MSAA for crisp facet edges. One shadow map on the two upper quality tiers; fold-angle shading and an alpha contact shadow on the lower ones.

Without WebGL, without JavaScript, or while the context is lost, each chapter shows its held pose as flat SVG facets, projected from the same fold models and lit by the same key light, with a solid ink shadow. The OG image and the icon are drawn the same way.
