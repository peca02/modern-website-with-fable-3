# Project Overview

One-page, statically prerendered site for a fictional origami / paper-engineering brand: scroll-driven animation over a single procedural 3D scene. Frontend only (no database, no API, no CMS). Deployment target: Vercel.

- Full brief and rules in detail: `PROMPT.md` (read only the sections you need).
- Design spec: `docs/ART_DIRECTION.md`. Current state and next step: `docs/SESSION_SUMMARY.md`.
- Language: everything written to the user is in Serbian. Everything in the repository (code, comments, docs, commits, PR text, site copy) is in English.

## Stack and exact versions

Replace each `TBD` with the exact version as soon as the trial install proves the set works together. Install with `--save-exact`. Do not upgrade mid-project without recording the reason here.

| Package | Version |
| --- | --- |
| Node / npm | 22.23.4 / 10.9.9 |
| next (App Router, static), eslint-config-next | 16.4.6 |
| react, react-dom (React Compiler on, babel-plugin-react-compiler 1.0.0) | 19.3.1 |
| typescript (strict) | 6.0.3 (not 7: typescript-eslint needs <6.1) |
| tailwindcss, @tailwindcss/postcss | 4.3.5 |
| three, @types/three | 0.187.0 |
| @react-three/fiber | 9.8.2 |
| @react-three/drei | 10.7.9 |
| gsap (ScrollTrigger, ScrollSmoother, SplitText) | 3.15.1 |
| @gsap/react | 2.1.2 |
| react-icons | 5.7.0 |
| eslint | 9.39.5 (not 10: eslint-plugin-import/react/jsx-a11y stop at 9) |
| playwright (dev only, matches the pre-installed Chromium 1243) | 1.63.0 |

- Renderer: WebGL + GLSL (stable R3F 9 has no full WebGPU path; never mixed). Post-processing: none; transparent canvas over the CSS page color, MSAA, one shadow map on the upper quality tiers.
- Fonts: Anybody (display, `wdth` + `wght` axes) and Literata (text, `opsz`) through `next/font/google`.
- Not allowed: Lenis, Motion / Framer Motion, GLTF/GLB models, downloaded images, audio or video, icons outside react-icons, fonts outside next/font, external CSS.

## Working mode and budget

Pro plan, most expensive model, small 5-hour limit: saving tokens matters more than speed. Ultracode is not used.

1. Start in the main thread. It is the default for everything connected: foundation, tokens, scene, integration, fixes, polish.
2. A task appeared? An agent is allowed only if the task is all three: large (hours of work, many files), isolated (its own files nobody else touches), and describable in a short brief. No: it stays in the main thread. Yes: announce the agent to the user in one sentence (what and why not in the main thread), start one without waiting for approval, review the result, commit and push.
3. The main session is getting too large? Write `docs/SESSION_SUMMARY.md`, commit, push, and suggest a new session. Never wait for autocompact (set at 400k tokens).
4. The limit ran out? After the reset, resume exactly one thing.

- Agents run strictly one at a time, never in parallel and never in a batch. Lessons from one agent go into the next agent's brief.
- An interrupted agent with little work left is finished by the main thread. Restart it only if a lot remains.
- Reviews: first pass in the main thread. A reviewer agent only when fresh eyes are needed, one at a time.
- Commit and push after every step that works. The session can stop at any moment.
- Keep context small: read a file once and only the part needed, keep command output quiet, take screenshots for one chapter and one width per run.
- One phase per session by default. At the end of a phase write `docs/SESSION_SUMMARY.md` (done, verified, remaining, open questions, file paths, branch), commit, push, and tell the user it is a good moment for a new session.
- A new session starts by reading this file, `docs/SESSION_SUMMARY.md` and `docs/ART_DIRECTION.md`, not the whole codebase. Keep those three files short.
- Before building complex functionality from scratch, check whether a library already in the stack solves it.

## Architecture

