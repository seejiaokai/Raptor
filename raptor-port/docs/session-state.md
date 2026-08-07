# Session handoff — two owner questions, nothing in flight

## Where it started

Owner asked for two changes to the warning jump (hold the lateral view; mark
the previous day that breaks the next day's crew rest), then reported from a
phone screenshot that the sanctioned-late-show ring was drawing solid instead
of dashed. He later asked for a favicon, for two working rules to survive into
future sessions, and — while a GitHub outage blocked deploys — for a sweep of
the running app for bugs.

All of it shipped and is live. What each change was is in `HANDOFF.md`; how to
work is in `CLAUDE.md`. This file holds only what those two cannot: the
questions he has not answered.

## Shipped

- PR #90, #91, #92, #93, #94, #95 — **all merged, deploy green**. The live
  site serves `main` at `54cd1e30`, confirmed from the deployment status
  (`success`, 23:14). Nothing is in flight.

## Unfinished

- **none.** No open PR, no red gate, no half-applied edit, no PR under
  `subscribe_pr_activity` watch.

## Branch state

- Designated branch: `claude/read-handoff-docs-3r97fl`.
  **NOT the branch named in the session instructions**
  (`claude/read-handoff-docs-o6qvqn`) — the owner's first message explicitly
  created and asked for `-3r97fl`, and all six PRs used it.
- Its PRs are all MERGED, so reset before starting new work or commits stack
  onto already-merged history:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3r97fl origin/main`

## Gates

Run first-hand from `raptor-port/` on the last code commit, all green:

- `npm test` **616 / 38 files** · `npm run build` **clean** ·
  `node reference/tfin.js` **728 / 0** · `npm run test:e2e` **22 / 22**
- `npm run probes:adapted` **6 / 6** · `npm run perf` **9 / 0** — not in CI,
  run because the session shipped UI-visible work.
- A fresh container needs `npm ci`; the adapted probes and perf need
  `npx vite preview --port 4173` already serving.

## Open questions

- **`DT` and same-day `TT` chip a puck without ringing it, while the crew-rest
  `TT` rings.** Found in the sweep, raised with the owner, unanswered. Both
  behaviours are byte-identical to `reference/`, so this is inherited and NOT
  a port defect — deliberately left alone. It is still an inconsistency a
  reader would notice: the same `TT` glyph means "ringed problem" in one place
  and "unringed note" in another. `validate.ts` sets the same-day pair with
  `markChip(di,id,'DT')` / `markChip(di,id,'TT')` and no `markRing`, while the
  crew-rest branch does both. Changing either needs a `refwin.ts` patch to
  keep parity green, plus his decision — he has already called double turning
  "routine and planned", which argues the chip-without-ring is RIGHT for DT
  and wrong only for TT.
- **Network policy: `github.io` and `githubstatus.com`.** He asked for both to
  be allowed through the agent proxy and was given the exact steps
  (claude.ai/code → environment → Network access → Custom → allowed domains,
  with "also include default package managers" ticked or `npm ci` breaks).
  Both were still `connect_rejected` at session end, which proves nothing: the
  egress policy is fixed when a session starts, so a change he makes can only
  reach a LATER session. **Re-test once, early** — the one-line check is in
  `CLAUDE.md` §Build & verify. If it now works, the deployed page can be
  driven directly, which is the only way to catch a CDN-level fault that a
  local `vite preview` cannot show.

## Pick up here

Ask the owner the `DT`/`TT` question — it is the only thing blocking, it needs
one sentence from him, and it is the last item in this file. Once it is
answered and actioned, delete this file: `CLAUDE.md` promises the next session
that an absent `session-state.md` means nothing was pending.
