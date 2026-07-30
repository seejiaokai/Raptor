# START HERE — beginner guide (GitHub + Claude Code on the web)

You chose the cloud workflow: the project lives in a **private GitHub
repository** and you drive Claude Code from claude.ai/code in any browser —
laptop or phone. No terminal, no git commands, ever.

## Words you need (30 seconds)

- **Commit** — a named save point of the project.
- **Pull request (PR)** — a proposal: "here is the work I did, accept it?"
  Claude Code in the cloud always delivers its work as a PR.
- **Merge** — you accepting a PR. Merging IS your save point.
- **Green** — a test result line ending in **0 failed**
  (e.g. `RESULT 728 passed, 0 failed`). Anything else is red.

## One-time setup

1. github.com → sign up (free) → **New repository** → name `raptor` →
   **Private** → Create.
2. On the empty-repo page click **"uploading an existing file"**, drag in
   everything INSIDE this folder (the `reference` folder and the .md files),
   message `B55 reference baseline`, **Commit changes**.
3. Go to **claude.ai/code** (or the Code tab in the Claude mobile app) →
   connect GitHub → grant access to **only** the `raptor` repository →
   select it.

## The loop — the same forever

1. **Paste one phase prompt** (first message below; afterwards, the phases
   in PORTING.md, in order).
2. Claude proposes a plan → say yes, or ask questions in plain English.
3. It works, then shows test results. **Wait for 0 failed.** If red, say
   "the tests are failing, fix them" — do not continue on red.
4. It opens a **PR**. Skim it, then press **Merge** on GitHub.
   If a phase went wrong: **close the PR without merging** — the project is
   untouched, try again.
5. New session, next phase.

Phone vs laptop: identical — same site, same repo. Phones are great for
starting phases and answering questions; a laptop is easier for reading
big diffs. Phases 4–5 (UI, screenshots, browser probes) will be smoother
from a desktop browser.

## Your literal first message (replaces PORTING.md phases 0–1)

> Read CLAUDE.md and README.md first. Then:
> (1) If .gitignore is missing, create it with: node_modules/, dist/,
> .vite/, test-results/, playwright-report/, *.log.
> (2) Scaffold a Vite + React + TypeScript app alongside `reference/`
> (which is read-only), with Vitest and Playwright as dev dependencies,
> strict TS, no components and no ported code — just a skeleton where
> `npm test` and `npm run build` pass trivially.
> (3) The reference suite `reference/tfin.js` expects the app at a
> hard-coded path — make that configurable, defaulting to
> `reference/scheduler.html`, changing nothing else in that file.
> (4) Run the reference suite and show me its final line. It must say
> 728 passed, 0 failed.
> Deliver all of this as one PR and explain anything you had to decide.

When that PR is merged, continue with **PORTING.md phase 2** — the engine
extraction, the phase that matters most — then 3, 4, 5.

## If you feel lost mid-session, type these verbatim

- `what did you just do, in simple terms?`
- `are the tests passing? show me`
- `explain this PR to me like I'm not a programmer`

## The three rules that keep you safe

1. `reference/` is read-only. If a PR touches it (beyond the one path
   change in the first message), don't merge — say so.
2. Never merge on red. 0 failed, or it doesn't go in.
3. One phase per PR. Small saves, always mergeable, always reversible.
