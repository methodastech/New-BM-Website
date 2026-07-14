// METHODUS · DEEP RUN — self-contained 3D orbital-defense survival.
// Three.js, angled top-down, procedural realism. No external model files.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { sfx, setMuted, isMuted } from './audio.js';

// ───────────────────────── renderer / scene / camera ─────────────────────────
const cvs = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04060b);
scene.fog = new THREE.FogExp2(0x05070e, 0.0052);

const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 2000);
const CAM_OFF = new THREE.Vector3(0, 62, 40); // angled top-down
const camFocus = new THREE.Vector3();

let W = 0, H = 0, composer, bloom;
function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  if (!composer) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.95, 0.55, 0.82);
    composer.addPass(bloom);
  }
  composer.setSize(W, H);
  bloom.resolution.set(W, H);
}
addEventListener('resize', resize);

// ───────────────────────── lighting ─────────────────────────
scene.add(new THREE.AmbientLight(0x2b3a52, 0.85));
const key = new THREE.DirectionalLight(0xcfe6ff, 1.25);
key.position.set(40, 90, 30);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -120; key.shadow.camera.right = 120;
key.shadow.camera.top = 120; key.shadow.camera.bottom = -120;
key.shadow.camera.near = 10; key.shadow.camera.far = 260;
key.shadow.bias = -0.0006;
scene.add(key);
const rim = new THREE.DirectionalLight(0xff7a3a, 0.45); rim.position.set(-50, 24, -40); scene.add(rim);
const fillL = new THREE.PointLight(0x39d7e6, 0.6, 200); fillL.position.set(0, 30, 0); scene.add(fillL);

// ───────────────────────── starfield + nebula ─────────────────────────
function makeStars(count, spread, size, color) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.4 + Math.random() * 0.6);
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.6 - 30;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false });
  return new THREE.Points(g, m);
}
const stars = makeStars(1800, 900, 1.6, 0xbcd4ff); scene.add(stars);
const stars2 = makeStars(900, 700, 2.6, 0x6f86c9); scene.add(stars2);

// soft nebula clouds (additive sprites)
function nebulaTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.4, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const nbTex = nebulaTex();
[0xff5a1f, 0x39d7e6, 0xe0447c, 0x6d4ea8].forEach((col, i) => {
  const m = new THREE.SpriteMaterial({ map: nbTex, color: col, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m);
  const a = i / 4 * Math.PI * 2;
  s.position.set(Math.cos(a) * 300, -120 + i * 18, Math.sin(a) * 300 - 200);
  s.scale.setScalar(420 + i * 60);
  scene.add(s);
});

// ───────────────────────── battlefield grid disc ─────────────────────────
const FIELD = 92;
function gridTex() {
  const s = 1024, c = document.createElement('canvas'); c.width = c.height = s;
  const x = c.getContext('2d');
  x.fillStyle = '#070b13'; x.fillRect(0, 0, s, s);
  x.strokeStyle = 'rgba(120,150,190,.16)'; x.lineWidth = 2;
  const step = s / 24;
  for (let i = 0; i <= 24; i++) { x.beginPath(); x.moveTo(i * step, 0); x.lineTo(i * step, s); x.stroke(); x.beginPath(); x.moveTo(0, i * step); x.lineTo(s, i * step); x.stroke(); }
  // radial fade
  const g = x.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.5);
  g.addColorStop(0, 'rgba(7,11,19,0)'); g.addColorStop(0.82, 'rgba(7,11,19,0)'); g.addColorStop(1, 'rgba(7,11,19,1)');
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}
const disc = new THREE.Mesh(
  new THREE.CircleGeometry(FIELD, 80),
  new THREE.MeshStandardMaterial({ map: gridTex(), roughness: 0.92, metalness: 0.1, color: 0x9fb2c8 })
);
disc.rotation.x = -Math.PI / 2; disc.position.y = -0.4; disc.receiveShadow = true; scene.add(disc);
// glowing boundary ring
const ring = new THREE.Mesh(new THREE.RingGeometry(FIELD - 1.4, FIELD, 96), new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2; ring.position.y = -0.35; scene.add(ring);

// ───────────────────────── materials ─────────────────────────
const hullMat = (c, rough = 0.38, metal = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal });
const glowMat = (c, i = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4, metalness: 0.2 });
const glassMat = () => new THREE.MeshStandardMaterial({ color: 0x0a2230, emissive: 0x39d7e6, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.85 });

