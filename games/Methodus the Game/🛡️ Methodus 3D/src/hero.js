// METHODUS — the hero: a procedural low-poly humanoid robot that walks,
// turns smoothly, idles with a breathing bob, and swings a weapon.
import * as THREE from 'three';
import { PAL } from './config.js';

const matBody  = () => new THREE.MeshStandardMaterial({ color: PAL.ink2, roughness: 0.6, metalness: 0.35, flatShading: true });
const matPanel = () => new THREE.MeshStandardMaterial({ color: PAL.bone, roughness: 0.5, metalness: 0.2, flatShading: true });
const matAcc   = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.4 });

export class Hero {
  constructor(scene) {
    this.root = new THREE.Group();
    this.body = new THREE.Group();      // rotates to face aim
    this.root.add(this.body);
    this.facing = 0;                    // current rendered facing
    this.targetFacing = 0;
    this.walk = 0;                      // 0..1 movement amount
    this.phase = 0;                     // gait phase
    this.attackT = 0;                   // attack animation timer
    this.hurtT = 0;
    this.weaponKind = 'gun';
    this.build();
    scene.add(this.root);
  }

  build() {
    const B = this.body;
    // pelvis
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.7), matBody());
    pelvis.position.y = 1.5; pelvis.castShadow = true; B.add(pelvis);
    // torso
    this.torso = new THREE.Group(); this.torso.position.y = 1.8; B.add(this.torso);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.85), matBody());
    chest.castShadow = true; this.torso.add(chest);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.2), matPanel());
    plate.position.set(0, 0.05, 0.45); this.torso.add(plate);
    // chest reactor (lime glow that breathes)
    this.reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10), matAcc(PAL.lime));
    this.reactor.rotation.x = Math.PI / 2; this.reactor.position.set(0, 0.05, 0.56); this.torso.add(this.reactor);
    const rLight = new THREE.PointLight(PAL.lime, 0.7, 4); rLight.position.set(0, 0.05, 0.7); this.torso.add(rLight);
    // shoulders
    const sh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 0.8), matBody());
    sh.position.y = 0.55; this.torso.add(sh);
    // head
    this.head = new THREE.Group(); this.head.position.y = 0.95; this.torso.add(this.head);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), matBody());
    skull.castShadow = true; this.head.add(skull);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.12), matAcc(PAL.lime));
    visor.position.set(0, 0.05, 0.36); this.head.add(visor);
    this.visor = visor;
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), matPanel());
    antenna.position.set(0.28, 0.55, -0.1); this.head.add(antenna);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), matAcc(PAL.orange));
    tip.position.set(0.28, 0.82, -0.1); this.head.add(tip);

    // arms (pivot at shoulder)
    this.armL = this.makeArm(-1); this.armL.position.set(-0.95, 0.5, 0); this.torso.add(this.armL);
    this.armR = this.makeArm(1);  this.armR.position.set(0.95, 0.5, 0);  this.torso.add(this.armR);

    // weapon in right hand
    this.weapon = new THREE.Group();
    this.armR.add(this.weapon); this.weapon.position.set(0, -1.05, 0.1);
    this.buildWeapon('gun');

    // legs (pivot at hip)
    this.legL = this.makeLeg(); this.legL.position.set(-0.42, 1.5, 0); B.add(this.legL);
    this.legR = this.makeLeg(); this.legR.position.set(0.42, 1.5, 0);  B.add(this.legR);

    // ground shadow disc fallback
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; this.root.add(disc);
  }

  makeArm(side) {
    const g = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.34), matBody());
    upper.position.y = -0.35; upper.castShadow = true; g.add(upper);
    const fore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), matBody());
    fore.position.y = -0.95; g.add(fore);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), matPanel());
    hand.position.y = -1.3; g.add(hand);
    return g;
  }

  makeLeg() {
    const g = new THREE.Group();
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.42), matBody());
    thigh.position.y = -0.4; thigh.castShadow = true; g.add(thigh);
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.8, 0.38), matBody());
    shin.position.y = -1.1; g.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.7), matPanel());
    foot.position.set(0, -1.55, 0.12); g.add(foot);
    return g;
  }

  buildWeapon(kind) {
    this.weaponKind = kind;
    this.weapon.clear();
    if (kind === 'melee') {
      const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), matPanel());
      this.weapon.add(hilt);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 0.26), matAcc(PAL.cyan));
      blade.position.y = 1.1; this.weapon.add(blade);
    } else {
      // gun body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 1.3), matBody());
      body.position.z = 0.35; this.weapon.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), matPanel());
      barrel.rotation.x = Math.PI / 2; barrel.position.z = 1.0; this.weapon.add(barrel);
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.16), matAcc(PAL.orange));
      sight.position.set(0, 0.22, 0.4); this.weapon.add(sight);
      this.muzzle = barrel;
    }
    // hold pose: weapon points forward (-Z of body when arm hangs)
    this.weapon.rotation.x = Math.PI / 2;
  }

  setWeaponKind(kind) {
    const wk = kind === 'melee' ? 'melee' : 'gun';
    if (wk !== this.weaponKind) this.buildWeapon(wk);
  }

  triggerAttack() { this.attackT = this.weaponKind === 'melee' ? 0.42 : 0.14; }
  triggerHurt() { this.hurtT = 0.25; }

  get position() { return this.root.position; }

  update(dt, t) {
    // smooth facing toward target (shortest arc)
    let d = this.targetFacing - this.facing;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.facing += d * Math.min(1, dt * 14);
    this.body.rotation.y = this.facing;

    // gait
    const moving = this.walk > 0.05;
    this.phase += dt * (6 + this.walk * 8) * (moving ? 1 : 0.0);
    const sw = Math.sin(this.phase) * this.walk;
    const sw2 = Math.sin(this.phase + Math.PI) * this.walk;
    this.legL.rotation.x = sw * 0.9;
    this.legR.rotation.x = sw2 * 0.9;
    // knees bend on the back-swing
    this.legL.children[1].rotation.x = Math.max(0, -sw) * 0.8;
    this.legR.children[1].rotation.x = Math.max(0, -sw2) * 0.8;
    this.armL.rotation.x = sw2 * 0.7;
    if (this.attackT <= 0) this.armR.rotation.x = sw * 0.5;

    // breathing bob (idle) + walk bounce
    const breathe = Math.sin(t * 2.4) * 0.04;
    const bounce = Math.abs(Math.sin(this.phase)) * 0.12 * this.walk;
    this.body.position.y = breathe + bounce;
    this.torso.rotation.z = Math.sin(t * 2.0) * 0.015 + sw * 0.04;
    this.head.rotation.y = Math.sin(t * 0.8) * 0.08 * (1 - this.walk);
    this.reactor.material.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.3;

    // attack pose
    if (this.attackT > 0) {
      this.attackT -= dt;
      const k = this.attackT / (this.weaponKind === 'melee' ? 0.42 : 0.14);
      if (this.weaponKind === 'melee') {
        // big overhead/side arc swing
        this.armR.rotation.x = -2.2 + (1 - k) * 3.4;
        this.armR.rotation.z = -0.6 + (1 - k) * 1.2;
      } else {
        // recoil kick
        this.armR.rotation.x = -1.45 - (k) * 0.4;
      }
    } else if (!moving) {
      // resting aim: weapon roughly forward
      this.armR.rotation.x += (-1.2 - this.armR.rotation.x) * Math.min(1, dt * 8);
      this.armR.rotation.z += (0 - this.armR.rotation.z) * Math.min(1, dt * 8);
    }

    // hurt flash
    if (this.hurtT > 0) {
      this.hurtT -= dt;
      const f = this.hurtT > 0;
      this.visor.material.color.setHex(f ? PAL.orange : PAL.lime);
      this.visor.material.emissive.setHex(f ? PAL.orange : PAL.lime);
    }
  }
}
