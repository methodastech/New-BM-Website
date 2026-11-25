"""Build icon-reference.html: one page listing every icon from the FAR Capital build (website/farcapital/) and the
animated feature illustrations and process step scenes from the Premium sales page (premium-website/), for design
reference (17 Nov 2026; process scenes added 18 Nov), and the Methodas OS screen and module chip from the home page.

Internal: noindex and linked from nowhere. Everything is read from the source pages at build time, so re-run it
after any of them changes:

    python tools/build-icon-reference.py

To also save a copy that opens on its own outside the repo (stylesheet and poster images built in; the 2 Methodas
screen recordings shrunk with ffmpeg into <folder>/assets/methodas/, so only the web fonts need a connection):

    python tools/build-icon-reference.py --copy-to "C:\\Users\\user\\Downloads\\BM-52-Frameworks-Module"
"""
import base64
import html
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'icon-reference.html')
FAR = os.path.join(ROOT, 'website', 'farcapital')
PRE = os.path.join(ROOT, 'premium-website')

# FAR Capital CSS rules that style an icon only inside 1 section of that page: left out, so every icon shows plain
CONTEXT = re.compile(r'\.(fm-gx|gx-[\w-]+|tier[\w-]*|tools|svc|steps|fx|bens|cb|ch|scr|qs|qa-ask|hd|dl-loc|chan|btn|opts|lnk2|'
                     r'burger|nx-b|lnk|nv|cb-n|demo)\b')


def read(p):
    return open(p, encoding='utf-8').read()


def blocks(css):
    """Split CSS into top-level (prelude, body) items, keeping nested blocks (@media) as raw text."""
    out, i, n = [], 0, len(css)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    n = len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        pre = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        out.append((pre, css[j + 1:k - 1]))
        i = k
    return out


def keep_rule(sel):
    parts = [p.strip() for p in sel.split(',')]
    parts = [p for p in parts if re.search(r'\.bi\b|(^|\s)\.i\b', p) and not CONTEXT.search(p)]
    # scoped to the FAR Capital sections, so a class like .i cannot reach the Premium drawings
    scoped = []
    for p in parts:
        m = re.match(r'(html(?:[.:][\w().:-]+)*)\s+(.*)$', p)
        scoped.append('%s .rf-sec--far %s' % (m.group(1), m.group(2)) if m else '.rf-sec--far ' + p)
    return ','.join(scoped)


def far_css():
    css = read(os.path.join(FAR, 'assets', 'site.css'))
    out = []
    for pre, body in blocks(css):
        if pre.startswith(':root'):
            out.append(':root{%s}' % body)
        elif pre.startswith('@keyframes'):
            if re.match(r'@keyframes\s+(bi-[\w-]+|redraw)\b', pre):
                out.append('%s{%s}' % (pre, body))
        elif pre.startswith('@media') or pre.startswith('@supports'):
            inner = []
            for p2, b2 in blocks(body):
                s2 = keep_rule(p2)
                if s2:
                    inner.append('%s{%s}' % (s2, b2))
            if inner:
                out.append('%s{%s}' % (pre, ''.join(inner)))
        elif not pre.startswith('@'):
            s = keep_rule(pre)
            if s:
                out.append('%s{%s}' % (s, body))
    return '\n'.join(out)


def far_icons():
    s = read(os.path.join(FAR, 'index.html'))
    sprite = re.search(r'<svg\b[^>]*>(?:(?!</svg>).)*?<symbol\b.*?</svg>', s, re.S)
    symbols = re.findall(r'<symbol\b[^>]*id="([^"]+)"', s)
    seen, duo = {}, []
    for m in re.finditer(r'<svg\b[^>]*class="(bi [^"]*)"[^>]*>.*?</svg>', s, re.S):
        name = next((c for c in m.group(1).split() if c.startswith('bi-')), 'bi')
        key = re.sub(r'\s+', ' ', m.group(0))
        key = re.sub(r'\s(aria-hidden|style)="[^"]*"', '', key)
        if key in seen:
            continue
        seen[key] = 1
        n = sum(1 for d in duo if d[0] == name)
        svg = re.sub(r'\saria-hidden="true"', '', m.group(0))
        duo.append((name, svg, n))
    duo.sort(key=lambda d: (d[0], d[2]))
    return sprite.group(0) if sprite else '', symbols, duo


