/* Calendar: next-race countdown + every round with live winner / pole. */
(async () => {
  const $ = (s) => document.querySelector(s);
  const nextEl = $('#next'), list = $('#rounds');
  let races, winners, poles;
  try {
    [races, winners, poles] = await Promise.all([F1.schedule(), F1.winners().catch(() => []), F1.poles().catch(() => [])]);
  } catch (e) {
    Page.error(nextEl); list.innerHTML = '';
    return;
  }
  const byRound = (arr) => Object.fromEntries(arr.map((r) => [r.round, r]));
  const W = byRound(winners), P = byRound(poles);
  const next = races.find((r) => F1.when(r.date, r.time).getTime() + 3 * 3600e3 > Date.now());

  /* ---------- next race ---------- */
  if (next) {
    const now = Date.now();
    const rows = F1.sessions(next).map((s) => `
      <li class="${s.at < now ? 'is-past' : ''} ${s.label === 'Race' ? 'is-race' : ''}">
        <span>${s.label}</span><span>${F1.fmt.full(s.at)} · ${F1.fmt.time(s.at)}</span>
      </li>`).join('');
    nextEl.innerHTML = `
      <article class="next" data-reveal>
        <div>
          <p class="next__label mono">Next · Round ${next.round} of ${races.length}${next.Sprint ? ' · Sprint weekend' : ''}</p>
          <h2>${F1.fmt.gp(next.raceName)} <em>Grand Prix</em></h2>
          <p class="next__where mono">${next.Circuit.circuitName} · ${next.Circuit.Location.locality}, ${next.Circuit.Location.country} · ${F1.fmt.range(next)}</p>
          <p class="wxline mono" data-wxline></p>
          <div class="next__map">${F1.track(next.Circuit.circuitId, 'cmap--draw', { lap: 14 })}${F1.circuitInfo(next.Circuit.circuitId) ? `<span class="mono">${F1.circuitInfo(next.Circuit.circuitId).km.toFixed(3)} km lap</span>` : ''}</div>
          <div class="countdown" aria-live="off">
            <div><b data-cd="d">00</b><span>Days</span></div>
            <div><b data-cd="h">00</b><span>Hours</span></div>
            <div><b data-cd="m">00</b><span>Min</span></div>
            <div><b data-cd="s">00</b><span>Sec</span></div>
          </div>
          <a class="cta next__cta" href="race.html?round=${next.round}" data-magnetic><span>Weekend guide</span><i aria-hidden="true">→</i></a>
        </div>
        <div>
          <p class="mono" style="color:var(--muted);margin-bottom:1rem">Sessions · your local time</p>
          <ul class="sessions">${rows}</ul>
        </div>
      </article>`;
    F1.weather(next).then((w) => {
      F1.wxSessions(nextEl, w);
      const l = nextEl.querySelector('[data-wxline]'); if (l) l.innerHTML = F1.wxLine(w);
    }).catch(() => {});
    const nm = nextEl.querySelector('.next__map');
    if (nm) nm.parentElement.after(nm);   // the map gets its own column between info and sessions
    const cd = Object.fromEntries([...nextEl.querySelectorAll('[data-cd]')].map((el) => [el.dataset.cd, el]));
    F1.countdown(F1.when(next.date, next.time), (t) => { ['d', 'h', 'm', 's'].forEach((k) => { cd[k].textContent = F1.pad(t[k]); }); });
  } else {
    nextEl.innerHTML = '<p class="state mono">The 2026 season is complete.</p>';
  }

  /* ---------- all rounds ---------- */
  const driver = (r) => (r ? `<span class="who" style="--team:${F1.team(r.Constructor.constructorId).color}">${F1.avatar(r.Driver, 'sm')}<span><b>${r.Driver.code || ''}</b> ${r.Driver.familyName}</span></span>` : '—');
  list.innerHTML = races.map((r) => {
    const done = !!W[r.round];
    const win = W[r.round]?.Results?.[0];
    const pole = P[r.round]?.QualifyingResults?.[0];
    const result = done
      ? `<span class="mono">Winner</span>${driver(win)}<span class="mono">Pole · ${pole ? `${pole.Driver.code} ${F1.qualiTime(pole)}` : '—'}</span>`
      : `<span class="mono">Race</span><br>${F1.fmt.full(F1.when(r.date, r.time))} · ${F1.fmt.time(F1.when(r.date, r.time))}`;
    const flag = F1.countryFlag(r.Circuit.Location.country);
    return `
      <li data-state="${done ? 'done' : 'upcoming'}">
        <a class="round ${next && r.round === next.round ? 'is-next' : ''}" href="race.html?round=${r.round}"${flag ? ` style="--flag:url('${new URL(flag, location.href).href}')"` : ''}>
          <span class="round__no mono">R${F1.pad(r.round)}</span>
          <span class="round__map">${F1.track(r.Circuit.circuitId, 'cmap--thumb', { lap: 9, start: false })}</span>
          <span class="round__name">${flag ? `<img class="round__flag" src="${flag}" alt="${r.Circuit.Location.country}" width="320" height="160" loading="lazy">` : ''}${F1.fmt.place(r, races)}${r.Sprint ? '<span class="badge">Sprint</span>' : ''}<small>${r.raceName} · ${r.Circuit.Location.locality}</small></span>
          <span class="round__date mono">${F1.fmt.range(r)}</span>
          <span class="round__result">${result}</span>
          <span class="round__go" aria-hidden="true">→</span>
        </a>
      </li>`;
  }).join('');

  /* ---------- filters ---------- */
  const tabs = [...document.querySelectorAll('[data-filter]')];
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === b)));
    list.querySelectorAll('li').forEach((li) => { li.hidden = b.dataset.filter !== 'all' && li.dataset.state !== b.dataset.filter; });
    ScrollTrigger.refresh();
  }));

  list.setAttribute('data-reveal', 'children');
  Page.reveal();
})();
