# Page conversion contract (static HTML → React)

Source files live in `_source/*.html` (already webp-referenced). Each page becomes:

- `src/pages/<Name>.jsx` — the component
- `src/styles/<name>.css` — the page's own styles
- `src/scenes/<name>.js` — ALL of the page's inline scripts, ported

## Component shape

```jsx
import React, { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initPage from '../scenes/<name>.js'
import '../styles/<name>.css'

export default function Name() {
  useEffect(() => {
    document.title = '<the page's original <title>>'
    return initPage()   // initPage returns its cleanup function
  }, [])
  return (<><Nav /> ...page markup... <Footer note="<original f-base note text>" /></>)
}
```

## What the shell already owns — NEVER duplicate these

Markup to OMIT from page JSX: `.topbar`, `<nav class="nav">` (incl. drawer), `<footer class="sitefoot">` (incl. BM ribbon), `.us-overlay` search markup, `#bmBack` button.

Scripts to OMIT from scenes file: nav scroll hide/float, burger drawer, Lenis setup, universal search, BM ribbon canvas, bmBack/embedded detection, any `<script src>` CDN tag.

CSS to OMIT from the page css (base.css owns them): `:root` tokens, `*`/`html`/`body` resets, desktop `zoom` nudge, `h1,h2,h3`/`a`/`.wrap`/`.eyebrow`, `.topbar`/`.brandmark`/`.wsw`, all `.nav*` (incl. burger + drawer), `.cta`, `.head` base block, `#bmBack`, `.sitefoot*`, `.bm-footrib*`, `.nav-search`, `.us-*`, the shared `@media(max-width:760px)` mobile-pass block (keep any page-specific selectors from inside it by moving them into the page css), the tap-target `@media (hover:none)` block, compact-footer block. Everything else in the page's `<style>` blocks is KEPT verbatim in the page css.

## JSX conversion rules

- `class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`, `autocomplete` → `autoComplete`, `crossorigin` → `crossOrigin`, `frameborder` → `frameBorder`, `allowfullscreen` → `allowFullScreen`.
- SVG: `stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `stroke-linejoin` → `strokeLinejoin`, `fill-rule` → `fillRule`, `clip-rule` → `clipRule`, `stop-color` → `stopColor`, `stroke-dasharray` → `strokeDasharray`, etc. `viewBox` stays.
- Inline `style="a:b;c:d"` → `style={{a:'b', c:'d'}}` (camelCase props).
- Void elements self-close: `<img />`, `<br />`, `<input />`, `<source />`.
- HTML comments → `{/* */}` or drop.
- `&middot;` and friends are fine inside JSX text.
- Keep every id, class, data-* attribute EXACTLY as in source — the ported scripts select on them.

## Link mapping (React Router)

`import { Link } from 'react-router-dom'` and convert internal links:
`index.html`→`/`, `about.html`→`/about`, `projects.html`→`/projects`, `project.html?p=N`→`/projects/N`, `careers.html`→`/careers`, `contact.html`→`/contact`. Keep hashes: `index.html#services`→`/#services` (as `<Link to="/#services">`). Pure same-page anchors (`href="#x"`) stay as plain `<a>` (the Shell smooth-scrolls them). Asset paths `assets/...` → `/assets/...` (also inside CSS `url()` and JS strings).

## Scenes file rules

- `export default function initPage() { ... return cleanup }`.
- Wrap the original IIFEs' bodies; preserve logic verbatim. Do not refactor working code.
- Three.js: DELETE the CDN `URLS`/`load(i)` ladder. `import * as THREE_MOD from 'three'` at top; where the code did `import(URLS[i]).then(m=>init(m))`, call `init(THREE_MOD)` directly (keep the try/catch + nogl fallback).
- GSAP: `import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger)`. Remove any `window.gsap`/`window.ScrollTrigger` feature checks (they exist now).
- Lenis: already global as `window.__lenis`; do not create another.
- CLEANUP contract (returned function): remove every document/window listener the scene added (keep named references), disconnect IntersectionObservers/ResizeObservers, clearInterval/clearTimeout ids, cancel rAF loops via a shared `let dead=false` flag checked at the top of each frame function AND `cancelAnimationFrame` of stored ids, `ScrollTrigger.getAll().forEach(t => t.kill())`, and dispose WebGL renderers (`renderer.dispose()`) where a reference exists. Element-scoped listeners on page-local nodes can be left (nodes unmount).
- `document.getElementById(...)` calls run after mount (useEffect), so they find the page's DOM. Keep null-guards as in source.
- Keep `window.__usApplyQ` assignment where a page defines it (careers/projects deep-link filter); cleanup must `delete window.__usApplyQ`.

## Fidelity bar

Pixel-identical rendering and behavior against the static page is the acceptance test. When in doubt, copy the source verbatim rather than improving it. No dashes in copy, no exclamation marks (house rule) — the source already complies; do not introduce any.
