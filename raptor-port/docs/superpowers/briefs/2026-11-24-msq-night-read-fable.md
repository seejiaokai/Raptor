I read an exported copy of `fcca051f0` (the folder `read-export`), part `review/half.diff` (`2e6e6752a..fcca051f0`). Nothing was run in a browser and no file was changed: every finding below is established from the code alone.

## 1. Coverage

**Read closely (whole files or whole changed regions, traced into callers):**
- The Tracker following the pick: `tracker/storage.js`, the move code in `tracker/app/core.js` (follow / leave / empty / read, the load queue, the store mirror, the command gate's refusal path, import, save, discard), `tracker/TrackerPage.tsx`, `tracker/App.jsx`, `tracker/role.js`, `tracker/peoplewire.ts`.
- The pick and entry paths: `state/pick.ts`, `state/belltap.ts`, `state/store.ts` (enterSquadron, the two landings, the re-entry check, the bands, the member-view switch), `state/typing-hold.ts`.
- The gate's Tracker rule and page-squadron readers in `state/perms.ts` (pageUnit, ownPageMayBe, trackerCoverKind, heldByMemberView, viewOnlyPick, 7f).
- `ui/InputWindow.tsx` held-window logic, `ui/heldro.ts`, the Leave War window's band.
- `state/accounts.ts` saveAccess / setMaster / requests, `undo/describe.ts`, `state/apprseen.ts`, `ui/AccessScreen.tsx`.

**Read lightly (diff only, not traced):**
- The rest of `state/perms.ts` (account lines, request rows, posting-failed, moments), `state/undo-wire.ts`, `undo/timeline.ts`, `state/units.ts`, `ui/UsersPanel.tsx`, `ui/Login.tsx`.

**Not read:** `leavewar/sync.ts` beyond its list of changed lines, `state/notices.ts`, `state/acctlines.ts`, `state/bellsqn.ts`, `ui/SquadronsPanel.tsx`, `ui/SquadronMenu.tsx`, `ui/Drawer.tsx`, `ui/UsersFilter.tsx` and its model, all CSS, and the roughly 100 smaller files. No finding should be read as clearing these.

## 2. Findings

### F1 · Unsaved chart edits held under the member view are thrown away by a tap that opens one of his own pages · medium
- **Failure:** Hunter (142's admin, Plan of 149) picks 149, edits a chart on 149's Tracker without saving, then taps his name badge for the member view.
  - The Tracker is held on 149 and its band promises "This is 149's Tracker. Leave the member view to open it."
  - Still in the member view, he taps a bell line that opens his own Leave War or Inputs page (or any other link to one of his own pages).
  - The app brings 142 back into view, the Tracker moves to 142, and his 149 edits are dropped with no question. The Tracker's corner then reads "This change could not be saved."
  - D2318 and D2388 require the question before unsaved chart edits are lost.
- **Cause:** `state/store.ts` `landOnOfferedPage` calls `enterSquadron(myUnit(todayIso()), holdNow() === 'war', true)`. With `byPick` true, `enterSquadron` passes `mayHold = false` to `rebindStorageUnit`. `core.js` `follow(to, false)` then starts the move and `leaveSquadron` drops the draft. Every other `byPick` caller asks first (`pick.ts`, `belltap.ts`); this one does not.
- **Fix:**
  1. In `landOnOfferedPage`, before the `enterSquadron` call, compute `const u = myUnit(todayIso())`.
  2. If `trkUnitNow()` is set and is not `u`, call `trackerSwitchAsk(String(unitById(u)?.num ?? u))` from `tracker/role.js`, which `store.ts` already imports (importing `pick.ts` would be circular).
  3. If it returns a promise: remember the page asked for, put the page back with `view.setPage(LANDED.page)`, and return.
  4. When the promise resolves true, call `enterSquadron(u, holdNow() === 'war', true)`, `view.setPage(<the page asked for>)` and `notify()`. On false, do nothing.
  5. Do not simply let the Tracker hold instead. Leaving the member view afterwards with 142 in view re-enters with `mayHold` false and drops the draft anyway (`entryDue` → `enterSquadron` → `trkMayHold()` is false for an admin).
  6. F2 must be fixed too, or the question raised here cannot be seen.
- **Test that fails today:** after pick 149, a chart edit and `switchRoleView()`, calling `setPage('leavewar'); notify()` and settling should leave the edit in `core.byid` or a question up; today `storageUnit()` is `u142` and the edit is gone.

### F2 · The "Save them before switching to 142?" question is invisible and unpressable in the member view, and jams later picks · medium
- **Failure:** same start as F1 (member view, Tracker held on 149 with unsaved edits). Hunter opens the Schedules menu and picks 142.
  - The menu closes and nothing else happens: no question shows and the pick does not go through.
  - Every later pick also does nothing, because the unseen question is still open. Only Escape (which answers Stay) or going back to the admin view and opening the Tracker reveals it.
  - If he answers it there later, a pick made minutes earlier suddenly goes through.
- **Cause:** `tracker/TrackerPage.tsx` puts `inert` and the class `trk-gone` (`display:none`, `ui/scheduler/17-save-status.css`) on `.trk-host` whenever the cover is up. The question (`components/Modals.jsx` `DlgModal`) is drawn inside that host. `TrkAskOnly` and the `.trk-askonly` rule only turn `visibility` back on, which cannot show a child of a `display:none`, inert parent. `core.js` `ask` returns false while `dlg` is set, so later picks are refused silently. The unit test "held on 149 in the member view, a pick of 142 asks" checks only `core.dlg`, never the screen.
- **Fix:**
  1. In `TrackerPage`, read `const asking = useSyncExternalStore(core.subscribe, () => core.switchAsking && !!core.dlg)`.
  2. Use `const covered = !!cover && !asking` for the `trk-gone` class, the `inert` attribute and `locked`. Keep rendering the cover band from `cover`.
  3. Add `asking` to the dependency list of the layout effect that sets `inert`.
  4. The `.trk-askonly` rule already hides everything but the question, so no CSS change is needed.
  5. "Save them" will still be refused here by the gate (the Tracker is not the page's own squadron). Either leave that (the box says "This change could not be saved." and he stays) or offer only "Discard them" and "Stay" in this state. That second option is new words and so his call.
- **Test that fails today:** rendering `TrackerPage` in that state and calling `pickSquadron('u142')`, `#dlgModal` should have no inert or `trk-gone` ancestor; today it does.

### F3 · Undo of a Save that changed a role and a squadron right names only the role · low
- **Failure:** Saber opens Hunter's row, picks Member and saves; the same command ends Hunter's Plan of 149. Undo's bubble reads "Undid: Hunter's role" while it also gives the Plan back. The same happens for Member → Admin with Plan of 149 given in one Save.
- **Ruling:** D2396 (o) approved naming every change of one Save. The questions page ("New, found while checking", item 1) says this very case "is settled by (o)'s answer B".
- **Cause:** `undo/describe.ts` `accessLabel` has `if (roleCh && mark === null) return `${poss(acct)}role`` before the squadron parts are gathered. Its own comment says the case was left for his word.
- **Fix:**
  1. Delete that early return.
  2. After the squadron `parts` loop, if `roleCh && mark === null`: where `parts` is empty and `!nameCh`, return today's `${poss(acct)}role`.
  3. Otherwise put a role part first in `parts` and fall through to the joined label. The role part's words have no approved drawing, so show them to him first (D1625).
- **Test that fails today:** `describe` of an `account.access` entry whose forward changes are an account row admin → main plus a deleted Plan row for 149 should contain "Plan of 149 ended"; today it is "Hunter's role".

No high-severity finding. In what I read closely, I found no path where one squadron's Tracker records are written into another's:
- memory is emptied before the door moves;
- the store is synchronous, so the wait in `leaveSquadron` does drain every job waiting on it;
- reads begun on the old door are fenced by `memEpoch`;
- rule 7f refuses the page's own writes while the door is not the page's squadron.

## 3. Unproven leads
- `core.js` `leaveSquadron` clears `sylDirty` on a dropped draft but leaves the edited chart in memory. If the same squadron is wanted again before `emptyForMove` runs (the "pick back" branch of `runFollow`), the dropped edits stay drawn as if saved. This needs two entries inside one tick; a test calling `follow(B, false)` then `stay()` with a dirty chart would settle it.
- `leaveSquadron` notes his course for the squadron before the load queue drains, so a course switch still queued is not the one remembered. Cosmetic.
- An opened Admin → Users row with unsaved picks when another squadron is picked: I did not trace whether the row closes or keeps a stale draft of squadron lines. The gate judges the Save either way.
- The Tracker's per-person view notes in the browser are keyed by course id without the squadron. Two squadrons seeded with the same course ids would share "last chart / last student" notes: view-only, demo data.
- `landOnOfferedPage` runs on every notify. A page set and a squadron change arriving in the same notify are read as "the squadron moved", not "he opened a page". I did not find a caller that does both.

## 4. Tidiness note (changed lines only; filed, not fixed)
- The test "admin of that squadron by a Plan or the master mark, read from the account" is written out four times in `state/perms.ts` (`ownPageMayBe`, `trackerCoverKind`, `heldByMemberView`, `menuSquadrons`), each with its own `ACCOUNTS_LIST.find`. One helper would stop them drifting.
- Seven comments point at `core.js followUnit`, which does not exist; the code is `startFollow` / `runFollow`.
- `store.ts` `realNotify` now runs three standing checks plus the bands on every notify, and `enterSquadron` repeats two of them inline.
