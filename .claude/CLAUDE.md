# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Browser Capabilities Tester

## Overview
Static browser capabilities tester. No framework, no build tool, no package manager, no tests. Pure HTML/CSS/JS served as-is. Hosted on GitHub Pages via `.github/workflows/static.yml` — every push to `main` deploys the repo root automatically. There is no build step; to develop, open the files in a browser (or any static server) and reload.

## File Structure
```
index.html          — home page, hero + feature grid
pages/<name>.html   — one HTML file per feature area
js/<name>.js        — one JS file per feature area (entry point for that page)
js/utils.js         — shared result-rendering helpers (window.BrowserTester)
js/theme.js         — theme resolution, runs in <head> before paint
js/ui.js            — nav + theme-switcher wiring, runs on every page
css/styles.css      — single shared stylesheet, design-token based
favicon.svg
```

Feature areas: `media`, `forms`, `security`, `api`, `data`, `graphics`, `performance`, `accessibility`, `activity`, `jwt`.

Each area is `pages/<name>.html` + `js/<name>.js`, sharing `css/styles.css`, `utils.js`, `theme.js`, and `ui.js`.

## Architecture

### Shared result helpers — `window.BrowserTester` (`js/utils.js`)
`showResult`, `showInfo`, and `showPending` are defined once in `utils.js` and exposed on the global `window.BrowserTester`. Feature scripts pull them in at the top of their `DOMContentLoaded` handler:
```js
const { showResult } = window.BrowserTester;   // or showInfo / showPending
```
- `showResult(container, feature, supported)` — `supported` is a **bool or a string**. Bool renders `.success`/`.failure` with a `data-status` of `PASS`/`FAIL` and text "Supported"/"Not Supported". A string renders `.info` (neutral data display) with no status badge, using the string as-is.
- `showInfo(container, feature, message)` — thin alias for the string form.
- `showPending(container, feature)` — renders a `.pending` row with `data-status="PENDING"` and "Running..." text, for async tests to update later.
- `updateResult(div, feature, supported)` — **resolves a pending row in place**, rewriting its class, `data-status`, and text. A row from `showPending` must be finished with this; assigning `textContent` directly leaves the row styled and badged `PENDING` forever.
- `showError(container, feature, message)` / `markError(div, feature, message)` — append, or convert in place, a `.failure` row badged `ERROR`. For a test that threw, as opposed to a capability that is absent.
- `runSection(label, container, fn)` — runs one page section inside a try/catch. On a throw it renders an error row in `container` (pass `null` to only log) and lets later sections continue. **Each independent section of a feature script should be wrapped in this**, so one failure cannot silently truncate a page.

The `data-status` value is surfaced visually by CSS (`.test-result::before { content: attr(data-status) }`), so pass/fail does not rely on color alone.

### Capability checks — accuracy rules
A check that cannot fail is worse than no check. Two traps this codebase has already hit:
- **Media queries**: test with `matchMedia(q).media !== 'not all'`. `MediaQueryList.toString()` returns `"[object MediaQueryList]"` and so never equals `'not all'`.
- **CSS custom properties**: probe with `style.setProperty` / `style.getPropertyValue`. Custom properties are not CSSOM attributes, so `style['--x'] = v` sets a JS expando and always round-trips.

Label rows for what is actually measured. Where a capability is not observable from JS at all (GPU acceleration, HSTS, assistive-technology behavior), state that in a `showInfo` "Scope" row rather than reporting a proxy as the real thing.

### Reduced motion
`prefers-reduced-motion: reduce` is honored in three places, and new motion must honor it too: CSS animations and `scroll-behavior` are gated in `styles.css`, the nav's scroll-to-top in `ui.js` passes `behavior: 'auto'`, and the Graphics demos (canvas, WebGL, CSS keyframes, SVG SMIL) draw one static frame instead of starting a loop.

The Graphics demos read the preference once, when the demo is built — unlike the theme system, they do not subscribe to `change`. Toggling the OS setting takes effect on the next reload.

