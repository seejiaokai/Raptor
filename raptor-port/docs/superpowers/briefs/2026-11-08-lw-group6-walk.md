# The walk of the Leave War group 6 build — the walker's brief (chat 8, 8 Nov 26)

You walk the running app and record what you see; you do not read code for bugs, change app code, commit or push. Work in
the git worktree `C:/Users/User/projects/Raptor/.claude/worktrees/pr-leave-war-4988a8` (branch `claude/pr-leave-war-4988a8`),
every command from its `raptor-port/` folder, and `cd` there by that FULL path inside any backgrounded command.

## Read first
- `raptor-port/docs/walk-scripts.md` whole — how a walk script and its pictures are written, and its traps.
- The drawings you compare against: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/` — `q-morebelow-ph-A-*` (phone)
  and `q-morebelow-pc-A-*` (desktop), and `notes-lw.md` §2(g) (what was measured on 30 Nov: the phone window 577px tall,
  its list 518px, "AWAY · 19", 12 lines whole, 1 cut, 6 below).

## What was built (his rulings, from their full rows)
- **D1788:** the Leave War day panel's "↓ N more" takes the bell's own foot: under the list and outside it, a hairline above
  and small grey words at the left, not pressable, counting the lines not wholly in view, and gone at the list's end.
  On screen: the day window (`[data-testid="win-lwday"]`) gains `[data-testid="lwday-more"]` straight after its scrolling
  body `.win-body`, holding `.bl-more` "↓ N more". The lines counted are `.lwday-away .ll-row`. The bell's list
  (`.bl-foot` with `[data-testid="bell-more"]` and "Mark all read") looks as before; it now uses the same counter.
- **D1789:** the Leave War grid's pinned dates row (`[data-testid="sticky-head"]`) takes the row's place in the same frame
  the row (`#page-leavewar tbody.mxhead`) reaches the top bar's bottom (`.topbar`), on a desktop and a phone; Quals'
  pinned heading (`[data-testid="qsticky-head"]`, over `#qtbl` thead) the same.

## The build and the browser
- Build under the checks lock: `node scripts/gatelock.mjs exec "claude/pr-leave-war-4988a8 — walk build" -- npm run build`
  (if another chat holds the lock, wait and retry every few minutes). Serve: `npx vite preview --port 4395 --strictPort`
  (check the port is free first: `netstat -ano | grep ":4395 "`); stop it at the end BY PORT (PowerShell
  `Get-NetTCPConnection -LocalPort 4395 | % { Stop-Process -Id $_.OwningProcess -Force }`), never by a command pattern.
- Your script: `scripts/handpass/lwg6-walk.mjs`; pictures into `docs/img/handpass/2026-11-08-lw-group6/`. Use the repo's
  browser fallback (`existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}` from `playwright.config.ts`) and the
  sign-in helpers in `scripts/handpass/lib.mjs`. Admin: user `ad`, password `a`; member: `us` / `us` — never print them
  in a picture or the report.
- Sizes: desktop 1536×864; phone 402×874 (isMobile, hasTouch, deviceScaleFactor 3) in Chromium AND WebKit. A finger
  scroll is raw touch events (Chrome's synthesized scroll gesture moves nothing here — see `scripts/handpass/pr-lw.mjs`
  `blinkPhone`).
- Watch console errors, page errors and 4xx responses all the way; list each.
- On a phone take a picture RIGHT AFTER each tap (no wait) as well as the settled one (his D1281).

## The scenarios — record what you MEASURE; where you are unsure what is right, RECORD exactly what it shows
Each count you report is measured, never assumed: for the day window, for every `.lwday-away .ll-row`, its
`getBoundingClientRect().bottom` against `.win-body`'s bottom; "not wholly in view" = bottom > body bottom + 1.

