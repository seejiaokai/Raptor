# [ONE-ABSENCE] Step 4 design — dual cross-provider red-team log (19 Sep 26)

Review of `2026-09-19-arch-stack-4-one-absence-record-design.md` (Rev 1, sha256
`f921a27f…`). Two independent reviewers, both a different model/provider from the Opus author.
Verdicts and findings below; the host (Opus) arbitrates each and folds warranted changes into Rev 2.

---

## Reviewer A — Codex / GPT-6 Astra (high) — VERDICT: REVISE

Read-only, verified against the code. Session `01a0b568…`, codex-cli 0.154.0. Summary: *"the
one-Input direction is sound, but the design leaves material lifecycle and projection defects
unresolved."* Seven findings:

- **ARCH4-001 (HIGH) — cross-week is NOT fixed for free.** §3's claim that global `INPUTS` dissolves
  finding I is wrong. The off-week edit/delete guards (`inputedit.tsx:836-845`) exist precisely
  because `dropInputRow` can't clean Ground rows in *stashed* weeks (`state/store.ts:540-558` clears
  per-week `acc` on nav; `slots.ts:539-562` removes a Ground row only from loaded DAYS). Displaying
  cross-week leave in the war does not exercise this. **Fix:** specify atomic cleanup/update of every
  affected week's working Ground rows + amendment bookkeeping incl. stashed weeks, one reversible txn,
  issued snapshots preserved; add a real off-week edit/delete/undo scenario with a landed `Other` row.
- **ARCH4-002 (HIGH) — approved-bid transitions + bid↔Input cardinality undefined.** The 4 commands
  ignore `setBidState` approved→refused, `clearCells`, `shiftBid`, `moveCells`
  (`store.ts:2125-2178,3213-3263,3341-3379`, callers in BidPicker/SelectSheet). Bids are date-keyed
  cells; `desiredRuns` merges adjacent cells into ONE Input (`sync.ts:173-201`) — so retracting one
  day of a 3-day approval ≠ deleting the whole linked Input. **Fix:** define stable bid identity,
  bid-to-Input cardinality, partial-span split semantics, every approved-state transition as atomic
  commands; state whether an approved move keeps approval or returns to pending; preserve remarks/links
  across splits; exclude retained request records from absence counting after the Input moves.
- **ARCH4-003 (HIGH) — the projection handler is under-specified.** It only handles Input changes +
  "the record's span". A deletion has no live record; a move/type-change must invalidate the OLD
  coverage too. Filing leave before a war exists produces no cells, and `createWar` later
  (`store.ts:3488-3502`) won't populate from an Input-only trigger (current inbound handles this via
  LW notifications, `sync.ts:1196-1215`). **Fix:** invalidate from the union of `Change.before` and
  `Change.after` (incl. delete, type/person change); recompute affected cells from ALL covering
  Inputs; include war creation/restoration, roster/config changes, boot hydration — or a pure selector
  whose cache deps cover these; add delete/shorten/reassign/retype/create-war-after-filing scenarios.
- **ARCH4-004 (MED) — "no stored copy" contradicts the write-cells + fold-into-undo instruction.**
  `rawPersist` serializes all wars (`store.ts:977-978`); `lwDecompose` registers every grid/state
  entry as durable `lw.cell`/`lw.bid` (`1074-1097`); `lwStore.write` persists restored entries
  (`1188-1205`); `undo/timeline.ts:235-245` stores their changes in the reversible closure. Projection
  origin does NOT make them transient — the prescribed write path keeps TWO persisted representations.
  **Fix:** settle the projection architecture first: keep approved-cell caches OUTSIDE serialization,
  record decomposition/revisions/inverse patches, rebuild from authoritative Inputs after mutations &
  restores; tighten §7's invariant to prohibit persisted approved-absence copies; cover reload/undo
  reconstruction.
- **ARCH4-005 (HIGH) — OIL cannot stay "untouched".** `runOilPass` uses `source:'raptor'` AND
  `clearRaptorCell` to update/remove earned credits (`sync.ts:957-993`); `oilCreditBidAgainst` needs
  the ownership marker to find withdrawable credits (`934-952`); `ingestDutyCredit` checks the shared
  grid for leave conflicts before crediting (`store.ts:3061-3081`). Retiring the marker/`clearRaptorCell`
  breaks credit withdrawal and makes leave invisible to OIL's conflict check. **Fix:** retire only
  leave-specific reconciliation; define explicit ownership+cleanup for derived OIL credits; make OIL
  collision checks consume the EFFECTIVE absence view; update the publish-withdrawal balance guard;
  specify precedence when leave and earned work cover the same date.
- **ARCH4-006 (MED) — many-Inputs-to-one-cell aggregation missing.** `runInbound` combines AM+PM
  Inputs of the same type into a full day and raises clashes for incompatible portions
  (`sync.ts:538-595`); the remarks lookup selects one matching row (`455-474`). A cell can't always
  identify one Input; a naive one-iid-per-cell projection undercounts two half-days or edits only one.
  **Fix:** define a projected cell's contributing Input IDs, portion aggregation, conflict
  representation; preserve same-type half-day combination + incompatible-type clash; specify which
  record a cell-level remarks/edit/retract targets; add same-type and mixed-type AM/PM scenarios.
