/* ==========================================================================
   Inner pages (calendar, standings, teams, race): Lenis smooth scroll on the
   GSAP clock, masked heading reveals, staggered reveals for content that is
   rendered after data arrives. Page scripts call Page.reveal(root).
   ========================================================================== */
(() => {
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce) {
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80, duration: 1.4 }); }
    }));
  }

  // split headings into masked words (keeps <em>)
  const split = (el) => {
    if (el.dataset.splitDone) return;
    const out = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => { if (t) out.push(/^\s+$/.test(t) ? ' ' : `<span class="w"><span class="wi">${t}</span></span>`); });
      else out.push(`<span class="w"><span class="wi">${n.outerHTML}</span></span>`);
    });
    el.innerHTML = out.join('');
    el.dataset.splitDone = '1';
  };

  const Page = {
    reveal(root = document) {
      if (reduce) return;
      $$('[data-split]', root).forEach((h) => {
        split(h);
        gsap.fromTo(h.querySelectorAll('.wi'), { yPercent: 110 }, {
          yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
          scrollTrigger: { trigger: h, start: 'top 90%', once: true },
        });
      });
      $$('[data-reveal]:not([data-revealed])', root).forEach((el) => {
        el.dataset.revealed = '1';
        const kids = el.dataset.reveal === 'children' ? [...el.children] : [el];
        gsap.fromTo(kids, { y: 36, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });
      ScrollTrigger.refresh();
    },
  };
  window.Page = Page;
  Page.reveal();

  // a failed fetch shouldn't leave a page blank
  Page.error = (el, msg = 'Live data is unavailable right now. Please try again in a moment.') => {
    el.innerHTML = `<p class="state mono">${msg}</p>`;
  };
})();
