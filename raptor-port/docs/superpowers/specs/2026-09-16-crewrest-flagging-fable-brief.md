# [CRP-FLAG] Fable independent review brief — verify the Codex fixes + judge the flagged filing-membership decision

**Role:** independent cross-provider reviewer (Fable 5.1). The feature was BUILT on Opus, then
reviewed 3 rounds by Codex GPT-6 Astra; safe/tractable findings were fixed test-first, the rest
flagged. Your job is NOT to re-derive the design — it is to independently check that the FIXED code
is actually sound, and to give a judgement on the ONE flagged root decision (filing membership).

Branch: `claude/crewrest-published-flagging` off `main`. Gates already green on this branch
(vitest 4789/4789, build clean, `reference/tfin.js` 728/0). Parity is byte-frozen — issued schedule
CONTENT must never change; the flags are a live overlay only.

## The feature in one paragraph
Every day is judged in TWO worlds. WORKING = the live desk copy (what every edit surface reads).
OFFICIAL = each APPROVED (signed) day judged at its ISSUED snapshot version. A published day's face
shows OFFICIAL flags; a draft day shows WORKING. Crew-rest / 7-day-run / midnight-tail rules look at
neighbouring days (incl. across week boundaries), so the OFFICIAL run must resolve EACH neighbour at
its signed version too. `validate()` computes WORKING (via `validateCore()`, which writes every
module global that edit surfaces read), then computes OFFICIAL as a snapshot/restore second run
(`officialFor` → `withIssuedWeek`). When no approved day carries an unpublished amendment, OFFICIAL
is the SAME object as WORKING (alias — drift-proof, zero cost). A "Not Yet Signed" marker
(`publish.ts:notYetSigned`) shows where the live copy diverges from the signed one.

## Files to inspect (all under `raptor-port/src/`)
- `engine/validate.ts` — the two-document machinery: `validateCore` / `validate` / `officialFor` /
  `officialDiverges` / `withIssuedWeek` / `snapGlobals` / `restoreGlobals` / `withOfficialWarn` /
  `OFFICIAL` / `officialWarn`.
- `engine/world.ts` (NEW) — the world flag (`getWorld`/`setWorld`) and the FROZEN FILING
  (`setFiling`/`fileAcc`/`filingHas`/`filingActive`, all keyed by `dateOrd` canonical ordinal).
- `engine/weekctx.ts` — cross-week resolution at the signed version: `issuedDayIn`, `workedSet`,
  `liveFilingAt`, `filingDiffers`/`filingDivergesAt`, `windowDiverges`, `windowFiling`.
- `engine/events.ts` — `inpShow`/`workedSet` reads that now fold through `fileAcc`.
- `engine/publish.ts` — `notYetSigned`, and the FLAGGED pair `filingDelta`/`filingKey` (unchanged).
- `engine/weekstash.ts` — `stashSched` (a stashed week's issued snapshots for cross-week reads).

## What Codex FIXED — verify each is actually sound (not just plausible)
1. **Medical/downchit safety facts read LIVE, never frozen** (CRPF-001). `inpShow` bypasses the
   freeze for `!isDownchit(inp.type)` current-safety facts. Confirm a signed day's medical clash is
   still shown, and that this bypass cannot resurrect a *cancelled* commitment.
2. **Filing is frozen membership-aware on the official run** (CRPF-002/R2-001/R2-002). `fileAcc`
   returns the frozen acc when the input was present at sign time, else `'r'` (dormant), so a
   post-publish-added input cannot leak into the signed face and a working `'r'` cannot clear a
   signed warning. The PROTECT branch in `withIssuedWeek` installs an EMPTY filing `{}` for an
   unresolvable approved date so `fileAcc` returns `'r'` for every input on it. Check for any read
   site that still consults live `acc` on the official run (buildDay `day.input`, xweek seeds,
   midnight-tail).
3. **Year-normalized cross-year address** (CRPF-004). `issuedDayIn` returns `{...snap.d, dt:
   working.dt}` — verify the frozen `dt` cannot re-introduce a stale year (New-Year boundary).
4. **Unresolvable approved day is PROTECTED, not left live** (CRPF-005/R2-003). `withIssuedWeek`
   and `officialDiverges` both force the pass / strip content on `!snap || !snap.d`. Verify an
   approved day with a damaged Original id can never be judged as its live draft.
5. **`workedSet` on a signed date counts EVENTS only** (CRPF-007/R2-005), skipping the hypothetical
   input-landing, in BOTH worlds for an approved date. Verify a signed-but-cancelled event does not
   still count as worked.
6. **Global restoration** — `snapGlobals`/`restoreGlobals` snapshot & restore every global
   `validateCore` writes (WARN/REST/EVD/RUNLEN/RUNSEED/NEXTON/EVDAYS/PREVSUN/NEXTMON/CREWREST_BODY/
   XD_CACHE); DAYS/SCHED.changes/SCHED.pending restored in `finally`; world + filing cleared in
   `finally`. Verify the OFFICIAL run leaves NO global, DAYS entry, SCHED field, world flag or
   filing behind — even on a thrown exception — and that it never touches a write path
   (`noteChange`/`markEdit`/`histPush`) or mints a row id.

## The ONE flagged decision — JUDGE THIS (CRPF-003 / R3-002)
The amendment engine's `filingDelta`/`filingKey` (publish.ts) treat an input that was ABSENT at
sign time and one that is PRESENT-with-empty-acc as **identical** (both "no filing"). The flagging
OFFICIAL gate + `fileAcc` now treat them as **different** (membership-aware: absent → dormant `'r'`).

Consequence for a FRESH unaccepted commitment on a published day: OFFICIAL correctly EXCLUDES it
(right — it isn't signed), but the amendment engine sees "no change" → no "Not Yet Signed" marker,
the day is not publishable, signatures unaffected. Making `filingDelta`/`filingKey` membership-aware
too would fix the inconsistency but CHANGES publish-eligibility and signature binding, which
intersects the separate signature workstream (`[AMEND-SEL-FOLLOWUPS]`).

**Questions for you:**
- Is deferring the `filingDelta`/`filingKey` change to the signature workstream the correct call, or
  is there a SAFETY hole in the published flags themselves as they stand today? (The claim under
  review: the flags shown are correct; only the *publish-eligibility/marker* is inconsistent.)
- Is there any scenario where this inconsistency causes a WRONG or MISSING flag on a published face
  (not just a missing "Not Yet Signed" marker)?
- If you agree it's deferrable, is there a cheap guardrail worth adding now?

## Anything else
Flag any OTHER correctness bug you find in the fixed code, test-first-fixable or not. Prefer precise
`file:function` pointers and a concrete failure scenario (inputs → wrong output). This is safe,
read-only review — do not propose reformatting the verbatim `src/engine/` ports.
