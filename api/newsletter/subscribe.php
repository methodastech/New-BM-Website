<?php
// POST /api/newsletter/subscribe.php
// Adds an email to the Brevo newsletter list (or, with double opt-in configured,
// asks Brevo to send the confirmation email first).
//
// Request:  {"email":"name@example.com","name":"Aina","source":"blog/some-article.html","company":""}
//           "name" is optional (stored as the Brevo FIRSTNAME attribute).
//           "company" is a hidden honeypot field: people leave it empty, bots fill it.
// Response: {"ok":true,"confirm":false}   confirm=true when the reader must click the email link

declare(strict_types=1);
require __DIR__ . '/_config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    nl_json(405, ['error' => 'Method not allowed']);
}

$in    = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$email = is_string($in['email'] ?? null) ? trim($in['email']) : '';

// a filled honeypot is a bot: answer as if it worked, store nothing
if (!empty($in['company'])) nl_json(200, ['ok' => true, 'confirm' => false]);

if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    nl_json(400, ['error' => 'Please enter a valid email address.']);
}

$cfg = nl_config();
if ($cfg['api_key'] === '' || $cfg['list_id'] <= 0) {
    error_log('[newsletter] missing Brevo config (private_html/brevo-config.php)');
    nl_json(500, ['error' => 'The newsletter is not configured on this server.']);
}

$source = is_string($in['source'] ?? null) ? substr(preg_replace('/[^\w\/.\-]/', '', $in['source']), 0, 120) : '';

// optional first name (the home page form asks for it); FIRSTNAME is a default Brevo attribute
$name  = is_string($in['name'] ?? null) ? trim(strip_tags($in['name'])) : '';
$attrs = $name !== '' ? ['FIRSTNAME' => mb_substr($name, 0, 60)] : [];

try {
    if ($cfg['doi_template'] > 0) {
        // double opt-in: Brevo emails a confirmation link and adds the contact once it is clicked
        $site = $cfg['site_url'] !== ''
            ? $cfg['site_url']
            : ((!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'brandmethod.co'));
        [$status, $res] = nl_brevo('/contacts/doubleOptinConfirmation', [
            'email'          => $email,
            'includeListIds' => [$cfg['list_id']],
            'templateId'     => $cfg['doi_template'],
            'redirectionUrl' => $site . '/thank-you.html',
        ] + ($attrs ? ['attributes' => $attrs] : []), $cfg['api_key']);
        $confirm = true;
    } else {
        // straight onto the list; updateEnabled makes a repeat signup a no-op instead of an error
        [$status, $res] = nl_brevo('/contacts', [
            'email'         => $email,
            'listIds'       => [$cfg['list_id']],
            'updateEnabled' => true,
        ] + ($attrs ? ['attributes' => $attrs] : []), $cfg['api_key']);
        $confirm = false;
    }
} catch (RuntimeException $e) {
    error_log('[newsletter] ' . $e->getMessage());
    nl_json(502, ['error' => 'Could not reach the newsletter service. Please try again.']);
}

if ($status >= 200 && $status < 300) {
    error_log('[newsletter] subscribed' . ($source !== '' ? ' from ' . $source : ''));
    nl_json(200, ['ok' => true, 'confirm' => $confirm]);
}

error_log('[newsletter] Brevo ' . $status . ' ' . ($res['code'] ?? '') . ' ' . ($res['message'] ?? ''));
if ($status === 400 && ($res['code'] ?? '') === 'invalid_parameter') {
    nl_json(400, ['error' => 'Please enter a valid email address.']);
}
nl_json(502, ['error' => 'Something went wrong. Please try again.']);
