/* Team page: team.html?id=<constructorId>. Hero with the car, live stats,
   both drivers (photo, helmet, signature number) and the season, race by race. */
(async () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = $('#team');
  const id = new URLSearchParams(location.search).get('id') || 'mercedes';

  let cs, ds, now, races, results, poles;
  try {
    [cs, ds, now, races, results, poles] = await Promise.all([
      F1.constructorStandings(), F1.driverStandings(), F1.currentTeams(), F1.schedule(),
      F1.teamResults(id).catch(() => []), F1.poles().catch(() => []),
    ]);
  } catch (e) { Page.error(main); return; }

  const rows = cs.ConstructorStandings;
  const idx = rows.findIndex((c) => c.Constructor.constructorId === id);
  if (idx < 0) { main.innerHTML = '<p class="state mono" style="padding:30vh var(--gutter)">Team not found. <a href="teams.html" style="color:var(--fg)">Back to all teams →</a></p>'; return; }
  const C = rows[idx];
  const t = F1.team(id, C.Constructor.name);
  document.title = `${t.name} — APEX F1`;
  document.documentElement.style.setProperty('--team', t.color);

  // drivers racing for this team now, best first
  const drivers = ds.DriverStandings
    .filter((d) => (now[d.Driver.driverId]?.constructorId || d.Constructors[d.Constructors.length - 1]?.constructorId) === id)
    .filter((d) => !Object.keys(now).length || now[d.Driver.driverId]);

  // season numbers from the race-by-race results
  const byDriver = {};
  let podiums = 0;
  results.forEach((r) => r.Results.forEach((x) => {
    (byDriver[x.Driver.driverId] ||= {})[r.round] = x;
    if (+x.position <= 3) podiums++;
  }));
  const poleCount = poles.filter((r) => r.QualifyingResults?.[0]?.Constructor.constructorId === id).length;
  const leaderPts = +rows[0].points;
  const gap = idx === 0 ? (rows[1] ? `+${+C.points - +rows[1].points} <span>lead</span>` : '—') : `−${leaderPts - +C.points} <span>to P1</span>`;
  const nameHtml = t.name.includes(' ') ? t.name.replace(/ (\S+)$/, ' <em>$1</em>') : t.name;

  /* ---------- hero ---------- */
  main.innerHTML = `
    <section class="th" aria-labelledby="team-name">
      <div class="th__bg" aria-hidden="true"><i class="th__glow"></i><i class="th__dots"></i></div>
      ${t.logo ? `<img class="th__logo" src="assets/teams/logos/${t.logo}.webp" alt="" aria-hidden="true">` : ''}
      <div class="th__head">
        <a class="th__back mono" href="teams.html">← All teams</a>
        <h1 class="th__name" id="team-name"><span class="line"><span>${nameHtml}</span></span></h1>
        <ul class="th__crew">${drivers.map((d) => `<li>${F1.avatar(d.Driver, 'sm')}${d.Driver.givenName.split(' ').pop()} <b>${d.Driver.familyName.toUpperCase()}</b></li>`).join('')}</ul>
      </div>
      ${t.car ? `<div class="th__ride"><img class="th__ghost" src="assets/teams/cars/${t.car}.webp" alt="" aria-hidden="true"><img class="th__car" src="assets/teams/cars/${t.car}.webp" alt="${t.name} 2026 car" width="1400" height="308"></div>` : ''}
      <dl class="th__stats">
        ${[['Position', `P${C.positionText}`], ['Points', C.points], ['Wins', C.wins], ['Podiums', podiums], ['Poles', poleCount], [idx === 0 ? 'Lead' : 'Gap', gap]]
          .map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </section>

    <section class="section tdrivers" aria-label="Drivers">
      <div class="section__head"><h2 class="h2" data-split>The <em>drivers.</em></h2><p class="source mono">${t.name} · 2026</p></div>
      <div class="tdrivers__grid" data-reveal="children">
        ${drivers.map((d) => driverCard(d)).join('') || '<p class="state mono">Line-up to be confirmed.</p>'}
      </div>
    </section>

    <section class="section tseason" aria-label="Season results">
      <div class="section__head"><h2 class="h2" data-split>The <em>season.</em></h2><p class="source mono">Race finishes · round by round</p></div>
      <div class="tseason__wrap" data-reveal>${seasonTable()}</div>
      <ul class="tseason__key mono" aria-label="Key">
        <li><i class="k-win"></i>Win</li><li><i class="k-pod"></i>Podium</li><li><i class="k-pts"></i>Points</li><li><i class="k-out"></i>No points</li><li><i class="k-dnf"></i>DNF</li>
      </ul>
    </section>

    <nav class="pager" aria-label="Other teams">
      ${rows[idx - 1] ? `<a href="team.html?id=${rows[idx - 1].Constructor.constructorId}"><span class="mono">← P${idx}</span><b>${F1.team(rows[idx - 1].Constructor.constructorId).name}</b></a>` : '<span></span>'}
      ${rows[idx + 1] ? `<a href="team.html?id=${rows[idx + 1].Constructor.constructorId}"><span class="mono">P${idx + 2} →</span><b>${F1.team(rows[idx + 1].Constructor.constructorId).name}</b></a>` : ''}
    </nav>`;

  function driverCard(d) {
    const D = d.Driver, mine = byDriver[D.driverId] || {};
    const fin = Object.values(mine);
    const best = fin.reduce((m, x) => (+x.position && +x.position < m ? +x.position : m), 99);
    const pods = fin.filter((x) => +x.position <= 3).length;
    const share = +C.points ? Math.round((+d.points / +C.points) * 100) : 0;
    const photo = F1.photo(D.driverId, 'full'), helmet = F1.helmet(D.driverId), num = F1.number(D.driverId), flag = F1.flag(D.nationality);
    return `
      <article class="tdc">
        <div class="tdc__stage">
          ${num ? `<img class="tdc__num" src="${num}" alt="" aria-hidden="true">` : ''}
          ${photo ? `<img class="tdc__photo" src="${photo}" alt="${F1.fmt.name(D)}" loading="lazy" width="487" height="1400">` : ''}
          ${helmet ? `<img class="tdc__helmet" src="${helmet}" alt="${D.familyName}'s 2026 helmet" loading="lazy">` : ''}
        </div>
        <div class="tdc__info">
          <p class="tdc__meta mono">${flag ? `<img src="${flag}" alt="" width="80" height="53">` : ''}${D.nationality} · No. ${D.permanentNumber || '—'}</p>
          <h3><a href="driver.html?id=${D.driverId}">${D.givenName} <b>${D.familyName}</b> →</a></h3>
          <dl class="tdc__stats">
            <div><dt class="mono">Championship</dt><dd>P${d.positionText}</dd></div>
            <div><dt class="mono">Points</dt><dd>${d.points}</dd></div>
            <div><dt class="mono">Wins</dt><dd>${d.wins}</dd></div>
            <div><dt class="mono">Podiums</dt><dd>${pods}</dd></div>
            <div><dt class="mono">Best finish</dt><dd>${best < 99 ? `P${best}` : '—'}</dd></div>
          </dl>
          <div class="tdc__share"><span class="mono">Share of team points</span><i><b style="--p:${share / 100}"></b></i><span class="mono">${share}%</span></div>
        </div>
      </article>`;
  }

  function seasonTable() {
    const cell = (x) => {
      if (!x) return '<td class="is-none">·</td>';
      const p = +x.position, txt = x.positionText;
      const dnf = !/^\d+$/.test(txt);   // R / D / W etc. = not classified
      const cls = dnf ? 'is-dnf' : p === 1 ? 'is-win' : p <= 3 ? 'is-pod' : +x.points > 0 ? 'is-pts' : 'is-out';
      return `<td class="${cls}" title="${x.status}">${dnf ? 'DNF' : `P${txt}`}</td>`;
    };
    const head = races.map((r) => `<th scope="col"><a href="race.html?round=${r.round}" title="${r.raceName}">${F1.pad(r.round)}<span>${F1.fmt.place(r, races).slice(0, 3)}</span></a></th>`).join('');
    const teamPts = races.map((r) => {
      const res = results.find((x) => x.round === r.round);
      return res ? `<td class="is-sum">${res.Results.reduce((s, x) => s + +x.points, 0)}</td>` : '<td class="is-none">·</td>';
    }).join('');
    const body = drivers.map((d) => `<tr><th scope="row">${F1.avatar(d.Driver, 'sm')}${d.Driver.code}</th>${races.map((r) => cell(byDriver[d.Driver.driverId]?.[r.round])).join('')}</tr>`).join('');
    return `<table class="tseason__table"><thead><tr><th></th>${head}</tr></thead><tbody>${body}<tr class="tseason__sum"><th scope="row">Race pts</th>${teamPts}</tr></tbody></table>`;
  }

  /* ---------- motion ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.tdc__share b').forEach((b) => b.classList.add('go'))));
  Page.reveal(main);
  if (reduce || !window.gsap) return;
  gsap.timeline({ delay: 0.2 })
    .fromTo('.th__name .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out' }, 0)
    .fromTo('.th__ride', { xPercent: -60, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.8, ease: 'expo.out' }, 0.15)
    .fromTo('.th__ghost', { opacity: 0.6, x: -40 }, { opacity: 0, x: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
    .fromTo('.th__logo', { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0.5)
    .fromTo(['.th__crew li', '.th__stats > div', '.th__back'], { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.6);
  const st = { trigger: '.th', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.th__ride', { xPercent: 14, ease: 'none', scrollTrigger: st });
  gsap.to('.th__logo', { yPercent: 18, ease: 'none', scrollTrigger: st });
})();
