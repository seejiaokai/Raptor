# Re-walk n151 — a squadron he only views, and the ☰ menu's squadron list: what the fixes touched (23 Nov 26)

Build: `Raptor-msq` `raptor-port/dist` as the host built it at 20:11 (not rebuilt), served by the walk helpers' `serve()`
on 4478. Fresh demo world for every script; every right given by Saber on Admin → Users with real presses. Pictures:
`raptor-port/docs/handpass/2026-11-23-msq-view-only-menu/rewalk/<script>/` (`MQ_PICS=rewalk`; the first walk's folders
untouched). Raw facts and logs: the session scratchpad's `walk151/` (`<script>.json`, `<script>.log`). New scripts:
`raptor-port/scripts/handpass/n150/walk/r-*.mjs` on `vlib.mjs` and `r-lib.mjs` (a check prints PASS only for the right
behaviour, with the value it judged). Sizes: phone = WebKit 402 × 874 touch ×2 (a "-justtapped" picture ~60 ms after each
tap); "c" = Chromium 402 × 874 touch (a real held finger); narrow = Chromium 820 × 864; desktop = Chromium 1536 × 864.

Where a fix consumed a first-walk script's premise (one press outside the menu now closes only the list, so "close the
menu" takes two; the Tracker question no longer needs the menu closed first), the step was walked again on the new flow
in a copy: `r-dc1-drawing`, `r-p1-ranger-phone`, `r-p2-admins-phone` (menu shut by as many outside presses as it takes),
`r-t2-tracker-phone`, `r-shade` (17, 18 on the new flow). The originals' runs are kept (`dc1`, `p1`, `p2`, `t2`): their
FAILs there are of that shape, not the app's.

## The seven fixes

| Fix | Verdict | Deciding pictures (all opened) |
|---|---|---|
| 1 — the ☰ list opens under the mark, inside the menu | **PASS** | List at y 56 (mark ends 43), first row 61, inset x 16 w 307; grey line 52 → 150, MENU 82 → 180, first page 100 → 198 (each moved 98) — `r-shade-p/p-02-list-open.png`; eight squadrons all in sight without scrolling `r-p2/s19-01-list-open-unscrolled.png`; drawing check d2, d4 match (below) `r-dc1/d2-side-by-side.png`, `r-dc1/d4-side-by-side.png` |
| 2 — a ☰ pick the Tracker asks about closes the menu, question in front | **PASS** | Phone: the menu closed, the question names 149, Stay / Discard them / Save them each reached by a press, 142 still in view; Stay kept 142 and the edit; Discard → 149, edit gone; Save → 149, edit saved on 142 — `r-t2/stay-01-asked.png`, `r-t2/discard-02-answered.png`. Desktop (`t1-d`, the top bar) the same three answers |
| 3 — a Leave War window holds the page | **PASS** (where the switch or pick can be made) | Ranger (View 149) and Hunter (View 149), his own figures window open on 142's Leave War, pick 149: the Leave War stays, the band "This is 142's. You picked 149 — close this to go on.", the window greyed, ✕ and Close live; Close, ✕ and Escape (desktop) each land on 149's View-only Sched with two pages; 142 picked again gives the window back live — `r-war-d/b-ranger-own-02-held.png`, `r-war-p/b-ranger-own-02-held.png`. Hunter (Plan 149), a 149 man's window, switched to the member view: held, ✕ / Escape land on 149's View-only Sched, two pages — `r-war-d/a-person-x-02-after-switch.png` (its band's words: question Q1). With a day's window open (modal, words typed) the switch or pick cannot be made: desktop — its clear shade lies over the badge and the Schedules button (`r-war-d/a-day-x-02-switch-covered.png`); phone — the first tap on ☰ closes the window and opens no menu (`r-war-p/a-day-x-02-menu-justtapped.png`). Not forced |
| 4 — the first press outside closes only the list | **PASS** | Quick tap and a press held ~1 s alike (WebKit by mouse hold, Chromium by a real held finger, 820 by mouse): list closed, menu open; the second press closes the menu; a quick press after a held one is not spared; a blank spot inside the menu closes only the list — `r-shade-p/p-03-after-shade1.png`, `r-shade-c/c-09-hold1-midhold.png`; 24 of 24 checks on each of p, c, n. But see **N1**: a press on a menu line below the open list |
| 5 — Arrow Down / Up opens the ☰ list; Tab out closes it | **PASS** | 820: Arrow Down and Arrow Up each open it with the focus on 149 (ticked); Escape back to the mark; Tab from the last row closes it, focus on View-only Sched, menu open; nothing picked — `r-keys-n/ArrowDown-01-after.png`. (n3 again: Down on the mark now opens it.) The top bar's own list differs: **N4** |
| 6 — an input window left open is held | **PASS for a pick · FAIL for the member-view switch (N3)** | Pick (c2, c3, desktop): band "This is 142's. You picked 149 — close this to go on.", greyed, Save takes no press, through Undo ("Undid: Drifter's OL") and Redo still held; 142 again → live — `r-inputs-d/c2-02-after-pick-149.png`, `r-inputs-d/c3-05-after-undo.png`. Member view (c): **N3** |
| 7 — sign out and in starts clean | **PASS** | Hunter signs out in the member view on 149; Ranger in: 142, his seven pages, ☰ closed, one-squadron head; Hunter again: admin view, 142, nine pages — `r-g-p/g-05-ranger-menu.png` (facts `r-g-d`, `r-g-p`) |

