# Bug check — an input's own title ([INPUT-OWN-TITLE]; owner D715, D716, D717)

**Branch `claude/day-window-compact`** (not merged — his word for this branch: no merge). Built and checked 9 Oct 26.
Host and builder: Opus 5.5. The plan (`docs/superpowers/plans/2026-10-09-input-own-title-plan.md`) was read by Astra and
by Sol 6.1, each blind, before the build: both "CLEAN WITH THESE EXACT CHANGES" — its §8 says what each found and what
was done. Scenario design: Astra. Code reads: Astra and Sol 6.1, each blind (D590).

**STATE OF THIS SHEET: OPEN — the walkers' share (§5.2), the gates (§7), the two code reads (§6) and his look card (§8)
are filled as each is done. A section that says "to do" has not been done.**

## 0. Questions waiting for him

None. Every product choice is his and made (D715, D716, D717). **Readings to tell him with the build** — each follows
from his rulings; none changes what he chose:
1. **The kind sits UNDER the title on a desktop too**, not beside it as he was told before his yes: the schedule's name
   column is too narrow for a title and its kind side by side. The week's row is no taller for it (measured: 43 points
   with and without on a desktop, 41 on a phone). On the Scheduler Board such a row IS one line taller (45 against 34).
2. **An "Other" nobody titles is named "Other"**, its remark beside it as a remark (D716 (3)). Demo Others filed before
   this change that were named by their remark now read "Other"; on a demo day already published, such a row reads one
   pending change until republished (demo data only — D56).
3. **A title is at most 40 characters**, and a Title box left alone stores nothing — an input filed as before is the
   record it always was.
4. **A row the scheduler renames by hand on the schedule shows its kind too** — the label is read off the row, so the
   issued face shows what was issued.
5. **Two different requests that share a title for one man at one hour are now both counted** — before, the app read
   "same man, same hour, same name" as one commitment, and a Training titled "Meeting" beside a Meeting would have lost
   its red clash. Rows the scheduler types by hand are read as before.
6. **The Inputs export has a new column, Title**, beside Type.

## 1. The tier, and what it meant

**Tier: FULL.** The eight questions of the checking order's §5:
| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money / earned leave | NO | OIL is asked, defaulted and counted by kind and hours; the title is in no OIL comparison (`oilEvidenceKey` — read; pinned: a title-only edit moves nothing). The OIL QUESTION's heading changes — words only |
| 2 | The published record | **YES** | a title changed after a day is published is a pending change (the title joins `inpDetailKey`); the issued face keeps the issued name |
| 3 | Saved data | **YES** | a new optional field on the input record |
| 4 | A shared drawer | **YES** | `inpLabel` — the one name of an input — and the row / card builders of the week and the board |
| 5 | A new gesture or mode | **YES** | the Title box, in three editors |
| 6 | A new surface | NO | no new screen, window or kind of row; a new small label on existing ones |
| 7 | Roles | NO | whoever may edit the input may edit its title; `perms.ts` untouched (`perms.test.ts`, `perms-scan.test.ts` green in the unit gate) |
| 8 | The warning list | **YES** | the sentences that name an input say its title; two requests of one name are no longer merged into one commitment |

What FULL meant here: the rules sweep (§2) → Astra designed the scenarios → the roll-call (§3) → the sizing step (§4)
→ the walk (§5) → the gates (§7) → Astra and Sol each read the code blind, this sheet in hand (§6) → fixes, each a
failing test first → the re-walk → his look (§8).

## 2. The rulings that apply, each checked against the running build