- **ARCH4-007 (MED) — the balance WRITER reads the raw grid.** `setBalance` computes opening =
  target − grants + `drawnFrom(state.wars, …)` (`store.ts:2664-2673`), independent of
  `figureCtxOf().sources`. With pure projection, setting a balance to 20 with one approved working day
  present stores an opening of 20 from raw bid-only wars while the display shows 19. **Fix:** one
  effective `LeaveSource` selector used by BOTH readers and calculation-before-write paths
  (`setBalance`, `figureCtxOf`, OIL accounting, withdrawal guards); verify set-balance reaches the
  requested value with projected leave present and stays consistent after undo/reload.

## Reviewer B — Fable 5.1 — VERDICT: REVISE

Read-only, 53 code reads, anchors verified. Affirms the direction; four HIGH to fix before the owner
reads it, four MED build-shape decisions to pin, three LOW. Findings (abbreviated; full text in the
build spec):
- **F-1 (HIGH)** — the bid→approved path still stores the dates twice (grid cells + Input). Fix: at
  `approveBid`, REMOVE the bid's live cells from `grid`/`states`; the bid becomes a **request record**
  `{approved, inputId, askedFrom, askedTo, shiftedFrom?}`; the displayed cell is the Input projection
  only. Define the four admin grid ops (`shiftBid`/`moveCells`/`setBidState`/`setCell`) on a projected
  cell. **`shiftBid` on an approved bid is a LIVE 27 Aug feature (admin moves bids at closed/published)
  → raise as owner decision.**
- **F-2 (HIGH)** — §6 "route through the amendment path" is unfounded: **there is no amendment path
  for leave today** (leave never lands; `filingDelta` treats absent `acc` as no-delta, so a
  leave filed/retracted on a published day yields NO pending count / AL entry). **Raise as owner
  decision:** silent working-copy change (today) vs a real pending amendment; if amendment, needs
  `dayFilingFingerprint`/`filingDelta`/`computePubBar` changes.
- **F-3 (HIGH)** — same as ARCH4-005 (OIL). Fix via ONE `absenceAt(personId,iso)` predicate over the
  projection; replace every `raptorOwns` guard with `absenceAt()!=null || raptorOwns()`;
  `ingestDutyCredit` returns `'clash'` when `absenceAt` hits; composer never overlays projected leave
  on a stored FO/HO.
- **F-4 (HIGH)** — §4.3 rests on [SYNC-INTEG] **P2 (medical member-filed), which is NOT built**; the
  admin grid-medical path is live and step 4 retires its only outlet. **Make P2 a named PREREQUISITE.**
  Keep the two portion rules (`rowPortion`/`medRowPortion`) in the composer.
- **F-5 (MED)** — same as ARCH4-004. Commit to **pure projection**: in-memory `PROJ` map outside
  `state.wars`; `effectiveWars()` = stored ∪ PROJ; repoint ~10 consumers; projected records
  `{approved, source:'input', iid}`; no `lw.cell` for projected cells ⇒ undo closure carries only the
  `inputs` change.
- **F-6 (MED)** — undo folding holds, with two conditions: (a) the projection handler must run
  **synchronously inside the causing commit's delivery** (an idle `lwSyncTurn` becomes an orphan that
  sets a sticky barrier and refuses the earlier undo); (b) with stored cells, write only the delta.
  Pure projection makes (b) moot.
- **F-7 (MED)** — reset misses the **SEED**: `seed.ts` plants `source:'raptor'` cells in code. Remove
  them (seed matching Inputs); extend `reconcile()` to drop any `source:'raptor'` non-FO/HO record on
  load (a drift guard, not a migration); add the invariant test.
- **F-8 (MED)** — "Clear old data" deletes leave history that [RECALL] says is frozen; **P4
  (clutter-only) is a prerequisite** (or `retractAbsence`-by-sweep refuses leave/medical). State in §8.4.
- **F-9 (LOW)** — drop the "a re-file can re-link the certificate" claim (decision 3 already accepts an
  orphaned document) or specify a reattach control.
- **F-10 (LOW)** — command inputs must be **ISO, not `baseYear()` labels**; new commands must call
  `inputProtected` and **refuse with a toast** on a protected week.
- **F-11 (LOW)** — state clash precedence: the composer computes bid∧Input and split-half clashes and
  says which code the cell shows.

---

## Host arbitration & dispositions (Opus)

Both reviewers converge; the direction is affirmed by both. **All 7 Codex + 11 Fable findings are
ACCEPTED** (none rejected — each is code-verified and material). Overlaps: ARCH4-005≡F-3 (OIL),
ARCH4-004≡F-5 (pure projection), ARCH4-002⊂F-1 (bid cardinality), ARCH4-003⊂F-6 (handler),
ARCH4-006≡F-11 (AM/PM aggregation), ARCH4-007⊂F-5 (balance writer via `effectiveWars`),
ARCH4-001 (cross-week) stands alone. **Two findings surface NEW OWNER DECISIONS** the draft missed
and cannot resolve for him: F-1's "moved approved bid → keep approval or return to pending (a live
27 Aug feature)" and F-2's "absence change on a published day → silent or pending amendment." These
become §8 decisions 5 and 6.

