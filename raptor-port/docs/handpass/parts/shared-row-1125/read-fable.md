# The code read of pull request 845 — the fresh, blind Fable reader (25 Nov 26)

*Saved whole by the host (chat 181) from the report file it wrote and its hand-back, the same text. Blind to the walk's reports and to the other two readers; read an exported copy of commit `9f9d0dd8c` (the branch joined with `main` `3c3789384`), this round's sheet, walk reports, scenario designs and handoff block taken out; the one brief: `docs/superpowers/briefs/2026-11-25-shared-row-code-read-brief.md`. About 18 minutes, 382,174 tokens; its proof tests stayed in its own scratch folder — its sweep of every order of cuts is lifted into `src/engine/rowinput-order.test.ts`.*

---

# Code read — one man's row of a shared absence follows him (pull request 845) — the fresh Fable reader

Read: the brief, the source diff `HEAD~1..HEAD` under `raptor-port/src` (tests included), the full rows it cites, and
the surrounding code of every door named below. Not read: any other `2026-11-25-shared-row-*` file, the walk parts, the
walk scripts or pictures. No handoff block was pasted into my context and nothing was compacted. Nothing in the copy was
changed. Proofs I ran are in my own folder `D:/c181/fable-scratch/` (run one file at a time with
`npx vitest run --config D:/c181/fable-scratch/vitest.config.mjs <file>`, or `vitest.dom.config.mjs` for the two
`*.domproof.ts`); each finding says whether it was run or only read.

Verdict in one line: the pointer (`rowInputOf`) is sound — I could not make it land a save or a press on another man's
input — but the row-order half is incomplete (F1, proven), the armed puck loses its ring while staying live (F2,
proven), and the "other time box" fix misses one surface (F3, proven).

---

## Findings

### F1 — A third cut-out still re-orders the rows (NEW code; proven)

**Setup.** One leave filed for four men, in the order A, B, C, D (Board or week, Unavailable list).
**Presses.** Type a new start on B's row (middle), then on A's row (first), then on C's row. Or: C, then D, then B.
**What happens.** After the third change, once the caret leaves: rows read **A, C, D, B** (first order) or
**A, C, B, D** (second). In the second case the row that moves is the very row just typed on (B drops below C, C slides
up into its place) — the original fault, one cut later. A name dragged onto that place then lands on the other man.
**What should.** A, B, C, D — "nothing on the board re-orders itself".
**Proof.** `order.proof.ts` (engine calls only: `ownInputOf` then `unavailFaces`): 4 of 4 fail. `fixorder.proof.ts`
sweeps every order of cuts: as built, 3 men pass; 4 men fail on 2 orders (B-A-C, C-D-B); 5 men on 22; 6 men on 194
(counted as shortest failing sequences).
**Cause.** `engine/inputown.ts ownInputOf` notes a slot only for a MIDDLE man (`k > 0 && k < drawn.length - 1`); the
first and last man's own inputs are placed in the list and are NOT in the shared input's block. `engine/rowinput.ts
unavailFaces` looks for a rider's `next` / `prev` only inside that block. So once a rider's neighbour has itself been cut
out as "first" (placed before the shared record) or "last" (placed after it), and the other neighbour is gone too, the
rider falls to `lost` — drawn after the whole block.
**A second way in, same cause (proven, `order.proof.ts` case 3):** three men A, B, C; B cut out; then another name
dropped on A's puck and another on C's (both neighbours replaced by `swapPerson`): rows read Y, Z, B.
**Fix — exact steps (validated in my scratch copy: every order of cuts for 3–6 men, each then undone step by step, and
every order for 5 men with every remaining man swapped after each cut — all pass):**
1. `engine/rowinput.ts`: give the slot a count — `SLOT: Map<string, { shared; prev; next; k: number; n }>`; change
   `noteRowSlot(ownIid, sharedIid, prev, next, k = 0)` to store `prev: String(prev ?? '')`, `next: String(next ?? '')`,
   `k`.
