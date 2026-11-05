# Member / guest walk report (walker, 5 Nov 26) — build c7ddf441b, frozen

Scripts: `raptor-port/scripts/handpass/mg1105-walk-{common,a,b,cd}.mjs` (+ `mg1105-walk-disc.mjs`, a discovery helper).
Pictures: `raptor-port/docs/img/handpass/2026-11-05-member-guest/walk/` — 180 PNG (prefixes Ad/Ap = A desktop/phone, Bd/Bp = B, Cd/Cp = C, Dd/Dp = D; `Bx*` = discovery pictures); per-run text files `results-*.txt`.
Browser errors collected (page errors, console errors, HTTP 4xx): NONE in any run.

| id | size | result | what I saw | writes | pictures |
|---|---|---|---|---|---|
| A0 fixture | both | PASS | admin: Amendments panel shows live "Publish AL1" (1 change on Mon) | n/a | Ad0-admin-alpanel, Ap0 |
| A1 | desktop | PASS (nothing saved) | Panel reads "AMENDMENTS · 1 day with changes to publish · Mon · 1 change · [Publish AL1] · No amendments published yet." After the click NOTHING visible changes: same button, same words, no message, no window, no visible toast; list still "No amendments published yet". (A hidden toast element holds stale words "Monday published and approved" from the admin fixture; not visible in pictures.) | 0 | Ad1-member-editsched, Ad1-member-alpanel, Ad1-publish-settled, Ad1-alpanel-after-publish |
| A1 | phone | RECORDED (not reachable) | On the phone the Amendments panel is display:none for the member (0x0) — no Publish AL1 button exists to tap. The admin sees it on the phone fixture (Ap0). | - | Ap1-member-editsched |
| A2 plan selector | desktop | PASS | Press only paints a focus ring; opens nothing for a member. | 0 | AdA2-plan-selector-* |
| A2 plan selector | phone | RECORDED | Tap: cyan outline on the "Live working copy" pill at instant and settled; nothing opens. | 0 | ApA2-plan-selector-open-instant / -settled |
| A2 "See the 1 change…" | desktop | PASS | Opens a floating "Changes · Monday 13/7" window (tabs New to you 10 / All changes 10 / To go out · AL1 1; day buttons; "Read only — every change and who made it, for everyone to see"). Escape does NOT close it, a click outside does NOT close it; only its own ✕ closes it (then gone, page as before). | 0 | AdA2-see-changes-open-settled / -after-escape / -after-outside / -after-own-close |
| A2 same | phone | PASS | Same: stays after Escape / outside tap; closes only by ✕. Phone window adds "Hide ▾" and "History on: Tap a gold dot on the schedule". | 0 | ApA2-see-changes-* |
| A2 day ⓘ | both | PASS | Opens "Monday · Jul 13 · 4 X 4" pop-up ("✓ Published — APPROVED · 1 unpublished edit · AL VERSIONS COVERING MONDAY: No amendment has touched this day yet · WHAT THIS DAY IS TASKING…"). Closes by Escape, by outside tap (each checked: gone, page as before). Its own ✕ was not separately pressed (already closed by then). | 0 | AdA2-info-approval-*, ApA2-info-approval-* |
| A3 | desktop | PASS, with deviation | No EMPTY seat exists in Monday's flying waves (all filled), so the AIRCREW-panel puck "Comet" was dragged (12 moves) onto an OCCUPIED Monday seat (slot 0.0.0.0.w). Nothing moved, model unchanged. The page scrolled down during the drag. | 0 | AdA3-before / -mid-drag / -after |
| A4 | desktop | RECORDED — odd | Board opened with openScheduler(0). CUR CK was already "dj" (admin fixture) so I picked a different name ("shaft"). A toast "Couldn’t save that — try again" comes up bottom-centre right after the pick; the pill KEEPS showing "shaft" settled and after an extra click on empty space, though nothing was saved. | 0 | AdA4-board, -pill-right-after, -pill-settled, -pill-after-repaint |
| A5 | desktop | PASS (box disabled) | Every "Remarks" box on the board is disabled for a member (no caret). I force-clicked and typed "ZZQ": nothing appears, nothing saved. | 0 | AdA5-typed, -after-blur |
| A6 | desktop | PASS | "✓ Done" closes the board; reopened, Escape closes it; Edit Schedule under it as before. (Earlier run failed only because a Changes window left open from A2 was over it.) | 0 | AdA6-closed-by-done, -closed-by-escape |
| B Sched | both | PASS | Week forward (Jul 20) and back (Jul 13) (phone: via the "Jump to a date" calendar button — the phone has no week buttons). Day ⓘ opens and closes by Escape, outside tap, ✕. | none | Bd1-*, Bp1-* |
| B Inputs | both | PASS | "+ Input" → window, OL, picked Wed 22 Jul 2026, "Add" → a "No document — Ranger, OL" question first; "No document" → saved. Opened it, remarks "walk remark", "Save" → saved. "Delete" → gone at once, "Input deleted". Undo → "Undid: Ranger’s OL" (back). Redo → "Redid: Ranger’s OL" (gone). Top bar names "Undo — Ranger’s OL". The list default range is "Next 2 weeks"; the 22 Jul input shows on the saving screen and via "All dates". | see B1 | Bd2-*, Bd3-*, Bp2-*, Bp3-* |
| B Quals | both | RECORDED | His own row (Ranger): TF cell ticked then unticked — each saved (Undo — "Ranger’s quals"). Management: toast "Only an admin can tick Management", no write. SCHEDULER cell is NOT read-only: my press UNTICKED his own Scheduler tick and it saved (pressed again to restore; saved). Callsign cell not editable (ZZQ does nothing). Initials, flight boxes and CAT select in his row are editable. | see B1 | Bd4-*, Bp4-* |
| B bell | both | RECORDED | Bell opens a list reading "Nothing new" (desktop; phone text empty — see pictures); closes by Escape, outside tap and second tap on the bell. Nothing about his new input in it. | none | BdB2-bell-*, BpB2-bell-* |
| B1 | desktop | RECORDED | 45 writes; keys: raptor:inputs/<id>, raptor:settings/elog:…, raptor:changes/…, raptor:__txn (set/remove), raptor:people/bane. | as listed | n/a |
| B1 | phone | RECORDED | 45 writes, same kinds of keys. | as listed | n/a |
| B2 | both | RECORDED | After the save: Inputs list shows "Ranger · 22 Jul · OL · LATE · till 22 Jul · No document". View-only Sched Wed Jul 22 (DRAFT, "1 change") contains "Ranger" (text search only; I did not open that block in a picture). Bell: "Nothing new". | - | BdB2-inputs-list-with-input, BdB2-sched-wed-*, BpB2-* |
| C1 empty | both | RECORDED | Empty "Request access" stays on the form; a line "Type the callsign or name" appears under the callsign box; nothing saved. | 0 | Cp1-empty-send-*, Cd1-empty-send-* |
| C1 filled | both | PASS | "Your request is with the admins … You asked for access as Walker (WK · Pilot · CAT OCU)… Meanwhile you can look at the schedule, read only." | set raptor:settings/accessreq:rq… (+ changes, __txn) | Cp1-send-*, Cd1-send-* |
| C2 | phone | PASS | Guest page "Waiting for access — view only" has ONE control: Sign out. No week buttons; tapping a puck or a day title opens nothing. REAL touch swipe / long-press NOT done: WebKit here refuses `new Touch(...)` ("Illegal constructor"); only a pointer drag (did not move the strip) and a scripted scroll were tried. 6 s wait. Sign out → in again lands on the guest page. | 0 during guest part; sign-in again: remove talon:reopen-page | Cp2-* |
| C2 | desktop | PASS | Guest page has week buttons Jul 06/13/20/27 (all pressed); no puck exists on the guest page (ground-day text); nothing opens. Sign in again → guest page, now on the Aug weeks (the last-viewed week). | 0; sign-in again: remove talon:reopen-page | Cd2-* |
| C3 | both | PASS | Admin → Users shows exactly one request: "walker-guest asked as Walker · WK · Pilot · CAT OCU · Give access · Refuse". | - | Cp3-admin-users, Cd3-admin-users |
| D1 waiting | both | RECORDED — looks wrong | With storage refusing, "Request access" shows the SAME calm waiting screen ("Your request is with the admins… You'll be able to sign in as soon as an admin approves it"). NO "Not saved" band or any warning, at once or 4 s later. | 2 refused __txn | Dp1-send-refused-*, Dd1-* |
| D1 guest page | both | RECORDED | After "View the schedule" and 6 s: still no "Not saved" warning anywhere (4 refused __txn writes in all). | refused | Dp1-guest-refusing-*, Dd1-guest-refusing-* |
| D2 | both | RECORDED | Sign out and in again (storage still refusing): lands on the guest page (request kept in memory only); remove talon:reopen-page refused. | refused | Dp2-signin-again, Dd2-* |
| D3 | desktop | RECORDED | Reload: "Leave site?" asked once (answered leave). Sign in again → the Request access FORM again: the request is gone; nobody was told. | - | Dd3-after-reload, Dd3-signin-after-reload |
| D3 | phone | NOT WALKED | desktop only per brief | | |

## Not a fault (script mistakes)
- First A run: wrong selectors for the day ⓘ and remarks; a Changes window left open caused a false A6 FAIL; first A4 pick equalled the current value. Fixed; reported results are from the final runs.
- First B run opened and edited Ranger's seeded "LL" input (first list row) instead of my new one; selector fixed.
- Stale hidden toast text from the admin fixture is not on screen.

## Odd things no scenario asked about
1. A member can untick/tick his own "Scheduler" qualification on Quals (saved, undoable as "Ranger’s quals"); Management alone is refused.
2. The Changes window ignores Escape and an outside click (only ✕), unlike the day ⓘ pop-up and the bell.
3. Member's plan-selector press shows a focus ring only.
4. A4 pill keeps the unsaved name while saying "Couldn’t save that".
5. D: an unsaved request leaves the person on a calm "with the admins" screen and in the guest page; after a reload the request silently vanishes.

Pictures: 180.
