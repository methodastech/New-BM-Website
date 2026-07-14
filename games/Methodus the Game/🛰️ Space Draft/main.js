// METHODUS — orbital defense. A floating satellite at center; you pilot a strike
// craft with REAL momentum (thrust / drag / brake / boost). Raider ships fly in
// with their own inertia to destroy the satellite. Kill them, auto-collect their
// essence, level up, pick upgrades, survive to the first warlord (boss 1).
import { sfx, setMuted, isMuted } from './audio.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;
const lerpAng = (a, b, t) => { let d = ((b - a + Math.PI * 3) % TAU) - Math.PI; return a + d * t; };

/* ── palette ── */
const C = {
  bg: '#06080d', star: '#cfe0ff',
  lime: '#c8f02a', orange: '#ff5a1f', cyan: '#39d7e6', magenta: '#e0447c',
  blue: '#7fa8ff', bone: '#e9e7dd', steel: '#3a4350', red: '#ff4d5e',
  ess: '#b6ff5a',
};

/* ── canvas ── */
const cvs = $('game');
const ctx = cvs.getContext('2d');
let W = 0, H = 0, DPR = 1, CX = 0, CY = 0;
function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight; CX = W / 2; CY = H / 2;
  cvs.width = W * DPR; cvs.height = H * DPR;
  cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
addEventListener('resize', resize); resize();

/* ── starfield (parallax) ── */
const stars = [];
for (let i = 0; i < 220; i++) stars.push({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2, s: Math.random() * 1.6 + 0.4 });

/* ── state ── */
let state = 'title', t = 0, shake = 0, wave = 1, kills = 0;
const base = { hp: 1000, hpMax: 1000, r: 46, hitT: 0, ang: 0 };
const ship = {
  x: 0, y: 0, vx: 0, vy: 0, ang: 0, hp: 100, hpMax: 100,
  fireCd: 0, invuln: 0, hurtT: 0, boostT: 0, thrustX: 0, thrustY: 0, bank: 0,
};
const P = {
  ess: 0, essTotal: 0, level: 1, xpNext: 8,
  dmg: 12, rate: 0.13, bspeed: 740, pierce: 0, multishot: 1, spread: 0.05,
  accel: 1500, maxSpd: 560, drag: 1.7, hullMul: 1, magnet: 1, lifesteal: 0,
  baseRegen: 0, mods: [],
};
const enemies = [], pbul = [], ebul = [], orbs = [], parts = [], ports = [];
let boss = null, bossNum = 0;
let spawnQueue = [], spawnT = 0, waveActive = false;
let lastDraw = null;

/* ── input ── */
const keys = {};
let mx = CX, my = CY - 100, firing = false;
addEventListener('keydown', e => { const k = e.key.toLowerCase(); keys[k] = true; if (k === ' ') e.preventDefault(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
cvs.addEventListener('pointerdown', () => { if (state === 'playing') firing = true; });
addEventListener('pointerup', () => { firing = false; });

/* ── helpers ── */
function glowCircle(x, y, r, col, blur) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function dmgNum(x, y, txt, col, big) {
  const el = document.createElement('div'); el.className = 'dmg' + (big ? ' big' : ''); el.textContent = txt; el.style.color = col;
  $('fxLayer').appendChild(el);
  let life = 0.85; const vy = -34;
  const tick = () => { life -= 0.016; if (life <= 0) { el.remove(); return; } el.style.transform = `translate(${x}px,${y + (0.85 - life) * vy}px)`; el.style.opacity = life / 0.85; requestAnimationFrame(tick); };
  el.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(tick);
}
function burst(x, y, col, n, spd, big) {
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = Math.random() * spd; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4 + Math.random() * 0.5, max: 0.9, col, r: big ? 2.4 : 1.6 }); }
}
function ring(x, y, col, r) { parts.push({ x, y, vx: 0, vy: 0, life: 0.4, max: 0.4, col, ring: true, r0: r * 0.3, r1: r }); }

/* ── lifecycle ── */
function newRun() {
  Object.assign(base, { hp: 1000, hpMax: 1000, hitT: 0 });
  Object.assign(ship, { x: CX, y: CY + 150, vx: 0, vy: 0, ang: -Math.PI / 2, hp: 100, hpMax: 100, fireCd: 0, invuln: 0, hurtT: 0, boostT: 0, bank: 0 });
  Object.assign(P, { ess: 0, essTotal: 0, level: 1, xpNext: 8, dmg: 12, rate: 0.13, bspeed: 740, pierce: 0, multishot: 1, spread: 0.05, accel: 1500, maxSpd: 560, drag: 1.7, hullMul: 1, magnet: 1, lifesteal: 0, baseRegen: 0, mods: [] });
  enemies.length = pbul.length = ebul.length = orbs.length = parts.length = 0;
  boss = null; bossNum = 0; wave = 1; kills = 0;
  buildPorts();
  state = 'playing';
  startWave(1);
}

