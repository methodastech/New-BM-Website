/* ==========================================================================
   PIT CREW — rigged, motion-captured humans (Mixamo "Xbot" from the
   three.js examples) driven by an AnimationMixer, with procedural kneel /
   squat / reach layered on the skeleton in character space.
   ========================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const RIGHT = new THREE.Vector3();
const P = new THREE.Quaternion(), Pi = new THREE.Quaternion(), D = new THREE.Quaternion(), RQ = new THREE.Quaternion();
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* APXGP coverall, painted in the rig's bind pose (cm, z-up, front = +y) so the
   panels stay glued to the body while it animates:
   black base · grey side/leg/under-arm panels · grey shoulder yokes with three
   white stripes · black belt · white wordmark on the back and chest.
   `bindMat` maps each rig's bind pose into that canonical space. */
function applyCoverall(m, logo, belt, bindMat) {
  m.map = null;
  m.color.set(0xffffff);
  m.roughness = 0.8; m.metalness = 0; m.envMapIntensity = 0.45;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.logoMap = { value: logo };
    sh.uniforms.beltMap = { value: belt };
    sh.uniforms.bindMat = { value: bindMat };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBindPos;\nvarying vec3 vBindN;\nuniform mat3 bindMat;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBindPos = bindMat * position;\nvBindN = bindMat * normal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBindPos;\nvarying vec3 vBindN;\nuniform sampler2D logoMap;\nuniform sampler2D beltMap;')
      .replace('#include <map_fragment>', `
        vec3 P = vBindPos; vec3 N = normalize(vBindN);
        float ax = abs(P.x);
        float side = N.x * sign(P.x);
        vec3 BLACK = vec3(0.022), GREY = vec3(0.075), WHITE = vec3(0.62);
        vec3 col = BLACK;
        if (P.z < 96.0 && side > 0.72) col = GREY;                                // outer leg panels
        if (P.z > 104.0 && P.z < 138.0 && ax > 10.5 && ax < 23.0 && side > 0.75) col = GREY; // torso side panels
        if (ax > 23.0 && P.z > 118.0 && N.z < -0.55) col = GREY;                  // under-arm panel
        if (P.z > 134.0 && ax > 7.5 && ax < 26.0 && N.z > 0.3) {                  // shoulder yoke
          col = GREY;
          float s = abs(fract((P.y + 20.0) / 2.6) - 0.5);
          if (P.y > -5.5 && P.y < 2.5 && s < 0.14) col = WHITE;                   // three stripes
        }
        if (P.z > 98.0 && P.z < 104.5 && ax < 18.5) col = vec3(0.012);            // belt
        if (P.z < 9.0) col = vec3(0.02);                                          // boots
        // APXGP over Expensify (texture is 1.28 : 1)
        if (ax < 15.0 && P.z > 114.0 && P.z < 137.4 && N.y < -0.3) {             // back
          float a = texture2D(logoMap, vec2((P.x + 15.0) / 30.0, (P.z - 114.0) / 23.4)).a;
          col = mix(col, WHITE, a);
        }
        if (ax < 11.0 && P.z > 111.0 && P.z < 128.2 && N.y > 0.3) {              // chest
          float a = texture2D(logoMap, vec2((11.0 - P.x) / 22.0, (P.z - 111.0) / 17.2)).a;
          col = mix(col, WHITE, a);
        }
        if (ax < 5.0 && P.z > 98.0 && P.z < 104.5 && N.y < -0.3) {               // OMP belt badge
          vec4 b = texture2D(beltMap, vec2((P.x + 5.0) / 10.0, (P.z - 98.0) / 6.5));
          col = mix(col, b.rgb * 0.7, b.a);
        }
        if (P.z > 152.0) col = vec3(0.02);                                        // neck/head, under the helmet
        diffuseColor.rgb *= col;
      `);
  };
  m.needsUpdate = true;
}

// per rig: bind pose → canonical (cm · x lateral · y front · z up), and the yaw that makes it face -z
const RIGS = {
  vanguard: { bind: new THREE.Matrix3(), yaw: 0 },
  xbot: { bind: new THREE.Matrix3().set(-100, 0, 0, 0, 0, 100, 0, 100, 0), yaw: Math.PI },
};

