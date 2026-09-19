"""Put the new site nav (the one on index.html and culture.html) on every page that
uses js/layout.js.

The other pages load the old css/style.css, which styles the same class names
(.nav-links, .nav-logo, ...) differently, so the nav is mounted in a shadow root:
the old stylesheet cannot reach it and its styles cannot leak onto the page.

    python -m http.server 8870     (repo root, another terminal)
    python tools/build-nav.py

Reads the rendered culture.html (so runtime decoration of the menus is included),
keeps only the CSS rules that style the nav, and writes the generated block between
the BEGIN/END markers in js/layout.js.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
from urllib.parse import unquote
from base64 import b64decode

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = r'C:/Program Files/Google/Chrome/Application/chrome.exe'
PAGE = 'http://127.0.0.1:8870/culture.html'
LAYOUT = os.path.join(ROOT, 'js', 'layout.js')
BEGIN, END = '// BEGIN generated nav (tools/build-nav.py)', '// END generated nav'

# a selector is about the nav if it names one of these
NAV_TOKENS = re.compile(r'(\.nav\b|\.nav-|#nav\b|#navMobile\b|#burger\b|\.burger\b|\.bmdd|\.bmx-navdd|\.bmx-ddic|'
                        r'\.bmx-ddrow|\.bm-uni|\.bm-orbit|\.bm-star\b|\.bm-spoke|\.bm-pulse|\.bm-pip|\.bmx-sbtn|'
                        r'\.m-sub|\.logo-recolor|#bmxSearchBtn|#ssBtn|\.cv\b)')
# element resets the nav relies on
BASE = {'*', '*::before', '*::after', 'a', 'img', 'button', 'svg', 'ul', 'li', ':focus-visible', '::selection', '.amp'}
FONTS = ('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600'
         '&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap')


def rendered_page():
    out = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--window-size=1600,900',
                          '--virtual-time-budget=5000', '--dump-dom', PAGE],
                         capture_output=True, timeout=120)
    html = out.stdout.decode('utf-8')
    if '<header class="nav' not in html:
        sys.exit('could not render %s (is the server running?)' % PAGE)
    return html


def css_in_order(html, base=ROOT):
    """Every stylesheet in document order: inline <style> blocks and linked local CSS (resolved from base)."""
    parts = []
    for m in re.finditer(r'<style\b[^>]*>(.*?)</style>|<link\b[^>]*rel="stylesheet"[^>]*>', html, re.S | re.I):
        if m.group(1) is not None:
            if 'media="not all"' not in m.group(0)[:80]:
                parts.append(m.group(1))
            continue
        href = re.search(r'href="([^"?#]+)', m.group(0))
        if href and not href.group(1).startswith('http'):
            parts.append(open(os.path.join(base, unquote(href.group(1))), encoding='utf-8').read())
    return '\n'.join(parts)


def parse(css):
    """Minimal CSS parser: a list of (prelude, body_text or children)."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    stack = [out]
    buf = ''
    while i < n:
        ch = css[i]
        if ch in '"\'':
            j = i + 1
            while j < n and css[j] != ch:
                j += 2 if css[j] == '\\' else 1
            buf += css[i:j + 1]
            i = j + 1
            continue
        if ch == '{':
            pre = buf.strip()
            buf = ''
            if pre.startswith('@') and not pre.startswith(('@font-face', '@page')) and \
                    not re.match(r'@(-webkit-)?keyframes', pre):
                node = (pre, [])
                stack[-1].append(node)
                stack.append(node[1])
            else:
                depth, j = 1, i + 1
                while j < n and depth:
                    if css[j] == '{':
                        depth += 1
                    elif css[j] == '}':
                        depth -= 1
                    j += 1
                stack[-1].append((pre, css[i + 1:j - 1]))
                i = j
                continue
        elif ch == '}':
            if len(stack) > 1:
                stack.pop()
            buf = ''
        elif ch == ';' and buf.strip().startswith('@'):
            buf = ''  # @import / @charset
        else:
            buf += ch
        i += 1
    return out


