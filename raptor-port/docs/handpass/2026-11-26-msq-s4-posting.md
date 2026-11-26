# Bug check — multi-squadron section 4: the Leave War's posting sheet in way C (26 Nov 26)

Branch `claude/msq-s4-posting-3ba6fa`, pull request 852 into `main`; built by chats 195–196 (Opus). His go: D2732 (with
D2648, D2653, D2659, D2660, D2727 — rows on the batch branch `claude/msq-b1-screens-135`). Coordinator: chat 193.

## The eight answers and the tier
1. Money (OIL, who counts present): NO — what each posting does on its date is unchanged; the posting calls are pinned
   the same (`msq-s4-posting.test.tsx` PT4, PT7; `po.test.tsx`); manning reads the posting as before.
2. The published record: NO — nothing on a schedule day changes.
3. Saved data: NO — the same writers, the same records; no new field.
4. A shared drawer: YES — the one-day bid window (`BidPicker.tsx`) and the drag window (`SelectSheet.tsx`) are shared
   by every leave action; the change hides their leave parts while a posting is open.
5. A new gesture or mode: YES — a removed mode (the grid's placing mode, D2727) and a redesigned control (Undo post out,
   D2660/D2732 Q1); the phone's keep-in-sight scroll now also runs as a posting opens (D1290).
6. A new surface: NO — the same sheets laid out anew.
7. Roles: NO — who may open a posting sheet does not change.
8. The warning list: NO.

**Tier: WALK.**

## The roll-call (§6) — every place the app draws a posting sheet or the removed control
| # | Surface | SHOW | USABLE | PAINTED there too |
|---|---|---|---|---|
| R1 | One-day window → ⋯ → Post out (new posting; `BidPicker` `bid-picker`) | YES — the posting alone, way C's order, at 402 (both engines), 520–1024, 1440, 1536, 2560, the short windows (W-A, W-B, W-D; host r0) | YES — every chip, the date, Post out, every way out (W-B A11, W-A F-S5 by touch) | the Delete card hangs from Post out over the date box (approved drawing); the chosen chip WAS 2px taller in WebKit — fixed red-first (below) |
| R2 | One-day window → ⋯ → Post in (new) | YES — at all seven widths and the desk (W-D, W-C A3) | YES — confirms; every way out closes, nothing posted (W-B A11) | the Post in line "…leave can still be dated there" — true: the drag window and the Inputs page still date leave there (W-C F-S9) |
| R3 | An existing posting's sheet (`PostOutSheet`, `postout-sheet`) — Undo post out | YES — head "Cinch  Post out", "↶ Undo post out" alone, teal arrow, from a low row on the phone lifted above the sheet (W-A F-S1, W-B F-S12) | YES — chips commit, the date moves, Undo post out restores, a refusal above Undo leaves it in place (W-B F-S12, W-C F-S17/F-S18) | no selection mark on the tapped gone day — the same on `main` (filed) |
| R4 | An existing post-in's sheet (`PostInSheet`, `postin-sheet`) — Undo post in; an earlier stint read-only | YES — the current stint's with Undo post in, the earlier stint's "Back from a posting…" with no Undo (W-C F-S17, A3) | YES — date move, Undo post in; a date into the earlier stint refused with its reason (W-C) | — |
| R5 | The drag window → ⋯ → Post out (`SelectSheet`, `select-sheet`) | YES — the posting alone, PO from the range's first day, the range lifted into sight on the phone (W-A F-S2; `main` covered it) | YES — by a finger's hold-and-drag and a mouse drag, Post out and Post in, a refusal keeps the window (W-C A5, W-D) | no way back to the range's leave buttons once a posting — RECORD for him (filed) |
| R6 | The "Delete Cinch?" card from Post out (R1, R5, R3's date move) — "Delete Cinch now?" grey (D2744) | YES — every card's Delete dashed grey as tall as Cancel, "now?" grey hanging from the date box (W-B A2 crops; W-D at every width) | YES — Cancel and Escape restore the saved outcome or date; a quick double press never deletes (W-A F-S4); one tap outside closes card and sheet together — the same on `main` (filed) | the master admin's card offered though the line says he cannot be deleted — the same on `main` (filed) |
| R7 | A tap on a gone day (after a posting-out date / before a post-in) — what opens now that "Place leave or OIL here instead…" is gone (D2727) | YES — the posting sheet alone, no way to leave buttons (W-C A1, W-A F-S1) | YES — Q3 on gone and pre-post-in days: press closes, next opens the posting sheet again (W-C, W-A) | — |
| R8 | A gone day that already holds an entry — opens its entry's window (D1722); a pre-post-in day holding one (D2743) | YES — the same window as on an ordinary day, desk and phone WebKit (W-C A1 / F-S8 / A10) | YES — Delete posting: Auto-approve keeps the leave pending, the reason said once; Overseas and none: approved (the three restored tests' states, by presses) | — |
| R9 | The phone: the day kept in sight above the sheet as a posting opens (D1290) | YES — one-day, existing, post-in and drag windows, both engines (W-A F-S1, F-S2, A4) | YES — Q3's presses land (W-A F-S27) | the grid's last rows cannot scroll far enough — the same on `main` (filed; a look for his iPhone) |
| R10 | Every other place a posting's result shows: the grid's hatch and yellow line, Approvals, Admin → Users' row, the bell, the person window | YES — the plain-user round: every place, word for word as on `main` (W-C A9 / F-S10); the bell one line a run (W-B A17) | YES — reload after each step kept it; Undo post out put every place back (W-C) | Approvals' amber posting words run into the LL box — the same on `main` (filed) |
| R11 | Admin → Users — draws no posting sheet in this build (way C there comes with its batch) | YES — unchanged: identical to `main` pixel for pixel (W-B F-S43) | YES — its own Delete "Tap again to delete Ace", Archive (W-B) | — |
| R12 | A member: never reaches a posting sheet; his own tap on his own day outside his time opens the bid window (kept) | NO-because ruled: no posting control by any door, mouse, keys or drag, desk and phone (W-C A8 / F-S14) | YES — his own gone day opens the bid window, ⋯ Attach alone (W-C) | — |

