# S2 step U1's fifth round — the fourth read's findings (chat 205's brief, 26 Nov 26)

For one Fable builder (D2233). The orchestrator reviews your diff, runs your tests and commits; **you do not commit,
stage, push, build or take the checks lock.** Work only in
`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch `claude/msq-s2-users-685735`).

## Where things stand

The fourth round (e1d116deb) made ONE guard: a whole row and an archived man's row keep a copy of all they show
(`Shown`, built by `shownOf`) and who is looking (`adminThere`); `rowChanged` judges the store against it on every page
draw, every editor draw and before every action (`askAgain`); what the admin types is page-held (`Typed`). Then the
batch branch came in (the core's leave-guard reports, `useGuardWork`). Four blind readers read the merged code
(ef384e302). All four: **no way for one squadron's admin to SEE what he must not; one person alone cannot be made to
write what the rule forbids.** What they found is below — every proof re-run by the orchestrator and failing as its
reader said. This round closes them; nothing else changes. No new words anywhere (the Q13 note,
`changedWhileOpenWords`, is the only note).

## Read first

- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule as the readers were given it: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-read-brief-5.md`.
  The fourth round's brief and report beside it (`…-u1fix4-brief.md`, `…-u1fix4-report.md`).
- The readers' reports and proofs (outside the repo), in
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread4/`:
  `security/report.md` with `zz-security-proof-1..5.test.tsx`; `astra/report.md` with `zz-astra-proof-1..3.test.tsx`;
  `opus/report.md` with `zz-opus-proof-1.test.tsx`; `fable/` as it holds files (its reader had not reported when this
  was written — the orchestrator sends its cases, or see the Addendum). The orchestrator's re-runs:
  `host-rerun-zz-*.txt` there. Line numbers in the reports are of ef384e302; two small merges have landed since —
  find each place by name.

## The fixes

**1. Who is looking is REQUIRED, not only compared (security 1a and 1b; Astra 1 — class (a), a write let through).**
Today `adminThere` asks only his level, answers true when his account is gone, and `rowChanged` only compares it with
what it was at the press. So: (1a) the signed-in admin suspended, archived or deleted under his open row, nothing
redrawn — Save, Suspend, Archive, Delete (whole row) and the short row's Save still write; (1b) made a member, nothing
redrawn, and THEN he presses a row open on the page still standing — it opens with "not an admin" as its baseline and
Save and Suspend write. Build, as the security reader gives it, checked against Astra's four points:
- `rowChanged` also answers "changed" when the app's own question says his session no longer stands —
  `sessionLapsed()` (`state/accounts.ts`: suspended, archived, deleted, account gone, role changed, put on another
  person; a hand-made test session never lapses) — so every draw and every action closes the row with the note and
  writes nothing.
- A press that would OPEN a row on a session that no longer stands opens nothing and makes the app repaint
  (`notify()`), so the app ends or remakes his session at once (`toggle`).
- And require the standing, not only compare it: a row never opens, and never stays, for a real signed-in account that
  is not an admin of the squadron the row opens on. Judge what that does to hand-made test sessions (no account) —
  they stay as today.
- Kept silent, as today: his own Logout, his own switch to the member view (pin both if not pinned).
- Tests: the 18 failing cases of security proofs 1 and 2 and Astra's proof 1 as lasting tests (merged where two prove
  one thing); the passing cases of those files and security proof 5's four (the clause closes nothing it must leave: a
  plain open row across draws; a pick of a squadron he only views; a master admin's own move landing; a right of his in
  another squadron taken) as pins. Run `src/state/edit-rights-readers.test.ts`: if its scan counts the new reader, list
  it with its reason and add its line beside `adminThere`'s in `docs/data-schema.md`.
- NOT yours: the doors and the commit gate accepting a suspended or just-demoted session (`state/accounts.ts`,
  `state/perms.ts`) — the orchestrator files it.

**2. A deleted man's row never writes (security 2 — class (a)).** An archived man with NO sign-in, deleted under his
open archived row: nothing the copy holds changes, so "Save name" renames the deleted man and says "Renamed …". Build:
`rowChanged` also answers "changed" for a deleted man; the page's draw rule still closes a deleted man's row with NO
note (it tests `gone` first); a press gives the usual note and writes nothing (the brief's accepted corner). Proof 4A's
failing case a lasting test; its seven passing cases pins.

**3. The archived row's boxes are the page's too (the fresh Opus 1 = Astra 2 — class (b), typed work dropped without a
word; also the backlog's `[USERS-ARCH-FOLD-DRAFT]`, older than this step).** The callsign box and the post-in date live
in `ArchivedEditor`'s own state, so shutting the Archived fold or a search that hides the row unmounts them: the row
comes back open on his old callsign. Build, as both readers give it: `Typed` gains the two boxes (started from the copy
at each fresh opening, thrown away by `closeRow`); `ArchivedRow` / `ArchivedEditor` are handed `typed` and `onTyped` as
`PersonRow` is; the editor's two `useState`s go (`err` and the armed Delete stay local — a Delete is never left armed
across a redraw, as today); after its own Save name the row takes its fresh copy AND keeps the post-in date he picked.
Add `'Typed'` to §20's `ARCH_MAY_USE` with its reason. Opus's 1a and 1b and Astra's proof 2 (both boxes, by fold and by
search) as lasting tests.

**4. The row's report to the leave-guard comes from the PAGE (the fresh Opus 2 and 3; the security reader's note —
agreed with the core chat 204, whose guard it is).** Today the `'userrow'` report lives in `PersonEditor` and the
`'archrow'` one in `ArchivedEditor`; the short row reports nothing; and a row he hides by his own search keeps its
typing (the page holds it) but stops counting, because its editor unmounts. Build:
- Both reports move up into `UsersPanel`, worked out from what the page holds: the open row, its copy and `Typed`.
  `'userrow'` counts while a WHOLE row's typing differs from its copy (`typedDiffers`) or a SHORT row's pick differs
  from the line he holds now (the very test that marks it "not saved" — lift it into one shared helper, so the mark and
  the count cannot disagree); `'archrow'` while the archived row's boxes differ from its copy. A row hidden by his own
  search, a tick or the shut fold still counts (agreed with chat 204: its doors do not need the row on screen).
- Keep the literal call shapes `useGuardWork('userrow', …)` and `useGuardWork('archrow', …)` in `ui/UsersPanel.tsx`
  (the core's roll-call test looks for them in that file), and keep `data-editing` / `data-restoring` on the drawn
  rows. Leave `useGuardSection('users', …)` and the add form's `'addperson'` line exactly as they are.
- Take `useGuardWork` and `typedDiffers` back out of §20's allowed lists where an editor no longer uses them.
- Correct the comment above `ForeignEditor` that says the whole row "has no such report yet".
- Opus's proofs 2 and 3 as lasting tests **in an `msq-s2-*` file**. Run `src/ui/msq-guard-rollcall.test.ts` and
  `npx vitest run src/ui/msq-guard-open.test.tsx -t "userrow"` (the whole file takes about 14 minutes — run it whole
  once, at the end). **Those two files are chat 204's: if one goes red because the report moved, do NOT edit it — put
  the failing lines in your report.**

**5. A bell line's landing for another man closes a stale row SILENTLY (Astra 3).** One person and the clock: Osprey's
move lands with nothing redrawn while his whole row is open; the admin taps a bell line that lands on another man; the
row closes — and the note is said, though the landing is his own act. Cause: `useRingLanding`'s close queues state, the
same render then judges the old row and schedules the note. Build: a fresh landing for a different man is known before
the previous row is judged, and that close takes precedence in the same render (hooks unconditional; a landing for the
man whose row is open still judged as today). Astra's proof 3 (plain and under StrictMode) a lasting test.

**6. A short row whose man is made a master admin under it (the security reader, by reading — class (b) if true).**
A pick made, then another admin makes him a master admin; Save closes the row and drops the pick with no word (the
master-admin branch of the short row's Save). Write the test first; if it fails as read, the row closes with the note
(his row did change while it was open) — on the draw where a draw comes, at Save where none does.

**7. §20's test, tightened (the security reader's and Astra's judgement of it).** It would not fail if a value of the
man were handed to an editor as a NEW PROP from `PersonRow` / `ArchivedRow`, or if a listed part began reading the man.
Add: each editor's props are exactly today's names (a new prop fails the test until listed with its reason); and say in
the test's comment what it still does not prove (parts it trusts; his squadron rows and postings, which the four
judged facts hold).

## Limits and checks

Tests first — every proof seen failing on the code as it stands, then lasting tests in a new
`src/ui/msq-s2-rejudge5.test.tsx` (or beside their kin in rejudge4), plain-word names, no `zz-` names in the repo.
Every test of rounds 1–4 kept green and unchanged (one the round truly changes is re-pointed by name and listed, never
weakened). Do not edit `state/store.ts`, `state/perms.ts`, `state/typing-hold.ts`, `state/pick.ts`,
`state/accounts.ts`, `ui/Shell.tsx`, `ui/guard.ts`, `ui/guardnote*`, `test-support/*`, chat 204's test files
(`msq-guard-*`), or anything under `.claude/`. One test file at a time from `raptor-port/` (`npx vitest run <file>`):
the five `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`, `msq-users-row`, `msq-s2-lists`, `msq-users-filter`,
`msq-guard-g`, `msq-guard-rollcall`, `msq-guard-asis`, `onedoor-users`, `accounts-ui`, `accounts-newperson`,
`postout-landing`, `state/edit-rights-readers`, and every other file that draws `UsersPanel` (round 4's report lists
the 45 it ran). `npx tsc -p tsconfig.app.json --noEmit` (supporting only). `npm run lint:changed` once at the end —
report what it says of `ui/UsersPanel.tsx` (the code check found `PersonEditor` over its complexity limit on another
branch; if it still is after the report moved out, say so — fix it only if a plain function lifted out does it,
nothing cleverer); if it cannot compare with `main`, say so. Never the full suite, the build or the lock.
`docs/file-map.md` and `docs/data-schema.md` kept true.

## Report

Your file tool may decline a report file: do not go round that — your final reply is the report. Each finding:
failed-before / passes-after, by test name; what you built and where; the pins; files run with counts; chat 204's two
files' results; the code check's line; anything a person would SEE differently; anything unclear and what you chose.
End with a ten-line summary.

## Addendum — the fresh Fable reader's cases

(Added by the orchestrator when it reports.)
