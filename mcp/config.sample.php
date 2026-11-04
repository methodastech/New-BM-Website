<?php
/**
 * Copy this file to mcp/config.php on the server and fill it in. config.php is not in git
 * (it holds the key and the GitHub token), so Cloudways' pulls never touch it.
 */
return [
    // The password in the connector address: https://brandmethod.co/mcp/?key=<this>. At least 24 characters;
    // make one with: php -r "echo bin2hex(random_bytes(24));"
    'key' => '',

    // 'github': the live setup, commits straight to the branch Cloudways pulls.
    // 'local': reads and writes the folder in 'root' instead (for trying it out on a computer).
    'mode' => 'github',
    'root' => dirname(__DIR__),

    'github' => [
        // A fine-grained token (github.com > Settings > Developer settings > Personal access tokens),
        // for the repository only, with "Contents: Read and write".
        'token' => '',
        'repo' => 'methodastech/New-BM-Website',
        'branch' => 'main',   // the branch Cloudways pulls (Cloudways > Application > Deployment via Git)
    ],

    'site_url' => 'https://brandmethod.co/',

    // Optional: let the MCP press Pull in Cloudways itself, so a change is on the site within a minute.
    // Leave as null to keep pressing Pull by hand. The API key is in Cloudways > Account > API.
    'cloudways' => null,
    /*
    'cloudways' => [
        'email' => '',
        'api_key' => '',
        'server_id' => '',
        'app_id' => '',
        'git_url' => 'git@github.com:methodastech/New-BM-Website.git',
        'branch' => 'main',
        'deploy_path' => '',
    ],
    */
];
