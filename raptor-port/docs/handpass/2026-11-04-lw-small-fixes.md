# The Leave War small fixes — bug check (4 Nov 26)

Branch `claude/leave-war-small-fixes`, pull request 632. The batch: [LW-PAD-SHOWS-FIGURE] (D1584, D1629, D1630),
[LAZY-PAGE-LOAD-FAIL] (D1631, D1632), [TALON-CLAW-SPOKEN], [LW-ZOOM-E2E-SLOW-RUNNER]; the Leave War's code-check warnings
(D1534) were already 0 (pull request 607). Approved drawings: https://claude.ai/artifact/Q4rDCbkPAhoSwPuohXhDR6 (version 2),
pictures and scripts `docs/img/handpass/2026-11-04-lw-small-fixes-mock/`, `scripts/handpass/lwsf-mock.mjs`, `lwsf-mock-caret.mjs`.

## The eight questions and the tier

1 OIL or who counts — NO: no figure is worked out differently; the pad saves through the same commands as before.
2 The published record — NO. 3 Saved data — NO: nothing new is stored. 4 A shared drawer — YES, narrowly: the claw is one
overlay for two pages, and the catch wraps both. 5 A new gesture or control — YES: Retry; the pad's box (a look, not a
control: a tap on it does nothing). 6 A new surface — YES: the failed-download card; "Still loading…". 7 Roles — NO (the
pad is an admin's, unchanged). 8 The warning list — NO.
**Tier: WALK.** The fresh blind Opus code read is added (D790, D1594): the Retry logic decides between a download and a
reload.

## The roll-call — every place the app draws what this batch touched

| Place | The figure box / highlight / typing line | The failed-download card | "Still loading…" | The spoken claw |
|---|---|---|---|---|
| The pad's top line, a phone held sideways (844 × 390) | HAS (D1584, D1629, D1630) | — | — | — |
| The pad's top line, an upright phone (402, 375, 320 wide) | HAS — the line is wanted whatever the turn (D1584's reading) | — | — | — |
| The cell's own box over the grid, on touch | HAS the highlight only; keeps its thin caret (since D636), hidden while highlighted (D1630) | — | — | — |
| A desktop's box over the cell | MUST NOT — the input itself is typed in and has its own caret (flytype.test) | — | — | — |
| The Required panel for several picked cells | MUST NOT — a sheet with its own box, typed with the phone's keyboard (ReqPanel.tsx) | — | — | — |
| The Leave War page (phone, desktop) | — | HAS (D1631) | HAS (D1632) | HAS |
| The Tracker page (phone, desktop) | — | HAS (D1631) | HAS (D1632) | HAS |
| The desktop's hidden pre-warm of the Leave War | — | MUST NOT show; retried on open (D1631) | MUST NOT (no claw while hidden) | MUST NOT |
| Every other page | — | MUST NOT — drawn at the tap, never downloaded separately | MUST NOT | MUST NOT |
| The start-up claw (index.html #bootclaw) | — | — | MUST NOT — the app's first download is not this catch's | keeps its own label "TALON is loading" |

## The sizing step (D607)

1. **Type of change:** C (a new control, Retry; a new look on the pad that tells what the next key does), B (a new card),
   D, narrowly (the claw and the catch serve two pages, each wired in `Shell.tsx`).
2. **What only a walk could find:** the box in the pad's top line at each phone width, iPhone-wide letters included (does
   ‹ › Done stay put; does it wrap); the highlight and line through a real tap sequence; the cell's caret hidden while
   highlighted; the card on a real refused download in each page, the top bar working past it, Retry both ways (still
   refused; then allowed); the desktop pre-warm failing silent and retrying on open; the "updated app" reload; "Still
   loading…" on a slowed download; the claw's words read from the page; keyboard reach of Retry; the plain-user round of
   opening both pages normally. The unit tests carry: the highlight / line / dash rules (flytype.test.tsx, 5 cases), the
   catch's choices (pageload.test.tsx, 8), the claw's words, busy mark and 8 s line (pageclaw.test.tsx, 4). The browser
   test carries the figure box on a phone with Done unmoved (leavewar.spec.ts, the Required figure test).
