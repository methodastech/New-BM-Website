# THE PAUSE — Media Plan (placeholders → Higgsfield)

Every heavy media slot ships now as a real, sized, working placeholder (a still photo or color block), so nothing looks broken. This document lists each slot, what it becomes, and the exact brief to generate it. **Nothing is generated until approved.**

Motion rule for all clips: slow, quiet, no hard cuts. Seamless loops. This is a calm brand. A clip should feel like a held breath, not an ad.

---

## Priority tiers

| Tier | What | Why |
|---|---|---|
| A. Do first | Hero ambient film | The single highest-impact surface. The first thing a visitor feels |
| B. Nice to have | 1 to 4 mood films | Adds life to the signature section. Can stay as premium stills |
| C. Later | Brand story loops, ritual b-roll, scent-library visuals | Depth, not essential for launch |

Recommendation: generate **Tier A only** first, see it in place, then decide on Tier B.

---

## Slot A1 — Hero ambient film  ★ do first

| Field | Value |
|---|---|
| Replaces | `assets/lifestyle/living-room-candle.png` (hero background) |
| Format | Video loop, MP4 + WebM, muted, autoplay, `playsinline`, `loop` |
| Aspect / size | 16:9, 1920×1080, seamless 8 to 12s loop |
| Motion | Almost still. A candle flame breathing, sheer curtain drifting, dust in a shaft of light, the faintest push-in. No people, no cuts |
| Brief | "A calm, sun-warmed living room in soft natural light. Linen sofa, a lit candle on a travertine table, a glass reed diffuser, a sprig of greenery. Dust floating in a low shaft of afternoon light. Sheer curtain drifting almost imperceptibly. Warm neutral palette, cream and clay tones. Slow, meditative, cinematic. Locked-off or the faintest slow push-in. Seamless loop." |
| Integration | Swap the hero `<img>` for a `<video>` with the current still as `poster`. Already structured for this. Reduced-motion users keep the still |

---

## Slot B1 to B4 — Mood films

| Field | Value |
|---|---|
| Replaces | The four mood card stills (bedroom, quiet ritual, find-your-scent, incense ritual) |
| Format | Video loops, 4:5 portrait, 1080×1350, 6 to 8s seamless, muted |
| Motion | One gentle gesture each. Smoke curling, a match lit, steam rising, light shifting |

Briefs, one per mood:

- **For Slower Nights** — "Dim bedroom at dusk, a single candle by the bed, warm amber light, a hand pulling a linen throw. Very low light, intimate, slow."
- **For Work & Focus** — "A bright, uncluttered desk by a window, a diffuser with reeds, cool morning light, a plant casting a soft shadow that moves slightly. Clean, awake."
- **For a Clear Space** — "Sunlight moving slowly across an empty, airy room, sheer curtains, a faint breeze, pale neutral tones. Rinsed, spacious, calm."
- **For a Soft Reset** — "A stick of incense just lit, a thin ribbon of smoke curling upward in soft directional light against a warm neutral wall. Meditative, quiet."

---

## Slot C — Later

| Slot | Format | Brief seed |
|---|---|---|
| Brand story loops (×6) | 3:4 loops | Each brand's world: Finnish forest (Hetkinen), Australian bush (Tribe Earth), carved jade close-up (Jade Deco), etc. |
| Ritual b-roll | 16:9 | Hands lighting incense, pouring, trimming a wick. For the journal and Find Your Scent |
| Scent-library visuals | Abstract | Scent families as drifting light, color and texture. Ambient |

---

## Custom icons — done, no generation needed

The category, mood, value-prop and UI icons are already hand-built as inline SVG line icons in `js/icons.js`. They animate on hover, inherit color, and scale crisply. No image generation required.

---

## What I need from you before generating

1. Confirm **Tier A (hero film)** to generate first, or pick a different starting slot.
2. Confirm the hero brief above, or tweak the scene.
3. Decide if you want Tier B mood films now or later.

## Round 3 : Hero loop v2 + Essence explainer (planned 2026-07-23)

### Hero ambient loop v2 (user brief)
Someone relaxing and resting on the sofa after a day of work. Subtle looping motion only: slow breathing, scent smoke thread, wind in the curtain, drifting leaf shadows. No camera moves, no story, a cinemagraph.
1. Base still, image gen, 16:9: woman resting on the cream sofa scene matching the current hero palette (paper, sand, warm wood, candle and diffuser on the travertine table).
2. Three video candidates from the base still, kling3_0_turbo, motion prompts varying emphasis: (a) breathing focus, (b) curtain and shadow focus, (c) smoke focus.
3. Review, pick the best, replace assets/video/hero-ambient.mp4. Poster updated to the new base still.

### Essence explainer (user brief)
An interactive animating visual about the essence: what it is, its parts, what each is used for. Placement: home, replacing the marquee slot (after best sellers). Build: one macro visual (Higgsfield still) + GSAP hotspot layer, three acts (Top, Heart, Base) plus use notes. Facts sourced from journal "How to read a scent" voice.

Round 3 outcome: hero base still = assets/lifestyle/hero-rest-b.png (soul_2, clean, no text artifacts; variant A rejected for fake overlay text). Three kling3_0_turbo candidates in assets/video/hero-candidate-{a,b,c}.mp4 (a breathing, b curtain and shadow, c haze). Chosen: C, copied to hero-ambient.mp4. Review page: candidates.html. Essence macro = assets/lifestyle/essence-macro.png (nano_banana_pro; soul_2 kept hallucinating gibberish labels, nano banana obeyed the no-label instruction).

## Round 4 : The actual Pause hero film + footer film (planned 2026-07-23)

User verdict on round 3: the resting-person film is good but wrong for the hero. It moves to the footer as an ambient closing band ("This space is now yours."). The hero must be the actual Pause: the products creating a calm space.

### Hero film v3 (the brand itself)
Composition designed for the current layout: LEFT 40 to 45 percent of frame is quiet negative space (warm plaster wall in soft morning light) where the copy sits; RIGHT side holds a low wooden console with the product family as protagonists: one lit cream candle in glass, one amber reed diffuser, one incense plank resting on a ceramic holder with a single thread of smoke, one carved jade pear. Gauzy curtain at far right.
Motion, subtle loop: smoke thread rising and curling, candle flame breathing, light barely shifting, curtain barely alive. Static camera. Boomerang treatment same as round 3 (ffmpeg forward+reverse).
Steps: soul_2 base still 16:9 x2, pick, kling3_0_turbo x2 motion variants, pick, pingpong, wire with poster.

### Footer film band
The round 3 resting film (hero-ambient-pingpong.mp4) becomes .footer__film: full width band at the top of the footer, slow Ken Burns drift + warm veil, closer line "This space is now yours." over it, lazy loaded (plays only when scrolled into view, reduced motion shows the poster).

Round 4 outcome: hero v3 base = assets/lifestyle/hero-still-a.png (left wall empty for copy, product family right; variant B rejected for a stitched wall seam). Motion candidates hero-v3-{a,b}.mp4; chosen A (smoke and flame) → boomerang hero-pause-pingpong.mp4, wired with poster. Round 3 resting film now lives in the footer band (.footer__film, Ken Burns drift + veil + closer line). Essence visual replaced by the real Ikigai product shot blended onto paper (mix-blend multiply + brightness lift) with CSS smoke wisps, float, hover-driven chapters.

## Round 6 : Hero with actual products + essence chapter films (planned 2026-07-23)

Hero: nano_banana_pro edit of the resting still (job 6eaab956): calm the smile, table holds ONLY the real Ikigai diffuser + real Aelm candle (uploaded references) + one incense stick. Then kling loop, boomerang, wire.

Essence section storytelling upgrade (user brief: custom visuals, icon animation, storytelling, pictures, looping): each chapter gets a looping cinemagraph in the media panel, cross-fading on chapter change, with the act icons drawing on:
1. Top note: citrus and cool herbs in bright morning light, shimmering.
2. Heart note: soft florals and fig, petals barely breathing.
3. Base note: dark woods, amber resin, low ember light.
4. Ritual: hands placing pine reeds into the actual Ikigai diffuser, smoke thread.
Pipeline per chapter: nano_banana_pro still (palette locked, no text) → kling3_0_turbo 5s → ffmpeg boomerang → assets/video/essence-act-N.mp4.

Round 6 outcome: hero = hero-rest-pingpong.mp4 from the pose-corrected composite (nano banana chain: scene 6eaab956 → real-products edit 1880f1b9 → deep-rest pose edit 3697975a; poster hero-rest-final2.png). Real Hetkinen products on the table: Aelm candle lit, Ikigai diffuser, one incense stick. Essence chapters shipped: essence-act-1..4.mp4 boomerangs (citrus shimmer, petals, ember resin, hands + real Ikigai) with posters, cross-fade stack + on-film chapter rail.

## Round 7 : Hero v4, the premium product-selling frame (planned 2026-07-23)

User brief: more premium, very sharp, the products must SELL. Get the right STILL first, test it in the hero, only then animate.

Concept, "the evening shrine": the two hero products stand LARGE and tack sharp in the foreground on the oak table, right of center, labels readable, catching a warm rim light: the real Aelm candle lit and the real Ikigai reed diffuser, one incense stick behind them with a thin smoke thread crossing the light. The woman rests deep in SOFT FOCUS on the sofa beyond, atmosphere rather than subject. The left third stays dark quiet wall for the headline. Rich warm contrast, no wash.

Pipeline for sharpness: soul_2 base scene at 2K (composition + light) → nano_banana_pro swap in the real products (references already uploaded) → upscale_image on the result → wire as the hero STILL (img, no video) → user verdict → only then kling + boomerang, and upscale_video before shipping.

Round 7 outcome: hero v4 STILL shipped for verdict, no animation yet. Base scene b5b0aa67 (soul_2 campaign composition) → nano edit 454de954 (all gibberish text stripped, real Aelm candle + real Ikigai diffuser swapped in, labels correct) → bytedance 4K upscale 22a0076f → assets/lifestyle/hero-shrine.jpg (2560w, 316KB) wired as the hero image; hero-shrine-4k.png kept on disk. Animate with kling + boomerang + upscale_video ONLY after user approves the still.

Round 7 revision: user said the face was too zoomed on web → outpaint c71601dd zoomed the whole scene out 1.49x (face 33 percent smaller at any viewport), labels re-fixed with references (b0eda278), re-upscaled 4K (cfe75c57) → hero-shrine.jpg replaced in place. Still image only; animation awaits approval.

## Round 8 : Banner remake, LIGHT palette, user chooses (planned 2026-07-24)

User verdict on round 7: too dark. Remake in the light Pause palette (paper, cream, sand, golden daylight) and present CHOICES before wiring anything.
A. Morning light: products tack sharp on light oak, bright cream wall, woman resting soft-focus behind, airy left space for the headline.
B. Product shrine: bright still life only, no person, sun-washed cream wall, large left negative space.
C. Windowside: products by a gauzy curtain, high key, woman far behind in light.
Each: soul_2 2K base → nano real-product swap + text strip → chooser page banner-choices.html → user picks → 4K upscale → wire → animate after approval.

Round 8 CORRECTED BRIEF (user): NOT a product lineup, all three products together reads fake. The scene is HER STORY: she returns from work and lies on the couch happily (relief, soft smile, candid, work cues like a tote bag or blazer). ONE product only on the table, placed naturally (candle lit, or diffuser). Light palette. Real product swapped in after. Choices A (candle, sitting back), B (diffuser, stretched out, sheer light), C (candle, golden hour, lying on back). The earlier three-product still-life renders are dropped.

Round 8 outcome: banner APPROVED and animated. Final chain: scene A (ac2f1363) → text strip + Aelm swap (f6439fa0) → user picked scene A + Ikigai product → composite with left-wall depth for white type (54de5b07) → kling breeze/foliage-shadow film (a03794e4) → bytedance 2K upscale (fbc25b18) → boomerang hero-shrine-pingpong.mp4 (2582x1440, 10s, 4.9MB, crf24) wired with poster hero-shrine.jpg (lanczos from the nano frame, NOT the AI 4K upscale: bytedance image upscaler hallucinated label glyphs "METKINEN"). Choices page banner-choices.html kept.