function buildPorts() {
  ports.length = 0;
  const r = Math.min(W, H) * 0.32, n = 5;
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU - Math.PI / 2; ports.push({ x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r, t: Math.random() * 3, ang: 0 }); }
}

/* ── waves ── */
function startWave(n) {
  wave = n; waveActive = true;
  const isBoss = n % 4 === 0;
  spawnQueue = [];
  if (isBoss) { spawnQueue.boss = true; bossNum = Math.ceil(n / 4); banner('WARLORD INBOUND', 'BOSS ' + bossNum, C.magenta); sfx('boss'); }
  else {
    const count = 4 + n * 2;
    const tiers = ['raider', 'dartling']; if (n >= 2) tiers.push('gunner'); if (n >= 3) tiers.push('raider');
    for (let i = 0; i < count; i++) spawnQueue.push(tiers[(Math.random() * tiers.length) | 0]);
    banner('WAVE ' + n, 'DEFEND THE SATELLITE', C.lime);
  }
  spawnT = 0.5;
}

const EDEF = {
  raider:   { hp: 24, accel: 460, maxSpd: 240, r: 15, dmg: 16, ess: 3, col: C.magenta, mode: 'ram' },
  dartling: { hp: 11, accel: 720, maxSpd: 380, r: 10, dmg: 10, ess: 2, col: C.orange, mode: 'kamikaze' },
  gunner:   { hp: 30, accel: 360, maxSpd: 200, r: 16, dmg: 8, ess: 4, col: C.red, mode: 'ranged' },
};
function spawnEnemy(key) {
  const d = EDEF[key];
  const a = Math.random() * TAU, R = Math.hypot(W, H) * 0.55;
  enemies.push({ key, def: d, x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R, vx: 0, vy: 0, ang: 0, hp: d.hp * waveScale(), hpMax: d.hp * waveScale(), fireCd: 1 + Math.random() * 1.5, hitT: 0, thr: 0 });
}
function waveScale() { return 1 + (wave - 1) * 0.14; }

function spawnBoss() {
  boss = {
    name: 'DREADNOUGHT PRIME', tag: 'the satellite-breaker', x: CX, y: -160, vx: 0, vy: 0,
    hp: 1400, hpMax: 1400, r: 64, hitT: 0, ang: 0, state: 'enter', stateT: 2, fcd: 0,
  };
}

function checkWaveEnd() {
  if (!waveActive) return;
  if (!spawnQueue.length && !spawnQueue.boss && !enemies.length && !boss) {
    waveActive = false;
    if (bossNum >= 1 && wave % 4 === 0) { gameOver(true, 'WARLORD DOWN'); return; }
    setTimeout(() => { if (state === 'playing') startWave(wave + 1); }, 1400);
    banner('WAVE CLEARED', 'STAND BY', C.cyan);
  }
}

/* ── firing ── */
function fire() {
  const baseA = ship.ang;
  const n = P.multishot;
  const nozX = ship.x + Math.cos(baseA) * 22, nozY = ship.y + Math.sin(baseA) * 22;
  for (let i = 0; i < n; i++) {
    const a = baseA + (n > 1 ? (i / (n - 1) - 0.5) * P.spread * 6 : (Math.random() - 0.5) * P.spread);
    pbul.push({ x: nozX, y: nozY, vx: Math.cos(a) * P.bspeed, vy: Math.sin(a) * P.bspeed, dmg: P.dmg, life: 0.8, pierce: P.pierce, hit: new Set() });
  }
  burst(nozX, nozY, C.cyan, 3, 60);
  shake += 0.012;                                       // barely-there muzzle kick (no jarring shake)
  sfx('pulse');
}

/* ── damage ── */
function hurtBase(n) {
  if (n <= 0) return;
  base.hp -= n; base.hitT = 0.25;
  if (base.hp <= 0) { base.hp = 0; gameOver(false, 'SATELLITE LOST'); }
}
function hurtShip(n) {
  if (state !== 'playing' || ship.invuln > 0) return;
  ship.hp -= n; ship.invuln = 0.6; ship.hurtT = 0.25; shake += 0.28; sfx('hurt');
  if (ship.hp <= 0) { ship.hp = 0; gameOver(false, 'HULL BREACH'); }
}
function killEnemy(e, idx) {
  enemies.splice(idx, 1);
  burst(e.x, e.y, e.def.col, 16, 220, true); ring(e.x, e.y, e.def.col, e.def.r + 18);
  sfx('boom'); shake += 0.12; kills++;
  for (let i = 0; i < e.def.ess; i++) orbs.push({ x: e.x + (Math.random() - 0.5) * 20, y: e.y + (Math.random() - 0.5) * 20, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80 });
}

