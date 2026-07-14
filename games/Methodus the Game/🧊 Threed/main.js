// METHODUS — 3D orbital defense. Far top-down view, bloom-lit neon (Marathon
// art direction). A floating satellite at center; you fly a strike craft with
// real momentum. Raider ships burn in to wreck it. Kill, drink essence, level,
// upgrade, survive to the first warlord (boss 1).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { sfx, setMuted, isMuted } from './audio.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;
const lerpAng = (a, b, t) => { let d = ((b - a + Math.PI * 3) % TAU) - Math.PI; return a + d * t; };

/* ── palette ── */
const COL = { lime: 0xc8f02a, orange: 0xff5a1f, cyan: 0x39d7e6, magenta: 0xe0447c, blue: 0x7fa8ff, red: 0xff4d5e, ess: 0xb6ff5a, bone: 0xe9e7dd, steel: 0x3a4350 };
const css = h => '#' + h.toString(16).padStart(6, '0');
const ARENA = 60;

/* ── renderer / scene / camera / bloom ── */
const cvs = $('game');
const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070c);
scene.fog = new THREE.FogExp2(0x05070c, 0.0042);

const camera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
camera.position.set(0, 232, 72);            // far, high, slight tilt — top-down x4
camera.lookAt(0, 0, 0);

let composer, bloom, W = 0, H = 0;
function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  if (!composer) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.85, 0.5, 0.82);
    composer.addPass(bloom);
  }
  composer.setSize(W, H); bloom.setSize(W, H);
}
addEventListener('resize', resize); resize();

/* ── lights ── */
scene.add(new THREE.AmbientLight(0x2a3950, 0.7));
const key = new THREE.DirectionalLight(0xbfe0ff, 0.9); key.position.set(30, 80, 40); scene.add(key);
const fillL = new THREE.DirectionalLight(0xff7a3a, 0.25); fillL.position.set(-40, 30, -30); scene.add(fillL);

/* ── materials ── */
const emat = (c, i = 1.1, rough = 0.4) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: rough, metalness: 0.2, flatShading: true });
const hullMat = (c = 0x10151f) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.6, flatShading: true });

/* ── starfield + grid ── */
(function buildStars() {
  const g = new THREE.BufferGeometry(); const n = 1200, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = 200 + Math.random() * 500, a = Math.random() * TAU, e = (Math.random() - 0.5) * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = -120 + Math.random() * 360; pos[i * 3 + 2] = Math.sin(a) * r; }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfd4ff, size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0.85 })));
})();
(function buildGrid() {
  const grid = new THREE.GridHelper(ARENA * 3, 36, 0x16314a, 0x0e1c2c);
  grid.material.transparent = true; grid.material.opacity = 0.35; grid.position.y = -0.5; scene.add(grid);
  // arena boundary ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(ARENA, 0.25, 8, 80), emat(COL.orange, 0.8));
  ring.rotation.x = Math.PI / 2; ring.position.y = -0.3; scene.add(ring);
})();

/* ── state ── */
let state = 'title', t = 0, shake = 0, wave = 1, kills = 0;
const base = { hp: 1000, hpMax: 1000, hitT: 0, group: null, r: 8 };
const ship = { obj: null, yaw: null, tilt: null, x: 0, z: 0, vx: 0, vz: 0, ang: 0, hp: 100, hpMax: 100, fireCd: 0, invuln: 0, hurtT: 0, thrX: 0, thrZ: 0, bank: 0, flame: null, r: 2.6 };
const P = { ess: 0, essTotal: 0, level: 1, xpNext: 8, dmg: 12, rate: 0.13, bspeed: 100, pierce: 0, multishot: 1, spread: 0.05, accel: 130, maxSpd: 42, drag: 1.7, magnet: 1, lifesteal: 0, baseRegen: 0, mods: [] };
const enemies = [], pbul = [], ebul = [], orbs = [], parts = [], ports = [];
let boss = null, bossNum = 0, spawnQueue = [], spawnT = 0, waveActive = false, lastDraw = null;

