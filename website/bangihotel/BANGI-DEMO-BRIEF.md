# Bangi Resort Hotel · Demo Website Build Brief

**What this is.** The complete breakdown for building the Bangi Group demo package in the proven IAQ format: a 3-tab pitch workspace, **01 Audit · 02 Framework · 03 Website (working prototype)**. Tabs 01 and 02 argue the case; tab 03 is the recommendation already running. Purpose: prove BrandMethod's capability to Sam Yap and win the core engagement (from RM12,000 optimisation + from RM2,500/month care). Sam explicitly invited this on the 29 Jun 2026 call: "come out with something, or any proposal."

**Confirmed target site:** https://www.bangiresorthotel.com/ (confirmed by Bazil, 7 Jul 2026). A full browser capture of its live homepage sits in `reference/current-site/` in this folder.

**Build home:** this folder, `/Users/zieel/Bazil Claude 3/Websites/bangi hotel demo/` · dev server pre-configured in `.claude/launch.json` (port 8972).

**Reference build (the format source):** `/Users/zieel/Bazil Claude 3/Websites/iaq website/` · study it before building. This brief tells you what to copy from it and what to swap.

**Design direction (read second):** `DESIGN-DIRECTION.md` in this folder · the decided creative direction ("The 600-acre estate, one front door"), 9 verified reference sites, the parallax UX law, the booking conversion spec, and the motion plan. The client wants the site "super awesome": parallax-rich but easy to navigate. That file is the how.

**Reuse note:** the chassis (chrome, loader, ribbon, effects, page skeletons) will later be reused for a Nuvah demo. Keep the chassis clean and client-agnostic; every Bangi asset, color and fact must be swappable. Zero Bangi content may carry into Nuvah.

---

## 1 · Non-negotiable guardrails

1. **Optimisation, not redesign.** Their sites were revamped 1 to 2 years ago and are actively maintained (hotel pages edited 19 Jun 2026). Both Sam and Hazel Thompson are sensitive about this. The prototype keeps Bangi Resort Hotel's existing brand: their logo, their color language (consistent with Bangi Golf Resort, the group's design reference), their photography. The pitch line is: **same brand, fixed machine**. The demo shows what optimisation looks like, never "here is your new brand."
2. **Hazel Thompson** (external hotel marketing consultant) holds approval on anything marketing or branding. She left the discovery call frustrated by generic material ("I don't see the connect", "very generalist"). Every sentence of copy must be hospitality-specific and Bangi-specific. No generic agency language.
3. **Credentials:** only Tourism Malaysia, Sunway Lagoon, and Transformer World by Hasbro Malaysia may be named as BrandMethod work. No other case studies, no invented portfolio.
4. **Every audit number carries its source and date.** The fact pack in section 8 has them all. Do not invent facts, amenities, prices or review scores.
5. **House copy rules:** no dashes as pauses or separators (use commas, colons, the middle dot ·), no exclamation marks, British-leaning Malaysian English, prices always "before 8% SST" where quoted.
6. **The demo must not repeat their own faults.** One H1 per page. No `user-scalable=0` (pinch zoom stays enabled). WebP images under budget. Single booking path. Email capture present.

## 2 · Package structure (mirror of the IAQ build)

```
bangi hotel demo/
  .claude/launch.json      python3 -m http.server on port 8972 (already created)
  audit.html               tab 01 · editorial audit document
  framework.html           tab 02 · editorial framework document
  index.html               tab 03 · Bangi Resort Hotel homepage concept (flagship, all signature effects)
  offers.html              inner page · the reborn Offers page (the dead-link page, fixed)
  group.html               inner page · bangigroup.com hub concept (the centralisation story)
  contact.html             inner page · enquiry + booking help + capture
  BANGI-DEMO-BRIEF.md      this file
  DESIGN-DIRECTION.md      creative direction + references + UX law (already written)
  reference/current-site/  full capture of the live homepage (already unzipped)
  assets/                  see section 6
```

Six HTML files, mirroring IAQ's six (index, projects, careers, contact, audit, framework). The two IAQ "engine" inner pages (projects registry, careers) are replaced by the two pages that prove Bangi's specific audit findings: **offers.html** (one clean booking path) and **group.html** (hub linking all seven fronts).

