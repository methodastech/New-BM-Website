// METHODUS — 2D pixel-art engine, Loop Hero art direction:
// grim desaturated palette, heavy dithering, organic (non-boxy) shapes,
// everything sinking into a black void. Top-down grassland + shed + robot.
import { sfx, setMuted, isMuted } from './audio.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// deterministic hash noise
const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

/* ── Loop Hero grim palette (cold steel-blue / rust / bone / dull red) ── */
const C = {
  void:   '#070708',
  // grassland — dark olive, desaturated (grim Loop Hero mood)
  gMid: '#2c381f', gHi: '#3a4a26', gLo: '#202a16', gDk: '#161d0f', blade: '#4a5a2e', bladeHi: '#5a6c36',
  // packed earth
  dMid: '#312718', dHi: '#3c2f1f', dLo: '#20180f',
  // rock — cold grey
  rHi: '#8c8d92', rMid: '#65666c', rLo: '#3f4045', rOl: '#202126',
  // tree / rust foliage
  bark: '#34271a', barkLo: '#20180e', rustHi: '#b0703a', rust: '#8a5128', rustLo: '#532f15', rustOl: '#1c1109',
  // blood
  blood: '#7a2522', bloodHi: '#9c352c',
  // robot — cold steel blue, bone, warm amber accent, pale eye
  sHi: '#7089a4', sMid: '#46607d', sLo: '#2c3c50', sOl: '#0c1118', bone: '#cfc9b8', amber: '#c0772f',
  eye: '#a9dde4', eyeHot: '#eafcff',
  // weathered shed
  wHi: '#9a948433', wHi2: '#9a9484', wMid: '#7c776a', wLo: '#534f44', wOl: '#181712',
  roof: '#36383b', roofHi: '#484b4f', roofLo: '#222427',
  doorHi: '#b06a30', door: '#8a4f22', doorLo: '#562f13',
  glass: '#16323a', glassHi: '#2b5560',
  shadow: 'rgba(0,0,0,0.42)',
};

const TILE = 16;
const MAP_W = 96, MAP_H = 96;
const WORLD_W = MAP_W * TILE, WORLD_H = MAP_H * TILE;

/* ── canvas / low-res buffer ── */
const display = $('game');
const dctx = display.getContext('2d');
const buf = document.createElement('canvas');
const bctx = buf.getContext('2d');
let PIXEL = 4, bufW = 0, bufH = 0;
function resize() {
  const cw = innerWidth, ch = innerHeight;
  PIXEL = Math.max(3, Math.round(ch / 320));
  bufW = Math.ceil(cw / PIXEL); bufH = Math.ceil(ch / PIXEL);
  buf.width = bufW; buf.height = bufH;
  display.width = bufW * PIXEL; display.height = bufH * PIXEL;
  display.style.width = bufW * PIXEL + 'px'; display.style.height = bufH * PIXEL + 'px';
  bctx.imageSmoothingEnabled = false; dctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();

/* ── pixel helpers ── */
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const px = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
function ellShadow(g, cx, cy, rx, ry) { g.fillStyle = C.shadow; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill(); }

// organic lumpy blob with vertical shading, dither bands, outline
function blob(w, h, seed, col, flatBottom) {
  const c = cv(w, h), g = c.getContext('2d');
  const cx = w / 2, cy = flatBottom ? h * 0.52 : h / 2;
  const rx = w / 2 - 1, ry = flatBottom ? h * 0.46 : h / 2 - 1;
  const lobes = 3 + Math.floor(rnd(seed) * 3), phase = rnd(seed * 2.3) * 6.28;
  const inside = (x, y) => {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, ang = Math.atan2(dy, dx), rr = Math.hypot(dx, dy);
    const wob = 0.74 + 0.17 * Math.sin(ang * lobes + phase) + 0.08 * Math.sin(ang * 2 + seed * 1.7);
    return rr < wob;
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inside(x, y)) continue;
    const t = (y - (cy - ry)) / (2 * ry);        // 0 top .. 1 bottom
    let cc = t < 0.34 ? col.hi : t < 0.64 ? col.mid : col.lo;
    if (((x + y) & 1) === 0) { if (t > 0.30 && t < 0.42) cc = col.mid; if (t > 0.60 && t < 0.72) cc = col.lo; }
    if (x < cx && y < cy && ((x + y) & 1) === 0 && t < 0.4) cc = col.hi;  // top-left highlight dither
    px(g, x, y, 1, 1, cc);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (inside(x, y)) continue;
    if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) px(g, x, y, 1, 1, col.ol);
  }
  return c;
}

