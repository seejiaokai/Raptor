# Walker D — the Tab route, the phone ⋯ menu, H-04 (Codex stack check, 5 Oct 26)

Server http://localhost:4222 (frozen build). Real keys (page.keyboard) throughout; fixtures through the app's own controls (Logic switch, + Wave / + Line / + In-time / Rally, CX with its reason box, the Inputs page form, section grips, sign-off selects, Publish day / Publish AL, version menu). Scripts `raptor-port/scripts/handpass/stk-D-*.mjs`; results `stk-D.json` (parts world1 … world7); pictures `docs/img/handpass/2026-10-05-codex-stack/D/`.

## Table

| Scenario | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| P4c-05 | Week, Mon, formation VL (empty Brief): click Callsign, Tab x11 | Callsign > Mission > Brief > take-off > landing > aircraft-1 Remarks > stores > aircraft-2 Remarks > stores > Area > time > next formation (RU Callsign). No repeats, empty Brief visited, every stop visible, nothing written | PASS | 001-P4c-05-week-brief-empty, 002-… |
| P4c-06 | Board, same formation, Tab x17 then Shift+Tab x17 | Each aircraft row gives Callsign/Mission/Brief/take-off/landing/Remarks/stores (Callsign..landing appear twice), then Area, time; reverse is the exact mirror | PASS | 003, 004 |
| P4c-01 | Board: on aircraft 1 typed KILO / DACT / 12:50 with Tab; Tabbed to aircraft 2; typed LIMA there, Shift+Tab x7 back | Aircraft-2 boxes showed KILO, DACT, blank, 12:50, 14:05 when the caret reached them; LIMA became the shared callsign and both boxes read LIMA | PASS | 005, 006 |
| P4c-02 | Week (wave 1) and Board (wave 2): + In-time/Rally (3 lines); emptied line 1, Tab; edited survivor, Tab; added again, emptied the middle line, Shift+Tab; edited, Tab | Caret landed on the surviving old second line (text intact), 3rd line unchanged; backward: caret on first line, last line unchanged; 2 lines each time | PASS (both) | 007-012 |
| P4c-03 | Saturday, Training 11:00-12:00 filed on Inputs (it landed on Ground by itself). Typed through (a) the Ground row's start/end/Remarks, (b) the Personal Inputs echo boxes, on Board and Week | (b) Board echo and Week input boxes: Tab order start>end>Remarks, saved into the same input, programme row follows, no second input. (a) the programme row's own boxes: the ROW took 10:15 / 11:45 / "PROG ROW TEXT" but the saved input stayed 11:00 / 12:00 / "TAB INPUT" (echo shows the old values); a reload kept the disagreement. Same on Week | FAIL (programme row = schedule-only copy) | 001-P4c-03-board-programme-row, 002-004 |
| P4c-04 | Sunday (+ a flying wave): dragged Ground grip above Flying, Common Programme grip above Duties; Tab all / Shift+Tab all, Board and Week | Order notes, ground, waves, duty, prog, sims; route follows exactly that order (each section's note box inside its section); no write | PASS | 002/003/004-P4c-04 |
| P4c-07 | Saturday, tracking ON, typed DS FOR RU in SC, AVALON, BB remarks; Tab through each wave, Week and Board | Route = exactly the wave's open boxes, no In-time box, no stores/area, no question, no popup. Board draws a VISIBLE Brief box on every SC/AVALON/BB row (week has none) and the route visits it | PASS (note) | 001/002-P4c-07 |
| P4c-08 | Saturday all row kinds + 5 notes: Tab all 212 (Board) / 154 (Week), Shift+Tab back | All in order, section order = on-screen order, no picker/arm, no write | PASS | 006, 007-P4c-08 |
| P4c-09 | Personal Inputs and Available crew folded; Tab whole route | open: 3 echo boxes join; folded: none; folds and popups unchanged, nothing written | PASS | 005, 006, 007-P4c-09 |
| P4c-10 | Typed END in last box, Tab; Shift+Tab from first box, Week and Board | Committed once; no loop, day/page unchanged. Week: caret ends on the page (none); Board: next ordinary control (warning ✕) | PASS | 013-016 |
| P4c-11 | Time, Remarks, reporting line, day note: type + Escape, type + Enter, Tab | Week: Escape restores all four; Enter commits once but the caret leaves (body), next Tab restarts at section start (not next box). Board text boxes: Escape restores and drops caret; Enter drops the caret, next Tab goes to a top-of-section button. Board TIME boxes (take-off, landing, Brief, duty start, ground start): Escape does NOT restore (typed value stays, caret stays) and clicking away SAVES it (1 command) | FAIL | 001-P4c-11-board-time-after-escape |
| P4c-12 | Mon signed + published, Remarks answered Red: Tab all + Shift+Tab all, Board and Week | 214 / 206 boxes in order; no command, no history line, pending 0, bar and four sign-offs identical, no question | PASS | 019-021 |
| P4c-13 | + Line (empty formation) and CX (reason WX) on COBRA; Tab the wave both editors | All 27 boxes of the wave reached, cancelled row and empty formation included, none disabled, CX state unchanged | PASS | 003, 004, 005-P4c-13 |
| P4c-14 | View-only (admin), Board older and latest preview, member; Tab x12, typed QQQ. Published Remarks door on live published day | No editable box anywhere, nothing written. Live published day: focusing Remarks shows "Choose mission role" beside it; Tab goes on to stores, no question. Previews: no role button. Preview Tab stops are SPANs. Admin-as-member not walked | PASS (PARTIAL) | 022-025, 001-P4c-14-live… |
| P4c-15 | Saturday, long wrapped Remarks; Tab all + back at phone week, phone board, phone Desktop layout (panned), 844x390, 1280x700 | Every stop in order; every focused box at least 2/3 exposed (nothing on top); no writes | PASS | 001/002-P4c-15…, 003/004 |
| P4c-16 | After a schedule edit: Tracker + Add picker, ⓘ, event ball; Leave War bid sheet | Picker: focus stays inside for 48 stops, typing zz+Enter added student ZZ (D191), Escape closes. Bid sheet: stays inside, Escape and Enter-on-✕ close it. ⓘ is a toggle, the event brief is a hover tooltip (no dialog). Nothing reached the schedule. Modified/composing Tab NOT WALKED | PASS (PARTIAL) | 001-009-P4c-16 |
| P4d-01 | Admin enabled guest viewing, signed in as new name, request form, guest door | Guest sees the read-only schedule with only "Sign out"; no ⋯ menu, no Insights anywhere | FAIL | 018, 019-P4d-01 |
| P4d-02 | Edit Schedule and View-only at 390 and 320 | ⋯ is the button right after Highlight; menu = one item "Insights", inside the screen; search, calendar, Highlight, ⋯ all topmost at their centre | PASS | 001-004-P4d-02 |
| P4d-03 | Drawer from Inputs, Tracker, Leave War; calendar to Mon 20 Jul on both schedules | Drawer = Menu + Account only; calendar gives week 20/07/2026, Monday at left edge | PASS | 005-007-P4d-03 |
| P4d-04 | Pointer open, tap search; keyboard open, Escape; Insights, close | Tap on search closes the menu and reaches the search; Escape returns the caret to the visible ⋯; Insights text readable; close returns caret to ⋯ | PASS | 008-011 |
| P4d-05 | Open at 820, resize 821, back to 390; calendar; page change; sign out/in as member | 821: menu gone, direct Insights button, no ⋯; back at 390 no old menu; calendar/page change close it. Member: the Edit ⋯ is in the page DOM but visibility:hidden and off-screen (my first check counted DOM; rechecked) | PASS | 012-014, recheck-m/a |
| P4d-06 | Phone Board on Wednesday: More > Insights, close, Done; desktop Board button | Same text (1831 chars) both doors; Board stays on Wednesday; no week-toolbar popup | PASS | 015-017 |
| H-04 | Saturday SDO desk + SXO 06:00-14:00 + VIPER 12:00-13:00, four sign-offs, publish. Tab through Week (25 boxes) and Board (24), Shift+Tab back | Pending 0, ORIG + four sign-offs identical, changes window unchanged, no write, Leave War cells before and after identical: Fable FO*, Warden FO*, Ranger HO*, Echo HO* | PASS | 001-005-H-04 |

## Findings
1. P4c-03: typing in an input-sourced Ground row's start/end/Remarks changes only the row; the input keeps old values and the Personal Inputs echo disagrees; survives reload (001-P4c-03-board-programme-row, 003-P4c-03-week-programme-row). Whether by design is for the host.
2. P4c-11: Board time boxes ignore Escape and commit on blur (take-off, landing, Brief, duty and ground start); Week restores correctly. After Enter on a text/time box the caret is dropped and the next Tab starts at the top of the section (Week) or at a section button (Board), not the next box (001-P4c-11-board-time-after-escape).
3. P4d-01: the guest has no route to Insights (019-P4d-01-guest-app).
4. Observation: Board draws a Brief box on SC/AVALON/BB rows; Tab from the last Personal Inputs echo Remarks ends on the page body.

## Errors
No console errors, page errors or 4xx in any world (world 1, 2, 2b, 2c, 3, 4, 5, 6, 7).

## Not walked
Modified/composing Tab (P4c-16); admin-as-member view (P4c-14); real iPhone behaviour.

## Pictures
111 files in the folder (some are stale from superseded runs: ERR-*, explore*); about 95 belong to the final runs; I opened 31.
