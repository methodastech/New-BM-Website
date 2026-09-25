/* ===== Services page (services.html), ported 25 Sep 2026 from the reference build
   brandmethod-website-2026-09-25, tools/services-0924.js (the parts #pg-services uses):
   the six-phase banner, the board and its travelling marker, the phone accordion on the board,
   the "Why brand, or re-brand" bar and its trigger map flow.
   The single-page-app plumbing (hashchange routing, data-page links, the admin bar, pricing,
   drawer, FAQ) is left out. Every block exits early when its elements are missing.
   Sizes come from offsetWidth/offsetLeft (layout px), never getBoundingClientRect, so the page
   stays right when very wide screens scale it with CSS zoom. ===== */
(function () {
  'use strict';
  var root = document.getElementById('pg-services');
  if (!root) return;

  var NS = 'http://www.w3.org/2000/svg';
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var REDUCE = !!(mq && mq.matches);
  var $$ = function (sel, el) { return [].slice.call((el || root).querySelectorAll(sel)); };

  /* position of el inside ancestor, in layout px (unaffected by zoom and transforms) */
  function offsetIn(el, anc) {
    var x = 0, y = 0;
    while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x, y: y };
  }
  function scrollToEl(el) {
    if (!el) return;
    var nav = document.getElementById('nav');
    var y = offsetIn(el, null).y - (nav ? nav.offsetHeight : 0) - 18;
    window.scrollTo({ top: Math.max(0, y), behavior: REDUCE ? 'auto' : 'smooth' });
  }
  function isPhone() { return document.documentElement.clientWidth <= 640; }

  /* ---- a loop that runs only while its element is on screen ---- */
  function runLoop(el, D, step) {
    var t0 = 0, live = false, raf = null;
    function frame(now) { if (!live) return; if (!t0) t0 = now; step(((now - t0) % D) / D); raf = requestAnimationFrame(frame); }
    function start() { if (live) return; live = true; t0 = 0; raf = requestAnimationFrame(frame); }
    function stop() { live = false; if (raf) cancelAnimationFrame(raf); }
    if (REDUCE) { step(0.9); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.2 }).observe(el);
    } else start();
  }

  /* ---- the board: a tag with the phase name sits on the top edge and travels from column to
     column (1 to 6, on its own every 3.2 s, held while the pointer is on the board); the column
     under it is outlined in its colour. A click on a column, or on a banner station, sends it there. ---- */
  var board = document.getElementById('ov-board');
  if (board) (function () {
    var cols = $$('.svx-col', board); if (cols.length < 2) return;

    /* the journey: a dashed line through the six icons */
    var slots = cols.map(function (c) { return c.querySelector('.svx-col-3d'); });
    var jsvg = document.createElementNS(NS, 'svg'); jsvg.setAttribute('class', 'svx-bflow'); jsvg.setAttribute('aria-hidden', 'true');
    var jbase = document.createElementNS(NS, 'path'); jbase.setAttribute('class', 'svx-bflow-base'); jsvg.appendChild(jbase); board.appendChild(jsvg);
    function jline() {
      var bw = board.clientWidth, bh = board.clientHeight;
      if (isPhone() || bw < 10 || !slots[0]) { jsvg.style.display = 'none'; return; }
      jsvg.style.display = 'block';
      jsvg.setAttribute('viewBox', '0 0 ' + bw + ' ' + bh);
      var d = '';
      slots.forEach(function (sl, i) { if (!sl) return; var p = offsetIn(sl, board); d += (d ? ' L' : 'M') + (p.x + sl.offsetWidth * 0.5).toFixed(1) + ' ' + (p.y + sl.offsetHeight * 0.62).toFixed(1); });
      jbase.setAttribute('d', d);
    }

    var mk = document.createElement('div'); mk.className = 'svx-bmark'; mk.setAttribute('aria-hidden', 'true');
    mk.innerHTML = '<span class="svx-bmark-tag"></span><span class="svx-bmark-pin"></span>'; board.appendChild(mk);
    var tag = mk.querySelector('.svx-bmark-tag'), cur = 0, hold = false, pause = 0, timer = null;
    function go(i, byUser) {
      jline();
      cur = (i + cols.length) % cols.length;
      var c = cols[cur], t = c.querySelector('.svx-col-t'), n = c.querySelector('.svx-col-n');
      /* phones stack the columns and hide the marker, so no column carries its outline there */
      cols.forEach(function (x, k) { x.classList.toggle('mk', k === cur && !isPhone()); });
      tag.textContent = (n ? n.textContent : (cur + 1)) + ' · ' + (t ? t.textContent : '');
      var p = offsetIn(c, board);
      mk.style.left = (p.x + c.offsetWidth / 2) + 'px';
      mk.style.top = p.y + 'px';
      mk.style.setProperty('--pc', getComputedStyle(c).getPropertyValue('--pc'));
      if (byUser) pause = Date.now() + 12000;
    }
    function tick() { if (!hold && Date.now() > pause && !isPhone()) go(cur + 1); }
    function arm() { clearInterval(timer); if (!REDUCE) timer = setInterval(tick, 3200); }
    board.addEventListener('mouseenter', function () { hold = true; });
    board.addEventListener('mouseleave', function () { hold = false; });

    /* on phones the columns stack and open one at a time */
    cols.forEach(function (c, k) {
      var h = c.querySelector('.svx-col-h');
      (h || c).addEventListener('click', function () {
        if (!isPhone()) { go(k, true); return; }
        if (!h) return;
        var on = !c.classList.contains('on');
        cols.forEach(function (x) { x.classList.remove('on'); var xh = x.querySelector('.svx-col-h'); if (xh) xh.setAttribute('aria-expanded', 'false'); });
        c.classList.toggle('on', on); h.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    });

    board._go = function (i) { go(i, true); };
    go(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(cur); arm(); } else clearInterval(timer); }); }, { threshold: 0.15 }).observe(board);
    } else arm();
    var rs = null;
    addEventListener('resize', function () { clearTimeout(rs); rs = setTimeout(function () { go(cur); }, 80); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { go(cur); }).observe(board);
  })();

  /* a banner station sends the board's marker to its phase and scrolls the board into view */
  function litCol(i) {
    if (!board) return;
    var cols = $$('.svx-col', board), c = cols[i]; if (!c) return;
    cols.forEach(function (x) { x.classList.remove('lit'); });
    c.classList.add('lit'); setTimeout(function () { c.classList.remove('lit'); }, 2200);
    if (board._go) setTimeout(function () { board._go(i); }, 350);
    if (isPhone()) {
      cols.forEach(function (x) { x.classList.remove('on'); });
      c.classList.add('on');
      var h = c.querySelector('.svx-col-h'); if (h) h.setAttribute('aria-expanded', 'true');
      setTimeout(function () { scrollToEl(c); }, 60);
    } else scrollToEl(board);
  }

  /* ---- the banner: six stations on the rising dashed path. Placed in percent of the banner,
     read from the path in its own 1200 x 300 viewBox, so no measuring and no zoom trouble ---- */
  var jr = document.getElementById('svx-journey');
  if (jr) (function () {
    var jpath = jr.querySelector('.svx-jline'), jsts = $$('.svx-jst', jr), stops = [0.03, 0.22, 0.41, 0.6, 0.79, 0.97];
    var placed = false;
    function place() {
      if (placed || !jpath || !jpath.getTotalLength) return;
      var L = 0;
      try { L = jpath.getTotalLength(); } catch (e) { L = 0; }
      if (!L) return;
      jsts.forEach(function (st, i) {
        var q = jpath.getPointAtLength(L * stops[i]);
        st.style.left = (q.x / 1200 * 100).toFixed(3) + '%';
        st.style.top = (q.y / 300 * 100).toFixed(3) + '%';
      });
      placed = true;
    }
    place();
    if (!placed) addEventListener('resize', place);
    jsts.forEach(function (st) { st.addEventListener('click', function () { litCol(+st.getAttribute('data-i')); }); });
  })();

  /* ---- the trigger map: the flow lights the triggers, the problem, the six phases, the outcomes, the result ---- */
  $$('.svx-tmap[data-flow]').forEach(function (map) {
    var ins = $$('.svx-tmap-in .svx-tmap-item', map), mid = map.querySelector('.svx-tmap-mid'), ph = $$('.svx-tmap-phases > span', map),
      outs = $$('.svx-tmap-out .svx-tmap-item', map), end = map.querySelector('.svx-tmap-end'), arrows = $$('.svx-tmap-arrow', map);
    var seq = [].concat(ins, [arrows[0], mid, arrows[1]], ph, [arrows[2]], outs, [arrows[3], end]).filter(Boolean);
    var n = seq.length, was = -1;
    runLoop(map, 7500, function (f) {
      var k = f < 0.86 ? Math.floor(f / 0.86 * n) : n; if (f >= 0.96) k = 0;
      if (k === was) return;
      seq.forEach(function (el, i) {
        el.classList.toggle('on', i < k);
        if (i === k - 1 && k > was) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
      });
      was = k;
    });
  });

  /* ---- why brand, or re-brand: the bar opens and closes ---- */
  $$('.svx-why .bj2-why-wrap').forEach(function (wrap) {
    var head = wrap.querySelector('.bj2-why-toggle') || wrap.firstElementChild; if (!head) return;
    var panel = wrap.querySelector('.bj2-why-panel');
    head.setAttribute('role', 'button'); head.setAttribute('tabindex', '0'); head.setAttribute('aria-expanded', 'false');
    if (panel && panel.id) head.setAttribute('aria-controls', panel.id);
    function toggle() { var on = !wrap.classList.contains('open'); wrap.classList.toggle('open', on); head.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* ---- in-page links ("See every deliverable"): scroll without touching the hash. A hash change
     runs the page's inline router, which re-renders the page and resets its reveals. ---- */
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t || !root.contains(t)) return;
    e.preventDefault(); scrollToEl(t);
  });
  /* arriving on services.html#svx-phases: the router keeps this page and leaves the anchor here */
  if (window.__svpAnchor) {
    var anc = document.getElementById(window.__svpAnchor); window.__svpAnchor = null;
    if (anc && root.contains(anc)) addEventListener('load', function () { setTimeout(function () { scrollToEl(anc); }, 150); });
  }
})();
