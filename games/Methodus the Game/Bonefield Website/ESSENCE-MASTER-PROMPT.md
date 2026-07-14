# ESSENCE — MASTER FINISHING PROMPT

Mission: take the two builds to "hand-to-a-stranger" quality —
`v3-summit.html` (THE STORY) and `multiplayer.html` (MULTIPLAYER). Both share one engine; every
core-engine change lands in BOTH files, kept in lockstep.

## Deliverable 1 — THE INCANTER'S CHEAT SHEET (the explicit user ask)

A new **CHANTS** tab in the spellbook codex (Tab key), in BOTH builds, that tells the player
exactly **what to say out loud**. It must be 100% truthful to the recognizer — every listed word
must appear in the actual regexes/word-maps in the code (`handleVoice`, `tallySpirits`,
`SPIRIT_WORD`, `NUM_WORDS`, `resolveBrew`). No invented words.

Content (cards in the codex body, same .ccard style the other tabs use):

1. **How to chant** — press `V` once (allow the microphone, Chrome), then `E` opens the recite
   window; name an element to kindle its spell; shout a RELEASE word to let it fly. One spirit =
   its classic spell; two or more spirits gel into a Forge brew. NPC voices go silent while you
   chant so the mic never mishears them.
2. **Words of Summoning** (what kindles each classic spell): Fireball — "fire, flame, burn,
   inferno, ember, spirit"; Water Ball — "water, wave, tide, frost, rain, flood, drown";
   Lightning — "light, thunder, bolt, storm, spark"; Force Push — "push, force, gust, repel".
3. **Raising the Fire** (fire's three power tiers with the canonical lines):
   "SPIRITS OF FIRE" → a small flame · "BRING DESTRUCTION TO MY FOE" (any of: destruct, destroy,
   foe, smite, ruin) → the fire roars · "TURN WHO DEFY YOU TO ASH" (any of: ash, defy) → an inferno.
4. **Words of Release**: for fire — "FIREBALL!" (or cast/unleash/release/now/go/launch/loose) or
   "FLAME SPEARS!" for the homing volley; for the others — short shout with cast/go/shoot/now/
   release/strike/unleash/smite/loose/launch/kaboom or the spell's own name (water/lightning/
   thunder/push).
5. **The Ten Spirits** (full Forge vocabulary — every word the tally hears), one compact card:
   Fire (fire/flame/flames/burn/burning/inferno/ember/blaze/pyre), Water (water/wave/tide/frost/
   ice/rain/flood/drown/aqua), Thunder (thunder/lightning/bolt/storm/spark/shock/volt), Earth
   (earth/stone/rock/ground/soil/terra), Metal (metal/steel/iron/brass/copper), Boom (boom/blast/
   explode/explosion/bang/kaboom), Wind (wind/gust/gale/air/breeze), Poison (poison/venom/toxic/
   toxin/acid), Light (light/dawn/holy/radiance/radiant), Death (death/dark/shadow/grave/void/
   necro). Counting words multiply the spirit before them: a/one/single=1 · two/double/twice/
   pair=2 · three/triple/thrice=3 · four/quad=4 · five=5 (e.g. "two water, three fire").
6. **Forging** — name TWO or more spirits in one breath, then shout "CAST!" (or unleash/release/
   now/go/launch/loose/fireball/kaboom/strike/smite/combine/forge/erupt/bloom). Show the two
   recipes the demo already teaches — "water… fire… CAST!" → Steam Burst and "fire… fire…
   water… CAST!" → Explosion — and point to the FORMULAS tab for the rest. DO NOT spoil the four
   undiscovered formulas; discovery-by-forging is a designed mechanic.

Implementation notes: add 'CHANTS' to CTABS (after MAGIC, before FORMULAS), add a CODEX.CHANTS
array (static cards; `g` field for the small right-hand tag; no `vis` needed — text carries it),
verify `renderCodex` renders cards without a thumbnail cleanly. Also update the MAGIC tab's
"Free Casting" card and the on-screen recite hint to mention "full word list: Tab → CHANTS".

## Deliverable 2 — verified bug-fix pass

Audit both files for real, demonstrable defects introduced during the recent feature waves
(title-screen input gating, demo tracker, formula discovery, multiplayer split, humanoid rig
replacement, AI textures, audio-only dialogue). Fix only high-confidence issues; keep the dense
single-file style. Known watch-areas: leftover references to removed DOM elements, the
`renderCodex` FORMULAS rebuild path, `severLimb`/`decapitate` against the new rig groups,
`applyWeaponVisual` blade scaling, guest-mode gating, story-build leftovers in multiplayer.html
and vice versa.

## Hard constraints

- NEVER change the rig contract (joint pivots, rig keys) or the face-plane spec.
- NEVER re-add dialogue text bubbles — NPC dialogue is audio-only with distance falloff+garble.
- FORMULAS discovery stays riddle-until-forged.
- Both files must stay valid single-file HTML/ES-module games with no console errors.
- Match the surrounding code style: dense one-liners, sparse targeted comments.

## Acceptance

- Tab → CHANTS shows the full cheat sheet in both builds; every word verified against the code.
- No console errors on boot in either build; title screens, demo (story), host/join (multiplayer)
  all still work.
