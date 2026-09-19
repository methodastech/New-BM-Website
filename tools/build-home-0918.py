"""Build the homepage (index.html) and culture.html in the 18 Sep design.

The design export in "brandmethod-website 18-9/" is a single-page app: every page
is a <section class="pg" id="pg-X"> in one index.html, routed by hash. Each file
built here keeps one of those pages (BUILDS), sends every other page id to the
real .html page at the repo root, and points every image and video at the copy
that lives in this repo (ASSETS, SAME_DIR). Nothing is loaded from the export folder.

    python tools/build-home-0918.py

Writes index.html, culture.html, css/home.css and js/home.js. The Home lead magnet
panels need the videos from tools/record-methodas-previews.js.
"""
import html as htmllib
import json
import os
import re
import sys
from urllib.parse import quote, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'brandmethod-website 18-9')
SRC = os.path.join(SRC_DIR, 'index.html')
OUT = os.path.join(ROOT, 'index.html')
OUT_CSS = 'css/home.css'
OUT_JS = 'js/home.js'

# Export asset -> the same image already in this repo. None drops the reference.
ASSETS = {
    'assets/bmx-live.css': OUT_CSS,
    'assets/bmx-live.js': OUT_JS,
    'assets/live/video/hero-success-story-compile.mp4': 'Success Story Compile 1.mp4',
    # posters are stills from the repo's own videos (a video with no poster shows black until it loads)
    'assets/home/hero/hero-poster.webp': 'Image/home/hero-poster.webp',
    'assets/home/video/showreel05.mp4': 'showreel04.webm',
    'assets/live/video/thumbnail-showreel02.webp': 'nobodywantsawebsite/assets/thumbnail-showreel02.webp',
    # the results block plays the James Tan testimonial, as on the old Home
    'assets/home/video/success-story.mp4': 'BM Testimony.webm',
    'assets/home/video/story-poster.webp': 'Image/home/bm-testimony-poster.webp',
    'assets/home/photos/founder-on-stage.webp': 'founder-on-stage.webp',
    'assets/home/photos/signed-founder.png': 'signed-founder.png',
    'assets/home/photos/creative-team-uiux-design-discussion.webp': 'Image/creative-team-uiux-design-discussion.webp',
    'assets/home/photos/show-board-brand-strategy-workshop.webp': 'Image/show-board-brand-strategy-workshop.webp',
    'assets/home/photos/client-amir-spiroball.webp': 'Testimonial Image/Spiroball.webp',
    'assets/home/photos/client-azhan-waterbay.webp': 'Testimonial Image/Waterbay.webp',
    'assets/home/photos/client-ben-valvoline.webp': 'Testimonial Image/Valvoline.webp',
    'assets/home/photos/client-noelle-hexamatic.webp': 'Testimonial Image/Hexamatic.webp',
    'assets/home/photos/client-priya-pinnacle.webp': 'Testimonial Image/Pinnacle.webp',
    'assets/home/photos/client-syukri-eskayvie.webp': 'Testimonial Image/Eskayvie Syukri.webp',
    'assets/home/photos/industry-innovation.webp': 'work/Innovation.webp',
    'assets/home/photos/industry-tech.webp': 'work/Tech.webp',
    'assets/opt/home/photos/industry-fintech.webp': 'work/Fintech.webp',
    'assets/opt/home/photos/industry-fnb-restaurant.webp': 'work/F&B restaurant.webp',
    'assets/opt/home/photos/industry-health-wellness.webp': 'work/Health & Wellness.webp',
    # the design's 3D step renders: their beats are removed from the step cards (drop_group)
    'assets/home/steps/3d/meeting-3d.webp': None,
    'assets/home/steps/3d/success-3d.webp': None,
    # lead magnet panels: the repo's own Methodas pages
    'assets/live/inside/brand-growth-education.html': 'methodas_brand_education_standard.html',
    'assets/live/inside/methodas-52.html': 'methodas_52_frameworks.html',
    # Work hub mascot card: the design's generated loop and banner are not in the repo; the suit render is
    'assets/home/mascot/mascot-loop.mp4': None,
    'assets/home/photos/mascot-suit-banner.jpg': 'santa-images/santa-barbara-cafe-mascot-suit-design.webp',
    # the Contact page's 3D map library: Contact is its own page on this site
    'assets/vendor/maplibre-gl.css': None,
    'assets/vendor/maplibre-gl.js': None,
}
CLIENT_LOGOS = {
    'aicb': 'logo/AICB.png', 'airasia': 'New Logo/Airasia.png', 'bumi-armada': 'New Logo/Bumi Armada.png',
    'burgerking': 'New Logo/burgerking-logo.png', 'camel-active': 'New Logo/camel-active-logo.png',
    'duit': 'New Logo/duit-logo.png', 'eskayvie': 'New Logo/Eskayvie.png', 'fiana': 'New Logo/fiana-logo.png',
    'hasbro': 'New Logo/hasbro-logo.png', 'ikram': 'New Logo/Ikram.png', 'jb-cocoa': 'New Logo/JB Cocoa.png',
    'kalbe': 'New Logo/Kalbe.png', 'kexxel': 'New Logo/Kexxel.png', 'maybank': 'New Logo/Maybank.png',
    'mcdonalds': 'New Logo/Mcdonalds.png', 'mhb': 'New Logo/MHB.png', 'microsoft': 'New Logo/Microsoft.png',
    'milna': 'New Logo/Milna.png', 'proton': 'New Logo/proton-logo.png', 'santa-barbara': 'New Logo/Santa Barbara.png',
    'sheraton': 'New Logo/Sheraton.png', 'spritzer': 'New Logo/spritzer-logo.png', 'starbucks': 'New Logo/Starbucks.png',
    'sunway': 'New Logo/Sunway.png', 'taylors': 'New Logo/taylors-logo.png',
    'universiti-malaya': 'New Logo/universiti-malaya-logo.png', 'upm': 'New Logo/upm-logo.png',
}
# About: the design's compressed team photos are the repo's Key Members originals
TEAM = {'azim': 'Azim.png', 'azwan': 'Azwan.webp', 'bazil': 'Bazil.webp', 'brian': 'Brian.webp', 'diha': 'Diha.webp',
        'eyka-wasilan': 'Eyka Wasilan.webp', 'irfan-muhammad': 'Irfan Muhammad.png', 'jay-anthon': 'Jay Anthon.webp',
        'nuramina': 'Nuramina.webp', 'rozen-zainal': 'Rozen Zainal.webp'}
