# Bug check — an input's own title ([INPUT-OWN-TITLE]; owner D715, D716, D717)

**Branch `claude/day-window-compact`** (not merged — his word for this branch: no merge). Built and checked 9 Oct 26.
Host and builder: Opus 5.5. The plan (`docs/superpowers/plans/2026-10-09-input-own-title-plan.md`) was read by Astra and
by Sol 6.1, each blind, before the build: both "CLEAN WITH THESE EXACT CHANGES" — its §8 says what each found and what
was done. Scenario design: Astra. Code reads: Astra and Sol 6.1, each blind (D590).

**STATE OF THIS SHEET: CLOSED but for his look (§8).** Fifteen faults of this change found and fixed, each with a test
that was red first or a measured browser check — eight by the walk (W0–W7), three by Astra's read of the code, four by
Sol's; ten older small finds filed, not fixed; the gates wholly green on the last code (§7).

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
| D660, D655, D682 | a shared input is one thing for everyone in it | `ui/inputtitle.test.tsx` (the title reaches every record; typed back, every record loses it); walker A's 6, 12, 13 | PASS (the walkers, §5.2) |
| D178, D103 | an input change after publishing is pending; the sign-offs fall | `ui/latepub.test.tsx` (five cases); walker B's 28–34 | PASS (the walkers, §5.2) |
| D45 | nothing on a published schedule changes without the scheduler acknowledging it | the issued face keeps the issued name — `ui/latepub.test.tsx`; walker B | PASS (the walkers, §5.2) |
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
| 4 | The List's Add form | the Title box | Type | YES | `ui/inputtitle.test.tsx` presses it; walker A (5–7 name the doors) (§5.2) |
| 5 | The List's rows | bold, above the kind | the Type cell | no | host T7 (picture `t7`) |
| 6 | The List's pencil editor | a Title box under Type | Type | YES | host T8 (picture `t8`) |
| 7 | The month's bar (desktop) | YES | must not — no room; said in its tip | no | host T4 (picture `t4`) |
| 8 | The month's bar (phone) | must not — the person only, as before | — | no | walker A (§5.2) |
| 9 | The opened day's card | YES | head of the small-print line | no (opens 1) | host T5, P2 (pictures `t5`, `p2`) |
| 10 | Edit Schedule's week — the Ground Programme row | YES (the row's name) | under the name | no — the name cell is the scheduler's | host T10, T11, P3 (pictures `t10`, `p3`) |
| 11 | View-only Sched — the same row | YES | under the name | must not | host T15 (picture `t15`); the ISSUED face: walker B (§5.2) |
| 12 | The Scheduler Board — the same row | YES | under the name box | no | host T12, P4 (pictures `t12`, `p4`) |
| 13 | The board in OIL Earn | YES (the item cell) | YES, under the switch — first built without it: the walk's W1 | no | host T13 (picture `t13`); walker C's 59 (§5.2) |
| 14 | Personal Inputs card — the week | YES | after the name | no (opens 1) | `ui/inputtitle-row.test.tsx`; walker A's 22 (§5.2) |
| 15 | Personal Inputs card — the board | YES | in the item cell | no | host T14 (picture `t14`) |
| 16 | Unavailable card (an OD) — week and board | YES | after the name | no | walker A's 23 (§5.2) |
| 17 | The next-week peek | YES — by its OWN builder, which the roll-call wrongly called the same one | YES — first built without it: the walk's W6 | no | walker A's 36 (§5.2) |
| 18 | The changes window — To go out | YES; a title change said "Event → Sports day" | — | no | `ui/latepub.test.tsx`; walker B (§5.2) |
| 19 | The changes window — history; the history bubble | YES; a "title" line | — | no | `ui/inputtitle.test.tsx` (a line is written); walker B's 42 (§5.2) |
| 20 | Warning sentences; "already on …" | YES | must not — a sentence | no | host T16 (no new warning); the words: walker C's 50–55 (§5.2) |
| 21 | The OIL question's heading — the window, the List's form | YES | — | no | host T3 ("OIL — ALL AVAIL, Sports day"); walker C's 57 (§5.2) |
| 22 | The OIL history / the ALL AVAIL window's heading | YES | — | no | `ui/inputtitle.test.tsx` (`oilRequestName`); walker C's 60 (§5.2) |
| 23 | The accept / unaccept toasts | YES | — | no | walker B's 40 (§5.2) |
| 24 | The Inputs export | a `Title` column | the `Type` column | no | `ui/inputtitle.test.tsx`, `ui/export.test.ts`; walker A's 26 (§5.2) |
| 25 | A shared input's window | one title for everyone | Type | YES, for all | `ui/inputtitle.test.tsx`; walker A's 6, 12, 13 (§5.2) |
| 26 | Leave, medical, Upchit, SANS editors | must not — these kinds take none | — | must not | host T1 (LL, OML); walker A's 27 (§5.2) |
| 27 | The Logic page's kind table, Insights | must not — they are about kinds | — | — | not changed; read by both plan readers (their negatives) |

