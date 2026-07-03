/* RubexPay About — WebGL graphics:
   (1) "How We Operate" cinematic transaction-flow pipeline (bloom-lit glass nodes + data conduits),
   (2) 3D framework-pillar icons (glass, scissor multi-view).
   Uses the page three importmap. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
const COARSE = matchMedia('(pointer:coarse)').matches;
const RED = 0xff2942, RED2 = 0xff5563, REDD = 0xd80c24, BG = 0x070709;

/* soft radial sprite for embers / cores (white so we can tint per-material) */
function sprite(){
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,120,130,0.65)');
  g.addColorStop(1, 'rgba(255,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ============================ 1 · OPERATE PIPELINE ============================ */
(function(){
  const canvas = document.getElementById('ab-op-canvas');
  if(!canvas) return;
  /* the GPU can refuse a context during a busy or hidden page load — retry briefly instead of dying silently */
  let bootTries = 0;
  (function boot(){
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' }); }
  catch(e){ renderer = null; }
  if(!renderer || !renderer.getContext() || renderer.getContext().isContextLost()){
    if(++bootTries < 15) setTimeout(boot, 350);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, 1));
  renderer.setClearColor(0x000000, 1); /* true black: the scene sits on the page, no gray panel */
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.03);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; pmrem.dispose();

  scene.add(new THREE.AmbientLight(0xff3a4a, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(2.5, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(0xff2942, 14, 46); rim.position.set(0, 1.4, 8); scene.add(rim);
  const under = new THREE.PointLight(0xd80c24, 6, 30); under.position.set(0, -3.4, 4); scene.add(under);
  const fill = new THREE.DirectionalLight(0xff8088, 0.4); fill.position.set(-4, 2, 3); scene.add(fill);

  const camera = new THREE.PerspectiveCamera(40, 2.4, 0.1, 120);
  const CAM = new THREE.Vector3(0, 1.7, 13.5);
  let lookY = 1.15;   // tall full-bleed desktop canvas drops nodes below the heading; short mobile band centers them
  camera.position.copy(CAM); camera.lookAt(0, lookY, 0);

  const SPR = sprite();

  /* --- five pipeline nodes --- */
  const X = [-5.6, -2.8, 0, 2.8, 5.6];
  function shellMat(){
    // transmission glass is heavy on mobile GPUs — use a cheaper emissive material on coarse pointers
    if(COARSE) return new THREE.MeshStandardMaterial({ color:0x320910, metalness:0.55, roughness:0.22, emissive:RED, emissiveIntensity:0.28, transparent:true, opacity:0.92 });
    return new THREE.MeshPhysicalMaterial({
      color:0x320910, metalness:0.2, roughness:0.16,
      transmission:0.82, thickness:1.6, ior:1.42,
      emissive:RED, emissiveIntensity:0.28,
      clearcoat:1, clearcoatRoughness:0.18, envMapIntensity:1.3, transparent:true
    });
  }
  const edgeMat = () => new THREE.LineBasicMaterial({ color:RED2 });
  function buildNode(i){
    const g = new THREE.Group(); g.position.set(X[i], 0, 0);
    const spin = new THREE.Group(); g.add(spin);
    const mats = [];
    function part(geo, px, py, pz, rx, ry, rz){
      const m = new THREE.Mesh(geo, shellMat());
      m.position.set(px||0, py||0, pz||0); m.rotation.set(rx||0, ry||0, rz||0);
      spin.add(m); mats.push(m.material);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat());
      e.position.copy(m.position); e.rotation.copy(m.rotation); spin.add(e);
      return m;
    }
    let gate=null, flat=false;
    if(i===0){            // Merchants & Platforms — a 2x2 grid of platform terminals + a connecting hub
      [[-0.46,0.46],[0.46,0.46],[-0.46,-0.46],[0.46,-0.46]].forEach(p=> part(new THREE.BoxGeometry(0.58,0.58,0.16), p[0],p[1],0.04));
      part(new THREE.OctahedronGeometry(0.3,0), 0,0,0.18);
    } else if(i===1){     // Rubex Gateway — an ARCHWAY / PORTAL with an entity passing through it
      flat=true;
      part(new THREE.BoxGeometry(0.16,1.5,0.36), -0.62,0,0);     // left pillar
      part(new THREE.BoxGeometry(0.16,1.5,0.36),  0.62,0,0);     // right pillar
      part(new THREE.BoxGeometry(1.52,0.2,0.36), 0,0.8,0);       // top lintel
      part(new THREE.BoxGeometry(1.4,0.12,0.32), 0,-0.8,0);      // base sill
      gate = part(new THREE.BoxGeometry(0.42,0.42,0.42), 0,0,0); // the entity travelling through (animated on z)
    } else if(i===2){     // Rubex Shield — a heraldic CREST shield protecting a core gem
      flat=true;
      const sh=new THREE.Shape();
      sh.moveTo(-0.66,0.82); sh.lineTo(0.66,0.82); sh.lineTo(0.66,0.04);
      sh.quadraticCurveTo(0.66,-0.62, 0,-1.0);
      sh.quadraticCurveTo(-0.66,-0.62, -0.66,0.04); sh.closePath();
      const sg=new THREE.ExtrudeGeometry(sh,{depth:0.2,bevelEnabled:false}); sg.center();
      part(sg, 0,0,0);
      part(new THREE.OctahedronGeometry(0.3,0), 0,0.02,0.18);    // the protected core gem
    } else if(i===3){     // Rubex Core — the brand cube with a glowing inner cube
      part(new THREE.BoxGeometry(1.18,1.18,1.18), 0,0,0);
      part(new THREE.BoxGeometry(0.52,0.52,0.52), 0,0,0);
    } else {              // Banks & Settlement — an institutional colonnade (faces camera)
      flat=true;
      [-0.66,-0.22,0.22,0.66].forEach(x=> part(new THREE.CylinderGeometry(0.12,0.12,1.2,16), x,0,0));
      part(new THREE.BoxGeometry(1.9,0.22,0.55), 0,0.72,0);
      part(new THREE.BoxGeometry(1.9,0.2,0.55), 0,-0.72,0);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(i===3?0.3:0.2,20,20), new THREE.MeshBasicMaterial({ color:0xffd2d4 })); g.add(core);
    core.visible = false; /* the orb is the travelling packet only; it never sits inside a visual */
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:SPR, color:RED, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, depthWrite:false })); halo.scale.setScalar(1.4); g.add(halo);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.4,8,8), new THREE.MeshBasicMaterial({ visible:false })); g.add(hit); // raycast target
    // pulse ring — emanates when a data packet passes through this node
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.92,1.05,48), new THREE.MeshBasicMaterial({ color:RED2, transparent:true, opacity:0, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false }));
    ring.position.z = 0.12; g.add(ring);
    g.userData = { spin, mats, core, halo, hit, ring, baseEmis:0.34, i, hot:0, flat, gate, flare:0 };
    scene.add(g);
    return g;
  }
  const nodes = X.map((x,i)=>buildNode(i));

  /* --- one continuous flow rail (the "way" that links every stage) + traveling data packets --- */
  const RAIL_A = X[0] - 0.9, RAIL_B = X[X.length-1] + 0.9;
  const railGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(RAIL_A,0,0), new THREE.Vector3(RAIL_B,0,0)]);
  scene.add(new THREE.Line(railGeo1, new THREE.LineBasicMaterial({ color:REDD, transparent:true, opacity:0.62 })));
  // faint parallel under-track for a subtle rail/depth read
  const railGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(RAIL_A,-0.14,0), new THREE.Vector3(RAIL_B,-0.14,0)]);
  scene.add(new THREE.Line(railGeo2, new THREE.LineBasicMaterial({ color:0x5a0c14, transparent:true, opacity:0.38 })));
  const packets = [];
  {
    const a = new THREE.Vector3(RAIL_A, 0, 0), b = new THREE.Vector3(RAIL_B, 0, 0), N = 1; // ONE data packet at a time, journeying through every stage
    for(let k=0;k<N;k++){
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color:0xffe2e4, transparent:true }));
      scene.add(p);
      const tr = new THREE.Sprite(new THREE.SpriteMaterial({ map:SPR, color:RED2, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false }));
      tr.scale.setScalar(0.92); scene.add(tr);
      // comet trail: a few ghost sprites lagging behind the packet (kept faint)
      const trail = [];
      for(let j=0;j<4;j++){ const ts = new THREE.Sprite(new THREE.SpriteMaterial({ map:SPR, color:RED2, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false })); ts.scale.setScalar(0.66 - j*0.12); scene.add(ts); trail.push(ts); }
      packets.push({ a, b, mesh:p, tr, trail, off:k/N });
    }
  }

  /* the pipeline fills the section, end to end: node spread derived from the camera's visible width */
  applySpread = function(){
    const halfW = Math.tan(0.349) * CAM.z * camera.aspect;   // fov 40deg half-angle
    const S = Math.max(5.6, halfW * 0.84 - 1.0);             // edge margin keeps the end nodes whole
    for(let i = 0; i < X.length; i++){ X[i] = -S + i * (S / 2); nodes[i].position.x = X[i]; }
    const RA = X[0] - 0.9, RB = X[X.length - 1] + 0.9;
    railGeo1.setFromPoints([new THREE.Vector3(RA, 0, 0), new THREE.Vector3(RB, 0, 0)]);
    railGeo2.setFromPoints([new THREE.Vector3(RA, -0.14, 0), new THREE.Vector3(RB, -0.14, 0)]);
    packets.forEach(pk => { pk.a.x = RA; pk.b.x = RB; });
  };
  /* the initial size() below runs after this assignment and applies the real-dimension spread */

  /* --- ambient embers --- */
  let embers;
  {
    const COUNT = COARSE ? 14 : 26;
    const pos = new Float32Array(COUNT*3), spd = new Float32Array(COUNT);
    for(let i=0;i<COUNT;i++){ pos[i*3]=(Math.random()-0.5)*16; pos[i*3+1]=(Math.random()-0.5)*7; pos[i*3+2]=(Math.random()-0.5)*8 - 1; spd[i]=0.15+Math.random()*0.5; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
    embers = new THREE.Points(g, new THREE.PointsMaterial({ map:SPR, color:RED, size:0.26, transparent:true, opacity:0.32, blending:THREE.AdditiveBlending, depthWrite:false }));
    embers.userData = { spd, pos }; scene.add(embers);
  }

  /* --- bloom composer (opaque) --- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // restrained bloom — only the brightest cores/edges glow, glass facets stay crisp
  const bloom = new UnrealBloomPass(new THREE.Vector2(1,1), 0.62, 0.5, 0.28);
  composer.addPass(bloom);

  let cvW = 0;   // cached canvas width — alignLabels ran getBoundingClientRect every frame (a layout read)
  var applySpread;          // assigned earlier in source once nodes/rail/packets exist (var hoists, no re-init)
  function size(){
    const r = canvas.getBoundingClientRect(); if(r.width<2) return;
    cvW = r.width;
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, 1));   // re-read DPR (zoom / monitor move)
    /* bloom output is soft by nature — cap the render resolution and let CSS upscale, so a
       2000px+ window doesn't pay 10+ full-res passes per frame while the section is visible */
    const rs = Math.min(1, 1300 / r.width);
    renderer.setSize(r.width*rs, r.height*rs, false);
    composer.setSize(r.width*rs, r.height*rs);
    camera.aspect = r.width/r.height;
    // pull camera back on narrow (tall) viewports so all five nodes stay in frame
    CAM.z = camera.aspect < 1.5 ? 20 : (camera.aspect < 2.0 ? 16.5 : 14.5);
    // raise nodes into the middle band (below the heading, above the labels) so the pipeline fills the space
    lookY = (r.height > innerHeight*0.55) ? 1.3 : 0.35;
    camera.updateProjectionMatrix();
    if(applySpread) applySpread();
  }
  size(); window.addEventListener('resize', size, { passive:true });

  /* --- hover-to-highlight --- */
  const labels = [].slice.call(document.querySelectorAll('.ab-op-lab'));
  /* tie each HTML label to its 3D node: project the node's X to screen so the label sits exactly under its visual */
  let lastDesktop = null;
  const lastLeft = [], lastLead = [], relTops = [];
  let leadDirty = true, chCache = 0;
  window.addEventListener('resize', function(){ leadDirty = true; }, { passive:true });
  function alignLabels(){
    if(cvW < 2) return;
    const desktop = (window.innerWidth > 1024);
    if(desktop !== lastDesktop){
      lastDesktop = desktop;
      if(sec) sec.classList.toggle('lab-abs', desktop);
      if(!desktop) labels.forEach(function(l){ l.style.left = ''; l.style.removeProperty('--leadH'); });
      leadDirty = true;
    }
    if(!desktop) return;
    camera.updateMatrixWorld();
    const v = new THREE.Vector3();
    /* measure once per layout change: label tops relative to the canvas (scroll-invariant) */
    if(leadDirty){
      const cr = canvas.getBoundingClientRect();
      if(cr.height > 2){
        chCache = cr.height;
        for(let i=0;i<labels.length;i++) relTops[i] = labels[i].getBoundingClientRect().top - cr.top;
        lastLead.length = 0;
        leadDirty = false;
      }
    }
    for(let i=0;i<labels.length && i<X.length;i++){
      v.set(X[i], 0, 0).project(camera);
      const left = (v.x*0.5 + 0.5)*100;
      if(lastLeft[i] === undefined || Math.abs(left - lastLeft[i]) >= 0.05){   // skip sub-pixel style writes
        lastLeft[i] = left;
        labels[i].style.left = left.toFixed(2) + '%';
      }
      /* the leader line runs from the label ALL THE WAY UP to the base of its visual */
      if(chCache > 2){
        v.set(X[i], -1.45, 0).project(camera);
        const lead = relTops[i] - (0.5 - v.y*0.5)*chCache;
        if(lead > 8 && (lastLead[i] === undefined || Math.abs(lead - lastLead[i]) > 0.5)){
          lastLead[i] = lead;
          labels[i].style.setProperty('--leadH', lead.toFixed(1) + 'px');
        }
      }
    }
  }
  const shells = nodes.map(n=>n.userData.hit);   // hoisted raycast targets: no per-event allocation
  let hover=-1;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  if(!COARSE){
    canvas.addEventListener('pointermove', e=>{
      const r = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left)/r.width)*2 - 1; ndc.y = -(((e.clientY - r.top)/r.height)*2 - 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(shells, false);
      const idx = hit.length ? shells.indexOf(hit[0].object) : -1;
      if(idx!==hover){ hover = idx; labels.forEach((l,i)=> l.classList.toggle('is-hot', i===hover)); }
    }, { passive:true });
    canvas.addEventListener('pointerleave', ()=>{ hover=-1; labels.forEach(l=>l.classList.remove('is-hot')); }, { passive:true });
  }

  let active = true;
  const sec = document.getElementById('operate');
  if(sec && 'IntersectionObserver' in window) new IntersectionObserver(es=>{ active = es[0].isIntersecting; }, { threshold:0 }).observe(sec);

  /* place everything once for the static / first frame */
  function place(t){
    nodes.forEach((n,i)=>{
      const d = n.userData;
      n.position.y = Math.sin(t*0.9 + i*1.3)*0.12;
      // shapes that must stay readable (gateway/shield/banks) face the camera and only sway; the rest spin
      if(d.flat){ d.spin.rotation.y = Math.sin(t*0.5 + i)*0.16; d.spin.rotation.x = Math.sin(t*0.4 + i)*0.04; }
      else { d.spin.rotation.y = t*(0.35 + i*0.05); d.spin.rotation.x = Math.sin(t*0.3 + i)*0.18; }
      const want = (hover===i ? 1 : 0); d.hot += (want - d.hot)*0.12;
      d.spin.scale.setScalar(1 + d.hot*0.12 + Math.sin(t*1.4 + i)*0.03);
      if(d.gate){ d.gate.position.z = (((t*0.42 + 0.5) % 1) * 2 - 1) * 0.95; }  // entity travels through the arch
    });
    packets.forEach(pk=>{
      const p = ((t*0.12) + pk.off) % 1;  // calmer drift through the rail
      const x = pk.a.x + (pk.b.x - pk.a.x)*p;
      pk.mesh.position.set(x, 0, 0); pk.tr.position.set(x, 0, 0);
      /* the orb exists BETWEEN stations only: it fades out as it enters a visual and re-emerges beyond it */
      let nd = 1e9; for(let ni=0; ni<X.length; ni++){ const dd = Math.abs(x - X[ni]); if(dd<nd) nd = dd; }
      const gate = Math.max(0, Math.min(1, (nd - 0.95)/0.35));
      const fade = Math.min(1, Math.sin(p*Math.PI)*1.4) * gate; // soft at the ends, gone at the stations
      pk.mesh.material.opacity = fade*0.85; pk.tr.material.opacity = fade*0.4;
      pk.mesh.visible = pk.tr.visible = fade>0.04;
      if(pk.trail) pk.trail.forEach(function(ts,j){
        const tp = p - (j+1)*0.022;
        if(tp<0){ ts.visible=false; return; }
        const tx = pk.a.x + (pk.b.x - pk.a.x)*tp;
        ts.position.set(tx, 0, 0);
        let tnd = 1e9; for(let ni=0; ni<X.length; ni++){ const dd = Math.abs(tx - X[ni]); if(dd<tnd) tnd = dd; }
        const tf = Math.min(1, Math.sin(tp*Math.PI)*1.4) * (1 - (j+1)/5) * 0.3 * Math.max(0, Math.min(1, (tnd - 0.95)/0.35));
        ts.material.opacity = tf; ts.visible = tf>0.02;
      });
    });
    /* each node LIGHTS UP as a data packet passes through it */
    for(let ni=0; ni<nodes.length; ni++){
      const d = nodes[ni].userData; let near=0;
      for(let pi=0; pi<packets.length; pi++){ const f = 1 - Math.abs(packets[pi].mesh.position.x - X[ni])/0.9; if(f>near) near=f; }
      if(near<0) near=0;
      d.flare += (near*near - d.flare)*0.28;  // ease in/out more gently
      const emis = d.baseEmis + d.hot*0.7 + d.flare*1.2 + Math.sin(t*1.4 + ni)*0.04;
      d.mats.forEach(function(m){ m.emissiveIntensity = emis; });
      d.core.scale.setScalar(1 + d.hot*0.4 + d.flare*0.55 + Math.sin(t*2 + ni)*0.08);
      d.halo.material.opacity = 0.1 + d.hot*0.3 + d.flare*0.42 + Math.sin(t*1.2 + ni)*0.03;
      d.halo.scale.setScalar(1.4 + d.hot*0.6 + d.flare*0.8);
      if(d.ring){ const f = Math.max(d.flare, d.hot*0.7); d.ring.scale.setScalar(1 + f*1.1); d.ring.material.opacity = f*0.3; d.ring.visible = f>0.02; }
    }
    if(embers){
      const a = embers.geometry.attributes.position, sp = embers.userData.spd;
      for(let i=0;i<sp.length;i++){ a.array[i*3+1] += sp[i]*0.012; if(a.array[i*3+1]>3.6){ a.array[i*3+1] = -3.6; a.array[i*3] = (Math.random()-0.5)*16; } }
      a.needsUpdate = true;
    }
    scene.rotation.y = Math.sin(t*0.1)*0.03;
    camera.position.set(CAM.x, CAM.y + Math.sin(t*0.4)*0.18, CAM.z);
    camera.lookAt(0, lookY, 0);
    alignLabels();
  }

  size();
  place(0.6); composer.render();                         // guaranteed first frame
  if(REDUCE) return;                                      // static premium frame, no loop

  const t0 = performance.now();
  (function loop(now){
    requestAnimationFrame(loop);
    if(!active) return;
    const t = (now - t0)/1000;
    place(t);
    composer.render();
  })(performance.now());
  })();
})();

