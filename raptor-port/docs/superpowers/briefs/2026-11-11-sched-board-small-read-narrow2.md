# The small schedule-and-board fixes — the narrow read of the second fix round (11 Nov 26, chat 64)

*(Saved word for word from its final message — a fresh Opus reader that wrote none of it, handed only the round-2 commits `41c6f79b4`, `3e06de33d`, `52154e71d` and the first narrow read they answer (the order §5, "A fix is new code"; round 2 of at most about three). Its probes are kept in the night's scratch folder, `narrow-read-2/`.)*

NARROW READ 2: the board's Undo landing, second fix round (41c6f79b4, 3e06de33d, 52154e71d)

**What I ran:** `npx vitest run src/ui/boardland.test.ts` passed, 46 of 46. I also ran one scratch probe file with seven cases, in `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/narrow-read-2/probe.test.ts`. Its results are in `log.txt` in the same folder. I changed no repo file, ran no browser test and ran no full suite. Everything else below comes from reading only.

## Findings, ranked

**1 (low-medium; whether it breaks D672 is a judgement for the host): when a step re-orders SEVERAL rows, only the first row it names decides "in view". Its rows are named in list-type order, not in the order the screen draws them.**
- **Steps:** on a desktop, scroll the board down to the Ground Programme. Press Sort all from the board's bar (it can be pressed from anywhere). Ground rows re-sort in view, and some wave or Common Programme rows re-sort far above. Press Undo with the Ground rows still in view. The landing names the wave or Common Programme row first, finds it out of view, and scrolls the board up, away from rows that changed in view.
- Same with Auto sort when two rows of one list moved: the upper one is out of view and the lower one is in view.
- **Confirmed (probe P5):** head row and last row of the Common Programme swapped, so both moved. Keys come back as `[ap:0.0.prog, ap:0.9.prog]`. With the last row placed in view and the head above, the list is moved by −508. It should not move if "any part of the change in view" is the rule.
- **Cause:** `boardland.ts` `land` stops at the first key that has a laid-out drawing, and checks in-view (`rooms.some(r => !r.dy)`) only for that key's drawings. `movedRowKeys` pushes its lists in a fixed order: waves, Common Programme, duty blocks, Ground, sims, then formations, jets and duty rows. That is not the board's section order, which can be re-arranged by hand.
- **Builder's claim:** N1's guard ("a moved row in view moves nothing even when the head is out of view") holds only for a single moved row.
- **Fix:** in `land`, pick the target as now (the first key with laid-out drawings). Before moving, return if ANY laid-out drawing of ANY of the step's own keys (excluding the `isLine` keys) is in view. This extends the "any of its drawings" rule from one input to the whole step. If the host thinks that is too wide for unrelated multi-box steps, apply it only to the keys `movedRowKeys` returned for one step.
- **Test that fails today:** in `boardland.test.ts`, swap the head and foot of `allhands`, place `ap:MON.0.prog` ABOVE and `ap:MON.(n-1).prog` SEEN, call `bringBoardChangeOnScreen`, expect `[]`. Today it gives `[-508]`.

**2 (low, read only): the browser tests added for N2 and N5 can skip themselves.** The publish test skips when "the sign-off line is in view from the foot at this size". The hidden-warning test skips when "the whole issues list is in view from its head". If the demo Monday is short enough at both sizes, neither runs, and the claim stands on the unit tests alone. I did not run them. The walk or the host should confirm each ran (not skipped) at least once, at his PC's size and at his iPhone's.

**3 (low, test quality only): N4's "the board draws none of the step's own places" test does not use a real case.** `signedDayStep` changes a remark and simply leaves its box out of the made-up board. A real area or traffic change on a signed day is never exercised. The code is right for such a step only because `canonicalUnits` names `ar:`/`at:`/`tr:` keys, so `keys.length` is non-zero. That holds today, but no test pins it.

Nothing else I could find.

## Each claim, against the three questions

**N1 (`keptInOrder`): right for one moved row, Undo and Redo.** It is n·log n, the longest-run method with a binary search: about 3.3 ms per call for 60 rows reversed, comparison included (P6). Probes:
- **Moved and edited in one step:** only the moved row is named, `ap:0.9` on Undo and `ap:0.0` on Redo (P1).
- **A jet moved between two formations:** `fr:0.0.0.1` on Undo, `fr:0.0.1.0` on Redo (P2).
- **A formation moved between waves:** right both ways (P3).
- **A row added at the head:** no false "moved" (P4).
- **Added and moved in one step:** both named (P4).
- **A Ground time retyped so its row re-sorts:** the same row (P7).
- **A row that came in from another list** has no old place in its new list, so it is named. That is right.
- **Duplicate or missing ids:** rows with no id are skipped. Duplicate ids cannot reach it, because `rowids.ts` re-mints a duplicate.
- **Two rows swapped:** the upper one is named. It is adjacent to the other, so the effect is negligible.
- **Limit:** finding 1, for several rows moved at once.

**N2: right and complete.** The line is used where it is laid out, and the bar only where it is not. The old version failed the new "bar in view, line below" case (the earlier probe B).

**N3: right.** It uses `inputCoversDate(inp, DATES[di])`. `DATES` is refilled in place on a week load, the same as the `DAYS[di].dt` the tap path uses. `standsOn` now takes `p.iid`, which equals the input's id because the input was found by it.

**N4: right as specified.**
- A sign-off or warning line is tried only when no own place is drawn. A drawn place that is folded, out of view or in view never yields to it.
- A removed row, or an input taken away (`gone`), still lands nowhere. Unfolding happens before the line fallback, so a folded Personal Input opens its panel rather than going to the sign-off line.
- "Drawn" counts a box that is in the page but not laid out. That is deliberate and documented, not a mistake.

**N5:** tests only. They pass on the earlier code, as the builder says.

**N6:** not built, as stated. The residual risk from the first read stands.

**52154e71d: honest.**
- RECORDS is the right list. The file asks about the INPUT (where it is drawn, `listedPersonal`, `inputCoversDate`, `standsOn`) and never about one man's day. D756's reading (1) concerns per-person questions, which this file does not ask.
- `inpById` differs from the old lookup only for the better. The old `INPUTS.find(x => inpId(x) === iid)` minted and saved a new id on every id-less input it passed, a hidden write during an Undo landing. `inpById` only compares `r.iid`. An input with no id could never match a key's id in either version, so the result is the same.

## Would the new tests pass on the old code?

These fail on the old code, so they test what their titles say:
- "ONE row dragged…" and "…the screen follows the row that moved";
- the warning line "bar in view" case;
- "a signed day … the sign-off line comes into view";
- "an input that is not on the board's day opens nothing there".

These pass on the old code and stand as guards, as intended:
- the "own change drawn" trio;
- "row only REMOVED on a signed day";
- the warning line "not laid out" pair;
- the real publish step.

The corrected unit Redo line and the corrected Auto sort browser ending now state the moved row. That is a fix of a wrong expectation, not a weakened test.

## Tidiness note (filed, not fixed)
- `land` now does three passes over `keys` (own places, unfold, lines). One helper that returns {shown, drawn} for a key set would make the order explicit and is where finding 1's "any key in view" belongs.
- `boardLandKeys`' return line packs three outcomes into one nested ternary (`!content ? lines : keys.length && !gone ? […] : keys`). Named cases would read more clearly.
- The header comment and the in-code "the narrow read, finding N" histories keep growing. One line in the code is enough; the rest belongs in the commit messages.
