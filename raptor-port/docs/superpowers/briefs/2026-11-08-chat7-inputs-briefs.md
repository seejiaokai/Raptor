# Chat 7 — the Inputs page (D1787, D1792 b): the walker's brief and the readers' brief (8 Nov 26)

Branch `claude/pr-inputs-add-right-5b2653` (pull request 676), worktree
`C:\Users\User\projects\Raptor\.claude\worktrees\pr-inputs-add-right-5b2653`. The change: `git diff origin/main...HEAD -- raptor-port/src`.
The rulings, in full: `grep -h '^| D1787 \|^| D1792 ' .claude/decisions-full/*.md`. The drawings:
`raptor-port/docs/img/handpass/2026-11-07-pictures-round/` (`q-addright-*.png`, `q-r5b-*.png`; notes `notes-sched.md` Q4,
`notes-marks.md` §3 (b)).

## What was built
1. Desktop (821 wide and up): the Inputs **List**'s "+ Input" stands at the right end of its row, after the dates button.
   A phone (820 and below) keeps it first in its top row.
2. While an input's window is open over the desktop list (from "+ Input" or a row's click), from **1340 wide** the list
   stops short of the window and Name / Start / End narrow to 110 / 140 / 90. Below 1340 the window covers the list.
3. With no window, from **821 to 1099** wide, the same three widths (an older fault: Remarks was squeezed to a letter).
4. The Inputs **Calendar**'s expand button (end of the "How this works" row) draws arrows out (compact month) and arrows
   in (every input shown) instead of the typed ⤢ / ⤡; its words and its cyan pressed look unchanged.

## The walker's brief (Sonnet; read `raptor-port/docs/walk-scripts.md` first)
- Build once under the checks lock: `cd raptor-port && node scripts/gatelock.mjs exec "chat7 — walk build" -- npm run build`;
  serve `npx vite preview --port 4378` (check the port is free first); a Playwright script using the repo's browser
  fallback (`playwright.config.ts`); sign in `ad` / `a` (`#luser`, `#lpass`, `#loginForm button[type=submit]`). Watch
  console errors, page errors, 4xx. Pictures at device scale 2 into `raptor-port/docs/img/handpass/2026-11-08-chat7-inputs/`.
- **Widths** 1536×864, 1340×800, 1280×800, 1024×768, 821×768, and a phone 390×844 with touch. At each: Inputs → List.
  (a) the row of "+ Input" and the dates button, pictured; (b) press "+ Input": picture; measure the list's right edge
  against the window's left; the column widths; (c) close it by ✕, by Escape and by Cancel — the list back as before
  each time; (d) open the dates button with the window closed and again with it open — the pop-up opens and closes;
  (e) click a row: its window opens — the same room as (b), pictured; close it.
- **Plain-user round (D1557):** at 1536 file an OL for one person on a day in the list's window through "+ Input" — Add —
  the new row seen whole and ringed; open it again by its row, change its remark, save, see the change; delete it from its
  window. The same filing on the phone. Every control pressed that opens or closes something on the List; Filters opened
  and closed with the window open.
- **Calendar:** Inputs → Calendar at 1536 and the phone: the expand button at rest, pressed, pressed again — a close-up
  at 2× each time and the month after each press (every input shown / "+N more" back).
- **The drawing check (D1424, D1495):** each built picture beside its drawing — `q-addright-pc-list-A.png` (button at the
  right), `q-addright-pc-listopen-A.png` (room made: the build also narrows Name/Start/End at 1536, as the page's safety
  said — Remarks about 346), `q-addright-1024-A-safe.png` (button right, window covering), `q-r5b-*-drawn.png` (the marks).
  List every difference over about 2px in place, size, colour or text alignment.
- **Return:** a table, one row per step: what you did, EXPECTED, what you saw, the picture's file name; every console
  error; every difference from a drawing. Report faults; fix nothing.

## The readers' brief (Astra; a fresh, blind Opus reader — each blind to the other and to the walk)
Read the change and the files around it (`ui/InputsPage.tsx`, `ui/MedicalView.tsx`'s `med-room` for the copied pattern,
`ui/scheduler/06-inputs.css`, `25-inputs-calendar.css`, `ui/glyphs.ts`, `ui/icons.tsx`, `ui/InputsCal.tsx`, the tests
`ui/inputs.test.tsx`, `ui/inputsmonth.test.tsx`, `e2e/inputs-calendar.spec.ts` "D1787"). Ask: **what is missing** — a
state, width, window or page where the button, the room or the narrowing does the wrong thing (a window dragged or resized,
the window opened from the calendar then the List shown, the SANS or Medical tab, a member, the dates pop-up, a phone on its
side 844 wide, a browser zoom, the reduced-motion ring), a test that would pass while the feature is broken, a comment that
says something untrue. Each finding: the concrete failure (inputs → wrong result), its cause in the code, the exact fix.
**Not a finding:** a problem that lives only in data already stored while the code is correct going forward (D56);
style preferences; the rules engine. Write each claim as a failing test before believing it, where one can be written.
