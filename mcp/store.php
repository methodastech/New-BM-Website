<?php
/**
 * Where the MCP reads the site from and saves its changes.
 *
 *   GitHubStore  the live setup: reads the branch Cloudways pulls and commits straight to it
 *   LocalStore   for testing: reads and writes a folder on disk
 *
 * A change is one commit: every page, project list and picture of one edit land together.
 */

interface Store
{
    /** A file's content, or null if there is none. */
    public function read(string $path): ?string;

    /** Save the changes (path => content, or null to delete) as one commit; returns where to see it. */
    public function commit(array $changes, string $message): string;
}

class LocalStore implements Store
{
    private string $root;

    public function __construct(string $root)
    {
        $this->root = $root;
    }

    public function read(string $path): ?string
    {
        $f = $this->root . '/' . $path;
        return is_file($f) ? file_get_contents($f) : null;
    }

    public function commit(array $changes, string $message): string
    {
        foreach ($changes as $path => $content) {
            $f = $this->root . '/' . $path;
            if ($content === null) {
                @unlink($f);
                continue;
            }
            @mkdir(dirname($f), 0775, true);
            file_put_contents($f, $content);
        }
        return 'saved in ' . $this->root;
    }
}

class GitHubStore implements Store
{
    private string $token;
    private string $repo;
    private string $branch;
    private ?string $base = null;   // the commit this edit started from
    private array $cache = [];

    public function __construct(string $token, string $repo, string $branch)
    {
        $this->token = $token;
        $this->repo = $repo;
        $this->branch = $branch;
    }

    private function api(string $method, string $url, ?array $body = null, bool $raw = false): array
    {
        $ch = curl_init(str_starts_with($url, 'https://') ? $url : "https://api.github.com/repos/{$this->repo}/$url");
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_HTTPHEADER => array_filter([
                'Authorization: Bearer ' . $this->token,
                'Accept: ' . ($raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json'),
                'X-GitHub-Api-Version: 2022-11-28',
                'User-Agent: brandmethod-portfolio-mcp',
                $body === null ? null : 'Content-Type: application/json',
            ]),
            CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body),
        ]);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($res === false) {
            throw new RuntimeException('GitHub could not be reached: ' . $err);
        }
        return [$code, $raw ? $res : json_decode($res, true)];
    }

    private function base(): string
    {
        if ($this->base === null) {
            [$code, $ref] = $this->api('GET', "git/ref/heads/{$this->branch}");
            if ($code !== 200) {
                throw new RuntimeException("GitHub: the branch {$this->branch} was not found ($code). Check the token and repo in mcp/config.php.");
            }
            $this->base = $ref['object']['sha'];
        }
        return $this->base;
    }

    public function read(string $path): ?string
    {
        if (array_key_exists($path, $this->cache)) {
            return $this->cache[$path];
        }
        [$code, $res] = $this->api('GET', 'contents/' . str_replace('%2F', '/', rawurlencode($path)) . '?ref=' . $this->base(), null, true);
        if ($code === 404) {
            return $this->cache[$path] = null;
        }
        if ($code !== 200) {
            throw new RuntimeException("GitHub: could not read $path ($code)");
        }
        return $this->cache[$path] = $res;
    }

    public function commit(array $changes, string $message): string
    {
        $base = $this->base();
        [, $commit] = $this->api('GET', "git/commits/$base");
        $tree = [];
        foreach ($changes as $path => $content) {
            if ($content === null) {
                $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => null];
                continue;
            }
            [$code, $blob] = $this->api('POST', 'git/blobs', ['content' => base64_encode($content), 'encoding' => 'base64']);
            if ($code !== 201) {
                throw new RuntimeException("GitHub: could not upload $path ($code)");
            }
            $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['sha']];
        }
        [$code, $newTree] = $this->api('POST', 'git/trees', ['base_tree' => $commit['tree']['sha'], 'tree' => $tree]);
        if ($code !== 201) {
            throw new RuntimeException("GitHub: could not build the commit ($code)");
        }
        [$code, $new] = $this->api('POST', 'git/commits', ['message' => $message, 'tree' => $newTree['sha'], 'parents' => [$base]]);
        if ($code !== 201) {
            throw new RuntimeException("GitHub: could not create the commit ($code)");
        }
        [$code] = $this->api('PATCH', "git/refs/heads/{$this->branch}", ['sha' => $new['sha'], 'force' => false]);
        if ($code === 422) {
            throw new ConflictException('someone else saved a change at the same moment');
        }
        if ($code !== 200) {
            throw new RuntimeException("GitHub: could not move {$this->branch} to the new commit ($code)");
        }
        return $new['html_url'];
    }

    /** Start over from the branch's newest commit (after a conflict). */
    public function refresh(): void
    {
        $this->base = null;
        $this->cache = [];
    }
}

