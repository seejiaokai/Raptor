# S2 step U1's fourth round — ONE guard in place of more cases (chat 205's brief, 26 Nov 26; agreed with the coordinator, chat 202)

For one Fable builder (D2233). The orchestrator reviews your diff, runs your tests and commits; **you do not commit,
stage, push, build or take the checks lock.** Work only in
`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch `claude/msq-s2-users-685735`).

## Why this round is different

Three fix rounds, three reads by four blind readers. Every read found the main rule sound — no route lets one
squadron's admin see or change what he must not — and every read found another stale-row case. They are one fault
(D2404 — a guard rail before another patch): **an opened row works from what it read when it opened, and only some of
that is checked against now.** This round closes the root, so the next case a reader thinks of is already covered.

## Read first

- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule as it stands: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-read-brief-4.md`; the third round's
  brief and report beside it (`…-u1fix3-brief.md`, `…-u1fix3-report.md`), the second's (`…-u1fix2-report.md`, its last
  section on the test files' spies and `asOther`).
- The third read's proofs (outside the repo; re-run by the orchestrator where named below):
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread3/`
  — `opus/` (`zz-opus-proof-1`, `-2`, outputs), and `fable/`, `security/`, `astra/` as they hold files. Their findings
  are restated below; the readers' replies were not saved as files.

## The one guard

**An opened row keeps a copy of everything it shows and could write over, taken at the press that opened it, and is
judged against the store as it is now — on every draw of the page, on every draw of its own editor, and at the head
of every action it can take. Anything in the copy changed → nothing is written, the row closes, the existing Q13 note
(`changedWhileOpenWords`), once. No new words.**

- **The copy** joins the facts `OpenedOn` already holds (the page's squadron, short or whole, his home, archived or
  not). For the WHOLE row and the ARCHIVED row it holds what the editor draws and what its writes would write over:
  whether he has a sign-in and which account it is; that account's sign-in name, role, master mark, switched on or
  off; each squadron's access line as the row shows it; his callsign; on the archived row also what its boxes show
  (the callsign box, the post-in date). Build it from the same readers the editors draw from (never a second way of
  reading), as one value compared whole — so a field added to an editor later is in the copy by construction, or a
  test fails. **This closes, at once:** a sign-in given or taken under an open whole row; his role, name or a line
  changed by another admin or by the signed-in admin's own Undo or Redo (today the row keeps the old values and its
  Save writes them back — the fresh Opus's finding 1 of the third read: Kestrel's open "Give sign-in" row turns into
  "Save" when Saber gives the man an Admin sign-in, and Kestrel's Save demotes and renames him); and the backlog's
  filed point "the whole row keeps the squadron lines it opened with".
- **The SHORT row keeps what round 2 built** and two reads passed (agreed with the coordinator): it shows the line he
  holds today, holds only the admin's pick, and its Save compares the pick with the store at that moment. Its copy is
  only what it does not already follow live — at least whether he has a sign-in and which account (a sign-in given
  under an open "No sign-in" row is today followed live and tested: keep that behaviour if the row's tests pin it, and
  say which you kept and why).
- **A row's own actions never trip it:** an action that closes the row in the same press needs nothing; one that
  leaves the row open (the archived row's Save name) takes a fresh copy after its write.
- **The whole editor's captured draft is the admin's typing, not the copy:** typing a name, picking a role or a line
  changes the draft, never the copy; "changed" always means the STORE differs from the copy.

## Also in this round

- **A bell line's landing closes an open row** (the fresh Opus's finding 2): `useRingLanding` clears the search and
  moves the Archived fold while drawing; round 3's "did he put it away himself" then reads that as his own act, so an
  open row found by search is held out of sight, its pick lost without a word, and comes back open with no press. A
  bell tap is his own act, like his pick: when a landing arrives for another man while a row is open, the row closes in
  that draw, no note, before the search and fold change. (Once the core's K6 refuses a bell tap over a changed row,
  this only meets an unchanged one.) Proof 2 a lasting test, with a second case for the archived fold.
- **Further cases from the other three readers of the third read** are appended under "Addendum" below, or sent to you
  by the orchestrator; each becomes a test of the one guard where it is a stale-value case.

## Tests first

Every proof named here and in the addendum seen failing on the code as it stands, then lasting tests in
`src/ui/msq-s2-rejudge3.test.tsx` or a new `src/ui/msq-s2-rejudge4.test.tsx`. For the guard itself, beyond the
readers' cases — one test per field of the copy, each: another admin (through `asOther`) changes THAT field under the
open whole row → the row closes with the note once, and each of the row's buttons, pressed with nothing redrawn,
writes nothing; the same set through the signed-in admin's own Undo and Redo; the archived row's fields likewise; and
a test that FAILS if an editor shows or writes a field the copy does not hold (the builder's design choice how — say
how). Kept green, unchanged: every test of rounds 1–3 (a test the guard truly changes is re-pointed by name and
listed, never weakened). Plain-word names; no `zz-` names in the repo.

## Limits and checks

Do not edit `state/store.ts`, `state/perms.ts`, `state/typing-hold.ts`, `state/pick.ts`, `state/accounts.ts`,
`ui/Shell.tsx`, `test-support/msq-world.ts`, or anything under `.claude/`. One test file at a time from `raptor-port/`
(`npx vitest run <file>`): the four `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`, `msq-users-row`,
`msq-s2-lists`, `msq-users-filter`, `msq-guard-open`, `msq-guard-g`, `onedoor-users`, `accounts-ui`,
`accounts-newperson`, `state/edit-rights-readers`, and every other file that draws `UsersPanel` (the third round's
report lists the 39 it ran). `npx tsc -p tsconfig.app.json --noEmit` (supporting only). Never the full suite, the
build or the lock.

## Report

Your file tool may decline a report file: do not go round that — your final reply is the report. What the copy holds
and how it is built; each reader's case failed-before / passes-after; the per-field tests; the test that catches a
field left out; what you kept of the short row and why; files run with counts; anything a person would SEE
differently (expected: the whole row and the archived row closing with the existing note whenever anything they show
changed under them); anything unclear and what you chose. End with a ten-line summary.

## Addendum — the other readers' cases of the third read

(Added by the orchestrator as they report.)

**From Astra's third read** (its report: `…/s2-chat205/fixread3/astra/report.md`; proofs `zz-astra-proof-1`, `-2` there;
both re-run by the orchestrator and failing as it predicted — `…/fixread3/host-rerun-zz-astra-proof-<n>.txt`):

- **A1 — a regrouping of the list recreates the short row's editor and silently drops the admin's unsaved pick.**
  Saber on 149's page with Squadron ticks 149 and 150; Hunter (Plan of both) listed under 149; Saber opens his short
  row and picks View, unsaved; Undo removes Hunter's Plan of 149; Hunter stays listed through his Plan of 150 but under
  that group, so his editor is made anew — View becomes None, the mark goes, Save sends nothing, nothing is said.
  Cause: each group draws under its own parent, so a move between groups unmounts the editor, whose pick is its own
  local state; the third round's check sees him still listed and every opening fact unchanged. **Build: the page holds
  the short row's pick with the open row** (null at a fresh opening, cleared at close; "press the held line to let it
  go" kept; the saved line still read afresh), so a regrouping alone keeps the admin's outstanding choice while the man
  stays listed. Check the whole row for the same loss (a whole row that can change group while open): if it can, its
  typed draft is held the same way or the row closes with the note — never dropped without a word.
- **A2 — an open row put away by leaving Admin → Users (another Admin card pressed, or "Back to categories" on a
  phone) still raises the note later.** Kestrel opens Osprey's whole row, types, presses Admin → Data; Osprey's move
  lands at midnight; the row closes — and the note is said, though Kestrel had put Users away himself. Cause:
  `ui/AdminPage.tsx` already works out whether Users is shown and passes it (`shown`); `UsersPanel` ignores it when
  recording whether the row was drawn, in both note paths (the redraw's and the page-going one). **Build: `shown` joins
  the page's held picture (`PageAt`) and the "was it drawn" test (`shown && rowInView(…)`), and a change of `shown`
  counts among the admin's own ways of putting a row away** (so leaving Users is not read as "left by no act of his").
  Hidden rows are still judged and closed silently.

**From the security reader's third read** (verdict: no hole — nothing lets a write through or shows what the rule
forbids; the three new reads decide only a note; the inventory entry is true. Proofs `zz-security-proof-1`, `-2` and
its own fix trial `fixtry/` in `…/fixread3/security/`; both re-run by the orchestrator):

- **S1 — the signed-in admin's OWN standing changing under his open row drops the row and his typing with no note.**
  Hunter (142's admin, Plan of 149) is on 149's Admin → Users, Osprey's whole row open, a rename typed; Hunter's own
  move to 149 lands at midnight: it ends his Plan and makes him a member of 149, the Admin page is replaced by its
  refusal words, the row and typing go, nothing is said (none of the row's held facts changed; as the list goes
  `isAdmin()` is false, so the page-goes rule is silent). **Build, as part of the one guard: the copy also holds who is
  looking — the signed-in person's own home squadron and whether he is still an admin there** (the reader's fix: a
  fifth held fact `mine`, and `rowChanged` true when it changed and he is no longer an admin — a master admin who moves
  stays an admin and keeps his row); the first redraw after the change closes the row with the note, once; every write
  asks the same through the belt. **And the case round 3 pinned "as built" — another admin makes the signed-in admin a
  member while his row is open — is built now the same way** (the coordinator's limit: typed work is never dropped
  without a word): the note is said once as his standing goes; re-point that pin by name. The note's ending ("Open it
  again.") on these roads is a question parked for the owner — build with the existing words.
- **S2 — a row that changed unseen, then his own pick of a View-only squadron, says the page-goes note** (the rule:
  never for his own pick). Cause: `takenAwayUnder` reuses `closedByHisPick`, whose first term (`pageUnit('own') !==
  on.unit`) is false for a View-only pick from his own squadron's page. Fix as the reader gives it: in
  `takenAwayUnder` only, his pick is "the squadron in view moved, by his own pick or bell tap"
  (`pageUnit('schedule') !== o.on.view && enteredByPick()`); `closedByHisPick` stays as it is for the draw rule.
  Proof 2B a lasting test; proof 2A's four passing tests (his own move landed with nothing redrawn: Save, Suspend,
  Archive, Delete write nothing) kept as pins.

**From the fresh Fable's third read** (proofs `zz-fable-proof-0`, `-1`, `-2` with outputs in `…/fixread3/fable/`; no
route lets a write through or shows what must not be seen): its two findings are the security reader's S1 and S2 again,
found blind — **F1 = S1** (proof 1, test A fails at its line 71; A2 shows the silence is whole; control B passes) and
**F2 = S2** (proof 2, test A fails at line 76; controls B and C pass). Its fix for F1 differs in place, not in aim: judge
at the DRAW (the draw runs before the app makes his session a member's) — `mine` held at the press but kept out of
`rowChanged`; in `useOpenRowJudged` a term "his own squadron changed and he is no longer an admin of the squadron the
row opened on" closes with the note; `mine` held again with `view` on a draw the row survives (a master admin's own
move leaves his row open); if `adminOfUnit` is read a second time in `UsersPanel.tsx`, the edit-rights inventory
(`state/edit-rights-readers.test.ts`, `docs/data-schema.md`) says so with its why. Choose the place that holds both
readers' proofs AND the re-pointed "made a member by another admin" case (S1's second half — where his home does not
change, so a term keyed only on his home will not catch it: the guard must ask about his standing, not only his
home). Proof 0's ten soundness tests are kept where the step's tests do not already hold the same thing; each named
case is merged where two readers proved one thing.
