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
    'logo_starter'         => ['name' => 'Logo Starter', 'amount' => 29000],   // RM290
    'logo_growth'          => ['name' => 'Logo Growth', 'amount' => 199000],   // RM1,990
    'logo_premium'         => ['name' => 'Logo Premium', 'amount' => 395000],   // RM3,950 (50% deposit)
    'brand_foundation'     => ['name' => 'Brand Foundation', 'amount' => 395000],   // RM3,950 (50% deposit)
    'brand_growth'         => ['name' => 'Brand Growth System', 'amount' => 800000],   // RM8,000 (50% deposit)
    'brand_architecture'   => ['name' => 'Full Brand Architecture', 'amount' => 1500000],   // RM15,000 (50% deposit)
    'brand_bespoke'        => ['name' => 'Bespoke Engagement', 'amount' => 2500000],   // RM25,000 (50% to start)
    'website_starter'      => ['name' => 'Starter Website', 'amount' => 190000],   // RM1,900
    'website_growth'       => ['name' => 'Growth Website', 'amount' => 300000],   // RM3,000 (50% deposit)
    'website_corporate'    => ['name' => 'Website Corporate / E-commerce', 'amount' => 750000],   // RM7,500 (50% deposit)
    'personal_starter'     => ['name' => 'Personal Branding Starter', 'amount' => 300000],   // RM3,000 (first month)
    'company_slam'         => ['name' => 'Profile Slam Dunk', 'amount' => 190000],   // RM1,900
    'company_pro'          => ['name' => 'Profile Professional', 'amount' => 295000],   // RM2,950 (50% deposit)
    'company_custom'       => ['name' => 'Profile Signature', 'amount' => 545000],   // RM5,450 (50% to start)
    'trademark_filing'     => ['name' => 'Trademark Filing', 'amount' => 150000],   // RM1,500 to start
    'trademark_managed'    => ['name' => 'Managed Trademark', 'amount' => 390000],   // RM3,900 to start
    'trademark_global'     => ['name' => 'Global Trademark System', 'amount' => 300000],   // RM3,000 (50% to start)
    'app_starter'          => ['name' => 'App Validation Sprint', 'amount' => 295000],   // RM2,950 (50% deposit)
    'app_growth'           => ['name' => 'App Build', 'amount' => 700000],   // RM7,000 (50% to start)
    'game_campaign'        => ['name' => 'Campaign Game', 'amount' => 490000],   // RM4,900 to start
    'game_custom'          => ['name' => 'Game Custom', 'amount' => 1400000],   // RM14,000 (50% to start)
    'pres_starter'         => ['name' => 'Interactive Pitch Deck', 'amount' => 190000],   // RM1,900
    'pres_signature'       => ['name' => 'Signature Interactive Deck', 'amount' => 490000],   // RM4,900
    'ux_audit'             => ['name' => 'UX Audit Sprint', 'amount' => 390000],   // RM3,900
    'ux_redesign'          => ['name' => 'UX Redesign Sprint', 'amount' => 595000],   // RM5,950 (50% to start)
    'strategy_sprint'      => ['name' => 'Strategy Sprint', 'amount' => 490000],   // RM4,900
    'strategy_growth'      => ['name' => 'Growth Architecture', 'amount' => 900000],   // RM9,000 (50% deposit)
    'strategy_full'        => ['name' => 'Full Growth Architecture', 'amount' => 2500000],   // RM25,000 (50% to start)
    'auto_starter'         => ['name' => 'Automation Core', 'amount' => 490000],   // RM4,900
    'auto_system'          => ['name' => 'Automation System', 'amount' => 700000],   // RM7,000 (50% deposit)
    'auto_custom'          => ['name' => 'Automation Custom', 'amount' => 1250000],   // RM12,500 (50% to start)
    'ai_audit'             => ['name' => 'AI Readiness Audit', 'amount' => 290000],   // RM2,900
    'ai_fixed'             => ['name' => 'AI Setup Fixed', 'amount' => 950000],   // RM9,500 (50% deposit)
    'ai_custom'            => ['name' => 'AI Setup Custom', 'amount' => 2000000],   // RM20,000 (50% to start)
    'content_starter'      => ['name' => 'Content Sprint', 'amount' => 290000],   // RM2,900
    'content_system'       => ['name' => 'Content Starter', 'amount' => 390000],   // RM3,900 (first month)
    'ads_audit'            => ['name' => 'Campaign Audit', 'amount' => 190000],   // RM1,900
    'seo_audit'            => ['name' => 'SEO Audit Sprint', 'amount' => 190000],   // RM1,900
    'seo_growth'           => ['name' => 'SEO Growth', 'amount' => 490000],   // RM4,900 (first month)
    'expertbiz_module'     => ['name' => 'Signature Module Launch', 'amount' => 950000],   // RM9,500 (50% deposit)
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
