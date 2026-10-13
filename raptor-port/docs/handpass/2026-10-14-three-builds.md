# The three builds of 14 Oct 26 — the batch's ONE bug check (`[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`)

**One branch, one check (D485):** the Leave War's clash note on a phone (D805, D823, D827), the passing notes' wordings
and their width on a phone (D828, D837–D839), and the small fixes of the design look of 13 Oct (D830) with the bar that
waits on an OIL answer moved under the top bar (D831, D840, D841). Branch `claude/approved-jobs-batch-build-cc42ef`, cut
from `claude/writing-guide-wording-review-c85888`. What was approved: `docs/handpass/2026-10-13-design-look.md` (the
look's record), `docs/superpowers/briefs/2026-10-13-wording-recheck.md` (the words), `docs/mock/design-look-13oct.html`,
`docs/mock/oil-band-14oct.html` (the bar's drawing).

## 0. Questions waiting for him (a minute's read)

Nothing below held the build; each is a choice that is his, with what the walk saw and a recommended answer.

1. **The sentence you approved cannot be seen; its two copies kept the old words.** With "Nothing today earns" switched
   on for a day in OIL Earn, a tap on an event's own OIL mark (say the SDO desk's), or on a man in the ALL AVAIL
   window, says "Nothing on this day earns — turn that off first". The wording you approved — "Nothing on this day
   earns. Turn that off first." — was listed for a man's puck, which cannot be tapped there (it is greyed, on
   purpose, since September). **Recommended: change those two copies to the approved wording.** Waits on it: two
   sentences; nothing else. (§9, find 4.)
   **ANSWERED THE SAME DAY — "Yes" (D843), then "What is turn 'that' off mean for 'that'" and "Clearer" (D844):** the
   sentence names the switch — `Nothing on this day earns. Turn off “Nothing today earns” first.` — from one source,
   in all three places; the ALL AVAIL window's hint names it the same way, and that window's copy of the event's
   refusal takes its approved full stop. BUILT, tests first: `src/ui/oilmode.test.tsx` (the event's OIL mark tapped
   under the switch — and no man's puck a tap target there), `src/ui/availwin.test.tsx` (a man tapped in the window),
   `src/ui/noteswords.test.ts` (the one source, the switch's own label, the old words gone).
   **AND AGAIN, SHOWN IT BUILT — "Maybe nothing on this day earns. Turn off the switch first", then "1" (D845):** his own
   shorter wording, chosen over "the day's switch" (put to him because every event's mark and every man's puck is a
   switch there too). `Nothing on this day earns. Turn off the switch first.` — the WORDING OF RECORD, from the one
   source; the window's hint "…Turn off the switch to change men one by one." Tests re-expressed first (red), then the
   words; on screen by `dl-notes-built.mjs`: the tap on an event's OIL mark under the switch says it, one line on a
   phone (38 tall), no man's puck a tap target there (picture `note-phone-2-under-the-days-switch.png`, opened).
2. **On a phone a note raised while a window is open lies over the window's title and ✕ for about three seconds** —
   it goes to the top there (your choice of 10 Oct, so it is not over the window's buttons), and it is full width now
   (D828), so it covers the whole head instead of its middle. Picture: `w2/ntop-phone-note-with-window-up.png`; the
   same over an open Leave War day sheet's lower part, `w1/c4-phone-tap-opens-the-sheet.png`. **Recommended: leave it
   for now and look at it on your iPhone** — three seconds, and a tap on the ✕ still works under it; if it bothers
   you, the note can sit just under the window's head instead. Waits on it: nothing built.
3. **In a cancelled input's own window the red CX tag and its reason stand at the right, by the ✕, not next to the
   title** — as built on 12 Oct (D771 says "beside the window's title"). Picture: `w3/x03-desk-cancelled-input-window.png`.
   **Recommended: move them to follow the title, in the next small batch.** Waits on it: nothing in this batch.
4. **Two more question sheets wear the stray darker strip the OIL question just lost** (L1): "Keep / Remove" on an
   upchit and "ATT B replaces / Keep ATT C" on a medical clash. Pictures: `w3/o05-phone-upchit-answer-buttons-close-up.png`,
   `w3/o05-phone-clash-answer-buttons-close-up.png`. **Recommended: the same fix, in the next small batch.**
5. **The Leave War's top row on a desktop gained nothing; on a phone the open clash list pushes the grid down** — with
   two clashes open the grid starts 250 down an 844-tall screen (125 with none), with four 344. As drawn and approved
   (D827); said here so the look on his iPhone has the figure beside it. No answer needed unless it bothers him.

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
| The OIL question | has it — W3 X1 both sizes; `dl-oil.mjs` | has it — W3 T1 (opens on its first answer; ✕ last; Shift+Tab from the first goes to it); `oilconfirm-look.test.tsx` | — |
| The upchit question | has it — W3 X5 both sizes | has it — W3 T1 on X5 | — (its answers still wear the stray strip — §0, question 4) |
| The medical-clash question | has it — W3 X6 both sizes | has it — W3 T1 on X6 | — (the same strip — §0, question 4) |
| "No medical document" | has it — W3 X4 both sizes | has it — W3 T1 on X4 | — |
| The board's cancel-reason dialog | has it — W3 X9 both sizes | has it — W3 T1 on X9: ✕ last, Shift+Tab to it, Tab never leaves; it opens in its reason box (a box to type in), and its chips wear the browser's ring — filed (§9, find 5) | — |
| The board's "Sort all" | has it — W3 X10 both sizes | has it — W3 T1 on X10 | — |
| An input's own window | has it — W3 X2, X3 both sizes (the movable window: its own head, not this rule's — unchanged by the batch) | must not — not a question sheet; its keys are its own, as built | the title; a cancelled input's CX mark — by the ✕, not by the title, as built on 12 Oct (§0, question 3) |
| The document viewer | has it — W3 X7 both sizes | must not — as above | — |
| "Jump to a date" | has it — W3 X8 both sizes (the Today icon 6 left of the ✕) | must not — as above | the Today icon, left of the ✕ |
| A day's pop-up on the week | has it — W3 X11 both sizes | must not — as above | — |
| The Traffic window | has it by the one shared rule — NOT WALKED: no walker opened it (the day's pop-up, drawn by the same file with the same head, was — X11) | must not — as above | — |

### 2c. The OIL question (`OilConfirm`) — every caller

| Who opens it | Words of record | Flat answers, outline when picked | Its two buttons | First answer has the keyboard |
|---|---|---|---|---|
| A new input's own save (an input's window) | has it — `dl-oil.mjs` both sizes; `oilconfirm-look.test.tsx` | has it — `dl-oil.mjs` (flat row, the outline look, one ring — D842) | Back / Add — `dl-oil.mjs`; W3 X1 | has it — `dl-oil.mjs`; W3 T1 |
| A change's save (an input's window) | has it — W3 O2 both sizes | has it — one component | Back / Save — W3 O2 | has it — one component (`oilconfirm-look.test.tsx` K7) |
| A question raised from the input's row on the schedule (the window shuts with it) | has it — one component; NOT WALKED by this route (its words and buttons are the change's save's, above) | has it — one component | Back / Save — `oilconfirm.test.tsx` | has it — one component |
| The desktop Inputs list's "OIL?" chip | has it — W3 O3 (desktop — the chip is the desktop list's) | has it — one component | Back / Save — W3 O3 | has it — one component |
| A swap, an add, a move, a put-back, a filing that waits (5 kinds) | has it — `dl-oil.mjs` (the swap), W3 B1 / B4 (the move), `e2e/oilwait.spec.ts` (the swap; the three put-backs) | has it — `dl-oil.mjs`; `e2e/oilwait.spec.ts` (D842) | its own pair ("Don't swap / Swap" …) — unchanged; `e2e/oilwait.spec.ts` | has it — `dl-oil.mjs` |
| The several-days form (any caller) | must not — its words were not on the page he approved (D808) | has it — W3 O1 both sizes (three flat answers, the picked one outlined) | as its caller — W3 O1 | has it — on "All days": `oilconfirm-look.test.tsx` K7 |
| The day's one list of OIL questions (not this sheet — its own buttons) | must not — its words are its own | has it — a picked Yes and a picked No both outline (D830's L5; it replaces D783's grey No) | — | — |

