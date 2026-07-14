#!/usr/bin/env python3
# Make a short word sound scary: subtle pitch-down + a sub-octave layer + short reverb tail.
# usage: scary.py IN.wav OUT.wav [main_stretch] [sub_gain] [wet]
import wave, array, math, sys

inp, outp = sys.argv[1], sys.argv[2]
main_stretch = float(sys.argv[3]) if len(sys.argv) > 3 else 1.08   # >1 = deeper + a touch slower
sub_gain     = float(sys.argv[4]) if len(sys.argv) > 4 else 0.42   # octave-down layer level
wet          = float(sys.argv[5]) if len(sys.argv) > 5 else 0.18

w = wave.open(inp, 'rb')
n, ch, sr, sw = w.getnframes(), w.getnchannels(), w.getframerate(), w.getsampwidth()
a = array.array('h'); a.frombytes(w.readframes(n)); w.close()
if ch == 2:
    a = array.array('h', [ (a[i]+a[i+1])//2 for i in range(0, len(a), 2) ])
N = len(a)
x = [a[i]/32768.0 for i in range(N)]

def resample(src, factor):  # factor>1 => longer (lower pitch); linear interp
    out_len = max(1, int(len(src)*factor))
    out = [0.0]*out_len
    for i in range(out_len):
        p = i/factor
        i0 = int(p); i1 = min(i0+1, len(src)-1); fr = p-i0
        out[i] = src[i0]*(1-fr) + src[i1]*fr
    return out

main = resample(x, main_stretch)        # deepened main
sub  = resample(x, main_stretch*2.0)    # one octave below the deepened main
L = max(len(main), len(sub)) + int(sr*0.4)
y = [0.0]*L
for i in range(len(main)): y[i] += main[i]
for i in range(len(sub)):  y[i] += sub[i]*sub_gain

# short reverb tail for size
combs = [(0.029,0.5),(0.043,0.45),(0.061,0.4)]
rev = [0.0]*L
for ds, fb in combs:
    d = int(sr*ds); buf=[0.0]*d; idx=0
    for i in range(L):
        out = buf[idx]; buf[idx] = y[i] + out*fb; rev[i]+=out*0.28; idx+=1
        if idx>=d: idx=0
for i in range(L): y[i] = y[i]*(1-wet) + rev[i]*wet

# normalize-ish + soft clip with makeup
peak = max(1e-6, max(abs(v) for v in y))
g = (0.95/peak) if peak>0.95 else 1.15
o = array.array('h', bytes(2*L))
for i in range(L):
    v = math.tanh(y[i]*g)
    iv = int(v*32767); o[i] = 32767 if iv>32767 else (-32767 if iv<-32767 else iv)
wo = wave.open(outp,'wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(sr)
wo.writeframes(o.tobytes()); wo.close()
print(f"wrote {outp}: {L/sr:.2f}s  stretch={main_stretch} sub={sub_gain} wet={wet}")
