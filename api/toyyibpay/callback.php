<?php
// POST /api/toyyibpay/callback.php
// ToyyibPay's server-to-server notification. Replaces the console.log stub in
// server.js (which recorded nothing).
//
// This endpoint is public and unauthenticated — anyone can POST to it. So the
// posted body is treated as a HINT ONLY: we take the billcode from it, then ask
// ToyyibPay directly what that bill's real status and amount are. Nothing is
// recorded as paid on the strength of the request body alone.

declare(strict_types=1);
require __DIR__ . '/_config.php';

// always 200 back to ToyyibPay, otherwise it retries
register_shutdown_function(static function (): void {
    if (!headers_sent()) http_response_code(200);
});

$raw = file_get_contents('php://input') ?: '';
parse_str($raw, $post);
$post = $post ?: $_POST;

$bill = preg_replace('/[^A-Za-z0-9]/', '', (string) ($post['billcode'] ?? ''));
$ref  = (string) ($post['order_id'] ?? '');

if ($bill === '') {
    tb_log_order(['event' => 'callback_no_billcode', 'raw' => substr($raw, 0, 300), 'at' => gmdate('c')]);
    echo 'OK';
    exit;
}

$cfg = tb_config();

// --- verify against ToyyibPay rather than trusting the POST ---
$paid = false; $amount = null; $verifyErr = null;
try {
    $text = tb_post($cfg['base'] . '/index.php/api/getBillTransactions', [
        'billCode' => $bill,
        // omit billpaymentStatus to get every transaction for this bill
    ]);
    $rows = json_decode($text, true);
    if (is_array($rows)) {
        foreach ($rows as $row) {
            // billpaymentStatus: 1 = success, 2 = pending, 3 = fail, 4 = pending
            if ((string) ($row['billpaymentStatus'] ?? '') === '1') {
                $paid   = true;
                $amount = $row['billpaymentAmount'] ?? null;
                break;
            }
        }
    } else {
        $verifyErr = substr($text, 0, 200);
    }
} catch (Throwable $e) {
    $verifyErr = $e->getMessage();
}

tb_log_order([
    'event'      => $paid ? 'payment_verified' : 'payment_not_verified',
    'bill'       => $bill,
    'ref'        => $ref,
    'amount'     => $amount,
    'claimed'    => (string) ($post['status'] ?? ''),   // what the POST asserted
    'verify_err' => $verifyErr,
    'at'         => gmdate('c'),
]);

if ($paid) {
    // TODO: fulfilment goes here — email the team, create the order record,
    // notify WhatsApp. Keep it idempotent: ToyyibPay can call this more than
    // once for the same bill.
    error_log("[toyyibpay] verified payment bill=$bill ref=$ref amount=$amount");
}

echo 'OK';
