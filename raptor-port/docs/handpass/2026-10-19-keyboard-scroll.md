# [KEYBOARD-SCROLL] with D1080 — the WALK bug check (19 Oct 26)

Branch `claude/keyboard-scroll`, cut from `claude/rally-box-changes` (pull request 541, his D1047's one-tap time boxes —
not yet live). Two changes, one check (D485):
- **D1048** — on a phone, a box tapped to type in that the keyboard would cover is scrolled to sit just above the
  keyboard (`src/ui/kbscroll.ts`, installed once from `main.tsx`): the box's own scrolling panels, nearest first, then the
  page; in a window that cannot scroll, the window itself is raised and put back after.
- **D1080** — his answer to the four places pictured for him (the artifact "One tap, then type", pictures
  `docs/img/handpass/2026-10-19-keyboard-scroll/look/`): one tap then typing replaces in the duty and wave templates'
  time boxes, the Leave War's numbers, the SANS and late cut-off numbers and the Logic page's settings, through D1047's
  own `interactions.ts armFreshTime`.

## Questions waiting for him
None.

## 1. The eight questions and the tier
1. Money (OIL) — NO: no OIL arithmetic or record changes; the Leave War's OIL figure boxes save what the box shows, by
   their own unchanged save; only how the first key edits the box's text changes, and the box shows it before any save.
