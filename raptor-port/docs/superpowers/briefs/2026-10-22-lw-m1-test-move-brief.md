# M1 — moving the tests from the stages to the open dates (a brief for the test helpers)

22 Oct 26, branch `claude/lw-m1-open-dates` (checkout `C:\Users\User\projects\Raptor\.claude\worktrees\lw-m1-open-dates-7632a9`).
The builder (another Opus chat) has changed the app; the tests below still build or assert the OLD stages. Your job:
make each test describe the NEW rule, keeping its intent — never weaken it to pass.

## What changed (the rulings — `.claude/rules/decisions/leave-war.md`; full rows `grep -h '^| D1177 |' .claude/decisions-full/*.md`)

- **The stages are gone (D1177).** `Period` has no `stage`, `bidFrom`, `bidTo`. It has `open: OpenStretch[]` (inclusive
  `{from,to}` stretches, normal form: sorted, never overlapping or touching) and `lastClosed: ClosedNote | null`.
  **Empty means closed** — a new period (`makeWar`, `createWar`) has nothing open. The seed's `y2026` has
  `open: [{from:'2026-01-01', to:'2026-03-31'}]`; `y2027` nothing.
- **Engine** (`src/leavewar/engine/opendates.ts`, `access.ts`; `stages.ts` deleted): `canEditCell(periodHoldingDate | null,
  role, date, today)` — admin always (a held day), member only an open day `>= today`; `canEditRow` unchanged;
  `canDecide(role)` — the admin, at any time; `isOpenOn`, `withOpened`, `withClosed`, `periodMonths`, `monthSpan`,
  `landingOf`, `focusDateOf`, `openFrom`, `memberToday()` / `setMemberTodayForTests(iso|null)`.
  `test-setup.ts` pins a member's today to `2000-01-01` before every Leave War test, so "today" bites only where a test
  sets it.
- **Store** (`src/leavewar/state/store.ts`): every write asks the day of the period HOLDING the date (`dayWritable`), not
  the one on screen. New exports: `openDates(from,to)`, `closeDates(from,to)`, `setStretch(old, from, to)` → `'set' |
  'unchanged' | 'outside' | 'backwards' | 'forbidden'` (admin only; ONE command `lw.open` each; closing records
  `lastClosed`); `isDayOpen(date)`, `canBidOn(personId,date)`, `ownPendingOnClosedDay(personId,date)`.
  Gone: `advanceStage`, `reopenStage`, `setBidWindow`, `clearBidWindow`, the command type `lw.stage` (now `lw.open`,
  perms row `op(T.war,'U')`). Nothing is frozen: the admin may decide, put back, move, delete approved leave at any
  time (no "published"). A member may DELETE his own pending (not refused) bid on a day closed for him (D1225) —
  never add or change one there. Moving: a request's move records no `shiftedFrom` any more (only an approved leave's
  move is marked — the door is always passed `tracked = true`); a landing is asked of the period holding it.
  Boot / `selectWar` land on the first open date from today, else today (`landingOf`, `focusDateOf`).
  `cellProblem`'s refusals: 'That day is in no leave period.' / 'You can’t bid on a day before today.' / 'Bidding is
  closed on that day.'
  An old saved war (`stage:'open'` + `bidFrom/bidTo`, no `open`) still loads: an open war's window → one stretch
  (null bounds → the whole period); any other stage → nothing open.
- **Permissions** (`src/state/perms.ts`): a member's `lw.cell` change on a day not open for him may only take away his
  own pending bids or a notice (B8) — refused otherwise at the command layer (`setLwDayOpenProbe`, installed by
  `installAbsenceDoor`).
