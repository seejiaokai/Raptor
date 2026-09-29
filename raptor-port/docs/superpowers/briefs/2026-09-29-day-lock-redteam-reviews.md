# Red team of the day lock (`[DB-SYNC-MODEL]`) — the two reports, 29 Sep 26

Round 1, from `2026-09-29-day-lock-redteam.md`, on commit 17579150. Both verdicts: **REVISE**. Kept verbatim; the fold-in and its dispositions follow in the design itself (`data-model.md` §3, §9, §12) and in this file's last section once written.

## Astra (Codex, gpt-5.6-sol, high)



1. **BLOCKER — `Amendment` and `Signoff` would be built with the wrong keys and missing state.** The model still describes a multi-day, week-numbered amendment and a sign-off containing only who/when, while the app now issues one amendment per day with per-day sequence numbers and relies on `SCHED.signBind` to enforce D103.

   **Evidence:** `data-model.md:444-466,468-490,980`; `publish.ts:30-37,54,1078-1079,1263-1311`; `data-schema.md:278`. Monday AL1 and Tuesday AL1 are both legal today, but unique `(weekId, number)` would reject the second. Unique `(weekId, dayIndex, role)` also cannot store the next set of four signatures, and omitting the binding lets an Input, Quals, posting or warning change leave stale sign-offs apparently valid.

   **Exact fix:** Replace `Amendment.weekId + number + dayIndexes` with required `scheduleDayId`, `sequence`, immutable `versionId`, one-day `snapshot`, `diff`, `itemCount`, `issuedBy`, and `issuedAt`; make `(scheduleDayId, sequence)` and `versionId` unique. Split sign-offs into mutable `WorkingSignoff(scheduleDayId, role, personId, signedAt, bindingJson)` and immutable `IssuedSignoff(amendmentId, role, personId, signedName, signedAt)`. On publish, validate the day lock, verify all four working bindings against the current effective day, then atomically write the `ScheduleDay`, `Amendment`, four issued sign-offs, and any resulting cross-module rows.

2. **BLOCKER — the separate `DayLock` table is the right placement, but the proposed row cannot identify one lease and an advisory lock is not acceptable.** `heldBy` alone treats the same user’s phone, laptop and two tabs as the same holder; a stale tab can edit or release the other tab’s lock. A version check protects a row from a committed stale overwrite, but it does not stop the former holder’s correct-version update or append-only publish after a takeover.

   **Evidence:** `data-model.md:1026-1030,1041-1054,1123-1131,1176-1182`; D355/D356 require one holder and immediate read-only after takeover. Rule 8’s proposed plug-in checks only `ScheduleDay`, although rule 2 also puts sign-offs, amendments, drafts, mutes and publishing under the lock.

   **Concrete scenario:** Saber holds Tuesday on a laptop, opens it on a phone, and the phone presses Done. The laptop still satisfies `heldBy = Saber`; alternatively Ranger takes over while Saber’s publish request is in flight, and Saber’s new `Amendment` insert succeeds because no `ScheduleDay` version changed.

   **Exact fix:** Add required-on-held `leaseId` (new GUID per take), `clientInstanceId`, `expiresAt`, and explicit `touchedAt`; release/touch must condition on the current `leaseId`. Every schedule command must carry that token. Make a server-side pre-operation rule mandatory for stage 1—not Open question 8—that checks caller, lease token and store-time expiry for every affected `ScheduleDay`, working sign-off, draft, mute, amendment and publish operation. A second device is read-only unless it explicitly takes over and receives a new lease. Keep the lock separate so minute touches do not bump the schedule row’s version.

3. **BLOCKER — the promised unchanged fan-out door has no safe way to assemble one `ScheduleDay` from today’s independently written records, and cross-day writes lack an atomic contract.** Both `weeks/<week>` and `plan/all` are mapped into the same opaque day snapshot, although the current app writes them separately; a calendar redating also changes two day rows, possibly in different weeks.

   **Evidence:** `data-model.md:336-343,351-352,817-822,854,881,996-1004`; `persist.ts:86-114` writes `plan/all` and `weeks/*` separately; `plan.ts:97-104` changes a planning row’s date; `backend.ts:20-26` currently requires an all-or-nothing group.

   **Concrete scenario:** Moving a puck from Sunday to next Monday must delete it from one `ScheduleDay` and add it to another. A fan-out adapter receiving only the new `plan/all` blob must infer both intended rows, acquire both locks, merge with each row’s schedule snapshot, and commit both versions; none of that is specified.

   **Exact fix:** Change stage 1 to consume the command stream’s explicit per-day write set rather than infer intent from whole blobs. Each command must name every affected `dayId`, expected day version and lease token. Commit the whole set as one Dataverse changeset after validating all locks in a stable `dayId` order; any failure rolls back every day. Split/join compatibility may remain only at the browser-backend boundary. Specify the cross-week acquisition screen and prohibit a move/template/person operation until all required days have been taken.

4. **BLOCKER — rule 9 omits real non-holder effects and recommendation (a) has no table capable of preserving current input-placement decisions.** Accepted activities create editable, ordered ground rows with `src`; deliberate unacceptance is separately persisted. A plain derived row would reappear or lose the scheduler’s override, while permanent deletion currently rewrites every future live and stashed day.

   **Evidence:** `data-model.md:1031-1036,1183-1192`; `store.ts:415-461,590-595`; `slots.ts:408-515,605-623`; `person-delete.ts:16-24,246-297`. D178/D179 require every member input change on a published day to become pending, and D103 invalidates all four sign-offs.

   **Concrete scenario:** A member moves a week-long input while Monday is held; at the same time an admin permanently deletes that person. Today the input projection and deletion can affect several days, including held days, but the design classifies neither as a defined day-write transaction.

   **Exact fix:** Add `ScheduleInputPlacement(dayId, inputId, state, rowId, sortIndex, overrideJson, sourceInputVersion)`, scheduler-owned and lock-protected. Absence/Input/Leave War writes update only their own rows; the effective day joins the Input with its placement, and a `suppressed` placement preserves unacceptance. Derive pending and sign-off validity from the current Input/Person versions versus the issued snapshot—no member writes `ScheduleDay`. Callsign rename, Quals, archive/SANS, Leave War decisions and OIL grants likewise update only their owning tables. Represent permanent deletion with `Person.deletedFrom`; filter that person from effective future days and make the removal pending. The next locked scheduler save materialises the filtered day. Remove physical multi-week stripping from the shared-store path.

5. **BLOCKER — the change-feed contract is not a Dataverse change-tracking contract.** A single `since(changeSeq)` cursor, globally ordered across every table, is promised, but Dataverse change tracking is retrieved one table at a time with a table-specific token; Microsoft also documents token expiry and server-defined ordering, not a cross-table transaction order. [Microsoft Dataverse change-tracking documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-change-tracking-synchronize-data-external-systems)

   **Evidence:** `data-model.md:54,856,1019-1025,1058-1065,1166-1175`. Fast sync could otherwise poll every table every second, while Dataverse applies per-user request, execution-time and concurrency limits and requires handling `429`/`Retry-After`. [Microsoft Dataverse API limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits)

   **Concrete scenario:** A Leave War decision atomically changes `LeaveBid` and `Input`. Separate table polls can deliver the Input first, advance an alleged global cursor, and show a half-applied state or skip the bid after a restart.

   **Exact fix:** Add append-only `ChangeBatch(seq, committedAt, actorId)` and `ChangeItem(batchId, ordinal, tableName, rowId, operation, rowVersion)` tables. The mandatory server plug-in writes one batch in the same transaction as every mutation. Poll only `ChangeBatch` after the last applied sequence, fetch all items, apply one batch atomically, and advance the cursor only after success. Include tombstones as items, define retention plus full-resnapshot behavior, and implement `429` backoff. Remove the claim that native per-table change tracking alone provides `since(changeSeq)`.

6. **MAJOR — the conflict rule contradicts D148’s Undo ruling.** Reject-and-reload clears a whole record’s undo stack, and at stage 1 that record is an entire day; D148 says another person changing a different thing must not prevent you undoing your own change, and only a later change to the same thing may refuse it.

   **Evidence:** `data-model.md:954-963,972`; `undo-contract.md:75-83,123-135`; D148. The mock leaves this unsettled at `day-lock.html:132`.

   **Concrete scenario:** Saber changes Monday’s note, releases it, and Ranger changes a sortie on Monday. Saber’s Undo should reverse only the note, but the whole-day revision has changed, so the proposed policy discards/refuses the undo.

   **Exact fix:** Write the lock rule now: Undo survives release and takeover until sign-out. It first takes every affected free day; if one is held, it refuses and names the holder. Apply an operation-level inverse keyed by stable row/field address, comparing each current value with that undo entry’s recorded `after` value. Refuse the whole undo only where the same address changed, naming the later actor; unrelated changes remain. Write all inverse changes atomically under the new leases. If validation fails after an automatic take, release only the leases Undo acquired.