### The BM demo chrome (copy exactly from IAQ)
- `.topbar` dark navy `#0A101F`, sticky, on every page: `BM` brandmark + pill nav `01 Audit / 02 Framework / 03 Website`, active pill hardcoded `class="on"` with BM blue `#2536F5` (BM blue regardless of client accent). Inner pages mark `03 Website` active.
- Embedded mode: `body.embedded .topbar{display:none}` + the `window.top!==window.self` sniff, so the package can drop into the BM SS Portal iframe later.
- `#bmBack` fixed pill top-right, hidden when standalone, same script as IAQ.
- **The waving ribbon** `DEMO BY ✦ BRAND METHOD.CO` (canvas cloth flag) below the footer on every site page, with the static no-canvas fallback. This is the watermark; never omit it.
- Titles: `Bangi Resort Hotel · Homepage Concept · Brand Method`, `Bangi Group · Website & Digital Audit · Brand Method`, etc. Every title ends `· Brand Method`.

### Fonts and tokens
- Docs (audit/framework): **Fraunces + Inter + JetBrains Mono**, paper `#F5F7FC`, the accent variables swap to the Bangi accent (see below).
- Site (index/offers/group/contact): **Switzer (Fontshare) + Instrument Sans + JetBrains Mono**, light root + `.dark-band` token flip, `--maxw:1180px`, same easing/spacing scale as IAQ.
- **Bangi accent colors, VERIFIED from their live CSS** (capture in `reference/current-site/`): gold `#B27409` primary accent, muted gold `#B0A06C` secondary. Pair with a deep estate green sampled from the tree logo at build time (that green hex is still to lock). Their current fonts are Montserrat/Roboto (the demo upgrades type per DESIGN-DIRECTION.md). Set `--blue`/`--blue-bright` (keep the variable names, swap values) in both palettes plus the dark-band variants; dark bands in deep green, not navy.
- CDN deps, copy IAQ's exact pattern: three.js 0.184.0 ESM with the 3-URL fallback chain, GSAP 3.12.5 + ScrollTrigger (cdnjs UMD), Lenis 1.3.4 with `{lerp:0.11, wheelMultiplier:1.8}`.

### Skills to invoke in the build session
- `smooth-scroll-3d-showpiece` · the Lenis wiring, WebGL scroll budget, pinned assembly pattern, scroll-reverse fixes.
- `web-3d-decor-kit` · loading screen, ribbon banner, 3D logo, footer diorama, mini 3D cards, video hero. Both are saved house skills; they contain the proven recipes from the IAQ build.

## 3 · Tab 01: audit.html (Bangi Group · Website & Digital Audit)

Follow the IAQ 10-chapter spine exactly. Chapter nav `01 Background … 10 Verdict`. All content below is verified fact from the portal audit (sources in section 8).

