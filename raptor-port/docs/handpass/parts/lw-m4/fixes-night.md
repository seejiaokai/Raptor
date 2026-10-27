# M4 — the fixes of the night of 27–28 Oct 26 (a fresh Opus builder)

Brief: `docs/superpowers/briefs/2026-10-28-lw-m4-fixes.md`; the findings joined in the evidence sheet §11. Branch
`claude/leave-war-m4-planning-d18224`, from 3ad84df65. Every fault was made to fail by a test first, then fixed, then green;
nothing was pushed. Each row below: the test that was red (file — name), the fix (file — function), its commit, the twin
paths given a test of their own.

| Finding | Red first | The fix | Commit | Twin paths tested |
|---|---|---|---|---|
| **M1 HIGH** — the wrong half decided | `src/leavewar/m4decide.test.ts` — "a day whose other half already holds war-approved leave (M1)": the re-key, the second tap, Refuse, the stale reason (4 of 5 red; the plain-day control passed) | `src/leavewar/state/store.ts` — `DecidePart.code` (filled by `approvals.ts linesOfWar` and every re-read), `warLeaveFor` (the leave on the request's half), `decideRequests` (each request's half read before the command), `staleWhy` (the "Already approved" and "back" branches by half) | 05b952db1 | second tap AND Refuse after Approve; a stale line deleted since |
| **M2 HIGH** — the bell on a two-half day | `src/leavewar/m4bell.test.ts` — "a day holding two war-approved halves (M2)": (a) afternoon then morning, (b) an approval extending an older morning leave, (c) the older half put back, "Approve what I enter" (D1422) — 4 red; (c, the later half) passed before | `src/leavewar/sync.ts warLeaveNow` keyed "date\|notation"; `store.ts decisionTells` matches approvals, put-backs, moves and deletions by date AND half | 05b952db1 | both halves put back; approve and place-approved |
| **M3** — Undo / Redo after a one-tap change of mind | `src/leavewar/m4page.test.tsx` — "Undo and Redo after a one-tap change of mind (M3)": Approve→Refuse→Undo; Undo-Undo-Redo-Redo; the twin Refuse→Approve→Undo→Redo; the second tap undone (all 4 red) | `src/leavewar/ui/ApprovalsPage.tsx` rows memo — each row keeps every decision made on it (`forms`, newest first, in place of `undone`); a row not pending shows the newest whose days all still stand | ab6605d61 | Undo AND Redo; Approve→Refuse AND Refuse→Approve; the lit second tap undone |
| **M4 HIGH** — a press decides another man's line | `e2e/leavewar.spec.ts` — "with 'Pick dates…' open, a press on a line's Approve only closes the calendar — no line is decided (M4, D1421)" — red on `lw-phone` by a touchscreen tap (a line lit); `lw-desktop` by the mouse passed before and after | `ApprovalsPage.tsx`, the picker's outside-press handler: the press closes the calendar and the click that follows that press's lift is taken before anything under it acts (a press that makes no click leaves nothing waiting) | 4d5763da3 | finger (phone) and mouse (desktop) |
| **M5** — one posting-out rule in every door | `m4decide.test.ts` — "posting out — one answer through every door (M5)": a posting to come (the day's list and the bid windows' reason) and one that has run (refused everywhere, Refuse still works) — 2 red; SANS approves (passed before, kept); `m4page.test.tsx` — "M5 the day's window gives Approvals' posting-out reason" (red against the old store) | `sync.ts approveWhy` now holds the run check (from `store.ts decideWhy`, dropped there); `postedOutAsSans` exported; `decideRequestById` answers with the rules' reason; `setBidStates` returns `why`, shown by `BidPicker.tsx` (the one-day window) and `SelectSheet.tsx` (the drag window) | 3a76cb8ac | Approvals, the day's list, the bid windows; Approve refused AND Refuse working in each; to come AND run; SANS |
| **M6 MEDIUM** — leaving from Approvals | `src/leavewar/leavewarpage.test.tsx` — "leaving the Leave War from Approvals (M6)": from the page, and its twin from the slim bar (both red: the grid flagged on screen after leaving) | `src/leavewar/LeaveWarPage.tsx` — a module flag `pageOn`, cleared by the page's cleanup before it ends the visit; `Body` then touches neither the flag nor the scroll, records the grid's place only on its own page; left from the page, the return lands on the grid where he was | 8502044d1 | from the page AND from the slim bar |
| **M7** — a lit line never re-checked | `m4page.test.tsx` — "a lit line changed elsewhere (M7)": approved here, put back on the grid (two copies → one, pending, in place); refused here, deleted on the grid (stayed lit) — both red | `ApprovalsPage.tsx` rows memo (the same change as M3): a lit row is asked whether its decision stands; one put back elsewhere takes the new pending request in its own place; one that no longer stands goes unlit and says why | ab6605d61 | approved-then-put-back AND refused-then-deleted |
| **M8** — a finger on the bell's foot | `e2e/leavewar.spec.ts` — "a finger dragged from the bell's foot never scrolls the page behind it (M8, D686)" on `lw-phone` (a CDP touch drag moved the page 273px) | `src/ui/topbits.tsx BellList` holds a finger with `floatwin.ts holdPageScroll`, the one body every window uses | 4d5763da3 | — (the list's own scroll already passed; still passes in "a long bell keeps…") |
| **M9 LOW** — an unread "again" line after Undo | `m4bell.test.ts` — "an unread 'again' line and the next Undo (M9)": unread (the line went), and its twin read ("taken back" again) — both red | `sync.ts warNoticesReversed` gives the "again" line `ref` and writes "taken back" only where the "again" line was read, and no second "again" on Redo; `src/state/notices.ts noticeLive` shows an "again" line only while the line it repeats stands, and only its newest — no notice is deleted, so the notices' permission row is unchanged | dc70b9322 | unread AND read; Undo AND the Redo after it |
| **M10 LOW, security** | `src/leavewar/m4sec.test.ts` — "M10 his old REFUSED request dropped…" and "M10 a copy of his request on another day…" (both passed the guard before) | `src/state/perms.ts stampForged`: a re-type takes the stamp only of a LIVE bid on the half it replaces; "the same record" only where its id stands in one cell after the command (a move, not a copy); `docs/data-model.md` §11 says so | 7ae55300e | an on-half re-type and a real move still pass |
| **M11** | `src/storage/seal.test.ts` — "settings/apprseen:stiff → LeaveApprovalsSeen" | `src/storage/tables.ts tableOf` | fbdda026c | — |
| **M12** — D1441 on Linux | `e2e/leavewar.spec.ts` — "on a phone Approve and Refuse are in the drawing's letters and every date stays on one line at 402 (D1441)" — not reproducible red here (Windows' letters fit before and after); the failure is GitHub's Linux run | the test only: the drawing's 12.5px bold checked everywhere; no date may break INSIDE a word anywhere; the one-line fit asserted only on Windows (`process.platform === 'win32'`), where it was measured — the comment says why | 4d5763da3 | — |
| **M13** — the phone's slim bar | `e2e/leavewar.spec.ts` — "on a phone the slim Approvals bar stands where the drawing has it: 8px in, 46 tall, 10 above the foot (M13, D1440)" (red: 12, 44, 22) | `src/leavewar/ui/approvals.css .appr-slim.ph` — left / right 8px, min-height 46px, bottom 10px (+ the home bar's inset where a screen keeps one); the windows over it on a phone stand 8 above it (`bottom: 64px`); Back and ✕ keep 34px | 4d5763da3 | Back and ✕ press areas; the window-above-the-bar test still passes |

