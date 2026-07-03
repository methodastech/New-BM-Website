/* RubexPay Resources hero — real WebGL NODE VIEW (Three.js): floating red wireframe window panels, network links, particles, bloom. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

(function(){
  const canvas = document.getElementById('rbx3d');
  if(!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const coarse = matchMedia('(pointer:coarse)').matches;
  if(reduce || coarse || window.innerWidth < 760) return; // poster fallback handles these

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' }); }
  catch(e){ return; }
  if(!renderer) return;

  const host = canvas.parentElement;
  const sz = () => ({ w: Math.max(1, host.clientWidth), h: Math.max(1, host.clientHeight) });
  let { w, h } = sz();
  const DPR = Math.min(devicePixelRatio || 1, 1);
  renderer.setPixelRatio(DPR);
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x070709, 1);

  const RED = 0xff2942, REDD = 0xd80c24, BG = 0x070709;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.05);
  const camera = new THREE.PerspectiveCamera(46, w/h, 0.1, 120);
  camera.position.set(0, 0, 16);

  // ---- window-panel data texture ----
  function panelTexture(label, code, big){
    const c = document.createElement('canvas'); c.width = 320; c.height = 200;
    const x = c.getContext('2d');
    x.fillStyle = 'rgba(17,5,9,0.62)'; x.fillRect(0,0,320,200);
    x.fillStyle = 'rgba(216,12,36,0.34)'; x.fillRect(0,0,320,34);
    x.fillStyle = 'rgba(255,41,66,0.5)'; x.fillRect(0,34,320,1);
    x.fillStyle = '#ffb3bb'; x.font = '600 15px "Space Mono", ui-monospace, monospace';
    x.fillText(label, 14, 23);
    x.fillStyle = 'rgba(255,255,255,0.65)'; x.font = '12px "Space Mono", ui-monospace, monospace';
    x.textAlign = 'right'; x.fillText(code, 306, 22); x.textAlign = 'left';
    x.fillStyle = 'rgba(255,41,66,0.22)'; x.font = '800 70px "Chakra Petch", system-ui, sans-serif';
    x.fillText(big, 188, 156);
    x.strokeStyle = 'rgba(255,255,255,0.13)'; x.lineWidth = 1;
    for(let i=0;i<5;i++){ const yy = 60 + i*26; x.beginPath(); x.moveTo(16, yy); x.lineTo(16 + 70 + ((i*53)%150), yy); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.needsUpdate = true; return t;
  }

  const group = new THREE.Group(); scene.add(group);
  const panels = [];
  const defs = [
    { label:'NODE 0xC7', code:'LIVE',     big:'03A', x:-1.1, y: 1.5, z: 1.2, s:1.02 },
    { label:'NODE 0xB4', code:'SYNC',     big:'02B', x: 2.3, y: 0.5, z:-1.6, s:0.92 },
    { label:'LEDGER 0x9F', code:'OK',     big:'01C', x:-2.7, y:-1.1, z:-0.4, s:0.84 },
    { label:'SHIELD 0xA1', code:'ACTIVE', big:'04D', x: 1.2, y:-1.7, z: 2.0, s:0.80 },
    { label:'CORE 0xD2', code:'NOMINAL',  big:'05E', x: 3.4, y: 2.0, z:-3.2, s:0.68 },
    { label:'AUDIT 0x77', code:'VERIFIED',big:'06F', x:-3.3, y: 1.9, z:-2.6, s:0.72 }
  ];
  const PW = 2.7, PH = 1.69;
  defs.forEach((d,i)=>{
    const geo = new THREE.PlaneGeometry(PW*d.s, PH*d.s);
    const mat = new THREE.MeshBasicMaterial({ map:panelTexture(d.label+'  '+d.big, d.code, d.big), transparent:true, opacity:0.94, depthWrite:false, side:THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(d.x, d.y, d.z);
    mesh.rotation.y = (d.x > 0 ? -1 : 1) * 0.2; mesh.rotation.x = -0.05;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color:RED, transparent:true, opacity:0.95 }));
    mesh.add(edges);
    group.add(mesh);
    panels.push({ mesh, base:mesh.position.clone(), phase:i*1.27, sp:0.45 + (i%3)*0.16 });
  });

  // ---- network links ----
  const pairs = [[0,1],[0,2],[1,4],[2,3],[3,0],[5,2],[5,0]];
  const linkGeo = new THREE.BufferGeometry();
  const linkPos = new Float32Array(pairs.length*6);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  group.add(new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color:REDD, transparent:true, opacity:0.32 })));
  function updateLinks(){
    let o = 0;
    for(const [a,b] of pairs){ const pa = panels[a].mesh.position, pb = panels[b].mesh.position;
      linkPos[o++]=pa.x; linkPos[o++]=pa.y; linkPos[o++]=pa.z; linkPos[o++]=pb.x; linkPos[o++]=pb.y; linkPos[o++]=pb.z; }
    linkGeo.attributes.position.needsUpdate = true;
  }

  // ---- node dots at panel corners feel ----
  const dotGeo = new THREE.BufferGeometry();
  const dotArr = new Float32Array(defs.length*3);
  defs.forEach((d,i)=>{ dotArr[i*3]=d.x; dotArr[i*3+1]=d.y; dotArr[i*3+2]=d.z; });
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotArr,3));
  const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color:RED, size:0.16, transparent:true, opacity:0.9 }));
  group.add(dots);

  // ---- ambient particles ----
  const N = 150, pGeo = new THREE.BufferGeometry(), pArr = new Float32Array(N*3);
  for(let i=0;i<N*3;i++) pArr[i] = (Math.random()-0.5)*24;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr,3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color:RED, size:0.05, transparent:true, opacity:0.5 }));
  scene.add(particles);

  // ---- bloom ----
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(DPR); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 1.3, 0.82, 0.08);
  composer.addPass(bloom);

  // ---- interaction ----
  let mx=0, my=0, tmx=0, tmy=0;
  window.addEventListener('pointermove', e=>{ tmx = e.clientX/window.innerWidth - 0.5; tmy = e.clientY/window.innerHeight - 0.5; }, { passive:true });
  function resize(){ const s = sz(); w=s.w; h=s.h; renderer.setSize(w,h,false); composer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize);

  let inView = true;
  const heroEl = document.getElementById('hero');
  if(heroEl && 'IntersectionObserver' in window)
    new IntersectionObserver(es=>{ inView = es[0].isIntersecting; }, { threshold:0.01 }).observe(heroEl);

  document.documentElement.classList.add('has-3d'); // hides the poster fallback

  // paint one frame immediately so the scene shows even before rAF spins up
  camera.lookAt(0,0,0); updateLinks(); composer.render();

  const t0 = performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    if(!inView) return;
    const t = (now - t0)/1000;
    mx += (tmx - mx)*0.045; my += (tmy - my)*0.045;
    group.rotation.y = mx*0.55 + Math.sin(t*0.09)*0.07;
    group.rotation.x = my*0.32;
    camera.position.x = mx*1.6; camera.position.y = -my*1.1; camera.lookAt(0,0,0);
    for(const p of panels){ p.mesh.position.y = p.base.y + Math.sin(t*p.sp + p.phase)*0.2; p.mesh.position.x = p.base.x + Math.cos(t*p.sp*0.7 + p.phase)*0.12; }
    updateLinks();
    particles.rotation.y = t*0.018;
    composer.render();
  }
  requestAnimationFrame(frame);
})();
