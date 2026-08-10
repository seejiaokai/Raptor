# Board and duties batch — design (10 Aug 26)

Fifteen owner changes in one pass, mostly on the scheduler board. Recorded
here because several of them REVERSE or narrow an earlier shape, and the next
session needs the reasoning, not just the diff.

## The four forks, as the owner settled them

| fork | decision |
|---|---|
| "sort duties by start time" vs "never auto-arrange" | **Button only.** Auto sort / Sort all order duties by START TIME instead of by role. Nothing re-orders on its own — the ask exists because rows jumped under the typist. |
| SC duty blocks | **Undo PR #142.** Creating an SC wave adds no duties. They come from `+ Block`. AVALON keeps auto-creating. |
| MAIN / SPARE | **True placeholder** — faded, and it disappears when a remark is typed. Replaces today's permanent tag. The owner was told it disappears and chose it anyway. |
| Picking SC/AVALON in the Go dropdown | **Label only.** Existing lines and planted crew are kept; the wave is not rebuilt. |

## Wording

- Week `Programme` → `Common Programme` (`ui/html.ts`).
- Board `Overall programme` → `Common Programme` (`ui/board-html.ts`).
- Duties column `ITEM` → `ROLE` (the `C6` header constant).
- AVALON's duty role `OPS-O` → `OPS O` (`SAWAVE`). `DUTY_ORDER` already maps
  both spellings to the same rank, so nothing downstream moves.

## Placeholder text

The owner's rule: a placeholder must be obviously NOT typed text, and several
were reading as real content.

- Removed: the duty-row placeholders (`SDO`, `0800`, `1700`, `remarks`), every
  Scheduler-notes placeholder, and the `B` on the brief box.
- Every remaining placeholder is made more faded — ONE `::placeholder` rule in
  `scheduler.css`, not per field, so the contract stays in one place.

`scheduler.css` carries measured contracts, so the new value is recorded there
beside the rule rather than left as a preference.

## New rows come up blank

`addLine` and the board's `gline` handler copy the previous line's `cs`,
`msn`, `to` and `ld`. Both now create a blank line. The copy was a
convenience that produced plausible-looking wrong data — a line that reads as
filled in when nobody filled it in.

## The board's day carries back to Edit Schedule

Closing the board leaves the week on the day the board was showing.

No new mechanism: `state/view.ts` already carries a day between the two week
pages (`CARRYDAY`, `setCarryDay`, `scrollWeekToDay`, owner 9 Aug 26).
`closeBoardState` sets `CARRYDAY` from `SBDAY` before clearing it, and the
week picks it up on its next paint exactly as it does on a page hop.

## Duties sort by start time

`sortDutyBlock` keyed on `DUTY_ORDER` (role rank). It now keys on
`parseHM(row.str)`, which is what `sortSims` in the same file already does —
same helper, same tie rules, rows with no time to the bottom.

Rendering stays in MODEL order. The existing comment in `sbDutyPanel` — an
editor whose rows jump as a role is typed would be hostile — is the whole
reason the sort is button-only, and it still stands.

**`DUTY_ORDER` is NOT deleted.** It is the render-time order for a duty block
that has never been sorted, and `order.ts` is imported by the engine.

## `+ Block` picks a wave

`+ Block` pushed a bare `DUTY` block. It now opens a picker listing the day's
waves plus an **Empty block** option, reusing the `.wavemenu` popup
`waveMenu` already builds — including its outside-click teardown, which holds
a document listener only it knows how to unhook.

Picking a wave creates a block titled `<wave name> duties`:

| wave | rows | times |
|---|---|---|
| ordinary (1st, 2nd, …) | SDO, SXO, OPS O | blank |
| SC | SXO AM, OPS O AM, SXO PM, OPS O PM | blank |
| AVALON | SXO, OPS O, RUNNER, LOG CELL | 1900–0700 |
| BB | SDO, SXO, OPS O | blank |

The shapes live in `engine/waves.ts` beside `saDutyBlocks`, so the engine owns
them and the UI only calls. BB was not specified by the owner and takes the
ordinary set — flagged, not inferred as a rule.

Times are blank wherever the wave has no fixed hours to give. They are
ordinary editable cells, so a blank is a prompt, not a gap.

## Role autofill on a free-standing block

A block created with no wave has no roles to fill in. Clicking its ROLE cell
offers SDO, SXO, OPS O, RUNNER, LOG CELL, or free typing — the list is
`DUTY_ORDER`'s own keys, so the pick-list and the sort order cannot drift.

## The Go dropdown

Two things, one of them a live bug found while scoping.

`labelToTitle` tests `w.night` FIRST and `makeStandalone` sets `night:true`
for AVALON — so an AVALON wave's dropdown read **"Night wave"**. Touching
that dropdown then ran `titleToLabel('Night wave')` and overwrote `w.label`
with `NIGHT WAVE`, leaving a standalone wave wearing the wrong name with its
`kind` and `standalone` flags untouched.

- `labelToTitle` reports a standalone wave's own kind before testing `night`.
- The options gain `SC` and `AVALON`, after `Night wave`.
- Selecting one marks the wave standalone of that kind and keeps its lines.

## MAIN / SPARE

Every standalone aircraft row already carries `a.role` from `saCrewRow`, so
this needs no line-number arithmetic and cannot drift from the model. It
already yields exactly what the owner described — AVALON 1&2 MAIN, 3&4 SPARE;
SC 1&2 MAIN, 3&4 SPARE, 5&6 MAIN, 7&8 SPARE.

- Week: the permanent `.rolet` tag becomes the remarks box's placeholder.
- Board: gains the same placeholder. It shows nothing there today.

**Known cost, accepted by the owner:** a line with a remark typed into it no
longer shows whether it is main or spare.

## Reference parity

`ui/html.test.ts` byte-compares `dayHTML` against the original app. Two items
here change that markup — the `Programme` heading and the MAIN/SPARE tag —
so each needs a matching string swap in `testing/refwin.ts`. Same trap
`HANDOFF.md` records for `CHIP_LABEL`. Budgeted, not discovered at gate time.

## Deliberately not done

- **Ground Programme keeps its render-time start-time sort.** "Will not auto
  arrange" was said about duties. The Ground Programme's sort is a separate
  owner request (Aug 26) and already avoids the jump-while-typing problem —
  time-less rows sink to the bottom, which is where the model appends them.
- **The week's shift column heading is unchanged.** "AVALON above NIGHT" was
  twice redirected by the owner to the board's Go dropdown, so the week
  heading keeps reading `AVALON / SHIFT`.
