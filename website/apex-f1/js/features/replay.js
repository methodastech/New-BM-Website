/* Race replay: every car as a dot on the circuit outline, driven by its real
   lap timing (OpenF1 /laps). Within a lap a car moves at constant speed, so
   order, gaps, pit stops and retirements all come from the timing data.
   Long stoppages (red flags) are fast-forwarded. */
(() => {
  const SPEEDS = [10, 30, 60, 120];
  const fmtClock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const TYRE = { SOFT: ['S', '#e8322b', '#fff'], MEDIUM: ['M', '#ffd23f', '#0a0a0b'], HARD: ['H', '#eeeae2', '#0a0a0b'], INTERMEDIATE: ['I', '#47c97e', '#0a0a0b'], WET: ['W', '#2f7fd6', '#fff'] };

  function mount(el, race, results) {
    el.innerHTML = `
      <div class="section__head"><h2 class="h2">Race <em>replay.</em></h2><p class="source mono">Lap timing · OpenF1</p></div>
      <div class="rp rp--idle"><div class="skeleton" style="height:520px;border-radius:12px"></div></div>`;
    // only download ~0.5 MB of timing once the section is close
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); load(el, race, results); } }, { rootMargin: '400px 0px' }).observe(el);
  }

  async function load(el, race, results) {
    const c = F1.circuitInfo(race.Circuit.circuitId);
    let data, stints;
    try { [data, stints] = await Promise.all([F1.raceLaps(race), F1.tyreStints(race, results).catch(() => null)]); } catch (e) { data = null; }
    if (!c || !data || !Object.keys(data.laps).length) { el.querySelector('.rp').innerHTML = '<p class="state mono">A replay isn’t available for this race.</p>'; return; }

    /* ---------- build per-car timelines ---------- */
    const total = Math.max(...results.map((r) => +r.laps || 0));
    const all = Object.values(data.laps).flat().filter(Boolean);
    const durs = all.map((l) => l[1]).filter((d) => d > 0).sort((a, b) => a - b);
    const median = durs[Math.floor(durs.length / 2)] || 90;
    const cars = results.map((r) => {
      // index = lap - 1; keep holes in place so later laps don't shift
      const L = Array.from(data.laps[r.number] || [], (l) => (l ? [l[0], l[1]] : null));
      // durations: from the next lap's start where missing; holes: start where the previous lap ended
      L.forEach((l, i) => { if (l && !(l[1] > 0)) l[1] = L[i + 1] ? (L[i + 1][0] - l[0]) / 1000 : median; });
      for (let i = 1; i < L.length; i++) if (!L[i] && L[i - 1]) L[i] = [L[i - 1][0] + L[i - 1][1] * 1000, median];
      const tm = F1.team(r.Constructor.constructorId);
      return {
        r, num: r.number, code: r.Driver.code, color: tm.color, laps: L, done: +r.laps,
        finished: /^\d+$/.test(r.positionText), pits: data.pits.filter((p) => p.driver_number === +r.number),
        stints: (stints && stints[r.number]) || [],
      };
    });
    const t0 = Math.min(...cars.flatMap((x) => (x.laps[0] ? [x.laps[0][0]] : [])));
    const lastStart = (car) => { for (let i = car.laps.length - 1; i >= 0; i--) if (car.laps[i]) return car.laps[i][0]; return t0; };
    const tEnd = Math.max(...cars.flatMap((x) => x.laps.filter(Boolean).map((l) => l[0] + l[1] * 1000)));
    const leaderCar = cars[0];

    // distance (in laps) a car has covered at time T
    const dist = (car, T) => {
      const L = car.laps;
      if (!L.length || !L[0] || T < L[0][0]) return 0;
      for (let i = L.length - 1; i >= 0; i--) {
        if (!L[i]) continue;
        const [s, d] = L[i];
        if (T >= s) return Math.min(i + Math.min(1, (T - s) / (d * 1000)), car.done);
      }
      return 0;
    };
    // when did the leader reach distance d (for gaps)
    const reach = (car, d) => {
      const i = Math.floor(d), l = car.laps[Math.min(i, car.laps.length - 1)] || car.laps[i - 1];
      if (!l) return null;
      return l[0] + (d - i) * l[1] * 1000;
    };
    const tyreAt = (car, lap) => { const s = car.stints.find((x) => lap >= x.from && lap <= x.to) || car.stints[car.stints.length - 1]; return s && TYRE[s.compound]; };
    const inPit = (car, T) => car.pits.some((p) => { const s = Date.parse(p.date); return T >= s && T <= s + (Math.min(p.lane_duration || p.pit_duration || 25, 60)) * 1000; });
    // red flag / suspension: the leader's current lap is far slower than normal
    const leaderLapLong = (T) => { const l = leaderCar.laps.find((x) => x && T >= x[0] && T < x[0] + x[1] * 1000); return !!l && l[1] > median * 3; };

    /* ---------- markup ---------- */
    const pad = 70;
    el.querySelector('.rp').outerHTML = `
      <div class="rp">
        <div class="rp__stage">
          <svg class="rp__map" viewBox="${-pad} ${-pad} ${c.w + pad * 2} ${c.h + pad * 2}" role="img" aria-label="${c.name} with live car positions">
            <path class="rp__track-b" d="${c.d}"/>
            <path class="rp__track" d="${c.d}" id="rpPath"/>
            <g class="rp__cars">${cars.map((x) => `<g class="rp__car" data-n="${x.num}" style="--c:${x.color}"><circle r="15"/><text dy="-26">${x.code}</text></g>`).join('')}</g>
          </svg>
          <div class="rp__flag mono" hidden>Red flag · fast-forwarding</div>
          <div class="rp__hud mono"><b data-rp="lap">Lap 1 / ${total}</b><span data-rp="clock">0:00:00</span></div>
        </div>
        <ol class="rp__board" aria-label="Running order">${cars.map((x) => `
          <li class="rp__row" data-n="${x.num}" style="--c:${x.color}">
            <span class="rp__pos mono">—</span><i></i><b>${x.code}</b><span class="rp__gap mono"></span><span class="rp__tyre mono"></span>
          </li>`).join('')}
        </ol>
        <div class="rp__controls">
          <button class="rp__play" type="button" aria-label="Play">▶</button>
          <input class="rp__scrub" type="range" min="0" max="${tEnd - t0}" step="1000" value="0" aria-label="Race time">
          <div class="rp__speeds" role="group" aria-label="Playback speed">${SPEEDS.map((s) => `<button type="button" class="mono" data-s="${s}" aria-pressed="${s === 60}">${s}×</button>`).join('')}</div>
        </div>
      </div>
      <p class="ts__note mono">Positions come from each car’s real lap times; within a lap cars move at constant speed. Click a driver to follow them.</p>`;

    const rp = el.querySelector('.rp');
    const path = rp.querySelector('#rpPath'), L = path.getTotalLength();
    const carEls = Object.fromEntries([...rp.querySelectorAll('.rp__car')].map((g) => [g.dataset.n, g]));
    const rowEls = Object.fromEntries([...rp.querySelectorAll('.rp__row')].map((li) => [li.dataset.n, li]));
    const lapEl = rp.querySelector('[data-rp="lap"]'), clockEl = rp.querySelector('[data-rp="clock"]'), flagEl = rp.querySelector('.rp__flag');
    const scrub = rp.querySelector('.rp__scrub'), playBtn = rp.querySelector('.rp__play');
    let T = t0, playing = false, speed = 60, follow = null, lastBoard = 0;

    const draw = (force) => {
      const state = cars.map((x) => ({ x, d: dist(x, T) }));
      const lead = state.reduce((m, s) => (s.d > m.d ? s : m), state[0]);
      state.forEach(({ x, d }) => {
        const g = carEls[x.num];
        const retired = !x.finished && d >= x.done && T > (x.done === 0 ? t0 : lastStart(x)) + 5000;
        const p = path.getPointAtLength((d % 1) * L);
        g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        g.classList.toggle('is-out', retired);
        g.classList.toggle('is-pit', inPit(x, T));
      });
      const lapNow = Math.min(total, Math.floor(lead.d) + 1);
      lapEl.textContent = T >= tEnd ? 'Chequered flag' : `Lap ${lapNow} / ${total}`;
      clockEl.textContent = fmtClock(T - t0);
      flagEl.hidden = !leaderLapLong(T);
      scrub.value = T - t0;
      el.dispatchEvent(new CustomEvent('replay:tick', { detail: { T, playing } }));
      if (!force && performance.now() - lastBoard < 200) return;
      lastBoard = performance.now();
      // running order: finishers keep their classified order once they've taken the flag
      const order = [...state].sort((a, b) => b.d - a.d || +a.x.r.position - +b.x.r.position);
      order.forEach(({ x, d }, i) => {
        const row = rowEls[x.num];
        row.style.transform = `translateY(${i * 100}%)`;
        row.querySelector('.rp__pos').textContent = i + 1;
        const out = carEls[x.num].classList.contains('is-out');
        let gap = '';
        if (out) gap = 'OUT';
        else if (i === 0) gap = 'Leader';
        else if (lead.d - d >= 1) gap = `+${Math.floor(lead.d - d)} lap${Math.floor(lead.d - d) > 1 ? 's' : ''}`;
        else { const at = reach(lead.x, d); gap = at ? `+${Math.max(0, (T - at) / 1000).toFixed(1)}` : ''; }
        row.querySelector('.rp__gap').textContent = carEls[x.num].classList.contains('is-pit') && !out ? 'PIT' : gap;
        const ty = tyreAt(x, Math.floor(d) + 1);
        const tyEl = row.querySelector('.rp__tyre');
        if (ty) { tyEl.textContent = ty[0]; tyEl.style.background = ty[1]; tyEl.style.color = ty[2]; }
        row.classList.toggle('is-out', out);
        carEls[x.num].classList.toggle('is-top', i < 3);
      });
    };

    let last = 0;
    const tick = (now) => {
      if (!playing) return;
      const dt = last ? Math.min(now - last, 100) : 0; last = now;
      T += dt * speed * (leaderLapLong(T) ? 40 : 1);
      if (T >= tEnd) { T = tEnd; setPlaying(false); }
      draw();
      if (playing) requestAnimationFrame(tick);
    };
    const setPlaying = (on) => {
      playing = on; last = 0;
      playBtn.textContent = on ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      if (on) { if (T >= tEnd) T = t0; requestAnimationFrame(tick); }
    };
    playBtn.addEventListener('click', () => setPlaying(!playing));
    scrub.addEventListener('input', () => { T = t0 + +scrub.value; draw(true); });
    rp.querySelectorAll('.rp__speeds button').forEach((b) => b.addEventListener('click', () => {
      speed = +b.dataset.s;
      rp.querySelectorAll('.rp__speeds button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    // follow a driver: highlight their dot and row
    const setFollow = (n) => {
      follow = follow === n ? null : n;
      rp.classList.toggle('is-following', !!follow);
      Object.entries(carEls).forEach(([k, g]) => g.classList.toggle('is-follow', k === follow));
      Object.entries(rowEls).forEach(([k, r]) => r.classList.toggle('is-follow', k === follow));
    };
    rp.querySelectorAll('.rp__row').forEach((r) => r.addEventListener('click', () => setFollow(r.dataset.n)));
    rp.querySelectorAll('.rp__car').forEach((g) => g.addEventListener('click', () => setFollow(g.dataset.n)));

    draw(true);
    // public handle for other modules (team radio)
    el.__replay = {
      t0, tEnd, cars, controls: rp.querySelector('.rp__controls'), stage: rp.querySelector('.rp__stage'), scrub,
      get T() { return T; }, get playing() { return playing; },
      play: () => setPlaying(true), pause: () => setPlaying(false), seek: (t) => { T = Math.max(t0, Math.min(tEnd, t)); draw(true); },
    };
    el.dispatchEvent(new CustomEvent('replay:ready'));
    if (location.search.includes('rpdebug')) window.__rp = { cars, dist, reach, get T() { return T; } };
    // start playing when the replay is in view (not with reduced motion)
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); setPlaying(true); } }, { threshold: 0.5 }).observe(rp);
    }
  }

  window.Replay = { mount };
})();
