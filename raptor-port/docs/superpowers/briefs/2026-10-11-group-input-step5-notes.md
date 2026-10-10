# `[GROUP-INPUT-ONE-ROW]` step 5 — what was worked out before the build (11 Oct 26)

**BUILT 11 Oct 26, later the same day** — as worked out below, by the next chat. The drafted tests moved to
`raptor-port/src/ui/grouprow-hands.test.tsx` (the parked `.draft.tsx.txt` file is gone) and grew the drop, the armed place,
the typed line and the change-history line; the rule as built is `raptor-port/docs/engine-rules.md`, "On a shared input's
row the pucks are the input's people". What follows is the note as it was written, for the reasoning.

**What this is:** the builder's notes for step 5 of the plan
(`raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md` §4.5 and the shared half of §4.4), written
when the chat that built steps 2 to 4 handed off at 73% of its context. Nothing here is ruled by him and nothing
overrides the plan: it is the code already read, the shape decided for the door, and the tests already drafted, so the
next chat does not work them out again. **Step 5 is NOT built.** Its drafted tests are parked beside this file, not in
`src/` (they import functions that do not exist yet, and the preview's build type-checks test files):
`raptor-port/docs/superpowers/briefs/2026-10-11-group-input-step5-tests.draft.tsx.txt` — move it to
`raptor-port/src/ui/grouprow-hands.test.tsx`, see it fail, then build.

## The door — `raptor-port/src/ui/grouprow.ts` (it already holds `leadKeyOf`, step 4)

A SHARED ROW, for the door and the belt alike: `row.srcg` non-empty AND `engine/overlay.ts requestOfBox(day, row)`
answers a request (its standing row, not `kept`, the request not taken off and not read-only). A puck is ONE OF THE
INPUT'S MEN when its key is the member row's own place (`g:di.ri`) and `whoId(row.who)` is that request's person;
anything under `.xN` is the row's own.

The shape the drafted tests call:
- `groupPut(key, id)` → `'none' | 'done' | 'refused'`. A REAL person aimed anywhere on a shared row — a member's
  place, an extra's place, the "+ add" — is ADDED to the input: one outer command (`saveBatchX`) around
  `commitGroup({ rows: the entry's records }, draftOf(first), [...people, id], undefined, { sched: true })`, then,
  inside the same command, on HIS new record: the OIL answer copied where `entryOilAnswer` says `'same'`, and
  `mod = the earlier of nowStamp() and inputOwnDueISO(his)` (D741). Already in it: refused, "<Callsign> is already on
  this input" (D271). The seat he came from, if any, is not touched (reading R4). Afterwards, where the answers
  `'differ'`: `setOilAsk(his.iid, true)`, `setInpEdit(his)`, `notify()`.
- `groupTake(key)` → the same three answers. A member's place emptied: he leaves the input
  (`commitGroup` with the people less him, `{ sched: true }`). The LAST record of the entry: refused, "<Callsign> is
  the last person on this input — use ✕ to take it off the programme, or delete it in its own window" (reading R5).
  If his row's extras hold a placeholder: said in the same note, "ALL AVAIL came off <the input's name> with
  <Callsign> — drop it on the row again if it still applies" (D745).
- `groupLeaveTo(fromKey, toKey, write)` → `'none' | 'refused' | { landed }`. A member dragged onto another place:
  ONE command — his record dropped, then `write()` puts him on the place; a `false` from `write` throws `CmdRefused`,
  so he stays in the input. `ridKey(toKey, DAYS)` is taken BEFORE the command and `posKey(…)` AFTER it: `landed` is the
  place as it stands once his old row has gone (the flash and the "is he busy" check use it). The caller makes NO
  second schedule write (`drag.ts applyDrop`'s `done()` would add an Undo step).
- `groupRetarget(key, id)` → a placeholder (ALL / ALL AVAIL) aimed anywhere on a shared row becomes that row's LEAD's
  `g:di.<lead>.+`; anything else comes back unchanged. The caller then writes as it does today (a move still vacates
  the place it came from).
- `state/` reaches the door through ONE `HOOKS` entry (as `HOOKS.reqRowText` does for step 2): `state/store.ts
  writeSlot` / `writeFill` and `state/view.ts placeArmed`.

Callers, each asking before it writes: `ui/drag.ts applyDrop` (the seat branch, the cell branch and the "let go
anywhere else" branch — the target on a shared row first, then a source that is one of the input's men),
`state/view.ts placeArmed`, `ui/Shell.tsx`'s right-click, `state/store.ts writeSlot` / `writeFill`,
`src/probe-bridge.ts` (`w.setSlotVal`, `w.fillSlot`).

## The belt — `raptor-port/src/engine/slots.ts`

`setSlotVal`: a write (a person OR a blank) to the `who` of a shared row is refused — `false`, above `noteChange`,
where `sentinelSeatOK` sits. `fillSlot`: a REAL person on a shared row's "+ add" is refused; a placeholder is let
through and goes to `more` (the name box of a member row is never empty). Nothing else: `.xN` places, a one-man
request's row (no `srcg`), a `kept` row, a read-only request's row are written as before. The view (`overlay.ts`),
Accept / un-accept, a version load, Undo and a person's delete do not go through these two functions.

## The rest of §4.5, as read in the code

- **A typed box on the one row writes the whole entry** (D739): in `ui/inputedit.tsx`, `setInpField` and
  `setInpTitle` — where `isPersonal(inp.type) && inp.acc !== 'u'` and `entryRowsOf(INPUTS, inp).length > 1` — call
  `commitGroup({ rows }, d, the same people, undefined, { sched: true })`. `commitGroup` needs a fifth parameter,
  `opts`, passed on to its `commitInputEdit` calls. On the Unavailable list a typed box stays one man's (D737).
- **`entryOilAnswer(rows)`** (export it from `ui/inputedit.tsx`, beside `oilAskPlan`'s other readers): over
  `oilAskPlan(rows[0])`'s days — `{ kind: 'same', oil }` when every record answers every day alike; `{ kind: 'none' }`
  when nobody answered any, or no day asks; else `{ kind: 'differ' }`.
- **The question for one man alone already exists.** `InputEditor` has an `own` mode (`oilConf.own = iid` →
  `saveOwnOil` writes that record alone, never its late date) — built for the bell. Give `ui/pops.ts` a second flag
  (`OILOWN`, set by `setOilAsk(iid, true)`, cleared where `OILASK` is consumed) and, where the editor consumes
  `OILASK` (the `useLayoutEffect` that seeds the draft), open the sheet with `own: r.iid` when the flag is set. For
  this path the dialog should CLOSE after the answer and after a cancel — the scheduler was on the schedule, not in
  the input's window.
- **Why a dialog opened from the schedule saves one man** (the plan's "found with a failing test first"):
  `const win = open && CURPAGE === 'inputs'`, `const picker = win && ctx !== 'up'`, `const grouped = picker && (…)` —
  off the Inputs page `grouped` is always false, so Save is `commitInputEdit(r, draft)` for one record. The fix read as
  smallest: `picker = (win || rows.length > 1) && ctx !== 'up'` — the dialog then draws the people picker, saves
  through `commitGroup`, asks Delete "for everyone" and counts every man in its OIL lines (`oilRows`). Its dates stay
  not editable there (`datesHere` needs `win`) — a moved span would take the row off the day it was opened from.
  One test of Astra's from the last batch pins the OLD scope of the OIL lines for the schedule's dialog ("named RANGER
  as unanswered beside a button that answers for Ace alone") — it is rewritten to the entry, with the button answering
  for the entry too.
- **The board's row buttons** (`ui/board.ts boardMbtn`: `grdel`, `grcx`, `grflag`, `grinfo`): for a row whose
  `groundGroups` answer has several members, act on EVERY member before the one `afterSchedMutate()` — that is one
  command, one Undo. ✕: `unacceptInput` for each member's request (collect the requests first — each call splices).
  Red box / information-only: toggle the lead, set the others alike, `markEdit` each row's `gr:di.ri.prog`. CX:
  `askCx(lead, key, label, after)` — `after` copies `cx` / `cxr` to the other members and marks them.
- **Personal Inputs' Undo / Accept / → Unavail** (`ui/interactions.ts`, the `data-acc` branch): loop the same call
  over every record of the line (`state/inputgroup.ts entryLines`), one `afterSchedMutate()`, one sentence.
- **The row dragged** (`engine/reorder.ts moveGroundRow`): where the moved row or the row it lands on belongs to a
  group of several, build the whole new order as a permutation (the block's members together, in order; after the
  target's LAST member when moving down, before its first when moving up) and apply it as `sortGround` does
  (`rows = oldOf.map(…)`, `permuteKeys` on `g:` and `gr:`). A row that stands alone keeps today's path, byte for
  byte.
- **The LATE mark for the line** (`ui/html.ts lateTag` / `lateChip` / `lateTagOf` / `lateRowCls`,
  `ui/interactions.ts` the `data-lateoff` branch): shown when ANY record of the entry is late and shown; a tap sets
  every late record of it the same way (`state/view.ts toggleLateOff` is per record).
- **The placeholder's notice in the change history** (Fable's (a); `state/changelines.ts inputLines`): the removal's
  own line says "ALL AVAIL came off his row · switched off on it: <names>" — a READ of the day. Not yet read in the
  code by this chat.

## Known, and left

- Until step 5 lands, on the built branch: a time typed on the one row changes the lead's record alone (he then
  stands as his own row), ✕ / CX / red box act on the lead's row alone, and a puck dropped on the row goes to a
  member's extras. The branch is not for merging between steps 4 and 5.
- A request's row whose boxes were hand-typed BEFORE step 2 keeps those words until its request next changes (stored
  demo data — D56).
