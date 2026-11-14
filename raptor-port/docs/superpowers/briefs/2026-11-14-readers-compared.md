# Two readers or one — Astra beside the fresh, blind Opus reader, compared (14 Nov 26)

His question (14 Nov 26, the terminal chat that ran the guide check): *"did having 2 reviewers help? is astra
enough?"* His answer to the recommendation below: *"Ok all as recommended"* → D2042, filed as [READERS-RECHECK-APP].

**How it was found:** one Opus helper (it split the work across four helpers of its own) read both reports of every
pair in this folder — 42 jobs, 7–14 Nov 26, where Astra and a fresh, blind Opus reader read the same work. Each
finding was matched as "both", "Astra only" or "Opus only", and each single-reader medium or high finding was checked
against what the job's records say was done with it. The host did not re-read all 84 files; this is the helper's
report, condensed by the host, its figures unchanged.

## The result

- **Both readers paid off.** About 124 findings came from both readers, about 116 from Astra only and about 250 from
  Opus only (Opus writes many more low ones).
- **Medium or high problems accepted as real that one reader alone would have let through:** about 70 if only Astra
  had read (more if one Opus line covering 19 missing tests is counted defect by defect); about 81 if only the Opus
  reader had read.
- **Each passed the other's real problems.** In about 15 of the 42 jobs, one reader looked at the very point the other
  raised and called it sound. One reader's "clean" is weak evidence alone.
- Single-reader mediums rejected or held on purpose: Astra about 8, mostly "the agent's reading stated as his rule"
  in the page trims; Opus about 2.

| Kind of job | Jobs | Missed if only Astra | Missed if only Opus |
|---|---|---|---|
| App code | 8 | 3 | 4 |
| Scripts | 5 | 7 | 11 |
| Plans | 2 | 8 | 7 |
| Rule documents and guides | 27 | about 52 | about 59 |

## What each tends to catch (only where the evidence shows it)

- **Astra:** the exact line — a guard that can be got round, two menus open at once, a newline or a code fence in a
  script; a test that checks less than it claims; a clause he approved word for word cut down to a headline; a later
  ruling of another area; it rates the same defect higher.
- **The Opus reader:** wider — contradictions between pages, process steps that cannot both be met, stale records
  beside a change, faults that a previous round's fixes brought in; it checks many more rulings and writes more noise;
  it tends to discount a fault older than the change.

## Limits

- One week, two-thirds of it rewrites of the rulings pages; only 8 app-code jobs, about 7 single-reader mediums —
  too few to rank the readers on app code, hence [READERS-RECHECK-APP].
- For document rewrites "real" mostly means "the host acted on it"; app-code findings were reproduced red-first and
  are firmer.
- Not like for like in a few jobs: Astra read a version that already carried Opus's fixes (rules diet step 3); the two
  read different commits (step 4); Sol also read two jobs; one brief carried the walk's summary.
- Some Opus reports are host-condensed, not word for word, and Astra could not run tests in the merge-once rounds or
  start a browser on the bid-sheet job — both make the counts lower, not higher.

## The pairs

Counts are both / Astra only / Opus only, all severities. A = Astra, O = the Opus reader.