// ───────────────────────── the core station ─────────────────────────
const core = new THREE.Group(); scene.add(core);
{
  const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 3, 8), hullMat(0x1a212d, 0.5, 0.7));
  base.castShadow = base.receiveShadow = true; core.add(base);
  const spire = new THREE.Mesh(new THREE.IcosahedronGeometry(4.2, 0), glowMat(0xc8f02a, 1.4));
  spire.position.y = 5; spire.castShadow = true; core.add(spire);
  core.userData.spire = spire;
  for (let i = 0; i < 2; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(7 + i * 1.8, 0.28, 8, 40), glowMat(i ? 0x39d7e6 : 0xff5a1f, 1.1));
    t.position.y = 5; t.rotation.x = Math.PI / 2 + i * 0.5; core.add(t);
    t.userData.spin = (i ? 0.5 : -0.7);
  }
  // solar panels
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 6), hullMat(0x2a3340));
    arm.position.set(Math.cos(a) * 9, 2, Math.sin(a) * 9); arm.lookAt(0, 2, 0); arm.castShadow = true; core.add(arm);
    const pan = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 3.4), new THREE.MeshStandardMaterial({ color: 0x16324a, emissive: 0x1d4e7a, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6 }));
    pan.position.set(Math.cos(a) * 13, 2, Math.sin(a) * 13); pan.castShadow = true; core.add(pan);
  }
  // shield bubble
  const shield = new THREE.Mesh(new THREE.SphereGeometry(15, 24, 18), new THREE.MeshStandardMaterial({ color: 0x39d7e6, emissive: 0x39d7e6, emissiveIntensity: 0.4, transparent: true, opacity: 0.08, side: THREE.DoubleSide, roughness: 0.2, metalness: 0 }));
  shield.position.y = 3; core.add(shield); core.userData.shield = shield;
}
const CORE_R = 13;

// ───────────────────────── player ship ─────────────────────────
function buildShip() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.05, 4.4, 5), hullMat(0xb9c2cf, 0.32, 0.9));
  body.rotation.x = Math.PI / 2; body.castShadow = true; g.add(body);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 2.4), hullMat(0x5a6675)); spine.position.set(0, 0.25, 0.6); spine.castShadow = true; g.add(spine);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat());
  cockpit.position.set(0, 0.5, -0.5); g.add(cockpit);
  // wings
  [-1, 1].forEach(s => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 1.5), hullMat(0x8b95a4, 0.4, 0.85));
    wing.position.set(s * 1.7, 0, 0.7); wing.rotation.z = s * 0.12; wing.rotation.y = s * 0.18; wing.castShadow = true; g.add(wing);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.1), glowMat(0xc8f02a, 1.6));
    tip.position.set(s * 2.7, 0, 0.9); g.add(tip);
  });
  // engine nozzles + glow
  const plumes = [];
  [-0.7, 0.7].forEach(s => {
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.7, 10), hullMat(0x33404f));
    noz.rotation.x = Math.PI / 2; noz.position.set(s, 0, 2.3); g.add(noz);
    const pl = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.2, 10), new THREE.MeshBasicMaterial({ color: 0x9af4ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    pl.rotation.x = -Math.PI / 2; pl.position.set(s, 0, 3.4); g.add(pl); plumes.push(pl);
  });
  g.userData.plumes = plumes;
  return g;
}
const ship = buildShip(); ship.position.set(0, 1.2, 34); scene.add(ship);
const engineLight = new THREE.PointLight(0x9af4ff, 1.2, 26); scene.add(engineLight);

// ───────────────────────── pools ─────────────────────────
const bulletGeo = new THREE.CapsuleGeometry(0.18, 1.1, 4, 8);
const bullets = [];
function spawnBullet(pos, dir, speed, dmg, color, owner) {
  let b = bullets.find(x => !x.alive);
  if (!b) {
    const mesh = new THREE.Mesh(bulletGeo, new THREE.MeshBasicMaterial({ color }));
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh); b = { mesh, alive: false }; bullets.push(b);
  }
  b.alive = true; b.owner = owner; b.dmg = dmg; b.life = 2.2;
  b.mesh.material.color.set(color);
  b.mesh.visible = true;
  b.mesh.position.copy(pos);
  b.vel = dir.clone().multiplyScalar(speed);
  b.mesh.lookAt(pos.clone().add(dir));
  return b;
}

