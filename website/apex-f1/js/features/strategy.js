/* Tyre strategy chart: one horizontal bar per driver (finishing order), split
   into stints coloured by Pirelli compound. Compound letters + legend + table
   view so colour is never the only cue. Data: OpenF1 via F1.tyreStints. */
(() => {
  // Pirelli convention; inter green adjusted for red-green colour-blind separation (validated, all pairs)
  const TYRES = {
    SOFT: { c: '#e8322b', ink: '#fff', k: 'S', name: 'Soft' },
    MEDIUM: { c: '#ffd23f', ink: '#0a0a0b', k: 'M', name: 'Medium' },
    HARD: { c: '#eeeae2', ink: '#0a0a0b', k: 'H', name: 'Hard' },
    INTERMEDIATE: { c: '#47c97e', ink: '#0a0a0b', k: 'I', name: 'Intermediate' },
    WET: { c: '#2f7fd6', ink: '#fff', k: 'W', name: 'Wet' },
    UNKNOWN: { c: '#5a5852', ink: '#fff', k: '?', name: 'Unknown' },
  };
  const tyre = (c) => TYRES[c] || TYRES.UNKNOWN;
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  async function render(el, race, results) {
    el.innerHTML = `
      <div class="section__head"><h2 class="h2">Tyre <em>strategy.</em></h2><p class="source mono">Stints by compound · OpenF1</p></div>
      <div class="ts__loading skeleton" style="height:420px"></div>`;
    let data;
    try { data = await F1.tyreStints(race, results); } catch (e) { data = null; }
    if (!data || !Object.keys(data).length) {
      el.querySelector('.ts__loading').outerHTML = '<p class="state mono">Tyre data isn’t available for this race yet.</p>';
      return;
    }
    const total = Math.max(...results.map((r) => +r.laps || 0));
    const used = [...new Set(Object.values(data).flat().map((s) => s.compound))].sort((a, b) => Object.keys(TYRES).indexOf(a) - Object.keys(TYRES).indexOf(b));
    const pct = (lap) => (lap / total) * 100;
    const ticks = []; for (let l = 10; l < total; l += 10) ticks.push(l);

    const rows = results.map((r, i) => {
      const st = data[r.number] || [];
      const tm = F1.team(r.Constructor.constructorId);
      const finished = /^\d+$/.test(r.positionText);
      const segs = st.map((s, i) => {
        const t = tyre(s.compound), n = s.to - s.from + 1, last = i === st.length - 1;
        const tip = `${t.name} · laps ${s.from}–${s.to} (${n})${s.age ? ` · used set, +${s.age} laps` : ' · new set'}`;
        return `<span class="ts__seg${last ? ' is-last' : ''}" style="left:${pct(s.from - 1)}%;width:calc(${pct(n)}% - 2px);--c:${t.c};--ink:${t.ink}" data-tip="${esc(tip)}"><b>${t.k}</b></span>`;
      }).join('');
      const stops = Math.max(0, st.length - 1);
      const label = `${F1.fmt.name(r.Driver)}: ${st.map((s) => `${tyre(s.compound).name} laps ${s.from}–${s.to}`).join(', ') || 'no data'}`;
      return `
        <li class="ts__row" tabindex="0" aria-label="${esc(label)}" style="--team:${tm.color};--d:${i * 28}">
          <span class="ts__who"><span class="mono">${r.positionText}</span>${F1.avatar(r.Driver, 'sm')}<b>${r.Driver.code}</b></span>
          <span class="ts__track">${segs || `<span class="ts__none mono">${+r.laps === 0 ? 'Out on lap 1' : 'No tyre data'}</span>`}</span>
          <span class="ts__stops mono">${st.length ? `${stops} stop${stops === 1 ? '' : 's'}` : ''}${finished ? '' : ' · DNF'}</span>
        </li>`;
    }).join('');

    const table = `
      <table class="table ts__table"><thead><tr><th>Pos</th><th>Driver</th><th>Stints</th><th class="tnum">Stops</th></tr></thead><tbody>
      ${results.map((r) => { const st = data[r.number] || []; return `<tr><td class="pos">${r.positionText}</td><td>${F1.fmt.name(r.Driver)}</td><td class="mono" style="font-size:11px">${st.map((s) => `${tyre(s.compound).k} ${s.from}–${s.to}`).join(' → ') || '—'}</td><td class="tnum">${Math.max(0, st.length - 1)}</td></tr>`; }).join('')}
      </tbody></table>`;

    el.innerHTML = `
      <div class="section__head">
        <h2 class="h2">Tyre <em>strategy.</em></h2>
        <div class="ts__tools">
          <ul class="ts__legend" aria-label="Compounds">${used.map((c) => `<li><i style="--c:${tyre(c).c};--ink:${tyre(c).ink}">${tyre(c).k}</i>${tyre(c).name}</li>`).join('')}</ul>
          <button class="ts__toggle mono" type="button" aria-pressed="false">View as table</button>
        </div>
      </div>
      <div class="ts" style="--laps:${total}">
        <div class="ts__axis mono" aria-hidden="true"><span class="ts__axis-k">Lap</span><span class="ts__axis-t">${ticks.map((l) => `<i style="left:${pct(l)}%">${l}</i>`).join('')}<i style="left:100%">${total}</i></span></div>
        <ol class="ts__rows">
          <li class="ts__grid" aria-hidden="true">${ticks.map((l) => `<i style="left:${pct(l)}%"></i>`).join('')}</li>
          ${rows}
        </ol>
        <div class="ts__table-wrap table-wrap" hidden>${table}</div>
      </div>
      <p class="ts__note mono">Gaps between bars are pit stops. Hover a stint for laps and tyre age.</p>
      <div class="ts__tip" role="tooltip" hidden></div>`;

    // letters only where they fit (never clipped)
    el.querySelectorAll('.ts__seg').forEach((s) => { if (s.offsetWidth < 18) s.classList.add('is-tight'); });   // layout width, unaffected by the grow-in scale

    // grow the bars in once the chart is on screen
    const ts = el.querySelector('.ts');
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { ts.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.15 }).observe(ts);

    // hover / focus tooltip
    const tip = el.querySelector('.ts__tip');
    const show = (seg, x, y) => {
      const row = seg.closest('.ts__row');
      tip.replaceChildren();
      const strong = document.createElement('b'); strong.textContent = seg.dataset.tip.split(' · ')[0];
      const rest = document.createElement('span'); rest.textContent = seg.dataset.tip.split(' · ').slice(1).join(' · ');
      const who = document.createElement('span'); who.className = 'mono'; who.textContent = row.querySelector('.ts__who b').textContent;
      tip.append(who, strong, rest);
      tip.hidden = false;
      const r = el.getBoundingClientRect();
      tip.style.left = `${Math.min(x - r.left + 14, r.width - tip.offsetWidth - 4)}px`;
      tip.style.top = `${y - r.top + 14}px`;
    };
    el.querySelector('.ts__rows').addEventListener('pointermove', (e) => {
      const seg = e.target.closest('.ts__seg');
      if (seg) show(seg, e.clientX, e.clientY); else tip.hidden = true;
    });
    el.querySelector('.ts__rows').addEventListener('pointerleave', () => { tip.hidden = true; });
    el.querySelectorAll('.ts__row').forEach((row) => {
      row.addEventListener('focus', () => { const seg = row.querySelector('.ts__seg'); if (seg) { const b = seg.getBoundingClientRect(); show(seg, b.left, b.bottom); } });
      row.addEventListener('blur', () => { tip.hidden = true; });
    });

    // chart ⇄ table
    const btn = el.querySelector('.ts__toggle');
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'View as chart' : 'View as table';
      el.querySelector('.ts__rows').hidden = on;
      el.querySelector('.ts__axis').hidden = on;
      el.querySelector('.ts__table-wrap').hidden = !on;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }
  window.Strategy = { render };
})();
