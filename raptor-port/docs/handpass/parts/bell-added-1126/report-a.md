# bell190 — walker A (the schedule: Edit Schedule and the Scheduler Board) — report

Walked 26 Nov 26 by walker A (Opus). Build: bundle `index-B9okpSpf.js`, checked on every sign-in.
- Desktop: Chromium 1536×864 at http://localhost:4190/.
- Phone: WebKit 402×874, touch, 3x. WebKit refuses port 4190 ("Not allowed to use restricted network port").
  **Every phone result cited below comes from http://localhost:4173/**, the same build, as the host directed. Earlier
  phone attempts used a routed address. They were re-run on 4173, and their pictures were overwritten by those runs.
- People: Saber `ad` acts throughout. Ranger `us` is the man added, and his bell was read **on screen in every case**.
  Tally (`nick`) and Hex (`rocky`) are the others in each input.
- Third sign-in: in world A1-only-week-desk, Saber gave **Tally** a sign-in (`tally`, any password) through
  Admin → Users → his row → "Give sign-in". That is the app's own form for a man already on the roster. Tally's bell
  was read on screen there. Everywhere else, Tally's, Hex's and Saber's bells were read from the store
  (`window.NOTICES`, the lines addressed to each man).
- Tally is a SANS man (his puck is marked SANS). No SANS line got into any count.
- Every input was filed in the run through the Inputs calendar's "+ Input". One leave was entered on the Leave War
  grid (A4 war). Each scenario had its own fresh browser world.
- Pictures: `raptor-port/docs/img/handpass/2026-11-26-bell-added/a/` (221 files, `a-<scenario>-<step>.png`). On the
  phone, `-lift` pictures were taken straight after a tap.
- Scripts and logs: `C:/Users/User/AppData/Local/Temp/claude/a0a73751ce6bb0b4/a7bfbc5c-70a8-46a1-9ccd-a4391c31b9f1/scratchpad/bell190-a/`
  (`bell190-a-lib.mjs` v12, `-g1`, `-g1b`, `-g23`, `-g4`, `-g5b`, `-g567`, `-g89`; final logs `g1.log`,
  `g1phone.log`, `g23.log`, `g4.log`, `g4war.log`, `g4phone.log`, `g567.log`, `g6win.log`, `g89.log`).

**Counts: 41 scenario rows — 34 PASS (seven of these also carry a RECORD part), 7 RECORD only, 0 FAIL, 0 BLOCKED.**

What every line looks like on Ranger's bell: **<name>** <day> / *You were added · Saber*, with "now" at the right and
the line unread. In the store the lines read: Ranger `in`; others `add:[bane]`; a man replaced `out`. Saber, the man
who acted, got **no line in any scenario**.

## The table

