<?php
/**
 * Portfolio renderer: the Branding grid and its case pages, the Logo Gallery and the Mascot Gallery
 * are built from the project lists in portfolio/data/*.json.
 *
 * Every function here works on strings, so the same code serves the local command
 * (portfolio/build.php, reads and writes the repo) and the MCP (mcp/, reads and commits through GitHub).
 *
 *   branding.json  the Branding grid in work.html, its filter counts, the hub count, and the
 *                  "Next project" link at the foot of each case page; projects with a "case" object
 *                  also get their whole case page (work/work-<slug>.html) from the template below
 *   logos.json     the Logo Gallery (logo-gallery.html) and the Logos pane of work.html
 *   mascots.json   the Mascot Gallery (mascot-gallery.html) and the Mascots pane of work.html
 */

// The live site runs PHP 7.4: the PHP 8 helpers this code uses, where they are missing
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $s, string $p): bool { return $p === '' || strncmp($s, $p, strlen($p)) === 0; }
    function str_ends_with(string $s, string $p): bool { return $p === '' || substr($s, -strlen($p)) === $p; }
    function str_contains(string $s, string $p): bool { return $p === '' || strpos($s, $p) !== false; }
}
if (!function_exists('array_is_list')) {
    function array_is_list(array $a): bool { return $a === [] || array_keys($a) === range(0, count($a) - 1); }
}

const BM_DATA = ['branding' => 'portfolio/data/branding.json', 'logos' => 'portfolio/data/logos.json',
                 'mascots' => 'portfolio/data/mascots.json'];
const BM_CASE_SHELL = 'work/work-firmus.html';   // head, nav, footer and scripts for template-built case pages
const BM_NBSP = "\u{00A0}";

// ------------------------------------------------------------------ text

/** Escape as the design export does (Python's html.escape). */
function bm_esc(string $s): string
{
    return str_replace(['&', '<', '>', '"', "'"], ['&amp;', '&lt;', '&gt;', '&quot;', '&#x27;'], $s);
}

/** An image or link address: quotes and ampersands escaped, apostrophes left as the export leaves them. */
function bm_src(string $s): string
{
    return str_replace(['&', '"', '<', '>'], ['&amp;', '&quot;', '&lt;', '&gt;'], $s);
}