const enemies = [];
const orbs = [];
const ENEMY_TYPES = {
  raider: { hp: 18, spd: 14, dmg: 9, r: 1.7, col: 0xff5a1f, xp: 4, score: 10, ranged: false },
  drone: { hp: 12, spd: 11, dmg: 6, r: 1.4, col: 0xe0447c, xp: 5, score: 14, ranged: true },
  brute: { hp: 70, spd: 7, dmg: 20, r: 3.0, col: 0xffb061, xp: 14, score: 40, ranged: false },
};
function buildEnemyMesh(type) {
  const t = ENEMY_TYPES[type], g = new THREE.Group();
  if (type === 'brute') {
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 0), hullMat(0x3a2a22, 0.5, 0.7)); b.castShadow = true; g.add(b);
    const cgl = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), glowMat(t.col, 1.4)); g.add(cgl); g.userData.gl = cgl;
  } else if (type === 'drone') {
    const b = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), hullMat(0x2c1f2a, 0.5, 0.8)); b.castShadow = true; g.add(b);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), glowMat(t.col, 1.8)); g.add(e); g.userData.gl = e;
  } else {
    const b = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 4), hullMat(0x3a221a, 0.45, 0.85)); b.rotation.x = -Math.PI / 2; b.castShadow = true; g.add(b);
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.6), glowMat(t.col, 1.6)); e.position.z = -0.6; g.add(e); g.userData.gl = e;
  }
  return g;
}
function spawnEnemy(type) {
  const t = ENEMY_TYPES[type];
  const a = Math.random() * Math.PI * 2, r = FIELD - 2;
  const mesh = buildEnemyMesh(type);
  mesh.position.set(Math.cos(a) * r, 1.2, Math.sin(a) * r);
  scene.add(mesh);
  enemies.push({ mesh, type, hp: t.hp * (1 + wave * 0.08), maxhp: t.hp * (1 + wave * 0.08), t, cd: Math.random() * 2, flash: 0 });
}

const orbGeo = new THREE.IcosahedronGeometry(0.5, 0);
function spawnOrb(pos, val) {
  let o = orbs.find(x => !x.alive);
  if (!o) { const mesh = new THREE.Mesh(orbGeo, glowMat(0xc8f02a, 1.8)); scene.add(mesh); o = { mesh, alive: false }; orbs.push(o); }
  o.alive = true; o.val = val; o.mesh.visible = true;
  o.mesh.position.copy(pos); o.mesh.position.y = 1;
  o.vel = new THREE.Vector3((Math.random() - 0.5) * 8, 0, (Math.random() - 0.5) * 8);
  o.spin = Math.random() * 4;
}

// ───────────────────────── particles (explosions) ─────────────────────────
const sparks = [];
const sparkGeo = new THREE.SphereGeometry(0.3, 6, 6);
function burst(pos, color, n, power) {
  for (let i = 0; i < n; i++) {
    let s = sparks.find(x => !x.alive);
    if (!s) { const mesh = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true })); scene.add(mesh); s = { mesh, alive: false }; sparks.push(s); }
    s.alive = true; s.mesh.visible = true; s.mesh.material.color.set(color); s.mesh.material.opacity = 1;
    s.mesh.position.copy(pos);
    const a = Math.random() * Math.PI * 2, el = (Math.random() - 0.3) * 1.2, sp = power * (0.4 + Math.random());
    s.vel = new THREE.Vector3(Math.cos(a) * Math.cos(el) * sp, Math.sin(el) * sp + 2, Math.sin(a) * Math.cos(el) * sp);
    s.life = 0.5 + Math.random() * 0.5; s.maxlife = s.life;
    const sc = 0.4 + Math.random() * 0.8; s.mesh.scale.setScalar(sc); s.sc = sc;
  }
  const fl = flashPool.find(f => !f.light.visible) || addFlash();
  fl.light.visible = true; fl.light.color.set(color); fl.light.position.copy(pos); fl.life = 0.18;
}
const flashPool = [];
function addFlash() { const light = new THREE.PointLight(0xffffff, 0, 40); light.visible = false; scene.add(light); const f = { light, life: 0 }; flashPool.push(f); return f; }
for (let i = 0; i < 8; i++) addFlash();

