<?php
// Leads from the 2 sales pages (16 Nov 2026).
//
//   POST /api/sales/lead.php?kind=premium   the Premium enquiry on /premium-website/ (#start)
//   POST /api/sales/lead.php?kind=launch    the Standard brief on /quickhook-website/ (#start), sent while card checkout is off
//   The pages post to this file directly: on this server (Cloudways) the .htaccess rewrite rules do not run for plain addresses.
//
// Each lead is checked (the rules of backend-reference/premium-leads/serve.py from the sales page pack), then:
//   1. kept on this server in api/sales/data/leads.jsonl (not reachable from the web: data/.htaccess, and *.jsonl is denied site wide);
//   2. sent to the same 2 places as the "Nobody wants a website" form: the FormSubmit inbox and the leads Google Sheet.
// The visitor gets {ok:true} once the lead is kept; a failed send is written to the PHP error log.
//
// Answers: 200 {ok,id,route} | 422 {ok:false,errors:{field:code}} | 429 too many | 400/405/413/415 bad request.
// Runs on PHP 7.4. Set BM_LEADS_DRY=1 in the environment to check and keep a lead without sending it anywhere (local tests).

declare(strict_types=1);

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/bazil@brandmethod.co';
const FORMSUBMIT_CC = 'amina@brandmethod.co,eyka@brandmethod.co,brian@brandmethod.co';   // the same copies as the "Nobody wants a website" form
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbx7ac49TomTlnhSstrvSxGeKBmaqLKwtNF9012m4JulX4OwAmB911pTg8MtdQS2g5Gfvg/exec';
const MAX_BODY = 20000;
const RATE_MAX = 5;          // submissions
const RATE_WINDOW = 600;     // per 10 minutes per address

// the choices the forms offer (from launch/data/catalog.json in the sales page pack, 16 Nov 2026)
const PROJECT_TYPES = ['business_site', 'ecommerce', 'portal', 'mobile_app', 'redesign', 'unsure'];
const BUDGETS = ['below_6k', '6_10k', '10_20k', '20_60k', '60k_plus', 'need_guidance'];
const TIMINGS = ['now', '30_days', '90_days', 'exploring'];
const NEEDS = ['Pages and copywriting', 'Online store', 'Bookings', 'Customer portal', 'CRM', 'Payments', 'Mobile app',
               'AI assistant or automation', 'Photo and video', 'Not sure yet'];
const MEET_SLOTS = ['10:00', '11:30', '14:30', '16:00'];
const MEET_MODES = ['video', 'phone'];
const PLANS = ['launch_managed' => 'Launch', 'grow_managed' => 'Grow', 'own_it' => 'Own It'];
const CURRENCIES = ['MYR', 'USD'];

$DATA = __DIR__ . '/data';

function answer(int $code, array $body): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** A trimmed string field: '' when missing; records 'required', 'too long' or 'markup is not allowed'. */
function text(array $d, string $key, int $limit, array &$errors, bool $required = true): string
{
    $v = isset($d[$key]) && is_string($d[$key]) ? trim($d[$key]) : '';
    if ($required && $v === '') {
        $errors[$key] = 'required';
    } elseif (mb_strlen($v) > $limit) {
        $errors[$key] = 'too long';
    } elseif (preg_match('/<\s*[a-z!\/]/i', $v)) {
        $errors[$key] = 'markup is not allowed';
    }
    return $v;
}

function is_email(string $v): bool
{
    return (bool) preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/', $v);
}

function utm_of($u): array
{
    $out = [];
    if (is_array($u)) {
        foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $k) {
            if (isset($u[$k]) && is_string($u[$k])) $out[$k] = mb_substr($u[$k], 0, 120);
        }
    }
    return $out;
}

