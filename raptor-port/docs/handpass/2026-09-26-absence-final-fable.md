# The absence-record re-test — Fable 5.1's final code read (26 Sep 26)

Reader: Fable 5.1, alone (never shown Astra's report). Brief: `docs/superpowers/briefs/2026-09-26-absence-final-read-brief.md`.
Read in the brief's order: the evidence sheet (`2026-09-26-absence.md` §0–§3), the walkers' sheets (w1–w5, the rows that
bear on each fix), the one-absence register (§1–§12), `leave-war.md`, `scheduler.md` (D174–D189), `oil.md` (N19, D79–D82),
`how-we-work.md` (D148, D166, D211–D215), then `git diff main...HEAD -- raptor-port/src` in full — every production file,
then the bodies each fix depends on (`commitInputEdit`, `sliceInput`, `withRemarksTail`, `setPostOut`/`setPostIn`,
`restoreArchivedPerson`, `runPoArchive`, `clearCells`/`setBidStates`/`decideRequest`/`occupiedFor`, `invertChange`,
`absencesAt`, `barsWrite`, `Sheet`, `select.ts`, `caldrag.ts`, `DocViewer`, `perms.ts`, `editManualCredit`/`setCellDays`/
`setManualCredit`), the callers of every function whose shape a fix changed, and the new tests. Read only; nothing run
beyond `git` and `grep`. D56 applied throughout: nothing below is about data already stored.

Method, per the brief: for each fix, every door that does the same job, listed with has-it / not-a-door / MISSING; then
the failure scenario at each MISSING door. Rank order: by what a man or a published record loses.

---

## Findings

### F1 — MEDIUM — The Inputs calendar's DRAG keeps the remark's old "till <date>" (the AB3 defect at the door the walk did not check)

**Already on `main`** (the drag never rewrote the token); this branch added the medical ask in front of the same commit
and left the remark as it was. Nearly every input carries the token: the Inputs page's form and the edit window's range
picker write it in as the dates are picked (`InputsPage.tsx:768/966`, `inputedit.tsx:1871`), a one-day pick reads
"till 20 Jul".

- **Setup:** admin (a member on his own row is the same). Inputs page → Calendar. Reaper LL 20–24 Jul, remark
  "Bali till 24 Jul" (as the form filed it).
- **Action:** drag Reaper's chip from 20 Jul to 27 Jul (the span slides to 27–31 Jul). "Moved to 27 Jul".
- **What happens:** the record's dates are 27–31 Jul; its remark still reads "Bali till 24 Jul" — on the Inputs page's
  Remarks column, the week's and the board's Unavailable row, the print view, the Inputs export (AB10's Remarks column)
  and the war's published remarks editor. A one-day "on 20 Jul" dragged to the 22nd still says "on 20 Jul". A medical or
  an upchit dragged is the same; the new upchit hand-off (`MedMoveConfirm` → `commitEditUpchit`) commits the draft's
  remark untouched, and only the clash hand-off (`commitEditMedChoices`) rewrites its own "till".
- **What should happen, and by which ruling:** the token follows the dates. D189 (stretching or trimming a leave or a
  downchit rewrites its "till <date>"); AB3's own rationale in `sliceInput` ("must not keep a 'till' its dates no longer
  reach"); the token is the app's, matched wherever it sits in the remark (`engine/inputs.ts DATE_TOKEN`). Every OTHER
  date-moving door already rewrites: the edit window's picker, the table's picker, the war's Move (`sync.ts:327/351/
  529/552`), the medical trim, the gate's cut. The drag is the one that does not. On a published day the piece covers, the
  remark is part of what the day printed (D189) — here the published face and the working copy agree on wrong words, so
  nothing ever reads pending for it.
- **Where:** `raptor-port/src/ui/caldrag.ts` `commitChipMove` — builds `d = draftOf(r)` (remarks copied verbatim),
  shifts `d.start` / `d.end`, never touches `d.remarks`; `raptor-port/src/ui/inputedit.tsx` `commitInputEdit` writes
  `r.remarks = String(draft.remarks || '').trim()` as given.
- **Fix, step by step:**
  1. `caldrag.ts`: the import from `'../engine/inputs'` already brings `INPUTS`; add `remarksTailWord, withRemarksTail`
     to it.
  2. In `commitChipMove`, immediately after `if (d.end) d.end = shiftIso(d.end, days)` and BEFORE
     `const ask = medAskFor(r, d)`, add:
     ```ts
     /* the remark's date token follows the dates, as every other date-moving door's does (D189; AB3's body) */
     const word = remarksTailWord(d.remarks)
     if (word) d.remarks = withRemarksTail(d.remarks, d.start, d.end || d.start, word)
     ```
     Before `medAskFor`, so the draft handed to `MedMoveConfirm` (the clash Save AND the upchit Save) already carries
     the right words.
  3. Test, red first, in the calendar-drag test file (`src/ui/caldrag.test.ts` or `caltouch.test.tsx`'s sibling):
     file LL 20–24 Jul, remark "Bali till 24 Jul"; `commitChipMove(entry, '2026-07-20', '2026-07-27')`; expect the row's
     remark "Bali till 31 Jul". A one-day "on 20 Jul" → "on 27 Jul". A remark with no token → unchanged. An upchit with
     "till 31 Jul" dragged onto a medical → after the summary sheet's Save, its remark names the new day.
  4. Alternative, the one-body route: the same two lines at the top of `commitInputEdit` after `normalizeInputDraft`
     (from `n.date` / `n.endDate` via `ordISO`). Weigh its one consequence: the war's published remarks editor
     (`setLeaveRemarks`) would then also correct a hand-typed wrong token. The door-level fix has no side effect.
  5. Register §12's "A cut rewrites 'till'" line gains "…and a chip drag"; a row on the evidence sheet.

### F2 — MEDIUM-LOW — Undo of a bid's REFUSAL puts an undecided bid back over a medical filed since (the W3-F8 shape the new hook misses)

**New on this branch** in the sense that the hook is new; the symptom itself existed on `main` (no restore was ever
checked). The fix's tests cover a Redo of a placement and an Undo of a deletion; a restore of a DECISION is the path left.

- **Setup:** admin, JAN–DEC 26 at Bidding closed. Ghost bids LL on 10 Aug. The admin Refuses it (bid sheet, tap list or
  bulk Refuse). Then ATT C 10 Aug is filed for Ghost on the Inputs page — the refused bid stays as history (the gate
  replaces live bids only: `inputgate.ts:291` skips `state === 'refused'`).
- **Action:** Undo (the top bar's or the war's) — undoing the refusal.
- **What happens:** the undo goes through; the bid is undecided again on the sick day — the amber `!`, "Two of these can't
  both stand…", W3-F8's exact picture. `restoreBlocker` sees the request's id already in the day's list (`now.has(r.id)`)
  and skips the rule; but the record there now is the REFUSED one, and what the undo writes is the UNDECIDED one.
- **What should happen, and by which ruling:** refused by name, as W3-F8's Redo now is — B7 (the same rules at every door,
  undo and redo included). The tap list's own "reconsider a refusal" (`decideRequest`, refused → undecided) asks
  `occupiedFor`, which reads `absencesAt` and refuses over the medical; Undo is the one door that lets it through.
- **Where:** `raptor-port/src/leavewar/state/store.ts` `restoreBlocker` — `now` is a set of ids only.
- **Fix, step by step:**
  1. Replace `const now = new Set(...map(r => r.id))` with a map id → state:
     ```ts
     const now = new Map<string, string | undefined>(
       ((war?.recs || {})[personId]?.[date] || []).map((r: WarRec) => [r.id, r.kind === 'request' ? (r as RequestRec).state : undefined]))
     ```
  2. Replace the skip `now.has(r.id)` with: skip only when what is there now is a LIVE request —
     `const cur = now.get(r.id); if (cur !== undefined && cur !== 'refused') continue`. Keep the existing skip for a
     restored record whose own state is `'refused'` (redoing a refusal is never barred).
  3. Test, red first, in `inputgate.test.ts` beside the W3-F8 pair: `setCells([{ammo, 2026-02-10}], 'LL')` →
     `advanceStage()` → `setBidStates([...], 'refused')` → `file('ammo', 'ATT C', 'Feb 10')` → `globalUndo()`: expect
     `ok === false`, reason matches `/ATT C now holds 10 Feb/`, and the request still `'refused'`.
  4. A negative beside it: Undo of an Ack (acknowledged → undecided) on a day holding no absence goes through.

### F3 — LOW — Bulk Delete over a cell whose TOP record is a WAR-approved leave leaves the bid beneath (W3-F3 at the other kind of filed leave)

**Already on `main`**; the branch's `else if (clearRequestsAt(...))` reaches only the branch where the admin may NOT act
on the absence. The walker's W3-F3 scenario was Inputs-filed leave; a war-approved morning beside an afternoon bid (Q2)
is the same gesture with a different top record.

- **Setup:** admin, Bidding closed. Ghost: an LL morning bid approved on the war (now a war-approved absence, top of the
  ladder) and a live LL afternoon bid beside it.
- **Action:** drag-select the cell, Delete, confirm.
- **What happens:** `clearCells` → `mainAt` = the absence, `warEditable` true → `doorRemoveApproved` cuts the leave day;
  the afternoon bid stays; "1 written". Under Inputs-filed leave the same Delete now takes the bid beneath; under
  war-approved leave it does not — same gesture, two answers.
- **Should:** old plan D3 (a bulk Delete removes the editable requests); register §12's W3-F3 line, which says "beneath
  filed leave" and should say "beneath filed or war-approved leave".
- **Where:** `store.ts clearCells` — the `if (state.role === 'admin' && canDecide(...) && warEditable(...)) approved.push(...)`
  branch never calls `clearRequestsAt`.
- **Fix, step by step:**
  1. In `clearCells`' absence branch, take the requests first in BOTH cases:
     ```ts
     if (m && m.kind === 'absence') {
       const reqs = clearRequestsAt(c.personId, c.date)
       if (state.role === 'admin' && canDecide(state.period.stage, state.role) && warEditable(c.personId, c.date)) approved.push({ ...c, iid: m.id })
       else if (reqs) written++
       else skipped++
     }
     ```
     (`removeApproved` works on the Input by iid, so removing the war's requests first changes nothing it reads.)
  2. Test in `inputgate.test.ts`: approve an AM bid (`setBidStates` at closed), add a PM bid, `clearCells` → the leave
     day is gone AND no request remains; pin the count you choose (1 or 2 "written").
  3. Register §12: the W3-F3 line's wording as above.

### F4 — LOW / NIT — The EventSheet does not close on a war switch (W5-F3's guard covers the cell, not the event rows)

`Matrix.tsx` line ~1079: the new `useEffect(() => { setOpen(null); setPlaceAt(null) }, [period.id])` leaves `eventEdit`
(the EventSheet for a war's event / PH / blocked bands: `removeEventBand(line, band.from)`, the type editor) open across a
switch, where its `line` / `date` then apply to the war now on screen. **Reach is near nil:** the scrim (`position:fixed;
z-index:79`) covers the top bar's Undo (z 60) and the Period picker; Tab is now trapped; there is no keyboard undo
shortcut — only a programmatic switch reaches it. Reported because it is the one day-acting sheet outside the guard.
**Fix:** add `setEventEdit(null)` to that effect; a test beside `sheetfocus.test.tsx`'s "a war switch closes the sheet".
(Checked and NOT affected: `listRemark` hangs on `open`; `sel` / `moveSel` / `eventMoveSel` reset on the older
`[period.stage, period.id, histEpoch]` effect; `balOpen` / `whoOpen` / `oilTracker` / `counterEdit` / `settings` /
`figSel` act per person or per date, not per war.)

---

## Nits (not findings — no man or record loses anything)

- **N1** `restoreBlocker` splits the cell id `warId:pid:date` on the FIRST colon; the store's own reader
  (`store.ts:1075`) splits on the LAST. Both are right today (war ids are `y2026`, `y2027`, `war-<start>-<end>`; person ids
  are callsign keys) — make `restoreBlocker` use `lastIndexOf` so the two can never disagree.
- **N2** `setCellDays` (`store.ts:3620`) writes an award's days without N19's code rule. No production caller (dead
  since N19); delete it, or add `code: days < 1 ? 'HO' : 'FO'`, so a future caller cannot reopen W3-F6.
- **N3** The edit window's `save()` (`inputedit.tsx:1722–1760`) keeps its own copy of "what to ask" (upchit summary /
  clash sheet) beside the new `medAskFor`. The walk shows it asks (W2 A1/A1f/A2, "the edit window asks"); a refactor makes
  it the fourth door of the one body the fix claims.
- **N4** The read-only edit window's body is `inert` (React 19, so the attribute is real), which also kills the document
  control inside it for a member reading another man's medical (D211 — he may see documents). He still opens them from the
  Inputs table and the Medical view (H4). If the owner wants the viewer reachable from the window, draw the document links
  outside the inert box.
- **N5** `postErr` is one state for both the PI and the PO panels of the bid sheet; with both panels open the sentence
  shows under both.
- **N6** The W3-F5 commit message and evidence row say "A PO placed from the bid sheet still turns that sheet into the Post
  out sheet"; the code closes the sheet on success (`close()`), which is fine — the sentence is wrong.
- **N7** (unchanged `main` code, out of the fixes' scope) `restoreArchivedPerson` clears the posting window even when the
  archive was the Quals ✕ by hand and the PO was the custom archive-OFF case — the Restore wipes a posting it did not make.

---

## Explicit negatives — each bullet of the brief's "questions that matter most"

**"till" on a cut (AB3).** Every path that shortens, splits, moves or trims a leave or a medical, with what it does to
the token: the gate's sick-cuts-leave (`inputgate.ts:151` → `sliceInput`) HAS IT; the war's un-approve / Delete
(`doorRemoveApproved` → `cutDates` → `sliceInput`) HAS IT; the war's Move (`sync.ts:529/552` `sliceInput`; the landing
row `sync.ts:327/351` `withRemarksTail 'on'`) HAS IT; the war's approve-extend HAS IT; the medical trim and the upchit
trim (`applyMedPlan`, `inputedit.tsx:344/366/405`) HAVE IT; the clash sheets' first segment (`inputedit.tsx:1221/1702`,
`InputsPage.tsx:532`) HAVE IT; the edit window's and the table's range pickers HAVE IT; the board's "+ Add" for an
Unavailable row (`interactions.ts:737`) HAS IT; `setInpField` (the in-place time cells) changes no dates — not a door;
the schedule's reassign changes the person only — not a door; **the calendar drag is MISSING — F1**. `sliceInput` is the
one body every war cut and the gate use — confirmed by callers; `remarksTailWord` keeps "on" for a one-day piece and
"till" otherwise, and a remark with no token is untouched.

**A medical moved asks its questions (AB4).** The calendar drag (`commitChipMove` → `medAskFor` → `MedMoveConfirm`) HAS
IT; the schedule's reassign, both the arm-then-tap (`interactions.ts:826`) and the palette drag (`drag.ts:219`) route
through `reassignInput` → `medAskFor` — HAS IT; the Inputs table's edit (`InputsPage` → `medAskFor` /
`commitEditMedChoices` / `commitEditUpchit`) HAS IT; the edit window (own copy — N3) HAS IT; the Medical view and the
document viewer's Edit open the edit window — covered; the in-place time cells change no dates and no type — not a door;
the war cannot move a medical (`warEditable` excludes medical) — not a door; a remarks-only edit — not a door; undo /
redo of a medical run the Inputs gate's `vetRestore` — covered. `MedMoveConfirm` re-resolves the row by iid at Save,
Cancel writes nothing, `MEDMOVE` is in `POPS_RESET`, and the reassign's own tail (`askOilIfPending`) is moot for a medical.
The two callers of `reassignInput` ignore its return, so the ask's `false` shows no wrong message. Found nothing.

**A posting that closes before it opens (AB5, W3-F4) / the posting sheet pinned (W3-F5) / Undo post out (W5-F1).**
Writers of a posting date: `setPostOut` and `setPostIn` are called from exactly five places — `Matrix.tsx` `postOutOr` /
`postInOr` (behind the bid sheet's PI / PO, the two posting sheets' date boxes and the archive toggle, the drag-selection's
PO), `undoPostOut`, and `restoreArchivedPerson(null)`; no Quals-page writer, no other door. `postingProblem`'s predicates
match the two writers exactly (`addDays(date,-1) < from` / `date > to`, malformed, equal-day window allowed by both), and
the fallback sentence covers a refusal for any other cause. The pin: the ONE door that opens a cell is the ctx wrapper
`setOpen` (`Matrix.tsx:604` → `api.current.setOpen` → the wrapper at ~1741), which reads `pi` / `po` off the day at the
tap; `po.test.tsx` pins the moved-past-tapped-day case; "Undo post out" closes; "Place leave or OIL here instead" hands
to the bid sheet. Archive / restore doors: the auto-archive pass (`runPoArchive`: `to !== null && poArchive === true &&
today > to`) cannot re-archive after `undoPostOut` because `restoreArchivedPerson` clears `to`; the Quals ✕ (hand archive,
`QualsPage.tsx:428`) of a man with no posting drops him from the war by design (walked, W5); the Quals Restore is the
same body `undoPostOut` calls; `undoPostOut` falls back to the date alone when the archive is not the Post out's own
(`poArchive !== true`), and returns false for a `special` body (the sentinel), which the sheet then just closes — the
sentinel has no posting sheet. Found nothing beyond N7.

**Restore obeys the bid rule (W3-F8).** Restore paths: `globalUndo` / `globalRedo` are called from the top bar (`Shell.tsx`),
the board (`SchedBoard.tsx`), the war's own Undo / Redo (`Chrome.tsx:114/123`) and the probe bridge — one timeline, one
hook, so every door asks. No group restore and no Inputs-page restore exist. What a restore can put back over an absence:
a request — checked; a credit — lands and flags by N2 (not barred, right); a notice — history; an Input (a war-approved
leave restored over a medical) — the Inputs gate's `vetRestore` runs on undo and redo (`inputgate-hook.ts:18–21`). The hook
reads `entry.inverse` for undo and `entry.forward` for redo; `invertChange` gives a `put` whose `after` is the old list
and turns a create into a `delete` (skipped) — the shapes match. The check runs before the view-snap, so a refusal moves
nothing. Is a legitimate undo refused? Walked the cases: undoing a filing that replaced a bid (the medical is in `moving`
— allowed); undoing a bid's placement (the inverse holds no request — allowed); undoing a bid's move back onto a day now
sick (refused — right); a bid beside filed leave in the other half (`barsWrite` false — allowed); redoing a refusal
(skipped by state — right). Is it read against the right war? `absencesAt` is war-agnostic by design and refreshed on
every Inputs change; the war is found by id for the "already there" test; N1 notes the parse. **The one gap is F2** —
the "already there" test is by id, not by state.

**A war switch closes the open cell; sheets hold the keyboard (W5-F3, W3-F7).** Every Leave War sheet renders through
`Sheet` (`.bidsheet`; the fifteen users listed by import), so the Tab trap covers the bid sheet, the tap list, the
posting sheets, the read-only sheet, the selection sheet, the remarks editor, the event sheet, the counter / figures /
person / manning / OIL tracker / settings / war sheets; the trap is guarded to the topmost `.bidsheet` and to the Leave War
being the page on, like the Escape guard. Roads to a war switch: the Period picker (`Chrome.tsx:83`), the war sheet's
create (`WarSheet.tsx:57`), the undo snap (`undo-wire.ts:82`) and boot — all change `period.id`, and the new effect closes
`open` (with `placeAt`; `listRemark` hangs on `open`). **The one sheet outside the guard is the EventSheet — F4**, with the
reach caveat given there.

**Bulk (AB7, W3-F3).** Fill: `setCells` asks `cellProblem` per cell, which reads the day's list and `absencesAt` — reaches
beneath. Approve / Refuse / Ack: `setBidStates` decides `liveRequestsOn(listAt(...))` first, so a bid beneath filed leave is
reached (the 20 Sep probe fix), and `already` counts an already-approved leave apart — the single-cell sheet is unaffected
because `answer()` returns before `setBidStates` when `decide.state === bid` (`BidPicker.tsx:206`), and `setBidState`
ignores the return. Delete: reaches beneath INPUTS-filed leave now (`clearRequestsAt`, inside the same `lw.edit` gesture,
the same `canEditCell` / `canEditRow` gates); **beneath WAR-approved leave it does not — F3**. Move: filed
`[LW-MOVE-BENEATH]`. Post out: the selection sheet's PO now keeps the sheet on a refusal and reports nothing done.
`SelectSheet.decide`'s note wording is truthful in all four combinations of decided / skipped / already.

**An award's code follows its days (W3-F6).** Days writers: `setManualCredit` (create — its only caller, the +OIL panel,
derives `oilCode` from the days at `BidPicker.tsx:191`, so a 2-day HO cannot be typed); `editManualCredit` (the OIL
tracker's editor `OilTracker.tsx:352` and the tap list's Edit… `DayList.tsx:292` — both now set the code); a note-only or
giver-only edit leaves the code alone (right); `setCellDays` — dead, N2. A Move does not change days. Found nothing live.

**Read only for a member (W1-F3).** Doors into an input's edit: the calendar chip tap and the day popover's row
(`InputsCal.tsx:299/749`) → the edit window, now read only by `mayEditInputOf` — the same rule the write path refuses by;
the calendar chip's lift → `fixed` at the press by the same test `commitChipMove` makes (`canEditSched()` / `isMe`);
the Inputs table → no edit door on another man's row (H4); the week's and the board's input label
(`interactions.ts:755`) → `canEditSched()` gate, a member is told; the document viewer's Edit and Upchit → gated by
`mine = canEditSched() || isMe(r.person)` (`DocViewer.tsx:68/116/117`); the Medical view → the viewer, same gate; the bell
→ the member's own OIL ask only; the board's "+ Add" → scheduler only. The read-only window's Delete / Save are absent,
its body inert, Cancel reads Close, and the line names the owner. Found nothing beyond N4.

**Anything the fixes themselves broke.** `setBidStates`' return: three callers — `SelectSheet` (uses `already`),
`BidPicker.answer` (destructures `decided` only, and an already-approved cell never reaches it — above), `setBidState`
(ignores). `Sheet`'s keyboard handling: every user is a Leave War sheet; the guard to `#page-leavewar.on` keeps it off the
scheduler; no other component imports `Sheet`. `select.ts`'s swallow: `touchGesture` exists; the touch wait ends at the
next `pointerdown`, at the 400 ms timer and on unmount (`endSwallow`), a mouse keeps the 0 ms sweep, and a compat click
follows the lift with no `pointerdown` between, so a deliberate second tap is never eaten; `caldrag.ts`'s click eater
keeps its three exits and is now also armed for a finger's tap before `onTap`. The timeline hook: one consumer
(`undo-wire.ts`), cheap, asked before `missingStores` and the snap. `dayview.ts`: `EMPTY` carries `clashTails`, the
DayList reads `view.clashTails ?? []`, tail keys `t-<id>` cannot collide with `lines` (a tail is never in `view.all`).
`InputsPage`: `finishAdd` is reached only after a successful `writeInputsBatch` on both add paths (lines 494, 537), the
page never calls `commitNewInput`, so "Input added" cannot double. `export.ts inputRows` reads `endDate || date`.
`freeHalfBeside` / `cellProblem` read `winsOf` — the same windows the doors read. `MedMoveConfirm` is mounted in `App`
for members and admins; the guest app has no Inputs. React is 19.2, so `inert` is a real attribute. Found nothing.

---

## What this read did NOT do

No test was run and no browser was opened (the lock is another chat's). F1–F3 each carry the test that would pin them;
F1 is the one I would want walked as well, on the Inputs page's Remarks column and the printed schedule after a drag on a
published day, because it is the one that changes what a day prints.
