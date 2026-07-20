<?php
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE ONLY — this file is in the repo and therefore PUBLIC. Never put a
// real secret key in it.
//
// Copy it on the SERVER to one level above the web root, then fill it in:
//
//   ssh into the Cloudways app, then:
//   cp ~/applications/<app>/public_html/api/toyyibpay/CONFIG-TEMPLATE.php \
//      ~/applications/<app>/private_html/toyyibpay-config.php
//   nano ~/applications/<app>/private_html/toyyibpay-config.php
//   chmod 600 ~/applications/<app>/private_html/toyyibpay-config.php
//
// private_html sits OUTSIDE public_html, so it can never be downloaded, and
// git deploys only ever write into public_html — so a `Pull` cannot overwrite it.
// ─────────────────────────────────────────────────────────────────────────────

return [
    // SANDBOX: https://dev.toyyibpay.com   |   LIVE: https://toyyibpay.com
    // The two are entirely separate accounts. A live key will NOT work against
    // the sandbox base (that's the [KEY-DID-NOT-EXIST-OR-USER-IS-NOT-ACTIVE] error).
    'base'          => 'https://dev.toyyibpay.com',

    'secret_key'    => 'PUT-YOUR-TOYYIBPAY-SECRET-KEY-HERE',
    'category_code' => 'PUT-YOUR-CATEGORY-CODE-HERE',

    // Must be the real public origin, with no trailing slash. ToyyibPay uses
    // this to build the return + callback URLs, so localhost will not work.
    'site_url'      => 'https://brandmethod.co',
];