/** The Premium enquiry: the same checks as check_lead() in the pack's serve.py. */
function check_premium(array $d): array
{
    $e = [];
    $lead = [
        'name' => text($d, 'name', 80, $e),
        'email' => text($d, 'email', 120, $e),
        'company' => text($d, 'company', 120, $e),
        'whatsapp' => text($d, 'whatsapp', 30, $e),
        'project_type' => text($d, 'project_type', 30, $e),
        'budget' => text($d, 'budget', 30, $e),
        'timing' => text($d, 'timing', 30, $e),
        'website' => text($d, 'website', 200, $e, false),
        'objective' => text($d, 'objective', 1200, $e),
    ];
    if ($lead['email'] !== '' && !isset($e['email']) && !is_email($lead['email'])) $e['email'] = 'not an email address';
    if ($lead['project_type'] !== '' && !in_array($lead['project_type'], PROJECT_TYPES, true)) $e['project_type'] = 'unknown value';
    if ($lead['budget'] !== '' && !in_array($lead['budget'], BUDGETS, true)) $e['budget'] = 'unknown value';
    if ($lead['timing'] !== '' && !in_array($lead['timing'], TIMINGS, true)) $e['timing'] = 'unknown value';
    if ($lead['whatsapp'] !== '' && strlen(preg_replace('/\D/', '', $lead['whatsapp'])) < 8) $e['whatsapp'] = 'too short';
    if ($lead['website'] !== '' && !preg_match('#^(https?://)?[a-z0-9.\-]+\.[a-z]{2,}(/\S*)?$#i', $lead['website'])) $e['website'] = 'not a web address';
    $needs = isset($d['needs']) && is_array($d['needs']) ? array_slice(array_values(array_filter($d['needs'], 'is_string')), 0, 20) : [];
    if (!$needs) {
        $e['needs'] = 'required';
    } else {
        foreach ($needs as $n) { if (!in_array($n, NEEDS, true)) { $e['needs'] = 'unknown value'; break; } }
    }
    $lead['needs'] = $needs;
    // the preferred meeting: a weekday from today to 60 days ahead, 1 of the listed times, 1 of the listed ways
    $lead['meeting_date'] = text($d, 'meeting_date', 10, $e);
    $lead['meeting_time'] = text($d, 'meeting_time', 5, $e);
    $lead['meeting_mode'] = text($d, 'meeting_mode', 12, $e);
    if ($lead['meeting_date'] !== '' && !isset($e['meeting_date'])) {
        $day = DateTime::createFromFormat('!Y-m-d', $lead['meeting_date'], new DateTimeZone('Asia/Kuala_Lumpur'));
        $today = new DateTime('today', new DateTimeZone('Asia/Kuala_Lumpur'));
        if (!$day || $day->format('Y-m-d') !== $lead['meeting_date']) {
            $e['meeting_date'] = 'unknown value';
        } else {
            $ahead = (int) $today->diff($day)->format('%r%a');
            if ((int) $day->format('N') > 5 || $ahead < 0 || $ahead > 60) $e['meeting_date'] = 'unknown value';
        }
    }
    if ($lead['meeting_time'] !== '' && !in_array($lead['meeting_time'], MEET_SLOTS, true)) $e['meeting_time'] = 'unknown value';
    if ($lead['meeting_mode'] !== '' && !in_array($lead['meeting_mode'], MEET_MODES, true)) $e['meeting_mode'] = 'unknown value';
    if (($d['consent_contact'] ?? null) !== true) $e['consent_contact'] = 'required';
    $lead['consent_contact'] = ($d['consent_contact'] ?? null) === true;
    $lead['consent_marketing'] = ($d['consent_marketing'] ?? null) === true;
    $lead['utm'] = utm_of($d['utm'] ?? null);
    return [$lead, $e];
}

/** Where a Premium enquiry should go first (the pack's route_lead). A queue name, not a promise. */
function route_of(array $l): string
{
    $t = $l['project_type']; $b = $l['budget'];
    if (in_array($t, ['portal', 'mobile_app'], true) || in_array($b, ['20_60k', '60k_plus'], true)) return 'solutions';
    if ($b === 'need_guidance') return 'discovery';
    if ($b === 'below_6k' && in_array($t, ['business_site', 'redesign', 'unsure'], true)) return 'starter';
    return 'website_sales';
}

