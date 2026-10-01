# Astra red-team report

## Verdict: REVISE

The plan’s central raw-versus-shown design is workable, and the stored key shape is compatible with the row model. It is not ready to execute unchanged.

The three most important findings are:

1. A hide can enable publication while every pending count and list still says zero.
2. Cross-week crew-rest and seven-day traces cannot follow the warning’s saved hide.
3. The next-week preview still displays a red warning-derived time box after that exact warning is hidden.

## Findings

### 1. The next-week preview still flags a hidden warning

Severity: MEDIUM

Scenario:

- Setup: next Monday contains a flying line whose take-off and landing times are equal, raising `FLT_NO_LEN`.
- Action: load next week, hide that warning, save it, then return to the current week where next week appears in the preview.
- Expected: D469’s “puck no flag” rule applies to every representation of that exact warning; the red time box should be absent.
- Disproving observation: the preview’s take-off and landing boxes remain red and retain the warning tooltip.

Code evidence:

- `ui/peek.ts:42` imports `fltNoLen` and `FLT_NO_LEN_SAYS`.
- `peekWave` at `ui/peek.ts:105-113` independently applies `badtm` and the warning tooltip.
- It does not read `WARN`, the target week’s `wo`, or a warning identity.
- Plan §10 explicitly leaves this red box unchanged. This is a new-data failure, not a D56 migration concern.

Exact fix:

1. Refactor construction of the `FLT_NO_LEN` warning identity into an engine helper used by both `validateCore` and `peekWave`.
2. Add a read-only week-stash accessor returning the target week’s working `wo`.
3. Pass the target week key and day index into `peekWave`.
4. Build the exact `hideKey` for the prospective `FLT_NO_LEN` warning.
5. Apply `badtm` and its tooltip only when that key is not hidden.
6. Include target-week `wo` in the preview cache signature.
7. Add tests covering hide, unhide, reload, leave-and-return, and a second week.

### 2. Cross-week traces have no warning identity to follow

Severity: HIGH

Scenario:

- Setup: Sunday in week W leads to either a crew-rest breach or the excessive-days-run warning on Monday of week W+1.
- Action: load W+1, hide Monday’s warning, persist it, then return to W.
- Expected: D475 expressly says a hidden crew-rest warning removes the dotted previous-day mark; D469 says the hide is kept for everyone.
- Disproving observation: Sunday still shows “Breaks Monday.” A naïve implementation of the proposed replay rule could instead remove every cross-week trace, including unhidden ones, because no matching warning exists in W’s warning bundle.

Code evidence:

- Same-week run traces are made by `traceRun` at `engine/validate.ts:339`.
- The cross-week run path at `engine/validate.ts:349` has no local target warning.
- Crew-rest traces are made at `engine/validate.ts:560`; the next-Monday call suppresses the warning because its local `di` is null.
- `weekctx.ts`’s `nextMondayWorked` and `nextMondaySeed` provide content, not the target week’s effective hide state.
- Plan §3.2 says traces carry a target `di`, but §10 concedes that the cross-week forms do not follow the target week’s hides.

Exact fix:

1. Refactor the `CREW_REST` and `DAYS_RUN` warning-message construction into helpers returning the canonical target warning descriptor.
2. Record `targetWeek`, `targetDi`, `code`, `who`, and the canonical target `hideKey` on every trace.
3. Add a pure accessor that resolves effective hides for a stashed target day:
   - working `wo` for an unpublished target day;
   - the current issued version’s `w.wo` for a published target day, so a pending hide waits for amendment under D471.
4. During trace replay, suppress a cross-week trace only when its exact target key is hidden.
5. When the target warning cannot be resolved, retain the trace; absence from the current week’s warning array must not itself suppress it.
6. Test both rules in both directions: unhidden trace remains, unrelated hide does nothing, exact hide removes it, unhide restores it, reload/week switching preserves it, and published-target amendment semantics hold.

### 3. Bundle identity no longer reliably identifies the official render world

Severity: MEDIUM

Scenario:

