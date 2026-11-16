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
- Text over the scene gets a page-colored halo as insurance.

## Motion language

- Crisp and hinged. A fold starts fast, stops decisively and springs back a few degrees.
- Sequences are staccato: fold, pause, fold.
- DOM text opens on a hinge: each line rotates open from its top edge. No mask rises, no fade-and-slide.
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
- Poses are arrays of fold drivers, never vertex positions. Patterns swap only while the sheet is flat or edge-on.

## Signature moments

1. **The preloader is the sheet.** The loading screen is the sheet filling the viewport, with the real load phases as steps. On the first frame the 3D sheet replaces it in the same color and recedes into chapter 1 without a cut.
2. **Pack control.** One accessible `<input type="range">` drives the Miura fold, the headline's width axis, the crease sound and a dimension readout computed from the model.
3. **Tags follow 3D.** Small filled paper tags stay next to corners and facets of the vault.
4. **Dog-ear cursor.** A small folded corner that unfolds over interactive elements, on its own small fixed layer; fine pointers only.
5. **Page turn.** The page color changes as a diagonal fold sweeping the viewport (CSS `clip-path`), tied to scroll.
6. **The dart.** Five folds, then flight; the contact CTA throws it.

## Sound

Paper is filtered noise: a short band-passed burst for a crease, a soft rustle that follows scroll speed, a quiet room tone per chapter. Off until the user clicks.

## Rendering

WebGL + GLSL, no post-processing. Transparent canvas over the CSS page color. MSAA for crisp facet edges. One shadow map on the two upper quality tiers; fold-angle shading and an alpha contact shadow on the lower ones.
