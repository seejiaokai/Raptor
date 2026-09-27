# Fable 5.1 — code read of the finished `[POST-OUT-OUTCOMES]` (branch `claude/post-out-outcomes`, HEAD `eab942e4`), 27 Sep 26

*(Saved as returned; read-only, nothing run. The brief: `raptor-port/docs/superpowers/briefs/2026-09-27-post-out-outcomes-read-brief.md`.
Dispositions: the evidence sheet §6.)*

Read-only. Nothing run, nothing edited. Read: every `[POST-OUT-OUTCOMES]` commit (Part A `f6eace85`…`45342999`, the merge `4f3c40cc`, Part B `d11ae598`…`db15e3b2`) as diffs; the named files in full or in their changed regions; the evidence sheet; the plan (Round 2 taken as winning); both scenario briefs; the rulings named; data-model §3 and §11; bug-check order §2b, §4, §6. Enumerated from the promise outward (every writer, reader, door, role, order), assuming the defect could be a missing call site.

## Findings, most serious first

### 1. A kept request that spans the cutoff is marked REMOVED when its landed row sits on a day from the cutoff — its past days lose it, and a published day he flew can read pending (NEW — FIX FIRST)
**Where:** `raptor-port/src/state/person-delete.ts:238-248` (step 3, the `unacceptInput` loop at line 243) with `raptor-port/src/engine/slots.ts:665` (`unacceptInput` ends with `inp.acc='r'` — the DORMANT state, "silent everywhere": `inputDormant`, `inpShow`, and `availableFor` at `sync.ts:825` all skip an `'r'` input).
**Scenario:** Hex files a Training 28 Sep–2 Oct; the scheduler accepts it onto the ground programme while on Wednesday 30 Sep's board (the Personal Inputs panel offers it on every covered day), so its one row lands on 30 Sep. Monday 28 Sep is published with an ALL AVAIL puck whose crowd excluded Hex (the Training's hours overlap the window). Hex is deleted with a cutoff of 30 Sep (a posting Delete dated 30 Sep, or Admin → Users on the day). Expected (D297/D299, the file's own header "Days BEFORE the cutoff are never touched"): the row leaves Wednesday, the Training reads 28–29 Sep "till 29 Sep", Monday and Tuesday still show it, Monday reads 0 pending. Actual: `bySrc` holds every `gone` AND `ended` input; the loop calls `unacceptInput` for the Wednesday row, which sets the input's `acc` to `'r'`; step 4b then trims the end date but leaves `'r'`. So the kept part is dormant: it vanishes from Monday's and Tuesday's Personal Inputs, the Inputs page shows it as taken off (offering Accept again), and on published Monday the working crowd now counts Hex (`availableFor` skips a removed request) — "1 pending", the four fall, on a day he flew. (The Leave War is untouched: its absence index reads only leave/medical/course/OD types and ignores `acc`.)
**New or on main:** new — `applyDelete` is this change.
**Fix (exact):**
1. In `applyDelete`, before the day loop, `const endedSet = new Set(ended)`.
2. Replace line 243 with: un-land the row, then for an `ended` input restore its previous `acc` (a `gone` input keeps `'r'`; it is spliced at 4b anyway).
3. Tests (`person-delete.test.ts`): (a) a `'g'` request starting before the cutoff, ending after, its row on a day ≥ cutoff → after the delete the row is gone from that day, `acc` is `'g'`, `endDate` is the day before the cutoff, `remarks` carry the till tail; (b) the same with a published day BEFORE the cutoff holding an ALL AVAIL puck whose frozen crowd excluded him for that request → `dayPendingCount` stays 0 after the delete. Break test: revert step 2 → both red.
4. Evidence sheet row 22 gains the landed-spanning case.

### 2. "Undo post out" leaves the posting's suspension standing when the man was archived by hand (NEW)
**Where:** `raptor-port/src/leavewar/sync.ts:1636-1647` (`undoPostOut`, the last branch `return setPostOut(id, null)`), against `postOut`'s take-back at 1691-1699 which does cover it.
**Scenario:** the admin archives Hex by hand on Quals (✕) while an Overseas posting dated tomorrow stands. Tomorrow the pass runs: `if (!body.archived)` is false so `archivedBy` stays empty (correct — the archive is the admin's), and `suspendForPosting` sets his account `on:false, offBy:'po'`. The admin then opens Hex's greyed cell → Undo post out. `body.archivedBy !== 'po'`, `sanBy` unset → plain `setPostOut(id, null)`: the posting clears, `enableAfterPosting` is never called, the account stays suspended and still tagged as the posting's, though no posting exists. Moving the same posting's date later DOES re-enable it — the two doors disagree.
**New or on main:** new.
**Fix (exact):** in `undoPostOut` also take back when `accountSuspendedByPosting(id)`. Test: hand-archive, overseas posting runs (account off, `offBy 'po'`), Undo post out → account on with no `offBy`, body still archived, posting gone; and the mirror: a hand Suspend before the posting stays suspended after Undo post out.

### 3. A SANS man deleted while Show SANS is OFF has no war row to keep — his past leave and OIL are never shown again (NEW; low, or his call)
**Where:** `raptor-port/src/leavewar/state/store.ts:1570-1588` (`forgetPersonFrom`, the `had === false` path) via `sync.ts:1535` (`deletePersonOnWar`) from `person-delete.ts:340`.
**Scenario:** Vector is SANS with leave and an OIL credit in August; Show SANS is off (no row on the grid). Admin → Users → Delete account → Tap again. Later the admin turns Show SANS on. Expected (D299 §5): his row for the months he was here. Actual: no row — the war had no person to close the window on and mark `gone`, his Raptor body is now `archived` so `projectPeople` never emits him again. The same delete made with Show SANS ON keeps him (order-dependent past).
**Fix (exact):** (1) `forgetPersonFrom(id, iso, frozen?)`: when `!had && frozen`, push `{ ...frozen, to: last, gone: true }` and record it. (2) In `deletePerson`'s `apply`, BEFORE `applyDelete`: `const frozen = getState().people.some(p => p.id === id) ? null : projectPeople(true).find(p => p.id === id) ?? null`, passed through `deletePersonOnWar`. Test: SANS man, Show SANS off, delete, Show SANS on → his row with the August records, `gone`. If instead he rules a hidden SANS man stays untracked, put it on the look card — but say it either way.

### 4. The posting pass's Delete skips the stored-week preflight the door runs (note — not ranked, D56)
**Where:** `sync.ts:1469` and `1506-1511` vs `person-delete.ts:330`. A stored week to come that cannot be read or is byte-preserved is refused whole by Admin → Users, but silently skipped by a posting's Delete. One-line parity: the preflight in the scan beside `deleteBlocked`. At minimum a sentence in §8.

### 5. `applyDelete` has no in-command guard (hardening, low)
**Where:** `person-delete.ts:217`. `putNewPerson` throws unless `isCommitting()`; `applyDelete` does not. A hand-made console call runs the sweep outside any command: the mark, `indexCallsigns`, `dropAccountOfPid` and the input splices are raw writes with no rollback. **Fix:** first line `if (!isCommitting()) throw new Error('applyDelete runs only inside a command')`.

### 6. The pass can delete the signed-in admin's own person (note, design edge)
If another admin posted Saber out with Delete dated later, Saber's own session runs the pass on that date and deletes him while signed in; he keeps working as a deleted man until sign-out. Suggest: after a pass that deleted `me()`, a message ("You have been deleted from this date — sign out"), or at least the look card.

## What is MISSING from the evidence sheet (beyond 1–4 above)
- The guest view / print / CSV of a published day after a delete: not walked; sound by construction (they print the issued version) — say so in §8.
- The Tracker's "+ Add" roster after a delete: excluded (`peoplewire.ts:25` skips `archived`) — worth a roll-call row.
- A tap on a deleted man's greyed future cell opens nothing and says nothing — designed, but picture it and put it on the look card.
- An admin can still file leave or an award on a deleted man's PAST days from the war. Same as for a posted-out man today; say whether it is wanted.

## Explicit negatives — checked and found sound
- **Atomicity / saved data:** the delete is one command enlisting people, settings, scheduler and week-stash (and the war); the deferred `HOOKS.histPush` → `persistAll` files the live week, INPUTS, the plan layer and every stashed week; PEOPLE via `finishPeopleWrite`; accounts via the settings store; the war via `persistNotify` inside the enlisted store. Nothing is written outside the save step. A reload keeps the mark, drops the account, keeps `gone`.
- **The published record:** no path writes the issued snapshots; `peopleAttrsNow` returns the frozen attributes; `availableFor` reads him by date; the load belt runs on both whole-day replacements and strips every slot kind, his landed rows and his OIL switches; "Discard N edits" replaces no day; Unpublish keeps the working copy; `creditable` stops OIL from the cutoff; `forgetPersonFrom` drops only records from the cutoff.
- **Permissions:** the four new command types map to §11 rows the admin holds; `mayDeletePerson`; the own-rule `never` on `person.restore`, `lw.postout`, `lw.postoutRun`; the war's writers keep their admin check and refuse a `gone` man; `switchRoleInForce` is gated on `acct`; in the member view Edit Schedule/Admin redirect, the armed slot drops, Logic edit and ADMINOPEN clear, the war's role follows; the session is memory-only.
- **Undo:** the delete envelope is never a step and is a hard barrier for older steps sharing its records; `deadFor` passes over a step whose restore holds him on a day ≥ cutoff, re-asked just before the restore; `LAST_DEAD` reaches the three Undo buttons' hover.
- **The take-back:** the three `'po'` marks are set only by the pass; hand changes drop them; `poDone` once per date and outcome; the queued command re-checks.
- **SANS / the window:** `windowFor` is the one body; `markPostingDone` updates the record in place; with Show SANS off the kept row keeps its window and the SANS tag.
- **The callsign index:** one body, rebuilt at every roster finish and rollback; Restore refuses and Restore-as renames and restores in one command.
- **Words (D285, D300):** all as ruled; none of the old words left in UI strings.

## Verdict: FIX FIRST
Findings 1 and 2 before his look (both small, both new, both with a red-first test); 3 fixed or put to him as a question; 4–6 as hardening and sentences on the sheet.
