# Rules-engine full bug audit — plan + prompts

Both engines, token-disciplined. Written 7 Sep 26 by the planning session (Fable, normal thinking).

## The course of action (why it's shaped this way)

| Phase | Who | Thinking | Cost driver |
|---|---|---|---|
| 0 · Plan (this doc) | Fable, session | normal | tiny |
| 1 · Scan | **Opus subagents**, one per slice, in parallel | deep | *reading* — kept small by slicing code AND spec |
| 2 · Verify | **Opus subagents**, one per slice that found anything | deep | tiny — re-checks only the findings |
| 3 · Report | Fable, session | normal | tiny |
| 4 · Fix | Fable orchestrates; owner picks what gets fixed | normal | only the files being fixed |

**Do NOT switch the session model between phases.** The session stays on Fable at
NORMAL thinking; the model is chosen per subagent. Deep thinking happens only inside
the reviewer/verifier subagents, in their own context — never in the session.

**Three token rules every reviewer obeys:**
1. Read ONLY the files in your slice. Never the whole engine.
2. Read ONLY your matching spec sections — `grep` the rulebook for your topic, read the hits. Never all 2,700 lines. Never `ui-contracts.md` (6,800 lines of UI, not engine).
3. Read the known-gaps doc for your area so you do NOT re-report an accepted gap as a bug (a re-reported known gap wastes a verify agent).

**Execution vehicle:** a multi-agent workflow (`pipeline(slices → review → verify)`) — the
owner opts in by saying **`ultracode`**. Without it, the same plan runs as plain
subagents, just less parallel. Guideline is ~15 agents: 10 review + verify only for
slices with findings (typically 4–6) ≈ 14–16. Trim by merging LW-1 into LW-2 if needed.

## The slices (10) — code files + the spec section each one reads

Paths are relative to `raptor-port/`. Line counts are the reading cost.

### Leave War engine (`src/leavewar/engine/`) — 4 slices
| id | topic | files (lines) | spec to grep/read |
|---|---|---|---|
| **LW-1** | Dates, wars, lifecycle | `period.ts` 261 · `wars.ts` 75 · `months.ts` 34 · `stages.ts` 210 · `bids.ts` 124 (~700) | `docs/leavewar/known-gaps.md` §Rulings; `CLAUDE.md` §Leave War; `docs/engine-rules.md` §Auth / roles (stage gates) |
| **LW-2** | Charging & counters | `charge.ts` 222 · `counters.ts` 458 · `codes.ts` 355 (~1,035) | `docs/leavewar/known-gaps.md` (charge/counter rulings); `docs/engine-rules.md` §Weekend/PH work earns OIL (the FO/HO half); file-header comments (the 15-day same-counter run rule, halves, weekends/PH excused) |
| **LW-3** | OIL ledger + event types | `oiltracker.ts` 292 · `eventdefs.ts` 188 (~480) | `docs/engine-rules.md` §Weekend/PH work earns OIL; `docs/leavewar/known-gaps.md` (OIL rulings) — FIFO oldest-first, expiry as-of, credits vs debits |
| **LW-4** | Manning rules | `availability.ts` 289 · `requirements.ts` 163 · `evaluate.ts` 81 · `groups.ts` 173 · `people.ts` 278 (~985) | `docs/leavewar/known-gaps.md` (manning/threshold rulings); rules-are-DATA notes (`CrewFilter`/`RuleCount`, `matchesFilter`, `teamsOf`) |

Skipped on purpose: `seed.ts` (demo data), `raptor.ts` (sync stub), `index.ts`.

### Raptor engine (`src/engine/`) — 6 slices
| id | topic | files (lines) | spec to read |
|---|---|---|---|
| **R-1** | Validation core | `validate.ts` 1,199 · `rules.ts` 170 · `cxreasons.ts` 114 (~1,480) | `docs/engine-rules.md` §Validation (lines 7–843 — big, but it IS the spec for this file) + §Editable rules |
| **R-2** | Availability & time | `avail.ts` 546 · `time.ts` 69 · `weekctx.ts` 186 · `lookahead.ts` 128 · `week2.ts` 123 (~1,050) | §Availability is time-aware; §SANS Availability; §The late-input mark |
| **R-3** | Inputs, medical, OIL | `inputs.ts` 750 · `medical.ts` 256 · `oil.ts` 196 (~1,200) | §Accepting a personal input; §The medical tracker (downchit/upchit/trim); §Weekend/PH work earns OIL |
| **R-4** | Board structure & order | `slots.ts` 512 · `reorder.ts` 463 · `order.ts` 171 · `waves.ts` 132 · `qualcols.ts` 70 · `keys.ts` 99 · `people.ts` 333 · `data.ts` 138 (~1,920) | §Key renumbering; §Re-ordering the SECTIONS; §Reordering a board list; §Sorting a board section; §Who a row stores: ID vs CALLSIGN; §Personnel |
| **R-5** | Publish, drafts, history | `publish.ts` 423 · `drafts.ts` 376 · `restore.ts` 131 · `editlog.ts` 278 · `weekstash.ts` 81 · `weeks-data.ts` 83 · `stores.ts` 164 (~1,540) | §Publishing / amendments; §Version snapshots / restore; §Drafts; §The edit log; §History; §Stores configuration |
| **R-6** | Templates & events | `daytpl.ts` 331 · `wavetpl.ts` 322 · `dutytpl.ts` 209 · `events.ts` 477 (~1,340) | §Day templates; §The ⓘ info-only flag; file-header comments for wave/duty templates and events |

Skipped on purpose: `hooks.ts`, `insights.ts`, `index.ts` (plumbing).

---

