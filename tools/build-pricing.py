"""Build pricing.html from the designer's standalone Services & Pricing file.

    python tools/build-pricing.py "C:/Users/user/Downloads/BrandMethod-Services.html"

The design file is used as-is, except:
  - its loading screen (#bm-preload: logo, progress bar, percentage) is removed;
  - the site head is kept from the current pricing.html: GTM, favicons, title,
    description, canonical, Open Graph / Twitter tags and the JSON-LD schema;
  - the site nav and footer come from js/layout.js (nav in a shadow root, footer
    classes prefixed bmf-), so the design's CSS and the site's CSS cannot clash;
  - the old WhatsApp number is swapped for the current one;
  - the page stays blank until it is parsed, so it never shows half-styled;
  - TWEAKS: Bespoke tier in violet instead of black, and on desktop the content edges
    follow the site nav (logo on the left, Hire Us on the right).
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'pricing.html')
OLD_PHONE, PHONE = '60122826371', '60162563030'
HEAD_BEGIN, HEAD_END = '<!-- site head (tools/build-pricing.py) -->', '<!-- /site head -->'
# The page is ~4.5 MB with style blocks spread through <body> and the site nav added at the
# very end, so the browser would paint it half-styled while parsing. Keep it blank until the
# document is parsed (no loading screen or animation), with a safety reveal.
HOLD = ('<style id="bm-hold">html.bm-wait body{opacity:0}</style>'
        "<script>(function(){var r=document.documentElement;r.classList.add('bm-wait');"
        "function show(){r.classList.remove('bm-wait')}"
        "document.addEventListener('DOMContentLoaded',show);setTimeout(show,4000);})()</script>")

# Site-side adjustments on top of the design, placed after all of its styles.
TWEAKS = r'''<style id="bm-pricing-tweaks">
/* Bespoke tier: tinted violet header like the other tiers, not the black panel */
html body .svc-block .svc-panels .svc-panel.bespoke:nth-child(n) .panel-pic-top[class*="-pic"],html body .svc-block .svc-panels .svc-panel.bespoke:nth-child(n):hover .panel-pic-top[class*="-pic"]{background:#F1EBFE !important;border-bottom-color:#DDD3FB !important}
html body .jm4-hero.is-besp .jm4-pic{background:#F5F1FF;border-left-color:#E4DBFC;border-bottom-color:#E4DBFC}
/* Desktop: content edges follow the site nav (logo left, Hire Us right); --bm-gl/--bm-gr are measured below */
html.bm-fit body .wrap,html.bm-fit body .cx-section,html.bm-fit body .cx-cta,html.bm-fit body .bmpd-bar-inner{max-width:none !important;margin-left:0 !important;margin-right:0 !important;padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important}
html.bm-fit body .bmph,html.bm-fit body #svcnav{padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important}
html.bm-fit body .bmph-inner,html.bm-fit body .ebs-strip{max-width:none !important;margin-left:0 !important;margin-right:0 !important}
html.bm-fit body .cx-footer{max-width:none !important;margin-left:var(--bm-gl) !important;margin-right:var(--bm-gr) !important}
/* four-card rows: fill the content column like the three-card rows (they only scroll when four 384px cards do not fit) */
@supports (grid-template-rows:subgrid){html.bm-fit body .wrap .svc-block .svc-panels.has-four{grid-auto-columns:minmax(384px,1fr) !important;margin-left:0 !important;margin-right:0 !important;padding-left:0 !important;padding-right:0 !important;scroll-padding-left:0 !important}}
</style>
<script id="bm-pricing-fit">(function(){
  var r=document.documentElement;
  function fit(){
    var h=document.getElementById('bm-nav-host'), s=h&&h.shadowRoot,
        lg=s&&s.querySelector('.nav-logo'), ct=s&&s.querySelector('.nav-right .nav-cta');
    if(!lg||!ct||window.innerWidth<=980){ r.classList.remove('bm-fit'); return; }
    var a=lg.getBoundingClientRect(), b=ct.getBoundingClientRect();
    r.style.setProperty('--bm-gl',Math.round(a.left)+'px');
    r.style.setProperty('--bm-gr',Math.round(r.clientWidth-b.right)+'px');
    r.classList.add('bm-fit');
  }
  fit(); window.addEventListener('resize',fit); window.addEventListener('load',fit);
})();</script>
'''


def cut(s, pattern, what):
    s2, n = re.subn(pattern, '', s, count=1, flags=re.S)
    if n != 1:
        sys.exit('could not find %s in the design file' % what)
    return s2


def site_head(cur):
    """The SEO / tracking part of the current pricing.html <head>."""
    m = re.search(re.escape(HEAD_BEGIN) + r'\n(.*?)\n' + re.escape(HEAD_END), cur, re.S)
    if m:  # pricing.html was built by this script before
        return m.group(1)
    head = cur[:cur.index('</head>')]
    a = head.index('<!-- Google Tag Manager -->')
    b = head.index('<link rel="preconnect"')
    block = re.sub(r'<meta name="viewport"[^>]*>\n?', '', head[a:b]).rstrip()
    ld = re.search(r'<script type="application/ld\+json">.*?</script>', cur, re.S)
    return block + ('\n' + ld.group(0) if ld else '')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = open(sys.argv[1], encoding='utf-8').read()
    cur = open(OUT, encoding='utf-8').read()

    s = src
    s = cut(s, r'<style id="bm-preload-css">.*?</style>\s*', 'the loader CSS')
    s = cut(s, r'<div id="bm-preload"[^>]*>.*?<div class="bmpl-cap">.*?</div>\s*</div>\s*', 'the loader markup')
    s = cut(s, r'<script id="bm-preload-js">.*?</script>\s*', 'the loader script')
    if 'bm-preload' in s.replace("getElementById('bm-preload')", ''):
        sys.exit('loader leftovers still in the page')

    # site head in place of the design's title and inline favicon
    s = cut(s, r'<title>.*?</title>\s*', 'the <title>')
    # the href is an inline SVG, so it holds '>' characters of its own
    s = cut(s, r'<link rel="icon" href="data:image/svg\+xml[^"]*"[^>]*>\s*', 'the inline favicon')
    s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n%s\n%s\n%s\n%s' % (HEAD_BEGIN, site_head(cur), HEAD_END, HOLD), 1)

    gtm_ns = re.search(r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->', cur, re.S)
    s = s.replace('<body>', '<body>' + (gtm_ns.group(0) if gtm_ns else ''), 1)

    s = s.replace(OLD_PHONE, PHONE)

    # site nav + footer; the main pages carry no floating WhatsApp / scroll-top buttons, and the
    # footer relies on the site's link reset, which the design file does not have
    tail = ('<style id="bm-site-shell">.wa-float,.scroll-top-float{display:none!important}'
            'footer.bmf a{text-decoration:none}</style>\n'
            '<script src="js/layout.js?v=3"></script>\n' + TWEAKS)
    i = s.rindex('</body>')
    s = s[:i] + tail + s[i:]

    open(OUT, 'w', encoding='utf-8', newline='').write(s)
    print('wrote %s (%d bytes)' % (OUT, len(s.encode('utf-8'))))


if __name__ == '__main__':
    main()