7. **MAJOR — “arrives every 30 seconds” has no reconciliation rule for unsent writes, typing, dragging or a lock loss.** The current postman coalesces for 300 ms and retries indefinitely, while the proposed incoming side may replace a row; applying an inbound row during a gesture can erase local text, move the drag target, or allow a rejected save to be presented as saved.

   **Evidence:** `data-model.md:954-963,1005-1018,1019-1025`; `postman.ts:5-16,67-85,100-127`.

   **Concrete scenario:** Ranger takes over while Saber is dragging a puck and Saber has one unacknowledged text edit. The next poll turns the day read-only, but the design says neither whether the drag commits nor how the rejected text is retained.

   **Exact fix:** Add an inbound-apply barrier: queue complete change batches while a pointer drag, text composition, confirmation, local transaction, or unacknowledged write touches the same record. Revalidate the lease before finalising the gesture. On takeover/expiry, cancel the gesture, await/reject the in-flight mutation, restore the last acknowledged server row, and show the exact unsaved value in a recoverable message. On foreground return or deep link, finish catch-up and validate the lease before enabling any edit control. Never advance the feed cursor or repaint half a batch.

8. **MAJOR — the mock omits states users must meet and does not show partial bulk outcomes.** Every picture uses draft days; it does not show a published held day, a held day reached in another week or by direct link, takeover/expiry with a rejected save, or the result when “Edit days…” succeeds only partly.

   **Evidence:** `day-lock.html:72-112,118-122`; its owner questions at `:127-134`; rule 1 promises that a multi-take reports which days succeeded, but no such screen is drawn.

   **Concrete scenario:** An admin follows a link to published Tuesday while Ranger holds it and sees Ranger’s live working copy without knowing whether it is the issued face; on first render the controls may briefly appear editable before the lock poll completes.

   **Exact fix:** Add four mock states: (1) published/held-by-me showing “Published · working copy · N pending”; (2) published/held-by-other showing the same status, amber read-only strip, and “View issued version”; (3) deep-link/loading state with controls disabled until day plus lock are read; and (4) bulk result grouped as “Taken”, “Already held by …”, and “Failed—retry”, retaining successful leases. Add takeover/expiry feedback that says the last acknowledged save time and explicitly lists any rejected change. Render the same states after changing week and on the board.

**Overall verdict — REVISE.**



## Fable 5.1

**Fable — red team of the day lock and a row per day (`[DB-SYNC-MODEL]`, D355/D356), 29 Sep 26.** Read only; nothing changed. Every claim below was checked against `raptor-port/src` on this worktree.

---

