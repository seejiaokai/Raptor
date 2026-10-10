# The schedule's one row for a shared input — the plan (`[GROUP-INPUT-ONE-ROW]`; D661, D662, D734–D743 — 10 Oct 26)

**Status: version 1 — written 10 Oct 26 by Opus 5.5; NOT yet read, NOT built.** Read next by Astra and by Sol 6.1, each
blind, one round (D67, D590 — it reaches published days and earned OIL). Branch `claude/group-input-one-row`, cut from
`main` at `8d8caff6`. Builder: Opus 5.5. The design note it is written from:
`docs/superpowers/specs/2026-10-10-group-input-one-row.md`; the approved pictures (D743, the design of record):
`docs/mock/group-input-one-row.html`, images under `docs/mock/img/group-input-one-row/`.

## 1. What he ruled

Open a full row before leaning on its detail: `grep -h '^| D736 |' .claude/decisions-full/*.md`.

- **D661, D662** — on the schedule a shared input is ONE row holding everyone; its own job.
- **D734** — on that row the pucks ARE the input's people: a puck taken off takes the man out of the input, a puck put on
  adds him. A one-man request's row is unchanged (a man the scheduler adds there is the row's own — D18, D470).
- **D735** — one row, one time; the row never splits or joins by itself.
- **D736** — on a published day a shared input filed, taken off the programme or re-timed is ONE change waiting, one line
  naming its people; one man taken off or added is one each. Every count agrees.
- **D737** — on the Unavailable list it stays a row a man; that list is left as it is.
- **D738** — a man added by a drag onto the row takes the OIL answer the input already carries; no question on the schedule.
- **D739, D740** — a time or a remark the scheduler types on a request's row — shared or one-man — changes the request
  itself; what was filed is kept only in the change history, with the scheduler's name.
- **D741, D742** — for every kind of input, no change made from its row on the schedule makes an input that was on time
  read LATE; a change in the input's own window still does; an input already LATE stays LATE.
- **D743** — the ten pictures are approved as drawn.

Rulings that bound it: **D109, D113, D114, D174, D176, D178, D103, D45, D98** (what a published day counts, and that
nothing on it changes unseen), **D663** (the changes window's one item), **D660, D682, D711, D731 (4)** (a shared input's
OIL answers), **D18, D46, D470, D468, D271, D278** (who stands on a request's row and what is the row's own), **D605** (a man
on leave is flagged where he is seated), **D715–D717** (an input's own title; rules read the KIND), **D450** (a day is saved
only by its holder), **D56, D401** (stored demo data is not converted), **D200** (permissions: one module), **D473** (the
table list is kept true), **D29** (a code change never trims a document), the 9 Aug 26 late-mark rules and the 10 Aug 26
"nothing on the board re-orders itself".

## 2. The app today (read 10 Oct 26 on this branch — verify every line)

- **A shared input is one record a man** tied by `grp` / `grpBy`; an ENTRY is the live records sharing `grp` AND the
  shared fields, worked out on read (`state/inputgroup.ts` `SHARED_FIELDS`, `sharedKey`, `entriesOf`, `entryRowsOf`). The
  one writer is `ui/inputedit.tsx commitGroup(entry, draft, people, oilDec)` (:1616); `removeEntry` (:1551) deletes all.
- **A request's row is a real ground row worked out on read.** After every command and at every load
  `state/holderbase.ts rederive()` copies the holder's stored week and runs `engine/overlay.ts viewOfWeek`:
  `reconcileRequestRows` (a row whose request is gone or cannot stand goes; a row whose request changed — `srcv` differs —
  is re-made in place by `Object.assign(row, requestRowFields(r))`, keeping its id, place, `more`, `cx`, `cxr`, `flag`,
  `info`) and `landRequests` (a request with no row lands on its START day: `{prog, str, end, who, rmks, srcType, src, srcv,
  rid: 'r'+iid}`, pushed at the end). **One request, one row** — so a group of four is four rows (`overlay.ts:316-344`).