for k, v in TEAM.items():
    ASSETS['assets/live/_opt/%s.jpg' % k] = 'Key Members/' + v
ASSETS['assets/live/_opt/fifteen-years.jpg'] = '15 Years.webp'
ASSETS['assets/opt/live/services/BrandMethod - Brand Strategy.webp'] = 'services/BrandMethod - Brand Strategy.webp'
ASSETS['assets/live/Testimonial Image/sdfdsdffdsdfs.webp'] = 'Testimonial Image/sdfdsdffdsdfs.webp'
for k, v in CLIENT_LOGOS.items():
    ASSETS['assets/home/clients-norm/%s.png' % k] = v
# folders that exist in the repo under the same file names
SAME_DIR = {
    'assets/live/Image/': 'Image/',
    'assets/live/logo-gallery-images/': 'logo-gallery-images/',
    'assets/live/work-images/': 'work-images/',
    'assets/live/santa-images/': 'santa-images/',
    'assets/live/dahmakan-images/': 'dahmakan-images/',
    'assets/live/jbcocoa-images/': 'jbcocoa-images/',
    'assets/live/services/': 'services/',
    # the design's two service loops are MP4s of the repo's services/*.gif, made once with ffmpeg
    'assets/home/svc/': 'services/',
    # the Culture page's six photos exist only in the design, copied in once
    'assets/home/culture/': 'Image/culture/',
    # the About page's history photos exist only in the design, copied in once
    'assets/home/history/': 'Image/about/',
    # the Resources banner photo exists only in the design, copied in once
    'assets/home/resources/': 'Image/resources/',
}

# SPA page id -> live page. Culture has no page on the live site, so its links are dropped.
PAGES = {
    'about': 'about.html', 'work': 'work.html', 'services': 'services.html',
    'svc-brand': 'services/brand-strategy.html', 'svc-system': 'services/system-playbook.html',
    'svc-marketing': 'services/marketing-ads.html', 'svc-content': 'services/content-creation.html',
    'svc-web': 'services/website-apps.html', 'pricing': 'pricing.html', 'resources': 'resources.html',
    'contact': 'contact.html', 'logo-gallery': 'logo-gallery.html', 'mascot-gallery': 'mascot-gallery.html',
    'tech-portfolio': 'portfolio.html', 'culture': 'culture.html', 'home': '/',
}
# pages this script builds from the export: page id -> file, and its head
BUILDS = {
    'home': {'out': 'index.html'},
    'about': {
        'out': 'about.html',
        'title': 'About | Brand Method',
        'description': 'Brand Method is a strategy-led branding and marketing studio in Kuala Lumpur: one method, '
                       'one in-house team, and a guarantee in front of the work.',
    },
    'work': {
        'out': 'work.html',
        'title': 'Work | Brand Method',
        'description': 'Brand Method work: branding projects, logo and mascot galleries and live tech builds, from '
                       'fintech and F&B to healthcare, tech and community.',
    },
    'tech-portfolio': {
        'out': 'portfolio.html',
        'title': 'Tech Portfolio | Brand Method',
        'description': 'Live websites, apps and platforms built by Brand Method. Open any one and the full build '
                       'loads in a new tab.',
    },
    'services': {
        'out': 'services.html',
        'title': 'Services | Brand Method',
        'description': 'Five disciplines, one method: brand strategy and identity, systems, marketing and ads, content, and websites, apps and e-commerce.',
    },
    'svc-brand': {
        'out': 'services/brand-strategy.html',
        'title': 'Brand Strategy & Identity | Brand Method',
        'description': 'Positioning, naming, messaging and a complete visual identity that makes you instantly understood.',
    },
    'svc-system': {
        'out': 'services/system-playbook.html',
        'title': 'Systems & Playbook | Brand Method',
        'description': 'Brand guidelines and playbooks that keep every touchpoint on-brand, run by your own team.',
    },
    'svc-marketing': {
        'out': 'services/marketing-ads.html',
        'title': 'Marketing & Ads | Brand Method',
        'description': 'Campaigns and paid media engineered to convert, built on the brand strategy.',
    },
    'svc-content': {
        'out': 'services/content-creation.html',
        'title': 'Content Creation | Brand Method',
        'description': 'Photo, video and social content that keeps your brand visible, consistent and premium month after month.',
    },
    'svc-web': {
        'out': 'services/website-apps.html',
        'title': 'Website, App & E-Commerce | Brand Method',
        'description': 'Websites, apps and online stores built to sell, designed and developed in house.',
    },
    'pricing': {
        'out': 'pricing.html',
        'title': 'Details & Pricing | Brand Method',
        'description': 'Fixed prices, fast delivery, maximum quality: exactly what you get at each stage of the '
                       'Brand Journey, and what it costs.',
    },
    'logo-gallery': {
        'out': 'logo-gallery.html',
        'title': 'Logo Gallery | Brand Method',
        'description': '27 logo marks by Brand Method, from auction platforms to clinics and cafes.',
    },
    'culture': {
        'out': 'culture.html',
        'title': 'Culture | Brand Method',
        'description': 'How Brand Method works and who we hire: six standards, open positions in Kuala Lumpur, '
                       'and how hiring runs.',
    },
}
# data-svc on the mobile menu's service rows
SVC = {
    'svc-brand-strategy': 'services/brand-strategy.html', 'svc-systems': 'services/system-playbook.html',
    'svc-marketing': 'services/marketing-ads.html', 'svc-content': 'services/content-creation.html',
    'svc-web': 'services/website-apps.html',
}


