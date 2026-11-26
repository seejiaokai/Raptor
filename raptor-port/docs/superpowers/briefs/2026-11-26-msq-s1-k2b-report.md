# Section 1 (the guard rail) — K2b, the "Add a person" form's report to the guard: the builder's report (26 Nov 26)

Builder: Opus 5.5, a helper of chat 204, in `lw-balances-hover-275293` on `claude/msq-s1-guard-6ae5e1`. Brief:
`2026-11-26-msq-s1-k2b-brief.md`, with the orchestrator's five additions, which win over it. Nothing committed or pushed;
`HANDOFF.md` and the plan untouched. No door asks the guard yet, so the app behaves exactly as before.

## What changed

| File | What changed |
|---|---|
| `src/ui/guard.ts` | One row, `addperson`, with a short comment; `'addperson'` added to the `GuardRowId` type and to `GUARD_ORDER`. |
| `src/ui/UsersPanel.tsx` | One line, under `resetAddForm()`: `useGuardWork('addperson', …)`. Nothing else in the file was touched. |
| `src/ui/msq-guard-open.test.tsx` | `OPEN.addperson` (its opener and four ways out); a new describe, "A6 (K2b)", with nine tests; two openers (`openAddForm`, `openAddPerson`); two imports (`boxValue` and `pickDate` from the date-box test kit, `effectiveToday`); `TO_COME` emptied, and its closing test changed to expect `[]`. |
| `src/ui/msq-guard-g.test.tsx` | One new G4 test; one import (`whatIsOpen`). |
| `src/ui/msq-guard-rollcall.test.ts` | `TO_COME` loses the `addperson` entry (its type narrowed to the one entry left); R3's census line for `ui/UsersPanel.tsx` is now `in addperson`; the closing test changed to expect only the short row's entry. |

## The row as built

`{ id: 'addperson', name: 'Add a person', frame: 'ui/UsersPanel.tsx', where: 'admin', open: () => workOn('addperson'), sel: '#accAddBlock', counts: 'row', report: true }`

- **`sel`** is `#accAddBlock`, the form's own box as K2a drew it. No new attribute was added.
- **`name`** is "Add a person", as the form's heading names it on screen. The words of the note are K3's.
- **Its place in `GUARD_ORDER`:** `'userrow', 'archrow', 'giveaccess', 'addperson', 'newsqn', …`, which is after
  `giveaccess`, as the brief says. My reading of why: the existing Users rows run from the bottom of the page up — the
  people (`userrow`, `archrow`), then "Waiting for access" (`giveaccess`) above them. The form stands above "Waiting for
  access", so it comes next. With two Users rows open at once, the note names the open row first and the form after it.

## The report's exact condition, and where each "as it opens" value comes from

`adding && (name !== '' || JSON.stringify(np) !== JSON.stringify(BLANK) || role !== 'main' || postIn !== effectiveToday())`

Each value is the one `resetAddForm()` writes and the form's first draw starts on (`useState('')`, `useState(BLANK)`,
`useState('main')`, `useState(effectiveToday)`):
- **the sign-in** — `''`;
- **the callsign, initials, seat and CAT** — `BLANK` (`{ cs: '', ini: '', seat: '', cat: '' }`), compared whole;
- **the Role** — `'main'` (Member);
- **the post-in date** — `effectiveToday()`, the same function that sets it. No date is written as a fixed value.
- **Folded** (`adding` false) never counts. Only Cancel and Escape fold the form, and both empty it first.
- **After a successful add** `resetAddForm()` empties the form and it stays open, so the report is off again.
- **The page unmounting** (another tab) ends the report through React's own unmount. **Another Admin section shown**
  only hides the Users section, so the report stays on (D2627 A6).

## Tests — each seen failing first, then green

The tests were written before the code and run on the code as it stood (no `addperson` row, no report):
- **Roll-call and G file** (`npx vitest run src/ui/msq-guard-rollcall.test.ts src/ui/msq-guard-g.test.tsx`):
  **3 failed**, 40 passed (43). R3's census (`in addperson` names no row), R7's planted R3 case (its baseline holds
  R3's problem list), and G4's new test.
- **Open file, the new tests by name** (`-t "addperson|K2b|TO_COME"`): **9 failed**, 1 passed. All nine A6 (K2b) tests
  failed on `whatIsOpen()` returning null where `addperson` was expected. The one that passed is the changed `TO_COME`
  closing test (see below).
- **R1** ("a reported row … its frame makes that very call"): it cannot fail before the row exists. With the row added
  and the form's line not yet written it **failed** — "ui/UsersPanel.tsx reports addperson: expected [ 'giveaccess',
  'userrow', 'archrow' ] to include 'addperson'". It passes with the line.