def premium():
    s = read(os.path.join(PRE, 'index.html'))
    cards = re.findall(r'<li class="bml-bxc\b.*?</li>', s, re.S)
    css = read(os.path.join(PRE, 'assets', 'bml.css'))
    m = re.search(r'Beyond the website: \d+ small scenes', css)
    if not m:
        raise SystemExit('bml.css: the "Beyond the website" scene block was not found')
    a = css.rfind('/*', 0, m.start())
    nxt = [m.start() for m in re.finditer(r'/\* -{5,}', css) if m.start() > a + 10]
    return cards, css[a:nxt[0] if nxt else len(css)]


def process():
    """The 2 rows of process scenes (bml-pf): 'From first call to live' (set A) and 'What happens after you enquire' (set B)."""
    s = read(os.path.join(PRE, 'index.html'))
    rows = []
    for cls in ('bml-steps--pfa', 'bml-steps--pfb'):
        i = s.find('<ol class="bml-steps %s"' % cls)
        if i < 0:
            raise SystemExit('premium page: the %s steps were not found' % cls)
        steps = re.findall(r'<li class="bml-step\b.*?</li>(?=\s*<li|\s*</ol>)', s[i:s.find('</ol>', i) + 5], re.S)
        rows.append((cls, steps))
    css = read(os.path.join(PRE, 'assets', 'bml.css'))
    a = css.find('/* Sales page 2: the process')
    b = css.find('/* ---------- Beyond the website', a)
    if a < 0 or b < 0:
        raise SystemExit('bml.css: the process scene block was not found')
    return rows, css[a:b]


def methodas():
    """The home page's 2 Methodas OS stages (live screen wired to its module chip), its scripts, and nothing else of the section."""
    s = read(os.path.join(ROOT, 'index.html'))
    i = s.find('<section class="bmx-lm" id="free-tools">')
    sec = s[i:s.find('</section>', i)]
    items = re.findall(r'<div class="bmx-lm-item (bmx-lm-item--\w+)">(<div class="bmx-lm-stage\b.*?<svg class="bmx-lm-bus"[^>]*></svg></div>)', sec, re.S)
    js = [re.search(r'<script id="%s">.*?</script>' % k, s, re.S) for k in ('bm-methodas-lm', 'bm-preview-videos')]
    css = re.search(r'<link id="bm-methodas-lm" rel="stylesheet" href="([^"]+)"', s)
    if i < 0 or len(items) < 2 or not all(js) or not css:
        raise SystemExit('home page: the Methodas OS section changed (%d stages)' % len(items))
    stages = [(cls, re.sub(r'(class="bmx-lm-stage) rv"', r'\1"', st)) for cls, st in items]
    # shapes the stages borrow by <use href="#id"> (the METHODAS OS wordmark): copy the hidden <svg> that holds each one
    defs = []
    for ref in sorted(set(re.findall(r'<use[^>]*href="#([\w-]+)"', ''.join(st for _, st in stages)))):
        m = re.search(r'\sid="%s"' % re.escape(ref), s)
        a = s.rfind('<svg', 0, m.start()) if m else -1
        if a < 0:
            raise SystemExit('home page: the shape #%s was not found' % ref)
        block = s[a:s.find('</svg>', m.start()) + 6]
        if block not in defs:
            defs.append(block)
    return stages, ''.join(m.group(0) for m in js), css.group(1), ''.join(defs)


