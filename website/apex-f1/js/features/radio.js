/* Team radio: every clip OpenF1 has for the race, labelled with the lap it was
   sent on, playable in a list — and synced with the race replay (markers on
   the scrubber; with radio on, the replay pauses for each message). Audio only:
   OpenF1 publishes no transcripts. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const fmtT = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–:––');

  function mount(el, race, results, replayEl) {
    el.innerHTML = `<div class="section__head"><h2 class="h2">Team <em>radio.</em></h2><p class="source mono">Driver radio · OpenF1</p></div><div class="skeleton" style="height:260px"></div>`;
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); load(el, race, results, replayEl); } }, { rootMargin: '600px 0px' }).observe(el);
  }

  async function load(el, race, results, replayEl) {
    let clips, laps;
    try { [clips, laps] = await Promise.all([F1.teamRadio(race), F1.raceLaps(race).catch(() => null)]); } catch (e) { clips = []; }
    if (!clips.length) { el.querySelector('.skeleton').outerHTML = '<p class="state mono">No team radio published for this race.</p>'; return; }

    const byNum = Object.fromEntries(results.map((r) => [r.number, r]));
    // which lap was the driver on when the message was sent?
    const lapOf = (num, at) => {
      const L = laps?.laps?.[num];
      if (!L || !L.length) return null;
      const first = L.find(Boolean);
      if (first && at < first[0]) return 'pre';
      for (let i = L.length - 1; i >= 0; i--) if (L[i] && at >= L[i][0]) return at <= L[i][0] + (L[i][1] || 200) * 1000 ? i + 1 : 'post';
      return null;
    };
    clips.forEach((c, i) => {
      c.i = i; c.r = byNum[c.num];
      c.lap = lapOf(c.num, c.at);
      c.lapTxt = c.lap === 'pre' ? 'Before the start' : c.lap === 'post' ? 'After the flag' : c.lap ? `Lap ${c.lap}` : '';
    });
    const people = [...new Map(clips.filter((c) => c.r).map((c) => [c.num, c.r])).values()];

    el.innerHTML = `
      <div class="section__head">
        <h2 class="h2">Team <em>radio.</em></h2>
        <p class="source mono">${clips.length} messages · OpenF1 · audio only</p>
      </div>
      <div class="tr__filters" role="group" aria-label="Filter by driver">
        <button type="button" class="mono" aria-pressed="true" data-f="all">All</button>
        ${people.map((r) => `<button type="button" class="mono" aria-pressed="false" data-f="${r.number}" style="--team:${F1.team(r.Constructor.constructorId).color}">${F1.avatar(r.Driver, 'sm')}${r.Driver.code}</button>`).join('')}
      </div>
      <ol class="tr__list">${clips.map((c) => {
        const r = c.r, tm = r ? F1.team(r.Constructor.constructorId) : { color: '#8d887f', name: '' };
        return `
          <li class="tr__clip" data-i="${c.i}" data-n="${c.num}" style="--team:${tm.color}">
            <button class="tr__play" type="button" aria-label="Play radio from ${esc(r ? F1.fmt.name(r.Driver) : `car ${c.num}`)}${c.lapTxt ? `, ${c.lapTxt}` : ''}"><span aria-hidden="true">▶</span></button>
            <div class="tr__who">${r ? F1.avatar(r.Driver, 'sm') : ''}<b>${r ? r.Driver.familyName : `Car ${c.num}`}</b><span class="mono">${tm.name}</span></div>
            <span class="tr__lap mono">${c.lapTxt}</span>
            <div class="tr__wave" aria-hidden="true"><i></i></div>
            <span class="tr__time mono">–:––</span>
            ${replayEl ? `<button class="tr__jump mono" type="button" title="Show this moment in the replay">Replay ↗</button>` : ''}
          </li>`;
      }).join('')}</ol>
      <p class="ts__note mono">Formula 1 publishes radio as audio only, so there are no transcripts. Times are matched to each driver’s lap from the timing data.</p>`;

    /* ---------- one shared audio element ---------- */
    const audio = new Audio();
    audio.preload = 'none';
    let current = null, onEnd = null;
    const rowOf = (i) => el.querySelector(`.tr__clip[data-i="${i}"]`);
    const setState = (i, on) => {
      const row = rowOf(i); if (!row) return;
      row.classList.toggle('is-playing', on);
      row.querySelector('.tr__play span').textContent = on ? '❚❚' : '▶';
    };
    const stop = () => { if (current != null) setState(current, false); audio.pause(); current = null; };
    const play = (i, then) => {
      if (current === i && !audio.paused) { stop(); return; }
      stop();
      current = i; onEnd = then || null;
      audio.src = clips[i].url;
      audio.play().catch(() => { stop(); });
      setState(i, true);
    };
    audio.addEventListener('timeupdate', () => {
      if (current == null) return;
      const row = rowOf(current);
      row.querySelector('.tr__wave i').style.transform = `scaleX(${audio.duration ? audio.currentTime / audio.duration : 0})`;
      row.querySelector('.tr__time').textContent = `${fmtT(audio.currentTime)} / ${fmtT(audio.duration)}`;
    });
    audio.addEventListener('ended', () => {
      const row = current != null && rowOf(current);
      if (row) row.querySelector('.tr__wave i').style.transform = 'scaleX(0)';
      stop();
      if (onEnd) { const f = onEnd; onEnd = null; f(); }
    });

    el.querySelectorAll('.tr__clip').forEach((row) => {
      const i = +row.dataset.i;
      row.querySelector('.tr__play').addEventListener('click', () => play(i));
      row.querySelector('.tr__jump')?.addEventListener('click', () => {
        const R = replayEl.__replay; if (!R) return;
        R.pause(); R.seek(clips[i].at - 3000);
        replayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* ---------- filters ---------- */
    el.querySelectorAll('.tr__filters button').forEach((b) => b.addEventListener('click', () => {
      el.querySelectorAll('.tr__filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      el.querySelectorAll('.tr__clip').forEach((row) => { row.hidden = b.dataset.f !== 'all' && row.dataset.n !== b.dataset.f; });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));

    /* ---------- sync with the replay ---------- */
    if (!replayEl) return;
    const hook = () => {
      const R = replayEl.__replay;
      if (!R) return;
      const span = R.tEnd - R.t0;
      // markers on the scrubber
      const track = document.createElement('div');
      track.className = 'tr__marks';
      track.innerHTML = clips.filter((c) => c.at >= R.t0 && c.at <= R.tEnd)
        .map((c) => `<i style="left:${((c.at - R.t0) / span) * 100}%;--team:${c.r ? F1.team(c.r.Constructor.constructorId).color : '#8d887f'}" title="${esc(c.r ? c.r.Driver.code : c.num)} · ${c.lapTxt}"></i>`).join('');
      const wrap = document.createElement('div');
      wrap.className = 'tr__scrubwrap';
      R.scrub.replaceWith(wrap);
      wrap.append(R.scrub, track);

      // radio toggle (a click also unlocks audio autoplay)
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'tr__toggle mono'; toggle.setAttribute('aria-pressed', 'false');
      toggle.innerHTML = '<span aria-hidden="true">📻</span> Radio off';
      R.controls.insertBefore(toggle, R.controls.querySelector('.rp__speeds'));
      let radioOn = false;
      toggle.addEventListener('click', () => {
        radioOn = !radioOn;
        toggle.setAttribute('aria-pressed', String(radioOn));
        toggle.innerHTML = `<span aria-hidden="true">📻</span> Radio ${radioOn ? 'on' : 'off'}`;
        if (!radioOn) stop();
      });

      // pop-up on the track
      const pop = document.createElement('div');
      pop.className = 'tr__pop'; pop.hidden = true;
      R.stage.appendChild(pop);
      let popTimer = null;
      const showPop = (c) => {
        const r = c.r;
        pop.style.setProperty('--team', r ? F1.team(r.Constructor.constructorId).color : '#8d887f');
        pop.innerHTML = `<span class="mono">Team radio · ${esc(c.lapTxt)}</span><b>${r ? F1.avatar(r.Driver, 'sm') : ''}${r ? r.Driver.familyName : `Car ${c.num}`}</b>${radioOn ? '<span class="mono tr__live">● Playing</span>' : '<button type="button" class="mono">▶ Listen</button>'}`;
        pop.hidden = false;
        pop.querySelector('button')?.addEventListener('click', () => { R.pause(); play(c.i, () => { pop.hidden = true; R.play(); }); pop.querySelector('button').outerHTML = '<span class="mono tr__live">● Playing</span>'; });
        clearTimeout(popTimer);
        if (!radioOn) popTimer = setTimeout(() => { if (current !== c.i) pop.hidden = true; }, 4500);
      };

      let lastT = R.T;
      replayEl.addEventListener('replay:tick', (e) => {
        const T = e.detail.T;
        if (!e.detail.playing || T < lastT || T - lastT > 120000) { lastT = T; return; }   // scrubbing / jumps don't fire clips
        const hit = clips.find((c) => c.at > lastT && c.at <= T);
        lastT = T;
        if (!hit) return;
        showPop(hit);
        if (radioOn) {
          R.pause();
          play(hit.i, () => { pop.hidden = true; R.play(); });
        }
      });
    };
    if (replayEl.__replay) hook(); else replayEl.addEventListener('replay:ready', hook, { once: true });
  }

  window.Radio = { mount };
})();
