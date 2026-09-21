# [OIL-AWARD-ADD] / N16 — design review log

Cross-provider red team of `2026-09-21-oil-award-add-design.md`, run BEFORE any implementation.
Reviewers read the brief, CURRENT-STATE, OUTSTANDING §[OIL-AWARD-ADD], the red test file and the
code. One round, per the standing cap on design-review rounds.

---

## Round 1 — Fable

**Verdict:** the two-records model is sound. Build with the changes below. One BLOCKER.

### F1 — BLOCKER. ACCEPTED, verified in the code.

**The brief's legacy split was written against the WRONG stored shape, and would have doubled every
taken-over award.**

`ingestDutyCreditImpl`'s `kept` block (the 21 Sep "keep the larger of the two" fix) writes the
award's `days`, `note` and `givenBy` **onto the `auto` record itself**, as well as into the `manual`
snapshot:

```ts
const kept = { ...rec, manual: snap,
  ...(snap.days != null ? { days: Math.max(snap.days, code === 'FO' ? 1 : 0.5) } : {}),
  ...(snap.note ? { note: snap.note } : {}), ...(snap.givenBy ? { givenBy: snap.givenBy } : {}) }
```

So a taken-over 3-day award is stored as ONE record carrying `days: 3` twice over. The brief's
split — "the pass's own credit, snapshot dropped" + "the award restored from the snapshot" — hands
the 3 to BOTH records. The Saturday reads **6**, the tracker shows two rows both saying
"+3 · OC Ops · Exercise recovery", and `creditGiver`'s "a name always wins" branch labels the
schedule's row with the admin's name so nothing on screen distinguishes them.

On an ordinary date the next pass rewrites the auto half before the first paint, so it is invisible.
On a **PROTECTED** date — an unreadable stash, an unsupported book, an approved day whose snapshot
is gone — both halves of the OIL pass deliberately skip the address and the 6 never heals. That is
the identical shape to the `via` defect Astra found on 21 Sep.

**The red tests would not have caught it**, because the §4 fixture puts `days`/`givenBy` only inside
`manual`, which is the PRE-21-Sep shape, and asserts the auto half with a `toMatchObject` that
passes with `days: 3` still riding on it. Verified by reading `store.ts` 3262–3270 and
`warrecs.ts` 260/264 — `readRec` reads `days` and `givenBy` for BOTH kinds, ungated.

**Fix, accepted whole:**
1. `readRec`: read `days` and `givenBy` only when `oil === 'manual'`. The type doc already says
   "Never set on an automatic credit" — the trust boundary now enforces it.
2. `splitTakenOver`: the auto half keeps only `id, code, oil, via, spans, note` — and the note is
   DROPPED when it equals `manual.note`, because the takeover copied it from the award. On a
   protected date that leaves the schedule's row reading "weekend duty" rather than the award's
   words, which is the honest answer.
3. `creditGiver`: delete the "a name always wins" branch. An `auto` credit never carries a name
   under N16, so the branch is dead; leaving it would attribute the schedule's row to an admin.
4. Rewrite the §4 legacy fixture to the real 21-Sep shape.

### F2 — MAJOR. ACCEPTED.

Tests the brief did not list that will go red, each with a specific right answer, so nobody weakens
one to green: `creditdoor.test.tsx` 84 / 311 / 320 / 330, `scenarios-bughunt.test.ts` 420–458,
`oilsync.test.ts` 256, and the tracker's `auto:0:…` ids.

The trap named: `creditdoor` 320 clicks the cell and reads `oil-detail-why`. On a two-credit day the
cell opens the TAP LIST, and one block per credit puts two of that testid in the DOM, so
`getByTestId` throws. The easy wrong fix is `getAllByTestId(...)[0]`, which pins nothing. Per-credit
testids instead.

### F3 — MINOR. PART ACCEPTED, part FILED.

The tracker calls an award "earned" and, with no note, gives it the reason "weekend duty".

**Accepted (in scope):** the reason fall-back becomes `auto`-only. Two rows on one Saturday reading
"weekend duty" and "Weekend/PH" is a statement about a fact, and N16 is what puts them side by side.