**1. The planning layer (`PLANPUCKS`, `DAYRMK`) must NOT go into the `ScheduleDay` snapshot — it is written outside the lock, on dates that may have no day row. BLOCKER**
- **Wrong:** §3 ScheduleWeek ("the planning layer … by date" moves into the day's row) and §5 (`raptor:plan/all` → "each `ScheduleDay` snapshot"). The planning calendar is the Inputs page's month view: a scheduler drags planning pucks and day remarks onto ANY date, weeks ahead, while holding no day and while another scheduler holds that day. Today it is one global record (`state/persist.ts:104` writes `plan/all`; `state/sched-commit.ts:139` decomposes it as one record `plan/all`, not per week), and a week/day row exists only once a week has changed (`persist.ts:118-121` — "a pristine seed week is never written").
- **Scenario:** Saber holds Monday 13 Jul on Edit Schedule. Ranger, on the Inputs calendar, drags a planning puck onto 13 Jul. Under the design that is a write to Saber's held `ScheduleDay` row (advisory: lands and bumps the version → Saber's next save is refused and reloaded; strict plug-in: Ranger's puck is refused). Ranger then drops a puck on 5 Oct — a week nobody has opened: there is no `ScheduleDay` row to write into at all.
- **Fix (data-model.md):** §3: remove "the planning layer (`PLANPUCKS`, `DAYRMK`) by date" from the list of fields that move into the day row; add two stage-1 tables, `PlanningPuck` (`id`, `date` ISO, `personIds` string[] with gaps kept (`person-delete.ts:295` "a GAP, never a splice"), `version`, `changeSeq`, `isDeleted`) and `DayRemark` (`date` unique, `text`) — owner Scheduler, "outside the day lock, per-record reject-and-reload (rule 10)". §5: the `raptor:plan/all` row → "one `PlanningPuck` row per entry, one `DayRemark` per date; never inside a day row". §9 rule 10: add "the planning calendar" to the list of surfaces with no lock. Keep the archive's note that the layer was once planned per week.

**2. The fan-out must write only the days that changed AND that the writer holds — otherwise the split by day does not deliver two schedulers on one week. MAJOR**
- **Wrong/missing:** §3 says the fan-out "splits the week record into the week row and seven day rows on `put`" and the app "keeps building one week record". Today `persistAll` writes the WHOLE week string on every history step (`persist.ts:98-135`); the whiteboard skips an unchanged whole string (`whiteboard.ts:74-80`), but once split, seven day writes come out of every put unless the fan-out diffs each day. Nothing in §3/§6/§9 says so.
- **Scenario:** Saber holds Monday, Ranger Tuesday. Saber types one letter in a Monday note → the week record changes → without a per-day diff the fan-out sends all seven day rows with the versions Saber last read. Tuesday's content is Ranger's last synced copy, so it "lands" with a NEW version (a same-content write still bumps `versionnumber`) → Ranger's next keystroke is refused (412) and Tuesday reloads under him. Every keystroke of Saber's bounces Ranger — the exact failure the day split exists to remove. If Saber's tab was in the background (feed paused), his Tuesday copy is stale and the write is refused instead — a 412 on a day he never touched, which the app then "reloads" with no user action to redo.
- **Fix (§3 "The rule that makes the split work", add two sentences, and §9 rule 8):** "The fan-out keeps, per day row, the last copy read from the store and its version; on `put` it writes only a day whose content differs from that copy. **It never writes a day the signed-in person does not hold** (`DayLock.heldBy` ≠ me): such a day's local copy is replaced by the feed, never sent — a local difference on an unheld day is a bug, logged, not written. The week row is written only when its own fields changed (see 12)." Add to the stage-1 test: "a week put where only day 0 changed produces exactly one day write".

**3. The command layer's record grain is still a WEEK for the book and the mutes — undo (D148) and the version check break on it. MAJOR**
- **Evidence:** `state/sched-commit.ts:95-101` decomposes the world into `days/<wk>#<di>` (per day) but `sched.book/<wk>` (one record for `c`, `p`, `ad`, `ok`, `sg`, `sb`, `cv`, `dr`, `cd`, `cr`, `v`, `am` — every day's pending keys, sign-offs, publish state) and `sched.mutes/<wk>` (all muted warnings). The undo timeline sets a sticky barrier "on every record" a remote change wrote (`undo/timeline.ts:177-180`, `:106`) and refuses the older own step naming who. §3's claim "every field belongs to exactly one day" is true of the data, but the design only applies it to the storage fan-out, not to these records.
- **Scenario:** Saber moves a puck on Monday (writes `p` → `sched.book/<wk>`). Ranger publishes Tuesday (writes `ok`, `cv`, `p` → the same `sched.book/<wk>` record, arriving as a `remote` envelope). Saber presses Undo: barrier on `sched.book` → "You can't undo that — Ranger changed the same thing" — for a change on a different day. Conversely, if the barrier were relaxed, the restore image of `sched.book` would carry Tuesday's pre-publish state back over Ranger's publish. D148 cannot be met with a week-grained book.
- **Fix (§3, new paragraph after "The rule that makes the split work"):** "The same split applies to the command layer's records (`state/sched-commit.ts decompose`): `sched.book/<wk>` becomes `sched.book/<wk>#<di>` — the day's slice of `c`, `p`, `ad`, `ok`, `sg`, `sb`, `cv`, `dr`, `cd`, `cr` (keys split by `keyDay`, maps by their day index); `sched.mutes/<wk>` becomes `sched.mutes/<wk>#<di>` (split by the warning's `di` in `warnMuteKey`); `v` and `am` alone stay in one `sched.week/<wk>` record. A D148 barrier from another person's change then names one day, never the week." Add to §9's undo line: "an Undo step's records are per day, so a change by someone else on another day never blocks it (D148)."

**4. Writes that reach held days from outside the lock are missing from rule 9: a person's Delete, the posting pass, and the Inputs page's OIL clear all write day rows across weeks. MAJOR**
- **Evidence:** `state/person-delete.ts:261-291` — a Delete (and a posting whose outcome is Delete, run by `leavewar/sync.ts runPoOutcomes:1540` as a reconciler in whichever browser is open) strips the man from every day on or after the cutoff in the loaded week AND every stashed week (`stashEditWeek`), its sign-offs, its parked plans, in ONE all-or-nothing command. `ui/oilmode.ts:359-380` — handing a request to another man on the Inputs page clears his OIL decisions on days of every stashed week (`stashEditDays`). Neither is a member input, a Leave War decision or an OIL credit (the three rule 9 names). Archive writes the person only (`sync.ts:1783-1830`) — fine.
- **Scenario:** Ranger holds Thursday. Saber deletes Hex (posted out, leaving flying). The command writes Thursday's row. Advisory lock: lands, Ranger's next save is refused and reloaded (his last edit lost to redo). Strict plug-in (Open question 8): Thursday's write is refused → the WHOLE delete rolls back (`person-delete.ts` "all or nothing") — a Delete cannot run while any scheduler holds any future day, and the posting pass silently never completes (`PO_INFLIGHT`/`tellOnce`).
- **Fix (§9 rule 9, add):** "Three more writes reach a held day without its lock, all from the app itself, not a person's hand on the day: a Delete or a posting-out that deletes (every day to come, every week — `person-delete.ts`), a request handed to another man (his OIL decisions on every week — `ui/oilmode.ts clearOilPersonDecisions`), and a format upgrade (see 12). **Rule:** such a pass takes no lock and is allowed to write a held day, on two conditions written into the plug-in of Open question 8: the write is marked as a pass (a `passKind` column on `ScheduleDay`, set by the write and cleared by the next ordinary save), and it changes only the man or the decision it names — the holder's screen applies it at the next check as it does a member's input (D297: on a published day the day reads pending)." And in Open question 8: "the plug-in must let a marked pass through, or a Delete can never run while a day is held." Alternative to offer IT: derive D297's removal on read from `Person.deletedFrom` instead of rewriting rows — then nothing is written and the published-day comparison computes against it.

**5. `ScheduleDay` and `DayLock` rows do not exist for a week nobody has saved — a take has nothing to take. MAJOR**
- **Evidence:** any week other than the two authored ones is "a blank, editable week" built on the fly (`engine/weeks-data.ts:8,100`) and persisted only once dirty (`persist.ts:118-121`). §3 says `DayLock` is "created with the day and never deleted" and `dayId` is a required ref to `ScheduleDay`; nothing says when a day row is created in the shared store.
- **Scenario:** two schedulers open the week of 5 Oct (never saved) and both press "Edit Monday". No `DayLock` row exists; both must create it. Two inserts race; without a unique key one wins silently and both edit.
- **Fix (§3 ScheduleDay / DayLock and §9 "A take is…"):** "A `ScheduleWeek` row and its seven `ScheduleDay` rows (snapshot NULL = a blank day) and seven free `DayLock` rows are created together, in one batch, by the first take or the first save of that week; `ScheduleWeek.weekStart` and `DayLock.dayId` are unique keys, so the second creator's batch fails and it re-reads and takes normally. A blank day row (snapshot NULL) reads as the blank week reads today. Admin → Data's clear of a week tombstones its day rows and their locks together (§2 soft delete)." Make `ScheduleDay.snapshot` nullable in §3.

**6. The boot/persist reconcile still DELETES every week record the client does not hold locally — destructive from stage 1, and §7 defers the fix to "before stage 3". MAJOR**
- **Evidence:** `persist.ts:133` — `for (const id of wbRef.keys('weeks')) if (!keep.has(id)) wbRef.delete('weeks', id)` runs on every history step. §7 "Ownership before incoming sync … before stage 3". D356/rule 7 pull the feed into stage 1, so the store is shared from the first release.
- **Scenario:** Saber's tab has been in the background (feed paused, rule 7) since 09:00. Ranger creates and saves the week of 5 Oct at 09:10. Saber returns, makes one edit before the first catch-up read lands → `persistAll` → the week of 5 Oct is not in Saber's stash → deleted (tombstoned) in the store. Ranger's next save is refused against a tombstone.
- **Fix:** §7 row: change "before stage 3" to "**before the first shared release (stage 1, with the day lock)**: the reconcile never removes a store row; a week is removed only by an explicit Admin → Data action, as a tombstone, by a client that holds all seven of its days". Add the same line under §9 rule 10.

**7. Open question 9 understates what a member's input writes onto a day, and the multi-day filing breaks rule 2. MAJOR**
- **Evidence:** landing an input writes a ground row on the day (`engine/slots.ts acceptInput:432`) AND a pending mark `inp:<di>.<id>` on EVERY day the input covers (`slots.ts:431 markInputDays`), and filing a request as Unavailable (`dest==='u'`, `:456`) marks every covered day too; the scheduler's Take-off writes `acc:'r'` on the member's `Input` row (`slots.ts:676`). The `un` list on the week record is not "split by the day each names" (§3) — it is a list of input ids (`store.ts:430-459`), an input names no day and may cover several; it is a cache of `Input.acc==='r'` and not-landed.
- **Scenario:** Saber holds Monday only. On the board he files Hex's Mon–Fri course as Unavailable: five days' `inp:` marks → rule 2 demands Tue–Fri too; Ranger holds Wednesday → refused. Under route (a) the marks are not stored at all, so this never arises — but §9/§12 do not say the marks are derived.
- **Fix (§12 q.9 and §3):** in (a) write out what "derived on read" covers: "the landed row, its `acc` state, the `inp:` pending marks and the `un` list are all derived from the `Input` row and the day's issued `fil` snapshot (publish.ts:395-448 already compares filing against the issued version without trusting the live `inp:` key); a scheduler's edit to a landed row (times, remarks, position) is stored on the day keyed by the input id. Drop `un` from the day row." §3: replace "the removed-input keys (`un`), split by the day each names" with "`un` is not stored — derived from `Input.acc`". Add to §11: "a scheduler's Take off / Accept writes the member's `Input.acc` (admin U on `Input`) — reject-and-reload against the member's own edit."

**8. The holder's changes are NOT "all already saved" when the network is down — the design and the mock-up promise it. MAJOR**
- **Evidence:** rule 3/5 and the mock ("Nothing the holder did is lost"). The postman keeps failed letters and retries with backoff for ever (`storage/postman.ts:13-14, 47-58`); the top bar shows "Not saved — Retry". Rule 4 frees the day after 30 minutes regardless.
- **Scenario:** Ranger's phone loses signal at 09:40 while holding Tuesday; he keeps editing (saves queue, "Not saved"). At 10:15 the store frees Tuesday; Saber takes it and edits. Ranger's signal returns at 10:20: his queued Tuesday writes carry the version he read at 09:40 → refused → reload → twenty minutes of his work is gone, though the design told him it was saved.
- **Fix (§9, new rule 3b):** "A change the store has not confirmed is 'Not saved' on the strip and on the day head; while any change on a day is unconfirmed the 25-minute warning does not start and the holder is told the day may be freed by the clock. If the lock is lost (freed or taken over) while changes are unconfirmed, they are never sent: the app keeps them as a local 'unsaved copy of <day>' the holder can view and copy from, and says so — never a silent reload." Change the mock's take-over text to "everything he SAVED is kept".

**9. Two tabs or two devices of the same person — the lock is per user but the sessions do not know of each other. MAJOR** (the brief asks; `[DB-READINESS]` (6) already records the two-tab overwrite)
- **Scenario:** Saber holds Monday on his desktop and opens the app on his phone. The phone sees `heldBy = me` and edits too; both write Monday with the versions each last read — one is refused per edit. He closes the phone tab: rule 4's release frees Monday while the desktop still shows "You are editing"; Ranger takes it; the desktop's next write lands (advisory) — two people editing one day with the strip lying to both.
- **Fix (§9 rule 1 and 4):** "The lock names a person, not a device. Any of his open sessions may edit a day he holds; each session shows the strip from the store's `heldBy`, re-read every check, and turns read only the moment `heldBy` is not him. Edit on a day he already holds is a no-op. **A release on close is sent only when the session closing is the one that took the day** (`DayLock.sessionId`, a random id per tab kept in `sessionStorage`); another of his sessions then sees the day free and re-takes on its next change. Done editing from any session releases." Add `sessionId` (string, no) to the `DayLock` table.

**10. The holder's own screen after the 30 minutes ran out and nobody took the day. MAJOR**
- **Evidence:** rule 4 says the day is free at 30; rule 5 covers a take-over; nothing says what the ex-holder's screen does when the day is merely free — the build would invent it. `touchedAt` "at most once a minute" (§9 table) also means the store can expire the lock up to 59 s before the device thinks it will.
- **Fix (§9 rule 4, add):** "When the holder's check finds the day free (nobody took it), the strip turns to 'Edit Monday' and his next change RE-TAKES it silently if it is still free; if it has been taken since, the change is refused and the day reads '<callsign> – editing'. The client's touch goes at the first change after 60 s, so `touchedAt` is never more than a minute behind the last change; the 25-minute warning is timed from the last TOUCH SENT, not the last change, so the device never believes it has more time than the store."

**11. "Closing the page frees it at once" cannot be told from a phone being pocketed — and the app already flushes on `visibilitychange`. MAJOR**
- **Evidence:** `storage/boot.ts:74-78` treats `pagehide` AND a hidden `visibilitychange` as leaving the page (iOS never fires `beforeunload`). Rule 7 says the check pauses in the background — so a backgrounded phone must NOT release.
- **Scenario:** Ranger locks his phone to walk to the brief; if the release rides the same events as today's flush, Tuesday is freed and Saber takes it; Ranger unlocks his phone and is read only on the day he was building.
- **Fix (§9 rule 4):** "The release goes on `pagehide` with `event.persisted === false` and on sign-out only, as a `sendBeacon`-style write; never on `visibilitychange`. A backgrounded page keeps its lock until the 30 minutes. A tab the phone's browser kills unseen sends nothing — the 30 minutes free it."

**12. The week row IS written by an edit to a day — publishing stamps it. MINOR**
- **Evidence:** `publish.ts:320` and `:1054` call `stampAmFormat()` on every publish and every AL (`SCHED.amV = AMBOOK_VERSION`); `migrateLegacyIds` rewrites all seven days at load. §3 says `formatStamps` are written "never by an edit to a day".
- **Fix:** §3: "the value is idempotent; the fan-out writes the week row only when its two stamps changed (2), so a publish never sends it. A format upgrade that rewrites every day runs only when the signed-in admin holds all seven days (Edit days… → all), or as a server job."

**13. The take-over window: for up to one check (30 s) the old holder still writes and lands. MINOR**
- **Evidence:** rule 5 "turns read only at its next check"; the take-over changes `DayLock`, not `ScheduleDay`, so the old holder's in-flight and next saves pass the version check (advisory).
- **Fix (§9 rule 5):** "Between the take-over and the old holder's next check, his saves still land (they are his, saved as he goes); the taker's screen shows the day read only as 'Taking over…' until it has re-read the day once after its first check interval, or at once under fast sync — then edits. If the old holder's stray save lands after that read, the taker's first save is refused and reloaded once — the floor of rule 8."

**14. `touchedAt` = the platform's `modifiedon` is fragile. MINOR**
- A solution import, an admin editing the row in the maker portal, or a plug-in touching the row also bumps `modifiedon` and extends a lock. **Fix:** make `touchedAt` a real column the client writes (store time is still what the client reads back from the reply and compares against), and keep `modifiedon` only as the tie-breaker; state that the only writers of `DayLock` are the app's take/touch/release/take-over.

**15. §9's contract paragraph contradicts D148. MINOR**
- **Evidence:** §9 "Contract change" says a version mismatch "clears that record's undo stack"; D148 (built 28 Sep 26, `undo/timeline.ts`) says Undo never greys out or clears — it refuses the one step and says who. **Fix:** replace with "…and sets a D148 barrier on that record naming who wrote the newer version; the person's other steps stay undoable."

**16. Open question 8 — offer IT the ownership route before a plug-in. MINOR**
- Dataverse can make the lock strict with no custom code: own the `ScheduleDay` row by the holder (`ownerid` = `heldBy`; a take is an Assign sent with `If-Match`), give schedulers Write at *User* depth and Assign at *Business unit* depth, and park free days on a "Free" team nobody writes as. A take-over is a reassign. **Fix:** add as option (b) in question 8, with the trade: `DayLock`'s fields would then be columns of `ScheduleDay` (`ownerid`, `takenAt`, `touchedAt`, `takenOverFrom`), and the touch every minute bumps the day's `versionnumber` — harmless, since only the owner writes it.

**17. The 30-second check on Dataverse is one request per table per user. MINOR**
- Change tracking is per table (`RetrieveEntityChanges`); §9 lists ~15 tables. Fast sync at 1 s → ~15 requests/s per user, two tabs 30/s, against the 6,000-per-5-minutes limit. **Fix (rule 7):** "the slow check reads `DayLock` and `ScheduleDay` of the loaded week plus `Input`; the other tables read at their own slower interval; fast sync narrows to those three; the request count per check is what `[IT-QUESTIONS]` asks about." And for what "arrives" means: "an incoming change is applied to the model at once but a day's redraw waits while a pointer is down or a text box has focus on that day's screen (the string-diff swap would drop the drag ghost or caret) — never on a held day, which the feed never changes except for inputs."

**18. The mock-up: three states the owner will meet are not drawn, and one sentence states an open question as fact. MINOR**
- (a) A PUBLISHED day held by someone else: the ORIG seal, "N pending", Publish AL / Unpublish under the amber strip — rule 2 says Publish reads "Ranger is editing Tuesday"; not drawn. (b) A day held on ANOTHER week: "Edit days…" lists only the loaded week, and the 25-minute warning "Still editing Monday?" must name the date ("Monday 13 Jul") when that week is not on screen; "Done editing all mine" must cover other weeks. (c) View-only Sched for a member: §11 says members read `DayLock`, so "<callsign> – editing" shows there too — not drawn; nor the board opened on a held day from a changes-window / pending-list jump, nor the holder's "Not saved" strip (8), nor the free-again strip (10). (d) "What happens behind it" item 2 states a member's input "goes in as it does today" — that is Open question 9, unsettled. **Fix:** add the four pictures (or one line each in "What the scheduler sees" saying they follow the same strip), and reword item 2 to "reaches the day (how, the IT team and we settle first — question 9)".

**19. The `Amendment` entry in §3 describes the pre-Phase-2 record. MINOR** (unchanged by this branch, but the split leans on "amendments are their own rows already")
- `publish.ts:31-40`: each record is single-day `{id, di, iso, seq, snap, diff, sign}`; §3 lists `number`, `dayIndexes int[]`, `slotKeys`, `itemCount`, `structuralAdds`. `SCHED.retired` (the retracted-issuance log, `publish.ts:55-63`) and `correcting` have no home in §3. **Fix:** rewrite the field list to the verId shape and add `RetiredIssuance` (or `Amendment.retiredN`) so a same-label reissue keeps every prior one.

**Also checked and found sound:** every live amendment key carries its day (`engine/keys.ts keyDay`; `del:`, `mov:`, `inp:` included; `iu:` never enters the book); `SCHED.al` has no reader (`history.ts:24` only) — dropping it is safe; the cross-week crew-rest and 7-day traces only READ the next week (`weekctx.ts bundle`, `validate.ts:1351-1362`, `di:null` rows are not mutable warnings); Sort all is per day (`board.ts:623-701`); saved plans, templates, OIL decisions on the board are per day; `putMany` is already all-or-nothing (`backend.ts`), which rule 2's two-day move needs — say so in rule 2 ("one group, both or neither").

**Verdict: REVISE** — the tables are right in shape except the planning layer (1); the design needs the per-day grain carried into the fan-out and the command layer (2, 3), the app's own cross-week passes named (4), day-row creation (5), the stage-1 reconcile fix (6), and the four holder states the build would otherwise invent (8–11) before IT builds from it.


## What was done with each finding (Opus 5.5, 29 Sep 26 — the fold-in, before round 2)

His rulings the same evening shaped three of them: D450 (the lock is firm — the database refuses a non-holder),
D451 (a change on a free day takes it), D452 (Fast sync off after 20 minutes); D453 set the order (this fold-in, then
[DB-READINESS] group A before the tables settle, group B after the app is connected).

| Finding | Done |
|---|---|
| Astra 1, Fable 19 — Amendment / Signoff keys | ACCEPTED. §3 Amendment rewritten to the per-day version record (`scheduleDayId`, `sequence`, `versionId`, `reissue`, `snapshot`, `diff`, retracted kept); sign-offs split: working (in the day's snapshot at stage 1, with their binding) and `IssuedSignoff` (append-only). Old entries archived. |
| Astra 2 — lease token, strict check | ACCEPTED, route changed: D450 + Fable 16 — the lock is columns of `ScheduleDay`, made firm by row OWNERSHIP (no plug-in); `leaseId` and `sessionId` columns; the version check enforces the session (a take by your other device changes the version). Plug-in is the fallback (Open question 8). The separate `DayLock` table is dropped. |
| Astra 3, Fable 2 — the fan-out infers intent; write only changed, held days | ACCEPTED. §3 "What the adapter writes": the command layer's write set, one changeset per command, never an unheld day; week row only when its stamps change. |
| Astra 4, Fable 4, 7 — writes the lock does not cover | ACCEPTED with one simplification: no separate placement table — the scheduler's decisions on an input live in the day's snapshot keyed by input id; everything else (landed rows, pending marks, `un`, a deleted man, a handed-on request's OIL decisions) is worked out on read. §9 rule 9; §12 q9. |
| Astra 5, Fable 17 — change tracking is per table | ACCEPTED. §9 the change log: one `ChangeBatch` row per command in its changeset; read since last-less-two-minutes, deduped by id (covers commit order without a server sequence); one request per check. |
| Astra 6, Fable 3, 15 — Undo vs D148 | ACCEPTED. Command-layer records per day (§3); §9 rule 11; the contract paragraph corrected (a barrier, not a cleared stack). |
| Astra 7, Fable 17 — inbound changes during a drag or typing; lock lost mid-edit | ACCEPTED. §9 rule 12 (redraw waits; no edit control before the first check on return or after a link), rule 4 (the unsaved copy). |
| Astra 8, Fable 18 — missing mock states | ACCEPTED as a list, not new pictures: §9 rule 13 and the mock-up's "Still to draw" — the screens are built last (D453) with his answers. |
| Fable 1 — the planning calendar | ACCEPTED. `PlanningPuck`, `DayRemark` — own tables, no lock; §5 row. |
| Fable 5 — day rows for an unsaved week | ACCEPTED. Created in one batch with the week; unique keys; snapshot null = blank day. |
| Fable 6 — the reconcile deletes unknown weeks | ACCEPTED. §7 "before the first shared release"; §3; `[DB-READINESS]` group A. |
| Fable 8 — "all saved" when offline | ACCEPTED. Rule 4 ("Not saved", sign-out waits — also his question); the mock-up's words corrected. |
| Fable 9 — two tabs / devices | ACCEPTED in Astra's form: one SESSION holds the day; the other shows "Editing on your other device — Move editing here". |
| Fable 10, 11 — after the 30 minutes; release on close only | ACCEPTED. Rules 5 and 6. |
| Fable 12 — the week row stamped by publishing | ACCEPTED. Written only when the stamps change. |
| Fable 13 — the take-over window | CLOSED by the ownership route: the take-over's Assign changes the owner and the version, so the old holder's next save is refused at once (rule 7). |
| Fable 14 — `modifiedon` as the clock is fragile | DECLINED, with its reason: only the app writes these rows, and every confirmed save already writes the row, so `modifiedon` IS the last change; a maker-portal edit extending a lock is negligible (§3). |
| Fable 16 — ownership route | ACCEPTED as the design (D450). |
| Peer chat (the one-time import vs the wipe) | §7's "One-time legacy import" row corrected; §5's lead-in says it is a field map, nothing crosses but his Tracker charts. |


## Round 2 — Fable 5.1

**Fable — round 2, the day lock after the fold-in (`[DB-SYNC-MODEL]`, D355/D356, D450–D453), 29 Sep 26.** Read only; nothing changed. Checked against `raptor-port/src` and Microsoft's Dataverse documentation where the design leans on the platform.

### 1. My round-1 findings

| # | Status | Note |
|---|---|---|
| 1 planning calendar | CLOSED | `PlanningPuck` / `DayRemark`, no lock. One stale phrase: §5's row still ends "JSON at stage 1; own rows at stage 2" — they are own rows at stage 1 now (finding 5). |
| 2 write only changed, held days | CLOSED | §3 "What the adapter writes". §6's stage-1 row still says the fan-out "splits … each week record into its week row and seven day rows on `put`" — the old inference the new paragraph replaced (finding 5). |
| 3 command-layer grain | CLOSED | `sched.book/<wk>#<di>`, mutes per day, `v`/`am` week-wide. |
| 4 passes that wrote held days | CLOSED | Worked out on read; I agree with keeping the placement inside the day snapshot rather than a table — only the holder writes it, and it is his decision (Astra 4's table would add a second lock-protected row for nothing at stage 1). One app-side note, no table effect: the read rule must be applied to the in-memory working copy before the pending comparison, because the issued snapshot deliberately keeps a deleted man's attributes (`engine/publish.ts:585` — `p.deleted ? pa[id]`), so "reads pending" cannot come from the roster; it comes from the projected working day differing from the issued one. Rule 9 should say "applied to the working copy at load and at each check". |
| 5 rows for an unsaved week | CLOSED | Created in one batch; unique keys; snapshot null. Creating them "owned by the free team" is an ownership change at create — finding 1 covers what that needs. |
| 6 reconcile deletes weeks | CLOSED | §7 "before the first shared release". |
| 7 input marks / `un` | CLOSED | Derived; `Input.acc` an admin's update of the member's row. |
| 8 "all saved" offline | CLOSED | Rule 4, the unsaved copy; the mock's words corrected. |
| 9 two tabs / devices | CLOSED | Astra's one-session form is better than mine (a lease per take, "Move editing here"). |
| 10 after the 30 minutes | CLOSED for the old holder (rule 5). The take of an EXPIRED day by someone else is an ownership change of a row owned by another user — finding 1. |
| 11 release only on a real close | CLOSED | Rule 6. |
| 12 week row stamped by a publish | CLOSED | |
| 13 take-over window | CLOSED **only if finding 1 holds** — it rests on the take-over being a version-bumping update the old holder is then refused on; true under ownership, if the take-over can be performed at all (finding 1). |
| 14 `modifiedon` as the clock | CLOSED — I accept the decline. Its reason is right once "every confirmed save writes the row" and there is no per-minute touch; a take, a take-over and Move-editing-here also move `modifiedon`, all of them the new holder's, so nothing false comes of it. |
| 15 D148 vs the contract paragraph | CLOSED | |
| 16 ownership route | Adopted as design (D450) — but as written it does not deliver a take-over or an expiry take, and it needs two platform settings IT would otherwise leave at default. Finding 1. |
| 17 change log | CLOSED — I agree with the "less two minutes" overlap over a server sequence: Dataverse has no exposed commit sequence, and `versionnumber` (a global rowversion) is assigned inside the transaction, so it has the same out-of-order edge as `createdon`; an overlap is needed either way. One number to fix (finding 6). |
| 18 mock states | CLOSED as a list (D453: screens last). |
| 19 Amendment | CLOSED — but the new entry contradicts itself on `retractedBy/At` and that has an ownership consequence (finding 2). |

### 2–3. What the fold-in introduced, and what would still make IT build a table wrong

**1. The ownership route, as written, cannot perform a take-over or take an expired day — and two platform defaults would defeat it. BLOCKER (a paragraph to fix, but it must be fixed before IT builds the roles)**
- **Evidence:** §3 ScheduleDay and §11: "Write at *User* depth … Assign at *Business unit* depth; a take, a take-over and a release are an Assign sent with the version read." Microsoft: the Assign message is **deprecated — an ownership change is an ordinary Update of `ownerid`** ([AssignRequest](https://learn.microsoft.com/en-us/dotnet/api/microsoft.crm.sdk.messages.assignrequest?view=dataverse-sdk-latest): "This message request is deprecated. Use the UpdateRequest instead"), and the caller needs "Assign privileges on the table and access rights on the specified record". With Write at User depth a scheduler holds write access only to rows he or his teams own. So: (a) a **take-over** updates a row owned by ANOTHER user — refused at User depth; (b) a **take of an expired day** is the same case (the idle holder still owns it — nothing in Dataverse changes ownership on a clock); (c) a **take of a free day** works only if the scheduler is a member of the "free" team — a team-owned row is writable at User depth only by the team's members. Raising admins' Write to Business-unit depth fixes (a) and (b) and removes the firmness for exactly the people the lock is for — every scheduler is an admin (§11). (d) The org setting `ShareToPreviousOwnerOnAssign` (same page): when true, "a record assigned to a new owner is shared with the previous owner with full rights" — a take-over would leave the old holder able to write. (e) Cascade: an assign "applies to the parent record and the associated records that have the same owner" and follows the relationship's cascade setting ([cascading behavior](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/configure-entity-relationship-cascading-behavior)) — a Parental or Cascade-All relationship from `ScheduleDay` to `Amendment` / `IssuedSignoff` would reassign every issued row of the day on every take (their versions bump, the change log fills, and with user-owned children the unpublish stamp becomes the new holder's to write).
- **Scenario:** Ranger holds Tuesday and goes home. Saber presses Take over: the update of `ownerid` on a row Ranger owns is refused (User depth). Give admins BU-depth Write to make it work, and Saber can also save Tuesday without taking it — D450 is not met. Meanwhile IT built the Amendment relationship as Parental (the maker portal's usual choice for a child table): Saber's first successful take reassigns Tuesday's six issued amendments.
- **Exact fix (§3 ScheduleDay, §9 rule 8, §11 note, §12 q8):** replace the privilege sentence with: "`ScheduleDay` is a **user/team-owned** table. Schedulers: Create, Read (Organization depth), Write **User depth**, Assign **User depth** — so a holder can release (assign the row he owns to the free team) and hand it to another device of his own, and no one can save a day he does not own. Every scheduler is a member of the **free team**, so a free day (owned by it) can be taken by an ordinary update of `ownerid` with `If-Match`. **The two changes of owner a non-owner must make — a take-over, and the take of a day idle over 30 minutes — run through one small server-side action** (`SetDayHolder(dayId, action)`: a Custom API or plug-in step running under a service identity that checks 'caller is admin' or 'modifiedon older than 30 minutes' and then reassigns), because Dataverse gives a non-owner no way to change an owner without a privilege depth that would also let him save the day. This is the smallest custom code the lock needs; there is no no-code form of it. Settings IT must fix at build: `ShareToPreviousOwnerOnAssign` = false; every relationship from `ScheduleDay` (to `Amendment`, and through it `IssuedSignoff`) **Referential, Assign = Cascade None**." Reword D450's home line in §9 rule 8 from "with no custom code" to "with no custom code on the SAVE path; the two owner changes a non-owner makes are one server action (Open question 8)". Add to §12 q8: "who adds a new admin to the free team when Admin → Users creates him (D217) — the app cannot without the AddMembersTeam privilege; if IT prefers, the free team is replaced by a service user and every take goes through the same server action."

**2. Ownership TYPE per table is never stated, and it cannot be changed after a table is created. MAJOR**
- **Evidence:** Dataverse fixes user/team vs organization ownership at table creation ([security concepts](https://learn.microsoft.com/en-us/power-platform/admin/wp-security-cds)). §11 says only "row ownership by the person's `User` where the own-row rule applies". Two entries would be built wrong as they read: `Amendment` says "no column of an issued row is ever updated" and, five lines down, `retractedBy/At` are "set once by an Unpublish" — if IT makes it user-owned (the publisher's) with User-depth Write, another admin cannot unpublish. `ScheduleWeek.ownedBy` "who created the week" reads as user ownership — then no other admin could tombstone the week or run a format upgrade. `ChangeBatch` is "written by every writer": a member's input command must be allowed to create one.
- **Exact fix (§11, a new two-line table above the roles):** "**User/team-owned:** `ScheduleDay` (the lock), `Input`, `Attachment`, `InputAttachment`, `QualMark`, `LeaveBid`, `LeaveOpening`, `LeaveLedger`, `LeaveCounter`, `EditLogSeen`, `AccessRequest`, `User` — every table with an own-row rule, owner = the person's `User`. **Organization-owned:** everything else — `ScheduleWeek` (`ownedBy` is a plain column, not the platform owner), `Amendment` (append-only except the one retraction stamp, which any admin may set once), `IssuedSignoff`, `PlanningPuck`, `DayRemark`, `ChangeBatch` (Create for admin and member, Read for all), `Person`, `Setting`, the Tracker's, the Leave War's definitions, `EditLog`." Fix the Amendment entry to "no column is ever updated **except** `retractedBy`/`retractedAt`, set once".

**3. "Worked out on read" leaves no write to a held day — confirmed — except the three ownership changes above, which are not day writes. MINOR (state it)**
- I traced every writer that reached a day in round 1: the member's input (`slots.ts:431-456`), the Delete (`person-delete.ts:261-291`), the handed-on request's OIL clear (`oilmode.ts:359-380`), the posting pass, the format stamp at publish (`publish.ts:320,1054`), the planning calendar. Under the fold-in each writes its own table or nothing; the Delete still writes `PlanningPuck` gaps (own table, no lock — fine) and rule 9's third bullet should name it. The only writes to a day someone else owns are the owner changes of finding 1.

**4. One changeset per command fits the platform. MINOR (write the numbers down so IT does not ask)**
- Dataverse: a `$batch` holds up to 1,000 requests; a changeset is all-or-nothing ([batch operations](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/execute-batch-operations-using-web-api)). The largest commands here: creating a week (1 + 7 rows + 1 batch = 9), "Edit days…" on seven free days (7 updates + 1), a publish (day + `Amendment` + 4 `IssuedSignoff` + batch = 7), a Delete (person + his inputs + Leave War rows — tens). A template goes onto one day (`daytpl.ts applyDayTpl(di)`), Sort all is one day (`board.ts:623-701`); no command touches more than a week. Two rules to add to §9 rule 3: "a changeset carries no read — the version of each row written comes back in the reply (`Prefer: return=representation`); the rows of one changeset are written in a fixed order (week, days by index, amendment, sign-offs, batch) so two commands never deadlock". A note that "Edit days…" is one command per day (rule 1's three groups), not one changeset — else "keeping what it took" contradicts all-or-nothing.

**5. Two places still describe the pre-fold-in shape. MINOR**
- §6 stage 1: "splits … each week record into its week row and seven day rows … on `put`" → "sends the command layer's write set (section 3, What the adapter writes)". §5 planning row: drop "JSON at stage 1; own rows at stage 2". §5 still maps `SCHED.sign` → `Signoff` and §11's retention line says `Signoff` — the table is now the working sign-offs inside the snapshot and `IssuedSignoff`.

**6. The change log's overlap must exceed the platform's longest transaction, and its ownership must let members write it. MINOR**
- A batch whose `createdon` is stamped early in a changeset that then waits on a lock commits late; Dataverse's transaction limit is about two minutes, so "less two minutes" sits exactly on the edge. **Fix:** "less five minutes", dedupe by id kept for five minutes; `ChangeBatch` organization-owned, Create for admin and member (finding 2). The `items` entry for each written row should carry the new `versionnumber` so a writer's own batch refreshes his local versions without a re-read.

**Verdict: APPROVE WITH FIXES** — findings 1 and 2 must be written in before the document goes to IT (a table's ownership type and a relationship's cascade cannot be undone once built); 3–6 are lines to add. Nothing else in the fold-in is broken.


## Round 2 — Astra (Codex, gpt-5.6-sol, high)

Astra 1 — **NOT CLOSED** — the keys and sign-off split are fixed, but publish still lacks server-side validation against the current read-derived day, and `Amendment` is called append-only while Unpublish updates it.

Astra 2 — **NOT CLOSED** — lock columns are acceptable, but Dataverse ownership alone neither permits the proposed take nor enforces session token, expiry, or child-row writes.

Astra 3 — **CLOSED** — the adapter now consumes an explicit per-day command write set and commits one all-or-nothing changeset.

Astra 4 — **NOT CLOSED** — deriving non-holder effects is sound, but input placement stored only in the stage-1 snapshot has no stage-2 home.

Astra 5 — **NOT CLOSED** — `ChangeBatch` fixes cross-table grouping, but a fixed two-minute overlap is not a reliable cursor and changed rows cannot be reconstructed at their listed versions.

Astra 6 — **NOT CLOSED** — per-day command records prevent another day blocking Undo, but do not distinguish unrelated changes on the same day as D148 requires.

Astra 7 — **CLOSED** — rules 4 and 12 now cover unconfirmed writes, lost locks, focused controls, catch-up and whole-batch application.

Astra 8 — **CLOSED** — D453 deliberately defers the enumerated screen states until the build; they are recorded in rule 13 and the mock-up.

1. **BLOCKER — the ownership-only lock cannot be taken as configured and is not a firm session lease.**

   **Evidence:** `data-model.md:378-397,1038-1077,1191-1197,1248-1255` gives schedulers Write at User depth, Assign at Business-unit depth, and parks free rows on a team nobody belongs to. Dataverse requires **ASSIGN, WRITE and READ** access rights to assign a record; User-depth Write does not grant Write on that free-team row or another holder’s row. Granting Business-unit Write would make take-over possible but would also allow direct updates to every held day unless server logic refused them. [Dataverse’s access-right dependencies](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/security-access-rights) state this explicitly. Dataverse may also retain access for the previous owner after assignment, depending on `ShareToPreviousOwnerOnAssign`. [Microsoft’s assigning guidance](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/security-sharing-assigning)

   Ownership also identifies only the user. After “Move editing here”, both tabs still run as that owner; the version rejects the old tab once, but a current-version request from it is still authorised. At 30 minutes ownership does not expire automatically, so the former holder remains database-authorised. At stage 2, edits hit `Wave`, `Sortie`, `WorkingSignoff` and other child rows, not necessarily the owned `ScheduleDay`.

   **Scenario:** Tuesday belongs to the free team. Saber’s Assign fails because he lacks Write on it. If IT raises Write to Business-unit depth, Saber can PATCH Tuesday while Ranger owns it. Ranger’s expired tab or earlier device can likewise write with a refreshed ETag because Dataverse never checks `leaseId` or `sessionId`.

   **Exact fix:** make a synchronous plug-in/custom API mandatory, not fallback. Give it operations for take, mutate, release and take-over; validate caller, `leaseId`, `sessionId`, server-time expiry and every affected parent day; perform the conditional Assign and content mutation transactionally. Apply the same parent-day check to every stage-2 child insert/update/delete and to amendment/sign-off creation. Disable previous-owner sharing. I do **not** object to keeping the lock as columns, but ownership cannot replace lease enforcement.

   I also disagree with Fable 14’s decline: add a real `touchedAt`. Once stage 2 writes child rows, the parent’s `modifiedon` no longer proves activity; administrative repairs and ownership operations can also change it. Touch the parent explicitly once per successful command and on Keep editing.

2. **BLOCKER — publication can issue stale read-derived content with stale sign-offs.**

   **Evidence:** `data-model.md:515-527` says publish writes the day, amendment and issued sign-offs atomically; `:1078-1094` says an `Input`, `Person.deletedFrom`, Quals and related effects change the effective day without writing or versioning `ScheduleDay`. Nothing requires the publish transaction to recompute the effective day or verify the four bindings against those current external rows.

   **Scenario:** Saber reads Monday and its valid sign-offs. A member changes a Monday input. The Input commits without changing Monday’s ETag. Saber’s already-assembled publish changeset then passes the day version check and freezes the old landing and four signatures as an issued version.

   **Exact fix:** publish must be a server command. Inside its transaction, read the current `ScheduleDay`, all contributing Inputs/People and scheduler placement decisions; build the effective day, verify all four bindings, then create the Amendment, exactly four IssuedSignoffs, ChangeBatch/EditLog and update the day. A stale client-provided effective snapshot must never be authoritative.

3. **MAJOR — a suppressed or overridden input has no stage-2 table.**

   **Evidence:** `data-model.md:388,404-406,1078-1086` keeps “taken off, moved, times, remarks, position” in the stage-1 snapshot, but that snapshot is emptied at stage 2. `ProgrammeRow` has `sourceInputId`, yet absence of a row cannot distinguish “not processed” from “deliberately taken off”.

   **Scenario:** Saber takes off Hex’s course input. After stage-2 migration the snapshot is emptied and there is no ProgrammeRow. The read derivation sees the live Input and lands it again.

   **Exact fix:** add `ScheduleInputPlacement(scheduleDayId, inputId, state, programmeRowId, sortIndex, overridesJson, sourceInputVersion)`, unique on day/input, with at least `landed` and `suppressed`; or permanently retain an equally explicit decisions JSON column. I disagree with the disposition that placement can live only in the temporary day snapshot.

4. **MAJOR — D148 Undo is still impossible at the declared conflict grain.**

   **Evidence:** `data-model.md:354-357,992-1004,1098-1102` makes the logical/physical conflict unit one day and asserts that only a change to “the same thing” blocks Undo. The existing contract requires current revisions at the logical-record/cell grain (`undo-contract.md:130-135`); no row/field address or merge rule was added for two different things inside one ScheduleDay.

   **Scenario:** Saber changes Monday’s note, releases it, and Ranger changes a Monday sortie. Monday’s version and day-level barrier advance. Saber’s Undo must either refuse because the whole day changed or restore a stale whole-day image over Ranger’s sortie—both violate D148.

   **Exact fix:** every undo entry must carry stable row/field addresses plus before/after values. After taking the affected days, reload them and compare only those addresses with the recorded `after` values; merge the inverse into the current day and submit it with the current ETag. Refuse only if an addressed value changed, and commit all affected days together.

5. **MAJOR — the change log can miss batches and cannot replay its promised versions.**

   **Evidence:** `data-model.md:1123-1133` advances using `createdon` with a fixed two-minute overlap. Dataverse gives no stated guarantee that commit/visibility reordering is bounded by two minutes. It also stores only row ids and versions; if a row has advanced again before retrieval, Dataverse returns the latest row, not the historical version named by the earlier batch. Applying that batch “whole” can therefore mix part of a later command into it.

   **Scenario:** batch A changes rows X and Y; batch B then changes X and Z before a client polls. While processing A, the client fetches X from B and Y from A but not Z, displaying a state that no committed changeset produced. A sufficiently delayed A can also fall outside the overlap after the cursor advances.

   **Exact fix:** enable native change tracking on the single `ChangeBatch` table and retain its opaque delta token; on token expiry, resnapshot. [Dataverse change tracking](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-change-tracking-synchronize-data-external-systems) already supplies this single-table cursor. Either store immutable after-images in ChangeItems for true per-command replay, or define batches as invalidations, coalesce all pending batches, fetch the final union once and repaint atomically. I disagree with the two-minute-overlap disposition.

6. **MAJOR — stage 1 fits Dataverse’s batch limit; stage 2 has no bound.**

   **Evidence:** under the stage-1 grain, a seven-day template is seven ScheduleDay mutations plus ChangeBatch—eight operations, or at most fifteen if takes are separate—and Sort all is one day plus ChangeBatch. Dataverse permits up to 1,000 individual requests in a batch, and a changeset is transactional, so these fit comfortably. [Dataverse batch operations](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/execute-batch-operations-using-web-api), [service-protection limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits)

   At stage 2, however, a template replacement can delete and create every child row on seven days, while Sort all can update every movable row. The model defines no maximum row count; `board.ts:623-707` explicitly says Sort all rewrites every list.

   **Scenario:** seven dense days collectively require more than 1,000 child deletes/inserts/updates. The required single changeset is rejected before execution, while splitting it violates the all-or-nothing command contract.

   **Exact fix:** before settling stage-2 tables, calculate and enforce a maximum operation count below the environment’s batch limit, including lock touches, log rows and deletions. If no acceptable product cap exists, retain an aggregate day representation for bulk replace/sort or implement those commands as bounded server-side custom operations.

7. **MAJOR — the fold-in still gives IT contradictory table and permission instructions.**

   **Evidence:** the canonical catalogue says Amendment belongs to ScheduleDay and distinguishes WorkingSignoff/IssuedSignoff (`data-model.md:494-530`), but the relationship diagram, mapping, ownership table, foreign-key policy, security matrix and retention text still use week-level `Signoff` (`:788,802-806,856-857,941,1146,1179,1207`). Amendment is declared append-only at `:499`, yet `retractedBy/retractedAt` are later updated at `:511`; security grants only C/R at `:1179`, so Unpublish cannot make that update. Stage 1 says ChangeBatch and the incoming check land immediately (`:892`), while stage 3 says the incoming contract first appears there (`:894`). The stage-1 fan-out also says `plan/all` becomes “one row per … week” instead of PlanningPuck/DayRemark.

   **Scenario:** IT creates a week-scoped Signoff table and grants no update on Amendment. Working signatures are duplicated outside the snapshot, IssuedSignoff’s relationship is absent, and Unpublish fails authorization.

   **Exact fix:** perform one canonical-schema pass: `ScheduleDay → Amendment → IssuedSignoff`; WorkingSignoff inside the stage-1 snapshot and as its own stage-2 table; replace mutable retraction fields with append-only `AmendmentRetraction` or explicitly grant and constrain that one update; correct every diagram, mapping, FK, ownership, security and retention row; move the incoming contract unambiguously to stage 1; correct the `plan/all` fan-out.

REVISE

## What was done with round 2 (Opus 5.5, 29 Sep 26)

Fable: APPROVE WITH FIXES. Astra: REVISE. Every round-2 finding was accepted; none declined.

| Finding | Done |
|---|---|
| Fable 1, Astra 1 — ownership cannot hand a day on, nor tell two tabs apart | §3 ScheduleDay: ownership (Write and Assign at User depth, every scheduler in the free team) PLUS one small server-side check, REQUIRED, through which every change of holder and every save go (lease, session, `touchedAt` by the server's clock; stage-2 child rows too); `ShareToPreviousOwnerOnAssign` false; Referential, Assign = Cascade None. §9 rule 8 corrected ("no custom code" was wrong); D450's full row marked; §12 q8 and `[IT-QUESTIONS]` rewritten. Told to him plainly. |
| Astra 1 (reopened) — `touchedAt` vs Fable 14 | The decline is REVERSED: `touchedAt` is a real column stamped by the server check. |
| Astra 2 — a publish can freeze stale read-derived content | §9 rule 3: a publish carries the client's change-log place; the server check refuses it if a later batch changed an input covering the day or a person on it. |
| Astra 3 — placement has no stage-2 home | §3 `ScheduleInputPlacement` (stage 2). |
| Astra 4 — Undo within one day | §9 rule 11: undo steps compare by row and field address, merged into the current day. |
| Astra 5, Fable 6 — the change log's cursor and replay | Native change tracking on the one `ChangeBatch` table (a delta token); batches are invalidations — gather, read the final rows once, redraw once. |
| Astra 6 — stage 2's batch size | §12 q10 (decide before the stage-2 tables); stage-1 counts written into rule 3 (Fable 4). |
| Astra 7, Fable 2, 5 — contradictions left for IT | `AmendmentRetraction` (append-only) replaces the retraction columns; §5, §6 (stages 1 and 3), the diagram, §8, §10, §11 (the ownership-type list, and a note that the `Amendment, Signoff` row now means `IssuedSignoff` — the row itself is renamed with `perms.ts` at the build, the drift test reads it), the retention line. |
| Fable 3, 4 | Rule 9: applied to the working copy before the pending comparison; the Delete's planning gaps named. Rule 1: "Edit days…" is one command per day. |


## Round 3 (the last) — Fable 5.1

**Fable — round 3 (the last), the day lock after round 2's fixes (`[DB-SYNC-MODEL]`, D450–D454), 29 Sep 26.** Read only; nothing changed. Read: the diff since round 2's fold-in began, §3 ScheduleDay and `ScheduleInputPlacement`, Amendment / `AmendmentRetraction`, §9 rules 1–13 with `TakeOverRequest` and the change log, §11's two notes, §12 q8–10, D454's full row.

### 1. My round-2 findings

1. **Ownership route cannot hand a day on** — CLOSED. §3 now says it plainly: ownership (Write and Assign at User depth, every scheduler in the free team) plus one REQUIRED server-side check for every change of holder and every save; `ShareToPreviousOwnerOnAssign` false; Referential, Assign = Cascade None; rule 8 and D450's row corrected; q8 asks IT who writes it and how a new admin joins the team.
2. **Ownership type per table** — CLOSED. §11 lists user/team-owned vs organisation-owned; `AmendmentRetraction` (append-only, org-owned) removes the update on an append-only row.
3. **Read-derived effects applied to the working copy; the Delete's planning gap** — CLOSED (rule 9).
4. **Changeset limits and order** — CLOSED (rule 3: counts, fixed write order, no read in a changeset; "Edit days…" one command per day).
5. **Stale shapes in §5/§6/§11** — CLOSED (stage 1 and 3 rows, the sign-off rows, the retention line, the diagram).
6. **Change-log overlap** — CLOSED, and I prefer the fold-in's answer to mine: change tracking on the one `ChangeBatch` table gives a server-bounded token instead of a guessed overlap, and treating a batch as an invalidation (read final rows once, redraw once) removes the half-state risk. `items` refreshing the writer's own versions kept.

D454 (ask first, one minute, "Take over anyway", a saved plan at every take-over) is folded consistently: the `TakeOverRequest` row is organisation-owned, created by an admin, answered by the holder, read by the server check, spent by the take; the frozen copy rides the take-over's own changeset. Nothing in it changes a table beyond that one.

### 2. What would still make IT build a permission or a setting wrong

**1. The free team must be an OWNER team with a security role that can read `ScheduleDay`, or nothing can be assigned to it. MAJOR**
- **Evidence:** §3 ScheduleDay point 1 — "a free day is owned by the free team, of which every scheduler is a member" — says nothing about the team's kind or role. Dataverse has two kinds of team; only an owner team can own rows, and a row cannot be assigned to an owner whose role does not grant it Read on that table (the platform refuses with its "read privilege check for owner failed" error). A week's seven day rows are created owned by the free team (§3 "Created together") and every release assigns back to it — every one of those writes fails if the team was made as an access team or given no role.
- **Fix (§3, point 1, one sentence):** "The free team is an **owner team** (not an access team), assigned a security role with Read on `ScheduleDay` at Organization depth and nothing else; every scheduler is a member of it. Membership is what lets a scheduler take a free day at User depth."

**2. The server-side check must run as the system, not as the caller, and change tracking must be switched on for `ChangeBatch`. MAJOR**
- **Evidence:** §3 point 2 has the check "change the owner" on a take-over and an idle take — a row the caller cannot write at User depth. A synchronous plug-in step runs, by default, in the calling user's context and inherits his privileges, so registered that way it is refused exactly where it is needed; the same holds for a Custom API unless its implementation impersonates the system user. And §9's change log now "reads `ChangeBatch` through Dataverse's own change tracking … keeping its delta token": change tracking is a per-table setting that is OFF on a new table; a delta read against a table without it fails outright, and the token's lifetime is the environment's change-tracking retention setting.
- **Fix:** §3 point 2, add: "The check is registered to run under the **SYSTEM** account (the plug-in step's 'run in user's context' = SYSTEM, or the Custom API impersonating it), so it can change an owner the caller cannot; it reads the caller from the execution context for its own rules (admin, lease, session)." §9 the change log, add: "**Change tracking is enabled on `ChangeBatch`** (a table setting, off by default); the environment's change-tracking retention sets how long a token lives and is the purge age of old batches." Add both to §12 q8's list of settings IT fixes at build, beside `ShareToPreviousOwnerOnAssign` and the cascade rule.

Nothing else in the fold-in would build a table, a permission or a setting wrong: the ownership list is complete for stage 1 (the stage-2 child rows fall under "everything else — organisation-owned" and the check guards them by parent day, as §3 says); `TakeOverRequest` and `AmendmentRetraction` are shaped and owned correctly; the publish check against the change-log place is sound; the counts in rule 3 hold against the code (a template and Sort all are one day each).

**Verdict: APPROVE WITH FIXES** — the two sentences above, then it can go to IT. *(Both applied the same evening — §3 points 1 and 2, the change log, §12 q8.)*


## Round 3 (the last) — Astra (Codex, gpt-5.6-sol, high)

Astra 1 — **NOT CLOSED** — mandatory server enforcement is now present, but the permitted Custom API implementation remains bypassable by direct table writes, and rule 5 still measures expiry from `modifiedon` instead of `touchedAt`.

Astra 2 — **NOT CLOSED** — the change-log check is neither serialized with dependency writers nor complete across every table contributing to the effective day.

Astra 3 — **CLOSED** — `ScheduleInputPlacement` now preserves landed and suppressed input decisions at stage 2.

Astra 4 — **CLOSED** — Undo now compares and merges stable row/field addresses rather than rejecting on the whole-day version.

Astra 5 — **CLOSED** — native `ChangeBatch` change tracking, opaque tokens, invalidation semantics, token-expiry resnapshot, and the required table setting replace the unsafe time cursor.

Astra 6 — **NOT CLOSED** — question 10 records the decision that must be made, but no stage-2 operation ceiling or bounded server operation has yet been selected.

Astra 7 — **NOT CLOSED** — the principal amendment/sign-off contradictions are fixed, but the canonical stage, ownership, permission, and relationship catalogues remain incomplete or contradictory.

1. **BLOCKER — choosing the documented Custom API option does not make the lease firm.**

   **Evidence:** The model permits either “a Custom API or a synchronous plug-in” while granting the holder direct Write access ([data-model.md:385](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:385>), [data-model.md:1254](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1254>)). A Custom API is separate logic that must be invoked; only a plug-in registered on the relevant table/message intercepts ordinary updates. [Microsoft’s Custom API documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/custom-api), [plug-in registration documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/register-plug-in).

   **Scenario:** Ranger’s obsolete tab reads the current ETag and PATCHes the `ScheduleDay` directly. Because Ranger still owns it, Dataverse accepts the update without invoking a separate Custom API, bypassing `leaseId`, `sessionId`, expiry, and `touchedAt`.

   **Exact fix:** remove the “or.” Either register an unavoidable synchronous plug-in on every `ScheduleDay` Update/Assign and every stage-2 child Create/Update/Delete, or remove direct Write/Assign from interactive roles and make SYSTEM-running Custom APIs the only mutation path. App roles must not receive plug-in-bypass privileges. Also change rule 5’s remaining `modifiedon` instruction ([data-model.md:1095](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1095>)) to `touchedAt`, matching the declared column.

2. **BLOCKER — publish still has a stale-dependency race.**

   **Evidence:** Publish only asks whether a later `ChangeBatch` changed an Input or Person ([data-model.md:1085](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1085>)). The effective day also derives from other records listed in rule 9, including Quals and related state ([data-model.md:1125](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1125>)). Inference: because dependency commands append different rows, the publish query and a concurrent dependency commit have no shared conditional write to serialize them. Dataverse optimistic concurrency protects the same row, not unrelated rows. [Microsoft’s optimistic-concurrency documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/optimistic-concurrency), [transaction documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/scalable-customization-design/database-transactions).

   **Scenario:** Publish checks the log and finds nothing newer. A member’s Input transaction then commits before publish commits. Publish still issues the old effective day and old sign-offs.

   **Exact fix:** add a dependency fence that every relevant Input, Person, QualMark and other effective-day writer conditionally advances in its transaction. Publish must lock/compare the same fence, recompute the effective day and all four bindings server-side, then issue. A client cursor alone cannot authorize publication.

3. **MAJOR — `Person` has an impossible ownership/permission combination.**

   **Evidence:** Members have `U own` on `Person` ([data-model.md:1235](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1235>)), but the ownership list makes `Person` organization-owned ([data-model.md:1266](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1266>)). Organization-owned tables support organization-or-none access, not own-row depth. [Microsoft Dataverse security concepts](https://learn.microsoft.com/en-sg/power-platform/admin/wp-security-cds).

   **Exact fix:** make `Person` user/team-owned, with ordinary people owned by their linked user and non-user rows owned by an administrative team; or retain organization ownership, remove member Update privilege, and expose a server operation that restricts the permitted self-edit fields. Decide before table creation.

4. **MAJOR — `TakeOverRequest` cannot securely represent or authorize D454.**

   **Evidence:** The organization-owned record contains no target holder, target lease, consumed status, or uniqueness rule ([data-model.md:1171](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1171>)). “Admin creates; holder answers” is not expressible through ordinary privileges on an organization-owned table, and the security matrix has no explicit row for it ([data-model.md:1233](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1233>)).

   **Scenario:** Ranger is asked, releases the day, and Viper takes it. The old request does not identify Ranger’s lease, so it can be mistaken for authority to take the day from Viper. If admins receive Update, any admin can also write `handOver` or `forced` directly.

   **Exact fix:** bind each request to `holderId` and `leaseId`; add an explicit active/answered/consumed state and conditional active-request uniqueness. Give app roles no direct Update. Holder answers and requester-forces only through server operations that verify identity, lease and state; takeover conditionally consumes that exact request while creating the saved plan, assigning the day, and writing the batch/history atomically.

5. **MAJOR — stage 2 still has no executable transaction bound.**

   **Evidence:** The unresolved choice remains an open question ([data-model.md:1346](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1346>)). A seven-day template or Sort all can therefore still exceed Dataverse’s batch limit after the child tables are built.

   **Exact fix:** before approving the stage-2 schema, select and record either a product-enforced maximum operation count—including deletes, lock touches, logs and placement rows—or one bounded server-side bulk operation/aggregate representation.

6. **MAJOR — the canonical schema pass still omits newly required tables and relationships.**

   **Evidence:** The stage-1 inventory omits `AmendmentRetraction` and `TakeOverRequest` ([data-model.md:919](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:919>)). The Scheduler ownership/API list omits `TakeOverRequest`, `ScheduleInputPlacement`, and `WorkingSignoff` ([data-model.md:968](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:968>)). The foreign-key policy likewise gives no relationship behavior for those tables ([data-model.md:1209](</C:/Users/User/projects/Raptor/.claude/worktrees/day-lock-mockup-data-model-493d27/raptor-port/docs/data-model.md:1209>)).

   **Exact fix:** add every table to its stage inventory, module/API owner, explicit security row, ownership type and foreign-key/Assign behavior before handing the model to IT.

**REVISE**



## What was done with round 3 — and the review closed (Opus 5.5, 29 Sep 26)

Fable: APPROVE WITH FIXES (both fixes applied: the free team an owner team with Read on `ScheduleDay`; the check runs
as SYSTEM; change tracking switched on for `ChangeBatch`). Astra: REVISE. **The design review stops here** — three
rounds, his cap on design reviews; what remains is checked by both providers' final code reads when it is built (D353,
saved data).

| Astra round 3 | Done |
|---|---|
| 1 — a Custom API alone is bypassable; rule 5 still said `modifiedon` | ACCEPTED: the check is a synchronous plug-in on every write to a day (no bypass) plus Custom APIs as SYSTEM for the actions a caller cannot do; rule 5 reads `touchedAt`. |
| 2 — publish race with a dependency committed between the check and the publish | PARTLY: the check now covers quals too. The further fence is DECLINED with its reason, written in rule 3: the issued version is exactly what the four signed, and a change landing in that instant reads pending on the published day, as one filed a second later does (D177, D178) — nothing lost or issued unseen. |
| 3 — `Person` organisation-owned yet member-editable | ACCEPTED: `Person` is user/team-owned (his `User`; a person with no sign-in by an admin team). |
| 4 — `TakeOverRequest` not bound to a lease; writable directly | ACCEPTED: `holderId`, `leaseId`, a state, one active per day; only Custom APIs write it; the take consumes it with the saved plan and the owner change in one step. |
| 5 — stage 2's command size | KEPT OPEN as §12 q10, marked as blocking the stage-2 tables, not stage 1's (D453: group B and stage 2 come later). |
| 6 — inventories incomplete | ACCEPTED: §6 stage 1, §8's owner list and §10's relationships name `TakeOverRequest`, `AmendmentRetraction`, `WorkingSignoff`, `ScheduleInputPlacement`; the §11 rows come with `perms.ts` at the build (the note says so). |
