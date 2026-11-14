# Job 3 — the reads' fixes: the builder's second brief (chat 81, 15 Nov 26, ~06:00)

Same builder, same rules as `2026-11-15-lw-doubletap-more-builder-brief.md` (the checkout `C:/Users/User/projects/Raptor`
on `claude/lw-doubletap-more`; never push, switch or stash; commits end with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; no edits to `HANDOFF.md`, `OUTSTANDING.md`, `.claude/`, guides
or rules; outputs and exit codes to `…/scratchpad/job3/` as before, prefixed `fix-`). The two blind reads are in
`raptor-port/docs/superpowers/briefs/2026-11-15-lw-doubletap-more-coderead-{astra,opus}.md` — read both whole. Each fix
red first: the failing output saved (`fix-red-*.txt`), then green. Deliberately break each fix once afterwards and say
which test caught it.

## Fix
1. **Astra F1 (new with this change) — Escape from the Required number pad reuses an earlier finger press.** Touch a
   digit, press Escape (the pad closes), tap the day that was under the digit within 600 ms: the tap is swallowed.
   Cause: the pad's Escape handler stops the event on window capture, so the grid's press-forgetting `keydown` on
   document capture (`Matrix.tsx` ~1588) never runs. Fix as Astra gives it: register that listener (and its removal) on
   **window capture**, ahead of the pad's — check the order of registration makes it run first, or forget the press
   another way that cannot be stopped by a window-capture handler; check no other window's Escape handler has the same
   effect (the day panel, sheets). Unit test as Astra's step 4–5; a browser test at a touch tablet size (1024×768) with
   a live day under the digit.
2. **Opus F1 (older, the same kind) — the slim "Back to Approvals" bar's ✕.** Admin on a phone: Approvals → a request's
   dates → the grid at that day with the slim bar at the foot; a double tap on its ✕ opens the day beneath. Fix as the
   Opus read gives it: `useGuardOnClose(mode === 'bar' ? 1 : 0)` in `LeaveWarPage.tsx`'s `Body` (it stays mounted;
   never in `SlimBar`, which unmounts), and `.appr-slim` added to `WINDOW_PRESS`. Unit test as given (the second tap
   null; after 650 ms it opens); a browser case at the phone size if the bar stands over a live day.
3. **Two more older windows to check, not assume** (the reads disagree): the scheduler's Calendar window opened from ⚙
   → Calendar…, and the document viewer opened from the person window. For each, at the phone size: does its ✕ stand
   over a live grid day or the pinned dates once closed, and does a fast second tap reach the grid? If it reproduces,
   give it the door the same way, red first; if not, say why in the hand-back (it closes onto a surviving window, or
   nothing of the grid is under it).
4. **The test gaps both reads list** — add, each red-first where it can fail today, or say it passes by design:
   - a mouse case (the e2e file's skip note claims one in the unit file and there is none): a click detail 1 on a
     guarded ✕ then a click detail 2 on the cell at the same point → nothing opens; a second click of detail 1 → opens.
     If you add it, the note becomes true; if not, correct the note;
   - hand-overs: the pad up, a long-press drag picks Required cells (the pad gives way to the panel) — then a finger tap
     on a day cell at the press point opens; the panel up, a tap on a Required cell opens the pad and the pad stays,
     nothing swallowed; the one-day window's Move hands over to the move banner — a landing tap more than 32 px away lands;
   - the selection panel up: a tap on a day cell opens that day's window (the page behind it works);
   - the day panel's ✕, then at once a top-bar button at the same point: its action runs;
   - the pad on the last eligible flying date: Next closes it — a tap on the exposed spot after 80 ms is guarded, after
     650 ms it opens;
   - a refused Apply, Clear, Done and rename Save each keep their window open and arm nothing;
   - the move-banner browser tests wait past 600 ms after Move before testing the banner's own close (so the older
     guard cannot mask a missing new bit);
   - the unit test labelled "a desktop click" that uses the touch helper: make it a mouse click or rename it.

## File, do not fix (say so in the hand-back; the host files them)
The tidiness notes (the duplicated comment in `Matrix.tsx` and `gridguard.ts`'s head; `useFlyWindowsGuard`'s name; the
helper's `pad` argument that covers the desktop editor too); the under-manned list that hides but stays open when the
red days drop to zero and catches the first Escape (Opus, older); the first-ever period's Create (Astra, older); a
Required close delayed past a second (both: low).

## Checks and hand-back
As the first brief: the touched test files; `npm run build`; `npm run lint:changed`; under the lock the whole unit
suite, the build, and both double-tap browser files plus any new one; `dist` left built from your last commit.
Hand back under 450 words: each fix — red file, test names, cause and fix in two sentences, the breakage and what
caught it; item 3's two answers; the test gaps added or why not; the commits; the counts of each check.