/* ── tiles ── */
function makeTile(kind, seed) {
  const c = cv(TILE, TILE), g = c.getContext('2d');
  const base = kind === 'dirt' ? C.dMid : C.gMid;
  px(g, 0, 0, TILE, TILE, base);
  // dithered tonal variation
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
    const n = rnd(seed + x * 1.7 + y * 3.3);
    if (((x + y) & 1) === 0 && n > 0.55) px(g, x, y, 1, 1, kind === 'dirt' ? (n > 0.8 ? C.dHi : C.dLo) : (n > 0.8 ? C.gHi : C.gLo));
    else if (n > 0.93) px(g, x, y, 1, 1, kind === 'dirt' ? C.dLo : C.gDk);
  }
  if (kind !== 'dirt') {
    for (let i = 0; i < 4; i++) {
      const x = 2 + Math.floor(rnd(seed + i * 3.1 + 1) * (TILE - 4));
      const y = 5 + Math.floor(rnd(seed + i * 9.2 + 2) * (TILE - 7));
      px(g, x, y, 1, 2, C.blade); px(g, x, y - 1, 1, 1, C.bladeHi);
    }
  }
  return c;
}
const grassTiles = [0, 1, 2, 3, 4, 5].map(i => makeTile('grass', 11 + i * 13.7));
const dirtTiles = [0, 1, 2].map(i => makeTile('dirt', 71 + i * 9.3));

/* ── map with an organic packed-earth pad around the shed ── */
const shedTile = { x: (MAP_W / 2) | 0, y: (MAP_H / 2) | 0 };
const shedWX = shedTile.x * TILE + TILE / 2;
const shedBaseY = shedTile.y * TILE + TILE;
const map = [];
for (let y = 0; y < MAP_H; y++) { map[y] = [];
  for (let x = 0; x < MAP_W; x++) {
    const dd = Math.hypot(x - shedTile.x, y - shedTile.y) + (rnd(x * 4.1 + y * 9.7) - 0.5) * 1.5;
    map[y][x] = { kind: dd < 3.6 ? 'dirt' : 'grass', v: (rnd(x * 12.9 + y * 78.2) * 6) | 0 };
  }
}
const mapCv = cv(WORLD_W, WORLD_H); const mctx = mapCv.getContext('2d'); mctx.imageSmoothingEnabled = false;
for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
  const cell = map[y][x];
  const img = cell.kind === 'dirt' ? dirtTiles[cell.v % dirtTiles.length] : grassTiles[cell.v % grassTiles.length];
  mctx.drawImage(img, x * TILE, y * TILE);
}
// bake ground-level grime: scattered blood specks + tiny pebbles
for (let i = 0; i < 220; i++) {
  const x = (rnd(i * 2.1) * WORLD_W) | 0, y = (rnd(i * 5.7) * WORLD_H) | 0;
  if (rnd(i * 3.3) > 0.7) { mctx.fillStyle = C.blood; mctx.fillRect(x, y, 1, 1); mctx.fillRect(x + 1, y + (rnd(i) > .5 ? 1 : 0), 1, 1); }
  else { mctx.fillStyle = C.rLo; mctx.fillRect(x, y, 1, 1); }
}

