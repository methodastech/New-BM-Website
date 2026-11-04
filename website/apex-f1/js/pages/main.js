/* ==========================================================================
   APEX — The 2026 Grid
   Stack: Lenis (smooth scroll) driven by the GSAP ticker, ScrollTrigger for
   scrubbed / pinned motion, a 2D canvas for velocity-reactive speed streaks.
   One clock for everything.
   ========================================================================== */
(() => {
  document.documentElement.classList.remove('no-js');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- data: the grid ---------- */
  const TEAMS = [
    ['mclaren', 'McLaren', 'Norris · Piastri', '#ff8000'],
    ['ferrari', 'Ferrari', 'Leclerc · Hamilton', '#e10600'],
    ['mercedes', 'Mercedes', 'Russell · Antonelli', '#00d2be'],
    ['redbull', 'Red Bull Racing', 'Verstappen · Hadjar', '#3671c6'],
    ['williams', 'Williams', 'Albon · Sainz', '#1868db'],
    ['racingbulls', 'Racing Bulls', 'Lawson · Lindblad', '#6692ff'],
    ['astonmartin', 'Aston Martin', 'Alonso · Stroll', '#229971'],
    ['haas', 'Haas', 'Ocon · Bearman', '#b6babd'],
    ['audi', 'Audi', 'Hülkenberg · Bortoleto', '#ff2d00'],
    ['alpine', 'Alpine', 'Gasly · Colapinto', '#ff87bc'],
    ['cadillac', 'Cadillac', 'Pérez · Bottas', '#c9b27c'],
  ];
  $('.grid__track').innerHTML = TEAMS.map(([file, team, drivers, color], i) => `
    <article class="card" style="--team:${color}">
      <span class="card__idx mono">${String(i + 1).padStart(2, '0')}</span>
      <div class="card__media"><img src="assets/helmets/${file}.webp" alt="${team} helmets — ${drivers.replace(' · ', ' and ')}" loading="lazy" decoding="async" width="960" height="1200"></div>
      <div class="card__meta"><span class="card__team">${team}</span><span class="card__drivers mono">${drivers}</span></div>
    </article>`).join('');

  /* ---------- split text into masked words (keeps <em>) ---------- */
  const splitWords = (el, cls = 'w', inner = 'wi') => {
    const out = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          out.push(/^\s+$/.test(t) ? ' ' : `<span class="${cls}"><span class="${inner}">${t}</span></span>`);
        });
      } else {
        out.push(`<span class="${cls}"><span class="${inner}">${n.outerHTML}</span></span>`);
      }
    });
    el.innerHTML = out.join('');
  };
  $$('[data-split]').forEach((el) => splitWords(el));
  const hl = $('[data-highlight]');
  hl.innerHTML = hl.textContent.trim().split(/\s+/).map((w) => `<span class="hw">${w}</span>`).join(' ');

  /* ---------- smooth scroll on the GSAP clock ---------- */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;   // the mobile menu (common.js) pauses scrolling
  }

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = a.getAttribute('href') === '#top' ? 0 : $(a.getAttribute('href'));
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 2 });
    else (target === 0 ? document.body : target).scrollIntoView();
  }));

  /* ---------- scroll velocity (feeds the streaks) ---------- */
  let velocity = 0, boost = 0, lastY = scrollY;
  gsap.ticker.add(() => {
    const raw = lenis ? lenis.velocity : scrollY - lastY;
    lastY = scrollY;
    velocity += (raw - velocity) * 0.12;
  });

  /* ---------- track progress + lap counter ---------- */
  const trackLine = $('.track__line i'), trackCar = $('.track__car'), lapEl = $('[data-lapcount]');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const p = self.progress;
      trackLine.style.transform = `scaleX(${p})`;
      const w = trackCar.parentElement.clientWidth - trackCar.clientWidth;
      trackCar.style.transform = `translateX(${p * w}px)`;
      lapEl.textContent = String(Math.min(24, 1 + Math.floor(p * 24))).padStart(2, '0');
    },
  });

  /* ==========================================================================
     MOTION (skipped entirely for prefers-reduced-motion)
     ========================================================================== */
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 901px)' }, (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return;

    /* ----- hero: pinned camera push into the car ----- */
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', pin: true, scrub: 1 },
    })
      .to('.hero__car', { scale: 1.32, yPercent: 5, opacity: 0.25, ease: 'none' }, 0)
      .to('.hero__ghost', { xPercent: -16, ease: 'none' }, 0)
      .to('.hero__copy', { yPercent: -45, autoAlpha: 0, ease: 'none' }, 0)
      .to('.hero__foot', { y: -90, autoAlpha: 0, ease: 'none' }, 0)
      .to('.hero__near', { yPercent: -35, autoAlpha: 0, ease: 'none' }, 0);

    /* ----- manifesto: words light up as you read ----- */
    gsap.fromTo('.hw', { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 50%', scrub: true },
    });

    /* ----- headings: masked word reveal ----- */
    $$('main section:not(.hero) [data-split]').forEach((h) => {
      gsap.fromTo(h.querySelectorAll('.wi'), { yPercent: 110 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: h, start: 'top 85%' },
      });
    });

    /* ----- anatomy: the car draws itself, then leaves ----- */
    const svg = $('.blueprint');
    const lines = $$('.blueprint .d:not(.stripe)');
    lines.forEach((p) => {
      const len = Math.ceil(p.getTotalLength()) + 2;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set(['.blueprint .fillable', '.blueprint .tyre'], { fillOpacity: 0 });
    gsap.set('.blueprint .stripe', { opacity: 0 });
    gsap.set('.blueprint .hub', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.callout', { autoAlpha: 0, y: 14 });

    const speed = { v: 0 }, speedEl = $('[data-speed]');
    let anatActive = false;
    const anat = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.anatomy', start: 'top top', end: '+=280%', pin: true, scrub: 1, invalidateOnRefresh: true,
        onToggle: (s) => { anatActive = s.isActive; if (!anatActive) boost = 0; },
      },
    });
    anat
      .to(lines, { strokeDashoffset: 0, duration: 1, stagger: 0.11, ease: 'power1.inOut' }, 0)
      .to('.blueprint .fillable', { fillOpacity: 1, duration: 0.9, stagger: 0.06 }, 2.4)
      .to('.blueprint .tyre', { fillOpacity: 1, duration: 0.6 }, 2.2)
      .to('.blueprint .stripe', { opacity: 1, duration: 0.5 }, 3)
      .to('.blueprint .hub', { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 3.1);
    $$('.callout').forEach((c) => {
      anat.to(c, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, parseFloat(c.dataset.at) * 5);
    });
    anat
      .to({}, { duration: 0.8 }, 3.6) // hold: let the drawing breathe
      .to('.callout', { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.05 }, 4.4)
      .to('.wheel__spin', { rotation: 360 * 7, transformOrigin: '50% 50%', duration: 2.2, ease: 'power2.in' }, 4.4)
      .to(speed, {
        v: 318, duration: 2.2, ease: 'power2.in',
        onUpdate: () => { speedEl.textContent = String(Math.round(speed.v)).padStart(3, '0'); boost = anatActive ? speed.v / 318 : 0; },
      }, 4.4)
      .to('.car-body', {
        x: () => (innerWidth / svg.getBoundingClientRect().width) * 1280 + 300,
        duration: 1.5, ease: 'power3.in',
      }, 5.1)
      .to('.bp-shadow', { opacity: 0, duration: 0.6 }, 5.8);

    /* ----- numbers: counters + rise ----- */
    gsap.from('.num', {
      y: 50, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: '.numbers__grid', start: 'top 85%' },
    });
    $$('[data-count]').forEach((el) => {
      const o = { v: 0 }, to = +el.dataset.count;
      el.textContent = '0';
      gsap.to(o, {
        v: to, duration: 2.4, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.round(o.v); },
      });
    });

    /* ----- drivers: three depth planes per driver ----- */
    $$('.driver').forEach((d) => {
      $$('[data-par]', d).forEach((el) => {
        const vh = parseFloat(el.dataset.par);
        gsap.fromTo(el, { y: () => -innerHeight * vh / 100 }, {
          y: () => innerHeight * vh / 100, ease: 'none',
          scrollTrigger: { trigger: d, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      });
      gsap.from($$('.driver__info > *', d), {
        y: 40, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: d, start: 'top 55%' },
      });
    });

    /* ----- grid: horizontal helmet gallery ----- */
    const cards = $$('.card');
    gsap.from(cards.slice(0, 4), {
      y: 80, autoAlpha: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.grid', start: 'top 70%' },
    });
    if (desktop) {
      const track = $('.grid__track'), idx = $('[data-team-index]');
      const dist = () => track.scrollWidth - innerWidth;
      const slide = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.grid', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (s) => { idx.textContent = String(1 + Math.round(s.progress * (TEAMS.length - 1))).padStart(2, '0'); },
        },
      });
      cards.forEach((card) => {
        gsap.fromTo($('img', card), { xPercent: -6 }, {
          xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        });
      });
    }

    /* ----- lights out ----- */
    const lights = $$('.light');
    const startCar = $('.start__car');
    gsap.set('.start__title .line > span', { yPercent: 110 });
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.start', start: 'top top', end: '+=240%', pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => {
          const n = s.progress >= 0.7 ? 0 : Math.min(5, Math.floor(s.progress / 0.12));
          lights.forEach((l, i) => l.classList.toggle('on', i < n));
        },
      },
    })
      .to({}, { duration: 0.7 })
      .to('.start__title .line > span', { yPercent: 0, duration: 0.12, stagger: 0.04, ease: 'power3.out' }, 0.7)
      .fromTo(startCar, { xPercent: -110, x: 0, opacity: 1 }, {
        x: () => innerWidth + startCar.getBoundingClientRect().width * 1.2, duration: 0.22, ease: 'power2.in',
      }, 0.72)
      .to({}, { duration: 0.1 }, 0.9);

    /* ----- hero mouse parallax (desktop pointer only) ----- */
    if (fine) {
      const layers = $$('.hero [data-depth]').map((el) => {
        const t = el.classList.contains('hero__car') ? $('img', el) : el;
        return {
          d: parseFloat(el.dataset.depth),
          x: gsap.quickTo(t, 'x', { duration: 1.4, ease: 'power3' }),
          y: gsap.quickTo(t, 'y', { duration: 1.4, ease: 'power3' }),
        };
      });
      const onMove = (e) => {
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        layers.forEach((l) => { l.x(-nx * l.d * 44); l.y(-ny * l.d * 26); });
      };
      addEventListener('pointermove', onMove);
      return () => removeEventListener('pointermove', onMove);
    }
  });

  /* ==========================================================================
     SPEED STREAKS — idle dust that stretches into streaks with scroll speed
     ========================================================================== */
  if (!reduce) {
    const cv = $('#streaks'), c2 = cv.getContext('2d');
    let W = 0, H = 0;
    const N = fine ? 80 : 36;
    const parts = [];
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      c2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    for (let i = 0; i < N; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, z: 0.2 + Math.random() * 0.8 });

    let boostS = 0;
    gsap.ticker.add(() => {
      boostS += (boost - boostS) * 0.06;
      const v = velocity + boostS * 36;
      const s = Math.min(Math.abs(v), 70);
      c2.clearRect(0, 0, W, H);
      c2.lineCap = 'round';
      for (const p of parts) {
        const dir = v >= 0 ? -1 : 1;
        p.x += dir * (0.25 + s * 0.9) * p.z;
        const len = 1 + s * 4 * p.z;
        if (p.x < -len - 20) { p.x = W + Math.random() * 120; p.y = Math.random() * H; }
        if (p.x > W + len + 20) { p.x = -Math.random() * 120; p.y = Math.random() * H; }
        const a = (0.04 + Math.min(1, s / 45) * 0.16) * p.z;
        c2.strokeStyle = p.z > 0.93 && s > 8 ? `rgba(225,6,0,${a * 1.6})` : `rgba(239,234,224,${a})`;
        c2.lineWidth = 0.6 + p.z * 0.8;
        c2.beginPath();
        c2.moveTo(p.x, p.y);
        c2.lineTo(p.x - dir * len, p.y);
        c2.stroke();
      }
    });
  }

  /* ==========================================================================
     LOADER → HERO ENTRANCE
     ========================================================================== */
  const loader = $('.loader');
  if (reduce) { loader.remove(); return; }

  // the pit stop plays once per visit; ?intro replays it
  const seen = (() => { try { return sessionStorage.getItem('apex:intro') === '1'; } catch (e) { return false; } })()
    && !/[?&](intro|pitdebug)\b/.test(location.search);
  const markSeen = () => { try { sessionStorage.setItem('apex:intro', '1'); } catch (e) { /* private mode */ } };

  lenis.stop();
  const heroImg = $('.hero__car img');
  const ready = Promise.all([
    heroImg.complete ? Promise.resolve() : new Promise((r) => { heroImg.onload = heroImg.onerror = r; }),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ]);

  // pitstop.js (WebGL) announces when the car has left the box; skip or a timeout also ends it
  const pitDone = new Promise((r) => {
    addEventListener('pitstop:done', r, { once: true });
    if (!location.search.includes('pitdebug')) setTimeout(r, 12000);
  });
  const skip = () => dispatchEvent(new Event('pitstop:done'));
  $('.pit__skip').addEventListener('click', skip);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') skip(); }, { once: true });

  const pctEl = $('[data-load]'), bar = $('.loader__bar i');
  const prog = { p: 0 };
  const render = () => { pctEl.textContent = String(Math.round(prog.p * 100)).padStart(3, '0'); bar.style.transform = `scaleX(${prog.p})`; };

  gsap.set(heroImg, { scale: 1.18, xPercent: -24, filter: 'blur(12px) brightness(0.1)' });
  gsap.set('.hero__title .line > span', { yPercent: 110 });
  gsap.set(['.hero__foot > *', '.spec', '.nav', '.track'], { autoAlpha: 0 });
  gsap.set('.hero__ghost', { autoAlpha: 0 });

  const heroIn = (tl, at) => tl
    .to(heroImg, { scale: 1, xPercent: 0, filter: 'blur(0px) brightness(1)', duration: 2.6, ease: 'expo.out' }, at)
    .to('.hero__title .line > span', { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.1 }, `${at}+=0.4`)
    .to('.hero__ghost', { autoAlpha: 1, duration: 2, ease: 'power2.out' }, `${at}+=1`)
    .to(['.nav', '.track'], { autoAlpha: 1, duration: 1 }, `${at}+=0.8`)
    .to('.hero__foot > *', { autoAlpha: 1, duration: 1.2, ease: 'power2.out', stagger: 0.1 }, `${at}+=1`)
    .fromTo('.spec', { y: 12 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.15 }, `${at}+=1.4`);

  if (seen) {
    loader.remove();   // pitstop.js finds no canvas and never boots WebGL
    ready.then(() => heroIn(gsap.timeline({ onComplete: () => ScrollTrigger.refresh() }).addLabel('hero', 0.45), 'hero'));
    lenis.start();
    return;
  }

  const loading = gsap.to(prog, { p: 0.9, duration: 3.2, ease: 'power1.out', onUpdate: render });
  Promise.all([ready, pitDone]).then(() => {
    loading.kill();
    markSeen();
    const tl = gsap.timeline({ onComplete: () => { lenis.start(); ScrollTrigger.refresh(); } })
      .to(prog, { p: 1, duration: 0.35, ease: 'power2.inOut', onUpdate: render })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' })
      .set(loader, { display: 'none' })
      .call(() => dispatchEvent(new Event('loader:hidden')));
    heroIn(tl.addLabel('hero', '-=0.75'), 'hero');
  });
})();
