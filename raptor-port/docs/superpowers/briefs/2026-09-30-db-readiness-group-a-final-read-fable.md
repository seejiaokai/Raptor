# Final code read, `[DB-READINESS]` group A phases 0 to 5b, Fable 5.1, 30 Sep 26

I read the plan whole, the evidence sheet, the walk driver, every file the brief names plus the ones they lead to, the diff against `main`, and the rulings the sheet lists. Nothing was edited or run. Findings first, most severe first; then the sheet's dispositions I confirm or dispute; then what I checked and found sound.

## Findings

**1. High. The permissions matrix does not match who now writes `EditLog`, `ChangeBatch` and, for a member's landing, `ScheduleDay`. IT is designing security roles from it now.**

What: group A moved every row into the client's own changeset. A history line is now one `EditLog` row written inside the actor's command. The batch is one `ChangeBatch` row written by whoever opened the group. With "no plug-in" there is no store-side writer. But §11 still says `EditLog` is "written by the store, not a role" and gives admin and member `R` only, gives `pending` nothing on `ChangeBatch`, and gives a member `R` only on the ScheduleWeek family. Translated as written, the store would refuse every member action, because every member action carries an `EditLog` insert in its changeset. The Admin → Data sweep would be refused too, since it deletes `EditLog` rows and an admin has no `D`.

