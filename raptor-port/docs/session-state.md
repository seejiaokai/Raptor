# Session handoff — one owner question, nothing in flight

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

- The 6 Aug session worked on `claude/read-handoff-docs-3r97fl`; all seven of
  its PRs are merged and that branch is finished. The 7 Aug session started
  clean on `claude/read-handoff-md-n4q4xt`, cut from `main`.
- Whatever branch a session is given, check it is not sitting on already-merged
  history before committing:
  `git fetch origin main && git checkout -B <branch> origin/main`

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
## Resolved since

- **Network policy: `github.io` and `githubstatus.com` — OPEN (7 Aug 26).**
  The owner allowed both. Verified first-hand: the deployed page was loaded,
  logged into and screenshotted from the container, 149 pucks and 29 flagged
  ones, no console errors and no 4xx. He asked in the same breath that work be
  checked against the live link after every change, so that is now a standing
  instruction in `CLAUDE.md` §Build & verify along with the three Chromium
  launch settings it needs. Nothing further pending on this.

## Pick up here

Ask the owner the `DT`/`TT` question — it is the only thing blocking, it needs
one sentence from him, and it is the last item in this file. Once it is
answered and actioned, delete this file: `CLAUDE.md` promises the next session
that an absent `session-state.md` means nothing was pending.
