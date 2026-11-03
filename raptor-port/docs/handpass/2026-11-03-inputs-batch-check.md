# The Inputs batch [INPUTS-FIXES-1103] — its FULL bug check, 3 Nov 26

**What:** the bug check of pull request 625 (`claude/inputs-small-fixes-2`, head `8b09ddfcf`): F1–F10 of the re-check
(`2026-11-03-inputs-seen-recheck.md`), his answers D1578, D1581–D1583, D1585, the LATE drop saved for everyone (D1586),
Make public saved with the note (D1588, D1592), and the React Doctor ride ([DOCTOR-INPUTS-RIDE]). Host: Opus 5.5 (a chat
that did not build the batch, handed it by `HANDOFF.md`). Readers: a fresh Opus scenario designer and a fresh, blind Opus
code reader (D790, D1594 — the ChatGPT readers are out; the job is on `[NO-ASTRA-LIST]`). Pictures:
`docs/img/handpass/2026-11-03-inputs-batch-check/`.

## 1. The eight questions and the tier

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money (OIL counts) | YES | D1578 is walked here (OIL of a weekend saved before its year had a period); the input window's save (F1) rewrote the branch beside the OIL-answer-only save |
| 2 | The published record | YES | Make public is now day content that rides the issued copy and the next amendment (D1592); "To go out" words (F4); the LATE drop reaches the issued face |
| 3 | Saved data | YES | two new stored fields: an input's `lateOff` (D1586), a day's `npub` (D1588) — each written by its own command |
| 4 | A shared drawer | YES | the LATE mark is drawn by five builders (the board's live rows, the read-only board, the edit week, View-only Sched, the promoted ground row); a section note by two (the week's, the board's) |
| 5 | A new gesture or mode | YES | Escape's new manners (F2, F6, F7, D1581); the input calendar's second tap (F3) |
| 6 | A new surface | YES | the input window's "unsaved changes" question on Escape (F2) |
| 7 | Roles | YES | `inputs.lateOff` and `sched.notePub` are scheduler-only commands; the member's own-input note in §11 gained "its LATE mark dropped" |
| 8 | The warning list | NO | the LATE mark is a mark, never a warning (`validate()` untouched); no rule's reading changed |

**Tier: FULL.** The server question (§5) — carried by `perms.test.ts` / `perms-scan.test.ts`; §11's row for `Input` changed
(the own-row note names `lateMarkDropped`, D1586).

## 2. The rulings swept

Each read in its full row (`.claude/decisions-full/`). None of the batch's rulings contradicts another; the two that
narrow older ones say so in their rows (D1586 narrows the 21 Aug 26 "session-only" LATE entry; D1588 the Aug 26
session-only note flag; D1592 answers D1588's open point).

| Ruling | What it asks of the running app | Walked at |
|---|---|---|
| D1586 | a LATE mark a scheduler drops is gone for everyone, across reload, sign-out and week change; a tap on the dim chip brings it back for everyone; the Inputs page keeps printing it | roll-call A |
| D1588, D1592 | Make public saved with the note and shared; on a published day it waits for the next amendment, View-only showing the note as the day went out | roll-call B |
| D1578, D1585, D19 | a weekend no period covers asks and saves its OIL answer, says nothing of the period on the Inputs page; once a period holding it exists the OIL shows on the Leave War, his OIL count and OIL earned | roll-call N |
| D1581 | Escape while a bar is carried on the Inputs calendar puts it back, whatever follows | roll-call G |
| D1582 | Undo / Redo name the input by person and kind, several by count | roll-call L |
| D1583 | (a) left as built; (b) the SANS Highlight list fits the screen and scrolls inside itself | roll-call M |
| D641 | the Inputs pages' windows leave the page behind working; they close by ✕, Escape or their finishing button | roll-call D, G |
| D792 | Delete in an input's own window deletes at once and asks nothing (the day's "Delete this input?" is the day's own question) | roll-call G |
| D77 | no resize corner on the phone's ALL AVAIL window | roll-call K |
| D45, D103, D178 | anything waiting on a published day reads pending and wipes the four sign-offs | roll-call B, F |
| D1557 | the plain-user round | §7 |

## 3. The roll-call

One row per place the app draws or reads each thing the batch touched. "Must" is what the rulings ask; "Proof" is the
walk step or the named test that carries it (§8 says which); "Seen" is filled by the walk.

**A — the LATE mark (D1586).** Drawn through `ui/html.ts lateTag / lateChip / lateRowCls`, all reading `state/view.ts lateShown`.

| # | Place | Must | Proof | Seen |
|---|---|---|---|---|
| A1 | Scheduler Board, Personal Inputs live row (its LATE chip) | tap drops it for everyone (dim chip), tap again brings it back | walk | |
| A2 | Scheduler Board, Unavailable live row | the same | walk | |
| A3 | Edit Schedule's week (Personal Inputs, Unavailable) | badge gone while dropped | walk | |
| A4 | View-only Sched — a day not published, and a published day's issued face | badge gone while dropped (the issued face reads the live mark by id) | walk | |
| A5 | The board's promoted Ground Programme row of a late input | its amber row edge gone while dropped | walk | |
| A6 | The Inputs page — list, calendar card, the SANS calendar | keeps printing LATE (paperwork record) | walk | |
| A7 | A second person — a member (`us`) and another session | sees it dropped; a member's tap on the chip is refused | walk | |
| A8 | Reload, sign-out and in, week change and back | stays dropped | walk | |
| A9 | Undo / Redo | one step, named "a LATE mark" | walk | |
| A10 | The change history | one line "… · LATE mark", hidden ↔ shown, who | walk | |
| A11 | A published day | nothing pending, sign-offs held (the builder's call: a mark, not a change) | walk | |
| A12 | A shared input (several people) | one tap drops it for all of its people | test `latemark.test.tsx` + walk | |

**B — Make public (D1588, D1592).** Drawn by `ui/html.ts blkNoteHTML` (the week) and `ui/board-html.ts sbNote` (the board), both reading `notePub(key, day)`.

| # | Place | Must | Proof | Seen |
|---|---|---|---|---|
| B1 | Edit Schedule's week — the Programme, Duties, Sims and Ground notes | the toggle; header "Public notes" while public | walk (one note), test for all four | |
| B2 | Scheduler Board — the same four | the same, same state as the week | walk | |
| B3 | View-only Sched, a day not published | the note shows under "Notes" when public and has words | walk | |
| B4 | View-only Sched, a published day, public chosen after it went out | shows the note as the day went out — no note — until the next amendment | walk | |
| B5 | The day's pending count, To go out, the four sign-offs (published day) | reads 1 pending, its words make sense, sign-offs fall (D103); publishing the amendment clears it and View-only then shows the note | walk | |
| B6 | Reload, sign-out, week change; a member (`us`) | stays; the member sees the same; a member cannot toggle | walk | |
| B7 | Undo / Redo | one step, named | walk | |
| B8 | The change history | says what changed | walk | |
| B9 | The next-week peek and a published version looked at (👁) | as the version drawn | RECORDED | |

**C — F1, a Save with nothing changed.** Every door of the input's own window.

| # | Door | Must | Proof | Seen |
|---|---|---|---|---|
| C1 | Inputs list (desktop row, phone card) | no stamp, no Undo step, no just-changed mark | isr A1 + walk | |
| C2 | Inputs calendar, an opened day's card | the same | walk | |
| C3 | Medical tab card | the same | walk | |
| C4 | The schedule's own pop-up (Edit Schedule / Board row) | the same | walk | |
| C5 | An Other with Goes to, an Attach with To | unchanged save closes, a changed Goes to / To saves | test `savenothing.test.tsx` | |

**D — F2, the unsaved-work question.**

| # | Where | Must | Proof | Seen |
|---|---|---|---|---|
| D1 | The input window on the Inputs page, typed words, Escape | asks; Escape again or "Keep editing" keeps it; the other button closes and loses | isr A2 + walk | |
| D2 | The same with only the people changed | asks | walk | |
| D3 | Nothing typed | closes at once | walk | |
| D4 | The schedule's own pop-up | the builder's call: no question (it closes on a tap outside) | walk, RECORDED | |
| D5 | The day window behind the input window (Inputs calendar) | one Escape closes one window | isr A2 | |

**E — F3, the input window's calendar.** Must: a second tap on the start keeps it waiting for its end. Doors: Inputs
"+ Input", an opened day's "+ Input", a saved input opened, the Medical tab's "+ Medical"; the Inputs list's date filter
keeps two taps = one day. Proof: isr A3 + walk.

**F — F4, To go out.** The changes window's To go out on a published day: an input taken off before publishing, retitled,
put back reads as put on the programme. Proof: isr A9 + test `pendlist-unseen.test.ts`.

**G — Escape.** F6 the day's "Delete this input?" (isr B4); F7 a button behind holding the keys (isr B5); D1581 a carried
bar on the Inputs calendar (isr B2); F2 (row D). The SANS calendar's carry — RECORDED.

**H — F5 and every window dragged on a phone** (the new height cap applies to every floating window moved on a phone,
not only the Calendar window): the Calendar window at 320 × 568 (isr B3); the input window and the Inputs settings,
dragged low and back, on a phone — walk.

**I — F8.** The Inputs settings and the SANS settings close on a page change, stay on a week change; opened from Logic's
rows too — isr B6 + walk.

**J — F9.** "Calendar…" from a SANS day opens to its left (isr B7); "Calendar…" from the Inputs and SANS settings
unchanged — walk.

**K — F10.** The ALL AVAIL window on a phone: no resize corner (isr A7).

**L — D1582.** Undo / Redo words after: a save in the input window, a new input, a delete, a drag on the Inputs calendar,
a batch of several, a shared input — walk.

**M — D1583 (b).** The SANS Highlight list on a phone held sideways (isr B1b).

**N — D1578.** A weekend no Leave War period covers (2029 in the demo world): file an input with OIL Yes, publish its day,
create the period on the Leave War; then the Leave War grid, his OIL count and OIL earned — walk.

**O — the React Doctor ride.** The input window from every door opens, saves, closes (§7, the plain-user round); the
Leave War's bid window's Document button (it imports the moved `DocField`) — walk.

## 4. The sizing lines (§7.0)

1. **The type of change:** G (two new saved marks, one riding the publish path and the amendment), D (the LATE mark drawn
   by five builders, a note by two), C (Escape's new manners, the input calendar's second tap, the unsaved question), E
   (a phone window's height cap, the ALL AVAIL corner, the Highlight list), B in part (the unsaved question).
2. **What only a walk could find:** whether every place that draws the two marks reads them (roll-call A, B); what the
   published day, the issued face and the sign-offs do around them; who answers Escape in each state of the window stack
   (the tests drive one listener at a time); each window on a phone at its real size after a drag; the plain-user round's
   every close. The tests already pin each fix's own rule (`savenothing`, `inputskeys`, `caldrag`, `winbeside`,
   `settings-nav`, `pendlist-unseen`, `latemark`, `notepub`, `oilsync`).
3. **What the ledger says:** Inputs batches and Escape work (types C, D, G) — the walks of 8–10 Oct 26 and 21 Oct 26 found
   most of their faults in orders of action and windows over windows (§7.11 lessons 4, 12, 19); a host-only walk of a
   saved mark (G) found its faults at the published day.
4. **The walk chosen:** the host walked the two saved marks itself (40 checks, desktop and phone, §6) and re-ran the
   re-check's two scripts (88 pictures); then **three Sonnet walkers** (D588), each in its own browser world on the one
   frozen build of `8b09ddfcf`, the gate lock held while they walk: **W1** the Escape and windows family (S01, S02, S07,
   S08, S09, S19, S21–S25, state table T1), **W2** the published day and the saved marks (S03, S04, S04b, S05, S06, S11,
   S12, S13, S15, S17, S20, S26), **W3** D1578 end to end (S10), F3's state table (S18) and the plain-user round (§7) at
   1440 × 900 and 402 × 874. Sizes beyond the two: the small phone 320 × 568 (S19), a phone on its side 844 × 390 (S24,
   S25), 2560 wide (S21). Carried by a test, not walked: F1's every field changed alone (`savenothing.test.tsx` — the
   window's fields; S12 walks four of them), F4's orders beyond two (`pendlist-unseen.test.ts`), D1582's several-input
   count (`describe` tests); each named in §8.
5. **After the walk:** its row in `docs/walk-ledger.md` — added at the close.

## 5. The scenarios (the fresh designer's) and their results

The scenario list: `docs/superpowers/briefs/2026-11-03-inputs-batch-scenarios.md` (a fresh Opus reader, D1594 — 26 ranked
scenarios, four state tables, the plain-user round, the 21 lessons mapped). Walked on the frozen build by three Sonnet
walkers, each in its own browser world, the gate lock held (17:41–18:46): **W1** (`w1/B/`, 124 pictures, scripts
`ibc-w1-*.mjs`), **W2** (`w2/A/`, scripts `ibc-w2-*.mjs`), **W3** (`w3/A/`, scripts `ibc-w3-*.mjs`); every row's
words in their `results-*.txt`. No browser error in any run. What each found is §13; the host reopened the deciding
pictures and reproduced each fault as a failing test before fixing it.
**D1578 walked end to end (W3 S10), both ways of making the period** — the schedule's "Create the 2029 period" and the
Leave War's "+ New period": a Duty filed for Drifter on Sat 10 Mar 29, OIL Yes, its question saying nothing of the period
(D1585); the Saturday kept D19's advisory; published; once the period was made his 10 Mar cell read FO*, his OIL count
4 → 5 and the tracker carried "+1 10 Mar · AUTO · Duty input"; Unpublish took it away and publishing again brought it back;
answered No, nothing was earned. PASS on every line.
**F3 (W3 S18), desktop and phone:** every cell of its state table PASS; the Inputs list's date filter keeps two taps = one
day.

## 6. The re-walk of the re-check (isr-A, isr-B on the fixed build)

The re-check's own scripts, run unchanged in their steps on the frozen build of `8b09ddfcf` (built under the lock into a
folder of its own and served from inside the test browser — `scripts/handpass/isr-serve.mjs`; `WALK_DIR`, `ISR_OUT`),
into `isr/A/` and `isr/B/` (88 pictures; values `isr/A/results-all.txt`, `isr/B/results.txt`). Compared verdict by
verdict with the first round (`2026-11-03-inputs-seen-recheck/`):

| Find | First round | This round |
|---|---|---|
| F1 (A1, 5 checks) | FAIL | PASS — no stamp, no Undo step of its own, desktop and phone |
| F2 (A2) | FAIL | PASS — Escape closes the day window only; the input window and its draft stay |
| F3 (A3) | FAIL | PASS — 14, 14 again, 16 gives 14–16, desktop and phone |
| D1582 (A6, 8 checks) | FAIL | PASS — "Undid: Drifter's …", "Hunter's …" |
| F4 (A9) | FAIL | PASS — put back reads as an addition |
| D1583 (b) (B1b) | FAIL | PASS — the Highlight list lies on the screen |
| F5 (B3) | FAIL | PASS — dragged low and back, 562 tall on a 568 screen (was 653) |
| F6 (B4) | FAIL | PASS — Escape answers the question only; the day stays, nothing deleted |
| F7 (B5a, B5b) | FAIL | PASS |
| F8 (B6, three checks) | FAIL | PASS — the Inputs and SANS settings gone on a page change |
| F9 (B7) | FAIL | PASS — the Calendar window no longer covers the SANS day's ✕ |

**Still FAIL, each read and not a finding:** A4 (×2) — the step's expected line was the recommendation he did not take; his
D1585 says the Inputs page says nothing of the missing period, which is what it saw (asked, saved, nothing said). B1a
(×6) — D1583 (a), left as built. B1c — D1584, filed for the Leave War's batch (`[LW-PAD-SHOWS-FIGURE]`). B2a — the
script's finger lifted with no rest (walk-scripts §4; first round the same). B3's last line — the last week of a
six-week month is reached by scrolling inside the window, as it is when the window first opens (the window now stays
inside the screen; F5's promise). A5's drag form — the app refused the drag on purpose ("ALL AVAIL is the last on this
input…"), so the step never had its premise; the first round the same.

**The host's own walk** of the two newly saved marks (`scripts/handpass/ibc-late.mjs`, `ibc-pub.mjs`; pictures `host/A/`,
values `host/A/results-late.txt`, `results-pub.txt`): **LATE drop 18 PASS · 0 FAIL; Make public 22 PASS · 0 FAIL; no
browser error.** Seen: the board's chip dims and the mark is saved on the input with no change stamp; Undo "a LATE mark"
and Redo; Edit Schedule and View-only one badge fewer; kept after a reload, a week away and back, a sign-out; the member
`us` sees it gone; the dim chip brings it back for everyone; on a published day nothing pending and the issued face drops
the badge at once; a finger tap on the phone board. Make public: saved on the day, "Public notes" on the week and the
board, View-only shows the note, Undo / Redo, kept after a reload and a week change, the member sees it and has no
button; on a published day 1 pending, "Not yet signed", View-only keeps the day as it went out, taken back before the
amendment leaves nothing pending, the amendment (AL1) carries it and View-only then shows it; a finger on the phone
board. **Two gaps of this walk, carried below:** the Inputs page's LATE count read 0 before and after (its list was not
on 14 Jul — no proof either way; walked again in §5), and the LATE drop's history line was not read on screen.

## 7. The plain-user round (D1557)

W3, as the member `us` then the admin, desktop and phone (`w3/A/dk-*`, `ph-*`): filed an Appointment from an opened day
(the card and bar wore the just-added mark, no note), saved it unchanged (nothing stamped), typed and pressed Escape (the
question, both answers), Undo and Redo ("Undid: Ranger's ISR brief"), closed by ✕, Cancel, Escape and the day's ✕,
made a note public on the board, published, opened the Calendar window from the settings and from a SANS day and closed it
each way, the Leave War's OIL tracker and another period, and looked again as the member (bell "Nothing new", the public
note on View-only). What it met is §13 (Q2, Q3 and three not new).

## 8. Orders walked, and cases carried by a test

Walked in the running app: the LATE drop then Undo, Redo, a reload, a week away, a sign-out, the member's look, back
(`ibc-late.mjs`); Make public then Undo, Redo, a reload, publishing, the amendment, taken back before it (`ibc-pub.mjs`);
the member's change after a scheduler's drop, a scheduler's change between (C1), the drop again then his own OML over
the leave (C2), the delete question with the settings window raised then Escape twice (C4), Make public pressed twice on
a published day (C5) (`ibc-cr.mjs`). Carried by a test (unit, the real save and commit gate): the same-day change, a
person he adds, a filer's hand-over, leaving alone never clearing the drop, a drop borrowed onto a new filing, the
asked-about input taken by Undo and brought back by Redo, the LATE chip refused on a locked week — `latemark.test.tsx`,
`latedrop-later.test.ts`, `inputskeys.test.tsx` S01b–S01d and S07b, `notepub.test.tsx`, `savenothing.test.tsx`,
`quarantine-funnel.test.ts`, `perms.test.ts`.

## 9. Break tests

Every fix of §13 was written as a failing test first and seen red on the code before it (K1–K12 on `8b09ddfcf`; the code
read's on `1c81e6d82`; the fix rounds' on `249d0e83d` and `81787b4ad`) — the red runs named in the commits.

## 10. Errors seen

No browser error, console error or failed request in any walk of this check (the walks' own counts, every script).

## 11. What was NOT walked, and why

- The LATE chip on a locked week: a week is locked only when an older version of the app published it — stored data of
  the past (D56); carried by `quarantine-funnel.test.ts`.
- A hand-made member command (a drop borrowed onto a new filing, a cleared drop with no new change): no screen can make one;
  carried by the gate's tests, and the residue filed for the security review (§13 CR-B3).
- T1-picker (the old "+ people" door): its step found no picker to open, as in the first walk; the redone T1-picker2
  (S22b) walked it — PASS.
- S22d: no tick box on the Inputs calendar page behind to hold the keys (the walk's premise).

## 12. The code read (fresh, blind Opus)

Three rounds, each a fresh Opus reader that wrote none of it, blind to the others (D790, D1594 — the ChatGPT readers are
out; the job is on [NO-ASTRA-LIST]). Brief: `docs/superpowers/briefs/2026-11-03-inputs-batch-code-read.md` (the finder
wording, the D56 exclusion).
1. **The batch** (`origin/main...1c81e6d82`): Reader A, the whole batch — 4 faults proved by a failing test (CR-A1–A4), and
   small ones (CR-A5); Reader B, D1411's security read of the member gate — 3 (CR-B1–B3). Neither saw the other's report.
2. **The fix commit `249d0e83d`** (§5 "a fix is new code"): 4 points — the same-day change (CR-R1), a person's date matched
   by place (CR-R2), a lineage read from two fields (CR-B3's residue), the question back after Undo and Redo (CR-R4).
3. **The fix commit `81787b4ad`**: 1 — the "leaving" test refused a filer's own hand-over (CR-R5), fixed by a one-line
   narrowing in `bdd056c11`; no fourth read (the fix is one guard, §5).

## 13. Findings and their dispositions

Each fixed with a test that failed on `8b09ddfcf` and passes after (the red run named), unless marked otherwise.

| # | Found by | What | Disposition |
|---|---|---|---|
| K1 | host walk B8; the designer's roll-call | Make public wrote no line in the change history — only its Undo and Redo did — so who made a note public could not be found | FIXED — `state/changelines.ts` writes "<note> · view-only, scheduler-only → public" from the command's own note (`ui/interactions.ts` passes it); `changelines.test.ts` "a note made public" (red on the old code) |
| K2 | host walk B5; W2 S03e, S06(5) | To go out on a published day struck the whole note through and wrote it again with "· public", as if rewritten | FIXED — `ui/pendlist.ts notePubWords`: "scheduler-only → shown on view-only"; where the words changed too, both said as before; `notepub.test.tsx` (red) |
| K3 | host | Undo said "making a note public" for a note made scheduler-only again | FIXED — `undo/describe.ts` reads the step's own note; `changelines.test.ts` (red) |
| K4 | the designer (code), confirmed by test | the commit gate let a member's own save set or clear a scheduler's LATE drop — §11's note says never his | FIXED — `state/perms.ts inputBreach` compares the drop with the other scheduler's marks; `latemark.test.tsx` "the commit gate…" (red). For the security read (D1411) |
| K5 | the designer; W2 S13 | Undo of a LATE drop said "a LATE mark" — D1582 names the input by person and kind | FIXED — "the LATE mark on Quill's LL" (`undo/describe.ts`); `latemark.test.tsx` "Undo's words for a LATE mark" |
| K6 | the designer S05; W2 S05a | making an EMPTY note public on a published day read 1 pending and wiped the four sign-offs for a change nobody can see ("Sim notes · earlier public") | FIXED — `engine/restore.ts dayKeys` compares the choice only while the note has words; `notepub.test.tsx` "an EMPTY note…" (red) |
| K7 | the designer S03; W2 S03f | on a published day the note after Make public said "Note now shows on the view-only schedule", and the button's hover words "Showing on the view-only schedule" — untrue until the amendment | FIXED — while the choice waits: "Note made public. It goes out with the next amendment." (and "…scheduler-only…"), the hover words "Public: goes out with the next amendment"; N16 kept word for word where nothing waits; `notepub.test.tsx` (red). **The new sentence is the agent's wording — his to change.** The button's label "On view-only ✓" is left as the working copy's choice (the note's own AL mark says it waits) — on his look card |
| Q1 | the designer S04; W2 S04 | a LATE mark dropped on a published day leaves the issued face at once, nothing pending, sign-offs held (the builder's call) — where a hidden warning waits for the amendment (D471) | **HIS QUESTION** (look card). As built until he rules |
| Q1b | the designer S04b; W2 S04b | in that order — dropped after publishing, then its input deleted — the mark comes back on the issued face (it reads the published copy once the live record is gone) | rides Q1: if the drop waits for the amendment, the published face reads only the published copy and this goes; filed with Q1 |
| — | W2 S20 | two tabs of one browser: a stale tab's save of the same input or day undoes the other's LATE drop or Make public | NOT NEW — the class every record has with two stale tabs (a whole-record write); kept for the database step's sharing design ([DB-SYNC-MODEL], `[LW-NIGHT1025-OLDER]`'s two tabs) |
| — | W2 S20r | after an Undo, a new change on another record leaves Redo offered | NOT A FAULT — by design (`undo/timeline.ts abandonForkedRedo`: a new change drops only the undone steps sharing its records) |
| — | W2 S17 | Undo after an amendment is published takes back the publish first | NOT A FAULT — the walk's expected line assumed the wrong first step; Unpublish, republish and "Load onto working copy" all carried the choice rightly |
| K8 | W1 S01 (×3 variants) | Escape with the keys on a DATE closed the day BEHIND the settings or Calendar window in front, and left the front one up — on the Inputs calendar and (by the same code) the SANS calendar | FIXED — the date closes its day only while the day is the window in front (`ui/InputsCal.tsx`, `ui/SansCal.tsx`); `inputskeys.test.tsx` S01, `sanscal.test.tsx` (red) |
| K9 | W1 S08 | the unsaved question up and another window brought in front: Escape answered "Keep editing" and the front window stayed | FIXED — the question answers Escape only while its window is in front (`ui/InputWindow.tsx`); `inputskeys.test.tsx` S08 (red) |
| K10 | W1 S23c | a note carried in an opened day (its ⠿): Escape closed the whole day window with the note still in the hand | FIXED — Escape puts the note (and a puck carried off its note) back and the day stays, as D1581 does for a bar (`ui/InputsCal.tsx`); `inputskeys.test.tsx` S23c (red) |
| K11 | W1 S07d | Escape on the swap question ("…open the other input and lose them?") did nothing | FIXED — Escape is "Keep editing" there too (`ui/InputWindow.tsx`); `inputskeys.test.tsx` S07 (red) |
| K12 | W1 S21 (1536), S21.3f, S21.4pre | F9 held only where the left had room: at his PC's 1536 wide "Calendar…" from a SANS day still covered the day and its ✕; from the Inputs or SANS settings it covered that window | FIXED — the Calendar window opens beside every door's window, and where the left lacks room as far left as goes with the other window's end and ✕ clear, else at its corner (`ui/FloatWindow.tsx`, `InputsSettings.tsx`, `SansSettings.tsx`); `winbeside.test.tsx` (the 1536 case red; the old "corner" test rewritten to the new rule, its fall-back kept as a case) |
| Q2 | W1 S07b–c; W3 step 4 | the input window's ✕ and Cancel close at once with typed words — only Escape asks (F2) | **HIS QUESTION** (look card): should ✕ (and Cancel) ask too? As built until he rules |
| Q3 | W1 S02; W3 finding 1 | the Calendar window stays up over Edit Schedule after a page change, where the settings window it was opened from closes (F8) | **HIS QUESTION** (look card), the agent's reading: leave it — it belongs to no one page (opened from the Inputs and SANS settings, the SANS day and the Leave War's ⚙), and its Holidays list sends him to the Leave War to make a period, where closing it would lose his place |
| — | W1 S02.6 | a cut-off typed in the settings and not saved is gone after a page change closes the window | F8's cost, the agent's call: leaving a page leaves its unsaved settings form, as anywhere; named to him |
| — | W1 S19 | on a 320 × 568 phone a window FLICKED low stands 12px past the foot (a resting drag stays inside) | NOT A FAULT — the drag may park a window low with only its bar on screen, by design (`floatwin.ts` keeps the bar in reach); F5's fault — a window taller than the screen after a drag and back — is fixed |
| — | W3 S18 | a date tapped behind a new input's window waiting for its end lights the ring and moves the day hidden under it; the window keeps its date | NOT NEW — his D1298, filed `[INP-CAL-CLICK-BEHIND-NEW]` (his choice of what it does) |
| — | W3 step 3 (phone) | an opened day covers the top bar's Undo / Redo on a phone | NOT NEW — the day opens nearly full screen on a phone (D683, D909); Undo is there once it is closed |
| — | W2 S15; W3 step 7 | no LATE chip on the board for a member's input that landed on the Ground Programme ("1 input · 1 on programme") | NOT NEW — the chip rides the live Personal Inputs and Unavailable rows (21 Aug 26 entry); an input on the Ground Programme is reached through Personal Inputs opened (`latemark.test.tsx` opens it); the same on `main` |
| — | W2 S15 | no LATE chip on a Ground Programme row of an Event or Appointment | NOT NEW — the chip rides the live Personal Inputs and Unavailable rows (the settled 21 Aug 26 entry); the walker did not open the folded Personal Inputs |
| CR-B1 | Reader B (security) | a member's own medical over his leave whose LATE mark a scheduler dropped was refused ("That couldn't be completed"): a new record took the scheduler's marks of ANY record of his the command changed | FIXED — a new record takes marks only from the record it was cut from (same filer and filing time) — `state/perms.ts inputBreach`; `latemark.test.tsx` (red); walked C2 (OML) — PASS |
| CR-B2 | Reader B | a brand-new filing could borrow another input's LATE drop or cancel by a hand-made command | FIXED by CR-B1's rule; `latemark.test.tsx` (red) |
| CR-B3 | Reader B; round 2 | the permission list named the schedule's table for the LATE drop, which writes the input; and a piece is still known only by its filer and filing time, which a hand-made command can copy | FIXED — `inputs.lateOff` names the Input table, never a member's (`perms.test.ts`, red); the lineage FILED for the security review before the database step ([REVIEW-LAYERS]) |
| CR-A1 | Reader A | "Delete this input?" answered Escape whoever was in front (K9's twin), and stayed armed after its row went | FIXED — only while the day is in front and the question on screen (`ui/InputsCal.tsx`); `inputskeys.test.tsx` S01b, S01c (red); walked C4 — PASS |
| CR-A2 | Reader A | Make public pressed twice, or on an empty note, on a published day left "Edited — goes out as AL1" with nothing waiting | FIXED — the press runs the sweep every edit runs (`ui/interactions.ts`, `reconcileIssuedMarks`); `notepub.test.tsx` (red); walked C5 — PASS |
| CR-A3 | Reader A | Save with nothing changed on an input of several said "Input updated" and lit its card (F1 held for one person only) | FIXED — `ui/InputWindow.tsx saveNow`; `savenothing.test.tsx` (red); walked C3 — PASS |
| CR-A4 | Reader A | the unsaved question stayed up across a swap: the input opened next, nothing typed, asked about changes | FIXED — reset with the record (`ui/InputWindow.tsx`); `inputskeys.test.tsx` S07b (red) |
| CR-A5 | Reader A (small) | the LATE chip's write skipped the input funnel (a locked week, the absence rules) and said "hidden" when refused; two stale comments | FIXED — `state/store.ts writeInputsAs`, the note only on success; `quarantine-funnel.test.ts` (red); comments put right |
| CR-R1 | round 2 | D1620 built as "a new change date": a member's second change the same day kept the drop — his words say "changes his input again" | FIXED — his own save of his input takes it off whatever the day; the gate checks the save's change time too; `latedrop-later.test.ts`, `latemark.test.tsx` (red); the reading in D1620's row corrected; walked C1 — PASS |
| CR-R2 | round 2 | the gate matched a person's own date by place in the list, so leaving a shared input could clear the drop for the others | FIXED — matched by the person; a save that is nothing but his own leaving never clears it; `latemark.test.tsx` (red) |
| CR-R4 | round 2 | "Delete this input?" came back unasked after Undo then Redo | FIXED — put away when its row goes (`ui/InputsCal.tsx`); `inputskeys.test.tsx` S01d (red) |
| CR-R5 | round 3 | the "leaving" test refused a filer's own hand-over, or a change made as he leaves — both his to make (D660) | FIXED — `bdd056c11`; `latedrop-later.test.ts` (red) |
| — | the agent's call | a medical that cuts a member's leave keeps a dropped LATE mark on what is left of the leave | the cut is the medical's, never late (medicals are exempt); named to him |
| — | the re-walk (S21.1 at 1536) | the Calendar window, opened from a SANS day at 1536 wide, tucks 12px under the day's left edge | NOT A FAULT — K12's rule as built: where the left lacks room, as far left as goes with both crosses clear; the picture shows both crosses and the day's figures clear |
| — | the re-walk (W2 S03) | To go out's line no longer carries the word "public" | NOT A FAULT — K2 changed it to "scheduler-only → shown on view-only"; the note is listed |

## 14. The gates

GitHub's run of the pull request (the full check while the repo is public, D1086): `1c81e6d82` all green (its first run,
on `308b0130d`, red only on the code check, which could not read one walk script's Windows-encoded dash — fixed);
`249d0e83d` red on one phone Tab test of the Scheduler Board (a caret after a changed box) — passed 5 of 5 on his PC and
green on the next push, so a flaky test, not the change; `81787b4ad` all green; `bdd056c11` — read before his look. On his
PC: the touched tests and their neighbours, 30 files, 875 tests, green; the type check clean; `lint:changed` "no new
finding"; `docsize` OK.

## 15. His look — the card

Preview: the pull request's Vercel link. Pictures: `rewalk/cr/A/`, `rewalk/host/A/`, `w2/A/S04-*`, `w1/B/S07-*`,
`w1/B/S02-*`. **His questions:** Q1 a LATE mark dropped on a published day leaves the issued face at once (as built) — or
waits for the amendment, as a hidden warning does (D471)? Q2 should the input window's ✕ and Cancel ask before closing
with typed words, as Escape does? Q3 the Calendar window stays up across a page change — leave it (the agent's reading)?
**Named to him:** the sentence "Note made public. It goes out with the next amendment."; an unsaved settings figure goes
with its window on a page change (F8); a medical that cuts his leave keeps a dropped LATE mark; D1620 as built.
