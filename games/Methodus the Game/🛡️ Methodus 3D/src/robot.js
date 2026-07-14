// METHODUS — the hero unit: a rigged, professionally-animated robot (real
// Idle/Walk/Run clips) carrying a gun that fires on command.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PAL } from './config.js';

const MODEL_URL = './assets/RobotExpressive.glb';

export class Robot {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.facing = 0; this.targetFacing = 0;
    this.faceOffset = Math.PI;        // model's forward correction (tuned to clip)
    this.ready = false;
    this.current = null;
    this.recoilT = 0;
    this.boneNames = [];
    scene.add(this.root);
  }

  load() {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(MODEL_URL, (gltf) => {
        const model = gltf.scene;
        // normalize size: feet to y=0, height ~2.6
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); box.getSize(size);
        const s = 2.6 / size.y;
        model.scale.setScalar(s);
        const box2 = new THREE.Box3().setFromObject(model);
        model.position.y -= box2.min.y;
        model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } if (o.isBone) this.boneNames.push(o.name); });
        // give the robot a Marathon recolor accent on its eyes/visor where possible
        this.model = model;
        this.root.add(model);

        this.mixer = new THREE.AnimationMixer(model);
        this.actions = {};
        for (const clip of gltf.animations) this.actions[clip.name] = this.mixer.clipAction(clip);
        this.play('Idle', 0);

        this.attachGun();
        this.ready = true;
        resolve(this);
      }, undefined, (err) => reject(err));
    });
  }

  attachGun() {
    // build a compact tech rifle
    const gun = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.5, metalness: 0.6, flatShading: true });
    const accMat = new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.8, roughness: 0.4 });
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.95), bodyMat); receiver.position.z = 0.2; gun.add(receiver);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), bodyMat); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.8; gun.add(barrel);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.18), accMat); sight.position.set(0, 0.2, 0.15); gun.add(sight);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.16), bodyMat); grip.position.set(0, -0.22, -0.05); grip.rotation.x = 0.3; gun.add(grip);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.18), accMat); mag.position.set(0, -0.22, 0.18); gun.add(mag);
    // muzzle anchor
    this.muzzle = new THREE.Object3D(); this.muzzle.position.set(0, 0, 1.2); gun.add(this.muzzle);
    // muzzle flash sprite
    this.flash = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff3c0, transparent: true, opacity: 0 }));
    this.flash.position.set(0, 0, 1.25); gun.add(this.flash);
    this.gun = gun;

    // find right-hand bone, attach there
    let hand = null;
    this.model.traverse(o => {
      if (!o.isBone) return;
      const n = o.name.toLowerCase();
      if (!hand && (n.includes('handr') || n.includes('righthand') || (n.includes('hand') && n.includes('r')))) hand = o;
    });
    if (!hand) this.model.traverse(o => { if (o.isBone && !hand && o.name.toLowerCase().includes('hand')) hand = o; });
    this.handBone = hand;
    if (hand) {
      // bone space is scaled by the model; counter-scale the gun a touch
      gun.scale.setScalar(1.1);
      gun.position.set(0.0, 0.0, 0.0);
      gun.rotation.set(0, 0, 0);
      hand.add(gun);
    } else {
      // fallback: attach to root pointing forward
      gun.position.set(0.55, 1.5, 0.6);
      this.root.add(gun);
    }
  }

  play(name, fade = 0.25) {
    const next = this.actions[name];
    if (!next || this.current === next) return;
    next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
    this.currentName = name;
  }

  // speedFrac 0..1 of max; sprinting bool
  setMotion(speedFrac, sprinting) {
    if (!this.ready) return;
    if (speedFrac < 0.06) this.play('Idle');
    else if (sprinting || speedFrac > 0.85) { this.play('Running'); this.actions['Running'].timeScale = 1.0; }
    else { this.play('Walking'); this.actions['Walking'].timeScale = 1.1; }
  }

  faceTo(angle) { this.targetFacing = angle; }

  shoot() {
    this.recoilT = 0.12;
    if (this.flash) this.flash.material.opacity = 1;
  }

  get position() { return this.root.position; }

  getMuzzleWorld(out) {
    out = out || new THREE.Vector3();
    if (this.muzzle) this.muzzle.getWorldPosition(out);
    else out.copy(this.root.position).add(new THREE.Vector3(0, 1.4, 0));
    return out;
  }

  update(dt, t) {
    if (!this.ready) return;
    this.mixer.update(dt);
    // smooth facing
    let d = (this.targetFacing + this.faceOffset) - this.facing;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.facing += d * Math.min(1, dt * 14);
    this.root.rotation.y = this.facing;
    // recoil + flash decay
    if (this.recoilT > 0) { this.recoilT -= dt; if (this.gun) this.gun.position.z = -0.18 * (this.recoilT / 0.12); }
    else if (this.gun && this.handBone) this.gun.position.z = 0;
    if (this.flash && this.flash.material.opacity > 0) this.flash.material.opacity = Math.max(0, this.flash.material.opacity - dt * 9);
  }
}
