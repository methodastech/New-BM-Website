# MAGIC ECONOMY REWRITE (frozen plan, spec v1.0 "implementation-ready")

Source of truth: the user-pasted BONEFIELD spec v1.0 (sections cited as §). Execute phases in
order; each phase must leave the game playable, syntax-checked (`node --check` on the extracted
script), and verified in the browser via `_bf` before the next begins.

## User rulings (locked 2026-07-11, do not relitigate)

| Ruling | Decision |
|---|---|
| Water Prison | stays CUT. Bone Cage remains the only trap. Water C slot empty. |
| Tier B | exists ONLY as the Explosion fusion payoff (WWFF → Explosion B). Base elements cap at C. |
| Spell names | keep build names, spec numbers apply: Gust=Push · Slash=Slice · Geyser=Water Ball · Torrent=Wave · Bone Spear=Bone Spike. |
| Staff ladder | starting Essence Staff = Level 1 (D max). Workbench forges L2 (75 cap), L3 (100 cap, C, no dispersal), L4 (130 cap, enables Explosion B). |
| Tier labels | E/D/C ladder already relabeled (done). 3-word crowns = the C phrases. B has no chant; it is reached only by the Explosion recipe's 4th stage. |
| §10 correction | spendMana reverts to FAIL-if-insufficient. Winded/Collapse trigger only when a successful spend lands exactly on 0. |

## Core model shift (Phase 1) — contained magic is AMMUNITION

Keep variable names `kindled` (element) and `tier`; add `magicPts`, `magicSeq`, `magicCast`
(no-topping-up flag), `magicTimer`, containment from equipped staff. Chant fills the reserve,
casts spend points, the reserve persists.

- `TIER_STAGE=[0,25,30,35,40]` essence per stage (§21.2, LOCKED). `TIER_TOTAL=[0,25,55,90,130]`.
- `QMULT=[0,1,1.67,2.17,2.67]` (§29). Damage = base × QMULT[tier]/QMULT[unlockTier].
- tierUp: checks essence (fail per §10, "Not enough Essence."), checks capacity ≥ TIER_TOTAL
  ("Container capacity insufficient."), checks `!magicCast` ("no topping-up" §19.3 — must spend,
  dismiss, or disperse, then restart at E). On success: pts=TIER_TOTAL[tier], seq.push(element),
  timer resets to container limit (§19.2). Collapse if essence lands exactly 0 ('magic' source).
- castSpell: cost = SPELL_COST base + (tier − unlockTier) (§28). pts<cost → "Not enough contained
  magic." On cast: pts−=cost, `magicCast=true`, reserve PERSISTS (do NOT null kindled), timer NOT
  reset. pts≤0 → container closes (kindled=null, tier=0, seq=[]). Casting pauses essence regen 1s.
- Essence: regen 2/s flat (LOCKED; delete WPN per-weapon regen). Regen pauses per §4.3
  (0.5 light / 0.9 heavy / 1.0 dodge & cast / block = whole duration + 0.5). Melee costs per §46:
  sword light 4 (dmg 20), heavy/finisher 8 (dmg 30), staff bash 3 (dmg 10). Sprint 5/s gross.
  Guard hold 2/s + impact surcharges (+3 light / +8 heavy).
- Dismiss: drawing the sword still guts the reserve (existing behavior = dismissal); add voice/typed
  word `dismiss` doing the same.
- HUD (§12): MAG row shows `pts / capacity`, element+tier label (exists), containment `mm:ss`
  under it when finite, "Containment: ∞" hidden. Failure strings exactly per §64.
- Spell costs (unlock, base): fireball E 7 · firearrow D 12 · flamethrower C 5+4/s of magic ·
  gust E 6 · galeslash D 10 · cyclone C 18 · geyser E 6 · torrent D 14 · bonespear E 7 ·
  bonewall D 15 · bonecage C 20 · raisedead C 25 (build-only, baseline) · mend E 6 (build-only) ·
  restoration D 10 (build-only) · heal E 8 · freeze C 18 · explosionball B 30 · explosiontower B 50.
- Spec base damages adopted at unlock (§55): fireball 30 (+burn 2/s×3s), firearrow 45, slash 35,
  gust 5+knockback, geyser 22, torrent 25, bonespear 25, bonewall 120 HP, bonecage 140 HP,
  cyclone 48 total over 4s (duration 4s per §33.4, up from the current 2s lift), heal 20/40/60 E/D/C.