2. `engine/inputown.ts ownInputOf`: replace the line
   `if (k > 0 && k < drawn.length - 1) noteRowSlot(own.iid, input.iid, drawn[k - 1].p, drawn[k + 1].p)` with
   `if (k >= 0) noteRowSlot(own.iid, input.iid, k > 0 ? drawn[k - 1].p : '', k < drawn.length - 1 ? drawn[k + 1].p : '', k)`
   — EVERY cut-out rides, first and last too. Keep the `splice(k === 0 ? at : at + 1, …)` as it is: that is what a
   reload draws.
3. `engine/rowinput.ts unavailFaces`: replace `else lost.push(o)` with
   `else block.splice(Math.min(s.k, block.length), 0, ...facesOf(o))` and delete `lost` (declaration and the
   `...lost.flatMap(...)` in `out.push`). Latest-cut-first stays: it is what makes the count exact (when a rider's turn
   comes, the block holds exactly the people the shared input held when he was cut).
4. Correct the two comments that say the first and last man "need none of this".
5. Tests: lift the sweep from `D:/c181/fable-scratch/fixorder.proof.ts` into an engine test, and add to
   `ui/sharedrow-walkfinds.test.tsx` a four-man case through the Board's boxes in the orders B-A-C and C-D-B, and the
   three-man "both neighbours replaced" case through `reassignInput`.

### F2 — His armed puck keeps working after its row repaints, but wears no ring (NEW; proven)

