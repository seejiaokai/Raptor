# `[OIL-ASK-NOTIFY]` — the bug check (FULL) — IN PROGRESS, 13 Oct 26

**Where it stands:** built, unit-tested, the host's own look done on the built screens beside the approved pictures.
**NOT DONE YET — nothing may be called ready for "merge live":** the walk (§7), the break tests, Fable's read of the
finished code and the blind Opus read beside it, the fixes and re-walk, the whole gate set in one run, his look (§10).
`Walk: NOT DONE — the build chat's context ran out after the host's look; the walk is the next chat's first job`.

Branch `claude/oil-ask-notify`. Rulings D780–D784 (`grep -h '^| D78[0-4] |' .claude/decisions-full/*.md`). The plan
`docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md` (§5a: Fable's read). The register
`docs/superpowers/specs/2026-10-12-oil-ask-notify-behaviour-register.md` (ON1–ON16). Pictures of record
`docs/mock/2026-10-12-oil-notify/`; the built screens `docs/img/handpass/2026-10-13-oil-ask-notify/look/`.

## 1. The eight questions — tier FULL

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | OIL | YES | every part decides whether an input's OIL question is answered, and by whom |
| 2 | The published record | YES | a swap or an add on a published day now waits; an answer in the list changes a published day's input |
| 3 | Saved data | YES | a second kind of notice in the saved `notices` records |
| 4 | A shared drawer | YES | the bell's list (two bars), the input's card, the landing flash |
| 5 | A new gesture | YES | Don't swap / Swap, the bar's two buttons, the list's picks, Yes to all / No to all |
| 6 | A new surface | YES | the one list; the bar |
| 7 | Roles | YES | who is told (schedulers), who may answer from the list, a member's bell unchanged |
| 8 | The warning list | NO | no warning's words and no rule of `validate()` is touched (the diff has no file of `engine/validate.ts`) |

## 2. The rulings swept

D780 (never silent) · D781 (the admin told at once; what he answers tells nobody; unanswered → no swap) · D782 (the one
list, Yes to all / No to all) · D783 (not made until answered; flash and a bar that stays; the list opens by itself;
one bell line a holiday, counting what is left) · D784 (Fable reads) · D762 (one answer an input) · D755 (the row is
the input) · D769 (the bell's tap order) · D103 (a pending change wipes the sign-offs) · D21 (an Off day earns no OIL) ·
D641 (the page works behind a window) · D706 (a phone window as tall as its content) · D56 · D754. **No clash found.**
D755 (1) "asks the scheduler on the spot" and GI7 are narrowed by D783 (the question now comes BEFORE the add) — said
in the register's last section.

## 3. Fable's read of the PLAN (12 Oct 26 — 400k tokens, one round)

Ten findings, all taken after each was checked against the code (the plan §5a holds them): **A1** `gesture` is not the
one end every holiday-making write passes (blocked the build) · **A2** a dry `normalizeInputDraft` cannot see the
save's own refusals → the real save tried and thrown away (blocked the build) · **A3** the fourth answer at every
caller · **A4** the gesture's own ending on the answered path · **A5** rows by their ids · **A6** the bell line's tap and
words, one rule for "is it shown" · **A7** one line a holiday made twice · **A8** where the swap's answer is written ·
**A9** the count remembered · **A10** a medical never asks OIL. Its explicit negatives (doors enumerated: the drag's
seat drop, cell drop and let-go; the armed tap; the store's writers; the right-click; the typed boxes; the input's own
window; the Unavailable row; the calendar's drag; a load / plan / template — none missing beyond A1–A3; the child
command inside the war's command accepted, its Undo and Redo; no dead end at the bell) are in the chat's record of
that run and were each relied on in the build.

**One thing the build changed from Fable's A2:** the save is tried and thrown away ONLY where the gate says a question
will be put (the gate is asked first). Trying it on every drop put every record back as a new object on every drop —
six older tests that hold a record across a move failed on it — and nearly every drop asks nothing.

## 4. The roll-call — every place each thing is drawn or decided

| # | Place | Has it / must not / MISSING | Proof so far |
|---|---|---|---|
| R1 | Board — a puck dragged from a seat onto an input's only puck | HAS (question first, bar, flash both) | unit ON1; e2e desktop + phone; look |
| R2 | Edit Schedule's week — the same drag | HAS by the same `applyDrop` — **NOT YET SEEN on the week** | unit (the drop on a stand-in element) — walk it |
| R3 | A crew-list man dropped on the only puck (board, week) | HAS ("Putting … in place of …") | unit ON1 — walk it |
| R4 | "+ add" / a puck of a several-person row / a place under it — drop | HAS (add waits) | unit ON3 — walk it |
| R5 | The armed tap (phone and desktop) | HAS (stays armed; the arm put down on the answer) | unit ON5 — **walk it on a phone** |
| R6 | The store's own writers | HAS | unit ON5 |
| R7 | One input's row → another's (a move) | HAS | unit ON4 — walk it |
| R8 | ALL AVAIL / ALL dropped on an unanswered input's row | HAS (an add) | not tested by name — **walk it; add a test** |
| R9 | The Unavailable row's person — drag and armed tap | HAS ("Not swapped") | unit ON9 — **walk both doors** |
| R10 | The Inputs calendar's date drag — a chip in a day, and a BAR | HAS ("Not moved"); the landing flash on the answer | unit ON9 — **walk: the bar's flash selector is `#inpCal [data-iid]`, unproved on screen** |
| R11 | The input's own window (save) | MUST NOT change — it always asked first | untouched |
| R12 | A time or remark typed on the row | MUST NOT ask (D739 reading 4) | untouched; reqdoor tests |
| R13 | A puck taken OFF a row; right-click | MUST NOT ask | untouched |
| R14 | The bar over: the board, the week, the Inputs calendar, the Leave War page, a window on the shell | HAS on the board (e2e: on top, inside) — **the others not measured** | walk it |
| R15 | The bar and the question on a short screen (390×568, 844×390) | **NOT YET SEEN** | walk it |
| R16 | The one list — opened by the Holidays list's save | HAS | unit ON12; e2e; look |
| R17 | The one list — opened from the Leave War's Event row (the sheet's save, a typed word, a band) | HAS in the unit test — **NOT YET SEEN on the Leave War page** (the window is mounted at App level) | walk it |
| R18 | The bell's list — the top bar's bell | HAS | look; e2e |
| R19 | The bell's list — the Scheduler Board's own bell | HAS by the one `BellList` — **NOT YET SEEN** | walk it |
| R20 | The bell's list on a phone | HAS | look (phone) |
| R21 | A member's bell; a man merely in a shared input; a guest | MUST NOT show a holiday line | unit ON12, ON16 — walk the guest |
| R22 | The "OIL?" tag on the day's cards (D777) after a holiday | unchanged — still shown until answered | look (as built picture) |
| R23 | OIL Earn / the Leave War's OIL figures after an answer from the list | reads the input's `oil` as ever — **the downstream figure NOT YET OBSERVED** | walk it (the order's "real downstream result") |
| R24 | A published Friday made a holiday; an answer from the list on it | D2 / D103 as built — **NOT YET OBSERVED** | walk it (Fable's scenario 32) |

## 5. The door check — a control for every action

Swap / add / move: the drag, the armed tap → the question (Yes / No / days; Swap / Add / Move; Don't …; ✕; Escape;
press outside) → the bar (Answer OIL; OK). The list: opens by itself; the bell's line; each card's Yes / No (a second
press un-picks); Yes to all; No to all; Save; Later; ✕; Escape; a card's name opens the input. A holiday's notice: no
control of its own — "Mark all read" and a tap on the line. **A door NOT offered, on purpose:** the list has no way in
except the holiday's save and the bell's line (so a day with nothing left has no list to open); a member has none.

## 6. The five sizing lines (D607) — written before any walker

1. **Type:** C (new controls: the waiting question, the bar, the picks), B (the one list), D (the bell's list on two
   bars; the flash), G (saved notices, publish, Undo / Redo, reload), H (who is told, who may answer).
2. **What only a walk could find here:** a surface where the question, the bar or the list is drawn under something
   or off the screen (the week, the Leave War page, a short phone); a door that still writes first (R2–R10 are proved
   only through the door function, not through each real gesture); the armed tap on a real phone; the list opened
   from the Leave War; the downstream OIL figure. The unit tests carry: the arithmetic of what is asked (one gate),
   the one-command / one-Undo property, who is told, the count.
3. **What the ledger says:** walks of C / B / G / H changes of this size found 1–5 faults each (the bell's notices: 2
   in a short look; the one-rule check: 5 with twelve walkers at 4.95M tokens; the group-row check: 1 with three at
   1.4M). The host's look on this job has already found 3 (all look, §7).
4. **The walk chosen:** 3 Sonnet walkers, each its own browser world on one served build, about 30 scenarios of
   Fable's 35 (§8): **W1** the swap, the add, the move on the board and the week, desktop, unpublished and published,
   Undo / Redo / reload (S1–3, 6–13, 35); **W2** the phone by touch and the short screens — armed tap, the drag, the
   bar, the list, the Unavailable row and the calendar's drag (S4, 5, 14, 15, 31); **W3** the holiday from both doors,
   the list, the bell, the roles, Undo of the holiday, a published Friday, the downstream OIL figure (S16–30, 32–34).
   Desktop 1440×900, phone 390×844 by touch, short 390×568 and 844×390. Carried by a test, not walked: the count's
   arithmetic at each number (ON15), the store's writer door (ON5).
   **Looked at again before the first walker started (13 Oct 26, the next chat — Opus):** the same scenarios, cut into
   FIVE shares instead of three, because the third share held 18 scenarios, most of them needing a second scheduler's
   sign-in, and no walker of the last two jobs held more than about 14 without leaving some unwalked. All 35 of
   Fable's scenarios are walked, each roll-call row marked "NOT YET SEEN" is given to a named share, and three rows
   that must NOT ask are added (R12, R13 in A13; a no-fly day in E6). **A** the hands on the board and the week,
   desktop (14 lines: S1, 2, 6–13, 35; R2, R3, R7, R8, R12–R14); **B** a phone by touch and the short screens (6:
   S4, 5, 14, 31; R5, R15, R20); **C** published days, the Unavailable row's drag, the Inputs calendar's drag, the
   downstream figure (7: S3, 14, 15, 30, 32; R9, R10, R23, R24); **D** the holiday, the one list and the bell (13:
   S16–19, 22–24, 26, 28, 29, 33, 34; R19, R22); **E** the other doors that make a holiday and who is told (8: S20,
   21, 25, 27; R17, R21). The brief: `docs/superpowers/briefs/2026-10-13-oil-ask-notify-walk-brief.md`. The served
   build: `http://localhost:4231/`, a frozen copy, bundle `index-Bv5bvisT.js`, of the branch at `d17287535`.
5. **Its row in the ledger:** to add when the walk closes.

**The walk's scope, by his word (D785, 13 Oct 26):** a scheduler is always an admin. No scenario sets up, and no walker
or reader reports on, a person who schedules without being an admin. A second scheduler is a second ADMIN sign-in
(the look script gives Warden one). A member, a guest and a man with no sign-in are walked as people who are NOT
schedulers — what they must not see or do (scenarios 15, 25, 27).

## 7. The host's look on the built screens (13 Oct 26) — DONE

`scripts/handpass/oilnotify-look.mjs`, the built bundle, real presses (the swap a real mouse drag), desktop 1440×900
and phone 390×844 by touch: **96 checks, 96 PASS**, no console or page error. Eighteen pictures in `…/look/`; the host
opened nine beside the approved ones. **It found three differences from the approved pictures, all fixed before the
96:** (1) the phone's bar stacked its two buttons one over the other and stood twice as tall (a size-up of the host's
own) — now side by side, as drawn; (2) the list's cards were in filing order, not the day's own order (Nomad, Trident,
Ranger + Tally, Sidewinder, as drawn); (3) the list's window was wider than drawn. **And one walk-script artefact, not
a fault:** the second scheduler of the demo had no admin sign-in of his own, so was rightly told nothing — the script
now gives Warden one on Admin → Users. The blue outline on "Hangar open day" in the swap pictures is the script's own
just-added row (the app's six-second "fresh" mark), not the feature.

## 8. The scenarios for the walk — designed by Fable (the builder did not write them)

S = setup, A = action, E = expected, D = what would disprove.

1. Desktop board, unpublished Saturday, Range brief (Ranger, answered). Drag Tally from a seat onto Ranger's puck; pick nothing; "Don't swap". E: both pucks flash, the bar, nobody moved, Undo unchanged, OIL Earn unchanged. D: a puck moved, an Undo step, a notice.
2. Same → Answer OIL → Yes → Swap. E: one Undo step; Tally on the row, Ranger in the seat; the landing flash; the card says Tally, answered; OIL Earn credits Tally HO. D: no flash, a seat left armed, two Undo steps.
3. The same on a PUBLISHED Saturday, cancelled: "0 pending", four sign-offs stand. Answered: 1 pending, sign-offs fall, one line in the changes window.
4. Phone 390×568, touch drag, as 1 then 2: the bar inside the screen, the sheet reachable, Swap greyed until a pick.
5. Phone armed tap: tap "+ add" of an unanswered input, tap Tally in the drawer; Escape. E: still armed, drawer still open, "Not added" bar. Re-tap Tally → No → "Tally added to Range brief — not counted for OIL", disarmed, drawer parked. D: a "planned" note with nothing written.
6. Edit Schedule week (desktop): the crew list onto the only man's puck → the swap's words; after Yes, Ranger is OFF the schedule.
7. ALL AVAIL on an unanswered ONE-day input → question → Yes → added; on a TWO-day unanswered input → refused "longer than a day" with NO question first.
8. A man on leave that Saturday dropped on the Saturday duty row → refused by the leave rule, no question.
9. A drop onto an input answered No → no question, added, "not counted".
10. A move between two inputs' rows (both unanswered) → "Moving Tally to …"; Don't move → still in the first; answered → out of one, into the other, one Undo.
11. Cancel the swap, delete the row, Answer OIL → "That row has changed", bar closes, nothing written.
12. Cancel, Undo an unrelated change, Answer OIL → the question re-opens for the same row.
13. Cancel, switch week and come back → bar gone; sign out and in → gone.
14. Unavailable row: an overseas duty on Saturday; drag Hex onto Ranger's row: cancel → "Not swapped"; answer → Hex, one Undo.
15. Inputs calendar: a MEMBER drags his own weekday Meeting onto Saturday → question first; Don't move → the bar on the Inputs page, the chip flashes where it was; answered → "Moved to Sat", answered, one Undo.
16. Holidays list: add "National Day" on Fri 17 Jul with four inputs standing → the list opens by itself with its line, 4 to answer, Save greyed.
17. Yes on two, No on one → "3 of 4 answered", No in quiet grey; Save → one Undo step; the fourth still wears "OIL?"; the admin's own bell line reads "1 input needs an OIL answer · Saber"; OIL Earn on Fri shows the three.
18. Yes to all → Save → the line gone from every scheduler's bell; no bell lit by it. D: a line "0 inputs".
19. Later with nothing picked → nothing written; another admin's bell lit, "4 inputs need an OIL answer · Saber"; tap → list → tap line → the one list (no "is now" line) → answer → the line goes for everyone. D: "That input is gone".
20. The same from the Leave War's Event row (sheet, preset PH, "This day") → the list opens over the Leave War page. D: nothing, or only after a page switch.
21. Edit types: re-tag "SC" as an off day with inputs on SC days → bell lines, one a run. D: silence.
22. A holiday RUN Fri–Sat, one input covering both and one Saturday-only → one list "Fri 17 – Sat 18 Jul"; Yes on the first writes both days.
23. Undo the holiday → a working day again, every scheduler's line gone, answers given since untouched; Redo → the line back, unread, counting what is still unanswered.
24. Remove the holiday on the list → no line; add it again → ONE line.
25. The member who filed: his bell lit by his own question, no holiday line; a man merely IN a shared input: nothing; a guest: nothing.
26. The admin who made it, after "Later": his own bell lit, the line unread, a tap → the list.
27. A member files a NEW input on the holiday afterwards → asked at the save; an admin files one from the board → asked in the window.
28. The list open; another admin answers two in their windows → the count falls live; Save with one picked → only that one written.
29. The list open; an input deleted behind it → its line goes; Save with its pick → nothing for it, no error.
30. A locked (older-version) week's day made a holiday → no list, no line.
31. Short screens 390×568 and 844×390: the list as tall as its content up to the screen, Later / Save reachable; the bar inside; the question scrolls, Swap reachable.
32. A PUBLISHED Friday made a holiday → declaring it moves no pending count; answering in the list makes the day pending with one line and drops the sign-offs.
33. Mark all read with a live holiday line → the line muted but listed while anything is left; the bell lit only by his own unanswered input, if any.
34. Reload after 17 and 19 → answers, notices and read state all back; Undo empty.
35. Two drops in a row: cancel the first, start a second swap on another row before touching the bar → the second's bar replaces the first's. RECORD what happens — no ruling.

## 9. Checks run so far (each watched)

- Unit, the whole suite under the PC lock, on the built job (13 Oct 26, 00:20): **10860 / 10861 (624 files)** — the one
  failure the filed unsteady Tracker test `[TRK-DLG-FOCUS-UNSTEADY]`; alone, 3 of 3. (Docs, the list's order, two CSS
  lines and the new browser test came after it: their own files re-run green.)
- Red first: the gate in `ui/reqdoor.ts` broken on purpose → `ui/oilwait.test.tsx` 10 of 13 red; `leavewar/holnotice.test.tsx`
  run before its build → every case red. **The break tests proper (one per wired surface) are NOT done.**
- `e2e/oilwait.spec.ts` 4 of 4 (desktop and phone); `npm run build` clean; `npm run rulecheck` OK (258 rulings, ON1–ON16
  named); typecheck clean. **NOT RUN on this code: the whole gate set in one run** (tfin, the full e2e, smoke, perf).

## 9a. The two code reads, side by side — the ONE test he asked for (D788, D789, 13 Oct 26)

His word: *"We test more to see if opus can hold up alone …"* (D788), then *"Just test it once and ask me after we get the
results to know how we go from here."* (D789). So on this job’s finished code TWO readers read blind to each other, with the
SAME brief and this sheet as it stood after the walk’s fixes (§11): Fable (the independent reader, D784) and a fresh Opus
reader (Opus wrote the code — D67 — so its read is the thing on trial, never the job’s independent read). Same brief (`docs/superpowers/briefs/2026-10-13-oil-ask-notify-code-read.md`).
Every claim of either is written as a failing test before it is believed. **The table — what each found, what each missed,
false alarms, tokens — is filled in below when both reports are in, and put to him with what is published about the two
models; no further trial is run before his answer (D789).**

## 10. Questions waiting for him / the look card — to write at the close

Readings to tell him (the plan §6): R1 the two sibling drags follow the rule too; R2 a crew-list man on the only puck
uses the swap's words; R3 the admin who made the holiday gets the bell line too; R4 the list's Yes answers that input's
unanswered days in the holiday only; R5 a line at nothing left is gone; R6 D783's own four. **New from the build:**
R7 "the schedulers" are the people with an admin sign-in — a man with no sign-in of his own is told nothing (**CONFIRMED by him, 13 Oct 26 — D785: "Schedulers will be admins … don't test a scenario where a scheduler is not an admin"**); R8 a tap
on a card's name in the list opens that input's own window.

## 11. The walk (13 Oct 26) — five Sonnet walkers on the frozen build `index-Bv5bvisT.js` (`d17287535`), port 4231

The brief: `docs/superpowers/briefs/2026-10-13-oil-ask-notify-walk-brief.md`. Each walker's table and data:
`docs/handpass/parts/on-A.md` … `on-E.md` (`.json`); pictures `docs/img/handpass/2026-10-13-oil-ask-notify/A` … `E`;
scripts `scripts/handpass/on-<L>-*.mjs`. The host opened the pictures behind every FAIL and behind the OIL,
published-day and role PASSes (named below) and judged every FAIL against the rulings before it was called a fault.
No console error, page error or failed request in any world.

| Share | Lines | PASS | FAIL | Other | Tokens |
|---|---|---|---|---|---|
| A — the hands on the board and the week, desktop | 18 | 13 | 1 | 4 RECORD | about 379k |
| B — a phone by touch, the short screens | (see §11.4) | | | | |
| C — published days, the Unavailable row, the calendar's drag | 7 | 3 | 3 | 1 NOT WALKED | about 402k |
| D — the holiday, the one list, the bell | 13 | 13 | 0 | — | about 268k |
| E — the other doors that make a holiday; who is told | 20 | 18 | 1 | 1 RECORD | about 376k |

### 11.1 What the walk found — faults, each fixed with a test that was red first

| # | Found by | What a person saw | Cause | Fix and its test |
|---|---|---|---|---|
| W1 | E8 | With the admin's own "view as member" switch on (D292), the bell still listed the holiday's line and stayed lit by it; a tap on the line closed the bell's list and opened nothing | the notice is addressed to the admin's person; the list it opens is a scheduler's and refused him | a holiday's line is live for a scheduler only, asked in the ONE body (`state/notices.ts noticeLive`) — the list, the unread count and the bell's tap follow. `leavewar/holnotice.test.tsx` "the admin’s own member view is a member while it is on…" |
| W2 | C3 (and A's, D's notes; pictures `C/C3-two-2a-flash-100ms.png`, `A/A3-2-flash-bar-week.png`) | A passing note ("Input added", "Schedule updated") was drawn ON the bar that stays, over its words and half its "Answer OIL" button | both stand at the foot of the screen; the note is the layer above; the bar has no timer | while the bar is up the note sits above it, and one already showing moves up as the bar arrives (`ui/toast.ts placeToast`, `ui/OilWaitSheet.tsx`). `ui/oilwait.test.tsx` "a passing note never lands on the bar…" |
| W3 | C2 | On the Unavailable row, a man dragged from a SEAT: left unanswered, only the row's man flashed — his own puck on the seat did not ("both pucks flash", D783 (2)) | that door is handed a person, never the seat he was dragged from | the drag hands the seat to the wait (`ui/oilwait.ts oilWaitAlso`, `ui/drag.ts`). `ui/oilwait.test.tsx` "the Unavailable row, dragged onto from a seat…" |
| W4 | E1 (picture `E/E1a-3-list-over-leavewar.png`) | A holiday made with the Leave War's "PH" button and no name: the list read "PH is now a public holiday." under "Public holiday · PH" | a nameless holiday is saved under the preset's own word, and the word was used as its name | its name is kept as ''; the list names the day ("Fri 17 Jul is now a public holiday."), the bell's line says "Public holiday" (`leavewar/sync.ts tellHoliday`, `ui/OilDayList.tsx`, `state/notices.ts`). `leavewar/holnotice.test.tsx` "a holiday with no name of its own…" |
| W5 | the host, reading the plan's A6 against the code while fixing W1 | "Mark all read" read a holiday's line that was not shown (nothing left to answer) — it came back already read when an input on it needed an answer again | Mark all read took every notice of his, shown or not | it reads only what is shown (`state/noticeseen.ts`). `leavewar/holnotice.test.tsx` "\"Mark all read\" reads only the lines that are shown…" |

### 11.2 Walker FAILs that are NOT faults — the host's expected line was wrong against a ruling already made

| Row | What the screen did | Why it is right |
|---|---|---|
| C1 (S3) | a swap from a seat on a PUBLISHED Saturday, answered: "2 pending", two lines — "Ranger → Tally · what the day earns changes with it" and "Ranger: RANGE BRIEF · extras → Hangar open day" | as told to him on the last job (its sheet's R45; D109, D113): the input's change is one, the seat the man replaced went to is one. `engine/publish.ts` is not in this job's diff. Nothing was pending and the four sign-offs stood until the answer — the point of the scenario — PASS |
| C5 (S32) | a PUBLISHED Friday made a holiday: at once "1 pending — what this day earns changed", "Not yet signed", the four boxes emptied; an answer given in the list then adds no line of its own | D2 (21 Sep 26): "a holiday declared after publication waits for a republication and the day says so" — every man working that Friday now earns, so what the day earns HAS changed (D103: something waiting means sign again). The list's answer is part of the same one line. Not in this job's diff. **To tell him (R9).** |
| A6 (S8) | a man on leave dropped on a Saturday duty desk is seated with the red line "On leave but tasked", not refused | D605: a man on leave is FLAGGED the moment he is seated; the app has never refused it. No OIL question was put — the point of the scenario — PASS |
| E1n | an unknown word typed on the Event row ("National Day") makes a note, not a holiday | as built before this job: a holiday is a tagged event (the PH preset, or "Other… → Public holiday") |

### 11.3 Recorded for him (no ruling) and what could not be walked

- **A12 (S35) — two waiting changes in a row.** A second swap started while the bar of the first is up: there is ONE
  bar, it says "Not swapped — OIL not answered" without naming either, and "Answer OIL" offers the LATER swap only; the
  first can no longer be answered from the bar (drag it again). **To tell him (R10).**
- **E2 — a re-tagged event type that makes TWO separate runs ask:** every scheduler gets one bell line a run; the list
  opens by itself for the EARLIER run only, the other is reached from the bell. **To tell him (R11).**
- **A14:** the bar is in front of the changes window and its buttons work; behind the input's own window (a blocking
  window with a dimmed page) it is dimmed with the page and cannot be pressed until that window is closed — as any
  control of the page.
- **D5:** a run of two days also lists the demo's own inputs standing on those days (an Appointment asks the OIL
  question on a holiday — D713's kinds).
- **NOT WALKED — C6 (S30), a locked week.** No control makes a week locked: it is a saved week the app cannot read
  (quarantined). A read-only look at an issued version is not it — there the list and the line appeared, rightly.
  **Carried by a test, not a walk:** `leavewar/holnotice.test.tsx` "a day of a week the app holds locked is never
  listed, and making it a holiday tells nobody" — it calls the lister and the war's own door on a week planted as
  locked; it proves the rule, and there is no screen route to prove.
- **Seen in passing, older, not this job (filed `[OIL-NOTIFY-SEEN]`):** the Undo note after a swap reads "Undid: a
  personal input"; a puck dragged off a row gives no note; on the week the crew list's ALL AVAIL chip scrolls out of
  reach when a lower day is in view; an input's own window deletes at once with no "are you sure".

### 11.4 Share B — the phone and the short screens

*(added when its report is in)*

### 11.5 The roll-call's marks after the walk (§4's "NOT YET SEEN" rows)

| Row | Seen and operated by | Mark |
|---|---|---|
| R2 the week's drag | A3 (question, bar, swap, Undo — measured on the week) | HAS |
| R3 crew list onto the only puck | A4, on the week and on the board ("Putting Hex in place of Ranger"; Ranger on no row after) | HAS |
| R4 "+ add" / a puck of several | A5, A7, A8 | HAS |
| R5 the armed tap | §11.4 | |
| R7 a move between two inputs' rows | A8 ("Moving Ranger to Safety board"; one Undo) | HAS |
| R8 ALL AVAIL on an unanswered row | A5 ("Adding ALL AVAIL to Range brief"; refused on a two-day input with NO question) — and now a test by name (`ui/oilwait.test.tsx`) | HAS |
| R9 the Unavailable row | C2 by the mouse, from the crew list and from a seat (the flash: W3, fixed); the armed tap: §11.4 | HAS |
| R10 the calendar's drag — a chip and a BAR | C3 (the member), C4 (the admin): both ask first; the two-day BAR flashes where it was — the selector is proved on screen | HAS |
| R12, R13 must not ask | A13 (a time and a remark typed, a right-click, a drag off) | MUST NOT — holds |
| R14 the bar over each surface | the board (A1), the week (A3), the Inputs calendar (C3) — each measured inside the screen and on top; in front of the changes window, behind a blocking window (A14); the Leave War page: it cannot be there — it leaves with the page (A11) | HAS |
| R15 short screens | §11.4 | |
| R16 the list from the Holidays list | D1 (and D2–D12) | HAS |
| R17 the list from the Leave War's Event row | E1: the PH preset, a typed "PH", a band — the list opens over the Leave War page at once, measured on top | HAS |
| R18, R19 the two bells | D4 (the top bar's), D13 (the Scheduler Board's own, its list and the one list over the board) | HAS |
| R20 the bell on a phone | §11.4 | |
| R21 who must not be told | E3 (the member who filed, a man merely in a shared input, a guest), E5, E6 — and W1, the admin's own member view | MUST NOT — holds since W1 |
| R22 the "OIL?" tag after a holiday | D2 (the unanswered card still wears it; the answered three do not) | unchanged |
| R23 the downstream OIL figure | C7 (Ranger and Hunter each credited half a day on the Leave War once Friday is published, nothing before; the input answered No credits nobody), D2 and A2 (OIL Earn: HO on the men of a Yes, a dash on a No) | HAS |
| R24 a published Friday made a holiday | C5 — as D2 has it (§11.2) | as ruled |
