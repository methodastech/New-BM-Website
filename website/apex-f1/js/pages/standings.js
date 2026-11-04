/* Standings: drivers + constructors, live, with animated points bars. */
(async () => {
  const $ = (s) => document.querySelector(s);
  const table = $('#table');
  let ds, cs;
  try {
    [ds, cs] = await Promise.all([F1.driverStandings(), F1.constructorStandings()]);
  } catch (e) { Page.error(table); return; }

  /* ---------- hero: the championship leader ---------- */
  const hero = $('#champ');
  const F = (k) => hero.querySelector(`[data-f="${k}"]`);
  const rows = ds.DriverStandings;
  const L = rows[0];
  if (L) {
    const c = L.Constructors[L.Constructors.length - 1] || {}, t = F1.team(c.constructorId, c.name), D = L.Driver;
    hero.style.setProperty('--team', t.color);
    const por = F1.portrait(D.driverId);
    if (por) { F('portrait').src = por; F('portrait').alt = `${F1.fmt.name(D)}, ${t.name}`; hero.classList.toggle('is-portrait', por.includes('/portrait/')); }
    const num = F1.number(D.driverId);
    if (num) F('num').src = num; else F('num').remove();
    F('name').innerHTML = `<span>${D.givenName}</span> <em>${D.familyName}</em>`;
    const gap = rows[1] ? +L.points - +rows[1].points : 0;
    // stats card: P1 badge · team · wins (one pip per round, lit where they won) · lead bar vs P2
    const winners = await F1.winners().catch(() => []);
    const pips = winners.map((r) => `<i class="${r.Results[0]?.Driver.driverId === D.driverId ? 'on' : ''}" title="R${r.round} ${F1.fmt.gp(r.raceName)}"></i>`).join('');
    const P2 = rows[1];
    F('stats').innerHTML = `
      <div class="cs__pos"><span class="mono">Pos</span><b>P1</b></div>
      <div class="cs__team">${t.logo ? `<img src="assets/teams/logos/${t.logo}.webp" alt="" width="480" height="480">` : ''}<div><span class="mono">Team</span><b>${t.name}</b></div></div>
      <div class="cs__wins"><div class="cs__row"><b>${L.wins}</b><span class="mono">Wins</span></div><div class="cs__pips" aria-label="${L.wins} wins from ${winners.length} races">${pips}</div></div>
      ${P2 ? `<div class="cs__lead">
        <div class="cs__row"><b>+${gap}</b><span class="mono">Lead over ${P2.Driver.code}</span></div>
        <div class="cs__bar" aria-hidden="true"><i class="a" style="--w:${(+L.points / (+L.points + +P2.points)) * 100}%"></i><i class="b"></i></div>
        <div class="cs__legend mono"><span>${D.code} ${L.points}</span><span>${P2.Driver.code} ${P2.points}</span></div>
      </div>` : ''}`;
    F('chase').innerHTML = rows.slice(1, 4).map((r) => {
      const rc = r.Constructors[r.Constructors.length - 1] || {};
      return `<li style="--team:${F1.team(rc.constructorId).color}"><span class="mono">P${r.positionText}</span>${F1.avatar(r.Driver, 'sm')}<b>${r.Driver.code}</b><span class="mono">−${+L.points - +r.points}</span></li>`;
    }).join('');
    hero.classList.add('is-ready');

    const ptsEl = F('pts'), target = +L.points;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap) { ptsEl.textContent = target; return renderTables(); }
    const o = { v: 0 };
    gsap.timeline({ delay: 0.35 })
      .fromTo('.champ__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08 }, 0)
      .fromTo('.champ__num', { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 0.11, duration: 2.2, ease: 'expo.out' }, 0.1)
      .fromTo('.champ__portrait', { yPercent: 8, autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' }, { yPercent: 0, autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.8, ease: 'expo.out' }, 0.2)
      .to(o, { v: target, duration: 2, ease: 'expo.out', onUpdate: () => { ptsEl.textContent = Math.round(o.v); } }, 0.5)
      .fromTo(['.champ__name', '.champ__stats', '.champ__chase li'], { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 0.7);
    // depth on scroll: number drifts fastest, portrait slowest, copy fades
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.champ__num', { yPercent: 30, ease: 'none', scrollTrigger: st });
    gsap.to('.champ__portrait', { yPercent: 8, ease: 'none', scrollTrigger: st });
    gsap.to(['.champ__lead', '.champ__top', '.champ__chase'], { y: -60, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const px = gsap.quickTo('.champ__portrait', 'x', { duration: 1.4, ease: 'power3' });
      const nx = gsap.quickTo('.champ__num', 'x', { duration: 1.6, ease: 'power3' });
      hero.addEventListener('pointermove', (e) => { const k = e.clientX / innerWidth - 0.5; px(k * -18); nx(k * 34); });
    }
  }
  renderTables();

  function renderTables() {
    const views = {
      drivers: {
        rows: ds.DriverStandings,
        head: '<th>Pos</th><th>Driver</th><th class="hide-sm">Team</th><th class="tnum hide-sm">Wins</th><th class="hide-sm"></th><th class="tnum">Pts</th>',
        row: (r, max) => {
          const c = r.Constructors[0] || {}; const t = F1.team(c.constructorId, c.name);
          return `<tr style="--team:${t.color}">
            <td class="pos">${r.positionText}</td>
            <td><div class="who"><i></i>${F1.avatar(r.Driver)}<div><a href="driver.html?id=${r.Driver.driverId}"><b>${F1.fmt.name(r.Driver)}</b></a> <span class="code">${r.Driver.code || ''}</span></div></div></td>
            <td class="hide-sm" style="color:var(--muted)">${t.name}</td>
            <td class="tnum hide-sm">${r.wins}</td>
            <td class="hide-sm"><div class="bar"><i style="--p:0" data-p="${max ? r.points / max : 0}"></i></div></td>
            <td class="tnum">${r.points}</td></tr>`;
        },
      },
      constructors: {
        rows: cs.ConstructorStandings,
        head: '<th>Pos</th><th>Team</th><th class="tnum hide-sm">Wins</th><th class="hide-sm"></th><th class="tnum">Pts</th>',
        row: (r, max) => {
          const t = F1.team(r.Constructor.constructorId, r.Constructor.name);
          return `<tr style="--team:${t.color}">
            <td class="pos">${r.positionText}</td>
            <td><div class="who"><i></i><b>${t.name}</b></div></td>
            <td class="tnum hide-sm">${r.wins}</td>
            <td class="hide-sm"><div class="bar"><i style="--p:0" data-p="${max ? r.points / max : 0}"></i></div></td>
            <td class="tnum">${r.points}</td></tr>`;
        },
      },
    };

    const show = (key) => {
      const v = views[key];
      if (!v.rows.length) { table.innerHTML = '<p class="state mono">No standings yet — check back after round one.</p>'; return; }
      const max = parseFloat(v.rows[0].points) || 0;
      table.innerHTML = `<table class="table"><thead><tr>${v.head}</tr></thead><tbody>${v.rows.map((r) => v.row(r, max)).join('')}</tbody></table>`;
      // grow the bars once they're painted
      requestAnimationFrame(() => requestAnimationFrame(() => table.querySelectorAll('.bar i').forEach((i) => { i.style.setProperty('--p', i.dataset.p); })));
      table.querySelector('tbody').setAttribute('data-reveal', 'children');
      Page.reveal(table.parentElement);
    };

    const tabs = [...document.querySelectorAll('[data-tab]')];
    tabs.forEach((b) => b.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === b)));
      show(b.dataset.tab);
    }));
    show(new URLSearchParams(location.search).get('view') === 'constructors' ? 'constructors' : 'drivers');
    if (new URLSearchParams(location.search).get('view') === 'constructors') tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === 'constructors')));
  }
})();