### 2d. The bar that waits on an OIL answer

| Where it can be up | The band, one line | Keyboard goes to it; Escape closes it | With "Not saved" too |
|---|---|---|---|
| Edit Schedule's week (the top bar) | has it — `dl-oil.mjs` both sizes, in wider letters too | has it — `dl-oil.mjs`; a held Escape's repeat does not close it (the read's R2 — `oilconfirm-look.test.tsx`) | has it — `dl-band-built.mjs`: "Not saved" above, both 36 tall, the amber line (D841) |
| The Scheduler Board (its own bar) | has it — `dl-oil.mjs`; `e2e/oilwait.spec.ts` at three sizes | has it — `dl-oil.mjs` | has it — `dl-band-built.mjs` (the two touching, no gap) |
| The Inputs page — the calendar's drag, an input's Accept / → Unavail (the top bar) | has it — W3 B1 (a real drag on the calendar, both sizes), B2 (390, 360 and 320 wide: one line, nothing cut) | has it — W3 B3 | has it by the one top bar — NOT WALKED on this page (the same bar as Edit Schedule's, walked there) |
| The Medical view opened full | must not, because no screen opens the Medical view full today — it is a tab of the Inputs page (D620, D626), covered by the row above (the fresh read; the band's line in that view is unreachable code, left in place beside the save warning's) | — | — |
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
| A tap on the phone's clash line | a `<button>` in the note | nothing — a real button in the page's flow | walked — W1 C6, C7; `dl-clash-built.mjs` |
| A tap on a clash row / the desktop's instruction | `goClash` → the store's `focusDay(date, { open })`, taken ONCE by the grid; or `openInputWindow` | the grid's own jump (the under-manned list uses the same call without `open`); a later draw of the grid | walked — W1 C2 to C5, C11; tested — `clashwayout.test.tsx` (taken once; a plain jump to the same day drops it — rewritten after the read's R4, red with the drop cut) |
| Home, End, Shift+Page on the calendar's dates | the calendar's own `onKey`, on the dates only | the form the calendar sits in (Admin → Data); the window behind a floating one | walked — `dl-cal.mjs`; tested — `datecal.test.tsx` |
| Enter on the calendar's title, and in a list | the title's click (a key's); the list's `onKey` | a form's submit; **and the browser's own scrolling of a list by End, Home, Page and Space — it was heard, and chose a year sixty on (§9, find 6): fixed** | walked — `dl-cal.mjs`; tested — `datecal.test.tsx` |
| Delete / Backspace on a Tracker date box | the box's row, stopped there | the Tracker's page-wide Delete (it deletes what is selected on a chart being arranged) | walked — `dl-trk.mjs`; tested — `leftovers.test.tsx` K12 |
| Escape on the bar | the bar's own element — never the page | whatever the keyboard is on when it is NOT on the bar: a window, a text box, the schedule's Escape | whatever the keyboard is on when it is NOT on the bar: a window, a text box, the schedule's Escape; **and the REPEATS of the Escape that closed the question (the read's R2): fixed** | walked — W3 B3, `dl-oil.mjs`; tested — `oilconfirm-look.test.tsx` |
| Tab inside a question sheet | the sheets' one document listener (it existed) — now it also steps round the ✕ | the schedule's own Tab route, a page's handler: it already ran before them | walked — W3 T1 on six sheets; tested — `oilconfirm-look.test.tsx`, `outside.test.tsx` |

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
4. **The walk chosen.** The host first: seven scripts written as assertions of the right behaviour, a phone and a
   desktop each, a picture at every step (`dl-clash-built`, `dl-oil`, `dl-band-built`, `dl-cal`, `dl-trk`, `dl-notes-built`, `dl-keys`
   — 151 lines). Then THREE Sonnet walkers on the one frozen build, each its own worlds, 49 scenarios by the
   screen's own controls: W1 the clash note (12), W2 the notes by the gesture that raises each (21), W3 the eleven
   heads, the question sheets, the OIL question's other forms, the band and the calendar card's name (16). Sizes: a
   phone (390) and a desktop (1440), with 360, 430 / 431 and 320 where a width is the point. No short screen: nothing
   here is a viewport-tall column. **Sized up from the two helpers first told to him**, because the notes alone are
   seventeen gestures. Carried by a test, not walked: §8.
5. **Its row in the ledger:** `docs/walk-ledger.md`, 14 Oct 26.

## 5. The host's own walk — the scripts, as assertions

Run on the served build (4173), a phone (390 × 844, a finger) and a desktop (1440 × 900), each line `works` or
`FAIL — what was seen`, a picture at every step: `DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/<script> [phone|desk]`.
The key record of every line: `docs/img/handpass/2026-10-14-three-builds/keyboard.json`.

| Script | What it asserts | Lines, phone / desktop |
|---|---|---|
| `dl-clash-built.mjs` | the clash note: where it sits, one clash open and several closed, the row's words, the two lines above untouched, the columns in line, every row one shape, the names' column sized by the roster, no inner scroll, nothing over a row, wider letters, a tap opens the day for the person, Hide, his choice kept, a member sees none; the desktop's strip, its words, the instruction by keyboard | 19 / 5 |
| `dl-oil.mjs` | the OIL question at a new input's save and before a swap: Back / Add, the words of record, flat answers, the ✕ in the corner, the first answer has the keyboard, ✕ last, the app's ring, the picked outline look; the bar on the board and on Edit Schedule as a band, one line, in wider letters too, nothing under it, by keyboard, OK | 14 / 26 |
| `dl-band-built.mjs` | both bars at once, on real storage: "Not saved" above, both 36 tall and touching, the line under them amber; "Not saved" alone amber too; with no bar, Edit Schedule's cyan edge back | 4 / 4 |
| `dl-cal.mjs` | the date calendar: the phone card's name, the ring a keyboard's only, the four keys to their exact dates, the lists' ring and Enter, a date that cannot be picked faint and plain (today's disc kept), the faint dates' strength, a run's weekend dates and its sentence | 9 / 24 |
| `dl-trk.mjs` | the Tracker's boxes: no day after today on the five kinds that refuse one, Upchit still takes tomorrow, a date dim until a mark carries it, one width on a desktop, Delete and Backspace, the Tracker's own Delete not fired | 17 / 16 |
| `dl-notes-built.mjs` | the publish note he pictured (N1), raised by the screen's own four names and "Publish day" on a Saturday with men who earn and a man on a Common Programme row with no times: the words to the letter, the day named once with its date; on a phone 12 from each edge and two lines | 3 / 2 |
| `dl-keys.mjs` | records only — the two keyboard jobs NOT in this batch (`[KBD-PUCK]`, `[TRK-KBD-CHART]`), written OPEN, never judged | 0 / 8 OPEN |

