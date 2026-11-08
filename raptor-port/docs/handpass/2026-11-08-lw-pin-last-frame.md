# [LW-PIN-LAST-FRAME] — the pinned row the browser shows by itself, for keeps (D1870)

Branch `claude/lw-pin-last-frame` (chat 16, from chat 14's prototype), pull request 694. Pictures:
`docs/img/handpass/2026-11-08-lw-pin-last-frame/` (the frame measure at its top; the walk under `walk/`).

## The eight answers and the tier

1. Money — NO: nothing of OIL, leave balances or who counts as present is read or written; the change is where a heading
   copy is painted.
2. The published record — NO: nothing publishes, signs or amends.
3. Saved data — NO: nothing stored; the copy's state lives on the page only.
4. A shared drawer — NO: each screen draws its own copy (the Leave War's `.mxfixed`, Quals' `.qfixed`); no routine is
   shared between them.
5. A new gesture or mode — NO: the same taps on the same headings; no new control.
6. A new surface — NO: the same pinned rows, drawn a new way.
7. Roles — NO: no permission is read or changed.
8. The warning list — NO.

**Tier: WALK** — not cosmetic on one surface: the layering of two dense screens changes (what sits over the month
strip, the windows over the grid, a pinch, Rearrange), with the screen reader and the keys. The job's brief asked for
the full check's readers too: Astra's code read and a fresh, blind Opus read.

## The roll-call — the pinned copy of each heading

The thing: the pinned copy of the heading (the Leave War's dates row, `[data-testid="sticky-head"]`; Quals' heading,
`[data-testid="qsticky-head"]`), now always in the page and shown by the browser on the page's own scroll.

| Place it is drawn | SHOWS exactly when the real row is under the top bar | USABLE (a tap on the pinned copy) | PAINTED on the same pixels |
|---|---|---|---|
| Leave War grid, desktop 1536 | has it — L1, L10, L12, L-plain, L-foot; after a narrowing it showed 37px early (L22), fixed red-first | has it — a date tapped on the copy opens that day (L13) | has it — the copy one height with the row (L-height), no seam (L11) |
| Leave War grid, phone 402 | has it — L1, L10, L12, L-foot (Chromium and WebKit), L18 | has it — L13 | has it — L-height, L11 at scale 2 and 3, WebKit too |
| Leave War's other tabs (Approvals, Balances, OIL, My Leave) — must not show | must not, because the copy belongs to the grid — none shown on any tab, scrolled (L19) | must not — nothing to tap (L19) | must not — nothing painted (L19) |
| Leave War, a window over the grid (day, person, keypad, menus) | has it — the copy stays pinned under each window, and the window over it (L20) | must not, because the window is in front — a tap lands on the window (L20) | has it — the window drawn over the copy, no copy over the window (L20) |
| Leave War, mid-pinch (phone) | has it — shown by the pinch's rule, every step (L4/L5, seven cases) | must not, because the fingers are down — nothing taps mid-pinch | has it — the copy stretched with the grid (L4/L5 mid pictures) |
| Quals, desktop 1536 | has it — Q1, Q10, Q14, Q22b, Q-plain, Q-foot | has it — a heading tapped on the copy sorts as the real one (Q14) | has it — columns over columns (Q12, Q17); the box 1px taller than the heading (Q-height), the same on `main` |
| Quals, phone 402 | has it — Q1, Q4, Q10, Q22a, Q-foot (Chromium and WebKit), Q18 | has it — Q14 | has it — Q11 at scale 2 and 3, Q12; Q-height as above |
| Quals, a page too short to scroll | must not, because nothing passes under the bar — hidden, one man found (Q9) | must not — hidden (Q9) | must not — nothing painted (Q9) |
| Quals, mid-pinch (phone) | has it — Q4, Q5 (pinch out, in, across the point, cancelled) | must not — fingers down | has it — the mid-pinch pictures (Q4, Q5) |
| Both, with reduce motion on | has it — hidden at rest, shown once pinned (L1, Q1) | has it — L1, Q1 tapped pinned | has it — L1, Q1 pictures |
| Both, a browser without the scroll timeline (the old way) | has it — the old way, full and partial stand-ins (L24, Q24) | has it — L24, Q24 | has it — L24, Q24 pictures; a stand-in, not a real other browser |
| Both, with the warning bands under the top bar | has it — the copy at the band's foot, from the first frame (L6, Q6, `?savefail`) | has it — L6, Q6 | has it — L6, Q6 pictures |
| Both, member and admin | has it — L23, Q23, and the plain-user rounds as both (L-plain, Q-plain) | has it — a member sorts Quals from the copy (Q23) | has it — L23, Q23 pictures |

Rows by kind of change (§6): **a component with a second home on a page** — the copy kept in the page: every test's
query scoped to its container (done in the build: the six older tests). **A new floating surface** — the copy is a fixed
layer: what it can sit over is the third column above.

## The five sizing lines

1. **Type:** E (the layering of two pinned rows), with C's orders — the copy has a lifetime of states (at rest, crossing
   the meeting point, pinned, pinching, reduce motion, a page too short to scroll, a browser without the timeline). No
   new control.
