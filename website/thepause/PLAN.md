# THE PAUSE — Rebuild Plan

A curated home fragrance store, rebuilt to feel like a $200k premium, subtle, award tier experience. Warmth of The Pause, motion craft of Elina Kustlyvy and StudioFMRG, discipline of the world's best commerce.

---

## 0. North star

The website should feel like exhaling. Quiet, confident, generous with space. Motion that whispers, never shouts. Every interaction earns its place. The visitor never waits, never fights a scroll, never gets a popup in the face. Premium is communicated through restraint and craft, not noise.

One line to hold the whole build to: **"Not to ask for more, but to offer less."**

---

## 1. Brand understood

| Dimension | Read |
|---|---|
| Category | Curated multi brand home fragrance retailer (authorised dealer, not own label) |
| Positioning | Objects for quiet living. Anti hustle, slow ritual, mindful calm |
| Voice | Sparse, poetic, warm. "Less noise. Less rush. Less excess." |
| Products | Candles, Diffusers, Incense, Incense Holders, Room Sprays |
| Brands carried | Hetkinen, Tribe Earth, Jade Deco, Project Element, nornōrm, Common Sense |
| Discovery spine | Mood led, not category led: Better Sleep, Work & Focus, Clear Space, Soft Reset |
| Signature features | Find Your Scent quiz, Scent Library, Scent Journal, Shop by Mood |
| Trust props | Authorised Dealer, Ready to Ship, Thoughtful Curation, Personal Support |
| Hook | 10% off first order, delivered gently, never intrusive |

**The differentiator to protect: emotion led discovery.** People shop by how they want to feel, not by product type.

---

## 2. Reference distillation: copy or beat

| Source | What it does best | Our move |
|---|---|---|
| Elina Kustlyvy | SplitText name reveal, buttery smooth scroll, Flip image transitions, refined project hover | Copy the SplitText hero and Flip transitions. Beat it by tying motion to the calm brand mood |
| StudioFMRG | Lenis smooth scroll, kinetic spaced letter reveals, editorial vertical rhythm, sticky story sections | Copy the Lenis feel and editorial rhythm. Beat it with real commerce woven into the story |
| The Pause (original) | Mood led discovery, scent library, warm palette, poetic microcopy | Keep the soul. Beat the execution: the original is a stock Shopify theme. We make it bespoke |

Convergence across all three: smooth scroll, split type reveals, big imagery, huge whitespace, subtle eased motion. That is our craft baseline.

---

## 3. Art direction

### Palette (from the real brand)
| Token | Hex | Role |
|---|---|---|
| Paper | `#f6f5f2` | Base background, the quiet canvas |
| Cream | `#f2efe6` | Alt sections, cards |
| Sand | `#c7c1b0` | Warm blocks, dividers |
| Clay | `#8a8174` | Secondary text, muted accents |
| Ink | `#1d1d1f` | Headings, primary text |
| Smoke | `#666666` | Body copy, captions |
| Ember | `#C5382E` | One signal color. Sale and alerts only, used almost never |

No pure white. No pure black. One accent. This restraint is the premium.

### Type
- **Display:** a refined grotesque with character (direction: PP Neue Montreal feel). Free stand in at build: Space Grotesk or Hanken Grotesk. Big, tight, confident.
- **Body:** Inter. Neutral, legible, calm.
- **Editorial accent:** a light serif italic (Fraunces or Newsreader italic) reserved for scent poetry and pull quotes. This one touch adds warmth and separates us from templated stores.

### Motion principles (the subtle brand)
1. Slow, long eases. Nothing snappy. Durations 0.6s to 1.2s.
2. Reveal, never bounce. Content rises and fades in.
3. One thing moves at a time. No competing animations.
4. Respect `prefers-reduced-motion`. Everything degrades to instant.
5. Motion supports reading, never blocks it. Content is visible by default.

### Photography and media
Warm, natural light, lots of negative space, product in calm interiors. We have real product and lifestyle shots staged. Video and hero motion are placeholders now, generated later with Higgsfield.

---

## 4. Information architecture

```
Home  (the showpiece)
Shop
  ├─ All
  ├─ By Category: Candles, Diffusers, Incense, Incense Holders, Room Sprays
  └─ By Mood: Better Sleep, Work & Focus, Clear Space, Soft Reset
Product detail page  (per product)
Brands  (Explore by Brand + individual brand story pages)
Find Your Scent  (quiz → recommendations)
Scent Library  (the scent language, notes, families)
Journal  (editorial, Scent Journal)
Our Story
Cart drawer  (global, slides over any page)
```

---

## 5. Homepage, section by section (the 200k experience)

| # | Section | Experience |
|---|---|---|
| 1 | Intro | Fast reveal, no loader wall. Page paints instantly. "THE PAUSE" resolves via SplitText over a live ambient hero. A breath, then you can scroll. Skippable, shown every visit but never blocks |
| 2 | Hero | Ambient lifestyle video placeholder (Higgsfield later) or lifestyle still. Tagline: "Curated objects for quiet living." Single quiet CTA: Find Your Pause |
| 3 | Shop by Mood | The signature. Four moods as large tactile panels, hover shifts light and reveals a line of copy. This leads, above category |
| 4 | Shop by Category | Five categories, clean editorial cards, custom line icons |
| 5 | Best Sellers | Product rail, quick add on hover, price, brand. Cards swap front to lifestyle on hover |
| 6 | Explore by Brand | Editorial brand cards with story. Each links to a brand page |
| 7 | Find Your Scent | Invitation to the quiz. "Not sure where to begin." Calm, warm |
| 8 | Scent Library teaser | A taste of the scent language, pulls you deeper |
| 9 | Journal | Two or three editorial pieces, slow living content |
| 10 | Why The Pause | Authorised Dealer, Ready to Ship, Thoughtful Curation, Personal Support. Custom icons |
| 11 | Newsletter | 10% off, framed as "a quiet beginning." Inline, subtle, never a popup interrupt |
| 12 | Footer | Full sitemap, calm, considered. Shop, Explore, Help |

