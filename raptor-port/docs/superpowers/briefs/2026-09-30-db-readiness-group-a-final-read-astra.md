# Astra — DB-readiness group A final code read

Reviewed committed branch `claude/db-readiness-table-shaping-4094f6` at `6e1cbfd4350c5c463901107d6fc582d10dede35d`, against `origin/main` at `cddb25239f49a39a2022cb527994d422d175c066`.

This was a read-only static review. I did not start the app or run tests. Because the shared working tree changed during the review, every final citation was read from committed `HEAD`; I did not inspect the other reviewer’s report or use their uncommitted changes.

## Findings

### 1. High — A week load can overwrite a newer saved day with the loading browser’s stale whole-day copy

**What**

`sched.load` is described as navigation, but when re-landing an input changes an already-stored day, `scheduleRows` writes the entire reconstructed `ScheduleDay` row. The `wb.has` condition distinguishes saved from unsaved days; it does not establish that the loading browser still has the latest saved row.

The boot path has the same defect: it reconstructs the loaded week from its local state and calls `wb.set` for every existing stored suffix.

This disputes the walk’s H1/H3 disposition. Putting the write in one batch and declining to create missing day rows fixes batch coverage and first-save fan-out, but it does not make a stale whole-day replacement safe.

**Where**

- `src/state/store.ts:616-638` installs the locally stashed saved week.
- `src/state/store.ts:688-690` runs the re-landing as `sched.load`.
- `src/state/persist.ts:297-324` reconstructs the entire day and writes it when the day row already exists.
- `src/state/persist.ts:344-357` reconstructs and rewrites existing rows during boot.
- `src/state/persist.ts:381-387` invokes that boot writer.
- `docs/handpass/2026-09-30-dbrA-group-walk.md:113-114` records H1/H3 as fixed without exercising a stale already-saved day.
- The present tests deliberately expect the landing write, so they preserve rather than expose the collision.

**Concrete scenario**

- **Setup:** Week W and Monday already have stored rows. Browser B loaded that state earlier. Browser A now changes an ordinary Monday schedule field and saves it.
- **Action:** Without refreshing its cached copy, B navigates to W. A newly visible input causes B’s re-landing pass to change Monday.
- **What shows:** `commitSchedLoad` emits a `sched.load` envelope. Because Monday already exists, `scheduleRows` serializes B’s complete Monday and writes `weeks/<W>#0`. The group has a correct batch, but its value contains B’s old schedule plus the landing. A’s newer schedule edit disappears.
- **What should happen:** Navigation should change the in-memory projection only. It must not put a `ScheduleDay` assembled from a cached snapshot. A’s stored day must remain byte-identical.

A boot race has the same result if A saves after B hydrates but before B’s `writeLoadedWeekAtBoot`.

**Does `main` do the same?**

Yes, in a broader form. `origin/main`’s `persistAll` writes whole week snapshots, and `weekSwapEnd` calls it after navigation (`origin/main:src/state/persist.ts:86-119,127-129`). Group A substantially narrowed the problem to day rows, but the `sched.load` and boot exceptions retain the same stale-source failure class.

**Exact fix**

1. In `scheduleRows` (`src/state/persist.ts`), treat `env.type === SCHED_TYPES.load` as persistence-read-only for the `weeks` collection. Do not emit a week or day put for its derived landing changes.
2. Keep `commitSchedLoad` if its input-record changes still need the ordinary row mapper, but ensure its schedule composer returns no `ScheduleDay`, `ScheduleWeek`, issuance, or retraction write.
3. Remove the `writeLoadedWeekAtBoot(wb)` call from `wirePersist`, then remove the helper if it has no remaining caller. Boot may rebuild the visible landing in memory; it must not write that projection back.
4. Do not replace this with a “write only if bytes differ” check. That comparison is against B’s local whiteboard, not a concurrency-safe current store version.
5. Preserve these invariants:
   - an unsaved week and an unsaved day remain unsaved;
   - an input still re-lands visibly after navigation and reload;
   - a scheduler’s explicit take-off or later edit still persists through its own command;
   - preserved weeks remain byte-frozen;
   - no synthetic `boot` or `sched.load` batch is emitted when no durable row is written.
6. Replace the current positive landing-write assertions with a two-client regression:
   - B loads the old Monday;
   - A writes a new Monday value;
   - an input causes B to re-land on Monday;
   - B navigates away and back;
   - assert B emits no `weeks/<W>#0` write;
   - assert the backend retains A’s exact Monday bytes;
   - assert B still displays the input landing in memory.
7. Add the equivalent boot-race test: mutate the backend after B’s hydration snapshot and before persistence wiring, then assert boot does not write any week row.