- Two layers that never mix. The DOM layer carries all real content as server-rendered semantic HTML and must read fine without JavaScript, WebGL or animation. The WebGL layer is one fixed, decorative (`aria-hidden`) `<Canvas>` behind it with one continuous scene.
- The layers talk only through the shared mutable object in `lib/store.ts`, in both directions: GSAP and DOM controls write scroll, pointer and control values; the scene reads them every frame and writes screen positions of 3D points (`store.anchors`) for DOM elements to follow.
- No React state per frame and no re-renders on scroll.
- Anything that imports `three` lives in `scene/` and loads only through `next/dynamic` with `ssr: false`.
- Scene state is a pure function of scroll progress, time, pointer and controls. All scene timing lives in `scene/direction.ts`. Numbers shared by both layers live in `lib/beats.ts`.
- Shader uniforms are written through refs or class instances (for example a custom material class), never by mutating memoized values: the React Compiler lint forbids it.
- All copy lives in `lib/content.ts`. Colors come only from tokens (`app/globals.css`, mirrored for the scene in `lib/palette.ts`).
- Everything 3D is procedural. Textures, the OG image and icons are drawn in code (`app/opengraph-image.tsx`, `app/icon.tsx`).
- Sound is synthesized with the Web Audio API, off until the user clicks. The context is suspended when muted or when the tab is hidden.

## Project Structure

/app          → the single route, `globals.css` (tokens), generated OG image and icon
/components   → DOM layer: server chapters, small client components
/scene        → everything that imports three
/lib          → store, beats, content, palette, gsap, quality, loadClock, audio
/hooks        → custom React hooks
/types        → shared TypeScript types
/scripts      → Playwright development scripts
/docs         → ART_DIRECTION.md, SESSION_SUMMARY.md

Create folders only when needed. Do not create empty directories.

## Typography

- Fonts only through next/font. Variable fonts are welcome.
- Body line height 1.4-1.6. Large text 1.1-1.3; hero display type may go down to 0.9, set once in its type token.
- Line length 50-75 characters.
- Use the composite type classes defined in `app/globals.css` (font, size, leading and tracking in one class). Fluid sizes with `clamp()`, no per-breakpoint sizes.

## Layout & Spacing

- One page grid: 4 columns on phones, 12 from tablet up.
- Tailwind spacing scale only: px/rem in multiples of 4px, em in multiples of 0.25em. No arbitrary values like 7px or 0.37em. Type tokens (fluid sizes, letter spacing) are the only exception and live in `@theme`.

## Animation

- GSAP for all animation, through `lib/gsap.ts` (plugins registered once, named eases and durations) and `useGSAP` from @gsap/react. Native CSS only for simple transitions and hover states.
- Every motion has a `prefers-reduced-motion` variant through `gsap.matchMedia()`.

## Code Standards

- Never ignore TypeScript errors. Fix root causes; no `any`, no type assertions used as a bypass.
- Do not disable ESLint rules (React Compiler rules included).
- Named exports only. Exception: Next.js special files (`page.tsx`, `layout.tsx`, `opengraph-image.tsx`, `icon.tsx`).
- camelCase for variables and functions, PascalCase for components, types and classes.
- Avoid obvious comments. Explain why only when necessary.

## Components

- Server components by default. Chapters are server components; client components are small and add only motion and interaction.
- Respect server/client boundaries: client-only utilities live in client components and receive data through props.
- Functional components, small and focused, one main component per file.
- Check existing components before creating new ones. Reuse and compose instead of duplicating. Use variants only for real, repeated options.
- Per-frame values go through `lib/store.ts`, never through props, Context or React state.

## Styling Guidelines

- Design tokens are the single source of truth, implemented as CSS variables in `@theme` in `app/globals.css`. The default Tailwind palette is disabled.
- Use semantic Tailwind utilities mapped to tokens for colors, shadows, radius and eases. Standard utilities for layout and spacing.
- State is styled with the project's custom Tailwind variants, not with rules in `@layer base`.
- No hex codes in components. No arbitrary Tailwind values unless necessary. No extra CSS files.

## Performance

- Static rendering only. Text is visible before the scene loads; 3D code is not in the initial bundle.
- Quality tiers live in `lib/quality.ts`: chosen per device, lowered when the frame rate drops.
- Use next/link for internal navigation.

## Responsive Design

- Works on phone, tablet and desktop. The phone gets the same site on a lower quality tier with its own portrait framing.
- Prefer fluid tokens and the grid over breakpoint utilities.

## Accessibility

- Full keyboard-only navigation, visible focus states, screen reader compatibility.
- Semantic HTML by default. ARIA only when native semantics are insufficient.
- Text over the scene stays readable at every scroll position.

## SEO & Metadata

- Use the Next.js Metadata API (static `metadata` export; `generateMetadata` only if values are computed).
- One H1 per page. Heading levels in logical order, none skipped.

## Verification

- Playwright scripts wait for state (an attribute on `<html>`), never for a fixed time. In the cloud the scene renders on the CPU at about one frame per second.
- Never claim something works if it could not be checked here (real frame rate, real phones, sound, Safari). List it as unverified.