### 3a. The doors — every action the data allows, and the control that does it
| Action | The control | Operated |
|---|---|---|
| Give a new input a title | the window's Title box; the List form's | host T2, T3, T6, P1, M1; tests |
| Change a saved input's title | the window; the List's pencil | host T8, T9 |
| Take a title away | type the kind's own name, or empty the box | host T8 ("meeting" → none); tests |
| Change the kind of a titled input | the Type list | host T2 (kept across titled kinds); tests (dropped for a leave) |
| Title a shared input | its window | tests; walker A (§5.2) |
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

The brief: `docs/superpowers/briefs/2026-10-09-input-own-title-walk-brief.md`. The scenarios: Astra's 64
(`docs/superpowers/briefs/2026-10-09-reads/input-own-title-scenarios-astra.md`). Each walker drove the frozen copy of the
build through the app's own controls and opened the pictures it cites; the host opened the pictures of every FAIL and
placed each find (§5.3). No console or page error in any run.

| Walker | Share | Rows | PASS | FAIL / part | Report · pictures |
|---|---|---|---|---|---|
| A — the doors and the display | 5, 6, 7, 9–17, 22, 23, 24, 26, 27, 36, 49 (desktop; a phone for nine of them; a 700-point desktop) | 40 | 36 | 4 | `docs/handpass/parts/it-A.md` · `docs/img/handpass/2026-10-09-input-title-check/A/` |
| B — publishing and the history | 28–35, 37–43 (desktop; a phone for 28 and 33) | 103 | 101 | 2 | `parts/it-B.md` · `…/B/` |
| C — roles, warnings, OIL, the late mark | 44–48, 50, 53, 54, 55, 57–61, 63, 64 (desktop; a phone for four) | 26 | 22 | 2 + 2 in part | `parts/it-C.md` · `…/C/` |

**Held on screen, by scenario (the ones the tests could not prove for the screen):** every door's Title states (5–7);
a refused save keeps the typed title (10); the three "Other" cases (11); a shared input's title through membership and
date changes (12, 13); a drag and an in-place edit keep it (14); two edits behind an open window (15, 16); the export
read back — `Name, From, To, Start, End, Type, Title, Remarks`, a quoted title correct (26); no Title box on SANS,
leave, medical or an upchit (27); publish-then-title, title-then-publish, an amendment, typed back, capitals alone, an
OD with no row, two covered days, a range across weeks (28–35) — one pending change, the sign-offs down, the issued
face keeping its name; a member's own, another man's read only, a filer's, an admin's retitle, a right withdrawn
(44–48); a title of rule words against a standby shift — the grade never moved (50); two inputs of one name, both
orders, and beside a hand-typed row of that name (53, 54); the warning sentences word for word — "Overseas visit
clashes with this line", "Night exercise but tasked — …" (55); the OIL question headed by the title at every door, a
title-only edit asking nothing again and moving no figure, the ALL AVAIL heading, a published OIL result across a title
amendment (57–61); markup characters printed as text on the OIL heading, a warning, the count window, To go out, the
history and the export (63).

### 5.3 What the walk found, and each disposition

**Faults of THIS change — each fixed, each with a test that was red first (or, for a look, a measured browser check):**

