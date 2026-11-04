<?php
/**
 * The Brand Method portfolio MCP: the address Claude connects to (claude.ai > Settings > Connectors >
 * Add custom connector), e.g. https://brandmethod.co/mcp/?key=<the key in mcp/config.php>.
 *
 * It speaks MCP over plain HTTP: each request is one JSON-RPC message (or a batch), each answer is JSON.
 * Setup and the team's guide: mcp/README.md.
 */
require __DIR__ . '/tools.php';

const BM_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];

function bm_reply(int $status, $body = null): void
{
    http_response_code($status);
    $out = $body === null ? '' : json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($body !== null) {
        header('Content-Type: application/json');
    }
    header('Content-Length: ' . strlen($out));
    echo $out;
    // then the work that waits for nobody, like asking Cloudways to pull (bm_after)
    if (!empty($GLOBALS['BM_AFTER'])) {
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        } else {
            @ob_end_flush();
            flush();
        }
        foreach ($GLOBALS['BM_AFTER'] as $f) {
            try {
                $f();
            } catch (Throwable $e) {
                error_log('portfolio mcp: after reply: ' . $e->getMessage());
            }
        }
    }
    exit;
}

$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) {
    bm_reply(503, ['error' => 'mcp/config.php is not set up yet (copy config.sample.php)']);
}
$cfg = require $cfgFile;

// the key: in the address (?key=) or as a bearer token
$given = $_GET['key'] ?? (preg_match('/^Bearer\s+(.+)$/i', $_SERVER['HTTP_AUTHORIZATION'] ?? '', $m) ? $m[1] : '');
if (strlen($cfg['key']) < 24 || !hash_equals($cfg['key'], (string)$given)) {
    bm_reply(401, ['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32001, 'message' => 'Wrong or missing key']]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    bm_reply(405);
}

set_time_limit(300);
$store = $cfg['mode'] === 'github'
    ? new GitHubStore($cfg['github']['token'], $cfg['github']['repo'], $cfg['github']['branch'])
    : new LocalStore($cfg['root']);

function bm_handle(array $msg, Store $store, array $cfg): ?array
{
    $id = $msg['id'] ?? null;
    $method = $msg['method'] ?? '';
    $ok = fn($result) => ['jsonrpc' => '2.0', 'id' => $id, 'result' => $result];
    if (!array_key_exists('id', $msg)) {   // a notification: nothing to answer
        return null;
    }
    switch ($method) {
        case 'initialize':
            $asked = $msg['params']['protocolVersion'] ?? '';
            return $ok([
                'protocolVersion' => in_array($asked, BM_PROTOCOLS, true) ? $asked : BM_PROTOCOLS[0],
                'capabilities' => ['tools' => ['listChanged' => false]],
                'serverInfo' => ['name' => 'brandmethod-portfolio', 'version' => '1.0.0'],
                'instructions' => "This edits the Brand Method website's portfolio: the Branding grid on the Work page (each project with a case page), "
                    . "the Logo Gallery and the Mascot Gallery. Every add, update, move or remove goes live as soon as Cloudways pulls it, so "
                    . "before saving, show the person the text you will publish and get a yes; before remove_project, always confirm. "
                    . "Pictures: a picture attached in this chat cannot be passed to these tools. Whenever a picture or film is needed, "
                    . "call get_upload_link straight away and give the person the link: they drop the files there and paste back the codes "
                    . "(like u3f9a0c1d). A public link, such as a Google Drive share link, also works. If they attach a picture in the chat, "
                    . "say it has to go through the upload link and give it to them. "
                    . "Going live: after a save, Cloudways pulls the change by itself within a few minutes. If the person says it is not showing, "
                    . "call put_live. Never make an extra edit just to set off an update, and never use a browser or any other tool to open Cloudways. "
                    . "Write card lines as one plain sentence, no marketing exclamation; keep tags to two or three. "
                    . "Start with list_projects to see ids, order and the Branding categories.",
            ]);
        case 'ping':
            return $ok(new stdClass());
        case 'tools/list':
            return $ok(['tools' => bm_tools()]);
        case 'tools/call':
            $name = $msg['params']['name'] ?? '';
            $args = $msg['params']['arguments'] ?? [];
            try {
                $text = bm_call($name, is_array($args) ? $args : [], $store, $cfg);
                return $ok(['content' => [['type' => 'text', 'text' => $text]], 'isError' => false]);
            } catch (Throwable $e) {
                error_log('portfolio mcp: ' . $name . ': ' . $e->getMessage());
                return $ok(['content' => [['type' => 'text', 'text' => 'Not saved: ' . $e->getMessage()]], 'isError' => true]);
            }
    }
    return ['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => -32601, 'message' => "Unknown method $method"]];
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    bm_reply(400, ['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32700, 'message' => 'Not JSON']]);
}
if (array_is_list($in)) {   // a batch
    $out = array_values(array_filter(array_map(fn($m) => is_array($m) ? bm_handle($m, $store, $cfg) : null, $in)));
    $out ? bm_reply(200, $out) : bm_reply(202);
}
$res = bm_handle($in, $store, $cfg);
$res === null ? bm_reply(202) : bm_reply(200, $res);
