# The bug check of the second batch of the Inputs pages — 10 Oct 26

**The job:** `OUTSTANDING.md` `[SEEN-BATCH-2]` — owner D730 (the ten ready faults, as a second batch) and D731 ("Yes to
all": his answers to the small choices, `docs/mock/batch2-choices.html`). **Branch:** `claude/day-window-compact`.
**No merge** (his word). Pictures: `docs/img/handpass/2026-10-10-batch2-check/`. The walk's script:
`scripts/handpass/b2-walk.mjs`. Astra's scenario list: `docs/superpowers/briefs/2026-10-10-batch2-scenarios-astra.md`.

## 0. Questions waiting for him

**None that hold anything up.** Readings to tell him — each is the agent's reading of what he approved; he says so if
one is wrong. (D731's own four readings — that "yes to all" also started the batch; that the exact words follow the
pattern with the real names; that "Take me out" is decided by the rules already in force; that choice 6 needs nothing —
were told to him when he answered.)

1. **"A window" in choice 1 is one of the movable windows of the Inputs pages** — a day opened on a calendar, an input,
   a calendar's settings, "Calendar". The Leave War's sheets and the schedule's own pop-ups keep the passing note at the
   foot of the screen, as before: they were not on the picture he answered. He says if he wants it everywhere.
2. **Choice 5's two other cases follow its pattern:** a request whose row stood on another day reads "Ranger's Sports
   day taken off Tuesday's programme" (it said "Accept undone — its row came off Tuesday's programme"), and one filed
   under Unavailable reads "Ranger's Sports day taken out of Unavailable" — it was never on the programme.
3. **Choice 4, the cases his example did not show:** two people not credited are both named ("credited for 1 of 3 —
   Ace: no, Ranger: no"); a man credited for only some of the days of a several-day input reads "Ranger: 1 of 2 days";
   a man who has not answered at all is not named on that line — the line under it ("Not answered yet — 17 Oct: Ace")
   names him.
4. **Choice 8 reaches an input filed for ALL AVAIL or ALL too.** A member files one only while the switch is on, and
   with it off he was told the same "Only Ranger — who filed it — …" about himself.
5. **Choice 9 covers the small "+ people" button beside a new note's words** — the two are one thing being made — and a
   note whose words are being changed. The day's TITLE box is not part of it: Escape there still closes the day (filed
   for him, §7).
6. **A group's OIL question is headed "Ace +2"** — the first name A to Z and how many more, the words of the window's own
   title — where his list said "Ranger +1" as an example of the form.
7. **On a short phone (568 points tall) the List's dates calendar keeps its finger-size days**, and the room is found
   in the padding round it; nothing else changed size.

## 1. The tier, and what it meant

The eight questions of the checking guide (§5), against this batch:

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Earned leave (OIL) — what a man is owed | **NO** | No answer is written, priced or credited differently. Three pieces change WORDS about OIL (the shared line's count, the year on a label, the question's heading) and one hides a dead button. Because those words describe what is owed, the walk checks them against the answers stored on each record and a reviewer reads the code — more than the tier asks. (Reading the earned leave on the Leave War beside them was planned and dropped: §6.) |
| 2 | The published record | **NO** | The take-off message is words; the take-off itself, and what it does to a published day, is untouched. |
| 3 | Saved data | **NO** | Nothing stored changes shape. D731 (7) keeps a stored answer as it is — pinned by a test, not built. |
| 4 | A shared drawer | **YES** | The passing note is one routine for the whole app; the input's window, the people picker and the two-tap calendar are each drawn from several doors. |
| 5 | A new gesture or control | **YES** | Escape in four places; "Clear filters" in the opened day; three chips become buttons; Enter's key press is taken. |
| 6 | A new surface | NO | No new screen, window or kind of row. |
| 7 | Roles | **NO** | `state/perms.ts` gains one question that decides no right (`filerSwitchedOff` — which sentence a refused door says); `perms.test.ts` and `perms-scan.test.ts` are green, and no row of the permissions table (§11 of the data model) moved. Three pieces change what a READER is shown (no dead button, no yellow box, a truer sentence) — each is walked as the admin, the member and the filer. |
| 8 | The warning list | NO | Untouched. |

**Tier: WALK** (4 and 5), checked as ONE batch (D485). Done beyond the tier, because of rows 1 and 7: Astra designed
the scenarios (one designer — D353), and Astra reads the finished code with this sheet in hand.

## 2. The roll-call — every place each changed thing is drawn

One table a thing. "Has it" = changed and proved (the proof is named); "must not" = deliberately left, with the reason.

**2.1 The passing note against a window's foot, on a phone (D731 (1))**

| The window or panel | The note goes to the top? | Proof / reason |
|---|---|---|
| An input's window (Inputs page) | has it | walk E1, F2; `e2e/inputs-batch2.spec.ts` |
| A day opened on the Inputs calendar | has it | walk E2 |
| A day opened on the SANS calendar; "+ Commitment" | has it | the same shell and the same one test of "a window is up" (`toastplace.test.tsx`) — not walked on its own, §6 |
| Inputs settings, SANS settings, "Calendar", "Every <weekday>" | has it | the same shell; the Inputs settings window walked — E8 |
| The ALL AVAIL window, the changes window | must not | older windows on another body; a phone's bottom panels with no buttons at the foot; not pictured to him (reading 1) |
| The schedule's and the board's own pop-ups (an input's dialog there, the OIL question, the document viewer) | must not | blocking pop-ups, a different chassis; reading 1 |
| The Leave War's sheets | must not | the war's own chassis; reading 1 |
| A desktop, any window | must not | a desktop's window is not at the foot of the screen — walk; e2e |

**2.2 Where an OIL day is named (A5)**

| The place | The year where it differs? | Proof |
|---|---|---|
| The OIL question's heading line (one day) | has it | `batch2.test.tsx`; walk A11 |
| The question for several days | must not | it names no day in words; its month grid is headed "Jan 2027" already |
| The window's "Not answered yet — <day>" | has it | `batch2.test.tsx` |
| A man's own "Your OIL: not answered yet — <day>" | has it | the same label (`oilDayLabel`) |
| The desktop row's "OIL?" chip (its hint and its name) | has it | `batch2.test.tsx`; walk A11 |
| The bell's note ("Weekend/PH work — confirm your OIL") | must not | names no day |
| The Leave War's OIL tracker | must not | the war's own date format, which carries the year |

**2.3 Where a shared input's OIL standing is printed (D731 (4))**

| The place | Counts its people? | Proof / reason |
|---|---|---|
| The entry's OIL line in its window (Inputs page) | has it | `batch2.test.tsx` (six cases); walk A2, A7, A8 |
| A man's own "Your OIL:" line in that window | must not | it is his answer alone, by design — walk A5–A7 |
| The desktop List's row | must not | a shared row carries no OIL chip: its answer is in its window (as built, D718) |
| The phone's card, the opened day's card, the month's bar | must not | none prints an OIL standing (D723) |
| The schedule's and the board's dialog on one man's row | must not | it holds and saves ONE man's record; its line is his, as before (`oilRows`) |

**2.4 Every door that asks a group's OIL question (A8)**

| The door | Headed for the group? | Proof |
|---|---|---|
| The window's Save | has it (as before) | walk A1 |
| "Change…" on the entry's line | has it | `batch2.test.tsx`; walk A3 |
| "Answer…" on the entry's line | has it | `batch2.test.tsx` |
| The question that follows a bar's drag onto a weekend | has it | `batch2.test.tsx` |
| The bell, to the filer or an admin | has it | the same one place decides it (where the sheet is drawn) |
| The bell and "Change…" for a man's OWN answer | must not | his record alone: his name — `batch2.test.tsx`; walk A6 |
| The schedule's and the board's dialog | must not | one man's record: his name |
| The desktop row's chips | must not | not drawn for a shared row |

**2.5 Every door that tells someone who may change a shared input (D731 (8))**

| The door | Says the switch is off, to the filer? | Proof |
|---|---|---|
| The window's foot — a shared input | has it | `batch2.test.tsx`; walk B4 |
| The window's foot — an input filed for ALL AVAIL / ALL | has it | `batch2.test.tsx` (the roll-call's own find) |
| Delete for everyone | has it | `batch2.test.tsx` |
| A save of the entry | has it | `batch2.test.tsx` |
| The Delete key on the opened day's line — a shared input he is not in; an ALL AVAIL input | has it | `batch2.test.tsx` |
| A bar's drag | has it | `batch2.test.tsx`; in the app his bar does not lift at all — walk B5 |
| The window's foot — ONE man's input another member filed | must not | it names the input's own person ("Only Echo or an admin…"), which is true |
| "You can only edit / delete your own inputs" (one-person inputs) | must not | true as it stands |

**2.6 Escape inside a window (D731 (9), A6) — every small layer that should take it first**

| The layer | Takes Escape before its window? | Proof / reason |
|---|---|---|
| A new note's words box | has it | `batch2.test.tsx`; e2e; walk C3 |
| A new note's "+ people" button | has it | `batch2.test.tsx` (Astra 16) |
| An existing note's words being edited | has it | `batch2.test.tsx`; walk C4 |
| The people picker over a note | had it already | walk C5 (unbroken) |
| A card's "Delete this input?" question | had it already | — |
| The List's dates calendar | has it — and only while the List is shown | `batch2.test.tsx` (three cases, Astra 20, 21); e2e; walk C7, C8 |
| The day's TITLE box | **MISSING — filed** | Escape there closes the day, and a title half typed is lost; not ruled — §7, for him |
| The "?" card beside Type, the document viewer, the OIL question | had it already | untouched |

**2.7 The two-tap calendar (D731 (12))**

| Where it is drawn | Finger-size on a phone? | Reason |
|---|---|---|
| An input's window | had it (D725) | — |
| The List's dates pop-up | has it | e2e at 568, 700, 844; walk E4, F1 |
| The schedule's / board's Unavailable dialog | must not | "the board's and the week's dialogs are not this window" (D725) |
| The OIL question's day grid | must not | another control; not ruled |

**2.8 The rest — one place each**

| The thing | Places | Proof |
|---|---|---|
| The "Unsaved changes" question (A1) | ONE body asks it for every door (a day's card, a month's bar, a List row, "+ Input", the bell, the viewer's "Edit input", the SANS day) | `batch2.test.tsx`; e2e on a phone; walk E6 |
| Enter in Remarks / Title (A2) | the one form, in the window and in the schedule's dialog | `batch2.test.tsx`; e2e from both "+ Input"s; walk C9 |
| The picker's yellow box (A3) | the one picker, in the one window (Inputs and SANS) | `batch2.test.tsx`; walk A5, B8 |
| The row's chips (A4) | the desktop List's last cell only (`.rclip`, `.roil` are drawn nowhere else) | `batch2.test.tsx`; e2e; walk C10, D3 |
| A reader's "Change…" (A7) | the window's entry line | `batch2.test.tsx`; walk A5 |
| The clash note (A10) | the window | `batch2.test.tsx`; walk C11 |
| "No inputs match on this day." (D731 (2)) | the Inputs day only — the SANS day has no filters | `batch2.test.tsx`; e2e; walk C1, C2, E5 |
| The take-off message (D731 (5)) | one body for Edit Schedule's week and the Scheduler Board | `reqorphan.test.ts`; walk C12 |
| The viewer's foot (D731 (10)) | one viewer for every door (a List paperclip, the window's paperclip, the Medical page, a puck) | e2e; walk C14, D1, E7 |
| "Quals saved" (A9) | Quals | `quals.test.tsx`; walk C13 |

## 3. The sizing step (the order's §7.0; `docs/walk-ledger.md`)

1. **The type of change:** C (controls and keys: Escape in four places, "Clear filters", three chips as buttons, Enter),
   E (where the note stands, the viewer's foot, the calendar's days), F (five sentences), with D at one point (an OIL
   day's label, drawn in four places) and H at the edges (what a reader is shown).
2. **What only a walk could find here:** whether the note really clears a window's buttons on a phone; whether a
   finger can reach the question that now comes forward; whether a real key press goes on to the button behind; whether
   the bigger calendar still fits a short phone; whether the pinned foot covers anything; the look of the chips as
   buttons; and — by signing in as each — what the admin, a member and the filer are actually shown. The words and the
   rules are carried by the unit tests (§5).
3. **What the ledger says:** walks of controls (C) found a real fault in 8 of 15 runs, 31 faults; of layout (E) in 4 of
   10, 6 faults, none fanned out; the two walks of "who may see" (H) both found faults. The last three checks of these
   very screens (the title, the card, the design vet) were each walked by three helpers and the host, and what they
   found in passing IS this batch's list — the surfaces are fresh in the record. Small fixed behaviours with exact
   expected words are where one scripted host walk has done as well as a fan-out.
4. **The walk chosen:** the HOST, by script, no helpers — about 45 steps in six blocks: a desktop as the admin, the
   member and the admin again (signing out and in through the app); a desktop for the members' switch and the filer; a
   desktop for the day, the List, the schedule and Quals; his PC's 125% scaling for what could run off; a phone by
   touch; a short phone. Astra's forty scenarios were laid over the list: those that name a new place or order are
   walked or given a test (§4.2), the rest are older behaviour this batch does not touch and are named in §6.
   **Carried by a test, not walked** (each named in §5 with what it proves): the repeated cases of the shared OIL
   line's wording; the two other doors of the switch-off sentence that no control reaches in that state (a blocked bar
   does not lift; a refused save is not offered); the stale OIL answer on every kind of move.
5. **Its row** is added to the ledger at the close (§9).

## 4. The walk — the host, by script, on the built app

`scripts/handpass/b2-walk.mjs`, on the build served locally; its last whole run: `docs/handpass/parts/b2-host-walk.txt` —
**45 of 45 steps as they should be; no console error, page error or failed request.** 47 pictures under
`docs/img/handpass/2026-10-10-batch2-check/host/`; the host opened E1, E4a, F1, E6b, C1, C14, A7 and B4 (the phone's
note at the top; the finger-size calendar at two heights; the question in front; the filtered day; the viewer's foot;
the counted OIL line; the filer's sentence). Every fixture was made through the app's own controls ("+ Input", the
gear, the sign-in); the roles are real sign-ins as Saber and as Ranger in one browser, signing out and in.

| Block | Where, as whom | Steps | What it drove |
|---|---|---|---|
| A | desktop 1440 × 900 — Saber, then Ranger, then Saber | 9 | a Duty on a Saturday for three through "+ Input": ONE question, headed "Ace +2" (A8); the entry's line while alike; "Change…" headed for the group; Ranger reads it — no dead "Change…", no yellow box, his own line live (A7, A3); his own question headed with his name; he answers No; the line counts "credited for 2 of 3 — Ranger: no", to him and to the admin (D731 (4)); a bar dragged off its Saturday and back by a real mouse — the answer kept, nobody asked twice (D731 (7)); a Duty on 9 Jan 2027 — the question and the row's chip say 2027 (A5) |
| B | desktop — Ranger, Saber, Ranger, Saber, Ranger | 8 | Ranger files for himself and Echo; the admin turns the members' switch off behind the gear; Ranger's window says the switch is off, "Take me out" still his, no Save and no Delete (D731 (8)); his bar does not lift; the Delete key asks him only about himself; the switch on again — his Save is back; he opens another man's medical input — read only, no yellow box (A3) |
| C | desktop — Saber | 14 | the filtered day's line and "Clear filters", and the truly empty day (D731 (2)); Escape in a new note, in an edited note, and the picker's older Escape (D731 (9)); three days dragged — the window at once (D731 (11)); the dates calendar: stays open, Escape, a click outside, and Escape with a window up as well (D731 (3), A6); Enter in the Title box — one input, no second window (A2); Tab to the OIL chip (A4); new dates tapped in a window, its bar dragged behind it, Undo, Redo — the note comes, goes, comes (A10; Astra 12); on the Scheduler Board "Ranger's Sports day taken off the programme" (D731 (5)); "Quals saved" (A9); the two-document viewer's foot (D731 (10)) |
| D | his PC: a desktop STARTED at 125% (1536 × 864) | 3 | the viewer's buttons inside its box; the dates calendar's small desktop days; a row with a chip measured against the same row with a `<span>` put in the button's place — identical (A4, D487) |
| E | a phone 390 × 844, by touch — Saber | 8 | the note at the TOP with an input's window up, with a day's window up, with a settings window up — and at the foot with none (D731 (1)); the finger-size dates calendar, two dates picked by a finger, closed by a finger on the page (D731 (12), (3)); the filtered day's "Clear filters" as a finger's target; the "Unsaved changes" question reached by the road a finger has — the day's bar, then the other card — and answered (A1); the viewer's "Close" |
| F | a short phone 390 × 568 | 3 | the dates calendar all on the screen; in a SIX-week month the dates and both quick buttons are on the screen and an admin's "Default window" is 9 points past the foot, reached by scrolling the page (Astra 39); the note at the top |

**What the walk and its preparation found — four things, all fixed, each a failing test first:**

1. **A NEW group's OIL question led with the man picked first** ("Ranger +2"), and the same input was "Ace +2" at its
   title and at every other door the moment it was saved. The heading is the first name A to Z everywhere now.
2. **At 568 points tall the dates pop-up ran 11 points past the foot** once its days were a finger's size (the batch's
   own browser test, before the walk). The room was found in the padding round the calendar.
3. *(from the roll-call, before the walk)* **An input a member filed for ALL AVAIL told him "Only Ranger — who filed
   it — …"** with the switch off — choice 8's muddle on a second kind of input.
4. *(from the control test of A10)* **The "changed while this window was open" note did not repaint** when the record
   moved a second time: it went on showing the first "theirs".

### 4.2 Astra's forty scenarios — what was done with each

**Two were real gaps, fixed with a failing test first:** **16** (Escape on a new note's "+ people" button closed the
whole day) and **21** (the dates calendar left open on a List no longer shown swallowed the first Escape — a
side-effect of this batch's own A6). **One was an older fault on a door this batch touches, fixed with a failing
test first:** **9** (the day's "Delete this input for all 2 people?" question, the switch turned off while it stood,
then took HIM out).

| What was done | Which scenarios |
|---|---|
| **Walked** (the step) | 7 (A10 — by a drag), 10 (B4–B6), 12 (C11), 17 (C5), 20 (C8), 25 and 26 (A5, B8), 28 (C9; both "+ Input"s in `e2e/inputs-batch2.spec.ts`), 32 (A11), 33 (C14, D1, E7 — two PDFs), 35 (E1, E2, E8), 37 (C1, C2, E5), 38 (C12 — the Scheduler Board), 39 (F1, F1b), 40 (C6, C13) |
| **Carried by a named test in `ui/batch2.test.tsx`** (it drives the screen's own controls in jsdom unless said) | 3 and 4 (the line's count with a man unanswered, and across two days — `oilSummaryOf` called directly for the two-day case), 13 and 14 ("Keep mine" then a different change; "Take theirs" then two more), 15 (the note repaints), 19 (an edit after an Escape saves), 27 (an editable draft still shows the yellow box), 29 (Enter that must first ask), 36 (`ui/toastplace.test.tsx`) |
| **The one body covers it, the door itself not driven** | 2, 23 and 24 (the "Unsaved changes" question is one effect for every door — the bell, a month's bar, a List row, the viewer's "Edit input", the SANS day; driven through the day's card, in jsdom and on a phone); 5 (the filer's group answer replacing a man's own is D682's, `groupeditor.test.tsx`; this batch changed its heading only); 11 (one man left: the line is `oilRows`' one-record branch, the control test) |
| **Older behaviour this batch does not touch — not walked** | 1 (the schedule's one-person dialog: it holds one man's row, and its heading and line are his, by the same `grouped` test as before); 6 (the scheduler's refusal in OIL Earn); 8 (the switch changed under an OPEN window — walked with the window reopened, B3–B7, not left open); 18, 22 (Escape between other layers); 30's Space key; 31 (a chip's identity after a sort); 34 (the viewer's paging and its rights) |

## 5. The cases carried by a test, and the break tests

**Red first.** Every test below was run against the code as it stood before its fix and failed there: the first run of
`ui/batch2.test.tsx` — 36 of 46 red (the 10 green were controls); `e2e/inputs-batch2.spec.ts` on the old build — 13 of
14 red (the green one a control); `ui/toastplace.test.tsx` — 5 of 6; `state/reqorphan.test.ts` and `ui/quals.test.tsx`
— 6 of 6; and each later find (the ALL AVAIL filer, the new group's heading, Astra's 9, 16 and 21) red before its
fix. That run IS the break test of each wired row of §2: the wire taken out, a named test goes red.

| The claim | The test | Through the screen's controls, or directly? |
|---|---|---|
| The shared OIL line's words in each case (alike; one No; two No; one unanswered; two days) | `batch2.test.tsx` "D731 (4)" — 7 cases | the window, opened on each record, for three; `oilSummaryOf` called directly for four |
| The switch-off sentence at Delete for everyone, a bar's drag and a save | `batch2.test.tsx` "the other doors say it too" | DIRECTLY (`removeEntry`, `commitChipMove`, `commitGroup`) — in the app the bar does not lift and the save is not offered in that state (walk B4, B5), so no control reaches them: they are the safety net behind the screen |
| An OIL answer kept through a move away and back | `batch2.test.tsx` "D731 (7)" | `commitChipMove` directly; the same by a real mouse in the walk (A10) |
| Where the note is placed, and that it follows a window opened under it | `toastplace.test.tsx` | the real window component and the real `toast`; what is DRAWN is the walk's and `e2e`'s |
| The take-off's three sentences | `reqorphan.test.ts` "D731 (5)" | the app's own click router on a real button; on the board in the walk (C12) |
| Enter is used up; the chips are buttons; Escape's order | `batch2.test.tsx` A2, A4, A6 | jsdom's keys; the real keys and the real Tab in `e2e/inputs-batch2.spec.ts` and the walk |

## 6. What was NOT walked, and why

- **The earned leave on the Leave War (the OIL tracker's figures).** Said in the tier block, and dropped when the
  walk reached it: a request's OIL answer earns on the Leave War only when its day is PUBLISHED (D2, D142), so reading
  it means publishing a Saturday twice — a walk of how OIL is published, which this batch does not touch. What stands
  in its place: no file of the OIL calculation, of the Leave War, or of the engine is in this batch's change
  (`git diff --stat`), and their own tests are green unchanged (§8). The Inputs page's words about OIL were walked
  against the answers stored on each record (A1, A7, A10).
- **The note with a SANS day or "Calendar" window up** — the same shell and the same one test of "a window is up";
  walked with three other windows of it (E1, E2, E8).
- **The bell as a door to the "Unsaved changes" question and to the group's OIL question** — one body each (§4.2).
- **A phone on its side** — list C of `[SEEN-BATCH-2]`, filed, not part of this batch.
- **A real iPhone.** Two lines only his phone can prove are on his look card (§10): that a finger's press on the page
  closes the dates calendar (an iPhone sends no mouse press there — the reason `pointerdown` was added), and where
  the note sits against the top of his screen.
- **The schedule's and the board's own input dialog** — not changed but for Enter's key press being used up there too
  (the same form).