**Rev 2 folds all of it:** (1) commit to pure projection (`PROJ`/`effectiveWars()`, out of
serialization) — resolves F-5/ARCH4-004 and the §4.2↔§9.1 contradiction; (2) the `absenceAt()`
effective-view predicate everywhere `raptorOwns`/OIL reads the grid — F-3/ARCH4-005; (3) bid becomes
a request record with `inputId`, cardinality + partial-span split defined, all approved-transitions
as commands — F-1/ARCH4-002; (4) the projection handler: invalidate `union(before,after)`, recompute
from ALL covering Inputs, cover war-create/restore/boot, run synchronously in delivery, change-guarded
— F-6/ARCH4-003; (5) AM/PM contributing-input-ids per cell + clash — F-11/ARCH4-006; (6) atomic
cross-week ground-row cleanup, §3's "free" claim corrected — ARCH4-001; (7) P2 + P4 named
PREREQUISITES — F-4/F-8; (8) seed removal + `reconcile()` drift guard — F-7; (9) ISO inputs +
`inputProtected` refusal — F-10; (10) cert re-link claim dropped — F-9; (11) clash precedence stated
— F-11. **Two new owner decisions added (§8.5, §8.6).**

**Not forced to a second red-team round tonight:** the design now legitimately BRANCHES on the two
new owner decisions (the moved-bid feature and the published-day amendment behaviour change what the
commands do). A Rev 3 + second cross-provider round runs after the owner answers §8 and before any
build — recorded as the gate. Both reviewers explicitly framed 5–8 as "decisions the doc should pin
now," which Rev 2 does.

---

# ROUND 2 (on Rev 3)

## Reviewer A — Codex / GPT-6 Astra (high), resumed — VERDICT: REVISE
*"Rev 3 resolves several round-1 concerns, but approved-cell guards, decision transitions, OIL
accounting and projection delivery remain inconsistent; the certificate simplification needs an
explicit strategy for document links stored inside undoable Inputs."* Seven findings:
- **R2-001 (HIGH) — the `absenceAt()!=null || raptorOwns()` guard is too blunt: it BLOCKS the very
  §4.1 commands.** `setCell`/`setBidState`/`isMovableSource` are early-return guards
  (`store.ts:1966,2168,3275`); a projected leave would make an approved bid impossible to clear/refuse/
  drag; removing stored cells adds more early exits (batch clear skips missing grid entries `:2104`;
  decisions need a raw-grid bid `:2164`). **Fix:** distinguish "block an unrelated overwrite" from
  "deliberately act on an approved absence" — resolve request/contributor identity first, enforce
  role/stage, dispatch to the atomic command; keep collision guards for UNRELATED destination
  absences (incl. correct source-range exclusion on overlapping moves); update single AND batch.
- **R2-002 (MED) — Refuse ≠ un-approve; both mapped to retract+pending is wrong.** `refused` excludes
  availability/charge; `pending` still charges (`bids.ts removesAvailability`, `counters.ts:116-125`) —
  so refusing an approved working-day LL would still cut manning + consume leave. Also §4.1 still has
  the return-to-open alt despite §8.1 vanish. **Fix:** distinct transitions for Refuse/Pending/drag/
  delete with stage behaviour; preserve `refused`; strike the return-to-open text.
- **R2-003 (HIGH) — OIL still inconsistent under a single-code effective view.** §4.2 blocks credit
  when leave exists / no overlay; §4.4 wants leave to win display while earned credit still feeds
  balance. `earnedOil`/`oilLedgerFor` read FO/HO grid codes (`counters.ts:137-144`,
  `oiltracker.ts:201-213`); `oilCreditBidAgainst` needs a landed FO/HO (`sync.ts:943-952`). Leave-first
  → no credit; work-first → keeping FO/HO breaks leave-display, replacing it hides the credit.
  **Fix:** SEPARATE effective display data from earned-credit ACCOUNTING data; one authoritative credit
  computation; handle both event orders; update earnedOil/oilLedgerFor/withdrawal/clash.
- **R2-004 (HIGH) — the projection emission is fictional for a pure cache update.** `commit.ts:232-254`
  emits only on durable record changes; PROJ is outside decomposition. `commitProjection` in `onCommit`
  is QUEUED (`:128-131`) while notify + OIL subscribers already ran in phase 8 before onCommit (phase 9)
  — so retract can let OIL read the OLD index then update PROJ with no emission. LW render subscribes to
  its own version counter, not the stream. **Fix:** replace the cache-change-envelope with an explicit
  invalidate/rebuild + notification contract; ensure every consumer (esp. OIL) sees the rebuilt index
  BEFORE evaluating (or a causal re-eval after rebuild); publish an LW version bump on effective-view
  change; keep cache out of inverse patches — only real durable OIL changes emit projection commits.