Round 9 LOCKED BRIEF (user, several corrections):
- Left side must NOT be a flat wall panel: one continuous real room, open airy left with a potted monstera by the window casting foliage shadows (the shadow the film will animate).
- The diffuser is the ACTUAL Ikigai product, in the MIDDLE of the coffee table, realistic scale, believable contact shadow.
- Super realistic picture, real person, natural skin.
- Animation later, only after the still is approved: slow breathing, slight sleeping smile held, foliage shadows swaying. NO erratic movements. The previous film mangled the product mid-motion, so the next film prompt must state the diffuser stays perfectly still and unchanged.

## Round 10 : Banner remake, PLANNED SPEC (2026-07-24)
1. 16:9, one continuous room, eye level, medium format film look.
2. LEFT THIRD: no flat wall panel. Real corner: tall monstera + trailing plant by a bright window, warm plaster, wood floor.
3. Headline zone: plant corner mid-tone and quiet so white type reads.
4. BACK WALL: large soft foliage shadow (the shape the wind animates).
5. Scene pushed LEFT: sofa starts ~35% of frame.
6. HER: white work shirt sleeves rolled + trousers, FULLY DRESSED, on her side, head on cushion, faint sleeping smile, heels on floor.
7. Realism: skin texture, flyaways, film grain, no retouch sheen.
8. Light oak coffee table lower right, surface readable.
9. PRODUCT: real Hetkinen Ikigai reed diffuser, MIDDLE of table, ~15 degrees so label faces camera, coffee-mug scale (200ml), contact shadow + faint reflection.
10. Product composited from the real photo; label read back before shipping.
11. Output 2K base, 2560 lanczos export, verified AT THE BROWSER CROP.
12. ANIMATION after approval: slow breathing, smile held, foliage shadow drifting in wind, product 100 percent static, no camera move, boomerang.
13. QA: read label, nothing crosses the headline, check real crop, show user before wiring.

Round 10 result (AWAITING APPROVAL): scene fd5dc2d4 chosen (real room, monstera + wall shadow, fully dressed, sleeping smile, shoes off, table foreground) → real Ikigai composited 7495f424 → reeds/label corrected 3525a855 → hero-shrine.jpg (2560 lanczos). Verified at zoom: full reed fan, HETKINEN legible; the small name line stays soft at web scale. Animation NOT started; on approval: breathing + foliage-shadow wind, product locked static, boomerang.

Round 11 (user: "new visual is better, same person"): base 46537a25 (approved person + real room + monstera + wall shadow). Fixes: diffuser moved to MIDDLE of table and forward (~1.5x larger, still mug height), exactly 2 reeds per the real product, label square to camera; sheer linen curtain added at the left window; lighting unified to one late-afternoon sun from the left window (leaf shadow rightward, warm pool on the table, soft falloff right). Animation after approval: her breathing, monstera waving, curtain drifting, PRODUCT LOCKED STILL, boomerang.

Round 11 result (AWAITING APPROVAL): hero-shrine.jpg = job 827dd17c. Same approved person untouched; real room with monstera + leaf shadow on the plaster; sheer curtain at the left window; single warm sun from that window; Ikigai diffuser moved to the middle of the table and forward, correct squat bottle with exactly 2 reeds (one plain, one ball-tipped), label verified at zoom reading IKIGAI / HETKINEN / CRAFTED IN FINLAND. Layout: desktop crop 72% with the copy capped to the quiet left band (headline max 12ch) so it never crosses her; MOBILE RESTRUCTURED to a stacked hero (image 56svh on top, copy below on paper in ink) because full-bleed cropping on a narrow screen always put type on her face. Animation still NOT started.

Round 11 SHIPPED + ANIMATED: final banner = hero-shrine-pingpong.mp4 (2582x1440, 10s boomerang, 5.8MB) over poster hero-shrine.jpg. REJECTED by user 2026-07-24: her eyes warped mid-loop and the frozen arms against a moving face read uncanny.

## Round 12 : Film remake, person fully frozen (SHIPPED 2026-07-24)

User verdict on the round 11 film: the animation looked fake, eyes wrong, arms dead. Root cause: the film animated her face (breathing, micro expression) while the body stayed rigid. Fix: a true cinemagraph, the PERSON is a freeze frame and only the room lives.

Pipeline: hero-shrine.jpg (approved still, untouched) uploaded → 3 kling3_0_turbo candidates, all with the person and product locked, motion varied (a curtain, b monstera + wall shadow, c light + dust). All 3 kept her face and the label intact; chosen B (monstera + foliage-shadow sway, most visible at the hero crop). Frame-diff QA proved no camera drift: frame 0 vs source still MAD 2.97, frame 0 vs any later frame under 3 (grain level), so no trim needed and the existing poster still matches frame zero. B (a97d684c) → bytedance 2K video upscale aigc preset (26702508) → ffmpeg boomerang crf23 → hero-shrine-pingpong.mp4 (2582x1440, 10.08s, 3.7MB, faststart) replacing the rejected film, poster unchanged (hero-shrine.jpg). Final QA sheet verified first/mid/last frames: face frozen, arms frozen, IKIGAI / HETKINEN label crisp, zero decode errors, zero console errors. Rejected round 11 film overwritten.

## Round 13 : Full picture remake, Pan-Asian woman, realism-first (SHIPPED 2026-07-24)

User brief: remake the hero picture entirely, better and realistic, Pan-Asian woman, nice house, must not look fake.

Pipeline: 3 soul_2 2K scene candidates (medium format film look, monstera + window left, cream boucle sofa, woman asleep after work, generic blank diffuser placeholder, no text). Chosen candidate 2 (f4972d01): clearest sleeping face, warm golden light, closest to the light Pause palette (candidate 1 too dark per the round 7 lesson, candidate 3 read half-awake). Real Ikigai composited via nano_banana_pro at 2K resolution param (2752x1536, job ed6eeb01) with the real product photo (assets/products/hetkinen-ikigai-diffuser-hero.webp) as reference; film rebate border removed in the same pass. Label pass: first composite read HIIGAI, corrected by a second nano pass (5d8ba321) to IKIGAI / HETKINEN, verified at 3x zoom; before/after face diff confirmed the correction pass kept her identical. Fake-check at zoom passed: face natural, hand anatomy correct, contact shadow believable. Export: 2560 lanczos JPG quality 86 (475KB), NO AI upscaler anywhere (round 8 lesson). Shipped as assets/lifestyle/hero-shrine.jpg; previous still backed up as hero-shrine-round11.jpg; hero wired as static img. The round 12 film (hero-shrine-pingpong.mp4) no longer matches this picture and is unwired; animate this still with the round 12 frozen-person recipe only after user approval. The small right label columns stay soft at web scale, same as round 11.

## Round 14 : DSLR-realism remake + deterministic label graft (SHIPPED 2026-07-24)

User verdict on round 13: the woman still looked AI, wanted DSLR-photograph realism and a super detailed scene.

Model shootout (3 parallel): nano_banana_pro re-photograph pass of the round 13 still (kept comp, label broke to THIGAI), kling_omni_image fresh scene (warm but hunched pose, product tiny), nano_banana_pro FRESH scene with a hard realism prompt (RAW documentary, Canon EOS R5 50mm f1.8, pores, flyaways, fabric weave, dust motes). The nano fresh scene (c2915e49) won decisively: genuinely photographic, lived-in room (bookshelf, blankets, weathered pot, worn floorboards).

Product: nano swap passes kept garbling the tiny label text (RETKINEN, METKINEN, five failed attempts at 2k and 4k, one lost the ball reed). Lesson: nano cannot reliably render this label at scene scale. Fix was DETERMINISTIC: PIL label graft: crop the real label from assets/products/hetkinen-ikigai-diffuser-hero.webp, level its tilt, flat-field it (divide by its own blur) to strip studio lighting, erase the garbled ink on the scene label (local paper median fill), multiply the true letterforms onto the scene paper so scene lighting and paper texture survive. Spot-heal must clone paper HORIZONTALLY (a vertical clone stamped a ghost IKIGAI).

Assembly: the label-grafted bottle region (1960,880)-(2400,1475) feather-pasted (rounded rect mask, 14px blur) into the PRISTINE fresh-scene base, because every nano edit pass drifts the face (MAD 7-11); the shipped woman is the untouched original render. Seam verified invisible across the sun streaks. Export 2560 lanczos JPG q86 (572KB) → assets/lifestyle/hero-shrine.jpg; round 13 backed up as hero-shrine-round13.jpg. Browser verified, zero console errors. Animation: none yet; use the round 12 frozen-person recipe on this still after approval.

## Round 15 : Comfortable pose (SHIPPED 2026-07-24)

User verdict on round 14: realism much better but she did not look comfortable (neck propped on the hard armrest, body stiff).

3 comfort pose candidates with the same winning nano_banana_pro realism prompt: A curled with cheek on arm, B reclined on her back, C hugging a soft cushion with cheek resting on it plus a knit throw. Chosen C: hugging a cushion is the clearest comfort signal, strongest skin realism of the three, and it keeps the monstera + wall shadow for future animation.

Product pipeline (now standard): nano swap of the real Ikigai onto pose C (label garbles as always), a second targeted nano pass to add the ball-topped reed (came out clean, HETKINEN correct), then the deterministic PIL label graft for IKIGAI + full label text, then the bottle region (1850,900)-(2320,1470) feather-pasted into the PRISTINE pose C frame so the woman is the untouched original render. Seam verified invisible. Export 2560 lanczos JPG q86 (575KB) → assets/lifestyle/hero-shrine.jpg; round 14 backed up as hero-shrine-round14.jpg. Browser verified, zero console errors. Backups on disk: round11, round13, round14. Animation still pending approval; use the round 12 frozen-person recipe.

## Round 16 : Slimmer woman, native product, film SHIPPED (2026-07-24)

User verdicts on round 15: the product looked photoshopped on (it was a regional paste), the bottle read flat, and the woman should be slimmer and more beautiful. Also confirmed the animation brief: wind, plant and shadow moving, the girl resting soundly, super realistic flawless loop.

Fix for the pasted look: the product is now GENERATED NATIVELY in the scene: nano_banana_pro text-to-image with the real product photo passed as a reference image, so the renderer lights the bottle with the room (angled three-quarter view, glass depth, matching sun and contact shadow, zero seams). Two candidates; chosen fd5fa61b: slender refined woman, hands tucked under her cheek (sound-sleep gesture), curved boucle sofa, knit throw, tall window shadows.

Label: nano still garbles tiny text, so the standard fix evolved: full label replacement via homography. The real label (from the product photo) is warped into the label's measured 4-corner quad and relit by the scene's own lighting field (MaxFilter to remove old ink, then blur = smooth light map; ref pixels multiplied by it). No erase-and-reprint (that fought the grain and lost). Verified at zoom: IKIGAI / SCENT DIFFUSER / イキガイ / HETKINEN / CRAFTED IN FINLAND all correct. Still shipped: hero-shrine.jpg (2560 lanczos q86, 554KB); round 15 backed up as hero-shrine-round15.jpg.

Film: kling3_0_turbo x2 from the shipped still, motion = gentle ribcage breathing ONLY on her (face frozen, hands still) + monstera sway + shadow drift + curtain stir, camera locked, product locked. Chosen d7db90a6 (steadier face, livelier plant). Frame QA sheets verified both. Pipeline: bytedance 2K upscale (f9fe0fd4) -> ffmpeg boomerang crf23 faststart -> hero-shrine-pingpong.mp4 (2582x1440, 10.08s, 3.6MB) wired over poster hero-shrine.jpg. Final QA on first/mid/last frames: face identical, product rigid, seamless loop. Zero console errors.

## Round 17 : Real wind + always-crisp label (SHIPPED 2026-07-24)

User verdicts on round 16 film: label not clear in motion, and no visible wind on the plant or curtain so the shadows read static.

Wind: turbo kling suppresses environment motion under "gentle cinemagraph" wording (wind-zone frame diff only 2-4, less than her breathing). Fix: kling3_0 (non-turbo) with assertive open-window wording ("real breeze", "leaves clearly sway", "curtain lifts, billows and falls", zero dampening words for the environment). Result f28ddd26: wind-zone diff 25-27 (real billowing curtain, swaying leaves, sweeping shadows) while her face and hands hold and only her breathing moves her. Motion is MEASURED now: windzone/face/product/chest MAD gates before any visual review.

