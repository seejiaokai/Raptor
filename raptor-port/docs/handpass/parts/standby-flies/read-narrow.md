# [STANDBY-FLIES] — narrow read of the fix commit for the fresh read's F1–F4

- **Reader:** a fresh, blind Opus 5.5 narrow reader (did not write the change; did not read any other reader's report
  beyond the findings it answers). Read-only apart from this file.
- **Commit read:** `40f77cbb8` (`git show 40f77cbb8 -- raptor-port/src raptor-port/e2e`), against the findings F1–F4 in
  `read.md`, with the surrounding code: `ui/interactions.ts` (the `data-sarole` / `data-safly` branches), `ui/changesmodel.ts
  itemOf`, `engine/editlog.ts keyLabel`, `ui/pendlist.ts` (the `fr:` value words), `ui/histbubble.ts keyOf`,
  `engine/publish.ts alAttr / markEdit / setDayApproved`, `engine/drafts.ts reconcileIssuedMarks`, `engine/restore.ts dayKeys`,
  the amendment-mark CSS (`04-pucks-sections.css`), `engine/avail.ts slotRules / slotBarNow`, `engine/events.ts
  standaloneHits / buildDay`, `engine/validate.ts` (the sacrew loop, the formations loop, DOUBLE_BOOK), `engine/insights.ts`,
  `ui/Modals.tsx`, `engine/warnhide.ts hideKey`.
- **Run:** the unit files the commit touched (`npx vitest run` on each — single files, no lock needed). Five files pass
  (43 tests); `src/engine/insights-mission-mix.test.ts` does not load (N1).
- Exclusion in force (D56): a problem living only in already-stored data, with the code right going forward, is not a finding.

## Per fix

**F1 — right and complete: yes (for the mark), with one wording slip beside it (N2).**
- `dayKeys` carries `role`, `spare` and `fly` in the row's `fr:` composite and only `opts` in `st:`; `reconcileIssuedMarks`
  compares the marked address, so an `st:` mark for a flip or tick was always equal-to-issued and dropped on a published
  day. Marking `fr:` keeps it; ticking back reads equal and drops it (the test does both). Publishing turns it into
  `SCHED.changes[fr:…]` the same way CX and the red flag already do.
- Who else read `st:` for these: nothing that matters. On a standby row the cell's `alAttr('st:…')` (week `.rmkcell`, board
  `.sb-rcell`) is now never lit, but it never survived on a published day either. History dots (`histbubble keyOf`) find
  `st:` only through store chips, which a standby row does not draw, so the old mark had no dot anywhere; the `fr:` mark is
  found by the remarks box (`data-txt` / `data-bfld`), so the history now has a home. The pending list was already reading
  the `fr:` composite (it words `· SPARE` and `· ticked to fly`). No test or e2e still expects `st:` for the flip or tick.
- Where the mark shows now: on the remarks box, as CX and the flag do — the board's remarks input gets the dotted AL
  outline; the edit week's remarks text gets the dotted underline (on an empty row the "Remarks" placeholder carries it);
  the issued face gets the solid underline and the "ALn" tag (the tag shows even with no remarks text). Not on the badge
  cell, but visible on every surface, and the same place as every other `fr:` change.
- A remarks edit on the same row: still marks `fr:` and reads correctly on screen, but the changes window now heads it
  "remarks and standby role" (N2). The flip and the tick now share one history group with that row's remarks — each line
  keeps its own before/after, so it reads right.
- Not a finding: the SF10 test does not assert the day is really published before the tick (it relies on the
  `signOf` + `setDayApproved` pattern that `board.test.tsx` and `dpfixes.test.tsx` use), and it does not publish and check
  `SCHED.changes[fr:…]` as the read asked. Stale comments still say `st:` at the head of both click branches and in
  `itemOf`.

**F2 — right and complete: yes.**
- `avFly` is set only for a standalone `noconf` row that flies (AVALON / BB), and `slotBarNow` adds it to the walk that reads
  every AVALON / BB seat and desk, seats and desks both. That is the same `standaloneHits` body the validator reads.
- Re-arming the same man on his own seat is excluded by `selfKeys` (the full seat key); a drag off another row he leaves is
  excluded by `fromRow`; windows that do not overlap pass. The same man on the other seat, another row of the same shift, or
  an AVALON / BB desk in those hours is barred, which is what the validator reds after a drop: the standing row's sacrew loop
  and the desk loop both walk the flying rows, and two flying rows clash as events. No legitimate seat is barred.
- Not a finding: the new test has R typed, so both rows fly, and before the fix the busy scan already barred the man with
  "… inside this shift". The test was red only on the wording. The finding's own case (a standing MAIN and a hand-ticked
  flying SPARE, where nothing else bars him) is covered by the code path but is not the case the test runs.

