<?php
/**
 * The portfolio tools the branding team uses through Claude: list, add, edit, move and remove
 * projects in the Branding grid (with case pages), the Logo Gallery and the Mascot Gallery.
 */
require_once __DIR__ . '/../portfolio/lib.php';
require_once __DIR__ . '/store.php';
require_once __DIR__ . '/images.php';

const BM_GALLERIES = ['branding', 'logos', 'mascots'];

// ------------------------------------------------------------------ tool list

function bm_tools(): array
{
    $gallery = ['type' => 'string', 'enum' => BM_GALLERIES, 'description' => 'branding (the Branding grid on the Work page), logos (Logo Gallery) or mascots (Mascot Gallery)'];
    $id = ['type' => 'string', 'description' => 'The project id, as list_projects shows it'];
    $pos = ['type' => 'integer', 'minimum' => 1, 'description' => 'Place in the grid, 1 = first. Leave out to put it first.'];
    $img = fn($what) => ['type' => 'string', 'description' => "$what: an upload code from the upload page (e.g. u3f9a0c1d), a public link (Google Drive share links work), or a path already on the site"];
    $colour = fn($what) => ['type' => 'string', 'pattern' => '^#[0-9A-Fa-f]{6}$', 'description' => "$what, like #2536F5"];
    $tags = ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Two or three short labels, e.g. ["Brand Identity", "Packaging"]'];
    $block = ['type' => 'object', 'required' => ['type'], 'properties' => [
        'type' => ['type' => 'string', 'enum' => ['image', 'pair', 'film', 'note', 'palette'],
                   'description' => 'image: one full-width picture. pair: two or three pictures side by side. film: a looping video. note: a short paragraph between pictures. palette: the brand colours as swatches.'],
        'image' => $img('image: the picture'),
        'alt' => ['type' => 'string', 'description' => 'image or film: what the picture shows, for screen readers'],
        'images' => ['type' => 'array', 'items' => ['type' => 'object', 'required' => ['image'], 'properties' => ['image' => $img('The picture'), 'alt' => ['type' => 'string']]],
                     'description' => 'pair: the pictures, left to right'],
        'ratio' => ['type' => 'number', 'description' => 'pair: width / height of the pictures, e.g. 0.8 for portrait 4:5, 1.7778 for 16:9. Leave out to take it from the first picture.'],
        'video' => ['type' => 'string', 'description' => 'film: the MP4 (upload code, link or site path)'],
        'poster' => $img('film: a still shown while the film loads'),
        'text' => ['type' => 'string', 'description' => 'note: the paragraph'],
        'side' => ['type' => 'string', 'enum' => ['left', 'right'], 'description' => 'note: which side it sits on'],
        'colours' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'palette: the colours, like ["#AE091C", "#010101"]'],
        'title' => ['type' => 'string', 'description' => 'palette: the heading (default: The colours of <name>)'],
    ]];
    $case = ['type' => 'object', 'required' => ['hero_image'], 'description' => 'The case page that opens from the card', 'properties' => [
        'hero_image' => $img('The big picture at the top of the page'),
        'hero_alt' => ['type' => 'string'],
        'lede' => ['type' => 'string', 'description' => 'The line under the title (default: the card line)'],
        'client' => ['type' => 'string', 'description' => 'For About the project (default: the name)'],
        'scope' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'What we made, e.g. ["Brand Identity", "Logo System", "Packaging"] (default: the tags)'],
        'colours' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'The brand colours for About the project'],
        'statement' => ['type' => 'string', 'description' => 'The opening paragraph of the story'],
        'blocks' => ['type' => 'array', 'items' => $block, 'description' => 'The rest of the page, top to bottom'],
        'description' => ['type' => 'string', 'description' => 'The page description for Google (default: A Brand Method portfolio showcase for <name>.)'],
    ]];
    $brandingFields = [
        'name' => ['type' => 'string', 'description' => 'The project name on the card'],
        'category' => ['type' => 'string', 'description' => 'The filter it sits under: one of the category ids list_projects(branding) shows'],
        'sector' => ['type' => 'string', 'description' => 'The client\'s industry in a few words, e.g. "food & drink", "cybersecurity"'],
        'line' => ['type' => 'string', 'description' => 'One sentence under the name, about 15 to 25 words'],
        'tags' => $tags,
        'accent' => $colour('The brand colour, used for the name and tags'),
        'cover_image' => $img('The card picture, landscape about 3:2'),
        'cover_alt' => ['type' => 'string', 'description' => 'What the card picture shows'],
        'cover_logo' => $img('Optional: a logo laid over the card picture (transparent PNG)'),
        'cover_background' => $colour('Optional: the colour behind the card picture (default: the accent)'),
    ];
    return [
        ['name' => 'list_projects', 'description' => 'List the projects in one gallery, in grid order, with their ids. For branding it also lists the filter categories.',
         'inputSchema' => ['type' => 'object', 'required' => ['gallery'], 'properties' => ['gallery' => $gallery]]],
        ['name' => 'get_project', 'description' => 'Show everything stored for one project.',
         'inputSchema' => ['type' => 'object', 'required' => ['gallery', 'id'], 'properties' => ['gallery' => $gallery, 'id' => $id]]],
        ['name' => 'get_upload_link', 'description' => 'A link to the upload page, where pictures and films are dropped in. Each file gets a code to give to the other tools. The link works for 24 hours.',
         'inputSchema' => ['type' => 'object', 'properties' => new stdClass()]],
        ['name' => 'add_branding_project', 'description' => 'Add a project to the Branding grid on the Work page, with its own case page. It goes live straight away.',
         'inputSchema' => ['type' => 'object', 'required' => ['name', 'category', 'sector', 'line', 'tags', 'accent', 'cover_image', 'case'],
                           'properties' => $brandingFields + ['position' => $pos, 'case' => $case]]],
        ['name' => 'add_logo', 'description' => 'Add a logo to the Logo Gallery (and the Logos tab of the Work page). It goes live straight away.',
         'inputSchema' => ['type' => 'object', 'required' => ['name', 'category', 'image'], 'properties' => [
             'name' => ['type' => 'string'], 'category' => ['type' => 'string', 'description' => 'The client\'s industry, e.g. "F&B", "Healthcare App"'],
             'image' => $img('The logo picture, landscape 4:3 like the others'), 'alt' => ['type' => 'string'],
             'keywords' => ['type' => 'string', 'description' => 'Extra words the gallery search should find it by'], 'position' => $pos]]],
        ['name' => 'add_mascot', 'description' => 'Add a mascot to the Mascot Gallery (and the Mascots tab of the Work page). It goes live straight away.',
         'inputSchema' => ['type' => 'object', 'required' => ['name', 'line', 'tags', 'accent', 'background', 'image'], 'properties' => [
             'name' => ['type' => 'string'], 'line' => ['type' => 'string', 'description' => 'One sentence about the character'], 'tags' => $tags,
             'accent' => $colour('The colour of the tags'), 'background' => $colour('The card colour behind the character'),
             'image' => $img('The character cut out on a transparent background (PNG or WebP)'),
             'size' => ['type' => 'number', 'description' => 'How much of the card height the character fills, 0.4 to 0.95 (default 0.62)'],
             'link' => ['type' => 'string', 'description' => 'Optional: a page the card opens, e.g. work/work-firmus.html'], 'position' => $pos]]],
        ['name' => 'update_project', 'description' => 'Change some fields of a project: give only what changes. Uses the same field names as the add tools. Branding projects with a designed case page can change their card only; their case page is edited by the web team.',
         'inputSchema' => ['type' => 'object', 'required' => ['gallery', 'id', 'changes'], 'properties' => [
             'gallery' => $gallery, 'id' => $id, 'changes' => ['type' => 'object', 'description' => 'The fields to change, e.g. {"line": "...", "tags": ["..."]}']]]],
        ['name' => 'move_project', 'description' => 'Move a project to another place in its grid.',
         'inputSchema' => ['type' => 'object', 'required' => ['gallery', 'id', 'position'], 'properties' => ['gallery' => $gallery, 'id' => $id, 'position' => $pos]]],
        ['name' => 'remove_project', 'description' => 'Take a project off the site. Ask the person to confirm first.',
         'inputSchema' => ['type' => 'object', 'required' => ['gallery', 'id'], 'properties' => ['gallery' => $gallery, 'id' => $id]]],
    ];
}