/* ── organic props (rocks, gnarled rust trees, dead branches) ── */
function makeRock(seed) {
  const w = 18 + ((rnd(seed) * 12) | 0), h = (w * 0.8) | 0;
  const c = cv(w, h + 4), g = c.getContext('2d');
  ellShadow(g, w / 2, h + 1, w / 2 - 1, 3);
  g.drawImage(blob(w, h, seed, { hi: C.rHi, mid: C.rMid, lo: C.rLo, ol: C.rOl }, true), 0, 0);
  if (rnd(seed * 2) > 0.6) { px(g, (w * 0.4) | 0, (h * 0.6) | 0, 1, 1, C.blood); px(g, (w * 0.4) | 0 + 1, (h * 0.6) | 0 + 1, 1, 1, C.bloodHi); }
  return { canvas: c, anchorY: h + 1 };
}
function branch(g, x, y, ang, len, seed, d) {
  if (len < 3 || d > 4) return;
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
  const steps = Math.ceil(len);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, bx = x + (ex - x) * t, by = y + (ey - y) * t;
    px(g, bx, by, d < 2 ? 2 : 1, d < 2 ? 2 : 1, C.bark);
    px(g, bx, by, 1, 1, C.barkLo);
  }
  // rust leaf cluster at tips
  if (d >= 2 && rnd(seed) > 0.4) {
    const lc = blob(7 + ((rnd(seed * 3) * 4) | 0), 7, seed * 1.3, { hi: C.rustHi, mid: C.rust, lo: C.rustLo, ol: C.rustOl }, false);
    g.drawImage(lc, (ex - lc.width / 2) | 0, (ey - lc.height / 2) | 0);
  }
  branch(g, ex, ey, ang - 0.5 - rnd(seed * 2) * 0.3, len * 0.74, seed * 1.7 + 1, d + 1);
  branch(g, ex, ey, ang + 0.5 + rnd(seed * 3) * 0.3, len * 0.7, seed * 2.3 + 2, d + 1);
}
function makeTree(seed, dead) {
  const w = 46, h = 60;
  const c = cv(w, h), g = c.getContext('2d');
  ellShadow(g, w / 2, h - 2, 13, 3);
  // twisted trunk
  let tx = w / 2;
  for (let y = h - 3; y > h - 22; y--) { tx += (rnd(seed + y) - 0.5) * 0.5; px(g, (tx - 2) | 0, y, 4, 1, C.barkLo); px(g, (tx - 1) | 0, y, 2, 1, C.bark); }
  branch(g, tx, h - 21, -Math.PI / 2 - 0.15, 13, seed, dead ? 9 : 1);
  branch(g, tx, h - 16, -Math.PI / 2 + 0.4, 10, seed * 1.9, dead ? 9 : 1);
  branch(g, tx, h - 16, -Math.PI / 2 - 0.5, 10, seed * 2.7, dead ? 9 : 1);
  return { canvas: c, anchorY: h - 2 };
}
function makeBush(seed) {
  const w = 16 + ((rnd(seed) * 8) | 0), h = 12;
  const c = cv(w, h + 3), g = c.getContext('2d');
  ellShadow(g, w / 2, h, w / 2 - 1, 2);
  g.drawImage(blob(w, h, seed, { hi: C.bladeHi, mid: C.blade, lo: C.gLo, ol: C.gDk }, true), 0, 0);
  for (let i = 0; i < 4; i++) { const bx = 3 + ((rnd(seed + i) * (w - 6)) | 0); px(g, bx, 1 + ((rnd(seed + i * 2) * 3) | 0), 1, 2, C.bladeHi); }
  return { canvas: c, anchorY: h };
}

const props = [];
(function placeProps() {
  let s = 1;
  for (let i = 0; i < 120; i++) {
    s += 1;
    const x = 30 + rnd(s * 1.3) * (WORLD_W - 60), y = 30 + rnd(s * 2.7) * (WORLD_H - 60);
    if (Math.hypot(x - shedWX, y - shedBaseY) < 90) continue;   // keep clearing around base
    const roll = rnd(s * 4.1);
    let p;
    if (roll < 0.34) p = makeTree(s * 3.3, false);
    else if (roll < 0.46) p = makeTree(s * 5.1, true);
    else if (roll < 0.74) p = makeRock(s * 7.7);
    else p = makeBush(s * 9.2);
    props.push({ x, y, canvas: p.canvas, anchorY: p.anchorY });
  }
})();

