"""Port the 30 Oct design of the Work section into the site: the Work hub and Branding grid,
the Archive, the 24 case pages and the Mascot Gallery.

The design export ("brandmethod-website" in Downloads, 30 Oct) is the single-page app every
page here was first built from (tools/build-home-0918.py). Rebuilding these pages from it
would undo the hand fixes made since, so this script keeps each page's current file as the
shell (head, nav, footer, router) and swaps in only the page's own <section class="pg">:

    work.html            <- #pg-work (our Tech portfolio pane is kept: the user's 16 builds)
    mascot-gallery.html  <- #pg-mascot-gallery
    archive.html         <- #pg-archive              (shell: mascot-gallery.html)
    work/work-<slug>.html <- #pg-case-<slug>, 24 pages (shell: mascot-gallery.html)

The design's rules and scripts for these pages that css/home.css and js/home.js do not have
yet go to css/work6.css and js/work6.js, linked after home.css so they win as in the design.
Every picture is pointed at the repo's copy (MAP); files the repo does not have are copied in.

    python tools/build-work-1031.py           # report only
    python tools/build-work-1031.py --write
"""
import filecmp
import html as htmllib
import json
import os
import re
import shutil
import sys
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(os.path.expanduser('~'), 'Downloads', 'brandmethod-website')
WRITE = '--write' in sys.argv

# export asset folder -> repo folder (same file names below them)
MAP = [
    ('assets/live/work6/', 'Image/work6/'),
    ('assets/live/Image/', 'Image/'),
    ('assets/live/logo-gallery-images/', 'Image/logo-gallery-images/'),
    ('assets/live/work-images/', 'work-images/'),
    ('assets/home/mascot/', 'Image/mascot/'),
    ('assets/home/tech/', 'work-images/'),
]
# the case folders the first port named <x>-images under Image/work6/
IMAGES_DIR = re.compile(r'^assets/live/([a-z0-9-]+-images)/')
# an existing repo file that differs from the design's is replaced only in these folders (the case work);
# anywhere else the repo's copy is kept, since other pages use it too
REPLACE_IN = ('Image/work6/', 'Image/mascot/')

PAGES = {
    'home': '/', 'about': 'about.html', 'work': 'work.html', 'services': 'services.html', 'pricing': 'pricing.html',
    'resources': 'resources.html', 'contact': 'contact.html', 'culture': 'culture.html',
    'logo-gallery': 'logo-gallery.html', 'mascot-gallery': 'mascot-gallery.html', 'tech-portfolio': 'portfolio.html',
    'archive': 'archive.html',
}
BUILDS_LIVE = '16 live builds'  # the Tech portfolio count after the user's 31 Oct edit


def die(msg):
    sys.exit('build-work-1031: ' + msg)


def read(p):
    return open(p, encoding='utf-8').read()