- **A scheduler's typing on that row writes the ROW, not the request:** the week's `data-txt="gr:di.ri.{prog|str|end|rmks}"`
  (`ui/textedit.ts routeFocusOut` → `txtSet`) and the board's `data-bfld` (`ui/board.ts` → `txtSet`). It lasts until the
  request next changes, when the re-make overwrites it (`[REQ-ROW-OWN-BOXES]`).
- **Typing under Personal Inputs or on the Unavailable list already writes the input:** `data-inp` / `data-ifld` →
  `inputedit.tsx setInpField` (:1475) → `commitInputEdit` (:1025), which stamps `r.mod = nowStamp()` on EVERY save (:1140)
  — and `engine/inputs.ts isLateInput` reads `mod` alone (:934). So today that typing can turn an on-time input LATE.
  `reassignInput` (:1357 — a different man dropped on an Unavailable row) goes through the same save. On a shared input,
  `setInpField` changes ONE man's record, which then no longer matches its entry and reads as his own input.
- **Pucks on a ground row:** `who` (the name box) and `more[]` (extras), written by `engine/slots.ts setSlotVal` /
  `fillSlot` from four doors — `ui/drag.ts applyDrop` (:323-379), `state/view.ts placeArmed` (:1205), the right-click
  remove (`ui/Shell.tsx:229`), `state/store.ts writeSlot` / `writeFill`. None touches an input. The Unavailable seat has
  its own door (`data-inpseat` → `reassignInput`), a data edit that vacates no seat (`drag.ts:210-231`).
- **The row's buttons** (board only — `ui/board-html.ts sbRowCtl`): ✕ `grdel` → `slots.ts unacceptInput` (row spliced, the
  request reads 'r'); CX `grcx`; red box `grflag`; info-only `grinfo` (`ui/board.ts:1066-1106`).
