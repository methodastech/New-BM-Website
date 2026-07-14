// METHODUS — the level-up card system. Build-defining choices, not a number
// treadmill: archetype gravity, tradeoff cards, capstones, anti-spam suppression.
import { PAL } from './config.js';

export const ARCH = {
  gunner:   { name: 'GUNNER',     col: PAL.cyan },
  blade:    { name: 'BLADEMASTER',col: PAL.bone },
  fortress: { name: 'FORTRESS',   col: PAL.orange },
  engineer: { name: 'ENGINEER',   col: PAL.lime },
  reactor:  { name: 'REACTOR',    col: PAL.magenta },
};

// Each card: id, arch, title, desc (downsides stated), apply(p), unique?, capstone?, weapon?
export const CARDS = [
  // ---- GUNNER ----
  { id: 'g_rate', arch: 'gunner', title: 'Cycler Mod', desc: '+35% fire rate, −15% range. Spray faster, reach less.',
    apply: p => { p.rateMul *= 0.65; p.rangeMul *= 0.85; } },
  { id: 'g_pierce', arch: 'gunner', title: 'AP Rounds', desc: 'Shots pierce +1 enemy. −10% damage each.', unique: true,
    apply: p => { p.pierce += 1; p.dmgMul *= 0.9; } },
  { id: 'g_range', arch: 'gunner', title: 'Long Barrel', desc: '+40% range, +12% damage. −20% fire rate.',
    apply: p => { p.rangeMul *= 1.4; p.dmgMul *= 1.12; p.rateMul *= 1.2; } },
  { id: 'g_multi', arch: 'gunner', title: 'Split Chamber', desc: '+1 projectile, wider spread, −12% damage.', unique: true,
    apply: p => { p.extraShots += 1; p.spreadAdd += 0.12; p.dmgMul *= 0.88; } },
  { id: 'g_cap', arch: 'gunner', title: 'OVERDRIVE', desc: 'CAPSTONE · Fire rate ramps up the longer you keep firing.', capstone: true, unique: true,
    apply: p => { p.overdrive = true; } },

  // ---- BLADEMASTER ----
  { id: 'b_dash', arch: 'blade', title: 'Servo Dash', desc: 'Dash farther and faster. +10% move speed.', unique: true,
    apply: p => { p.dashPower += 0.5; p.moveMul *= 1.1; } },
  { id: 'b_steal', arch: 'blade', title: 'Vampiric Edge', desc: '+12% lifesteal on all damage. −5% max hull.',
    apply: p => { p.lifesteal += 0.12; p.maxHpMul *= 0.95; } },
  { id: 'b_sweep', arch: 'blade', title: 'Wide Arc', desc: 'Melee swings hit a +60% wider arc.', unique: true,
    apply: p => { p.arcMul *= 1.6; } },
  { id: 'b_glasscut', arch: 'blade', title: 'Reckless Strikes', desc: '+45% melee damage, but you take +15% damage.',
    apply: p => { p.meleeMul *= 1.45; p.dmgTakenMul *= 1.15; } },
  { id: 'b_cap', arch: 'blade', title: 'BLADESTORM', desc: 'CAPSTONE · Every dash leaves a damaging spin behind you.', capstone: true, unique: true,
    apply: p => { p.bladestorm = true; } },

  // ---- FORTRESS ----
  { id: 'f_corehp', arch: 'fortress', title: 'Core Plating', desc: '+25% Core max HP and repairs it 20%.',
    apply: p => { p.coreHpMul *= 1.25; p.coreRepair = (p.coreRepair || 0) + 0.2; } },
  { id: 'f_thorns', arch: 'fortress', title: 'Reactive Spines', desc: 'Reflect 40% of melee damage back. −8% move speed.', unique: true,
    apply: p => { p.thorns += 0.4; p.moveMul *= 0.92; } },
  { id: 'f_hull', arch: 'fortress', title: 'Heavy Frame', desc: '+30% max hull, −10% fire rate.',
    apply: p => { p.maxHpMul *= 1.3; p.rateMul *= 1.1; } },
  { id: 'f_shield', arch: 'fortress', title: 'Shield Capacitor', desc: 'Gain a regenerating shield (absorbs hits).', unique: true,
    apply: p => { p.shieldMax += 40; p.shieldRegen += 6; } },
  { id: 'f_cap', arch: 'fortress', title: 'AEGIS', desc: 'CAPSTONE · The Core projects a shield bubble that fries nearby enemies.', capstone: true, unique: true,
    apply: p => { p.aegis = true; } },

  // ---- ENGINEER ----
  { id: 'e_turret', arch: 'engineer', title: 'Deploy Turret', desc: 'A turret guards the Core and auto-fires.',
    apply: p => { p.turrets += 1; } },
  { id: 'e_scrap', arch: 'engineer', title: 'Salvager', desc: '+40% Scrap from kills. Pickup range +50%.', unique: true,
    apply: p => { p.scrapMul *= 1.4; p.pickupMul *= 1.5; } },
  { id: 'e_drone', arch: 'engineer', title: 'Repair Drone', desc: 'Slowly repairs the Core over time.', unique: true,
    apply: p => { p.coreRegen += 4; } },
  { id: 'e_magnet', arch: 'engineer', title: 'Mag-Field', desc: 'Motes home toward you. −5% damage (power diverted).',
    apply: p => { p.magnet = true; p.dmgMul *= 0.95; } },
  { id: 'e_cap', arch: 'engineer', title: 'SWARM PROTOCOL', desc: 'CAPSTONE · Turrets gain a second barrel and self-repair.', capstone: true, unique: true,
    apply: p => { p.swarmProtocol = true; p.turrets = Math.max(1, p.turrets); } },

  // ---- REACTOR ----
  { id: 'r_crit', arch: 'reactor', title: 'Critical Array', desc: '+15% crit chance (×2 damage).',
    apply: p => { p.crit += 0.15; } },
  { id: 'r_glass', arch: 'reactor', title: 'Glass Reactor', desc: '+50% damage, −25% max hull. High roll.',
    apply: p => { p.dmgMul *= 1.5; p.maxHpMul *= 0.75; } },
  { id: 'r_speed', arch: 'reactor', title: 'Coolant Purge', desc: '+20% move & fire speed. +10% damage taken.',
    apply: p => { p.moveMul *= 1.2; p.rateMul *= 0.8; p.dmgTakenMul *= 1.1; } },
  { id: 'r_critdmg', arch: 'reactor', title: 'Lethality Core', desc: 'Crits deal ×3 instead of ×2. −5% crit chance.', unique: true,
    apply: p => { p.critMul = 3; p.crit = Math.max(0, p.crit - 0.05); } },
  { id: 'r_cap', arch: 'reactor', title: 'MELTDOWN', desc: 'CAPSTONE · Below 35% hull, damage & speed spike hugely.', capstone: true, unique: true,
    apply: p => { p.meltdown = true; } },

  // ---- WEAPON UNLOCKS (offered only when arsenal has room) ----
  { id: 'w_sword', arch: 'blade', title: 'Pick up: ARC BLADE', desc: 'Add a melee blade to your arsenal (max 2 weapons).', weapon: 'sword' },
  { id: 'w_mgun', arch: 'gunner', title: 'Pick up: MACHINE GUN', desc: 'Add rapid spray to your arsenal (max 2 weapons).', weapon: 'mgun' },
  { id: 'w_rocket', arch: 'fortress', title: 'Pick up: ROCKET POD', desc: 'Add homing AoE to your arsenal (max 2 weapons).', weapon: 'rocket' },
];