def split_selectors(pre):
    parts, depth, cur = [], 0, ''
    for ch in pre:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur.strip())
            cur = ''
        else:
            cur += ch
    parts.append(cur.strip())
    return [p for p in parts if p]


def host_selector(sel):
    """Rewrite one selector for the shadow root, or None to drop it."""
    if sel in (':root', 'html', 'body', 'html,body'):
        return ':host'
    if re.search(r'#pg-|\.pg\b|\[data-page', sel):
        return None
    first = re.match(r'(html|body|:root)([.#:\[][^\s>+~]*)?(\s*[>\s]\s*)', sel)
    if first:
        if first.group(2):
            return None          # a state on html/body the nav does not replicate
        sel = sel[first.end():]
    if sel in BASE or NAV_TOKENS.search(sel):
        return sel
    return None


def filter_rules(nodes, keyframes_used, host_decls):
    out = []
    for pre, body in nodes:
        if isinstance(body, list):
            inner = filter_rules(body, keyframes_used, host_decls)
            if inner:
                out.append((pre, inner))
            continue
        if re.match(r'@(-webkit-)?keyframes', pre):
            out.append((pre, body))
            continue
        if pre.startswith('@'):
            continue
        sels = [host_selector(s) for s in split_selectors(pre)]
        sels = [s for s in sels if s]
        if not sels:
            continue
        if sels == [':host']:
            # custom properties and the wide-screen zoom only; page background, overflow
            # and padding stay with the page
            keep = [d for d in body.split(';') if d.strip().startswith(('--', 'zoom', 'font-family', 'color',
                                                                         'line-height', '-webkit-font-smoothing'))]
            if not keep:
                continue
            body = ';'.join(keep)
        out.append((','.join(dict.fromkeys(sels)), body))
        for name in re.findall(r'animation(?:-name)?\s*:\s*([^;]+)', body):
            keyframes_used.update(re.findall(r'[A-Za-z_][\w-]*', name))
    return out


def drop_unused_keyframes(nodes, used):
    out = []
    for pre, body in nodes:
        m = re.match(r'@(?:-webkit-)?keyframes\s+([\w-]+)', pre)
        if m and m.group(1) not in used:
            continue
        if isinstance(body, list):
            body = drop_unused_keyframes(body, used)
            if not body:
                continue
        out.append((pre, body))
    return out


def emit(nodes):
    out = []
    for pre, body in nodes:
        out.append('%s{%s}' % (pre, emit(body) if isinstance(body, list) else body.strip()))
    return ''.join(out)


def minify(css):
    css = re.sub(r'\s+', ' ', css)
    return re.sub(r'\s*([{};,>])\s*', r'\1', css).replace(';}', '}')


def nav_markup(html):
    a = html.find('<header class="nav')
    b = html.find('</header>', a) + len('</header>')
    nav = html[a:b]
    nav = nav.replace('<header class="nav scrolled"', '<header class="nav"')
    nav = re.sub(r'\sclass="active"', '', nav)
    # links to pages the SPA handled in place: Culture on its own page, the logo home
    nav = re.sub(r'href="#culture"\s+data-page="culture"', 'href="culture.html"', nav)
    nav = re.sub(r'\sdata-page="[^"]*"', '', nav)
    nav = re.sub(r'\sdata-magnetic="[^"]*"', '', nav)
    # the wordmark: use the repo file when the embedded image is one of them
    for uri in set(re.findall(r'data:image/png;base64,[A-Za-z0-9+/=]+', nav)):
        digest = hashlib.md5(b64decode(uri.split(',', 1)[1])).hexdigest()
        for f in os.listdir(ROOT):
            if f.lower().endswith('.png') and hashlib.md5(open(os.path.join(ROOT, f), 'rb').read()).hexdigest() == digest:
                nav = nav.replace(uri, f)
                break
    return nav


