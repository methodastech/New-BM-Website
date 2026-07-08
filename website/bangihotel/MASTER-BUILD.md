# MASTER BUILD · Bangi Resort Hotel Demo
### The single execution file. Read this top to bottom, then build. Nothing outside this folder is required.

**Mission:** build a 3-tab pitch workspace for Bangi Group in this folder: **01 Audit · 02 Framework · 03 Website**, where tab 03 is a working, parallax-rich, easy-to-navigate concept rebuild of https://www.bangiresorthotel.com/. It must beat the IAQ demo (`../iaq website/`) in polish. Purpose: win the RM12,000 + RM2,500/month engagement from Sam Yap, who invited exactly this ("come out with something, or any proposal").

**Companion files in this folder** (reference, not required reading to start): `BANGI-DEMO-BRIEF.md` (full fact pack with sources), `DESIGN-DIRECTION.md` (references + research citations), `reference/current-site/` (live homepage capture).

---

## 0 · Ground rules (violating any of these fails the build)

1. **Optimisation, not redesign.** Keep Bangi's own brand: their tree logo, their gold, estate greens. The pitch is "same brand, fixed machine." Never present it as a rebrand.
2. **No generic copy.** Every line Bangi-specific and hospitality-specific (Hazel Thompson, their marketing gatekeeper, killed the last pitch over generic material).
3. **Credentials:** only Tourism Malaysia, Sunway Lagoon, Transformer World by Hasbro Malaysia may be named as BrandMethod work.
4. **Facts only.** Every number in this file is verified (sources in BANGI-DEMO-BRIEF.md section 8). Do not invent amenities, prices, review scores.
5. **Copy style:** no dashes as pauses/separators (use commas, colons, ·), no exclamation marks, prices "before 8% SST" where quoted.
6. **The demo must not repeat their faults:** one H1 per page · pinch zoom enabled (never `user-scalable=0`) · WebP/AVIF under 1 MB per page · single booking path · email capture present.
7. **Motion law (NN/g-sourced):** native scroll always (no hijack) · body copy never moves · max ONE pinned scene, on index only, short and skippable · parallax multipliers 0.2 to 0.5, transform/opacity only · everything complete and readable under `prefers-reduced-motion` · LCP hero as `<img fetchpriority="high">`.

## 1 · Setup

