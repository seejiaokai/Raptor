# Fix read 5 — the builder's brief for its four open faults (chat 113, 19 Nov 26)

Branch `claude/multi-sqn-b1-107` (pull request 806, draft), head `8474d3b85`. You are the builder (Opus). Read first:
`.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md` §Posting out (D2218, D2222, D2223),
the full rows (`grep -h '^| D2218 |\|^| D2222 |\|^| D2223 |\|^| D1693 |\|^| D1699 |' .claude/decisions-full/*.md`), and
the three reports this brief acts on, all in `raptor-port/docs/superpowers/briefs/`:
`2026-11-19-multi-sqn-b1-fixread5-opus.md`, `…-fixread5-astra.md`, `…-fixread5-walk.md` (and the read's own brief
`…-fixread5-brief.md` for the code under review). Code: `src/state/notices.ts` (`noticeAboutHim`, `noticeLeftBell`,
`noticeLive`), `src/state/perms.ts` (the gate's verified-replay pass ~1860–1890, `toldBy`, the input pass ~1990–2000),
`src/state/undo-wire.ts` (`leaveOut`), `src/leavewar/sync.ts` (`warNoticesReversed`, `atWarHome`, `postingLinesOf`,
`retractPostingLines`), and the input pass that tells a filer (`noticePass`).

## The four faults — each reproduced RED first by a test that fails on `8474d3b85`, then fixed at its cause

1. **The Redo of a decision on a moved man's own leave is refused whole; and a read line about his own leave goes
   silently when his old squadron undoes it** (the Opus read's 1 and 2 = Astra's 2). Decided by **D2222**: a line about
   his own leave follows him — undone by his old squadron after his move, an unread line goes, a READ one is struck
   "taken back" (D1693, D1699); its Redo puts the line back (and "again" where a "taken back" stood). Fix as the Opus
   read and Astra's 2 both describe: the gate lets a verified replay put back, and the "taken back" / "again" follow-up
   write, ONLY a line about its addressee (`noticeAboutHim`) that the restore itself removed or puts back — keep the
   timeline, actor, exact-image and conflict checks; forged restores still refused. `warNoticesReversed` stops skipping
   a non-home addressee for a line about himself (squadron-business lines — bidding open / close — keep the home
   filter). Test: a refused request with no input change beside it (Astra's point 4), approved and refused both, read
   and unread, Undo → Redo → Undo; the no-move control kept.
2. **A moved filer is still told about inputs he filed for his old squadron's men** (the Opus read's 3). Decided by
   **D2223**: after a move an input line stays with a man only where he is named in that input (or it is his own
   request's line); the input pass stops telling a filer who is now neither that man's admin nor in the input; `toldBy`
   narrowed to match; `noticeAboutHim` counts an input line as about him only where he is named in it (look at how the
   read rule gets the input — by `iid` — and keep it a read, never a write). The master stays an admin everywhere, so a
   master filer is still told. Test both the writer (no new line to Hunter after his move) and the read rule (an old
   input line about another man leaves his bell from the move day).
3. **A man who returns to a squadron is told "taken back" of a posting line D2218 had retired** (Astra's 3). Fix as
   Astra gives it: the posting take-back keeps using every stored posting fact to find the newest run, then leaves out
   each original line `noticeLeftBell` retired — never deleting it nor writing its "taken back"; the same history-aware
   check in the Leave War's reversal writer (`warNoticesReversed`) for squadron-business lines. Test read and unread,
   move away and back, two moves; personal and never-moved controls kept.
4. **The walk's F4 FAIL** — Saber posts Ranger out; Hunter (142, never moved) reads the posting line; Saber presses the
   day window's "Undo post out (PO)"; Hunter's bell shows "Nothing new" — no "taken back" line (D1699 says he gets one).
   The walker read the line in a SECOND browser tab (`scripts/handpass/msq/msq-fr5-f4.mjs`, runs `f4d-read`,
   `f4p-read`). FIRST find the cause, before any fix: does the read record Hunter made in tab 2 reach what Saber's tab 1
   reads when it decides who read the line (the store's in-memory read marks — is there a cross-tab reload of them?),
   or is it `5b8357f92`'s posting retraction? Prove it with a unit test that runs the same order in ONE world (read
   recorded, then Undo post out): green means the app is right and the miss is two tabs of one browser holding stale
   read marks — then STOP on that one and report it with your evidence (do not build cross-tab sync: that is the
   database step's); red means a real fault — fix it red first.

## Rules
- Each fault its own commit (records separately), message saying fault, cause, fix, test. Red first: run the new test
  on `8474d3b85`'s code and keep its failing output line for the report.
- Do not touch `src/engine/` bodies. A change in `perms.ts` updates `docs/data-model.md` §11 if what it allows changes.
  New tests in the files the earlier fixes used (`grep -l noticeLeftBell src/**/*.test.ts`). Code comments say WHY.
- Also confirm the security read's FR5-SEC-1 proof (`eeff03fc0`, `warPlacerForged`) is green and covers Astra's 1 —
  Astra's case: Hunter's own LL across his move, 149 approves, Hunter rewrites only `lwBy`/`lwAt` → refused.
- Checks before you finish (from `raptor-port/`; take the lock `node scripts/gatelock.mjs take "multi-sqn-b1-107 —
  fr5 fixes"` for the full unit suite, release at once): `npm test` (whole), `npm run build`, `node reference/tfin.js`
  (728/0), `npm run rulecheck`, `npm run docsize`, `npm run lint:changed`. Browser files: only the Leave War's
  (`npx playwright test e2e/leavewar*.spec.ts`, under the lock) if you touched anything it draws.
- Commit; do NOT push (the host pushes, after reading your diff). No merge. No `HANDOFF.md` edits.

## Hand back (short — the host's context is tight)
Per fault: cause in one line, fix in one line, the test name, its red line on the old code, green after. Fault 4:
which way it went and the evidence. Every check's result. The commits. Anything you could not do, plainly.
