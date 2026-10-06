"""Services dropdown, as in the 25 Sep reference (Downloads/brandmethod-website-2026-09-25,
tools/services-0924.py): "The six phases" on top as a black row (it replaces the plain
"All services overview" link), the five services, then "Pricing" last as a white row.

    python tools/nav-services-menu.py

Patches every page that carries the nav inline, and the generated nav in js/layout.js
(pricing.html, contact.html, blog pages). Safe to run again. Run it after
tools/build-nav.py, which regenerates js/layout.js from culture.html.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'about.html', 'culture.html', 'services.html', 'work.html', 'logo-gallery.html',
         'portfolio.html', 'services/brand-strategy.html', 'services/content-creation.html',
         'services/marketing-ads.html', 'services/system-playbook.html', 'services/website-apps.html']

SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
ICO_GRID = SVG + '<path d="M4 4.6h6.2v6.2H4zM13.8 4.6H20v6.2h-6.2zM4 13.2h6.2v6.2H4zM13.8 13.2H20v6.2h-6.2z"/></svg>'
ICO_TAG = SVG + '<path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="7.6" cy="8.6" r="1.4" fill="currentColor" stroke="none"/></svg>'

SIX = ('<a class="bmdd-row bmdd-row--dark"{dp} href="{p}services.html" style="--c:#0f1228"><span class="bmdd-ic">' + ICO_GRID + '</span>'
       '<span class="bmdd-meta"><span class="bmdd-nm">The six phases</span>'
       '<span class="bmdd-ds">Audit to Engage, the method every service runs on</span></span></a>')
PRICING = ('<a class="bmdd-row bmdd-row--light" href="{p}pricing.html" style="--c:#0f1228"><span class="bmdd-ic">' + ICO_TAG + '</span>'
           '<span class="bmdd-meta"><span class="bmdd-nm">Pricing</span>'
           '<span class="bmdd-ds">Every package with a fixed price, a date and the guarantee</span></span></a>')

# every service icon on a tile tinted with its row colour, solid on hover (reference index.html);
# then the black and white rows, which come later so they win
ROWS_CSS = ('.bmdd-row .bmdd-ic{background:color-mix(in srgb,var(--c,#1a26de) 12%,#fff)!important;color:var(--c,#1a26de)!important}'
            '.bmdd-row .bmdd-ic svg{width:20px!important;height:20px!important}'
            '.bmdd-row:hover .bmdd-ic{background:var(--c,#1a26de)!important;color:#fff!important}'
            '.bmdd-row--dark .bmdd-ic{background:#0f1228!important;color:#fff!important}'
            '.bmdd-row--dark:hover .bmdd-ic{background:#1A26DE!important}'
            '.bmdd-row--light .bmdd-ic{background:#fff!important;color:#0f1228!important;box-shadow:inset 0 0 0 1px rgba(15,18,40,.16)}'
            '.bmdd-row--light:hover .bmdd-ic{background:#0f1228!important;color:#fff!important}'
            '.bmdd-row--dark{margin-bottom:6px}.bmdd-row--light{margin-top:6px}')
CSS_MARK = '/* services menu rows: six phases (black), pricing (white) — tools/nav-services-menu.py */'

# data-page marks the row of the page you are on; keep it
OVERVIEW = re.compile(r'<a class="bmdd-all"((?: data-page="services")?) href="((?:\.\./)?)services\.html">.*?</a>', re.S)
PRODUCT = re.compile(r'<a class="bmdd-row"(?: data-page="[^"]*")? href="((?:\.\./)?)services/website-apps\.html"[^>]*>.*?</a>', re.S)


def patch_menu(html):
    """Returns (html, changed). The overview link only exists in the Services dropdown."""
    if 'bmdd-row--dark' in html:
        return html, False
    m = OVERVIEW.search(html)
    if not m:
        return html, False
    html = html[:m.start()] + SIX.format(dp=m.group(1), p=m.group(2)) + html[m.end():]
    m = PRODUCT.search(html)
    if not m:
        sys.exit('the Product row was not found after the overview link')
    return html[:m.end()] + PRICING.format(p=m.group(1)) + html[m.end():], True


def main():
    for rel in PAGES:
        path = os.path.join(ROOT, rel)
        s = open(path, encoding='utf-8').read()
        s, changed = patch_menu(s)
        if changed:
            open(path, 'w', encoding='utf-8', newline='').write(s)
        print('%-34s %s' % (rel, 'updated' if changed else 'already done / no menu'))

    # shared stylesheet of those pages: one marked block, replaced on every run
    css_path = os.path.join(ROOT, 'css', 'home.css')
    css = open(css_path, encoding='utf-8').read()
    block = CSS_MARK + '\n' + scoped('html body') + '\n'
    i = css.find(CSS_MARK)
    css = (css.rstrip('\n') + '\n' + block) if i < 0 else css[:i] + block + css[css.find('\n', i + len(CSS_MARK) + 1) + 1:]
    open(css_path, 'w', encoding='utf-8', newline='').write(css)
    print('css/home.css                       rows CSS written')

    # js/layout.js: the nav lives in JSON strings inside a shadow root (:host instead of html body)
    js_path = os.path.join(ROOT, 'js', 'layout.js')
    js = open(js_path, encoding='utf-8').read()
    m = re.search(r'var NAV_HTML = (".*?");\n', js)
    if not m:
        sys.exit('NAV_HTML not found in js/layout.js')
    nav, changed = patch_menu(json.loads(m.group(1)))
    js = js[:m.start(1)] + json.dumps(nav) + js[m.end(1):]
    c = re.search(r'var NAV_CSS = (".*?");\n', js)
    if not c:
        sys.exit('NAV_CSS not found in js/layout.js')
    nav_css = json.loads(c.group(1))
    nav_css = re.sub(re.escape(JS_MARK) + r'.*?' + re.escape(JS_END), '', nav_css, flags=re.S)
    nav_css += JS_MARK + scoped(':host') + JS_END
    js = js[:c.start(1)] + json.dumps(nav_css) + js[c.end(1):]
    open(js_path, 'w', encoding='utf-8', newline='').write(js)
    print('js/layout.js                       menu %s, rows CSS written' % ('updated' if changed else 'already done'))


JS_MARK, JS_END = '/*bm-svc-rows*/', '/*/bm-svc-rows*/'


def scoped(prefix):
    return re.sub(r'(^|\})\.', r'\1' + prefix + ' .', ROWS_CSS)


if __name__ == '__main__':
    main()