/* ── aim plane / input ── */
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitPt = new THREE.Vector3();
let aimX = 0, aimZ = -1, firing = false;
const keys = {};
addEventListener('keydown', e => { const k = e.key.toLowerCase(); keys[k] = true; if (k === ' ') e.preventDefault(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('pointermove', e => {
  ndc.x = (e.clientX / W) * 2 - 1; ndc.y = -(e.clientY / H) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  if (ray.ray.intersectPlane(groundPlane, hitPt)) {
    const dx = hitPt.x - ship.x, dz = hitPt.z - ship.z, d = Math.hypot(dx, dz);
    if (d > 0.5) { aimX = dx / d; aimZ = dz / d; }
    reticle.position.set(hitPt.x, 0.1, hitPt.z);
  }
});
cvs.addEventListener('pointerdown', () => { if (state === 'playing') firing = true; });
addEventListener('pointerup', () => { firing = false; });

/* aim reticle */
const reticle = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.18, 6, 24), emat(COL.cyan, 1.4));
reticle.rotation.x = Math.PI / 2; scene.add(reticle);

/* ── builders ── */
function buildBase() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(base.r, base.r + 1.4, 2.4, 6), hullMat(0x18243a)); hull.position.y = 1.2; g.add(hull);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(base.r * 0.5, 1), emat(COL.lime, 1.4)); core.position.y = 3.2; g.add(core); g.userData.core = core;
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(base.r * 1.05, 0.28, 8, 40), emat(COL.cyan, 0.9)); ring1.position.y = 3; ring1.rotation.x = Math.PI / 2.3; g.add(ring1); g.userData.ring1 = ring1;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(base.r * 1.4, 0.18, 8, 40), emat(COL.orange, 0.8)); ring2.position.y = 3; ring2.rotation.x = Math.PI / 1.6; g.add(ring2); g.userData.ring2 = ring2;
  for (const s of [-1, 1]) { const panel = new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x14304a, emissive: COL.blue, emissiveIntensity: 0.25, roughness: 0.4, metalness: 0.5 })); panel.position.set(s * (base.r + 4), 2.4, 0); g.add(panel); }
  const glow = new THREE.PointLight(COL.lime, 60, 40); glow.position.y = 3.4; g.add(glow); g.userData.glow = glow;
  // shield bubble
  const sh = new THREE.Mesh(new THREE.SphereGeometry(base.r * 1.7, 18, 12), new THREE.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0, wireframe: true })); sh.position.y = 2.6; g.add(sh); g.userData.shield = sh;
  scene.add(g); base.group = g;
}

function buildShip() {
  const root = new THREE.Group();
  const yaw = new THREE.Group(); root.add(yaw);
  const tilt = new THREE.Group(); yaw.add(tilt);
  // sleek craft, nose +Z
  const fuse = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.6, 4), hullMat(0x1a2333)); fuse.rotation.x = Math.PI / 2; fuse.scale.set(0.7, 1, 1); tilt.add(fuse);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 2.2), hullMat(0x141b28)); body.position.z = -0.4; tilt.add(body);
  for (const s of [-1, 1]) { const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 1.5), hullMat(0x1a2333)); wing.position.set(s * 1.5, 0, -0.6); wing.rotation.y = s * 0.4; tilt.add(wing);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.9), emat(COL.lime, 1.0)); tip.position.set(s * 2.4, 0, -0.8); tilt.add(tip); }
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), emat(COL.cyan, 1.2)); cockpit.position.set(0, 0.4, 0.7); tilt.add(cockpit);
  // engine flame (emissive cone, scales with thrust)
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 8), new THREE.MeshBasicMaterial({ color: COL.orange, transparent: true, opacity: 0.9 }));
  flame.rotation.x = -Math.PI / 2; flame.position.z = -2.1; tilt.add(flame);
  const eLight = new THREE.PointLight(COL.cyan, 12, 14); eLight.position.y = 1; tilt.add(eLight);
  scene.add(root);
  ship.obj = root; ship.yaw = yaw; ship.tilt = tilt; ship.flame = flame;
}

function buildPorts() {
  for (const p of ports) scene.remove(p.obj); ports.length = 0;
  const r = ARENA * 0.62, n = 5;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU - Math.PI / 2;
    const g = new THREE.Group();
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), emat(COL.ess, 1.1)); node.position.y = 2; g.add(node);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 6, 24), emat(COL.ess, 0.7)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.4; g.add(ring);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 6), hullMat(0x1a2333)); post.position.y = 1; g.add(post);
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(g);
    ports.push({ obj: g, node, x: g.position.x, z: g.position.z, t: Math.random() * 4, a: 0 });
  }
}

const EDEF = {
  raider:   { hp: 24, accel: 44, maxSpd: 23, r: 2.2, dmg: 16, ess: 3, col: COL.magenta, mode: 'ram' },
  dartling: { hp: 11, accel: 72, maxSpd: 36, r: 1.5, dmg: 10, ess: 2, col: COL.orange, mode: 'kamikaze' },
  gunner:   { hp: 30, accel: 34, maxSpd: 18, r: 2.4, dmg: 8, ess: 4, col: COL.red, mode: 'ranged' },
};
function enemyMesh(key, d) {
  const g = new THREE.Group(); const yaw = new THREE.Group(); g.add(yaw);
  const m = hullMat(0x1a0f18);
  let body;
  if (key === 'dartling') { body = new THREE.Mesh(new THREE.ConeGeometry(d.r * 0.8, d.r * 2.4, 4), m); body.rotation.x = Math.PI / 2; }
  else if (key === 'gunner') { body = new THREE.Mesh(new THREE.BoxGeometry(d.r * 1.6, 0.7, d.r * 2), m); }
  else { body = new THREE.Mesh(new THREE.OctahedronGeometry(d.r, 0), m); body.scale.set(1, 0.6, 1.4); }
  body.position.y = 1; yaw.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(d.r * 0.34, 8, 8), emat(d.col, 1.3)); eye.position.set(0, 1.1, d.r * 0.6); yaw.add(eye);
  for (const s of [-1, 1]) { const fin = new THREE.Mesh(new THREE.BoxGeometry(d.r * 1.4, 0.2, 0.5), emat(d.col, 0.7)); fin.position.set(s * d.r * 0.6, 1, -d.r * 0.4); yaw.add(fin); }
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 6), new THREE.MeshBasicMaterial({ color: d.col, transparent: true, opacity: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 1, -d.r * 1.3); yaw.add(fl);
  scene.add(g); return { g, yaw, body, flame: fl };
}