| # | Job | Kind | Both / A / O | Single-reader medium or high (outcome) |
|---|---|---|---|---|
| 1 | rules-diet plan | plan | 4 / 3 / 15 | A 6 (1 high) — all fixed. O 7 (3 high) — all fixed |
| 2 | rules-diet step 2 | doc | 6 / 8 / 6 | A 4, O 2 — all fixed |
| 3 | step 2 switch-on | doc + hook | 0 / 1 / 9 | A 1, O 2 — fixed |
| 4 | step 3 | doc | 1 / 7 / 15 | A 5, O 7 — fixed (not like for like) |
| 5 | step 4 | doc | 4 / 4 / ~10 | A 4 (1 high, Opus passed it) — fixed. O 3: 2 fixed, 1 rejected (D1736) |
| 6 | board keys | app code | 3 / 1 / 3 | A: two menus open at once (Opus: "cannot coexist") — fixed |
| 7 | chat 19 checks | script | 1 / 4 / 7 | A 3 guard bypasses, O 2 — all fixed |
| 8 | chat 20 Tracker | app code | 0 / 0 / 1 | none |
| 9 | chat 28 not kept | app code | 1 / 1 / 1 | A: save-fail order (Opus: "reasonable") — fixed |
| 10 | chat 9 Tracker | app code | 3 / 1 / 5 | A: window off screen on resize — fixed. O: second click during the slide — fixed |
| 11 | checklist route 2a | doc | 0 / 0 / 0 | none |
| 12 | day start | app code | 2 / 1 / 0 | A: a zero-length flight stretches the work day — fixed |
| 13 | Insights leftovers | code + script | 1 / 2 / 2 | none medium or high |
| 14 | merge-once read | script | 2 / 4 / 5 | A 4 (2 high) — fixed. O 1 — fixed, its fix brought in a high |
| 15 | merge-once red team | plan | 9 / 1 / 4 | A 1 high, O 1 high — both taken |
| 16 | merge-once reread | script | 2 / 1 / 5 | A 1 high — fixed. O 3 high (regressions from round 1's fixes) — fixed |
| 17 | merge-once round 3 | script | 1 / 3 / 2 | A 3 (2 high; Opus had called one "not a finding") — fixed. O 1 — fixed |
| 18 | OIL earn board | app code | 1 / 0 / 5 | O 2 — fixed red-first |
| 19 | readers' rulings | doc | 1 / 1 / 8 | A 1 rejected. O 2 — fixed |
| 20 | design page trim | doc | 15 / 7 / 6 | A 3 fixed, 1 held, 1 rejected. O 1 held |
| 21 | IT guide trim | doc | 2 / 3 / 5 | A 2 not taken |
| 22 | OIL trim | doc | 3 / 1 / 5 | O 2 — fixed |
| 23 | People trim | doc | 6 / 5 / 5 | A 1 fixed, 1 removed rather than restored |
| 24 | Tracker trim | doc | 2 / 7 / 5 | A 1 rejected, 2 held. O 1 — fixed |
| 25 | step 4b | doc | 0 / 1 / 9 | O 3 — 2 fixed, 1 led to D1760; Astra passed all three |
| 26 | step 5a design | doc | 3 / 5 / 7 | A 5 (3 high, dropped clauses) — fixed. O 3 — fixed |
| 27 | step 5a IT guide | doc | 4 / 2 / 5 | A 2 (1 high) — fixed |
| 28 | step 5a People | doc | 1 / 5 / 8 | A 4 (3 high) — fixed. O 1 — fixed |
| 29 | step 5a OIL | doc | 1 / 5 / 11 | A 5 (1 high; Opus had listed two as whole) — fixed. O 2 — fixed |
| 30 | step 5a Tracker | doc | 2 / 5 / 8 | A 4 (1 high; Opus had called two whole) — fixed. O 1 — fixed |
| 31 | Inputs trial | doc | 2 / 5 / 10 | A 3 — fixed. O 5 (1 high, D1398) — fixed |
| 32 | Leave War page | doc | 4 / 8 / 15 | A 6 (tests weaker than claimed) — fixed. O about 11 (1 high, D1390) — fixed |
| 33 | merge-once round 4 | script | 1 / 0 / 1 | the high one found by both |
| 34 | scheduler page | doc | 13 / 2 / ~16 | A 2 — fixed. O 5 lines (2 high; one is ~19 test gaps) — fixed |
| 35 | Tracker trial | doc | 11 / 6 / 2 | A 6 — put back; Opus had listed all six as sound |
| 36 | design guide tighten | guide | 2 / 1 / 8 | A 1, O 1 — fixed |
| 37 | Leave War start load | doc + script | 3 / 2 / 5 | A 1, O 2 — fixed |
| 38 | night 3 guides | guide | 2 / 2 / 5 | A 1, O 1 — fixed |
| 39 | overnight tighten | guide | 1 / 0 / 4 | O 3 — fixed; Astra had called two sound |
| 40 | rules-diet follow-up | doc | 3 / 1 / 4 | A 1, O 1 — fixed; each had cleared the other's point |
| 41 | session-handoff tighten | guide | 1 / 0 / 2 | O 1 — fixed |
| 42 | bid-sheet styles | app code | 0 / 0 / 1 | O low-to-medium — fixed; he then chose the tighter spacing (D2039) |
