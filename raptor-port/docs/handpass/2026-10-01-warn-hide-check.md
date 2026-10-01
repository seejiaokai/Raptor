# [WARN-HIDE-KEPT] hidden warnings — the FULL bug check (1 Oct 26)

Branch `claude/warn-hide-kept`. Rulings D469, D471, D472, D475. Plan
`docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md` (v2, both reviewers' round-1 findings folded in —
`docs/superpowers/briefs/2026-10-01-warn-hide-kept-dispositions-r1.md`). Register
`docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md` (WH1–WH13). The picture he approved:
`docs/mock/warn-hide.html`. Method `docs/bug-check-order.md`.

## 1. The eight questions — tier FULL
| # | Question | Answer |
|---|---|---|
| 1 | earned leave | no — OIL reads the issued evidence block, never a warning or a puck's flag; nothing of it is touched |
| 2 | the published record | **YES** — each version now keeps the hides it went out with; a hide on a published day is a new pending change; the face draws by the version's own hides |
| 3 | saved data | **YES** — the boot now reads the saved hides back (it used to lose them, and the next edit erased them); the key's shape changed; `w.wo`, `w.shown` |
| 4 | a shared drawer | **YES** — the bundle every puck reads; the two lists; the count |
| 5 | a new gesture | no — the ✕ and ↺ existed; the ↺ moved from the fold onto the line |
| 6 | a new surface | no |
| 7 | roles | **YES**, to be safe — who sees the struck line (everyone), who gets the button (a scheduler, on the working copy) |
| 8 | the warning list | **YES** — its lines, its count, its colour |

