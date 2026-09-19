# ARCH-STACK step 4 — one absence record: red-team log

Companion to `2026-09-19-arch-stack-4-one-absence-design.md`. Host: Claude (Opus 5, high).
Reviewers: Codex (GPT-6 Astra, high, read-only, via claudex-loop runner) and Fable 5.1 (read-only
subagent). Raw reviewer output lives in a scratch dir that does not persist; this is the record.

## Round 1 — design Rev 1 (stored projection), 19 Sep 26

**Codex: REVISE (7 findings). Fable: REVISE (12 findings). Converged.**

Both independently broke Rev 1's central choice — keeping approved leave as a STORED war cell
written only by the absence command:

- A war cell is a function of several absences (AM + PM from two filings combine into one cell;
  `sync.ts:538-596`), so one `inputId` per cell cannot represent it (Codex OA-001, Fable FB-01).
- A stored copy must be rebuilt on boot, war creation, a cleared blocking request, roster gain and
  after a half-finished save; `runInbound` does all of those implicitly today and Rev 1 deleted it
  (OA-002, OA-004, OA-005, FB-02).
- "For each Input the envelope changed" is unreadable from inside a reducer, and the Inputs page's
  own add form + medical splits bypass `commitNewInput` (FB-03).
- The nested `persistNotify` branch writes the war to storage inside the reducer, before a possible
  rollback (FB-04), and notifies mid-reducer (FB-05).

Other findings: bulk gestures would become many envelopes (OA-003); OIL and manual FO/HO credits
break "approved needs inputId", and `source` has readers Rev 1 didn't list (OA-006, FB-06);
incomplete decide transitions (OA-007); member date-edit keeps `lw` provenance (FB-07, owner
question); new absences silently change a published day's Unavailable face (FB-08, pre-existing,
owner question); unregistered command types / undo phrases / seed origin (FB-09); `acc:'g'`
derivation is scope creep on a parity axis (FB-10); split loses `mod` / `LATEOFF` (FB-11);
locked-week approve wording (FB-12).

Fable verified as correct (not to re-litigate): balance maths charges pending and approved alike
(`charge.ts:148`, `availability.ts:101`); restore goes through `write()` seams with no projector;
`mayReverse` gives the right answers; the storage reset clears inputs + weeks + leavewar together;
off-types never land ground rows.

**Host disposition:** the convergent finding means the stored copy IS the fragility step 4 exists
to remove. Rev 2 stops storing absences on the war: requests + OIL credits stay stored; the
absence layer is derived on read from INPUTS through one merged `getState()` with per-person
structural sharing. Full finding → disposition map: design §15. Two owner questions: design §13.

## Round 2 — design Rev 2 (derived on read), 19 Sep 26

**Fable: REVISE, "close"** — the derived-on-read model is right and dissolves most of round 1, but
four load-bearing wrong-reads: the balance figures read the raw `state.wars` via `figureCtxOf` /
`setBalance`, not `getState()` (FB2-01, HIGH); deleting `raptorOwns` leaves every writer/affordance
blind to absences, and credit/refused-vs-absence was undefined (FB2-02, HIGH); an index keyed by war
misses a later-created war (FB2-03, HIGH); nothing bumps the LW version after an Inputs filing, so
the war never repaints (FB2-04, HIGH). Plus: nested `persistNotify` still persists request deletes
before a possible rollback (FB2-05); refuse→approve loses the remark (FB2-06); the structural-sharing
rationale was wrong — rows take the whole maps + `version` (FB2-07); signature fields unstated
(FB2-08). Both owner questions judged correctly framed; nothing else is an owner decision.

**Codex round 2:** the runner crashed on a Windows console encoding error (a `→` character) before
completing — no review, not an approval. Re-run on Rev 3 with UTF-8 mode.

**Owner answers (19 Sep 26):** Q1 — a member's re-dated war-approved leave "stays green but has an
input blue line at the left just like the input standard" (= clears `lw`; blue "filed on the Inputs
page" edge; today's visible behaviour). Q2 — the published-day Unavailable gap is its own follow-up
after step 4 (`[PUB-UNAVAIL]`).

**Host disposition:** all eight folded into Rev 3 (design §16).

## Round 3 — design Rev 3, 19 Sep 26

**Fable: APPROVED** ("build-ready once three small items are folded into the build plan"): every
FB2 fix verified against the code. Items: FB3-01 the drag-move can't reach approved leave
(`isMovableSource`/`moveProblem` read the raw grid); FB3-02 nothing publishes the derived clash
list to the strip; FB3-03 `carried` is stripped by `readRecord`'s allow-list and dropped by moves.
Folded as design §17.

**Codex: REVISE (7).** The runner marked the run failed because the host appended §17 while it ran
(a result cannot approve a plan that changed under it) — host process error, noted; the findings
themselves are valid. Codex confirmed Rev 3 resolves the stored-projection, balance-reader,
war-resolution and repaint defects. New: OA3-001 decide on a visible request would hit the absence
beneath (dispatch must follow the displayed record); OA3-002 approve over an existing absence needs
a preflight, and the combine body drops a second full-day contribution silently; OA3-003 manual vs
generated OIL credits must stay distinguishable (the pass would auto-delete a hand-typed credit);
OA3-004 an existing credit followed by an absence was wrongly "cannot arise"; OA3-005 Input and
request persist under separate keys retried independently, so a half-save can lose an approval;
OA3-006 one `carried` remark cannot hold two contributors'; OA3-007 undo of an Input-only war
command doesn't snap to the war.

