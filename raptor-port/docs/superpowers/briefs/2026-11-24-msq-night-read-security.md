I read an exported copy of `fcca051f0`.

## 1. What I read

- **Scope:** `review/tonight.diff`, security only. I read every changed source file's diff, and the whole functions around it.
- **Rights and gate:** `state/perms.ts` (page squadron, rights, gate sections 7 and 7f), `state/store.ts` (`enterSquadron`, `entryDue`, `maybeReenter`, `publishBands`, `resetSession`, `refreshAccess`, `switchRoleView`), `state/pick.ts`, `state/belltap.ts`, `state/accounts.ts` (`requestAccess`, `sessionNow`).
- **Tracker:** `tracker/storage.js`, `peoplewire.ts`, `role.js`, `undo-bridge.js`, and the move, write, Undo, import and export paths of `tracker/app/core.js`.
- **Windows and Undo:** `ui/heldro.ts`, `ui/InputWindow.tsx`, `leavewar/ui/PersonWindow.tsx`, `Sheet.tsx`, `ApprovalsPage.tsx`, and the Undo wiring.
- **Not run:** the export has no installed packages, so every finding below is traced through the code. The host must reproduce it.

**Checked and holding:**
- Gate 7f refuses Tracker writes while the door is not the page's own squadron.
- A refused grade's "last edit" pointer is not saved, because it rides the same gesture.
- A move's memory wipe is complete, and late reads are stopped by the epoch check.
- Tracker Undo is parked per squadron and cleared at sign-out. The app-wide Undo does not cover the Tracker.
- A View holder's door never leaves his home.
- Request access cannot send without a real squadron.
- The master-admin bell lines reach only the man himself.

## 2. Findings

### F1. Back from the member view over unsaved chart edits, the Leave War stays on the home squadron under the squadron picked · medium

No right is exceeded, because he is an admin of both squadrons. It is medium rather than high for that reason, but it is the "one squadron's data shown in, or written to, another" class.

**Concrete failure:**
1. Hunter, 142's admin with Plan of 149, picks 149 and opens the Tracker. He moves nothing to save yet: he makes a chart edit and leaves it unsaved.
2. He taps his name badge for the member view. The Leave War moves to 142, and the Tracker door is held on 149 for the edits.
3. He does anything that repaints, such as moving a week.
4. He taps the badge back to admin. The top bar says 149 and the Leave War tab is offered, but the Leave War loaded is still 142's.
5. He opens Leave War → Approvals. It lists 142's requests under 149, and **Approve / Refuse write into 142's war**. `decideRequests` has no band check, and gate section 7 passes because he is 142's admin.
6. It stays this way after he saves the chart, because the door does not move and so the retry key does not change. It clears only on a new pick, the next day, or opening and closing a Leave War window.

**Cause:** `raptor-port/src/state/store.ts`, `maybeReenter`. The one-try key is `day|to|war|tracker|me|held`, with no mention of the page's own squadron.
- Step 3 stores the key `day|149|142|149|Hunter|`.
- At step 4 `entryDue` correctly returns 149 (war 142, own 149), but the key is identical, so it returns without entering.
- Before tonight's hold, the door moving on an ordinary switch changed the key. The hold keeps the Tracker on 149, so it no longer does.

**Exact fix, in `maybeReenter`:**
1. After `const held = …`, add `const iso = todayIso(); const own = pageUnit('own', iso)`.
2. Replace the key with:
   `` `${iso}|${to}|${own}|${lwUnitNow() ?? ''}|${trkUnitNow() ?? ''}|${me() ?? ''}|${held ? 'held' : ''}|${trkMayHold() ? 'mayhold' : ''}` ``
3. Leave the rest as it is. At step 4 the key now differs, so `enterSquadron(149, false)` brings the war back to 149. `rebindStorageUnit(149)` answers `same` and calls `stay()`, which clears the hold and keeps the draft.
4. The `mayhold` part also closes the first lead below.

**Test that fails today:** with the Tracker loaded on 149 and `sylDirty` set, call `switchRoleView()`, `notify()`, `switchRoleView()`, and expect `lwUnitNow()` to be 149 (today it is 142).

No other findings.

## 3. Unproven leads and items outside a rights hole

- **Plan lowered to View during the member-view hold:** the same key stops the release that `trkMayHold`'s comment promises ("a right taken away never waits"). 149's chart stays in memory, but I found no screen that shows it, because the Tracker is not offered there. Settled by F1's `mayhold` key.
- **Not a rights hole, but a proven draft loss:** in the member-view hold, a bell line or link to an own page runs `landOnOfferedPage` → `enterSquadron(home, …, true)`. `byPick=true` turns the hold off, so his unsaved chart edits are dropped with no question. The fix would be to ask first through `askBeforeEntering`, or to pass `byPick=false` for this landing.
- **Held Input window can lose its lock:** take a window held by a pick on another man's input, switch to the member view and back. React sets and then removes the form's `inert`, while `holdReadOnly` still believes it is locked and watches only added or removed nodes. The boxes become live under the grey band. Save, Delete and Take me out stay stopped by `held` or their own inert foot. Unproven whether any control inside the form writes at once (an attachment is the one to check).
- **Moved man's old Tracker:** with unsaved edits at his own move's midnight, he can close the chart editor and keep reading 142's Tracker until the next midnight, with no band (`TrkMoveBand` draws only in the editor). Writes are refused. Whether D2243 Q7 meant this to last once the editor is closed is for the owner's ruling.

## 4. Tidiness note (filed, not fixed)

- "Is he an admin of this squadron, read from the account" is written twice in `perms.ts` (`trackerCoverKind`, `heldByMemberView`), and could be one helper.
- `leaveSquadron` clears `undoStack` and `redoStack` in the dirty branch and again on the next line.
