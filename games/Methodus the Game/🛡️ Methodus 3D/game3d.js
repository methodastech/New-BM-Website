// BRAND DEFENSE GRID — 3D. Same scenario, colors, look and feeling as the
// original 2D game (cyan-on-navy radar grid, its enemy roster, Overbill Prime,
// its dialogue) — but rendered in 3D with a ship you fly around the map.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { sfx, setMuted, isMuted, startMusic, stopMusic } from './src/audio.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;
const css = h => '#' + (h >>> 0).toString(16).padStart(6, '0').slice(-6);
const lerpAng = (a, b, t) => { let d = ((b - a + Math.PI * 3) % TAU) - Math.PI; return a + d * t; };

/* ── original palette ── */
const COL = { pc: 0x22d3ee, cyan: 0x39d7e6, blue: 0x7fa8ff, teal: 0x5eead4, gold: 0xf1d27a, mag: 0xe0447c, orange: 0xf97316, purple: 0xc4b5fd, lime: 0xc8f02a, bg: 0x0a0f1d, bone: 0xdff6ff };
const ARENA = 100;              // play-field half-extent (now wraps, no walls)
const CAM_H = 270, CAM_Z = 66;  // fixed/static camera (zoomed in ~1.3x)
let WRAPX = 150, WRAPZ = 104;   // wrap edges (recomputed from the actual visible area)

/* ── original data ── */
const SERVICES = [['Brand Strategy', 0x7fa8ff], ['Visual Identity', 0x22d3ee], ['Web & UX', 0x7fa8ff], ['Performance Ads', 0xf1d27a], ['SEO & Search', 0x22d3ee], ['Social', 0x5eead4], ['Content', 0x8fb2ff], ['AI Systems', 0xc4b5fd], ['Automation', 0x22d3ee], ['Trademark', 0xe0447c]];
const ROSTER = {
  lowball:  { name: 'Lowball Larry',  col: 0xc9a24e, hp: 14, sp: 15, dmg: 9,  r: 1.7, mode: 'melee',  shape: 'coin',    pts: 60 },
  creep:    { name: 'Scope Creep',    col: 0x6fbf73, hp: 22, sp: 11, dmg: 12, r: 2.0, mode: 'melee',  shape: 'blob',    pts: 80 },
  ghost:    { name: 'The Ghoster',    col: 0x9fb3d6, hp: 12, sp: 21, dmg: 8,  r: 1.6, mode: 'melee',  shape: 'phantom', pts: 70 },
  leech:    { name: 'Retainer Leech', col: 0xc0506a, hp: 26, sp: 10, dmg: 7,  r: 1.9, mode: 'ranged', shape: 'tick',    pts: 110 },
  discount: { name: 'Discount Demon', col: 0xe0703c, hp: 18, sp: 13, dmg: 11, r: 1.9, mode: 'ranged', shape: 'sigil',   pts: 100 },
  burnout:  { name: 'Burnout Swarm',  col: 0x8a93a6, hp: 6,  sp: 30, dmg: 6,  r: 1.1, mode: 'kamikaze',shape: 'shard',  pts: 40 },
  vanity:   { name: 'Vanity Metric',  col: 0xe0529e, hp: 12, sp: 12, dmg: 8,  r: 1.8, mode: 'ranged', shape: 'balloon', pts: 90 },
};
const WEAPONS = {
  blaster: { name: 'BLASTER', tag: 'standard issue', col: COL.pc, dmg: 11, rate: 0.16, speed: 95, spread: 0.04, count: 1 },
  cannon:  { name: 'ION CANNON', tag: 'hold to charge', col: COL.blue, dmg: 30, rate: 0.5, speed: 90, spread: 0.02, count: 1, charge: true },
  shotgun: { name: 'SCATTER GUN', tag: 'wide spread', col: COL.teal, dmg: 8, rate: 0.55, speed: 78, spread: 0.5, count: 7 },
  mgun:    { name: 'MACHINE GUN', tag: 'rapid fire', col: COL.gold, dmg: 6, rate: 0.07, speed: 100, spread: 0.12, count: 1 },
  rocket:  { name: 'ROCKET LAUNCHER', tag: 'dumb-fire · big AoE', col: COL.orange, dmg: 34, rate: 0.72, speed: 52, spread: 0.03, count: 1, splash: 8, kind: 'rocket' },
  missile: { name: 'HOMING MISSILE', tag: 'seeks · small AoE', col: COL.mag, dmg: 20, rate: 0.46, speed: 46, spread: 0, count: 1, splash: 4, homing: true, kind: 'missile' },
};
/* ── ship outfitting: swappable modules (shield / engine / hull) ── */
const cfg = { accel: 300, maxSpd: 95, shRegen: 9, hpRegen: 6 };
const MODULES = {
  shield: [
    { id: 'aegis', name: 'AEGIS-I', desc: 'Balanced reflective barrier.', shMax: 40, shRegen: 9, col: 0x39d7e6 },
    { id: 'warden', name: 'WARDEN', desc: 'Heavy shell · slow recharge.', shMax: 95, shRegen: 4, col: 0x7fa8ff },
    { id: 'flux', name: 'FLUX-CAP', desc: 'Light shell · rapid recharge.', shMax: 24, shRegen: 22, col: 0x5eead4 },
  ],
  engine: [
    { id: 'vector', name: 'VECTOR DRIVE', desc: 'All-round handling.', accel: 300, maxSpd: 95, col: 0x39d7e6 },
    { id: 'wasp', name: 'WASP THRUSTER', desc: 'Nimble · lower top end.', accel: 450, maxSpd: 82, col: 0xc8f02a },
    { id: 'titan', name: 'TITAN BURNER', desc: 'Blazing top speed · heavy.', accel: 230, maxSpd: 140, col: 0xff5a1f },
  ],
  hull: [
    { id: 'plate', name: 'PLATE-A', desc: 'Standard armour.', hpMax: 100, regen: 6, col: 0x39d7e6 },
    { id: 'bulwark', name: 'BULWARK', desc: 'Heavy armour · slow mend.', hpMax: 165, regen: 4, col: 0xf1d27a },
    { id: 'phantom', name: 'PHANTOM', desc: 'Fragile · fast self-repair.', hpMax: 60, regen: 16, col: 0xe0447c },
  ],
};
const loadout = { weapon: 'blaster', shield: 'aegis', engine: 'vector', hull: 'plate' };
const modById = (slot, id) => MODULES[slot].find(m => m.id === id) || MODULES[slot][0];
function applyLoadout() {
  const sh = modById('shield', loadout.shield), en = modById('engine', loadout.engine), hu = modById('hull', loadout.hull);
  cfg.accel = en.accel; cfg.maxSpd = en.maxSpd; cfg.shRegen = sh.shRegen; cfg.hpRegen = hu.regen;
  ship.shMax = sh.shMax; ship.hpMax = hu.hpMax; weapon = loadout.weapon; ship.engCol = en.col;
  if (ship.model) tintShipModel(ship.model, loadout);
}
const DLG = {
  intro: { spk: 'THE GRID', col: COL.pc, lines: [
    'Brand defense grid online. Welcome, operator.',
    'Your brand just went live, and the circling has already started.',
    'Vendors who overbill. Rivals who only compete on price. And a quiet voice telling you to charge less.',
    'Hold the grid. Make them regret the day they came for your brand.'] },
  boss: { spk: 'OVERBILL PRIME', col: COL.mag, lines: [
    'You again. Wonderful.',
    'Every email is billable. Every tweak, every "quick question." Another invoice.',
    'You will pay. And pay. And pay again.'] },
};

/* ── renderer / scene / camera / bloom ── */
const cvs = $('game');
const hud2d = $('hud2d'); const hctx = hud2d.getContext('2d'); const HDPR = Math.min(devicePixelRatio, 2);
let msx = 0, msy = 0;
const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.28; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1228);
scene.fog = new THREE.FogExp2(0x141d3a, 0.0013);
const camera = new THREE.PerspectiveCamera(36, 1, 1, 2000);
camera.position.set(0, CAM_H, CAM_Z); camera.lookAt(0, 0, 0);
let composer, bloom, W = 0, H = 0;
function resize() {
  W = innerWidth; H = innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
  hud2d.width = W * HDPR; hud2d.height = H * HDPR; hctx.setTransform(HDPR, 0, 0, HDPR, 0, 0);
  if (!composer) { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.7, 0.5, 0.78); composer.addPass(bloom); }
  composer.setSize(W, H); bloom.setSize(W, H);
}
addEventListener('resize', resize); resize(); msx = W / 2; msy = H / 2;

