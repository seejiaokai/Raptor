# Red team — [DB-READINESS] group A plan, round 3 — the last (Fable 5.1, 30 Sep 26)

Reviewed read-only: plan v3 (the working-tree `docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`) against
v2 (commit e3d64c29), the round-2 dispositions, both round-2 reports, `data-model.md` §3/§5/§9, D460 as it now stands
(`.claude/decisions-full/leave-war.md`), and the code every claim below cites: `command/{commit,types,registry}.ts`,
`storage/{whiteboard,backend,browser,boot,reset,postman,adapters}.ts`, `state/{persist,store,history,sched-commit,
people-settings-commit,accounts,changes,plan}.ts`, `engine/{slots,drafts,rowids,editlog,verid,weekstash,weeks-data,
people}.ts`, `leavewar/state/store.ts`, `leavewar/sync.ts`, `leavewar/ui/PersonSheet.tsx`, `undo/timeline.ts`,
`main.tsx`. D56 applied: nothing below is about data already stored.

Per the round-3 brief, only two kinds of point: a round-2 fix that is still wrong or incomplete, and something v3
introduced that would fail in new data or shape a table wrongly. No restatement of accepted points.

---

## 1. The round-2 findings — is each v3 fix correct and complete?

| Finding | v3 | Verdict |
|---|---|---|
| R2-01 variable children / seat / missing tables | §2.5, §4 | Complete. |
| R2-02 stamp 6 too early | §2.6, phase 0 | Complete. |
| R2-03 delete mechanism → stream consumer | §2.2 | Correct as a mechanism; INCOMPLETE in four places the consumer cannot produce or would mis-produce a row — F3-01 (a week switch), F3-02 (`un`), F3-03 (a Leave War cell's list), F3-07 (a settings `null`). |
| R2-04 issuance / retraction records | §2.9 | Complete (F2-10's `~n` rule folded in). |
| R2-05 invalidation-only ChangeBatch | §2.7 | Complete. One boot-order hole in the new collection itself — F3-05. |
| R2-06 = F2-01 edit log at `keep` | phase 4.3 | Complete. Verified: `keep` is deferred by `setElogDefer(deferEffect)` (`store.ts:779`) into phase 8 or the post-delivery drain (`commit.ts:292-294`), both inside the outer whiteboard transaction; `store.set('elog:…')` while committing takes the raw branch (`people-settings-commit.ts:278`) and so lands in the group. The Undo / Redo history lines are written by a stream subscriber (`changelines.ts:407`), so they are already inside the restore command — the "route the undo lines" item is moot, harmless. |
| R2-07 other-day writers | phase 1.3 | Complete for four of the five; the fifth (`loadWeek` → `sched.load`) is where F3-01 lives. |
| R2-08 q9 kept apart | header, phase 6 | Complete. |
| R2-09 boot policy | phase 5 | Correct in shape; INCOMPLETE on one line that would break real data — F3-04. |
| R2-10 ties in `ord` | §2.3 | Complete. |
| F2-02 line order / seen | phase 4.3, matrix | Complete. |
| F2-03 non-command writers | phase 4.1 | Complete as a list; F3-01 is the mechanism of its first item. |
| F2-04 where `ord` is minted | §2.3 | Complete. |
| F2-05 frozen seeds | phase 5.2 | Complete (build note: `weekBundle` is a function with two authored branches, `weeks-data.ts:108-111`, not an array — under `seedDemo:false` it must answer `emptyWeek` for `13/07/2026` and `20/07/2026` too; and `indexCallsigns()` runs at module load, `people.ts:274`, so a seed restore re-runs it). |
| F2-06 wipe removes the stamp | §2.8 | Complete. |
| F2-07 puck ids | phase 2 | Complete. |
| F2-08 per-week preservation | phase 1.2 | Complete. |
| F2-09 the sxo seam | phase 3 | Overtaken by D460 as now recorded — F3-06 (wording, not mechanism). |
| F2-10, F2-11, F2-12 | §2.5, §2.6, header/§2.2/4.4 | Complete. |

---

## 2. What v3 introduced that is new and wrong or missing

### F3-01 — HIGH — phase 1.3 / 4.1: `sched.load` as a projection over the scheduler store diffs the LEAVING week against the ARRIVING one, so the consumer deletes the leaving week's rows

**What is wrong.** The scheduler store's `records()` decomposes the baseline with `const wk = CURWEEK` at call time
(`sched-commit.ts:84-87`): every record is keyed `days/<CURWEEK>#<di>`, `sched.book/<CURWEEK>`, and so on. A
`commitProjection` whose reducer enlists `schedStore` BEFORE `setCurWeek(v)` captures a before-image keyed by the
leaving week (`store.ts:634` runs inside the swap); after `applyWeekModel` the after-image is keyed by the arriving
week. `deriveChanges` (`commit.ts:376-394`) then emits `op:'delete'` for every `days/<wkA>#di`, `sched.book/<wkA>`,
`sched.mutes/<wkA>`, every issuance of wkA — and `put` for every record of wkB. Under §2.2 ("a remove only for an
explicit `delete`") the consumer removes the leaving week from storage. Whether it survives depends only on the
ORDER the two stores were enlisted in: the `weekstash/<wkA>` put (the leave-stash, `store.ts:627`) maps to the same
stored rows, and `deriveChanges` walks stores in enlist order and keys in before∪after order — so a delete that
happens to precede the put nets to the put, and one that follows it nets to a removal. Nothing in the plan pins that
order. This is the plan's own §2.2 consumer meeting its own phase-1.3 disposition; it is not present in the code today
because `loadWeek` is not a command.

**Exact fix (build checklist, phase 1.3).**
1. The `sched.load` reducer enlists the weekstash store FIRST (before `stashPut(CURWEEK, leaveSnap)`), so the
   leave-stash is a `weekstash/<wkA>` put; then swaps the week (`setCurWeek`, the DAYS/SCHED/DATES swap, the
   `resyncSchedBaseline()` that `applyWeekModel` already runs at `store.ts:588`); and enlists `schedStore` ONLY AFTER
   that resync — its before-image is then the arriving week before the landing pass, and the envelope carries exactly
   the landing's `days/<wkB>#di` and `inputs/<iid>` (acc) changes, nothing of wkA. (The whole-world guard is not
   tripped: `schedStore` is enlisted before the guard check at phase 2's end.)
2. The mapper gets a same-stored-key rule as a belt-and-braces guard: within ONE envelope, a `delete` and a `put`
   that resolve to the same stored key resolve to the put, whatever their order. State it in §2.2.
3. `sched.load` is dispatched at idle only: a raise during phase 8/9 would ENQUEUE (`commit.ts:153-154`) and the
   caller's next line (`boardTab`, the picker's landing) would run before the swap. Assert `commitPhase() === 'idle'`
   at its callers (`board.ts:1844-1866`, `interactions.ts:544, 1297`, `pan.ts:185-186`, `GuestApp.tsx:51`).
4. **Test:** edit Monday of week A, switch to week B → the `sched.load` envelope contains no `days/<wkA>…` delete and
   no `sched.book/<wkA>`; after the switch storage holds week A's week row, seven day rows and its issuances
   byte-for-byte as before the switch; the batch names only the rows the landing changed and `weeks/<wkA>…`.

### F3-02 — MEDIUM — §2.5 matrix, phase 1.1, §4: `un` on the day row is a field no command's changes can ever fill, and the design already says the opposite

**What is wrong.** `un` is not in any logical record: `histSnap()` (`history.ts:60`) carries `d, i, schedFields,
wo, pp, dm` and no `un`; it exists only in `weekStashSnap()` (`store.ts:461`), computed by `unacceptedKeys()` from
`INPUTS` (`acc === 'r'`), `DAYS` and `dayApproved` at stash time. So the §2.2 consumer — which writes rows from
`CommitEnvelope.changes[]` — never writes it; the day row's `un` slice is always empty; phase 1.1's own round-trip test
("`un` as a set") fails; and §4's planned "correction" would rewrite `data-model.md` §3 — which today says *"Not stored
at all — worked out on read: the removed-input list (`un` — a cache of `Input.acc` and not-landed)"* (`data-model.md:343`,
and §8 at `:885`) — into a column nothing fills. It also costs nothing to leave out: the decision is already recorded on
the input as `acc:'r'` (`slots.ts:713`), which SURVIVES the load-time acc clear (`store.ts:578`) and which
`autoAcceptInput` skips (`store.ts:574-575`), so a taken-off input is not re-landed whether or not it is in the set;
`relandInputs`' only use of the set is to re-set `acc='r'` on a row that already carries it (`slots.ts:625`).

**Exact fix (change the plan first — one line each, and the design needs no change).** Drop `un` from the matrix row
`weeks/<wk>#<di>` and from §4's list of design corrections; phase 1.1: `splitWeek` drops `un` with `al`; `joinWeek`
passes no set; `applyWeekModel` hands `relandInputs` the set derived on read — every personal input with `acc === 'r'`
covering the week's dates (byte-identical behaviour to today, since that is what the set contained). The round-trip
test loses its "`un` as a set" clause. IT is unaffected: the design it reads already says worked out on read. (If the
plan insists on a stored copy: it must become a field of the day OBJECT — inside `DAYS[di]`, hence in `histSnap` and the
`days` record — never a stash-time derivation; but that is the wrong place before phase 6(c) moves the landings' decisions
there anyway.)

### F3-03 — MEDIUM — phase 3: `lw.cell` → per-record rows needs a per-record diff, or a stale client resurrects a deleted record

**What is wrong.** `lw.cell/<war>:<pid>:<date>` is ONE logical record whose value is the LIST at that address
(`leavewar/state/store.ts:1112-1117`). A change to any record in the list is one `put` with `before` and `after` lists.
If the mapper puts every record in `after` (the naive "a put for an add or update"), then client B, booted before
client A deleted record X from that cell, edits record Y in the same cell and writes X back — exactly the R2-03
failure §2.2 was adopted to prevent, one level down. The plan says only "`lw.cell` … maps to its records".

**Exact fix (build checklist, phase 3).** The `lw.cell` mapper diffs `before` and `after` BY `recId`: a `put
leavewar/rec:<warId>:<recId>` only for a record whose bytes changed or that is new; a remove only for a `recId` present
in `before` and absent from `after`; an unchanged record produces nothing. The same rule for `Person` is NOT needed
(marks are JSON on the one row — row-level concurrency, accepted at stage 1). **Test:** A deletes X; B (booted earlier,
still holding X in memory) edits Y in the same cell → after B's save, storage holds Y' and no X. Add it beside the
"two records of one person/date both survive" test, which does not exercise this.

### F3-04 — MEDIUM — phase 5.3: skipping `autoAcceptSeedInputs` under `seedDemo:false` skips the landing of REAL inputs

**What is wrong.** Despite its name, `autoAcceptSeedInputs` (`slots.ts:578-581`) is the generic landing pass — every
personal input onto its day's ground programme, marks cleared — and it is what lands real inputs on a week nobody has
edited yet: `initStore`'s no-stash branch (`store.ts:884`) and `applyWeekModel`'s seed branch (`store.ts:597`). On a
blank shared store a member files leave for a week the scheduler has not opened; the scheduler opens it → the seed
branch → the pass is skipped → no ground row, the card offers "Accept" for an input that should already be on the
programme. Phase 6(c) removes the write-time landing later, but phases 1–5 ship first.

**Exact fix (build checklist, phase 5.3).** The policy gates only the DEMO rows — the seed `INPUTS`/`PEOPLE`/`DAYS`
literals, `otherWeekInputs()`, `seedDemoSans`, `seedDemoMedical`, the Leave War's demo half, the Tracker's pair and
course, the seed accounts and the lock-out repair — never the landing pass, under either policy. (Renaming it
`landInputs` is optional and would stop the next reader making the same slip.) **Test:** blank policy, stamped store,
one real input for a never-visited week; load that week → its ground row is there, and the `sched.load` envelope
carries that day's put.

### F3-05 — MEDIUM — phase 0 / 4.1: `changes` is not a storage `Collection`, and every layer drops what it does not know — including the journal, WHOLE

**What is wrong.** `Collection` / `COLLECTIONS` (`backend.ts:6-7`) list seven; `Whiteboard.snapshot()` skips a key
whose collection has no bucket (`whiteboard.ts:101`), the Browser backend's load skips it (`browser.ts:49`
`isCollection`), `emptySnapshot()` has no bucket for it, and `parseGroup` (`backend.ts:38-46`) drops an unfinished
group WHOLE if any entry's collection is unknown. So a `changes/<batchId>` entry in a group that crashed mid-write makes
the boot discard that whole group — the command's rows with it — instead of finishing it (§21.2). The plan calls
`changes/` "the one new collection" and puts it in `RESET`, but names no step that registers it.

