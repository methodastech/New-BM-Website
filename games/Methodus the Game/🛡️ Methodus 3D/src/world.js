// METHODUS — world: grassland, a modern corrugated-metal shed (the base),
// golden-hour lighting, gradient sky, and a following iso camera.
import * as THREE from 'three';
import { PAL, CFG } from './config.js';

export const scene = new THREE.Scene();
export let renderer, camera;
let canvas, sun;
export const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
export const shed = { group: null, doorLight: null };
const grassTufts = [];

/* ---- procedural corrugated-metal stripe texture ---- */
function stripeTex(a, b, count, vertical) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < count; i++) {
    g.fillStyle = i % 2 ? a : b;
    if (vertical) g.fillRect((i / count) * 128, 0, 128 / count + 1, 128);
    else g.fillRect(0, (i / count) * 128, 128, 128 / count + 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initWorld(cv) {
  canvas = cv;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  buildSky();
  scene.fog = new THREE.Fog(0x9fb6a0, 48, 130);

  camera = new THREE.PerspectiveCamera(CFG.camera.fov, 1, 0.1, 500);
  camera.position.set(0, CFG.camera.height, CFG.camera.dist);
  camera.lookAt(0, 0, 0);

  buildLights();
  buildGround();
  buildProps();
  buildShed();
  resize();
  addEventListener('resize', resize);
}

function buildSky() {
  // vertical gradient sky dome
  const c = document.createElement('canvas'); c.width = 8; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#2a3a52');   // high sky
  grd.addColorStop(0.5, '#6d7e83');
  grd.addColorStop(0.78, '#c9b489'); // warm horizon
  grd.addColorStop(1, '#e3c79a');
  g.fillStyle = grd; g.fillRect(0, 0, 8, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(280, 24, 16),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })
  );
  scene.add(sky);
}

function buildLights() {
  const hemi = new THREE.HemisphereLight(0xcfe2ff, 0x4a5a36, 0.7);
  scene.add(hemi);
  sun = new THREE.DirectionalLight(0xffd9a0, 2.1);      // warm low sun
  sun.position.set(34, 30, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = 44;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x5b8cff, 0.4);  // cool back-rim
  rim.position.set(-24, 14, -22); scene.add(rim);
}

function buildGround() {
  const R = 220;
  const mat = new THREE.MeshStandardMaterial({ color: PAL.grass, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(R, 80), mat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const patchMat = new THREE.MeshStandardMaterial({ color: PAL.grassLo, roughness: 1, transparent: true, opacity: 0.55 });
  const patchHi = new THREE.MeshStandardMaterial({ color: PAL.grassHi, roughness: 1, transparent: true, opacity: 0.4 });
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 70;
    const p = new THREE.Mesh(new THREE.CircleGeometry(2 + Math.random() * 6, 14), i % 3 ? patchMat : patchHi);
    p.rotation.x = -Math.PI / 2; p.rotation.z = Math.random() * 6.28;
    p.position.set(Math.cos(a) * r, 0.02 + Math.random() * 0.01, Math.sin(a) * r);
    scene.add(p);
  }
  // packed-dirt pad around the shed
  const pad = new THREE.Mesh(new THREE.CircleGeometry(11, 40),
    new THREE.MeshStandardMaterial({ color: PAL.soil, roughness: 1 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.03, 2); pad.receiveShadow = true; scene.add(pad);
}

function buildProps() {
  const tuftGeo = new THREE.ConeGeometry(0.34, 1.0, 5);
  for (let i = 0; i < 300; i++) {
    const a = Math.random() * Math.PI * 2, r = 13 + Math.random() * 90;
    const m = new THREE.Mesh(tuftGeo, new THREE.MeshStandardMaterial({ color: i % 3 ? PAL.grassHi : PAL.grass, roughness: 1, flatShading: true }));
    m.position.set(Math.cos(a) * r, 0.45, Math.sin(a) * r);
    m.rotation.y = Math.random() * 6.28;
    const s = 0.5 + Math.random() * 1; m.scale.set(s, s + Math.random() * 0.8, s);
    m.castShadow = true; m.userData.sway = Math.random() * 6.28; m.userData.baseRot = 0;
    scene.add(m); grassTufts.push(m);
  }
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 70;
    const m = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0x6f7378, roughness: 1, flatShading: true }));
    m.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r);
    const s = 0.6 + Math.random() * 1.6; m.scale.set(s, s * 0.7, s);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.castShadow = true; m.receiveShadow = true; scene.add(m);
  }
  // distant tree line (Loop-Hero-ish silhouettes)
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = 70 + Math.random() * 80;
    const gr = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5 + Math.random() * 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 1, flatShading: true }));
    trunk.position.y = 3; trunk.castShadow = true; gr.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4 + Math.random() * 1.8, 0),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x3f6b34 : 0x335a2c, roughness: 1, flatShading: true }));
    crown.position.y = 6.5 + Math.random(); crown.castShadow = true; gr.add(crown);
    gr.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    scene.add(gr);
  }
}

