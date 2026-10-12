# `[OIL-ASK-NOTIFY]` — the bug check (FULL) — CLOSED 13 Oct 26; his look is what is left

**Where it stands:** built; the host's look beside the approved pictures (§7); walked by five helpers (§11 — seven
faults, fixed); break-tested (§14 — 27 wires given a test); its finished code read by Fable and, blind beside it, by a
fresh Opus reader (§12 — twelve claims: ten fixed, one filed, one a record); the fixes re-walked (§13 — 22 lines, no
fault); the whole gate set green in one run (§16.1). **Left: his look (the card, §16.2) and his "merge live" — put to
him in two parts (§16.3, D764).**

`Walk: docs/handpass/2026-10-13-oil-ask-notify.md · 388 pictures · 24 surfaces (the roll-call's rows, each seen and operated) · 89 lines walked (67 + 22) · MISSING: none open — 7 faults fixed red-first, 6 older things filed ([OIL-NOTIFY-SEEN]), 1 line with no screen route carried by a test`
Carried by a test, not walked — listed apart in §15 (seven cases, each with its test and what it proves).

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
  run before its build → every case red. The break tests proper (one per wired surface): §14.
- `e2e/oilwait.spec.ts` 4 of 4 (desktop and phone; 6 of 6 since a phone on its side was added — §11.4); `npm run build` clean;
  `npm run rulecheck` OK (258 rulings, ON1–ON16 named); typecheck clean. **The whole gate set in one run, on the finished
  code: §16.1.**

## 9a. The two code reads, side by side — the ONE test he asked for (D788, D789, 13 Oct 26)

His word: *"We test more to see if opus can hold up alone …"* (D788), then *"Just test it once and ask me after we get the
results to know how we go from here."* (D789). So on this job’s finished code TWO readers read blind to each other, with the
SAME brief and this sheet as it stood after the walk’s fixes (§11): Fable (the independent reader, D784) and a fresh Opus
reader (Opus wrote the code — D67 — so its read is the thing on trial, never the job’s independent read). Same brief (`docs/superpowers/briefs/2026-10-13-oil-ask-notify-code-read.md`).
Every claim of either is written as a failing test before it is believed. **The table — what each found, what each missed,
false alarms, tokens — is filled in below when both reports are in, and put to him with what is published about the two
models; no further trial is run before his answer (D789).**

## 10. The readings as the build left them — the look card, the questions for him and the full list of readings are §16

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
| B — a phone by touch, the short screens | 9 | 7 | 0 | 2 PARTIAL | about 354k |
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

No FAIL. Two faults of fit on a phone held sideways (844 × 390), found by the walker's measurements and its pictures,
both fixed with a browser test that was red first (`e2e/oilwait.spec.ts`, the size "phone on its side"):

| # | Found by | What a person saw | Fix |
|---|---|---|---|
| W6 | B4c (picture `B/B4c-l390-1-question-568.png`) | the question's card is taller than the screen with its new first line: the bottom of "Don’t swap" and "Swap" was cut by the card's edge until the card was scrolled | the card's foot stays in sight while its body scrolls (`.upconf-box > .airpop-foot`, as the input's window and the document viewer already do) |
| W7 | B4b (pictures `B/B4b-l390-1-top.png`, `-2-end.png`) | the one list scrolls inside its window, and Later / Save were at the END of the scroll — below the window until scrolled, and never in sight together with "Yes to all" | the list's foot stays in sight at the window's foot while the cards scroll (`.oildaywin .odl-foot`) — at every size, so a day with many inputs is answered without scrolling to find Save |

**PARTIAL — the brief's recipe was wrong, the rule held where the gesture exists:**
- **B2 — the armed tap on "+ add".** On Edit Schedule's WEEK a row that already holds people has no tappable "+ add"
  (older, filed: `[WEEK-ADD-TAP-PHONE]`). On the Scheduler Board a tap on the row's blank part arms it and opens the crew
  drawer: there the add WAITS ("Adding Tally to Fri brief"); Escape and ✕ leave the place armed, the drawer open and
  the bar "Not added — OIL not answered", nothing written; No → Add gives "Tally added to Fri brief — not counted for
  OIL", the arm put down and the drawer away — on the phone and once on a desktop (B2d). **R5: HAS.**