- **A2's four and A10's five `addperson` cases** are drawn from the table, so they exist only once the row does. I set
  the form's line aside with a patch file (`git diff` → `git checkout --` → run → `git apply`, never `git stash`) and ran
  `-t "addperson"`: **9 failed**. With the line put back they pass.

**Green with the code:**
- `src/ui/msq-guard-rollcall.test.ts` and `src/ui/msq-guard-g.test.tsx` — **43 passed (43)**.
- `src/ui/msq-guard-open.test.tsx`, `-t "addperson|K2b|TO_COME"` — **19 passed**, 321 skipped (9 A6 + 4 A2 + 5 A10 + the
  `TO_COME` closing test).
- `src/ui/msq-guard-open.test.tsx`, the whole file — **340 passed (340)**, in about 14 minutes, with no stray errors.
- The must-stay-green set (15 files: `accounts-newperson`, `accounts-ui`, `msq-guard-asis`, `msq-guard-g`,
  `msq-guard-input-sqn`, `msq-guard-rollcall`, `msq-users-filter`, `msq-users-row`, `onedoor-users`, `pops`,
  `postout-landing`, `quals-pinframe`, `quals`, `reshape-b2-no-guest-switch`, `state/view-reset`) — **15 files passed, 283 passed, 5 todo (288)**, run after the open file finished.

**Not a red-first test:** the two changed `TO_COME` closing tests. They check a list in the test file itself, so each
passes as soon as the list is edited. This is the one change to an existing assertion in this step (orchestrator's
addition 1): the open file's now expects `[]`, and the roll-call's expects only `['after S2\'s U1 fix merges']`.

What the new tests cover (A6 (K2b), in the open file): opened by its button with nothing in it → null; a callsign typed →
`{ reason: 'row', row: { id: 'addperson' } }`; put back → null; the initials, the seat, the sign-in and the post-in date,
each changed alone → the row, and put back → null; the CAT (below); the Role (below); every field changed, then Cancel —
and separately Escape — → null, the form folded shut, and opened again empty; an add that succeeds → still open, empty,
null; opened by Quals' "+ Add person" with nothing typed → null, then typed → the row; typed, then the Squadrons section
shown → still the row, then the Inputs tab → null. G4 (G file): a callsign typed → the row; after Cancel → null; opened
again, a fresh form → null.

## `TO_COME` as it now stands

- **The open file:** empty.
- **The roll-call:** one entry — the short row's report (`UsersPanel.tsx ForeignEditor`), owed "after S2's U1 fix
  merges", unchanged.

## Where today's code differs from the plan's or the brief's account

1. **A fresh form across midnight counts as changed.** The post-in date is set when the Users page first draws and on
   each `resetAddForm()`, never when the form is opened. If the Users page stays drawn past midnight with the form
   untouched, the form opens on yesterday's date, and the report (compared with `effectiveToday()`) says "changed". The
   brief asks that a fresh form never read as changed "at any hour". Comparing with the date the form was last emptied
   needs that date stored — a second change in `UsersPanel.tsx` (a state or ref set in `resetAddForm()`), which the
   orchestrator's addition 5 rules out. **Not made — for the orchestrator to decide.** Today the person would be refused
   with the "add or cancel the new person" note, and Cancel clears it. The other way round (re-dating the form when it
   opens) would change what the form shows, which is not this step's.
2. **The CAT cannot be changed alone on screen.** Its box offers choices only once a seat is picked, and putting the
   seat back clears the CAT. The test proves the seat and CAT together count, the CAT put back with the seat still picked
   still counts, and the seat put back leaves a fresh form → null. The condition compares all four person fields whole,
   so a CAT that differs on its own would count too.