## M13 — the measures

Measured on the drawing's own pixels (`docs/mock/lw-overhaul/full/r22-6-phone.png`, 1206 × 2622 = 402 × 874 at 3×), by the
bar's edge colour (42, 50, 60) and fill (22, 27, 34): the box's left edge at x 24–26 and right at 1179–1181 → **8px in from
each side** (386 wide); its top edge at y 2454–2456 and foot at 2589–2591 → **46 tall**, its foot at 864 → **10 above the
screen's foot**. Walker B's "about 4 and 50" read the drawing's pink marking ring (at x 10–16, y 2441–2447 and 2600–2606),
which stands round the bar. The build had 12 in, 44 tall, 22 above the foot; it now has the drawing's (the browser test
above measures 8 / 8 / 46 / 10 at 402 × 874).

## The Archive-outcome look (to look at, not changed)

**What the code does.** The puck's tag in Approvals is `postingPendingTag` (`sync.ts`) until the posting has run, then
"posted out <date>". `postingPendingTag` reads the CALENDAR's today (`state/person-delete.ts effectiveToday`), while the
refusal (D1436, `postingOutWhy`) and `postedOutBy` read the LEAVE WAR's today (`memberToday`). Walker A's scripts pin the
Leave War's today to a January date (`scripts/handpass/lw-m4-lib.mjs`, `lwSetMemberToday`) but the calendar stays at 28 Oct
26: for Blade's posting from 15 Jan the war said "still to come" (hence "He posts out on 15 Jan: refuse or delete it") while
the tag's clock said "come and not yet run", for which it shows nothing (the held note on Admin → Users speaks). In use the
two clocks are one (the pin is a test hook), and a posting still to come shows "posting out 15 Jan · Overseas Sqn" — what
the first walk saw. **My reading: not a fault of the app — a set-up of the walk.** One difference from the drawing stands:
r22-1 writes "PO 1 Mar" under the puck where the build writes "posting out 1 Mar · Overseas Sqn" (the words — the host's to
put to him if wanted).