/* ── the modern shed (weathered, dithered, less boxy) ── */
const shed = (function makeShed() {
  const W = 84, H = 64;
  const c = cv(W, H), g = c.getContext('2d');
  const ox = 6, bw = 70, bh = 32, by = H - bh - 5;
  ellShadow(g, W / 2, H - 4, 40, 7);
  // walls — corrugated, weathered with dither + rust streaks
  for (let x = 0; x < bw; x++) {
    const base = (x % 3 === 0) ? C.wLo : (x % 3 === 1 ? C.wMid : C.wHi2);
    px(g, ox + x, by, 1, bh, base);
    for (let y = 0; y < bh; y++) if (((x + y) & 1) === 0 && rnd(x * 3.1 + y * 1.7) > 0.86) px(g, ox + x, by + y, 1, 1, C.wLo);
  }
  // grime at the base + rust streaks down the wall
  for (let x = 0; x < bw; x += 1) { if (rnd(x * 5.5) > 0.8) { const sh = 3 + ((rnd(x) * 6) | 0); px(g, ox + x, by + bh - sh, 1, sh, C.rustLo); } }
  px(g, ox, by + bh - 2, bw, 2, 'rgba(20,15,8,0.5)');
  // outline (slightly irregular bottom — moss bumps)
  g.strokeStyle = C.wOl; g.lineWidth = 1; g.strokeRect(ox + 0.5, by + 0.5, bw - 1, bh - 1);
  // mono-pitch roof, overhanging
  const ry = by - 9;
  px(g, ox - 4, ry, bw + 8, 9, C.roof);
  px(g, ox - 4, ry, bw + 8, 2, C.roofHi);
  for (let x = 0; x < bw + 8; x++) if ((x & 1) === 0 && rnd(x * 2.2) > 0.7) px(g, ox - 4 + x, ry + 3 + ((rnd(x) * 4) | 0), 1, 1, C.roofLo);
  px(g, ox - 4, ry + 9, bw + 8, 1, C.wOl);
  px(g, ox - 4, ry + 8, bw + 8, 1, C.amber);                 // warm fascia (Loop-Hero amber, not neon)
  // moss on roof edge
  for (let x = 0; x < bw + 8; x += 3) if (rnd(x * 1.9) > 0.7) px(g, ox - 4 + x, ry + 8, 1, 1, C.blade);
  // roller door — weathered amber, horizontal slats
  const dw = 26, dh = 23, dx = ox + 9, dy = by + bh - dh;
  for (let i = 0; i < dh; i++) px(g, dx, dy + i, dw, 1, (i % 3 === 0) ? C.doorLo : (i % 3 === 1 ? C.door : C.doorHi));
  for (let i = 0; i < dh; i++) for (let j = 0; j < dw; j++) if (((i + j) & 1) === 0 && rnd(i * 2.1 + j) > 0.9) px(g, dx + j, dy + i, 1, 1, C.doorLo);
  px(g, dx - 1, dy - 1, dw + 2, 1, C.wOl); px(g, dx - 1, dy - 1, 1, dh + 1, C.wOl); px(g, dx + dw, dy - 1, 1, dh + 1, C.wOl);
  // window — dark glass, bone frame, glint
  const wx = ox + 45, wy = by + 7, ww = 17, wh = 11;
  px(g, wx - 1, wy - 1, ww + 2, wh + 2, C.bone);
  px(g, wx, wy, ww, wh, C.glass);
  px(g, wx + 2, wy + 2, 5, 3, C.glassHi);
  px(g, wx, wy + (wh / 2) | 0, ww, 1, C.wOl); px(g, wx + (ww / 2) | 0, wy, 1, wh, C.wOl);
  // roof vent + sign
  px(g, ox + 50, ry - 7, 10, 7, C.wMid); px(g, ox + 50, ry - 7, 10, 1, C.wHi2); px(g, ox + 49, ry - 8, 12, 1, C.wOl);
  px(g, ox + 45, by + 1, 13, 4, C.wOl); px(g, ox + 46, by + 2, 11, 1, C.amber);
  return { canvas: c, anchorX: W / 2, anchorY: H - 3 };
})();

/* ── hero (rounded, shaded, non-boxy, steel-blue with a glowing eye) ── */
const hero = { x: shedWX, y: shedBaseY + 64, dir: 'down', walkT: 0, moving: false, recoil: 0 };
let aimX = 0, aimY = 1, firing = false, fireCd = 0;
const bullets = [], parts = [];

// draw centered rows of given widths -> rounded silhouette
function rows(g, cx, topY, list, col) { let y = topY; for (const [w, c2] of list) { px(g, cx - (w / 2) | 0, y, w, 1, c2 || col); y++; } }

