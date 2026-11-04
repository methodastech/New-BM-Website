/* ==========================================================================
   Shared across every page: page-to-page curtain, mobile menu, cursor +
   magnetic UI, active nav link, live "next race" badge in the nav.
   Needs gsap (cursor/magnetic) and F1 (next race) when present.
   ========================================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.documentElement.classList.remove('no-js');

  /* ---------- active nav link ---------- */
  const page = document.body.dataset.page;
  $$(`[data-nav="${page}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));

  /* ---------- logo loader: plays, waits for the page, then collapses into the apex ---------- */
  const curtain = $('.curtain');
  const ll = curtain && $('.ll', curtain);
  if (curtain) {
    const quick = document.documentElement.classList.contains('logo-quick');
    const minMs = reduce ? 0 : quick ? 700 : 2400;
    const t0 = performance.now();
    const lapEl = $('[data-ll-lap]', curtain);
    let running = true;
    const fmtLap = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(Math.floor(ms % 1000)).padStart(3, '0')}`;
    (function tick() { if (!running) return; lapEl.textContent = fmtLap((performance.now() - t0) * 31.4); requestAnimationFrame(tick); })();

    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    const ready = Promise.race([Promise.all([loaded, document.fonts ? document.fonts.ready : null]), new Promise((r) => setTimeout(r, 4500))]);
    ready.then(() => new Promise((r) => setTimeout(r, Math.max(0, minMs - (performance.now() - t0))))).then(() => {
      running = false;
      curtain.classList.add('is-done');
      try { sessionStorage.setItem('apex:logo', '1'); } catch (e) { /* private mode */ }
      // collapse the whole screen into the apex dot
      const apex = $('.ll__apex', curtain).getBoundingClientRect();
      curtain.style.setProperty('--ax', `${apex.left + apex.width / 2}px`);
      curtain.style.setProperty('--ay', `${apex.top + apex.height / 2}px`);
      setTimeout(() => curtain.classList.add('is-out'), reduce ? 0 : 160);
      curtain.addEventListener('transitionend', () => curtain.classList.add('is-gone'), { once: true });
      setTimeout(() => curtain.classList.add('is-gone'), 1300);
    });
  }

  /* ---------- page transitions: the curtain opens out from the click, then we navigate ---------- */
  const internal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    const url = new URL(a.href, location.href);
    return url.origin === location.origin && (url.pathname !== location.pathname || url.search !== location.search) && !a.getAttribute('href').startsWith('#');
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!curtain || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !internal(a)) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    ll.classList.add('is-static');
    curtain.style.setProperty('--ax', `${e.clientX}px`);
    curtain.style.setProperty('--ay', `${e.clientY}px`);
    curtain.classList.remove('is-gone');
    requestAnimationFrame(() => curtain.classList.remove('is-out'));
    const go = () => { location.href = a.href; };
    curtain.addEventListener('transitionend', go, { once: true });
    setTimeout(go, 1000);
  });
  // back/forward cache: never come back to a covered page
  addEventListener('pageshow', (e) => { if (e.persisted && curtain) curtain.classList.add('is-out', 'is-gone'); });

  /* ---------- mobile menu ---------- */
  const burger = $('.nav__burger');
  if (burger) {
    const set = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      $('.menu')?.setAttribute('aria-hidden', String(!open));
      window.__lenis?.[open ? 'stop' : 'start']();
    };
    burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- cursor + magnetic ---------- */
  if (fine && window.gsap) {
    const cur = $('.cursor');
    if (cur) {
      const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      const cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
      const hot = 'a, button, .card, [data-cursor], [data-magnetic]';
      document.addEventListener('pointerover', (e) => { if (e.target.closest(hot)) cur.classList.add('is-hover'); });
      document.addEventListener('pointerout', (e) => { if (e.target.closest(hot) && !e.relatedTarget?.closest?.(hot)) cur.classList.remove('is-hover'); });
    }
    if (!reduce) {
      $$('[data-magnetic]').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: 'power3.out' });
        });
        el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }));
      });
    }
  }

  /* ---------- live next-race badge (nav + menu) ---------- */
  const slots = $$('[data-nextrace]');
  if (slots.length && window.F1) {
    F1.nextRace().then((race) => {
      if (!race) { slots.forEach((el) => { el.textContent = 'Season complete'; }); return; }
      const at = F1.when(race.date, race.time);
      const label = F1.fmt.gp(race.raceName);
      F1.countdown(at, ({ d, h, m }) => {
        const left = d > 0 ? `${d}d ${F1.pad(h)}h` : `${F1.pad(h)}h ${F1.pad(m)}m`;
        slots.forEach((el) => { el.innerHTML = `<span class="dot"></span> R${race.round} · ${label} · ${left}`; });
      });
      $$('[data-nextrace-link]').forEach((a) => { a.href = `race.html?round=${race.round}`; });
    }).catch(() => slots.forEach((el) => { el.textContent = 'Season 2026'; }));
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- footer: next-race finale (countdown, circuit, weather) ---------- */
  const fx = $('[data-foot-next]');
  if (fx && window.F1) {
    const X = (k) => $(`[data-fx="${k}"]`, fx);
    F1.nextRace().then(async (race) => {
      if (!race) { X('k').textContent = 'Season complete'; X('title').innerHTML = 'See you <em>next season.</em>'; $('.fx__cd', fx).remove(); return; }
      const races = await F1.schedule().catch(() => []);
      const gp = F1.fmt.gp(race.raceName), at = F1.when(race.date, race.time), info = F1.circuitInfo(race.Circuit.circuitId);
      X('k').textContent = `Lights out · Round ${race.round}${races.length ? ` / ${races.length}` : ''}`;
      X('title').innerHTML = `${gp} <em>Grand Prix.</em>`;
      X('meta').innerHTML = [`<b>${race.Circuit.circuitName}</b>`, `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`, F1.fmt.range(race), `${F1.fmt.full(at)} · ${F1.fmt.time(at)}`].map((s) => `<span>${s}</span>`).join('<span>·</span>');
      X('guide').href = `race.html?round=${race.round}`;
      // draw the circuit only once the footer is near, so the lap animation is seen
      const map = X('map');
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return; o.disconnect();
        map.innerHTML = F1.track(race.Circuit.circuitId, 'cmap--draw', { lap: 16 }) + (info ? `<figcaption class="mono">${info.km.toFixed(3)} km · ${race.Circuit.Location.locality}</figcaption>` : '');
      }, { rootMargin: '0px 0px -15% 0px' }).observe(map);
      F1.weather(race).then((w) => { if (w?.race) X('meta').insertAdjacentHTML('beforeend', `<span>·</span>${F1.wxChip(w.race)}`); }).catch(() => {});
      const cd = Object.fromEntries($$('[data-cd]', fx).map((el) => [el.dataset.cd, el]));
      F1.countdown(at, (t) => ['d', 'h', 'm', 's'].forEach((k) => { cd[k].textContent = F1.pad(t[k]); }));
    }).catch(() => { X('title').innerHTML = 'Season <em>2026.</em>'; });
  }
  const clock = $('[data-clock]');
  if (clock) {
    const tick = () => { clock.textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  // the home page's fixed progress line would sit on the footer bar — fade it out there
  const bar = $('.foot__bar');
  if (bar) new IntersectionObserver(([e]) => document.body.classList.toggle('at-foot', e.isIntersecting), { rootMargin: '0px 0px 120px 0px' }).observe(bar);

  /* ---------- footer: back to top + a quiet rise-in ---------- */
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.8 }); else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }));
  const foot = $('.foot');
  if (foot && !reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(foot.querySelectorAll('.fx__copy > *, .foot__mid > *'), {
      y: 24, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: foot, start: 'top 80%', once: true },
    });
    gsap.fromTo(foot.querySelector('.foot__word'), { yPercent: 18 }, {
      yPercent: 0, ease: 'none', scrollTrigger: { trigger: foot, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
})();
