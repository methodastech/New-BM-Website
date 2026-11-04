/* Drivers: formula1.com-style cards — team gradient, name, number, flag,
   with the driver's 2026 helmet. Grouped by team (live constructors' order). */
(async () => {
  const grid = document.querySelector('#drivers');
  let ds, cs, now;
  try {
    [ds, cs, now] = await Promise.all([F1.driverStandings(), F1.constructorStandings(), F1.currentTeams()]);
  } catch (e) { Page.error(grid); return; }

  const teamRank = Object.fromEntries(cs.ConstructorStandings.map((c, i) => [c.Constructor.constructorId, i]));
  const teamOf = (d) => now[d.Driver.driverId] || d.Constructors[d.Constructors.length - 1] || {};

  // numbers drawn in two colours (an outline plus a fill) lose their shape when flattened to white — keep their own colours
  const TWO_TONE = new Set(['max_verstappen', 'hadjar']);

  const card = (d) => {
    const c = teamOf(d), t = F1.team(c.constructorId, c.name), D = d.Driver;
    const hel = F1.helmet(D.driverId), flag = F1.flag(D.nationality), num = F1.number(D.driverId);
    return `
      <a class="dcard" href="driver.html?id=${D.driverId}" style="--team:${t.color}" aria-label="${F1.fmt.name(D)}, ${t.name}, P${d.positionText} with ${d.points} points">
        <div class="dcard__text">
          <h3><span>${D.givenName}</span><b>${D.familyName}</b></h3>
          <p class="dcard__team">${t.name}</p>
          ${num ? `<img class="dcard__num dcard__num--sig${TWO_TONE.has(D.driverId) ? ' is-color' : ''}" src="${num}" alt="No. ${D.permanentNumber}" loading="lazy">` : `<p class="dcard__num">${D.permanentNumber || ''}</p>`}
          ${flag ? `<img class="dcard__flag" src="${flag}" alt="${D.nationality}" width="80" height="53" loading="lazy">` : `<span class="dcard__flag dcard__flag--text mono">${(D.nationality || '').slice(0, 3)}</span>`}
        </div>
        <div class="dcard__stats mono"><span>P${d.positionText}</span><span>${d.points} PTS</span>${+d.wins ? `<span>${d.wins} W</span>` : ''}</div>
        <div class="dcard__glow" aria-hidden="true"></div>
        ${num ? `<img class="dcard__sig" src="${num}" alt="" aria-hidden="true" loading="lazy">` : ''}
        ${hel ? `<img class="dcard__helmet" src="${hel}" alt="" loading="lazy" decoding="async" width="640" height="720">` : `<span class="dcard__code" aria-hidden="true">${D.code || D.familyName.slice(0, 3).toUpperCase()}</span>`}
      </a>`;
  };

  const render = (order) => {
    // current race drivers only: anyone who wasn't on the grid last round (reserves, one-off stand-ins) is left out
    const active = Object.keys(now).length ? ds.DriverStandings.filter((d) => now[d.Driver.driverId]) : ds.DriverStandings;
    const rows = [...active];
    if (order === 'team') rows.sort((a, b) => (teamRank[teamOf(a).constructorId] ?? 99) - (teamRank[teamOf(b).constructorId] ?? 99) || +a.position - +b.position);
    grid.innerHTML = rows.map(card).join('');
    grid.removeAttribute('data-revealed');
    grid.setAttribute('data-reveal', 'children');
    Page.reveal();
  };

  const tabs = [...document.querySelectorAll('[data-sort]')];
  const select = (key) => tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.sort === key)));
  tabs.forEach((b) => b.addEventListener('click', () => { select(b.dataset.sort); render(b.dataset.sort); }));
  select('team');
  render('team');
})();
