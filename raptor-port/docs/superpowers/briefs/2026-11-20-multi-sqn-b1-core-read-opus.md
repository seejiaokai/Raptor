# The core read (D2237) — the fresh Opus reader's report (blind; copy at `7dbc13fd0`)

Reader: a fresh Opus reader (D790), a background helper of chat 124, blind to the other two readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-core-read-brief.md`; its own exported copy; finished whole (about 13 minutes). Proof
test kept outside `src` (`…\scratchpad\core\opus\opus-probeA.test.ts.txt`, chat 124's scratchpad; copied beside this
report as `…-core-read-opus-probeA.test.ts.txt`). The report as returned:

---

## Core read: fresh Opus reader's report on perms.ts, notices.ts and units.ts at 7dbc13fd0

I read all three files whole, plus `units-model.ts`, and followed the callers as far as I needed: the posting pass and the holiday and war tellers in `leavewar/sync.ts`, `people-settings-commit.ts`, `inputstamp.ts` and `storage/unitid.ts`. I did not open any `*fixread*`, `*core-read*`, `*fable-sample*` or `*full-review*` file, the evidence sheet, or the other readers' folders. No handoff block was pasted, so there was nothing to ignore. The only source file I added was one temporary proof test, now deleted from `src`.

### Finding 1 (confirmed red): the gate never checks the date on a squadron's place row, so a squadron's past place can be rewritten or erased
**What happens.** The commit gate's unit-rows check (`perms.ts unitRowViolation`, section 6) checks only two things for a squadron's place row (`unitplace:`): that the row is well formed, and that the writer is an admin of the squadron it names. It never checks the row's `from` date.
- The ruling: a place change counts from the next day's start and a place keeps its history (D2119, D2160 R7).
- `units.ts moveUnit` follows that ruling by always writing tomorrow, but the gate does not hold it.
- Homes have exactly this day-by-day check in section 8 (`homeUnitViolation`). Place rows have no counterpart.

**Proof (ran, red).** One proof test. Prowler, 142's plain admin and not a master, signs in. `setPlace` makes "Det base".
1. **Back-dated place.** `commitSettingsIntent('unit.place', null, () => store.set('unitplace:upzz', {id:'upzz', unit:'u142', place:<Det base>, from:'2026-01-01'}))` returns `ok: true` and the row is committed. 142 now stood at Det base from 1 Jan.
2. **Erased move.** With the clock at 1 Jul, `moveUnit('u142', Det base)` saves a move from 2 Jul. On 10 Jul the forged delete `store.set('unitplace:'+row.id, null)` inside `'unit.place'` returns `ok: true`. The move that has been in force since 2 Jul is gone from history.

**Why it matters, today.** Public holidays are laid onto each squadron by place and date (`leavewar/sync.ts placeHolidaysFor` compares `placeOfOn(unit, iso)` with `placeOfOn(other, iso)`). These feed `HOOKS.oilEarningDay`.
- 149's admin back-dates 149's place away from Home base. Every past 149 public holiday stops being an OIL-earning day for 142's men, so 142's OIL changes retroactively, by another squadron's admin (against D2194).
- The reverse, back-dating onto a shared place, adds OIL days.
- The GMT label shown on past days changes too. From batch 3, the place also decides cross-squadron planning checks.

**Fix, step by step.**
1. In `unitRowViolation`, collect every unit named by a changed `unitplace:` row, using both the before and after images.
2. For each such unit `u`, build the set of dates: today, plus every `from` of `u`'s rows in `before.unitplaces` and `after.unitplaces`, sorted.
3. For each date `d`, compare `was = placeIdOn(before, u, d)` with `now = placeIdOn(after, u, d)`. If they are the same, move on.
   - If `was == null` (the unit's first placement, as `addUnit` writes it): allow it only when `d >= today`.
   - Otherwise refuse when `d < moveFrom(today)`, with the message `a squadron's place changed for a day already begun (unitplace of u on d)`.
4. Apply this to every actor except the app itself, masters included. The ruling says history is kept, whoever writes.
5. Add the two cases above as red tests.

Low cost; homes already use this loop.

### Still open in the code, filed but not on the brief's known list: holidays still cross squadrons
Batch 1 still lays one squadron's public holidays onto every squadron at the same place:
- `placeHolidaysFor` puts them on the other squadron's days and OIL.
- `holidayTodo` tells every squadron's schedulers.
- Section 7e of the gate lets a holiday line cross on purpose ("until his D2195 … is built").

