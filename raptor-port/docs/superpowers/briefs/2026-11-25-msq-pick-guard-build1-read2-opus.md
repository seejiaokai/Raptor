# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 2: a fresh, blind Opus reader (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`, its last section. Read from an exported copy of commit `df9a68f6a` (`C:c175b`; the handoff block, the writer's brief and round 1's three reports taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read the exported copy of commit df9a68f6a, round 2 (fresh Opus reader, blind; no handoff block or other reader's report opened; nothing changed, nothing run).

Counts: 1 HIGH, 4 MEDIUM, 6 LOW.

## HIGH 1 — The page door refuses the page, but its callers then open the Input window anyway

**Failure.** Hunter (142's admin, Plan of 149) is in the member view with 149 picked. 149 now reads "View only". The Tracker is held on 149 with an unsaved chart edit. He taps a bell line about his own 142 input. `enterForLine` answers 'here'. `ownPageRefused` passes because nothing is open. The page door lets `setPage('inputs')` through. The landing (`store.ts landOnOwnPage`) asks "Save them before switching to 142?" and puts the page back to 149's View-only Sched.

While the question is up, a save fails. He presses Discard. The plan (§4.5) asks the guard again, and it refuses with the Retry note. But the plan never says what the landing's promise `LANDASK` then resolves to. Today's body returns `true` after Discard. `topstate.ts openInputOnPage` does `ask.then(go => { if (go) open(true) })`, so `setInpEdit(row)` runs.

The result: his 142 input opens over 149's View-only Sched, under a bar reading 149, right beside a "Blocked:" note. It opens live, not greyed. In `InputWindow.tsx`, `held` only covers a page that was offered when the window opened and later stopped being offered. Here the page was never offered, and `pageSqn` (his own page) is 142, so `held` is false. Save writes 142's record under 149's number, which is the shape of security F1.

**A second road.** `leavewar/sync.ts openInputWindow` (the Leave War's clash note) does `if (CURPAGE !== 'inputs') setPage('inputs'); setInpEdit(row)`. Once re-pointed to the page door (R5 (b)), a refusal there still opens the window. That leaves the window over the page he is on: the Leave War, under a squadron he only views (the `warHeld` state, after a change he did not make). Today the landing would have brought 142 back first.

So the claim in §4.5 — "the worst [a caller that forgets to ask first] leaves is a line read or a card spent" — is untrue. The "belt" of rows 13 and 22 opens a window across squadrons. `openInputOnPage` also ignores the door's answer on the path the plan itself takes for the OIL list's card (§5.3 door 1).

**Cause.** `setPage` becomes boolean (§4.5), but no caller is told to act on `false`. The landing's re-ask after the question has no stated result.

**Fix to the plan.**
- (a) In `openInputOnPage`: `if (!setPage('inputs', opts)) return`.
- (b) The same in `openInputWindow`, `openInputsPage`, `openWarAt`, `openNewPeriod`, `openAdminUsers` and `WelcomeBack`.
- (c) In `landOnOwnPage`: where the re-ask refuses, resolve `false` and enter nothing.
- (d) A new scan in R5: every non-test call of the page door either is the last statement of its handler or has its result tested.
- (e) Tests: B19's twin for the landing's question (Discard, then the save fails: no `INPEDIT`, `UNIT` 149), and a test of the clash note on a refused page.

## MEDIUM 2 — The movable-window row also counts ALL AVAIL and Changes, so H2's other answer cannot be built as shaped

**Failure.** §3.2 (a) makes one row for every `FloatWin`: `open() = winsUp().length > 0`, which reads all of `winorder.ts UP` ("ten ids"). But `ui/availopen.ts openAvailWinFrom` and `ui/changesopen.ts openChanges` also call `forward('avail')` and `forward('chg')`, so `UP` holds twelve ids.

If he answers H2 with "ALL AVAIL / Changes do not count" (§8.1 says that is "two rows"), the movable-window row still refuses every pick while ALL AVAIL is up. The (b) rows' own predicates (`isOpen`, `chgUp`) are bypassed either way. A10 would also check the wrong box: the movable-window row has no `sel` for 'avail' or 'chg'.

**Fix.** The movable-window row reads `winsUp().filter(id => FLOAT_IDS.has(id))`, the ten ids of its `where` map. R2 asserts that 'avail' and 'chg' are not in that map. A3 gets a case for H2's other answer: ALL AVAIL up, `whatIsOpen()` null.

## MEDIUM 3 — `enterForLine`'s new signature cannot carry `skip`, `line` or `from`, so finding 11 is closed only in the table

§4.5 gives `enterForLine(u, again, door = 'line')` and calls `refuse(door, u, opts)` with no `opts` to pass. Three failures follow:

- **The OIL list's card** (§5.3 door 1) is written "with `skip: ['oilday']`". There is no slot for it, so a card whose input needs another squadron entered is refused by the list it sits in — round 1's finding 11 back again. Then `openInputOnPage`'s own `setPage('inputs')` re-asks the page door with the default `'page'` door and no skip. In N4's state, with 142's list over 149's View-only Sched, that refuses the card again. B25's last clause ("not refused by the list it sits in") fails as designed.
- **The entry checker** (§3.4) is told neither the door nor the skip. Once it is switched on in step 6, the card's entry and the landing it triggers (`landOnOwnPage → enterSquadron(home, …, true)`, with the OIL list still open) both throw in B25 and F5. So does F4's deliberate raw entry with a window open, which is not on the allow-list.
- **B6's note** (a 142 line refused inside `enterForLine`) has no `line` id. `guardnote.ts` falls to the foot, and the e2e against `p4b` fails.

**Fix.** Give it the signature `enterForLine(u, again, door, opts)`. `openNotice` passes `{ line: n.id, from }`, and the card passes `{ skip: ['oilday'] }`. `openInputOnPage(iid, first, still, opts)` hands `opts` to `setPage`. The door's id and skip are kept for the landing (the plan's one module variable) and handed to the checker, which applies the same skip. F4 goes on the allow-list by name.

## MEDIUM 4 — N6 is built on its recommendation by construction

§8 says "None is built on the recommendation". N6's row says "nothing in the code if answered as recommended", and §1 item 4 lists "a window held after midnight now also refuses his next pick" as what Build 1 leaves. The held Input window is drawn and `INPEDIT` is set, so step 1's table counts it by default.

As pressed (P5 N6), today's pick is the only way Saber gets the held window back live with his words. After Build 1 his only way on is Close, which drops them. That is a change he would see, built before he answers.

**Fix.** List N6 under "Waits on" for step 3, the first door that reads the table. Or shape the other answer now: the Input window and the Leave War sheet export "held", and their rows answer `open() && !held()` when N6 is answered the other way. Then either answer is one line.

## MEDIUM 5 — N8 has no other answer, so security F2 has no closure if he says no

The N8 row gives a recommendation and a "Blocks" cell, but no "if he answers the other way". §1's two conditions for merging Build 1 alone leave out N8. `[MSQ-NIGHT-153-OPEN]` says F2 is to be fixed before "merge live". The root (step 8) is the only other route, and it waits on N2, N9 and §5.5.

Build 1 can therefore be merged alone, by its own rules, with a Plan holder still answering a 142 OIL question from a window under a bar reading 149.

**Fix.** Add N8 as condition 3 of §1. Design the other answer, for example: the OIL tap where `ownSqnOf(row) !== pageUnit('own')` opens the bell's list instead of the window, the line then taking the page door. Give it a test, F1′.

## LOW findings

- **LOW 6 — The checker cannot catch the family it is meant to catch.**
  - It fires only on `enterSquadron` with `byPick` true and on `switchRoleInForce`. Every own-press road through `maybeReenter` (N11's Undo, and any undo that ends his right in the squadron in view) enters with `byPick` false, so "in the checker's allow-list by name" (row 21) is moot.
  - With no `ui/guard` imported (the headless state tests in the census list: `state/msq-trk-cover`, `state/perms`, `state/signin-kinds-*`), `refusalAt` is always null, so the checker never fires there.

  **Fix:** a "press in flight" mark set by the Undo/Redo engine and each door, with the checker firing on any change of the squadron in view while it is set; the test set-up imports `ui/guard`; or state both limits in §3.4.
- **LOW 7 — Two pins cannot be written as described.**
  - P5's "a spy on `refusalAt`" cannot be green on today's code: `refusalAt` does not exist until step 1. Move that half to step 1.
  - P10 and P12 pin behaviour that H2's answer may change, in a file "never edited by the build". Say which pins H2 replaces, as §8.1 does for P10 only.
- **LOW 8 — The Tracker's question can be drawn while its row says it is not.** The question raised by a pick or the landing is drawn over another page while the cover steps aside (`TrackerPage.tsx asking`, `.trk-askonly`). The row reads `!trackerCover() && …` with `where: 'tracker'`, so under N1 (b) it says "not open" while drawn. It is shaded, and `core.js ask` drops a second question, so the harm is small. **Fix:** while `core.switchAsking`, `where: 'any'` and no cover gate.
- **LOW 9 — N11's door has no place, but one exists.** §14 says the place to ask from "was not found". A concrete one: in `globalUndo`, before the step, read the top entry's changes for a squadron row (`UNIT_PFX`) whose id is `UNIT` being removed, and refuse there. Without a place, step 6 cannot build either answer.
- **LOW 10 — The closed note can be refused by its own sheet.** The closed note's "Open the Inputs page" (`ClosedNoteSheet.tsx`) calls `openInputsPage()` before `onClose()`. In the `warHeld` state, with a squadron he only views picked, the page door would refuse it on the very sheet whose button was pressed. It is the card's shape, and reachable only after a change he did not make. **Fix:** call `onClose()` first, or skip the sheet's own row.
- **LOW 11 — N2's recommended answer keeps a road by design.** "Opens live where he is" keeps the F1-shaped write — his own 142 input saved or deleted under a bar reading 149 — on purpose (D2197). The N2 row should tell him that plainly, so he answers knowing it.

## Explicit negatives (checked, nothing found)

- **The page door's coverage.** All 16 `setPage` calls outside `store.ts` are as the plan counts: 12 files, 6 of which reach `state/view` directly. Every way the landing brings his own squadron back goes through it: `landOnOfferedPage` acts only where `!pageOffered(CURPAGE)`, and `pageOffered` is false only while a squadron he only views is picked (`perms.ts viewOnlyPick`).
- **Refusing a press that changes nothing.** I found none except the `warHeld` case: a page change to the Leave War while a held war window is up does not land.
- **Changes he did not make, sign-in, sign-out.** Every `view.setPage` inside `store.ts` (`resetSession`, `refreshAccess`, `maybeReenter`, `enterSquadron`, the landings) is the app's own move, and none passes the door. `Login.tsx`'s `setPage(back)` follows `resetSession`, which enters his home, so it is never refused. Logout's `setPage` is guarded by `pageOffered`.
- **Undo (row 13).** No Undo is drawn on View-only Sched or Help (the comment at `Shell.tsx` before `pairOn`), and the backlog says the schedule pages have no Ctrl+Z (`[SCHED-CTRL-Z]`). I found no road.
- **Leave War's "make a period".** `interactions.ts` writes a period before its `setPage`, but it needs `canEditSched()`, which is false on a squadron he only views.
- **Statements about today's code, all true.** §2 and §15's claims I tested hold: `setPage` is a re-export of `view.setPage`; `landOnOwnPage` enters with `byPick` true; `switchRoleView` is synchronous; `#drawerRole` is `setDrawer(false); switchRoleView()`; `WelcomeBack` calls `markBackSeen` before `setPage`; `enterForLine` answers 'no' before any check; `OilDayList` does `setInpEdit` then `setPage`; `menuSquadrons` makes a Plan pick "View only" in the member view, so B6c's set-up holds.
- **Callers that mark something before they ask.** `openAdminUsers` (`requestAdminUsers`), `openWarAt` (`askLw` / `askRing`) and `WelcomeBack` (`focusQualsRow`, `markBackSeen`) each set something before the page. Each is reached only through a caller the plan makes ask first, or on a page that is always offered (Quals' "+ Add person").
- **The order of checks inside `enterForLine`.** The refusal comes before the Tracker's question, and `again` re-runs the whole tap, so §4.2 step 5 holds there.
- **Only his iPhone can show:** nothing new beyond §14's list.
