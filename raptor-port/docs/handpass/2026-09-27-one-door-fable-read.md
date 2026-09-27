# Final code read — `[ONE-DOOR]` — Fable 5.1, 27 Sep 26

Brief: `docs/superpowers/briefs/2026-09-27-one-door-final-read.md`. Blind to Astra's read. The report as Fable handed it
back (saved by the builder); the dispositions are in the evidence sheet `docs/handpass/2026-09-27-one-door.md` §8.

Read: the brief; the evidence sheet §4, §5, §5b, §7, §10 and walk3's results; the plan and its §9; the walk design; ui-contracts §Admin → Users — one door; how-we-work D280–D324 and leave-war "Also read"; the whole `git diff origin/main...claude/one-door -- raptor-port/src`; and the untouched readers the brief names (`availableFor`, `publish.ts` roster comparison, `reprojectRoster`'s keep rule, `poDueNow`, `projectPeople`, the command layer's rollback, the undo timeline's eligibility, `persist.ts`, `perms.ts`, `auth.ts`, `quals-write.ts`). Ran only `stints.test.ts` + `onedoor.test.ts` (39 passed). Nothing edited, no browser.

## 1. Findings — most severe first

### F1 (medium) — Archive of a man whose SANS posting has RUN stores a different posting date depending on the Show SANS switch
**Where:** `raptor-port/src/leavewar/state/store.ts:1763` `closeStintOnArchive` — first line reads `state.people.find(p => p.id === id)`. **New in this branch** (the delete, `forgetPersonFrom` line 1614, has the same root on `main` — noted below).

**Why:** `state.people` is the DISPLAYED roster. For a man whose SANS posting has run, `reprojectRoster` lays `windowFor(rec, showSans)` on him: with Show SANS **on** his `to` is `null` (he is in the SANS group, tracked — D283); with it **off** his `to` is the posting date. `closeStintOnArchive` decides from that `to`, so the same tap stores two different truths.

**Scenario:** Post Ranger out as SANS from 20 Sep (past); the pass ticks him SANS. (a) Show SANS **on** → Admin → Users → Ranger → Archive. Stored: `to = 26 Sep`, outcome overseas, `poDone 27 Sep`; his SANS tick is taken back, so on the war he reads as an ordinary squadron man here 20–26 Sep and hatched from 27 Sep. (b) Same, but Show SANS **off** first → Archive. Stored: `to = 19 Sep` (date kept), outcome flipped to overseas, `poDone 20 Sep`; he reads away from 20 Sep. Once the outcome is overseas `windowFor` never applies the SANS rule again, so the toggle position at the moment of the tap is frozen into the record for good. The manning counts and availability for 20–26 Sep, and whether his leave in those days is tracked, differ between (a) and (b). The disproof is the stored record after (a) vs (b). No test covers a run SANS posting + Archive with Show SANS on; the walk's `sans` scene used a hand-ticked SANS man.

**Whatever he answers** on which reading is right, the record must not depend on a display switch. **Fix:**
1. In `closeStintOnArchive` (store.ts:1763), take the man's DATES from his stored record, not the displayed row: `const shown = state.people.find(p => p.id === id); const w = state.postOuts[id]; const person = shown ? (w ? { ...shown, ...windowFor(w, false) } : shown) : (identity && withStored(identity))`. (`withStored` at line 1604 should also pass `false`, not `state.showSans`, for the same reason.)
2. This keeps the SANS posting's date (D323 (1): "a posting that already closed his stint keeps its date"). If he would rather the SANS-tracked days count as "here", make THAT the explicit rule in the same place — either way not the toggle.
3. Add a test in `onedoor.test.ts`: SANS posting run on 20 Sep, Show SANS on, `archivePerson` → `war(id).to === '2026-09-19'`; then the same with Show SANS off → identical record.
4. Same root in `forgetPersonFrom`'s `cut` (line 1614, `state.people.flatMap`) — on `main` already; fix together or file it.

### F2 (medium-low) — Archive of a man the war does not show, with no past there, leaves his OLD posting record alive; Restore then reads it back as truth
**Where:** `store.ts:1763` `closeStintOnArchive` — `if (!person || person.gone) return { replaced: null }` writes nothing when `identity` is undefined; `sync.ts:1731` `archivePerson` passes `keepHidden` only when `pastOnWar` is true. **New in this branch.**