# Live builds on the old portfolio page that came after the design (it has 11); same card as its others
EXTRA_BUILDS = [
    ('al-ain', 'alain', 'AL AiN IT Consultants', 'B2B / Tech', 'Site for an accredited software testing lab in Kuala Lumpur', '#1F2DBE'),
    ('helldive', 'helldive', 'Helldive Command', 'Gaming / Community',
     'Training hub for Helldivers 2 players with stratagems, weapons and drills', '#2E3BD0'),
    ('jommakcik', 'jommakcik', 'Jom Makcik', 'Care / Mobility',
     'Site for wheelchair-accessible transport and trained women chaperones', '#2536F5'),
    # hosted on Netlify, not in website/: the first field is the full address
    ('https://vitsnoodle.netlify.app/', 'vits', "Vit's Noodles", 'F&B / Trade',
     'Trade site for the yellow pack Malaysia grew up with, halal since 1980', '#D9262B'),
]
BUILD_COUNT = 11 + len(EXTRA_BUILDS)


def add_builds(s):
    """Append EXTRA_BUILDS to the Tech Portfolio grid, cloned from its last card, and fix the counts."""
    cards = list(re.finditer(r'<a class="bmx-tcard rv" href="website/[^"]*".*?</a>', s, re.S))
    if len(cards) != 11:
        sys.exit('expected 11 portfolio cards, found %d' % len(cards))
    last = cards[-1]
    tpl = last.group(0)
    old = {k: re.search(p, tpl).group(1) for k, p in {
        'dir': r'website/([^/"]+)/', 'shot': r'portfolio/([a-z]+)-ss', 'name': r'<div class="wktitle">([^<]*)',
        'cat': r'<div class="wkcat">([^<]*)', 'desc': r'<div class="wkdesc">([^<]*)', 'ac': r'--ac:(#[0-9A-Fa-f]+)'}.items()}
    new = ''
    for d, shot, name, cat, desc, ac in EXTRA_BUILDS:
        c = tpl.replace('website/%s/' % old['dir'], d if d.startswith('http') else 'website/%s/' % d)
        c = c.replace('portfolio/%s-ss' % old['shot'], 'portfolio/%s-ss' % shot)
        c = c.replace('--ac:' + old['ac'], '--ac:' + ac)
        c = c.replace('>%s<' % old['cat'], '>%s<' % htmllib.escape(cat)).replace('>%s<' % old['desc'], '>%s<' % desc)
        c = c.replace(old['name'], htmllib.escape(name))
        c = re.sub(r'data-q="[^"]*"', 'data-q="%s"' % htmllib.escape(' '.join((name, cat, desc)).lower()), c)
        new += c
    s = s[:last.end()] + new + s[last.end():]
    for a, b in (('11 live builds', '%d live builds'), ('11 live websites', '%d live websites'), ('11 sites', '%d sites')):
        s = s.replace(a, b % BUILD_COUNT)
    return s


PRICING_HERO_JS = """<div id="bm-pricing-hero"></div><script>(function(){
  var d=%s, host=document.getElementById('bm-pricing-hero'), r=host.attachShadow({mode:'open'});
  r.innerHTML='<style>:host{display:block}'+d.css+'</style>'+d.html;
  // the card flips on click, as on the old page
  var card=r.querySelector('.phv-card'); if(card)r.querySelector('.phv').addEventListener('click',function(){card.classList.toggle('flipped');});
  r.querySelectorAll('.rv').forEach(function(e){e.classList.add('in');});
})();</script>"""


