# Section 1 (the guard rail), step K7b — an Undo's landing never enters ahead of the Undo's own writes: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k7b-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, working copy `lw-balances-hover-275293`, from
`69476d855`. Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md` not touched. Not touched:
`src/engine/`, `undo/timeline.ts`, `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `storage/`, any word of the app.

**In one line: an Undo or a Redo that lands on one of his own pages while a squadron he only views is picked now asks the
page door's question as before, but sets the page with no repaint of its own, so his own squadron is entered on the
step's own repaint, after its writes — the two red Inputs calendar tests are green, with their assertions as they were,
and a Redo test and an order test are added, each seen failing on K7's code first.**

**K7b is whole.**

## What changed

| File | Change |
|---|---|
| `state/store.ts` | **New export `stepPage(p)`** — the Undo's and Redo's own page door. A page already shown or offered: set, nothing else (as `setPage` without a `then`). Otherwise the door's question (`refuse`, through `pressDoor` — door `'page'`): refused → `'refused'`, nothing changed. A save still going → the door's own wait, `setPage(p)` again once the saver answers (as K6's `ownFirst` `again`) → `'asked'`. Else the page set with `view.setPage` and **no `notify()`**, the door kept in a new one-shot `STEP` → `'went'`. **`landOnOfferedPage`** spends `STEP` on the first notify after it (cleared on every notify, used only if its page is still the page shown) and hands it to **`landOnOwnPage(step)`**, which passes `KEPT ?? step` to `landOwn` — so the step's landing still closes the windows that only show things and asks again after the Tracker's question, as the door's landing does. `landOwn`, `landAfterAsk`, `setPage`, `ownFirst` unchanged (R5 (a)'s pinned lines are untouched). |
| `state/undo-wire.ts` | `snapView` calls `stepPage(land.primary) !== 'went'` in place of `setPage(…)`; the import line (`stepPage` for `setPage`); a comment. Its `then` and the rest of the view-snap still run only on `'went'`, as K6 made it. |
| `ui/msq-inputscal-own-calendar.test.tsx` | **New test** (K7b's Redo cover): the day title edited, the day closed, Undo (142 back), 149 picked again (`switchUnit`, the file's own raw move), then **Redo** — lands on his Inputs, 142 back, the title redone stored **and** cached. `CURPAGE` added to the view import. The two red tests not changed. |
| `ui/msq-guard-doors-bell.test.tsx` | **New B23 test "(the order)"**: with nothing open, `_snapView` sets the page and enters nothing (inside the turn: `['u149', 'inputs']`); 142 comes back only on the next notify. |
| `ui/msq-guard-rollcall.test.ts` | **R5 (c) census, named change:** `doorCalls` now also reads `stepPage` imported from `state/store`; the census row for `state/undo-wire.ts` is now `at: "stepPage(land.primary) !== 'went'"`, still kind `'answer'`, its reason extended ("the step's own door, so the landing comes after the step's writes (K7b)"); the count test renamed "fifteen calls of setPage, the holiday line's ownSquadronFirst and the Undo's stepPage" — total still 17 — with one assertion added: exactly one call of `stepPage` (the Undo alone); the planted "answer not tested" case re-pointed to the new call's words. No assertion weakened or removed. R5 (b) unchanged and green: only `state/store.ts` calls `view.setPage`. |

No new files; no `docs/file-map.md` line needed (the two changed source files keep their roles).

## Why the order is now right

`undo/timeline.ts` `globalUndo` and `globalRedo` both call `snap(entry, dir)` → `snapView` before `applyRestore`, whose
commit writes the step and releases the latched repaint (`notify` → `realNotify` → `landOnOfferedPage`) only after the
writes; `stepPage` sets the page without a repaint, so the landing that enters his own squadron runs on that latched
repaint, after the writes, exactly as before K6. K6's `setPage` repainted at once inside `snapView`, so 142 was entered
(and its calendar's kept copy taken) before the Undo wrote — hence the saved row undone and the kept copy still edited.

Checked in `undo/timeline.ts` (read, not changed): `globalUndo` l.1166 and `globalRedo` l.1204 — the refusals, then
`snap`, then the post-snap conflict check, then `applyRestore` → `restoreCommit` → `commitAs` (writes, `postRestore`,
`reversed`), then the marks and the bubble. **Redo has the same order** and the same `snapView`, so the one change
covers both; the new Redo test pins it.

## Seen failing first (the patch-file method, never `git stash`)

- The two brief tests: red before the change (`.tmp/k7b-red.txt`: 2 failed — the kept copy `'Range day — moved'`, and
  `'Exercise — day 2'`, against the saved row).
- The new Redo test, written before the change: red (`.tmp/k7b-red2.txt`: 3 failed — the Redo's kept copy `'Exercise'`
  against the saved `'Exercise — day 2'`; its premises — 142 back after the Undo, 149 and View-only Sched before the
  Redo, 142 and Inputs after it — all held).
- The B23 order test: `git diff` of the two source files to `.tmp/k7b.patch`, checked out, run, applied back (the diff
  afterwards the same two files, 33 insertions, 5 deletions): red for the right reason (`.tmp/k7b-red3.txt`: inside the
  turn `['u142', 'inputs']`, expected `['u149', 'inputs']`); B23's other two green on the old code.

## The other callers of the page door with no `then`, checked

An early `notify()` from the door enters his own squadron only where the page is one the squadron in view does not offer;
the question for each is whether writes follow the call inside the same command or step.

| Caller (`file` — call) | Page offered? | Anything written after the call? | Verdict |
|---|---|---|---|
| `ui/Shell.tsx` — a tab | yes: only offered pages are drawn | no (`notify()` only) | no early entry |
| `ui/Drawer.tsx` — a ☰ page | yes: only offered pages drawn | no (`setDrawer`, `notify`) | no early entry |
| `ui/Login.tsx` — `setPage(back)` | yes: his home just entered | no | no early entry |
| `ui/logout.ts` — `setPage('tracker')` | guarded by `pageOffered` | no | no early entry |
| `probe-bridge.ts` — `w.setPage` | developer's tests | no | no early entry |
| `ui/topstate.ts` — `setPage('help')` | Help always offered | no | no early entry |
| `ui/interactions.ts` — "make a period" | needs `canEditSched()`: offered | no | no early entry |
| `ui/WelcomeBack.tsx` — "Check my quals" | drawn only on his own squadron | `markBackSeen` is before the call; after it, `notify` only | no early entry |
| `leavewar/sync.ts` — `openInputsPage` | may be unoffered | no (`raptorNotify` only) | entry is the last thing: fine |
| `ui/topstate.ts` — the SANS reminder's `setPage('inputs', …)` (asks first) | may be unoffered | no: tab, month and day ask are set before; `notify(); return` after | fine |
| `ui/adminopen.ts` — `openAdminUsers` (asks first) | may be unoffered | no: the Users intent before; `notify()` after | fine |
| `leavewar/sync.ts` — `openWarAt` (asks first) | may be unoffered | no: war selected, panels away, ring asked before; `raptorNotify()` after; its callers (`openNotice`) only `notify()` after | fine |
| `leavewar/sync.ts` — `openNewPeriod` (asks first) | may be unoffered | no: the ask left before; `raptorNotify()` after | fine |
| `state/undo-wire.ts` — `snapView` | may be unoffered | **yes — the whole step's writes** | **the fault; fixed by `stepPage`** |

None of these is called from inside a command's `apply` or an Undo / Redo step but `snapView`. Nothing else needed
fixing.

## Every check (in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-inputscal-own-calendar.test.tsx` | **9 passed**, exit 0 (`.tmp/k7b-green1.txt`) — the two red tests green, the new Redo test green |
| `npx vitest run src/ui/msq-guard-doors-bell.test.tsx src/ui/msq-guard-rollcall.test.ts src/ui/msq-inputscal-own-calendar.test.tsx src/state/edit-rights-readers.test.ts` (B23 and every K6 test, the roll-call, the role-question count test) | **4 files, 139 passed**, exit 0 (`.tmp/k7b-named1.txt`) |
| every undo test file: `src/undo/` and the 21 `src/state/*undo*` files | **27 files, 199 passed**, exit 0 (`.tmp/k7b-undo.txt`) |
| `npm test` — the full unit suite, under the checks lock (waited for another chat's lock to free; taken; released after the build) | **1146 of 1146 files passed; 17803 passed, 5 expected fail, 20 skipped, 6 to-do, of 17834** (K7's 17832 plus the two new tests); exit 0; 1551 s (`.tmp/k7b-full.txt`, `.tmp/k7b-full-exit.txt`) |
| `npm run build`, under the lock, right after | passed — the typecheck and the build (491 modules), exit 0 (`.tmp/k7b-build.txt`) |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx`, high complexity — not this section's file, as in K7), exit 1 as before (`.tmp/k7b-lint.txt`) |

## For the orchestrator

- **K8**: the Undo belt's road (K7's finding 1) is now whole on its writes — the landing comes after them. A refusal at the
  page door still returns from `snapView` after nothing changed while the step itself goes on writing (K6's belt, as the
  brief left it); moving that refusal before the step, in `globalUndo` / `globalRedo`, is still K8's.
- K7's finding 2 (a window not counted at the ask, counted again once the landing brings its page back) is untouched by
  this step; with nothing changed there, the checker would still fire on that road.
- What only a browser can show: nothing new on screen. A walker's scenario: Hunter, 142 admin with View of 149, edits a
  note on his Inputs calendar, picks 149, presses Undo from a road that reaches it — the note back on 142's calendar both
  when opened at once and after picking 149 and back to 142.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW
Changes: state/store.ts (new stepPage, the Undo's and Redo's page door: the door's question, then the page with no notify; its kept door spent by the next landing); state/undo-wire.ts (snapView through stepPage); tests — a Redo case in ui/msq-inputscal-own-calendar.test.tsx, B23's order case in ui/msq-guard-doors-bell.test.tsx, R5 (c)'s census and count re-pointed to stepPage in ui/msq-guard-rollcall.test.ts
Checks: listed above, in raptor-port/ — all PASS but the code check's one known finding outside this section
Open items: none for K7b; K8 (the refusal before the step) and K7's finding 2 as they stood
```