// ------------------------------------------------------------------ helpers

function bm_list_key(string $gallery): string
{
    return ['branding' => 'projects', 'logos' => 'logos', 'mascots' => 'mascots'][$gallery];
}

function bm_id_of(string $gallery, array $item): string
{
    if ($gallery === 'branding') {
        return $item['slug'];
    }
    return $gallery === 'logos' ? bm_slug($item['name']) : $item['key'];
}

function bm_find(array $data, string $gallery, string $id): int
{
    foreach ($data[$gallery][bm_list_key($gallery)] as $i => $item) {
        if (bm_id_of($gallery, $item) === $id) {
            return $i;
        }
    }
    throw new InvalidArgumentException("No $gallery project with the id \"$id\". list_projects shows the ids.");
}

function bm_place(array &$list, array $item, ?int $position): int
{
    $at = max(0, min(count($list), ($position ?? 1) - 1));
    array_splice($list, $at, 0, [$item]);
    return $at + 1;
}

function bm_unique(string $slug, callable $taken): string
{
    $s = $slug;
    for ($n = 2; $taken($s); $n++) {
        $s = "$slug-$n";
    }
    return $s;
}

function bm_arg(array $a, string $k, bool $required = true)
{
    if (!isset($a[$k]) || $a[$k] === '' || $a[$k] === []) {
        if ($required) {
            throw new InvalidArgumentException("$k is needed");
        }
        return null;
    }
    return is_string($a[$k]) ? trim($a[$k]) : $a[$k];
}