RUNTIME = r'''
(function () {
  var NAV_CSS = %(css)s;
  var NAV_HTML = %(html)s;
  if (!document.querySelector('link[data-bm-nav-fonts]')) {
    var fl = document.createElement('link');
    fl.rel = 'stylesheet'; fl.href = %(fonts)s; fl.setAttribute('data-bm-nav-fonts', '');
    document.head.appendChild(fl);
  }
  var host = document.createElement('div');
  host.id = 'bm-nav-host';
  document.body.insertBefore(host, document.body.firstChild);
  var root = host.attachShadow({ mode: 'open' });
  // links and images are written relative to the site root
  var html = NAV_HTML.replace(/(href|src)="(?!https?:|data:|#|mailto:|tel:|\/)([^"]*)"/g, function (m, a, u) {
    return a + '="' + basePath + u + '"';
  }).replace(/url\('(?!https?:|data:|\/)([^']*)'\)/g, function (m, u) { return "url('" + basePath + u + "')"; });
  root.innerHTML = '<style>' + NAV_CSS + '</style>' + html;

  var nav = root.getElementById('nav');
  nav.classList.add('scrolled');   // the light bar: every page but Home opens on a light hero

  // which item is lit
  var path = location.pathname, file = path.split('/').pop() || 'index.html';
  var key = path.indexOf('/services/') > -1 || /^(services|pricing)\.html$/.test(file) ? 'services'
    : path.indexOf('/work/') > -1 || path.indexOf('/logo-page/') > -1 ||
      /^(work|portfolio|logo-gallery|mascot-gallery)\.html$/.test(file) ? 'work'
    : path.indexOf('/blog/') > -1 || file === 'resources.html' ? 'resources'
    : file.replace('.html', '');
  root.querySelectorAll('.nav-links > a, .nav-mobile > a').forEach(function (a) {
    var h = (a.getAttribute('href') || '').split('/').pop().replace('.html', '');
    if (h === key || (key === 'index' && h === 'index')) a.classList.add('active');
  });
  root.querySelectorAll('.nav-dd').forEach(function (dd) {
    var t = (dd.querySelector('.nav-dd-trigger') || {}).textContent || '';
    if (t.trim().toLowerCase().indexOf(key) === 0) dd.querySelector('.nav-dd-trigger').classList.add('active');
  });

  // dropdowns: open on hover with a short grace period, pin on click, close on outside click or Escape
  root.querySelectorAll('.nav-dd').forEach(function (dd) {
    var trg = dd.querySelector('.nav-dd-trigger'), panel = dd.querySelector('.nav-dd-panel');
    if (!trg || !panel) return;
    var t = null, pinned = false;
    function open() { dd.classList.add('open'); trg.setAttribute('aria-expanded', 'true'); }
    function close(force) { if (force) pinned = false; if (!pinned) { dd.classList.remove('open'); trg.setAttribute('aria-expanded', 'false'); } }
    function keep() { clearTimeout(t); open(); }
    function leave() { clearTimeout(t); t = setTimeout(function () { close(false); }, 320); }
    [trg, panel].forEach(function (el) { el.addEventListener('mouseenter', keep); el.addEventListener('mouseleave', leave); });
    function toggle(e) { e.preventDefault(); clearTimeout(t); if (pinned) close(true); else { pinned = true; open(); } }
    trg.addEventListener('click', toggle);
    trg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
    document.addEventListener('click', function (e) { if (e.composedPath().indexOf(dd) < 0) close(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
  });

  // mobile menu
  var burger = root.getElementById('burger'), menu = root.getElementById('navMobile');
  if (burger && menu) burger.addEventListener('click', function () {
    var o = menu.classList.toggle('open');
    burger.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  // search and the members area live on Home
  var sb = root.getElementById('bmxSearchBtn'), ss = root.getElementById('ssBtn');
  if (sb) sb.addEventListener('click', function () { location.href = '/#open-search'; });
  if (ss) ss.addEventListener('click', function () { location.href = '/#open-ss'; });
})();
'''