| # | Found by | The fault | Cause | The fix | Its test |
|---|---|---|---|---|---|
| W0 | the host (picture `t10`) | on a desktop the kind label was set beside the name, wrapped under it anyway and stood indented | an inline label with a left margin in a column too narrow for both | the label is under the name at every width; the week's row is no taller (43 / 43, 41 / 41 measured) | `e2e/input-title.spec.ts` (under, flush with the name, the row no taller) |
| W1 | walker C, 59 | on the Scheduler Board in OIL Earn the titled row lost its kind label — in the one mode where the kind decides what the scheduler is doing | the builder left the label out where the name cell is the item's switch | the label rides the name cell's wrapper in the mode too | `ui/inputtitle-row.test.tsx` (the board in OIL Earn) |
| W2 | walker C, walker A | on a phone's List the kind's pill broke inside the word beside a title ("EVEN" over "T") | the title was drawn inline before the pill, with no style of its own | the title has a line of its own; the pill sits whole under it | `e2e/input-title.spec.ts` (the pill under the title, one line tall) |
| W3 | walker C, walker A | in the window opened from the schedule or the board, the Title box and the window's heading shared one id | the box took `inpEditTitle`, which that form of the window already used for its heading | the box is `inpEditOwnTitle` | `ui/inputtitle.test.tsx` (no id twice, in either form of the window) |
| W4 | walker C | in the changes window a DELETED titled input was headed by its kind over lines that said its title | the heading of a gone input came from the kind its lines recorded | a line records the input's own name beside its kind (`iname`); the heading uses it; a shared input's heading reads its one title | `ui/changesmodel.test.ts`, `ui/inputtitle.test.tsx` (the line carries the name) |
| W5 | walker A, 24; walker C | on the board's Personal Inputs card a 40-character title ran past its cell over its kind and LATE | the card's name had no rule for a name longer than a kind | it ends in an ellipsis inside its own cell; the full name stands on its programme row | `scripts/handpass/it-rewalk-extras.mjs` X1 (clear of the label and of LATE, desktop and phone) |
| W6 | walker A, 36 | the next-week peek drew a titled request's row with no kind label | the peek has a row builder of its own | it calls the same one answer (`rowKindTag`) | `ui/inputtitle-row.test.tsx` (the peek) |
| W7 | walker A | the List's pencil row drew its Title box at the browser's default width, wider than its column | no style | under the Type list, as wide as it | seen in the re-walk's picture |

**Not faults of this change — placed by the host, then filed (`OUTSTANDING.md` `[TITLE-CHECK-SEEN]`), not fixed:**
the "waiting to go out" list shows a shared input's change a line per man (walker B, 37 — the list never grouped; D663's
reading (2)); the take-off message "Accept undone" names no input (B, 40 — never did); a request taken off before
publication, changed, then accepted again reads as a change of words (B, 41); on a phone the "Unsaved changes" question
is raised behind the day's window (A, 9 — the host drove it with a remarks-only draft: the same, picture
`rewalk/x5`); Enter in a new input's box saves it and a blank "New input" window opens again (A — the host drove the
Remarks box, which is not this change's: the same, `it-rewalk-extras.mjs` X4); the pencil row's tick and cross are out
of Tab's reach and its end-time box is clipped; on a phone's List the OIL button is drawn over the date; in OIL Earn on
a phone a long item name is cut on one line; a 900-point desktop scrolls to reach Save in a shared window; a member
cannot switch his own puck off at creation.

