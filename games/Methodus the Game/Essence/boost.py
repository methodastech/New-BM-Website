#!/usr/bin/env python3
# Loudness maximizer + concat for mono 16-bit WAV.
# usage: boost.py OUT.wav GAP_MS  IN1.wav:DRIVE_DB  [IN2.wav:DRIVE_DB ...]
# DRIVE_DB drives a tanh soft-clip: higher = louder + a touch of grit.
import wave, array, math, sys

def load(path):
    w = wave.open(path, 'rb')
    n, ch, sr, sw = w.getnframes(), w.getnchannels(), w.getframerate(), w.getsampwidth()
    a = array.array('h'); a.frombytes(w.readframes(n)); w.close()
    if ch == 2:  # downmix to mono
        a = array.array('h', [ (a[i]+a[i+1])//2 for i in range(0, len(a), 2) ])
    return a, sr

def rms_dbfs(a):
    if not a: return -120.0
    s = sum((x/32768.0)**2 for x in a)
    r = math.sqrt(s/len(a))
    return 20*math.log10(r) if r > 0 else -120.0

def process(a, drive_db):
    g = 10**(drive_db/20.0)
    out = array.array('h', bytes(2*len(a)))
    for i, x in enumerate(a):
        v = math.tanh((x/32768.0) * g)   # soft-clip
        iv = int(v * 32767)
        out[i] = 32767 if iv > 32767 else (-32767 if iv < -32767 else iv)
    return out

out_path = sys.argv[1]
gap_ms   = float(sys.argv[2])
specs    = sys.argv[3:]

result = array.array('h')
sr_out = 44100
for k, spec in enumerate(specs):
    path, drv = spec.rsplit(':', 1)
    a, sr = load(path); sr_out = sr
    pre = rms_dbfs(a)
    p = process(a, float(drv))
    print(f"{path}: {len(a)/sr:.2f}s  RMS {pre:.1f} -> {rms_dbfs(p):.1f} dBFS (drive {drv} dB)")
    if k > 0 and gap_ms > 0:
        result.extend(array.array('h', bytes(2*int(sr*gap_ms/1000.0))))
    result.extend(p)

w = wave.open(out_path, 'wb')
w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr_out)
w.writeframes(result.tobytes()); w.close()
print(f"wrote {out_path}: {len(result)/sr_out:.2f}s")
