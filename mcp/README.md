# Portfolio MCP

Lets the branding team change the website's portfolio by asking Claude: the Branding grid on
the Work page (each project with its own case page), the Logo Gallery and the Mascot Gallery.

Every change is committed straight to GitHub. Cloudways then pulls it, either when someone
presses Pull or automatically if the Cloudways API is set up.

## How it fits together

```
designer ── claude.ai ── https://brandmethod.co/mcp/?key=…   (this folder, on Cloudways)
                                  │ reads and commits through the GitHub API
                                  ▼
                       github.com/methodastech/New-BM-Website  (branch Cloudways pulls)
                                  │ Pull (by hand, or automatic)
                                  ▼
                            brandmethod.co
```

- The projects live in `portfolio/data/branding.json`, `logos.json` and `mascots.json`.
- `portfolio/lib.php` builds the cards, the counts, the "Next project" links and new case
  pages from those lists.
- The MCP and the local command (`php portfolio/build.php`) use the same code.

## Set it up (once)

1. **Push this code** to the branch Cloudways pulls, and press Pull. The MCP edits whatever is
   on GitHub, so GitHub has to be up to date first.
2. **Check PHP on Cloudways.** It needs PHP 8.1 or newer, with the GD extension and WebP. Both
   are on by default on Cloudways, and the version is under Application Settings. For films,
   raise `upload_max_filesize` and `post_max_size` to 64M (Application Settings > PHP-FPM).
3. **Make a GitHub token.**
   - Go to github.com > Settings > Developer settings > Fine-grained tokens.
   - Choose the repository `methodastech/New-BM-Website` only.
   - Give it "Contents: Read and write".
4. **Create `mcp/config.php` on the server.** Copy `config.sample.php` over SFTP and fill in:
   - `key`: a long random password. Make one with `php -r "echo bin2hex(random_bytes(24));"`.
   - `github.token`: the token from step 3.
   - `github.branch`: the branch Cloudways pulls.

   `config.php` is in `.gitignore`, so pulls never overwrite it and it never reaches GitHub.
5. **Optional: automatic Pull.** Fill in the `cloudways` block with the API key from
   Cloudways > Account > API, the server ID, the app ID and the deploy path. Changes then go
   live within a minute, with no one pressing Pull.
6. **Add the connector in claude.ai.**
   - Go to Settings > Connectors > Add custom connector.
   - Name it "Brand Method Portfolio".
   - Use the URL `https://brandmethod.co/mcp/?key=<the key>`.

   Share it with the team (Team or Enterprise plans), or have each designer add it.
7. **Test it.** Ask Claude "list the mascot gallery". Then make one small change, for example
   moving a logo, and check it on the site after the Pull.

## Using it (for the branding team)

Talk to Claude normally, for example:

- "Show me the Branding projects in order."
- "Add Koji to the Logo Gallery, category F&B, first place." Claude then asks for the image.
- "Add a new branding project for Koji Studio." Claude asks for the card text, the tags, the
  brand colour, a cover image, and the case page's hero, story and pictures.
- "Move Firmus to place 3." "Change Go Bunny's line to …." "Remove Test Project."

For pictures, Claude gives you an upload link. Drop the files there, and each one gets a code
like `u3f9a0c1d` to paste back to Claude. Public links and Google Drive share links also work.

- Pictures are converted to WebP and resized automatically.
- Mascots need a cut-out on a transparent background (PNG or WebP).
- Films must be MP4.

Changes go live straight away (after the Pull), so read what Claude shows you before you
say yes.

## What it can and cannot do

- **Branding:** you can add, edit, move or remove a project. A new project gets a case page
  built from the template: hero, About the project, statement, then blocks of full-width
  pictures, picture pairs, films, notes and a colour palette.

  The 22 projects that were already on the site have designed case pages. The MCP can change
  their cards, order and "Next project" links, but the case pages themselves stay with the
  web team.
- **Logos and mascots:** you can add, edit, move or remove cards. New mascots use the
  floating cut-out style (as Clean Pro, Spirochi and Go Bunny do). The animated and video
  cards stay as designed unless you give one a new picture.
- **Counts:** the Branding filter counts and the counts on the Work hub, the Logo Gallery
  intro and the menu update by themselves. The menu takes its counts from `BM_COUNTS` in
  `js/layout.js`.
- **Not covered:** the site search overlay's list and `sitemap.xml` don't get new projects.
  Case pages aren't in the sitemap today either.

## For the web team

- **Pull before you work locally.** The MCP commits to GitHub, so `git pull` before editing,
  or your push will clash with the team's changes.
- **Re-running the design-export port.** `tools/build-work-1031.py` ends by running
  `php portfolio/build.php`, so the project lists win over the export's cards. A project
  that's new in the export has to be added to the lists. Either add it with the MCP, or run
  `php portfolio/extract.php --write` right after the port.

  Only run the extract before anyone has edited through the MCP since the last build,
  because it replaces the lists with what the pages show.
- **Trying it on a computer.** Set `'mode' => 'local'` in `config.php` and run
  `php -d extension=gd -S localhost:8811` in the site folder. The address is then
  `http://localhost:8811/mcp/index.php?key=…`.