// ───────────────────────── damage numbers (DOM) ─────────────────────────
const fxLayer = document.getElementById('fx');
const dmgPool = [];
const tmpV = new THREE.Vector3();
function dmgNumber(pos, text, cls) {
  let d = dmgPool.find(x => !x.busy);
  if (!d) { const el = document.createElement('div'); el.className = 'dmg'; fxLayer.appendChild(el); d = { el, busy: false }; dmgPool.push(d); }
  d.busy = true; d.el.textContent = text; d.el.className = 'dmg ' + (cls || '');
  d.el.style.color = cls === 'crit' ? '#fff' : '#c8f02a';
  d.wp = pos.clone(); d.wp.y += 2; d.life = 0.85; d.maxlife = 0.85; d.vy = 26;
  d.el.style.opacity = '1';
}
function updateDmg(dt) {
  for (const d of dmgPool) {
    if (!d.busy) continue;
    d.life -= dt; d.wp.y += d.vy * dt; d.vy *= 0.92;
    if (d.life <= 0) { d.busy = false; d.el.style.opacity = '0'; continue; }
    tmpV.copy(d.wp).project(camera);
    if (tmpV.z > 1) { d.el.style.opacity = '0'; continue; }
    const x = (tmpV.x * 0.5 + 0.5) * W, y = (-tmpV.y * 0.5 + 0.5) * H;
    d.el.style.transform = `translate(${x - 14}px,${y}px)`;
    d.el.style.opacity = String(Math.min(1, d.life / d.maxlife * 1.6));
  }
}

// ───────────────────────── input ─────────────────────────
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => keys[e.code] = false);
const mouse = new THREE.Vector2();
let firing = false;
const aimPoint = new THREE.Vector3(0, 1.2, 0);
const ray = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.2);
function updateAim(cx, cy) {
  mouse.x = (cx / W) * 2 - 1; mouse.y = -(cy / H) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  ray.ray.intersectPlane(groundPlane, aimPoint);
}
cvs.addEventListener('pointermove', e => updateAim(e.clientX, e.clientY));
cvs.addEventListener('pointerdown', e => { firing = true; updateAim(e.clientX, e.clientY); });
addEventListener('pointerup', () => firing = false);
// touch movement assist
let touchMove = null;
cvs.addEventListener('touchstart', e => { const t = e.touches[0]; touchMove = { x: t.clientX, y: t.clientY }; firing = true; }, { passive: true });
cvs.addEventListener('touchmove', e => { const t = e.touches[0]; if (touchMove) { touchMove.dx = t.clientX - touchMove.x; touchMove.dy = t.clientY - touchMove.y; } }, { passive: true });
cvs.addEventListener('touchend', () => { touchMove = null; firing = false; }, { passive: true });

// ───────────────────────── game state ─────────────────────────
const S = {};
function resetState() {
  S.hull = 100; S.hullMax = 100; S.coreHp = 100; S.coreMax = 100;
  S.vel = new THREE.Vector3(); S.score = 0; S.kills = 0; S.wave = 0; S.xp = 0; S.xpNext = 10; S.level = 1;
  S.fireCd = 0; S.shake = 0; S.boost = 0;
  // upgrade-driven stats
  S.dmg = 10; S.fireRate = 0.16; S.bulletSpd = 90; S.thrust = 64; S.maxSpd = 42; S.multishot = 1; S.spread = 0;
  S.magnet = 9; S.regen = 0; S.regenAcc = 0; S.coreShield = 0; S.pierce = 0; S.lifesteal = 0;
}
let wave = 0, running = false, paused = false, spawnTimer = 0, toSpawn = 0, waveActive = false, waveBreak = 2;

// clear arrays helper
function despawnAll() {
  enemies.forEach(e => scene.remove(e.mesh)); enemies.length = 0;
  bullets.forEach(b => { b.alive = false; b.mesh.visible = false; });
  orbs.forEach(o => { o.alive = false; o.mesh.visible = false; });
  sparks.forEach(s => { s.alive = false; s.mesh.visible = false; });
}

function startGame() {
  resetState(); despawnAll();
  ship.position.set(0, 1.2, 34); S.vel.set(0, 0, 0);
  wave = 0; running = true; paused = false; waveActive = false; waveBreak = 1.2;
  document.getElementById('hud').classList.remove('hidden');
  hideOv('ovStart'); hideOv('ovOver'); hideOv('ovLevel');
  syncHud();
  nextWave();
}
function nextWave() {
  wave++; S.wave = wave; waveActive = true;
  toSpawn = 5 + Math.floor(wave * 2.4);
  spawnTimer = 0;
  document.getElementById('waveV').textContent = wave;
  flashWave();
}
function endWave() { waveActive = false; waveBreak = 3.2; }

