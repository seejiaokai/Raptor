# [OIL-AWARD-ADD] / N16 — an award and a worked day ADD UP. Design brief, 21 Sep 26.

> **The ruling (owner, 21 Sep 26).**
> "Yes an award and a worked day add up. So it's 4. The auto oil credits don't get affected by
> manual OIL inputs."

A 3-day award on a Saturday the man then works is worth **4** — the award's 3 plus the day's 1.
The two are INDEPENDENT: what the published schedule earns is never changed by what a person
typed, and what a person typed is never changed by the schedule.

Source of the task: `OUTSTANDING.md` §[OIL-AWARD-ADD], which lists six pieces. **This brief adds
two more that the six missed, and one of them is the highest-risk thing in the change** (§A below).

---

## 1. The model change, in one line

Today a person/date holds **at most one OIL credit**, and when the schedule earns one on a day that
already holds an award it **takes the award over in place**, stashing the award in a `manual`
snapshot so an unpublish can hand it back.

Under N16 a person/date holds **at most one EARNED credit and at most one AWARD, side by side**,
each keeping its own worth, reason and giver. Nothing takes anything over, so the whole
take-over-and-hand-back machinery retires.

The engine is already ready: `dayView.earnsOil` sums across every credit on the day, and
`dayView.duty` asks `.some(c => c.kind === 'credit' && c.auto)`. The work is in the record rules,
the store, the sync pass, the OIL tracker and one sheet.

---

## 2. THE TWO PIECES THE WRITTEN PLAN MISSED

### A. The load check would REJECT a day holding two credits — and a rejection wipes the war