/* ── lifecycle ── */
function newRun() {
  if (!base.group) buildBase();
  if (!ship.obj) buildShip();
  Object.assign(base, { hp: 1000, hpMax: 1000, hitT: 0 });
  Object.assign(ship, { x: 0, z: 24, vx: 0, vz: 0, ang: Math.PI, hp: 100, hpMax: 100, fireCd: 0, invuln: 0, hurtT: 0, bank: 0 });
  Object.assign(P, { ess: 0, essTotal: 0, level: 1, xpNext: 8, dmg: 12, rate: 0.13, bspeed: 100, pierce: 0, multishot: 1, spread: 0.05, accel: 130, maxSpd: 42, drag: 1.7, magnet: 1, lifesteal: 0, baseRegen: 0, mods: [] });
  for (const e of enemies) scene.remove(e.m.g); enemies.length = 0;
  for (const b of pbul) scene.remove(b.m); pbul.length = 0;
  for (const b of ebul) scene.remove(b.m); ebul.length = 0;
  for (const o of orbs) scene.remove(o.m); orbs.length = 0;
  for (const p of parts) scene.remove(p.m); parts.length = 0;
  if (boss) { scene.remove(boss.g); boss = null; }
  bossNum = 0; wave = 1; kills = 0;
  buildPorts();
  state = 'playing'; startWave(1);
}

/* ── waves ── */
function startWave(n) {
  wave = n; waveActive = true; spawnQueue = [];
  if (n % 4 === 0) { spawnQueue.boss = true; bossNum = Math.ceil(n / 4); banner('WARLORD INBOUND', 'BOSS ' + bossNum, css(COL.magenta)); sfx('boss'); }
  else {
    const count = 4 + n * 2;
    const tiers = ['raider', 'dartling']; if (n >= 2) tiers.push('gunner'); if (n >= 3) tiers.push('raider');
    for (let i = 0; i < count; i++) spawnQueue.push(tiers[(Math.random() * tiers.length) | 0]);
    banner('WAVE ' + n, 'DEFEND THE SATELLITE', css(COL.lime));
  }
  spawnT = 0.5;
}
function waveScale() { return 1 + (wave - 1) * 0.14; }
function spawnEnemy(key) {
  const d = EDEF[key], a = Math.random() * TAU, R = ARENA + 6;
  enemies.push({ key, def: d, m: enemyMesh(key, d), x: Math.cos(a) * R, z: Math.sin(a) * R, vx: 0, vz: 0, ang: 0, hp: d.hp * waveScale(), hpMax: d.hp * waveScale(), fireCd: 1 + Math.random(), hitT: 0 });
}
function spawnBoss() {
  const g = new THREE.Group(); const m = hullMat(0x2a0f18);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 1), m); core.position.y = 4; g.add(core);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), emat(COL.red, 1.4)); eye.position.set(0, 4.4, 9); g.add(eye);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(11, 0.7, 8, 30), emat(COL.magenta, 0.9)); ring.position.y = 4; ring.rotation.x = Math.PI / 2; g.add(ring);
  const lt = new THREE.PointLight(COL.magenta, 80, 60); lt.position.y = 5; g.add(lt);
  g.position.set(0, 0, -ARENA); scene.add(g);
  boss = { name: 'DREADNOUGHT PRIME', tag: 'the satellite-breaker', g, core, ring, eye, x: 0, z: -ARENA, hp: 1400, hpMax: 1400, r: 11, hitT: 0, state: 'enter', stateT: 2, fcd: 0 };
}
function checkWaveEnd() {
  if (!waveActive) return;
  if (!spawnQueue.length && !spawnQueue.boss && !enemies.length && !boss) {
    waveActive = false;
    if (wave % 4 === 0) { gameOver(true, 'WARLORD DOWN'); return; }
    banner('WAVE CLEARED', 'STAND BY', css(COL.cyan));
    setTimeout(() => { if (state === 'playing') startWave(wave + 1); }, 1400);
  }
}