## 2. The rulings walked (the rules sweep — one line per ruling, pass or fail in the RUNNING build)
Scenario numbers are Astra's (`docs/superpowers/briefs/2026-10-01-warn-hide-kept-scenarios-astra.md`); A / B / C are the
three walkers (`docs/handpass/parts/wh-a.md`, `wh-b.md`, `wh-c.md` — each step's own row and pictures).

| Ruling | What it demands here | Walked | Result |
|---|---|---|---|
| D469 | hidden for everyone across a reload and a sign-in, until someone flags it again | C 28 (reload, sign-out and in, the member, the next edit, the board), C 27 (scheduler, admin in his member view, member, guest — at a draft hide, a pending hide, an issued hide), C 30 (a second scheduler flags it again), C 29 (two weeks kept apart) | PASS |
| D469 | no flag on the pucks for that item | A 8–20 and the sweep (every one of the 31 lines of Monday–Thursday hidden one at a time, the day read after each), the dashed ring, the dotted mark and its "Breaks Tuesday" row | PASS — one FAIL on the board's stand-by seat, FIXED (§5, finding 1) |
| D469, D475 | the line stays in place, struck out and darker, ↺ at full strength; no "N hidden" fold | A 21, 22, 25 (both lists, both widths, painted — `text-decoration-line`, the ↺ topmost at its own centre) | PASS |
| D472 | not counted: "4 issues" reads "3 issues", no word of a hidden one; the ⓘ popup and Insights the same | A 21–24, 18 (red → amber → grey bar), B 23 | PASS |
| D475 | every issue hidden: a quiet "✓ No issues" bar that opens the list; the board's "No conflicts flagged for <day> ✓"; View-only Sched and a look draw the struck line with no button | A 21, 22, V1–V3; B 43, 23; C 27 | PASS |
| D471 | on a published day the hide waits for the next amendment; the published face keeps the flag until it is out; each version keeps its hides | B 37, 38, 39, 41, 42, 43 (both the warning that freezes and the one that stays live), C 7, 5 (next week's Monday) | PASS |
| D45, D103, D97, D98 | one pending change, the four sign-offs fall, "Not yet signed" / "Not yet published", back to what was published = nothing pending | B 40 (every count reads one; two hides read two; ↺ brings the four back), B 42 | PASS |
| D99, D100, D168, D340, D345, D346, D119 | the hide is named in the changes window's To go out, under "The day"; a tap goes to it | B 40 | the line and its place PASS; **the tap FAILED — FIXED** (§5, finding 4) |
| D179, D183–D185, D188 | what freezes and what stays live on a published face — unchanged; both read the ISSUED hides | B 38a (Static's long day, frozen), 38b (Outlaw's crew rest, live — Monday's dotted mark with it) | PASS |
| D187 | a 👁 look at a version shows ITS warnings, and now its hides, struck, read only | B 43 (Original / AL1 / AL2 on Edit Schedule and the board, a pending hide never bleeds in) | PASS — its "N pending" chip miscounted, **FIXED** (§5, finding 3) |
| D101, D363, D175 | Unpublish; loading an older version | B 41, 42, 3 | the load itself PASS; **its confirm's count FAILED on two neighbours of Astra's case — FIXED** (§5, finding 3) |
| D94, D164, D270 | the three rings on the board as on the week; a flag gone gives the purple "this is you" ring back | A 8–20 (week and board read side by side), A's sweep | PASS but for finding 1 (the board's stand-by seat — on `main` too) |
| D38–D41, D65 | the ALL AVAIL window's pucks are real pucks, flagged; its reason and "N men are flagged" | A 10 (draft), B 10 (published: unchanged while the hide waits, one fewer after AL1) | PASS |
| D148, D338 | Undo takes back only his own hide; refuses, naming who, if another has changed that day's hides since; the history outlives a sign-out | C 31 (Undo / Redo, top bar and board, each then a reload), C 32 (b) (another DAY never blocks), C 30 (the history's two lines, who and when) | PASS. **The refusal itself could not be reached through the app's doors in this build** (§5, finding 5; §8) — pinned by `state/sched-dayrecords.test.ts` |
| D213, D215 | a guest sees what a member sees | C 27 | PASS |
| "No counts in the top bar" (20 Aug 26); "a clicked warning lights its crew in the warning colours" | untouched | A 25 (a tap on the struck line lights Static, never selection blue) | PASS |
| D56, D54 | hides stored by an older build stop matching | not walked — it is not a finding, by ruling | — |
| D473 | `data-schema.md`, `data-model.md` updated in the change | read, not walked | done (`w.wo`, `w.shown`, the key's shape) |
| Left as it is (plan §10) | the Logic page's "fired N×" still counts a hidden warning; the print and the CSV carry no warning; the Leave War and OIL figures as they were | C 44, 44b (print page and CSV identical to the letter before and after; every OIL tracker figure and the Leave War's saved rows identical) | PASS |

No clash between rulings was found. One narrowing, recorded in `ui-contracts.md`: D187's "every warning shown" on a look
now reads "every warning, the hidden ones struck out" (D469 is the later ruling).

## 3. What was built, each with its test (red on the code before it, or proven by a break test — §6.4)
| What | Where | The test that names it |
|---|---|---|
| The boot reads the week's saved hides back; a sign-in no longer clears them | `state/store.ts initStore`, `state/view.ts VIEW_RESET` | `state/warnhide-kept.test.ts` (WH1, WH2 — written first, 7 of 7 red on `main`'s code), `state/view-reset.test.ts`, `state/sched-routing.test.ts` |
| One key, a rename is not a change | `engine/warnhide.ts hideKey` | `engine/warnhide.test.ts` (WH10) |
| Every mark names its warning; the bundle "as shown"; the raw one kept | `engine/validate.ts` (`marks`, `traces`, `shownOf`, `rawWarn`, `validate`) | `engine/warnhide.test.ts` (WH3, WH13); the marks guard after every validate of both suites (`src/testing/marks-guard.ts`); `engine/parity.test.ts` unchanged |
| The lists: the line struck in place, the count, the colour, every issue hidden | `ui/html.ts dayWarnHTML` / `dayInfoHTML`, `ui/board.ts boardWarnHTML`, `scheduler.css` | `ui/warnmute-week.test.ts` (WH4–WH7), `e2e/warnhide.spec.ts` (painted, both widths) |
| The readers past the maps | `html.ts exemptDeskOwn` / the exempt line's `own` / `personWarnMsgs` / `fltNoLenShown`, `state/view.ts selectPerson` / `warnFocusMap`, `state/dropflag.ts`, `engine/insights.ts`, `ui/Modals.tsx`, `ui/peek.ts` | `ui/warnhide-readers.test.tsx` (rows 4, 5, 6, 9, 14, 16, 17), `ui/fltnolen-mark.test.tsx`, `state/warnhide-published.test.ts` (the preview) |
| A published day: the version's hides, the face, the pending axis, the load, the history line | `validate.ts faceWarn` / `versionFaceWarn` / `HOOKS.issuedWarn` / `HOOKS.hideNow`, `publish.ts hidePending`, `drafts.ts loadVersionToWorkingCopy`, `ui/pendlist.ts`, `state/changelines.ts`, `undo/describe.ts` | `state/warnhide-published.test.ts` (WH7–WH9, WH11, WH12), `ui/latepub.test.tsx`, `ui/availwin.test.tsx`, `engine/schema.test.ts` |
| The week's edge | `engine/weekctx.ts dayHidesIn`, `validate.ts shownOf` (`xwk`) | `state/warnhide-published.test.ts` (WH12 — draft and published next Monday) |
| **After the walk** — the board's stand-by flying seat (AVALON, BB, SC SPARE) rings for its own rule only, as the week's does | `ui/html.ts exemptLineOwn` (one body), `ui/board-html.ts sbSlot` | `ui/warnhide-readers.test.tsx` "row 6, the BOARD" ×2 — red before the fix |
| **After the walk** — the load's confirm and a look's "N pending" count only the PENDING hides the load will undo | `engine/publish.ts dayDiscardCount`, `hidePending` (`HOOKS.hideDiffTo` removed) | `state/warnhide-published.test.ts` "the load's confirm never counts a hide that is already published" — red before the fix; "…counts the hides THAT version will change" kept |
| **After the walk** — the To go out line's tap lands on the warning's own line | `engine/publish.ts dayPendingItemsIn` (`warnline:<key>`), `ui/interactions.ts jumpToChange` → `jumpToWarnLine` | `state/warnhide-published.test.ts` "a tap on the pending line …" — red before the fix; `e2e/warnhide.spec.ts` "lands on the struck line" (both widths; break B31) |
| **After the walk** — a history line's own words and its from → to keep a gap | `ui/ChangesWindow.tsx EntryLine` | `ui/histlist.test.tsx` — red before the fix |
| **After the walk** — Undo of a hide refuses, naming who, after another person changed that day's hides; another day never blocks (D148) — the machinery was already right, now pinned for a hide | `undo/timeline.ts` (unchanged) | `state/sched-dayrecords.test.ts` "Undo of a hide, after another person changed that day's hides" |
| **After the final reads** — a stored amendment's entry may be a `hide`: the declared shape says so | `engine/schema.ts AlDiffEntry`; `docs/data-schema.md` | `engine/schema.test.ts` "an amendment that carries a hidden warning …" — red before the fix |
| **After the final reads** — a next-day mark is checked against itself (the man, the rule, the words), across the week's edge too | `engine/markcheck.ts` | `engine/warnhide.test.ts` "a mark that crosses the week's edge is checked against itself" — red before the fix |
| **After the final reads** — next Monday's hides are worked out once per saved copy, not on every ask | `engine/weekctx.ts dayHidesIn` | `state/warnhide-published.test.ts` "next Monday's hides are read once per saved copy" — red before the fix |
| **After the final reads** — the To go out line says who hid it and when | `ui/pendlist.ts pendItemWords` | `state/warnhide-published.test.ts` WH8's first test — red before the fix |
| **After the final reads** — the run's forward mark follows next Monday's hide (already true; now tested); Undo / Redo judged on the bundle | — | `state/warnhide-published.test.ts` "the 7-day run's forward dotted mark …", both WH11 tests |

