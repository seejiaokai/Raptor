# The hidden ?timing readout — evidence sheet ([APP-SPEED] step 1; D2481, D2483)

Branch `claude/app-speed-readout-161` (chat 161), pull request 840. Pictures: `docs/img/handpass/2026-11-24-timing-readout/`.
The approved mock-up: https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS (its words Fable's review, adopted whole).

## The eight answers and the tier

1. Money / OIL / who counts as present — NO: it reads times and the computer; it writes nothing any count reads.
2. The published record — NO: nothing published, signed, amended or exported.
3. Saved data — NO: it writes nothing to storage (no `localStorage`, no backend); the marks live in memory for the tab.
4. A shared drawer — NO: one line in `setPage` (a mark, no drawing); no routine that draws a man, a row or a day changes.
5. A new gesture or mode — YES: the `?timing` switch (a mode), Copy all, the fold ✕, the corner button.
6. A new surface — YES: the window and its corner button.
7. Roles — NO: it shows no person's details and gives no power; a member and an admin see the same window.
8. The warning list — NO.

**Tier: WALK.** Not a security change (no sign-in rule, no permission, no person's data shown) — no security read.

## The roll-call

**A. The window (a new floating surface, z 410) and its corner button (z 409) — every surface it can stand over.**

| Surface under it | SHOWS (window drawn, readable) | USABLE (drag, ✕, Copy all, button) | PAINTED on the same pixels |
|---|---|---|---|
| Sign-in card (desktop, phone) | | | |
| View-only Sched week (desktop, phone) | | | |
| Edit Schedule week, the board open | | | |
| Inputs (list, calendar) | | | |
| Quals · Logic · Help · Admin | | | |
| Leave War grid (its own pinned bars) | | | |
| Tracker | | | |
| The failed-save band, the "Not kept" band | | | |
| Another movable window (ALL AVAIL, changes, an input's window) | | | |
| A dialog (z 470) or the ☰ drawer (z 440) | | | |
| The week's foot scroll bar (desktop) under the corner button | | | |

**B. The page mark — one row per opener of a page (every caller of `setPage`).**

| Opener | Timed once, to the right page | First time / opened before right |
|---|---|---|
| Top bar link | | |
| Phone ☰ drawer link | | |
| Sign-in landing (`resetSession`) | | |
| Sign-out | | |
| Role switch landing (store.ts, Edit Schedule/Admin → View-only Sched) | | |
| Page reopened after a failed download's Retry (Login.tsx `takeReopen`) | | |
| A page left before it finished drawing | | |

**C. Without the switch — the app as before.**

| What | Proved by |
|---|---|
| No readout file downloaded, nothing drawn | |
| The marks do nothing | |

## The five sizing lines (§7.0)

## The orders walked

## Cases carried by a test

## The scenarios (Astra's and Fable's, combined)

Designed blind to each other, 24 Nov 26, on the first build (`81f62f830`): the brief
`docs/superpowers/briefs/2026-11-24-timing-readout-scenario-brief.md`; Fable's 26 scenarios
`…-scenarios-fable.md`, Astra's 30 `…-scenarios-astra.md`. Both found, by reading, the same faults in the stopwatch
(F1 the claw on the page body, F2 the window arriving late, F3/F4 the sign-in and sign-out waits, F5 the caret, F6 a
page credited with another's download, F7 "zoom", F9 a hidden tab) — fixed red-first in `146111e63` (`timing-watch.test.ts`,
`TimingReadout.test.tsx`; F1 and F5 put back by hand and seen red). Still open, for his look: what Copy all shows
when the browser refuses to copy (both readers — something new he would see, so a mock-up first, D1625).
**The combined walk list is still to be written** from the two lists (the next chat), deduplicated, each EXPECTED line
with its source, sized by §7.0.

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition
