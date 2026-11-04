<?php
/**
 * The upload page for the portfolio MCP: the branding team drops pictures and films here and gets a
 * code for each to give Claude. The link comes from the get_upload_link tool and works for 24 hours.
 */
require __DIR__ . '/images.php';

$cfg = require __DIR__ . '/config.php';
[$exp, $sig] = array_pad(explode('.', (string)($_GET['t'] ?? ''), 2), 2, '');
if (!ctype_digit($exp) || (int)$exp < time() || !hash_equals(hash_hmac('sha256', $exp, $cfg['key']), $sig)) {
    http_response_code(403);
    exit('This upload link has expired. Ask Claude for a new one (get_upload_link).');
}

$types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
$done = [];
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    @mkdir(bm_uploads_dir(), 0775, true);
    bm_clean_uploads();
    $files = $_FILES['files'] ?? null;
    foreach ((array)($files['name'] ?? []) as $i => $name) {
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            $errors[] = "$name: " . ($files['error'][$i] === UPLOAD_ERR_INI_SIZE ? 'too big for the server' : 'did not arrive');
            continue;
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($files['tmp_name'][$i]);
        if (!in_array($mime, $types, true)) {
            $errors[] = "$name: only JPG, PNG, WebP, GIF, MP4 and WebM";
            continue;
        }
        $code = 'u' . bin2hex(random_bytes(4));
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION)) ?: 'bin';
        move_uploaded_file($files['tmp_name'][$i], bm_uploads_dir() . "/$code." . preg_replace('/[^a-z0-9]/', '', $ext));
        $done[] = [$name, $code];
    }
}
$e = fn($s) => htmlspecialchars($s, ENT_QUOTES);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Portfolio upload | Brand Method</title>
<style>
  :root { --ink: #0b0f2e; --blue: #2536F5; --mute: #5b6078; --line: #dfe2ee; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.5 Inter, system-ui, sans-serif; color: var(--ink); background: #f6f7fb; }
  main { max-width: 640px; margin: 0 auto; padding: 48px 20px; }
  h1 { font-size: 28px; margin: 0 0 6px; }
  p { color: var(--mute); margin: 0 0 24px; }
  form { background: #fff; border: 1px solid var(--line); padding: 24px; }
  label.drop { display: block; border: 2px dashed var(--line); padding: 32px 16px; text-align: center; cursor: pointer; color: var(--mute); }
  label.drop:hover { border-color: var(--blue); color: var(--ink); }
  input[type=file] { margin-top: 12px; max-width: 100%; }
  button { margin-top: 16px; background: var(--blue); color: #fff; border: 0; padding: 12px 22px; font: 600 14px/1 Inter, sans-serif; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
  ul { list-style: none; padding: 0; margin: 24px 0 0; }
  li { background: #fff; border: 1px solid var(--line); padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  code { font: 600 16px/1 ui-monospace, Menlo, monospace; color: var(--blue); user-select: all; }
  .err { color: #c0262d; }
</style>
</head>
<body>
<main>
  <h1>Portfolio upload</h1>
  <p>Drop the pictures or films for the portfolio. Each one gets a code: copy the codes back to Claude. Files are kept for 7 days.</p>
  <form method="post" enctype="multipart/form-data">
    <label class="drop">Choose files (JPG, PNG, WebP, GIF, MP4)<br><input type="file" name="files[]" multiple required accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"></label>
    <button type="submit">Upload</button>
  </form>
  <?php if ($done || $errors): ?>
  <ul>
    <?php foreach ($done as [$name, $code]): ?><li><span><?= $e($name) ?></span><code><?= $e($code) ?></code></li><?php endforeach; ?>
    <?php foreach ($errors as $err): ?><li class="err"><?= $e($err) ?></li><?php endforeach; ?>
  </ul>
  <?php endif; ?>
</main>
</body>
</html>
