# The core read (D2237) — the security reader's report (blind; copy at `7dbc13fd0`)

Reader: a fresh Opus security reader (D1411), a background helper of chat 124, blind to the other two readers and to the
builder's report; brief `2026-11-20-multi-sqn-b1-core-read-brief.md`, with its scope (holes only) in its own prompt; its
own exported copy; finished whole (about 10 minutes). Its three proof tests were deleted, not kept. The report as
returned:

---

Security read of the core files (state/perms.ts, state/notices.ts, state/units.ts), exported copy at 7dbc13fd0. No handoff block was pasted after a compaction, so there was nothing to ignore. I ran three proof tests in the copy, one file at a time; all three failed (red). I deleted them afterwards, and nothing under raptor-port/src is changed.

## Holes, ranked by consequence

### S1. The commit gate fails open when the actor's account is missing from memory
- **Input I ran:** booted with a MemoryBackend and signed in as ad2 (Prowler, 142's plain admin, no right in 149), then `switchUnit('u149')`.
  - Control: `store.set('lookahead', 9)` was refused, and `u149@lookahead` stayed null.
  - Then, in memory only, outside any command: `ACCOUNTS_LIST.splice(<index of acad2>, 1)`, followed by `store.set('lookahead', 7)`.
  - Result: the saved copy held `u149@lookahead = 7`. 149's Logic was written by 142's plain admin.
- **Cause:** `levelInForce` (perms.ts ~1299) looks up the actor's account in the in-memory `ACCOUNTS_LIST`. When it is not there, it falls back to `u === UNIT ? (admin|member) : null`, which makes him an admin of whatever unit is in view.
  - Every section that calls it inherits the hole: 7 (unit records: schedule, Logic, plan), 7b (Leave War), 7c (inputs, where the man's squadron is the one in view), 7d (history), 7e (`ownsHim`: another man's bell lines and read records), 7f (Tracker) and `holidayMakerAdmin`.
  - The comment's assumption, "never a sign-in, which always has one", holds only while memory is intact.
- **Fix:**
  1. In `levelInForce`, look the account up in the stored rows (`accountImagesNow()` read through `readAccounts`), not in `ACCOUNTS_LIST`.
  2. When no account is found and the actor carries a signed-in session (`a.session?.user`, or `a.principal`), return `null`, so the write is refused.
  3. Keep the role-in-view fallback only for an actor with no session user (the test or probe sessions it was written for).
  4. Make the same change to the actor lookups in `homeUnitViolation` (~2072) and `unitRowViolation` (~1947).
  5. Add the input above as a red test.

### S2. Another squadron's man can be re-made as "new", his row rewritten and his squadron changed from today
- **Input I ran:** signed in as ad2. In memory only: `delete PEOPLE.mer9`, then `resyncPeopleBaseline()`. Then:
  `commitPeopleSettingsIntent('person.add', null, () => { PEOPLE.mer9 = {...saved, cs:'HIJACKED'}; store.set('home:hzz1', {id:'hzz1', pid:'mer9', unit:'u142', from: todayIso()}) })`
  - Result: `ok:true`. Merlin's callsign became HIJACKED, the home row was stored, and `homeOn('mer9')` became u142 from today.
  - So 142 changed 149's man (D2191) and moved him on a day already begun (D2119), with no 149 admin involved.
- **Cause:** `homeUnitViolation` treats any people change with no before-image as a man made by this command (`made`). It then judges his squadron from the "after" rows and skips the leaving-squadron check (`if (made.has(pid)) continue`).
  - The people store takes its before-image from `PEOPLE_BASELINE`, which is memory.
  - The saved-copy checks that closed the same trick for requests and bell lines (`writtenAsNewViolation`, `storedRowViolation`) cover only `inputs` and `notices`, never `people`.
- **Fix:**
  1. Widen `StoredRowProbe` and `writtenAsNewViolation` to the `people` collection: a person put with no before-image whose id already has a saved row is refused (or judged against that saved row, as `storedRowViolation` does).
  2. In `homeUnitViolation`, count a man as made only when he has no home row in `before.homes` and no saved people row.
  3. Judge every other man's home change by the full date-by-date loop, including "never a day already begun" and "an admin of the squadron he leaves".
  4. Add the input above as a red test.

### S3. Another squadron's mission-role answers can be written, and Undo/Redo crosses into them
- **Input I ran:** signed in as ad2 with no right in 149, `switchUnit('u149')`, then a `commit({type:'insights.role.set', apply(txn){ txn.enlist(roleStore); roleStore.write([{collection:'insights.role', id, value:{…side:'red'}}]) }})` with a valid identity.
  - Result: `ok:true`, and the saved copy gained `settings/u149@missionrole:%5B1%2C%2213%2F07%2F2026…`.
- **Cause:** an `insights.role` change id (`encodeRoleId`) carries no unit. Section 7 (`unitRecordViolation`) reads the unit only from `unitOf(c.id)`, so it judges nothing here. Meanwhile the row writer (persist.ts:436) files the answer under `qualify(UNIT, …)`, the unit in view.
  - The same gap reaches Undo. undo/timeline.ts `inUnitView` treats a step whose changes name no unit as being in every unit. So an answer given in 142 can be undone or redone while 149 is in view, and the restore then writes 149's row. I traced this path in the code but did not run it.
- **Fix:**
  1. In `unitRecordViolation`, add `UNIT` to `units` for every `insights.role` change. The writer files it under the unit in view at that same moment, so the gate then judges the unit the row actually lands in.
  2. Better, carry the unit inside the change itself (for example `<unit>@<encodedId>`, split off in `roleStore` and in `decodeRoleId`'s caller). The mapper can then write `ensureUnit` instead of `qualify(UNIT, …)`, and Undo filters the step by its own unit.
  3. Add the input above as a red test, and an Undo variant: answer in 142, switch to 149, Undo/Redo; 149's rows must be untouched.

## Checked and found nothing new
- Unit-owned settings and records: the change id carries the unit (`storedKey` qualifies it), so section 7 sees 149's Logic, week rows and plan rows. The proof's control write confirmed this.
- Posting lines go only to the war's own squadron's admins (`ownSchedulerIds`). War decision and bidding lines go only to men at home in the war's squadron (`atWarHome`).
- Holiday lines still reach every squadron at the place. That breaches D2195, but it is already filed under [MULTI-SQN-DESIGN] (its full row says "a fix for chat 109"). Plan's bell (D2202) and the master's per-squadron bell (D2198) are not built; both are filed.
- How an input's days are read (`inputAtIso` / `dateOrd`) agrees between the gate's 7c and the engine; the engine treats no date range as wrapping into the next year. A move inside an input's span is read on each move day.
- In `notices.ts` (`filerVia`, `filerUnits`, `noticeLeftBell`, `adminThen`), I tried a move on the first and last day of a span, a move and back, and a right given on the move day. I found no new break: each case is held by the dated grant, `masterFrom` and `pidFrom`.
- The member section's notice door accepts only a new line, riding his own input change, to someone that change tells, carrying the filer mark, dated now, with no war part.
- `setGrant` refuses a right given on the day before a move, and the gate holds the same (`homeBefore(moveFrom)`).
- `levelFrom` never treats a View right as writing; a member holding Plan is still refused the schedule by the member section.

## Where the shape keeps breeding holes (recommendations, not findings)
1. **The gate trusts memory in three places:** the account list (S1), the roster baseline (S2, and `worldsOf`'s `personB`/`personA`, which fall back to `PEOPLE`), and `noticesBefore`, which reads `NOTICES`. Each fix round has added a saved-copy check for one collection. One change would end the family: the gate reads rights, accounts and "was it there before" only from the saved copy, and refuses whenever that read finds nothing for a signed-in actor.
2. **The squadron is a prefix on the id,** so every collection whose id lacks one (people, accounts, homes, inputs, notices, read records, history, `lw.*`, `trk.*`, `insights.role`) needed its own hand-written section (6, 7b, 7c, 7d, 7e, 7f, 8). S3 is simply a collection nobody wrote one for. One change would remove it: every change carries its squadron as a required field, set by the store that writes it, and the row writer refuses to file a unit-owned row whose change names no unit.
3. **One rule written six times:** `ok = role==='admin' ? lv==='admin' : lv==='member'||lv==='admin'` is repeated in sections 7, 7b, 7c, 7d, 7f and `lineOk`, each with its own idea of which day and which rows to read. One `mayWriteIn(actor, unit)` would remove the drift.
4. **The gate does not enforce D2203 for a forged home row.** Only the honest door (`setHome`) drops a moved man's rights. A forged home row written by someone who is admin of both squadrons (the master, or an admin holding Plan) keeps the moved man's View and Plan. I did not run this; it is low consequence, because only someone who could already give those rights can do it.
