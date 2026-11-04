/* Driver page: driver.html?id=<driverId>. Hero (photo, number, helmet), live
   season stats, head-to-head with the teammate, race-by-race grid, career. */
(async () => {
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = $('#driver');
  const id = new URLSearchParams(location.search).get('id') || 'antonelli';

  let ds, now, races, poles;
  try {
    [ds, now, races, poles] = await Promise.all([F1.driverStandings(), F1.currentTeams(), F1.schedule(), F1.poles().catch(() => [])]);
  } catch (e) { Page.error(main); return; }

  const rows = ds.DriverStandings;
  const idx = rows.findIndex((d) => d.Driver.driverId === id);
  if (idx < 0) { main.innerHTML = '<p class="state mono" style="padding:30vh var(--gutter)">Driver not found. <a href="drivers.html" style="color:var(--fg)">Back to all drivers →</a></p>'; return; }
  const S = rows[idx], D = S.Driver;
  const teamOf = (d) => now[d.Driver.driverId] || d.Constructors[d.Constructors.length - 1] || {};
  const C = teamOf(S), t = F1.team(C.constructorId, C.name);
  const mate = rows.find((d) => d !== S && teamOf(d).constructorId === C.constructorId && (!Object.keys(now).length || now[d.Driver.driverId]));
  document.title = `${F1.fmt.name(D)} — APEX F1`;
  document.documentElement.style.setProperty('--team', t.color);

  const [res, quali, sprints, mRes, mQuali, career] = await Promise.all([
    F1.driverResults(id).catch(() => []), F1.driverQuali(id).catch(() => []), F1.driverSprints(id).catch(() => []),
    mate ? F1.driverResults(mate.Driver.driverId).catch(() => []) : [], mate ? F1.driverQuali(mate.Driver.driverId).catch(() => []) : [],
    F1.career(id).catch(() => null),
  ]);

  // per-round lookups
  const byRound = (arr, key) => Object.fromEntries(arr.map((r) => [r.round, r[key][0]]));
  const R = byRound(res, 'Results'), Q = byRound(quali, 'QualifyingResults'), SP = byRound(sprints, 'SprintResults');
  const MR = byRound(mRes, 'Results'), MQ = byRound(mQuali, 'QualifyingResults');
  const classified = (x) => x && /^\d+$/.test(x.positionText);
  const fin = Object.values(R);
  const podiums = fin.filter((x) => +x.position <= 3).length;
  const dnfs = fin.filter((x) => !classified(x)).length;
  const best = fin.reduce((m, x) => (classified(x) && +x.position < m ? +x.position : m), 99);
  const poleCount = poles.filter((r) => r.QualifyingResults?.[0]?.Driver.driverId === id).length;
  const mPoles = mate ? poles.filter((r) => r.QualifyingResults?.[0]?.Driver.driverId === mate.Driver.driverId).length : 0;
  const photo = F1.photo(id, 'full'), helmet = F1.helmet(id), num = F1.number(id), flag = F1.flag(D.nationality);

  /* ---------- head to head ---------- */
  const h2h = () => {
    if (!mate) return '<p class="state mono">No current teammate.</p>';
    const M = mate.Driver;
    let raceA = 0, raceB = 0, qA = 0, qB = 0;
    Object.keys(R).forEach((rd) => {
      const a = R[rd], b = MR[rd];
      if (!a || !b) return;
      if (classified(a) && (!classified(b) || +a.position < +b.position)) raceA++;
      else if (classified(b)) raceB++;
    });
    Object.keys(Q).forEach((rd) => { const a = Q[rd], b = MQ[rd]; if (a && b) (+a.position < +b.position ? qA++ : qB++); });
    const mFin = Object.values(MR);
    const rowsH = [
      ['Race finishes ahead', raceA, raceB], ['Qualifying ahead', qA, qB], ['Points', +S.points, +mate.points],
      ['Wins', +S.wins, +mate.wins], ['Podiums', podiums, mFin.filter((x) => +x.position <= 3).length], ['Poles', poleCount, mPoles],
    ];
    return `
      <div class="h2h">
        <div class="h2h__who"><span>${F1.avatar(D, 'lg')}<b>${D.familyName}</b></span><span class="mono">vs</span><span><b>${M.familyName}</b>${F1.avatar(M, 'lg')}</span></div>
        ${rowsH.map(([k, a, b]) => {
          const tot = a + b || 1;
          return `<div class="h2h__row" role="group" aria-label="${k}: ${D.familyName} ${a}, ${M.familyName} ${b}">
            <b class="${a > b ? 'is-ahead' : ''}">${a}</b>
            <div class="h2h__bar"><span class="mono">${k}</span><i class="a" style="--w:${(a / tot) * 100}%"></i><i class="b" style="--w:${(b / tot) * 100}%"></i></div>
            <b class="${b > a ? 'is-ahead' : ''}">${b}</b>
          </div>`;
        }).join('')}
        <a class="h2h__link mono" href="driver.html?id=${M.driverId}">${F1.fmt.name(M)} →</a>
      </div>`;
  };

  /* ---------- season grid ---------- */
  const grid = () => {
    const cell = (x, kind) => {
      if (!x) return '<td class="is-none">·</td>';
      if (kind === 'q') return `<td class="${+x.position === 1 ? 'is-win' : +x.position <= 3 ? 'is-pod' : +x.position <= 10 ? 'is-pts' : 'is-out'}">P${x.position}</td>`;
      if (!classified(x)) return `<td class="is-dnf" title="${x.status}">DNF</td>`;
      const p = +x.position;
      return `<td class="${p === 1 ? 'is-win' : p <= 3 ? 'is-pod' : +x.points > 0 ? 'is-pts' : 'is-out'}">P${x.positionText}</td>`;
    };
    const head = races.map((r) => `<th scope="col"><a href="race.html?round=${r.round}" title="${r.raceName}">${F1.pad(r.round)}<span>${F1.fmt.place(r, races).slice(0, 3)}</span></a></th>`).join('');
    const line = (label, fn) => `<tr><th scope="row">${label}</th>${races.map(fn).join('')}</tr>`;
    return `<table class="tseason__table"><thead><tr><th></th>${head}</tr></thead><tbody>
      ${line('Race', (r) => cell(R[r.round], 'r'))}
      ${line('Qualifying', (r) => cell(Q[r.round], 'q'))}
      ${sprints.length ? line('Sprint', (r) => (r.Sprint ? cell(SP[r.round], 'r') : '<td class="is-none"></td>')) : ''}
      <tr class="tseason__sum"><th scope="row">Points</th>${races.map((r) => { const p = (+(R[r.round]?.points || 0)) + (+(SP[r.round]?.points || 0)); return R[r.round] ? `<td class="is-sum">${p}</td>` : '<td class="is-none">·</td>'; }).join('')}</tr>
    </tbody></table>`;
  };

  const stat = (k, v) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`;
  main.innerHTML = `
    <section class="dh" aria-labelledby="dname">
      <div class="dh__bg" aria-hidden="true"><i class="dh__glow"></i></div>
      ${num ? `<img class="dh__num" src="${num}" alt="" aria-hidden="true">` : ''}
      ${photo ? `<img class="dh__photo" src="${photo}" alt="${F1.fmt.name(D)} in ${t.name} race kit" width="487" height="1400">` : ''}
      ${helmet ? `<img class="dh__helmet" src="${helmet}" alt="${D.familyName}'s 2026 helmet">` : ''}
      <div class="dh__head">
        <a class="th__back mono" href="drivers.html">← All drivers</a>
        <h1 class="dh__name" id="dname"><span class="line"><span>${D.givenName}</span></span><span class="line"><span><b>${D.familyName}</b></span></span></h1>
        <p class="dh__meta">${flag ? `<img src="${flag}" alt="" width="80" height="53">` : ''}<span>${D.nationality}</span><span>No. ${D.permanentNumber || '—'}</span><a href="team.html?id=${C.constructorId}" style="--c:${t.color}">${t.name} →</a></p>
      </div>
      <dl class="th__stats dh__stats">
        ${stat('Championship', `P${S.positionText}`)}${stat('Points', S.points)}${stat('Wins', S.wins)}${stat('Podiums', podiums)}${stat('Poles', poleCount)}${stat('Best finish', best < 99 ? `P${best}` : '—')}${stat('DNFs', dnfs)}
      </dl>
    </section>

    <section class="section" aria-label="Head to head">
      <div class="section__head"><h2 class="h2" data-split>Head <em>to head.</em></h2><p class="source mono">vs teammate · 2026</p></div>
      <div data-reveal>${h2h()}</div>
    </section>

    <section class="section tseason" aria-label="Season">
      <div class="section__head"><h2 class="h2" data-split>The <em>season.</em></h2><p class="source mono">Round by round</p></div>
      <div class="tseason__wrap" data-reveal>${grid()}</div>
      <ul class="tseason__key mono" aria-label="Key"><li><i class="k-win"></i>Win / pole</li><li><i class="k-pod"></i>Podium / top 3</li><li><i class="k-pts"></i>Points / top 10</li><li><i class="k-dnf"></i>DNF</li></ul>
    </section>

    ${career ? `<section class="section" aria-label="Career">
      <div class="section__head"><h2 class="h2" data-split>The <em>career.</em></h2><p class="source mono">All seasons · Formula 1</p></div>
      <dl class="career" data-reveal="children">
        ${[['World titles', career.titles], ['Race starts', career.starts], ['Wins', career.wins], ['Podiums', career.podiums], ['Pole positions', career.poles], ['Seasons', career.seasons]]
          .map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v ?? '—'}</dd></div>`).join('')}
      </dl>
    </section>` : ''}

    <nav class="pager" aria-label="Other drivers">
      ${rows[idx - 1] ? `<a href="driver.html?id=${rows[idx - 1].Driver.driverId}"><span class="mono">← P${idx}</span><b>${F1.fmt.name(rows[idx - 1].Driver)}</b></a>` : '<span></span>'}
      ${rows[idx + 1] ? `<a href="driver.html?id=${rows[idx + 1].Driver.driverId}"><span class="mono">P${idx + 2} →</span><b>${F1.fmt.name(rows[idx + 1].Driver)}</b></a>` : ''}
    </nav>`;

  requestAnimationFrame(() => requestAnimationFrame(() => main.querySelectorAll('.h2h__bar i').forEach((i) => i.classList.add('go'))));
  Page.reveal(main);
  if (reduce || !window.gsap) return;
  gsap.timeline({ delay: 0.2 })
    .fromTo('.dh__name .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08 }, 0)
    .fromTo('.dh__num', { opacity: 0, scale: 1.1 }, { opacity: 0.1, scale: 1, duration: 2, ease: 'expo.out' }, 0.1)
    .fromTo('.dh__photo', { yPercent: 6, autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' }, { yPercent: 0, autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.out' }, 0.2)
    .fromTo('.dh__helmet', { autoAlpha: 0, x: 40, rotate: 8 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 1.4, ease: 'expo.out' }, 0.5)
    .fromTo(['.dh__meta', '.dh__stats > div', '.th__back'], { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.6);
  const st = { trigger: '.dh', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.dh__num', { yPercent: 25, ease: 'none', scrollTrigger: st });
  gsap.to('.dh__photo', { yPercent: 6, ease: 'none', scrollTrigger: st });
  gsap.to('.dh__helmet', { yPercent: -12, ease: 'none', scrollTrigger: st });
})();