/* ── essence / leveling ── */
function collectEssence() {
  P.ess += 1; P.essTotal += 1;
  if (P.lifesteal) ship.hp = clamp(ship.hp + P.lifesteal, 0, ship.hpMax);
  sfx('pickup');
  if (P.ess >= P.xpNext) levelUp();
}
function levelUp() {
  P.ess -= P.xpNext; P.level++; P.xpNext = Math.ceil(8 * Math.pow(1.5, P.level - 1));
  openCards();
}

/* ── upgrades ── */
const CARDS = [
  { id: 'dmg', ac: C.lime, t: 'OVERCHARGE', d: '+30% weapon damage.', f: () => P.dmg *= 1.3 },
  { id: 'rate', ac: C.lime, t: 'AUTOLOADER', d: '+25% fire rate. −8% damage.', f: () => { P.rate *= 0.75; P.dmg *= 0.92; } },
  { id: 'multi', ac: C.cyan, t: 'SPLIT BARREL', d: '+1 projectile. Wider spread.', f: () => { P.multishot += 1; P.spread += 0.04; } },
  { id: 'pierce', ac: C.cyan, t: 'AP SLUGS', d: 'Shots pierce +1 enemy.', f: () => P.pierce += 1 },
  { id: 'bspeed', ac: C.cyan, t: 'RAILED ROUNDS', d: '+35% projectile speed & range.', f: () => { P.bspeed *= 1.35; } },
  { id: 'speed', ac: C.orange, t: 'ION THRUSTERS', d: '+18% thrust & top speed.', f: () => { P.accel *= 1.18; P.maxSpd *= 1.18; } },
  { id: 'hull', ac: C.orange, t: 'REINFORCED HULL', d: '+35 max hull, repaired full.', f: () => { ship.hpMax += 35; ship.hp = ship.hpMax; } },
  { id: 'baserep', ac: C.orange, t: 'SATELLITE REPAIR', d: 'Repair satellite +250.', f: () => base.hp = clamp(base.hp + 250, 0, base.hpMax) },
  { id: 'baseregen', ac: C.lime, t: 'NANO-MENDERS', d: 'Satellite slowly self-repairs.', f: () => P.baseRegen += 8 },
  { id: 'magnet', ac: C.cyan, t: 'TRACTOR FIELD', d: '+80% essence pickup range.', f: () => P.magnet *= 1.8 },
  { id: 'steal', ac: C.magenta, t: 'SIPHON CORE', d: 'Each essence repairs +2 hull.', f: () => P.lifesteal += 2 },
  { id: 'glass', ac: C.magenta, t: 'GLASS REACTOR', d: '+55% damage. −25% max hull.', f: () => { P.dmg *= 1.55; ship.hpMax = Math.max(40, ship.hpMax * 0.75); ship.hp = Math.min(ship.hp, ship.hpMax); } },
];
function openCards() {
  state = 'levelup'; sfx('level');
  const pool = CARDS.filter(c => !(lastDraw && lastDraw.suppress && lastDraw.suppress.includes(c.id)));
  const pick = []; const used = new Set();
  while (pick.length < 3 && used.size < pool.length) { const c = pool[(Math.random() * pool.length) | 0]; if (!used.has(c.id)) { used.add(c.id); pick.push(c); } }
  lastDraw = { ids: pick.map(c => c.id) };
  $('cardsLv').textContent = 'LEVEL ' + P.level;
  const row = $('cardRow'); row.innerHTML = '';
  pick.forEach((c, i) => {
    const el = document.createElement('button'); el.className = 'card'; el.style.setProperty('--ac', c.ac);
    el.innerHTML = `<div class="ribbon"></div><div class="cbody"><div class="carch">UPGRADE</div><div class="ctitle">${c.t}</div><div class="cdesc">${c.d}</div></div><div class="cnum">0${i + 1}</div>`;
    el.onclick = () => chooseCard(c, pick);
    row.appendChild(el);
  });
  $('cards').classList.add('on');
}
function chooseCard(c, pick) {
  c.f(); if (!P.mods.includes(c.t)) P.mods.push(c.t);
  lastDraw = { suppress: pick.filter(x => x.id !== c.id).map(x => x.id) };
  $('cards').classList.remove('on'); state = 'playing'; updateHUD();
  if (P.ess >= P.xpNext) setTimeout(levelUp, 50);
}

