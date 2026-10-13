<?php
// Shared Brevo config + helpers for the newsletter endpoint.
//
// The API key must NEVER live in this repo — the repo IS public_html, so
// anything here is downloadable. Instead we read a config file placed by hand
// on the server, one level ABOVE the web root:
//
//   ~/applications/<app>/private_html/brevo-config.php
//
// See api/newsletter/CONFIG-TEMPLATE.php for its contents.
//
// Locally (dev) we fall back to the gitignored .env (BREVO_API_KEY, BREVO_LIST_ID,
// BREVO_DOI_TEMPLATE_ID, SITE_URL), the same way api/toyyibpay/_config.php does.

declare(strict_types=1);

function nl_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $cfg = ['api_key' => '', 'list_id' => 0, 'doi_template' => 0, 'site_url' => ''];

    // 1) production: config file above the web root
    foreach ([
        __DIR__ . '/../../../private_html/brevo-config.php',
        __DIR__ . '/../../private_html/brevo-config.php',
        dirname(__DIR__, 3) . '/brevo-config.php',
    ] as $candidate) {
        if (is_readable($candidate)) {
            $loaded = require $candidate;
            if (is_array($loaded)) $cfg = array_merge($cfg, $loaded);
            break;
        }
    }

    // 2) local dev fallback: the .env server.js reads (gitignored, never deployed)
    if ($cfg['api_key'] === '' && is_readable(__DIR__ . '/../../.env')) {
        foreach (file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (!preg_match('/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/', $line, $m)) continue;
            $val = trim($m[2], " \t\"'");
            switch ($m[1]) {
                case 'BREVO_API_KEY':         $cfg['api_key']      = $val; break;
                case 'BREVO_LIST_ID':         $cfg['list_id']      = (int) $val; break;
                case 'BREVO_DOI_TEMPLATE_ID': $cfg['doi_template'] = (int) $val; break;
                case 'SITE_URL':              $cfg['site_url']     = $val; break;
            }
        }
    }

    $cfg['list_id']      = (int) $cfg['list_id'];
    $cfg['doi_template'] = (int) $cfg['doi_template'];
    $cfg['site_url']     = rtrim((string) $cfg['site_url'], '/');
    return $cfg;
}

function nl_json(int $code, array $obj): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');   // keep Varnish off the endpoint
    echo json_encode($obj);
    exit;
}

// POST JSON to the Brevo API. Returns [status, decoded body]. Uses cURL, falls
// back to a stream context if curl_exec is disabled (Cloudways disable_functions varies).
function nl_brevo(string $path, array $payload, string $apiKey): array
{
    $url     = 'https://api.brevo.com/v3' . $path;
    $body    = json_encode($payload);
    $headers = ['accept: application/json', 'content-type: application/json', 'api-key: ' . $apiKey];

    if (function_exists('curl_exec')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_HTTPHEADER     => $headers,
        ]);
        $out    = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err    = curl_error($ch);
        curl_close($ch);
        if ($out === false) throw new RuntimeException('Network error: ' . $err);
        return [$status, json_decode((string) $out, true) ?: []];
    }

    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers) . "\r\n",
        'content'       => $body,
        'timeout'       => 20,
        'ignore_errors' => true,
    ]]);
    $out = @file_get_contents($url, false, $ctx);
    if ($out === false) throw new RuntimeException('Network error (no cURL, file_get_contents failed)');
    $status = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $status = (int) $m[1];
    return [$status, json_decode($out, true) ?: []];
}
