# Fix read 8 — the builder's brief for its open faults (chat 117, 19 Nov 26)

Branch `claude/multi-sqn-b1-107` (pull request 806, draft). The code under `raptor-port/src` is as at `71fdfbfd5`
(= `f15bc3fa4`'s code), which the four readers read. You are the builder (Opus). Read first:
`.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md` §Posting out (D2218, D2222, D2223,
D2225), the full rows (`grep -h '^| D2218 |\|^| D2222 |\|^| D2223 |\|^| D2225 |\|^| D2194 |\|^| D148 |' .claude/decisions-full/*.md`),
and the reports in `raptor-port/docs/superpowers/briefs/`: `2026-11-19-multi-sqn-b1-fixread8-{opus,fable,security,astra}.md`.
Each gives proofs and fix steps; where they differ, this brief decides. Harness: `src/leavewar/multi-sqn-fixread7.test.ts`
(put the new tests in `src/leavewar/multi-sqn-fixread8.test.ts`). The readers' proof files, to borrow from:
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4ba97a8c-53ce-4953-9329-22091bb17342/scratchpad/{sec8-proof.test.ts.txt,fr8-opus-probe.test.ts.txt}`
(Fable's was deleted; its report has the inputs). Note Fable's harness remark: the fix read 7 file's hand-built
`outlaw` actor is not an admin to the unit-row check — make him a real 142 admin where a test needs it.

Nothing here is a product question for him — each is the code not doing what D2218, D2223 and D2225 already say.

## The faults — each reproduced RED first by a test that fails on `71fdfbfd5`'s code, then fixed at its cause

**R. Fault Q told a moved filer again, and kept his old line (Opus 1; medium; introduced by Q).** Hunter (142) files
Ranger's LL 23–27 Jul on 15 Jul; Ranger moves to 149 from 25 Jul; Hunter himself moves to 149 from 16 Jul; on 17 Jul
Saber's remark change tells Hunter — D2223 / D2225: a filer who has moved is no longer told. And a line Hunter got on
15 Jul carries `fu: ['u142','u149']`, so on his move day his new home 149 is in it and the line stays (D2218: it
leaves). Cause: the mark is the union of the named man's homes over the input's days, and `toldIn` counts the filer's
own current home (`mine`) against it. Fix (Opus's steps): (1) the mark records only the squadrons he was told
THROUGH — his own home on the day the line is written if it is among `filerUnits`, plus those among them he is admin,
master or Plan of; (2) in `filerTold`, his home counts only if he has not moved since — a filer whose home changed
after the input was filed is told only through a right he holds (D2223; check D2225's "a filer who never moved" is
exactly the home branch); (3) in `noticeLeftBell`'s check of a marked line, judge each move day by his rights only
(`adminThen`), never his home that day. One body still serves the pass, `toldBy` / `filerMarkOk` and the mark. Tests:
Opus Q-1, Q-2; controls: Q17 and Q16 (fix read 7) still green; a master filer still told.

**D. A right given ON the move day brings the retired line back (Fable 2 = Opus 2).** `adminThen` uses `<=`; a move
takes effect at the start of its day. Fix: strictly before (`g.from < iso`, `masterFrom < iso`); a right with no date
still counts from always (D56). Comments in `units-model.ts`, `accounts.ts` and `docs/data-model.md` §11: "held before
that day began". Tests: Plan and master, read and unread, given on the move day; control: given the day before keeps it.

**G. The gate never checks a grant's or the master mark's day (Fable 1 = SEC8-3 = Opus 3).** A plain 142 admin puts a
grant with no `from` or a back-dated one; the retired line comes back. Fix: in `unitRowViolation`, a grant put that is
not a restore's verified replay — new, or its level changed: `n.from === todayIso()`, else refused ("a right not dated
today"); same level: `n.from === b.from`. A restore: `n.from` equal to the image it restores (add grant rows to what
`verifiedReplay` checks if that is the clean way). In the account check: `masterFrom === today` when the mark goes on,
absent when off, unchanged otherwise (only a master writes it, but keep the date honest). `validGrant`'s leniency stays
for the loader only. Tests: no `from`, back-dated `from`, a back-dated `masterFrom` by a master; controls: the real
`setGrant` / `setMaster` pass; Undo / Redo of a grant still pass.

**N. A line dated just past midnight, written in the last minutes before a move, never leaves (SEC8-1; medium).** At
23:57 on 15 Jul a line dated 00:01 16 Jul is inside the 5-minute window; its day is the move day, so no later move
retires it. Fix: `lineNotNow` also refuses a non-replay new line whose day (`dayOfAt(n.at)`, exported from
`notices.ts`) is later than today; up to 5 minutes in the past stays allowed. Tests: admin and member, plain and marked.

**H. A holiday-shaped line skips fault M's checks (SEC8-2; low).** `if (holidayLine(n)) continue` lets a line of only
`oilhol` parts through with an `iid` (or `fu`), and with an `iid` it outlives the move. Fix: skip only where
`holidayLine(n) && !n.iid && n.fu === undefined`; any other goes through the ordinary checks. Test: SEC8-2; control: the
app's own holiday line still passes to every squadron.

**B. T's backstop hides a line from a man who never moved (Opus 4; low).** A line dated ahead (a clock set back) counts
as "left" before anything else is asked. Fix: return "left" for a line dated ahead only where he has a home change on or
before today and the line is a marked input line or not about him; otherwise the normal rule. Test: Opus's probe T;
control: fix read 7's backstop test still green.

**Astra's read did not finish:** its service stopped it as a "cybersecurity risk" before its report. Its last progress
note named three kinds of failure: rights given after a move reviving a line the same day (= D), some moved filers still
told (= R), and "a command can falsely claim the notification writer created its line" — the last NOT yet matched; the
security reader is chasing it, and a fault from that goes in a later commit. Do not build anything for it unless the
host sends it to you.

## Rules
- Each fault its own commit, R first, then D, G, N, H, B (and Astra's, if any); the message says fault, cause, fix,
  test. Red first on `71fdfbfd5`'s code (a temporary worktree or `git show 71fdfbfd5:path` copies; never `git stash`),
  its failing line kept for the report.
- Do not touch `src/engine/` bodies. `perms.ts` changes → `docs/data-model.md` §11 where what it allows changes. Comments
  say WHY, naming the ruling. `docs/file-map.md` for the new test file.
- Checks before you finish (from `raptor-port/`): the touched suites one by one; the whole `npm test` under the checks
  lock (`node scripts/gatelock.mjs exec "multi-sqn-b1-107 — fixread8 unit suite" -- npm test`); `npm run build`;
  `node reference/tfin.js` (728/0); `npm run rulecheck`; `npm run docsize`; `npm run lint:changed` (against `c0c266077`
  if it cannot read main's side). No browser files: nothing a screen draws changes (if one does, stop and say so).
- Commit; do NOT push, merge, switch branch or edit `HANDOFF.md`.

## Hand back (short)
Per fault: cause and fix in a line each, each test's name, its red line on the old code, green after. Every check's
result. The commits. Anything you could not do or where this brief was wrong, plainly.
