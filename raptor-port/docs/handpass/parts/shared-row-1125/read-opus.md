# The code read of pull request 845 — the fresh, blind Opus reader (25 Nov 26)

*Saved whole by the host (chat 181) from the report file it wrote and its hand-back, the same text. Blind to the walk's reports and to the other two readers; read an exported copy of commit `9f9d0dd8c` (the branch joined with `main` `3c3789384`), this round's sheet, walk reports, scenario designs and handoff block taken out; the one brief: `docs/superpowers/briefs/2026-11-25-shared-row-code-read-brief.md`. About 12 minutes, 293,887 tokens; its proof tests stayed in its own scratch folder.*

---

# Code read — one man's row of a shared absence follows him (pull request 845) — fresh, blind Opus reader

Read on the exported copy D:/c181/opus (HEAD = the whole change, HEAD~1 = main). No handoff block was pasted into my
context; there was no compaction. Nothing in the copy was changed. My two proof tests are in
`D:/c181/opus-scratch/recut.test.ts` (run with `cd D:/c181/opus/raptor-port && npx vitest run --root D:/c181/opus-scratch D:/c181/opus-scratch/recut.test.ts`);
both fail on HEAD, as described below. The change's own four test files pass (39 of 39).

## Findings

### F1 — A man cut out AGAIN from his own input, while that input is drawn between two others, drops below everyone (new in this change; order promise D735)

**Failure (proven at engine level, scratch test P1).** Shared leave S for A, B, C (B in the middle). A time typed on B's
row cuts him out: B1, remembered between A and C (`noteRowSlot`). Rows read A, B, C — correct. Then a second man X is
put into B1 (B1's own window, reached from B's type label, Person box). Rows read A, B, X, C — correct. Then a time is
typed on B's row again (now `B1~b`, since B1 holds two): B is cut out of B1 into B2. Expected rows: A, B, X, C.
Actual: **A, X, C, B** — B's row jumps from second to last, and X's slides up into his place, under the finger. The
mirror case (X cut out of B1 instead) gives A, B, C, X: X jumps below C.

In the app: Board → Unavailable, S for Hex/Ranger/Outlaw as in the walk-finds test; type 0900 in Ranger's start, Tab,
leave; tap Ranger's type label, add a second man in the window, save; type 0930 in Ranger's start, Tab, then press on
the crew list. Ranger's row moves to the bottom of the leave's rows; a name dropped where his row stood lands on the
next man.

