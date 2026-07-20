<?php
// Shared ToyyibPay config + helpers for the PHP (production) endpoints.
//
// The secret key must NEVER live in this repo — the repo IS public_html, so
// anything here is downloadable. Instead we read a config file placed by hand
// on the server, one level ABOVE the web root:
//
//   ~/applications/<app>/private_html/toyyibpay-config.php
//
// See api/toyyibpay/CONFIG-TEMPLATE.php for its contents.
//
// Locally (dev) we fall back to the .env that server.js already uses, so the
// same endpoint works under `npm start` and on Cloudways without edits.

declare(strict_types=1);

// ---- Authoritative prices (server-side; the browser can NOT change these) ----
// Mirrors the PACKAGES map in server.js. amount is in cents (RM * 100).
const TB_PACKAGES = [
    'logo_starter' => ['name' => 'Logo Starter', 'amount' => 29000],   // RM290
    'logo_growth'  => ['name' => 'Logo Growth',  'amount' => 199000],  // RM1,990
];

function tb_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $cfg = ['base' => '', 'secret_key' => '', 'category_code' => '', 'site_url' => ''];

    // 1) production: config file above the web root
    foreach ([
        __DIR__ . '/../../../private_html/toyyibpay-config.php',
        __DIR__ . '/../../private_html/toyyibpay-config.php',
        dirname(__DIR__, 3) . '/toyyibpay-config.php',
    ] as $candidate) {
        if (is_readable($candidate)) {
            $loaded = require $candidate;
            if (is_array($loaded)) $cfg = array_merge($cfg, $loaded);
            break;
        }
    }

    // 2) local dev fallback: the .env server.js reads (gitignored, never deployed)
    if ($cfg['secret_key'] === '' && is_readable(__DIR__ . '/../../.env')) {
        foreach (file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (!preg_match('/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/', $line, $m)) continue;
            $val = trim($m[2], " \t\"'");
            switch ($m[1]) {
                case 'TOYYIBPAY_BASE':          $cfg['base']          = $val; break;
                case 'TOYYIBPAY_SECRET_KEY':    $cfg['secret_key']    = $val; break;
                case 'TOYYIBPAY_CATEGORY_CODE': $cfg['category_code'] = $val; break;
                case 'SITE_URL':                $cfg['site_url']      = $val; break;
            }
        }
    }

    $cfg['base']     = rtrim($cfg['base'] ?: 'https://dev.toyyibpay.com', '/');
    $cfg['site_url'] = rtrim($cfg['site_url'] ?: '', '/');
    return $cfg;
}

function tb_json(int $code, array $obj): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');   // keep Varnish off the payment endpoints
    echo json_encode($obj);
    exit;
}

// POST form-encoded to the ToyyibPay API. Uses cURL, falls back to a stream
// context if curl_exec is disabled (Cloudways disable_functions varies).
function tb_post(string $url, array $params): string
{
    $body = http_build_query($params);

    if (function_exists('curl_exec')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $out = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($out === false) throw new RuntimeException('Network error: ' . $err);
        return $out;
    }

    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content'       => $body,
        'timeout'       => 30,
        'ignore_errors' => true,
    ]]);
    $out = @file_get_contents($url, false, $ctx);
    if ($out === false) throw new RuntimeException('Network error (no cURL, file_get_contents failed)');
    return $out;
}

// Append a line to the order log kept outside the web root. Best-effort: a
// logging failure must never break a payment.
function tb_log_order(array $row): void
{
    $dir = dirname(__DIR__, 3) . '/private_html';
    if (!is_dir($dir)) $dir = sys_get_temp_dir();
    @file_put_contents(
        $dir . '/toyyibpay-orders.jsonl',
        json_encode($row) . "\n",
        FILE_APPEND | LOCK_EX
    );
}