// ───────────────────────── upgrades ─────────────────────────
const UPGRADES = [
  { ic: '⚡', n: 'Overclock', d: '+22% fire rate. The barrel never cools.', tag: 'OFFENSE', f: () => S.fireRate *= 0.78 },
  { ic: '🔥', n: 'Heavy Rounds', d: '+40% damage, fire rate −10%.', tag: 'TRADEOFF', down: true, f: () => { S.dmg *= 1.4; S.fireRate *= 1.1; } },
  { ic: '✶', n: 'Split Cannon', d: '+1 projectile, slight spread.', tag: 'OFFENSE', f: () => { S.multishot += 1; S.spread += 0.12; } },
  { ic: '➤', n: 'Railshot', d: 'Bullets pierce +1 target, +12% speed.', tag: 'OFFENSE', f: () => { S.pierce += 1; S.bulletSpd *= 1.12; } },
  { ic: '🜂', n: 'Afterburner', d: '+18% thrust and top speed.', tag: 'MOBILITY', f: () => { S.thrust *= 1.18; S.maxSpd *= 1.14; } },
  { ic: '🛡', n: 'Hull Plating', d: '+30 max hull, full repair.', tag: 'DEFENSE', f: () => { S.hullMax += 30; S.hull = S.hullMax; } },
  { ic: '♻', n: 'Nanorepair', d: 'Hull regenerates +1.4/s.', tag: 'DEFENSE', f: () => S.regen += 1.4 },
  { ic: '◈', n: 'Core Hardening', d: 'Core shield +40, slow self-heal.', tag: 'DEFENSE', f: () => { S.coreMax += 40; S.coreHp += 40; S.coreShield += 0.6; } },
  { ic: '🧲', n: 'Tractor Field', d: '+70% data pickup range.', tag: 'UTILITY', f: () => S.magnet *= 1.7 },
  { ic: '🩸', n: 'Siphon', d: 'Heal 0.6 hull per kill.', tag: 'UTILITY', f: () => S.lifesteal += 0.6 },
];
function offerUpgrades() {
  paused = true;
  const pool = UPGRADES.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  const box = document.getElementById('lvlChoices'); box.innerHTML = '';
  document.getElementById('lvlBig').textContent = S.level;
  pool.forEach(u => {
    const el = document.createElement('div'); el.className = 'choice';
    el.innerHTML = `<div class="ic">${u.ic}</div><div class="cn">${u.n}</div><div class="cd">${u.d}</div><div class="tag ${u.down ? 'down' : ''}">${u.tag}</div>`;
    el.onclick = () => { u.f(); sfx('buy'); hideOv('ovLevel'); paused = false; syncHud(); };
    box.appendChild(el);
  });
  showOv('ovLevel'); sfx('level');
}
function gainXp(v) {
  S.xp += v;
  while (S.xp >= S.xpNext) { S.xp -= S.xpNext; S.level++; S.xpNext = Math.floor(S.xpNext * 1.32 + 6); offerUpgrades(); }
  syncHud();
}

// ───────────────────────── HUD ─────────────────────────
const el = id => document.getElementById(id);
function syncHud() {
  el('hullBar').style.transform = `scaleX(${Math.max(0, S.hull / S.hullMax)})`;
  el('coreBar').style.transform = `scaleX(${Math.max(0, S.coreHp / S.coreMax)})`;
  el('xpBar').style.transform = `scaleX(${S.xp / S.xpNext})`;
  el('hullPct').textContent = Math.max(0, Math.round(S.hull)) + '%';
  el('corePct').textContent = Math.max(0, Math.round(S.coreHp / S.coreMax * 100)) + '%';
  el('xpPct').textContent = Math.round(S.xp / S.xpNext * 100) + '%';
  el('lvlV').textContent = S.level; el('killV').textContent = S.kills; el('scoreV').textContent = S.score;
  el('dpsV').textContent = Math.round(S.dmg / S.fireRate * S.multishot / 10) * 10;
}
function showOv(id) { el(id).classList.add('show'); }
function hideOv(id) { el(id).classList.remove('show'); }
function flashWave() {
  const wb = el('wavebox'); wb.style.transition = 'none'; wb.style.boxShadow = '0 0 0 2px var(--lime)';
  setTimeout(() => { wb.style.transition = 'box-shadow .6s'; wb.style.boxShadow = ''; }, 60);
}

function gameOver(why) {
  running = false;
  el('overWhy').textContent = why;
  el('finalScore').textContent = S.score; el('finalWave').textContent = S.wave;
  const best = Math.max(S.score, +(localStorage.getItem('methodus3d_best') || 0));
  localStorage.setItem('methodus3d_best', best); el('bestScore').textContent = best;
  showOv('ovOver'); sfx('lose');
}
function togglePause() {
  if (!running) return;
  if (el('ovLevel').classList.contains('show')) return;
  paused = !paused;
  el('pauseBtn').textContent = paused ? '▶' : 'II';
}

