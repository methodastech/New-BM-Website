/* Race weekend: ?round=N (defaults to the latest completed round). */
(async () => {
  const $ = (s) => document.querySelector(s);
  const body = $('#race-body');
  let races;
  try { races = await F1.schedule(); } catch (e) { Page.error(body); return; }

  const now = Date.now();
  const doneRounds = races.filter((r) => F1.when(r.date, r.time).getTime() + 3 * 3600e3 < now);
  const asked = parseInt(new URLSearchParams(location.search).get('round'), 10);
  const race = races.find((r) => +r.round === asked) || doneRounds[doneRounds.length - 1] || races[0];
  const idx = races.indexOf(race);
  const gp = F1.fmt.gp(race.raceName);
  const raceAt = F1.when(race.date, race.time);

  document.title = `${race.raceName} — APEX`;
  $('#race-title').innerHTML = `${gp} <em>Grand Prix.</em>`;
  const map = F1.track(race.Circuit.circuitId, 'cmap--draw cmap--hero', { lap: 16 });
  if (map) { $('#race-ghost').outerHTML = `<div class="race-hero__track" aria-hidden="false">${map}<span class="mono race-hero__round">R${F1.pad(race.round)}</span></div>`; $('#race-hero').classList.add('has-track'); }
  else $('#race-ghost').textContent = `R${race.round}`;
  const info = F1.circuitInfo(race.Circuit.circuitId);
  $('#race-meta').innerHTML = [
    `Round <b>${race.round}</b> / ${races.length}`,
    `<b>${race.Circuit.circuitName}</b>`,
    `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
    `<b>${F1.fmt.range(race)}</b>`,
    info ? `Lap <b>${info.km.toFixed(3)} km</b>` : '',
    race.Sprint ? '<b>Sprint weekend</b>' : '',
  ].filter(Boolean).map((s) => `<span>${s}</span>`).join('');

  /* ---------- pager ---------- */
  const prev = races[idx - 1], next = races[idx + 1];
  $('#pager').innerHTML = `
    ${prev ? `<a href="race.html?round=${prev.round}"><span class="mono">← Round ${prev.round}</span><b>${F1.fmt.place(prev, races)}</b></a>` : '<span></span>'}
    ${next ? `<a href="race.html?round=${next.round}"><span class="mono">Round ${next.round} →</span><b>${F1.fmt.place(next, races)}</b></a>` : ''}`;

  const [res, quali, sprint] = await Promise.all([
    F1.results(race.round).catch(() => null),
    F1.qualifying(race.round).catch(() => null),
    race.Sprint ? F1.sprint(race.round).catch(() => null) : null,
  ]);

  const tm = (c) => F1.team(c?.constructorId, c?.name);
  // race-day weather card: the hour before lights out through the end of the race
  const wxCard = (w) => {
    if (!w) return '';
    if (w.status === 'later') return `<div class="wxcard wxcard--later" data-reveal><p class="mono">Race-day weather</p><p class="wxcard__later">${F1.wxLine(w)}. Check back then — forecasts go 16 days out.</p></div>`;
    const r = w.race;
    if (!r) return '';
    const fut = r.at > Date.now();
    return `
      <div class="wxcard" data-reveal>
        <div class="wxcard__now">
          <p class="mono">${fut ? 'Race-day forecast' : 'Race-day conditions'} · lights out ${F1.fmt.time(r.at)}</p>
          <div class="wxcard__big">${F1.wxIcon(r.kind)}<b>${r.temp}°</b></div>
          <p class="wxcard__label">${r.label}</p>
          <dl class="wxcard__stats">
            <div><dt class="mono">${fut ? 'Rain chance' : 'Rain'}</dt><dd>${fut && r.rain != null ? `${r.rain}%` : `${r.precip} mm`}</dd></div>
            <div><dt class="mono">Wind</dt><dd>${r.wind} km/h</dd></div>
            <div><dt class="mono">Cloud</dt><dd>${r.cloud}%</dd></div>
          </dl>
        </div>
        <ol class="wxcard__hours">${w.window.map((x) => `
          <li class="${x.at.getTime() === r.at.getTime() ? 'is-start' : ''}">
            <span class="mono">${F1.fmt.time(x.at)}</span>${F1.wxIcon(x.kind)}<b>${x.temp}°</b>
            <span class="mono">${fut && x.rain != null ? `${x.rain}%` : `${x.precip} mm`}</span>
          </li>`).join('')}
        </ol>
        <p class="wxcard__src mono">Weather · Open-Meteo${fut ? ' · updates hourly' : ''}</p>
      </div>`;
  };
  const who = (r) => `<div class="who" style="--team:${tm(r.Constructor).color}"><i></i>${F1.avatar(r.Driver)}<div><b>${F1.fmt.name(r.Driver)}</b> <span class="code">${r.Driver.code || ''}</span></div></div>`;

  /* ---------- upcoming weekend ---------- */
  if (!res?.Results?.length) {
    const rows = F1.sessions(race).map((s) => `<li class="${s.at < now ? 'is-past' : ''} ${s.label === 'Race' ? 'is-race' : ''}"><span>${s.label}</span><span>${F1.fmt.full(s.at)} · ${F1.fmt.time(s.at)}</span></li>`).join('');
    const pole = quali?.QualifyingResults?.[0];
    body.innerHTML = `
      <article class="next" data-reveal>
        <div>
          <p class="next__label mono">${raceAt > now ? 'Lights out in' : 'Results pending'}</p>
          <div class="countdown">
            <div><b data-cd="d">00</b><span>Days</span></div><div><b data-cd="h">00</b><span>Hours</span></div>
            <div><b data-cd="m">00</b><span>Min</span></div><div><b data-cd="s">00</b><span>Sec</span></div>
          </div>
          <p class="next__where mono" style="margin-top:2.4rem">${pole ? `Pole · <b style="color:var(--fg)">${F1.fmt.name(pole.Driver)}</b> · ${F1.qualiTime(pole)}` : 'Results and the pole lap appear here after each session.'}</p>
        </div>
        <div><p class="mono" style="color:var(--muted);margin-bottom:1rem">Sessions · your local time</p><ul class="sessions">${rows}</ul></div>
      </article>`;
    const cd = Object.fromEntries([...body.querySelectorAll('[data-cd]')].map((el) => [el.dataset.cd, el]));
    F1.countdown(raceAt, (t) => ['d', 'h', 'm', 's'].forEach((k) => { cd[k].textContent = F1.pad(t[k]); }));
    F1.weather(race).then((w) => {
      F1.wxSessions(body, w);
      body.insertAdjacentHTML('beforeend', wxCard(w));
      Page.reveal(body);
    }).catch(() => {});
    Page.reveal(body);
    return;
  }

  /* ---------- completed weekend ---------- */
  const R = res.Results;
  if (info && R[0]?.laps) {
    $('#race-meta').insertAdjacentHTML('beforeend', `<span><b>${R[0].laps}</b> laps · <b>${(info.km * +R[0].laps).toFixed(1)} km</b></span>`);
  }
  F1.weather(race).then((w) => {
    if (w?.race) body.insertAdjacentHTML('afterbegin', `<p class="wxbar mono" data-reveal>${F1.wxLine(w)}</p>`);
  }).catch(() => {});
  const win = R[0];
  const pole = quali?.QualifyingResults?.[0];
  const fast = R.find((r) => r.FastestLap?.rank === '1');
  const stat = (label, big, r, extra = '') => `
    <div class="stat" style="--team:${r ? tm(r.Constructor).color : 'var(--line)'}">
      ${r && F1.photo(r.Driver.driverId, 'full') ? `<img class="cutout" src="${F1.photo(r.Driver.driverId, 'full')}" alt="" loading="lazy" width="487" height="1400">` : ''}
      <p class="stat__label mono">${label}</p>
      <div class="stat__big">${big}</div>
      <div class="stat__who">${r ? F1.fmt.name(r.Driver) : '—'}<span>${r ? tm(r.Constructor).name : ''}${extra}</span></div>
    </div>`;

  const tables = {
    race: () => `<table class="table"><thead><tr><th>Pos</th><th>Driver</th><th class="hide-sm">Team</th><th class="tnum hide-sm">Grid</th><th class="tnum hide-sm">Laps</th><th class="tnum">Time</th><th class="tnum">Pts</th></tr></thead><tbody>
      ${R.map((r) => `<tr><td class="pos">${r.positionText}</td><td>${who(r)}</td><td class="hide-sm" style="color:var(--muted)">${tm(r.Constructor).name}</td><td class="tnum hide-sm">${r.grid === '0' ? 'PL' : r.grid}</td><td class="tnum hide-sm">${r.laps}</td><td class="tnum">${r.Time?.time || r.status}</td><td class="tnum">${r.points}</td></tr>`).join('')}
      </tbody></table>`,
    qualifying: () => (quali?.QualifyingResults?.length ? `<table class="table"><thead><tr><th>Pos</th><th>Driver</th><th class="hide-sm">Team</th><th class="tnum hide-sm">Q1</th><th class="tnum hide-sm">Q2</th><th class="tnum">Q3</th></tr></thead><tbody>
      ${quali.QualifyingResults.map((q) => `<tr><td class="pos">${q.position}</td><td>${who(q)}</td><td class="hide-sm" style="color:var(--muted)">${tm(q.Constructor).name}</td><td class="tnum hide-sm">${q.Q1 || '—'}</td><td class="tnum hide-sm">${q.Q2 || '—'}</td><td class="tnum">${q.Q3 || '—'}</td></tr>`).join('')}
      </tbody></table>` : '<p class="state mono">No qualifying data for this round.</p>'),
    sprint: () => (sprint?.SprintResults?.length ? `<table class="table"><thead><tr><th>Pos</th><th>Driver</th><th class="hide-sm">Team</th><th class="tnum hide-sm">Laps</th><th class="tnum">Time</th><th class="tnum">Pts</th></tr></thead><tbody>
      ${sprint.SprintResults.map((r) => `<tr><td class="pos">${r.positionText}</td><td>${who(r)}</td><td class="hide-sm" style="color:var(--muted)">${tm(r.Constructor).name}</td><td class="tnum hide-sm">${r.laps}</td><td class="tnum">${r.Time?.time || r.status}</td><td class="tnum">${r.points}</td></tr>`).join('')}
      </tbody></table>` : '<p class="state mono">No sprint results.</p>'),
  };

  body.innerHTML = `
    <div class="stats" data-reveal="children">
      ${stat('Pole position', pole ? F1.qualiTime(pole) : '—', pole)}
      ${stat('Winner', win.Time?.time || '—', win, ` · from P${win.grid}`)}
      ${stat('Fastest lap', fast?.FastestLap?.Time?.time || '—', fast, fast ? ` · lap ${fast.FastestLap.lap}` : '')}
    </div>
    <div class="section__head">
      <div class="tabs" role="tablist" aria-label="Session">
        <button role="tab" aria-selected="true" data-tab="race">Race</button>
        <button role="tab" aria-selected="false" data-tab="qualifying">Qualifying</button>
        ${race.Sprint ? '<button role="tab" aria-selected="false" data-tab="sprint">Sprint</button>' : ''}
      </div>
      <p class="source mono">Live · Jolpica F1</p>
    </div>
    <div class="table-wrap" id="results"></div>`;

  const out = $('#results');
  const tabs = [...body.querySelectorAll('[data-tab]')];
  const show = (k) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === k)));
    out.innerHTML = tables[k]();
    out.querySelector('tbody')?.setAttribute('data-reveal', 'children');
    Page.reveal(out);
  };
  tabs.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  show('race');
  // race replay + tyre strategy (OpenF1), below the results
  body.insertAdjacentHTML('beforeend', '<section class="rreplay" aria-label="Race replay"></section><section class="tradio" aria-label="Team radio"></section><section class="tstrat" aria-label="Tyre strategy"></section>');
  if (window.Replay) Replay.mount(body.querySelector('.rreplay'), race, R);
  if (window.Radio) Radio.mount(body.querySelector('.tradio'), race, R, window.Replay ? body.querySelector('.rreplay') : null);
  if (window.Strategy) Strategy.render(body.querySelector('.tstrat'), race, R);
  Page.reveal(body);
})();
