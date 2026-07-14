# ESSENCE, Game Design (working doc)
*Engine-agnostic. Written to hand to a 3D build. Title TBD ("Essence" is a placeholder.)*

## 0. One line
A being condensed from a graveyard of suffering, you mine **essence** (the leftover feelings of the living and dead) and engineer yourself a body, an arsenal, and a domain, descending a dungeon of unknown depth, as strong as you dare to become.

## 1. Premise (light-touch story)
You don't know what you are. You woke in a green meadow that is secretly a mass grave, a place where a great dispute once killed countless humans and monsters, where grieving families came searching for their dead, until the field was saturated with suffering. That miasma pooled like dark mana and condensed into **you**: at first only a slime. No quest is forced on you. You exist to continue and to gather power. The pull is the mystery of yourself and the unknown bottom of the dungeon.

## 2. ESSENCE (the one resource)
Essence is harvested **emotional / spiritual energy**, the residue of feelings, NOT souls (souls return to God; you only take the vibe they leave). Joy, sorrow, suffering, fear, rage, evil, goodness, all are essence. Places and beings steeped in strong feeling are rich in it. There are no XP/levels: essence is the only currency, and with it you can do almost anything.

*Design call: essence is a single fungible currency for now. Optional future depth = typed essence (sorrow vs joy vs fear) fuelling different powers. Start single.*

