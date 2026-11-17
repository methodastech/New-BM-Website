"""Build icon-reference.html: one page listing every icon from the FAR Capital build (website/farcapital/) and the
animated feature illustrations from the Premium sales page (premium-website/), for design reference (17 Nov 2026).

Internal: noindex and linked from nowhere. Everything is read from the 2 source pages at build time, so re-run it
after either page changes:

    python tools/build-icon-reference.py
"""
import html
import os
import re

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
    a = css.find('Beyond the website: 12 small scenes')
    a = css.rfind('/*', 0, a)
    nxt = [m.start() for m in re.finditer(r'/\* -{5,}', css) if m.start() > a + 10]
    return cards, css[a:nxt[0] if nxt else len(css)]


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
.rf-file{display:block;margin-top:8px;font:400 11px/1.3 "JetBrains Mono",monospace;color:#8a8fa3}
@media (max-width:1000px){.rf-sec--pre ul.bml-bxgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.rf-sec--pre ul.bml-bxgrid{grid-template-columns:1fr}.rf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rf-grid--line{grid-template-columns:repeat(3,minmax(0,1fr))}}
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
</head>
<body>
<div style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">%(sprite)s</div>
<header class="rf-top"><div class="rf-wrap">
<h1>Icon Reference</h1>
<p>Every icon in the FAR Capital build, and the animated feature illustrations from the Premium website page, for design reference. Hover a FAR Capital icon to see its hover motion; use Replay to run the entrance again.</p>
<nav class="rf-jump"><a href="#far-duo">FAR Capital duotone (%(n_duo)d)</a><a href="#far-line">FAR Capital line (%(n_line)d)</a><a href="#premium">Premium illustrations (%(n_pre)d)</a></nav>
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
<p>The 12 small scenes from "Beyond the website": white floating cards, ink bars for words, blue as the main colour. They loop while on screen.</p></div></div>
<ul class="bml-bxgrid">%(pre)s</ul>
</div></section>

<script>
(function(){
  var d=document;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) d.documentElement.classList.add('still');
  // FAR Capital icons: the entrance runs when the tile comes on screen ([data-rv].on), like on the source page
  var tiles=[].slice.call(d.querySelectorAll('[data-rv]'));
  // Premium scenes: they move only while on screen (.is-live), like on the source page
  var arts=[].slice.call(d.querySelectorAll('.bml-bxc-art'));
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
</body>
</html>
'''


def main():
    sprite, symbols, duo = far_icons()
    cards, pre_css = premium()
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
    out = PAGE
    for k, v in dict(far_css=far_css(), pre_css=pre_css, sprite=sprite, duo=duo_html, line=line_html, pre=pre_html,
                     n_duo=len(duo), n_line=len(symbols), n_pre=len(cards)).items():
        out = out.replace('%%(%s)s' % k, str(v)).replace('%%(%s)d' % k, str(v))
    open(OUT, 'w', encoding='utf-8', newline='').write(out)
    print('wrote %s: %d duotone, %d line icons, %d premium illustrations' % (os.path.relpath(OUT, ROOT), len(duo), len(symbols), len(cards)))


if __name__ == '__main__':
    main()