/* ── screen-space scanner HUD (vector overlay, drawn each frame) ── */
let aimGap = 9;
function drawReticle(x, y, col) {
  // simple crosshair that concentrates (ticks pull in) while firing
  aimGap += ((firing ? 4 : 10) - aimGap) * 0.3;
  const g = aimGap, len = 6;
  hctx.save(); hctx.translate(x, y);
  // Ion Cannon charge ring — fills cyan→gold as it builds
  const chg = (weapon === 'cannon' && ship.chargeT > 0.02) ? Math.min(1, ship.chargeT / 1.2) : 0;
  if (chg > 0) {
    const cc = chg >= 0.95 ? '#f1d27a' : '#39d7e6';
    hctx.strokeStyle = 'rgba(127,168,255,.25)'; hctx.lineWidth = 3; hctx.beginPath(); hctx.arc(0, 0, 18, 0, TAU); hctx.stroke();
    hctx.strokeStyle = cc; hctx.shadowColor = cc; hctx.shadowBlur = 10; hctx.lineWidth = 3; hctx.beginPath(); hctx.arc(0, 0, 18, -Math.PI / 2, -Math.PI / 2 + chg * TAU); hctx.stroke(); hctx.shadowBlur = 0;
    if (chg >= 0.95) { hctx.globalAlpha = 0.5 + Math.sin(t * 20) * 0.4; hctx.fillStyle = cc; hctx.font = '700 8px Orbitron,monospace'; hctx.textAlign = 'center'; hctx.fillText('CHARGED', 0, 32); hctx.textAlign = 'left'; hctx.globalAlpha = 1; }
  }
  hctx.strokeStyle = col; hctx.lineWidth = 1.6; hctx.shadowColor = col; hctx.shadowBlur = 6; hctx.globalAlpha = 0.95;
  hctx.beginPath(); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { hctx.moveTo(dx * g, dy * g); hctx.lineTo(dx * (g + len), dy * (g + len)); } hctx.stroke();
  hctx.fillStyle = col; hctx.fillRect(-1.5, -1.5, 3, 3);
  hctx.restore();
}
function drawHUD2D() {
  hctx.clearRect(0, 0, W, H);
  if (state === 'title' || state === 'over') return;
  const cyc = '#22d3ee', acc = '#c8f02a', dim = 'rgba(127,168,255,.35)';
  const m = 26, L = 26;
  // corner frame
  hctx.globalAlpha = 0.75; hctx.strokeStyle = cyc; hctx.lineWidth = 1.5;
  for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [W - m, H - m, -1, -1], [m, H - m, 1, -1]]) { hctx.beginPath(); hctx.moveTo(cx + sx * L, cy); hctx.lineTo(cx, cy); hctx.lineTo(cx, cy + sy * L); hctx.stroke(); }
  // edge ticks
  hctx.globalAlpha = 0.22; hctx.strokeStyle = dim; hctx.beginPath();
  for (let x = m + 70; x < W - m; x += 70) { hctx.moveTo(x, m); hctx.lineTo(x, m + 5); hctx.moveTo(x, H - m); hctx.lineTo(x, H - m - 5); }
  for (let y = m + 70; y < H - m; y += 70) { hctx.moveTo(m, y); hctx.lineTo(m + 5, y); hctx.moveTo(W - m, y); hctx.lineTo(W - m - 5, y); }
  hctx.stroke(); hctx.globalAlpha = 1;
  // moving scan line
  const ssy = m + (t * 70 % (H - m * 2)); hctx.strokeStyle = 'rgba(34,211,238,.09)'; hctx.lineWidth = 1; hctx.beginPath(); hctx.moveTo(m, ssy); hctx.lineTo(W - m, ssy); hctx.stroke();
  // serial decals
  hctx.fillStyle = dim; hctx.font = '9px "Space Mono", monospace'; hctx.globalAlpha = 0.55;
  hctx.fillText('PROTOCOL DRIVER · X139', m + 6, H - m - 7);
  hctx.textAlign = 'right'; hctx.fillText('S/N 48-1508F · DS4-1774822-5', W - m - 6, H - m - 7); hctx.textAlign = 'left'; hctx.globalAlpha = 1;
  drawReticle(msx, msy, cyc);
}

scene.add(new THREE.AmbientLight(0x52709e, 1.05));
const key = new THREE.DirectionalLight(0xdfeeff, 1.0); key.position.set(20, 90, 30); scene.add(key);
const fillL = new THREE.DirectionalLight(0xb070ff, 0.45); fillL.position.set(-40, 50, -40); scene.add(fillL);

const emat = (c, i = 1.1, r = 0.4) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: r, metalness: 0.2, flatShading: true });
const hullMat = (c = 0x0e1830) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.6, flatShading: true });

// ── shared geometry + cached materials (reused, never per-frame allocated) ──
const G = {
  bullet: new THREE.BoxGeometry(0.3, 0.3, 2), part: new THREE.BoxGeometry(0.4, 0.4, 0.4), partBig: new THREE.BoxGeometry(0.6, 0.6, 0.6),
  ring: new THREE.TorusGeometry(1, 0.05, 6, 24), flash: new THREE.SphereGeometry(1, 10, 8), ebul: new THREE.SphereGeometry(0.45, 10, 8), trail: new THREE.SphereGeometry(0.45, 6, 6),
  rocket: new THREE.CylinderGeometry(0.18, 0.34, 1.7, 7),
};
const _bm = {}, _em = {};
const bmat = (c, op = 1) => _bm[c + '|' + op] || (_bm[c + '|' + op] = new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op }));
const emit = (c, i = 1) => _em[c + '|' + i] || (_em[c + '|' + i] = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4, metalness: 0.2, flatShading: true }));
const HULL = new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.5, metalness: 0.6, flatShading: true });

/* ── galaxy background (no border — field wraps) ── */
(function buildGalaxy() {
  // layered starfield below the play plane
  for (const [n, size, col, op, ylo, yhi] of [[1400, 1.1, 0xffffff, 0.9, -160, -20], [700, 1.8, 0x9fc8ff, 0.8, -200, -40], [300, 2.6, 0xe0b0ff, 0.7, -240, -60]]) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() * 2 - 1) * 620; p[i * 3 + 1] = ylo + Math.random() * (yhi - ylo); p[i * 3 + 2] = (Math.random() * 2 - 1) * 620; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: op })));
  }
  // soft nebula clouds (additive sprites) for galaxy colour
  const neb = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  for (const [x, z, s, col] of [[-90, -40, 240, 0x5a3aa0], [120, 60, 280, 0x1e6e8c], [40, -120, 200, 0x8a2f6a], [-130, 110, 220, 0x244a8c]]) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: neb, color: col, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(x, -70, z); sp.scale.set(s, s, 1); scene.add(sp);
  }
})();

/* ── single repair satellite (fly near it to heal) ── */
const SAT = { r: 11, g: null, core: null, ring: null, heal: 0 };
(function buildSatellite() {
  const g = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x2b3a4d, emissive: 0x16283c, emissiveIntensity: 0.3, roughness: 0.5, metalness: 0.6, flatShading: true })); hub.position.y = 2; g.add(hub);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), emit(COL.teal, 1.3)); core.position.y = 3.5; g.add(core); SAT.core = core;
  for (const s of [-1, 1]) { const panel = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.25, 3), new THREE.MeshStandardMaterial({ color: 0x16304a, emissive: COL.blue, emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.5, flatShading: true })); panel.position.set(s * 4.6, 2.2, 0); g.add(panel); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(SAT.r, 0.14, 8, 56), new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.4; g.add(ring); SAT.ring = ring;
  const glow = new THREE.PointLight(COL.teal, 28, 34); glow.position.y = 3; g.add(glow);
  scene.add(g); SAT.g = g;
})();

/* ── aim reticle ── */
const reticle = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.16, 6, 24), new THREE.MeshBasicMaterial({ color: COL.pc }));
reticle.rotation.x = Math.PI / 2; scene.add(reticle);

/* ── ship ── */
const ship = { obj: null, yaw: null, tilt: null, flame: null, model: null, engCol: COL.pc, x: 0, z: 22, vx: 0, vz: 0, pvx: 0, pvz: 0, ang: 0, bank: 0, pitch: 0, hp: 100, hpMax: 100, sh: 0, shMax: 40, shCd: 0, fireCd: 0, chargeT: 0, hurtT: 0, invuln: 0, r: 2.2 };

/* ── premium cyberpunk interceptor — shared builder (gameplay + hangar) ──
   Nose points +z. Returns the group plus tintable part references so the
   hangar copy can recolour engine / shield / hull / weapon per module. */