/* ── game over ── */
function gameOver(win, title) {
  if (state === 'over') return; state = 'over'; firing = false;
  $('over').className = 'overlay on ' + (win ? 'win' : 'lose');
  $('overEyebrow').textContent = win ? 'SECTOR HELD' : 'RUN ENDED';
  $('overTitle').textContent = title;
  $('overWaves').textContent = wave; $('overKills').textContent = kills; $('overLvl').textContent = P.level;
  sfx(win ? 'win' : 'lose');
}

/* ── banner / hud ── */
let banTimer = null;
function banner(big, sub, col) {
  $('banT').textContent = big; $('banS').textContent = sub || ''; $('banT').style.color = col || C.lime;
  const b = $('banner'); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  if (banTimer) clearTimeout(banTimer); banTimer = setTimeout(() => b.classList.remove('show'), 2000);
}
const setBar = (id, f) => { $(id).style.transform = `scaleX(${clamp(f, 0, 1)})`; };
function updateHUD() {
  setBar('baseBar', base.hp / base.hpMax); $('baseTxt').textContent = `${Math.ceil(base.hp)}/${base.hpMax}`;
  setBar('hullBar', ship.hp / ship.hpMax); $('hullTxt').textContent = `${Math.ceil(ship.hp)}/${Math.round(ship.hpMax)}`;
  setBar('xpBar', P.ess / P.xpNext); $('xpTxt').textContent = `${P.ess}/${P.xpNext}`; $('lvlNum').textContent = P.level;
  $('essV').textContent = P.essTotal; $('lvlV').textContent = P.level; $('waveV').textContent = wave;
  const ml = $('modline'); ml.innerHTML = '';
  P.mods.slice(-5).forEach(m => { const s = document.createElement('span'); s.className = 'mpip'; s.textContent = m; ml.appendChild(s); });
  const bb = $('bossbar');
  if (boss) { bb.classList.add('on'); $('bossName').textContent = boss.name; $('bossTag').textContent = boss.tag; setBar('bossBar', boss.hp / boss.hpMax); }
  else bb.classList.remove('on');
}

