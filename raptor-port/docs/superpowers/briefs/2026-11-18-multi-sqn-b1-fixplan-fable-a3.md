# Fable's A3 design (19 Nov 26, ~01:10, chat 109, D2208) — copy into the repo as
# raptor-port/docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixplan-fable-a3.md

Read at 765ace570, read-only.

**Recommendation: design A (write 149's stored war rows through a small second store, never a swap).** If the Delete half slips tonight, ship A for Archive / Restore / Restore as and interim guard B for Delete alone, named in the report.

## Verified
- `sync.ts swapWarWorld` re-inits the war store, then runs the posting pass, the absence and OIL passes and `lwHistInit()` — unusable inside a command.
- An unloaded squadron's war is reached through `WORLD_DOOR(unit).backend`; today only its periods are read (`storedWorld`), whose comment states the invariant this changes: "only the loaded world is ever written in a page's life".
- The war is saved one row per record (`leavewar/state/rows.ts`). Archive and Restore touch one row: `profile:<pid>` (his posting window, `post`). Delete also removes his `rec:<war>:<recId>` rows dated on or after the cutoff (each value carries `pid` and `date`).
- `store.ts closeStintOnArchive`, `openStint`, `forgetPersonFrom` compute a next `Person` from a current one, then assign module `state` — separable.
- Every load of a world runs the three passes, so a stored write needs no pass tonight; Archive sets `poDone`, so the posting pass will not repeat it.
- None of the four is a step of Undo (D350). Confirm in the undo timeline that `person.archive`, the restore types and `person.delete` are excluded.

## Design A
1. **Pure halves (`leavewar/state/store.ts`)**, no behaviour change, the existing three call them: `stintClosed(person, today) → { next, replaced }`; `stintOpened(person, date) → next | null` (no role check); `personCut(person, cutoff) → next | null`.
2. **A foreign-war store (new `leavewar/state/foreign.ts`).** One `EnlistableStore` per unit, key `lw-foreign:<unit>`: an in-memory map filled lazily for one person from `WORLD_DOOR(unit).backend` — his `profile:<pid>` row and his `rec:*` rows (filter by `pid`); read-only extras for "has a past": his ledger rows. `records()`: `lwx.profile/<unit>@<pid>` and `lwx.rec/<unit>@<warId>:<recId>` — a new collection prefix, so `lwRows` never sees them and the H2 war-unit probe does not judge them by the loaded world; the id is unit-qualified, so section 7 (`unitOf(id)`) asks "admin of 149". `capture()` / `restore()`: clone of the map. Write seam: subscribe to the command stream as `rows.ts` does; on a committed envelope, put or remove exactly the `lwx.*` rows it changed into that unit's backend, using `profileJSON` / `recJSON`; then `STORED.clear()`.
3. **Routing (`sync.ts`).** `warOf(pid)`: the loaded war when `homeOn(pid) === warUnit()`, else the foreign store. In `archivePerson`, the two restore doors and `deletePersonOnWar`: home war loaded — unchanged; otherwise `txn.enlist(foreign(unit))`, do not enlist `lwStore`, apply the pure half to the stored person. His `Person` is the stored `profile.post` if present; if absent (never posted), build it from `PEOPLE` with the roster projector without the loaded-unit filter (locate the filter inside `projectPeople`). Restore refuses with `restoreProblem`'s existing words when `stintOpened` returns null — never "That did not save" for a master who may act. Delete: `personCut` on the profile, remove his `lwx.rec` rows with `date >= cutoff`, "has a past" from the foreign rows, the inputs and his ledger rows (same three tests as `pastOnWar`).
4. **The gate (`perms.ts`).** Add `lwx.profile` and `lwx.rec` to the admin-only case list in the member switch (its `default: break` would let a member write an unknown collection). Add the rows to `docs/data-model.md` §11 and `docs/data-schema.md`.
5. **Passes.** None run for the foreign world; document in the store's header (absences and OIL worked out at that squadron's next load).

## Failing tests first (`leavewar/`; 142 loaded, signed in as Saber)
1. Archive: Kestrel's side gives Osprey a leave before today; Saber archives Osprey; 149's backend `profile:osp9` has `post.to` = yesterday, `poArchive` true, `poDone` = today; 142's backend byte-identical; then `swapWarWorld('u149')`: Osprey's earlier months show and the posting pass does not run him again.
2. Restore and Restore as: Osprey archived from 149's side; Saber restores with a post-in date; stored profile has the old stint in `past` and a new `{from: date, to: null}`; no "That did not save".
3. Restore refused in words: a date on or before the closed stint's end returns `restoreProblem`'s sentence, no row changes.
4. Delete: Osprey has a bid next month and leave last month; Saber deletes; the future `rec:` row gone, the past one kept, profile closed the day before with `gone`; a man with no past: profile row removed.
5. Rollback: force the last-admin lock (archive Kestrel, 149's only admin): refused, 149's backend byte-identical.
6. The gate: Hunter forges an `lwx.profile/u149@osp9` change: refused; a member's: refused.
7. Undo list: after the master's Archive, Undo does not offer it, and an earlier 142 step still undoes cleanly.
8. Home path unchanged: Kestrel archiving Osprey with 149 loaded writes through the loaded store as before.

## What could break
- The command layer's whole-world debug guard, if it compares only enlisted stores — register the foreign store.
- `storage/keyowner.ts` — check the guard accepts a write to a non-loaded unit's keys.
- `rulecheck` and the §11 mirror test, until the two new rows are added.
- A 149 world later loaded in the same page: `lwInitStore` reads rows fresh; add `STORED.clear()` on commit anyway.
- The seeded 149 world not yet started (`started: false`): a first write must not block later seeding — test Archive on a never-opened 149 world; if seeding is skipped once any row exists, start the world first, outside the command.

## Interim guard B (only if A slips)
In `archivePerson`, the restore doors and the delete door: when `homeOn(pid) !== warUnit()`, refuse before the command with the built sentence "He is 149's. Only an admin of 149 can change him." (`otherSquadronPersonProblem`'s words). Cost: not strictly true for a master; until the squadron menu (D2197) the master cannot archive, restore or delete a 149 man — a 149 admin must. Closes the real harm. A product compromise — tell the owner.

## After the build
Permissions and saved data: a fresh blind Opus read, Astra's read and a security read. Add a line to `docs/feature-impact.md` for the new seam ("the war is written for an unloaded squadron only by Admin → Users' four doors").
