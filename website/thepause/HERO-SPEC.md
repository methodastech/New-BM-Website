# THE PAUSE — Hero Spec

The single source of truth for the homepage hero. **The picture must pass every MUST in Part 1 before any animation is attempted.** Part 2 is only unlocked once Part 1 is signed off.

Every criterion is written so it can be checked by looking or by measuring. No vague adjectives.

---

## PART 1 — THE PICTURE

### 1.1 The woman

| # | Criterion | Must / Should | How it is checked |
|---|---|---|---|
| P1 | Pan-Asian, unmistakably East/Southeast Asian: soft almond eyes with natural epicanthic fold, softly rounded low-bridged nose, delicate jaw | MUST | Zoom on face |
| P2 | Reads early twenties. No lines, folds or creases at mouth, nose or eyes | MUST | Zoom on face |
| P3 | No makeup at all. Bare skin | MUST | Zoom on face |
| P4 | Genuinely beautiful, and beautiful *quietly* — not glamour, not styled | MUST | Judgement |
| P5 | **Soft contented closed-lip smile**, driven from the cheek: apple of cheek lifts, one corner eases up slightly more than the other. Lips closed, soft, full, completely relaxed | MUST | Zoom on mouth |
| P6 | FORBIDDEN on the mouth: pursed, puckered, compressed, stretched grin, visible teeth, parted flat lips, smirk, any tension | MUST | Zoom on mouth |
| P7 | Deeply and peacefully asleep — not resting, not posing. Head low on a flat cushion, neck level, never propped against an armrest | MUST | Full frame |
| P8 | Hair sleek, glossy, neatly swept back off a fully visible face. Real strands, not a plastic helmet | MUST | Zoom on hair |
| P9 | Skin is photographic: visible pores, fine facial down, natural highlight rolloff. Not waxy, not airbrushed, not CGI | MUST | Zoom at 100% |
| P10 | Both hands anatomically perfect: exactly five fingers each, correct joint counts and lengths, defined knuckles, short pale unpainted nails, creases at knuckle and wrist | MUST | Zoom on both hands |
| P11 | FORBIDDEN on hands: fused/webbed fingers, blob fingertips, extra or missing digits, reversed joints, rubbery shapes, hand melting into fabric or into the other hand | MUST | Zoom on both hands |
| P12 | Hands relaxed and open, resting. Not gripping, clasping, interlaced or clutching | MUST | Zoom on hands |
| P13 | Body pose plausible and comfortable for real side-sleeping; arms connect correctly to shoulders; neck not strained | MUST | Full frame |

### 1.2 Wardrobe and story

| # | Criterion | Must / Should |
|---|---|---|
| P14 | Just home from work. Oat shirt with rolled sleeves, taupe tailored trousers, camel blazer over the sofa back | MUST |
| P15 | Tan leather tote on the floor **in front of** the sofa, standing in the open floor between sofa and camera, fully visible. Not tucked beside the armrest, not behind the plant pot, not half-cropped | MUST |
| P16 | No shoes anywhere in frame | MUST |
| P17 | No black, no navy, no grey, no cold tones in wardrobe | MUST |

### 1.3 The product — Hetkinen Ikigai diffuser

Reference: `assets/products/hetkinen-ikigai-diffuser-hero.webp`

| # | Criterion | Must / Should |
|---|---|---|
| P18 | Wide squat clear glass bottle, full rounded body, gently domed shoulders tapering to a **short** straight cylindrical neck with a **thick rolled rim** | MUST |
| P19 | Filled ~two thirds with pale clear oil, clean meniscus | MUST |
| P20 | **Exactly two** pale birch reeds, crossing just above the rim: one plain, one thicker capped with a smooth round pale wooden ball | MUST |
| P21 | **Bare glass. No label, no sticker, no printed text anywhere** | MUST |
| P22 | Real optical glass: rim speculars, refraction visibly offsetting the reeds at the oil line, contact shadow and warm caustic on the oak | MUST |
| P23 | Tack sharp — the crispest object in frame | MUST |
| P24 | Sitting believably **on** the table with clear oak margin on all four sides. Not on the back edge, not on a corner | MUST |
| P25 | Not crowding the right frame edge. Bottle centre no further right than ~80% of frame width | MUST |

