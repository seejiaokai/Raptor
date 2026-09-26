# Red-team brief — the `[POST-OUT-OUTCOMES]` plan, round 2 (a check of the fixes), 27 Sep 26

You reviewed this plan in round 1. The builder (Opus 5.5) has revised it. **This round is short and narrow.** Read-only —
do not edit any repository file except your one report file named at the end.

## Read

1. The plan: `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` — above all its last section,
   **"Round 1 — what changed"**, which wins over the text above it.
2. BOTH round-1 reports: `raptor-port/docs/superpowers/specs/2026-09-27-post-out-outcomes-redteam-r1-fable.md` and
   `…-r1-astra.md` (you may now see the other reviewer's).
3. The round-1 brief, for the files and rulings: `raptor-port/docs/superpowers/briefs/2026-09-27-post-out-outcomes-plan-redteam-brief.md`.
   Read code only where a fix below needs checking.

## Answer only these

1. **Each round-1 finding (both reports):** is it fixed correctly by the Round 1 section — yes / no / partly — with one
   line of why. For a no or partly: the exact fix.
2. **New defects the fixes introduce.** In particular: (a) the delete's cutoff is now the APP's today (the scheduler's
   notional `TODAY`, 13 Jul 26 in the demo) while the posting pass fires on the wall clock — is any order of events wrong
   because of the two clocks (a PO dated between them; a hand delete; the OIL pass; the Leave War records)? (b) the callsign
   index now holds only roster people and placeholders — does anything that used to resolve an archived man by callsign
   (the approve note, Restore, the Leave War's projection, the Tracker bridge, `rosterMatch`, imports, the reference
   harness) now break? (c) the undo/redo REFUSAL — can it trap him (an Undo stuck forever behind a refused entry)?
   (d) the belt in `applyWeekModel` / `initStore` running before the baseline — can it make a published day read pending
   on load, or fight the per-week stash's "pristine weeks are not stashed" rule?
3. **Is any of the seven questions for him mis-stated, or is a default wrong to build before he answers?**

Do not re-review what round 1 already covered and the Round 1 section fixed. No new scope. The same exclusion as round 1:
harm living only in data already stored, when the code is correct going forward, is not a finding (D56).

End with a verdict — **APPROVE / APPROVE WITH CHANGES / REVISE** — and, for anything other than APPROVE, the exact
changes, numbered.

## Your report

Write it — and only it — to `raptor-port/docs/superpowers/specs/2026-09-27-post-out-outcomes-redteam-r2-<you>.md`.
