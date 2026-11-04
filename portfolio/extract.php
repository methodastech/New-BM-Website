<?php
/**
 * Read the cards now on the site into portfolio/data/*.json.
 * Run once to start the project lists, or again after a port from the design export
 * (tools/build-work-1031.py) brings in projects that are not in the lists yet.
 *
 *     php portfolio/extract.php            # report only
 *     php portfolio/extract.php --write
 *
 * The designed covers and mascot pictures are kept as their markup (cover_html, media_html);
 * projects added through the MCP are stored as fields instead.
 */
if (PHP_SAPI !== 'cli') {
    exit;
}
require __DIR__ . '/lib.php';
$root = dirname(__DIR__);
$read = fn($p) => file_get_contents("$root/$p");

function attr(string $tag, string $name): ?string
{
    return preg_match('/\s' . preg_quote($name, '/') . '="([^"]*)"/', $tag, $m) ? bm_unesc($m[1]) : null;
}

function check(string $what, string $made, string $card): void
{
    if ($made === $card) {
        return;
    }
    $i = strspn($made ^ $card, "\0");
    fwrite(STDERR, "$what: the card does not come back the same at $i:\n  site: " . substr($card, max(0, $i - 40), 120)
                 . "\n  made: " . substr($made, max(0, $i - 40), 120) . "\n");
}

function text_of(string $html, string $class): string
{
    if (!preg_match('/<span class="' . $class . '">(.*?)<\/span>/s', $html, $m)) {
        throw new RuntimeException("no $class");
    }
    return bm_unesc($m[1]);
}

function tags_of(string $html): array
{
    [$a, $b] = bm_inner($html, '/<span class="wk6-tags">/');
    preg_match_all('/<span>(.*?)<\/span>/s', substr($html, $a, $b - $a), $t);
    return array_map('bm_unesc', $t[1]);
}

// ---------------------------------------------------------------- Branding
$work = $read('work.html');
[$a, $b] = bm_inner($work, '/<div class="wkgrid wk6-grid" id="wkgrid">/');
$cats = [];
preg_match_all('/<button class="wk-chip[^"]*" data-filter="([a-z0-9-]+)">(<svg.*?<\/svg>)<span class="wk6-fl">(.*?)<\/span>/s', $work, $chips, PREG_SET_ORDER);
foreach ($chips as $c) {
    if ($c[1] !== 'all') {
        $cats[] = ['id' => $c[1], 'label' => bm_unesc($c[3])];
    }
}
$projects = [];
$after = '';
foreach (bm_children(substr($work, $a, $b - $a)) as $card) {
    if (!str_starts_with($card, '<a class="wkcard')) {
        $after .= $card;
        continue;
    }
    $open = substr($card, 0, strpos($card, '>') + 1);
    preg_match('/href="work\/work-([a-z0-9-]+)\.html"/', $open, $slug);
    preg_match('/--ac:(#[0-9A-Fa-f]{6})/', $open, $ac);
    [$ma, $mb] = bm_inner($card, '/<span class="wk6-media">/');
    $p = ['slug' => $slug[1], 'name' => text_of($card, 'wk6-name'), 'category' => attr($open, 'data-cat'), 'sector' => '',
          'line' => text_of($card, 'wk6-line'), 'tags' => tags_of($card), 'accent' => $ac[1],
          'cover_html' => substr($card, $ma, $mb - $ma), 'case' => 'custom'];
    $search = attr($open, 'data-name');
    $head = bm_lower($p['name']) . ' ';
    $tail = ' ' . bm_lower($p['line'] . ' ' . implode(' ', $p['tags']));
    if (str_starts_with($search, $head) && str_ends_with($search, $tail)) {
        $p['sector'] = substr($search, strlen($head), strlen($search) - strlen($head) - strlen($tail));
    } else {
        $page = $read("work/work-{$p['slug']}.html");
        $p['sector'] = preg_match('/<dt>Sector<\/dt><dd>(.*?)<\/dd>/', $page, $s) ? bm_lower(bm_unesc($s[1])) : '';
        $p['search'] = $search;
    }
    check("branding {$p['slug']}", bm_branding_card($p), $card);
    $projects[] = $p;
}