**Result of the host's runs on the final build (rebuilt after the walkers, all seven scripts run again at both sizes): 151 lines — 143 `works`, 8 OPEN (the two filed jobs), none failing; no page error in any run.**
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
| N24 — "An ALL AVAIL input can only be changed in its own window…" | `src/ui/placeholderdoors.test.tsx`, `src/ui/noteswords.test.ts` | the door called directly: it is said only for a drop on an Unavailable row, where an ALL AVAIL input can never be filed — a guard no screen gesture reaches today (§9, find 4) |
| N4 — the warning before an Unpublish whose OIL is already spent on the Leave War | `src/ui/unpublish-button.test.tsx`, `src/ui/noteswords.test.ts` | the real button pressed twice; the walk did not make a man with that day's OIL spent |
| N12 — the sentence on a man's puck under the day's switch | `src/ui/noteswords.test.ts` | the words only: that puck is not a control there, so no tap raises it (§0, question 1) |
| A picked answer with the keyboard on it shows one ring (D842) | `e2e/oilwait.spec.ts` (the swap that waits) | a real screen: Space on "Yes", the ring read; red with the rule cut and the build remade |
| The calendar's lists keep End, Home, Page and Space from the browser | `src/ui/datecal.test.tsx` | the cause (the key is taken); what it prevents — a year sixty years on — is `dl-cal.mjs`'s line, on the page |

