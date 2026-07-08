# Bangi Resort Hotel Demo · Design Direction & References

Companion to `BANGI-DEMO-BRIEF.md`. That file says WHAT to build (the 3-tab package, the audit facts, the pages). This file says HOW it should look, move and feel. All references verified live 7 Jul 2026.

---

## 1 · The direction, decided

**"The 600-acre estate, one front door."**

A Malaysian estate-resort editorial site: calm, premium, photography-led, with rich but disciplined motion. The client reference (springs.house) liked: parallax depth, progressive reveals, premium restraint. The client reference disliked: navigation friction. So the formula is:

| Ingredient | Taken from | What it gives Bangi |
|---|---|---|
| Intent-based navigation, 5 items max | The Newt in Somerset | **Stay · Meet · Play · Farm · Offers** + one persistent Book CTA. Maps the whole estate to visitor intent, not org chart |
| The estate map as the signature moment | Primland, Estelle Manor | The pinned 3D/scroll scene: fly across the 600 acres, hotel → golf → farm → LaVista, numbered venue stops |
| Buttery continuous-film scroll feel | Soneva | Lenis smooth scroll + GSAP reveals + subtle multi-rate parallax. The "super awesome" feel without hijacking |
| Local premium tone | The Datai Langkawi | Serene nature-led Malaysian luxury, quiet serif, muted greens; the standard Bangi's market already recognises |
| Booking calm | Aman, Datai | One persistent "Book direct" action + a sticky compact date bar. Never a widget wall |
| Editorial warmth | Primland Residences, Cheval Blanc | Narrative reveals down the page, CTAs at interest peaks, video as punctuation not wallpaper |

**Palette (verified + inference):** Bangi gold `#B27409` and muted gold `#B0A06C` are pulled from their live CSS (fact). Pair with a deep estate green sampled from the BRH tree logo at build time (inference, verify against `assets` logo) on warm cream/white, in the two-color restraint Primland proves works. Dark bands in deep green, not navy.

**Type:** keep the house demo split: display serif (Fraunces or a warmer estate serif) + Instrument Sans/Switzer body + JetBrains Mono labels. Their current site runs Montserrat/Roboto; the demo upgrades typography deliberately, it is presentation, not brand, so it stays inside the "no rebrand" line.

**Voice:** Datai-calm, concrete, Malaysian. "Six hundred acres, twenty minutes from Putrajaya." No superlative soup.

## 2 · The reference stack (all verified live, 7 Jul 2026)

1. **Explore Primland** · https://explore.ownprimland.com/ · Awwwards SOTD Feb 2026, WebGL fly-over of a 12,000-acre golf estate, forest green `#456A4B` on cream `#FFFBE7`. **Steal:** the interactive estate map as navigation, the single calm Inquire CTA. **Avoid:** hiding conventional nav, forced portrait on mobile.
2. **Primland Residences** · https://ownprimland.com/ · the springs.house vein with cleaner wayfinding. **Steal:** multi-rate parallax with illustrated layers over photography, narrative reveal chapters, dual-action minimal header. **Avoid:** unmanaged image weight, lazy-load + LQIP from day one.
3. **Aman** · https://www.aman.com/ · the restraint benchmark. **Steal:** "Reserve" as one persistent action, modular editorial experience cards. **Avoid:** so cold it undersells, Bangi needs warmer, faster paths to event enquiry.
4. **Soneva** · https://www.soneva.com/ · the motion bar: Lenis + Barba transitions + Three.js live in production. **Steal:** the continuous-film scroll feel, minimal nav with Book woven through every section. **Avoid:** nav so minimal that "golf rates" takes three scrolls, MICE buyers need a real menu.
5. **JOALI Maldives** · https://www.joali.com/ · art-led warmth, video hero, themed chapters. **Steal:** the events-calendar layer (conference calendar + Durian championship + golf events). **Avoid:** 25-item menus.
6. **The Datai Langkawi** · https://www.thedatai.com/ · Malaysia's most awarded resort site. **Steal:** sticky compact booking widget, one-image-one-line-one-CTA card rhythm, nature narrative done honestly. **Avoid:** nine dropdowns on mobile.
7. **The Newt in Somerset** · https://thenewtinsomerset.com/ · an 800-acre working-farm estate, the closest spiritual sibling to Bangi (hotel + farm + day visitors). **Steal:** Stay/Visit/Taste/Shop intent nav, day-visitor paths sold beside stays, live-context touches (weather strip by the booking CTA). **Avoid:** the same booking CTA repeated identically all page.
8. **Estelle Manor** · https://www.estellemanor.com/ · estate + members club. **Steal:** the numbered 01-07 venue tour across the grounds, dual conversion above the fold (rooms vs enquiry). **Avoid:** burying access rules in fine print.
9. **Cheval Blanc** · https://www.chevalblanc.com/en/ · couture editorial. **Steal:** property-as-chapter storytelling, exactly two video moments. **Avoid:** hiding rates and capacities layers deep.

**What the best share:** one story per scroll, one CTA per moment · the estate map converts acreage into a place · intent nav beats department nav · motion stack = smooth scroll + reveals + subtle parallax, video/WebGL as accents · restraint IS the luxury signal · never let beauty hide logistics (rates, capacities, enquiry always one click away).

## 3 · UX law (parallax without pain, sourced)