`engine/warrecs.ts listProblem()` returns `'two credits'` the moment a list holds more than one,
and `readRecs()` returns **null** for the whole war when any address fails it. The store's caller
then **re-seeds the war blob** ("reset, don't migrate: an old-shape blob is replaced, never
half-read").

So shipping the six written pieces alone would mean: publish a worked Saturday over an award → two
credits are written in memory and look right → **on the next reload every bid, every award and
every credit in that war is destroyed, silently.** That is the same class of defect as the two
silent balance bugs of 20–21 Sep, and it is bigger than either.

`putList()` does not run `listProblem` — only the load path does — which is exactly why it would
pass every in-memory test and fail only after a restart.

**Fix: the invariant becomes "at most one `auto` credit and at most one `manual` credit".**
Not "any number of credits": the bound is what stops a runaway pass from minting a pile of records
on one day, and it keeps "the day's earned credit" and "the day's award" each addressable as ONE
thing, which every writer below relies on.

`listProblem`'s message splits into `'two earned credits'` / `'two awards'`.

### B. An award would start wrongly flagging leave on the Inputs page

`inputgate.ts` (the "leave over recorded work is filed and flagged" note) takes **every** credit on
the day as evidence the man was working. That is safe today only because an award and an earned
credit cannot coexist.

The owner's N13 ruling of 20 Sep 26 is that **an award owes a man a day; it does not say he was at
work** — which is why `forbiddenPair` already exempts a non-`auto` credit outright, and why
`dayView.duty` counts only `auto`. The Inputs-page note is the one place that never got the memo,
and N16 is what makes it visible.

**Fix:** that loop filters to `oil === 'auto'`. Without it, filing leave on a day carrying an award
would tell the filer "X is recorded as working on that day" when nothing of the sort is recorded.

---

## 3. LEGACY RECORDS — days already taken over

Records already stored on the owner's device carry the old shape: one `auto` credit with a `manual`
snapshot riding on it. Under the new `ingestDutyCredit` that record reads as the pass's own
ordinary credit, so **the next pass would rewrite it and drop the snapshot — destroying the award
silently.** This must be handled, not ignored.

**Decision: split, don't hand back.** One exported helper in `warrecs.ts`:

```
splitTakenOver(list) -> list
```

An `auto` credit carrying `manual` becomes TWO records: the pass's own credit (snapshot dropped)
and the award restored exactly as the admin typed it (code, note, givenBy, days, spans), with a
fresh id. Called from three places, one body so they cannot drift:

1. `readRecs()` — heals every stored war once, at load, before `listProblem` runs.
2. `ingestDutyCreditImpl()` — heals an in-memory war the load path never touched.
3. `clearRaptorCell()` — split first, then remove the `auto` credit. The award is simply left
   standing, which is what the bespoke hand-back was for. **The hand-back retires.**

`readRec()` keeps PARSING `manual` (so a stored snapshot survives to be split); nothing writes it
any more.

This is the one place the project's "reset the demo data, don't migrate" rule does not apply: these
are not demo-only records, they are the owner's own persisted balances, and the cost is ~15 lines
against a silent loss of days.

---

## 4. THE SIX WRITTEN PIECES, settled

### 1. `ingestDutyCredit` writes BESIDE, never over

`had` becomes the day's **`auto`** credit only. A day's award is invisible to this function. The
`manual` snapshot is never written; the `kept`/`snap` block and the max-of-the-two `days` carry-over
both go. The return value keeps its three answers — `'confirmed'` when nothing changed,
`'written'` when it wrote, `'clash'` when the day needs a human.

Note the `same` short-circuit must lose its `!had.manual` clause with the snapshot.

### 2. `setManualCredit` stops refusing

Delete `if (had && had.oil === 'auto') return 'That day already earns OIL from the published
schedule'`. `had` becomes the day's **`manual`** credit only, so re-typing an award replaces the
award and leaves the earned credit alone. Same in `setCell` (the grid's FO/HO write) and in
`cellProblem` (the refusal-message twin, which must not drift from `setCell`).

### 3. The reverse sweep removes only the app's own credit

`clearRaptorCell` already targets `oil === 'auto'`; with the hand-back gone it is a plain removal,
and the award is untouched by construction.

### 4. The OIL tracker lists ONE ENTRY PER CREDIT

`oilLedgerFor` currently takes the FIRST credit on the day for the reason/giver/hours and pairs it
with the DAY's summed `earnsOil` — so two credits would render as one row worth 4 days, reasoned
and attributed from whichever record happened to be first. It becomes a loop over the day's
credits, each with its own worth.

- ids: `auto:${wi}:${date}` for the earned credit, `award:${wi}:${date}` for the award. Stable,
  distinct, and they sort earned-before-award on a tie, matching the box.
  **This changes the testid of a hand-typed credit's row** (today it is `auto:…`), so the existing
  tracker tests move with it — a deliberate edit, listed here so it is not mistaken for breakage.
- the per-credit worth comes from a new shared helper (see §5).
- `hours` stay on the earned credit only; `days` on the award only. Both already true of the data.
- the reason editor keys by credit id rather than by date.

### 5. The day window and the tap list read back both

Worth knowing before touching this: **a day holding two records always opens the TAP LIST**, never
the day window — `listOpen` is true whenever the corner mark is not empty, and two records make it
`+1`. So the day window physically cannot be shown a second credit. The work is in `DayList.tsx`:
its per-record lines are already derived from `view.all` and need no change, but the three-line
"Reason / Given by / Days" block at the bottom reads `raw.find(kind === 'credit')` and must become
one block per credit, each labelled so the reader can tell the earned day from the award.

`BidPicker`'s `creditShown` prop stays singular, correctly: it is only ever reached on a
single-record day.

### 6. The grid cell holds one code — the app's own

Two credits both sit at ladder level 3. The existing tie-breaks would put the **award** on top,
because an award has no work times and therefore reads as a full day while an earned credit usually
does not — the opposite of what the owner asked for, and worse than cosmetic: the main record
decides whether the cell reads as owned by the schedule (`projRecord` → `source: 'raptor'`), which
is what locks it and what greys it.

**Fix:** one tie-break in `compareContrib`, immediately after the ladder and before the full-day
rule: between two credits, the `auto` one wins. The earned credit shows; the award sits behind
`+1`, which is how the app already shows a day carrying more than one record.

---

## 5. One formula for what a credit is worth

`days ?? (code === 'FO' ? 1 : 0.5)` is currently written out in `dayview.ts` (summed), in
`DayList.oilDaysText`, and in `BidPicker.creditDays`, and the tracker reaches the same number a
fourth way through `v.earnsOil`. With two credits on a day the tracker needs it PER CREDIT, so the
fourth way stops working.

Extract `creditWorth(c: { code: 'FO' | 'HO'; days?: number }): number` into `engine/warrecs.ts` and
have all four read it. One formula for one fact — the house rule that caught the two `MAX_GIVEN_BY`
literals.

---

## 6. What this does NOT change, deliberately

- **Manning and duty.** `dayView.duty` stays `.some(auto)`. An award still does not stand a man
  down from flying and still does not count him on the duty manning (N13, 20 Sep 26).
- **Flagging.** `forbiddenPair` already exempts an award. An award beside leave is not amber; an
  earned credit beside leave still is. Unchanged.
- **The negative balance.** Still allowed (owner, 20 Sep 26 — "it's ok to go negative OIL").
- **`oilCreditBidAgainst`** (the unpublish warning). It already asks only whether an `auto` credit
  landed and subtracts that credit's own worth. Under the takeover it was subtly wrong — the
  balance held the award's 3 and it subtracted 1 — and N16 makes it right with no edit.
- **The weekend/PH restriction** belongs to the AUTOMATIC pass alone. A hand-typed award may be
  given on ANY day (owner, 20 Sep 26). Unchanged.

---

## 7. The rulings this build must be held against (standing order: the rule sweep)

| Ruling | What it says | Where it bites here |
|---|---|---|
| **N16** (new, 21 Sep 26) | an award and a worked day ADD UP; the two never affect each other | the whole change |
| **N13** (20 Sep 26) | an award owes a man a day; it does NOT say he was at work | §2B, and `duty` staying `.some(auto)` |
| **B1** | one person/day holds several records; the box shows one, the rest sit behind a count | §2A's relaxed invariant, §4.6's ordering |
| **B9** / Ladder | what the box shows, top first | §4.6 — the new tie-break lives inside it |
| **B4** (as set aside 20 Sep) | the credit LANDS even over leave; the day is flagged, not refused | unchanged; the award exemption sits above it |
| **B8 / Q7** | an earned credit carries work times; none means the whole day | hours stay on the earned credit only |
| **design §18 OA3-003** | a hand-typed credit is never destroyed by the pass | §3 — now honoured by not touching it at all, instead of by a snapshot |
| **owner, 20 Sep 26** | OIL may be credited by hand on ANY day | unchanged |
| **`newest-instruction-wins`** | the later ruling wins; fix the stale text in the same change | the takeover comments in `store.ts` and the "keeps the larger of the two" note in `OUTSTANDING.md` are now history and must be rewritten, not left |

No clash found between N16 and any live ruling. N16 **supersedes** the 21 Sep "keep the larger of
the two" reading, which was only ever a safe holding position pending this decision.

---

## 8. Test plan (test-first)

Written and failing before any implementation.

**The ruling itself**
1. A 3-day award on a Saturday, then the Saturday published with the man on a desk → the day is
   worth **4**, and the OIL tracker shows **two** entries, 3 and 1. (N16)
2. The reverse order — the Saturday published first, then the award typed on it → also 4. The same
   two facts must not be kept or lost depending on which was entered first.
3. Unpublish the Saturday → the earned 1 goes, the award's 3 stands, untouched in code, reason,
   giver and days. (design §18 OA3-003)
4. Clear the award by hand → the earned 1 stands.

**The invariant (§2A) — the silent one**
5. A war holding an earned credit AND an award **survives a save/load round trip**: `readRecs`
   returns it rather than null, and the balance after the reload is still 4.
6. Two `auto` credits, or two awards, on one address still reject.

**Legacy (§3)**
7. A stored `auto` credit carrying a `manual` snapshot loads as **two** records, worth the sum, and
   the award's own words survive.
8. The OIL pass run over that healed day writes nothing new and destroys nothing.

**The flagging (§2B)**
9. Filing leave on a day carrying only an award produces **no** "recorded as working" note, and no
   amber.
10. Filing leave on a day carrying an earned credit still produces the note and the amber.

**The box and the sheet**
11. The cell shows the earned credit's code with a `+1` mark; the tap list reads back both, each
    with its own reason, giver and worth.
12. A day carrying only an award still opens and reads exactly as it does today.

**Manning (N13)**
13. An award beside an earned credit does not double-count the man on the duty manning; an award
    alone still leaves him available.

---

## 9. Order of work

1. `warrecs.ts` — the invariant, `splitTakenOver`, `creditWorth`. (The load path first: nothing
   else is safe until a two-credit day survives a reload.)
2. `dayview.ts` — the credit tie-break; `earnsOil` reads `creditWorth`.
3. `store.ts` — `ingestDutyCredit`, `setManualCredit`, `setCell`, `cellProblem`,
   `setCellDays` / `setCellGivenBy` / `setCellNote`, `clearRaptorCell`.
4. `inputgate.ts` — the `auto`-only filter.
5. `oiltracker.ts` — one entry per credit.
6. `DayList.tsx` — one detail block per credit.
7. The register (N16), `rulecheck`, and the stale comments named in §7.

---

## 10. Risk register

| Risk | Why it is serious | What holds it |
|---|---|---|
| The load check wipes a war (§2A) | silent, total, and only after a restart | test 5 — a real save/load round trip, not an in-memory assertion |
| A legacy taken-over record loses its award (§3) | silent, on the owner's own live data | tests 7–8 |
| The tracker double-counts or halves the day | the whole point of the ruling is the number | tests 1–2, and `creditWorth` being the only formula |
| The award becomes the main code | the cell stops reading as the schedule's | test 11 |
| An award starts flagging leave (§2B) | it would look like a bug in N13, not in this change | tests 9–10 |
