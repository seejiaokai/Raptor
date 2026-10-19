# [STANDBY-FLIES] — the fresh, blind Opus code read (19 Oct 26)

**Who:** a fresh Opus 5.5 reader that did not write this code and had not seen it before this read (D790, D903 — no Fable).
Read-only: no file changed but this one.
**Commit read:** `69aaefb5a9ebab1d813521e6e650d13ef84d6b32` (branch `claude/sad-herschel-5682e3`); the change is
`git diff origin/main...HEAD -- raptor-port/src` (27 files).
**What I read:** the design note and the register (SF1–SF10); the full rows of D1042–D1046, D1060–D1066, D24, D15, D516,
D1009, D1041, D45, D592, D606; the evidence sheet (all of it, §3 and §13 most closely); the walkers' reports (A in part,
B and C skimmed); every changed region of the code and the code around it: `engine/waves.ts`, `events.ts` (`buildDay`, the
`seatIntime` and `standaloneHits` bodies), `validate.ts` (the input loops, the sacrew loops, the forms loop,
`SA_FLY_NO_TIME`, `crossDayIfPlaced`), `avail.ts` (`slotRules`, `slotBar`, `dayStandby`, `dayEngaged`), `oil.ts`
(`dayOilWork`, `dayOilBlind`), `oilev.ts` (`spanDefault`, `itemState`, `earnsFrom`), `insights.ts` and the Insights modal,
`restore.ts` (`dayKeys`), `drafts.ts` (`reconcileIssuedMarks`), `publish.ts` (`markEdit`, `alAttr`, `alIssue`),
`state/view.ts` (`rawSchedEpilogue`), `daytpl.ts`, `ui/html.ts` (the chip, the badge, `exemptLineOwn`), `board.ts`,
`board-html.ts`, `interactions.ts`, `peek.ts`, `pendlist.ts`, `changesmodel.ts`, `editlog.ts`, `logic-html.ts`, the CSS,
and the rewritten tests.

## Findings

**F1 — medium — a Flies tick on a published day leaves no mark on its row, and the amendment it goes out in never colours
the row.**
- *The failure.* Publish a Saturday with an SC wave, open the Scheduler Board, tap a SPARE's dashed FLIES. The day reads
  "1 pending" and "Publish AL1" (right), but nothing on the row says it changed: no "Edited — goes out as AL1" tint on the
  badge's cell (walker A saw exactly this: "nothing on the row itself"). Publish AL1: the issued AL1 (View-only Sched, the
  version look, a member's view) does not colour that row as "Changed at AL1", though that tick moved a man's OIL. The same
  for taking a tick off (AL2). Every other change that moves OIL on a published day — a time, a seat, a CX, a red flag —
  carries both marks.
- *The cause.* `ui/interactions.ts` (the `data-safly` branch) marks the change on the row's `st:` address
  (`markEdit('st:…')`) and then runs `view.afterSchedMutate()`. That epilogue (`state/view.ts rawSchedEpilogue`) first runs
  `engine/drafts.ts reconcileIssuedMarks()`, which drops any pending mark whose address reads the same in the live day and
  the issued one. The `st:` address holds only the row's stores (`restore.ts dayKeys`: `J(a.opts)`), which a tick does not
  touch — the tick rides the `fr:` composite instead (`…␟F`). So the mark is deleted the moment it is made; the pending
  count survives only because it is worked out from the full comparison, not from marks. `publish.ts alIssue` turns marks
  (not the comparison) into the AL's colours, so the row gets none.
- *The fix.* Mark the address whose value the tick changes: in the `data-safly` branch call
  `markEdit(\`fr:${di}.${gi}.${li}.${ai}\`, was, now)` (the red flag already does this — `board.ts` `lflag` →
  `markEdit('fr:…')`), and in `ui/changesmodel.ts itemOf` word an `fr:` change on a standalone wave whose logged values are
  "Standing by" / "Flies" as `standby role` (as the `st` branch does now). Add a test on a PUBLISHED day: tick, run the
  epilogue, expect `SCHED.pending[rk('fr:…')]` still set, then publish and expect `SCHED.changes[rk('fr:…')]` to be the
  AL's number. The MAIN / SPARE flip just above it has the same dropped mark (older — see below); the same one-line change
  fixes it.