### WebGL contexts
Contexts are a limited per-document resource, so probes go through `withWebGLContext(type, fn)` in `graphics.js`, which releases via `WEBGL_lose_context` when done. Only the on-screen demo canvas holds a context for the life of the page.

### Theme system (`js/theme.js` + `js/ui.js`)
Three modes cycle in order: `auto` → `light` → `dark`.
- **`theme.js` loads in `<head>`** (before the stylesheet renders content) to set `data-theme`/`data-theme-mode` on `<html>` early and avoid a flash of the wrong theme. It exposes `window.BrowserTesterTheme`.
- Mode is persisted in `localStorage` under `theme-mode`, and can be forced via a `?theme=auto|light|dark` query param (which also gets saved).
- **`ui.js` loads at the bottom of `<body>` on every page.** It wires the `#themeSwitcher` button (cycles modes), keeps the label in sync, reacts to OS `prefers-color-scheme` changes while in `auto`, and **rewrites every internal `.html` link to carry the current `?theme=` param** so the chosen theme survives navigation. It also intercepts same-page nav clicks to smooth-scroll to top.

### Page load order (matters)
1. `<head>`: `js/theme.js` (early theme), then `css/styles.css`, then `favicon.svg`.
2. Bottom of `<body>`, in order: `js/ui.js`, `js/utils.js`, `js/<name>.js`.

`utils.js` **must** load before the feature script, because the feature script reads `window.BrowserTester` at the top of its handler.

## HTML Conventions
- `<!DOCTYPE html>`, `lang="en"`, UTF-8 charset, viewport meta.
- `<head>` order: `theme.js`, stylesheet, favicon (see load order above).
- Body carries a page-type class: `home-page` on the index, `tool-page` on feature pages.
- First element in `<body>`, before the nav: `<a class="skip-link" href="#main-content">Skip to content</a>`. The target `<main id="main-content" tabindex="-1">` carries the `tabindex` so focus actually moves rather than only scrolling.
- Index nav: `.nav-home` link + `#themeSwitcher` button. Subpage nav is a full `.tool-nav` with a Home link and a `.nav-links` list of every feature page; the current page's link has `aria-current="page"`.
- Content wrapped in `<main id="main-content">`.
- CSS linked from `../css/styles.css` (subpages) or `css/styles.css` (index).
- Page title pattern: `<Feature Name> - Browser Tester`.

## JS Conventions
- ES6+, no frameworks, no imports, no bundler. Globals are shared via `window.*` namespaces (`BrowserTester`, `BrowserTesterTheme`).
- Entry point: `document.addEventListener('DOMContentLoaded', () => { ... })`, with DOM queries at the top of the listener.
- Vanilla event listeners, no jQuery.
- Use the shared `BrowserTester` helpers for rendering results rather than re-implementing them.

## CSS Conventions
- Single file: `css/styles.css`.
- **Design-token based**: a large `:root` block of custom properties (colors, surfaces, radii, shadows, spacing), with a `:root[data-theme="dark"]` override block. Style new components by consuming these variables, not hard-coded colors.
- Reset: `* { margin: 0; padding: 0; box-sizing: border-box; }`.
- `:focus-visible` styles are defined for nav links, buttons, the theme switcher, and form fields.
- Result classes: `.test-result` base + `.success` / `.failure` / `.info` / `.pending`; the `data-status` attribute drives the text badge via `::before`.
- Respects `@media (prefers-reduced-motion)`.

## Deploy
Push to `main` → GitHub Pages deploys the entire repo root. No build step.

---

## Open Issues

Severity: **P0** = broken/visible to users, **P1** = incorrect behavior, **P2** = wrong but low impact.

### ARCH-03: `runSection` guards are per-section, not per-test
- `runSection` stops one section from killing the next, but a throw still skips the remaining rows *within* its own section. Fine for now; revisit if individual checks start failing in ways that matter.

