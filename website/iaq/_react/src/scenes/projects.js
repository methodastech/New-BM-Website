/* Projects registry page scripts, ported from _source/projects.html.
   Shell owns: nav scroll, burger drawer, Lenis, universal search, BM ribbon, bmBack. */
import * as THREE_MOD from 'three'
import { PROJECTS, INDUSTRIES, REGIONS, TYPES, INDLBL, REGLBL, TYPLBL, ICONS, CLOGOS } from '../data/projects.js'

/* ---- closing section: interactive 3D IAQ campus, follows the cursor ----
   Shared by the registry page and the project detail page (scenes/project.js imports it). */
export function initCampus() {
  var host = document.querySelector('.close-stage') || document.querySelector('.close3d'); if (!host) return () => {}
  var canvas = document.getElementById('closeCv'); if (!canvas) return () => {}
  var T, renderer, scene, camera, g, beacons = [], raf = null, visb = false, truck, dust, stars, clouds, starMat, trees = []
  var px = 0, py = 0, pxt = 0, pyt = 0
  var dead = false, wd = null, io = null, ro = null
  /* self-contained reduced-motion flag so this engine works on every page it is propagated to */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  function mat(c, o) { o = o || {}; return new T.MeshStandardMaterial({ color: c, roughness: o.rough !== undefined ? o.rough : 0.65, metalness: o.metal || 0 }) }
  function bx(w, h, d, c, o) {
    var m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c, o))
    m.castShadow = true; m.receiveShadow = true
    m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({ color: 0x0B1120, transparent: true, opacity: 0.38 }))); return m
  }
  function cl(r, h, c, o) { var m = new T.Mesh(new T.CylinderGeometry(r, r, h, 18), mat(c, o)); m.castShadow = true; return m }
  function init(mod) {
    T = mod
    scene = new T.Scene()
    camera = new T.PerspectiveCamera(30, 2, 0.1, 100)
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap /* grounded contact shadows read as a real site */
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1
    scene.add(new T.HemisphereLight(0xEAF2FF, 0x2A3346, 1.05))
    var sun = new T.DirectionalLight(0xF4F7FF, 2.2); sun.position.set(7, 11, 5)
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9; sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -5
    sun.shadow.camera.near = 2; sun.shadow.camera.far = 32; sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.03
    scene.add(sun)
    var rim = new T.DirectionalLight(0x7FA8FF, 0.8); rim.position.set(-6, 5, -7); scene.add(rim)
    /* subtle dusk fog: the far ground melts into the sky instead of a hard edge */
    scene.fog = new T.Fog(0x14203C, 24, 64)
    /* ---- SKY: dusk gradient dome + starfield + soft moon + drifting clouds ---- */
    ;(function () {
      var scn = document.createElement('canvas'); scn.width = 8; scn.height = 256; var sc = scn.getContext('2d')
      var sg = sc.createLinearGradient(0, 0, 0, 256)
      sg.addColorStop(0.00, '#05080F'); sg.addColorStop(0.28, '#0A1526'); sg.addColorStop(0.48, '#152740')
      sg.addColorStop(0.64, '#1F3B61'); sg.addColorStop(0.80, '#2A5080'); sg.addColorStop(0.92, '#326096')
      sg.addColorStop(1.00, '#35669E')
      sc.fillStyle = sg; sc.fillRect(0, 0, 8, 256)
      var stex = new T.CanvasTexture(scn); if (T.SRGBColorSpace) stex.colorSpace = T.SRGBColorSpace
      var sky = new T.Mesh(new T.SphereGeometry(72, 24, 16), new T.MeshBasicMaterial({ map: stex, side: T.BackSide, depthWrite: false, fog: false }))
      sky.position.y = -8; sky.renderOrder = -10; scene.add(sky)
    })()
    function radialTex(stops) {
      var cv = document.createElement('canvas'); cv.width = cv.height = 128; var g2 = cv.getContext('2d')
      var rg = g2.createRadialGradient(64, 64, 2, 64, 64, 64); stops.forEach(function (s) { rg.addColorStop(s[0], s[1]) })
      g2.fillStyle = rg; g2.fillRect(0, 0, 128, 128); return new T.CanvasTexture(cv)
    }
    /* sparse dusk stars, low over the horizon so a few sit in the visible sky strip */
    var stn = 130, stp = new Float32Array(stn * 3)
    for (var si = 0; si < stn; si++) {
      var th = Math.random() * Math.PI * 2, rr = 40 + Math.random() * 16
      stp[si * 3] = Math.cos(th) * rr; stp[si * 3 + 1] = 2.6 + Math.random() * 9; stp[si * 3 + 2] = Math.sin(th) * rr - 2
    }
    var stgeo = new T.BufferGeometry(); stgeo.setAttribute('position', new T.BufferAttribute(stp, 3))
    starMat = new T.PointsMaterial({ color: 0xDCE8FF, size: 0.2, transparent: true, opacity: 0.8, depthWrite: false, fog: false })
    stars = new T.Points(stgeo, starMat); scene.add(stars)
    /* soft moon low on the horizon, off to one side so buildings don't hide it */
    var moon = new T.Sprite(new T.SpriteMaterial({ map: radialTex([[0, 'rgba(240,244,255,0.95)'], [0.32, 'rgba(210,224,255,0.4)'], [0.6, 'rgba(200,216,250,0.12)'], [1, 'rgba(200,216,250,0)']]), transparent: true, depthWrite: false, fog: false }))
    moon.scale.set(6, 6, 1); moon.position.set(15.5, 3.6, -18); scene.add(moon)
    /* drifting cloud banks along the horizon */
    var cloudTex = radialTex([[0, 'rgba(158,176,212,0.42)'], [0.5, 'rgba(158,176,212,0.11)'], [1, 'rgba(158,176,212,0)']])
    clouds = []
    for (var ci = 0; ci < 6; ci++) {
      var csp = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.5 }))
      var cw = 7 + Math.random() * 7; csp.scale.set(cw, cw * 0.3, 1)
      csp.position.set(-18 + Math.random() * 36, 2.8 + Math.random() * 3.2, -11 - Math.random() * 9)
      csp.userData.sp = 0.5 + Math.random() * 0.7; scene.add(csp); clouds.push(csp)
    }
    g = new T.Group(); scene.add(g)
    /* ---- ground: layered site, not a black void ---- */
    var gnd = new T.Mesh(new T.PlaneGeometry(96, 64), new T.MeshStandardMaterial({ color: 0x090D14, roughness: 1, metalness: 0 }))
    gnd.rotation.x = -Math.PI / 2; gnd.position.y = -0.03; gnd.receiveShadow = true; g.add(gnd)
    /* concrete apron slab: the campus footprint sits on a grounded pad */
    var apron = new T.Mesh(new T.PlaneGeometry(12.6, 5.6), new T.MeshStandardMaterial({ color: 0x1B2432, roughness: 0.9, metalness: 0 }))
    apron.rotation.x = -Math.PI / 2; apron.position.set(0.2, -0.012, 0.05); apron.receiveShadow = true; g.add(apron)
    /* apron kerb: a thin raised edge around the pad */
    var kerbMat = new T.MeshStandardMaterial({ color: 0x2A3546, roughness: 0.85 })
    ;[[0.2, -0.008, 2.85, 12.6, 0.16], [0.2, -0.008, -2.75, 12.6, 0.16]].forEach(function (k) {
      var kb = new T.Mesh(new T.BoxGeometry(k[3], 0.06, k[4]), kerbMat); kb.position.set(k[0], 0.02, k[2]); kb.receiveShadow = true; g.add(kb)
    })
    ;[[-6.1, -0.008, 0.05, 0.16, 5.6], [6.5, -0.008, 0.05, 0.16, 5.6]].forEach(function (k) {
      var kb = new T.Mesh(new T.BoxGeometry(k[3], 0.06, k[4]), kerbMat); kb.position.set(k[0], 0.02, k[2]); kb.receiveShadow = true; g.add(kb)
    })
    /* front service road (the truck + bollards run here) with a dashed centre line */
    var road = new T.Mesh(new T.PlaneGeometry(15, 1.05), new T.MeshStandardMaterial({ color: 0x0C1017, roughness: 1 }))
    road.rotation.x = -Math.PI / 2; road.position.set(0.2, -0.006, 2.25); road.receiveShadow = true; g.add(road)
    for (var dl = 0; dl < 11; dl++) {
      var dash = new T.Mesh(new T.PlaneGeometry(0.5, 0.05), new T.MeshBasicMaterial({ color: 0x5C6A7E }))
      dash.rotation.x = -Math.PI / 2; dash.position.set(-6.3 + dl * 1.3, 0.002, 2.25); g.add(dash)
    }
    /* landscaped strip behind the campus for depth */
    var lawn = new T.Mesh(new T.PlaneGeometry(12.6, 0.9), new T.MeshStandardMaterial({ color: 0x122019, roughness: 1 }))
    lawn.rotation.x = -Math.PI / 2; lawn.position.set(0.2, -0.008, -2.4); lawn.receiveShadow = true; g.add(lawn)
    /* concrete expansion joints (subtle darker seams gridding the apron) */
    var jointMat = new T.MeshBasicMaterial({ color: 0x121A26, transparent: true, opacity: 0.55 })
    for (var jz = 0; jz < 4; jz++) { var jl = new T.Mesh(new T.PlaneGeometry(12.4, 0.03), jointMat); jl.rotation.x = -Math.PI / 2; jl.position.set(0.2, 0.0006, -2.0 + jz * 1.35); g.add(jl) }
    for (var jx = 0; jx < 7; jx++) { var jc = new T.Mesh(new T.PlaneGeometry(0.03, 5.4), jointMat); jc.rotation.x = -Math.PI / 2; jc.position.set(-5.6 + jx * 1.72, 0.0006, 0.05); g.add(jc) }
    /* painted parking bays, front-left corner of the apron */
    var lineMat = new T.MeshBasicMaterial({ color: 0x8B97AB })
    for (var pk = 0; pk < 6; pk++) { var pl = new T.Mesh(new T.PlaneGeometry(0.045, 1.0), lineMat); pl.rotation.x = -Math.PI / 2; pl.position.set(-5.4 + pk * 0.62, 0.0012, 1.15); g.add(pl) }
    var pbCap = new T.Mesh(new T.PlaneGeometry(3.15, 0.045), lineMat); pbCap.rotation.x = -Math.PI / 2; pbCap.position.set(-4.47, 0.0012, 0.66); g.add(pbCap)
    /* landscaping trees along the rear lawn (two-tier conifers, they cast shadows) */
    function tree(x, z, s) {
      var tg = new T.Group(); tg.userData.ph = Math.random() * 6.283; trees.push(tg)
      var trunk = new T.Mesh(new T.CylinderGeometry(0.05 * s, 0.07 * s, 0.5 * s, 6), new T.MeshStandardMaterial({ color: 0x4A3A2E, roughness: 1 })); trunk.position.y = 0.25 * s; trunk.castShadow = true; tg.add(trunk)
      var f1 = new T.Mesh(new T.ConeGeometry(0.42 * s, 0.95 * s, 7), new T.MeshStandardMaterial({ color: 0x24513A, roughness: 1 })); f1.position.y = 0.78 * s; f1.castShadow = true; tg.add(f1)
      var f2 = new T.Mesh(new T.ConeGeometry(0.31 * s, 0.66 * s, 7), new T.MeshStandardMaterial({ color: 0x2E6247, roughness: 1 })); f2.position.y = 1.12 * s; f2.castShadow = true; tg.add(f2)
      tg.position.set(x, 0, z); g.add(tg)
    }
    ;[[-5.3, -2.45, 1.05], [-3.5, -2.55, 0.85], [1.0, -2.5, 0.8], [3.6, -2.55, 0.92], [5.4, -2.45, 1.08]].forEach(function (tp) { tree(tp[0], tp[1], tp[2]) })
    /* campus: fab, tower, dry hall, chiller yard, stacks */
    var fab = bx(3.0, 1.0, 1.8, 0xE8EDF4); fab.position.set(-3.6, 0.5, -0.4); g.add(fab)
    var band = bx(3.04, 0.1, 1.84, 0xC22730); band.position.set(-3.6, 0.82, -0.4); g.add(band)
    var pent = bx(1.3, 0.35, 1.0, 0xD5DCE6); pent.position.set(-3.9, 1.18, -0.4); g.add(pent)
    for (var i = 0; i < 3; i++) { var ru = bx(0.34, 0.22, 0.34, 0xB9C2CE); ru.position.set(-4.3 + i * 0.6, 1.11, -0.4); g.add(ru) }
    var hq = bx(1.7, 1.9, 1.3, 0xDDE3EB); hq.position.set(-0.5, 0.95, -0.9); g.add(hq)
    var hqTrim = bx(1.74, 0.08, 1.34, 0xC22730); hqTrim.position.set(-0.5, 1.94, -0.9); g.add(hqTrim)
    /* IAQ sign on the tower crown */
    var signBack = bx(1.5, 0.58, 0.07, 0xFFFFFF, { rough: 0.25 }); signBack.position.set(-0.5, 1.56, -0.22); g.add(signBack)
    new T.TextureLoader().load('/assets/iaq-logo.webp', function (tex) {
      if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace
      tex.anisotropy = 8
      var sm = new T.MeshBasicMaterial({ map: tex, transparent: true })
      var sp = new T.Mesh(new T.PlaneGeometry(1.16, 0.48), sm); sp.position.set(-0.5, 1.56, -0.178); g.add(sp)
    })
    for (var w = 0; w < 4; w++) { var win = bx(1.72, 0.02, 1.32, 0x39424F, { rough: 0.4 }); win.position.set(-0.5, 0.42 + w * 0.42, -0.9); g.add(win) }
    var hall = bx(3.4, 0.8, 1.6, 0xE8EDF4); hall.position.set(2.9, 0.4, -0.2); g.add(hall)
    for (var r2 = 0; r2 < 8; r2++) { var rib = bx(0.06, 0.06, 1.66, 0xC7CFDA); rib.position.set(1.45 + r2 * 0.42, 0.83, -0.2); g.add(rib) }
    var dock = bx(0.5, 0.4, 0.9, 0xD5DCE6); dock.position.set(4.85, 0.2, -0.2); g.add(dock)
    /* chiller yard */
    var plinth = bx(2.2, 0.12, 1.1, 0x39424F); plinth.position.set(0.9, 0.06, 1.15); g.add(plinth)
    for (var c2 = 0; c2 < 3; c2++) {
      var ch = bx(0.58, 0.42, 0.5, 0xCBD4DF); ch.position.set(0.25 + c2 * 0.66, 0.35, 1.15); g.add(ch)
      /* the fan sits INSIDE the unit: only a recessed dark intake with louvres shows on top */
      var gr = bx(0.34, 0.015, 0.34, 0x141B27, { rough: 0.9 }); gr.position.set(0.25 + c2 * 0.66, 0.563, 1.15); gr.castShadow = false; g.add(gr)
      for (var gb = 0; gb < 4; gb++) { var lv = bx(0.30, 0.008, 0.04, 0x2A3546); lv.position.set(0.25 + c2 * 0.66, 0.572, 1.024 + gb * 0.084); lv.castShadow = false; g.add(lv) }
      var pn = bx(0.09, 0.24, 0.36, 0xC22730); pn.position.set(0.52 + c2 * 0.66, 0.28, 1.15); g.add(pn)
    }
    var run = cl(0.045, 1.9, 0xC22730); run.rotation.z = Math.PI / 2; run.position.set(0.9, 0.2, 1.72); g.add(run)
    /* stacks with aviation beacons */
    ;[[-2.1, 1.6, -1.1], [3.9, 1.3, -1.0]].forEach(function (sp) {
      var stk = cl(0.09, sp[1], 0xC7CFDA); stk.position.set(sp[0], sp[1] / 2, sp[2]); g.add(stk)
      var bcn = new T.Mesh(new T.SphereGeometry(0.05, 10, 10), new T.MeshBasicMaterial({ color: 0xFF3B44, transparent: true }))
      bcn.position.set(sp[0], sp[1] + 0.06, sp[2]); g.add(bcn); beacons.push(bcn)
    })
    /* drifting dust in the sky */
    var dn = 140, dp = new Float32Array(dn * 3)
    for (var di = 0; di < dn; di++) { dp[di * 3] = (Math.random() - 0.5) * 26; dp[di * 3 + 1] = 1.5 + Math.random() * 6; dp[di * 3 + 2] = -6 + Math.random() * 10 }
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3))
    var dm = new T.PointsMaterial({ color: 0x9FB4D8, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false })
    dust = new T.Points(dg, dm); g.add(dust)
    /* a little site truck looping the front road */
    truck = new T.Group()
    var chas = bx(0.95, 0.05, 0.28, 0x1A2233); chas.position.set(0.05, 0.105, 0); truck.add(chas)
    var cab = bx(0.24, 0.26, 0.30, 0xC22730); cab.position.set(0.46, 0.27, 0); truck.add(cab)
    var wind = bx(0.02, 0.10, 0.24, 0x0E1622, { rough: 0.25 }); wind.position.set(0.585, 0.315, 0); truck.add(wind)
    var grille = bx(0.02, 0.07, 0.26, 0x39424F); grille.position.set(0.585, 0.185, 0); truck.add(grille)
    var boxT = bx(0.62, 0.36, 0.34, 0xE8EDF4); boxT.position.set(-0.12, 0.33, 0); truck.add(boxT)
    var bandT = bx(0.625, 0.07, 0.345, 0xC22730); bandT.position.set(-0.12, 0.245, 0); truck.add(bandT)
    ;[0.46, -0.02, -0.36].forEach(function (ax) {
      for (var side = 0; side < 2; side++) {
        var wh = cl(0.07, 0.06, 0x0D1420); wh.rotation.x = Math.PI / 2
        wh.position.set(ax, 0.07, side ? 0.17 : -0.17); truck.add(wh)
      }
    })
    /* the truck is the only moving caster: drop its shadow so the static shadow map can be baked once */
    truck.traverse(function (n) { if (n.isMesh) n.castShadow = false })
    truck.position.set(-9, 0, 2.4); g.add(truck)
    /* red site bollards along the front kerb */
    for (var b2 = 0; b2 < 9; b2++) { var bd = cl(0.035, 0.17, 0xC22730); bd.position.set(-5.4 + b2 * 1.4, 0.085, 2.72); g.add(bd) }
    /* parked cars in the painted bays: static, so their shadows bake with the site */
    function car(x, c) {
      var cg = new T.Group()
      var bd2 = bx(0.24, 0.09, 0.5, c); bd2.position.y = 0.095; cg.add(bd2)
      var cab2 = bx(0.20, 0.085, 0.26, 0x11192A, { rough: 0.3 }); cab2.position.set(0, 0.175, -0.02); cg.add(cab2)
      for (var cw = 0; cw < 4; cw++) {
        var wh2 = cl(0.045, 0.04, 0x0D1420); wh2.rotation.z = Math.PI / 2
        wh2.position.set(cw % 2 ? 0.115 : -0.115, 0.045, cw < 2 ? 0.16 : -0.16); cg.add(wh2)
      }
      cg.position.set(x, 0, 1.12); g.add(cg)
    }
    car(-5.09, 0x9AA6B6); car(-3.85, 0x3A4557); car(-2.61, 0x7E1F27)
    resize(); window.addEventListener('resize', resize)
    if (window.ResizeObserver) { try { ro = new ResizeObserver(resize); ro.observe(host); ro.observe(canvas) } catch (e) {} }
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect()
      pxt = ((e.clientX - r.left) / r.width - 0.5); pyt = ((e.clientY - r.top) / r.height - 0.5)
    }, { passive: true })
    host.addEventListener('pointerleave', function () { pxt = 0; pyt = 0 })
    renderer.render(scene, camera)
    /* bake the static shadow map once, then stop re-rendering it every frame */
    renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera); renderer.shadowMap.autoUpdate = false
    if (reduce) return
    /* run immediately; the observer only pauses the loop when the footer is far offscreen */
    visb = true; raf = requestAnimationFrame(frame)
    /* watchdog: if rAF is being throttled by the embedder, step the scene on a timer */
    wd = setInterval(function () {
      if (document.hidden || !visb) return
      if (performance.now() - lastF > 700) { try { frame(performance.now()) } catch (e) {} }
    }, 350)
    if (window.IntersectionObserver) {
      try {
        io = new IntersectionObserver(function (es) {
          visb = es[0].isIntersecting
          if (visb) { if (!raf) raf = requestAnimationFrame(frame) } else if (raf) { cancelAnimationFrame(raf); raf = null }
        }, { rootMargin: '200px' })
        io.observe(host)
      } catch (e) { visb = true; if (!raf) raf = requestAnimationFrame(frame) }
    }
  }
  var lastF = 0
  function frame(ts) {
    if (dead) { raf = null; return }
    raf = requestAnimationFrame(frame); lastF = performance.now(); if (!visb) return
    var t = ts || 0
    px += (pxt - px) * 0.05; py += (pyt - py) * 0.05
    /* orbit AROUND the campus centre (CX) with a gentle idle swing */
    var CX = 0.3 /* campus bounding-box centre in x */
    var a = px * 0.32 + Math.sin(t * 0.00005) * 0.12
    var mob = canvas.clientWidth < 720
    var camR = mob ? 17.4 : 6.4, camH = (mob ? 4.6 : 3.0) + py * 0.8
    camera.position.set(CX + Math.sin(a) * camR * 0.55, camH, Math.cos(a) * camR * 0.8 + 2.6)
    camera.lookAt(CX + px * 0.5, mob ? 0.7 : 0.35, 0)
    beacons.forEach(function (b3, bi) { b3.material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0018 + bi * 1.7)) })
    if (truck) { var tp = ((t * 0.00006) % 1); truck.position.x = -10 + tp * 20 }
    if (dust) { dust.rotation.y = t * 0.000012 }
    /* a light wind: each tree sways on its own phase */
    for (var tw = 0; tw < trees.length; tw++) {
      var tg2 = trees[tw]
      tg2.rotation.z = Math.sin(t * 0.0011 + tg2.userData.ph) * 0.024
      tg2.rotation.x = Math.sin(t * 0.0009 + tg2.userData.ph * 1.7) * 0.014
    }
    if (starMat) { starMat.opacity = 0.68 + 0.22 * Math.sin(t * 0.0009) }
    if (clouds) { for (var ck = 0; ck < clouds.length; ck++) { var ccl = clouds[ck]; ccl.position.x += ccl.userData.sp * 0.003; if (ccl.position.x > 22) ccl.position.x = -22 } }
    renderer.render(scene, camera)
  }
  function resize() {
    if (!renderer || dead) return
    var cr = canvas.getBoundingClientRect()
    var w = Math.round(cr.width) || host.clientWidth || 600, h = Math.round(cr.height) || host.clientHeight || 500
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    var mob = w < 720
    camera.position.set(0.3, mob ? 4.6 : 3.0, mob ? 17.4 : 7.7); camera.lookAt(0.3, mob ? 0.7 : 0.35, 0)
    renderer.render(scene, camera)
  }
  try { init(THREE_MOD) } catch (err) {}
  return function cleanup() {
    dead = true
    if (raf) { cancelAnimationFrame(raf); raf = null }
    if (wd) clearInterval(wd)
    if (io) io.disconnect()
    if (ro) ro.disconnect()
    window.removeEventListener('resize', resize)
    if (renderer) { renderer.dispose(); try { renderer.forceContextLoss() } catch (_) {} }
  }
}

