# THE FREEDOM MASTER BUILD PROMPT — FREEDOM 2.0 (FINAL)

**Read this whole document before touching code.** You are upgrading an existing, working game: `Games/methodas space game/Brand Defense Grid.html` (~7,300 lines, single-file vanilla JS canvas, no build tools, must stay single-file and dependency-free). You are NOT rewriting it. Every system below names the existing structure it extends — `LEVELS` (line ~3978), `SKILL_DEFS`/`SKILLS` (~4010), `MSHIP` (~3984), `MSHIP_DEFS`/`mshipCost` (~3992), `FRAMES` (~3960), `WPN_TIERS` (~4025), `MODULES`/`EQUIP` (~4027), `wanted` (~4248), `eFac()`/`FACTIONS` (~4249), `defendNode` (~3957), `spawnDirector()` (~5001), `levelDone()`/`doWarp()`/`arriveBase()` (~5462–5481), `startLevel()` (~5444), `sfx()` (~4506), save loader (~4062–4076). Verification tooling is built in Phase P-1 below — there is **no screenshot POST endpoint and you must not assume one**; you get `window.__dbg()` plus a `__shot()` PNG-download helper (specced in P-1). No Node/Python on this machine — serve with `static-server.ps1` if needed.

## Vision

You are a broke pilot with one small ship and a mothership full of people counting on you. Twenty waves stand between you and freedom. Between each fight, the sector talks to you — traders beg, swindlers grin, the Imperial Navy watches your record — and every choice you make changes who shows up shooting next wave and whether they're shooting at you or beside you. You get stronger the way real people do: better gear, sharper skills, loyal crew, and a reputation you either polish or burn. By wave 20 you should feel like a legend you built one decision at a time — and when it's over you should immediately want to run it again, differently.

## The Core Loop

```
FIGHT WAVE ──► WAVE CLEARED (payout burst, killcam beat)
    ▲               │
    │               ▼
NEXT WAVE ◄── SPEND (dock: ship, weapons, crew, gear, Haven)
    ▲               ▲
    │               │
WAVE PREVIEW ◄── STORY CARD (choice with teeth: rep, credits, wave modifier)
```

Why this hooks (name these forces and protect them in every implementation decision):

- **Variable reward**: module drops (3%/45%/boss-guaranteed), story-card outcomes, boarding loot, trader windfalls. Never make rewards fully predictable — and never make a "gamble" card a sure thing (see the `swindler_1` and `black_box` specs, which were fixed for exactly this).
- **Near-miss tension**: the Haven bar creeping toward red, a repair channel finished at 4% hull, an extraction timer beaten by half a second. Tune numbers so close calls are common and total blowouts are rare.
- **Build expression**: frame + refit layout + slots + modules + skills + crew + gear = "my build." Two players at wave 12 should look nothing alike.
- **One-more-wave cadence**: the loop iteration is 90–150 seconds of combat + 30–60 seconds of decisions. Never let dock time exceed the player's patience — story card first, shopping optional, big NEXT WAVE button always one click away. Boarding is charge-limited (§e) precisely so it cannot stretch every late wave.

## Design Pillars

1. **The ship is your body** — movement, dash, boost, weapons, and even your Gunner's turret all breathe from one energy pool; mastering that rhythm is the skill ceiling.
2. **Every wave is a story** — no anonymous spawns; someone is attacking for a reason and the game says so in one line.
3. **Choices have blast radius** — story cards and faction standing visibly change the next fight, prices, and who fights beside you.
4. **Both saint and outlaw are power fantasies** — Imperial protection and black-market power must be equally tempting. Hard target: Outlaw net income and net difficulty within ±10% of loyalist; the *variance profile* is the difference.
5. **Juice is not polish, it's the product** — every hit, kill, and payout must be felt in the hands; when in doubt, add feedback, not HP.
6. **Nothing is rebuilt that already works** — extend existing structures; the 7,300 lines you inherit are an asset.

---

# SYSTEMS SPECIFICATIONS

## a. The 20-Wave Campaign

Extend `LEVELS` from 15 to 20 entries. Each entry gains: `theme` (string id), `story` (one-liner for the wave-intro banner), `mod` (optional special-mechanic hook), **`pool`** (weighted array of `ROSTER` keys — `[{key:'rusher',w:5},{key:'clanRaider',w:3}]`), **`cap`** (max simultaneous hostiles), **`spawnRateMul`**, and `target` (wave length in seconds — waves 16–19 get `112/116/120/124`). `spawnDirector()` (line ~5001) must be rewritten to read `LEVELS[level-1].pool/cap/spawnRateMul` instead of its hardcoded `level<3/<5/<8/<11` pools, and its population-cap check (line ~5003) must count **all hostile-faction enemies**, not only `eFac==='scoundrel'` — otherwise alien/clan/imperial waves bypass the cap and flood the field.

**Bosses:** Overbill Prime and The Undercutter **stay at waves 5 and 10 (unchanged)**; **Your Shadow moves 15 → 20**; **new boss THE BROODMOTHER fills wave 15**. Boss ids are load-bearing: `startLevel()` (~5444) special-cases `if(L.boss===3){openFinalUp();}` and `bossIntro(L.boss)`, dialogue tables, and `isFinal = level>=LEVELS.length` all key off numbering. Spec: **boss:1 = Overbill (w5), boss:2 = Undercutter (w10), boss:4 = Broodmother (w15), boss:3 = Shadow (w20)** — the Shadow keeps id 3 so `openFinalUp()` and `endGame(true)` fire correctly once the Shadow entry moves to wave 20. Edit sites: `startLevel()` ~5444, `bossIntro`, and the L15-finale comment block at ~4919.

**WPN_TIERS stay boss-keyed:** T1 unlocks on the wave-5 kill, T2 at wave-10, T3 at wave-15. The wave-20 Shadow kill grants a **prestige unlock**: a "Shadow Core" token that unlocks one T4 signature weapon variant on your *next* run — the new-run carrot. Reconcile the codex Weapons page and shop gating with this schedule.

**Difficulty scale:** keep waves 1–15 hp/damage curves; waves 16–19 scale enemy hp ×(1 + 0.12·(w−15)) with caps 28/28/30/30 and spawnRateMul 1.15/1.20/1.28/1.35.