/* ── fx ── */
function burst(x, z, color, n, spd, big) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, e = (Math.random() - 0.5), s = Math.random() * spd;
    const m = new THREE.Mesh(new THREE.BoxGeometry(big ? 0.6 : 0.4, big ? 0.6 : 0.4, big ? 0.6 : 0.4), new THREE.MeshBasicMaterial({ color }));
    m.position.set(x, 1.5, z); scene.add(m);
    parts.push({ m, vx: Math.cos(a) * s, vy: e * s * 0.5 + 2, vz: Math.sin(a) * s, life: 0.4 + Math.random() * 0.5, max: 0.9 });
  }
}
function shockring(x, z, color, r) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r * 0.3, 0.4, 6, 30), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  m.rotation.x = Math.PI / 2; m.position.set(x, 1, z); scene.add(m);
  parts.push({ m, ring: true, r0: r * 0.3, r1: r, life: 0.5, max: 0.5 });
}
const _pv = new THREE.Vector3();
function dmgNum(x, y, z, txt, color, big) {
  _pv.set(x, y, z).project(camera); if (_pv.z > 1) return;
  const sx = (_pv.x * 0.5 + 0.5) * W, sy = (-_pv.y * 0.5 + 0.5) * H;
  const el = document.createElement('div'); el.className = 'dmg' + (big ? ' big' : ''); el.textContent = txt; el.style.color = color; $('fxLayer').appendChild(el);
  let life = 0.8; const tick = () => { life -= 0.016; if (life <= 0) { el.remove(); return; } el.style.transform = `translate(${sx}px,${sy - (0.8 - life) * 40}px)`; el.style.opacity = life / 0.8; requestAnimationFrame(tick); };
  el.style.transform = `translate(${sx}px,${sy}px)`; requestAnimationFrame(tick);
}

/* ── fire ── */
function fire() {
  const n = P.multishot, ba = ship.ang;
  const nx = ship.x + aimX * 3, nz = ship.z + aimZ * 3;
  for (let i = 0; i < n; i++) {
    const a = ba + (n > 1 ? (i / (n - 1) - 0.5) * P.spread * 6 : (Math.random() - 0.5) * P.spread);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 2.2), new THREE.MeshBasicMaterial({ color: COL.lime }));
    m.position.set(nx, 1.6, nz); m.rotation.y = Math.atan2(Math.sin(a), Math.cos(a));
    scene.add(m);
    pbul.push({ m, vx: Math.cos(a) * P.bspeed, vz: Math.sin(a) * P.bspeed, dmg: P.dmg, life: 0.9, pierce: P.pierce, hit: new Set() });
  }
  shake += 0.01; sfx('pulse');
}

/* ── damage ── */
function hurtBase(n) { if (n <= 0) return; base.hp -= n; base.hitT = 0.25; if (base.hp <= 0) { base.hp = 0; gameOver(false, 'SATELLITE LOST'); } }
function hurtShip(n) { if (state !== 'playing' || ship.invuln > 0) return; ship.hp -= n; ship.invuln = 0.6; ship.hurtT = 0.25; shake += 0.25; sfx('hurt'); if (ship.hp <= 0) { ship.hp = 0; gameOver(false, 'HULL BREACH'); } }
function killEnemy(e, idx) {
  enemies.splice(idx, 1); scene.remove(e.m.g);
  burst(e.x, e.z, e.def.col, 16, 22, true); shockring(e.x, e.z, e.def.col, e.def.r + 4); sfx('boom'); shake += 0.1; kills++;
  for (let i = 0; i < e.def.ess; i++) orbs.push(makeOrb(e.x + (Math.random() - 0.5) * 3, e.z + (Math.random() - 0.5) * 3));
}
function makeOrb(x, z) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), emat(COL.ess, 1.3)); m.position.set(x, 1.5, z); scene.add(m); return { m, x, z, vx: (Math.random() - 0.5) * 10, vz: (Math.random() - 0.5) * 10 }; }

/* ── essence / leveling ── */
function collectEssence() { P.ess++; P.essTotal++; if (P.lifesteal) ship.hp = clamp(ship.hp + P.lifesteal, 0, ship.hpMax); sfx('pickup'); if (P.ess >= P.xpNext) levelUp(); }
function levelUp() { P.ess -= P.xpNext; P.level++; P.xpNext = Math.ceil(8 * Math.pow(1.5, P.level - 1)); openCards(); }