## 9. What the walk found, and each disposition

1. **The phone's clash line stood 46 tall instead of 30** (the host's first run, 14 Oct). Its Show / Hide wore the class
   `go`; the schedule's one global stylesheet already owns `.go` (a wave: a margin and a border), and reached it.
   **Fixed:** every part of the note wears a name of its own (`clash-…`). Pinned by `src/leavewar/clashwayout.test.tsx`
   "every part of the note wears a name of its own" (it lists the bare names it finds — red on the first cut) and by
   `e2e/leavewar.spec.ts` (the line no taller than 34 on a real screen). The script's own line then passed.
2. **"Double blue ring" — his own find, from a picture of the built OIL question (14 Oct, D842).** An answer picked by
   keyboard wore the picked look's cyan edge and, a little off it, the keyboard's cyan ring. **Fixed:** on a picked
   answer the keyboard's ring is drawn on the answer's own edge (`14-input-editors.css`). Pinned on a real screen by
   `e2e/oilwait.spec.ts` (the swap that waits: Space on "Yes", then the ring read) and by `dl-oil.mjs`'s own line.
3. **W1 — the clash note: 12 scenarios, 12 PASS** (`parts/2026-10-14-three-builds-w1.md`; the host opened its pictures
   for C2, C5 and C8). Its "seen in passing", each judged by the host:
   - `earns *HO` for three men and `earns HO*` for a fourth — NOT a fault: the star's side is the half of the day
     (`*HO` the morning, `HO*` the afternoon — `leavewar/sync.ts notationOf`), the clash strip's notation since before
     this batch; the sentence prints the code it is handed.
   - On a phone a passing note lies over the lower part of an open Leave War day sheet for its three seconds — older
     behaviour, wider now (D828). Put to him with N-TOP below (§0, question 2).
   - "Fable is recorded as working 08:00–18:00 on 18 Jul — this LL is filed anyway and flagged for someone to resolve"
     keeps its dash: it is not one of the 33 notes of 13 Oct 26. Filed for the whole-app words pass (D808).
   - a publish note still on screen in one picture: the script's (it read before the note had gone), not the app's.
