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

**Round-1 outcome:** 8 findings FIXED test-first (001, 002, 004, 005, 007, 008, 009-DPREV, 012-empty);
4 FLAGGED for the owner with fix specs (003 amendment-engine semantics · 006 high-risk seed-engine
dedup · 010 modal · 011 person-select) + two deferred design halves (009-trace-world, 012 cross-day
attribution). **Next:** re-run Codex + a Fable pass on the FIXED code; re-gate. The flagged items are
UI-focus or need the owner's call — none is a safety-critical gap in the published flags themselves.