PAGE = '''<!doctype html>
<html lang="en" class="js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Icon Reference | Brand Method</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style id="ref-page">
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#0b0d1a;font:15px/1.5 Inter,system-ui,sans-serif}
.rf-wrap{max-width:1320px;margin:0 auto;padding:0 clamp(16px,4vw,48px)}
.rf-top{padding:clamp(40px,6vw,72px) 0 24px;border-bottom:1px solid #e6e7ee}
.rf-top h1{font:400 clamp(34px,5vw,56px)/1.05 Fraunces,Georgia,serif;letter-spacing:-.02em;margin:0 0 10px}
.rf-top p{margin:0;color:#5b6070;max-width:70ch}
.rf-jump{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.rf-jump a,.rf-btn{font:500 11px/1 "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;padding:11px 14px;border:1px solid #d9dbe6;color:inherit;text-decoration:none;background:#fff;cursor:pointer}
.rf-jump a:hover,.rf-btn:hover{border-color:#1a26de;color:#1a26de}
.rf-sec{padding:clamp(36px,5vw,64px) 0;border-bottom:1px solid #e6e7ee;scroll-margin-top:12px}
.rf-sec--far{background:#F5F3EE}
.rf-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:22px}
.rf-head h2{font:400 clamp(24px,3vw,34px)/1.1 Fraunces,Georgia,serif;margin:0}
.rf-head p{margin:6px 0 0;color:#5b6070;max-width:70ch}
.rf-k{font:500 11px/1 "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#A3182A;margin-bottom:10px}
.rf-sec--pre .rf-k{color:#1a26de}
.rf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;list-style:none;margin:0;padding:0}
.rf-grid--line{grid-template-columns:repeat(auto-fill,minmax(112px,1fr))}
.rf-tile{background:#fff;border:1px solid rgba(20,18,23,.08);display:grid;justify-items:center;gap:12px;padding:22px 10px 14px;min-width:0}
.rf-ic{display:grid;place-items:center;height:84px}
.rf-ic .bi{width:68px;height:68px}
.rf-ic .i{width:40px;height:40px;stroke-width:1.6;color:#141217}
.rf-grid--line .rf-ic{height:52px}
.rf-tile code{font:400 11px/1.3 "JetBrains Mono",monospace;color:#5E6468;text-align:center;word-break:break-word}
.rf-big{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
.rf-big .rf-tile{padding:28px 22px 14px}
.rf-big .rf-ic{height:auto}
.rf-big .bi{width:104px;height:104px}
.rf-sec--pre ul.bml-bxgrid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(12px,1.4vw,20px)}
.bml-bxc{display:grid;align-content:start;background:#fff;border:1px solid #e2e6f1;transition:border-color .25s ease;opacity:1!important;transform:none!important}
.bml-bxc:hover{border-color:#1a26de}
.bml-bxc-art{display:grid;place-items:center;background:#eef2fd;padding:clamp(10px,1.2vw,16px);color:#0b0d1a}
.bml-bxc-art>svg{width:100%;height:auto;display:block}
.bml-bxc-b{padding:clamp(14px,1.6vw,22px)}
.bml-bxc h3{display:flex;align-items:flex-start;gap:9px;margin:0;font:400 1.2rem/1.15 Fraunces,Georgia,serif;letter-spacing:-.01em}
.bml-bxc-ico{flex:none;width:22px;height:22px;color:#1a26de}
.bml-bxc p{margin:8px 0 0;font-size:14px;line-height:1.5;color:#474b5c}
.rf-sec--pre ol.bml-steps{--sg:clamp(16px,2vw,30px);list-style:none;margin:0 0 34px;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sg)}
.rf-sec--pre ol.bml-steps--pfb{grid-template-columns:repeat(3,minmax(0,1fr))}
.rf-sub{font:500 11px/1 "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#5b6070;margin:0 0 12px}
.bml-step{position:relative;display:grid;align-content:start;background:#fff;border:1px solid #e2e6f1}
.bml-step-art{position:relative;background:#eef2fd}
.bml-step:not(:last-child) .bml-step-art::after{content:"\\2192";position:absolute;right:calc(var(--sg)/-2 - 1px);top:50%;transform:translate(50%,-50%);font:400 24px/1 Inter,sans-serif;color:#1a26de;z-index:2}
.bml-step-b{padding:clamp(14px,1.6vw,22px)}
.bml-step-h{display:flex;align-items:baseline;gap:10px;margin:0;font:400 1.2rem/1.15 Fraunces,Georgia,serif;letter-spacing:-.01em}
.bml-step-h b{font-weight:400;color:#1a26de}
.bml-step-b p{display:none}
.rf-file{display:block;margin-top:8px;font:400 11px/1.3 "JetBrains Mono",monospace;color:#8a8fa3}
@media (max-width:1000px){.rf-sec--pre ul.bml-bxgrid,.rf-sec--pre ol.bml-steps,.rf-sec--pre ol.bml-steps--pfb{grid-template-columns:repeat(2,minmax(0,1fr))}.rf-sec--pre .bml-step .bml-step-art::after{display:none}}
@media (max-width:560px){.rf-sec--pre ul.bml-bxgrid{grid-template-columns:1fr}.rf-sec--pre ol.bml-steps,.rf-sec--pre ol.bml-steps--pfb{grid-template-columns:1fr}.rf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rf-grid--line{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style>
<style id="far-icons">
/* from website/farcapital/assets/site.css: the icon rules only */
%(far_css)s
</style>
<style id="premium-scenes">
/* from premium-website/assets/bml.css: the feature illustration block */
.rf-sec--pre{--bml-accent:#1a26de;--bml-tint:#dde5fb;--bml-ink:#0b0d1a}
%(pre_css)s
</style>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&amp;display=swap">
<link rel="stylesheet" href="%(lm_css)s">
<style id="methodas-base">
/* from css/home.css and the home page: the screen base and the video fill that css/methodas-lm.css builds on */
.rf-lm{--accent:#1a26de;--muted:#474747;--font-display:'Fraunces',Georgia,serif;--font-sans:'Inter',sans-serif;--font-body:'Inter',sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace;--ease:cubic-bezier(0.25,0.46,0.45,0.94)}
.rf-lm .bmx-scr-stage{position:relative;aspect-ratio:1280/756;overflow:hidden;background:#0d1226}
.bmx-scr-stage .bm-scr-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
html body .rf-lm.bmx-lm{padding:0;background:none}
.rf-lm .bmx-lm-grid{margin-top:0}
.rf-lm .rf-file{margin-top:14px}
</style>
<style id="premium-process">
/* from premium-website/assets/bml.css: the process scene block (bml-pf) */
%(pf_css)s
</style>
</head>
<body>
<div style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">%(sprite)s</div>
<header class="rf-top"><div class="rf-wrap">
<h1>Icon Reference</h1>
<p>Every icon in the FAR Capital build, and the animated feature illustrations and process step scenes from the Premium website page, for design reference. Hover a FAR Capital icon to see its hover motion; use Replay to run the entrance again.</p>
<nav class="rf-jump"><a href="#far-duo">FAR Capital duotone (%(n_duo)d)</a><a href="#far-line">FAR Capital line (%(n_line)d)</a><a href="#premium">Premium illustrations (%(n_pre)d)</a><a href="#process">Premium process steps (%(n_pf)d)</a><a href="#methodas">Methodas OS (%(n_lm)d)</a></nav>
</div></header>

<section class="rf-sec rf-sec--far" id="far-duo"><div class="rf-wrap">
<div class="rf-head"><div><div class="rf-k">website/farcapital &middot; class="bi"</div><h2>FAR Capital duotone icons</h2>
<p>64 by 64, a rose tint offset behind an ink line, a maroon accent. On entrance the line draws in, the tint slides into place, then the accent pops.</p></div>
<button class="rf-btn" type="button" data-replay="far-duo">Replay</button></div>
<ul class="rf-grid">%(duo)s</ul>
</div></section>

<section class="rf-sec rf-sec--far" id="far-line"><div class="rf-wrap">
<div class="rf-head"><div><div class="rf-k">website/farcapital &middot; &lt;use href="#id"&gt;</div><h2>FAR Capital line icons</h2>
<p>The shared sprite: 48 by 48 strokes in currentColor, with the second stroke in the accent (--ac2).</p></div></div>
<ul class="rf-grid rf-grid--line">%(line)s</ul>
</div></section>

<section class="rf-sec rf-sec--pre" id="premium"><div class="rf-wrap">
<div class="rf-head"><div><div class="rf-k">premium-website &middot; class="bml-bx"</div><h2>Premium website feature illustrations</h2>
<p>The %(n_pre)d small scenes from "Beyond the website": white floating cards, ink bars for words, blue as the main colour. They loop while on screen.</p></div></div>
<ul class="bml-bxgrid">%(pre)s</ul>
</div></section>

<section class="rf-sec rf-sec--pre" id="process"><div class="rf-wrap">
<div class="rf-head"><div><div class="rf-k">premium-website &middot; class="bml-pf"</div><h2>Premium website process steps</h2>
<p>The moving interface scenes on the process cards, each in its own step colour. On a wide screen the steps play in turn, left to right, with the line under each one marking its turn; on a narrow screen they all play together.</p></div></div>
%(pf)s
</div></section>

<section class="rf-sec" id="methodas"><div class="rf-wrap">
<div class="rf-head"><div><div class="rf-k" style="color:#1a26de">index.html &middot; #free-tools &middot; class="bmx-lm-stage"</div><h2>Methodas OS screen and module chip</h2>
<p>From the home page section "Grow sales with the method behind 100+ brands": a Methodas OS screen playing the live module, wired to its module chip. The wires are drawn by script from the live positions, so they follow the layout at any width.</p></div></div>
%(lm_defs)s<div class="bmx-lm rf-lm"><div class="bmx-lm-grid">%(lm)s</div></div>
</div></section>

<script>
(function(){
  var d=document;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) d.documentElement.classList.add('still');
  // FAR Capital icons: the entrance runs when the tile comes on screen ([data-rv].on), like on the source page
  var tiles=[].slice.call(d.querySelectorAll('[data-rv]'));
  // Premium scenes: they move only while on screen (.is-live), like on the source page
  var arts=[].slice.call(d.querySelectorAll('.bml-bxc-art,ol.bml-steps'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    tiles.forEach(function(t){io.observe(t);});
    var live=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('is-live',e.isIntersecting);});},{rootMargin:'80px 0px'});
    arts.forEach(function(a){live.observe(a);});
  } else { tiles.forEach(function(t){t.classList.add('on');}); arts.forEach(function(a){a.classList.add('is-live');}); }
  d.addEventListener('click',function(e){
    var b=e.target.closest('[data-replay]'); if(!b) return;
    var sec=d.getElementById(b.getAttribute('data-replay'));
    var ts=[].slice.call(sec.querySelectorAll('[data-rv]'));
    ts.forEach(function(t){t.classList.remove('on');}); void sec.offsetWidth;
    requestAnimationFrame(function(){ts.forEach(function(t){t.classList.add('on');});});
  });
})();
</script>
%(lm_js)s
</body>
</html>
'''


