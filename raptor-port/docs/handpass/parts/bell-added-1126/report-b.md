# bell190 — walker B (the Inputs page) — report, 26 Nov 26

**Result: 32 PASS · 0 FAIL · 6 RECORD · 0 BLOCKED** (plus 4 parts NOT WALKED, listed at the end).
**WebKit re-run (host's ask, port 4173): 3 PASS · 0 FAIL · 1 RECORD** — see the last section.

## The world
- Served build checked: the page loads `assets/index-B9okpSpf.js` from `http://localhost:4190/` (probe log).
- Every scenario group ran in its OWN fresh Chromium context (one context per script), signing people in and out in that
  one tab. Every input was made through the app's own controls in the run (D56).
- **The third man is Moxie** — made by Saber on Admin → Users with the app's own "Add a person" form: callsign Moxie, WSO,
  CAT B, sign-in `moxie@mail`, Member (a fresh context makes him again each run). Note: "Kestrel" could not be used —
  it is already a 149 man's callsign on the roster (id `kes9`).
- Other bells: **Hex has a sign-in on the demo roster (`hex`)** — read ON SCREEN. **Tally and Zulu (no sign-in) — read in
  the store** (`window.NOTICES`, filtered by `to`). Ranger, Saber, Moxie, Hex: read on screen, each pictured.
- **Phone: walked in Chromium at his iPhone's size, NOT in WebKit.** WebKit refuses the port outright — "Not allowed to
  use restricted network port 4190" (`bell190-b-wk.mjs`) — and I may not start a server. Phone context: 402×874,
  isMobile, hasTouch, deviceScaleFactor 3; every press a tap; a picture within ~60 ms of the tap that opens the bell
  (`*-tap.png`) and the settled one. The host may want a WebKit look on another port.
- Ids used: Ranger `bane`, Saber `stiff`, Hex `rocky`, Tally `nick`, Zulu `bullet`, Moxie (new id each run).
- Scripts: `scratchpad/bell190-b/bell190-b-s1.mjs … -s9.mjs`, shared helpers `bell190-b-lib.mjs`; logs `s1.log … s9.log`
  beside them. Pictures: `raptor-port/docs/img/handpass/2026-11-26-bell-added/b/` — **116 pictures, all from the final
  run of each script** (each script empties its own `b-sN-` prefix before it runs).

## The table
Bell words are exactly as drawn in the bell list (bold name · day / the line · who). "Store" = read in `window.NOTICES`.
Every scenario also checked: the actor (Saber, or Ranger where he filed) had NO line — Saber's bell "Nothing new" each time
(`b-s1-saber-bell.png`, `b-s1p-saber-bell.png`, `b-s2-saber-bell.png`, `b-s4-saber-bell.png`) and 0 lines to `stiff` in the
store except where Ranger acted on him (3a).

| # | Scenario | Door | Size | Result | What each bell said | Tap opened | Pictures |
|---|---|---|---|---|---|---|---|
| 1a | "+ Input", Training for Ranger alone, Wed 15 Jul [F21, A13] | List, desktop | 1 man | PASS | Ranger: **Training** Wed 15 Jul · You were added · Saber (bell lit, dot). Store: one line, nobody else | its window, "Ranger · 15 Jul" | b-s1-1a-window, b-s1-ranger-bell, b-s1-ranger-tap-1a(-tap) |
| 1b | same, from a day opened on the calendar [F21, A13] | Day, desktop | 1 | PASS | Ranger: **B1b Day train** Wed 15 Jul · You were added · Saber | — | b-s1-1b-window, b-s1-ranger-bell |
| 1c | one Meeting for Ranger, Moxie, Saber [F22, A14] | List, desktop | 3 | PASS | Ranger and Moxie: **B1c Meet three** Wed 15 Jul · You were added · Saber — ONE line each, no "Moxie added"/"Ranger added"; Saber none | its window "Moxie +2 · 15 Jul", read only with Take me out | b-s1-1c-window, b-s1-ranger-tap-1c(-tap), b-s1-moxie-bell |
| 1d | one Training for Ranger, Hex, Tally (Saber not in it) [A14] | Day, desktop | 3 | PASS | Ranger, Hex (screen), Tally (store): **B1d Day three** Thu 16 Jul · You were added · Saber — one each | — | b-s1-1d-window, b-s1-hex-bell |
| 1e | one Meeting for Ranger, Moxie, Saber [F22, A14] | Day, desktop | 3 | PASS | Ranger, Moxie: **B1e Day meet** Thu 16 Jul · You were added · Saber | Moxie's tap: "Moxie +2 · 16 Jul" | b-s1-1e-window, b-s1-moxie-tap-1e(-tap) |
| P1 | Training for Ranger alone [F21 phone] | List, phone | 1 | PASS | Ranger: **P1 Phone list** Wed 15 Jul · You were added · Saber | its window "Ranger · 15 Jul" | b-s1p-p1-window, b-s1p-ranger-bell(-tap), b-s1p-ranger-tap-p1(-tap) |
| P2 | Meeting for Ranger, Moxie, Saber [F22 phone] | Day, phone | 3 | PASS | Ranger, Moxie: **P2 Phone day** Wed 15 Jul · You were added · Saber, one each; Saber "Nothing new" | Moxie's tap: "Moxie +2 · 15 Jul" | b-s1p-p2-window, b-s1p-moxie-bell(-tap), b-s1p-moxie-tap-p2(-tap), b-s1p-saber-bell(-tap) |
| 2a | Tally's Training; Saber adds Ranger in its window [F23, A15] | List, desktop | 1→2 | PASS | Ranger: **B2a Tally solo** Wed 15 Jul · You were added · Saber. Tally (store): Ranger added · Saber | — | b-s2-2a-opened-list, b-s2-2a-edited, b-s2-ranger-bell |
| 2b | Hex's Training; Ranger added [F23, A15] | Calendar bar | 1→2 | PASS | Ranger: **B2b Hex solo** Thu 16 Jul · You were added · Saber. Hex (screen): Ranger added · Saber | Ranger's tap: "Hex +1 · 16 Jul" | b-s2-2b-opened-bar, b-s2-2b-edited, b-s2-hex-bell, b-s2-ranger-tap-2b(-tap) |
| 2c | Moxie+Hex Meeting; Ranger added [F23, A15] | Day's card | 2→3 | PASS | Ranger: **B2c Mox Hex** Fri 17 Jul · You were added · Saber. Moxie and Hex (screen): Ranger added · Saber | — | b-s2-2c-opened-day, b-s2-2c-edited, b-s2-moxie-bell, b-s2-hex-bell |
| 2d | Hex+Tally; ONE save takes Tally off, adds Ranger and Moxie [A16] | List | 2→3 | PASS | Ranger, Moxie: **B2d Swap** Wed 15 Jul · You were added · Saber. Tally (store): You were taken off · Saber. Hex (screen) ONE line: **Ranger, Moxie added, Tally taken off · Saber**. No newcomer told "X added" | Hex's tap: "Hex +2 · 15 Jul" | b-s2-2d-opened-list, b-s2-2d-edited, b-s2-hex-bell, b-s2-hex-tap-2d(-tap) |
| 2e | Ranger (member) files a Meeting for Tally only; Saber adds Moxie [F24, A21 — Inputs route] | List | 1→2 | PASS | Filing: Tally (store) You were added · Ranger; Ranger nothing. Add: Moxie: **B2e Ranger files** Mon 20 Jul · You were added · Saber; Tally (store) Moxie added · Saber; **Ranger, the filer not in it: Moxie added · Saber** | Ranger's tap: "Moxie +1 · 20 Jul" | b-s2-2e-ranger-window, b-s2-2e-opened-list, b-s2-ranger-bell, b-s2-ranger-tap-2e(-tap) |
| 3a | Ranger files a Meeting for Saber and Moxie [F25, A18] | List, desktop | 2 | PASS | Saber (screen): **B3a Ranger for two** Wed 15 Jul · You were added · Ranger. Moxie the same. Ranger none | Saber's tap: "Moxie +1 · 15 Jul" | b-s3-3a-window, b-s3-saber-bell, b-s3-saber-tap-3a(-tap), b-s3-moxie-bell |
| 3a-P | Ranger files a Personal for Hex and Tally [A18 Personal] | List | 2 | PASS | Hex (screen): **B3a Personal two** Thu 16 Jul · You were added · Ranger; Tally (store) the same; Ranger none | — | b-s3-3a-personal-window, b-s3-hex-bell |
| 3b | Ranger files Training for himself + Hex, later adds Moxie [A19] | List | 2→3 | PASS | Filing: Hex You were added · Ranger (Ranger none). Add: Moxie **B3b Ranger and Hex** Fri 17 Jul · You were added · Ranger; Hex Moxie added · Ranger; Ranger none | — | b-s3-3b-window, b-s3-3b-ranger-adds-moxie, b-s3-moxie-bell, b-s3-hex-bell |
| 3c | Saber's Meeting for Ranger + Hex; Ranger opens it, tries to add Tally [F27, A20] | List | 2 | PASS (refused) | The window opens READ ONLY for him: no Save, "Take me out", "Only Saber — who filed it — or an admin can change this for everyone."; a press on Tally's puck changes nothing (still 2 picked); input unchanged; no line to anyone | — | b-s3-3c-ranger-opens, b-s3-3c-ranger-tries-tally |
| 3d | Ranger tries LL for Saber [A20] | List | 1 | PASS (refused) | With LL picked the person box is fixed to "Ranger" — Saber cannot be chosen; nothing filed for Saber, no line | — | b-s3-3d-ranger-ll-for-saber, b-s3-3d-after-save |
| 4a | Saber files Personal for Ranger + Hex; later adds Moxie [F28, A17] | List | 2→3 | PASS | Ranger, Hex: **B4a Personal** Wed 15 Jul · You were added · Saber; later Moxie You were added · Saber, Ranger and Hex Moxie added · Saber | — | b-s4-4a-window, b-s4-4a-edit, b-s4-ranger-bell, b-s4-hex-bell, b-s4-moxie-bell |
| 4b | Training for ALL AVAIL alone, Wed 15 Jul [F29, A33] | List | placeholder | PASS | No line to anyone (store: 0 new) | — | b-s4-4b-window |
| 4c | Ranger added by name beside ALL AVAIL (4b's input) [A34] | List | ALL AVAIL+1 | PASS | Ranger: **B4b All avail** Wed 15 Jul · You were added · Saber; nobody else (no named man to tell) | Ranger's tap: "Ranger +1 · 15 Jul", "1 picked + ALL AVAIL" | b-s4-4b-edit, b-s4-ranger-tap-4b(-tap) |
| 4d | ALL AVAIL + Moxie named; Ranger added by name [A34] | List | ALL AVAIL+2 | PASS | Filing: Moxie You were added · Saber (nobody behind ALL AVAIL). Add: Ranger **B4d Avail Moxie** Fri 17 Jul · You were added · Saber; Moxie Ranger added · Saber | — | b-s4-4d-window, b-s4-4d-edit, b-s4-moxie-bell |
| 4e | Ranger (member) files a Meeting for ALL, Thu 16 Jul [F29] | List | placeholder | PASS | No line to anyone (store: 0 new); Ranger's bell has none for it | — | b-s4-4e-window, b-s4-ranger-bell |
| 5a | LL for Ranger Mon 20–Tue 21 Jul on the Inputs page [F31, A22] | List | 1 | PASS | Asked "No document — Ranger, LL" (answered No document). Ranger: **LL** Mon 20 Jul · You were added · Saber — ONE line, none from the war | its window "Ranger · 20 Jul → 21 Jul" | b-s5-5a-window, b-s5-5a-asked, b-s5-ranger-bell, b-s5-ranger-tap-5a(-tap) |
| 5b | ATT C for Ranger Wed 15–Thu 16 Jul by "+ Medical" [F30, A22] | Medical tab | 1 | PASS | Window opens on ATT C; asked "No medical document — Ranger, ATT C". Ranger: **ATT C** Wed 15 Jul · You were added · Saber — one line | — | b-s5-5b-window, b-s5-5b-asked, b-s5-ranger-bell |
| 5c-LL | Ranger bids LL on Mon 7 Dec on the Leave War (pending); Saber files LL over it on the Inputs page [F16 Inputs door, A23] | List | 1 | PASS | Ranger: **LL** Mon 7 Dec · You were added · replaces your LL bid · Saber — ONE line, no second from the war (store: `in` + `rbid LL` in one line) | its window "Ranger · 7 Dec" | b-s5-5c-saber-opens-december, b-s5-5c-ranger-bid-window-07, b-s5-5c-ranger-bids, b-s5-5c-ll-window, b-s5-ranger-bell, b-s5-ranger-tap-5c-ll(-tap) |
| 5c-med | Ranger's pending LL bid on Wed 9 Dec; Saber files ATT C over it by "+ Medical" [A23] | Medical tab | 1 | PASS | Ranger: **ATT C** Wed 9 Dec · You were added · replaces your LL bid · Saber — one line | — | b-s5-5c-ranger-bid-window-09, b-s5-5c-med-window, b-s5-ranger-bell |
| 6a | SANS "+ Commitment" for Tally (SANS), Wed 15 Jul [F32, A31] | SANS day | 1 | RECORD | Tally (store): **SANS Availability** 2026-07-15 · You were added (`in`) · Saber. Saber none | not read (no sign-in) | b-s6-6a-day, b-s6-6a-window |
| 6b | SANS "+ Commitment" for Tally + Zulu, Thu 16–Fri 17 Jul [A31] | SANS day | 2, range | RECORD | Tally and Zulu (store): **SANS Availability** 2026-07-16 · You were added · Saber — one line each for the whole run of days, no "X added" | not read | b-s6-6b-range-day, b-s6-6b-range-window |
| 6c | Zulu added to 6a's commitment in its own window [A31] | SANS day's card | 1→2 | RECORD | Zulu (store): You were added · Saber; Tally (store): Zulu added · Saber | — | b-s6-6c-opened |
| 7a | "+ Note" with words, Ranger and Moxie put on it, Wed 15 Jul [F33, A43] | Day | 2 pucks | RECORD | **No line to anyone** (store 0 new); Ranger's and Moxie's bells carry nothing about it | — | b-s7-7a-picker, b-s7-7a-note, b-s7-ranger-bell, b-s7-moxie-bell |
| 7a2 | "+ Note" of people only (Hex) [A43] | Day | 1 puck | RECORD | No line (store 0 new); Hex's bell "Nothing new" | — | b-s7-7a2-note, b-s7-hex-bell |
| 7b | Ranger+Moxie's Training dragged on the month from Wed 15 to Thu 16 Jul [F34] | Month bar drag | 2 | PASS | Ranger, Moxie: **B7b Move** Thu 16 Jul · Now Thu 16 Jul · Saber — never "You were added" (their earlier "You were added" line from the filing stays) | Ranger's tap: "Moxie +1 · 16 Jul" | b-s7-7b-dragging, b-s7-7b-dropped, b-s7-ranger-bell, b-s7-ranger-tap-7b(-tap) |
| 8a | Hex's Training; Saber adds Ranger, then presses Undo before Ranger reads [A38] | List + top bar Undo | 1→2→1 | PASS | Undo's title "Undo — B8a Hex undo for 2 people". After Undo: Ranger's "You were added" and Hex's "Ranger added" are GONE from the store; Ranger's bell has no B8a line; Hex keeps only his own filing line | — | b-s8-8a-after-undo, b-s8-ranger-bell, b-s8-hex-bell |
| 8b | New Meeting for Ranger + Hex, then Undo [A38] | List + Undo | 2 | PASS | After Undo: input gone, both lines gone | — | (store only) |
| 8b-R | …then Redo | Redo | 2 | RECORD | Redo brings the input AND both lines back, unread: Ranger and Hex **B8b Undo new** Thu 16 Jul · You were added · Saber | — | b-s8-ranger-bell, b-s8-hex-bell |
| 9a | Duty for ALL AVAIL on Sat 18 Jul (OIL question) [F29 weekend, A33] | List | placeholder | PASS | Question "OIL: ALL AVAIL, B9a Sat avail … Does it deserve FO…"; no line while up; after Yes · Save no line to anyone | — | b-s9-9a-question |
| 9b | Meeting for Ranger + Moxie on Sat 18 Jul, question answered "Back" [Inputs door of F8/A37] | List | 2 | PASS | No line while up; after Back nothing filed, no line | — | b-s9-9b-question, b-s9-9b-after-back |
| 9c | same, answered Yes · Save | List | 2 | PASS | No line while up; after the answer ONE each: Ranger **B9c Sat yes** Sat 18 Jul · You were added · Saber; Moxie the same | — | b-s9-9c-question, b-s9-ranger-bell |

## FAILs
None.

## Things seen on the way (not ruled; for the host)
1. **WebKit cannot reach this server** — port 4190 is on its restricted list. The phone rows were walked in Chromium at
   402×874 with touch. A WebKit (iPhone engine) look needs another port.
2. **Phone, an opened day covers the bell.** With a day opened on the Inputs calendar on the phone, a tap on the bell is
   caught by the day panel's ✕ (`win-inputsday-x`) — the browser reported the ✕ "intercepts pointer events" over the bell.
   Seen in the run log of `bell190-b-s1p.mjs` (first attempt); NOT pictured. The script then closes the day before reading
   the bell.
3. **A bell line's tap opens the input's window, but the calendar behind stays on today's month** (November 2026, filter
   set to the reader) rather than the input's July — `b-s1-ranger-tap-1c.png`. The window itself is right.
4. **The List opens on today's fortnight (26 Nov → 10 Dec)**, so a July input filed by someone else is not on it until
   "All dates" is picked (`#inRangeAll`) — as built, noted because a walker's route through the List depends on it.
5. **Leave War after an Inputs filing replaced a pending bid:** Ranger's 7 Dec and 9 Dec cells show the new LL / C with an
   amber "!" corner tag (`b-s5-5c-ranger-war-after.png`), and his balance cell reads 9.5 over an amber 10.5. RECORD only.
6. In 6a/6b the commitment window opened with Fly, AMT and OFT all lit; the script pressed "Fly" once, so those commitments
   may hold AMT/OFT only. It does not touch the bell line.

## NOT WALKED (say so, not passed)
- **A23's half-day repeat** (a bid where only one half of the day is affected) — not walked.
- **A43's other two gestures** — adding a person to an existing note by its "+", and moving/swapping a puck between notes —
  not walked; only the two new-note routes (7a, 7a2) were.
- **F32's watch of the SANS man's "nothing filed" reminder (B13)** — not walked; the SANS men have no sign-in.
- **A21's schedule route** (Saber adds through the schedule) — walker A's door; only the Inputs route (2e) walked here.

## Clean-up
Every browser and script I started was closed (each script ends with `b.close()`; the one waiting loop I started was
stopped). No server started or stopped, no checks lock touched, nothing committed, no file under `raptor-port/src` touched.

## WebKit re-run
The host served the same build at `http://localhost:4173/`. The page loads `assets/index-B9okpSpf.js` there, the same
bundle. Engine: Playwright **WebKit**, whose user agent reads `AppleWebKit/605.1.15 … Version/26.5 Safari`. Context: 402×874,
isMobile, hasTouch, deviceScaleFactor 3. Every press was a tap. One fresh context ran the whole re-run. Moxie was made again
on Admin → Users; that step is set up at 1200 wide, then the context goes back to 402.

Script: `scratchpad/bell190-b/bell190-b-sw.mjs`, run with `B_ENGINE=webkit B_URL=http://localhost:4173/ B_SUFFIX=-webkit`.
Log: `scratchpad/bell190-b/sw.log`. Pictures: the same folder, **20 new, every name ending `-webkit.png`**, all from the final
run. An earlier try stopped before its last step: in WebKit, Hex's sign-in clashed with a sign-out that was still loading.
The sign-in now waits and tries once more, and the whole re-run was run again. The folder now holds 136 pictures.

| # | Scenario | Door | Result | What each bell said | Tap opened | Pictures |
|---|---|---|---|---|---|---|
| W1 | "+ Input", Training for Ranger alone, Wed 15 Jul [F21 phone] | List, WebKit phone | PASS | Ranger: **W1 Phone list** Wed 15 Jul · You were added · Saber. The store holds 1 line, to Ranger only | its window "Ranger · 15 Jul" (his own input, so he can edit it) | b-sw-w1-window-webkit, b-sw-ranger-tap-w1-tap-webkit, b-sw-ranger-tap-w1-webkit |
| W2 | one Meeting for Ranger, Moxie, Saber, from a day opened on the calendar [F22 phone] | Day, WebKit phone | PASS | Ranger and Moxie each have ONE line: **W2 Phone day** Wed 15 Jul · You were added · Saber. Saber's bell shows "Nothing new" | — | b-sw-w2-window-webkit, b-sw-moxie-bell(-tap)-webkit, b-sw-saber-bell(-tap)-webkit |
| W3 | Hex's Training; Saber adds Ranger in its own window [F23 phone] | List row, WebKit phone | PASS | Ranger: **W3 Hex solo** Thu 16 Jul · You were added · Saber. Hex (read on screen): Ranger added · Saber | Ranger's tap: "Hex +1 · 16 Jul", read only | b-sw-w3-window-webkit, b-sw-w3-opened-webkit, b-sw-w3-edited-webkit, b-sw-hex-bell(-tap)-webkit, b-sw-ranger-tap-w3(-tap)-webkit |
| Bell | Ranger's bell opened by a tap | top bar, WebKit phone | (part of W1–W3) | Lit with a dot. Three unread lines, newest first: W3, W2, W1. The list is full width under the bar, with "Mark all read" | — | b-sw-ranger-bell-tap-webkit (about 60 ms after the tap; the list is already drawn), b-sw-ranger-bell-webkit (settled) |
| Cover | A day opened on the Inputs calendar stands over the bell | Day panel, WebKit phone | RECORD | With the day open, the day panel's ✕ sits at the bell's middle. The bell is at 354,8 (34×32) and the ✕ at 352,15 (44×44). The panel reaches the top of the screen and hides the whole top bar. A tap on the bell is refused: the browser reports that the ✕ catches the tap. The bell list does not open | — | b-sw-cover-day-open-webkit (the open day, no top bar in sight), b-sw-cover-bell-tap-webkit, b-sw-cover-bell-after-webkit |

On the cover case, for the host: the screen-design rulings keep the top bar pressable over the day-details window (D1645),
and on a phone the Inputs day "opens tall, nearly the full screen" (D683). Neither says whether the opened Inputs day may
cover the top bar. **I record it and do not judge it.** To reach the bell, a phone user must first close the day.

The Chromium findings hold in WebKit: one line per act; no line to the man who made the change; the other people in the
input are told "Ranger added"; and a tap on the line opens the input's own window. WebKit errors caught: none (page errors,
console errors and failed requests).
