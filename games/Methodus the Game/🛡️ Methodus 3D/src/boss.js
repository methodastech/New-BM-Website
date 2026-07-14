// METHODUS — Boss: the grassland chapter-ender. Telegraphed patterns, big HP bar.
import * as THREE from 'three';
import { PAL, CFG } from './config.js';

export const BOSSES = {
  1: { name: 'OVERGROWTH PRIME', tag: 'the strangler', col: PAL.magenta, hp: 900 },
};

export class Boss {
  constructor(scene, mgr, ctx, num = 1) {
    this.scene = scene; this.mgr = mgr; this.ctx = ctx;
    this.def = BOSSES[num] || BOSSES[1];
    this.hp = this.def.hp; this.hpMax = this.def.hp;
    this.hitT = 0; this.state = 'aimed'; this.stateT = 2.5; this.spin = 0; this.dead = false;
    this.build();
  }

  build() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: this.def.col, emissive: this.def.col, emissiveIntensity: 0.4, roughness: 0.5, metalness: 0.2, flatShading: true });
    this.bodyMat = mat;
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 1), mat);
    body.position.y = 4; body.castShadow = true; g.add(body); this.body = body;
    // armored crown
    const crown = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.4, 8, 24),
      new THREE.MeshStandardMaterial({ color: PAL.ink2, roughness: 0.6, metalness: 0.4, flatShading: true }));
    crown.position.y = 4; crown.rotation.x = Math.PI / 2; g.add(crown); this.crown = crown;
    // glowing eye
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12),
      new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 1.4 }));
    eye.position.set(0, 4.2, 2.6); g.add(eye); this.eye = eye;
    const light = new THREE.PointLight(this.def.col, 2, 24); light.position.y = 5; g.add(light);
    // spawn at edge
    const a = Math.random() * Math.PI * 2, r = CFG.worldRadius - 6;
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    this.scene.add(g); this.group = g;
  }

  get position() { return this.group.position; }

  damage(n) {
    if (this.dead) return;
    this.hp -= n; this.hitT = 0.1;
    if (this.hp <= 0) { this.hp = 0; this.die(); }
  }

  die() {
    this.dead = true;
    this.scene.remove(this.group);
    this.ctx.onBossDead(this);
  }

  ringBurst() {
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      this.shoot(Math.cos(a), Math.sin(a), 14, 10);
    }
  }

  shoot(nx, nz, sp, dmg) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: this.def.col, emissive: this.def.col, emissiveIntensity: 1 }));
    m.position.set(this.position.x, 3.4, this.position.z); this.scene.add(m);
    this.mgr.bullets.push({ mesh: m, vx: nx * sp, vz: nz * sp, dmg, life: 4 });
  }

  update(dt, t) {
    if (this.dead) return;
    const hero = this.ctx.heroPos();
    const corePos = this.ctx.corePos;
    // slow drift toward the core
    const dx = corePos.x - this.position.x, dz = corePos.z - this.position.z;
    const dist = Math.hypot(dx, dz) || 1;
    if (dist > 12) { this.position.x += (dx / dist) * 1.6 * dt; this.position.z += (dz / dist) * 1.6 * dt; }
    // contact with core
    if (dist < CFG.core.radius + 4) this.ctx.damageCore(24 * dt);

    this.spin += dt;
    this.body.rotation.y += dt * 0.5;
    this.body.position.y = 4 + Math.sin(t * 1.5) * 0.25;
    this.crown.rotation.z += dt * 0.8;
    this.eye.position.set(this.position.x ? 0 : 0, 4.2, 2.6);
    this.body.lookAt ? null : null;

    // pattern state machine
    this.stateT -= dt;
    if (this.stateT <= 0) {
      const cycle = ['aimed', 'ring', 'summon', 'aimed', 'ring'];
      this.state = cycle[Math.floor(Math.random() * cycle.length)];
      if (this.state === 'aimed') { this.stateT = 2.2; this._fcd = 0.3; }
      else if (this.state === 'ring') { this.stateT = 1.0; this.ringBurst(); this.ctx.sfx('boss'); }
      else if (this.state === 'summon') { this.stateT = 1.6; this.ctx.summon(); }
    }

    if (this.state === 'aimed') {
      this._fcd -= dt;
      if (this._fcd <= 0) {
        this._fcd = 0.45;
        const hx = hero.x - this.position.x, hz = hero.z - this.position.z;
        const d = Math.hypot(hx, hz) || 1;
        // 3-shot fan
        for (let k = -1; k <= 1; k++) {
          const a = Math.atan2(hz, hx) + k * 0.18;
          this.shoot(Math.cos(a), Math.sin(a), 18, 9);
        }
      }
    }

    // hit flash
    this.bodyMat.emissiveIntensity = this.hitT > 0 ? 1.2 : 0.4;
    if (this.hitT > 0) this.hitT -= dt;
  }
}
