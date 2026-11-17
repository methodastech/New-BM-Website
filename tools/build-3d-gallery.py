"""Build 3d-gallery.html: Brand Method's 3D services page, proven with case studies (rebuilt 17 Nov 2026).

HIDDEN: noindex, and no link from the menu, footer, Work hub, sitemap or site search. Open it by its address only.
Built on the Mascot Gallery page (same menu, hero, closing band and footer); the body is generated from the data below.

To add a case study, add 1 entry to CASES with its category ('construction', 'interactivity', 'animation' or 'games')
and its assets, then run:

    python tools/build-3d-gallery.py

A category with no case study shows a clearly marked "Case study coming" box instead. Facts in a case study come
only from our existing case pages and portfolio. No em-dashes in any copy (the build refuses them).
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '3d-gallery.html')

# ---------------------------------------------------------------- the 4 capabilities, in page order
SECTIONS = [
    dict(id='construction', name='Construction',
         title='3D for <em>construction</em>, property and architecture',
         what='We model buildings, spaces and products in 3D, so people can see them before they are built.',
         gets=['Renders of buildings, interiors and spaces', 'Walkthrough films of a space before it exists',
               'Products shown in place, in their real setting', 'Stills and films sized for the website, decks and social'],
         coming='A construction and property project in 3D will be shown here.'),
    dict(id='interactivity', name='Interactivity',
         title='Interactive <em>3D websites</em> and experiences',
         what='We build websites where the product is a 3D object people can turn, explore and take apart, right in the browser.',
         gets=['A 3D model of your product, drawn from the real thing', 'A website built around it, on desktop and phone',
               'Scroll and click moments that explain the product', 'No app to install: it opens like any web page']),
    dict(id='animation', name='Animation',
         title='High quality 3D <em>animation</em>',
         what='We bring marks, characters and products to life in 3D, for launches, campaigns and screens.',
         gets=['An animated 3D version of your logo', '3D characters and mascots, posed and animated',
               'Short films cut for the website, social and event screens', 'Stills from the same scenes for print']),
    dict(id='games', name='Games',
         title='3D <em>games</em> and playable experiences',
         what='We build games and playable moments in the browser, so people play with a brand instead of only watching it.',
         gets=['A playable game that runs in the browser', 'Characters and worlds in your brand',
               'Built for desktop and phone'],
         coming='A 3D game or playable experience will be shown here.'),
]

# ---------------------------------------------------------------- case studies
# media: ('video', webm or '', mp4, poster) | ('image', src)
# story: (label, text) pairs, in order. Facts only from our existing case pages and portfolio.
CASES = [
    dict(cat='interactivity', name='Teask', sector='Clean energy',
         story=[
             ('The client', 'Teask makes the T Station, a portable solar charging station that deploys in under 30 minutes. '
                            'In our audit its old website scored 2.8 out of 10.'),
             ('What we built', 'A brand strategy and a website of nine pages built around the station itself. '
                               'The home page shows the T Station in 3D, drawn from its real engineering.'),
             ('Why 3D', 'The station is the argument: no trenching, no grid upgrade, two parking bays, and it moves when demand moves. '
                        'In 3D a visitor explores the unit part by part instead of reading about it.'),
             ('The result', 'Live on 31 July 2026. The old site was retired the same day, and the SEO was tuned on the live site before handover.'),
         ],
         media=('image', 'Image/portfolio/teask-ss.webp'), alt='The Teask home page with the T Station in 3D',
         links=[('Open the 3D site', 'website/teask/', True), ('Read the case study', 'work/work-teask.html', False)]),
    dict(cat='interactivity', name='BOOM+', sector='Beverage',
         story=[
             ('The client', 'BOOM+ is an isotonic vitamin C drink, sold in four flavours.'),
             ('What we built', 'An interactive 3D product website: the can moves as you scroll, with pop-art art direction across all four flavours.'),
             ('Why 3D', 'A drink is something people pick up and turn in their hand. In 3D the can itself does the selling, flavour by flavour.'),
             ('The result', 'The site is live. Open it and scroll.'),
         ],
         media=('image', 'Image/portfolio/boom-ss.webp'), alt='The BOOM+ interactive 3D product website',
         links=[('Open the 3D site', 'website/boom/', True)]),
    dict(cat='animation', name='Mindtropic', sector='Health and wellness',
         story=[
             ('The client', "Mindtropic is Eskayvie's brain-support supplement for adults and children. The identity had to feel calm "
                            'and clinically credible to parents, and friendly enough for the children who take it.'),
             ('What we built', 'The Mindtropic brain mark, drawn as open lobes, modelled in 3D in soft blue and turning slowly on Mindtropic blue.'),
             ('Why 3D', 'A slow turn in soft blue gives the mark life without breaking the calm the whole brand is built on.'),
             ('The result', 'The film opens the Mindtropic launch, and the same calm blue system runs from mall standees to the website and the app.'),
         ],
         media=('video', 'Image/work6/mindtropic/film-mark3d.webm', 'Image/work6/mindtropic/film-mark3d.mp4', 'Image/work6/mindtropic/film-mark3d-poster.webp'),
         alt='The Mindtropic brain mark in 3D, turning slowly in soft blue',
         links=[('Read the case study', 'work/work-mindtropic.html', False)]),
    dict(cat='animation', name='Andoh', sector='Humanitarian', client='Malaysian Red Crescent',
         story=[
             ('The client', 'The Malaysian Red Crescent turns up at every kind of event, and each mission has its own uniform.'),
             ('What we built', 'Andoh, a friendly humanitarian hero in 3D, in six looks: the default design and the ambulance vest, '
                               'ambulance, DRT, RDS and volunteer uniforms.'),
             ('Why 3D', 'In 3D the same character holds up in every uniform and every pose, so Andoh stays recognisable wherever it appears.'),
             ('The result', 'One character that can show up at every kind of event in the right kit.'),
         ],
         media=('video', '', 'Image/mascot/andoh-uniforms-6.mp4', 'Image/mascot/andoh-uniforms-6-poster.webp'),
         alt='Andoh, the Malaysian Red Crescent mascot in 3D, in its mission uniforms',
         links=[('See Andoh', 'mascot-page/andoh.html', False), ('Mascot Gallery', 'mascot-gallery.html', False)]),
]

ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>'
e = lambda s: html.escape(s, quote=True)


def media_html(c):
    m = c['media']
    if m[0] == 'video':
        src = ('<source src="%s" type="video/webm">' % m[1] if m[1] else '') + '<source src="%s" type="video/mp4">' % m[2]
        return ('<video muted loop playsinline preload="none" poster="%s" data-g3-play aria-label="%s">%s</video>'
                % (m[3], e(c['alt']), src))
    return '<img src="%s" alt="%s" loading="lazy" decoding="async">' % (m[1], e(c['alt']))


def case_html(c, i):
    story = ''.join('<div class="g3-st"><dt>%s</dt><dd>%s</dd></div>' % (e(k), e(v)) for k, v in c['story'])
    links = []
    for j, (label, href, ext) in enumerate(c['links']):
        cls = 'btn-primary g3-btn' if j == 0 else 'g3-link'
        tgt = ' target="_blank" rel="noopener"' if ext else ''
        links.append('<a class="%s" href="%s"%s><span>%s %s</span></a>' % (cls, href, tgt, e(label), ARROW))
    who = c.get('client', c['name'])
    return ('<article class="g3-case%s rv">'
            '<div class="g3-case-media">%s</div>'
            '<div class="g3-case-body"><div class="g3-kicker">Case study &middot; %s</div>'
            '<h3 class="g3-case-t">%s</h3>%s<dl class="g3-story">%s</dl><div class="g3-links">%s</div></div>'
            '</article>') % (' g3-case--flip' if i % 2 else '', media_html(c), e(c['sector']), e(c['name']),
                             '<p class="g3-client">%s</p>' % e(who) if who != c['name'] else '', story, ''.join(links))


def section_html(s, n):
    cases = [c for c in CASES if c['cat'] == s['id']]
    gets = ''.join('<li>%s</li>' % e(g) for g in s['gets'])
    body = ''.join(case_html(c, i) for i, c in enumerate(cases))
    if not cases:
        body = ('<div class="g3-coming rv"><span class="g3-coming-tag">Case study coming</span>'
                '<p>%s Until it is up, ask us and we will walk you through what we can build for your project.</p>'
                '<a class="g3-link" href="contact.html"><span>Talk to us %s</span></a></div>') % (e(s['coming']), ARROW)
    return ('<section class="g3-sec" id="%s"><div class="section-inner">'
            '<div class="g3-head"><div class="g3-num rv">%s</div>'
            '<h2 class="section-title rv">%s</h2>'
            '<div class="g3-head-row"><p class="g3-what rv">%s</p>'
            '<div class="g3-gets rv"><div class="g3-gets-h">What you get</div><ul>%s</ul></div></div></div>'
            '%s</div></section>') % (s['id'], e(s['name']), s['title'], e(s['what']), gets, body)


def jump_html():
    return ('<nav class="g3-jump rv" aria-label="3D services">%s</nav>'
            % ''.join('<a href="#%s">%s</a>' % (s['id'], e(s['name'])) for s in SECTIONS))


PLAY = '''<script id="g3-play">
/* films play only while on screen */
(function(){var v=[].slice.call(document.querySelectorAll('video[data-g3-play]'));if(!v.length)return;
if(!('IntersectionObserver' in window)){v.forEach(function(x){x.preload='auto';x.play&&x.play().catch(function(){});});return;}
var io=new IntersectionObserver(function(es){es.forEach(function(en){var x=en.target;
if(en.isIntersecting){if(x.preload==='none')x.preload='auto';var p=x.play();if(p&&p.catch)p.catch(function(){});}else{x.pause();}});},{rootMargin:'200px 0px'});
v.forEach(function(x){io.observe(x);});})();
</script>'''

STYLE = '''<style id="g3-style">
/* 3D services page (17 Nov 2026): capability sections, each proven with case studies */
#pg-3d-gallery .g3-jump{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 clamp(8px,2vw,20px)}
#pg-3d-gallery .g3-jump a{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border:1px solid var(--border-2,#d9dbe6);font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:inherit;text-decoration:none;transition:border-color .2s,color .2s}
#pg-3d-gallery .g3-jump a b{font-weight:500;color:var(--accent)}
#pg-3d-gallery .g3-jump a:hover{border-color:var(--accent);color:var(--accent)}
#pg-3d-gallery .g3-sec{padding:clamp(56px,8vw,112px) 0;border-top:1px solid var(--border,#e6e7ee);scroll-margin-top:80px}
#pg-3d-gallery .g3-num{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
#pg-3d-gallery .g3-head .section-title{max-width:22ch}
#pg-3d-gallery .g3-head-row{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:start;margin-bottom:clamp(36px,5vw,64px)}
#pg-3d-gallery .g3-what{font-size:clamp(17px,1.4vw,20px);line-height:1.6;margin:0;max-width:40ch}
#pg-3d-gallery .g3-gets-h{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
#pg-3d-gallery .g3-gets ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
#pg-3d-gallery .g3-gets li{position:relative;padding-left:22px;line-height:1.5}
#pg-3d-gallery .g3-gets li::before{content:"";position:absolute;left:0;top:.62em;width:10px;height:2px;background:var(--accent)}
#pg-3d-gallery .g3-case{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(24px,4vw,56px);align-items:center}
#pg-3d-gallery .g3-case + .g3-case{margin-top:clamp(48px,7vw,96px)}
#pg-3d-gallery .g3-case--flip .g3-case-media{order:2}
#pg-3d-gallery .g3-case-media{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0b0d14}
#pg-3d-gallery .g3-case-media img,#pg-3d-gallery .g3-case-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
#pg-3d-gallery .g3-kicker{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
#pg-3d-gallery .g3-case-t{font-family:var(--font-display);font-weight:400;font-size:clamp(30px,3.2vw,44px);line-height:1.05;letter-spacing:-.02em;margin:0 0 6px}
#pg-3d-gallery .g3-client{margin:0 0 4px;color:var(--muted)}
#pg-3d-gallery .g3-story{margin:18px 0 0;display:grid;gap:14px}
#pg-3d-gallery .g3-st{display:grid;grid-template-columns:118px minmax(0,1fr);gap:14px;padding-top:14px;border-top:1px solid var(--border,#e6e7ee)}
#pg-3d-gallery .g3-st dt{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);padding-top:4px}
#pg-3d-gallery .g3-st dd{margin:0;line-height:1.55}
#pg-3d-gallery .g3-links{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;margin-top:24px}
#pg-3d-gallery .g3-btn span,#pg-3d-gallery .g3-link span{display:inline-flex;align-items:center;gap:8px}
#pg-3d-gallery .g3-link{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px}
#pg-3d-gallery .g3-coming{border:1.5px dashed var(--border-2,#cfd2e0);padding:clamp(28px,4vw,48px);display:grid;gap:14px;justify-items:start;background:repeating-linear-gradient(135deg,transparent 0 14px,rgba(0,0,255,.025) 14px 28px)}
#pg-3d-gallery .g3-coming-tag{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:var(--accent);padding:8px 12px}
#pg-3d-gallery .g3-coming p{margin:0;max-width:56ch;line-height:1.6}
@media (max-width:900px){
 #pg-3d-gallery .g3-head-row,#pg-3d-gallery .g3-case{grid-template-columns:1fr}
 #pg-3d-gallery .g3-case--flip .g3-case-media{order:0}
}
@media (max-width:520px){
 #pg-3d-gallery .g3-st{grid-template-columns:1fr;gap:6px}
 #pg-3d-gallery .g3-jump a{padding:10px 12px;letter-spacing:.1em}
}
</style>'''

# the hero film: its own, so the page does not repeat the Mascot Gallery banner (made with Higgsfield, 17 Nov 2026)
HERO = dict(webm='Image/3d/hero-3d.webm', mp4='Image/3d/hero-3d.mp4', poster='Image/3d/hero-3d-poster.webp',
            label='A small 3D studio set: a building model, a drink can, a character and a game controller come to life')

LEAD = 'What Brand Method builds in 3D, for construction, interactive websites, animation and games, shown through client work.'
DESC = 'Brand Method 3D services: construction and property visuals, interactive 3D websites, 3D animation and games.'


def main():
    for s in SECTIONS:
        assert s['id'] in ('construction', 'interactivity', 'animation', 'games'), s['id']
    for c in CASES:
        assert c['cat'] in [s['id'] for s in SECTIONS], 'unknown category: ' + c['cat']
        for p in [x for x in c['media'][1:] if x]:
            if not os.path.isfile(os.path.join(ROOT, p)):
                raise SystemExit('missing file: ' + p)
    src = open(os.path.join(ROOT, 'mascot-gallery.html'), encoding='utf-8').read()
    a = src.index('<section class="page-hero bmx-hero">')
    hero_b = src.index('<section class="bmx-body">')
    b = src.index('<section class="cta-band">')
    hero = src[a:hero_b]
    if all(os.path.isfile(os.path.join(ROOT, HERO[k])) for k in ('mp4', 'poster')):
        film = ('<video muted loop playsinline autoplay preload="metadata" poster="%s" aria-label="%s">%s<source src="%s" type="video/mp4"></video>'
                % (HERO['poster'], e(HERO['label']),
                   '<source src="%s" type="video/webm">' % HERO['webm'] if os.path.isfile(os.path.join(ROOT, HERO['webm'])) else '', HERO['mp4']))
        hero, n = re.subn(r'<video src="Image/mascot/cast-refined\.mp4"[^>]*></video>', lambda m: film, hero, count=1)
        if not n:
            raise SystemExit('the hero film was not found in the Mascot Gallery banner')
    else:
        hero = hero.replace('aria-label="Brand Method mascots in 3D: a butler bear, a delivery rider bunny, a ninja and a gentleman horse"',
                            'aria-label="Brand Method mascots in 3D"')
    hero = re.sub(r'<h1 class="ph-h1 bmx-h1 rv">.*?</h1>', '<h1 class="ph-h1 bmx-h1 rv">3D <em>services</em></h1>', hero, flags=re.S)
    hero = re.sub(r'<p class="ph-lead rv">.*?</p>', '<p class="ph-lead rv">%s</p>' % LEAD, hero, flags=re.S)
    body = ('<section class="bmx-body g3-body"><div class="section-inner">%s</div></section>%s'
            % (jump_html(), ''.join(section_html(s, i + 1) for i, s in enumerate(SECTIONS))))
    out = src[:a] + hero + body + src[b:]
    out = out.replace('id="pg-mascot-gallery"', 'id="pg-3d-gallery"')
    out = out.replace('var _start="mascot-gallery"', 'var _start="3d-gallery"')   # the page script opens this section on load
    if 'var _start="3d-gallery"' not in out:
        raise SystemExit('the page script start section was not found')
    # hidden page: its own title and address, kept out of search engines
    out = re.sub(r'<title>.*?</title>', '<title>3D Services | Brand Method</title>', out, count=1, flags=re.S)
    out = out.replace('https://brandmethod.co/mascot-gallery.html', 'https://brandmethod.co/3d-gallery.html')
    for pat, val in ((r'(<meta name="description" content=")[^"]*(")', DESC), (r'(<meta property="og:description" content=")[^"]*(")', DESC),
                     (r'(<meta name="twitter:description" content=")[^"]*(")', DESC),
                     (r'(<meta property="og:title" content=")[^"]*(")', '3D Services | Brand Method'),
                     (r'(<meta name="twitter:title" content=")[^"]*(")', '3D Services | Brand Method')):
        out = re.sub(pat, lambda m: m.group(1) + val + m.group(2), out, count=1)
    out = out.replace('<title>', '<meta name="robots" content="noindex, nofollow">\n<title>', 1)
    out = out.replace('</head>', STYLE + '\n</head>', 1)
    out = out.replace('</body>', PLAY + '\n</body>', 1)
    # no em-dashes in the copy this page adds
    added = hero + body + STYLE + LEAD + DESC
    if '—' in added or '&mdash;' in added:
        raise SystemExit('an em-dash is in the copy')
    open(OUT, 'w', encoding='utf-8', newline='').write(out)
    empty = [s['name'] for s in SECTIONS if not any(c['cat'] == s['id'] for c in CASES)]
    print('wrote %s: %d sections, %d case studies%s' % (os.path.relpath(OUT, ROOT), len(SECTIONS), len(CASES),
                                                         '; "Case study coming" in: ' + ', '.join(empty) if empty else ''))


if __name__ == '__main__':
    main()