1. **Desktop, a long Away list.** Leave War grid, tap the date heading of Mon 30 Nov 2026 (`[data-testid="head-2026-11-30"]`;
   bring it into view first). Picture the window. Record the Away count, the lines wholly in view, cut, below, and the
   foot's words. EXPECTED: the foot reads "↓ N more", N = cut + below as measured; it is outside `.win-body`, straight
   under it; computed: font-size 12px, a 1px top border; it is not a button, link or focusable (Tab never lands on it); a
   click on it changes nothing (list scroll and window unchanged — picture after).
2. **Part way.** Wheel over the list a few notches; picture straight after; the count again matches the measured lines.
3. **The end.** Scroll the list to its end: the foot is gone, and the list's last line is wholly in view; picture.
   Scroll back to the top: the foot is back with the first count.
4. **A day that fits.** Step with the window's ‹ › to a day whose Away list fits: no foot. Step back: the foot returns
   with the right count. Close by ✕, reopen from another date's heading; close by Escape.
5. **The window resized** (if the window can be resized on a desktop): taller → the count falls to what is measured.
6. **Phone, Chromium and WebKit:** 1 to 4 again by finger (swipe the list, tap ‹ ›), picture right after each tap and
   settled. If the window has two resting heights on a phone, the count at each. Compare with `q-morebelow-ph-A-*`: the
   foot's place, the hairline, the words' size and colour, and its height — name any difference over about 2px with a
   marked picture side by side. The arrow and the words stay on one line, nothing cut (lesson 22: check the words'
   pixels sit inside the foot's box).
7. **Desktop drawing check:** compare scenario 1's foot with `q-morebelow-pc-A-*` the same way.
8. **The bell:** open the bell (top bar) on both sizes; if its list is long enough to scroll, its foot "↓ N more" with
   "Mark all read" matches the measured lines (lines `.bl-line` against `.bl-scroll`); picture. If it does not overflow,
   say so. Press Mark all read; close the bell.
9. **No other window grows a foot:** open the changes window (Edit Schedule's history clock), the ALL AVAIL window (Edit
   Schedule, a seat with ALL AVAIL), an input's own window (Inputs page), the Leave War bid window (tap an empty grid
   cell) and the day's list (a Leave War day holding two entries): record for each whether anything is drawn after its
   `.win-body`; EXPECTED nothing new.
10. **The pinned dates row, desktop:** scroll the page down past the grid's dates row by the mouse wheel in small steps
    (100px), a picture at each step around the moment the row reaches the top bar, then by dragging the page's scroll
    bar, then back up. EXPECTED: in every picture either the real row stands below the top bar or the pinned row stands
    under the bar — never a cut or missing dates row; the pinned dates line up with the grid's columns (measure one date
    cell's left in each, within 2px). Again zoomed out to the smallest (Ctrl+wheel over the grid) and with Rearrange on
    (⚙ → Rearrange the grid).
11. **The pinned dates row, phone (Chromium and WebKit):** a finger push down the page past the dates row, a quick flick
    and a slow drag; pictures right after and settled; pinched out once, then scrolled. RECORD any picture where the
    dates row is cut or missing (the phone's own scroll may still show one such frame — say how many you see; do not
    explain it away).
12. **Quals:** phone and desktop, scroll the page down past the heading row and back up; sideways first, then down; on a
    phone pinched out once, then scrolled. EXPECTED as 10: never a cut or missing heading row; the pinned headings over
    their columns.
13. **The plain-user round (§7.0a):** as an admin, then as the member: open a day window from a date heading, step a few
    days, close by ✕ and by Escape; open the bell and close it; scroll the grid down and up; tap a cell to open the bid
    window and close it; on Quals scroll down and up. Every control that opens or closes something pressed; every other
    place that shows the result looked at (the date ringed while its day window is open; the grid behind the window
    still pressable).

## What to return (short; no file dumps)
A table — scenario, size/browser, PASS / FAIL / RECORDED, the measured numbers, the picture paths — then every error seen,
every difference from the drawings over 2px (with its picture), and anything you could not do and why. Leave the pictures
and the script in place; delete nothing else of the repo.
