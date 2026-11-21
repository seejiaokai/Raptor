# Fix read 10 — the fresh, blind Opus read (20 Nov 26, chat 118; copy at `064079abf`, code = `945c6de69`)

No handoff block was pasted. Only this round's brief read. Proofs in chat 118's scratch,
`fr10-opus/raptor-port/src/zz-opus10/`, each run alone, each red on this code; the fix read 9 suite 26/26.

## O10-4 (high): a right changes hands through the ACCOUNT row and keeps its old day — fault C incomplete (a missing call site)
- Saber gives Osprey's sign-in (acus9) Plan of 142 on 15 Jul. Hunter moves 142 → 149 on 16 Jul; his 142 filer line
  retires. On 18 Jul Kestrel (149 admin, not 142's) uses Admin → Users' own edit: `updateAccount('acad2', {pid: <a spare
  149 man>})`, then `updateAccount('acus9', {pid: 'prowler'})`. Both save; Hunter's retired line comes back, read or
  unread (against D2218, D2223); Hunter's person credited with Plan of 142 dated 15 Jul, moved there by a 149 admin. The
  same through a bare `commitSettingsIntent` swapping the two rows' persons.
- Cause: `adminThen` reads the grant through `accountOfPid(to)`; `grantKept` compares only the grant row; a grant whose
  account is pointed at another person never changes its own row, so neither the gate nor `restoreRedated` sees it;
  `masterKept` covers this for the mark only.
- Fix: (1) `pidFrom` on the account row — the day linked to its current person; `updateAccount` writes today when `pid`
  changes; (2) gate, in `accountShapeAndMasterViolation` beside G2: `is.pidFrom === (was.pid === is.pid ? was.pidFrom :
  today)`; old rows with no day count from always (D56); (3) `restoreRedated`: a restored account row whose `pid`
  differs from the stored row's gets `pidFrom = today`; (4) `adminThen` counts a grant and the mark from the later of
  its own day and the account's `pidFrom`; (5) separately: may a 149 admin re-link an account holding a 142 right?
  Today he can, handing 142's Plan to whoever is linked.
- Proof: `c-account-repoint.test.ts:113` (`{ok:true, back:true}`), `:130` (the real `updateAccount` path, `{r1:null,
  r2:null, back:true}`). Introduced? No — fault C closed only the grant-row door.

## O10-2 (high, security): a new line made only of holiday parts skips every check — D and E incomplete
- Outlaw (142 admin) signed in, through `writeInputsBatch`, pushes `{to:'kes9', by:'kes9', iid:'', name:'149: all
  leave cancelled — report 0600', what:[{k:'oilhol',…}]}` — saved on Kestrel's 149 bell, signed as Kestrel. The gate
  also allows it signed as Saber on Ranger's bell (a member) and on Osprey's (a 149 member). On a scheduler's bell it
  shows its made-up words whenever an input on those dates needs an OIL answer, and, being newest, takes the real
  holiday line's place for those days (`noticeLive`).
- Cause: `adminOwnerViolation` `continue`s for any new holiday-shaped line (`c.before == null`), skipping the maker
  check, the owner check and D's registry; `oilhol` is in `WAR_LINE_KINDS` but `noticeHoliday` never records its ids;
  only the date check still applies.
- Fix: (1) `noticeHoliday` records each minted id (`noteWarMade(id)`, or a `holMade` registry); (2) the skip becomes
  `if (n === c.after && c.op === 'put' && c.before == null && warMade(env)?.has(String(n.id))) continue`; (3) the replay
  branch unchanged; any other new holiday line takes the ordinary checks.
- Proof: `e-holiday-forge.test.ts:103` (saved), `:108` (allowed on a member, signed as Saber). Introduced? No — the
  new-line skip is fix read 8's; D left `oilhol` out of its registry; E kept the open skip as its control.

## O10-1 (medium): an Undo of a right taken off AFTER a move loses the lines that right kept — introduced by A (`f5fb03fd1`)
- Saber makes Hunter master on 10 Jul; Hunter files his line; he moves on 12 Jul — his 142 line stays (master that day).
  On 15 Jul Saber takes the mark off by mistake and presses Undo at once: the mark comes back dated 15 Jul, no longer
  counting on 12 Jul — the line stays gone. The Undo does not put the world back (D148); before A it did. The grant
  version cannot be reached through the app's doors (a move drops grants, D2203; `setGrant` refuses one in his own
  squadron before the move).