def keep_pricing_hero(s):
    """Swap the design's Pricing hero for the old page's (tools/pricing-hero.json, isolated in a shadow root)."""
    d = json.load(open(os.path.join(ROOT, 'tools', 'pricing-hero.json'), encoding='utf-8'))
    a = s.index('<section class="page-hero', s.index('id="pg-pricing"'))
    hero = section_end(s, a)
    return s[:a] + PRICING_HERO_JS % json.dumps(d).replace('</', '<\/') + s[hero:]


def _nav_builder():
    import importlib.util
    spec = importlib.util.spec_from_file_location('build_nav', os.path.join(ROOT, 'tools', 'build-nav.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        sys.exit('anchor "%s" found %d times, expected 1' % (label, n))
    return s.replace(old, new)


def page_url(pid):
    if pid in PAGES:
        return PAGES[pid]
    if pid.startswith('case-'):
        p = 'work/work-%s.html' % pid[5:]
        return p if os.path.exists(os.path.join(ROOT, p)) else 'work.html'
    if pid.startswith('logo-'):
        p = 'logo-page/%s.html' % pid[5:]
        return p if os.path.exists(os.path.join(ROOT, p)) else 'logo-gallery.html'
    return None


def local_asset(path):
    """Export asset path (decoded, no query) -> repo path, None to drop, KeyError if unknown."""
    if path in ASSETS:
        return ASSETS[path]
    for pre, repl in SAME_DIR.items():
        if path.startswith(pre):
            return repl + path[len(pre):]
    raise KeyError(path)


def spellings(path):
    """Every way the export writes one asset path: raw, %20-encoded, HTML-escaped, JS-escaped."""
    enc = quote(path, safe="/!'&()")
    out = set()
    for v in (path, enc, path.replace(' ', '%20')):
        out.update((v, v.replace("'", '&#x27;'), v.replace("'", "\\'"), v.replace('&', '&amp;'),
                    v.replace("'", '%27')))
    return sorted(out, key=len, reverse=True)


def remap_assets(text, unknown, dropped):
    for dirpath, _, files in os.walk(os.path.join(SRC_DIR, 'assets')):
        for f in files:
            path = os.path.relpath(os.path.join(dirpath, f), SRC_DIR).replace(os.sep, '/')
            hits = [v for v in spellings(path) if v in text]
            if not hits:
                continue
            try:
                new = local_asset(path)
            except KeyError:
                unknown.add(path)
                continue
            if new is None:
                dropped.add(path)
                repl = ''
            else:
                if new not in (OUT_CSS, OUT_JS) and not os.path.isfile(os.path.join(ROOT, new)):
                    sys.exit('mapped file missing in repo: %s -> %s' % (path, new))
                repl = quote(new, safe='/')
            for v in hits:
                # drop the cache-busting ?v= the export added; keep #t= fragments
                text = re.sub(re.escape(v) + r'(\?v=[0-9a-z]+)?', lambda m: repl, text)
    return text


def drop_empty_media_attrs(s):
    # src/poster/href/data-src that pointed at a dropped asset
    s = re.sub(r'\s(?:poster|data-src)=""', '', s)
    # a video whose file was dropped: no src, no autoplay, the poster stands alone
    s = re.sub(r'<video src=""([^>]*)>', lambda m: '<video' + re.sub(r'\s(autoplay|preload="[^"]*")', '', m.group(1)) + '>', s)
    return s


def ink_box(path):
    """Bounding box of the visible mark in a logo file: alpha if it has one, else
    everything that differs from the corner colour."""
    from PIL import Image, ImageChops
    im = Image.open(path).convert('RGBA')
    box = im.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
    if box == (0, 0) + im.size or box is None:
        rgb = im.convert('RGB')
        bg = Image.new('RGB', im.size, rgb.getpixel((0, 0)))
        box = ImageChops.difference(rgb, bg).convert('L').point(lambda v: 255 if v > 24 else 0).getbbox()
    return im.size, box or (0, 0) + im.size


def crop_logos(s):
    """The design sizes each client mark from a tightly trimmed file; the repo's
    logos carry padding, so each one is cropped to its mark with CSS instead."""
    logos = {quote(v, safe='/'): v for v in CLIENT_LOGOS.values()}

    def sub(m):
        tag = m.group(0)
        src = re.search(r'\ssrc="([^"]+)"', tag)
        src = src and src.group(1)
        if src not in logos:
            return tag
        (fw, fh), (x0, y0, x1, y1) = ink_box(os.path.join(ROOT, logos[src]))
        tw, th = x1 - x0, y1 - y0
        h = int(re.search(r'--h:(\d+)', tag).group(1))
        w = max(1, round(h * tw / th))
        var = '--w:%d;--h:%d;--sx:%.4f;--sy:%.4f;--ox:%.4f;--oy:%.4f' % (w, h, fw / tw, fh / th, x0 / tw, y0 / th)
        tag = re.sub(r'style="[^"]*"', 'style="%s"' % var, tag)
        tag = re.sub(r'width="\d+"', 'width="%d"' % w, tag)
        return '<span class="bm-crop" style="--w:%d;--h:%d">%s</span>' % (w, h, tag)
    return re.sub(r'<img\b[^>]*>', sub, s)


CROP_CSS = ('.bmx-logo .bm-crop{display:block;position:relative;overflow:hidden;'
            'width:calc(var(--w) * var(--logo-s) * 1px);height:calc(var(--h) * var(--logo-s) * 1px)}'
            '.bmx-logo .bm-crop img{position:absolute;max-width:none;'
            'width:calc(var(--w) * var(--logo-s) * var(--sx) * 1px)!important;'
            'height:calc(var(--h) * var(--logo-s) * var(--sy) * 1px)!important;'
            'left:calc(var(--w) * var(--logo-s) * var(--ox) * -1px);'
            'top:calc(var(--h) * var(--logo-s) * var(--oy) * -1px)}')


GROWTH_CSS = ('#pg-home .gr-chart .gr-line{stroke-dasharray:none;stroke-dashoffset:0}'
              '@keyframes bmGrDraw{from{stroke-dasharray:0 3000}to{stroke-dasharray:3000 0}}'
              '#pg-home .gr-chart.in .gr-line{animation:bmGrDraw 1.6s cubic-bezier(.16,1,.3,1) both}'
              '@media(prefers-reduced-motion:reduce){#pg-home .gr-chart.in .gr-line{animation:none}}')

def drop_group(s, cls):
    """Remove the one SVG <g class="cls"> and everything inside it."""
    start = s.find('<g class="%s">' % cls)
    if start < 0 or s.find('<g class="%s">' % cls, start + 1) >= 0:
        sys.exit('expected one <g class="%s">' % cls)
    depth = 0
    for m in re.compile(r'<(/?)g[\s>]').finditer(s, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s[:start] + s[s.index('>', m.start()) + 1:]
    sys.exit('unbalanced <g> in %s' % cls)


# Step cards without the photo beats: step 1 alternates its chat and document scenes,
# step 3 holds its handover panels.
STEPS_CSS = ('@keyframes bmStepA{0%,47%{opacity:1;transform:none}49%,97%{opacity:0;transform:translateY(-8px)}98.5%,100%{opacity:1;transform:none}}'
             '@keyframes bmStepB{0%,48%{opacity:0;transform:translateY(8px)}49.5%,96%{opacity:1;transform:none}97.5%,100%{opacity:0;transform:translateY(8px)}}'
             '#pg-home .bmxb-b1{animation:bmStepA 10s cubic-bezier(.22,0,.18,1) infinite}'
             '#pg-home .bmxb-b3{animation:bmStepB 10s cubic-bezier(.22,0,.18,1) infinite}'
             '#pg-home .bmxk-a{animation:none;opacity:1;transform:none}'
             '@media(prefers-reduced-motion:reduce){#pg-home .bmxb-b1,#pg-home .bmxb-b3{animation:none}}')

# James Tan's review from the old Home, as the first card in the reviews carousel
JAMES_TAN_CARD = (
    '<div class="rtc"><div class="rtc-media"><img class="bmx-fill" src="Testimonial%20Image/Teask.webp" '
    'alt="James Tan, founder and CEO of Teask" loading="lazy" decoding="async"></div><div class="rtc-body">'
    '<span class="rtc-qmark">&#8220;</span><p class="rtc-quote">What other companies took six months to do, '
    'Brand Method did in two weeks, with extreme professionalism. The one thing I love about them is their '
    'long-term strategic thinking.</p><div class="rtc-author"><div class="rtc-author-txt">'
    '<span class="rtc-name">James Tan</span><span class="rtc-co">Teask</span></div>'
    '<div class="rtc-stars" aria-label="Rated 5 out of 5">{stars}</div></div></div></div>')


def add_james_tan(s):
    star = re.search(r'<span class="tp-star">.*?</span>', s[s.index('id="tcarTrack"'):], re.S).group(0)
    return once(s, '<div class="tcar-track" id="tcarTrack">',
                '<div class="tcar-track" id="tcarTrack">' + JAMES_TAN_CARD.replace('{stars}', star * 5), 'reviews track')


# the ticker is pulled up over the hero a couple of pixels short, leaving the hero's
# bottom edge showing as a grey line: the white client section paints over it
SEAM_CSS = '#pg-home .clients-section{position:relative;z-index:5}'

# The lead magnet panels play a recording of each Methodas page (tools/record-methodas-previews.js)
# instead of loading the live page into an iframe.
PREVIEW_VIDEOS = {
    'methodas_brand_education_standard.html': ('methodas_brand_education_preview.mp4',
                                               'Image/home/methodas-brand-education-poster.webp'),
    'methodas_52_frameworks.html': ('methodas_52_frameworks_preview.mp4',
                                    'Image/home/methodas-52-frameworks-poster.webp'),
}
PREVIEW_CSS = ('.bmx-scr-stage .bm-scr-vid{position:absolute;inset:0;width:100%;height:100%;'
               'object-fit:cover;object-position:top center;display:block}')
PREVIEW_JS = '''<script id="bm-preview-videos">
(function(){
  var vids=[].slice.call(document.querySelectorAll('.bm-scr-vid'));
  if(!vids.length)return;
  var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function arm(v){if(!v.getAttribute('src')){v.src=v.getAttribute('data-src');v.preload='auto';}}
  if(!('IntersectionObserver' in window)){vids.forEach(function(v){arm(v);if(!still)v.play().catch(function(){});});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    var v=e.target;
    if(e.isIntersecting){arm(v);if(!still)v.play().catch(function(){});}
    else if(!v.paused)v.pause();
  });},{rootMargin:'500px 0px'});
  vids.forEach(function(v){io.observe(v);});
})();
</script>
'''


def use_preview_videos(s):
    for page, (vid, poster) in PREVIEW_VIDEOS.items():
        for f in (vid, poster):
            if not os.path.isfile(os.path.join(ROOT, f)):
                sys.exit('preview file missing: %s (run tools/record-methodas-previews.js)' % f)
        pat = r'<iframe class="bmx-scr-if" data-src="%s"[^>]*></iframe>' % re.escape(page)
        if len(re.findall(pat, s)) != 1:
            sys.exit('expected one live panel for %s' % page)
        s = re.sub(pat, '<video class="bm-scr-vid" data-src="%s" poster="%s" muted loop playsinline preload="none" '
                        'tabindex="-1" aria-hidden="true"></video>' % (vid, poster), s)
    s = once(s, '<style id="bm-home-fix">', '<style id="bm-home-fix">' + PREVIEW_CSS, 'preview css')
    return once(s, '</body>', PREVIEW_JS + '</body>', 'preview js')


def section_end(s, start):
    depth = 0
    for m in re.compile(r'<(/?)section\b').finditer(s, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s.index('>', m.start()) + 1
    sys.exit('unbalanced <section> from %d' % start)


def drop_pages(s, keep):
    """Remove every .pg except the one being built. Styles and scripts inside a
    removed page are kept in its place, since some of them are shared."""
    out, pos = [], 0
    for m in re.finditer(r'<section class="pg[^"]*" id="pg-([a-z0-9-]+)"', s):
        if m.start() < pos or m.group(1) == keep:
            continue
        end = section_end(s, m.start())
        out.append(s[pos:m.start()])
        out.extend(re.findall(r'<style\b.*?</style>|<script\b.*?</script>', s[m.start():end], re.S))
        pos = end
    out.append(s[pos:])
    return ''.join(out)


def relink(s, self_page):
    def a_tag(m):
        tag = m.group(0)
        pm = re.search(r'\sdata-page="([^"]+)"', tag)
        if not pm:
            return tag
        if pm.group(1) == self_page:
            # the router still handles the click in place; the href is only what hover and copy show
            return re.sub(r'\shref="#[^"]*"', ' href="%s"' % PAGES.get(self_page, 'index.html'), tag, count=1)
        url = page_url(pm.group(1))
        sm = re.search(r'\sdata-svc="([^"]+)"', tag)
        if sm and sm.group(1) in SVC:
            url = SVC[sm.group(1)]
            tag = tag.replace(sm.group(0), '')
        if not url:
            return tag
        tag = tag.replace(pm.group(0), '')
        if re.search(r'\shref="[^"]*"', tag):
            return re.sub(r'\shref="[^"]*"', ' href="%s"' % url, tag, count=1)
        return tag[:-1] + ' href="%s">' % url
    return re.sub(r'<a\b[^>]*>', a_tag, s)


def fix_menu_css(s):
    # the mobile menu styles the pricing row by its data-page, which relink removed
    return s.replace('.m-sub a[data-page="pricing"]', '.m-sub a[href="pricing.html"]')


def set_head(s, cfg):
    """Title, description, canonical and share tags for a page other than Home."""
    url = 'https://brandmethod.co/' + cfg['out']
    title, desc = htmllib.escape(cfg['title']), htmllib.escape(cfg['description'])
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, s, count=1, flags=re.S)
    s = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + desc, s, count=1)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + url, s, count=1)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + url, s, count=1)
    for tag in ('property="og:title"', 'name="twitter:title"'):
        s = re.sub(r'(<meta %s content=")[^"]*' % tag, r'\g<1>' + title, s, count=1)
    for tag in ('property="og:description"', 'name="twitter:description"'):
        s = re.sub(r'(<meta %s content=")[^"]*' % tag, r'\g<1>' + desc, s, count=1)
    return s