- Unlock tiers shift: firearrow/galeslash/torrent/bonewall/restoration become D-locked (tierLock:2);
  flamethrower/cyclone/bonecage/raisedead C-locked (tierLock:3) — already true after the relabel.

## Phase 2 — capacity + staff levels

- `staffLevel` variable, starts 1. One weapon key 'staff'; crafting an upgrade bumps the level
  (bag item renames "Staff of Essence Lv N"). E-cycle unchanged.
- capacity() = 25 + [0,30,50,75,105][staffLevel] while staff EQUIPPED; sword/hand = 25 (E max, §17).
- Containment limit = [300,600,1200,Infinity,Infinity][staffLevel] equipped; body 300 (§19.1).
  Unequip/drop: pts=min(pts,newCap), tier KEPT, excess disperses, remaining timer=min(remaining,300),
  chain broken (cannot climb further; must restart) (§18). Re-equip restores capacity only.
- Workbench recipes (baseline costs): STAFF LV2 = 14 wood + 6 stone · LV3 = 24 wood + 14 stone ·
  LV4 = 40 wood + 24 stone. Each requires holding the previous level staff.
- Timer expiry: magic disperses with a banner ("The contained magic has dispersed."); warn at 30s
  ("Magic containment weakening.").

## Phase 3 — fusion, Ice, Tainted

- `magicSeq` records the element of each completed stage. Same element continues the base line.
  A DIFFERENT element word at tier ≥ D attempts a fusion stage (at E it still just switches, existing
  yield behavior). Resolver (§54): [water,water,wind]→ICE C · [water,water,fire]→TAINTED C ·
  [water,water,fire,fire]→EXPLOSION B · anything else unrecognised → TAINTED at that tier.
- ICE C: element 'ice', colour #bfe8ff, spell FREEZE (word "freeze", C, cost 18): full freeze 3s on
  normal foes (AI+movement halted, blue tint), 60% slow 5s on the wizard/large. Range 20.
- TAINTED: no castable spells ("The magic has no recognised form."), glitching dark bar, label
  ⚠ TAINTED, shows "next: FIRE" only for the known Explosion prefix. Dismiss or complete.
- Attunement word list gains: freeze, dismiss.

## Phase 4 — Explosion B

- 4th stage: fire word over TAINTED C (WWF) reserve, stage cost 40 essence, needs capacity 130
  (Staff L4) → element 'explosion', tier index 4 (extend TIER_NAME[4]='B', QMULT[4]=2.67,
  TIER_TOTAL[4]=130). The §62 trap stays real: converting at exactly 40 essence collapses.
- EXPLOSION BALL (30): projectile, +20 direct hit, 90 centre, radius 7, falloff (1−d/r)^0.75 (§44),
  friendly fire INCLUDING the player (hurtPlayer if in radius).
- EXPLOSION TOWER (50): 5 eruptions × 28 centre dmg, 0.35s apart, radius 3, at aimed ground point
  (geyser-style ray march). Freeze→Tower is the designed combo.

## Phase 5 — polish

- Hit-location multipliers on player melee/projectiles vs foes: head ×1.5 (hit y in top quarter),
  torso ×1.0, limbs ×0.75 approximation (§47).
- Burn DOT for fireball (2/s×3s, e.burnT).
- All §64 failure strings audited. Codex pages (in-game + website) updated to the new economy.
- Wizard: untouched internally, but his geyser/water-ball damage re-checked against new player HP economy.

## Phase 6 — BUILDING PERFECTION PASS (user priority: "make the building part perfect")

The fort layer must come out of the rewrite BETTER, not merely unbroken. Dedicated pass after
Phase 2 (it depends on the staff/essence economy landing first), re-verified at the end.

Economy ruling for building:
- The BUILD chant word no longer consumes the magic reserve (a 25-point reserve spent on opening
  a menu is absurd under the ammunition economy). "spirits of wind" + "BUILD" opens the builder
  with the reserve INTACT; the B key stays the free path. Placement itself stays material-cost only.