**F2 — low — the crew list offers a man for a flying AVALON or BB row while he already stands on the same shift (or its
desk); the warning list then reds the drop.**
- *The failure.* AVALON NIGHT, nothing typed, row 3 (a SPARE) ticked FLIES by hand. Viper stands on row 1 (MAIN, not
  flying), 19:00–07:00. Arm row 3's front seat: Viper is offered as free. Drop him: the warning list at once says "Viper is
  on AVALON NIGHT MAIN (19:00–07:00) and also on AVALON NIGHT SPARE …" (hard). The same with a man on the AVALON or BB desk
  in those hours, or on a standing-by BB shift that overlaps. The reverse direction is refused correctly (arming the
  standing row while he sits on the flying one), so the picker and the warning list disagree one way only — the drift the
  app's rules say must never happen.
- *The cause.* `engine/avail.ts slotRules`: for a row that flies, `avJet` is no longer set (rightly — it is not a standby
  place now) and `sc` is set instead, so `slotBar` asks `scSeatHit`, which walks SC places only (`standaloneHits(…,'sc')`).
  `avSeatHit` — the only walk that sees AVALON / BB rows and desks, none of which are events — is asked only when
  `r.avJet || r.avDuty`. The busy scan reads events, so it cannot see them either. The validator's side
  (`validate.ts`, the sacrew loop's `avSeatHits`) still sees the flying row from the standing one.
- *The fix.* In `slotRules`, beside `flyRow`, set `out.avFly = !!(flyRow && wv.noconf)`; in `slotBar` widen the two-places
  walk to `if ((r.avJet || r.avDuty || r.avFly) && r.slotStart != null && r.slotEnd != null && r.di >= 0)` (seats and desks,
  `seatsOnly` false). Test: the case above, `slotBar` must name "already on AVALON NIGHT MAIN".

**F3 — low — with mission roles switched on, Insights draws a man's sorties bar short when one of his sorties is a standby
row that flew.**
- *The failure.* Mission-role tracking on; Saber flies one blue sortie and one SC shift with its R typed. Insights' "Flying
  load" row reads `1 · 0 · 2`, but the bar is painted blue for half its length and the other half is empty track — it looks
  like one sortie. The legend's "Total-only rows include unanswered mission roles" does not apply (his row splits).
- *The cause.* `engine/insights.ts`: the new standby loop adds to `fc` (the count) but deliberately not to `mixes`; the
  comment says "the standby ones left plain", but `ui/Modals.tsx` draws only a blue and a red segment inside
  `.mix-segments`, sized by `blue/n` and `red/n`, so the remainder has no paint at all.
- *The fix.* Count it: in the standby loop add `if (tracking) { const mix = mixes[id] || (mixes[id] = {blue:0,red:0,unresolved:0,standby:0}); mix.standby = (mix.standby||0) + 1 }`,
  and in `Modals.tsx` add a third segment `<span class="fill" style="width:${(mix.standby||0)/f.n*100}%"></span>` after
  the red one (the plain fill the non-split rows use). Test: the case above, three segment widths summing to 100%.

**F4 — low — a warning on a flying AVALON row names it "AV NIGHT", where every standing-by AVALON warning says "AVALON
NIGHT".**
- *The failure.* AVALON with R typed and a man on local leave on it: "On leave but tasked — AV NIGHT"; the SC currency line
  "SC NIGHT currency needed for AV NIGHT"; crew rest likewise. A standing row's warnings, and the two-places warning about
  the same flying row, say "AVALON NIGHT". The code's own note says not to do this ("Don't re-shorten to f.cs" — the "AV"
  callsign exists only to fit the board's narrow box).
- *The cause.* `engine/events.ts buildDay`, the main path: every `fly` / `events` / `forms` entry is labelled
  `${f.cs} ${f.msn}`; AVALON rows never reached that path before this change.
- *The fix.* In the main path use one label: `const lbl = shiftLine && w.noconf ? \`${w.label} ${f.msn}\` : \`${f.cs} ${f.msn}\``
  for the `fly`, `events` and `forms` entries (SC's callsign and label are both "SC", BB's both "BB", so only AVALON
  changes).

## Roll-call gaps (rows the sheet's §3 lacks)
- **The row's amendment mark** — the tint on the badge cell before publishing and the "Changed at AL n" colour on the issued
  version (Board, Edit Schedule, View-only Sched, the version look). R9 says "`st:` key marked"; on a published day that
  mark does not survive (F1). R6 checks the chip on the issued look, not its colour.
- **The crew list's "already on another place" walk for a flying AVALON / BB row** (R15 covers arming and barred reasons
  but not the two-places walk, which is a separate body for AVALON / BB) — F2.
- **Insights' blue / red bar with mission tracking on** (R11 names "no blue / red for standby" but not how the bar is
  painted) — F3.
