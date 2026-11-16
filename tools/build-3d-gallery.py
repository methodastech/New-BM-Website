"""Build 3d-gallery.html: a hidden page that showcases Brand Method's 3D work (16 Nov 2026).

Hidden: not in the menu, the Work hub, the sitemap or any link, and marked noindex. Open it by its address.
Built on the Mascot Gallery page (same menu, hero, closing band and footer), with the gallery body swapped for 3D cards.
Add or change a project in PROJECTS below, then run:

    python tools/build-3d-gallery.py
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '3d-gallery.html')

# media: ('video', webm or '', mp4, poster) | ('image', src)
PROJECTS = [
    dict(name='Mindtropic', cat='Animated 3D mark', line='The brain mark, modelled in soft blue and turning slowly on Mindtropic blue.',
         tags=['3D animation', 'Logo'], href='work/work-mindtropic.html', cta='See the case study', ac='#2F5BFF',
         media=('video', 'Image/work6/mindtropic/film-mark3d.webm', 'Image/work6/mindtropic/film-mark3d.mp4', 'Image/work6/mindtropic/film-mark3d-poster.webp')),
    dict(name='BOOM+', cat='Interactive 3D website', line='Interactive 3D product site for an isotonic vitamin C drink, in four flavours.',
         tags=['Beverage', '3D', 'Interactive'], href='website/boom/', cta='View live demo', ac='#E5177E', live=True,
         media=('image', 'Image/portfolio/boom-ss.webp')),
    dict(name='Teask', cat='Interactive 3D website', line='3D site for a portable solar EV charging station you can explore part by part.',
         tags=['Clean energy', 'EV charging', '3D'], href='website/teask/', cta='View live demo', ac='#0084D6', live=True,
         media=('image', 'Image/portfolio/teask-ss.webp')),
    dict(name='Brand Method mascots', cat='3D characters', line='A butler bear, a delivery rider bunny, a ninja and a gentleman horse, brought into 3D.',
         tags=['Mascot', '3D character'], href='mascot-gallery.html', cta='See the Mascot Gallery', ac='#7A4DFF',
         media=('image', 'Image/mascot/cast-refined-poster.webp')),
    dict(name='Firmus', cat='3D mockup', line='The Firmus presentation folder lying on black, a letterhead tucked under it.',
         tags=['Stationery', '3D mockup'], href='work/work-firmus.html', cta='See the case study', ac='#B9893F',
         media=('image', 'Image/work6/firmus/obj-folder-3d.webp')),
    dict(name='Firmus', cat='3D mockup', line='The two Firmus letterhead layouts fanned out on black.',
         tags=['Stationery', '3D mockup'], href='work/work-firmus.html', cta='See the case study', ac='#B9893F',
         media=('image', 'Image/work6/firmus/obj-letters-3d.webp')),
]

ARROW = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>'


def card(p):
    e = lambda s: html.escape(s, quote=True)
    m = p['media']
    if m[0] == 'video':
        media = ('<video muted loop playsinline autoplay preload="metadata" poster="%s" aria-label="%s">%s<source src="%s" type="video/mp4"></video>'
                 % (m[3], e(p['name'] + ': ' + p['line']), '<source src="%s" type="video/webm">' % m[1] if m[1] else '', m[2]))
    else:
        media = '<img src="%s" alt="%s" loading="lazy" decoding="async">' % (m[1], e(p['name'] + ': ' + p['line']))
    ext = ' target="_blank" rel="noopener"' if p.get('live') else ''
    live = '<span class="bmx-live">Live</span>' if p.get('live') else ''
    q = ' '.join([p['name'], p['cat'], p['line']] + p['tags']).lower()
    return ('<a class="bmx-tcard g3-card rv" href="%s"%s aria-label="%s" style="--ac:%s" data-q="%s">'
            '<div class="wkthumb bmx-thumb g3-media">%s%s<span class="bmx-cta">%s %s</span></div>'
            '<div class="wkcat">%s</div><div class="wktitle">%s</div><div class="wkdesc">%s</div>'
            '<div class="wk6-tags bmx-ttags" style="--tag:%s">%s</div></a>') % (
        p['href'], ext, e(p['cta'] + ': ' + p['name']), p['ac'], e(q), media, live, e(p['cta']), ARROW,
        e(p['cat']), e(p['name']), e(p['line']), p['ac'], ''.join('<span>%s</span>' % e(t) for t in p['tags']))


STYLE = '''<style id="g3-style">
/* 3D Gallery (16 Nov 2026): the tech portfolio's card, with room for films and portrait renders */
#pg-3d-gallery .g3-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(28px,3vw,44px) clamp(16px,1.6vw,26px)}
@media (max-width:1100px){#pg-3d-gallery .g3-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){#pg-3d-gallery .g3-grid{grid-template-columns:1fr}}
#pg-3d-gallery .g3-card{display:flex;flex-direction:column;gap:8px;color:inherit;text-decoration:none;min-width:0}
#pg-3d-gallery .g3-media{position:relative;aspect-ratio:16/10;overflow:hidden;border-radius:4px;background:#0b0d14;margin-bottom:10px}
#pg-3d-gallery .g3-media img,#pg-3d-gallery .g3-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
#pg-3d-gallery .g3-card:hover .g3-media img,#pg-3d-gallery .g3-card:hover .g3-media video{transform:scale(1.04)}
#pg-3d-gallery .g3-media .bmx-live{position:absolute;top:12px;left:12px;z-index:2}
#pg-3d-gallery .g3-media .bmx-cta{position:absolute;right:12px;bottom:12px;z-index:2}
#pg-3d-gallery .wkcat{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ac)}
#pg-3d-gallery .wktitle{font-size:clamp(20px,1.6vw,24px);line-height:1.2}
#pg-3d-gallery .wkdesc{color:var(--muted,#5b6280);line-height:1.5;max-width:46ch}
#pg-3d-gallery .g3-note{margin:0 0 clamp(28px,3vw,44px);color:var(--muted,#5b6280)}
</style>'''


def main():
    src = open(os.path.join(ROOT, 'mascot-gallery.html'), encoding='utf-8').read()
    a = src.index('<section class="page-hero bmx-hero">')
    b = src.index('<section class="cta-band">')
    hero_a = src.index('<section class="page-hero bmx-hero">')
    hero_b = src.index('<section class="bmx-body">')
    hero = src[hero_a:hero_b]
    hero = hero.replace('aria-label="Brand Method mascots in 3D: a butler bear, a delivery rider bunny, a ninja and a gentleman horse"', 'aria-label="Brand Method mascots in 3D"')
    hero = re.sub(r'<h1 class="ph-h1 bmx-h1 rv">.*?</h1>', '<h1 class="ph-h1 bmx-h1 rv">3D <em>Gallery</em></h1>', hero, flags=re.S)
    hero = re.sub(r'<p class="ph-lead rv">.*?</p>', '<p class="ph-lead rv">3D work by Brand Method: animated marks, characters, product mockups and interactive 3D websites.</p>', hero, flags=re.S)
    body = ('<section class="bmx-body"><div class="section-inner"><div class="g3-grid">%s</div></div></section>'
            % ''.join(card(p) for p in PROJECTS))
    out = src[:a] + hero + body + src[b:]
    out = out.replace('id="pg-mascot-gallery"', 'id="pg-3d-gallery"')
    out = out.replace('var _start="mascot-gallery"', 'var _start="3d-gallery"')   # the page script opens this section on load
    if 'var _start="3d-gallery"' not in out:
        raise SystemExit('the page script start section was not found')
    # hidden page: its own title and address, kept out of search engines
    out = re.sub(r'<title>.*?</title>', '<title>3D Gallery | Brand Method</title>', out, count=1, flags=re.S)
    out = out.replace('https://brandmethod.co/mascot-gallery.html', 'https://brandmethod.co/3d-gallery.html')
    out = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\g<1>3D work by Brand Method: animated marks, characters, product mockups and interactive 3D websites.\2', out, count=1)
    out = re.sub(r'(<meta property="og:title" content=")[^"]*(")', r'\g<1>3D Gallery | Brand Method\2', out, count=1)
    out = re.sub(r'(<meta property="og:description" content=")[^"]*(")', r'\g<1>3D work by Brand Method.\2', out, count=1)
    out = re.sub(r'(<meta name="twitter:title" content=")[^"]*(")', r'\g<1>3D Gallery | Brand Method\2', out, count=1)
    out = out.replace('<title>', '<meta name="robots" content="noindex, nofollow">\n<title>', 1)
    out = out.replace('</head>', STYLE + '\n</head>', 1)
    open(OUT, 'w', encoding='utf-8', newline='').write(out)
    print('wrote %s: %d projects' % (os.path.relpath(OUT, ROOT), len(PROJECTS)))


if __name__ == '__main__':
    main()