- Mend (E 6) and Restoration (D 10) spend contained grace magic per the new economy — repairing a
  fort mid-fight now costs prepared ammunition, which makes pre-battle Mend chants a real tactic.

Perfection checklist (each item verified in the browser, not assumed):
1. Ghost placement: snap-to-grid always lands where the ghost shows; the snap-tick audio fires per
   cell; red/green validity NEVER lies (afford + support + height cap + plot clash all reflected).
2. Support cascade: removing a load-bearing piece collapses exactly what it bore, cascade order
   correct, no floating pieces survive, no double-refunds, `needSupportCheck` never leaves orphans.
3. Refunds exact: demolish (MMB) and destruction both return the full material cost, popNum shows it.
4. Doors: hinge swing smooth, F toggles at correct range, foes batter shut doors only, a broken
   door is passable and repairable back from `destroyed` via Mend/Restoration.
5. Repair: Mend picks the SINGLE nearest damaged piece in the aimed wedge; Restoration pulses the
   radius; both restore collapsed pieces correctly (props/structs/camBlockers re-registered).
6. Stacking: walls/floors/roofs stack to the height cap, deck-top placement resolves the right
   yOff, nothing spawns under the floorboards (surfaceH paths).
7. Foe siege: skeletons batter pieces/doors/bone walls when blocked, damage numbers per EATK.door,
   pieces burst apart Valheim-style returning materials.
8. Camera: camBlockers register and unregister with build/destroy so the camera never sees through
   or collides wrongly with player-built walls.
9. R cycles pieces while the ghost is out, ESC/right-click cancels cleanly, no stuck ghost after
   death/menu/inventory transitions.
10. Workbench: crafting UI lists the new staff ladder (Lv2/Lv3/Lv4) plus SHORT SWORD, greys
   unaffordable rows live, never drains materials into a full bag.
11. Materials flow: tree fell + rock break + melee chop + slash chop all award wood/stone; the
   regrow timers reclaim trunks and reknit boulders without duplicating props.
12. Performance: placing and demolishing 40+ pieces holds frame rate, no geometry leaks
   (dispose on every removal path).

## Do not break (verify after every phase)

Attunement trial + VOX aliases · water wizard duel · Winded/Collapse (now §10-aligned) ·
mouse-flick melee · building/fort · bare-hand default · bottom-left vitals plaque · all 15
current spells still castable through the new economy · zero console errors.

## Known feel-risk (accepted, LOCKED)

Regen 2/s + stage costs 25/30/35 makes magic a PREPARED resource: chant before the wave, fight on
ammunition, recover between waves. The arena will play slower and more deliberate. Numbers are
data-driven (const tables) so playtest adjustments stay one-line changes.

---

# REVISION v1.1 (2026-07-11, planned on Fable — supersedes conflicting lines above)

## Ruling updates since v1.0 froze

| Topic | v1.1 ruling |
|---|---|
| Essence regen | SUPERSEDED: not 2/s flat. Built and user-approved: +3/s standing, +2/s walking, walking costs nothing. `P.wasMoving` drives it. Keep. Delete `WPN[].regen` fields (vestigial). |
| Ammunition model | User re-confirmed in his own words: "30 fire magic = 4 fireballs, one fireball is 7". This IS Phase 1. Spell costs table in Phase 1 stands (fireball E = 7). |
| OPEN NUMBER (ask user at Phase 1 start) | Spec TIER_STAGE gives E fill = 25 → 25/7 = 3 fireballs at E. The user's example said 30 → 4 casts. Either keep spec 25 (3 casts) or bump E fill to 30 (4 casts). One-line const. Default if unreachable: 30 (match the user's stated example). |
| Full-phrase opening | NEW, user-ordered: bare "fire" must NOT open the rite. Require the phrase: "spirits/spirit of X" (token pattern: `spirit(s)` seen within the same utterance segment before the element word). Typed T-chant and attunement aliases must still work; ATTUNE_WORDS unchanged (aliases map to the element word, the spirits-prefix is checked separately). Implement INSIDE Phase 1 (same handleVoice/tierUp surgery). |
| Lv II staff item | `staff2` exists today (belt slot 4, WPN dmg 1.6). At Phase 2 it BECOMES Staff Level 2 (75 cap): map item→staffLevel, remove the free seeded copy, keep the workbench recipe (18 wood + 12 stone). Until Phase 2 it stays as-is. |
| Codex | The in-game codex is now a paged flip-book (CODEX_PAGES data array). Phase-5 codex work = update CODEX_PAGES badges to show per-cast MAGIC costs once Phase 1 lands, and sweep the two website codex HTML files. |

