"""Snapshot one page's hero (markup as rendered + only the CSS that styles it) into a JSON file,
for mounting in a shadow root on another page where the two stylesheets would otherwise clash.

    python -m http.server 8870     (repo root, another terminal)
    python tools/extract-pricing-hero.py                       old pricing.html hero -> tools/pricing-hero.json
    python tools/extract-pricing-hero.py URL PG_ID OUT.json    any page, e.g. the design's Resources banner:
        python tools/extract-pricing-hero.py "brandmethod-website%2018-9/index.html?bmxarm=all#resources" pg-resources js/resources-banner.js

An OUT ending in .js is written as a script that mounts the hero into the element just before its
<script> tag (resources.html uses this for the design's banner).

A page from the design export has its asset paths mapped to the repo's own files (build-home-0918.py ASSETS).
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = r'C:/Program Files/Google/Chrome/Application/chrome.exe'

spec = importlib.util.spec_from_file_location('build_nav', os.path.join(ROOT, 'tools', 'build-nav.py'))
bn = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bn)


def rendered(page):
    out = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--window-size=1600,900',
                          '--virtual-time-budget=6000', '--dump-dom', 'http://127.0.0.1:8870/' + page],
                         capture_output=True, timeout=120)
    return out.stdout.decode('utf-8')


def section_at(s, a):
    d = 0
    for m in re.compile(r'<(/?)section\b').finditer(s, a):
        d += -1 if m.group(1) else 1
        if d == 0:
            return s[a:s.index('>', m.start()) + 1]


def main():
    page = sys.argv[1] if len(sys.argv) > 1 else 'pricing.html'
    pg_id = sys.argv[2] if len(sys.argv) > 2 else 'pg-pricing'
    out_file = os.path.join(ROOT, sys.argv[3] if len(sys.argv) > 3 else 'tools/pricing-hero.json')
    html = rendered(page)
    m = re.search(r'<body[^>]*class="([^"]*)"', html)
    body_cls = m.group(1) if m else ''
    a = html.index('id="%s"' % pg_id)
    pg_tag = html[html.rindex('<', 0, a):html.index('>', a) + 1]
    pg_cls = re.search(r'class="([^"]*)"', pg_tag).group(1)
    hero = section_at(html, html.index('<section class="page-hero', a))
    classes = set(pg_cls.split()) | set(body_cls.split()) | {'page-wrap'}
    for c in re.findall(r'class="([^"]+)"', hero):
        classes.update(c.split())
    ids = {pg_id} | set(re.findall(r'id="([^"]+)"', hero))

    def keep(sel):
        sel = sel.strip()
        if sel in (':root', 'html', ':root,html'):
            return ':host'
        # html / body become the two wrapper divs inside the shadow root
        sel = re.sub(r'^(html|:root)(?=[\s.#:\[>]|$)', '.bm-html', sel)
        sel = re.sub(r'(^|[\s>+~])body(?=[\s.#:\[>]|$)', r'\1.bm-body', sel)
        if any(t not in classes and t not in ('bm-html', 'bm-body') for t in re.findall(r'\.([\w-]+)', sel)):
            return None
        if any(i not in ids for i in re.findall(r'#([\w-]+)', sel)):
            return None
        return sel

    used = set()

    def walk(nodes):
        out = []
        for pre, body in nodes:
            if isinstance(body, list):
                inner = walk(body)
                if inner:
                    out.append((pre, inner))
                continue
            if re.match(r'@(-webkit-)?keyframes', pre):
                out.append((pre, body))
                continue
            if pre.startswith('@'):
                continue
            sels = [x for x in (keep(s) for s in bn.split_selectors(pre)) if x]
            if not sels:
                continue
            # the rebuilt page already zooms <html>; the copy must not zoom again
            body = ';'.join(d for d in body.split(';') if not d.strip().startswith('zoom'))
            out.append((','.join(dict.fromkeys(sels)), body))
            for n in re.findall(r'animation(?:-name)?\s*:\s*([^;]+)', body):
                used.update(re.findall(r'[A-Za-z_][\w-]*', n))
        return out

    base = os.path.join(ROOT, os.path.dirname(unquote(page.split('?')[0].split('#')[0])))
    rules = bn.drop_unused_keyframes(walk(bn.parse(bn.css_in_order(html, base))), used)
    css = bn.minify(bn.emit(rules))
    markup = ('<div class="bm-html"><div class="bm-body %s"><div class="page-wrap"><div id="%s" class="%s">'
              '%s</div></div></div></div>' % (body_cls, pg_id, pg_cls, hero))
    if base != ROOT:
        spec2 = importlib.util.spec_from_file_location('build_home', os.path.join(ROOT, 'tools', 'build-home-0918.py'))
        bh = importlib.util.module_from_spec(spec2)
        spec2.loader.exec_module(bh)
        unknown, dropped = set(), set()
        markup, css = bh.remap_assets(markup, unknown, dropped), bh.remap_assets(css, unknown, dropped)
        if unknown:
            sys.exit('no repo file mapped for: ' + ', '.join(sorted(unknown)))
    if out_file.endswith('.js'):
        # a script that mounts the hero into the element just before its <script> tag
        data = json.dumps({'css': css, 'html': markup}, ensure_ascii=False).replace('</', '<\\/')
        js = ('/* Generated by tools/extract-pricing-hero.py from %s; do not edit by hand. */\n'
              '(function(){var d=%s,s=document.currentScript,h=s&&s.previousElementSibling;if(!h)return;'
              "var r=h.attachShadow({mode:'open'});r.innerHTML='<style>:host{display:block}'+d.css+'</style>'+d.html;"
              "r.querySelectorAll('.rv').forEach(function(e){e.classList.add('in');});})();\n" % (page, data))
        open(out_file, 'w', encoding='utf-8', newline='\n').write(js)
    else:
        json.dump({'css': css, 'html': markup}, open(out_file, 'w', encoding='utf-8'), ensure_ascii=False)
    print('hero %d bytes, css %d bytes -> %s' % (len(hero), len(css), out_file))


if __name__ == '__main__':
    main()
