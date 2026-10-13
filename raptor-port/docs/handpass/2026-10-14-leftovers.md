# The leftovers of 14 Oct 26 — the batch's ONE bug check (`[BATCH-14OCT-LEFTOVERS]`)

**One branch, one check (D485):** his three answers to the leftover questions and his "Yes to all" on three more notes —
(1) no "Input added" where the new input can be seen arriving, its card wearing the Scheduler Board's just-added mark
(D851, D850); (2) a cancelled input's CX tag and reason follow its window's title (D849); (3) the upchit and
medical-clash questions' answers flat (D849); and "Input updated" where the changed input is in view, "Schedule updated"
after the board's ✓ Done, and "<name> added to / taken out of <row>" on a puck's drop (D854). Built on the night of
14 Oct 26 in the chat that continues `claude/approved-jobs-batch-build-cc42ef` (pull request 505 carries it with the
three builds; D851). What was approved: `docs/mock/2026-10-14-leftovers/`, `docs/mock/2026-10-14-feedback/`.

## 0. Questions waiting for him (a minute's read)

Nothing below held the build. Each has what the walk saw and a recommended answer; the pictures are in this job's page.

1. **On the month, the changed input's bar now shows two signs one after the other:** the quick cyan flash a bar has
   always had when it lands (about half a second), then the blue box for its six seconds. Kept both, because the quick
   flash is older behaviour he asked for on drags and Undo. Picture: `A3-month-bar-close-desk.png`.
   **Recommended: leave it;** if the two together bother him, the quick flash can go where the blue box is worn.
2. **On the desktop List the blue box is drawn round each cell of the new row, not once round the row** — as it has
   been since August (the look is older than this batch; a table row cannot wear one box of its own). Picture:
   `A4-list-added-desk.png`. **Recommended: leave it;** one box round the whole row is a small job if he wants it.
3. **"OIL answer saved" is still said** after an OIL answer given in an input's own window. It was suggested on
   14 Oct as a probable KEEP (the answer changes nothing he can see on the card when the card showed no "OIL?" tag
   before); he has not ruled it. **Recommended: keep.**

## 1. The eight questions, and the tier

| # | The question | Answer | Why |
|---|---|---|---|
| 1 | What a man is owed (OIL counts) | NO | No answer, credit or count is touched. The add's note "— not counted for OIL" is KEPT as it was; only the plain "added to" words go. |
| 2 | The published record | NO | Publishing, amendments and what a day went out with are untouched; a note after a change on a published day is said or not by the same rule as on any day. |
| 3 | Saved data | NO | Nothing stored changes. The mark and the waiting note are view state: never saved, never in Undo. |
| 4 | A shared drawer | **YES** | The input's card is drawn in three places and gains the mark in one more; the mark's styles are shared by a table row, a card and a bar; the window's title bar is every movable window's; the save's note is raised from four save paths of one window. |
| 5 | A new gesture or mode | NO | No control is added; nothing new can be pressed. |
| 6 | A new surface | NO | No new screen, window or kind of row. |
| 7 | Roles | NO | Who may file, change or see an input is untouched (`state/perms.ts` not in the change). A member's own save was walked (A8). |
| 8 | The warning list | NO | No rule and no warning's words are touched; every refusal still speaks (A5, D2). |