function bm_unesc(string $s): string
{
    return html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** Lower case for the search attributes, with the line's non-breaking spaces made plain. */
function bm_lower(string $s): string
{
    return mb_strtolower(str_replace(BM_NBSP, ' ', $s), 'UTF-8');
}

/** Tie the last four words of a card line together, so it never ends on one word alone (the design's rule). */
function bm_tie_tail(string $s): string
{
    $s = trim(preg_replace('/\s+/u', ' ', str_replace(BM_NBSP, ' ', $s)));
    $w = explode(' ', $s);
    if (count($w) < 6) {
        return $s;
    }
    $tail = array_splice($w, -4);
    return implode(' ', $w) . ' ' . implode(BM_NBSP, $tail);
}

function bm_slug(string $s): string
{
    $s = mb_strtolower(trim($s), 'UTF-8');
    $s = preg_replace('/&/', ' and ', $s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

// ------------------------------------------------------------------ HTML regions

/** Offset just past the element that opens at $start (same-name tags counted, as the export writes them). */
function bm_element_end(string $html, int $start): int
{
    if (!preg_match('/<([a-z0-9]+)/A', $html, $m, 0, $start)) {
        throw new RuntimeException('no element at ' . $start);
    }
    $tag = $m[1];
    $depth = 0;
    $re = '/<(\/?)' . $tag . '\b[^>]*>/';
    $pos = $start;
    while (preg_match($re, $html, $t, PREG_OFFSET_CAPTURE, $pos)) {
        $depth += $t[1][0] === '/' ? -1 : 1;
        $pos = $t[0][1] + strlen($t[0][0]);
        if ($depth === 0) {
            return $pos;
        }
    }
    throw new RuntimeException("unbalanced <$tag> from $start");
}

/** [inner start, inner end] of the first element whose opening tag matches $open (a regex), after $from. */
function bm_inner(string $html, string $open, int $from = 0): array
{
    if (!preg_match($open, $html, $m, PREG_OFFSET_CAPTURE, $from)) {
        throw new RuntimeException('region not found: ' . $open);
    }
    $start = $m[0][1];
    $end = bm_element_end($html, $start);
    $innerStart = strpos($html, '>', $start) + 1;
    $innerEnd = strrpos(substr($html, 0, $end), '</');
    return [$innerStart, $innerEnd];
}

function bm_replace_inner(string $html, string $open, string $inner, int $from = 0): string
{
    [$a, $b] = bm_inner($html, $open, $from);
    return substr($html, 0, $a) . $inner . substr($html, $b);
}

function bm_pos(string $html, string $needle): int
{
    $p = strpos($html, $needle);
    if ($p === false) {
        throw new RuntimeException('not found: ' . $needle);
    }
    return $p;
}

/** The children of a container as a list of element strings (the cards). */
function bm_children(string $inner): array
{
    $out = [];
    $pos = 0;
    while (preg_match('/<[a-z]/', $inner, $m, PREG_OFFSET_CAPTURE, $pos)) {
        $s = $m[0][1];
        $e = bm_element_end($inner, $s);
        $out[] = substr($inner, $s, $e - $s);
        $pos = $e;
    }
    return $out;
}

// ------------------------------------------------------------------ Branding cards

/** The inside of a card's picture: the stored markup of the designed covers, or a cover built from an image. */
function bm_cover(array $p): string
{
    if (isset($p['cover_html'])) {
        return $p['cover_html'];
    }
    $c = $p['cover'];
    $bg = bm_esc($c['background'] ?? $p['accent']);
    $logo = !empty($c['logo']);
    $s = '<span class="wk6-cover" style="--g:' . $bg . ';--veil:' . ($logo ? '0.32' : '0') . ';--lw:' . bm_esc($c['logo_width'] ?? '34%') . '">'
       . '<img class="wk6-cover-bg" src="' . bm_src($c['image']) . '" alt="' . bm_esc($c['alt'] ?? $p['name']) . '" loading="lazy" decoding="async" style="object-position:' . bm_esc($c['position'] ?? '50% 50%') . '">';
    if ($logo) {
        $s .= '<img class="wk6-cover-logo" src="' . bm_src($c['logo']) . '" alt="' . bm_esc($p['name']) . ' logo" loading="lazy" decoding="async">';
    }
    return $s . '</span>';
}

function bm_branding_search(array $p): string
{
    if (isset($p['search'])) {
        return $p['search'];
    }
    return bm_lower(implode(' ', [$p['name'], $p['sector'], $p['line'], implode(' ', $p['tags'])]));
}

function bm_tags(array $tags): string
{
    return '<span class="wk6-tags">' . implode('', array_map(fn($t) => '<span>' . bm_esc($t) . '</span>', $tags)) . '</span>';
}

function bm_branding_card(array $p): string
{
    return '<a class="wkcard wk6 rv" href="work/work-' . bm_esc($p['slug']) . '.html" data-cat="' . bm_esc($p['category'])
         . '" data-name="' . bm_esc(bm_branding_search($p)) . '" style="--ac:' . bm_esc($p['accent']) . '">'
         . '<span class="wk6-media">' . bm_cover($p) . '</span>'
         . '<span class="wk6-cap"><span class="wk6-name">' . bm_esc($p['name']) . '</span><span class="wk6-line">' . bm_esc($p['line'])
         . '</span>' . bm_tags($p['tags']) . '</span></a>';
}

// ------------------------------------------------------------------ Logo and Mascot cards

/** A logo card's name or category: the ampersand gets its own span, set in the display face. */
function bm_amp(string $s): string
{
    return str_replace('&amp;', '<span class="amp">&amp;</span>', bm_esc($s));
}

function bm_logo_card(array $l): string
{
    $q = $l['search'] ?? bm_lower(trim($l['name'] . ' ' . $l['category'] . ' ' . ($l['keywords'] ?? '') . ' logo mark'));
    $q = preg_replace('/\s+/', ' ', $q);
    return '<div class="bmx-lcard rv" data-q="' . bm_esc($q) . '"><div class="bmx-lthumb"><img src="' . bm_src($l['image'])
         . '" alt="' . bm_esc($l['alt'] ?? ($l['name'] . ' logo')) . '" loading="lazy" decoding="async"></div><div class="wktitle">'
         . bm_amp($l['name']) . '</div><div class="wkcat">' . bm_amp($l['category']) . '</div></div>';
}

function bm_mascot_card(array $m, int $i): string
{
    $q = $m['search'] ?? bm_lower(implode(' ', [$m['name'], $m['line'], implode(' ', $m['tags']), 'mascot character']));
    $tag = empty($m['link']) ? 'div' : 'a';
    $href = empty($m['link']) ? '' : ' href="' . bm_esc($m['link']) . '"';
    if (isset($m['media_html'])) {
        $media = $m['media_html'];
    } else {   // a cut-out character, floating over its colour
        $d = '-' . number_format(0.9 * ($i + 1), 1) . 's';
        $media = '<span class="wk6m-media"><span class="wk6m-fig wk6m-fig--h" style="--d:' . $d . ';--h:' . bm_esc((string)($m['size'] ?? 0.62)) . '">'
               . '<img src="' . bm_src($m['image']) . '" alt="' . bm_esc($m['name']) . ' mascot" loading="lazy" decoding="async"></span>'
               . '<span class="wk6m-shadow" style="--d:' . $d . '"></span></span>';
    }
    return '<' . $tag . ' class="wk6m-card wk6m-card--' . bm_esc($m['key']) . ' bmx-lcard rv"' . $href . ' data-q="' . bm_esc($q)
         . '" style="--ac:' . bm_esc($m['accent']) . ';--g:' . bm_esc($m['background']) . '">' . $media
         . '<span class="wk6-name">' . bm_esc($m['name']) . '</span><span class="wk6-line">' . bm_esc($m['line']) . '</span>'
         . bm_tags($m['tags']) . '</' . $tag . '>';
}

// ------------------------------------------------------------------ case pages

function bm_rgb(string $hex): array
{
    $h = ltrim($hex, '#');
    return [hexdec(substr($h, 0, 2)), hexdec(substr($h, 2, 2)), hexdec(substr($h, 4, 2))];
}

function bm_is_light(string $hex): bool
{
    [$r, $g, $b] = bm_rgb($hex);
    return (0.2126 * $r + 0.7152 * $g + 0.0722 * $b) / 255 > 0.6;
}

function bm_fig_img(array $img, string $loading = ' loading="lazy"'): string
{
    return '<img src="' . bm_src($img['src']) . '" alt="' . bm_esc($img['alt'] ?? '') . '"' . $loading . ' decoding="async">';
}

/** One block of a case page's body. */
function bm_case_block(array $b, string $name): string
{
    switch ($b['type']) {
        case 'image':
            return '<figure class="wk6-fig wk6-fig--full rv">' . bm_fig_img($b) . '</figure>';
        case 'pair':   // two (or three) pictures side by side, all at one ratio
            $r = number_format((float)($b['ratio'] ?? 0.8), 4, '.', '');
            $n = count($b['images']);
            $cols = implode(' ', array_fill(0, $n, "minmax(0,{$r}fr)"));
            $s = '<div class="wk6-row wk6-row--' . $n . ' wk6-row--fit" style="grid-template-columns:' . $cols . '">';
            foreach ($b['images'] as $img) {
                $s .= '<figure style="aspect-ratio:' . $r . '" class="wk6-fig rv">' . bm_fig_img($img) . '</figure>';
            }
            return $s . '</div>';
        case 'film':
            return '<figure class="wk6-fig wk6-fig--full wk6-film rv"><video autoplay muted loop playsinline preload="metadata"'
                 . (empty($b['poster']) ? '' : ' poster="' . bm_src($b['poster']) . '"') . ' aria-label="' . bm_esc($b['alt'] ?? $name) . '">'
                 . '<source src="' . bm_src($b['src']) . '" type="video/mp4"></video></figure>';
        case 'note':
            return '<p class="wk6-note' . (($b['side'] ?? 'left') === 'right' ? ' wk6-note--r' : '') . ' rv">' . bm_esc(bm_tie_tail($b['text'])) . '</p>';
        case 'palette':
            $s = '<div class="wk6-pal rv"><h2 class="wk6-pal-h">' . bm_esc($b['title'] ?? ('The colours of ' . $name)) . '</h2><div class="wk6-pal-row" style="--n:' . count($b['colours']) . '">';
            foreach ($b['colours'] as $c) {
                $c = strtoupper($c);
                [$r, $g, $bl] = bm_rgb($c);
                $light = bm_is_light($c);
                $s .= '<span class="wk6-sw' . ($light && $c === '#FFFFFF' ? ' is-light' : '') . '" style="--c:' . $c . ';color:' . ($light ? '#111' : '#fff') . '"><b>' . $c . '</b><i>RGB ' . "$r $g $bl" . '</i></span>';
            }
            return $s . '</div></div>';
    }
    throw new InvalidArgumentException('unknown block type: ' . ($b['type'] ?? ''));
}

/** The "Next project" panel: the next card's name, line and cover. */
function bm_next_block(string $nextGo, array $n): string
{
    return '<section class="wk6-next"><div class="section-inner"><a class="wk6-next-a rv" href="work/work-' . bm_esc($n['slug']) . '.html" style="--ac:' . bm_esc($n['accent']) . '">'
         . '<span class="wk6-next-t"><span class="wk6-next-k">Next project</span><span class="wk6-next-n">' . bm_esc($n['name']) . '</span>'
         . '<span class="wk6-next-l">' . bm_esc($n['line']) . '</span>' . $nextGo . '</span><span class="wk6-next-pic">' . bm_cover($n) . '</span></a></div></section>';
}

function bm_case_section(array $p, string $back, string $nextBlock, string $cta): string
{
    $c = $p['case'];
    $hero = $c['hero'];
    $ratio = number_format((float)($hero['ratio'] ?? 1.7778), 4, '.', '');
    $facts = '<div><dt>Client</dt><dd>' . bm_esc($c['client'] ?? $p['name']) . '</dd></div><div><dt>Sector</dt><dd>' . bm_esc($c['sector'] ?? ucfirst($p['sector'])) . '</dd></div>'
           . '<div class="wk6-facts-scope"><dt>What we made</dt><dd>' . bm_tags($c['scope'] ?? $p['tags']) . '</dd></div>';
    if (!empty($c['colours'])) {
        $facts .= '<div><dt>Colours</dt><dd class="wk6-mini">' . implode('', array_map(fn($x) => '<i style="background:' . bm_esc(strtoupper($x)) . '"></i>', $c['colours'])) . '</dd></div>';
    }
    $body = empty($c['statement']) ? '' : '<p class="wk6-stmt rv">' . bm_esc(bm_tie_tail($c['statement'])) . '</p>';
    foreach ($c['blocks'] ?? [] as $b) {
        $body .= bm_case_block($b, $p['name']);
    }
    return '<section class="pg bmx-detail wk6-case" id="pg-case-' . bm_esc($p['slug']) . '" style="--ac:' . bm_esc($p['accent']) . '">'
         . '<section class="wk6-chead"><div class="section-inner">' . $back . '<h1 class="wk6-ctitle rv">' . bm_esc($p['name']) . '</h1>'
         . '<p class="wk6-clede rv">' . bm_esc($c['lede'] ?? $p['line']) . '</p></div></section>'
         . '<section class="wk6-chero"><div class="section-inner"><div class="wk6-hero-pic rv" style="aspect-ratio:' . $ratio . '">'
         . '<img src="' . bm_src($hero['src']) . '" alt="' . bm_esc($hero['alt'] ?? $p['name']) . '" decoding="async" style="object-position:50% 50%"></div></div></section>'
         . '<div class="wk6-about"><button class="wk6-about-b" type="button" aria-expanded="false"><span>About the project</span><i aria-hidden="true">+</i></button>'
         . '<dl class="wk6-facts">' . $facts . '</dl></div>'
         . '<section class="wk6-cbody"><div class="section-inner">' . $body . '</div></section>'
         . $nextBlock . $cta . '</section>';
}

/** A whole case page: the shell page (head, nav, footer, scripts) around the project's section. */
function bm_case_page(string $shell, array $p, string $nextBlock): string
{
    $sm = [];
    if (!preg_match('/<section class="pg bmx-detail wk6-case" id="pg-(case-[a-z0-9-]+)"/', $shell, $sm, PREG_OFFSET_CAPTURE)) {
        throw new RuntimeException('case shell has no case section');
    }
    $oldId = $sm[1][0];
    $a = $sm[0][1];
    $b = bm_element_end($shell, $a);
    $old = substr($shell, $a, $b - $a);
    preg_match('/<a class="bmx-back rv" href="work\.html">.*?<\/a>/s', $old, $back);
    $cta = substr($old, bm_pos($old, '<section class="cta-band">'));
    $cta = substr($cta, 0, bm_element_end($cta, 0));
    $s = substr($shell, 0, $a) . bm_case_section($p, $back[0], $nextBlock, $cta) . substr($shell, $b);

    $id = 'case-' . $p['slug'];
    $s = str_replace(['var _start="' . $oldId . '";', 'SELF="' . $oldId . '";'], ['var _start="' . $id . '";', 'SELF="' . $id . '";'], $s);
    $title = bm_esc($p['name'] . ' | Brand Method Work');
    $desc = bm_esc($p['case']['description'] ?? ('A Brand Method portfolio showcase for ' . $p['name'] . '.'));
    $url = 'https://brandmethod.co/work/work-' . $p['slug'] . '.html';
    $s = preg_replace('/<title>.*?<\/title>/s', '<title>' . $title . '</title>', $s, 1);
    foreach (['name="description"', 'property="og:description"', 'name="twitter:description"'] as $k) {
        $s = preg_replace('/(<meta ' . preg_quote($k, '/') . ' content=")[^"]*/', '${1}' . $desc, $s, 1);
    }
    foreach (['property="og:title"', 'name="twitter:title"'] as $k) {
        $s = preg_replace('/(<meta ' . preg_quote($k, '/') . ' content=")[^"]*/', '${1}' . $title, $s, 1);
    }
    $s = preg_replace('/(<link rel="canonical" href=")[^"]*/', '${1}' . $url, $s, 1);
    $s = preg_replace('/(<meta property="og:url" content=")[^"]*/', '${1}' . $url, $s, 1);
    $img = 'https://brandmethod.co/' . $p['case']['hero']['src'];
    foreach (['property="og:image"', 'name="twitter:image"'] as $k) {
        $s = preg_replace('/(<meta ' . preg_quote($k, '/') . ' content=")[^"]*/', '${1}' . $img, $s, 1);
    }
    return $s;
}

// ------------------------------------------------------------------ the whole build

/** The files the portfolio touches, before the case pages: read these, pass them to bm_render(). */
function bm_base_files(): array
{
    return ['work.html', 'logo-gallery.html', 'mascot-gallery.html', 'js/layout.js', BM_CASE_SHELL];
}

/** Case pages bm_render() needs to read (it rewrites their "Next project" panel). */
function bm_case_files(array $branding): array
{
    return array_map(fn($p) => 'work/work-' . $p['slug'] . '.html', $branding['projects']);
}

/**
 * Render everything from the data.
 * $files: path => current content for bm_base_files() and the case pages (missing pages are created from the template).
 * Returns path => new content, for the files that changed.
 */
function bm_render(array $data, array $files, ?array $only = null): array
{
    $out = [];
    $br = $data['branding'];
    $projects = $br['projects'];
    $logos = $data['logos']['logos'];
    $mascots = $data['mascots']['mascots'];

    // work.html: the Branding grid, its filter counts and the hub's three counts
    $w = $files['work.html'];
    // the grid ends with its "More of the work" tile, kept as designed but for the logo count
    $more = preg_replace('/(<span class="wk6-more-c">)\d+( marks<\/span>)/', '${1}' . count($logos) . '${2}', $br['after_cards'] ?? '');
    $grid = implode('', array_map('bm_branding_card', $projects)) . $more;
    $w = bm_replace_inner($w, '/<div class="wkgrid wk6-grid" id="wkgrid">/', $grid);
    $count = ['all' => count($projects)];
    foreach ($projects as $p) {
        $count[$p['category']] = ($count[$p['category']] ?? 0) + 1;
    }
    $w = preg_replace_callback('/(<button class="wk-chip[^"]*" data-filter="([a-z0-9-]+)">.*?<span class="wk6-fn">)\d+(<\/span>)/s',
        fn($m) => $m[1] . ($count[$m[2]] ?? 0) . $m[3], $w);
    $w = preg_replace('/(data-pane="branding" aria-controls="bmxPane-branding".*?<span class="bmx-pc">)\d+( case studies<\/span>)/s', '${1}' . count($projects) . '${2}', $w, 1);
    $w = preg_replace('/(data-pane="logos" aria-controls="bmxPane-logos".*?<span class="bmx-pc">)\d+( marks<\/span>)/s', '${1}' . count($logos) . '${2}', $w, 1);
    $w = preg_replace('/(data-pane="mascots" aria-controls="bmxPane-mascots".*?<span class="bmx-pc">)\d+( [a-z ]+<\/span>)/s', '${1}' . count($mascots) . '${2}', $w, 1);
    $logoCards = implode('', array_map('bm_logo_card', $logos));
    $mascotCards = implode('', array_map('bm_mascot_card', $mascots, array_keys($mascots)));
    $w = bm_replace_inner($w, '/<div class="bmx-lgrid bmx-lgrid--pane">/', $logoCards, bm_pos($w, 'id="bmxPane-logos"'));
    $w = bm_replace_inner($w, '/<div class="wk6m-grid">/', $mascotCards, bm_pos($w, 'id="bmxPane-mascots"'));
    $out['work.html'] = $w;

    // the two galleries
    $l = bm_replace_inner($files['logo-gallery.html'], '/<div class="bmx-lgrid" id="lgGrid">/', $logoCards);
    $out['logo-gallery.html'] = preg_replace('/(<p class="ph-lead rv">[^<]*?)\d+( marks)/', '${1}' . count($logos) . '${2}', $l, 1);
    $out['mascot-gallery.html'] = bm_replace_inner($files['mascot-gallery.html'], '/<div class="wk6m-grid">/', $mascotCards, bm_pos($files['mascot-gallery.html'], 'id="pg-mascot-gallery"'));

    // the menu's counts, which js/layout.js also writes into every page's baked-in menu
    $js = $files['js/layout.js'];
    $counts = 'var BM_COUNTS = ' . json_encode(['branding' => count($projects), 'logos' => count($logos)]) . ';';
    $js = preg_replace('/var BM_COUNTS = \{[^}]*\};/', $counts, $js, 1);
    $js = preg_replace('/\d+( brand builds, strategy to launch)/', count($projects) . '$1', $js);
    $out['js/layout.js'] = preg_replace('/\d+( marks, symbols and identity explorations)/', count($logos) . '$1', $js);

    // case pages: the "Next project" panel follows the grid order, and template projects get their whole page
    preg_match('/<span class="wk6-next-go">.*?<\/span>/s', $files[BM_CASE_SHELL], $go);
    $n = count($projects);
    foreach ($projects as $i => $p) {
        $path = 'work/work-' . $p['slug'] . '.html';
        $next = bm_next_block($go[0], $projects[($i + 1) % $n]);
        if (isset($p['case']) && is_array($p['case'])) {
            $out[$path] = bm_case_page($files[BM_CASE_SHELL], $p, $next);
            continue;
        }
        if ($only !== null && !in_array($path, $only, true)) {
            continue;
        }
        if (!isset($files[$path])) {
            throw new RuntimeException("$path is missing and {$p['slug']} has no case template");
        }
        $page = $files[$path];
        $a = bm_pos($page, '<section class="wk6-next">');
        $out[$path] = substr($page, 0, $a) . $next . substr($page, bm_element_end($page, $a));
    }

    return array_filter($out, fn($s, $k) => !isset($files[$k]) || $files[$k] !== $s, ARRAY_FILTER_USE_BOTH);
}

/**
 * The designed case pages whose "Next project" panel an edit changes: the panel shows the next card,
 * so a page is touched when its next card, or that card's name, line, colour or cover, is different.
 */
function bm_affected_cases(array $old, array $new): array
{
    $next = function (array $ps): array {
        $n = count($ps);
        $m = [];
        foreach ($ps as $i => $p) {
            $q = $ps[($i + 1) % $n];
            $m[$p['slug']] = json_encode([$q['slug'], $q['name'], $q['line'], $q['accent'], bm_cover($q)]);
        }
        return $m;
    };
    $a = $next($old['projects']);
    $b = $next($new['projects']);
    $out = [];
    foreach ($new['projects'] as $p) {
        if (!is_array($p['case'] ?? null) && ($a[$p['slug']] ?? null) !== $b[$p['slug']]) {
            $out[] = 'work/work-' . $p['slug'] . '.html';
        }
    }
    return $out;
}

/** The Work menu's counts in a page's baked-in copy of the menu (js/layout.js also corrects them as a page loads). */
function bm_menu_counts(string $html, array $data): string
{
    $html = preg_replace('/\d+( brand builds, strategy to launch)/', count($data['branding']['projects']) . '$1', $html);
    return preg_replace('/\d+( marks, symbols and identity explorations)/', count($data['logos']['logos']) . '$1', $html);
}

/** Check a project list before it is saved; returns a list of problems. */
function bm_validate(array $data): array
{
    $errors = [];
    $cats = array_column($data['branding']['categories'], 'id');
    $seen = [];
    foreach ($data['branding']['projects'] as $p) {
        foreach (['slug', 'name', 'category', 'sector', 'line', 'accent'] as $k) {
            if (!isset($p[$k]) || $p[$k] === '') {
                $errors[] = "branding {$p['name']}: $k is missing";
            }
        }
        if (!in_array($p['category'] ?? '', $cats, true)) {
            $errors[] = "branding {$p['name']}: category must be one of " . implode(', ', $cats);
        }
        if (isset($seen[$p['slug']])) {
            $errors[] = "branding: two projects use the slug {$p['slug']}";
        }
        $seen[$p['slug']] = 1;
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $p['accent'] ?? '')) {
            $errors[] = "branding {$p['name']}: accent must be a colour like #2536F5";
        }
        if (!isset($p['cover_html']) && empty($p['cover']['image'])) {
            $errors[] = "branding {$p['name']}: a cover image is needed";
        }
        if (isset($p['case']) && is_array($p['case']) && empty($p['case']['hero']['src'])) {
            $errors[] = "branding {$p['name']}: the case page needs a hero image";
        }
    }
    foreach ($data['logos']['logos'] as $l) {
        if (empty($l['name']) || empty($l['image']) || empty($l['category'])) {
            $errors[] = 'logos ' . ($l['name'] ?? '?') . ': name, category and image are needed';
        }
    }
    foreach ($data['mascots']['mascots'] as $m) {
        if (empty($m['name']) || empty($m['key']) || (!isset($m['media_html']) && empty($m['image']))) {
            $errors[] = 'mascots ' . ($m['name'] ?? '?') . ': name and image are needed';
        }
    }
    return $errors;
}
