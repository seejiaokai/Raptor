# Passages moved out of `raptor-port/docs/data-model.md`

Moved here UNCHANGED (D138) by `backlog-archive.mjs --move`. Each heading names the day and the ruling that
replaced the passage; the live text is in `data-model.md` itself.

## 29 Sep 26 — §9 the stage-1 edit lease (a whole week, five minutes), replaced by the day lock (D355, D356, [DB-SYNC-MODEL])

**The stage-1 edit lease — NARROWED 29 Sep 26 BY THE OWNER (D355): the lock is per DAY (one day or several chosen), shown to
others as "<callsign> – editing" (read only for them), freed after 30 MINUTES idle, and an admin can take it over; what
counts as idle, Save vs saved-as-you-go, and how others see changes are being settled in `OUTSTANDING.md`
`[DB-SYNC-MODEL]` — SETTLED the same day (D356): idle = no change on the day by the holder for 30 minutes (a warning at
25, "Keep editing"; closing the page or signing out frees it at once); changes save as they are made, "Done editing"
releases the lock; others' changes arrive by themselves every 30 seconds while the page is on screen (paused in the
background, the Sync fast mode for publishing, a manual refresh as a backup). The paragraph below (a whole week, five
minutes) is the earlier proposal.** While a week is one record, two schedulers with
it open would reject each other on every keystroke. `ScheduleWeek.editingBy`
+ `leaseUntil`: opening a week for edit takes the lease (five minutes,
renewed on activity, released on leave); a second editor sees who holds it
and gets the week read-only until it expires; an expired lease is free to
take. The version check stays underneath — the lease reduces conflicts, it
does not replace the guard. The lease goes away at stage 2 with the row
merge.

## 29 Sep 26 — §3 ScheduleWeek as a whole-week snapshot at stage 1, replaced by a week row plus one ScheduleDay row per day (D355, [DB-SYNC-MODEL])

### ScheduleWeek

Owner: **Scheduler**. One week of the flying programme. **Stage 1: a
whole-record JSON snapshot. Stage 2: the parent of the row tables below.**

| Field | Type | Req | Meaning |
|---|---|---|---|
| `weekStart` | date | yes | the Monday, ISO. Unique |
| `snapshot` | JSON | stage 1 | exactly what `weekStashSnap()` serialises today — the persisted week record (`state/store.ts`, filed by `state/persist.ts`): `d` (the seven days), the `SCHED` fields under their short names, `wo` (muted warnings) and `un` (content keys of inputs a scheduler removed on this week). **Not** the inputs or the planning layer: those are their own records today (`inputs/all`, `plan/all`) and their own tables here. Undo's `histSnap()` is the wider record that also carries them; it is never stored |
| `mutedWarnings` | string[] | no | `wo` — promoted out of the snapshot at stage 2 |
| `removedInputKeys` | string[] | no | `un` — promoted out of the snapshot at stage 2, as `Input` lookups |
| `originals` | JSON | stage 1 | `SCHED.orig` — each day as first published, keyed by day index. Moves to `ScheduleDay.original` at stage 2 |
| `dayState` | JSON | stage 1 | per day index: `approved` (`dayOK`), `shownAmendmentId` (`cur` — null for `orig`), and the four sign-off slots. Moves to `ScheduleDay` + `Signoff` rows at stage 2 |
| `planningLayer` | JSON | no | `PLANPUCKS` + `DAYRMK` for this week's dates, keyed by ISO date; own rows at stage 2. Today one global record (`plan/all`) — the migration splits it by week |
| `ownedBy` | ref User | yes | (new) who created the week — needed before incoming sync (section 7) |
| `editingBy`, `leaseUntil` | ref User / datetime | no | (new, stage 1) the whole-record edit lease: who holds the week open and until when (section 9) |

Relationships: 1–n `ScheduleDay` (stage 2), `Amendment`, `Signoff`.
From today: `raptor:weeks/<dd-mm-yyyy>` — **already persisted**: the
per-week stash is hydrated from and written to the whiteboard on every
history step (`state/persist.ts`), so a week survives a reload today. The
loaded week is filed only once it has changed since load (a pristine seed
week is never written).
App change: none at stage 1 — the app already builds this exact record. At
stage 2 the snapshot column empties as the rows take over.


