"""Hallmark redesign (full) of 3d-gallery.html: the 3D page becomes one deep case study, Teask in 3D.
Replaces the markup between <section class="pg" id="pg-3d-gallery"> and its <section class="cta-band">, and the
<style id="g3-style"> block. Site shell (nav, footer, cta band, other pages) untouched. Re-runnable on its own output."""
import io, re, sys
p = sys.argv[1]
h = io.open(p, encoding='utf-8', newline='').read()
CR = '\r\n' if '\r\n' in h else '\n'

EXT = '<svg class="tk3-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8"/></svg>'
BACK = '<svg class="tk3-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
T = 'Image/work6/teask/'

def vid(name, label, poster, webm=True, cls='tk3-film'):
    src = ('<source src="' + name + '.webm" type="video/webm">' if webm else '') + '<source src="' + name + '.mp4" type="video/mp4">'
    return ('<video class="' + cls + '" muted loop playsinline preload="none" poster="' + poster + '" data-g3-play aria-label="' + label + '">' + src + '</video>')

actions = ('<div class="tk3-actions">'
           '<a class="tk3-btn" href="website/teask/" target="_blank" rel="noopener"><span>Open the 3D site</span>' + EXT + '</a>'
           '<a class="tk3-link" href="work/work-teask.html">Read the full case study</a></div>')

