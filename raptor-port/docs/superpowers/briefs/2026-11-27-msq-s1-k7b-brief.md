# Section 1 (the guard rail) — step K7b: an Undo's landing never enters ahead of the Undo's own writes (chat 204, 27 Nov 26)

**A fault K6 brought in, on a road no press reaches today, found by K7's builder (report
`2026-11-27-msq-s1-k7-report.md`, finding 1).** K6 sent `state/undo-wire.ts snapView` through the page door,
`state/store.ts setPage`. Where the page is one the squadron in view does not offer, the door calls `notify()` at
once, and the landing (`landOnOfferedPage` → `landOnOwnPage` → `enterSquadron`) runs inside `snapView`. That is
before the Undo step's writes. Before K6, `snapView` set the page with no `notify`, so the entry came after the
writes. Now the saved row is undone but the cached copy (`keptPlan`) keeps the edit, and the Undo is half applied.

Saved data is touched, so this is a careful fix: tests are already red, and every write path is re-read after.

## The red tests (already failing — no new red-first needed, but say so)

`src/ui/msq-inputscal-own-calendar.test.tsx`, describe "a 142 plain admin with View of 149 picks 149…":
- "an edit of that note is…";
- "a day title edited there…".

K7 re-pointed them to close the day window first, and both still fail exactly as on GitHub. **Leave their
assertions as they are.**

## What is built

- The cure is in the app, inside `state/undo-wire.ts` and `state/store.ts` only.
- **The shape, to read first and choose:** `snapView` still asks the page door's question first (`ownPageRefused`;
  refused → return, nothing changed, as K6 made it). It must then set the page **without** the door's immediate
  `notify()`, so the landing runs on the step's own `notify()` after its writes, as before K6.
  - Add the smallest store-side way to do that, for example a store export the Undo alone calls.
  - Keep R5 (b): only `state/store.ts` may call `view.setPage`.
  - Update R5 (c)'s census of door call sites and its kind for `snapView` if it changes. Name the change.
- Read the step's order in `undo/timeline.ts` (`globalUndo`, `snap(entry, …)`) to confirm where the writes and the
  final `notify()` fall. Do not change `undo/timeline.ts`: the Admin → Users section is changing its hook, and K8
  works there.
- **Redo has the same order.** Check it and cover it.
- Also check every other caller of the page door with no `then` that sits inside a command or a step: does an early
  `notify()` there enter a squadron before writes? List each in the report, and fix any that does, in the same way.

## Checks

- The two red tests green, plus:
  - B23 and every K6 test (`ui/msq-guard-doors-bell.test.tsx`);
  - `ui/msq-guard-rollcall.test.ts`;
  - the undo test files (grep `src/undo/` and `src/state/*undo*`);
  - the role-question count test.
- Then the full unit suite under the checks lock, since the checker runs under every test: `take`, then `npm test`
  to `.tmp/k7b-full.txt` with its exit code, then release.
- `npm run lint:changed`, and `npm run build` under the lock.

As K4's brief otherwise. Do not commit, push, or edit `HANDOFF.md`, the plan or `OUTSTANDING.md`. Read source with
shell tools, not the Read tool. No `sed -i`.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k7b-report.md`

The report gives:
- what changed;
- why the order is now right, in two sentences;
- the other callers checked;
- every check's numbers.

End with the path and one line: is K7b whole.