**Scenario:** Show SANS on; on the war post Drifter (a SANS man) out from 14 Oct, Overseas Sqn. Turn Show SANS off — he is hidden. He has no war record or input before today. Admin → Users → Drifter → Archive. The message says "Drifter archived" (no "replaced", because `closeStintOnArchive` returned null) but his record still holds `to = 13 Oct`, outcome overseas, `poDone` unset. Consequences: (i) `poDueNow` still finds a due posting on 14 Oct and the pass runs it on an already-archived man; (ii) open his Archived row and Restore with post-in 5 Oct → refused: "Posted out from 14 Oct — the post-in has to be on or after that day" — a posting Archive was meant to replace (D323 (3)); (iii) Restore with post-in 20 Oct → `openStint` pushes `{from, to: 13 Oct}` into `past`: the war then says he was here until 13 Oct, though he was archived on 27 Sep. A wrong record made from new data.

**Fix:**
1. In `archivePerson` (sync.ts:1731) always pass the hidden identity to the store, and decide separately whether his ROW is kept: `closeStintOnArchive(id, today, hidden ?? undefined, !!keepHidden)`.
2. In `closeStintOnArchive` add a 4th parameter `keepRow: boolean`. Build `person` as today; if `!had && !keepRow` do NOT push him into `people` — instead write only the record: `state = withCurrent({ ...state, postOuts: { ...state.postOuts, [id]: next } })` (or delete the key when `next.to === null && next.from === null && !next.past`). If `!had && !state.postOuts[id]` and no pending posting, return early as now.
3. Return `replaced` from the record's pending posting so the message names it.
4. Test: hidden SANS man, pending posting, no past → `archivePerson` → `postOuts[id].to === yesterday`, `poDone` set, `war(id)` undefined; `restoreProblem(id, '2026-10-05')` null.

### F3 (low) — Moving a restored man's post-in to the day after his earlier stint closed leaves two touching stints and a false PO corner
**Where:** `store.ts:1681` `setPostIn` — refuses `date <= lastPast.to` but accepts `date === lastPast.to + 1` without merging; `postingProblem` (kind 'in') the same. **New in this branch.** `openStint` (line 1736) already merges that case (Fable F5), so the two writers disagree.

**Scenario:** Archive Hex today (stint closes 26 Sep); Restore with post-in 19 Oct. On the war tap 5 Oct (the gap) → his Post in sheet → move the date to 27 Sep. Accepted. Stored: `past = [{…, to: 26 Sep}], from: 27 Sep`. He is counted every day, yet 26 Sep wears the PO corner titled "Hex was posted out 27 Sep — the last day of an earlier stint", and his Post in sheet reads "Back from a posting on 27 Sep — on the manpower from 27 Sep". The disproof: the corner on a day he never left.

**Fix:** in `setPostIn`, after the refusals: `if (lastPast && date === addDays(lastPast.to, 1)) { const past = person.past!.slice(0, -1); people = state.people.map(p => p.id === id ? { ...p, from: lastPast.from, past: past.length ? past : undefined } : p) }` — the same merge `openStint` does. Pin with a test beside "Fable F5" in `stints.test.ts`.

### F4 (low, on `main` too) — "Save name" on an archived man renames him on Admin → Users and Quals' past days, but his Leave War row keeps the old callsign until he is restored
**Where:** `sync.ts:1376` (the keep rule: `kept = { ...p, ...windowFor(rec, false) }` — identity frozen as last projected); `UsersPanel.tsx:360` `saveName`. Quals' old Rename had the same effect on `main`.

**Scenario:** Archive Dash; Add a person "Dash"; open archived Dash → box "Dash 2" → Save name. Admin → Users and every flown day now read "Dash 2"; the Leave War's kept row for him still reads "Dash", and the war's refusal sentences ("Dash was posted out on…") name the old callsign. Until Restore.

**Fix:** in the keep loop (sync.ts ~1370–1380) refresh the frozen identity's `callsign` from `PEOPLE[p.id].cs` when it differs (the war knows him by id; only the label changes — the same principle as `renameCallsign`). One line: `if (PEOPLE[p.id] && PEOPLE[p.id].cs !== kept.callsign) kept.callsign = String(PEOPLE[p.id].cs)`. The `sig` already carries `callsign`, so the change reaches the grid.

### F5 (low, words) — a posting due TODAY but not yet run is replaced by Archive without the message saying so
**Where:** `store.ts:1763` — `pending = person.to !== null && person.to > yesterday ? …`; `sync.ts:1731` — `pendingDate = … w0.to >= today`. Both test the DATE, not whether the posting has RUN. **New.** Reachable only when the app has been open across midnight with no notify since (the pass runs at boot and on every notify), or for a held posting (D306) whose reason has just gone. Then a Delete or SANS due today is silently turned into an overseas archive. Fix: test `poDone !== addDays(person.to, 1)` instead of the date comparison in both places.