---

### 2. High — The permission matrix denies rows that valid actors necessarily create in the same saved group

**What**

The permission matrix describes `EditLog` as read-only for admins and members, although ordinary user commands create their history line inside that actor’s transaction. It also gives pending users no `ChangeBatch` create permission, although a pending user’s valid `access.request` group is sealed with a batch.

The command gate passes because it authorizes the command’s root operation. A database authorizing every physical row in the atomic changeset would reject the companion row and therefore reject the entire valid action.

**Where**

- `src/state/perms.ts:70-83`:
  - `EditLog`: Admin `R`, Member `R`;
  - `ChangeBatch`: no Pending permission.
- `src/state/perms.ts:322` permits a pending actor to run `access.request`.
- `src/state/accounts.ts:425-438` creates that actor’s `AccessRequest`.
- `src/state/changelines.ts:84-115,427-458` creates history lines from user-origin command changes, including member-created inputs.
- `src/engine/editlog.ts:413-425` writes each retained line as `settings/elog:<lineId>`.
- `src/state/changebatch.ts:58-73` seals every non-empty saved group with a `ChangeBatch`.
- `docs/data-model.md:1335-1336` repeats the same incorrect cells, so the existing documentation-drift test cannot expose the runtime mismatch.

**Concrete scenarios**

**Member history line**

- **Setup:** A member is signed in and is allowed to file their own input.
- **Action:** They add the input.
- **What shows:** The input command succeeds in the browser. Its user-origin envelope causes `changeLinesFor` to call `logAction`; the line is retained inside the same member-owned saved group.
- **Database result:** The atomic changeset contains an `Input` put, an `EditLog` put, and its `ChangeBatch`. The matrix allows the input but denies the member’s `EditLog` create, so the whole changeset fails.
- **Should:** The valid input, its history line, and batch commit together.

**Pending access request**

- **Setup:** A signed-in pending person has no account and is eligible to request access.
- **Action:** They submit the request.
- **What shows:** `access.request` creates their own `AccessRequest`; the sealer adds a batch.
- **Database result:** Pending has own-create permission for `AccessRequest` but no create permission for `ChangeBatch`, so the group fails.
- **Should:** Both rows commit atomically.

**Does `main` do the same?**

`EditLog` being read-only for human roles is already present on `main`. `ChangeBatch` and its pending-user contradiction are new on this branch because neither `ChangeBatch` nor `changebatch.ts` exists on `origin/main`.

**Exact fix**

1. Change `PERMS[T.editlog]` to give Admin and Member `C R`.
2. Keep EditLog update unavailable: new forward data uses stable row-addressed keys, so old positional remaps are demo-data-only under D56.
3. Keep human EditLog deletion unavailable in this matrix while the sweep and retention path remains an explicit system projection. The database adapter must preserve that system identity; it must not submit those deletes as a member.
4. Change `PERMS[T.changebatch]` so Pending has `C` and no read/update/delete permission:
   ```ts
   row(cell('C R'), cell('C R'), cell('R'), cell('C'))
   ```
5. Make the identical edits to §11 of `docs/data-model.md`, including wording that EditLog rows are created in the acting user’s group while maintenance deletes use the system path.
6. Keep `ChangeBatch` creation inaccessible through an ordinary UI/command door. Pending create authority is solely for the sealer’s companion row in the same atomic access-request changeset.
7. Add a role-to-physical-group test, not another documentation equality test:
   - collect the actual whiteboard group;
   - classify every row with `tableOf`;
   - derive put/delete from the physical change;
   - check every item against the outer actor’s role, with an explicit system-actor bypass;
   - pin an admin edit, a member-owned input, and a pending access request.
8. For the pending case, assert the group contains exactly the request and batch, and that Pending can create both but read neither shared batch data nor anyone else’s request.

---

### 3. Medium — Tracker batch items name marks, pace, and lulls as the wrong database table

**What**

`tableOf` groups four Tracker key families under `Enrolment`. Only dates belong there:

- `v3:<course>:<syllabus>:m:<student>` is an `Attempt`/progression-summary write.
- `v3:<course>:pace:<student>` and `…:lulls:<student>` belong to `CoursePlan`.
- `…:d:<student>` belongs to `Enrolment`.

Because the change-batch sealer calls `tableOf` for every physical row, valid Tracker saves produce false invalidation metadata. A consumer routing or re-reading by `{table,key}` can query `Enrolment` and miss the changed Attempt or CoursePlan row.

**Where**