**Cause.** `src/engine/inputown.ts ownInputOf` decides where the new record goes from the man's place in the record
being cut (`k === 0` → before it, last → after it, middle → `noteRowSlot`). That is right only when the record being
cut is drawn where the list holds it. B1 is not: it is drawn inside S's block through its slot
(`src/engine/rowinput.ts unavailFaces`). B2 is spliced next to B1 in the list (after S's whole block) and gets no slot,
so it is drawn at the list's place — after C.

**Fix, step by step.**
1. In `src/engine/rowinput.ts` export a reader: `export function rowSlotOf(iid: any) { return SLOT.get(String(iid)) }`.
2. In `src/engine/inputown.ts ownInputOf`, after the splice, replace the one `noteRowSlot` line with:
   - `const ride = rowSlotOf(input.iid)`;
   - if `ride`: always `noteRowSlot(own.iid, ride.shared, k > 0 ? drawn[k - 1].p : ride.prev, k < drawn.length - 1 ? drawn[k + 1].p : ride.next)` — the new record rides the SAME shared input, between its own neighbours, falling back to the riding record's neighbours at its edges;
   - else keep today's middle-only `noteRowSlot(own.iid, input.iid, drawn[k - 1].p, drawn[k + 1].p)`.
3. In `unavailFaces`, insert riders EARLIEST cut first (sort ascending on `n`) and try `prev` before `next`
   (`pv >= 0 → splice(pv + 1)`, else `nx >= 0 → splice(nx)`, else lost). I worked five orders by hand with this rule —
   B then D of five; C then B of four; D then C of five; the re-cut of B from B1 = [B, X]; X cut from B1 — and all keep
   their places. The current rule (latest first, `next` first) gets the X-from-B1 case wrong even with step 2 (A, X, B,
   C). Prove it rather than trust my hand-working: every case in `src/ui/sharedrow-walkfinds.test.tsx` must stay green,
   plus these two new red-first cases.
4. Red first: the scratch test P1 shows the engine shape. Add the same through the real door in
   `sharedrow-walkfinds.test.tsx`: file the leave for rocky/bane/casper on 14 Jul, type 0900 on bane's start, leave
   the row, put `a` into bane's own leave through its window (or `putPerson`, labelled as set-up only), type 0930 on
   bane's start, leave the row, and expect `boardOrder(1)` to be Hex, Ranger, a, Outlaw.

Risk: medium-low. It needs a second man added to a man's own cut-out leave, but the harm is the same as the walk's
A7(e): a row slides under the pointer and a drop replaces the wrong man.

### F2 — An arm made on the held row survives the repaint, but its ring disappears (new in this change)

**Failure.** On a phone, where a tapped puck leaves the caret in the box: type 0900 in Ranger's start on the Board and
Tab (he is cut out into R1; the row is held, still addressed `S~Ranger`). Tap his puck. The seat arms as
`iu:S~Ranger` and rings, and the crew drawer opens. Now put the caret anywhere else — Hex's start box, say. Ranger's
row repaints with its real address, `iu:R1`. `armTargetExists` now keeps the arm (it follows him through `rowInputOf`),
but the ring pass compares strings: `'iu:' + el.dataset.inpseat === ARM.key` (`src/ui/highlights.ts`). So nothing on
the Board is ringed, yet the drawer stays up, and a tap on any name replaces Ranger ("… is now unavailable instead of
Ranger") with no armed row in sight. A drop onto the repainted seat no longer puts the arm down either
(`src/ui/drag.ts`: `view.armedKey() === \`iu:${iid}\``).

Before the change the arm was put down at that paint, silently (the scenario designer's S7). Now it is kept but
invisible.

**Cause.** `src/engine/slots.ts armTargetExists` was taught to follow the man; `ARM.key` itself was not, and every
other reader of `ARM.key` (the ring pass, the drop's disarm, `slotTitle`, tapping the seat again to put it down)
compares the literal key.

**Fix, step by step.**
1. In `src/state/view.ts`, in the after-command body that runs `if(ARM&&!armTargetExists(ARM.key))disarmSlot();`, add
   a step straight after it: if `ARM` and `String(ARM.key).startsWith('iu:')`, `const p = iuParts(ARM.key)`; if
   `p && p.person`, `const r0 = INPUTS.find(i => i.iid === p.iid)`, `const r = rowInputOf(r0, p.person)`; if `r` and
   `r !== r0`, set `ARM.key = 'iu:' + (idsOf(r).length > 1 ? \`${r.iid}~${p.person}\` : r.iid)`,
   `ARM.title = slotTitle(ARM.key)`, `ARM_ROW = armedRowKey()`, then `paintArm()`. (Export a small setter from
   view.ts if the body is not in that module.)
2. Red first, in `src/ui/sharedrow-buttons.test.tsx`: cut Ranger out with the caret held, click his `[data-inpseat]`
   without blurring, then blur and `notify()`; expect one `[data-inpseat].armed` whose address names R1, and expect
   `view.armedKey()` to equal `'iu:' + R1.iid`.

Risk: low. Phone only, and the plant still lands on Ranger's own leave; but the arm cannot be seen.

### F3 — Where the shared input is gone, his own input is never found; and a refused box keeps showing a time nobody saved (the first part is a gap in the fix's own promise; the second is older)

**Failure (scratch test P2, proven).** S for A and B; A is cut out into A1 (pointer noted); S is then deleted (the
last man's own window → Delete, or an Undo of S's filing). `rowInputOf(inpById('S') /* null */, 'a')` returns
**null**, though A1 holds him. So on his still-held row: a time typed saves nothing; Escape restores nothing; Tab's
refresh leaves the old text; the type label and Reject say "That input is no longer there"; the arm is put down. The
same applies wherever his part cannot be found (his own leave handed to another man by a drop, or cut by a medical or a
posting, which note no pointer). In every such case `src/ui/board.ts boardChange` does `if (!inp) return notify()`, and
`src/ui/textedit.ts routeFocusOut` does `if (!inp) return`: no words, and **the box goes on showing the time he typed**
until the row repaints. That breaks the contract the change itself states ("a box never shows a time the input does
not hold") and the standing rule that a refused press is never silent ([HUMAN-RETEST] W4-F3).

**Cause.** `src/engine/rowinput.ts rowInputOf(inp, who)` starts from the record. With the record gone, the pointer
`OWN_OF['S~a']` is never read. The silent return is older (HEAD~1 already returned when the input was deleted).

**Fix, step by step.**
1. In `rowinput.ts` add `export function rowInputAt(iid: any, who?: any)`: `let cur = INPUTS.find(r => r.iid === iid) || null`;
   if `!cur && who != null && who !== ''`, `const nx = OWN_OF.get(\`${iid}~${who}\`)`, `cur = nx ? INPUTS.find(r => r.iid === nx) || null : null`;
   then `return cur ? rowInputOf(cur, who) : null`.
2. Replace each `rowInputOf(inpById(X), who)` / `rowInputOf(INPUTS.find(... === X), who)` with `rowInputAt(X, who)`:
   board.ts (two in `boardChange`, one in `boardTab`); textedit.ts (focus-out twice, `refreshTextDestination`, both
   Escapes); interactions.ts (Accept/Reject, LATE chip, type label — the address there is `inpId`, which for a live
   record is its iid); inputedit.tsx `reassignInput`; slots.ts `armTargetExists` (replace the `INPUTS.some(...)` with
   `!!rowInputAt(p.iid, p.person)` when `p.person` is set).
3. In `boardChange`, replace `if (!inp) return notify()` with: `HOOKS.toast('That row is no longer there — nothing was saved', 'warn'); notify(); return`. In `routeFocusOut`'s `data-inp` branch, replace `if (!inp) return` with the same toast and `txtCommit()`, so the cell repaints. Wording goes through the app's words review (Opus drafts, a fresh Fable adjusts).
4. Red first: P2 at engine level; at the door, in `sharedrow-board.test.tsx`, cut bane out with the caret held, delete
   the shared input through rocky's own window, type 1100 in bane's held end box, and expect bane's own leave to end at
   11:00 (after step 2), or — where his part is truly gone — a toast and no stored change.

Risk: low. The deletion has to happen while the caret stays on his row (a phone), but the silent stale box is the same
shape as the original fault: a screen that says one thing while the record says another.

### F4 — The Leave War remark window falls back to the OTHERS' leave when his part cannot be found (new in this change; display only)

**Failure.** `src/leavewar/ui/ReqWords.tsx LeaveWords`:
`row = (row && (rowInputOf(inputById(row.iid), personId) || inputById(row.iid))) || row`. When `rowInputOf` answers
null — he is out of the shared leave by a door that noted no pointer (a medical cut, a posting, a drop onto his puck) —
the window shows the SHARED leave, which now holds only the others: their remark in his box, and their documents in his
document list. Pressing Save is then refused by `setLeaveRemarks` ("That could not be saved — change it on the Inputs
page"). Nothing is written, but his window shows another man's words and documents as his.

**Cause.** The `|| inputById(row.iid)` fallback, added with this change.

**Fix, step by step.** Replace the line with:
`const now = row ? inputById(row.iid) : null; row = personId ? rowInputOf(now, personId) : (now || row)`, then, where
`row` is null and `personId` is set, show the window's existing refused note in place of the box. Check the three
callers (BidPicker, DayList, RemarksSheet) still render with `row` null; each already passes a row it read for
`personId`, so the null case is only the stale one. Red first in `src/leavewar/ui/nightwalk.test.tsx`: open the
remark window on a shared leave, cut the man out by a medical through `inputgate`, and expect the box not to show the
other man's remark.

Risk: low.

## Explicit negatives — checked, nothing found

- **The roll-call of doors holding one man's address.** Board and week Unavailable rows, three boxes each: board.ts
  `boardChange` and `boardTab`; textedit.ts focus-out, both Escapes, `refreshTextDestination` — all ask `rowInputOf`.
  Type label, Reject / → Ground / → Unavail (`accCtl`), LATE chip: each carries `data-iuw` only on a one-man Unavailable
  row of a shared input (`iuWhoAtt`), and its press asks `rowInputOf`. The Reject handler uses the followed input's id
  everywhere below the lookup (`k = inpId(inp)`). Puck drop (drag.ts) and tap-arm then plant (interactions.ts) both
  reach `reassignInput`, which follows him. `armTargetExists` follows him (F2 is the ring only). The phone layout uses
  the same builders. The Leave War: `setLeaveRemarks` follows him; the drag window (`SelectSheet keepWords`) reads
  `leaveInputsAt(pid, …)` fresh for each cell, so it already gets his own leave after the first cut; DayList's "Add to
  the …" passes a row read for him. The input window opened from the label holds the followed record.
- **Doors that hold the address but only show things:** `data-inprow` (the history bubble, the changes window's jump,
  boardland's landing) and `slotTitle`. On a held row they may show the shared input's story until the row repaints.
  They write nothing, so I filed nothing.
- **Can a pointer lead a write onto someone else's input?** No. `rowInputOf` returns a record only where
  `holds(cur, who)`, so whatever it returns holds him. A record holding him and others is cut again by `saveFromRow`.
  Keys are `<shared id>~<man>`, so two men's pointers cannot cross. Undo puts him back in S, and the `holds` check
  comes first; Redo restores the same id; a refused or rolled-back cut leaves a pointer to an id that never exists, and
  that pointer finds nothing. Hand-off by drop: R1 no longer holds him, so null (see F3 for what is then shown).
- **`saveFromRow`'s new tests.** `listedUnavail` in place of "not a Personal kind left out": the only kinds whose
  behaviour moved are an overseas duty sent back to Personal Inputs (now saved whole for everyone — D739, D661, the
  host's reading (c)), SANS availability and up-chits. The last two draw no row boxes, so they cannot reach this door.
  The no-op return happens only on the one-man-of-several path; its callers (`setInpField` ← board, week, reqrow)
  treat `true` as "show as saved". The week's `txtCommit` then runs an epilogue with nothing changed — no record is
  written. Compared fields: the remark compares typed words to typed words (`draftOf` already strips the till tail).
- **Permissions and the published day.** Every write still goes through `commitInputEdit` / `acceptInput` /
  `writeInputsAs` on the record it lands on, after `canEditSched` at the press. The no-op guard stops the phantom
  pending change on a published day. The order change touches only list position (`mintOrd` gives the inserted record a
  place between its neighbours, so it survives a reload); the issued copy's frozen records carry no slot ids.
- **The other callers of `ownInputOf`.** The medical cut (`inputgate.ts`, which walks a copied list and splices the
  pieces at the own record's own index) and the posting trim (`person-delete.ts`, which walks a precomputed list) hold
  no index across the call, so "before" is safe for both. Neither notes a pointer (that is F3's "his part cannot be
  found" case).
- **Every renderer of the Unavailable rows** asks `unavailFaces`: the week's `inGrp` (edit and view pages) and the
  Board's `sbUnavailPanel` (desktop and phone). The other `facesOf` users are SANS cards, Personal Inputs (in drawn
  order, by name) and the retired band.
- **The sibling box.** It is set only from the followed input, never while it holds the caret. The search is scoped to
  the panel body on the Board and to the day on the week, so it cannot reach another row's box with the same address.
- **Tests.** No assertion hides behind a condition that would let it pass empty. The walk-finds helpers use `find(...)!`,
  so a missing row throws. The order tests press the real boxes. `file()` and `putPerson`-style set-up are set-up, not
  the door under test.

## Tidiness note (filed, not fixed)

1. **Duplicated:** the 13-line "ONE MAN'S ROW FOLLOWS HIM" comment stands word for word in both `engine/rowinput.ts`
   and `ui/inputedit.tsx`. `rowInputOf` is imported from two homes: `ui/inputedit` re-exports it (board.ts,
   textedit.ts, ReqWords.tsx) while interactions.ts and slots.ts import the engine. The "set the other time box" block
   is written twice, in board.ts `boardChange` and textedit.ts focus-out.
2. **Unclearly named:** `hop < 8` is an unexplained limit. `SLOT`, `n` and `riders` / `riding` / `lost` need their
   comment to be read.
3. **Longer than its job:** the eleven `rowInputOf(inpById(id), who)` call shapes would be one `rowInputAt(id, who)`
   (F3's fix shortens them all).