def main():
    sprite, symbols, duo = far_icons()
    cards, pre_css = premium()
    pf_rows, pf_css = process()
    lm_stages, lm_js, lm_css, lm_defs = methodas()
    if not symbols or not duo or len(cards) < 12:
        raise SystemExit('source pages changed: %d line, %d duotone, %d premium' % (len(symbols), len(duo), len(cards)))
    e = lambda x: html.escape(x, quote=True)
    duo_html = ''.join('<li class="rf-tile" data-rv style="--d:%.2fs"><div class="rf-ic">%s</div><code>%s%s</code></li>'
                       % ((i % 8) * .05, svg, e(name), ' (%d)' % (n + 1) if n else '') for i, (name, svg, n) in enumerate(duo))
    line_html = ''.join('<li class="rf-tile"><div class="rf-ic"><svg class="i" aria-hidden="true"><use href="#%s"></use></svg></div><code>%s</code></li>'
                        % (e(sid), e(sid)) for sid in symbols)
    pre_html = ''
    for c in cards:
        c = re.sub(r'\sbml-reveal\b', '', c)   # shown at once here, no entrance
        m = re.search(r'bml-bx--([\w-]+)', c)
        name = m.group(1) if m else ''
        pre_html += re.sub(r'</p>(\s*</div>\s*</li>)$', lambda k: '</p><span class="rf-file">bml-bx--%s</span>' % e(name) + k.group(1), c, count=1)
    titles = {'bml-steps--pfa': 'From first call to live (bml-steps--pfa)',
              'bml-steps--pfb': 'What happens after you enquire (bml-steps--pfb)'}
    pf_html = ''
    for cls, steps in pf_rows:
        lis = ''
        for st in steps:
            st = re.sub(r'\sbml-reveal\b', '', st)
            m = re.search(r'bml-pf--((?:flow|after)-[\w-]+)', st)
            tag = '<span class="rf-file">bml-pf--%s</span>' % e(m.group(1) if m else '')
            lis += re.sub(r'</h3>', lambda k: '</h3>' + tag, st, count=1)
        pf_html += '<p class="rf-sub">%s</p><ol class="bml-steps %s">%s</ol>' % (titles[cls], cls, lis)
    lm_names = {'bmx-lm-item--pb': 'Brand Growth playbook (#bmx-mc-pb)', 'bmx-lm-item--fw': '52 Conversion framework (#bmx-mc-fw)'}
    lm_html = ''.join('<div class="bmx-lm-item %s">%s<span class="rf-file">%s</span></div>' % (cls, st, e(lm_names.get(cls, cls)))
                      for cls, st in lm_stages)
    out = PAGE
    for k, v in dict(far_css=far_css(), pre_css=pre_css, sprite=sprite, duo=duo_html, line=line_html, pre=pre_html,
                     n_duo=len(duo), n_line=len(symbols), n_pre=len(cards), pf_css=pf_css, pf=pf_html,
                     n_pf=sum(len(st) for _, st in pf_rows), lm=lm_html, lm_js=lm_js, lm_defs=lm_defs, lm_css=lm_css, n_lm=len(lm_stages)).items():
        out = out.replace('%%(%s)s' % k, str(v)).replace('%%(%s)d' % k, str(v))
    open(OUT, 'w', encoding='utf-8', newline='').write(out)
    print('wrote %s: %d duotone, %d line icons, %d premium illustrations, %d process steps'
          % (os.path.relpath(OUT, ROOT), len(duo), len(symbols), len(cards), sum(len(st) for _, st in pf_rows)))
    if '--copy-to' in sys.argv:
        standalone(out, sys.argv[sys.argv.index('--copy-to') + 1])


