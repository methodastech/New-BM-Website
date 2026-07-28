import * as THREE_MOD from 'three'

/* Contact page scripts, ported verbatim from _source/contact.html.
   Shell-owned scripts (nav, burger, Lenis, universal search, BM ribbon, bmBack/embedded) are omitted. */

/* ============ enquiry form: concept demo submit ============ */
function initForm(){
  var form=document.getElementById('cform'); if(!form) return function(){};
  function onSubmit(e){
    e.preventDefault();
    var f=form;
    if(!f.querySelector('#f-name').value.trim()||!f.querySelector('#f-email').value.trim()){
      f.querySelector('#f-name').focus();return;
    }
    document.getElementById('sent').classList.add('show');
    f.querySelectorAll('input,textarea').forEach(function(el){el.value='';});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  form.addEventListener('submit',onSubmit);
  return function(){ form.removeEventListener('submit',onSubmit); };
}

/* ===== IAQ HQ · stylized isometric 3D district (Three.js, self-contained) ===== */
function build(THREE,host,reduce){
  const RED=0xEC2027, RED_HI=0xff5a5f;
  let W=host.clientWidth||360, H=host.clientHeight||280;
  let dead=false;

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));/* match the other engines; a flat isometric map gains nothing from 2x on a DPR-3 phone */
  renderer.setSize(W,H,false);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  if('outputColorSpace' in renderer) renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.06;
  renderer.setClearColor(0xEEF2F8,1);/* opaque light base: the canvas is fully filled, no transparent edge showing through */
  host.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,W/H,0.1,200);
  const DIST=20;/* pulled in so the district fills the frame (less empty background) */
  /* IAQ plot sits on a clean land parcel: the empty quadrant between the central road cross and
     the side lanes, NOT on the roads. The camera orbits this parcel so it stays the centred hero. */
  const PLOTX=4.3, PLOTZ=4.3;
  function place(az){ // az in radians around Y
    const el=0.86; // elevation angle (isometric-ish)
    camera.position.set(PLOTX+Math.sin(az)*DIST*Math.cos(el), Math.sin(el)*DIST, PLOTZ+Math.cos(az)*DIST*Math.cos(el));
    camera.lookAt(PLOTX,1.8,PLOTZ);
  }

  /* ---- lighting: soft studio ---- */
  scene.add(new THREE.HemisphereLight(0xffffff,0xdfe4ee,0.85));
  const key=new THREE.DirectionalLight(0xffffff,1.15);
  key.position.set(9,15,7);
  key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.near=1; key.shadow.camera.far=60;
  const sc=key.shadow.camera; sc.left=-18; sc.right=18; sc.top=18; sc.bottom=-18; sc.updateProjectionMatrix();
  key.shadow.bias=-0.0004; key.shadow.radius=4;
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xeaf0ff,0.4); fill.position.set(-8,6,-6); scene.add(fill);

  /* ---- ground: plot-grid base ---- */
  const groundMat=new THREE.MeshStandardMaterial({color:0xeef1f6,roughness:0.96,metalness:0});
  const ground=new THREE.Mesh(new THREE.BoxGeometry(64,1,64),groundMat);
  ground.position.set(PLOTX,-0.5,PLOTZ); ground.receiveShadow=true; scene.add(ground);/* big + centred on the plot so it fills the frame at every orbit angle */
  // grid lines (thin plot divisions) via GridHelper, faint
  const grid=new THREE.GridHelper(64,42,0xcdd4e0,0xdde2ec);
  grid.position.set(PLOTX,0.011,PLOTZ); grid.material.opacity=0.5; grid.material.transparent=true; scene.add(grid);

  /* ---- roads: thin strips between blocks ---- */
  const roadMat=new THREE.MeshStandardMaterial({color:0xd7dbe4,roughness:1,metalness:0});
  function road(x,z,w,d){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.06,d),roadMat); m.position.set(x,0.02,z); m.receiveShadow=true; scene.add(m); }
  road(0,0,2.1,26);   road(0,0,26,2.1);         // main cross
  road(-8.5,0,1.3,26); road(8.5,0,1.3,26);      // side lanes
  road(0,-8.5,26,1.3); road(0,8.5,26,1.3);

  /* ---- building blocks ---- */
  const whiteMat=new THREE.MeshStandardMaterial({color:0xf6f7fa,roughness:0.62,metalness:0.02});
  const greyMat =new THREE.MeshStandardMaterial({color:0xdfe3ea,roughness:0.7,metalness:0.02});
  const roofMat =new THREE.MeshStandardMaterial({color:0xcfd4dd,roughness:0.85,metalness:0.03});
  const redTrimMat=new THREE.MeshStandardMaterial({color:RED,roughness:0.5,metalness:0.05,emissive:RED,emissiveIntensity:0.06});

  function block(x,z,w,d,h,opts){
    opts=opts||{};
    const g=new THREE.Group();
    const bodyMat=opts.grey?greyMat:whiteMat;
    const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bodyMat);
    body.position.y=h/2; body.castShadow=true; body.receiveShadow=true; g.add(body);
    // roof cap slightly inset
    const roof=new THREE.Mesh(new THREE.BoxGeometry(w*0.92,0.25,d*0.92),roofMat);
    roof.position.y=h+0.08; roof.castShadow=true; g.add(roof);
    // optional red trim band near top
    if(opts.trim){
      const band=new THREE.Mesh(new THREE.BoxGeometry(w*1.006,0.22,d*1.006),redTrimMat);
      band.position.y=h*0.82; g.add(band);
    }
    g.position.set(x,0,z);
    scene.add(g); return g;
  }
  // surrounding district: varied heights, matte white/grey, a few red trims
  block(-11,-11,4.4,4.4,3.2,{grey:true});
  block(-4.6,-11,3.6,4.0,4.6,{trim:true});
  block(4.4,-11.4,4.2,3.6,2.6,{});
  block(11,-10.6,3.4,4.6,5.4,{grey:true});
  block(-11.2,-4.4,4.2,3.6,4.0,{});
  block(11.2,-4,3.6,4.2,3.0,{trim:true,grey:true});
  block(-11,4.4,4.0,4.2,5.0,{grey:true});
  block(-4.4,11,3.8,4.0,3.4,{});
  block(4.6,11.2,4.2,3.6,4.4,{trim:true});
  block(11,11,4.4,4.4,2.8,{grey:true});
  block(11.2,4.2,3.4,4.0,3.8,{});
  block(-4.6,4.6,3.4,3.4,2.4,{grey:true});

  /* ---- IAQ plot: low white HQ block with red trim + plot pad, on the land parcel ---- */
  const padMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.9,metalness:0});
  const pad=new THREE.Mesh(new THREE.BoxGeometry(5.8,0.12,5.8),padMat);
  pad.position.set(PLOTX,0.06,PLOTZ); pad.receiveShadow=true; scene.add(pad);
  const padEdge=new THREE.Mesh(new THREE.BoxGeometry(6.1,0.16,6.1),new THREE.MeshStandardMaterial({color:RED,roughness:0.55,metalness:0.05,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  padEdge.position.set(PLOTX,0.07,PLOTZ); scene.add(padEdge);
  const HQ_H=3.4;
  const hq=block(PLOTX,PLOTZ,4.4,3.0,HQ_H,{trim:true});
  const ROOFY=HQ_H+0.2;                    // top of the HQ roof cap: the pin sits here, on the building

  /* ---- glowing red beacon marker: sits ON TOP of the IAQ HQ building ---- */
  const beacon=new THREE.Group(); beacon.position.set(PLOTX,ROOFY,PLOTZ); scene.add(beacon);
  // only the pin bobs; the halo rings stay flat on the roof so nothing z-fights
  const pinGroup=new THREE.Group(); beacon.add(pinGroup);
  const pinMat=new THREE.MeshStandardMaterial({color:RED,roughness:0.35,metalness:0.1,emissive:RED,emissiveIntensity:0.55});
  const stem=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.5,24),pinMat);
  stem.rotation.x=Math.PI; stem.position.y=1.15; stem.castShadow=true; pinGroup.add(stem);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.62,28,28),pinMat);
  head.position.y=2.15; head.castShadow=true; pinGroup.add(head);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.22,20,20),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.4,roughness:0.4}));
  dot.position.set(0,2.15,0.45); pinGroup.add(dot);
  // pulsing halo rings on the roof, depthWrite off so they never z-fight the roof cap
  const ringMat=new THREE.MeshBasicMaterial({color:RED_HI,transparent:true,opacity:0.6,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.7,0.95,48),ringMat);
  ring.rotation.x=-Math.PI/2; ring.position.y=0.06; ring.renderOrder=4; beacon.add(ring);
  const ring2Mat=new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false});
  const ring2=new THREE.Mesh(new THREE.RingGeometry(0.6,0.78,48),ring2Mat);
  ring2.rotation.x=-Math.PI/2; ring2.position.y=0.065; ring2.renderOrder=4; beacon.add(ring2);
  // point light to make the marker glow onto the roof and nearby surfaces
  const glow=new THREE.PointLight(RED,1.2,8,2); glow.position.set(PLOTX,ROOFY+1.6,PLOTZ); scene.add(glow);

  /* ---- orbit control: drag + gentle auto-rotate with easing ---- */
  let az=0.72, targetAz=0.72, autoVel=reduce?0:0.0016;
  let dragging=false, lastX=0, dragVel=0;
  place(az);

  function pointerDown(e){ dragging=true; lastX=(e.touches?e.touches[0].clientX:e.clientX); host.setPointerCapture&&e.pointerId!=null&&host.setPointerCapture(e.pointerId); }
  function pointerMove(e){ if(!dragging) return; const x=(e.touches?e.touches[0].clientX:e.clientX); const dx=x-lastX; lastX=x; dragVel=-dx*0.006; targetAz+=dragVel; }
  function pointerUp(){ dragging=false; }
  host.addEventListener('pointerdown',pointerDown);
  window.addEventListener('pointermove',pointerMove,{passive:true});
  window.addEventListener('pointerup',pointerUp);
  /* a gesture the browser reclassifies as a vertical pan fires cancel, not up: reset drag so auto-rotate resumes */
  window.addEventListener('pointercancel',pointerUp);
  // touch fallback
  host.addEventListener('touchstart',pointerDown,{passive:true});
  host.addEventListener('touchmove',pointerMove,{passive:true});
  host.addEventListener('touchend',pointerUp);
  host.addEventListener('touchcancel',pointerUp);

  /* ---- render loop with IntersectionObserver pause ---- */
  let visible=true, running=false, raf=0, t0=performance.now();
  function frame(now){
    if(dead){ running=false; return; }
    if(!visible){ running=false; return; }
    const dt=Math.min((now-t0)/1000,0.05); t0=now;
    if(!dragging){ targetAz+=autoVel*(dt*60); dragVel*=0.9; targetAz+=dragVel; }
    az+=(targetAz-az)*0.09;
    place(az);
    // beacon animation
    if(!reduce){
      const tt=now*0.001;
      const pulse=(Math.sin(tt*2.2)+1)/2;
      ring.scale.setScalar(1+pulse*0.9); ringMat.opacity=0.55*(1-pulse);
      ring2.scale.setScalar(1+pulse*0.5); ring2Mat.opacity=0.35*(1-pulse*0.8);
      pinGroup.position.y=Math.sin(tt*1.6)*0.06;
      glow.intensity=1.0+pulse*0.7;
    }
    renderer.render(scene,camera);
    raf=requestAnimationFrame(frame);
  }
  function start(){ if(running||dead) return; running=true; t0=performance.now(); raf=requestAnimationFrame(frame); }
  function stop(){ running=false; if(raf) cancelAnimationFrame(raf); }

  const io=new IntersectionObserver((ents)=>{
    ents.forEach(en=>{ visible=en.isIntersecting; if(visible) start(); else stop(); });
  },{threshold:0.05});
  io.observe(host);

  /* bake the shadow map once, then freeze it (matches the campus engines): the camera only orbits and
     never moves a shadow caster, so re-baking a 1024² PCF map every frame is wasted GPU/battery on a
     phone. The pin's slight bob keeps the now-frozen shadow, which is imperceptible. */
  renderer.shadowMap.needsUpdate=true; place(az); renderer.render(scene,camera); renderer.shadowMap.autoUpdate=false;
  // if reduced motion: render a single static frame, no loop needed unless dragged
  if(reduce){ place(az); renderer.render(scene,camera); }
  else { start(); }
  // allow drag to wake the loop even under reduced motion
  host.addEventListener('pointerdown',()=>{ if(visible&&!running) start(); });

  /* ---- resize ---- */
  function onResize(){ W=host.clientWidth||W; H=host.clientHeight||H; if(!W||!H) return; camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H,false); if(!running) renderer.render(scene,camera); }
  window.addEventListener('resize',onResize);
  let rzo=null;
  if(window.ResizeObserver){ rzo=new ResizeObserver(onResize); rzo.observe(host); }

  return function cleanup(){
    dead=true; stop();
    io.disconnect();
    if(rzo) rzo.disconnect();
    window.removeEventListener('pointermove',pointerMove);
    window.removeEventListener('pointerup',pointerUp);
    window.removeEventListener('pointercancel',pointerUp);
    window.removeEventListener('resize',onResize);
    renderer.dispose(); try{renderer.forceContextLoss();}catch(_){}
  };
}

export default function initContact(){
  var cleanups=[initForm()];
  const host=document.getElementById('hqmap');
  if(host){
    const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try{ cleanups.push(build(THREE_MOD,host,reduce)); }catch(e){ host.classList.add('no-webgl'); }
  }
  return function(){ cleanups.forEach(function(fn){ if(typeof fn==='function') fn(); }); };
}
