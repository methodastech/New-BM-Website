<?php
/**
 * Pictures and films for the portfolio. A picture is given to a tool as one of:
 *   an upload code    from the upload page (get_upload_link), e.g. u3f9a0c1d
 *   a web link        https://..., including Google Drive share links
 *   a site path       a file already on the site, e.g. Image/work6/firmus/scene-soc.webp
 * New pictures are made WebP and sized for where they go; films are kept as they are.
 */

const BM_MAX_WIDTH = ['cover' => 2000, 'figure' => 2000, 'hero' => 2400, 'logo' => 1600, 'mascot' => 1000];
const BM_MAX_BYTES = 60 * 1024 * 1024;

function bm_uploads_dir(): string
{
    return __DIR__ . '/uploads';
}

/** The bytes and type behind a picture or film reference, or a site path that is already there. */
function bm_fetch(string $ref): array
{
    $ref = trim($ref);
    if (preg_match('/^u[0-9a-f]{8}$/', $ref)) {
        $hits = glob(bm_uploads_dir() . "/$ref.*");
        if (!$hits) {
            throw new InvalidArgumentException("No upload with the code $ref. Upload it again on the upload page (they are kept for 7 days).");
        }
        return ['bytes' => file_get_contents($hits[0])];
    }
    if (preg_match('~^https?://~', $ref)) {
        if (preg_match('~drive\.google\.com/(?:file/d/|open\?id=)([\w-]+)~', $ref, $m)) {
            $ref = 'https://drive.google.com/uc?export=download&id=' . $m[1];
        }
        $ch = curl_init($ref);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => 90, CURLOPT_USERAGENT => 'brandmethod-portfolio-mcp',
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS]);
        $bytes = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($bytes === false || $code !== 200) {
            throw new InvalidArgumentException("The link $ref could not be downloaded ($code). Use a public link, or the upload page.");
        }
        return ['bytes' => $bytes];
    }
    if (preg_match('~^(Image|work-images|video)/[\w ./%()&\'-]+\.(webp|png|jpe?g|gif|mp4|webm)$~i', $ref) && !str_contains($ref, '..')) {
        return ['path' => $ref];
    }
    throw new InvalidArgumentException("\"$ref\" is not an upload code, a web link or a site path.");
}

function bm_mime(string $bytes): string
{
    return (new finfo(FILEINFO_MIME_TYPE))->buffer($bytes) ?: '';
}

/**
 * Put a picture (or film) into the change set and return its site path.
 * $kind: cover, figure, hero, logo, mascot or film. $base: the path without extension, e.g. Image/work6/koji/cover.
 */
function bm_take(string $ref, string $kind, string $base, array &$changes): string
{
    $got = bm_fetch($ref);
    if (isset($got['path'])) {
        return $got['path'];
    }
    $bytes = $got['bytes'];
    if (strlen($bytes) > BM_MAX_BYTES) {
        throw new InvalidArgumentException('That file is over 60 MB. Make it smaller first.');
    }
    $mime = bm_mime($bytes);
    $tag = substr(bin2hex(random_bytes(3)), 0, 5);   // keeps a new picture from overwriting an older one of the same name
    if ($kind === 'film') {
        $ext = ['video/mp4' => 'mp4', 'video/webm' => 'webm', 'video/quicktime' => 'mp4'][$mime] ?? null;
        if (!$ext) {
            throw new InvalidArgumentException("A film must be MP4 or WebM (this one is $mime).");
        }
        $path = "$base-$tag.$ext";
        $changes[$path] = $bytes;
        return $path;
    }
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
        throw new InvalidArgumentException("A picture must be JPG, PNG, WebP or GIF (this one is $mime).");
    }
    $im = function_exists('imagecreatefromstring') ? @imagecreatefromstring($bytes) : false;
    if (!$im || !function_exists('imagewebp')) {   // no GD on the server: keep the file as it came
        $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime];
        $path = "$base-$tag.$ext";
        $changes[$path] = $bytes;
        return $path;
    }
    $w = imagesx($im);
    $h = imagesy($im);
    $max = BM_MAX_WIDTH[$kind] ?? 2000;
    if ($w > $max) {
        $nh = (int)round($h * $max / $w);
        $out = imagecreatetruecolor($max, $nh);
        imagealphablending($out, false);
        imagesavealpha($out, true);
        imagefill($out, 0, 0, imagecolorallocatealpha($out, 0, 0, 0, 127));
        imagecopyresampled($out, $im, 0, 0, 0, 0, $max, $nh, $w, $h);
        imagedestroy($im);
        $im = $out;
    } else {
        imagepalettetotruecolor($im);
        imagealphablending($im, false);
        imagesavealpha($im, true);
    }
    ob_start();
    imagewebp($im, null, $kind === 'mascot' || $kind === 'logo' ? 90 : 82);
    $webp = ob_get_clean();
    imagedestroy($im);
    $path = "$base-$tag.webp";
    $changes[$path] = $webp;
    return $path;
}

/** The width / height of a picture in the change set (for the case page's hero and rows), or null. */
function bm_ratio(string $path, array $changes): ?float
{
    if (!isset($changes[$path]) || !function_exists('getimagesizefromstring')) {
        return null;
    }
    $s = @getimagesizefromstring($changes[$path]);
    return $s && $s[1] ? round($s[0] / $s[1], 4) : null;
}

/** Uploads are kept for 7 days. */
function bm_clean_uploads(): void
{
    foreach (glob(bm_uploads_dir() . '/u*') ?: [] as $f) {
        if (filemtime($f) < time() - 7 * 86400) {
            @unlink($f);
        }
    }
}