| W | Faction / Theme | Mini-story one-liner | Special mechanic |
|---|---|---|---|
| 1 | Scoundrels — "Toll Collectors" | Local pirates demand a docking tax from the Haven. | Tutorial pacing; rushers only. Cap 10. |
| 2 | Scoundrels — "Smash & Grab" | Looters target the trader lanes, not you. | Traders take enemy aggro; protect them for +fees. |
| 3 | Freelancers — "Claim Jumpers" | Rival pilots contest your defense contract. | Rivals steal bounty chips off the field. |
| 4 | Scoundrels — "The Softening" | Overbill's advance collectors probe the grid. | Kamikazes prioritize the Haven. |
| 5 | **BOSS 1: OVERBILL PRIME** | The battle station arrives to repossess the Haven. | Turret-ring boss (existing). Boss bonus 250 CR. T1 weapons unlock. |
| 6 | Civilians+Scoundrels — "Refugee Convoy" | A refugee convoy limps in with pirates on its tail. | Escort: each surviving civilian = +40 CR, +3 Civ rep. |
| 7 | Alien — "First Contact" | Unknown chitin-hulled craft ignore all hails. | New `alien` faction; erratic drift, ignores wanted/rep. |
| 8 | Rival Clan — "The Red Ledger" | The Crimson Ledger clan raids to poach your traders. | Clan ships focus traders; killing their captain routs the wave. |
| 9 | Scoundrels — "Minelayers" | Sappers seed the grid with proximity mines. | Minelayers drop mines: **40u trigger radius, 1 hp, 48 dmg, red blink at 1.5 Hz**, shootable. |
| 10 | **BOSS 2: THE UNDERCUTTER** | The saw-blade station comes to finish what Overbill started. | Existing boss, +15% hp. Boarding + Combat skill unlock after kill. Boss bonus 450 CR. T2 unlock. |
| 11 | "The Audit" *(branches on rep, §c)* | Your record catches up with you. | **Trusted+**: Imperial patrol assists vs pirates. **Watched/Marked**: pirates attack while an Imperial observer frigate scores you — kills within 500u of the observer grant +Imp (cap +8 this wave); shooting the observer = instant Marked (or Outlaw if already Marked). **Outlaw**: Imperials ATTACK alongside pirates. |
| 12 | Alien — "Spore Tide" | Bio-ships that split when killed drift in on the solar wind. | Splitters (1→2 halves at 50% size/hp). |
| 13 | Freelancers — "The Headhunters" | A mercenary lance is paid to kill you, specifically. | All enemies target player over Haven; elite `duelist` spawns (boardable). |
| 14 | Rival Clan — "Siegeworks" | The Ledger tows in shield-projector barges. | Barges shield nearby enemies; kill barges first. |
| 15 | **BOSS 4: THE BROODMOTHER** *(NEW)* | The alien hive-carrier arrives to seed the Haven itself. | Spec below. Boss bonus 700 CR. T3 unlock. |
| 16 | Scoundrels united — "The Warlord's Due" | Every pirate crew in the sector flies under one warlord. | Elite-heavy; warlord elite boardable. |
| 17 | Alien remnant — "Broodguard" | Orphaned brood drones rage without their mother. | Enrage: +30% speed below 50% hp. |
| 18 | "The Reckoning" *(branches)* | See §c. | **Loyalist (Trusted+)**: navy drills beside you vs a pirate feint — assist guaranteed. **Watched/Marked**: the pirate feint comes with NO navy either way; banner: "The Navy didn't come. Nobody remembers the unremarkable." **Outlaw**: Imperial capital-ship midboss. |
| 19 | Everyone — "The Gathering Storm" | Every enemy you spared or wronged returns at once. | **Fixed wave-19 threat budget regardless of history.** `RUN_LOG` determines COMPOSITION and dialogue, never size: spared enemies return as named elites with barks ("You should have finished it, pilot."); a clean history backfills with scoundrel remnants plus a unique "Sector Syndicate" elite — mercy changes the story, not the difficulty. |
| 20 | **BOSS 3: YOUR SHADOW** | It flies your hull, your weapons, your modules — and it brought a shadow of your crew. | Mirror boss upgraded: copies your **peak-run snapshot** (see below). Boss bonus 1000 CR. Boardable at 15% hull for the true ending. Kill grants the Shadow Core prestige token. |

**Anti-cheese rule for the Shadow:** it copies the *best* `EQUIP`+crew configuration seen at any wave start this run (snapshot by total CR value), not the wave-20 dock state — stripping your modules before the finale hands the Shadow your peak self anyway. It also has a stat floor equal to the wave-15 boss budget. Flavor line in the intro: *"It remembers you at your strongest."*

**New enemy ROSTER entries** (copy the existing schema at ~4225 — `{hp, sp(shield), rad, dmg, spd, turn, cr, xpv, fac, behavior}`):

| Key | hp | sp | rad | dmg | cr | xpv | fac | Behavior |
|---|---|---|---|---|---|---|---|---|
| `alienDrifter` | 34 | 0 (regen 2/s) | 12 | 10 | 14 | 1 | alien | Erratic sine drift toward nearest target |
| `alienSplitter` | 50→2×25 | 0 (regen 2/s) | 14→9 | 12 | 18 | 1 | alien | Slow drift; splits on death |
| `broodDrone` | 22 | 0 | 9 | 8 | 8 | 1 | alien | Rusher stats ×0.8, swarms |
| `clanRaider` | 45 | 15 | 12 | 12 | 16 | 1 | clan | Focuses traders, strafes |
| `clanCaptain` | 260 | 90 | 18 | 18 | 90 | 4 | clan | Elite; killing routs wave 8 |
| `minelayer` | 60 | 0 | 14 | — | 22 | 1 | scoundrel | Flees player, drops mines every 4s |
| `shieldBarge` | 180 | 60 | 20 | — | 60 | 4 | clan | Slow; projects 40% dmg-reduction bubble, 220u |
| `warlordElite` | 320 | 100 | 18 | 20 | 110 | 4 | scoundrel | Boardable elite, wave 16 |
| `duelist` | 300 | 120 | 16 | 16 | 100 | 4 | freelancer | Boardable; targets player only |
| `impPatrol` | 120 | 60 | 14 | 10 | 20 | 1 | imperial | Assist or hostile per rep |
| `impCutter` | 280 | 140 | 17 | 16 | 80 | 4 | imperial | Elite assist at Deputized / hostile at Outlaw |
| `impCapital` | 900 | 400 | 30 | 24 | 300 | 8 | imperial | Wave-18 Outlaw midboss; turret arcs |
| `escortFrigate` | 400 | 0 | 20 | — | — | — | civilian | Friendly escort (`medicine_run`, wave 6) |

**THE BROODMOTHER (boss:4, wave 15).** Segmented hive-carrier: 3 body segments, each 900 hp hull + 400 shield, destroy in any order; core exposed after all three. Behaviors: (1) slow ellipse around the Haven at ~700u; (2) every 9s births 3 `broodDrone`; (3) "lash" — telegraphed 1.2s, sweeping tendril beam, 35 dmg, blockable by reflector; (4) at core exposure she overcharges — 20s to kill the core (1,200 hp) or segments regenerate to 50%. At 15% hull she goes **disabled** and boardable (organic interior tileset). Visual: bone-white segmented hull, `#E0447C` bioluminescent seams, pulsing egg-sac glow.

**Per-wave kill/XP budget** (needed by spawn logic AND the skill curve, §b): waves 1–4: 12–16 trash kills; wave 5: boss + 8 adds; 6–9: 16–22 trash, 0–1 elites; wave 10: boss + 10 adds; 11–14: 20–26 trash, 1–2 elites; wave 15: boss + brood swarms (~18 drones); 16–19: 24–30 trash, 2–3 elites; wave 20: boss + shadow-crew adds. `xpv`: trash 1, elites 4, bosses 12 (the field already exists at line ~5255 — use it).

## b. Pilot Skills — Rank 10, Breakpoints, Engineering & Combat

Change `SKILL_MAX` from 5 to 10. Add `engineering` and `combat` to `SKILLS`/`SKILL_DEFS`. This is a **deliberate re-tune of live skills** — enumerate and edit these sites: `SKILL_DEFS` text (~4011), `barterPrice()` (~4040: new formula, discount cap 0.25 — see §h), every income-multiplier call site of the old Entrepreneur +12%, and the codex Upgrades page. Old per-rank values are halved-ish for 10 ranks: Accuracy 8%→3%, Speed 8%→4%, and Charisma's identity changes entirely (below).

Draft cards (existing level-up draft UI) offer 3 of 6 skills with two protections: **your highest-ranked skill is always among the 3 offered**, and **Combat is absent from the pool until the wave-10 boarding unlock** (banner: "NEW SKILL AVAILABLE — COMBAT"), at which point rank 1 is granted **free** with the breaching gear so boarding is immediately viable. Breakpoint abilities unlock at ranks 3/6/9 (gold pip in the draft UI) and every skill gets a **rank-10 capstone** so the most expensive pip is never an anticlimax.

