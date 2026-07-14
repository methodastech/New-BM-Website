// METHODUS — shared config: Marathon palette + balance constants.

export const PAL = {
  // Marathon art direction
  lime:    0xc8f02a,   // acid lime — hero accents, friendly UI, XP
  limeDim: 0x8aa81d,
  orange:  0xff5a1f,   // hazard orange — danger, boss, warnings
  orangeD: 0xc23c0e,
  ink:     0x14171c,   // near-black charcoal
  ink2:    0x1d2127,
  steel:   0x2b313a,   // panel steel
  bone:    0xe9e7dd,   // off-white panels
  boneDim: 0xb7b4a6,
  cyan:    0x39d7e6,   // shields / cool tech
  magenta: 0xe0447c,   // enemies
  blood:   0xd6314e,
  grass:   0x4c7a3f,   // grassland ground
  grassHi: 0x6fa84e,
  grassLo: 0x32562b,
  soil:    0x3a3026,
};

// CSS hex string helper
export const css = (h) => '#' + h.toString(16).padStart(6, '0');

export const CFG = {
  worldRadius: 60,        // playfield radius (soft bound)
  core: { hp: 500, radius: 3.2 },
  hero: {
    hp: 100, speed: 11, radius: 0.9,
    pickupRadius: 3.2,
    invulnAfterHit: 0.6,
  },
  camera: { dist: 17, height: 17, lerp: 0.09, fov: 42 },
  xp: { base: 6, growth: 1.55 },   // xp to next level = base * growth^(level-1)
  wave: {
    breakTime: 6,         // seconds of calm between waves (Armory window)
    baseCount: 6,         // enemies in wave 1
    countGrowth: 3,       // + per wave
    bossEvery: 4,         // boss on every Nth wave
  },
};

// Weapon definitions — identity over raw numbers.
export const WEAPONS = {
  pulse: {
    name: 'Pulse Rifle', kind: 'gun', col: PAL.cyan,
    dmg: 9, rate: 0.28, range: 18, speed: 46, spread: 0.02, count: 1, pierce: 0,
    tag: 'standard issue',
  },
  mgun: {
    name: 'Machine Gun', kind: 'gun', col: PAL.lime,
    dmg: 5, rate: 0.08, range: 15, speed: 52, spread: 0.13, count: 1, pierce: 0,
    tag: 'rapid · spray',
  },
  scatter: {
    name: 'Scatter Gun', kind: 'gun', col: 0x5eead4,
    dmg: 5, rate: 0.6, range: 9, speed: 40, spread: 0.5, count: 7, pierce: 0,
    tag: 'close · cone',
  },
  sword: {
    name: 'Arc Blade', kind: 'melee', col: PAL.bone,
    dmg: 26, rate: 0.42, range: 3.6, arc: 2.1, lifesteal: 0.18,
    tag: 'melee · lifesteal',
  },
  rocket: {
    name: 'Rocket Pod', kind: 'gun', col: PAL.orange,
    dmg: 22, rate: 0.85, range: 20, speed: 30, spread: 0.04, count: 1, pierce: 0,
    splash: 4.5, homing: true,
    tag: 'homing · AoE',
  },
  rail: {
    name: 'Railgun', kind: 'rail', col: 0x7fa8ff,
    dmg: 60, rate: 1.1, range: 34, charge: 0.5, pierce: 99,
    tag: 'charge · pierce',
  },
};