## Findings (FAIL)

**N1 — On the phone, with the ☰ list open, a tap on a menu line below it lands on a different line.** Pressed: Hunter
(Plan of 149, nine pages), ☰, the mark (list open), then "Inputs". Showed: the list closed at the touch, every line
below moved up about 98 points, and the tap landed on the line now under the finger — **Leave War opened**, the menu
closed. WebKit and Chromium touch alike. A tap on Help or Logout with the list open lands on blank space: the list
closes and nothing else happens, so Logout looks dead (the first walk's scenario 23, again in `r-p2`: no sign-out came).
At 820 with a mouse the press only closes the list (no wrong page). Should: either the line pressed works, or only the
list closes — never another line. Consequence: a person who opens the list, then decides on a page, lands on the wrong
page. New with fix 1 (the first walk's list hung at the foot, so nothing moved). Pictures:
`r-under-p/inputs-01-list-open.png`, `r-under-p/inputs-02-press-justtapped.png`, `r-under-p/inputs-03-after.png`,
`r-p2/s23-01-before-logout.png`, `r-p2/s23-02-logout-justtapped.png`. Facts `r-under-p`, `r-under-c`, `r-under-n`.

**N2 — The Tracker's bar still says "unsaved flow edits" after Discard** (the first walk's lead f, now reproduced on
both sizes). Pressed: Hunter (Plan of 149) adds a test event on 142's Tracker, picks 149, "Discard them". Showed: 149 in
view, the event gone (on return to 142 too), but the bar reads "● unsaved flow edits — hit "Save changes"". After "Save
them" the same read finds nothing (the read is calibrated). Should: no unsaved mark once the edits are dropped.
Consequence: he is told there is unsaved work that is gone. Pictures `t1-d/s28-03-after-discard.png`,
`r-t2/discard-02-answered.png`.

**N3 — Fix 6 by the member-view switch: the input window stays but is not held.** Pressed (desktop): Hunter (Plan of
149) on 149's Inputs, "Hunter · 9 Jan" open, the badge to the member view. Showed: 149's View-only Sched, the window
still open with the band "This change could not be saved." but nothing greyed: its Remarks takes typing, Save and Delete
are drawn live and take the press. Neither writes (read back in the admin view: remarks empty; 149's inputs still 5) —
each press only leaves the window and its band as they were. Should (fix 6): greyed, Save refusing, not editable.
Consequence: no harm to data; a person can type and press Save with nothing kept. Pictures
`r-c-verify/c-03-after-save.png`, `r-c-verify/c-04-reopened-admin-view.png`, `r-c-delete/02-after-delete-press.png`.
On the phone the input window covers the top bar, so neither the switch nor a pick can be made with it open (c, c2, c3
NOT WALKED there — `r-inputs-p/c-03-switch-covered.png`).

**N4 — The desktop top bar's list, opened by the keys, leaves the focus on the mark** (not one of the seven fixes —
the list ☰ copies). Enter, Space, Arrow Down and Arrow Up each open "149 ▾"'s list, but the focus stays on the mark (the
code's own note says the row in view takes it, and ☰ does so); Tab then enters the rows and Tab past the last closes it
(right); Shift+Tab from the mark to the page's start leaves the list open with the focus elsewhere. Keyboard only.
Pictures `r-keys2-d/Enter-01.png`, `r-keys-d/ArrowDown-01-after.png`. Facts `r-keys2-d`.

## Scenarios re-run and new

| Scenario | Verdict | Deciding pictures / facts |
|---|---|---|
| Drawing check (dc1 → r-dc1) | PASS | below |
| 3, 4, 13, 17–20 (p1, p2 → r-p1, r-p2; r-shade) | PASS except 23 (N1) | List in sight at 61 in every open (`dListAt`); 19: eight rows, 155 and 142 picked; 20: 149 → 150 → 142; 17, 18 on the new flow `r-shade-p/p-03-after-shade1.png`, `r-shade-p/p-12-reopened.png` |
| 6, 8, 10, 11, 14, 24 (r-p2) | PASS | `r-p2` facts s6-*, s8-*, s10-*, s11-*, s14-*, s24p-* |
| 23 (r-p2) | FAIL — N1 | Logout pressed with the list open: no sign-out |
| 28 + q5 desktop (t1-d) | PASS · N2 | Stay / Discard / Save right; q5: no question, the pick goes to 149's View-only Sched, the unsaved edit still there on return to 142 |
| Tracker question, phone (t2 → r-t2) | PASS · N2 | above |
| 15, 16, 22 (n3) | PASS | Down on the closed mark now opens the list, focus on the ticked row |
| Plain-user round u1, desktop and phone | PASS | every page offered opened on each squadron; list open at 61 on the phone `u1-p` facts ranger-list-open, hunter-list-open |
| a — member view with a Leave War window | PASS (person window) · NOT WALKED (day window: covered, see fix 3) | `r-war-d/a-person-x-03-after-close.png` |
| b — a View holder's pick with a Leave War window | PASS (own window, Ranger and Hunter-View) · NOT WALKED (day window: covered) | `r-war-d/b-ranger-own-02-held.png`, `r-war-d/a-person-x-03-after-close.png` (facts `r-war-d` b-ranger-own-*) |
| a2/b2 — band, Close, slow shade press | PASS (band, Close) · NOT APPLICABLE (held press on a shade: no held window has a shade — the held one is the figures window, which has none; the modal day window cannot be held) | as fix 3 |
| c — member view with an input window | FAIL — N3 (desktop) · NOT WALKED (phone: covered) | |
| c2 — Ranger's pick with an input window | PASS (held, band, Save refuses; after Close, 142, it opens live) · 142 again with the window open: NOT WALKED — the held window's own frame lies over the Schedules button on View-only Sched (Q3) | `r-inputs-d/c2-02-after-pick-149.png`, `r-c-verify/c2-01-held-on-viewsched.png` |
| c3 — held through Undo and Redo | PASS (desktop) · NOT WALKED (phone: covered) | `r-inputs-d/c3-05-after-undo.png`, `r-inputs-d/c3-07-142-again.png` (Redo: facts `r-inputs-d`) |
| d — a bell line about his own page, 149 picked | PASS (desktop and phone) | Saber opened December for bidding (the fresh world gives Ranger no such line); "Leave War 1 Dec – 31 Dec · Bidding open" → 142, his Leave War, his row ringed, no band — `r-d-d/d-04-after-line.png` |
| e — an access request, 149 picked | PASS (desktop and phone) | A new person asked for 142 through the sign-up form; Hunter (View 149) on 149, the lit bell pressed → 142, Admin → Users, "1 waiting for access to 142", Viper waiting — `r-e-d/e-06-landed.png` |
| f — the Tracker bar after Discard | FAIL — N2 | |
| g — sign out and in | PASS | fix 7 |

## Questions (not findings)

- **Q1** — The member-view switch with a window open (Leave War figures window, input window) puts the band "This change
  could not be saved." on it, though nothing was tried. The pick's band says where the window belongs; this one does
  not. `r-war-d/a-person-x-02-after-switch.png`.
- **Q2** — On the phone the first tap on ☰ with a Leave War day window open only closes that window (the menu does not
  open); on the desktop its clear shade covers the badge and the Schedules button. So neither "switch with words typed"
  nor "pick with a bid window open" can be done as the brief pictured them. `r-war-p/a-day-x-02-menu-justtapped.png`.
- **Q3** — A held input window on View-only Sched covers the top bar (desktop), so 142 cannot be picked again with it
  open — only its Close. Fix 6's "picking 142 again gives the window back live" holds where the page stays Inputs (c3).
  `r-c-verify/c2-01-held-on-viewsched.png`.
- For his iPhone only: the menu's own scroll with eight squadrons and the bounce (not judged here).

## Drawing check (walk-scripts.md §10), phone 402 × 874 ×2 — `r-dc1`

Every record pixel-identical to its approved drawing (0 pixels over 24 levels), so the record is the drawing.

| State | Part | Check | Drawing | Build |
|---|---|---|---|---|
| d1, d2, d3, d4 | head button | letter spacing | −0.065px | normal — no visible effect (as the first walk) |
| d5 | head, mark (one squadron) | box width | 97 | 307 — no fill or edge, no visible effect (as the first walk) |
| d1–d5 | every other part | place, size, colour, words | — | within 2 px, same colours and words |

d2 and d4 (list open) now match: the first walk's list at y 892 (off screen) is gone. (The re-run `dc1` itself stopped at
d3 — its outside press now closes only the list; `r-dc1` walks all five.)