/* ============================ 2 · FRAMEWORK PILLAR ICONS ============================ */
(function(){
  const slots = [].slice.call(document.querySelectorAll('[data-ico]'));
  const canvas = document.getElementById('ab-ico-canvas');
  if(!slots.length || !canvas) return;
  /* same transient-GPU retry as the pipeline scene above */
  let bootTries = 0;
  (function boot(){
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true }); }
  catch(e){ renderer = null; }
  if(!renderer || !renderer.getContext() || renderer.getContext().isContextLost()){
    if(++bootTries < 15) setTimeout(boot, 350);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, COARSE ? 1 : 1)); // small icons — half the framebuffer
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.documentElement.classList.add('has-ab-ico');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture; pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xff3a4a, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.PointLight(0xff2942, 6, 20); rim.position.set(-2, -1, 3); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50); camera.position.set(0, 0, 4);

  const SPR = sprite();
  const glass = () => new THREE.MeshPhysicalMaterial({
    color:0x320910, metalness:0.2, roughness:0.16, transmission:0.8, thickness:1.3, ior:1.42,
    emissive:RED, emissiveIntensity:0.32, clearcoat:1, clearcoatRoughness:0.2, envMapIntensity:1.3, transparent:true
  });
  const line = (geo) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color:RED2 }));
  /* distinct 3D form per icon name (Three primitives) */
  const BUILD = {
    integrity(g){ const a=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.12,16,44),glass()); g.add(a,line(a.geometry)); const b=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.12,16,44),glass()); b.rotation.x=Math.PI/2; g.add(b); const bl=line(b.geometry); bl.rotation.x=Math.PI/2; g.add(bl); },
    precision(g){ const geo=new THREE.OctahedronGeometry(0.95,0); g.add(new THREE.Mesh(geo,glass()),line(geo)); },
    data(g){ [-0.45,0,0.45].forEach((y,i)=>{ const geo=new THREE.BoxGeometry(1.25-i*0.1,0.26,1.25-i*0.1); const m=new THREE.Mesh(geo,glass()); m.position.y=y; g.add(m); const l=line(geo); l.position.y=y; g.add(l); }); },
    security(g){ const geo=new THREE.BoxGeometry(1.12,1.12,1.12); g.add(new THREE.Mesh(geo,glass()),line(geo)); },
    accountability(g){ const b=new THREE.BoxGeometry(1.05,1.05,1.05); g.add(new THREE.Mesh(b,glass()),line(b)); // a record/ledger block, verified with a check
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-0.36,0.04,0.6),new THREE.Vector3(-0.08,-0.3,0.62),new THREE.Vector3(0.46,0.38,0.6)]);
      const cm=new THREE.Mesh(new THREE.TubeGeometry(curve,14,0.075,8,false), new THREE.MeshStandardMaterial({color:0xffd2d4,emissive:RED2,emissiveIntensity:0.85,metalness:0.3,roughness:0.3})); g.add(cm); },
    risk(g){ const o=new THREE.OctahedronGeometry(0.6,0); g.add(new THREE.Mesh(o,glass()),line(o)); // threat locked inside scanning rings — caught early
      const r1=new THREE.Mesh(new THREE.TorusGeometry(0.95,0.045,12,56),glass()); r1.rotation.x=Math.PI/2.3; g.add(r1);
      const r2=new THREE.Mesh(new THREE.TorusGeometry(1.14,0.03,12,56),glass()); r2.rotation.x=Math.PI/2.7; r2.rotation.z=0.5; g.add(r2); },
    trust(g){ [-0.32,0.32].forEach(function(x){ const t=new THREE.TorusGeometry(0.6,0.13,16,46); const m=new THREE.Mesh(t,glass()); m.position.x=x; m.rotation.y=0.55; g.add(m); const l=line(t); l.position.x=x; l.rotation.y=0.55; g.add(l); }); }, // two interlinked rings — partnership
    vision(g){ const s=new THREE.Mesh(new THREE.SphereGeometry(0.6,28,20),glass()); g.add(s,line(new THREE.IcosahedronGeometry(0.6,1))); [[1.15,0],[-0.5,0.7]].forEach(function(rr){ const r=new THREE.Mesh(new THREE.TorusGeometry(1.02,0.045,12,56),glass()); r.rotation.x=rr[0]; r.rotation.y=rr[1]; g.add(r); }); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.17,16,16), new THREE.MeshBasicMaterial({color:0xffd2d4}))); }, // globe + dual orbit + focal core — outlook
    mission(g){ [0.96,0.6].forEach(function(rad){ const t=new THREE.TorusGeometry(rad,0.08,14,50); g.add(new THREE.Mesh(t,glass()),line(t)); }); const o=new THREE.OctahedronGeometry(0.28,0); g.add(new THREE.Mesh(o,glass()),line(o)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.12,14,14), new THREE.MeshBasicMaterial({color:0xffd2d4}))); }, // bullseye target + center hit — purpose
    promise(g){ const geo=new THREE.OctahedronGeometry(0.95,0); g.add(new THREE.Mesh(geo,glass()),line(geo)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2,16,16), new THREE.MeshBasicMaterial({color:0xffd2d4}))); } // brilliant gem + glowing core — commitment
  };
  function icon(name){
    const g = new THREE.Group();
    (BUILD[name]||BUILD.precision)(g);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 18), new THREE.MeshBasicMaterial({ color:0xffd2d4 })); g.add(core);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:SPR, color:RED, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending, depthWrite:false })); halo.scale.setScalar(2.4); g.add(halo);
    g.userData = { core, halo };
    return g;
  }
  /* one group per UNIQUE icon name, reused across slots (only one visible per scissor render) */
  const defs = {};
  slots.forEach(s=>{ const n=s.getAttribute('data-ico'); if(!defs[n]){ const g=icon(n); g.visible=false; scene.add(g); defs[n]=g; } });
  const all = Object.keys(defs).map(k=>defs[k]);

  function size(){ renderer.setPixelRatio(Math.min(devicePixelRatio||1, COARSE ? 1 : 1)); renderer.setSize(window.innerWidth, window.innerHeight, false); }
  size(); window.addEventListener('resize', size, { passive:true });
  let active = true;
  function drawAll(){
    const H = window.innerHeight;
    renderer.setScissorTest(false);
    renderer.clear();                       // full transparent wipe — kills scroll smear + frozen overlay
    renderer.setScissorTest(true);
    const W = window.innerWidth;
    slots.forEach(function(slot){
      const r = slot.getBoundingClientRect();
      if(r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2){ return; }
      renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
      renderer.setScissor(r.left, H - r.bottom, r.width, r.height);
      camera.aspect = r.width/r.height; camera.updateProjectionMatrix();
      const want = defs[slot.getAttribute('data-ico')];
      all.forEach(function(g){ g.visible = (g === want); });
      if(want) renderer.render(scene, camera);
    });
    renderer.setScissorTest(false);
  }
  all.forEach(function(g,i){ g.rotation.y = 0.5 + i*0.3; g.rotation.x = -0.2; });
  function redraw(){ if(active) drawAll(); }
  drawAll();
  window.addEventListener('resize', redraw, { passive:true });

  if(REDUCE){
    // static icons (no animation) but keep them pinned to the cards while scrolling
    window.addEventListener('scroll', redraw, { passive:true });
    return;
  }

  const t0 = performance.now();
  (function loop(now){
    requestAnimationFrame(loop);
    if(document.hidden) return;
    const t = (now - t0)/1000;
    all.forEach(function(g,i){
      g.rotation.y = t*(0.4 + i*0.05); g.rotation.x = -0.2 + Math.sin(t*0.4 + i)*0.12;
      if(g.userData.core) g.userData.core.scale.setScalar(1 + Math.sin(t*1.6 + i)*0.14);
      if(g.userData.halo) g.userData.halo.material.opacity = 0.72 + Math.sin(t*1.3 + i)*0.15;
    });
    drawAll();
  })(performance.now());
  })();
})();
