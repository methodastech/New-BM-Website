/* ==========================================================================
   PIT STOP — WebGL loading sequence (Three.js)
   Car drives into the box, jacks up, four wheels change in real time (1.98s),
   car launches out of frame. Dispatches `pitstop:done`; disposes itself on
   `loader:hidden`. Driven by the shared GSAP ticker (one clock with the site).
   ========================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadCrewKit, CrewMember } from './crew.js';
import { wordmarkTexture, numberTexture, camoTexture, textTexture, crewLogoTexture, beltTexture } from './livery.js';

const canvas = document.querySelector('#pit');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const done = () => dispatchEvent(new Event('pitstop:done'));

const hasWebGL = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
};

if (canvas && !reduce) {
  if (!hasWebGL()) done();
  else {
    // start fetching the rigged crew while the scene is built
    const kit = loadCrewKit('assets/models/Xbot.glb', { logo: crewLogoTexture(), belt: beltTexture(), visor: 0xb8935a });
    run(kit).catch((err) => { console.error(err); done(); });
  }
}

async function run(kitPromise) {
  const { PI } = Math;
  const gsap = window.gsap;

  /* ---------- renderer / scene / camera ---------- */
  const DPR = Math.min(devicePixelRatio || 1, 1.75);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  scene.fog = new THREE.Fog(0x070708, 26, 52);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 4, 90);
  const cam = { tilt: 0.1, dist: 1.22, yaw: -0.06, look: -0.2, shake: 0 };

  const rt = new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.5, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xc9d0de, 0x101012, 0.7));
  const sun = new THREE.DirectionalLight(0xfff4ea, 1.25);
  sun.position.set(3, 14, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 8, bottom: -8, near: 2, far: 30 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const key = new THREE.SpotLight(0xfff1e2, 1.6, 0, 0.5, 0.9, 0);
  key.position.set(-6, 17, -7);  // off-axis so its glint never mirrors straight into the lens
  key.target.position.set(0, 0, -0.2);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffd9c2, 0.7);
  rim.position.set(-6, 5, -10);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.25);
  fill.position.set(8, 6, 8);
  scene.add(fill);

  /* ---------- materials ---------- */
  const physical = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.34, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.3, envMapIntensity: 0.6, ...o });
  const standard = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.3, ...o });
  const camo = camoTexture();
  camo.repeat.set(0.7, 0.7);
  const M = {
    paint: physical(0xffffff, { map: camo, metalness: 0.3, roughness: 0.4, envMapIntensity: 0.32 }),
    gold: physical(0xa9844f, { metalness: 1, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.35, envMapIntensity: 0.42 }),
    silver: standard(0xb9bcc2, { metalness: 0.9, roughness: 0.3, envMapIntensity: 0.9 }),
    hard: standard(0xe9e5dc, { roughness: 0.5, emissive: 0x2a2a2a, emissiveIntensity: 0.6 }),
    red: physical(0xd0120a, { metalness: 0.15 }),
    white: physical(0xcfc9bd, { metalness: 0 }),
    carbon: standard(0x0b0b0d, { roughness: 0.45, metalness: 0.45, envMapIntensity: 0.45 }),
    cockpit: standard(0x030304, { roughness: 0.9 }),
    rubber: standard(0x2c2c31, { roughness: 0.62, metalness: 0, envMapIntensity: 0.5 }),
    rim: standard(0x17171a, { roughness: 0.32, metalness: 0.8, envMapIntensity: 0.8 }),
    soft: standard(0xe0201a, { roughness: 0.5, emissive: 0x400000, emissiveIntensity: 0.6 }),
    tool: standard(0x8d9097, { roughness: 0.35, metalness: 0.85, envMapIntensity: 0.8 }),
    boxLine: standard(0xc9a14a, { roughness: 0.4, metalness: 0.6, emissive: 0x4a3409, emissiveIntensity: 0.9 }),
    line: standard(0xd8d4cc, { roughness: 0.7, emissive: 0x222222 }),
    lane: standard(0x6d6a64, { roughness: 0.8 }),
    rain: new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 0.35, 0.2) }),
  };

  const mesh = (geo, mat, cast = true, receive = false) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast; m.receiveShadow = receive;
    return m;
  };
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  const rod = (a, b, r, mat) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const m = mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
  };

  // Top-view outline → extruded slab. Shape y = forward, so it maps to world -z.
  const extrude = (shape, height, bevel) => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: height, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 28,
    });
    g.rotateX(-PI / 2);
    return g;
  };
  // symmetric outline from half points (first & last on the centreline)
  const slab = (half, height, mat, y0, bevel = 0.025, smooth = true) => {
    const R = half.map(([x, y]) => new THREE.Vector2(x, y));
    const L = half.slice().reverse().map(([x, y]) => new THREE.Vector2(-x, y));
    const s = new THREE.Shape();
    s.moveTo(R[0].x, R[0].y);
    if (smooth) { s.splineThru(R.slice(1)); s.splineThru(L.slice(1)); }
    else { R.slice(1).concat(L.slice(1)).forEach((p) => s.lineTo(p.x, p.y)); }
    const m = mesh(extrude(s, height, bevel), mat);
    m.position.y = y0 + bevel;
    return m;
  };
  const closed = (pts, height, mat, y0, bevel = 0.025) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
    s.closePath();
    const m = mesh(extrude(s, height, bevel), mat);
    m.position.y = y0 + bevel;
    return m;
  };

  /* ---------- ground + pit box markings ---------- */
  const noise = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26000; i++) {
      const v = 90 + Math.random() * 90 | 0;
      x.fillStyle = `rgb(${v},${v},${v})`;
      x.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const ground = mesh(new THREE.PlaneGeometry(90, 90), standard(0x26262b, { map: noise, bumpMap: noise, bumpScale: 0.4, roughness: 1, metalness: 0, envMapIntensity: 0.05 }), false, true);
  ground.rotation.x = -PI / 2;
  scene.add(ground);

  const paint = (w, d, mat, x, z) => { const m = mesh(new THREE.PlaneGeometry(w, d), mat, false, true); m.rotation.x = -PI / 2; m.position.set(x, 0.004, z); scene.add(m); };
  [-1, 1].forEach((s) => {
    paint(0.1, 5.9, M.boxLine, s * 1.98, -0.2);          // box sides
    paint(0.55, 0.1, M.boxLine, s * 1.75, -3.15);        // top corners
    paint(0.55, 0.1, M.boxLine, s * 1.75, 2.75);         // bottom corners
    paint(0.6, 0.07, M.line, s * 2.33, 0.1);          // white side ticks
    for (let z = -40; z < 40; z += 2.4) paint(0.07, 1.3, M.lane, s * 3.7, z); // lane dashes
  });
  paint(0.7, 0.07, M.line, 0, -3.45);                 // front stop T
  paint(0.07, 0.4, M.line, 0, -3.25);
  paint(0.12, 80, M.lane, -5.6, 0);                    // pit wall edge

  /* ---------- the car ---------- */
  const car = new THREE.Group();
  scene.add(car);

  car.add(slab([[0, 1.35], [0.5, 1.3], [0.8, 1.05], [0.86, 0], [0.82, -1.2], [0.6, -1.95], [0.3, -2.3], [0, -2.38]], 0.02, M.carbon, 0.05, 0.01));
  car.add(slab([[0, 2.92], [0.06, 2.86], [0.1, 2.45], [0.15, 1.9], [0.23, 1.25], [0.3, 0.7], [0.32, 0], [0.3, -0.7], [0.25, -1.4], [0.18, -2.0], [0.12, -2.45], [0, -2.52]], 0.24, M.paint, 0.1));
  car.add(slab([[0, 0.74], [0.17, 0.64], [0.2, 0.32], [0.16, 0.0], [0, -0.06]], 0.005, M.cockpit, 0.39, 0));
  car.add(slab([[0, -0.04], [0.24, -0.14], [0.27, -0.6], [0.2, -1.3], [0.12, -1.9], [0.06, -2.3], [0, -2.4]], 0.26, M.gold, 0.35));
  car.add(box(0.025, 0.2, 1.2, M.gold, 0, 0.78, 1.2));                         // shark fin
  // gold nose tip carrying the number
  car.add(slab([[0, 2.935], [0.066, 2.87], [0.104, 2.5], [0.13, 2.18], [0, 2.18]], 0.25, M.gold, 0.098, 0.026, false));
  const decal = (tex, w, d, x, y, z, spin = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, color: 0x9a9a9a, transparent: true, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.set(-PI / 2, 0, spin); m.position.set(x, y, z); m.receiveShadow = true;
    return m;
  };
  car.add(decal(numberTexture('7'), 0.15, 0.19, 0, 0.405, -2.47));
  car.add(decal(textTexture('PIRELLI', { color: '#0b0b0d', weight: 900, spacing: 6 }), 0.2, 0.05, 0, 0.405, -2.27));
  // sponsors: Expensify along both sidepods and across the front wing
  const expensify = textTexture('Expensify');
  const sharkNinja = textTexture('Shark | NINJA');
  [-1, 1].forEach((s) => {
    car.add(decal(expensify, 0.95, 0.24, s * 0.53, 0.373, 0.25, s * PI / 2));
    car.add(decal(expensify, 0.38, 0.095, s * 0.66, 0.125, -2.42));
    car.add(decal(sharkNinja, 0.28, 0.07, s * 0.27, 0.125, -2.47));
  });
  [-1, 1].forEach((s) => {
    const pod = closed([[0.3, 0.55], [0.55, 0.5], [0.7, 0.3], [0.73, -0.1], [0.68, -0.7], [0.55, -1.2], [0.38, -1.6], [0.3, -1.7]], 0.22, M.paint, 0.1);
    pod.scale.x = s;
    car.add(pod);
    car.add(box(0.34, 0.1, 0.05, M.cockpit, s * 0.52, 0.27, -0.5));  // sidepod inlet
    const stripe = rod([s * 0.7, 0.2, -0.2], [s * 0.36, 0.2, 1.62], 0.018, M.gold); // gold sidepod sweep
    car.add(stripe);
    car.add(box(0.12, 0.05, 0.08, M.gold, s * 0.42, 0.48, -0.62));  // gold mirrors
  });
  // airbox / roll hoop + intake
  const airbox = mesh(new RoundedBoxGeometry(0.28, 0.32, 0.46, 3, 0.07), M.gold);
  airbox.position.set(0, 0.74, 0.22); car.add(airbox);
  car.add(box(0.16, 0.1, 0.04, M.cockpit, 0, 0.82, -0.01));
  // halo + helmet
  const haloGeo = new THREE.TorusGeometry(0.24, 0.028, 10, 48, PI * 1.3);
  haloGeo.rotateZ(-PI * 0.15); haloGeo.rotateX(-PI / 2);
  const halo = mesh(haloGeo, M.carbon); halo.position.set(0, 0.6, -0.32); car.add(halo);
  car.add(rod([0, 0.38, -0.64], [0, 0.6, -0.55], 0.025, M.carbon));
  const helmet = mesh(new THREE.SphereGeometry(0.12, 28, 20), physical(0xd5e4da, { metalness: 0.1 })); helmet.position.set(0, 0.5, -0.24); car.add(helmet);
  // front wing
  car.add(slab([[0, 2.64], [0.45, 2.6], [0.82, 2.52], [0.97, 2.42], [0.97, 2.2], [0.6, 2.25], [0.25, 2.33], [0, 2.36]], 0.03, M.carbon, 0.07, 0.01, false));
  car.add(slab([[0, 2.36], [0.5, 2.28], [0.96, 2.17], [0.96, 2.1], [0.5, 2.2], [0, 2.27]], 0.02, M.silver, 0.12, 0.008, false));
  [-1, 1].forEach((s) => car.add(box(0.03, 0.16, 0.48, M.carbon, s * 0.98, 0.15, -2.33)));
  // rear wing, beam wing, rain light
  car.add(box(1.0, 0.04, 0.28, M.carbon, 0, 0.92, 2.5));
  car.add(box(1.0, 0.03, 0.15, M.carbon, 0, 0.99, 2.66));
  car.add(decal(wordmarkTexture(), 0.86, 0.43, 0, 0.943, 2.5));               // APXGP on the rear wing
  [-1, 1].forEach((s) => car.add(box(0.03, 0.62, 0.62, M.carbon, s * 0.51, 0.66, 2.55)));
  car.add(box(0.05, 0.5, 0.1, M.carbon, 0, 0.62, 2.42));
  car.add(box(0.7, 0.03, 0.14, M.carbon, 0, 0.36, 2.55));
  const rain = mesh(new THREE.BoxGeometry(0.12, 0.06, 0.03), M.rain, false);
  rain.position.set(0, 0.28, 2.6); car.add(rain);
  // soft contact shadow
  const blob = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -PI / 2; m.position.y = 0.006;
    return m;
  })();
  car.add(blob);

  /* ---------- wheels ---------- */
  const SLOTS = [
    { id: 'FL', s: -1, x: 0.82, z: -1.75, w: 0.32, d: 0 },
    { id: 'FR', s: 1, x: 0.82, z: -1.75, w: 0.32, d: 0.05 },
    { id: 'RL', s: -1, x: 0.8, z: 1.65, w: 0.4, d: 0.08 },
    { id: 'RR', s: 1, x: 0.8, z: 1.65, w: 0.4, d: 0.03 },
  ];
  const WHEEL_Y = 0.36;
  const makeWheel = (w, compound) => {
    const g = new THREE.Group(), spin = new THREE.Group();
    g.add(spin);
    const tyre = mesh(new THREE.CylinderGeometry(0.36, 0.36, w, 48, 1), M.rubber); tyre.rotation.z = PI / 2; spin.add(tyre);
    const rimM = mesh(new THREE.CylinderGeometry(0.25, 0.25, w + 0.012, 32), M.rim); rimM.rotation.z = PI / 2; spin.add(rimM);
    const nut = mesh(new THREE.CylinderGeometry(0.055, 0.055, w + 0.05, 12), M.red); nut.rotation.z = PI / 2; spin.add(nut);
    [-1, 1].forEach((s) => {
      const ring = mesh(new THREE.TorusGeometry(0.305, 0.014, 8, 64), compound, false);
      ring.rotation.y = PI / 2; ring.position.x = s * (w / 2 + 0.004); spin.add(ring);
      for (let i = 0; i < 5; i++) {               // spokes, so the roll reads
        const sp = box(0.01, 0.17, 0.035, M.tool, s * (w / 2 + 0.008), 0, 0);
        sp.geometry.translate(0, 0.13, 0);
        sp.rotation.x = (i / 5) * PI * 2; spin.add(sp);
      }
    });
    return { g, spin };
  };
  const flashes = {};
  SLOTS.forEach((slot) => {
    const { g, spin } = makeWheel(slot.w, M.soft);
    g.position.set(slot.s * slot.x, WHEEL_Y, slot.z);
    car.add(g);
    slot.old = { g, spin };
    const n = makeWheel(slot.w, M.hard);
    n.g.position.set(slot.s * (slot.x + 1.35), WHEEL_Y, slot.z + 0.45);
    n.g.rotation.y = slot.s * 0.35;
    scene.add(n.g);
    slot.fresh = n;
    // gun flash
    const f = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.26, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.7, 0.9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    f.rotation.x = -PI / 2;
    f.position.set(slot.s * (slot.x + slot.w / 2 + 0.06), 0.74, slot.z);
    scene.add(f);
    flashes[slot.id] = f;
    // suspension
    const ax = slot.s * (slot.x - 0.14), cx = slot.s * 0.2;
    car.add(rod([cx, 0.32, slot.z - 0.2], [ax, 0.42, slot.z - 0.02], 0.014, M.carbon));
    car.add(rod([cx, 0.18, slot.z + 0.2], [ax, 0.24, slot.z + 0.02], 0.014, M.carbon));
  });

  /* ---------- crew: rigged, motion-captured humans ---------- */
  const kit = await kitPromise;
  const crew = [];
  const makeGun = () => {
    const g = new THREE.Group();
    g.add(box(0.1, 0.13, 0.26, M.tool, 0, 0, -0.06));
    const socket = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 12), M.red);
    socket.rotation.x = PI / 2; socket.position.z = -0.24; g.add(socket);
    g.add(box(0.04, 0.12, 0.05, M.carbon, 0, -0.1, 0.02));
    return g;
  };
  const makeCrew = (tool, ready = {}) => {
    const c = new CrewMember(kit);
    c.g = c.root;
    Object.assign(c.pose, ready);
    if (tool === 'gun') c.hold(makeGun());
    if (tool === 'jack') {
      c.root.add(rod([0, 0.98, -0.32], [0, 0.22, -1.38], 0.035, M.tool));
      c.root.add(box(0.5, 0.05, 0.05, M.gold, 0, 0.98, -0.32));
      c.root.add(box(0.36, 0.06, 0.12, M.tool, 0, 0.2, -1.4));
    }
    scene.add(c.root);
    crew.push(c);
    return c;
  };
  const place = (c, x, z) => { c.root.position.set(x, 0, z); c.prev.copy(c.root.position); };

  SLOTS.forEach((slot) => {
    const { s, x, z } = slot;
    slot.gun = makeCrew('gun', { squat: 0.25, reach: 0.5 }); place(slot.gun, s * (x + 1.6), z);
    slot.off = makeCrew(null, { squat: 0.3, reach: 0.3 }); place(slot.off, s * (x + 1.5), z - 0.95);
    slot.on = makeCrew(null, { squat: 0.2, reach: 0.85 }); place(slot.on, s * (x + 1.95), z + 0.6);
    [slot.gun, slot.off, slot.on].forEach((c) => c.face.set(s * x, z));
  });
  const stab = [-1, 1].map((s) => { const c = makeCrew(null, { squat: 0.2 }); place(c, s * 2.25, 0.1); c.face.set(0, 0.1); return c; });
  const jackF = makeCrew('jack', { reach: 0.6, lean: 0.1 }); place(jackF, 0, -4.5); jackF.face.set(0, 0);
  const jackR = makeCrew('jack', { reach: 0.6, lean: 0.1 }); place(jackR, 1.5, 4.5); jackR.face.set(0, 0);
  crew.forEach((c) => { c.yaw = Math.atan2(-(c.face.x - c.root.position.x), -(c.face.y - c.root.position.z)); });

  /* ---------- per-frame ---------- */
  const fit = () => {
    const aspect = innerWidth / innerHeight;
    camera.aspect = aspect;
    const needV = Math.max(10.8, 8.2 / aspect);
    cam.base = needV / (2 * Math.tan((camera.fov * PI) / 360));
    camera.updateProjectionMatrix();
  };
  fit();

  const timerEl = document.querySelector('[data-pit]');
  const timeWrap = timerEl.parentElement;
  const wheelEls = Object.fromEntries([...document.querySelectorAll('[data-w]')].map((el) => [el.dataset.w, el]));
  const STOP = 1.3, STATIONARY = 1.98;
  let prevZ = 0, alive = true;
  const clock = new THREE.Clock();
  const tl = gsap.timeline({ paused: true });

  const frame = () => {
    if (!alive) return;
    const t = tl.time();
    // wheels attached to the car roll with it
    const dz = car.position.z - prevZ; prevZ = car.position.z;
    car.children.forEach((ch) => { if (ch.userData.spin) ch.userData.spin.rotation.x += dz / 0.36; });
    // pit limiter: rain light flashes until the car is gone
    rain.visible = Math.floor(t * 8) % 2 === 0;
    // crew: locomotion blend + procedural pose on the skeleton
    const dt = Math.min(clock.getDelta(), 1 / 20);
    crew.forEach((c) => c.update(dt));
    // timer
    const st = Math.min(Math.max(t - STOP, 0), STATIONARY);
    timerEl.textContent = st.toFixed(2);
    // camera
    const h = cam.base * cam.dist;
    camera.position.set(Math.sin(cam.yaw) * Math.sin(cam.tilt) * h, Math.cos(cam.tilt) * h, Math.cos(cam.yaw) * Math.sin(cam.tilt) * h + cam.look);
    if (cam.shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * cam.shake, 0, (Math.random() - 0.5) * cam.shake));
    camera.lookAt(0, 0, cam.look);
    composer.render();
  };
  SLOTS.forEach((s) => { s.old.g.userData.spin = s.old.spin; s.fresh.g.userData.spin = s.fresh.spin; });

  /* ---------- the choreography (seconds) ---------- */
  const E = 'power3.out';
  const go = (c, x, z, at, dur = 0.25, ease = E) => tl.to(c.g.position, { x, z, duration: dur, ease }, at);
  const pose = (c, vals, at, dur = 0.2) => tl.to(c.pose, { ...vals, duration: dur, ease: 'power2.out' }, at);
  const gunFlash = (id, at) => {
    const f = flashes[id];
    tl.fromTo(f.material, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none' }, at)
      .fromTo(f.scale, { x: 0.5, y: 0.5 }, { x: 1.5, y: 1.5, duration: 0.3, ease: 'power2.out' }, at)
      .to(f.material, { opacity: 0, duration: 0.25, ease: 'power2.in' }, at + 0.06)
      .to(f.rotation, { z: '+=6', duration: 0.3, ease: 'none' }, at);
  };

  // camera: slow push in, slight orbit
  tl.fromTo(cam, { tilt: 0.16, dist: 1.25, yaw: -0.1 }, { tilt: 0.52, dist: 1, yaw: 0.06, duration: 3.4, ease: 'power2.inOut' }, 0);

  // 0 → 1.3: car arrives
  tl.fromTo(car.position, { z: 12 }, { z: 0, duration: 1.3, ease: 'power3.out' }, 0);

  // 1.05 → 1.4: crew step in
  SLOTS.forEach((slot) => {
    const { s, x, z } = slot;
    go(slot.gun, s * (x + 0.7), z, 1.05);
    pose(slot.gun, { kneel: 1, squat: 0, reach: 1 }, 1.2, 0.18);
    go(slot.off, s * (x + 0.78), z - 0.62, 1.08);
    pose(slot.off, { squat: 0.75, reach: 1 }, 1.24);
    go(slot.on, s * (x + 1.5), z + 0.55, 1.1);
    pose(slot.on, { squat: 0.45, reach: 1 }, 1.2);
    tl.to(slot.fresh.g.position, { x: s * (x + 0.95), duration: 0.25, ease: E }, 1.1);
  });
  stab.forEach((c, i) => { go(c, (i ? 1 : -1) * 1.3, 0.1, 1.1); pose(c, { squat: 0.55, reach: 1 }, 1.28); });
  go(jackF, 0, -3.88, 1.1, 0.22);
  go(jackR, 0, 3.6, 1.16, 0.25);
  [jackF, jackR].forEach((c) => { pose(c, { reach: 0.9, lean: 0.3 }, 1.26, 0.12); pose(c, { lean: 0.6, squat: 0.25 }, 1.38, 0.12); });
  tl.call(() => jackR.face.set(0, 0), null, 1.16);

  // 1.38: jacks up
  tl.to(car.position, { y: 0.06, duration: 0.12, ease: 'power2.out' }, 1.38);

  SLOTS.forEach((slot) => {
    const { id, s, x, z, d } = slot;
    const T = (v) => v + d;
    // wheel off
    gunFlash(id, T(1.5));
    tl.call(() => { scene.attach(slot.old.g); wheelEls[id].classList.add('is-off'); }, null, T(1.66));
    tl.to(slot.old.g.position, { x: s * (x + 0.9), y: WHEEL_Y, z: z - 0.42, duration: 0.32, ease: 'power2.inOut' }, T(1.66));
    go(slot.off, s * (x + 1.42), z - 0.78, T(1.66), 0.32, 'power2.inOut');
    go(slot.gun, s * (x + 1.0), z - 0.3, T(1.62), 0.2);
    pose(slot.gun, { kneel: 0.45 }, T(1.62), 0.15);
    pose(slot.off, { squat: 0.45 }, T(1.66), 0.25);
    // carry the old tyre away
    tl.to(slot.old.g.position, { x: s * (x + 2.7), z: z - 1.3, duration: 0.75, ease: 'power1.inOut' }, T(2.05));
    tl.to(slot.old.g.rotation, { y: s * 0.6, duration: 0.75 }, T(2.05));
    go(slot.off, s * (x + 3.25), z - 1.65, T(2.05), 0.75, 'power1.inOut');
    pose(slot.off, { squat: 0.1, reach: 0.8 }, T(2.05), 0.3);
    // wheel on
    tl.to(slot.fresh.g.position, { x: s * x, y: WHEEL_Y + 0.06, z, duration: 0.42, ease: 'power3.inOut' }, T(2.12));
    tl.to(slot.fresh.g.rotation, { y: 0, duration: 0.42, ease: 'power3.inOut' }, T(2.12));
    go(slot.on, s * (x + 0.62), z + 0.42, T(2.12), 0.42, 'power3.inOut');
    pose(slot.on, { squat: 0.7 }, T(2.12), 0.3);
    pose(slot.on, { reach: 0.35, squat: 0.5 }, T(2.6), 0.2);
    tl.call(() => car.attach(slot.fresh.g), null, T(2.55));
    // gun back on
    go(slot.gun, s * (x + 0.7), z, T(2.5), 0.15);
    pose(slot.gun, { kneel: 1 }, T(2.5), 0.15);
    gunFlash(id, T(2.68));
    tl.call(() => wheelEls[id].classList.add('is-done'), null, T(2.85));
    // step back
    pose(slot.gun, { kneel: 0, reach: 0.3 }, 3.0, 0.2);
    go(slot.gun, s * (x + 1.7), z, 3.04, 0.3);
    pose(slot.on, { squat: 0, reach: 0 }, 3.02, 0.25);
    go(slot.on, s * (x + 1.9), z + 0.75, 3.04, 0.3);
  });
  stab.forEach((c, i) => { pose(c, { squat: 0, reach: 0 }, 2.98, 0.2); go(c, (i ? 1 : -1) * 2.3, 0.1, 3.0, 0.3); });

  // 3.05: jacks down, front jack swings clear
  tl.to(car.position, { y: 0, duration: 0.1, ease: 'power2.in' }, 3.05);
  [jackF, jackR].forEach((c) => pose(c, { lean: 0.1, squat: 0 }, 3.04, 0.12));
  go(jackF, -1.7, -4.4, 3.08, 0.28, 'power2.inOut');
  tl.call(() => jackF.face.set(0, -6), null, 3.08);
  go(jackR, 0.9, 4.6, 3.1, 0.3);

  // 3.28: release — timer freezes, car launches
  tl.call(() => timeWrap.classList.add('is-final'), null, STOP + STATIONARY);
  tl.to(car.position, { z: -22, duration: 1.15, ease: 'power2.in' }, STOP + STATIONARY);
  tl.to(cam, { look: -1.4, duration: 1.2, ease: 'power2.inOut' }, STOP + STATIONARY);
  tl.fromTo(cam, { shake: 0.05 }, { shake: 0, duration: 0.8, ease: 'power2.out' }, STOP + STATIONARY + 0.1);
  tl.to(bloom, { strength: 0.75, duration: 0.6, ease: 'power2.out' }, STOP + STATIONARY);
  tl.call(done, null, STOP + STATIONARY + 0.75);
  tl.to({}, { duration: 1.5 }, STOP + STATIONARY + 0.75); // keep rendering under the wipe

  /* ---------- lifecycle ---------- */
  const onResize = () => {
    fit();
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
  };
  addEventListener('resize', onResize);
  gsap.ticker.add(frame);

  // compile shaders before the first visible frame, then fade the canvas in and roll
  renderer.compile(scene, camera);
  frame();
  requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    if (location.search.includes('pitdebug')) { window.__pitTL = tl; window.__pitCam = cam; } // dev: scrub the stop from the console
    else tl.play(0);
  });

  addEventListener('pitstop:done', () => tl.timeScale(1.6), { once: true });
  addEventListener('loader:hidden', () => {
    alive = false;
    gsap.ticker.remove(frame);
    removeEventListener('resize', onResize);
    tl.kill();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    noise.dispose(); rt.dispose(); composer.dispose(); pmrem.dispose(); renderer.dispose();
  }, { once: true });
}