**LOWEST AVAIL empty.** Walker A's leave (2 Feb, 3 Feb PM) lies AFTER his posting date; from that date he is not in the
manning (the counts drop a man posted out), so the request lowers no Available row and there is no figure to show. r22-1's
Blade has his leave (Mon 2 Feb) BEFORE his posting (1 Mar), so the drawing shows "P 27". **My reading: correct as built,
not a difference** — the drawing's case and the walk's are different cases.

## Not done

- **Opus 8** (the bell's recount) — not now, by the brief (filed as tidiness, D489).
- **M12 red-first** — cannot be made red on this PC (Windows' letters fit); GitHub's Linux run is its check.

## Checks run (on his PC, 28 Oct 26)

- Unit, every file touched plus the brief's list: `m4bell` 19, `m4decide` 21, `m4page` 17, `m4ride` 14, `m4sec` 13,
  `leavewarpage` 4, `state/store.test` 221 (the Leave War project); `state/perms.test` 85, `storage/seal.test` 42; also
  `ui/bellnotices` + `bellnotices-scenarios` 76 — all green.
- A wider sweep of the 59 Leave War test files that call what changed (deciding, the bell, the posting doors, the pages):
  1,349 passed.
- `npm run build` (the type-check) through the lock: passed, twice (before the red browser run and after the fixes).
- Browser, through the lock, on `lw-phone` and `lw-desktop`: the four new or changed tests above and every Approvals and bell
  test in `e2e/leavewar.spec.ts` — 16 passed, 6 skipped (phone-only tests on the desktop project), 0 failed. Red run before
  the fixes: M4 (phone), M8, M13 failed; the rest passed.
- Not run: the full gate set (GitHub's run of the pull request is the full check while the repo is public — D1086).

## Round 2 — the fresh blind read of the fixes (`fix-read.md`) and the host's reading of D1436

Each made to fail first against round 1's code, then fixed, then green; nothing pushed.

| Finding | Red first | The fix | Commit | Twin paths tested |
|---|---|---|---|---|
| **M5 narrowed (the host's reading of D1436's full row)** — only days from his posting-out date are refused, whether the posting has run or not; "a request with no such day approves as ever" | `m4decide.test.ts` — "a man whose posting out has run: his days from the date are refused, past tense; a day before approves…" (rewritten from round 1's blanket rule), and in "posting out — one answer through every door (M5)": "a posting that has RUN: every door refuses his days from the date…" and "…a day before the date approves in Approvals and the bid windows too" — all red against round 1 | `sync.ts approveWhy` loses the blanket run check; `postingOutWhy` is the one date rule in every door, "He posted out on <date>: refuse or delete it" once the posting has run (`postedOutBy`), "He posts out on…" before; `store.ts postedOutAsSans` removed (unused) | b7c433c3a | Approvals, the day's list, the bid windows; a day before AND a day from the date; still to come AND run; Refuse in each; SANS unchanged |
| **R2-4 LOW** — "Approve what I enter" gave a guessed reason | `m4decide.test.ts` — "'Approve what I enter' on his days from the date: kept pending, with the door's reason (R2-4)"; `m4page.test.tsx` — "R2-4 the one-day window…" (the door asked for the refusal on a day the window opens — the grid draws his days from the date posted out, where a tap opens the day's list) and "R2-4 the drag window…" — all red | `store.ts placeApproved` returns the door's `why`; `BidPicker.tsx` and `SelectSheet.tsx` print it after "kept pending —" where present, the old words only where it is empty | b7c433c3a | the one-day window AND the drag window |
| **R2-5 LOW** — the drag window's count | `m4decide.test.ts` — "the bid windows count the days the rules refused apart from the days with nothing to decide (R2-5)"; `m4page.test.tsx` — "R2-5 the drag window counts…" (expects "1 decided. 1 not approved: He posts out on 11 Feb: refuse or delete it. 1 skipped (no bid, or Raptor-owned).") — both red | `store.ts setBidStates` also returns `refused`; `SelectSheet.tsx decide` prints the refused days with their reason and the rest as "skipped (no bid, or Raptor-owned)"; `store.test.ts`' two exact-shape checks gain `refused: 0` | b7c433c3a | decided > 0 AND none decided |
| **R2-3 LOW-MEDIUM** — M3's three-tap twin | `m4page.test.tsx` — "R2-3 Approve, Refuse, Approve, then Undo, Undo: lit 'Approved'; Redo, Redo: 'Refused' then 'Approved'" — red (unlit after the second Undo) | `ApprovalsPage.tsx apply` keeps every decision, newest first (not one a light) | 01947231a | Undo, Undo AND Redo, Redo |
| **R2-1 MEDIUM** — M4 by a held press | `m4page.test.tsx` — "R2-1 a press held a second outside the open calendar still decides no line at its lift" (the iPhone's click fired at the lift onto another line); `e2e/leavewar.spec.ts` — "…a press HELD a second on a line's Approve decides no line at its lift (R2-1, D1421)" on `lw-phone`, a CDP touch held 1 s — both red (Chromium too fired the click) | `ApprovalsPage.tsx`, the picker's outside-press handler: the click-taker is armed at that press's own `pointerup` and ends on `pointercancel`, the next `pointerdown`, or 500 ms after the lift | 1b2141bba | a quick tap (round 1's M4 test, still green) AND a held press |
| **R2-2 LOW** — every first outside press swallowed | `m4page.test.tsx` — "R2-2 a press outside the open calendar on something that did not move closes it AND does its job"; `e2e/leavewar.spec.ts` — "…a press on the Grid tab closes the calendar and opens the Grid at once (R2-2)" — red on `lw-phone` and `lw-desktop` | the same handler: only a click landing elsewhere than what was pressed, or on a pressed thing that moved (top or left by 1px or more), is taken | 1b2141bba | finger (phone) AND mouse (desktop); a moved Approve still taken |

### Round 2 checks (28 Oct 26)

- Unit: `m4bell` 19, `m4decide` 24, `m4page` 23, `m4ride` 14, `m4sec` 13, `state/store.test` 221 — green; the 59-file Leave War
  sweep: 1,358 passed.
- `npm run build` through the lock: passed (twice — round 1's handler restored for the red browser run, then the fix).
- Browser through the lock, `lw-phone` and `lw-desktop`: red run of the two new tests against round 1's handler — 3 failed (R2-1
  phone, R2-2 phone and desktop), 1 skipped; green run of every Approvals and bell test with the new ones — 19 passed, 7
  skipped (phone-only on the desktop project), 0 failed.

## Round 3 — the blind read of round 2 (`fix-read-2.md`) and the host's decision on a deleted man

Each made to fail first against round 2's code, then fixed, then green; one commit, 089e9a0d2; nothing pushed.

| Finding | Red first | The fix | Twin paths tested |
|---|---|---|---|
| **R3-1 MEDIUM** — a touch on the empty card beside or under the open calendar decided a line (round 2's R2-2 regression) | `m4page.test.tsx` — "R3-1 a tap on the empty card beside the open calendar, its click landing on a line's Approve, decides nothing"; `e2e/leavewar.spec.ts` — "…a tap on the empty card beside or under the calendar decides no line (R3-1, D1421)" on `lw-phone` (a CDP touch in the band under the calendar at line 1's Approve's x, at 402 and 440, and at 440 the strip to its right where the screen leaves one) — red at 402 | `ApprovalsPage.tsx`, the picker's outside-press handler: the press and the click each resolve to the nearest pressable thing (`closest(PRESS)`); the click is let through only where both are the same control and it has not moved (measured on that control, or the pressed element where none) | the band under AND the strip beside the calendar; a held press (R2-1), a quick tap (M4) and a press on what did not move (R2-2, the Grid tab) all still green |
| **R3-2 LOW** — an icon pressed, its button's edge lifted, swallowed | `m4page.test.tsx` — "R3-2 a press begun on an outside button's icon and ending on the button does the button's job, once" | the same change (both resolve to the button) | — |
| **R3-3 LOW** — a stopped Refuse counted "not approved" | `m4page.test.tsx` — "R3-3 a Refuse the rules stop is counted 'not changed'" (the door asked for a locked-week refusal of an approved day) | `SelectSheet.tsx decide`: "not changed" for a Refuse or a send-back, "not approved" for an Approve | Approve (R2-5's test) AND Refuse |
| **R3-4 LOW** — reasons run together; "He" over several men | `m4decide.test.ts` — "the bid windows give the reasons per man, one each, de-duplicated (R3-4)"; `m4page.test.tsx` — "R3-4 a two-man drag names each man before his reason, the reasons apart" | `sync.ts doorApprove`, `doorDecideApproved` give each reason with its man (`whyOf`); `store.ts setBidStates`, `placeApproved` return `whyBy` (by man, once each); `BidPicker.tsx` and `SelectSheet.tsx` join reasons with ". ", the drag window over more than one man naming each before his; `store.test.ts`' two exact-shape checks gain `whyBy: []` | `setBidStates` AND `placeApproved`; one man AND two |
| **R3-5 words** | — (comments) | `store.ts`: the comment over Approvals' one writer and the one in `decideWhy` now describe the one date rule (D1436) and the deleted man | — |
| **R3-6 (the host's decision)** — a deleted man's leftover pending bid approved | `m4decide.test.ts` — "a DELETED man: his leftover pending bid is refused in Approvals and in the bid windows (R3-6)" | `sync.ts approveWhy` (the one body every door asks): `postedOutBy(…) === 'gone'` → "Posted out — refuse or delete it" — the pre-M4 behaviour for a deleted man, restored pending his word | Approvals, the day's list, the bid windows; Refuse still works |

### Round 3 checks (28 Oct 26)

- Unit: `m4bell` 19, `m4decide` 26, `m4page` 27, `m4ride` 14, `m4sec` 13, `state/store.test` 221; the 60-file Leave War sweep
  1,378 passed; `state/person-delete`, `p6d-deleteonread`, `perms`, `storage/seal`, `ui/bellnotices` 195 passed.
- `npm run build` (the type-check) through the lock: passed.
- Browser through the lock: red run of R3-1 against round 2's code on `lw-phone` — failed at 402 (a line lit); green run of
  every Approvals and bell test with all the new ones, `lw-phone` and `lw-desktop` — 20 passed, 8 skipped (phone-only on the
  desktop project), 0 failed.