/* ── step ── */
function step(dt) {
  base.ang += dt * 0.25;
  base.hitT = Math.max(0, base.hitT - dt);
  if (P.baseRegen) base.hp = clamp(base.hp + P.baseRegen * dt, 0, base.hpMax);

  // ── ship physics: thrust / drag / brake / boost (momentum) ──
  let tx = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  let ty = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  const td = Math.hypot(tx, ty); if (td > 0) { tx /= td; ty /= td; }
  ship.thrustX = tx; ship.thrustY = ty;
  const braking = !!keys['shift'];
  const boosting = !!keys[' '];
  const accel = P.accel * (boosting ? 1.7 : 1);
  ship.vx += tx * accel * dt; ship.vy += ty * accel * dt;
  const drag = braking ? 7 : P.drag;
  const df = 1 / (1 + drag * dt); ship.vx *= df; ship.vy *= df;
  const sp = Math.hypot(ship.vx, ship.vy), maxv = P.maxSpd * (boosting ? 1.5 : 1);
  if (sp > maxv) { ship.vx *= maxv / sp; ship.vy *= maxv / sp; }
  ship.x += ship.vx * dt; ship.y += ship.vy * dt;
  // soft arena bounds (bounce)
  const m = 30;
  if (ship.x < m) { ship.x = m; ship.vx = Math.abs(ship.vx) * 0.4; }
  if (ship.x > W - m) { ship.x = W - m; ship.vx = -Math.abs(ship.vx) * 0.4; }
  if (ship.y < m) { ship.y = m; ship.vy = Math.abs(ship.vy) * 0.4; }
  if (ship.y > H - m) { ship.y = H - m; ship.vy = -Math.abs(ship.vy) * 0.4; }
  // keep ship from sitting inside the satellite
  const dcx = ship.x - CX, dcy = ship.y - CY, dc = Math.hypot(dcx, dcy);
  if (dc < base.r + 16) { const push = (base.r + 16) / (dc || 1); ship.x = CX + dcx * push; ship.y = CY + dcy * push; }
  // aim + bank
  ship.ang = Math.atan2(my - ship.y, mx - ship.x);
  const cross = (ship.vx * Math.sin(ship.ang) - ship.vy * Math.cos(ship.ang)) / Math.max(120, P.maxSpd);
  ship.bank = lerpAng(ship.bank, clamp(cross, -0.5, 0.5), 0.12);
  ship.invuln = Math.max(0, ship.invuln - dt); ship.hurtT = Math.max(0, ship.hurtT - dt);

  // fire
  ship.fireCd -= dt;
  if (firing && ship.fireCd <= 0) { fire(); ship.fireCd = P.rate; }

  // ── spawning ──
  if (waveActive) {
    if (spawnQueue.boss && !enemies.length && !boss) { spawnBoss(); spawnQueue.boss = false; }
    else if (spawnQueue.length) { spawnT -= dt; if (spawnT <= 0) { spawnEnemy(spawnQueue.shift()); spawnT = Math.max(0.25, 0.9 - wave * 0.05); } }
  }

  // ── enemies (ship-like inertia) ──
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i], d = e.def;
    const toBaseX = CX - e.x, toBaseY = CY - e.y, distB = Math.hypot(toBaseX, toBaseY) || 1;
    const toShipX = ship.x - e.x, toShipY = ship.y - e.y, distS = Math.hypot(toShipX, toShipY) || 1;
    let dx, dy;
    if (d.mode === 'ranged') { // hold range from base, strafe
      const want = 240; const tgtX = CX, tgtY = CY; const dd = distB;
      const dirx = (e.x - tgtX) / dd, diry = (e.y - tgtY) / dd;
      if (dd < want) { dx = dirx; dy = diry; } else { dx = -dirx + (-diry) * 0.5; dy = -diry + dirx * 0.5; }
      e.fireCd -= dt; if (e.fireCd <= 0) { e.fireCd = 1.5; const a = Math.atan2(toBaseY, toBaseX); ebul.push({ x: e.x, y: e.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, dmg: d.dmg, life: 3, tgt: 'base' }); }
    } else { dx = toBaseX / distB; dy = toBaseY / distB; }
    // steering with momentum
    e.vx += dx * d.accel * dt; e.vy += dy * d.accel * dt;
    const edf = 1 / (1 + 1.4 * dt); e.vx *= edf; e.vy *= edf;
    const es = Math.hypot(e.vx, e.vy), emax = d.maxSpd * waveScale();
    if (es > emax) { e.vx *= emax / es; e.vy *= emax / es; }
    e.x += e.vx * dt; e.y += e.vy * dt;
    e.ang = Math.atan2(e.vy, e.vx); e.thr = (dx * e.vx + dy * e.vy) > 0 ? 1 : 0.3;
    e.hitT = Math.max(0, e.hitT - dt);
    // contact with base
    if (distB < base.r + d.r) { hurtBase(d.dmg * (d.mode === 'kamikaze' ? 4 : dt * 2.2)); if (d.mode === 'kamikaze') { burst(e.x, e.y, d.col, 14, 200, true); killEnemy(e, i); continue; } else { e.vx -= dx * 200; e.vy -= dy * 200; } }
    // contact with ship
    if (distS < 16 + d.r) hurtShip(d.dmg * dt * 2.4);
  }

  // ── boss handled by bossLogic() in the main loop ──

  // ── player bullets ──
  for (let i = pbul.length - 1; i >= 0; i--) {
    const b = pbul[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; let dead = b.life <= 0;
    for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if (b.hit.has(e)) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.def.r + 4) {
        e.hp -= b.dmg; e.hitT = 0.1; b.hit.add(e); burst(b.x, b.y, e.def.col, 3, 80);
        dmgNum(b.x, b.y, Math.round(b.dmg), '#fff');
        if (e.hp <= 0) killEnemy(e, j);
        if (b.hit.size > b.pierce) { dead = true; break; }
      }
    }
    if (!dead && boss && !b.hit.has('b') && Math.hypot(boss.x - b.x, boss.y - b.y) < boss.r) {
      boss.hp -= b.dmg; boss.hitT = 0.08; b.hit.add('b'); burst(b.x, b.y, C.magenta, 3, 80);
      dmgNum(b.x, b.y, Math.round(b.dmg), '#fff'); if (boss.hp <= 0) bossDie(); if (b.hit.size > b.pierce) dead = true;
    }
    if (dead) pbul.splice(i, 1);
  }
  // ── enemy bullets ──
  for (let i = ebul.length - 1; i >= 0; i--) {
    const b = ebul[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (Math.hypot(ship.x - b.x, ship.y - b.y) < 15) { hurtShip(b.dmg); ebul.splice(i, 1); continue; }
    if (Math.hypot(CX - b.x, CY - b.y) < base.r) { hurtBase(b.dmg); burst(b.x, b.y, C.orange, 4, 80); ebul.splice(i, 1); continue; }
    if (b.life <= 0) ebul.splice(i, 1);
  }

  // ── energy ports (passive essence) ──
  for (const pt of ports) { pt.t -= dt; pt.ang += dt; if (pt.t <= 0) { pt.t = 6; orbs.push({ x: pt.x, y: pt.y, vx: 0, vy: 0 }); burst(pt.x, pt.y, C.ess, 4, 50); } }

  // ── essence orbs (auto-collect, homing) ──
  const pickR = 150 * P.magnet;
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i]; const dx = ship.x - o.x, dy = ship.y - o.y, dd = Math.hypot(dx, dy) || 1;
    const pull = dd < pickR ? 900 : 220;   // always drift toward you; snap in range (auto-collect)
    o.vx += (dx / dd) * pull * dt; o.vy += (dy / dd) * pull * dt;
    o.vx *= 0.92; o.vy *= 0.92; o.x += o.vx * dt; o.y += o.vy * dt;
    if (dd < 18) { collectEssence(); orbs.splice(i, 1); }
  }

  // particles
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.ring) { /* expand */ } else { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.93; p.vy *= 0.93; } if (p.life <= 0) parts.splice(i, 1); }

  shake = Math.max(0, shake - dt * 2.2);
  checkWaveEnd();
  updateHUD();
}