## 2. Explicit negatives — checked and found right
- **Who may archive / restore / give a sign-in / clear a note:** `archiveProblem`, `restoreProblem`, `restoreArchivedAs` ask `mayManageRoster`; the command gate has `person.archive` (Person U, User U, LeavePersonProfile U, never own) and `person.backSeen` (own required, meta.owner = me()); `markBackSeen` clears only `me()`'s flag. `perms.test.ts` NP8 updated for the three add commands' `[T.profile,'U']`.
- **One command, three stores, rollback:** Archive throws `CmdRefused` before any write when the last admin would be locked out (`suspendForArchive` returns 'lock' without writing); Restore throws before `enableForRestore`/`back` if `openStint` refuses; `lwStore.capture` returns the pre-write baseline at enlist, and `persistNotify` inside a reducer only defers the durable write, so a refusal after the war write is rolled back and never persisted. `finishPeopleWrite()` is the last call in every apply, so nothing throws after the people persist.
- **Reload:** PEOPLE is hydrated wholesale (`persist.ts:62`), so `back`, `archivedBy 'admin'`, `deleted`, `sanBy` survive; `readPast` accepts exactly what the writers produce (I traced every writer: `past[0].from` may be null, later stints always have a day `from`, current `from` is always a day when `past` exists, strictly increasing).
- **Undo:** `people` and `settings` modules are not in the undo cutover and `lw.postouts` is deferred, so Archive, Restore, Give sign-in and the member's "Later" are never undo steps whatever they write (so the hidden-man case in F2 is not an undo step either).
- **The lock is at both writers:** `setPostOut` and `setPostIn` refuse `postingLocked`; `postingProblem` returns the sentence for 'in'/'out' and skips it for 'restore'; `undoPostOut`, `postOutProblem` and the bid sheet's `onPostOut`/`onPostIn` refuse or hide for an Admin-archived man; the pass reads `poHeldReason` directly, not the block lookup, so the Admin-archive sentence never "holds" a posting.
- **Only one body decides "in the squadron":** outside the store/sync/people engine, no reader touches a person's `from`/`to` for that meaning (the other `.from/.to` hits are leave windows, event bands and ranges). `availableFor`, availability and manning go through `inSquadron`; the grid's cell, corner and tap routing share `beforeFirstStint`/`lastDayIn`/`postingSheetFor`.
- **The posting pass after an Archive:** `poDone = to + 1` equals `poDate`, so `poDueNow` is null — it never re-runs an archive as a 'po' archive.
- **Enable refused on an archived man** at `updateAccount`; `pidProblem` refuses Give sign-in / On-the-roster onto an archived man; no new-data path yields "archived but can sign in", and `sessionLapsed` catches any such session on the next repaint.
- **The lapse effect** cannot loop (after `resetSession` the role is 'off', which returns false); a guest/pending session never lapses.
- **Restore's two modes:** UNDO clears the posting and enables only `offBy 'po'`; RESTORE opens/reopens a stint, enables whatever suspended it, sets `back`. Archive clears `back`, so no stale note. `WelcomeBack` hides for archived/deleted/guest/pending/off.
- **Never-arrived man archived:** no stint stored, record keeps his future `from`, Restore overwrites it; the war shows nothing (walk `future`, test F4).
- **Publish:** `attrsOf` carries `archived`, so Archive → pending + sign-offs fall, Restore → back (walk `published`).
- **Callsign index:** `onRosterBody` excludes archived, `advancePeople` re-indexes inside every command, so an archived man's callsign frees at once and returns on Restore.

## 3. Roll-call rows I think are missing
- **The Leave War row of an archived man after "Save name"** (F4) — not in §4; it is a surface that draws the thing you changed.
- **A man whose posting has RUN as "none" (D303, off the manpower)** — his Admin → Users row shows nothing (green Roster dot, no tag) while the war shows him posted out; `postingPendingTag` is for postings still to come. Not a ruling breach; a row with a stated "must not / should" would settle it (Fable R12's second half was dropped).
- **The Give access note when the archived holder has NO account** (`UsersPanel.tsx:154`): "An archived man is already Hex — this makes a new person." does not say the way it IS him — Restore him, then Give sign-in — so the asker who is the archived man gets a duplicate person made. A words row.
- **Archive of a man whose SANS posting has run, Show SANS ON** (F1) — the sheet's `sans` scene used a hand-ticked SANS man; the run-posting case (the walk design's S3) was neither walked nor tested.
- **Archive of a hidden man with a PENDING posting and no past** (F2).

Not raised (D56 / §10): stored one-window records, an archived seeded account still `on`, the ALL-AVAIL crowd on flown days (Q4), the hidden SANS man's kept row (Q3), past stints read-only (Q1), the "posting in" tag (Q2), the posting line's words (Q5).
