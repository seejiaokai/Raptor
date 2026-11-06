# Walker brief — the Leave War's older faults (6 Nov 26), one Sonnet 5.5 walker

You walk the BUILT app (already built: `raptor-port/dist` is the fixed build, `raptor-port/dist-before` is `main` without the
double-tap fix) in a scripted real browser, press real controls, take pictures, and write what the screen showed. You never
change the app's code, never build, never commit, never push. Work in `C:\Users\User\projects\Raptor\raptor-port` (run every
command from there — a backgrounded command starts elsewhere: `cd` into it by its full path inside the command).

**Read first:** `raptor-port/docs/walk-scripts.md` (how a walk script and its pictures are written, the traps — §2, §3, §4,
§5 are binding). **Machine traps:** write every script with the file-writing tool and run it from the file, never inline in
the shell (backslashes and apostrophes are lost); never rewrite a script and run it in one step; print a version line at the
top of every run. No `jq` on this PC.

**The recipe (passing, run by the host):** `scripts/handpass/lw-f1106-host.mjs` — it imports `./lw-fx1031-lib.mjs` (which
re-exports `lw-rr-lib.mjs` and `lw-sf-lib.mjs`): `L.newWorld('desk'|'phone')` (desk = Chromium 1536 × 730 at 1.25; phone =
WebKit 402 × 874, touch, iPhone's user agent), `L.signInSaved(w, 'admin'|'member')` (admin `ad`/`a`, Saber; member `us`/`us`,
Ranger), `L.toWar`, `L.openGrid`, `L.pidOf(page, 'Drifter')`, `L.openCell(w, pid, iso)`, `L.autoApprove(w, false)`,
`L.placeLeave`, `L.centre(page, sel)`, `L.finger(w, x, y, quickPictureName)` (a finger on a phone with a picture ~100 ms after
the lift — D1281; a mouse click on a desktop), `L.press`, `L.shot`, `L.rowShot`, `L.cellWords`, `L.closeWin`, `L.dragCells`,
`L.postOutOn`, `L.toApprovals`, `L.apprRead`, `L.undo`, `L.redo`, `L.closeBrowser`; `L.newCtx(size, 'chromium')` gives a phone
in Chromium with real touch (`w.cdp`). Read those helper files for the rest. The browser's clock starts Wed 4 Nov 26 09:00
(Singapore) and runs; `L.day(n)` is a date n days on. The build is served inside the browser — no port, no server.
Set `process.env.LW_OUT ||= '2026-11-06-lw-faults/walk'` (or `…/walk-before` for a `dist-before` run, with `LW_DIST=dist-before`)
BEFORE `await import('./lw-fx1031-lib.mjs')`. Name your scripts `scripts/handpass/lw-f1106-w<n>.mjs` (check the name is free).

**Each scenario: an EXPECTED line, a PASS / FAIL with what you read, the pictures named.** A step that could not act is NOT
WALKED with the reason, never FAIL. Stop a gesture after three failed attempts and report it. Pictures: one per assertion
that matters, plus the quick picture after every phone tap.

## The change (what is under test)

- **(d)** For 450 ms after the Leave War's one-day bid window or drag window closes, a finger's tap on the grid (touch or
  pen), or a click the browser counts as a double click, is swallowed — so a double tap on a leave button no longer opens
  what was under the button. A mouse's single click, a keyboard's press, a press on the top bar / month strip / tabs, and
  any tap after the moment still go through.
