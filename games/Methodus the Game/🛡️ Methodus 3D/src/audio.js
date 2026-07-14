// METHODUS — procedural synth audio (ported & expanded from the original engine).
// Zero asset files; everything is generated through the Web Audio API.

let AC = null;
let muted = false;
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  return AC;
}

// unlock on first interaction
['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
  window.addEventListener(ev, () => { const c = ac(); if (c && c.state === 'suspended') c.resume(); }, { passive: true }));

function tone(c, f0, f1, t0, dur, vol, type) {
  const o = c.createOscillator(); o.type = type || 'sine';
  o.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise(c, t0, dur, vol, cut) {
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut || 1100;
  const g = c.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(c.destination);
  s.start(t0); s.stop(t0 + dur);
}

export function sfx(kind) {
  if (reduce || muted) return;
  const c = ac(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const n = c.currentTime;
  switch (kind) {
    case 'pulse':   tone(c, 1320, 320, n, 0.10, 0.020, 'sawtooth'); break;
    case 'mgun':    tone(c, 900, 280, n, 0.05, 0.014, 'square'); break;
    case 'scatter': tone(c, 600, 160, n, 0.14, 0.03, 'sawtooth'); noise(c, n, 0.08, 0.03); break;
    case 'sword':   tone(c, 720, 1500, n, 0.10, 0.03, 'triangle'); noise(c, n, 0.05, 0.02, 3000); break;
    case 'rocket':  tone(c, 240, 120, n, 0.22, 0.04, 'sawtooth'); noise(c, n, 0.12, 0.03); break;
    case 'rail':    tone(c, 180, 2200, n, 0.30, 0.05, 'sawtooth'); break;
    case 'boom':    tone(c, 170, 46, n, 0.30, 0.07, 'sine'); noise(c, n, 0.20, 0.06); break;
    case 'hit':     tone(c, 420, 200, n, 0.06, 0.02, 'square'); break;
    case 'hurt':    tone(c, 210, 60, n, 0.18, 0.06, 'sawtooth'); noise(c, n, 0.12, 0.05); break;
    case 'heal':    tone(c, 420, 760, n, 0.18, 0.05, 'sine'); tone(c, 840, 1240, n + 0.04, 0.16, 0.03, 'triangle'); break;
    case 'shield':  tone(c, 500, 900, n, 0.18, 0.045, 'sine'); break;
    case 'pickup':  tone(c, 880, 1320, n, 0.07, 0.02, 'triangle'); break;
    case 'level':   [523, 659, 784, 1047].forEach((f, i) => tone(c, f, f, n + i * 0.07, 0.18, 0.04, 'triangle')); break;
    case 'deny':    tone(c, 150, 110, n, 0.12, 0.04, 'square'); break;
    case 'buy':     tone(c, 660, 990, n, 0.10, 0.035, 'square'); break;
    case 'boss':    tone(c, 120, 55, n, 1.0, 0.08, 'sawtooth'); tone(c, 84, 48, n, 1.0, 0.05, 'sine'); break;
    case 'win':     [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, f, f, n + i * 0.12, 0.22, 0.05, 'triangle')); break;
    case 'lose':    [400, 330, 262, 180].forEach((f, i) => tone(c, f, f, n + i * 0.15, 0.26, 0.06, 'sawtooth')); break;
  }
}

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

// ── procedural theme music (light ambient synth, space vibe) ──
let musID = null, musStep = 0;
const MUS_BASS = [55, 55, 73.42, 49];                          // low pulse roots
const MUS_ARP = [220, 261.63, 329.63, 392, 329.63, 261.63];   // A-minor-ish arpeggio
export function startMusic() {
  const c = ac(); if (!c || musID || reduce) return;
  if (c.state === 'suspended') c.resume();
  musStep = 0;
  musID = setInterval(() => {
    if (muted) return;
    const cc = ac(); if (!cc) return; const n = cc.currentTime;
    if (musStep % 4 === 0) { const b = MUS_BASS[(musStep / 4) % MUS_BASS.length]; tone(cc, b, b, n, 0.55, 0.05, 'triangle'); tone(cc, b * 2, b * 2, n, 0.4, 0.018, 'sine'); }
    const f = MUS_ARP[musStep % MUS_ARP.length] * 2; tone(cc, f, f, n, 0.2, 0.012, 'triangle');
    if (musStep % 8 === 6) { const p = MUS_ARP[musStep % MUS_ARP.length]; tone(cc, p, p, n, 1.1, 0.008, 'sine'); }
    musStep = (musStep + 1) % 24;
  }, 220);
}
export function stopMusic() { if (musID) { clearInterval(musID); musID = null; } }