## The sizing lines (§7.0, the walk ledger)
1. Type of change: E (layout and look of six posting sheets) and C (a removed mode — the grid's placing mode, D2727 —
   and a redesigned control, Undo post out), with a one-line D1290 scroll added as a posting opens on a phone.
2. What only a walk could find here: the sheets as a person reaches them at each size (the bid window grows into a
   posting; the day under it — the phone fault the browser test found on 26 Nov); every way out (✕, Escape, a press on
   the day, a tap outside, Cancel on the card); the doors that reached the states the placing mode used to reach, now
   that it is gone (R7, R8); what lies over the sheet (the date calendar, the card hanging from the button); the
   narrow desktop width just above the phone split, where the chips may change row; a member's face. Already covered:
   the order and layout of a new Post out sheet, the chip rows, the main-button colour, the card's heights, the lone
   Undo and Q3 at two sizes (the browser test); the posting calls and the removed parts (unit tests PT1–PT10).
3. What the ledger says: layout walks (E) found a fault in four of ten, six faults; new controls (C) about half, the
   finds on wide jobs; his own look has found layout faults walks missed — so pictures at every size, each opened.
4. The walk chosen (chat 201, Opus host): four Opus walkers, each in its own worlds on ONE frozen build of this branch
   served inside the test browser (`scripts/handpass/msq/msq-s4w-lib.mjs`), with a frozen build of `main` beside it for
   every "as on `main` today" picture. W-A the phone (402×874 touch, WebKit and Chromium, and the phone sideways
   874×402); W-B the desktop 1440×900 (every way out, every card, the existing sheet's states, the orders, the keyboard,
   leaving and coming back, midnight); W-C the doors and what each posting does elsewhere (gone and pre-post-in days
   holding entries — D1722, D2743 — each outcome run today, the last-admin hold, refusals, Post in, the drag window by
   its real gesture, the member, SANS, deleted men) at 1440 with the key steps on the phone, and the desktop plain-user
   round; W-D the widths (520 / 521 / 700 / 701 / 720 / 760 by touch and mouse, the mid width 1024×768, the short
   window 1440×500, 1536 and 2560 with the grid zoomed out), every kind of person, and what is drawn. About 60
   scenarios from the two lists combined (the group's notes folder, `s4-chat201/walk-plan.md`); what a test carries
   instead is listed under "Cases carried by a test". Beyond the required sizes: the narrow desktop just above the
   phone split and a mid width, because the chips change row there (§7.0). Not on this PC: a real window at 125%
   (lesson 31) and his iPhone's own scrolling and touch (lessons 6, 21, 24) — both named for his look.
5. After the walk: about 770 rows, 1 fault in the change (fixed red-first, re-walked), the older finds filed; its row
   is in `docs/walk-ledger.md` (26 Nov 26).

## The drawing check
**Run 26 Nov 26 by an Opus helper; the host opened `s4-p3-existing.png` (matches, the drawing's teal "new" ring aside).**
Departure from `walk-scripts.md` §10, named: the drawing's saved world (`.tmp/n176-draw/r6-users-state.json`) was no
longer on his PC, so instead of record-and-replay the drawing script's own `lay()` (draw-s4.mjs, batch branch) was
replayed, copied whole, on an `origin/main` build in the demo world (the four posting files were identical there),
checked by eye against every approved picture, then measured beside this build with the drawing check's own measuring
and comparing code. **40 checks — 10 states (greyed-out, delete-grey, existing = design A, existing-in, drag, ground,
sans, none, error, postin) × 4 sizes (1536×864 the drawing's, 1440×900, 402×874 at scale 2 the drawing's, his iPhone
402×874 touch scale 3): no difference over 2px, nor in fill, edge, words colour, size, weight, spacing or alignment; the
sheet's place on screen the same at the drawing's sizes; no page errors.** One difference cleared as measuring: the
"none" state's first chip keeps a phone's left-over hover after the tap that un-chose it (same rule on `main`, an older
question for all chips). World differences only: "archived." for "archived, account suspended." (Cinch has no sign-in
in the demo). A control fed known differences was caught (11, 15, 4). NOT CHECKED: lastadmin (no single-admin squadron
in the demo; its amber line's look is checked through "error"); "error" reached by another route (D2727 removed the
drawing's). Pictures: `docs/img/handpass/2026-11-26-drawcheck-s4/` (40 side-by-sides, `replay/` 20 replay-vs-approved);
the helper's report and scripts: the group's notes folder, `s4-drawcheck/`.

## The scenarios (Astra and a fresh Fable, blind, combined)
Designed by Astra (18, A1–A18) and a fresh Fable (44, F-S1–F-S44), each blind to the other and neither the builder
(chat 196's brief, the group's notes folder `s4-chat196/`). Combined by the host (chat 201) in `s4-chat201/walk-plan.md`:
merged where both asked the same thing, split across the four walkers above, and read against the two rulings that came
after the lists — D2744 ("Delete Cinch now?" takes the dashed grey Delete, so both lists' "left red" is now a FAIL) and
D2743 (a day before a man's post-in that holds an entry opens that entry's window). Six cases are builder's readings, not
his rules (lesson 32), and are RECORDED for him with pictures, never passed: the Post in line "…leave can still be dated
there" (F-S9), a member's own tap on his own gone day (F-S14), the drag window's posting opened by mistake (F-S33), a
brand-new Delete posting dated today (F-S11 d), and typed words when a sheet becomes a posting (A14, F-S16).

## Cases carried by a test
- The new Post out sheet's order and layout, the chip rows, the chosen chip's height, "PO from" half width, the
  main-button colour, the card's dashed Delete as tall as Cancel, the lone "Undo post out" with its teal arrow, Q3's two
  slow presses: `e2e/msq-s4-posting-leavewar.spec.ts`, phone and desktop, through the app's controls. Still opened on
  screen by the walk's own scenarios.
- F-S19's measures beside the drawings: the drawing check (above, 40 of 40), except the ground-crew sheet's two chips
  and the drag window's Post in, which W-D walks.
- What the sheets HOLD (names to a screen reader, the keys landing inside, leftover notes, the member's gone-day window):
  `leavewar/ui/msq-s4-posting.test.tsx`, `msq-s4-reads.test.tsx` — the app's own components without a browser, so they
  prove content, not reachability; every one is pressed on screen as well.

## The orders walked
Walked 26 Nov 26 (chat 201) on the frozen build of `c8001dc68` (`D:/s4w/branch-c8001dc`, bundle `index-BM_udLrk.js`)
beside `main`'s `eea24a984` (`index-B9okpSpf.js`), both served inside the test browser. Four Opus walkers, each in its
own worlds; their full reports (one row a step, every picture named) are in the group's notes folder, `s4-chat201/`
(`report-wa.md` … `report-wd.md`; W-B's and W-D's saved there by the host, their own writes refused).
- **W-A, the phone** (402×874 touch, WebKit and Chromium; 874×402): 195 rows — 130 PASS, 3 FAIL (two findings, both
  the same on `main`), 61 RECORD, 1 NOT REACHED.
- **W-B, the desktop's sheets** (1440×900; WebKit for A16): about 105 rows — about 75 PASS, 0 app FAIL, 21 RECORD, 9 NOT
  REACHED. Every way out of all six faces; every card door; the existing sheet's states; the keyboard; F-S28's ten
  orders, the line before the last press agreeing with the grid, a reopen and Admin → Users; leave and return; two tabs;
  midnight with the clock running (each posting ran once, one bell line); typed words beside `main` (identical).
- **W-C, the doors and what each posting does elsewhere** (1440×900; phone WebKit for the key steps): 176 rows — 74
  PASS, 2 FAIL (both the same on `main`), 93 RECORD, 6 NOT REACHED; and the desktop plain-user round (§7.0a): a posting
  from start to finish, every place that shows it (grid and Legend, Approvals, Balances, Admin → Users, Quals, Inputs,
  the person window, the bell, another period) read word for word against `main`, a reload after each, then Undo post
  out and every place back.
- **W-D, the widths and what is drawn** (520 / 521 / 700 touch; 701 / 720 / 760 / 1024×768 / 1440×500 / 1536 / 2560
  mouse; 402 WebKit): 293 rows — 228 PASS, 6 FAIL rows (two findings: one in the change, one the same on `main`), 51
  RECORD, 8 NOT REACHED; F-S44, the shared stylesheet with no posting open: 18 pairs against `main`, the words identical
  and the pixels apart only where the grid behind lands differently from run to run.
- **The host:** the route first at both sizes and on `main` (r0); each FAIL reproduced on both builds (f1b, a7); the
  one fault in the change fixed red-first and re-walked in WebKit and Chromium (chips).

## The pictures
`docs/img/handpass/2026-11-26-msq-s4-walk/` — `host/`, `wa/`, `wb/`, `wc/`, `wd/`, a sub-folder a run, about 2,200
pictures; each walker's report names the runs it cites and which earlier runs were attempts. The host opened the
deciding ones: the phone's new sheet (host r0/004), the re-walked chips in WebKit (host chips/003), and each FAIL's pair.

## The break tests
The one fault in the change: `e2e/msq-s4-posting-leavewar.spec.ts` "every chip as tall as the tallest, whichever is
chosen and whatever line the fonts give" — WebKit's taller ✓ line injected in Chromium (§7.9); failed before the fix on
the phone, passed after (desktop passes both, one row). The three code reads' proofs (chat 197) stand in
`leavewar/ui/msq-s4-reads.test.tsx`.

## Errors seen
None: no console error, page error or failed request in any walker's run or the host's, on either build.

## What was not walked, and why
- His iPhone's own touch, scrolling and keys (lessons 6, 21, 24): a low row lifted above the sheet, Q3 on it, a quick
  flick then a tap (one tap 60 ms after a flick was swallowed in Chromium), the date box with the keys up — his look.
- A real 125% window on his PC (lesson 31): a scripted walker here cannot start one — his look on his PC.
- WebKit cannot be scrolled, long-pressed or pinched by script: F-S2, F-S3, F-S39, F-S40, F-S27 (e) and A18 walked in
  Chromium only; the sideways phone in WebKit not reached.
- Stopped by the app's restart and the lock others waited on (W-B, W-D, 25 minutes more each): A11's read-only face,
  F-S12 (e) in the next period, F-S28 o6 in part, F-S32's second case, the Delete question across midnight, F-S43's input
  window, A13's last-admin hold and a refused date at the widths between, F-S23's refusal at 1440×500, the day's list
  (F-S44), the disabled Post in (cannot be reached: the date box cannot be emptied, D796).
- W-C, for time: A1's overseas duty filed on the Inputs page itself (filed through the drag window's OD, which lands
  there), F-S7 (h) and (i), the schedule pages in the plain-user round, F-S11's phone half, F-S35's second half, F-S37's
  archived man in an earlier month. Each reaches code this change leaves as it was or a door walked another way above.

## The code reads (Astra, a fresh Opus, a fresh Fable — blind)
Chat 196 ran the three, blind, on the built change (briefs and reports in the group's notes folder, `s4-chat196/`);
chat 197 re-ran every reader's proof on the tip — all reproduced (`s4-chat197/`) — and fixed them red-first: 11 tests in
`leavewar/ui/msq-s4-reads.test.tsx` fail with the fixes out and pass with them (the phone's keep-in-sight for the
existing, post-in and drag windows; the drag window's leftover note; the spoken names; the keys after ⋯ → Post out).
Two questions they raised went to him and came back as D2743 and D2744, built red-first by chat 197. The walk's one fix
(a line of the stylesheet, after the reads) has no reader of its own: re-walked in both engines instead — on the reads
owed list.

## The coordinator's question: the three cut browser tests
R3b, D1541's and R3c-2 were written back by chat 197 through D1722's door (a bid placed before the posting, the gone day
then tapped). They pass on GitHub's run of `c8001dc68` (phone and desktop) and on his PC (26 Nov 26, chat 201: 14 of
14 with the posting sheet's own browser test, both projects). W-C walked the same three states by presses on screen.

## Gate counts
- GitHub's run on `c8001dc68`: every job green (unit, geometry, the Tracker smoke, build, code check, docs guard, secrets
  scan); Vercel refused "Deployment rate limited — retry in 24 hours" (about 18:00, 26 Nov).
- His PC, 26 Nov 26: the three restored tests and `e2e/msq-s4-posting-leavewar.spec.ts`, 14 of 14 (under the checks
  lock); after the fix, `e2e/msq-s4-posting-leavewar.spec.ts` 10 of 10.

## What the walk found, and each disposition
**In the change — 1, fixed red-first:** in WebKit (his iPhone's engine) the chosen chip stood 2 px taller than an
unchosen one alone on its line, so on a phone SANS on the second line was shorter than the two above (W-D FAIL 2). Fixed
in `leavewar/ui/bidpicker.css` (every line of chips as tall as the tallest); its test above; re-walked in WebKit and
Chromium at 402, each chip chosen in turn — one height (host `chips/`).
**The same on `main` — filed `[MSQ-S4-WALK-OLDER]`:** (a) the choices and buttons move when the sheet grows (W-C FAIL 1
and 2, W-D FAIL 1) — a question for him with pictures; (b) a master admin offered "Delete Saber?", then refused (W-C
A7, host a7); (c) one tap outside with the card up closes the card and the sheet (W-A F1, host f1b); (d) the mixed
focus rings and the card's Tab order (W-B); (e) the grid's last rows on a phone staying under the sheet (W-A F2), the
two-tab stale card, the one-frame "PO" after midnight, Approvals' words into the LL box, the WebKit window's gap. Already
filed: the SANS chip offered to a man already SANS (`[SANS-CHIP-ON-SANS]`, D2163).
**Recorded, not faults:** the Post in line "…leave can still be dated there" is true — the drag window and the Inputs
page date leave there (F-S9); a member's own gone day opens the bid window, ⋯ Attach alone (as ruled, D328 — the
contract's line); the existing sheet's card hangs from the chip, the new sheet's from the button (D1628 names both);
F-S28 o9 — an Overseas posting's date moved to today runs it at once, the Delete card backing out first (as on `main`);
the teal ↶ on Undo post out is the top bar's Undo arrow in the app's teal, exactly as Move's ⇄ (D2732 Q1; the drawing
check matched); the drag window turned posting has no way back to the range's leave buttons (no ruling names one —
in the filed item for his word).
**The size looked at again (§7.0):** the one fault in the change is a shared cause of all five sheets' chips (one
stylesheet rule) — the re-walk took the new sheet at 402 in both engines, and the posting sheet's own browser test
runs every chip state on both projects; the older finds do not widen the walk.

Walk: 4 Opus walkers (phone 402 WebKit + Chromium; desktop 1440; doors and outcomes 1440 + phone; widths 520–2560) and
the host, 26 Nov 26, about 770 rows on `c8001dc68` beside `main` — 1 fault in the change (fixed red-first, re-walked),
the older finds filed `[MSQ-S4-WALK-OLDER]`, 0 errors; pictures `docs/img/handpass/2026-11-26-msq-s4-walk/`.
