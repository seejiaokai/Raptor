# Walk n150 — a squadron he only views, and the ☰ menu's squadron drop-down (D2381–D2384), 23 Nov 26

Build: `Raptor-msq` at 4097cd5ed (`raptor-port/dist` as the host built it, not rebuilt), served by the walk helpers'
`vite preview` on 4478. Fresh demo world for every script; every right given by Saber on Admin → Users with real
presses; no bridge used to change data. Scripts: `raptor-port/scripts/handpass/n150/walk/` (vlib.mjs + one per part).
Pictures: `raptor-port/docs/handpass/2026-11-23-msq-view-only-menu/<script>/`. Raw facts and logs (outside the
checkout): the session scratchpad's `walk150/` (`<script>.json`, `<script>.log`).

Sizes: phone = WebKit 402 × 874, touch, ×2 (a "-justtapped" picture ~60 ms after each tap); desktop = Chromium
1536 × 864; narrow = Chromium 820 × 864.

## Findings (FAIL)

**F1 — On the phone (and at 820 wide) the ☰ menu's squadron list opens out of sight, at the foot of the menu, not under
the mark.** Pressed: ☰, then the TALON mark "142 ▾" (Ranger with View of 149). Showed: the mark takes its pressed look
and nothing else changes on the screen; the list's first row is drawn at 897 px on an 874 px screen (820 wide: 887 on
864). Scrolled down, the two rows sit under Logout at the very bottom of the menu, full width of the panel with no
16 px inset. Should: open directly under the mark, inside the menu, pushing the grey line and MENU down (drawing d2,
d4). Cause seen in the page (the walker's reading, not traced further): the list is `position: absolute; top: 880px` (the small menu's own rule
`.sb-moremenu{position:absolute;top:calc(100% + 6px)}` in 18-oil-board.css wins over the new `.drawer-sqlist
{position:static…}` in 02-shell.css — same weight, later file), so it hangs below the whole panel. A person tapping the
mark sees nothing open. Picks still work once the rows are scrolled to (or reached by the keyboard, which scrolls the
focused row into view). Pictures: `v0/02-list.png` and `v0/02-mark-justtapped.png` (list "open", nothing shown),
`p1/s3-03-menu-scrolled-to-list.png` (where the rows really are), `v0b-n/02-list-open.png`
(820 wide), `p2/s19-01-list-open-unscrolled.png` and `p2/s19-02-scrolled-to-155.png` (eight squadrons), drawing check
`dc1/d2-side-by-side.png`. Probe facts: `v0b-p.log`, `v0b-n.log`.

