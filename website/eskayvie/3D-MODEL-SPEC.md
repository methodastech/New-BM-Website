# Eskayvie Mindtropic — 3D model spec (for the 3D artist)

Goal: a print-accurate, photo-quality rotatable 3D bottle that drops straight into the hero,
replacing the interim product-render image. The web hero is already built; you only deliver
the assets below and we paste a small `<model-viewer>` block back in.

## Deliverables
1. `mindtropic.glb` — the adult Mindtropic canister.
2. `junior.glb` — the Mindtropic Junior canister (deep blue, rainbow "JUNIOR", owl mascot).
3. (optional) `poster-mindtropic.webp`, `poster-junior.webp` — a front render of each, transparent
   background, ~1200px tall, shown instantly while the GLB streams in.
4. (optional) a baked `Pour` animation clip per bottle (see "Pour animation" below).

## Format
- **glTF 2.0 binary (.glb)**, single self-contained file, textures embedded.
- **Draco or meshopt compressed.** Target < 1 MB per bottle.
- Tri budget ~20k–60k. PBR metallic-roughness materials.
- Up axis **+Y**, front of label faces **+Z**. Bottle **upright**, **centered on the X/Z origin**,
  **base sitting on y = 0**. Real-world scale (bottle height ≈ 0.085 m) is ideal; model-viewer
  auto-frames either way, but keep both bottles consistent so they sit together.

## Look (must match the real product)
- Body + cap colour: **Pantone 286 C** royal blue (≈ `#0033A0` / `#1A2EE0`).
- **Lower label band is brushed silver/metallic** (metallic ≈ 0.8, roughness ≈ 0.3), not white.
- Body plastic: smooth, slightly glossy (metallic 0, roughness ≈ 0.25–0.35).
- Flat full-diameter cap with a fine seam line and a subtle step ring near the cap base.
- Proportions: squat canister, **height ≈ 1.25 × diameter**.

## Label (the part AI 3D can't do — this is why we need you)
- Apply the **print-ready dieline artwork as a high-res texture (2K+)**, UV-mapped so ALL text is
  crisp from every angle, including the small ingredient print.
- Adult front copy: white `eskayvie` (leaf over the "v") + `Mindtropic`; on the silver band:
  `MIND WELLNESS`, then `MIXED BERRIES FRUITS WITH SERINE & ASHWAGANDHA KSM-66 CHEWABLE TABLET`,
  Malay subtitle, `2 TABLETS A DAY / No added sugar`. Spelling is **SERINE** and **KSM-66**.
- Junior: rainbow `JUNIOR`, owl-graduate mascot, `KIDS MIND WELLNESS`,
  `Mixed Chocolate with Serine and Alpha-Linolenic Acid`.
- Certification marks (Halal, HACCP, GMP, MeSTI, etc.) where they appear on pack.

## Tablets (only if you bake the pour)
- Round flat chewable disc, ~12–14 mm, slightly bevelled. Berry red-purple (beetroot + berries),
  ≈ `#8A2A50`, faint speckle. Junior variant = chocolate brown.

## Pour animation (optional, nice-to-have)
- A clip named exactly **`Pour`**: cap lifts/opens and a handful of tablets tumble out and settle.
- Keep it ~1.2–1.8 s, no loop. We trigger it on click via `mv.play({repetitions:1})` and reset with
  `currentTime = 0`. If you don't provide this, the site keeps its current DOM-based tablet pour.

## How it drops into the site (we do this part)
In `index.html`, the hero currently has, inside `.float-wrap`:

```html
<div class="tilt" id="tilt-primary">
  <img class="bottle-img" id="mindtropic-img" src="assets/poster-mindtropic.png?v=2" ...>
</div>
```

We replace that `.tilt > img` with (the `.float-wrap` bob + `.ground-shadow` stay):

```html
<model-viewer id="mv-bottle" class="bottle-3d"
  src="assets/mindtropic.glb" poster="assets/poster-mindtropic.webp"
  camera-controls disable-zoom disable-pan disable-tap interaction-prompt="none"
  shadow-intensity="0" exposure="1.0" environment-image="neutral"
  camera-orbit="0deg 82deg 105%" min-camera-orbit="-Infinity 68deg auto"
  max-camera-orbit="Infinity 95deg auto" field-of-view="30deg"
  loading="eager" reveal="auto" alt="Eskayvie Mindtropic bottle">
</model-viewer>
```

and re-add the model-viewer module script in `<head>`:

```html
<script type="module" src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>
```

The hover-spin, drag-rotate, keyboard, reduced-motion, and click-to-pour wiring already exist in
the script (see the commented git history / earlier `bindBottle` + `pourTablets`). Hand back the
two GLBs and posters and the swap is ~5 minutes.

## Reference images
- Official current render (matches the real bottle): `assets/ref-mindtropic.png`
- Real lifestyle + label artwork: provided by the client (Pantone 286 C, silver band).