D2195 (18 Nov) says no holiday list is shared and no line crosses. Its full row files the fix "for chat 109" under [MULTI-SQN-DESIGN]. `leavewar/holidays-by-place.test.ts` (ran, green) still asserts the old behaviour: "149's public holiday is 142's too … its OIL is earned on it". Please confirm it is tracked as a batch-1 fix. Until it is, Finding 1's cross-squadron OIL effect is live.

### Checked, nothing found
- **Who may write what.**
  - The type gate and the unit gates: section 7 (records with a unit in their id), 7b (Leave War), 7c (inputs, across a move's days), 7d (history lines), 7e (bell lines and read records), 7f (Tracker) and 8 (people, accounts, homes).
  - A View grant writes nothing anywhere.
  - A master's level comes only from his own account's mark.
  - An admin in member view holds nothing as admin.
- **D2203 (a move ends View and Plan).**
  - `setHome` drops every grant inside the move's own command.
  - The gate refuses a right given between a move being saved and its day, a right in his own home squadron, and a right not dated today.
  - Undo or Redo of a right after a move is re-dated today.
  - I found no honest path that leaves a right alive after a move. A forged move that keeps a right needs an admin of both squadrons, which in practice is a master.
- **Failing open.** With the probes unset, the war, Tracker, posting and stored-row checks are skipped; the war-line, holiday-line and follow-up checks refuse. All are documented. A person with no home only occurs on a shared store before its rows exist.
- **The bell, D2218.**
  - `noticeLeftBell` handles: the move day itself, a move and back, two moves, lines dated ahead (under a day and over a day), and filer lines judged by their marked squadrons on each move day.
  - D2223, D2225 and D2228 are handled by the filer test through `filerVia`, `movedSince` and `homeAdmin`.
  - On each case I traced, the gate's `toldBy` and `filerMarkOk` call the same functions the pass uses.
- **Undo across a move.** A moved man's Quals row, or an input spanning his move, is refused to the old squadron's admin. That is consistent with D2191 and with the filed D2221 item.
- **Last admin and the master's account.** Both are judged over every future date on which a home row starts, with both sides read the way the loader reads them.
- **Normal day.** On the paths I traced (Prowler, Kestrel, Saber, Osprey), nothing honest is refused, beyond the filed limit that an input spanning a move goes only to a master or the man himself.

D2198 and D2202 (whose bell gets other squadrons' lines) are "Not built: filed" in their full rows, so I report nothing there. One question for him: Saber, as master, is told through his master mark of changes to an input he filed for a 149 man (`filerVia` via `adminThen`). That is by design per the `toldBy` comment, but under D2198 he may expect 149's lines to be off by default.

### Where the code's shape keeps breeding faults (recommendations, not findings)
1. **"Never rewrite a day already begun" is written for one kind of row only.** Homes have it (section 8), places do not (Finding 1), and grants have their own `from == today` rule. One dated-row check, run over home and place rows by the same loop, removes this family.
2. **"Which squadron an input is" has six bodies:**
   - the gate's `unitsOf`/`daysOf`, which handle an end date before the start by adding a year;
   - `notices.ts filerUnits`/`inputSpan`, which treat that end date as the start day alone;
   - the engine's `inputUnitOf` (first named man, first day);
   - `inputBelongs`;
   - `inputUnit` (the filer's);
   - the gate's `ownsHim`, which falls back to the boot squadron.

   They already disagree on the year-wrap case. One `squadronsOfInput(r, homeReader)` returning (squadron, day) pairs would serve 7c, the filer test and the input lists.
3. **A right's day is worked out in about ten places:** `grantKept`, `grantBackHolds`, `masterKept`, `markBackHolds`, `relinkBackHolds`, `restoredDayHolds`, `restoreRedated`, `adminThen`, `pidFrom` and `masterFrom`. Fix reads 7–12 each patched one. Storing each right as a dated interval that is never deleted (ending a right writes its end date) would let the bell ask "held on day d?" of one table. The gate would then only check that a new interval starts today and an ending one ends today, and Undo would simply delete or put back the interval.
4. **The seed fallback hides a missing home.** On the demo, a man with no home row is quietly 142's. On a shared store he is nobody's, and 7c then filters him out and judges nothing. A missing home should be refused at the gate (a master excepted), and seeds should write explicit rows.
5. **The squadrons cache goes stale.** `units.ts ROWS` is cleared only by `put`/`save` and the loader list. In the proof test, `placeOfOn` still read the old place after a committed write made by another path. This will bite once remote changes land at the database step. The cache should be cleared on every committed or applied write under `UNIT_ROW_PREFIXES`.
