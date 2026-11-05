# Security read — branch claude/people-quals-1106 (night of 6 Nov 26, D1411)

Fresh reader, read only. Change read: `git diff origin/main...claude/people-quals-1106 -- raptor-port/src`
(branch head c33244216). Asked only: can anyone sign in who should not, sign in as someone else, see what he should
not, or change what he should not.

**Verdict: no hole found.**

## What was checked

| Place | What changed | Finding |
|---|---|---|
| Sign-in (`src/ui/Login.tsx`) | The two labels gain `htmlFor="luser"` / `htmlFor="lpass"`; a lint-disable comment above the username box (its `autoFocus` was already there). | No change to how a name and password are checked or to the submit. No hole. |
| Accounts (`src/state/accounts.ts`) | One lint-disable comment line above the CAT check at load. | No code changed. No hole. |
| People picker (`src/ui/PeoplePick.tsx` → `src/ui/peoplepick-model.ts`) | `cs`, `pickRoster`, `PLACEHOLDER_IDS`, `PLACEHOLDER_HEADING`, `mayPickOthers`, `pickProblem` moved to the new file. | Compared line for line with the removed block: identical bodies, same imports (`canEditSched`, `mayFileGroup`, `mayFileInputFor`, `me`, `fileForOtherRefusal`, `rosterOptions`). `mayPickOthers` was private and is now exported, but is only imported back by `PeoplePick.tsx` (line 75, `!lockOne && mayPickOthers(type)` unchanged). Every importer points at a file that exports the name (`InputWindow.tsx` now takes `pickProblem` from the model; `InputsPage.tsx` takes `PlaceholderGroup`, which stayed). The picker's offer and the refusal for a member are therefore unchanged. The new `chosen` / `inGroup` Sets are built afresh every render from the `people` prop, so they cannot hold a stale selection; they only replace `includes` lookups. And the picker is not the lock — the save boundary still asks `perms.ts`. No hole. |
| Quals column drag (`src/ui/QualsPage.tsx` ~566–625) | On a press, the hold is also let go on the words pressed; on a move, the heading under the pointer is read with `elementFromPoint` (falling back to the event target). | The drag can only START in `onDown`, which still returns at once unless `live.current.canEditQuals()` — `admin && qEditing && qualsEdit`, read live through the ref rebuilt after every commit (not cached). `onMove` and `onUp` do nothing unless `from` was set there. `pointerdown` is still attached to the live table only, not to the pinned heading row. So a member, or an admin outside Edit quals, can never reach `moveQual`. `elementFromPoint` may now name a heading in the pinned row (`.qfixed` / `.qfixed-frozen`, which carry `th[data-col]`) as the drop target; that only gives a real column key of the same list to `moveQual`, which still refuses an unknown or same key — a column order an admin in Edit quals was already allowed to set. No hole. |
| Pinned callsign heading copy (`.qfixed-frozen`) | Now drawn whether or not the browser follows the scroll (was only with it). | It draws the same heading markup as the row already on screen (`qualsHead(... canEditQuals(), armDel)`), `aria-hidden`, so it shows nobody anything new. A remove button drawn in it for an admin in Edit quals is not wired: the pinned row's only handler sorts; removal is handled only by the live table's click handler, which checks `canEditQuals()` again. No hole. |
| Quals outline state (`backHl`) | Comment and lint note only (kept as state). | Not a permission. No hole. |
| Quals filter box / "Add qualification" | `aria-label` added; the span became a `<label htmlFor>`. The add bar is still drawn only under `canEditQuals()`, and `addQual` is unchanged. | No hole. |
| Holidays list (`src/ui/HolidaysPanel.tsx`) | The reset of the note, the import preview and the "added" words on a change of year moved from an effect to a check during drawing (`useOnChange`); lint notes on the form. | Clears only on-screen words; nothing to do with who may add, change or remove a holiday — `holidayRemove` and the save path are unchanged, and the form's Save body is unchanged (only lint comments around it). No hole. |
| Tests / CSS | Import paths in three tests; Quals phone CSS (edge strip, hiding the moving name heading while pinching). | Not a permission surface. |

## Permissions read once and kept stale?

None found. `canEditQuals()` is read at the press through `live.current`; the picker's `mayPickOthers` and `pickProblem`
are called every render / every save; nothing new caches a role or a sign-in.

Not a finding under D56: nothing here.