**F2 — On the phone, a pick made inside ☰ with unsaved Tracker chart edits opens its question UNDER the menu.** Pressed:
Hunter (Plan of 149) adds a test event on 142's Tracker (unsaved), ☰ → mark → 149. Showed: the question "You have unsaved
chart edits on "2026". Save them before switching to 149?" is open but hidden behind the menu panel; each of Stay /
Discard them / Save them has the menu panel on top of it (the menu stands at layer 440, the question at 101); the screen
shows only the menu, its list closed. The person must close the menu by tapping the shade before he can see or answer
it; after the answer the menu is therefore closed, not "☰ remains open with 149's updated access and pages". Should
(scenario 28): the question in front, naming 149, the squadron not yet switched; after a successful phone pick ☰ stays
open with 149's access. The answers themselves are right once reached: Stay kept 142 and the edit; Discard switched to
149 and dropped the edit; Save switched to 149 after saving it to 142. Pictures: `t1-p/s28-01-ask.png` (first sighting:
the menu alone, the question's "Save them" peeking at the right edge), `t2/stay-02-after-shade.png` (the question, seen only after the menu is closed), `t2/discard-03-answered.png`
(149 in view after Discard, 142's Tracker under its note). Facts for every answer: `t2.json`. Facts: `t2.log` ("cover" lines).

## The 28 scenarios

Pictures named here were opened by the walker. "Facts" names the raw read of the drawn elements (the mark, the grey
line, the list rows, the offered pages, the page on, the focus) in the scratchpad's `walk150/<script>.json`; every
step also has its picture in the script's folder.

| # | Verdict | What showed (deciding pictures; facts) |
|---|---|---|
| 1 | PASS | Ranger, desktop: 149 picked → tabs View-only Sched and Help only; bell, Insights, Logout, badge stay. `d1/s1-02-149-topbar.png`; facts `d1` s1-a, s1-b |
| 2 | PASS | Hunter (View 149), desktop: 149 → View-only Sched and Help, no Admin, no waiting badge; 142 → all nine pages back. `d1/s2-02-149-topbar.png`, `d1/s2-03-142-again-topbar.png` |
| 3 | **FAIL (F1)** | The list does not open beneath the mark (out of sight at the menu's foot). The rest holds: after picking 149 the list closes, ☰ stays open, mark "149", line "149 · View only", two pages. `v0/02-list.png`, `p1/s3-03-menu-scrolled-to-list.png`, `p1/s3-04-after-pick-149.png` |
| 4 | PASS (list placement under F1) | Pick 142 in ☰: menu stays open, "142 · Your squadron", seven pages back at once; Inputs closes the menu and opens 142's Inputs. Facts `p1` s4-a, s4-b |
| 5 | PASS | Phone and desktop, 149 picked: Help, View-only Sched, Help each open; 149 stays; still two pages. Facts `p1` s5-a…e, `d1` s5d-a…c |
| 6 | PASS | Osprey (home 149, View of 142), phone: on 149 "149 · Your squadron", seven pages; 142 → "142 · View only", two pages; back to 149 → his pages. `p2/s6-02-after-pick-142.png`; facts `p2` s6-a…c |
| 7 | PASS | Hunter (Plan 149), desktop: list says "149 Full access"; Edit Schedule, Inputs (149's people), Logic, Admin each open on 149; back to 142 "Your squadron". `d1/s7-01-149-list.png`; facts `d1` s7-b-*, s7-c |
| 8 | PASS | Saber, phone: pick 149 in ☰ → menu stays open, "149 · Full access", all nine pages; Admin closes the menu, 149's Admin. Facts `p2` s8-a…c |
| 9 | PASS | Hunter (Plan 149) on 149, badge pressed: "HUNTER · MEMBER", two tabs, list says 149 View only; badge again: Full access and every tab, still 149. `d1/s9-02-member-view-list.png`; facts `d1` s9-a…d |
| 10 | PASS | Saber, phone, member view on 149: "149 · View only", two pages, list 142 Your squadron / 149 View only; admin view again: Full access, all pages. `p2/s10-02-list-member-view.png`; facts `p2` s10-a…e |
| 11 | PASS | Hunter, phone, member view with 149, then 142 in ☰: "142 · Your squadron", seven member pages, no Edit Schedule or Admin until the admin view. Facts `p2` s11-a…c |
| 12 | PASS | Hunter (View 149), 820 wide: admin view and member view both offer only View-only Sched and Help; back in the admin view still "149 · View only". `n1/s12-02-member-view-menu.png`; facts `n1` s12-a…c |
| 13 | PASS | Ranger, one squadron, phone: mark "142" with no ▾ and not a button; tapping it opens nothing; "142 · Your squadron" on both visits. `p1/s13-02-after-tap-mark.png`; facts `p1` s13-a…d |
| 14 | PASS | Hunter, phone: top-bar list and ☰ list both "142 Your squadron / 149 View only", one tick; after picking 149 in ☰ the top-bar list ticks 149. Facts `p2` s14-a, s14-c, s14-d |
| 15 | PASS | 820 wide, keys only: Tab reaches ☰, Enter opens it, Shift+Tab reaches the mark; Enter and Space each open the list with the focus on the ticked row; Down Arrow on the closed mark opens nothing (a note, not a finding: Enter and Space do); Down moves the focus to 149 without switching; Enter switches — list closed, ☰ open, "149", "149 · View only", two pages, the focus ring on the mark. `n3/s15-04-after-select.png`; facts `n3` s15-* |
| 16 | PASS | Ranger, 149, keys: the first Escape closes only the list (focus to the mark, ☰ open); the second closes ☰ (focus to ☰); squadron and page unchanged. `n3/s16-02-after-esc1.png`; facts `n3` s16-b…e |
| 17 | PASS (list placement under F1) | A tap on blank menu space closes only the list; a tap outside closes ☰; 149 and the page unchanged. Facts `p1` s17-a…d |
| 18 | PASS | 149 and "View only" stay; the list starts closed at every reopening. Facts `p1` s18-a…e |
| 19 | **FAIL (F1)** | Saber, eight squadrons: every row readable with the right tick and "Full access" labels, 155 and back to 142 picked, the page behind never scrolled, Account and Logout reachable — but the list opens out of sight below Logout and is found only by scrolling the menu to its foot. `p2/s19-01-list-open-unscrolled.png`, `p2/s19-02-scrolled-to-155.png`; facts `p2` s19-a…e |
| 20 | PASS | Hunter (View 149, Plan 150), phone, without closing ☰: 149 "View only" two pages → 150 "Full access" nine pages → 142 "Your squadron" nine pages. `p2/s20-02-150.png`; facts `p2` s20-a…d |
| 21 | PASS | Hunter (View 149): 1536 two tabs; 820 ☰ two pages; home at 820; 1536 nine tabs; pick at 820, widen: two tabs; no ☰ at 1536, no tabs at 820. `n1/s21-04-1536-after-narrow-pick.png`; facts `n1` s21-a…g |
| 22 | PASS | Ranger, 149: desktop Tab order reaches only View-only Sched and Help among the pages; narrow ☰ order View-only Sched, Help, Logout; Enter opens them; home again restores Inputs … Tracker in both. Facts `d1` s22d-*, `n3` s22n-* |
| 23 | PASS | Hunter in the member view with the list open presses Logout; Ranger (only 142) signs in to a closed menu, no ▾, no role switch; Hunter again starts in the admin view. `p2/s23-04-ranger-menu.png`; facts `p2` s23-a…e |
| 24 | PASS | Saber, Ranger's row, "What each role allows": View × Logic "—", View × View-only Sched "read", the other View cells "—"; the same after closing and reopening; on the phone the table fits (328 px inside 402). `d1/s24d-01-roles-open.png`, `p2/s24p-01-roles-open.png`; facts `d1` s24d-*, `p2` s24p-* |
| 25 | NOT WALKED | Two pages in one browser: Hunter on 149 (page A); Saber signed in on page B (A stayed Hunter). Saber gave Plan, then View: after 3 s page A still read "149 · View only" with two tabs both times — the change does not reach an open page of another sign-in in this build. Not signed out and in. `l1/s25-02-A-after-plan-given.png`; facts `l1` s25-* |
| 26 | NOT WALKED | The same: Ranger's open ☰ (phone) stayed the one-squadron menu after Saber gave View of 149, took it away and gave it again. Facts `l1` s26-* |
| 27 | NOT WALKED | Needs a dated posting across midnight with the clock moved past it, and the live delivery that 25 found absent; not set up through the app's controls in this walk. |
| 28 | Desktop PASS · **Phone FAIL (F2)** | Desktop: the question names 149, the squadron unchanged until answered; Stay kept 142 and the edit; Discard switched, edit gone on 142; Save switched after saving to 142; the loaded Tracker stays 142's under "This is 142's Tracker. Pick 142 to change it. To open 149's, sign out and in." `t1-d/s28-01-ask.png`, `t1-d/s28-03-after-discard.png`; facts `t1-d` s28-*. Phone: F2. |

## The question cases (results, not findings — for his ruling)

- **Picking from a page that disappears** (desktop): Ranger on Inputs, Quals, Logic, Leave War, Tracker, picking 149 →
  149's View-only Sched each time; on Help → stays Help. Hunter (View 149) on Edit Schedule and Admin → 149's View-only
  Sched. As the builder reads it. Facts `d1` q1-*, q1h-*
  (each step pictured in `d1/`). Phone not walked separately.
- **Own-page shortcut while viewing 149** (desktop): Ranger's bell line "Leave War 1 Dec – 31 Dec · Bidding open" pressed
  with 149 picked → 142 back, his Leave War open. A bell line that only records an account change ("Given View of 149")
  opened nothing (plain-user round). `d1/q2r-02-after-line.png`; facts `d1` q2r-*. Not walked: "Check my
  quals", a leave notification, Hunter's waiting-access line.
- **OIL list then 149** (Hunter, desktop): NOT WALKED — the OIL Tracker window covers the whole screen, top bar included,
  so the Schedules button cannot be pressed while it is open (the element on top of it is the window's own). `q1/a-01-oil-142.png`.
- **A Leave War window with typed words, then 149** (Ranger, desktop): NOT WALKED — the bid window's shade covers the
  Schedules button, so the pick cannot be made with the window open (not forced). `d1/q4-01-typed.png` (the typed words
  "walk typed words" in the window).
- **Unsaved home Tracker edits, destination View only** (Hunter, View 149, desktop): no question is asked — the pick
  goes straight to 149's View-only Sched, from the Tracker and from View-only Sched alike; the unsaved edit is still
  there, unsaved, when he picks 142 and opens the Tracker. The scenario writer recommended asking. `t1-d/q5-01-after-pick-149.png`; facts
  `t1-d` q5-*. Bell-shortcut variant not walked.
- **Rights disappear under active work**: NOT WALKED (needs a change to reach an open page — see 25).
- **Undo and Redo landings**: NOT WALKED — the probe's first press was blocked by the OIL window left open by the step
  before it, and it was not re-run in the time.

## Leads, to check (not findings)

- After Discard on the desktop (scenario 28), 149 picked, the Tracker's bar still shows "● unsaved flow edits — hit …"
  while the edit was in fact dropped (gone on return to 142). `t1-d/s28-03-after-discard.png`. Not reproduced or traced.

## Plain-user round (§7.0a)

Ranger (View 149) and Hunter (Plan 149), desktop and phone: each squadron picked and back (142 → 149 → 142); every
offered page opened on each (Ranger on 149: View-only Sched and Help only; Hunter on 149: all nine, each opening on 149);
☰ opened, its list opened and closed by the mark, ☰ closed by the shade; the bell opened and its line pressed (an
access-change line — opens nothing, as it should); Logout. Every press pictured. All as expected except the phone's
list opening out of sight (F1: facts `u1-p` ranger-list-open, hunter-list-open — the first row at 897 px on an 874 px screen). Pictures `u1-d/` (49),
`u1-p/` (132). Facts `u1-d.json`, `u1-p.json`.

## Drawing check (walk-scripts.md §10), phone 402 × 874 ×2

The drawing's record was re-made on this build the drawing's own way: the built head hidden, k5's `addMarkD` (copied
whole) laid in its place in the same state, pictured with k5's own clip. **All five records are pixel-identical to the
approved d1–d5** (0 pixels over 24 levels), so the record is the drawing. Then the build's own head, reached by presses
in the same state, measured part by part (`dc1-drawing.mjs`; table in `dc1-table.json`). Side by side (opened d1, d2, d3, d5; d4 is on file):
`dc1/d1-side-by-side.png` … `dc1/d5-side-by-side.png`.

| State | Part | Check | Drawing | Build |
|---|---|---|---|---|
| d1, d2, d3, d4 | head button | letter spacing | −0.065px | normal — no visible effect (the number and TALON inside measure the same) |
| d5 | head (the mark, one squadron) | box width | 97 | 307 — no fill or edge, no visible effect; every drawn part inside in place |
| d2 | list | place / size | x 16, y 56, w 307 | x 0, y 892, w 339 (off screen) — F1 |
| d2 | rows 1–2 | place / size | x 21, y 61 / 99, w 297 | x 5, y 897 / 935, w 329 — F1 |
| d2 | grey line, MENU, first page, ACCOUNT, Logout | y | 150 / 180 / 198 / 286 / 326 | 52 / 82 / 100 / 188 / 228 (98 px higher: the list no longer pushes them down) — F1 |
| d4 | list, rows 1–8 | place / size | list y 56, rows 61 → 327 step 38, x 21, w 297 | list y 892, rows 897 → 1163, x 5, w 329 — F1 |
| d4 | grey line, MENU, first page, ACCOUNT, Logout | y | 378 / 408 / 426 / 766 / 834 | 52 / 82 / 100 / 440 / 508 (326 px higher) — F1 |
| d1, d3, d5 | every other part | place, size, colour, words | — | within 2 px, same colours and words |

d1 (149, closed), d3 (just after picking 142 in the menu) and d5 (one squadron) match the drawing. d2 and d4 (list open)
differ only through F1.

## Console errors

None in any run (page errors, console errors and failed requests all 0 — every script's log ends "errs 0").

## Walk record

Final runs cited: `d1`, `dc1`, `l1`, `n1` (scenarios 12 and 21 only), `n3`, `p1`, `p2`, `q1`, `t1-d`, `t2`, `u1-d`,
`u1-p` — 391 pictures. Earlier attempts kept apart: `v0`, `v0b-p`, `v0b-n` (the probes that found F1, cited), `n2`
(keyboard route of my own making — Shift+Tab pressed once landed on a page line; superseded by `n3`), `t1-p` (the run
that first saw F2; it then timed out on the hidden buttons; superseded by `t2`), `n1`'s scenarios 15/16/22 (Tab started
inside the page; superseded by `n3`).

Walk: docs/handpass/2026-11-23-msq-view-only-menu/ · 391 pictures · 9 surfaces (top bar desktop, top bar 820, ☰ menu
phone, ☰ menu 820, the Schedules list, the roles table, the Tracker's unsaved-edits question, the Leave War bid window,
the OIL Tracker window) · 28 scenarios (25 walked — 28 on both sizes — and 3 not walked: 25, 26, 27) + 7 question cases (3
walked) + plain-user round on 2 people × 2 sizes · open findings: 2 (F1, F2), 1 lead.
