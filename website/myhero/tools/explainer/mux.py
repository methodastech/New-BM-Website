"""MyHero · lay the voice lines on the explainer timeline and make the MP4 (23 Oct 2026).
   python3 tools/explainer/mux.py <frames dir> <voice dir with l1..lN.wav> <out.mp4> [fps] [music.wav] [music gain 0..1]
   Scene starts come from the storyboard (SCENES in explainer.html); line i starts 0.3 s after scene i."""
import sys, os, re, wave, struct, subprocess, array
frames, vo, out = sys.argv[1], sys.argv[2], sys.argv[3]; FPS = int(sys.argv[4]) if len(sys.argv) > 4 else 24
MUSIC = sys.argv[5] if len(sys.argv) > 5 else None; MGAIN = float(sys.argv[6]) if len(sys.argv) > 6 else 0.3
HERE = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(HERE, 'explainer.html'), encoding='utf-8').read()
block = html.split('var SCENES=')[1].split(';')[0]  # SCENES=[0,7.1,...] (third cut) or [[0,'caption'],...] (older cuts)
starts = [float(x) for x in re.findall(r'\[(\d+(?:\.\d+)?),\'', block)] or [float(x) for x in re.findall(r'\d+(?:\.\d+)?', block)]
assert starts, 'no scene starts found in explainer.html'
END = float(re.search(r'var END=(\d+(?:\.\d+)?)', html).group(1))
RATE = 44100; total = int(END * RATE); mix = array.array('h', [0]) * (total * 2)
for i, st in enumerate(starts):
    p = os.path.join(vo, f'l{i+1}.wav')
    if not os.path.exists(p): continue
    w = wave.open(p); ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
    data = array.array('h'); data.frombytes(w.readframes(n)); w.close()
    assert sr == RATE and sw == 2, (sr, sw)
    if ch == 1: data = array.array('h', [v for v in data for _ in (0, 1)])
    off = int((st + 0.3) * RATE) * 2
    for k in range(min(len(data), len(mix) - off)):
        v = mix[off + k] + data[k]; mix[off + k] = max(-32768, min(32767, v))
if MUSIC and os.path.exists(MUSIC):
    m = wave.open(MUSIC); md = array.array('h'); md.frombytes(m.readframes(m.getnframes())); m.close()
    for k in range(min(len(md), len(mix))):
        v = mix[k] + int(md[k] * MGAIN); mix[k] = max(-32768, min(32767, v))
track = os.path.join(frames, '_voice.wav')  # beside the frames, never in the site
w = wave.open(track, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(mix.tobytes()); w.close()
import imageio_ffmpeg; ff = imageio_ffmpeg.get_ffmpeg_exe()
r = subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(frames, 'f%05d.jpg'), '-i', track,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', out], capture_output=True, text=True)
print('mp4', 'ok' if r.returncode == 0 else r.stderr[-400:], os.path.getsize(out) // 1024 if r.returncode == 0 else '', 'KB')