**Exact fix (build checklist, phase 0, before any batch is written).** Add `changes` to `Collection`, `COLLECTIONS`
and `RESET`; the fold's snapshot and the Browser backend need nothing else (the prefix is generic). **Test:** a journal
holding a `changes/` entry parses and replays; a `Whiteboard.snapshot()` round-trips a `changes/` key.

### F3-06 — LOW — phase 3, §5 question 5: the wording is behind D460 as it now stands; the mechanism is sound for what remains

**What is wrong.** v3 phase 3 says *"The war's SXO and seat taps write `Person` through `commitPeopleEdit` … his
'yes', D460"*. D460 as recorded since (`.claude/decisions-full/leave-war.md`): **Quals is the truth for SXO — the war
cannot make anyone SXO; it shows what Quals says, read only; the war's own SXO button goes; no fifth seam writing
`Person` for SXO. The SEAT button is put to him with that reply, recorded when he answers.** The brief says to review
the mechanism, not the choice; so, per half:
- **SXO (settled):** the sheet's button becomes a read-only line from the projection ("SXO qualified" / "Not SXO",
  with where to change it); `setPerson`'s `sxo` patch (`store.ts:1536-1552`) and `readPersonEdits`' `sxo`
  (`store.ts:602-613`) go; `reprojectRoster`'s signature already carries `sxo` from `PEOPLE` (`sync.ts:1423`), so the
  war follows Quals without a write. No seam. Sound.
