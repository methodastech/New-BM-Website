/* Teams: formula1.com-style cards — team gradient, drivers, 2026 car. Hover: the logo
   appears on the right while the car pulls away. Click: the team page. */
(async () => {
  const grid = document.querySelector('#teams');
  let cs, ds, now;
  try {
    [cs, ds, now] = await Promise.all([F1.constructorStandings(), F1.driverStandings(), F1.currentTeams()]);
  } catch (e) { Page.error(grid); return; }

  // official wordmarks present in assets/teams/wordmarks/ (add a key here when its file is added)
  const WORDMARKS = new Set([]);

  // drivers grouped by their current team
  const crews = {};
  ds.DriverStandings.forEach((d) => {
    if (Object.keys(now).length && !now[d.Driver.driverId]) return;   // reserves / stand-ins
    const id = now[d.Driver.driverId]?.constructorId || d.Constructors[d.Constructors.length - 1]?.constructorId;
    (crews[id] ||= []).push(d);
  });

  grid.innerHTML = cs.ConstructorStandings.map((c) => {
    const id = c.Constructor.constructorId;
    const t = F1.team(id, c.Constructor.name);
    const { car, logo } = t;
    const drivers = (crews[id] || []).map((d) =>
      `<li>${F1.avatar(d.Driver, 'sm')}<span>${d.Driver.givenName.split(' ').pop()} <b>${d.Driver.familyName.toUpperCase()}</b></span></li>`).join('');
    return `
      <a class="tcard" href="team.html?id=${id}" style="--team:${t.color}" aria-label="${t.name}, P${c.positionText} with ${c.points} points">
        <div class="tcard__dots" aria-hidden="true"></div>
        ${logo ? `<img class="tcard__logo" src="assets/teams/logos/${logo}.webp" alt="" aria-hidden="true" width="480" height="480" loading="lazy">` : ''}
        <header class="tcard__head">
          <h3>${WORDMARKS.has(car) ? `<img class="tcard__word" src="assets/teams/wordmarks/${car}.webp" alt="" onload="this.parentNode.classList.add('has-word')" onerror="this.remove()">` : ''}<span>${t.name}</span></h3>
          <ul class="tcard__drivers">${drivers || '<li>Line-up to be confirmed</li>'}</ul>
        </header>
        <div class="tcard__stats mono"><span>P${c.positionText}</span><span>${c.points} PTS</span>${+c.wins ? `<span>${c.wins} W</span>` : ''}</div>
        ${car ? `<div class="tcard__ride"><img class="tcard__ghost" src="assets/teams/cars/${car}.webp" alt="" aria-hidden="true" loading="lazy"><img class="tcard__car" src="assets/teams/cars/${car}.webp" alt="${t.name} 2026 car" width="1400" height="308" loading="lazy" decoding="async"><i class="tcard__streaks" aria-hidden="true"></i></div>` : ''}
      </a>`;
  }).join('');
  grid.setAttribute('data-reveal', 'children');
  Page.reveal();
})();
