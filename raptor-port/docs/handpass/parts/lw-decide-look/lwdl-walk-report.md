WALK lw-decide-look

Walked the branch `claude/lw-decide-look-197`. Its build was current, and nothing was rebuilt. It was served on 127.0.0.1:4192. `main` (origin/main, which is this commit's parent) was built on D: and served on 127.0.0.1:4193 for the comparisons. Both servers are stopped and the D: worktree is removed.

Sizes: desktop is Chromium 1536×864. The phones are WebKit with the iPhone 13 profile, touch on, scale 3, at 402, 390 and 360. I also ran Chromium started at 125% (pc125), Chromium at 1100 wide, and Chromium touch at 402 for the long-press drag, because WebKit cannot drive that gesture.

I opened every picture my verdicts rest on. Where a script reading disagreed with the picture, I trusted the picture and say so below.

## Results table (F = Fable list, A = Astra list)

| Scenario(s) | Sizes | Verdict | Pictures | Seen |
|---|---|---|---|---|
| F1, A4 (Approvals keyboard) | desk | **FAIL** | AP-C-desk-C1/C2/C2-zoom/C3; main/AP-C-desk-C2-key-on-grey-zoom | The lit Approved looks exactly the same with or without the keyboard on it. With the keyboard on the grey Refuse, both buttons wear the same 2px cyan ring. |
| F2, A4 (bid window keyboard) | desk | **FAIL** | KEY-desk-1-key-on-lit, KEY-desk-2-key-on-grey(-zoom); main/KEY-desk-1-key-on-lit | The keyboard on the lit Approved changes nothing on screen. The grey Refuse gets the browser's own white ring, not the app cyan. Space and Enter work. The mark is never a keyboard stop. |
| F3, A3 (day's list rings and one row) | desk, 402, 390 | PASS | LIST-*-1..5, LIST-*-L1..L6 | Rings are whole and not cut by the list. Approve, Refuse, Move and Delete stay on one row in every state, with equal heights. Marks and words are at least 2px inside the edge. |
| F4 (Approvals rings: first/last line, neighbours, heading) | desk, 402, 390 | PASS | AP-A-*-A2-*, A3, A4 | Rings are whole, also with the last line at the foot fade. The clear gap from the ring to the grey neighbour is about 2px. The rings of adjacent lines do not touch. Nothing shows over the pinned heading. |
| F5a/b/c/d, A5, A6 (grey pressed decides the other way in one press) | all | PASS | WIN-*-4/6, LIST-*-L2/L4, AP-B-* | One press, no question. Lit and grey swap, the word swaps, and the grid cell follows. |
| F6 (second tap back to waiting) | all | PASS | WIN-*-8/11, AP-B-*, LIST-*-5 | Back to the exact waiting look (classes, colours, edge, no ring). Approvals counts the line again. |
| F7, A1 (boxes under repeated taps) | desk, 402, 390 | PASS | WIN, LIST and AP-A data | Every box is identical across waiting, approved and refused. Desktop 129×32. At 402: 83.5×30.3 (Delete 83.5×30). At 390: 80.5×30.3. |
| F8, F11 (one look: window vs day's list) | 402, 390, desk | PASS | LOOK-* | Same height, letter size, mark, ring, grey and fill in both places. |
| F9, A2 (Approvals phone date line) | 402, 390, 360 | **402 PASS; 390 known; 360 FAIL** | AP-G-*; main/AP-G-p360-* | 402: every half-day date on one line in all three states. 390: half-day dates take 2 lines (the known item). 360: see FAIL 3. |
| F10 (window words inside the edge, phone) | 402, 390 | PASS | WIN-p390-5-refused-row | Tightest case is "Approved" at 390 with 3.6px each side. All four buttons are one height. |
| F12, A12 (Approve held by a medical) | desk, 402 | **REPORT-FOR-HIS-CALL** | HELD-vs-grey-p402.png, HELD-vs-grey-desk.png, HELD4-* | The held Approve is grey at 45%, not pressable, keeps its mark, and its title reads "OML holds 19 Feb, so the bid can't be approved". Refused beside it is lit and ringed. Main showed the held Approve's green word at 45%. Now it is grey at 45%, next to an ordinary grey pressable Approve at 100% (side-by-side picture). |
| F13, A13 (stale lines) | desk, 402 | PASS (same as main) | AP-E-* | "Already approved by Saber" and "No longer there": both buttons not pressable, both at 40%, no ring. Main is identical. |
| F14, A15 (leave and return) | desk, 402 | PASS | AP-F-* | Decided lines keep their place and look after the dates and Back, after OIL ✕, and after 3 s idle. After going to the Grid tab and back they are gone, with nothing ringed. |
| F15, A14, A19 (Approve all, Undo, Redo) | desk, 402 | PASS | AP-D-* | Approve all leaves the hand-refused line alone. Every ring is separate. Approve all itself wears no ring. Undo takes back only Approve all. Redo restores it. A lit line tapped again is counted again. |
| F16 (Undo/Redo from the window) | all | PASS | WIN-*-13/14/16 | The window follows each step. One Undo takes back a grey press. |
| F17, A9, A10, A11 (ranges and drag window) | desk, Chromium touch 402 | PASS | RANGE-desk-*, RANGE-PH-c402-* | Mixed, all-approved and two-man sheets all show the waiting look with marks. Approve on a mixed range: the empty day gets nothing, and a reopened day shows Approved lit and ringed. Hold-and-drag works at a slow pace and at ordinary speed. An all-approved range staying in the waiting look is how the build reads the ruling (Astra 10), not something he approved. |
| F18, A8 (whole leave) | desk, 402 | PASS | WHOLE-* | "All 3 days" on an approved leave shows Approved lit and ringed (main showed it lit too). Tapped day alone: grey Refuse refuses only that day. Reopened parts read correctly. |
| F19 (two rings) | desk, 402 | PASS | WIN-*-3-two-rings | The leave button's ring and the decide ring are the same: 2px rgb(59,198,232), offset 2px. No glow; the button has no shadow. |
| F20, A16, A17 (member) | desk, 402 | PASS (same as main) | MEMBER-p402-*, TURNS-desk-* | No Approve or Refuse, no mark, no ring anywhere. No Approvals tab. The admin's approve, refuse and back-to-pending each showed correctly for him in the same tab. On desktop only 3 of his 4 days were opened (script: a window covered the month button); the phone run covered all 4. |
| F21 (tap tint, hover) | 402, 390, desk | PASS | WIN-*-tap60ms/tap1s, WIN-desk-17-hover-* | The window closes on the press. No leftover tint at 60 ms or at 1 s. Hover never makes the grey one look decided or drops the lit one's fill or ring. Cursor is a pointer on the grey one. |
| F22 (his PC at 125%) | pc125 | PASS | AP-I-pc125-* | Faint edge visible on all four sides. Ring cyan all round. All 11 lines share one column, 113.1/100.4 wide. |
| F23 (1100 and 1536 wide) | desk, d1100 | PASS (with note) | AP-H-* | Buttons right-aligned in one column. At 1100 the list scrolls sideways by 114px; on main it already did, by 106px. Nothing newly wraps. |
| F24 (every door) | desk, 402 | PASS | DOORS-* | The same decided look from the grid and from Approvals' slim bar. |
| F25, A21 (roll-call sweep) | 402, desk | PASS | SWEEP-* | The header Auto-approve switch above a ringed Approved is a different control and reads apart from it. "Give FO" and Grant OIL wear no mark. Legend and cells pictured. |
| A7 (independent entries; OIL award) | all | PASS | LIST-* | Changing Ace's OL bid never changed the FO award on the same day. The PM OIL award beside Outlaw's AM leave was untouched. |
| A18 (pressing the mark while typing) | desk, 402, 390 | PASS | RMK-* | Pressing the tick, and the grey cross, with no blur first: one action each, and the remark is kept. |
| A20 (near the edge) | covered | PASS | AP-A A4, WIN, LIST | Rings were whole wherever they were measured. |
| A3 (Delete armed beside Refuse) | all | NOT WALKED as designed | — | In the day's list one press of a bid's Delete deletes it straight away, so nothing is ever armed. Main does the same, so this is older behaviour, not this change. |

## FAILs in full

**1. The bid window: the keyboard on a decided button is invisible, and the grey one gets the browser's ring (F2, A4).** This is new.
- Steps: desktop, open a pending LL, Approve, reopen, then Tab until the lit Approved has the keys. Tab once more.
- Expected: one ring, visibly different (thicker) with the keyboard on it, in the app's cyan (D842, D1771).
- Seen: with or without the keyboard the lit button draws exactly the same ring (`.dec-ring` replaces the focus outline). The grey Refuse with the keyboard shows the browser's white "auto" ring.
- Pictures: KEY-desk-1-key-on-lit.png and KEY-desk-2-key-on-grey.png.
- Main: the lit Approved got the browser ring with the keyboard and none without it, so focus could be seen (main/KEY-desk-1-key-on-lit.png). The white ring on grey buttons already existed on main.

**2. Approvals: two buttons that both look decided under the keyboard (F1, A4).** This is new.
- Steps: desktop, Approvals, Tab to line 3's Approve, Enter, then Tab to its Refuse.
- Expected: you can tell from the picture which button is decided and where the keys are.
- Seen: the lit Approved and the grey Refuse with the keyboard both wear a 2px cyan ring at 2px offset. With the keys back on the lit one, nothing on screen changes.
- Pictures: AP-C-desk-C2-key-on-grey-zoom.png and AP-C-desk-C1-enter-key-on-lit.png.
- Main: the lit button had no ring, so a ring only ever meant "the keys are here" (main/AP-C-desk-C2-key-on-grey-zoom.png).

**3. Approvals at 360 wide: the line grows taller than its buttons (F9, A2).** This is new, and goes beyond the known 390 item.
- Steps: WebKit at 360×780, Approvals, any state.
- Expected (as the commit says): below about 400 a half-day date takes two lines inside the buttons' height, and the row does not grow.
- Seen: half-day dates take 3 lines ("23 / Jan / AM ›") and the row is 45px against 36px buttons. Even a whole-day "8 Jan ›" takes 2 lines.
- Picture: AP-G-p360-G-approved.png.
- Main at 360: half-day dates take 2 lines and the row stays 36px; whole-day dates take 1 line (main/AP-G-p360-G-approved.png).
- Cause: the phone buttons are 11px wider each, 77.3/68.3 against main's 66.3/57.3.

## Known, already his call (reported, not counted as new)
- 390: half-day dates go to 2 lines (main keeps them on 1).
- Desktop Approvals' Approve is 113.5 wide against main's 100.

## Drawing check (E3, at the drawing's own sizes)
I laid the drawing's own markup and CSS into the same window and measured each part beside the built row.
- Desktop, waiting, approved and refused: no difference over 2px in place, size, mark, words, colours, ring or corner rounding.
- Phone: the only differences are the letter size, 11.5px built against 11.7px drawn (0.2px), and the waiting edge colour, which is the same colour written in another notation.
- Pictures: drawcheck/dc-{phone,desktop}-{pending,approved,refused}-built-over-drawn.png and drawcheck/side-by-side-{phone,desktop}.png (the trio drawing beside the built rows).

## Plain-user round (PUR-*, 402 and desktop): PASS
- The window closes by ✕, by Escape and by a tap outside.
- Approve, then reopen and press the grey Refuse: the cell follows each time.
- In Approvals: approve one line, refuse one, approve then refuse a third. Counts: 11 → 8 pending, tab 13 → 10.
- A request's dates and Back keep the count. The slim bar's ✕ goes to the grid.
- Approve all takes it to 0. Undo puts it back to 8 with the hand decisions kept, and the grid cells agree.

## Notes, not findings
- On desktop the top bar's Undo is covered while the day's list is open; on the phones it can be pressed. This is not this change's area.
- Some first-run FAILs were the scripts' own, and the reruns passed:
  - the ring pixel sampler landed on a sub-pixel edge;
  - Approvals at 390 tapped a line hidden under the sticky top bar;
  - the Tab order goes to the dates link first;
  - Logout's selector was wrong.
  - In the first held-Approve try, the OML replaced a pending bid. The right case is a refused bid with a medical filed over it (D1544).

## Console and page errors
None in any run, on the branch or on main.

## Not walked
- A3's armed-Delete confirmation, because Delete has no armed state (see the table).
- A paperclip line in Approvals: the demo data has no document on a request.
- Real iPhone letters and keyboard behaviour: these runs were WebKit on Windows, not his iPhone (lesson 21).

## Where things are
- Pictures: C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a\raptor-port\docs\img\handpass\2026-11-28-lw-decide-look\
  - 342 branch pictures.
  - `main\` holds 104 comparison pictures.
  - `drawcheck\` holds 8.
  - Two `_probe-*` files are first-look captures, not evidence.
  - WIN-p402/p390 and AP-A desk/p402 were re-taken by the reruns.
- Walk scripts: a hook stops me writing into that worktree, and copying them there was refused. They are in C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\lwdl\:
  - lib.mjs and pw.mjs (the shared driver);
  - walk-window, walk-appr, walk-list, walk-more, walk-held4, walk-pur and drawcheck (.mjs);
  - sidebyside.py and held-side.py.
  - The host should copy them to `scripts\handpass\lwdl-*.mjs`.
- Raw logs are in the same folder: log-branch.jsonl, log-main.jsonl and the run-*.txt, re-*.txt and main-*.txt files.
- Nothing was committed or pushed. No source file was changed.

Duration: about 1 h 05 min, 12:40 to 13:45.