- Setup: a draft day on View-only Sched contains an ALL AVAIL count chip; another published day has a working amendment, so official and working worlds differ. Hide a warning so `faceWarn()` must return a filtered bundle distinct from raw `OFFICIAL`.
- Action: render the draft day through `withOfficialWarn`, then tap its ALL AVAIL chip.
- Expected: the chip records that it was drawn in the official face, and the overlay replays that same world.
- Disproving observation: `data-oilofw` is absent, so `AvailWindow` opens in the working world and can show different flags or people from the chip that opened it.

Code evidence:

- `ui/html.ts:666` detects the official world using `WARN === officialWarn()`.
- `ui/AvailWindow.tsx:57-66` trusts the resulting `data-oilofw`.
- The existing regression at `ui/availwin.test.tsx:867-877` requires the official-world marker.
- Under the plan, `WARN` is a shown copy while `officialWarn()` remains raw; identity is therefore no longer a world marker.
- `dayWarnHTML` has a related identity assumption at `ui/html.ts:1047`: a hide alone can make its `diffMode` true even when raw warnings did not diverge.

Exact fix:

1. Add an explicit warning-render-world marker, such as `working | official-face | version`.
2. Set and restore it in `withOfficialWarn` and `withVersionWarn` using `finally`.
3. Replace `WARN === officialWarn()` at `html.ts:666` with that marker.
4. Replace the `dayWarnHTML` identity test with raw working-versus-official divergence, not shown-bundle identity.
5. Extend the ALL AVAIL regression with an active hidden warning that forces `shownOf` to return a copy.
6. Add a test proving a hide by itself produces no “new once signed” or “goes away once signed” row.

### 4. `hideDelta` does not automatically enter the pending-item authority

Severity: HIGH

Scenario:

- Setup: a published day has one warning, no other changes, and valid sign-offs.
- Action: hide that warning.
- Expected: one pending change; sign-offs fall; the pending list says “Warning hidden”; the publish control and day header both say one; the issued AL records one unit. Loading the issued version should warn that one edit will be discarded.
- Disproving observation if the plan is implemented literally:
  - the publish button becomes available and sign-offs fall because `dayDelta` is non-empty;
  - the day header and pending list say zero;
  - `alIssue` stores the hide in `diff` but stores `units: 0`;
  - the load confirmation says zero edits will be discarded.

Code evidence:

- `dayPendingItemsIn` at `engine/publish.ts:210-257` explicitly appends `warnDelta` and no other warning-related axis.
- `dayDelta` at `publish.ts:523` is a separate authority.
- `alIssue` at `publish.ts:1071-1077` stores `diff` from `dayDelta` but `units` and `ukinds` from `dayPendingItems`.
- `dayDiscardCount` at `publish.ts:675-705` separately calculates what `loadVersionToWorkingCopy` replaces.
- Therefore the plan’s statement that concatenating `hideDelta` into `dayDelta` makes all counts and lists follow “with no further change” is false.

Exact fix:

1. Extend `PendItem.axis` with `'hide'`.
2. Append `hideDelta(di)` inside `dayPendingItemsIn` whenever `sc === SCHED`.
3. Give each hide unit its warning words and direction: hidden or flagged again.
4. Add `hide` to `itemCounts` and `diffCounts`; subtract it from the generic `chg` calculation.
5. Add an explicit `kind === 'hide'` branch to `ui/pendlist.ts:pendItemWords`.
6. Add to `dayDiscardCount` every working hide whose state differs from the version that `loadVersionToWorkingCopy` will install.
7. Test one hide and multiple hides against every authority: `dayDelta`, `dayPendingItems`, header count, pending list, sign-offs, publish button, `alIssue.units`, `ukinds`, and load confirmation.
8. Test hide→unhide returning all those authorities to zero under D98.

### 5. The promised human-readable history line has no complete data path

Severity: LOW

Scenario:

- Setup: hide a warning naming a person, then flag it again; subsequently Undo either action.
- Expected: one “The day” history line saying “hid a warning — <human words>” or “flagged a warning again — <human words>”; Undo/Redo should also be attributable.
- Disproving observation: no history line appears. If the line is reconstructed only from the persisted key, it can expose folded IDs such as `@person-id` rather than the warning’s words.

Code evidence:

- `state/changelines.ts:433-449` handles inputs, Leave War records, people, cross-lines, and boundaries; it has no `sched.mutes` branch.
- `sched.mutes` stores only arrays of keys at `state/sched-commit.ts:124`.
- `commitSched` already supports command metadata at `sched-commit.ts:521-531`.
- `schedWriteValue` drops that capability at `sched-commit.ts:592-596`.
- `undo/describe.ts:53` can only say the generic “muting a warning,” including for reactivation.
- Undo history’s date extraction also lacks `sched.mutes`.

Exact fix:

1. Add a `meta` argument to `schedWriteValue` and forward it to `commitSched`.
2. From the `data-woff` handler, pass immutable metadata containing the warning’s human message, code, day, key, and resulting hidden state.
3. Add a `sched.mutes` branch to `changeLinesFor`; derive the ISO day from `<week>#<di>` and log under `sect: 'day'`.
4. Use the metadata for wording; do not parse display text from the folded storage key.
5. Teach Undo/Redo history date collection to recognize `sched.mutes`.
6. Give `undo/describe.ts` separate hide/reactivate wording from command metadata.
7. Test hide, reactivate, Undo, Redo, a callsign rename, and another user’s same-day conflict refusal.

## Mark attribution audit

Every `validateCore` mark site was checked.

| Sites in `engine/validate.ts` | Required warning code |
|---|---|
| `536`, `560` | `CREW_REST` |
| `568` | `CREW_TIGHT` |
| `617` | `DT_SUM`, not the displayed `DT` glyph |
| `627` | `TURN`, not `CREW_TIGHT` |
| `667`, `678`, `869`, `1166` | `DOUBLE_BOOK` |
| `672`, `780` | `SHIFT_SOFT` |
| `704` | `SC_INTIME` |
| `731`, `786` | the emitted `DNIF_FLY`, `LEAVE_FLY`, or `INPUT_FLY` branch |
| `807`, `1130` | the emitted `DNIF_FLY` or `LEAVE_FLY` branch |
| `843`, `1109` | `SC_QUAL` |
| `854-856`, `1024`, `1030`, `1034`, `1182-1184`, `1241-1243` | `QUAL` |
| `901`, `904`, `919`, `922`, `944` | `NO_BRIEF`, `DEBRIEF`, `SIM_BRIEF`, `SIM_DEBRIEF`, `LONGDAY` |
| `959`, run traces from `339` | `DAYS_RUN` |
| `1014-1016` | `CREW_SOLO`, `ILLEGAL_CREW`, `CO_APPROVAL` |
| `1025`, `1060-1061`, `1065` | `PAX_CREW`, `AAR_INSTR`, `AAR_QUAL` |
| `1085`, `1094`, `1098` | `OCU_NO_IP`, `NO_IR`, `NO_IR` |
| `1230` | `SANS_AVAIL` |

At all ordinary sites, every marked person is included in the adjacent warning’s `who`. The multi-person warnings—`DT_SUM`, crew pairings, `AAR_INSTR`, `OCU_NO_IP`, `NO_IR`, and grouped `SC_QUAL`—also include every person marked.

The deduplicating `add` is safe: the maps are set-like and replay uses the existence of any shown warning for the same target day, code, and person. Two same-code warnings keep the mark until both are hidden.

The only attribution hole is the cross-week trace described above. Same-week crew-rest and run traces have a target warning; cross-week traces do not have one in the loaded bundle.

Replaying marks in their original order through the existing `SEVR` and `RANK` rules can reproduce the maps exactly. The replay test must force the replay path with an empty hidden set; testing only `shownOf(raw, empty) === raw` exercises the identity fast path and proves nothing about reconstruction.

## Explicit negatives

### 1. Each mark knows its warning