function bossLogic(dt) {
  const b = boss; if (!b) return;
  b.hitT = Math.max(0, b.hitT - dt); b.ang += dt * 0.3;
  if (b.state === 'enter') { b.y += (CY - 180 - b.y) * Math.min(1, dt * 1.2); if (Math.abs(b.y - (CY - 180)) < 4) { b.state = 'fight'; b.stateT = 2; } return; }
  // drift slowly toward satellite
  const dx = CX - b.x, dy = CY - b.y, dd = Math.hypot(dx, dy) || 1;
  if (dd > 200) { b.x += (dx / dd) * 26 * dt; b.y += (dy / dd) * 26 * dt; } else hurtBase(34 * dt);
  // lateral sway
  b.x += Math.sin(t * 0.8) * 28 * dt;
  b.stateT -= dt; b.fcd -= dt;
  if (b.stateT <= 0) { b.state = ['ring', 'aimed', 'aimed'][(Math.random() * 3) | 0]; b.stateT = 2.4; if (b.state === 'ring') bossRing(); }
  if (b.state === 'aimed' && b.fcd <= 0) {
    b.fcd = 0.5; const a = Math.atan2(ship.y - b.y, ship.x - b.x);
    for (let k = -1; k <= 1; k++) { const aa = a + k * 0.2; ebul.push({ x: b.x, y: b.y, vx: Math.cos(aa) * 320, vy: Math.sin(aa) * 320, dmg: 12, life: 4 }); }
  }
  // contact with ship
  if (Math.hypot(ship.x - b.x, ship.y - b.y) < b.r + 14) hurtShip(28 * dt * 60 * 0 + 18 * dt);
}
function bossRing() { const n = 26; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; ebul.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210, dmg: 10, life: 5 }); } sfx('boss'); shake += 0.3; }
function bossDie() { burst(boss.x, boss.y, C.magenta, 60, 320, true); ring(boss.x, boss.y, C.magenta, 200); shake += 1; sfx('win'); for (let i = 0; i < 40; i++) orbs.push({ x: boss.x + (Math.random() - 0.5) * 60, y: boss.y + (Math.random() - 0.5) * 60, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120 }); boss = null; banner('WARLORD DOWN', 'SECTOR SECURE', C.lime); }