/** The Standard brief, sent while card checkout is off: the package, the contact and the brief as the page collected it. */
function check_launch(array $d): array
{
    $e = [];
    $plan = isset($d['plan']) && is_string($d['plan']) ? $d['plan'] : '';
    if (!isset(PLANS[$plan])) $e['plan'] = 'unknown value';
    $cur = isset($d['currency']) && is_string($d['currency']) ? $d['currency'] : 'MYR';
    if (!in_array($cur, CURRENCIES, true)) $cur = 'MYR';
    $b = isset($d['brief']) && is_array($d['brief']) ? $d['brief'] : [];
    $c = isset($b['contact']) && is_array($b['contact']) ? $b['contact'] : [];
    $contact = ['name' => text($c, 'name', 80, $e), 'email' => text($c, 'email', 120, $e), 'whatsapp' => text($c, 'whatsapp', 30, $e)];
    if ($contact['email'] !== '' && !isset($e['email']) && !is_email($contact['email'])) $e['email'] = 'not an email address';
    if ($contact['whatsapp'] !== '' && strlen(preg_replace('/\D/', '', $contact['whatsapp'])) < 8) $e['whatsapp'] = 'too short';
    if (($d['terms'] ?? null) !== true) $e['terms'] = 'required';
    // the rest of the brief: plain text and short lists only, cut to size
    $clean = function ($v, int $depth = 0) use (&$clean) {
        if (is_string($v)) return mb_substr(strip_tags($v), 0, 1200);
        if (is_bool($v) || is_int($v) || is_float($v)) return $v;
        if (is_array($v) && $depth < 3) { $o = []; foreach (array_slice($v, 0, 30, true) as $k => $x) { $o[is_int($k) ? $k : mb_substr((string) $k, 0, 40)] = $clean($x, $depth + 1); } return $o; }
        return null;
    };
    $brief = $clean($b);
    $brief['contact'] = $contact;
    $lead = ['plan' => $plan, 'plan_name' => PLANS[$plan] ?? '', 'currency' => $cur, 'brief' => $brief,
             'consent_marketing' => ($d['marketing'] ?? null) === true, 'utm' => utm_of($d['utm'] ?? null)];
    return [$lead, $e];
}

/** POST to an outside address; returns [http status, body] or [0, error]. */
function post_out(string $url, string $body, array $headers): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 6]);
        $out = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        return [$code, $out === false ? $err : (string) $out];
    }
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $body, 'timeout' => 12, 'ignore_errors' => true]]);
    $out = @file_get_contents($url, false, $ctx);
    $code = isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m) ? (int) $m[1] : 0;
    return [$code, $out === false ? 'request failed' : $out];
}

/** The lead as readable rows: label => text. */
function rows_of(string $kind, array $l): array
{
    if ($kind === 'premium') {
        return ['Name' => $l['name'], 'Email' => $l['email'], 'WhatsApp' => $l['whatsapp'], 'Company' => $l['company'],
                'Website' => $l['website'] ?: '-', 'Project' => $l['project_type'], 'Needs' => implode(', ', $l['needs']),
                'Budget' => $l['budget'], 'Timing' => $l['timing'], 'Objective' => $l['objective'],
                'Meeting' => $l['meeting_date'] . ' ' . $l['meeting_time'] . ' (' . $l['meeting_mode'] . ')',
                'Marketing emails' => $l['consent_marketing'] ? 'yes' : 'no', 'Route' => $l['route'],
                'Campaign' => $l['utm'] ? http_build_query($l['utm'], '', ', ') : '-'];
    }
    $b = $l['brief']; $c = $b['contact'];
    $flat = function ($v) { return is_array($v) ? implode(', ', array_map(function ($x) { return is_array($x) ? implode(' / ', $x) : (string) $x; }, $v)) : (string) $v; };
    $biz = isset($b['business']) && is_array($b['business']) ? $b['business'] : [];
    $refs = isset($b['references']) && is_array($b['references']) ? $b['references'] : [];
    $dom = isset($b['domain']) && is_array($b['domain']) ? $b['domain'] : [];
    return ['Name' => $c['name'], 'Email' => $c['email'], 'WhatsApp' => $c['whatsapp'], 'Package' => $l['plan_name'] . ' (' . $l['currency'] . ')',
            'Business' => $flat($biz['name'] ?? ''), 'What they do' => $flat($biz['what'] ?? ''), 'Industry' => $flat($biz['industry'] ?? ''),
            'Pages and features' => $flat($b['include'] ?? ''), 'Style' => $flat($b['style'] ?? ''), 'Colours' => $flat($b['colours'] ?? ''),
            'References' => $flat($refs['builds'] ?? '') . ($flat($refs['links'] ?? '') !== '' ? ' | ' . $flat($refs['links']) : ''),
            'Competitors' => $flat($refs['competitors'] ?? ''), 'Domain' => $flat($dom['choice'] ?? '') . ($flat($dom['name'] ?? '') !== '' ? ': ' . $flat($dom['name']) : ''),
            'Notes' => $flat($b['notes'] ?? ''), 'Marketing emails' => $l['consent_marketing'] ? 'yes' : 'no',
            'Campaign' => $l['utm'] ? http_build_query($l['utm'], '', ', ') : '-', 'Next step' => 'Card checkout is off: contact them to confirm the package and take payment'];
}

