## Security read: chat 156 SANS words and rules (copy at 0eaacc411)

**Scope.** I read the brief, the whole round's diff, `state/perms.ts` (all of the notices, settings and system-actor gates, the command table and the member section; I skimmed the account, unit and restore helpers), `leavewar/sansunfiled.ts`, the SANS parts of `leavewar/sync.ts` (`followUpsFor`, `followUpsOwed`, `warLinesOwed`, `warLineCovered`, `warNoticesReversed`), `command/commit.ts`, the settings write hook in `state/people-settings-commit.ts`, and `docs/data-model.md` §11 plus the Notice entry.

**How I ran the proofs.** The copy cannot run its own tests: its `tsconfig.node.json` is missing, and every file fails to transform. So I ran my test files from `D:\raptor-work\c156-read-sec\` with a config of my own (`vitest.sec.config.ts`: tsconfig lookup off, the leavewar setup, TZ Pacific/Midway). That folder holds a junction to the copy's node_modules. Nothing in the copy was changed. The command was `cd /d/raptor-work/c156-read/raptor-port && npx vitest run --config /d/raptor-work/c156-read-sec/vitest.sec.config.ts <file>`.

---

### SEC156-1: an admin of another squadron can light, or put out, a man's SANS reminder (the new count row has no owner rule)
- **Where:** `state/perms.ts adminOwnerViolation`, its settings loop, which checks only `seen:`, `noticeseen:`, `apprseen:` and `reqseen:`. The rows are written by `leavewar/sansunfiled.ts` `wireSansBackBefore` → `onCommit` → `commitProjection('sans.planned')`. `storage/keyowner.ts` lists `sansplan:` as a community row, so the row names no squadron.
- **Case (msq world, Wed 15 Jul 26):**
  - Hex (`rocky`, 142's) is posted out as SANS from Fri 17 Jul by Saber and planned on Sat 18. He reads his reminder.
  - Kestrel (149's admin) runs any admin command that writes `settings/sansplan:rocky:2026-07-18 = 9`. The command passes, and Hex's bell lights again with nothing newly planned.
  - The other way round: Saber puts Hex on Sun 19, and the bell lights, as D2394 2a says it should. Kestrel then writes `sansplan:rocky:2026-07-19 = 0`, and Hex's bell goes dark.
  - The same command writing `noticeseen:rocky` is refused as "another squadron's man's read record".
- **What goes wrong:** another squadron's admin can show a man a reminder he does not owe, or hide one the rules do owe. The count also feeds the gate's `dueRead`, so a forged count changes whether a posting change owes him a line at all.
- **Cause:** the builder's reading is that the count is "written by the app, never by the person", but no gate holds that. Under §11 a `Setting` is "all the admin's", with no squadron and no writer restriction for this row.
- **Fix:**
  - In `ownershipChecks`, refuse any change to `settings/sansplan:*` unless one of these holds:
    - the actor is the system actor, `env.type === 'sans.planned'` and `env.origin === 'projection'`;
    - or it is a verified replay (`env.origin === 'restore' && REPLAY(env)?.(c)`). An admin's Undo of his planning step folds this projection into its closure and must still pass.
  - Check the row's shape there too: the id is `<pid>:<ISO day>`, the man exists, and the value is a positive whole number.
  - Name the row in §11: who writes it (the app only) and who reads it.
- **Test (red against the copy, 3 cases):** `D:\raptor-work\c156-read-sec\sec-sansplan.test.ts`, the "SEC156-1" block. It expects a refusal at the gate (`ownershipViolation` of Kestrel's put of `sansplan:rocky:2026-07-18`) and expects `commitSettingsIntent('account.update', …store.set('sansplan:rocky:…'))` to be refused, leaving the reminder as it was. The version that shows the hole passing is in `sec-sansplan-hole.test.ts.bak` (all green there).

### SEC156-2: any signed-in person can write the count outside every command, and it is saved unjudged
- **Where:** `state/people-settings-commit.ts`, the settings write hook (around lines 379–399). `noticeseen:` throws outside a command (chat 147, SEC2-2 (a)). `sansplan:` is neither a typed setting nor guarded, so it falls through to the raw write and is saved.
- **Case:** Saber plans Hex on Sun 19 and his bell lights. Ranger (a 142 member) types `store.set('sansplan:rocky:2026-07-19', 0)` in the browser console. Nothing refuses it, the row is saved, and Hex's newly planned day no longer lights his bell. The same bare write of `noticeseen:rocky` throws.
- **Cause:** the new row prefix was added to `SETTINGS_ROW_PREFIXES` and to the community list, but not to the bare-write guard.
- **Fix:** add `if (!isCommitting() && k.startsWith('sansplan:')) throw new Error('…written only by the app')` beside the `noticeseen:` line. SEC156-1's gate rule then covers writes made inside a command.
- **Test (red):** the same file, "SEC156-2" block. Its second case, a member writing the row inside a command, is already refused (green). That is correct today.

### SEC156-3 (low; older rule, now covering a new kind of line): his "You're no longer SANS." line can be deleted by any command that touches his posting record
- **Where:** `state/perms.ts sansBackEraseViolation`. A `sansback` line may be deleted wherever the same command changes `lw.postouts/<that man>`. Since D2391 the same kind also carries the Quals untick line (`how: 'untick'`), its "taken back" (`back`) and its Redo copy (`again`). No posting ever owes these lines, and only the verified Undo or Redo deletes them honestly.
- **Case:** Saber ticks Hex SANS on Quals, files Fri 17 – Sat 18 for him, then unticks him. Hex gets "You're no longer SANS." with the hidden sentence. A hand-made envelope holding the delete of that line beside a put of `lw.postouts/rocky` (`{gone:true}`) passes `ownershipViolation`. The delete on its own is refused.
- **What goes wrong:** an own-squadron admin can silently take off the line that tells Hex his filed availability is hidden.
- **Fix:** for a line whose part has `how === 'untick'`, `back` or `again`, allow the delete only as a verified replay. Keep the posting exemption for the posting kinds (`how` of later, earlier, undone or other, or no `how`).
- **Test:** `D:\raptor-work\c156-read-sec\sec-untickerase.test.ts`. It is written to show the hole and passes now (the gate returns null). Flip its last line to expect a refusal to get the red version.

---

### Questions (no concrete failure)
- **Q1 – who reads the count rows:** members hold R on every `Setting`, so a member reads every man's count (how often each man was newly put on each date). It discloses little beyond the schedule, which members read anyway. Should §11 name this row's reader as the man himself and admins?
- **Q2 – the app's own commands (older, app-wide, not widened by this round):** `commitProjection` is exported from the command index. It runs as the system actor, which `ownershipChecks` lets through for everything except `lw.postoutRun`. The new `sans.planned` projection adds no new door; it counts only from an accepted person's command's day changes, filtered to the squadron in view.
- **Q3 – lines with no `how`:** a line with no `how` passes `sansBackCovered` (`p.how !== undefined && …`). Its days and hidden days are still checked exactly, and the bell shows only the true "hidden" sentence, so it is harmless. Writers always set `how`, so the gate could require it.
- **Q4 – rows that outlive their man:** the count rows are never removed when a man is archived, deleted or transferred. Because they name no squadron, a man who moves takes 142's counts to 149. This is for the saved-data readers (§3.2), not a security hole.

### What I checked and found sound
- A member cannot write or remove any SANS line: war kinds are refused in his section, as are the never-stored `sansdue` and malformed parts.
- A member cannot untick another man. His own untick never enlists the bell store, because the untick hook returns false when he is editing himself.
- A posting-change line or an untick line must match exactly what the change owes: what changed (`how`) and the new date (`to`), the days, the hidden days, the earlier lines it folds in (`over`) and `kept`. A "taken back" or Redo copy is refused there and passes only as the follow-up the restore owes, field for field.
- One line per man and day per command.
- Cross-squadron puts and deletes of bell lines are refused by the existing squadron check.
- The read record is still checked by squadron and still only writable inside its own command.
- On what one person sees of another: the reminder is worked out for his own bell. The greyed "+ Commitment" reads only the signed-in person's own date. The shared-offer refusal names another man's SANS date only to someone allowed to file for him, and the calendar shows who is SANS anyway.

### Tidiness note (D489, filed, not fixed)
1. **Duplicated:** `sansFiledShown` and `sansFiledOn` each walk every SANS record by man. `const p: any = (PEOPLE as any)[pid]` is repeated about eight times in `sansunfiled.ts`.
2. **Harder to follow than needed:**
   - The reminder's state is encoded in its id (`sansdue:<pid>[:n]~<day>.<count>,…`) and parsed back by `readOf`. That is why `markNoticeRead` needed a special case to keep earlier ids.
   - `sansBackCovered` is now eleven exact-match conditions, spread over the `over`, `carried` and `kept` folding.
3. **Left doing nothing:**
   - `hasReadSaved` (in `state/noticeseen.ts`) has no caller left outside tests.
   - `const start = today` in `unfiledNow` is now just today.
   - The no-`how` branch of `sansBackWords` serves only lines stored before D2391, which is demo data (D56).

**3 findings (SEC156-1, SEC156-2, SEC156-3) and 4 questions. I would fix SEC156-1 and SEC156-2 first, together:** one owner rule for the count row (the app's projection or its verified Undo/Redo only) plus the bare-write guard. Then SEC156-3.