/* ── drawing ── */
function drawStars() {
  for (const s of stars) { const x = s.x * W, y = s.y * H; ctx.globalAlpha = s.z; ctx.fillStyle = C.star; ctx.fillRect(x, y, s.s, s.s); }
  ctx.globalAlpha = 1;
  // faint nebula glow at center
  const g = ctx.createRadialGradient(CX, CY, 20, CX, CY, Math.min(W, H) * 0.5);
  g.addColorStop(0, 'rgba(57,120,160,0.10)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function drawBase() {
  ctx.save(); ctx.translate(CX, CY);
  // shield ring
  const lowHp = base.hp / base.hpMax < 0.34;
  const sc = base.hitT > 0 ? '#fff' : (lowHp ? C.orange : C.cyan);
  ctx.save(); ctx.rotate(-base.ang * 0.6); ctx.strokeStyle = sc; ctx.globalAlpha = 0.5 + (base.hitT > 0 ? 0.5 : 0); ctx.lineWidth = 2; ctx.shadowColor = sc; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(0, 0, base.r + 14, 0, TAU); ctx.stroke(); ctx.restore();
  // solar panel wings
  ctx.rotate(base.ang);
  ctx.fillStyle = '#16243a'; ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) { ctx.save(); ctx.fillRect(s * 30, -10, s * 42, 20); ctx.strokeRect(s * 30, -10, s * 42, 20);
    ctx.strokeStyle = 'rgba(127,168,255,.5)'; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(s * (30 + k * 10.5), -10); ctx.lineTo(s * (30 + k * 10.5), 10); ctx.stroke(); } ctx.restore(); }
  // hull (hex)
  ctx.rotate(-base.ang * 2);
  ctx.fillStyle = lowHp ? '#3a1b10' : '#1b2740'; ctx.strokeStyle = lowHp ? C.orange : C.cyan; ctx.lineWidth = 2.5;
  ctx.shadowColor = lowHp ? C.orange : C.cyan; ctx.shadowBlur = 14;
  ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; const x = Math.cos(a) * base.r, y = Math.sin(a) * base.r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
  // core
  glowCircle(0, 0, base.r * 0.34, lowHp ? C.orange : C.lime, 22);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, base.r * 0.16, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawPort(pt) {
  ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.ang);
  ctx.strokeStyle = C.ess; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.shadowColor = C.ess; ctx.shadowBlur = 10;
  ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; const x = Math.cos(a) * 13, y = Math.sin(a) * 13; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
  ctx.globalAlpha = 1; glowCircle(0, 0, 4 + Math.sin(t * 4 + pt.x) * 1.2, C.ess, 12);
  ctx.restore();
}
function drawShip() {
  ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.ang);
  ctx.scale(1, 1 - Math.abs(ship.bank) * 0.5); ctx.rotate(ship.bank * 0.4);
  // thruster flames (opposite thrust)
  const thrMag = Math.hypot(ship.thrustX, ship.thrustY);
  if (thrMag > 0.1) {
    const fa = Math.atan2(ship.thrustY, ship.thrustX) - ship.ang + Math.PI;  // local
    const fl = 10 + Math.random() * 8 + (keys[' '] ? 14 : 0);
    ctx.save(); ctx.rotate(fa); ctx.fillStyle = keys[' '] ? C.cyan : C.orange; ctx.shadowColor = C.orange; ctx.shadowBlur = 14; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(10 + fl, 0); ctx.lineTo(10, 5); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const flash = ship.hurtT > 0 && (Math.floor(t * 30) % 2 === 0);
  // hull
  ctx.fillStyle = flash ? '#fff' : '#1a2030'; ctx.strokeStyle = flash ? '#fff' : C.cyan; ctx.lineWidth = 2; ctx.shadowColor = C.cyan; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(2, -9); ctx.lineTo(-12, -12); ctx.lineTo(-8, -4); ctx.lineTo(-14, 0); ctx.lineTo(-8, 4); ctx.lineTo(-12, 12); ctx.lineTo(2, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
  // wing accents
  ctx.strokeStyle = C.lime; ctx.lineWidth = 1.5; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(0, -6); ctx.moveTo(-10, 10); ctx.lineTo(0, 6); ctx.stroke();
  // cockpit
  glowCircle(4, 0, 3.4, C.lime, 10);
  // engine nozzles
  ctx.fillStyle = C.orange; ctx.shadowColor = C.orange; ctx.shadowBlur = 8; ctx.fillRect(-15, -5, 3, 3); ctx.fillRect(-15, 2, 3, 3);
  ctx.restore();
}
function drawEnemy(e) {
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
  // thruster
  if (e.thr > 0.5) { ctx.save(); ctx.fillStyle = e.def.col; ctx.globalAlpha = 0.7; ctx.shadowColor = e.def.col; ctx.shadowBlur = 10; const fl = 8 + Math.random() * 6; ctx.beginPath(); ctx.moveTo(-e.def.r, -3); ctx.lineTo(-e.def.r - fl, 0); ctx.lineTo(-e.def.r, 3); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const flash = e.hitT > 0;
  ctx.fillStyle = flash ? '#fff' : '#20131a'; ctx.strokeStyle = flash ? '#fff' : e.def.col; ctx.lineWidth = 2; ctx.shadowColor = e.def.col; ctx.shadowBlur = 9;
  const r = e.def.r;
  ctx.beginPath();
  if (e.key === 'dartling') { ctx.moveTo(r, 0); ctx.lineTo(-r * 0.7, -r * 0.7); ctx.lineTo(-r * 0.4, 0); ctx.lineTo(-r * 0.7, r * 0.7); }
  else if (e.key === 'gunner') { ctx.moveTo(r, -r * 0.4); ctx.lineTo(r, r * 0.4); ctx.lineTo(-r * 0.6, r); ctx.lineTo(-r, 0); ctx.lineTo(-r * 0.6, -r); }
  else { ctx.moveTo(r, 0); ctx.lineTo(0, -r); ctx.lineTo(-r, -r * 0.5); ctx.lineTo(-r * 0.6, 0); ctx.lineTo(-r, r * 0.5); ctx.lineTo(0, r); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  glowCircle(0, 0, r * 0.28, e.def.col, 8);
  ctx.restore();
}
function drawBoss() {
  const b = boss; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang);
  ctx.strokeStyle = C.magenta; ctx.globalAlpha = 0.4; ctx.lineWidth = 2; ctx.shadowColor = C.magenta; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(0, 0, b.r + 12, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  const flash = b.hitT > 0;
  ctx.fillStyle = flash ? '#fff' : '#2a1018'; ctx.strokeStyle = flash ? '#fff' : C.magenta; ctx.lineWidth = 3; ctx.shadowColor = C.magenta; ctx.shadowBlur = 16;
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; const rr = i % 2 ? b.r * 0.7 : b.r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
  glowCircle(0, 0, b.r * 0.4, C.red, 26); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, b.r * 0.18, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawCursor() {
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.shadowColor = C.cyan; ctx.shadowBlur = 6; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx - 14, my); ctx.lineTo(mx - 5, my); ctx.moveTo(mx + 5, my); ctx.lineTo(mx + 14, my); ctx.moveTo(mx, my - 14); ctx.lineTo(mx, my - 5); ctx.moveTo(mx, my + 5); ctx.lineTo(mx, my + 14); ctx.stroke();
  ctx.restore();
}

function draw() {
  let shx = 0, shy = 0; if (shake > 0.001) { shx = (Math.random() - 0.5) * shake * 26; shy = (Math.random() - 0.5) * shake * 26; }
  ctx.save(); ctx.translate(shx, shy);
  ctx.fillStyle = C.bg; ctx.fillRect(-shx, -shy, W, H);
  drawStars();
  for (const pt of ports) drawPort(pt);
  // essence orbs
  for (const o of orbs) glowCircle(o.x, o.y, 3.2, C.ess, 8);
  drawBase();
  for (const e of enemies) drawEnemy(e);
  if (boss) drawBoss();
  // bullets
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of pbul) { ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.shadowColor = C.lime; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 0.012, b.y - b.vy * 0.012); ctx.stroke(); }
  for (const b of ebul) glowCircle(b.x, b.y, 3.4, b.tgt === 'base' ? C.orange : C.magenta, 9);
  for (const p of parts) {
    if (p.ring) { const k = 1 - p.life / p.max; ctx.strokeStyle = p.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * k, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    else { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.r, p.r); ctx.globalAlpha = 1; }
  }
  ctx.restore();
  if (state === 'playing') drawShip();
  ctx.restore();
  drawCursor();
}

/* ── loop ── */
let lastT = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; t += dt;
  if (state === 'playing') { step(dt); if (boss) bossLogic(dt); }
  draw();
}
requestAnimationFrame(loop);

