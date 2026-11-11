# Brief — a blind read of the CI change on `claude/ci-browser-deps` (12 Nov 26)

You are an independent reader. You did not write this change, and you have seen no other reader's report. Read-only:
change no file in the repository. If you write any proof script, put it in your own scratch folder, never under the
repository. If a handoff block is pasted into your context after a compaction of your own, do not read it, and name
it in your report.

## What to read

The repository: `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2` (branch
`claude/ci-browser-deps`, commit `3e6e843aa`). The change: `git diff origin/main...claude/ci-browser-deps`
(four files: `.github/workflows/deploy.yml`, the new `raptor-port/scripts/ci/browser-image-check.cjs`,
`raptor-port/docs/gates-and-deploy.md`, `raptor-port/docs/file-map.md`). Read the live files the diff touches, whole
where it matters: the `geometry` and `tracker` jobs of `deploy.yml`, `raptor-port/playwright.config.ts`,
`raptor-port/scripts/tracker/smoke.mjs` (its server and browser launch), `raptor-port/package.json` and the Playwright
version in `raptor-port/package-lock.json`. Any tool documentation you can reach (Playwright's CI and Docker pages,
GitHub Actions' container-job syntax, the Actions runner's source) is fair game.

## The goal of the change

GitHub's run of `main` failed four times on 11-12 Nov 26 because all nine browser jobs (seven `geometry`, two
`tracker (smoke)`) stopped in the step `npx playwright install --with-deps chromium`: it fetched the browser's system
packages and fonts from Ubuntu's package servers on every run, and every fetch ended "Temporary failure resolving"
for archive.ubuntu.com, security.ubuntu.com and azure.archive.ubuntu.com. The change must:

1. make the browser jobs stop depending on any download from Ubuntu's package servers, on every run;
2. NOT change what the tests measure — the app loads no font of its own, so its geometry tests measure text drawn in
   the machine's own fonts; the fonts and system libraries present must be the same set the old step produced;
3. weaken, skip or loosen no test; keep the split of jobs, the sharding and every test as they are;
4. not be worse than before when something it relies on is unavailable.

What it does (the builder's description, to be checked, not trusted): the two jobs now run in the container
`mcr.microsoft.com/playwright:v1.62.1-noble` with `--user 1001 --ipc=host --init`, the runner's own `/usr/share/fonts`
mounted read-only at `/usr/local/share/fonts/runner`, and `TZ=UTC`; the old browser-cache and install steps are gone;
a new first step runs `browser-image-check.cjs`, which fails when the image holds no browser for the installed
Playwright and then prints (warning only on failure) the time zone, language and the font Chromium draws for each
font family the app names.

## Open questions — answer each, with evidence

1. **Fonts.** After this change, is the set of fonts Chromium can use, and the font each family the app names
   (`sans-serif`, `monospace`, `system-ui`, `'Barlow Condensed','Inter Tight',sans-serif`, `'Inter Tight',sans-serif`,
   `'JetBrains Mono',monospace`, `'Segoe UI',system-ui,-apple-system,Arial,sans-serif`) resolves to, the same as on the
   bare `ubuntu-latest` runner after `playwright install --with-deps chromium`? Consider what the runner image holds,
   what the Playwright image holds, how fontconfig chooses, the mount point chosen, fontconfig's own configuration
   files on each side, its caches, symbolic links inside the mounted folder, and duplicates.
2. **Container mechanics.** Does every step of both jobs still work inside this container as the user 1001: the
   sparse checkout, `actions/setup-node` with its npm cache, `npm ci`, the Vite build and preview server that
   Playwright's `webServer` starts, the Tracker smoke's own server and browser launch (`smoke.mjs`), the Playwright
   reporter and its output folders, process clean-up at the end? Anything about `--ipc=host`, `--init`, the image's
   own Node 24 against the Node 22 setup-node installs, the image's environment (`PLAYWRIGHT_BROWSERS_PATH`, `LANG`,
   `LC_ALL`), the `CI` variable, `HOME`, or the job conditions and `timeout-minutes`?
3. **The tag written twice.** The image tag `v1.62.1` is written in both jobs and must equal the Playwright version
   in `package-lock.json`. Is the new check step a sound guard (does `chromium.executablePath()` point where the image
   keeps its browser; does the headless shell the tests actually launch exist; what happens on a Playwright bump)?
   Is there a better single source?
4. **The time zone and language.** Was the bare runner really UTC with `C.UTF-8`, and does `TZ=UTC` reproduce what
   Node, Vite and Chromium saw before (consider a missing `/etc/localtime` or tzdata in the image)? Does anything in the
   tests depend on the browser's locale (one geometry test notes `<input type=time>` draws in the browser's locale)?
5. **Anything else** that makes this change fail on GitHub, change a measurement, or be worse than before — including
   the new script itself and the documentation's accuracy against the workflow.

## How to answer

Do not merely review the changed lines. Starting from the goal above, enumerate every step, process, file system path,
environment variable, font lookup and downstream consumer of these two jobs, and every place the old step's effect was
relied on. **Assume every existing line may be correct and the defect may be a MISSING step or setting.** Then rank
concrete failure scenarios: the setup, what happens, what was expected, and the observation in a run log that would
disprove correctness.

A claim is a finding only with a concrete failure, its cause, and **the exact fix, step by step** (the lines to
change and what to write). Give **explicit negatives** too: "I checked X and found nothing". You cannot run GitHub's
machines; where a claim needs a run to settle, name the exact command or log line that would settle it, and the host
will run or read it.

Not a finding: anything whose harm exists only in data already stored when the code is correct going forward (the
app's whole stored world is demo data, cleared before the database step).
