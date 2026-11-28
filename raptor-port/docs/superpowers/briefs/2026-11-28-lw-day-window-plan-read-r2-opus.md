# Round 2 red-team read — the Leave War day-window plan (fresh Opus, blind)

Read in `C:/rt/p198b`: the brief, the revised plan (all of it, §10 included), the full rows D2880–D2929, D2783,
D2784, D2778, D1552, D1724, D1166, D1177, D148, D1208, D1472, the drawing script `draw-war-window.mjs` and
`build-sheet.html`, and the code the findings rest on (`src/state/perms.ts`, `src/leavewar/state/store.ts`,
`src/leavewar/sync.ts`, `src/engine/inputown.ts`, `src/ui/inputedit.tsx`, `src/ui/caldrag.ts`, `src/ui/pops.ts`,
`src/ui/html.ts`, `src/leavewar/ui/SelectSheet.tsx`, `BidPicker.tsx`, `ApprovalsPage.tsx`). HANDOFF.md not read.

Eight findings: 2 high, 4 medium, 2 low. Most come from fixes made in round 1's revision (M5, M4, H1, Astra 3, M6,
M7). The rulings are read correctly throughout. The faults are in how the new rules meet the code.

---

## H-1 — The new command types refuse every member (step 7), and a member's own course (step 4)

**What goes wrong.** Ranger presses Delete on his own approved LL card. The store runs `changeOwnApproved` under
`lw.ownApprovedRemove`. The command gate refuses it before anything runs, and the leave stays. The same happens to
every member's Move, half change and kind change on his approved leave. It also happens to a member's Move or Delete
of his own one-person course or OD through step 4's `lw.inputMove` / `lw.inputRemove`, which R15 and step 4's
permission checks say he may do. Step 7 cannot pass its own first test.

**Cause.** In step 7's files, round 1's M5 fix gives the new types
`op(T.bid, 'U', 'optional', [[T.input, 'U'], [T.input, 'D']])`. Step 4 gives
`op(T.input, 'U'|'D', 'optional', [[T.bid, 'U'], [T.notice, 'C']])`. But `cmdAuthorize` (`perms.ts` 721–733) checks
every `more` entry with the own-row rule `'never'` (`opAllows(who, t, a, 'never', …)`). So the actor must hold each
of those letters outright. The `CommandOp` comment says the same: "each letter the actor must hold outright too". A
member holds Input U and D, and Bid U, only as his own (`PERMS[T.input] = row(cell('C R U D'), cell('R', 'C R U D'))`,
`PERMS[T.bid] = row(…, cell('R', 'C U D'))`). So `opAllows` returns false. No member-run command in `COMMAND_OPS` has
a `more` list today: `lw.edit`, `lw.move`, `inputs.write` and `undo.restore` all have none. Every command that does
have one is admin-only.

**The change to the plan.**
1. Step 7, Files: give the two new types the shape a member's command has today: `op(T.bid, 'U', 'optional')` with
   no `more` list. Name the Input table they write in a comment above them and in the new §11 row of
   `docs/data-model.md`. What keeps a member to his own leave is §5's ownership check on the real changes
   (`inputBreach`, the `lw.cell` case, `stampForged`), as it is for `lw.edit` and `inputs.write`.
   If the honest table list must stay machine-read for the database step, choose instead: extend `CommandOp.more`
   entries to take an optional own rule (`[T.input, 'U', 'optional']`). Use it only for these types, update
   `cmdAuthorize`'s loop and `permsparity.test.ts`, and add it to the security read's brief (a change to the gate's
   rules, D1411).
2. Step 4, Files: the same for `lw.inputMove` / `lw.inputRemove`. As written, `[T.bid, 'U']` shuts out the member
   whom R15 and step 4's permission checks let in.
3. Tests first, in both `own-approved-sec.test.ts` and step 4's tests: "a member's own call of each new type passes
   `cmdAuthorize`" (the test that would have caught this), beside the existing "another man's is refused".

---

## H-2 — Step 5 gives the drag window, and the one-day window's range decide, a new power