## Work queue (execute in this order)

| # | Work | Contents | Size |
|---|---|---|---|
| 1 | PHASE 1 + full phrase | ✅ DONE 2026-07-11, verified (ammunition pts, per-spell costs, E fill 30, full-phrase opening, DISMISS, no-topping-up, §10 revert, stage costs 25/30/35, QMULT 1/1.67/2.17 renormalized at unlock, §55 bases, D-lock shifts, §46 melee/sprint/guard, cyclone 4s, all HUD/codex/spellbook numbers) | LARGE, riskiest |
| 2 | PHASE 2 | ✅ DONE 2026-07-11, verified (staff ladder I-IV, caps 55/75/100/130, hand 30, L1 caps at D, L3 first C vessel + no decay, §18 downgrade clamp, containment 300/600/∞ + warn/expiry, workbench ladder w/ prerequisites, free Lv II removed, ⏳ HUD clock) | MEDIUM |
| 3 | PHASE 6 | BUILDING PERFECTION PASS, 12-point checklist above, user priority — runs after Phase 2 (needs staff/essence economy stable), re-verified at the very end too | LARGE |
| 4 | PHASE 3 | ✅ DONE 2026-07-11, verified (magicSeq ledger, W·W·WIND→ICE C w/ FREEZE 18: 3s freeze + blue eyes on skeletons, 60% slow on bosses, 20m; wrong mixes→⚠ TAINTED no-form w/ §64 refusal + WWF explosion hint; fusion needs 90 capacity; snowflake/warning sigils; codex FUSION row; 'freeze' in attunement) | MEDIUM |
| 5 | PHASE 4 | Explosion B (ball + tower), TIER arrays extend to index 4 | MEDIUM |
| 6 | PHASE 5 | Polish: hit-location mults, burn DOT, cyclone 4s, spec damages, codex badges + website sweep, §64 strings audit, wizard rebalance check | MEDIUM |
| 7 | UI pass | Hint-bar redesign (rotating short tips or a codex KEYS page), C key opens the flip-book (spellbook pin moves to Shift+C or stays on double-C), MAG label reads "pts / cap" | SMALL |

## Verification protocol (hard-won, follow every phase)

1. `node --check` on the extracted <script> after every edit batch.
2. Browser verify via `_bf` — but the preview tab backgrounds: `document.hidden=true` freezes rAF.
   Take a `computer screenshot` to foreground and run the loop in bursts; accumulate into window
   globals and read back. Synchronous paths (voiceAct, castSpell) work without the loop.
3. castLock=0.3 only decays in the loop: RELOAD before each cast test, make the tested cast the
   FIRST cast, or a false "did not fire" appears.
4. riteHold: a refused element switch swallows the next form word BY DESIGN — not a bug.
5. Colors: verify via `material.color.getHex()`, never raw .r/.g (linear space).
6. Full do-not-break list from v1.0 plus: wizard chant/telegraph cycle, Lv II staff equip,
   paged codex nav, themed scrollbars, attunement trial, +3/+2 regen, mouse-flick melee.
7. Zero console errors after every phase, screenshot proof for visual changes.

## Model assignment (planned on Fable 2026-07-11)

| Work | Model | Why |
|---|---|---|
| Phase 1 + full phrase | Fable (this session) or Opus | Deepest surgery: tierUp/castSpell/handleVoice touch everything; refusal-path and voice-pipeline regressions are subtle. Highest judgment need. |
| Phase 2 | Opus | Well-specified, moderate coupling (inventory/equip/craft). |
| Phase 6 building pass | Fable or Opus | User priority, 12 checklist items each needing real browser verification and judgment about "better, not just unbroken". |
| Phases 3-4 | Opus | New self-contained systems, clear spec. |
| Phase 5 + docs sweep | Sonnet | Mechanical: const tables, strings, codex data, two HTML docs. Cheap and safe. |
| UI pass | Sonnet | Contained CSS/DOM work with clear acceptance criteria. |