// ---------------------------------------------------------------- Logos
$lg = $read('logo-gallery.html');
[$a, $b] = bm_inner($lg, '/<div class="bmx-lgrid" id="lgGrid">/');
$logos = [];
foreach (bm_children(substr($lg, $a, $b - $a)) as $card) {
    preg_match('/<img[^>]*>/', $card, $img);
    preg_match('/<div class="wktitle">(.*?)<\/div><div class="wkcat">(.*?)<\/div>/s', $card, $t);
    $l = ['name' => bm_unesc(strip_tags($t[1])), 'category' => bm_unesc(strip_tags($t[2])), 'image' => attr($img[0], 'src'), 'alt' => attr($img[0], 'alt'),
          'search' => attr(substr($card, 0, strpos($card, '>') + 1), 'data-q')];
    check("logo {$l['name']}", bm_logo_card($l), $card);
    $logos[] = $l;
}

// ---------------------------------------------------------------- Mascots
$mg = $read('mascot-gallery.html');
[$a, $b] = bm_inner($mg, '/<div class="wk6m-grid">/', bm_pos($mg, 'id="pg-mascot-gallery"'));
$mascots = [];
foreach (bm_children(substr($mg, $a, $b - $a)) as $i => $card) {
    $open = substr($card, 0, strpos($card, '>') + 1);
    preg_match('/wk6m-card--([a-z0-9-]+)/', $open, $key);
    preg_match('/--ac:([^;"]+);--g:([^;"]+)/', $open, $col);
    $ms = bm_pos($card, '<span class="wk6m-media"');
    $m = ['key' => $key[1], 'name' => text_of($card, 'wk6-name'), 'line' => text_of($card, 'wk6-line'), 'tags' => tags_of($card),
          'accent' => $col[1], 'background' => $col[2], 'search' => attr($open, 'data-q'),
          'media_html' => substr($card, $ms, bm_element_end($card, $ms) - $ms)];
    if (($href = attr($open, 'href')) !== null) {
        $m['link'] = $href;
    }
    check("mascot {$m['key']}", bm_mascot_card($m, $i), $card);
    $mascots[] = $m;
}

$data = ['branding' => ['categories' => $cats, 'projects' => $projects, 'after_cards' => $after], 'logos' => ['logos' => $logos], 'mascots' => ['mascots' => $mascots]];

// --only=branding: after a port from the design export, take the designed Branding cards from the page and
// leave the Logo and Mascot lists alone (the team may have changed them through the MCP). Projects the team
// added through the MCP (a template case page) are not in the export, so they keep their place.
$only = null;
foreach ($argv as $a) {
    if (str_starts_with($a, '--only=')) {
        $only = substr($a, 7);
    }
}
if ($only === 'branding' && is_file("$root/" . BM_DATA['branding'])) {
    $was = json_decode(file_get_contents("$root/" . BM_DATA['branding']), true);
    foreach ($was['projects'] as $i => $p) {
        if (is_array($p['case'] ?? null)) {
            array_splice($data['branding']['projects'], min($i, count($data['branding']['projects'])), 0, [$p]);
        }
    }
}

printf("branding %d projects (%d categories), logos %d, mascots %d\n", count($data['branding']['projects']), count($cats), count($logos), count($mascots));
if (in_array('--write', $argv, true)) {
    @mkdir("$root/portfolio/data", 0775, true);
    foreach (BM_DATA as $k => $path) {
        if ($only !== null && $k !== $only) {
            continue;
        }
        file_put_contents("$root/$path", json_encode($data[$k], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
    }
    echo "written\n";
}
