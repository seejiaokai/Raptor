# The second walk of pull request 843 — notes for the host (25 Nov 26, finished about 04:52)

**The fix's build:** `build-fix3` (bundle `index-C-8yJleY.js`) was built at 03:58, 11 minutes before `ebff3189b` was
committed, so a date cannot match it to the commit. I searched the bundle for each of the three source changes
`ebff3189b` made over `60e594d29`: the panel record carrying its navigation generation, `owesBeside`, and the Blue/Red
put-back inside the held place. All three are in the bundle. The branch was clean at `ebff3189b`, and nothing under
`raptor-port/src` changed after it. (`git diff 5b524f1ab ebff3189b -- raptor-port/src` is not empty, because those
commits carry the fix itself, so that check could not be used as written.) Main: `build-new3` (`index-DIr933hk.js`).
For task B I also ran the first cut, `build-fix2` (`index-BZt7HLBD.js`), which does not have the Blue/Red line. There
were no page errors or console errors on any run.

## Task B (Astra's finding 2): proven only with the browser's scroll anchoring switched off

- **Raising the question:** switch Blue/Red tracking on (the switch on the Logic page), type "ACM" and "DS FOR RU" into
  Monday's first formation on the Board, then Tab. The question opens in the flying section, 69px tall.
- **Getting a caret below an open question while the flying section is redrawn:** type a callsign in the second wave
  and Tab (this leaves the flying section owed), click Ranger's END box under Personal Inputs, type a time and Tab. The
  fix redraws the section at the click. The first cut redraws it at the Tab.
- **How far the caret's box moved:**
  - With scroll anchoring on (both test browsers do this): 0px on main, the first cut and the fix, in desktop
    Chromium, phone WebKit and desktop WebKit.
  - With scroll anchoring switched off by a style (`overflow-anchor:none`): the first cut moved +85px (desktop
    Chromium), +117px (phone WebKit) and +77px (desktop WebKit). The fix and main stayed at 0px.
  - In every run the caret stayed in its box and the question stayed open.
- **What this means:** the defect is real, and the line fixes it. The browser's own scroll anchoring hides it in the
  test browsers. I did not check whether his iPhone's Safari anchors this list. On main the state cannot happen,
  because main redraws nothing of the day while the caret is on the Board.
- **Astra's own steps** ("+ Line" pressed with the caret in a Ground Programme box) cannot be done: the press takes the
  caret, on every build and in every browser.
- **Evidence:** pictures in `walk2/b3-<build>-<size>-<engine>-<on|off>/`. The one that decides it is
  `b3-fix2-phone-webkit-off/b-phone-webkit-B3-after-tab.png`.

## Task A: each order, main desktop / main phone → fix desktop / fix phone

- **W2 (b):** ALL AVAIL start on the Common Programme. FAIL / FAIL → PASS / PASS.
- **W2 (c):** Unavailable leave end, Available crew. FAIL / FAIL → PASS / PASS. The warning list updated at once on
  both builds.
- **W2 (d):** the phone's folded Personal Inputs. PASS on all four runs.
- **W2 (e):** "abc" refused. PASS on all four runs.
- **W3: FAIL on all four runs (described below).**
- **W8:** the box holding the caret, measured at every Tab. PASS on all four, 0px everywhere, including Available crew
  redrawn above the caret.
- **W9:** RECORD on all four. The half-typed remark stays on its own input only.
- **W10:** the Tab route and Shift+Tab are PASS on all four. On a re-ordered day: FAIL / FAIL on main (the old fault),
  PASS / PASS on the fix.
- **W5 (a):** Undo / Redo of a drag, without a caret. PASS on all four.
- **W4 / W5 (a) / W7 with the caret kept through the press: COULD NOT BE MADE, on both builds and both sizes. No person
  can make this state.**
  - Desktop click: OIL Earn and Undo take the focus themselves. "Sun 19" leaves no focus.
  - Phone tap: Undo and "› Next" leave no focus. OIL Earn on the phone is behind "⋯ More", which leaves no focus.
  - Keyboard: 40 Tabs from the box reach only text boxes and Personal Inputs' Reject. They never reach these buttons.