LIVE_HEAD = '''<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NJ9RQN4S');</script>
<!-- End Google Tag Manager -->
<link rel="icon" href="favicon.ico" sizes="any"/>
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="192x192" href="favicon-192x192.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png"/>
'''

GTM_BODY = ('<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NJ9RQN4S" '
            'height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->')

# Runs before the SPA router: any page id other than this file's own goes to its real
# page, and a file other than Home opens on its own section.
ROUTER_BRIDGE = '''<script id="bm-page-bridge">
(function(){
  var P=%s, SELF=%s;
  // the shared nav on the other pages sends its search and SS buttons here
  var OPEN={'open-search':'bmxSearchBtn','open-ss':'ssBtn'}[(location.hash||'').slice(1)];
  if(OPEN){history.replaceState(null,'',location.pathname);addEventListener('load',function(){
    setTimeout(function(){var b=document.getElementById(OPEN);if(b)b.click();},300);});}
  // the router tracks the page in the hash (#home, #culture); a real page does not need it,
  // so it is only set for the router to read at start-up and kept out of the address bar
  var clean=location.pathname+location.search, rs=history.replaceState.bind(history);
  history.replaceState=function(st,t,u){return rs(st,t,u==='#'+SELF?clean:u);};
  document.addEventListener('DOMContentLoaded',function(){if(location.hash==='#'+SELF)rs(null,'',clean);});
  function url(id){
    if(!id||id===SELF)return null;
    if(P[id])return P[id];
    if(id.indexOf('case-')===0)return 'work/work-'+id.slice(5)+'.html';
    if(id.indexOf('logo-')===0)return 'logo-page/'+id.slice(5)+'.html';
    return null;
  }
  window.__bmxPageUrl=url;
  var u=url((location.hash||'').slice(1));
  if(u){location.replace(u);return;}
  window.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-page],[data-p]');
    if(!a)return;
    var u=url(a.getAttribute('data-page')||a.getAttribute('data-p'));
    if(!u)return;
    e.preventDefault();e.stopImmediatePropagation();location.href=u;
  },true);
  window.addEventListener('hashchange',function(e){
    var u=url((location.hash||'').slice(1));
    if(u){e.stopImmediatePropagation();location.href=u;}
  },true);
})();
</script>
'''