export async function loadCrewKit(url, palette = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let rig = 'xbot';
  gltf.scene.traverse((o) => { if (/vanguard/i.test(o.name)) rig = 'vanguard'; });
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.frustumCulled = false; // skinned bounds don't follow the pose
    const m = o.material;
    if (/visor/i.test(m.name)) {
      m.color.set(palette.visor ?? 0x1a1c22);
      m.metalness = 0.95; m.roughness = 0.08; m.envMapIntensity = 1.4;
    } else {
      applyCoverall(m, palette.logo, palette.belt, RIGS[rig].bind);
    }
  });
  const clips = Object.fromEntries(gltf.animations.map((c) => [c.name.toLowerCase(), c]));
  return { scene: gltf.scene, clips, rig: RIGS[rig], helmet: makeHelmet(palette) };
}

// crew helmet (metres, forward = -z): gloss black shell, iridium visor, white centre stripe
function makeHelmet(palette) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.118, 36, 24),
    new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: 0.25, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9 }),
  );
  shell.scale.set(1, 1.05, 1.13);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.1215, 36, 12, Math.PI * 1.5 - 0.95, 1.9, 1.2, 0.55),
    new THREE.MeshPhysicalMaterial({ color: palette.visor ?? 0xb8935a, roughness: 0.08, metalness: 1, clearcoat: 1, envMapIntensity: 1.6 }),
  );
  visor.scale.copy(shell.scale);
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.1195, 0.008, 6, 48, Math.PI * 0.95),
    new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.4 }),
  );
  stripe.rotation.set(0, Math.PI / 2, 0);
  stripe.scale.copy(shell.scale);
  [shell, visor, stripe].forEach((m) => { m.castShadow = true; g.add(m); });
  return g;
}

export class CrewMember {
  constructor(kit) {
    this.root = new THREE.Group();          // choreography moves/rotates this; forward = -z
    this.model = cloneSkinned(kit.scene);
    this.model.rotation.y = kit.rig.yaw;
    this.model.scale.set(1.08, 1, 1.1);    // a touch broader: coverall, not mannequin
    this.root.add(this.model);

    this.mixer = new THREE.AnimationMixer(this.model);
    this.actions = {};
    ['idle', 'walk', 'run'].forEach((k) => {
      const a = this.mixer.clipAction(kit.clips[k]);
      a.play(); a.setEffectiveWeight(k === 'idle' ? 1 : 0);
      a.time = Math.random() * kit.clips[k].duration;
      this.actions[k] = a;
    });

    const bone = (n) => this.model.getObjectByName('mixamorig' + n);
    this.b = {
      spine: bone('Spine'), spine2: bone('Spine2'), head: bone('Head'),
      lUp: bone('LeftUpLeg'), lLeg: bone('LeftLeg'), lFoot: bone('LeftFoot'),
      rUp: bone('RightUpLeg'), rLeg: bone('RightLeg'), rFoot: bone('RightFoot'),
      lArm: bone('LeftArm'), lFore: bone('LeftForeArm'),
      rArm: bone('RightArm'), rFore: bone('RightForeArm'), rHand: bone('RightHand'), lHand: bone('LeftHand'),
    };

    this.pose = { kneel: 0, squat: 0, reach: 0, lean: 0 };
    this.face = new THREE.Vector2(0, 0);   // world x/z to look at
    this.faceMotion = false;               // true → turn toward travel direction
    this.prev = new THREE.Vector3();
    this.vel = new THREE.Vector2();
    this.speed = 0;
    this.yaw = 0;
    this.first = true;
    this.holders = [];
    if (kit.helmet) this.hold(kit.helmet.clone(), 'head', true).children[0].position.set(0, 0.085, -0.008);
  }

