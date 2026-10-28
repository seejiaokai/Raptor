# M5a — the second fixer's report (29 Oct 26, ~03:30): walker D's four and the code read's five — saved, condensed

All nine fixed, each with a test red before (faults 2–9 written first; 1 and 5 proved red by restoring the old code).
Checks: vitest `src/leavewar src/state src/undo` 295 files, 4,903 passed, 20 skipped; `npm run build` exit 0; no Playwright.
1. The leave buttons' "left" (D 1–4): both bid windows showed `balanceAfterFill(...).before`; now `.after` — the one-day
   window over the days a press would write (`selCells()`), the drag window over the dragged days (`BidPicker.tsx`,
   `SelectSheet.tsx`, comments in `LeaveButtons.tsx`); tests: weekday −1, PM −0.5, drag over two weekdays −2, a Saturday
   unchanged, row 10's Monday 9 → 8 and its afternoon 8.5.
2. A hyphen for minus (D 5): `figWords` moved to `ui/FigureCell.tsx` (re-exported by BalancesPage — no import circle); the
   grid's figure, its tooltip and `belowZeroAsk` use it; pins rewritten to "−" (m5a-readers, bidding, counters ×3,
   selectsheet ×3, wars, the six `__rows__` snapshots — only the glyph changed; e2e: "to −3 FCL", `bal-harpoon` '−2').
3. The year picker stale across midnight (D 6): keeps 'ahead' | a past year; "this year and ahead" worked out from
   `memberToday()` each draw; test: open at 23:00 on 31 Dec, the day turns → "2027 and ahead", the 2026 line gone, 2026
   picked brings it back.
4. Carried forward clamped, not refused (D 7; spec §1.1) in `saveTypedFigure`; a clamp onto the figure shown saves nothing;
   Pending with nothing pending reads "–" in the window; tests: 25 beside 20 saves 20, −3 saves 0; the old refusal pin
   rewritten to the clamp.
5. Code read 1 — `rows.ts lwRows` `lw.config`: a field the restored record lacks removes its stored row; tests: rename, Undo,
   reload → "Ops A"; delete a held grade, Undo, reload → still held.
6. Code read 2 — `changelines.ts`: `inputLines`' delete branch and `crossLines` write `fld: 'deleted'` (with `itype` and its
   half); tests: an Inputs-page delete by Saber → a struck "deleted by Saber · today 09:00"; a bid crossed by Saber's ATT C →
   struck. Limits: no `days` (an Input is always one run); a deleted half-day Input's struck line counts 1 day; no mark where a
   request of his still stands on that day.
7. Code read 3 — `personleave.ts markCands`: a mark counts on its Input, or on overlapping dates AND the same kind AND the same
   half; test: an AM LL beside a PM CL re-typed to FCL — only the FCL dotted.
8. Code read 4 — `engine/leaveyear.ts`: the roll-over counts grade, grade days and a deletion only when strictly BEFORE that
   1 Jan (`gradeBefore`); `gradeOn`, `gradeOf`, `gradeDaysNow` unchanged; the §1.5 table green; tests: regraded on 1 Jan 27 →
   53 incl. 20 (was 56); days changed on 1 Jan → 33 that year, 40 the next; deleted on 1 Jan → 53, then 0.
9. Code read 5 — new store `peopleCountedFor(pid)` (the roster plus his hidden identity), used by `leaveWorld` and by
   `approvals.ts ownDays` when its context lacks him; test: the hidden pilot's 1–15 Jun → 15 (was 11), the what-if 15.
Screens a shared change touches: the grid's figure (and the phone's frozen copy), the below-zero ask, both bid windows' leave
buttons, the change history's lines (wording unchanged), Approvals' DAYS / My leave's pending / the window's line days, the
Balances page's save, every 1 Jan figure. The grid's figure now rounds to halves (was tenths) — no change in practice.
