## 1. What I read

I read an exported copy of `fcca051f0`. All 43 files in `review/tonight.diff` match the diff's after-hashes. The export's own git head is a snapshot commit (`c8055a4 copy`).

I read tonight's diff, the changed source in its surrounding code, the named rulings, and the questions page (b) to (p). Main files: `tracker/app/core.js` (move, boot, questions, chart-edit flows), `tracker/storage.js`, `state/store.ts`, `state/perms.ts`, `state/pick.ts`, `state/belltap.ts`, `state/acctlines.ts`, `state/accounts.ts`, `undo/describe.ts`.

**Everything below comes from reading the code. I ran nothing, because the brief says to change no file.** Each finding still needs its failing test.

## 2. Findings

### F1. A held chart draft is destroyed by opening an own page or pressing Logout in the member view · HIGH

**Failure, route A:**
1. Hunter (home 142, Plan of 149) picks 149, opens the Tracker and makes an unsaved chart edit.
2. He taps his name badge. The member view holds the Tracker on 149 to keep the draft, and he lands on 149's View-only Sched.
3. He taps a bell line or link that opens one of his own pages, such as his Leave War.
4. 142 comes into view and the draft is gone. Nothing was asked. The corner reads "This change could not be saved."

**Failure, route B (more ordinary):** after steps 1 and 2 he presses Logout.
- The logout's Save / Discard / Stay question opens, then is cancelled at once.
- The draft is gone and he is still signed in.
- This breaks D129, D2318 and D2637, and the cover's promise that leaving the member view brings the edits back.

**Cause:**
- `state/store.ts` `landOnOfferedPage` calls `enterSquadron(myUnit(...), holdNow() === 'war', true)` with `byPick = true`, but no question was asked on this route.
- `enterSquadron` therefore passes `mayHold = false`. `core.js` `follow` clears the hold and starts the move, and `leaveSquadron` drops the draft (`dropped = !!sylDirty`).
- For Logout, `onBeforeTrackerLogout` calls `show()` (`setPage('tracker')`, not offered there), which takes this same path. `leaveSquadron` then runs `endSession` → `dlgCancelAll`, cancelling the question just raised.
- The existing test "Astra 1" walks this route only with nothing unsaved.

**Fix:**
1. In `state/store.ts`, import `trackerSwitchNeeds` from `../tracker/role.js`.
2. In `landOnOfferedPage`, replace the inner `if` with:
   ```ts
   const draftHeld = storageHeld() && trackerSwitchNeeds()
   if (opened && !ENTERING && !draftHeld) enterSquadron(myUnit(todayIso()), holdNow() === 'war', true)
   else view.setPage('viewsched')
   ```
   He stays on 149's View-only Sched until he answers the pick's question or leaves the member view.
3. In `core.js`, add this helper. F3 uses it too:
   ```js
   async function saveForQuestion() {
     const ok = await trkQuietly(() => persistSyl());
     if (!ok) await uiAlert(NOT_SAVED);
     return !!ok && !sylDirty;
   }
   ```
4. In `onBeforeTrackerLogout`, after `if (show) show();`, use:
   ```js
   switchAsking = true; notify();
   try {
     const c = await uiChoice(/* the same words and buttons */);
     if (c === 'cancel') return false;
     if (c === 'ok') return await saveForQuestion();
     await discardChartEdits();
     return true;
   } finally { switchAsking = false; notify(); }
   ```
   This shows the question when the Tracker tab cannot come forward. It also stops a refused Save from logging him out and losing the draft.

**Test that fails today:** with a draft held on 149 in the member view, `setPage('leavewar'); notify()` must leave `C.sylDirty` true, the ball in `C.byid`, and the door on `u149`.

### F2. Undo takes back a Plan or sign-in name it does not name · MEDIUM

**Failure:** Saber opens Hunter's row (Admin, Plan of 149), picks Member and presses Save, which also ends the Plan. Undo reads "Undid: Hunter's role", yet the Plan of 149 comes back too. A role change plus a sign-in rename in one Save has the same gap.