- **The warning words for a flying AVALON row** (R12–R14 check which warnings, not how they name the line) — F4.
- **OIL_NO_TIMES beside SA_FLY_NO_TIME** (R17): on a weekend a BB shift with crew and no START / END already raises the
  hard "no usable times — nobody on it earns OIL" line (older); once it flies the new advisory joins it, so the list carries
  two lines about the same blank boxes. Not a finding (each says something the other does not — crew rest), but the walk
  card should expect two.

## Older, noted (not this change's)
- The MAIN / SPARE flip (`interactions.ts`, `data-sarole`) has F1's defect: its `st:` mark is dropped by the epilogue on a
  published day, so a flip is never coloured in its AL. F1's fix covers both.
- The history's frozen label for an `st:` change on a standby row (`engine/editlog.ts`) still says "stores"; the changes
  window no longer shows it (its `itemOf` was fixed), so nothing visible depends on it today.
- A man on an SC shift and a standing-by BB shift in the same hours raises nothing (SC and AVALON / BB never cross-check);
  now true of a flying BB row beside a standing SC SPARE as well — the same gap, not widened in kind.
- The crew list's crew-rest question for the FIRST man seated on a shift with its B or R typed compares his rest with the
  shift's START, not the B / R (`slotRules` `scStart = st`; `crossDayIfPlaced` needs a seated sibling); the warning list
  uses the B / R. Older for SC MAIN; it now reaches the other standby rows that fly.
- Insights' ordinary-wave loop counts a placeholder (ALL AVAIL) as a flyer; the new standby loop does not — an older
  inconsistency, harmless to this feature.

## Checked and fine
- `saFlies` / `saAnyFlies` / `saTyped`: a cancelled shift or row never flies; a typed B or R flies every uncancelled row; the
  hand tick lights its own row only; `saTyped` and `scReport` read the boxes through the same `parseHM`, so "flies" and "its
  report time" cannot disagree.
- `saExempt` and `scSpare` refuse a flying row, so every reader that asks them (the validator's main path, `exemptLineOwn`,
  the week's ring choice, `slotRules.saExempt`, `crossDayIfPlaced`, the palette's free / engaged lists) treats it as tasked.
- `buildDay`: each AVALON / BB row is collected exactly once — a standing row into the standby collection (or the
  no-times list), a flying row into the main path; no row in both, none in neither (checked with times, without times,
  with the shift cancelled, with one row cancelled). An SC row: standing spares into the spare lists, flying ones into the
  flying lists. Whole-day absence on a flying BB with no times is judged once, by the events loop's blank-shift branch.
- Two places for one man: standing ↔ flying AVALON, desk ↔ flying AVALON, flying ↔ flying — each raised once in the
  warning list (only the crew list misses one direction, F2).
- SC currency: a flying AVALON / BB row asked once, through the formation (`sc: isStandalone(w)`), the standing rows through
  the standby collection.
- OIL (`dayOilWork`): a flying row defaults on from the earlier of B / R and START to END; a standing row keeps its written
  window and its "off"; the item's switch reads "mixed" correctly through `itemState`; the published-day freeze is
  untouched (the tick is a pending change through the comparison).
- `dayCount`: flying seated rows a term of their own, standing MAIN rows still the slash figure, an empty row nothing
  (D1062); Insights' sorties and formations agree with it.
- `SA_FLY_NO_TIME`: fires for a flying shift with START or END blank, names the line, anchored on START; silent for a
  standing shift.
- `restore.ts dayKeys`: the tick rides the `fr:` composite only when set, so no other row's address changes; `pendlist`
  reads it.
- `daytpl.ts`: the hand tick is dropped from a captured template; a saved plan, Undo / Redo and reload keep it (the whole
  day is copied).
- The chip (`saFliesHTML`): a button only on the board, only with `ed && canEditSched()`, and only where the tick is the
  row's own; the click handler repeats those gates and refuses a typed shift; nothing on a cancelled row; the week, the
  member, View-only Sched and the peek get the lit chip read only, or nothing. Keyboard: a real button, focus kept after
  the redraw.
- The faint dash: a placeholder only (never a value), on standby R and B only; the flying lines keep their suggested times.
- The Logic page and the + Wave notes now say "unless it flies"; the SPARE badge's note and toast say a flying row is fully
  cross-checked.
- The rewritten old-rule tests (`scpickerrest`, `scrole-rules`, `scrally`, `oilscintime`, `scintime`, `scboard`) were changed
  to D1044–D1046 and each keeps a standing-by control; none was weakened to pass.