function bm_load(Store $store): array
{
    $data = [];
    foreach (BM_DATA as $k => $path) {
        $json = $store->read($path);
        if ($json === null) {
            throw new RuntimeException("$path is missing from the site");
        }
        $data[$k] = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    }
    return $data;
}

function bm_json(array $x): string
{
    return json_encode($x, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
}

/** The case page's pictures and blocks, from what a tool was given. */
function bm_case_from_args(array $c, string $slug, array &$changes): array
{
    $dir = "Image/work6/$slug";
    $hero = bm_take(bm_arg($c, 'hero_image'), 'hero', "$dir/hero", $changes);
    $case = ['hero' => ['src' => $hero, 'alt' => $c['hero_alt'] ?? null, 'ratio' => bm_ratio($hero, $changes) ?? 1.7778]];
    foreach (['lede', 'client', 'statement', 'description'] as $k) {
        if (($v = bm_arg($c, $k, false)) !== null) {
            $case[$k] = $v;
        }
    }
    foreach (['scope', 'colours'] as $k) {
        if (($v = bm_arg($c, $k, false)) !== null) {
            $case[$k] = array_values($v);
        }
    }
    $blocks = [];
    foreach ($c['blocks'] ?? [] as $i => $b) {
        $n = $i + 1;
        switch ($b['type'] ?? '') {
            case 'image':
                $blocks[] = ['type' => 'image', 'src' => bm_take(bm_arg($b, 'image'), 'figure', "$dir/fig-$n", $changes), 'alt' => $b['alt'] ?? ''];
                break;
            case 'pair':
                $imgs = [];
                foreach ($b['images'] ?? [] as $j => $im) {
                    $imgs[] = ['src' => bm_take(bm_arg($im, 'image'), 'figure', "$dir/fig-$n-" . ($j + 1), $changes), 'alt' => $im['alt'] ?? ''];
                }
                if (count($imgs) < 2 || count($imgs) > 3) {
                    throw new InvalidArgumentException("block $n: a pair takes two or three pictures");
                }
                $blocks[] = ['type' => 'pair', 'images' => $imgs, 'ratio' => (float)($b['ratio'] ?? bm_ratio($imgs[0]['src'], $changes) ?? 0.8)];
                break;
            case 'film':
                $film = ['type' => 'film', 'src' => bm_take(bm_arg($b, 'video'), 'film', "$dir/film-$n", $changes), 'alt' => $b['alt'] ?? ''];
                if (!empty($b['poster'])) {
                    $film['poster'] = bm_take($b['poster'], 'figure', "$dir/film-$n-poster", $changes);
                }
                $blocks[] = $film;
                break;
            case 'note':
                $blocks[] = ['type' => 'note', 'text' => bm_arg($b, 'text'), 'side' => $b['side'] ?? 'left'];
                break;
            case 'palette':
                $blocks[] = ['type' => 'palette', 'colours' => array_map('strtoupper', bm_arg($b, 'colours')), 'title' => $b['title'] ?? null];
                break;
            default:
                throw new InvalidArgumentException("block $n: type must be image, pair, film, note or palette");
        }
    }
    $case['blocks'] = $blocks;
    return array_filter($case, fn($v) => $v !== null);
}

/** Card fields from a tool's arguments, onto $p. */
function bm_branding_fields(array $a, array $p, array &$changes): array
{
    foreach (['name', 'category', 'accent'] as $k) {
        if (($v = bm_arg($a, $k, false)) !== null) {
            $p[$k] = $k === 'accent' ? strtoupper($v) : $v;
        }
    }
    if (($v = bm_arg($a, 'sector', false)) !== null) {
        $p['sector'] = mb_strtolower($v, 'UTF-8');
    }
    if (($v = bm_arg($a, 'line', false)) !== null) {
        $p['line'] = bm_tie_tail($v);
    }
    if (($v = bm_arg($a, 'tags', false)) !== null) {
        $p['tags'] = array_values($v);
    }
    unset($p['search']);   // the search words follow the new text
    $cover = isset($p['cover_html']) ? null : ($p['cover'] ?? []);
    if (($v = bm_arg($a, 'cover_image', false)) !== null) {
        $cover = ['image' => bm_take($v, 'cover', "Image/work6/{$p['slug']}/cover", $changes)];
    }
    if ($cover !== null) {
        if (($v = bm_arg($a, 'cover_logo', false)) !== null) {
            $cover['logo'] = bm_take($v, 'logo', "Image/work6/{$p['slug']}/cover-logo", $changes);
        }
        foreach (['cover_alt' => 'alt', 'cover_background' => 'background'] as $k => $f) {
            if (($v = bm_arg($a, $k, false)) !== null) {
                $cover[$f] = $v;
            }
        }
        unset($p['cover_html']);
        $p['cover'] = $cover;
    } elseif (bm_arg($a, 'cover_logo', false) !== null || bm_arg($a, 'cover_background', false) !== null) {
        throw new InvalidArgumentException('This card has a designed cover: give a new cover_image to replace it, with the logo or background.');
    }
    return $p;
}

// ------------------------------------------------------------------ one edit

/**
 * Run one edit: read the lists, let $change alter them (it returns what to tell the person),
 * rebuild the pages, and commit it all at once. A clash with someone else's edit starts it over.
 */
function bm_edit(Store $store, array $cfg, callable $change): string
{
    for ($attempt = 1; ; $attempt++) {
        $data = bm_load($store);
        $old = $data;
        $changes = [];
        [$summary, $message] = $change($data, $changes);
        if ($errors = bm_validate($data)) {
            throw new InvalidArgumentException(implode("\n", $errors));
        }
        // a site path given for a picture must be a file that is there
        $re = '~"((?:Image|work-images|video)/[^"]+\.(?:webp|png|jpe?g|gif|mp4|webm))"~i';
        preg_match_all($re, json_encode($old, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $was);
        preg_match_all($re, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $now);
        foreach (array_diff(array_unique($now[1]), $was[1]) as $path) {
            if (!array_key_exists($path, $changes) && $store->read($path) === null) {
                throw new InvalidArgumentException("There is no file at $path on the site. Upload the picture instead.");
            }
        }
        $files = [];
        foreach (bm_base_files() as $path) {
            $files[$path] = $store->read($path);
            if ($files[$path] === null) {
                throw new RuntimeException("$path is missing from the site");
            }
        }
        $affected = bm_affected_cases($old['branding'], $data['branding']);
        $templated = array_map(fn($p) => "work/work-{$p['slug']}.html", array_filter($data['branding']['projects'], fn($p) => is_array($p['case'] ?? null)));
        foreach (array_merge($affected, $templated) as $path) {
            if (($s = $store->read($path)) !== null) {
                $files[$path] = $s;
            }
        }
        $pages = bm_render($data, $files, $affected);
        foreach (BM_DATA as $k => $path) {
            if ($data[$k] !== $old[$k]) {
                $changes[$path] = bm_json($data[$k]);
            }
        }
        $changes = $pages + $changes;
        try {
            $where = $store->commit($changes, $message . "\n\nSaved through the portfolio MCP.");
            break;
        } catch (ConflictException $e) {
            if ($attempt >= 3 || !method_exists($store, 'refresh')) {
                throw new RuntimeException('Someone else is saving changes right now. Try again in a minute.');
            }
            $store->refresh();
        }
    }
    $pull = $cfg['mode'] === 'github' ? (cloudways_pull($cfg['cloudways'] ?? null) ?? 'Press Pull in Cloudways (Deployment via Git) to put it on the site.') : '';
    return trim("$summary\n\nSaved: $where\n$pull");
}

// ------------------------------------------------------------------ the tools

function bm_call(string $name, array $a, Store $store, array $cfg): string
{
    $site = rtrim($cfg['site_url'], '/') . '/';
    switch ($name) {
        case 'list_projects':
            $g = bm_arg($a, 'gallery');
            $data = bm_load($store);
            $lines = [];
            foreach ($data[$g][bm_list_key($g)] as $i => $p) {
                if ($g === 'branding') {
                    $about = " ({$p['category']}, {$p['sector']})" . (is_array($p['case'] ?? null) ? ' [template case page]' : ' [designed case page]');
                } else {
                    $about = $g === 'logos' ? " ({$p['category']})" : ' — ' . implode(', ', $p['tags']);
                }
                $lines[] = ($i + 1) . '. ' . bm_id_of($g, $p) . ' — ' . $p['name'] . $about;
            }
            if ($g === 'branding') {
                $lines[] = "\nCategories: " . implode(', ', array_map(fn($c) => "{$c['id']} ({$c['label']})", $data['branding']['categories']));
            }
            return implode("\n", $lines);

        case 'get_project':
            $g = bm_arg($a, 'gallery');
            $data = bm_load($store);
            $p = $data[$g][bm_list_key($g)][bm_find($data, $g, bm_arg($a, 'id'))];
            foreach (['cover_html', 'media_html'] as $k) {
                if (isset($p[$k])) {
                    $p[$k] = '(designed by the web team)';
                }
            }
            return bm_json($p);

        case 'get_upload_link':
            $exp = time() + 86400;
            $sig = hash_hmac('sha256', (string)$exp, $cfg['key']);
            return "Upload page (works for 24 hours): {$site}mcp/upload.php?t=$exp.$sig\n"
                 . 'Drop the pictures or films there; each one gets a code like u3f9a0c1d. Give the codes back here.';

        case 'add_branding_project':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a, $store, $site) {
                $name = bm_arg($a, 'name');
                $slugs = array_column($data['branding']['projects'], 'slug');
                $slug = bm_unique(bm_slug($name), fn($s) => in_array($s, $slugs, true) || $store->read("work/work-$s.html") !== null);
                $p = bm_branding_fields($a, ['slug' => $slug, 'tags' => []], $changes);
                $p['case'] = bm_case_from_args(bm_arg($a, 'case'), $slug, $changes);
                $at = bm_place($data['branding']['projects'], $p, $a['position'] ?? null);
                return ["Added $name to the Branding grid at place $at, with its case page:\n{$site}work/work-$slug.html", "Portfolio: add $name to Branding"];
            });

        case 'add_logo':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a, $site) {
                $name = bm_arg($a, 'name');
                $ids = array_map(fn($l) => bm_slug($l['name']), $data['logos']['logos']);
                if (in_array(bm_slug($name), $ids, true)) {
                    throw new InvalidArgumentException("$name is already in the Logo Gallery; use update_project to change it.");
                }
                $l = ['name' => $name, 'category' => bm_arg($a, 'category'),
                      'image' => bm_take(bm_arg($a, 'image'), 'logo', 'Image/logo-gallery-images/' . bm_slug($name), $changes)];
                foreach (['alt', 'keywords'] as $k) {
                    if (($v = bm_arg($a, $k, false)) !== null) {
                        $l[$k] = $v;
                    }
                }
                $at = bm_place($data['logos']['logos'], $l, $a['position'] ?? null);
                return ["Added $name to the Logo Gallery at place $at:\n{$site}logo-gallery.html", "Portfolio: add $name to the Logo Gallery"];
            });

        case 'add_mascot':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a, $site) {
                $name = bm_arg($a, 'name');
                $keys = array_column($data['mascots']['mascots'], 'key');
                $key = bm_unique(bm_slug($name), fn($k) => in_array($k, $keys, true));
                $m = ['key' => $key, 'name' => $name, 'line' => bm_arg($a, 'line'), 'tags' => array_values(bm_arg($a, 'tags')),
                      'accent' => strtoupper(bm_arg($a, 'accent')), 'background' => strtoupper(bm_arg($a, 'background')),
                      'image' => bm_take(bm_arg($a, 'image'), 'mascot', "Image/mascot/cut/$key", $changes)];
                if (($v = bm_arg($a, 'size', false)) !== null) {
                    $m['size'] = max(0.4, min(0.95, (float)$v));
                }
                if (($v = bm_arg($a, 'link', false)) !== null) {
                    $m['link'] = $v;
                }
                $at = bm_place($data['mascots']['mascots'], $m, $a['position'] ?? null);
                return ["Added $name to the Mascot Gallery at place $at:\n{$site}mascot-gallery.html", "Portfolio: add $name to the Mascot Gallery"];
            });

        case 'update_project':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a, $site) {
                $g = bm_arg($a, 'gallery');
                $key = bm_list_key($g);
                $i = bm_find($data, $g, bm_arg($a, 'id'));
                $p = $data[$g][$key][$i];
                $c = bm_arg($a, 'changes');
                if ($g === 'branding') {
                    $p = bm_branding_fields($c, $p, $changes);
                    if (isset($c['case'])) {
                        if (!is_array($p['case'] ?? null)) {
                            throw new InvalidArgumentException("{$p['name']} has a designed case page; the web team edits it. Its card can still change.");
                        }
                        $merged = array_merge(['hero_image' => $p['case']['hero']['src']], $c['case']);
                        $new = bm_case_from_args($merged, $p['slug'], $changes);
                        if (!isset($c['case']['blocks'])) {
                            $new['blocks'] = $p['case']['blocks'];
                        }
                        $p['case'] = array_merge($p['case'], $new);
                    }
                    $url = "{$site}work/work-{$p['slug']}.html";
                } elseif ($g === 'logos') {
                    foreach (['name', 'category', 'alt', 'keywords'] as $k) {
                        if (($v = bm_arg($c, $k, false)) !== null) {
                            $p[$k] = $v;
                        }
                    }
                    if (($v = bm_arg($c, 'image', false)) !== null) {
                        $p['image'] = bm_take($v, 'logo', 'Image/logo-gallery-images/' . bm_slug($p['name']), $changes);
                    }
                    unset($p['search']);
                    $url = "{$site}logo-gallery.html";
                } else {
                    foreach (['name', 'line', 'link'] as $k) {
                        if (($v = bm_arg($c, $k, false)) !== null) {
                            $p[$k] = $v;
                        }
                    }
                    foreach (['accent', 'background'] as $k) {
                        if (($v = bm_arg($c, $k, false)) !== null) {
                            $p[$k] = strtoupper($v);
                        }
                    }
                    if (($v = bm_arg($c, 'tags', false)) !== null) {
                        $p['tags'] = array_values($v);
                    }
                    if (($v = bm_arg($c, 'size', false)) !== null) {
                        $p['size'] = max(0.4, min(0.95, (float)$v));
                    }
                    if (($v = bm_arg($c, 'image', false)) !== null) {
                        $p['image'] = bm_take($v, 'mascot', "Image/mascot/cut/{$p['key']}", $changes);
                        unset($p['media_html']);   // a new picture replaces the designed one
                    }
                    unset($p['search']);
                    $url = "{$site}mascot-gallery.html";
                }
                $data[$g][$key][$i] = $p;
                return ["Updated {$p['name']}:\n$url", "Portfolio: update {$p['name']} ($g)"];
            });

        case 'move_project':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a) {
                $g = bm_arg($a, 'gallery');
                $key = bm_list_key($g);
                $i = bm_find($data, $g, bm_arg($a, 'id'));
                [$p] = array_splice($data[$g][$key], $i, 1);
                $at = bm_place($data[$g][$key], $p, (int)bm_arg($a, 'position'));
                return ["Moved {$p['name']} to place $at.", "Portfolio: move {$p['name']} ($g)"];
            });

        case 'remove_project':
            return bm_edit($store, $cfg, function (array &$data, array &$changes) use ($a) {
                $g = bm_arg($a, 'gallery');
                $key = bm_list_key($g);
                $i = bm_find($data, $g, bm_arg($a, 'id'));
                [$p] = array_splice($data[$g][$key], $i, 1);
                $note = '';
                if ($g === 'branding') {
                    if (is_array($p['case'] ?? null)) {
                        $changes["work/work-{$p['slug']}.html"] = null;
                    } else {
                        $note = " Its designed case page (work/work-{$p['slug']}.html) is still on the server, just no longer linked.";
                    }
                }
                return ["Removed {$p['name']} from the $g gallery.$note", "Portfolio: remove {$p['name']} ($g)"];
            });
    }
    throw new InvalidArgumentException("Unknown tool $name");
}
