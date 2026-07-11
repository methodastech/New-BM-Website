# Brand Method: "We're Not For Everyone" Fit / Not-Fit Photo Prompts

A matched pair for the fit / not-fit section. Both are shot as if from the same photographer, same day, same lens family. The left card is vivid, sharp, engaged, and unmistakably Malaysian. The right card is the muted, complacent inverse. The left screen carries a real, legible product UI, forced through exact quoted strings.

---

## 0. Model + Setup (read first)

| Item | Recommendation |
|---|---|
| **Primary model** | **Nano Banana Pro (Gemini 3 Pro Image).** The only 2026 model that reliably renders legible, real-looking on-screen UI. Use for both cards. |
| **Runner-up** | **Flux 2 Pro** (JSON prompt, hex-bind brand blue `#2536F5` to the UI) if you want a second skin pass. |
| **Skin-only hero alt** | Midjourney v7 (`--style raw --stylize 150`), but not for the left card. Its on-screen text is unreliable. |
| **Resolution** | Generate at **2K or 4K** so the screen text stays crisp. |
| **Aspect ratio** | **4:5 portrait** (editorial card ratio) for both. Midjourney: `--ar 4:5`. |
| **Negative prompts** | Nano Banana and Flux 2 **ignore** negatives, so phrase everything positively. A `--no` line is included only for a Midjourney fallback. |
| **UI rule** | Never let the model invent the website. Quote every on-screen string. If text renders wrong, re-prompt the screen alone ("keep everything, fix the screen text to read exactly…"), do not regenerate the whole image. Safest of all: composite a real product UI onto the screen in post. |

---

## 1. Shared Style Block (both cards inherit this)

Paste this into both prompts so the pair reads as one shoot. Only the mood and grade differ.

> **Camera + lens:** Shot on a Sony A7 IV, 35mm lens at f/2.8, clean and sharp, high dynamic range, natural perspective, subtle full-frame depth of field.
> **Lighting:** Soft, even tropical daylight from a large side window, gentle fill on the shadow side, natural falloff across the face, realistic catchlights in the eyes. No harsh backlight, no coloured gels.
> **Skin realism:** Natural skin texture with visible pores, subtle imperfections, realistic subsurface scattering, fine vellus hair at the jawline, micro-expression creases around the eyes. Real, unretouched skin.
> **Finish:** Photorealistic editorial photography, subtle contrast, slight fine film grain, no gloss, true-to-life colour. Not a render, not stock, not AI-smooth.
> **Composition:** 4:5 vertical portrait, subject placed off-centre with clean negative space for card text overlay.

**Colour grade split:**
- **Left card:** vivid, clean, natural colour. Allow brand blue `#2536F5` accents in the on-screen UI and any stage lighting rim.
- **Right card:** muted, desaturated near-monochrome, cool flat cast, slightly lower contrast. Same room family, drained of energy.

**Midjourney-only negative line (skip for Nano Banana / Flux):**
`--no plastic skin, soap-opera smoothing, over-sharpening, warped hands, extra fingers, gibberish text, distorted UI, Western faces, corporate suits, teal-orange grade, Starbucks cups, snow`

---

## 2. LEFT CARD: "This is for you if…"

**Read:** a confident Malaysian founder mid-presentation on a recognisable KL innovation-hub stage, a large LED wall behind him showing a believable, legible SaaS product. Vivid, sharp, credible.

### 2a. HERO PROMPT

> **Subject:** A confident Malaysian man, Malay ethnicity, mid-30s, warm tan skin with natural texture and visible pores, short neat hair, light stubble, mid-presentation with an open, self-assured expression, one hand gesturing toward the audience. He wears a fine-knit navy polo under an unstructured charcoal blazer, sleeves relaxed, no tie, a delegate lanyard around his neck. Smart-casual KL tech-founder look, genuine and composed, not posed.
>
> **Action / pose:** Standing on a demo-day stage, half-turned to the audience, caught mid-sentence, natural body language, weight on one foot.
>
> **Setting:** A recognisable Malaysian innovation-hub event stage in the MRANTI Park (Bukit Jalil, Kuala Lumpur) style: a modern KL tech auditorium with a large LED wall, dark stage floor, soft blue stage rim light, and a blurred audience of seated delegates wearing lanyards in the foreground bokeh. Bright, hazy tropical daylight spilling from a side glass facade.
>
> **THE SCREEN BLOCK (its own block, do not dilute):** Behind him, the large stage LED wall displays a clean, modern B2B SaaS analytics dashboard for a fictional product called **"Ledgerly"**. The top navigation bar reads **"Dashboard   Reports   Automations   Settings"**. A slim left sidebar shows small line icons. In the centre, a large upward-trending line chart is labelled **"Monthly Recurring Revenue"**, and three KPI cards below it read exactly **"MRR RM248,500"**, **"Active Users 12,480"**, and **"Churn 1.9%"**. Muted blue-and-white interface, brand blue `#2536F5` accents, generous whitespace, modern sans-serif UI type. All on-screen text is sharp, crisp, and fully legible.
>
> **Inherit the full Shared Style Block above (camera, lighting, skin, finish, composition). Left-card vivid grade.**

### 2b. VARIANT (tighter, boardroom pitch instead of stage)