- **W11:** the member, and a frozen issued version. PASS on all four. I published Wed 15 Jul through the Board to get an
  issued version, because the demo week had none.
- **N1 (b)–(e):** desktop PASS on both builds. Phone: FAIL on main (letters to 399px against an edge at 373px), PASS on
  the fix (372px against 373px).
- **N1 (f):** NOT WALKED. I found no template time box that takes typing.
- **N4:** RECORD. With an input's window up, the note sits at the top on the phone and at the foot on a desktop, the
  same on both builds; only main's letters run past the edge. "OIL not answered" was NOT WALKED.
- **The week, the Inputs page and the bell after a change on the Board:**
  - Main: the Board's own row stays stale until the Board closes; everything else agrees.
  - Fix: everything agrees.
  - Ranger's bell shows the same four lines on both builds.
  - The scheduler's bell is empty on both builds.

## The FAIL on the fix, in full (W3): it is older than this change and happens the same on main

- **Steps:** file a leave (LL) for Ranger and Hex, Wed 15 Jul 08:00–10:00. On the Board's Unavailable list, in Ranger's
  row: start 0900, Tab; end 1100, Tab; remarks "own hours", Tab. Desktop Chromium and phone WebKit, main and the fix.
- **Expected:** Ranger 09:00–11:00 "own hours" on a leave of his own; Hex 08:00–10:00 with no remark.
- **Seen**, with the store read after each Tab, the same on all four runs:
  - The first Tab splits Ranger off correctly onto his own leave at 09:00–10:00.
  - His row is in the section holding the caret, so it is not redrawn and keeps the shared leave's address. The end
    1100 and the remark "own hours" are therefore saved onto **Hex's** leave.
  - After the caret leaves: Hex 08:00–11:00 "own hours", Ranger 09:00–10:00 with no remark.
  - While the caret is still there, the screen shows Ranger 09:00–11:00 "own hours" and Hex 08:00–10:00. Neither is
    what is stored.
- **Picture:** `walk2/w3-fix3-phone-webkit/w3-phone-webkit-caret-left.png`.
- This is new data going wrong, not old stored data. I fixed nothing.

## What could not be done, and why

- W4 / W5 (a) / W7 with the caret kept: no person can do this (above).
- N1 (f): no template time box takes typing.
- N4's "OIL not answered" bar.
- W7's other kinds of box and the Calendar jump with the caret kept: those presses take the caret the same way.
- The phone pictures within 100ms of the tap: I took only the settled pictures.

## Things to know about the evidence

- Two verdict words in the saved run files are wrong, because of how my scripts measured, not because of the app:
  - W10 on the phone (`a-*-phone-webkit/facts.json`) says FAIL. The script added the wrong scroll amount to each box's
    position. The route is identical to the desktop's.
  - W9's first run (`a2-*/`) says FAIL. The script looked for the lower row at its old place after the upper row was
    removed. The re-run (`a2-*-r2`) reads its new place and gives RECORD.
- The first `a-*` runs' KEEP and W3 lines are superseded by the later runs (`a-*-r3`, `a-*-phone-webkit-r4`, `w3-*`);
  I deleted those superseded pictures.
- 223 pictures, about 71 MB.

## The commit

`479caa55e` on `claude/r4-walk-faults-170`, pushed with an explicit refspec. No run was in progress before the push.
The push starts the pull request's checks again; it touches only notes, scripts and pictures.

- **Added:** the report `raptor-port/docs/handpass/parts/r4wf/walk2-report.md`; the sheet's new §18 and a pointer
  line under §13 (its `Walk:` line not touched); `docs/file-map.md` naming the new files; the scripts
  `scripts/handpass/r4wf-w2-*.mjs`; the pictures `docs/img/handpass/2026-11-25-r4-walk-faults/walk2/`.
- **Not touched:** anything under src, any test, HANDOFF, OUTSTANDING and the rulings files.
- docsize: OK.
- No message to him, no pull request, no merge.
- Every background process has stopped.