## 4. The roll-call — every place a warning is drawn, counted or flagged
The thing this feature attaches to is A WARNING. This is a feature that takes marks AWAY, so the three columns are:
does the place **follow the hide** (seen in the running build), is it **named by a test**, and was its **wire cut** once
(§6). The rows are the plan's §5 (a sweep of every reader of the warning bundle). **No blank cells.**

| # | Where a person sees it | Follows the hide — seen in the walk | The test that names it | Break |
|---|---|---|---|---|
| 1 | Every puck's ring, chip, dashed ring, dotted mark — the week and the board: flying seats, duty / sim / ground / programme seats and extras, the Available-crew grid, SANS cards, Unavailable / Personal Inputs rows | YES — A 11–20, the sweep (31 lines), the dashed ring; week and board read side by side | `engine/warnhide.test.ts` (WH3, WH13), the marks guard after every validate of both suites, `e2e/warnhide.spec.ts` | B3, B4, B29 |
| 2 | The crew list beside the week and the board | YES — A 11, 16, 20 (phone: the crew drawer) | `engine/warnhide.test.ts` (it reads the same maps) | B3 |
| 3 | The ALL AVAIL window's pucks | YES — A 10, B 10 | `ui/availwin.test.tsx` | B3 |
| 4 | The ALL AVAIL window's reason under a puck, "N men are flagged" | YES — A 10 (red → amber → plain, "5 men are flagged" → 4), B 10 | `ui/warnhide-readers.test.tsx` row 4 | B17 |
| 5 | An exempt duty desk's own ring (AVALON / BB desk), week and board | YES — A 9 | `ui/warnhide-readers.test.tsx` row 5 | B15 |
| 6 | An exempt flying line's own ring (SC SPARE, AVALON, BB) — week AND board | week YES — A 8. **Board: MISSING → FIXED** (finding 1: the board never read the "own rule" at all — on `main` too); re-walked §5.3 | `ui/warnhide-readers.test.tsx` row 6, and "row 6, the BOARD" ×2 (red before the fix) | B16; the board's by red-first |
| 7 | The amber time box of a flying line that takes off and lands at the same time — week, board, the next-week preview | YES — A 19 (week and board), C 4 (preview, next Monday a draft), C 5 (next Monday published). Not drawn on a phone's preview: there is no preview on a phone | `ui/fltnolen-mark.test.tsx`, `state/warnhide-published.test.ts` (WH12, the preview) | B22, B23 |
| 8 | The day list on Edit Schedule and View-only Sched: the count, the worst colour, the rows | YES — A 21, 18; C 28, 27 | `ui/warnmute-week.test.ts` (WH4–WH7), `e2e/warnhide.spec.ts` (painted) | B5, B6 |
| 9 | "also flagged on Tue, Wed" and the list narrowed to one man | YES — A 2 (at once on ✕ and on ↺; a clean puck opens Monday only) | `ui/warnhide-readers.test.tsx` row 9 and "row 9, live" | B18, B26 |
| 10 | "new once signed" / "goes away once signed" rows | MUST NOT change, because a hide is its own pending line, never a "new" or "gone" warning — B 40: never a second line | `state/warnhide-published.test.ts` ("a hide alone draws no … row") | B11 (the comparison) |
| 11 | The cross-day rows "Breaks <tomorrow>" on the day that caused it | YES — A's sweep (Monday's dotted mark and its "Breaks Tuesday" row go with Tuesday's breach and come back), C 6, C 7 (across the week's edge) | `engine/warnhide.test.ts`, `state/warnhide-published.test.ts` (WH12) | B24 |
| 12 | The board's issues panel: the count, the colour, the rows | YES — A 22, 25 (one shared state with the week; resized by its splitter; the fold on a phone) | `ui/warnmute-week.test.ts` (the board's panel) | B7, B8 |
| 13 | The day-info popup (ⓘ) | YES — A 23, B 23 (each face its own hides; all hidden: "Nothing flagged — this day is clean ✓" over four struck lines) | `ui/warnmute-week.test.ts` | B9 |
| 14 | Insights: the week's total, by type, by day | YES — A 24 (33 → 32 → 33; the three agree). On View-only Sched it reads the WORKING copy on every number — recorded, a question for him (`[INSIGHTS-WHICH-COPY]`) | `ui/warnhide-readers.test.tsx` row 14 | B21, B30 |
| 15 | The Logic page's "fired N×" | MUST NOT change, because it says how often a RULE fired, not how many issues a day shows — C 44: "fired 2× · Mon, Tue" with every Tuesday line hidden | — (left as it is, plan §10) | — |
| 16 | The names lit while a day's box is open; a tapped line lighting its crew | YES — A 25 (an open box does not light a hidden line's man; the tapped struck line does, and brings him on screen) | `ui/warnhide-readers.test.tsx` row 16 | B19 |
| 17 | The message and the pulse after a drop that raises a warning | YES for the warning — A 26: no red message, no pulse, no ring, the line back already struck. The drop's own amber "already on …" note still shows — recorded, a question for him (`[WARN-HIDE-DROP-NOTE]`) | `ui/warnhide-readers.test.tsx` row 17 | B20 |
| 18 | The crew list's strike and reason before a drop | MUST NOT change, because it is the rules' answer about a man who is busy, asked of the RAW pass — A 26: the same words the amber note repeats | `engine/warnhide.test.ts` (the raw bundle kept) | — |
| 19 | The pending line "Warnings on this day changed" | MUST NOT change, because it compares the RAW slices — B 40: never appears beside a hide | `state/warnhide-published.test.ts` (`warnDelta` stays empty) | B11 |
| 20 | A published day on View-only Sched; the 👁 look at a version, week and board | YES — B 37–43, 23; C 27. **The look's "N pending" chip and the load's confirm: MISCOUNTED → FIXED** (finding 3) | `state/warnhide-published.test.ts` (WH7–WH9), `ui/latepub.test.tsx` | B12, B13, B14, B28 |
| 21 | A guest's View-only Sched | YES — C 27 (no issues bar and no button; the puck plain or flagged to match the member's face) | — (a guest is drawn no list, before and after; his pucks read the same maps) | B3 (the maps) |
| 22 | The printed schedule (PDF) and the CSV | MUST NOT change, because neither carries a warning, a ring or a chip — C 44: identical to the letter before and after | — (nothing to wire) | — |
| 23 | The Inputs calendar, the Medical view, OIL Earn mode, the Leave War, the Tracker | MUST NOT change, because none draws a warning flag — C 44, 44b (Leave War page, every OIL tracker figure, the saved rows: identical) | — | — |
| 24 | The top-bar counters | MUST NOT exist (20 Aug 26) — A: no count of issues anywhere but the day's bar, the board's heading, the ⓘ popup, Insights and the ALL AVAIL footer | `ui/app.test.tsx` | — |
| 25 | The ✕ / ↺ itself; a tap on a row | YES — A 21, 22, 25; C 31 (Undo / Redo from the top bar and the board) | `ui/warnmute-week.test.ts`, `state/warnmute.test.ts`, `e2e/warnhide.spec.ts` (the ↺ on top) | B29 |
| 26 | **(added by the walk)** The To go out line "Warning · … flagged → hidden" and its tap | the line YES — B 40. **The tap: MISSING → FIXED** (finding 4); re-walked §5.3. **Who hid it and when: MISSING → FIXED** (Fable's final read F2, §10) | `state/warnhide-published.test.ts` ("a tap on the pending line …", red before the fix) | B10; the tap's by red-first |
| 27 | **(added by the walk)** The change history's line for a hide | YES — C 30 (who and when, under "Tue · The day"). Its words ran into "hidden → flagged again" with no gap → FIXED (finding 6) | `state/warnhide-published.test.ts` (WH11), `ui/histlist.test.tsx` (red before the fix) | B25 |

**The door check.** Hide: ✕ on a shown line — Edit Schedule's list and the board's panel, a scheduler, the working copy
only (A 21, 22). Flag again: ↺ on the struck line, the same places (A 21, 22, 25). Undo / Redo: the top bar's pair and
the board's (C 31). The To go out line's tap (B 40 — the door that was missing). NO door on View-only Sched, a look at
a version, a member's or a guest's screen: the line is drawn, the button is not (A V1–V3, B 43, C 27 — a member's tap
on the line changes nothing).

## 5. The walk
### 5.1 How it was walked
The production build, frozen in `dist-wh` (commit 6e151a4e — the build with Astra's two predicted gaps already fixed),
served locally on three ports, one fresh world per scenario, driven in a scripted real browser (D17) by three walkers
in parallel (D16), each at desktop 1440×900 AND phone 390×844. Every fixture through the app's own controls (the ✕ / ↺,
typed boxes, the board's "+ Wave" / "+ Block" / seats and crew list, drags, the four sign-off selects, Publish day /
Publish AL / Unpublish, the plans selector and "Load onto working copy", Undo / Redo, Admin → Users, the guest switch).
A struck line was asserted as PAINTED (computed `text-decoration-line`), a button as the topmost thing at its own
centre, a flag by its ring and chip on screen; every picture was opened. The scenarios were designed by ASTRA, not by
the builder (44 — `docs/superpowers/briefs/2026-10-01-warn-hide-kept-scenarios-astra.md`); the brief:
`…-walk-brief.md`. The drivers: `scripts/handpass/wh-lib.mjs` and each walker's `wh-a-*`, `wh-b-*`, `wh-c-*`.

| Walker | Its scenarios | Steps | Pictures | Its sheet |
|---|---|---|---|---|
| A — the lists, the counts and the pucks, on days not yet published | 2, 8–26, 34, 35, 36, the 31-line sweep, the dashed ring | 163 rows: 143 PASS · 5 FAIL (two findings) · 7 not walked · 8 information | 280 (`docs/img/handpass/2026-10-01-warn-hide/a/`) | `docs/handpass/parts/wh-a.md` |
| B — the publish line | 1, 3 (+ 3c–3f), 10, 23, 33, 37–43 | 190 PASS · 10 FAIL (two findings, each at both widths) · 38 recorded | 383 (`…/b/`) | `docs/handpass/parts/wh-b.md` |
| C — kept for everyone, and the edges | 4–7, 27–32, 44, 44b, the saved rows | 187 PASS · 2 FAIL (one finding, both widths) · 8 recorded / not walked | 298 (`…/c/`) | `docs/handpass/parts/wh-c.md` |

**Both orders across the publish line** (order §7.4): hide → publish (37); publish → hide → amend (38); hide → publish →
flag again → amend (39); after each, the working copy, the published face as the member, and every count of pending;
Unpublish (41); Load of the current version and of an older one (42, 3); Undo, Redo and a reload after each (31).

### 5.2 What the walk found, and each disposition
| # | Found by | What the screen did | Disposition |
|---|---|---|---|
| 1 | A, scenario 8 (`a/dk-09-8c-board-avalon-copy-plain.png` beside `a/dk-11-8d-week-avalon-copy-plain.png`; baseline `a/dk-14-8x-…`) | On the BOARD a stand-by seat (AVALON, BB, SC SPARE) wore the man's flags from elsewhere in his day; Edit Schedule showed only the seat's own. So with that seat's warnings hidden the week went plain and the board stayed ringed red. **Already on `main`** — the board's cockpit seat never read the "its own rules and nothing else" rule (owner, 11 Aug 26; D94) | **FIXED, red first** — one body for the week and the board (`html.ts exemptLineOwn`); `ui/warnhide-readers.test.tsx` "row 6, the BOARD" ×2 failed before it. Re-walked (5.3) |
| 2 | A, scenario 26 (`a/dk-07-26b-exact-hidden-clash-recreated-silent.png`) | A drop that recreates a clash already hidden: no red message, no pulse, no ring, the line back already struck, the count unchanged — but the drop's own amber note "Saint — already on APPOINTMENT 14:00–16:00" | **LEFT, a question for him** — the note is not the warning; it is the reason the crew list prints under a busy name, said once at the drop. Filed `[WARN-HIDE-DROP-NOTE]`, on his look card |
| 3 | B, scenarios 3c, 3d, 43 (`b/dk-28-s3d-1-look.png`, `b/dk-29-s3d-1-load-pressed.png`, `b/dk-20-s3c-1-look.png`) | "Load onto working copy" of an OLDER version counted every hide that differs from that version as "your unpublished edit": with nothing pending a look at the Original read "1 pending" and "Discard 1 edit & load"; with one pending, "2". The load itself did the right thing; the number and the words were wrong. (Astra's own case 3 passed — the fix made for it over-corrected) | **FIXED, red first** — the count is the PENDING hides the load will undo (`publish.ts dayDiscardCount`); `state/warnhide-published.test.ts` "the load's confirm never counts a hide that is already published" failed before it. Re-walked (5.3) |
| 4 | B, scenario 40 (`b/dk-05-s40-pend-tapped.png`, `b/dk-15-s40-3t-tap-longday-line.png`) | A tap on the To go out line "Warning · … flagged → hidden" did not go to the warning's line: a warning with no seat of its own could not be tapped at all (under "Tap a change to go to it"), and one with a seat lit the seat and left the day's list shut | **FIXED, red first** — the item carries the warning itself and the tap opens the day's list on its line, the view landing on the LINE (`interactions.ts jumpToWarnLine`); `state/warnhide-published.test.ts` "a tap on the pending line …" failed before it; adjusted once after the first re-walk and pinned in the browser (5.3) |
| 5 | C, scenario 32 (a) (`c/dk-01…03-32-*`) | Two schedulers in two TABS of one browser: A's Undo, on a tab that had not reloaded, did not refuse — it saved A's stale Tuesday over B's hide. Not special to Undo or to hides: a plain day-note edit from the stale tab wiped B's hide the same way | **NOT THIS CHANGE'S — the known two-tabs gap** (`docs/data-schema.md` §known gaps, item 12: each tab writes whole records, the later write wins; the database step's day lock — D355, D450 — is the fix; `[DB-READINESS]`). The rule itself (D148: Undo refuses and says who) is **pinned** for a hide by `state/sched-dayrecords.test.ts` "Undo of a hide, after another person changed that day's hides" — the same day refuses naming him, another day never blocks. On his look card as a known limit |
| 6 | C, observation (`c/ph-07-30-4-A-changes-window.png`) | In the changes window the warning's words ran straight into the change: "…debrief assumed)hidden → flagged again" | **FIXED, red first** — a gap between a line's own words and its from → to (`ChangesWindow.tsx`); `ui/histlist.test.tsx` failed before it. Re-walked (5.3) |
| 7 | A and C, observation | The mark on a line that takes off and lands at the same time is AMBER on screen; the plan, the register and the comments called it "the red time box" | **CORRECTED** in the live documents and comments (the register, `ui-contracts.md`, `feature-impact.md`, three comments, one test name). The plan and the briefs are records and stay as written |
| 8 | B, observation | During a 👁 look at an older version the crew list beside the day still wears today's flags (it is the working copy's tool) | **LEFT — as before this change**; the look is of one day, the crew list is the page's |
| 9 | B, scenario 1 | Insights on View-only Sched reads the working copy: one issue fewer than the published day beside it while a hide waits | **LEFT, a question for him** — `[INSIGHTS-WHICH-COPY]` (filed before the walk, from Astra's design) |

Also seen and correct, said so it is not re-found: four signed over one pending hide, a second hide makes them fall, ↺
on the second brings all four back (the day is again exactly what they signed — D98); on a week never saved before, the
first hide also writes that week's own header row besides the day's; Sunday's "Breaks Monday" line is not counted in
Sunday's "N issues" (as before this change) and follows Monday's hide.

### 5.3 The re-walk of what the fixes touched
The build rebuilt with the four fixes and re-frozen; the walkers' OWN scripts re-run against it at both widths
(pictures `docs/img/handpass/2026-10-01-warn-hide/rewalk/`, results `docs/handpass/parts/wh-rewalk.json`).

| What was re-walked | The walker's script | Desktop | Phone |
|---|---|---|---|
| Finding 1 — the board's stand-by seat: scenario 8 again, its baseline with nothing hidden, and scenario 9 beside it | `wh-a-13-exempt.mjs` | 11 PASS | 11 PASS |
| Finding 3 — the load's confirm: 3, 3c, 3d, 3e, 3f, 42 | `wh-b-42-3.mjs` | 18 PASS | 18 PASS |
| Finding 3 — the "N pending" chip of a look at each of three versions: 43 | `wh-b-43.mjs` | 9 PASS | 9 PASS |
| Finding 4 — the tap on the To go out line, a warning with a seat and one with none: 40 | `wh-b-40.mjs` | 12 PASS | 11 PASS · 1 that is the script's order, not the app (below) |
| Finding 6 — the gap in the changes window: 30 | `wh-c-30.mjs` | 5 PASS | 5 PASS |

**109 steps PASS, 212 pictures**, no error on screen. Three things the re-walk itself turned up, said so they are not re-found:
- **The first fix of finding 4 was not enough.** It opened the list and focused the line, then went on to the man's puck
  as a tap on the line does — and that pan carried the struck line off the screen (`rewalk/dk-05-s40-pend-tapped.png`
  from the first re-run showed it). Adjusted: the view lands on the LINE, marked for a moment; re-walked again, PASS at
  both widths; pinned by a browser test judged where the view comes to REST (the break B31: the pan put back → red at
  both widths — the test's first form passed for the wrong reason, catching the line before the pan moved it).
- **On a phone the tap now shrinks the changes window to its slim bar** so the line can be seen (D167 — as every other
  tap that takes the schedule somewhere). The walker's script went on to read "All changes" from the shrunk window and
  found nothing: the one FAIL left in the table (`s40-ph 40.1g`) is that, and the same check passes on the desktop.
- **A walker's script carried a backspace character in one pattern** (a `\b` passed through a shell — the trap of
  observation 411), so its check of the load's message read FAIL beside the right words ("1 unpublished edit
  replaced"). Repaired and re-run: PASS.

## 6. The break tests (order §8.4) — one wire cut at a time, a NAMED test must go red
Each break edits one source line, runs the named test file, and puts the line back (the script and its raw results:
the session scratchpad; the source is unchanged after it — `git status` shows no `src` edit from it). **31 of 31 red** (B1–B30 before the walk; B31 after it, in the browser).

| # | The wire cut | File | Result | The first test that went red |
|---|---|---|---|---|
| B1 | the boot does not read the saved hides back | `state/store.ts` | RED | src/state/warnhide-kept.test.ts > WH1 (D469) — a hidden warning is kept with its day, across a reload > a flag-again is kept across a reload as well |
| B2 | a sign-in clears the hides again | `state/view.ts` | RED | src/state/view-reset.test.ts > the reset registry > resetViewState('session') clears every session-scoped field |
| B3 | a hidden warning keeps its marks (the replay skips nothing) | `engine/validate.ts` | RED | src/engine/warnhide.test.ts > WH10 — the key: tied to the situation, not to a label > a rename of the man it names keeps the warning hidden |
| B4 | a mark filed under the wrong rule (the same-day tight turn as CREW_TIGHT) | `engine/validate.ts` | RED | src/engine/warnhide.test.ts > WH10 — the key: tied to the situation, not to a label > a rename of the man it names keeps the warning hidden |
| B5 | the week list counts a hidden warning | `ui/html.ts` | RED | src/ui/warnmute-week.test.ts > Edit Schedule's list > WH4, WH5 (D469 / D472): the hidden line stays in its place, struck out, with ↺ — and the coun… |
| B6 | the week list does not strike the hidden line | `ui/html.ts` | RED | src/ui/warnmute-week.test.ts > Edit Schedule's list > WH4, WH5 (D469 / D472): the hidden line stays in its place, struck out, with ↺ — and the coun… |
| B7 | the board panel counts a hidden warning | `ui/board.ts` | RED | src/ui/warnmute-week.test.ts > the board's panel — one set of hides, both surfaces (29 Aug 26) > a hide made on the week shows on the board: 3 issu… |
| B8 | the board panel does not strike the hidden line | `ui/board.ts` | RED | src/ui/warnmute-week.test.ts > the board's panel — one set of hides, both surfaces (29 Aug 26) > a hide made on the week shows on the board: 3 issu… |
| B9 | the day popup counts a hidden warning | `ui/html.ts` | RED | src/ui/warnmute-week.test.ts > the day-info popup (ⓘ) > counts what is shown and strikes the hidden line |
| B10 | the hide is missing from the counting list (the day count, To go out) | `engine/publish.ts` | RED | src/state/warnhide-published.test.ts > WH8 (D471) — a hide on a published day is ONE pending change, on every count > the amendment that carries it… |
| B11 | the hide is missing from the comparison (the publish button, the sign-offs) | `engine/publish.ts` | RED | src/state/warnhide-published.test.ts > WH7, WH8 — Unpublish, Load onto working copy, a look at an older version > Unpublish falls back to the versi… |
| B12 | the published face reads the WORKING hides | `engine/validate.ts` | RED | src/state/warnhide-published.test.ts > WH8 (D471) — a hide on a published day is ONE pending change, on every count > a hide of a LIVE warning (Out… |
| B13 | a version does not keep its hides | `engine/validate.ts` | RED | src/state/warnhide-published.test.ts > WH7, WH8 — Unpublish, Load onto working copy, a look at an older version > Unpublish falls back to the versi… |
| B14 | the load leaves the hides alone | `engine/drafts.ts` | RED | src/state/warnhide-published.test.ts > WH7, WH8 — Unpublish, Load onto working copy, a look at an older version > Load onto working copy puts the d… |
| B15 | an exempt desk reads a hidden warning (row 5) | `ui/html.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 5, 6 — the exempt rows that ring by their OWN rule (WH3) > row 5 — an AVALON duty desk holding a… |
| B16 | an exempt flying seat reads a hidden warning (row 6) | `ui/html.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 5, 6 — the exempt rows that ring by their OWN rule (WH3) > row 6 — an AVALON flying seat holding… |
| B17 | the ALL AVAIL window's reason reads a hidden warning (row 4) | `ui/html.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 4 — the ALL AVAIL wind… |
| B18 | a puck's tap opens a day whose only warning is hidden (row 9) | `state/view.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 9 — a tap on his puck… |
| B19 | an open box lights the men of a hidden warning (row 16) | `state/view.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 16 — an open day box l… |
| B20 | the drop message announces a hidden warning (row 17) | `state/dropflag.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 17 — a warning that ar… |
| B21 | Insights counts a hidden warning by day (row 14) | `engine/insights.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 14 — Insights: the day… |
| B22 | the red time box stays while its warning is hidden (row 7) | `ui/html.ts` | RED | src/ui/fltnolen-mark.test.tsx > the line itself says the times cannot be right — not only the list on the right > WH3 — while that warning is HIDDE… |
| B23 | the next-week preview ignores next week's hides (row 7) | `ui/peek.ts` | RED | src/state/warnhide-published.test.ts > the marks that cross the week's edge follow next Monday's own hide (Astra 2, Fable F2) > WH12 — the next-wee… |
| B24 | the week-edge mark ignores next Monday's hides (WH12) | `engine/validate.ts` | RED | src/state/warnhide-published.test.ts > the marks that cross the week's edge follow next Monday's own hide (Astra 2, Fable F2) > Sunday's "Breaks Mo… |
| B25 | the change history writes no line for a hide (WH11) | `state/changelines.ts` | RED | src/state/warnhide-published.test.ts > WH11 — the change history says who hid what (D469 — "until another person unhides it") > one line per hide a… |
| B26 | "also flagged on" is not re-read at the hide (row 9, live) | `state/view.ts` | RED | src/ui/warnhide-readers.test.tsx > row 9, live — "also flagged on" follows the ✕ and the ↺ while a man is focused (WH3) > hiding every warning that… |
| B27 | the hide key is not rename-proof (WH10) | `engine/warnhide.ts` | RED | src/engine/warnhide.test.ts > WH10 — the key: tied to the situation, not to a label > a rename of the man it names keeps the warning hidden |
| B28 | the load's confirm counts against the current version only | `engine/publish.ts` | RED | src/state/warnhide-published.test.ts > WH7, WH8 — Unpublish, Load onto working copy, a look at an older version > the load's confirm counts the hid… |
| B29 | a toggle does not re-validate (the bundle as shown goes stale) | `state/view.ts` | RED | src/ui/warnmute-week.test.ts > Edit Schedule's list > WH4, WH5 (D469 / D472): the hidden line stays in its place, struck out, with ↺ — and the coun… |
| B30 | Insights by type counts a hidden warning (row 14) | `engine/insights.ts` | RED | src/ui/warnhide-readers.test.tsx > roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5) > row 14 — Insights: the day… |
| B31 | the To go out line's tap goes on to the man's puck (the first fix's behaviour) | `ui/interactions.ts` | RED | e2e/warnhide.spec.ts > WH8, D99 — … a tap on "Warning · … flagged → hidden" in To go out lands on the struck line (desktop and phone) |

The four fixes made after the walk were each written RED FIRST (§3), which is the same proof by the other road.

## 7. Errors seen
None — no console error, page error, failed request or native dialog in any run of the walk or the re-walk.

## 8. What was NOT walked, and why
- **Undo's refusal after another person's hide (D148)** — unreachable through the app's doors in this build: there is no
  server, a second tab learns nothing until its reload, and a sign-out empties the Undo list. Pinned by a test instead
  (finding 5). **Only the database step can prove it in the running app.**
- **The next-week preview on a phone (scenarios 4, 5)** — it is not drawn on a phone.
- **A drag on a phone (scenario 26)** — the walk's phone has no drag; the drop message is the same body.
- **A BB seat's own warning (8)** — a new BB wave has no times and raised nothing of its own; AVALON and SC SPARE were.
- **A duty desk with no times (14)** — every demo desk carries times.
- **One man wearing BOTH tight-turn kinds at once (17)** — each kind was walked on a different man.
- **The Amendments panel on a phone (40)** — it is not drawn at phone width; its count was read on the desktop.
- **Saving the PDF and the CSV as files (44)** — the print page and the CSV text were read as the buttons built them.
- **An iPhone** — the walk ran in Chromium at a phone's width. Nothing here redraws under a held finger, so no engine
  difference is expected (order §7.9); the struck line's look on his own phone is on the look card.
- **Hides stored by an older build** — not a finding, by ruling (D56): they stop matching, and the data is cleared.

## 9. The gates
Watched, 1 Oct 26, under the PC lock — TWICE: on the code after the walk's fixes (commit 293eaa1f), and again on the FINAL code, after the two final reads' fixes. The final run:

| Gate | Result |
|---|---|
| Unit tests | **7553 / 7553** (473 files) — 7549 on the first run, before the reads' four new tests |
| Build (typecheck + build) | clean |
| The original's assertions (`tfin`) | **728 / 0** |
| Browser tests (e2e) | **518 passed**, 0 failed, 49 skipped |
| The Tracker's browser suite | **445 / 0** |
| Rule check | OK (WH1–WH13 each named by a test) |
| Document check | OK — every record accounted for; over its size tripwire by 903, deferred (D29: a code change never trims a document; `[DOCS-SIZE-PASS]`) |
| Speed check | **4 / 0** — board 1024 nodes ≤ 1150, week 5134 ≤ 5450 |

The first run read the same on every other line (tfin 728 / 0, e2e 518, smoke 445 / 0, perf 4 / 0).

## 10. The two final reads — both providers, blind to each other (D353: the published record and saved data)
Each was handed the finished code (commit 293eaa1f), this sheet and the brief
`docs/superpowers/briefs/2026-10-01-warn-hide-kept-final-read-brief.md`; neither saw the other's report.

| Reader | Verdict | Report |
|---|---|---|
| ASTRA | **REVISE** — 2 medium, 1 low; nothing wrong found in the engine, the published record, saved state or the other readers | `docs/superpowers/briefs/2026-10-01-warn-hide-kept-final-read-astra.md` |
| FABLE | **APPROVE** — 1 medium (a cost, not a wrong answer), 5 low; "no wrong flag, wrong count, wrong face, or lost / doubled hide found" | `docs/superpowers/briefs/2026-10-01-warn-hide-kept-final-read-fable.md` |

**Every finding, and its disposition** (each reproduced against the code before acting; new with this branch unless said):

| Finding | Who | Disposition |
|---|---|---|
| View-only Sched's Insights counts the WORKING copy, so a hide still waiting to go out already lowers it beside a published day that still shows the flag (MEDIUM) | Astra 1 | **CONFIRMED — LEFT FOR HIM.** Insights has always read the working copy on every page (a seat change waiting on a published day moves it the same way); what is new is that a hide now moves it too. Which copy Insights should count there is a product question — `[INSIGHTS-WHICH-COPY]`, first on his look card. Astra would make it follow the published day |
| The declared shape of a stored amendment's entries omitted the new kind `hide`, though the app saves it (MEDIUM / LOW) | Astra 2, Fable F5 — both | **FIXED, red first** — `engine/schema.ts AlDiffEntry`, the spec in `engine/schema.test.ts`, and a test that publishes, hides, issues the amendment and conforms it (it failed on the missing kind); `docs/data-schema.md` says so (D473) |
| The marks guard waved through any mark pointing across the week's edge (LOW) | Astra 3 | **FIXED, red first** — every next-day mark is now checked against itself (the man, the rule, the words) before the cross-week skip (`engine/markcheck.ts`); `engine/warnhide.test.ts` "a mark that crosses the week's edge is checked against itself" |
| Next week's whole saved copy was parsed again on every ask for the face once a mark crossed the week's edge — a cost on every repaint, nothing wrong on screen (MEDIUM) | Fable F1 | **FIXED, red first** — the answer is remembered against the saved copy itself (`engine/weekctx.ts dayHidesIn`); `state/warnhide-published.test.ts` "next Monday's hides are read once per saved copy" |
| The To go out line of a hide named nobody and no time, though the change history knew (LOW) | Fable F2 | **FIXED, red first** — `ui/pendlist.ts pendItemWords` reads the history's own line; asserted in WH8's first test; re-walked (below) |
| The 7-day run's forward dotted mark following next Monday's hide was promised and neither tested nor walked (LOW, a test gap) | Fable F3 | **TESTED — it holds.** `state/warnhide-published.test.ts` "the 7-day run's forward dotted mark follows next Monday's hide as well": Saint on six days running and next Monday; the mark carries Monday's own sentence, goes with its hide and returns. WH12's wording names it |
| The Undo / Redo tests judged the set of hides, not the bundle every surface reads (LOW, tests) | Fable F4 | **STRENGTHENED** — both WH11 tests now also assert the line's `off` and the puck's flag after Undo and after Redo |
| A LIVE warning worded differently on the working copy and on the issued face (a published neighbour with an unpublished change) is struck on Edit Schedule while the face keeps the flag until the neighbour's amendment is out (LOW, an observation — inherent in "tied to that exact warning") | Fable F6 | **RECORDED** — one paragraph in `docs/engine-rules.md` beside the hides axis. No code |

**Re-walked after these fixes** (the build rebuilt and re-frozen; pictures `docs/img/handpass/2026-10-01-warn-hide/rewalk2/`,
results `docs/handpass/parts/wh-rewalk2.json`): scenario 40 at both widths — the To go out line now carries who hid it
and when; scenario 6 on the desktop — Sunday's "Breaks Monday" mark still follows next Monday's hide with the answer
remembered. **30 steps PASS, 61 pictures, no error on screen** (`rewalk2/dk-04-s40-pend-togoout.png`: "Warning · Static — … flagged → hidden · Saber · 1/10 19:34"); the one line left reading FAIL is the phone script's order again (§5.3).

## 11. His look — the "look here" card (five minutes, on the preview link)
Written as what he should expect to see, in the app's own words. The demo Tuesday (14 Jul) has four issues.
1. **Edit Schedule, Tuesday, open its issues bar and tap ✕ on "Static has a long work day".** The bar reads "3 issues"
   with no word about a hidden one; the line stays fourth in the list, struck out and grey, with ↺ beside it; Static's
   puck loses its grey ring and its L wherever he is drawn. Reload, or sign out and in: it is still hidden.
2. **Open the Scheduler Board on Tuesday.** The same line is struck there too, the count agrees, and ↺ on either
   screen flags it again on both.
3. **Hide all four.** The bar goes quiet — "✓ No issues" — and still opens the list of four struck lines.
4. **Sign the four names, Publish day, then hide another warning.** The day reads "1 pending", the four sign-offs
   fall, the changes window's To go out tab says "Warning · … flagged → hidden" (tap it: the day's list opens on that
   line). View-only Sched keeps the flag until you publish the amendment — then the line is struck there, with no button.
5. **On his own iPhone:** the struck line and its ↺ — is the ↺ easy to hit, is the grey readable?

**Three things for him to answer, none blocks the merge** *(the first ANSWERED the same evening — D477: Insights counts
the schedule the page is showing; the build is `[INSIGHTS-WHICH-COPY]`, its own small job after this merges)*:
- On View-only Sched, Insights counts the working copy, so while a hide waits to go out it reads one issue fewer than
  the published day beside it. Should it count the published schedule there? Astra's final read rates this the one
  thing it would change (medium); it has always worked this way for every other waiting change. (`[INSIGHTS-WHICH-COPY]`)
- A drop that recreates a clash he already hid shows a small amber note ("Saint — already on APPOINTMENT 14:00–16:00"),
  though the warning itself stays hidden and silent. Keep the note, or silence it too? (`[WARN-HIDE-DROP-NOTE]`)
- Known limit until the database: two browser tabs open at once overwrite each other's saves, a hide included; and
  Undo's "someone else changed this" refusal can only be seen for real once there is a shared database (it is tested).
