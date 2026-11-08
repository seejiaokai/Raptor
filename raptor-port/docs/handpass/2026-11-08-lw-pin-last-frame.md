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
| Leave War grid, desktop 1536 | | | |
| Leave War grid, phone 402 | | | |
| Leave War's other tabs (Approvals, Balances, OIL, My Leave) — must not show | | | |
| Leave War, a window over the grid (day, person, keypad, menus) | | | |
| Leave War, mid-pinch (phone) | | | |
| Quals, desktop 1536 | | | |
| Quals, phone 402 | | | |
| Quals, a page too short to scroll | | | |
| Quals, mid-pinch (phone) | | | |
| Both, with reduce motion on | | | |
| Both, a browser without the scroll timeline (the old way) | | | |
| Both, with the warning bands under the top bar | | | |
| Both, member and admin | | | |

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
   (`dist` built from 110b3a2c2, served on port 4393, not rebuilt while they walk): **L, the Leave War** — Astra's
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

## The orders walked

## The cases carried by a test

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## The reads
