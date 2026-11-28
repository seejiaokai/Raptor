# The two CI fixes of 27 Nov 26 — report (S1 builder, chat 204)

Branch `claude/msq-s1-guard-6ae5e1`, on top of 856752b14 (K9 included). Nothing committed or pushed. The fixes are the
investigator's (`ci-shard3-drag-report.md` in the chat 204 side notes). Its line numbers matched this branch exactly:
A10 at lines 753–801, and `dropAndPeek` plus the flash checks at drag.test.tsx 761–788 / 866 / 881 / 882 / 900 / 901.

## (1) A10 moved out of the long guard file — so GitHub's unit share 3 stops running past 20 minutes

**What moved.** The whole `describe('A10 — counted means drawn')` block (49 lines) left `src/ui/msq-guard-open.test.tsx`.
A one-line pointer now stands in its place. Two imports that only A10 used were dropped (`closeScheduler`, and
`rawRole` from the raw-entry import).
- `src/test-support/msq-guard-a10.ts` (new, a plain `.ts`) holds `A10_CHANGES` (the old `CHANGES`, unchanged) and
  `defineA10(changes, { worked })`. That registers the same `describe` title, the same `it` titles and the same bodies
  over `GUARD_ROWS.filter(rowRefuses)`, plus the worked case. A `diff -w` of the cut block against the new file shows
  only the structural lines: the `export`, the loop over the changes named, and the `if (opts.worked)`. No assertion
  changed.
- Five new files, one change each. Each has `withThird()`, `afterEach(guardTeardown)` and one `defineA10` call:
  `src/ui/msq-guard-drawn-rights.test.tsx` ("his right in the squadron lowered to View", plus the worked case),
  `-midnight`, `-role`, `-landing` and `-board`.

**Test counts** (`npx vitest list`):

| | before | after |
|---|---|---|
| msq-guard-open.test.tsx | 341 | 190 |
| msq-guard-drawn-rights | — | 31 |
| msq-guard-drawn-midnight / -role / -landing / -board | — | 30 each |
| **total over the six files** | **341** | **341** |

- The 151 A10 test titles, sorted, are identical before and after (`diff` empty).
- The open file's other 190 titles are identical and in the same order.

**One more change the split needed: the shared teardown.** On the first run of the five files, 26 tests failed. All
were in the `-role` and `-midnight` files: every row after `cxdlg` failed its premise, with "cxdlg" still named.

- **Cause.** The board's cancel-reason box and its Sort all question are module state in the board's code. A close
  reaches them only through a hook the board wires while it is mounted. The teardown unmounts the page first, so its
  `closeScheduler()` no longer cleared them.
- **Why it was hidden before.** A10's "role" and "midnight" tests rightly leave the cancel reason open. In the one long
  file, a later A10 test of the same row ("landing" or "board") happened to close it before the next row began.
- **The fix.** `guardTeardown` in `src/test-support/msq-guard-testkit.ts` now also clears those two, as it already
  clears every other window (`setCxt(null); setSortAll(null)`, with a comment saying why).
- This is test-support only. No app file was changed, and no assertion was touched. Every file that uses the teardown
  ran green after it (the full suite below).

`raptor-port/docs/file-map.md` gained one line for each of the six new files (the support file and the five tests).

## (2) drag.test.tsx — the flash is checked on the node this drop lit, not on whether its 640 ms timer has run out

**What changed:**
- `dropAndPeek` watches class changes during the drop, using a MutationObserver over the body with old values kept.
  From those it records every node that wore `lift-land` at any point during the drop.
- `flashed(sel)` asks whether the node standing at that address now is one of the nodes the drop lit.
- The three positive checks use `flashed`: line 866 (served drop), line 881 (swap) and line 900 (board).
- Lines 925 and 929 (the puck dropped back on its own seat) are untouched, as the report says.

**One deliberate departure from the report — the two "did not" checks.** These are line 882 (the seat he came from)
and line 901 (the hidden week). They use `wore(sel)`, which is `flashed(sel)` OR the class still on the node now. The
report had `flashed` alone, which would have dropped the old check that the class is not on now. Keeping the old check
beside the new one means each "did not" is stricter than before, never looser. It cannot flake, because the timer only
ever takes the class off. Messages are unchanged.

**The three proofs.** Each is a whole-file run of 63 tests, original against fixed.

| condition | original | fixed |
|---|---|---|
| normal | 63 passed | 63 passed |
| worker held 700 ms just after the swap's flash sets its 640 ms timer (scratch probe) | **1 failed**: the swap test, "the seat he dropped on flashed: expected false to be true", which is GitHub's exact message | **63 passed**, twice; the probe's log shows the 700 ms hold happened in the swap test both times |
| app broken: `lift-land` never put on (a temporary edit to `src/ui/lift.ts`) | 4 failed | **the same 4 failed, with the same messages** |

The 4 failures with the flash broken:
- served drop: "the seat flashed: expected false to be true"
- swap: "sanity: they swapped: expected 'allavail' to be 'stiff'". This is the earlier failed test's state carrying
  over, and it is the same in both versions.
- board: "the board flashed: expected false to be true"
- own seat: "the seat he dropped on flashed: expected false to be true"

**Clean-up.** The probe (`src/testing/zz-stall-probe.scratch.ts`) and its scratch config (`vitest.probe.config.ts`)
are deleted. `src/ui/lift.ts` was put back from a saved copy. Its SHA-256 is the same before and after
(`c39be61e…72da`). Its git blob equals HEAD's (`b63538de…a97f`), and `git diff HEAD -- src/ui/lift.ts` is empty.

## Checks (from `raptor-port/`)

| check | result |
|---|---|
| the six guard files + drag.test.tsx + the roll-call + no-app-import (9 files, one run) | 9 files, **454 passed**, 0 failed, exit 0 (307 s) |
| full unit suite, `npm test` under the checks lock → `.tmp/ci-full.txt` | 1152 files passed (1152); **17854 passed**, 5 expected fail, 20 skipped, 8 todo (17887); 0 failed; exit 0; 885 s. Lock taken, then released. |
| `npm run docsize` | exit 0, "every record accounted for". HANDOFF.md and OUTSTANDING.md are each about 95 bytes over their size line, deferred under D29; this change touches neither. |
| `npm run lint:changed` | exit 1, from **one finding that is not this change's**: `src/ui/UsersPanel.tsx:350`, high control-flow complexity. It was already there on this branch (commit abcffc239 left it, "the one left is Admin → Users' own"). None of the changed or new files has a finding. |

**Not done, by the brief:** no commit or push. HANDOFF.md, the plan and OUTSTANDING.md are not touched. The times-list
refresh (the report's fix B) waits for the first green GitHub run.
