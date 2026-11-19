# Fix read 7 — the builder's brief for its open faults (chat 116, 19 Nov 26)

Branch `claude/multi-sqn-b1-107` (pull request 806, draft). The code under `raptor-port/src` is as at `69a5bdb1d`, which
the four readers read. You are the builder (Opus). Read first: `.claude/rules/raptor-executor.md`,
`.claude/rules/decisions/people-accounts.md` §Posting out (D2218, D2222, D2223), the full rows
(`grep -h '^| D2218 |\|^| D2222 |\|^| D2223 |\|^| D2194 |\|^| D1693 |\|^| D1699 |\|^| D148 |' .claude/decisions-full/*.md`),
and the four reports in `raptor-port/docs/superpowers/briefs/`: `2026-11-19-multi-sqn-b1-fixread7-{astra,opus,fable,security}.md`.
Each gives proofs and fix steps; where they differ, this brief decides. Harness to copy for tests:
`src/leavewar/multi-sqn-fixread6-retired.test.ts`.

Nothing here is a product question for him — each is the code not doing what D148, D2218 and D2223 already say.

## The faults — each reproduced RED first by a test that fails on `69a5bdb1d`, then fixed at its cause

**U. A member's Undo is refused (Opus F1 + F2, Fable 1).** Hunter files LL for Ranger; Ranger deletes it (or changes it,
then Hunter moves) and presses Undo: "That couldn't be completed just now." Introduced by fault A's `changeFiler` (a
restore putting an input back has no before-image). Take **Opus's fix** (it covers both cases): in the member door's
`case 'notices'`, a restore's delete of his own line on that input passes when `toldBy` has the addressee OR the
verified replay (`REPLAY(env)`) vouches for the change. Leave `changeFiler` as it is for puts. Tests: F1, F2, the Redo
of each; control: a forged restore (no replay) deleting someone else's line still refused.

**M. An input line's mark can be dropped, widened or emptied, or a line can name an input the command does not change
(SEC7-1, Astra A1, Opus residual 3).** The `filerMarkOk` check is asked only at the `toldBy` door; the own-man door
lets an admin put any line, or rewrite an existing one, to a man of his squadron the day before he moves — and since
fault C an unmarked line stays for good. Fix (security reader's steps, both sections of the gate): every notice PUT that
carries a non-empty `iid` and is not a verified replay must (1) name an input this command changes
(`changedInputs.has(iid)`) and (2) pass `filerMarkOk`; an existing line's `fu`, `to`, `iid` and `at` may not be changed
except by a verified replay. Tests: SEC7-1's two lines (`nsec7a` unmarked, `nsec7b` naming no input), Astra's three
(delete `fu`, widen to `['u142','u149']`, `[]`); control: the pass's own line to his own man accepted.

**P. Plan (or master) given after a move brings a retired line back (Astra A2, Fable 2).** `noticeLeftBell` judges each
move day by `toldIn`, which reads today's grants and master flag. Fix (Fable's steps): `setGrant` writes `from:
todayIso()` on the grant row; `toldIn`, when given a date, counts a grant only if it has no `from` (stored before —
D56) or `from <= iso`; do the same for the master flag (a dated `masterFrom`, written where master is set) — in
`toldIn` only, never in the gate's `levelFrom`. Store change → `docs/data-schema.md`, `docs/data-model.md`. Tests: read
and unread, Plan given after, master given after; control: Plan held before the move keeps the line.

**T. A line dated in the future never leaves (SEC7-2; older).** `noticeLeftBell` returns false while the line's day is
not yet past; no door limits a put line's `at`. Fix: in both sections, a notice put that is not a verified replay must
have a finite `at` within 5 minutes of now; backstop: `noticeLeftBell` treats `at > now + 5 min` as left. Tests: P2a
(admin), P2b (member).

**F. A genuine Undo / Redo accepts a follow-up line that is not owed (Astra A3; Opus and Fable noted it).** `followUpsFor`
gives the content; whether it is owed (the original read, a "taken back" to answer, the last "again" read) lives only in
`warNoticesReversed`. Fix: one pure function gives content AND eligibility, from the notice and read records as they
stood before the command; the writer and the gate both call it. Tests: Astra's two (an unread refused decision's
injected "taken back"; an injected "again" on a Redo with nothing to answer).

**S. An admin can ride an unsigned line by labelling his command an app act (SEC7-3; low).** `n.by == null &&
APP_ACTS.has(env.type)` trusts the label. Fix: the pass records the ids it mints in the running command
(`sched-commit.ts`, beside `noticePass`); a no-maker line passes only if its id is among them. Test: P3.

**Q. A filer who never moved is not told once the named man moves (his D2225, 19 Nov 26 — Q17, drawn as picture 12b).**
Hunter (142 admin, never moved) files Ranger's leave 23–27 Nov; Ranger moves to 149 from 25 Nov; Saber changes its
remark — Hunter must be told (23 and 24 Nov are still 142's); as built he is told nothing, because `filerTold` reads
the named man's home today. Fix: `filerTold` counts the filer where, on any of the input's days, a named man's home
that day is the filer's squadron (or the filer is its admin, master or Plan); the gate's `toldBy` the same, one body.
Tests: Q17 red first; controls: Q16 (a member filer, nobody moved) still told; a moved filer still not told (D2223);
Hunter not told where none of the input's days is still 142's.

## Noted, not built
- Fable's "frozen at writing" reading (a line's named-or-filer judgement is fixed when written): consistent and never
  brings a line back — the closing report names it to him as the agent's reading of D2223.
- Astra: `openNotice` does not re-check a line on a stale tap; a two-squadron Transfer take-back (D2215) is not yet a
  saved route — both to the evidence sheet, not faults now.

## Rules
- Each fault its own commit, U first, then M, P, T, F, S; the message says fault, cause, fix, test. Red first on
  `69a5bdb1d`'s code (a temporary worktree or `git show 69a5bdb1d:path` into scratch), its failing line kept for the report.
- Do not touch `src/engine/` bodies. `perms.ts` changes → `docs/data-model.md` §11 where what it allows changes.
  Comments say WHY, naming the ruling. `docs/file-map.md` if a file is added.
- Checks before you finish (from `raptor-port/`): the touched suites one by one; then the whole `npm test` under the
  checks lock (`node scripts/gatelock.mjs exec "<branch> — fixread7 unit suite" -- npm test`); `npm run build`;
  `node reference/tfin.js` (728/0); `npm run rulecheck`; `npm run docsize`; `npm run lint:changed`.
- Then fix read 8 of the fixes: Astra, a fresh blind Opus, Fable (D2224), the security reader — copies exported
  without pictures, with `core.longpaths`, and with the branch's handoff block blanked in each copy (skill note 978).
