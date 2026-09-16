# [CRP-FLAG] post-build CODE INSPECTION — findings + dispositions

**Round 1 reviewer:** Codex GPT-6 Astra (high), via claudex-loop runner, 16 Sep 26.
**Verdict:** REVISE — 12 findings (6 high, 6 medium). Branch `claude/crewrest-published-flagging`.
Full evidence + fix specs: the runner artifacts (reply.txt). This doc tracks disposition.

Two root-cause clusters (owner's "guardrail over a bug cascade"):
- **A — filing model under-specified:** fileAcc conflates versioned-commitment filing (freeze),
  CURRENT medical/qual safety facts (§4: live/unversioned — must NOT freeze), and filing-only
  divergence (the cross-week gate ignores filing). → CRPF-001/002/003/006/007.
- **B — world-resolution accessor incomplete:** displayedByDay applied to focusWarn + 3 reads,
  but not the exempt-desk/standalone puck helpers, DayPop modal, person-select/warnFocusMap, or
  the divergence-list empty-case + cross-day attribution. → CRPF-008/009/010/011/012.

| id | sev | one-line | disposition |
|----|-----|----------|-------------|
| CRPF-001 | high | medical/downchit (current safety fact, §4) wrongly excluded from OFFICIAL by frozen filing | **FIXED** — inpShow: `!isDownchit(inp.type)` bypasses the freeze (test) |
| CRPF-002 | high | windowDiverges compares content only, not filing → a filing-only neighbour change aliases | **FIXED** — membership-aware `filingDiffers(snap.fil, dt)` in the gate |
| CRPF-003 | high | filingDelta absent==empty, but fileAcc absent→'r' vs empty→active — inconsistent membership | **FLAGGED** — filingDelta feeds dayDelta → publish eligibility, an AMENDMENT-ENGINE semantic (separate branch/workstream). The gate half is covered by CRPF-002's membership-aware comparator; changing filingDelta itself needs the owner's call (a new commitment on a published day would become a publishable delta + Not-Yet-Signed) — do NOT change it blind. |
| CRPF-004 | high | issuedDayIn returns frozen snap.d dt, undoing year-normalization → cross-year mis-address | **FIXED** — `{...snap.d, dt: working.dt}` (test via New-Year edge left to Fable) |
| CRPF-005 | high | unresolvable loaded approved day: aliases, or left as LIVE draft in the official pass | **FIXED** — officialDiverges forces on `dayCurVer==null`; withIssuedWeek strips it (test) |
| CRPF-006 | high | inputFlags/acceptedDay + xweek dedup still read live acc → duplicate/invented breach | **FLAGGED** — the deferred §14.3 trap (b). Fix = an official event-visibility helper that dedups timed inputs by frozen filing + the selected day's own rows (not live acc / loaded-week acceptedDay), threaded through buildDay for loaded + neighbour + midnight-tail reads. HIGH regression risk in the shared seed engine (inpShow is on every validate) — needs careful test-first work, not a blind overnight change. Scenario is narrow (a signed row edited to differ from its input, then the input removed). |
| CRPF-007 | med | workedSet counts INPUTS activity even for a signed day whose event was cancelled | **FIXED** — signed date (`filingHas`) → events only; unsigned → the hypothetical landing (test) |
| CRPF-008 | med | two more PV-gated puck helpers (exemptDeskOwn, standalone own) ignore OFW | **FIXED** — both → `PV&&!OFW` |
| CRPF-009 | med | displayedByDay vs ViewWeek DPREV mismatch; trace cross-world VWORK focuses wrong index | **FIXED (DPREV half)** — displayedByDay drops the DPREV check to match ViewWeek L58. **FLAGGED (trace-world half)** — needs `data-world` + a stable warning id on trace/warning refs so a cross-world click is a defined no-op (overlaps CRPF-010/011). |
| CRPF-010 | med | DayPop day-detail modal renders WORKING warnings; data-adv resolves via displayedByDay | **FLAGGED** — Modals.tsx DayPop renders outside the snapshot/overlay; fix = resolve the modal's displayed version (withDaySnap + withOfficialWarn for an approved view day) and emit world-qualified refs. Intricate; UI-focus (the warning IS shown on the puck/list) not safety-critical. |
| CRPF-011 | med | published puck select + warnFocusMap read WORKING → flagged puck opens no box | **FLAGGED** — selectPerson/personWarnDays/warnFocusMap must resolve per displayed bundle; needs care (avail.ts↔view.ts world-resolution, cycle risk). UI-focus, not safety-critical. |
| CRPF-012 | med | goneW computed after the empty-list early return; cross-day "goes away" names wrong day | **FIXED (empty-case)** — goneW computed before the early return, person-filtered, box renders when official-only rows remain (test). **FLAGGED (cross-day attribution)** — naming which date needs publishing + the cause-day trace status is a genuine UX design question. |

**Confirmed sound by the reviewer:** the synchronous official-pass finally block restores all
validator globals/DAYS/SCHED/world/filing; no new editing capability; dependency window correct.

## FABLE PASS (Fable 5.1, high, via claudex-loop `review --host codex --model claude-fable-5-1`, 16 Sep 26).
**Verdict:** REVISE — 6 findings (2 medium, 4 low). Independent cross-provider check of the Codex
fixes + judgement on the flagged filing-membership decision. Runner result: `scratchpad/fable-review`.
Fable independently CONFIRMED the two-document machinery sound (globals + world + filing restored in
finally; PROTECT strips + installs empty filing on both loaded and cross-week paths; year-normalised
address correct; downchit reads live so a cancelled 'r' medical is not resurrected) and the six Codex
fixes. It found 2 real defects Codex missed + confirmed the deferral of decision #1.

| id | sev | one-line | disposition |
|----|-----|----------|-------------|
| FR-001 | med | inpShow folds DORMANCY through the frozen filing but the accepted-row deferral (inputFlags/acceptedDay) still reads LIVE acc → a sign-time 'g' whose working row was later unaccepted ('r'/spliced) is shown AGAIN beside its frozen snapshot row → a duplicate clash on the issued face | **FIXED** — inpShow computes the effective acc ONCE on the official run and runs the whole gate (dormancy + deferral) on it; the deferral scans the swapped DAYS by row src, live-acc-agnostic. Test (official-flags Phase 4b, unit-level on inpShow). |
| FR-002 | med | the cross-week alias gate compares a neighbour's frozen 'g' against LIVE acc, which navigation clears → any published neighbour week with an accepted input forces the second validate() pass on EVERY keystroke (correctness fine — fileAcc uses the frozen 'g' — but the "zero-cost alias" guarantee is lost) | **FIXED** — filingDiffers gains an xweek flag; cross-week it treats 'g' and '' as the same signed state ('r'/'u' kept exact). Test (official-flags Phase 3b). |
| FR-003 | low | withIssuedWeek installs DAYS/SCHED + setWorld/setFiling BEFORE the try — a throw in that window (none today) would skip the restore | **FIXED** — d0 captured (pure reads) before the try; the install + setWorld/setFiling moved inside it, so the finally always covers them. No behaviour change. |
| FR-004 | low | a legacy/pre-Phase-2 neighbour week (dayOK set, version ids unresolvable) is PROTECTed on the official world → a real cross-day breach shows on WORKING but never on the issued face, silently | **FLAGGED (owner)** — by design under §14.1; a migration-only state that CANNOT arise with today's demo data (no real signed pre-Phase-2 books). Note it; surface a "prev week's signed version unavailable" cue only if the owner wants it. |
| FR-005 | low | fileAcc(dt, inpId(inp), …) called inpId, which MINTS inp.iid → the official run could write INPUTS | **FIXED** — inpShow's official branch reads inp.iid directly (no id ⇒ absent from every frozen fingerprint ⇒ 'r'); folded into the FR-001 fix. |
| FR-006 | low | judgement on the flagged decision (CRPF-003/R3-002) | **CONFIRMED DEFER** — traced both directions, no wrong/missing published-FACE flag from the membership inconsistency itself; only the marker/eligibility gap, correctly the signature workstream's call. Caveats: the official face already follows LIVE input VALUES (per the "values not frozen" decision), and case (b) forces the pass every keystroke (same class as FR-002). **SUPERSEDED by owner 16 Sep 26** — see below. |

### OWNER RESOLUTION of the filing-membership decision (16 Sep 26) — supersedes phase-8 #1 + FR-006
The owner settled it in conversation, reversing the 26 Aug "don't auto-churn a published day" clause
for the WORKING copy only:
- A **freshly-filed request is AUTO-ACCEPTED** onto the LIVE WORKING COPY as a **pending amendment**,
  and it **increases the pending (changes) count** — the scheduler's cue that something changed. Only
  if the scheduler REMOVES it does it stop counting ('r', dormant). Same for leave inputs.
- The **published/issued face stays FROZEN** — it does not change automatically; the amendment is
  published (or removed) by the scheduler. (So the OFFICIAL-face freeze — fileAcc — is unchanged.)
- The **"Not Yet Signed" marker is a WORKING-COPY affordance ONLY** — it must NOT show on the issued
  face (confusing: the published schedule is TRUE until published). **DONE this session** (html.ts:
  `!PV&&notYetSigned(di)`; tests: official-flags Phase 6, pubsweep issued-frozen).
- **REMAINING amendment-engine work (own careful test-first pass, overlaps `[AMEND-SEL-FOLLOWUPS]`):**
  make a fresh input on a PUBLISHED day auto-land on the working copy as a pending amendment
  (relax autoAcceptInput's `dayApproved` guard for the INTERACTIVE path WITHOUT churning the
  boot/week-load seed pass — the one real design fork). This makes the fresh input publishable via the
  normal content-delta path, so `filingDelta`/`filingKey` need NOT change (acc becomes a real 'g').

## ROUND 3 (Codex GPT-6 Astra, high) — verify the round-2 completions. Verdict REVISE, 4 findings.
| id | sev | one-line | disposition |
|----|-----|----------|-------------|
| R3-001 | high | the ADJACENT-week equivalent of R2-002: windowFiling installed no filing for an unresolvable adjacent approved date → fileAcc fell back to live acc, a live neighbour commitment leaked into the seed | **FIXED** — windowFiling now installs `snap.fil` when resolvable else `{}` for every approved adjacent date. |
| R3-002 | high | filingDelta/filingKey still collapse absent vs present-empty, so publication + signatures are inconsistent with the now-membership-aware OFFICIAL (a fresh empty-acc commitment on a published day: OFFICIAL excludes it, but no Not-Yet-Signed marker and not publishable) | **FLAGGED (amendment-engine decision)** — see "Owner decisions" below. |
| R3-003 | med | CRPF-010: DayPop day-detail modal reads live DAYS + WORKING WARN → on an issued day with a hidden fix, the panel says "clean" while the face is flagged | **FLAGGED** — resolve the modal's displayed document (withDaySnap + withOfficialWarn for an approved view day). Intricate; UI-focus. |
| R3-004 | med | CRPF-011: selectPerson/personWarnDays + warnFocusMap read WORKING → a published-only breach's puck opens no box | **PARTIAL FIX** (warnFocusMap now resolves per displayed day) + **FLAGGED** (selectPerson/personWarnDays needs avail↔view world-resolution — cycle risk). |

## OWNER DECISIONS / remaining work (a coherent "phase 8", none a safety gap in the published flags)
1. **The filing-membership model (CRPF-003 / R2-001 implications / R3-002) — the ONE root decision.**
   The amendment engine treats an input ABSENT-at-sign and PRESENT-with-empty-acc identically
   (filingDelta/filingKey). The flagging OFFICIAL gate + fileAcc now treat them as different
   (membership-aware). For a fresh unaccepted commitment on a published day this means OFFICIAL
   correctly excludes it, but the amendment engine sees "no change" (no Not-Yet-Signed marker, not
   publishable, signatures unaffected). Full consistency needs filingDelta/filingKey to become
   membership-aware too — which CHANGES publish eligibility + signature binding, and so intersects
   `[AMEND-SEL-FOLLOWUPS]` (the signature workstream). **Owner's call**, best done WITH that work.
   (Not patched piecemeal overnight — that would be another half-measure.)
2. **The deferred §14.3 xweek dedup (CRPF-006 / R2-004).** Pre-existing seed-engine bug; a dedicated
   careful test-first pass.
3. **Accessor completeness UI (R3-003 modal, R3-004 selectPerson, 009 trace-world-identity).** Apply
   the world-resolution + a `data-world`/stable-warning-id to the modal, person-select, and
   trace/warning refs. Medium, UI-focus — the flags themselves are correct and visible.

## ROUND 2 (Codex GPT-6 Astra, high) — verify the round-1 fixes. Verdict REVISE, 5 findings.
Codex: "CRPF-005 and CRPF-007 are incomplete; deferring CRPF-003 and CRPF-006 is not safe as
categorized." 4 of 5 were completions of my own fixes → FIXED; the 5th (xweek dedup) stays FLAGGED.

| id | sev | one-line | disposition |
|----|-----|----------|-------------|
| CRPF-R2-001 | high | the LOADED gate still used coarse dayDelta (absent==empty) → a fresh empty-acc commitment on an approved day aliased into OFFICIAL | **FIXED** — officialDiverges now uses the membership-aware `filingDivergesAt(snap.fil, DAYS[di].dt)` per loaded approved day (contained to the flagging gate, NOT amendment filingDelta). Test. |
| CRPF-R2-002 | high | CRPF-005 strip left the date's INPUT contribution live (fileAcc fell back to live acc) | **FIXED** — the strip branch also installs `filing[dt]={}` so fileAcc returns 'r' for every input on the protected date (schedule + commitment inputs suppressed). |
| CRPF-R2-003 | med | `dayCurVer!=null` doesn't prove `snapshot.d` exists (a damaged Original id resolves) | **FIXED** — the loaded gate resolves the snapshot and forces the pass on `!snap||!snap.d`, same predicate as withIssuedWeek/windowDiverges. |
| CRPF-R2-004 | high | CRPF-006 is broader than categorized: a signed row RETIMED (no input removal) still double-counts via the xweek bypass in prevSundaySeed | **FLAGGED (escalated)** — this is a PRE-EXISTING cross-week seed-dedup bug (the blanket `if(xweek)return true` in inpShow), not introduced by this feature, and it affects WORKING seeds too. The fix (date-local timed-input dedup against the selected doc's rows + resolved filing, threaded through buildDay for loaded/neighbour/midnight-tail) is HIGH regression risk across every seed read. Needs its own careful test-first session (owner-aware), not a blind overnight change. |
| CRPF-R2-005 | med | CRPF-007's events-only applied only in the official pass; an APPROVED next Monday still added the hypothetical in the WORKING seed | **FIXED** — workedSet now skips the hypothetical for an APPROVED date (from the stash's dayOK) in BOTH worlds, matching autoAcceptInput's approved-day guard. |

**Round-2 outcome:** 4 FIXED (R2-001, R2-002, R2-003, R2-005); 1 FLAGGED+escalated (R2-004 = the
pre-existing xweek dedup, = CRPF-006). Full suite green, build clean, tfin 728/0. The ONE remaining
correctness gap Codex will not clear (R2-004/CRPF-006) is a pre-existing seed-engine dedup issue that
predates this feature; it is the right thing to fix in a dedicated, careful pass — flagged for the owner.

**Round-1 outcome:** 8 findings FIXED test-first (001, 002, 004, 005, 007, 008, 009-DPREV, 012-empty);
4 FLAGGED for the owner with fix specs (003 amendment-engine semantics · 006 high-risk seed-engine
dedup · 010 modal · 011 person-select) + two deferred design halves (009-trace-world, 012 cross-day
attribution). **Next:** re-run Codex + a Fable pass on the FIXED code; re-gate. The flagged items are
UI-focus or need the owner's call — none is a safety-critical gap in the published flags themselves.

## ITEM 2 — the REAL bug the owner reproduced (16 Sep 26). NOT the seed dedup — a VIEW-page world gap.
The owner's "7-day breach on the wrong day" turned out NOT to be the seed double-count (CRPF-006):
every faithful reproduction of a clean prior week lands the breach correctly. The actual bug (owner's
live repro): a man on the programme all 7 days; Mon+Tue PUBLISHED with him; then he's removed from
Monday's WORKING copy. The issued schedule still runs 7 straight → busts SUNDAY, but Sunday is a DRAFT,
and the view-only page rendered a draft day from the WORKING world, where the unpublished Monday removal
had "cleared" it — an unpublished change hid a published breach. It is NOT run-specific: the same gap
hits crew rest / overnight over any published→draft boundary. Root cause: the view page drew draft-day
flags from WORKING instead of the OFFICIAL (published-where-available) world.

**Fix (commits a82d64b + 4bc14d2, gates: vitest 4803/0 · build · parity 728/0 · e2e 2 pre-existing).**
- `viewDayHTML(di)` (html.ts) — the view page's per-day dispatch, extracted from ViewWeek (drift-seam
  removed from pubsweep's mirror). A live DRAFT day renders `withOfficialWarn(()=>dayHTML(di,false))`,
  so ALL its cross-day flags resolve in the OFFICIAL world. Aliased = no-op ⇒ parity untouched. Edit
  week unchanged (working copy is the truth — a pending fix previews as solved).
- **Codex GPT-6 Astra bug-check (a82d64b) → REVISE, 2 medium, both FIXED in 4bc14d2:**
  - **CRP-I2-001** — displayedByDay selected OFFICIAL only for approved days ⇒ a clicked draft-day
    official-only warning resolved against WORKING (wrong-index focus); warnFocusMap shared it. FIXED:
    extracted `dayDisplaysOfficial(di)` (the single mirror of viewDayHTML) and routed displayedByDay
    through it. Test: displayedByDay resolves the official run breach + focusWarn lands on the man.
  - **CRP-I2-002** — the DayPop day-details panel (dayInfoHTML) read WARN directly ⇒ "this day is clean"
    while the week flagged the breach. FIXED: DayPop resolves through `dayDisplaysOfficial` +
    `withOfficialWarn` (content still reads live DAYS). Test: details show the breach on view, clean on edit.
  - One predicate (`dayDisplaysOfficial`), three consumers (render / click / details) — no drift seam.
- **STILL DEFERRED to Item 3 (unchanged by this):** R3-004 selectPerson/personWarnDays (the puck-select
  highlight still reads WORKING — the flagged avail↔view cycle risk), CRPF-009 trace-world identity,
  R3-003's remaining modal polish. These are the puck/hover click-jump refinements, not the flag itself.
- **CRPF-006 / R2-004 (the cross-week seed dedup) remains genuinely open** — a separate pre-existing
  crew-rest seed double-count, not this bug. Still owner-flagged for its own careful pass.