/* ── boot ── */
$('loading').style.display = 'none';
$('startBtn').onclick = () => { $('title').classList.remove('on'); newRun(); };
$('retryBtn').onclick = () => { $('over').classList.remove('on'); newRun(); };
$('muteBtn').onclick = () => { setMuted(!isMuted()); $('muteBtn').textContent = isMuted() ? '♪ SOUND OFF' : '♪ SOUND ON'; };

window.__M = {
  get state() { return state; }, get wave() { return wave; }, get enemies() { return enemies.length; },
  get base() { return Math.round(base.hp); }, get hull() { return Math.round(ship.hp); },
  get lvl() { return P.level; }, get ess() { return `${P.ess}/${P.xpNext}`; }, get boss() { return boss ? Math.round(boss.hp) : null; },
  get shipv() { return [Math.round(ship.vx), Math.round(ship.vy)]; },
  press(k, v = true) { keys[k] = v; }, aim(x, y) { mx = x; my = y; }, fire(v = true) { firing = v; },
  bossTest() { enemies.length = 0; wave = 3; startWave(4); },
  sim(secs) { const n = Math.round(secs / 0.016); for (let i = 0; i < n; i++) { if (state === 'playing') { step(0.016); if (boss) bossLogic(0.016); } t += 0.016; } return 'simmed'; },
};
