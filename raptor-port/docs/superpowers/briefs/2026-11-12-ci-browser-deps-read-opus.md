# The browser jobs in Playwright's image — the fresh Opus reader's blind read (12 Nov 26, overnight run, job 1)

*(Saved word for word from its final report — a fresh Opus subagent (general-purpose, model opus) that had not seen the builder's reasoning, Astra's report or the conversation; about 14 minutes, 39 tool uses; brief `2026-11-12-ci-browser-deps-read-brief.md`, on `3e6e843aa`, the branch head then. Blind to Astra, whose report sat in a scratch folder outside the checkout. What the host did with each finding, each reasoned or checked against the run first: F1 — the first run in the image printed the fonts (sans-serif Liberation Sans; system-ui, the sign-in card and monospace DejaVu Sans / DejaVu Sans Mono); a missing or empty lent-fonts folder now fails the gate; a gate on the font names and a bare-runner baseline job were not built (no bare-runner readout exists to set them from, and a name gate set from one container run would only restate it) — left for the coordinator; F2 — confirmed for sans-serif (Liberation Sans), not for monospace (the run drew DejaVu Sans Mono, not Liberation Mono); the workflow note and the gates guide reworded to what the run printed; F3 — built (Fix A: `.docker-info`'s `driverVersion` against the installed playwright-core); Fix B, the single source through `needs`, not built; F4 — built (`close()` guarded, and the read-out now its own warning-only step under `timeout`); F5 — the runner was already 26.04 on pull request 760's last green bare run and on this one, so both browser jobs are pinned to `ubuntu-26.04` with the `-resolute` image; the stale `playwright.config.ts` comment and the TZ wording corrected.)*

Blind read of `claude/ci-browser-deps` @ 3e6e843aa (geometry and tracker moved into `mcr.microsoft.com/playwright:v1.62.1-noble`).

**Verdict:** the change should work on GitHub, and every step I traced still works inside the container as uid 1001. I found no fault that makes it fail or loosens a test today. Four findings and three small notes, all fixable before merge. The most important one is that "same fonts as before" is claimed but never measured, and the font check only warns.

No handoff block came into my context. I changed nothing in the repo. Sources I read: Playwright v1.62.1 `Dockerfile.noble`, `nativeDeps.ts`, `dependencies.ts` and `registry/index.ts`; actions/runner `ContainerInfo.cs` and `ContainerOperationProvider.cs`; runner-images `toolset-2404.json` and the Ubuntu 24.04 readme; Chromium `web_preferences.cc`; Debian fontconfig `debian/rules` for 2.15.0-2.3, assumed to match noble's 2.15.0 (noble's own could not be fetched); the GitHub contexts docs and Playwright's CI page. Downloads are in `C:/Users/User/AppData/Local/Temp/claude/f4202d016722bdbc/cb4f03b3-b05a-4aac-84e8-eaf47858fa25/scratchpad/opus-proofs/dl/`.

## Findings, most severe first

