// METHODUS — enemies: roster, spawning, AI (march on the Core, fight the hero
// if intercepted), ranged fire, and loot drops.
import * as THREE from 'three';
import { PAL, CFG } from './config.js';

export const ROSTER = {
  charger: { name: 'Charger',  col: PAL.magenta, hp: 16, sp: 7.5, dmg: 8,  rad: 0.9, scrap: 2, cell: 0,    xp: 2, mode: 'melee',  shape: 'spike' },
  swarmer: { name: 'Swarmer',  col: PAL.orange,  hp: 6,  sp: 11,  dmg: 5,  rad: 0.6, scrap: 1, cell: 0,    xp: 1, mode: 'melee',  shape: 'shard' },
  spitter: { name: 'Spitter',  col: 0xb84cff,    hp: 12, sp: 4.5, dmg: 7,  rad: 0.85,scrap: 3, cell: 0.05, xp: 3, mode: 'ranged', shape: 'pod'   },
  brute:   { name: 'Brute',    col: PAL.blood,   hp: 60, sp: 3.2, dmg: 18, rad: 1.4, scrap: 6, cell: 0.2,  xp: 6, mode: 'melee',  shape: 'block' },
};

function mkMesh(d) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: d.col, roughness: 0.5, metalness: 0.2, emissive: d.col, emissiveIntensity: 0.25, flatShading: true });
  let core;
  if (d.shape === 'spike') core = new THREE.Mesh(new THREE.TetrahedronGeometry(d.rad * 1.1, 0), mat);
  else if (d.shape === 'shard') core = new THREE.Mesh(new THREE.OctahedronGeometry(d.rad, 0), mat);
  else if (d.shape === 'pod') core = new THREE.Mesh(new THREE.DodecahedronGeometry(d.rad, 0), mat);
  else core = new THREE.Mesh(new THREE.BoxGeometry(d.rad * 1.6, d.rad * 1.6, d.rad * 1.6), mat);
  core.castShadow = true; core.position.y = d.rad + 0.3; g.add(core);
  // angry eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(d.rad * 0.22, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: PAL.lime, emissiveIntensity: 1.2 }));
  eye.position.set(0, d.rad + 0.35, d.rad * 0.7); g.add(eye);
  g.userData.body = core;
  return g;
}

export class EnemyManager {
  constructor(scene, ctx) {
    this.scene = scene; this.ctx = ctx;       // ctx: { corePos, heroPos(), damageCore, damageHero, onKill, addBullet }
    this.list = [];
    this.bullets = [];
  }

  spawn(typeKey, hpScale = 1, dmgScale = 1) {
    const d = ROSTER[typeKey];
    const m = mkMesh(d);
    const a = Math.random() * Math.PI * 2;
    const r = CFG.worldRadius + 4 + Math.random() * 6;
    m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    this.scene.add(m);
    const e = {
      key: typeKey, def: d, mesh: m,
      hp: d.hp * hpScale, hpMax: d.hp * hpScale, dmg: d.dmg * dmgScale,
      sp: d.sp, rad: d.rad, fireCd: 1 + Math.random(), hitT: 0, spin: Math.random() * 6.28,
      bob: Math.random() * 6.28,
    };
    this.list.push(e);
    return e;
  }

  damage(e, n, knock) {
    e.hp -= n; e.hitT = 0.12;
    if (knock) { e.mesh.position.x += knock.x; e.mesh.position.z += knock.z; }
    if (e.hp <= 0) this.kill(e);
  }

  kill(e) {
    const i = this.list.indexOf(e); if (i < 0) return;
    this.list.splice(i, 1);
    this.scene.remove(e.mesh);
    this.ctx.onKill(e);
  }

  update(dt, t) {
    const corePos = this.ctx.corePos;
    const hero = this.ctx.heroPos();
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      const p = e.mesh.position;
      // pick target: hero if close, else the Core
      const dHero = Math.hypot(p.x - hero.x, p.z - hero.z);
      const aggroHero = dHero < 10;
      const tx = aggroHero ? hero.x : corePos.x;
      const tz = aggroHero ? hero.z : corePos.z;
      const dx = tx - p.x, dz = tz - p.z;
      const dist = Math.hypot(dx, dz) || 1;

      if (e.def.mode === 'ranged' && dist < 16) {
        // hold distance and shoot
        if (dist < 11) { p.x -= (dx / dist) * e.sp * dt * 0.5; p.z -= (dz / dist) * e.sp * dt * 0.5; }
        e.fireCd -= dt;
        if (e.fireCd <= 0) {
          e.fireCd = 1.6;
          this.fire(p, dx / dist, dz / dist, e);
        }
      } else {
        p.x += (dx / dist) * e.sp * dt;
        p.z += (dz / dist) * e.sp * dt;
      }

      // contact with core
      const dCore = Math.hypot(p.x - corePos.x, p.z - corePos.z);
      if (dCore < CFG.core.radius + e.rad + 0.4) {
        this.ctx.damageCore(e.dmg * dt * 1.4);
        // shove back a touch so they linger and chip rather than vanish
        p.x += (p.x - corePos.x) / dCore * dt * 2;
        p.z += (p.z - corePos.z) / dCore * dt * 2;
      }
      // contact with hero
      if (dHero < CFG.hero.radius + e.rad + 0.3) {
        this.ctx.damageHero(e.dmg * dt * 1.2);
      }

      // face travel + idle spin/bob
      e.mesh.rotation.y = Math.atan2(dx, dz);
      e.bob += dt * 3;
      e.mesh.userData.body.position.y = e.rad + 0.3 + Math.sin(e.bob) * 0.12;
      e.mesh.userData.body.rotation.y += dt * 1.5;
      // hit flash
      if (e.hitT > 0) {
        e.hitT -= dt;
        e.mesh.userData.body.material.emissiveIntensity = 1.4;
      } else {
        e.mesh.userData.body.material.emissiveIntensity = 0.25;
      }
    }

    // enemy bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.mesh.position.x += b.vx * dt; b.mesh.position.z += b.vz * dt;
      b.life -= dt;
      const dh = Math.hypot(b.mesh.position.x - hero.x, b.mesh.position.z - hero.z);
      const dc = Math.hypot(b.mesh.position.x - corePos.x, b.mesh.position.z - corePos.z);
      if (dh < CFG.hero.radius + 0.4) { this.ctx.damageHero(b.dmg); this.removeBullet(i); continue; }
      if (dc < CFG.core.radius + 0.4) { this.ctx.damageCore(b.dmg); this.removeBullet(i); continue; }
      if (b.life <= 0) this.removeBullet(i);
    }
  }

  fire(p, nx, nz, e) {
    const geo = new THREE.SphereGeometry(0.28, 8, 8);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: e.def.col, emissive: e.def.col, emissiveIntensity: 1 }));
    m.position.set(p.x, 1.4, p.z); this.scene.add(m);
    const sp = 18;
    this.bullets.push({ mesh: m, vx: nx * sp, vz: nz * sp, dmg: e.dmg, life: 2.4 });
  }

  removeBullet(i) { this.scene.remove(this.bullets[i].mesh); this.bullets.splice(i, 1); }

  clear() {
    for (const e of this.list) this.scene.remove(e.mesh);
    for (const b of this.bullets) this.scene.remove(b.mesh);
    this.list.length = 0; this.bullets.length = 0;
  }
}
