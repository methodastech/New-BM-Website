/* RubexPay — decode / decrypt-on-scroll for [data-decode] mono labels.
   Sci-fi "coding terminal" feel: each char cycles random glyphs then settles, L-to-R, as the
   element scrolls into view. Real text stays in the DOM (visible, selectable, accessible, SEO,
   and i18n-translatable) — this is a pure visual enhancement that no-ops if anything is missing. */
(function () {
  'use strict';
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var REDUCE  = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* .eyebrow labels render clean (no scramble) per design call; decode still applies to other [data-decode] sub-labels */
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-decode]:not(.eyebrow)'));
  if (!nodes.length || !hasGSAP || REDUCE) return; // DOM already shows the final text

  gsap.registerPlugin(ScrollTrigger);

  var GLYPHS = '0123456789ABCDEF<>/\\[]{}=+*^?#$%&ABCDEFGHJKLMNPQRSTUVWXYZ__';
  function rnd() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
  function esc(c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : c; }

  function build(el) {
    var speed   = parseFloat(el.dataset.decodeSpeed)   || 26; // ms / glyph swap
    var stagger = parseFloat(el.dataset.decodeStagger) || 42; // ms / char (L-to-R sweep)
    var finalText, n, revealAt, last, total, raf = null, t0 = 0, lastSwap = 0, run = false, lastHtml = '';

    function frame(ts) {
      if (!run) return; if (!t0) t0 = ts;
      var el2 = ts - t0, swap = (ts - lastSwap) >= speed; if (swap) lastSwap = ts;
      var html = '', settled = 0;
      for (var i = 0; i < n; i++) {
        var ch = finalText[i];
        if (ch === ' ') { html += ' '; settled++; continue; }
        if (el2 >= revealAt[i] + speed * 3) { html += esc(ch); settled++; }
        else { if (swap || last[i] === undefined) last[i] = rnd(); html += '<span class="dcd-g">' + esc(last[i]) + '</span>'; }
      }
      /* only touch the DOM when the string actually changed — an every-frame innerHTML write
         invalidated layout ~60×/s per label and made scrolling stutter while labels decoded */
      if (html !== lastHtml) { el.innerHTML = html; lastHtml = html; }
      if (el2 >= total || settled === n) { el.textContent = finalText; stop(); return; }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (run) return;
      finalText = el.textContent;                 // re-read at fire time so it respects the live language (i18n)
      n = finalText.length; revealAt = []; last = new Array(n);
      for (var i = 0; i < n; i++) revealAt[i] = i * stagger;
      total = (n - 1) * stagger + speed * 6;
      run = true; t0 = 0; lastSwap = 0; lastHtml = '';
      raf = requestAnimationFrame(frame);
    }
    function stop() { run = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    return { start: start };
  }

  nodes.forEach(function (el) {
    if (!el.textContent.trim()) return;
    var s = build(el);
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: s.start });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