function buildShipModel() {
  const group = new THREE.Group();
  // fresh materials per instance so the two copies tint independently
  const mats = {
    hull:  new THREE.MeshStandardMaterial({ color: 0x16304e, emissive: COL.cyan, emissiveIntensity: 0.14, roughness: 0.34, metalness: 0.85, flatShading: true }),
    plate: new THREE.MeshStandardMaterial({ color: 0x244a6b, emissive: COL.cyan, emissiveIntensity: 0.07, roughness: 0.5, metalness: 0.7, flatShading: true }),
    dark:  new THREE.MeshStandardMaterial({ color: 0x0c1a2c, roughness: 0.6, metalness: 0.7, flatShading: true }),
    trim:  new THREE.MeshStandardMaterial({ color: 0xd6e2ee, roughness: 0.35, metalness: 0.9, flatShading: true }),
  };
  const neon = (c, i = 1.3) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.3, metalness: 0.2 });
  const parts = { thr: [], weapon: [], shield: null };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const M = (g, m) => new THREE.Mesh(g, m);

  // ── sleek layered fuselage ──
  const belly = M(B(1.05, 0.34, 3.5), mats.plate); belly.position.set(0, -0.12, 0.1); group.add(belly);
  const midB = M(B(0.86, 0.46, 3.2), mats.hull); midB.position.set(0, 0.16, 0.15); group.add(midB);
  const ridge = M(B(0.5, 0.3, 2.4), mats.hull); ridge.position.set(0, 0.46, 0.2); group.add(ridge);     // raised dorsal ridge (not a black slab)
  // sharp forward blade nose
  const nose = M(new THREE.ConeGeometry(0.42, 3.2, 4), mats.hull); nose.rotation.set(Math.PI / 2, 0, Math.PI / 4); nose.scale.set(1.1, 0.5, 1); nose.position.set(0, 0.04, 2.8); group.add(nose);
  const noseTip = M(new THREE.ConeGeometry(0.09, 0.6, 6), neon(COL.lime, 1.2)); noseTip.rotation.x = Math.PI / 2; noseTip.position.set(0, 0.06, 4.3); group.add(noseTip);
  // canopy (sits on the ridge)
  const canopy = M(new THREE.SphereGeometry(0.4, 18, 12), new THREE.MeshStandardMaterial({ color: 0x0a3a48, emissive: 0xbfefff, emissiveIntensity: 1.1, roughness: 0.12, metalness: 0.4 })); canopy.scale.set(0.74, 0.6, 1.6); canopy.position.set(0, 0.6, 1.0); group.add(canopy);
  // dorsal neon spine + belly underglow strips
  const spine = M(B(0.1, 0.12, 2.2), neon(COL.lime, 1.1)); spine.position.set(0, 0.64, 0.2); group.add(spine);
  for (const s of [-1, 1]) { const ug = M(B(0.08, 0.08, 2.6), neon(COL.cyan)); ug.position.set(s * 0.42, -0.3, 0.1); group.add(ug); }
  // chin weapon pods (recolour by equipped weapon)
  for (const s of [-1, 1]) {
    const pod = M(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 8), neon(COL.pc, 1.1)); pod.rotation.x = Math.PI / 2; pod.position.set(s * 0.36, -0.22, 2.0); group.add(pod); parts.weapon.push(pod);
  }
  // ── swept wings (each in its own pivot group so the neon edge + tip stay flush) ──
  for (const s of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(s * 0.42, 0.0, -0.1); wg.rotation.set(s * 0.06, -s * 0.4, 0); group.add(wg);
    const wing = M(B(2.5, 0.1, 1.45), mats.hull); wing.position.set(s * 1.45, 0, 0); wg.add(wing);
    const edge = M(B(2.5, 0.13, 0.12), neon(COL.cyan, 1.2)); edge.position.set(s * 1.45, 0.02, 0.7); wg.add(edge);     // leading edge, flush to wing front
    const tipL = M(new THREE.ConeGeometry(0.11, 0.7, 5), neon(s > 0 ? COL.lime : COL.orange, 1.4)); tipL.rotation.x = Math.PI / 2; tipL.position.set(s * 2.7, 0.02, 0.1); wg.add(tipL);
  }
  // ── engine block: twin nacelles + glow rings + fins ──
  for (const s of [-1, 1]) {
    const nac = M(new THREE.CylinderGeometry(0.32, 0.4, 1.9, 12), mats.plate); nac.rotation.x = Math.PI / 2; nac.position.set(s * 0.78, -0.02, -1.6); group.add(nac);
    const ring = M(new THREE.TorusGeometry(0.3, 0.07, 8, 20), neon(COL.cyan, 1.5)); ring.position.set(s * 0.78, -0.02, -2.5); group.add(ring); parts.thr.push(ring);
    const fin = M(B(0.09, 0.62, 0.9), mats.hull); fin.position.set(s * 0.45, 0.36, -1.8); fin.rotation.x = -0.22; group.add(fin);
  }
  // dorsal tail fin + neon edge
  const tail = M(B(0.1, 0.8, 1.0), mats.hull); tail.position.set(0, 0.62, -1.7); tail.rotation.x = -0.25; group.add(tail);
  const tEdge = M(B(0.12, 0.1, 1.0), neon(COL.cyan)); tEdge.position.set(0, 1.0, -1.7); tEdge.rotation.x = -0.25; group.add(tEdge);
  // twin engine flames (scaled per thrust; height baked along +z, tip at -z)
  const flame = new THREE.Group();
  const flGeo = new THREE.ConeGeometry(0.24, 2.0, 10); flGeo.rotateX(-Math.PI / 2);
  for (const s of [-1, 1]) { const fl = M(flGeo, new THREE.MeshBasicMaterial({ color: COL.pc, transparent: true, opacity: 0.95 })); fl.position.set(s * 0.78, -0.02, -3.1); flame.add(fl); }
  group.add(flame);
  // ── force-field shield: soft additive shell + gyro rings (shown on the SHIELD tab) ──
  const shieldGrp = new THREE.Group(); shieldGrp.position.set(0, 0.1, -0.1); const shieldMats = [];
  const sphM = new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false }); shieldMats.push(sphM);
  shieldGrp.add(M(new THREE.IcosahedronGeometry(3.5, 2), sphM));
  for (const rot of [[Math.PI / 2, 0, 0], [0, 0, 0], [Math.PI / 2, 0, Math.PI / 2]]) {
    const rM = new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }); shieldMats.push(rM);
    const ring = M(new THREE.TorusGeometry(3.5, 0.02, 6, 56), rM); ring.rotation.set(rot[0], rot[1], rot[2]); shieldGrp.add(ring);
  }
  group.add(shieldGrp); parts.shield = shieldGrp; parts.shieldMats = shieldMats;

  return { group, flame, mats, parts };
}
// recolour a ship model from a loadout (engine / shield / hull / weapon)
function tintShipModel(model, lo) {
  const en = modById('engine', lo.engine), sh = modById('shield', lo.shield), hu = modById('hull', lo.hull), wcol = WEAPONS[lo.weapon].col;
  for (const r of model.parts.thr) { r.material.color.setHex(en.col); r.material.emissive.setHex(en.col); }
  for (const f of model.flame.children) f.material.color.setHex(en.col);
  for (const p of model.parts.weapon) { p.material.color.setHex(wcol); p.material.emissive.setHex(wcol); }
  if (model.parts.shieldMats) for (const m of model.parts.shieldMats) m.color.setHex(sh.col);
  model.mats.plate.emissive.setHex(hu.col); model.mats.plate.emissiveIntensity = 0.16;
  model.mats.hull.emissive.setHex(hu.col); model.mats.hull.emissiveIntensity = 0.16;
}
(function buildShip() {
  const root = new THREE.Group(); const yaw = new THREE.Group(); root.add(yaw); const tilt = new THREE.Group(); yaw.add(tilt);
  tilt.scale.setScalar(2.0);
  const model = buildShipModel();
  model.parts.shield.visible = false;                       // no bubble during flight
  tilt.add(model.group);
  const lt = new THREE.PointLight(COL.pc, 24, 34); lt.position.y = 2; yaw.add(lt);
  scene.add(root); ship.obj = root; ship.yaw = yaw; ship.tilt = tilt; ship.flame = model.flame; ship.model = model;
  tintShipModel(model, loadout);
})();

/* ── pools ── */
const enemies = [], pbul = [], ebul = [], parts = [];
let boss = null;
// hard caps so combat/jet FX can never accumulate into a freeze
const PART_CAP = 440;
const DMG_CAP = 44; let dmgActive = 0;

/* ── state ── */
let state = 'title', t = 0, shakeAmt = 0, wave = 1, kills = 0, score = 0, best = +(localStorage.getItem('bdg3d_best') || 0);
let weapon = 'blaster', waveTime = 0, waveActive = false, spawnT = 0, dlg = null, pingT = 0;

/* ── input ── */
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
let aimX = 0, aimZ = -1, firing = false, touchMove = false;
const keys = {};
const coarse = matchMedia('(pointer:coarse)').matches;
addEventListener('keydown', e => { const k = e.key.toLowerCase(); keys[k] = true; if (k === ' ') e.preventDefault();
  if (k === 'q') cycleWeapon(-1); else if (k === 'e') cycleWeapon(1); else if (k >= '1' && k <= '6') setWeapon(WEAPON_ORDER[+k - 1]);
  else if (k === 'p' || k === 'escape') togglePause(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('wheel', e => { if (state === 'play') cycleWeapon(e.deltaY > 0 ? 1 : -1); }, { passive: true });
function aimFrom(cx, cy) { msx = cx; msy = cy; ndc.x = (cx / W) * 2 - 1; ndc.y = -(cy / H) * 2 + 1; ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(groundPlane, hit)) { const dx = hit.x - ship.x, dz = hit.z - ship.z, d = Math.hypot(dx, dz); if (d > 0.5) { aimX = dx / d; aimZ = dz / d; } reticle.position.set(hit.x, 0, hit.z); } }
addEventListener('pointermove', e => aimFrom(e.clientX, e.clientY));
cvs.addEventListener('pointerdown', e => { if (state === 'dialog') { advanceDlg(); return; } if (state === 'play') { firing = true; if (coarse) touchMove = true; aimFrom(e.clientX, e.clientY); } });
addEventListener('pointerup', () => { firing = false; touchMove = false; });
$('dlg').addEventListener('pointerdown', advanceDlg);

/* ── weapon cycling (test all weapons) ── */
const WEAPON_ORDER = ['blaster', 'cannon', 'shotgun', 'mgun', 'rocket', 'missile'];
const TEST_POOL = ['lowball', 'creep', 'ghost', 'leech', 'discount', 'burnout', 'vanity'];
function updateWeaponHUD() { const w = WEAPONS[weapon]; $('wName').textContent = w.name; $('wName').style.color = css(w.col); $('wTag').textContent = w.tag; document.querySelectorAll('#wbar .wic').forEach(el => el.classList.toggle('on', el.dataset.w === weapon)); }
function setWeapon(k) { if (!WEAPONS[k]) return; weapon = k; ship.fireCd = 0; updateWeaponHUD(); sfx('shield'); }
function cycleWeapon(d) { const i = WEAPON_ORDER.indexOf(weapon); setWeapon(WEAPON_ORDER[(i + d + WEAPON_ORDER.length) % WEAPON_ORDER.length]); }
document.querySelectorAll('#wbar .wic').forEach(el => el.addEventListener('pointerdown', ev => { ev.stopPropagation(); setWeapon(el.dataset.w); }));
// recompute wrap edges from the actual visible area
function computeWrap() { let mxx = 0, mzz = 0; for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]]) { ndc.set(x, y); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(groundPlane, hit)) { mxx = Math.max(mxx, Math.abs(hit.x)); mzz = Math.max(mzz, Math.abs(hit.z)); } } if (mxx > 10) WRAPX = mxx + 3; if (mzz > 10) WRAPZ = mzz + 3; }
addEventListener('resize', computeWrap);

