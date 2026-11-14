# The small schedule-and-board fixes — the narrow read of the first fix round (11 Nov 26, chat 64)

*(Saved word for word from its final message — a fresh Opus reader that did not write the fixes, handed only the fix commits `2eac8d6f9` and `ac05bd045` and the findings they answer (the order §5, "A fix is new code"). Its three probes are kept in the night's scratch folder, `narrow-read/probe.test.ts`; each is rewritten as a failing test in the repo before its fix.)*

NARROW READ — the board's Undo landing fix round (fix commit 2eac8d6f9 and browser-test commit ac05bd045)

What I ran: `npx vitest run src/ui/boardland.test.ts` passed 39 of 39. I also ran one scratch test file (scratchpad/narrow-read/probe.test.ts, with its own config, which imports the real modules; no repo file was touched). It holds three cases, and all three FAIL on the current code, which confirms findings 1–3 below. Everything else here comes from reading only.

## Findings, ranked

**1 (medium-high, against D672): a reordered row is landed by "the first place that differs", not by the row that moved.**
- **Steps:** on the board, drag the LAST Common Programme row (or wave or ground row) to the head. Then:
  - Undo: the row goes back to the foot. The landing goes to the head (now a different row), so if the head is in view nothing moves and the moved row stays out of view at the foot.
  - Or: drag the first row to the foot. Undo (the screen goes up to the head). Scroll back down to the foot. Redo: the row returns to the foot, in view, but the landing names the head row and scrolls the screen up, away from the change.
- **Cause:** `boardland.ts` `movedRowKeys` → `first()` takes `a.find(([r], n) => !b[n] || b[n].rid !== r.rid)`. When one row is moved down, every row above its new place also "differs" in position, and the first of those is named instead of the moved row.
- **Confirmed:** probe A. Last of 10 rows dragged to the head, Undo → `['ap:0.0.prog']`; expected `ap:0.9.prog`.
- **Fix:** name the rows that actually changed order. Take the longest run of rows whose relative order is kept (longest increasing subsequence of the old positions); the rows outside it are the moved ones. Name those first. For Auto sort or Sort all (many moved), the first of them is fine.
- **Tests that fail today:** in `boardland.test.ts` 'a row moved down the list', add an Undo of "the last row dragged to the head" → `ap:${MON}.${n-1}.prog`. The test's own Redo line, `expect(...'redo'...)[0]).toBe('ap:${MON}.0.prog')` ("the head row is another now"), states the wrong target and should become `ap:${MON}.${n-1}.prog`.
- **Note:** the brief literally said "the first whose place differs". The builder followed it, but it does not serve D672 for a single dragged row.

**2 (medium): a hidden warning's line out of view is never brought on screen while the day's issues bar is in view.**
- **Steps:** on a desktop, a day with enough issues that the side column's list scrolls. Hide a warning low in the list, scroll the list back to its top (bar visible), then press Undo (or Redo). The line changes out of view and nothing moves. On a phone with the list open and long, the same happens.
- **Cause:** `drawingsOf` returns `[line, bar]` for a `warnline:` key. `land` then returns on `rooms.some(r => !r.dy)`, so the bar being in view counts as "the change in view". This contradicts the builder's own comment in the test: "The line is the change where it is drawn; the bar only where it is not".
- **Confirmed:** probe B. Bar placed in view, line below the list's foot → `moved = []`; expected `[328]`.
- **Fix:** in `drawingsOf` for `WARNLINE`, return `line ? [line] : bar ? [bar] : []`. The bar should only be the fallback, i.e. when the line is not laid out; `land` already skips drawings with no size, so do the same choice after the `laidOut` filter.
- **Test that fails today:** in 'a hidden warning whose own line is drawn…', also place `.wh` at SEEN with the line at BELOW → expect `[328]`. The existing test only ever puts the bar ABOVE, which is why it passes.

**3 (low-medium): `unfoldFor` opens Personal Inputs on a day the input is not on.**
- **Steps:** with the board open, move a Personal Input (say a rejected Meeting) from Monday to Wednesday, Undo, then Redo. `snapView` takes the day from `inputDayOf`, which reads the step's *before* image first, so the board goes to Monday. Nothing of the input is drawn there, so `unfoldFor` opens Monday's Personal Inputs, which the person never asked for, and nothing is landed.
- **Cause:** `boardland.ts` `unfoldFor` checks `listedPersonal` and `standsOn` but never whether the input covers `DATES[di]`.
- **Confirmed:** probe C. An input dated `DATES[2]` with `bringBoardChangeOnScreen([iu:…], MON)` gives `PIOPEN.has(MON) === true`.
- **Fix:** add `inputCoversDate(inp, DATES[di])` to the condition.
- **Test that fails today:** in the 'Personal Input under a folded panel' block, file the input on `DATES[2]`, call with MON → expect `PIOPEN.size` to be 0.
- **Pre-existing, beside it:** Redo of an input's date move sends the board to the OLD day, because `inputDayOf` prefers the before image (`undo-wire.ts` `inputRows`). Worth filing; it is not from this round.

**4 (low, only read): the "content" rule can drop a sign-off landing that is wanted.** On a signed day, a step that changes something the board does not draw (the area strip, traffic) also wipes or restores the sign-offs. `content = true` with keys the board cannot find means nothing lands, although the sign-off line visibly changed. The fallback "`[...keys, ...lines]` only when no key is drawn" would cover it, without the jump the builder feared for a row removal (where `keys` is empty, keep `lines` dropped). Its value is marginal.

**5 (low, only read): two claims have no test behind them.**
- "A publish Undo from the foot lands on the sign-off line": no unit or browser test exercises a publish step. If a publish also writes the `days` record, `content` becomes true and the landing is silently dropped.
- Finding 6 has no browser test, as the builder said.

## Each fix against the three questions

- **Fix 1 (pinch):** right. `scaleOf` matches `pinchzoom.ts` `scrollChain`, and the browser tests at about 0.5 and about 2 check the result lands within 40px.
- **Fix 2 (reorder):** keys exist on the board for every list. The target is wrong for a single moved row (finding 1).
- **Fix 3 (folded Personal Input):** right in its guards (leave, standing programme row, drawn row, missing input). It is missing the date check (finding 3). It runs only after the step is applied, so a refused step changes no fold.
- **Fix 4 (sign-off / hidden warning):** the sign-off part is right; the hidden-warning part has finding 2, and see 4 and 5.
- **Fix 5 (SANS card):** right. `data-inpedit` carries `inpId`, and the other `inpedit` buttons are the input's own lines.
- **Fix 6 (refused step):** right. `globalUndo` and `globalRedo` set `entry.undone` synchronously right after `applyRestore`. Every refusal path returns before that, and the week loads in `snap` before `snapView`, so the check holds for Redo and for another week. Nothing in the restore is asynchronous.
- **Fix 7 (box not laid out):** right.
- **Fix 8 (another week):** right for `days`, `sched.book` and `sched.mutes`. Inputs are not week-filtered, but `inputDayOf` already ties them to the loaded week's dates.
- **Case S1:** right for the retyped time. A residual design risk remains: a change only the Personal Inputs line shows (its remark), with the programme row in view and the line out of view, moves nothing. This is the cost of the "any drawing in view" rule.
- **Case S2:** test only; no code change.
- **Timers:** none leak. Each timer re-queries `.sb-boardwrap` and returns if it is missing, and the re-land after unfolding runs once (`mayUnfold` false).

## Tests read against "red first"

The new unit tests do test what their titles say. The weak spots are:
- the warning-line test never puts the bar in view (finding 2);
- the reorder Redo test asserts the questionable target (finding 1).

## Tidiness note (filed, not fixed)

- `movedRowKeys` packs four helper closures and six list walks into one function. A small table of {list, address} would read more clearly.
- `drawingsOf` mixes three unrelated lookups (sign-off, warning line, input) behind string prefixes. Separate finders per key family would make the in-view rule for each family explicit (finding 2 hides there).
- The header comment of `boardland.ts` now runs about 25 lines of history. The "what the two reads added" list belongs in the commit message, with one line left in the code.