**As ruled or as built, not faults:** the peek shows the working copy's name, not the issued one (A, 36b — the peek
shows the plan, by its contract); a row the scheduler renamed by hand takes the input's new title when the input is
retitled (B, 43 — a request's row is re-made when the request changes, as for its hours or its remark); the late mark
measures the last change, so a title edit is a change (C, 64).

**Could not be reached, said plainly:** the history bubble on hover and the deletion toast with markup (C, 63 — every
other surface printed the markup as text); a real on-screen keyboard (A, 17 — a short screen stood in).

**The sizing, looked at again (the order's §7.0):** every W-fault was a place that DRAWS the name by its own code — the
board in a mode, the peek, a card, the List on a phone — which is what the sizing step said a walk of this type finds.
None showed an unproved route outside the walkers' shares; the walk was not widened.

### 5.5 The break tests — `scripts/handpass/it-breaks.mjs`

Forty deliberate faults, one per wire, each one exact change in one source file with a named test run against it.
**First run: 37 caught, 3 NOT caught** — a shared input's save not seeing a changed title; the List form's OIL question
headed by the kind; the clash sentence naming the kind. Each was a wire with no test, by proof; each was given one
(`ui/inputtitle.test.tsx` — the shared input, the List's question; `engine/blankabsence.test.ts` and
`engine/scshift-inputs.test.ts` — the sentences). **Second run of those three: 3 of 3 caught. All 40 are caught.**

### 5.6 The re-walk — the final build, after every fix (W0–W7, the reads' seven)

`scripts/handpass/it-host-walk.mjs` again, its pictures kept apart from the first walk's
(`docs/img/handpass/2026-10-09-input-title-check/rewalk/`): **23 of 23 PASS, no console or page error.** And
`scripts/handpass/it-rewalk-extras.mjs` — the walkers' finds the host's walk does not drive, each re-driven as an
assertion of the right behaviour: **7 of 7 PASS** (X1 the board's card of a 40-character title, a desktop and a phone:
the name ends in an ellipsis inside its cell, clear of its kind and of LATE; X2 its row keeps its kind; X3 Saturday's
board in OIL Earn: the name cell is the switch and "EVENT" stands under it; X4, X5 the two older finds, placed).
Opened by the host: `rewalk/x3-board-oil-earn-kind`, `rewalk/x1-phone-board-card-40`. **What the re-walk did not drive
again:** the walkers' publishing orders (28–43) — the reads' fixes there are words in the changes window and the
history, carried by `ui/latepub.test.tsx` and `ui/inputtitle.test.tsx`, which drive the production doors and read the
same builders the screen calls; a split filing's heading (`ui/changesmodel.test.ts`); the OIL explanations' wording
(`ui/inputtitle.test.tsx` calls the one name function; the sentences themselves were not seen on screen again — a
limit, said here).

**The walk's row in the ledger:** `docs/walk-ledger.md`, 9 Oct 26.

## 6. The two reads of the code (each blind; this sheet in hand; their reports are kept beside the briefs)

The brief: `docs/superpowers/briefs/2026-10-09-input-own-title-code-read.md`. Reports:
`docs/superpowers/briefs/2026-10-09-reads/input-own-title-code-astra.md`, `…-code-sol.md`. **Both: CHANGES REQUIRED —
three findings and four, all seven different, all seven real.** Each was reproduced as a failing test before its fix.

| # | Reader | The failure | Cause | The fix | Test |
|---|---|---|---|---|---|
| R1 | Astra | a kind and a title changed in ONE save ("Sports day", an Event → "Guard shift", a Duty) wrote "Event → Duty" and nothing of the title — in the history and in "To go out" | the title line was written only where the kind stood still | the title each side STORES is compared by itself; two untitled kinds still write the kind's line alone | `ui/inputtitle.test.tsx` (four cases), `ui/latepub.test.tsx` |
| R2 | Astra | filed for several people from the List's form, a title stayed in the form and rode onto the next input whatever its kind | the shared save cleared the remark and not the title | it clears the title too — after a save only | `ui/inputtitle.test.tsx` (the List's form, several people) |
| R3 | Astra | the board shown read only (a look at an issued version; a member's view) named a titled input's card and dropped its kind — a titled OD has no programme row to say "OD" for it | that card has a short route of its own | the label rides the name's own cell there too | `ui/inputtitle-row.test.tsx` (the board read only) |
| R4 | Sol | a filing whose men now carry different titles was headed by ONE of them, and which one depended on the order the records were stored in | the heading read the first record of the group | every title its surviving men carry, sorted | `ui/changesmodel.test.ts` (both orders) |
| R5 | Sol | OIL explanations still called a titled claim "this Event" — the off puck's reason, the ALL AVAIL window's hint, "his Event's row is cancelled"; and the crew picker's reason said "overseas duty (OD)" for "Exercise Darwin" | these read the evidence's kind, or the kind's catalogue words | one name for a claim, looked up for the words only, from the input as the day being read holds it; `offWord` leads with the title. The OIL evidence itself never learns a title | `ui/inputtitle.test.tsx` (`oilClaimWhat`, `offWord`) |
| R6 | Sol | a titled input handed to another man kept its title, and the history line said "Event … · whose" | that sentence was missed by the naming sweep | it names the input by its title | `ui/inputtitle.test.tsx` (the hand-over) |
| R7 | Sol | `data-schema.md` and `data-model.md` still listed a shared entry's shared fields without the title | not updated with the code | both lists carry it | the documents |

**Their notes on the tests, each acted on:** the pencil-editor test claimed a retype to a leave and stopped at Personal
without saving (Sol) — a new test retypes to LL, sees the Title box go, saves and reads the record; the break tests
prove the wires chosen for breaking, not the callers nobody listed (Sol) — R4–R6 were exactly such callers, and each
now has its test.
**Found sound by both, by tracing (their explicit negatives):** the ten kinds and no other; the editors' "untouched" and
"emptied" states; every writer of an input carrying the title — the window, the List, the group save, a re-date, a
hand-over, an in-place edit, the medical splits, undo and redo, a reload; a draft that does not state a title leaving
it alone; the published day — one pending change, the sign-offs, the issued face reading its frozen copy; the kind
label outside the name that is typed in, the board's wrapper keeping every cell in its place; two requests of one name
staying two, in either order, and no figure counting a man twice; warnings graded by kind whatever a title says; the
export; permissions unchanged.
**Not repeated by a second round of reads:** the seven fixes are small, each pinned by a test that was red, and the
gates ran on them (§7); a second static round is what the checking order calls review pile-on. The re-walk (§5.6) drove
the build that carries them.

## 7. The gates — watched, under the PC's lock (`node scripts/gatelock.mjs run`)

| Gate | After the walk's fixes | FINAL — after both reads' fixes, commit `f296fac4` |
|---|---|---|
| Unit | green (one earlier run) | **9663 / 9663** (574 files) |
| Build (typecheck + bundle) | clean | **clean** |
| The original's own assertions (tfin) | 728 / 0 | **728 / 0** |
| Browser tests (e2e) | 735 passed, 1 FAILED — the older test of the demo's Event looked for the word "Event" on its bar, which now reads its title; restated for D716 and re-run with the title's own: 8 of 8 | **736 passed, 0 failed, 57 skipped** |
| Tracker smoke | 445 / 0 | **445 / 0** |
| Rule coverage | OK | **OK** |
| Documents | OK | **OK** (over its size tripwire, deferred — D29: a change under `src/` never trims a document) |

`perms.test.ts` and `perms-scan.test.ts` ran green in the unit gate; no row of the permissions table (data-model §11)
changed. The typecheck is `tsc -b` (the build's own): `tsc -p .` checks nothing in this repo, which the builder learned
mid-build from four missing imports it had reported as clean.

`Walk: docs/handpass/2026-10-09-input-title-check.md · about 1,200 pictures (host 40, walkers about 1,150) · 27 surfaces · 50 scenarios + 23 host steps + 7 re-walk extras · MISSING: 15 fixed (W0–W7, R1–R7), 10 filed ([TITLE-CHECK-SEEN]), 2 named and not reached (the history bubble on hover, the deletion toast with markup)`

## 8. His look — five minutes on his iPhone, on this branch's preview link

1. **Inputs → the calendar → tap a day → + Input.** Pick "Event": a Title box under Type reads "Event". Type "Sports
   day", save. *The bar on the month reads the title (on a desktop), the day's card reads "Sports day" with a small grey
   EVENT on the line below.*
2. **Pick a leave (LL) instead:** *no Title box.*
3. **Edit Schedule, that day:** *the Ground Programme row is named SPORTS DAY with a small EVENT under it, and is no
   taller than the row beside it.*
4. **Open the Scheduler Board for that day:** *the same row, EVENT under its name box.*
5. **Inputs → List:** *the row shows "Sports day" in bold with the EVENT tag whole under it.* (This list is the one
   D718 redraws; what you see here is the title made to fit the list as it is.)

**Not on the card, and why:** the published-day behaviour (a title changed after publishing shows "1 pending") needs a
day published first — walked by walker B in fifteen orders, and pinned by tests.