| Ruling | What it says | Checked how | Result |
|---|---|---|---|
| D715 | choosing the kind fills in a title the person may change, for most kinds | host walk T1, T2; `ui/inputtitle.test.tsx` | PASS |
| D716 (1) | only the "Duty & other commitments" kinds; never leave or medical | T1 (LL, OML: no box); `engine/inputtitle.test.ts` (the ten, no other) | PASS |
| D716 (2) | the title wherever a name stands; the kind small where there is room | the roll-call, §3 | see §3 |
| D716 (3) | "Other" takes the same box; its remarks are plain remarks | T1; `engine/accept.test.ts`, `ui/inputsday.test.tsx` | PASS |
| D716 (4) | remarks left as they are | T3 (the remark saved untouched), T5 | PASS |
| D717 | the kind kept in sight: under the title on the schedule's row; on the day card's small-print line | T5, T10, T12, P2, P3, P4 | PASS — with reading 1 of §0 |
| D713, D714 | Event's rules come from its kind | T16; `engine/scshift-inputs.test.ts` (a title's words decide nothing) | PASS |
| D711, D702 | an input for ALL AVAIL / ALL: its kinds, one day, the filer's one OIL answer | T3 (titled, for ALL AVAIL: one record, the question asked once, headed by the title) | PASS |
| D660, D655, D682 | a shared input is one thing for everyone in it | `ui/inputtitle.test.tsx` (the title reaches every record; typed back, every record loses it); walker A's 6, 12, 13 | to do (walkers) |
| D178, D103 | an input change after publishing is pending; the sign-offs fall | `ui/latepub.test.tsx` (five cases); walker B's 28–34 | to do (walkers) |
| D45 | nothing on a published schedule changes without the scheduler acknowledging it | the issued face keeps the issued name — `ui/latepub.test.tsx`; walker B | to do (walkers) |
| D629, D701 | the day card's small print: who placed it | T5 (the kind heads the line, the placed-by print keeps its place at the right) | PASS |
| D56 | harm only in stored demo data is no finding | §0 reading 2 | noted |
| D29 | a change under `src/` never trims a document | the document check: over its tripwire, deferred | noted |
| D473 | the table list is kept true | `docs/data-schema.md`, `docs/data-model.md` gained `title` | done |
| D200 | permissions in one module | no new right; `perms-scan` green | PASS |

No new ruling contradicts or narrows an older one except as §0's reading 1 says of D717's own reading.

## 3. The roll-call — every place an input's name is drawn or written

"Seen" = a picture opened by the host or a walker; "operated" = the control pressed in the running app.

| # | Surface | Shows the title | Kind kept in sight | Writes the title | Seen and operated |
|---|---|---|---|---|---|
| 1 | The input's window — new | the Title box | Type box | YES | host T1–T3, P1 (pictures `t1`, `p1`) |
| 2 | The input's window — a saved input | the Title box, seeded | Type box | YES | host T9 (typed, Undo, Redo) |
| 3 | The input's window — read only (another man's) | shown, inert | Type | must not: nothing can be typed or saved | host M2 (picture `m2`) |
| 4 | The List's Add form | the Title box | Type | YES | `ui/inputtitle.test.tsx` presses it; walker A (5–7 name the doors) — to do |
| 5 | The List's rows | bold, above the kind | the Type cell | no | host T7 (picture `t7`) |
| 6 | The List's pencil editor | a Title box under Type | Type | YES | host T8 (picture `t8`) |
| 7 | The month's bar (desktop) | YES | must not — no room; said in its tip | no | host T4 (picture `t4`) |
| 8 | The month's bar (phone) | must not — the person only, as before | — | no | walker A — to do |
| 9 | The opened day's card | YES | head of the small-print line | no (opens 1) | host T5, P2 (pictures `t5`, `p2`) |
| 10 | Edit Schedule's week — the Ground Programme row | YES (the row's name) | under the name | no — the name cell is the scheduler's | host T10, T11, P3 (pictures `t10`, `p3`) |
| 11 | View-only Sched — the same row | YES | under the name | must not | host T15 (picture `t15`); the ISSUED face: walker B — to do |
| 12 | The Scheduler Board — the same row | YES | under the name box | no | host T12, P4 (pictures `t12`, `p4`) |
| 13 | The board in OIL Earn | YES (the item cell) | must not — the cell is the item's switch | no | host T13 (picture `t13`); walker C's 59 — to do |
| 14 | Personal Inputs card — the week | YES | after the name | no (opens 1) | `ui/inputtitle-row.test.tsx`; walker A's 22 — to do |
| 15 | Personal Inputs card — the board | YES | in the item cell | no | host T14 (picture `t14`) |
| 16 | Unavailable card (an OD) — week and board | YES | after the name | no | walker A's 23 — to do |
| 17 | The next-week peek | YES (the same builder) | the same | no | walker A's 36 — to do |
| 18 | The changes window — To go out | YES; a title change said "Event → Sports day" | — | no | `ui/latepub.test.tsx`; walker B — to do |
| 19 | The changes window — history; the history bubble | YES; a "title" line | — | no | `ui/inputtitle.test.tsx` (a line is written); walker B's 42 — to do |
| 20 | Warning sentences; "already on …" | YES | must not — a sentence | no | host T16 (no new warning); the words: walker C's 50–55 — to do |
| 21 | The OIL question's heading — the window, the List's form | YES | — | no | host T3 ("OIL — ALL AVAIL, Sports day"); walker C's 57 — to do |
| 22 | The OIL history / the ALL AVAIL window's heading | YES | — | no | `ui/inputtitle.test.tsx` (`oilRequestName`); walker C's 60 — to do |
| 23 | The accept / unaccept toasts | YES | — | no | walker B's 40 — to do |
| 24 | The Inputs export | a `Title` column | the `Type` column | no | `ui/inputtitle.test.tsx`, `ui/export.test.ts`; walker A's 26 — to do |
| 25 | A shared input's window | one title for everyone | Type | YES, for all | `ui/inputtitle.test.tsx`; walker A's 6, 12, 13 — to do |
| 26 | Leave, medical, Upchit, SANS editors | must not — these kinds take none | — | must not | host T1 (LL, OML); walker A's 27 — to do |
| 27 | The Logic page's kind table, Insights | must not — they are about kinds | — | — | not changed; read by both plan readers (their negatives) |