body = (
# 1 hero: the T Station opening up, part by part, on the live site
'<header class="tk3-hero"><div class="tk3-wrap">'
  '<div class="tk3-hero-grid">'
    '<div class="tk3-hero-copy">'
      '<a class="tk3-back" href="work.html">' + BACK + '<span>Back to work</span></a>'
      '<h1 class="tk3-h1">Teask, built in 3D</h1>'
      '<p class="tk3-lede">A solar charging station visitors explore part by part, in the browser.</p>'
      + actions +
    '</div>'
    '<figure class="tk3-hero-fig">' + vid(T + 'site-explore', 'The live Teask site in explore mode: each part of the T Station opens up when it is clicked', T + 'site-explore-poster.webp')
    + '<figcaption>The live site in explore mode: every part of the T Station, spelled out.</figcaption></figure>'
  '</div>'
  '<dl class="tk3-facts">'
    '<div><dt>Client</dt><dd>Teask</dd></div>'
    '<div><dt>Sector</dt><dd>Engineering</dd></div>'
    '<div><dt>What we made</dt><dd>Website audit, brand strategy, SEO and a nine-page website</dd></div>'
    '<div><dt>Live</dt><dd>31 July 2026</dd></div>'
  '</dl>'
'</div></header>'

# 2 the product: one unit, three jobs
'<section class="tk3-sec tk3-jobs" aria-labelledby="tk3-jobs-h"><div class="tk3-wrap">'
  '<div class="tk3-head"><h2 class="tk3-h2" id="tk3-jobs-h">One unit, three jobs</h2>'
  '<p class="tk3-p">Teask makes the T Station, a portable solar charging station that deploys in under 30 minutes.</p></div>'
  '<ul class="tk3-jobs-row">'
    '<li><figure><img src="' + T + 'svc-off-the-grid.webp" alt="A T Station in a forest clearing, charging scooters with no grid nearby" loading="lazy" decoding="async"><figcaption><b>Off the grid</b><span>Where there is no supply.</span></figcaption></figure></li>'
    '<li><figure><img src="' + T + 'svc-past-the-meter.webp" alt="A T Station in a car park beside a building" loading="lazy" decoding="async"><figcaption><b>Past the meter</b><span>Where the supply is already full.</span></figcaption></figure></li>'
    '<li><figure><img src="' + T + 'svc-on-the-move.webp" alt="A T Station on a trailer, on the road" loading="lazy" decoding="async"><figcaption><b>On the move</b><span>Wherever demand goes next.</span></figcaption></figure></li>'
  '</ul>'
'</div></section>'

# 3 the audit first
'<section class="tk3-sec tk3-audit" aria-labelledby="tk3-audit-h"><div class="tk3-wrap tk3-audit-grid">'
  '<p class="tk3-score"><span class="tk3-score-n">2.8</span><span class="tk3-score-of">out of 10, the old site in our audit</span></p>'
  '<div class="tk3-audit-copy">'
    '<h2 class="tk3-h2" id="tk3-audit-h">The audit came first</h2>'
    '<p class="tk3-p">When Teask came to us, its old website scored 2.8 out of 10 in our audit. So the audit came first, then the brand strategy, and only then a website of nine pages, built around the station itself.</p>'
    '<ol class="tk3-steps"><li><span class="tk3-step-n">1</span>Website audit</li><li><span class="tk3-step-n">2</span>Brand strategy</li><li><span class="tk3-step-n">3</span>Nine pages, built around the station</li></ol>'
  '</div>'
'</div></section>'

# 4 why 3D, on the night surface
'<section class="tk3-sec tk3-why" aria-labelledby="tk3-why-h"><div class="tk3-wrap">'
  '<div class="tk3-why-head"><h2 class="tk3-h2" id="tk3-why-h">The station is the argument</h2>'
  '<p class="tk3-p">No trenching, no grid upgrade, two parking bays, and it moves when demand moves. Read as a list, that is easy to skim past. On the home page the T Station stands in 3D, so a visitor explores the unit part by part instead of reading about it.</p></div>'
  '<figure class="tk3-why-fig">' + vid(T + 'site-scroll', 'A scroll through the Teask website: the T Station in 3D, then the station arriving, setting down, powering on and scaling', T + 'site-scroll-poster.webp')
  + '<figcaption>A scroll through the live site: the T Station in 3D, drawn from its real engineering.</figcaption></figure>'
'</div></section>'

# 5 the site on desktop and phone
'<section class="tk3-sec tk3-site" aria-labelledby="tk3-site-h"><div class="tk3-wrap">'
  '<h2 class="tk3-h2" id="tk3-site-h">On desktop and phone</h2>'
  '<div class="tk3-site-grid">'
    '<figure class="tk3-desk"><img src="' + T + 'site-desktop.webp" alt="The Teask home page on a desktop: Power in Motion, with the T Station in 3D" loading="lazy" decoding="async"></figure>'
    '<figure class="tk3-phone"><img src="' + T + 'site-phone.webp" alt="The Teask home page on a phone" loading="lazy" decoding="async"></figure>'
  '</div>'
'</div></section>'

# 6 live
'<section class="tk3-sec tk3-live" aria-labelledby="tk3-live-h"><div class="tk3-wrap tk3-live-grid">'
  '<h2 class="tk3-h2 tk3-live-h" id="tk3-live-h">Live on 31 July 2026</h2>'
  '<div><p class="tk3-p">The old site was retired the same day, and the SEO was tuned on the live site before handover.</p>' + actions + '</div>'
'</div></section>'

# 7 more 3D work, and what we build in 3D (the old service sections, kept as an index with their ids)
'<section class="tk3-sec tk3-more" aria-labelledby="tk3-more-h"><div class="tk3-wrap">'
  '<h2 class="tk3-h2" id="tk3-more-h">More work in 3D</h2>'
  '<ul class="tk3-more-row">'
    '<li><div class="tk3-more-media"><img src="Image/portfolio/boom-ss.webp" alt="The BOOM+ interactive 3D product website" loading="lazy" decoding="async"></div>'
      '<h3 class="tk3-h3">BOOM+</h3><p>An interactive 3D product website: the can moves as you scroll, with pop-art art direction across all four flavours.</p>'
      '<a class="tk3-link" href="website/boom/" target="_blank" rel="noopener">Open the 3D site</a></li>'
    '<li><div class="tk3-more-media">' + vid('Image/work6/mindtropic/film-mark3d', 'The Mindtropic brain mark in 3D, turning slowly on Mindtropic blue', 'Image/work6/mindtropic/film-mark3d-poster.webp', cls='') + '</div>'
      '<h3 class="tk3-h3">Mindtropic</h3><p>The Mindtropic brain mark, drawn as open lobes, modelled in 3D in soft blue and turning slowly on Mindtropic blue.</p>'
      '<a class="tk3-link" href="work/work-mindtropic.html">Read the case study</a></li>'
    '<li><div class="tk3-more-media">' + vid('Image/mascot/andoh-uniforms-6', 'Andoh, the Malaysian Red Crescent hero, in six uniforms', 'Image/mascot/andoh-uniforms-6-poster.webp', webm=False, cls='') + '</div>'
      '<h3 class="tk3-h3">Andoh</h3><p>For the Malaysian Red Crescent: a friendly humanitarian hero in 3D, in six looks, one for each mission.</p>'
      '<span class="tk3-links"><a class="tk3-link" href="mascot-page/andoh.html">See Andoh</a><a class="tk3-link" href="mascot-gallery.html">Mascot Gallery</a></span></li>'
  '</ul>'
  '<div class="tk3-index">'
    '<h2 class="tk3-h2 tk3-index-h">What we build in 3D</h2>'
    '<ul class="tk3-index-list">'
      '<li id="construction"><b>Construction, property and architecture</b><span>We model buildings, spaces and products in 3D, so people can see them before they are built.</span></li>'
      '<li id="interactivity"><b>Interactive 3D websites</b><span>We build websites where the product is a 3D object people can turn, explore and take apart, right in the browser.</span></li>'
      '<li id="animation"><b>3D animation</b><span>We bring marks, characters and products to life in 3D, for launches, campaigns and screens.</span></li>'
      '<li id="games"><b>3D games</b><span>We build games and playable moments in the browser, so people play with a brand instead of only watching it.</span></li>'
    '</ul>'
    '<a class="tk3-btn tk3-btn--quiet" href="contact.html"><span>Talk to us about your project</span></a>'
  '</div>'
'</div></section>'
)

