# Session handoff — calendar-driven week navigation + global personal inputs (PR #294)

## Where it started
The owner asked (phone screenshot + video) for a calendar-selectable date on the
schedule page like the app's own calendar, continuous left/right navigation on
mobile, and removal of the big "Jul 13 – Jul 19" title and the "142 · week of…"
line. Through live testing it grew into: a DAY picker (the week is transparent),
clearer calendar/history icons, three Inputs-page tweaks, and — the root cause the
owner found — personal inputs shown across ALL weeks, not just the loaded one.

## Shipped
- All of the above — PR #294 (seejiaokai/Raptor). The decisions it locks in are
  already in `CLAUDE.md` §Stable decisions (continuous nav + day picker; global
  INPUTS); do not re-litigate them.

## Unfinished
- **PR #294 is OPEN, not yet merged, and its merge + ship is being driven
  AUTONOMOUSLY by the originating session** via a scheduled check-in (`send_later`,
  ~16:23 UTC 22 Aug 26): it waits for CI (deploy.yml run #549) to go green,
  undrafts + merges to `main`, waits for the Pages deploy, loads the live site to
  verify, and sends one "it's live" notification. **A parallel or next session must
  NOT drive PR #294 or its branch** — the originating session owns it.
  If that automation did not complete — check: is #294 merged? is the latest
  `main` Pages deploy green? — finish it: merge once CI is green, then verify live
  at https://seejiaokai.github.io/Raptor/. Otherwise nothing here is pending;
  `git rm` this file.

## Branch state
- Designated branch: `claude/calendar-date-selection-redesign-641x6o`
- Its PR is OPEN (#294), merge scheduled.
- If MERGED before new work starts:
  `git fetch origin main && git checkout -B <branch> origin/main` — do not stack
  new commits onto already-merged history.

## Gates
- `npm test` 2894/163 · `npm run build` clean · `node reference/tfin.js` 728/0 ·
  `npm run test:e2e` 310/12 — green (final tree; e2e full run on the calendar-nav
  commit, day-picker + global-inputs re-verified by the full unit suite and the
  targeted inputs/calendar/board specs).
- `npm run probes:adapted` 6/6 · `npm run perf` 4/4 (week DOM 4940 ≤ 5450, board
  855 ≤ 960) — green.
- Run all from `raptor-port/`, not the repo root; a fresh container needs
  `npm ci` first.

## Open questions
- none.

## Pick up here
Confirm PR #294 merged and live (the originating session's scheduled task does
this); if it stalled, merge once CI is green and verify the live page, then delete
this file. New, unrelated work starts on a fresh branch off `main`.
