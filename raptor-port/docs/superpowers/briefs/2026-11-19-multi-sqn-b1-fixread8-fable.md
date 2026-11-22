# Fix read 8 — Fable's report (blind; 19 Nov 26, chat 117; copy at `71fdfbfd5`)

Saved whole as handed back; not yet reproduced by the host.

---

# Fix read 8 — Fable's blind read (copy at `71fdfbfd5`)

No handoff block was pasted after a compaction; none was read. I opened only the brief, `FIXES.patch`, `FIXES-LOG.txt`, the fix read 7 brief (its "not a finding" list) and the source. No file under `raptor-port/src` was changed: my one proof file (`src/leavewar/zz-fr8-fable.test.ts`, built on the harness of `multi-sqn-fixread7.test.ts`) and its temp folder are deleted. 11 probes run: 4 red (the two findings below), 7 green (negatives).

## Findings, by consequence

### 1. Fault P is not closed at the gate: a grant's day can be left off or backdated, and the retired line comes back (introduced by this round's fix P — the date is new and nothing guards it)

**Failure (run, red).** Hunter files for Ranger; Saber's change on 15 Jul tells Hunter (`fu: ['u142']`). Hunter moves to 149 from 16 Jul; on the 17th the line is off his bell. On the 18th a plain 142 admin's command puts a grant row `{ id, account: 'acad2', unit: 'u142', level: 'admin' }` with **no `from`**, and separately with `from: '2026-07-01'`.
- `ownershipViolation` answers null for both (two probes, each red on "expected not allowed").
- With the row stored, `noticesFor('prowler')` shows the retired line again (red).

Harness note: I flipped the seeded `acoutlaw` account's role to admin in `ACCOUNTS_LIST`, because the fix read 7 tests' hand-built `outlaw` actor is not an admin to the unit-row check.

**Cause.**
- `units-model.ts validGrant` keeps any valid `from` and accepts none.
- `perms.ts unitRowViolation` (the grant branch, about lines 1690–1705) checks who and what, never the day.
- `notices.ts adminThen` reads a missing `from` as "from always" — right for old stored rows (D56), but it fails open for a NEW row.

**Fix, step by step.**
1. In `unitRowViolation`, for a grant put that is not a restore's verified replay:
   - no before-image, or `b.level !== n.level`: require `n.from === today`, else return `a right not dated today (${id})`;
   - same level as before: require `n.from === b.from`.
2. Same rule for `Account.masterFrom` in `accountShapeAndMasterViolation`: when the mark goes on, `masterFrom === today`; otherwise unchanged from the before-image; absent without `master`. Not run by me, same class: `masterCh` only notices a change of `master`, so a rewrite of `masterFrom` alone passes by whoever may write that account row.
3. Red tests: the two envelopes above.

### 2. Fault P, the move day itself: Plan or the master mark given ON the move day still brings the retired line back (residual of fix P)

**Failure (run, red, twice).** Same line; Hunter is 149's from 16 Jul. On 16 Jul the line is off his bell. That day Saber runs the real `setGrant('acad2','u142','admin','prowler')` — the line is shown again. Same with the real `setMaster('acad2', true)`.

**Cause.** `adminThen` counts `g.from <= iso` and `masterFrom <= iso`. A move takes effect at the start of its day (`setHome`: a change is "from tomorrow"), so a right dated the move day was always given after the move.

**Fix.**
1. In `notices.ts adminThen`, change both comparisons to strictly before: `acct.masterFrom < iso` and `g.from < iso` (no-date rows still count from always).
2. A right given on the 15th after the move was saved still counts (from 15 < 16) — keep the existing control.
3. Red tests: the two above. Update the comments in `units-model.ts`, `accounts.ts` and `data-model.md` §11 ("held before that day began").

Not a finding, but worth one line to the owner: a right held on the move day and later removed or lowered retires the line on that later day (today's row is read). It then stays off if re-given, so it is consistent with D2223 "only while he is still that man's admin".

## The builder's five choices

1. **M's registry (`notePassMade` / `passMade`)** — sound.
   - It is a `WeakMap` keyed by the command's own envelope, written at one call site (`sched-commit.ts tellPass`), with the same `Set` that `TOLD` holds.
   - A restore, seed or remote command never reaches `tellPass` (`tells()`), so it has no entry.
   - A failed command's envelope is simply dropped; nothing carries across commands.
   - A hand-built envelope has no entry, so it falls to "changes that input, with the pass's mark".
   - Residue, not a hole: a line the pass minted for a bare write to another squadron's man is still refused by the squadron test, as before this round.
2. **T applies to new lines only** — sound. `lineRewritten` freezes `at` on a written line, and the backstop in `noticeLeftBell` covers a line already held.
3. **The re-dated fixtures** — none lost what it proved. Each still reaches the refusal it pins; the two `units-sqn-fixread2` cases changed to `iid: ''` or given `fu` now pin only the squadron test, as their comments say.
4. **P's "no date counts from always"** — right for stored rows (D56), but it is the fail-open of finding 1 for new rows.
5. **Q's fallback to today, filer's own home read today** — matches D2225 and D2223.

## Explicit negatives (probes run, green)

- **T, Undo and Redo over the 5-minute window.**
  - Admin files for his own man; 10 minutes later Undo, then Redo: both pass, line gone then back.
  - Member changes a remark; 10 minutes later Undo and Redo: pass.
  - Admin files, deletes 10 minutes later, next day Undo and Redo: pass.
  - 149's refusal of Osprey's leave; 10 minutes later Undo and Redo: pass, the line back with its old time.
- **T, backstop.** The bell's worked-out lines ("bidding ended", "off the manpower") are dated midnight of a day not after today on the real clock, so the "dated ahead counts as left" rule never hides them. The test-only today override is not reachable in the app.
- **T, other roads.** Every writer (`noticePass`, `noticeHoliday`, `noticeWar`, `noticePosting`, `noticePostingBack`, the restore's follow-ups) stamps `Date.now()` inside the command. The posting pass runs as the app, which the admin section does not judge. I found no import or seed road that puts old-dated lines through the gate — a search, not a proof.
- **F.** The writer and the gate ask one body. The gate's rebuilt "bell before the command" drops the command's new lines and puts deleted ones back. Follow-up lines are never part of a step, so the tie-break order cannot differ between the two.
- **U.** The widened delete door needs `by` to be himself, his own input in the same envelope and the verified replay; the forged-restore controls still refuse.
- **S.** A no-maker line now needs both the app-act label and a pass-minted id.
- **M.** A filer line carrying `in`, `out` or an empty `what` beside a correct mark cannot be made permanent: `noticeLeftBell` judges a marked line by its mark before asking whether it is about him.
- **Q.**
  - A filer who never moved (member or admin) is told for an input with any day still his squadron's, and not told where none is.
  - A moved filer is still not told.
  - Pass, gate and mark share one body.
  - An input crossing a year end is not a case the app writes (`inputCoversDate` reads both ends with one year).
- **Every place that shows a bell** (list, unread count, mark all read, the take-back writers, the restore's `leaveOut`) reads `noticeLive` / `noticeLeftBell`; storage and the gate's own facts do not.

## Noted, not findings

- A line marked `['u142','u149']` (named man moving on a later input day) stays with a filer who later moves to 149 himself. Consistent with "concerns both" (D2194).
- An admin can still write a no-input line "about him" (a leave decision) to his own man the day before a move. That is his real power, unchanged by this round.
- The 5-minute window will hide a line for a few minutes on a device whose clock lags the writer's. The builder's note already leaves the time to the server at the database step.