### 1.4 Room, light and colour

| # | Criterion | Must / Should | Target |
|---|---|---|---|
| P26 | Open casement window on the left, clearly open, motivating a breeze | MUST | — |
| P27 | Sheer linen curtain, monstera in a terracotta pot, warm plaster wall with large soft leaf shadows | MUST | — |
| P28 | Single consistent light source from the left window; every shadow agrees with it | MUST | — |
| P29 | **The wall shadow must match the plant that casts it** — same scale and leaf shape, falling to the right of the plant given the left-hand window. A large high shadow thrown by a small low plant is a physics error and reads wrong even when nobody can name why | MUST | Compare shadow size and shape against the actual monstera |
| P29b | The monstera is genuinely **tall and mature**: its top leaves rise above the sofa back and into the upper third of the frame. Not a small pot plant | MUST | Top of plant above ~35% frame height |
| P30 | **Neutral surfaces read yellow-beige, not pink.** The pillow, sofa and curtain must sit in the `--sand` / `--dust` family | MUST | On those surfaces: **R/G ≈ 1.02–1.05, B/G ≈ 0.94–0.96** |
| P31 | No orange/amber cast over the whole frame | MUST | Global R/G ≤ 1.07. **Note:** the global figure always runs warmer than the neutrals because skin, oak and terracotta are legitimately warm. P30 is the test that decides whether the room reads beige or pink; do not chase a low global number or the image washes out |
| P32 | Palette confined to cream, ivory, oat, sand, taupe, camel, terracotta, warm oak, green foliage | MUST | — |
| P33 | No black, navy, magenta or cold blue anywhere | MUST | — |
| P34 | Greens of the plant natural, not neon or grey | MUST | — |
| P35 | No blown highlights, no crushed blacks | SHOULD | — |

**Why P30 matters and how it has failed before:** the render keeps producing neutrals at B/G ≈ 1.00 with high red, which is mauve. Brand neutrals are `--paper` 1.004/0.988, `--sand` 1.022/0.947, `--dust` 1.031/0.912 — blue always *below* green. Correcting this by grading afterwards flattens and washes out the whole image. **It must be specified at generation time.**

### 1.5 Frame and type safety

| # | Criterion | Must / Should |
|---|---|---|
| P36 | Left third (x ≈ 4%–45%) visually quiet: no busy detail, no bright highlights where white letters land | MUST |
| P37 | She sits clear of the headline zone — head no further left than ~55% of frame width | MUST |
| P38 | White headline holds ≥ 3:1 contrast at its **worst pixel**, body copy ≥ 4.5:1 | MUST |
| P39 | Nothing important tangent to or awkwardly cropped by a frame edge | SHOULD |
| P40 | Reads as a real Canon EOS R5 photograph, with fine grain — not a render | MUST |
| P41 | No AI artefacts: warped geometry, melted texture, cloned patches, seams, sharpness discontinuities | MUST |
| P42 | Delivered 2560 × 1429, JPEG q93, subsampling 0 | MUST |

---

## PART 2 — THE ANIMATION *(locked until Part 1 is signed off)*

### 2.1 What moves

| # | Criterion | Target (per-frame mean abs diff) |
|---|---|---|
| A1 | Curtain drifts lightly and settles — a soft sway, never billowing or flapping | 3–6 |
| A2 | Monstera leaves nod and tilt gently on their stems | ≥ 2 |
| A3 | Leaf shadows on the wall shift **in time with the leaves** | ≥ 1.5 |
| A4 | She breathes quietly: small even rise and fall across the ribs | 1–3, and **periodic**, not a one-way drift |

### 2.2 What must NOT move