2. The published record — NO: nothing touches publishing, amendments or an issued copy.
3. Saved data — NO: no stored field, key or reader; each screen saves through its own unchanged path.
4. A shared drawer — YES in kind: one behaviour that must hold on every surface that has a box to type in (D1048 "every
   box in the app"), and D1080's on four screens' boxes.
5. A new gesture or mode — YES: the first key after a tap replaces (D1080); the screen moves when the keys come up (D1048).
6. A new surface — NO.
7. Roles — NO with a reason: who may type in each box is each screen's own unchanged gate; the new code arms only a box
   that is shown, enabled and not read-only.
8. The warning list — NO.
**Tier: WALK.**

## 2. Rulings swept (every one that applies)
D1048 (this job), D1047 (the one-tap time boxes, reused), D1080 (four more places), D1038 (the first change read by the
browser's kind of change), D686 (a finger on a window never scrolls the page behind it), D997 / D995 / D706 (a window on
a phone stands in the middle, as tall as its content), D537 (the day panels at the foot), the board following the
visible screen with a keyboard up (`SchedBoard.tsx`, his 25 Sep 26 report), the Leave War sheets' own keyboard anchoring
(31 Aug 26, `leavewar/ui/Sheet.tsx`), D991 (motion as smooth as the phone allows — the lift is instant, measured once the
keys are up), D487 (no button changes size), D853 / D921 (pictures with every question — the look page).

## 3. The roll-call
THE THING: a box to type in on a phone (D1048), and the boxes of the four places (D1080). Columns: **Lifted** — is the
box brought above a stand-in keyboard; **One tap** — does a tap then typing replace (D1080 places only; the schedule's
time boxes are D1047's, unchanged); **Over the same pixels** — what else moves the same thing.

| Surface | Lifted (D1048) | One tap (D1080) | Over the same pixels |
|---|---|---|---|
| Scheduler Board's panel | YES — A1 (a remarks box 788→505–529), KS1 | not this rule's (D1047's time boxes, unchanged — B11 regression PASS) | the board's own fit to the visible screen (`SchedBoard.tsx`), run first; the lift measures after it |
| Scheduler Board, phone on its side | NO — A2: the board's top takes 186 of the 202px left; nothing can show. Older layout — filed [BOARD-SIDEWAYS-KEYS] | — | the same fit |
| Edit Schedule's week (a typing cell) | YES — A3 (the page scrolled 0→217) | not this rule's | — |
| The input window (board → Personal Inputs; Inputs → "+ Input") | YES — A4a (raised 32px, put back), KS3c (held, a key typed, still above) | NO, because its boxes are not one short value (D1080 lists four places) | the window's own place() on every redraw — the hold is its own property since the narrow read's 1 |
| Inputs calendar's opened day (title, notes) | YES — A5a/b in sight; A5c ends 1px above the keys (its list at its end): visible, uncovered | NO, because words | the day panel's own fit (`InputsCal.tsx`) |
| SANS calendar (+ Commitment, ⚙ settings) | YES — A7 (in sight at phone size) | YES — B7 (Yellow / Amber / Red) | the settings window's own drag |
| Logic page (✎ Edit) | YES — A8a (the last box; the page scrolls itself), KS2; A8b the search box in sight, unmoved | YES — B8 (Crew rest, Days in a row, Brief); B9 the words setting adds, as it must | the page's own refocus after a save |
| Admin → Duty templates | YES — A9 (raised), A9b (14 roles: held to the screen, its own body scrolled), KS3, KS3b | YES — B1 | — |
| Admin → Wave templates | YES — A10 | YES — B2 | — |
| Admin → Users, new person | YES after the fix — A11 (the page at its foot: room below it now; re-run 497–530) | NO, because words | — |
| Quals (Edit) | YES after the fix — A12 (the cell was thrown away by the table's repaint; fixed) | NO, because words and ticks | the pinned heading (its repaint) |
| Leave War — ⚙ → + Counter | YES — A13 (the sheet anchors itself; nothing left to do) | YES — B3, B3b (label press) | the sheet's own keyboard anchoring (`Sheet.tsx`) — the hold refuses a window with its own height limit |
| Leave War — Manning's thresholds | (as + Counter — the same sheet) | YES — B4 | as above |
| Leave War — OIL figures (credit, bid days, balance Set) | YES — A14 | YES — B5, B5b (Set, armed as it opens) | BalanceBar's own dock |
| Leave War — Required P / W | — (its own pad on a phone: no keyboard) | already so (B10 PASS, unchanged) | — |
| Tracker | YES — A15a/b | NO, because not a listed place | the Tracker's own app |
| Help → report a problem | YES — A16 (in sight) | NO, because words | — |
| The sign-in page | YES — A17 (in sight) | NO, because words | — |

## 4. Door check
The new behaviour has two doors: a box to type in taking the focus (by a press, Tab or a script) and the visible screen
shrinking (the keys coming up). Both orders driven: focus then keys up (A1–A17), keys up then focus another box (O1);
the way out: keys down (every A row's third picture), a tap on blank space (O3), focus into another window (dropLifts).
For D1080: a press on the box, a press on its label (B3b, KF5), a box opened with the focus in it (B5b), a Tab in
(arms nothing — the browser's own select-all on a Tab, step 5), a second press (step 3).

## 5. Sizing the walk (D607 — the five lines)
1. **The type of change:** C (a new behaviour on a press and when the keys come up) and E (the screen moves — what
   scrolls, what rises), on every surface with a box to type in (D1048 "every box in the app"), and C on the four places
   of D1080.
2. **What only a walk could find here:** a surface whose box sits in something that neither scrolls nor is a plain page
   (a window whose rows all fit — the host's own browser test found one, Admin → Duty templates); a surface that moves
   itself for a keyboard too (the board, the Leave War's sheets) and could fight the lift; a React box whose state does
   not take the replaced value (found by the host's test, red first); a place the list of classes misses or catches too
   much (the Logic page's words setting). The tests carry the arithmetic (`kbscroll.test.ts`, 16) and the arming
   (`freshbox.test.tsx`, 15); five browser tests (KS1–KS5) cover the board, a page, a window, a box in sight, and three
   of the four places.
3. **What the ledger says:** the recent C / E walks (13–19 Oct 26) ran one to four Sonnet walkers at a desktop and a
   phone; the scripted host-alone walks of 18 Oct 26 found their faults at small cost; the rally walks found five faults
   in the change, most of them about presses on a phone.
4. **The walk chosen:** two Sonnet walkers in parallel on one frozen build (the brief:
   `docs/superpowers/briefs/2026-10-19-keyboard-scroll-walkers.md`). A — 17 surfaces at a phone with a stand-in
   keyboard, the phone on its side once, six orders, two break tests; B — the four places at a desktop by mouse and a
   phone by finger, five steps each, a member, the schedule's time box as a regression, two break tests. The arithmetic
   of how far a box moves is carried by `kbscroll.test.ts` (it calls the measuring function directly — not a proof that
   the screen offers the route, which the walk gives).
5. **After the walk:** its row is in `docs/walk-ledger.md` (19 Oct 26, [KEYBOARD-SCROLL]).

## 6. Orders
| Order | Result | How |
|---|---|---|
| a box focused, then the keys up | lifted (A1–A17) | walked |
| keys up, then a second box lower in the same window | lifted (O1) | walked |
| a held window, then a box near its top | stays held and pinned (the narrow read's 2) | `kbscroll.test.ts` — calls the measuring function directly |
| a raised window, then a tap on blank space | put back (O3) | walked |
| a resize 3s after the focus | nothing moves (O4) | walked |
| a pinch zoom with the keys up | nothing moves (O6) | walked |
| the desktop, no keyboard | nothing moves (O5) | walked |
| a window raised, then dragged by its bar | put back first, then dragged | code (putBack in `floatwin.ts`); not walked — his iPhone |
| one tap → type → leave → reopen (each place, both sizes) | replaced and kept | walked (B, steps 1–2) |
| one tap → a second tap → type | added at the caret | walked (B, step 3) |
| one tap → Backspace | emptied | walked (B, step 4); a number box with the caret before its digit (the fresh read's F4, fixed after the walk) is carried by nothing — jsdom has no selection in a number box — so it is on his look card |

## 7. Cases carried by a test
- The arithmetic of how far a box, a panel or a window moves, a hold, room below the page: `src/ui/kbscroll.test.ts`
  (20) — it calls the measuring function directly, which proves the arithmetic, not that the screen offers the route.
- The arming of each place, a label press, a box opened with the focus in it, once per opening, a React box keeping the
  replaced value (red first): `src/ui/freshbox.test.tsx` (KF1–KF5) — markup of each screen's class names, events
  dispatched; the screens themselves were walked (B).
- Quals keeping its rows through a repaint (red first): `src/ui/quals.test.tsx`.
- In a real browser with the stand-in keyboard: `e2e/kbscroll.spec.ts` KS1–KS5, KS3b (red first: 724 under the keys
  without the hold), KS3c (the input window after a key).

## 8. Break tests
Walker A: without the resize event A1's box stays covered (the event drives it); A9's window with its raise taken off
covers the box again (the raise shows it). Walker B: each place's class taken off the very box → typing adds again (B1,
B3, B5, B6, B7, B8, both sizes); B8 typed with no press → adds. The board's own break (B11) was inconclusive (without
`tm` the press does not focus the box) — D1047's own tests carry it.

## 9. Errors seen
None — no console error, page error or failed request in any walker's run or the host's probes.

## 10. What was NOT walked, and why
- **WebKit — his iPhone's own browser — is not walked.** Chromium cannot raise an iPhone keyboard; the walk stands a
  stand-in visual viewport in for it (the way of `scripts/handpass/am/b3-03-keyboard.mjs`). How Safari itself pans the
  page when the keys come up, and how its keyboard's word-suggestion bar resizes the screen, only his iPhone can show —
  his look card.

## 11. The gates
On the merge before the read fixes (a1e05f887): unit 11,943 · build · tfin 728/0 · e2e 884 passed (61 skipped) · Tracker
smoke 453 · rulecheck · docsize — all PASS. On the final code: (filled at its close).

## 12. The code read
D790 / D903: a fresh, blind Opus read of the finished code (329,608 tokens) — F1 a tall window could only rise to the
top (fixed: held to the visible screen, KS3b red first), F2 a label press did not arm (fixed), F3 the balance Set box
(fixed), F4 Backspace on a number box (fixed). The narrow read of those fixes (271,868 tokens) — 1 a movable window's
redraw dropped the hold at the first key (HIGH; fixed: the hold is its own property, KS3c), 2 a held window let go on a
higher box (fixed), 3 a window already at the top never held (fixed), 4 the Set box re-armed on every focus (fixed), 5 a
second label press disarmed (fixed); and an older cause, a raised window dragged by its bar jumped (fixed: put back
first). Round 2 of the narrow read (221,958 tokens), of the fixes to the narrow read and to the walk (Quals, room below
the page): no high or medium; three low, all fixed — L1 room was added below the page for a box taller than the room,
growing at every refit (now only what the box can still rise); L2 a pinch zoom while typing put a window back and took the
room away (now told apart from the keys going down); L3 a tap on a window's bar that was not a drag left the window put
back (now refit). Round 2 is the last (the cap, about three rounds): its fixes are each a few lines, carried by
`kbscroll.test.ts` and the full gate run.

## 13. What the walk found, and each disposition
| Find | Disposition |
|---|---|
| A12 — Quals: a cell being typed in thrown away when the keys came up | FIXED — the table's markup object made once per change (`QualsPage.tsx` `tableInner`), red first in `quals.test.tsx`; re-run on the built app: kept through scrolls of 100–300 and the keys coming up. An older fault (any scroll that pinned the heading did it); the lift met it every time |
| A11 — Admin → Users: the page at its foot, the last box 5px under the keys | FIXED — room below the page while the keys are up (`kbscroll.ts` roomBelow); re-run on the built app: 497–530 |
| A2 — a phone on its side: the board's top fills the 202px left | FILED — [BOARD-SIDEWAYS-KEYS], older layout |
| A5c — the day's last note ends 1px above the keys, not 8 | NOT A FAULT — visible and uncovered; its list at its end |
| A9b — Duty templates with 14 roles: the title scrolled out of sight | NOT A FAULT — the window's own body scrolls its title with its rows, keys up or not; its top stays on screen (KS3b) |
| B7 — "Red from" 2 under Amber 3 not kept | NOT A FAULT — Save refuses it and says "each above the last" (host probe `kbs-host-b7.mjs`, picture `walk/host-b7-save-refused.png`) |
| B11 — the board's time box left by Tab shows "1000" until another press (10:00 saved) | FILED — [BOARD-TAB-FOLD]: the same with plain typing (host probe `kbs-host-b11.mjs`), older than D1047 |
| B step 5 — a Tab into a box, then typing, replaced | NOT A FAULT — the browser itself selects a box's whole content on a Tab in (a control box not on the list does the same) |
| In passing — eleven screens hand React a new markup object every repaint | FILED — [INNERHTML-REPAINT-SWEEP] |

## 14. His look card
On his iPhone, the preview link from the pull request:
1. **Scheduler Board**: tap a remarks box low on the screen — it comes up just above the keyboard; type; tap away.
2. **Admin → Duty templates** (Squadron config): tap the last End time — the window rises above the keyboard; add roles
   until it is long, tap the last one — the window fills the space above the keys and scrolls to it; close the keyboard —
   the window goes back.
3. **Inputs → + Input**: tap the remarks box, type a few letters — it stays above the keys while you type.
4. **Quals → edit**: tap an initials cell low on the screen, type — the cursor stays in the cell.
5. **One tap then type** — Logic → ✎ Edit, tap "Crew rest" and type 11h (it replaces 12h); SANS ⚙, tap a colour's words
   and type a number (it replaces); Leave War → a figures sheet → "Set", type (it replaces the balance); a template time.
   A second tap still edits one digit.
6. **Not walked — only his iPhone can show it:** Safari's own scroll when the keys come up (the walk used a stand-in
   keyboard in Chromium); the word-suggestion bar; the balance "Set" box raising the keys as it opens (if it does not, a
   tap to raise them counts as a second tap and the box adds instead of replacing); a Leave War counter's number with the
   cursor put before its digit, then Backspace (it should empty). Carried from pull request 541: a
   caret dragged with the space bar is not caught as a drag; a long press (the loupe).
