<?php
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE ONLY — this file is in the repo and therefore PUBLIC. Never put a
// real API key in it.
//
// Copy it on the SERVER to one level above the web root, then fill it in:
//
//   ssh into the Cloudways app, then:
//   cp ~/applications/<app>/public_html/api/newsletter/CONFIG-TEMPLATE.php \
//      ~/applications/<app>/private_html/brevo-config.php
//   nano ~/applications/<app>/private_html/brevo-config.php
//   chmod 600 ~/applications/<app>/private_html/brevo-config.php
//
// private_html sits OUTSIDE public_html, so it can never be downloaded, and
// git deploys only ever write into public_html — so a `Pull` cannot overwrite it.
// ─────────────────────────────────────────────────────────────────────────────

return [
    // Brevo → (your name, top right) → SMTP & API → API keys → Generate a new API key
    'api_key'      => 'PUT-YOUR-BREVO-API-KEY-HERE',

    // Brevo → Contacts → Lists → the list's ID (the number in the ID column)
    'list_id'      => 0,

    // Optional, recommended: double opt-in. Brevo sends a "confirm your subscription"
    // email and only adds the contact once they click it.
    // Brevo → Campaigns → Templates → a template using the double opt-in tag
    // {{ doubleoptin }}; put its ID here. Leave 0 to add contacts straight away.
    'doi_template' => 0,

    // Where Brevo sends people after they confirm (double opt-in only).
    'site_url'     => 'https://brandmethod.co',
];