The questions page names this exact case under "New, found while checking" item 1 and says (o)'s answer B settles it. D2396 took B: "Undo should never take back something it does not name."

**Cause:** `undo/describe.ts` `accessLabel`, the early `if (roleCh && mark === null) return ...role`. Its comment keeps this on purpose because no drawing gave the words.

**Fix:**
1. In the first loop, note `roleTo = x.role` when the role changed.
2. Delete the early return.
3. After the grant loop, add:
   ```ts
   if (roleCh && mark === null && !parts.length && !nameCh) return `${poss(acct)}role`
   if (roleCh && mark === null) parts.unshift(roleTo === 'admin' ? 'Made an admin' : 'Made a member')
   ```
4. These combined words reuse the bell's wording but were not drawn, so show them to him first (D1625).

**Test that fails today:** that Save's Undo label must be `Made a member, Plan of 149 ended · Hunter`.

### F3. "Save them" in the held member view hides its refusal and kills the squadron menu · MEDIUM

**Failure:**
1. With a draft held on 149 in the member view, Hunter picks 142 and answers "Save them".
2. The gate must refuse, because the door is not his page's squadron.
3. The refusal box opens inside the hidden Tracker section, so he sees nothing and the pick does not happen.
4. Every later pick does nothing, from the top bar and the ☰ menu, because the unseen box is still up.
5. Logout then takes the F1 path.

**Cause:** `core.js` `onBeforeTrackerSwitch.ask`. `persistSyl` raises `uiAlert(NOT_SAVED)` without waiting for it, and `finally` clears `switchAsking`, so `TrkAskOnly` stops showing the dialog. The next `ask` returns false at `if (dlg)`. Tonight's wider `movesTrackerAway` makes this state reachable.

**Fix:** in `ask`, replace `if (c === 'ok') { await persistSyl(); return !sylDirty; }` with `if (c === 'ok') return await saveForQuestion();`, using the helper from F1. The refusal then shows over his current page, and the question can be asked again once he dismisses it.

**Test that fails today:** after that Save, `C.dlg` is the refusal while `C.switchAsking` is true. Once it is dismissed, a second `pickSquadron('u142')` raises the question again.

### F4. Tonight's Discard throws him out of Edit chart layout · LOW

**Failure:** in Edit chart layout with an unsaved edit, he presses + Add syllabus, + Add course or Rename course and answers Discard. The editor closes, even if he then cancels the name. Before tonight he stayed in it, and `addSyl` still branches on `if (!arrangeMode)` for that case.

**Cause:** `core.js` `leaveFlowEdits` now calls `discardChartEdits`, which also runs `toggleArrange`.

**Fix:** replace `else await discardChartEdits();` with:
```js
else { clearDirty(); await loadCourse(course); refreshSyl(); renderBoard(); renderSide(); setSaveStatus('', 'ok'); }
```

**Test that fails today:** dirty chart in the editor, `C.addSyl()`, Discard, cancel the name: `C.arrangeMode` stays true and the dropped ball is gone.

No finding on these: a write reaching another squadron during a move, a Tracker Undo crossing squadrons, Request access, the bell's three lines, the member-view band, the Filter look, the Squadron-tick clear, or Escape on rows.

## 3. Unproven leads

- Export from 142 then Import into 149 may keep course ids. `lastCoursePref` reads the plain key first, so a shared id could cost him his place on 142. Settle by importing and comparing ids.
- A move's first read of a squadron writes its upgrades raw (commands off), with no change-log batch. Settle by checking whether the database step's writer accepts that after the first mount.
- After a draft is saved following a member-view round trip, the next switch to the member view can repeat `ENTRY_TRIED`, leaving the door on 149 until a pick or page open. I found no screen where this shows. Settle with a test reading `storageUnit()` after that sequence.

## 4. Tidiness note (filed, not fixed)

- `leaveSquadron` clears `undoStack` and `redoStack` twice on the dropped path.
- The switched-on filter colours are now written out in three stylesheets.
- `whenUnitSettled` has no caller in non-test source.