/* ── upgrades ── */
const CARDS = [
  { id: 'dmg', ac: css(COL.lime), t: 'OVERCHARGE', d: '+30% weapon damage.', f: () => P.dmg *= 1.3 },
  { id: 'rate', ac: css(COL.lime), t: 'AUTOLOADER', d: '+25% fire rate. −8% damage.', f: () => { P.rate *= 0.75; P.dmg *= 0.92; } },
  { id: 'multi', ac: css(COL.cyan), t: 'SPLIT BARREL', d: '+1 projectile. Wider spread.', f: () => { P.multishot += 1; P.spread += 0.04; } },
  { id: 'pierce', ac: css(COL.cyan), t: 'AP SLUGS', d: 'Shots pierce +1 enemy.', f: () => P.pierce += 1 },
  { id: 'bspeed', ac: css(COL.cyan), t: 'RAILED ROUNDS', d: '+35% projectile speed & range.', f: () => P.bspeed *= 1.35 },
  { id: 'speed', ac: css(COL.orange), t: 'ION THRUSTERS', d: '+18% thrust & top speed.', f: () => { P.accel *= 1.18; P.maxSpd *= 1.18; } },
  { id: 'hull', ac: css(COL.orange), t: 'REINFORCED HULL', d: '+35 max hull, repaired full.', f: () => { ship.hpMax += 35; ship.hp = ship.hpMax; } },
  { id: 'baserep', ac: css(COL.orange), t: 'SATELLITE REPAIR', d: 'Repair satellite +250.', f: () => base.hp = clamp(base.hp + 250, 0, base.hpMax) },
  { id: 'baseregen', ac: css(COL.lime), t: 'NANO-MENDERS', d: 'Satellite slowly self-repairs.', f: () => P.baseRegen += 8 },
  { id: 'magnet', ac: css(COL.cyan), t: 'TRACTOR FIELD', d: '+80% essence pickup range.', f: () => P.magnet *= 1.8 },
  { id: 'steal', ac: css(COL.magenta), t: 'SIPHON CORE', d: 'Each essence repairs +2 hull.', f: () => P.lifesteal += 2 },
  { id: 'glass', ac: css(COL.magenta), t: 'GLASS REACTOR', d: '+55% damage. −25% max hull.', f: () => { P.dmg *= 1.55; ship.hpMax = Math.max(40, ship.hpMax * 0.75); ship.hp = Math.min(ship.hp, ship.hpMax); } },
];
function openCards() {
  state = 'levelup'; firing = false; sfx('level');
  const pool = CARDS.filter(c => !(lastDraw && lastDraw.suppress && lastDraw.suppress.includes(c.id)));
  const pick = [], used = new Set();
  while (pick.length < 3 && used.size < pool.length) { const c = pool[(Math.random() * pool.length) | 0]; if (!used.has(c.id)) { used.add(c.id); pick.push(c); } }
  $('cardsLv').textContent = 'LEVEL ' + P.level;
  const row = $('cardRow'); row.innerHTML = '';
  pick.forEach((c, i) => { const el = document.createElement('button'); el.className = 'card'; el.style.setProperty('--ac', c.ac);
    el.innerHTML = `<div class="ribbon"></div><div class="cbody"><div class="carch">UPGRADE</div><div class="ctitle">${c.t}</div><div class="cdesc">${c.d}</div></div><div class="cnum">0${i + 1}</div>`;
    el.onclick = () => chooseCard(c, pick); row.appendChild(el); });
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
function banner(big, sub, col) { $('banT').textContent = big; $('banS').textContent = sub || ''; $('banT').style.color = col || css(COL.lime);
  const b = $('banner'); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); if (banTimer) clearTimeout(banTimer); banTimer = setTimeout(() => b.classList.remove('show'), 2000); }
const setBar = (id, f) => { $(id).style.transform = `scaleX(${clamp(f, 0, 1)})`; };
function updateHUD() {
  setBar('baseBar', base.hp / base.hpMax); $('baseTxt').textContent = `${Math.ceil(base.hp)}/${base.hpMax}`;
  setBar('hullBar', ship.hp / ship.hpMax); $('hullTxt').textContent = `${Math.ceil(ship.hp)}/${Math.round(ship.hpMax)}`;
  setBar('xpBar', P.ess / P.xpNext); $('xpTxt').textContent = `${P.ess}/${P.xpNext}`; $('lvlNum').textContent = P.level;
  $('essV').textContent = P.essTotal; $('lvlV').textContent = P.level; $('waveV').textContent = wave;
  const ml = $('modline'); ml.innerHTML = ''; P.mods.slice(-5).forEach(m => { const s = document.createElement('span'); s.className = 'mpip'; s.textContent = m; ml.appendChild(s); });
  const bb = $('bossbar'); if (boss) { bb.classList.add('on'); $('bossName').textContent = boss.name; $('bossTag').textContent = boss.tag; setBar('bossBar', boss.hp / boss.hpMax); } else bb.classList.remove('on');
}

