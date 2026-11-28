# Section 1 (the guard rail), step K4 — the pick's door: the builder's report (chat 204, 26–27 Nov 26)

Brief: `2026-11-26-msq-s1-k4-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, working copy `lw-balances-hover-275293`.
Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md` not touched; `ui/UsersPanel.tsx` not touched.

**In one line: a pick of another squadron, from the top bar's list and from the ☰ menu's, now asks the guard, is refused
with the "Blocked:" note while something counts, waits for a save still going, and when it goes through closes the
windows that only show things and ends Logic's and Quals' edit modes in the same run as the entry. Four existing tests
(kind (a) of K0's census) are red and left as the brief says — see "Not done" below.**

## What changed, file by file

| File | Change |
|---|---|
| `src/state/doorwait.ts` (**new** — line for `docs/file-map.md`: "the doors' wait for a save still going: one waiting press at a time, dropped by his next press; waits on the saver's own answer, never a timer — the pick now, the view switch and a bell line at K5, K6") | `saveGoing()`, `waitForSave()` → `'go' \| 'dropped'`, `dropDoorWait()`. Imports only `storage/savewait.ts`. |
| `src/state/pick.ts` | `pickSquadron(u, opts)` in §4.2's order (below); `enterPicked` runs `closeShown()` then `enterSquadron(u, holdNow()==='war', true)` then `notify()`, one synchronous run; new `pickRefused(u)`; `pickWillAsk(u)` false where the guard would refuse. |
| `src/ui/SquadronMenu.tsx` | `pick` passes `{ from: 'bar' }` (and `void` on the promise). Nothing else. |
| `src/ui/Drawer.tsx` | `DrawerSquadron`'s `pick`: `setOpen(null)`; where `pickRefused(u) \|\| pickWillAsk(u)` → `setDrawer(false); notify()`, else the keys back on the button; then `void pickSquadron(u, { from: 'drawer' })`. |
| `src/ui/msq-guard-doors.test.tsx` (**new** — file-map line: "the guard rail's doors — the pick's halves of §4.7's B rows, pressed on the real controls") | 121 tests, 1 to-do. |
| `src/ui/msq-guard-g.test.tsx` | G1 (4 tests, 1 to-do for its bell-line sentence, K6's). |
| `src/ui/msq-guard-asis.test.tsx` | P12's Logic and Quals halves replaced by G1, by name (the plan §7's named exception). |
| `src/ui/msq-guard-open.test.tsx` | A7's Leave War pin and its Tracker half re-pointed; A14's spy put on after its set-up's pick. |
| `src/ui/msq-pick-windows.test.tsx`, `msq-pick-swap-question.test.tsx`, `msq-night-held-input.test.tsx` | kind (b), re-pointed to the raw entry and renamed. |
| `src/tracker/msq-trk-follows-pick.test.tsx` | kind (c), re-pointed to the refusal. |

The shared openers moved under my feet to `src/test-support/msq-guard-testkit.ts` (the orchestrator's change); the new
file imports them from there. No shared helper of mine was added.

## The door, as built (`state/pick.ts`)

1. the squadron already in view → nothing;
2. `refuse('pick', u, opts)` → the seam says the note (`ui/guardnote.ts`), the press ends;
3. `saveGoing()` (`saveSettling() && !saveRefused()`) → `waitForSave()`, then start again from 1;
4. the Tracker's question (`askBeforeEntering`), unchanged;
5. after Save or Discard: 1 and 2 again, and 3 again if a save is then going;
6. `enterPicked(u)`.

With nothing to refuse, no save going and no question, the pick is synchronous as before (a pin test holds it:
`UNIT` changed the moment the row is clicked). `closeShown()` already runs each open edit mode's `end()` (K1b), so Logic's
and Quals' modes end there — nothing was added for them; G1 proves it.

## Where the wait lives, and how a press is dropped

`state/doorwait.ts`, beside the seam, built once for K4–K6. `waitForSave()` listens to the saver's own state changes
(`onSaveStatus`) and resolves `'go'` the moment nothing is on its way any more or the save was refused — never a timer
of its own (D87). It also calls `flushSaves()`, so the change is sent now rather than after the saver's own 300 ms
gather-up: the same send, sooner (my call; the plan says "the save is sent first"). **A waiting press is dropped**
(resolves `'dropped'`, nothing happens when the save answers) by: a second `waitForSave()`; any door's `dropDoorWait()`
at its start (`pickSquadron` calls it first thing); and any pointer-down or key-down on the page (capture listeners on
`document` while the wait stands). The press that started the wait does not drop it: its pointer-down came before the
click. No give-up is built (D2742).

## Tests — seen failing first (the patch-file method, never `git stash`)

`git diff -- src/state/pick.ts src/ui/SquadronMenu.tsx src/ui/Drawer.tsx > .tmp/k4.patch` → `git checkout --` those three →
run → `git apply .tmp/k4.patch` (twice: once for the whole set, once after two tests were tightened).
On the old code: **`msq-guard-doors` 100 of 121 failed; G1 4 of 4 failed; the two replaced P12 tests failed; the three
re-pointed Tracker tests failed; A7's re-pointed Leave War test failed; the tightened "second pick" test failed.**

The 21 doors tests that passed on the old code are named pins, or table checks:
- **pins — today's too, titled "(pin, today's too)":** B2's pick that goes through leaving ☰ open; B4b for ALL AVAIL,
  Changes and the Tracker's four show-only windows (a pick already closed them — P19, P1 4), by each list (12);
  B11 "each opened with nothing changed: through"; B30 "the squadron already in view: still open" and "Stay keeps ALL
  AVAIL, Discard closes it"; the pick synchronous with no save going; A7's Tracker half from 150 (through).
- **table checks:** "every window row has its opener", "every 'closes' row has its opener here".
- One test passed on the old code for the wrong reason ("a second pick while the first waits": both picks went through
  at once). It now also asserts 142 is still in view while both wait, and was seen failing on the old code.

What the new file holds (the pick halves, each press the whole sequence on the real controls):
B1, B2, B3; B4 — every window row (17 rows × both lists), the document viewer over an Input window, a Leave War window
behind Inputs ("…on the Leave War"), a Tracker window behind a tab ("…on the Tracker"), the A7 Tracker half; B4b — every
`closes` row and the Calendar family unchanged (17 cases × both lists), and four of them beside an Input window (refused,
still open); B10 by both lists; B11 — six forms × both lists, "…the open row on Users…", nothing changed, and the
View-only premise settled with Admin → Users (Hunter, View of 150, the row changed on 142: refused) — the short row's
`it.todo` ("after the Admin → Users section's U1 fix merges"); B12, B13; B16 (inside every refusal, and its own test);
B19; B20 — the same-tick save sent first then the pick, a filing landing in 142's record, made to fail, a save that never
answers (a stand-in, named so), a second pick dropping the first, a pointer-down dropping it; B21; B30's four pick cases.
The note's words are read from `guardWords` / the tables, never typed.

## Existing tests re-pointed — old and new expectation

| Test | Old | New |
|---|---|---|
| `msq-guard-asis` P12 Logic (now "replaced by G1 …") | pick through, Logic still in edit mode on 149 | pick through, mode ended: no Done, Edit shown |
| `msq-guard-asis` P12 Quals (the same) | pick through, Quals still in edit mode | pick through, mode ended |
| `msq-guard-open` A7 Leave War, l.474 (cites D2403) | 150 picked, the page stays on the Leave War with the window drawn | the pick is refused: 142 in view, the window drawn, `lwsheet` named |
| `msq-guard-open` A7 Tracker half, l.966 | 150 reached by today's pick | 150 reached by the raw entry, renamed "reached by no press since D2403"; same assertions (not counted) |
| `msq-guard-open` A14, l.799 | spy on before the set-up | spy on after the set-up's pick (the pick is his own press and now asks, as it should); same assertion |
| `msq-pick-windows` — 9 kind (b) tests (l.55, 70, 95, 121, 129, 142, 213, 307, 422) | a pick holds the window under the pick's band | the same, the press the raw entry (`rawPick` = `enterSquadron(u, holdNow()==='war', true)`), each title ending "— reached by no press since D2403 … removed with the band in Build 2". l.70 passed unchanged but had lost its meaning (both picks refused), so it is re-pointed too |
| `msq-pick-swap-question` l.52, l.71 | the same, kind (b) | the same, by the raw entry, renamed |
| `msq-night-held-input` l.85 (it.each) | a pick, then the switch twice | its pick by the raw entry, renamed; the switch untouched (K5's) |
| `msq-trk-follows-pick` l.191 (kind (c)) | a question open at the pick is gone | refused (D2403): 142 in view, the question still up; closed, nothing of its job in 149 |
| `msq-trk-follows-pick` l.210 (kind (c)) | an import's box at the pick stops | refused: the box still up; closed, nothing in 149 |
| `msq-trk-follows-pick` l.443 (kind (c), its Show All half) | Show All closes at the pick | refused with Show All up; closed, the pick goes through with every window shut. The editor and marking-window halves unchanged |

`msq-pick-windows` l.235 (K0 named it kind (c)) is the switch to the member view's pin — K5's, still green, untouched.

## Not done — for the orchestrator

1. **Four tests are red and left as the brief says ("kind (a) … if one turns red, stop and report it; do not
   re-point it"):** `ui/msq-pick-windows.test.tsx` l.360 ("a Plan holder's window held at a pick of 149 stays held through
   an Undo and a Redo; 142 picked again gives it back"), l.376, l.393, l.409 (control). Each sets up a held Input window
   by a pick, which is now refused. The plan's §10 step 0 owed them to the midnight road (K0-C §1 "For kind (a)"); K0 did
   not re-point them, and this brief rules them out of K4. **The branch's unit run will be red on these four until
   someone re-points them** — the K0-C report says how: the shape of `ui/msq-fix-sched-windows-midnight.test.tsx`,
   asserting the midnight band's words; l.360's last line ("142 picked again") goes with the kind (b) tests. Everything
   else of K4 is independent of them, so I built the rest rather than stop.
2. **K0's `it.todo` pins that concern a pick were not written.** P12's armed "Discard N edits & load" was already a
   green pin at K0 (the pick drops it) and stays green. P4's other menus (the Schedule Insights menu, a board's small
   menu, a date box's calendar, the Medical page's "as of" calendar, the Leave War's Legend) are still `it.todo`: each
   closes itself on any outside press — the Schedules button's pointer-down included — before the pick is pressed, and the
   Insights menu draws only at a phone's width, which the whole-app jsdom world does not give cheaply. None of them is a
   guard row (all 'no'), so K4 changes nothing about them; they want the browser tests (K12).
3. **`npm run build` NOT RUN** — the checks lock was held by `claude/sans-warnlines-185` (chat 207, a build and a FULL
   walk) each of the four times I looked; not waited for in a loop.
4. **`msq-guard-open.test.tsx` runs out of memory** before its last test (above) — every test that ran passed.

## Where the plan or brief differed from the code, and what I did

- **B4b's "with an Input window open beside it" cannot be the Tracker's marking window:** that window closes itself on
  any press outside it (its own rule), the Schedules button's included, before the pick. The case is run for ALL AVAIL,
  Changes, Insights and the Leave War's day panel instead.
- **The board's two questions outlive the page** (their state is `ui/board.ts`'s, which the shared teardown does not
  clear): a refused pick leaves them up on purpose, so the new file puts them down in its own `afterEach`. Worth adding to
  the shared teardown when someone next touches it.
- **The A7 "squadron picked no longer offers it" rule is read for the squadron IN VIEW** (as `rowReachable` and the plan
  §3.3 build it): with Show All behind Inputs on 142, a pick of 150 is refused (142 offers the Tracker). The brief's
  "through" case is reached by the raw entry onto 150, then a pick from there goes through.
- `flushSaves()` at the start of a wait — my call, above.
- `holdNow()` is read after `closeShown()`, so a Leave War sheet that only shows things, closed by it, is still counted
  by the war's own probe until it unmounts; B4b's `lwshow` cases (Ranger's "Leave filed on the Inputs page") pass by both
  lists — the pick goes through and the sheet is gone. In a browser the war step may be held for that one beat; worth
  watching in the walk.

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-doors.test.tsx src/ui/msq-guard-asis.test.tsx src/ui/msq-guard-g.test.tsx` | **169 passed, 6 to-do** |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (background, run twice) | **340 of 341 passed, none failed; then the test worker ran out of memory** (about 4 GB, about 19 minutes in) and the last test never ran; exit 1. The same both times. Its last three describes run alone (`-t "A14 and A15\|TO_COME\|A11 — the Tracker not drawn"`): 4 passed. Not caused by K4 (three of its tests changed); the file has grown to 341 tests that each draw the whole app — **for the orchestrator: GitHub's run may meet the same; the file likely wants splitting** |
| census batch 1 — 14 files (`leavewar/groupinput`, `holnotice`, `postout-takeback`, `rolerestore`; `state/msq-fix2-*` ×3, `msq-trk-cover`, `perms`, `reshape-plan-audit-read`, `signin-kinds-*` ×4) | 294 passed |
| census batch 2 — 10 Tracker files (`msq-bell-input-ask`, `msq-bell-recheck-after-ask`, `msq-night-*` ×5, `msq-trk-ask-keys`, `msq-trk-pick-ask`, `tracker.test`) | 166 passed |
| census batch 3 — 21 `ui/` files (`accounts-ui`, `memberview`, `msq-admin-config`, `msq-board-sqn`, the guard files, `msq-night-held-input`, `msq-pick-*`, `msq-s2-asis`, `msq-sqn-menu`, `msq-sqnlist-escape-over-input`, `msq-users-filter`, `msq-view-only-menu`, `rolestable`, `schedule-insights-menu`, `topbar-pair`, `welcomeback`) | 322 passed, **4 failed (the kind (a) four)**, 6 to-do |
| `msq-trk-follows-pick` | 27 passed |
| the pins and bell files — `msq-fix-sched-windows-midnight`, `typing-hold`, `typing-hold-grid`, `reshape-r6-reenter`, `msq-fix2-r2-held-figure`, `msq-fix2-tracker-moved-master`, `msq-bell-tap`, `pops`, `view-reset`, `msq-posting-failed`, `postout-notice`, `sans-unfiled`, `bellnotices-scenarios`, `bellnotices`, `msq-bell-show`, `no-app-import`, `edit-rights-readers` | 219 passed |
| `npm run lint:changed` | 1 finding, not mine: `ui/UsersPanel.tsx` PersonEditor's complexity (the one already known; Admin → Users' file). None in K4's files |
| `npm run rulecheck` | OK (it notes Q12 could leave its baseline — not this step's) |
| `npm run build` | **NOT RUN** — lock held by chat 207 |
| the two e2e specs in the census (`e2e/insights.spec.ts`, `e2e/msq-job2.spec.ts`) | NOT RUN — browser tests, K12's, under the lock |

No full suite run (the brief forbids it on his PC).

## What only a browser can show (for K12)

- The note under `#sqnMenuBtn` at its left edge for a bar pick; at the foot, with the ☰ menu gone and the window in sight,
  for a ☰ pick (D2627 A16, the drawing p3-p) — jsdom only checks the words and that the menu closed.
- That a refused pick moves neither the picker nor the window, and the keys land back on the Schedules button visibly.
- The shaded dialogs (the templates, Plans, the board's two, the medical and OIL questions): a mouse cannot reach the
  picker over their shade; only the keys can — B4 drives them by events, which a browser must confirm by Tab and Enter.
- The wait for a save with the app's real saver: the browser store answers in the same turn, so a pick right after an
  edit should go through at once with no visible pause.

## Scenarios worth a walker's time

1. A pick with an Input window open, a word typed — by the bar, by ☰ on a phone: the note's place, the window untouched.
2. A Leave War person window left behind the Inputs tab, then a pick: "…on the Leave War"; open the war, close it, pick.
3. ALL AVAIL, Changes, the Calendar, Inputs settings (untouched) open, then a pick: each gone, no note; Inputs settings
   with a figure changed: refused.
4. Logic in edit mode with a setting changed, then a pick to 149 and back: Edit, not Done, on both; the change kept on 142.
5. "LOW LEVEL" typed in Quals' Add qualification, then a pick: refused under its own lead; clear it, pick: through.
6. Unsaved chart edits with an Input window open, then a pick: refused, and no Tracker question.
7. A pick right after an edit (within the saver's gather-up time): goes through, the edit kept on 142.
8. Ranger's "Leave filed on the Inputs page" sheet on the Leave War, then a pick of 149: the sheet gone, the war 142's,
   nothing held (the `holdNow` beat above).

## Rulings

None this step (no word of his; nothing recorded).

```
Status: INCOMPLETE — K4's door is built and its tests pass, but four kind (a) tests the brief left out of this step are red, and the build is NOT RUN (lock held)
Changes: new state/doorwait.ts and ui/msq-guard-doors.test.tsx; state/pick.ts (the door), ui/SquadronMenu.tsx, ui/Drawer.tsx (the two callers); G1 in ui/msq-guard-g.test.tsx; re-pointed tests in msq-guard-asis, msq-guard-open, msq-pick-windows, msq-pick-swap-question, msq-night-held-input, tracker/msq-trk-follows-pick
Checks: in raptor-port/ — the named vitest batches above PASS but for the four kind (a) tests (FAIL, left as the brief says); npm run lint:changed PASS for K4's files (1 known finding in UsersPanel.tsx, not mine); npm run rulecheck PASS; npm run build NOT RUN (lock held); e2e NOT RUN
Open items: msq-guard-open.test.tsx's worker runs out of memory before its last test (340/341 passed, the rest pass alone); the four kind (a) tests in ui/msq-pick-windows.test.tsx (l.360, 376, 393, 409) to be re-pointed to the midnight road; npm run build; docs/file-map.md lines for state/doorwait.ts and ui/msq-guard-doors.test.tsx (K12); P4's other-menu pins still it.todo
```
