# Bug check — round 4 of the words pass, built (his D2521; chat 168, 24 Nov 26)

Branch `claude/words-pass-163`, pull request 841 (draft). The build: commit `a358d4b1a` — the bell's line for a changed
input (a change of kind, a half day, "and N more change(s)") and six passing notes. The words of record:
`../superpowers/briefs/2026-11-24-words-r4-draft.md` §After the fresh Fable's read; the approved page
`../mock/2026-11-24-words-r4/`; what each case printed before the build, `../img/handpass/2026-11-24-words-r4/facts.json`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — nothing earned, paid or counted changes; the publish note's words only (`leavewar/sync.ts publishFlagsBids` decides nothing new) |
| 2 | The published record | NO — publishing, signing and amendments are untouched; only the passing note said after a publish |
| 3 | Saved data | **YES** — a bell line is a saved record: a new kind of part (`{k:'kind', was, now}`) and a half day's `h` / `c` on the `when` part are stored; lines saved before must still read |
| 4 | A shared drawer | YES (held so) — the bell's words (`state/notices.ts noticeWords`) feed one list drawn on desktop and phone |
| 5 | A new gesture or mode | NO — no control, tap target or mode added |
| 6 | A new surface | NO |
| 7 | Roles | NO — two refusals reworded; who may do what is untouched (`state/perms.ts` unchanged) |
| 8 | The warning list | NO — `engine/validate.ts` unchanged; its sentence is reused by the publish note |

**Tier: FULL** (question 3). Split in two chats (the checklist's step 3): chat 168 — the tier, this sheet, the
roll-call, the scenario design (Astra and a fresh, blind Fable); the next chat — the sizing, the walk, the code reads,
the fixes, the re-walk, his look.

## 2. The roll-call — every place the app draws the thing touched

SHOW — is the new wording drawn there · USABLE — does the gesture that raises it still work · PAINTED — what else is
drawn there. Each cell YES / NO-because / MISSING when walked; a blank is a row not yet walked.

| # | Surface (where it is drawn) | Raised by | SHOW | USABLE | PAINTED |
|---|---|---|---|---|---|
| R1 | The bell's list, desktop (top bar, `ui/topbits.tsx` BellList) — a changed input's line | another person's save of the input | | | |
| R2 | The bell's list, phone (the same list as a full-width panel) | the same | | | |
| R3 | A tap on such a line → the input's own window, the line marked read | a tap | | | |
| R4 | Undo, then Redo, of the save that wrote a new-shape line — the line goes and comes back; the permissions gate passes it | Undo / Redo | | | |
| R5 | The input's window, its start / end time boxes (`ui/inputedit.tsx normalizeInputDraft`) | Save with a bad time | | | |
| R6 | The Inputs list's in-place start / end cells (`ui/inputedit.tsx setInpField`) | a bad time typed in a cell | | | |
| R7 | Edit Schedule, a puck dragged back onto its own seat — flying, duty, ground, a placeholder (`ui/drag.ts`) | a drag | | | |
| R8 | The Scheduler Board, the same drag | a drag | | | |
| R9 | The Inputs page's look-ahead, saved (the default window's gear) | Save | | | |
| R10 | Publishing a weekend or holiday no Leave War period covers — Edit Schedule (`leavewar/sync.ts publishFlagsBids`), alone and joined to the publish note | Publish | | | |
| R11 | The week's warning list, the "Create the <year> period" button's hover (`ui/html.ts`) | hover | | | |
| R12 | The Scheduler Board's warning line, the same button's hover (`ui/board.ts`) | hover | | | |
| R13 | "Create the <year> period" pressed: the note "The <year> Leave War period is created…" (`ui/interactions.ts`) | a press | | | |
| R14 | Its refusal to a non-scheduler, "Only a scheduler can create a Leave War period" | a press (reachable? record) | | | |
| R15 | The OIL day list's Save by a member, "Only a scheduler can answer from this list" (`ui/oilday.ts`) — not reachable on screen (facts.json q4c): carried by `leavewar/holnotice.test.tsx` | a test | | | |
| R16 | The sign-off's OIL list (`ui/oilsign.ts`, the same save) | a press | | | |

## 3. The sizing lines (§7.0) — the host (Fable), chat 170, before any walker started

1. **The type of change:** F (words) leading; G (a bell line is a saved record, and its saved shape gained a part and
   two fields); D (one list of lines drawn on the desktop and the phone, fed by every door that changes an input); a
   little A (which parts a save is said to have, their order and their count are worked out in one place).
2. **What only a walk could find here:** a door that changes an input and reaches the bell in other words, or not at
   all (the window from five openers, the in-place time boxes on three rows, the calendar's drag, Undo / Redo, a
   member's save past the permissions gate, the Leave War's copy); a line the OLD build saved, read by the new one; a
   two-row line on his iPhone's width (cut, overlapped, the list's foot count); each note at its real gesture (a drag,
   a typed time by Tab and by Enter, a publish with other notes joined). The tests already hold the words' arithmetic
   (§6) and call the writer directly — none presses a control.