# ---------------------------------------------------------------- footer
FOOT_BEGIN, FOOT_END = '// BEGIN generated footer (tools/build-nav.py)', '// END generated footer'
# classes js/footer-fx.js looks up: kept as they are, beside their renamed copy
FX_CLASSES = {'footer-fx', 'bm-logo'}
SOCIAL = {'Instagram': 'https://instagram.com/brandmethod', 'LinkedIn': 'https://linkedin.com/company/brandmethod',
          'Facebook': 'https://www.facebook.com/brandmethodinternational/',
          'TikTok': 'https://www.tiktok.com/@bazilzieel69', 'Dribbble': 'https://dribbble.com/BazilZieel',
          'Behance': 'https://www.behance.net/BazilZieel'}
SERVICE_PAGES = ['services/brand-strategy.html', 'services/system-playbook.html', 'services/marketing-ads.html',
                 'services/content-creation.html', 'services/website-apps.html']


def fix_footer_links(f):
    """The design's footer has placeholder links; point them at the real pages."""
    f = re.sub(r'href="#culture"\s+data-page="culture"', 'href="culture.html"', f)
    f = re.sub(r'\sdata-page="[^"]*"', '', f)
    for name, url in SOCIAL.items():
        f = re.sub(r'<a href="#"( target="_blank" rel="noopener"><span class="foot-arrow">[^<]*</span>%s</a>)' % name,
                   lambda m: '<a href="%s"%s' % (url, m.group(1)), f)
    svc = iter(SERVICE_PAGES)
    head = f.index('Our Services')
    end = f.index('</ul>', head)
    f = f[:head] + re.sub(r'href="services\.html"', lambda m: 'href="%s"' % next(svc), f[head:end]) + f[end:]
    f = f.replace('<a href="#" class="js-legal" data-legal="terms">', '<a href="terms-of-service.html">')
    return f.replace('<a href="#" class="js-legal" data-legal="privacy">', '<a href="privacy-policy.html">')


def footer_markup(html):
    a = html.find('<footer')
    f = html[a:html.find('</footer>', a) + len('</footer>')]
    for _ in range(3):
        f = re.sub(r'(<canvas[^>]*?)\s(?:width|height|style)="[^"]*"', r'\1', f)
    f = re.sub(r'(<img class="bm-wordmark"[^>]*?)\ssrc="[^"]*"', r'\1', f)   # footer-fx.js sets it
    f = re.sub(r'(<div class="bm-sheen"[^>]*?)\sstyle="[^"]*"', r'\1', f)
    return fix_footer_links(f)


def footer_classes(f):
    out = set()
    for c in re.findall(r'class="([^"]+)"', f):
        out.update(c.split())
    return out


def rename_footer(f):
    def cls(m):
        toks = []
        for t in m.group(1).split():
            toks.append('bmf-' + t)
            if t in FX_CLASSES:
                toks.append(t)
        return 'class="%s"' % ' '.join(toks)
    f = re.sub(r'class="([^"]+)"', cls, f)
    return f.replace('<footer>', '<footer class="bmf">', 1)