Where:
- `raptor-port/docs/data-model.md:1333` (ScheduleWeek family), `:1335` (`EditLog`), `:1336` (`ChangeBatch`)
- `raptor-port/src/state/perms.ts:79`, `:81`, `:82`
- the writers: `raptor-port/src/engine/editlog.ts:149` (`writeRow` through the settings store, at `keep`, line 417 to 426), `raptor-port/src/state/changelines.ts:94`, `:142`, `:186`, `:356`, `:376` (lines logged from a member's own input, bid and Quals commands), `raptor-port/src/engine/editlog.ts:246` (`elogSweep` deletes rows), `raptor-port/src/state/store.ts:781` (the sweep and the idle line run as the system actor, so the batch names nobody)

Scenario: sign in as a member, file a leave request. The saved group holds `inputs/<iid>` (Input, own C: allowed), `weeks/<wid>#<di>` for the day it lands on (ScheduleDay: member has R only), `settings/elog:<lineId>` (EditLog: member has R only), `changes/<id>` (ChangeBatch: C, fine). Under the roles §11 describes, the changeset is rejected whole. Today nothing shows, because the browser only mirrors and `cmdAuthorize` checks command types, not tables. The observation that would disprove me: a §11 row or note saying the client principal inserts `EditLog` and that a member's own-input landing writes its day.

`main` the same? In a vaguer form, yes: `main` also wrote the whole history record from the client while §11 said "the store". Group A made it one insert per line per actor, corrected `ChangeBatch` in phase 4.1 for exactly this reason, and left `EditLog` uncorrected. That is the gap.

Fix, step by step:
1. In `data-model.md` §11 line 1335, change `EditLog` to `C R D` for Admin and `C R` for Member, and reword the note: "written by whoever made the change, in the same changeset as the rows it describes, as `ChangeBatch` is; the Admin → Data sweep deletes exact lines (D)".
2. Line 1336, give Pending `C` on `ChangeBatch`: a waiting person's one access request is a saved group with a batch.
3. In `perms.ts:81` set `[T.editlog]: row(cell('C R D'), cell('C R'))`; line 82 set `[T.changebatch]: row(cell('C R'), cell('C R'), cell('R'), cell('C'))`. `perms.test.ts` pins the two together, so change both.
4. Add `'elog.sweep': op(T.editlog, 'D')` and `'elog.line': op(T.editlog, 'C')` to `COMMAND_OPS`, and in `store.ts:781` run the door with the real actor: `commitAs({ type, scope, apply }, { actor: deriveActor(), origin: 'projection' })` imported from `../command/commit`, keeping origin `projection` so neither becomes an Undo step. The batch then names the admin who swept.
5. For the ScheduleWeek family, either land finding 2's full fix so a member's navigation never writes a day, and add a §11 note "until phase 6(c), a member's own input command writes the `ScheduleDay` it lands on, as a child of the authorised input command", or give the member `U` scoped to that one case. Say which in §12 for IT.
6. Edge cases: a guest or an account switched off writes nothing, keep them at `—`; a pending person logs no line today, so `EditLog` Pending stays `—`; the fold's `elog` converter writes rows at boot inside the boot group, which the first-boot rule already covers.

Invariant it must keep: every table a role's command puts a row into grants that role C or U on it, own or all; every delete grants D.

Test that pins it: in `raptor-port/src/state/changebatch-rollcall.test.ts`, after the battery, add a member pass (sign in as `us`, file an input, tick a qual, place a bid). For every batch that pass wrote, for every item, look up `PERMS[item.table]` for the batch actor's role and assert the act is granted, all or own. It goes red today on `EditLog`. It would also flag `leavewar/current` as a member's `Setting` write, which is already filed for group B.

**2. Medium. A week switch's landing (`sched.load`) writes input and day rows from this client's copy, which may be stale. I dispute the sheet's disposition (2), "not a loss, not a clash".**

What: `loadWeek` runs the arriving week's landing as `sched.load` and the composer writes the day rows it changed; the inputs mapper writes every input whose `acc` the landing set. Both rows are written whole from this client's copy. The client never re-reads storage while open. So a request or a day another person changed since this client booted is overwritten by navigation alone. Under the database's reject-and-reload the whole `sched.load` changeset is refused instead, which is harmless; on the stand-in the other person's edit is lost.

Where: `raptor-port/src/state/store.ts:689` (`commitSchedLoad(() => landWeek(s))`), `raptor-port/src/state/sched-commit.ts:544` to `550`, `raptor-port/src/engine/slots.ts:613` to `626` (`relandInputs` sets `acc`), `raptor-port/src/state/persist.ts:240` to `244` (the inputs mapper writes any put), `:302` and `:323` (the landing writes saved days), `raptor-port/src/state/rowmap.ts:60` to `82`.

Scenario, two tabs of one browser as the walk used them:
- Setup: request X filed for a date in week W2, W2's day row saved before X existed (so its row lacks X). Tab B boots and stays on W1. Tab A edits X's remarks and adds a note on W2's day D; A's rows land in storage.
- Action: B switches to W2.
- What shows: B's `sched.load` lands X on D, writes `inputs/X` with B's old remarks and `weeks/<W2>#<D>` from B's copy without A's note. A reload of either tab shows the old remarks and no note.
- What should: navigation changes nothing another person wrote.
- Disproof: after B's switch and a reload, X carries A's remarks and D carries A's note.

The same path makes a member's browser the writer of `ScheduleDay` and `Input` rows for other people's requests, which feeds finding 1.

`main` the same? Worse: `persistAll` rewrote `inputs/all` and the whole week on every step, so `main` overwrote more. The plan's promise is what I judge, and this is the one navigation path left that writes.

Fix, two options; I recommend the first:
1. Full: make `sched.load` a no-write command now. In `rowmap.ts`, give `Mapper` the envelope: `type Mapper = (c: Change, env?: CommitEnvelope) => RowWrite[]`, pass `env` in `mapChange` and from `mapEnvelope`. In `persist.ts` register `registerMapper('inputs', (c, env) => env?.type === SCHED_TYPES.load ? [] : rowOf('inputs')(c))`, and in `scheduleRows` return early for the loaded week when `landing` is true. The landing is re-derived at every load already: `applyWeekModel` clears `acc` 'g' on the way in, `relandInputs` preserves the book's marks, and the re-park as 'r' re-derives identically from the same inputs. The command still emits, so Undo's expectations and revisions are untouched. Keep `writeLoadedWeekAtBoot` as it is: at boot the copy was just read, so it is fresh.
2. Narrow: keep the day write and skip only an input put whose before and after differ solely by `acc` becoming `'g'`. This closes the input half only.

Edge cases: a week with no week row (`first` true) would no longer have its week row re-created by a landing, which also settles the nit that `scheduleRows:320` re-creates a missing week row on a landing although the sheet says W4-F1 stopped that (it stopped only the boot path). A landing onto a day nobody saved already writes nothing. A preserved week already writes nothing.

Invariant: a command whose actor is the system and whose origin is `seed` writes no row another person could have changed.

Test that pins it: in `raptor-port/src/state/persist.test.ts` beside "a boot on a saved week", build the scenario above with two whiteboards on one memory backend, and assert after B's `loadWeek('W2')` that the stored strings of `inputs/X` and `weeks/<W2>#<D>` equal A's, and that B's screen shows X landed. Then update the walk driver's statement (2) and `loadweek.test.ts`'s "a week switch writes the rows the landing changed" to "writes nothing".

**3. Medium. The fold journals the whole store in one `setItem`, so a browser more than about half full can never convert and shows the Retry screen for ever. D401 and D464.**

What: `runFold` builds one group holding every new row and every old blob's removal, and the Browser backend's `putMany` first writes that whole group as one journal string, then applies it. The fold is the only time a group is the size of the entire store. A browser whose store is over roughly half its quota cannot write the journal; `putMany` rejects, the boot rejects, and every later boot does the same. The only way out is clearing browser storage, which is his Tracker work.

Where: `raptor-port/src/storage/fold.ts:58` to `94`, `raptor-port/src/storage/browser.ts:74` to `78`, `raptor-port/src/storage/boot.ts:44` to `45`, `raptor-port/src/main.tsx:67` (the generic "could not load" screen).

Scenario: a browser holding twenty saved weeks, two thousand history lines, a full Leave War and his Tracker, three to four megabytes under a five megabyte quota. Boot this build. What shows: "RAPTOR could not load its data", Retry, again on every reload. What should: the store converts, or the app says exactly what to do. Disproof: a store over half the quota folds cleanly.

`main` the same? No: `main` never wrote a group the size of the store; `resetPreSchema` removes key by key. New risk from group A.

Fix, step by step:
1. In `buildFoldGroup`, compute `initialized` first, exactly as now, and write it as step 0 through `backend.put` of the stamp at format 5 in object form when the stored stamp is legacy. From then on the old sniff is never needed again, so a partial fold can never read as "not started".
2. Replace the one `putMany` with one per converter, in manifest order, each group its rows first and its old blobs' removals last; then `putMany([stamp at 6])`. `foldDue` stays "format 5", so an interrupted fold resumes; a converter whose old blobs are gone returns `[]`, and one whose blobs remain re-emits the same rows, which the store already holds.
3. Before step 2, probe: `JSON.stringify` the largest converter's group, try `setItem('raptor:__probe', that string)`, remove it; on a throw, reject with a new `StoreFullError` and in `main.tsx` show "Your browser's storage is too full to convert. Export your Tracker from its File menu, then clear old clutter on Admin → Data, then reload." Nothing is written on that path.
4. Edge cases: an unfinished group from a crash still overlays the snapshot and rides in the first converter's group as today; the wipe below 5 still runs first; a store already at 6 never enters this path.

Invariant: the store is never left stamped 6 with an old blob still present, and never left stamped "not started" with rows present.

Test that pins it: in `raptor-port/src/storage/fold.test.ts`, a backend whose `putMany` throws when an entry list exceeds N bytes; a store larger than N folds through the stepwise path to the same snapshot the one-shot fold produces; a fold interrupted after converter k resumes at the next boot to that same snapshot; a legacy bare-5 store interrupted after `inputs/all` was removed still stamps `initialized: true`.

**4. Low. A loaded week that stops splitting saves nothing from then on, and the indicator says "saved".**

What: if `splitParts` throws for the live week, `decompose` warns once and keeps one frozen record; `loadedRows` then returns null and `scheduleRows` skips every change to that week for the rest of the session. No toast, no refusal; the postman reports saved. The plan says the split "fails loudly"; it fails once in the console and then silently.

Where: `raptor-port/src/state/sched-commit.ts:107` to `124`, `raptor-port/src/state/persist.ts:271`, `:316` to `317`.

Scenario: a future field lands on `SCHED` without a home in `weekrows.ts`, or a mute key without a leading day reaches `WARNOFF`. Every board edit that session repaints and says saved; a reload shows none of them. Disproof: the edit is refused with a message, or saved.

`main` the same? No: `main` saved the whole blob whatever its shape. New failure mode from group A, and no production key form triggers it today, which is why the walk never saw it.

Fix: in `applyEnd()` in `sched-commit.ts`, after `mintOrd`, call `splitParts({ d: DAYS.slice(0, 7), ...schedFields(), wo: [...WARNOFF] }, CURWEEK)` inside a try; on `RowShapeError` throw `CmdRefused('This week can’t be saved: ' + e.message)` so the command rolls back and the toast says so. Skip the check when `isPreservedWeek(CURWEEK)`. Cost: one split per command, already memoised on the snapshot string. Invariant: a command that stands has a row for every record it changed. Test: in `raptor-port/src/state/sched-dayrecords.test.ts`, add a mute key `'x|foo'` to `WARNOFF` inside a `schedWrite` and assert the commit returns `ok: false` with that reason and storage is unchanged.

## The sheet's dispositions

Confirmed in code: H3 (first save writes the week row, its issued rows and only its touched days; a missing day reads as untouched), H1 (the boot write is one `boot` group onto existing rows only), H2 (`hold` and `elogAdoptHeld` on `onPipelineBegin`, user origin only), W5-1 (`metaWrite` as `trk.meta`), W5-2 (`saveSylPrefs` starts both writes in the turn), W3-F2 (`decideRequest` keeps the record's place), Astra B (the "last worked" pointers ride the grade's gesture flush inside its group), W1-2 and W1-3 as filed, W2-F1 as demo-only.

Disputed: (2) in "Read against the new flow", see finding 2. The landing's save is a clash whenever another person changed that request or that day since this client booted.

Kept as decided, with one note: W2-F2 and W3-F1, one row per period and per list setting. The Leave War profile row merges two logical records, the window and the label, into one physical row from "what stands now" in this client, so the same stale-last-writer class applies there on the stand-in; the database's `If-Match` on `LeavePersonProfile` covers it, and no control writes a label today.

## Explicit negatives

I checked each of these and found it sound:

- `rowmap.ts`: a row is removed only for an explicit delete; a put beats a remove within one envelope; a composer's remove with no delete to answer throws; remote envelopes are never echoed.
- `weekrows.ts`: every book field has a home per day; a key naming no day throws; issuance keys parse before `#`; `~n` is the withdrawals before issue, the Original is sequence 0; the retired entry keeps the issued record whole; `al` and `un` are not stored and `un` is rebuilt from `acc === 'r'`; a missing week row reads as current stamps; split then join round-trips and unchanged days re-split byte-identical, so an edit elsewhere never rewrites them.
- `scheduleRows`: preserved weeks are never written; a change to a week not on screen is not guessed at; off-screen saved weeks map their own rows from the weekstash change; a first save while off screen writes the week row and issued rows from the stash.
- `sched-commit.ts`: records follow the storage grain; `keepIdsOnTheirDays`; `reconcileIssuedMarks` confined to the command's days; `discardPending` names its days; the restore path re-lands per touched day and never lands another person's input.
- `inputs`, `people`, `plan` mappers: placeholders never stored; `ord` minted with ids, sparse, stable; an unshift writes one row; a renumber happens only on a closed gap inside the triggering command; hydrate reads by `(ord, id)`, keeps unreadable rows, never empties a roster, and a started store with no input rows has none.
- `changebatch.ts` and the whiteboard seal: one batch per outermost group, in the same group; items are every other row with the matrix's table; `seqs` every envelope; `boot` for a group no command opened; `clientBootId` keys; the cap retires in-group; a sealer throw sends the group without a batch rather than losing it; an abort leaves nothing.
- `fold.ts` and the converters: the manifest gate; the unfinished group rides as a superset; `initialized` decided before conversion; every converter pure, idempotent and confined to its collection; an unsplittable week is left whole and read read-only; the Leave War converter drops `personedits` (D461); the Tracker converter carries charts, layouts and every ball's details, with colon-safe keys, and sets `v3:eventinfomig` (D464, matched by `trk-rows.test.ts` and W4).
- `schema.ts`, `reset.ts`, `boot.ts`, `bootpolicy.ts`, `seeds.ts`: a store ahead in stage, format or `minClient` is refused before any write; a wipe clears `initialized` and `changes`; the boot group seals seed and stamp together or drops both; the first admin lands in that group, is idempotent by sign-in name and fails closed on every bad configuration; frozen seeds reset in place every boot; a shared store seeds nothing anywhere, including the Leave War defaults and the Tracker course.
- Leave War: `lwRows` diffs cells at envelope level, so a move is one put and an unchanged record is never written; a stale client never resurrects a deleted record; profile rows merge and go only on a delete; `readWorldRows` keeps every unreadable row and reads by `(ord, id)`; periods keep `ord` through `readWar`; `persistNotify` routes every write through a command or the turn's one projection; `sync.ts` holds no raw storage write; the boot world is written inside the boot group.
- Accounts and seen: each write stores exactly the rows its own list edit changed, never against storage; the reqseen row goes with its account; `changes.seen` and `access.seen` are own-row only and `ownershipViolation` enforces it; the older of two accounts for one person wins on load.
- Edit log: one row per line written at keep inside the command; the idle line and the sweep are commands; the cap deletes the oldest in the same group; order is `(t, lineId)` everywhere; `elogRemap` is held like a line.
- Tracker: the door writes only rows changed against this client's read, never removes an unread row; the rows subscriber writes inside the group; a write that ran its own command is never written again; Undo and Redo are one restore command; the first mount is the one exempt writer and the roll-call test fails on any other bare group; a chart switch is per person.
- Undo: every inverse maps to the same rows as its forward, including an issuance delete, a weekstash day row and a Leave War cell; `sharesKeys` is per day; `deletedRestoreProblem` and `accountsAfter` read the new rows.
- Permissions beyond finding 1: `SETTINGS_ROW_PREFIXES` make the account, request, reqseen and seen rows records; a pending person may add exactly one `accessreq:` row under his own name; `T.reqseen` and `T.seen` rows match `COMMAND_OPS`.
- `tables.ts`: every stored key names one table; Tracker row prefixes are tested before the older grammar.
- `registry.ts`, `types.ts`, `LOGICAL_TO_BLOB`: no stale entries remain.
