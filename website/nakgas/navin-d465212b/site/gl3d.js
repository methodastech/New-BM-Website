/* NakGas, 21 Oct 2026, second version: 14 kg LPG cylinders in 3D for the price panel, real enough to read as the product
   (Zieel: "make it more realistic", "connected"). Painted steel with an orange-peel finish and a welded middle seam, a collar guard
   with two handle cut-outs and a rolled rim, a brass valve with a red seal cap, a foot ring with vents, the white NakGas sticker;
   a studio room for reflections (RoomEnvironment), a soft key light casting a real shadow, PBR Neutral tone mapping.
   Connected to the bill: pressing + or - on the bill adds or takes away a cylinder (up to four), the camera reframes.
   Three.js 0.165 through the page's import map, loaded only where [data-cyl] exists; without WebGL the bar stays. */
(function () {
  'use strict';
  var host = document.querySelector('[data-cyl]'); if (!host) return;
  var probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { host.remove(); return; }
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')]).then(function (mods) {
    var THREE = mods[0], RoomEnvironment = mods[1].RoomEnvironment;
    var W = host.clientWidth || 520, H = host.clientHeight || 360;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement); host.closest('.anat').classList.add('gl');
    var scene = new THREE.Scene();
    var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.035).texture; pm.dispose();
    scene.environmentIntensity = 0.95;
    var camera = new THREE.PerspectiveCamera(24, W / H, 0.1, 80);
    var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 8, 5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 5; key.shadow.camera.bottom = -5; key.shadow.radius = 6; key.shadow.bias = -0.0005;
    scene.add(key); scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e4de, 0.35));

    /* textures drawn on canvases: the paint's orange peel, the vents and handle holes, the sticker */
    function cvs(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
    var peel = new THREE.CanvasTexture(cvs(512, 512, function (g, w, h) { var d = g.createImageData(w, h), i, v; for (i = 0; i < d.data.length; i += 4) { v = 118 + Math.random() * 22; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); g.filter = 'blur(1.2px)'; g.drawImage(g.canvas, 0, 0); }));
    peel.wrapS = peel.wrapT = THREE.RepeatWrapping; peel.repeat.set(3, 3);
    var wear = new THREE.CanvasTexture(cvs(1024, 512, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 260; k++) { var x = Math.random() * w, y = Math.random() * h, l = 6 + Math.random() * 60; g.strokeStyle = 'rgba(70,78,86,' + (.04 + Math.random() * .1) + ')'; g.lineWidth = .6 + Math.random() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 8, y + l); g.stroke(); }
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.78, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(60,64,70,.22)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (k = 0; k < 40; k++) { g.fillStyle = 'rgba(80,86,92,' + (.05 + Math.random() * .08) + ')'; g.beginPath(); g.ellipse(Math.random() * w, h * (.75 + Math.random() * .25), 4 + Math.random() * 18, 2 + Math.random() * 6, Math.random() * 3, 0, 6.3); g.fill(); } }));
    wear.colorSpace = THREE.SRGBColorSpace;
    var paint = new THREE.MeshPhysicalMaterial({ map: wear, color: 0x9AA4AD, metalness: .35, roughness: .42, roughnessMap: peel, bumpMap: peel, bumpScale: .6, clearcoat: .55, clearcoatRoughness: .3 });
    var steelD = new THREE.MeshPhysicalMaterial({ color: 0x7E8892, metalness: .5, roughness: .45, roughnessMap: peel, bumpMap: peel, bumpScale: .5, clearcoat: .3, side: THREE.DoubleSide });
    var holes = function (n, top) { return new THREE.CanvasTexture(cvs(1024, 256, function (g, w, h) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000';
      for (var k = 0; k < n; k++) { var cx = (k + .5) / n * w, ww = top ? 300 : 70, hh = top ? 96 : 54, y = top ? 26 : 110; g.beginPath(); if (g.roundRect) g.roundRect(cx - ww / 2, y, ww, hh, hh / 2); else g.rect(cx - ww / 2, y, ww, hh); g.fill(); } })); };
    var collarMat = steelD.clone(); collarMat.alphaMap = holes(2, true); collarMat.alphaTest = .5;
    var footMat = steelD.clone(); footMat.alphaMap = holes(6, false); footMat.alphaTest = .5;
    var brass = new THREE.MeshPhysicalMaterial({ color: 0xC9A04A, metalness: 1, roughness: .28 });
    var seal = new THREE.MeshPhysicalMaterial({ color: 0xC4262E, metalness: 0, roughness: .45, clearcoat: .6 });
    /* the wrap label at its true proportion: the band is 2*pi*1.026 = 6.45 units round and 1.0 tall, so the canvas is 3072 by 476;
       two copies of the artwork, one facing front and one at the back (21 Oct: the 2048 by 512 canvas stretched it sideways) */
    var stickerC = cvs(3072, 476, function (g, w, h) {
      g.fillStyle = '#fbfcfb'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#0CA66A'; g.fillRect(0, 0, w, 52); g.fillRect(0, h - 34, w, 34);
      [768, 2304].forEach(function (cx) { var x0 = cx - 430;
        g.fillStyle = '#0B1530'; g.font = '700 52px "Plus Jakarta Sans", Inter, Arial, sans-serif'; g.fillText('LPG 14 kg', x0, 300);
        g.fillStyle = '#5B6780'; g.font = '500 29px Inter, Arial, sans-serif'; g.fillText('Harga kawalan KPDN  ·  RM26.60', x0, 350); g.fillText('Delivered by a licensed dealer', x0, 392);
        var bx = x0 + 700; g.strokeStyle = '#E2E8E5'; g.lineWidth = 3; g.strokeRect(bx, 266, 150, 128); g.fillStyle = '#F4B400'; g.beginPath(); g.moveTo(bx + 75, 282); g.lineTo(bx + 137, 378); g.lineTo(bx + 13, 378); g.closePath(); g.fill(); g.fillStyle = '#0B1530'; g.font = '800 58px Arial'; g.fillText('!', bx + 63, 370); }); });
    var stickerT = new THREE.CanvasTexture(stickerC); stickerT.colorSpace = THREE.SRGBColorSpace; stickerT.anisotropy = 8;
    var lock = new Image(); lock.onload = function () { var g = stickerC.getContext('2d'), hh = 132, ww = hh * lock.width / lock.height; g.drawImage(lock, 338, 92, ww, hh); g.drawImage(lock, 1874, 92, ww, hh); stickerT.needsUpdate = true; draw(); };
    lock.src = '../assets/lockup.svg';
    var sticker = new THREE.MeshPhysicalMaterial({ map: stickerT, roughness: .5, metalness: 0, clearcoat: .4, clearcoatRoughness: .2 });

    /* one cylinder: a lathe for the body (domes and straight side), the seam, the collar, the valve, the foot ring, the sticker */
    var prof = [], a;
    prof.push(new THREE.Vector2(0.001, -1.36));
    for (a = 0; a <= 16; a++) { var t1 = a / 16 * Math.PI / 2; prof.push(new THREE.Vector2(Math.sin(t1) * 1.0, -1.0 - Math.cos(t1) * .36)); }
    prof.push(new THREE.Vector2(1.0, 1.0));
    for (a = 1; a <= 16; a++) { var t2 = a / 16 * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(t2) * 1.0, 1.0 + Math.sin(t2) * .42)); }
    var GEO = {
      body: new THREE.LatheGeometry(prof, 96),
      seam: new THREE.TorusGeometry(1.004, .014, 10, 96),
      collar: new THREE.CylinderGeometry(.52, .54, .5, 64, 1, true),
      rim: new THREE.TorusGeometry(.52, .035, 12, 64),
      neck: new THREE.CylinderGeometry(.16, .2, .16, 32),
      vbody: new THREE.CylinderGeometry(.1, .12, .3, 32),
      hex: new THREE.CylinderGeometry(.15, .15, .1, 6),
      out: new THREE.CylinderGeometry(.045, .045, .2, 16),
      cap: new THREE.CylinderGeometry(.085, .085, .07, 24),
      foot: new THREE.CylinderGeometry(.8, .8, .3, 64, 1, true),
      frim: new THREE.TorusGeometry(.8, .03, 10, 64),
      stick: new THREE.CylinderGeometry(1.026, 1.026, 1.0, 128, 1, true)
    };
    function cylinder() {
      var g = new THREE.Group(), m;
      function add(geo, mat, y, rx, rz) { m = new THREE.Mesh(geo, mat); m.position.y = y; if (rx) m.rotation.x = rx; if (rz) m.rotation.z = rz; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
      add(GEO.body, paint, 0); add(GEO.seam, paint, 0, Math.PI / 2);
      add(GEO.collar, collarMat, 1.64); add(GEO.rim, steelD, 1.9, Math.PI / 2);
      add(GEO.neck, steelD, 1.46); add(GEO.vbody, brass, 1.66); add(GEO.hex, brass, 1.58);
      var o = add(GEO.out, brass, 1.7, 0, Math.PI / 2); o.position.x = .14;
      add(GEO.cap, seal, 1.84);
      add(GEO.foot, footMat, -1.5); add(GEO.frim, steelD, -1.64, Math.PI / 2);
      var st = add(GEO.stick, sticker, 0); st.rotation.y = -Math.PI / 2;   /* one label all the way round, covering the seam; its front copy faces the camera at rest */
      return g;
    }
    /* a shadow catcher under everything */
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .16 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.66; ground.receiveShadow = true; scene.add(ground);
    var ao = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs(256, 256, function (g) { var gr = g.createRadialGradient(128, 128, 8, 128, 128, 128); gr.addColorStop(0, 'rgba(11,21,48,.34)'); gr.addColorStop(1, 'rgba(11,21,48,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); })), transparent: true, depthWrite: false }));
    ao.rotation.x = -Math.PI / 2; ao.position.y = -1.655;

    /* the arrangement: one to four cylinders, each drops in or sinks away; the camera reframes */
    var LAY = { 1: [[0, 0]], 2: [[-1.12, 0], [1.12, 0]], 3: [[-1.14, -.55], [1.14, -.55], [0, 1.4]], 4: [[-1.12, -1.12], [1.12, -1.12], [-1.12, 1.12], [1.12, 1.12]] };   /* 21 Oct: no two cylinders closer than 2.2, so they never pass through each other */
    var stage = new THREE.Group(); scene.add(stage);
    var items = [], q = 1, dist = 9.6, distT = 9.6, lift = 0, liftT = 0;
    function aoFor() { var s = ao.clone(); s.material = ao.material.clone(); return s; }
    function layout(n) {
      while (items.length < n) { var c = cylinder(), s = aoFor(); stage.add(c); stage.add(s); items.push({ g: c, s: s, y: 4.5, ty: 0, sc: 1, tsc: 1, x: 0, z: 0, tx: 0, tz: 0, rot: Math.random() * .6 - .3 }); }
      items.forEach(function (it, i) { var L = LAY[n][i]; if (L) { it.tx = L[0]; it.tz = L[1]; it.ty = 0; it.tsc = 1; it.out = false; } else { it.ty = -.2; it.tsc = .001; it.out = true; } });
      distT = n === 1 ? 9.6 : n === 2 ? 12.4 : n === 3 ? 14.4 : 15.6; liftT = n >= 3 ? 3.2 : n === 2 ? .8 : 0;   /* a higher camera so the back row shows */
    }
    layout(1); items[0].y = 0; items[0].x = items[0].tx; items[0].z = items[0].tz;
    window.addEventListener('gl-qty', function (e) { q = Math.max(1, Math.min(4, e.detail | 0)); layout(q); if (!run) frameOnce(); });

    var spin = -0.35, tx = 0, ty = 0, cx = 0, cy = 0, run = false, raf = 0, last = 0, drag = null, vel = 0, held = 0;
    renderer.domElement.style.cursor = 'grab'; renderer.domElement.style.touchAction = 'pan-y';
    host.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, t: performance.now() }; vel = 0; renderer.domElement.style.cursor = 'grabbing'; try { host.setPointerCapture(e.pointerId); } catch (_) { } });
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect();
      if (drag) { var now = performance.now(), dx = e.clientX - drag.x; spin += dx * .012; vel = dx * .012 / Math.max(8, now - drag.t); ty = Math.max(-.3, Math.min(.3, ty + (e.clientY - drag.y) * .002)); drag.x = e.clientX; drag.y = e.clientY; drag.t = now; held = now; return; }
      tx = ((e.clientX - r.left) / r.width - .5) * .5; ty = ((e.clientY - r.top) / r.height - .5) * .2; });
    function up() { drag = null; renderer.domElement.style.cursor = 'grab'; }
    host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
    host.addEventListener('pointerleave', function () { if (!drag) { tx = 0; ty = 0; } });
    function step(dt) {
      var k = 1 - Math.exp(-dt / 140), kd = 1 - Math.exp(-dt / 320);
      if (!drag) { spin += vel * dt; vel *= Math.exp(-dt / 600); if (!RM && performance.now() - held > 2500) spin += dt * .00022; }
      cx += (tx - cx) * k * .5; cy += (ty - cy) * k * .5;
      stage.rotation.y = spin + cx;
      dist += (distT - dist) * kd; lift += (liftT - lift) * kd;
      camera.position.set(0, 1.3 + dist * .1 + lift + cy * 3, dist); camera.lookAt(0, .15 - (dist - 9.6) * .02, 0);
      items.forEach(function (it) {
        it.x += (it.tx - it.x) * k; it.z += (it.tz - it.z) * k; it.sc += (it.tsc - it.sc) * k;
        /* a drop with a small bounce: velocity toward the target with damping */
        it.v = (it.v || 0) + (it.ty - it.y) * .0009 * dt; it.v *= Math.exp(-dt / 160); it.y += it.v * dt;
        if (Math.abs(it.ty - it.y) < .001 && Math.abs(it.v) < .0005) { it.y = it.ty; it.v = 0; }
        it.g.position.set(it.x, Math.max(it.y, -.2), it.z); it.g.rotation.y = it.rot; it.g.scale.setScalar(Math.max(.001, it.sc));
        it.s.position.set(it.x, -1.655, it.z); it.s.material.opacity = Math.max(0, Math.min(1, it.sc * (1 - Math.min(1, Math.max(0, it.y) / 3))));
        it.g.visible = it.sc > .01;
      });
    }
    function draw() { renderer.render(scene, camera); }
    function frameOnce() { step(16); draw(); }
    function loop(now) { if (!run) return; var dt = last ? Math.min(48, now - last) : 16; last = now; step(dt); draw(); raf = requestAnimationFrame(loop); }
    function start() { if (run) return; run = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { run = false; cancelAnimationFrame(raf); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: .1 }).observe(host); else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); if (!run) frameOnce(); }).observe(host);
    for (var i = 0; i < 40; i++) step(16); draw();
    window.__cyl = { count: function () { return items.filter(function (it) { return !it.out; }).length; } };
  }).catch(function (e) { if (window.console) console.warn('gl3d', e && e.message); host.remove(); });
})();
