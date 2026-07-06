# Tenthpin MC — Website Structure & Blueprint

Phase 1 delivers three things as one system: **art direction**, **brand identity**, and the **corporate
website**. The website expresses the brand. The flagship homepage is the pitch that wins the Tuesday
decision; the rest of the site rolls out the same system after approval.

This document covers: the sitemap, the homepage section-by-section, the inner-page templates, the global
system, and the art-direction rules that govern all of it.

---

## A. Sitemap

### Option A — Essential (RM18,000)
```
Home  (the flagship, 6–8 sections, one 3D hero showpiece)
├─ Industries        (one overview page)
├─ Services          (one overview page)
├─ About             (who we are, scale, proof, method, culture)
└─ Contact           (assessment form, offices)
```

### Option B — Premium (RM26,000) adds
```
Home
├─ Industries (overview)
│   ├─ Automotive            (own page)
│   ├─ Manufacturing         (own page)
│   ├─ Life Sciences         (own page)
│   └─ Chemical              (own page, if kept as a growth lane)
├─ Services (overview)
│   ├─ SAP Consulting        (own page)
│   ├─ Transformation Mgmt   (own page)
│   ├─ Industries Innovation (own page)
│   └─ Digital & AI          (own page)
├─ AI in SAP                 (dedicated feature page, full WebGL)
├─ About
├─ Insights / News           (article list, ready for content)
└─ Contact
```

Global elements on every page: top nav, the repeated CTA "Book a free assessment", footer.

---

## B. Homepage (the flagship / Tuesday pitch)

One scrolling page. One job: turn a CIO's visit into a booked assessment. Rhythm alternates busy and
calm so the eye rests. One accent colour used to point, not decorate.

| # | Section | Purpose | Content | Layout | Motion / dynamic |
|---|---|---|---|---|---|
| 0 | **Nav** | Orient, always offer the action | Logo (kept) · Industries · Services · AI in SAP · About · Contact · CTA button | Sticky bar, transparent over hero then solid | Appears on load, background fades in on scroll |
| 1 | **Hero** | State the position, earn the scroll | Eyebrow, H1 positioning line, one subhead, primary + secondary CTA, proof chips | Left-weighted text, art-directed depth on the right | Layered parallax: background, mid, foreground move at different speeds; headline reveals |
| 2 | **Proof strip** | Credentials in seconds | SAP Gold, SF Qualified, Cloud Qualified, ISO 9001, ISO 27001, AAA | Single quiet band | Subtle drift, badges as design not clutter |
| 3 | **The gap** | The problem the buyer feels | Headline + 2 short paras + before/after card | Calm, generous space | Light fade-up, the before/after card animates the contrast |
| 4 | **AI in SAP** (showpiece) | The wedge, demonstrated | 4 chapters: Migrate, E-invoice, AI layer, Industry solutions | Pinned scene, the proof on one side, the visual on the other | The centrepiece: scene transforms per chapter, layers shift in depth, progress rail |
| 5 | **Built for industry** | Show the lane global vacated | Automotive, Manufacturing, Life Sciences (+ Chemical if kept) | Index list or grid, each a path in | Hover reveal, parallax on entry |
| 6 | **How we de-risk it** | Make "de-risked" provable | Tenthpin FAST + IDEA-Activate, pre-built S/4HANA, accelerators | Method steps or horizontal flow | Steps reveal in sequence on scroll |
| 7 | **Why now** | Create urgency, honestly | 3 forces: SAP deadline, e-invoice, AI wave (no hard dates) | Three columns | Stagger in, quiet |
| 8 | **Proof / scale** | Global weight, local team | 1,500+, 400+, 95% retention, Gold Partner, Basel endorsement, client logos | Stat band + endorsement + logo row | Counters tick up, logos fade in |
| 9 | **The assessment** | State the offer plainly | What the free assessment gives, in 3 points | Split: promise + list | Fade-up |
| 10 | **Contact** | Convert | Headline + form (name, company, email, SAP today, notes) + email | Centered, focused, no competing links | Calm close |
| 11 | **Footer** | Quiet and complete | Brand, tagline "Client-Centric. Insight-Driven. SAP-Focused.", link columns, certs, legal | Three columns + baseline | Minimal |

CTA rule: the same primary button ("Book a free assessment") repeats. No competing actions. Secondary
links are scroll cues ("See the AI in SAP"), never rival conversions.

---

## C. Inner-page templates (corporate site after approval)

### Industries (overview)
Intro line → grid of industries → each links to its page → closing CTA.

### Industry page (Option B, e.g. Automotive)
1. Hero: the industry + the outcome
2. The pressures this industry feels
3. How Tenthpin helps (the relevant SAP + AI capabilities)
4. Proof: relevant method, certs, named work where shareable
5. CTA: book a free assessment

### Services (overview)
The four real categories from the deck:
SAP Consulting · Transformation Management · Industries Innovation · Digital & AI → each links to a page.

### Service page
1. Hero: the service + what it solves
2. What is included (the real line items from the deck)
3. How it is delivered (FAST / IDEA-Activate)
4. Where it fits in a transformation
5. CTA

### AI in SAP (feature page, Option B)
The deep version of the homepage showpiece: the AI layer on S/4HANA, use cases (IoT, RPA, self-driving
supply chains, e-invoice, CTSM), the proof, one CTA. This is the page a CIO forwards.

### About
Who we are → part of global Tenthpin (Basel, the map) → scale → culture → method → certifications →
leadership → CTA.

### Contact
Assessment form → offices (Kuala Lumpur, Singapore) → email → response promise.

### Insights (Option B)
Article list, filterable, ready for content. Empty-state designed, not broken.

---

## D. Global system

- **Navigation:** logo left, links centre/right, CTA button. Mobile collapses to a menu.
- **The CTA:** "Book a free assessment", repeated, one action site-wide.
- **Footer:** brand + tagline, three link columns (Explore, Company, Reach us), cert line, legal.
- **Page shell:** dark premium base, consistent section padding scale, one accent, alternating density.
- **Trust pattern:** badges and certs designed in as a system, never bolted on.
- **Responsive:** mobile first, fast, accessible contrast and focus states, the 3D degrades gracefully.

---

## E. Art direction (the rules the structure obeys)

These are the decisions Tuesday approves. The structure above is neutral; this is the look.

- **Keep the logo.** Build type, colour, motion and components around it.
- **Avoid the generic SI look:** no stock handshakes, no blue gradients on white, no jargon walls.
- **Direction:** AI-driven, clean premium base, punctuated by dark, dimensional showpieces where the AI
  and SAP story lives. Engineered, not decorated.
- **Type:** a geometric/technical display + a clean body face + a mono for labels.
- **Colour:** a confident blue anchor + one restrained tech accent (used only as the data/AI signal).
- **Motion:** subtle and purposeful. Real depth and parallax on scroll, scenes that transform, nothing
  that bounces for fun. (The exact dynamic/parallax lane is the one open art-direction choice.)
- **Proof as design:** Gold Partner, ISO, scale built into trust strips, not footer clutter.

---

## F. Open choices before build

1. Scope: Option A (5 pages) or Option B (full per-industry/per-service + AI page + Insights).
2. Industries: 3 (Automotive, Manufacturing, Life Sciences) or 4 with Chemical as a growth lane.
3. Art-direction lane: the dynamic/parallax style to commit to (the thing to lock for Tuesday).
4. Client logos and real contact email.