Same person, same wardrobe, same screen block, different venue. This gives you a second usable frame if the stage read feels too "event".

> **Subject:** the same confident Malaysian man, Malay ethnicity, mid-30s, navy knit polo under an unstructured charcoal blazer, lanyard, warm assured expression, mid-explanation, hand resting on the table edge.
>
> **Setting:** A premium Kuala Lumpur co-working meeting room (Common Ground / WORQ visual language: warm wood, palm plants, glass meeting pod), a hint of the KLCC skyline through the window behind, a kopitiam-style kopi cup and a MacBook with local stickers on the table.
>
> **Screen:** A large wall-mounted monitor behind him shows the same **"Ledgerly"** dashboard: top nav **"Dashboard   Reports   Automations   Settings"**, centre line chart labelled **"Monthly Recurring Revenue"**, KPI cards **"MRR RM248,500"**, **"Active Users 12,480"**, **"Churn 1.9%"**, muted blue-and-white UI, brand blue `#2536F5` accents, all text sharp and legible.
>
> **Inherit the full Shared Style Block. Left-card vivid grade. 4:5.**

### How to force legible, non-gibberish UI (left card)
1. **Quote every string** exactly as above. The models only render text they are given literally.
2. **Name the product** ("Ledgerly") and describe layout **element by element** (nav, sidebar, chart, KPI cards).
3. **Keep the screen its own block.** Word order is weighted in Nano Banana / Flux, so a buried screen degrades.
4. If text still renders wrong: **re-prompt the screen only** ("keep the man, stage, and lighting identical, fix the screen to read exactly…").
5. **Belt and braces:** generate the person plus a plausible screen, then **composite a real product UI onto the LED wall in post** (Figma/Photoshop). This guarantees zero gibberish and full brand control of the blue.

---

## 3. RIGHT CARD: "Probably not a fit if…"

**Read:** the disengaged, complacent Malaysian counterpart. Same audience, one who has stopped paying attention. Muted, desaturated, low energy, the visual inverse of the left card, shot on the same lens so the pair feels like one set.

### 3a. PROMPT

> **Subject:** A Malaysian man, mid-40s, leaning far back in an office chair with his feet up on a cluttered desk, hands laced behind his head, a complacent, checked-out, mildly bored expression. Natural skin texture with visible pores and real detail, slight undereye texture. He wears a slightly rumpled plain grey collared shirt, sleeves half-rolled, no lanyard. Disengaged, unbothered body language.
>
> **Setting:** A dull, dated generic office corner in the same building family as the left card: the same modern KL office, but a tired back-room version. A cluttered desk, an older external monitor showing a static, dim, forgettable spreadsheet, scattered papers, a cold takeaway cup, flat overhead fluorescent lighting, no window energy.
>
> **Mood + grade:** Desaturated, near-monochrome, cool flat cast, slightly lower contrast and softer light than the left card. Drained, low-energy, complacent atmosphere.
>
> **Inherit the full Shared Style Block for camera, lens, skin, finish and composition: same Sony A7 IV, 35mm f/2.8, 4:5, natural skin realism, so the pair matches. Right-card muted grade.**

> Note: keep the screen here deliberately **dull and unimportant** (a dim, static spreadsheet), so it does not compete with the legible hero UI on the left. No need to quote strings, vagueness is correct here.

---

## 4. Casting + Wardrobe Notes (Malaysian authenticity)

**Ethnicity: state it per person, every time.** Models default to Western or East-Asian faces unless named.
- Left founder: **Malay-Malaysian man**, warm tan skin, natural texture.
- Right man: **Malaysian man** (Malay or Chinese-Malaysian, pick one and name it) so the pair reads as the same local audience, one engaged, one not.
- If you populate the left-card audience bokeh, make it **visibly multi-ethnic** (Malay, Chinese, Indian Malaysians). That mix is the strongest "this is KL" signal.

**Wardrobe: smart casual, never suits.** KL tech founders do not wear corporate suits. Suits read banking or insurance and break the "this is us" truth.
- Left: fine-knit polo plus unstructured blazer, chinos, sleeves relaxed, no tie, delegate lanyard.
- Right: plain rumpled collared shirt, no lanyard, slightly untidy, the low-effort inverse.
- Colour discipline: **max three colours** across the whole outfit. Keep the blue accent in the UI, not the clothing.

**Grooming + realism.** Real skin over airbrushed: visible pores, subtle imperfections, catchlights in the eyes, genuine (not posed) expression. Left is engaged and warm, right is complacent and flat.

**Authenticity cues (cheap, high-impact).** Delegate lanyards, a kopitiam kopi cup, a MacBook or ThinkPad with local stickers, RM/MYR on any visible pricing, bright hazy tropical daylight. Avoid global tells (Starbucks cup, Western skyline, cold Nordic light, snow).

**Consistency across the pair.** Reuse the **identical camera, lens and lighting tokens** (Shared Style Block) in both prompts. Only two things change between them: **body language** (engaged vs feet-up) and **grade** (vivid vs desaturated). Same room family, same photographer, one shoot.

---

**File reference (for the build):** these prompts feed the two images in the "We're not for everyone" fit / not-fit section of the Brand Method sales page at `/Users/zieel/Bazil Claude 3/Sales page/bm sales page`.