- **(f)** After a refused Leave War change the war keeps the role in force (an admin in the member view stays in the member
  view; before, the war could go back to an admin's controls under a "MEMBER" badge).
- **(a), (g)** fixes already live since 25 Oct 26, looked at again.

## Scenarios

**S1 (a) — words go to the bid they were typed for.** Admin, Drifter, a free day `L.day(16)` (switch Auto-approve OFF).
Open the day; press AM; type "Am" in Remarks; place LL. Reopen the day: it opens on the free afternoon (PM) — EXPECTED: the
Remarks box is EMPTY (the new bid's), not "Am". Type "Pm"; place OL. EXPECTED: the morning bid's words are "Am" and the
afternoon's "Pm" (open each half / the day's list to read them; read the box's `value`, not innerText). Desktop and phone.
Also measure, on one picture of the open bid window, that the Remarks box, the till tick and Document stand on one line, one
height (lesson 23).

**S2 (d) — a double tap on a leave button.** Admin, Auto-approve OFF, Drifter on `L.day(9)` (or any free day). Open the day,
then tap LL and tap again at the same point after a gap. Phone WebKit: gaps of ~120, ~170, ~400 ms — EXPECTED for each: the
leave placed once (one pending LL), and after the second tap NOTHING open (no bid window, no person window `person-window`,
no `.qualpop`, no drag window). Gap ~700 ms: EXPECTED the second tap does what a tap there does (opens what is under it) — a
tap after the moment is not eaten. Repeat ~170 ms in a Chromium phone (`L.newCtx('phone','chromium')`, real touch).
Desktop: `page.mouse.dblclick` on LL — EXPECTED the leave placed once, nothing opened. Desktop: one click on LL, then ~200 ms
later ONE single click (`page.mouse.click`) on another day's cell — EXPECTED that day's window opens (a mouse's quick next
click is not eaten). Run the ~170 ms phone case and the desktop dblclick ALSO on `dist-before` (`LW_DIST=dist-before`,
`LW_OUT=…/walk-before`) — EXPECTED there: something opens (the fault). Record what the second tap landed on each time
(`document.elementFromPoint` at the point, just before it).
Where the second tap can land, aim it once each on the phone (move the first tap's window so the button sits over it, or tap
at the button's point after scrolling so that point holds): a day cell, a man's name (his figures), a CAT chip (the quals
pop-up) — EXPECTED nothing opens within the moment.

**S3 (d) — the drag window.** Admin, Auto-approve OFF. Drag over three free days of one man (`L.dragCells`); in the drag
window tap LL and tap again at its point ~170 ms later (phone) / double click (desktop). EXPECTED: the three bids written once,
nothing opened behind. Then a fill over a block that holds a day already holding leave: EXPECTED the window STAYS with its
"1 written. 1 skipped…" note, and a second tap on LL inside the still-open window behaves as the window's own button does
(the guard is not armed while it is open).

**S4 (d) — ways out, and presses not eaten.** (a) Phone: the bid window's ✕ tapped twice ~170 ms apart — EXPECTED the window
closes and nothing opens behind. (b) With the bid window OPEN, tap another day on the grid (the window leaves the page working,
D641) — EXPECTED that day's window opens (nothing eaten while the window is up). (c) Phone: open the day panel (the day's figures
window, `win-lwday` — find its opener in `e2e/leavewar.spec.ts`), tap its ✕ twice ~170 ms apart — RECORD what the second tap
reaches (this window is not guarded; we want to know). (d) Desktop: Escape closes the bid window, then within ~200 ms one
mouse click on a day — EXPECTED it opens. (e) Phone: right after a leave is placed (window closed), tap a month button on the
strip within ~200 ms — EXPECTED the grid moves to that month (the strip is never eaten).

**S5 (f) — the member view after a refused change.** Admin. On Saber's OWN row (`stiff`), on a day the war holds, place OL with
Auto-approve OFF, then Refuse it (its window's Refuse). Then tap his name badge in the top bar (the admin's member view, D292:
"SABER · ADMIN" → "SABER · MEMBER"; on a phone the drawer's switch). As the member view, tap that day: if the day is closed
for a member (the war shows "Bidding closed"), his tap opens the closed-day window with a Remarks box (D1354) — type words
there and leave the box. EXPECTED on `dist`: the words are not kept (the war refuses a member's words on a closed day) AND the
war still draws the MEMBER view — no Approvals tab, no admin's ⚙ / Auto-approve, the badge MEMBER. Do the same on
`dist-before`, where the war may come back as an admin's under the MEMBER badge (the fault). If you cannot find a route that
makes the war refuse a change in the member view, say NOT REACHED with every route you tried. Switch back to admin after.

**S6 (g) — the bubble above a resting day panel (phone).** Open the day panel so it rests at the screen's foot; scroll the
grid so the Manning button is out of view; place a bid that turns a Manning or Available row amber or red (on a day where a
row is already near its line — Available P on a busy December day, as the night of 25 Oct 26 did; `L.day` around 41–45).
EXPECTED: the note at the foot stands just ABOVE the panel's top, wholly in sight, never under it. Picture it.

**S7 (c) — pictures for a question to him (record only, no PASS / FAIL).** Admin. Post out a man (pick one with no leave
in late December — e.g. Diesel) as Overseas Sqn from 29 Dec (`L.postOutOn`, outcome `overseas`). Then (i) drag over HIS
28–30 Dec, choose OD from the drag window's ⋯ (or row) — picture the window before the press, then his row after: today the
grid shows OD on the 28th and PO on the 29th and 30th; (ii) open the Inputs page and picture the OD's entry (it covers 28–30
Dec); (iii) on ANOTHER man posted out the same way, drag LL over his 28–30 Dec: picture the row (pending LL boxes on the PO
days). Desktop and phone.

**S8 — the plain-user round (D1557).** Admin, desktop then phone: tap a free day, place LL with Auto-approve ON (the
default) — picture what tells him it landed; tap it again, close the window by ✕; again by Escape (desktop); again by a tap
outside it; drag three days, fill OL, close the drag window; press the top bar's Undo once and Redo once — picture each; then
look at every other place the result should show: the Approvals tab (the OL bids pending), the bell, My leave (the person
window), and the Inputs page (the approved LL's entry). Errors: report every console error and failed request the helpers
collect (`w.errs`).

## Your report

Write it to `raptor-port/docs/handpass/parts/lw1106/walker.md` — one table: scenario · size/engine · what was done · what the
screen showed (the values you read) · EXPECTED met? PASS / FAIL / RECORD / NOT WALKED · pictures. Then a list of anything
else you saw that looked wrong (with its picture). Keep pictures under `raptor-port/docs/img/handpass/2026-11-06-lw-faults/`.
Send your hand-back ONCE, after stopping every script and browser you started: a short summary — counts of PASS / FAIL, each
FAIL in one line, the report's path.