Apart from cross-week traces, I found no mark whose person is absent from the warning’s `who`, no ordinary mark without a warning, and no unavoidable code mismatch. The `DT`/`DT_SUM`, `TT`, `C`, `CP`, `Q`, and `A` glyphs simply require the exact site-specific mappings listed above.

### 2. Shown bundle versus raw bundle

Apart from the two identity assumptions in `ui/html.ts`, the proposed split is sound:

- `warnSliceKey`, `warnSliceOf`, `HOOKS.issuedWarn`, `HOOKS.warnNow`, `warnDelta`, and `officialDiverges` should remain raw.
- UI lists, maps, counts, Insights, person selection, highlights, and drop feedback should use shown data.
- `restIfPlaced`’s existing-warning and trace probes must use `rawWarn`; the plan identifies both reads.
- Bundle-identity memoization remains safe because a toggle revalidates and produces a new shown bundle.
- I found no additional production warning reader omitted from the roll-call. `openWarns` is dormant, and `personWarnDays` has no production consumer.

### 3. Published day and versions

Subject to fixing the pending-item split, `w.wo + w.shown + w.face` is sufficient:

- current published faces can combine frozen marks with live-on-face warnings under the issued hide keys;
- older versions can render their frozen shown face;
- `retiredEntry` retains `w`;
- callsign folding prevents a named person’s rename from rearming the warning;
- raw comparison prevents a hide from also becoming “Warnings on this day changed.”

A hidden-as-issued warning that no longer exists in today’s issued-day judgement correctly creates no separate hide delta: `warnDelta` carries the actual warning change and the next issue omits the stale key. A warning present only on the working copy also correctly has no separate hide delta; it goes out with the content change that created it.

I found no additional hide/publish/amend/unpublish/version/rename sequence that silently changes a published face.

### 4. Kept for everyone

The proposed boot fix, session-reset change, history snapshot, week stash, and restored-record validation address the existing loss path.

The new key still begins with the numeric day, so `weekrows.ts:splitParts` and `sched-commit.ts`’s `String(k).split('|')[0]` remain valid.

The `sched.mutes/<week>#<day>` record grain also fits D148: another user changing the same day’s hides blocks Undo, while a change on another day does not. I found no doubling or wrong-week attachment outside the cross-week display issue.

### 5. Lists and counts

The roll-call covers the production surfaces:

- week and board pucks, seats, extras, Available crew, SANS, Unavailable, and Personal Inputs;
- `dayWarnHTML`, `dayInfoHTML`, and phone-folded `boardWarnHTML`;
- person-narrowed rows and “also flagged on”;
- `new once signed` and `goes away once signed`;
- Insights, Modals, highlight days, drop feedback, and the ALL AVAIL panel;
- current and older version looks.

Keeping hidden rows in-place while filtering only counts and worst colour supports the all-hidden “No issues” state and preserves person-filtered struck rows.

The current “N hidden” implementation survives in `WMOPEN`, board rendering, styles, tests, and `docs/file-map.md`; the plan names their removal/update. I found no additional production “N hidden” label outside those named areas.

### 6. The four accepted limits

- Logic’s “fired NA-” count is sound: it reports rule executions, not visible warnings.
- The next-week zero-length time box is a real new-data failure: Finding 1.
- Cross-week crew-rest/run traces are a real new-data failure: Finding 2.
- I found no current `validateCore` emitter that automatically inserts a roster callsign into a warning message while excluding that person from `who`. The unrelated-callsign rename limit is therefore not an active defect in current code. A future emitter doing that must include the referenced person in its identity inputs.

### 7. Anything else

The role model is sound:

- only `canEditSched` users receive hide/reactivate controls and the `sched.warnMute` write;
- members and guests see the same struck line without a button;
- Undo/Redo stays on scheduler surfaces;
- print and export currently render no warning flags, satisfying D471.

The hidden-warning state remains inside the scheduler command and storage model; I found no required role, print/export door, or separate write path omitted beyond the history branch in Finding 5.

No finding above depends solely on already-stored data. D56’s demo-data exclusion was applied.

