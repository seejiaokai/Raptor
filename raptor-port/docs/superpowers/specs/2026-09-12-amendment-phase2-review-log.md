# Amendment Phase-2 plan — cross-provider review log

Host/coordinator/planner: Claude (Opus 4.8). Reviewer: Codex / GPT-6 Astra (high).
Mode: `review` (claudex-loop 2.1.0). Builder (if authorised): Claude. Final code
inspector: fresh Codex session.
Plan under review: `2026-09-12-amendment-phase2-implementation-plan.md`.

## Round 1 — verdict REVISE (Codex GPT-6 Astra, high; 259s; session 01a0950a…)

Plan SHA256 at review: `54009007248c8752f3c9d9b6bf0dfd52849f3124646c9fbdd8190068874b8b1a`.
Runner note: the CLI turn completed (result.json valid, exit_code 0); the host
wrapper then crashed printing `→` to a cp1252 console (exit 1). Fixed for round 2
by forcing `PYTHONUTF8=1`. All findings below are ACCEPTED (host arbitration).

| ID | Sev | Finding (short) | Disposition |
|---|---|---|---|
| P2-01 | high | `publish → undo → redo` round-trip test would PIN undo crossing a publish, retracting AL1 and letting `max(seq)+1` reuse an "immutable" id for new content (§§2/9 forbid it; undo boundary is Phase 3). | ACCEPT. Test the record SHAPE by JSON serialization round-trip, NOT user-undo-across-publish. State the undo-cannot-cross-publish boundary as a Phase-3 dependency; soften "every take-back impossible" to "every explicit take-back PATH removed". |
| P2-02 | high | Digest-only gate rejects input-filing (INPUTS.acc, no DAYS change → equal digest) and content-identical reorders; appending synthetic marks after the gate can't make them publishable. | ACCEPT. ONE publication PROJECTION (canonical content + pending `inp:`/`mov:`) drives BOTH eligibility and stored diff. Pin input-only and reorder-only publication. |
| P2-03 | high | Proposed `canonicalDiff` compares positional addresses; deleting ground A shifts B to index 0 → misreports A→B change + false removal. `drafts.ts:478-492` already joins by rid to avoid this. | ACCEPT. Join structural rows by stable `rid`, resolve each snapshot independently; represent add/remove/reorder explicitly; positional only for notes. Reuse the existing rid-set-difference pattern. |
| P2-04 | high | Replacement map misses old-identity consumers: `Shell.tsx:154` `+v`→NaN on a verId; `interactions.ts:831` `+rver` recovery payload; `html.ts:955-957` renders `cv` as AL#; `html.ts:1568-1569`/`Shell.tsx:79-80` read `a.keys`/`a.n`. | ACCEPT. Expand map to selection writers, recovery-payload parser, day-header stamp, day-info history, Shell banner, all `nextAL` callers; update `schema.ts` AlRecord/Sched types. Carry verId strings through actions; derive labels/colours from seq. |
| P2-05 | high | "Only new-shape in-session data" is FALSE. `persistAll` (persist.ts:99-105) writes each week's book; `store.ts:384-387` restores `als/cur/orig` with only a `ridV` guard. Old-shape book → new resolver misreads → silent wrong render + wrong OIL authority (sync.ts:811/829), then written back. | ACCEPT (verified persist/restore path first-hand). Add an amendment-book FORMAT stamp (ridV precedent) + load-time isolation: reject/quarantine an unsupported book, preserve its blob, suppress publication / authoritative fallback / destructive OIL for those weeks. Full migration stays Phase 5. |
| P2-06 | med | Beak-as-Amend always reloads issued snapshot → overwrites live edits on an already-editable published day; no confirm/disarm/epilogue; "retain preview guards" is inaccurate (beak has role/page but no DPREV check). | ACCEPT + reframe (converges with owner's own question). Published day STAYS editable; the beak simply LOSES its un-publish job (no destructive reload). Editing a published day and publishing = next AL. The guarded "Load onto working copy" stays the only pull-old-content path. |
| P2-07 | med | Marks left unchanged → canonical-only amendments invisible while editing (cancelled-formation reason-only edit: `fx` changes, dayKeys unchanged, reconcile drops the mark, `html.ts:973` hides publish on `dayPendCount===0`). | ACCEPT. Every publication affordance reads `dayHasChanges` (the projection), not `dayPendCount`; extend reconcile/rebase to the canonical-only fields (`wx/fx/bx/bxr`) so a real difference can't be erased. Pin the cancelled-formation reason edit. |
| P2-08 | med | One Publish action driving `publishALDay` for every changed day = "publish all days", forbidden by brief §10. | ACCEPT. Per-day publish only: each affordance issues exactly one day; other days' drafts/signatures untouched. |
| P2-09 | med | Digest gate incomplete: `ground[].src` linkage is in neither `dayKeys` nor `canonicalContent`, yet the build plan classes it canonical Phase-1 content; two ground rows differing only in source-input link have equal digests (matters for backup/recovery — slots.ts unaccept, store.ts:341 acc→'g'). | ACCEPT (Phase-1a omission surfaced). Add a ground source-linkage address to `canonicalContent`; add a src-link-only case to the completeness test; verify it stays visible through backup/recovery. |

Coverage (Codex, self-reported): plan + frozen brief + phase plan; publish/canonical/verid/restore/drafts/schema/keys/rowids; UI writers through Shell/interactions/html/board/ALPanel/view; history serialization + saved-week hydration + live/stashed OIL readers; selected tests read, none executed.
Limitations (Codex): static review of a proposal, no diff/tests/build/browser; deferred phases (signatures/durable/migration/crew) not reviewed as features.

Host action: revise the plan (all 9), then round 2 (resume) to confirm.

## Round 2 — verdict REVISE (Codex GPT-6 Astra, high; 294s; resumed session 01a0950a…)

Revised plan SHA256: `5c4a0290b38ddd30e80c6896d47b1b9f0264cdb7f4263117009b37785743d421`.
Codex confirmed the Round-1 dispositions landed (non-destructive beak, per-day
actions, UI identity conversion, explicit Phase-3 undo dependency). 7 deeper findings,
ALL ACCEPTED:

| ID | Sev | Finding (short) | Disposition |
|---|---|---|---|
| P2-R2-01 | high | Eligibility (projection incl pending `mov:`) and stored diff (rid-order) still two definitions: move-and-move-back leaves marks but empty order-diff; identical-note swap mints `mov:` with no positional diff; reusing effective-ground-order makes `gman` affect the diff though it's excluded. | ACCEPT. ONE `dayDelta` (values/structure/order/inputs) from ACTUAL surviving order, not accumulated marks; drives eligibility + counts + diff. Identical-note swap = no-op; `gman`-driven order IS a move (raw `gman` still excluded from values). §3 rewritten. |
| P2-R2-02 | med | `rowids.ts` translator (`keyLevels`/`ridKey`/`posKey`) doesn't know `wx/fx/bx/bxr/gx`, so canonical addresses stay positional → edit-plus-move hole persists for them. | ACCEPT. Add those families to the translator; use in delta/rebase/reconcile. §3. |
| P2-R2-03 | med | `ar:`/`at:` values embed aircraft-index-ordered data inside a formation value; a rid join at formation level still fakes a formation change when aircraft move/delete. | ACCEPT. Decompose `ar:`/`at:` into per-aircraft rid-joined addresses in canonical content/diff (renderer `dayKeys` unchanged). §3. |
| P2-R2-04 | high | Load-time guard alone insufficient: `sync.ts:745` decodes unvisited stashes without `applyWeekModel`; `runOilPass:897` deletes credits absent from desired map; `store.ts:451`/`persist.ts:105` re-serialize. §6 "two resolvers suffice" is wrong. | ACCEPT. SHARED `amFormatOf`/`protectedWeek` classifier consulted by hydration, scheduler load, stashed-week OIL decode, both OIL directions, stash-on-leave, `persistAll`; preserve raw blob; protected dates never cleared by missing desired work. §5/§6. |
| P2-R2-05 | med | Resolver doesn't check identity belongs to the day: `daySnapIn(sc,0,TuesdayAL1Id)` returns Tuesday's snap for Monday; any `…#0` → `orig[di]`. | ACCEPT. Require exact Original-id match; AL match on id+di+iso+seq; reject foreign/malformed; derive iso from `sc` not live CURWEEK. §1. |
| P2-R2-06 | med | Recovery control still uses `dayPendCount` for its no-change shortcut + replacement confirm; with the digest trigger a day can have real changes + zero pending marks → bypasses confirm, discards draft. `withDaySnap` clears pending before the count. | ACCEPT. Recovery dirty-check + replacement summary read `dayDelta`; capture live context before the preview swap. §6. |
| P2-R2-07 | low | Stale §7 bullets ("equal digest → no publish"; "publish→undo→redo round-trips"; beak called "Amend") contradict the accepted revisions. | ACCEPT. §7 corrected to the `dayDelta`/serialization/inert-beak contracts. |

Host action: revise the plan (all 7), then round 3 (resume) to confirm.

## Round 3 — verdict REVISE (Codex GPT-6 Astra, high; 215s; resumed session 01a0950a…)

Revised plan SHA256: `cc3564418dd8d14345a742fc3b037c17a6108a0501c257fad1fb24266199bf01`.
Codex confirmed all Round-2 dispositions are addressed at plan level. 4 findings
(trend 9→7→4), ALL ACCEPTED — new consequences of the fixes, not re-litigation:

| ID | Sev | Finding (short) | Disposition |
|---|---|---|---|
| P2-R3-01 | high | The new input axis needs issued filing state the records don't store (Original `{id,d,c}`, AL `{d,c}`); file-before vs file-after-Original are indistinguishable; navigation clears `INPUTS.acc` so live can't reconstruct `'u'`. | ACCEPT. Snapshot gains a minimal per-date **filing fingerprint** `fil` (`inputId→state`), frozen in Original + every AL; axis 4 compares current vs issued `fil`. Separate from AM-04's value freezing. §1/§3. |
| P2-R3-02 | med | Quarantine preserves the OLD blob but doesn't stop EDITS: role-only auth, guards don't check `protectedWeek`; an admin edits an isolated week then loses it on navigation. | ACCEPT. Unsupported week is READ-ONLY at UI + mutation entry (incl wholesale replace + input actions). §5. |
| P2-R3-03 | med | Resolver validates against the supplied snapshot's week, but `sc` carries NO week key (`schedFields` stores none; `sync.ts:754` builds `sc` from publication fields); a week-A book under week-B passes id/di/iso/seq and is credited to B. | ACCEPT. Thread the authoritative outer week key into resolver/classifier; validate every date against `dayIso(weekKey,di)`; apply to the current-pointer fallback. §1. |
| P2-R3-04 | med | `applyDayTpl` refuses published days ("Reopen first"); removing reopen strands the template-on-published-day workflow — plan left it unchanged. | ACCEPT. Convert: apply to the working draft with replacement confirm → next AL, issued records/pointer untouched; update `board.ts` message + tests. §4. |

Host action: revise the plan (all 4), then round 4 (resume) to confirm.