---

## 6. Signature interactions (craft layer)

| Interaction | Behavior | Priority |
|---|---|---|
| Smooth scroll | Lenis or GSAP ScrollSmoother, gentle inertia | High |
| SplitText reveals | Headlines resolve by word or line on enter | High |
| Reveal on scroll | Sections rise and fade, staggered, subtle | High |
| Product hover | Front image cross fades to lifestyle, quick add appears | High |
| Cart drawer | Slides in, item count animates, subtotal, free ship meter | High |
| Mood panels | Hover shifts warmth and reveals copy | High |
| Magnetic buttons | CTAs subtly follow cursor | Medium |
| Custom cursor | Minimal dot that grows on interactive elements | Medium |
| Page transitions | Fade or Flip between pages, no white flash | Medium |
| Parallax | Very subtle depth on hero and editorial imagery | Medium |
| Count and decode | Reserved, likely skipped. Too loud for this brand | Low |

Discipline: subtle beats flashy. This is a quiet brand. Every effect gets a reduced motion fallback.

---

## 7. Commerce features (front end demo, cart works locally)

- **Product cards:** image, brand, name, price, quick add. Front to lifestyle hover swap.
- **Product detail page:** gallery, scent notes, mood tags, brand story block, burn or use guidance, add to cart, "pairs well with" rail.
- **Cart drawer:** local state in memory and localStorage, quantity edit, remove, subtotal, free shipping progress, poetic empty state ("A few quiet things are waiting to be discovered").
- **Filtering:** by category, mood, and brand on the shop page, instant client side.
- **Search:** client side fuzzy over the catalog.
- **Find Your Scent quiz:** a few calm questions on mood, space, and time of day, returns 2 to 3 matched products.

No real payment. Structured so a real checkout can be added later at clear seams.

---

## 8. Custom iconography

A hand drawn line icon set, warm and imperfect, not stock. Covers:
- Categories: candle, diffuser, incense, incense holder, room spray
- Moods: sleep, focus, clear, reset
- Value props: authorised dealer, ready to ship, curation, support
- UI: cart, search, account, close, arrow

Icons animate subtly on hover (draw on, gentle shift). Built as inline SVG so they inherit color and scale crisply.

---

## 9. Media plan (Higgsfield placeholders)

Every heavy media slot ships as a labeled placeholder now, generated later with Higgsfield.

| Slot | Type | Brief |
|---|---|---|
| Hero ambient | Video loop | Slow interior, candle lit, curtain breathing, dust in light |
| Mood films | 4 short loops | One per mood, abstract light and texture |
| Brand story | Stills or loops | Each brand's world, calm and tactile |
| Ritual b roll | Video | Hands lighting incense, pouring, the pause itself |
| Scent library | Abstract visuals | Scent families as light and color |

All placeholders are visible, sized correctly, and labeled so nothing looks broken before media lands.

---

## 10. Tech architecture

- **Stack:** static HTML, CSS, vanilla JS. GSAP with ScrollTrigger, SplitText, Flip via CDN. Lenis for smooth scroll. No framework, easy to preview and host anywhere.
- **Data driven catalog:** products live in one JS or JSON file so the shop, cards, PDP, cart, and quiz all read from one source. Easy to extend.
- **Structure:**
```
The Pause/
  index.html            home
  shop.html             shop + filters
  product.html          PDP (renders from data by id)
  brand.html            brand story (renders by id)
  find-your-scent.html  quiz
  scent-library.html
  journal.html
  our-story.html
  /assets   products, lifestyle, brand, logo (staged)
  /css      tokens.css, base.css, components.css, pages
  /js       data.js, cart.js, motion.js, quiz.js, main.js
  /icons    inline SVG set
```
- **Performance budget:** fast first paint, lazy loaded media, no layout shift, responsive images. Motion never blocks content.
- **Accessibility:** semantic HTML, keyboard reachable, focus states, alt text, reduced motion, WCAG AA contrast.
- **Responsive:** mobile first. The intro, mood panels, and cart all reflow cleanly to phone.

---

## 11. Build phases

| Phase | Delivers |
|---|---|
| 1. Foundation | Tokens, layout system, nav, footer, Lenis smooth scroll, product data model |
| 2. Home showpiece | Intro reveal, hero, mood panels, category, best sellers, brand, journal, newsletter |
| 3. Commerce | Shop page with filters, PDP, cart drawer, quick add, localStorage |
| 4. Discovery | Find Your Scent quiz, Scent Library, brand pages |
| 5. Craft and polish | Custom icons, motion pass, page transitions, magnetic buttons, cursor, micro copy |
| 6. Media and QA | Higgsfield media integration, responsive pass, accessibility pass, cross browser, final polish |

---

## 12. Success bar

Ship a site that:
- Feels like it cost $200k. Premium through restraint.
- Loads instantly, intro delights and never bothers.
- Is unmistakably The Pause: warm, quiet, considered.
- Moves like Elina and FMRG: smooth, subtle, crafted.
- Sells like the world's best: mood led discovery, frictionless cart.
- Looks bespoke, never templated.

If a visitor's shoulders drop one inch, we won.
