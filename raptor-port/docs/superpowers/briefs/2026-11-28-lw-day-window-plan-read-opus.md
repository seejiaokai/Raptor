# Red-team read — the Leave War day-window build plan (chat 198)

Reader: a fresh, blind Opus. Read only. Brief: `raptor-port/docs/superpowers/briefs/2026-11-28-lw-day-window-plan-redteam.md`.
Read: the plan whole; the Leave War rulings page (`.claude/rules/decisions/leave-war.md`, §The bid windows first and the
built §The bid windows lines); full rows D2880–D2927, D1724, D1552, D1187, D1354, D1467, D1166, D1177, D1225, D1208,
D1565, D2770, D2778, D2783, D2784, D1784, D947, D957, D945, D1388, D2773; `[COMBINED-INPUT-ROWS]`; the drawings' scripts
(`draw-war-window.mjs`, `draw-to-review.mjs`) and `build-sheet.html`; code: `src/state/perms.ts` (COMMAND_OPS, the member
gate, `stampForged`, `onlyTakesPending`, `inputBreach`, `warPlacerForged`), `src/leavewar/engine/access.ts`,
`engine/dayview.ts` (`OFF_WAR`, `offWar`, `lockedOnWar`), `state/store.ts` (`absenceMovable`, `movableRecords`,
`moveRecords`), `sync.ts` (`doorDecideApproved`, `doorRemoveApproved`, `doorMoveApproved`, `alsoSince`),
`ui/placedfacts.ts`, `ui/ApprovalsPage.tsx` (the "New" dot), `ui/Matrix.tsx` routing, `src/ui/html.ts` (the waiting
mark, `GP_TAKEOFF_NOTE`), `src/ui/board-html.ts`, `src/engine/inputs.ts listedPersonal`, `src/undo/timeline.ts`.

Not findings (excluded as the brief says): stored demo data (D56); a scheduler who is not an admin (D785); wording style.

Counts: **HIGH 4 · MEDIUM 7 · LOW 5** (16). Verdict at the end.

---

## HIGH

### H1. The drag window and the grid's move mode would carry a member's approved leave as still APPROVED (D2922 broken), and would hand the drag window new Move/Delete powers nobody planned