def footer_selector(sel, classes):
    """Rewrite one design selector for the renamed footer, or None when it is not about it."""
    if re.search(r'#pg-|\.pg\b|\[data-page', sel):
        return None
    m = re.match(r'(html|body|:root)([.#:\[][^\s>+~]*)?\s*[>\s]\s*', sel)
    if m:
        if m.group(2):
            return None
        sel = sel[m.end():]
    toks = re.findall(r'\.([\w-]+)', sel)
    ids = set(re.findall(r'#([\w-]+)', sel))
    has_footer = re.search(r'(^|[\s>+~(,])footer\b', sel) is not None
    fx_ids = ids & {'bmCanvas', 'bmSheen', 'bmStar', 'bmWordmark'}
    if not toks and not has_footer and not fx_ids:
        return None
    if ids - fx_ids or any(t not in classes for t in toks):
        return None
    if not (has_footer or fx_ids or any(t.startswith(('footer', 'bm-', 'foot-')) for t in toks)):
        sel = 'footer ' + sel      # a generic class (.amp, ...) counts only inside the footer
    sel = re.sub(r'\.([\w-]+)', lambda m: '.bmf-' + m.group(1), sel)
    return re.sub(r'(^|[\s>+~(])footer\b(?!\.bmf)', r'\1footer.bmf', sel)


def footer_rules(nodes, classes, used, vars_):
    out = []
    for pre, body in nodes:
        if isinstance(body, list):
            inner = footer_rules(body, classes, used, vars_)
            if inner:
                out.append((pre, inner))
            continue
        if re.match(r'@(-webkit-)?keyframes', pre):
            out.append((pre, body))
            continue
        if pre.startswith('@'):
            continue
        if re.fullmatch(r'\s*(:root|html)(\s*,\s*(:root|html))*\s*', pre):
            vars_.extend(d.strip() for d in body.split(';') if d.strip().startswith('--'))
            continue
        sels = [footer_selector(x, classes) for x in split_selectors(pre)]
        sels = [x for x in sels if x]
        if not sels:
            continue
        out.append((','.join(dict.fromkeys(sels)), body))
        for name in re.findall(r'animation(?:-name)?\s*:\s*([^;]+)', body):
            used.update(re.findall(r'[A-Za-z_][\w-]*', name))
    return out


FOOT_RUNTIME = r"""
var BM_FOOTER_CSS = %(css)s;
var BM_FOOTER_HTML = %(html)s.replace(/(href|src)="(?!https?:|data:|#|mailto:|tel:|\/)([^"]*)"/g, function (m, a, u) {
  return a + '="' + basePath + u + '"';
});
"""


def build_footer(html):
    f = footer_markup(html)
    classes = footer_classes(f)
    used, vars_ = set(), []
    rules = drop_unused_keyframes(footer_rules(parse(css_in_order(html)), classes, used, vars_), used)
    # the design's colour and type tokens, scoped so the old stylesheet's values do not reach in
    css = 'footer.bmf{%s}' % ';'.join(dict.fromkeys(vars_)) + minify(emit(rules))
    return FOOT_RUNTIME % {'css': json.dumps(css), 'html': json.dumps(rename_footer(f))}, css


def main():
    html = rendered_page()
    used = set()
    rules = filter_rules(parse(css_in_order(html)), used, [])
    rules = drop_unused_keyframes(rules, used)
    css = minify(emit(rules))
    # --bmx-bar is space the design reserved for its admin bar above the nav; there is none here
    css = ':host{display:block;position:relative;z-index:9990}' + css + ':host{--bmx-bar:0px}'
    nav = nav_markup(html)
    block = RUNTIME % {'css': json.dumps(css), 'html': json.dumps(nav), 'fonts': json.dumps(FONTS)}
    src = open(LAYOUT, encoding='utf-8').read()
    a, b = src.index(BEGIN), src.index(END)
    src = src[:a + len(BEGIN)] + '\n' + block.strip() + '\n' + src[b:]
    foot, fcss = build_footer(html)
    a, b = src.index(FOOT_BEGIN), src.index(FOOT_END)
    src = src[:a + len(FOOT_BEGIN)] + '\n' + foot.strip() + '\n' + src[b:]
    print('footer css %d bytes' % len(fcss))
    open(LAYOUT, 'w', encoding='utf-8', newline='\n').write(src)
    print('nav css %d bytes, markup %d bytes, layout.js %d bytes' % (len(css), len(nav), len(src.encode())))


if __name__ == '__main__':
    main()