export function defaultStats() {
  return {
    dmgMul: 1, rateMul: 1, rangeMul: 1, moveMul: 1, meleeMul: 1, arcMul: 1,
    pierce: 0, extraShots: 0, spreadAdd: 0,
    crit: 0, critMul: 2, lifesteal: 0, thorns: 0,
    maxHpMul: 1, coreHpMul: 1, scrapMul: 1, pickupMul: 1,
    shieldMax: 0, shieldRegen: 0, coreRegen: 0, dmgTakenMul: 1,
    dashPower: 1, turrets: 0,
    overdrive: false, bladestorm: false, aegis: false, swarmProtocol: false,
    meltdown: false, magnet: false,
    // bookkeeping
    arch: { gunner: 0, blade: 0, fortress: 0, engineer: 0, reactor: 0 },
    taken: new Set(), suppressed: {}, capstones: new Set(),
    coreRepair: 0,
  };
}

// pick 3 distinct cards, weighted toward the player's leading archetype(s)
export function drawCards(p, arsenalFull) {
  const pool = CARDS.filter(c => {
    if (c.unique && p.taken.has(c.id)) return false;
    if (c.capstone && p.arch[c.arch] < 3) return false;       // capstone gating
    if (c.capstone && p.capstones.has(c.arch)) return false;
    if (c.weapon && arsenalFull) return false;                 // no weapon cards if full
    if (p.suppressed[c.id] > 0) return false;                  // anti-spam
    return true;
  });
  // weighting: base 1 + 1.4 per archetype point so builds snowball
  const weighted = [];
  for (const c of pool) {
    let w = 1 + p.arch[c.arch] * 1.4;
    if (c.capstone) w += 6;            // surface capstones strongly once eligible
    if (c.weapon) w *= 0.7;
    for (let i = 0; i < Math.ceil(w * 2); i++) weighted.push(c);
  }
  const out = [];
  const used = new Set();
  let guard = 0;
  while (out.length < 3 && weighted.length && guard++ < 400) {
    const c = weighted[Math.floor(Math.random() * weighted.length)];
    if (used.has(c.id)) continue;
    used.add(c.id); out.push(c);
  }
  return out;
}

export function applyCard(card, p, ctx) {
  // decay suppression on every level
  for (const k in p.suppressed) { p.suppressed[k]--; if (p.suppressed[k] <= 0) delete p.suppressed[k]; }

  if (card.weapon) {
    ctx.addWeapon(card.weapon);
  } else {
    card.apply(p);
    p.arch[card.arch] = (p.arch[card.arch] || 0) + 1;
    if (card.capstone) p.capstones.add(card.arch);
  }
  if (card.unique || card.capstone) p.taken.add(card.id);

  // suppress the cards NOT taken so they don't immediately reappear
  if (ctx.lastDraw) {
    for (const c of ctx.lastDraw) if (c.id !== card.id) p.suppressed[c.id] = 2;
  }
  ctx.onApplied && ctx.onApplied(card);
}