- **R2-005 (HIGH) — "certs not undoable" is incomplete: the docId LINK lives on the undoable Input.**
  `DocField`→draft ids (`inputedit.tsx:450-472`); `commitInputEdit` writes `docId/docIds`
  (`:977-979`); `sched-commit.ts:125` records the whole Input and restore replaces it (`:243-251`). So
  replace cert A→B, then undo an unrelated Input edit → A's ref restored, B detached; if A was
  permanently deleted → "no document" despite B intended. **Fix:** a durable, non-undoable
  attachment-association model OR field-aware restore that preserves the latest cert change across
  unrelated Input undo/redo; cover Input delete/restore + shared doc ids from medical splits
  (`:325-334,382-394`); permanent delete in both cache + durable backend with failure handling.
- **R2-006 (MED) — the `reconcile()` drift guard drops only the state record; the stale grid CODE
  survives** (`store.ts:830-843` returns new States but keeps grid) — a stateless LL still removes
  availability + charges leave. **Fix:** reject the obsolete stored world at the reset/version boundary,
  or remove grid cell + state together; assert the stronger invariant (no legacy approved-absence grid
  contribution survives independent of an Input).
- **R2-007 (MED) — missed consumers of the current-war aliases.** `withCurrent`/`getState().grid/states`
  (`store.ts:302-307`): `Chrome.tsx:225-233` (red-day summary via `evaluatePeriod`) and
  `CounterForm.tsx:177` (rule previews) read raw stored grid/states independently — repointing Matrix
  but not these leaves the summary/preview on bids-only. **Fix:** an effective-current-war read
  selector/facade used in Chrome, CounterForm and every `getState().grid/states` reader; mutation/
  persistence stay on raw stored state.

## Reviewer B — Fable 5.1 (round 2) — VERDICT: (pending — in flight)
Read-only, 45 code reads, anchors verified. VERDICT: REVISE — direction holds, 9/11 round-1 findings
closed (F-1 & F-5 reopened as the round-2 gaps below), the simplifications opened 2 HIGH + a cert gap.
- **fR2-1 (HIGH) — effective-view seam mis-located → projected leave WILL be persisted.** Readers use
  the DERIVED top-level `state.grid/states` (`withCurrent`, `store.ts:302-308`), not `state.wars`; the
  writers (`setCell/setBidState/shiftBid/moveCells`) CLONE the person's row from it and write back via
  `updateCurrent` → one ordinary bid on a row with projected leave copies all projected cells into the
  stored war → `lwDecompose` (`1082-1099`) → `rawPersist` (`978`). **Fix:** keep `state.grid/states`
  STORED-only (writers' contract); add derived `egrid/estates` = stored ∪ `PROJ.get(currentId)` in
  `withCurrent`, recomputed on PROJ change; READERS move to effective (`Matrix.tsx:198-217,409,453,
  475-476,3069,3745,3757,3989-3995,4058-4066`, `Chrome.tsx:225`, `CounterForm.tsx:177`), WRITERS stay
  stored; `effectiveWars()` feeds `figureCtxOf().sources`/`setBalance`/`sync.ts:937-952`. Build-time
  assert in `lwDecompose`: throw if any `lw.bid` has `source:'input'` (pins §7 mechanically).
- **fR2-2 (HIGH) — §4.1 vs §4.2 contradict; the discriminator doesn't exist.** §4.2 (guard refuses)
  and §4.1 (dispatch to command) can't both be true; today `source:'raptor'` (Inputs-filed, war can't
  touch) vs `source:'bid'`-approved (war-approved, admin may move — the live 27 Aug feature) — both
  become `source:'input'` under projection. **Fix:** `absenceAt()` returns
  `{iid,code,portion,warLinked,shiftedFrom?}`; `warLinked===false` → refuse as `raptorOwns` today;
  `warLinked===true` → §4.1 command mapping; state once, reference from §4.1. (Resolves Codex R2-001/002.)
- **fR2-3 (HIGH) — the request record has no durable home; `reconcile()` deletes it on reload.**
  **Fix (a real simplification): NO request record.** Reuse the Input's existing `lw:warId` tag as
  "approved on the war" (its old loop-breaker meaning dies with inbound) + add `shiftedFrom?` to the
  Input; `absenceAt` reads them; the war persists NOTHING about an approved absence; `approveBid` =
  delete bid cells + create Input in one txn; `reconcile()` untouched. Note `inputedit.tsx:328/388`
  `delete t.lw` on copy = "a copy is not war-approved".
- **fR2-4 (MED) — `absenceAt` misses the landing side + 3 OIL/balance reads:** `shiftBid`
  `store.ts:3239`/`moveProblem:3334` (a bid can move ONTO an approved-leave day → double book — add
  `absenceAt(to)→'occupied'`); `runOilPass:972-976` clash uses `bidCode:''` (use `absenceAt().code`);
  `oilCreditBidAgainst:952`/`figureCtxOf:2525` need `effectiveWars()`; `setBidState:2164` `isBiddable`
  short-circuits — order the absence branch first.
