# The schedule's one row for a shared input — the plan (`[GROUP-INPUT-ONE-ROW]`; D661, D662, D734–D743 — 10 Oct 26)

**Status: VERSION 2 (11 Oct 26). Version 1 was read by Astra and by Sol 6.1, each blind — both `NOT CLEAN`, twenty-two
findings between them, none reopening a ruling or a picture; §8 says what each found and what this version does about
it. NOT built.** Branch `claude/group-input-one-row`, cut from `main` at `8d8caff6`. Builder: Opus 5.5. The design note:
`docs/superpowers/specs/2026-10-10-group-input-one-row.md`; the approved pictures (D743, the design of record):
`docs/mock/group-input-one-row.html`, images under `docs/mock/img/group-input-one-row/`.

## 1. What he ruled

Open a full row before leaning on its detail: `grep -h '^| D736 |' .claude/decisions-full/*.md`.

- **D661, D662** — on the schedule a shared input is ONE row holding everyone; its own job.
- **D734** — on that row the pucks ARE the input's people: a puck taken off takes the man out of the input, a puck put on
  adds him — "the same as doing it in the input's own window". A one-man request's row is unchanged (D18, D470).
- **D735** — one row, one time; the row never splits or joins by itself.
- **D736** — on a published day a shared input filed, taken off the programme or re-timed is ONE change waiting, one line
  naming its people; one man taken off or added is one each. Every count agrees.
- **D737** — on the Unavailable list it stays a row a man; that list is left as it is.
- **D738** — a man added by a drag onto the row takes the OIL answer the input already carries — the one whoever filed it
  gave last (its reading 1); no question on the schedule.
- **D739, D740** — a time or a remark the scheduler types on a request's row — shared or one-man — changes the request
  itself; what was filed is kept only in the change history, with the scheduler's name. **Their reading 4, recorded and
  told to him: no OIL question is asked on the schedule when the hours change — the answer stays and the amount is worked
  out from the new hours.**
- **D741, D742** — for every kind of input, no change made from its row on the schedule makes an input that was on time
  read LATE — a man added that way is not marked late either; a change in the input's own window still does; an input
  already LATE stays LATE.
- **D743** — the ten pictures are approved as drawn.

Rulings that bound it: **D109, D113, D114, D174, D176, D178, D103, D45, D98** (what a published day counts, and that
nothing on it changes unseen), **D663** (the changes window's one item), **D660, D682, D711, D731 (4)** (a shared input's
OIL answers), **D18, D46, D470, D468, D271, D278** (who stands on a request's row and what is the row's own), **D605** (a man
on leave is flagged where he is seated), **D715–D717** (an input's own title; rules read the KIND), **D450** (a day is saved
only by its holder), **D56, D401** (stored demo data is not converted), **D200** (permissions: one module), **D473** (the
table list is kept true), **D29** (a code change never trims a document), the 9 Aug 26 late-mark rules, the 28 Aug 26
rule that a changed OIL amount is asked again (narrowed here — §4.7), and the 10 Aug 26 "nothing on the board re-orders
itself".

## 2. The app today (read 10 Oct 26 on this branch — both readers verified it, with the corrections of §8)

- **A shared input is one record a man** tied by `grp` / `grpBy`; an ENTRY is the live records sharing `grp` AND the
  shared fields, worked out on read (`state/inputgroup.ts` `SHARED_FIELDS`, `sharedKey`, `entriesOf`, `entryRowsOf`). The
  one writer is `ui/inputedit.tsx commitGroup(entry, draft, people, oilDec)` (:1616); `removeEntry` (:1551) deletes all.
- **A request's row is a real ground row worked out on read.** After every command and at every load
  `state/holderbase.ts rederive()` copies the holder's stored week and runs `engine/overlay.ts viewOfWeek`:
  `reconcileRequestRows` (a row whose request is gone or cannot stand goes; a row whose request changed — `srcv` differs —
  is re-made in place by `Object.assign(row, requestRowFields(r))`, keeping its id, place, `more`, `cx`, `cxr`, `flag`,
  `info`, and a name box that holds someone other than the request's man) and `landRequests` (a request with no row lands
  on its START day: `{prog, str, end, who, rmks, srcType, src, srcv, rid: 'r'+iid}`, pushed at the end). **One request,
  one row** — so a group of four is four rows (`overlay.ts:316-344`). A scheduler's Accept builds the same row
  (`engine/slots.ts acceptInput`).