function drawRobot(g, sx, sy) {
  const idle = hero.moving ? 0 : Math.round(Math.sin(t * 3) * 0.6);
  sy += idle;
  const ph = hero.walkT;
  const lL = hero.moving ? Math.round(Math.sin(ph) * 2) : 0;
  const lR = hero.moving ? Math.round(Math.sin(ph + Math.PI) * 2) : 0;
  const sway = hero.moving ? Math.round(Math.sin(ph) * 1) : 0;

  ellShadow(g, sx, sy + 1, 7, 3);

  // legs (tapered, shaded)
  const legY = sy - 5;
  px(g, sx - 4, legY + Math.max(0, lL), 3, 5 - Math.max(0, lL), C.sOl);
  px(g, sx - 3, legY + Math.max(0, lL), 1, 4 - Math.max(0, lL), C.sMid);
  px(g, sx - 4, sy - 1 + Math.max(0, lL), 3, 1, C.sLo);     // foot
  px(g, sx + 1, legY + Math.max(0, lR), 3, 5 - Math.max(0, lR), C.sOl);
  px(g, sx + 2, legY + Math.max(0, lR), 1, 4 - Math.max(0, lR), C.sMid);
  px(g, sx + 1, sy - 1 + Math.max(0, lR), 3, 1, C.sLo);

  const bx = sx + sway;
  // torso — rounded silhouette via row widths, outline then fill
  rows(g, bx, sy - 16, [[8], [10], [10], [10], [10], [8]], C.sOl);
  rows(g, bx, sy - 15, [[6], [8], [8], [8], [6]], C.sMid);
  // dithered shading on the right side + bottom
  for (let y = sy - 15; y < sy - 7; y++) for (let x = bx; x < bx + 4; x++) if (((x + y) & 1) === 0) px(g, x, y, 1, 1, C.sLo);
  for (let y = sy - 15; y < sy - 11; y++) for (let x = bx - 4; x < bx; x++) if (((x + y) & 1) === 0) px(g, x, y, 1, 1, C.sHi);
  // chest core (warm amber, glowing dot)
  px(g, bx - 1, sy - 12, 3, 3, C.sOl); px(g, bx, sy - 11, 1, 1, C.amber);
  // shoulders rounded
  px(g, bx - 6, sy - 15, 2, 3, C.sOl); px(g, bx + 4, sy - 15, 2, 3, C.sOl);
  px(g, bx - 6, sy - 14, 1, 2, C.sHi); px(g, bx + 5, sy - 14, 1, 2, C.sHi);

  // head — dome (rounded), with glowing eye
  rows(g, bx, sy - 23, [[4], [6], [6], [6], [6], [4]], C.sOl);
  rows(g, bx, sy - 22, [[2], [4], [4], [4], [2]], C.sMid);
  px(g, bx - 2, sy - 21, 1, 3, C.sHi);                       // left rim light
  const vshift = hero.dir === 'left' ? -1 : hero.dir === 'right' ? 1 : 0;
  if (hero.dir !== 'up') {
    px(g, bx - 1 + vshift, sy - 20, 2, 2, C.eye);            // glowing eye
    px(g, bx - 1 + vshift, sy - 20, 1, 1, C.eyeHot);
  }
  // antenna + warm tip
  px(g, bx + 3, sy - 25, 1, 2, C.sMid); px(g, bx + 3, sy - 26, 1, 1, C.amber);

  drawGun(g, bx, sy - 11, aimX, aimY);
}

function drawGun(g, ox, oy, dx, dy) {
  const rec = hero.recoil > 0 ? 2 : 0;
  const sx = ox + dx * (3 - rec), sy = oy + dy * (3 - rec);
  const len = 8 - rec;
  for (let i = 0; i <= len; i++) { const p = sx + dx * i, q = sy + dy * i; px(g, p - 1, q - 1, 2, 2, i > len - 2 ? C.sHi : C.sOl); }
  px(g, sx + dx * len - 1, sy + dy * len - 1, 2, 2, C.amber);
  px(g, ox + dx * 2 - 1, oy + dy * 2 - 1, 2, 2, C.sMid);     // hands
}

/* ── input ── */
const keys = {};
let camX = 0, camY = 0;
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('pointermove', e => {
  const wx = camX + e.clientX / PIXEL, wy = camY + e.clientY / PIXEL;
  const dx = wx - hero.x, dy = wy - hero.y, d = Math.hypot(dx, dy);
  if (d > 1) { aimX = dx / d; aimY = dy / d; }
});
display.addEventListener('pointerdown', () => { if (state === 'playing') firing = true; });
addEventListener('pointerup', () => { firing = false; });

/* ── firing ── */
function fire() {
  const mx = hero.x + aimX * 10, my = hero.y - 9 + aimY * 6;
  bullets.push({ x: mx, y: my, vx: aimX * 175, vy: aimY * 175, life: 0.5 });
  for (let i = 0; i < 5; i++) parts.push({ x: mx, y: my, vx: aimX * 40 + (Math.random() - 0.5) * 50, vy: aimY * 40 + (Math.random() - 0.5) * 50, life: 0.12 + Math.random() * 0.1, col: i ? C.amber : C.eyeHot });
  hero.recoil = 0.1; sfx('pulse');
}