### ARCH-04: Six feature scripts still have no `runSection` guard
- `media.js`, `forms.js`, `security.js`, `api.js`, `activity.js`, and `jwt.js` still run their sections unguarded, so a throw in one truncates the rest of the page. Convert them the way `accessibility.js` and `data.js` are written: one `runSection(label, container, fn)` per `<section>`.

### NOTE-03: Accessibility tests don't test accessibility
- `js/accessibility.js` mostly proves `setAttribute`/`getAttribute` works, which every browser passes. It doesn't exercise screen-reader behavior, focus management, or any real a11y API. The media-query checks are now real (`.media`), and the page carries a "Scope" row, but the reflection rows are still near-tautological.

### NOTE-05: Activity log ordering contradicts `role="log"`
- Entries are inserted newest-first while `role="log"` implies newest-last. The mouse and keyboard logs are `aria-live="off"` so they no longer announce, but fixing the order properly needs scroll-to-bottom handling.

### NOTE-06: Deferred P2 cleanups
- Literal backticks in the `pages/jwt.html` lede; `navigator.appVersion` reported as "Browser Version"; `getOS()` and `getPlatformHint()` returning the same value in Chromium; hard-coded colors bypassing tokens (`.demo-canvas`, `.visual-demo`, `.diff-panel`, `.feature-card` hover); non-passive `mousemove`/`wheel` listeners plus a bfcache-blocking `beforeunload` in `activity.js`; unordered async image rows in `media.js`; `diffObjects` computed twice per section in `jwt.js`.

---

## Recently Resolved (kept for context)
- `showResult` extracted to `js/utils.js` / `window.BrowserTester` (was duplicated per file).
- Dark mode shipped (full theme system, `theme.js` + `ui.js`, CSS custom properties).
- Pass/fail no longer color-only — `data-status` PASS/FAIL text badge via CSS.
- `.btn` / nav / fields now have `:focus-visible` styles.
- Activity logs use `role="log"` + `aria-live="polite"`.
- `gl-matrix` CDN dependency removed from `pages/graphics.html`.
- ARCH-01 / ARCH-02 — `runSection` + `showError`/`markError` added, and a throw now renders an ERROR row instead of silently truncating the page. Wired up in `accessibility.js`, `data.js`, `graphics.js`, and `performance.js`; see ARCH-04 for the six scripts still unguarded.
- A11Y-05 — skip link on all 11 pages, `<main>` given `tabindex="-1"`.
- NOTE-04 — obsolete. `navigator.platform` is gone; `getOS()` uses `userAgentData.platform` with UA fallbacks.
- Pending rows resolve correctly — benchmarks in `js/performance.js` no longer display as `PENDING` forever (`updateResult`).
- Media-query and custom-property checks can now actually fail (`.media`, `setProperty`) — they previously passed in every browser.
- Emoji check fixed: was painting above the canvas at baseline y=0 and always reporting FAIL.
- Hardware Acceleration section replaced with Graphics Hardware — reported two things it did not measure.
- Geolocation moved behind an explicit button; opening the Data page no longer triggers a permission prompt.
- `theme.js` survives blocked `localStorage`; the `ui.js` fallback resolves `auto` against the OS instead of forcing light.
- JWT compare fields relabeled — buttons inside the `<label>` were stealing the accessible name from the textareas.
- Fullscreen JWT compare no longer prints "Comparison Summary:" twice, and its cloned node no longer duplicates an `id`.

---

## Feature Ideas
- **Export / share results** — download all results as JSON or copy a shareable summary.
- **More media codecs** — AV1, HEVC/H.265, Opus, AAC, FLAC.
- **WebGPU detection** — `navigator.gpu`, successor to WebGL.
- **Score / summary on homepage** — run a subset of tests on the index and show a per-category capability score.
- **In-page section navigation** — jump between test sections within a page (cross-page nav already exists via `.tool-nav`).
- **Loading / progress states** — surface progress while tests run, especially on the performance page where tests block the thread.
