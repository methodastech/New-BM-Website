"""MyHero · set the explainer timeline from the voice lengths and write the captions (23 Oct 2026).
   python3 tools/explainer/build.py <voice dir with l1..lN.wav> <out.vtt>
   Scene i starts when line i-1 has ended plus a beat; line i starts 0.3 s into its scene. The close holds longer."""
import sys, os, re, wave
vo, vtt = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); H = os.path.join(HERE, 'explainer.html')
LINES = [l.strip() for l in open(os.path.join(HERE, 'lines.txt'), encoding='utf-8') if l.strip()]
LEAD, TAIL, HOLD = 0.3, 0.9, 2.6
durs = []
for i in range(len(LINES)):
    w = wave.open(os.path.join(vo, f'l{i+1}.wav')); durs.append(w.getnframes() / w.getframerate()); w.close()
starts, t = [], 0.0
for d in durs: starts.append(round(t, 2)); t += LEAD + d + TAIL
END = round(t - TAIL + HOLD, 2)
html = open(H, encoding='utf-8').read()
html = re.sub(r'var SCENES=\[[^\]]*\];', 'var SCENES=[' + ','.join(str(s) for s in starts) + '];', html)
html = re.sub(r'var END=[\d.]+;', f'var END={END};', html)
open(H, 'w', encoding='utf-8').write(html)
def ts(x): return '%02d:%02d:%06.3f' % (x // 3600, x % 3600 // 60, x % 60)
cues = ['WEBVTT', '']
for i, (s, d, line) in enumerate(zip(starts, durs, LINES)):
    parts = re.split(r'(?<=[.?!])\s+', line); parts = [p for p in parts if p]
    # merge very short sentences into the one before so cues do not flash
    merged = []
    for p in parts:
        if merged and (len(p) < 24 or len(merged[-1]) < 24) and len(merged[-1]) + len(p) < 90: merged[-1] += ' ' + p
        else: merged.append(p)
    tot = sum(len(p) for p in merged); t0 = s + LEAD
    for p in merged:
        dd = d * len(p) / tot; cues += [f'{ts(t0)} --> {ts(t0 + dd - 0.05)}', p, '']; t0 += dd
open(vtt, 'w', encoding='utf-8').write('\n'.join(cues))
print('scenes', starts, 'end', END, 'cues', (len(cues) - 2) // 3)
