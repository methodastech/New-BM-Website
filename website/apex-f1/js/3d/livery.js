/* ==========================================================================
   APXGP livery — canvas-drawn decals shared by the car and the crew:
   the angular wordmark, the race number and the geometric carbon camo.
   ========================================================================== */
import * as THREE from 'three';

const toTexture = (c, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// "ΛPX GP": house-shaped A, angular P and X, small raised GP
function drawWordmark(x, w, h, color, pad = 0.1) {
  const W = w * (1 - pad * 2), X0 = w * pad;
  const gh = h * 0.62, top = (h - gh) / 2, base = top + gh;   // main glyph box
  const gw = gh * 0.78, gap = gh * 0.2;
  const sw = gh * 0.17;
  const total = gw * 3 + gap * 2 + gap * 0.9 + gw * 0.5 * 2 + gap * 0.5;
  const s = Math.min(1, W / total);
  x.save();
  x.translate(X0 + (W - total * s) / 2, 0);
  x.scale(s, 1);
  x.strokeStyle = color; x.lineWidth = sw; x.lineJoin = 'miter'; x.lineCap = 'butt';
  const o = sw / 2;
  let cx = 0;
  // A — open house
  x.beginPath();
  x.moveTo(cx + o, base); x.lineTo(cx + o, top + gh * 0.32); x.lineTo(cx + gw / 2, top + o); x.lineTo(cx + gw - o, top + gh * 0.32); x.lineTo(cx + gw - o, base);
  x.stroke();
  cx += gw + gap;
  // P
  x.beginPath();
  x.moveTo(cx + o, base); x.lineTo(cx + o, top + o); x.lineTo(cx + gw * 0.78, top + o); x.lineTo(cx + gw - o, top + gh * 0.2);
  x.lineTo(cx + gw - o, top + gh * 0.42); x.lineTo(cx + gw * 0.78, top + gh * 0.58); x.lineTo(cx + o, top + gh * 0.58);
  x.stroke();
  cx += gw + gap;
  // X
  x.beginPath();
  x.moveTo(cx, top); x.lineTo(cx + gw, base); x.moveTo(cx + gw, top); x.lineTo(cx, base);
  x.stroke();
  cx += gw + gap * 0.9;
  // GP (small, sits on the cap height)
  const sh = gh * 0.5, sgw = gw * 0.5, stop = top + gh * 0.18, sbase = stop + sh, so = sw * 0.32;
  x.lineWidth = sw * 0.62;
  x.beginPath();
  x.moveTo(cx + sgw, stop + so); x.lineTo(cx + so, stop + so); x.lineTo(cx + so, sbase - so); x.lineTo(cx + sgw - so, sbase - so); x.lineTo(cx + sgw - so, stop + sh * 0.5); x.lineTo(cx + sgw * 0.5, stop + sh * 0.5);
  x.stroke();
  cx += sgw + gap * 0.5;
  x.beginPath();
  x.moveTo(cx + so, sbase); x.lineTo(cx + so, stop + so); x.lineTo(cx + sgw - so, stop + so); x.lineTo(cx + sgw - so, stop + sh * 0.55); x.lineTo(cx + so, stop + sh * 0.55);
  x.stroke();
  x.restore();
}

export function wordmarkTexture({ width = 1024, height = 512, color = '#ffffff' } = {}) {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  drawWordmark(c.getContext('2d'), width, height, color);
  return toTexture(c);
}

/* ---------- sponsor wordmarks (set as type) ---------- */
const SANS = '"Helvetica Neue", "Inter Tight", Arial, sans-serif';
function drawText(x, text, cx, cy, size, color, { weight = 700, spacing = 0, maxW = Infinity } = {}) {
  x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${weight} ${size}px ${SANS}`;
  if ('letterSpacing' in x) x.letterSpacing = `${spacing}px`;
  const w = x.measureText(text).width;
  x.save(); x.translate(cx, cy);
  if (w > maxW) x.scale(maxW / w, 1);
  x.fillText(text, 0, 0);
  x.restore();
}

export function textTexture(text, { w = 1024, h = 256, color = '#ffffff', size = 0.62, weight = 700, spacing = 0 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  if (text.includes('|')) {                     // "Shark | NINJA" lock-up
    const [a, b] = text.split('|').map((t) => t.trim());
    drawText(x, a, w * 0.3, h / 2, h * size, color, { weight: 800, maxW: w * 0.42 });
    x.fillStyle = color; x.fillRect(w * 0.53 - 3, h * 0.2, 6, h * 0.6);
    drawText(x, b, w * 0.76, h / 2, h * size * 0.92, color, { weight: 700, spacing: 4, maxW: w * 0.4 });
  } else {
    drawText(x, text, w / 2, h / 2, h * size, color, { weight, spacing, maxW: w * 0.94 });
  }
  return toTexture(c);
}

// coverall back/chest: wordmark stacked over the title sponsor
export function crewLogoTexture(color = '#ffffff') {
  const W = 1024, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  drawWordmark(x, W, 470, color, 0.08);
  drawText(x, 'Expensify', W / 2, 610, 190, color, { weight: 700, maxW: W * 0.86 });
  return toTexture(c);
}

// OMP on the belt
export function beltTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(96, 40, 320, 176);
  drawText(x, 'OMP', 256, 120, 120, '#0b0b0d', { weight: 900, maxW: 290 });
  x.fillStyle = '#0b0b0d'; x.fillRect(130, 182, 252, 12);
  return toTexture(c);
}

export function numberTexture(n = '7', color = '#0b0b0d') {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const x = c.getContext('2d');
  x.strokeStyle = color; x.lineWidth = 46; x.lineJoin = 'miter'; x.lineCap = 'butt';
  if (n === '7') {
    x.beginPath(); x.moveTo(40, 60); x.lineTo(214, 60); x.lineTo(214, 96); x.lineTo(110, 290); x.stroke();
  } else {
    x.fillStyle = color; x.font = '700 260px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, 128, 170);
  }
  return toTexture(c);
}

// dark geometric "maze" camo over gloss black — tiles seamlessly
export function camoTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = '#121216'; x.fillRect(0, 0, S, S);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const step = 32;
  for (let i = 0; i < 46; i++) {
    x.strokeStyle = rnd() > 0.5 ? '#1d1d23' : '#18181d';
    x.lineWidth = 10 + rnd() * 12; x.lineJoin = 'miter';
    let px = Math.round(rnd() * S / step) * step, py = Math.round(rnd() * S / step) * step;
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1]];
    let d = dirs[(rnd() * dirs.length) | 0];
    const pts = [[px, py]];
    for (let k = 0; k < 6; k++) {
      const len = step * (1 + ((rnd() * 3) | 0));
      px += d[0] * len; py += d[1] * len;
      pts.push([px, py]);
      d = dirs[(rnd() * dirs.length) | 0];
    }
    // draw wrapped copies so the tile is seamless
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      x.beginPath();
      pts.forEach(([a, b], k) => (k ? x.lineTo(a + ox, b + oy) : x.moveTo(a + ox, b + oy)));
      x.stroke();
    }
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