3. **The ledger:** C walks found a real fault in 8 of 15; B in 4 of 5 — new surfaces are where walks pay.
4. **The walk chosen:** one Sonnet walker (D588) runs a scripted walk on the built app, Chromium at a phone sideways and
   upright (402, and 375 with letters a seventh wider), a desktop 1440 × 900, and WebKit at the iPhone's size for the pad
   and the card; about 24 scenarios (below), every press pictured, the phone's taps also within 100 ms of the lift (§7.10);
   the host opens every picture that decides something. The drawing check (§7.10, D1495) is run by a second helper on the
   two drawn parts (the pad's box, the card). Repeated digit cases are carried by flytype.test.tsx.
5. **After the walk:** its row in `docs/walk-ledger.md` — added at the end of this sheet's work.

**§7.11's lessons, each against this change:** 1 (one state only) — the box is walked opened, typed, emptied, moved by ›
and reopened; the card both on screen and hidden, before and after Retry. 2 (one speed) — taps in quick succession on the
pad (three keys inside a second). 3 (feedback) — the point of the pad's change; the card's Retry shows the claw while it
tries. 4 (a press behind an open window) — a tap on another Required cell with the pad up. 5 (brought into sight) — the
box checked against the pad's own buttons at every width. 6 (only the real phone draws) — the caret's blink and iPhone
letters: WebKit and the wider letters here; his iPhone look before merge. 7 (a model of the phone) — not applicable: nothing
steers against the phone's own motion. 8 (a fix that reshaped a drawing) — the drawing check. 9 (alignment by eye) — the
box's and the day's middles measured, not looked at.

## Scenarios (the walk's own list)

Written for the walker's brief; results under §Walk below.

- **The pad (S1–S10):** opened on a figure, typed, emptied, moved by › and reopened; three keys inside a second; a tap on
  another Required cell with the pad up; held sideways (844 × 390), upright at 402, 375, 320 and 375 with letters a seventh
  wider; less motion; a desktop click (no pad); WebKit at the iPhone's size.
- **The failed download (F1–F9):** the card on a refused Leave War download at a phone, the top bar working past it, every
  other page one tap away; Retry still refused, then allowed; the desktop pre-warm refused (silent), then opened; the
  Tracker; an updated app; the keyboard; a slowed download ("Still loading…" at 8 s); a member; WebKit.
- **The plain-user round (U1, U2):** both pages opened normally on a phone and a desktop, the day window opened and closed
  three ways, back to a page already drawn.
- **Re-walk only (R0–R7):** the build's file list; Retry still refused (the claw, then the card, no reload, still signed
  in, the keyboard back on Retry); Retry allowed (the files fetched afresh, the reload, everything saved kept, the page
  open by itself after the sign-in — D1635); the desktop's card on open; the Tracker; Enter on Retry; WebKit both ways;
  a member; Retry on a slow signal then Inputs before the files came (no reload under him).

## Walk

**The first walk** (`scripts/handpass/lwsf-walk.mjs` → `parts/lwsf-walk.txt`, 72 pictures `docs/img/handpass/2026-11-04-lw-small-fixes-walk/`):
86 pass, 8 fail. The 8: S7c at 375, 320 and 375-wide-letters — the box drops under the date on a phone under ~400 wide
(not a fault: put to him, D1634 "as built"); F2b, F3b, F5b, F7b, F2w-b — **Retry never downloads again in place**
(Chromium and WebKit keep a failed module file failed): put to him, D1633 "Retry reloads the app".

**Re-walk 1** (plain reload, `parts/lwsf-rewalk-1.txt`, pictures `…-rewalk-1/`): 30 pass, 1 fail — **R5c: in WebKit the
reload never fetched the failed file again**; probes `scripts/handpass/lwsf-webkit-reload-probe.mjs` (the test browser's
own refusal, every way of reloading — only a new tab cleared it) and `lwsf-socket-probe.mjs` (a server of its own hanging
up: 0 requests after the reload; one fetch with the cache skipped first cleared it) → `parts/lwsf-socket-probe.txt`.
Fixed: Retry fetches the page's files afresh from the build's own list (`page-files.json`), then reloads; the card back
if they do not come.
**Re-walk 2** (`parts/lwsf-rewalk-2.txt`): 30 pass, 2 fail — with no signal the claw flashed and the card snapped back
(the press read as nothing). Fixed: the claw held (0.7 s, then a full round, D1636). Re-run: 32 / 0.
**Re-walk 3** (after D1635–D1636, `parts/lwsf-rewalk-3.txt`): 26 pass, 6 stopped — every Retry scenario's sign-in step
waited for the week, which the fix no longer opens (the premise consumed, §5); the script now waits for the top bar.
**Re-walk 4** (`parts/lwsf-rewalk-4.txt`, `…-rewalk-4/`): 39 pass, 0 fail, R7 added. **Re-walk 5** (after the second read's
fixes): 39 / 0. **Re-walk 6** (the final build 85752d7b0, `parts/lwsf-rewalk-6.txt`, 38 pictures `…-rewalk-6/`): **39 pass,
0 fail** — the page open by itself after Retry's reload in every case (Chromium, WebKit, admin, member, the Tracker,
keyboard), no reload once he left the page, everything saved kept.