// ---- the request ----
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') answer(405, ['ok' => false, 'error' => 'Method not allowed']);
$kind = ($_GET['kind'] ?? '') === 'launch' ? 'launch' : (($_GET['kind'] ?? '') === 'premium' ? 'premium' : '');
if ($kind === '') answer(404, ['ok' => false, 'error' => 'not found']);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) answer(415, ['ok' => false, 'error' => 'send JSON']);
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
if ($raw === false || $raw === '' || strlen($raw) > MAX_BODY) answer(413, ['ok' => false, 'error' => 'request too large or empty']);
$data = json_decode($raw, true);
if (!is_array($data)) answer(400, ['ok' => false, 'error' => 'invalid JSON']);

// bots fill the hidden field: a normal answer, nothing kept or sent
if (!empty($data['company_website'])) answer(200, ['ok' => true, 'id' => null, 'route' => 'website_sales']);

// at most RATE_MAX enquiries per address per RATE_WINDOW
if (!is_dir($DATA)) @mkdir($DATA, 0750, true);
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? '0');
$rateFile = $DATA . '/rate-' . substr(hash('sha256', $ip), 0, 16) . '.txt';
$now = time();
$hits = is_file($rateFile) ? array_filter(array_map('intval', explode(',', (string) file_get_contents($rateFile))), function ($t) use ($now) { return $now - $t < RATE_WINDOW; }) : [];
if (count($hits) >= RATE_MAX) answer(429, ['ok' => false, 'error' => 'Too many enquiries from this connection. Please try again in a few minutes.']);
$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);

[$lead, $errors] = $kind === 'premium' ? check_premium($data) : check_launch($data);
if ($errors) answer(422, ['ok' => false, 'errors' => $errors]);

$lead['id'] = bin2hex(random_bytes(8));
$lead['kind'] = $kind;
$lead['received_at'] = (new DateTime('now', new DateTimeZone('Asia/Kuala_Lumpur')))->format('Y-m-d H:i:s');
$lead['page'] = $kind === 'premium' ? 'https://brandmethod.co/premium-website/#start' : 'https://brandmethod.co/quickhook-website/#start';
if ($kind === 'premium') $lead['route'] = route_of($lead);

// 1. keep it here first, so nothing is lost if a send fails
$kept = @file_put_contents($DATA . '/leads.jsonl', json_encode($lead, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);
if ($kept === false) {
    error_log('[sales-leads] could not write ' . $DATA . '/leads.jsonl');
    answer(500, ['ok' => false, 'error' => 'That did not send. Please try again, or email hello@brandmethod.co.']);
}

// 2. the inbox and the sheet, like the other forms on the site
if (getenv('BM_LEADS_DRY') !== '1') {
    $rows = rows_of($kind, $lead);
    $formName = $kind === 'premium' ? 'Premium website enquiry' : 'Standard website brief';
    $subject = $formName . ': ' . ($kind === 'premium' ? $lead['company'] . ' (' . $lead['name'] . ')' : $lead['brief']['contact']['name'] . ', ' . $lead['plan_name']);
    $email = array_merge(['_subject' => $subject, '_cc' => FORMSUBMIT_CC, '_template' => 'table', '_captcha' => 'false',
                          '_replyto' => $kind === 'premium' ? $lead['email'] : $lead['brief']['contact']['email']], $rows, ['Page' => $lead['page'], 'Lead id' => $lead['id']]);
    [$c1, $b1] = post_out(FORMSUBMIT_URL, (string) json_encode($email, JSON_UNESCAPED_UNICODE),
        ['Content-Type: application/json', 'Accept: application/json', 'Referer: ' . $lead['page'], 'Origin: https://brandmethod.co']);
    if ($c1 !== 200 || strpos($b1, '"success":"true"') === false && strpos($b1, '"success":true') === false) error_log('[sales-leads] FormSubmit ' . $c1 . ': ' . substr($b1, 0, 200));
    $sheet = array_merge(['form' => $formName, 'subject' => $subject], $rows, ['Page' => $lead['page']]);
    [$c2, $b2] = post_out(SHEET_URL, http_build_query($sheet), ['Content-Type: application/x-www-form-urlencoded']);
    if ($c2 < 200 || $c2 >= 400) error_log('[sales-leads] Sheet ' . $c2 . ': ' . substr($b2, 0, 200));
}

answer(200, ['ok' => true, 'id' => $lead['id'], 'route' => $lead['route'] ?? 'website_sales']);
