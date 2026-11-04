/* Home: live season cards, latest-pole chip, drivers' live points. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const set = (root, key, html) => { const el = $(`[data-f="${key}"]`, root); if (el) el.innerHTML = html; };
  const cutout = (card, driver, team) => {
    const src = F1.photo(driver.driverId, 'full');
    if (!src) return;
    card.style.setProperty('--team', F1.team(team).color);
    card.insertAdjacentHTML('afterbegin', `<img class="cutout" src="${src}" alt="" loading="lazy" width="487" height="1400">`);
  };

  // latest pole (card + hero chip)
  F1.lastQualifying().then((q) => {
    const p = q?.QualifyingResults?.[0];
    if (!p) return;
    const href = `race.html?round=${q.round}`, gp = F1.fmt.gp(q.raceName);
    const card = $('[data-live="pole"]');
    card.href = href;
    cutout(card, p.Driver, p.Constructor.constructorId);
    set(card, 'time', F1.qualiTime(p));
    set(card, 'driver', F1.fmt.name(p.Driver));
    set(card, 'meta', `${F1.team(p.Constructor.constructorId, p.Constructor.name).name} · ${gp} GP · R${q.round}`);
    const chip = $('[data-pole-chip]');
    chip.href = href;
    set(chip, 'driver', p.Driver.code || p.Driver.familyName);
    set(chip, 'time', F1.qualiTime(p));
    set(chip, 'gp', gp);
    chip.hidden = false;
  }).catch(() => set($('[data-live="pole"]'), 'driver', 'Unavailable'));

  // championship leader + the two featured drivers
  F1.driverStandings().then((s) => {
    const rows = s.DriverStandings;
    const L = rows[0];
    const card = $('[data-live="leader"]');
    if (!L) { set(card, 'driver', 'Season not started'); return; }
    cutout(card, L.Driver, L.Constructors[0]?.constructorId);
    const gap = rows[1] ? parseFloat(L.points) - parseFloat(rows[1].points) : 0;
    set(card, 'pts', `${L.points}<small>PTS</small>`);
    set(card, 'driver', F1.fmt.name(L.Driver));
    set(card, 'meta', `${L.wins} wins · +${gap} over ${rows[1]?.Driver.code || '—'} · after R${s.round}`);
    document.querySelectorAll('[data-driver-stat]').forEach((el) => {
      const r = rows.find((d) => d.Driver.driverId === el.dataset.driverStat);
      if (r) el.innerHTML = `P${r.positionText} in the championship · <b>${r.points}</b> pts · ${r.wins} wins`;
    });
  }).catch(() => set($('[data-live="leader"]'), 'driver', 'Unavailable'));

  // next race countdown
  F1.nextRace().then((race) => {
    const card = $('[data-live="next"]');
    if (!race) { set(card, 'gp', 'Season complete'); return; }
    card.href = `race.html?round=${race.round}`;
    set(card, 'gp', `${F1.fmt.gp(race.raceName)} Grand Prix`);
    set(card, 'map', F1.track(race.Circuit.circuitId, 'cmap--draw', { lap: 12 }));
    set(card, 'meta', `R${race.round} · ${race.Circuit.Location.locality} · ${F1.fmt.range(race)}`);
    F1.weather(race).then((w) => { if (w?.race) card.querySelector('[data-f="meta"]').insertAdjacentHTML('beforeend', ` · ${F1.wxChip(w.race)}`); }).catch(() => {});
    const cd = Object.fromEntries([...card.querySelectorAll('[data-cd]')].map((el) => [el.dataset.cd, el]));
    F1.countdown(F1.when(race.date, race.time), (t) => ['d', 'h', 'm'].forEach((k) => { cd[k].textContent = F1.pad(t[k]); }));
  }).catch(() => set($('[data-live="next"]'), 'gp', 'Unavailable'));

  // reveal the cards as they scroll in (main.js owns the page's ScrollTriggers)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && window.gsap) {
    gsap.from('.live__card', {
      y: 60, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: '.live__grid', start: 'top 85%', once: true },
    });
  }
})();

/* ---------- Drive to Survive: video background + trailer lightbox ---------- */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const section = $('.dts');
  if (!section) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bg = $('.dts__video', section);

  // background loop only plays while the section is on screen (and never with reduced motion)
  if (!reduce) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) bg.play().catch(() => {}); else bg.pause();
    }, { rootMargin: '200px 0px' }).observe(section);
  }

  // the frame opens from an inset card to full bleed as you scroll in; the video drifts behind it
  if (!reduce && window.gsap) {
    gsap.fromTo('.dts__frame', { clipPath: 'inset(14% 10% 14% 10% round 14px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: 1 },
    });
    gsap.fromTo(bg, { yPercent: -4, scale: 1.12 }, {
      yPercent: 4, scale: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    // logo wipes in left → right, like a title card
    gsap.set('.dts__title img', { clipPath: 'inset(0 100% 0 0)', x: -24 });
    gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 45%', once: true } })
      .to('.dts__title img', { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.6, ease: 'expo.inOut' })
      .from(['.dts__kicker', '.dts__lede', '.dts__actions', '.dts__meta'], { y: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.2);
  }

  // trailer with sound
  const box = $('.lightbox'), film = $('.lightbox__video', box), closeBtn = $('.lightbox__close', box), opener = $('.dts__play', section);
  let last = null;
  const open = () => {
    last = document.activeElement;
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('is-open'));
    window.__lenis?.stop();
    bg.pause();
    film.currentTime = 0;
    film.play().catch(() => {});
    closeBtn.focus();
  };
  const close = () => {
    film.pause();
    box.classList.remove('is-open');
    setTimeout(() => { box.hidden = true; }, 450);
    window.__lenis?.start();
    if (!reduce) bg.play().catch(() => {});
    last?.focus();
  };
  opener.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
  film.addEventListener('ended', close);
})();