// buttons
el('playBtn').onclick = startGame;
el('againBtn').onclick = startGame;
el('pauseBtn').onclick = togglePause;
el('muteBtn').onclick = () => { setMuted(!isMuted()); el('muteBtn').style.color = isMuted() ? 'var(--dim)' : ''; el('muteBtn').textContent = isMuted() ? '♪̸' : '♪'; };

// ───────────────────────── update ─────────────────────────
const clock = new THREE.Clock();
const fwd = new THREE.Vector3(), rightV = new THREE.Vector3(), aimDir = new THREE.Vector3();

function update(dt) {
  // camera-relative axes (flattened to ground)
  fwd.set(0, 0, -1); rightV.set(1, 0, 0);

  // ── input → thrust ──
  let ax = 0, az = 0;
  if (keys['KeyW'] || keys['ArrowUp']) az -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) az += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) ax -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) ax += 1;
  if (touchMove && touchMove.dx !== undefined) { ax += Math.max(-1, Math.min(1, touchMove.dx / 60)); az += Math.max(-1, Math.min(1, touchMove.dy / 60)); }
  const boosting = keys['Space'];
  const braking = keys['ShiftLeft'] || keys['ShiftRight'];
  const thrust = S.thrust * (boosting ? 1.7 : 1);
  S.vel.x += ax * thrust * dt;
  S.vel.z += az * thrust * dt;
  // drag / brake
  const drag = braking ? 4.2 : 1.1;
  S.vel.multiplyScalar(1 - Math.min(1, drag * dt));
  const maxS = S.maxSpd * (boosting ? 1.5 : 1);
  if (S.vel.length() > maxS) S.vel.setLength(maxS);
  ship.position.addScaledVector(S.vel, dt);
  ship.position.y = 1.2;
  // soft boundary
  const pr = Math.hypot(ship.position.x, ship.position.z);
  if (pr > FIELD - 2) { const f = (FIELD - 2) / pr; ship.position.x *= f; ship.position.z *= f; S.vel.multiplyScalar(0.6); }
  // keep clear of core
  const dc = Math.hypot(ship.position.x, ship.position.z);
  if (dc < CORE_R - 2) { const f = (CORE_R - 2) / dc; ship.position.x *= f; ship.position.z *= f; }

  // ── aim & orient ──
  if (touchMove) {
    // auto-aim nearest enemy on touch
    let best = null, bd = 1e9;
    for (const e of enemies) { const d = e.mesh.position.distanceTo(ship.position); if (d < bd) { bd = d; best = e; } }
    if (best) aimPoint.copy(best.mesh.position);
  }
  aimDir.copy(aimPoint).sub(ship.position); aimDir.y = 0;
  if (aimDir.lengthSq() > 0.01) {
    const yaw = Math.atan2(aimDir.x, aimDir.z);
    ship.rotation.y = yaw;
  }
  // bank with lateral velocity
  const lateral = S.vel.dot(rightV.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0));
  ship.rotation.z = THREE.MathUtils.lerp(ship.rotation.z, -ship.position.x * 0, 0.1); // keep upright
  ship.rotation.x = THREE.MathUtils.lerp(ship.rotation.x, -Math.min(0.3, S.vel.length() / S.maxSpd * 0.3), 0.1);

  // engine plume
  const sp = S.vel.length() / S.maxSpd;
  ship.userData.plumes.forEach(p => { p.scale.z = 0.5 + sp * (boosting ? 2.4 : 1.4); p.material.opacity = 0.4 + sp * 0.5; p.material.color.set(boosting ? 0xff5a1f : 0x9af4ff); });
  engineLight.position.copy(ship.position).addScaledVector(aimDir.clone().normalize(), -3);
  engineLight.intensity = 0.6 + sp * 1.6; engineLight.color.set(boosting ? 0xff7a3a : 0x9af4ff);

  // ── fire ──
  S.fireCd -= dt;
  if (firing && S.fireCd <= 0 && aimDir.lengthSq() > 0.01) {
    S.fireCd = S.fireRate;
    const base = aimDir.clone().normalize();
    const muzzle = ship.position.clone().addScaledVector(base, 3);
    const n = S.multishot;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * (S.spread + 0.04);
      const dir = base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), off);
      const b = spawnBullet(muzzle, dir, S.bulletSpd, S.dmg, 0xc8f02a, 'player');
      b.pierce = S.pierce;
    }
    sfx('mgun');
    S.shake = Math.min(S.shake + 0.06, 0.4);
  }

  // ── bullets ──
  for (const b of bullets) {
    if (!b.alive) continue;
    b.life -= dt; b.mesh.position.addScaledVector(b.vel, dt);
    if (b.life <= 0 || Math.hypot(b.mesh.position.x, b.mesh.position.z) > FIELD + 6) { b.alive = false; b.mesh.visible = false; continue; }
    if (b.owner === 'player') {
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (b.mesh.position.distanceTo(e.mesh.position) < e.t.r + 0.6) {
          e.hp -= b.dmg; e.flash = 0.12;
          dmgNumber(e.mesh.position, Math.round(b.dmg), b.dmg > 18 ? 'crit big' : '');
          burst(b.mesh.position, e.t.col, 4, 8); sfx('hit');
          if (b.pierce > 0) { b.pierce--; } else { b.alive = false; b.mesh.visible = false; }
          if (e.hp <= 0) killEnemy(e);
          break;
        }
      }
    } else {
      if (b.mesh.position.distanceTo(ship.position) < 2.2) { hurtPlayer(b.dmg); b.alive = false; b.mesh.visible = false; }
    }
  }

  // ── enemies ──
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const toCore = new THREE.Vector3(-e.mesh.position.x, 0, -e.mesh.position.z);
    const dCore = toCore.length();
    if (e.flash > 0) { e.flash -= dt; if (e.mesh.userData.gl) e.mesh.userData.gl.material.emissiveIntensity = e.flash > 0 ? 4 : 1.5; }
    if (e.t.ranged) {
      // hover at range, shoot ship
      const toShip = ship.position.clone().sub(e.mesh.position); toShip.y = 0;
      const ds = toShip.length();
      const want = ds > 26 ? 1 : (ds < 18 ? -1 : 0);
      e.mesh.position.addScaledVector(toShip.normalize(), e.t.spd * want * dt);
      e.mesh.lookAt(ship.position);
      e.cd -= dt;
      if (e.cd <= 0 && ds < 40) { e.cd = 1.6; spawnBullet(e.mesh.position.clone(), toShip.clone().normalize(), 36, e.t.dmg, 0xe0447c, 'enemy'); sfx('pulse'); }
      // also drift toward core slowly
      e.mesh.position.addScaledVector(toCore.normalize(), e.t.spd * 0.25 * dt);
    } else {
      e.mesh.position.addScaledVector(toCore.normalize(), e.t.spd * dt);
      e.mesh.lookAt(0, e.mesh.position.y, 0);
    }
    e.mesh.position.y = 1.2;
    e.mesh.rotateZ(dt * 1.2);
    // reach core
    if (dCore < CORE_R) { hurtCore(e.t.dmg); burst(e.mesh.position, e.t.col, 14, 14); killEnemy(e, true); continue; }
    // ram ship
    if (e.mesh.position.distanceTo(ship.position) < e.t.r + 1.6 && !e.t.ranged) {
      hurtPlayer(e.t.dmg * 0.6); burst(e.mesh.position, e.t.col, 10, 12); killEnemy(e, true);
    }
  }

  // ── orbs (data) ──
  for (const o of orbs) {
    if (!o.alive) continue;
    o.mesh.rotation.y += o.spin * dt; o.mesh.rotation.x += o.spin * 0.6 * dt;
    const toShip = ship.position.clone().sub(o.mesh.position); toShip.y = 0;
    const d = toShip.length();
    if (d < S.magnet) o.mesh.position.addScaledVector(toShip.normalize(), Math.max(10, (S.magnet - d) * 6) * dt);
    o.vel.multiplyScalar(1 - dt * 2); o.mesh.position.addScaledVector(o.vel, dt); o.mesh.position.y = 1;
    if (d < 1.8) { o.alive = false; o.mesh.visible = false; gainXp(o.val); sfx('pickup'); }
  }

  // ── sparks ──
  for (const s of sparks) {
    if (!s.alive) continue;
    s.life -= dt; if (s.life <= 0) { s.alive = false; s.mesh.visible = false; continue; }
    s.vel.y -= 9 * dt; s.mesh.position.addScaledVector(s.vel, dt);
    if (s.mesh.position.y < 0.3) { s.mesh.position.y = 0.3; s.vel.y *= -0.4; s.vel.x *= 0.6; s.vel.z *= 0.6; }
    const k = s.life / s.maxlife; s.mesh.material.opacity = k; s.mesh.scale.setScalar(s.sc * k);
  }
  for (const f of flashPool) { if (f.light.visible) { f.life -= dt; f.light.intensity = Math.max(0, f.life / 0.18) * 30; if (f.life <= 0) f.light.visible = false; } }

  // ── regen ──
  if (S.regen > 0 && S.hull < S.hullMax) { S.regenAcc += S.regen * dt; if (S.regenAcc >= 1) { S.hull = Math.min(S.hullMax, S.hull + Math.floor(S.regenAcc)); S.regenAcc -= Math.floor(S.regenAcc); } }
  if (S.coreShield > 0 && S.coreHp < S.coreMax) S.coreHp = Math.min(S.coreMax, S.coreHp + S.coreShield * dt);

  // ── waves ──
  if (waveActive) {
    spawnTimer -= dt;
    if (toSpawn > 0 && spawnTimer <= 0) {
      spawnTimer = Math.max(0.25, 1.1 - wave * 0.05);
      const roll = Math.random();
      let type = 'raider';
      if (wave >= 3 && roll > 0.78) type = 'brute';
      else if (roll > 0.45) type = 'drone';
      spawnEnemy(type); toSpawn--;
    }
    if (toSpawn <= 0 && enemies.filter(e => e.hp > 0).length === 0) endWave();
  } else if (running) {
    waveBreak -= dt; if (waveBreak <= 0) nextWave();
  }

  // ── core animation ──
  core.userData.spire.rotation.y += dt * 0.6; core.userData.spire.rotation.x += dt * 0.3;
  core.children.forEach(c => { if (c.userData.spin) c.rotation.z += c.userData.spin * dt; });
  const sh = core.userData.shield; const pulse = 0.06 + Math.sin(clock.elapsedTime * 2) * 0.02; sh.material.opacity = pulse;

  // stars drift
  stars.rotation.y += dt * 0.006; stars2.rotation.y -= dt * 0.004;

  // ── camera ──
  camFocus.lerp(tmpV.copy(ship.position).multiplyScalar(0.55).addScaledVector(core.position, 0.45), 0.08);
  const shakeX = (Math.random() - 0.5) * S.shake * 6, shakeY = (Math.random() - 0.5) * S.shake * 6;
  camera.position.copy(camFocus).add(CAM_OFF); camera.position.x += shakeX; camera.position.y += shakeY;
  camera.lookAt(camFocus);
  S.shake *= 1 - Math.min(1, dt * 6);

  updateDmg(dt);
}