- **fR2-5 (MED) — §4.3 "emit as commitProjection" is wrong-shaped.** PROJ is outside records so a
  projection envelope carries zero changes; routing through `rawPersist` does a spurious write +
  `recordHistory`. onCommit delivery is already synchronous. **Fix:** the handler writes PROJ,
  re-derives the effective fields, calls `rawNotify()` — no envelope, no persist; handle ALL origins
  touching `inputs/*` (user/restore/seed/projection) so undo/redo/boot recompute; boot once in
  `wireLeaveWarSync` after `remapPersonKeys` (INPUTS hydrate before `lwInitStore`, `main.tsx:51,58,69`).
- **fR2-6 (MED) — §8.3 cert-not-undoable has no mechanism; the naive one trips the sticky barrier.**
  The `docId/docIds` link lives ON the Input (`schema.ts:178-180`, written `inputedit.tsx:977-979`) →
  either a `user` envelope (IS undoable, contradicts) or out-of-band (sets the sticky barrier
  `timeline.ts:256-266` → earlier edits refuse); no delete API (`docs.ts:111-123` append-only). **Fix:
  move the link OFF the Input onto the drawer row** — `DocRec{id,iid,name,mime,size,blob}`,
  `docsFor(iid)` replaces `rowDocIds`, add `docDelete(id)` (memory + IndexedDB) with the confirm guard;
  cert ops then touch no command record → no entry, no barrier; a new input mints its iid in the draft
  so upload links before save. `DocViewer.tsx:51` already null-guards → "no document".
- **fR2-7/8/9/10 (LOW):** a moved bid loses the `RETAINED` remarks carry (carry `remarks` on re-approve
  or state the loss); stale §4.1 text ("return to open", `moveAbsence`) to strike; the mandatory-doc
  rule is enforced in TWO places (`InputsPage.tsx:366` + `inputedit.tsx:567-569` — the relaxed prompt
  must replace both); undo no longer lands the war on the day (`undo-wire.ts:66-74` reads `lw.cell` ids
  — derive the focus date from the `inputs` change instead).
- **VERIFIED PASSING:** §8.6=A silent-on-published is internally consistent (`filingDelta` sees `''`,
  `computePubBar` keys only days/orig — an inputs-only undo is never behind the barrier); §8.5
  during-bidding is a no-op (`canDecide` false at `open`); no `state.wars` reader missing beyond fR2-4.

## Host arbitration — ROUND 2 dispositions (Opus)
Both reviewers CONVERGE (fR2-1≈R2-007/004, fR2-2≈R2-001/002, fR2-4≈R2-003 reads, fR2-5≈R2-004,
fR2-6≈R2-005, plus fR2-3 new & sharp). **ALL ACCEPTED → Rev 4.** Fable's fixes are precise and two
SIMPLIFY: (a) drop the request record entirely (Input `lw` tag + `shiftedFrom`); (b) move the cert link
onto the drawer row (`DocRec.iid` + `docDelete`) — this is the mechanism §8.3 lacked. Rev 4 folds:
stored-vs-effective grid split (`egrid/estates`, readers vs writers); `absenceAt→{warLinked}` +
refuse-vs-dispatch rule; no request record; OIL split (display vs accounting) + the 4 missed reads;
projection handler = write-PROJ+rederive+rawNotify (no envelope), all origins, boot; cert link on the
drawer + `docDelete`; the LOW fixes. §8.6/§8.5 confirmed sound — no owner re-decision. **Owner-relevant:
decision 3 STANDS; the cert link simply moves onto the document record so an unrelated undo can't
resurrect it.** After Rev 4 → one confirm round (round 3).

---

# ROUND 3 (on Rev 4)

## Reviewer A — Codex / GPT-6 Astra (high), resumed — VERDICT: REVISE
*"Rev 4 resolves the earlier persistence, notification and missing-reader defects. Material gaps remain
in OIL accounting, certificate ownership across splits, projection lifecycle triggers and move/undo."*
- **R3-001 (HIGH) — OIL split STILL contradictory.** §4.2 has `ingestDutyCredit` return `'clash'`
  before storing the credit (`store.ts:3061-3088`) → leave-before-work never creates the accounting
  FO/HO §4.4 promises; and `figureCtxOf().sources = effectiveWars()` HIDES the FO/HO code, so
  `oilLedgerFor` (`oiltracker.ts:198-219`) + `balanceOf`/`earnedOil`/`drawnFrom` (`counters.ts:155-167`)
  reading that single `ctx.sources` grid can't see a stored credit. **Fix:** separate clash REPORTING
  from accounting INSERTION (an approved absence must not block recording an earned credit under policy);
  define explicit **credit sources** vs **effective absence/debit sources** in the accounting APIs +
  `FigureCtx`; update `balanceOf`/`oilLedgerFor`/`oilCreditBidAgainst`; both event orders identical.
- **R3-002 (HIGH) — `DocRec.iid` can't implement "splits share by iid".** Splits mint DISTINCT Input
  ids (`inputedit.tsx:325-334,382-394`); `docsFor(newSeg.iid)` won't find the original's doc; reusing
  the original iid breaks record identity (`sched-commit.ts:125` collapses equal ids; restore/delete
  finds only the first, `:245-251`). **Fix:** keep every iid unique; add a separate stable
  **medical-document GROUP/episode identity** (or explicit multi-owner association) that supports split
  segments + their undo/redo; define replacement/deletion scope across the group.