| Chapter | Bangi content |
|---|---|
| Hero | Client logo, "Bangi Group, *Website & Digital Audit*". Lede: seven fronts, three live sites, a booking path that leaks. 4 vchips: **dead 2021 booking link on a revenue page** · **2.9 MB homepage images** · **bgrfoodtalks.com suspended** · **3 of 7 fronts linked from the hub** |
| Exec summary | Verdict line: "The gap is not demand. It is plumbing." The opportunity (hotel is #1 of 9 in Bandar Baru Bangi, 4.1/5 from 709 TripAdvisor reviews, Travellers' Choice; Selangor is Malaysia's most visited state, 34.5M domestic visitors 2024) / The gap (defects) / The move (optimise + centralise, from RM12,000). Stats grid: 709 reviews · 4,459 KAYAK reviews at 8.7 · 256 rooms + 28 function rooms · 7 fronts, 3 live sites. Pin: "Do first: kill the dead booking link, reconcile the two engines." |
| The fork | as-is (leaking bookings to OTAs at 15 to 30% commission) vs optimised (direct bookings, one engine, captured leads) |
| 01 Background | the group: 600-acre resort estate, six divisions + LaVista, BRDC repositioned to managing the estate. The trigger quote (amber pin): Sam's own framing from the call, optimisation not rebrand |
| 02 Goal | six things the group's web estate has to do: book direct, sell events (28 function rooms), route seven fronts, capture leads, hold rankings, stay self-editable |
| 03 Website Scan | the forensic core. 03.1 measured table: 2.9 MB images, heroes 414 to 580 KB, no WebP, golf PNGs 944/700 KB, 3 H1s (hotel) / 2 H1s (golf), `user-scalable=0` on both, WooCommerce 5.4.1 relic loading site-wide with no store. 03.2 lens scorecard across the estate. 03.3 journey faults quoted verbatim: dead FastBooking link (arrival hardcoded 29 Jun 2021) beside live SwiftBook links, TWO SwiftBook property IDs in parallel, QiSoft unbranded golf booking (registration + full non-refundable prepayment + 7-day window), "Golf Rate old" legacy footer link, review-theme complaints (1 to 2 hour check-in queues, RM250 deposit not shown at booking, RM30/day parking after "free parking" stated). 03.4 estate gaps: hub links 3 of 6 divisions with zero socials, suspended Foodtalks, LaVista invisible + unpriced, no membership page on golf, no email capture anywhere, un-redirected bgrrest.com. Each sub-part ends with a "working proof: already fixed in tab 03" pin pointing at index/offers/group. 03.5 peer table: Palm Garden (own tee booking, cross-links IOI hotels), Glenmarie (booking.glenmariegolf.my), Saujana (TravelClick), laggard saasgcc.com (phone only) |
| 04 The Case | Visit Malaysia 2026 live with RM700M+ federal funding, World Durian Championship returns 11 Jul 2026, perception-gap SVG (real-world reputation bar vs web-estate bar) |
| 05 Model | how the estate makes money: rooms, events/conferences, golf rounds, F&B, farm visits, courts; the one commercial job: convert demand directly instead of renting it back from OTAs |
| 06 Markets | Selangor domestic tourism, conference/wedding market (28 function rooms), pickleball wave (400+ courts nationwide, Malaysia first in Asia by Reclub users, The Star 9 Aug 2025) |
| 07 Growth | funnel with the throttle labeled: the booking path; OTA commission leak math (RM50 to RM66 per night at RM330 ADR) |
| 08 Engagement | inputs to confirm at discovery: Malaysian SERP order, Google Business Profile counts, PageSpeed runs, driving-range status ("coming end Jan 2026" still up), Foodtalks Singapore tie, traffic |
| 09 Act | priority table: First kill dead link + one engine / First lead capture / Next hub + socials / Next image + SEO repair / Then golf membership + LaVista pricing / Then care cadence |
| 10 Verdict | donut gauge. Guidance, not yet decided: score honestly in the low-to-mid 50s of 100; the substance (reviews, occupancy anchors, active maintenance) scores well, the plumbing drags it. Method paragraph naming every source + 2 Jul 2026 scan date |

Tone: forensic, generous to their substance ("The reputation is real. The website leaks it."), every chapter closes in a pin, every number sourced.

## 4 · Tab 02: framework.html (Bangi Group · Website Framework)

IAQ 8-chapter spine, adapted:

| Chapter | Bangi content |
|---|---|
| 01 The Flow | 3 personas with Path narratives: **the leisure guest** (Google → homepage → one booking engine → direct booking, deposit and parking disclosed before payment), **the event planner** (28 function rooms → venues band → enquiry form → captured lead), **the group explorer** (hub → golf/farm/LaVista → cross-sell, e.g. the hotel + farm staycation Traveloka already sells that the group's own sites never offer). The five-seconds/thirty-seconds/two-minutes credibility rule |
| 02 Sitemap | mono tree: bangigroup.com hub → 7 fronts; hotel site: Home / Offers / Stay / Meet & Celebrate / Play (golf · LaVista) / Taste / Explore (farm) / Contact; annotations mark which pages the prototype builds vs what ships in the real engagement |
| 03 Homepage | the band-by-band blueprint, 11 `.bp` wireframe rows mirroring section 5 below, each with Layout · Motion · and a one-line Why |
| 04 The Spine | for Bangi the "tag spine" becomes **the booking + capture spine**: one SwiftBook identity, one enquiry pipeline, one newsletter list, one GA4 property with conversion events; SVG: one spine feeding hotel, golf, farm, LaVista, group hub |
| 05 3D & Motion | the four Moments (loader, hero, pinned showpiece, footer diorama) + the performance contract table: Current site (2.9 MB, no WebP, zoom blocked) vs New budget (under 1 MB, WebP, LCP under 2.5s, zoom enabled, reduced-motion honoured) |
| 06 The Build | platform: keep WordPress viable for the real engagement, prototype is static HTML; CMS roles + training (they have none today); remove the WooCommerce relic; security posture pin |
| 07 Timeline | the real proposal weeks: W1 Discovery · W2 Audit close-out · W3 Centralise · W4 SEO · W5 Journey · W6 Capture · W7 Track/CMS · W8 go-live ★, care from W8, 50/50 payment split, review each phase, weekly follow-up, WhatsApp every 2 to 3 days |
| 08 Inputs | the discovery questionnaire list: site + hosting access, SwiftBook account (which property ID is canonical), Google Business Profile access, traffic exports, driving-range status, Foodtalks intent (restore or retire), photo library |

## 5 · Tab 03: the website prototype

### index.html · Bangi Resort Hotel homepage concept (flagship, 14-block assembly)

| # | Block | Bangi treatment |
|---|---|---|
| 0 | Loading screen | particle field resolving into the 600-acre estate outline (or Malaysia map with one marker), markers pop for Hotel · Golf · Farm · LaVista, hotel logo mask-fills, min 1150ms / cap 4200ms / click-skip, GL context released |
| 1 | BM topbar + back button | chrome contract, section 2 |
| 2 | Site nav | sticky blur, 3D stacked-layer hotel logo, links Home / Offers / Group / Contact, mono CTA "Book direct", hide-on-scroll |
| 3 | Hero (dark-band) | ambient video background ONLY if a real Bangi YouTube video exists (check their channel; else hero photo + the 2D laminar particle field), masked 3-line headline, decode eyebrow "Bandar Baru Bangi · 600-acre resort estate", CTAs: "Book direct" (SwiftBook, one ID) + "Explore the estate" |
| 4 | Proof marquee | review + award chips instead of client logos: TripAdvisor 4.1/5 · 709 reviews · #1 of 9 in Bandar Baru Bangi · Travellers' Choice · KAYAK 8.7/10 · 4,459 reviews · 2× ASEAN Records 2025 · MyGAP (farm) · FSSC 22000 (Foodservice, attained 2024) |
| 5 | Stats + estate map | count-ups: 256 rooms · 28 function rooms · 600 acres · 7 experiences; draggable dot-map of the estate with markers replacing IAQ's globe |
| 6 | The film | only if a real promo video exists; otherwise replace the block with a photo-mosaic band from their live-site photography (credited) |
| 7 | Experience rows (IAQ services pattern) | 5 numbered rows: Stay (256 rooms) · Meet & Celebrate (28 function rooms, conference resort) · Play (golf 18 holes RM145 to RM205, LaVista pickleball + badminton) · Taste (F&B) · Explore (farm, World Durian Championship) — hover expands with photo + 3 bullets |
| 8 | Group tiles (IAQ industries pattern) | 7 tiles, one per front, each deep-linking group.html anchors: the centralisation story made visible |
| 9 | Pinned 3D showpiece | scroll-scrubbed assembly of the estate: terrain → hotel block → golf fairways → farm plots → LaVista court, 4 caption steps ("One estate. One front door."), layered SVG fallback, mobile simplified |
| 10 | Featured venues (IAQ projects pattern) | 4 cards: Grand Ballroom · poolside · golf clubhouse · farm pavilion, photos from their sites (mini 3D dioramas optional; photos acceptable here, decide at build by asset quality) |
| 11 | News | real press only: World Durian Championship (The Star, Jul 2025; returns 11 Jul 2026) · 2 ASEAN Records titles 2025 · Visit Malaysia 2026 tie-in |
| 12 | Offers teaser (replaces IAQ careers teaser) | 2 real current offers + count-up, CTA to offers.html |
| 13 | Contact + footer diorama | enquiry cards (tel/mail/WhatsApp), newsletter capture block ("Golf rates, festival dates, seasonal offers, once a month"), then the dusk 3D estate diorama band, footer columns with the 7 fronts + compliance line, `© 2026 Bangi Group · Homepage concept · Brand Method` |
| 14 | BM ribbon | the waving DEMO BY BRAND METHOD.CO flag |

### offers.html · the proof page
The page that today carries the dead 2021 FastBooking link, reborn: real current offers (pull from live site), **one** SwiftBook booking path, deposit RM250 and RM30/day parking disclosed at the point of booking (kills the top review complaints), newsletter capture, no legacy links anywhere. This is the page Sam saw fail live on the call; it must feel unmistakably fixed.

### group.html · the hub concept
The bangigroup.com centralisation story: all **seven** fronts linked (hotel, golf, farm, LaVista, BRDC, Foodservice, Foodtalks), social links present (today: zero), Foodtalks handled honestly with a "returning" state rather than a dead link, estate map, group story band (est. figures from fact pack), cross-sell strip (hotel + farm staycation). Anchors match the homepage group tiles.

### contact.html
Enquiry form (mono labels, IAQ pattern), direct contacts, map with caption chip, event-enquiry routing (function rooms), hours, capture. No fake submission backend; form posts nowhere, notes "prototype".

## 6 · Assets to gather (before building)

**Already on hand** in `reference/current-site/` (captured from the live homepage, 7 Jul 2026): the transparent BRH tree logo (1368×241), 8 usable photos (hero banner 1350×700, wedding, events, 2 accommodation crops, 2 misc), the 580 KB Durian-festival popup flyer (2560×1460, content reference + live proof of the weight problem), their full CSS/JS stack. The set is THIN: the build session must pull more photography from the live site's inner pages (rooms, pool, ballroom, golf, farm, LaVista) and generate `ph-*` placeholders only where photography is genuinely missing. Full inventory in DESIGN-DIRECTION.md section 6.

| Asset | Source | Notes |
|---|---|---|
| Hotel logo (+ group, golf, farm, LaVista logos) | live sites | logo also feeds favicon, loader mask, 3D nav logo |
| Brand colors | live CSS + logos | verify the green/gold inference, lock hex values |
| Photography | bangiresorthotel.com, bangigolfresort.com, bangifarmresort.com | caption-credit every photo `Photo · bangiresorthotel.com`; convert to WebP within budget |
| Real offers list | bangiresorthotel.com/offers | for offers.html |
| SwiftBook URL + the canonical property ID | ALREADY EXTRACTED, in `reference/current-site/` HTML | the two parallel IDs, verbatim: `563MjYKxTGIrXwVOlsqaJQTaHLxzGMPvcB2NTk=` and `803MjY5A9rGW7dUR496z2ThOCqn70c0QBrFe5gSeK3rgQQ2NTk=` · pick ONE for the demo, flag the choice for Sam to confirm. The dead fastbooking.com references are in the same capture |
| Press links | The Star durian coverage, ASEAN Records | real URLs only |
| Review figures | fact pack, section 8 | already sourced |
| Function-room / venue names | hotel site events pages | for venues band |
| `ph-*.png` placeholders | generate | only where client photography is missing, IAQ convention |

## 7 · Build order, QA, acceptance

**Order:** assets → index.html → offers.html → group.html → contact.html → audit.html → framework.html → cross-linking pass → QA.

**QA checklist:**
- Mobile 375px: every page, ribbon sized right, pinch zoom WORKS
- One H1 per page (they have three; the demo must not)
- Page weight under 1 MB, images WebP, LCP under 2.5s on the local server
- Reduced-motion: loader fades, canvases static, scroll animations off
- iOS GL context cap: mini dioramas bake to poster, contexts released (IAQ trick)
- Embedded mode: `body.embedded` hides the BM topbar cleanly
- All 3 tabs cross-link correctly; audit "working proof" pins land on the right anchors
- Copy sweep: no dashes as separators, no exclamation marks, no unverified claim, only the 3 nameable credentials
- Ribbon present on every site page, static fallback works

**Acceptance:** Sam can open localhost, read the audit that names what he saw fail live, read the framework that maps the fix, then click 03 and use the fixed thing: one booking path, disclosed fees, captured email, seven fronts linked. The whole walk takes under five minutes.

## 8 · Fact pack (single source of truth, all sourced 2 Jul 2026 unless noted)

### Entities
1. **Bangi Group** · bangigroup.com · live single-page umbrella · links only 3 of 6 divisions, zero social links
2. **Bangi Resort Hotel** · bangiresorthotel.com · live, actively maintained (pages edited 19 Jun 2026) · traffic + booking anchor
3. **Bangi Golf Resort** · bangigolfresort.com · live, revamped ~2 years ago · design reference; unbranded QiSoft booking, no membership page
4. **BRDC / Bangi Development** · no site, anchor section only · landowners repositioned to managing the estate; offered 26.66 acres inside the 600-acre resort at ~RM90M (NST, Aug 2022)
5. **Food Talk / BGR Foodtalks + BGR Foodservice** · bgrfoodtalks.com SUSPENDED; bgrmeal-pro.com live but stale (2020 content) · FSSC 22000 attained 2024
6. **Bangi Farm Resort** · bangifarmresort.com · live, MyGAP certified · ~15 to 16k Facebook followers, no booking engine
7. **LaVista Arena** · one page on hotel site · pickleball via courtsite.my, badminton via AFA Sports, no pricing shown, IG 87 followers

Legacy: bgrrest.com still live, un-redirected.

### Hotel numbers
256 rooms · 28 function rooms, conference positioning (bangiresorthotel.com) · TripAdvisor 4.1/5, 709 reviews, #1 of 9 in Bandar Baru Bangi, Travellers' Choice · KAYAK 8.7/10, 4,459 reviews, from RM174/night · 2× ASEAN Records 2025 · SwiftBook live but two property IDs in parallel · shared Quicktext chatbot · ranked first for its own name in our index check (MY SERP order to confirm)

### Verified defects (the 22)
1. Dead FastBooking link, arrival hardcoded 29 Jun 2021, on bangiresorthotel.com/offers beside live SwiftBook links
2. Two SwiftBook property IDs in parallel on the hotel homepage
3. H1s: three on hotel homepage (two duplicates), two on golf homepage
4. Hotel homepage ~2.9 MB images, heroes 414 to 580 KB, no WebP; golf PNGs 944 KB + 700 KB
5. `user-scalable=0` blocks pinch zoom on both flagships
6. WooCommerce 5.4.1 relic (mid 2021) loading site-wide on both flagships, no store attached (stack: hotel WP 6.6.5, golf WP 6.7.5, Divi 4.9.6, Slider Revolution 6.7.20)
7. Golf Book Now → unbranded QiSoft portal: registration, full non-refundable prepayment, 7-day window
8. "Golf Rate old" legacy footer link live; 2025 golf booking product 404s
9. bgrfoodtalks.com Account Suspended while the corporate site presents Foodtalks as a pillar
10. Hub links 3 of 6 divisions; zero socials on corporate site
11. Lookalike resellers ranking beside the official site: bangiresorthotel.com-malaysia.com, guestreservations.com
12. Booking.com sells the hotel under legacy slug "bangi-putrajaya"
13. Review-theme complaints: 1 to 2 hour check-in queues at peak, RM250 deposit not shown at booking, RM30/day parking after "free parking" stated (TripAdvisor, Booking.com, Traveloka)
14. No email/newsletter capture on ANY group site
15. No membership page on the golf site
16. LaVista: no pricing, third-party booking, invisible from the golf site
17. Driving range "coming end Jan 2026" still up, five months past (status to confirm)
18. bgrrest.com live, un-redirected
19. bgrmeal-pro.com stale, newest content 2020
20. Farm has no booking engine; Traveloka sells a hotel + farm staycation the group's own sites never offer
21. No CMS self-edit access for the team (client-reported, 29 Jun 2026 call)
22. Measurement patchy: GA4 + Meta Pixel on golf only, no group-wide view

Working positives: HTTPS + Cloudflare, Yoast on both flagships, GA4 + Pixel on golf, Quicktext chatbot, pages actively edited into June 2026.

### Market
Malaysia domestic tourism 2024: 260.1M visitors, RM106.7B spend (DOSM) · Selangor most visited state, 34.5M (DOSM) · Visit Malaysia 2026 live, RM700M+ federal funding · national occupancy 54.3%, ADR RM330 (MAH Q1 2025) · OTA commission 15 to 30% ≈ RM50 to RM66 leaked per OTA night at RM330 ADR · payback ≈ 180 to 240 recovered direct room nights vs the RM12,000 fee · golf 18 holes RM145 weekday to RM205 weekend (2026 rates live) · pickleball: 400+ courts nationwide, Malaysia first in Asia by Reclub users (The Star, 9 Aug 2025) · World Durian Championship returns 11 Jul 2026

### Commercials (indicative, before 8% SST, confirmed after discovery)
- Route 01, recommended: Website Optimisation & Centralisation, from RM12,000 one-off (RM12,960 with SST), 50/50 deposit/go-live
- Route 02, pair: Care & Optimisation from RM2,500/month
- Route 03, fallback only: Quick-Fix Patch from RM1,900
- Weeks: W1 Discovery → W8 go-live, care ongoing; review per phase, weekly follow-up, WhatsApp every 2 to 3 days
- Approver: Sam Yap · samyap@bangiresorthotel.com · +60 16-311 7003

### People context
- **Sam Yap**: main contact, salvaged the discovery call, live-audited the site with Bazil, invited "come out with something, or any proposal"
- **Hazel Thompson**: external hotel marketing consultant, approves anything marketing/branding, left the call over generic material; every line of this demo must be Bangi-specific
- What nearly lost the deal: generic non-hospitality portfolio examples. Never again.

---
*Brief prepared 7 July 2026 · BrandMethod Sdn. Bhd. · internal build document, not client-facing.*
