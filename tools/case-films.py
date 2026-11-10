"""Make the case pages' films light (10 Nov).

The case films come from the design export as large MP4s (many 2560px wide, 3-15 MB) and every one of them used to
autoplay, so a case page downloaded all its films as soon as it opened. This script, run after each port:

  1. makes a WebM (VP9, at most 1600px wide, no sound) next to each MP4 a case page uses, when it is missing or older
     than its MP4; the MP4 stays as the fallback for browsers that do not play WebM;
  2. gives each case-page <video> the WebM as its first <source>, the MP4 second;
  3. swaps autoplay for data-bm-autoplay with preload="none": js/work6.js starts a film when it comes near the screen
     and pauses it when it leaves, so only the films being looked at are downloaded.

Films with their own play rule (data-loop-from, data-play-once) keep autoplay.

    python tools/case-films.py            # report only
    python tools/case-films.py --write    # encode what is missing and update the pages
"""
import glob
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = '--write' in sys.argv
PAGES = sorted(glob.glob(os.path.join(ROOT, 'work', 'work-*.html')))
MAX_W = 1600
VIDEO = re.compile(r'<video\b[^>]*>.*?</video>', re.S)


def disk(src):
    """The file a page's src points at (case pages carry <base href="../">; older ones use ../ paths)."""
    return os.path.normpath(os.path.join(ROOT, src[3:] if src.startswith('../') else src))


def films_in(html):
    out = []
    for v in VIDEO.finditer(html):
        out += re.findall(r'\bsrc="([^"]+\.mp4)"', v.group(0))
    return out


def stale(mp4):
    webm = mp4[:-4] + '.webm'
    return not os.path.exists(webm) or os.path.getmtime(webm) < os.path.getmtime(mp4)


def encode(mp4):
    webm = mp4[:-4] + '.webm'
    tmp = webm + '.part.webm'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34',
           '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-pix_fmt', 'yuv420p',
           '-vf', "scale='min(%d,iw)':-2" % MAX_W, tmp]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode or not os.path.exists(tmp):
        if os.path.exists(tmp):
            os.remove(tmp)
        return mp4, 'failed: ' + (r.stderr.strip().splitlines() or ['?'])[-1]
    os.replace(tmp, webm)
    return mp4, '%.1f MB -> %.1f MB' % (os.path.getsize(mp4) / 1e6, os.path.getsize(webm) / 1e6)


def rewrite_video(tag):
    """One <video>…</video>: WebM first, MP4 second, and start-on-approach instead of autoplay."""
    head_end = tag.index('>') + 1
    head, body = tag[:head_end], tag[head_end:]
    m = re.search(r'\ssrc="([^"]+\.mp4)"', head)
    if m:  # <video src="x.mp4"> -> sources inside
        src = m.group(1)
        head = head.replace(m.group(0), '')
        if os.path.exists(disk(src)[:-4] + '.webm'):
            body = '<source src="%s" type="video/webm; codecs=vp9"><source src="%s" type="video/mp4">' % (src[:-4] + '.webm', src) + body
        else:
            body = '<source src="%s" type="video/mp4">' % src + body
    else:  # <source src="x.mp4"> already: put the WebM before it
        def add(s):
            src = s.group(1)
            webm = src[:-4] + '.webm'
            if webm in body or not os.path.exists(disk(src)[:-4] + '.webm'):
                return s.group(0)
            return '<source src="%s" type="video/webm; codecs=vp9">%s' % (webm, s.group(0))
        body = re.sub(r'<source src="([^"]+\.mp4)" type="video/mp4">', add, body)
    if re.search(r'\sautoplay\b', head) and not re.search(r'data-loop-from|data-play-once', head):
        head = re.sub(r'\sautoplay\b(="[^"]*")?', ' data-bm-autoplay', head, count=1)
        head = re.sub(r'\spreload="[^"]*"', '', head)
        head = head[:-1] + ' preload="none">'
    return head + body


def main():
    films = {}
    for p in PAGES:
        for src in films_in(open(p, encoding='utf8').read()):
            films[disk(src)] = src
    present = [f for f in films if os.path.exists(f)]
    todo = [f for f in present if stale(f)]
    print('case films: %d (%d missing on disk), WebM to make: %d' % (len(films), len(films) - len(present), len(todo)))
    if not WRITE:
        print('report only; run with --write')
        return
    if todo:
        with ThreadPoolExecutor(max_workers=3) as ex:
            for mp4, note in ex.map(encode, todo):
                print('  %s: %s' % (os.path.relpath(mp4, ROOT), note))
    changed = 0
    for p in PAGES:
        s = open(p, encoding='utf8').read()
        t = VIDEO.sub(lambda m: rewrite_video(m.group(0)), s)
        if t != s:
            open(p, 'w', encoding='utf8', newline='').write(t)
            changed += 1
    mp4 = sum(os.path.getsize(f) for f in present)
    webm = sum(os.path.getsize(f[:-4] + '.webm') for f in present if os.path.exists(f[:-4] + '.webm'))
    print('pages updated: %d; films %.1f MB as MP4, %.1f MB as WebM' % (changed, mp4 / 1e6, webm / 1e6))


if __name__ == '__main__':
    main()