- **A published day counts one item per INPUT** (`engine/publish.ts dayPendingItemsIn` :211 — the `byId` loop pairs a
  request's filing with its row's add or delete, D114, and folds its details and re-landed row into it, D178). A group of
  four is therefore four items; every count reads this one body (the day head, `ui/ALPanel.tsx`, the changes window's
  title and "To go out" tab, the sign-off line, the stored amendment's `units`, `dayDiscardCount`). The list is
  `ui/pendlist.ts pendListHTML`; "All changes" already folds a group filing (`ui/changesmodel.ts mergeFiled`, D663).
- **OIL reads each man's own record:** the schedule half skips every `src` row (`engine/oil.ts:324`); the request half
  credits the holder from his record's hours and answer (`engine/oilev.ts projectOilInputs`), the row giving only
  standing (`standsOn`); a man the scheduler put on the row earns by default (`landedExtras`, D18, D470); a switch is
  keyed `<person>|i:<iid>` (`ui/oilmode.ts toggleOilPerson`).
- **Nobody is told** when someone else changes his input: the change history line and the card's small print are the only
  traces (the bell has four sources, none of them this — `ui/topbits.tsx bellOn`).

## 3. The bet — attack it

**The shared input stays one record a man AND one ground row a man. The ONE row is made where a person meets it: where
it is DRAWN, where a hand WRITES to it, and where a published day COUNTS it.** Every reader of a row or of an input — the
warnings, the events, crew rest, OIL and its evidence, the amendment's stored diff, the sign-off binding, the holder base,
the day's saved shape, the Leave War — goes on reading one man's record and one man's row, unchanged.

Why this and not one real row holding several requests: such a row would have to teach every reader of `row.src` that a
row has several requests — `standsOn` and its nine callers, the landing, the holder base's `acc`, OIL's item keys and
evidence (a puck's switch is keyed by ITS request; with one row the key would move whenever the first man left), the
filing axis, the issued snapshot — and a miss there is SILENT (an OIL credit, a count). Drawn-as-one keeps every miss
VISIBLE: a row drawn twice, a button that changed one man. The same bet the calendar job made for the Inputs pages
(its plan §3.13), now extended to the schedule.

What the bet costs, and where each cost is paid: the rows of one input must stay TOGETHER and ALIKE (§4.2), every hand
that writes to the one row must write to all of them or to the input (§4.4, §4.5), and the count must fold them (§4.6).

## 4. The design

### 4.1 Which rows are one row
A new pure module `src/engine/grouprows.ts` — `groundGroups(day)`: the day's ground rows that are drawn as one. Two rows
are the same one row when both carry `src`, neither is `kept`, they carry the same non-empty **`srcg`** (below) and are
alike in everything the row shows and the scheduler sets: `prog`, `str`, `end`, `rmks`, `srcType`, `cx`, `cxr`, `flag`,
`info`. Returns, per row index, `{ lead, members[] }`; the LEAD is the first member in the day's own display order
(`engine/order.ts groundOrder(rows, gman)`), so the one row stands where its first row stands. **Read off the ROW, never
the live input** (the `rowKindTag` precedent): an issued face draws what was issued, the next-week peek and another
week's read need no input lookup, and rows that are not alike are honestly drawn apart.

`srcg` is a seventh thing a request writes on its row: `requestRowFields(inp)` (`engine/overlay.ts:165`) adds
`srcg: inp.grp` only where the record has a group; `srcvOf` appends `'|g:'+grp` only then — so an ordinary request's row
and its `srcv` are byte for byte what they were (no row is re-made by this build, D56), and a record that joins or leaves
a group re-makes its row once. Like `srcv` it is not canonical (`restore.ts dayKeys` does not name it): it moves no
digest, diff, count or signature. `engine/schema.ts GroundRow`, `docs/data-schema.md`, `docs/data-model.md` gain the
field (D473).

`sharedKey` / `SHARED_FIELDS` move, unchanged, from `state/inputgroup.ts` to a new `src/engine/inputentry.ts` and are
re-exported from where they were (the engine may not import `state/`; §4.6 needs them in `publish.ts`).

### 4.2 Kept together and alike — in the view, never by a write to the day (D450)
In `engine/overlay.ts`, so the person who acted, a reload and another device see the same day:
- **A new member's row lands beside its own.** `landRequests`: where the day already holds a standing row with the same
  `srcg` and the same six fields the new row would have, the row is inserted straight after the LAST of them — not pushed
  at the end — and takes that row's `cx`, `cxr`, `flag` and `info`. Rows below it move one index; nothing on screen moves
  (marks are keyed by `rid`). Everything else about landing — the start day, the published-day rule (`overlay.ts:336-339`),
  oldest first — is unchanged.
- **A placeholder survives its row.** `reconcileRequestRows`: when a row is taken away (its request gone, retyped, moved
  off the day or filed under Unavailable) and it carries placeholder pucks (`isSpecial`) in `who` or `more`, and another
  standing row of the day has the same `srcg`, those placeholders are appended to that row's `more`. So an ALL AVAIL
  dropped on the one row does not vanish when the man whose record carried it leaves the input. (D278: a placeholder may
  stand on a row twice — no de-duplication.)
- A member row whose own request changed alone re-makes alone (today's rule 6) and so stops being alike — it is drawn
  apart, as the entry rule already reads its record apart.

### 4.3 Drawn as one (D661, D743)
One helper decides the people of a drawn row, read by every builder: for a group, each member row's `who` in A-to-Z order
of callsign (D727's order), then each member row's `more` in member order; every puck keeps ITS OWN row's key
(`g:di.ri`, `g:di.ri.xN`), so its flag, its amendment mark, its OIL bar and switch, a tap on it and a drag of it are that
man's row's, as today. The one "+ add" place carries the lead's key.
- **The week** (`ui/html.ts`, the ground loop :1947 — Edit Schedule, View-only Sched, an issued face): a non-lead member
  emits nothing; the lead emits one `plRow` with those pucks; `one` only when a single puck. The LATE tag, the kind under
  a title (D717) and the row classes are the lead's. On a phone the row's two times stay together at its top
  (`scheduler/09-week-responsive.css` — the approved picture 2; today they spread down a tall row).
- **The board** (`ui/board-html.ts sbGroundPanel` :592): the same; one name box, one pair of time boxes, one remark box,
  one set of row buttons, one grip. In OIL Earn each member's pucks are drawn with that member's own item
  (`oilRow(groundItemKey(member))` before its seats).
- **The next-week peek** (`ui/peek.ts` :220) and anything else that walks `groundOrder` to draw: the same helper. The CSV
  export and the print are checked in the roll-call (§6) and follow it where they list ground rows.
- **Personal Inputs** (the week's `inGrp` when it is that panel, `html.ts:1987`; the board's `sbInputsGroupPanel` /
  `sbInpRow`): the day's activity inputs are grouped by `entriesOf`, and — split by filing state, so a line never claims
  what is true of only some — an entry of several is ONE line: every man's puck (display only, as today), the title, the
  kind, the times and the remark of the entry, one Undo / Accept. The folded line counts entries ("1 input · 1 on
  programme"). On a desktop the panel's People column is two pucks wide, as the Ground Programme's (picture 5).
  **The Unavailable list is untouched: a row a man (D737).**
- A jump to a row that is not drawn (the changes window's tap, History's gold dot, a warning's click) lands on its lead:
  one resolver `leadKeyOf(key)` beside the jump (`ui/interactions.ts jumpToChange`, `ui/ChangesWindow.tsx:60,68`).
- **Stored rows from before this build carry no `srcg` and are drawn a row a man until their request next changes** (D56).

### 4.4 What a typed box changes (D739, D740, D742) — step 2 of the job, for every request row
A new door `src/ui/reqrow.ts reqRowText(path, text)`, asked FIRST by the three callers of `txtSet` for a typed box — the
week's `routeFocusOut` (`ui/textedit.ts:100`), the board's `boardChange` (`ui/board.ts:1203`) and `state/store.ts
writeText`. It answers "not a request's box" (the caller goes on exactly as today) unless the path is
`gr:di.ri.{prog|str|end|rmks}` of a row that IS its request's standing row (`standsOn(DAYS[di], row.src) === row`, not
`kept`, the request not read-only and not taken off). Then nothing is written to the row:
- `str`, `end`, `rmks` → `setInpField(inp, field, text, { sched: true })` — the body the Personal Inputs box already uses,
  with its manners: an unreadable time is refused and the box heals; a time typed alone defaults the other end; a time
  CLEARED makes the request all day.
- `prog` → a new `setInpTitle(inp, text, { sched: true })`: through `titleOf` (the one normaliser — 40 characters; a name
  equal to the kind's own name is no title), so a name typed on the row becomes the input's own title, as typed. A box
  left as it reads writes nothing.
- The row is then re-made on read by the rule that exists (`srcv` moved): its id, place, `more`, CX, red box and
  info-only kept (D468, D46). One input command, one Undo step, one history line in the scheduler's name with the old
  value in its "from" (`state/changelines.ts inputLines` — unchanged).
- **A shared input:** `setInpField` / `setInpTitle` write the WHOLE ENTRY when the input is one the schedule draws as
  one line — an activity kind not filed under Unavailable (`isPersonal(type) && acc !== 'u'`) whose entry holds more than
  one record: `commitGroup({ rows }, draft, the same people, undefined, { sched: true })`. On the Unavailable list a typed
  box changes that man's record alone, as built (D737 — "each man's absence can end on its own day").
- A row whose request is gone, a `kept` row and a hand-built row keep `txtSet`.
- **`[REQ-ROW-SELF-CLASH]` goes with it:** times typed on an all-day request's row make the REQUEST timed, so the man is
  no longer flagged against his own row. Pinned by a test; the item leaves with this job.

### 4.5 What a hand does to the one row
One new door, `src/ui/grouprow.ts`, asked by every place that writes a person to a ground row before it writes —
`drag.ts applyDrop`, `view.ts placeArmed`, `Shell.tsx`'s right-click, `store.ts writeSlot` / `writeFill` (reached from
`state/` through one `HOOKS` entry, as the engine's other screen-side doors are). A row is a **shared row** when its
standing request's record carries `grp` (a shared input keeps its group down to one man — reading R3). On it:
- **A real person dropped anywhere on the row — on a puck, on "+ add", on the row — is ADDED to the input** (D734), from
  the crew list or from a seat elsewhere; where he came from he stays (the Unavailable seat's precedent: a data edit, no
  seat vacated — reading R4). `commitGroup({ rows }, draftOf(lead), people + him, undefined, { sched: true })`. Already
  in it: refused — "Tally is already on this input" (D271).
- **One of the input's men taken off — his puck dragged off to nowhere, or removed by right-click — leaves the input**
  (D734): the same call with him left out. The LAST man is not taken off that way: refused, saying how ("Ranger is the
  last person on this input — use ✕ to take it off the programme, or delete it in its own window" — reading R5).
- **One of the input's men dragged from the row onto another place is put there too and stays in the input** until his
  puck is taken off the row (reading R4): the drag is treated as a crew-list drag of that man. Nothing is ever written to
  a member row's `who` by a drag, so a swap can never put a stranger into one man's request.
- **A placeholder (ALL / ALL AVAIL)** dropped on the row always joins the extras of the lead's row (`fillSlot` on its
  "+ add"), never a man's place; it is the row's own (D46), taken off as today.
- **OIL for the man added (D738):** his record takes the answer the input carries — the answer most of its people carry,
  the A-to-Z first where they tie — copied whole; where nobody has answered, none (the question stays with the filer).
  No sheet opens on the schedule. OIL Earn switches him as any man.
- **His late date (D741):** his record's `mod` is the EARLIEST `mod` among the entry's records — he is late only if
  everyone already was; nobody else's record is touched (commitGroup's "a change to the people alone touches nobody
  else" stands).
- **The row's buttons act on every member row in ONE command:** ✕ → `unacceptInput` for each (the whole input reads
  "taken off", D114 / D736); CX (one question, one reason), red box, info-only → set alike on each. Under Personal Inputs,
  Undo / Accept / "→ Unavail" act on every record of the line (`ui/interactions.ts` `data-acc`).
- **A drag of the row moves all its rows together** (`engine/reorder.ts` — a block move, the members landing in order
  straight after the lead; a drop after a one row lands after its LAST member). Auto sort keeps them together (equal
  times, stable).
- **OIL Earn:** the row's own switch (its name cell) switches every member's item in one command; each puck's switch is
  his own record's, as today.
- **The LATE chip** on the one row or the one line is shown when any of its records reads late, and a tap drops or
  restores it for all of them (`state/view.ts toggleLateOff`, per record as today).
- **The dialog** opened from the row or the line is the entry's throughout — the window the Inputs calendar opens (its
  Save `commitGroup`, its Delete `removeEntry`, its OIL line). Why a schedule-opened dialog saved one man (the re-walk's
  picture G5b) is found with a failing test first.
- **A one-man request with no group is untouched by this door** (D734 reading 3, D18, D470).

### 4.6 The LATE mark (D741, D742) — step 3 of the job, for every kind of input
`commitInputEdit(r, draft, keepTail, entryEnd, opts?)` and `commitGroup(…, opts?)` take `{ sched: true }`; with it, and
only for someone who may edit the schedule (`canEditSched()` — a hand-made call by anyone else is an ordinary save),
`r.mod` is NOT moved. `modBy` / `modAt` are still stamped — the card's small print and the history say the scheduler
changed it. `setInpField`, `setInpTitle`, `reassignInput` and the shared row's door are the callers that pass it, and
they are reached only from a row on the schedule (verified by search; a test pins the list). The input's own window —
wherever it was opened from — never passes it (D742 reading 3). Late-ness is `f(mod, the input's date, the cut-off)`,
and no row on the schedule changes an input's dates, so an on-time input stays on time and a late one stays late.
Downchits and upchits are exempt as ever.

### 4.7 OIL when the scheduler changes the HOURS from the schedule — AS BUILT; one point goes back to him (§7, Q1)
Today a typed time under Personal Inputs voids a Yes the new hours no longer price (`engine/oil.ts voidedOil`, the
owner's rule of 28 Aug 26: a changed amount is never silent) and the question opens at once for the scheduler
(`askOilIfPending`, pinned by `oilconfirm.test.tsx:506`). Since §4.4 routes the Ground Programme's boxes through the same
body, **this plan keeps that for every box**, so no box does two things (D740 reading 3) and no existing OIL test moves.
D739's reading 4, told to him as the agent's reading, said the opposite for the new boxes ("no question is asked on the
schedule when the hours change — the answer stays and the amount is worked out from the new hours"). The two cannot both
hold: put to him with a recommendation (§7). **D738 is not touched by this** — a man added takes the input's answer, the
hours unchanged, and no sheet opens. If he chooses "no question", it is ONE function: a schedule-side save re-prices a
positive answer to what the new hours give instead of dropping it, and does not call `askOilIfPending`.

### 4.8 A published day counts the input once (D736)
In `engine/publish.ts`, one new pure step at the end of `dayPendingItemsIn`'s input handling, shared with
`dayDiscardCount`: `foldEntries(items, snap, di)`.
- Each item that belongs to an input (it has `inp` or `val`, or is a lone `input` item) is given a signature: the group
  of its record (`now.grp`, else `was.grp` — the live record and the version's frozen copy, `snap.inp`), the act (add /
  delete / edit / lone filing with its `from → to`), and the shared fields on each side (`sharedKey(was)`, `sharedKey(now)`).
- **Edits fold** wherever the signature is the same: the input re-timed, re-worded or re-named for everyone is one item.
- **Adds fold only when they are the whole input:** every live record of that entry is in the set (none of them was in
  the issued version) — "a shared input filed is one". Otherwise each added man is his own item.
- **Deletes and take-offs fold only when they are the whole input:** every record the issued version held of that entry
  is in the set. Otherwise each man taken off is his own item.
- **The row's own marks fold too:** `change` units on the name box of member rows of one drawn row (a CX, a red box,
  info-only set on all) that are equal once the row's `src` is left out of the compared value are one item.
- The folded item is the first of its set, carrying `mates` (the rest, for the words and the jump) and the people's ids.
  **`dayDelta`, the stored `diff`, the sign-off binding (`pendingKey`) and what goes out are not touched** (D109's "what
  goes out is unchanged"): only the unit a person counts in.
- **The words** (`ui/pendlist.ts pendItemWords` / `pendListHTML`): "Range safety brief · 4 people", the names under it
  A to Z (a new `pl-names` line, as the changes window's `cw-names`), then the lead's own "from → to" without a man's name
  in front; who and when as today; a tap goes to the one row.
- **A man added to a row the issued day already had wears his mark on his puck** — the hollow ALn tag (D93):
  `state/holderbase.ts requestAddMarks` keeps the puck's mark for a new member row whose one row was issued (a row with
  its `srcg` is in the issued day), where today it drops it. A whole new one row wears the mark a new row wears, once, on
  its name (picture 9).
- Counts this gives (each a test, §5): filed for four since the day went out — 1; then one man taken off before it goes
  out — still 1 (three people); issued for four, one man taken off — 1; two men taken off — 2; one added — 1; re-timed —
  1; re-timed and one added — 2; taken off the programme whole — 1; deleted whole — 1; all four taken off one by one —
  1 (the input is gone: D98, the count is the difference from what was issued); a CX on the one row — 1; a shared leave
  filed for four on the Unavailable list — 1 (D736's "a shared input", whatever its kind — reading R6).
- **A small fix that rides with it** (`[CAL-TOGO-ONE-ITEM]`'s "also seen"): after one man left a shared input, "All
  changes" titled the item "2 people" over three names — the title counts the names it lists.

### 4.9 What is deliberately NOT changed
The Unavailable list's rows and its typed boxes' reach (one man's record); `reassignInput`'s OIL question for a new
holder; the input's own window; every engine reader named in §3; the amendment's stored diff and the sign-offs; the
re-make rule; D468 (a request moved to another day arrives as filed). No stored record or row is converted (D56).

## 5. The build order — a failing test first at every step; rulings named in the tests (`npm run rulecheck`)

| # | Step | Files (the main ones) | The tests that fail first |
|---|---|---|---|
| 1 | **The LATE mark from the schedule** (§4.6) | `ui/inputedit.tsx` | A leave, an OD and a Training each typed on from their schedule row after the cut-off stay on time; the same change in the window reads LATE; a late one stays late; a member's hand-made `sched` call still stamps; `reassignInput` after the cut-off (D741, D742) |
| 2 | **A one-man request's boxes write the request** (§4.4) | `ui/reqrow.ts` (new), `ui/textedit.ts`, `ui/board.ts`, `state/store.ts`, `ui/inputedit.tsx` (`setInpTitle`) | Week and board, click and Tab: 10:15 typed on Ranger's Training row → the request, the Inputs calendar and the Personal Inputs line read 10:15, after a reload too; the remark; the name → its title; an unreadable time heals; the row keeps its second man, CX, red box; ONE Undo; a published day reads 1 pending and the issued face keeps the old time; not LATE; a `kept` row and a hand-built row still write the row; `[REQ-ROW-SELF-CLASH]` gone (D739, D740) |
| 3 | **`srcg`, landing beside its own, the placeholder handed on** (§4.1, §4.2) | `engine/inputentry.ts` (new), `engine/overlay.ts`, `engine/grouprows.ts` (new), `engine/schema.ts` | An ordinary request's row and `srcv` unchanged byte for byte; a group's rows carry `srcg` and stand together; a man added later lands after the last of them with their CX / red box / info; nothing below moves on screen; the lead's man deleted — the ALL AVAIL on the row is still there; `groundGroups` (alike → one, a row changed alone → apart, `kept` → apart) |
| 4 | **Drawn as one** (§4.3) | `ui/html.ts`, `ui/board-html.ts`, `ui/peek.ts`, the stylesheets, `ui/interactions.ts` (`leadKeyOf`) | Unit: one row, pucks A to Z each with its own key, one "+ add"; a flagged man's puck flagged (D605); ten people; View-only and an issued face; the peek; Personal Inputs' one line and "1 input"; the Unavailable list still a row a man (D737). Browser (`e2e/`): the row's geometry at phone and desktop on the week and the board — pucks two across / stacked / wrapping, the two times together on a phone, no row taller than its pucks need |
| 5 | **Hands on the one row** (§4.5, §4.4's shared half) | `ui/grouprow.ts` (new), `ui/drag.ts`, `state/view.ts`, `ui/Shell.tsx`, `ui/board.ts`, `ui/interactions.ts`, `engine/reorder.ts`, `ui/oilmode.ts`, `ui/inputedit.tsx` | A puck dropped on → in the input, on the Inputs calendar, one history line, his OIL answer the input's, not LATE (D734, D738, D741); taken off → out of it; the last man refused; already in it refused; dragged to a flying seat → in both; a placeholder → the row's own; 14:30 typed → every record 14:30 (D739); ✕ / CX / red box / info / Undo / Accept for all in one Undo step; the row dragged → its rows together; OIL Earn's row switch and puck switch; the LATE chip for all; the dialog saves the entry; a one-man request's row unchanged (D18, D470) |
| 6 | **The count and its list** (§4.8) | `engine/publish.ts`, `ui/pendlist.ts`, `state/holderbase.ts`, `ui/changesmodel.ts`, the stylesheet | The twelve counts of §4.8, each asserted on the day head, the Amendments box, the window's title, the "To go out" tab and its head, "Discard N edits" and the published amendment's item count (the `amendbatch.test.tsx` "every surface" pattern); the line's words and names; the stored `diff` and the sign-off binding identical with and without the fold; the added man's hollow tag |
| 7 | **The records** — in the same change as the code they describe | `docs/engine-rules.md` (the landing paragraph, §The late-input mark, the pending count's unit), `docs/ui-contracts.md`, `docs/feature-impact.md` ("One input filed for several people": the board, the week and the count leave the "deliberately do NOT" list), `docs/data-schema.md`, `docs/data-model.md`, `docs/file-map.md`, the behaviour register | `npm run docsize`, `npm run rulecheck` |

Steps 1 and 2 stand alone and are the smallest; 3 to 6 are the one row. One branch, one merge (D740, D485).

## 6. The roll-call for the bug check (every place the app draws or counts the thing) — FULL tier
The schedule's row: Edit Schedule's week, View-only Sched, an issued face (ORIG and an AL), the 👁 look at an older
version, the next-week peek, the Scheduler Board (live, read-only, OIL Earn), a saved plan switched in, a day template
(`engine/daytpl.ts` strips `src`), the print and the CSV export. Personal Inputs (week, board, folded). The Unavailable
list (must NOT change). The count: the day head, the board's head, the ⓘ panel, the Amendments box, the changes window
(title, three tabs, the week view), the sign-off line, "Discard N edits", the plan-switch message, the publish message,
the published amendment's line. The marks: the row's name, each puck, History's gold dots. OIL: the green bar, OIL Earn's
switches, the ALL AVAIL window, the OIL tracker's credit after a publish. The input's own places: the Inputs calendar's
bar and day card, the List, the window. The warnings list and its click. Undo and Redo of every hand in §4.5. A reload
after each. A phone and a desktop; his PC's 125% display. Each approved picture set beside the built screen at the same
size (D743 (11)). The walk is sized before it starts (`docs/walk-ledger.md`); two code readers (published records, OIL).

## 7. For him — one question, and the readings he is told

**Q1 (his — OIL; recommended: keep it as the app does today).** *A member's Saturday duty is 2 hours and he said Yes to
OIL — a half day. On the schedule you type new times that make it 8 hours — a full day. Today, when you do that under
Personal Inputs, the OIL question opens for you at once, because the amount changed. Should the Ground Programme row do
the same (recommended — one behaviour everywhere, and a changed amount is never silent), or should the Yes simply become
a full day with no question, as I told you with D739?* Until he answers, the build keeps today's behaviour (§4.7).

**Readings, told to him in the closing report — each the agent's, each his to overrule:**
- **R1** A name typed on a request's row becomes the input's own title, in the letters typed (D742's rule applied to the
  name box).
- **R2** Typing one time on a request's row fills the other end, and clearing a time makes the request all day — the
  manners the Personal Inputs boxes have had since 10 Aug 26.
- **R3** A shared input stays a shared input down to its last man: a puck dropped on its row still joins the input.
- **R4** A man dropped on the one row from a seat elsewhere stays in that seat too; a man dragged from the one row onto
  another place is put there and stays in the input until his puck is taken off the row. Taking a man out of an input is
  always its own gesture.
- **R5** The last man cannot be dragged off; the sentence says to use ✕ or the input's window.
- **R6** A shared leave or overseas duty filed for several on a published day is one change waiting too (D736's words
  name no kind); the Unavailable list still draws a row a man.
- **R7** On the Unavailable list a typed box changes that one man's record, as today — he then reads as his own input.
- **R8** Rows saved before this build are drawn a row a man until their request next changes (demo data, D56).
- **R9** On a day not yet published, a time typed on a request's row no longer leaves a change mark on that box: the
  change is the input's, and the changes window lists it under the input.
- **Found, not built — his to place:** nobody is told when someone else changes his input (no bell). Filed as a question
  in `OUTSTANDING.md` with this job.

## 8. The reads of this plan
*(Filled when Astra and Sol 6.1 have each read it: what each found, what was done.)*