- **A scheduler's typing on that row writes the ROW, not the request:** the week's `data-txt="gr:di.ri.{prog|str|end|rmks}"`
  (`ui/textedit.ts routeFocusOut` → `txtSet`) and the board's `data-bfld` (`ui/board.ts` → `txtSet`); `state/store.ts
  writeText` and the developer's probe bridge (`src/probe-bridge.ts`) reach `txtSet` too. It lasts until the request next
  changes, when the re-make overwrites it (`[REQ-ROW-OWN-BOXES]`).
- **Typing under Personal Inputs or on the Unavailable list already writes the input:** `data-inp` / `data-ifld` →
  `inputedit.tsx setInpField` (:1475) → `commitInputEdit` (:1025), which stamps `r.mod = nowStamp()` on EVERY save (:1140)
  — and `engine/inputs.ts isLateInput` reads `mod`, the input's date and its kind (:934). So today that typing can turn an
  on-time input LATE. It also drops a Yes the new hours no longer price (`engine/oil.ts voidedOil`) and opens the OIL
  question for the scheduler at once (`askOilIfPending`, pinned by `oilconfirm.test.tsx:506`). `reassignInput` (:1357 — a
  different man dropped on an Unavailable row) goes through the same save. On a shared input, `setInpField` changes ONE
  man's record, which then no longer matches its entry and reads as his own input.
- **Pucks on a ground row:** `who` (the name box) and `more[]` (extras), written by `engine/slots.ts setSlotVal` /
  `fillSlot` from `ui/drag.ts applyDrop` (:323-379), `state/view.ts placeArmed` (:1205), the right-click remove
  (`ui/Shell.tsx:229`), `state/store.ts writeSlot` / `writeFill`, and the probe bridge. None touches an input. The
  Unavailable seat has its own door (`data-inpseat` → `reassignInput`), a data edit that vacates no seat (`drag.ts:210-231`).
- **The row's buttons** (board only — `ui/board-html.ts sbRowCtl`): ✕ `grdel` → `slots.ts unacceptInput` (row spliced, the
  request reads 'r'); CX `grcx`; red box `grflag`; info-only `grinfo` (`ui/board.ts:1066-1106`).
- **A published day counts one item per INPUT** (`engine/publish.ts dayPendingItemsIn` :211 — the `byId` loop pairs a
  request's filing with its row's add or delete, D114, and folds its details and re-landed row into it, D178). A group of
  four is therefore four items. The day head, `ui/ALPanel.tsx`, the changes window's title and "To go out" tab, the
  sign-off line and the stored amendment's `units` read that body. **"Discard N edits" does not:** `dayDiscardCount`
  counts what a load of the issued version would really put back (`engine/drafts.ts dayAsLoadLeaves`), in the same unit.
  On a day that earns OIL, a change that moves what the day earns is one more item ("what this day earns"), folded into
  an input's own item only when that input's details are what moved it. The list is `ui/pendlist.ts pendListHTML`; "All
  changes" already folds a group filing (`ui/changesmodel.ts mergeFiled`, D663).
- **OIL reads each man's own record:** the schedule half skips every `src` row (`engine/oil.ts:324`); the request half
  credits the holder from his record's hours and answer (`engine/oilev.ts projectOilInputs`), the row giving only
  standing (`standsOn`); anyone else on the row — a man the scheduler put there, the men behind a placeholder — earns
  through that row's request (`landedExtras`, D18, D46, D470), and a switch is keyed `<person>|i:<that request's id>`
  (`ui/oilmode.ts toggleOilPerson`). In OIL Earn a named request's own name is not a switch; its pucks are
  (`oilItemCellHTML`).
- **Nobody is told** when someone else changes his input: the change history line and the card's small print are the only
  traces (the bell has four sources, none of them this — `ui/topbits.tsx bellOn`).

## 3. The bet — attack it

**The shared input stays one record a man AND one ground row a man. The ONE row is made where a person meets it: where
it is DRAWN, where a hand WRITES to it, and where a published day COUNTS it.** The warnings, the events, crew rest, each
man's OIL claim and its evidence, the amendment's stored diff, the sign-off binding, the day's saved shape and the Leave
War go on reading one man's record and one man's row.