/* ── helpers ── */
function burst(x, z, color, n, spd, big) { n = Math.min(n, PART_CAP - parts.length); if (n <= 0) return; const mat = bmat(color); for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = Math.random() * spd; const m = new THREE.Mesh(big ? G.partBig : G.part, mat); m.position.set(x, 1.4, z); scene.add(m); parts.push({ m, vx: Math.cos(a) * s, vy: (Math.random() - 0.3) * s * 0.5 + 1.5, vz: Math.sin(a) * s, life: 0.4 + Math.random() * 0.5, max: 0.9 }); } }
function shockring(x, z, color, r) { if (parts.length >= PART_CAP) return; const m = new THREE.Mesh(G.ring, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })); m.rotation.x = Math.PI / 2; m.position.set(x, 1, z); m.scale.set(r * 0.3, r * 0.3, 1); scene.add(m); parts.push({ m, ring: true, r0: r * 0.3, r1: r, life: 0.45, max: 0.45, dispose: true }); }
function trail(x, z, color, sp) { if (parts.length >= PART_CAP) return; const m = new THREE.Mesh(G.trail, bmat(color, 0.6)); m.position.set(x, 1.3, z); scene.add(m); parts.push({ m, vx: (Math.random() - 0.5) * 2, vy: 0, vz: (Math.random() - 0.5) * 2, life: 0.3 + Math.min(0.3, sp * 0.008), max: 0.6, trail: true }); }
function flash(x, z, color, r) { if (parts.length >= PART_CAP) return; const m = new THREE.Mesh(G.flash, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })); m.position.set(x, 1.4, z); scene.add(m); parts.push({ m, flash: true, r1: r, life: 0.22, max: 0.22, dispose: true }); }
const _pv = new THREE.Vector3();
function dmgNum(x, y, z, txt, color, big) { if (dmgActive >= DMG_CAP) return; _pv.set(x, y, z).project(camera); if (_pv.z > 1) return; const sx = (_pv.x * 0.5 + 0.5) * W, sy = (-_pv.y * 0.5 + 0.5) * H; const el = document.createElement('div'); el.className = 'dmg' + (big ? ' big' : ''); el.textContent = txt; el.style.color = color; $('fx').appendChild(el); dmgActive++; let life = 0.8; (function tick() { life -= 0.016; if (life <= 0) { el.remove(); dmgActive--; return; } el.style.transform = `translate(${sx}px,${sy - (0.8 - life) * 38}px)`; el.style.opacity = life / 0.8; requestAnimationFrame(tick); })(); }
function shake(a) { shakeAmt = Math.min(1.2, shakeAmt + a); }

/* ── banner / status ── */
function status(txt) { $('status').textContent = txt; }

/* ── dialogue ── */
function showDialog(key, onDone) { const d = DLG[key]; dlg = { lines: d.lines, i: 0, onDone, col: d.col, spk: d.spk }; state = 'dialog'; $('dlgspk').textContent = d.spk; $('dlgspk').style.color = css(d.col); $('dlgcard').style.setProperty('--dc', css(d.col)); $('dlgtext').textContent = d.lines[0]; $('dlg').classList.add('on'); sfx('boss'); }
function advanceDlg() { if (state !== 'dialog' || !dlg) return; dlg.i++; if (dlg.i >= dlg.lines.length) { $('dlg').classList.remove('on'); const cb = dlg.onDone; dlg = null; state = 'play'; if (cb) cb(); } else { $('dlgtext').textContent = dlg.lines[dlg.i]; sfx('pulse'); } }

/* ── waves ── */
const WAVES = [
  { dur: 38, pool: ['lowball', 'creep', 'ghost', 'burnout'], rate: 1.3 },
  { dur: 44, pool: ['lowball', 'ghost', 'leech', 'discount', 'burnout', 'vanity'], rate: 1.0 },
];
function startWave(n) {
  wave = n;
  if (n > WAVES.length) { startBoss(); return; }
  waveActive = true; waveTime = WAVES[n - 1].dur; spawnT = 0.6;
  status('BRAND ARRAY · WAVE ' + n); $('bossbar').classList.remove('on'); $('timer').style.display = '';
  banner('WAVE ' + n, 'HOLD THE GRID');
}
function spawnEnemy(key) {
  const d = ROSTER[key], hp = d.hp * (1 + (wave - 1) * 0.15);
  // spawn just inside a random screen edge, then fly in
  const edge = (Math.random() * 4) | 0; let ex, ez;
  if (edge === 0) { ex = (Math.random() * 2 - 1) * WRAPX; ez = -WRAPZ + 3; }
  else if (edge === 1) { ex = (Math.random() * 2 - 1) * WRAPX; ez = WRAPZ - 3; }
  else if (edge === 2) { ex = -WRAPX + 3; ez = (Math.random() * 2 - 1) * WRAPZ; }
  else { ex = WRAPX - 3; ez = (Math.random() * 2 - 1) * WRAPZ; }
  shockring(ex, ez, d.col, d.r * 3); flash(ex, ez, d.col, d.r * 1.6); sfx('efire');
  const m = enemyMesh(key, d); m.g.scale.setScalar(0.2);
  enemies.push({ key, def: d, m, x: ex, z: ez, vx: 0, vz: 0, ang: 0, pang: 0, bank: 0, hp, hpMax: hp, hitT: 0, fireCd: 1 + Math.random(), bob: Math.random() * 6, warp: 0.45 });
}
// cached ship geometry sets per enemy type (shared across instances)
const _eg = {};
function enemyGeos(key, d) {
  if (_eg[key]) return _eg[key];
  const r = d.r, cls = d.mode === 'kamikaze' ? 'dart' : d.mode === 'ranged' ? 'cruiser' : 'fighter', o = { cls };
  if (cls === 'dart') { o.fuse = new THREE.ConeGeometry(r * 0.45, r * 2.6, 4); o.wing = new THREE.BoxGeometry(r * 1.5, 0.22, r * 0.7); o.eng = new THREE.ConeGeometry(0.26, 1.0, 6); }
  else if (cls === 'cruiser') { o.fuse = new THREE.BoxGeometry(r * 1.0, r * 0.6, r * 2.2); o.wing = new THREE.BoxGeometry(r * 2.6, 0.3, r * 1.0); o.pod = new THREE.BoxGeometry(r * 0.5, r * 0.5, r * 1.3); o.eng = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 6); }
  else { o.fuse = new THREE.ConeGeometry(r * 0.6, r * 2.3, 6); o.wing = new THREE.BoxGeometry(r * 2.3, 0.26, r * 1.1); o.eng = new THREE.ConeGeometry(0.32, 1.2, 6); }
  o.cock = new THREE.BoxGeometry(r * 0.42, r * 0.4, r * 0.5);
  return (_eg[key] = o);
}
function enemyMesh(key, d) {
  const o = enemyGeos(key, d), g = new THREE.Group(), r = d.r;
  // bright, clearly-coloured hull (no dark ships) — cloned so per-enemy hit-flash works
  const bodyMat = emit(d.col, 0.55).clone(); bodyMat.color.setHex(d.col);
  const fuse = new THREE.Mesh(o.fuse, bodyMat); fuse.rotation.x = Math.PI / 2; fuse.position.y = 1.4; g.add(fuse);
  const wingMat = emit(d.col, 0.32);                 // shared colour-lit wings/pods
  for (const s of [-1, 1]) { const w = new THREE.Mesh(o.wing, wingMat); w.position.set(s * r * 0.8, 1.4, -r * 0.3); w.rotation.y = s * 0.5; g.add(w);
    const tip = new THREE.Mesh(G.part, emit(d.col, 1.5)); tip.position.set(s * r * 1.4, 1.4, -r * 0.6); g.add(tip); }
  if (o.pod) for (const s of [-1, 1]) { const p = new THREE.Mesh(o.pod, wingMat); p.position.set(s * r * 1.1, 1.4, 0); g.add(p); }
  const cock = new THREE.Mesh(o.cock, emit(COL.bone, 1.5)); cock.position.set(0, 1.62, r * 0.55); g.add(cock);
  const fl = new THREE.Mesh(o.eng, bmat(d.col, 0.9)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 1.4, -(r + 0.3)); g.add(fl);
  scene.add(g); return { g, body: fuse, flame: fl };
}

/* ── boss ── */
function startBoss() {
  status('WARLORD'); $('timer').style.display = 'none';
  showDialog('boss', spawnBoss);
}
function spawnBoss() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(7, 1), new THREE.MeshStandardMaterial({ color: 0x7a1c3a, emissive: COL.mag, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.5, flatShading: true })); core.position.y = 3.5; g.add(core);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.6, 8, 30), emat(COL.mag, 0.9)); halo.position.y = 3.5; halo.rotation.x = Math.PI / 2; g.add(halo);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(1.8, 14, 12), emat(COL.gold, 1.3)); eye.position.set(0, 3.8, 7); g.add(eye);
  const lt = new THREE.PointLight(COL.mag, 70, 60); lt.position.y = 5; g.add(lt);
  g.position.set(0, 0, -ARENA + 6); scene.add(g);
  boss = { name: 'OVERBILL PRIME', tag: 'the overcharger', g, core, halo, eye, x: 0, z: -ARENA + 6, hp: 900, hpMax: 900, hitT: 0, st: 'enter', stT: 2, fcd: 0 };
  $('bossName').textContent = boss.name; $('bossTag').textContent = boss.tag; $('bossbar').classList.add('on');
  banner('OVERBILL PRIME', 'THE OVERCHARGER', css(COL.mag)); sfx('boss'); shake(0.4);
}

/* ── fire ── */
function fireWeapon(mult) {
  mult = mult || 1;
  const w = WEAPONS[weapon], n = w.count || 1, baseA = Math.atan2(aimZ, aimX);   // aim vector → bullets go exactly at the cursor
  const nx = ship.x + aimX * 3, nz = ship.z + aimZ * 3;
  for (let i = 0; i < n; i++) {
    const a = baseA + (n > 1 ? (i / (n - 1) - 0.5) * w.spread * 5 : (Math.random() - 0.5) * w.spread);
    const dx = Math.cos(a), dz = Math.sin(a);
    const m = new THREE.Mesh(G.bullet, w.kind ? emit(w.col, 1.0) : bmat(w.col));
    m.position.set(nx, 1.5, nz); m.rotation.y = Math.atan2(dx, dz);
    if (w.kind) m.scale.set(1.5, 1.5, 1.3); else if (mult > 1) m.scale.setScalar(0.9 + mult * 0.7);
    scene.add(m);
    pbul.push({ m, vx: dx * w.speed, vz: dz * w.speed, dmg: w.dmg * mult, life: w.kind ? 1.7 : 0.85, col: w.col, splash: w.splash || 0, homing: !!w.homing });
  }
  if (w.kind) sfx('rocket'); else sfx(weapon === 'mgun' ? 'efire' : 'pulse');
  shake(w.kind === 'rocket' ? 0.05 : 0.008 + (mult > 1.2 ? 0.05 : 0));
  burst(nx, nz, w.col, 3, 8);
}

