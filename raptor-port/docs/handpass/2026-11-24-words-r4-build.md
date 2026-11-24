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
| R1 | The bell's list, desktop (top bar, `ui/topbits.tsx` BellList) — a changed input's line | another person's save of the input | YES — every ruled line (a: A1, A2, A5, A6; b: B1) | YES | the age, the unread dot, "Mark all read", "↓ N more": none over the words (A8) |
| R2 | The bell's list, phone (the same list as a full-width panel) | the same | YES — Chromium and WebKit at 402 | YES | the same; the ruled three-change line two rows in a 307px box, whole (A8) |
| R3 | A tap on such a line → the input's own window, the line marked read | a tap | YES (a: tap-r1; b: B1, B7) | YES — the unread count falls by one | the window is titled by its people ("Hex +1 · 16 Jul"), as before this change |
| R4 | Undo, then Redo, of the save that wrote a new-shape line — the line goes and comes back; the permissions gate passes it | Undo / Redo | YES — as on `main` but for the words (b: B3, both builds) | YES — a member's four-change save passed the gate and a reload (b: B2) | nothing else |
| R5 | The input's window, its start / end time boxes (`ui/inputedit.tsx normalizeInputDraft`) | Save with a bad time | NO, because its boxes are the browser's own time pickers, which cannot hold a bad time (c: C1 door 5) — the words are carried by `audit-guards-inputs.test.tsx` | — | — |
| R6 | An input's in-place start / end boxes (`ui/inputedit.tsx setInpField`) — on Edit Schedule's row, the Scheduler Board's row, one man's row of a shared leave. The Inputs LIST has none (c: door 4; Astra's negative) | a bad time typed in a box | YES — all three rows, by Tab and by Enter, desk and phone (c: C1) | YES — the box goes back, nothing saved, no bell line; a good time then saves | the note at the foot, never over the box |
| R7 | Edit Schedule, a puck dragged back onto its own seat — flying, duty, ground (first and second man), sim, sim passenger, alert, a placeholder (`ui/drag.ts`) | a drag | YES (c: C2) | YES — the man stays, nothing new for Undo | the landing ring. One man of an input's own row: NO, because that puck does not lift |
| R8 | The Scheduler Board, the same drag | a drag | YES; a finger drag on the phone too | YES | the same |
| R9 | The Inputs page's look-ahead, saved (the default window's pencil) | Save | YES — four settings, desk and phone (c: C3) | YES; a member has no pencil | nothing else |
| R10 | Publishing a weekend or holiday no Leave War period covers — Edit Schedule (`leavewar/sync.ts publishFlagsBids`), alone and joined to the publish note | Publish | YES — the week, the Board, an amendment, the phone; no such sentence on a weekday (c: C4). Joined to an unanswered-OIL line: NOT WALKED (no door left an input unanswered in three tries) — §10 | YES | the note whole inside the phone's screen |
| R11 | The week's warning list, the "Create the <year> period" button's hover (`ui/html.ts`) | hover | YES (c: C5) | YES | — |
| R12 | The Scheduler Board's warning line, the same button's hover (`ui/board.ts`) | hover | YES (c: C5) | YES | — |
| R13 | "Create the <year> period" pressed: the note "The <year> Leave War period is created…" (`ui/interactions.ts`) | a press | YES, from both lists; the Leave War opens on 2028, bidding closed | YES — once made, the button is gone | — |
| R14 | Its refusal to a non-scheduler, "Only a scheduler can create a Leave War period" | a press | NO, because a member is drawn the warning line without the button (c: C5) — the words carried by `oilperiod-offer.test.tsx` | — | — |
| R15 | The OIL day list's Save by a member, "Only a scheduler can answer from this list" (`ui/oilday.ts`) — not reachable on screen (facts.json q4c; c: C6 — no list, no chip, no bell line for a member): carried by `leavewar/holnotice.test.tsx` | a test | NO, because the window closes itself for a member | — | — |
| R16 | The sign-off's OIL list (`ui/oilsign.ts`, the same save) | a press | NO, because its refusal is the same line as R15's, drawn only to a non-admin; the list's own Save as a scheduler was NOT WALKED (c could not make its fixture) — §10 | — | — |

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

The walked build: `D:/rw4/build-new` — the app code of `39367445f`, bundle `index-2uyEcUJu.js`, logged in every world;
the control, `main`'s `19637da31` (`index-CkMVta6F.js`); each served inside the test browser from its frozen folder.
The host's own run first (`scripts/handpass/wr4-host.mjs`, 6 of 6), then three Opus walkers side by side. Their reports,
whole: `parts/wr4/a-report.md`, `b-report.md`, `c-report.md`; **179 checks pass, none fail** (a 56, b 27, c 96).