3. **The Role cannot be changed alone either.** Its box shows only while a sign-in is typed. A Role changed, then the
   sign-in cleared, leaves the Role box hidden while the Role still reads Admin. My call: it still counts — it differs
   from how the form opened, and it comes back as Admin the moment a sign-in is typed again. In that case the note will
   say "add or cancel" with nothing visible in the form; Cancel clears it. Pinned by the Role test.
4. **A callsign of spaces only counts**, as any other typed character does (the condition compares the raw values).
5. **A3 is not extended.** Its lists are of the 'no' and 'closes' rows, and `addperson` is a counting row. A2 and A10
   took the row in through `OPEN`, as K1b's rows did.
6. **B18's list of Admin rows** (`userrow` … `placeedit`, checked off after the switch to the member view) does not name
   `addperson`. B18 is not named in the brief, so it is unchanged. Adding `addperson` there is for the orchestrator.
7. **No comment above the line in `UsersPanel.tsx`** (addition 5: the one line and nothing else). The reason is in the
   row's comment in `guard.ts` and in the form's existing comment above `adding`. *(Since the review round, items 1 and 7
   are fixed, and B18 names `addperson` — the section at the end.)*

## Checks

- `npx vitest run <files>` in `raptor-port/` — the results above (no lock needed).
- `npm run build` in `raptor-port/` — **PASS**. The checks lock was free; I took it as "claude/msq-s1-guard-6ae5e1 — K2b
  build" and released it the moment the build ended.
- `npm run lint:changed` — NOT RUN (not in the brief's list; K2a's report found it could not compare against `main` here).
- No full suite, no browser test, no Tracker smoke, no dev server. `npm run docsize` not run (only this report changed
  outside `src`).

## The orchestrator's review round

The orchestrator read the diff and accepted it, asking for three things. The Role, spaces-only callsign and CAT calls
were accepted as built. Same rules: no commit, no push, only `raptor-port/src` and this report, tests first.

1. **The midnight case (difference 1 above) — fixed.** `UsersPanel` now keeps `postIn0`, the date the form last opened
   fresh on, beside `postIn`, as `ArchivedEditor` does. Its first value is the first draw's (`useState(effectiveToday)`,
   with `postIn` starting on it). `resetAddForm()` sets both with one `effectiveToday()` value. The report compares
   `postIn !== postIn0`, no longer `postIn !== effectiveToday()`. Nothing else about the form changes: after midnight an
   untouched form still shows the date it opened on, as before.
   - **The test, written first** (A6 (K2b), in the open file): the form opened and untouched; the clock moved past
     midnight by the test world's `pastMidnight()` (the app's own midnight wake, as A10 and A14 use it), then the page
     drawn again. Checked: the day has turned, the form still shows the date it opened on, `whatIsOpen()` is null; then
     the post-in date moved by hand → the `addperson` row.
   - **Seen failing** on the code as it stood: "still untouched: nothing: expected { reason: 'row', … } to be null". With
     the fix it passes.
2. **A comment above the report line** in the file's house style: what counts, that each value is the one a fresh form
   opens with, that the date is the one it last opened fresh on (midnight), and that a fold counts nothing — citing
   D2598, §18.3 and `ui/guard.ts`'s row. `postIn0` carries a short comment of its own.
3. **B18's list of Admin's rows gains `'addperson'`.** B18 stays green. It is a pin for this entry: its premise is an
   opened person's row, not the form, so the form's report was never on there.

**Runs** (each `npx vitest run` in `raptor-port/`):
- `src/ui/msq-guard-open.test.tsx -t "A6 .K2b.|B18|addperson"` — **20 passed**, 321 skipped (10 A6 (K2b) + B18 + 4 A2 +
  5 A10). The whole open file was not run again; the orchestrator runs it.
- `src/ui/msq-guard-g.test.tsx`, `src/ui/msq-guard-rollcall.test.ts`, `src/ui/accounts-ui.test.tsx`,
  `src/ui/accounts-newperson.test.tsx`, `src/ui/onedoor-users.test.tsx`, `src/ui/msq-users-row.test.tsx` — **6 files,
  119 passed (119)**.
- `npm run build` — **PASS**. The checks lock was free; I took it and released it the moment the build ended.

## What only a browser can show

Nothing this step adds can be seen: no door asks the guard yet. Once K3 and K4 land, a browser should show the note
under the squadron picker with a callsign typed in the form, and the form keeping its typing after the refusal.