Walk: docs/handpass/2026-11-04-lw-small-fixes.md · 272 pictures · 5 surfaces (the pad, the card on both pages, the claw and
"Still loading…", the sign-in's reopen, Inputs mid-Retry) · 5 orders (Retry refused then allowed; allowed at once; hidden
then opened; left mid-fetch; by keyboard) · MISSING: none built-side — 2 points his (open 1, 2 below)

## The code reads (D790, D1594 — fresh, blind Opus readers, never the writer)

1. The first read of the batch (before the walk): six findings, fixed red-first in 3c774c1e0; its narrow read: none.
2. The read of Retry (ec86f6b36, 5315f75b1, 4169fa990): **four** — a "Leave site?" answered Stay left the claw stuck and
   the note behind (and iPhone Safari never asks); a file counted as come when its answer only started; the reload fired
   after he had left the page or signed out; two missing tests. All fixed red-first in 4ef914283.
3. The narrow read of 4ef914283: **one** — the 1.5 s "held back" timer fired on a merely slow reload and threw the note
   away. Fixed in a08956e3b (10 s, the note never thrown away by it, its age bounding it).
4. The third and last round (a08956e3b): **two** — a minute too short (it also covers typing the password), and a note
   left by a reload that never happened could open the page at a later sign-in on the same page. Fixed in 85752d7b0
   (ten minutes; never used on the page that wrote it; a date ahead refused). The cap of three rounds is reached: the
   unit tests (58) and re-walk 6 carry what is left.

## The drawing check (D1495) — `docs/img/handpass/2026-11-04-drawcheck-lwsf-rerun/report.md`

The card: 0 differences at the phone, the desktop and the Tracker. 16 kept by his rulings (the box 52 wide and what sits in
it, D1634; the claw's place over "Still loading…", shown on the page v3 and not taken back). **4 open: the pad's day words
2.5px lower than drawn** — to put to him with a picture (D1426).

## The design critique (`/impeccable critique`, `parts/2026-11-04-retry-critique.md`)

23/32. His answers, D1635–D1637, "as recommended": the page reopens after the reload; the keyboard back on Retry with the
app's ring and the claw a full round; his card words kept. All built and walked.

## Findings and dispositions

| Find | Where found | Disposition |
|---|---|---|
| Retry never downloads in place | walk F2b… | D1633: Retry reloads |
| WebKit keeps the file failed across a reload | re-walk 1 R5c, probes | fixed: the files fetched afresh first |
| A reload with no signal would leave "no connection" | the probes' reasoning | fixed: the card back, still signed in (put to him — open 1) |
| The claw flashed, the card snapped back | re-walk 2 R1b, R5x | fixed: the hold, D1636 |
| After the reload he lands on the first page | the critique | D1635, built |
| Focus lost after a failed Retry; the browser's ring | the critique (detector's measures) | D1636, built |
| Stuck claw on Stay; headers-only; left the page; tests | code read 2 | fixed, 4ef914283 |
| Slow reload threw the note away | code read 3 | fixed, a08956e3b |
| A minute too short; a note on a page never replaced | code read 4 | fixed, 85752d7b0 |
| The pad's day words 2.5px lower | drawing check | open 2 — to him |

**His answers (4 Nov 26, "both as recommended"):** D1638 — Retry with no signal keeps the card (narrowing D1633); D1639 —
the pad's date as built (the drawing check re-run GREEN: 20 kept, 0 unexplained). **His iPhone look:** airplane mode on, tap
Leave War (the card), airplane mode off, Retry — the claw, the sign-in, the Leave War opens by itself; VoiceOver reads
"Loading Leave War"; three digits in the pad in Apple's font.