## 29 Sep 26 — §3 Amendment and Signoff (the pre-Phase-2 week-numbered record, one Signoff table), replaced by the per-day version record and working / issued sign-offs (the day-lock red team, [DB-SYNC-MODEL])

### Amendment

Owner: **Scheduler**. One published amendment (AL) to a day. **Append-only
once `issuedAt` is set**: no column of an issued amendment is ever updated,
and it is never hard-deleted — a correction is the next AL.

| Field | Type | Req | Meaning |
|---|---|---|---|
| `weekId` | ref ScheduleWeek | yes | |
| `number` | int | yes | `n`, the AL number |
| `dayIndexes` | int[] | yes | `days` |
| `slotKeys` | string[] | yes | `keys` — becomes row ids at stage 2 |
| `itemCount` | int | yes | `n0`, frozen at issue |
| `structuralAdds` | string[] | no | `adds` / `structAdds` |
| `signatures` | JSON | yes | `sign` at issue — the four callsigns per day, a display copy frozen at issue |
| `snapshot` | JSON | yes | `snap`, the covered days as issued. **Required** — it is the document the squadron signed |
| `issuedBy`, `issuedAt` | ref User / datetime | yes | today only the signature name is kept |
| `isDeleted` | bool | yes | published history is never hard-deleted |

Relationships: n–1 `ScheduleWeek`.
From today: `SCHED.als[n]`, which also rides inside today's persisted week record.
App change: split out of the snapshot at stage 1 already (the as-is map's own
suggested first cut), so amendments can be reported on without opening a week.

### Signoff

Owner: **Scheduler**. One signature on one day: who signed which slot, and
when. **A row is who/when only** — a day's approval and the version it
shows are day-level facts and live on the day (the `ScheduleDay` snapshot at
stage 1, `ScheduleDay.approved` / `shownAmendmentId` at stage 2), not on
four sign-off rows that would have to agree.

| Field | Type | Req | Meaning |
|---|---|---|---|
| `weekId` | ref ScheduleWeek | yes | |
| `dayIndex` | int | yes | 0–6. **Approval is per day, not per week** |
| `role` | choice `cur\|sked\|plan\|appr` | yes | the four sign-off slots |
| `signedByPersonId` | ref Person | no | the live `SCHED.sign[di].<role>` value is a `PEOPLE` id when signed — the sign-off picker's options are ids (`ui/html.ts`, written through `ui/Shell.tsx`) — and `''` when unsigned. **Nullable**: null is the unsigned slot |
| `signedName` | string | no | the callsign frozen on an issued AL (`als[n].sign`) — a display copy, never the identity |
| `signedAt` | datetime | no | (new) |

Relationships: n–1 `ScheduleWeek`, n–1 `Person`. Unique on (`weekId`,
`dayIndex`, `role`). Append-only once the day it signs has been issued in
an `Amendment` (`issuedAt` set): a later re-sign is a new row for the next
AL, never an update of the frozen one.
From today: `SCHED.sign` (the rows), `SCHED.dayOK` and `SCHED.cur` (the
day-level `approved` and `shownAmendmentId`), `SCHED.orig` (the day-level
`original`).
App change: `orig` (the day as first published) stays a JSON column on the
day-level row; the rest becomes queryable.


## 29 Sep 26 — §9 the change feed as one cross-table `since(changeSeq)` read on Dataverse change tracking, replaced by the ChangeBatch log (Astra 5, Fable 17 — Dataverse tracks changes one table at a time)

**The change feed.** Every table carries `changeSeq` and a tombstone
(section 2). `since(changeSeq)` returns every row of every collection the
caller may read with a `changeSeq` above the one given, tombstones
included, in `changeSeq` order — so a client that was away catches up in
one call, and a deleted row reaches it as a row, not as an absence. The
postman's incoming side polls it — every 30 seconds while the page is on screen, from the first shared release (the day lock, rule 7: D356 pulls it forward from stage 3); the Leave War's OIL pass and
the two sync derivations replay it. On Dataverse this is change tracking
on each table, and a tombstone is the platform's deleted-row token.