/* ── damage ── */
function hurtShip(n) {
  if (state !== 'play' || ship.invuln > 0) return;
  ship.shCd = 2.4;
  if (ship.sh > 0) { const a = Math.min(ship.sh, n); ship.sh -= a; n -= a; if (n <= 0) { sfx('shield'); return; } }
  ship.hp = Math.max(1, ship.hp - n); ship.invuln = 0.4; ship.hurtT = 0.2; shake(0.25); sfx('hurt');  // infinite life (test mode)
}
function killEnemy(e, idx) { enemies.splice(idx, 1); scene.remove(e.m.g); e.m.body.material.dispose(); flash(e.x, e.z, '#ffffff', e.def.r * 1.4); burst(e.x, e.z, e.def.col, 12, 20, true); shockring(e.x, e.z, e.def.col, e.def.r + 4); sfx('boom'); shake(0.12); kills++; score += e.def.pts; }
function explode(x, z, r, dmg, col) {
  flash(x, z, '#ffffff', r * 0.7); burst(x, z, col, 18, 26, true); shockring(x, z, col, r * 2); sfx('boom'); shake(0.18);
  for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j], dd = Math.hypot(e.x - x, e.z - z); if (dd < r + e.def.r) { e.hp -= dmg; e.hitT = 0.12; e.vx += (e.x - x) / (dd || 1) * 9; e.vz += (e.z - z) / (dd || 1) * 9; if (e.hp <= 0) killEnemy(e, j); } }
}

/* ── game over / win ── */
function endGame(win) {
  if (state === 'over') return; state = 'over'; firing = false;
  if (score > best) { best = score; localStorage.setItem('bdg3d_best', best); }
  const o = $('over'); o.className = 'overlay on ' + (win ? 'win' : 'lose');
  $('overEye').textContent = win ? 'GRID HELD' : 'GRID BREACH';
  $('overTitle').textContent = win ? 'BRAND SECURED' : 'DEFENDER LOST';
  $('ovWave').textContent = wave; $('ovKills').textContent = kills; $('ovScore').textContent = score;
  $('ovBest').textContent = 'BEST ' + best;
  sfx(win ? 'win' : 'lose');
}

/* ── banner (reuse status pulse) ── */
let banEl = null;
function banner(big, sub, col) {
  let b = $('banner'); if (!b) { b = document.createElement('div'); b.id = 'banner'; b.style.cssText = 'position:fixed;top:24%;left:50%;transform:translateX(-50%);z-index:12;text-align:center;pointer-events:none;transition:opacity .3s'; document.body.appendChild(b); }
  b.innerHTML = `<div style="font-family:var(--disp);font-weight:800;font-size:34px;letter-spacing:.05em;color:${col || css(COL.pc)};text-shadow:0 0 24px ${col || css(COL.pc)}">${big}</div><div style="font-size:11px;letter-spacing:.3em;color:var(--bone);opacity:.8;margin-top:4px">${sub || ''}</div>`;
  b.style.opacity = '1'; clearTimeout(banEl); banEl = setTimeout(() => b.style.opacity = '0', 1800);
}

/* ── HUD ── */
const setBar = (id, f) => { $(id).style.transform = `scaleX(${clamp(f, 0, 1)})`; };
function updateHUD() {
  setBar('hullBar', ship.hp / ship.hpMax); $('hullTxt').textContent = Math.ceil(ship.hp);
  setBar('shBar', ship.sh / ship.shMax); $('shTxt').textContent = Math.ceil(ship.sh);
  $('scoreV').textContent = score; $('thrV').textContent = kills;
  const w = WEAPONS[weapon]; $('wName').textContent = w.name; $('wName').style.color = css(w.col); $('wTag').textContent = w.tag;
  if (boss) { setBar('bossBar', boss.hp / boss.hpMax); }
  else if (waveActive) { $('timer').textContent = Math.ceil(waveTime); $('timer').classList.toggle('warn', waveTime < 10); }
}

/* ── weapon pick ── */
function openPick() {
  state = 'pick'; const opts = ['cannon', 'shotgun', 'mgun'];
  const row = $('prow'); row.innerHTML = '';
  opts.forEach(k => { const w = WEAPONS[k]; const el = document.createElement('button'); el.className = 'pcard'; el.style.setProperty('--ac', css(w.col)); el.innerHTML = `<div class="pn">${w.name}</div><div class="pd">${w.tag}</div>`; el.onclick = () => { weapon = k; ship.fireCd = 0; $('pick').classList.remove('on'); state = 'play'; startWave(wave + 1); updateHUD(); sfx('shield'); }; row.appendChild(el); });
  $('pick').classList.add('on');
}

