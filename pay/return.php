<?php
// GET /pay/return.php — where the buyer's browser lands after paying.
// PHP counterpart of the /pay/return route in server.js.
//
// This page is cosmetic. ToyyibPay puts status_id in the URL, which a curious
// buyer could edit, so nothing here is treated as proof of payment — the real
// record is written by callback.php after verifying with ToyyibPay.

declare(strict_types=1);

$status  = $_GET['status_id'] ?? '';
$bill    = preg_replace('/[^A-Za-z0-9]/', '', (string) ($_GET['billcode'] ?? ''));
$ok      = $status === '1';
$pending = $status === '2';

header('Cache-Control: no-store');   // never let Varnish cache someone's receipt

$icon  = $ok ? '✅' : ($pending ? '⏳' : '❌');
$title = $ok ? 'Payment received' : ($pending ? 'Payment pending' : 'Payment not completed');
$msg   = $ok
    ? "Thank you — we'll be in touch shortly to start your project."
    : ($pending
        ? 'Your payment is being processed. We\'ll confirm by email once it clears.'
        : "If money was deducted, contact us and we'll sort it out.");
?><!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= htmlspecialchars($title, ENT_QUOTES) ?></title>
<body style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 20px;text-align:center;color:#15161A">
  <div style="font-size:54px"><?= $icon ?></div>
  <h1 style="font-family:Fraunces,Georgia,serif;font-weight:500"><?= htmlspecialchars($title, ENT_QUOTES) ?></h1>
  <p style="color:#54565d;line-height:1.6"><?= htmlspecialchars($msg, ENT_QUOTES) ?></p>
  <?php if ($bill !== ''): ?>
    <p style="font-size:12px;color:#8a8c86">Ref: <?= htmlspecialchars($bill, ENT_QUOTES) ?></p>
  <?php endif; ?>
  <a href="/pricing.html" style="display:inline-block;margin-top:18px;background:#1a26de;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px">Back to pricing</a>
</body>