- Cause: `restoreRedated` reads any right turned on as "given today"; it cannot tell a right absent on the move day
  (Fable F1: correct to re-date) from one held through the move and taken off after it (wrong).
- Fix: (1) give the redate hook the day the right went off — for an Undo the step's own day, for a Redo the day of the
  Undo that took it off, stamped on the entry when undone; (2) keep the recorded `from` / `masterFrom` when no home row
  of the account's person has a `from` after that day and on or before today, otherwise today; (3) the gate's replay
  exemption asks the same predicate; (4) F1, F1b, O9-2 and the grant case still hold (a move falls between off-day and
  today in each).
- Proof: `a-undo-removal.test.ts:108` (`from 2026-07-15, shown false`; expected `2026-07-10, true`).

## O10-3 (low): F's exception judges a line by the rights he holds now — introduced by `945c6de69`
- Hunter moved 16 Jul, given Plan of 142 on 17 Jul; on 18 Jul gets a filer line through that grant, dated 10 minutes
  ahead, beside an on-time twin; then the Plan is removed: the line dated ahead leaves his bell, its twin stays; eleven
  minutes later both show. An Undo or Redo putting that line back inside those minutes has `leaveOut` drop it for good.
- Cause: the exception asks `homeOn(to, today)` and `adminThen(…, today, true)` now, not as things stood when written.
  It never keeps a line he should lose.
- Fix: keep the exception only where his last move day is after `dayOfAt(min(at, now))`; or accept it until the
  database step, where the server sets the time.
- Proof: `f-exception.test.ts:109` (`now: [true, false]`).

## The builder's choices
1. F's exception: supported in aim, residual O10-3; it can only hide lines. A line with no time can still pass the
   gate's slack (written before the move at most 5 minutes before midnight, dated on or after the move day — stays for
   good); needs two disagreeing clocks — waits for the database step.
2. A Redo a day later dated today: right for a Redo; wrong for an Undo of a removal made after a move (O10-1).
3. B's bare resync callers: supported — `resetSession`, `loadWeek` swap, `workOutLoadedWeek`, `writeSeedRows`, boot,
   `histRestore` and `postRestore` (inside restores, which tell nobody), the after-pass deferred effect; commands that
   enlist with no resync carry the bare write as their own change, so the bell's image agrees.
4. Registries: supported, two gaps — `warMade` vouches for an id, not an image (an invented `part` through `noticeWar`
   is vouched for; only a server check could tell); `noticeHoliday` has no registry (O10-2).
5. Grants changed and changed back: supported — re-pointed and back in one command, nothing written; removed and given
   again in one command at the same level refused, misleadingly, "not dated today" (no app door does it); across two
   commands dated today. The hole is O10-4.
6. E: supported for an existing id and for replays; a brand-new forged line is O10-2.

## Explicit negatives
- A: the restore's re-dated image and the gate ask the same predicates — a restore never refused for its day;
  conflicts judged by revision; the rename control keeps its day; the mark moved to another person dated today.
- B: the five sites follow W's three steps; `isEnlisted` keeps the outer image for a child; the posting pass joining
  Post out unchanged apart from the image.
- D: every writer of a war part (`tellWar`, `tellBidding`, follow-ups, the posting pass, `takeBack`) mints inside a
  command; derived lines (`lwend:`, `po:…none`) never stored; no app path rewrites a stored war line in place.
- E: no app path deletes or rewrites a holiday line but its maker's Undo or Redo (replays).
- F: a line more than a day ahead still leaves (control green); past-dated lines as before.
- Respected the known question and D56. Rulings: none (a read).