**Failure.** Ranger (member) has an approved LL on Thu 3 Dec. Once step 7 makes his approved leave movable, he drags a
selection over Thu 3 on his own row (the drag window, `SelectSheet`, which the plan says "CHANGES only through the shared
rules: what is movable/deletable") and presses Move, or presses Move on the card and drops in the grid's move mode. The
drop runs `store.ts moveRecords`, which for every absence calls `DOOR.moveApproved(abs, dayDelta, true, false)`
(`sync.ts doorMoveApproved`) — it cuts and **re-files the Input carrying `lw`, its approval and the moved-from marks**.
Result: his leave lands on Fri 4 Dec still approved, no pending bid, nothing in Approvals. D2922 says his move sends it
back to pending. Likewise an admin's drag selection over a five-day course would get a Delete and Move from the drag
window (an undrawn window) the moment step 4 widens `absenceMovable` / `movableRecords`.

**Cause in the plan.** Step 3 reads `movableRecords` / `recordTakeable` as the source of `move` / `del`; steps 4 and 7
widen "what is movable/deletable" in the store; §2a row "Drag window (`SelectSheet`)…" says it changes "only through the
shared rules". Step 7 adds "three entry points used by the card" but never says the grid's move mode, which every Move
ends in, must call them — the existing drop path is `moveRecords` → `doorMoveApproved`.

**Rests on.** D2922 (move or change → pending); `store.ts moveRecords` (the `abs.length && DOOR` branch);
`sync.ts doorMoveApproved` (re-files carrying `lw`); D1625 (anything new he sees drawn first — the drag window's new
buttons were never drawn); D264 (the drag sheet shares the window's format).

**Change to the plan.**
1. Step 7, "Files": add `store.ts moveRecords` and the move mode's drop (`Matrix.tsx` move-mode commit). State: a move
   whose actor is a member and whose record is an approved leave Input never reaches `DOOR.moveApproved`; it calls
   step 7's own door (cut + pending bid, one command). Add the same for `clearCells` / `changeAbsenceById` 'removed'
   if a member's Delete can reach them.
2. Step 7, a rule 8: "`absenceMovable` / `movableRecords` stay admin-only as today; a member's approved leave is movable
   only through `canChangeOwnApproved`, asked by the card and by the move mode, never by the drag window."
3. §2a, the `SelectSheet` row: replace "CHANGES only through the shared rules" with "MUST NOT gain any power in this
   build: what its Move and Delete take stays exactly what they take today (admin: war-approved leave and bids; member:
   his own pending bids). Pinned by a test per role." If the owner later wants the drag window to move a course or a
   member's approved leave, it is drawn first (D1625).
4. Tests first (step 7): Ranger moves his approved LL by the card's Move and a drop in move mode → a pending LL bid on
   Fri 4, no Input; Ranger's drag selection over his approved LL offers no Move/Delete of it; an admin's drag selection
   over a course offers no Move/Delete of the course (and still moves a bid beside it).
5. Step 4, Tests first: an admin's move of a course from the card ends in the step-4 door, not `doorMoveApproved` (the
   course keeps no `lw`, no `lwMoved` marks unless that is decided — see M4).

### H2. After an admin refuses (or approves) the member's re-bid, the member's own Undo must be refused — the plan's test expects the opposite

**Failure.** Ranger moves his approved LL Thu 3 → Fri 4 (now a pending bid). Hex refuses the Fri 4 bid. Ranger presses
Undo. If his Undo goes through, it puts back his **approved** LL on Thu 3 and takes away the refused bid — a refused man
undoes himself back to approved leave, around the admin. The plan's own test list (step 7, first bullet) reads: "an
admin approves → 'approved again' on his bell; one Undo by Ranger puts the approved leave back" — after the admin's
approval, that Undo would leave him with Thu 3 approved again **and** Fri 4 approved (the admin's approval made Fri 4 an
Input), two days of leave from one.

**Cause.** Step 7's tests; the only Undo line is "an admin's Undo of the member's step … pin what it does". The member's
own Undo after someone else decided the re-bid is not tested, and the one written case contradicts D148.

**Rests on.** D148 ("where someone has since changed the very same thing it refuses and says who"); `undo/timeline.ts`
(`mayReverse`, the D148 conflict hook `nameOf`); D2922.

**Change to the plan.** In step 7's "Tests first", replace the first bullet's last clause with two cases and add a third:
1. "Ranger moves; before anyone decides, his Undo puts the approved LL back on Thu 3 and the pending bid goes."
2. "Ranger moves; Hex approves the Fri 4 bid; Ranger's Undo is **refused**, naming Hex; nothing changes (no second
   approved day)."
3. "Ranger moves; Hex refuses the Fri 4 bid; Ranger's Undo is **refused**, naming Hex; Thu 3 stays empty, Fri 4 stays
   refused."
Add the same three for a kind swap and a half change. Add to §7c item 8 ("Undo / Redo"): "a member's Undo of his
move after an admin decided it — refused, both ways."

### H3. Two of step 7's security tests cannot pass without breaking D1166 — the builder will either weaken the Inputs page or write a test that proves nothing

**Failure.** Step 7's refusal list includes, as hand-made commands from the member: "a hand-made command that keeps the
leave approved after his move" and "one that mints an **approved** Input for himself". At the commit gate both are, byte
for byte, what the Inputs page lets him do today and must keep letting him do: D1166 — a member files or edits his own
leave on the Inputs page and it "lands approved"; `inputBreach` lets him re-date his own leave Input (keeping or
dropping `lw`, never setting it). The gate sees only the changes, not which page sent them (the command's type is a label
he chooses). So a gate that refuses these refuses his Inputs-page edits — the exact thing the plan's own clash table says
must not happen ("The build must not 'fix' the Inputs page", D2922 vs D1166). If instead the test is written against the
store only, it is listed as a gate/security test and gives false comfort.

**Cause.** Step 7 "Tests first", the "Refused, with nothing changed" bullet; K1 ("the gate refusing hand-made commands").

**Rests on.** D1166, D2922 (he chose the two pages to differ "until he says otherwise"); `perms.ts inputBreach`
("A member's change keeps them as they were or drops them"); the plan's own §3 clash row D2922/D1166.

**Change to the plan.**
1. Step 7, under "The gate": add "D2922's 'back to pending' is a rule of the war's day window, held by the store and
   the card; the gate cannot hold it, because the same changes are a lawful Inputs-page edit (D1166). Nothing in the
   gate is changed for it."
