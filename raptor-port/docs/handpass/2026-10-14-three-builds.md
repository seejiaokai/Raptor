# The three builds of 14 Oct 26 — the batch's ONE bug check (`[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`)

**One branch, one check (D485):** the Leave War's clash note on a phone (D805, D823, D827), the passing notes' wordings
and their width on a phone (D828, D837–D839), and the small fixes of the design look of 13 Oct (D830) with the bar that
waits on an OIL answer moved under the top bar (D831, D840, D841). Branch `claude/approved-jobs-batch-build-cc42ef`, cut
from `claude/writing-guide-wording-review-c85888`. What was approved: `docs/handpass/2026-10-13-design-look.md` (the
look's record), `docs/superpowers/briefs/2026-10-13-wording-recheck.md` (the words), `docs/mock/design-look-13oct.html`,
`docs/mock/oil-band-14oct.html` (the bar's drawing).

## 0. Questions waiting for him (a minute's read)

*(filled at the close — §11)*

## 1. The eight questions, and the tier

| # | The question | Answer | Why |
|---|---|---|---|
| 1 | What a man is owed (OIL counts) | NO | The OIL question's sheet changes its words, its layout and its keys; the answer it hands back, who earns and how much are untouched (`OilConfirm` still calls the same `onSave` with the same days and amounts — pinned by every existing OIL test, none re-expressed but for the title's words). One note gains a true clause ("…and can earn OIL", his D839). |
| 2 | The published record | NO | The notes AFTER a publish and an unpublish are reworded; publishing, unpublishing, amendments and what is stored are not touched. |
| 3 | Saved data | NO | Nothing stored changes shape. A clash record gains two fields, but the clash list is worked out afresh on every pass and never saved. |
| 4 | A shared drawer | **YES** | The ✕ of eleven small windows, the keyboard order of six question sheets, the one passing note (276 callers), the one date calendar (fourteen places), the failed-save band's own rules. |
| 5 | A new gesture or mode | **YES** | The clash list's line and rows are buttons; a tap opens a day for a person; four new keys on the calendar and Enter in its lists; Delete on a Tracker date box; Escape on the bar. |
| 6 | A new surface | **YES** | The clash list on a phone; the OIL bar as a band under three bars. |
| 7 | Roles | NO | The clash note is the admin's as before (one `role === 'admin'` test, unchanged, for both sizes); nobody may do or see anything new. |
| 8 | The warning list | NO | The day's issues list and every rule are untouched. The Leave War's clash strip says the same clashes in new words; one passing note about a hidden warning is reworded. |

**Tier: WALK.** One check for the three (D485), sized by the riskiest change. Beyond the tier, by his placing in the
handoff: a fresh, blind Opus read of the finished code (D790) — the ChatGPT readers are out (D761's list carries it).

## 2. The roll-call — every place each changed thing is drawn

Marks: **has it** (seen and operated on that surface — the walk's picture or line named), **must not, because…**, **MISSING**.

### 2a. A clash between the schedule and the Leave War

| Where a clash is drawn | Shows the new note | The tap is usable there | What else is painted there |
|---|---|---|---|
| The Leave War's stage line on a tablet and a desktop (the strip) | has it — same words, the instruction a link | has it | the stage line's own buttons; nothing over it |
| The Leave War on a phone (the slim line and its list) | has it | has it — the line (Show / Hide) and each row | the two lines of buttons above, the grid's card below; the top bar's menu button |
| A member's Leave War, either size | must not — the note is the admin's (the strip always was) | — | — |
| The grid's amber "!" corner on the clashing day | must not change — it is the day's own mark, and the tap on the note now opens the very sheet that cell opens | — | — |
| The day's list sheet ("Two of these can't both stand…") | must not change — it is where the tap lands | — | — |

### 2b. The ✕ of a small window (`.airpop-head .x`) — eleven heads

| The window | ✕ in the corner | ✕ last by keyboard (a question sheet) | Else in its head |
|---|---|---|---|
| The OIL question | | | — |
| The upchit question | | | — |
| The medical-clash question | | | — |
| "No medical document" | | | — |
| The board's cancel-reason dialog | | | — |
| The board's "Sort all" | | | — |
| An input's own window | | must not — not a question sheet; its keys are its own, as built | the title, a cancelled input's CX mark beside it |
| The document viewer | | must not — as above | — |
| "Jump to a date" | | must not — as above | the Today icon, left of the ✕ |
| A day's pop-up on the week | | must not — as above | — |
| The Traffic window | | must not — as above | — |

### 2c. The OIL question (`OilConfirm`) — every caller

| Who opens it | Words of record | Flat answers, outline when picked | Its two buttons | First answer has the keyboard |
|---|---|---|---|---|
| A new input's own save (an input's window) | | | Back / Add | |
| A change's save (an input's window) | | | Back / Save | |
| A question raised from the input's row on the schedule (the window shuts with it) | | | Back / Save | |
| The desktop Inputs list's "OIL?" chip | | | Back / Save | |
| A swap, an add, a move, a put-back, a filing that waits (5 kinds) | | | its own pair ("Don't swap / Swap" …) — unchanged | |
| The several-days form (any caller) | must not — its words were not on the page he approved (D808) | | as its caller | |
| The day's one list of OIL questions (not this sheet — its own buttons) | must not — its words are its own | has it — a picked Yes and a picked No both outline (D830's L5; it replaces D783's grey No) | — | — |

### 2d. The bar that waits on an OIL answer

| Where it can be up | The band, one line | Keyboard goes to it; Escape closes it | With "Not saved" too |
|---|---|---|---|
| Edit Schedule's week (the top bar) | | | |
| The Scheduler Board (its own bar) | | | |
| The Inputs page — the calendar's drag, an input's Accept / → Unavail (the top bar) | | | |
| The Medical view opened full | | | |
| Any other page | must not — a change of page takes the bar away (state/view.ts), as before | — | — |
| A window, a sheet, the phone's menu | must not — a short visit; the bar's own is there when it closes (D587's rule for the save warning) | — | — |

### 2e. The passing note

One element (`#toastEl`), every caller. | A phone: 12 from each side | A desktop: as it was | At the top while a window is up (phone) |
The words: one row per reworded note in §6, each with its source and the test that pins it.

### 2f. The date calendar and the date box — fourteen places

The helper's table, checked by the host against the callers: §7.

## 3. The door check — every new gesture, and what else hears it

| The gesture | Its door | What else could hear it | Result |
|---|---|---|---|
| A tap on the phone's clash line | a `<button>` in the note | nothing — a real button in the page's flow | |
| A tap on a clash row / the desktop's instruction | `goClash` → the store's `focusDay(date, { open })`, taken ONCE by the grid; or `openInputWindow` | the grid's own jump (the under-manned list uses the same call without `open`); a later draw of the grid | |
| Home, End, Shift+Page on the calendar's dates | the calendar's own `onKey`, on the dates only | the form the calendar sits in (Admin → Data); the window behind a floating one | |
| Enter on the calendar's title, and in a list | the title's click (a key's); the list's `onKey` | a form's submit | |
| Delete / Backspace on a Tracker date box | the box's row, stopped there | the Tracker's page-wide Delete (it deletes what is selected on a chart being arranged) | |
| Escape on the bar | the bar's own element — never the page | whatever the keyboard is on when it is NOT on the bar: a window, a text box, the schedule's Escape | |
| Tab inside a question sheet | the sheets' one document listener (it existed) — now it also steps round the ✕ | the schedule's own Tab route, a page's handler: it already ran before them | |

## 4. The walk's size (D607, D608)

1. **The type of change.** C (new controls and keys), B (two new surfaces: the phone's clash list, the bar's band), E
   (layout and look across shared pieces), D (one thing drawn in many places: the ✕ in eleven heads, the band under
   three bars, one locked-week sentence in seven places, the calendar in fourteen), F (about forty notes' words).
2. **What only a walk could find here.** Layout on a real screen — columns in line, one line, widths, what lies over
   what; a style name of ours meeting one the schedule's global sheet already owns (it did — §9, find 1); each of the
   eleven heads after one shared rule moved their ✕; the notes as the app really joins and raises them, by the gesture
   that raises each; the band under each bar and with the other band; a real Tab through each sheet. What the tests and
   the reads already cover: every sentence to the letter, the start-open rule, both destinations of a clash's tap, the
   keys' state table, the Tracker's Delete, the bar's keyboard.
3. **What the ledger says.** Walks of types B, C and D found faults in most jobs (the calendar's walk the day before:
   three walkers, a real fault in a card drawn off the screen); words-only walks found none.
4. **The walk chosen.** The host first: six scripts written as assertions of the right behaviour, a phone and a
   desktop each, a picture at every step (`dl-clash-built`, `dl-oil`, `dl-band-built`, `dl-cal`, `dl-trk`, `dl-keys`
   — about 150 lines). Then THREE Sonnet walkers on the one frozen build, each its own worlds, 49 scenarios by the
   screen's own controls: W1 the clash note (12), W2 the notes by the gesture that raises each (21), W3 the eleven
   heads, the question sheets, the OIL question's other forms, the band and the calendar card's name (16). Sizes: a
   phone (390) and a desktop (1440), with 360, 430 / 431 and 320 where a width is the point. No short screen: nothing
   here is a viewport-tall column. **Sized up from the two helpers first told to him**, because the notes alone are
   seventeen gestures. Carried by a test, not walked: §8.
5. **Its row in the ledger:** added at the close.

## 5. The host's own walk — the scripts, as assertions

Run on the served build (4173), a phone (390 × 844, a finger) and a desktop (1440 × 900), each line `works` or
`FAIL — what was seen`, a picture at every step: `DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/<script> [phone|desk]`.
The key record of every line: `docs/img/handpass/2026-10-14-three-builds/keyboard.json`.

| Script | What it asserts | Lines, phone / desktop |
|---|---|---|
| `dl-clash-built.mjs` | the clash note: where it sits, one clash open and several closed, the row's words, the two lines above untouched, the columns in line, every row one shape, the names' column sized by the roster, no inner scroll, nothing over a row, wider letters, a tap opens the day for the person, Hide, his choice kept, a member sees none; the desktop's strip, its words, the instruction by keyboard | 19 / 5 |
| `dl-oil.mjs` | the OIL question at a new input's save and before a swap: Back / Add, the words of record, flat answers, the ✕ in the corner, the first answer has the keyboard, ✕ last, the app's ring, the picked outline look; the bar on the board and on Edit Schedule as a band, one line, in wider letters too, nothing under it, by keyboard, OK | 13 / 25 |
| `dl-band-built.mjs` | both bars at once, on real storage: "Not saved" above, both 36 tall and touching, the line under them amber; "Not saved" alone amber too; with no bar, Edit Schedule's cyan edge back | 4 / 4 |
| `dl-cal.mjs` | the date calendar: the phone card's name, the ring a keyboard's only, the four keys to their exact dates, the lists' ring and Enter, a date that cannot be picked faint and plain (today's disc kept), the faint dates' strength, a run's weekend dates and its sentence | 9 / 24 |
| `dl-trk.mjs` | the Tracker's boxes: no day after today on the five kinds that refuse one, Upchit still takes tomorrow, a date dim until a mark carries it, one width on a desktop, Delete and Backspace, the Tracker's own Delete not fired | 17 / 16 |
| `dl-keys.mjs` | records only — the two keyboard jobs NOT in this batch (`[KBD-PUCK]`, `[TRK-KBD-CHART]`), written OPEN, never judged | 0 / 8 OPEN |

**Result of the host's runs on the final build: every line `works`; 8 lines OPEN (the two filed jobs); no page error in any run.**
The first run of `dl-clash-built.mjs` found one fault (§9, find 1); the first runs of `dl-oil.mjs`'s both-bars step and of
`dl-band-built.mjs` found the script's own mistakes (a throwaway world cannot fail a save; the script read the hidden
top bar's warning instead of the board's) — written here as the script's, not the app's.

## 6. The notes — one row a note (built by the helper, each sentence checked by the host against the words of record)

Words of record: `docs/superpowers/briefs/2026-10-13-wording-recheck.md` (List 3 where it has a row, else List 1 / 2).
Every sentence is pinned to the letter by `src/ui/noteswords.test.ts` (read off the source: the built sentence present,
the old words gone, and nineteen "left as they were" rows) — a pin of WORDS; the behaviour that raises each is its own
test's, named here, and the walk's (W2).

| Note | Where it is written | Its own test |
|---|---|---|
| N1 — "Monday published and approved"; joined with the same day's OIL line: "Monday 13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL." | `engine/publish.ts`, `leavewar/sync.ts oilBlindLine`, `ui/toast.ts toastBatch` (a note's third argument says which day it names and what it says of it) | `leavewar/publishdoor.test.ts` (7), `ui/toastbatch.test.ts` (7) |
| N2, N3 — unpublish, and an amendment withdrawn | `ui/interactions.ts` | `ui/unpublish-button.test.tsx` (the real button) |
| N4 — "Some of Monday's OIL credits are already spent on the Leave War. …" | `ui/interactions.ts` | words only |
| N6 — "Monday is still a draft. Publish the day first, then its changes." | `engine/publish.ts` | words only |
| N7 ×7 — the locked week, and its "amended here" twin | ONE source: `engine/publish.ts LOCKED_WEEK_NOTE`, `lockedDayNote`; used in `state/store.ts` (1), `ui/inputedit.tsx` (4), `engine/publish.ts` (2) | `engine/lockednote.test.ts` (both sentences, the two engine doors, the seven call sites counted, no typed copy anywhere) and four older suites tightened to the exact sentence |
| N8 | NOT built — the app can no longer show it; its dead line untouched | pinned as left |
| N9, N11, N12, N13, N17, red box | `ui/board.ts`, `ui/SchedBoard.tsx` | `ui/reqdoor.test.tsx` (the red box, N10), words for the rest |
| N10 — both lines, the second with "and can earn OIL" | `ui/board.ts` | `ui/reqdoor.test.tsx` |
| N14, N15, LATE mark, N30, N31, N32 | `ui/interactions.ts` | `ui/oilperiod-offer.test.tsx` (N31, N32, the real button); words for the rest |
| N16 | unchanged, pinned unchanged | — |
| N19, "is not a time" | `engine/slots.ts`, `ui/DutyTplModal.tsx`, `ui/WaveTplModal.tsx` | `engine/audit-c-briefguard.test.ts`, `ui/DutyTplModal.test.tsx` |
| N22–N27 | `ui/inputedit.tsx`, `ui/reqdoor.ts` | `ui/medclash.test.tsx`, `state/medwrite.test.ts`, `ui/editorwindow.test.tsx`, `ui/groupeditor.test.tsx`, `ui/reqdoor.test.tsx`, `ui/phmember.test.tsx`; words for N23, N24 |
| N28, N29 | `state/quals-write.ts`, `ui/QualsPage.tsx` | words only |
| N33 — the note removed; "Add qualifications" opens Admin | `ui/QualsPage.tsx` | `ui/quals.test.tsx` (2) |
| "Left OIL Earn without undoing. …" | `ui/topbits.tsx` | `ui/oilundo-button.test.tsx` |
| The width on a phone (D828) | `ui/toast.ts placeToast` — set on every note, because the one element is reused | `ui/toastplace.test.tsx` (5) |

**The relatives he did not see are untouched, as the words of record order** — and three of them now stand beside a
reworded sibling on one screen: N12's first sentence has its full stops on the puck's tap and keeps its dash on the
item's own switch and in the ALL AVAIL window; "the common programme" has its capitals only inside N1's joined sentence;
N1 with a second line riding behind reads "…earns OIL. · Plasma's LL bid…" (a full stop, then the dot). For the
whole-app words pass (D808) — §0 asks nothing of him on these.

## 7. The calendar and the Tracker's date boxes (built by the helper; the roll-call checked by the host against the callers)

| Where the one calendar is drawn | K1–K4, L8, L12, L13 | L9, the phone card's name | L11, L17 (a run) | `max` (L14) |
|---|---|---|---|---|
| Calendar window → "Every <weekday>" → From | has it | has it — FROM | must not — no run | must not — any date |
| …→ Until "A date" (it has a first date; the weekday stands out) | has it — the one place L8 shows | has it — UNTIL (`cardName`; its spoken name stays "The date it ends") | must not | must not |
| Admin → Users, "Post in" ×3 | has it | has it | must not | must not — a posting may lie ahead |
| Admin → Data, "Older than" / "Date" | has it | has it | must not | must not |
| Admin → Data, "A date range" (the calendar drawn in the form) | has it — Escape and Tab are the form's | must not — no card; the form's own label names it | has it — the only run today | must not |
| A medical input's "Upchit date" | has it | has it | must not | must not — not asked |
| The Leave War's five posting dates | has it | has it — "Post <callsign> in from" … | must not | must not |
| The Tracker's Last Flown (Syllabus), (Currency) | has it | has it | must not | **has it** |
| The Tracker's Upchit, End date A, End date B | has it | has it | must not | must not — planned days (D374) |
| The Tracker's failures-list rows | has it | has it | must not | **has it** — they refuse a future day too (D374); added by the host on the helper's find, beyond the page's "four boxes" |
| The Tracker's marking pop-up: Done on, Failed on | has it | has it | must not | **has it** |

K12 (Delete / Backspace): the Tracker's five side-panel boxes and its failures-list rows — the boxes that have a ✕;
not the pop-up's two (no ✕), and no date box of the scheduler's (none can be empty — D796). L15 (dim until a mark
carries the day): the pop-up's two only. L16 (one width, a desktop): Last Flown ×2 and Upchit.

**Left as built, and why:** Escape with the lists open still closes the whole calendar (a test pins it; the lists-only
Escape is on the page under "the keys calendar step two must carry", not in this batch). A date that may not be picked
is still never walked onto by the arrows, so Home / End / Shift+Page onto one do nothing (the same list). Both are
step two's (`[ONE-DATE-CALENDAR]`).

## 8. Carried by a test, not walked

| The case | The test | What it proves, and how |
|---|---|---|
| Every reworded sentence, to the letter | `src/ui/noteswords.test.ts` | the WORDS in the source — not that a gesture raises them (the walk's W2 does that for seventeen; the rest have their own tests in §6 or are words-only changes to an unchanged gesture) |
| A clash in another leave period switches to it | `src/leavewar/clashperiod.test.tsx` | the route — with the list handed in (a real clash in a second period needs a published weekend in another year); calls the strip's real button |
| The clash's tap: taken once, an ordinary jump drops it, the input gone | `src/leavewar/clashwayout.test.tsx` | the store and the strip's real buttons; the whole page once (the sheet opens, and is not reopened by a later draw) |
| The calendar's keys in every state (dates showing, lists open, a first or last date in the way, a month's and a year's edge) | `src/ui/datecal.test.tsx` | the real component, real key events |
| The Tracker's refusal of a future day (D374) now that the calendar offers none | `src/tracker/leftovers.test.tsx` (`pickAhead`) | the store still refuses and says its line — the day is tapped with the clock moved on, then put back |
| The Tracker's own Delete is not fired from a date box | `src/tracker/leftovers.test.tsx` K12 | a document listener wired as the app wires it is not called; the walk's `dl-trk.mjs` proves the same on the page |
| The bar under a full-screen surface, the top bar's copy standing down | `src/ui/oilconfirm-look.test.tsx` | the two components side by side; on screen: `e2e/oilwait.spec.ts`, `dl-oil.mjs` |
| N7's seven places | `src/engine/lockednote.test.ts` | counted in the source; the two engine doors pressed |

## 9. What the walk found, and each disposition

1. **The phone's clash line stood 46 tall instead of 30** (the host's first run, 14 Oct). Its Show / Hide wore the class
   `go`; the schedule's one global stylesheet already owns `.go` (a wave: a margin and a border), and reached it.
   **Fixed:** every part of the note wears a name of its own (`clash-…`). Pinned by `src/leavewar/clashwayout.test.tsx`
   "every part of the note wears a name of its own" (it lists the bare names it finds — red on the first cut) and by
   `e2e/leavewar.spec.ts` (the line no taller than 34 on a real screen). The script's own line then passed.

## 10. Break tests, errors seen, what was not walked

*(filled at the close)*

## 11. The gates, and the look card

*(filled at the close)*
