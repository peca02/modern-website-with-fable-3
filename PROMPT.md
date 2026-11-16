# PROMPT: build the whole site

You are Claude Code, running in the cloud on this GitHub repository. Build one complete website from this file, on your own, without further guidance from me.

The repository contains only this file, `CLAUDE.md`, and vendored skills in `.claude/skills/`. Nothing else exists yet and no other brief exists anywhere. Everything you need is in this file and in `CLAUDE.md`.

## 0. How to read this file

Every section is tagged:

- **HARD**: a rule. Not negotiable. Do not trade it for speed or convenience.
- **DEFAULT**: the recipe that worked on my two previous sites. Start from it. Deviate only where you give the reason in the plan (§5.4).
- **SUGGESTION**: an idea that makes a point concrete. Replace it freely with something better.

Section numbers are stable. Later sessions do not re-read this file in full: they read the sections that `docs/SESSION_SUMMARY.md` names.

`CLAUDE.md` is the short version of the rules that hold in every session; this file holds the detail. If the two ever seem to disagree, follow the stricter one and tell me.

**Language (HARD).** Everything you write to me (plan, announcements, messages, final report) is in Serbian. Everything that goes into the repository (code, comments, documentation, commit messages, pull request text, the site's own copy) is in English.

## 1. What to build (HARD)

A brutally modern, beautiful frontend website: scroll animation and 3D. It has no database and it is not a web application.

Its job is to show how well I build powerful, non-template websites, at the level of sites featured on Awwwards. It must look like it cost a few thousand dollars, and it must be interactive.

Priorities, in order: visual quality, originality, performance, and how well it works on a phone. Technology for its own sake is not a goal.

The theme is fixed: **origami and paper engineering** (§6). The identity inside that theme (brand, story, palette, type, chapters) is yours to propose in the plan.

## 2. Working conditions (HARD)

- I work on the Pro plan with the most expensive model. The 5-hour limit is small, so saving tokens matters more than speed.
- Autocompact is set at 400k tokens. Never wait for it to fire. Close the session earlier, with a summary (§4), whenever that is possible.
- The site is built in Claude Code in the cloud, on this GitHub repository. I may close the app or turn off my computer, and the session can stop at any moment. Commit and push after every step that works.
- Work on the branch this session's environment designates and push only there. Lint and type check must pass before each commit.
- I do not use Ultracode. Nothing in your approach may depend on it, and you must not ask me to turn it on.

## 3. How work is divided (HARD)

The main thread is the default way of working. Everything connected is done there: foundation, design tokens, 3D scene, integration, fixes, polish.

An agent is allowed only for a task that meets all three conditions:

- it is large: hours of work and many files;
- it is isolated: it has its own files that nobody else touches;
- it can be described in a short brief, without reading half the project.

Rules for agents:

- Strictly one at a time: start one, wait until it finishes, review the result, commit and push, and only then start the next. Never two at once, never a batch.
- True parallel agents are not used. They burn about the same tokens as agents run one after another, but they can spend the whole limit in a few minutes, and every agent interrupted halfway pays for its whole context again when resumed.
- Before starting an agent, tell me in one sentence which task it gets and why you are not doing it in the main thread. Then start it immediately. Do not wait for my confirmation: work must not stall when I am away.
- If something should have been done differently by the previous agent, write that into the next agent's brief.
- If an agent is interrupted with little work left, the main thread finishes it. Restart an agent only if a lot of work remains.
- Reviews follow the same rule: the main thread does the first pass. A reviewer agent is used only when fresh eyes are needed, one at a time.
- An agent's brief names the files it owns, the few files it may read, the rules from `CLAUDE.md` that matter for it, and what "done" means. An agent never starts other agents.

It is a perfectly good outcome if the whole site is built without a single agent.

The decision at a glance:

1. Start in the main thread.
2. A task appeared? Check: large + isolated + briefly describable?
   No → it stays in the main thread. Yes → announce the agent in one sentence, start one, review, commit and push.
3. The main session is too large? Write `docs/SESSION_SUMMARY.md` and suggest a new session.
4. The limit ran out? After the reset, resume exactly one thing.

## 4. Protecting the limit (HARD)

Context stays small:

- Read a file once, and only the part you need. Do not re-read a file you just wrote.
- Keep command output quiet (silent flags, only the tail of long output).
- Screenshots are taken for one chapter and one width per run.
- Load a skill only when you start the kind of work it covers, once per session.

Sessions:

- The project is split into several shorter sessions where needed. The default is one phase per session (§11).
- At the end of every phase: write `docs/SESSION_SUMMARY.md`, commit, push, and tell me it is a good moment for a new session. Give me the branch name and the one line to paste into the new session: `Nastavi rad po docs/SESSION_SUMMARY.md.`
- Then stop. The one exception: if the phase was short and the context is still small, say so in one sentence and continue with the next phase. The summary is already pushed, so nothing is lost.
- When a session grows large before the phase ends, summarize into the same file, or suggest a new session. As a rule of thumb, treat roughly half of the autocompact threshold as the point to wrap up.
- After a limit reset or a longer pause, resume exactly one thing.

`docs/SESSION_SUMMARY.md` holds, with file paths: what was done, what was verified and how, what remains (next phase first, with the sections of this file to read), open questions, decisions you made without asking, and the branch that holds the work. It is rewritten each time, not appended to; history lives in git. Keep it under about 80 lines.

How a later session starts:

1. Read `CLAUDE.md`, `docs/SESSION_SUMMARY.md` and `docs/ART_DIRECTION.md`. Do not read the whole codebase. Read only the sections of this file that the summary names.
2. Check that the checkout contains the previous session's work. If the branch named in the summary is not part of the current history, fetch that branch by name and merge it before doing anything else.
3. Install dependencies if they are missing.
4. Tell me in one Serbian sentence what this session will do, then do it without waiting.

The files that every session and every agent reads (`CLAUDE.md`, `docs/ART_DIRECTION.md`, `docs/SESSION_SUMMARY.md`) must stay short wherever that is feasible.

## 5. Phase 0, before any code (HARD)

This is the only point where you wait for me.

### 5.1 Environment check

- Node and npm versions, repository state (branch, remote, what is already committed), network (is the npm registry reachable).
- Chromium is already installed in the container: use it. Find it and the Playwright version that matches it. Never download a browser. If the project gets its own Playwright dev dependency, pin it to the exact version that matches the installed Chromium; otherwise launch with an explicit executable path. Prove it by launching once.
- Check that headless Chromium can create a WebGL context (it will be software rendering) and note the renderer string.
- Check whether the build can fetch fonts through `next/font/google`. If the font hosts are blocked, either tell me exactly which hosts to allow, or use the fallback that needs no extra access: install the font from npm (Fontsource packages) and load its files with `next/font/local`.

### 5.2 Skills and manual steps

- The GSAP skills are vendored in `.claude/skills/` (`gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-performance`, `gsap-utils`), together with `frontend-design`. Check that they appear in your list of available skills.
- If the GSAP skills are not available, stop and tell me the exact manual step: run `/plugin marketplace add greensock/gsap-skills` in Claude Code and install the plugin, or run `npx skills add https://github.com/greensock/gsap-skills` in the repository.
- If anything else needs a manual step from me (a skill, a permission, an environment setting such as an allowed network host), tell me before you start, with exact instructions. Important steps must never be skipped silently.
- Use `frontend-design` once, while writing the art direction. Where it disagrees with this file (for example on how much motion a page should have), this file wins.

### 5.3 Versions, by trial install and not from memory

- Look up the current stable version of every package (§8) in the registry.
- Install them together and resolve peer conflicts properly. Do not force the install; if there is truly no other way, explain it in the plan.
- Prove compatibility with a minimal build: an App Router page with the React Compiler on, TypeScript strict, Tailwind 4, lint with the React Compiler rules, one R3F canvas loaded through `next/dynamic` with one shader material, and GSAP with ScrollTrigger, ScrollSmoother, SplitText and `useGSAP` registered. The build must pass and the page must open in headless Chromium with the canvas drawing.
- All GSAP plugins ship in the public `gsap` package; no token or private registry is needed.
- Scaffolding tools refuse a non-empty directory. Scaffold in a temporary directory and move the result in, or set the project up by hand.
- As soon as the versions are proven, write them into the table in `CLAUDE.md`, replacing every `TBD`, and pin them exactly in `package.json`.
- Commit and push this scaffold before you present the plan, so nothing is lost while you wait for me. No site code is written before my approval.

### 5.4 One plan, in Serbian

One compact message that contains:

- brand and niche;
- art direction (page tone, palette with hex values, typefaces and their roles, visual signature, motion character, voice of the copy with two or three sample lines);
- the list of chapters and what the central object does in each;
- the signature moments;
- exact package versions;
- WebGL or WebGPU, with the reason;
- post-processing: which effects or none, with the reason;
- the technique for drawing the central object (mesh, raymarching, particles or a combination), with the reason;
- the division of work: main thread or agent for each part, with the reason;
- the split into sessions, if one is needed;
- every deviation from the DEFAULT sections, with the reason;
- any manual step you need from me.

The plan must also show how the new site differs from both previous sites (§7), item by item, as a table with one row each for: niche, story, central object, page tone, accent color, typography, visual signature, motion character, signature moments, voice of the copy.

Then stop and wait for my approval.

### 5.5 After my approval

- Write the approved direction into `docs/ART_DIRECTION.md` (§14).
- Work to the end without asking questions. The only exception is a manual step you cannot do yourself.
- Where a decision is needed, make it and record it in `docs/SESSION_SUMMARY.md`.
- If I change something in the plan, apply the change and continue. Do not present the whole plan again unless I ask.

## 6. Creative brief (HARD where marked, otherwise yours to propose)

### 6.1 Fixed (HARD)

- Theme: **origami and paper engineering**. The site belongs to a fictional studio or company whose work is folding: flat sheets that become structure through folds alone.
- Central 3D subject: **one sheet of paper** that folds through several states as the user scrolls. One strong subject with several states, not a collection of objects.
- The brand is fictional. The site copy is in English.
- The footer carries one discreet line: a note that the brand is fictional (a concept site), and a "Design & build" credit with my name and a link. Keep the name and the link in `lib/content.ts` as two clearly marked placeholders that I fill in myself.
- The theme must not drift toward the forbidden themes in §7.3.

### 6.2 Open: you propose it in the plan

Brand name, the exact niche (for example deployable structures, packaging, architecture, folded shelters), the story, the number and names of chapters (four to six), palette, typefaces, signature moments, voice.

### 6.3 Direction (SUGGESTION)

These are starting points that already satisfy §7.3. Keep them, sharpen them or replace them.

- **Story.** Nothing is added and nothing is removed; structure comes from folds alone. Paper also remembers: a crease, once made, stays.
- **Visual signature.** Planes, facets and matte color. Flat-shaded faces, the two sides of the sheet in two different colors, soft real shadows, light passing through the paper and getting darker where layers stack. No glow, no gloss, no mirror reflections.
- **Be careful with lines.** Origami diagrams are line drawings, and thin lines were the signature of my first site. Show a fold as a change of tone across a plane, not as a hairline. If crease notation appears at all, it is rare and never the main motif.
- **Page tone.** A third direction, for example a page of full, saturated mid-tone paper colors that change from chapter to chapter, as if the page itself were a sheet. Not a near-black page and not a cold, light, porcelain page.
- **Motion character.** Crisp and hinged. A fold starts fast, stops decisively and springs back by a few degrees, like real paper. Sequences are staccato: fold, pause, fold. DOM text can open on a hinge (a line rotating open from its top edge) instead of rising out of a mask.
- **Voice.** The voice of folding instructions: second person, imperative, short steps, a little dry humor. Numbered steps are honest here because folding really is a sequence.
- **Brand name.** Both previous brands were short, rare, one-syllable English nouns set in capitals (SKEIN, TARN). Break that formula as well.
- **Signature moments**, as new forms of patterns that worked before (§9.8):
  - the preloader is a sheet whose folding is the real loading progress, and it becomes the subject of the first chapter without a cut;
  - a real DOM control (for example an accessible stepper or range that folds and unfolds the sheet) drives the scene, a variable font axis in the headline and the sound at once;
  - DOM labels follow corners or faces of the sheet;
  - the cursor is a small paper element (a folded corner or flap) on its own small fixed layer;
  - the page color changes between chapters like one sheet folding over another.
- **Sound.** Paper is filtered noise: a short band-passed burst for a crease, a soft rustle that follows scroll speed, a quiet ambient layer per chapter.

## 7. Previous sites: what the new one must not repeat (HARD)

The technologies and patterns in §8 and §9 may stay the same. The concept and the look must be completely different from both sites below.

### 7.1 First site: fusion (SKEIN)

- Niche: fusion, specifically the stellarator (a twisted magnetic ring that holds plasma).
- Brand: SKEIN ("a coil of thread"), the fictional company Skein Fusion Systems.
- Voice: the vocabulary of weaving applied to plasma physics (thread, wind, tension, loom, tie in); short dry sentences; concrete numbers.
- Story: a star held by a thread; the hottest and the coldest thing a metre apart.
- Visual signature: everything is made of thin glowing threads. In 3D these are particles drawn as streaks of light; in the DOM, hairline rules and a hairline serif.
- Page tone and palette: dark page; near-black background (#050506), bone-colored text (#ede8df), one accent, orange-red "plasma" (#ff5a1f) up to white-hot, and a secondary cold blue "cryo" (#9cc4d4) only for cold parts.
- Central object: a twisted ring of plasma with a pattern along the field lines, surrounded by hairline cages of the machine.
- Post-processing: bloom, chromatic aberration, grain, vignette, tone mapping.
- Chapters: Winding, Ignition, Inside, Yield.

### 7.2 Second site: ferrofluid (TARN)

- Niche: ferrofluid, a magnetic liquid that takes its shape from a field.
- Brand: TARN ("a small mountain lake"), a fictional materials studio that makes magnetic liquid and the fields that shape it.
- Story: a liquid with no shape of its own and the invisible force that gives it one.
- Voice: calm, tactile, descriptive; medium-length sentences with verbs of matter (pool, bead, crown, reach, settle, part, hold). Numbers are rare.
- Visual signature: mass and shine. One body of mirror-black liquid on a light page, heavy wide letters, solid black forms that merge like drops. No lines, threads or cards.
- Page tone and palette: light, cold, porcelain background (#edeff1), pure black text and liquid (#000000), greys (#f7f8f9, #d3d8de, #4a4f57) and one rare accent, ultramarine blue "field" (#2433ff).
- Typography: Archivo (variable weight and width axes; wide and black for headings, condensed for small labels) and Instrument Sans for body text. No serif and no monospace.
- Central object: a glossy black drop (raymarched) that reflects a studio and the brand wordmark, surrounded by dark grains that draw the field lines.
- Motion: viscous; arrivals settle without overshoot, text rises out of a mask like a liquid level.
- Post-processing: none. The canvas was transparent over the CSS page color, the contact shadow was alpha, and the grain was a static SVG noise in the DOM.
- Signature moments: the preloader as a growing drop; the brand wordmark in the reflection; a field slider that raises spikes and thickens the letters; a list whose rows stand next to droplets; a drop cursor merged with the navigation (goo filter).
- Chapters: Still, Reach, Crown, Part, Hold, Settle.

### 7.3 The new site differs from both in all of this

- Different niche and story: not fusion, plasma, magnetic fields as the main theme, ferrofluid or a liquid that is shaped. **Perfume is forbidden as a theme entirely** (I already have a perfume site).
- Different central object: not a ring or torus of plasma, not a black mirror drop or a liquid mass.
- Different page tone: neither a near-black page with a warm accent like SKEIN, nor a light, cold, porcelain page like TARN. Choose a third direction and justify it in the plan.
- Different accent color: not orange-red, not ultramarine blue, and not their close shades.
- Different typography: not a hairline serif as the main motif, not Archivo and not Instrument Sans.
- Different visual signature: not threads, glowing streaks and hairline lines; not mass, shine and black forms that merge like drops.
- Different motion character: not the viscous settling of TARN.
- Different signature moments. Patterns such as "the preloader becomes the first shot", "a DOM element drives the scene" and "the DOM follows 3D" may return, but in a new form: not as a drop, a field slider or a drop cursor.
- Different voice: not the vocabulary of weaving, not verbs of matter in a calm descriptive tone.
- No chapter name and no brand name from either site is reused.

## 8. Technology (HARD)

- Next.js (App Router), React with the React Compiler enabled, TypeScript strict, Tailwind CSS 4.
- ESLint with the React Compiler rules. No `any`, and no disabled rules.
- Three.js with React Three Fiber, and Drei for ready-made helpers. On both previous sites only `PerformanceMonitor` came from Drei; the rest was written by hand for the look and for control. Write your own components and shaders wherever a unique look or more control is needed.
- All 3D is procedural: your own geometry, GLSL shaders, GPU particles, raymarching (SDF) where it fits. No GLTF/GLB models. No downloaded images, sounds or other files. Any texture that is needed (for example a brand wordmark) is drawn in code on a canvas. The OG image and the icons are generated in code too (`app/opengraph-image.tsx`, `app/icon.tsx`).
- Renderer: WebGL with GLSL, unless the stable version of R3F has full WebGPU support and the whole stack is compatible. Check this and give the reason in the plan. WebGL-only and WebGPU-only solutions are never mixed.
- Post-processing is not required. Use it selectively, only where it truly improves the shot, and turn it off on weaker devices. §7.1 and §7.2 show the two approaches used so far. Choose in the plan, according to the art direction.
- GPU particles are the tool for backgrounds, interactive effects and shape changes (morphing). Drei helpers for simple effects, your own system where control or performance matters.
- GSAP with ScrollTrigger, ScrollSmoother and SplitText for all animation, with `@gsap/react`. No Lenis and no Motion.
- Sound is synthesized with the Web Audio API and is off until the user clicks.
- Icons only from `react-icons`.
- Fonts only through `next/font`, with no external CSS. Variable fonts are allowed and useful: font axes can be tied to the state of the scene.
- Playwright is for development only (checking the look and the flow).
- Before writing complex functionality from scratch, check whether an existing library already solves it.

## 9. Architecture and patterns (DEFAULT)

This recipe worked on both previous sites. Take it as the starting point.

### 9.1 Two layers that do not mix

- The DOM layer carries all real content: headings, text, navigation, controls. The server renders it as plain semantic HTML, so it reads well without JavaScript, WebGL or animation.
- The WebGL layer is one fixed canvas behind the DOM, purely decorative (`aria-hidden`), with one continuous 3D scene that changes as the user scrolls.
- One shared object connects the layers (`lib/store.ts`). GSAP and the DOM controls write the scroll position, the pointer and other values into it; the scene reads it every frame. The link also runs the other way: the scene writes the screen coordinates of 3D points into the store (for example `store.anchors`), so DOM elements can follow them. There is no React state per frame and there are no re-renders on scroll. **This is the most important pattern.**
- Numbers that both layers share (thresholds, pin lengths, key moments of the story) live in one place (for example `lib/beats.ts`).

### 9.2 Next.js and React

- One route, everything statically prerendered. Chapters are server components. Client components are small and add only motion and interaction.
- Everything that touches three lives in `scene/` and loads through `next/dynamic` with `ssr: false`, so the 3D code is not in the initial bundle and the text is visible immediately.

### 9.3 Tailwind and design tokens

- All colors, font sizes, letter spacings and animation curves are CSS variables in `app/globals.css` (`@theme`). The default Tailwind palette is switched off, so a component cannot use a color outside the palette.
- Composite type classes (for example `type-hero`, `type-display`, `type-title`, `type-micro`) set font, size, leading and letter spacing at once.
- Fluid sizes with `clamp()`, no separate sizes per breakpoint.
- One page grid: 4 columns on phones, 12 from tablet up.
- Custom Tailwind variants for state, instead of rules in `@layer base`. Examples: `wide:` (landscape aspect ratio, text goes into a side column), `scene-live:`, `scripting:`, `fine:` (precise pointer), `in-data-pinned:`, `in-data-loaded:`. The names are examples; check the syntax against the installed Tailwind version.
- A contrast halo or soft shadow behind text that sits over the scene, as insurance for legibility (a dark shadow on a dark site, a light halo on a light one).

### 9.4 The 3D scene

- One `<Canvas>`.
- States (poses) of the central object are flat arrays of numbers. A transition between states is an interpolation of two arrays, so the shape blends without a cut.
- The same mathematical model on the CPU and the GPU: one file with no three imports that JavaScript uses and that generates GLSL constants from the same numbers, so DOM labels can follow 3D points.
- Direction: one component (the Director) computes the camera and every scene parameter from the scroll position through keyframe tracks, like a shot list in a film (for example `scene/direction.ts`). All scene timing lives in one place.
- The state of the scene is a pure function of scroll progress, time, pointer and controls. It never depends on accumulated history, so a refresh in the middle of the page, a scroll jump and the reduced-motion variant all show the correct state.
- Shader uniforms are written through refs or class instances (for example your own material class), because the React Compiler lint forbids mutating memoized values.
- Proven tools, to use where they fit the chosen technique:
  - GPGPU particles: positions live in a texture that a shader updates every frame; each particle follows a target shape computed by a formula, with curl-noise turbulence.
  - Raymarching (SDF) for smooth, organic shapes that merge and change without a mesh: a distance field in one box, shapes joined with a smooth minimum. If it is combined with particles, the raymarch writes `gl_FragDepth` so the particles hide behind it correctly. The environment reflected in an object can be a formula in the shader (an analytic studio) instead of an image.

### 9.5 GSAP

- `lib/gsap.ts` registers the plugins once and defines the motion language: named curves and two or three durations, the same everywhere.
- ScrollSmoother provides smooth scrolling. Fixed elements (canvas, navigation, cursor) stay outside its wrapper.
- ScrollTrigger pins chapters and writes progress into the store.
- SplitText reveals text line by line, only after the fonts are loaded and the preloader has released.
- `gsap.matchMedia()` provides a separate variant for `prefers-reduced-motion`: no pins and no smooth scrolling, and each chapter then shows its own state of the scene.
- A chapter is an ordinary vertical flow in HTML. A client component sets `data-pinned` when motion is allowed, and the Tailwind variant `in-data-pinned:` then turns the flow into a pinned scene.
- After a refresh in the middle of the page the site restores the scroll position itself, only once the pins exist.

### 9.6 Sound

- An ambient layer that follows the chapter, the scroll speed and the state of the scene, plus short UI sounds.
- The audio context is created only on the first click, and is suspended when sound is off or the tab is hidden.

### 9.7 Patterns that make the difference

- **Adaptive quality.** Four tiers (`lib/quality.ts`: DPR, particle count, particle texture size, raymarch steps and the like) are chosen per device and lowered if the frame rate drops. A phone gets the same site with fewer particles and without expensive effects.
- **A preloader tied to real loading.** `lib/loadClock.ts` tracks the phases (scene code, context, shaders, first frame, fonts), and the scene draws its first frame as part of the same progress. It is best when the preloader itself becomes the subject of the first chapter without a cut.
- **Resilience.** An SVG replacement when there is no WebGL, no JavaScript, or the context is lost, and a time limit after which the preloader releases itself.
- **Framing by screen shape.** The camera moves the subject by shifting the lens (lens shift / view offset), not by turning: sideways on a wide screen, up or down on a portrait one, so the text always has its own space. Every shot has its own values for wide and for portrait.
- **DOM that follows 3D.** Labels, list rows or marks that stay next to points in the scene, through the anchors in the store.
- **A real DOM element drives the scene.** For example an accessible `<input type="range">` whose value changes the scene, a variable font axis in the headline and the sound at the same time.
- **The cursor and small fixed UI** may have their own effect (for example an SVG filter) on a small fixed layer, so it does not cost the whole screen.
- **Content in one place.** All copy in `lib/content.ts`, colors in one palette file (`lib/palette.ts`) and in `app/globals.css`, the rules of the look in `docs/ART_DIRECTION.md`.
- **Verification through scripts.** `scripts/shots.mjs` takes a screenshot of one chapter at one width. `scripts/flow.mjs` walks through the preloader, keyboard, controls, sound, refresh, the site without WebGL, a lost context, a stuck load, reduced motion and the site without JavaScript.

### 9.8 Patterns that may return in a new form

"The preloader becomes the first shot", "a DOM element drives the scene" and "the DOM follows 3D" are worth repeating as patterns. Their form must be new (§7.3).

## 10. Folding a sheet in 3D (SUGGESTION)

Fold mathematics is the main technical risk of this theme, and in the cloud you debug it at about one frame per second. Keep it simple and exact.

- **Prefer folds with closed-form motion.** Simple folds (everything on one side of a straight line rotates about that line) are always valid and give pleats, fans, a paper dart and many classic bases. One-parameter tessellations (Miura-ori, Yoshimura, Kresling-style twist towers, a waterbomb base) give structure and are computed directly from one driver value.
- **Avoid** general rigid-origami solvers, collision handling, and figures that need them (a crane, for example). They cost far more than they show.
- **Poses in fold space.** A pose is a flat array of fold drivers, not of vertex positions. Interpolating vertex positions between two folded shapes shrinks and tears the paper; interpolating fold angles along a valid path does not.
- **Changing pattern.** A flat sheet looks the same whatever its mesh. Swap the crease pattern (and the mesh, if needed) while the sheet is flat, or design the patterns over one shared lattice.
- **One model for CPU and GPU.** A sheet has few vertices. Computing them on the CPU in a three-free module and uploading them each frame is cheap, and it makes the anchors for DOM labels agree with the picture by construction. This replaces the generated GLSL constants of §9.4, so name it in the plan as a deviation if you choose it.
- **Paper that looks like paper.** Two sides in two colors. Flat faces, with a slight softness at a crease. Matte light with a little wrap. Light passing through, darker with every stacked layer. Fine fiber grain from a formula. A crease that was folded stays faintly visible after unfolding, computed from the direction file and not from history.
- **Stacked layers.** Stop folds a few degrees short of fully closed and offset layers slightly, so stacked faces do not flicker.
- **Shadows.** One shadow map for one small object is affordable on the high tiers. On the low tiers use shading derived from the fold angle and an alpha contact shadow on the page.
- **A transparent canvas over the CSS page color** leaves no seam between scene and page, and lets the page color change in CSS alone.

## 11. Order of work, phases, sessions (DEFAULT)

The order that worked:

1. Choose a niche that gives one strong central 3D subject with several states. (Done: §6.)
2. Write the art direction and the motion language before code: palette, fonts, visual signature.
3. Lay the foundation: tokens, store, scroll, canvas, quality tiers.
4. Build the scene and the camera direction with a temporary DOM. First one state all the way to finished, then the others.
5. Add the chapters as semantic HTML, then the motion on top of them.
6. Only then the preloader, cursor, sound and the fallback drawing.
7. Finally adapt to the phone and to reduced motion, and verify everything.

A default split into phases, one per session:

| Phase | Content | Done when |
| --- | --- | --- |
| 0 | Environment, versions, plan (§5) | I approve the plan |
| 1 | `docs/ART_DIRECTION.md`, tokens, store, smooth scroll, canvas, quality tiers | The page scrolls smoothly over a live canvas; lint, types and build pass |
| 2 | Scene and direction with a temporary DOM | Every state and every shot exists, in wide and portrait framing |
| 3 | Chapters as semantic HTML, then motion | The whole story reads and moves; text is legible at every scroll position |
| 4 | Preloader, cursor, sound, fallback | All signature moments work; the site survives no WebGL and no JavaScript |
| 5 | Phone, reduced motion, full verification, pull request, report | §12 and §13 are complete |

Phases 0 and 1 may share one session if the context stays small. Propose your own split in the plan if a different one is better.

## 12. Quality bar and verification (HARD)

- Text over the 3D scene stays legible at every scroll position. The framing of the scene and the layout of the text are designed together from the start, not fixed afterwards.
- The phone gets the same site on a lower quality tier, with its own framing for portrait.
- Verification is part of the work: headless browser; screenshots at 375, 768, 1024, 1440 and 1920; keyboard test; reduced motion; refresh in the middle of the page; the site without WebGL; a lost WebGL context; the site without JavaScript.
- Experience from the cloud: the scene runs on the CPU there, at about one frame per second, and one screenshot takes a minute or two. So Playwright scripts wait for state (an attribute on `<html>`, for example when the preloader has released or the scene is ready), never for a fixed time, and only what is needed gets captured.
- Verify against a production build, not the development server.
- What cannot be checked in the cloud (real frame rate, real phones, sound, Safari) must never be claimed to work. List it as unverified.

## 13. Finish (HARD)

- Open one pull request against the repository's default branch. Its text is in English.
- Give me a report in Serbian with four parts: what was done, what was verified, what was not verified, and what turned out weaker than you wanted.
- Include what I must do by hand afterwards (for example filling in the credit placeholders and importing the repository into Vercel).

## 14. Files you maintain (HARD)

| File | Purpose | Size |
| --- | --- | --- |
| `CLAUDE.md` | Rules for every session. Fill in the version table, the renderer and the post-processing decision as soon as they are known. Details do not belong here. | As short as possible |
| `docs/ART_DIRECTION.md` | The design spec: brand, story, palette, type, visual signature, motion language, voice, chapters, signature moments. | About 120 lines |
| `docs/SESSION_SUMMARY.md` | The current state and the next step (§4). | About 80 lines |
| `lib/content.ts` | All copy, including the credit placeholders. | n/a |
