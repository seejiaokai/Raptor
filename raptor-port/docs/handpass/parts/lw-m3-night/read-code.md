# The night of 26 Oct 26 — job 5: one fresh, blind Opus code read (D790) of ca9bda2cb, 89c847057, f26fdd0fd

Saved as it arrived (condensed only in layout; every finding, cause, fix and scenario kept). Read-only; no test run by the reader.

## F1 (high) — a course moved onto the Ground Programme counts him back OUT on the war once the schedule is on another week; and the war and the schedule disagree on a course with no filing mark

- Inputs: a scheduler rejects Comet's course on week A, puts it on the Ground Programme (acc 'g' — the war counts him in, D1389, N3), then moves Edit Schedule to week B (or the app boots on a week without the course's row).
- Wrong result: off its week the course has no mark; `warCounts` read "no mark" as filed, so the war counted Comet out again (Available P −1, the SANS need +1); back on week A, in again — the war's count followed the week on screen.
- Cause: `src/state/holderbase.ts` 194–200 derives 'g' from the week on screen only and deletes the mark off it (long-standing; the load tests rely on it); `absences.ts` let a course with no mark fall through to `warVisible` → true.
- Same cause: the schedule pins a course with no mark as NOT away (`engine/inputs.ts isAway`, `unavaway.test.ts` "never landed: not away"); tonight's test pinned the opposite. And a cancelled or information-only course still counted out on the war (`warVisible` returned before `inputSilent`), where `isAway` reads it silent.
- Not data-only: every new reject → Ground breaks when the scheduler leaves the week; the demo seed's course (`leavewar/engine/seed.ts` pipper, 12–13 Jan) is filed through `inputRowFor` with no mark.
- Fix: in `warCounts` one rule per kind, asking what `isAway` asks — a course counts out only when `acc === 'u'` and it is not silent; an overseas duty unless 'r' / 'g' (D1390); leave and medical after, as before. Tests: a course with no mark → false; `acc:'u', cx:true` → false; through the app, reject → Ground → another week → in. `demoworld.ts`: file a course 'u' (`filingOf`) so the demo course stays on the war. Comments updated.

## F2 (low) — the drag window's Post in (and its Post out, older) throws away words typed in its Remarks box; the one-day window keeps them

- Inputs: an admin drags a man's days holding a leave approved on the war, types a remark, presses ⋯ → Post in → Post in. The remark is lost — against D1339 (words typed in the drag window apply whatever is pressed).
- Cause: `SelectSheet.tsx` `sel-pi-confirm` calls `onPostIn` then `onDone(true)`; Matrix's onDone closes the window, so `keepWords()` never runs; BidPicker's Post in calls `flushWords()` first. Post out (`sel-po-confirm`) has the same gap, from before tonight.
- Fix: call `keepWords()` immediately before `onPostIn` / `onPostOut` in both confirms; a test types a remark, presses Post in, expects it saved.

## Checked and agreeing

Every reader of the war's absences goes through `warCounts` (grid, day panel, Available rows, the SANS calendar, the "already holds a course" check, restore, undo wiring, the signature refresh). The input gate uses `warVisible`, but a course / overseas duty is in no clash pair and replaces no bid — no change. The schedule side already treats 'r' / 'g' as in. An overseas duty's 'r' / 'g' cannot be reached today (`acceptInput` refuses one): when Q-A's button is built, `isAway` must change in the same job (it calls an overseas duty away whatever its mark). Post in's guards match the one-day window's (admin, one man, not deleted, not locked, the same `postInOr`, a refusal shown). The sign-in jump has one route (`initPan`, Shell and GuestApp); Edit Schedule's week is not `#vWeek`; the day-dot tap uses `block:'nearest'` smoothly — likely little or no page move, unwalked.

## Scenarios to add to the walk

1. Reject a course → Ground on its week, then another week; sign out and in on another week — the war stays "in" (fails before F1's fix).
2. A course on the Ground Programme cancelled (CX) / information only — counted in.
3. The demo's pipper course, 12–13 Jan — the schedule and the war side by side.
4. Undo / Redo of Reject and → Ground while on the Leave War — the counts follow, the grid stays put.
5. A course for two men rejected — both back in.
6. A course across two weeks, rejected and put on Ground in the first — the count viewing the second.
7. Reject on a published day — the war counts him in at once while the issued schedule still lists him under Unavailable; confirm with him that this is intended.
8. After a Reject, the member files the course again from the war's bid window, or bids leave on that day — what lands.
9. Sign-in at the top in WebKit at an iPhone size, the guest page, a phone on its side, a day-dot tap.
10. Post in from the drag window: words typed first (F2); a date other than the first day; a refused date; Undo straight after; a locked or archived man; the panel's fit on a phone.