## Console errors

None: page errors, console errors and failed requests 0 in all 36 runs.

## Calibration and limits

The new checks' reads were each seen both ways inside the runs (list open / closed; band / none; held parts 0 / 2;
Save reached / inert; the Tracker bar after Discard / after Save). None was run on the first walk's build (no rebuild
allowed). Input windows were opened from the Inputs list only, not from a day's cards on the calendar.

## Walk record

Final runs cited: `r-dc1`, `r-p1`, `r-p2`, `r-shade-p`, `r-shade-c`, `r-shade-n`, `r-keys-n`, `r-keys-d`, `r-keys2-d`,
`r-g-p`, `r-g-d`, `r-t2`, `t1-d`, `n3`, `u1-d`, `u1-p`, `r-war-d`, `r-war-p`, `r-inputs-d`, `r-inputs-p`, `r-c-verify`,
`r-c-delete`, `r-d-d`, `r-d-p`, `r-e-d`, `r-e-p`, `r-under-p`, `r-under-c`, `r-under-n`. Kept apart: `dc1`, `p1`, `p2`,
`t2` (first-walk scripts whose premise a fix consumed), `r-probe` (route reads), `r-war-p-run1` and `r-inputs-d-run1`
(first attempts: a name pressed where the phone does not draw it; a window read that measured 0 — script mistakes).

Walk: docs/handpass/2026-11-23-msq-view-only-menu/rewalk/ · 708 pictures (684 in the final runs) · 11 surfaces (☰ menu
phone, ☰ menu 820, the top bar's Schedules list, the role badge and role line, the Tracker's question and bar, the Leave
War figures window, the Leave War day window, the input window, the bell and its lines, Admin → Users, sign-in) · 7
fixes (6 PASS, fix 6 PASS for a pick and FAIL by the member view) + 28 scenarios' re-runs and 9 new (a–g; c, c3 phone
and the day-window routes not walkable, named) · open findings: 4 (N1 phone wrong page under the open list; N2 Tracker
"unsaved" after Discard; N3 input window not held after the member-view switch; N4 desktop top bar list keeps the focus
on the mark), 3 questions.
