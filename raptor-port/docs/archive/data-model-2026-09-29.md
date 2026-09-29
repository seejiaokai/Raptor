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