/* ── step ── */
function step(dt) {
  // ── flight model: momentum + quadratic drag + G-force bank/pitch ──
  let tx = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0), tz = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  if (touchMove) { tx = aimX; tz = aimZ; }
  const td = Math.hypot(tx, tz); if (td > 0) { tx /= td; tz /= td; }
  const braking = !!keys['shift'], boosting = !!keys[' '];
  ship.pvx = ship.vx; ship.pvz = ship.vz;
  const accel = cfg.accel * (boosting ? 1.7 : 1);
  ship.vx += tx * accel * dt; ship.vz += tz * accel * dt;
  const sp0 = Math.hypot(ship.vx, ship.vz);
  const kdr = (braking ? 0.18 : 0.018) + (td > 0 ? 0 : 0.012);                 // quadratic + idle drag
  const dragf = 1 - Math.min(0.92, (kdr * sp0 + (braking ? 3.0 : 0.5)) * dt);
  ship.vx *= dragf; ship.vz *= dragf;
  const mx = cfg.maxSpd * (boosting ? 1.4 : 1), sp = Math.hypot(ship.vx, ship.vz); if (sp > mx) { ship.vx *= mx / sp; ship.vz *= mx / sp; }
  ship.x += ship.vx * dt; ship.z += ship.vz * dt;
  // wrap around the screen edges (appear on the other side)
  if (ship.x > WRAPX) ship.x = -WRAPX; else if (ship.x < -WRAPX) ship.x = WRAPX;
  if (ship.z > WRAPZ) ship.z = -WRAPZ; else if (ship.z < -WRAPZ) ship.z = WRAPZ;
  ship.ang = Math.atan2(aimX, aimZ);
  ship.obj.position.set(ship.x, 1.4, ship.z); ship.yaw.rotation.y = ship.ang;
  // banking/pitch from actual acceleration (feels like real G)
  const ax = (ship.vx - ship.pvx) / dt, az = (ship.vz - ship.pvz) / dt, ca = Math.cos(ship.ang), sa = Math.sin(ship.ang);
  const latA = ax * ca - az * sa, fwdA = ax * sa + az * ca;
  ship.bank = lerpAng(ship.bank, clamp(-latA * 0.013, -0.7, 0.7), 0.16);
  ship.pitch = lerpAng(ship.pitch, clamp(-fwdA * 0.006, -0.32, 0.32), 0.12);
  ship.tilt.rotation.z = ship.bank; ship.tilt.rotation.x = ship.pitch;
  // engine flame + trail
  const thr = Math.hypot(tx, tz);
  const flScale = 0.5 + thr * (boosting ? 2.3 : 1.1) + Math.random() * 0.25; ship.flame.visible = thr > 0.08 || sp > 6;
  for (const fl of ship.flame.children) { fl.scale.z = flScale; fl.material.color.setHex(boosting ? COL.gold : ship.engCol); }
  if ((thr > 0.08 || sp > 4) && Math.random() < 0.7) trail(ship.x - aimX * 2.4, ship.z - aimZ * 2.4, boosting ? COL.gold : COL.pc, sp);
  if (ship.hurtT > 0) { ship.hurtT -= dt; ship.obj.visible = Math.floor(t * 30) % 2 === 0; } else ship.obj.visible = true;
  ship.invuln = Math.max(0, ship.invuln - dt);
  // shield regen
  ship.shCd = Math.max(0, ship.shCd - dt); if (ship.shCd <= 0 && ship.sh < ship.shMax) ship.sh = clamp(ship.sh + cfg.shRegen * dt, 0, ship.shMax);
  if (ship.hp < ship.hpMax) ship.hp = clamp(ship.hp + cfg.hpRegen * dt, 0, ship.hpMax);   // regen (test mode)
  // heal at the satellite
  const dSat = Math.hypot(ship.x, ship.z);
  if (dSat < 4.2) { const k = 4.2 / (dSat || 1); ship.x *= k; ship.z *= k; }   // don't sit inside it
  if (dSat < SAT.r) { ship.hp = clamp(ship.hp + 30 * dt, 0, ship.hpMax); ship.sh = clamp(ship.sh + 18 * dt, 0, ship.shMax); SAT.heal = 1; }
  // fire (Ion Cannon charges while held, releases on let-go)
  const W = WEAPONS[weapon];
  if (W.charge) {
    if (firing) { ship.chargeT = Math.min(1.2, ship.chargeT + dt); }
    else if (ship.chargeT > 0.05) { fireWeapon(0.5 + (ship.chargeT / 1.2) * 2.0); ship.chargeT = 0; }
    else ship.chargeT = 0;
  } else { ship.chargeT = 0; ship.fireCd -= dt; if (firing && ship.fireCd <= 0) { fireWeapon(1); ship.fireCd = W.rate; } }

  // continuous enemy flow (test mode) — capped at 30 on field
  spawnT -= dt; if (spawnT <= 0 && enemies.length < 30) { spawnEnemy(TEST_POOL[(Math.random() * TEST_POOL.length) | 0]); spawnT = 0.5; }

  // enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i], d = e.def;
    const dsx = ship.x - e.x, dsz = ship.z - e.z, ds = Math.hypot(dsx, dsz) || 1;
    let dx, dz;
    if (d.mode === 'ranged') { if (ds < 22) { dx = -dsx / ds; dz = -dsz / ds; } else { dx = dsx / ds; dz = dsz / ds; } e.fireCd -= dt; if (e.fireCd <= 0 && ds < 34) { e.fireCd = 1.6; const a = Math.atan2(dsz, dsx); const m = new THREE.Mesh(G.ebul, emit(d.col, 1.2)); m.position.set(e.x, 1.5, e.z); scene.add(m); ebul.push({ m, vx: Math.cos(a) * 34, vz: Math.sin(a) * 34, dmg: d.dmg, life: 3 }); } }
    else { dx = dsx / ds; dz = dsz / ds; }
    // separation: keep ship-like spacing instead of stacking
    let sepx = 0, sepz = 0;
    for (let j = 0; j < enemies.length; j++) { if (j === i) continue; const o = enemies[j]; const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz), want = e.def.r + o.def.r + 1.4; if (od > 0.001 && od < want) { sepx += (ox / od) * (want - od); sepz += (oz / od) * (want - od); } }
    dx += sepx * 0.5; dz += sepz * 0.5;
    e.vx += dx * d.sp * 4 * dt; e.vz += dz * d.sp * 4 * dt; const edf = 1 / (1 + 1.6 * dt); e.vx *= edf; e.vz *= edf;
    const es = Math.hypot(e.vx, e.vz), em = d.sp; if (es > em) { e.vx *= em / es; e.vz *= em / es; }
    e.x += e.vx * dt; e.z += e.vz * dt;
    if (e.x > WRAPX) e.x = -WRAPX; else if (e.x < -WRAPX) e.x = WRAPX; if (e.z > WRAPZ) e.z = -WRAPZ; else if (e.z < -WRAPZ) e.z = WRAPZ;
    e.ang = Math.atan2(e.vx, e.vz);
    // bank into turns like a real craft
    const turn = ((e.ang - e.pang + Math.PI * 3) % (Math.PI * 2)) - Math.PI; e.pang = e.ang;
    e.bank = lerpAng(e.bank, clamp(-turn * 5, -0.5, 0.5), 0.2);
    e.bob += dt * 3; e.m.g.position.set(e.x, Math.sin(e.bob) * 0.18, e.z); e.m.g.rotation.set(0, e.ang, e.bank);
    if (e.warp > 0) { e.warp -= dt; const wk = 1 - Math.max(0, e.warp) / 0.45; e.m.g.scale.setScalar(0.2 + 0.8 * wk); } else e.m.g.scale.setScalar(1);
    if (e.m.flame) { e.m.flame.scale.z = 0.4 + es * 0.08 + Math.random() * 0.2; e.m.flame.visible = es > 0.6; }
    // engine jet stream trailing behind the craft through space
    if (es > 4 && parts.length < PART_CAP - 90 && Math.random() < 0.22) { const inv = 1 / es; trail(e.x - e.vx * inv * (d.r + 0.6), e.z - e.vz * inv * (d.r + 0.6), d.col, es); }
    e.m.body.material.emissiveIntensity = e.hitT > 0 ? 1.8 : 0.55; e.hitT = Math.max(0, e.hitT - dt);
    if (ds < ship.r + d.r) { const nx = (e.x - ship.x) / ds, nz = (e.z - ship.z) / ds; e.vx += nx * 18; e.vz += nz * 18; ship.vx -= nx * 6; ship.vz -= nz * 6; e.hp -= 5; e.hitT = 0.1; hurtShip(d.dmg * (d.mode === 'kamikaze' ? 3 : dt * 2.0)); if (d.mode === 'kamikaze') { burst(e.x, e.z, d.col, 12, 16, true); killEnemy(e, i); continue; } if (e.hp <= 0) { killEnemy(e, i); continue; } }
  }
  // ── ship-to-ship collisions (friendly fire: half damage + repel; hard hits break) ──
  for (let i = 0; i < enemies.length; i++) { for (let j = i + 1; j < enemies.length; j++) {
    const a = enemies[i], b = enemies[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), min = a.def.r + b.def.r;
    if (d > 0.001 && d < min) {
      const nx = dx / d, nz = dz / d, push = (min - d) * 0.5;
      a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push;
      const rel = Math.abs((b.vx - a.vx) * nx + (b.vz - a.vz) * nz), dmg = (1.5 + rel * 0.5) * 0.5, imp = Math.min(22, 7 + rel);
      a.hp -= dmg; b.hp -= dmg; a.hitT = b.hitT = 0.1;
      a.vx -= nx * imp; a.vz -= nz * imp; b.vx += nx * imp; b.vz += nz * imp;
      if (rel > 10 && Math.random() < 0.4) burst((a.x + b.x) / 2, 1.4, (a.z + b.z) / 2, a.def.col, 3, 12);
    }
  } }
  for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].hp <= 0) killEnemy(enemies[i], i);

  // boss
  if (boss) bossLogic(dt);

  // player bullets
  for (let i = pbul.length - 1; i >= 0; i--) {
    const b = pbul[i];
    // homing missiles steer toward the nearest enemy
    if (b.homing) { let best = null, bd = 1e9; for (const e of enemies) { const dd = (e.x - b.m.position.x) ** 2 + (e.z - b.m.position.z) ** 2; if (dd < bd) { bd = dd; best = e; } } if (best) { const sp = Math.hypot(b.vx, b.vz) || 1, dx = best.x - b.m.position.x, dz = best.z - b.m.position.z, dd = Math.hypot(dx, dz) || 1; b.vx += (dx / dd * sp - b.vx) * 0.10; b.vz += (dz / dd * sp - b.vz) * 0.10; const s2 = Math.hypot(b.vx, b.vz); b.vx = b.vx / s2 * sp; b.vz = b.vz / s2 * sp; b.m.rotation.y = Math.atan2(b.vx, b.vz); } }
    b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; b.life -= dt; let dead = b.life <= 0;
    if (b.splash) { for (const e of enemies) if (Math.hypot(e.x - b.m.position.x, e.z - b.m.position.z) < e.def.r + 1.2) { dead = true; break; } }
    if (!b.splash) for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if (Math.hypot(e.x - b.m.position.x, e.z - b.m.position.z) < e.def.r + 1) { e.hp -= b.dmg; e.hitT = 0.12; const bs = Math.hypot(b.vx, b.vz) || 1, kb = b.dmg * 0.55 / Math.max(1, e.def.r); e.vx += (b.vx / bs) * kb; e.vz += (b.vz / bs) * kb; burst(b.m.position.x, b.m.position.z, e.def.col, 3, 9); if (e.hp <= 0) killEnemy(e, j); dead = true; break; } }
    if (dead && b.splash) explode(b.m.position.x, b.m.position.z, b.splash, b.dmg, b.col);
    if (dead) { scene.remove(b.m); pbul.splice(i, 1); }
  }
  // enemy bullets
  for (let i = ebul.length - 1; i >= 0; i--) { const b = ebul[i]; b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; b.life -= dt; if (Math.hypot(ship.x - b.m.position.x, ship.z - b.m.position.z) < ship.r + 0.5) { hurtShip(b.dmg); scene.remove(b.m); ebul.splice(i, 1); continue; } if (b.life <= 0) { scene.remove(b.m); ebul.splice(i, 1); } }

  // particles
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt; const k = p.life / p.max;
    if (p.ring) { const rr = p.r0 + (p.r1 - p.r0) * (1 - k); p.m.scale.set(rr, rr, 1); p.m.material.opacity = k; }
    else if (p.flash) { const s = 0.4 + (1 - k) * p.r1; p.m.scale.setScalar(s); p.m.material.opacity = 0.95 * k; }
    else if (p.trail) { p.m.position.x += p.vx * dt; p.m.position.z += p.vz * dt; p.vx *= 0.9; p.vz *= 0.9; p.m.scale.setScalar(Math.max(0.02, k * 0.9)); }
    else { p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.vy -= 5 * dt; p.vx *= 0.94; p.vz *= 0.94; p.m.scale.setScalar(Math.max(0.02, k)); }
    if (p.life <= 0) { scene.remove(p.m); if (p.dispose) p.m.material.dispose(); parts.splice(i, 1); }
  }

  shakeAmt = Math.max(0, shakeAmt - dt * 2.2);
  updateHUD();
}

function bossLogic(dt) {
  const b = boss; b.hitT = Math.max(0, b.hitT - dt); b.halo.rotation.z += dt * 0.6; b.eye.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.3; b.g.rotation.y += dt * 0.2;
  b.core.material.emissive.setHex(b.hitT > 0 ? 0xffffff : COL.mag); b.core.material.emissiveIntensity = b.hitT > 0 ? 1 : 0.4;
  if (b.st === 'enter') { b.z += (-(ARENA - 26) - b.z) * Math.min(1, dt * 1.1); if (Math.abs(b.z - (-(ARENA - 26))) < 2) { b.st = 'fight'; b.stT = 2; } b.g.position.set(b.x, 0, b.z); return; }
  b.x += Math.sin(t * 0.6) * 7 * dt; b.z += Math.cos(t * 0.4) * 4 * dt; b.g.position.set(b.x, 0, b.z); b.g.lookAt(ship.x, 3.5, ship.z);
  b.stT -= dt; b.fcd -= dt;
  if (b.stT <= 0) { b.st = ['spread', 'aimed', 'ring', 'aimed'][(Math.random() * 4) | 0]; b.stT = 2.2; if (b.st === 'ring') bossRing(); if (b.st === 'spread') for (let k = -2; k <= 2; k++) { const a = Math.atan2(ship.z - b.z, ship.x - b.x) + k * 0.22; bossShot(a, 30); } }
  if (b.st === 'aimed' && b.fcd <= 0) { b.fcd = 0.45; const a = Math.atan2(ship.z - b.z, ship.x - b.x); bossShot(a, 40); }
  if (Math.hypot(ship.x - b.x, ship.z - b.z) < 9 + ship.r) hurtShip(18 * dt);
}
function bossShot(a, sp) { const m = new THREE.Mesh(G.ebul, emit(COL.mag, 1.2)); m.scale.setScalar(1.2); m.position.set(boss.x, 3.5, boss.z); scene.add(m); ebul.push({ m, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, dmg: 11, life: 4 }); }
function bossRing() { for (let i = 0; i < 24; i++) bossShot((i / 24) * TAU, 24); sfx('boss'); shake(0.25); }
function bossDie() { burst(boss.x, boss.z, COL.mag, 60, 30, true); shockring(boss.x, boss.z, COL.mag, 30); shake(1); sfx('win'); score += 1000; scene.remove(boss.g); boss = null; setTimeout(() => endGame(true), 900); }

