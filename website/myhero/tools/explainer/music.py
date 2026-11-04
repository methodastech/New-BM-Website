"""MyHero · a soft music bed for the explainer, made here, no library (23 Oct 2026).
   python3 tools/explainer/music.py <seconds> <out.wav>
   76 bpm, C major, a warm pad on C, Am, F, G with a light pluck line on top and a soft pulse; fades in and out.
   Meant to sit about 30 percent under the voice (mux.py --music)."""
import sys, math, wave, array, random
SEC = float(sys.argv[1]); OUT = sys.argv[2]; SR = 44100; N = int(SEC * SR)
random.seed(7)
def note(n): return 440.0 * 2 ** ((n - 69) / 12)
chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]   # C, Am, F, G (maj7 / m7)
bpm = 76; beat = 60 / bpm; bar = beat * 4
buf = [0.0] * N
# pad: each chord two bars, voices as soft sines with a gentle second harmonic, slow attack and release
t_pad = 0.0; ci = 0
while t_pad < SEC:
    ch = chords[ci % 4]; L = bar * 2; s0 = int(t_pad * SR); s1 = min(N, int((t_pad + L) * SR))
    for n in ch:
        f = note(n - 12); ph = random.random() * 6.28
        for i in range(s0, s1):
            x = (i - s0) / SR; env = min(1, x / 1.6) * min(1, (L - x) / 1.4)
            v = math.sin(2 * math.pi * f * (i / SR) + ph) * 0.045 + math.sin(2 * math.pi * f * 2 * (i / SR) + ph) * 0.012
            buf[i] += v * env
    t_pad += L; ci += 1
# pluck line: pentatonic, one soft note most beats, decaying quickly
penta = [72, 74, 76, 79, 81, 84]
t = beat * 2
while t < SEC - 1:
    if random.random() < 0.7:
        n = random.choice(penta); f = note(n); s0 = int(t * SR); L = int(0.9 * SR)
        for i in range(s0, min(N, s0 + L)):
            x = (i - s0) / SR; env = math.exp(-x * 4.5) * min(1, x / 0.004)
            buf[i] += (math.sin(2 * math.pi * f * x) * 0.9 + math.sin(2 * math.pi * f * 2 * x) * 0.25 + math.sin(2 * math.pi * f * 3 * x) * 0.08) * 0.05 * env
    t += beat * random.choice([1, 1, 2, 0.5])
# soft pulse on beats one and three
t = 0.0
while t < SEC:
    s0 = int(t * SR)
    for i in range(s0, min(N, s0 + int(0.25 * SR))):
        x = (i - s0) / SR; buf[i] += math.sin(2 * math.pi * 55 * x) * 0.06 * math.exp(-x * 14)
    t += beat * 2
# fades and normalise to about -18 dBFS peak
peak = max(abs(v) for v in buf) or 1; g = 0.125 / peak
out = array.array('h')
for i, v in enumerate(buf):
    x = i / SR; fade = min(1, x / 2.5) * min(1, (SEC - x) / 3.0)
    s = max(-1, min(1, v * g * fade)); out.append(int(s * 32767)); out.append(int(s * 32767))
w = wave.open(OUT, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
print('music', OUT, round(SEC, 1), 's')
