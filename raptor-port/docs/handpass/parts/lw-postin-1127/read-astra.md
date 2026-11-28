Found **two issues in the committed version**. I changed no files. Later uncommitted edits appeared during the review; they are excluded from this report.

**F1 — P2: Five leave kinds never visibly say “Not typed”.**

Locations: [PersonWindow.tsx:293](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/PersonWindow.tsx:293), [BalancesPage.tsx:405](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/BalancesPage.tsx:405), and its desktop equivalent at line 426.

- **Failure:** Add a person → leave CCL, FCL, PL, EL and CL untyped → open either balance surface. Editable balances are blank; read-only balances are dashes. Even with pending leave, the person window’s War bal is a dash. Only LVE visibly says “Not typed”.
- **Expected:** D2746 explicitly requires “Not typed” for every kind. Hover text and an accessible name do not provide that visible sign, particularly on a phone.
- **Cause:** The visible wording exists only in LVE’s rendering branch. Other kinds use blank inputs or dash-only readouts.
- **Fix:** First draw the missing per-kind treatment. Then render the visible amber wording whenever that kind is untyped, including when nothing is pending. Retain editing where permitted. Test each kind independently, with LVE already typed, in editable and read-only forms; typing zero must replace the status with zero.
- **Confidence:** High from source inspection. No browser appearance check was performed.

**F2 — P2: First typing can silently invent carried-forward leave.**

Location: [balancefigs.ts:35](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/balancefigs.ts:35), in the committed version.

- **Failure:** Add a person and assign Junior pilot in 2026 → never type his balance → reach January 2028 → type Official bal **24**, leaving the previously blank carried-forward box alone. The save records **24 including 24 carried forward**. With no intervening leave, January 2029 produces **33**, rather than **57** with carried forward initially zero.
- **Cause:** The hidden calculation has accumulated 33 carried-forward days, although the balance remains “Not typed”. The shared save helper copies that hidden `k.cf` into the first real balance.
- **Expected:** An untyped carried-forward amount must not silently become part of the first typed figure.
- **Fix:** When saving the first Official balance, use zero instead of `k.cf`; retain the existing clamping and preservation for an already-typed balance. Add regression tests through both entry surfaces, then cover the following January and Undo/Redo of that first save.
- **Confidence:** High. Reproduced using the actual calculation and save helper in memory, with a substituted store boundary. This can arise entirely from newly created data.

**Coverage — specialised surfaces first.** These are source-trace results, not claims of a completed browser walk.

| Object or surface | Visible sign and working gesture | Result |
|---|---|---|
| Hidden SANS person | My leave, hidden-person Approvals/bell route → person window; permitted balance boxes still work | Stored posting dates now reach the calculation |
| Returning person, including multiple overseas gaps | Restore asks the post-in date; previous leave remains visible | Every gap before the current stint is excluded; earlier stints count |
| Small leave tiles and columns | Each kind’s untyped status; type its own figure | F1 |
| First Official balance after automatic year changes | Blank boxes → first typed figure | F2 |
| Person window over Grid, Balances or Approvals | Same balance tiles; Enter/blur saves, Escape abandons typing | Shared rendering and save path traced |
| Balances, phone and desktop | Editable own/admin rows; read-only other/locked rows; one instruction above rows | Both renderers carry the new state; F1/F2 apply |
| Grid and phone’s frozen names | War bal beside the name; tap opens person window | Both use the same updated answer |
| My leave | Current balance; tap opens own window | Updated balance reader traced |
| Approvals | Balance of the requested leave kind; approval actions | Updated reader traced |
| One-day and picked-range bid window | “Left” figures and below-zero question | Shared calculation and untyped suppression reach both |
| Drag-selection window | Per-person question for the selected block | Same suppression; typed people still qualify |
| Typed balance, snapshot and storage | Save through either balance box; history records the change | Snapshot writer, validator, persistence and replay traced |
| Posting controls and account doors | New person/request approval, Post in, Post out, Archive and Restore | Posting records and cache invalidation traced |
| Roles | Admin any eligible row; member own unlocked row | Ownership, lock-at-save and squadron checks traced; retired guest has no authority |
| OIL, MED and usage counts | Existing tracker/count displays | OIL remains separate; usage counts are not treated as balance deductions |

**Ranked failure scenarios checked or retained for the host’s walk:**

| Rank | Setup → action | Expected; observation disproving correctness |
|---|---|---|
| 1 | Hidden SANS man, post-in 7 Dec, typed 24 → add leave on 2 Dec; show/hide SANS | Balance stays 24; any change caused by visibility fails |
| 2 | Two overseas gaps → add/delete leave in either gap and an earlier stint | Gap leave changes nothing; earlier-stint leave counts |
| 3 | Untyped balance with two annual rollovers → first type 24 | No invented carried forward; **F2 reproduced** |
| 4 | LVE typed, each other kind untyped → inspect both surfaces | Each kind visibly identifies its untyped state; **F1 confirmed** |
| 5 | First type zero → Undo → Redo | Typed zero → untyped → typed zero; snapshot and history restored with the record |
| 6 | Member starts typing → admin locks → save or replay | Refused without changing the balance |
| 7 | Type 24 before/after pre-post-in leave; move arrival across that leave | Pre-post-in leave never deducts; snapshot and current charges remain consistent |
| 8 | Half-day or range crossing arrival; pilot’s long run; next-year arrival | Only eligible dates deduct, preserving the established charging rule |
| 9 | Untyped and typed-zero people → single-day, picked-range and drag fills | Untyped person gets no below-zero question; typed zero still asks |
| 10 | Post out → approve future leave → restore later | Post-out alone preserves deductions; a subsequently established overseas gap is excluded |

**Tidiness notes, filed here only:**

- **Anything said twice?** Untyped-state presentation is repeated across both surfaces. A small shared presentation rule would reduce divergence.
- **Anything in the wrong place?** No misplaced production responsibility found: calculation, permission checking and rendering remain in their existing layers.
- **Simpler shape?** `BidPicker` still declares its own balance-result type without `notTyped`. Using the existing `BalanceAfter` type would make the shared contract explicit. The property currently survives at runtime.

**Explicit negatives:**

- I checked approved, pending and snapshot date filtering and found no additional deduction fault.
- I checked earlier stints and both overseas gaps and found nothing further.
- I checked post-out deductions and found nothing contrary to D1541.
- I checked hidden-person posting lookup and the added posting-cache dependency and found nothing further.
- I checked every direct `personFigures`/`leaveFiguresOf` reader and found no missing balance-reader call site.
- I checked snapshot shape validation and comparison and found no new mismatch.
- I checked member ownership, lock-at-save, squadron restrictions and verified replay handling and found no additional fault.
- I checked first-entry history wording and found no invented “from zero” figure.
- I checked both below-zero asking doors and found no missing untyped guard.
- I checked “Official bal” labels and instruction placement and found no additional mismatch.
- I did not report the deliberately deferred appearance changes on Grid, My leave, Approvals or leave buttons.

**Checks:** 31 focused in-memory assertions passed under `Pacific/Midway`; F2 was separately reproduced. The normal unit runner executed no tests because its temporary-file creation was denied. Browser walk: **not performed**.

Rulings: none this session.