/* ── camera ── */
const _camT = new THREE.Vector3(CAM_H * 0, CAM_H, CAM_Z), camLook = new THREE.Vector3(0, 0, 0);
function updateCamera(snap) {
  let shx = 0, shy = 0; if (shakeAmt > 0.001) { shx = (Math.random() - 0.5) * shakeAmt * 8; shy = (Math.random() - 0.5) * shakeAmt * 8; }
  let lx = 0, ly = 0, lz = 0;
  if (state === 'title') {                                   // cinematic hero-orbit around the ship
    const a = t * 0.14; _camT.set(Math.sin(a) * 17, 6.5, Math.cos(a) * 17); ly = 2.4;
  } else {                                                   // static top-down gameplay framing
    _camT.set(shx, CAM_H, CAM_Z + shy);
  }
  const k = snap ? 1 : (state === 'title' ? 0.04 : 0.12);
  camera.position.lerp(_camT, k);
  camLook.lerp(new THREE.Vector3(lx, ly, lz), snap ? 1 : 0.08);
  camera.lookAt(camLook);
}

/* ── ambient anim (always) ── */
function ambient(dt) {
  if (SAT.core) { SAT.core.rotation.y += dt * 0.6; SAT.core.rotation.x += dt * 0.3; }
  if (SAT.ring) { SAT.heal = Math.max(0, SAT.heal - dt); SAT.ring.material.opacity = 0.32 + Math.abs(Math.sin(t * 2)) * 0.14 + SAT.heal * 0.4; SAT.ring.rotation.z += dt * 0.5; }
  reticle.material.opacity = state === 'play' ? 0.3 : 0; reticle.rotation.z += dt;
  if (SAT.g) SAT.g.visible = state === 'play';              // satellite only in flight (keeps the menu hero clean)
  // ship showcase on the main menu — slow hero spin + idle glow; hidden on other overlays
  if (ship.obj) {
    if (state === 'title') {
      ship.obj.visible = true; ship.obj.position.set(0, 2.2 + Math.sin(t * 0.8) * 0.35, 0);
      ship.yaw.rotation.y += dt * 0.3; ship.tilt.rotation.x = -0.16; ship.tilt.rotation.z = Math.sin(t * 0.4) * 0.1;
      ship.flame.visible = true; for (const fl of ship.flame.children) { fl.scale.z = 0.7 + Math.sin(t * 9) * 0.15; fl.material.color.setHex(ship.engCol); }
    } else if (state !== 'play') ship.obj.visible = false;
  }
}

/* ── mini 3D viewports: menu pilot (skeleton) + hangar ship (rotatable) ── */
function makeMini(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.2;
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  sc.add(new THREE.AmbientLight(0x7d93bd, 1.15));
  const k = new THREE.DirectionalLight(0xffffff, 1.55); k.position.set(4, 7, 6); sc.add(k);
  const fill = new THREE.DirectionalLight(0xbcd4ff, 0.6); fill.position.set(-2, 3, 8); sc.add(fill);
  const rim = new THREE.DirectionalLight(COL.cyan, 0.9); rim.position.set(-5, 2, -5); sc.add(rim);
  let cw = 0, ch = 0;
  function render() { const w = canvas.clientWidth || 300, h = canvas.clientHeight || 300; if (w !== cw || h !== ch) { cw = w; ch = h; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } r.render(sc, cam); }
  return { r, sc, cam, render };
}

// procedural sci-fi skeleton in a flight helmet — rigged for breathe + walk-in-place
function buildPilot() {
  const group = new THREE.Group();
  const bone = new THREE.MeshStandardMaterial({ color: 0xe5eef6, emissive: 0x2a3f55, emissiveIntensity: 0.25, roughness: 0.5, metalness: 0.2, flatShading: true });
  const suit = new THREE.MeshStandardMaterial({ color: 0x1a3550, emissive: COL.cyan, emissiveIntensity: 0.12, roughness: 0.5, metalness: 0.5, flatShading: true });
  const shell = new THREE.MeshStandardMaterial({ color: 0x223247, roughness: 0.4, metalness: 0.7, flatShading: true });
  const visor = new THREE.MeshStandardMaterial({ color: 0x07414f, emissive: COL.cyan, emissiveIntensity: 1.3, roughness: 0.2, metalness: 0.4 });
  const accent = new THREE.MeshStandardMaterial({ color: COL.lime, emissive: COL.lime, emissiveIntensity: 1.0, roughness: 0.3 });
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const M = (g, m) => new THREE.Mesh(g, m);

  const root = new THREE.Group(); group.add(root);
  const pelvis = new THREE.Group(); pelvis.position.y = 2.0; root.add(pelvis);
  pelvis.add(M(B(0.55, 0.3, 0.32), bone));
  // spine vertebrae
  const spine = new THREE.Group(); spine.position.y = 0.18; pelvis.add(spine);
  for (let i = 0; i < 4; i++) { const v = M(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6), bone); v.position.y = i * 0.16; spine.add(v); }
  const chest = new THREE.Group(); chest.position.y = 0.72; spine.add(chest);
  // ribcage
  chest.add((() => { const s = M(B(0.12, 0.6, 0.12), bone); s.position.set(0, -0.02, 0.16); return s; })());
  for (let i = 0; i < 3; i++) { const ry = 0.16 - i * 0.18; for (const s of [-1, 1]) { const rib = M(new THREE.TorusGeometry(0.26, 0.035, 6, 10, Math.PI), bone); rib.position.set(0, ry, 0); rib.rotation.set(Math.PI / 2, 0, s > 0 ? 0 : Math.PI); chest.add(rib); } }
  const clav = M(B(0.7, 0.08, 0.1), bone); clav.position.set(0, 0.3, 0.05); chest.add(clav);
  const plate = M(B(0.5, 0.4, 0.16), suit); plate.position.set(0, 0.02, 0.12); chest.add(plate);
  const cglow = M(B(0.14, 0.14, 0.05), accent); cglow.position.set(0, 0.05, 0.22); chest.add(cglow);
  // neck + head + helmet
  const neck = M(new THREE.CylinderGeometry(0.08, 0.09, 0.18, 6), bone); neck.position.y = 0.42; chest.add(neck);
  const head = new THREE.Group(); head.position.y = 0.62; chest.add(head);
  const skull = M(new THREE.SphereGeometry(0.2, 14, 12), bone); skull.scale.set(1, 1.05, 1.05); head.add(skull);
  const jaw = M(B(0.2, 0.1, 0.18), bone); jaw.position.set(0, -0.18, 0.02); head.add(jaw);
  const helm = M(new THREE.SphereGeometry(0.27, 16, 12, 0, TAU, 0, Math.PI * 0.62), shell); helm.position.y = 0.02; head.add(helm);
  const vis = M(new THREE.SphereGeometry(0.235, 16, 10, Math.PI * 0.16, Math.PI * 0.68, Math.PI * 0.32, Math.PI * 0.42), visor); head.add(vis);
  for (const s of [-1, 1]) { const pod = M(B(0.07, 0.18, 0.14), shell); pod.position.set(s * 0.27, 0, 0); head.add(pod); }
  const crest = M(B(0.05, 0.06, 0.3), accent); crest.position.set(0, 0.22, 0); head.add(crest);
  // arms
  function arm(s) {
    const sh = new THREE.Group(); sh.position.set(s * 0.4, 0.28, 0); chest.add(sh);
    sh.add(M(B(0.16, 0.16, 0.16), shell));
    const up = M(B(0.12, 0.5, 0.12), bone); up.position.y = -0.25; sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.5; sh.add(el);
    const fore = M(B(0.1, 0.46, 0.1), bone); fore.position.y = -0.23; el.add(fore);
    const hand = M(B(0.13, 0.16, 0.08), suit); hand.position.y = -0.5; el.add(hand);
    return { sh, el };
  }
  const aL = arm(-1), aR = arm(1);
  // legs
  function leg(s) {
    const hip = new THREE.Group(); hip.position.set(s * 0.18, -0.05, 0); pelvis.add(hip);
    const thigh = M(B(0.16, 0.92, 0.16), bone); thigh.position.y = -0.46; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -0.92; hip.add(knee);
    const shin = M(B(0.13, 0.82, 0.13), bone); shin.position.y = -0.41; knee.add(shin);
    const foot = M(B(0.18, 0.1, 0.36), shell); foot.position.set(0, -0.85, 0.08); knee.add(foot);
    return { hip, knee };
  }
  const lL = leg(-1), lR = leg(1);
  group.add((() => { const g = new THREE.PointLight(COL.cyan, 6, 12); g.position.set(0, 2.2, 1.6); return g; })());

  const j = { root, pelvis, chest, head, shL: aL.sh, elL: aL.el, shR: aR.sh, elR: aR.el, hipL: lL.hip, kneeL: lL.knee, hipR: lR.hip, kneeR: lR.knee };
  return { group, j };
}