2. Step 7 tests: move those two cases out of the security file into `own-approved.test.ts` as **store** tests (the
   card's door never produces them). In `own-approved-sec.test.ts` add the opposite pin: "a hand-made command equal to
   an Inputs-page re-date of his own leave is ACCEPTED at the gate — D1166", so a later change cannot quietly break the
   Inputs page.
3. K4 (the two pages differ): add one line — "so the difference lives only in the war's own door; a member can always
   reach the Inputs-page result on purpose. Readers: not a finding."
4. Keep in the security file only what the gate truly owns: another man's row or Input, a forged decided stamp, a
   forged placer (see H4), a closed day's bid.

### H4. Carrying the old "placed" stamp onto the member's re-bid needs a gate widening that is wider than stated, and hides the re-bid from the admin; the plan's own fallback is the safer default

**Failure (three parts).**
- (a) *The widening multiplies.* Step 7 widens `stampForged` so a request may carry "the `lwBy`/`lwAt` (else `by`/`at`)
  of a leave Input of his own that this same command cuts". As written, one cut day vouches for any number of new
  requests: Ranger cuts one day of a five-day leave an admin placed in September and mints bids on ten other open days,
  each stamped with September's time. Today's "same record" path guards exactly this with `afterCount` ("a request …
  copied … onto another day … is a new bid there, placed by him now"); the widening has no such bound.
- (b) *The admin is not told.* With the stamp carried, Approvals' "New" dot (`ApprovalsPage.tsx isNewFor`:
  `placedAt > prev` **and** not placed by the viewer) never lights: the time is months old, and where the admin himself
  placed and auto-approved the leave the line is excluded as "what he placed himself". The list sorts by `placedAt`
  (line 286), so the re-bid sits among September's lines. Admins get no bell (D1208, rightly), so an approved leave
  quietly turning pending is invisible except as the count rising by one. The plan's §2d / step 7 rule 7 rely on
  "Approvals' count rises" as the whole signal.
- (c) *"Also since you last looked"* (`sync.ts alsoSince`, the Approvals panel that lists a member's withdrawn bids)
  is missing from the roll-call: a member deleting his approved leave, or turning it pending, appears nowhere there.

**Cause.** Step 7 rule 3 ("It carries … the original placed stamp"), step 7 "The gate", K2, §2c Approvals row, §2d.
That the re-bid keeps the old stamp is the planner's choice, not a ruling (D2922 and D2927 say nothing of it).

**Rests on.** `perms.ts stampForged` (its M10 / security-read history: "a stamp vouched by ANY before-image let a new bid
borrow another record's stamp, and a new bid with none jumped the Approvals queue and dodged 'New'"); `ApprovalsPage.tsx`
`isNewFor` and its sort; D1208; D2927 (the line says who placed it — after his move, he did).

**Change to the plan.**
1. Step 7 rule 3: make K2's fallback the plan — "the re-bid is placed by **him, now**; `stampForged` is **not**
   widened". Its card then reads "Placed by Ranger · <now>", which is true, the line is "New" for every admin, and it
   joins the queue in time order. Remarks, till and Document are still carried (those are not stamps).
2. Update the D2922 worked-case test: "a pending LL bid on the 4th placed by Ranger, now".
3. If the builder or the owner prefers the old stamp, it goes to him as a question with a picture (Approvals with and
   without the "New" dot), and the widening is then bounded: each cut half-day vouches for at most one minted half-day,
   same kind family, the cut and the new in the same command; tests: ten bids from one cut day → refused.
4. §2c, Approvals row: add "'Also since you last looked' — decide and pin whether a member's delete of his approved
   leave, and his approved leave turned pending, are listed there (recommended: yes, as a withdrawn bid is); its words
   to §6 for Fable."
5. §2d: replace "Approvals' count rises instead" with "the re-bid appears in Approvals as New, and (4) above".

---

## MEDIUM

### M1. Branch B: Edit Schedule would lose its only way to reject a placed input

**Failure.** Today a Ground Programme row on Edit Schedule's week has no buttons; a scheduler rejects a placed input there
only from Personal Inputs (`accCtl`). T1 changes both callers (`html.ts` 2315 and `board-html.ts` 818) to list only what
is not placed, while Q6's "meanwhile" holds the week's Reject on the row until he has seen a drawing. In between, on Edit
Schedule a placed input has no Reject anywhere — a scheduler at his desk cannot take an input off the programme.

**Cause.** Step T1 (callers), Q6 "Meanwhile: Branch B builds the Board and the shared rule first and holds the week's
Reject".

**Rests on.** D2883 ("Edit Schedule and the Scheduler Board alike"; "an input already placed carries its own Reject on its
own row"); D945; the plan's own §1 ("A Ground Programme row on Edit Schedule has no buttons at all").

**Change.** T1: "the week's caller (`html.ts` 2315) keeps `listedPersonal` and the heading 'Personal Inputs' until Q6 is
answered and the week's row Reject is built; only the Board switches." Add a test: on Edit Schedule, before Q6, a placed
input is still listed with its Reject. Better: ask Q6 (with the drawing) before Branch B starts, so both pages switch
together — they share words and the D947/D957 line.

### M2. Q7 / R13 rest on a false fact: Ground Programme rows already carry the waiting mark

**Failure.** §1, §2f, R13 and Q7 say the waiting mark (an input filed after its day was published) exists only on
Unavailable rows and would be "new" on a Ground Programme row. D1784's own words are the reverse: it gave Unavailable rows
"the same waiting mark … as on a Ground Programme row", carrying D45 and D93 "to the one list that never got the mark".
The code says the same (`html.ts unavPendAtt` comment: "The same attribute pair a Ground Programme cell's waiting change
carries (engine/publish.ts alAttr)"; `board-html.ts`: "as a Ground Programme box carries its mark either way (sbTxt)").
Q7 would put a settled, built rule to him as open — the D53 lapse.

**Cause.** §1 second "does not bear out" bullet; §2f row "The waiting mark"; R13; Q7.

**Change.** Delete Q7 and R13. §2f row: "HAS on Ground Programme rows (D45, D93 — `alAttr`) and on Unavailable rows
(D1784); MUST NOT change. A placed input waiting since publish keeps its mark on its row; T1/T2 tests pin it on the
Board and the week." The only open bit is the issued (read-only) face: say in T1 whether an input waiting since publish
is listed under "To review" there (D2883's "anything still waiting for him") and pin it.

### M3. The drawn "Placed by" line on Inputs-filed leave, a course and a medical has no source

**Failure.** Drawings b3 (LL filed on the Inputs page), b4 (medical) and b5 (course) each draw "Placed <name> · Fri 27 Nov,
12:46" on the card. `ui/placedfacts.ts placedFacts` produces facts only for war requests and for leave Inputs **with**
`lw`; an Inputs-filed leave, a course, an OD, a medical give nothing. Step 1 says "No change to `placedfacts.ts`" and
step 13 does not mention the line. The drawing check (D1494) will fail on b3/b4/b5, or the builder will improvise who
"placed" a course (its `by`? its filer for others?).

**Cause.** Step 1 "Change"; step 13 "Change".

**Rests on.** D2926 (built to the drawings), D2927 ("Wherever the Leave War says who placed …"), `placedfacts.ts`.

**Change.** Step 13: add "the card's 'Placed by <filer> · <filed at>' line for any one-person Input filed on the Inputs
page (its `by` / `at`, as the Inputs page's own 'Placed by' reads it), decided half absent" and add `placedfacts.ts` to
its files; tests on b3, b4, b5. Say what a group entry's line names (its filer) or that it has none — and check the
Inputs page's own line so the two read alike.

### M4. Step 4/5 miss the war's day-lock rule and change three admin doors through one widening

**Failure.** What the war may write, and the blue "filed on the Inputs page" edge, both come today from
`engine/dayview.ts OFF_WAR` / `offWar` / `lockedOnWar` (used by `state/merge.ts`, `ui/matrixrowparts.ts cellOpenable`,
and `Matrix.tsx` routing). `OFF_WAR` holds CSE, OD and every commitment code, not only medicals; `offWar` is "the blue edge
THAT record's own box wears". Step 4's file list names none of these, yet its new powers collide with them (a locked day
refuses the war's writes; `setCell` / `cellProblem` refuse at `OFF_WAR`). A builder who simply drops CSE/OD from
`OFF_WAR` also removes their blue edge — a look change nobody approved. Separately, step 5 widens `sync.ts warLeaveRow`
to take leave without `lw`; `warLeaveRow` is the entry test of `doorMoveApproved` and `doorRemoveApproved` as well, so
step 5 silently gives Inputs-filed leave a second move/delete path beside step 4's new doors — and `doorMoveApproved`
writes `lwMoved` marks (the dotted "moved" look, D1177's reading) onto leave that was never war-approved.

**Cause.** Step 4 "Files"; step 5 "Change".

**Change.**
1. Step 4 "Files": add `engine/dayview.ts` (`OFF_WAR`, `offWar`, `lockedOnWar`), `state/merge.ts`,
   `ui/matrixrowparts.ts`. State: "the blue edge (`offWar`) is unchanged for every kind; a new question,
   `warMayChange(contrib, role, viewer)`, answers what the war may move or delete, medical always false" — and pin the
   blue edge with a test per kind.
2. Decide one door per case and write it in step 4: Inputs-filed leave moved/deleted by an admin → step 4's door
   (stays approved, no `lw`, and say whether it gets the dotted moved mark — recommended: no, it was never the war's);
   step 5 widens only `doorDecideApproved`'s entry, not the shared `warLeaveRow`. Test: `doorMoveApproved` called on an
   Inputs-filed leave refuses as today.

### M5. The command list must name every table the new commands write

**Failure.** The security guide asks role checks to rest on one honest list (COMMAND_OPS; "It writes the INPUT, so it
names the Input table … the database's rules are built from this list"). Step 7 reuses `lw.edit` / `lw.move`
(`op(T.bid, …)`) for a command that cuts or deletes the member's **Input** and says "COMMAND_OPS unchanged". Step 4's new
`lw.inputMove` / `lw.inputRemove` (`op(T.input, …)`) also write war cells and a bell line when the moved course or leave
lands on a day holding his pending bid (the Inputs door's `replaceClashingBids` → "a bid replaced by a clashing input",
D1142) — and no step 4 test covers that landing.

**Change.** Step 7: give the member's own-approved door its own type(s) (e.g. `lw.ownApprovedChange`,
`lw.ownApprovedRemove`) with `op(T.bid, 'U', 'optional', [[T.input, 'U'], [T.input, 'D']])`, or add that `more` to the
reused types; update `docs/data-model.md` §11 and `permsparity.test.ts` to match. Step 4: add `more: [[T.bid, 'U'],
[T.notice, 'C']]` where the door can replace a bid; add tests "admin moves a course onto a day holding Cutter's pending
bid → the bid replaced, Cutter told once"; "a member moves his own course onto his own pending bid on a closed day →
allowed (D1166), the bid cut".

### M6. K3 — a hidden switch decides an admin's swap; that is the planner's reading and should be his question, not a notice

**Failure.** Hex turned Auto-approve off on his PC last week. On his phone (a new device: the memory is per device, on by
default) or on the PC, he opens Cutter's whole-day approved LL and swaps it to OL. The switch is not drawn (no add part),
yet it decides: on the PC the leave silently goes pending, on the phone it stays approved. D2925 says "as any leave he
places" — when he places leave he sees the switch. Reading D2887's "Auto-approve shows only while there are leave buttons
to place new leave" to exclude the card's own leave buttons, and so hiding the switch that decides the swap, is the plan's
reading (K3 says "As ruled and drawn" and puts it under "Not a question, told to him").

**Rests on.** D2925, D2887, D1302 (remembered per admin per device), `bidhelpers.ts readApprove` (on by default).

**Change.** Move K3 into §8 as a question before step 6 is built, with a picture of b3 and a worked example: (A) show the
switch in the title bar whenever an admin's card has leave buttons (swap counts as placing); (B) as the plan: hidden,
follows memory; (C) an admin's swap always keeps it approved. Meanwhile build step 6 behind A's look or hold it. Note in
the question that the memory differs by device.

### M7. New things he will see are built without a drawing (D1625)

**Failure.** The plan builds, undrawn: the interim group card with line w8 ("For all 3 — open it with the pencil.") and no
buttons (step 16 meanwhile); a member's approved leave on a closed or past day with line w9 and only Delete (step 7 rule
4, step 15); the chips "All n days · Wed 16 Dec" on a card (R4 — "The drawings show only one-day entries"); a
custom-hours leave card with the pencil, Move, Delete and no Duration or leave buttons (R5); and the new refusal toast
w12. D1625 requires each to be drawn and shown first, "even when it is only one part … or copies a look the app already
has". The drawing check (D1494) has nothing to check them against.

**Change.** Add a step 9b (before step 10, parallel with 4–8): draw these five states on the real app at 402 and 1536
with the drawing script's world, words by Opus then a fresh Fable (D2441), and put them to him in one small round with
Q5 (w9 is Q5's own meanwhile), Q1/Q2 (w8), and M6's question. Steps 13, 15 and 16 build them only after his answer; until
then each falls back to today's window for that state (the routing table says which).

---

## LOW

### L1. A member's Delete of approved leave on a **past** day is stated as a rule, not a reading

Step 7 rule 2 allows it ("a closed day and a past day included … he can do the same there today"). D1211 sends a member's
past-day corrections to the Inputs page and has the scheduler publish another end-of-day version; D2922 speaks of deleting,
not of past days. Mark it a reading and fold it into Q5 ("closed or past: Delete on the war too?"). Test the published
past day: the delete waits for the next amendment and the issued face is unchanged.

### L2. Branches: the split A/B is right; inside A, steps 1–2 should not wait for the FULL check, and "share no file" is not quite true

The split by area follows D490/D1087 and is right. But Branch A bundles well over D1087's "two to four related jobs" —
two low-risk word/place changes (steps 1, 2) behind the riskiest permission change in the app. Recommend steps 1 and 2 on
their own small branch (a LOOK check) so a fault in step 7 cannot hold them. And both branches edit
`docs/ui-contracts.md`, `docs/feature-impact.md` and `docs/file-map.md` (A's step 17, B's T5): say so, and have the later
merge bring `main` in first (`shipping.md`).

### L3. Step 10 switches the routing before the cards exist

Step 10 makes `Matrix.tsx` open `DayWindow` wherever it opened `BidPicker`, `DayListSheet` or `RemarksSheet`, but the
leave card is step 11, the other cards step 13, the member's window step 15. Each intermediate commit would ship a window
missing its entries' buttons. Change: step 10 routes only the empty-day state (b1); each later step moves its own states
into the routing table as its card lands, the old window still mounted for the rest, `RemarksSheet` deleted in step 15
as written.

### L4. Approvals' own "· by Saber" column

D2927 says "wherever the Leave War says who placed or decided an entry". Approvals prints "<time> · by <name>"
(`ApprovalsPage.tsx` `appr-placed`) and "Already approved by Saber". Step 1 leaves it as "if it prints the line". Decide
it in step 1: in scope or not, and if not, why; list it in §6.

### L5. Gaps in step 7's test list

Add: a member swaps his own approved **OIL-kind** leave to LL and back (the OIL ledger and War bal; D25 — nothing of OIL
lost), as step 6 does for the admin; a member moves his approved leave onto days from a posting with the Delete outcome
(D1541, D1555: approval is refused there, so the re-bid could never be approved — refuse the move or say so on the card);
a several-day approved leave moved with "All n days" where one of the landing days is closed (all or nothing).

---

## Checked and found right (no change)

- Medical never gets Move/Delete (D2888) — pinned in steps 3, 4, 13.
- The ⋯ keeps Attach, Other, Post out, Post in (D2885); the pencil by kind, never by page (D2892); the pencil opens the
  input window over the war (D2889), the `askFiledOil` route exists.
- Leave buttons stay over an Attach (D2924), not over leave or a medical (D1552).
- The two pages differ on purpose (D2922 vs D1166) — named; see H3 for what that means for the gate.
- Q1 (D2783 vs D2896) is a real clash the newer ruling does not clearly cover; putting it to him follows D90.
- Q3 (one tap or two on a pending bid) is fairly put; the build sheet's b2 caption does say "in one tap".
- Admin may refuse / send back Inputs-filed leave: drawn on b3 and approved by D2926; the plan names it to him.
- D2882's "both a bid and standing leave on an open day" is correctly left unbuilt (drawn first), and listed.
- Delete/archive of a period (D2891) correctly out of scope.

---

**Verdict: REVISE** — the plan is well grounded and its order is sound, but H1–H4 (the drag/move path that keeps a
member's moved leave approved, the member's Undo past an admin's decision, two impossible gate tests, and the stamp
widening that hides re-bids) must be fixed in the plan before step 7 is built, and M1–M7 before their steps.