class ConflictException extends RuntimeException
{
}

// ------------------------------------------------------------------ putting a change live

/** Work to do after the reply has gone to Claude (index.php runs it). */
function bm_after(callable $f): void
{
    $GLOBALS['BM_AFTER'][] = $f;
}

function bm_cloudways_on(?array $cw): bool
{
    return !empty($cw['token']) || !empty($cw['api_key']);
}

function bm_state(string $name): string
{
    @mkdir(__DIR__ . '/state', 0775, true);
    return __DIR__ . "/state/$name";
}

function bm_pull_status(): array
{
    $f = bm_state('pull.json');
    return is_file($f) ? (json_decode(file_get_contents($f), true) ?: []) : [];
}

function bm_pull_note(array $changes): void
{
    file_put_contents(bm_state('pull.json'), json_encode($changes + bm_pull_status()));
}

/** One request to Cloudways to pull the branch: [HTTP code, what Cloudways said]. */
function cloudways_pull_once(array $cw): array
{
    $base = rtrim($cw['api'] ?? 'https://api.cloudways.com/api/v1', '/');
    $post = function (string $url, array $form, ?string $token = null) use ($base) {
        $ch = curl_init("$base/$url");
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60,
            CURLOPT_POSTFIELDS => http_build_query($form),
            CURLOPT_HTTPHEADER => $token ? ['Authorization: Bearer ' . $token] : []]);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$code, (string)$res];
    };
    $token = $cw['token'] ?? '';
    if ($token === '') {   // the older login: email and API key for a short-lived token
        [$code, $res] = $post('oauth/access_token', ['email' => $cw['email'], 'api_key' => $cw['api_key']]);
        $token = json_decode($res, true)['access_token'] ?? '';
        if ($code !== 200 || $token === '') {
            return [$code, 'the API key was not accepted'];
        }
    }
    [$code, $res] = $post('git/pull', ['server_id' => $cw['server_id'], 'app_id' => $cw['app_id'], 'git_url' => $cw['git_url'],
        'branch_name' => $cw['branch'], 'deploy_path' => $cw['deploy_path'] ?? ''], $token);
    return [$code, substr(trim(preg_replace('/\s+/', ' ', $res)), 0, 300)];
}

/** Note that the newest commit should go live, and pull once the reply has gone. */
function bm_want_live(array $cw): void
{
    touch(bm_state('wanted'));
    bm_after(function () use ($cw) {
        bm_pull_loop($cw);
    });
}

/**
 * Keep asking Cloudways to pull until it takes the newest change. Cloudways refuses a pull (429)
 * while another is running or when asked too often, so it waits and tries again for about six minutes.
 * One request pulls at a time: changes saved meanwhile go out with its next pull.
 */
function bm_pull_loop(array $cw): void
{
    ignore_user_abort(true);
    set_time_limit(900);
    $lock = fopen(bm_state('pull.lock'), 'c');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
        return;   // another request is pulling, and will see the new change
    }
    $waits = $cw['waits'] ?? [0, 20, 30, 45, 60, 90, 120];
    while (true) {
        clearstatcache();
        $wanted = (int)@filemtime(bm_state('wanted'));
        if ($wanted <= (int)(bm_pull_status()['pulled_for'] ?? 0)) {
            break;
        }
        $ok = false;
        foreach ($waits as $w) {
            sleep($w);
            clearstatcache();
            $wanted = (int)@filemtime(bm_state('wanted'));
            [$code, $said] = cloudways_pull_once($cw);
            if ($code === 200) {
                $ok = true;
                break;
            }
            bm_pull_note(['last_refusal' => "$code $said", 'last_refusal_at' => time()]);
            error_log("portfolio mcp: cloudways pull $code $said");
            if ($code !== 429 && $code < 500) {
                break;   // a wrong token or setting: asking again will not help
            }
        }
        if (!$ok) {
            bm_pull_note(['gave_up_at' => time()]);
            break;
        }
        bm_pull_note(['pulled_for' => $wanted, 'pulled_at' => time()]);
        sleep($cw['settle'] ?? 20);   // let Cloudways finish before a change saved meanwhile is pulled
    }
    flock($lock, LOCK_UN);
    fclose($lock);
}

/** What the person is told after a save. */
function bm_live_note(array $cfg): string
{
    if (($cfg['mode'] ?? '') !== 'github') {
        return '';
    }
    if (!bm_cloudways_on($cfg['cloudways'] ?? null)) {
        return 'Press Pull in Cloudways (Deployment via Git) to put it on the site.';
    }
    bm_want_live($cfg['cloudways']);
    return 'It goes live by itself in a minute or two. If Cloudways is busy, the MCP keeps trying for a few minutes; put_live shows whether it is live yet.';
}
