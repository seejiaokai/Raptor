# BRIEF — both providers read the two MONEY fixes (22 Sep 26)

`docs/bug-check-order.md` §4a: on money, BOTH providers read the finished code independently and
blind to each other, with the evidence sheet in their hands, and are asked what is MISSING as well
as what is wrong. Fable's copy was fired from the building session. **Codex's was not — the harness
refused the command that launches an autonomous agent.** This file is that brief, so it can be
fired by a session that has the permission, or by the owner.

Answer to `docs/superpowers/specs/2026-09-22-oil-jobs12-codereview-codex.md`. Change no code.

## What to read

`git show b034398`, `git show 351c600` (job 1), `git show eb28f2c` (job 2). The commit messages
carry the reasoning. Then `src/ui/inputedit.tsx`, `src/ui/oilmode.ts`, `src/engine/oilev.ts`,
`src/engine/oil.ts`, `src/engine/publish.ts`. Background: `docs/handpass/2026-09-21-oil.md` (§9
records a mis-diagnosis that nearly shipped) and `docs/superpowers/specs/2026-09-22-oil-fixplan-settled.md`.

## What the fixes claim

**Job 1** — a request handed to another man paid him nothing, silently. The cause was NOT a carried
refusal: a decision is already keyed `person|item`, so the new holder's lookup simply misses. Three
steps took the money — `oilGate` priced the NEW draft against the OLD man's answers and reported
nothing to ask; `commitInputEdit` then deleted those answers; and the mode drew the silence with the
wording of a refusal. Five parts: the gate treats a person change as always stale and pre-loads no
ticks · `reassignInput` raises the question through the `pops.OILASK` hand-off instead of skipping
it · `clearOilPersonDecisions` drops the old holder's key on every LOADED day inside the same batch
· `oilEvidence` prunes a handed-over key at READ for unloaded weeks · `oilOffReason` splits one
sentence into three.

**Job 2** — a multi-day request answered yes for one day paid nothing. A request lands ONE row on
its FIRST day by design; eligibility looked for it on the day being PAID. Fixed by freezing the one
anchor row's standing onto the projected claim (`landedStanding` → `OilInputEv.stand`). A missing
row is disambiguated by whether the request's first covered day is loaded: loaded and rowless means
DELETED (earns nothing, pinned since R-2); not loaded means another week, so the claim stands.

## Answer these, in order

1. **Where is this WRONG** — a case where the new code pays a man who should not be paid, or fails
   to pay one who should. File, function, scenario, precise enough to write a test from.
2. **What did it BREAK elsewhere.** `oilEvidenceKey` now serialises `stand`, and that key feeds
   signature binding, the amendment delta and publication. Is there a state where a day that has
   not really changed now keys DIFFERENTLY and manufactures a pending amendment? **That exact shape
   was a real defect on this branch (§9), so look hard** at load, reload, stash/restore, plan switch
   and undo.
3. **What is MISSING** — another path that can change an input's person, or reprice an answered day,
   without the question being asked. The dialog and the drag are closed.
4. **The read-side prune** (`pruneHandedOverDecisions`). The claim is that it cannot touch an issued
   record, because `oilEvidence` runs only on the live day and mutates only the copy `clone()` makes.
   Verify or refute from the code.
5. **The stated limit** — an anchor row CANCELLED in a week nobody has loaded reads as `elsewhere`,
   so its other covered days still pay. Acceptable, or must it close now? If it must, say exactly how.
6. **Explicit negatives** — what you checked and found clean.

Rank by what each costs a real squadron. Mark each NEW / KNOWN / DISAGREE. Give exact step-by-step
repair instructions per finding — the function, the call site, and the test that should be red
first. Do not re-litigate the two bugs; both were reproduced in the running app.