Why this and not one real row holding several requests: such a row would have to teach every reader of `row.src` that a
row has several requests — `standsOn` and its callers, the landing, the holder base's `acc`, OIL's item keys and evidence
(a puck's switch is keyed by ITS request; with one row the key would move whenever the first man left), the filing axis,
the issued snapshot — and a miss there is SILENT (an OIL credit, a count). Drawn-as-one keeps a miss VISIBLE: a row drawn
twice, a button that changed one man.

**Where the bet does not hold, and what this plan does there** (both readers, §8): a PLACEHOLDER on the one row earns
through ONE member's request, so it cannot be handed to another member without moving every decision made about it. It
is therefore NOT handed on: it leaves with the member whose row carries it, and the app says so (§4.5, R10).

What the bet costs, and where each cost is paid: the rows of one entry must be known as one entry and kept alike (§4.1,
§4.2), every hand that writes to the one row must write to the input or to all its rows — held by a belt in the engine,
not only at the screen's doors (§4.4, §4.5) — and the count must fold them (§4.8).

## 4. The design

### 4.1 Which rows are one row — the entry's own identity, frozen on the row
`sharedKey` / `SHARED_FIELDS` move, unchanged, from `state/inputgroup.ts` to a new `src/engine/inputentry.ts` (the engine
may not import `state/`) and are re-exported from where they were. Beside them, **`entryIdOf(rec)`**: `''` for a record
with no `grp` (or a medical kind or an upchit — never a group, as `entriesOf` holds), else `grp + '~' +` a short hash of
`sharedKey(rec)` — the SAME normalised shared fields `entriesOf` groups by, so the schedule and the Inputs pages cannot
disagree about who is in one entry.

`srcg` is a seventh thing a request writes on its row: `requestRowFields(inp)` (`engine/overlay.ts:165`) adds
`srcg: entryIdOf(inp)` only where it is non-empty; `srcvOf` appends `'|g:' + srcg` only then. So an ordinary request's
row and its `srcv` are byte for byte what they were (no ordinary row is re-made by this build), and a grouped record's
row is re-made whenever ANY shared field moves — a date or a half that the row does not show included. `srcg` is not
canonical (`restore.ts dayKeys` does not name it): it adds no content unit, moves no published diff and no sign-off
binding. It does move the two cache signatures that must notice it — the holder base's `sigOf` (the whole day) and
`requestsSig` (through `srcv`). An issued day keeps the `srcg` it went out with. `engine/schema.ts GroundRow`,
`docs/data-schema.md`, `docs/data-model.md` gain the field (D473).

A new pure module `src/engine/grouprows.ts` — **`groundGroups(day)`**: the day's ground rows that are drawn as one. Two
rows are the same one row when both carry `src`, neither is `kept`, they carry the same non-empty `srcg`, and the marks
only a scheduler makes are alike: `cx`, `cxr`, `flag`, `info`. Returns, per row index, `{ lead, members[] }`; the LEAD is
the first member in the day's own display order (`engine/order.ts groundOrder(rows, gman)`), so the one row stands where
its first row stands. **Read off the ROW, never the live input** (the `rowKindTag` precedent): an issued face, the
next-week peek and another week's read need no input lookup, and rows that are not alike are honestly drawn apart.

### 4.2 Kept as the entry's rows — in the view, never by a write to the day (D450)
One helper in `engine/overlay.ts`, **`placeRequestRow(day, row)`**, used by BOTH doors that put a request's row on a
day — `landRequests` and `slots.ts acceptInput`: where the day already holds a standing row with the same non-empty
`srcg` (the person is NOT part of the match), the new row is inserted straight after the LAST of them and takes that
row's `cx`, `cxr`, `flag` and `info`; otherwise it goes where it goes today. Rows below it move one index; nothing on
screen moves, and marks are keyed by `rid`. Everything else about landing — the start day, the published-day rule
(`overlay.ts:336-339`), oldest first — is unchanged.

**A grouped row's name box is its own man's.** `reconcileRequestRows`: for a row whose request carries a non-empty
entry id, the keep-the-scheduler's-man branch (`overlay.ts:290-292`) does not apply — `who` is the request's person. A
placeholder or a scheduler's man that stood in the name box when the request BECAME part of a group (a one-man request
with ALL AVAIL in its name box, then a second man added in the input's window) is moved to that same row's `more`, never
dropped — unless he is himself one of the entry's people, whose own row lands (D271). The row, its request and so its
OIL item are the same, so no decision about him moves.

**A transient place does not survive a row moving under it.** After the view is installed (`state/holderbase.ts
rederive`), an armed place whose row is no longer the row it was armed on (its `rid` at that index changed) is put down
(`state/view.ts disarmSlot`) — the next tap on a name must never plant into another row. (A row taken away above an armed
place has the same gap today.)

A member row whose own request changed alone gets a different `srcg` and is drawn apart, as the entry rule already reads
its record apart.

### 4.3 Drawn as one (D661, D743)
One helper decides the people of a drawn row, read by every builder: for a group, each member row's `who` in A-to-Z order
of callsign (D727's order), then each member row's `more` in member order; every puck keeps ITS OWN row's key
(`g:di.ri`, `g:di.ri.xN`), so its flag, its amendment mark, its OIL bar and switch and a tap on it are that man's row's,
as today. The one "+ add" place carries the lead's key.
- **The week** (`ui/html.ts`, the ground loop :1947 — Edit Schedule, View-only Sched, an issued face): a non-lead member
  emits nothing; the lead emits one `plRow` with those pucks; `one` only when a single puck. The LATE tag, the kind under
  a title (D717) and the row classes are the lead's. On a phone the row's two times stay together at its top
  (`scheduler/09-week-responsive.css` — the approved picture 2).
- **The board** (`ui/board-html.ts sbGroundPanel` :592): the same; one name box, one pair of time boxes, one remark box,
  one set of row buttons, one grip. In OIL Earn each member's pucks are drawn with that member's own item
  (`oilRow(groundItemKey(member))` before its seats); the row's name is what a named request's name is today — not a
  switch.
- **The next-week peek** (`ui/peek.ts` :220): the same helper. The CSV export and the print list no ground rows (both
  readers) and are not changed.
- **A saved day template** (`engine/daytpl.ts mintBlob`) takes ONE row for each drawn row — the lead's, with its people
  cleared as today — and strips `srcg` with `src` and `srcv`.
- **Personal Inputs** (the week's `inGrp` when it is that panel, `html.ts:1987`; the board's `sbInputsGroupPanel` /
  `sbInpRow`): the day's activity inputs are grouped by `entriesOf`, and — split by filing state, so a line never claims
  what is true of only some — an entry of several is ONE line: every man's puck (display only, as today), the title, the
  kind, the times and the remark of the entry, one Undo / Accept. The folded line counts entries ("1 input · 1 on
  programme"). On a desktop the panel's People column is two pucks wide, as the Ground Programme's (picture 5).
  **The Unavailable list is untouched: a row a man (D737).**
- A jump to a row that is not drawn (the changes window's tap, History's gold dot, a warning's click) lands on its lead:
  one resolver `leadKeyOf(key)` beside the jump (`ui/interactions.ts jumpToChange`, `ui/ChangesWindow.tsx:60,68`).
- **Stored rows from before this build carry no `srcg` and are drawn a row a man until their request next changes** (D56).

### 4.4 What a typed box changes (D739, D740, D742) — for every request row
A new door `src/ui/reqrow.ts reqRowText(path, text)`, asked FIRST by every caller of `txtSet` for a typed box — the
week's `routeFocusOut` (`ui/textedit.ts:100`), the board's `boardChange` (`ui/board.ts:1203`), `state/store.ts writeText`
and the probe bridge's text writer. It gives one of THREE answers — `'none'` (not a request's box: the caller goes on
exactly as today), `'saved'`, `'refused'` (the box heals; the caller never falls through to `txtSet`). It is a request's
box when the path is `gr:di.ri.{prog|str|end|rmks}` of a row that IS its request's standing row
(`standsOn(DAYS[di], row.src) === row`, not `kept`, the request not read-only and not taken off). Then nothing is written
to the row:
- `str`, `end`, `rmks` → `setInpField(inp, field, text, { sched: true })` — the body the Personal Inputs box already uses,
  with its manners: an unreadable time is refused and the box heals; a time typed alone defaults the other end; a time
  CLEARED makes the request all day.
- `prog` → a new `setInpTitle(inp, text, { sched: true })`: through `titleOf` (the one normaliser — 40 characters; a name
  equal to the kind's own name is no title), so a name typed on the row becomes the input's own title, as typed. A box
  left as it reads writes nothing.
- The row is then re-made on read by the rule that exists (`srcv` moved): its id, place, `more`, CX, red box and
  info-only kept (D468, D46). One input command, one Undo step, one history line in the scheduler's name with the old
  value in its "from" (`state/changelines.ts inputLines` — unchanged). The caret-safe repaint and the heal are the
  `data-inp` branch's own (`txtCommit` / `heal`).
- **A shared input:** `setInpField` / `setInpTitle` write the WHOLE ENTRY when the input is one the schedule draws as
  one line — an activity kind not filed under Unavailable (`isPersonal(type) && acc !== 'u'`) whose entry holds more than
  one record: `commitGroup({ rows }, draft, the same people, undefined, { sched: true })`. On the Unavailable list a typed
  box changes that man's record alone, as built (D737).
- **The belt in the engine** (`engine/slots.ts txtSet`, the `gr` branch): a direct write to `prog`, `str`, `end` or `rmks`
  of a standing request's row is refused (returns false, no mark, nothing written) — those four are the request's now.
  The row's own fields (`cx`, `flag`, `info`), a `kept` row, a row whose request is gone or taken off and a hand-built
  row are untouched. The view writes rows through `Object.assign`, not `txtSet`, so the derivation is not caught. Tests
  that typed on a request's row through raw `txtSet` and expected the row alone to change are rewritten to the ruling
  (D739, D740), each named in the change.
- **`[REQ-ROW-SELF-CLASH]` goes with it:** times typed on an all-day request's row make the REQUEST timed, so the man is
  no longer flagged against his own row. Pinned by a test; the item leaves with this job.

### 4.5 What a hand does to the one row
One new door, `src/ui/grouprow.ts`, asked by every place that writes a person to a ground row before it writes —
`drag.ts applyDrop`, `view.ts placeArmed`, `Shell.tsx`'s right-click, `store.ts writeSlot` / `writeFill`, the probe
bridge's writers (reached from `state/` through one `HOOKS` entry). A row is a **shared row** when it carries a
non-empty `srcg` (a shared input keeps its group down to one man — reading R3). Its puck is **one of the input's men**
when it is a member row's `who` and that row's request is his; anything in `more` is the row's own.
- **A real person dropped anywhere on the row — on a puck, on "+ add", on the row — is ADDED to the input** (D734), from
  the crew list or from a seat elsewhere; a seat he came from keeps him (the Unavailable seat's precedent — a data edit to
  the input, no seat vacated; reading R4). Already in it: refused — "Tally is already on this input" (D271).
- **One of the input's men taken off the row leaves the input** (D734): dragged off to nowhere, removed by right-click —
  or **dragged onto another place, where he is put in the same ONE command**: `writeInputsBatch(() => { his record
  dropped; the place written })`, so one Undo puts back both, a refused place leaves him in the input, and a man already
  standing on that place comes off it as when a name from the crew list is dropped on him — nobody is ever swapped INTO
  the request. (The scheduler's store is enlisted in every input command — `state/sched-commit.ts commitInputsWith` — and
  the place must be written INSIDE the command, which re-reads its baseline as it opens. A failing test proves the one
  step first; if the command layer will not carry both, the build STOPS and reports — it does not fall back to a copy.)
- **The LAST man is not taken off that way** — as the input's own window will not save an input with nobody in it, which
  is the measure D734 names. Refused, saying how: "Ranger is the last person on this input — use ✕ to take it off the
  programme, or delete it in its own window" (reading R5).
- **A placeholder (ALL / ALL AVAIL)** dropped on the row always joins the extras of the LEAD's row (`fillSlot` on its
  "+ add"), never a man's place; it is the row's own (D46) and is taken off as today. **It leaves with that member** if
  he leaves the input — its OIL stands on his request, and so do the decisions made about the men behind it; handing it
  to another member would silently drop them (both readers). When it happens the app SAYS so, once, to whoever did it
  ("ALL AVAIL came off Range safety brief with Ranger — drop it on the row again if it still applies": the door's own
  toast, and `rederive({ live })`'s for a removal made in the input's window), and on a published day it is its own
  change waiting. Reading R10.
- **OIL for the man added (D738) — the filer's last answer, kept on the input.** A new field on each record of a group,
  **`oilAll`**: the last answer given FOR THE ENTRY — written by `commitGroup` whenever whoever may change the input for
  everyone answers its OIL question (a new group filing; its `forAll` path; its answer-only path), the same on every
  record, copied to every man added later. A man answering for HIMSELF (`saveOwnOil`, `reviseOil`) never touches it.
  When the entry's hours change it follows the records' own answers: dropped by `voidedOil`'s rule in the window,
  re-priced on the schedule (§4.7). The man the schedule adds gets `oil = { ...oilAll }` and the same `oilAll`, written
  inside the one command beside `commitNewInput` — NOT through `commitGroup`'s `oilDec`, whose `forAll` path would
  overwrite the others' own answers. No `oilAll` (nobody has answered for the entry): he has no answer, and the question
  stays where it is (D738 reading 2). Not a shared field (`sharedKey` does not read it), not in `inpDetailKey`.
  `state/perms.ts`'s check on what a member's command changed holds `oilAll` as it holds `oil` (well-formed, written only
  by someone who may change the entry); `engine/schema.ts`, `docs/data-schema.md`, `docs/data-model.md` gain it (D473).
  No sheet opens on the schedule. OIL Earn switches him as any man.
- **His late date (D741):** his record's `mod` is the EARLIER of today and his input's own deadline
  (`inputOwnDueISO`) — he can never read late for having been added from the schedule; the row still shows LATE where
  its other records are late. Who placed him and when (`by`, `at`) are true. Nobody else's record is touched.
- **The row's buttons act on every member row in ONE command:** ✕ → `unacceptInput` for each (the whole input reads
  "taken off", D114 / D736); CX (one question, one reason), red box, info-only → set alike on each. Under Personal Inputs,
  Undo / Accept / "→ Unavail" act on every record of the line (`ui/interactions.ts` `data-acc`).
- **A drag of the row moves all its rows together** (`engine/reorder.ts` — a block move, the members landing in order
  straight after the lead; a drop after a one row lands after its LAST member). Auto sort keeps them together (equal
  times, a stable sort).
- **The LATE chip** on the one row or the one line is shown when any of its records reads late, and a tap drops or
  restores it for all of them (`state/view.ts toggleLateOff`, per record as today).
- **The dialog** opened from the row or the line is the entry's throughout — the window the Inputs calendar opens (its
  Save `commitGroup`, its Delete `removeEntry`, its OIL line). Why a schedule-opened dialog saved one man (the re-walk's
  picture G5b) is found with a failing test first.
- **The belt in the engine** (`engine/slots.ts`): `setSlotVal` refuses a write to the `who` of a standing row that
  carries `srcg`, and `fillSlot` refuses a REAL person on such a row's "+ add" (a placeholder is let through to `more`) —
  both above the mark, as `sentinelSeatOK` sits. So no door this plan forgot, and no later one, can leave a stranger in
  one man's request or a member's name box empty.
- **A one-man request with no group is untouched by this door and this belt** (D734 reading 3, D18, D470).

### 4.6 The LATE mark (D741, D742) — for every kind of input
`commitInputEdit(r, draft, keepTail, entryEnd, opts?)` and `commitGroup(…, opts?)` take `{ sched: true }`; with it, and
only for someone who may edit the schedule (`canEditSched()` — a hand-made call by anyone else is an ordinary save),
`r.mod` is NOT moved. `modBy` / `modAt` are still stamped — the card's small print and the history say the scheduler
changed it. `setInpField`, `setInpTitle`, `reassignInput` and the shared row's door are the callers that pass it, and
they are reached only from a row on the schedule (verified by search; a test pins the list). The input's own window —
wherever it was opened from — never passes it (D742 reading 3). Late-ness is `f(mod, the input's date and kind, the
cut-off)`, and no row on the schedule changes an input's dates or kind, so an on-time input stays on time and a late one
stays late. Downchits and upchits are exempt as ever.

### 4.7 OIL when the scheduler changes the HOURS from the schedule — the answer stays, the amount follows (D739 (4), D740 (4))
Version 1 kept today's behaviour and put the point back to him as "Q1"; **both readers hold that the record already
answers it, and it does.** For a save made from a row on the schedule (`{ sched: true }`, a scheduler):
- a No stays No, an unanswered day stays unanswered, and **a Yes stays a Yes at what the new hours give**
  (`inputOilAmt` of the new hours; hours that price nothing leave that day unanswered) — one new function beside
  `voidedOil`, `repricedOil(before, after)`, applied to `oil` and to `oilAll` alike;
- `askOilIfPending` is not called: no sheet opens on the schedule.
This holds for every typed box that goes through `setInpField` — the Ground Programme's row, the Personal Inputs line
and the Unavailable list's row (an overseas duty) — so no box does two things (D740 (3)). **It narrows the 28 Aug 26
rule** ("a positive answer the new hours no longer price is dropped, and asked again") **to a change made in the input's
own window**, where it stands whole, and replaces the 22 Sep 26 "the question follows an in-place edit"
(`oilconfirm.test.tsx:506` is rewritten to the ruling). Why that is safe: only a published day earns (D2), and on a
published day the change reads pending with "what the day earns changes with it" (D45); OIL Earn shows the new amount.
**NOT touched:** `reassignInput` — a new holder has not answered and is asked at once, as built (both readers); the
scheduler's own refusals on the day; the input's own window.

### 4.8 A published day counts the input once (D736)
**The rule the count follows: the one row counts exactly what a one-man request's row counts for the same act — never
that, times its people.** In `engine/publish.ts`, one pure step, `foldEntries(items, ctx)`, applied at the end of
`dayPendingItemsIn`.
- **Which items belong to an entry.** An item of an input (it has `inp` or `val`, or is a lone `input` item) is its
  record's — the live record, else the version's frozen copy (`snap.inp`) — by `entryIdOf`. A structural unit of a
  request's row with NO input beside it (the row added or removed while its filing and details stand — a whole input
  taken off one published day and accepted onto another) is its ROW's — the issued day's row for a removal, the live
  day's for an addition — by `srcg`. A `change` unit on a member row's name box (a CX, a red box, info-only) is its row's
  the same way.
