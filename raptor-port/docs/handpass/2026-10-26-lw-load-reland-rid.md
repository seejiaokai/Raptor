# The load's count over a request moved onto the Ground Programme across three days — the evidence sheet

Branch `claude/lw-load-reland-rid` (pull request 573), 26 Oct 26. One filed leftover: [LW-LOAD-RELAND-RID] (found building
[LW-OD-DISCARD-COUNT], PR 572), his pick from the backlog ("Yes", 26 Oct 26).

**Tier: FULL.** The eight answers: 1 earned leave / who counts as present — no (no count of people changes; where an input
stands after a load is unchanged): NO · 2 published record — the load's "Discard N edits" count and its note, and the
hidden name a request's row carries into an issued version: YES · 3 saved data — the row's stored id for a row → Ground
puts down: YES · 4 shared drawer — the load button's count is read by the week's and the board's builders and the handler
(one function): yes · 5 new gesture — no · 6 new surface — no · 7 roles — no · 8 warnings — no.
The server question (§5): no rule of who may do what changed; `perms.test.ts` and `perms-scan.test.ts` ran green among
the 184 files; no §11 row touched.

**Rulings swept:** D98 (a day back to what was published shows nothing pending, and the load must get it there), D175
(one request, one row — a load never puts a request on a second day), D109 / D114 (one change counts one), D1393 (an
overseas duty's way out of Unavailable — Reject, → Ground, → Unavail), D1381 / D1389 (a course's), D1401 (a load is not a
scheduler's move — untouched: the load here puts no input anywhere a scheduler would), D863 (the load's note is short plain
sentences), D56 (stored demo data is not a finding), D1090 (Auto-fix stays off — the app switched it on for this pull
request; switched off at once).

## What was wrong, and the fix

