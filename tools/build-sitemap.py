"""Build sitemap.xml: every public page of brandmethod.co (16 Nov 2026).

Listed: the main pages, the 5 service pages, every blog post, case study, logo page and mascot page, and the sales pages.
Left out on purpose: thank-you / success / cancelled pages, forwarders, drafts, games, the client demo builds in website/
(copies of clients' own sites; listing them would compete with the client's real site in search) and hidden pages
such as 3d-gallery.html. A page marked noindex is never listed. Run after adding or removing a page:

    python tools/build-sitemap.py
"""
import datetime
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://brandmethod.co/'

# (path, priority, how often it changes); folders are globbed below
MAIN = [
    ('index.html', '1.0', 'weekly'),
    ('services.html', '0.9', 'monthly'), ('pricing.html', '0.9', 'monthly'),
    ('work.html', '0.9', 'weekly'), ('portfolio.html', '0.9', 'weekly'),
    ('about.html', '0.8', 'monthly'), ('contact.html', '0.8', 'monthly'), ('culture.html', '0.7', 'monthly'),
    ('logo-gallery.html', '0.8', 'monthly'), ('mascot-gallery.html', '0.8', 'monthly'),
    ('resources.html', '0.7', 'weekly'), ('archive.html', '0.5', 'yearly'),
    ('quickhook-website/index.html', '0.8', 'monthly'), ('premium-website/index.html', '0.8', 'monthly'),
    ('nobodywantsawebsite/index.html', '0.6', 'monthly'),
    ('privacy-policy.html', '0.3', 'yearly'), ('terms-of-service.html', '0.3', 'yearly'),
]
FOLDERS = [('services', '0.8', 'monthly'), ('work', '0.7', 'monthly'), ('blog', '0.6', 'yearly'),
           ('logo-page', '0.5', 'yearly'), ('mascot-page', '0.5', 'yearly')]


def lastmod(rel):
    """The day the page last changed: today if it has unsaved changes, else its last commit."""
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if not dirty:
        d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        if d:
            return d
    return datetime.date.today().isoformat()


def url_of(rel):
    if rel == 'index.html':
        return SITE
    return SITE + (rel[:-len('index.html')] if rel.endswith('/index.html') else rel)


def main():
    pages = list(MAIN)
    for folder, pri, freq in FOLDERS:
        for f in sorted(os.listdir(os.path.join(ROOT, folder))):
            if f.endswith('.html'):
                pages.append(('%s/%s' % (folder, f), pri, freq))
    rows = []
    for rel, pri, freq in pages:
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p):
            raise SystemExit('missing page: ' + rel)
        s = open(p, encoding='utf-8', errors='ignore').read()
        head = s[:s.find('</head>')]
        if re.search(r'<meta[^>]+name="robots"[^>]+noindex', head, re.I):
            raise SystemExit('%s is marked noindex: remove the tag or take it out of this list' % rel)
        if not re.search(r'<meta\s+name="description"\s+content="[^"]{50,}', head):
            raise SystemExit('%s has no proper meta description' % rel)
        rows.append('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>'
                    % (url_of(rel), lastmod(rel), freq, pri))
    out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % '\n'.join(rows)
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write(out)
    print('sitemap.xml: %d pages' % len(rows))


if __name__ == '__main__':
    main()
