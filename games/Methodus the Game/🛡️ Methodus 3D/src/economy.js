// METHODUS — economy & map structures: loot motes, clickable buildings
// (Med-Bay / Shield Pylon / Refinery / Repair Node), and Engineer turrets.
import * as THREE from 'three';
import { PAL, CFG } from './config.js';

/* ----------------------------- loot motes ----------------------------- */
export class MoteManager {
  constructor(scene, ctx) { this.scene = scene; this.ctx = ctx; this.list = []; }
  spawn(x, z, kind, amount) {
    const col = kind === 'cell' ? PAL.cyan : PAL.lime;
    const geo = kind === 'cell' ? new THREE.OctahedronGeometry(0.32, 0) : new THREE.BoxGeometry(0.34, 0.34, 0.34);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.4 }));
    const a = Math.random() * 6.28, r = Math.random() * 1.2;
    m.position.set(x + Math.cos(a) * r, 0.6, z + Math.sin(a) * r);
    this.scene.add(m);
    this.list.push({ mesh: m, kind, amount, t: Math.random() * 6.28, vy: 4 + Math.random() * 3, settle: false, life: 18 });
  }
  update(dt, hero, magnet, pickupR) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const o = this.list[i]; o.t += dt; o.life -= dt;
      o.mesh.rotation.y += dt * 2;
      const dx = hero.x - o.mesh.position.x, dz = hero.z - o.mesh.position.z;
      const d = Math.hypot(dx, dz) || 1;
      const pr = pickupR * (magnet ? 3.2 : 1);
      if (d < pr) {
        // fly to hero
        const pull = magnet ? 22 : 16;
        o.mesh.position.x += (dx / d) * pull * dt;
        o.mesh.position.z += (dz / d) * pull * dt;
        o.mesh.position.y += (1 - o.mesh.position.y) * dt * 4;
        if (d < 1.1) {
          this.ctx.collect(o.kind, o.amount, o.mesh.position.clone());
          this.scene.remove(o.mesh); this.list.splice(i, 1); continue;
        }
      } else {
        o.mesh.position.y = 0.55 + Math.sin(o.t * 3) * 0.18;
      }
      if (o.life <= 0) { this.scene.remove(o.mesh); this.list.splice(i, 1); }
    }
  }
  clear() { for (const o of this.list) this.scene.remove(o.mesh); this.list.length = 0; }
}

/* ----------------------------- buildings ------------------------------ */
const BUILD_DEFS = {
  medbay:  { name: 'MED-BAY',     col: PAL.lime,   cd: 9,  cost: 0,  effect: 'heal'   },
  shield:  { name: 'SHIELD PYLON',col: PAL.cyan,   cd: 11, cost: 0,  effect: 'shield' },
  refinery:{ name: 'REFINERY',    col: PAL.orange, cd: 7,  cost: 0,  effect: 'refine' },
  repair:  { name: 'REPAIR NODE', col: PAL.bone,   cd: 13, cost: 0,  effect: 'corehp' },
};

export class BuildingManager {
  constructor(scene, ctx) {
    this.scene = scene; this.ctx = ctx; this.list = [];
    const placements = [
      ['medbay', 14, 0.6], ['shield', 14, 2.7], ['refinery', 16, 4.0], ['repair', 15, 5.3],
    ];
    for (const [type, r, a] of placements) this.make(type, Math.cos(a) * r, Math.sin(a) * r);
  }
  make(type, x, z) {
    const d = BUILD_DEFS[type];
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: PAL.steel, roughness: 0.7, metalness: 0.3, flatShading: true }));
    base.position.y = 0.3; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7),
      new THREE.MeshStandardMaterial({ color: PAL.ink2, roughness: 0.6, metalness: 0.3, flatShading: true }));
    pillar.position.y = 1.5; pillar.castShadow = true; g.add(pillar);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: d.col, emissive: d.col, emissiveIntensity: 1, roughness: 0.4, flatShading: true }));
    orb.position.y = 2.9; g.add(orb);
    const light = new THREE.PointLight(d.col, 1.2, 8); light.position.y = 3; g.add(light);
    // ready ring on the ground
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.0, 24),
      new THREE.MeshBasicMaterial({ color: d.col, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; g.add(ring);
    g.position.set(x, 0, z);
    this.scene.add(g);
    this.list.push({ type, def: d, group: g, orb, ring, light, cd: 0, t: Math.random() * 6 });
  }
  // returns building near a world point (for clicks)
  near(x, z, maxD = 3.2) {
    let best = null, bd = maxD;
    for (const b of this.list) {
      const dd = Math.hypot(b.group.position.x - x, b.group.position.z - z);
      if (dd < bd) { bd = dd; best = b; }
    }
    return best;
  }
  trigger(b) {
    if (b.cd > 0) { this.ctx.sfx('deny'); return false; }
    const ok = this.ctx.activate(b.def.effect, b);
    if (ok) { b.cd = b.def.cd; return true; }
    return false;
  }
  update(dt, t) {
    for (const b of this.list) {
      b.t += dt;
      b.orb.position.y = 2.9 + Math.sin(b.t * 2) * 0.12;
      b.orb.rotation.y += dt;
      if (b.cd > 0) {
        b.cd -= dt;
        const k = 1 - b.cd / b.def.cd;
        b.orb.material.emissiveIntensity = 0.15 + k * 0.85;
        b.ring.material.opacity = 0.12 + k * 0.4;
        b.light.intensity = 0.3 + k;
      } else {
        const pulse = 0.8 + Math.sin(t * 4) * 0.25;
        b.orb.material.emissiveIntensity = pulse;
        b.ring.material.opacity = 0.4 + Math.sin(t * 4) * 0.18;
        b.light.intensity = 1.2;
      }
    }
  }
}

/* ----------------------------- turrets -------------------------------- */
export class TurretManager {
  constructor(scene, ctx) { this.scene = scene; this.ctx = ctx; this.list = []; }
  sync(count) { while (this.list.length < count) this.add(); }
  add() {
    const i = this.list.length;
    const a = (i / 3) * Math.PI * 2 + 0.5, r = CFG.core.radius + 3;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.8, 6),
      new THREE.MeshStandardMaterial({ color: PAL.steel, roughness: 0.7, metalness: 0.4, flatShading: true }));
    base.position.y = 0.4; base.castShadow = true; g.add(base);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.1),
      new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.4, roughness: 0.5, flatShading: true }));
    head.position.y = 1; g.add(head);
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    this.scene.add(g);
    this.list.push({ group: g, head, cd: 0, range: 16 });
  }
  update(dt, enemies, fireFn) {
    for (const tr of this.list) {
      tr.cd -= dt;
      // aim at nearest enemy
      let best = null, bd = tr.range;
      for (const e of enemies) {
        const dd = Math.hypot(e.mesh.position.x - tr.group.position.x, e.mesh.position.z - tr.group.position.z);
        if (dd < bd) { bd = dd; best = e; }
      }
      if (best) {
        const dx = best.mesh.position.x - tr.group.position.x, dz = best.mesh.position.z - tr.group.position.z;
        tr.head.rotation.y = Math.atan2(dx, dz);
        if (tr.cd <= 0) {
          tr.cd = this.ctx.swarm ? 0.22 : 0.45;
          fireFn(tr.group.position.x, 1, tr.group.position.z, dx, dz, this.ctx.swarm ? 2 : 1);
        }
      }
    }
  }
  clear() { for (const t of this.list) this.scene.remove(t.group); this.list.length = 0; }
}