| # | Scenario (sources) | Door, size | Verdict | What each bell said (Ranger on screen; others from the store) | A tap on Ranger's line opened | Pictures (a-…) |
|---|---|---|---|---|---|---|
| 1 | Drop on the "+ add" of Tally's Training (F1, A1) | Edit Schedule, desktop | PASS | Ranger: *Training Wed 15 Jul · You were added · Saber* (1 line). Tally: Ranger added. Saber: none | The input's window: Training, Ranger and Tally | A1-empty-week-desk-2-carried, -3-after, -4-ranger-bell, -4-ranger-tap |
| 2 | Drop on Tally's puck in a shared Training, Tally + Hex (F2, A2) — today it JOINS | Edit Schedule, desktop | PASS | Ranger: You were added. Tally and Hex: Ranger added, 1 line each. Nobody told "taken off" | The input: Ranger, Hex, Tally | A1-shared-week-desk-* |
| 3 | Drop on the only man's puck (F3, A3) — REPLACES | Edit Schedule, desktop | PASS | Ranger: You were added. Tally: *You were taken off · Saber*, **read on Tally's own screen** beside his earlier filing line; no "Ranger added". Note on screen: "Ranger is on Training instead of Tally" | The input, Person Ranger | A1-only-week-desk-* (-5-tally-bell) |
| 4 | The same "+ add" drop (F7, A1) | Board, desktop | PASS | As in 1 | The input | A1-empty-board-desk-* |
| 5 | Shared puck (F7, A2) | Board, desktop | PASS | As in 2 | The input | A1-shared-board-desk-* |
| 6 | Only puck (F7, A3) | Board, desktop | PASS | As in 3 | The input | A1-only-board-desk-* |
| 7 | "+ add" by tap: tap the place (it is armed and the crew drawer opens), then tap Ranger (F7, A4) | Board, phone | PASS | As in 1 (picture taken straight after the bell tap) | The input | A1-empty-board-phone-2-armtap-lift, -2-pick-lift, -4-ranger-bell-lift, -4-ranger-bell, -4-ranger-tap |
| 8 | Shared puck by tap (A4) | Board, phone | RECORD | **No tap route.** A tap on a man's puck selects him (blue) and rings where he may go; it does not arm the place. Ranger's tap then places nothing. Input unchanged, no line for anyone, Ranger's bell empty | — | A1-shared-board-phone-2-armtap-lift, -2-pick-lift, -4-ranger-bell |
| 9 | Only puck by tap (A4), both tap orders (Ranger first, then Tally's puck: g1b) | Board, phone | RECORD | As in 8. Neither tap order puts a man on another man's puck. No line | — | A1-only-board-phone-*, A1-only-board-phone-crew-first-1/2/3 |
| 10 | Ranger dragged from his Thursday flying seat (RU, 3.1.1.0.p) onto the "+ add" of Tally's Thursday Training (A5) | Edit Schedule, desktop | PASS + RECORD | Ranger: Training Thu 16 Jul · You were added · Saber. Tally: Ranger added. **His seat: he STAYS in it** — he is now in the flying seat and on the Training, a clash, with no note | The input | A2-seat-to-add-week-desk-2-carried, -3-after-row, -3-after-seat, -4-* |
| 11 | Same (A5) | Board, desktop | PASS + RECORD | As in 10; he stays in the seat | The input | A2-seat-to-add-board-desk-* |
| 12 | Ranger dragged from his seat onto Tally's only puck (F5, A5) — a swap | Edit Schedule, desktop | PASS + RECORD | Ranger: You were added. Tally: You were taken off. Nothing more to Tally for the seat. **The seat did not refuse Tally:** he was put there with the note "Tally — Illegal seat: a WSO in the front seat of RU BFM (T/O 16:45)" | The input, Person Ranger | A2-seat-to-puck-week-desk-* |
| 13 | Same (F5, A5) | Board, desktop | PASS + RECORD | As in 12 | The input | A2-seat-to-puck-board-desk-* |
| 14 | Ranger moved from Training A (Ranger + Hex) to Meeting B's "+ add" (Tally) (F6, A6) | Edit Schedule, desktop | PASS | Ranger: 2 lines, A *You were taken off*, B *You were added*. Hex: Ranger taken off (A). Tally: Ranger added (B). Note "Ranger moved to Meeting". **One Undo** put both inputs back, and all 4 unread lines went | — (store) | A3-move-to-add-week-desk-2-carried, -3-after, -5-undo |
| 15 | Same (F6, A6) | Board, desktop | PASS | As in 14, Undo included | — | A3-move-to-add-board-desk-* |
| 16 | Same move, but dropped on Meeting B's **only** puck, Tally's (A6, "distinguish from the crew-list drop") | Edit Schedule, desktop | RECORD | **It JOINS, it does not replace:** B now holds Tally and Ranger. Lines as in 14 (Tally: Ranger added; no "taken off"). A crew-list drop on the only puck REPLACES (row 3). One Undo put both back | — | A3-move-to-puck-week-desk-* |
| 17 | An Other "→ Unavailable" (Dentist) for Tally; drop on Tally's Unavailable puck (F13, A7) | Edit Schedule, desktop | PASS | Ranger: *Dentist Wed 15 Jul · You were added · Saber*. Tally: You were taken off. Note "Ranger is now unavailable instead of Tally" | The input (Other), Person Ranger | A4-other-week-desk-* |
| 18 | Same (F13, A7) | Board, desktop | PASS | As in 17 | The input | A4-other-board-desk-* |
| 19 | Same by tap: tap Tally's Unavailable puck (it is armed as the hand-over), then Ranger (F13, A7) | Board, phone | PASS | As in 17 | The input | A4-other-board-phone-2-armtap-lift, -2-pick-lift, -4-ranger-bell-lift, -4-ranger-bell, -4-ranger-tap |
| 20 | LL filed for Tally on the Inputs page; drop on his Unavailable puck (F14, A9) | Edit Schedule, desktop | PASS | Ranger: *LL Wed 15 Jul · You were added · Saber* — one line; nothing from the Leave War. Tally: You were taken off | The input (LL), Person Ranger | A4-ll-inputs-week-desk-* |
| 21 | LL entered on **Hex's** Leave War row, Auto-approve on (Tally has no row on the war); drop on Hex's Unavailable puck (F15 ★★) | Edit Schedule, desktop | RECORD | Ranger: *LL Wed 15 Jul · You were added · Saber* (the Inputs line, one only; no war line). Hex: You were taken off (one only). On the Leave War, Wed 15 Jul: **Ranger's cell now shows LL approved; Hex's cell is empty**. So the man put on the leave IS told, by the input's words — the "told by neither" fear did not happen | The input window (LL), Person Ranger — not the Leave War | A4-war-window, A4-ll-war-week-desk-2-carried, -3-after, -5-war-after, -4-ranger-bell, -4-ranger-tap |
| 22 | A medical (ATT C, filed with no document) for Tally; drop on it (F17, A9) | Edit Schedule, desktop | RECORD | **No question was asked.** The hand-over was made at once, note "Ranger is now unavailable instead of Tally". Ranger: *ATT C Wed 15 Jul · You were added · Saber*. Tally: You were taken off | The input (ATT C), Person Ranger | A4-medical-week-desk-* |
| 23 | Shared Other under Unavailable (Hex, Tally); drop on Tally's row, the second listed (F18, A8) | Edit Schedule, desktop | PASS | Ranger: You were added. Tally: You were taken off. Hex: **one** line, `add:[Ranger] + rem:[Tally]` | The input: Ranger, Hex | A4-shared-other-week-desk-* |
| 24 | Same (F18, A8), then a time typed on Hex's own Unavailable row (start 09:00, Tab, end 11:00, Tab) — F18's second half | Board, desktop | PASS + RECORD | The drop: as in 23. The typing gave Hex an input of his own. **Hex was not told "taken off" or "added"**. He got two lines, *Now 09:00–18:00* and then *Now 09:00–11:00* — one for each box typed. Ranger got *Hex taken off · Saber* | Ranger's first line, "Hex taken off" → the input | A4-shared-other-board-desk-6-hex-time, -4-ranger-bell |
| 25 | Training Tue 14–Thu 16 for Tally + Hex; Ranger added on its middle day (A10) | Edit Schedule, desktop | PASS + RECORD | **A several-day Training draws its Ground Programme row on its FIRST day only:** Tue has the row, Wed and Thu have none, so it cannot be added to on Wednesday. Dropped on Tuesday's "+ add": Ranger *Training Tue 14 Jul · You were added* — one line, not one per day. Tally and Hex: Ranger added, 1 each | The input: Ranger, Hex, Tally | A5-tue-thu-ground-on-tue-week-desk-1-wed-ground, -3-after, -4-ranger-bell, -4-ranger-tap |
| 26 | Other → Unavailable, Tue 14–Thu 16, for Tally; drop on **Wednesday's** Unavailable puck (A10) | Edit Schedule, desktop | PASS | The Unavailable row stands on all three days. Ranger: *Course Tue 14 Jul · You were added* — one line. Tally: You were taken off, one line | The input | A5-tue-thu-unav-week-desk-* (-3-day1, -3-day3) |
| 27 | The input's own window opened from the schedule: Personal Inputs unfolded, the input's label pressed; one-person Training (F19, A11) | Edit Schedule, desktop | PASS + RECORD | **That window has ONE Person box, with no "Several people"** (the Inputs page's window has it). So a person cannot be ADDED here, only CHANGED. Person changed to Ranger (F20, D776): Ranger You were added; Tally You were taken off | The input | A6-window-one-week-desk-2-window-opened, -2-window, -4-* |
| 28 | Same, with the start time changed in the same save (F19, F20) | Board, desktop | PASS | Ranger: `in` only, nothing about the time. Tally: `out` | The input | A6-window-one-board-desk-and-time-* |
| 29 | Same (F19) | Board, phone | PASS | As in 27 | The input | A6-window-one-board-phone-* (-2-window-lift, -4-ranger-bell-lift) |
| 30 | The window from the schedule on a shared Training (Tally + Hex): its people list shows; Ranger ticked; saved (F19, A11) | Edit Schedule, desktop | PASS | Ranger: You were added. Tally and Hex: Ranger added, 1 each | The input: Ranger, Hex, Tally | A6-window-shared-week-desk-* |
| 31 | Same, with start 10:00 in the same save (F19's second half) | Board, desktop | PASS | Ranger: only `in`. Tally and Hex: ONE line each, `when 10:00–11:00` + `add:[Ranger]` | The input | A6-window-shared-board-desk-and-time-* |
| 32 | Same as 30 (F19 phone) | Board, phone | PASS | As in 30 | The input | A6-window-shared-board-phone-* |
| 33 | The Board's Ground Programme "+ Inputs": a Training filed for Ranger (A12) | Board, desktop | PASS | Ranger: *Training Wed 15 Jul · You were added · Saber*; nobody else. Note "Input added to the Ground Programme" | The input | A6-board-plus-inputs-desk-* |
| 34 | Saturday Training for Tally (OIL Yes); Ranger dropped on his only puck — the question; then **Swap** after "Yes: credit HO" (F8a, A37) | Edit Schedule, desktop | PASS | While the question was up ("OIL: Ranger, Training — Putting Ranger in place of Tally … Does it deserve HO…?", buttons "Don't swap" / "Swap"): nothing moved, **no line**. After answering: Ranger You were added (1); Tally You were taken off (1) | The input | A7-sat-oil-answer-week-desk-3-question, -4-answered, -4-ranger-bell |
| 35 | Same, then **"Don't swap"** (F8b, A37) | Edit Schedule, desktop | PASS | No line for anyone; the input unchanged; the "Answer OIL" bar stays. Ranger's bell empty | — | A7-sat-oil-back-week-desk-3-question, -4-backed, -4-ranger-bell |
| 36 | A refused drop: Ranger dropped on the "+ add" of a Training he is already on (F10, A36) | Edit Schedule, desktop | PASS | Note "Ranger is already on this input"; no line for anyone | — | A7-refused-already-on-week-desk-3-refused |
| 37 | Wednesday published (4 sign-offs, Publish day), then Ranger dropped on Tally's Training "+ add"; then "Publish AL1" (F44, A35) | Edit Schedule, desktop | PASS + RECORD | **The line is written at the add**, while the change waits as AL1: Ranger in, Tally Ranger added. Publishing AL1 ("Published AL1 · 1 item on Wed only") wrote **no second line**. Ranger's screen: 1 line | The input | A8-published-drop-desk-1-published, -3-pending, -4-amendment-published, -5-ranger-bell, -5-ranger-tap |
| 38 | Wednesday published, then a Meeting filed for Ranger on the Inputs page; then AL1 published (F44, A35) | Inputs page → Edit Schedule, desktop | PASS + RECORD | Written at the filing (Ranger `in`); none at publish; 1 line on screen | The input | A8-published-inputs-desk-* |
| 39 | Undo of a "+ add" before Ranger reads it; then Redo; then Undo again (F45, A38) | Edit Schedule, desktop | PASS | Undo: Ranger's line and Tally's both gone. Redo: both back (new; he had never opened them). Undo again: Ranger's bell not lit, no Training line | — | A9-undo-unread-week-desk-3-undone, -4-redone, -5-ranger-bell |
| 40 | Undo after he read it — one tab, as F46 is written: Ranger reads, Saber signs back in (F46, A39) | Edit Schedule, desktop | RECORD | **Saber's Undo is greyed once he signs back in** (his Undo list clears on sign-out — D148). So F46 cannot happen in one browser tab | — | A9-undo-after-read-one-tab-desk-3-ranger-reads-bell, -4-saber-back |
| 41 | Undo after he read it — two tabs of one browser: Saber added in tab 1; Ranger signed in and opened his bell in tab 2; Saber pressed Undo in tab 1; tab 2 reloaded (F46, A39) | Edit Schedule, desktop | RECORD | Tab 2 asked for its own sign-in. Ranger saw *Training · You were added · Saber*. After Saber's Undo, Ranger's bell was **empty** — the line simply went. No "taken back" line and no new line (D1693/D2437 are not built for input lines — the baseline). Caveat: two tabs never sync; tab 1 may not have known Ranger had read it | — | A9-undo-after-read-two-tabs-desk-3-tab2-ranger-reads, -4-tab1-undo, -5-tab2-ranger-after-undo |

## Every FAIL in full

None. No scenario's final run failed.

## For the host: what was recorded rather than ruled (each a candidate question, none called a fault)

1. **The phone has no tap route to a man's puck** (rows 8, 9). On the Board, a tap on a real man's puck selects him; it
   does not arm the place. So the phone can only join through "+ add". The only-man replace and the drop on a shared
   puck exist only as a desktop drag. A finger drag on the phone was not walked: WebKit touches drive no pointer drag.
2. **A drag from a flying seat onto an input's "+ add" leaves him in the seat too** (rows 10, 11). He ends up both
   flying and on the Training, with a clash and no note. A drag onto the only puck SWAPS (rows 12, 13). There the seat
   took Tally with an "Illegal seat" warning, not a refusal, so F5's "whole drop refused" case was not reached.
3. **A move from another input's row onto an input's only puck JOINS** (row 16). The same drop from the crew list
   REPLACES (row 3). This matters for D2772's coming change.
4. **A Leave-War-approved leave handed over by a schedule drop** (row 21). Ranger is told by the input's words
   (*LL · You were added*), and a tap opens the input, not the Leave War. The war's grid moved the approved LL to
   Ranger's row. Lead, not checked: Hex's Leave War balance read −2 after the drop (picture -5-war-after). His balance
   before was not read.
5. **A medical with no document is handed over with no question** (row 22). Whether one with a document asks was not
   walked.
6. **A time typed on one man's own Unavailable row writes a line per box typed** (row 24): "Now 09:00–18:00", then
   "Now 09:00–11:00".
7. **A several-day Ground Programme input draws its row on its first day only** (row 25). A10's "add on its middle
   day" is possible only through the Unavailable route (row 26), where it was one line.
8. **The input's window opened from the schedule cannot add a second person to a one-person input** (row 27). It has
   no "Several people", so the scheduler can only replace the person.
9. **A published day** (rows 37, 38): the line comes at the change, not at the amendment's publication, and is never
   doubled. Discarding the pending change instead was not walked.
10. **Undo after the line was read** (rows 40, 41): one tab cannot do it (D148), and in two tabs the line simply goes.

## Not walked, and why

- F4 (the only man who filed it himself): not on walker A's list.
- Discarding a pending amendment after the add (F44's last question): no discard control was found and proved in the
  time.
- A medical carrying a document: the fixture filed with "no document".
- A phone finger drag: WebKit cannot drive one.

## Script faults met and fixed before the cited runs (none is an app finding)

- The drag aimed at the middle of the "+ add" place, which holds the man's puck. Fixed by aiming at the "+ add" words.
- The week's hidden copies of days were picked; a press is now aimed only where it hits the element.
- A drop released off-target when the target was out of view; the pointer now carries the puck to the screen edge so
  the page scrolls.
- The window from the schedule is `#inpEditPop`, not the Inputs page's window.
- The publish confirm matched another day's greyed "Publish day".
- In every case, a world spoiled by an earlier attempt was thrown away, and the scenario re-run in a fresh world.
  The pictures of the earlier attempts were deleted, apart from the phone pictures overwritten by the 4173 re-runs
  (see the top).
- Every browser and script started has been stopped.