- **What folds.** Items of one entry with the same act — the same kind, the same filing `from → to`, the same shared
  fields on each side (so a re-time is compared as a re-time), and for a name-box unit the same value once the row's
  `src` is left out.
- **Edits and the row's own marks fold** wherever that is the same.
- **Adds fold only when they are the whole input** on this day: every live record of that entry covering the day is in
  the set. **Removals and take-offs fold only when they are the whole input:** every record the issued version held of
  that entry is in the set. Otherwise each man is his own item ("one man taken off or added is one each").
- The folded item is the first of its set, carrying `mates` (the rest, for the words and the jump) and the people's ids.
  **`dayDelta`, the stored `diff`, the sign-off binding (`pendingKey`) and what goes out are not touched** (D109): only
  the unit a person counts in. `frozenInputMatch`'s content-first pairing runs before it, unchanged.
- **"What this day earns" stays its own item on a day that earns**, exactly where a one-man request's row leaves it
  today (a CX or a take-off on a Saturday reads the act and "what this day earns" — two — for one man now, and for the
  one row). Folding it into the act is not this job (Sol 3, §8).
- **"Discard N edits" shares the fold, not the number** (`dayDiscardCount`): the same `foldEntries` over what a load of
  the issued version would really put back. A whole one row taken off since is ONE edit discarded; a re-time made on the
  schedule is none (the load re-makes the row from the live request) while it is one change waiting.