a = h.index('<section class="pg" id="pg-3d-gallery">') + len('<section class="pg" id="pg-3d-gallery">')
b = h.index('<section class="cta-band">', a)
h = h[:a] + '<div class="tk3">' + body + '</div>' + h[b:]

CSS = r'''<style id="g3-style">
/* Hallmark · v2.0.0 · redesign: full, page section #pg-3d-gallery only (site shell kept) · theme: brand (Brand Method: Fraunces, Inter, #1a26de; Teask night #0A0F22) · shape: Long Document, a case study read top to bottom · signature: the T Station opening part by part on the live 3D site · genre: editorial · copy: page's own, see handoff */
/* Hallmark · dropped #construction, #interactivity, #animation, #games, the jump links (the ids stay on the index rows), the 3D services hero film, the four 'What you get' lists and the two 'Case study coming' notes · the user turned the page into one Teask case study */
/* Hallmark critique · one story, told in the order the work happened: what it is, what it does, the audit, why 3D, the site, live, more work */
#pg-3d-gallery{
  --tk-paper:#ffffff;--tk-ink:#0f0f0f;--tk-body:#2b2b2b;--tk-muted:#55585f;--tk-line:#e4e6ee;--tk-tint:#eef1fb;
  --tk-accent:#1a26de;--tk-accent-deep:#0000aa;--tk-night:#0a0f22;--tk-night-ink:#f3f5f8;--tk-night-muted:#aab2c8;--tk-night-line:#232a45;
  --tk-display:'Fraunces',Georgia,serif;--tk-sans:'Inter',system-ui,sans-serif;
  --tk-gut:clamp(20px,4vw,48px);--tk-gap:clamp(24px,3.2vw,48px);--tk-sec:clamp(72px,10vw,144px)}
#pg-3d-gallery .tk3{background:var(--tk-paper);color:var(--tk-body);font-family:var(--tk-sans)}
#pg-3d-gallery .tk3-wrap{max-width:1280px;margin:0 auto;padding:0 var(--tk-gut);box-sizing:content-box}
#pg-3d-gallery .tk3-h1,#pg-3d-gallery .tk3-h2,#pg-3d-gallery .tk3-h3{font-family:var(--tk-display);font-weight:400;color:var(--tk-ink);letter-spacing:-.02em;margin:0;text-wrap:balance;overflow-wrap:break-word;min-width:0}
#pg-3d-gallery .tk3-h1{font-size:clamp(48px,6.2vw,92px);line-height:.98}
#pg-3d-gallery .tk3-h2{font-size:clamp(34px,3.8vw,58px);line-height:1.04}
#pg-3d-gallery .tk3-h3{font-size:clamp(24px,2vw,30px);line-height:1.1}
#pg-3d-gallery .tk3-p{font-size:clamp(17px,1.3vw,19px);line-height:1.7;margin:0;max-width:60ch;color:var(--tk-body)}
#pg-3d-gallery figure{margin:0}
#pg-3d-gallery img,#pg-3d-gallery video{display:block;max-width:100%}
#pg-3d-gallery figcaption{font-size:14px;line-height:1.5;color:var(--tk-muted);margin-top:14px}
#pg-3d-gallery .tk3-ic{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
/* controls: one primary style, one quiet link */
#pg-3d-gallery .tk3-actions{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;margin-top:36px}
#pg-3d-gallery .tk3-btn{display:inline-flex;align-items:center;gap:12px;min-height:52px;padding:0 24px;background:var(--tk-accent);color:var(--tk-paper);font-family:var(--tk-sans);font-size:16px;font-weight:600;text-decoration:none;border:0;transition:background-color .2s ease,transform .2s ease}
#pg-3d-gallery .tk3-btn:hover{background:var(--tk-accent-deep)}
#pg-3d-gallery .tk3-btn:active{transform:translateY(1px)}
#pg-3d-gallery .tk3-btn--quiet{background:var(--tk-ink)}
#pg-3d-gallery .tk3-btn--quiet:hover{background:var(--tk-accent)}
#pg-3d-gallery .tk3-link{font-size:16px;font-weight:500;color:var(--tk-accent);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;transition:color .2s ease}
#pg-3d-gallery .tk3-link:hover{color:var(--tk-accent-deep);text-decoration-thickness:2px}
#pg-3d-gallery a:focus-visible{outline:2px solid var(--tk-accent);outline-offset:4px;transition:none}
#pg-3d-gallery .tk3-why a:focus-visible{outline-color:var(--tk-night-ink)}
/* 1 hero */
#pg-3d-gallery .tk3-hero{padding:calc(var(--nav-h,80px) + clamp(28px,4vw,56px)) 0 0}
#pg-3d-gallery .tk3-hero-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--tk-gap);align-items:center}
#pg-3d-gallery .tk3-back{display:inline-flex;align-items:center;gap:12px;font-size:15px;color:var(--tk-muted);text-decoration:none;margin-bottom:clamp(24px,3vw,40px)}
#pg-3d-gallery .tk3-back:hover{color:var(--tk-accent)}
#pg-3d-gallery .tk3-lede{font-size:clamp(19px,1.6vw,23px);line-height:1.5;color:var(--tk-body);margin:24px 0 0;max-width:30ch}
#pg-3d-gallery .tk3-hero-fig video,#pg-3d-gallery .tk3-why-fig video{width:100%;aspect-ratio:16/10;object-fit:cover;background:var(--tk-tint)}
#pg-3d-gallery .tk3-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--tk-gap);margin:clamp(40px,5vw,72px) 0 0;padding:24px 0 0;border-top:1px solid var(--tk-line)}
#pg-3d-gallery .tk3-facts dt{font-size:14px;color:var(--tk-muted);margin-bottom:8px}
#pg-3d-gallery .tk3-facts dd{margin:0;font-size:16px;line-height:1.45;color:var(--tk-ink)}
/* sections */
#pg-3d-gallery .tk3-sec{padding:var(--tk-sec) 0}
#pg-3d-gallery .tk3-head{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--tk-gap);align-items:end;margin-bottom:clamp(36px,5vw,64px)}
/* 2 three jobs */
#pg-3d-gallery .tk3-jobs-row{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--tk-gap)}
#pg-3d-gallery .tk3-jobs-row img{width:100%;aspect-ratio:4/5;object-fit:cover}
#pg-3d-gallery .tk3-jobs-row figcaption{display:flex;flex-direction:column;gap:4px;margin-top:16px}
#pg-3d-gallery .tk3-jobs-row b{font-family:var(--tk-display);font-weight:400;font-size:24px;color:var(--tk-ink)}
#pg-3d-gallery .tk3-jobs-row span{font-size:16px;color:var(--tk-muted)}
/* 3 audit */
#pg-3d-gallery .tk3-audit{background:var(--tk-tint)}
#pg-3d-gallery .tk3-audit-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--tk-gap);align-items:start}
#pg-3d-gallery .tk3-score{margin:0;display:flex;flex-direction:column;gap:8px}
#pg-3d-gallery .tk3-score-n{font-family:var(--tk-display);font-weight:400;font-size:clamp(120px,17vw,240px);line-height:.82;letter-spacing:-.04em;color:var(--tk-accent);font-variant-numeric:tabular-nums}
#pg-3d-gallery .tk3-score-of{font-size:16px;color:var(--tk-muted);max-width:24ch}
#pg-3d-gallery .tk3-audit-copy .tk3-p{margin-top:24px}
#pg-3d-gallery .tk3-steps{list-style:none;margin:40px 0 0;padding:0;border-top:1px solid var(--tk-ink)}
#pg-3d-gallery .tk3-steps li{display:flex;align-items:baseline;gap:20px;padding:20px 0;border-bottom:1px solid var(--tk-line);font-size:18px;color:var(--tk-ink)}
#pg-3d-gallery .tk3-step-n{font-family:var(--tk-display);font-size:18px;color:var(--tk-accent);min-width:1.2em;font-variant-numeric:tabular-nums}
/* 4 why 3D */
#pg-3d-gallery .tk3-why{background:var(--tk-night);color:var(--tk-night-ink)}
#pg-3d-gallery .tk3-why .tk3-h2{color:var(--tk-night-ink)}
#pg-3d-gallery .tk3-why .tk3-p{color:var(--tk-night-muted)}
#pg-3d-gallery .tk3-why figcaption{color:var(--tk-night-muted)}
#pg-3d-gallery .tk3-why-head{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--tk-gap);align-items:start;margin-bottom:clamp(36px,5vw,64px)}
#pg-3d-gallery .tk3-why-fig video{background:var(--tk-night-line)}
/* 5 site */
#pg-3d-gallery .tk3-site .tk3-h2{margin-bottom:clamp(36px,5vw,64px)}
#pg-3d-gallery .tk3-site-grid{display:grid;grid-template-columns:minmax(0,9fr) minmax(0,3fr);gap:var(--tk-gap);align-items:end}
#pg-3d-gallery .tk3-desk img{width:100%;border:1px solid var(--tk-line)}
#pg-3d-gallery .tk3-phone img{width:100%;border:1px solid var(--tk-line)}
/* 6 live */
#pg-3d-gallery .tk3-live{border-top:1px solid var(--tk-line)}
#pg-3d-gallery .tk3-live-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--tk-gap);align-items:end}
#pg-3d-gallery .tk3-live-h{font-size:clamp(44px,6vw,88px);line-height:.98}
#pg-3d-gallery .tk3-live .tk3-actions{margin-top:28px}
/* 7 more work and the index */
#pg-3d-gallery .tk3-more{background:var(--tk-tint)}
#pg-3d-gallery .tk3-more>.tk3-wrap>.tk3-h2{margin-bottom:clamp(36px,5vw,64px)}
#pg-3d-gallery .tk3-more-row{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--tk-gap)}
#pg-3d-gallery .tk3-more-row li{display:flex;flex-direction:column;gap:12px}
#pg-3d-gallery .tk3-more-media{aspect-ratio:4/3;overflow:hidden;background:var(--tk-paper);margin-bottom:8px}
#pg-3d-gallery .tk3-more-media img,#pg-3d-gallery .tk3-more-media video{width:100%;height:100%;object-fit:cover}
#pg-3d-gallery .tk3-more-row p{margin:0;font-size:16px;line-height:1.6;color:var(--tk-body);max-width:46ch}
#pg-3d-gallery .tk3-more-row .tk3-link,#pg-3d-gallery .tk3-links{margin-top:auto;padding-top:8px}
#pg-3d-gallery .tk3-links{display:flex;flex-wrap:wrap;gap:12px 24px}
#pg-3d-gallery .tk3-links .tk3-link{padding-top:0}
#pg-3d-gallery .tk3-index{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--tk-gap);margin-top:var(--tk-sec);align-items:start}
#pg-3d-gallery .tk3-index-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--tk-ink)}
#pg-3d-gallery .tk3-index-list li{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:20px;padding:20px 0;border-bottom:1px solid var(--tk-line);scroll-margin-top:calc(var(--nav-h,80px) + 24px)}
#pg-3d-gallery .tk3-index-list b{font-weight:600;font-size:17px;color:var(--tk-ink)}
#pg-3d-gallery .tk3-index-list span{font-size:16px;line-height:1.6;color:var(--tk-body)}
#pg-3d-gallery .tk3-index .tk3-btn{grid-column:2;justify-self:start;margin-top:8px}
/* narrow screens */
@media (max-width:900px){
  #pg-3d-gallery .tk3-hero-grid,#pg-3d-gallery .tk3-head,#pg-3d-gallery .tk3-audit-grid,#pg-3d-gallery .tk3-why-head,#pg-3d-gallery .tk3-live-grid,#pg-3d-gallery .tk3-index{grid-template-columns:minmax(0,1fr)}
  #pg-3d-gallery .tk3-index .tk3-btn{grid-column:1}
  #pg-3d-gallery .tk3-facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  #pg-3d-gallery .tk3-jobs-row,#pg-3d-gallery .tk3-more-row{grid-template-columns:minmax(0,1fr)}
  #pg-3d-gallery .tk3-jobs-row img{aspect-ratio:4/3}
  #pg-3d-gallery .tk3-site-grid{grid-template-columns:minmax(0,1fr)}
  #pg-3d-gallery .tk3-phone{max-width:240px}
  #pg-3d-gallery .tk3-index-list li{grid-template-columns:minmax(0,1fr);gap:8px}
}
@media (prefers-reduced-motion:reduce){#pg-3d-gallery *{transition:none !important}}
</style>'''
h, n = re.subn(r'<style id="g3-style">.*?</style>', lambda m: CSS.replace('\n', CR), h, count=1, flags=re.S)
assert n == 1

# films: no autoplay when the visitor asks for reduced motion; they get the poster and the player controls instead
OLD = "(function(){var v=[].slice.call(document.querySelectorAll('video[data-g3-play]'));if(!v.length)return;"
NEW = ("(function(){var v=[].slice.call(document.querySelectorAll('video[data-g3-play]'));if(!v.length)return;"
       "if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){v.forEach(function(x){x.controls=true;});return;}")
if NEW not in h:
    assert OLD in h
    h = h.replace(OLD, NEW, 1)
io.open(p, 'w', encoding='utf-8', newline='').write(h)
print('ok')
