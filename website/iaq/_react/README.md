# IAQ Group website (React)

Website concept for IAQ Technology by Brand Method, restructured to the production format: React, feature-grouped folders, WebP assets.

## Run

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Structure

| Path | What lives there |
|---|---|
| `src/pages/` | One component per route: Home, About, Projects, ProjectDetail, Careers, Contact |
| `src/components/` | Shared shell: Nav (topbar, nav, burger drawer), Footer (incl. BrandMethod ribbon), UniversalSearch (Cmd+K / "/" overlay), Shell (Lenis smooth scroll, cross-route hash deep links, embedded back button) |
| `src/scenes/` | Each page's animation/3D code as `init<Page>()` returning a cleanup function, invoked from the page's `useEffect` |
| `src/styles/` | `base.css` (tokens, shell, search overlay, shared mobile pass) plus one css file per page |
| `src/data/` | `search.js` (58-entry universal search index), `projects.js` (the 18-project registry driving cards, detail pages, related work) |
| `public/assets/` | All media. Images are WebP (quality 82). Videos are H.264 mp4, compressed |
| `public/audit.html`, `framework.html`, `portal.html` | Standalone Brand Method concept shell pages |
| `_source/` | The static HTML pages the React app was converted from (working reference) |
| `legacy-static/` | Untouched snapshot of the original static site with original media |

## Routes

`/` home, `/about`, `/projects`, `/projects/:id` (0..17), `/careers`, `/contact`. Hash deep links work across routes (`/#services`, `/careers#q=Engineer%2C%20Process`).

## Conventions

- Libraries are npm dependencies (three 0.184, gsap 3.12.5, lenis 1.3.4), no CDN scripts.
- Every scene module cleans up after itself: listeners, observers, timers, rAF loops, ScrollTriggers, WebGL renderers.
- CSS: design tokens on `:root` in `base.css`; IAQ red is `#EC2027`. Page css owns everything page-specific.
- Copy rules: no dashes as separators, no exclamation marks.

## Suggested next steps for production

- Move to Next.js (app router) if SEO/SSR is required: pages map 1:1, scenes become client components.
- Swap the AI-generated hero clips for real site footage or composite the real IAQ logo in post (current clips carry a generic wordmark).
- Wire the contact form and careers apply flow to a real backend.
