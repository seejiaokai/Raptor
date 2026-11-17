# The calendar wheels move with a mouse drag (D2170) — the bug check's evidence sheet (chat 98, 17 Nov 26)

Branch `claude/cal-wheel-drag-e4107b`, pull request 797. His fault, word for word: "fix all calendars that when i drag and
scroll the months and years, i tried it on a desktop it doesnt work. only mouse scrolling works".

## 1. Tier — WALK
The eight questions: money NO (no OIL, nothing counted); published record NO; saved data NO (a list's scroll position only,
nothing stored); a shared drawer YES (the one wheel in every calendar); a new gesture YES (a mouse drag); a new surface NO;
roles NO; the warning list NO. Something new he will see: NO (the wheels behave as under a finger; no new box, mark or
button) — no mock-up owed (D1625).

## 2. Rulings swept
D2170 (this fault) — PASS on every surface below. D796, D797 (the one calendar, used wherever a date is picked) — the fix
is in the one shared wheel, so every calendar has it. D901 (no Clear, finger-sized dates) — untouched. D1012, D1020
(Escape closes the lists first) — untouched; the wheel's keys still stop at the list. D1562 (the Inputs and SANS titles:
the page follows the wheels as they rest) — PASS (surfaces 3, 4). D830's K4 (Enter in a list goes back to the dates) —
kept, and now on the row in the band during a glide.

## 3. Roll-call — every place the wheels are drawn (SHOW / USABLE by mouse drag / what else is painted)
| # | Surface | Shows | Drag usable | Painted there / host |
|---|---|---|---|---|
| 1 | Admin → Users → Post in (floating calendar) | YES | YES | veil; the drag let go over it closes nothing |
| 2 | Admin → Data → clearing forms (date box and two run calendars) | YES | YES | inline in the form; nothing armed |
| 3 | Inputs calendar title | YES | YES | floating card; the page's month follows |
| 4 | SANS calendar title | YES | YES | the same |
| 5 | An input's own window | YES | YES | a draggable window — did not move |
| 6 | Inputs List date filter | YES | YES | pop-up that closes on a press outside — stayed |
| 7 | OIL question "Only some days…" | YES | YES | question box — stayed |
| 8 | Edit Schedule "Jump to a date" | YES | YES | its window — stayed; the week jumps on a pick |
| 9 | "Every Thursday" From (over two windows) | YES | YES | two draggable windows — did not move |
| 10 | Holidays list calendar | YES | YES | its window — did not move |
| 11 | Leave War open-bidding dates, Post in, Post out | YES | YES | sheets — did not move or close |
| 12 | Medical upchit date in an input's window | YES | YES | the window — stayed |
The Tracker's date boxes are the browser's own (untouched, pinned by the existing test).

## 4. Door check — the gesture in every order
Press without a move → the row clicked is chosen (E). Slow drag, held, let go → whole row, no glide (A, B). Flick → glides,
lands on a whole row (C). Drag let go off the card → nothing closes (D). Wheel → as before (F). After a drag: arrow keys
(test), a click (E), the wheel (F). During a glide: a key, Enter, a mouse press, a finger (tests, from the reads). A press
slid off the list before it moved and let go there (test, from the reads). A phone's finger (H, and test).

## 5. Walk
One Sonnet walker, its script `2026-11-17-cal-wheel-drag/walk.mjs`, desktop 1536 × 864 at 1.25 (his PC's 125%), phone
390 × 844 by touch: 12 surfaces, steps A–G desktop, H and G phone. First walk (the build before the reads' fixes):
144 PASS, 0 FAIL, pictures `2026-11-17-cal-wheel-drag/pics/`, table `results.md`. Re-walk on the fixed build (the host,
the same script): 144 PASS, pictures `2026-11-17-cal-wheel-drag/rewalk/`. No console error, page error or 4xx.
Host opened: `rewalk/09-every-from-A-year-drag-desk.png` (November 2029 in the band after a three-row drag from 2026, the
card whole) and the walker's three named in its report. Not a fault, tuned: a hard scripted flick carried the years 13
to 39 on; the glide's speed is now capped (about a dozen rows at most) — to judge by feel on his look.

## 6. Code reads (blind, the same brief; `superpowers/briefs/2026-11-17-cal-wheel-drag-coderead-*.md`)
Astra: 3 findings; the fresh Opus reader: 3 (two the same as Astra's). All four fixed, each with a test in
`e2e/datecal.spec.ts`: (1) a press let go off the list before it moved left the list following a bare mouse; (2) a key or
Enter during a glide acted on the row before the flick; (3) a finger or pen did not stop a mouse glide; (4) a mouse press
during a glide jumped up to half a row. Red first: (1) and (2) failed on `9ddd97738`'s wheel, pass now; (3) and (4) were
reproduced by the readers' own tests (the Opus reader's in jsdom and a bare Chromium page) and are pinned by the new
test's parts 2b and 3. Fix round: the fix commit's narrow read (§5 "A fix is new code") — OWED, see `HANDOFF.md`.

## 7. Gates
His PC: `e2e/datecal.spec.ts` 23 tests × 2 runs, 46 pass; calendar unit tests 240 pass; tsc; code check no new finding;
docsize OK. GitHub's run of the pull request: green on `9ddd97738`; on the last pushed commit — see the closing report.

Walk: WALK — 12 surfaces × desktop (125%) and phone, 144 PASS, re-walk 144 PASS after the reads' fixes, 288 pictures.
