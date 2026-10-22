# M1 — open dates — the code read (a brief for two blind readers, 22 Oct 26)

You are one of TWO independent readers of the Leave War overhaul's M1 (open dates), finished and walked: a fresh Opus 5.5
read and a Fable 5.1 read (D790, D1260). **You never read the other reader's report and you do not know what it says.**
Read only; change no file, commit nothing. Checkout:
`C:\Users\User\projects\Raptor\.claude\worktrees\lw-m1-open-dates-7632a9`, branch `claude/lw-m1-open-dates` (HEAD at the
time of your read — compare against `main` with `git diff main...HEAD -- raptor-port/src`).

## What M1 is

The Leave War's four stages (draft, open for bidding, bidding closed, published) and its one bidding window go. In their
place each period keeps a list of open stretches (`Period.open`, empty = nothing open) and the last stretch closed with
who closed it (`lastClosed`). An admin opens and closes dates in the "Open for bidding" window (month buttons: a tap, a
held drag across months; exact days by a stretch's calendar). A member bids only on an open day of the period that HOLDS
the date (never the period on screen) and never before his today; an admin writes any day and decides at any time. A
member may still delete his own pending bid on a day since closed. One command (`lw.open`) carries each opening or
closing, so one Undo takes back one gesture. The commit's permission check (`state/perms.ts`) refuses a member's change on
a closed day except taking away his own pending bids (and its Undo). An old saved war still loads.

## Read first

1. The rulings — open each full row: `grep -h '^| D1177 |' .claude/decisions-full/*.md`, and the same for D1176, D1166,
   D1168, D1169, D1172, D1225, D1211, D418, D333, D352, D827, D1250, D1260. Their one-line forms:
   `.claude/rules/decisions/leave-war.md`. A ruling is the spec; where the code and a ruling disagree, say which.
2. The build plan `raptor-port/docs/superpowers/plans/2026-10-22-leave-war-overhaul-build-plan.md` §3 batch 1 (M1) and its
   fixes B2, B3, B8, A7b, B12; the code map it names.
3. The scenarios the walk ran: `raptor-port/docs/superpowers/briefs/2026-10-22-lw-m1-scenarios.md`.
4. **The evidence sheet** `raptor-port/docs/handpass/2026-10-22-lw-m1-open-dates.md` — what was walked, what was found and
   fixed, what is carried by tests, what was not walked. Do not re-report a finding the sheet already records as fixed,
   unless the fix is wrong or incomplete — then say so.
5. The finished code (the diff against `main`, read whole for each file named): `leavewar/engine/opendates.ts`,
   `engine/access.ts`, `engine/period.ts`, `engine/wars.ts`, `engine/seed.ts`; `leavewar/state/store.ts` (every write door:
   `dayWritable`, `canBidOn`, `ownPendingOnClosedDay`, `openDates` / `closeDates` / `setStretch` / `writeOpen`, `cellProblem`,
   the moves, `readWar` for the old shape, `landingOf`); `state/perms.ts` (`lw.open`, `setLwDayOpenProbe`,
   `onlyTakesPending`, the lw.cell rule); `leavewar/sync.ts`; `undo/describe.ts`; the screens `ui/OpenDatesSheet.tsx`,
   `ui/ClosedNoteSheet.tsx`, `ui/Chrome.tsx`, `ui/Matrix.tsx`, `ui/MatrixRows.tsx`, `ui/DayList.tsx`, `ui/SelectSheet.tsx`,
   `ui/BidPicker.tsx`, `ui/Sheet.tsx`, `LeaveWarPage.tsx`; the CSS `bidpicker.css`, `chrome.css`, `matrix.css`;
   `ui/interactions.ts`, `ui/board.ts`, `ui/html.ts` (words only); `probe-bridge.ts`. And their tests.

## What to look for

- A rule a ruling sets that the code breaks — on any door: a write, a move, a decide, a fill, a delete, Undo / Redo, a
  reload, an old saved war, the commit check.
- A door that still asks the period ON SCREEN instead of the one HOLDING the date, or forgets a member's today.
- A member able to add or change a bid on a closed day by any route; or refused a thing he may do (delete his own pending
  bid on a closed day, and Undo / Redo of that).
- Saved data: a field written that the reader drops, or the other way; an old war that loads wrong.
- One gesture that is not one Undo step, or an Undo bubble whose words are wrong.
- A screen that still shows or says a stage, a window, "draft" or "published" for the war.
- **What is MISSING:** a scenario neither the walk nor a test covered that could fail — name it as a scenario to walk.
- The new words a person reads (the closed note, the pending note, the chip, the window, the Undo bubble, the fill's skip
  note — "… skipped: closed for bidding, before today, or already taken." / "… closed for bidding, before today, decided,
  or filed on the Inputs page."): read them cold — would a member or an admin understand each, and is each true?

## What a finding is — and is not

- **A finding has a concrete failure, its cause and its exact fix (D489):** the steps (who, which day, which control),
  what the screen or the store then does wrong, the line(s) that cause it, and the change that puts it right. A worry
  with no failure is not a finding — list it, if at all, as a scenario to walk.
- **Not a finding (owner, D56):** a problem that lives ONLY in data already stored, when the code is already correct going
  forward. The whole store is demo data, cleared before the database step.
- Not a finding: M2–M5's features (My leave, Approvals, Balances, documents — D1159 is M3), and anything the plan defers.
- Ranked: high (wrong data saved, a member writing where he may not, a rule broken) → medium → low (words, looks).

## Return

One report: your findings, ranked, each with its failure, cause and exact fix; then the scenarios to walk; then the
words read cold. Say what you read and what you did not. Your token count if you know it.
