# Evidence — the Tracker leftovers (28 Sep 26)

Branch `claude/tracker-leftovers-f79d36` (preview 4175, `E2E_PORT=4192`, rulings D370–D379 — his instruction of 28 Sep
26; parallel with `claude/change-recording-retest`, `claude/docs-tidy-subheads-audit-ec8f87` and
`claude/small-fixes-batch-d223f6`, coordinated by message, D302). Items: `[TRK-RETEST-NOTES]`, `[TRK-EDIT-SIDEWAYS]`,
`[TRK-SESSION-PICK]`, `[TRK-DLG-LEFTOVERS]`, `[TRK-BAKE-STALE]`. Plan (with the red team's changes, §6):
`docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`. Pictures: `docs/img/handpass/2026-09-28-trk-leftovers/`
(`baseline/` before the fixes, `mock/` his choices, `walk/` after). Step logs: `docs/handpass/parts/trk-leftovers/`.

## 1. The eight questions and the tier

| # | Question | Answer, with the reason |
|---|---|---|
| 1 | Money / owed | NO — the Tracker holds course progress; no OIL, leave or manning |
| 2 | Published record | NO — nothing in the Tracker is published or signed |
| 3 | Saved data | **YES** — each person's remembered course and student; what a date box saves while typed; the order a student's failures are stored in; the pace and lull periods now in the undo history |
| 4 | A shared drawer | **YES** — the ball (`ballGroup`, every event on every chart); the question box (every question in the Tracker) |
| 5 | A new gesture or mode | **YES** — a press on a failure tick; the folded tools and Tools ▾ |
| 6 | A new surface | **YES** — the folded tool row on a short screen |
| 7 | Roles | NO — the Tracker reads no role (D121); the per-person pick is about who, not what they may do |
| 8 | The warning list | NO |

**Tier: FULL** (question 3). **The server question (D202): NO** — no rule about who may do what, what anyone is owed,
an official record or personal details; `perms.ts` and `data-model.md` §11 untouched.

## 2. Rulings that apply (the rules sweep) — and how each is honoured

| Ruling | What it asks | Where it is pinned / walked |
|---|---|---|
| **D370** (28 Sep 26, "1 yes") | an N.A. event's failures leave the Failures card, its total and the full list; kept, back when graded | `leftovers.test.tsx` "D370 …"; walk B |
| **D371** ("2 yes") | failures by DAY; − takes back the latest day | "D371 …" (2 tests); smoke's three failure checks updated; walk B |
| **D372** ("3 a") | a pace, end-date or lull change is an undo step; Copy to… is one | "D372 …" (4 tests); walk B |
| **D373** ("6 fold") | on a short screen the edit tools fold behind one row; Tools ▾ opens the set over the chart | "D373 …"; `trk-lo-10-fold.mjs`; walk C |
| **D374** ("4 yes") | a day after today refused in Done on, Failed on, both Last Flown; Upchit and end dates take any day | "C8 + D374 …" (4 tests); walk B |
| **D375** ("5 keep") | a students import's new course joins at the bottom | as built; `known-gaps.md` |
| **D376** ("7 own place") | each person reopens on their own course and student | "D376 …" (6 tests); smoke's reopen block; walk A |
| D120, D56 | the export → wipe → import route; nothing built around stored demo data | old unprefixed pick keys and older file formats left (plan §5) |
| D121 | the same Tracker for everyone | walk C (member) |
| D123, R50 (narrowed by D374) | Last Flown the latest day flown; a hand-typed day stands until a later flight — any day up to today | the four older date tests updated to days before today |
| D126, R26 | details per chart; his chart loop (bake) | bake test + `trk-lo-12-bake.mjs` |
| D129 | logout asks about unsaved chart edits | unchanged; the resume waits while an edit is unsaved |
| D190/D191 | the + Add dialog never loses a typed name; OK adds a search matching nobody | older tests green; C11 keeps the pick by id |
| R42/R43/R46/R52/R53/R54/R109/R110/R114/R115 (register) | failures, dates, lulls, pace, undo, popups, repeated taps | pointers added to the register rows D370–D374 changed |
| Standing: a click-open popup closes on a click outside | the Tools ▾ set | "D373 …" test (a press outside) and the fold walk |

No clash between rulings found beyond the narrowings recorded (D374 narrows R50; D371 settles R42/R43's reading).

## 3. The roll-calls

Every row: **YES** (built, and where it is proved), **NO — because …**, or **MISSING** (with its disposition, §9). No
blanks. "Walk" names the step log in `docs/handpass/parts/trk-leftovers/walk/` (first walk) and `…/rewalk/` (after
the fixes); "test" names a test in `src/tracker/leftovers.test.tsx` unless said otherwise.

### 3.1 The pick — every door that sets or reads a person's course and student (D376)

| Door | Per person? | Proved by |
|---|---|---|
| The Crew box | YES — filed under the signed-in person | walk `lo-2a-pick` S3, S7a (desk and phone); test "D376 …" |
| A press on a student's slice of a ball | YES | walk S7b |
| A press on a student's red failure tick (C6) | YES — the tick is part of the slice | walk `lo-2b-tick-lull` C6.3–C6.8 |
| + Add student | YES — the student added becomes the pick (Fable A13) | walk S1, S7c |
| Remove student | YES — clears only this person's pick; another's falls back to a student on the course | walk S10; test |
| ↶ / ↷ that moves the picker | YES — the pick it lands on is this person's | walk S7d |
| The Course box / a course switch | YES — each person's last course | walk S3, S4, S9 |
| Rename course | NO — because a course is known by its hidden id; a rename moves nothing | walk S10b (a student renamed, same idea); architecture (1B-i) |
| Delete course (or the remembered course gone) | YES — falls back to the first course, never blank | walk S9 |
| A syllabus switch | NO — because the pick is per course, not per chart; a switch keeps it | test "D376 …" |
| Import | YES — a person stays on their own place; nobody else's pick moves | walk S11 |
| The first open (boot) | YES — reads the signed-in person's place | walk S0, S4 (after a reload) |
| Sign-out → another person signs in (the Tracker already open) | YES — the page reads "Loading…" and nothing can be pressed until their place is on screen | walk S2, S3, S5; test; break test "D376 no press while reloading" |
| The same person out and in | YES — no reload, no "Loading…" | walk S6 |
| The admin's member view (D292) | NO — because it is the same person; nothing moves | walk S8 |
| An unsaved chart edit when the person changes | YES — the resume waits; D129's logout question comes first | test "unsaved chart edit is never replaced"; break test |
| Nobody signed in (the standalone Tracker) | YES — one place for the browser, as before | test (standalone path); smoke |
| The bar's save words after a sign-out | YES — cleared (walker a F1, fixed) | first walk S2 **FAIL** → fixed → re-walk S2 |

### 3.2 The question box — every question, and every box that acts on Enter (B1, B2, C11)

| Place | Built | Proved by |
|---|---|---|
| Two questions at once (any pair: a rename, + Add, a chart import's per-chart questions) | YES — the second waits; the first is never left unanswered | walk `lo-2a-dlg` D7/P7; tests; break "B1 the queue" |
| Signing out with a question waiting | YES — every waiting question is cancelled; none reaches the next person | test; break |
| Tab / Shift+Tab while a question is up | YES — stays inside it; the rest of the Tracker is shut | walk D1, D3, P1, P3; `lo-2a-roster` 1 |
| Raptor's Logout while a question is up | YES — refused, the question stays | walk D4, P4 |
| Escape | YES — answers the question on screen, nothing else | walk D5, P5 |
| Delete / Backspace on the chart while a question is up | YES — ignored (walker a F2, fixed) | first walk D6, D6b **FAIL** → fixed → re-walk |
| The text box (rename, name a ball…) — Enter while a word is being composed | YES — not an answer | walk `lo-2a-ime` 1 (desk and phone) |
| + Add's search — Enter while composing | YES — picks nobody, adds no half-typed name | walk `lo-2a-ime` 2, 3 |
| Find event — Enter while composing | YES — does not step | walk `lo-2a-ime` 4 |
| Show All's editor — Ctrl+Enter while composing | YES — does not save | walk `lo-2a-ime` 5 (Name, Crew) |
| Any other Tracker box acting on Enter | NO — because the only others are the date boxes (a date takes no composed word; guarded anyway) and the Failures title (a button, not a text box) — searched every `'Enter'` in the Tracker | the plan §B2 roll-call |
| + Add's list while the roster changes behind it | YES — follows the roster, keeps the search | walk `lo-2a-roster` 2–4 |

### 3.3 Every date box (C5, D374, and walker b's findings)

| Box | Saves only when LEFT | A day not finished | A day after today | Same day again: no step |
|---|---|---|---|---|
| Done on (grading pop-up) | YES | refused, the day stays with its line; a grade is refused until it is put right (F-b3) | refused, stays with its line; a grade is refused (F-b1) | YES |
| Failed on (grading pop-up) | NO — because it saves nothing: it says where the NEXT + lands | refused, stays with its line; + refused (F-b3) | refused, stays with its line; + refused (F-b2) | NO — because it saves nothing |
| Each row of the full failures list | YES | put back to the saved day | refused, put back, one line; the line goes if the row's day changes under it (F-b4) | YES |
| Last Flown (Syllabus) | YES | put back | refused, put back, one line | YES |
| Last Flown (Currency) | YES | put back | refused, put back, one line | YES |
| Upchit | YES | put back | taken (a planned date, D374) | YES |
| End date A | YES | put back | taken | YES |
| End date B | YES | put back | taken | YES |
| Down days, pace | NO — because they are numbers, not dates: each keystroke is a real number (left, plan §C5) | — | — | pace YES |

Walked on desktop and phone, typed with the real keyboard, slowly where slowness matters (`lo-2b-dates`, 70 checks
each size), and left every way: Tab, a click elsewhere, Enter, Escape (Escape keeps the day as it closes the
pop-up). **"Today" is the squadron's day (Singapore), not the device's** (D374 reading 1).

### 3.4 The ball — the one drawer (`ballGroup`, one caller: the chart)

| Where the ball is drawn | The change | Proved by |
|---|---|---|
| The chart, marking | a tick press picks its student (C6); N.A. hides the ticks (as before) | walk `lo-2b-tick-lull` C6; `lo-2b-fails` C2.4, C2.11 |
| The chart, ✎ Edit chart layout | NO — because a press there is wired to the editing tools (drag, line, text, delete), never to grading, so a tick press has nothing to pick | the code's one wiring (`wireBoard`); walk `lo-2c-fold` 1.14 (✎ Text opens THAT ball's editor) |
| The chart, ⓘ details mode | NO — because a press there opens the details bubble, never grading | `wireBoard`; walk `lo-2b-fails` C3.5, C2.8 |
| Show All, the Failures card, the full list | NO — because they draw no ball; they list failures in words (D370/D371 walked there) | `lo-2b-fails` C2.3, C3.3, C3.4 |

What else is painted on the same pixels: the tick sits on its slice's rim, so the press point is checked to be ON the
tick, not the slice beside it (C6.3, C6.6).

### 3.5 The folded tools (D373) — every tool in the set, and every state it can be open over

| Tool / state | Built | Proved by |
|---|---|---|
| + Flight, + Test, + Acad (a question follows) | YES — the set shuts BEFORE the question shows | walk `lo-2c-fold` 1.3–1.7, 2.2, 3.3 |
| 📋 Edit events | YES — its window fits the sideways screen | 1.8–1.10 |
| ↺ Reset layout | YES — its question on top; Cancel changes nothing | 1.11–1.12 |
| ✎ Text, ╱ Line (a mode) | YES — the row shows the tool and its hint; the next tap lands on the chart | 1.13–1.17 |
| ⤢ Fit | YES — in the row itself | `lo-10-fold` |
| A pinch, a one-finger pan on the freed chart | YES — the point under the fingers stays | 1.18, 1.19 |
| A question raised while the set is open | YES — on top; the first Escape answers it, the second shuts the set | 2.4–2.6 |
| A press outside | YES — shuts it (the standing rule) | `lo-10-fold`; test |
| Turning the phone, the set open or shut | YES — the set shuts; the canvas is re-cut, the middle kept (walker c F1/F5, fixed) | first walk 5 **FAIL** → fixed → re-walk |
| Upright phone, desktop | NO — because the fold is only for a window under ~500px tall | `lo-10-fold` (390×844, 1440×900) |
| A 1280×480 desktop window | YES — folds too (it is short) | 2.1–2.7 |
| The member (D121) | YES — the same | 3.1–3.5; `lo-2c-member` |

### 3.6 The undo steps added (D372)

| Change | One step? | ↶ and Ctrl+Z | ↷ | Proved by |
|---|---|---|---|---|
| Pace | YES — keystrokes within 2 s are one step | takes it back; the older mark stays | puts it again | `lo-2b-undo` 1 |
| End date A, End date B | YES | YES | YES | `lo-2b-undo` 2, 3 |
| A lull period set, changed, removed (removal asks first) | YES, each | YES | YES | `lo-2b-undo` 4–6 |
| Copy to… (several students) | ONE step for all | all back together; Crew stays | all again | `lo-2b-undo` 7 |
| Anything R110 keeps out (students, courses, syllabi, details, Import) | NO — because D372 left R110's list standing | — | — | tests |

## 4. The orders walked (both ways round)

| Pair / order | Walked | Result |
|---|---|---|
| Admin then member, member then admin — no reload between | `lo-2a-pick` S2, S3 (desk, phone) | each on their own place; the other's untouched |
| Each after a reload | S4 | each from storage |
| Sign-ins without opening the Tracker, then open | S5 | the one who opens gets their own place |
| The same person out and in | S6 | no reload, no "Loading…" |
| Admin view → member view → admin view | S8 | nothing moves; a pick in the member view is the admin's |
| A press made while a place loads | S2 (CPU slowed 20×) | grades nobody; a tap that arrives after the load acts on the new chart (§9 R1) |
| Type a day slowly, then leave by Tab / click / Enter / Escape | `lo-2b-dates` 1–2 | saved once, one step; Escape keeps it as it closes |
| A day after today, then corrected — and corrected, then a day after today | `lo-2b-dates` 1–4 | refused then saved; the line goes at the next change |
| Date first, then grade / + — and grade / + first, then date | `lo-2b-dates` 2–3 | a refused day refuses the press (F-b1, F-b2); a whole day lands |
| A failure today then one back-dated, and the reverse; − after each | `lo-2b-fails` C3 | the earlier DAY is the plain code; − takes the latest day |
| N.A. then graded again | `lo-2b-fails` C2 | failures leave the card and ball, come back with their days |
| A change, ↶, ↷ — by the bar's buttons and by Ctrl+Z / Ctrl+Y | `lo-2b-undo` 1–7 | each change one step; Copy to… one step for all |
| Tools ▾ open, then turn; shut, then turn; both directions | `lo-2c-fold` 1.20–1.23, 5 | the set shuts; the canvas re-fits (walker c F1/F5; §9 R2) |
| A question raised while the set is open; Escape twice | `lo-2c-fold` 2.4–2.6 | question on top; first Escape answers it, second shuts the set |
| Two questions at once, answered in turn | `lo-2a-dlg` 7 | both answered as chosen |
| A question up, then Logout / Delete / Backspace / Escape | `lo-2a-dlg` 4–6 | refused / ignored / answers it |

## 5. The pictures

Folders under `docs/img/handpass/2026-09-28-trk-leftovers/`: `baseline/` (before any fix — each note as it stood),
`mock/` (his two choices for the sideways phone), `walk/` (the three walkers' first walk — the evidence of every
finding in §9), `rewalk/` (the same scripts after the fixes). Every picture a check names was opened and looked at
(order §10 item 21); the ones on the look card are named there.

## 6. The break tests

`scripts/handpass/trk-lo-breaks.mjs`: every wire the roll-call marks as built is broken once, its named test must
go RED, and the file must come back byte for byte. Record: `docs/handpass/parts/trk-leftovers/walk/lo-breaks.json`.

## 7. Errors seen

None in any walk or re-walk: every script ends with "no console errors, page errors, failed requests or native
dialogs" and passed it.

## 8. What was NOT walked, and why

| Not walked | Why | Covered instead by |
|---|---|---|
| A real phone keyboard composing a word | the walk drives the browser's own composition events, the same events a phone keyboard sends | `lo-2a-ime`; **his look (a phone)** |
| A real phone turned | a window resize stands in for the turn | `lo-2c-fold` 5, `lo-10-fold`; **his look** |
| Safari's date box (iPhone) | its wheel cannot part-type a day; the refusals still apply | tests; **his look** |
| Firefox | not a browser he uses | — |
| Two browsers or devices at once | a place is remembered per browser by design (D376 reading); the database will carry it | — |
| Older stored data, older file formats | D56 / D120 — the store is cleared and the charts reach the database by export → wipe → import | — |
| The Tracker outside Raptor (standalone) | not served by this build | unit tests (the standalone pick) |

## 9. What the walk found, and each disposition

| # | Found | Disposition |
|---|---|---|
| a-F1 | After a sign-out the bar's save words still named the last person's course ("● switched to 26ABSG") over the next person's | FIXED (red test first) — the words go with the session |
| a-F2 | Delete / Backspace on the chart acted behind an open question | FIXED — keys wait while a question is up |
| b-F1 | A future Done on, left, snapped to today; the grade then landed on today under a "refused" line | FIXED — the day stays with its line; the grade is refused |
| b-F2 | The same for Failed on and + | FIXED |
| b-F3 | A day not finished (a year still being typed, a part cleared) was recorded as today | FIXED — refused with "That day isn’t finished…"; an empty box still means today |
| b-F4 | A refusal line under a failures-list row stayed after a re-sort moved another failure into the row | FIXED — the line goes with its day |
| b-F5 | The N.A. refusal was said only on the hint line, which the pop-up covers on a phone | FIXED — said inside the pop-up too |
| b (first run) | Two pace-undo checks failed in the committed first run | NOT REPRODUCED — no code change was made for them; the re-walk passes both on desktop and phone; the first run's record stays in `walk/` |
| c-F1 | Turning the phone while editing left the canvas cut for the old shape; the middle ball off screen | FIXED — the canvas re-fits, the middle kept |
| c-F2 | Raptor's "Not saved — Retry" note covers the Tracker's ✓ Save changes (1200px) and ✎ Syllabus (390px) | FILED — `[SAVE-NOTE-COVERS]` (a shell matter; medium, next) |
| c-F3 | Inside Raptor a failed save still reads "saved" in the Tracker's corner | FILED — `[TRK-SAVE-FAIL-SAYS-SAVED]` (with `[DB-READINESS]`) |
| c-F4 | The Crew box cut a 14-letter name | FIXED from 600px wide (176px — the whole name); an upright phone keeps 124px, the most its bar's first row holds, and shows at least 9 letters (a puck shows ~9–10, D289) |
| c-F5 | The Tools set came back open over the chart after a turn | FIXED — a turn shuts it |
| R1 | Re-walk, phone: the member's place read the second student | NOT A DEFECT, proved: the Crew box read the first student when her place appeared; the walk's own probe tap then arrived after the load on the second student's slice and picked her (her own pick, D376 reading 2). The check now judges the place she opened on |
| R2 | Re-walk: the editing canvas kept a 300px floor in a 169px box on a sideways phone — 130px of hidden canvas the box could scroll into (Fit still kept every ball in sight). The rule had TWO copies, the re-fit and the chart's redraw | FIXED (red test and red browser check first) — one shared rule, never taller than its box; `lo-10-fold` "no taller than the chart box" (820×145 in 844×170), picture `rewalk/fold-2b-sideways-after-fit.png` |
| C12 | Raptor's own bar is two rows on a sideways phone | FILED — `[SHELL-SIDEWAYS-BAR]` |
| C13 | The dozing-page comment was wrong | FIXED (the comment); FILED `[LW-DOZE-GUARDS]` |