- **Screens:** the stage strip is gone (`stage-now`, `stage-advance`, `stage-back`, `stage-menu`, `bid-window`,
  `window-sheet` test ids gone). New: one chip `data-testid="open-chip"` ("Open for bidding 1 Jan – 31 Mar" on a
  desktop, "Open 1 Jan – 31 Mar" on a phone, "+N" for more stretches, or "Bidding closed"; a member's chip shows
  stretches from his today) — a tap opens `ui/OpenDatesSheet.tsx` (testid `open-dates`; month buttons
  `od-month-2026-04` with `data-state` open/part/closed — tap toggles, a held drag spans in calendar order; lines
  `od-line-<from>`, calendar icon `od-cal-<from>`, `od-more`, `od-none`, `od-last`, `od-problem`; read only for a
  member). A member's tap on his own row on a day not open for him opens `ui/ClosedNoteSheet.tsx` (testid
  `closed-note`: the text `closed-note-text`, button `closed-inputs`; with his own pending bid there: `pending-note`,
  `closed-delete`). A member's own approved leave opens its remarks editor at ANY time (no longer only "published");
  an admin's tap on approved leave opens the bid/decide window (never a remarks-only sheet). Every cell of a person's
  own row is tappable (`cellOpenable(states, role, viewer, deciding, grid, personId, date, view)` — the `period` argument
  is gone). The grid's open outline: one `[data-testid="bid-box"]` per stretch (`data-from`), a member's from today.
  Closed days dim (`locked` class) for everyone while anything is open; nothing open → no dim. The clash note's
  approved-leave way out is `'war'` → "Change the approved leave", sentence "…but the bid is approved OL"
  (`'war-published'` gone). The Legend's moved line always shows. Undo words: "opening bidding 1 Apr – 30 Apr" /
  "closing bidding …", bubble "— those days are closed again for everyone" etc. (`src/undo/describe.ts`).
- The demo data is cleared before the database (D56): no back-compat beyond the old-war LOAD above.

## How to move a test

1. Read the test and the code it drives. Translate the SETUP: `stage:'open', bidFrom:X, bidTo:Y` → `open:[{from:X,to:Y}]`
   (`bidFrom:null` while open → the whole period); `stage:'draft'|'closed'|'published'` → `open: []` (closed for members).
   `advanceStage()` / `reopenStage()` to close or open → `closeDates(period.start, period.end)` / `openDates(...)`.
   `setBidWindow(a,b)` → make exactly `a..b` open (`closeDates` the whole period, then `openDates(a,b)`, or set `open`
   directly in a fixture). Build fixtures through the app's own writers where the test was doing so.
2. Translate the ASSERTION to the new rule. A test that pinned a behaviour the rulings REMOVED (e.g. "the admin cannot
   change approved leave on a published war", "a member cannot drag at published", "the moved mark only once closed",
   "the stage menu", "Undo of a stage move says 'closing bidding'") is rewritten to pin the NEW behaviour that replaced
   it (the admin can, at any time; a member's drag works; the moved mark on an approved leave's move; the open chip;
   Undo of `lw.open` names the dates) — never just deleted. Where nothing replaces it, delete it and SAY SO in your
   report with the ruling that removed it.
3. **Never weaken an assertion to pass, never skip a test.** If the new code looks WRONG against the rulings above (a
   test fails and the rule says the test is right), do NOT change the app: stop on that test, leave it failing, and
   report it with the evidence (that is a finding for the builder).
4. Keep the file's style (2-space, no semicolons, single quotes in `src/`; comments explain WHY — update any comment
   that names the stages). Line endings: keep the file's own.
5. Run your files one at a time: `cd raptor-port && npx vitest run --project leavewar <file>` (Leave War files) or
   `npx vitest run <file>` (others). A single test file needs no lock. Never run the whole suite or a browser test.
6. Do not touch files outside your list (another helper owns them), except a tiny shared test helper you must name in
   your report. Do not commit.

## What to return (short)
Per file: what you changed in one line; every expectation you CHANGED (old → new, the ruling); every test you
deleted (why); every test still failing and why you believe the app is wrong. Then the totals (files, tests passing).