**Filed, not built:** the `earned` / `granted` summary split (`oiltracker.ts` 283–286,
`counters.ts` 330 "earned by weekend/PH work"). A hand-typed war credit has counted as `earned`
since long before this change; N16 does not alter the per-credit classification, only how many
there can be. It changes a figure the owner reads, so it is his call, not a silent edit inside
another job. → `[OIL-EARNED-VS-GRANTED]` in OUTSTANDING.

### F4 — MAJOR as architecture. FILED, deliberately not bundled.

**The award is a grant wearing a different coat.** After N13 and N16 a hand-typed award flags
nothing, stands nobody down, is never touched by the schedule, and adds to the balance — which is
exactly what the OIL tracker's ledger grant already does. The only differences left are where it is
stored and which editor reaches it. Two stores for one fact is the drift seam the house rules name.

This is the real architectural root cause, and the project's rule is to prefer it over a cascade of
small fixes. It is also a change that moves persisted balances and touches ~28 test files, so it is
its own escalated session, not a passenger on this one. → `[OIL-AWARD-IS-A-GRANT]` in OUTSTANDING,
with the shape Fable sketched (awards become ledger entries; the war DERIVES the FO/HO contribution
on read, the way absences are derived from Inputs).

### F5 — MINOR. ACCEPTED, with one departure.

The ingest-side split can heal in memory and then discard the healing: if the split makes the auto
half byte-identical to what the pass would write, `same` short-circuits and returns `'confirmed'`
**without** `putList`. The award exists only in a local variable — the day reads 1 for the rest of
the session and 4 after the next reload.

**Accepted:** heal with a `putList` BEFORE `had` is computed, not after.

**Departure:** Fable wanted the `clearRaptorCell` seat dropped as unreachable-and-untested. Keeping
it, because it is one line calling the same body and the objection ("an untested path") is answered
by testing it rather than by removing it. Three seats, one body, a test each.

### F6 — MINOR. ACCEPTED.

The split's new award id is `${had.id}a`, not `newRecId()`. `readRecs` must stay pure — a fresh
random id makes a double read of one blob produce different output, so the idempotency test could
only ever assert counts. Verified safe: no record id is persisted outside its own record.

### F7 — MINOR. Testids ACCEPTED; the rest is one line to the owner.

On a day holding both, the award's reason / giver / days can only be edited in the OIL tracker —
the tap list offers Clear only, and the day window never opens on a two-record day. The owner's
[LW-OIL-DETAIL] ruling asked for all three to be editable on an award. Met on a plain day, not on a
worked one. Raised with him; an "Edit…" chip on the list is a small follow-up if he wants it.

### F8 — NIT. ACCEPTED.

The brief's §4.6 named the wrong mechanism. An 08:00–18:00 credit touches both halves, so
`portionOf` calls it `'full'` too — the award wins on the EARLIER-START rule (0 < 480), not the
full-day rule. The tie-break the brief specifies is right; the words were wrong. Test extended with
a one-half credit, which is the case the full-day rule does decide.

### F9 — NIT. ACCEPTED.

Stale text the brief's §7 did not name: `CreditRec.manual`'s doc block, `creditGiver`'s comment,
`setManualCredit` / `setCellDays` / `setCellGivenBy` docs, `Matrix.tsx` ~3206, `BidPicker.tsx` ~101,
`bids.ts BidRecord.note`, `oiltracker.ts`'s header, and `docs/data-schema.md`'s WarRec row.
`newest-instruction-wins` makes fixing these part of this change, not a follow-up.

### Confirmed by Fable, no change needed

- §2A is real and TOTAL: `readRecs` null → `readWar` null → `readWars` null → `seedWars()` replaces
  **every** war, not just the offending one. The relaxed invariant is the right guardrail, and
  `putList` indeed never runs the check.
- The only blob that re-enters through a parser is `wars`. LW undo snapshots and the command layer's
  records are session-only and taken after load. No war import/export. The demo seed carries no
  snapshot.
- `oilCreditBidAgainst` becomes correct for free, as the brief claimed — and today it under-reports
  by the award's days and can warn falsely.
- Manning: `duty` is `.some(auto)`, `away` and `charges` ignore credits. No double count.
- FIFO / expiry / archive: two rows on one date sort earned-before-award, share an expiry, and
  archive independently.
- `inputgate` §2B: `vet()` is the only site; `sync.ts` 259 is a dead variable.
- Ordering: the tie-break fires only between two credits; single-record days are byte-identical.

---