The demo must be motion-rich AND navigable. These are build law, from [NN/g Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/), [NN/g Parallax Usability](https://www.nngroup.com/articles/parallax-usability/), [NN/g Sticky Headers](https://www.nngroup.com/articles/sticky-headers/), [Chrome Performant Parallaxing](https://developer.chrome.com/blog/performant-parallaxing), [web.dev LCP](https://web.dev/articles/optimize-lcp), [W3C WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html):

1. **Never hijack scroll.** Native speed and direction everywhere. The one pinned estate-map scene scrubs with real scroll, stays short, and is skippable via nav anchors.
2. **Sticky nav with anchors, always.** Desktop: compact sticky header. Mobile: hide on scroll down, return on scroll up. The escape hatch NN/g found rescues users.
3. **Body copy never moves.** Parallax lives in backgrounds, imagery, decorative layers. Text sits still, animates in once, settles.
4. **Parallax multipliers 0.2 to 0.5,** transform/opacity only, `will-change` only on true parallax layers, scroll-linked not scroll-listener where possible.
5. **One pinned scene per page maximum,** below the fold, never holding hero/offer/CTA hostage. Alternate pinned with normal sections.
6. **Content complete without JS/motion.** Reveals are progressive enhancement; `prefers-reduced-motion` gets the full page, static, nothing missing.
7. **LCP protected:** hero as `<img fetchpriority="high">` (not CSS background), AVIF/WebP responsive sizes, everything below the fold lazy. Page under 1 MB (the audit beats their 2.9 MB; the demo must embarrass it).
8. **Keyboard + skip links** past the pinned scene; anchor jumps move focus, not just viewport.

## 4 · The booking experience (the conversion spec, sourced)

From the direct-booking research ([Prostay 2026](https://www.prostay.com/blog/hotel-direct-booking-conversion-2026/), [Cloudbeds](https://www.cloudbeds.com/articles/direct-bookings-hotel/), [FTC drip-pricing coverage](https://hospitalitynet.org/opinion/4127117.html) and others, full citations in the research appendix of this folder's history):

1. **Persistent Book entry:** hero carries the full date/guest widget; on scroll it collapses to a slim sticky bar (dates + Book). Mobile: full-width bottom bar in the thumb zone, 48px targets.
2. **The transparency panel, Bangi's signature fix:** at room/rate selection, an always-visible "Know before you book" box: **RM250 refundable security deposit at check-in · Parking RM30/day · SST included in the price shown.** This directly kills the top three review complaints and becomes a talking point in the pitch: the audit shows the complaints, the demo shows the cure.
3. **Dual price display:** "from RM480/night · RM528 incl. tax" style, never a bare rate (total-price-upfront is now US law under the FTC drip-pricing rule and simply good practice here).
4. **Trust at the price point:** "4.1/5 · 709 TripAdvisor reviews · #1 of 9 in Bandar Baru Bangi · Travellers' Choice" chip beside the rate. Best-rate-direct framing with a small perks list.
5. **Three steps max,** visible progress ("Step 2 of 3"), no forced account. The demo mocks the flow inline, same look end to end, one SwiftBook identity (never the two-engine mess the audit documents).
6. **Capture without annoyance:** inline member-rate band between sections ("Unlock the member rate", email only, demo simulates the unlocked price instantly). No mid-browse popups, nothing during booking.

## 5 · Motion plan mapped to the house skills

The build session must invoke these saved skills; they carry the proven recipes:

| Skill | Used for |
|---|---|
| `smooth-scroll-3d-showpiece` | Lenis wiring + tuned numbers, the pinned estate-map assembly (scroll-scrubbed, reverse-clean, 60fps budget), scroll-performance audit method |
| `web-3d-decor-kit` | Loading screen (particle estate outline + logo mask fill), waving DEMO BY BRAND METHOD.CO ribbon, 3D stacked nav logo, footer dusk-estate diorama, mini 3D venue cards (with mobile poster-bake), ambient video hero done right |
| `parallax-scroll-animation` | The reveal/parallax/count-up layer: multi-rate hero layers, editorial reveals, stat count-ups, decode eyebrows, all reduced-motion guarded |

Motion budget per page: 1 pinned scene (index only) · multi-rate parallax on 2 to 3 image bands · reveals everywhere but once-and-settle · count-ups on stats · the ribbon. Inner pages (offers/group/contact): no pins, reveals + parallax only, faster to build and faster to load.

## 6 · Assets on hand vs to gather

**On hand** (from `reference/current-site/`, captured from the live homepage 7 Jul 2026):
- `BRH-TREE-LOGO-HORIZONTAL-TRANSPARENT.png` (1368×241, transparent) · the logo, also feeds loader mask + favicon + 3D nav logo
- Photos: bannermidd.jpg (1350×700 hero), wedding-event.jpg (495×727), salesnevent.jpg + evhome1.jpg + acc1home.jpg (780×408), acc2home.jpg (495×727), IMG_5326.jpg (700×525), 4ML.jpg (1080×810)
- The Durian-festival popup flyer (2560×1460, 580 KB) · content reference + live proof of the weight problem
- Their CSS/JS stack (WooCommerce relic visible) + both SwiftBook property IDs in the HTML (see brief)
- Verified brand golds `#B27409`, `#B0A06C`; current fonts Montserrat/Roboto

**Still to gather at build time:**
- More photography: rooms, pool, ballroom/function rooms, golf course, farm, LaVista, from the live sites' inner pages (credit each `Photo · bangiresorthotel.com`)
- The green from the tree logo, sampled and locked as the estate green token
- Real current offers list from /offers, real event/venue names
- `ph-*.png` AI placeholders only where photography is genuinely missing (IAQ convention)

---
*Direction set 7 July 2026 · references verified same day · build in this folder, port 8972.*
