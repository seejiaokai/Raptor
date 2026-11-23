# The re-walk: a squadron he only views, and the ☰ menu's squadron drop-down — what the fixes touched (RAPTOR), 23 Nov 26

You walk the real app and report what you SEE, with pictures. You fix nothing in `raptor-port/src`, commit nothing, push
nothing. Do not open any read report under `raptor-port/docs/superpowers/briefs/` (`*-read-*.md`, `*-fixread-*.md`).

**The copy:** `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`), its `raptor-port/dist` freshly
built by the host from the fixed code. Serve it with the walk helpers' own `serve()` on `MQ_PORT=4478` (check the port is
free first: `netstat -ano | findstr :4478`). Never run a build, an `npm` install or the test runner.

**Read first:** the first walk's report `raptor-port/docs/handpass/parts/n150/walk.md` (what was found, which script
covers which scenario); the scenarios `raptor-port/docs/superpowers/briefs/2026-11-23-msq-view-only-scenarios-astra.md`;
`raptor-port/docs/walk-scripts.md` §2, §4, §5, §7, §10; the walk's scripts and helpers in
`raptor-port/scripts/handpass/n150/walk/` (`vlib.mjs` and one script per part).

**Output:** every run with `MQ_PICS=rewalk`, so pictures go to
`raptor-port/docs/handpass/2026-11-23-msq-view-only-menu/rewalk/<script>/` — never into the first walk's folders, which are
the faults' evidence. Raw facts (`MQ_OUT`) to the scratchpad the host names. New scripts go in
`raptor-port/scripts/handpass/n150/walk/` named `r-<part>.mjs`, built on `vlib.mjs`, each step asserting the RIGHT
behaviour (a PASS means correct). Read every FAIL of a re-run script against the NEW flow below before calling it a fault:
a step whose premise a fix consumed is walked again with a fresh premise.

**What the fixes changed — each is what you check:**
1. The ☰ menu's squadron list now opens directly under the TALON mark, inside the menu, pushing the grey line, MENU and
   the rest down (drawing d2, d4 in `raptor-port/docs/mock/2026-11-23-view-only-tabs/`). Before, it hung out of sight at
   the menu's foot.
2. A pick made inside ☰ that the Tracker must ask about (unsaved chart edits) now CLOSES the ☰ menu first, and the question
   is drawn in front; every answer (Stay, Discard them, Save them) then works.
3. A Leave War window open when the page would land elsewhere (the member-view switch, or a pick of a squadron he only
   views) now holds the page: the Leave War stays, with the window and its words in sight, until the window is closed —
   then the page lands on View-only Sched, whoever he is (a View holder too: the second fix round). While it waits, the
   window wears the band "This is 142's. You picked 149 — close this to go on." (his D2323), its controls greyed, ✕ and
   Close live; the band's Close lands him; picking 142 again gives the window back live.
4. With the ☰ list open, the first press outside the menu (on the shade) closes only the list — a quick tap and a press
   held about a second alike; the menu stays open; a second press outside closes the menu.
5. Keys in the ☰ list: Arrow Down (and Arrow Up) on the mark opens the list; Tab out of the list closes it — as the top
   bar's "149 ▾" list does.
6. An input window (Inputs page) left open when the page lands on View-only Sched stays held — a band over it, Save
   greyed and refusing, Close live — not editable; a View holder's pick of 149 shows the pick's band ("This is 142's. You
   picked 149 — close this to go on."); picking 142 again gives the window back live.
7. Signing out and in again starts with no leftover landing (sign out while 149 is picked, sign in as another person).

**Re-run (into `rewalk`):** `dc1-drawing.mjs` (the drawing check — d2 and d4 must now match within about 2px; d1, d3, d5
must still match); `p1-ranger-phone.mjs` and `p2-admins-phone.mjs` (scenarios 3, 4, 13, 17–20 — the list placement and the
shade taps); `t2-tracker-phone.mjs` (the Tracker question, phone) and `t1-tracker.mjs` desktop (scenario 28 and question
case q5: unsaved home Tracker edits, then a View-only pick — no question, edits kept on return); `n3-keys.mjs` (15, 16,
22 — and now Arrow Down on the mark OPENS the list; Tab out closes it); `u1-plain.mjs` (the plain-user round, both sizes).

**New scripts — these scenarios, phone (402 × 874 WebKit, touch, ×2) and desktop (1536 × 864) unless said:**
- a. Hunter with Plan of 149, on 149's Leave War, a man's window open with words typed: press the role badge to switch to
  the member view → the Leave War stays, the window and its words in sight; close the window by each of its own ways
  (its close button, Escape on desktop) → the page lands on 149's View-only Sched, two pages offered. If the badge cannot
  be pressed with the window open (its shade on top), say so and picture it — that is a result, not a failure to force.
- b. The same with a pick of a squadron he only views (Ranger with View of 149, on 142's Leave War with a bid window open,
  pick 149) — if the shade covers the Schedules button, say so and picture it.
- c. Hunter with Plan of 149, on 149's Inputs, an existing input's window open: switch to the member view → View-only
  Sched; is the window still open? If so it must show a band and refuse a save — press Save, picture what shows.
- c2. Ranger with View of 149, on his Inputs with a saved input's window open: pick 149 (☰ on the phone, the top bar on
  the desktop) → View-only Sched, the window held with the pick's band, Save refusing; pick 142 → the window live again.
- a2/b2. For a and b where the pick or switch could be made: the band on the held Leave War window, its Close, and the
  slow shade press (hold about a second) on the phone.
- d. Ranger (or the person the demo world gives a bell line "confirm your OIL" or any own-page line), 149 picked: press
  that bell line → 142 back in view, the page and window it names opened on the right row, no band.
- e. Saber or Hunter with an access request waiting in the bell (make one through the app's controls if the world has
  none), 149 picked as View only: press the request's line → 142 back, Admin → Users open, its count 142's.
- f. The first walk's lead: after Discard (scenario 28, desktop), 149 picked — does the Tracker's bar still say "unsaved
  flow edits" though the edit was dropped? Picture the bar and say what it reads.
- g. Fix 7: Hunter signs out with 149 picked in the member view; Ranger signs in → his own squadron, his pages, the ☰ menu
  closed; Hunter signs in again → the admin view, 142.

**Sizing lines (the host's; walk them):** phone pictures within about 100 ms of each tap beside the settled one (§7.11
lesson 30); the list measured at its resting place against the grey line, MENU and the pages under it, before and after
it opens (lessons 5, 27); the question proved on screen before any answer is pressed (lesson 28); each window closed by
each of its own ways, WebKit touch and desktop (lesson 19); each window opened from each page it can be (lesson 12); the
drawing check after the fixes (lesson 8); the keyboard's boxes taken from the code (`ui/Drawer.tsx` DrawerSquadron,
`ui/SquadronMenu.tsx`) (lesson 14). What only his iPhone can show (the menu's own scroll with eight squadrons, the bounce)
is named as a look for him, not judged here.

**Report** (your final message, and a file `raptor-port/docs/handpass/parts/n151/rewalk.md`): for each fix 1–7 and each
scenario re-run or new, PASS / FAIL / NOT WALKED, the deciding pictures named; every FAIL with what you pressed, what
showed, what should have, and its picture; questions (not findings) apart; console errors; the drawing check's table;
the walk line: pictures · surfaces · orders · open findings. Open every picture you cite before you cite it.