function killEnemy(e, silent) {
  if (e.hp <= -9999) return;
  e.hp = -99999;
  burst(e.mesh.position, e.t.col, e.type === 'brute' ? 26 : 12, e.type === 'brute' ? 20 : 12);
  if (!silent) { spawnOrb(e.mesh.position, e.t.xp); S.score += e.t.score; S.kills++; if (S.lifesteal) S.hull = Math.min(S.hullMax, S.hull + S.lifesteal); }
  sfx('boom'); S.shake = Math.min(S.shake + 0.18, 0.6);
  scene.remove(e.mesh);
  const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1);
  syncHud();
}
function hurtPlayer(d) {
  S.hull -= d; S.shake = Math.min(S.shake + 0.3, 0.7); sfx('hurt'); syncHud();
  if (S.hull <= 0) { burst(ship.position, 0x9af4ff, 40, 26); gameOver('HULL DESTROYED'); }
}
function hurtCore(d) {
  S.coreHp -= d; S.shake = Math.min(S.shake + 0.34, 0.8); sfx('boss'); syncHud();
  const sh = core.userData.shield; sh.material.opacity = 0.5;
  if (S.coreHp <= 0) { burst(core.position.clone().setY(5), 0xff5a1f, 60, 34); gameOver('CORE BREACHED'); }
}

// ───────────────────────── loop ─────────────────────────
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, clock.getDelta());
  if (running && !paused) update(dt);
  else { // idle camera orbit on menus
    camFocus.lerp(core.position, 0.05);
    const a = clock.elapsedTime * 0.12;
    camera.position.set(Math.sin(a) * 60, 54, Math.cos(a) * 60);
    camera.lookAt(0, 4, 0);
    core.userData.spire.rotation.y += dt * 0.6;
    core.children.forEach(c => { if (c.userData.spin) c.rotation.z += c.userData.spin * dt; });
  }
  composer.render();
}
resize();
tick();