- `src/storage/tables.ts:15-28`, especially line 21, returns `Enrolment` for `m`, `d`, `pace`, and `lulls`.
- `src/state/changebatch.ts:58-63` copies that classification into every batch item.
- `src/tracker/app/core.js:932-956` defines the actual pace, lulls, mark, and date key grammars.
- `docs/data-model.md:978-982` maps marks to `Attempt`, dates to `Enrolment`, and pace/lulls to `CoursePlan`.
- `src/storage/seal.test.ts:115-142` has no Tracker classification cases.

**Concrete scenario**

- **Setup:** Two clients show the Tracker. Client A records a mark for a student.
- **Action:** A saves `tracker/v3:<course>:<syllabus>:m:<student>`.
- **What shows:** The physical row is saved, but its batch item says `{ table: "Enrolment", key: "tracker/…:m:…", op: "put" }`.
- **Downstream observation:** A table-driven reader queries or invalidates `Enrolment`; the progression/attempt consumer is not refreshed. Client B can remain stale until a full reload.
- **Should:** The item names `Attempt`. Pace and lull changes must similarly name `CoursePlan`.

**Does `main` do the same?**

No equivalent exists on `main`: both `src/storage/tables.ts` and `src/state/changebatch.ts` are branch additions. The Tracker’s stored keys pre-exist, but the incorrect table label is new Group A metadata.

**Exact fix**

1. In `TRACKER(id)` split line 21 into distinct cases:
   ```ts
   if (last2 === 'm') return 'Attempt'
   if (last2 === 'd') return 'Enrolment'
   if (last2 === 'pace' || last2 === 'lulls') return 'CoursePlan'
   ```
2. Keep the specific master prefixes before generic parsing because a chart or ball identifier may contain words used by later grammar checks.
3. Keep the five-part `…:enr:<id>` test before the older logical-record cases.
4. Preserve both current and legacy date keys as `Enrolment`:
   - `v3:<course>:<syllabus>:d:<student>`;
   - `v3:<course>:d:<student>`.
5. Add `tableOf` cases for:
   - current mark → `Attempt`;
   - current and legacy dates → `Enrolment`;
   - pace and lulls → `CoursePlan`;
   - enrolment row → `Enrolment`;
   - course-wide plan → `CoursePlan`.
6. Add an end-to-end sealing assertion for a mark and a pace edit, proving the resulting `ChangeBatch.items` contains the correct table, full stored key, and operation.

## Explicit negatives

Within this static review, I checked and found the following sound apart from the findings above:

- The whiteboard’s outer transaction and sealer produce one batch for a non-empty saved group, exclude `changes/*` from its own items, and retain batch deletion separately from the new batch’s data-item list.
- The row consumer writes from command envelopes rather than periodically sweeping the entire request, people, planning, Leave War, or Tracker world.
- Input, person, planning-puck, day-remark, account, access-request, request-seen, change-seen, EditLog, Leave War, and split Tracker rows have stable per-record keys.
- Deletes in those row mappers come from explicit command changes; I found no new forward path that infers deletion merely because a stale client’s list lacks a row.
- Order-sensitive split families use a stored sparse order and deterministic `(ord, id)` reads. I found no new key-order-only renderer in the Group A paths.
- Schedule issuance and withdrawal rows have separate keys; the classifier checks `:is:` and `:rx:` before interpreting `#`, so a version identifier containing `#` is not mistaken for a day.
- The week converter, manifest fold, schema stamp, and atomic fold group preserve the registered collections. I found no second-run conversion path or converter that silently consumes an unreadable source.
- The Tracker split/join code preserves courses, charts, chart definitions, ball details, enrolments, and ordering. Its unreadable or unsplittable records remain untouched rather than being deleted.
- The shared-store boot policy does not seed demo requests, roster, Leave War, or Tracker data into an initialized store; first-admin bootstrap remains separate from demo seeding.
- The Leave War row mapper retains one key per record, keeps moved records at the same key, and avoids a whole-cell absence-list replacement.
- Forward and restore paths use the same row consumer. I found no new Group A undo asymmetry beyond the already-filed `[UNDO-PUBLISH-ERASES-ISSUANCE]`, which the brief assigns to Group B.
- The documented H2 history-line adoption is wired: an immediately following user command adopts the held line, while an unclaimed idle line uses the system projection door.
- Guest and member read visibility for inputs, medical details, schedules, and Tracker data otherwise matches the present §11 matrix.
- I did not treat old demo-only positional EditLog remapping, old account bundles, or other cleared pre-promulgation records as findings.
- I did not report the unbuilt day lock, Dataverse adapter, polling loop, row versions, phase 6 read-time overlays, or phase 7 follow-ups as missing features.