- **Seat (pending his answer):** if "one truth", the plan's mechanism is right — `commitPeopleEdit` is a `user`
  command of type `people.edit`, gated by perms as `U` on the person with ownership required (`perms.ts:279`); the
  war's sheet is admin-only (`store.ts:1537`) and the admin's member view sets the war's role to member, so no member
  reaches it; the way back is `reprojectRoster` → `setPeople`, a view-only setter with no durable write, so the sealer
  test meets no raw group. If "read only", the seat chips go the way of the SXO one. Either way `lw.config/all`'s
  `personEdits` field (`store.ts:1131`) and the `leavewar/personedits` key leave the record set, and the fold drops
  the old blob.

**Fix (change the plan's words first, before the build reads them):** phase 3 states the SXO half as read-only per
D460, the seat half as "per his answer to the seat question, recorded as D46x", and §5 q5's "ANSWERED … yes" is
corrected to D460's text. No further review needed for either outcome.

### F3-07 — LOW — §2.2 vs F19: a settings `null` is a `put` in the envelope, not a `delete`

`settingsRecords()` lists every key with `store.get(k, null)` (`people-settings-commit.ts:78-84`), so a key set to
`null` diffs as `b && a && !deepEqual` → `op:'put', after:null` (`commit.ts:388-389`), never `op:'delete'`. Under
"a remove only for an explicit `delete`" the consumer would write the string `null` as a row. **Fix (build):** the
`settings` mapper treats `after === null` as a remove — the one stated exception to §2.2's rule, written beside it.
**Test:** a settings key set to `null` inside a command → the stored key is gone, and the batch says `op:'delete'`.

### F3-08 — LOW — phase 1.1: the round-trip test checks fields, not bytes; an unstable split makes every boot rewrite every week

`persistAll` stays for boot (§2.2) and runs at `wirePersist` (`persist.ts:148`); the whiteboard is silent only for an
unchanged STRING (`whiteboard.ts:74`). If `split(join(rows))` is not byte-identical to `rows` (key order, `undefined`
fields, a `dt` re-label), every boot rewrites every stored week as a batch-less boot group — no data harm, but the
"nothing seeded / storage holds only the stamps and what he did" walk step and the sealer test both read it as noise.
**Fix (build):** add "`split(join(rows)) === rows` byte-for-byte for a stored week, and a boot on a stamped store writes
NO `weeks/` key" to phase 1.1's tests.

### F3-09 — LOW — §2.4: make "parsed from the right" concrete for the issuance keys, which carry `#`

A `verId` is `<iso>#<seq>` (`verid.ts:39-41`), so an issuance row is `weeks/13-07-2026:is:2026-07-13#1~0` — it contains
the day row's `#` separator. A parser that tests `#` before `:is:` / `:rx:` reads it as a day row of day `1~0`.
**Fix (build):** the key parser tests `:is:` / `:rx:` first, then `#<digit>$`, then the bare week; **test** with a real
`verId`, and with `~n ≥ 1`.

### F3-10 — LOW — phase 4.1: the batch id when the outermost pipeline emitted nothing

`<clientBootId>-<outermost seq>`: an outermost pipeline that changed no record has `seq −1` (`commit.ts:275, 300`)
while its drained children may have emitted (a no-op user gesture whose projection wrote). **Fix (build):** the id uses
the group's FIRST emitted seq; `type` names the outermost command as planned.

---

## Not findings (D56), noted for the checklist only

- **A browser below schema 5** (`resetPreSchema` wipes `inputs`/`weeks`/`leavewar` and stamps `SCHEMA_VERSION`,
  `reset.ts:83-93`): with two predicates, a wipe that then stamps 6 leaves `people/all`, `plan/all`, `settings/elog`,
  `settings/accounts` unfolded on that browser for ever. Stored data only, his old previews — excluded by D56 and D22.
  If the builder wants it anyway: a wipe stamps 5, and `foldDue` (== 5) runs after it in the same boot.

## Sequencing

Unchanged. F3-02 and F3-06 are wording changes to the plan that should land before the build opens phase 1 and
phase 3 respectively; every other point is a named line in the build's checklist and a test, and none moves work
between phases or groups.

---

## Verdict: REVISE — no further round; two lines change in the plan, the rest goes into the build's checklist

Nothing here reopens a decision. The three that matter most:
- **F3-01** — a week switch modelled as a projection over the scheduler store emits a delete of every leaving-week
  row; enlist the scheduler store only after the swap, give the mapper a same-key put-wins rule, and test that week A's
  rows survive a switch to week B. *Fix in build.*
- **F3-02** — `un` on the day row is a column no command can fill; the design already says worked out on read, and
  `acc:'r'` already does the job. Drop it from the matrix and §4. *Change plan first (one line).*
- **F3-04** — the landing pass is not a demo pass; skipping it under the blank policy strands real inputs. Gate the
  demo rows only. *Fix in build.*

Change plan first: F3-02, F3-06. Fix in build (named in the checklist, each with its test): F3-01, F3-03, F3-04,
F3-05, F3-07, F3-08, F3-09, F3-10.
