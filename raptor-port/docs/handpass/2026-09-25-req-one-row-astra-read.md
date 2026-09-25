## 1. Findings, ranked

No concrete production defect found in commit `8fc6dba2`.

I therefore have no NEW/OLDER severity or fix entry to report. The implementation consistently applies D174 through `filingSame` and D175 through `rowsLeftOut`/`leaveRowsOut` at both whole-day replacement functions.

Verification limitation: the focused test file could not start because Vitest/jsdom attempted to create a temporary directory in the read-only sandbox and received `EPERM`; zero tests executed. I did not treat the evidence sheet’s prior results as independently rerun.

## 2. Roll-call rows I would add

| surface / door | scenario and expected result | assessment |
|---|---|---|
| Plans editor modal’s **Select** button | Move a two-day request from Monday to Tuesday, then select Monday’s older plan through Edit Schedule → Plans → pencil → Select. The row must remain only on Tuesday; the toast and Edit history must name the left-out request. A Monday row or missing sentence disproves correctness. | Missing from §3’s roll-call. `DraftsModal.tsx` correctly calls `board.ts: switchDraft`, which supplies the same filtering, sentence and log entry. Add a rendered click test for this distinct door. |
| Warning list, puck rings and availability palette | After the load/switch, revalidation must see only the resulting programme rows: D174’s dormant request must flag nothing, while D175’s still-accepted request must not acquire a second row-derived tasking. An extra clash, busy mark or ring disproves correctness. | `afterSchedMutate` runs `validate()` after every production load/switch. No missing call site found, but this downstream surface is absent from the roll-call. |
| Weekend/holiday OIL presentation on the week and board | Repeat D175 across OIL-earning days. The left-out day must not display a second request row, puck or request-row OIL control; the surviving day must retain its proper indication. A second visible earning item disproves correctness. | The result is derived from the filtered live `DAYS` object through `oilev.ts`; `liveDay` strips frozen evidence before recalculation. The evidence sheet itself classifies money as affected but omits this surface from §3. |
| Leave War OIL credit after publication | A load or plan switch must not alter an already-issued credit. After the corrected working copy is signed and published as the next AL, the latest issued snapshot must produce the appropriate credit without duplication. A pre-publication movement or two credits disproves correctness. | `leavewar/sync.ts: desiredOilCells`/`runOilPass` reads issued snapshots, not the working copy. No defect found, but this is the money downstream consumer missing from the roll-call and the focused tests. |
| Schedule CSV/PDF export | Export after a load or plan switch. The linked ground row must appear on only the day where it remains. Two exported rows disprove correctness. | Export reads the resulting model directly. No missing writer found; the output surface was not enumerated or specifically tested. |

## 3. Explicit negatives

- I checked the least-shared door first: the Plans editor’s Select button. It reaches the shared `switchDraft` path; I found no bypass.
- I checked all other production doors: the week and board plans menus, both draft-preview banners, and both issued-version Load banners. I found no unfiltered whole-day replacement.
- I checked D174’s three consumers—`filingDelta`, `filingRestorePlan`, and `filingKey`—and the shared pending/signature comparison. I found no disagreement between the visible count, publish eligibility, load behavior and sign-offs.
- I checked the load confirmation and its “already at this version” shortcut. `dayDiscardCount` measures the filtered incoming day, and the shortcut is suppressed when a request row must be left out.
- I checked live days, issued snapshots, parked plans, request filing state, pending items, sign bindings, undo snapshots, persistence and Edit history. I found no missing production write epilogue.
- I checked repeat and order-sensitive cases: load versus plan switch, published versus unpublished plans, a real unrelated edit, leaving and returning to a filtered plan, repeated loads, and undo/redo. I found no route that recreates the second row.
- I checked role and overlay gates. Members cannot invoke the writers; the admin’s week, board, preview banner and Plans modal all reach guarded production paths. Protected weeks remain inert.
- I checked View-only’s issued face and working-copy peek. The issued document remains frozen until publication; the working-copy view reads the filtered live day.
- I checked the recorded dispositions for G1, G2, G3, G4, S9, S11 and S13 and found no reason to reopen or re-report them.
- I did not report migration or compatibility concerns whose only harm would be in stored demo data.
- I reviewed the pinned commit, not the concurrent working-tree edits that appeared during this read. I did not open either peer reviewer’s `req-one-row-*-read.md` report.
- Per the brief, I ran no build, full suite, browser test or server. The one permitted focused test attempt executed zero tests because the read-only environment blocked its temporary-directory creation.