def element_end(s, start, tag):
    depth = 0
    for m in re.compile(r'<(/?)%s\b' % tag).finditer(s, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s.index('>', m.start()) + 1
    die('unbalanced <%s> from %d' % (tag, start))


def page_section(s, pid):
    m = re.search(r'<section class="pg[^"]*" id="pg-%s"' % re.escape(pid), s)
    if not m:
        die('no #pg-%s' % pid)
    return m.start(), element_end(s, m.start(), 'section')


def page_url(pid):
    if pid in PAGES:
        return PAGES[pid]
    if pid.startswith('case-'):
        return 'work/work-%s.html' % pid[5:]
    if pid.startswith('logo-'):
        p = 'logo-page/%s.html' % pid[5:]
        return p if os.path.exists(os.path.join(ROOT, p)) else 'logo-gallery.html'
    return None


def relink(s, self_url):
    """#page links -> the real page; the data-page that the router would catch is dropped."""
    def a_tag(m):
        tag = m.group(0)
        pm = re.search(r'\sdata-page="([^"]+)"', tag)
        hm = re.search(r'\shref="#([a-z0-9-]+)"', tag)
        pid = pm.group(1) if pm else (hm.group(1) if hm else None)
        url = page_url(pid) if pid else None
        if not url:
            return tag
        if pm:
            tag = tag.replace(pm.group(0), '')
        if re.search(r'\shref="[^"]*"', tag):
            return re.sub(r'\shref="[^"]*"', ' href="%s"' % url, tag, count=1)
        return tag[:-1] + ' href="%s">' % url
    return re.sub(r'<a\b[^>]*>', a_tag, s)


class Assets:
    def __init__(self):
        self.copy, self.kept, self.missing = {}, set(), set()

    def repo_path(self, path):
        for pre, repl in MAP:
            if path.startswith(pre):
                return repl + path[len(pre):]
        m = IMAGES_DIR.match(path)
        if m:
            return 'Image/work6/%s/%s' % (m.group(1), path[m.end():])
        return None

    def sub(self, text, prefix=''):
        def one(m):
            raw = m.group(0)
            path = unquote(htmllib.unescape(raw)).split('?')[0]
            new = self.repo_path(path)
            if new is None:
                self.missing.add(path)
                return raw
            src = os.path.join(SRC_DIR, path)
            dst = os.path.join(ROOT, new)
            if not os.path.isfile(src):
                if os.path.isfile(dst):
                    return prefix + new.replace(' ', '%20')
                self.missing.add(path)
                return raw
            if not os.path.isfile(dst):
                self.copy[dst] = src
            elif not filecmp.cmp(src, dst, shallow=False):
                if new.startswith(REPLACE_IN):
                    self.copy[dst] = src
                else:
                    self.kept.add(new)
            return prefix + new.replace(' ', '%20')
        return re.sub(r'assets/(?:live|home)/[^"\'()\s,]+?\.(?:webp|png|jpe?g|gif|svg|mp4|webm|avif|vtt)(?:\?v=[0-9a-z]+)?', one, text)


# ---------------------------------------------------------------- CSS: rules these pages need
RELEVANT = re.compile(r'wk6|wk-chip|bmx-wkp|wkcard|wkgrid|wk-filters|bmx-pane\b|bmx-panel|bmx-detail|'
                      r'#pg-(?:work|archive|case-[a-z0-9-]+|mascot-gallery)\b')


def css_blocks(css, media=()):
    """Flatten to (media chain, head, body) in source order; @keyframes and @font-face stay whole."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, j = [], 0
    while True:
        k = css.find('{', j)
        if k < 0:
            break
        head = css[j:k].strip()
        d, e = 1, k + 1
        while d and e < len(css):
            d += {'{': 1, '}': -1}.get(css[e], 0)
            e += 1
        body = css[k + 1:e - 1]
        if re.match(r'@(media|supports|container)\b', head):
            out += css_blocks(body, media + (head,))
        else:
            out.append((media, head, body.strip()))
        j = e
    return out


def norm_sel(s):
    return re.sub(r'\s+', '', s.replace("'", '"'))


# Selectors of the design's bmx-live.css that match an element inside these sections, read from the
# design page itself (scratch tool matchsel.js; regenerate when the design changes). Catches the rules
# whose names say nothing about Work, such as "html body .bmx-wk{min-height:0}".
MATCHED = {norm_sel(x) for x in json.load(open(os.path.join(ROOT, 'tools', 'work6-selectors.json'), encoding='utf-8'))}


EXTRA_OK = re.compile(r'\.bmx-wk\b|\.bmx-p[mtcd]\b|\.bmx-work\b|\.bmx-back\b|\.bmx-lcard\b|\.wkcat\b')
EXTRA_NO = re.compile(r'section-inner|bmx-tgrid|bmx-lgrid|bmx-shot|\.pg>|\.page-hero\b|cta-band')


def build_css(assets, report=False):
    ours = {(m, h): b for m, h, b in css_blocks(read(os.path.join(ROOT, 'css/home.css')))}
    blocks = css_blocks(read(os.path.join(SRC_DIR, 'assets/bmx-live.css')))
    picked, frames = [], set()
    for m, h, b in blocks:
        if h.startswith('@'):
            continue
        if ours.get((m, h)) == b:
            continue
        if not RELEVANT.search(h):
            # a rule found only by matching: just the Work hero, hub panels, back link and cards. The design's
            # site-wide gutters, hero and band paddings and gallery thumbnails stay as the rest of the site has them
            if norm_sel(h) not in MATCHED or not EXTRA_OK.search(h) or EXTRA_NO.search(h):
                continue
            if report:
                print('  + %s%s{%s}' % (' '.join(m) + ' ' if m else '', h[:90], b[:90]))
        picked.append((m, h, b))
        frames.update(re.findall(r'animation(?:-name)?\s*:\s*([A-Za-z0-9_-]+)', b))
        frames.update(re.findall(r'animation\s*:[^;]*?\b([A-Za-z][A-Za-z0-9_-]*(?:wk6|wkp|mem|pose|cast)[A-Za-z0-9_-]*)', b))
    keyf = [(m, h, b) for m, h, b in blocks if h.startswith('@keyframes')
            and h.split()[1] in frames and ours.get((m, h)) != b]
    out, cur = [], None
    for m, h, b in keyf + picked:
        if m != cur:
            if cur:
                out.append('}' * len(cur))
            out.append(''.join(x + '{' for x in m))
            cur = m
        out.append('%s{%s}' % (h, b))
    if cur:
        out.append('}' * len(cur))
    css = '\n'.join(x for x in out if x)
    css = assets.sub(css, prefix='../')
    head = ('/* The 30 Oct design of the Work section (hub, Branding grid, archive, case pages, mascot gallery):\n'
            '   the rules of the design export\'s assets/bmx-live.css that css/home.css does not have yet.\n'
            '   Generated by tools/build-work-1031.py; edit the design, then rebuild. */\n')
    return head + css + '\n' + LOCAL_CSS, len(picked), len(keyf)


# This site's own adjustments, after the design's rules.
LOCAL_CSS = '''/* --- site adjustments --- */
/* case pages: the design's nav is clear at the top of a page, so its "Back to work" may sit under it; this site's
   nav is solid white, so the case header starts under the nav (--wk6-navb is its measured bottom, js/work6.js) */
html body .pg[id^="pg-case-"] .wk6-chead{padding-top:calc(var(--wk6-navb,72px) + clamp(16px,2.4vw,34px))!important}
'''


# ---------------------------------------------------------------- JS: the case page and grid scripts
JS_MARKS = ['/* 6 Oct 2026: Work grid.', '/* 7 Oct 2026: case pages, Pentagram', '/* 26 Oct 2026: a case film with data-loop-from']


def build_js():
    js = read(os.path.join(SRC_DIR, 'assets/bmx-live.js'))
    parts = []
    for mark in JS_MARKS:
        a = js.find(mark)
        if a < 0:
            die('script block not found: ' + mark)
        b = js.index('(function', a)
        depth, end = 0, None
        for m in re.compile(r'[{}]').finditer(js, js.index('{', b)):
            depth += 1 if m.group(0) == '{' else -1
            if depth == 0:
                end = m.end()
                break
        call = re.compile(r'\s*\)\s*\(\s*\)\s*;?').match(js, end)
        if not call:
            die('script block does not end in })(): ' + mark)
        parts.append(js[a:call.end()])
    return ('/* The 30 Oct design of the Work section: the Work grid, the case pages\' "About the project" button\n'
            '   and the case films, from the design export\'s assets/bmx-live.js. Generated by tools/build-work-1031.py. */\n'
            + '\n\n'.join(parts) + '\n')


# ---------------------------------------------------------------- pages
def set_head(s, out, title, desc):
    url = 'https://brandmethod.co/' + out
    title, desc = htmllib.escape(title), htmllib.escape(desc)
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, s, count=1, flags=re.S)
    for pat in (r'(<meta name="description" content=")[^"]*', r'(<meta property="og:description" content=")[^"]*',
                r'(<meta name="twitter:description" content=")[^"]*'):
        s = re.sub(pat, lambda m: m.group(1) + desc, s, count=1)
    for pat in (r'(<meta property="og:title" content=")[^"]*', r'(<meta name="twitter:title" content=")[^"]*'):
        s = re.sub(pat, lambda m: m.group(1) + title, s, count=1)
    for pat in (r'(<link rel="canonical" href=")[^"]*', r'(<meta property="og:url" content=")[^"]*'):
        s = re.sub(pat, lambda m: m.group(1) + url, s, count=1)
    return s


def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        die('anchor "%s" found %d times in the shell' % (label, n))
    return s.replace(old, new)


def into_shell(shell, shell_pid, section, pid, out, title=None, desc=None):
    a, b = page_section(shell, shell_pid)
    s = shell[:a] + section + shell[b:]
    if pid != shell_pid:
        s = once(s, 'var _start=%s;' % json.dumps(shell_pid), 'var _start=%s;' % json.dumps(pid), 'router start')
    # the page bridge's own id (the mascot page's still said logo-gallery, from the page it was cloned from)
    s, n = re.subn(r'(var P=\{"[^}]*\}, SELF=)"[^"]*";', lambda m: m.group(1) + json.dumps(pid) + ';', s, count=1)
    if n != 1:
        die('page bridge not found')
    # the bridge's page map learns the archive, so the router sends #archive there
    # (only the bridge's own map: a later script has an unrelated var P={tl:...})
    s = s.replace('var P={"archive":"archive.html",tl:', 'var P={tl:')
    s = re.sub(r'(var P=\{)(?="about")', r'\1"archive":"archive.html",', s, count=1)
    if title:
        s = set_head(s, out, title, desc)
    # the section's own styles and scripts, after css/home.css as in the design
    css_link = '<link id="bm-work6" rel="stylesheet" href="css/work6.css?v=%s">' % VERSION
    js_tag = '<script id="bm-work6-js" src="js/work6.js?v=%s" defer></script>' % VERSION
    s = re.sub(r'<link id="bm-work6"[^>]*>|<script id="bm-work6-js"[^>]*></script>', '', s)
    m = re.search(r'<link id="bm-live-0916"[^>]*>', s)
    s = s[:m.end()] + css_link + js_tag + s[m.end():]
    depth = out.count('/')
    if depth and '<base href=' not in s:
        s = once(s, '<meta charset="utf-8"/>', '<meta charset="utf-8"/><base href="%s">' % ('../' * depth), 'base')
        s = s.replace('href="#', 'href="%s#' % out)
    return s


VERSION = '20261031a'


def case_meta(pid, section):
    """Title and description: the old case page's own (search engines have them), else the design's."""
    old = os.path.join(ROOT, 'work', 'work-%s.html' % pid[5:])
    if os.path.isfile(old):
        o = read(old)
        t = re.search(r'<title>(.*?)</title>', o, re.S)
        d = re.search(r'<meta name="description" content="([^"]*)"', o)
        if t and d:
            return htmllib.unescape(t.group(1).strip()), htmllib.unescape(d.group(1))
    name = re.search(r'<h1 class="wk6-ctitle[^"]*"[^>]*>(.*?)</h1>', section, re.S)
    lede = re.search(r'<p class="wk6-clede[^"]*"[^>]*>(.*?)</p>', section, re.S)
    strip = lambda x: re.sub(r'\s+', ' ', htmllib.unescape(re.sub(r'<[^>]+>', '', x))).strip()
    return '%s | Brand Method' % strip(name.group(1)), strip(lede.group(1)) if lede else ''


def main():
    ex = read(os.path.join(SRC_DIR, 'index.html'))
    assets = Assets()
    work_shell = read(os.path.join(ROOT, 'work.html'))
    mascot_shell = read(os.path.join(ROOT, 'mascot-gallery.html'))
    outputs = {}

    def section(pid, self_url):
        a, b = page_section(ex, pid)
        x = relink(ex[a:b], self_url)
        x = x.replace('href="https://brandmethod.co/website/', 'href="website/')
        return assets.sub(x)

    # Work: the design's section with our Tech portfolio pane and count
    w = section('work', 'work.html')
    ours_a, ours_b = page_section(work_shell, 'work')
    ours = work_shell[ours_a:ours_b]
    pane_re = r'<div class="bmx-pane[^"]*" id="bmxPane-tech'
    pm_ours, pm_new = re.search(pane_re, ours), re.search(pane_re, w)
    if not pm_ours or not pm_new:
        die('Tech portfolio pane not found')
    our_pane = ours[pm_ours.start():element_end(ours, pm_ours.start(), 'div')]
    w = w[:pm_new.start()] + our_pane + w[element_end(w, pm_new.start(), 'div'):]
    w = re.sub(r'(<span class="bmx-pc">)\d+ live builds(</span>)', r'\g<1>%s\2' % BUILDS_LIVE, w)
    # the Tech portfolio panel's strip of screenshots: the builds the user removed on 31 Oct stay out
    w = re.sub(r'<span><img src="Image/portfolio/(?:contenthub|brandstrategy)-ss\.webp"[^>]*></span>', '', w)
    outputs['work.html'] = into_shell(work_shell, 'work', w, 'work', 'work.html')

    outputs['mascot-gallery.html'] = into_shell(mascot_shell, 'mascot-gallery', section('mascot-gallery', 'mascot-gallery.html'),
                                                'mascot-gallery', 'mascot-gallery.html')
    outputs['archive.html'] = into_shell(mascot_shell, 'mascot-gallery', section('archive', 'archive.html'), 'archive',
                                         'archive.html', 'Project Archive | Brand Method',
                                         'Earlier Brand Method branding projects, kept on record.')
    cases = re.findall(r'<section class="pg[^"]*" id="pg-(case-[a-z0-9-]+)"', ex)
    for pid in cases:
        out = 'work/work-%s.html' % pid[5:]
        x = section(pid, out)
        title, desc = case_meta(pid, x)
        outputs[out] = into_shell(mascot_shell, 'mascot-gallery', x, pid, out, title, desc)

    css, nrules, nkf = build_css(assets)
    js = build_js()

    print('pages: %d (%d case pages)' % (len(outputs), len(cases)))
    print('css/work6.css: %d rules, %d keyframes, %d bytes' % (nrules, nkf, len(css)))
    print('js/work6.js: %d bytes' % len(js))
    size = sum(os.path.getsize(s) for s in assets.copy.values())
    new = [d for d in assets.copy if not os.path.exists(d)]
    print('files to copy: %d (%d new, %d replaced), %.1f MB' % (len(assets.copy), len(new), len(assets.copy) - len(new), size / 1e6))
    if assets.kept:
        print('repo copy kept (differs from the design): %d, e.g. %s' % (len(assets.kept), sorted(assets.kept)[:5]))
    if assets.missing:
        die('no file for:\n  ' + '\n  '.join(sorted(assets.missing)))
    if not WRITE:
        print('report only; run with --write')
        return
    for dst, src in assets.copy.items():
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
    for out, s in outputs.items():
        open(os.path.join(ROOT, out), 'w', encoding='utf-8', newline='\n').write(s)
    open(os.path.join(ROOT, 'css/work6.css'), 'w', encoding='utf-8', newline='\n').write(css)
    open(os.path.join(ROOT, 'js/work6.js'), 'w', encoding='utf-8', newline='\n').write(js)
    print('written')


if __name__ == '__main__':
    main()