- **The words** (`ui/pendlist.ts pendItemWords` / `pendListHTML`): "Range safety brief · 4 people", the names under it
  A to Z (a new `pl-names` line, as the changes window's `cw-names`), then the lead's own "from → to" without a man's name
  in front; who and when as today; a tap goes to the one row.
- **A man added to a row the issued day already had wears his mark on his puck** — the hollow ALn tag (D93):
  `state/holderbase.ts requestAddMarks` keeps the puck's mark for a new member row whose one row was issued (a row with
  its `srcg` is in the issued day), where today it drops it. A whole new one row wears the mark a new row wears, once, on
  its name (picture 9).
- **The counts, each a test, on a day that earns no OIL** (and again on a Saturday, where each reads one more only where
  a one-man request's row would): filed for four since the day went out — 1; then one man taken off before it goes out —
  still 1 (three people); issued for four, one man taken off — 1; two men taken off — 2; one added — 1; re-timed — 1;
  re-timed and one added — 2; taken off the programme whole — 1; deleted whole — 1; all four taken off one by one — 1 (the
  input is gone: D98, the count is the difference from what was issued); a CX on the one row — 1; a shared leave filed
  for four on the Unavailable list — 1 (R6); the whole input moved from one published day to another — 1 on each; a man
  who carried an ALL AVAIL taken off — 2 (he, and the placeholder: R10).
- **A small fix that rides with it** (`[CAL-TOGO-ONE-ITEM]`'s "also seen"): after one man left a shared input, "All
  changes" titled the item "2 people" over three names — the title counts the names it lists.

### 4.9 What is deliberately NOT changed
The Unavailable list's rows and its typed boxes' reach (one man's record); `reassignInput`'s OIL question for a new
holder; the input's own window and its OIL question; each man's OIL claim, evidence, item key and switch; the amendment's
stored diff and the sign-offs; the re-make rule; D468 (a request moved to another day arrives as filed); OIL Earn's rule
that a named request's name is not a switch. No stored record or row is converted (D56).

## 5. The build order — a failing test first at every step; rulings named in the tests (`npm run rulecheck`)

| # | Step | Files (the main ones) | The tests that fail first |
|---|---|---|---|
| 1 | **The LATE mark and the OIL amount, from the schedule** (§4.6, §4.7) | `ui/inputedit.tsx`, `engine/oil.ts` | A leave, an OD and a Training each typed on from their schedule row after the cut-off stay on time; the same change in the window reads LATE; a late one stays late; a member's hand-made `sched` call still stamps; `reassignInput` after the cut-off. A Saturday duty's Yes for a half day, its hours typed to eight on the schedule: Yes for a full day, no sheet; a No stays No; unanswered stays; the same change in the window drops the answer and asks; `reassignInput` still asks (D739 (4), D741, D742) |
| 2 | **A request's boxes write the request** (§4.4) | `ui/reqrow.ts` (new), `ui/textedit.ts`, `ui/board.ts`, `state/store.ts`, `src/probe-bridge.ts`, `engine/slots.ts`, `ui/inputedit.tsx` (`setInpTitle`) | Week and board, click and Tab: 10:15 typed on Ranger's Training row → the request, the Inputs calendar and the Personal Inputs line read 10:15, after a reload too; the remark; the name → its title; an unreadable time heals and never reaches the row; the row keeps its second man, CX, red box; ONE Undo; a published day reads 1 pending and the issued face keeps the old time; not LATE; a raw `txtSet` on the row is refused; a `kept` row, a taken-off request's row and a hand-built row still write the row; `[REQ-ROW-SELF-CLASH]` gone (D739, D740) |
| 3 | **The entry on the row** (§4.1, §4.2) | `engine/inputentry.ts` (new), `engine/overlay.ts`, `engine/slots.ts` (`acceptInput`), `engine/grouprows.ts` (new), `engine/schema.ts`, `state/holderbase.ts`, `state/view.ts`, `engine/daytpl.ts` | An ordinary request's row and `srcv` unchanged byte for byte; a group's rows carry one `srcg` and stand together; two entries of one group with the same title and times but different end dates are TWO rows; a man added later lands after the last of them with their CX and its reason, red box, info-only — by landing AND by Accept, with rows below, before and after a reload; a one-man request with ALL AVAIL in its name box made a group: its man is in the name box, ALL AVAIL in the extras, its switches unmoved; an armed place below is put down when a row lands above it; a template saved from a one row has one row; `groundGroups` |
| 4 | **Drawn as one** (§4.3) | `ui/html.ts`, `ui/board-html.ts`, `ui/peek.ts`, the stylesheets, `ui/interactions.ts` (`leadKeyOf`) | Unit: one row, pucks A to Z each with its own key, one "+ add"; a flagged man's puck flagged (D605); ten people; View-only and an issued face; the peek; Personal Inputs' one line and "1 input"; the Unavailable list still a row a man (D737). Browser (`e2e/`): the row's geometry at phone and desktop on the week and the board — pucks two across / stacked / wrapping, the two times together on a phone |
| 5 | **Hands on the one row** (§4.5, §4.4's shared half) | `ui/grouprow.ts` (new), `ui/drag.ts`, `state/view.ts`, `ui/Shell.tsx`, `ui/board.ts`, `ui/interactions.ts`, `engine/reorder.ts`, `engine/slots.ts`, `ui/inputedit.tsx`, `state/perms.ts`, `src/probe-bridge.ts` | A puck dropped on → in the input, on the Inputs calendar, one history line, not LATE whether the input was late or not, his OIL answer the filer's last one — with three men having since said No for themselves, on a tie, with the filer not among the people, with nobody having answered (D734, D738, D741); taken off → out of it; dragged to a flying seat → out of the input and in the seat, ONE Undo, a refused seat leaves him in; the last man refused; already in it refused; from a seat → added, the seat kept; a placeholder → the row's own, and gone with its member, said; 14:30 typed → every record 14:30 (D739); ✕ / CX / red box / info / Undo / Accept for all in one Undo step; the row dragged → its rows together; each puck's OIL switch his own; the LATE chip for all; the dialog saves the entry; raw `setSlotVal` / `fillSlot` on a member row refused; a one-man request's row unchanged (D18, D470) |
| 6 | **The count and its list** (§4.8) | `engine/publish.ts`, `ui/pendlist.ts`, `state/holderbase.ts`, `ui/changesmodel.ts`, the stylesheet | The counts of §4.8, each asserted on the day head, the Amendments box, the window's title, the "To go out" tab and its head and the published amendment's item count; "Discard N edits" asserted APART (a re-time: 1 waiting, 0 discarded; a whole take-off: 1 and 1); the same on a Saturday beside a one-man request's row doing the same act; the move between two published days, its Undo, an amendment issued then unpublished (D101); the line's words and names; the stored `diff` and the sign-off binding identical with and without the fold; never zero while the delta is not; the added man's hollow tag |
| 7 | **The records** — in the same change as the code they describe | `docs/engine-rules.md` (the landing paragraph, §The late-input mark, the OIL question's rule, the pending count's unit), `docs/ui-contracts.md`, `docs/feature-impact.md` ("One input filed for several people": the board, the week and the count leave the "deliberately do NOT" list), `docs/data-schema.md`, `docs/data-model.md` (`srcg`, `oilAll`), `docs/file-map.md`, the behaviour register; the comments that state the 28 Aug and 22 Sep rules (D201) | `npm run docsize`, `npm run rulecheck` |

Steps 1 and 2 stand alone and are the smallest; 3 to 6 are the one row. One branch, one merge (D740, D485).

## 6. The roll-call for the bug check (every place the app draws or counts the thing) — FULL tier
The schedule's row: Edit Schedule's week, View-only Sched, an issued face (ORIG and an AL), the 👁 look at an older
version, the next-week peek, the Scheduler Board (live, read-only, OIL Earn), a saved plan switched in, a day template
saved and applied. Personal Inputs (week, board, folded). The Unavailable list (must NOT change). The count: the day
head, the board's head, the ⓘ panel, the Amendments box, the changes window (title, three tabs, the week view), the
sign-off line, "Discard N edits", the plan-switch message, the publish message, the published amendment's line. The
marks: the row's name, each puck, History's gold dots. OIL: the green bar, OIL Earn's switches, the ALL AVAIL window, the
OIL tracker's credit after a publish, a typed time on a Saturday. The input's own places: the Inputs calendar's bar and
day card, the List, the window. The warnings list and its click. An armed place. Undo and Redo of every hand in §4.5. A
reload after each. A phone and a desktop; his PC's 125% display. Each approved picture set beside the built screen at the
same size (D743 (11)). The walk is sized before it starts (`docs/walk-ledger.md`); two code readers (published records,
OIL).

## 7. For him — nothing waits on him; what he is told

**Q1 of version 1 is WITHDRAWN** (told to him 11 Oct 26): both readers hold that D739's and D740's reading 4 already
settle it, and the plan now follows them — a Yes follows the new hours, no question on the schedule (§4.7). He was told
the consequence: the question that opens today when hours are typed under Personal Inputs no longer does. If he would
rather it asked, it is one function.

**Readings, told to him — each the agent's, each his to overrule:**
- **R1** A name typed on a request's row becomes the input's own title, in the letters typed.
- **R2** Typing one time on a request's row fills the other end, and clearing a time makes the request all day — the
  manners the Personal Inputs boxes have had since 10 Aug 26.
- **R3** A shared input stays a shared input down to its last man: a puck dropped on its row still joins the input.
- **R4** *(changed by the reads)* A man dropped on the one row from a seat elsewhere stays in that seat too. A man dragged
  from the one row onto another place LEAVES the input and is put there, in one step.
- **R5** The last man cannot be dragged off — as the input's own window will not save an input with nobody in it; the
  sentence says to use ✕ or the window.
- **R6** A shared leave or overseas duty filed for several on a published day is one change waiting too (D736's words
  name no kind); the Unavailable list still draws a row a man.
- **R7** On the Unavailable list a typed box changes that one man's record, as today — he then reads as his own input.
- **R8** Rows saved before this build are drawn a row a man until their request next changes (demo data, D56).
- **R9** On a day not yet published, a time typed on a request's row no longer leaves a change mark on that box: the
  change is the input's, and the changes window lists it under the input.
- **R10** *(new)* An ALL AVAIL (or ALL) on the one row stands on one man's place underneath. If that man leaves the
  input, it comes off with him and the app says so; drop it on the row again. Keeping it there whoever leaves would mean
  re-keying OIL decisions — its own job, if he wants it.
- **R11** *(new)* The same rule on every row: hours typed on the Unavailable list's row of an overseas duty also keep a
  Yes at the new amount, with no question.
- **Found, not built — his to place:** nobody is told when someone else changes his input (`[INPUT-CHANGED-TELL]`).

## 8. The reads of version 1 (11 Oct 26) — what each found, what was done

Astra: `docs/superpowers/briefs/2026-10-10-reads/group-input-plan-astra.md` — NOT CLEAN, 12 findings; her meaning read of
the short lines D734–D743 against their full rows: all ten SAME. Sol 6.1: `…/group-input-plan-sol.md` — NOT CLEAN, 10
findings. Each was checked against the code before it was taken.

| # | Found by | The finding | What version 2 says |
|---|---|---|---|
| 1 | Both (A1, S1) | "The answer the input carries" as the majority answer can give an added man the wrong one — D738 means the filer's last. | A kept field, `oilAll`, written only when someone answers for the entry; the added man copies it, outside `oilDec` (§4.5). |
| 2 | Both (A2, S2) | Handing a placeholder to a sibling row moves its OIL item and silently drops the decisions made under the old one; and it would count wrongly. | Not handed on: it leaves with its member, said in words, its own change waiting (§3, §4.5, R10). |
| 3 | Both (A3, S4) | `grp` plus the fields a row shows is not the entry: two entries of one group can look alike and be drawn — and half-edited — as one. | `srcg` is the entry's own identity (`entryIdOf`: `grp` + every shared field), frozen on the row, used for drawing, landing and counting (§4.1). |
| 4 | Both (A4, S5) | The landing match compared `who`, so it could never find another man's row. | Matched on `srcg` alone; ONE helper for landing and for Accept (§4.2). |
| 5 | Both (A5, S6) | §4.7 / Q1 kept a behaviour the recorded readings of D739 and D740 had already replaced. | Followed: the answer stays, the amount follows, no sheet — every typed box (§4.7); Q1 withdrawn (§7). |
| 6 | Both (A8, S10) | "Discard N edits" counts what a load puts back — it cannot equal the pending count in every case. | Shares the fold, not the number; tested apart (§4.8, §5 step 6). |
| 7 | Both (A12, S8) | Dragging a member onto another place left him in the input — a copy where D734 says he leaves. | One command: he leaves the input and is put there; a refused place leaves him (§4.5, R4). |
| 8 | Astra 6 | A one-man request with a placeholder in its name box, made a group, drew no puck for its own man. | A grouped row's name box is its man's; the occupant moves to that row's extras (§4.2). |
| 9 | Astra 7 | A whole input moved between two published days has no filing or detail change, so the fold missed it. | Structural units are folded by their row's `srcg` (§4.8). |
| 10 | Astra 9 | A day template saved from a one row minted a row a man. | One template row for each drawn row; `srcg` stripped (§4.3). |
| 11 | Astra 10 | A row landing mid-list could send an armed place to another row. | The arm is put down when its row moved (§4.2). |
| 12 | Astra 11 | A whole-row OIL switch was the plan's own invention. | Removed; each puck's switch only, as today (§4.3, §4.9). |
| 13 | Astra 12 (second half) | Refusing the last man is not in D734. | Kept, with its ground: D734 measures the row by the input's own window, which will not save an input with nobody in it. Told to him as R5. (Sol found the refusal sound.) |
| 14 | Sol 3 | A CX or a take-off on a day that earns still reads a second item, "what this day earns". | True of a one-man request's row today; the one row counts what that row counts, never more — said as the rule, tested beside a one-man row (§4.8). Folding the OIL line into the act is not this job. |
| 15 | Sol 7 | The earliest `mod` of an all-late entry made the added man late — D741 says he is not. | His stamp is the earlier of today and his own deadline (§4.5). |
| 16 | Sol 9 | The doors alone do not hold: the probe bridge and any raw writer reach the row. | Belts in `txtSet`, `setSlotVal`, `fillSlot`; the bridge goes through the doors (§4.4, §4.5). |
| 17 | Both (notes) | "`srcg` moves no signature" was too wide. | Said exactly: no canonical unit, diff or sign-off binding; the two cache signatures do move (§4.1). |
| 18 | Sol (note) | The typed-box door must tell "refused" from "not a request's box". | Three answers (§4.4). |
| 19 | Both (notes) | The CSV export and the print list no ground rows. | Out of the roll-call's "follow it" (§4.3). |

A second, short read of the CHANGED parts only (§3, §4.1, §4.2, §4.4's belt, §4.5, §4.7, §4.8) is asked of both before
the build — a new saved field and a changed OIL rule are in it.
