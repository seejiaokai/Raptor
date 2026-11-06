# Job 1's builder report to the night's coordinator (6 Nov 26), saved as it arrived

Branch `claude/lw-faults-1106`, last pushed commit 869f3863c (8 commits on main cc3ba8d84).

- (a) already fixed on main since 25 Oct 26 (pull request 569), pinned by `otherhalfwords.test.tsx`; walked again (S1) — PASS. Confirmed on main by the coordinator.
- (g) already fixed on main, pinned by `bidbubble.test.tsx`; not walked (no December day near its manning line in the demo data). Confirmed on main by the coordinator.
- (d) fixed red first — `src/leavewar/ui/doubletap.test.tsx`, 11 cases: a finger's tap or a double click within 32 px of the press that closed a one-day or drag window is swallowed for 600 ms; everything else goes through. In `Matrix.tsx` (`guardGrid`), shared with the "Show ›" guard.
- (f) fixed red first — `src/leavewar/rolerestore.test.ts`: a refused war change keeps the role and viewer in force. No route on screen to a refused change in the member view was found (4 tried).
- (c) nothing built — not a store fault: a drag fill on posted-out days writes pending bids as D1541 says; the OD is filed whole, the grid draws "PO" over it. Parked as Q1.
- [CSS-WRAPPER-GUARD] built — `src/ui/css-wrapper-css.test.ts`, list `src/ui/css-wrapper-outside.json` (202 rules, may only shrink). bidpicker.css's rules after its wrapper are not deliberate, harmless only because their names are unique.

Walk: `docs/handpass/2026-11-06-lw-faults.md` · 288 pictures · 7 surfaces · 14 orders · MISSING: S4e fixed red-first; (c)'s drawing a question to him (Q1); F1 filed. One Sonnet walker (8 scenarios, 1536 Chromium, 402 WebKit, Chromium touch, plain-user round), two host re-walks — all PASS after the fixes.

Reads: a fresh Opus read (`read-code.md`) run beside the walk — a stated departure from the order's §5; its fixes re-walked. F2, F3, F4, F7, F8 fixed red first; F5 comment corrected and filed; F1 filed; F6 covered by the walk. A narrow Opus read of the fixes (`read-fixes.md`): N1 (medium), N2 fixed red first; N3 moved to a fake clock after a flake; N4, N5 done.

Checks: the Leave War unit set under the lock passed bar the one timing test, since moved to a fake clock (11/11, three runs); build PASS; lint:changed no new finding; docsize OK; browser tests left to GitHub's run (D1086).

Q1 for him: Diesel posted out from Tue 29 Dec; Saber drags Mon 28 – Wed 30 Dec and presses OD. Today one OD covers 28–30 Dec on the Inputs page, but the war's row shows OD on the 28th and a bare "PO" on the 29th and 30th. Recommended: draw what is filed on such a day the way leave already is there, over the posting hatch, counting nobody. Alternative: the filing skips those days and says so in the window's note. Waits on it: the grid's drawing of posted-out days, mock-up first (D1625). Pictures `docs/img/handpass/2026-11-06-lw-faults/walk/s7-*`.

To file: other windows over the grid have the same double-tap fall-through (F1); a refused change still restores the jump-to-a-day fields (F5); bidpicker.css's 202 rules outside its wrapper should move inside, as a walked job; Q1.