- **R3-003 (MED) — Rev 4 dropped the explicit war-create/restore projection trigger.** `createWar`
  (`store.ts:3488-3502`) doesn't touch Inputs → a leave filed before its war exists won't populate PROJ
  on `createWar` (contradicts §7(h)). **Fix:** restore explicit war create/remove/restore handling +
  per-war cache invalidation; signature guard includes war-topology changes; add undo/redo of createWar.
- **R3-004 (MED) — the unconditional destination `absenceAt→occupied` check rejects valid overlapping
  block moves** (13–15 → 14–16 hits its own projected cells; `moveProblem` permits selected sources to
  overlap destinations — `store.ts:3314,3335-3336`). **Fix:** validate destinations against POST-retract
  occupancy — exclude the selected contributor ranges the same txn removes; keep collisions with
  unselected/unrelated.
- **R3-005 (MED) — undo focus from the Input change doesn't select the WAR.** An inputs-only closure
  makes only a `page:inputs` context (`derive.ts:57-73`); `loadContext` selects a war only for a war
  context (`undo-wire.ts:77-83`) — delete in war A, switch to B, undo → focuses an A date while B stays
  selected. **Fix:** define both context SELECTION and date focus for absence commands (derive the war
  from scope/Input coverage, select before focusing; specify undo vs redo date).
- **R3-006 (MED) — deleting per-day bid records + keeping run-merging loses per-day move provenance.**
  `desiredRuns` merges by war/person/type/portion (`sync.ts:187-197`) but `shiftedFrom` is per-date;
  approving adjacent LL where only the first was shifted → one Input, one `shiftedFrom` → both get the
  moved stripe or the first loses history (`Matrix.tsx:476` consumes per-day provenance). **Fix:** merge
  only when provenance + remarks are lossless, OR retain per-day provenance on the Input.

## Reviewer B — Fable 5.1 (round 3) — VERDICT: REVISE (NARROW — "one more pass on §4.2/§4.4 and this is ship-ready")
Verified ALL 7 round-2 folds correct against the code (stored/effective split single-point in
`withCurrent`; `warLinked` derivable from `Input.lw`; no dangling request-record consumer; handler at
phase-9 synchronous, boot placement right; cert-on-drawer readers all found; §9.4 CLOSED — `PersonMonth`
already takes `version`). Three MED gaps + LOWs, none reopening a decision:
- **fM1 (MED) ≡ R3-001 — the OIL split, WITH a concrete fix.** `effectiveWars()` returns each war as
  `{...w, grid:egrid, states:estates, earned:w.grid}`; `earnedOil`/`oilLedgerFor` walk
  `src.earned ?? src.grid` (`counters.ts:137-144,155-167`); `chargedDays` reads effective `grid`;
  `ingestDutyCredit` clashes ONLY on a stored non-matching cell (`store.ts:3019`) — a projected absence
  does NOT block the accounting write, it adds an advisory strip entry. Both orders then agree.
- **fM2 (MED) — the leave-vs-bid clash strip loses its producer** (`LEAVE_CLASHES` is made in `runInbound`
  which retires; `Chrome.tsx:222-223` reads it). Fix: the handler emits into `LEAVE_CLASHES` via
  `publishClashes()`; projected absence wins the effective cell, the stored bid stays stored.
- **fM3 (MED) — the "absenceAt before the `isBiddable` short-circuit" rule was stated for `setBidState`
  only; four siblings short-circuit on the SOURCE too** (`shiftBid:3214`, `moveProblem:3323`,
  `setBidStates:2141`, `setCells:2104`) — so dragging/batch-clearing a war-approved leave silently
  no-ops. Fix: order the `absenceAt` branch first in every one.
- **LOW:** L1 split cert = many-to-many `DocRec.iids[]` + `docLink(id,iid)` (this is R3-002's clean fix,
  simpler than a group id); L2 `docDelete` deletes IndexedDB first then memory (else resurrect on
  reload); L3 state `lw`/`shiftedFrom` fate on an Inputs-side edit (span change drops `lw`→warLinked
  false, remarks-only keeps it — `inputedit.tsx:925-927`); L4 `BidRecord.remarks?`, not `note`
  (`reconcile:839` keys on `note`); L5 with the link on the drawer an upload binds immediately (Cancel
  no longer un-attaches — a visible change, consistent with §8.3); L6 document the double OIL pass
  (converges same-commit).

## Host arbitration — ROUND 3 dispositions (Opus)
Both reviewers CONVERGE and the design is essentially landed. Overlaps: R3-001≡fM1 (OIL — Fable's
`earned` field is the fix), R3-002≡L1 (split cert — many-to-many `DocRec.iids[]`), R3-004⊂fM3 + its own
overlapping-self-move exclusion. Distinct Codex: R3-003 (re-add the war-create/restore projection
trigger — Rev 4 over-trimmed it), R3-005 (undo focus must SELECT the war, not just a date — derive from
the command's Input coverage), R3-006 (run-merge loses per-day `shiftedFrom` — retain per-day provenance
or merge only when lossless). ALL ACCEPTED → Rev 5 (spec-text; every fix is concrete). Faint product
edge in fM1: an approved-absent day STILL earns its OIL credit (leave only wins the DISPLAY) — preserves
current behaviour; flagged to owner, not a re-decision. After Rev 5, one final confirm (round 4) → build.

