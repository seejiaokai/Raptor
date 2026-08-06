# Session handoff — crew-rest trace, warning-jump lateral hold, dashed-ring fix, favicon, live-view rule

Supersedes two earlier versions from this session; both are stale. The deploy
outage they described resolved on its own, and PR #92 and #93 have merged.

## Where it started

Owner asked for two things on the warning-jump path: stop the week snapping
sideways when the clicked warning is already on screen, and mark the puck on
the PREVIOUS day whose day-end breaks the next day's crew rest. He then sent a
phone screenshot: the sanctioned-late-show ring was rendering as a solid red
box, not a dashed one. A Pages outage ate about an hour. Then a favicon, after
a `/favicon.ico` 404 surfaced while demonstrating how the production bundle
gets driven in a real browser — which led to the standing instruction below.

## Shipped

- **Lateral hold + the standing previous-day trace** — PR #90, merged,
  **deployed**. `WARN.trace` with `traceOf`/`traceLeads`/`traceIx`/`tracesOn`;
  dotted ring, `CR` chip, `.dwtrace` cross-day row, all addressed to the NEXT
  day's `(di, ix)`. `scrollToWarnFocus` pans sideways only when the target
  puck is off screen.
- **The dashed ring was never dashed** — PR #90 (second commit), merged,
  **deployed**. `.boxdash` never cleared `.puck.warn.hard`'s solid shadow.
- **A dead `timeout:` input** — PR #91, merged; did nothing, the action clamps
  it. Removed again by **PR #92**, which records the ten-minute Pages ceiling
  in the deploy step's comment and `HANDOFF.md` §Deploy.
- **Favicon** — PR #93, merged. The talon from `Login.tsx`/`Shell.tsx`, claw
  path byte for byte, on a tile with a same-colour stroke because a tab paints
  it at 16px. Kills the `/favicon.ico` 404.
- **Deploy recovered on its own** — run `31113391602` published in **7m12s**
  after three consecutive ten-minute aborts, with nothing changed to fix it.
  A genuine GitHub-side slowdown.

## Unfinished

- **The live-view rule is in flight** — the only thing not yet merged. See
  below; it is a `CLAUDE.md` edit plus this file.
- **The favicon deploy (run `31116706755`) was still running** at the time of
  writing. If it aborted at ten minutes, that is the known ceiling, not a new
  fault: re-run it. `HANDOFF.md` §Deploy has the full reasoning.
- **No PR is under `subscribe_pr_activity` watch.**

## The standing instruction (owner, 6 Aug 26)

**Always stand up the live view and test against it — every session, without
being asked.** Recorded in `CLAUDE.md` §Build & verify, which is the durable
copy; this is the pointer, because a chat-only instruction dies with the
session that received it.

```
npm run build && npx vite preview --port 4173
```

then drive it with Playwright: log in, navigate, **screenshot the element and
look at it**, read computed style, watch console errors and 4xx. `base:'./'`
means this preview IS the deployed bundle, not an approximation.

Two related asks from the same conversation:

- The owner asked for `github.io` **and** `githubstatus.com` to be allowed
  through the agent proxy. Both were still `connect_rejected` at session end.
  The policy is fixed when a session starts, so a change only reaches a LATER
  session. **Re-test once per session** — the command is in `CLAUDE.md`. Do
  not route around a 403; report the blocked host.
- Why this matters, concretely: a crew-rest ring shipped drawn as a fat solid
  box while 604 vitest tests passed, because jsdom loads no stylesheet and
  reports every rect as 0×0. The same browser pass found the favicon 404 and
  rejected a first favicon that was invisible at 16px.

## Branch state

- Designated branch: `claude/read-handoff-docs-3r97fl`.
  **NOT the branch named in the session instructions**
  (`claude/read-handoff-docs-o6qvqn`) — the owner's first message explicitly
  created and asked for `-3r97fl`, and every PR this session used it.
- Reset from `origin/main` after #93 merged, so it carries only the live-view
  rule. #90, #91, #92, #93 all merged.
- If that PR merges before the next session starts, reset again or commits
  stack on merged history:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3r97fl origin/main`

## Gates

From `raptor-port/`, on the favicon commit (the last one touching code):

- `npm test` **613 / 38 files** · `npm run build` **clean** ·
  `node reference/tfin.js` **728 / 0** · `npm run test:e2e` **20 / 20** —
  all green, run first-hand.
- `npm run probes:adapted` **6 / 6** · `npm run perf` **9 / 0** — green, but
  run against the crew-rest work earlier in the session. Deliberately not
  re-run for the favicon or the doc edits: neither adds DOM, CSS or engine
  code, so nothing either probe measures can move.
- A fresh container needs `npm ci`. The adapted probes need the preview above
  already serving.

## Open questions

- **none.**

## Pick up here

Merge the live-view PR once green and confirm the deploy. Then this file has
nothing left in it and should be deleted — `CLAUDE.md` promises the next
session that an absent `session-state.md` means nothing was pending.