**Tier: WALK** (question 4). The gates; the roll-call; a walk of the touched surfaces at both widths, sized below; a
break test per wired surface; this sheet. **Model reads:** one fresh, blind Opus read of the finished code (D790) —
the brief `docs/superpowers/briefs/2026-10-14-leftovers-read-brief.md`. No Fable read: no OIL figure, published day,
permission or saved shape changes. No ChatGPT read (D761 — on `[NO-ASTRA-LIST]`'s standing footing).

## 2. The rulings that apply

D849 (2), (3) · D850 (the guide's §1 — feedback designed into the screen; "in view" is D672's; steady for less motion; a
screen reader told in words; the keyboard not moved) · D851 · D854 · D853 (pictures to him) · D672 (in view) · D771
(the cancelled window says so, read only) · D767 (the tag's look) · D848 (the two sheets' words, untouched here) ·
D830 L1 (the OIL question's flat answers — the model for (3)) · D755, D762 (a man added to an input's row follows its
one OIL answer — the "not counted for OIL" words) · D479 (the amber "already on …" note stays) · D792 (a delete asks
nothing — untouched) · D587 (the standing signs of saving are not this rule's) · D487 (no button resized) · D765,
`performance.md` Part 1 (no motion added to the week or the board's dense grid: the bar's box is on the Inputs month).
**No clash between them.** One reading told to him: D851's "the note stays … where the save has a warning to give" is
read as "the note is said as it always was, joined to the save's own words" (§0 has none on it; the brief asks the
reader to rule it).

## 3. The roll-call

| The thing | Where the app draws or raises it | Mark / note there | Walked |
|---|---|---|---|
| The mark on a just-saved input | the List's row, a desktop | HAS IT (as before); every cell, the first with its coloured edge under the box for less motion | A4 desk, A4 desk-lessmotion |
| | the List's card, a phone | HAS IT (as before) | A4 phone, A4 phone-lessmotion |
| | the opened day's card | HAS IT (new) — and is brought into the window's own view | A1, A2, A8 at both sizes |
| | the month's bar, no day open | HAS IT (new), with its older landing flash; a bar with hours keeps its coloured edge under the box | A3 at both sizes |
| | the month's bar behind an open day | MUST NOT — the day's card wears it | A1 ("the bar behind lit: false") |
| | the day the page opens for an input with no bar ("+N more", a filter) | HAS IT (its card) — by the same `lit` | unit (`inputsvet.test.tsx`, the day's card); not walked apart |
| | the OIL questions' one list (`OilDayList`) | MUST NOT — a list of questions; no save shows there (`flash` is not passed) | read, not walked |
| | the SANS calendar's day | NONE DRAWN — not one of his three places; the note is said | not walked — §8 |
| | the Medical tab | NONE DRAWN (the List is hidden under it); the note is said at the first look | not walked — §8 |
| | the schedule's rows (week, board, Personal Inputs, Unavailable) | NONE of this kind; the note is said at once | A6 at both sizes |
| The save's note | the shared-input save · the new-input save · the plain edit · the medical-clash save | left to the screen on the Inputs page; at once elsewhere; joined to the save's own word where it had one | A1–A4, A6; unit for the rest |
| | the OIL-answer-alone save ("OIL answer saved") | UNTOUCHED — not on his list (§0, 3) | — |
| | "Input added to the Ground Programme" | UNTOUCHED | A6 |
| The window's title bar | the input's window with a cancelled input | the tag and its reason after the title | B1, B2 at both sizes |
| | every other movable window (a day on either calendar, the settings, Calendar, the one list) | as it was — no mark, no class | unit (`inputcx.test.tsx`); the day's bar seen in every A picture |
| The cancelled tag | the schedule's own dialog (`.airpop-head`) | already followed its title — untouched | read |
| The answers' wrapper | the upchit question | flat, at the right of the entry's box | C2 at both sizes |
| | the medical clash's row | flat, a line of their own, ending at the right | C1 at both sizes |
| | the medical clash's leftover line | flat; its own flow kept (not drawn for him) | unit only — §8 |
| | the OIL question; the week strip | untouched | — |
| The puck notes | a man put on an input's row | silent; "… — not counted for OIL" kept; the amber "already on …" kept | D1, D2 at both sizes |
| | a man taken off it | silent; a move's own words kept; Undo brings him back | D3 at both sizes |
| | a swap ("X and Y swapped", "X is on … instead of Y") | UNTOUCHED — not on his list | — |
| "Schedule updated" | the Scheduler Board's ✓ Done | gone | D4 at both sizes |

**The door check.** No action gains or loses a door. The cancelled tag is a mark and was one (no control in it —
`inputcx.test.tsx`); the day's "+ Input", the List's "+ Input", the bar's press and the card's press open the same
window as before.

## 4. The five sizing lines (D607, D608)

1. **The type of change:** D (a mark drawn in several places, each by its own code — a row's cells, a card, a bar) with
   E (the title bar; the two sheets) and F (three notes gone).
2. **What only a walk could find:** that the mark is PAINTED on each thing that wears it (a class is not a box: a
   cell's own shadow out-ranks it); that it is in view where it is drawn; that no note is drawn at all (an absence —
   watched for, not assumed); where the tag stands in a real title bar at each width; that the answers' row wears no
   patch. The tests and the read cover: when the note is left to the screen, who wears the mark, the words kept.
3. **What the ledger says:** ten walks of type D, ten found a real fault (61 faults, 57 in the change); type E four of
   ten. A walk is worth it here.
4. **The walk chosen — SHORT, the host's own, by script, no helpers** (`scripts/handpass/lo-walk.mjs`): every screen
   here was walked on 13 and 14 Oct, no control is new, and the roll-call has four places that wear the mark. 21 steps
   a size: a phone 390 × 844 by touch and a desktop 1440 × 900 by mouse; beyond the two sizes, a reader who asked for
   less motion (the mark's whole rule changed for him) and a member. No short screen: nothing here is a
   viewport-tall column or an edge-docked control. Carried by a test, each named in §6.
5. **Its row is added to `docs/walk-ledger.md`** at the close.

## 5. The walk — what the screen said

`scripts/handpass/lo-walk.mjs`, on the built app served locally, pictures in `docs/img/handpass/2026-10-14-leftovers/`.
A PASS means the right behaviour. The same script is the re-walk.

| Step | A phone | A desktop | What was seen |
|---|---|---|---|
| A1 the opened day: a new input | PASS | PASS | the card marked for that input, the box painted, in view; no note in 1.5 s; a screen reader told "Input added"; the keyboard on "+ Input"; the bar behind not lit |
| A2 the same input changed | PASS | PASS | its first mark gone after six seconds (class and box); marked again; no "Input updated"; told to a screen reader |
| A3 the month, no day open: its bar | PASS | PASS | the bar marked and painted, its coloured edge kept under the box; no note; no day opened |
| A4 the List: a new input | PASS | PASS | the card (a phone) / every cell of the row (a desktop) painted, in view once the page came to it; no note |
| A5 a save refused | PASS | PASS | "Pick a start date on the calendar first"; the window kept |
| A6 a save made from the Scheduler Board | PASS | PASS | "Input added to the Ground Programme", as before |
| A1–A5 again, less motion asked for | PASS | PASS after one fix | the box steady (no animation), painted — §7, find 1 |
| A8 a member files his own input from a day | PASS | PASS | his card marked, painted, in view; no note |
| B1 the cancelled window, a short reason | PASS | PASS | the tag 15 px after the title's words; the reason whole, red; the ✕ in the corner; nothing overlaps |
| B2 the cancelled window, a long reason | PASS | PASS | the reason cut short, the title whole; the mark ends where the ✕ begins |
| C1 the medical-clash question | PASS | PASS | no patch, no line, no padding; the two answers on a line of their own, ending at the row's right edge |
| C2 the upchit question | PASS | PASS | no patch, no line; Keep / Remove at the right of the entry's box |
| D1 a puck put on an input's row | PASS | PASS | he is on the row; no note |
| D2 the same man put on again | PASS | PASS | "… — already on MEETING 06:00–18:00 · not added twice" |
| D3 his puck taken off | PASS | PASS | off the row; no note; Undo brings him back |
| D4 the board's Done | PASS | PASS | the board closed; no note |

**Errors in the browser's own list during the walk:** none.

## 6. Carried by a test, and what each proves

| The case | The test | It proves | Through the app's controls? |
|---|---|---|---|
| When the note is left unsaid: in view / marked but not laid out / covered once settled / nothing marked / nothing laid out; the same words twice | `src/ui/seen.test.ts` | the rule, on boxes handed in | the function directly — the screen's half is A1–A4 and `e2e/feedback-marks.spec.ts` |
| The Inputs page in front leaves the note to the screen; another page says it at once | `src/ui/inputsvet.test.tsx` (its last block) | the window's own half of the rule | the window's Save |
| Who wears the mark: the row, the card, the day's card (and not the bar behind), the month's bar; a changed input; off after six seconds | `src/ui/inputsvet.test.tsx` | the class and the name on each | the window's Save |
| A save that said a word of its own keeps "Input added" in the one note | `src/ui/inputsvet.test.tsx` ("said together…") | the join | the window's Save, with the note's batch stood in for |
| The tag after the title, not among the tools; a bar with no mark unchanged | `src/ui/inputcx.test.tsx` | the order of the bar's parts | the input's window opened |
| No `.seg` on either sheet; every answer still works | `src/ui/upconfirm.test.tsx`, `src/ui/medclash.test.tsx` | the wrapper, and the leftover line's answers | the sheets' own buttons |
| A plain add and a plain take-off say nothing; "not counted for OIL" still said; a refusal still said | `src/ui/reqdoor.test.tsx`, `src/ui/phmember.test.tsx`, `src/ui/oilwait.test.tsx`, `src/ui/oilplaceholderclaim.test.tsx` | the door's words, by a drop, an armed tap and a right-click | the door, the drop and the mounted app |
| Done says nothing | `src/ui/board.test.tsx` | no note | the button |
| In a real browser: the mark painted and in view, no note drawn, the keyboard's place, less motion on every cell, gone after six seconds; the tag's distance from the title at two widths; the flat answers | `e2e/feedback-marks.spec.ts` (8 tests) | what jsdom cannot | the app's own controls |

## 7. What the walk found, and each disposition

1. **For a reader who asked for less motion, the first cell of a desktop row kept its coloured edge and wore no blue
   box** — the edge is a shadow of the cell's own and out-ranks the steady box (while the box is animated the animation
   wins, which is why it never showed before). In the change (the steady box is new). **Fixed:** three rules that draw
   the box with the edge under it (`scheduler/06-inputs.css`); the walk now asks every cell, and
   `e2e/feedback-marks.spec.ts` pins it. Re-walked: PASS.
2. **Seen in passing, older, NOT JUDGED — noted for its own job:** on the List's "+ Input", a kind chosen and one date
   picked writes "till 16 Jul" into the Remarks of a one-day, one-hour Appointment (picture `A4-list-added-phone.png`).
   Whether that is his 18 Aug 26 rule at work or a leave's words carried over to another kind was not read; it is noted
   in `[TILL-FROM-DATES]` (D728's second step), whose first question to him is exactly this.
3. **Met in passing, older, not fixed — filed in `[BATCH-14OCT-LEFTOVERS]`:** the passing note itself is not spoken to
   a screen reader (it never was). This batch tells a screen reader the words where the note is NOT shown; where it is
   shown, the old gap stands.

## 8. What was NOT walked, and why

- **The SANS calendar's day and the Medical tab after a save.** Neither draws the mark and neither is one of his three
  places; by the rule the note is said there (nothing wears the mark, or what wears it is not laid out). Carried by
  `seen.test.ts`'s two cases for exactly that; not driven on screen — a gap in seeing, small: the fall-back is the
  note he has always had.
- **The medical clash's leftover line ("Left over after it … Remove those days / Keep them").** Its wrapper lost the
  strip's class with the others; it was not drawn for him and was not reached by the walk's one clash (ATT B over
  ATT C leaves no leftover). `medclash.test.tsx` drives its buttons.
- **A note covered by a window at the moment of a save** — the case the rule exists for on the Inputs page. No route
  to it was found by hand in this batch's time (the input's window closes on a save, and the other windows stand
  clear of the centre of a row); carried by `seen.test.ts` ("marked and still covered").
- **His iPhone's own engine.** The pictures are a Windows browser's at an iPhone's size; the box is a plain shadow and
  a six-second animation, both long supported — his look is the proof.

## 9. Break tests, the read, the gates

*(filled in as each closes)*