---

# ROUND 4 (final confirm, on Rev 5)

## Reviewer B — Fable 5.1 (round 4) — VERDICT: REVISE (NARROW) → "fold into Rev 6 and BUILD; no further round needed"
Verified ALL Rev-5 folds correct against code: fM1 OIL both orders converge (leave-first & work-first
end identical; FO↔HO overwrite survives `store.ts:3074`; `earned` threaded through `balanceOf`/`earnedOil`
`counters.ts:166`, `figureCtxOf:2525`, `oilCreditBidAgainst:952` effective while the `landed` check
`sync.ts:947` correctly stays stored); fM2 `publishClashes` is the right producer; fM3 all five sites +
`isMovableSource` covered; L1/L2 split-tail `docLink` survives undo/redo/delete-of-original; R3-004/005/006
sound. Findings (all pinnable by one test, no re-open):
- **rt4-1 (MED) — §4.2 "absenceAt FIRST" bypasses the role/stage gates.** `canDecide`/`canEditRow`/
  `canEditCell`/`medBlocked`/`inSquadron` (`store.ts:2160,2134,3219,3230-3234,3321-3324,2106-2111`) run
  before the grid short-circuit; putting the absence dispatch first lets a MEMBER decide/drag/clear their
  own war-approved leave out of window/stage — a roles-class break (HEAVY). **Fix:** absence branch runs
  **AFTER** the role/stage gates, **BEFORE** the first `state.grid` read; the war-side `retractAbsence`
  carries the gate of the op it replaces. Pin: member + projected approved leave → all refuse.
- **rt4-2 (MED-LOW) — missed effective reader `Matrix.tsx:4046`** (`balanceOf` bid-sheet preview uses
  stored `wars` `:532`) → the negative-balance warning ignores approved leave. Add to §6 (read
  `figureCtx.sources`/`effectiveWars()`).
- **rt4-3 (LOW) — `oilLedgerFor` is ONE walk (credits AND debits, `oiltracker.ts:201-221`).** Moving it
  wholesale to `earned` drops a projected OIL-leave's `taken` debit. Fix: credits from `earned ?? grid`,
  debits from effective `grid`; `LeaveSource` gains `earned?`.
- **rt4-4 (LOW) — clash-strip double emit** (handler `{LL vs FO}` + OIL advisory `{FO vs LL}` on one
  cell). Fix: partition by vocabulary — the handler SKIPS stored FO/HO cells; the OIL pass owns that.
- **rt4-5 (LOW) — anchor fix:** §4.4 `ingestDutyCredit` clash is `store.ts:3074`, not `:3019`.
- **rt4-6 (LOW advice):** `docsFor(iid)` O(docs) → maintain a `Map<iid,id[]>` at `docBoot`; `docLink`
  must write-through (`put`) to IndexedDB or the link is lost on reload.

## Reviewer A — Codex / GPT-6 Astra (round 4), resumed — VERDICT: REVISE (narrow — spec text)
Converges with Fable R4. Three findings, all pinnable by test, none reopening a decision:
- **R4-002 (HIGH) ≡ rt4-1 — guard ordering bypasses the role/stage gates.** Making the absence branch
  FIRST places dispatch before `canDecide` (`store.ts:2134`), `canEditRow`/window/calendar
  (`3219-3235`); `lw.edit` command permission is `cmdAnyone` (`:1219`) and `inputProtected` checks
  dates not permissions — so a member could request an unapproval/move the gates prohibit. **Fix:** the
  ordering rule applies ONLY to the stored-cell-existence/ownership short-circuits; role/person/stage/
  window/destination validation stays BEFORE mutation, and the new commands enforce equivalent checks;
  `moveProblem`/`isMovableSource` stay read-only (validate, never dispatch).
- **R4-001 (HIGH) ≡ rt4-3 — `oilLedgerFor` combined credit/debit loop.** Walking `earned` wholesale
  drops a projected OIL-leave's `taken` debit → tracker balance exceeds `balanceOf`; and reading a
  hidden FO/HO credit against `estates` loses its stored note + misclassifies auto as manual
  (`oiltracker.ts:208-210`, `OilTracker.tsx:431`). **Fix:** credits read the stored `earned` grid AND
  stored states (preserve reason/classification); debits read the effective grid/states + `chargedDays`;
  extend the source contract; require tracker==balance for approved OIL with no stored cell.
- **R4-003 (MED) ≡ rt4-4 — the duty/absence advisory isn't maintained across passes.** `runOilPass`
  skips an already-landed credit (`sync.ts:973`) then replaces `OIL_CLASHES` with an empty list
  (`999-1000`), so a leave-first-then-work advisory vanishes on the next unchanged run. **Fix:** derive
  duty/absence advisories from current desired/landed credits + `absenceAt` on EVERY OIL pass, before
  the unchanged-credit shortcut; ONE producer (no duplicate leave/duty entry); clear only when the
  conflict is gone.