**Host disposition:** all seven folded as design §18 (overrides earlier sections; three contradicted
lines also corrected in place). OA3-005: loss-free ordering via `consumedBy` markers + a boot tidy;
the residual "action not fully applied after a mid-save tab close" is the storage door's
transactional save, owned by ARCH-STACK step 5 — recorded as a known limitation, not built twice.

## Round 4 — design Rev 4, 19 Sep 26

**Fable: APPROVED**, with one real hole — FB4-01 (HIGH): deleting or re-dating an approved Input
from the Inputs page leaves its `consumedBy` request behind, which resurfaces as a pending bid
(finding A's shape) — plus FB4-02 (boot-tidy placement + same-code leftover), FB4-03 (`readRecord`
allow-list must keep `consumedBy`/list `carried`), FB4-04 (`Scope` needs `dates`; war context must
reach `loadContext`).

**Codex: REVISE (4).** OA4-001 (HIGH): un-approve after a boot tidy can still lose both records on a
half-save; a surviving split iid keeps a stale consumed request hidden. OA4-002: consumed requests
still occupy destinations for moves. OA4-003: the clash strip isn't republished on request-only
changes, and misses credit and Input-vs-Input conflicts. OA4-004 (HIGH): a `{clash}` cell had no
defined display, availability or charge — a conflict would count the person available.

**Host disposition — decision changed, not patched.** Five of the nine round-4 findings traced to
the `consumedBy` workaround for half-saves (guardrail-over-cascade rule). Rev 5 fixes the half-save
at its root instead: one command's saves land all-or-nothing through the ONE whiteboard/postman/
backend seam (grouped change, `putMany`, a single-key journal replayed at boot) — a narrow slice of
step 5's transactional save pulled forward because step 4 needs it. `consumedBy` and the boot tidy
are withdrawn; approve deletes requests outright. FB4-01's remaining half, FB4-03, FB4-04, OA4-003
and OA4-004 folded. Design §19.

## Round 5 — design Rev 5, 19 Sep 26

**Fable: APPROVED** ("the transactional-save decision is sound and the seam supports it"), with four
completions: FB5-01 `putMany` must be one synchronous block (one journal key, concurrent sends);
FB5-02 boot replay must be quota-safe and never block boot; FB5-03 the Leave War standalone branch
persists inline; FB5-04 wiring details.

**Codex: REVISE (5).** OA5-001 (HIGH): wrapping phase 8 misses persists — `persistAll()` runs inside
the reducer; OA5-002 (HIGH): per-key supersession can split a group; OA5-003 (HIGH): a single journal
can be overwritten by a later group while an earlier one waits to retry; OA5-004: a sequential
fallback breaks the contract; OA5-005 (HIGH): the conflict-cell order (AM before full) would count a
full-day absence as half available, and `availabilityOf` cannot see "away" from the code alone.

**Host:** the reviewers disagreed on OA5-001's fact (Fable: persists are released in one place;
Codex: `persistAll` runs in the reducer). Host read the code: `wirePersist` wraps `histPush` as
`push(); persistAll()` — `push` defers, `persistAll` runs immediately (`state/persist.ts:137-138`,
called at `state/store.ts:170`). **Codex is right.** Rev 6 (design §20): the group is the
whiteboard's NET change over the whole outermost command (a refused command nets to nothing), the
postman sends one group at a time and merges rather than supersedes, the journal is only ever
replaced by a superset and removed after full apply, `putMany` is required (no fallback), and a
conflict cell carries `awayFull` so availability counts the person away; full-day beats half as
today. Cross-tab writing stays a step-5 known limitation.

## Round 6 — design Rev 6, 19 Sep 26

**Fable: APPROVED** with one must-fix (FB6-01, HIGH) and a close-point pin (FB6-02). Fable confirmed
its own round-5 statement was wrong and Codex's OA5-001 right.

**Codex: REVISE (2).** Confirms Rev 6 resolves coalescing, backend-contract and availability.
OA6-001 (HIGH): rollback does not restore the whiteboard. OA6-002 (HIGH): a failed boot replay is
not connected to the new postman, so a later unrelated group can overwrite the only recovery record;
and the G1/G2 fault-test expectation was wrong.

**Converged:** OA6-001 = FB6-01 — `histRestore`, `lwStore.restore`, `restorePeople` reset memory
only, so a refused command's in-reducer persist would ship. (Also a live bug today.)

**Host:** folded as design §21 — whiteboard transaction with explicit `abort()` called by `dispatch`
on a refused/failed outermost pipeline (closed after `drainQueue()`), the scheduler persist deferred,
the Leave War standalone persist deferred as required; an unfinished boot recovery becomes the new
postman's initial failed group; test expectation corrected; unload edge recorded for step 5.

## Round 7 — design Rev 7

(pending)
