<?php
// POST /api/toyyibpay/create-bill.php
// Creates a ToyyibPay bill and returns its payment URL. Production counterpart
// of createBill() in server.js — same params, same authoritative pricing.
//
// Request:  {"pkg":"logo_starter","name":"...","phone":"...","email":"..."}
// Response: {"url":"https://dev.toyyibpay.com/<billcode>","ref":"logo_starter-1699..."}

declare(strict_types=1);
require __DIR__ . '/_config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    tb_json(405, ['error' => 'Method not allowed']);
}

$in  = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$pkg = is_string($in['pkg'] ?? null) ? $in['pkg'] : '';

// price comes from the server-side table, never from the request
if (!isset(TB_PACKAGES[$pkg]))                    tb_json(400, ['error' => 'Invalid package']);
if (empty($in['name']) || empty($in['phone']))    tb_json(400, ['error' => 'Name and phone are required']);

$p   = TB_PACKAGES[$pkg];
$cfg = tb_config();

if ($cfg['secret_key'] === '' || $cfg['category_code'] === '') {
    error_log('[create-bill] missing ToyyibPay config (private_html/toyyibpay-config.php)');
    tb_json(500, ['error' => 'Payments are not configured on this server']);
}

// SITE_URL must be the real public origin, else ToyyibPay cannot call us back
$site = $cfg['site_url'] !== ''
    ? $cfg['site_url']
    : ((!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

$ref = $pkg . '-' . (int) round(microtime(true) * 1000);

$params = [
    'userSecretKey'          => $cfg['secret_key'],
    'categoryCode'           => $cfg['category_code'],
    'billName'               => substr($p['name'], 0, 30),
    'billDescription'        => substr($p['name'] . ' order', 0, 100),
    'billPriceSetting'       => '1',                                  // 1 = fixed price
    'billPayorInfo'          => '1',                                  // collect payer info
    'billAmount'             => (string) $p['amount'],                // in cents
    'billReturnUrl'          => $site . '/pay/return.php',            // browser lands here
    'billCallbackUrl'        => $site . '/api/toyyibpay/callback.php',// server-to-server
    'billExternalReferenceNo'=> $ref,
    'billTo'                 => substr((string) $in['name'], 0, 30),
    'billEmail'              => (string) ($in['email'] ?? ''),
    'billPhone'              => substr((string) $in['phone'], 0, 20),
    'billPaymentChannel'     => '2',                                  // 0=FPX 1=card 2=both
    'billContentEmail'       => 'Thank you for your order with BrandMethod.',
];

try {
    $text = tb_post($cfg['base'] . '/index.php/api/createBill', $params);
} catch (Throwable $e) {
    error_log('[create-bill] ' . $e->getMessage());
    tb_json(500, ['error' => 'Could not reach the payment provider']);
}

$data = json_decode($text, true);
$code = (is_array($data) && isset($data[0]['BillCode'])) ? $data[0]['BillCode'] : '';

if ($code === '') {
    // ToyyibPay reports failures as plain text, e.g. [KEY-DID-NOT-EXIST-OR-USER-IS-NOT-ACTIVE]
    error_log('[create-bill] ToyyibPay error: ' . substr($text, 0, 200));
    tb_json(500, ['error' => 'Payment provider rejected the request']);
}

tb_log_order([
    'event' => 'bill_created',
    'ref'   => $ref,
    'bill'  => $code,
    'pkg'   => $pkg,
    'amount'=> $p['amount'],
    'name'  => (string) $in['name'],
    'email' => (string) ($in['email'] ?? ''),
    'phone' => (string) $in['phone'],
    'at'    => gmdate('c'),
]);

tb_json(200, ['url' => $cfg['base'] . '/' . $code, 'ref' => $ref]);