## Host arbitration — ROUND 4 dispositions (Opus) → Rev 6 (final)
Both round-4 reviews CONVERGE (R4-002≡rt4-1, R4-001≡rt4-3, R4-003≡rt4-4) and BOTH clear it for build
after one text pass (Fable explicit: "fold into Rev 6 and build; no further round"). ALL ACCEPTED →
Rev 6, all spec-text, no design change, no re-decision:
1. §4.2 — role/stage gates (`canDecide`/`canEditRow`/`canEditCell`/`medBlocked`/`inSquadron`) run
   BEFORE the absence branch; the absence branch precedes only the stored-grid short-circuit; commands
   enforce equivalent checks; `moveProblem`/`isMovableSource` validate-not-dispatch (rt4-1/R4-002).
2. §4.4/§6 — `oilLedgerFor` splits: credits from stored `earned` grid+states (reason/classification
   preserved), debits from effective grid/states+`chargedDays`; `LeaveSource` gains `earned`+earned
   states (rt4-3/R4-001).
3. §4.3/§4.4 — advisories derived on EVERY OIL pass from desired/landed + `absenceAt`, before the
   unchanged-credit shortcut; one producer; the Input handler SKIPS stored FO/HO cells (rt4-4/R4-003).
4. §6 — add `Matrix.tsx:4046` (`balanceOf` bid-sheet preview) to effective readers (rt4-2).
5. §4.4 anchor `store.ts:3074` (rt4-5); §4.7 `docsFor` Map + `docLink` write-through (rt4-6).
**After Rev 6 the design is BUILD-READY — no further review round (both reviewers).**


---

# OWNER RULING 20 Sep 26 — OIL on a leave day (supersedes the round-3/4 `earned`-field fix)
The owner ruled: **a leave on a non-working day is not a worked day, so it earns NO OIL — leave
SUPPRESSES the credit** (not "leave wins the display while the credit still counts"). This is a cleaner
resolution of the same knot the reviewers kept hitting (R3-001/R4-001/fM1/rt4-3): with no credit on a
leave day there is nothing to keep visible, so the `earned` field + `oilLedgerFor` credit/debit split
are DROPPED. `runOilPass`/`ingestDutyCredit` skip crediting a day where `absenceAt` hits; the existing
reverse sweep clears a credit when leave is added later (order-independent → both orders end at no
credit). Consistent with `[OIL]` (already-worked-day lock). Design updated to Rev 7 §4.4. **This is a
balances (HEAVY) change that removes previously-scrutinised machinery — it wants a quick TARGETED OIL
re-check before build, plus the owner's half-day sub-decision (§8.7).**

---

# TARGETED OIL RE-CHECK (Fable, on Rev 7 §4.4 — after the owner's half-day ruling) — VERDICT: REVISE→folded
The half-day "worked half still earns" ruling reintroduced one case the simplified §4.4 claimed couldn't
exist. Verified sound: type eligibility (= `oilAsks`, no change), order-independence, balance/tracker
agreement, [OIL] consistency. Findings (all folded into §4.4/§8.7):
- **F1 (HIGH, ship-blocker) — the worked-half HO is stored but INVISIBLE to the balance.** A cell holds
  one code; the effective cell shows `*LL` (`earnsOil===0`, `codes.ts:263`), so a balance read off
  `effectiveWars()` drops the worked half. **Fix (minimal partition, smaller than the removed `earned`
  field):** display stays effective; the CREDIT side reads the STORED grid — `FigureCtx.storedSources`;
  `earnedOil` + `oilLedgerFor`'s `earns>0` branch iterate stored; the OIL-debit branch stays effective;
  `figureCtxOf`/`setBalance`/`Matrix.tsx:4046` pass both. The OIL pass is the only FO/HO writer and is
  absence-aware, so a stored FO/HO is a valid already-suppressed credit.
- **F2 (MED) — a blanket `ingestDutyCredit` `absenceAt` guard blocks the half-day credit + spams the
  strip.** Put the exclusion in the CALCULATION; at most a `portion==='full'` belt-and-braces; never
  clash on a half.
- **F3 (MED) — exclude by exact WINDOW, not rounded `portion`.** `rowPortion` rounds 10:00–14:00 to
  `full`; drive the clip off `envMin` minus the leave `inpWin` overlap instead (subsumes AM/PM, handles
  mid-day leave, keeps "gaps count").
- **F4 (LOW) — SUPPRESS is leave+medical ONLY;** SANS/Personal/Upchit don't earn (via `oilAsks`) but
  must never suppress scheduled work (a SANS pilot who flew Saturday earns).
- **Advisory — ATT B (`work:true`) earns nothing on a worked Saturday under the ruling; owner said "incl.
  ATT B", so build it + note it** so a later builder doesn't revert it.
**Folded → §4.4 (Rev 8). §4.4 now build-ready; no earlier finding resurfaces.**