- **B3 — "the swap by an armed tap".** There is no such gesture: a tap on a puck SELECTS that man (older behaviour).
  The swap's doors are the drags; by a real touch drag from the crew list onto the only man's puck it waits ("Putting
  Hex in place of Ranger"), is not made unanswered, is made on Yes, one Undo.

**PASS:** B1 (390 × 568: the touch drag, the question, the bar — two buttons side by side, inside, on top), B4a (390 ×
568: the list with five cards, the bell's list and line — every one measured inside the screen and on top), B4b / B4c
(844 × 390 — with W6, W7), B5 (390 × 844: the other scheduler's bell, the line, the list over the phone's page, one
answered, the count falls — **R20: HAS**), B6 (the Unavailable row by an armed tap on a phone: the question first,
"Not swapped", answered → Hex, one Undo — **R9's second door: HAS**). **R15: HAS** (the bar and the question at
390 × 568 and 844 × 390; the list at both).

**Seen in passing, older (added to `[OIL-NOTIFY-SEEN]`):** on the Unavailable row an armed tap puts the arm down
BEFORE its question and leaves the crew drawer open afterwards, where the row's "+ add" keeps the arm until the answer
and then puts the drawer away.

### 11.5 The roll-call's marks after the walk (§4's "NOT YET SEEN" rows)

| Row | Seen and operated by | Mark |
|---|---|---|
| R2 the week's drag | A3 (question, bar, swap, Undo — measured on the week) | HAS |
| R3 crew list onto the only puck | A4, on the week and on the board ("Putting Hex in place of Ranger"; Ranger on no row after) | HAS |
| R4 "+ add" / a puck of several | A5, A7, A8 | HAS |
| R5 the armed tap | B2 on a phone and B2d on a desktop, on the Scheduler Board (the week's populated row has no tappable "+ add" — older, filed) | HAS |
| R7 a move between two inputs' rows | A8 ("Moving Ranger to Safety board"; one Undo) | HAS |
| R8 ALL AVAIL on an unanswered row | A5 ("Adding ALL AVAIL to Range brief"; refused on a two-day input with NO question) — and now a test by name (`ui/oilwait.test.tsx`) | HAS |
| R9 the Unavailable row | C2 by the mouse, from the crew list and from a seat (the flash: W3, fixed); the armed tap: §11.4 | HAS |
| R10 the calendar's drag — a chip and a BAR | C3 (the member), C4 (the admin): both ask first; the two-day BAR flashes where it was — the selector is proved on screen | HAS |
| R12, R13 must not ask | A13 (a time and a remark typed, a right-click, a drag off) | MUST NOT — holds |
| R14 the bar over each surface | the board (A1), the week (A3), the Inputs calendar (C3) — each measured inside the screen and on top; in front of the changes window, behind a blocking window (A14); the Leave War page: it cannot be there — it leaves with the page (A11) | HAS |
| R15 short screens | B1, B4a (390 × 568); B4b, B4c (844 × 390) — every box measured; W6, W7 fixed | HAS |
| R16 the list from the Holidays list | D1 (and D2–D12) | HAS |
| R17 the list from the Leave War's Event row | E1: the PH preset, a typed "PH", a band — the list opens over the Leave War page at once, measured on top | HAS |
| R18, R19 the two bells | D4 (the top bar's), D13 (the Scheduler Board's own, its list and the one list over the board) | HAS |
| R20 the bell on a phone | B5 (and B4a's bell at 390 × 568) | HAS |
| R21 who must not be told | E3 (the member who filed, a man merely in a shared input, a guest), E5, E6 — and W1, the admin's own member view | MUST NOT — holds since W1 |
| R22 the "OIL?" tag after a holiday | D2 (the unanswered card still wears it; the answered three do not) | unchanged |
| R23 the downstream OIL figure | C7 (Ranger and Hunter each credited half a day on the Leave War once Friday is published, nothing before; the input answered No credits nobody), D2 and A2 (OIL Earn: HO on the men of a Yes, a dash on a No) | HAS |
| R24 a published Friday made a holiday | C5 — as D2 has it (§11.2) | as ruled |

## 12. The two code reads of the finished code (13 Oct 26) — every claim reproduced before it was believed

Both read the branch at `2f677c0d8` with the same brief (`docs/superpowers/briefs/2026-10-13-oil-ask-notify-code-read.md`)
and this sheet as it then stood, blind to each other. **Fable** (the job's independent reader — D784):
`docs/superpowers/briefs/2026-10-13-reads/oil-ask-notify-code-fable.md` — "CLEAN WITH THESE EXACT CHANGES", three findings,
478,816 tokens. **A fresh Opus reader** (the trial of D788 / D789 — Opus wrote the code, so NOT the job's independent
read): `…/oil-ask-notify-code-opus.md` — "CLEAN WITH THESE EXACT CHANGES", eight findings, 610,259 tokens. Each claim
was written as a test of the RIGHT behaviour and run against the code as it stood; *red* = it failed, the claim is real.

| # | The claim, as a person meets it | Who | Reproduced | Done |
|---|---|---|---|---|
| C1 | Behind the OIL question, and after "Don’t swap" for as long as the bar stands, the day's issues and the rings on its pucks are those of the change that was NOT made (until the next edit re-checks) — the rules ran inside the save that is tried and thrown away, and what they found is not part of what the rollback puts back | Opus F1 (MEDIUM). **Fable traced the same save and called it sound** ("leaves no … repaint behind") | **red** — `ui/oilwait.test.tsx` "nothing moves — and the warnings say so…" | **fixed:** the rules are run again on the world as it stands (`state/store.ts tryInputsBatch`) |
| C2 | "Answer OIL" after a second man was put on the row meanwhile turns the waiting SWAP into an ADD made at once — no question, the man added and still on his seat | Opus F2. **Fable: "Can Answer OIL write to the wrong row or person? No"** | **red** — "…never makes a different change from the one that was waiting…" | **fixed:** the door asked again must still be the same kind of change, or "That row has changed — not swapped" (`ui/reqdoor.ts rowPut`) |
| C3 | A holiday whose dates are CHANGED: lengthened, a second bell line for the day added; shortened, the one line and the list it opens keep the old dates | Fable F1 **and** Opus F3 (b) | **red** — `leavewar/holnotice.test.tsx` "LENGTHENED…", "SHORTENED…" | **fixed:** the notice is made for the whole holiday as it now stands (`leavewar/sync.ts tellHoliday`), and the line's dates, count, day and list are read from the war as it stands (`state/notices.ts noticeSpan`) |
| C4 | A holiday taken away and made again over other dates: two lines counting the same inputs | Opus F3 (a) | **red** — "taken away and made again over OTHER dates…" | **fixed** with C3 (a newer notice whose live days hold all of an older one's takes its place) |
| C5 | ONE holiday entered Friday to Monday: two lines, and the list opens for the Friday alone | Opus F3 (c) | **red** — "ONE holiday that runs across a weekend…" | **fixed** with C3 (a run is widened to the holiday that holds it) |
| C6 | With more than thirty newer notices the live holiday line is cut from the bell's list while the tap still defers to it — that scheduler's own question cannot be reached from his bell | Opus F4. **Fable: "the thirty-line cut is applied after noticeLive" — sound** | **red** — "a live holiday line is never one of the lines the bell cuts…" | **fixed:** the thirty are of the other notices (`state/notices.ts noticesFor`) |
| C7 | The bar's "Answer OIL" makes its swap with OIL Earn switched on — the mode in which the day does not move | Opus F5 | **red** — "OIL Earn switched on takes the waiting change and its bar away…" | **fixed:** switching the mode on takes the waiting change and its bar away (`state/view.ts setOilDay`) |
| C8 | An add dragged from a SEAT onto a row's open place: left unanswered, the puck that was dragged does not flash | Opus F6 (first half) | **red** — "an add dragged from a seat onto \"+ add\"…" | **fixed:** the drop hands the seat to the wait at every site (`ui/drag.ts held`) |
| C9 | The Unavailable row: "Answer OIL", then "Don’t swap" again — only the row's man flashes | Fable F3 **and** Opus F6 (second half) | **red** — "…BOTH pucks flash the second time too" | **fixed:** the places a caller added are carried to the wait asked again (`ui/oilwait.ts oilBarAgain`) |
| C10 | The Unavailable row's armed TAP drops the ring on the row before its question is put — an input's own row keeps it until the answer | Fable F2. **Opus did not report it** (the sheet had filed its drawer half as older) | **red** — `ui/unavailedit.test.tsx` "an armed tap whose hand-over WAITS…" | **fixed:** the arm goes down when the hand-over is made or refused; waiting, it stays (`ui/interactions.ts`) |
| C11 | An input taken off the programme, its weekday then made a holiday, then put back (Accept, or Undo of the take-off): it needs an OIL answer and nobody is asked — only its "OIL?" tag and the bell of whoever answers for it say so. The plan's "the only way left" is not true | Opus F7 (OLDER — not this job's code) | by reading: `ui/interactions.ts` Accept → `engine/slots.ts acceptInput` puts no question | **filed** `[OIL-ACCEPT-BACK-UNASKED]`, with a recommendation; the plan's sentence corrected |
| C12 | The declared record type of a notice lacks the new holiday part | Opus F8 (records) | by reading `engine/schema.ts` | **fixed:** `'oilhol'` declared, with what its fields then mean |

**False alarms:** none from either reader — every claim that could be written as a test was red. **Each reader's
negatives the other disproved:** three of Fable's (C1, C2, C6); none of Opus's found so far.

### 12.1 The one test he asked for (D788, D789) — the table put to him, and his answer (D790)

**His answer, 13 Oct 26 — D790, "Yes option 2":** from here every job that needs a code read gets a fresh, blind Opus read of
its finished code, and Fable reads it as well only on the riskiest changes — OIL, published days, who may do what, saved data.
No further trial is run.

| | Fable | A fresh Opus reader |
|---|---|---|
| Real faults found | 3 | 11 (its eight findings; F3 and F6 are several faults each) + 1 older, filed |
| …found by both | 2 (C3, C9) | 2 |
| …found by this reader alone | 1 (C10) | 9 (C1, C2, C4, C5, C6, C7, C8, C11, C12) |
| The most serious | low | C1 — the screen showing a change that was not made (medium) |
| Said "sound" about something the other proved faulty | 3 times | 0 |
| False alarms | 0 | 0 |
| Tokens | 478,816 | 610,259 |

Read with care: ONE job; the Opus reader is the model that wrote the code, reading fresh — which is the thing being
tested, not a fault in the test; and on the previous job (`docs/handpass/2026-10-12-one-rule.md` §10b) the same kind of
reader missed five of nine faults already known. What is published about the two models is in the chat's report to him
of 13 Oct 26 (no head-to-head at reading code exists; Opus 5.5 is three weeks the newer and level or ahead on the
vendor's coding tests; a fresh reader beats the one that wrote the code in the same conversation; whether a different
MODEL beats the same model starting fresh is unproven).

## 13. The re-walk of what the fixes touched (13 Oct 26) — two Sonnet walkers on the frozen build `index-CoBxP-O_.js` (`f8136bfdd`), port 4231

The brief: `docs/superpowers/briefs/2026-10-13-oil-ask-notify-rewalk-brief.md` — 22 lines, one for each thing the walk's
seven fixes (W1–W7) and the two reads' ten (C1–C10, C12) changed on screen, written as the RIGHT behaviour, the walkers
not told whether anything was still wrong. Reports `docs/handpass/parts/on-RX1.md`, `on-RX2.md` (`.json`; RX2's tail
`on-RX2-tail.md`); pictures `docs/img/handpass/2026-10-13-oil-ask-notify/RX1`, `RX2`; scripts `scripts/handpass/on-RX1-*.mjs`,
`on-RX2-*.mjs`. No console error, page error or failed request in any world. **No code changed after this build:** every
commit since `f8136bfdd` is a document.

| Share | Lines | PASS | FAIL | Other | Tokens (the harness's figure) |
|---|---|---|---|---|---|
| RX1 — the door, the bar, the flashes, the warnings | 12 | 8 | 0 | 3 RECORD, 1 NOT WALKED | 341,810 |
| RX2 — the holiday's one line, the list, the short screens | 10 | 10 | 0 | — | 325,756 |

**The host opened** the pictures behind the OIL, published-day and role PASSes and judged each against the report:
`RX1-1-2` (both pucks lit, the bar up), `RX1-4-2` (OIL Earn on, the bar gone), `RX1-5-2` (an add from a seat left
unanswered: Tally's puck and the row's lit), `RX1-7-5` (a phone: the dashed ring still round Ranger's puck under
Unavailable, the bar below), `RX1-11-3` (View-only Sched: the published Saturday holds Ranger on Range brief and Tally on
Hangar open day), `RX1-12-3` (the member view: a tap on the bell goes to Saber's own input's question, no holiday line —
the earlier chat opened `RX1-6-1` and `RX1-12-2`), `RX2/R1-5` (the lengthened holiday's one list, six cards, Thursday's
among them), `R2-5` (the shortened holiday's one line, "Fri 17 Jul"), `R7-2`, `R7-3` (a holiday with no name: "Fri 17 Jul
is now a public holiday." over the Leave War page; "Public holiday" in bold on the bell), `R8-5` (the open list at three
after the other admin answered one), `R9-l390-1` (a phone on its side: Later and Save in sight with eleven cards),
`R10-1` (the question on a phone on its side: both buttons inside the card).

### 13.1 Each fix, and the line that saw it on screen

| Fix | Seen by | Result |
|---|---|---|
| W1 the admin's own member view has no holiday line | RX1-12 | PASS — and back as admin the line is there again |
| W2 a passing note never lands on the bar | RX1-6, both orders, each box measured (8 px apart; the thing under "Answer OIL" is the button) | PASS |
| W3, C9 the Unavailable row from a seat: both pucks flash, the second time too | RX1-1 (at 100 ms, and at 80 ms after "Answer OIL" → "Don’t swap") | PASS |
| W4 a holiday with no name of its own | RX2-7 | PASS |
| W5 "Mark all read" reads only what is shown | not on screen as a line of its own — carried by its test (§15) | — |
| W6 the question's two buttons on a phone on its side | RX2-10 (both wholly inside the card and the screen; the words scroll above them) | PASS |
| W7 the list's Later / Save stay in sight | RX2-9, at 1440 × 900, 390 × 844 and 844 × 390, each measured at the top, the middle and the end of the scroll | PASS |
| C1 the warnings behind the question are the day's as it stands | RX1-1, RX1-2 — **a thin proof:** the Saturday walked had one issue and no ringed puck, so "as before" had little to change; the fix rests on its red-first test (`ui/oilwait.test.tsx` "nothing moves — and the warnings say so…") and its break test (B94, §14) | PASS, thin |
| C2 "Answer OIL" never makes a different change | RX1-3 ("That row has changed — not swapped"; nothing made) | PASS |
| C3, C4, C5 one bell line a holiday whatever is done to its dates | RX2-1 (lengthened), RX2-2 (shortened), RX2-3 (taken away, made again over other dates), RX2-4 (Friday to Monday), RX2-5 (renamed), RX2-6 (an event type re-tagged, back, and again) | PASS |
| C6 a live holiday line is never cut from the bell's list | not walked (it needs more than thirty newer notices) — carried by its test (§15) | — |
| C7 OIL Earn takes the bar | RX1-4 | PASS |
| C8 an add from a seat: the dragged puck flashes | RX1-5 | PASS |
| C10 the Unavailable row's armed tap keeps its ring until the hand-over is made | RX1-7, a phone by touch | PASS |
| C12 the declared record type | nothing on screen | — |

### 13.2 What the re-walk recorded, and three things it met in passing

- **RX1-8 NOT WALKED — there is no such door.** The app has no box that takes a typed callsign for a row's people: a
  click on the people cell arms the place, typing does nothing, and the row's title box renames the row. Fable's
  "typed boxes" door has no route on screen; the store's own writer is held by `ui/oilwait.test.tsx` (ON5).
- **RX1-9 (RECORD):** Escape with the question up over the Scheduler Board closes only the question — the bar comes,
  the board stays open.
- **RX1-10, RX1-11 (RECORD) — to tell him (R16):** the bar outlives a step to another day on the board, and a publish:
  "Answer OIL" then opens the question of the day it was asked on ("18 Jul") whichever day the board shows, and the
  swap is made on that day. A Saturday published straight after "Don’t swap" goes out as it stands (Ranger on Range
  brief, Tally on Hangar open day, no issue naming either).
- **RX1-5 — to tell him (R17):** on an add left unanswered the two that flash are the dragged puck and the row's first
  puck; on the board a row that already holds people draws no "+ add" of its own to flash.
- **RX2-6 — to tell him (R18):** two runs of days that touch (Tue–Wed and Thu) read as ONE line and one list ("Tue 14 –
  Thu 16 Jul"); an event type re-tagged to an Off day gives no list and no line (D21: an Off day earns no OIL).
- **RX2-5, and RX2 in passing:** a rename opens no list and keeps each scheduler's read / unread mark; after a holiday
  is saved from the Holidays list the Calendar window stays open under the one list.
- **"One Undo on the phone did nothing" (RX1-7's last line) — reproduced by the host, NOT a fault of the swap**
  (`scripts/handpass/on-H-undo7.mjs`, picture `RX1/H7-after-undo.png`): after the hand-over the crew drawer is still open
  and, open, it covers the top bar — the finger landed on the drawer's head, not on Undo. With the drawer put away, ONE
  Undo puts Ranger back ("Undid: a personal input"). That the drawer stays open there is older and filed
  (`[OIL-NOTIFY-SEEN]` (5)); that it covers Undo is added to that item.
- **"11 changes" on the just-published Saturday (RX1-11's last line) — reproduced by the host, NOT this job's**
  (`scripts/handpass/on-H-pub11.mjs`): the same Saturday published WITHOUT any drag reads "11 changes" too. It is the
  day's count of changes in the changes window (the rows the walker typed), not something waiting to go out; nothing is
  pending and no mark is left by the swap that was not made.
- **Older, met by both phone walkers and the browser test — filed, `[OIL-NOTIFY-SEEN]` (6):** on a phone on its side the
  Scheduler Board leaves a pane about 190 px tall, and a drag held near its top or foot scrolls the board under the
  finger: the puck is let go over nothing and comes off its row (Undo brings it back). Not this job's drag; on his look
  card as a thing to try on his own iPhone.

**The size, looked at again (§7.0):** the re-walk found no fault and no MISSING row, so the scope stands; nothing is
walked a third time.

## 14. The break tests (§8.4) — one wire broken at a time, a named test watched going red

All by the host (Opus), with one script: `scripts/handpass/on-breaks.mjs` — each entry is one exact text swap in one
source file; the named test files are run; the file is put back (it refuses to start on a tree with uncommitted source).
Three rounds, 131 break runs. The three logs were kept outside the repo, in the earlier chat's working folder; the
tallies below are from them, as that chat reported them.

| Round | On | Breaks | Red at once | Bare | After the new tests |
|---|---|---|---|---|---|
| 1 | the walked build's code (`d17287535`): B1–B88 | 88 | 61 | 27 | — |
| 2 | the 27 bare again, and five for the walk's fixes (B89–B93: the member view, Mark all read, the note and the bar twice, the Unavailable row's seat) | 32 | 30 | 2 (B42, B72) | B72's wire removed from the code; B42 left, below |
| 3 | the two reads' fixes: B94–B104 | 11 | 11 | 0 | — |

**The 27 wires that had no test, by proof — each given one** (about twenty new cases: several cover two wires, four
wires gained an assertion inside a case that existed): a change that would be refused being asked its question first
(B2, B31); "Answer OIL" on a row whose man has changed, and its words (B8, B16); the seat he came from found again
(B9); what flashes (B10, B12); the drop's three other sites and the landing flash handed to the wait (B24–B27); the
Unavailable row for an input of several (B33–B35); the calendar's drag — the flash, the landing on the answer, an input
changed since (B38–B40); a locked week's day listed (B49); days outside the run (B50); a switched-off admin told (B52);
the line covering every date for the bell's tap (B69); the list's words for who saves, its stamp, its cards' order and
a card's name opening the input (B76, B78, B84, B86). The cases are in `ui/oilwait.test.tsx` ("the wires the break
tests found bare"), `ui/caldrag.test.tsx` and `leavewar/holnotice.test.tsx`.

**The two left bare after round 2, each with a disposition:**
- **B72 — the wire is gone.** It broke the bell's own second test of "is this a scheduler" (`ui/topbits.tsx`). Once a
  holiday's line was made live for a scheduler only, in the one body (W1 — B89's test), that second test decided
  nothing; it was removed from the code and B72 is a comment in the script. So the script holds 103 live entries.
- **B42 — left, with its reason beside it in the script.** "The bar shows while the question is up": a guard in the
  bar's own drawing. The bar is put away whenever a question is held (both places that hold one clear it first), so the
  two never stand together and this guard decides nothing today — a spare, kept.

**The final tally: every live entry is caught by a named test except B42.** B94, the one behind C1: it takes away the
re-run of the rules after the tried save, and `ui/oilwait.test.tsx` "nothing moves — and the warnings say so…" goes red.

**Not broken, and what carries them:** the three places the app mounts the question, the bar and the one list
(`ui/App.tsx`). Breaking one needs a build for each break; the unit tests draw them directly. Each was SEEN and
OPERATED on the built app by the walk and the re-walk at every size (§11, §13), and `e2e/oilwait.spec.ts` (6 of 6, three
sizes) fails if the question, the bar or the list is not on the page.

## 15. What was NOT walked, and what a test carries instead (§7.0)

| The case | Why not walked | The test, what it proves, and how it works |
|---|---|---|
| A locked week's day made a holiday (S30, R15) | no control makes a week locked — it is a saved week the app cannot read | `leavewar/holnotice.test.tsx` "a day of a week the app holds locked is never listed, and making it a holiday tells nobody": calls the lister and the war's own door on a week PLANTED as locked. It proves the rule; there is no screen route to prove |
| A live holiday line with more than thirty newer notices (C6) | thirty notices cannot be made in a walk's time | `leavewar/holnotice.test.tsx` "a live holiday line is never one of the lines the bell cuts…": makes the notices through the store's own makers and reads the bell's list |
| "Mark all read" with a holiday line that is not shown (W5) | the line is by definition not on screen | `leavewar/holnotice.test.tsx` "\"Mark all read\" reads only the lines that are shown…": the store's read marks, then an input needing an answer again |
| The count on the bell's line at each number (ON15) | the same route as the lines walked at 3, 4, 5, 6 and 11 | `leavewar/holnotice.test.tsx` (ON15): the line's words at each count, from the store |
| The store's own writers as a door (ON5, R6); a callsign typed into a row (RX1-8) | no control on screen reaches them | `ui/oilwait.test.tsx` (ON5): calls the writers directly — it proves the rule at the writer, not a route |
| The warnings behind the question on a day that HAS ringed pucks (C1) | walked on a thin day (§13.1) | `ui/oilwait.test.tsx` "nothing moves — and the warnings say so…", through the drop's own function on a stand-in element; break B94 |
| Safari's own handling of a held finger (§7.9) | the walk ran in Chromium | nothing — on his look card: the drag, the armed tap and the sideways phone on his own iPhone |

Everything else on the roll-call (§4, §11.5) was seen and operated on its own surface.

## 16. The close (13 Oct 26)

### 16.1 The whole gate set, in ONE run under the PC's lock, nothing else running — on the branch at `f5139c13f` (the code of the walked build `f8136bfdd`; every later commit a document)

| Gate | Result |
|---|---|
| Unit tests (`npm test`) | **10895 / 10895** (624 files) |
| Build (`npm run build`) | clean |
| The original's assertions (`node reference/tfin.js`) | **728 passed, 0 failed** |
| Browser tests (`npm run test:e2e`) | **775 passed, 0 failed**, 57 skipped |
| The Tracker's suite (`npm run smoke:tracker`) | **445 passed, 0 failed** |
| `npm run rulecheck` | OK (the 31 older rulings in its baseline unchanged; ON1–ON16 each named by a test) |
| `npm run docsize` | OK — every record accounted for |
| `npm run perf`, after the run, on the served build (byte for byte the gate's own bundle, `index-CoBxP-O_.js`) | 4 passed, 0 failed — the week 5131 nodes under its ceiling of 5450, the board 1018 under 1150 |
| `npm run probes:adapted`, the same | all 6 passed |

WHOLLY GREEN, 13 Oct 26, 02:50–03:11; a full run took about 21 minutes. `perms.test.ts` and `perms-scan.test.ts` ran green
inside the unit suite; this change touches no row of `docs/data-model.md` §11 (who is told is decided in
`state/notices.ts` through the one permissions module — the sheet's W1).

`Docs: OUTSTANDING 168 items (+6 −4, −4 all in ARCHIVE) · DECISIONS D1–D790 (new: D780, D781, D782, D783, D784, D785, D786, D787, D788, D789, D790) · homes OK`
`docsize: OVER by 3, deferred (D29)`

### 16.2 The look card — five minutes, on his phone and once on a desktop

Make the day first (a minute): on the Inputs calendar file a Training for one man on a SATURDAY and answer its OIL
question Yes. On Edit Schedule that Saturday now has his row on the Ground Programme.

1. **A swap waits for its answer.** Drag a man who is already on that Saturday (its SDO, say) onto the puck on the
   Training's row. The OIL
   question comes first, with "Swapping … and …" at its top — and behind it nothing has moved. Press "Don’t swap":
   both pucks flash, and a bar stays at the foot — "Not swapped — OIL not answered · Answer OIL · OK". Press "Answer
   OIL", Yes, "Swap": now they change places, and one Undo puts it back.
2. **A holiday is never silent.** Inputs → the gear → Calendar → Holidays: add a holiday on a weekday that already has
   inputs. One list opens by itself — every input of that day that needs an answer, each with Yes and No, "Yes to all"
   and "No to all". Press "Later".
3. **The bell carries one line a holiday.** The bell is lit: the holiday's name, its day, "N inputs need an OIL
   answer". A tap opens the same list. Answer them all and Save: the line is gone.
4. **Only a scheduler is told.** Tap your name badge (it reads MEMBER): the bell has no holiday line. Tap it again.
5. **On his own iPhone, which no test here can stand in for:** the drag in 1 by a held finger; then turn the phone on
   its side — the question's two buttons and the list's Later / Save stay in sight. (On its side, start the drag with
   both pucks in the middle of the board, not at its edge.)

### 16.3 Questions waiting for him

1. **At the merge, in two parts (D764):** the check is closed and the gates are as above — and does he wait for a
   ChatGPT read of the finished code (not before 1 Nov 26), or merge on Fable's read and the fresh Opus read? The job is
   on the one list either way (`OUTSTANDING.md` `[NO-ASTRA-LIST]`).
2. **Not blocking, with the next Inputs batch:** should "Delete" in an input's own window ask "are you sure"
   (`[OIL-NOTIFY-SEEN]` (4)); and when an input is put BACK on the programme after its day became a holiday, should the
   put-back wait on the OIL question as a swap does (`[OIL-ACCEPT-BACK-UNASKED]`).

### 16.4 The readings told to him at the close (R1–R18)

R1 the Unavailable row's drag and the Inputs calendar's date drag follow the same rule · R2 a man from the crew list
dropped on the only man's puck uses the swap's words ("Putting … in place of …") · R3 the admin who made the holiday
gets the bell line too · R4 the list's Yes answers that input's unanswered days in the holiday only · R5 a line with
nothing left to answer is gone · R6 D783's own four · R7 "the schedulers" are the people with an admin sign-in
(confirmed, D785) · R8 a tap on a card's name in the list opens that input's own window · R9 a holiday declared on a
PUBLISHED day reads "1 pending — what this day earns changed" at once, and the list's answers ride that one line (D2) ·
R10 only ONE change waits at a time — a second swap started while the bar is up replaces the first · R11 an event type
re-tagged so that two separate runs of days ask gives one bell line a run; the list opens by itself for the earlier ·
R12 a swap from a seat on a published day counts 2 changes (as on the last job) · R13 a holiday with no name of its own
is named by its day in the list and "Public holiday" on the bell · R14 the bar leaves when OIL Earn is switched on ·
R15 a locked week cannot be made from the screen, so that rule is held by a test · R16 the bar outlives a step to
another day on the board and a publish; "Answer OIL" then acts on the day it was asked on · R17 on an add left
unanswered the dragged puck and the row's first puck flash · R18 runs of holiday days that touch read as one line and
one list; an event type re-tagged to an Off day asks nothing (D21).