Wednesday published with the seed's three-day overseas duty (Pike, Wed 15 – Fri 17 Jul) under Unavailable, then Reject and
→ Ground: the load of the Original read **"Discard 2 edits"**. The backlog item read it as "a load that discards nothing";
measured, the load does one thing — it takes the duty back under Unavailable (the version holds no row for it, so the
load's reconcile unfiles it, and an overseas duty unfiled does not land again) — so the right number is **1**. Two faults
made the 2, and either alone gives a wrong number:

1. **→ Ground named the row apart from the working-out** (`engine/slots.ts acceptInput`): a fresh hidden id, where the
   working-out lands a request's row as `r` + its id (`engine/overlay.ts landedRid`). The count compares rows by that id, so
   a row the working-out lands again read as one taken off and one added. → Ground now takes `landedRid`'s name.
2. **The count's dry run missed the load's reconcile** (`engine/publish.ts dayDiscardCount`): it landed the row again from
   the request's filing as it stands. It now mirrors `reconcileDayFiling` and the load's Ground-mark rule: a request on the
   programme whose row no loaded day holds once the version is in is unfiled, and where it can then no longer stand on the
   programme its row goes with the load.
3. **The load's note** (`engine/drafts.ts inputsLeftSaid`) said "filed since publishing" of an input the day went out with
   (a course moved onto the programme since, which the load leaves — it lands again, fresh): it has its own sentence now,
   "1 input moved onto the programme since publishing stays there, pending."

**Tests:** `ui/odreject.test.tsx` +2 — the overseas duty (count 1; the load takes it back under Unavailable, nothing
pending) and a three-day course (count 0; the load keeps its row under the same name, still 1 pending; the note). Each of
the three fixes taken out alone turns a test red (run 26 Oct 26). 184 unit files that touch these paths, 4027 tests, green
on his PC (83 touching the buttons, the load and the count; 101 more on publishing and amendments).

## The roll-call (§6)

**The thing:** the load's count ("Discard N edits") and note, and the hidden name of a request's row on the programme.

| Where | Has it / must not | Notes |
|---|---|---|
| The Scheduler Board's "Load onto working copy" (a version previewed) | HAS IT — walked R1 (desk: "Discard 1 edit & load — confirm"), R2 (phone: no Discard, the note) | `ui/SchedBoard.tsx` reads `dayDiscardCount` |
| Edit Schedule's week, the same button in a day's preview | HAS IT — the same function (`ui/html.ts withDaySnap` → PVND); not walked separately, the board's walked | one count, two builders (P2-IMPL-09) |
| The load's handler (the confirm gate, "already at", the note) | HAS IT — walked R1 (the load ran, its note), R2 (the "already at" path, its note) | `ui/interactions.ts` |
| → Ground on Edit Schedule's week | HAS IT (names the row) — walked R1 | `ui/html.ts accCtl` → `acceptInput` |
| → Ground on the Scheduler Board | HAS IT — walked R2 (phone) | `ui/board-html.ts` → `acceptInput` |
| A new input added from the Ground Programme's "+ Inputs" (`commitNewInput` toGround) | HAS IT — the same `acceptInput`; carried by the input tests among the 184 files, not walked | its row is named `r` + its id now |
| A request landed by the working-out (a fresh filing) | MUST NOT change — already named `r` + its id (`landedRid`), unchanged | |
| A row put back by Accept on a day whose issued version held it | MUST NOT change — keeps the issued row's id (AM20), unchanged; tests among the 184 | the `rid` branch |
| The plan switch ("Switch to this plan") and its count | MUST NOT change — not this count (`draftSelect` keeps its own); untouched | |
| The changes window / the day head's "N pending" | MUST NOT change — counts the published version against the live day, no dry run; walked R1, R2 (1 pending before and after as each should) | `dayPendingItems` |

## The sizing step (§7.0)

1. **Type:** G (the published record — a count and a note on a published day; a row's stored id).
2. **What only a walk could find:** that the board's button really reads the corrected number before the confirm (desk),
   that the load then does what the number promised (the duty back under Unavailable, nothing pending, the note), that on
   a phone the "already at" path raises the corrected note where it can be read, and that → Ground on each surface names
   the row. Tests carry the count's arithmetic for the two kinds and the load's effect on stored state.
3. **The ledger:** the last walk of this exact state (W7, `lw-lock-walk.mjs`, 26 Oct 26) was the host alone, about 5 min of
   a 30-min script, and found this item in passing; G-type walks of a count are short and their reads find the routes.
4. **The walk chosen:** the host alone, one assertion script of 5 steps (`scripts/handpass/lw-reland-walk.mjs`) — R1 desk
   1536 (the week's → Ground, the board's load, confirmed), R2 phone 402 Chromium (the board's → Ground, the load's
   "already at" note, a picture right after the tap) — on one served build (port 4181). Carried by tests: the week's own
   load button (the same count), the Ground Programme's "+ Inputs" door.
5. **Row:** added to `docs/walk-ledger.md`.

**§7.11's lessons, checked:** (1) a reading in each state — the load button read before the press, armed, and the note
after the load (R1) and on the path with nothing to discard (R2); the day head before and after both; (2) a gesture at
speed — none new; (3) feedback — the note after each load pictured (`r1-after-the-load`, `r2-phone-settled`), the duty seen
back under Unavailable (`r1-pike-back-under-unavailable`); (4) a press behind an open window — none new (the preview is not
a window over the page); (5) a box brought into sight — the phone's note stands clear of the screen's foot (R2 pictures).

## The walk

`Walk: 5 PASS, 0 FAIL — scripts/handpass/lw-reland-walk.mjs on the build of the branch's first commit (bundle
index-BTxYoNSp.js, port 4181), desk 1536 and phone 402 Chromium; no console or page errors on either; pictures
docs/img/handpass/2026-10-26-lw-load-reland-rid/.` (Two earlier runs stopped on the script's own faults — Wednesday's board
door not on screen in a week sat on Monday, and a check reading the Unavailable panel's text, which lives in its boxes —
each fixed in the script and looked at on its picture first, not app faults.)

| Step | What was pressed and seen |
|---|---|
| R1-moved | desk: Wednesday published; on Edit Schedule's week Reject then → Ground on Pike's overseas duty: on the programme with its Ground mark, one row named `r` + its id (`r1-on-the-ground-programme`) |
| R1-count | the board: "1 pending"; the Original previewed; "Load onto working copy" pressed once reads "Discard 1 edit & load — confirm" (`r1-load-arms-discard-1-edit`) — it read "Discard 2 edits" before the fix |
| R1-loaded | confirmed: nothing pending; the duty back under Unavailable by its kind (its Reject there — `r1-pike-back-under-unavailable`), no row; the note "Wednesday is back to the Original. Viewers still see the Original. OD is off Thursday and Friday too." (`r1-after-the-load`) |
| R2-moved | a two-day course (Mon 13 – Tue 14 Jul) filed before Monday went out (under Unavailable by itself, D1372); on the phone's board Reject then → Ground: one row named `r` + its id (`r2-phone-on-the-ground-programme`) |
| R2-load | "1 pending"; the Original previewed; "Load onto working copy" (no Discard) pressed at a point: "Monday is already at the Original. 1 input moved onto the programme since publishing stays there, pending." — never "filed since publishing"; still 1 pending, its row under the same name (`r2-phone-right-after-the-tap`, `r2-phone-settled` — the same, nothing tinted or shifted) |

**Seen, older, not this change:** after any load the sign-off box reads "4 to sign" — the sign-offs fell with the change
waiting (D103) and are signed again for the next amendment; the same in PR 572's W7 picture.

**The re-walk on the read's fixes** (§5 — a separate folder, `docs/img/handpass/2026-10-26-lw-load-reland-rid/rewalk/`;
bundle index-DvP9EvcH.js): `Walk: 6 PASS, 0 FAIL` — R1 and R2 again, and **R3** added for the read's F2: a two-day course
(Thu 16 – Fri 17) filed before Thursday went out, Reject and → Ground on the week, one other edit (a Common Programme end
time on the board): "2 pending"; the load of the Original arms "Discard 1 edit"; confirmed, the note reads "Thursday is back
to the Original. Viewers still see the Original. 1 input moved onto the programme since publishing stays there, pending." —
no "off Friday"; the course back on Thursday's programme, 1 pending (`rewalk/r3-after-the-load`, `rewalk/r3-note-crop`). The
re-walk met four more faults of the script's own (a board check fooled by the board kept in memory on the Inputs page, a
door off screen, a control character an edit script wrote into a check) — each looked at and fixed in the script, none the
app's.