| Skill | Per rank | Rank 3 | Rank 6 | Rank 9 | Rank 10 capstone |
|---|---|---|---|---|---|
| **Accuracy** | +3% damage, −2% spread | Crits: 5% ×1.8 | Crit 10%; crit kills refund 6 energy | Executioner: +25% dmg <20% hp | Crits pierce through their target |
| **Speed** | +4% thrust, turn % per calibration below | Dash cost −20% | Second dash charge (2.5s cd) | Boost soft floor at 20 energy | Dash-through kills refund 10 energy |
| **Charisma** | +2% Imperial/Clan assist trigger chance, +4% trader fees & rescue rewards | Reveal one hidden outcome per story card (scan/gamble cards become informed) | Crew hires −20%; crew tier-up 1 wave faster | Talk down one non-boss elite; **recharges every 5 waves** | Hired crew start at tier 2 |
| **Entrepreneur** | +3% wave payout, −2% shop prices (cap rules §h) | Bounty chips +50% | One free module-shop reroll per dock (defined in §h) | Interest: +3% of banked CR per wave clear (cap 90) | Boss bonuses +25% |
| **Engineering** *(NEW)* | R-channel: −0.1s channel time per rank; heal follows the single formula below | Repair also restores 15% of amount to shields | Repair the Haven within its dock ring: ×2 amount, **once per wave, max 20% of Haven max** | Overdrive: post-repair +30% energy regen 6s | Channel uninterruptible; hits during it deal half damage |
| **Combat** *(NEW)* | +5% melee dmg, +3% gun dmg, +4 boarding HP, **+2s disabled-elite exterior window** (flight rider — you cripple, not kill) | Combat roll (on-foot dash, 0.2s i-frames) | Breach bonus: first 3s in a room +40% dmg | Intimidate: guards <30% hp flee to alert | Melee kills on ALERT-state guards are instant |

**Engineering active mechanic (the R3 centerpiece).** Hold **R** in flight: thrust drops to 30%, turn to 50%, radial channel bar sweeps **2.2s − 0.1s/rank** (min 1.2s), costs **35 energy up front** (50% refunded if interrupted). On completion: restore **14 + 7·rank hull** — this formula is the *single source of truth*; there is no separate "repair potency" stat. Any single hit ≥12 dmg interrupts (half energy lost, 4s lockout); the weld-glow makes enemies within 500u 30% likelier to target you. Rank 0 = unavailable. This is the signature FREEDOM moment: killing your engines mid-swarm to weld your hull while tracers close in.