### 3a. The doors — every action the data allows, and the control that does it
| Action | The control | Operated |
|---|---|---|
| Give a new input a title | the window's Title box; the List form's | host T2, T3, T6, P1, M1; tests |
| Change a saved input's title | the window; the List's pencil | host T8, T9 |
| Take a title away | type the kind's own name, or empty the box | host T8 ("meeting" → none); tests |
| Change the kind of a titled input | the Type list | host T2 (kept across titled kinds); tests (dropped for a leave) |
| Title a shared input | its window | tests; walker A — to do |
| Undo / Redo a title | the top bar | host T9 |
| Reload | — | host R1 (a stored world) |
| Rename the ROW on the schedule (not the input) | the row's own name cell | host T11 (the label is not swallowed; it stays) |

## 4. Sizing the walk (D607 — the order's §7.0)

1. **The type of change.** D leading (a name DRAWN in many places, most through one function but several by their own
   code — the row builders, the cards, the day card, the List), with C (a new control in three editors), G (a saved
   field; the publish path) and A (one shared calculation, `inpLabel`; the engine's "one commitment" test).
2. **What only a walk could find here.** A place that draws the name by its own code and was never given the title or
   the kind label; the label's place and the row's height at each width (jsdom has no layout); the board's row, whose
   grid places cells by order; each door's Title box in a real browser (focus, an emptied box, a phone's keyboard);
   the publish orders AS THE SCREEN COUNTS THEM (five counts must agree); what each sentence on screen actually says.
   The tests and the reads already cover: what is stored for each typed state, which kinds, the pending comparison
   through the production doors, the "one commitment" rule, forty break tests (§5.5).
3. **What the ledger says.** Walks of type D found the most "never wired up" faults of any type (the OIL green edge;
   the ALL AVAIL batch earlier today: eight faults by the walk, six of them a surface or a sentence nobody had wired).
   Walks of type A alone found little. This change is mostly D.
4. **The walk chosen.** The host's own scripted walk — 23 steps, desktop 1440×900 and phone 390×760, the admin and a
   member, one stored world for the reload (§5.1). Three Sonnet walkers, each in its own world on a frozen copy of the
   build, for 50 of Astra's 64 scenarios: A — the doors and the display (19), B — the publishing orders and the history
   (15), C — roles, the warning sentences, OIL and the late mark (16); desktop for every scenario and a phone for those
   whose screen differs there; a 700-point-tall desktop once (scenario 17). **Carried by tests, not walked (14):**
   1–4 — the nine title states at the window, the List form and the pencil (`ui/inputtitle.test.tsx` presses each
   door's real controls in jsdom; `engine/inputtitle.test.ts` pins what each typed state stores; the host walked each
   door once — T1–T3, T8, T9); 8 — every kind (`engine/inputtitle.test.ts`; host T1); 18–21 and 25 — the display the
   host itself walked (T4, T5, T7, T10, T12, P2–P4); 51, 52, 56 — a clash against a flying line, against another
   commitment, crew rest (`engine/blankabsence.test.ts`, `engine/scshift-inputs.test.ts`, `engine/dutyrest.test.ts`:
   the engine calculation called directly — they prove the sentence and the grade, NOT that the screen shows it; walker
   C reads the same sentences on screen in 50, 53–55); 62 — a title cannot dodge an OIL rule (`ui/inputtitle.test.tsx`: the window's own
   question-builder asked with an Event titled "Personal" and a Personal titled "Duty" — it calls the builder, not the
   screen; walker C sees the question itself on screen in 57).
5. **After the walk:** its row is added to `docs/walk-ledger.md` (§5.6).

## 5. The walk

### 5.1 The host's own walk — `scripts/handpass/it-host-walk.mjs`, the built bundle, the app's own controls

