/* ===========================================================================
   perf-guard.js  —  load FIRST in <head>, before any WebGL/canvas scene.

   Non-destructive, global. It does not remove a single visual. It makes the
   page light by killing GPU work the user can't see:

   1) Caps devicePixelRatio so every canvas/WebGL scene renders at most 1x
      (on a retina screen the default 2x means 4x the pixels per frame).
   2) Skips the real draw calls of any WebGL canvas that is scrolled off-screen
      or whenever the tab is hidden. The animation loop still ticks (cheap JS),
      but the expensive rasterisation stops. Multiple stacked 3D scenes no
      longer all render at once — only the one you're looking at does.
   ========================================================================= */
(function () {
  'use strict';

  /* 1) Cap pixel ratio ---------------------------------------------------- */
  try {
    var real = window.devicePixelRatio || 1;
    var capped = Math.min(real, 1);
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: function () { return capped; },
      set: function () {}
    });
  } catch (e) {}

  /* 2) Skip GPU draws for off-screen / hidden canvases -------------------- */
  // One viewport check per canvas per frame, cached by a frame counter so we
  // don't call getBoundingClientRect once per draw call.
  var frame = 0;
  var cache = new WeakMap(); // canvas -> { f: frame, off: bool }

  function isOff(cv) {
    // Note: hidden tabs are already throttled to ~0fps by the browser, so we
    // only gate on viewport position here — that's the real saving (stacked
    // 3D scenes no longer all rasterise when scrolled out of view).
    if (!cv || typeof cv.getBoundingClientRect !== 'function') return false;
    var c = cache.get(cv);
    if (c && c.f === frame) return c.off;
    var off = false;
    try {
      var r = cv.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var vw = window.innerWidth || document.documentElement.clientWidth;
      off = (r.bottom < -120) || (r.top > vh + 120) ||
            (r.right < -120) || (r.left > vw + 120) ||
            (r.width === 0 && r.height === 0);
    } catch (e) { off = false; }
    cache.set(cv, { f: frame, off: off });
    return off;
  }

  // Tick the frame counter once per real animation frame.
  var rAF = window.requestAnimationFrame;
  if (rAF) {
    (function tick() {
      frame++;
      rAF.call(window, tick);
    })();
  }

  var METHODS = ['drawElements', 'drawArrays',
                 'drawElementsInstanced', 'drawArraysInstanced',
                 'drawElementsInstancedANGLE', 'drawArraysInstancedANGLE'];

  [window.WebGLRenderingContext, window.WebGL2RenderingContext].forEach(function (GL) {
    if (!GL || !GL.prototype) return;
    METHODS.forEach(function (m) {
      var orig = GL.prototype[m];
      if (typeof orig !== 'function') return;
      GL.prototype[m] = function () {
        var cv = this.canvas;
        if (cv && isOff(cv)) return;      // not visible -> don't pay for it
        return orig.apply(this, arguments);
      };
    });
  });
})();

/* 3) Scroll-light flag ---------------------------------------------------
   Post-processing bloom is a multi-pass blur that is very expensive per frame.
   During an active scroll gesture we set window.__rbxScrolling=true so the
   heavy WebGL heroes can drop bloom for that gesture (scene still renders,
   just cheaper), which keeps scrolling buttery. Cleared ~160ms after the last
   scroll event. */
(function () {
  var tmr = null;
  window.__rbxScrolling = false;
  addEventListener('scroll', function () {
    window.__rbxScrolling = true;
    if (tmr) clearTimeout(tmr);
    tmr = setTimeout(function () { window.__rbxScrolling = false; }, 160);
  }, { passive: true });
})();