3. **What the ledger says:** no walk has had words (F) as its leading type. The nearest: his D1525 half-day words (30
   Oct 26 — a LOOK, the host alone, about 2 minutes, nothing found); the posting-out bell line (5 Nov 26 — a new saved
   line, FULL, the host alone with two scripts, 51 checks); saved-data walks found a fault in 4 of 7, most of them on
   the one job that changed how everything is saved. A measured Opus walker cost about 620 thousand tokens.
4. **The walk chosen:** the host's own short run first (`scripts/handpass/wr4-host.mjs` — three bell cases on the new
   build, and the same three made on `main`'s build then read on the new one), then THREE Opus walkers side by side
   (his D2256), one frozen build served inside each test browser: **a** the bell's words (8 scenarios), **b** saved
   lines, roles and orders (8), **c** the notes (7) — 23 combined scenarios, each on a desktop (Chromium 1440×900) and
   his iPhone's size (402×874, touch); the geometry of the long line also in WebKit at 402. No size beyond those two:
   no layout changed, and the bell's list is one component at both. The approved page's pictures are the real app with
   only the words swapped (`../img/handpass/2026-11-24-words-r4/`, `facts.json`), so "beside the approved pictures" is
   the words read off the screen against `facts.json`'s, and the line count of the ruled three-change line (two rows
   in a 307px box) measured, not a drawing check — there is no part list to draw. Carried by a test, not walked: a
   cancel joined to other changes in one save (no door makes it in one save — `bellnotices.test.tsx` round 4, calls
   the words directly); a titled half day "Now AM" (no kind offers both a title and a half — the same test); the OIL
   list's refusal to a member (the window closes itself — `leavewar/holnotice.test.tsx`, drives the save). Walker a
   and c each confirm on screen that the door is really absent.
   **The lessons of §7.11, gone through:** 1 (a line's states — unread / read, one row / two — b's B7, a's A8); 3 (what
   tells the person after each press — every note pictured while it shows, c's C7); 9 (the list measured row by row
   — A8); 16 (after a refusal at a box, tap away and type afresh — C1); 22 (what is drawn — every reading from the
   list as drawn, with its picture); 23 (what a tap on a line opens — B7, against the bell's contract); 25 (made
   through the app's own controls at every door — A7); 28 and 30 (on a phone, the picture right after each tap). The
   rest are about a gesture, a layout, a scroll or a motion this change does not touch: 2, 4–8, 10–15, 17–21, 24, 26,
   27, 29, 31 — no control, box, bar or page moved.
5. **Its row** is added to the walk ledger when the walk closes.

## 4. The scenarios (Astra and a fresh, blind Fable, each blind to the other; the host combining)

The one brief: `../superpowers/briefs/2026-11-24-words-r4-scenario-brief.md`. The two lists, whole:
`../superpowers/briefs/2026-11-24-words-r4-scenarios-astra.md` (Astra, gpt-6-astra, high; read the branch at
`a358d4b1a`) and `../superpowers/briefs/2026-11-24-words-r4-scenarios-fable.md` (a fresh Fable; 19 scenarios, B1–B12,
N1–N3, P1, P2, L1, O1). **Blindness:** Fable saw nothing of Astra's. Astra, reading the working copy late in its run,
saw the code comment the host added for Fable's B1 fix (it says so in its report's head) and then read the code at the
commit; its own top candidate (R4-02, a title starting with its kind) was its own. **To combine (the next chat):** one
list, each scenario once, each EXPECTED line checked for its source (§4 "Before a brief leaves").