**23 of 23 PASS; no console or page error.** Pictures: `docs/img/handpass/2026-10-09-input-title-check/host/` (17).
Opened by the host: `t10-week-rows` (the label under OPEN HOUSE, the untitled TRAINING row beside it, same height),
`t12-board-rows` (the label under the name box, the box aligned with every other row's), `t14-board-input-cards`
("Open house … MEETING LATE"), `p3-phone-week-row` (SPORTS DAY / EVENT, DUTY, OPEN HOUSE / MEETING — the titled and
untitled rows of a named man the same height), `p4-phone-board-row`, `t1`, `t5`.

| Step | What was done and seen | Result |
|---|---|---|
| T1 | the window: Title under Type for Event, Meeting, Other, OD — filled with the kind's name; none for LL, OML | PASS |
| T2 | emptied, the box stays empty (hint "Event"); typed, then the kind changed to Duty: the typed title is kept | PASS |
| T3 | a Saturday Event for ALL AVAIL titled "Sports day": the question is headed "OIL — ALL AVAIL, Sports day"; one record, its remark untouched | PASS |
| T4 | the month's bar "ALL AVAIL · Sports day"; its tip "… · Sports day · Event · 18 Jul · …" | PASS |
| T5 | the day's card: named "Sports day"; "Event" heads the small-print line, then the remark | PASS |
| T6 | a Meeting for Ranger titled "Open house" beside an untitled Training | PASS |
| T7 | the List: bold title above its kind; the untitled row as it was; search "open house" finds one row | PASS |
| T8 | the List's pencil: the title edited in the row; typed back to "meeting", none is stored | PASS |
| T9 | the window on a saved input: retitled; Undo takes it back; Redo returns it | PASS |
| T10 | Edit Schedule: the row OPEN HOUSE with "MEETING" under it, outside the name that is typed in; TRAINING has no label; both rows 43 points | PASS |
| T11 | the row's name typed in place ("OPEN HOUSE 2"): the label is not swallowed into the name, and stays | PASS |
| T12 | the board: the label under the name box; the box at the same place and width as an untitled row's; the same number of cells; the titled row 45 points against 34 | PASS — the height is §0's reading 1 |
| T13 | Saturday's board in OIL Earn: draws, no error, the mode goes off | PASS |
| T14 | the board's Personal Inputs cards: "Open house" with "Meeting"; "Training" with none | PASS |
| T15 | View-only Sched: the row named by the title, with its kind | PASS |
| T16 | the Meeting retitled "Training": Ranger's warnings that day are exactly what they were | PASS |
| P1 | a phone, the window: the Title box under Type, as wide as it | PASS |
| P2 | a phone, the day's card: "Sports day" whole, "Event" on the small-print line; 51 points, as the untitled card beside it | PASS |
| P3 | a phone, the week: the kind under the title; Ranger's titled row 41 points, his untitled row 41 | PASS |
| P4 | a phone, the board: the label under the name box, inside the screen | PASS |
| M1 | a member titles his own Appointment "Dentist": saved, on the month | PASS |
| M2 | a member opens the admin's titled Event for ALL: the title shown, nothing can be typed or saved | PASS |
| R1 | a stored world: after a reload the record, the row and its label are as they were | PASS |

**The script's own misses, read before anything was called a fault** (none was the app's): a reload on a `?fresh=1`
world starts another world (the reload has its own step, R1); `window.WARN` is not a list (`validate().all` is);
View-only Sched is the page `viewsched`; OIL Earn is offered on a weekend day's board only; the board's Personal Inputs
are behind their heading; a phone's week is one row of days that scrolls sideways — the row is brought to the screen by
the week's own scroll before it is measured or pictured.

**What the host's walk changed in the build:** the kind label was set BESIDE the name on a desktop; in picture `t10` it
had wrapped under the name, indented by its own left margin. It is now drawn under the name at every width (§0,
reading 1), and the walk was run again on that build: 23 of 23.

### 5.2 The three walkers (Sonnet 5.5, each in its own world, the frozen build)

To do.

### 5.3 What the walk found, and each disposition

To do.

### 5.5 The break tests — `scripts/handpass/it-breaks.mjs`

Forty deliberate faults, one per wire, each one exact change in one source file with a named test run against it.
**First run: 37 caught, 3 NOT caught** — a shared input's save not seeing a changed title; the List form's OIL question
headed by the kind; the clash sentence naming the kind. Each was a wire with no test, by proof; each was given one
(`ui/inputtitle.test.tsx` — the shared input, the List's question; `engine/blankabsence.test.ts` and
`engine/scshift-inputs.test.ts` — the sentences). **Second run of those three: 3 of 3 caught. All 40 are caught.**

## 6. The two reads of the code

To do.

## 7. The gates

To do.

## 8. His look

To do.
