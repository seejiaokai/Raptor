# KR-2 — the closing step and its checks, no door converted: the builder's report (chat A211, 28 Nov 26)

Built by a fresh Opus builder from `2026-11-28-msq-s1-kr2-brief.md`, branch `a211-s1`, worktree `a211-s1-kr-dd0560`.
Nothing committed, nothing pushed. **Nothing a person sees changes:** no door calls any of the new pieces, the set of
converted doors is empty, no word on screen was added or changed, the doors still call `closeShown()`.

## What was built

- **`closeOpen(skip?)`** (`ui/guard.ts`, installed into a new seam `state/guard.ts closeOpen` — the doors live in `state/`).
  One call, `closingForDoor()` true throughout (§5 step 6):
  - (a) the focused box left (`input`, `textarea`, `select`, a content-editable — not a button), committed at once, so a
    box that saves as it is left saves into the squadron still in view, and one that refuses its value drops it silently;
  - (b) every open row closed by its own `close`, in `GUARD_ORDER`, the `skip` rows left out, each close committed at once
    (`flushSync`) so the next row is read as it now is. The show-only rows close too (as `closeShown` closes them — but a
    changed settings window or a Calendar holding a form is closed as well, which `closeShown` leaves); the two edit modes
    end (Logic's waiting value written first). Not touched: the change not saved (it refuses), `trkask` (settled before
    this step), the `'no'` rows without an `end`, and any row with no `close` (today only Admin → Users' four — KR-1b's).
    A row whose close its component hands over is closed while that close is held, even when its `open()` counts nothing
    (an opened, unchanged "+ New squadron" or place row — 205's answer; `useGuardOpen`'s `counts` still decides `open()`
    until KR-5);
  - (c) the Leave War loop, `closeWarAll(flushSync)`; its `false` (a sheet that did not leave the list) is `closeOpen`'s
    answer — the door must not enter;
  - (d) straight after, in the same turn: `whatIsOpen()` null and `holdNow()` `'none'` (tested with a Plan holder's
    person window, and with the Input window and a Tracker window together).
- **§5 step 3b and step 4** (`tracker/role.js trackerSwitchAskAtDoor(to, back)`; `core.js onTrackerStay`): with chart edits
  unsaved, a box another Tracker job asked (`dlg`) is ended and answered cancelled through `trackerCloseOpen('dlg')` (the
  job-ending serial first), then the question is asked; with the question already standing (a door's, or the sign-out's),
  it is answered Stay through `onTrackerStay` (the box closed with its cancelled answer — that door then does nothing) and
  the new press waits for the old ask's promise to settle whole (its `finally` included) before asking its own. To know
  "standing", `trackerSwitchAsk` and `trackerMayLogOut` now keep their ask's promise until it settles; nothing they answer
  changes. `trackerSwitchAsk` itself is untouched in behaviour, so today's doors still stop silently on a job's box.