/* ── state / loop ── */
let state = 'title', t = 0, shakeT = 0;
function step(dt) {
  let mx = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  let my = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
  const md = Math.hypot(mx, my), sprint = !!keys['shift'];
  const speed = sprint ? 92 : 56;
  hero.moving = md > 0;
  if (md > 0) { hero.x += (mx / md) * speed * dt; hero.y += (my / md) * speed * dt; hero.walkT += dt * (sprint ? 11 : 8); }

  let fx = aimX, fy = aimY;
  if (!firing && md > 0) { fx = mx / md; fy = my / md; }
  hero.dir = Math.abs(fx) > Math.abs(fy) ? (fx > 0 ? 'right' : 'left') : (fy > 0 ? 'down' : 'up');

  if (Math.abs(hero.x - shedWX) < 40 && hero.y < shedBaseY + 6 && hero.y > shedBaseY - 40) hero.y = shedBaseY + 6;
  hero.x = clamp(hero.x, 24, WORLD_W - 24); hero.y = clamp(hero.y, 24, WORLD_H - 24);

  fireCd -= dt;
  if (firing && fireCd <= 0) { fire(); fireCd = 0.13; shakeT = 0.05; }
  if (hero.recoil > 0) hero.recoil -= dt;

  for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (Math.random() < 0.5) parts.push({ x: b.x, y: b.y, vx: 0, vy: 0, life: 0.16, col: C.amber });
    if (b.life <= 0) bullets.splice(i, 1); }
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
  if (shakeT > 0) shakeT -= dt;
}

function draw() {
  camX = clamp(hero.x - bufW / 2, 0, WORLD_W - bufW);
  camY = clamp(hero.y - bufH / 2, 0, WORLD_H - bufH);
  let shx = 0, shy = 0;
  if (shakeT > 0) { shx = (Math.random() - 0.5) * 3; shy = (Math.random() - 0.5) * 3; }

  bctx.fillStyle = C.void; bctx.fillRect(0, 0, bufW, bufH);
  bctx.drawImage(mapCv, camX - shx, camY - shy, bufW, bufH, 0, 0, bufW, bufH);

  const sx = (wx) => Math.round(wx - camX + shx), sy = (wy) => Math.round(wy - camY + shy);

  // y-sorted renderables: shed, props, hero
  const items = [{ baseY: shedBaseY, draw: () => bctx.drawImage(shed.canvas, sx(shedWX) - shed.anchorX, sy(shedBaseY) - shed.anchorY) }];
  for (const p of props) {
    if (p.x < camX - 50 || p.x > camX + bufW + 50 || p.y < camY - 70 || p.y > camY + bufH + 20) continue;
    items.push({ baseY: p.y, draw: () => bctx.drawImage(p.canvas, sx(p.x) - (p.canvas.width / 2) | 0, sy(p.y) - p.anchorY) });
  }
  items.push({ baseY: hero.y, draw: () => drawRobot(bctx, sx(hero.x), sy(hero.y)) });
  items.sort((a, b) => a.baseY - b.baseY);
  for (const it of items) it.draw();

  for (const b of bullets) { px(bctx, sx(b.x) - 1, sy(b.y) - 1, 3, 3, C.amber); px(bctx, sx(b.x), sy(b.y), 1, 1, C.eyeHot); }
  for (const p of parts) px(bctx, sx(p.x), sy(p.y), 1, 1, p.col);

  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(buf, 0, 0, bufW, bufH, 0, 0, display.width, display.height);
}

let lastT = performance.now();
function loop(now) { requestAnimationFrame(loop); const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; t += dt; if (state === 'playing') step(dt); draw(); }
requestAnimationFrame(loop);

/* ── boot ── */
$('startBtn').onclick = () => { $('title').classList.remove('on'); state = 'playing'; };
$('muteBtn').onclick = () => { setMuted(!isMuted()); $('muteBtn').textContent = isMuted() ? '♪ SOUND OFF' : '♪ SOUND ON'; };

window.__M = {
  get state() { return state; }, get pos() { return [Math.round(hero.x), Math.round(hero.y)]; },
  get dir() { return hero.dir; }, get bullets() { return bullets.length; },
  sim(secs) { const n = Math.round(secs / 0.016); for (let i = 0; i < n; i++) { if (state === 'playing') step(0.016); t += 0.016; } return 'simmed'; },
  press(k, v = true) { keys[k] = v; },
};