**F3 — right and complete: yes for the bar; the test file does not load (N1).**
- The only readers of `roleMix` are `Modals.tsx` (`!mix.unresolved` decides the split; `standby` never touches
  `unresolved`) and tests that use `toMatchObject` or single keys, so the added `standby` key breaks nothing. Segment widths
  are now blue + red + standby = n.
- A man whose only sorties are standby rows now draws a split row "0 · 0 · n" with an all-grey bar, where he used to draw
  the plain bar. That is consistent, not wrong.
- Not a finding, for his look: the third segment is grey (`--ink-3`), not the plain bar's colour as its comment says. The
  legend names only Blue and Red, and the grey part is explained only by a hover title, which a phone does not show.

**F4 — right and complete: no — half of it (N3).**
- The `fly` and `events` entries now say "AVALON NIGHT" (crew rest, clashes, leave, the busy-scan caption). The `forms`
  entry still carries `${f.cs} ${f.msn}`, and every formation-level warning in `validate.ts` words its line from it.
- Label matches: DOUBLE_BOOK compares `A.label===B.label` to choose "two seats on X" over "X & Y clash". Two rows of one
  AVALON wave still compare equal, and AVALON against SC or BB still differ, so no wording flips. `hideKey` includes the
  message words, so a warning hidden while it read "AV NIGHT" would come back once — but flying AVALON rows exist only on
  this unmerged branch, so such a hidden key lives only in stored demo data (D56): not a finding.

## Findings

**N1 — medium — the F3 test file does not parse, so the unit gate goes red and the file's older tests stop running.**
- *Failure.* `npx vitest run src/engine/insights-mission-mix.test.ts` → "Transform failed … Expected `,` or `)`"; the file
  runs 0 tests and reports a failed suite, so the full unit run fails. The D512 / D516 / D517 / D523 / D531 mission-mix tests
  in the same file silently stop running with it.
- *Cause.* Line 54: `it('counts as "standby", not "unresolved", and the parts add up to the man's sorties', …)` — the
  apostrophe in "man's" closes the single-quoted string.
- *Fix.* Quote the name with backticks (or write `man\'s`):
  `` it(`counts as "standby", not "unresolved", and the parts add up to the man's sorties`, () => { `` — then run the file and
  check that all its tests run and pass.

**N2 — low — the changes window heads every remarks, CX or flag change on a standby row "remarks and standby role".**
- *Failure.* On a published day, type "LATE" in the remarks of an SC row (or CX it, or red-flag it). The changes window's
  line for it reads "#2 remarks and standby role", though only the remarks changed. A flip or tick reads the same heading,
  so the heading never says which of the two happened.
- *Cause.* `ui/changesmodel.ts itemOf`: the `fr` branch picks its word from the wave alone
  (`day.waves[gi].standalone ? 'remarks and standby role' : 'remarks'`), not from what the line logged.
- *Fix.* Word it by the logged values, which every line keeps (`r.from` / `r.to`):
  `const ROLE_W = new Set(['MAIN', 'SPARE', 'Standing by', 'Flies'])` and
  ``: pfx === 'fr' ? `${jet}${ROLE_W.has(r.from) && ROLE_W.has(r.to) ? 'standby role' : 'remarks'}` ``. Add a test: one
  flip line reads "standby role", and one remarks line on the same row reads "remarks". Also update the stale `st:`
  comments in `interactions.ts` (both branch heads) and above `itemOf`.

**N3 — low — a flying AVALON row's formation-level warnings still say "AV NIGHT" (F4 half-done).**
- *Failure.* AVALON with R typed (19:00–07:00), a man seated who is not SC NIGHT current. The warning list reads "SC NIGHT
  currency needed for AV NIGHT (19:00–07:00) — X is not current" — the finding's own second example. The same applies to
  the crew-pairing lines (crew solo, illegal crew, CO approval), seat qualification ("cannot fly FCP (AV NIGHT)"), AAR, OCU
  with no IP and IRT on that row. The new test checks only LEAVE_FLY, which reads the `fly` label.
- *Cause.* `engine/events.ts buildDay`: `forms.push({label:\`${f.cs} ${f.msn}\`, …})` was left as it was. `validate.ts`
  words all those warnings from `lineName(f.label)` of `day.forms`. `day.forms` has no other reader, so nothing matches on
  its words.
- *Fix.* In the same formation scope, use the label already built: `forms.push({label:lineLbl, cs:f.cs, …})`. Add a test:
  the case above, where SC_QUAL's message matches /AVALON NIGHT/ and not /\bAV NIGHT/.