# Both lead magnet forms post to the FormSubmit inbox the old Home used.
LEAD_HOOK = '''<script id="bm-lead-hook">
window.__bmxLeadSubmit=function(lead){
  var fd=new FormData();
  var subj={'brand-growth-playbook':'New Brand Growth Playbook request','52-frameworks':'New 52 Conversion Frameworks request'};
  fd.append('_subject',subj[lead.list]||('New lead: '+lead.list));
  fd.append('_captcha','false');
  fd.append('_template','table');
  if(lead.list==='brand-growth-playbook'){
    fd.append('_autoresponse',"Hi! Thanks for requesting The Brand Growth Playbook from Brand Method. Here's your copy: https://brandmethod.co/methodas_brand_education_standard.html - the exact system we use to take a brand from invisible to impossible to ignore, covering positioning, identity, funnel and content in one practical guide. Want the Full edition we use with clients? Just reply to this email and we'll sort you out. - The Brand Method Team");
  }
  fd.append('list',lead.list);fd.append('name',lead.name);fd.append('email',lead.email);
  return fetch('https://formsubmit.co/ajax/methodastech@gmail.com',{method:'POST',body:fd,headers:{Accept:'application/json'}})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});
};
</script>
'''


def main():
    unknown, dropped = set(), set()
    for page, cfg in BUILDS.items():
        s = build_page(page, cfg, unknown, dropped)
        open(os.path.join(ROOT, cfg['out']), 'w', encoding='utf-8', newline='\n').write(s)
        print('%s %d bytes' % (cfg['out'], len(s.encode())))
    css = open(os.path.join(SRC_DIR, 'assets', 'bmx-live.css'), encoding='utf-8').read()
    js = open(os.path.join(SRC_DIR, 'assets', 'bmx-live.js'), encoding='utf-8').read()
    css = remap_assets(css, unknown, dropped)
    js = remap_assets(js, unknown, dropped)
    if unknown:
        sys.exit('no repo file mapped for:\n  ' + '\n  '.join(sorted(unknown)))
    for path, text in ((OUT_CSS, css), (OUT_JS, js)):
        open(os.path.join(ROOT, path), 'w', encoding='utf-8', newline='\n').write(text)
    print('%s %d, %s %d' % (OUT_CSS, len(css.encode()), OUT_JS, len(js.encode())))
    print('dropped (no copy in repo): ' + ', '.join(sorted(dropped)))