def standalone(out, folder):
    """The same page with nothing left that points into the repo: CSS inlined, posters as data, light videos beside it."""
    def css(m):
        return '<style>%s</style>' % read(os.path.join(ROOT, m.group(1).split('?')[0]))
    out = re.sub(r'<link rel="stylesheet" href="((?!https?:)[^"]+\.css[^"]*)">', css, out)

    def poster(m):
        data = open(os.path.join(ROOT, m.group(1)), 'rb').read()
        return 'poster="data:image/webp;base64,%s"' % base64.b64encode(data).decode()
    out = re.sub(r'poster="((?!https?:|data:)[^"]+\.webp)"', poster, out)
    vdir = os.path.join(folder, 'assets', 'methodas')

    def video(m):
        src = os.path.join(ROOT, m.group(2))
        name = os.path.basename(m.group(2))
        dest = os.path.join(vdir, name)
        if not os.path.isfile(dest) or os.path.getmtime(dest) < os.path.getmtime(src):
            os.makedirs(vdir, exist_ok=True)
            # 960 wide is twice the size it shows at; 24 fps, no sound, starts playing before it has fully loaded
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-an', '-vf', 'scale=960:-2:flags=lanczos,fps=24',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
                            '-movflags', '+faststart', dest], check=True)
            print('  video %s: %d KB -> %d KB' % (name, os.path.getsize(src) // 1024, os.path.getsize(dest) // 1024))
        return '%s="assets/methodas/%s"' % (m.group(1), name)
    out = re.sub(r'(data-src|src)="((?!https?:|data:|#)Image/[^"]+\.mp4)"', video, out)
    left = re.findall(r'(?:src|href|poster)="(?!https?:|data:|#|mailto:|assets/methodas/)([^"]+)"', out)
    if left:
        raise SystemExit('the copy would still point into the repo: %s' % ', '.join(sorted(set(left))))
    dest = os.path.join(folder, 'icon-reference.html')
    open(dest, 'w', encoding='utf-8', newline='').write(out)
    print('copied to %s (%d KB, works on its own)' % (dest, len(out.encode('utf-8')) // 1024))


if __name__ == '__main__':
    main()