2. **What only a walk could find here:** the painted frames at the meeting point (the measure, below); the copy against
   everything that can stand over or beside it — the month strip, the warning bands, the windows and menus over the
   grid, Quals' notices and edit rows; a tap on the copy reaching the right date or column; the copy after something
   above the grid changes height without a scroll; a pinch part-way down; WebKit. The tests already cover: hidden at
   rest, shown once pinned, out of the keys while hidden, shown mid-pinch, the first frame, reduce motion, a page too
   short to scroll (the named tests below).
3. **What the ledger says:** chat 8's walk of D1789 (types D, E — one Sonnet walker, 13 scenarios, about 190k tokens,
   51 min) found one fault, the last painted frame, and only because the host opened the painted frames and overturned
   the walker's PASS; the 30 Oct 26 pinned-part sweep (E, C, A) found four faults and three wording finds, mid-pinch
   corners among them. Walks of pinned rows find their faults in painted frames and pinches: the host opens those.
4. **The walk chosen:** two Sonnet walkers at once, each in its own fresh browser context on the one frozen build
   (`dist-final` rebuilt from c23920f0d — the height-watch fix — served on port 4393, not rebuilt while they walk): **L, the Leave War** — Astra's
   scenarios 1, 3, 4, 5, 6, 8, 10–13, 15–20, 22–24 (their Leave War halves); **Q, Quals** — 1, 3, 4, 5, 6, 7, 9–12, 14,
   17, 18, 21–24 (their Quals halves). Each with the plain-user round (§7.0a). Sizes: desktop 1536 Chromium, phone 402
   Chromium (fingers over CDP), phone 402 WebKit (looks; WebKit's scripted touches drive no scroll — `walk-scripts.md`
   §4), and 2560 zoomed out for the Leave War (lesson 11); a browser without the scroll timeline for scenario 24 (the
   old way). Scenario 25 is the host's measure. Scenario 2 (Quals' shadow mid-pinch) and the rest of 4 and 5 are
   carried by the pinch tests and walked as pictures inside 4 and 5.
5. **After the walk:** its row in `docs/walk-ledger.md`.

### The lessons of §7.11, each covered or why not

1. States × readings — the lifetime in line 1 × shown / taps / keys / shadow: the walkers' scenario lists and the named
   tests.
2. A flick and a slow drag on the phone — scenario 10, 12; the measure's five runs each way.
3. What tells the person a press happened — a date's day panel opening, Quals' sort arrow: scenarios 13, 14, pictured.
4. A window that leaves the page working — the day and person windows over the grid, the page behind pressed: 20.
5. A row at its resting place against everything over it — the pinned copy under the top bar with the bands, menus and
   windows: 6, 20, 21.
