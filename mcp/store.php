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
    public function __construct(private string $root)
    {
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
    private ?string $base = null;   // the commit this edit started from
    private array $cache = [];

    public function __construct(private string $token, private string $repo, private string $branch)
    {
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

/** Ask Cloudways to pull the branch, if mcp/config.php has the Cloudways API details. */
function cloudways_pull(?array $cw): ?string
{
    if (empty($cw['api_key'])) {
        return null;
    }
    $post = function (string $url, array $form, ?string $token = null) {
        $ch = curl_init("https://api.cloudways.com/api/v1/$url");
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60,
            CURLOPT_POSTFIELDS => http_build_query($form),
            CURLOPT_HTTPHEADER => $token ? ['Authorization: Bearer ' . $token] : []]);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$code, json_decode((string)$res, true)];
    };
    [$code, $auth] = $post('oauth/access_token', ['email' => $cw['email'], 'api_key' => $cw['api_key']]);
    if ($code !== 200 || empty($auth['access_token'])) {
        return 'Cloudways did not accept the API key, so the site was not pulled. Press Pull in Cloudways.';
    }
    [$code] = $post('git/pull', ['server_id' => $cw['server_id'], 'app_id' => $cw['app_id'], 'git_url' => $cw['git_url'],
        'branch_name' => $cw['branch'], 'deploy_path' => $cw['deploy_path'] ?? ''], $auth['access_token']);
    return $code === 200 ? 'Cloudways is pulling it now; the site updates in a minute.'
                         : "Cloudways did not start the pull ($code). Press Pull in Cloudways.";
}
