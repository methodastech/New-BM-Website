/* ==========================================================================
   F1 data — Jolpica F1 (Ergast-compatible, free, CORS-enabled)
   https://api.jolpi.ca/ergast/f1/  ·  responses cached ~10 min server-side;
   we also keep a short per-tab cache so page hops don't re-fetch.
   ========================================================================== */
(() => {
  const BASE = 'https://api.jolpi.ca/ergast/f1/';
  const TTL = 5 * 60 * 1000;
  const memo = new Map();

  const cacheGet = (k) => {
    try {
      const v = JSON.parse(sessionStorage.getItem('f1:' + k));
      if (v && Date.now() - v.t < TTL) return v.d;
    } catch (e) { /* storage unavailable */ }
    return null;
  };
  const cacheSet = (k, d) => {
    try { sessionStorage.setItem('f1:' + k, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* full or blocked */ }
  };

  // Jolpica allows ~4 requests/second: queue them ~300 ms apart and retry a 429 with back-off
  let slot = 0;
  const throttle = () => { const t = Math.max(Date.now(), slot); slot = t + 300; return new Promise((r) => setTimeout(r, t - Date.now())); };
  async function fetchJSON(url, tries = 3) {
    await throttle();
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (r.status === 429 && tries > 1) { await new Promise((ok) => setTimeout(ok, (4 - tries) * 1500)); return fetchJSON(url, tries - 1); }
    if (!r.ok) throw new Error('F1 API ' + r.status);
    return r.json();
  }

  async function get(path) {
    if (memo.has(path)) return memo.get(path);
    const hit = cacheGet(path);
    if (hit) return hit;
    const p = fetchJSON(BASE + path)
      .then((j) => { cacheSet(path, j.MRData); return j.MRData; })
      .catch((e) => { memo.delete(path); throw e; });
    memo.set(path, p);
    return p;
  }

  /* ---------- teams: colours, short names, helmet art ---------- */
  const TEAMS = {
    mercedes: { name: 'Mercedes', color: '#00d2be', art: 'mercedes', car: 'mercedes', logo: 'mercedes' },
    ferrari: { name: 'Ferrari', color: '#e10600', art: 'ferrari', car: 'ferrari', logo: 'ferrari' },
    mclaren: { name: 'McLaren', color: '#ff8000', art: 'mclaren', car: 'mclaren', logo: 'mclaren' },
    red_bull: { name: 'Red Bull Racing', color: '#3671c6', art: 'redbull', car: 'redbullracing', logo: 'redbullracing' },
    rb: { name: 'Racing Bulls', color: '#6692ff', art: 'racingbulls', car: 'racingbulls', logo: 'racingbulls' },
    alpine: { name: 'Alpine', color: '#ff87bc', art: 'alpine', car: 'alpine', logo: 'alpine' },
    haas: { name: 'Haas', color: '#b6babd', art: 'haas', car: 'haas', logo: 'haasf1team' },
    audi: { name: 'Audi', color: '#ff2d00', art: 'audi', car: 'audi', logo: 'audi' },
    sauber: { name: 'Audi', color: '#ff2d00', art: 'audi', car: 'audi', logo: 'audi' },
    williams: { name: 'Williams', color: '#1868db', art: 'williams', car: 'williams', logo: 'williams' },
    aston_martin: { name: 'Aston Martin', color: '#229971', art: 'astonmartin', car: 'astonmartin', logo: 'astonmartin' },
    cadillac: { name: 'Cadillac', color: '#c9b27c', art: 'cadillac', car: 'cadillac', logo: 'cadillac' },
  };
  const team = (id, fallback) => TEAMS[id] || { name: fallback || id, color: '#8d887f', art: null };

  /* ---------- driver photography (assets/drivers/{full|face}/{driverId}.webp) ---------- */
  const PHOTOS = new Set(['albon', 'alonso', 'antonelli', 'arvid_lindblad', 'bearman', 'bortoleto', 'bottas', 'colapinto', 'gasly',
    'hadjar', 'hamilton', 'hulkenberg', 'lawson', 'leclerc', 'max_verstappen', 'norris', 'ocon', 'perez', 'piastri', 'russell', 'sainz', 'stroll']);
  const photo = (id, kind = 'face') => (PHOTOS.has(id) ? `assets/drivers/${kind}/${id}.webp` : null);
  // hero portraits (waist-up cutouts); drivers without one fall back to the full-length photo
  const PORTRAITS = new Set(['antonelli']);
  const portrait = (id) => (PORTRAITS.has(id) ? `assets/drivers/portrait/${id}.webp` : photo(id, 'full'));
  // signature race-number artwork, traced from the official 2026 number chart
  const number = (id) => (PHOTOS.has(id) ? `assets/numbers/${id}.svg` : null);
  const helmet = (id) => (PHOTOS.has(id) ? `assets/helmets/drivers/${id}.webp?v=4` : null);
  const FLAGS = { Thai: 'th', Spanish: 'es', Italian: 'it', British: 'gb', Brazilian: 'br', Finnish: 'fi', Argentine: 'ar', Argentinian: 'ar',
    French: 'fr', German: 'de', 'New Zealander': 'nz', Monegasque: 'mc', Australian: 'au', Mexican: 'mx', Canadian: 'ca', Japanese: 'jp', Dutch: 'nl', American: 'us' };
  const COUNTRY = { Australia: 'au', China: 'cn', Japan: 'jp', USA: 'us', 'United States': 'us', Canada: 'ca', Monaco: 'mc', Spain: 'es',
    Austria: 'at', UK: 'gb', 'United Kingdom': 'gb', Belgium: 'be', Hungary: 'hu', Netherlands: 'nl', Italy: 'it', Azerbaijan: 'az', Malaysia: 'my',
    Singapore: 'sg', Mexico: 'mx', Brazil: 'br', Qatar: 'qa', UAE: 'ae', 'United Arab Emirates': 'ae', Bahrain: 'bh', 'Saudi Arabia': 'sa' };
  const countryFlag = (country) => (COUNTRY[country] ? `assets/flags/w320/${COUNTRY[country]}.png` : null);
  const flag = (nationality) => (FLAGS[nationality] ? `assets/flags/${FLAGS[nationality]}.png` : null);
  // round head-and-shoulders avatar; falls back to the driver code
  const avatar = (d, size = '') => {
    const src = photo(d.driverId);
    return `<span class="avatar ${size}">${src ? `<img src="${src}" alt="" loading="lazy" decoding="async" width="320" height="320">` : `<b>${d.code || d.familyName.slice(0, 3).toUpperCase()}</b>`}</span>`;
  };

  /* ---------- circuit maps (circuits.js → window.CIRCUITS) ---------- */
  let trackSeq = 0;
  // opts: { lap: seconds for the car dot to lap (0 = no dot), start: show start/finish line }
  const track = (circuitId, cls = '', { lap = 0, start = true } = {}) => {
    const c = (window.CIRCUITS || {})[circuitId];
    if (!c) return '';
    const id = `trk${++trackSeq}`;
    const [sx, sy] = c.start, a = c.dir + 90;
    const sl = 34, dx = Math.cos((a * Math.PI) / 180) * sl, dy = Math.sin((a * Math.PI) / 180) * sl;
    return `<svg class="cmap ${cls}" viewBox="0 0 ${c.w} ${c.h}" role="img" aria-label="${c.name} layout">
      <path class="cmap__base" d="${c.d}" pathLength="1"/>
      <path class="cmap__line" id="${id}" d="${c.d}" pathLength="1"/>
      ${start ? `<path class="cmap__start" d="M${(sx - dx).toFixed(1)} ${(sy - dy).toFixed(1)}L${(sx + dx).toFixed(1)} ${(sy + dy).toFixed(1)}"/>` : ''}
      ${lap ? `<circle class="cmap__car" r="16"><animateMotion dur="${lap}s" repeatCount="indefinite" rotate="auto"><mpath href="#${id}"/></animateMotion></circle>` : ''}
    </svg>`;
  };
  const circuitInfo = (circuitId) => (window.CIRCUITS || {})[circuitId] || null;

  /* ---------- formatting ---------- */
  const when = (d, t) => new Date(`${d}T${t || '12:00:00Z'}`);
  const fmt = {
    day: (date) => new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(date),
    full: (date) => new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(date),
    time: (date) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date),
    range(race) {
      const end = when(race.date, race.time);
      const start = race.FirstPractice ? when(race.FirstPractice.date, race.FirstPractice.time) : end;
      const m = (d) => new Intl.DateTimeFormat(undefined, { month: 'short' }).format(d);
      return m(start) === m(end)
        ? `${start.getDate()}–${end.getDate()} ${m(end)}`
        : `${start.getDate()} ${m(start)} – ${end.getDate()} ${m(end)}`;
    },
    name: (d) => `${d.givenName} ${d.familyName}`,
    // where a round is, in a word: the country — or the city when a country hosts more than once
    place(race, all = []) {
      const C = { UK: 'Great Britain', USA: 'United States', UAE: 'Abu Dhabi', Netherlands: 'Netherlands' };
      const country = race.Circuit.Location.country;
      const twice = all.filter((r) => r.Circuit.Location.country === country).length > 1;
      return twice ? race.Circuit.Location.locality : (C[country] || country);
    },
    gp: (raceName) => raceName.replace(/ Grand Prix$/, ''),
  };

  const sessions = (race) => [
    ['Practice 1', race.FirstPractice], ['Practice 2', race.SecondPractice], ['Practice 3', race.ThirdPractice],
    ['Sprint Qualifying', race.SprintQualifying || race.SprintShootout], ['Sprint', race.Sprint],
    ['Qualifying', race.Qualifying], ['Race', { date: race.date, time: race.time }],
  ].filter(([, s]) => s && s.date).map(([label, s]) => ({ label, at: when(s.date, s.time) }));

  /* ---------- queries ---------- */
  const F1 = {
    get, team, fmt, when, sessions, photo, avatar, helmet, flag, number, track, circuitInfo, countryFlag, portrait,
    schedule: () => get('current.json').then((d) => d.RaceTable.Races),
    driverStandings: () => get('current/driverStandings.json').then((d) => d.StandingsTable.StandingsLists[0] || { DriverStandings: [] }),
    constructorStandings: () => get('current/constructorStandings.json').then((d) => d.StandingsTable.StandingsLists[0] || { ConstructorStandings: [] }),
    winners: () => get('current/results/1.json?limit=100').then((d) => d.RaceTable.Races),
    poles: () => get('current/qualifying/1.json?limit=100').then((d) => d.RaceTable.Races),
    lastQualifying: () => get('current/last/qualifying.json').then((d) => d.RaceTable.Races[0]),
    lastResults: () => get('current/last/results.json').then((d) => d.RaceTable.Races[0]),
    // driverId -> constructor they raced for most recently (standings lists teams unordered)
    async currentTeams() {
      const r = await F1.lastResults().catch(() => null);
      return Object.fromEntries((r?.Results || []).map((x) => [x.Driver.driverId, x.Constructor]));
    },
    driverResults: (id) => get(`current/drivers/${id}/results.json?limit=100`).then((d) => d.RaceTable.Races),
    driverQuali: (id) => get(`current/drivers/${id}/qualifying.json?limit=100`).then((d) => d.RaceTable.Races),
    driverSprints: (id) => get(`current/drivers/${id}/sprint.json?limit=100`).then((d) => d.RaceTable.Races),
    // career totals from MRData.total of limit=1 queries; titles change once a year so they're listed here
    async career(id) {
      const n = (path) => get(`drivers/${id}/${path}.json?limit=1`).then((d) => +d.total).catch(() => null);
      const [starts, wins, p2, p3, poles, seasons] = await Promise.all([n('results'), n('results/1'), n('results/2'), n('results/3'), n('qualifying/1'), n('seasons')]);
      const TITLES = { hamilton: 7, max_verstappen: 4, alonso: 2, norris: 1 };
      return { starts, wins, podiums: wins != null && p2 != null && p3 != null ? wins + p2 + p3 : null, poles, seasons, titles: TITLES[id] || 0 };
    },
    teamResults: (id) => get(`current/constructors/${id}/results.json?limit=100`).then((d) => d.RaceTable.Races),
    teamSprints: (id) => get(`current/constructors/${id}/sprint.json?limit=100`).then((d) => d.RaceTable.Races),
    results: (round) => get(`current/${round}/results.json`).then((d) => d.RaceTable.Races[0]),
    qualifying: (round) => get(`current/${round}/qualifying.json`).then((d) => d.RaceTable.Races[0]),
    sprint: (round) => get(`current/${round}/sprint.json`).then((d) => d.RaceTable.Races[0]),
    // best lap a qualifier set in the deepest session they reached
    qualiTime: (q) => q.Q3 || q.Q2 || q.Q1 || '—',
    async nextRace() {
      const races = await F1.schedule();
      const now = Date.now();
      return races.find((r) => when(r.date, r.time).getTime() + 3 * 3600e3 > now) || null;
    },
  };

  /* ---------- weather (Open-Meteo: free, no key, CORS) ----------
     Forecast for sessions up to 16 days out (recent past via past_days),
     the historical archive for older races. One request per weekend. */
  const WMO = (c) => {
    if (c === 0) return ['sun', 'Clear'];
    if (c <= 2) return ['part', c === 1 ? 'Mostly clear' : 'Partly cloudy'];
    if (c === 3) return ['cloud', 'Overcast'];
    if (c <= 48) return ['fog', 'Fog'];
    if (c <= 57) return ['drizzle', 'Drizzle'];
    if (c <= 67 || (c >= 80 && c <= 82)) return ['rain', c >= 65 || c === 82 ? 'Heavy rain' : 'Rain'];
    if (c <= 77 || c === 85 || c === 86) return ['snow', 'Snow'];
    return ['storm', 'Thunderstorm'];
  };
  const WX_ICONS = {
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    part: '<path d="M8.5 5.2a4 4 0 0 1 6.9 2.4"/><path d="M8.6 2.6v1.4M3.6 7.6H5M4.9 3.9l1 1"/><path d="M7 19h10.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 7 19z"/>',
    cloud: '<path d="M6.5 18.5h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 12 3.3 3.3 0 0 0 6.5 18.5z"/>',
    fog: '<path d="M6.5 13.5h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 7"/><path d="M4 16.5h16M6 19.5h12"/>',
    drizzle: '<path d="M6.5 14.5h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 8 3.3 3.3 0 0 0 6.5 14.5z"/><path d="M9 17.5l-.4 1.2M13 17.5l-.4 1.2M17 17.5l-.4 1.2"/>',
    rain: '<path d="M6.5 13.5h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 7 3.3 3.3 0 0 0 6.5 13.5z"/><path d="M8.5 16l-1.2 3.5M12.5 16l-1.2 3.5M16.5 16l-1.2 3.5"/>',
    storm: '<path d="M6.5 13h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 6.5 3.3 3.3 0 0 0 6.5 13z"/><path d="M12.5 13.5l-2.5 4h3l-2 4"/>',
    snow: '<path d="M6.5 13.5h11a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 7 3.3 3.3 0 0 0 6.5 13.5z"/><path d="M9 17v.01M12 19v.01M15 17v.01M10.5 21v.01M13.5 21v.01"/>',
  };
  const wxIcon = (kind, cls = '') => `<svg class="wxi wxi--${kind} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${WX_ICONS[kind] || WX_ICONS.cloud}</svg>`;
  const hourKey = (d) => d.toISOString().slice(0, 13) + ':00';
  const DAY = 864e5;

  async function weather(race) {
    const ses = sessions(race);
    if (!ses.length) return null;
    const first = ses[0].at.getTime(), last = ses[ses.length - 1].at.getTime(), now = Date.now();
    if (first - now > 15.5 * DAY) return { status: 'later', from: new Date(first - 15 * DAY) };
    const { lat, long } = race.Circuit.Location;
    const vars = 'temperature_2m,precipitation,weather_code,wind_speed_10m,cloud_cover';
    const archive = now - last > 80 * DAY;
    const url = archive
      ? `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${ses[0].at.toISOString().slice(0, 10)}&end_date=${new Date(last + 4 * 3600e3).toISOString().slice(0, 10)}&hourly=${vars}&timezone=GMT`
      : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=${vars},precipitation_probability&timezone=GMT&past_days=92&forecast_days=16`;
    const key = `wx:${race.season}:${race.round}:${archive ? 'a' : 'f'}`;
    let h = cacheGet(key);
    if (!h) {
      const r = await fetch(url);
      if (!r.ok) throw new Error('weather ' + r.status);
      h = (await r.json()).hourly;
      cacheSet(key, h);
    }
    const at = (d) => {
      const i = h.time.indexOf(hourKey(d));
      if (i < 0 || h.temperature_2m[i] == null) return null;
      const [kind, label] = WMO(h.weather_code[i]);
      return {
        at: d, kind, label, temp: Math.round(h.temperature_2m[i]), wind: Math.round(h.wind_speed_10m[i]),
        cloud: h.cloud_cover[i], precip: h.precipitation[i], rain: h.precipitation_probability ? h.precipitation_probability[i] : null,
      };
    };
    const raceS = ses[ses.length - 1].at;
    return {
      status: 'ok', source: archive || raceS.getTime() < now ? 'observed' : 'forecast',
      sessions: ses.map((s) => ({ label: s.label, ...(at(s.at) || {}) })),
      race: at(raceS),
      window: [-1, 0, 1, 2, 3].map((o) => at(new Date(raceS.getTime() + o * 3600e3))).filter(Boolean),
    };
  }
  // compact chip: icon · temperature · rain chance (or mm once it has happened)
  const wxChip = (w) => (w && w.kind
    ? `<span class="wx" title="${w.label} · wind ${w.wind} km/h">${wxIcon(w.kind)}<b>${w.temp}°</b>${w.rain != null && w.at > Date.now() ? `<i>${w.rain}%</i>` : w.precip > 0 ? `<i>${w.precip} mm</i>` : ''}</span>`
    : '');
  // add a chip to each row of a .sessions list (same order as F1.sessions)
  const wxSessions = (root, w) => {
    if (!w || w.status !== 'ok') return;
    root.querySelectorAll('.sessions li').forEach((li, i) => { if (!li.querySelector('.wx')) li.insertAdjacentHTML('beforeend', wxChip(w.sessions[i])); });
  };
  // one-line race-day summary
  const wxLine = (w) => {
    if (!w) return '';
    if (w.status === 'later') return `Race-day forecast from ${new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(w.from)}`;
    const r = w.race;
    if (!r) return '';
    const wet = r.rain != null && r.at > Date.now() ? `${r.rain}% rain` : `${r.precip} mm rain`;
    return `${wxIcon(r.kind)}<span>Race ${w.source === 'forecast' ? 'forecast' : 'conditions'} · <b>${r.label}</b> · ${r.temp}° · ${wet} · wind ${r.wind} km/h</span>`;
  };
  Object.assign(F1, { weather, wxIcon, wxChip, wxSessions, wxLine });

  /* ---------- tyre strategy (OpenF1: free for past sessions, CORS) ---------- */
  const OF1 = 'https://api.openf1.org/v1/';
  async function of1(path) {
    const hit = cacheGet('of1:' + path);
    if (hit) return hit;
    const r = await fetch(OF1 + path);
    if (!r.ok) throw new Error('OpenF1 ' + r.status);
    const j = await r.json();
    cacheSet('of1:' + path, j);
    return j;
  }
  // OpenF1 and Jolpica name a few venues differently, so races are matched by date
  async function of1RaceSession(race) {
    const list = await of1(`sessions?year=${race.season}&session_name=Race`);
    const day = (d) => new Date(d).getTime();
    const target = day(`${race.date}T00:00:00Z`);
    return list.find((s) => !s.is_cancelled && Math.abs(day(s.date_start.slice(0, 10) + 'T00:00:00Z') - target) <= 864e5) || null;
  }
  /* Raw stints are noisy (red flags and safety-car pit passes split one set into
     fragments; some records end before they start). Rebuild real stints:
     a new stint starts on a compound change, or after a pit visit when the
     tyre age shows a fresh set. Returns { [raceNumber]: [{compound, from, to, age}] } */
  async function tyreStints(race, results) {
    const s = await of1RaceSession(race);
    if (!s) return null;
    const [raw, pits] = await Promise.all([of1(`stints?session_key=${s.session_key}`), of1(`pit?session_key=${s.session_key}`).catch(() => [])]);
    if (!raw.length) return null;
    const pitLaps = {};
    pits.forEach((p) => (pitLaps[p.driver_number] ||= new Set()).add(p.lap_number));
    const laps = Object.fromEntries((results || []).map((r) => [r.number, +r.laps]));
    const by = {};
    raw.filter((x) => x.lap_start != null && x.lap_end != null && x.lap_end >= x.lap_start)
      .sort((a, b) => a.driver_number - b.driver_number || a.lap_start - b.lap_start)
      .forEach((x) => (by[x.driver_number] ||= []).push(x));
    const out = {};
    for (const [num, segs] of Object.entries(by)) {
      const stints = [];
      for (const x of segs) {
        const prev = stints[stints.length - 1];
        const compound = (x.compound || 'UNKNOWN').toUpperCase();
        if (prev) {
          const expected = prev.age + (prev.to - prev.from + 1);
          const pitted = pitLaps[num]?.has(x.lap_start) || pitLaps[num]?.has(x.lap_start - 1);
          const fresh = x.tyre_age_at_start != null && x.tyre_age_at_start < expected - 1;
          if (compound === prev.compound && !(pitted && fresh)) { prev.to = Math.max(prev.to, x.lap_end); continue; }
          if (x.lap_start <= prev.to) prev.to = x.lap_start - 1;          // overlapping records
          else if (x.lap_start > prev.to + 1) prev.to = x.lap_start - 1;  // gaps: extend the stint
        }
        stints.push({ compound, from: x.lap_start, to: x.lap_end, age: x.tyre_age_at_start || 0 });
      }
      const clean = stints.filter((t) => t.to >= t.from);
      if (clean.length && laps[num]) clean[clean.length - 1].to = Math.max(clean[clean.length - 1].to, laps[num]);
      if (laps[num] != null) clean.forEach((t) => { t.to = Math.min(t.to, laps[num]); });
      out[num] = clean.filter((t) => t.to >= t.from);
    }
    return out;
  }
  // laps for a replay, slimmed to { [raceNumber]: [[startMs, durationS], ...] } (index = lap - 1) before caching
  async function raceLaps(race) {
    const s = await of1RaceSession(race);
    if (!s) return null;
    const key = `of1:laps:${s.session_key}`;
    let out = cacheGet(key);
    if (!out) {
      const r = await fetch(`${OF1}laps?session_key=${s.session_key}`);
      if (!r.ok) throw new Error('OpenF1 ' + r.status);
      out = {};
      (await r.json()).forEach((l) => {
        if (!l.date_start) return;
        (out[l.driver_number] ||= [])[l.lap_number - 1] = [Date.parse(l.date_start), l.lap_duration];
      });
      cacheSet(key, out);
    }
    const pits = await of1(`pit?session_key=${s.session_key}`).catch(() => []);
    return { session: s, laps: out, pits };
  }
  // team radio clips (audio only — OpenF1 has no transcripts), oldest first
  async function teamRadio(race) {
    const s = await of1RaceSession(race);
    if (!s) return [];
    const list = await of1(`team_radio?session_key=${s.session_key}`);
    return list.map((x) => ({ num: x.driver_number, at: Date.parse(x.date), url: x.recording_url })).sort((a, b) => a.at - b.at);
  }
  Object.assign(F1, { of1RaceSession, tyreStints, raceLaps, teamRadio });

  // countdown helper: calls back every second with {d,h,m,s,done}
  F1.countdown = (target, cb) => {
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      cb({ d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60, done: ms === 0 });
    };
    tick();
    return setInterval(tick, 1000);
  };
  F1.pad = (n, l = 2) => String(n).padStart(l, '0');

  window.F1 = F1;
})();
