# Session handoff — an adversarial audit of the last 20 implementations, then guard rails on malformed input

## Where it started
The owner asked for a thorough bug hunt over the ~20 features merged in PRs
140–174, run unattended overnight, with the findings fixed automatically —
"they should work in weird scenarios like out of order, edited deleted
changed, user interface etc." He asked for the work to be planned and
delegated to agents. Three follow-on asks arrived as it went: fix the five
suspects the audit deliberately left open ("fix all"), then sweep every typed
field for missing guard rails ("start and end times must be numbers etc. if
not reject the input. Find more situations").

The design line the whole session ran on, and the thing most worth carrying
forward: **refuse MALFORMED data — not the kind of value the field holds, or
outside the range that kind can take. WARN about decisions — a clash, an
overnight absence, a late input.** Every refusal added sits at a shared write
path, where the callers already revert their own cell on a false return.

## Shipped
- Twelve confirmed bugs from the six-agent audit, ~200 pinning tests —
  PR #175, merged, deploy green, verified on the live page.
- The five suspects the audit left open, all closed — PR #176, merged,
  deploy green, verified on the live page (the brief guard was driven there
  and read back its own toast).
- Guard rails on malformed input across every typed field — PR #177, **OPEN
  at the time of writing**, gates green locally, not yet merged.

## Unfinished
- **PR #177 is open.** All six gates were green locally before it was raised.
  A `send_later` check-in was armed for 17:24 UTC to: read its check-runs,
  merge if green, poll the deployed page for the new bundle hash from the
  MERGED main build (not a local hash), drive the time guard live (`1290` and
  `9999` into a board take-off — both must bounce and the cell keep its
  value), then send the owner one notification. **If that check-in did not
  fire, or fired before the gates finished, do this by hand.**
- **This handoff commit and the probe-bridge/file-map fixes below ride on
  #177.** They only reach `main` when it merges.
- Step 3 of the handoff skill found two things this session had made stale and
  they are fixed in the same commit, noted here because they were found, not
  because they are open: `src/probe-bridge.ts` was missing `hmOK` (new in
  `engine/time.ts`) and `elogRemap` (new in `engine/editlog.ts`) — CLAUDE.md
  §Stable decisions requires the bridge to mirror engine API; and HANDOFF's
  file-map line for `src/**/audit-*.test.ts(x)` described only the first of
  the session's three test sweeps.

## Branch state
- Designated branch: `claude/handoff-documentation-64ib1p`
- Its PR is **open, #177**. PRs #175 and #176 from earlier in this session
  already merged, and the branch was reset from `origin/main` between each.
- Once #177 merges, the next session must reset before starting new work:
  `git fetch origin main && git checkout -B claude/handoff-documentation-64ib1p origin/main`
  Otherwise it stacks commits onto already-merged history.

## Gates
Run from `raptor-port/`, not the repo root; a fresh container needs `npm ci`.
- `npm test` 1368/1368 across 87 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 86/86 — all green.
- `npm run probes:adapted` 36/36 · `npm run perf` 4/4 — green. Both need
  `npx vite preview --port 4173` running first, and e2e must NOT be run while
  that preview is up or it silently measures a stale bundle.
- Re-run after this handoff commit (it edits `probe-bridge.ts`, which is
  source): build clean, `npm test` 1368/1368.
- **ONE INTERMITTENT TEST, seen once and not reproduced** — worth knowing
  before it wastes someone's morning. In one full run of the four made this
  session, `src/ui/audit-d-sortall-undo.test.tsx` › "an armed slot on the
  sorted day is put down; one on another day stays armed" failed; the file
  passes alone, and the very next full run was 1368/1368. It is a test added
  THIS session, so the intermittency is in the test rather than in shipped
  behaviour — but it has not been diagnosed. If it fails again, suspect the
  test's own arm/notify sequencing rather than `REORDERED_DI`, which the
  engine-side pins in `audit-d-applymove.test.ts` cover deterministically.
- The guards were also driven on the built bundle: `1290`, `9999` and
  `morning` all bounce off a take-off that stays `12:40` while `0845` goes in;
  a freshly added blank line renders no `NaN:NaN`; the Inputs page holds zero
  sideways overflow; zero console errors.

## Open questions
- **Leave crossing New Year cannot be recorded, and the owner has not ruled
  on the real fix.** Date labels carry no year (`dateOrd` is month*100+day),
  so `Dec 28 → Jan 3` reads backwards and covered nothing, blocked nothing and
  vanished from the Inputs table. It is now REFUSED with an honest message,
  which is a guard rail, not a fix. Making it work means putting a year into
  the stored label — `DATES`, `fmt`/`unfmt`, `dateOrd`, `RangeCal` and the CSV.
  He was told it is his call and that it matters before a December.
- **Refuse vs round for a bad clock minute.** He asked why `1290` is not
  simply capped at 59 minutes rather than refused. Answered: 12:59 is still
  the wrong time and would save silently, and the same rounding sends `2570`
  to 23:59. He was told it is a two-minute change either way and has not said
  to switch it. Current behaviour is refusal.
- Four guard-rail candidates were deliberately NOT built, with reasons, in
  HANDOFF's §Known issues opening bullet — long free text on the week's
  contenteditable prose cells, a long wave label in the board's title
  dropdown, deleting the last in-time, and `ruleParse` staying loose.

## Pick up here
Confirm PR #177 merged and the deploy is live (see Unfinished), then ask the
owner whether he wants year-aware dates built.
