# Session handoff — crew-rest trace, warning-jump lateral hold, and a Pages deploy that will not publish

## Where it started

Owner asked for two things on the warning-jump path: stop the week snapping
sideways when the clicked warning is already on screen, and mark the puck on
the PREVIOUS day whose day-end breaks the next day's crew rest, so the cause
is readable from the day a scheduler can still change. He then sent a phone
screenshot of the deployed site: the sanctioned-late-show ring was rendering
as a solid red box, not a dashed one. All three shipped. The deploy did not.

## Shipped

- **Lateral hold on the warning jump + the standing previous-day trace** —
  PR #90, merged. `validate()` files every crew-rest breach a second time
  under the day that caused it (`WARN.trace`, with
  `traceOf`/`traceLeads`/`traceIx`/`tracesOn`); that day draws a dotted ring,
  a `CR` chip captioned with the day broken and the leave-by, and a
  `.dwtrace` cross-day row. Chip and row carry the NEXT day's `(di, ix)` so
  the ordinary jump navigates them. `scrollToWarnFocus` pans sideways only
  when the target puck is genuinely off screen.
- **The dashed ring was never dashed** — PR #90 (second commit), merged.
  `.puck.warn.hard` puts a solid 1.5px ring on every hard flag and
  `.boxdash` only added an outline over it, so the dashes were filled in from
  behind. Cleared the shadow; dotted ring dropped to 1.5px at
  `outline-offset:2px` so it neither mimics the dashed stroke nor hides
  inside `.boxred`'s 2px spread.
- **A dead timeout input** — PR #91, merged. Raised
  `actions/deploy-pages`'s `timeout` to 20 min. **It did nothing** — see
  Unfinished.

## Unfinished

- **The deploy is red and the live site does not have any of this work.**
  Last successful publish is `90cf0cb` (11:18, PR #89 — before this session).
  Three consecutive main deploys failed: `31108708522` (e3e052dd),
  `31111122560` (6d1e3078), plus one re-run. Every one died on
  `Timeout reached, aborting!` at ten minutes and CANCELLED a Pages
  deployment that was still reporting `deployment_in_progress`.
  **Do not try to fix this with the `timeout:` input** — that was PR #91 and
  the action clamps it: `"timeout value is greater than the allowed maximum -
  timeout set to the maximum of 600000 milliseconds"`. Ten minutes is a
  ceiling. Full reasoning and what was ruled out (0.15 MB artifact, no
  environment wait, 2 deployments/hour against a soft limit of 10, and the
  SAME deploy succeeding in 8m04s at 11:21 that morning) is in the deploy
  step's comment in `.github/workflows/deploy.yml` and in `HANDOFF.md`
  §Deploy.
- **PR #92 is OPEN** — the documentation-only correction that removes the
  clamped input and records the ceiling. Its gates were still running at
  session end (run `31112858167`); merge it once green. Merging is also the
  next deploy retry.
- **The retry loop was never run.** Owner chose "retry later, change
  nothing"; nothing is scheduled. Retry by merging #92, or by re-running the
  failed deploy job on run `31111122560` (that skips the 2.5-min build and
  reuses the artifact).
- **No PR is under `subscribe_pr_activity` watch.**

## Branch state

- Designated branch: `claude/read-handoff-docs-3r97fl`.
  **Note this is NOT the branch named in the session instructions**
  (`claude/read-handoff-docs-o6qvqn`) — the owner's first message explicitly
  created and asked for `-3r97fl`, and every PR this session used it.
- Its PR is **open, #92**. #90 and #91 from the same branch are merged.
- The branch is 1 commit of unmerged work ahead of main (`deploy.yml` only),
  plus this handoff. Because #92 is still open, do NOT reset the branch —
  resetting would discard it. Once #92 merges, the next session must reset
  before new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3r97fl origin/main`

## Gates

Run first-hand from `raptor-port/` at `6147e28` (the last code commit — #92
touches only a YAML comment and cannot move any of them):

- `npm test` **613 passed / 38 files** (was 604) · `npm run build` **clean** ·
  `node reference/tfin.js` **728 / 0** · `npm run test:e2e` **20 / 20**
  (was 18) — all green.
- `npm run probes:adapted` **6 / 6** · `npm run perf` **9 / 0** — both green,
  run because this was UI-visible work. Neither is in CI. `npm run perf`
  needed its day-isolation assertion narrowed: the trace deliberately couples
  day N−1's markup to day N's crew rest, and that one day is now exempted by
  name.
- A fresh container needs `npm ci` first. The adapted probes need
  `npx vite preview --port 4173` already serving.

**Green gates are not a green deploy** — the four gates passed on every one
of the three failed runs. The failure is entirely in the publish step.

## Open questions

- **Is the Pages slowdown transient or permanent?** Unanswerable from this
  container: the agent proxy 403s both `github.io` and `githubstatus.com`, so
  neither the live site nor GitHub's incident page can be checked from here.
  Owner was given three options (retry unchanged / `gh-pages` branch publish
  / move host) and chose **retry unchanged**, on the reasoning that an
  8-minute success that morning makes a GitHub-side blip most likely. If
  retries keep failing, the `gh-pages` route is the real fix — it never waits
  on the rollout — but it needs the owner to flip Settings → Pages → Source
  to "Deploy from a branch" by hand, because the token here gets 403 on the
  Pages API.

## Pick up here

Check whether PR #92's gates went green and merge it; that merge is itself
the next deploy attempt. Then watch run on `main` — if Pages publishes, the
whole session's work goes live and nothing else is owed; if it aborts at ten
minutes again, the slowdown is not transient and the `gh-pages` question
above needs the owner.