6. Handed to the phone itself — YES: the browser now shows the copy on its own scroll. What only his iPhone draws: a
   momentum flick's frames and Safari's address bar folding away. His look on the trial is D1870 ("Blink; trial cures
   it"); what changed since — hidden by default, out of the keys while hidden, kept under reduce motion, the pinch's
   rules — goes on his look card. Scroll bars are not judged here.
7. Steered frame by frame against the phone's motion — no: this change removes the steering.
8. An approved drawing — none for these rows; no drawing check.
9. Heading against figures — the copy's columns over the body's columns: 12, 17, both sizes.
10. A page hidden and shown again — 18, WebKit too, the first frame pictured.
11. A reading that depends on what fits — the copy at the fit and the largest zoom (11, 16), and 2560 zoomed out.
12. Every page a window opens from — the windows over the grid opened from the grid: 20, 21.
13. A pinch part-way down, fingers drifting, mid-pinch pictures — 4, 5, both walkers.
14. Keyboard boxes found by searching the code — the copy's own buttons found in the markup; Tab through the heading at
    rest never lands in the hidden copy (3).
15. A bar over a scrolling area — the copy is one: its fill, in front, zoomed in and out, scrolled (11, 12); the pinned
    part sweep's states for the two rows.
16. A refusal at a box — none in this change.
17. A control that shows, hides or resizes part of a page — Manning, a group's fold, Quals' notices and edit rows: 7, 8,
    measured after each.
18. Printing or a download — none changed; Quals' Export only as a window over the row (21).
19. Every window closed each of its ways — ✕, Escape, a tap outside, touch WebKit and desktop: 20, 21.
20. A gesture the ways a hand makes it — 10 with its reversal, and the measure.
21. A test browser's touch is not his phone's — named on his look card (lesson 6).
22. Judged by what is drawn — the measure counts painted frames; the walkers judge pictures, never opacity alone.
23. What a tap opens on an ordinary day — a date's heading opens that day from the foot (D1143); a Quals heading sorts:
    13, 14, side by side on the real row and the copy.
The second 23 — the copy and the real row one height, at 402 with WebKit's letters and at 1536: both walkers.

## The frame measure (Astra's scenario 25)

Run 8 Nov 26 05:40–05:48Z under the checks lock (the PC otherwise quiet), `scripts/handpass/lwpin-frames.mjs`, 5 runs
each way per case: **before** = `main`'s pinning (chat 14's `dist-before`; the pinned rows' four files are the same on
`main` today — bringing `main` in changed none of them), label `main2`; **after** = this build (`dist-final`, built
from 110b3a2c2), label `final`. Results `docs/img/handpass/2026-11-08-lw-pin-last-frame/main2-results.json` and
`final-results.json`, the painted-frame sheets `main2-*.png` / `final-*.png` beside them.

| Case | Runs with a blink, before → after | Frames over 33.4 ms at 4× CPU, median of 5, before → after | Main thread's work, ms, before → after |
|---|---|---|---|
| Leave War, desktop 1536 | 10 of 10 → **0 of 10** | 15 → 15 | 1966 → 1843 |
| Leave War, phone 402 | 10 of 10 → **0 of 10** | 4 → 17 | 1098 → 958 |
| Quals, desktop 1536 | 10 of 10 → **0 of 10** | 1 → 0 | 273 → 221 |
| Quals, phone 402 | 10 of 10 → **0 of 10** | 1 → 8 | 373 → 338 |