  /** attach a mesh to a bone, sized in metres (bones live in the 0.01-scaled rig).
      `fixed` keeps the bind-pose offset and follows the bone; otherwise it is
      re-aimed along the body's facing every frame (tools held in moving hands). */
  hold(mesh, boneKey = 'rHand', fixed = false) {
    const holder = new THREE.Group();
    holder.add(mesh);
    const bone = this.b[boneKey];
    bone.add(holder);
    holder.scale.setScalar(100);
    if (fixed) {
      this.root.updateMatrixWorld(true);
      bone.getWorldQuaternion(P); this.root.getWorldQuaternion(RQ);
      holder.quaternion.copy(P.invert().multiply(RQ));
    } else this.holders.push(holder);
    return holder;
  }

  update(dt) {
    const p = this.root.position;
    if (this.first) { this.prev.copy(p); this.first = false; }
    const inv = dt > 0 ? 1 / dt : 0;
    this.vel.set((p.x - this.prev.x) * inv, (p.z - this.prev.z) * inv);
    this.prev.copy(p);
    const sp = this.vel.length();
    this.speed += (sp - this.speed) * Math.min(1, dt * 14);

    // heading
    let target;
    if (this.faceMotion && this.speed > 0.6) target = Math.atan2(-this.vel.x, -this.vel.y);
    else target = Math.atan2(-(this.face.x - p.x), -(this.face.y - p.z));
    let d = target - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, dt * 12);
    this.root.rotation.y = this.yaw;

    // locomotion blend; play backwards when back-pedalling
    const fwdX = -Math.sin(this.yaw), fwdZ = -Math.cos(this.yaw);
    const along = sp > 0.05 ? (this.vel.x * fwdX + this.vel.y * fwdZ) / sp : 1;
    const dir = along < -0.3 ? -1 : 1;
    const run = smooth(1.4, 2.8, this.speed);
    const walk = clamp01(this.speed / 0.9) * (1 - run);
    const still = clamp01(1 - run - walk);
    const A = this.actions;
    A.run.setEffectiveWeight(run); A.run.timeScale = dir * Math.max(0.8, this.speed / 3.6);
    A.walk.setEffectiveWeight(walk); A.walk.timeScale = dir * Math.max(0.6, this.speed / 1.3);
    A.idle.setEffectiveWeight(still);
    this.mixer.update(dt);

    this.applyPose(1 - run * 0.7);
    // held tools keep pointing where the body faces, whatever the hand is doing
    if (this.holders.length) {
      this.root.getWorldQuaternion(RQ);
      this.holders.forEach((h) => { h.parent.getWorldQuaternion(P); h.quaternion.copy(P.invert().multiply(RQ)); });
    }
  }

  // rotate a bone about the character's right axis, in world space
  bend(bone, angle) {
    if (!bone || Math.abs(angle) < 1e-4) return;
    bone.parent.getWorldQuaternion(P);
    Pi.copy(P).invert();
    D.setFromAxisAngle(RIGHT, angle);
    bone.quaternion.premultiply(Pi.multiply(D).multiply(P));
  }

  applyPose(k) {
    const { kneel, squat, reach, lean } = this.pose;
    const kn = kneel * k, sq = squat * k, re = reach;
    this.root.getWorldQuaternion(RQ);
    RIGHT.set(1, 0, 0).applyQuaternion(RQ);
    const b = this.b;

    this.model.position.y = -(0.48 * kn + 0.4 * sq);
    // legs — left foot planted forward, right knee down (kneel); both knees forward (squat)
    this.bend(b.lUp, 1.45 * kn + 1.55 * sq);
    this.bend(b.lLeg, -(1.5 * kn + 1.95 * sq));
    this.bend(b.lFoot, 0.05 * kn + 0.4 * sq);
    this.bend(b.rUp, 0.15 * kn + 1.55 * sq);
    this.bend(b.rLeg, -(1.6 * kn + 1.95 * sq));
    this.bend(b.rFoot, 0.9 * kn + 0.4 * sq);
    // torso + arms
    this.bend(b.spine, -(0.3 * kn + 0.45 * sq + 0.25 * re + lean));
    this.bend(b.lArm, 1.05 * re);
    this.bend(b.rArm, 1.05 * re);
    this.bend(b.lFore, 0.45 * re);
    this.bend(b.rFore, 0.45 * re);
    this.bend(b.head, 0.25 * (kn + sq) + 0.15 * re);
  }
}
