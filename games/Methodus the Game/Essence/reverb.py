#!/usr/bin/env python3
# Diegetic reverb for mono 16-bit WAV: early reflections + a short feedback tail,
# plus gentle level. Makes a dry TTS read sit in an outdoor/valley space.
# usage: reverb.py IN.wav OUT.wav [wet] [drive_db]
import wave, array, math, sys

inp, outp = sys.argv[1], sys.argv[2]
wet = float(sys.argv[3]) if len(sys.argv) > 3 else 0.26
drive_db = float(sys.argv[4]) if len(sys.argv) > 4 else 3.0

w = wave.open(inp, 'rb')
n, ch, sr, sw = w.getnframes(), w.getnchannels(), w.getframerate(), w.getsampwidth()
a = array.array('h'); a.frombytes(w.readframes(n)); w.close()
if ch == 2:
    a = array.array('h', [ (a[i]+a[i+1])//2 for i in range(0, len(a), 2) ])
N = len(a)
x = [a[i]/32768.0 for i in range(N)]

# tail buffer with extra room for reverb to ring out
TAIL = int(sr*1.2)
y = [0.0]*(N+TAIL)

# early reflections (ms, gain)
early = [(11,0.5),(23,0.4),(37,0.32),(53,0.26),(71,0.2)]
for ms,g in early:
    d = int(sr*ms/1000.0)
    for i in range(N):
        y[i+d] += x[i]*g

# feedback comb filters for a smooth tail (outdoor-ish, short)
combs = [(0.030,0.5),(0.041,0.46),(0.053,0.42),(0.067,0.38)]
for delay_s, fb in combs:
    d = int(sr*delay_s)
    buf = [0.0]*d; idx = 0
    for i in range(N+TAIL):
        xin = x[i] if i < N else 0.0
        out = buf[idx]
        buf[idx] = xin + out*fb
        y[i] += out*0.3
        idx += 1
        if idx >= d: idx = 0

# mix dry + wet, makeup, soft-clip
g = 10**(drive_db/20.0)
out = array.array('h', bytes(2*(N+TAIL)))
for i in range(N+TAIL):
    dry = x[i] if i < N else 0.0
    v = (dry*(1-wet) + y[i]*wet) * g
    v = math.tanh(v)
    iv = int(v*32767)
    out[i] = 32767 if iv>32767 else (-32767 if iv<-32767 else iv)

o = wave.open(outp, 'wb')
o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes(out.tobytes()); o.close()
print(f"wrote {outp}: {(N+TAIL)/sr:.2f}s  wet={wet} drive={drive_db}")