/* ── step ── */
function step(dt) {
  // ── ship physics ──
  let tx = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  let tz = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  const td = Math.hypot(tx, tz); if (td > 0) { tx /= td; tz /= td; }
  ship.thrX = tx; ship.thrZ = tz;
  const braking = !!keys['shift'], boosting = !!keys[' '];
  const accel = P.accel * (boosting ? 1.7 : 1);
  ship.vx += tx * accel * dt; ship.vz += tz * accel * dt;
  const drag = braking ? 7 : P.drag, df = 1 / (1 + drag * dt); ship.vx *= df; ship.vz *= df;
  const sp = Math.hypot(ship.vx, ship.vz), maxv = P.maxSpd * (boosting ? 1.5 : 1);
  if (sp > maxv) { ship.vx *= maxv / sp; ship.vz *= maxv / sp; }
  ship.x += ship.vx * dt; ship.z += ship.vz * dt;
  // arena bound
  const rr = Math.hypot(ship.x, ship.z); if (rr > ARENA - 2) { const k = (ARENA - 2) / rr; ship.x *= k; ship.z *= k; ship.vx *= 0.4; ship.vz *= 0.4; }
  // keep clear of base
  const dc = Math.hypot(ship.x, ship.z); if (dc < base.r + 3) { const k = (base.r + 3) / (dc || 1); ship.x *= k; ship.z *= k; }
  ship.invuln = Math.max(0, ship.invuln - dt); ship.hurtT = Math.max(0, ship.hurtT - dt);
  // orient
  ship.ang = Math.atan2(aimX, aimZ);
  ship.obj.position.set(ship.x, 1.2, ship.z);
  ship.yaw.rotation.y = ship.ang;
  // bank from lateral velocity relative to facing
  const lateral = (ship.vx * Math.cos(ship.ang) - ship.vz * Math.sin(ship.ang)) / Math.max(20, P.maxSpd);
  ship.bank = lerpAng(ship.bank, clamp(-lateral, -0.6, 0.6), 0.12);
  const fwd = (ship.vx * Math.sin(ship.ang) + ship.vz * Math.cos(ship.ang)) / Math.max(20, P.maxSpd);
  ship.tilt.rotation.z = ship.bank; ship.tilt.rotation.x = clamp(fwd, -0.4, 0.4) * -0.25;
  // flame
  const thr = Math.hypot(tx, tz);
  ship.flame.scale.z = 0.4 + thr * (boosting ? 1.8 : 1) + Math.random() * 0.2;
  ship.flame.material.color.setHex(boosting ? COL.cyan : COL.orange);
  ship.flame.visible = thr > 0.1;
  if (ship.hurtT > 0) ship.obj.visible = Math.floor(t * 30) % 2 === 0; else ship.obj.visible = true;

  // fire
  ship.fireCd -= dt; if (firing && ship.fireCd <= 0) { fire(); ship.fireCd = P.rate; }

  // ── spawning ──
  if (waveActive) {
    if (spawnQueue.boss && !enemies.length && !boss) { spawnBoss(); spawnQueue.boss = false; }
    else if (spawnQueue.length) { spawnT -= dt; if (spawnT <= 0) { spawnEnemy(spawnQueue.shift()); spawnT = Math.max(0.25, 0.9 - wave * 0.05); } }
  }

  // ── enemies ──
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i], d = e.def;
    const distB = Math.hypot(e.x, e.z) || 1, distS = Math.hypot(ship.x - e.x, ship.z - e.z) || 1;
    let dx, dz;
    if (d.mode === 'ranged') {
      const want = 26; const dirx = e.x / distB, dirz = e.z / distB;
      if (distB < want) { dx = dirx; dz = dirz; } else { dx = -dirx - dirz * 0.5; dz = -dirz + dirx * 0.5; }
      e.fireCd -= dt; if (e.fireCd <= 0) { e.fireCd = 1.5; const a = Math.atan2(-e.z, -e.x); const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), emat(d.col, 1.2)); m.position.set(e.x, 1.5, e.z); scene.add(m); ebul.push({ m, vx: Math.cos(a) * 36, vz: Math.sin(a) * 36, dmg: d.dmg, life: 4 }); }
    } else { dx = -e.x / distB; dz = -e.z / distB; }
    e.vx += dx * d.accel * dt; e.vz += dz * d.accel * dt;
    const edf = 1 / (1 + 1.4 * dt); e.vx *= edf; e.vz *= edf;
    const es = Math.hypot(e.vx, e.vz), emax = d.maxSpd * waveScale(); if (es > emax) { e.vx *= emax / es; e.vz *= emax / es; }
    e.x += e.vx * dt; e.z += e.vz * dt;
    e.ang = Math.atan2(e.vx, e.vz); e.m.g.position.set(e.x, 0, e.z); e.m.yaw.rotation.y = e.ang;
    e.m.body.material.emissiveIntensity = e.hitT > 0 ? 1.5 : 0; e.hitT = Math.max(0, e.hitT - dt);
    if (distB < base.r + d.r) { hurtBase(d.dmg * (d.mode === 'kamikaze' ? 4 : dt * 2.2)); if (d.mode === 'kamikaze') { burst(e.x, e.z, d.col, 14, 20, true); killEnemy(e, i); continue; } else { e.vx += (e.x / distB) * 30 * dt; e.vz += (e.z / distB) * 30 * dt; } }
    if (distS < ship.r + d.r) hurtShip(d.dmg * dt * 2.4);
  }

  // ── boss ──
  if (boss) bossLogic(dt);

  // ── player bullets ──
  for (let i = pbul.length - 1; i >= 0; i--) {
    const b = pbul[i]; b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; b.life -= dt; let dead = b.life <= 0;
    for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if (b.hit.has(e)) continue;
      if (Math.hypot(e.x - b.m.position.x, e.z - b.m.position.z) < e.def.r + 1) {
        e.hp -= b.dmg; e.hitT = 0.1; b.hit.add(e); burst(b.m.position.x, b.m.position.z, e.def.col, 3, 10);
        dmgNum(e.x, 3, e.z, Math.round(b.dmg), '#fff');
        if (e.hp <= 0) killEnemy(e, j);
        if (b.hit.size > b.pierce) { dead = true; break; }
      }
    }
    if (!dead && boss && !b.hit.has('b') && Math.hypot(boss.x - b.m.position.x, boss.z - b.m.position.z) < boss.r) {
      boss.hp -= b.dmg; boss.hitT = 0.08; b.hit.add('b'); burst(b.m.position.x, b.m.position.z, COL.magenta, 3, 10);
      dmgNum(boss.x, 6, boss.z, Math.round(b.dmg), '#fff'); if (boss.hp <= 0) bossDie(); if (b.hit.size > b.pierce) dead = true;
    }
    if (dead) { scene.remove(b.m); pbul.splice(i, 1); }
  }
  // ── enemy bullets ──
  for (let i = ebul.length - 1; i >= 0; i--) {
    const b = ebul[i]; b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; b.life -= dt;
    if (Math.hypot(ship.x - b.m.position.x, ship.z - b.m.position.z) < ship.r) { hurtShip(b.dmg); scene.remove(b.m); ebul.splice(i, 1); continue; }
    if (Math.hypot(b.m.position.x, b.m.position.z) < base.r) { hurtBase(b.dmg); burst(b.m.position.x, b.m.position.z, COL.orange, 4, 10); scene.remove(b.m); ebul.splice(i, 1); continue; }
    if (b.life <= 0) { scene.remove(b.m); ebul.splice(i, 1); }
  }

  // ── ports ──
  for (const pt of ports) { pt.t -= dt; pt.a += dt; pt.node.rotation.y += dt; pt.node.position.y = 2 + Math.sin(t * 2 + pt.x) * 0.3; if (pt.t <= 0) { pt.t = 6; orbs.push(makeOrb(pt.x, pt.z)); burst(pt.x, pt.z, COL.ess, 5, 6); } }

  // ── orbs (auto-collect homing) ──
  const pickR = 26 * P.magnet;
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i], dx = ship.x - o.x, dz = ship.z - o.z, dd = Math.hypot(dx, dz) || 1;
    const pull = dd < pickR ? 160 : 40; o.vx += (dx / dd) * pull * dt; o.vz += (dz / dd) * pull * dt; o.vx *= 0.9; o.vz *= 0.9;
    o.x += o.vx * dt; o.z += o.vz * dt; o.m.position.set(o.x, 1.5 + Math.sin(t * 5 + o.x) * 0.3, o.z); o.m.rotation.y += dt * 3;
    if (dd < 2.5) { collectEssence(); scene.remove(o.m); orbs.splice(i, 1); }
  }

  // ── particles ──
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    if (p.ring) { const k = 1 - p.life / p.max; const s = (p.r0 + (p.r1 - p.r0) * k) / p.r0; p.m.scale.set(s, s, 1); p.m.material.opacity = 1 - k; }
    else { p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.vy -= 6 * dt; p.vx *= 0.94; p.vz *= 0.94; p.m.scale.setScalar(Math.max(0.01, p.life / p.max)); }
    if (p.life <= 0) { scene.remove(p.m); parts.splice(i, 1); }
  }

  // base anim
  base.hitT = Math.max(0, base.hitT - dt); if (P.baseRegen) base.hp = clamp(base.hp + P.baseRegen * dt, 0, base.hpMax);
  const u = base.group.userData; u.core.rotation.y += dt * 0.6; u.core.rotation.x += dt * 0.3; u.ring1.rotation.z += dt * 0.8; u.ring2.rotation.z -= dt * 0.5;
  const low = base.hp / base.hpMax < 0.34;
  u.core.material.color.setHex(low ? COL.orange : COL.lime); u.core.material.emissive.setHex(low ? COL.orange : COL.lime);
  u.shield.material.opacity = base.hitT * 0.5; u.shield.rotation.y += dt;

  shake = Math.max(0, shake - dt * 2.2);
  checkWaveEnd(); updateHUD();
}