Label: the video generator always smears the tiny label text, so the film pipeline gained a per-frame label print: ffmpeg filtergraph on the boomerang: crop the label rect (140x66 at 1958,1196 in 2582x1440), lighten-blend against its own gaussian blur (erases the smeared strokes per frame while keeping each frame's own lighting), then multiply-blend the crisp letterform map (derived from the shipped still: label / blur(label)), overlay back. TWO ffmpeg traps cost a re-encode each: a filter output pad cannot be consumed twice (split it), and blend in yuv420p corrupts chroma (the label went neon green; force format=gbrp around the blends, back to yuv420p after). Also CloudFront caches by path: re-uploading a fixed file to the same presigned URL serves the STALE cached copy; upload corrected files to a fresh media slot.

Shipped: hero-shrine-pingpong.mp4 (2582x1440, 10.08s boomerang, 6.2MB, crf22) over poster hero-shrine.jpg. QA verified: curtain billows and settles, leaf shadows sweep, she breathes gently with face and hands held, bottle rigid, label reads IKIGAI / HETKINEN in every frame. Zero console errors.

## Round 47 : The film, clean (SHIPPED 2026-07-25)

Rebuilt on the round 46 diagnosis. `hero-shrine-pingpong.mp4`, 1284x716, 10.08s boomerang, **2.0MB** (down from 6.4MB, because the upscale step is gone).

Pipeline is now deliberately short: kling3_0 → freeze face+product with a plate cut from the take's own frame 0 → boomerang → x264. **No upscale, no amplification.** Both removed steps were the artefact sources.

The key move: because the face is frozen in post anyway, the generation can be asked for MUCH stronger body motion than before without risking the warped face that started this whole thread. Two takes were run and chosen on measurements, not impressions:

| zone | take A | take B | shipped (A + freeze) |
|---|---|---|---|
| plant | 11.84 | 3.37 | 11.34 |
| curtain | 10.07 | 5.62 | 9.73 |
| wall shadow | 3.65 | 1.19 | 3.41 |
| chest (breathing) | 2.90 | 1.80 | 1.86 |
| face | 3.21 | 6.18 | **0.05** |
| product | 0.87 | 0.62 | **0.00** |

Take A gave chest 2.90 naturally — as much as the round 46 amplification produced (2.78) but with no ghosting whatsoever, which is the whole point: **get motion from the generation, never from post.** Verified on the peak body-motion frame: solid body, no cyan fringing, no doubled forearm, no transparency.

Prompt wording that produced take A: name the breath count ("about four full breaths across the shot"), describe what the FABRIC does rather than the body ("the loose linen visibly lifts and relaxes"), tie the shadow to its cause ("their shadows sway and drift across the wall in time with them"), and list the artefacts as negatives ("no ghosting, no double images").

## Round 52 : The film replaced with the Gemini take (SHIPPED 2026-07-25)

The user supplied a clip generated elsewhere (Gemini, from our own `hero-shrine.jpg`) and asked whether it was better, their two complaints about ours being "she's not breathing and is not smiling". Measured, it was better on both, so it is now the hero film. `hero-shrine-pingpong.mp4`, 1280x720, 4.92s boomerang, 1.69MB. Previous kling film kept as `hero-shrine-pingpong-kling.mp4`.

| per-frame MAD | Gemini window | our kling film | spec |
|---|---|---|---|
| curtain | **5.30** | 4.55 | 3–6 |
| plant | **6.42** | 4.40 | ≥2 |
| wall shadow | **2.02** | 1.30 | ≥1.5 |
| ribs (breathing) | **0.55** | 0.29 | 1–3 (both under) |
| face step | 0.73 | 0.37 | ≤1.0 |
| hands | 0.61 | — | ≤1.0 |
| product | 0.28 | 0.35 | ≤0.5 |

**Watermark removal.** A sparkle glyph sat at x 1140–1185, y 573–618 on the boucle. `delogo` smears across the sofa/table edge that runs through that box, so instead: clone a 76x76 patch from the same rows 130px to the left, feathered with a blurred-ellipse alpha mask via `alphamerge`, overlaid. A hard-edged rectangular paste was tried first and was clearly visible as a tonal block; the feather is what makes it invisible. Verified at 4x zoom.

**Window selection.** The clip is one long decay: per-frame step falls monotonically from 3.1 at n=135 to 0.8 at n=214, and it opens with a huge curtain billow (frame-vs-frame MAD 27 at t=1s) plus a 19-unit luma dip. Three windows built and measured; frames 142–201 (t 5.92–8.42s) won on face stability (0.73/7.5 vs 1.05/12.4 and 1.04/13.2) while keeping the most curtain and shadow. Boomerang as always: `reverse, trim=start_frame=1:end_frame=59, setpts=PTS-STARTPTS`. Wrap step 3.68 against a max normal step of 3.52, i.e. the join sits inside ordinary motion.

**Two of my own claims corrected by measurement:**
- I reported a 14px camera drift in this clip. Wrong. A direct SAD search over ±16px on the static right third returns dx=0, dy=0 at every timestamp; the camera is locked off. What I had measured before was a moving leaf shadow, not the frame.
- The plant appears to grow across the clip. It does not. **The curtain sweeps across and uncovers it.** Crop the plant region across the loop and the occlusion is obvious.

**Poster changed** to `assets/lifestyle/hero-shrine-poster.jpg`, exported from the loop's own frame 0. The old poster was the 2560 still, whose curtain sits in a completely different position from where the loop starts, so it cut visibly on play. Matching the poster to frame 0 also matches its sharpness to the video's, avoiding a focus-pull on start.

**Contrast re-measured on all 118 frames** (both scrim gradients composited in, worst pixel): eyebrow 4.71, headline 4.52, body 6.50. All pass P38, and all are at or above the still we were shipping (4.46 / 4.47 / 7.31). Method note: measure against the **tight per-line text rects**, not the h1 bounding box — the h1 box extends 200px past the last glyph over the bright plant, and sampling that empty space reports a false 2.4:1.

## Round 53 : Slowed the film, taller hero (SHIPPED 2026-07-25)

User: "image moving too fast" and "make the banner a bit taller".

**Speed.** Two ways to slow a clip, and they are not equivalent:

| Method | Result | Judder |
|---|---|---|
| Replay the same window at 0.7x / 0.5x (`setpts`) | 7.0s / 9.8s | Yes — only 118 unique frames exist, so 24fps output repeats them and the eye sees the original step size arriving in bursts |
| **Use a calmer stretch of the source at native speed** | 4.92s, every frame unique | **None** |

Took the second. The Gemini clip is one long decay (per-frame step 3.1 at n=135 falling to 0.8 at n=214), so a later window is genuinely slower, not just replayed slower. Window moved from frames 142–201 to **180–239**.

| per displayed frame | old window (142–201) | new window (180–239) |
|---|---|---|
| curtain | 3.44 | **1.43** |
| plant | 3.83 | 2.45 |
| wall shadow | 1.16 | 0.80 |
| ribs (breathing) | 0.30 | **0.42** |
| face | 0.41 | 0.56 |
| loop seam | 3.68 (2.1x mean) | **1.95 (1.9x mean)** |

Curtain motion down 58 percent, and breathing actually up, because the late part of the clip is where her chest is the dominant motion rather than the wind. Face verified across the whole loop: smile holds in every frame, hands stable; the higher drift number is her head settling into the pillow, a real movement.

**Hero height** `min-height: clamp(580px, 82svh, 880px)` → `clamp(660px, 92svh, 980px)`, max-height 980 → 1080. At 1440x900 the hero goes 738px → 828px. Contrast improved as a side effect, since the copy sits lower in the bottom scrim: eyebrow 4.80, headline **6.01**, body **8.22** (was 4.71 / 4.52 / 6.50).

**Also fixed:** the hero film stayed paused after the tab was backgrounded. Browsers pause muted autoplay video in a hidden document and do not reliably resume it, which froze the hero on a mid-loop frame. `initHeroFilm` now kicks `play()` on `visibilitychange`.

## Round 54 : Sizing sweep and demo honesty (SHIPPED 2026-07-25)

User: "make sure all sizes are fine" and "anything that needs to further go through say not available in demo".

**Method.** Rather than resizing the browser 80 times, the audit loads each page into an off-screen iframe and steps its width. Media queries respond to the iframe width, so one JS call sweeps 12 pages across 320 / 375 / 430 / 768 / 1024 / 1280 / 1440 / 1920 and reports, per page-width: horizontal overflow (`scrollWidth - clientWidth`), interactive targets under 24px, text under 10px, and images that failed to load. Worth keeping: it turns "does it look right" into a table.

**Result: no horizontal overflow at any width on any page, no broken images.** What it did find, and what was fixed:

| Fault | Was | Now |
|---|---|---|
| `.essence__nav` chapter buttons | **34 x 3px** hit area | 34 x 33px. The 3px rule is drawn by `::before` inside transparent padding; negative margin keeps the visual position identical |
| Footer nav links | 21px tall | 33px, padding instead of grid gap so the whole row is the target |
| Header brandmark | 20px tall on mobile | 36px, padding-block with matching negative margin |
| `.link` call-to-action links | 26px | 36px, underline offset adjusted to match |
| Terms / Privacy | 21px | 33px |
| Cart `Remove` | 21px | 29px |
| `.card__name` | 18px | 25px |
| `.media-tag`, pyramid diagram labels | **9px / 9.5px** | 10px / 10.5px |

**Product cards on a phone.** Two-up at 375px put the name and the price on the same flex row, so "Aelm Scented Candle" wrapped to three ragged lines and the grid looked broken. Fixed with `display: contents` on the card body's inner wrapper, turning brand / name / notes / price into direct grid children: brand and price share row 1, the name gets the full card width on row 2. Names now sit on one or two lines. Type also steps down to 0.875rem under 480px.

**Demo locks.** `initDemoLocks` now covers everything that would need a real backend, not just the journal. Any `a[href="#"]` is disabled and answers with a toast; specific copy is set via `data-demo` so the wording reads properly rather than being derived from the label:

| Surface | Behaviour |
|---|---|
| Journal (nav, footer, all three home cards) | greyed, toast: "The journal is not available in this demo." |
| Instagram | toast: "Social accounts are not available in this demo." |
| Terms, Privacy | toast: "Terms and privacy pages are not available in this demo." |
| Checkout | button becomes "Payment is not available in this demo", disabled 2.6s |
| Newsletter, welcome modal, contact, account sign-in | confirmation now states nothing was sent |
| WhatsApp chat | already answered with a demo notice |
| journal.html itself | line added under the intro |

Search, the quiz, filters, the cart and add-to-cart are real client-side features over the local catalogue, so they are left working rather than stubbed.

Inline links inside sentences (the FAQ's "shipping"/"returns", the contact email) stay at their natural 24px. WCAG 2.5.8 exempts targets in a line of text, and padding them would break the line box.

## Round 55 : Mobile hero copy moved onto the film (SHIPPED 2026-07-25)

User: "put the wording on the top of the video and make it look good", then "compact it a bit".

**The constraint that decides the design.** A phone crop of a 16:9 frame always shows the full height (cover scale is set by height: 812/720 vs 375/1280), so only the horizontal crop is a choice. She sits in the lower half of the frame and the upper half is always plaster wall and leaf shadow. That is the one band type can occupy without ever crossing her, so the copy goes at the top.

**Ink on a paper veil, not white on a dark scrim.** The wall is light, so darkening it to carry white text would have made the hero look like a movie poster. Instead a top-down paper wash (`--paper` at 0.94 → 0 by 66%) lifts the wall to near-paper under the copy and releases before it reaches her. The stacked "image above, words below" layout is gone; the hero is full-bleed 100svh again.

| | contrast, worst pixel across all 118 frames |
|---|---|
| eyebrow | 12.03:1 |
| headline | **13.18:1** |
| body | 8.12:1 |

First pass measured 4.38 / 9.92 / **3.00** — the body copy failed. Two fixes: hold the veil at ~0.78 down to 44% (where the copy ends) instead of fading from 30%, and darken the two secondary colours one step, since a veil over a live image cannot rely on tokens tuned for a flat paper background.

**Zoom fix (same round, after "video is too zoomed in" and "push the visual down").** On a phone, zoom is set by height, not by `object-position`: cover scales the 16:9 frame to the container height, so a taller hero crops harder into her. At 100svh only **30% of the frame width** survived and she filled the screen. Two changes:

1. The film no longer fills the hero. `.hero__media` is `top: auto; bottom: 0; height: 74%`, so it sits at the foot with paper above. A shorter box means a smaller cover scale, and the scene sits lower, clear of the copy.
2. Hero to `clamp(540px, 84svh, 780px)`.

| | before | after |
|---|---|---|
| cover scale | 1.128 | **0.701** |
| frame width visible | 30.1% | **41.8%** |

The monstera, tote, table and diffuser are all in frame again. The veil starts fully opaque at the film's top edge, so the picture reads as emerging from the page rather than being pasted on it.

That zoom-out broke contrast, which is the trap: opening the crop pulled the dark monstera under the body copy, where it had been plain wall. Body contrast fell to **2.51:1** and the ghost button, now overlapping her hair, to 2.98:1. Fixed by holding the veil at 0.72 down to 40% (it had been fading from 22%) and adding hero height so the buttons clear her head. Re-measured across all 118 frames: eyebrow 21.0, headline **13.13**, body **7.99**, ghost button **7.07**.

**Height fallbacks**, because the hero is svh-based and a shorter screen raises her head:

| Screen | Behaviour |
|---|---|
| ≥ 720px tall | Full copy, buttons directly under it |
| ≤ 720px tall | Type steps down one notch (title 1.9rem, body 0.9rem) |
| ≤ 640px tall | Buttons drop to the foot of the hero, below her, via `margin-top: auto` |
| ≤ 360px wide | Button type to 0.78rem so "Find your calm set" stays on one line |

Buttons are also side by side rather than stacked, which costs one row of height instead of two and is what let the copy clear her head at 667px.

**Mood cards: the icon carries the colour.** The pastel used to land on the title, the note and the arrow's fill, which read as nothing: the raw pastels (`--pastel-sand` #ecdfc0 etc.) are so pale that as a tint they are indistinguishable from white. Now the top-left mood icon is the single colour signal, white at rest and the mood's colour once picked up, and the arrow stays neutral so only one thing changes. To make it actually read as colour at icon size the pastel is pulled 34% toward its ink partner:

| mood | selected icon |
|---|---|
| Slower Nights | rgb(196, 180, 146) warm sand |
| Work & Focus | rgb(166, 181, 155) sage |
| Clear Space | rgb(157, 177, 187) sky |
| Soft Reset | rgb(201, 167, 151) blush |

`:active` is included alongside `:hover`, since a phone has no hover.

**Scroll cue restored on phones.** `.hero__scroll` had been hidden under 640px because the hero used to run to the bottom of the screen. Now the hero ends above the fold, so the cue sits centred at the foot of the picture.

First attempt put it in ink and the arrow vanished. Measured, the two lines straddle two different bands: the word lands on the lit tabletop, the arrow on the dark shadow beneath it, and **no single colour serves both**:

| | word on tabletop | arrow on shadow |
|---|---|---|
| ink-soft | 2.31:1 | **1.30:1** |
| white | 1.59:1 | **3.10:1** |

So on phones the word is dropped (`font-size: 0`; the `aria-label` still reads "Scroll down", so a screen reader loses nothing) and only the arrow remains, white at 3.1:1 with a soft drop-shadow. Desktop keeps the full "Scroll" label in paper, unchanged.

**Essence section compacted on phones.** The acts are absolutely stacked, so the container has to reserve the tallest one; it reserved 300px when the tallest act measures 233px, and that 67px of dead air was the gap under "Less is the whole method". Now 244px, plus tighter section padding, a shorter film block (422px → clamp(300px, 42vh, 380px)) and trimmed margins. Section height 1494px → 1346px.

## Round 56 : Bug sweep (SHIPPED 2026-07-25)

Static sizing was already clean from round 54, so this pass went after behaviour: every page loaded in an off-screen iframe with `error` / `unhandledrejection` / `console.error` captured, then driven through its real interactions.

**Three real bugs, fixed:**

| # | Bug | Cause | Fix |
|---|---|---|---|
| 1 | `search.html?q=candle` showed the whole catalogue with an empty search box | `search.js` called `run("")` on load and never read the `q` param; it also never wrote the query back to the URL, so a search could not be shared, bookmarked or reloaded | Read `?q=` on load into the input, and `history.replaceState` the query on every search, matching what `shop.js` already does for its filters |
| 2 | The page scrolled behind the open mobile menu | `openMenu` never locked scroll. Computed `html` overflow stayed `visible` | Shared `html.is-locked` lock in `base.css`, applied by the menu and the cart drawer |
| 3 | The cart drawer was not announced as a dialog and did not manage focus | Only `aria-label` was set; no `role`, no `aria-modal`, focus stayed behind it | `role="dialog"`, `aria-modal="true"`, focus moves to the close button on open and returns to the opener on close |

Bug 2 also had a latent half: the drawer's existing lock was `html.lenis-stopped`, whose CSS is `.lenis.lenis-stopped { overflow: hidden }`. That only bites while Lenis is running, and Lenis is skipped under `prefers-reduced-motion` or if its CDN is blocked, so the drawer would have failed to lock in exactly those cases. `is-locked` does not depend on Lenis.

**Method note, worth keeping:** `window.scrollTo()` is not a valid test for "can the user scroll". `overflow: hidden` blocks wheel and touch but programmatic scrolling still works, so a locked page still reports a changed `scrollY`. Assert on the computed overflow of the scrolling element instead.

**Two false alarms, corrected rather than "fixed":**
- FAQ accordions looked dead (`height: 0` after clicking). They work; the reading was taken mid-transition, and inside a background iframe transitions and rAF are throttled so they never completed at all. Verified by clicking the live page.
- The mobile menu appeared not to move focus. `.focus()` does not take in a background iframe.

**Verified working, no change needed:** cart add/increment/decrement/remove/empty-state and persistence across pages via localStorage; shop filters with URL sync and empty state; PDP thumbnails, quantity floor of 1, add to cart, related products; the quiz end to end to a result; search typing, empty results, URL sync; product page fallback for a bad or missing `id` ("This piece has drifted off"); accordion and SVG-diagram keyboard access via Enter and Space; header solid-on-scroll; `#moods` anchor; all 29 homepage images lazy-loaded with none oversized by more than 3x; the reduced-motion path leaves all 53 reveal elements visible with Lenis off.

Final sweep: 24 page-width combinations across 12 pages, zero overflow, zero undersized targets, zero sub-10px text, zero broken images, zero duplicate ids, zero console errors.

## Round 51 : The film, gated against the spec (SHIPPED 2026-07-25)

Picture signed off, so Part 2 of `HERO-SPEC.md` unlocked. `hero-shrine-pingpong.mp4`, 1284x716, 2.92s boomerang, 853KB. Pipeline is now only: kling3_0 → trim → boomerang → x264. **No freeze plate, no amplification, no minterpolate, no AI upscale** — every one of those was previously shipped and every one was caught by the user.

**Built `vgate.py`, an automated Part-2 gate**, and this is the reusable asset from this round. It extracts frames at 12fps, then scans every (start, length) window and scores it, HARD-REJECTING any window that breaks a must-not-move rule (face step >1.0 or drift >5, hands >1.0, product >0.5) or that shows a one-way body ramp (ribs range >4.0, or fewer than 2 direction reversals). Only surviving windows get scored on wind, plant, shadow and breathing. This makes "which take, which seconds" a measurement rather than an impression, and makes it impossible to ship a morphing face by accident.

Four takes measured; the gate rejected two outright:

| take | curtain | plant | shadow | face step / drift | verdict |
|---|---|---|---|---|---|
| T1 calm | 2.11 | 0.81 | 0.44 | 0.77 / 3.93 | passes, but under-animated |
| T2 calm | 0.66 | 0.46 | 0.28 | 0.91 / **11.09** | NO WINDOW PASSES |
| **T3 breeze** | **4.75** | **4.76** | 1.36 | **0.52 / 2.30** | **shipped, score 18.7** |
| T4 breeze | 2.66 | 2.07 | 0.73 | 2.89 / **30.20** | NO WINDOW PASSES |

T3 scored 4x T1. Note that two takes from near-identical prompts (T3 vs T4) landed on opposite sides of the face gate — **take-to-take variance is larger than prompt-wording variance, so generate several and select numerically rather than trying to prompt your way to a good take.**

Loop built with the full correct boomerang: `reverse, trim=start_frame=1:end_frame=N-1, setpts=PTS-STARTPTS`. Both details matter — without `setpts` the concat mis-times and leaves a real 13x seam, and without dropping the final frame the wrap repeats a frame and holds. Verified: wrap 1.176 against a max normal step of 1.238, i.e. the join is within ordinary frame-to-frame motion.

Also fixed a self-inflicted playback bug: the IntersectionObserver used `isIntersecting` with `threshold: 0.05` and fired a false negative that paused the loop while the hero was still fully on screen. Now keys off `intersectionRatio > 0` with `rootMargin: 200px`.

**Honest residual, disclosed rather than buried:** breathing measures 0.34 per frame against a spec target of 1–3, roughly an eighth of the curtain's motion, so she does not read as visibly breathing. Every take with stronger body motion failed the face gate (11–30 drift). This is the round-48 coupling ceiling, not a prompting failure.

## Round 50 : Structure first — the spec, and the orange cause found (SHIPPED 2026-07-25)

User: "ALWAYS STRUCTURE FIRST BEFORE DOING ANYTHING", "FOLLOW OUR THEME COLOUR NOT TOO RED OR ORANGE", and the process rule: **agree the picture against detailed written criteria, and only then animate.** Wrote `HERO-SPEC.md` — 42 numbered picture criteria and 14 animation criteria, each phrased so it can be checked by looking or measuring, with animation formally locked until the picture signs off.

**THE CAUSE OF THE ORANGE WAS MY OWN PROMPT.** Every scene prompt for ~10 rounds asked for "warm late-afternoon golden light" / "golden hour". That bakes amber into the render and pushes the neutrals pink. Regenerating with **neutral 5500K daylight, explicitly NOT golden hour**, fixed at source what no amount of grading could fix.

**Correct way to test palette conformance.** Comparing a photograph's GLOBAL mean to flat brand swatches is invalid — skin, oak and terracotta are legitimately warmer than a paint chip, and chasing a low global number washes the image out (proved twice: both attempts looked anaemic). The valid test samples only the surfaces that should BE brand neutrals — sofa, cushion, curtain, plaster — and checks them against `--sand`/`--dust`. Diagnosis that followed: those surfaces sat at B/G ≈ 1.00 with high red, i.e. **mauve, not beige**. Brand neutrals always have blue BELOW green.

Built `gate.py`, an objective colour gate that auto-samples low-saturation bright pixels and checks P30/P31. The old shipped picture failed all four checks; it is now the standing pre-flight for any hero candidate.

Also caught, only because the user asked: **the wall shadow did not match the plant casting it** — a large high monstera shadow thrown by a small low plant. A physics error that reads wrong without being nameable. Added as P29/P29b (MUST). Fixed by specifying a tall mature monstera whose shadow matches its own scale and falls to the right of it given the left window.

Final: fresh daylight generation, tall plant with matching shadow, tote fully visible in front of the sofa, diffuser at 75% of frame width (was 84%, spec ≤80%), then one targeted cheek-driven smile edit, then the deterministic red trim applied LAST. Neutrals 1.030/0.946 — in the sand band, blue below green. Headline contrast improved to worst-pixel 4.55.

**A failed experiment worth recording:** tried moving the diffuser deterministically in PIL (cut, shift, horizontal-clone heal) to avoid re-rendering a good face. It failed — the mirrored heal duplicated her legs and the feathered mask left a dark block. **Do not attempt to relocate an object with transparent glass and a cast shadow by pixel surgery; regenerate instead.**

Hero is wired back to `<img>` — the film is unwired until the picture is signed off.

## Round 49 : Smile restored, and the "heavy breathing" diagnosed (SHIPPED 2026-07-25)

User: "she dosent look happy and she is breathing heavily why? shes just suppose to breath quietly sleeping."

**FAULT 1, the smile was gone.** The successive round-48 edits (open window → hands → bottle left → bottle forward) had each nudged her mouth until her lips sat parted and level, reading blank. **A detail can die by a thousand small re-renders even when no single edit targets it** — nothing in those four prompts mentioned her mouth. Restored with the round 43 cheek-driven wording. Also confirmed the grade drifts on every edit (R/G crept 1.086 → 1.105 → 1.124 → 1.113), so the deterministic grade must be re-applied last, every time.

**FAULT 2, "breathing heavily" was not breathing at all.** Measuring the shipped loop's torso showed displacement ramping 0 → 8.0 over 2.5s, holding, then reversing with the boomerang: one enormous 8-second swell, not a breath. Decomposing by body part found the real culprit:

| region | drift over clip |
|---|---|
| head/neck | 13.2 |
| ribcage | 10.2 |
| shoulder | 8.9 |
| legs | 2.6 |

**The model progressively DEFORMS her upper body across a clip — head worst — and it is monotonic, not periodic.** That slow one-way swell is what reads as laboured breathing. Two properties make it fixable: it is roughly linear in time, and it is front-loaded (head drift 0 → 10.1 in the first second, then only +3.0 across the next four).

Fix, all editorial, no compositing:
1. **Short window.** A window selector scored every (start, length) pair on head drift, rib range and curtain motion. Halving the window roughly halves the drift. Chose a 1.5s window (head 3.78, ribs 5.55, curtain 5.21) — inside it the rib signal finally oscillates instead of ramping.
2. **Slow to 0.5x** with `minterpolate` (mci/aobmc) for real interpolated frames rather than judder. This fixes two complaints at once: breathing drops from ~60/min (panting) to ~31/min, and curtain motion falls 6.16 → 3.93, which is the "very light" curtain the brief asked for. **Speed change is honest film grammar, unlike the amplification and freeze plates that were rejected.**
3. Boomerang the result → 5.75s loop.

Shipped: 1284x716, 5.75s, 540KB. Residual, flagged to the user rather than hidden: ~31 breaths/min is still faster than real sleep (12–16), and plant/shadow motion stays subtle because of the round-48 coupling ceiling.

## Round 48 : No effects at all, and the ceiling that revealed (SHIPPED 2026-07-25)

User, on seeing the round 47 film: "isnt the animation kinda weird like theirs 2 layers", then "did u do some kind of effect that make her look fake", then the instruction: **"dont put fake effects"**. Brief: very light curtain, shadows moving with it, subtle plant + shadow, subtle smile and subtle breathing, realistic/subtle/premium, and de-orange the picture before animating.

STILL, three fixes:
- **Hands.** The round 46 open-window edit had degraded them (fingers merging near the tips, lower hand fusing into the upper). Re-fixed with the round 43 recipe. Lesson repeated the hard way: **after any edit that re-renders the scene, re-QA every previously-approved detail, not just the one you were watching.** I checked her face after that edit and not her hands, and shipped the regression.
- **Colour.** R/G 1.150 → 1.086, B/G 0.958 → 0.972. Note each AI edit drifts the grade (R/G crept 1.086 → 1.105 → 1.124 across two edits), so **re-apply the deterministic grade as the LAST step after any edit**.
- **Product position.** User: too near the right edge, then "product should [not] be too much to the edge of table". Two moves: left off the frame edge (centre 86% → 77%), then forward off the table's BACK edge, where the first move had perched it.

FILM — the important finding. With every synthetic step removed, the model's own limits become the constraint, and they are real:

**Her face morphs on its own.** Raw, uncomposited footage shows her mouth changing shape across the clip (face drift 19.8 on the first gentle take). This was never something post-processing introduced — it is why the earlier frozen-face plate existed at all. So the honest options are only: pick and trim footage where the face holds, or accept morphing.

**Face drift concentrates at the START of a clip.** Measured on four takes: trimming the first 0.5–0.9s dropped max drift from 9.57 → 4.83 on the winning take. **Trim the head of every kling clip; the model settles after it commits to the scene.**

**Motion energy and face stability are coupled, and cannot be separated by prompting.** Four takes across the range:

| take | curtain | plant | shadow | face drift |
|---|---|---|---|---|
| energetic (r47) | 10.07 | 11.84 | 3.65 | morphs badly |
| D moderate | 5.39 | 1.91 | 0.77 | 8.25 |
| A calm | 4.94 | 1.10 | 0.67 | 5.75 |
| **C calm (shipped)** | **4.25** | **0.73** | **0.99** | **4.83** |

The plant sits directly beside her in frame, so the model animates that whole region as one: ask for a swaying plant and you get a morphing face. **This is a hard ceiling of image-to-video here, not a prompting failure.** Shipped C: face genuinely holds (verified first/middle/last — identical mouth and expression), curtain drifts nicely, but plant and shadow are subtler than the brief asked. Flagged to the user rather than hidden.

Shipped: hero-shrine-pingpong.mp4, 1284x716, 8.58s boomerang, 1.3MB. Zero compositing, zero amplification, zero freeze plates — the only interventions are trimming and the boomerang.

## Round 46 : Two film artefacts diagnosed, and the window opened (2026-07-25)

User on the round 45 film: "isnt the animation kinda weird like theirs 2 layers or somehting and like shes not even breathing", then "is the windw open for the wind to blow?" and "why the pan not shakind a bit with the wind or her or the plant shadow".

**ARTEFACT 1: the "two layers" look. Cause: freezing with a plate that does not match the video.** Round 45 composited the pristine STILL over an AI-UPSCALED video. The bytedance upscaler rewrites grain, micro-sharpness and colour, so the frozen patch no longer matches its surroundings and reads as a separate plate sitting on the scene. Measured mismatch between the still and the video's own frame 0: face MAD 6.37 (peaks 103), hands 7.38, product 4.31.
**Fix: cut the freeze plate from the VIDEO'S OWN frame 0.** Mismatch becomes 0.00 by construction. Corollary: skipping the upscale entirely is often the better trade — the upscaler's texture rewrite is what created the problem, and a native 1284x716 loop under a 2560 poster looks cleaner than an upscaled one with a visible plate.

**ARTEFACT 2: "phasing through herself". Cause: temporal amplification.** To make the breathing read, the torso was boosted with `blend=all_expr='A*2.0-B*1.0'` (push each frame away from the reference frame). It doubled the measured breathing (chest 1.32 → 2.78) but it is a temporal unsharp mask, so wherever the body actually displaced it left a ghost echo — visible as pale cyan fringing across her shirt and a doubled forearm. **Never amplify motion by blending against a reference frame on a human body.** If breathing needs to be stronger, get it from the generation, not from post.

**The mask must be placed from measured data, not guessed.** Per-column frame-difference profile across the person's band located her face at 52–64% of frame width and her breathing torso at 66–78%. Every earlier mask had been bleeding into the torso and flattening the breath (chest 3.33 → 0.41, then 1.17, then 1.32 as the mask was pulled back). Freeze the FACE and the PRODUCT only; leave hands and torso live — slight hand movement in sleep is more realistic than rigid arms anyway, and the original "fake" complaint was always about the face warping.

**The window was closed.** The breeze had nothing motivating it, which is why the motion read as unmotivated no matter how strong it was. Edited the still to an open casement (job 891fd9e3). Note the edit re-rendered the whole scene (overall MAD 20.5), so it could not be spliced back into the approved frame — a column-MAD profile showed 0–45% of the width diverging badly (peaking at 72 where the plant moved). Adopted the new render wholesale after confirming her face, smile and identity survived intact. The open window is brighter, so the hero scrim went up again (0.66 / 0.47 / 0.25 / 0.08) and the headline gained a tight 4px shadow to hold 3:1 at its worst pixel.

## Round 45 : THE FILM, wired at last (SHIPPED 2026-07-25)

Animated the approved round 44 frame and wired it into the hero. `hero-shrine-pingpong.mp4`, 2582x1440, 10.08s boomerang, 6.4MB.

Pipeline: kling3_0 (non-turbo, the round 17 rule still holds: turbo suppresses environment motion) → bytedance 2K upscale → freeze composite → boomerang → x264 crf21 +faststart.

**The freeze composite is the important new technique, and it replaces round 17's blanket person-damping overlay.** Raw generation gave good wind but an unusable face:

| zone | raw | after freeze |
|---|---|---|
| curtain | 7.33 | 9.61 |
| plant | 5.50 | 7.36 |
| face | 8.58 (peak 31.4) | 0.17 |
| hands | 4.44 | 0.42 |
| chest | 3.33 | 2.04 |
| product | 0.91 | 0.00 |

Instead of damping the whole person at 75% (round 17), build a single RGBA overlay from the shipped STILL with a feathered alpha mask covering only face+neck, hands+forearms, and the product, then one ffmpeg `overlay`. Those areas become pixel-identical to the approved still, everything else stays live. One overlay, one pass, no per-frame work.

Two calibration lessons:
1. **The first mask killed the breathing.** Extending the hands region to x=0.805 swallowed the ribcage and chest fell 3.33 → 0.41. The hands sit to the LEFT of the chest; pulling the hands mask back to x=0.672 restored chest to 2.04 while keeping hands at 0.42. **Mask the hands and the chest as separate regions or the freeze eats the breathing.**
2. Feather scales with resolution: blur 22 at 1284 wide, 44 at 2582. Verified on a mid-film frame that no seam shows across the shirt.

Wiring: `<video autoplay muted loop playsinline preload="metadata">` with the still as `poster`. **The autoplay attribute alone is not sufficient** — it did not start in the preview at all, though `play()` resolved without error, and iOS low-power mode refuses it silently too, which would leave the poster frozen and look broken. Added `initHeroFilm()` in js/motion.js: explicit `play()`, retry on first pointerdown, IntersectionObserver to pause off-screen, and a `prefers-reduced-motion` branch that strips autoplay and holds the poster. Verified playing and wrapping the loop, zero console errors.

Previous film kept as hero-shrine-pingpong-old.mp4.

## Round 44 : Reframed left, degraded the orange, italic descender unclipped (SHIPPED 2026-07-25)

Three fixes on the shipped round 43 frame.

**She overlapped the headline.** The instinct is to reach for `object-position`, but measuring killed that: the hero box at 1440x1000 is 1440x820 (1.756) and the image is 1.792, so cover crops only 29px total. **There is no pan room when the image ratio and the container ratio nearly match** — `object-position` does nothing and no amount of tuning it will move the subject. The frame itself has to get wider.

Fix: `outpaint_image` to 21:9. It returned 3168x1344, which is a SCALE + horizontal extension, not a vertical crop, so the full scene height survives. But the original content comes back downscaled (2752 → 2408), so it cannot be used directly for a 2560 hero. Recipe that preserves quality:
1. Upscale the outpaint canvas by 1536/1344 → 3621x1536, putting the original back at native scale.
2. Locate the original inside it by minimising MSE of a mid-height row band rather than assuming it is centred (measured offset 442, not the 434 that centring predicts).
3. Colour-match the outpaint to the original with per-channel gains from a 220px overlap band (gains came out 1.008–1.010, small but enough to show at a seam).
4. Paste the PRISTINE original over the top, feathering only its leftmost 90px into the matched outpaint.
5. Crop the final 2752-wide window at s=150. Her head moves from ~48% to ~58% of frame; the crop's right edge lands inside original content, so no outpainted material and no bare feet from the right extension enter the frame.
Only 292px of the final width is generated, all of it soft curtain under the heaviest part of the scrim.

**Too orange.** Measured R/G 1.218 and B/G 0.844, a heavy cast. Graded to R/G 1.128 / B/G 0.941 — cooler, still warm-neutral. Two details make the grade look photographic rather than filtered: apply the channel gain with a highlight-preserving weight (`1-clip((v-0.75)/0.25)^1.5`, so the gain acts on mids and shadows and eases to nothing near white, which stops the window blowing cyan), then restore the original mean luminance afterwards so only the colour changes, not the exposure. Plus 8% global desaturation.

**Italic descender clipped.** The `f` of "for your mind." was cut. Cause: `.split-line` carries `overflow:hidden` for the mask reveal, and its compensation was `padding-bottom:.18em/margin-bottom:-.18em` — vertical only, and too small for this serif italic. **An italic overhangs LEFT as well as down**, so the compensation must be two-axis: now `.3em` bottom and `.14em` left, each cancelled by an equal negative margin so layout does not shift.

Shipped: hero-shrine.jpg 2560x1429 q93 877KB. Backups hero-shrine-round44.jpg (pre-reframe) and hero-shrine-round45.jpg (pre-grade).

## Round 43 : The smile put back, hands rebuilt, hero type made legible (SHIPPED 2026-07-25)

User: "why isnt she smiling resting". Round 42 over-corrected. Killing the pursed/aged mouth by removing the smile entirely left her reading neutral rather than content.

**The rule that finally works, and it replaces every earlier smile note in this file:** a resting smile must be driven FROM THE CHEEK, never from the mouth. Prompting the mouth directly ("lift the corners", "subtle happy") makes the model tighten the lip line, and lip compression is what reads as pursed and old. The wording that works describes the cheek doing the work and explicitly holds the lips slack: "the cheek softens and rises, one corner lifts marginally more than the other so the smile is slightly uneven and therefore real, the lips themselves remain entirely relaxed, closed without any pressure." Slight ASYMMETRY is the strongest realism cue: a perfectly symmetrical lift always reads posed. Two variants were run; the symmetric-cheek version (8c007290) drifted toward a smirk, the asymmetric half-smile (f9979c6f) won.

HANDS (user: "make sure her hands at resting all perfectly"): the round 42 hands failed at zoom — fingers partly fused, the two hands overlapping ambiguously, fingertips unresolved. Fixed with a hands-only edit. What works is prescribing each hand's geometry separately and forbidding the failure modes by name: five fingers each, correct joint counts, defined knuckles, short pale unpainted nails, creases at knuckle and wrist, contact shadows into the boucle, and a banned list (fused/webbed digits, extra or missing fingers, reversed joints, rubbery boneless shapes, hands melting into fabric). Two variants again; the one that SEPARATED the hands into clearly distinct roles (upper palm-down near the cheek, lower loosely open below, never touching) resolved far cleaner than the one that stacked them. **Separate the hands rather than overlapping them; overlap is where fusion artefacts hide.**

HERO TYPE (user: "make sure fonts are visible"): measured rather than eyeballed, sampling the actual image pixels behind each text run and computing WCAG ratios against white. The old scrim was failing badly: the headline zone averaged 2.79:1 and dropped to 1.02:1 against the brightest curtain highlights, i.e. invisible. Fix in css/home.css `.hero__media::after`: the left-to-right scrim went from a single weak stop (0.3 → 0 by 45%) to a five-stop ramp (0.58 / 0.4 at 24% / 0.2 at 42% / 0.06 at 52% / 0 at 64%), plus full-paper colour and a tight 3px text-shadow on `.hero__eyebrow` and `.hero__sub` on top of their existing soft glow. Verified per text run, worst-pixel not just average:

| element | avg | worst pixel | AA bar |
|---|---|---|---|
| headline "Make space" | 8.73 | 3.28 | 3.0 (large) |
| headline "for your mind." | 9.50 | 3.35 | 3.0 (large) |
| eyebrow | 5.00 | 3.64 | 4.5 (+shadow) |
| sub line 1 | 10.44 | 3.86 | 4.5 (+shadow) |
| sub line 2 | 12.30 | 4.41 | 4.5 (+shadow) |

**Measure text-over-photo contrast by sampling the image, and use the WORST pixel under each text run, not the average.** A bounding-box average hides the one blown highlight that eats a letter; and measure the text run's own client rects, not the element box, or trailing whitespace skews the result.

Shipped: hero-shrine.jpg 2560x1429 q93 subsampling=0 879KB. Round 42 backed up as hero-shrine-round43.jpg.

## Round 42 : Full re-shoot, real product reference, real skin (SHIPPED 2026-07-25)

User rejected round 40 outright: "not like the fake smile old girl", environment more realistic and on theme, product on the table sharper and real against the actual product, overall premium and dynamic. Round 35's rule applied: when a note repeats after two edit attempts, STOP editing and rebuild the scene. So this was a fresh full-scene generation, not another face edit.

What changed the face for the better, after a dozen rounds of chasing it: **stop asking for a smile at all.** Every "subtle happy" / "lift the corners" phrasing produced the pursed, aged mouth. The winning wording is purely subtractive: "lips soft, full and gently closed with NO forced smile, NO lifted corners, NO pursing or compression, just easy natural calm with the faintest trace of contentment", with the Pan-Asian identity restated in full in the same breath. A fresh scene also avoids the generational drift that edits accumulate.

Dynamic + premium came from staging, not from prompt adjectives: shot low at coffee-table height, three real depth planes (sharp foreground product / mid-ground figure / luminous window behind), and large soft monstera shadows thrown across the warm plaster wall. That wall shadow is the single biggest "this is a real photograph" cue in the frame, and it is also the motion the film will animate.

Two fresh scenes generated (43fbcb1c, e5e8d61d); 43fbcb1c won on composition (bottle fully in frame, tote in front of the couch, stronger leaf shadow). Its two remaining flaws were fixed in ONE tightly scoped edit (3e2185b8) off the winner, with the real product photo passed as a second reference:
- PRODUCT: the fresh scene rendered the diffuser soft and slightly off-form. Edit brought it to tack-sharp and rebuilt the silhouette from the reference: wide squat body, gently domed shoulders, short straight neck, thick rolled rim, oil to two thirds with a visible meniscus, exactly two birch reeds crossing above the rim (one plain, one ball-topped, which IS the real product's configuration). Real glass now: rim speculars, reeds visibly offset by refraction at the liquid line, a bright caustic pool and contact shadow on the oak.
- SKIN: the fresh render was airbrushed. Asking for "visible fine pores, soft peach fuzz along the jaw and cheek, subtle natural colour variation" fixed the CGI sheen without touching the expression.

Hedge worth keeping: a product-only variant (1368a419) was generated in parallel in case the combined edit drifted the face. It did not, but the product-only version over-corrected the bottle into a tall-necked decanter. **A scoped "only edit the product" prompt makes the model enlarge and restyle the object; the combined edit held scale better.** Kept for reference only.

Shipped: hero-shrine.jpg 2560x1429, q93 subsampling=0, 921KB. Round 40 backed up as hero-shrine-round42.jpg. Browser verified at 1440x1000, zero console errors, headline clears the figure over the curtain. Film still unwired and awaiting approval: wind on plant and curtain, wall shadows sweeping, gentle visible breathing, face/hands frozen, bottle locked, boomerang loop.

## Round 40 : Soothing not pursed, bottle perfected (SHIPPED 2026-07-25)

User sent two zoom crops: her mouth read slightly pursed and therefore older, and the bottle needed its form perfected. Both fixed in one edit off 8e4de4c3.
- FACE: the failure mode of "lift the mouth corners" prompting is a COMPRESSED, pursed lip line, which instantly ages a face. Fix is to prompt for RELAXED lips first and the curve second: soft naturally full lips resting closed with only a slight upward turn, plus explicit negatives (no pursing, no puckering, no compression, no lines or creases around mouth/nose/eyes). Result reads soothing and young. Pan-Asian features restated again in the same prompt (see round 39 rule: identity must be re-specified in EVERY face edit).
- BOTTLE: prompted for a precisely formed symmetrical squat rounded bottle, smooth even walls, level rim, correct short neck, honest 200ml proportions, bare glass, exactly two reeds (one plain, one ball-topped) seated naturally, with physically correct refraction and a clean contact shadow. Verified at zoom: rim even, walls clean, reeds correct.
Export 2560 q93 4:4:4 (737KB); round 39 backed up as hero-shrine-round41.jpg. Verified live, zero console errors.

NOTE on 4K: a 4K pass was tested for extra detail and REJECTED: it widened her smile toward teeth-showing and lost the subtlety. The shipped file is native resolution (2752 source to 2560 export), so detail is genuine rather than interpolated.

## Round 39 : Tender smile, bag moved, Pan-Asian locked, quality (SHIPPED 2026-07-25)

User asks across this round: subtly happier expression, move the bag in front of the couch so the left copy zone is clear, higher detail/quality, keep it realistic, premium and on theme. Then two corrections: "her expression doesn't seem tender and happy subtle" and "and panasian".
- BAG: relocated from the left of the sofa to the floor in FRONT of the couch, centre-frame. The entire left third is now clean floor, wall, curtain and plant, so the headline sits on empty space.
- EXPRESSION, two passes. First pass lifted the mouth only and read flat. Correct approach: tenderness is a WHOLE-FACE change, not a mouth change: mouth corners up, cheeks lifted and rounded giving soft fullness under the closed eyes, the eye area relaxed into a gentle upward curve, brow smooth, jaw released. That reads as a private, affectionate dream-smile without ever widening into a grin.
- ETHNICITY DRIFT (important, recurring): each successive face edit pulled her features toward a generic average and away from Pan-Asian. Fix: restate the ethnicity EXPLICITLY in every face-editing prompt, with concrete features (soft almond eyes with natural epicanthic fold, softly rounded low-bridged nose, delicate jaw, warm honey skin, sleek jet-black hair). Never assume identity carries through an edit.
- Chosen 8e4de4c3 (tender + Pan-Asian locked) over 34fef54a (tender but features drifted).
- QUALITY: export bumped to JPEG q93 with 4:4:4 chroma (no subsampling) at 2560 wide, 759KB, and the prompts now enumerate the fine detail to preserve (hair strands, pores, boucle weave, linen curtain, oak grain, glass refraction).
Round 38 backed up as hero-shrine-round40.jpg. Verified live, zero console errors.

## Round 38 : No shoes, bare glass, DSLR realism (SHIPPED 2026-07-25)

User: drop the shoes, no label on the bottle, and make it read as a real natural Canon DSLR shot. Two edits off the round 37 render (b372fc67, the pre-label version):
- Loafers removed, clean oak floorboards with continuous grain where they were. Tan tote kept (it still carries the just-home-from-work story on its own).
- Bottle returned to BARE clear glass, no label of any kind: the typeset label from round 37 is therefore retired for this hero. Shape, scale, placement, contact shadow and the two reeds (one plain, one ball-topped) all preserved.
- Realism pass: explicit Canon EOS R5 + fast prime framing, honest colour, natural highlight rolloff, believable depth of field, real skin pores and flyaways, boucle weave, oak grain, fine sensor grain, with hard negatives against CGI smoothness, plastic sheen and airbrushing.
Chosen a68c0678 over 23e27449: more visible floor grain and fabric texture, warmer directional light, so it reads more photographic. Export 2560 lanczos q88 (494KB); round 37 backed up as hero-shrine-round38.jpg. Verified live, zero console errors.

DECISION LOG for the bottle: bare glass is the standing choice for the hero (rounds 22 and 38). The typeset-label method stays documented in rounds 19/29/37 for any surface that ever needs legible product text, but it is NOT used on this hero.

## Round 37 : Bottle set back + real label + younger (SHIPPED 2026-07-25)

User: bottle too close and too far right, must look like the real product, and make her beautiful and young. Edited the approved round 36 scene (251e7435) rather than rebuilding, because the room/wardrobe/palette were already signed off:
- BOTTLE: moved back on the table and inward from the right edge, scaled down so it reads as an ordinary 200ml diffuser resting on a table instead of a looming foreground object. Breathing space around it and headroom above the reeds. Shape now matches the real product: squat rounded body, short neck, two reeds with one ball-topped.
- HER: refined to early twenties, fresh youthful features, clear luminous skin, delicate brows, long lashes, still strictly NO MAKEUP and real pores retained. Pose untouched: head low on the flat cushion, neck level, arms resting politely.
- LABEL: the render produced a garbled label again ("HIICAI / METKINEN"). Fixed deterministically with the round 19 TYPESET method rather than another render: real fonts drawn at 6x (IKIGAI, HETKINEN letterspaced, plus SCENT DIFFUSER / 200 ML / CRAFTED IN FINLAND as fine print), projected through the measured label quad (1915,1204)-(2090,1286) with 2x2 supersampling and multiplied onto the bottle's own light field. Crisp and correct at zoom even at this smaller bottle size, because the letters are vector-rendered rather than photo-resampled.
Export 2560 lanczos q88 (513KB); round 36 backed up as hero-shrine-round37.jpg. Verified live, zero console errors.

## Round 36 : Product-led composition, on-theme wardrobe, mobile header fix (SHIPPED 2026-07-25)

User asked whether the bottle should be bigger like the real product, said she was too big in frame, and that she should read as just home from work. Measured the previous still: bottle occupied ~7% of frame width vs her head at ~13%, so the product read as incidental for a fragrance hero. Then: "she should be with the theme, product accurate like original, plan the sizing and placement".

PLANNED COMPOSITION (now the house spec for this hero):
- LEFT 35%: window, sheer curtain, monstera, warm wall. Quiet, reserved for the headline.
- MID-GROUND centre-right: sofa with her asleep, deliberately SECONDARY in scale.
- FOREGROUND lower right: oak table with the diffuser FULLY in frame, clear headroom above the reed tips, base ~4/5 down and ~3/4 across so the desktop crop (object-position 72%) never cuts it.
- Product accuracy: real product photo passed as reference: squat rounded clear glass, wide body, short neck, exactly two reeds (one plain, one ball-topped), bare glass, believable 200ml scale.
- WARDROBE ON THEME: strict warm neutrals, explicit "no black, no navy" (the previous pass had a navy blazer and black loafers which broke the palette): oat shirt, taupe trousers, camel blazer over the sofa back, tan leather tote, tan loafers. Keeps the just-home-from-work story while staying in the brand palette.
Chosen 251e7435. Export 2560 lanczos q88 (575KB); round 35 backed up as hero-shrine-round36.jpg.
Mobile crop retuned to object-position 70% 42% (at 58% the product fell outside the phone crop entirely).

MOBILE HEADER FIX (user: "wtf fix this"): on phones the hero is STACKED, so the bar sits over paper, never over the image, but it still carried .header--over-hero: a 220px dark scrim plus white type and a white wordmark, which rendered as a grey slab. Under 640px the over-hero treatment is now disabled (no scrim, ink text, ink wordmark, paper background with a hairline). The announce line also wrapped to two lines (59px tall); it is now split into spans and the shipping half plus separator are hidden on mobile, leaving one clean line at 10px ("10% off your first pause"), 39px tall. Desktop verified unchanged: white type, scrim intact, one line.

## Round 35 : ROOT CAUSE FOUND, scene rebuilt (SHIPPED 2026-07-25, film pending)

Rounds 30-34 all failed the same note ("head too raised, not relaxed") because I kept EDITING. The real cause was furniture geometry: the pillow was wedged against the sofa's raised ARMREST, so her head was resting on a ~40 degree incline. No pose instruction can flatten an inclined support. LESSON: when a pose note repeats after two edit attempts, stop editing and rebuild the scene.

Fix pipeline:
1. Fresh full-scene generations (3) with the pillow explicitly FLAT ON THE SEAT, away from the armrest, body horizontal, head low and level with the shoulder line. nano c94b2cdc won (head genuinely low, Pan-Asian, clothed in a cream knit, blanket, correct room). soul_2 1c2ffb77 REJECTED: came out nude. PROMPT LESSON: fresh scene prompts must state the clothing explicitly; the edit prompts had always carried "same white shirt and taupe trousers" so I never noticed the dependency.
2. Beauty pass (8b74b763): refined features, clear even skin (the base had visible blemishes), glossy neatly styled hair, with "keep real pores, no airbrushing" to prevent the waxy look.
3. Final pass (038f3bda) for the user's last three notes: original bottle (real product photo as reference: squat clear glass, two reeds, one ball-topped), POLITE resting arms (the dangling arm was brought back so both hands rest neatly together on the cushion, nothing gripped), and NO-MAKEUP natural beauty (bare skin, natural brows/lashes/lip tone).
4. The bottle came back wearing a garbled label, so a label-removal render (d394323f) was feather-pasted over just the bottle region (1900,1030)-(2400,1420) to restore approved BARE GLASS while protecting her.
Export 2560 lanczos q88 (512KB) -> hero-shrine.jpg; round 34 backed up as hero-shrine-round34.jpg. Verified live, zero console errors. NOTE: this is a NEW room/woman (fresh generation), so the old films no longer match; hero stays on <img> until this still is approved.

## Round 34 : Head sunk into the pillow + prettier (SHIPPED 2026-07-25, film pending)

User: "the head is too up so not relaxed" + "make her a bit prettier natural". Correct diagnosis: in round 33 her head was still HELD, neck craned and lifted above the shoulder line, which reads awake/tense no matter how relaxed the arms are. Two edits off the round 33 still (3353efae) naming the problem explicitly and demanding: head sinks DOWN and heavy so the pillow compresses and moulds around it, neck in a straight natural line with the spine, chin softly tucked, head level with the shoulder line. Beauty pass in the same prompt: refined features, luminous even skin with a natural warm flush, delicate brows, long lashes, calm mouth, WITH explicit "keep real skin texture and pores, no plastic airbrushing" so it does not go waxy.
- A (7c4b9f17): head clearly lower, warm natural face.
- B (0728835a) CHOSEN: head sits deepest into the pillow (pillow visibly moulds around the cheek), features slightly more refined and luminous, skin still real.
NECK RULE (add to the sleep rule set): the neck is the master tell. Head above shoulder line = awake. Head level/below with the pillow deforming = asleep. Fix the neck before touching anything else.
Export 2560 lanczos q88 (573KB) -> hero-shrine.jpg; round 33 backed up as hero-shrine-round33.jpg. Hero on <img>. Verified live, zero console errors.

## Round 33 : Neat restful sleep, no clutching (SHIPPED 2026-07-25, film pending)

User rejected round 32: the pillow-hug read as GRABBING, and the messy hair across her face was wrong. Brief: restructure the whole position for relaxed sleep and rest, and her FACE MUST BE NEAT. This reverses two of the round 32 "rules": for THIS brand, messy hair and clutching are not premium, they are untidy.
Two restructures off the round 31 base (7206a9fd), both with explicit negatives (holds NOTHING, hugs nothing, grabs nothing) and an explicit neat-face clause (hair swept back, no strands on cheek/forehead/eyes):
- A (796a32f0) CHOSEN: lying on her side, body settled and graceful, one arm extended softly along the cushion with the hand open palm-down, the other resting with a loosely curled palm-up hand, nothing held. Legs comfortably bent, throw draped smoothly over her hip. Hair smoothly swept back behind her shoulder, face clean, fully visible, warmly lit, eyes calmly closed, lips together in a faint peaceful smile.
- B (53205709): near-identical, slightly flatter light on the face.
FINAL RULE SET for this hero: relaxed = open resting hands + settled body + smooth throw; premium = neat swept-back hair, clear visible face, uncrumpled clothes. Avoid: clutching/hugging props, hair over the face, squashed features.
QA at zoom: face clean and serene, both hands anatomically correct and resting open, bottle untouched.
Export 2560 lanczos q88 (570KB) -> hero-shrine.jpg; round 32 backed up as hero-shrine-round32.jpg. Hero on <img>. Verified live, zero console errors.

## Round 32 : Deepest sleep, cosy (SHIPPED 2026-07-25, film pending)

User pushed once more for "more relax and sleeping". Round 31 was flat but still looked styled: neat hair, crisp shirt, tidy hands. The remaining tells were GROOMING and WARMTH, not posture. Two edits off the round 31 still (7206a9fd):
- A (75124e60): face pressed further down into the pillow, hair across the face, both arms abandoned. Deepest "conked out" read but the face is squashed less attractively.
- B (3b82d2b9) CHOSEN: she hugs the pillow with one arm, face sunk into it so the pillow deforms around her cheek, the knit throw pulled right up over her shoulder like a blanket, knees curled, hair fallen messily across her face, and the free arm dropped with the hand PALM-UP and completely slack. Brows smooth, lips softly parted, small sleepy smile.
Rules learned (cumulative, use these for any future sleep art direction):
  1. propped neck + held hand = resting; flat/sunk neck + fallen open hands = asleep (round 31)
  2. palm-UP slack hand is the single strongest "deeply asleep" signal
  3. tidy hair + crisp clothes read as styled/awake; messy hair across the face + rumpled shirt read as slept-in
  4. a blanket pulled up = warmth = comfort, and it sells "happily" asleep
QA at zoom: both hands anatomically correct (hugging hand grips naturally, free hand palm-up slack), face natural, bottle untouched.
Export 2560 lanczos q88 (588KB) -> hero-shrine.jpg; round 31 backed up as hero-shrine-round31.jpg. Hero still on <img>. Verified live, zero console errors.

## Round 31 : FULLY relaxed sleep, flat (SHIPPED 2026-07-25, film pending)

User: still not relaxed enough. Diagnosis was correct and worth keeping: in round 30 she was still semi-PROPPED against the armrest with neck angled up, one hand held under her cheek and shoulders raised: that reads "napping politely", not surrendered. Two new edits off the round 30 still (25bbc2b3):
- A (a6951256) CHOSEN: fully flat side-sleep along the seat, pillow flat under her, cheek genuinely squashed into it, shoulders dropped, BOTH arms fallen forward onto the seat with hands limp (one open, one loosely curled), knees stacked, throw slipped. Face: jaw slack, soft sleepy smile.
- B (c3bbd05f) rejected: on her back with an arm flung above the head. Deeply relaxed but reads as a STRETCH/yawn, shirt pulls open at the chest, and the raised elbow crosses the wall-shadow area.
Rule learned: the tell for "asleep" vs "resting" is the NECK and the HANDS. Propped neck + held hand = resting. Flat neck + fallen open hands = asleep.
QA at zoom: both hands anatomically correct (5 fingers, natural limp curl), face natural with flyaways, bottle untouched (bare glass, 2 sticks, sun streak, contact shadow).
Export 2560 lanczos q88 (600KB) -> hero-shrine.jpg; round 30 backed up as hero-shrine-round30.jpg. Hero still on <img> (film still shows an old pose). Verified live, zero console errors.

## Round 30 : Deep-sleep pose (SHIPPED 2026-07-25, film pending)

User: look is approved, wanted a version where she is FAST asleep, super relaxed, sleeping happily. Two nano_banana_pro pose edits off the live still (3232e40b), same room/light/bottle locked:
- A (16757c26): hands still tucked at chin, softer face. Closest to the old pose.
- B (9d488a35) CHOSEN: she has sunk deeper and turned into the cushions, one arm DRAPED LOOSE off the sofa edge with the hand hanging limp, knees curled under the throw, cheek pressed into the pillow, soft content smile. The hanging arm is the visual signal of real deep sleep, which is exactly the brief.
QA at zoom: face natural (pores, flyaways, unforced smile), hand anatomy correct (5 fingers, believable limp drape), legs natural, bottle untouched (bare glass, 2 sticks incl. ball reed, sticks through the neck only, contact shadow + sun streak).
Export 2560 lanczos q88 (601KB) -> hero-shrine.jpg; previous still backed up as hero-shrine-round29.jpg.
HERO REVERTED TO STILL: the wired film (hero-shrine-pingpong.mp4) still shows the OLD pose, so it is unwired to avoid a poster/film mismatch. On approval, re-run the round 24 recipe on this still: kling3_0, visible wind on plant+curtain, gentle visible breathing, face/hands frozen, bottle locked, bytedance 2K, boomerang.
Verified desktop + mobile crops, zero console errors.

## Round 29 : Selectable pyramid, essence layout (SHIPPED 2026-07-25)

- Pyramid is now SELECTABLE: each stone (Top / Heart / Base / Ritual plinth) carries data-act + role=button + tabindex, wired into the same select() as the rail and dots (home.js spots selector extended, plus an Enter/Space keydown branch since svg <g> is not a native button). Click or hover a stone and the panel copy, the film and the rail all follow. Verified: clicking the Base stone set live=2, panel="The base note", rail="The base".
- Title moved INSIDE the svg as <text class="dg-title"> at the apex x (130): it now centres exactly over the pyramid at any width, no CSS alignment math. Font switched from mono to Fraunces serif italic, 15px svg units (~21px rendered), ink coloured.
- Pyramid pushed up: whole svg shifted +26y with the title above it, .essence__acts min-height 240 -> 210 and its top margin removed, diagram margin-top cut to ~1rem, width up to 470px.
- The lead paragraph ("An essence is the concentrated soul...") moved OUT of the right panel into the rowhead under the section sub, freeing the right column for the acts + pyramid.
- Act icons redrawn/reassigned: 01 leaf, 02 NEW bloom (flower + leaves), 03 NEW resin (amber drop), 04 diffuser; size 30 -> 34px, stroke 1.5.
- Mood reset arrow no longer spins a full 360 (it was caught mid-rotation and read crooked): now a wind-up sway that always settles upright.
Mobile checked (diagram 350px, fits 390 viewport). Zero console errors.

## Round 28 : Mood colour IN the photo, icon polish, footer lift (SHIPPED 2026-07-25)

User course-corrections: no underline under mood titles, no icon chips (revert to simple glyphs), the mood colour should live in the PICTURE/shadow itself; some category icons bad and too small; footer content should sit higher.

- Mood cards: colour delivered as a photographic wash: .mood__media::after with the mood pastel at mix-blend-mode color, opacity .5 (.72 on hover): each photo takes its mood hue (bed=sand, focus=sage, clear=sky, reset=blush). Scrim keeps its subtle mc tint. Icons back to simple 30px paper glyphs with a drop shadow, per-mood idle animations kept. Underline and chip removed.
- Category icons: 38px (was 30), drop shadow added; the confusing "holder" glyph redrawn as a clear dish + angled incense stick + smoke curl.
- Footer: .footer__film-space cut from clamp(90,12vh,150) to clamp(30,5vh,60): content block sits high in the band; measured 60px.
Zero console errors, verified live.

## Round 27 : Pyramid v2, light-card ink icons, footer air (SHIPPED 2026-07-25)

User voice notes decoded and shipped:
- Category cards on LIGHT imagery (Incense Holders, Room Sprays) now flip their chrome to ink: black icons, ink-bordered arrows (tone: "light" flag in CATEGORIES -> .cat--light). Jade card image swapped to the clean studio shot (jade-pear-green-white.jpg): the old life shot had JADE DECO text baked into the photo colliding with the icon.
- Essence chapter rail kept (user likes the numbered look) and polished: uniform 168px chips, fixed-width numbers; mobile resets to compact numbers.
- Pyramid v2: a real pyramid now. Triangle TOP, trapezoid HEART, trapezoid BASE with a soft drop shadow, dashed leader lines to serif-italic time captions (10 min / hours / days), and THE RITUAL as the foundation plinth beneath (concept: the ritual holds the pyramid). Active chapter LIFTS its stone 4px and fills with its chapter pastel. Sized up to 420px with an eyebrow label "The architecture of a scent".
- Footer clarified request: much more air: padding-block 3.5-6rem, 3-5.5rem between links and the divider (measured 71px, was ~24px), bigger link type and row gaps, total footer height now ~745px.
Zero console errors.

## Round 26 : Responsive audit (SHIPPED 2026-07-25)

Mobile (390) and tablet (768) verified section by section. Fixes: mobile hero film crop moved from object-position 72 percent to 58 36 (her face was fully out of frame at phone width; media height 52svh), .hero max-height reset to none inside the mobile query (the desktop 980px cap would fight the stacked layout), mood icon chips made solid pastel with a hairline ink border and stronger shadow (the 90 percent alpha sand chip vanished on bright photos). Verified on mobile: stacked hero with her visible, mood cards single column with chips/underlines, categories, essence film + rail + DIAGRAM (renders and syncs on mobile), pills stacked with coloured icons, values 2-col with pastel bars, 10 percent underline, footer. Tablet: 2x2 moods, 3-col cats, full-bleed hero. Zero console errors. Capture note: svh-based sections inflate in tall test viewports; judge mobile hero at realistic heights.

## Round 25 : Mood colour system, site-wide (SHIPPED 2026-07-25)

User: mood icons must be more visible, appealing, animated, premium; each mood card gets its own colour shade; the colour code must be consistent across the whole site.

One source of truth in components.css: [data-mood="<id>"] sets --mc (pastel surface) + --mc-ink (AA text partner). Mapping: slower-nights=sand, focus=sage, clear-space=sky, soft-reset=blush. Consumers all read --mc/--mc-ink:
- Home mood cards: 48px pastel icon CHIP (always visible, shadow, blur), per-mood idle animations (moon sways, target pulses, breeze drifts, reset turns), always-on pastel underline under the name, scrim tinted toward the mood colour, hover deepens everything.
- Feature pills: switched from inline vars to data-mood.
- Shop filter chips: colour dot per mood, active chip fills with the mood pastel (NOTE: .chip.is-active base rule sits LATE in shop.css, mood override needs .chip.chip--mood.is-active specificity).
- PDP mood tags: pastel-tinted note-chips via data-mood.
Verified on home + shop (active chip computes sage/ink), zero console errors.

## Round 24 : FINAL FILM SHIPPED + homepage UI pass (2026-07-25)

Film (user: "animate exactly how i want it"): from the approved bare-bottle still (d40eed37). Two kling3_0 candidates with visible-wind + gentle-visible-breathing prompts; picked 1f793594 by metric gates: plant wind peak MAD 19.5 (real gust, curtain sweeps), chest 8.4-9.0 (visible gentle breathing, the round 17 damping is NOT applied this time per user), face intact (visual QA), bottle 3.7-4.8 (rigid). No label print needed (bare glass). bytedance 2K upscale (d28c1508, ~20 min) -> boomerang crf22 -> hero-shrine-pingpong.mp4 (2582x1440, 10.08s, 4.9MB) wired over poster hero-shrine.jpg. Browser verified, zero console errors.

Homepage UI pass shipped same day (user requests, all live):
- Hero height clamp(580px, 82svh, 880px), no longer full-screen; below-fold peeks.
- Serif italic accents optically upsized 1.13em site-wide (base.css) so "a feeling." matches the sans.
- Pastel token system in tokens.css (sage/sky/sand/blush/lilac + AA ink partners).
- Icons top to bottom: feature pills carry mood icons with per-pill pastel hovers, journal metas carry leaf/incense/candle, values redrawn (cairn + feather new in icons.js), draw-on when scrolled into view (.ic-in via initIconLife) plus idle micro-life (flame flicker, smoke rise, mist blink, value float).
- Pastel choosing states: mood card titles/notes/arrows tint per mood on hover, essence rail/act headings tint per chapter.
- Brand cards: much darker scrim + text shadows, text readable on light images.
- Newsletter headline literally "10% off" with count-up 0->10 on scroll (initTenPercent), pastel underline sweep, hover tilt; welcome popup matched.
- NEW scent architecture diagram in the essence section: Top/Heart/Base bars + ritual dot, synced to the active chapter, pastel-highlighted.
- .page-intro bottom spacing increased (our-story line breathing room).

## Round 23 : Bottle shape fixed (SHIPPED 2026-07-25)

User: the bare bottle's shape was wrong: the round 21 label-removal invented refractions where the sticks appeared to pierce the glass wall and the silhouette went lopsided. Fix: nano redraw of the bottle (94c83680) using the real product photo as SHAPE reference but bare glass, no label: sticks entering only through the neck, correct refraction bending at the liquid line, symmetric squat silhouette, ball reed kept. Regional paste (1980,890)-(2380,1425) into the PRISTINE slim-b base: box sized to cover every trace of the old bottle INCLUDING the old ball-reed position (a smaller box would have left a ghost ball above the paste). Band drift 16-27 but the feather hid it: seam verified invisible across boucle, blanket and table. hero-shrine.jpg replaced (605KB), browser verified, zero console errors. Still awaiting picture confirmation before the film.

## Round 22 : NO LABEL, bare glass (SHIPPED 2026-07-25)

User's final call on the bottle: no label at all. Shipped the bare-glass composite (slim-b-noglabel.png, from the round 21 label-removal pipeline) as hero-shrine.jpg (613KB). Clean transparent bottle, liquid line, reeds refracting, sun through the glass. The label saga ends here: rounds 13-21 tried photo-graft, homography relight, typeset print, own-brand label, round seal; the answer was subtraction. The round-seal and typeset variants are kept in scratchpad history (hero-roundseal-2560.jpg, hero-pauselabel-2560.jpg) if ever wanted. Still awaiting picture confirmation before the film; when animating, no label print step is needed anymore, just: gentle breathing, wind on plant and curtain, moving shadows, bottle locked.

## Round 21 : Label torn off, ROUND SEAL (SHIPPED 2026-07-25)

User: tear the paper label, put a round logo instead. Pipeline: nano edit removed the paper label to bare glass (1f345c13); only the label patch (2030,1220)-(2290,1395) feather-pasted into the pristine base (surroundings drift as always, seam invisible at web scale); then a deterministic round seal drawn in code: 70px circle at (2167,1318), thin ink ring at 86 percent radius, THE stacked over PAUSE in letterspaced Helvetica bold, 12x supersampled, multiplied onto the glass light field with a slight cream tint so it reads as a warm printed seal on the glass. Crisp at zoom, legible at hero crop, echoes the site wordmark. hero-shrine.jpg replaced (614KB), zero console errors. Bases kept: slim-b-noglabel.png (bare bottle) and slim-b-roundseal.png in scratchpad; the seal position/design lives in this round's script for the film's per-frame print later. Still awaiting picture confirmation before the film.

## Round 20 : OWN-BRAND label, THE PAUSE (SHIPPED 2026-07-25)

User verdict on round 19: side-by-side against the real product showed the truth: the two brand lines matched but the micro text (SCENT DIFFUSER etc.) can never resolve at hero scale, the label is only ~165px wide in frame; the reference photo is a macro shot. User's call: drop the Hetkinen fidelity chase, put THE PAUSE own brand on the bottle. Also the right branding move: the hero sells the store, not the supplier.

Built with the round 19 typeset pipeline: centered "THE PAUSE" (Helvetica bold, wide letterspacing, echoes the site wordmark) over "HOME FRAGRANCE" (26px in label space so it resolves), 4x canvas, homography projection, 2x2 supersampling, multiplied onto the scene light field. Both lines crisp at zoom AND legible at the live hero crop, matching the site logo above it. hero-shrine.jpg replaced (614KB), zero console errors. Comparison sheet label-compare.png kept in scratchpad history. NOTE for products/PDP: the catalog still sells real Hetkinen products; the own-brand label is a hero-visual decision only. Still awaiting the user's confirmation of the picture before the film.

## Round 19 : TYPESET label, the definitive fix (2026-07-25)

User: the label must look like the real product. Root cause finally named: ANY resampling of photo letterforms at this label size (~165px wide) goes mushy. Definitive fix: typeset the label like a print file. Real fonts (Helvetica bold for IKIGAI + HETKINEN with letterspacing, Helvetica regular for the tiny lines, Hiragino Sans GB for イキガイ), drawn at 4x resolution on a clean canvas laid out to match the real label, then projected onto the bottle through the measured homography with 2x2 supersampling, multiplied onto the scene's own light field (double MaxFilter + blur). Letters stay razor sharp at any zoom because they are vector-rendered, not photo-resampled. Verified at zoom AND at the live hero crop: IKIGAI / HETKINEN read clean. hero-shrine.jpg replaced (614KB). THIS IS THE LABEL METHOD FROM NOW ON, for stills and for the film's per-frame print (use this typeset canvas as the ink map source). Still awaiting approval before animating.

## Round 18 : Back to the still, clean label, AWAITING APPROVAL (2026-07-25)

User: do not animate yet, confirm the picture first; the label still reads bad; when animation resumes she should breathe A BIT (not frozen, not the round 17 amount).

Hero reverted to static img (hero-shrine.jpg). Label rebuilt on the pristine slim-b base with the v2 clean recipe: paper = the scene's own light field (MaxFilter applied TWICE then blur, single pass leaves ghost smudges of the old garble), ink = letterform map with main lines gamma 1.8 (darker) and the tiny side columns subdued to 45 percent strength so they read as texture, not smudge. NO manual clone healing (twice now a vertical clone has stamped ghost text, see rounds 14 and 18; if a heal is ever needed clone HORIZONTALLY from paper). Verified at zoom: IKIGAI / HETKINEN crisp on smooth paper, side text whisper-faint, no ghosts. Exported 2560 lanczos q86 554KB, installed, browser verified, zero console errors. The round 17 film stays on disk (hero-shrine-pingpong.mp4) but is NOT wired. When the still is approved, animate with: wind on plant and curtain, shadows moving, GENTLE VISIBLE BREATHING (between round 16 full and round 17 damped, target chest MAD ~5-7), product locked, then the per-frame label print.

Round 17 revision (user: label still not clear enough, she moves too much for someone resting, wind should blow the plant): same wind film, two deterministic layers added in the ffmpeg pass. One: person damping: the still is overlaid over her region ((1190,433)-(2570,1408) rounded rect, 50px feather) at 75 percent opacity, cutting her breathing motion to a quarter (chest MAD 13 -> 3.3) while the wall shadows above her keep sweeping; this overlay also further locks the bottle. Two: label ink boosted with gamma 2.2 on the letterform map so IKIGAI / HETKINEN reads at the hero crop. Plant motion verified strong after damping (plant-zone MAD 17-32). Final: 3.8MB. CDN lesson repeated: corrected files must go to fresh media slots. Shipped in place, zero console errors. Approved person kept, real room + monstera, correct 2-reed Ikigai mid-table, sheer curtain, single left window light, colour graded toward paper/cream via ffmpeg eq+colorbalance (not another render). Film: her breathing + monstera & shadow sway + curtain drift, product LOCKED still (verified end-frame: bottle + HETKINEN intact, no morph). Pipeline: graded frame uploaded to Higgsfield → kling3_0_turbo → bytedance 2K video upscale → ffmpeg boomerang. Mobile hero is stacked (image 56svh + copy on paper). Zero console errors.