**Combined (chat 170)** — one list, each scenario once; the presses and every EXPECTED line with its source are in
the walkers' brief, `../superpowers/briefs/2026-11-24-words-r4-walk-brief.md`. An EXPECTED line there is one of: D2521's
full row; the words file; `facts.json`; D769 / D953 / D785; "as on `main` today" by a control run on `main`'s own build.
Anything else is RECORD, judged by the host afterwards (each designer's unsourced "expected" was turned into RECORD:
Fable's B2 (a)–(e), B3 (iii), B4 (b) (e) (f), B5 (b) (d) (f), B9, B11; Astra's R4-01, R4-04, R4-10, R4-12's status lines).

| # | The scenario | From Fable | From Astra | Walker |
|---|---|---|---|---|
| A1 | a kind change, no title; who is told and who never | B7 (first half) | R4-14 | a |
| A2 | a kind change, titled — a title that is the new kind's name, or starts with the old one | B1 | R4-02 | a |
| A3 | a kind change that adds or drops a half, a title, a "To" | B2 | R4-02 | a |
| A4 | a real rename; a title given, taken away; an Attach's "To" | B4 (h) | R4-02 | a |
| A5 | the half day, every form; which kinds offer it; is there a door to "Now AM" | B5 | R4-09 | a |
| A6 | three or more changes: the count, small letters, capitals; the remark and the "till" tick; a cancel | B4 | R4-11, R4-12, R4-13 | a |
| A7 | every door that changes an input: five openers of the window, the in-place boxes, one man's row, the calendar drag | B5 (b), N1's doors | R4-04, R4-06, R4-10, R4-14 | a |
| A8 | the long line on his iPhone (Chromium and WebKit at 402), the list's geometry | B6 | R4-15 | a |
| B1 | lines the OLD build wrote, read and tapped on the new one | B3 | R4-20 | b |
| B2 | a member's own save, the permissions gate, a reload | B8 | R4-03 | b |
| B3 | Undo and Redo of a save that wrote a new line, beside the same on `main` | B9 | R4-03 | b |
| B4 | a reload, a sign-out, another week, another page — the line stays as it was | — (§7.0, stored state) | R4-20 | b |
| B5 | a replaced Leave War bid, said after the rest and never counted | B10 | R4-05 | b |
| B6 | the Leave War's copy of a leave | B11 | R4-01 | b |
| B7 | the tap, read and unread, Mark all read, "↓ N more", the board's bell | B12 | R4-15 | b |
| B8 | the plain-user round for an input and the bell (§7.0a) | — | — | b |
| C1 | a time the app cannot read, every door, by Tab and by Enter; then a good time | N1, N2 | R4-06, R4-07 | c |
| C2 | a puck dragged back onto its own seat, every kind of seat; the tap's twin | N3 | R4-08 | c |
| C3 | the look-ahead saved; a member | L1 | R4-16 | c |
| C4 | publishing a day no Leave War period covers, every join | P1 | R4-17 | c |
| C5 | "Create the 2028 period": the hover in two lists, the note, a member | P2 | R4-18 | c |
| C6 | the OIL day list as a member | O1 | R4-19 | c |
| C7 | the plain-user round for the notes (§7.0a) | — | — | c |

**Set aside, each with its reason (§7.0):** Fable's B4 (c) and (d) (a cancel or an un-cancel joined to other changes in
one save) and B5 (e) (a titled half day) — no door makes either in one save; carried by `bellnotices.test.tsx` round 4
(calls the words directly), and A5 / A6 (g) have the walker confirm on screen that the door is absent. Fable's B7's
"Hunter filed it for two others" — a member filing for others is B2's own question, walked there. Astra's R4-12
"programme / unavailable controls in their actual sequence" — RECORD inside A6 (g) only: those lines' words are not this
round's. Nothing else of either list is left out.

**Found before the walk, from the designs, each reproduced by a failing test first:**
- Fable's B1 — a Training titled "Meeting" made a Meeting read "Training changed to Meeting, renamed — was Meeting"
  (nothing was renamed: the bold name stayed "Meeting"). Fixed `39367445f`: "Renamed" only where the bold name itself
  changed. Test: `bellnotices.test.tsx` "a Training titled "Meeting" changed to a Meeting…".
- Astra's R4-02 — a Training titled "Training · Safety" made a Meeting: the same phantom at `a358d4b1a`; closed by the
  same fix. Test: "a Training titled "Training · Safety" changed to a Meeting…".
- Fable's predictions still to walk: B2 (b)/(c) — a kind change that adds or drops a half day may also say "Now …"
  (the hours read as moved; "Now 00:00–12:00" beside "LL changed to Training" — so on `main` too); N2 — letters typed
  in the input window may get "Give the input a start and end time…" where the cells say "<typed> is not a time".

## 5. The orders walked, and what the screen said

## 6. The cases carried by a test, each with what it proves

- The bell's new words, old saved lines, the count of more changes, small letters and capitals:
  `src/ui/bellnotices.test.tsx` "round 4 of the words pass: the bell (D2521)" (written first, failing on today's words).
- The notes' words in their files, and the old words gone: `src/ui/noteswords.test.ts` (R4 rows, GONE rows).
- The bad time named, the first bad box: `src/ui/audit-guards-inputs.test.tsx` "an input time has to be a time".
- The drag back onto its own seat: `src/ui/drag.test.tsx` (three cases).
- The look-ahead note: `src/engine/lookahead.test.ts`.
- The publish note: `src/leavewar/oilsync.test.ts` "publishing a day no leave war period covers says so".
- The created-period note: `src/ui/oilperiod-offer.test.tsx`; the OIL list's refusal: `src/leavewar/holnotice.test.tsx`.

## 7. The pictures

## 8. The break tests

## 9. Errors seen

## 10. What was NOT walked, and why

## 11. The gate counts

## 12. What the walk found, and each disposition

## 13. The code reads (Astra and a fresh, blind Opus — the same brief; Fable beside them, high risk)

## 14. Lessons added (§7.11)