/* ---- the base: a modern corrugated-metal shed ---- */
function buildShed() {
  const g = new THREE.Group();
  const W = 9, D = 6.5, H = 4.2;

  // concrete slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 1.4, 0.4, D + 1.4),
    new THREE.MeshStandardMaterial({ color: 0x9a9488, roughness: 0.95 }));
  slab.position.y = 0.2; slab.receiveShadow = true; slab.castShadow = true; g.add(slab);

  // walls — corrugated metal (vertical ridges via stripe texture)
  const wallTex = stripeTex('#d9d2c0', '#c2bba8', 26, true);
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping; wallTex.repeat.set(3, 1);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xece6d6, roughness: 0.7, metalness: 0.25 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wallMat);
  body.position.y = 0.4 + H / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);

  // mono-pitch (shed) roof — darker corrugated metal, overhanging eaves
  const roofTex = stripeTex('#41464d', '#34383e', 30, false);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 0.9, 0.3, D + 0.9),
    new THREE.MeshStandardMaterial({ map: roofTex, color: 0x3a3f46, roughness: 0.6, metalness: 0.4 }));
  roof.position.set(0, 0.4 + H + 0.45, 0); roof.rotation.x = -0.12; roof.castShadow = true; g.add(roof);
  // roof fascia trim (Marathon lime)
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(W + 0.95, 0.18, 0.18),
    new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.35, roughness: 0.5 }));
  fascia.position.set(0, 0.4 + H + 0.1, D / 2 + 0.5); g.add(fascia);

  // front roller door (orange) with horizontal slats
  const doorTex = stripeTex('#ff5a1f', '#d8470f', 9, false);
  const door = new THREE.Mesh(new THREE.BoxGeometry(4, 3.1, 0.18),
    new THREE.MeshStandardMaterial({ map: doorTex, color: 0xff5a1f, roughness: 0.55, metalness: 0.3 }));
  door.position.set(-1.6, 0.4 + 1.55, D / 2 + 0.02); g.add(door);
  // door frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: 0.6, metalness: 0.4 });
  for (const [x, y, w, h] of [[-1.6, 0.4 + 3.2, 4.3, 0.18], [-3.7, 0.4 + 1.55, 0.18, 3.3], [0.5, 0.4 + 1.55, 0.18, 3.3]])
    { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.22), frameMat); f.position.set(x, y, D / 2 + 0.04); g.add(f); }

  // side window — dark glass with lime frame
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0e2630, emissive: 0x0a3a44, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.6 }));
  glass.position.set(2.5, 0.4 + 2.2, D / 2 + 0.02); g.add(glass);
  const gframe = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.6, 0.1),
    new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.25, roughness: 0.5 }));
  gframe.position.set(2.5, 0.4 + 2.2, D / 2 + 0.0); g.add(gframe);

  // roof-top vent box + pipe
  const vent = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x53585f, roughness: 0.6, metalness: 0.5 }));
  vent.position.set(2.6, 0.4 + H + 0.9, -1.4); vent.castShadow = true; g.add(vent);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.5, metalness: 0.5 }));
  pipe.position.set(W / 2 - 0.3, 0.4 + 2, D / 2 - 0.3); g.add(pipe);

  // "01" hazard sign panel (emissive)
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x101317, roughness: 0.6 }));
  sign.position.set(3.2, 0.4 + H - 0.6, D / 2 + 0.05); g.add(sign);
  const sBar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.12),
    new THREE.MeshStandardMaterial({ color: PAL.orange, emissive: PAL.orange, emissiveIntensity: 0.5 }));
  sBar.position.set(3.2, 0.4 + H - 0.18, D / 2 + 0.07); g.add(sBar);

  // warm light over the door
  const dl = new THREE.PointLight(0xffcaa0, 1.4, 12); dl.position.set(-1.6, 0.4 + 3.4, D / 2 + 0.8); g.add(dl);
  shed.doorLight = dl;

  g.position.set(0, 0, -3);   // base sits back; robot stands in front
  scene.add(g);
  shed.group = g;
}

export function updateWorld(dt, t) {
  for (const m of grassTufts) m.rotation.z = Math.sin(t * 1.5 + m.userData.sway) * 0.13;
  if (shed.doorLight) shed.doorLight.intensity = 1.3 + Math.sin(t * 8) * 0.08; // faint flicker
}

export function followCamera(target, t) {
  const desired = new THREE.Vector3(
    target.x + Math.sin(t * 0.05) * 0.6,
    CFG.camera.height,
    target.z + CFG.camera.dist
  );
  camera.position.lerp(desired, CFG.camera.lerp);
  camera.lookAt(target.x, 1.6, target.z - 3);
}

function resize() {
  const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