- Skills to invoke before writing code: **`smooth-scroll-3d-showpiece`** (Lenis wiring, pinned scene, scroll budget), **`web-3d-decor-kit`** (loader, ribbon, 3D logo, footer diorama, mini cards, video hero). They contain the exact proven recipes from the IAQ build.
- Dev server: `.claude/launch.json` already configured, port 8972. Verify every page live in the preview browser as you build, desktop 1400px AND mobile 375px.
- Stack (copy IAQ's exact pattern): static HTML, one file per page, all CSS/JS inline except CDN: three.js 0.184.0 ESM (jsdelivr → unpkg → esm.sh fallback chain), GSAP 3.12.5 + ScrollTrigger (cdnjs UMD), Lenis 1.3.4 `{lerp:0.11, wheelMultiplier:1.8}`.
- Fonts: docs (audit/framework) = Fraunces + Inter + JetBrains Mono. Site = Switzer (Fontshare) + Instrument Sans + JetBrains Mono.

### Design tokens
```css
/* site pages · light root */
--bg:#FFFFFF; --panel:#FCFDFB; --ink:#141810; --soft:#4A5244; --faint:#87907E;
--gold:#B27409;        /* VERIFIED from their live CSS · primary accent, CTAs */
--gold-soft:#B0A06C;   /* VERIFIED · secondary */
--green:#??????;       /* SAMPLE FROM THE TREE LOGO in reference/current-site/ before styling.
                          Expected: a deep estate green. Lock it, then use for dark bands. */
/* dark bands: deep green base (NOT navy), gold accents, cream text */
```
Keep IAQ's variable naming convention (`--blue`→ reuse names or rename cleanly, but be consistent), spacing scale, `--maxw:1180px`, easing curves.

### BM demo chrome (identical on every page, copy from IAQ verbatim then re-label)
- `.topbar` dark `#0A101F`, sticky: `BM` brandmark + pills `01 Audit / 02 Framework / 03 Website`, active pill hardcoded per page, always BM blue `#2536F5`.
- `body.embedded .topbar{display:none}` + `window.top!==window.self` sniff.
- `#bmBack` pill, hidden when standalone.
- **Waving canvas ribbon** `DEMO BY ✦ BRAND METHOD.CO` below the footer on every site page, static fallback included.
- Titles: `Bangi Resort Hotel · Homepage Concept · Brand Method` etc.

### Assets
On hand in `reference/current-site/bangi hotel sample/...__files/`:
- `BRH-TREE-LOGO-HORIZONTAL-TRANSPARENT.png` (1368×241) → favicon, loader mask, 3D nav logo
- Photos: `bannermidd.jpg` 1350×700 (hero-grade), `wedding-event.jpg` 495×727, `salesnevent.jpg` / `evhome1.jpg` / `acc1home.jpg` 780×408, `acc2home.jpg` 495×727, `IMG_5326.jpg` 700×525, `4ML.jpg` 1080×810, the Durian-festival flyer 2560×1460 (content reference)
- To do: convert everything used to WebP into `assets/`, scrape MORE photography from the live site's inner pages (rooms, pool, ballroom, golf course, farm, LaVista), credit every scraped photo `Photo · bangiresorthotel.com`. Generate `ph-*.png` placeholders ONLY where photography is missing.
- SwiftBook: two parallel property IDs exist on their live homepage (both in the capture). Use ONE consistently: `563MjYKxTGIrXwVOlsqaJQTaHLxzGMPvcB2NTk=` (flag in a code comment: canonical ID to confirm with Sam).

## 2 · Build order

1. Assets pass (convert, scrape, organize `assets/`)
2. `index.html` (the flagship, hardest)
3. `offers.html` → 4. `group.html` → 5. `contact.html`
6. `audit.html` → 7. `framework.html`
8. Cross-linking pass (chrome pills, anchors, audit "working proof" pins → exact anchors)
9. QA (section 8)

---

## 3 · index.html · Bangi Resort Hotel, Homepage Concept
### Band-by-band. Nav: **Stay · Meet · Play · Farm · Offers** + gold CTA **Book direct**.

**00 · Loader.** Particle field resolves into the estate outline (or Malaysia dot-map, one marker on Bandar Baru Bangi), 4 markers pop with mono tags: HOTEL · GOLF · FARM · LAVISTA. Tree logo mask-fills bottom-up, percent counter. Min 1150ms, cap 4200ms, click-skip, reduced-motion = quick fade, GL context released on dismiss.

**01 · Nav.** Sticky, blur backdrop. 3D stacked-layer tree logo (9 translateZ layers, idle sway, hover pauses). 5 intent links + `Book direct` gold mono CTA. Hide on scroll down, float back on scroll up. Mobile: burger → dark numbered drawer.

**02 · Hero (dark green band).** Check their YouTube channel for an ambient property video; if none suitable, `bannermidd.jpg` (WebP, `fetchpriority="high"`) + 2D laminar particle field (150 dots desktop / 60 mobile, cursor-bent). Decode eyebrow: `BANDAR BARU BANGI · SELANGOR · EST. 600 ACRES`. Masked 3-line headline, draft:
> **Six hundred acres,**
> **twenty minutes from Putrajaya,**
> **one front door.**
Sub: "Malaysia's conference resort: 256 rooms, 28 function rooms, an 18-hole course, a working farm and the LaVista arena, in one estate."
CTAs: `Book direct` (gold, → booking bar) + `Explore the estate` (ghost, → #estate).
**Hero booking widget:** dates + guests + Book, collapses on scroll into a slim sticky bar (see section 7).

**03 · Proof marquee.** Dual-track chips, masked edges: `TripAdvisor 4.1/5 · 709 reviews` · `#1 of 9 hotels in Bandar Baru Bangi` · `Travellers' Choice` · `KAYAK 8.7/10 · 4,459 reviews` · `2× ASEAN Records 2025` · `MyGAP certified farm` · `FSSC 22000 Foodservice`.

**04 · Stats + estate map.** Count-ups: `256 rooms` · `28 function rooms` · `600 acres` · `7 experiences`. Beside them: draggable dot-map of the estate (markers: hotel, golf, farm, arena), parallax drift.

**05 · Experience rows** (IAQ services pattern, 5 numbered rows, hover expands with photo + 3 bullets; tap-accordion on touch):
1. **Stay** · 256 rooms and suites · `acc1home/acc2home` photos
2. **Meet & Celebrate** · 28 function rooms, conference resort, weddings · `wedding-event/salesnevent/evhome1`
3. **Play** · 18 holes, RM145 weekday to RM205 weekend (2026 rates) · LaVista pickleball + badminton
4. **Taste** · dining venues (scrape names from live site)
5. **Explore** · the farm, MyGAP certified, World Durian Championship returns 11 July 2026

**06 · PINNED SHOWPIECE (the one pin, `#estate`).** Scroll-scrubbed 3D assembly of the estate: terrain rises → hotel block → golf fairways ribbon → farm plots → arena. 4 caption steps with progress rail:
1. "One estate." 2. "Stay and meet: 256 rooms, 28 venues." 3. "Play and taste: 18 holes, a working farm." 4. "One front door: book everything direct."
Short (≤600vh), skippable via nav anchors, layered SVG fallback, simplified static on mobile + reduced-motion. Nav stays hidden while pinned.

**07 · Group strip (`#group`).** 7 tiles, one per front (Hotel · Golf · Farm · LaVista · BRDC · Foodservice · Food Talk), each deep-linking `group.html#slug`. Eyebrow: "One group, seven fronts." This is the centralisation story on the homepage.

**08 · News.** 3 real dated rows: World Durian Championship returns 11 Jul 2026 (The Star coverage Jul 2025) · 2 ASEAN Records titles 2025 · Visit Malaysia 2026, RM700M+ federal funding.

**09 · Offers teaser.** 2 real current offers (scrape from live /offers) + `View all offers` → offers.html.

**10 · Member-rate capture band.** "Unlock the member rate." Email field only, demo simulates unlocked pricing instantly on submit. No popups anywhere on the site.

**11 · Contact + footer.** Contact cards (tel, email, WhatsApp, address). Then the **footer 3D diorama**: dusk estate scene (sky dome, fog, pointer parallax). Footer columns: the 7 fronts, policies, `© 2026 Bangi Group · Homepage concept · Brand Method`.

**12 · BM ribbon.**

## 4 · offers.html · the proof page
The page whose live version still carries a dead 2021 FastBooking link. Reborn:
- Headband hero: "Offers, with nothing hidden."
- Real current offers as cards (scraped), each: photo, dates, dual price (`from RM480/night · RM528 incl. tax` pattern), ONE booking CTA (the single SwiftBook path).
- **The transparency panel, always visible** (this is the pitch's signature fix): "Know before you book: RM250 refundable security deposit at check-in · Parking RM30/day · Prices include SST." Kills their top three review complaints on the page where trust is won.
- Trust chip beside prices: `4.1/5 · 709 reviews · #1 of 9 in Bandar Baru Bangi`.
- Best-rate-direct strip: direct perks list (flexible cancellation, best rate, no OTA commission inflating the price).
- Capture band + contact + ribbon. No pins; reveals + one parallax band only.

## 5 · group.html · the hub concept (bangigroup.com reborn)
- Headband hero: "The Bangi Group, seven fronts, one estate."
- Estate intro band + dot-map.
- 7 anchor sections (`#hotel #golf #farm #lavista #brdc #foodservice #foodtalk`), each: photo, one-line position, real facts, link out. **Food Talk handled honestly**: "returning" state, no dead link. **LaVista gets its pricing surfaced** (booking via courtsite.my/AFA noted).
- Cross-sell strip: "Stay + farm tour" (Traveloka already sells this pairing; the group's own sites never offer it, the demo does).
- Social links row (their live hub has zero, the demo shows them present).
- Capture + ribbon.

## 6 · contact.html
Headband hero, enquiry form (mono labels: name, email, phone, "I'm planning: stay / event / golf day / farm visit"), form posts nowhere with a small "prototype" note. Event-planner card: 28 function rooms, capacity enquiry CTA. Map with caption chip, hours, contact cards, capture, ribbon.

## 7 · The booking interaction (site-wide)
- Hero widget → collapses to sticky slim bar (dates + `Book`) on scroll. Mobile: full-width bottom bar, 48px targets, thumb zone.
- Clicking Book: inline mock flow, 3 steps with visible progress (`Dates → Room → Confirm`), same visual language, dual pricing, transparency panel repeated at confirm, wallet-button mock at pay. Never a visual jump to a foreign engine.
- One SwiftBook ID everywhere (code comment: confirm canonical with Sam).

## 8 · audit.html · 10 chapters (Fraunces/Inter doc look, chapter nav sticky under topbar)
Hero vchips: `dead 2021 booking link on a revenue page` · `2.9 MB homepage images` · `bgrfoodtalks.com suspended` · `3 of 7 fronts linked from the hub`.
1. **Background**: the group, 600 acres, six divisions + LaVista; amber pin quoting the ask: optimise, not rebrand.
2. **Goal**: six jobs of the estate's web presence (book direct, sell events, route 7 fronts, capture, rank, self-edit).
3. **Website scan** (the core): 03.1 measured table (2.9 MB images, heroes 414 to 580 KB, no WebP, golf PNGs 944/700 KB, H1 ×3 hotel / ×2 golf, `user-scalable=0`, WooCommerce 5.4.1 relic on both flagships); 03.2 lens scorecard; 03.3 journey faults verbatim (dead FastBooking link hardcoded to 29 Jun 2021 beside live SwiftBook, TWO SwiftBook IDs in parallel, QiSoft unbranded golf booking with full non-refundable prepayment and 7-day window, "Golf Rate old" legacy footer link, review themes: 1 to 2 hour check-in queues, RM250 deposit not shown at booking, RM30/day parking after "free parking" stated); 03.4 estate gaps (hub links 3 of 6, zero socials, suspended Foodtalks, LaVista invisible + unpriced, no golf membership page, no capture anywhere, un-redirected bgrrest.com, lookalike resellers `bangiresorthotel.com-malaysia.com` + guestreservations.com, Booking.com legacy slug "bangi-putrajaya"); each sub-part closes with a "Working proof: already fixed in tab 03" pin → exact anchor. 03.5 peer table: Palm Garden, Glenmarie, Saujana vs phone-only laggard.
4. **The case**: Selangor 34.5M domestic visitors 2024 (DOSM), Visit Malaysia 2026 RM700M+, occupancy 54.3% at ADR RM330 (MAH Q1 2025); perception-gap SVG (reputation bar vs web-estate bar).
5. **Model**: rooms, events, golf, F&B, farm, courts; the one job: convert demand directly instead of renting it back from OTAs at 15 to 30% (RM50 to RM66 leaked per OTA night at RM330 ADR).
6. **Markets**: leisure, MICE, golfers, pickleball wave (400+ courts nationwide, Malaysia first in Asia by Reclub users, The Star 9 Aug 2025), farm agro-tourism.
7. **Growth**: funnel SVG, throttle = the booking path.
8. **Engagement**: discovery inputs (SERP order MY-side, GBP access, PageSpeed runs, driving-range status, Foodtalks intent, traffic).
9. **Act**: priority table (kill dead link + one engine → capture → hub + socials → images + SEO → membership + LaVista pricing → care).
10. **Verdict**: donut gauge, honest low-to-mid 50s/100, method paragraph naming every source + the 2 Jul 2026 scan date.
Footer: `Brand Method · Website & Digital Audit for Bangi Group · Confidential`.

## 9 · framework.html · 8 chapters
1. **The Flow**: 3 personas with Path narratives (leisure guest → book direct with fees disclosed; event planner → 28 venues → captured enquiry; group explorer → hub → cross-sell). The 5s/30s/2min credibility rule.
2. **Sitemap**: mono tree, hub → 7 fronts; hotel: Home / Offers / Stay / Meet / Play / Taste / Explore / Contact; annotate prototype-built vs real-engagement pages.
3. **Homepage**: band-by-band wireframe blueprint mirroring section 3 above, each band: schematic, Layout ·, Motion ·, one-line Why.
4. **The Spine**: one booking + capture spine (one SwiftBook ID, one enquiry pipeline, one list, one GA4 with conversion events); SVG spine feeding hotel/golf/farm/arena/hub.
5. **3D & Motion**: the four Moments + performance contract table (Current: 2.9 MB, no WebP, zoom blocked, 5 seconds of images vs Budget: <1 MB, WebP/AVIF, zoom enabled, LCP <2.5s, reduced-motion complete).
6. **The Build**: WordPress kept for the real engagement (prototype is static), CMS roles + training, WooCommerce relic removed, security posture pin.
7. **Timeline**: W1 Discovery · W2 Audit close-out · W3 Centralise · W4 SEO · W5 Journey · W6 Capture · W7 Track/CMS · W8 go-live ★, care from W8; 50/50 split; review per phase, weekly follow-up, WhatsApp every 2 to 3 days.
8. **Inputs**: the discovery questionnaire table (access, canonical SwiftBook ID, GBP, traffic, driving range, Foodtalks intent, photo library). Closing pin: "Approve, and week one starts."

## 10 · QA + acceptance (do not skip)
- [ ] Desktop 1400px and mobile 375px verified live in preview, every page, screenshots taken
- [ ] Pinch zoom works, one H1 per page, all images WebP/AVIF, each page under 1 MB
- [ ] LCP hero `<img fetchpriority="high">`, lazy-load below fold, no CLS jumps
- [ ] Reduced-motion: full content, static, loader fades, pin becomes plain section
- [ ] iOS GL guard: mini scenes poster-baked, contexts released, max 2 to 3 live GL contexts
- [ ] Pinned scene reverses cleanly, skippable, nav anchors work mid-pin
- [ ] Sticky booking bar + mobile bottom bar work, mock flow 3 steps, transparency panel on offers + confirm
- [ ] Chrome pills correct per page, embedded mode hides topbar, bmBack works, ribbon on every site page + fallback
- [ ] Audit pins land on real anchors in tab 03
- [ ] Copy sweep: no dash separators, no exclamation marks, no invented facts, only the 3 credentials, all prices "before 8% SST" where BM fees appear
- [ ] Console clean on every page

**Acceptance:** Sam opens localhost:8972 → reads the audit that names what he watched fail live → reads the framework that maps the fix → clicks 03 and uses the fixed thing: one booking path with fees disclosed, capture working, seven fronts linked, and the whole walk feels premium and effortless in under five minutes.