The median frame is 16.7 ms in every case, before and after. **The phone's "over 33.4 ms" rises** (as chat 14's did,
6 → 20) while the main thread does less: the script counts frames over 33.4 ms, which is the edge of two screen
refreshes (33.3 ms), and its 95th percentile reads 33.3 before and 33.4 after — so whether these are slower frames or
two-refresh frames landing a tenth of a millisecond later is not told by this count (Astra's warning). The raw frame
times are measured next (below) before this is judged.

**The raw frame times** (8 Nov 26 06:07–06:10Z under the checks lock, timing only, `TIMING_ONLY=1`): **before** =
`main3` (chat 14's `dist-before`, port 4381), **after** = `final3` (`dist-final` rebuilt from c23920f0d, port 4393);
results `main3-results.json`, `final3-results.json` (each run's every interval in `raw`). The page's own frames (the
time between two of its animation frames) at 4× slow CPU, five runs each, all intervals pooled:

| Case | Frames | Under 20 ms | One refresh skipped (33–34.5 ms) | 34.5–50 ms | Over 50 ms | Worst frame | The page's work, ms a run |
|---|---|---|---|---|---|---|---|
| Leave War, phone 402, before | 860 | 804 | 47 | 3 | 6 | 283 ms | 880–1280 |
| Leave War, phone 402, after | 927 | 669 | **252** | 2 | 4 | 67 ms | 716–771 |
| Quals, phone 402, before | 858 | 823 | 34 | 1 | 0 | 50 ms | — |
| Quals, phone 402, after | 953 | 850 | **103** | 0 | 0 | 33 ms | — |

**What it says:** on the phone the long pauses are fewer and shorter (the worst frame 283 → 67 ms on the Leave War) and
the page did about a third less work in this run (struck below: not repeated), but the page's frames skip one screen refresh far more often — the Leave War
27% of frames against 5% before, Quals 11% against 4% — and each scroll's run lasted about 0.8 s longer. These are
the page's own frames, not the frames the phone's scroller paints (a touch scroll is drawn off the page's thread), so
this count does not prove the scroll looks less smooth; it does not prove it looks as smooth either. The desktop
counts move both ways within the run-to-run spread (Leave War: one-refresh 17 → 15, over 40 ms 24 → 36, worst
533 → 217 ms). **Judged:** a cost on a slow phone that this measure cannot settle — set to the code readers as a
question (why the page's frames halve while its work drops, and whether the always-present copy can cost less), and
on his look card as the one thing his iPhone decides: the Leave War scrolled fast and slowly, beside the live app.

**The diagnosis (8 Nov 26 06:14–06:24Z, under the checks lock, phone 402 only, 5 runs each; results
`diag-*-results.json`).** The same scroll on the same after build with one style changed for the run (the script's
`EXTRA_CSS`), against `main` again:

| Run | Leave War: one refresh skipped / over 50 ms (of ~900 frames) | Quals: one refresh skipped / over 50 ms |
|---|---|---|
| `main` again (`diag-main`) | 37 / 8 | 50 / 1 |
| the after build again (`diag-final`) | 231 / 38 | 134 / 17 |
| the copy's scroll step switched off (`diag-noanim`) | 46 / 13 | 33 / 3 |
| the copy on its own layer (`will-change: opacity`) | 186 / 46 | 126 / 11 |
| the copy's painting contained (`contain: layout paint style`) | 232 / 17 | 120 / 3 |
| the step's range written as plain numbers, no `var()` | 225 / 39 | 107 / 1 |

**Found:** the cost is the copy's show-on-scroll step itself (the opacity animation on the page's scroll timeline):
switched off, the phone's frames are `main`'s again; its own layer, contained painting or a plain-number range does not
help. The second after run also did MORE work than `main` (the page's work 1464–2487 ms a run against 1009–1437), so
the earlier "a third less work" did not hold up — run-to-run spread; struck. In this test browser (Chromium at 4×
slow CPU, a scripted finger) the page's frames run at about half rate while a finger scrolls the Leave War, and each
scroll took about 0.8 s longer to follow the finger — by D1789's own test ("stops if scrolling gets slower") a stop.
What his iPhone (WebKit) does is not measured here. **The job is PARKED at this point** (D1796: a question for him is
open), before the walk and the code reads, so neither is spent on a build whose way may change; the question is his
(D765, "never at a cost of speed", against D1870's blink). **Answered 8 Nov 26 (D1871):** on his iPhone the build's preview "doesn't feel slow" — kept as built; the job goes on to the walk. **His find in the same message:** scrolled all the way to the bottom, the top bar goes out of view (his recording, 14:31; frames `docs/img/handpass/2026-11-08-lw-pin-last-frame/his-recording-bottom.png`): the iPhone's bounce carries the bar off for a moment — the live app too, filed as `[TOPBAR-BOUNCE-AWAY]` — and a re-measure in that moment left the pinned dates row up where the bar stood, missing until he scrolled back up. That half is this build's and is fixed red-first: the bar's foot is read as its height (`barFoot`, Matrix.tsx and QualsPage.tsx), never where it stands; the tests "…carried off for a moment" were red on the build (the row 90px too high: the Leave War on a phone, Quals at both sizes; the Leave War's desktop case passed before the fix as well) and green after. Lesson 24 in the order's §7.11.

## The orders walked

Two Sonnet walkers at once, 8 Nov 26 ~07:35–08:20Z by the PC clock, under the checks lock, each in its own browser
context on the one frozen build (`dist-final` from 56f738937 — the bar's-height fix — served on port 4393), on the brief
`docs/superpowers/briefs/2026-11-08-lw-pin-walk.md`: **L, the Leave War** (script `scripts/handpass/lwpin-walk-l.mjs`, report
`docs/handpass/parts/2026-11-08-lw-pin-walk-L.md`) — 22 passed, **1 failed (L22)**, 1 recorded (L11); **Q, Quals**
(`scripts/handpass/lwpin-walk-q.mjs`, `docs/handpass/parts/2026-11-08-lw-pin-walk-Q.md`) — 48 passed, 1 failed (Q-height),
1 recorded, 2 not walked. Sizes: 1536 Chromium by mouse and wheel, 402 Chromium by CDP fingers, 402 WebKit for the looks
(scripted WebKit touches drive no scroll), a stand-in without the scroll timeline (L24, Q24). Each with the plain-user round
as admin and as member (L-plain, Q-plain). L-foot and Q-foot are his find's stand-in: at the page's foot the bar carried
off 90px, a screen-size change sent, the bar put back.

**The re-walk after L22's fix** (8dfa5dec0; `dist-final` rebuilt from it, the served bundle checked to carry the fix; 08:52–09:05Z
by the PC clock, under the checks lock): L22 (both sizes), L22's narrowing extra, L6, L8, L-foot (three sizes), Q22a, Q22b, Q6,
Q-foot (three sizes) — every one PASS, 0 console, page or 4xx errors. The host also ran walker L's exact turn and narrowing
steps (phone at device scale 2, mobile, touch; 874×402 → 402×874; desktop 1536 → 420 → 1536; 30 and 10px short of the
meeting point) on the walked build — wrong at three points — and on the fixed build — right at all eight.

## The cases carried by a test

The pinned-row browser tests, all green on 8dfa5dec0 (84 passed, 18 skipped — a phone-only or desktop-only test in the
other project): `e2e/leavewar.spec.ts` (lw-desktop, lw-phone), `geometry.spec.ts` and `pinchzoom.spec.ts` (raptor),
`year-leavewar.spec.ts`, `save-note.spec.ts` — hidden at rest, shown once pinned, out of the keys while hidden, the first
frame, reduce motion, a page too short to scroll, mid-pinch, the "Not saved" band, a block above the grid at rest, the bar
carried off for a moment (his find), and **after the screen changes width** (L22: red on lw-desktop on the walked build;
the phone and Quals cases did not go red in the test browser's phone set-up — the walker's exact steps prove those, above).
Unit: `pinframe.test.tsx`, `quals-pinframe.test.tsx` 12 of 12.

## The pictures

`docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/L/` and `walk/Q/` (each name starts with the scenario; L's with
the browser and size inside). L22's pictures from the walked build are kept as `walk/L/before-fix-L22-*`; the re-walk wrote
the fixed build's over the plain names. **Opened by the host, cropped:** Q-foot's bar out and bar back (402), Q4's mid-pinch,
Q6's "Not saved" band (402) — the copy at the bar's foot, under the band, stretched with the table; L22's phone pair,
before and after (`before-fix-L22-ph402-ch-just_before_T-402x874.png` beside `L22-ph402-ch-just_before_T-402x874.png`):
before, two "2026 CS/Name" date rows and the month buttons covered; after, the months in view and one date row. The
desktop pair at that moment differs by 5px and decides nothing. His recording's frames: `his-recording-bottom.png`.

## The break tests

The bar carried off at the page's foot and put back (L-foot, Q-foot, three sizes each; the tests "…carried off for a
moment"); a save refused with `?savefail` while pinned (L6, Q6); Manning and the group folds opened and closed 2px either
side of the meeting point (L8); a block put above the grid at rest (the tests); a window narrowed and widened, a phone turned
both ways, at and just before the meeting point (L22, Q22a, Q22b); a pinch across the meeting point, and one cancelled
(L4/L5, Q4, Q5); the old way forced (L24, Q24).

## Errors seen

None: 0 console errors, page errors or 4xx responses in either walk or the re-walk.

## What was NOT walked, and why

- Safari's folding address bar, the iPhone's bounce and a real momentum fling — only his iPhone has them (the test browser's
  finger makes no fling); the bounce's stand-in is L-foot / Q-foot. On his look card.
- The Leave War at 2560 zoomed out (the brief's lesson 11) — not reached in the walker's time; the fit and the largest zoom
  were walked at 402 (L11).
- L3 (the keys and the screen reader) on the phone — walked at 1536; a phone has no Tab.
- A member's bid with the row pinned, the Required keypad pinned (its row is out of view while pinned), a second finger in
  Rearrange on the phone (L15) — named in L's report.
- Quals: the returnee notice ("Later", Q7) needs an archived man restored through Admin first; Q17's tick sub-step left
  the cell unchanged — the same tick is walked in Q-plain as admin and member.

## The gate counts

**GitHub's first run (on the merge of `main`, 8 Nov 26): 3 failed, 238 passed in the phone group.** Each, and what was done:
1. and 2. D1789's two unit tests (the Leave War's and Quals') expected the pinned copy to leave the page on a scroll; the
   test browser runs the scroll timeline, so the copy now stays in the page and only lets go. Rewritten to run both
   ways — the browser's way checks the copy lets go and pins again in the scroll's own step (its `up` class), the old
   way keeps the original check (the copy taken out) — 12 of 12 pass; nothing they proved is dropped.
3. The phone browser test "the pinned dates row follows when something above the grid grows or shrinks with no scroll"
   failed twice on GitHub: the block pushed the row below the bar, but the copy stayed shown. **Never reproduced on the
   PC** — 6 of 6 pass, and 6 of 6 with the browser slowed six times. One real gap found by reading the watch: set up
   afresh by a redraw, it took its first height a frame late, so a block put in that same frame was never seen as a
   change — closed on both pages (the first height read as the watch is set up); a test forcing that moment (a group
   folded and the block put in at once) passed before the fix too, so it is not proof of GitHub's cause. The test now
   prints the copy's state if it fails again; **GitHub's next run decides it** — if it fails, its printed state is the
   next step. All 14 pinned-row browser tests pass on the PC on the fixed build.

## What the walk found, and each disposition

1. **L22 — after a narrowing or a turn the Leave War's copy showed ~37px early, until a reload (FAULT, this build's):**
   the browser works out where the page's scroll turns the copy on against the page as it stands when the value changes;
   during a resize the page is still settling, and the settled re-measure found the same value, so nothing made the
   browser work it out again. **Fixed red-first (8dfa5dec0):** a forced re-measure that finds the value unchanged writes it
   a hundredth of a pixel off, and the next writes it back (Matrix.tsx `placeY`, QualsPage.tsx `placeQ`); tests "after the
   screen changes width…"; re-walked, above. `main` cannot do it (its copy is mounted by the page's code, not the browser).
2. **Q-height — Quals' pinned box is 1px taller than the real heading** (24.28 against 23.28px at every size): measured by
   the host on `main`'s build (port 4381) and this one alike — the box's own 1px edge under the heading row, whose heading
   inside is the real one's height (23.28). Not this job's and not seen to misalign anything; not a fault.
3. **L20's note — a tap outside the day panel does not close it:** the same at the page's top with no pinned row; the
   panel is built to leave the grid behind it working (D1143, `DayPanel.tsx`), so not a fault.
4. **L11 recorded:** at the exact meeting point at scale 2 and 3 the band against the pinned picture differed by under
   0.003 — no seam; Q11 the same.

## The reads

- **Astra (Codex), the standing reviewer:** no fault in the app; his finding 1 was in the tests and is fixed there.
- **The fresh, blind Opus reader** (of 8dfa5dec0; its report kept in the chat's scratchpad, summarised here):
  - **F1 — a frame with no pinned row at the lift of a zoom made part-way down: REAL.** Fixed red-first in four rounds:
    `holdShown` / `qHoldShown` hold a freshly made showing step shown by an inline opacity that follows `.up` until the
    step runs, called at each pinch's lift and in each `[stuck]` layout effect; round 4 (b0809f551) keeps the Leave War's
    copy across a zoom or a redraw instead of taking it off the page.
  - **F2 — the first frame back on the grid from Balances: REAL, and missed once.** Its browser test passed after F1's
    fix only because it started reading frames in a second call, after the first frame had painted. The re-walk below
    read from the press itself and caught it — and the same frame coming back to the Leave War page from another page —
    at both sizes. **Fixed red-first (110267a33):** the frame reader makes the press in the task that starts it (the
    Balances test, and a new page-return test: 4 failed on "frame 0" before, 4 passed after); the grid watches the two
    switches that hide it (the tab's `hidden`, the page's class) and, as either changes, measures the copy afresh and holds
    it shown. Quals' page return lands at the top (the app scrolls to the top on a page change), so it has no such frame —
    read from the code, not walked.
  - **Q1 — the turn-on point after a zoom: not reproduced** (the test "after a zoom … still turns on where the row meets
    the bar" green); round 4 is also its fix.
  - **Tidiness — filed, not fixed (D489):** the two pages measure the copy in two near-copies of one routine; untrue
    comments at the Leave War's `[stuck]` layout effect and at two places in Quals' pin code; no D1870 entry in
    `performance.md`; cheaper measures not taken — the frozen corner drawing only its columns, `@property --lwy-s` not
    inherited, no `translateZ(0)`.
- **The fresh blind Opus read of the F2 fix (110267a33), 8 Nov 26 ~20:40 — no proven fault.** Each point checked in the
  browser before it counted: (Q1, inferred) a request's dates tapped on Approvals call `ringCell`, whose `look` scrolls
  inside a frame callback, so frame 0 might paint the held copy over a real row brought into view — **not reproduced**:
  a probe on the served fixed build, the frame reader registered after the tap so it reads after `look`'s scroll, 30
  tries (desktop 1536 and phone 402 × five places just past the turn-on point × the first three requests), every frame
  the copy shown exactly while the row was under the bar; (gap a) the return tests asserted only "under and not shown" —
  **closed**: both now also assert no frame "shown and not under", and a new test returns at the page's top and asserts
  no frame shown (6 of 6 pass, both sizes); (gap b) no WebKit test — stands, as before: his iPhone is the WebKit check.
  Tidiness, filed not fixed (D489): "measure, then hold" in two places (the observer and the `[stuck]` effect); the
  observer finds `.lw-gridhost` and `.page` by class names other files own; the "Hidden, the copy has no step" comment
  does not cover the dozing page.
- **Reads owed:** Astra did not read the F2 fix (110267a33) — the job goes on the reads-owed list for that diff; the
  fresh Opus read above stands beside it. Put to him.

### The re-walk after the reads (8 Nov 26, `scripts/handpass/lwpin-rewalk-lift.mjs`, a build of 39d1f4ca0)

Every frame read — is the real row under the top bar, is the copy shown — from the press itself, with a picture right
after and one settled (`docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/rewalk-lift/`, `results.json`):

| Check | Size | Frames with the row under the bar and no copy |
|---|---|---|
| The Leave War, a zoom's lift part-way down (Ctrl+scroll) | desktop 1536 | none (of 226 after the lift) |
| The Leave War, a zoom's lift part-way down (pinch) | phone 402 | none (of 201 after the lift) |
| Quals, a pinch's lift part-way down | phone 402 | none (of 202 after the lift) |
| Back on the grid from Balances, scrolled down | desktop / phone | none of 40 / none of 40 (frame 0 on the build before 110267a33) |
| Back on the Leave War from Quals, scrolled down | desktop / phone | none of 60 / none of 60 (frame 0 on the build before 110267a33) |

No page error, no failed request. The host opened the pictures right after each return, phone and desktop: the pinned
dates row in place under the top bar, nothing of the rows showing through. **Lesson kept here:** a frame reader started in
a call of its own after the press can miss the very frame it is meant to catch — start it in the same task as the press.

Walk: re-walk, 7 checks at desktop 1536 and phone 402, each frame read from the press, 7 PASS after the fix (2 FAIL before
it, fixed red-first); pictures in `walk/rewalk-lift/`.

## Part 2 — the top bar held through the page's spring (D1873, 8 Nov 26)

His second recording on this branch's preview showed the fault filed as [TOPBAR-BOUNCE-AWAY] (a flick to a page's foot
springs the page past its end and carries the top bar off screen for ~0.23 s; the fixed pinned dates row stays put —
`docs/img/handpass/2026-11-08-lw-pin-last-frame/his-recording-2-bounce.png`, frames 100–123). He ruled D1873: Astra fixes
it now, on this branch. Astra's work order: `docs/superpowers/briefs/2026-11-08-topbar-bounce-fix.md`.

### The eight answers and the tier
1 money — NO, the bar's place only; 2 published record — NO; 3 saved data — NO; 4 a shared drawer — **YES**, the one top
bar on every page; 5 a new gesture or mode — NO (nothing new to press; the spring is the phone's); 6 a new surface — NO;
7 roles — NO; 8 the warning list — NO. **Tier: WALK** (a cosmetic change to a shared drawer is never LOOK).

### The roll-call — the top bar, every place it is drawn (SHOW at rest / scrolled / at the foot · USABLE · PAINTED under or through it)
| Place | SHOW | USABLE | PAINTED |
|---|---|---|---|
| Edit Schedule (blue bar), desktop · phone | | | |
| View-only Sched, desktop · phone | | | |
| Scheduler Board (covers the bar with its own) | | | |
| Inputs — list, calendar, Medical, SANS | | | |
| Quals (pinned heading under the bar) | | | |
| Leave War — Grid (pinned dates row), Approvals, Balances (its bar), OIL | | | |
| Tracker | | | |
| Logic · Admin · Help | | | |
| "Not saved" band (`?savefail`) · "OIL not answered" bar | | | |
| Windows opened below the bar; the bar pressable over Jump to a date / day window / document viewer | | | |
| Page names beside TALON, two rows on a narrow desktop · folded into ☰ | | | |
| Phone on its side; the bar's own sideways scroll and its burger-and-mark lead | | | |
| Sign-in, access and guest screens | | | |

### The sizing lines
(written when Astra's change is read — §7.0, the ledger's sizing step)

### What only his iPhone can show
The spring at a page's foot and top, Safari's toolbar folding, the keyboard: the PC's Chromium and Playwright's WebKit do
none of them (lesson 6) — his look on his iPhone before "merge live".
