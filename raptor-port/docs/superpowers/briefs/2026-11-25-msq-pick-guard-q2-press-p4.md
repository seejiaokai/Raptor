# [MSQ-PICK-GUARD] the second questions page — presser P4's report: Undo, the refresh card's edges, a drag, typing left in a box (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-q2-press-brief.md` §P4. An Opus helper; saved whole from its hand-back by the host.

---

# P4 — Undo, the refresh card's edges, a drag, typing left in a box (today's app, 25 Nov 26)

Pressed against http://localhost:4700/, desktop 1536×864 (d) and phone 402×874 (p). Nothing under src changed, nothing committed. Scripts: `raptor-port/scripts/handpass/n175/p4-*.mjs`; deciding pictures (whole + `-crop`, ringed): `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/p4-*`; logs and scratch pictures: `raptor-port/.tmp/n175/p4/` (final run: `final-<script>-<size>.log`, all eight exit 0). Every row comes from a FACT line; I opened the deciding pictures named below.

| Case · size | What he did | What the screen said / did today | His typing / change | Script · picture |
|---|---|---|---|---|
| 1a Undo across squadrons · d, p | Saber: an input's Remarks saved on 142, picked 149, an input saved on 149, "+ New squadron" 150 made (first admin Hunter), then 142, then 150 | One Undo list for all squadrons. On 149 before any 149 step: Undo "Undo — Drifter's OL" (142's). After the 149 step: "Undo — Gannet's Appointment". After 150 made: "Undo — adding a squadron" on 149, 142 and 150 alike. Words appear only as the button's hover text; the button itself reads "↶ Undo" | — | p4-undo · `p4-undoa-{d,p}-1-on149`, `-2-on142` |
| 1b Redo after a change elsewhere · d, p | 142 step, Undo pressed on 142 ("Undid: Drifter's OL"), pick 149, a 149 input saved, back to 142 | Redo "Redo — Drifter's OL" still offered on 149 before and after the 149 change, and back on 142; Undo on 142 then reads "Undo — Gannet's Appointment" (149's step). Undo pressed on 142 moved him to the Inputs page | 142's Redo kept | p4-undo · `p4-undob-{d,p}-1-back142` |
| 1c Undo of "+ New squadron" with it in view · d, p | 150 made, 150 picked, Undo pressed | Toast "Undid: adding a squadron". The bar goes back to 142, the page to Admin; 150 leaves Admin → Squadrons and the list (rows: "142 Your squadron", "149 Full access"). Nothing asked. Redo "Redo — adding a squadron" | — | p4-undo · `p4-undoc-{d,p}-1-on150-before-undo`, `-2-after-undo` |
| 1d The greyed Undo · d, p | A step, then Undo, so nothing is left to undo; read the button; phone: tap, then a 1.3 s hold | Greyed Undo's hover text is just "Undo" (no reason). Phone: Undo and Redo are drawn in the top bar; a tap shows nothing; a long press shows nothing (no toast, menu or note), held or released. On View-only Sched no Undo is drawn | — | p4-undo · `p4-undod-p-1-undo-drawn`, `-2-after-tap`, `-3-long-press-held`; `p4-undod-d-1-undo-drawn` |
| 2a His move at midnight, nothing open · d, p | Hunter on View-only Sched 23:58 → 00:00:30 | Bar 142 → 149; badge "Hunter · Admin" → "Hunter · Member" (phone: ☰ role line gone). No band, card, toast or note. Bell turns lit with an unread dot (it was not before). Same 5 minutes later | — | p4-card · `p4-carda-{d,p}-1-before-midnight`, `-2-after-midnight` |
| 2b Opened two days after his move · d, p | Clock 18 Jul 09:00, signs in | Lands on 149, View-only Sched, "Hunter · Member"; nothing said on screen. His bell holds "Thu 16 Jul Made a member: you moved to 149 now" | — | p4-card · `p4-cardb-{d,p}-1-landed` |
| 2c Posting out (Overseas Sqn) at midnight · d, p | Saber: Leave War, Hunter's 16 Jul cell, ··· → Post out; sheet said "On 16 Jul: archived, account suspended." Post out. Hunter signed in 23:58:30, clock past midnight | The app is replaced by a card: "Your access is suspended · Signed in as ad2 · Ask an admin to enable it when you're back." with one button, "Sign out". No bar, no bell. A reload brings the sign-in card | — | p4-card · `p4-cardc-{d,p}-1-after-midnight` |
| 2c2 Posting out to SANS at midnight · d, p | Same, SANS chip ("On 16 Jul: becomes SANS.") | Nothing changes on screen: still 142, "Hunter · Admin", no note, no bell dot | — | p4-card · `p4-cardc-sans-{d,p}-1-after-midnight` |
| 2d Midnight for a man not moving · d, p | Saber signed in; Hunter's move lands | Nothing: still 142, "Saber · Admin", no band, toast or bell dot | — | p4-card · `p4-cardd-{d,p}-1-after-midnight` |
| 2e Browser reload while "Not saved" · d, p | Failed save (stand-in), the browser's reload: first "Stay", then "Leave" | Band "Not saved — keep this page open" with Retry. Reload: the browser's own leave-page question (no words of the app's). Stay: page and band kept. Leave: sign-in card | The change is in no saved record after leaving, nor after signing in again: lost | p4-card · `p4-carde-{d,p}-1-not-saved`, `-2-after-leave` |
| 2f 149's Tracker failing at every pick · d, p | Tracker page, 149 picked three times (142 between) | Each time: "Couldn't finish upgrading your Tracker data — The Tracker could not finish upgrading your data — the browser did not keep what was written. Reload to try again." No button. 142 between draws its chart | — | p4-card · `p4-cardf-{d,p}-1-pick149`, `-3-pick149` |
| 3 Drag + keys · d | Warden's puck held and moved (button down); Shift+Tab 48 times reaches the picker, Enter, ArrowDown to 149, Enter | Pick goes through: bar 149 while the drag is still held; the dragged puck's image stays at the very top left. Mouse released on 149's board: nothing said, nothing changed on 149's board | 142's seats exactly as before (Warden back in his seat) | p4-drag · `p4-drag-d-1-after-pick-still-holding`, `-2-after-release` |
| 3 Drag + second finger · p | One finger holds Warden's puck past the hold, moves it; a second finger taps the bar's squadron control | Control was free, but the tap opened no list; the drag stays live; no pick. First finger lifted (between seats): "Warden removed" — on 142 | Warden taken off his 142 seat | p4-drag · `p4-drag-p-1-after-pick-still-holding`, `-2-after-release` |
| 4 Help bug box · d, p | Words typed, not sent; pick 149; back | Pick goes through; nothing said | Kept in the box on 149 and on 142; saved nowhere | p4-box · `p4-box-help-{d,p}-1-typed`, `-2-on149` |
| 4 Calendar "+ Note" · d | Inputs → Calendar → 17 Nov window → + Note, words typed; pick 149 | The day window stays open, now showing 149's 17 Nov, the new-note box gone | Saved as a note on **142's** 17 Nov (142's plan record); seen there on return | p4-box · `p4-box-note-d-1-typed`, `-2-on149` |
| 4 Calendar "+ Note" · p | Same | The day window's title strip covers the bar picker and ☰: no pick | Words stay in the box | p4-box · `p4-box-note-p-*` |
| 4 Balances figure · d, p | Reaper's LVE box, "77" typed, not left; pick 149; back | Pick goes through; nothing said | On return the box reads 77; an edit-history line was written at the pick | p4-box · `p4-box-bal-{d,p}-1-typed`, `-2-on149` |
| 4 Day note, caret left in it · d; p (WebKit) | Edit Schedule, words typed after a day's note, caret left; pick 149 | Pick goes through; nothing said | Saved into **142's** week record; shown in 142's note on return, not on 149 | p4-box · `p4-box-sched-{d,p}-1-typed`, `-2-on149` |

## What surprised me
1. Undo and Redo are one list across squadrons: on 142 Undo offers 149's step, and "+ New squadron" is undone from anywhere.
2. Undo of a squadron while it is in view quietly drops him back on 142 and Admin, with only the toast.
3. His own move at midnight changes the bar and his role with no words; the only sign is the bell's dot.
4. A posting out to Overseas Sqn ends his session at midnight with the "access is suspended" card; to SANS nothing visible happens.
5. The calendar's day window survives a pick and re-points to 149's day, while the half-typed note lands on 142's day.
6. A desktop drag survives the pick; its image is left at the top left until the mouse is let go.
7. On a phone a second finger on the free squadron control does nothing while a puck is held.

## Stand-ins
- Midnight (2a, 2c, 2d): page clock installed before midnight and run past it; for 2a/2b/2d his move written as a home row at the sign-in card (mid-e1's way). 2b: clock set to 18 Jul 09:00.
- 2c: clock 23:40 while Saber presses Post out and signs out.
- 2e: browser storage refuses every write (save-d's); the reload is the browser's own.
- 2f: reads of 149's Tracker records refused (trk-e3's), left on.
- 3p: the two fingers sent as Chrome's raw touch events; the phone here is Chromium with touch (chat 166's), except 2a–2d and the 4 day-note phone run, which are WebKit.

## Not pressed, or not fully
- 1a "a third squadron" has no people, so no step was made on 150 itself.
- 1d: no greyed Undo *with a reason* could be raised by presses (today's list is not split by squadron, so the reason D2593 drafts never appears); the greyed button's hover text was read instead. A desktop tooltip cannot be pictured.
- 3: the Tracker ball and Inputs-calendar chip drags (F26 c, d) were not pressed; the phone run's second finger used the bar control, not ☰.
- 4 Calendar "+ Note" on a phone: not reachable (covered).

## Re-run order (each `d` then `402x874`)
p4-undo, p4-card (`ONLY=a,b,c,c2,d,e,f`), p4-drag, p4-box. `p4-lib.mjs` is the helpers; `p4-probe*.mjs` were only for finding controls.
