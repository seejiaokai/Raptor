# r4wf walk report (walker helper, 25 Nov 26)

Builds: BEFORE `D:/rw4/build-new3` ran bundle index-DIr933hk.js on every case; AFTER `D:/rw4/night3/build-fix2` ran index-BZt7HLBD.js (matches build-fix2.txt) on every case. Page errors / console errors: none on either build (facts.json in each run folder).
Pictures: docs/img/handpass/2026-11-25-r4-walk-faults/{n1-main,n1-fix,w1-main,w1-fix}/. Scripts: scripts/handpass/r4wf-note.mjs, r4wf-w1.mjs.

## Walked

**N1 (a) + N3 — the 60-letter note from the week's take-off box** (script r4wf-note.mjs; picture n-<size>-<engine>.png). Measured the drawn letters' right edge against the note's inner edge (inkOf method). Box went back to its stored 12:40 on every run.
| size / engine | BEFORE (main) | AFTER (fix) |
|---|---|---|
| phone 402 Chromium | FAIL: letters to 400px, inner edge 373 (27px over) | PASS: 373 vs 373, 2 lines, note 12px each side |
| phone 402 WebKit | FAIL: 399 vs 373 | PASS: 372 vs 373, 2 lines |
| 320 Chromium | FAIL: letters to 400px, past the 320px screen | PASS: 289 vs 291, 3 lines |
| 320 WebKit | FAIL: 399 vs 291, off screen | PASS: 290 vs 291, 3 lines |
| 621 Chromium | PASS (note 405 wide, widened for the word) | PASS (311 wide, word broken) - RECORD width change, as host expected |
| 768 Chromium | PASS (405 wide) | PASS (384 wide) - RECORD |
| 900 Chromium | PASS (450 wide, 2 lines) | PASS, identical |
| phone on its side 874x402 WebKit | PASS (437 wide) | PASS, identical |
| desktop 1440 | PASS (577 wide, 1 line) | PASS, identical |
Colour of the note dark (rgb 26,31,38) on both; I did not separately confirm the amber accent.

**W1 steps 1-4, desktop Chromium and phone WebKit** (script r4wf-w1.mjs; pictures w1-<size>-<engine>-step1..4.png). Input filed via `fileInput` (Training, Ranger, 08:00-10:00, "Range brief"); the Board reached by `window.openScheduler(2)` (Wed 15 Jul). Each step: typed in the Personal Inputs box, Tab, read the Ground Programme row and the caret.
- BEFORE: step 1 (start 0900) FAIL - Ground row still 08:00 while Personal Inputs and the store say 09:00 (visible in w1-main/w1-desk-chromium-step1.png); step 2 shows 08:00 only because that was the old value; step 3 (end 1130) FAIL - Ground row 10:00; step 4 (remarks) FAIL - Ground row no remark. Caught up only after a click on blank space. Same on phone WebKit. The fault reproduced.
- AFTER: steps 1-4 all PASS on desktop and phone WebKit - the Ground row read 09:00, 08:00, 08:00-11:30, "bring kit" at once; the caret stayed on the Board each time (start -> end -> remarks -> the next input's start box). After reload the input is stored 08:00-11:30 "bring kit" on both builds (PASS).

## NOT WALKED (time on this run; the host should send another walker)
- W1 steps 5-10 (Ground row typed back into Personal Inputs, Done/close, reopen, Inputs page, bell as ad and us, reload of the screen) and the plain-user round's close controls.
- W2 (a)-(e), W3, W4, W5, W6, W7, W8, W9, W10, W11.
- N1 (b)-(f) (the other doors), N2 (ordinary notes measured on both builds), N4 (note position over windows).
- The phone "picture within 100ms of the lift" pairs were not taken; only settled pictures.

## Count
FAIL on AFTER: 0. FAIL on BEFORE (the fault shown): N1 at 402 and 320 in both engines; W1 steps 1, 3, 4 on both sizes.

## Round 2 (after the host's request to go on) — script scripts/handpass/r4wf-secs.mjs, pictures secs-main/, secs-fix/

Sections were counted by the visible top-level panels' headings on the Board (`#sbBoard > .sb-sec` matched nothing on either build, so I used each top-level `.sb-panel`/`.sb-sec` under `#schedBoard`, first heading line).

- **W4, Sat 18 Jul, OIL Earn pressed with the caret in the input's start box** — desk Chromium and phone WebKit, both builds: every section once, same order (OIL EARN, OVERALL NOTES, COMMON PROGRAMME, DUTIES, SIMS, GROUND PROGRAMME, PERSONAL INPUTS, SANS AVAIL, UNAVAILABLE) right after the press, settled, and after the caret left; no doubles, no mixed look (picture desk-chromium-w4-lift.png). BUT the condition was not made: after the press the focus was on the button (desktop) or the page body (WebKit), not the input box — so "caret kept through the press" **could not be made here**. Also the day had ONE flying wave, not two; I did not add a wave. Verdict: RECORD (no doubling seen, but the risky state not reached), same on both builds.
- **W5 (a)** — NOT WALKED: the Undo control timed out on click/tap (4 s) on both builds and both sizes (likely greyed with nothing to undo, as no drag was done first). The drag of Personal Inputs above Ground Programme was not done.
- **W7** — NOT WALKED: the run stopped at W5's error before it (same script block).
- W1 5–10, W2, W3, W5 (b), W6, W8–W11, N1 (b)–(f), N2, N4 — still NOT WALKED.

Errors: none on either build. FAIL on AFTER this round: 0.