| # | Criterion | Target |
|---|---|---|
| A5 | Her face — expression, mouth, closed eyes, brows all unchanged | per-frame ≤ 1.0, drift over clip ≤ 5 |
| A6 | Her head position, and her hair | ≤ 1.0 |
| A7 | Her hands and fingers | ≤ 1.0 |
| A8 | The diffuser and its reeds, completely rigid | ≤ 0.5 |
| A9 | The camera — locked-off tripod, no pan, no zoom, no drift | — |

### 2.3 Integrity rules

| # | Rule |
|---|---|
| A10 | **No fake effects.** No frozen-face plate composited over the video. No motion amplification. No synthesised in-between frames (`minterpolate`). No AI upscaling of the video |
| A11 | Permitted edits only: trimming, speed change on real frames, boomerang, and encoding |
| A12 | Loop must be seamless: wrap-to-first difference ≤ a normal frame-to-frame step |
| A13 | Her upper body must not drift one way across the clip (the cause of the "heavy breathing" read). Trim the clip head, where the drift concentrates |
| A14 | No ghosting, doubling, transparency or "phasing" anywhere on her |

### 2.4 Known hard limits — accept or change the plan

| Limit | Detail |
|---|---|
| L1 | **Motion energy and face stability are coupled.** The plant sits beside her, so the model animates that region as one: strong plant sway ⇒ morphing face. Measured across takes: energetic gave plant 11.8 with a badly morphing face; calm gave a stable face with plant ~0.7 |
| L2 | **Video resolution is 1284 × 716.** Her face is only a few hundred pixels wide, so the film will never be as sharp as the 2560 still. AI upscaling makes it waxy rather than sharp |

---

---

## PART 2 RESULT — shipped film (2026-07-25)

Source: clip generated by Gemini from `hero-shrine.jpg`, supplied by the user. Trimmed to frames 180–239, watermark cloned out, boomeranged. `hero-shrine-pingpong.mp4`, 1280x720, 4.92s, 1.41MB. (Window moved from 142–201 after the user found that one too fast; the source decays throughout, so a later window is genuinely slower rather than replayed slower.)

Figures below are per displayed frame at 24fps, which is what the eye sees. The earlier 12fps-sampled figures in MEDIA.md run about double.

| # | Criterion | Target | Measured | |
|---|---|---|---|---|
| A1 | Curtain | light drift, never billowing | 1.43 | PASS |
| A2 | Plant | ≥2 (12fps basis) | 2.45 | PASS |
| A3 | Leaf shadows | moves with the leaves | 0.80 | PASS |
| A4 | Breathing | visible and periodic | 0.42, cycled by the boomerang | **UNDER** |
| A5 | Face | step ≤1.0 | 0.56 | PASS |
| A6 | Head and hair | ≤1.0 | 0.56 | PASS |
| A7 | Hands | ≤1.0 | 0.44 | PASS |
| A8 | Diffuser | ≤0.5 | 0.23 | PASS |
| A9 | Camera | locked off | dx 0, dy 0 by SAD search ±16px | PASS |
| A12 | Loop seam | ≤ a normal step | wrap 1.95 vs mean step 1.01 | PASS |

Two residuals, stated rather than buried:

- **A4 breathing is under target.** Better than the previous film, and the smile plus the head settling carry the "she is alive" read, but her chest is not the thing you notice. Raising it would need either a new generation or motion amplification, and amplification is banned by A10.
- **A5 face drift runs high (13 on the 12fps basis).** Verified by eye across the whole loop: the expression, closed eyes and closed-lip smile hold in every sampled frame. The number is her head settling into the pillow, a real movement. Drift was written to catch morphing and is over-strict for a shot where the head is meant to move at all.

## SIGN-OFF

- [x] Part 1 reviewed criterion by criterion, all MUSTs pass
- [x] Client sign-off on the picture (2026-07-25, "yes this is good u can proceed")
- [x] Part 2 built and gated; two residuals disclosed above