4. **W2 — the passing notes: 32 rows, 28 PASS, 2 FAIL, 1 NOT WALKED, 1 for the host**
   (`parts/2026-10-14-three-builds-w2.md`). Each FAIL was taken to the code before it was believed:
   - **N12 "FAIL" — NOT a fault of this build; a question for him (§0, question 1).** The sentence he approved
     ("Nothing on this day earns. Turn that off first.") is on a man's puck under the day's switch — and since
     21 Sep 26 that puck is not a control there (it is drawn inert, on purpose: `ui/oilmode.ts`), so no tap raises it.
     What a tap DOES raise is the same sentence on the ITEM's own switch and in the ALL AVAIL window — two copies the
     words of record list as "not on his list, never changed unasked", so they keep "— turn that off first". The build
     did what the list said; the result is that the wording he approved is the one he cannot see.
   - **N24 "FAIL" — NOT a fault; the walker's brief guessed the gesture.** The three things the walker did are each
     as ruled: a man dropped on an ALL AVAIL input's row joins it (D755, D757), ALL AVAIL then comes off it (D734),
     and ALL AVAIL alone is refused with N27's new words. N24's own sentence is said by ONE door — a drop on an
     Unavailable row — and an ALL AVAIL input can never be filed under Unavailable (the save refuses it), so the
     sentence is a guard no screen gesture reaches today. Carried by `src/ui/placeholderdoors.test.tsx` (the door
     called) and `src/ui/noteswords.test.ts` (the words). Added to §8.
   - **N1b (for the host) — walked by the host, WORKS.** The seed Saturday's Common Programme holds no row, so the app
     rightly had no OIL sentence to add. `scripts/handpass/dl-notes-built.mjs` makes the day he pictured (two men on a timed
     ground row, one on a Common Programme row with no times — a fixture) and publishes it by the screen's own four
     names and "Publish day": the note reads `Saturday 18 Jul published and approved. The Common Programme has no
     usable times, so nobody on it earns OIL.` — on a phone two lines, 12 from each edge (picture
     `note-phone-1-published-with-oil-line.png`, opened); the same words on a desktop. The first two runs failed for the
     script's own reason (it put the man on a row that was not there) — written here as the script's.
   - **N4 NOT WALKED** — the warning before an Unpublish needs a man whose OIL from that day is already spent on the
     Leave War. Carried by `src/ui/unpublish-button.test.tsx` (the real button, pressed twice) and
     `src/ui/noteswords.test.ts`. Said in §10.
   - Its "seen in passing": on a phone a note raised while a window is up goes to the TOP and, full width now, lies
     over the window's title and ✕ for its three seconds (picture `w2/ntop-phone-note-with-window-up.png`, opened) —
     a ripple of D828, put to him (§0, question 2). On a desktop a two-line note's words are left-aligned — the
     desktop's note is unchanged by this batch (D828); filed for D808. The brief named a `clearToast` helper the
     build does not have — the brief's mistake; the walker waited for the note to fade instead.