let pilotMini = null, pilot = null, shipMini = null, shipMiniModel = null, shipMiniHolder = null;
let shipSpin = -0.5, shipPitch = 0.14, shipDrag = false, shipPX = 0, shipPY = 0;
function initMinis() {
  const pc = $('pilotCv');
  if (pc) { pilotMini = makeMini(pc); pilot = buildPilot(); pilotMini.sc.add(pilot.group); pilotMini.cam.position.set(0.4, 2.15, 7.6); pilotMini.cam.lookAt(0, 1.85, 0); }
  const sv = $('shipCv');
  if (sv) {
    shipMini = makeMini(sv); shipMiniHolder = new THREE.Group(); shipMiniModel = buildShipModel(); shipMiniHolder.add(shipMiniModel.group); shipMini.sc.add(shipMiniHolder);
    shipMini.cam.position.set(0, 2.4, 10); shipMini.cam.lookAt(0, 0, 0);
    sv.addEventListener('pointerdown', e => { shipDrag = true; shipPX = e.clientX; shipPY = e.clientY; try { sv.setPointerCapture(e.pointerId); } catch (x) {} });
    sv.addEventListener('pointermove', e => { if (!shipDrag) return; shipSpin += (e.clientX - shipPX) * 0.01; shipPitch = clamp(shipPitch + (e.clientY - shipPY) * 0.006, -0.4, 0.7); shipPX = e.clientX; shipPY = e.clientY; });
    addEventListener('pointerup', () => { shipDrag = false; });
    shipMiniModel.parts.shield.visible = false;
    updateShipMiniTint();
  }
}
function animatePilot() {
  if (!pilot) return; const j = pilot.j, walk = t * 2.4, sw = Math.sin(walk), sw2 = Math.sin(walk + Math.PI);
  j.hipL.rotation.x = sw * 0.5; j.hipR.rotation.x = sw2 * 0.5;
  j.kneeL.rotation.x = Math.max(0, -Math.cos(walk)) * 0.95; j.kneeR.rotation.x = Math.max(0, -Math.cos(walk + Math.PI)) * 0.95;
  j.shL.rotation.x = sw2 * 0.45; j.shR.rotation.x = sw * 0.45;
  j.elL.rotation.x = -0.3 - Math.max(0, sw2) * 0.35; j.elR.rotation.x = -0.3 - Math.max(0, sw) * 0.35;
  const br = Math.sin(t * 1.6) * 0.03; j.chest.scale.set(1 + br, 1 + br * 0.6, 1 + br);
  j.root.position.y = Math.abs(Math.sin(walk)) * 0.06;
  j.pelvis.rotation.y = Math.sin(walk) * 0.06; j.head.rotation.x = Math.sin(t * 0.9) * 0.05;
  j.root.rotation.y = Math.sin(t * 0.4) * 0.6;
}
function animateShipMini(dt) {
  if (!shipMiniModel) return;
  if (!shipDrag) shipSpin += 0.5 * dt;
  shipMiniHolder.rotation.y = shipSpin; shipMiniHolder.rotation.x = shipPitch;
  shipMiniHolder.position.y = Math.sin(t * 0.9) * 0.15;
  for (const f of shipMiniModel.flame.children) f.scale.z = 0.8 + Math.sin(t * 9) * 0.2;
}
function updateShipMiniTint() { if (shipMiniModel) tintShipModel(shipMiniModel, loadout); }

/* ── loop ── */
let lastT = performance.now();
function loop(now) { requestAnimationFrame(loop); const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; t += dt; if (innerWidth !== W || innerHeight !== H) { resize(); computeWrap(); } document.body.classList.toggle('playing', state === 'play'); if (state === 'play') step(dt); ambient(dt); updateCamera(); composer.render(); drawHUD2D();
  if (state === 'title' && pilotMini) { animatePilot(); pilotMini.render(); }
  else if (state === 'loadout' && shipMini) { animateShipMini(dt); shipMini.render(); }
}
requestAnimationFrame(loop);

/* ── boot ── */
function newRun() {
  applyLoadout();
  Object.assign(ship, { x: 0, z: 22, vx: 0, vz: 0, ang: Math.PI, sh: 0, shCd: 0, fireCd: 0, chargeT: 0, hurtT: 0, invuln: 0 });
  ship.hp = ship.hpMax;
  for (const e of enemies) { scene.remove(e.m.g); e.m.body.material.dispose(); } enemies.length = 0;
  for (const b of pbul) scene.remove(b.m); pbul.length = 0;
  for (const b of ebul) scene.remove(b.m); ebul.length = 0;
  for (const p of parts) { scene.remove(p.m); if (p.dispose) p.m.material.dispose(); } parts.length = 0;
  if (boss) { scene.remove(boss.g); boss = null; }
  kills = 0; score = 0; wave = 1; $('bossbar').classList.remove('on'); $('timer').style.display = 'none';
  $('status').textContent = 'WEAPON TEST · FREE FLIGHT';
  ship.tilt.rotation.set(0, 0, 0);                          // reset hero-pose tilt from the menu
  state = 'play'; $('title').classList.remove('on'); $('pause').classList.remove('on'); $('loadout').classList.remove('on');
  updateCamera(true); computeWrap(); updateWeaponHUD(); spawnT = 0.4;
  updateHUD(); startMusic();
}
function refreshMenuStats() { if ($('psBest')) $('psBest').textContent = best; if ($('psThreat')) $('psThreat').textContent = localStorage.getItem('bdg3d_threats') || 0; }
$('loading').style.display = 'none';
initMinis();
refreshMenuStats();
$('startBtn').onclick = () => { try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {} startMusic(); newRun(); };
$('retryBtn').onclick = () => { $('over').classList.remove('on'); newRun(); };
$('muteBtn').onclick = () => { setMuted(!isMuted()); $('muteBtn').textContent = isMuted() ? '♪ SOUND OFF' : '♪ SOUND ON'; };
function togglePause() { if (state === 'play') { state = 'pause'; firing = false; $('pause').classList.add('on'); } else if (state === 'pause') { state = 'play'; $('pause').classList.remove('on'); } }
$('pauseBtn').onclick = togglePause;
$('resumeBtn').onclick = () => { if (state === 'pause') togglePause(); };
function saveStats() { if (score > best) { best = score; localStorage.setItem('bdg3d_best', best); } const tb = Math.max(kills, +(localStorage.getItem('bdg3d_threats') || 0)); localStorage.setItem('bdg3d_threats', tb); }
$('menuBtn').onclick = () => { saveStats(); state = 'title'; firing = false; $('pause').classList.remove('on'); $('title').classList.add('on'); refreshMenuStats(); };

/* ── hangar / loadout screen ── */
let loSlot = 'weapon';
function openLoadout() { state = 'loadout'; firing = false; $('title').classList.remove('on'); $('pause').classList.remove('on'); $('loadout').classList.add('on'); shipSpin = -0.5; shipPitch = 0.14; renderLoadout(); }
function renderLoadout() {
  const tabs = [['weapon', 'WEAPON'], ['shield', 'SHIELD'], ['engine', 'ENGINE'], ['hull', 'HULL']];
  $('loTabs').innerHTML = tabs.map(([s, n]) => `<button class="lo-tab ${s === loSlot ? 'on' : ''}" data-slot="${s}">${n}</button>`).join('');
  $('loTabs').querySelectorAll('.lo-tab').forEach(b => b.onclick = () => { loSlot = b.dataset.slot; sfx('hit'); renderLoadout(); });
  ['weapon', 'shield', 'engine', 'hull'].forEach(s => { const el = document.getElementById('slot-' + s); if (el) el.setAttribute('opacity', s === loSlot ? '1' : '0.4'); });
  $('loSlotName').textContent = loSlot === 'weapon' ? 'PRIMARY WEAPON' : loSlot.toUpperCase() + ' MODULE';
  let opts, cur;
  if (loSlot === 'weapon') { opts = WEAPON_ORDER.map(k => ({ id: k, name: WEAPONS[k].name, desc: WEAPONS[k].tag, col: WEAPONS[k].col })); cur = loadout.weapon; }
  else { opts = MODULES[loSlot].map(m => ({ id: m.id, name: m.name, desc: m.desc, col: m.col })); cur = loadout[loSlot]; }
  $('loOptions').innerHTML = opts.map(o => `<button class="lo-opt ${o.id === cur ? 'on' : ''}" data-id="${o.id}" style="--oc:${css(o.col)}"><div class="on-name">${o.name}</div><div class="on-desc">${o.desc}</div>${o.id === cur ? '<span class="on-eq">▸ EQUIPPED</span>' : ''}</button>`).join('');
  $('loOptions').querySelectorAll('.lo-opt').forEach(b => b.onclick = () => { loadout[loSlot] = b.dataset.id; applyLoadout(); sfx('buy'); renderLoadout(); });
  applyLoadout();
  const w = WEAPONS[loadout.weapon], fire = (w.dmg * (w.count || 1)) / w.rate;
  const stats = [['FIREPOWER', clamp(fire / 700, 0.08, 1)], ['SPEED', clamp(cfg.maxSpd / 140, 0, 1)], ['HULL', clamp(ship.hpMax / 165, 0, 1)], ['SHIELD', clamp(ship.shMax / 95, 0, 1)]];
  $('loStats').innerHTML = stats.map(([n, v]) => `<div class="lo-st">${n}<div class="bar"><i style="width:${Math.round(v * 100)}%"></i></div></div>`).join('');
  updateShipMiniTint();
  if (shipMiniModel) shipMiniModel.parts.shield.visible = (loSlot === 'shield');
}
$('loadoutBtn').onclick = openLoadout;
$('loadoutBtn2').onclick = openLoadout;
$('loBack').onclick = () => { $('loadout').classList.remove('on'); state = 'title'; $('title').classList.add('on'); refreshMenuStats(); };
$('loLaunch').onclick = () => { try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {} startMusic(); newRun(); };

window.__M = {
  get state() { return state; }, get wave() { return wave; }, get enemies() { return enemies.length; }, get hp() { return Math.round(ship.hp); }, get boss() { return boss ? Math.round(boss.hp) : null; }, get score() { return score; },
  get pbul() { return pbul.length; }, get ehp() { return Math.round(enemies.reduce((s, e) => s + e.hp, 0)); },
  aimAtNearest() { let b = null, bd = 1e9; for (const e of enemies) { const dd = (e.x - ship.x) ** 2 + (e.z - ship.z) ** 2; if (dd < bd) { bd = dd; b = e; } } if (b) { const dx = b.x - ship.x, dz = b.z - ship.z, d = Math.hypot(dx, dz) || 1; aimX = dx / d; aimZ = dz / d; } return b ? Math.round(Math.sqrt(bd)) : -1; },
  press(k, v = true) { keys[k] = v; }, fire(v = true) { firing = v; }, aim(x, y) { aimFrom(x, y); },
  sim(s) { const n = Math.round(s / 0.016); for (let i = 0; i < n; i++) { if (state === 'play') step(0.016); ambient(0.016); updateCamera(); t += 0.016; } return 'ok'; },
  skipDlg() { while (state === 'dialog') advanceDlg(); },
};