def build_page(page, cfg, unknown, dropped):
    s = open(SRC, encoding='utf-8').read()
    css = open(os.path.join(SRC_DIR, 'assets', 'bmx-live.css'), encoding='utf-8').read()

    # prototype admin bar, its offset script and stylesheet
    s = re.sub(r'<div class="bmws".*?</nav></div></div>', '', s, count=1, flags=re.S)
    s = re.sub(r'<script id="bmWsBarJs">.*?</script>', '', s, count=1, flags=re.S)
    s = re.sub(r'<link[^>]*assets/bmws\.css[^>]*>', '', s)

    # head: live tracking and favicons, and the share image the old Home used
    s = re.sub(r'<link rel="icon" type="image/svg\+xml" href="data:[^"]*"/>', '', s, count=1)
    s = s.replace('https://brandmethod.co/og-cover.jpg', 'https://brandmethod.co/Image/resources/brandmethod-os-framework.png')
    s = once(s, '<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n' + LIVE_HEAD, 'charset')
    if page != 'home':
        s = set_head(s, cfg)
    bridge = ROUTER_BRIDGE % (json.dumps(PAGES, separators=(',', ':')), json.dumps(page))
    s = once(s, '</head><body>', bridge + LEAD_HOOK + '</head><body>' + GTM_BODY, 'body open')

    # full-screen hero: the page zooms above 1500px, so divide the viewport height by that zoom
    bmz = ''.join('@media(min-width:%spx){:root{--bmz:%s}}' % m for m in dict.fromkeys(
        re.findall(r'@media\s*\(min-width:\s*(\d+)px\)\s*\{\s*html\s*\{\s*zoom:\s*([\d.]+)\s*;?\s*\}\s*\}', s + css)))
    # the layer CSS reserves --bmx-bar (62px) for the removed admin bar above the nav and main
    s = once(s, '</body>', '<style id="bm-home-fix">' + bmz +
             'html:root{--bmx-bar:0px}body main{margin-top:0!important}'
             # +2px: at a fractional zoom the division rounds short and a white line shows under the hero
             '#pg-home .hero.bmx-hero-v{min-height:calc(100vh / var(--bmz,1) + 2px)!important;'
             'min-height:calc(100svh / var(--bmz,1) + 2px)!important}</style>\n</body>', 'body close')

    s = drop_pages(s, page)
    s = relink(s, page)
    s = fix_menu_css(s)
    s = drop_empty_media_attrs(remap_assets(s, unknown, dropped))
    # the design's footer links are placeholders: the same fix the shared footer gets
    a = s.index('<footer')
    b = s.index('</footer>', a)
    s = s[:a] + _nav_builder().fix_footer_links(s[a:b]) + s[b:]
    # live builds open the repo's own copy (website/), not brandmethod.co, so they work before deploy too
    s = s.replace('href="https://brandmethod.co/website/', 'href="website/')
    if page == 'pricing':
        s = keep_pricing_hero(s)
    if page == 'tech-portfolio':
        s = add_builds(s)
    else:
        for a, b in (('11 live builds', '%d live builds'), ('11 live websites', '%d live websites')):
            s = s.replace(a, b % BUILD_COUNT)
    depth = cfg['out'].count('/')
    if depth:
        # a page in a subfolder resolves every relative link and image from the site root, like the others;
        # in-page #links keep pointing at this file
        s = once(s, '<meta charset="utf-8"/>', '<meta charset="utf-8"/><base href="%s">' % ('../' * depth), 'base')
        s = s.replace('href="#', 'href="%s#' % cfg['out'])
    if page != 'home':
        # the router starts on this page itself, so no #page hash is ever needed in the address bar
        s = once(s, "var _start='home';", 'var _start=%s;' % json.dumps(page), 'router start')
        # the design stylesheet is linked at the end of this large page; until it loads the nav and
        # page paint half-styled, so the page stays hidden until then (4 s fallback)
        s = once(s, '</head>', '<style id="bm-fouc">html.bm-wait body{opacity:0}'
                 # the nav animates its width into the white bar; here it starts as that bar, so no
                 # transition runs while the page loads
                 'html.bm-still .nav,html.bm-still .nav *{transition:none!important}</style><script>'
                 "(function(){var r=document.documentElement;r.classList.add('bm-wait','bm-still');"
                 "setTimeout(function(){r.classList.remove('bm-wait')},4000);"
                 "addEventListener('load',function(){setTimeout(function(){r.classList.remove('bm-still')},300)});"
                 "})()</script></head>", 'fouc head')
        s = once(s, '<header class="nav" id="nav">', '<header class="nav scrolled" id="nav">', 'nav start state')
        s = once(s, '<link id="bm-live-0916" rel="stylesheet" href="css/home.css">',
                 '<link id="bm-live-0916" rel="stylesheet" href="css/home.css" '
                 "onload=\"document.documentElement.classList.remove('bm-wait')\" "
                 "onerror=\"document.documentElement.classList.remove('bm-wait')\">", 'fouc link')
        # the intro warp loader plays on Home only; every script that uses it checks it exists
        n = len(re.findall(r'<div id="loader">', s))
        if n != 1:
            sys.exit('expected one #loader, found %d' % n)
        s = re.sub(r'<div id="loader">.*?</div></div>(?=<header class="nav[ "])', '', s, count=1, flags=re.S)
        if '<div id="loader">' in s:
            sys.exit('could not remove #loader on %s' % page)
        return s

    s = crop_logos(s)
    s = add_james_tan(s)
    s = once(s, '<style id="bm-home-fix">', '<style id="bm-home-fix">' + SEAM_CSS, 'seam css')
    # the photo beats in step cards 1 and 3 are removed
    s = drop_group(s, 'bmxb-b2')
    s = drop_group(s, 'bmxk-b')
    s = once(s, '<style id="bm-home-fix">', '<style id="bm-home-fix">' + STEPS_CSS, 'steps css')
    # growth chart: the draw-in dash was sized by pathLength, which Firefox ignores under
    # non-scaling-stroke, so the line stopped short of the last point. Draw it by length instead.
    s = once(s, '<path class="gr-line" pathLength="100" ', '<path class="gr-line" ', 'growth line')
    s = once(s, '<style id="bm-home-fix">', '<style id="bm-home-fix">' + GROWTH_CSS, 'growth css')
    s = once(s, '<style id="bm-home-fix">', '<style id="bm-home-fix">' + CROP_CSS, 'crop css')
    s = use_preview_videos(s)
    return s


if __name__ == '__main__':
    main()
