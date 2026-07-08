# Bangi Demo · Chosen Design Direction (locked 7 Jul 2026)

Decided by a 5-researcher / 3-direction / 3-judge workflow. Winner by aggregate + majority:

## THE ESTATE ALMANAC (+ 3 grafts)

A warm printed-journal reading of the 600-acre estate: ivory paper pages, a running chapter
index, editorial captions. Springs' poetic chapters routed through Sunway-clean wayfinding.
Signature move: a dawn-to-dusk chapter that reads its light off a colour-temperature clock,
closing on the estate-lake dusk photo whose lone tree rhymes with the gold tree wordmark.

### Grafts folded in
1. **Dawn-to-dusk colour-temperature spine** (from "A Day on the Estate") drives the 600-acre band: one master ScrollTrigger walks a `--tod` var, a fixed gradient layer goes dawn peach → golden hour → `#10170B` dusk. Info-rich: every chapter anchors real numbers.
2. **Interactive numbered estate plan** (from "Field Guide") as a band under the hero: hotspots 01 Hotel · 02 Golf · 03 Farm · 04 LaVista · 05 Lake · 06 Ballroom · 07 Arrival over the fairway-skyline + lake photos, forest scrim locked for legibility, each an `<a href=#anchor>` revealing a fact-chip. Reflows to a stacked numbered list under tablet width.
3. **Four-route booking sheet** (from "Field Guide"): the gold "Check dates" button opens a small in-page sheet resolving to Room (SwiftBook) / Golf tee-time / LaVista court / Function & Event enquiry. Resolves the multi-business ambiguity that leaks bookings.

## Design system
- **Type:** Fraunces (Google, variable, opsz high ~120, weight 340–400) for ALL display + numerals; General Sans (Fontshare) 400 body / 500 labels for body + UI. Rule: serif never sets a paragraph, sans never sets a hero line. JetBrains Mono retired (courts the IAQ look); eyebrows are General Sans 500 uppercase 0.09em in muted gold.
- **Palette:** `--paper #F6F1E6`, `--paper-2 #EFE7D6`, `--ink #161D10`, `--green-deep #10170B`, `--forest #1C2A14`, `--gold #B27409` (VERIFIED brand), `--gold-muted #B0A06C` (VERIFIED). **Gold-as-ink law:** gold never fills an area larger than a button; links, one CTA per view, active chapter, key numeral only.
- **Nav:** sticky slim on paper, gains a 1px gold hairline + faint tint on scroll (no morph). Five intent labels: Stay · Meet · Play · Farm · Offers. Meet opens a 2-col panel (leisure/wedding | conference/MICE). Right-aligned solid-gold "Check dates" → four-route sheet. Mobile: hide on scroll-down, return up; fixed bottom thumb-zone bar, one 48px action.
- **Chapter index:** fixed right-edge (Introduction · Fairways · The Larder · Gatherings · Dusk), active in gold, real anchors; collapses to a thin top scaleX progress bar on mobile.
- **Photo treatment:** Kerry-Hill framing (ivory margin + 1px gold inner border) alternating with full-bleed forest bands; one warm-dusk grade across all photos so the mixed set reads as one shoot. Durian/figs shot calm on ivory, captioned like wine (variety, MyGAP line).
- **Motion:** clip-path inset reveal (one-shot, visible-by-default), Fraunces headline line-rise behind masks (headings only, max 2/screen), count-ups (real number in DOM first), 0.2–0.35 depth parallax on framed photos only, nav hairline solidify, loader particle→wordmark. One lightly-pinned band (600 acres) on the homepage only. Body copy never moves. Full reduced-motion path (freeze `--tod` at dusk, static captioned collage).
- **3D garnish only:** loader (gold particles → songket diamond → tree wordmark, <1.5s) + small dusk footer diorama. No pinned WebGL anywhere.

## Homepage bands
1 Loader · 2 Hero (still dusk-pool `<img>` LCP, ken-burns, wordmark + one Fraunces line lower-left, one gold CTA, rate-transparency line) · 3 Two-door split (Come for the day | Stay the night, "open to all, no membership needed") · 4 Interactive estate plan (graft 2) · 5 Route tiles (6 labelled photo tiles) · 6 The Almanac / 600 acres dawn-to-dusk (graft 1, the showpiece) · 7 Count-up stat band on forest ground · 8 Bundle cross-sell rail (Stay & Play, Farm Day, Meet & Reward) · 9 News · 10 Offers teaser · 11 Member-rate capture · 12 Contact + footer diorama · 13 BM ribbon.

## Distinct from IAQ (the escape)
IAQ = navy #0A101F, Switzer grotesque sans headlines, mono engineering readouts, hover-expand rows, pinned WebGL showpiece. Almanac = warm ivory paper, literary variable serif (Fraunces), editorial eyebrows, a photo-and-fact reading chapter on a colour-temperature clock, 3D confined to loader + footer. Opposite register.

## Photo → band map (real assets, all credited)
- Hero: `hero-pool.webp` (dusk pool) · Estate plan grounds: `golf-skyline.webp`, `estate-dusk.webp`
- Fairways: `golf-skyline.webp`, `golf-buggy.webp`, `golf-clubhouse.webp` · The Larder: `durians.webp`, `farm-figs.webp`, `farm-fig-tree.webp`
- Gatherings: `ballroom-wedding.webp`, `ballroom-banquet.webp`, `wedding-pelamin.webp` · Dusk plate: `estate-dusk.webp` (lone tree = logo rhyme)
- Stay: `room-premier.webp`, `room-towel.webp` · LaVista: `lavista-court.webp` · Taste: `dining-local.webp`, `buffet.webp`