## Round 1 — Astra (Codex)

**Verdict:** the two-records model is sound *as the transitional shape*. Build with these changes;
do not build the brief as written. The cleaner end state is the same one Fable named — the award is
a ledger grant — and it must stay its own approved build, not be smuggled into this one.

**The two reviewers, working independently, picked the SAME single highest-conviction silent
balance bug** (F1 / A1 below). That agreement is the strongest signal this review could have
produced, and the bug was in the BRIEF, not in the app.

### A1 — BLOCKER. Same finding as F1. ACCEPTED.

Independently reached, with the same arithmetic (3 + 3 = 6) and the same reason it never heals
(a protected date is skipped by both halves of the pass). Astra adds two details worth keeping:

- The split's award id must be **collision-checked**, not merely deterministic: `${id}:award`, with
  a numeric suffix if that id is already taken. `listProblem` rejects a duplicate id, and a
  rejection re-seeds.
- `readRec` must keep parsing the NESTED snapshot while refusing `days`/`givenBy` on the outer
  record. Both are needed: one to recover the award, one to stop the contamination.

### A2 — BLOCKER, and Fable missed it. ACCEPTED. **It is also a live bug today.**

**`setCell`'s FO/HO branch rebuilds the credit from scratch and keeps only `note` and `spans` —
`days` and `givenBy` are dropped.** Verified at `store.ts` 2090:

```ts
const rec = { id: had?.id ?? newRecId('c'), kind:'credit', code: clean, oil:'manual',
  ...(had?.note ? { note: had.note } : {}), ...(had?.spans ? { spans: had.spans } : {}) }
```

So **today**, changing a 3-day award's code from FO to HO on the grid silently takes it to half a
day and loses who gave it. Nothing on screen says so. N16 makes it worse (4 becomes 1.5) but does
not cause it.

**Fix:** find the `manual` record; change the code by cloning the whole record, and route it
through the atomic editor below so every door mutates an award the same way.

### A3 — MAJOR, and Fable cleared this very site. ACCEPTED, and it settles a disagreement.

`oilCreditBidAgainst` (the unpublish warning) measures with `balanceOf`, which sums `earnsOil`
across the wars and **knows nothing about expiry**; the tracker shows `oilBalanceOf`, which applies
it. Fable checked the arithmetic under the default policy and cleared it. Astra set an expiry
policy and broke it: an expired +5 still counts in `balanceOf`, so the warning stays silent while
the tracker reads zero and the unpublish takes the man to -1.

Fable's clearance was right for the default policy and wrong in general. **Astra wins.**

**Fix:** measure the displayed, policy-aware balance (`oilBalanceOf` through `figureCtxOf()`),
subtract the landed auto credit's own worth, warn below zero. In scope because it is a notice ABOUT
the credits this change moves, and because a warning that disagrees with the tracker is the exact
class of silent thing this whole job exists to remove.

### A4 — MAJOR, and Fable missed it. ACCEPTED.

**The brief's shared `creditWorth` helper would have created a circular import.** `warrecs.ts`
already imports from `dayview.ts` (line 21), so putting the helper in `warrecs` and having `dayview`
import it closes the loop — module init then depends on bundler ordering.

Astra also improves the signature: take the credit's OWNERSHIP, not just code and days, and make an
`auto` credit always worth its code. That is defence in depth against A1 — a contaminated auto
record carrying `days: 3` can then never be worth 3, whatever else goes wrong.

**Fix:** a leaf module `engine/credit.ts` importing neither, read by `dayview`, `warrecs`,
`oiltracker`, `DayList` and `BidPicker`.

### A5 — MAJOR. ACCEPTED, going further than Fable's "tell the owner".

The tap list labels **every** credit "OIL earned" — which for an award is false — and offers it only
a Clear. On a worked Saturday that leaves the award's reason, giver and days reachable only from the
OIL tracker, and the owner's live [LW-OIL-DETAIL] ruling says all three are editable on an award.

Fable raised this as a heads-up. Astra is right that it is more than that: **N16 is what puts awards
onto days where that ruling stops being honoured.** A change that makes a live ruling unreachable is
not scope creep to fix — it is the change's own consequence.

**Fix:** label automatic records "OIL earned" and hand-typed ones "OIL award"; one detail block per
record, testids carrying the record id; an Edit action on an award only, through the atomic editor.