## PROMPT A — the reviewer (one per slice; run as Opus, deep thinking)

```
You are an adversarial bug hunter auditing ONE slice of a rules engine for a
squadron flying-schedule app. Your job is to find places where the code does
NOT do what the documented rules say, or produces a wrong/inconsistent result on
an edge case. You are NOT reviewing style, naming, or "could be cleaner".

SLICE: {SLICE_ID} — {TOPIC}
FILES TO READ (repo-relative, under raptor-port/): {FILES}
SPEC TO READ: {SPEC} — grep docs/engine-rules.md for your topic and read only the
matching sections; do not read the whole file. Also read the known-gaps doc for
your area ({KNOWN_GAPS}) so you do not re-report an accepted, documented gap.

TOKEN DISCIPLINE (hard rules):
- Read ONLY the files listed. Do not open other engine files, tests, or UI code
  unless a single call site is needed to confirm how a function is used.
- Do NOT read docs/ui-contracts.md.
- Do NOT run the full test suite. You MAY run ONE targeted test file
  (`npx vitest run <file>`) from raptor-port/ if it settles a specific doubt.
- Make NO code changes.

METHOD:
1. Read your spec sections FIRST. Write down every concrete rule as a one-line
   statement (e.g. "an upchit day is a FIT day: covering rows end the day
   BEFORE it").
2. Read your code files. For each rule, find where it is implemented.
3. Hunt the edges, deliberately, for every rule:
   - dates: month/year boundaries, 29 Feb, UTC vs local, week boundaries
     (Sunday→Monday), weekends and public holidays, "as of" ordinals
   - numbers: halves and fractions, zero, negatives, empty lists, one item
   - ordering: FIFO/oldest-first, expiry, ties, stable sort assumptions
   - overlap/trim/split: same-type vs different-type, whole-cover, tails
   - gates: role (admin/member), stage (draft/open/closed/published)
   - state: the same fact read from two places that could disagree
4. A BUG is any of: (a) code contradicts a documented rule; (b) an edge input
   yields a wrong or inconsistent result; (c) two code paths encode the same
   rule differently. It is NOT a bug if the known-gaps doc already records it —
   list those separately as KNOWN.

OUTPUT — return ONLY this JSON, nothing else:
{
  "slice": "{SLICE_ID}",
  "rules_checked": ["one line per rule you verified correct"],
  "findings": [
    {
      "id": "{SLICE_ID}-1",
      "severity": "critical | important | minor",
      "file": "path",
      "line": 123,
      "rule": "the documented rule this breaks, quoted or closely paraphrased",
      "claim": "one sentence: what the code does wrong",
      "evidence": "the exact code lines that show it",
      "repro": "concrete inputs -> the wrong output you expect (be specific:
                dates, values, role, stage)",
      "confidence": "high | medium | low"
    }
  ],
  "known_gaps_seen": ["gaps you found that are already documented — do not count"]
}
Severity: critical = wrong leave/pay/manning/safety figure or data loss;
important = wrong result in a realistic case; minor = only on a contrived edge.
Be precise and stingy: a finding you cannot give a concrete repro for is "low"
confidence, and a claim with no evidence lines is not a finding. Zero findings
is a valid, honest result — do not invent problems to look thorough.
```

## PROMPT B — the verifier (one per slice with findings; run as Opus, deep thinking)

```
You are verifying bug findings from an audit of a rules engine. Your job is to
try to PROVE each finding wrong. Assume the reviewer was over-eager. Only a
finding you cannot break survives.

FINDINGS TO VERIFY (JSON): {FINDINGS}
FILES: read only the file/lines each finding cites plus what is needed to trace
the one code path. Also read {KNOWN_GAPS} to check none is an accepted gap.
Do NOT read the whole engine. Do NOT read docs/ui-contracts.md.

For EACH finding:
1. Read the cited code. Does it actually do what the claim says?
2. Trace the repro by hand, OR write a tiny throwaway test in raptor-port/
   (`npx vitest run <your-file>`) that feeds the repro inputs in. Delete the
   file afterwards. Make NO other code changes.
3. Check the rule is really documented as stated (not the reviewer's reading).
4. Verdict:
   - CONFIRMED  — the repro really produces the wrong result; state the exact
                  observed vs expected.
   - FALSE_ALARM — the code is right, or the "rule" was misread; say why in
                  one sentence.
   - KNOWN_GAP  — already documented as accepted; cite where.
   - UNSURE     — could not settle it; say exactly what is missing.

OUTPUT — return ONLY this JSON:
{
  "slice": "...",
  "verdicts": [
    { "id": "...", "verdict": "CONFIRMED|FALSE_ALARM|KNOWN_GAP|UNSURE",
      "severity": "critical|important|minor (your own re-rating)",
      "observed": "...", "expected": "...", "reason": "..." }
  ]
}
```

## PROMPT C — the workflow the session runs (only on the owner's "ultracode")

```
pipeline over the 10 slices:
  review  = agent(PROMPT A filled for the slice, model: opus, phase: 'Scan')
  verify  = if review.findings non-empty:
              agent(PROMPT B with review.findings, model: opus, phase: 'Verify')
            else skip (saves an agent)
collect  = every verdict CONFIRMED, sorted critical → important → minor,
           plus a KNOWN_GAP list and an UNSURE list
report   = one table for the owner, plain language, one row per confirmed bug:
           what it is, where, how bad, the concrete case that shows it.
           NO code changes. The owner picks what gets fixed.
```

## What happens after the report (phase 4)

The session (Fable, normal thinking) takes the owner's picks and plans the fixes —
one commit per bug, each with a pinned test that fails without the fix, run
through the six gates, on the designated branch, merged only on "merge live".