**Setup.** Ranger and Hex share a leave. Board, Ranger's row: start 0900 (his own leave is cut out; the row is held).
Tap Ranger's puck — it arms, ring shown (`iu:<shared>~bane`).
**Presses.** Let the caret leave (tap blank space / the day's change repaints). Then tap a name in the crew list.
**What happens** (`arm.domproof.ts`): after the repaint his puck's address is his own input's id; the armed key is
still `iu:<shared>~bane`; `armTargetExists` answers true; **no puck on the board has the `armed` class**; `body.arming`
is still on; the name tapped (Ace) **replaced Ranger on his own leave** — "Ace 09:00–10:00, Hex 08:00–10:00".
**What should.** A live arm shows its ring on the row it will act on; a second tap on that puck puts it down.
**Cause.** `engine/slots.ts armTargetExists` now follows the pointer (so the arm survives), but
`ui/highlights.ts` (the `[data-inpseat]` pass of the arm painter) rings only an element whose address equals
`ARM.key` literally; `state/view.ts armSlot`'s "tapping it again puts it down" and `ui/drag.ts` (`if
(view.armedKey() === \`iu:${iid}\`) view.disarmSlot()`) compare literally too. On `main` the arm was dropped at the
next schedule check instead (silently) — so this is new behaviour, not an old one carried over.
**Fix — exact steps:**
1. `engine/rowinput.ts`: add
   `export function rowKeyNow(key: any): string { const p = iuParts(key); if (!p || !p.person) return String(key); const r = rowInputOf(inpById(p.iid), p.person); return r ? 'iu:' + iuTail({ iid: r.iid, person: p.person, several: idsOf(r).length > 1 }) : String(key) }`
   (imports: `iuParts` from `./keys`; `inpById`, `iuTail`, `idsOf` from `./inputs`).
2. `ui/highlights.ts`, the `[data-inpseat]` loop: ring when
   `'iu:' + el.dataset.inpseat === ARM.key || 'iu:' + el.dataset.inpseat === rowKeyNow(ARM.key)`.
3. `state/view.ts armSlot`: `if (ARM && rowKeyNow(ARM.key) === rowKeyNow(key)) { disarmSlot(); return }`.
4. `ui/drag.ts` (after `reassignInput(iid, pid)`): `if (rowKeyNow(view.armedKey()) === rowKeyNow('iu:' + iid)) view.disarmSlot()`.
5. Test: extend S7 in `ui/sharedrow-buttons.test.tsx` — after the arm, blur and `notify()`; expect exactly one
   `[data-inpseat].armed`, on the row whose address is his own input; click it; expect `armedKey() === ''`.

### F3 — A request's row on the Ground Programme still shows a stale other time box (OLDER; a missing call site of this change's second promise; proven on the Board)

**Setup.** A Meeting filed for Ranger, 08:00–10:00 — it lands on Monday's Ground Programme.
**Presses.** Board, that row: clear the End box (caret stays in it / Tab on within the block).
**What happens** (`ground.domproof.ts`): the input is saved all day, the row's own model reads start "" end "", and the
**Start box still reads 08:00** (same element, held).
**What should.** "A box never shows a time the input does not hold" — the promise this change makes for the same save
(`setInpField`) on the Unavailable and Personal Inputs rows.
**Cause.** `ui/board.ts boardChange`, the `reqRowText` branch (`f.value = boxText(p); if (rq === 'saved') notify();
return`) and `ui/textedit.ts routeFocusOut`, the `rq !== 'none'` branch — both set only the box typed in. The week's
half is read, not run: the input to run is the same Meeting, `[data-txt="gr:0.<ri>.end"]` emptied, focus moved to the
row's remark, then read `[data-txt="gr:0.<ri>.str"]`.
**Fix — exact steps:**
1. `ui/board.ts`, in that branch after `f.value = boxText(p)`:
   `const m = /^(gr:\d+\.\d+)\.(str|end)$/.exec(p); if (rq === 'saved' && m) { const op = \`${m[1]}.${m[2] === 'str' ? 'end' : 'str'}\`; const sib = [...document.querySelectorAll<HTMLInputElement>('#sbBoard [data-bfld]')].find(b => b.dataset.bfld === op); if (sib && sib.isConnected && document.activeElement !== sib) sib.value = boxText(op) }`
2. `ui/textedit.ts`, in the `rq !== 'none'` branch after the heal of `tx`: the same with `[data-txt]` inside
   `tx.closest('.day')`, `heal(sib, fmtTxt(boxText(op)))`, never the cell holding the caret.
3. Tests beside the two in `ui/sharedrow-walkfinds.test.tsx` "finding 2": the Meeting case on the Board and the week.

### F4 — Where his part cannot be found, two doors say nothing and one leaves the typed words on screen (older lines; now a designed outcome; read, not run)

- `ui/board.ts boardChange`: `if (!inp) return notify()` returns before `back()` exists — the held box keeps what was
  typed, looking saved, with no words. `ui/textedit.ts routeFocusOut`: `if (!inp) return` — the same on the week.
  `ui/interactions.ts`, the LATE chip: `if (inp) {…}` — a press that does nothing. The label, Reject and the puck do
  say "That input is no longer there".
- Reach: his row held, and he is out of both the shared input and his own (taken out by another door; his own handed
  to another man by a drop on the held row, then a box typed). Rare, but it is exactly reading (a)'s "nothing is saved"
  case, and the board's own rule is that a refused value is never left on screen looking saved.
- Fix: in both box handlers, on `!inp`: `HOOKS.toast('That input is no longer there — nothing was changed', 'warn')`
  and empty the box (`inf.value = ''` / `heal(ip, '')`), then `notify()`; in the chip's handler add the same toast in
  an `else`. To run: `sharedrow-follows`'s "taken out by another door" through the Board's box, asserting the box and
  the toast.

### F5 — Reading doors on the held row still read the shared input (new gap of the roll-call; low; read, not run)

- `ui/histbubble.ts` (`storyOf`, the dot pass, the bubble's heading): the held row's `iu:<shared>~<man>` is looked up
  by the shared id, so with History on, his held row shows the others' input's lines and not the line of the change he
  just made (filed under his own id). Fix: resolve `at.iid` through
  `rowInputOf(inpById(at.iid), at.person)?.iid ?? at.iid` in those three places.
- `leavewar/ui/ReqWords.tsx LeaveWords`: `rowInputOf(...) || inputById(row.iid)` — where his part cannot be found the
  window falls back to the shared leave and shows the OTHERS' words and documents (its save is refused, correctly).
  I found no way to reach it with the window open; if kept, the fallback should be `null` for a `personId` the leave no
  longer holds.
- The OIL-wait flash after Reject / a swap from the held row (`places: sel:[data-acck="<own id>"]`,
  `sel:[data-inpseat="<address>"]`) names the resolved id while the held row still carries the shared one: no flash.
  Cosmetic.

---

## The tests — could one pass without proving its claim?

- **T1** `leavewar/sharedrow-follows.test.ts`, "taken out by another door meanwhile: the drop changes nothing, **and
  says so**": `said` is emptied and never asserted. Add `expect(said.join(' ')).toMatch(/no longer there/)`.
- **T2** `ui/sharedrow-walkfinds.test.tsx`: the order is proven for one cut and for two cuts of four (both middle men
  at the time); no case has a first-or-last cut after a middle one — F1 lives in that gap.
- **T3** `ui/sharedrow-buttons.test.tsx` S7 runs the schedule's check while the row is still held, never after it
  repaints — F2 lives there.
- **T4** `sharedrow-follows.test.ts` calls `setInpField` / `reassignInput` / `setLeaveRemarks` directly; that is
  acknowledged and the three `ui/sharedrow-*.test.tsx` files and `nightwalk.test.tsx` do go through the doors (real
  `change`, `focusout`, `click` events on the drawn row). I found no test here that writes the data directly where it
  claims a door, and no assertion behind a condition that could skip it (`rowOf` asserts the row it found and that
  it is one man's).

---

## The host's readings — my answers

- **(a)** Held for the three boxes, Escape (both pages), Tab's refresh, the Board's Tab compare, the label, Reject, the
  LATE chip, the puck as drop target and as tap-arm target (save lands on his own). Not held for the ring (F2), the
  words when nothing is found (F4), the history dot (F5).
- **(b)** Held. `saveFromRow` compares all day, both times, the half and the remark; no command, no cut. One edge, not
  worth a fix (read, not run): the Board's remark box is compared untrimmed (`remarksTyped` returns a remark with no
  date as typed), so a remark retyped with a trailing space is not "the same" and cuts him out for words that read
  the same.
- **(c)** Held, and the one test of it goes through the real Reject and the real box. Every other kind is unchanged by
  the move to `listedUnavail`: an activity kind filed "→ Unavail" was and is one man's; SANS availability and an upchit
  (was "cut", now "whole") have no row with a box.
- **The reload question.** Within his rule (nothing is under a finger at a reload). Worth telling him only this: until
  the page is reloaded, the scheduler who typed sees A, B, C while every other device sees A, C, B for the same list.
  With F1's fix the first and last men are right everywhere; only a middle man differs across a reload.

---

## Explicit negatives — checked, nothing found

- **Pointer crossing / stale pointer.** `OWN_OF` is keyed by shared id AND man, written only after a committed cut
  (`ownPartSave`, `ok && made !== inp`), and `rowInputOf` returns a record only if it HOLDS that man now. Walked: still
  in the shared input; cut; cut again from his own after people were added to it; Undo (he is back in the shared one —
  followed by itself); Undo then Redo (same id returns); Undo then a second cut (pointer overwritten); his own handed
  to another man (null); his own deleted (null); cut by a medical or a posting's trim (`ownInputOf` without a note:
  null, nothing saved); the shared input deleted (null — every door needs the shared record to exist, so his held row
  goes dead rather than wrong); two men cut in turn (separate keys). Ids are random (`engine/newid.ts`), never reused,
  so a rolled-back or undone cut cannot alias a later record. No cycle is constructible; the 8-hop cap is never the
  thing that stops a legitimate chain.
- **Permission and the published day.** Every write lands through the same gate as before, asked of the input the
  change now lands on: `commitInputEdit(own, …, { sched: true })`, `reassignInput` (`canEditSched`, `protectedInput(r)`
  of the resolved record), Reject (`protectedInput(inp)` and everything after by the resolved id `k`), the LATE chip's
  own command. The no-change path writes nothing, so no pending mark, no sign-off wipe, no history line. The sibling
  box is display only. The cut-out's pending count is the older `frozenInputMatch` 3b, which pairs by id, man, `by`
  and `at` — not by list order, so "own before shared" moves nothing there.
- **Readers of the list's order.** `state/notices.ts noticePass`, `engine/inputs.ts frozenInputMatch`,
  `leavewar/inputgate.ts` (iterates a `.slice()`), `state/person-delete.ts` (iterates a prepared list),
  `command/ord.ts mintOrd` (an insert at the head or between neighbours gets a place of its own; a reload keeps it).
  Nothing sorts the inputs list; Auto sort and Sort all do not touch it.
- **Who draws the Unavailable rows.** Only `ui/html.ts inGrp` (Edit Schedule and the view-only week) and
  `ui/board-html.ts sbUnavailPanel` (desktop and phone are one markup); both ask `unavailFaces`. `sbInputsHTML` is not
  rendered. A published day's issued copy carries the same ids, so the same slots apply to it; an older issued version
  holds the uncut record and draws as issued.
- **The sibling box.** Set only from `rowInputOf(inpById(id), who)` — his, or the input itself where the row names no
  man — only when the save answered true, never the focused element, and scoped to the panel / the day.
- **`iuWhoAtt`.** Present on the label, every `accCtl` button and the LATE chip of a face that is `several` and listed
  under Unavailable; absent on a Personal Inputs line (the input's one line) and on a one-man row; `listedPersonal` and
  `listedUnavail` cannot both be true. `rowInputOf` with no man returns the input, so those presses are `main`'s.
- **The Leave War.** `SelectSheet` and `DayList`'s "Add to the …" look the leave up afresh by man and date at the
  press; `RemarksSheet`, `BidPicker` and `DayList` all go through `LeaveWords`, which now follows him; the windows'
  Approve / Refuse / Move / Delete act by man, date and entry, not by the held row.
- **Changes window jump, landing after Undo/Redo, the waiting list.** They take their address from the history line
  or the comparison at the moment of the tap (the own input's id), and the tap takes the caret out of the row, so the
  row is already repainted with its own address.

---

## Tidiness note — the changed lines only (filed, not fixed)

1. **Duplicated with one home?** The "resolve the row's address" three-liner (`iuParts('iu:' + tail) || {…}`, then
   `rowInputOf(inpById(at.iid), at.person)`) is written eight times across `board.ts`, `textedit.ts`,
   `interactions.ts`; one `rowInputAt(tail)` in `engine/rowinput.ts` would be its home (and F2's `rowKeyNow` beside it).
   The sibling-box block is written twice (Board, week) and F3 needs it twice more. The long "ONE MAN'S ROW FOLLOWS
   HIM" comment stands whole in both `rowinput.ts` and `inputedit.tsx`.
2. **Named unclearly?** `rowInputOf` is re-exported from `ui/inputedit.tsx` and imported from there by three files and
   from the engine by two — two import paths for one function. `made` / `mine` / `now` are fine in place. The two
   page-life maps are noted at different layers (`SLOT` in the engine at the cut, even one later rolled back;
   `OWN_OF` in the UI after the commit) — the asymmetry is harmless today but is not said anywhere.
3. **Longer than its job needs?** `unavailFaces` carries a `lost` list that F1's fix removes; the unchanged test in
   `saveFromRow` is one dense line — a named `sameAsRow(d, was)` would read at a glance.
