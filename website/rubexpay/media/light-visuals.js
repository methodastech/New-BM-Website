/* ============================================================================
   light-visuals.js — tiny vanilla driver for the CSS/SVG visuals that replaced
   the home-page WebGL scenes. No dependencies.
     1) Pauses each visual's CSS animations while it is scrolled off-screen
        (IntersectionObserver toggles .is-paused).
     2) Adds a frame-coalesced pointer-tilt to the platform core (.plat-iso),
        skipped on coarse pointers / reduced-motion. rAF runs only while the
        pointer is moving, then idles.
   ============================================================================ */
(function () {
  'use strict';

  // 1) offscreen pause for every light visual
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-paused', !e.isIntersecting);
      });
    }, { threshold: 0.02 });
    document.querySelectorAll('.plat-iso, .tns3').forEach(function (el) { io.observe(el); });
  }

  // 2) pointer-tilt for the platform core
  var iso = document.querySelector('.plat-iso');
  if (!iso) return;
  var stage = iso.querySelector('.pi-stage');
  if (!stage) return;

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  if (reduce || coarse) return; // idle CSS motion only

  var sec = iso.closest('section') || iso;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

  function loop() {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    stage.style.transform = 'rotateX(' + (cy * -8).toFixed(2) + 'deg) rotateY(' + (cx * 11).toFixed(2) + 'deg)';
    if (Math.abs(tx - cx) > 0.0009 || Math.abs(ty - cy) > 0.0009) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
    }
  }

  sec.addEventListener('pointermove', function (e) {
    var r = sec.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  sec.addEventListener('pointerleave', function () {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
})();
