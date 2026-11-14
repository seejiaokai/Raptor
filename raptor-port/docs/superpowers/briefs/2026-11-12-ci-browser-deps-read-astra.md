# The browser jobs in Playwright's image — Astra's blind read (12 Nov 26, overnight run, job 1)

*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C <the checkout>`, Codex CLI 0.160.0, 00:49 to 00:59 on 12 Nov 26, about 222,000 tokens; brief `2026-11-12-ci-browser-deps-read-brief.md`, on `3e6e843aa`, the branch head then. Blind to the fresh Opus reader, whose report sat in a scratch folder outside the checkout. What the host did with each finding, each reasoned or reproduced first: (1) the check split in two steps, each under the shell's `timeout`: "Browser image" a gate, "Fonts drawn" warning only, its `close()` guarded; (2) the gate compares `/ms-playwright/.docker-info`'s `driverVersion` with the installed playwright-core and launches the headless browser the tests use, within 20 s; (3) the outage of Microsoft's registry: not built — a mirrored image and `docker run` in place of the job container is a larger change than the night's, so the docs now say outright that the nine jobs fail before checkout then (three pull attempts), for the coordinator to put to him; fonts: the runner moved to 26.04 — both browser jobs pinned to `ubuntu-26.04` with the `-resolute` image, the same release as pull request 760's last green bare run, and a missing or empty lent-fonts folder now fails the gate; the full font comparison against a bare runner was not built; the single source for the tag: not built — the gate's exact version compare catches a mismatch on the first run; the docs corrected (not the "first step", three pull attempts in all, the bare runner's TZ unset, the 26.04 runner).)*

**I would not approve this as meeting all four goals yet.** It removes the Ubuntu-package download from the nine jobs and preserves their test commands and split. However, I reproduced two defects in the new check, found a new registry-outage failure mode, and could not establish font equivalence.

Reviewed `claude/ci-browser-deps` at `3e6e843aa`, against the checkout’s existing `origin/main`. No repository files changed. I read no other reviewer’s report; no post-compaction handoff was supplied. The reproductions below used the unchanged script with in-memory substitutes, not GitHub’s machines.

1. **P1 — The optional font diagnostic can prevent every test from starting.**

   Location: [browser-image-check.cjs](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/scripts/ci/browser-image-check.cjs:55), especially the protocol calls and final `browser.close()`.

   **Setup and failure:** the browser launches, but a DevTools request never answers. Those requests have no surrounding deadline. The script never reaches its warning handler, and the job can consume its 30-minute limit before starting a test. Separately, if the diagnostic throws and `browser.close()` rejects, the rejection escapes the warning handler and fails the step.

   **Expected:** an unavailable diagnostic warns and lets the original tests run.

   **Evidence:** executing the actual script with a never-resolving protocol request left its promise pending. Making the diagnostic throw and cleanup reject produced both its “tests still run” warning and an uncaught rejection. These demonstrate control-flow defects; they do not establish their frequency on GitHub.

   **Exact fix:**
   - Split the script into `--check` and `--diagnostics` modes.
   - Make `--check` perform the mandatory version/browser validation described in finding 2.
   - Keep the font and locale inspection in `--diagnostics`.
   - Replace each current “Browser and fonts” step with these two steps:

     ```yaml
     - name: Browser image
       working-directory: raptor-port
       run: timeout --signal=KILL 30s node scripts/ci/browser-image-check.cjs --check

     - name: Browser and fonts
       working-directory: raptor-port
       run: |
         if timeout --signal=KILL 30s node scripts/ci/browser-image-check.cjs --diagnostics; then
           :
         else
           echo "::warning::Browser diagnostics failed or timed out; the tests will still run."
         fi
     ```

   The mandatory check stays fatal. The diagnostic’s timeout, rejected cleanup and nonzero exit become warnings. Do not put `continue-on-error` on the mandatory check.

   **GitHub proof:** deliberately stall the diagnostic in a throwaway revision. Within approximately 30 seconds, its warning must appear and the Geometry or Tracker smoke step must start.

2. **P2 — The guard does not enforce the stated image-version rule or validate the executable the tests launch.**

   Location: [browser-image-check.cjs](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/scripts/ci/browser-image-check.cjs:24).

   `chromium.executablePath()` identifies full Chromium. These tests use default headless launches, which select **Chromium Headless Shell**. In the installed package, both use revision `1234`, but occupy different directories.

   **Setup and failure:** full Chromium exists, but its headless shell is absent. The existence check succeeds; the subsequent launch failure becomes a font warning. My reproduction returned successfully and printed “the image holds its browser”.

   A second gap is demonstrable without a damaged image: Playwright **1.62.0 and 1.62.1 share Chromium revision 1234**. Consequently, an old `v1.62.0` image can satisfy this check with package 1.62.1 installed. That need not break Chromium, but it disproves the documentation’s claim that the check stops whenever the versions differ. [Playwright 1.62.0 browser manifest](https://raw.githubusercontent.com/microsoft/playwright/v1.62.0/packages/playwright-core/browsers.json)

   **Exact fix in `--check`:**
   - Read `/ms-playwright/.docker-info`.
   - Require its `driverVersion` to equal the installed `playwright-core` version; require `@playwright/test` to match that version too.
   - Treat missing or malformed metadata as a mandatory-check failure.
   - Launch `chromium.launch({ timeout: 20_000 })` and close it **outside the warning-only diagnostic handler**.
   - Exit nonzero on either failure, retaining the existing instruction to update the image.
   - Use the outer 30-second limit from finding 1 to bound cleanup.

   Playwright itself writes `driverVersion` and the image name into that metadata file. [Version metadata implementation](https://raw.githubusercontent.com/microsoft/playwright/v1.62.1/packages/playwright-core/src/server/registry/dependencies.ts)

   **GitHub proof:** package 1.62.1 with image 1.62.0 must fail the mandatory check explicitly. A missing headless shell must fail there before the production build.

3. **P1 against requirement 4 — An MCR-only outage now stops all nine jobs before checkout.**

   Locations: both new `container.image` declarations.

   **Setup:** Microsoft Container Registry is unavailable, while GitHub, npm and Ubuntu’s package servers work; the old browser cache is available.

   **Failure:** GitHub cannot initialize either container job. None of the checkout, cache or check steps can run. The old workflow did not depend on MCR and could complete under that setup.

   GitHub’s runner makes **three pull attempts total**, then throws. There is no alternate image source in this workflow. This is a concrete new failure mode, not evidence that MCR is generally less reliable. [Runner pull implementation](https://raw.githubusercontent.com/actions/runner/main/src/Runner.Worker/ContainerOperationProvider.cs)

   **Exact fix if requirement 4 is literal:**
   - Prepare an independently hosted copy of the **same verified image**, identified by immutable digest.
   - Remove job-level `container:` from these two jobs, because fallback steps cannot execute before container initialization.
   - Add a host-side preparation step that tries the primary image, then the independently hosted copy, and records the successfully verified local image ID.
   - Run the existing install, mandatory check and unchanged test command through `docker run --pull=never`, preserving user, IPC/init options, font mounts, writable workspace/home/npm cache, Node 22, `CI`, `TZ` and `SMOKE_PART`.
   - Preserve the seven geometry entries, two smoke entries, existing conditions and test limits.
   - If neither copy is obtainable, fail explicitly; never substitute an Ubuntu download or a different browser.

   Merely changing to another registry moves this failure. Adding retries inside “Browser and fonts” cannot fix it.

   **GitHub proof:** make only the primary image reference unavailable in a throwaway run. All nine jobs must obtain the verified alternate image and execute their original tests.

**Fonts: equivalence is not established.**

The mount is a reasonable attempt to preserve the runner’s additional fonts, but the claim “therefore the same families resolve” is stronger than the evidence.

There is also an immediate baseline problem: GitHub’s announced migration of `ubuntu-latest` to **Ubuntu 26.04 runs from 19 October to 19 November 2026**. On the review date, `ubuntu-latest` cannot safely be described as Ubuntu 24.04. This workflow combines a fixed Noble container with fonts from a changing host. [GitHub’s migration announcement](https://github.com/actions/runner-images/issues/14748)

I checked the following distinctions:

| Part | What the change actually preserves |
|---|---|
| Playwright’s explicit font dependencies | Its Noble “tools” list is shared across browser installs. The official image installs it. |
| Runner’s `/usr/share/fonts` | Exposed read-only under a different path. |
| Runner’s font configuration | **Not mounted.** The container uses its own `/etc/fonts` and configuration includes. |
| Other font directories | Host `/usr/local/share/fonts`, user font directories and external symlink targets are not covered by this mount. Whether they contain relevant fonts needs inspection. |
| Symbolic links | Relative links remaining within the mounted tree can work. Absolute links resolve against the container’s filesystem, not the host’s. |
| Duplicates | Both host and image copies may be visible. A matching family name does not establish matching font-file bytes or selection. |
| Caches | The image’s existing caches do not by themselves describe the newly mounted path. Missing caches can be rebuilt/scanned; **absence of an explicit `fc-cache` step is not itself a demonstrated defect**. |

Font configuration controls matching independently of font files. Ubuntu’s DejaVu package, for example, supplies configuration under `/etc/fonts`, outside the mounted tree. [Fontconfig documentation](https://fontconfig.pages.freedesktop.org/fontconfig/fontconfig-user.html), [Ubuntu DejaVu package contents](https://packages.ubuntu.com/noble/all/fonts-dejavu-core/filelist)

For the seven requested stacks:

| Stack | Conclusion |
|---|---|
| `sans-serif` | Exact old/new face not verified. |
| `monospace` | Exact old/new face not verified. |
| `system-ui` | Exact old/new face not verified; must be measured separately from `sans-serif`. |
| `'Barlow Condensed','Inter Tight',sans-serif` | Depends on availability of the named faces, then the generic fallback. |
| `'Inter Tight',sans-serif` | Same unresolved availability/fallback question. |
| `'JetBrains Mono',monospace` | Same unresolved availability/fallback question. |
| `'Segoe UI',system-ui,-apple-system,Arial,sans-serif` | Must be measured as this complete stack; checking Arial or sans-serif alone is insufficient. |

I cannot honestly provide seven confirmed matching names from source inspection.

The script’s Latin sample at default size and weight is useful evidence, but does not establish complete font equivalence. It misses bold/small text, other glyphs, font-file versions and rendering settings. It also does not reproduce the actual body stack, `'Inter Tight',system-ui,sans-serif`.

**The comparison needed before approval:**

- Read `Set up job → Runner Image` from the last successful old run and each failed run. Record `Image`, `Version` and the included-software link.
- Compare the old and proposed environments on the same explicitly selected runner release.
- If the intended baseline is 24.04, change both browser jobs’ `runs-on` to `ubuntu-24.04`. If the successful baseline was 26.04, do not silently declare Noble equivalent.
- Capture font files, configuration, links, package versions and actual rendered text in both environments. Useful commands are:

  ```sh
  cat /etc/os-release
  dpkg-query -W 'fontconfig*' 'libfontconfig*' 'libfreetype*' \
    'libharfbuzz*' 'libpango*' 'fonts-*' 'xfonts-*'
  find /usr/share/fonts /usr/local/share/fonts -type l -printf '%p -> %l\n'
  find -L /usr/share/fonts /usr/local/share/fonts -type l -print
  find -L /usr/share/fonts /usr/local/share/fonts \
    -type f -exec sha256sum {} + | sort
  find -L /etc/fonts /usr/share/fontconfig \
    -type f -exec sha256sum {} + | sort
  ```

- Where available, also capture `fc-conflist`, `fc-list` and `fc-match -v`. Do not add an Ubuntu installation to production jobs just to obtain diagnostic utilities.
- Run the Chromium sample for every stack at the app’s actual sizes and weights, adding its symbols and non-Latin glyphs. Compare rendered-font details and measured text widths/heights.

A different required font file, broken link, selected face, text metric or relevant library version disproves equivalence. Until that comparison exists, this remains an **unresolved acceptance requirement**, not a claimed, reproduced geometry regression.

**Container mechanics: I found no additional source-level blocker in the existing steps.**

| Stage or consumer | What I checked |
|---|---|
| Conditions and sharding | Conditions, seven geometry entries, two smoke parts and `fail-fast: false` are unchanged. |
| Sparse checkout | Source, configuration, lockfile, new script, Tracker course maps and sample data remain included. No newly required file falls inside the four excluded folders. |
| User and home | GitHub mounts the workspace, temporary directories and tool cache, and supplies a writable `/github/home`. UID 1001 matches Playwright’s documented GitHub example. Numeric UID alone does not prove the group; log `id` once. |
| Node | `setup-node` puts its selected Node 22 directory first. The image’s Node 24 does not override subsequent npm/Vite/test commands. JavaScript Actions use the runner’s action runtime separately. |
| npm cache/install | The action discovers npm’s cache path; `npm ci` remains required. This caches downloaded packages, not `node_modules`. A cache miss still requires npm access, as before. |
| Build writes | `node_modules`, TypeScript build state and `dist` remain under the writable checkout. |
| Geometry server | Build and Vite preview run inside the same container as Chromium. `localhost:4173` needs no published Docker port. `--strictPort`, readiness checking and the 180-second startup limit remain. |
| Tracker server | Its own build and preview on 4179 remain in the same container. Both normal and smooth-scrolling browser launches use Playwright’s default browser when no explicit override exists. |
| Browser selection | `/opt/pw-browsers/chromium` is the legacy fallback; the official image instead supplies `/ms-playwright`. No workflow override selects the legacy browser. |
| Reporter/output | `CI=true` is supplied by the runner, preserving three workers, one retry, `forbidOnly`, list reporting and no server reuse. Default `test-results` writes remain inside the checkout. |
| Shell | Container commands default to `sh`; the existing commands in these two jobs need no Bash-specific syntax. |
| Cleanup | Playwright owns its server cleanup. Tracker’s Linux cleanup may leave an npm grandchild temporarily, as before; final container removal terminates remaining processes. `--init` helps reap exited children but is not itself a complete server-tree shutdown. |
| Downstream result | A failed/cancelled browser job still prevents the aggregate “checks passed” verdict from succeeding. Pages deployment remains disabled. |
| Limits | Both jobs remain at 30 minutes; Tracker’s test step remains at 12 minutes. The new initialization and diagnostic time consume that existing allowance. |

These conclusions follow the [Playwright CI example](https://playwright.dev/docs/ci), [GitHub container syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idcontainer), [Node setup implementation](https://raw.githubusercontent.com/actions/setup-node/v4/src/distributions/base-distribution.ts) and the live repository files.

`--ipc=host` and `--init` are supported recommendations. I found no need for an additional sandbox setting: Playwright’s Chromium sandbox default is already off. [Playwright Docker guidance](https://playwright.dev/docs/docker)

**Version source and browser location.**

The lockfile pins `@playwright/test`, `playwright` and `playwright-core` to **1.62.1**, matching both current tags. The official versioned Dockerfile sets `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`, installs Chromium **and its headless shell**, and makes the browser directories accessible to non-root users. The current image recipe therefore supplies the expected executables. [Exact 1.62.1 Dockerfile](https://raw.githubusercontent.com/microsoft/playwright/v1.62.1/utils/docker/Dockerfile.noble)

A better single source is the lockfile:

- Include `raptor-port/package-lock.json` in the existing `changes` job’s sparse checkout.
- Read `packages["node_modules/playwright-core"].version` in a small step, validate it, and expose it as a job output.
- Have both image references use that output:

  ```yaml
  image: mcr.microsoft.com/playwright:v${{ needs.changes.outputs.playwright-version }}-noble
  ```

That removes the duplicated version update. Keep the runtime guard: a computed tag does not prove the image exists or contains a working browser.

**Time zone and language.**

- The versioned image explicitly sets `LANG=C.UTF-8` and `LC_ALL=C.UTF-8`.
- `TZ=UTC` is appropriate for Node and Chromium and is inherited by Vite. UTC does not require regional daylight-saving rules; a missing `/etc/localtime` alone is not evidence of wrong behaviour.
- I did **not** verify the historical jobs’ exact locale environment or unset `TZ`. The new comments should not present those historical values as measured facts without their logs.
- Playwright Test’s installed fixture defaults to **`en-US`**. The geometry test mentioning `<input type=time>` uses that fixture and checks its width for a 12-hour display.
- Tracker, the diagnostic and manually created browser contexts use library calls directly. Their defaults should be logged separately; the diagnostic’s locale does not prove every test context’s locale.

For the old/new comparison, capture:

```sh
locale
date '+%Z %z'
readlink -f /etc/localtime || true
node -e 'console.log({TZ:process.env.TZ,LANG:process.env.LANG,LC_ALL:process.env.LC_ALL,options:Intl.DateTimeFormat().resolvedOptions(),offset:new Date().getTimezoneOffset()})'
```

In both a default library page and a Playwright Test fixture page, print `navigator.language`, `navigator.languages`, `Intl.DateTimeFormat().resolvedOptions()` and January/July timezone offsets. Expected UTC offsets are zero in both seasons. I found no demonstrated timezone regression.

**Documentation corrections and verification limits.**

The new documentation should:

- Say “after dependency installation”, not “first step”.
- Replace guaranteed font equivalence with the measured result once available.
- Remove the assumption that `ubuntu-latest` means 24.04.
- Say three image-pull attempts total.
- Describe the actual version/headless validation after fixing finding 2.
- Correct the claim that a mismatched image necessarily produces only installation advice: the installed Playwright already has a Docker-specific “update docker image” error path.

I checked the diff for test removals, weakened assertions, changed selection and changed sharding, and found none. I found no remaining Ubuntu-package installation in these two jobs. Syntax checking and `git diff --check` passed. I did not run the browser suites, pull the image, or reproduce GitHub ownership and rendering locally.

**Next:** fix the mandatory/optional check separation, settle the registry-fallback requirement, then obtain the old/new font and environment comparison before approving measurement equivalence.

Rulings: none this session. Walk: not performed; read-only CI review.