### A6 — MAJOR. ACCEPTED, and it is a fair hit on the test file.

The brief's test plan says the owner's example asserts two tracker entries. **The tests as written
assert `earnsOil`, the balance and the raw record count — never the tracker.** A tracker that
collapsed both into one +4 row would pass. The legacy test also calls `readRecs` directly and never
exercises a protected `runOilPass`, which is precisely where A1 is permanent.

**Fix:** tracker tests (two entries, 1 and 3, distinct reason / giver / ids), a FIFO test (a later
debit takes the earned row first and leaves the award at 3), the real-shape protected migration
test, and the one-undo atomicity test.

### A7 — MAJOR. ACCEPTED.

**The OIL tracker's "one save" is three undo steps.** `saveNote` calls `setCellDays`,
`setCellGivenBy` and `setCellNote` in sequence — three commands, so one Undo reverts the reason and
leaves the balance changed; and a validation failure on the third leaves the first two committed.

`setManualCredit`'s own doc block already states the principle it breaks: "ONE command, so it is ONE
undo step: doing this as setCell + setCellNote + setCellHours would take three presses of undo to
take back one entry." The tracker's editor was built the way that comment forbids.

**Fix:** `editManualCredit(personId, date, recId, patch)` — resolve the record by id, validate every
field before writing anything, build one replacement, one `putList`. The tap list's new Edit action
uses the same door. The three single-field setters stay for their isolated callers.

### A8 — MINOR. PART ACCEPTED.

The demo's "earned" OIL is written `oil: 'manual'` — they are awards wearing the word "earned", and
under N13/N16 they behave as awards while the code around them says otherwise.

**Accepted:** rename the demo's local helper and its story so the code stops lying.
**Not accepted:** rebuilding them onto seeded published evidence so the pass mints real `auto`
records. That is demo data in the pre-promulgation phase, where the house rule is to reset rather
than migrate, and it would change what the owner sees on first run for no rule's sake.

### Astra's corrections to the brief, accepted

- **The brief overstated the moment of loss.** An invalid blob is re-seeded *in memory* at boot;
  storage is overwritten at the first later persist, not immediately. The loss is real and total,
  but the brief should say when.
- **The ordering mechanism, again** — same correction as F8, reached independently. The award wins
  today on the EARLIER-START rule, not the full-day rule.
- The auto-first tie-break must be **gated to two credits with different `auto` values**, or it
  changes ordering on days it has no business touching.

### Confirmed by Astra, no change needed

Manning cannot double-count (`duty` is a boolean `.some(auto)`; `away` and `charges` ignore
credits). `chargedDays` emits debits from leave, not credits. `readWars` is the only war-blob
parser. Undo snapshots are session-only and taken after load. No war import/export.
N13 beats Q7/B8 for a hand-typed credit; Q7/B8 survives for an attendance credit with no times —
and Astra found a SECOND stale fixture at `inputgate.test.ts` ~104 that the brief had not named.

---

## What the two rounds change about the plan

| # | Change | From |
|---|---|---|
| 1 | The split strips `days`/`givenBy`/the copied note from the auto half; `readRec` refuses them on an `auto` record; `creditGiver` loses "a name always wins" | F1 + A1, agreed |
| 2 | `setCell`'s FO/HO branch clones the award instead of rebuilding it — a live bug today | A2 |
| 3 | `creditWorth` goes in a new leaf `engine/credit.ts` and takes ownership, so an `auto` record is always worth its code | A4 |
| 4 | One atomic `editManualCredit`, used by the tracker and the new Edit action | A7 |
| 5 | The tap list labels the two kinds apart, one block per record, and an award is editable there | A5 |
| 6 | `oilCreditBidAgainst` measures the policy-aware balance | A3 |
| 7 | Tracker, FIFO, protected-migration and one-undo tests added; the legacy fixture rewritten to the real shape | F1 + A6 |
| 8 | The split id is `${id}:award`, deterministic and collision-checked | F6 + A1 |
| 9 | Two stale `inputgate` fixtures, not one | A confirmations |
| 10 | Demo helper renamed; the stale-text list of F9 | A8, F9 |

Filed, not built: `[OIL-AWARD-IS-A-GRANT]` (both reviewers, independently, as the real root cause)
and `[OIL-EARNED-VS-GRANTED]`.
