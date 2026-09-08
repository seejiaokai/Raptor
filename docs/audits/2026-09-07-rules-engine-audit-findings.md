# Rules-engine bug audit — findings

**Run:** 7 Sep 26 · 26 Opus 4.8 agents (10 scanners + 16 verifiers) · 3.2M tokens · 0 errors.
**Method:** each of 10 engine slices read against its rulebook section; every candidate bug refuted by 2 independent adversaries (one reading the code, one tracing/running the repro). Only bugs both failed to break are CONFIRMED.

## Scoreboard
- **6 CONFIRMED** — 3 important, 3 minor
- **2 CONTESTED** — verifiers split; your call
- **0 rejected as false, 0 unsure** — clean signal
- **~196 rules verified CORRECT** across the two engines

## Coverage (rules checked correct per slice)
| slice | area | findings | rules OK |
|---|---|---|---|
| R-1 | Validation core (validate.ts, 1,200 lines) | 1 | 28 |
| R-2 | Availability & time | 2 | 16 |
| R-3 | Inputs, medical, OIL earning | **0** | 24 |
| R-4 | Board structure, ordering, keys | 1 | 22 |
| R-5 | Publish, drafts, history | 1 | 14 |
| R-6 | Templates & events | 1 | 16 |
| LW-1 | Leave War dates/wars/lifecycle | 1 | 21 |
| LW-2 | **Leave War charge & counters (money maths)** | **0** | 26 |
| LW-3 | Leave War OIL ledger | **0** | 17 |
| LW-4 | Leave War manning rules | 1 | 12 |

The three areas I most feared — the Leave War leave/day charge maths (LW-2), the OIL ledger (LW-3), and the medical trims (R-3) — came back **clean**, with the most rules verified of any slice.

---

## CONFIRMED — important

### 1. AVALON/BB desk: the crew picker and the warning list disagree
`raptor-port/src/engine/avail.ts:569` (in the AVALON code that just merged as #375)

The crew picker runs the "too many days in a row" (7-day run) check on an **AVALON/BB duty-DESK** slot and greys a person out — but if you place them anyway, `validate()` raises **no** run warning, because an AVALON/BB duty isn't counted as an event. So the picker bars a plant the warning list will never flag. The AVALON *jet seat* is correctly exempt (`saExempt` set at avail.ts:216); only the **desk** path was missed — a `d:` desk key never gets `saExempt`.

- **Repro:** maxRun=6. Pilot flies a real sortie Mon–Sat (6 in a row), nothing Sunday. Sunday has an AVALON desk duty. Open the picker for that Sunday AVALON desk → "7th day in a row — breaks Sunday". Drop them anyway → no DAYS_RUN warning appears.
- **Why it matters:** you explicitly made the picker and the warning list agree; this is exactly the drift you care about, and it slipped through the #375 review (which checked the jet seat, not the desk).
- **Fix shape:** set `saExempt` on the `d:` AVALON/BB desk branch too (avail.ts ~156–174), mirroring line 216. Pin with a test on the desk key.

### 2. The ⓘ "info-only" flip vanishes on a published day
`raptor-port/src/engine/restore.ts:97`

Tapping the ⓘ info-only toggle on a row of an **already-published** day silently loses the change — it never becomes a publishable amendment (AL). The saved day keeps validating that item as real, while your live view shows it as info-only. Cause: the row's `info` flag is left out of the saved fingerprint (`dayKeys()`), so the reconcile step thinks nothing changed and deletes the pending mark.

- **Repro:** publish Monday; in edit mode click a ground row's ⓘ → the pending mark is set then immediately deleted; "Publish AL" has nothing to publish.
- **Why it matters:** an info-only flip is a real amendment; right now it can't be issued on a published day. Same root cause makes two drafts that differ only by an info flag look identical.
- **Fix shape:** include `r.info` in the `ap:`/`gr:` composite in `dayKeys()` (restore.ts:54 and :97). Pin with a publish-then-flip test.

### 3. Leave War manning can show false RED (a rounding error)
`raptor-port/src/leavewar/engine/availability.ts:228`

A team-based manning rule can mark a day **RED under-manned** when the exact number needed is actually present, because a fractional team count is rounded twice and comes out as e.g. **3.999 instead of 4.0**, tripping a threshold of 4.

- **Repro:** a team rule of 3-pilot slots, threshold red<4; exactly 4 pilots available → computes 3.999 < 4 → RED, when it should be OK.
- **Why it matters:** a false "not enough people" alarm on the Leave War manning view.
- **Fix shape:** round once at the end, or round to a sensible precision before the threshold compare, in `ruleHave`/`teamsOf`. Pin with the 4-present/3-slot case.

---

## CONFIRMED — minor

### 4. Three-way SC-spare clash: one pair goes unflagged
`raptor-port/src/engine/validate.ts:1000` — when one man holds **three or more** overlapping SC places (two spares + a desk), the check reports only the first colliding pair, so the desk↔spare conflicts are dropped. Says "one double-book" where there should be three. Only bites the rare 3+-overlap case. Fix: use the all-pairs walk like the AVALON path, not the first-hit `scSeatHit`.

### 5. A stale flying key can crash instead of returning blank
`raptor-port/src/engine/slots.ts:68` — `slotVal`/`setSlotVal` dereference a flying-seat key without the null guard every sibling branch has, so an out-of-range key throws instead of returning "". The reviewer **could not find a live UI path** to trigger it (the disarm logic prevents it), so this is defensive-only — low confidence it's reachable, but it violates the contract. Fix: add the same null guard/try-catch as the duty branch.

### 6. A cancellation reason can leak into a saved day-template
`raptor-port/src/engine/daytpl.ts:139` — when you save a day as a template, the "cancelled for reason X" text is stripped from all-hands/formation/aircraft rows but **not** from sim, duty, or ground rows. So a template can carry a stale reason (e.g. "U/S JET") that pre-fills the cancel box on any day you later apply it to. Fix: strip `cxr` on the sim/duty/ground rows in `mintBlob` too.

---

## CONTESTED — verifiers split, your call

### A. SC-MAIN shift padding on the available-crew strip — DECIDED: don't pad (owner, 8 Sep 26)
`raptor-port/src/engine/avail.ts:27` — `personBusy` pads a standalone SC MAIN shift by the ~before/after kit time, but the rest of the engine treats a standalone SC shift as unpadded, so the available-crew strip may mark an SC occupant busy for a window ~90 min wider than the engine actually reserves. One verifier confirmed the widened window, one argued the padding is intended everywhere.
**Owner decision: DON'T PAD.** A standalone SC shift blocks only its real shift hours on the available-crew strip — no ~90 min kit buffer. Fix shape: remove the SC-MAIN padding branch in `personBusy` (avail.ts:27) for the standalone-shift case so the strip matches the rest of the engine (unpadded). Pin with a test: SC person on a standalone SC-MAIN shift shows free right up to shift start/end, not padded.

### B. "latest PUBLISHED" wording vs the code (your default-view feature)
`raptor-port/src/leavewar/engine/stages.ts:186` — among several *published* wars the code lands on the one with the **earliest** bidding start, but the docstring says **"latest PUBLISHED"**. The behaviour is deterministic and harmless; it's a **prose-vs-code mismatch**, not a functional bug. **Needs a one-word decision:** among multiple published wars, do you want the *earliest* or the *latest* — then I fix whichever half is wrong (the comment or the one line).

---

## Not bugs
No finding was rejected outright, and none of the ~196 verified rules failed. The medical trims, the leave/day charge maths, and the OIL ledger were read in full and hold.
