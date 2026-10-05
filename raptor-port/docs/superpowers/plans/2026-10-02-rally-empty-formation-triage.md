# Rally: empty-formation first-crew advice — bounded triage

Author: Astra, 2 Oct 2026. Evidence documentation only; no final code inspection, code approval, production change or new owner ruling. Sol accepted the scoped disposition below as an existing explicit query limitation and will declare it in the evidence/reviewer brief and file its completeness gap. This does not mean the owner accepted the limitation.

## Coordinates and source pointers

Baseline: `9cc5d4ff`. Observed repaired source: `c767f243dc1bd58415c9aa1f7574d8ba9bb81f19161ed0eb36c7db26a9e24786`; built bundle prefix `be356`. Runtime observations below were supplied by Sol; Astra did not repeat the browser walk.

- Baseline `src/engine/validate.ts`, comment immediately before `restIfPlaced`: the hypothetical leg is cloned from a same-formation sibling; an empty formation answers null and the drop delta catches the breach after the write. The function explicitly returns null at `if(!sibF||!sibE)return null;`.
- Current `src/engine/validate.ts:1902` describes the same sibling contract; `:1923` retains that exact null guard.
- Baseline and current `src/engine/runtrace.test.ts:218`: **“an empty formation has no sibling leg to clone and answers null; a duty key bears no crew rest”**. It authors a late Tuesday flight, clears both crew seats of every aircraft in the Wednesday formation, validates, and expects the Wednesday hypothetical rest query to return null.
- Current `src/engine/avail.ts:420`: the direct `restClear` check is inside the SC branch. Ordinary flight reaches `crossDayIfPlaced` separately. `slotRules.sansStart` supplies the SANS window, not a substitute rest-probe result.
- `docs/engine-rules.md`, §The run trace / The pre-drop question, describes sibling cloning but also says the query “can never disagree” with the post-drop flag. That general statement exceeds the explicit empty-formation exception.
- `.claude/rules/decisions/scheduler.md` D47 and its complete row in `.claude/decisions-full/scheduler.md`: tapping an empty cockpit seat asks who can fly that seat, including crew rest; the ruling addresses placeholder refusal and the distinction from general availability. It does not expressly decide the sibling-free hypothetical calculation.

## Reported runtime observation

Monday ground commitment22:00–Tuesday02:00; empty Tuesday; Wednesday ordinary formation TO10:00, B07:40, IN11:00. The reporting instruction resolves to Tuesday11:00 (`-780`). Before the formation has any crew, Ranger's hover/slot advice has no rest hint, although `sansStart` is `-780`. First actual placement produces the correct nine-hour CREW_REST breach. Remove Ranger and assign Anvil to another crew seat: Ranger's hover now says crew rest is not clear until14:00.

Baseline has no hint both before and after adding the sibling in this particular two-authored-date fixture. Its first placement also misses the nine-hour breach because of the old reporting/predecessor defects. Therefore that fixture alone does not establish the ordinary baseline first-occupant contract; the explicit baseline source and pinned test above establish it.

## Complete bounded disposition — original response retained verbatim

**This is an explicitly preserved baseline limitation of the pre-placement query, not evidence that an empty formation is exempt from crew rest.** The new runtime case exposes that limitation more clearly; it does not establish a Rally regression.

Baseline `9cc5d4ff` contains both:

- The `restIfPlaced` contract: it clones a same-formation sibling; an empty formation returns `null`, with the drop delta catching the breach after assignment.
- A dedicated test, **“an empty formation has no sibling leg to clone and answers null; a duty key bears no crew rest”**, which empties the Wednesday formation and expressly expects no answer.

That explains the observed transition:

1. Empty formation: no sibling-derived hypothetical leg, so no rest hint.
2. First assignment: the real leg exists; validation correctly finds 9h rest.
3. Another crew member remains: a sibling exists, so Ranger’s hypothetical placement now reports clearance at14:00.

`slotRules.sansStart = −780` does not contradict this: that value supplies the SANS window. Ordinary-flight crew-rest advice uses the separate hypothetical query. The direct REST-map check in `slotBar` is for SC.

**Disposition:** retain the current implementation for this bounded repair, but explicitly record **“empty-formation first placement has no predictive crew-rest hint; the committed placement is checked.”** Do not describe the picker as universally agreeing with post-drop warnings. The guide’s “can never disagree” sentence is broader than its own sibling-based implementation and pinned test.

D47 describes an empty-seat picker as checking crew rest, but does not specifically settle this first-occupant fallback. Therefore neither “empty means inactive” nor owner approval of the limitation should be claimed.

No further comparison is required to prove the baseline query contract. If the evidence needs an ordinary-case UI control, use only: Tuesday flight landing23:00, Wednesday normal08:15 report, empty Wednesday formation; compare hover before/after adding a different crew member. Baseline predicts the same missing-first-hint pattern. This is a targeted confirmation, not another walk.

A future completeness repair would build the hypothetical first leg through the shared day builder on a copied day, then use the existing rest probe—without duplicating report/brief/date arithmetic. That would deliberately replace the pinned empty-formation behaviour and needs its own scoped disposition and tests; it should not be smuggled into the current performance measurement.

No edits, runtime checks or final-code approval performed.

Rulings: none added.

## Archival limit

The “No edits” sentence above describes the original read-only triage. This subsequent authorized action only creates this report and runs the document check. Production source, tests, the original bound plan and reviewer reports are unchanged by this author.
