# METHODUS — Game Design

A 3D base-defense action-roguelite. You are a humanoid combat unit defending a
central **Core** while free-roaming a living battlefield. Two health bars matter:
**your hull** and **the Core**. Lose either and the run ends.

Visual north star: **Loop Hero's atmosphere** (a small place you defend, dread
creeping in from the edges) fused with **Marathon's art direction** (acid lime,
hazard orange, charcoal, off-white, bold mono type, heavy technical labels).
Rendered in stylized low-poly 3D so the hero turns and animates smoothly.

Start biome: **Grassland.**

---

## 1. The pillars (in priority order)

1. **Defense first.** The Core is the point. Roaming, killing, looting all exist
   to keep the Core alive. Enemies path to the Core; you intercept.
2. **Two bodies to protect.** Your hull regenerates slowly / via pickups; the
   Core only heals from buildings or upgrades. Splitting attention is the tension.
3. **Choices over grind.** Leveling never just makes numbers bigger. Every level
   forces a *build-defining* fork with real opportunity cost.
4. **A world that breathes.** Idle bob, grass sway, pulsing Core, drifting motes,
   damage numbers, screen shake, synth hits. Nothing on screen is static.

---

## 2. The meaningful-choice system (the part that must NOT be "upgrade spam")

Research basis — what makes roguelite upgrades feel like *decisions* rather than a
treadmill (Loop Hero, Hades, Brotato, Vampire Survivors, Risk of Rain 2):

- **Opportunity cost.** Taking A means *not* taking B this level, and the menu
  won't show B again for a while. (Hades boons, Loop Hero trait tree.)
- **Tradeoff cards.** Pure-upside is boring. The strongest cards carry a downside
  you must want — "+60% fire rate, −25% range." (Brotato's signature mechanic.)
- **Archetype gravity.** Cards are tagged to builds. Stacking one archetype unlocks
  that archetype's payoff cards. The run develops an identity.
- **Synergy discovery.** Some cards do little alone and multiply another card.
  Finding the combo is the dopamine. (Risk of Rain item stacking.)
- **Weapon = identity, and committing is the choice.** You carry a limited number
  of weapons. Swapping is a real sacrifice, not a free add.

### Two separate upgrade tracks (matches the brief's two asks)

**Track A — LEVEL-UP CARDS (earned with XP, free choice).**
On each level you draw **3 cards** and keep **1**. Cards are drawn weighted by your
current archetype so the build snowballs coherently. Rules that keep it meaningful:
- Every card states its **downside** if it has one (most strong ones do).
- Picking a card adds "archetype points." At 3 points in an archetype, its
  **capstone** card becomes eligible — a build-defining power spike.
- Rejected cards are suppressed for the next 2 level-ups (no re-roll spam).

**Track B — THE ARMORY (spend RESOURCES looted from monsters).**
Monsters drop **Scrap** (common) and **Cores/Cells** (rare). Walk over to collect.
Between waves the **Armory** opens: spend resources to **buy weapons** and durable
structural upgrades (Core repair, turret, shield generator). This is the
"buy upgrades with resources from the monsters around him" loop. Prices scale, so
hoarding vs. spending now is itself a decision.

### Archetypes (each level-up card belongs to one)

| Archetype | Fantasy | Example cards | Capstone |
|---|---|---|---|
| **Gunner** | Ranged DPS, kiting | +fire rate (−range), pierce rounds, ricochet | **Overdrive:** fire rate ramps the longer you hold a target |
| **Blademaster** | Melee bruiser, dashes | dash-strike, lifesteal on melee, sweep arc | **Bladestorm:** every dash spawns a damaging spin |
| **Fortress** | Tank / Core defender | +Core HP, thorns, shield that reflects | **Aegis:** Core projects a shield bubble that fries enemies |
| **Engineer** | Turrets / drones / economy | deploy turret, +Scrap drops, repair drone | **Swarm Protocol:** turrets gain a second barrel + self-repair |
| **Reactor** | Risk / high-roll | crit chance, overheat nuke, glass-cannon dmg | **Meltdown:** at low hull, damage & speed massively spike |

Cross-archetype synergies are intentional (e.g. Fortress *thorns* + Reactor
*glass-cannon* = a hull that hurts to touch but melts you if you slip).

---

## 3. Weapons (the "sword / machine gun / gun" identity choices)

You start with the **Pulse Rifle**. Others are bought in the Armory or offered as
rare level-up cards. Each *reshapes* how you play, not just DPS:

- **Pulse Rifle** — balanced auto-fire, medium range. The default.
- **Machine Gun** — high rate, spread, chews ammo-heat; great DPS, forces kiting.
- **Scatter Gun** — close-range cone burst; brutal up close, useless at range.
- **Sword** — melee arc + dash-strike; no range, but fast, free, and lifesteal-friendly.
- **Rocket Pod** — slow homing AoE; clears swarms, weak vs. single boss.
- **Railgun** — charge-up piercing line; sniper, punishes standing still.

Carry cap = **2 weapons** (swap between them with a key). Choosing the second, and
later *replacing* one, is a commitment.

---

## 4. Buildings (clickable, around the map)

Scattered structures you click to trigger (each on a cooldown, some cost resources):

- **Med-Bay** — click to heal **your hull**.
- **Shield Pylon** — click to grant a temporary **shield** (absorbs hits).
- **Refinery** — click to convert nearby motes into **money/Scrap** instantly.
- **Repair Node** — click to heal the **Core**.

Clicking gives the player active map-management decisions: which building, when,
is the Core or your hull more urgent right now.

---

## 5. Enemies & bosses

Enemies spawn from the biome edges in **waves**, path toward the Core, and switch to
attacking the hero if intercepted. Roster: chargers, ranged spitters, kamikaze
swarmers, shielded brutes. Each death drops Scrap (+ rare Cells).

After N waves a **Boss** arrives with telegraphed attack patterns and a large HP
bar. Bosses are the run's chapter breaks. Grassland boss first; later biomes
(industrial, ash, void) escalate.

---

## 6. Game loop

```
Spawn in Grassland → waves of enemies path to Core
   → intercept, kill, loot Scrap → collect motes
   → click buildings to manage hull / Core / economy
   → gain XP → LEVEL UP → pick 1 of 3 build-defining cards
   → wave clears → ARMORY opens → spend Scrap on weapons/upgrades
   → repeat, waves escalate → BOSS → next chapter
Lose if hull OR Core hits zero.
```

---

## 7. Build status (vertical slice)

Implemented in this slice: grassland world + breathing hero (move/turn/animated)
+ following iso camera + central Core + dual HP + waves + enemy AI + auto-aim
combat + 2 weapons + Scrap economy + clickable buildings + XP level-up card system
+ one boss + Marathon HUD + particles/damage-numbers/shake + synth audio.

Roadmap after the slice: full weapon set, all 5 archetype trees, Armory shop UI,
more enemy types, additional biomes & bosses, save/leaderboard (port from the
original engine), mobile controls (port from the original engine).
