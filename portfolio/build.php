<?php
/**
 * Build the portfolio pages from portfolio/data/*.json, in this repo.
 *
 *     php portfolio/build.php            # write the pages that changed
 *     php portfolio/build.php --check    # list what would change, write nothing
 *
 * The MCP (mcp/) runs the same renderer and commits through GitHub; this command is for
 * working locally, and for after a port from the design export (tools/build-work-1031.py
 * calls it at the end, so the project lists win over the export's cards).
 */
if (PHP_SAPI !== 'cli') {
    exit;
}
require __DIR__ . '/lib.php';
$root = dirname(__DIR__);
$check = in_array('--check', $argv, true);

$data = [];
foreach (BM_DATA as $k => $path) {
    $data[$k] = json_decode(file_get_contents("$root/$path"), true, 512, JSON_THROW_ON_ERROR);
}
if ($errors = bm_validate($data)) {
    fwrite(STDERR, implode("\n", $errors) . "\n");
    exit(1);
}

$files = [];
foreach (array_merge(bm_base_files(), bm_case_files($data['branding'])) as $path) {
    if (is_file("$root/$path")) {
        $files[$path] = file_get_contents("$root/$path");
    }
}
$out = bm_render($data, $files);

// the menu's counts in every page's baked-in copy of the menu
$pages = array_merge(glob("$root/*.html"), glob("$root/work/*.html"), glob("$root/services/*.html"));
foreach ($pages as $abs) {
    $path = substr(str_replace('\\', '/', $abs), strlen(str_replace('\\', '/', $root)) + 1);
    $s = $out[$path] ?? $files[$path] ?? file_get_contents($abs);
    $t = bm_menu_counts($s, $data);
    if ($t !== ($files[$path] ?? file_get_contents($abs))) {
        $out[$path] = $t;
    }
}

ksort($out);
foreach ($out as $path => $s) {
    printf("%s %s\n", isset($files[$path]) || is_file("$root/$path") ? 'changed' : 'new    ', $path);
    if (!$check) {
        @mkdir(dirname("$root/$path"), 0775, true);
        file_put_contents("$root/$path", $s);
    }
}
echo $out ? ($check ? count($out) . " files would change\n" : count($out) . " files written\n") : "nothing to change\n";