5. **W3 — the eleven window heads, the question sheets, the OIL question's other forms, the bar, the calendar card's
   name: 100 rows — 92 PASS, 4 FAIL, 4 records** (`parts/2026-10-14-three-builds-w3.md`; the host opened its pictures
   for X3 and X9). Each FAIL was taken to the code before it was believed:
   - **X3 "FAIL" (both sizes) — NOT this batch's; put to him.** In a cancelled input's own window the red CX tag and
     its reason stand at the right of the head, just before the ✕, with empty head between the title and them (158
     wide on a desktop, 70 on a phone). That window is the app's movable one, and the tag is handed to it as one of the
     head's tools — which the window draws at the right. Neither that window nor its head's rules are in this batch's
     difference (`git diff bfaa68489 --stat -- src/ui/FloatWindow.tsx` is empty; the stylesheet rules this batch
     changed are the small sheets' ✕ and the offer's buttons). The brief's expectation ("beside the title") was
     written from D771's words; how it was built on 12 Oct is this. A small question for him (§0, question 3).
   - **X9 "FAIL" × 2 (the board's "Cancel this item" sheet, desktop) — one is the brief's, one is filed.** (a) It opens
     with the keyboard in its reason box, not on the sheet: right — it is a box to type in, and the brief's "on the
     sheet itself" was written for the question sheets. (b) Its reason chips (WX, OPS, LOGS) and "Edit" show the
     browser's own white ring, not the app's cyan one: true, and the same kind of gap as K10 — but K10's list is the
     OIL answers, the small sheets' ✕ and the offer's buttons, and these chips are not on it. Filed, not fixed.
   - Its records (O5): the upchit question's and the medical-clash question's answers still sit on the stray darker
     strip with a line under it — the very fault L1 took off the OIL question. Not on his list of 13 Oct; put to him
     with the close-ups (§0, question 4).
   - Its "seen in passing": a note said to stay 25 seconds — NOT reproduced: the host timed it on the same build
     ("Schedule updated" after the board's Done: gone 2.8 seconds on, as written); the walker's script read it about
     three seconds after the press. A two-day Duty whose end time changed saved with no OIL question — as built before
     this batch (the question returns when the credit changes); not judged here. "Answer OIL" shows no ring when the
     bar arrives after a MOUSE drag and does after a Tab — the browser's rule for a ring, as on every button.
6. **The calendar's month-and-year lists: End chose a year sixty years on; Page Down and Space six (the host's
   re-walk, 14 Oct — older than this batch, in the keys this batch covers).** `dl-cal.mjs` failed one run in four on
   "Enter in a list": the year list had gone to 2086. Cause: a list is a scrolling box that holds the keyboard, and
   the browser scrolls it for Home, End, Page Up, Page Down and Space unless the key is taken — and a row left in the
   band when the scrolling stops is the choice. The unit test asked for exactly the wrong thing ("the key is not
   taken"); the walk's script read the year 450ms after the key, before a 750ms scroll had settled, so "nothing
   moved" was true of every reading and false of the app. **Fixed, red first:** the list keeps those keys from the
   browser (`src/ui/DateCal.tsx`); `src/ui/datecal.test.tsx` pins that (it failed first); the script now reads 1.3
   seconds after each key and adds Page Down, Space and Home — it FAILED on the build as walked (End 2086, Page Down
   2092, Space 2098) and passes on the rebuilt one: desktop 24 lines, phone 9, all `works`.
7. **The new browser test for D842 passed with its rule cut — the first time.** The browser tests reuse a preview
   already serving on their port, and one was (the walk's): the cut never reached the build they ran on. Cut again
   WITH a rebuild: red ("offset 2px", wanted "-1px"); rule put back, rebuilt: green. A break test of a stylesheet rule
   needs its own build — written into the skill notes.
8. **The fresh, blind Opus read of the finished code (D790) — 4 findings: 1 wrong result, 1 misleading, 2 untidy**
   (`docs/superpowers/briefs/2026-10-14-three-builds-read.md`; read at the commit of the walk's results — the two
   wording commits that followed, D843 to D845, it read too and found nothing against). Each applied from its own
   words, test first:
   - **R1 (wrong result) — a second test file with a date about to come due.** `src/ui/sharedline.test.tsx` read the
     real clock against fixtures dated 14, 17 and 20 Oct: six of its tests would have failed from 15 Oct, on every
     branch — the fault `placeholderlist.test.tsx` had on the 14th. The reader proved it by running the file with the
     clock moved on. **Fixed:** the day is held at 14 Oct 26 in that file, as in the other. Older than this batch.
   - **R2 (misleading) — Escape held a moment too long took the question AND the bar.** Escape closes the question; the
     bar comes up with the keyboard on "Answer OIL" (this batch's K8) — so the key's own repeats landed on the bar,
     and the first closed it (this batch's K9): nothing left saying the swap was not made (D783). **Fixed:** a repeat
     is not a press on the bar (`ui/OilWaitSheet.tsx`); `oilconfirm-look.test.tsx` — red first.
   - **R3 (untidy) — his Show / Hide outlived the note it was about.** The Leave War's top row stays drawn for the
     whole sign-in and the choice was never forgotten, so after one Hide the next lone clash started closed (D827:
     one starts open). **Fixed:** the choice is forgotten when the last clash goes (`leavewar/ui/Chrome.tsx`);
     `clashwayout.test.tsx` — red first (the line read "Show").
   - **R4 (untidy) — a test that could not fail.** "An ordinary jump afterwards drops an 'open' nobody took up"
     asserted inside an `if`, about a different day. **Rewritten** to ask for the same day; with the drop cut from the
     store it goes red (cut by hand, restored; now wire 32 of the list).
   - **A row with no code behind it:** §2d's "The Medical view opened full" — no screen opens it full today. The row
     now says so.
   - **Its recommendation taken:** the whole unit suite run once with the clock moved on 20 days and once 200, to
     answer "does any other file share R1's fault" for every file — §11.
   **Break tests after the read: five more wires (32 to 36 — the four fixes above with a line to cut, and the
   refusal under the day's switch said from the event's mark).**

9. **His look at the picture page (14 Oct, after the check had closed) — two texts on the OIL question circled: "These
   are the examples of things u can delete and they are self explanatory" (D846).** The small print under the answers
   and "Choose an option above" are gone from every form of the question (`ui/OilConfirm.tsx`; the unused style rule
   with them). Test first (`oilconfirm-look.test.tsx` — red: the small print was there): one day, several days, a
   change that waits; the waiting button still cannot be pressed. On the rebuilt build: `e2e/oilwait.spec.ts` 12 of
   12; `dl-oil.mjs` phone 14 and desktop 26 lines, all `works` (its line on the small print now asserts there is
   none); picture `oil-phone-0-question-at-a-save.png`, opened — the foot is its two buttons. NOT re-run after this
   change: the whole gate set on his PC (the change is two deleted texts in one component; GitHub's checks run the
   whole set on the push). The design guide's §1 and §8 and its short form carry the rule, read by one fresh Opus
   reader before he approves the wording (D70, D810); the same hint on the upchit and medical-clash questions is
   filed as a delete candidate, not deleted (`[BATCH-14OCT-LEFTOVERS]`).

10a. **The rule's first use on text he had not circled (D847 — the rule's wording approved; D848 — "Delete all three but for this
   one is there a way to make it known that each day holds 1 status").** Shown two marked pictures, he had the hint
   deleted from the upchit question and from the medical-clash question, and that question's small print with it; the
   fact he wanted kept is the sheet's heading ("A day holds one status: choose who holds these days"). Tests first
   (`upconfirm.test.tsx`, `medmove.test.tsx` — both red: the hint was there). On the rebuilt build,
   `scripts/handpass/dl-sheets.mjs` reaches both sheets by the screen's own controls (the walker W3's fixture) and
   asserts each: the foot is its two buttons, no hint, no small print, the main button still waits, the heading's words
   — phone and desktop, all `works`; pictures `sheet-phone-1-medical-clash.png`, `sheet-phone-2-upchit.png`, opened.
   The whole gate set was not re-run locally (three deleted texts and one heading in two sheets); GitHub's run on the
   push covers it.

## 10. Break tests, errors seen, what was not walked

**Break tests — `scripts/handpass/breaks/2026-10-14-three-builds.json`, 31 wires, each cut once
(`node scripts/handpass/breaks.mjs scripts/handpass/breaks/2026-10-14-three-builds.json`): 31 of 31 go red.**

| Wires | The surface | Result |
|---|---|---|
| 1–9 | the clash note: one clash starts open; the Inputs window; the person asked for; the ask taken once; the grid opens the day; a clash in another period; "published"; a member sees none; a clash carries its period | 9 CAUGHT (`clashwayout.test.tsx`, `clashperiod.test.tsx`, `oilsync.test.ts`) |
| 10–16 | the OIL question: the first answer has the keyboard; the ✕ last; Back; Add at a new input's save; the outline look; the one list's No; the one-day sentence | 7 CAUGHT — 12 and 13 BY HAND (the runner could not read the run: the failure's printout is longer than it holds; cut by hand, `oilconfirm.test.tsx` and `oilconfirm-look.test.tsx` went red, the lines put back and `git diff` clean) |
| 17–20 | the bar: the keyboard goes to it; Escape; the top bar's copy stands down; the top bar makes room | 4 CAUGHT — **20 was NOT caught the first time: nothing watched the class that makes the top bar's room.** A test was written (`oilwait.test.tsx`: the board closed with the bar up — the top bar carries it and says so) and the break run again: caught |
| 21–22 | the passing note: a phone's width; two notes of one day said once | 2 CAUGHT |
| 23–28 | the calendar: the last date; Home; Shift+Page; Enter in a list; the phone card's name; Until's card | 6 CAUGHT |
| 29–31 | the Tracker: a failures-list row; Delete; the dim date | 3 CAUGHT |

**What a break here cannot reach** (a stylesheet's rule — the test world lays nothing out): the ✕ in the corner, the
band's one line and its stacking, the amber line, the clash list's columns. Those are asserted on the built screen by
`e2e/leavewar.spec.ts`, `e2e/oilwait.spec.ts` (in the gates) and by the walk's scripts; the calendar's and the Tracker
boxes' rules are read as contracts by `src/ui/datecal-look.test.ts`.

**Errors seen.** No page error and no failed request in any of the host's runs (each script ends on that line) or in any walker's (each share says so). The first full gate run failed three unit files and nothing else — `oilconfirm.test.tsx` (old words, re-expressed), `clashwayout.test.tsx` (one page-level test timing out under the run's load; merged into one, sixty seconds allowed) and `placeholderlist.test.tsx` (thirteen tests; a date that had come due on 14 Oct — it fails the same on the commit the branch was cut at; the date is now held).

**Not walked, and why.** N4 and N24 by their gestures (§8). W3's O3 on a phone (the brief asked for a desktop). A clash in a second leave period (a published weekend in another year — §8). His iPhone itself: every phone figure here is a Windows browser at a phone's size, which draws narrower letters than Apple's — the bar is made to fit wider ones (`dl-oil.mjs` widens the letters and asserts one line still), but the three things to SEE on his iPhone are his look (§11). Not in this batch at all: a puck by keyboard, the Tracker's chart by keyboard (the 8 OPEN lines).

## 11. The gates, and the look card

**The gates — the whole set under the PC lock, in order, nothing else running (`node scripts/gatelock.mjs run`).**

| Run | Unit | Build | The original's assertions | Browser tests | The Tracker's suite | Rule check | Documents |
|---|---|---|---|---|---|---|---|
| 1 — before the walk (the batch as first built) | FAIL in three files, every other file green: old words in `oilconfirm.test.tsx`; a page-level test timing out in `clashwayout.test.tsx`; thirteen tests of `placeholderlist.test.tsx` whose date had come due (the same on the commit the branch was cut at) — all three put right | clean | 728 / 0 | 803 passed, 0 failed, 59 skipped | PASS | OK | OK |
| 2 — the final run, on the tree with every fix of the walk and the read (committed straight after, unchanged) | **11310 / 11310 (637 files)** | clean | **728 / 0** | **802 passed, 1 failed, 59 skipped** — the one failure is the Leave War's Required-panel test at a phone's size, at its month-button step: the test already filed as unsteady (`[LW-REQ-PICK-MONTH-UNSTEADY]`, 8 Oct 26 — nothing of this batch is on its path); run alone straight after, 3 of 3 | **446 / 0** | OK | OK |

**The unit suite with the clock moved on (the read's recommendation — does any other file read the real clock against a
date that will pass?):** with the clock 20 days on, 11310 / 11310 (637 files) — nothing else is about to come due; with it 200 days on (May 2027), 11307 / 11310 — three tests of `src/ui/inputs.test.tsx` fail ("the date window › opens on today…", "…keeps a span that began before today…", "a new input announces itself › rides the top row…"): a longer fuse of the same fault, filed in `[BATCH-14OCT-LEFTOVERS]` (e), not fixed here.

Perf and the adapted probes were not run: nothing on the dense week, the board's rows or the Leave War's grid is drawn
differently (the clash note is chrome above the grid; the band is the top bar's).

**Walk:** tier WALK — the host's seven scripts (151 lines: 143 works, 8 OPEN records of two filed jobs, 0 failing) on
a phone 390×844 and a desktop 1440×900, then three Sonnet walkers on the frozen build (W1 12 / 12; W2 28 of 32; W3
92 of 96 judged — each FAIL taken to the code, none a fault of the build), a re-walk of all seven scripts on the
rebuilt build and of the two reworded notes; pictures in `docs/img/handpass/2026-10-14-three-builds/` (the host's, and
`w1/`, `w2/`, `w3/`), the ones cited in §0 and §9 opened. 36 break tests. One fresh Opus read: four findings, applied.

**The look card — for him, on his iPhone (the preview link; sign in as usual). Three things, about five minutes.**

1. **The Leave War's clash list.** Open the Leave War. If the amber line "⚠ 1 clash with the schedule" (or "N
   clashes…") is there, it is one slim line under the two rows of buttons — not a box squeezed at the right. Tap
   it: the list opens in place, each clash two lines (who · the day · what to do, then why). Tap a clash: that day
   opens for that person. Tap the line again: it closes. *If no clash shows, the demo has none today — a weekend day
   published with someone working it who also holds a leave bid makes one.*
2. **A passing note, the full width.** On Edit Schedule publish any day (the four names, then "Publish day"): the
   note at the foot runs nearly edge to edge, one or two lines — not a narrow five-line box in the middle.
3. **The OIL bar under the top bar.** On the Inputs calendar open a Saturday, add a Training input for one man with
   times (the OIL question comes: answer Yes, then Add). Now press and drag that input's bar to the Sunday beside it:
   the OIL question comes again — press "Don't move". The amber bar "Not moved — OIL not answered · Answer OIL ·
   OK" sits under the top bar, ON ONE LINE, and nothing is covered at the foot. "Answer OIL" brings the question
   back; "OK" closes the bar. *What to tell me: whether its words look cramped or small on your phone — Apple's
   letters are wider than the ones it was measured in, and it shrinks them a little to stay on one line. (The walk
   raised it this way with a mouse at a phone's size; if the drag is awkward under a finger, say so — that is worth
   knowing too.)*

**What is NOT evidence here:** his iPhone itself (every phone figure is a Windows browser at a phone's size); a ChatGPT
read (the job is on `[NO-ASTRA-LIST]`).