**What goes wrong.** Hex drags across Cutter's 7–11 Dec. The 9th holds LL that Cutter filed on the Inputs page. He
presses Refuse in the drag window. After step 5, that leave is un-approved and refused from the drag window: a power
never drawn there, which §2a says the drag window **must not** gain (D1625). The same reach comes through the one-day
window's range decide (`BidPicker.tsx` 406) and the drag window's Decide count (`decidableIn`).

**Cause.** Step 5's Change: "`doorDecideApproved` (and `warEditable` for the two decide paths only) takes a
one-person leave Input with or without `lw`". The two decide paths named in Files are `setBidStates` 4116 and
`decideRequests` 4443. `setBidStates` is exactly what the drag window calls (`SelectSheet.tsx` 396:
`inOneWarCommand('lw.decide', … setBidStates(sel.cells, bid))`), and so does the one-day window's range decide.
`decidableIn` (store 6477) and `deletableIn` (6494) ask `warEditable` too. Round 1's M4 kept step 4 off the shared
doors. Step 5 puts one back.

**The change to the plan.**
1. Step 5, Change: leave `warEditable`, `setBidStates`, `decidableIn` and `deletableIn` exactly as they are. Add one
   id-based door for the card, e.g. `decideApprovedById(personId, date, iid, to)` in `store.ts`. It asks
   `canDecide`, `warMayChange` (step 4's new question) and the leave-only, whole-or-half test. Its own gesture
   (`lw.decideApproved`) calls the widened `doorDecideApproved` entry. Only the card's Approved / Refuse call it.
2. `decideRequests` needs no widening: leave filed on the Inputs page never stands on Approvals (D1152, D1166).
   Remove it from step 5's Files.
3. Tests first (step 5): an admin's drag selection over a day of Inputs-filed LL. `decidableIn` counts it 0, and
   Approve / Refuse in the drag window leaves it approved and unchanged. The one-day window's range decide the same.
   Step 4 already has this pin for Move and Delete; step 5 has none for deciding.

---

## M-1 — Rule 8's route through `moveRecords` skips the backstop, and `moveRecordsProblem` refuses first

**What goes wrong.** Two things.
- Ranger starts Move on his approved LL card and drops on Fri 4 Dec. Step 7 rule 8 sends the drop into
  `moveRecords`, which first calls `moveRecordsProblem`. That asks `absenceMovable` of every absence record, and
  rule 8 keeps it admin-only. So the move is refused as "owned by Raptor" before rule 8's routing is reached.
- If the builder gets past that, the work runs inside `moveRecords`' own `gesture('lw.move', …)`. A nested gesture
  does not commit under its own type (`store.ts` 3337–3339: `if (cmdIsCommitting() …) return fn()`). So the command
  reaches the gate as `lw.move`, and the "backstop" shape check that step 7 and K1 / K2 tie to `lw.ownApprovedChange`
  never runs on the move-mode path. That is the very path round 1's H1 found. The bell's `TELLS.has(type)` and
  Undo's name read the outer type too.

Step 4's Inputs-filed course moved in move mode has the same two faults: `absenceMovable` needs `lw` and a leave
code, and the new types are swallowed by `lw.move`.

**Cause.** Step 7 rule 8, and step 4's "the grid's move mode … at the drop calls step 4's door", lean on
`moveRecords` being "the one commit every Move ends in". That is true for the war's own records today. A card-started
Move of these two new kinds must not go through it.

**The change to the plan.**
1. Step 7 rule 8, rewritten. `moveRecords`, `moveRecordsProblem`, `absenceMovable` and `movableRecords` stay exactly
   as today. They already refuse a member's approved leave ('raptor') and an Inputs-filed course, which is the H1
   safety. The move mode remembers what started it. When the record came from a card's Move and is (a) a member's
   own approved leave, the landing preview asks `ownApprovedProblem` and the drop calls `changeOwnApproved` under
   `lw.ownApprovedChange`; when it is (b) an entry step 4 owns, they ask step 4's own problem function and call
   step 4's door under `lw.inputMove`. Each call is a top-level gesture, never nested in `lw.move`.
2. Tests first (step 7): that command's envelope type is `lw.ownApprovedChange` (assert on the committed envelope),
   so the backstop runs. And: `moveRecords` called directly with a member's approved-leave record still returns
   `{ reason: 'raptor' }` and changes nothing. The same two for step 4 with `lw.inputMove`.
3. K1's text: replace "the one commit every Move ends in sending him to that door (rule 8)" with "a card's Move goes
   to the war door itself, and the shared move commit refuses these records as it does today".

---

## M-2 — The backstop refuses a lawful split: a middle day moved, deleted or re-typed

**What goes wrong.** Ranger has an approved LL Mon 7 – Fri 11 Dec. He taps Wed 9, keeps "Wed 9 Dec" lit (R4) and
presses Delete, or moves that one day. `cutDates` splits the leave into Mon–Tue (same iid) and Thu–Fri, a **new**
Input with a fresh iid (`sync.ts` 940–945; `sliceInput(…, i === 0)` mints a new id for every later piece). Step 7's
backstop — "no leave Input of his is created or lengthened by the command" — sees a new leave Input of his and
refuses. The delete is lost, against D2922 ("deleting it simply removes it"). It also contradicts step 7's own test
("one day of a five-day leave moved (the rest stays approved, untouched)") and R4's worked example. The gate's
existing rule already allows such a piece (`inputBreach` 1097–1111: a record he creates carries `lw` only as a piece
cut from a record of his that the same command changed).

**The change to the plan.**
1. Step 7's opening, the backstop's wording, becomes: "no leave Input of his ends the command covering a day it did
   not cover before the command, and the total of his approved leave days does not rise. A new record is allowed only
   as a piece of one this command shortened (its days a subset of that record's before-image, its stamp the same)."
   Repeat it in K2.
2. Tests first (`own-approved-sec.test.ts`): the middle-day Delete, the middle-day Move and the middle-day kind
   change of a five-day leave, each **accepted**. Beside them: a hand-made `lw.ownApprovedChange` that writes a new
   piece adding a day, refused.

---

## M-3 — Step 4's OIL question names the wrong mechanism; the right one is already built

**What goes wrong.** Hex moves Cutter's Thursday course to Saturday. Step 4 says to call `oilGate` and, on `ask`,
open the question with `setOilAsk` "as `sync.ts askFiledOil` does". But `askFiledOil` asks **after** the filing has
been saved (it is raised as a deferred effect "once the filing has gone through", `sync.ts` 866–888). `setOilAsk(iid)`
plus `setInpEdit(row)` opens the full input window on the **saved** record, which at that moment still stands on
Thursday. So the builder either moves first and asks after, which breaks D783 / D831 (nothing moves before the
answer), or builds a second ask-first door beside the one that exists.

**What exists.** `ui/inputedit.tsx oilFirst({ kind: 'move', … })` (1798) is the app's one "question before a
change". It runs the gate first, a trial run, the waiting question, the answer passed to `make(r, oil)` (so the
answer and the move are one save), the `same` re-check after the answer, and the standing bar. The Inputs
calendar's chip drag uses it for exactly this case (`ui/caldrag.ts commitChipMove` 160–185). Its bar already reads
"Not moved — OIL not answered" (`WAIT_WORDS.move`, pinned in `ui/oilwait.test.tsx` 263 and `caldrag.test.tsx` 644).

**The change to the plan.**
1. Step 4, "The OIL question comes first": replace the `oilGate` + `setOilAsk` / `askFiledOil` wording with "the
   door is wrapped in `oilFirst({ kind: 'move', lead, iid, same, gate, make, places, again })`, as `caldrag.ts
   commitChipMove` does. `make(r, oil)` calls step 4's war door with the answer, in one command. `gate` is
   `oilGate(<the entry as it would stand after the move>, r)`. `same` is the re-check." Add `ui/inputedit.tsx
   oilFirst` and `ui/caldrag.ts` to the step's Files (called, not changed).
2. §6 w27: mark it "unchanged — the existing `WAIT_WORDS.move` bar", not a new word for Fable.
3. Tests first: the existing `caldrag.test.tsx` ON9 case as the pattern, run through the war's door.

---

## M-4 — Step 11 builds what Q4's "meanwhile" says is not built, and the meanwhile card has dead buttons

**What goes wrong.** Q4 says that until he answers, "an admin's swap and AM/PM change of approved leave are not
built; the card shows the leave's kind and half lit". Step 6 also says its card waits for Q4. But step 11's Change
builds the second-tap swap and Duration "for a pending bid and for approved leave alike", with no exception for an
admin on approved leave. Step 10's routing moves "the one-leave days" (b3, b8) to the new window in step 11. Built
either way, it breaks:
- built as step 11 says, Hex's swap on Cutter's approved LL follows a switch that is not on screen — the K3 fault
  Q4 exists to stop;
- built as Q4 says, b3's card shows the eight leave buttons and Whole day · AM · PM, which do nothing when tapped.
  That is a control that says nothing, the fault the backlog's own lead (K7) is about.

**The change to the plan.**
1. Step 10's routing table: an admin on approved leave (b3, b3o1, b8's held half, b7) **stays on today's window**
   until Q4 is answered. Today's window already gives Approve / put back, Move and Delete for war-approved leave.
   Step 11 moves only the pending bid (b2) and the refused bid for an admin. The member's approved leave stays with
   step 15.
2. Step 11, Change: add "for an admin on approved leave: built only once Q4 is answered (step 9b); until then the
   routing keeps those states on today's window".
3. Q4's "Meanwhile" line: replace it with "such a day opens what it opens today", the same shape as Q5's.

---

## L-1 — Card looks the drawings never showed are built without being drawn first (D1625)

**What goes wrong.** These states get a new look with no frame in the drawings of record (b1–b9, m1) and no line in
step 9b's list:
- §2a / R2: a member on another man's day, "as read-only cards". Step 13's test builds it ("the read-only reader … sees
  the card, its remarks read only").
- R9: a replaced-bid notice as a card.
- §2a: schedule-earned OIL (FO* / HO*) as a card with no buttons.
- §2a: the refused bid as a card.

D1625 says anything new a person will see is drawn first, and round 1's M7 closed the same gap for the other
undrawn states.

**The change to the plan.** Add these four to step 9b's "Drawn" list and to §8's "Drawn for him" list. Until he has
seen them, the routing table keeps each on the window it opens today (the step-10 rule step 9b already states). Move
step 13's read-only-reader test to the step that lands them after his answer.

---

## L-2 — T1's rule for a saved week that cannot be read contradicts itself

**What goes wrong.** T1 says a saved week that cannot be read "is not taken as unplaced: the input is then not
listed". It also says the builder must keep to "what the existing lookup does in that case". The existing lookup
does the opposite. `accCtl` (`html.ts` 2507–2511) treats `rowElsewhere(...) === 'unreadable'` as not placed. It
keeps the input listed with its Accept, "whose press refuses and says why". Built as T1's first half, the input
vanishes from both the programme and "To review", and nothing tells the scheduler.

**The change to the plan.** T1: "a saved week that cannot be read leaves the input **listed** under To review, its
Accept refusing with today's reason, as `accCtl` does today". Add the test: an unreadable saved week, the input
listed, and Accept refused with its words.

---

## Round 1 fixes checked (§10)

- Closed as written: Astra 2 (`replaceEntry` by id, the final state first, a throw rolls back), Astra 4 (one man out
  is not a date cut — confirmed, `pieceOf` copies every person), Astra 5 (the lookup is the right one, except L-2),
  Astra 6 / M1 (T0 and the release rule), H2 (D148's three Undo cases; the gate's replayed path lets his Undo restore
  the approved Input — `inputBreach` returns early on a replay), H3 (the opposite pin), H4 (placed by him now passes
  `stampForged`), M2, M3, L1, L3, L4 (Approvals already says "· by").
- Not fully closed:
  - M5 → H-1: the new type lists lock members out.
  - M4 → H-2: step 5 reopens the shared doors.
  - H1 / Astra 1 → M-1 and M-2: the route and the backstop.
  - Astra 3 → M-3: the wrong ask door.
  - M6 → M-4: Q4 is not held in step 11.
  - M7 → L-1: four undrawn looks remain.

The branch split (P, A, B) is right. The rulings and clashes in §3 are read correctly, and the D2896 / D2783 clash
goes to him as Q1.

**Verdict: REVISE** — H-1 and H-2 must change before step 4 starts (both are one-paragraph edits to steps 4, 5 and
7). M-1 to M-4 are edits to steps 4, 7, 10 and 11. No ruling needs to go back to him for any of these.
