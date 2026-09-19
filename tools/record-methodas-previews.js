/* Record the two Methodas pages into the looping preview videos the homepage plays
   in its lead magnet panels, moving through each page the way the old live panel did:
   next section every 4.2 s, scrolling 90 px/s in between.

     python -m http.server 8870      (from the repo root, in another terminal)
     node tools/record-methodas-previews.js [52]

   Needs Chrome and ffmpeg. Writes methodas_brand_education_preview.mp4 and
   methodas_52_frameworks_preview.mp4 at the repo root. */
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8870/';
const PORT = 9333;
const W = 1040;                   // the page width the live panel rendered at
const FPS = 25, SECTION_S = 4.2, SPEED = 90, MAX_SECTIONS = 9;

// click: step through the page's own chapter buttons. scroll: jump the scroll to each
// section block instead (clicking a 52 section opens its detail drawer over the page).
// h: the panel's desktop shape at that width (Home measures 1.07:1 and 0.90:1); poster: the still
// Home shows until the video plays
const JOBS = [
  { page: 'methodas_brand_education_standard.html', out: 'methodas_brand_education_preview.mp4', mode: 'click', h: 972,
    poster: 'Image/home/methodas-brand-education-poster.webp' },
  { page: 'methodas_52_frameworks.html', out: 'methodas_52_frameworks_preview.mp4', mode: 'scroll', h: 1150,
    poster: 'Image/home/methodas-52-frameworks-poster.webp' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const waiting = new Map(), listeners = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { const w = waiting.get(m.id); waiting.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); }
    else listeners.forEach(f => f(m));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waiting.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = method => new Promise(res => { const f = m => { if (m.method === method) { listeners.splice(listeners.indexOf(f), 1); res(m.params); } }; listeners.push(f); });
  return { send, once, close: () => ws.close() };
}

async function evaluate(c, expr) {
  const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result.value;
}

async function record(c, job) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmrec-'));
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: job.h, deviceScaleFactor: 1, mobile: false });
  const loaded = c.once('Page.loadEventFired');
  await c.send('Page.navigate', { url: BASE + job.page });
  await loaded; await sleep(2500);
  // same setup the panel did: no smooth scrolling, no scrollIntoView jumps
  const n = await evaluate(c, `(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    Element.prototype.scrollIntoView = function () {};
    if (${JSON.stringify(job.mode)} === 'scroll') {
      window.__items = [].filter.call(document.querySelectorAll('.ws[id]'), el => /^ws\\d+$/.test(el.id));
    } else {
      window.__items = document.querySelectorAll('.sn-item');
      if (!window.__items.length) window.__items = document.querySelectorAll('.chap-dot');
    }
    return window.__items.length;
  })()`);
  const sections = Math.max(1, Math.min(n || 1, MAX_SECTIONS));
  const frames = Math.round(sections * SECTION_S * FPS);
  console.log(`${job.page}: ${n} sections, recording ${sections} (${(frames / FPS).toFixed(1)} s)`);
  let cur = -1, y = 0;
  for (let f = 0; f < frames; f++) {
    const sec = Math.floor(f / (SECTION_S * FPS));
    if (sec !== cur) {
      cur = sec;
      if (job.mode === 'scroll') {
        y = await evaluate(c, `(() => { const it = window.__items[${sec}]; const t = it ? it.getBoundingClientRect().top + scrollY : 0; window.scrollTo(0, t); return scrollY; })()`);
      } else {
        y = 0;
        await evaluate(c, `(() => { const it = window.__items[${sec}]; if (it) it.click(); window.scrollTo(0, 0); })()`);
      }
      await sleep(700);
    } else {
      y += SPEED / FPS;
      await evaluate(c, `(() => { const h = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, Math.min(${y}, Math.max(0, h))); })()`);
    }
    const shot = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
  }
  const out = path.join(ROOT, job.out);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.jpg'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'f00000.jpg'), '-c:v', 'libwebp', '-quality', '80',
    path.join(ROOT, job.poster)]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`  -> ${job.out} ${(fs.statSync(out).size / 1e6).toFixed(2)} MB`);
}

(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'bmrec-prof-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, `--window-size=${W},1200`, 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = null;
    for (let i = 0; i < 40 && !targets; i++) {
      try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch (e) { await sleep(250); }
    }
    const page = targets.find(t => t.type === 'page');
    const c = await cdp(page.webSocketDebuggerUrl);
    await c.send('Page.enable'); await c.send('Runtime.enable');
    // optional argument: record only the pages whose file name contains it
    for (const job of JOBS) if (!process.argv[2] || job.page.includes(process.argv[2])) await record(c, job);
    c.close();
  } finally {
    chrome.kill();
    await sleep(500);
    fs.rmSync(prof, { recursive: true, force: true });
  }
})().catch(e => { console.error(e); process.exit(1); });
