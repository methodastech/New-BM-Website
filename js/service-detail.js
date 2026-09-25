/* ===== Service pages (services/*.html), ported 25 Sep 2026 from the reference build
   brandmethod-website-2026-09-25. The Brand Strategy galaxy (tools/galaxy-0924.js): a
   dependency-free 2D canvas with a perspective projection, three tilted orbits of the 112 cards of
   the Brand Strategy OS around the brand core, three beats (zero risk, planned ahead, flexible)
   that cycle every 8 s until one is clicked, drag to turn, hover for a card's name.
   Changes from the reference: the canvas is sized by CSS; the drawing works in layout px read from
   clientWidth/clientHeight, and only the bitmap follows the on-screen size (so CSS zoom on very wide
   screens and devicePixelRatio both stay sharp). No hashchange plumbing. Exits when the galaxy is
   missing, so the other four service pages load this file for nothing but a quick check. ===== */
(function () {
  'use strict';
  var host = document.getElementById('bmx-gal'), cv = document.getElementById('bmxGal');
  if (!host || !cv || !cv.getContext) return;
  var stage = host.querySelector('.bmx-gal-stage') || cv.parentNode;
  var dataEl = document.getElementById('bmxGalData'), DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!DATA || !DATA.suits) return;

  var ctx = cv.getContext('2d'), W = 0, H = 0, SC = 1, R = 0, CX = 0, CY = 0;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* the three orbits: business inside, products and services in the middle, brand outside */
  var RINGS = { 1: { r: 0.26, speed: 0.05, tilt: 0 }, 2: { r: 0.60, speed: -0.03, tilt: 0 }, 3: { r: 0.98, speed: 0.02, tilt: 0 } };
  /* TILT: a ring's screen ratio is sin(TILT); 0.62 gives 0.58, an isometric reading.
     hx/hy: the pointer, eased, turns the galaxy a little and tips it. */
  var TILT = 0.62, FOCAL = 2.6, hx = 0, hy = 0, hxT = 0, hyT = 0;
  var pts = [], suits = DATA.suits, total = 0;
  function mute(h) { h = h.replace('#', ''); var n = parseInt(h, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, m = (r + g + b) / 3, k = 0.78; return [Math.round(r * k + m * (1 - k)), Math.round(g * k + m * (1 - k)), Math.round(b * k + m * (1 - k))]; }
  (function build() {
    var byRing = { 1: [], 2: [], 3: [] };
    suits.forEach(function (s) { s.rgb = mute(s.acc); s.cards.forEach(function (c, k) { (byRing[s.ring] || byRing[3]).push({ suit: s, card: c, k: k }); }); });
    Object.keys(byRing).forEach(function (ring) {
      var arr = byRing[ring], n = arr.length;
      arr.forEach(function (it, i) {
        var a = (i / n) * Math.PI * 2, j = ((i * 7919) % 11) / 11 - 0.5;
        pts.push({ ring: +ring, a0: a, jr: j * 0.035, jy: j * 0.05, suit: it.suit, card: it.card, lit: 0, target: 0, idx: total++ });
      });
    });
    suits.forEach(function (s) { var mine = pts.filter(function (p) { return p.suit === s; }); s.mid = mine.length ? mine[Math.floor(mine.length / 2)] : null; });
  })();
  var stars = [], dust = [], i;
  for (i = 0; i < 260; i++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 1.3 + 0.3, a: Math.random() * 0.55 + 0.1, l: i % 3 });
  for (i = 0; i < 9; i++) dust.push({ x: 0.2 + Math.random() * 0.6, y: 0.25 + Math.random() * 0.5, r: 0.18 + Math.random() * 0.22, hue: i % 3, a: 0.05 + Math.random() * 0.05 });

  /* layout size from clientWidth/Height; the bitmap scale from the on-screen rect over the layout size
     (CSS zoom) times devicePixelRatio. Nothing is written back to the canvas's CSS size. */
  function size() {
    W = Math.max(1, stage.clientWidth); H = Math.max(1, stage.clientHeight);
    var r = cv.getBoundingClientRect(), zoom = r.width > 0 && cv.clientWidth > 0 ? r.width / cv.clientWidth : 1;
    SC = Math.min(2.5, Math.max(0.5, (window.devicePixelRatio || 1) * zoom));
    var bw = Math.round(W * SC), bh = Math.round(H * SC);
    if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
    var wide = W > 900; R = wide ? Math.min(W * 0.225, H * 0.5) : Math.min(W * 0.46, H * 0.9); CX = wide ? W * 0.71 : W / 2; CY = wide ? H * 0.44 : H * 0.5;
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  /* project a point on a ring: (angle, radius factor, height) -> screen, with depth */
  function project(a, rf, h, ring) {
    var x = Math.cos(a) * R * rf, z = Math.sin(a) * R * rf, y = h * R;
    var tl = TILT + hy * 0.18 + ring.tilt, cy = Math.cos(tl), sy = Math.sin(tl);
    var y2 = y * cy - z * sy, z2 = y * sy + z * cy;          /* tilt the orbit plane toward the camera */
    var sc = FOCAL * R / (FOCAL * R + z2);                 /* perspective: far side smaller */
    return { x: CX + x * sc, y: CY + y2 * sc, sc: sc, z: z2 };
  }

  /* ---- beats ---- */
  var beat = 'zero', t0 = performance.now(), dragV = 0, spin = 0, flexK = 0, flexTarget = 0, hover = null;
  var tip = document.getElementById('bmxGalTip');
  var beatBtns = [].slice.call(host.querySelectorAll('.bmx-gal-beat'));
  var auto = true, lastAuto = performance.now();
  function setBeat(b, byUser) {
    beat = b; t0 = performance.now();
    beatBtns.forEach(function (x) { var on = x.getAttribute('data-beat') === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    flexTarget = b === 'flex' ? 1 : 0;
    if (byUser) auto = false;
    if (reduce) { flexK = flexTarget; paintStill(); }
  }
  beatBtns.forEach(function (x) { x.addEventListener('click', function () { setBeat(x.getAttribute('data-beat'), true); }); });

  function updateLit(now, instant) {
    var el = (now - t0) / 1000, n = pts.length;
    if (beat === 'zero') { var sweep = Math.min(1, el / 6); pts.forEach(function (p) { p.target = p.idx / n < sweep ? 1 : 0.16; }); }
    else if (beat === 'ahead') { var prog = Math.min(1, el / 7); pts.forEach(function (p) { p.target = p.idx / n <= prog ? 1 : 0.1; }); }
    else pts.forEach(function (p) { p.target = 1; });
    pts.forEach(function (p) { p.lit = instant ? p.target : p.lit + (p.target - p.lit) * 0.08; });
  }

  function drawScene(now) {
    var el = (now - t0) / 1000, t = now / 1000;
    flexK += (flexTarget - flexK) * 0.03; spin += dragV; dragV *= 0.92; hx += (hxT - hx) * 0.05; hy += (hyT - hy) * 0.05;
    RINGS[1].tilt = flexK * 0.22; RINGS[2].tilt = -flexK * 0.16; RINGS[3].tilt = flexK * 0.1;
    ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.clearRect(0, 0, W, H);
    /* nebula: a few soft clouds, blue, violet and rose, very low, so the black stays black */
    dust.forEach(function (c, i) {
      var dx = Math.sin(t * 0.05 + i) * 0.012, g = ctx.createRadialGradient((c.x + dx) * W, c.y * H, 0, (c.x + dx) * W, c.y * H, c.r * W);
      var col = c.hue === 0 ? '37,54,245' : c.hue === 1 ? '120,80,220' : '190,70,140';
      g.addColorStop(0, 'rgba(' + col + ',' + c.a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    /* stars, three depths with a slow parallax drift */
    stars.forEach(function (s) { var px = (s.x * W + t * (2 + s.l * 2)) % W, tw = 0.75 + 0.25 * Math.sin(t * 1.3 + s.x * 40); ctx.fillStyle = 'rgba(200,210,255,' + (s.a * tw) + ')'; ctx.fillRect(px, s.y * H, s.s, s.s); });
    /* the orbit plane: a faint band of light along the middle ring */
    var band = ctx.createRadialGradient(CX, CY, R * 0.05, CX, CY, R * 1.05);
    band.addColorStop(0, 'rgba(70,90,255,.16)'); band.addColorStop(0.5, 'rgba(60,80,230,.06)'); band.addColorStop(1, 'rgba(60,80,230,0)');
    ctx.save(); ctx.translate(CX, CY); ctx.scale(1, Math.sin(TILT + hy * 0.18)); ctx.translate(-CX, -CY); ctx.fillStyle = band; ctx.fillRect(0, 0, W, H); ctx.restore();
    /* the core's light */
    var g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 0.30);
    g.addColorStop(0, 'rgba(160,175,255,.75)'); g.addColorStop(0.25, 'rgba(37,54,245,.32)'); g.addColorStop(1, 'rgba(37,54,245,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* orbits, far half first so the near half can pass in front of the core */
    var order = [];
    Object.keys(RINGS).forEach(function (k) {
      var ring = RINGS[k], seg = 160, far = [], near = [];
      for (var i = 0; i <= seg; i++) { var a = (i / seg) * Math.PI * 2, q = project(a, ring.r * (1 + flexK * (k === '1' ? 0.1 : k === '3' ? -0.04 : 0.05)), 0, ring); (q.z > 0 ? far : near).push(q); }
      ring._far = far; ring._near = near;
    });
    /* a half ring can come in two runs once the galaxy is turned; the pen lifts between them */
    function stroke(list, alpha) { if (list.length < 2) return; var gap = R * 0.35; ctx.beginPath(); list.forEach(function (q, i) { if (i === 0 || Math.hypot(q.x - list[i - 1].x, q.y - list[i - 1].y) > gap) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }); ctx.strokeStyle = 'rgba(150,165,255,' + alpha + ')'; ctx.lineWidth = 1; ctx.stroke(); }
    Object.keys(RINGS).forEach(function (k) { stroke(RINGS[k]._far, 0.10); });
    pts.forEach(function (p) {
      var ring = RINGS[p.ring], a = p.a0 + (reduce ? 0 : t * ring.speed) + spin + (p.ring === 3 ? flexK * 0.5 : p.ring === 1 ? -flexK * 0.4 : 0);
      var rf = ring.r * (1 + p.jr) * (1 + flexK * (p.ring === 1 ? 0.1 : p.ring === 3 ? -0.04 : 0.05));
      var q = project(a, rf, p.jy * flexK, ring);
      p.x = q.x; p.y = q.y; p.sc = q.sc; p.z = q.z; p._a = a; p._rf = rf; p._ring = ring; order.push(p);
    });
    order.sort(function (a, b) { return b.z - a.z; });   /* far to near */
    var nearDrawn = false;
    order.forEach(function (p) {
      if (!nearDrawn && p.z <= 0) { /* the core sits in the orbit plane: draw it between far and near */
        ctx.fillStyle = 'rgba(255,255,255,.98)'; ctx.beginPath(); ctx.arc(CX, CY, 4.5, 0, Math.PI * 2); ctx.fill();
        var cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 22); cg.addColorStop(0, 'rgba(255,255,255,.55)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(CX, CY, 22, 0, Math.PI * 2); ctx.fill();
        Object.keys(RINGS).forEach(function (k) { stroke(RINGS[k]._near, 0.22); });
        nearDrawn = true;
      }
      var sz = (1.1 + p.sc * 1.9) * (0.7 + p.lit * 0.5), alpha = (0.18 + p.lit * 0.7) * (0.55 + p.sc * 0.45), c = p.suit.rgb;
      if (p.lit > 0.4) { var hg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 4); hg.addColorStop(0, rgba(c, 0.28 * p.lit)); hg.addColorStop(1, rgba(c, 0)); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(p.x, p.y, sz * 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = rgba(c, alpha); ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + (0.35 * p.lit * p.sc) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, sz * 0.4, 0, Math.PI * 2); ctx.fill();
      if (p === hover) { ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, sz + 5, 0, Math.PI * 2); ctx.stroke(); }
    });
    if (!nearDrawn) Object.keys(RINGS).forEach(function (k) { stroke(RINGS[k]._near, 0.22); });
    /* the planning threads: a few lines from the core to lit cards */
    if (beat !== 'zero') { ctx.lineWidth = 1; pts.forEach(function (p, i) { if (i % 8 === 0 && p.lit > 0.6) { ctx.strokeStyle = 'rgba(150,165,255,' + (0.10 * p.sc) + ')'; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(p.x, p.y); ctx.stroke(); } }); }
    /* the audit sweep in beat one */
    if (beat === 'zero' && el < 6.2 && !reduce) { var ang = Math.min(1, el / 6) * Math.PI * 2, q = project(ang, RINGS[3].r * 1.02, 0, RINGS[3]); ctx.strokeStyle = 'rgba(120,140,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    /* suit labels: outside the ring on a short leader, on the ring's own plane */
    ctx.font = '600 10px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
    suits.forEach(function (s) { var p = s.mid; if (!p || !p._ring) return;
      var q1 = project(p._a, p._rf * 1.07, 0, p._ring), q2 = project(p._a, p._rf * 1.2, 0, p._ring), al = 0.35 + Math.max(0, p.lit) * 0.55, left = q2.x < CX;
      ctx.strokeStyle = rgba(s.rgb, al * 0.7); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
      ctx.fillStyle = rgba(s.rgb, al); ctx.textAlign = left ? 'right' : 'left'; ctx.fillText(s.short.toUpperCase().split('').join(String.fromCharCode(8202)), q2.x + (left ? -5 : 5), q2.y + 3); });
    /* the core, named */
    ctx.textAlign = 'center'; ctx.font = '400 15px Fraunces, Georgia, serif'; ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.fillText('Your brand', CX, CY + 30);
  }
  /* the edge mask: the galaxy fades into the section, no rectangle */
  function draw(now) {
    drawScene(now);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    var m = ctx.createRadialGradient(CX, CY, R * 0.55, CX, CY, Math.max(W, H) * 0.6);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.75, 'rgba(0,0,0,.55)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  /* reduced motion: one still frame, fully lit for the current beat, redrawn on resize and beat change */
  function paintStill() { var now = performance.now(); updateLit(now + 9000, true); t0 = now - 9000; draw(now); }

  var live = false, raf = null;
  function frame(now) {
    if (!live) return;
    if (auto && now - lastAuto > 8000) { lastAuto = now; setBeat(beat === 'zero' ? 'ahead' : beat === 'ahead' ? 'flex' : 'zero', false); }
    updateLit(now); draw(now); raf = requestAnimationFrame(frame);
  }
  function start() { if (live || reduce) return; size(); live = true; lastAuto = performance.now(); t0 = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { live = false; if (raf) cancelAnimationFrame(raf); }
  function resized() { size(); if (reduce || !live) paintStill(); }
  size();
  if ('ResizeObserver' in window) new ResizeObserver(resized).observe(stage); else addEventListener('resize', resized);
  if (reduce) paintStill();
  else if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.12 }).observe(host);
  else start();

  /* ---- pointer: the view leans toward it, drag turns it, hover names a card. Pointer positions
     are converted from the on-screen rect to layout px (W/H), so they hold under CSS zoom. ---- */
  function local(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / (r.width || 1)), y: (e.clientY - r.top) * (H / (r.height || 1)) }; }
  var px = null;
  cv.addEventListener('pointerdown', function (e) { px = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (err) {} auto = false; });
  cv.addEventListener('pointerup', function () { px = null; });
  cv.addEventListener('pointercancel', function () { px = null; });
  cv.addEventListener('pointermove', function (e) {
    var m = local(e);
    hxT = m.x / W - 0.5; hyT = m.y / H - 0.5;
    if (px !== null) { dragV += (e.clientX - px) * 0.0012; px = e.clientX; }
    var best = null, bd = 14;
    pts.forEach(function (p) { var d = Math.hypot(p.x - m.x, p.y - m.y); if (d < bd) { bd = d; best = p; } });
    hover = best;
    if (tip) {
      if (best) {
        tip.hidden = false; tip.textContent = '';
        var b = document.createElement('b'); b.textContent = best.card.n; tip.appendChild(b);
        if (best.card.s) { var s = document.createElement('span'); s.textContent = best.card.s; tip.appendChild(s); }
        var it = document.createElement('i'); it.textContent = best.suit.name; tip.appendChild(it);
        tip.style.left = Math.min(W - 200, m.x + 14) + 'px'; tip.style.top = Math.max(8, m.y - 10) + 'px';
      } else tip.hidden = true;
    }
    if (reduce) paintStill();
  });
  cv.addEventListener('pointerleave', function () { hxT = 0; hyT = 0; hover = null; if (tip) tip.hidden = true; px = null; if (reduce) paintStill(); });
  setBeat('zero', false);
})();