- **§5 step 7** (`state/doorwait.ts closeThenEnter(skip, stop, enter)` — the one helper, beside the one wait):
  `closeOpen(skip)`; false → no entry. A save going after the closing → `waitForSave()` (the doors' one wait, unchanged);
  landed → `stop()` again (the door's own steps 1–2: Not saved refuses there with the Retry note), else `enter()`;
  dropped by a press → nothing. With nothing saving, the entry is in the same synchronous run.
- **`NO_BLOCK_DOORS`** (`ui/guard.ts`, a `Set`, empty): `guardAsk` for a door in it refuses only for the change not saved
  (`{ reason: 'unsaved', id: 'unsaved', where: 'any' }`), unless the door's `skip` names `unsaved`.
- **The checker re-pointed** (`src/testing/entry-checker.ts`): at an entry by his press whose leave came from a door in
  `NO_BLOCK_DOORS`, it asks `whatIsOpen(skip)` and fails "… with "<row>" still open — … must close it before its entry
  (D2825)"; every other door keeps the old check; the second check (nothing opens behind a refusal) and the allow-list
  unchanged.
- **One small seam change:** `state/guard.ts setWarSheetsProbe` hands back the probe it replaced (the Leave War's own call
  ignores it), so a test can plant a stuck sheet and put the war's probe back.

## The builder's readings (none is his rule)

1. **The blur takes typed boxes only** (`input, textarea, select, [contenteditable]`), never a focused button or menu row —
   leaving a button saves nothing, and blurring the pressed control could move the keyboard's place.
2. **A handed close is called while it is held** even if the row's `open()` reads false (above) — so the plan's "an opened
   row closes at a door" holds now, before KR-5 drops `counts`.
3. **The Tracker's windows behind its cover are not closed** (the member view holding unsaved chart edits: the `trk` row's
   `open()` reads false under `trackerCover()`). Left as the row reads; KR-3's builder should decide whether the switch
   back needs it.
4. **Answering a standing question Stay closes only the question box** (`dlgClose` with its cancelled answer), never boxes
   queued behind it; under `switchAsking` the box up may be the "not saved" alert its Save raised — the same answer closes
   it and that ask ends as Stay.
5. **`closeThenEnter` re-runs the door's own `stop()` before entering in every case** (not only after a wait), so a save the
   closing refused at once is caught by the guard's Retry note the same way.
6. **For a door that waits, its promise is handed back** (`void | Promise<void>`), as the doors already do.

## Tests — red first, by the patch method

New: `src/ui/msq-guard-closeopen.test.tsx` (66 tests), its helper `src/test-support/msq-guard-closeopen-kit.ts`
(`krDoor` — a door made of KR-2's pieces in the plan's order, the shape KR-3 gives the pick, named so; `noBlock` puts a
door in the set for one test, emptied in `afterEach`; the template box typed and watched by an answering saver, the drops
file's stand-in written once more). Families: closeOpen by row family (24 rows by their own openers, nothing written,
nothing open or held after; the Input window's words dropped; 11 show-only windows; five at once; "+ New squadron"
opened blank; Quals' mode and words); the skip; 6a (a template time → 142 07:30, 149 untouched; a plan name → 142 renamed;
an empty plan name dropped silently; Logic's "13h" → 142 13h, 149 12h; the presets' refused name dropped, the loop never
stuck); 6c's planted stuck sheet (false, the door does not enter, the Input window closed all the same); 6d's two
same-turn checks; 3b (the "Add event" box ended, no event added, the question asked, Stay → false; the import stopped at
its second chart's question — the third never comes in); 4 (the pick's question standing: answered Stay, the pick never
made, the new question up, its flag never cleared under it); step 7 (lands → enters; fails → the Retry note "Blocked:
press Retry to save your changes, then pick 149.", 142 kept, the window closed; a pointer-down during the wait → nothing);
`guardAsk` with 'pick' put in the set by the test (the window does not refuse, the switch still does; Not saved does);
the checker (its own rule with fake answers; installed: an entry without the closing step fails by name; the whole door
passes).

Seen failing: `git diff` of the six source files to a patch, `git checkout --` those files, the new file run, the patch
applied back (`git apply`), compared. **On the old code: 61 failed / 4 passed** (that run had 65 tests; the 66th, "+ New
squadron opened blank", was added after, for reading 2, and calls `closeOpen`, which the old code does not have).

**New tests that pass on the old code, by name** (each named "(the control, passes on the old code too)" in the file):
- "closeShown() as the doors still call it leaves a changed settings window open — closeOpen() is the new step,
  closeShown() unchanged";
- "the same state asked the old way (trackerSwitchAsk): no question drawn, the press silently stays";
- "with the set left empty the pick is refused for the Input window, as before";
- "its second check stays for "Not saved": a window opened in the turn of a refusal fails by name".

**The door tests, `src/ui/msq-guard-drops.test.tsx`:** before (KR-1a's committed count at this branch's head, not re-run
by me) 58 failed / 2 passed / 2 todo, 3 unhandled errors; after (run here) **58 failed / 2 passed / 2 todo, the same 3
errors** — red by design until KR-3 / KR-4 convert the doors.

## Checks (from `raptor-port/`)

| Check | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-closeopen.test.tsx` (on the old code, the patch out) | 61 failed / 4 passed (the four controls, named above) |
| every `msq-guard-*` file but `-open` and `-drops`, every `src/tracker/*.test.*`, and the files of the touched seams (`ui/logout`, `ui/signin-hold`, `state/session`, `ui/msq-s2-rejudge3`, `ui/msq-pick-windows`, `leavewar/ui/eventsheet-presets`, `holdsheet`, `onedoor-sheets`, `sheet-order`) — one run, `--maxWorkers=4`, exit kept | PASS — 61 files, 1539 passed, 7 todo |
| after the last two edits (the handed close held; the Tracker bridge's two type notes): `msq-guard-closeopen`, `-closers`, `-rollcall`, `tracker/msq-trk-pick-ask`, `msq-trk-follows-pick`, `msq-trk-ask-keys`, `ui/logout`, `tracker/tracker` — `--maxWorkers=4` | PASS — 8 files, 302 passed (closeopen 66/66) |
| `npx vitest run src/ui/msq-guard-drops.test.tsx` | 58 failed / 2 passed / 2 todo, 3 unhandled errors — as before (red by design) |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (once, at the end) | PASS — 190/190 |
| `npm run lint:changed` | the three known `ui/UsersPanel.tsx` findings only |
| `npm run build` (through `gatelock.mjs exec`) | first FAIL — the Tracker bridge's new promise keeper lost the type of `trackerSwitchAsk`'s answer (three "implicitly any" errors, two in `state/store.ts`'s existing callers); fixed with two JSDoc type notes in `tracker/role.js`; then PASS |
| `npm run smoke:tracker` (through `gatelock.mjs exec`; the lock released, status "free") | PASS — 472 passed, 0 failed |
| `npm run docsize` | PASS ("every record accounted for"; its "OVER by 357, deferred (D29)" is the branch's, not this change's) |

(The checks lock: `take` first refused the build — the push guard reads a held lock's label against the branch, and the
brief's label names the batch branch, not `a211-s1` — so the lock was released at once and both runs went through
`gatelock.mjs exec` under an `a211-s1 — …` label, released by it each time.)

## For the walk's scenario designers — what only a browser can show

- The blur at a door (6a) in WebKit, where a pressed button takes no focus: a Duty templates time box, Plans' name box and
  an event preset's name, each focused and typed, then a door — the value saved on 142 (or dropped silently where refused),
  never on 149. In Chrome a click moves focus first, so the box's own blur runs before the door: both paths should land
  the same.
- `flushSync` inside the closing: React refuses to flush from inside a render or an effect (it warns and defers). Every
  door KR-3 / KR-4 converts must call the closing from a press or a promise, never from an effect — a walk should watch the
  console for "flushSync was called from inside a lifecycle method" at the landing's second ask and the page door.
- The Tracker's question box drawn after a job's box was ended (3b) while its shade covers the bar — that the first shade
  goes, the second is drawn, and the bar behind stays inert under it; and a second door pressed by the keys while the
  question stands (4): the question redrawn with its new words, no flicker of the page behind.
- Several windows closed in one press (the Calendar with a holiday typed, ALL AVAIL, the OIL list, the Input window, an
  OIL question over it): each goes in one frame, no window flashing back, the keyboard landing somewhere sensible.
- Nothing on screen should differ from `main` in this step (no door converted): a plain-user round over the pick, the view
  switch, the bell and the Tracker's question should show exactly today's refusals and notes.

```
Status: READY FOR INDEPENDENT REVIEW
Changes: ui/guard.ts (closeOpen; NO_BLOCK_DOORS, empty; guardAsk refusing only "Not saved" for a door in it; the seam
  installed), state/guard.ts (the closeOpen seam; setWarSheetsProbe hands back the probe it replaced), state/doorwait.ts
  (closeThenEnter — the closing, a save it started waited for with the one wait, the entry), tracker/role.js
  (trackerSwitchAskAtDoor; onTrackerStay; the standing ask kept until it settles), tracker/app/core.js (onTrackerStay's one
  registration), testing/entry-checker.ts (re-pointed for a door in NO_BLOCK_DOORS); new ui/msq-guard-closeopen.test.tsx
  and test-support/msq-guard-closeopen-kit.ts; docs/file-map.md (the chat's entry).
Checks: see the table above (working directory raptor-port/).
Open items: KR-1b (Admin → Users' four closers — closeOpen leaves those rows until then); the builder's readings 1–6 for
  the orchestrator (3 above all: the Tracker's windows behind its cover); KR-3 / KR-4 convert the doors and add them to
  NO_BLOCK_DOORS; the walk owed (nothing to see changed, by design).
```
