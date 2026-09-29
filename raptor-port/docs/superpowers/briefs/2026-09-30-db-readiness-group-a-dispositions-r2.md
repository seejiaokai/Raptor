# Round 2 dispositions - [DB-READINESS] group A plan (30 Sep 26)

Reports: Fable `...-fable-r2.md` (REVISE, F2-01..F2-12); Astra `...-astra-r2.md` (BLOCK, R2-01..R2-10). Plan v2 is
commit e3d64c29; v3 replaces it. Every finding below is ACCEPTED unless marked; round 3 is the last (his cap).

| Finding | Disposition | v3 |
|---|---|---|
| R2-01 variable children; Qualification; seat; missing tables | ACCEPTED. The fixed-child rule is kept ONLY for the four IssuedSignoff roles. Variable lists stay JSON on their parent at stage 1 and the design is corrected to say so (Astra's option 3/4): a person's granted marks on `Person` (QualMark and Qualification move to stage 2 together), an input's `docIds` on `Input` (InputAttachment goes with Attachment, section 12 q2), a profile's `past` stints on the profile, an edit-log line's lists on the line. `AccessRequest.seenBy` is the one variable list two admins write at once: it becomes a per-admin row (`settings/reqseen:<accountId>`), like EditLogSeen. `seat` and `sxo` go to `Person` through the shell's person writer (with F2-09) - a product ripple put to him as question 5. The matrix lists every stage-1 table: InputType and LeaveCounter reference-seeded, SchemaVersion the stamp, TakeOverRequest with the lock's build. | 2.5 |
| R2-02 phase 0 stamps 6 too early | ACCEPTED: version 6 is switched on only by the build that registers every converter; a manifest refuses to stamp if one is missing; one full v5 fixture test. | 2.6, phase 0 |
| R2-03 the delete rule has no mechanism | ACCEPTED: rows are written by a command-stream consumer at phase 9, before the seal (the architecture's own Step-5 fold subscriber, `command/registry.ts` header); `persistAll` / `rawPersist` kept only for boot, the fold and named non-command paths. | 2.2, phase 1 |
| R2-04 command records for issuance / retraction | ACCEPTED: `sched.issuance`, `sched.retraction`; unpublish never deletes or moves. | 2.9, phase 1 |
| R2-05 ChangeBatch cannot carry store versions | ACCEPTED (Astra's recommended option 1): the batch is a pure invalidation log `{table, key, op}`; the writer's new versions come from the changeset reply (group B); `data-model.md` section 9 corrected. Group B must keep command groups apart on the wire. | 2.7, phase 4 |
| R2-06 = F2-01 edit-log line outside the group | ACCEPTED: written at `keep`, inside the command; no microtask. | phase 4 |
| R2-07 confinement is analysis, not a plan | ACCEPTED with Astra's exact classification per writer. | phase 1.3 |
| R2-08 q9 not settled by "no plug-in" | ACCEPTED: two questions separated - how the app works out the picture (proceeds) and how reports get it (the schema handoff for ScheduleDay waits on IT's written answer). | header, phase 6, 5 |
| R2-09 boot policy | ACCEPTED: `BootPolicy` separate from `Backend`; frozen seed factories (Fable F2-05 a); a Tracker reset hook for tests; the bootstrap admin from root configuration. | phase 5 |
| R2-10 ties in ord | ACCEPTED: order is `(ord, stable id)` everywhere; head insert `min - 1024`; renumbering an explicit command. | 2.3 |
| F2-02 line order and "seen" | ACCEPTED: `(at, lineId)`; seen and seenFrom as positions in it; IT told. | phase 4 |
| F2-03 non-command writers after boot | ACCEPTED: each named with a disposition; `loadWeek` becomes a `sched.load` projection. | phase 4 |
| F2-04 where ord is minted | ACCEPTED: in `applyEnd` / the people store's advance, from current neighbours. | 2.3 |
| F2-05 in-process seed pair | ACCEPTED (a): frozen seed copies. | phase 5 |
| F2-06 a wipe must remove the stamp | ACCEPTED | 2.8 |
| F2-07 puck ids a per-browser counter | ACCEPTED: `newId('pp')` | phase 2 |
| F2-08 per-week preservation mechanism | ACCEPTED: per-week map of raw row strings, classified before the join | phase 1 |
| F2-09 the sxo seam | ACCEPTED (with R2-01) | phase 3 |
| F2-10 the ~n rule | ACCEPTED | 2.5 |
| F2-11 fold vs the journal filter | ACCEPTED: two predicates | 2.6 |
| F2-12 provisional; persistPeople; duplicate accounts | ACCEPTED | header, 2.2, phase 4 |