/* ============ registry: search + collapsible filter console + FLIP grid ============ */
export default function initProjectsPage(opts) {
  var navigate = (opts && opts.navigate) || function (u) { window.location.href = u }
  var state = { ind: new Set(), region: new Set(), type: new Set(), q: '', sort: 'default' }
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var FACETS = [['fIndustry', 'ind'], ['fRegion', 'region'], ['fType', 'type']]
  var flipTid = null

  function chipRow(mount, items, key) {
    var el = document.getElementById(mount)
    items.forEach(function (it) {
      var b = document.createElement('button')
      b.type = 'button'; b.className = 'fchip'; b.dataset.v = it[0]
      b.innerHTML = '<span class="lb">' + it[1] + '</span><span class="ct">0</span>'
      b.setAttribute('aria-pressed', 'false')
      b.addEventListener('click', function () {
        if (state[key].has(it[0])) { state[key].delete(it[0]); b.classList.remove('on'); b.setAttribute('aria-pressed', 'false') }
        else { state[key].add(it[0]); b.classList.add('on'); b.setAttribute('aria-pressed', 'true') }
        if (b.animate && !REDUCED) b.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' })
        render()
      })
      el.appendChild(b)
    })
  }
  chipRow('fIndustry', INDUSTRIES, 'ind')
  chipRow('fRegion', REGIONS, 'region')
  chipRow('fType', TYPES, 'type')

  /* collapsible filter panel: closed by default, the Filter button expands it */
  var consoleEl = document.getElementById('console'), fbtn = document.getElementById('fbtn'), fcount = document.getElementById('fcount')
  fbtn.addEventListener('click', function () {
    var open = consoleEl.classList.toggle('fopen')
    fbtn.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
  function updateFcount() {
    var n = state.ind.size + state.region.size + state.type.size
    fcount.textContent = n; fcount.hidden = n === 0
  }

  function matchQ(p) {
    if (!state.q) return true
    var h = (p.name + ' ' + p.client + ' ' + p.loc + ' ' + INDLBL[p.ind] + ' ' + TYPLBL[p.type] + ' ' + p.iso).toLowerCase()
    return h.indexOf(state.q) >= 0
  }
  function pass(p) {
    if (state.ind.size && !state.ind.has(p.ind)) return false
    if (state.region.size && !state.region.has(p.region)) return false
    if (state.type.size && !state.type.has(p.type)) return false
    return matchQ(p)
  }
  /* count for a chip: items passing every OTHER active facet plus search */
  function passExcept(p, skip) {
    if (skip !== 'ind' && state.ind.size && !state.ind.has(p.ind)) return false
    if (skip !== 'region' && state.region.size && !state.region.has(p.region)) return false
    if (skip !== 'type' && state.type.size && !state.type.has(p.type)) return false
    return matchQ(p)
  }
  function updateCounts() {
    FACETS.forEach(function (f) {
      document.querySelectorAll('#' + f[0] + ' .fchip').forEach(function (ch) {
        var n = 0, v = ch.dataset.v
        PROJECTS.forEach(function (p) { if (p[f[1]] === v && passExcept(p, f[1])) n++ })
        ch.querySelector('.ct').textContent = n
        ch.classList.toggle('zero', n === 0 && !ch.classList.contains('on'))
      })
    })
  }
  document.getElementById('reg').addEventListener('click', function (e) {
    var c = e.target.closest('.pc'); if (!c) return
    navigate('/projects/' + c.dataset.key)
  })
  var lastCount = -1
  function render() {
    var list = PROJECTS.filter(pass)
    if (state.sort === 'az') list.sort(function (a, b) { return a.name.localeCompare(b.name) })
    else if (state.sort === 'industry') list.sort(function (a, b) { return a.ind.localeCompare(b.ind) })
    else if (state.sort === 'size') list.sort(function (a, b) { return b.size - a.size })
    var reg = document.getElementById('reg')

    /* FLIP: record old positions keyed by data-key before mutating */
    var oldRects = {}
    if (!REDUCED) {
      reg.querySelectorAll('.pc').forEach(function (el) { oldRects[el.dataset.key] = el.getBoundingClientRect() })
    }

    reg.innerHTML = list.map(function (p) {
      var idx = PROJECTS.indexOf(p)
      /* whole card links to its case page */
      var vis = p.img
        ? '<div class="pcv photo"><div class="clip"><img src="' + p.img + '" alt="' + p.client + ' project" loading="lazy"></div><span class="ph-cap">' + (p.cap || 'Site photo') + '</span>' + '</div>'
        : '<div class="pcv"><div class="grid-bg"></div><span class="ph-ico">' + (ICONS[p.ind] || '') + '</span><span class="ph-cap">' + INDLBL[p.ind] + ' &middot; photo at production</span>' + '</div>'
      return '<article class="pc" data-key="' + idx + '">' + vis + '<div class="pc-in"><div class="ref"><span>IAQ-PRJ-' + String(idx + 1).padStart(3, '0') + '</span><span class="iso">' + p.iso + '</span></div>' +
        '<h3>' + p.name + '</h3><div class="cl">' + (CLOGOS[p.client] ? '<img src="' + CLOGOS[p.client] + '" alt="' + p.client + '" loading="lazy">' : p.client) + '</div>' +
        '<div class="meta"><span>' + p.loc + '</span>' + (p.size ? '<span>' + p.size.toLocaleString('en-US') + ' m²</span>' : '') + '</div>' +
        '<div class="tags"><span class="tag b">' + INDLBL[p.ind] + '</span><span class="tag">' + REGLBL[p.region] + '</span><span class="tag">' + TYPLBL[p.type] + '</span></div></div></article>'
    }).join('')

    if (!REDUCED) {
      var cards = reg.querySelectorAll('.pc'), fresh = 0, moves = [], enters = []
      cards.forEach(function (el) {
        var k = el.dataset.key
        if (oldRects[k]) {
          var nr = el.getBoundingClientRect()
          var dx = oldRects[k].left - nr.left, dy = oldRects[k].top - nr.top
          if (dx || dy) {
            el.style.transition = 'none'
            el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'
            moves.push(el)
          }
        } else {
          el.style.transition = 'none'
          el.style.opacity = '0'
          el.style.transform = 'translateY(14px)'
          enters.push([el, Math.min(fresh, 10) * 22])
          fresh++
        }
      })
      if (moves.length || enters.length) {
        void reg.offsetHeight /* force reflow so the inverted state paints */
        moves.forEach(function (el) {
          el.style.transition = 'transform .32s cubic-bezier(.22,1,.36,1)'
          el.style.transform = ''
        })
        enters.forEach(function (en) {
          en[0].style.transition = 'opacity .38s cubic-bezier(.22,1,.36,1) ' + en[1] + 'ms,transform .38s cubic-bezier(.22,1,.36,1) ' + en[1] + 'ms'
          en[0].style.opacity = ''
          en[0].style.transform = ''
        })
        flipTid = setTimeout(function () { cards.forEach(function (el) { el.style.transition = ''; el.style.transform = ''; el.style.opacity = '' }) }, 700)
      }
    }

    document.getElementById('empty').classList.toggle('show', !list.length)
    var ro = document.getElementById('readout')
    if (list.length !== lastCount) {
      ro.innerHTML = '<span class="rn">' + list.length + '</span> / ' + PROJECTS.length + ' projects'
      if (!REDUCED) { var rn = ro.querySelector('.rn'); void rn.offsetWidth; rn.classList.add('tick') }
      lastCount = list.length
    }
    updateCounts()
    updateFcount()
  }
  document.getElementById('q').addEventListener('input', function () { state.q = this.value.trim().toLowerCase(); render() })
  document.querySelectorAll('#sortSeg .ss').forEach(function (b) {
    b.addEventListener('click', function () {
      state.sort = b.dataset.v
      document.querySelectorAll('#sortSeg .ss').forEach(function (x) { x.classList.toggle('on', x === b) })
      render()
    })
  })
  document.getElementById('clear').addEventListener('click', function () {
    state.ind.clear(); state.region.clear(); state.type.clear(); state.q = ''; state.sort = 'default'
    document.getElementById('q').value = ''; document.querySelectorAll('#sortSeg .ss').forEach(function (x) { x.classList.toggle('on', x.dataset.v === 'default') })
    document.querySelectorAll('.fchip.on').forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false') })
    render()
  })

  /* deep-link: index industry cards land pre-filtered (…/projects#semiconductor);
     universal search lands with #q=<term>: prefill and run the registry search */
  ;(function () {
    var h = window.location.hash.replace('#', '')
    window.__usApplyQ = function (q) {
      state.q = q.toLowerCase()
      document.getElementById('q').value = q
      render()
    }
    if (h.indexOf('q=') === 0) { window.__usApplyQ(decodeURIComponent(h.slice(2))); return }
    if (h && INDLBL[h]) {
      state.ind.add(h)
      var c = document.querySelector('#fIndustry .fchip[data-v="' + h + '"]')
      if (c) { c.classList.add('on'); c.setAttribute('aria-pressed', 'true') }
      /* show the preset chip: land with the filter panel already open */
      consoleEl.classList.add('fopen')
      fbtn.setAttribute('aria-expanded', 'true')
    }
  })()
  render()

  var cleanCampus = initCampus()

  return function cleanup() {
    delete window.__usApplyQ
    if (flipTid) clearTimeout(flipTid)
    cleanCampus()
  }
}