- **The ruled lines, as the screen printed them (a):** "LL changed to OL · Saber" (Ranger and Hex alike; nothing in
  Saber's own bell); "Training changed to Meeting · Saber" for the titles "Brief", "Meeting", "Training · Safety";
  "Renamed — was Training · Saber"; "Now LL (AM)", "Now LL (PM)", "Now all day", "Now Thu 16 Jul (AM)", "Now HL (AM)";
  "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber"; two changes, no "more"; four, "Now Thu 16 Jul,
  Ace added, and 2 more changes · Saber"; "Hex taken off, Training changed to Meeting, and 1 more change · Saber" while
  Hex reads only "You were taken off · Saber".
- **Recorded, not ruled (a):** a Training "Range brief" → LL, "Training changed to LL, renamed — was Range brief"; an AM
  LL → Training, "Now 00:00–12:00, LL changed to Training"; a Training 00:00–12:00 → LL (the app makes it a half),
  "Now LL (AM), Training changed to LL"; an all-day LL → OL and AM, "Now OL (AM), LL changed to OL"; an AM leave only
  moved, "Now Wed 22 Jul" (no "(AM)"); a title given / taken away / an Attach's "To" changed, "Renamed — was …". AM / PM
  is offered on the twelve leave and medical kinds, a Title box on ten others — no kind has both, so "Now AM" has no
  door. One save of the window cannot cancel an input.
- **Doors (a, c):** the window from the Inputs list's row, the calendar's day card and Edit Schedule's pencil, the
  in-place start box on Edit Schedule's row and a bar dragged on the Inputs calendar all write the same words.
- **Saved lines and orders (b):** lines the OLD build saved read on the new one as they did ("Renamed — was LL · Saber",
  "Now 00:00–12:00 am · Saber"), open their input on a tap, and stand beside new lines in the new words; an old
  three-part line now ends "and 1 more change" (the host's run h4c). A reload, a sign-out, another week and the Leave
  War and back leave a line as it was. Undo and Redo behave as on `main` but for the words. A member's own four-change
  save passes the gate: "Now 10:00–11:00, Training changed to Meeting, and 2 more changes · Ranger". A replaced bid:
  "Now Fri 11 Dec, OL changed to PL, and 1 more change · replaces your LL bid · Saber" (a Training never replaces a bid
  in this app — only a leave or medical input does). The Leave War's copy: one line for one act.
- **The notes (c):** "<typed> is not a time. Try 0900 or 09:00." at every in-place box, by Tab and by Enter, the box
  put back, nothing saved, then a good time saves; "<callsign> — already in that seat" for every kind of seat on both
  screens and by a finger on the phone; the four look-ahead notes; the publish note and the warning list's identical
  sentence; the hover and the created-period note.

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

`../img/handpass/2026-11-24-words-r4-walk/` — `host/` (6), `a/`, `b/`, `c/` (the cited runs; each report names the
picture that decides each line), `d/` (the re-walk). The walkers' uncited first attempts are not kept in the project.
Opened by the host: `host/h3-phone-bell.png` (the ruled three-change line, two rows, whole); `a/tap-r1/A1-tap-line-settled-phone.png`
(the input's window after a tap on a line); `c/c6c7-103612/c7-longnote-wk.png` (the long note, §12).

## 8. The break tests

`node scripts/handpass/breaks.mjs scripts/handpass/breaks/wr4-words.json` — **10 of 10 caught**, the tree as it was
after (run after the last code change, `489420a0c`): one per fix — the swallowed title said as renamed again
(`bellnotices.test.tsx`), the no-period sentence left behind the dot (`noperiod-join.test.ts`), the crew list's name on
his own seat silent again (`drag.test.tsx`), the name's words cut out of the bold name again (`bellnotices.test.tsx`) —
and one per wired place of the build: a kind change with no words of its own (8 tests red), the count not said (4), a
half not said as AM / PM (3), the in-place box's old words (`audit-guards-inputs.test.tsx`), the look-ahead note's
"the" and one-week form (`lookahead.test.ts`), the drag's note not naming the man (4). Not broken here, a real
browser's to see: nothing — every wired place of this change is words, read by a unit test and seen in the walk.

## 9. Errors seen

None: no console error, page error or failed request in any cited run of the host or the three walkers. (WebKit's
"Couldn't save that document…" on this PC is the test browser's, not the app's.)

## 10. What was NOT walked, and why

- **A cancel of an input beside other changes** — no door makes one in the same save (a: A6 g); the schedule's own
  cancel, a save of its own whose words this round did not change, was not reached by the walker's script. The words:
  `bellnotices.test.tsx` round 4.
- **A titled half day, "Now AM"** — no kind offers both a title and a half (a: the sweep). The words: the same test.
- **The publish note joined to an unanswered-OIL line** — no door left an input filed with its OIL question open in
  three tries (c: C4 b); an answered one beside it read rightly. The join: the code readers' question 6, §13.
- **The OIL list** — a member reaches no list (c: C6); its Save as a scheduler was not driven (the fixture). Its one
  changed line is the refusal, carried by `holnotice.test.tsx`.
- **The Leave War's own retype of a leave** — it offers none ("change it on the Inputs page", b: B6 b).
- **The input's window from the Scheduler Board's pencil** (a: A7 iv, the script could not press it) — walked in the
  re-walk (d: D3).
- **A finger's scroll of the bell's list on the phone** — the list's scroll was set directly (a: A8); the list's own
  scrolling is not this change's.
- **What only his iPhone shows:** how its own letters wrap the two-row line (the walk used Chromium's and WebKit's on
  this PC) — on his look card.

## 11. The gate counts

## 12. What the walk found, and each disposition

1. **A title in small letters that the new kind's name swallows read as a phantom rename** (a: A2 iii) — a Training
   titled "meeting" made a Meeting read "Training changed to Meeting, renamed — was meeting · Saber". Confirmed by the
   host with a failing test (`bellnotices.test.tsx`, "a Training titled "meeting" (small m)…"), new with this change
   (the same family as Fable's B1). **Fixed** `68ab6d1db`: a title the new kind's name swallows by the app's own rule
   (`engine/inputs.ts titleOf`, ignoring case) is no rename; a title a kind with no title box takes away still says so
   (its own test). Re-walked: d's D1.
2. **A 60-letter value typed in a time box runs about 10px past the note's border on the phone** (c: C7; the host
   opened `c7-longnote-wk.png`). The note has named what was typed in the schedule's own time boxes since before this
   change, so this is an older fault of the note's box, now also reachable from an input's row. Contrived (nobody types
   60 letters without a space into a time box) — **filed**, `OUTSTANDING.md` `[UI-SLEEK-PASS]` round 4's leftovers; a
   fix belongs in a real-browser test of the note's box, not in this words change.
3. **Not faults — wordings nobody ruled, listed for a later round** (the same backlog item): "Now OL (AM), LL changed
   to OL" names the new kind before saying it changed; "Now 00:00–12:00, LL changed to Training" says hours nobody
   typed; an AM leave only moved says no "(AM)".
4. **Leads checked:** the input window's last line on the phone ("Placed by … changed by …") continues on a second row
   inside the window's own scrolling body — nothing cut (the host opened the picture). The week's Ground Programme row
   still reading 08:00 after the Board saved 09:00 on the phone (c) — walker d reproduced a stale time, but on the BOARD's own Ground Programme row, which lags one change behind the input while the Board stays open (the week's row never did); the same on `main`, a desktop and a phone; closing the Board or a reload clears it. The host opened `d/d34-r3/D4-fixed-3-after-0900-on-board-board-ground-desk.png` (08:00 drawn, the input saved as 09:00). Older, not this change's — **filed**, `[UI-SLEEK-PASS]` round 4's leftovers (4).
6. **The re-walk (walker d, the FIXED build `D:/rw4/build-new2`, bundle `index-BNHpQA1S.js`; `parts/wr4/d-report.md`):** D1 the same script shows "…, renamed — was meeting · Saber" on the walked build and "Training changed to Meeting · Saber" on the fixed one, phone and desktop; D2 nine lines that must not have moved, all as ruled ("brief" retitled "Brief" with its kind left alone: "Renamed — was brief · Saber"); D3 the door the first walk missed — the start changed in the Scheduler Board's in-place box: Hex and Ranger each read "Now 09:00–10:00 · Saber"; the Board's pencil opens the input's own window.
5. **Seen in passing, as before this change, not this round's:** the input's window is titled by its people, so a tap
   on "Range brief" opens "Hex +1 · 16 Jul"; the browser's own time picker turns the keys 2-5-6-0 into 9 pm and Save
   then keeps a start after its end (an input may cross midnight); pressing outside the input's window on a desktop
   does not close it (it sits beside the page by design).

## 13. The code reads (Astra and a fresh, blind Opus — the same brief; Fable beside them, high risk)

The one brief: `../superpowers/briefs/2026-11-24-words-r4-read-brief.md`. Each read an exported copy of `68ab6d1db`
(`D:/rw4/read-copy`) from which this sheet, the two scenario lists, the scenario and walk briefs, the walkers' reports and
scripts and the branch's handoff block were taken out. The three reports, whole, each under a head from its own run:
`../superpowers/briefs/2026-11-24-words-r4-read-astra.md`, `…-read-opus.md`, `…-read-fable.md`. Astra 5 claims, the
Opus reader 2, the Fable reader 3 — seven different ones; no claim of one contradicts a negative of another.

| # | The claim | Who | Reproduced by the host | Against the ruling, and `main` | Disposition |
|---|---|---|---|---|---|
| 1 | Behind another OIL line the no-period sentence is joined ". ·" — "…earns OIL. · No Leave War period for 2028…" | Opus 1, Fable 1 (b) | YES — `leavewar/noperiod-join.test.ts`, failing first (the real note batcher and note element) | the words file's S2: "joined after another line it follows as its own sentence"; the ". ·" was so on `main` | **confirmed, pre-existing, inside this round's promise — FIXED** `b4cd80acb` (`publishFlagsBids`: the sentence folded into the join's own, nothing left after it) |
| 2 | Alone, the note reads "Saturday published and approved · No Leave War period…", where "the page he approved shows a full stop" | Fable 1 (a) | checked against the page: its only showing of this note is the picture `s2-no-period-after.png`, which reads "… approved · No Leave War period for 2028, …" (`facts.json`); the page's text holds no "published and approved" at all | the dot-joined form IS what he approved | **false positive** — left as built; walker c's C4 (a) and the Opus reader read it the same way |
| 3 | A kind change alone also says "Now …" when the new kind adds or drops the half ("Now LL (AM), Training changed to LL"; "Now 00:00–12:00, LL changed to Training") | Opus 2, Fable 3; walker a's A3 (b) (c) | YES on screen (walker a) | not ruled; the shape was so on `main` in the old words | **his call** — filed with the unruled wordings, `[UI-SLEEK-PASS]` round 4's leftovers (2) |
| 4 | A name dragged from the crew list onto the seat that man already holds says nothing, where the tap says "<callsign> — already in that seat" | Fable 2 | YES — `ui/drag.test.tsx` "his name dragged from the crew list onto the seat he holds…", failing first (no note at all) | D2521 Q4b: "a drag onto the seat a man holds answers …, as the tap's does"; silent on `main` too | **confirmed, pre-existing, inside this round's promise — FIXED** `c3498b918` (`applyDrop`: one `same()` for the seat's own puck and the crew list's name) |
| 5 | A real rename goes unsaid: a Training titled "Training · briefing" made a Meeting titled "Meeting · briefing" reads only "Training changed to Meeting" | Astra 1 | YES — `bellnotices.test.tsx` "…says the kind AND the rename", failing first | D2521 Q1: "Renamed — was <old title>" when the title's own words change; new with this change (`ownName` cut both names to one tail) | **confirmed, new — FIXED** `489420a0c` (`ownName` read from the record's title and "To", never cut out of the bold name) |
| 6 | An old saved line of three parts now ends "and 1 more change" where it read two parts before | Astra 2 (the Opus and Fable readers name it as by design) | YES — the host's run h4c | the promise is that old lines still READ; they do, whole | **not a finding (D56)** — it lives only in lines already stored, which are demo data; a version stamp on every line is not built |
| 7 | An AM leave only moved to another day says "Now Thu 16 Jul", no "(AM)" | Astra 4; walker a's A5 | YES on screen (walker a) | not ruled (D2521's "(AM)" example moves the day AND makes the half); so on `main` | **his call** — filed with the unruled wordings, (2) |

**The fixes of the reads are new code (§5):** `b4cd80acb` (the publish note's join), `c3498b918` (the crew list's drag),
`489420a0c` (`ownName`) — each more than a one-line guard, so each got a narrow read by a fresh Opus helper handed only
the fix commits and the claims they answer: **nothing wrong — each fix right and complete, nothing broken beside it**
(round 1 of at most three, and the last: no finding to fix). Its report, whole: `../superpowers/briefs/2026-11-24-words-r4-read-narrow.md`
(every shape of the publish note's join; the drag's order of checks and what the old path did; `ownName` on 13 pairs).
The re-walk of what the three touch: walker e, on `D:/rw4/build-new3` (bundle `index-DIr933hk.js`) — §12.

## 14. Lessons added (§7.11)