## The code read

One fresh, blind Opus reader (D790, D903 — no ChatGPT readers until about 1 Nov 26: the job is on [NO-ASTRA-LIST]), given
the commit, this sheet and the rule that stored demo data is not a finding (D56), asked for absences first.

| Finding | What it was | Disposition |
|---|---|---|
| F1 (reproduced) | → Ground named its row past the SCREEN's names only, while the working-out names past every name the SAVED week holds — a dead row of the request on an earlier day (left by a re-date) still held `r`+id; the saved week's first-seen-wins then renamed the new row at random, and the load read "Discard 2 edits" for good on that path | FIXED red-first — `state/holderbase.ts baseRowIds` (installed as `HOOKS.baseRowIds`) gives the saved names to `acceptInput` and to the count's dry run (`drafts.ts dayAsLoadLeaves`, through `viewOfWeek`'s new `ctx.taken`); `odreject.test.tsx` "the code read's F1" (red without each half) |
| F2 (reproduced) | the load's note named a request from the moved list taken straight after its reconcile, but the working-out then lands an unfiled activity again: a course read "off Thursday and Friday too" beside "moved onto the programme … stays there" | FIXED red-first — `drafts.ts loadMovedNow`, read after the pass, says only what is still so; tests for a course (not named) and the overseas duty (still named off Thursday and Friday); walked R3 |
| F3 (reproduced, older) | a load of Thursday that cannot put a three-day course back lands it on its start day, Wednesday — another published day (AM1, D175); the note said "off Wednesday and Friday" | FILED for him — [LOAD-MOVES-ROW-DAY] (what such a load should do is a product choice, with pictures, D994); meanwhile the note names it truly — "… is on Wednesday again too" (`loadMovedNow`, test "the code read's F3"), never silent |

**Absences the reader checked and found fine:** the Ground Programme's "+ Inputs" door; Accept back onto a day whose
version held the row (keeps the issued id); random ids against `r`+id; Undo and Redo; another week's copy; an id held in AL1,
removed in AL2, re-added (every comparison is one day against its current version); the dry run against the load case by
case (a request both put back and unfiled, the reconcile's other direction, locked inputs, 'u' and 'r', an overseas duty the
version had on the programme, an activity landing again, a `kept` row); the note's new sentence for a shared input and for
a version with no frozen inputs.

**The fix commit's own narrow read** (§5 — "a fix is new code"; one fresh Opus reader, round 1 of at most about three): F1's
name is now always outside every name the saved week and the screen hold, whichever side the dead row sits (its probe:
a dead row on Friday, → Ground on Wednesday — count 0 before and after the load); the live check's extra names change a
landed row's name, never whether it lands, so ordinary days are unchanged (probe: a wave-label edit, 1 / 0 with and without
the hook); the other callers of the working-out pass no names; the timing of the note after the pass is right. **One
finding, low, reproduced:** F3's note read "is on Wednesday again too" — untrue ("again": it never stood there; "too": it
is no longer on Thursday). FIXED red-first: a move onto a day it never stood on is marked (`moved`) and reads "… is on
Wednesday's programme now, pending there."; the rest of that case is [LOAD-MOVES-ROW-DAY]'s question. A wording fix of one
line, carried by its test ("the code read's F3"); no further round.
