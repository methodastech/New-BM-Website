/* RubexPay Solutions — real WebGL 3D shapes. One renderer, scissor multi-view: each glass shape
   renders into a [data-box3d] slot (capabilities accordion panels + trust cards). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

(function(){
  const slots = [].slice.call(document.querySelectorAll('[data-box3d]'));
  const canvas = document.getElementById('solx-canvas');
  if(!slots.length || !canvas) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return; // poster fallback

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' }); }
  catch(e){ return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, 1));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 0, 5.6); // pulled back so the box stays contained on the right (less overlap)

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  scene.add(new THREE.AmbientLight(0xff4a58, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.55); key.position.set(2.5, 3, 4); scene.add(key);
  const rim = new THREE.PointLight(0xff2942, 11, 18); rim.position.set(-2.4, -1.4, 2.6); scene.add(rim);
  const fill = new THREE.PointLight(0xff5563, 6, 16); fill.position.set(2.6, 1.4, 3); scene.add(fill);

  const RED = 0xff2942;
  const glassMat = () => new THREE.MeshStandardMaterial({ color:0x230509, metalness:0.55, roughness:0.18, transparent:true, opacity:0.72, emissive:RED, emissiveIntensity:0.9 });
  const edge = (geo) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color:RED }));
  const lit = (geo) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color:RED }));
  // glass mesh + matching wire edge at a transform; returns [mesh,edge] to spread into g.add(...)
  const ge = (geo, x,y,z, rx,ry,rz, op) => { const m=new THREE.Mesh(geo, glassMat()); if(op!=null) m.material.opacity=op; m.position.set(x||0,y||0,z||0); m.rotation.set(rx||0,ry||0,rz||0); const e=edge(geo); e.position.copy(m.position); e.rotation.copy(m.rotation); return [m,e]; };

  function makeShape(name){
    const g = new THREE.Group();
    if(name === 'unified'){            // Unified Systems — fragments converge into one system, on loop
      const sg = new THREE.BoxGeometry(0.62,0.62,0.62);
      const cluster = new THREE.Group();
      [-0.43,0.43].forEach(x=>[-0.43,0.43].forEach(y=>[-0.43,0.43].forEach(z=>{ const m=new THREE.Mesh(sg, glassMat()); m.position.set(x,y,z); cluster.add(m, (function(){var e=edge(sg);e.position.set(x,y,z);return e;})()); })));
      g.add(cluster); g.userData.cluster = cluster;
      const core = lit(new THREE.BoxGeometry(0.5,0.5,0.5)); g.add(core); g.userData.core = core; return g;
    }
    if(name === 'data'){               // Data Control — wireframe shell + stacked analytics layers
      const shell = new THREE.BoxGeometry(1.55,1.55,1.55);
      const sm = new THREE.Mesh(shell, glassMat()); sm.material.opacity = 0.28; g.add(sm, edge(shell));
      const plates = [];
      [-0.45,0,0.45].forEach((y,i)=>{ const pg=new THREE.BoxGeometry(1.2-i*0.12,0.1,1.2-i*0.12); const m=new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color:0x33060c, metalness:0.6, roughness:0.25, emissive:RED, emissiveIntensity:0.7 })); m.position.y=y; g.add(m); plates.push(m); });
      g.userData.plates = plates;
      const core = lit(new THREE.SphereGeometry(0.26,18,18)); g.add(core); g.userData.core = core; return g;
    }
    if(name === 'compliance'){         // Built-In Compliance — vault cube + screening ring + seal
      const geo = new THREE.BoxGeometry(1.55,1.55,1.55); g.add(new THREE.Mesh(geo, glassMat()), edge(geo));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78,0.05,10,44), new THREE.MeshBasicMaterial({ color:RED })); g.add(ring); g.userData.ring = ring;
      const core = lit(new THREE.OctahedronGeometry(0.42,0)); g.add(core); g.userData.core = core; return g;
    }
    if(name === 'gateway'){            // GATEWAY — a square BOX gateway; entity cubes pass through one by one
      const bar = (w,h,x,y)=> ge(new THREE.BoxGeometry(w,h,0.34), x,y,0);
      g.add(...bar(1.94,0.2, 0, 0.87), ...bar(1.94,0.2, 0,-0.87), ...bar(0.2,1.54, -0.87,0), ...bar(0.2,1.54, 0.87,0));  // 4 bars = portal frame
      const cn = new THREE.SphereGeometry(0.07,10,10), cm = new THREE.MeshBasicMaterial({ color:0xffd2d4 });   // corner lights
      [[-0.87,0.87],[0.87,0.87],[-0.87,-0.87],[0.87,-0.87]].forEach(p=>{ const n=new THREE.Mesh(cn,cm); n.position.set(p[0],p[1],0); g.add(n); });
      const stream = [], eg = new THREE.BoxGeometry(0.34,0.34,0.34);                       // a queue of cubes transiting the gate
      for(let k=0;k<3;k++){ const c=new THREE.Mesh(eg, glassMat()); c.material.opacity=0.92; c.add(edge(eg)); g.add(c); stream.push(c); }
      g.userData.stream = stream; g.userData.flat = true; return g;
    }
    if(name === 'shield'){             // SHIELD — brand cube fully enclosed by a geodesic force field (no rings)
      g.add(...ge(new THREE.IcosahedronGeometry(1.1,1), 0,0,0, 0,0,0, 0.15));              // full enclosing force field (covers all)
      const core = lit(new THREE.BoxGeometry(0.58,0.58,0.58)); g.add(core); g.userData.core = core;   // the protected brand cube, centered
      const halo = new THREE.Mesh(new THREE.BoxGeometry(0.78,0.78,0.78), glassMat()); halo.material.opacity = 0.34; g.add(halo, edge(halo.geometry));
      return g;
    }
    if(name === 'core'){               // CORE — a single rich brand CUBE (no rings)
      g.add(...ge(new THREE.BoxGeometry(1.22,1.22,1.22), 0,0,0));                          // outer glass cube
      const inner = new THREE.Mesh(new THREE.BoxGeometry(0.64,0.64,0.64), glassMat()); inner.material.opacity = 0.5; inner.rotation.set(0.6,0.6,0); inner.add(edge(inner.geometry)); g.add(inner); g.userData.inner = inner;
      const core = lit(new THREE.BoxGeometry(0.34,0.34,0.34)); g.add(core); g.userData.core = core;   // glowing heart
      const cn = new THREE.SphereGeometry(0.06,10,10), cm = new THREE.MeshBasicMaterial({ color:RED });   // glowing cube vertices
      [[-.61,-.61,-.61],[.61,-.61,-.61],[-.61,.61,-.61],[.61,.61,-.61],[-.61,-.61,.61],[.61,-.61,.61],[-.61,.61,.61],[.61,.61,.61]]
        .forEach(p=>{ const n=new THREE.Mesh(cn,cm); n.position.set(p[0],p[1],p[2]); g.add(n); });
      return g;
    }
    if(name === 'connect'){            // CONNECT — a brand cube linked to other cubes (aligned network)
      g.add(...ge(new THREE.BoxGeometry(0.52,0.52,0.52), 0,0,0));                          // glass hub cube
      const hc = lit(new THREE.BoxGeometry(0.26,0.26,0.26)); g.add(hc); g.userData.core = hc;   // hub glow
      const sats = [[1.15,0,0],[-1.15,0,0],[0,1.15,0],[0,-1.15,0],[0,0,1.15],[0,0,-1.15]];   // aligned on the 6 axes
      const sgeo = new THREE.BoxGeometry(0.34,0.34,0.34), lmat = new THREE.LineBasicMaterial({ color:RED }), V = THREE.Vector3;
      sats.forEach(p=>{ const c=new THREE.Mesh(sgeo, glassMat()); c.position.set(p[0],p[1],p[2]); c.add(edge(sgeo)); g.add(c);
        g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V(0,0,0), new V(p[0],p[1],p[2])]), lmat)); });   // hub -> each cube
      const eq=[[1.15,0,0],[0,0,1.15],[-1.15,0,0],[0,0,-1.15]];                              // square ring linking the equatorial cubes
      for(let q=0;q<4;q++){ const a=eq[q], b=eq[(q+1)%4]; g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V(a[0],a[1],a[2]), new V(b[0],b[1],b[2])]), lmat)); }
      return g;
    }
    return g;
  }

  const shapes = slots.map(s => makeShape(s.getAttribute('data-box3d')));
  shapes.forEach(s => { s.visible = false; scene.add(s); });

  function size(){ renderer.setSize(window.innerWidth, window.innerHeight, false); }
  size(); window.addEventListener('resize', size, { passive:true });

  let mx=0, my=0, tmx=0, tmy=0;
  window.addEventListener('pointermove', e=>{ tmx = e.clientX/window.innerWidth - 0.5; tmy = e.clientY/window.innerHeight - 0.5; }, { passive:true });

  document.documentElement.classList.add('has-solx');

  function drawScene(){
    const H = window.innerHeight, W = window.innerWidth;
    /* clear the WHOLE canvas first: it is position:fixed, so a cube drawn while its slot was
       on-screen would otherwise ghost/persist over later content (e.g. the footer) once the
       slot scrolls off and its scissor region is never cleared again. */
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    slots.forEach((slot,i)=>{
      const r = slot.getBoundingClientRect();
      if(r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2) return;
      renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
      renderer.setScissor(r.left, H - r.bottom, r.width, r.height);
      camera.aspect = r.width/r.height; camera.updateProjectionMatrix();
      shapes.forEach((b,j)=> b.visible = (j === i));
      renderer.render(scene, camera);
    });
    renderer.setScissorTest(false);
  }

  shapes.forEach((b,i)=>{ b.rotation.y = 0.5 + i*0.25; b.rotation.x = -0.24; });
  drawScene();

  const t0 = performance.now();
  function loop(now){
    requestAnimationFrame(loop);
    if(document.hidden) return; // pause on tab-switch (real browsers run fine; headless preview throttles this)
    const t = (now - t0)/1000;
    mx += (tmx - mx)*0.05; my += (tmy - my)*0.05;
    shapes.forEach((b,i)=>{
      // gateway keeps its open hole toward the camera (shallow Y); others do the full auto-rotate
      b.rotation.y = b.userData.flat ? (0.15 + Math.sin(t*0.3)*0.18 + mx*0.3) : (t*(0.26 + i*0.04) + mx*0.5);
      b.rotation.x = -0.22 + my*0.35 + Math.sin(t*0.4 + i)*0.05;
      if(b.userData.core) b.userData.core.scale.setScalar((b.userData.coreBase||1) + Math.sin(t*1.6 + i)*0.07);
      if(b.userData.cluster){ const f = 0.78 + 0.22*(0.5+0.5*Math.sin(t*0.7)); b.userData.cluster.scale.setScalar(f); }   // unified: fragments breathe into one block
      if(b.userData.plates){ b.userData.plates.forEach(function(p,k){ const w = 0.5+0.5*Math.sin(t*1.5 + k*1.4); p.scale.y = 1 + 0.85*w; p.material.emissiveIntensity = 0.45 + 0.75*w; }); }   // data: live analytics levels
      if(b.userData.ring){ b.userData.ring.rotation.z = t*0.6; b.userData.ring.rotation.x = Math.sin(t*0.5)*0.65; }   // compliance: the screening ring scans the vault
      if(b.userData.inner){ b.userData.inner.rotation.x = t*0.5; b.userData.inner.rotation.y = t*0.4; } // core: inner cube rotates
      if(b.userData.stream){ b.userData.stream.forEach(function(c,k){ var p=((t*0.32)+k/3)%1; c.position.z = p*2.8 - 1.4; c.rotation.set(p*3, p*3, 0); }); } // gateway: cubes pass through one by one
    });
    drawScene();
  }
  requestAnimationFrame(loop);
})();