**Speed = maneuverability transfer — DO NOT NERF THE FLOOR.** `FRAMES` thruster/turn profiles stay at 1.0 parity (0% nerf): a fresh rank-0 run must feel *identical or better* than FREEDOM 1.0, or the R1 blind A/B fails at minute one. Speed ranks are additive on top. Grant **Speed rank 1 free at run start** (the pilot's license) so the skill's presence is felt immediately. **Calibration step**: read the actual `FRAMES` turn values in code and set the per-rank turn bonus so a rank-8 Hauler out-turns a rank-0 Gunship — if the Gunship's base turn exceeds the Hauler's by ≤25%, +3%/rank suffices; write the chosen number and the frame values into a comment.

**Skill XP economy.** The existing curve is **geometric** (`nextLvl=Math.round(nextLvl*1.32)`, line ~5255 — *not* linear; also reset sites ~4729 and ~4877). Do not hardcode a replacement blind. Calibration instruction: using the §a kill/xpv budget (~550 XP per full clear), play one full run logging kills/XP per wave via `__dbg()`, then set curve constants so a full clear lands at **18–22 levels ≈ 20 draft picks**. Target fantasy: a 9/6/3 focus build plus 2 floater picks (20 picks — affordable), never everything: that's the replay driver. Boarding kills grant XP pickups banked on extraction (lost on failure).

## c. Faction Reputation — Trust/Track System

`var REP = {imperial:0, civilian:0, clan:0};` — scale −100..+100. Aliens have no rep. **Scoundrels and the Crimson Ledger share the clan track: the clan track represents the whole underworld, and scoundrels are Ledger-affiliated** (one track, coherent Pact keying). `wanted` stays exactly what it is: short-term heat decaying in seconds; REP is the record.

**REP is PER-RUN** — it starts at 0 (Watched) every run, matching per-run skills and the wave-19 `RUN_LOG` design — with one continuity hook: **±10 starting rep carried from last run's ending band** (persisted as `bdg_repcarry`, see SAVE MIGRATION). Show REP as three icon+bars on the dock screen and pause menu; floater on every change (`+3 IMPERIAL REP`, faction color).

**Thresholds (Imperial track = master alignment):**

| Range | Title | Effects |
|---|---|---|
| +60..+100 | **Deputized** | Assist every eligible wave; 10% Imperial shop discount (cap rules §h); wave-18 loyalist branch |
| +25..+59 | **Trusted** | Assist eligible; patrols defend traders |
| −24..+24 | **Watched** | Neutral default; wave 11/18 middle branches (§a) |
| −59..−25 | **Marked** | No assists; patrols attack while `wanted>0`; shop +10% |
| −100..−60 | **OUTLAW** | Imperials permanent hostiles waves 11+; legal tier-3 locked; **Black Market unlocks** |

**Rep deltas — choices drive alignment, kills barely do.** Passive kill-rep is **capped at ±2 per faction per wave** (kill scoundrel +1 Imp/−1 Clan, kill clan ship +1 Imp/−2 Clan, all under the cap). Uncapped, deliberate movers: rescue mayday +4 Civ +2 Imp; trader survives +1 Civ; **kill civilian −12 Civ −8 Imp; kill imperial −15 Imp** (always full); escort wave 6 +6 Civ; story cards ±3..±15; pay bounty at dock (200 CR per −10 Imp restored, only up to Marked — Outlaw is a commitment). **Reachability arithmetic (verify in P1):** Trusted (+25) by wave 11 on a good run = passive cap +2×10 waves (+20) + escort (+6) + two good card choices (~+10) ≈ +36 ✓. Outlaw-curious players can be Marked by wave 8 via the early −Imp cards (`deserter`, `hot_cargo`, `salvage_claim` in §d) plus one protected kill — no civilian suicide-grinding required.

**Imperial assist.** Wave-start check (waves 6+, non-boss, rep ≥ Trusted): chance = `25% + rep/2 % + 2%·Charisma rank`. On trigger: 2 `impPatrol` + (Deputized) 1 `impCutter` warp in 3s after wave start — blue-white flash, banner "IMPERIAL NAVY ON STATION." Assist budget: combined dps ≈ 25% of wave threat; **assist ships deal half damage and taunt** (that is the whole implementation — no suppression-conversion mechanic). Free warp-ins on boss waves 10/15 at Deputized. Patrol kills drop pickups at half credit value.

**The Outlaw path — mirrored, not punished.** You LOSE: assists, legal tier-3, trader volume (−30% traders). You GAIN, at matched expected value (±10% of loyalist income/difficulty — state and test this): **Black Market** dock tab — module reroller (150 CR/roll); contraband modules 25% off, each genuinely stronger than legal T3 with a real drawback: *Dirty Railgun* (+30% dmg, 5% jam 1.5s), *Overclocked Coils* (+25% fire rate, passive 1 energy/s drain), *Vampire Plating* (kills restore 2 hull, shield cap −25%), *Redline Injector* (dash leaves a 20-dmg wake, dash cd +0.5s), *Ghost Baffles* (enemies acquire you 30% slower, hull −15%). **Scoundrel's Pact** uses the *identical per-wave trigger formula* keyed to Clan rep (25% + clanRep/2% + 2%·Charisma) — pirate wings assist every eligible wave, same budget, not once per run; scoundrel waves −20% at Clan Trusted. **Smuggling income**: contraband crates spawn on scoundrel-theme waves for Outlaws only, ~2/wave, 80–120 CR each — replaces lost trader volume. Bounty chips (base value **12 CR**) pay ×1.5.

`RUN_LOG` (per-run array: `scammed_swindler`, `spared_captain`, `sold_mutineer`…) feeds wave 19 composition and card chains.

## d. Story Cards

**Presentation & code hooks (this is the one brand-new UI — spec it fully).** The card is a **full-screen DOM overlay** reusing the dialogue panel's CSS: a 96×96 inline `<canvas>` bust per card drawn by one `drawBust(ctx, id)` function (3–4 palette-swapped archetypes), typewriter setup text, 2–3 buttons styled like existing `.dk` buttons; gated choices render *disabled* with the requirement text visible (an upgrade advertisement); gates for skills that don't exist yet in the build order are *hidden*, not grayed. **Presented from `levelDone()` itself while `mode==='cleared'`, before return-flight control is handed back.** Critical: after a non-boss clear the player either flies to dock (`arriveBase()`, ~5478) or presses B (`doWarp()`, ~5481) which skips the dock — gate BOTH behind a `cardResolved` flag or the card silently never fires on the fast path players actually use. All outcomes resolve through a single `applyOutcome(choice)` (multiplayer appendix rule 5).

**Card anatomy:** `{id, title, bust, setup(≤45 words), safePreBoss(bool), choices:[{label, req?, outcome, waveMod?, priceMod?, rep?, cr?, log?}]}`. `waveMod` attaches to the next `LEVELS` entry at spawn time (`{extra:'rusher×3'}`, `{assist:'patrol×2'}`, `{enemyHp:1.15}`, `{payout:1.3}`); **`priceMod`** multiplies shop prices for N dock visits (R8 names prices explicitly — at least one shipped card must use it: `supply_blockade`).

**Pacing rules (the math now closes):** one card after every non-boss wave from wave 2 on = **15 draws per run** (waves 2,3,4,6,7,8,9,11,12,13,14,16,17,18,19). The shipped deck is **20 cards** (18 freely drawable + 2 chain-gated), so no-repeats is satisfiable with 3 spares; **~75% of the deck is seen per run** (variety across runs comes from order, chains, and gates). Safety rule anyway: if the eligible pool is ever empty, skip silently — never crash, never repeat. NO card after boss waves. Chain cards take priority over random draws. **Pre-boss rule:** draws after waves 4, 9, 14, 19 must come from the `safePreBoss:true` subset — no card whose waveMod adds enemies or removes player capability may precede a boss (as originally written, `duelist_challenge` drawn after wave 14 disabled your crew against the Broodmother — a trap, not a choice).

**The deck (ship these 20 exactly, then expand):**

| id | Title / Setup | Choices → Outcomes |
|---|---|---|
| `widow_toll` | **The Widow's Toll.** A miner's widow asks 120 CR to bury her husband beyond the grid. *(safePreBoss)* | **Pay 120** → +6 Civ, next wave 2 miners fight for you. **Refuse** → −3 Civ. **[Charisma 3] Comfort her** → +8 Civ, free module-reroll token. |
| `swindler_1` | **A Sure Thing.** Rex Volan, grinning: invest 200 CR, triple it after next wave. | **Invest 200** → **40%: Rex simply vanishes with your money** (log `rex_gone`, no chain, +2 Civ sympathy); 60%: log `paid_rex` → `swindler_2`. **Refuse** → log `refused_rex`. **[Entrepreneur 3] Counter-offer** → invest 150, same odds. |
| `swindler_2` | **Where's Rex?** *(chain: 2 waves after `paid_rex`)* His beacon pings from the next wave. | Next wave includes Rex's gunship elite. **Kill him** → 450 CR + guaranteed module. **[Charisma 6] Let him surrender** → 300 CR, +10 Civ, log `rex_alive` → `swindler_3`. |
| `swindler_3` | **Rex Pays Up.** *(chain: wave 16+ if `rex_alive`)* | **Take the money** → 500 CR. **Take him instead** → free Quartermaster crew (§f fallback rules apply pre-P3). |
| `protection` | **The Ledger's Offer.** Envoy: 250 CR and the clan skips its next raid. | **Pay** → −8 Imp, +10 Clan, next clan wave −40%. **Refuse loudly** → +5 Imp, +2 elites, payout ×1.25. **[Combat 3] Threaten the envoy** → free skip, +6 Clan, log it. |
| `stowaway` | **Stowaway.** A kid hid in a crate. Feeding him: 40 CR/wave until wave 15. *(safePreBoss)* | **Keep him** → −40/wave; at 15 he reveals engineering talent: free Engineer crew. **Hand to Imperials** → +5 Imp, 60 CR, −6 Civ. |
| `distress_fake` | **Too Convenient.** A mayday from a ship type that doesn't lose power. | **Rescue** → 50% real (+250 CR, +6 Civ) / 50% ambush: **3 darters spawn at screen edge, pre-marked to hunt you, 1s warning ping** (never on top of you). **Ignore** → −2 Civ. **[Accuracy 3] Scan first** → informed choice. |
| `imperial_levy` | **War Levy.** An Imperial purser requisitions **`10·w` CR flat** (wave 12 = 120) for the alien front. *(safePreBoss)* | **Pay** → +10 Imp. **Refuse** → −10 Imp, `wanted` starts at 8 next wave. **[Entrepreneur 6] Creative accounting** → pay half, +10 Imp anyway. |
| `black_box` | **The Black Box.** A sealed alien module, unscannable. 300 CR. | **Buy** → 60% rare / 30% common / **10% tracker: +2 alien enemies next wave and only a COMMON module** — the bad roll must sting. **Pass** → nothing. |
| `mutineer` | **The Mutineer.** A defector offers his clan's raid plans for asylum. | **Asylum** → next clan wave on minimap pre-spawn, −25% count, −10 Clan. **Sell him back** → 350 CR, +8 Clan, −10 Civ, log `sold_mutineer`. |
| `medicine_run` | **Medicine Run.** Escort a medical frigate through the next wave. | **Accept** → `escortFrigate` spawns; survives ⇒ +400 CR +10 Civ; dies ⇒ −8 Civ. **Decline** → −2 Civ. |
| `duelist_challenge` | **A Fair Fight.** No crew turrets, no Haven aid, next wave, just you. *(NOT safePreBoss)* | **Accept** → crew/turrets disabled next wave; clear ⇒ 600 CR + rare module + `duel_won`. **Decline** → he mocks you. |
| `haven_rats` | **Rats in the Hold.** Chewed power lines: 100 CR, or crawl in yourself. *(safePreBoss)* | **Pay 100** → fixed. **Send Engineer crew** → free, Engineer injured 1 wave. **[Engineering 3] Yourself** → free, **one free Engineering rank pip**, −10 hull next wave start. |
| `supply_blockade` | **Supply Blockade.** Ledger enforcers choke the trade lanes; the quartermaster is sweating. *(safePreBoss)* | **Pay 150 to break it** → +4 Civ. **Ignore** → `priceMod:{mul:1.2, docks:2}` — shop +20% for 2 dock visits. **[Combat 3] Run it yourself** → free, next wave +2 raiders hunt you, +6 Clan. |
| `deserter` | **The Deserter.** A young Imperial deserter begs to hide in the Haven's hold. *(safePreBoss; early-outlaw lever)* | **Hide him** → +6 Civ, **−8 Imp**, log `hid_deserter`. **Turn him in** → +8 Imp, −6 Civ, 80 CR. **[Charisma 3] Forge papers** → +6 Civ, no Imp loss. |
| `hot_cargo` | **Hot Cargo.** A fence offers 200 CR to stash stolen goods for one wave. *(early-outlaw lever)* | **Take it** → +200 CR, **−6 Imp**, +6 Clan. **Refuse** → +3 Imp. |
| `salvage_claim` | **Salvage Rights.** An Imperial buoy claims a rich wreck field. *(safePreBoss)* | **Loot anyway** → +220 CR, **−7 Imp**. **Respect it** → +4 Imp. **[Engineering 3] Strip it fast** → +300 CR, −7 Imp. |
| `gamblers_wager` | **The Wager.** A dock bookie bets you can't clear the next wave without dropping below 50% hull. *(safePreBoss)* | **Take it (stake 150)** → clear above 50% ⇒ +350; fail ⇒ lose stake. **Decline** → nothing. |
| `pilgrim_fleet` | **Pilgrim Fleet.** Unarmed pilgrims cross the grid next wave. *(safePreBoss)* | **Escort** → 3 pilgrim ships spawn; +30 CR +2 Civ per survivor. **Ignore** → −2 Civ per death. |
| `old_debt` | **An Old Debt.** A flight-school friend needs 100 CR, swears he's good for it. *(safePreBoss)* | **Pay** → at wave 15+: 50% repaid 300 CR / 50% he appears in your hire pool free. **Refuse** → −2 Civ. |

**Build-order fallbacks (P2 ships before P3/P4):** any card outcome granting crew before P3 exists pays **300 CR + banner "…will join your crew once quarters are built"** and auto-converts when P3 lands; skill gates for not-yet-built skills are hidden. Evil choices (`sold_mutineer`, selling the stowaway, the Ledger's protection, the three −Imp cards) push toward Outlaw — their payoffs are real, not punitive.

## e. Boarding

**Unlock & charges.** Unlocks after the wave-10 boss kill (banner: "BREACHING GEAR ACQUIRED"; Combat rank 1 granted free). Breaching gear holds **1 charge per wave, recharging at dock** — boarding is a pick-your-target decision, not a farm, protecting the 90–150s wave cadence. Expect **~4–6 boardable opportunities per run** (duelist w13, warlord w16, bosses 10/15/20, occasional elite) — this bounds boarding income for §h.

**Trigger & the split timer (this math must work).** Boardables reduced below **15% hull** without dying (over-damage caps at the threshold) go **disabled**: engines dark, drifting, and a **25-second EXTERIOR window** begins (ring UI on the hulk) — reach it and dock or the scuttle charges fire. Combat skill adds +2s/rank to this window. Fly within 40u and **hold E for 1.0s** to breach (E is already the interior interact key — one interact verb everywhere; see the F-key note below). **On breach the exterior countdown ends and a fresh INTERIOR scuttle timer starts: 60s for elites, 120s for bosses**, +10s awarded per room fully cleared, and Engineering ≥3 can interact once with a scuttle-charge panel for +15s. Show it big and red at screen top. Tuning target: a clean run extracts with 10–20s left; a greedy full-loot run with 2–5s — that near-miss is the story players tell.

**Naming & input collisions (exact edits):** the new mode is **`mode==='boarding'`** — `'board'` is already a VIEW name (the leaderboard, keydown handler ~7296). The global keydown at ~7294 runs `if(e.key==='f'||e.key==='F'){toggleFullscreen();return;}` in ALL views — **gate fullscreen to `view!=='play'`** so nothing collides in combat.

**The freeze (enumerate it — freezing only `enemies` is not enough).** While `mode==='boarding'`, the entire play-simulation block in the main loop (~7158–7195) short-circuits: **`timeLeft`, `spawnT`, `traderT`, `rescueT`, `comboT`, energy regen, enemy/bullet updates, Haven repair/turrets, music intensity** — all frozen; the interior timer is the ONLY live clock (otherwise `levelDone()` fires mid-boarding). Render: cut to a full interior screen (recommended — cheaper than dimming the frozen battlefield). `/* MP: boarding-pauses-space breaks in co-op */`.

**Scene spec (reuse the canvas, same top-down camera).** Interior = 3–5 rooms for elites, 6–8 for bosses, hand-authored templates (rect rooms + corridors, 32px tile grid; walls block movement and bullets). On-foot pilot: 8px circle, WASD (240 u/s + Speed at half rate), mouse aim, LMB gun, RMB/E melee (90° arc, 24u), Space = combat roll (Combat 3+). **On-foot HP = `60 + 4·Combat rank`; armor grants damage reduction ONLY, never HP.** No shields on foot.

**Guard AI — three states, dumb and readable:** `PATROL` (waypoint loop) → `ALERT` (gunfire heard in room/adjacent: investigate, 1.5s reaction — the stealth-lite melee window) → `HUNT` (line of sight: strafe+fire; melee guards charge). Types: **Deckhand** (20 hp melee), **Gunner** (25 hp ranged, 8 dmg), **Bosun** (60 hp shotgun, drops gear). 2–3 per room, no respawns, and **guard count/tier scales with wave number** (wave 16 warlord interiors field Bosun pairs) so Marine Plate builds stay threatened.

**Loot & extraction.** 0–2 crates/room (E, 0.8s): credits 40–120, modules 15%, gear, intel. **Loot value scales with rooms cleared, so partial extraction is legitimate.** Final room = core loot: guaranteed module (**bosses' guaranteed module drop MOVES here from the field-drop so it can't double-pay**) + 150–400 CR + boss uniques (Broodmother: "Bioreactor," +20% energy regen; Shadow: the true ending). Reaching your breach point banks everything and triggers the scuttle — **credited as a player kill: bounty + XP pay, boss waves complete, boss bonus pays.** Failure (HP 0 or timer): emergency eject — keep nothing, return at 30% hull, battle resumes, **the ship stays disabled with 5s left on its exterior timer** (a desperate re-board is legal). Death is never a run-ender here.

**The Shadow's true ending (wave 20, boardable at 15% hull — spec it like the Broodmother got specced):** 3-room mirrored-steel interior (your own hull's palette, inverted); one **shadow Bosun per crew member you hired this run**, each barking a corrupted version of that crew's lines; final room = the shadow pilot, no weapon drawn, typewriter dialogue: *"You built all of this to get free. I'm what you'd be if you'd stayed."* One choice: **[Destroy it]** → fight (Bosun stats ×1.5) → victory banner "FREEDOM — EARNED"; **[Merge]** → it dissolves into you → banner "FREEDOM — UNDERSTOOD," +1 permanent codex entry. Both end in the existing `endGame(true)` victory flow with distinct banners and a codex unlock.

**Personal gear shop** (dock sub-tab under Weapons: **"ARMORY"** — the *tab*; the Haven facility is renamed GEAR LOCKER, §i, so the two never share a name):

| Slot | T1 (free defaults) | T2 | T3 |
|---|---|---|---|
| Gun | Scrap Pistol — 6 dmg, 3/s | Navy Revolver — 350 CR, 14 dmg, 2/s | Assault SMG — 900 CR, 7 dmg, 8/s / **[Black Market]** Scattergun — 800 CR, 5×6 spread |
| Blade | Work Knife — 12 dmg | Boarding Axe — 250 CR, 25 dmg, knockback | Plasma Cutter — 700 CR, 35 dmg, ignores armor |
| Armor | Flight Suit — 0 DR | Flak Vest — 400 CR, 25% DR | Marine Plate — 1,100 CR, 40% DR, −10% move |

**Skills on foot:** Combat primary; Accuracy adds gun damage; Speed at half rate; Engineering ≥3 opens locked side-rooms instantly (any rank ≥1: 4s channel); Charisma 9 talk-down works on the Bosun.

## f. Crewmates

`var CREW = [];` (`{id, name, role, tier, hp, injuredUntil, loyal}`), **crew slots per frame** in `FRAMES`: Runabout 1, Hauler 2, Gunship 3. Assign at dock ("CREW" panel, Ship tab). **Hard rule: max 1 Gunner per frame** — slots force role diversity, and that *is* build expression; 3 stacked auto-turrets would make the pilot a spectator (Pillar 1).

| Role | Flight | Boarding | Hire |
|---|---|---|---|
| **Gunner** | One crew turret implemented as an **additional barrel through the existing `updateTurret` path** with a cursor-nearest target override; 60% of mgun dps; **each shot draws 1.5 energy from the player's pool** — it lives inside the one-pool rhythm, not beside it. **Focus-fire lock toggles on T** (never middle-mouse). | Covers the breach room on exit. | 600 CR |
| **Engineer** | +1.5 hull/s out-of-combat (3s); halves one R-channel per wave ("assist weld"). | One free revive per boarding (up at 40%). | 900 CR |
| **Quartermaster** | +12% credits all sources; 2× pickup radius. | +1 crate per interior. | 700 CR |
| **Shieldtech** | +20% shield regen; shield-break grants 1s invuln (8s cd). | — | 900 CR |
| **Bruiser** | — (25 kg of attitude) | 45 hp melee ally, draws aggro. | 500 CR |

**Acquisition:** dock bar (2 candidates/wave refresh; Charisma 6 discount); 25% of mayday rescues are ex-crew who join free; story cards (Rex → Quartermaster, stowaway → Engineer). Tiers 1–3: +1 tier per 5 waves survived, +25% effect per tier.

**Death & persistence.** Crew can't die in flight while the ship lives. Boarding: Bruiser at 0 hp and post-revive Engineers are **injured** — out 2 waves (grayed). Perma-death only if the Haven falls. Barks via the existing PIXEL system (4–6 lines each). **Between runs, crew scatter — no free army on run 2:** at run end you pick exactly ONE crew member to stay loyal (a small epilogue beat; they return free); the rest reappear in future hire pools at **50% cost with tiers intact** — a reunion discount, not a persistence exploit that flattens early-game scarcity.

**Ship Refit (the R2 answer — new outfitting depth, ships in P3).** A dock "REFIT" button (fee **300 CR**) lets each frame swap between 2–3 legal slot layouts, so *the player* decides weapon count and slot allocation:

- **Runabout** — stock 1W/1S/1T; *Interceptor rig* 2W/1S/0T (−15% thrust); *Utility rig* 1W/0S/1T+1U.
- **Hauler** — stock 1W/2S/1T; *Gunboat rig* 2W/1S/1T (−10% shield cap); *Tender rig* 1W/2S/0T+1U.
- **Gunship** — stock 2W/2S/2T; *Broadside rig* 3W/1S/2T (−20% shield cap); *Command rig* 2W/2S/1T+1U.

New **Utility (U) module types** for the utility slot: *Tractor Web* (pickups pulled from 3× range), *Afterburner* (boost top speed +20%), *Point-Defense Nub* (auto-zaps one enemy bullet per 2s within 60u). `EQUIP`, the Weapon Lab, and module sockets are otherwise retained unchanged — refit adds the missing axis on top.

## g. Combat Feel — The Juice Checklist

The game already has shake (`shakeT`), floaters, grings, banners, **and a full procedural music engine plus `sfx()` (~4506) — extend both; creating a second `AudioContext` is a bug.** All values in one `JUICE = {...}` config at the top.

**P0 — biggest wins first:**

| Item | Spec |
|---|---|
| Hitstop | Kill: freeze world 40ms (elites 70, bosses 120) via `hitstopT` zeroing `dt`. **No stacking:** concurrent kills extend the current freeze by at most +20ms, hard cap 120ms outside boss deaths — splitter/brood chain-kills must never slideshow. |
| Kill flash | Dead enemy renders 1 frame solid white, then explosion. |
| Explosion upgrade | 3 layers: white core flash (80ms), 8–14 faction-color sparks (300–500ms drag), smoke ring (reuse gring). Elites add a shockwave nudging enemies 20u. |
| Directional shake | Impulse vector away from hit source; player-hit 6px/150ms, kill 3px/100ms, boss death 14px/600ms. |
| Muzzle + recoil | 40ms muzzle quad; 1.5px visual kickback per shot. |
| Damage feedback | Player hit: 60ms red vignette + hull-bar shake; shield hit: cyan hex-shimmer at impact angle, distinct sound. |
| Low-hull state | <30%: soft red vignette, engine sputter particles, 1Hz heartbeat thump. |
| Sound | **Add these named voices to the existing `sfx()` switch — do NOT build a new synth or AudioContext:** laser blip (pitch-jitter ±6%), kill crunch, shield ping, explosion noise-burst, payout coin, UI ticks. 8-voice cap. |

**P1:** wave intro (800ms letterbox + faction sigil + `story` line + klaxon; enemies warp-flash in); wave-clear killcam (last kill: 0.3× slow-mo 600ms, camera ease, "WAVE CLEAR" stamp, payout count-up over 900ms with per-tick sound); combo pitch-rise per step; near-miss whoosh (bullet within 10u); boss intro darken + spotlight + segmented hp-bar assembly; Haven-pain screen-edge pulse + PIXEL bark. **Music: extend the EXISTING music engine** with a per-theme pad layer keyed to the wave's nebula hue, an intensity layer that fades in while enemies are within 600u of the Haven, and boss-intro stings — the anti-boring lever after visual juice, same no-asset constraint.

**P2:** speed²-scaled thruster trails, dash afterimages (3, 120ms), damage-scaled floaters (crits ×1.6 gold), trader cha-ching, module beacon pillars, button hover-grow/press-squash, story-card flip-in, Imperial warp flash line.

## h. Economy Rebalance — 20 Waves

Income per wave: wave clear `55 + 22·w`; **trader fees ~30–70 CR/wave scaling with Marketplace rank (magnate ×4)** — now quantified so Charisma's +4%/rank is checkable against Accuracy's +3% damage; bounty chips (**12 CR base**) + crates; boss bonuses 250/450/700/1000; story cards net ~+20 avg; boarding 150–500 × ~4–6 opportunities. Start 350 CR. **The turtle tax, stated and enforced: ~40% of a wave's income requires leaving the Haven's dock ring** — trader fees accrue at traders across the field, bounty chips expire 6s after dropping where they drop, maydays expire at field edge, crates spawn off-grid. Additionally: kamikaze splash damage reaches inside the dock ring during raids, and player-sourced Haven repair is capped (once/wave, 20% — §b). A Haven-parked Engineer build must be *safe but poor*.

**The catalogue, actually summed (the old "120% rule" was off by 2.5× — these are the new prices):**

| Line | Cost |
|---|---|
| Frames: Hauler **2,200**, Gunship **4,200**; **trade-in at 60% of purchase price** (Runabout base value 300) | net ~4,780 |
| Existing 4 facilities, ranks 5–6 at **450/700** each line | 4,600 |
| Crew Quarters **250/400/600** | 1,250 |
| Gear Locker **200/350/500** | 1,050 |
| Personal gear wall 3,500 (a typical build buys ~1,500) | 1,500–3,500 |
| Three crew hires | ~2,100 |
| Pips + module rerolls (typical run) | ~2,700 |
| **Total ladder** | **≈ 16,000 ≈ 140% of a perfect run's ~11,300** |

**You buy a build, not everything** — always ~2 desires left unbought. Intentional.

**Waypoint table — rebased on projected CASH ON HAND (cumulative minus recommended spend), not cumulative earned:**

| Wave | Cum. earned | Rec. spent so far | Cash on hand | Target purchase |
|---|---|---|---|---|
| 1–4 | ~1,000 | ~500 | ~500 | 2–3 pips (120–260 ea) |
| 5 | ~1,450 | ~800 | ~650 | First facility rank (400) |
| 6–9 | ~2,700 | ~1,700 | ~1,000 | First crew (600); Gear Locker r1 (200) + Boarding Axe (250) + Flak Vest (400) by wave 6–7 |
| 10 | ~3,600 | ~1,400 | ~2,200 | **Hauler 2,200** ✓ |
| 11–14 | ~5,600 + boarding | ~4,400 | ~1,200+ | Facility ranks, T2/T3 gear, 2nd crew |
| 15 | ~6,900 + boarding | ~5,200 | ~2,400 + Hauler trade-in 1,320 ≈ 3,700 | **Gunship 4,200** — frugal runs with boarding income land it here; typical runs wave 16–17. That stagger is fine. |
| 16–19 | ~9,500 | — | — | Final facility ranks, Marine Plate, 3rd crew |
| 20 | ~11,300 | — | — | vs 16,000 ladder — desire remains. |

**Rules & formula reconciliation:** upgrade pips keep the LIVE formula `shipCost = base × 1.6^rank` (line ~4058 — the earlier draft's 1.5 was wrong; do not change the exponent). **"Pips" means the existing dock ship-stat purchases (hull/energy/etc.) — NEVER skill ranks; skill ranks are XP-only, full stop.** `SHIP_MAX` stays 4. `MSHIP_DEFS` gains `cost5/cost6` flat overrides (450/700) that `mshipCost` (~3992) reads instead of its `×1.7^rank` curve for those ranks. **Discount stacking is multiplicative with a hard cap of 25% total** (Entrepreneur + Deputized + Gear Locker r3 cannot exceed it). **Entrepreneur R6's "shop reroll" defined:** re-randomizes the module shop's current offers, once free per dock; further rerolls 150 CR (the Black Market reroller is the outlaw flavor of the same mechanic). The income/affordability table assumes a **zero-Entrepreneur baseline** — the P6 ±15% verification runs against that baseline, with a separately documented expectation (~+30% income) for econ-specced runs. At least 3 affordable + 1 aspirational item at every dock (assert while balancing). HUD top bar always shows CR / LVL+XP-to-next / current wave payout estimate (R11).

## i. Haven Facilities for the 20-Wave Arc

Extend `MSHIP` facilities to **6 ranks** (rank 5–6: 450/700 per line via `cost5/cost6`) plus two new facilities:

- **Marketplace 5–6:** +fee tiers; rank 6 spawns a "magnate" trader every 4 waves (fee ×4).
- **Repair Bay 5–6:** self-heal scales; rank 6: once/wave, Haven auto-repairs 15% when first below 25% — keep this, it's good drama.
- **Defense Turrets 5–6:** rank 5 flak vs kamikazes; rank 6 turrets inherit 25% of Accuracy ranks.
- **Shield Generator — the one canonical model (R4):** the Haven has a **base shield of 150 from wave 1** (P1 ships this; regen 8/s after 6s unhit) via `defendNode.sh/shMax`, rendered as the same double-bar as the player. Existing ranks 1–4 keep granting **+200 hull each, unchanged**. Ranks 5–6 each add **+120 shield and +2/s regen**. Nothing retroactively converts.
- **CREW QUARTERS (new, 250/400/600):** +1 bar candidate per rank; injury recovery −1 wave at r2; tier-up every 4 waves at r3.
- **GEAR LOCKER (new, 200/350/500)** *(renamed — the dock TAB is "Armory", the FACILITY is "Gear Locker"; never the same word)*: unlocks gear T2/T3 (T1 always free); r3 = 10% gear discount (inside the 25% cap). At OUTLAW the Armory tab re-skins as **BLACK MARKET** (§c stock).

**Hull/Shield layering everywhere (R4):** player already has `hp/sh`. Enemies per the ROSTER table (§a): freelancers, imperials, clan captains, all bosses get shields (30–40% of hull, regen after 5s unhit); scoundrel trash hull-only; aliens hull-only with 2/s hull regen. **Ion = the shield-breaker with a secondary:** ×2.5 vs shields, ×0.6 vs hull, **plus a 20% slow for 1.5s on hull-only targets ("ionized engines")** — so it's a build choice on alien/scoundrel waves, not dead cargo for 40% of the campaign.

---

# SAVE MIGRATION (applies to every phase)

Existing players have `bdg_*` keys — separate localStorage keys, **not one blob**. Ship a `saveVersion` (`bdg_v='2'`) and a one-time `migrateSave()` in P-1. Concrete edits: the `bdg_mship` loader (~4068) rebuilds MSHIP as exactly `{market,repair,turret,shield}` — extend to `{...existing, crewq:ms.crewq|0, gearlocker:ms.gearlocker|0}` or new facility ranks are silently dropped on reload. New keys: `bdg_crew` (known-crew pool, default `[]`), `bdg_gear` (`{gun,blade,armor}`, default T1), `bdg_repcarry` (number, default 0 — REP itself is per-run), `bdg_shadowcore` (prestige token, default 0). Add all to `saveMeta()` (~4075). **Frame reprices must not create refund exploits: an owned 12,800 Gunship stays owned; trade-in value uses the NEW price.** **Every phase's verify includes: load a pre-2.0 save — missing fields default sanely, zero console errors, owned items keep their value.**

---

# ART DIRECTION ADDENDUM — "Not Boring" Means:

Keep the premium-vector language (gradient steel, glass canopies, glow cores; palette: cyan `#22D3EE`, teal `#5EEAD4`, blue `#7FA8FF`, gold `#F1D27A`, orange `#F97316`, red `#E0447C`, navy `#0b1322`). The problem is uniformity and stillness, not the assets. Five directives:

1. **Faction silhouettes at a glance.** Scoundrels: asymmetric welded scrap, orange rust. Imperials: symmetric white-blue daggers, gold trim. Clan: blood-red chevrons, matte. Aliens: NO straight lines — chitin lobes, bone-white + `#E0447C` glow. Civilians: rounded pastels. Faction ID from shape + accent in 100ms, no reading.
2. **The world has weather.** Slow-drifting nebula gradient shifting hue per wave theme (alien magenta, Imperial cool blue, clan ember-orange), shooting-star streaks, 2–3 parallax silhouettes. Wave 14 must not look like wave 2.
3. **Light sources are dramatic.** Explosions, engine flares, Broodmother glow cast fake light via additive radial gradients tinting nearby ships; the weld-channel lights your own hull orange.
4. **The Haven is a character.** Damage states (sparking breaches <60%, fires + evacuating shuttle <30%), window lights going dark section-by-section, repair-drone sparks. Players protect what visibly lives.
5. **Motion everywhere at idle.** Turrets track, antennae blink, traders bob, PIXEL orbits, UI bars breathe 1px. Stillness reads as cheap.

---

# BUILD PHASES

Each phase ends PLAYABLE and verified. Test protocol every phase: load the file, `window.__dbg()` before/after the feature action, capture via `__shot()`, play 3+ waves touching the new feature, zero console errors, **and the pre-2.0 save-load check (SAVE MIGRATION section)**. Final check of each phase WITHOUT godmode.

**P-1 — Tooling & Migration (half-session).** Dev-only `__shot()`: `canvas.toDataURL('image/png')` → programmatic `<a download>` click (there is NO POST endpoint; do not build one). Extend `__dbg()` to report REP, wave theme, live enemy counts by faction, XP-per-wave log, and add hooks: `__forceRep(n)`, `__injureCrew(id)`. `bdg_v='2'` + `migrateSave()`.
*Verify:* `__shot()` downloads a PNG; a copied pre-2.0 save loads clean.

**P0 — Feel First (tightly scoped).** Juice P0 list; `SKILL_MAX` 10; Engineering skill + R-channel; Accuracy crit breakpoints and Speed dash breakpoints only (they're self-contained) — **all other breakpoints ship with the phase that owns their system** (Charisma card/crew → P2/P3, Entrepreneur reroll/interest → P5b economy pass, Combat → P4a). Sound = named voices in the existing `sfx()` switch.
*Verify:* 10 kills all land audibly/visibly; hitstop never stacks past cap; R-channel heals 14+7·rank at ranks 1/5/9; interrupt refunds 50%; `SKILLS.engineering` in `__dbg()`.

**P1 — Campaign Spine + Rep Core.** `LEVELS` to 20 with all new fields incl. `target` seconds and boss-id re-slotting (§a — sites 5444, bossIntro, 4919); wave-intro letterbox + story banners; music theme/intensity layer; `REP` structure, capped passive deltas, thresholds, dock/pause UI, rep carryover; Haven base shield 150 on `defendNode`. Game fully playable end to end.
*Verify:* 20-wave run reachable; Trusted arithmetic holds (+36 achievable by wave 11 — log it); Haven shield bar renders/regens; civilian kill moves rep and `wanted` independently; boss ids fire intros correctly and `openFinalUp()` only at wave 20.

**P1.5 — Factions & Foes.** Alien/clan factions, all new ROSTER entries (§a table), `spawnDirector` rewrite (pool/cap/spawnRateMul; cap counts ALL hostiles), per-wave special mechanics (mines 40u/1hp/48dmg, splitters, barges, enrage), enemy shields, ion rework, Imperial assist warp-ins.
*Verify:* each wave 1–19 spawns its themed pool (`__dbg()` counts); cap holds on alien waves; assist triggers at forced Trusted; assist dps ≤25% of wave threat over 3 waves.

**P2 — Story Cards.** Card framework (DOM overlay spec §d), 20-card deck exactly, `safePreBoss` subsets, pacing + `cardResolved` gates on `arriveBase()`/`doWarp()`, waveMod/priceMod plumbing, `RUN_LOG`, chains, P3/P4 fallbacks, Charisma R3 breakpoint.
*Verify:* card after wave 2 on BOTH the fly-to-dock and B-warp paths; waveMod visibly alters wave 3; priceMod moves shop prices; pre-boss draws are safe-subset only; Rex chain completes including the 40% vanish; no repeats; no cards after bosses.

**P3 — Crew + Refit.** `CREW`, frame slots, 5 roles (1-Gunner cap, energy-drawing turret via `updateTurret`, T focus-lock), bar hiring, injury timers (verify via `__injureCrew`), loyal-crew epilogue + 50% rehire pool, barks, **Refit system + utility modules**, Charisma R6/R10.
*Verify:* Gunner drains player energy per shot and respects the 1-per-frame cap; refit swaps layouts and stat costs apply; two saved builds play measurably differently vs wave 13; injured crew grayed exactly 2 waves.

**P4a — Boarding Core.** `mode==='boarding'` with the full freeze list (§e), E-hold breach + fullscreen gating, split timers (25s exterior / 60s–120s interior), ONE hardcoded 3-room template, Gunner-type guards only, move/shoot, one crate, extraction/eject flow, kill-credit rules, Combat skill entering the draft pool at wave 10 with free rank 1.
*Verify:* disable an elite (damage caps at 15%); breach never toggles fullscreen; wave timer/spawns/Haven state frozen during boarding (`__dbg()` snapshot before/after identical); loot banks only on extraction; eject leaves 5s on the hulk.

**P4b — Boarding Depth.** Guard FSM (3 states), Deckhand/Bosun, melee/roll, locked Engineering doors, wave-scaled guard counts, room-template pool + organic tileset, boarding charges (1/wave), Armory tab + all 9 gear items, room-scaled loot.
*Verify:* clean elite clear extracts with 10–20s left, greedy run 2–5s (tune until true); armor applies DR not HP; charge limit enforced.

**P5a — Broodmother + Branches.** Broodmother full spec (segments, brood, lash, core, boardable organic interior); waves 11/18/19 branch logic for ALL rep bands including Watched/Marked; wave 19 fixed-budget composition from `RUN_LOG`.
*Verify:* Broodmother killable AND boardable (boarding her completes the wave and pays the boss bonus); wave 11 at forced Watched runs the observer wave; wave 19 threat budget identical across a clean and a messy `RUN_LOG` (only composition/dialogue differ).

**P5b — Shadow + Outlaw + Economy.** Shadow peak-snapshot mirror + stat floor + true-ending interior with dialogue (§e); Black Market (5 contraband modules) + Scoundrel's Pact (per-wave formula) + smuggling crates; full repricing pass to §h (frames, facilities cost5/6, trade-in, discount cap, reroll); Entrepreneur R6/R9/R10.
*Verify:* strip-your-modules-at-wave-20 cheese fails (Shadow uses peak snapshot); Outlaw run (`__forceRep(-70)`) flips waves 11/18, unlocks Black Market, and its logged income lands within ±10% of a loyalist run's; loyalist gets wave-18 assist.

**P6 — Art, Polish, Balance.** Faction silhouettes, nebula weather, Haven damage states, light gradients, juice P1+P2, codex pages, **the economy verification (moved here): full-run ledger within ±15% of the §h table on the zero-Entrepreneur baseline**, plus 3 full playtest runs (loyalist, outlaw, greedy-neutral).
*Verify:* `__shot()` every wave theme — each visibly distinct; killcam fires on final kill only; zero console errors on all three runs; the "would I play one more wave?" gut check at waves 6, 13, and 19 — any "no" means fix pacing before calling it done.

## Appendix — Multiplayer (architecture notes ONLY, build nothing)

Someday: 2-player co-op defense. Do not build netcode. DO avoid, starting now: (1) keep the sim step a pure-ish function of `(state, inputs, dt)`; route gameplay RNG through one seedable `rng()`; (2) don't hardcode `player` as a singleton in new systems — crew turrets, boarding, card resolution take an actor/params argument; (3) boarding-pauses-space breaks in co-op — `/* MP: */` comment, don't solve; (4) keep input reading isolated; (5) card choices resolve through the single `applyOutcome(choice)`.

## Definition of Amazing — Acceptance Checklist (R1–R14)

| Req | Satisfied by | Ship-check |
|---|---|---|
| R1 Ship feel | Pillars 1&5; §g P0; FRAMES untouched at rank 0 + free Speed rank 1; energy pool as the hub | Dash-boost-shoot beats 1.0 in blind A/B **from a fresh rank-0 start** |
| R2 Deeper outfitting | **Refit layouts + utility modules** + retained EQUIP/Weapon Lab + crew slots + gear | Two saved builds (different rigs) play measurably differently vs wave 13 |
| R3 Skills to 10 + Engineering | §b: breakpoints 3/6/9 + rank-10 capstones; Speed transfer w/ calibration; R-channel | Rank-8 Hauler out-turns rank-0 Gunship (per calibrated numbers); mid-swarm weld is a signature moment |
| R4 Hull/Shield layers | §i canonical Haven model; enemy shields per ROSTER; ion identity + slow | Double bars on player, Haven (from wave 1), shielded enemies |
| R5 Factions + assists + outlaw | §c per-run REP, capped kill drift, all-band branches, mirrored Pact, ±10% parity target | One full fun run on each alignment; Watched wave 11 works |
| R6 20 waves, 4 bosses | §a, boss ids 1/2/4/3 at 5/10/15/20 | Full campaign playable; finale flow fires at 20 only |
| R7 Wave mini-stories | `theme/story/pool` fields + banners + silhouettes | Every wave shows its line and faction |
| R8 Story cards | §d: 20 cards, waveMods, **priceMod**, rep, chains, dock-flow gates | Choices visibly change the next wave AND prices; cards fire on the warp path |
| R9 Boarding | §e split timers, charges, kill credit, gear, true ending | Board the Broodmother and extract with seconds left; failure is fun, not fatal |
| R10 Crew | §f roles, 1-Gunner cap, energy-pool turret, loyal-crew epilogue | Gunner + Engineer change a wave measurably without playing it for you |
| R11 Economy clarity | §h summed catalogue (140%), cash-on-hand waypoints, trade-in, discount cap, HUD | End-run ledger within ±15% of baseline table; always a next purchase |
| R12 Not boring | §g + music layer + Art Addendum + P6 | Per-theme screenshots distinct; kills land hard; silence never happens |
| R13 Multiplayer someday | Appendix constraints only | New code follows the 5 rules; zero netcode |
| R14 Addictive | Core-loop hooks; card cadence; killcam; count-up; boarding near-miss tuning | Playtester unprompted starts wave N+1 at waves 6/13/19 |

Build in phase order. Feel first, systems second, story third, spectacle last. When any decision is ambiguous, re-read the pillars — and remember the #1 metric: **the player who says "okay, ONE more wave" at 1 a.m. is the only review that counts.**