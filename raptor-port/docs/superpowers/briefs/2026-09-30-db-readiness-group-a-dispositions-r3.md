# Round 3 dispositions - [DB-READINESS] group A plan (30 Sep 26) - THE LAST ROUND

Reports: Fable `...-fable-r3.md` (REVISE - "no further round needed"); Astra `...-astra-r3.md` (BLOCK). His cap on
design rounds is three (memory "cap design review rounds"): every point is folded into plan v4 without a fourth round;
what remains is caught by the code reads after the build (both providers - persistence, D353).

| Finding | Disposition | v4 |
|---|---|---|
| R3-01 = F3-01 `sched.load` deletes the week left | ACCEPTED (Astra's fuller fix): navigation is read-only, no enlist across the CURWEEK change, only B's landing delta runs as sched.load; Fable's put-wins mapper rule kept as a guard | phase 1.3 |
| R3-02 = F3-03 lw.cell to per-record rows; LeaveBid order | ACCEPTED: envelope-level diff keyed by (warId, recId), moves coalesced to one put; ord on every WarRec | section 8 P3-CELL-DIFF |
| R3-03 boot metadata; bootstrap identity | ACCEPTED: one SchemaVersion object (stage, dataFormatVersion, initialized, appliedAt, minClient) replaces the bare number and settings/booted; bootstrap = principal + Person, one group, idempotent | 2.5, 2.8, section 8 P0-BOOTSTRAP |
| R3-04 AccessRequestSeen | ACCEPTED: a new table for IT; AccessRequest.seenBy removed from the design | 2.5, 4 |
| R3-05 Tracker undo/redo raw path | ACCEPTED (build checklist, as Astra marked it) | section 8 P4.1-TRACKER-RESTORE |
| F3-02 un on the day row | ACCEPTED over round-1 A-05's "store at day grain": un is not in histSnap (history.ts:60), so no command could write it, and acc:'r' on the Input already survives the load-time clear (store.ts:578) - the design already says "not stored, worked out on read". A-05's behavioural concern kept as a test | phase 1.1, section 8 P1-UN-BEHAVIOUR |
| F3-04 autoAcceptSeedInputs is the generic landing pass | ACCEPTED | section 8 P5-LANDING |
| F3-05 changes not a Collection | ACCEPTED | section 8 P0-CHANGES-COLLECTION |
| F3-06 phase 3 wording vs D460 | OVERTAKEN by D461 (30 Sep 26): the war's Edit person is removed; seat, band and SXO only on Quals | phase 3 |
| F3-07..F3-10 | ACCEPTED as build checklist lines | section 8 |
