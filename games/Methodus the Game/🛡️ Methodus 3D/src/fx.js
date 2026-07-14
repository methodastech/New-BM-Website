// METHODUS — juice: particle bursts, expanding hit-rings, floating damage
// numbers (DOM, projected from 3D), and screen shake.
import * as THREE from 'three';
import { css } from './config.js';

let scene, camera, layer;
const parts = [];     // 3D particle meshes
const rings = [];      // expanding ground rings
const floaters = [];   // DOM damage numbers
let shakeAmt = 0;
const _v = new THREE.Vector3();

const partGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);

export function initFX(sc, cam, domLayer) { scene = sc; camera = cam; layer = domLayer; }

export function burst(x, y, z, color, n = 10, spread = 7, up = 5) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(partGeo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 }));
    m.position.set(x, y, z);
    const a = Math.random() * Math.PI * 2, sp = Math.random() * spread;
    parts.push({
      mesh: m, vx: Math.cos(a) * sp, vy: Math.random() * up + 1, vz: Math.sin(a) * sp,
      life: 0.5 + Math.random() * 0.5, max: 1, spin: Math.random() * 10,
    });
    scene.add(m);
  }
}

export function ring(x, z, color, r0 = 0.5, r1 = 6, dur = 0.5) {
  const geo = new THREE.RingGeometry(r0, r0 + 0.25, 32);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.1, z);
  scene.add(m);
  rings.push({ mesh: m, t: 0, dur, r0, r1 });
}

export function damageNumber(x, y, z, text, color = '#fff', big = false) {
  const el = document.createElement('div');
  el.className = 'dmg' + (big ? ' big' : '');
  el.textContent = text;
  el.style.color = typeof color === 'number' ? css(color) : color;
  layer.appendChild(el);
  floaters.push({ el, x, y, z, vy: 1.6, life: 0.9, max: 0.9 });
}

export function shake(a) { shakeAmt = Math.min(1.4, shakeAmt + a); }

export function getShake() {
  if (shakeAmt < 0.001) return { x: 0, y: 0 };
  return { x: (Math.random() - 0.5) * shakeAmt * 2, y: (Math.random() - 0.5) * shakeAmt * 2 };
}

export function update(dt) {
  shakeAmt *= 0.86;

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt;
    p.vy -= 14 * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    if (p.mesh.position.y < 0.1) { p.mesh.position.y = 0.1; p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; }
    p.mesh.rotation.x += p.spin * dt; p.mesh.rotation.y += p.spin * dt;
    const k = Math.max(0, p.life / p.max);
    p.mesh.scale.setScalar(k);
    if (p.life <= 0) { scene.remove(p.mesh); parts.splice(i, 1); }
  }

  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i]; r.t += dt;
    const k = r.t / r.dur;
    const rr = r.r0 + (r.r1 - r.r0) * k;
    r.mesh.scale.set(rr / r.r0, rr / r.r0, 1);
    r.mesh.material.opacity = 0.9 * (1 - k);
    if (k >= 1) { scene.remove(r.mesh); rings.splice(i, 1); }
  }

  // project floaters to screen
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.life -= dt; f.y += f.vy * dt;
    _v.set(f.x, f.y + 1.5, f.z).project(camera);
    const sx = (_v.x * 0.5 + 0.5) * layer.clientWidth;
    const sy = (-_v.y * 0.5 + 0.5) * layer.clientHeight;
    f.el.style.transform = `translate(-50%,-50%) translate(${sx}px,${sy}px)`;
    f.el.style.opacity = Math.max(0, f.life / f.max);
    if (f.life <= 0 || _v.z > 1) { f.el.remove(); floaters.splice(i, 1); }
  }
}

export function clearFX() {
  for (const p of parts) scene.remove(p.mesh); parts.length = 0;
  for (const r of rings) scene.remove(r.mesh); rings.length = 0;
  for (const f of floaters) f.el.remove(); floaters.length = 0;
}