### Gaining essence
| Source | Notes |
|---|---|
| **Consume the dead** | Eat bones/corpses, the feelings soaked into remains. The starting graveyard (human skeletons + a huge minotaur skeleton) is the first larder. |
| **Kill** | A death releases a burst of feeling. Stronger or more emotional deaths (terror, rage, a boss's despair) yield more essence. |
| **Passive harvest** | Plant **essence-flowers / monster-plants** that slowly draw a place's ambient feeling. Deeper, richer layers = higher yield. Upgrade them with essence. |
| **Base pool** | The essence pool itself trickles ambient grief over time. |

### Spending essence
- **Body**, author / upgrade your form (transformation tree).
- **Weapons & armor**, forge what you've learned.
- **Magic / abilities.**
- **Harvesters**, plant + upgrade essence-flowers.
- **Base**, build, fortify, upgrade the carry-jar.

## 3. THE BODY, essence engineering + learn-by-consuming (the hook)
You have no fixed body or arsenal; you **formulate** them from essence. You can only build what you've **consumed**: eat/kill X → learn X's blueprint → spend essence to take that form or forge its gear.

- Path: **Slime → Wolf/Hound → Humanoid → Human-strong / Minotaur / Mutant.**
- Weapons come the same way: fight steel-armed humans → learn to forge + grip steel and wood weapons.
- **Mix-and-match (recommended):** bodies are built from PARTS, minotaur torso for bulk, human hands to wield a blade, so the player engineers hybrids. This is the soul of "essence engineering." *(Flag: part-based vs whole-body swap.)*
- Forms are not levels; you keep/swap what you've learned. *(Flag: upkeep cost? slot limit?)*

## 4. HEAT, the difficulty dial the PLAYER controls
Two heat sources feed the threat level:
- **Gold hoard**, the more treasure stockpiled in a base, the more thieves and armies come to take it.
- **Bounty**, the more you kill and are seen, the more wanted you become.

Heat raises the **frequency and strength** of hunters. More hunters = more essence *if you can kill them*. So the player chooses their own pace: hoard and flaunt for fast essence at high danger, or lie low for safety and slow growth.

## 5. FREEDOM + SOFT PRESSURE (no forced progression)
You may stay on any layer as long as you like. Two soft pressures push you onward without scripting:
1. **Stagnation**, a shallow layer caps essence income; a Layer-1 creature can only get so strong.
2. **Attrition**, bounty never fully resets; eventually a hunter beyond your current power finds you. Stand still too long, underpowered, and you die.

Going deeper trades richer essence + stronger forms for tougher enemies.

## 6. LAYERS & DESCENT
- Many layers; the true bottom is unknown.
- **Layer 1:** weak humans only (can't travel deep) + the graveyard's dead to eat.
- **Each deeper layer:** stronger humans and monsters, its own ecosystem and look, richer ambient essence.
- You descend at your own pace and plant bases where you choose.

## 7. BASE & THE ESSENCE POOL
- Your **essence pool** is home, respawn, and harvest hub. You can plant it **anywhere**.
- **Carry-over:** move coins + essence down in a **jar** (built with essence + coin); deposit into a bigger jar you upgrade at each base.
- **Death model (proposed):** dying reforms you at your essence pool (losing some essence/hoard). If your POOL is found and destroyed, that's the true loss, major setback / game over for that base. So **where you plant your base is your core risk decision.** *(Flag.)*

## 8. COMBAT (moment-to-moment)
Action combat: move, dash (i-frames), attack/charge, parry (timing window + scaling counter), **force-push with momentum** (shove enemies off ledges → fall damage), magic (essence), summon the dead. Juice: hitstop, screen shake, knockback, telegraphs, damage numbers. Enemies are driven by feelings, they grieve, avenge, protect, flee, and those feelings ARE the essence you harvest.

## 9. SURFACE DOUBLE-LIFE (mid-game+)
Once you can form a convincing human body (~Layer 2), you can disguise and walk the **surface**, a second mode: blend in, gather, learn, manipulate, harvest the feelings of the living. The opposite of the dungeon's combat. End-state: enough power to take the surface as a demon lord.

## 10b. IMPLEMENTED INVENTORY (the 2D prototype, what already exists as rules)
**Combat actions:** move (8-dir), 3-hit combo, hold-charge swing, dash-strike, timed parry (counter+stun, reflects arrows), hold-guard (soak 80-94%), dash (i-frames, up to triple), spell (E, cycle C), summon (Q), potion/mana-pot, gear/rest at the pool.
**Weapons (7):** Longsword D, Short Sword E, Twin Knives D, Reaver Spear C, Bastard Sword B, Hunting Bow C, Throwing Axes C (stats: dmg-mul, reach, arc, force, cd, hvCd). Mastery families: Bladework / Archery / Polearm (+20/40/60% + perk).
**Spells (6, 3 forms each):** Force Push, Force Pull, Fireball, Lightning, Water Ball, Whipsnake (mana cost 20-34).
**Armor (6):** Cloth E (0%/+14spd), Leather D (12%), Chainmail C (22%), Plate B (34%), Bonemail A (40%/agile), Wraithplate S (50%).
**Skills (8 x3 lvls):** Dash, Summon, Sword, Push, Parry, Charge, Speed, Guard.
**Bestiary (12):** Warrior/Hunter (civilian D), Soldier D / Squire C / Knight B / Commander S (kingdom), Mage A (kingdom), Rogue C / Assassin B / Berserker A (scum), Champion S (kingdom), Ghoul B (monster). Layer-1: warrior,hunter,soldier,squire,rogue,knight,commander. Layer-2 adds: mage,berserker,assassin,champion,ghoul.
**Factions:** Civilian / Kingdom / Scum / Monster. **Grades:** E D C B A S.
**Structure:** Days 1-20, depth = ceil(day/5) cap 4; bosses ~d5 (Captain), d10 (Champion), d15, d20. Per-floor encounter mods (seeded twists) + situations.
**Economy (build):** Gold (hoard -> lures hunters), Life Essence (kills -> shop: skills/spells/mastery/forge), Mana (spells/summon), Stamina (block/parry/dash). Pool/well = mana spring + hideout + growing sunken hoard. Forge gated by floor (E/D d1 ... S d9), paid in essence.

## 10c. OPEN QUESTIONS (to reconcile BUILT vs CANON, answers fill this doc)
1. **Body vs weapons:** canon = shapeshifting creature; build = humanoid with 7 weapons + 6 armors. Do weapons/armor stay (usable in humanoid forms, forged from consumed blueprints) while beast forms fight with body attacks (claws/bite/gore)? How do forms + gear coexist?
2. **Currencies:** build has 3 (gold, life-essence, mana). Canon wants ONE essence (feelings) + gold = heat only. Fold mana into essence? Lock the names.
3. **Forms tree:** exact bodies, which enemy each is learned from, rough power/abilities, essence cost.
4. **Heat math:** how hard do gold + bounty scale enemy count + strength? Does bounty decay or persist?
5. **Harvest flowers:** cost, yield/sec, plant limit, per-layer scaling.
6. **Deeper layers (3-8):** design their enemy pools + ecosystems now, or keep building Layer 1-2 first?
7. **Recruitment:** how do you tame a monster (beat it then pay essence? a dominate move? a chance)?
8. **Death/base:** confirm reform-at-pool + losing-pool = game over; do bounty/hoard persist through death?

## 10d. DECISIONS LOCKED (session 2, 2026-06-21), supersedes the §3 sketch
- **One resource = Essence** (feelings). Mana folded in: spells, forms, grafts, forging, harvesters all cost essence. **Gold = heat only.**
- **Forms:**
  - *Slime*, origin/larva only; weak, eats bones to grow; never return to it.
  - *Wolf*, distinctive dog-wolf; fast melee + mobility; body attacks.
  - *Humanoid*, the MAIN fighting + end-game form; tough elf/vampire look; best at channeling essence/magic + wields forged weapons. Player likes staying human.
  - *Bird/flyer*, later form; flight, traversal, recon; distinctive look.
  - **Grafting:** consumed-monster traits graft onto the HUMANOID (minotaur horns, extra muscle...). Humanoid = the combat canvas you customize; wolf/bird = mode-swaps for mobility/utility, not separate combat bodies.
- **Heat / cooling:** bounty rises with kills + flaunted gold; cools ONLY by hiding / not disturbing people (lay low). Otherwise persists.
- **Harvest:** plant essence-flowers that generate essence; assign SUMMONED SKELETONS to tend them (labor). Deeper layers yield richer essence.
- **Monsters & recruitment:** monsters sense you're kin -> TALK (recruit/appease) or FIGHT/DOMINATE. Essence is their drug/payment -> spend essence to win loyalty/hire them. Recruited monsters join your forces.
- **Death/base:** multiple essence pools allowed; on death you reform at your BIGGEST pool. If that main pool is destroyed -> GAME OVER. Protecting the core pool = the ultimate stake.
- **Scope now:** focus on MECHANICS; defer designing deeper layers (3-8) content.
- **Still open (minor):** per-form stats/abilities; exact heat numbers; harvest yield numbers; how grafts map to stats.

## 10. OPEN FLAGS (my calls, correct anytime)
- Essence: single currency (chosen) vs typed-by-emotion (future).
- Forms: part-based mix-and-match (chosen) vs whole-body swaps.
- Death/base model per §7.
- Player drive: emergent (power + survival pressure + mystery), no scripted quest, confirm this is the intent.


## 11. THE HUNT: fear, reputation, the mask, necromancy (Bible-formalized, 2026-06-29)
The Design Bible (`Essence3D/index.html`) promoted four systems to first class. They sit on top of the above. Where a Bible term renames or extends a build term, a **RECONCILE** note marks it.

### 11a. Fear (moment to moment, in combat)
Your nearness breaks enemies down a four rung dread ladder. Broken foes fight worse, flee, or beg. This formalizes the "enemies driven by feelings" line in §8.

| Rung | Behaviour |
|---|---|
| Calm | Holds ground, unaware of you. |
| Anxious | Edges back, hands begin to tremble. |
| Afraid | Backs away steadily, calls for help. |
| Terror | Breaks: screams, runs, or drops and begs. |

Fear is tactical and resets when you leave. It is separate from Heat (§4) and Reputation (§11b). A standing horde (§11d) widens your fear aura.

### 11b. Reputation (persistent, per faction)
A standing each faction keeps for you, on a pole from reviled or hunted up to revered. Unlike Bounty (one run, the Crown's military answer) and Fear (one moment), Reputation survives death and descent and governs the SURFACE life (§9): who shelters or sells to you, what rumours spread about your stolen face, who draws steel on sight.

**RECONCILE** with the build's Civilian / Kingdom / Scum / Monster factions (§10b):

| Bible faction | Maps to | Note |
|---|---|---|
| The Crown | Kingdom | Military and nobility; sets your bounty. |
| The Choir | new | Church and clergy who name you abomination; hunt with relic and rite. |
| The Common Folk | Civilian | Villagers and surface towns. |
| The Underworld | Monster + Scum | Other monsters, courts of the dead, smugglers; trade essence. |

The Choir is a new faction the Bible adds. Open call: adopt it, or fold the clergy into the Crown.

### 11c. The Mask and Suspicion (surface disguise meter)
On the surface your stolen body holds a disguise integrity called **Suspicion**. It rises from: feeding where you can be seen, letting your shape slip, answering a townsman wrong, or arriving with a monstrous Reputation. Past a threshold the town turns (doors bar, the watch musters) and the Hunt follows you up from below. It is the seam binding Reputation (what they expect) to Fear (what they sense). This gives §9's double life a meter and a fail state.

Suspicion ladder: Settled, Watchful, Alarmed, The Turn.

### 11d. Summoning and Necromancy (the headline new mechanic)
You eat the dead, so you raise them. Spend banked essence on the **Rite of Raising** (a casting school: speak the dead one's name) to reform devoured corpses into temporary **thralls** that rot on a timer and collapse back to a sip of essence you reclaim. This **EXTENDS** the existing summon action (Q) and the "skeletons tend essence-flowers" labor (§10b, §10d) into a full combat build.

| Thrall | Essence cost | Duration | Role |
|---|---|---|---|
| Shambler | Low | Brief | Cheap fodder, soaks blows, clogs the line. |
| Bone-Knight | Moderate | Steady | A drilled risen soldier who holds and trades blows. |
| Risen Beast | High | Long | A devoured monster that breaks formations. |
| Boss-Echo | Very high, rare | Long but fleeting | A faint copy of a slain elite, a finisher. |

New build identity: **the Commander**, who fights through a horde on a blade / word / horde triangle. Pure corners are the Warrior (blade), the Mega-Mage (word), and the Necromancer (horde); the Commander mixes all three. A standing horde swells your Fear aura and raises your Bounty most of all, because the Kingdom dreads a risen army above any single monster. **RECONCILE** the numbers (cost, duration, horde cap) with the build's essence and mana economy (§10b) once locked.

### 11e. Casting (carried from the Bible's Spells tab)
Voice cast is the USP: you speak the incantation, and pronunciation is the power. Four ways to cast: Shape (cursor sigil), Voice (spoken chant), Camera (webcam hand sign, planned), Summon (the Rite of Raising). Consistent with §10b's spell list, with the voice and pronunciation layer and the summon school added on top.

## 12. MULTIPLAYER and the shared world (Bible-formalized, 2026-06-30)
A direction added on 2026-06-30. The descent is no longer solo. **RECONCILE** with the solo death and base model (sections 7, 10d): in a shared world, what does dying, reforming at the pool, and losing the pool mean when other players share the map.

### 12a. One shared real-time world
One persistent map, the surface and the Bonefield both, ticking in real time. No instances, no private copies. Other players are other creatures, born of the same field, descending the same layers and walking the same towns at the same time. What another monster does lands in the world: the bodies it leaves and the Bounty it raises are there when you arrive.

### 12b. Shared origin
Every player starts as the same newborn slime condensed from the graveyard of grief. Nothing is chosen at birth. What you become is earned in the descent. The common start is the one story all players carry.

### 12c. Good or evil, read from deeds
There is no alignment menu. Conduct writes you, on a spectrum the world reads back:

| Standing | How you got there | How the world answers |
|---|---|---|
| Reviled | You feed in the open and prey on the weak | Every faction marks you for slaughter, players hunt you for sport |
| Feared | You take what you want and leave witnesses | Towns bar their doors, rival packs think twice |
| Watched | You walk the line, neither shield nor wolf | The Crown keeps eyes on you, players treat you as an open question |
| Revered | You shield villagers, spare the begging, hunt only the cruel | Folk open their gates, players seek you as an ally |

Alignment is summed from what you do, who you spare and devour, who you guard and betray, and it feeds Reputation (section 11b) with every faction.

### 12d. Parties
Players band into a roaming pack that descends, hunts, and holds ground as one. The pack shares essence, gold, and the corpses worth raising, and it shares every danger. A strong party draws a heavier Bounty: the Crown's military weight rises with your numbers. Betraying your own pack slides your alignment toward the Reviled and bleeds your standing.

### 12e. Tournaments
The surface sanctions blood. Enter the arena to fight other players for coin and renown. Wins climb a public ladder of renown that others read before they face you. The purse comes down with you into the descent, funding forms, spells, and the dead you raise.

### 12f. Street fights
Away from the arena the world is open. Brawls erupt against the Crown's patrols, against a lone monster, or against a rival player and their whole party. No rules, no referee, only what you can take and what you survive.