### F1 (medium): the fonts are never compared with a baseline, and the readout cannot fail
- **Setup:** the lent folder at `/usr/local/share/fonts/runner` comes up empty or without DejaVu. Causes: Docker silently creates a missing bind source as an empty folder; GitHub changes the runner image; or `ubuntu-latest` moves on (an `ubuntu-26.04` image already exists in runner-images).
- **What happens:** `system-ui` and symbol fallback stop drawing DejaVu Sans and draw Liberation Sans or FreeSans, which are narrower. The width and one-line tests then pass more easily, and nobody is told: the readout only prints, and its failure path is a warning.
- **Why it matters:** the repo's own notes say GitHub's wider letters are what catch faults his PC hides (`geometry.spec.ts` ~5877, `leavewar.spec.ts` LW_WIDE_LETTERS). Goal 2 can be broken silently.
- **Also missing:** the old path never printed a readout, so nothing in the logs proves "the same set as before".
- **Fix:**
  1. Take a baseline once on a bare runner, in a throwaway branch or `workflow_dispatch` job on `ubuntu-latest` with no container. Steps: checkout, setup-node 22, `npm ci`, then `npx playwright install --with-deps chromium` (or `npx playwright install chromium` if Ubuntu's servers are still down), then `node scripts/ci/browser-image-check.cjs` and `fc-list : family | sort -u`.
  2. Run `fc-list : family | sort -u` once in the container job too, and diff the two lists. `fc-list` is very likely in the image, since `libpangoft2` depends on `fontconfig`.
  3. Turn the readout into a gate for the families that decide measurements. After the loop in `browser-image-check.cjs`, collect each first `familyName` into `got[label]`, then add:
     ```js
     const want = { 'sans-serif': 'Liberation Sans', 'system-ui': 'DejaVu Sans', 'monospace': 'Liberation Mono' } // values from step 1's baseline
     const off = Object.entries(want).filter(([k, v]) => got[k] !== v)
     if (off.length) { console.log(`::error::Fonts differ from the bare runner's: ${off.map(([k, v]) => `${k} drew ${got[k]}, expected ${v}`).join('; ')}`); process.exitCode = 1 }
     ```
     Put this outside the warning-only `catch`, so a launch failure still only warns but a wrong font fails.
  4. Optionally also print `find /usr/local/share/fonts/runner -xtype l | wc -l`. This counts broken symlinks: an absolute or `../../..` link in the runner's folder breaks once mounted at a different path. I could not list the runner's files from here.

### F2 (low–medium, the documentation is wrong in a way that misleads a reader): sans-serif and monospace were probably not DejaVu
- **The claim:** the workflow note and the `gates-and-deploy.md` lines say sans-serif and monospace drew DejaVu on the bare runner.
- **What Chromium actually does:** its built-in defaults (`web_preferences.cc`) are sans-serif → "Arial" and monospace (fixed) → "Courier New". Skia then accepts fontconfig's metric twins. So sans-serif almost certainly drew **Liberation Sans** and monospace **Liberation Mono**.
- **Where DejaVu really matters:** `system-ui` (Chromium takes it from fontconfig's "sans", and the 60-latin list puts DejaVu Sans first) and the fallback for symbols such as ✎, ☰ and ⋯. `system-ui` is used by the Leave War's balances CSS and the sign-in card.
- **The repo's own tests agree:** `inputrange-leavewar.spec.ts:13` and `wholeleave-leavewar.spec.ts:54` say "GitHub's Linux machines (Liberation Sans)".
- **Consequence:** the first readout will likely print Liberation Sans for sans-serif. A reader told to "compare them first" may think the lending failed. The mount is still needed, for `system-ui` and fallback.
- **Fix:** once the first container run prints the real values, reword the `deploy.yml` note bullet, the `gates-and-deploy.md` §Now bullet and the §How the gates lie addendum. Say that sans-serif and monospace draw Liberation Sans and Liberation Mono, which are in the image anyway, and that `system-ui` and symbol fallback draw DejaVu Sans, which comes from the runner's lent fonts.

### F3 (low): the tag check compares browser builds, not versions; there is a better single source
- **What the check really does:** `chromium.executablePath()` is `/ms-playwright/chromium-<rev>/chrome-linux64/chrome`. It is missing only when the browser build changes.
- **The gap:** a Playwright bump that keeps the same Chromium build (common for patch releases) passes, and the tag drifts. The docs say the check "stops the job … when they differ", which is not strictly true.
- **What the check does not cover:** it checks the full Chromium, while headless tests launch `chromium_headless_shell-<rev>`. The Dockerfile installs both together, and the readout's `chromium.launch()` exercises the headless shell, so that risk is small.
- **Fix A (exact version):** the image carries `/ms-playwright/.docker-info`. It is written by `mark-docker-image` (`dependencies.ts:33`) and is outside the folder the Dockerfile deletes. In the script, after `exe`:
  ```js
  let img = null; try { img = JSON.parse(fs.readFileSync('/ms-playwright/.docker-info', 'utf8')).driverVersion } catch {}
  if (img !== version) { console.log(`::error::Image is Playwright ${img}, package-lock has ${version}. Set both browser jobs' image to mcr.microsoft.com/playwright:v${version}-noble.`); process.exit(1) }
  ```
- **Fix B (one source):** `jobs.<id>.container` accepts the `needs` context (confirmed in GitHub's context-availability table).
  1. In the `changes` job, add `/raptor-port/package-lock.json` to its sparse-checkout.
  2. Add the output `pw: ${{ steps.v.outputs.pw }}`.
  3. Add a step `id: v` that runs: `echo "pw=$(node -p "require('./raptor-port/package-lock.json').packages['node_modules/playwright-core'].version")" >> "$GITHUB_OUTPUT"`. It must run on both PR and push events.
  4. In both browser jobs, set `image: mcr.microsoft.com/playwright:v${{ needs.changes.outputs.pw }}-noble`.
  5. Keep Fix A as the backstop.

### F4 (low): one unguarded line can fail the step that is meant only to warn
- **Cause:** in `browser-image-check.cjs`, `finally { if (browser) await browser.close() }` sits outside the `catch`.
- **What happens:** if `close()` rejects (for example after the browser crashed), the async function's promise rejects with no handler. Node 22 exits with code 1 and the step fails, contrary to "a failure here only warns".
- **Fix:** `finally { if (browser) await browser.close().catch(() => {}) }`

### F5 (low): the runner can drift from the container's release
- **Cause:** the jobs run on `ubuntu-latest` but in a fixed noble container. When `ubuntu-latest` moves to 26.04, the lent fonts become 26.04's while the fontconfig rules and libraries stay noble's.
- **Fix:** set `runs-on: ubuntu-24.04` on `geometry` and `tracker`, with a one-line note to move it together with the image. Otherwise F1's gate is what catches the drift.

### Smaller notes (no failure)
- **npm cache, first run (info):** setup-node's npm cache runs inside the container. The image very likely has no `zstd` command line tool, so `@actions/cache` falls back to gzip. That makes a different cache version from the bare jobs, so the first container run reports "Cache not found" and saves its own copy after. Speed only.
- **Stale wording (trivial):**
  - The `playwright.config.ts` header says "A CI runner … installs its own browser". It now takes it from the image.
  - `gates-and-deploy.md` says "`TZ=UTC` as the bare runner had". The bare runner had no TZ set; its clock was UTC through `/etc/localtime`. The workflow note words this correctly.
- **The lent-folder listing proves little:** it prints only the top level of the mount (`truetype`, `X11`, …), not that DejaVu is there. F1's `fc-list` or the per-family readout is the real proof.

## Answers to the brief's questions

**1. Fonts.**
- **The font files match.** `install --with-deps chromium` always adds the "tools" group (`registry/index.ts:1097`, `targets.add('tools')`). The image ran `install-deps` for all three browsers, which includes the same tools fonts. The Firefox and WebKit lists add only `libfontconfig1`, no font packages. So the bare runner's set (its own fonts plus tools) equals the container's (image fonts, which are tools plus Liberation, plus the lent runner fonts).
- **Fontconfig reads the mount point.** `/usr/local/share/fonts` is a default fontconfig folder on Debian and Ubuntu (`--with-add-fonts=/usr/local/share/fonts` in Debian's `debian/rules`), and it is searched recursively.
- **Duplicates are harmless.** Liberation and Noto Color Emoji are present on both sides with the same noble files. Where versions differ, fontconfig prefers the higher version, which is the runner's, matching the bare runner.
- **Fontconfig rules:** the container lacks the runner-only rule files, such as `57-dejavu-*` and `20-unhint-small-dejavu-*`. The first is redundant with 60-latin (DejaVu Sans is still first for "sans"). The second has no effect because headless Chromium sets its own hinting. Residual risk is low; F1 settles it.
- **Caches:** `HOME=/github/home` (the runner sets this, `ContainerOperationProvider.cs:314`) is writable by uid 1001, so the user font cache works. The mount is read-only, which fontconfig tolerates.
- **Symlinks:** I could not list the runner's files from here. F1 step 4 settles it.
- **Settle in the log:** the "Browser and fonts" lines should show sans-serif → Liberation Sans, monospace → Liberation Mono, system-ui → DejaVu Sans, and the sign-in card → DejaVu Sans. Then compare with the F1 baseline.

**2. Container mechanics.** I checked every item the brief lists and found no problem.
- **Read-only mount:** `:ro` parses as a read-only mount (`ContainerInfo.cs` `ParseVolumeString`, three parts). The `docker create` line in "Initialize containers" should show the font mount marked `:ro`.
- **User 1001:** it is the runner's user, so the workspace, file-command and home folders are its own and `safe.directory` causes no trouble. In noble, 1001 is `pwuser`, because `ubuntu` takes 1000.
- **Checkout:** the image has git (Dockerfile `apt-get install … git`), so the sparse checkout works rather than falling back to the REST tarball. That fallback would have pulled the pictures.
- **Node:** setup-node uses Node 22 from the toolcache mounted at `/__t`, prepended to PATH, so `node`, `npx` and the shells Playwright's webServer and `smoke.mjs` spawn all run 22. The image's Node 24 sits unused at `/usr/bin`.
- **Browser path:** `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` is set in the image and inherited by every step. `/ms-playwright` is world-writable (777).
- **Locale:** `LANG` and `LC_ALL` are both `C.UTF-8`.
- **CI variable:** the runner passes `CI=true` into container steps, so 3 workers, 1 retry and `reuseExistingServer:false` still apply. Settle: the Playwright log should say "using 3 workers".
- **Servers and output:** the vite preview servers (Playwright's webServer and `smoke.mjs`'s own) bind localhost inside the container as before. `smoke.mjs` spawns with `stdio:'ignore'`, so no orphan holds `docker exec` open. `--init` reaps zombies, and the container is removed at job end. `test-results` is in the workspace.
- **`--ipc=host`:** it shares the host's `/dev/shm`. The sandbox is off by Playwright's default.
- **Job settings:** job conditions, `timeout-minutes`, matrix and sharding are unchanged. `checks-passed.mjs` classifies `deploy.yml` and the `.cjs` as code, so this PR runs the browser jobs itself.
- **If Microsoft's registry is down:** the jobs fail at "Initialize containers" after 3 pull attempts (`ContainerOperationProvider.cs:198-223`), with no fallback. That is one dependency in place of Ubuntu's servers plus Playwright's download site on a cache miss, so no worse.

**3. The tag written twice.** The check stops a mismatch only when the browser build changes (F3). The `.docker-info` exact compare plus a lockfile-derived tag through `needs` is the better single source.

**4. Time zone and language.**
- **Before:** the runner has `tzdata` with `/etc/localtime` at Etc/UTC; Node and V8 report "UTC".
- **After:** `TZ=UTC` is set at container creation, so every step and Chromium inherit it. glibc, Node's ICU and Chromium's ICU all read UTC even if the image has no tzdata. The image's build-time `ARG TZ=America/Los_Angeles` is overridden.
- **Language:** both sides are `C.UTF-8`, so Chromium and Node fall back to en-US. The `<input type=time>` test asserts the box's CSS width (≥128), not the drawn text, so it does not depend on locale.
- **Settle:** the readout line "Node UTC / en-US, Chromium UTC / en-US".

**5. Anything else.** F2–F5 and the notes above. The image layout matches the builder's description: the headless shell is installed together with chromium (Dockerfile step 3), and the image is noble with `LANG` and `LC_ALL` set.

## Checked, nothing found
- The volume syntax with `:ro`; `HOME`; the user and workspace ownership; git in the image; the Node 22 PATH order; `PLAYWRIGHT_BROWSERS_PATH` reaching the steps; the `CI` variable.
- Both Playwright config files and the `CHROMIUM_PATH` / `/opt/pw-browsers` fallbacks: they are absent in the image, so Playwright uses its own registry, which is correct.
- `smoke.mjs` server start and stop; the job conditions and the "what changed" job's classification; time limits; matrix and sharding; no test weakened; the self-hosted `pc` job is untouched.
- Whether the Firefox or WebKit packages add fonts: they do not.
- Whether the old step's fonts came only from "tools": yes.
- The vitest TZ setting in `vite.config.ts`: unrelated to these jobs.