function bossLogic(dt) {
  const b = boss; if (!b) return;
  b.hitT = Math.max(0, b.hitT - dt); b.core.material.emissiveIntensity = b.hitT > 0 ? 0 : 0; b.core.material.emissive.setHex(0x000000);
  b.body && (b.body.material.emissiveIntensity = b.hitT > 0 ? 1 : 0);
  b.ring.rotation.z += dt * 0.6; b.eye.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.3;
  b.g.rotation.y += dt * 0.2;
  if (b.state === 'enter') { b.z += (-(ARENA - 24) - b.z) * Math.min(1, dt * 1.2); if (Math.abs(b.z - (-(ARENA - 24))) < 2) { b.state = 'fight'; b.stateT = 2; } b.g.position.set(b.x, 0, b.z); return; }
  const dd = Math.hypot(b.x, b.z) || 1; if (dd > 22) { b.x += (-b.x / dd) * 7 * dt; b.z += (-b.z / dd) * 7 * dt; } else hurtBase(34 * dt);
  b.x += Math.sin(t * 0.7) * 6 * dt; b.g.position.set(b.x, 0, b.z); b.g.lookAt(ship.x, 4, ship.z);
  b.stateT -= dt; b.fcd -= dt;
  if (b.stateT <= 0) { b.state = ['ring', 'aimed', 'aimed'][(Math.random() * 3) | 0]; b.stateT = 2.4; if (b.state === 'ring') bossRing(); }
  if (b.state === 'aimed' && b.fcd <= 0) { b.fcd = 0.5; const a = Math.atan2(ship.x - b.x, ship.z - b.z); for (let k = -1; k <= 1; k++) { const aa = a + k * 0.2; const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), emat(COL.magenta, 1.2)); m.position.set(b.x, 4, b.z); scene.add(m); ebul.push({ m, vx: Math.sin(aa) * 40, vz: Math.cos(aa) * 40, dmg: 12, life: 4 }); } }
  if (Math.hypot(ship.x - b.x, ship.z - b.z) < b.r + ship.r) hurtShip(20 * dt);
}
function bossRing() { const n = 26; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), emat(COL.magenta, 1.2)); m.position.set(boss.x, 4, boss.z); scene.add(m); ebul.push({ m, vx: Math.cos(a) * 26, vz: Math.sin(a) * 26, dmg: 10, life: 5 }); } sfx('boss'); shake += 0.25; }
function bossDie() { burst(boss.x, boss.z, COL.magenta, 60, 32, true); shockring(boss.x, boss.z, COL.magenta, 26); shake += 0.9; sfx('win'); for (let i = 0; i < 40; i++) orbs.push(makeOrb(boss.x + (Math.random() - 0.5) * 16, boss.z + (Math.random() - 0.5) * 16)); scene.remove(boss.g); boss = null; banner('WARLORD DOWN', 'SECTOR SECURE', css(COL.lime)); }

/* ── camera follow + render ── */
const camLook = new THREE.Vector3(0, 0, 0), camPos = new THREE.Vector3();
function updateCamera() {
  // gentle pan toward the ship while staying high & far
  const lx = ship.x * 0.32, lz = ship.z * 0.32;
  camLook.lerp(new THREE.Vector3(lx, 0, lz), 0.05);
  let shx = 0, shz = 0; if (shake > 0.001) { shx = (Math.random() - 0.5) * shake * 14; shz = (Math.random() - 0.5) * shake * 14; }
  camPos.set(camLook.x + shx, 232, camLook.z + 72 + shz);
  camera.position.lerp(camPos, 0.1);
  camera.lookAt(camLook.x, 0, camLook.z);
}

/* ── loop ── */
let lastT = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; t += dt;
  if (state === 'playing') step(dt);
  reticle.material.opacity = state === 'playing' ? 1 : 0;
  reticle.rotation.z += dt;
  updateCamera();
  composer.render();
}
requestAnimationFrame(loop);

/* ── boot ── */
$('loading').style.display = 'none';
$('startBtn').onclick = () => { $('title').classList.remove('on'); newRun(); };
$('retryBtn').onclick = () => { $('over').classList.remove('on'); newRun(); };
$('muteBtn').onclick = () => { setMuted(!isMuted()); $('muteBtn').textContent = isMuted() ? '♪ SOUND OFF' : '♪ SOUND ON'; };

window.__M = {
  get state() { return state; }, get wave() { return wave; }, get enemies() { return enemies.length; },
  get base() { return Math.round(base.hp); }, get hull() { return Math.round(ship.hp); }, get lvl() { return P.level; },
  get ess() { return `${P.ess}/${P.xpNext}`; }, get boss() { return boss ? Math.round(boss.hp) : null; },
  press(k, v = true) { keys[k] = v; }, fire(v = true) { firing = v; },
  bossTest() { for (const e of enemies) scene.remove(e.m.g); enemies.length = 0; wave = 3; startWave(4); },
  sim(secs) { const n = Math.round(secs / 0.016); for (let i = 0; i < n; i++) { if (state === 'playing') step(0.016); t += 0.016; } return 'simmed'; },
};
