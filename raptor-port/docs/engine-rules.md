# Engine rules, as shipped

Detail split out of `CLAUDE.md` (which keeps the index and the
always-needed architecture rules). Read this when working on validation,
the rule thresholds, publishing/amendments or auth.

## Validation

`collectEvents()` builds per-day events from DAYS + INPUTS; `validate()`
produces `WARN {all, byDay, sev, chip}` and publishes `REST`/`EVD` (all three
are REASSIGNED per validate — read them fresh). Severities: `hard`, `adv`,
`note`. `overlap()` is **half-open** — abutting windows do not clash.

- A sortie occupies step (T/O − VCONF.step) to dekit (land + VCONF.dekit).
- **The brief is the time INDICATED on the line** (owner, 6 Aug 26): `f.br`,
  key `ff:di.gi.li.br`, editable on the edit week and the board. Blank means
  not indicated, and the line then briefs at `T/O − VCONF.briefLead` — the
  same value the board offers above the box as a click-to-accept suggestion,
  so a blank line is still checked but nothing is silently "decided". That
  setting is a convenience for working out the suggestion, NOT a rule: what
  every brief-driven check follows is the indicated B. Brief window
  = brief → T/O. A published in-time still moves report time and crew rest,
  never the brief.
- **On an SC line the B box is an IN-TIME, not a brief** (owner, 24 Aug 26 —
  "only if the brief time is filled in then u will use that as the in time for
  the warnings and advisories. But we will hardly have a brief time"). A
  standalone briefs nothing, so `f.br` on `w.kind==='sc'` is read as the crew's
  report time: typed, it becomes `intime` (via the same small-hours `preflight`
  roll) and `insOf` anchors the shift's crew rest on the earlier of it and the
  shift start; blank — the normal case — leaves SC on its shift start exactly as
  before, so it is byte-identical when nobody types one. No blue suggested-brief
  ghost is offered on SC, and the board drops its "in-time · N ac" header note.
  AVALON/BB never reach the fly collector (`saExempt`), so their B stays inert.
  Two more consequences, MAIN only, added the same day (owner: "if B is filled
  earlier than TO for main only, include the long day duty hours span
  calculation. Have a no brief advisory as well if anything cuts or ends
  between B and TO time"): `workSpan` starts a shift's day at
  `min(report, start)`, so an early B counts toward the long-day note and the
  week's duty-hour totals; and any commitment that overlaps the B→start window
  raises the amber `SC_INTIME` advisory — other events unless they also overlap
  the shift itself (that is the hard clash loop's business), plus timed
  personal inputs through the same `restsInput` gate crew rest uses. A SPARE
  row has no event stream, so both stay MAIN-only by construction.
- **Typed pre-flight clocks follow a small-hours T/O across midnight.** When
  the configured brief lead already puts the default brief on the previous
  evening, an indicated B later on the clock than T/O is shifted back one day;
  the published in-time does the same when `reportLead` crosses midnight.
  Thus a 00:30 T/O can carry B 22:10 and an in-time of 21:30 as negative
  minutes on the previous evening, exactly like its blank-B default. The roll
  is deliberately limited to that small-hours boundary: a later clock typed
  against an ordinary daytime sortie remains visible as typed rather than
  silently becoming a nearly 24-hour lead.
- **A TIME CELL TAKES A TIME, OR NOTHING** (owner, 12 Aug 26 — "start and end
  times must be numbers etc. if not reject the input"). `slots.ts`'s `txtSet`
  refuses any value in the `TIME_TXT` family that `hmOK` (`time.ts`) does not
  accept, and `inputedit.tsx` asks the same question of the input cells and the
  dialog. Two things are refused, both malformed rather than merely unwise:
  a MINUTE component of 60–99 (`1290` is a fat-finger for `1230`, and `parseHM`
  rolled it to 13:30 — a time an hour later than the one typed, saved in
  silence), and anything past `2400` (`9999` became `100:39`, which printed as
  a take-off, produced a "32h05 work day" note contradicting its own printed
  ends, and a crew-rest line reading "-5h-5"). An UNREADABLE value is refused
  too, where it used to be normalised to empty — which did not merely fail, it
  CLEARED the cell, and a line with no take-off leaves the conflict engine
  entirely, taking its warnings with it. Clearing a time deliberately is still
  legal; `2400` is still midnight.
  **`parseHM` itself stays loose** — it is the shared reader, used by the Logic
  tab and by two prose scrapers, and its semantics are pinned by tests and by
  the reference. The range question belongs at the write path, which is where
  the brief guard below already lives.
- **A brief cannot BE typed after its own take-off** (owner, 12 Aug 26 — "put
  guard rails to deny such inputs", after the audit found what one does).
  The window is brief → T/O, so a later brief inverts it and `overlap()` stops
  matching anything inside the real brief slot: the line's `NO_BRIEF` check
  went silently dark, which is the one failure mode a soft-bar app must not
  have. The engine still does not reinterpret such a pair (the rule above
  stands); instead `slots.ts`'s `txtSet` — the one write path both surfaces
  share — closes both ways in:
  - **Typing the brief after the take-off is REFUSED.** `txtSet` returns
    false, which each caller already answers by reverting its own cell
    (`boardChange`, `routeFocusOut`), and the reason is toasted. Refused
    rather than warned because, unlike every other bar in this app, it is not
    a planning decision anyone could mean — it is a typo.
  - **Moving the TAKE-OFF earlier past an existing brief is ALLOWED**, and
    the stranded brief is CLEARED — through `noteChange`, so the clear marks
    pending and lists like any edit — with the reason toasted. The take-off
    is the primary fact and must never be refused; the empty B box then falls
    back to the suggested lead exactly as a blank B always has, and shows the
    scheduler there is a brief to retype.
  Neither fires where the roll above makes the clock legitimate (`toM <
  VCONF.briefLead`), and neither touches a standalone wave's inert B.
- Crew rest (VCONF.crewRest) runs off the last commitment of **ANY kind**
  the day before (owner, 21 Aug 26, in two steps the same day: duties
  joined the sortie-or-shift set in the morning — an Ops-O ending 21:30
  with a 09:00 report next morning is a breach, not merely tight turning —
  then "anything that ends the day prior and affects the 12 hour crew rest
  will be a warning" widened it to sims, ground events and programme items
  too). A sortie ends at land + debrief; every other kind ends at its
  WRITTEN end with no tail — a sim counts its box end, its brief/debrief
  windows stay the SIM_BRIEF/SIM_DEBRIEF rules' business. Every ender rides
  the `REST[]` map the palette reads, so the picker and the engine agree.
  It anchors on the man's **FIRST COMMITMENT of the fly-day** (owner,
  21 Aug 26 — "reports the next day at 0800 for meeting, but even tho the
  in time writes 1000… the first event of this day already breaks the 12
  hour rest. Think it as, this person needs 12 hours of rest in order to
  fly"): the earliest of the instructed flying report — itself the earlier
  of the published in-time and the leg's own brief — and the start of any
  other scheduled commitment that day (sim, duty post, ground event,
  programme item; not the flying legs' derived step pads). The rule only
  exists when he FLIES that day — a meeting-only
  day needs no rest. **The message reasons CAUSE-FIRST, said once** (owner,
  22 Aug 26 — "refine the way u reason the crew rest warning. Clear and
  concise"): `Crew rest breach — <tail>, but told to report HH:MM — only
  XhMM rest.` — yesterday's end, when rest clears, then the commitment that
  breaks it with the shortfall in the same breath; no trailing "so he had
  to leave by" (the cross-day trace row's bold lead already prints the
  leave-by, so the message saying it too read as repetition).
  When an earlier event binds, the message names it
  ("his day starts 08:00 (MTG) before the 10:00 report"), the warning
  anchors on that row, the leave-by is measured from it, and a late-show
  remark on
  the jet cannot dash the ring — a sanctioned late join to the sortie does
  not excuse the meeting. Mirrored into the reference by
  `refwin.ts:refirst()`.
  **Duty & commitment INPUTS joined both sides the same day** (owner —
  "everything in duty and commitments affects crew rest… do not include
  personal, sans availability"; "use the timings u see"): an input whose
  type passes `inputs.ts:restsInput` (Training, CSE, Meeting, Fly with,
  Appointment, Duty, OD, Other — NOT the type spelled 'Personal', not SANS
  Availability, and no leave or medical type) counts exactly like a
  scheduled event, on BOTH sides, provided it carries TYPED times: an
  all-day record spans the full 1439 minutes and moves nothing. Ending
  late yesterday it starts the clock at its written end (no debrief tail)
  and rides `REST[]`; starting early on a fly-day it binds the anchor, is
  named in the message via `inpLabel` (an Other reads by its remarks), and
  the warning anchors on the LEG — an unaccepted input has no board row to
  jump to. The `nx`/`pv` midnight-tail copies in `day.input` are skipped —
  counting an `nx` copy would file today's own meeting as yesterday's end.
  Mirrored by `refwin.ts:reirest()` (the type set is an inline regex there;
  change `restsInput`, change it too). On the seed this adds no warning —
  the one visible change is vinci's Monday Meeting (09:00–17:00) holding
  his Tuesday REST entry at 05:00. Breach = hard CR;
  nominal-inside-rest with the instructed report clear = adv TT (the
  advisory is now only that gap, never a severity downgrade by event kind).
  Exactly `crewRest` is legal — the breach is strictly less (owner, 6 Aug 26).
  Reference mirrored by `refwin.ts:rerest()`; pinned in `dutyrest.test.ts`.
  The seed week raises no new warning under the widening (verified by WARN
  diff, 21 Aug 26) — only the REST maps grew.
- **Monday now checks against the previous week's Sunday** (owner, 23 Aug
  26). `idx>0` used to gate the whole crew-rest block off on the loaded
  week's first day, so a late Sunday finish never counted against Monday's
  report and the crew picker's Monday rest times (`REST[0]`) were always
  empty. `weekctx.ts:prevSundaySeed` now stands in for `ev[idx-1]` on
  Monday — a pure read of the previous week's Sunday off `weekBundle` +
  `INPUTS`, shaped like a real day entry but with `di:null` — so the block
  runs unconditionally and `REST[0]` is real. `di:null` makes `markTrace` a
  no-op there: a Sunday-caused breach traces onto Sunday's OWN day when that
  week is loaded, never onto a synthetic slot on the week now on screen. An
  unauthored previous week seeds nothing, so the seed week's own behaviour
  and reference parity are unchanged.
- **What a non-loaded week can and cannot be made to answer** (`weekctx.ts`
  header). All cross-week reads above (`seedRunIn`, `prevSundaySeed`, the
  midnight-tail edges, and the forward crew-rest trace below) are PURE reads
  off `weekBundle` + the global `INPUTS` — the week's authored/remembered
  SEED shape — never a live `DAYS`/`SCHED` for a week that is not loaded.
  **Since 23 Aug 26 that "remembered SEED shape" includes the scheduler's
  own session edits**, not only the authored data: `weekctx.ts:bundle(v)`
  checks the per-week session stash (`engine/weekstash.ts`, below) before
  the pure `weekBundle` seed, so a week the scheduler has edited and left
  feeds these reads its live remembered state. `SCHED` (publish/amendment
  state) is still never read here regardless — the rules judge the
  programme, not its publication state — and a week nobody has ever
  authored or edited still contributes nothing to any of these reads. A
  seed read is therefore only ever as good as what the app still remembers
  of that week, session edits included — exactly what a scheduler sees on
  navigating back to it. Nothing is invented and nothing is silently wrong.
- **The in-time line's grammar** (owner, 21 Aug 26 — "accept any form of
  combination", "U make the call on what u detect"). `events.ts:intimeTime`
  reads the FIRST valid clock time in a line — `0900`, `09:00`, `0900H`,
  `09:00H`, `0900L`, `09:00L`, any case — and never misreads glued tokens
  (`FL240`) or impossible clocks (`2590`). `intimeMap` scopes each line by
  the WAVE'S OWN formation callsigns: a line naming a formation's callsign
  anywhere in its text is that formation's in-time; a line naming none
  covers every formation that has no line of its own; a specific line beats
  a wide one whatever the typing order; several wide lines — the earliest is
  the show. `waveInTime` (the wave windows) reads the same detector, so a
  line can never set a report time the windows cannot see. The reference's
  stricter `<CS> IN TIME` grammar reads every SEED line identically, which
  is what keeps parity untouched where data exercises it; the wider grammar
  is a deliberate port divergence. Pinned in `intimes.test.ts`.
- **A sortie-caused breach spells out the debrief assumption** (owner, 15 Aug
  26 — "state why it would flag… the assumption that the crew will debrief 2
  hours after landing… because actually they can leave quickly after
  landing"). A sortie ends for rest at land + `VCONF.debrief`, so when a
  sortie set the binding rest-end the message reads `landed HH:MM,
  +Nh debrief assumed → ended HH:MM → crew rest clear at HH:MM` — the real
  landing, the pad named as an assumption, then the derived end and the 12h
  clearance, so a scheduler who knows this crew walks off fast can discount it.
  A **shift** ends at its written time with no debrief tail, so it keeps the
  plain `ended HH:MM`. The tail is a port-authored string parity compares, so
  `refwin.ts:rebrief()` tracks the same landing and prints the identical
  branch on the reference; pinned in `crewrest-ui.test.ts`.
  **The tight-turning advisory (`CREW_TIGHT`) reuses that same tail**, so it
  states the debrief assumption for free alongside the "3h report / inside 12h"
  it already named.
- **The long-work-day note names the debrief pad on its END the same way**
  (owner, 15 Aug 26 — "every timing warning"). When a sortie closes the day
  its end is `land + VCONF.debrief`, so the note reads `has a long work day:
  Nh, HH:MM → HH:MM (last landing HH:MM + Nh debrief assumed)` — the flagged
  hours, then the real landing and the pad flagged as an assumption. A
  non-flying finish (a duty, a ground event) is a fixed clock time with
  nothing to assume, so the end stays bare. The START is left plain: for a
  sortie it is the published report/step time (`report = in-time ?? step`,
  never the dead `T/O − 3h` fallback), not an overridable assumption. This is
  a port/reference divergence parity compares, mirrored in
  `refwin.ts:rebrief()`; pinned in `longday-msg.test.ts`.
- **A turn chips but never rings (owner, 7 Aug 26).** All three turn rules —
  `TURN` and `DT_SUM` on the day, `CREW_TIGHT` overnight — mark the puck with
  a chip alone. `CREW_TIGHT` used to ring amber as well, so the same `TT`
  glyph meant a ringed problem on one puck and an unringed note on another. A
  turn is a note, not something to go and fix. The warning is untouched: still
  filed, still counted in the banner, still clickable. This is a deliberate
  divergence from `reference/`, patched into the in-memory copy by
  `refwin.ts:rering()` so parity stays byte-exact; it fires nowhere on the seed
  week, so `engine/turnring.test.ts` builds the case rather than finding it.
- **A late show changes the RING, not the rule** (owner, 6 Aug 26). `late
  show` / `show at brief` / `show @ brief` in an AIRCRAFT's remarks
  (`events.ts:lateShowOf`, parsed like `briefLeadOf` and `aarNeed`) never
  moves the anchor and never removes the warning: it stays a hard red CR,
  counted with the rest. While the man still clears rest by **step**
  (`VCONF.step`, 60 min before T/O, editable — the SAME knob that pads the
  busy window, one setting since 21 Aug 26; the separate `showLead` key it
  replaced is removed, and the message calls the moment "step" because that
  is the owner's word for it) his puck rings
  **dashed** — sanctioned, and he makes the jet. Past that line it rings
  **solid**: he cannot walk, kit up and start engines, so he is unable to
  make the flight. Published per person as `WARN.dash[di][id]` (`dashOf`),
  because a chip carries no stroke of its own.
- **Every CR warning carries the leave-by time** and the day it is measured
  from — as DATA (`leaveBy`, `prevDi` on the warning), never message text
  since 22 Aug 26: the cross-day trace row's bold lead and the puck's hover
  title are where it prints (owner — the message restating it read twice).
- **The breach is also filed against the day that CAUSED it** (owner, 6 Aug
  26). A crew-rest warning is raised where the man is told to report, but the
  only day a scheduler can still change is the one before, so `validate()`
  publishes each breach a second time under its **previous** day:
  `WARN.trace[prevDi][id] = {di, dow, leaveBy, dashed, msg, fromKey}` — the day
  of the breach, the leave-by, and the message, so no surface re-derives a word
  of it. **`fromKey` names the leg on the CAUSING day that ran late** (owner,
  from the deployed site, 7 Aug 26): the slot-key of the rest-bearing event
  that set `prevFlyEnd`, i.e. the very sortie or shift the rule measured from.
  Rest is worked out from a minute count, so the event itself used to be thrown
  away — but the cross-day row is the one affordance a scheduler can act on,
  and it has to be able to point at the sortie to MOVE. It rides on the trace
  and deliberately **not** on the warning: `parity.test.ts` compares every field
  of `WARN.byDay` against the reference, while `WARN.trace` is port-only, so
  this stays clear of the reference entirely and needs no `refwin.ts` patch.
  Accessors: `traceOf(di,id)`; `traceLeads(di,id)`, which is `traceOf`
  narrowed to the case where the man carries no LOUDER chip of his own that
  day (the one test both the printed flag and the click routing use, so they
  cannot disagree); `traceIx(t,id)`, the breach's index in the next day's own
  warning list; and `tracesOn(di)` for the whole day. It is model state, not
  focus state — nothing has to be clicked for it to exist. What the UI draws
  from it (a dotted ring, a CR label, a cross-day row) is in
  `ui-contracts.md`.
- **The forward trace across the week edge** (owner, 23 Aug 26 — "If I plan
  someone who bust crew rest the day prior it should also flag out just
  like what u see for outlaw"). The within-week trace above stops at the
  loaded week's own edges — a late Sunday busting NEXT week's Monday had no
  trace to draw, because Monday belongs to a week that is not loaded. Fixed
  by running the SAME extracted computation (`validate.ts:crewRestDay`) a
  second time after the day loop, with `weekctx.ts:nextMondaySeed(CURWEEK)`
  standing in as a PHANTOM "today" and the loaded week's own Sunday
  (`ev[6]`) as its yesterday: `crewRestDay(ev[6], nextMondaySeed(CURWEEK),
  null, true, null)`. The `phantom` flag guards every write addressed to the
  phantom day itself (no `add`, no chip, no ring, no `REST[]` entry — there
  is no real day index to address), leaving exactly one side effect:
  `markTrace(prevDi, id, …)` onto Sunday, the day that caused it. The trace
  it writes carries `di:null` (no in-week day to jump to — `html.ts`'s
  `dayTraceHTML` renders it as an informational row with no click target,
  titled "Next week's Monday — load it to see the breach itself"), and it is
  a POINTER only: the breach warning itself still lands on Monday, as a real
  clickable `CREW_REST` line, only when next week is loaded and validated —
  this pass writes no second warning. Because `nextMondaySeed` reads through
  `weekctx.ts:bundle()`, an edited-and-left next week (the per-week session
  stash, below) is exactly what Sunday is judged against, matching what the
  real Monday will validate against once its week loads. **`CREW_TIGHT`
  never traces**, forward or within-week — only a full hard `CREW_REST`
  breach calls `markTrace` at all, so the phantom pass inherits that
  automatically rather than needing its own guard. An unauthored, unedited
  next week seeds empty arrays and the phantom pass writes nothing; the
  default demo weeks draw no forward trace (verified). Pinned by test;
  on-screen contract: `ui-contracts.md` §Three crew-rest rings.
- **What a non-loaded week can be made to answer now reads the session
  stash FIRST, the pure seed second** (23 Aug 26 — the per-week stash,
  `engine/weekstash.ts`, fixing a reported bug: a duty planned on an
  unauthored week's Sunday vanished after scrolling away and back, and the
  crew-rest flag it should have raised on the following Monday never fired,
  because every cross-week seed read only ever saw the pure, un-edited
  seed). `weekctx.ts:bundle(v)` — the one helper every cross-week read above
  goes through — checks `weekstash.stashHas(v)` before its own cached
  `weekBundle(v)` seed on EVERY call: a week the scheduler has actually
  edited and left feeds `seedRunIn`, `prevSundaySeed` and `nextMondaySeed`
  its live, remembered session state instead of the untouched seed. This
  widens what a seed read can see, not the WINDOW sizes it looks through —
  `maxRun` days back, one day back for crew rest, one day forward for the
  trace are unchanged; only the DATA those windows are read against got
  richer. `SCHED` (publish/amendment state) rides the stash for the week's
  own restore (Flow E) but is deliberately not read here — the rules judge
  the programme, not its publication state. A stash entry that fails to
  parse (a truncated write, foreign data) degrades to "as if never edited"
  and falls through to the pure seed, never throws — this runs inside
  `validate()`, on every keystroke. An unauthored, unstashed adjacent week
  still seeds nothing, byte-identical to before the stash existed.
- Tight turn needs `max(VCONF.tightTurn, dekit + step)`.
- Double turn: two+ sorties in a day → ONE DT_SUM line naming everyone;
  **adv, not hard** (owner, 4 Aug 26 — double turning is routine and planned),
  matching the amber pucks. No span test — but **legs whose airborne windows
  (to..ld) overlap are a double BOOKING, not a double turn** (owner, 21 Aug
  26): the hard DOUBLE_BOOK clash speaks for that man, and he is in the DT
  chip/DT_SUM count only if some pair of his legs is sequential. One
  predicate (`validate.ts:dturns`) feeds both the chip and the line;
  `refwin.ts:redt()` carries it into the parity reference.
- **NO_BRIEF and SIM_BRIEF are adv, not hard** (owner, 4 Aug 26): the clash
  itself already carries the red; the eaten brief window is advice on top of
  it. DEBRIEF/SIM_DEBRIEF were already adv. The parity tests stay byte-exact
  via `refwin.ts:retier()`, which re-tiers the three call sites in the
  in-memory copy of the reference before boot.
- **An OFT remark can name its own brief lead** (owner, 5 Aug 26): an EP
  profile briefs `VCONF.epBrief` (15) before the box **unless its remarks say
  otherwise** — "BRIEF 30 PRIOR", "brief 30", "brief 30 mins", "30 prior",
  "30 mins prior" all read as 30, for that line only.
  `events.ts:briefLeadOf` does the parse (`\b` keeps DEBRIEF out; a value
  outside the Logic tab's 0–240 bound is a typo and falls back to the
  default). The AMT is untouched — its own BRIEF row is already the hard
  line. The seed EP-4s carry "BRIEF 30 PRIOR" on both builds, so
  `refwin.ts:relead()` patches the identical parse into the in-memory
  reference for parity.
- There are no OFFERS any more (owner decision, Aug 26). `Office`,
  `Available fly` and `Available duty` were removed as types and `isOffer` is
  gone with them. `Fly with` (named `Fly` until the owner renamed it, 14 Aug 26) gets no exemption: filed under Unavailable it raises
  `INPUT_FLY` and eats brief/debrief windows exactly as a `Meeting` does,
  using only its stated times — no brief/debrief padding is added to any
  input (padding is sortie-side: step→dekit).
- **The validator gate** (owner, Aug 26): `collectEvents` filters `day.input`
  through `inputFlags` = `isUnavail(type) || acc==='u'`, the single point all
  input passes inherit from. An UN-ACTIONED personal input is a request, not
  a commitment — invisible to `validate()`. Accepted to `'g'` it is
  represented by the ground row `acceptInput` created (in `day.events`), so a
  clash surfaces exactly once, as `DOUBLE_BOOK`/`SHIFT_SOFT`/brief-window
  codes on the ROW — keeping the input in `day.input` too would print every
  clash twice. (Since 26 Aug 26 the raw voice and the row voice GRADE ALIKE
  against an SC shift — red-list hard, Meeting amber, see the per-type rule
  below — and the deferral is what keeps it to one voice per day.) Accepted
  to `'u'` the input itself clashes, as an `OD` does. Known edge, by
  design: an all-day input accepted to `'g'` makes a time-less ground row →
  no event → no flag, same as any time-less scheduler-typed row. Found on an
  all-day `Fly` (owner report, 4 Aug 26) and GENERALISED on 10 Aug 26:
  `inputFlags` now defers to the promoted row only where that row carries
  real times, so every all-day promotion keeps its voice on the input and the
  clash prints exactly once either way. **And the deferral is per-DAY, not
  per-input** (audit, 12 Aug 26): the promoted row lives on ONE day of a
  multi-day span, so `events.ts`'s `inpShow` defers only on that day
  (`acceptedDay`) — every other covered day keeps the input's own voice,
  where before the accept switched off real `INPUT_FLY`/`NO_BRIEF` warnings
  on days that had no row to carry the clash. A deferred input whose row
  cannot be found at all stays visible rather than silently absent. `acceptInput` still refuses
  Unavailable-typed inputs outright — leave does not belong on the Ground
  Programme, and promoting one would make its row clash with its own source
  input.
- **Every input the validator can see clashes with every kind of tasking**
  (owner, 4 Aug 26). The "but tasked" loop used to cover leave and downchits
  only, so an overseas duty or an actioned-to-`'u'` personal input warned
  against a sortie but let a sim seat, a duty post or a ground row through
  silently. Now all of `day.input` clashes with all of `day.events`, and
  against `kind==='shift'` (an SC MAIN) the grading is **per TYPE** (owner,
  26 Aug 26 — the shift may launch the man):
  - **Red-list commitments — Training, CSE, Fly with, Personal, Appointment,
    Duty, Other — hard-flag the shift** (`INPUT_FLY` "Training but tasked —
    SC AM"). The list is the `shiftHard` flag on `INPUT_META`, read through
    `shiftHardInput()` — one body for the validator, the ground-row upgrade
    and the crew picker. All-day and timed alike.
  - **Meeting is the amber `SHIFT_SOFT` advisory** — you can still give a
    meeting to the man on standby — worded exactly like the accepted row's
    advisory so the raw and landed voices of one input read the same.
  - **An UNRECOGNISED type fails closed and hard-flags the shift** (owner,
    26 Aug 26 — closing the "softer only on shifts" seam). A type `inpMeta`
    does not know — a typo, or a record from an older store whose type was
    since renamed — already read hard against a sortie; it now reads hard
    against a shift too (`INPUT_FLY` "Trainng but tasked — SC AM"). The
    amber branch takes a KNOWN soft type only (the `inpMeta` gate in
    `validate.ts`), which today means exactly Meeting. Mirrored in
    `refwin.ts` `reinput` as the explicit MEETING literal; cross-engine pin
    in `parity.test.ts`, port pins in `scshift-inputs.test.ts`.
  - **ATT B hard-flags the shift** (`DNIF_FLY` "Downchit but tasked") — he
    cannot fly, and SC MAIN counts as flying. Everywhere else the `canWork`
    carve-out stands: a duty post, a sim seat, a ground row, a programme item
    and the AVALON desk stay proper for him. This closed a picker/validator
    drift — the crew picker had refused him SC seats all along. Scoped to SC
    MAIN deliberately; the owner will look at other ATT B areas later.
  - Leave, medical (ATT C, HL, OML) and overseas duty still hard-flag a
    shift — those close the man's day outright.
  - **The shift has ONE voice**: shift lines are excluded from the sortie
    "clashes with" loop (`e.shift` guard), so a leave no longer reads twice
    in two wordings, and the graded events loop above is the whole answer.
    The `SC_INTIME` in-time cut excludes shift-overlapping inputs for the
    same reason.
- **A ground row is graded by what it IS, not only by its kind** (owner,
  26 Aug 26). `events.ts:shiftEvHard` = `SHIFT_HARD[kind]` OR, for a ground
  row, the red-list overlay: a row lifted from an input is judged by its
  SOURCE type (`row.src`, corroborated by `prog===label` so a stale key
  fails soft — the only way an accepted 'Other', whose label is the remarks,
  still reads red). That fall-back-to-the-words for an unknown or stale
  `row.src` is DELIBERATE and survives the 26 Aug 26 fail-closed change to
  raw inputs: a LANDED row has its own words to be judged by, so the
  keyword matcher is its truth, where a raw input with an unknown type has
  nothing else to go on and fails closed. A hand-typed row is likewise
  judged by its own words
  (`shiftHardLabel`, a regex DERIVED from the same `shiftHard` flags —
  TRAINING, CSE, FLY WITH, PERSONAL, APPOINTMENT, DUTY, OTHER, word-bounded,
  case-blind). The owner chose those keywords knowing they are common words:
  a hand-typed "DUTY OFFICER HANDOVER" goes red on purpose. A row matching
  neither — MEETING, ACADEMICS, anything else — stays the amber
  `SHIFT_SOFT`. Programme (`a:`) items stay advisory always. The crew
  picker's `live` (avail.ts) reads the same `shiftEvHard`, so a Training
  ground row inside the window bars-and-names on an armed SC MAIN slot while
  a Meeting row does not; a raw red-list INPUT deliberately stays
  warn-not-bar there, matching the flying-seat modality. Reference parity:
  `refwin.ts` `reinput`/`reshift` mirror all of this keyword-only — the
  reference has no `row.src`, so an accepted 'Other' vs SC MAIN is a
  documented parity boundary no fixture may build. Pins:
  `scshift-inputs.test.ts`.
- **An actioned `Fly with` is AWAY** (owner, Aug 26: it means flying with
  another squadron). `isAway(inp)` = `isOffType(type) || (isFly(type) &&
  acc)` — it feeds `dayOff` (the Available-crew strip and the palette fade),
  `slotBar` (reason: "flying with another squadron") and the palette's
  `offReason`. Whole-day, either destination. An actioned `Fly with` is local, so
  since 10 Aug 26 it does NOT bar a standalone spare — `canSpare` decides
  that now, not leave-ness.
- **`INPUT_META` is the single source for every input type** (owner,
  10 Aug 26). It holds the twenty types the squadron actually books, and
  `INPUT_TYPES` is derived from its keys — the list, the rules, the Inputs
  page's type legend and the Logic page's matrix all read the same object, so
  none of them can describe a rule the engine does not apply. Fields: `name`,
  `grp` (`leave|med|duty|act`), `work`, `local`, `ground`, `half`.
  Every predicate is a lookup: `isLeave`/`isLocalLeave` off `grp`/`local`,
  `isDownchit` = `grp==='med'`, `isUnavail` = `grp!=='act'`, `isPersonal` =
  `grp==='act'`. Lookups are trimmed and case-insensitive, because the regexes
  they replaced were `/i`.
  `Downchit` and `Detachment` were REMOVED: OML / ATT B / ATT C carry the
  medical meaning, OD the overseas one, and the seed was retyped to match
  (a `refwin` patch, `redn`, teaches the reference the medical words).
- **`canWork` — the one place "cannot fly" and "cannot work" come apart.**
  Only `ATT B`: grounded but at his desk, so a duty post, a sim seat, a ground
  row or a programme item is proper work for him and raises nothing. The
  FLYING loop is untouched, so a jet still hard-flags. `validate.ts`'s
  non-flying tasking loop skips him; `slotBar` bars only a flying key (the one
  with no prefix).
- **`canSpare` is DERIVED, not stored**: `local && grp!=='med'`. That is the
  owner's rule in his words — local yes, overseas no — with medical the single
  carve-out, because HL/OML/ATT B/ATT C keep the man on the island but not fit
  to walk. Written against "a standalone spare" so the **AVALON rule the owner
  reserved** (10 Aug 26 — do NOT infer it) drops in without re-cutting.
- `isAway` = `isUnavail` + an actioned `Fly with`. Widened from `isOffType` on
  10 Aug 26: `Detachment` sat in `isUnavail` but never in `isAway`, so a
  detached man was neither hidden from the palette nor barred — he only raised
  a warning once you had already planted him. OD may not be planned for
  anything, an SC spare included, so it has to be here.
- The input types still split two ways, but the split is **presentational
  only** since 10 Aug 26 — it decides which block a row is drawn in and
  nothing else. `isUnavail` = leave + medical + OD; `isPersonal` = the
  activity types (Training, CSE, Meeting, Fly with, Personal, Appointment,
  **Duty** — a LOCAL duty added 18 Aug 26, identical to Appointment in every
  derived rule — and Other),
  which are also exactly the types a scheduler may lift onto the Ground
  Programme (`ground` in the table). Together they partition `INPUT_TYPES` —
  a test pins that nothing falls between them, and a second pins that
  `isPersonal` and `ground` name the same set.
- **Every input counts from the moment it is typed** (owner, 10 Aug 26 —
  "all will automatically go in"). `inputFlags` used to be
  `isUnavail(type) || acc==='u' || …`, so a personal input was a request the
  validator ignored until a scheduler actioned it. One carve-out survives, and
  it is about double-printing rather than admission: an input promoted to a
  ground row that can carry the clash defers to that row. An ALL-DAY promotion
  makes a TIME-LESS row, which never becomes an event and so can carry
  nothing — that one stays visible on the input itself.
- **…except one a scheduler has REMOVED, which is DORMANT** (owner, 26 Aug 26
  — tested the SC-grading preview, removed an accepted Training back to
  Personal Inputs and it still rang: "if it goes there, stop it from flagging
  anything, until its added back to ground programme"). The `acc` states:
  `'g'` landed on the Ground Programme (the row speaks; all-day keeps the raw
  voice) · `'u'` filed under Unavailable (bars everything, like leave) ·
  `'r'` **removed** — `unacceptInput` parks it instead of deleting `acc`, and
  `inputDormant` (`inputs.ts`) blanks it out of the whole engine via
  `inputFlags` + `inpShow`: no warnings, no advisories, no picker bar, no
  hours closed, no cross-week whisper — until the scheduler's Accept lands it
  again · undefined = never landed (e.g. filed onto a published day) — still
  counts, which is why dormancy is an explicit mark and not "no acc". The
  mark survives week switches (`loadWeek`'s acc-clear skips `'r'`;
  `autoAcceptInput`'s truthy-acc guard refuses to re-land it; the week
  stash's `un` set records ONLY explicit `'r'` rows — never acc-less ones,
  which can mean "never landed" and must go on counting, 26 Aug 26 bug
  pass), and `commitInputEdit` clears a stray `'r'` when a relink fails so a
  retype-to-leave can never end up as dormant leave — and clears the park
  outright whenever a dormant record's TYPE changes (same pass: a retype is
  a different commitment, so it fails closed and counts; time/remark edits
  keep the park). Deleting the input says the same thing louder.
- **Half-days** (owner, 10 Aug 26). Leave and medical types (`half` in the
  table) can be booked AM (00:00–12:00), PM (12:01–23:59) or all day. Stored
  as the `s`/`e` minutes the record already had, plus a `half:'am'|'pm'`
  LABEL — the engine reads only `s`/`e`. A half-day closes its own half only;
  see §Availability is time-aware below.
- **The CAT ladder is `OCU → D → C → B → A → IW → IP → IR → FI`** (owner,
  Aug 5 '26). The generic `I` tier and the standalone `ip` flag (and its
  derived `quals.instr`) are gone — instructor-ness lives solely in CAT.
  `isInstr(q)` = any of the four; `isInstrPilot(q)` = IP/IR/FI (the rear-seat
  privilege). Seat matrix:
  - `IW` (instructor WSO): WSO-only category, RCP only. A hand-edited record
    with `q:'IW'` + `seat:'FCP'` planted forward raises hard `QUAL` (the CAT
    dropdowns are seat-filtered, so the UI can't create it).
  - `IP` (instructor pilot) and `IR` (instrument rating examiner — pilot
    only): may fly FCP or RCP. IR replaced the old "instr rating exmr"
    meaning; holders kept the letters.
  - `FI` (fighter wing instructor): pilot or WSO. Seated by the person's own
    seat — a pilot FI follows the IP rules, a WSO FI the IW rules (the seat
    checks test pilots with `isInstrPilot` and WSOs by seat, so this falls
    out for free).
  `OCU_NO_IP` counts any of the four as supervision, as `p.ip||isInstr` did.
  Parity stays byte-exact via `refwin.ts:remap()` (retier's sibling), which
  migrates the in-memory reference's ladder tables, `isInstr`, puck builder,
  PEOPLE literals and legend to this world before boot.
  **The rear-seat privilege is the JET's rule only** (owner, 14 Aug 26 —
  "oft doesn't need an instructor to be in the RCP, likewise for amt"). A
  sim's rear seat takes any pilot: the engine's Q (sims) block guards the
  FRONT seat alone, and `slotBar` scopes its instructor bar with
  `slotRules().sim`. The sim's front-seat rules (no WSO, no IW-in-FCP, no
  ground crew) are unchanged. The reference still carries the old copied
  rule; `refwin.ts:resim()` excises it from the in-memory copy — it fires
  nowhere on the seed either way (every seeded sim rear seat holds an IP or
  a WSO).
- **The combination matrix (F-15SG Table 1.5-2, owner Aug 5 '26)** grades a
  crewed aircraft — the jet only, not the sim box — whenever the front seat
  is a CAT A–D or OCU pilot AND the back seat is a CAT A–D or OCU WSO. An
  instructor in either seat clears the matrix outright (an instructor pilot
  IP/IR/FI flies with anyone; an instructor WSO with any front seat — the
  table's "OCU pilot needs a valid IR" footnote is deliberately disregarded,
  owner), and a mis-seated body belongs to the seat rules (`QUAL`), not here.
  The gradings, each carrying the **crew-pairing chip** (owner, 5 Aug 26 —
  they used to be ring-only, which left them the one family with nothing on
  the puck to click):
  - `ILLEGAL_CREW`, hard: OCU pilot + CAT A–D WSO, or CAT A–D pilot + OCU
    WSO — "not an authorised combination". This code SUPERSEDES the old
    two-OCU hard rule; the two-OCU pairing is now the advisory below.
  - `CREW_SOLO`, adv: OCU pilot + OCU WSO — a crew solo, only allowed for
    sorties designated under the F-15SG Basic Course Syllabus.
  - `CO_APPROVAL`, adv: D+C, C+D and D+D (pilot+WSO) — CO approval required.
  Unlike `NO_IR`, the matrix DOES fire on the seed week (Mon bapster+nick is
  the crew-solo advisory, Wed krait+wrangler and pike+badger want CO
  approval, Thu bapster+badger is unauthorised), so `refwin.ts:rematrix()`
  patches the identical rule and WCODE labels into the in-memory reference
  before boot, at the exact call site the two-OCU line occupied — and, since
  the chip landed, the reference's `RANK`, `CHIP_TEXT` and `CHIP_LABEL` too.
  Miss any of those three and the failure is not in the rule but in the
  markup: an unranked code freezes on its first write, and the reference's
  puck builder falls back to the raw code for both glyph and tooltip.
- **The crew-pairing chip, `CP` (owner, 5 Aug 26; renamed from `CC`, owner ask
  5 Aug 26).** Every pairing rule above plus `OCU_NO_IP` and `NO_IR` marks it.
  It is **two internal codes** because a chip carries no severity of its own —
  `CP` where the pairing needs approval (amber), `CPH` where it is not
  authorised at all (red) — and BOTH print `CP`, so the squadron reads one
  flag. `CHIP_TEXT` maps them; the colours are `.l-cp` / `.l-cph` in
  `scheduler.css`. In `RANK` they are inserted, not reshuffled: `CP` leads the
  advisories, `CPH` sits under `C`, because a man booked in two places at once
  is a harder stop than a pairing wanting a signature. So a crew member
  already carrying a conflict keeps the `C` flag — the pairing is still
  reachable from the day's issue list.
- **`NO_IR`, hard: an IRT needs an IR examiner in the crew** (owner,
  Aug 5 '26). `IRT` (word-bounded, case-insensitive) in a formation's msn →
  an IR anywhere in that formation's crew; in one aircraft's remarks → the
  IR in THAT aircraft. Rings hard and chips `CPH` — it is a crew-pairing
  rule like the matrix. Fires nowhere on the seed week, which is what lets it
  stay out of `refwin` entirely while the parity suite stays byte-exact. The
  crew list behind both this and `OCU_NO_IP` excludes the ALL AVAIL sentinel
  (owner scenario run, 5 Aug 26) — a special PEOPLE record filling an unfilled
  seat is never named, ringed or chipped, the same exclusion `collectEvents`
  already applies to `allCrew`.
- **AAR, and who may TEACH it** (owner, 10 Aug 26). Currency is read off the
  remarks and has been since day one — `aarNeed` (`people.ts`) returns
  `DAAR` / `NAAR` / `null`, ignores a `B:` segment (a WSO holds no AAR
  currency) and already strips `NO AAR` / `NO DAAR` / `NO NAAR`. **It is
  byte-identical to `reference/scheduler.html` and pinned by `tfin.js` group
  V — do not touch it.** What is new sits on top of its answer.
  A bare `AAR` is night **when the wave is a night wave** — the wave's own
  day/night flag is the whole answer; writing `NAAR`/`DAAR` says it outright
  either way. **The clock is out of this rule** (owner, 21 Aug 26 — "make
  the rule for NAAR instead of a time"): a lands-after-19:00 clause used to
  tip a bare AAR to night, written as a literal in TWO places (`events.ts`
  for the validator, `avail.ts:slotRules` for the crew picker); it briefly
  became a setting that same day and was then removed with the rule — do
  not reintroduce a landing-time line here. `refwin.ts:reaar()` excises the
  reference's identical clauses so parity holds off-seed too. Pinned in
  `ruleflex.test.ts`, both readers.
  One quirk of that segmenter, found by the owner asking and pinned in
  `aar.test.ts`: it splits on an optional digit + `A`/`B` + colon, and that
  pattern turns up inside ordinary words. `AREA: … AAR` is harmless (an `A:`
  tag means the front seat, which is the default anyway), but a word ending in
  **B** before a colon — `SUB: AAR` — reads as a REAR-seat tag and the whole
  segment is dropped, so the AAR goes unseen. Inherent to a parser frozen by
  reference parity; recorded, not fixed. `text, AAR` is fine.
  Instructing AAR **from the rear cockpit is a separate sign-off**: an
  IP / IR / FI is not automatically cleared to teach it. The Quals page
  records the clearance by promoting the man's DAAR / NAAR tick to `'I'`
  (`aarInstrOK`); the state is a **truthy string on purpose**, so `aarOK` and
  every other "does he hold this?" reader keeps the right answer — a man
  cleared to teach AAR is by definition current on it.
  When the remarks call for AAR and the FRONT seat is not current, three
  outcomes, all in `validate.ts` inside `f.acs.forEach`:
  - back seat holds an instructor pilot **with** the matching mark → **nothing**.
    A supervised training sortie is legal, and flagging it was the defect.
  - back seat holds an instructor pilot **without** it → hard `AAR_INSTR`,
    anchored `ac.key+'.w'` and named on him, because he is the man to change.
    **Both crew ring and chip `Q`** — the matrix precedent; the jet is
    illegal, not one seat, and ringing him alone would leave the pilot
    actually flying the AAR reading clean.
  - back seat empty, a WSO, a non-instructor pilot, or the ALL AVAIL sentinel
    → hard `AAR_QUAL` on `.p`, exactly as before: nobody aboard can supervise.
  The suppression is **per aircraft, not per formation** — "sitting behind"
  was the ask, so an instructor in another jet of the same four-ship does not
  clear it. **The sim box is out of scope** and structurally so: `simcrew`
  records carry no remarks field, so there is no AAR need there to react to.
  Neither code fires on the seed week (its only AAR string is `1A: NO AAR`),
  which is what keeps `refwin.ts` unpatched and the parity suite byte-exact —
  `engine/aarinstr.test.ts` pins that as a rot guard so it fails there first.
  Two ladders, demoting to **different rungs**: `naar && !daar → false` (he
  loses night currency), but `naar==='I' && daar!=='I' → true` (he keeps
  night currency, loses only the clearance to teach it). Enforced at boot, on
  every tick, and in `deriveQuals` — which is also the CAT-change handler, so
  a man demoted out of the instructor ranks has his marks demoted with him.
  Without that last one the privilege would survive invisibly: the page only
  offers the third state to instructor pilots, so a stale `'I'` renders as an
  ordinary tick while still clearing a red warning.
- Leave and the rest of the absence vocabulary: see `INPUT_META` above.
  A standalone SPARE is barred by `!canSpare(type)` — overseas (OL, OD) and
  every medical code — raising a hard DNIF_FLY/LEAVE_FLY even though spares
  are otherwise `saExempt`, and the message says which of the two it is. SC
  SPARE carries no crew rest either way. SC currency is checked for MAIN and
  SPARE. SC NIGHT ⊂ SC DAY.
- **The two SC SPARE rules of 31 Aug 26 (owner)** — on top of `canSpare` and
  currency, an SC spare seat now carries exactly two more checks, both hard:
  - **Two SC seats in the same hours** — a man on a SPARE line who also holds
    ANY other SC seat (MAIN or SPARE, same wave or another) whose shift hours
    genuinely overlap is one man in two places: a hard `DOUBLE_BOOK`, worded
    "standing SC SPARE … and also on …", anchored on the spare seat and said
    once per pair. Abutting shifts are NOT a conflict — `overlap` is
    half-open, so SC AM 07:00–13:00 into SC PM 13:00–19:00 (the owner's own
    example, "the 1300 is not a conflict") stay two clean shifts. MAIN+MAIN
    needs no new rule (main shifts are events; the ordinary clash loop reds
    them). One body, `events.ts:scSeatHit` (a model walk — spares are absent
    from EVD by design), read by the validator AND the crew picker's
    `slotBar` ("already on SC AM MAIN 07:00–13:00"), so the palette refuses
    exactly what the warning list would flag after a drag-drop.
  - **The spare front seat is pilots-only** — a WSO (`seat==='RCP'`, plus the
    CAT-IW data-consistency variant) planted in a spare line's FCP raises the
    same hard `QUAL` the flying seat rules raise, suffixed "(… SPARE)" and
    anchored on the seat. The rear spare seat is deliberately unruled: the
    pilot-in-RCP mirror was offered and DECLINED (owner, 31 Aug 26) — the
    picker's seat rules still refuse those seats at arm time, so the only
    silent path was a drag-drop, and only the WSO-in-FCP half closes it.
  Deliberately NOT rules, unchanged: a spare against his own sortie, sim or
  duty raises nothing (spares stay free — the owner declined a call-up
  advisory the same day), and AVALON/BB are untouched (the AVALON rule stays
  owner-reserved). Pins: `scspare-rules.test.ts` (validator),
  `slotrules.test.ts` (picker); the parity compare excises the port-only
  `spareAcs` field (`parity.test.ts noPortOnly`).
- Standalone waves: SC (spares uncrosschecked beyond the four checks above),
  AVALON/BB (`noconf`).
- **AVALON's one check (owner, 11 Aug 26).** AVALON and its desk keep
  `noconf` — nothing on them is cross-checked against tasks, rest or
  qualifications — but every man on the wave now gets ONE look, the SC-spare
  shape widened. A JET seat (MAIN and SPARE alike) raises a hard
  DNIF_FLY/LEAVE_FLY for any input failing `canSpare` — overseas (OL, OD)
  and the whole medical group, **ATT B included**: these are jet seats, and
  ATT B means no flying. A DUTY role (SXO, OPS O, RUNNER, LOG CELL) mans a
  desk, so ATT B is carved out by `canWork`; overseas, HL, OML and ATT C
  still flag. Local leave, OIL, childcare, a course, an appointment — nothing
  raised, on either kind of seat. It warns, never blocks: the palette's fold
  is matched to exactly this rule (`slotRules().avJet/avDuty` widening
  `slotBar`'s spare exemption), so local leave no longer folds a man away
  from an AVALON seat the engine has no complaint about. **And an exempt
  line's puck follows ITS OWN rules and nothing else** (owner, 11 Aug 26,
  in two passes — first live use showed the engine flagging his AVALON man
  while the puck stayed clean; his second word was "the rings should also
  follow" the line's own red rules). `html.ts` reads the day's warning list
  for entries ANCHORED to the exempt line and naming the man: the
  availability check (DNIF_FLY/LEAVE_FLY → red C) and, on an SC spare, SC
  currency (SC_QUAL → red Q). A warning the man earned ELSEWHERE never
  bleeds onto an exempt copy — a spare routinely flies elsewhere the same
  day, which is why the old all-or-nothing gate existed. These lines ring
  red or not at all; the owner confirmed no amber rule lives on them. BB
  can anchor nothing and never rings. The badge and the add-toast say it
  per wave: AVALON "availability check only", SC's spare "availability and
  SC currency only", BB "not cross-checked". The 19:00–23:59
  half is judged against today's inputs and the 00:00–07:00 half against
  tomorrow's (the midnight tail below). Collected as `day.sacrew` in
  `events.ts`, checked in one loop in `validate.ts`. **BB is deliberately
  untouched** — the owner specified AVALON only; extending the bar to BB
  needs his word first.
- **The midnight tail (owner, 11 Aug 26 — "check in the same modality for
  all applicable rules based on timing").** A window that runs past midnight
  — a night sortie's landing and debrief tail, an overnight duty row, an
  AVALON shift — lives past minute 1440 of its day, where `win()` and the
  `ld<to` roll already put it. `collectEvents` appends TOMORROW's inputs to
  each `day.input` shifted +1440 (marked `nx`), so every consumer — the fly
  clash, the tasked clash, the brief/debrief windows, the SC-spare and
  AVALON checks, and any rule added later — judges the tail against the next
  day's inputs with no per-rule code. Today's events all end at or before
  1440, so they can never reach a shifted entry; a shifted all-day input
  still spans 1439 minutes, so `timedInput`'s all-day filter treats both
  copies alike; an input covering both days yields identical messages from
  both copies and the warning dedup collapses them to one. `slotBar` runs
  the same filter chain over the next day's inputs for any slot whose window
  passes 1440 (reason suffixed "(tomorrow)"), so the picker and the warning
  list move together. **The loaded week's LAST day's tail now reads the
  FOLLOWING week's Monday too** (owner, 23 Aug 26 — closing the hole this line
  used to describe): `weeks-data.ts:edgeDate` + `events.ts:buildDay` read the
  next week's Monday date label through the global `INPUTS`, the same
  date-keyed array a genuinely adjacent week's inputs already live in — no
  live `DAYS` for that week is needed or read. A genuinely unauthored next
  week still seeds nothing, so a Sunday tail is checked only against what
  the app actually has on file for the Monday after. The parity gate excises
  the `nx` entries and `sacrew` exactly as it excises `key` (port-only);
  `overnight.test.ts` and `audit-c-tail`'s fixtures pin the fixed edges
  positively.
- **AND THE TAIL RUNS BOTH WAYS (11 Aug 26).** The half above covers a window
  running PAST minute 1440; the mirror is a window opening BEFORE minute 0,
  and a small-hours take-off produces one with no overnight row involved —
  `briefLead` (140), `step` (60) and `reportLead` (180) are all subtracted
  from the T/O, so a 00:30 launch briefs 22:10 the previous evening and its
  occupied window opens 23:30 the night before. `collectEvents` therefore also
  appends YESTERDAY's inputs shifted −1440 (marked `pv`), by the same rules:
  a record with no usable window stays uncheckable, a shifted all-day copy
  still spans 1439 minutes so `timedInput` treats every copy alike, and an
  ordinary daytime sortie can never match one because its window never goes
  negative. `slotBar` carries the matching backward block (reason suffixed
  "(yesterday)"), because the picker and the warning list are required not to
  drift apart. **Day 0's pv tail now reads the PRIOR week's Sunday the same
  way** (owner, 23 Aug 26 — the mirror half of the same fix): a small-hours
  Monday take-off's brief/report window opening before minute 0 is judged
  against the previous week's Sunday inputs through the same `edgeDate` +
  `INPUTS` read, not left unchecked because the loaded week has no day
  before it. A genuinely unauthored previous week still seeds nothing.
  Found by measuring both directions against the same shape: the forward
  case flagged, the backward case was silent.
- **A duty block is minted from a TEMPLATE, not a wave** (owner, 13 Aug 26 —
  supersedes the 10 Aug wave-driven desk). `+ Block` on the scheduler board
  lists the saved templates (`engine/dutytpl.ts`) directly — no wave has to
  exist — and picking one copies its rows onto the day through `blockFromTpl`,
  which produces a PLAIN block `{label,rows:[{role,id:'',str,end}]}` with no
  `sa`/`noconf` marker. The seed library holds the shapes desks came in as:
  Standard (SDO/SXO/OPS O, blank hours), SC Shift (SXO AM, OPS O AM, SXO PM,
  OPS O PM), and AVALON (SXO, OPS O, RUNNER, LOG CELL, 1900–0700). A scheduler
  edits the library in the template editor (`ui/DutyTplModal.tsx`); it persists
  like the stores list. The role vocabulary is the owner's — `OPS O`, `LOG
  CELL`, spaced — and `DUTY_PICK` (the editor's datalist) IS `DUTY_ORDER`'s
  keys, so what a scheduler can pick and what Auto sort understands cannot drift.
  **A template time is a clock time or nothing** (owner, 16 Aug 26 — "no guard
  rails on duty templates timings": the editor took `2500` as a start). The
  editor refuses a malformed value on COMMIT (blur), not per keystroke — a toast
  and a revert to what the cell held, the same `hmOK` rule `txtSet` enforces on
  the schedule — and `tplTime` (`dutytpl.ts`) is the silent net under it at the
  two points a template time crosses into the schedule, `blockFromTpl` (minting
  a day) and `dutyTplLoad` (untrusted storage): a malformed value drops to `''`
  (a blank duty time is legal), a valid one canonicalises to the compact `HHMM`
  the model stores (`0700`, not `07:00`), so a stale value from a pre-guard
  session can never reach a day.
- **A template desk is conflict-checked like any other duty row** (owner,
  13 Aug 26). The wave→duty coupling is gone: no wave auto-creates a desk
  (`SAWAVE.autoDuty` removed from the add path), deleting a wave leaves any desk
  alone (the wave-delete → `saDutyIx` walk removed), and a template block
  carries no `noconf`, so the AVALON/BB desk exemption went with the
  auto-create. The seed week has no exempt desk, so reference parity is
  untouched. `events.ts` still honours a `noconf`/`sa==='avalon'` desk if one
  reaches it from an old AL snapshot, but no UI path mints one now. Do not
  re-add the coupling (`CLAUDE.md` §Stable decisions).
- Chip ranking `RANK` (highest wins): LD<DT<TT<A<SD<SB<DB<NB<CR<RUN<C<Q.
  Glyphs shorten: CR→R, RUN→7, NB/SB→B, DB/SD→D, LD→L. `A` = on shift AND down for
  a ground event/programme.
- **A break day is due after `VCONF.maxRun` (6) consecutive days** (owner,
  Aug 26). `DAYS_RUN`, hard, chip `RUN` (glyph `7`), ranked just above crew
  rest — both are rest breaches and this is the graver one. The run is counted
  once per `validate()` over the whole loaded week, in day order, off
  `day.events`, which is every kind of tasking there is: a flight, a duty
  post, a sim, a ground item, a programme row. Leave and downchits are NOT
  tasking, so a clear day resets the count, which is exactly what a break day
  is. The flag lands on the day that BREAKS the limit — the day the scheduler
  has to clear — not on the whole run. Because a run is a property of the week
  rather than of a day, it is precomputed before the per-day loop.
  **The count now walks in from before the loaded week** (owner, 23 Aug 26 —
  the flagging engine reads continuously, not just within a week).
  `weekctx.ts:seedRunIn` seeds each person's Monday run with a pure walk back
  through `weekBundle` + the global `INPUTS`, up to `maxRun` days before
  Monday (two prior weeks when `maxRun>7`), stopping the moment a nearer day
  is clear — a person absent on a closer day can never carry a run in from a
  farther one. A run that started before Monday and breaks the limit ON
  Monday now flags Monday, not only from Tuesday on. An unauthored prior
  week seeds nothing, so a scheduler who has never touched last week sees
  exactly today's behaviour, and reference parity is unchanged.
  NB the label carries no `{maxRun}` token: `wlbl()` renders every token
  through `lgT()`, which would print a day count as minutes.
- Warning labels embed `{crewRest}`-style tokens; `wlbl()` interpolates the
  LIVE VCONF value.

Where flags reach the screen: `ui/html.ts` builders read `WARN`/`chipOf`;
`ui/highlights.ts` decorates pucks after every render; the board's
live-checks panel is `boardWarnHTML` in `ui/board.ts`; warning-box
interaction is `ui/interactions.ts` + `state/view.ts` (`DWOPEN`, `WFOCUS`,
`focusWarn`).

## Personnel (ground crew, owner Aug 26)

A **third person category** beside pilots (`seat:'FCP'`) and WSOs
(`seat:'RCP'`): squadron ground crew who hold no flying qualification but need
to be planned. A personnel record carries **`pers:true`** (the flag every
branch reads), **`seat:'GND'`** (a third seat value that keeps them out of the
Pilots/WSOs seat logic and gives them their own palette column and quals
table), **`q:''`** (no CAT), and a **`remarks`** free-text note. `deriveQuals`
short-circuits to `p.quals={}` for them and every boot currency pass skips
them (`people.ts`), so no qualification is ever derived. `isPersonnel(id)`
is the reader. They are seeded (`torque`/`spanner`/`gizmo`) but **never placed
in the seed schedule**, so none of the rules below fire on the reference's
seed week — which is what keeps `refwin`/parity byte-exact, the `NO_IR`
precedent.

**Where they may be planned** — a REAR cockpit (an incentive ride) and ground
work (duty desks, ground rows, sim slots). **Never a front seat**, flying or
sim. The bar lives in two places, both keyed on `p.pers`:
- `avail.ts` `slotBar` returns a reason for any front seat (`r.seat==='p'`) so
  the palette strikes them there and offers them everywhere else.
- `validate.ts` raises hard `QUAL` on a personnel in a flying or sim front
  seat. (Their `'GND'` seat never trips the FCP/RCP seat checks, so these are
  the whole story.)

**The rules that apply — and only these three:** the **conflict**
(`DOUBLE_BOOK`), the **long working day** (`LONGDAY`) and the **7-day run**
(`DAYS_RUN`). All three key off tasking + person id and are category-agnostic,
so personnel get them for free (personnel are in `collectEvents`/`EVD` — only
`special` bodies are skipped).

**Everything flying-specific is OFF for personnel**, each gated with
`p.pers` in `validate.ts`: crew rest, the tight/double turn (`TURN`/`DT_SUM`),
the combination matrix and OCU/IR pairing rules, AAR, SC/AVALON currency, and
the flight and sim **brief/debrief** windows. `availByWave` and the Insights
idle list also exclude them — they are not aircrew, so they never inflate a
flying availability count.

**A rear-seat ride raises `PAX_CREW`** — a new advisory code that reuses the
existing amber crew-pairing **`CP`** chip (owner's choice: an incentive ride is
a non-standard pairing that needs approval, and it should read in the day's
warning list). Only a WCODE string is new; the `CP` chip, `RANK` and
`CHIP_LABEL` are unchanged. The Logic tab documents it.

The puck is **white** (`.puck.pers`, `--pers`/`--pers-ink`/`--pers-line` in
`scheduler.css`) with no CAT chip — just the callsign. The legend carries a
`data-leg="pers"` swatch (port-only, excised from the parity byte-compare like
the `CP`/`RUN` swatches). Pinned by `engine/personnel.test.ts`.

## Availability is time-aware (owner, 10 Aug 26)

The validator has judged inputs by their hours since day one — `collectEvents`
carries `s`/`e` into `day.input` and every clash rule uses `overlap()`. The
AVAILABILITY layer did not, which is why a half-day would otherwise have
flagged correctly and still swept the man out of the crew palette.

- **`awayAllDay(inp)`** — true when `allday` is set, **or when either of
  `s`/`e` is missing**. A `{person, type}` record with no times is a real
  shape, and reading it as a zero-length absence would free a man who is off
  for a week. Both ends are required, so a half-day with a blank end cannot
  shrink to an hour through `win()`'s open-ended default. **Thin records fail
  closed** — and since 12 Aug 26 (audit) `inpWin` fails closed the same way,
  returning `[0,1439]` rather than null for such a record. The two used to
  disagree, which broke the invariant this whole section exists to keep: the
  palette struck the man out while every validator overlap against a null
  window was false, so planting him anyway raised nothing. `[0,1439]` is
  exactly 1439 wide, so `validate.ts`'s `timedInput` filter reads it as
  all-day — which is what `awayAllDay` had already decided it was. No UI path
  can mint such a record; the guard is for a restore, an import or a probe.
- **`slotRules` reports the slot's own window**, `slotStart`/`slotEnd`, for
  every key in the grammar. Each is read off the same row `collectEvents`
  reads and padded the same way, so the picker and the warning list cannot
  disagree: a sortie is `[to − VCONF.step, ld + VCONF.dekit]`, a standalone
  line is unpadded (it is a shift), a sim with no end defaults to
  `VCONF.simLen` (standard 90 — a Logic-tab setting since 21 Aug 26, read by
  `events.ts` and both `avail.ts` sites alike) and
  everything else to `VCONF.openEnd`. `.+` and `.xN` strip to their row and
  inherit its hours.
  **`null` means UNKNOWN, never FREE.** A BB shift is written `['SHIFT','','']`
  and a ground row may carry no times; treating either as "clashes with
  nothing" would silently drop a real absence, so the consumer falls back to
  the whole-day answer.
- **`slotBar`'s filter chain, in order**: skip on a spare post if `canSpare`;
  skip a non-flying key if `canWork`; then the overlap. **The order of the
  last one is load-bearing** — an all-day absence, or one `awayAllDay` cannot
  place, must short-circuit BEFORE the overlap test. Reversed, every all-day
  absence starts being judged against a window it does not have. A test in
  `slotrules.test.ts` fails if it is ever reversed.
- **Personal input clash — the picker now reads UNACCEPTED activity inputs
  too (Aug 26).** The four filter blocks above cover `isAway` types (leave,
  medical, actioned Fly-with) and STRIKE the man out. But an activity input
  (Meeting, Appointment, …) is not `isAway`: it lived only in `day.input`, so
  the validator raised `INPUT_FLY` on a plant while the picker's busy-check —
  which reads `EVD`, built from `day.events` — stayed silent, the one drift
  the picker and the warning list must never have. `slotBar`'s busy-at-this-
  hour block now also scans `INPUTS` for the non-away activity types, with the
  SAME `canWork`/flying gate and the SAME four midnight-tail shifts the
  off-blocks carry, and returns the soft `already on <type> <hh:mm–hh:mm>` a
  scheduled event gives — NOT a strike-out (activity types deliberately stay
  in the palette). `inputFlags()` excludes an already-promoted timed input:
  its ground row carries the clash as an event instead, so it is caught by the
  `EVD` scan and never double-reported. Pinned in `inputground.test.ts`.
- **An activity input auto-lands on the ground programme (Aug 26).**
  `slots.ts:autoAcceptInput(row)` is the one gate: `isPersonal(row.type)` and
  an editable (`!dayApproved`) day → `acceptInput(di,row,'g')`. It fires at
  every creation point (the two `+ Add` dialogs, the Inputs page `add`, and the
  boot/week-load `autoAcceptSeedInputs`), never on a repaint, so a manual
  removal sticks for the session. A PUBLISHED day is left alone (a late input
  stays under Personal Inputs; the picker still warns per the bullet above).
  The boot pass is parity-safe by the demoseed rule — it runs only where the
  harness never does — and wipes its own pending/added marks so the seed's
  auto-landed rows are the week's zero-state.
- **`dayOff` stays narrow — off for the WHOLE day.** It also feeds the
  day-info "off" tally and the palette's struck-through rank, and a man on AM
  leave is not off for the day. **Known, deliberate consequence: a half-day
  absentee is no longer counted in that tally.**
  `dayAway(d)` builds `{all, tw}` in one pass (whole-day set, timed windows by
  person); `dayOff` is `.all`. One pass because the palette asks about sixty
  people.
- **Timed absences join `availByWave`'s existing per-wave overlap**, the same
  one it runs for tasking — one overlap rule, not two that can drift. Two
  holes in that path are closed and pinned: the untasked fast path (a man
  whose only commitment is a timed absence would read free in every wave), and
  its inverse on a **non-flying day**, where with no bands to bucket into he
  must stay in `anyWave` or vanish from the strip.
- `palette-html.ts`'s `offReason` takes the same `awayAllDay` filter, or a man
  carrying both an all-day and a half-day absence can have the half-day named
  as the reason his whole day is gone.

**A morning absence does not free a sortie that starts walking before noon.**
The flying window is padded to the step because that is what the validator
judges against: Monday's first VL takes off 12:40 and steps at 11:40, so AM
leave to 12:00 still bars it. Correct, and worth knowing before it is reported
as a bug. The levers if it ever needs changing are the AM boundary or the step
padding — never a picker rule that disagrees with the warning list.

**The overnight tail is checked on both sides (owner, 11 Aug 26).** An
overnight window's part past midnight is judged against TOMORROW's inputs —
in the validator through `day.input`'s shifted append (see §Validation, the
midnight tail) and in `slotBar` through the same filter chain run over the
next day's inputs, so neither gate is stricter than the other. The bar
reason carries "(tomorrow)" so a scheduler can see which day the absence
lives on, "(yesterday)" for the backward half — a slot whose window opens
before minute 0, which is what a small-hours take-off does — and
"(overnight)" for an absence typed ACROSS midnight yesterday, whose second
half lands on today's early minutes without today's slot ever going
negative. That last one is checked WITHOUT the all-day shortcut the other two
use: an ordinary all-day absence yesterday says nothing about today.

**An absence may cross midnight** (owner, 11 Aug 26). 22:00–02:00 is a real
thing to be down for, and a duty row, a sim box and a night sortie have all
rolled that way since the port. Personal inputs were the one row type left
out: both entry paths refused an end before the start, and `mapInp` was the
one event build that did not roll its window, so such a record matched
nothing even if it arrived another way. `inpWin` is now the single place an
absence's window is read — `events.ts` and `slotBar` both go through it — and
only a ZERO-LENGTH window is refused on entry. The cost of the roll is that a
transposed 09:00–08:00 becomes a 23-hour absence rather than an error, which
is the same trade every other row type already makes.

**A leave may cross the NEW YEAR** (owner, 12 Aug 26 — "Ok do it"). Dates are
stored as `Mon D` labels, and the label leaves the LOADED week's year implicit
so an ordinary date reads `Jul 14` with no clutter. A date in ANY OTHER year
keeps its year in the label — `Jan 3 2027` — so a span running `Dec 28 → Jan 3`
is stored, sorted and covered correctly. `dateOrd` reads the year back
(`year*10000 + month*100 + day`, defaulting the year to `baseYear()`, which is
CURWEEK's year), so the end sorts AFTER the start instead of behind it, and
`inputCoversDate` covers every day between across the boundary. `fmt`/`unfmt`
(ui/inputedit.tsx) are the one pair that attach and strip the year; the SEED
`INPUTS` and `DATES` stay yearless, so the reference-parity push is untouched.
Before this, a yearless `Jan 3` sorted as 103 behind `Dec 28` at 1228, so a
new-year leave covered nothing, blocked nothing and vanished from the Inputs
table — it was refused outright until the year went into the label. What is
still refused at the write path is a GENUINELY backwards range (an end before
its start in real time); the calendar cannot make one, but `commitInputEdit`
guards it anyway, the same as every other malformed value.

**Every input is ANCHORED to a real year** (owner, 24 Aug 26 — "What if
another year has the same day and date … fix it very carefully"). The
implicit-year convention above left a bare label meaning "this label, in
whatever week is CURRENTLY loaded": an input filed for `Jul 13` of 2026
covered — and auto-landed on — Jul 13 of any year the continuous week scroll
reached, and the New Year-spanning week's own bare January labels resolved to
the wrong year, so the very leave the 12 Aug entry describes never covered the
January days of the week it was filed on. Three parts, one convention:
- every input carries **`yr`**, the loaded year its bare labels were written
  under — stamped at boot for the seeds (`initStore`), by every creation path
  (the Inputs page add, both board + Adds, the Leave War mint), and
  RE-stamped by `commitInputEdit`, whose `fmt` re-derives the labels against
  the current year. `dateOrd(lbl, fb)` takes it as the bare-label fallback;
  a row with no `yr` (a probe, an old snapshot) falls back to `baseYear()`,
  exactly the old behaviour. `inpKey` carries `yr` as its last segment so
  same-worded rows a year apart never share an edit address.
- `inputCoversDate` resolves BOTH sides to real dates (`dateOrd` each way)
  — its single-day arm was bare string equality, the exact site of the
  cross-year match — and `dateIx(lbl, yr)` replaces every
  `DATES.indexOf(inp.date)` so the auto-land pass plants by date value,
  never by words.
- `weekLabels` (weeks-data.ts) labels a day outside the loaded week's own
  year WITH its year (`Jan 1 2027` on the week of Dec 28 2026) — the same
  convention `fmt` already followed — and the two cross-year label caches
  re-derive under the current year (`weekctx`'s bundle cache is keyed by
  loaded year; `stashDays` re-labels a stashed week's days on every read).
The seed `INPUTS`/`DATES` literals stay untouched (the boot stamp is
boot-only, invisible to the parity harness). Pinned in
`engine/crossyear.test.ts`.
**The date resolution is MEMOISED, and only its pure halves** (25 Aug 26 —
profiled at a year-plus of inputs, `dateOrd`'s label parse and the
`baseYear()`→`weekStartISO()` chain were ~80% of every validate/loadWeek
pass, because every `inputCoversDate` re-parsed the same handful of labels).
`dateOrd` caches the label PARSE only (a given string always parses the
same; capped map); `baseYear` caches its year keyed on `CURWEEK`, so a week
change re-derives on the next call. The year FALLBACK (label year → row
`yr` → `baseYear()`) still resolves per call — the memo cannot serve a
stale year, and no `INPUTS` data is cached anywhere. Anti-staleness pins
live in `crossyear.test.ts` ("the date memo never serves a stale year").
Whole-list scans over `INPUTS` remain O(N) by design — cheap now per item;
a by-date index belongs to the future shared-database work, not before it.

**Two sorties at once are a CONFLICT, not a turn** (owner, 11 Aug 26).
Sortie-vs-sortie is excluded from the double-booking loop because two
back-to-back legs overlap the moment the step and dekit pads are added, and
would otherwise ring on every legitimate tight turn. That exclusion also
swallowed the case where a man is genuinely airborne twice at once: it
surfaced only as the amber tight-turn advisory, carrying a NEGATIVE minute
count. The line between the two is the AIRBORNE window (`to..ld`), never the
padded one — an overlap there falls through to a hard `DOUBLE_BOOK`, and the
tight-turn advisory is suppressed when the gap is negative. Two seats on one
line share a label, so that message names the man and the line instead of
reading "VL BFM & VL BFM clash".

**The picker asks "is he busy at THIS hour"** (owner, 11 Aug 26). `slotBar`
checks the day's events against the slot's own window for every key, not only
a standalone SC shift, excluding the seat being planned into (`slot`/`key` on
each event, normalised by `selfKey`) so a swap is silent. Every kind of event
counts, because every non-shift overlap the validator finds is a hard
`DOUBLE_BOOK`; a standby spare is exempt, being deliberately free. It is
ADVISORY, like every other bar here — `barDrop` toasts and the drop still
goes through.

**A second accept that would mint a duplicate content key is refused.**
`inpKey` is `person|date|type|start` and content keys are not unique;
`acceptedDay` and `unacceptInput` both resolve a row by the first match, so a
second row carrying an existing key would make the link ambiguous. The caller
reports which refusal it was — the type is never accepted, or the key is
taken — because saying the wrong one is its own bug.

## SANS Availability (owner, 14 Aug 26)

SANS aircrew (`p.san`, the 11 seeded `SANS_IDS`) can file POSITIVE
availability — "I can fly / sit an OFT / sit an AMT, optionally only within
these hours" — through a new input type, `'SANS Availability'`
(`INPUT_META`, `grp:'sans'`, appended after `Other` so the order every
existing pin walks does not move). `grp:'sans'` earns the type two things for
free: it stays inside `isUnavail` (the Accept-refusal and "no Accept
controls" callers are exactly right for an offer too — see §Accepting a
personal input below) and stays out of `isPersonal` (it is not a Ground
Programme candidate). `local:true, ground:false` so it behaves like an
on-island commitment for `canSpare`/the Ground button; `work:false` because
filing this says nothing about a non-flying tasking; `half:true` since the
14 Aug 26 rework — the record rides the standard All day / AM / PM / Custom
template like any leave input (it shipped hours earlier with three per-event
windows, which the owner could not clear on a phone; see the rework note
below).

**Record shape** (`inputs.ts`; REWORKED 14 Aug 26, same day it shipped —
owner: one timing, the standard template, and per-event time fields a phone
could not clear): an ordinary INPUTS row whose OWN standard
`allday`/`half`/`s`/`e` fields carry **one** offered window, with `sans`
reduced to flags — `{ f?: true, o?: true, a?: true }`, `f`/`o`/`a` for
Fly/OFT/AMT (`SANS_KEY` in `avail.ts`), absent meaning NOT OFFERED. The one
window applies to every ticked event. No migration for the old per-event
`{s,e}` shape: inputs are session-only and the seed carries zero SANS
records. `sansAvailOn(id,dt)` is the one place that finds the record covering
a day and returns the WHOLE row; `sansWindow(rec)` reads the window off it
(`allday`→[0,1439], `am`→[0,720], `pm`→[721,1439] — the same halves
`HALF_AM`/`HALF_PM` write — and a thin record reads whole-day, the same
answer `inpWin` gives a thin absence). A custom window with **end before
start** is an overnight offer (22:00–02:00), a shape the write path permits
for every half-day type: `sansWindow` **rolls it** the way `inpWin` does
(`e<s → e+1440`, so [1320,120]→[1320,1560]) — before that fix `sansGate`
could never read a night slot as covered. `sansLetters(rec)` prints the ticked
events (`F/O/A`, fixed f/o/a order); `sansBadge(id,dt)` is letters plus the
window (`F/O/A`, `F/O · AM`, `A · 08:00–12:00`). All four live in
`inputs.ts`, not `html.ts`, because `palette-html.ts` imports from `html.ts`
and an html-side helper would cycle.

**`sansGate(id,dt,domain,s,e)` (`avail.ts`) is the one judge** every
consumer — `slotBar`'s grey-out, the validator's advisory, every badge caller
— asks, so the rule cannot drift between a picker that agrees with itself and
a warning list that doesn't. `domain` is `'fly'|'oft'|'amt'`; `s`/`e` are the
SLOT's own minutes-from-midnight, exactly what `slotRules` already computes —
for a flying seat the front edge is `sansStart`, the in-time anchor (owner,
26 Aug 26; see the `SANS_AVAIL` paragraph below), for a sim the box's own
written hours. Five statuses:
- `'na'` — not a SANS person at all; nothing to ask.
- `'none'` — SANS, but no record filed for the day.
- `'not-offered'` — a record exists but this event's box is unticked.
- `'ok'` — the record's one window covers the slot. **An all-day offer
  short-circuits to `'ok'`**, so it covers a slot whose window crosses
  midnight — a night sortie landing after 00:00 (`slotEnd>1439`), an SC
  night shift (…07:00), a small-hours take-off (`slotStart<0`). Without that
  short-circuit the day-bounded `[0,1439]` window failed containment against
  those and wrongly read "available 00:00–23:59 only", on the picker AND as a
  persistent advisory. A half/custom offer that genuinely does not reach past
  midnight still reads `'window'`.
- `'window'` — offered, but only a window narrower than the slot; the gate
  carries the offered window back as `.off` (`{s,e}` read from `sansWindow`,
  the same whichever event asked — one window serves all three).

**`slotBar` (`avail.ts`)** asks `sansGate` right after the four personal-input
absence checks and before the "already busy at this hour" check — an absence
outranks an offer question, and an offer question outranks a mere clash
elsewhere in the day. `domain` is read off the key: `r.simKind` for a sim seat
(`slotRules`' `s:` branch decodes it off `s:di.kind.ri[.seat]` — the kind sits
at `a[1]`, **not** `a[0]`, which is the day index; a bug that shipped this way
was caught writing `sansavail.test.ts` and is fixed with a comment at the
call site, see §Availability is time-aware for the "checked, not assumed"
standard this held itself to), `'fly'` for an unprefixed flying seat, `null`
for everything else — a duty post, a ground row, a programme item is
**never** SANS-greyed. **A spare-like seat is carved out too** (`!spareLike0(r)`
on the gate, the same flag the four absence blocks and the busy-at-this-hour
check already use): an SC SPARE aircraft and a whole AVALON/BB wave never
reach `day.fly`/`day.events` (`saExempt` / the standalone skip), so the
advisory below never raises against them — before the carve-out `slotBar`
greyed them while the warning list stayed silent, the exact picker-vs-validator
drift this gate exists to avoid. The three printed reasons: `SANS — no availability filed
for today`, `SANS — not offering Fly` (or OFT/AMT), `SANS — available
08:00–12:00 only` (domain-free since the one-window rework — the window is
the record's, not the event's). Nothing else in `slotBar` needed to change — the palette's
strike, the printed reason (`.no.haswhy`/`.rwhy`), the green eligibility
rings and both toasts all read `slotBar`, so grey-out was free the moment
this one function judged right.

**The `SANS_AVAIL` advisory (`validate.ts`) — amber, wears the `A` chip**
(owner, 26 Aug 26 — moved off `CP`, its launch chip: `CP`'s hover says a crew
*pairing* needs approval, which is not this man's problem; `A` is the
planned-against-what-was-filed chip, and its `CHIP_LABEL` entry now names the
SANS case — mirrored byte-identically into the reference's table by a
`refwin.ts` swap, though no seed-week day renders it). Built
per day from two check lists: `day.fly` (domain `'fly'`, window
**in-time→dekit** since 26 Aug 26 — owner: "SANS should consider IN TIME
till land plus 30 minutes for availability". The front edge is
`min(e.report,e.step)`: the wave's published in-time, or a typed SC B,
opens the window when it shows the crew earlier than the step / shift
start; no in-time published leaves the plain `e.step→e.dekit` pad, and a
LATER in-time can never shrink the occupied window — the same `min()`
guard `insOf`/`workSpan` put on crew rest. `slotBar` judges the identical
front edge: `slotRules` carries it as `sansStart`, computed off the one
shared clock body `seatIntime` (`events.ts` — SC-B precedence and the
limited midnight roll live there once, for `collectEvents` and the picker
alike). `slotStart`/`slotEnd` themselves did NOT move: absences and the
busy-at-this-hour check still judge the occupied step→dekit window)
and `day.events`' sim entries whose key matches
`^s:\d+\.(amt|oft)\.` (domain is the captured word, window is the event's own
`s→e`). For each SANS person on each check, `sansGate` decides; **only
`'not-offered'` and `'window'` raise** `add('adv','SANS_AVAIL',...)` +
`markRing(di,id,'adv')` + `markChip(di,id,'A')`.

**`'none' is DELIBERATELY silent here — the scoping decision, and why it is
correct** (owner, 14 Aug 26). The owner's own example only ever describes
planting AGAINST a filed record ("indicates A and O… planned for F →
advisory"): a bare no-record is not that case. And practically: the seed
week's demo already has SANS aircrew flying — `romeo`, `vinci` and `krait`
fly, `waldo` rides an OFT box as pax — while seed `INPUTS` carries zero SANS
records. Firing on `'none'` would put this advisory on every one of them,
which is not what was asked for and would need a `refwin.ts` patch to keep
`node reference/tfin.js` at 728/0 for a rule nobody asked the reference to
carry (the port-only-rule precedent already used elsewhere, `refwin.ts:168-
170`). No-record still reads to the scheduler through the palette (grey +
printed reason) and the plant toast — it just never becomes a PERSISTENT
entry in the day's warning list. `sansavail.test.ts` pins both the "fires" and
the "doesn't fire" halves, plus the parity-guard pair (`WCODE.SANS_AVAIL`
truthy, seed raises zero).

**The type is restricted to SANS aircrew, and all three editors refuse
through one function.** `sansRefusal(person,sans)` (`inputedit.tsx`) is what
`commitInputEdit` and the add form's own `add()` (`InputsPage.tsx`) both call
before any write — a non-SANS person is refused with "SANS Availability is
for SANS aircrew only" (the owner reconfirmed the restriction on the rework
day: "only SANS can input the availability"), and an empty tick set with
"Tick at least one of Fly / AMT / OFT". **Who counts as SANS is `PEOPLE[id].san`**
— set at boot from `SANS_IDS` (`people.ts`) and, since the bug-test fix,
editable on the Quals page: the `san` column's tick writes `p.san` directly
(not just the one-way-derived `p.quals.san`, which no gate reads — before the
fix the tick was a no-op), session-only like every qual tick. **A second
guard, `sansOverlapRefusal(person,date,endDate,except)`, refuses a record whose
date range overlaps an existing SANS record for the same person** (`except` is
the row being edited): SANS is one window per record, and two records on one
day break silently — `sansAvailOn` reads only the first, the card grid draws
both, and their shared `inpKey` (`person|date|type|s`) lets a card click edit
or delete the wrong one. To offer two windows the member ticks both events on
the one record. The old per-event
give-both-times-or-neither refusal is gone with the per-event windows — the
one window's own validation rides the STANDARD path every half-capable type
already uses. `commitInputEdit` returns `false` on a refusal, so the editor
stays open with the typing still in it (house convention). All three editors
— the add form, the in-table row editor and the modal — share one
`SansPicker` component (`inputedit.tsx`, a plain Fly/AMT/OFT checkbox row
since the rework — the window controls are the standard SpanPicker + time
fields, not SANS-special).

**Amends the Aug-26 "offers deleted" decision** (search this file for
"Available fly" — the note sits under §Validation). `Available fly` and
`Available duty` were removed as input types because an offer that clashed
and ate brief/debrief time exactly like any other commitment was not the
shape anyone wanted, and "there are no offers any more" was recorded as
settled. SANS Availability is not that shape: it never enters `day.input` at
all (`events.ts`'s `inpShow` returns `false` for it immediately — the one
choke every `day.input` construction site funnels through), and is read ONLY
by `sansGate`, never by the general clash/brief machinery the deleted offer
types once shared with every other commitment. Since the one-window rework
the record DOES carry ordinary top-level `s`/`e`/`half` — which is exactly
the shape that machinery reads on every other type — so the exclusion is
type-based, not shape-based, and `sansavail.test.ts`'s leak-guard block pins
it: a timed offer never reads as a timed absence (`isAway` false, absent
from `day.input`, no hard clash raised).
**Amended 14 Aug 26 — SANS-scoped offers reinstated by owner decision as this
type.** Record it here so the two decisions read as sequential, not
contradictory.

**The demo seeds six SANS Availability records at boot, and it is
PARITY-INVISIBLE by construction** (`state/demoseed.ts`, 14 Aug 26). A fresh
clone otherwise showed the SANS card grid, the palette badges and the
"N SANS offering" pointer all empty — nobody had filed a record — so
`seedDemoSans()` pushes six (`nick` PM, `romeo` all-day, `vinci` a two-day
span, `waldo` AM offering an OFT, `krait` all-day, `bullet` F+O+A with no
commitment anywhere in the seed week to judge against) at BOOT, inside
`initStore`, rather than into the `INPUTS` array `engine/inputs.ts` seeds.
That is the whole trick: `refwin.ts`, `parity.test.ts`, `html.test.ts` and
every one of the ~40 snapshot-reset tests read `INPUTS` PRISTINE — none of
them call `initStore()`, and a snapshot reset restores the array from its
own pre-boot JSON — so none of them ever sees these rows; only the real
built app, which does call `initStore()`, does. Each window covers the
person's own padded seed commitment (the same padded window `sansGate`
judges a slot against) so `validate()` raises no `SANS_AVAIL` against its
own seed, and every `mod` stamp sits on or before the week's input deadline
so none wears the LATE mark. `seedDemoSans()` is idempotent — guarded per
person+date pair, the same identity `sansAvailOn` keys on — because
`stores-boot.test.ts` boots `initStore()` twice.

## Accepting a personal input

A personal input is aircrew-submitted and is NOT part of the issued programme
until a scheduler accepts it. `acceptInput(di, inp, dest)` in the mutation
funnel:

- `dest='g'` pushes a real row onto `DAYS[di].ground` built from the input
  (the TYPE as the title, the remarks in the row's `rmks` cell, the CALLSIGN
  in `who` like every other ground write, `hhmm(s)`/`hhmm(e)`, blank for
  all-day). Since 15 Aug 26 it marks through `markStructuralAdd` — not the
  bare `trackStructuralAdd`+`noteChange` pair the promotion used before —
  so it is pending, reaches the next AL, AND wears the same ~6s blue box
  every other fresh board row gets (owner audit: every other new row got
  one, an accepted input's did not; `docs/ui-contracts.md` §Selection
  highlight). The key is the row's first FIELD, `gr:di.ri.prog` — matching
  what `board.ts`'s own "+ Item" mints, and the address `paintFreshAdds` can
  actually find an element for, where the bare `g:di.ri` row address
  matches none; `deletionWasIssued`'s ground check already ORs both key
  forms, so nothing that read the old key broke. The row carries `src` — a
  content key back to the input.
- `dest='u'` only sets `acc='u'`, moving it into the Unavailable block; no row
  is created. Because there is no live row key to tint, it marks one inert
  `inp:di.input-id` amendment key for every loaded day the input covers.
- `unacceptInput` reverses either, finding the created row by `src` (not by
  index, which would rot when rows above it move). Removing a Ground row uses
  an inert `del:di.seq.ground` key; unfiling from Unavailable reuses the same
  stable `inp:di.input-id` key on every covered loaded day, so filing and
  unfiling before issue do not become two contradictory AL items.

Accepting twice is a no-op; undo first. The input is never removed — it stays in
Personal Inputs, faded, so the scheduler can see what they have dealt with.

## The medical tracker — downchit, upchit and the trim rules (owner, 27 Aug 26)

The medical group (HL, OML, ATT C, ATT B) has always been the downchit; what
is new is the LIFECYCLE around it, and one new type.

**Upchit** (`INPUT_META` grp `'upchit'`) is the paperwork that closes a
medical-down period — the medical officer's "fit to fly again", dated. It is
a marker type on the SANS pattern: inside `isUnavail` (no Accept controls),
carved out of everything that would read it as an absence — `inputFlags`
(validator-invisible AND reference-seed-invisible, the dormancy precedent, so
parity cannot diverge), `isAway` (never strikes a palette puck), `restsInput`,
the two Unavailable blocks (week + board), the board's Unavailable + Add list,
and the late-input mark (same ruling as the downchits: the date is the medical
officer's, never a deadline's). `typeGroup` maps it under the Medical dropdown
heading; `defaultAllday` opens it all-day; it has no AM/PM control and the
write path refuses a ranged one — an upchit is ONE date.

**Derived, never stored** (`engine/medical.ts`). Who is down, who owes an
upchit and who upchitted are pure reads over `INPUTS` and an as-of ordinal:

- `medDownAsOf(ord)` — every downchit input covering the date.
- `pendingUpchits(ord)` — per person, the latest-ended EXPIRED downchit,
  unless (a) another downchit covers the date, (b) any downchit STARTS after
  that end (a newer entry replaces the nag, future-dated included), or (c) an
  upchit is dated on/after that end. Unbounded into the past — an owed upchit
  does not age out.
- `upchitsWithin(ord, 30)` — upchits in the trailing 30 days, newest first.

Nothing runs at boot and nothing mutates on a clock tick — "auto-moves to
Pending on expiry" is arithmetic, the `isLateInput` doctrine.

**The trim rules** (planners in `engine/medical.ts`, applied by
`applyMedPlan` in `ui/inputedit.tsx`, inside the SAME `writeInputsBatch` as
the input that caused them — one undo step):

- An **upchit on X marks the man FIT ON X ITSELF** (owner, 27 Aug 26 —
  "upchit on 14 Jul means fit for full duty after the moment upchit was
  selected"): every downchit of that person COVERING X (started on/before
  it, ending on or past it) is cut to end the DAY BEFORE (down 10–13 Jul,
  upchit 12 Jul → 10–11 Jul); a row left covering only fit days (it started
  ON X) is removed, visibly, via the save-time sheet below. A row that
  STARTS AFTER X is untouched (27 Aug 26 overnight pass) — it is the "newer
  entry" that replaces the pending nag (a future surgery already filed), not
  part of the episode being closed — and instead surfaces as a LEFTOVER of
  `upchitEffects(person, x, except)`, the one body the save-time summary
  sheet and the write both read. The remarks "till …" token is rewritten
  (`withRemarksTail`), `retractLwRow` runs first on an lw-tagged row, and the
  Leave War's freed days clear on the next reconcile. The canonical closer of
  an EXPIRED episode is dated the day AFTER its end; `pendingUpchits`' `>=`
  covering test admits it and still tolerates old ends-on-the-date records.
- A **different-type medical overlap is ASKED ABOUT, never resolved
  silently** (owner, 27 Aug 26 — the clash sheet, below). The programmatic
  default — what `newMedTrimPlan` still does when a caller applies it, and
  what the sheet's "<new type> replaces" chooses — is that the new entry wins its
  days and ONLY its days (27 Aug 26 overnight pass): the older row is cut to
  end the day before the new one starts (deleted when nothing remains before
  it), and when it also ran PAST the new one's end the surviving tail
  (`medTailBeyond` — one body, read by the sheet and the planner) is minted as
  a second same-type row in the same plan (same person, year anchor and
  document). When applied DIRECTLY (no sheet — `caldrag.ts`, hand-made commit
  calls, the tests) that tail is ALWAYS kept: a short entry landing mid-way
  through a long downchit must never silently mark the man fit for its
  remainder. From the CLASH SHEET the tail is the filer's call — a per-leftover
  **Remove (default) / Keep** (owner, 28 Aug 26): `newMedTrimPlan`'s `keepTail`
  argument carries the rows whose tail to keep, and a removed leftover simply
  never mints, its days reading fit — but shown on the sheet before the save,
  never silent. The row is still cut to its head either way; only the tail
  turns on the answer. `newMedTrimPlan` selects its rows through `medClashes`
  — the same body the clash sheet lists — so the question and the cut cannot
  disagree.
- A **same-type overlap is REFUSED**, never trimmed (`medOverlapRefusal`, the
  `sansOverlapRefusal` shape): the person is told to edit the entry on file
  and attach the new document to it. Upchit-vs-upchit same day likewise. Three
  more refusals joined 27 Aug 26 (all in `normalizeInputDraft`/`upchitRefusal`,
  shared by every editor): a downchit may not run over — or END ON — one of
  the person's upchits (`downOverUpchitRefusal`; the upchit day is a fit day,
  so ending the day BEFORE is the trimmed convention and stays editable,
  and STARTING on it stays allowed as a new same-day episode); an upchit for
  an episode ALREADY answered by a later upchit is refused; and a cleared
  date box is refused, never silently defaulted to the loaded week's Monday.
  A medical row also KEEPS ITS FAMILY at the write path — downchit stays
  downchit, upchit stays upchit — and a `docId` is written only for a type
  that `needsDoc`, so a certificate cannot ride a type switch onto leave.
  Every trim/delete/tail the plan applies writes an edit-log line, with the
  HONEST reason: an upchit's cuts log "closed by the upchit", a leftover the
  filer ticked logs "removed with the upchit" (`applyMedPlan`'s `why`).

**The upchit save-time summary** (owner, 27 Aug 26 — "ask at save time").
An upchit is NEVER saved silently from a form: the Inputs page's add form,
its row editor and the shared `InputEditor` dialog all open
`ui/UpchitConfirm.tsx` before writing. The sheet lists exactly what the
upchit will trim or remove (from `upchitEffects` — the same body the write
runs, so sheet and save cannot disagree) and puts every LEFTOVER — a
later-dated downchit, the tail of a split entry or a filed future one — to
the filer as an explicit **Keep / Remove with NO default**: Save stays
disabled until each has an answer (owner — "if the owner doesn't select …
can't move forward"). Save commits the upchit, its trims and the ticked
removals as ONE `writeInputsBatch` undo step; Cancel writes nothing. The
calendar re-date drag (`caldrag.ts`) stays direct — an explicit logged
gesture on the upchit itself; leftovers simply stay.

**The medical clash sheet** (owner, 27 Aug 26 — "ask at save time", the
upchit sheet's sibling, `ui/MedClashConfirm.tsx`). Saving a medical entry
that overlaps a DIFFERENT-type one — new or edited, from any of the same
three form paths — opens a sheet listing every clash (`medClashes`) with a
forced per-clash choice, no default: the new entry **replaces** the shared
days (the old row is trimmed/split exactly as the default rule above), or the
existing status is **kept till its end** — then the new entry is filed AROUND
it: its
kept day segments come from `subtractSpans` via `medKeptSegments`
(`ui/inputedit.tsx`), the first segment is the row saved, later segments are
minted as sibling rows (`mintMedSegments`, same document — the applyMedPlan
tail idiom), each trimmed only against rows the filer chose to overwrite. A
kept row is never trimmed BY CONSTRUCTION — the segments cannot touch it.
Choices that leave the new entry no days at all are refused ("nothing left
to file") and nothing is written — a backstop only, since 28 Aug 26 (owner —
"no ATT C keeps them button"): a clash whose row COVERS the whole new entry
is FORCED to 'new' by the sheet itself, its keep option not offered, so the
single-clash route to that refusal no longer exists (only a multi-clash
combination can still jointly swallow the entry). **The LEFTOVER** (owner,
28 Aug 26): when the
new entry TAKES the days of a status that ran past it — ATT C 10–15, a new
ATT B 12–13 → an ATT C tail 14–15 — the sheet asks a second question under that
clash, **Remove those days (default) or Keep them**. This is the ONE choice on
the sheet that carries a default (the who-holds-them choice above still forces
an answer); the owner chose Remove because a status filed mid-way usually means
the old plan changed, and the pending removal is shown plainly (the red seg,
"will be removed") so a straight Save is a seen decision, never silent. Its
answer rides the `keepTail` list into `newMedTrimPlan`/`mintMedSegments`, so the
sheet and the write cut the same tail. The whole resolution is one
`writeInputsBatch` undo step. The invariant this protects: **each person
holds exactly ONE medical status per day** — overlaps are resolved at the
write, never stored and re-interpreted at display time. Same-type overlap
stays refused outright (edit that entry), and the programmatic callers
(`caldrag.ts`, hand-made `commitNewInput`/`commitInputEdit` calls) keep the
silent new-wins default, documented.

**The mandatory document.** `needsDoc(t)` (= downchit or upchit, ONE body in
`engine/inputs.ts`) decides both the upload control's visibility and the
refusal: a NEW medical input (or a row retyped INTO the group) does not go in
without a stored document (`state/docs.ts` — session-only blobs, id-only on
the record, append-only so undo finds its paperwork). Rows that were already
medical keep whatever they have — pre-feature records are not bricked.
Everyone may VIEW any document; edit stays own-puck/admin at the write path.

## The late-input mark (owner, 9 Aug 26)

A member's input is due **`VCONF.inputLead` days before its own week's
Monday** (standard **14** — owner, 9 Aug 26, raised from an initial 7),
and one last changed after that deadline is marked `LATE` wherever it is
drawn. `engine/inputs.ts` owns the whole thing — `inputWeekStartISO`,
`inputOwnDueISO`, `inputDueISO`, `inputStampISO`, `isLateInput`, `lateNote`.

- **The deadline is relative, not a date.** Week Monday − `inputLead`. At the
  standard 14, an input for the week of Mon 17 Aug is due by Mon 3 Aug. The
  arithmetic runs through a real date, so it steps back over month and year
  boundaries rather than off the end of a day number.
- **The deadline RUNS WITH THE INPUT'S OWN WEEK** (owner, 24 Aug 26 — "it's
  a running deadline", after a leave for 24 Dec filed in August wore the
  tag). The week whose Monday anchors the arithmetic is the week the
  input's own FIRST day falls in — `inputWeekStartISO`, resolved through
  the row's `yr` anchor so the same month/day a year apart gets a
  year-apart deadline — never the loaded week. It used to read `CURWEEK`,
  which was an invariant while every surface drew only the loaded week's
  inputs, and broke silently when the Inputs page went global (22 Aug 26).
  A span is judged by its first day's week: the earliest week it touches,
  whose planning a late change could have disturbed. An input whose date
  cannot be parsed has an unknown week, an unknown deadline, and is never
  accused — the same fail-quiet rule the stamp already follows.
  `inputDueISO(wk?)` (loaded-week / given-week arithmetic) is kept for
  callers that reason about a week rather than an input.
- **The deadline day itself is ON TIME.** Late is strictly `stamp > due` —
  "no later than a fortnight prior" makes the 3rd fine and the 4th late. Pinned
  in `engine/lateinput.test.ts`, and it is the assertion most likely to be
  broken by a "tidy-up" of the comparison.
- **What is measured is the LAST CHANGE, not the first submission** (owner's
  call when asked). The field is `mod`, the stamp the Inputs page prints as
  "Last modified", so an input raised early and then amended after the
  deadline reads late. The deadline exists so the week can be planned against
  something that has stopped moving. `'now'` — what the Inputs page writes on
  every add and edit — resolves to today rather than reading as unstamped.
- **No stamp, no accusation.** An empty, missing or unparseable `mod` is
  never late. An unknown date is not evidence, and every test in the suite
  that builds an input writes `mod:''`.
- **It is a MARK and nothing else** (owner chose this over an entry in the
  checks list). It raises no warning, closes no slot, changes no availability
  and is invisible to `validate()` — tightening the rule until every input is
  late must not move the warning count by one, which is pinned. It therefore
  needs no `refwin.ts` patch: the reference never sees it.
- **THE SCHEDULE SURFACES CAN BE TOLD TO STOP PRINTING IT, PER INPUT** (owner,
  21 Aug 26 — "when I click on the late orange icon beside the line, it will
  remove the late icon, if I click the same area again it will show"; this
  replaced the 20 Aug global "Hide LATE marks" header button). A squadron that
  runs no input deadline had no way to silence the mark: `inputLead` bottoms out
  at 0, which still marks anything touched after the Monday itself. The control
  is now a clickable **LATE chip on each late input's live board row** (Personal
  Inputs and Unavailable), admin-only, session-scoped (`LATEOFF`, a Set of input
  ids in `state/view.ts`, cleared by `resetSession`); tapping it drops that one
  mark, tapping again restores it.
  **Nothing in this file changes when a mark is dropped.** The gate is at the UI
  printers (`ui/html.ts`, via `lateShown`), not here: `isLateInput` goes on
  answering, the deadline arithmetic is untouched, and the mark stays a mark
  rather than becoming a configurable rule. The **Inputs page keeps printing it**
  — that page is the paperwork record, and quieting a busy board is not the same
  as erasing when an input was filed. So a rule change here still moves what the
  Inputs page says, whatever a scheduler has dropped.
- **DOWNCHITS ARE EXEMPT** (owner, 9 Aug 26). A deadline asks a man to decide
  in advance; going DNIF is not a decision he makes, and a downchit raised the
  morning of the flight is the system working. Marking it would scold him for
  being ill and — worse for the scheduler — put a badge on the one input type
  that is ALWAYS last-minute, which is how a mark stops meaning anything. The
  test that pins this uses the seed's two downchits, which carry the LATEST
  stamps in the file and are still clean. **Leave and detachments are not
  exempt**: those are applied for, and applying late is the thing this is
  about.
- **There is no off switch.** `inputLead` is a day count (0–60); 0 means "due
  by the Monday itself", which is the most permissive setting. A squadron that
  does not run this policy has no way to silence the mark short of a rule
  change.

The seed week's `mod` stamps are deliberately spread either side of its
deadline (Mon 29 Jun for the demo week) so every case is visible — early,
exactly on the deadline (bane), one day late (nasty), plainly late (salsa,
shrek, yeti), and exempt-though-latest-of-all (the two downchits). Before
that they all sat inside their own week, which marked every input and made
the mark useless.

## Weekend/PH work earns OIL (`engine/oil.ts`, owner 16–17 Aug 26, REWRITTEN 28 Aug 26 — Leave War sync wire 4)

Work stood on a NON-WORKING day credits OIL into Leave War as an FO
('full day OIL', earns 1) or HO ('half day OIL', 0.5) cell. Like the
late-input mark this grades no
flying: `validate()` never sees it, no slot closes, and the engine half is
one pure function — `dayOilCredits(day)` → `{personId: 0.5|1}` — fed a day
blob by the sync wire (`src/leavewar/sync.ts:runOilPass`), which owns every
other half of the rule (whether the date is non-working, where the credit
lands, the clash handling — see `docs/superpowers/specs/leavewar-sync.md`
§Wire 4 and its 28 Aug 26 rework block for the built shape). The cell codes
were `FS`/`HS` until the 28 Aug 26 rename.

- **ONE rule, every source (the 28 Aug 26 rewrite** — owner: "It will just
  use the same rule as all I mentioned … 6 hours or less, it's auto HO
  credited. If it's more than 6 hours, it's FO. Regardless of time or shift
  in that day"**; the MEASURE corrected 29 Aug 26).** A person's worked
  minutes for the day are the ENVELOPE of everything they did — FIRST start
  to LAST end, the gaps between events included (`envMin`; owner, 29 Aug
  26: "the in between timing, even tho there's nothing, they are still in
  squadron" — his own example: 7-8am plus 12-1pm is a six-hour day at
  work, not two hours; this REPLACED the 28 Aug interval-union sum, do not
  bring the sum back). Then one
  threshold (`uniformOil`): under `VCONF.oilFullMin` minutes ⇒ **HO
  (0.5)**, at or over ⇒ **FO (1.0)**. Default 361 — "6 hours 1 min or more"
  is the owner's line (17 Aug 26, corrected from a plain 6h the same day,
  and RE-CONFIRMED 29 Aug 26 for the envelope reading:
  exactly six hours is still a half) — a `RULE_SPEC` entry, Logic-page
  editable, labelled 'Full-day OIL threshold (worked mins)'. The old
  1.0/day cap stays structural: one envelope per day cannot pay twice for
  an hour. **The 17 Aug SC shift-window rule — AM/PM halves of the SC day
  window, the midpoint, the night clause (`scShiftCredit`) — is DELETED
  from `engine/oil.ts` and the probe bridge**; the owner removed it by
  name, do not resurrect it.
- **What pools (the 28 Aug 26 widened set).** By each row's WRITTEN times:
  - an **SC MAIN** seat, by its shift's `to`→`ld`;
  - any **ordinary FLYING seat**, by the working day the sortie costs:
    T-O − `VCONF.reportLead` through LD + `VCONF.debrief` — the owner's
    report-to-debrief pick (28 Aug 26). Typed in-time lines are
    deliberately NOT consulted (a stated simplification; the snapshot-pure
    read stays free of the `events.ts` machinery);
  - a **sim row** (AMT and OFT), by its `str`→`end`;
  - a **duty row** (`dutywaves[].rows`), by its `str`→`end`;
  - a **ground-programme row**, by its `str`→`end`;
  - a **Common Programme row** (`day.allhands`), by its `str`→`end`.
- **What earns NOTHING, deliberately:**
  - an SC **SPARE** — standing by at home, reachable but not at work (the
    same reading `scSpare` gives the conflict engine);
  - **AVALON and BB** — the whole wave AND the desk block it brings
    (`dw.sa`);
  - a **cancelled** structure at any level (`cx`) — a duty that did not
    stand;
  - a row with **no readable times** (blank, half-blank, zero-length) — the
    owner's rule is "based on what timing was written", and inventing
    `openEnd`/`simLen` defaults here would mint OIL from a guess (display
    may guess; money may not);
  - a **ground row carrying `src`** (an accepted personal input) — those
    are the ask-flow's to credit (`row.oil`, below), never auto: a Saturday
    dental appointment must not mint OIL uninvited.
- **The ALL / ALL AVAIL expansion.** A sentinel puck on a ground or Common
  Programme row expands — via the injected `opts.expandAll`, so
  `engine/oil.ts` stays Leave-War-free — to everyone available for the
  event's window (`sync.ts:availableFor`): **regular aircrew only** — no
  SANS, no ground-crew Personnel, no sentinels or archived bodies — minus
  anyone an away-making input (`isAway`: leave, medical, OD) overlaps in
  that window. Without a resolver the sentinel simply drops, as it always
  did. The ALL puck itself (`people.ts` `all`) is a second sentinel with
  ALL AVAIL's exact semantics: never validated, no warnings.
- **The input ask + the `row.oil` field (28 Aug 26).** A duty-&-commitments
  input (`oilAsks` — the `restsInput` eight; Personal and SANS excluded)
  covering a weekend/PH is never credited or skipped silently: saving one
  opens the OilConfirm sheet (`docs/ui-contracts.md` §The OIL ask), and the
  answers land as `row.oil = { "2026-09-05": 1, "2026-09-06": 0.5,
  "2026-09-12": 0 }` — answered ISO day → granted amount, 0 = an explicit
  decline, an ABSENT key on an applicable day = unanswered → no credit plus
  the bell (`oilPendingFor`). Plain JSON, riding histSnap (undo) free.
  Voided when the type leaves the ask set or the input moves to another
  person (`commitInputEdit`; `reassignInput` and the calendar drag
  inherit); kept on time/remark edits — the save gate re-asks when the plan
  goes stale, and the credit pass re-checks coverage and non-working LIVE,
  so a moved input or a revoked PH leaves a stale yes inert.
- **A recorded answer is revisable in place** (owner, 29 Aug 26 — his pick
  over a dedicated undo/redo; the global undo stack covers immediate
  regret). `oilAnswered(row)` (`ui/inputedit.tsx`) gates the affordance:
  an ask-set, non-dormant row with ≥1 applicable day answered — a decline
  counts, unanswered-only stays the bell's. The InputEditor draws an
  "OIL … Change…" row (priced off the current draft via `oilGate`'s
  `force`, saved through the same batch as a gated save) and the Inputs
  page a cyan `.roil` chip (`reviseOil` — rewrites `row.oil` alone, one
  `writeInputsBatch`). Both re-open OilConfirm over every applicable day
  with the standing answers pre-loaded; Save replaces the set wholesale.
- **Two sources, one envelope, a split publish gate.** `desiredOilCells`
  gathers per person|date the PUBLISHED schedule — the issued snapshot on
  approved days, so a draft edit after
  publish moves nothing until an AL/reissue publishes it, reopening a day
  takes its credit back, and re-publishing replaces it (reverse-and-replace
  is the diff against the refreshed snapshot, free) — AND acknowledged
  input claims, which are deliberately NOT publish-gated: the owner's
  acknowledgment is their gate. Then ONE `uniformOil(envMin)` verdict
  across both (his worked example: a 4h morning duty published + a 4h
  afternoon input acknowledged is one 0800→1700 day → FO; the gap counts).
  **And the schedule half reads EVERY week, not just the loaded one**
  (owner, 29 Aug 26 — "pull the full day schedule regardless of what's on
  screen"): the loaded week live, every other visited week out of its
  session stash (`engine/weekstash.ts`), whose snapshot carries the publish
  state — read through the parameterized `dayCurVerIn`/`daySnapIn`
  (`engine/publish.ts`, one body with the live wrappers) and parsed once
  per blob (`stashOilWeek`, string-identity cache). A never-visited week
  has published nothing, so live + stash is the whole session; before
  this, navigating off a published weekend let the reverse sweep collect
  its credits.
- **Never overwrites.** A date already holding anything else — a leave bid,
  a synced leave cell, a hand-typed marker — is left alone and raised on
  Leave War's clash strip (`kind:'duty'`) for a human; where the same date
  holds a wire-2 leave cell, **leave wins** deterministically (the two
  reconcilers must not fight over one cell). A hand-typed FO/HO matching
  the verdict is taken over in place, like ingest's confirming upgrade.

Tests: `src/engine/oil.test.ts` (the computation),
`src/leavewar/oilsync.test.ts` (the wire, the partition, the clashes, the
input claims), `src/ui/oilconfirm.test.tsx` (the ask sheet),
`counters.test.ts` (earned OIL in the balance and the OIL BAL figure).

## Editable rules (Logic tab)

`VCONF` (20 numbers) + `SHIFT_HARD` (6 gradings), admin-only.
`RULE_STD` frozen standard; `RULE_SPEC[k]={t,u,lo,hi}`. `ruleParse` accepts
"12h", "2h20", "90", "0700". Storage keeps ONLY the diff in
`localStorage['sqn142_rules']`; `rulesLoad` (called by `initStore` at boot —
do not remove) treats storage as untrusted: number, finite, in bounds.

## Stores configuration (`engine/stores.ts`, owner, 7 Aug 26)

The squadron's stores list — **TPOD, 2 TKS, NAV, N/C, 3 TKS, CL** by
default (the owner's order, 8 Aug 26 — set on the deployed site and asked
for as the default; the keys never moved, so no saved jet config or saved
list was affected) — used to be a fixed `const` in `ui/html.ts`. It is persisted state
now, the same shape `rules` has: `STORE_CFG: [key,label][]`, editable through
`addStore`/`delStore`/`renameStore`/`moveStore`, saved through `storesSave`,
loaded through `storesLoad`, and reset through `storesReset`. Rendering and
the pen's interaction rules are `docs/ui-contracts.md` §Stores configuration;
this is the storage side.

**A separate storage key, `localStorage['sqn142_stores']`, deliberately not
folded into `rules`.** `rulesReset()` does `store.set('rules', null)` — it
nulls the ENTIRE key, and `logic.test.tsx`/`rules.test.ts` both pin "reset
restores the standard exactly" against that behaviour. If the stores list
shared the `rules` key, resetting the rulebook back to standard would
silently wipe a squadron's customised stores list as a side effect of a
completely unrelated action — a scheduler resetting `VCONF.crewRest` back to
12h should never touch what stores a jet can carry. Two keys keep the two
resets independent.

**Whole-list-on-deviation, no per-entry diff.** `rulesSave` only ever writes
the entries that differ from `RULE_STD`, because a rule is an independent
number — `crewRest` changing does not imply `briefLead` changed too. A
stores list is not that: it is one ordered, renameable sequence, and its
order and its labels ARE the data, so there is no meaningful smaller unit to
diff against. `storesSave()` therefore writes nothing at all when the list
still equals `STORE_STD` (`storesAreStandard()`), and the full array,
whole, the moment it deviates in any way — one rename is enough to write
every entry, including the five untouched ones.

**Load validation treats storage as hostile input**, the same posture
`rulesLoad`'s scar comment documents for `rules` (a plain string once
poisoned the crew-rest maths because `isFinite("840")` is true). `storesLoad`
walks the raw JSON and drops anything that does not survive, in order:

- the top-level value must be an array; anything else is ignored outright
  and the standard six stand;
- each entry must be a 2-element array of two strings — a `[key, label]`
  pair, nothing else;
- the key must match `^[a-z0-9]+$` (same charset `storeKey` produces —
  non-alphanumerics stripped, not replaced) and must not repeat one already
  accepted;
- the label must be non-empty after trimming and at most `MAX_LABEL` (16)
  characters;
- at most `MAX_STORES` (24) entries are kept — later ones in the array are
  simply not read once the cap is hit.

If nothing in the raw array survives all of that — including when the
top-level value was never an array to begin with — `STORE_CFG` is set to
the standard six explicitly, not merely left at whatever it happened to
hold already, so a squadron never lands on an empty list because of a
corrupted or hand-edited storage blob.

## Key renumbering

`shiftKeys(head,pos,ix)` renumbers keys when a row is deleted, over
`SCHED.pending`, `SCHED.changes` and every AL's live `keys`.
`shiftAircraft`/`shiftFormation`/`shiftWave` compose it. Deleting a wave no
longer touches any duty block (owner, 13 Aug 26 — duties are decoupled from
waves; see §the duty block, and `CLAUDE.md` §Stable decisions). `saDutyIx`
survives in `waves.ts` but the wave-delete path no longer calls it.

## Re-ordering the SECTIONS (display order, owner 29 Aug 26)

Distinct in kind from re-ordering a list's rows (below): a scheduler can also
re-arrange the big section PANELS themselves — Programme · Flying waves ·
Duties · Sims · Ground Programme — on both surfaces. That order is a pure
DISPLAY sequence held on the day as `d.secOrder`, resolved by
`engine/order.ts secOrder(d)` (a day's own arrangement first, then the ADMIN
HOUSE DEFAULT for anything it did not list, then the canonical
`['prog','waves','duty','sims','ground']` as a final safety net; unknown keys
and repeats dropped). It is **never a slot key, never in `SCHED.*`, never an AL
amendment** — a section move touches no row inside any array, so every
`di.gi.li.ai`/`d:`/`s:`/`g:`/`a:` key and everything `validate()` and publishing
read is byte-identical (pinned, `engine/secorder.test.ts`). Its one write path is
`state/store.ts moveSection` (`histPush` + `notify`, no `markEdit` — one undo
step, not an amendment); it rides undo and the week-stash because
`histSnap`/`weekStashSnap` serialise `DAYS` wholesale, and a whole-day template
carries it (`engine/daytpl.ts` `secOrder` on the blob). Contrast the row reorder
below, which IS a key-remapping amendment.

**The DEFAULT arrangement is admin-set (29 Aug 26 pt.2).** Two GLOBAL defaults an
admin configures on the Admin → Squadron config page (`ui/AdminPage.tsx
ArrangeDefaults`), each a persisted-config singleton on the `wavehide` footing —
in-memory value, `*Save` writes `null` while at the un-customised baseline,
`*Load` sanitises untrusted storage, boot-loaded in `initStore`:
- **`SEC_DEFAULT`** (`engine/order.ts`, key `secdefault`, default the canonical
  five) is the fallback `secOrder(d)` uses for any section a day did not arrange
  itself — so an un-arranged day follows the house order and an explicitly
  arranged day still wins. Display-only, exactly like `d.secOrder`; when it equals
  canonical (the baseline) every render is byte-identical, so parity stays 728/0
  and the never-booting reference is untouched.
- **`WAVE_DEFAULT`** (`engine/reorder.ts`, key `wavedefault`, default EMPTY = off)
  is an order over the built-in wave kinds (`fly`/`sc`/`avalon`/`bb`). It is
  applied ONLY at wave-ADD time, and only on a day that is not signed off
  (`ui/board.ts addWave`/`addWaveFromTpl` → `waveInsertSlot` → the tested
  `moveWave`): the new wave lands in its kind's slot instead of at the bottom,
  never re-ordering an existing day and never touching a published one (a wave
  move is a real amendment — "new schedules only", owner). Unset ⇒ a new wave
  appends exactly as before. Pinned: `engine/arrdefaults.test.ts`,
  `ui/wavedefault-add.test.tsx`.

## Reordering a board list

Every list on the board — flying lines, jets inside a formation, Duties,
Sims, Ground Programme, the overall programme, overall notes — can be
dragged or nudged into a new position through `applyMove(fromAddr, toAddr)`
in `engine/reorder.ts`. Addresses are `mv:<kind>.<container…>.<index>` (`ac`
aircraft, `d` duty, `s` sim, `g` ground, `p` programme, `n` note). For every
kind but `ac`, two rows may exchange places IFF their addresses agree on
everything but the last component — one test that enforces every
containment rule at once (a duty row cannot change block, an AMT row cannot
become an OFT row) with no per-kind special casing. **A row moves only
within its own list**; a move that would cross lists is refused, and moving
a row *between* lists (a line to another Go, AMT ↔ OFT) is out of scope by
owner decision — delete-and-retype stays the path there.

**A flying row's address means two different things, and the drop decides
which.** The grip on a flying row carries the full aircraft address
`mv:ac.di.gi.li.ai`, because a flying row *is* one jet — but the owner asked
for both a formation that travels as a block and jets that resequence
inside it, and there is only one grip. `applyMove` resolves it off the drop
target: land on a sibling jet (same `di.gi.li`) and `moveAircraft` swaps the
two jets; land on another formation in the same wave (same `di.gi`,
different `li`) and `moveFormation` carries the whole formation, jets in
order; land in a different wave and the move is refused outright. That is
the only reading consistent with "a jet may never leave its formation" — a
drag ending outside the formation cannot mean "move this jet there", so it
can only mean "move this formation there".

**`permuteKeys`/`moveKeys` (`engine/keys.ts`) are the bijective sibling of
`shiftKeys`'s splice.** `shiftKeys` handles a delete: marks on the cut row
are dropped, marks after it slide down one. A reorder is the opposite
shape — every row survives, it only changes address — so the remap has to
be a bijection: `permuteKeys(head, pos, oldOf)` takes `oldOf[newIndex] =
oldIndex` and rewrites `SCHED.pending`, `SCHED.changes` and every issued
AL's `keys` through it. An index outside the permutation is left alone (a
stale key from a longer list is inert), never dropped or collided — drop
one and an issued AL silently forgets an amendment; collide two and one
amendment permanently re-labels itself as being about a different sortie.
Neither failure shows on screen, which is why it is tested on its own
before any mover calls it. `moveKeys(head, pos, from, to, len)` is the
one-move wrapper — the splice-out/splice-in permutation of a list of length
`len` — and `from === to`, an out-of-range index, or a missing `head` is a
no-op.

**A move marks the row at its NEW address, against the rule that a DELETE
marks nothing.** `markEdit()` with no key is how a delete avoids re-marking
the address it just vacated; a move's row still exists and its position is
what changed, so it marks its own new address — `ff:di.gi.to.cs`,
`dr:di.wi.to.role`, `gr:di.to.prog`, `ap:di.to.prog`, `sr:di.kind.to.label`,
`dn:di.to`, `fr:di.gi.li.to`. That is the same idiom every add already
uses, it is what puts the day into the next AL (mechanically, what "a move
counts as an amendment" has to mean), and it tints the row that actually
moved. Re-marking a row that already carried a pending mark is idempotent.

**Ground Programme's manual flag.** Ground renders in start-time order
(`groundOrder`, `engine/order.ts`) on both the week and the board, so a move
expressed in plain model indices would be undone by the very next redraw —
and the first move in particular would read as doing nothing at all: drag
the 1000 line above the 0800 line and a naive model move lands it at model
index 1, where the sort still prints it last. `moveGroundRow` freezes the
order on screen into the model before it moves anything: on a day with
`d.gman` unset, it runs `groundOrder` itself, permutes the ground array and
its keys into that rendered order (`permuteKeys` — the same primitive a
plain move uses), sets `d.gman = true`, translates the caller's model
indices into the frozen order, and only then does the ordinary splice. From
that point the day's Ground list renders in model order and a new row lands
at the bottom, same as every other list. The way back is Undo:
`histSnap()` serialises the whole of `DAYS`, so `gman` rolls back together
with the order and no dedicated control is needed.

**Duties now print in the order they are stored, on both the week and the
board** — dropping the week's fixed `dutySort` (SDO → SXO → OPS-O → …) so a
reorder sticks where it is made instead of being overridden the moment the
week renders. The port's seed data was re-laid to already match
`dutySort`'s output, so nothing looks different on day one. What that costs
is in `src/testing/refwin.ts`'s `reduty()`, which pushes the port's re-laid
`dutywaves` rows into the in-memory reference for parity: it makes the two
structural comparisons in `parity.test.ts` that read `dutywaves.rows` in raw
stored order — the deep-equal of `DAYS` against the reference's own, and the
walk of `collectEvents` — **tautological for duty-row content and order**.
By the time either runs, the reference's rows *are* the port's rows, so a
corrupted duty row (a wrong name, a dropped role, a mistyped time) would
show up identically on both sides and compare equal rather than being
caught. Nothing outside `reduty()` narrows that gap. What still has
teeth: every other field of `DAYS` and `collectEvents` — flying waves,
sims, ground, notes — is still a real comparison against the untouched
reference; wave labels are never touched by the push (only `.rows` is
overwritten), so a wrong or renamed label still fails for real; and a
wave-count mismatch between the two builds throws, from the out-of-bounds
`dutywaves[j]` write, rather than silently comparing nothing.

## Sorting a board section

Where a manual move above is the scheduler's own judgement, sorting is the
opposite move: throw the section's own reading order back at it. Every
section but overall notes gets a sorter in `engine/reorder.ts` —
`sortWave` (flying, by take-off — `parseHM(f.to)` — the jets INSIDE a
formation are a position in the formation, never a time, so `sortWave`
touches `w.formations` and nothing inside one), `sortDutyBlock` (by START
TIME since 10 Aug 26, one call per duty BLOCK — `dw.rows` — never the
whole day at once; it used to be role rank off `order.ts`'s `DUTY_ORDER`,
which shuffled an SC PM desk above an AM one), `sortSims` (by start time,
called once per `kind` so AMT and OFT sort independently of each other),
`sortGround` and `sortProg` (both by start time). **Overall notes have no
sorter at all** — prose in a chosen order has no natural key, and inventing
one (alphabetical? first-typed?) would silently reorder someone's argument,
so `sortDay` (below) walks waves, duty blocks, sims, ground and the
programme and stops there.

**Two of the sorters act on the LISTS OF BLOCKS rather than the rows
inside one** (owner, 11 Aug 26). `sortWaves(di)` orders `d.waves` and
`sortDutyBlocks(di)` orders `d.dutywaves`, each by the EARLIEST parseable
time anywhere in the block — take-off for a wave, start for a duty block.
Before this, building AVALON (19:00) and then SC (07:00) left the night
wave printed above the morning one permanently, since a wave could only be
moved by deleting and retyping it.

- **The key is a MINIMUM, not the first row.** That is what makes the
  inner and outer sorts independent, and it is the owner's own worked
  example: a first wave of 0700/0900 and a second of 1000/0800 must come
  out 0700/0900 then 0800/1000 — ranking on the first line typed would
  read 1000 for the second wave and leave the pair as built.
- **The shift hours are DEFAULTS, and the sort reads the CELLS** (owner,
  11 Aug 26 — "these are default times, don't hardcode it … apply the same
  logic based on what u see"). `SAWAVE` stamps 07:00 on a new SC and 19:00
  on a new AVALON, and both are ordinary editable cells from that moment
  on, as is every duty desk `waveDutyBlock` timestamps. So the key is read
  live off `f.to` / `r.str` on every run and **no wave KIND carries an
  assumed hour anywhere in `reorder.ts`** — retype an AVALON to 05:00 and
  it sorts above a 09:00 SC. Pinned by two tests that invert the defaults;
  a `kind`-aware shortcut here would pass every default-timed case and fail
  the first squadron that flies its own hours.
- **A block with no parseable time sinks to the bottom in model order** —
  a BB wave (hours are the scheduler's to set), a wave whose last line was
  just deleted, a duty block nobody has timed yet. Same fallback every
  other sorter here uses for a time-less row.
- **Standalone waves are sorted flat with the rest, not held to the end.**
  SC, AVALON and BB sit outside the day's flying COUNT (`dayCount`), but
  they are read down the day like anything else, so a 07:00 SC comes to
  rest above an 08:00 ordinary wave.
- **Labels are never renumbered.** `WAVE 1` is free text a scheduler may
  have replaced entirely, so a day sorted into 07:00-then-08:00 can read
  `WAVE 2` above `WAVE 1`. Rewriting them to match would clobber every
  hand-chosen name to fix a cosmetic mismatch; the owner was told.
- **Neither has a per-section Auto sort button.** They are day-level
  operations with no one section to hang a `⇅` on, so `⇅ Sort all` is the
  only thing that calls them.
- **A duty block's `sa` marker is a string, not an index into `d.waves`**
  (`saDutyIx`, `engine/waves.ts`), so a wave and the desk it brought can be
  reordered independently without either losing the other — which is why
  these are two separate sorters rather than one paired walk.

**Every sorter is a stable sort of the row's own INDEX range**, never the
rows themselves — `keySort(n, keyFn)` sorts `[0..n)` by `keyFn(i)`, and its
comparator falls back to `a-b` (the original index) whenever the keys tie
or are both unparseable, so equal keys — two formations off at the same
minute, two ground rows with no time at all — keep the order they already
had. Unparseable keys (`parseHM` returning null) sink to the bottom in
model order, the same fallback `groundOrder` already uses for a time-less
row.

**Every sorter is a no-op on an already-sorted section, and the identity
check runs BEFORE anything else** — `isIdentity(oldOf)` (every index maps
to itself) short-circuits with no model write, no key remap and no
`markEdit`, so pressing "Auto sort" on a tidy section changes nothing and
creates no amendment. This has to run first rather than after the fact,
because the alternative — sort, then compare, then undo the write if it
matched — would still have to invent a key ordering to compare against,
which is exactly the risk overall notes exists to avoid.

**A sorter remaps the amendment key space through the exact same
primitive a manual move uses** — `permuteKeys(head, pos, oldOf)`, the
bijective sibling `shiftKeys` gained for reordering (see above) — over the
identical key-space heads the matching mover in this file already touches
(`sortWave` over `ff:`/`fr:`/`st:`/`ar:`/`at:` plus the bare address,
`sortDutyBlock` over `d:`/`dr:`, `sortSims` over `s:`/`sr:`, `sortGround`
and `sortProg` over their own pair). The two block-level sorters take the
widest heads of all, and both borrow their list verbatim from the matching
DELETE path so the two can never drift: `sortWaves` uses `shiftWave`'s nine
(`wl:`/`ff:`/`fr:`/`st:`/`ar:`/`at:`/`it:`/`tr:` plus the bare seat
address, all at position 0 — the wave index), and `sortDutyBlocks` uses the
`d:`/`dr:`/`dl:` trio the board's block delete renumbers. A sorter that
skipped this would move
a row on screen while its amendment stayed addressed at the OLD index —
silently re-labelling an old amendment onto whatever sortie now sits
there. Like a move, a sorter marks the row now sitting at index 0 of the
section it touched (the same "mark the NEW address" idiom, not the old
one) — that single mark is what puts the day into the next AL.

**Ground's Auto sort (`sortGround`) also owns the day's manual flag, and
reports honestly when the flag is the only thing that moved.** Every
`sortGround` call clears `d.gman` unconditionally — Auto sort IS the way
back to the self-sorting render Ground normally has — even on the one path
where nothing in the row array needs to move: a day frozen in manual mode
whose rows already happen to read in time order. `wasMan` is read before
the clear, so the caller (`board.ts`'s `boardMbtn`) can tell that case
apart from a genuine no-op: `sortGround` still returns `true` and marks the
row (the flag flipping IS a change, even though the row array is the same
object, not a rebuilt copy), and the UI reports "Ground programme back to
time order" rather than the generic "Already in order" toast — clearing
the flag without moving a row is still something that happened, and saying
nothing would hide it.

**`sortDay(di)` is the primitive `⇅ Sort all` composes over**: every wave,
then the waves themselves, every duty block, then the blocks themselves,
every sim kind, Ground, then the programme, in that order, returning
whether ANY of them changed. **Inside before outside is load-bearing** —
each inner sorter permutes key heads pinned to a FIXED wave or block index
(`ff:0.2.`, `dr:0.1.`), so it must run while those indices still name the
block it was handed; sorting the outer lists first would leave every inner
call remapping the key space of whatever had moved into that slot. The
order on screen would come out the same either way (an outer key is a
minimum over the whole block, which reordering inside it cannot change),
so this is about amendment records staying attached to the right sortie.
`⇅ Sort all` itself
(`board.ts`'s `sortAllCommit`) wraps one call to `sortDay` in
`HIST.lock = true` for the duration — `histPush` (`state/history.ts`)
bails outright while the lock is held, so however many of the day's
sections `sortDay` touches, none of their individual `markEdit`s reaches
the undo stack; only the ordinary `afterSchedMutate()` call AFTER the lock
lifts pushes a snapshot, so Undo takes the whole day back in one step, not
one per section. An already-tidy day never needs the lock's protection at
all: `sortDay` returns `false`, nothing inside it ever called `markEdit`,
and the caller shows "Already in order" instead of pushing a no-op step.

**NOTHING SORTS ITSELF** (owner, 10 Aug 26 — "prevent a situation when the
scheduler types and the line jumps"). Typing a role into a blank duty cell
used to call `sortDutyBlock` from `boardChange` (`board.ts`) and reposition
the whole block under the typist; that call is gone, and no board list has
another like it. `⇅ Auto sort` and `⇅ Sort all` are the only things that
reorder anything here. The one exception predates the rule and stays: the
Ground Programme renders in time order every draw (`order.ts`'s
`groundOrder`), which was a separate owner request and avoids the problem
anyway, since a time-less row sinks to where the model appended it.

## Who a row stores: ID vs CALLSIGN

Two different things live in the model and mixing them up breaks rows silently:

- **Person IDs** — flying seats (`a.p`/`a.w`), duty rows (`r.id`), sim
  `p`/`w`/`pax[]`, the `more[]` overflow on every row, and `INPUTS[].person`.
- **Callsign STRINGS** — `ground[].who`, `allhands[].who` (a string or an
  array of them) and sim `.who`, all resolved through
  `nameToId` → `ID_BY_CS`, case-insensitively. `setSlotVal` writes
  `PEOPLE[id].cs` into them; a row may also hold free text that is nobody
  (`'149'`, `'ALL PILOTS'`), which simply fails to resolve and renders as
  plain text.

`rowCrew`/`slotVal` read the callsign rows back as IDs, so snapshots, AL diffs
and published days are all ID-based.

**Renaming a callsign** (`renameCallsign(id, cs)`, owner Aug 26) therefore has
to rewrite all three string fields as well as remapping `ID_BY_CS` — changing
`PEOPLE[id].cs` alone leaves those rows pointing at a name nobody answers to,
and the puck collapses to free text. It refuses a blank, a no-op and a
duplicate (`ID_BY_CS` can only point one way). It deliberately marks **nothing
pending**: the person in the seat has not changed, only the spelling, and
`rowCrew` diffs identically — an AL full of spelling would be noise. Published
day snapshots keep the spelling they were issued with, which is correct for a
historical document.

## Publishing / amendments

`SCHED = {al, pending, changes, als, dayOK, sign, orig, cur}`. Four sign-offs per day
(`SIGN_ROLES`) → "Publish day" clears that day's pending and spends its
signatures. Later edits become pending; "Publish AL n" stamps `{n, keys,
sign, days, n0}` — `days`/`n0` are stamped at issue time and NEVER
recalculated. `unpublishAL(n)` returns changes to pending. Publishing is
per-day; there is deliberately no "publish all days".

Edits only become AL changes on a day that is already published — edits to
a draft day are folded in when the day is first published, with no AL mark.

**Structural removals are real AL items even though their cells are gone.** A
delete first renumbers the surviving address space, then marks an inert
`del:di.seq.kind` tombstone. Reusing the removed row's old key would attach the
amendment tint to whatever shifted into that address; the tombstone instead
keeps the day index parseable while pointing at no live cell. Its sequence is
derived from pending, issued and historical AL keys, so no separate counter can
drift across undo. Tombstones travel unchanged through publish, unpublish,
history and version snapshots; the AL panel counts them as removals, while the
schedule CSV naturally contains only the rows that still exist.
**Reorders on a published day are real AL items too, recorded like removals**
(owner, 31 Aug 26). A move changes a row's POSITION, not the value at the head
field the mover would otherwise mark, so on a published day where two swapped
rows read the same at that head (two blank-label waves, two same-role duty rows)
`reconcileIssuedMarks` — a value differ — used to reconcile the proxy mark away
and the move reached no AL. A reorder of an ISSUED row now records an inert
`mov:di.seq.kind` tombstone instead (the same shape and lifecycle as `del:`),
which the reconcile sweep skips by name, so a move always counts. It is minted
only on a published day and only for an issued row: `reorder.ts`'s `done` gates
on `SCHED.added` — the head key it is handed IS that row's structural-add-key
form — so a still-draft added row reordered before its AL mints no tombstone and
stays cancellable, and a draft-day reorder keeps the ordinary field mark. The AL
panel counts tombstones as reorders beside removals. Two deliberate consequences:
a published-day reorder no longer tints one arbitrary moved row (it shows as a
reorder in the panel, like a deletion), and a move of an AL-tagged block keeps
that tag at the block's new position rather than retiring it. A reorder-and-back
shows two reorders (each move counts).

Draft structural additions carry an identity key that is remapped with the row
through drag, nudge and Sort. Issue clears that identity; unpublish restores it.
Therefore a row added after issue, reordered, and deleted again before its AL is
a net no-op: its pending add key is removed and no false removal is published.
The issued snapshot is the legacy fallback; accepted Ground inputs also carry
their stable source token. The fallback's positional lookup is index-based
and a reorder makes live and snapshot indices diverge, so it carries one
extra rule (audit, 12 Aug 26): a row that is NOT an outstanding draft add,
whose index runs past the issued section's tail while the live section is
longer than the issued one, IS issued — the surplus is exactly the draft
adds, so an issued row a sort pushed past the snapshot's row count still
publishes its removal instead of silently vanishing from the AL. A later AL keeps ownership if an older one is
unpublished even when it changed a different field on the row: AL snapshots
carry the live structural-add identities separately from field keys. Restoring
a frozen day clears draft identities along with the
draft rows it discards, so reused addresses cannot suppress a real removal.

## Version snapshots / restore

`daySnap(di)` = `{d: deep clone of DAYS[di], c: that day's slice of
SCHED.changes}` — the day "as issued, wearing its marks". Stamped at the
two issue moments: `setDayApproved(di, true)` → `SCHED.orig[di]`
(**first publish stamps the Original**) and `alIssue` → `rec.snap[di]` per
covered day. Snapshots live on the AL record / `SCHED.orig`, so they ride
`histSnap` (`a` / `o`) and `unpublishAL` with the state they belong to.
`daySnapOf(di, ver)` (`'orig'` | AL number) and `dayVersions(di)` derive
options from live records — orphan-safe by construction. Session-only, like
the AL list.

**Re-publishing a reopened day re-issues the current version in place**
(owner, 15 Aug 26). `setDayApproved(di, true)` on a day that already has a
`SCHED.orig[di]` (i.e. you came back through **reopen**) does NOT stamp a
new Original — it calls `reissueReopened(di)`, which refreshes the snapshot
`dayCurVer(di)` resolves to (`SCHED.orig[di]` when the day is at the
Original, `rec.snap[di]` when it is at an AL) with a fresh `daySnap`. The
view page reads the issued document through `daySnapOf(dayCurVer)`, so
without this a viewer would keep seeing the pre-reopen content while the
scheduler's live view moved on — reproduced with a plain note edit as much
as with a whole-day template swap. The version LABEL is unchanged (a
reopen+republish is a deliberate re-issue of that version, not a fresh AL
number appearing unasked). This is the ONE case where the Original is not
frozen forever: an explicit reopen+republish of a never-amended day
re-issues its Original — the earlier "never restamp, a rewrite could
masquerade as the Original" guard is overridden here because the re-issue is
deliberate. The **ordinary amendment flow — edit a published day, then
Publish AL, without reopening — never comes through `setDayApproved(true)`
a second time**, so it still freezes the Original the moment it is first
issued. Pinned in `publish.test.ts`.

**The current version.** `SCHED.cur = {di: 'orig'|n}` — which version each
day is showing. Stamped only by `alIssue` (cur = n for covered days) and
`restoreDayVersion` (cur = the restored version). Read through
`dayCurVer(di)`: the stamp counts only while its snapshot still exists,
else it falls back to the newest **issue** with a snap for the day (array
order — `publishAL` can issue a lower number after a higher was freed),
then `'orig'`, then `null`. That derivation is the orphan guard — a stale
`cur` after `unpublishAL` or an undo is inert, no cleanup pass exists.
The day-head shows ONE chip from it (grey ORIG when rolled back to the
Original while ALs exist; no chip on a published day no AL ever touched);
the ⓘ panel keeps the full historical AL list.

`restoreDayVersion(di, ver)` (engine/restore.ts — its own module because
slots.ts already imports publish.ts) is a **ROLLBACK**, owner decision
Aug 26: the version becomes the live document immediately. It replaces
`DAYS[di]` with a clone of the snapshot (live `today` flag kept), wipes
the day's `changes` slice and installs the snapshot's own (`snap.c`) so
the day wears exactly its issued marks, **discards** the day's pending
edits, and stamps `SCHED.cur[di]`. Nothing pends; no sign-off is needed
or spent; `dayOK`/`orig`/`als` are untouched, so later ALs keep their
dropdown entries and `nextAL()` keeps counting up. Returns false for a
missing version, else the number of pending edits discarded (0 is the
common case, and the toast reports the count). It pushes NO history and
calls NO reflow — the UI caller's `afterSchedMutate()` is the single undo
step. New edits after a rollback are ordinary pending and publish as
`nextAL()`. Corner case: unpublishing the AL a day was rolled back TO
orphans its snapshot — `dayCurVer` falls back and that AL's keys on the
day return to pending (self-describing on screen: fallback chip plus a
pending count, one undo away). Unpublishing a LATER AL does not re-pend a
rolled-back day: the rollback already overwrote its `changes` slice.

The `dayKeys` walker is LOAD-BEARING again since 15 Aug 26: the rollback no
longer diffs, but `rebaseDayPending` (§Drafts below) diffs the live day
against the issued snapshot with it whenever a draft is switched in on a
published day. It remains the executable documentation of the slot-key
grammar, its tests pin every prefix, and probe-bridge exports it — a new
day field now needs a `dayKeys` line or the rebase will be blind to it.

## Day templates (`engine/daytpl.ts`, owner ask, 15 Aug 26)

A whole-day master template: `{id, title, d}` — `dutytpl.ts`'s single duty
block, one level up. `d` (`DayTplBlob`) is an explicit ALLOWLIST of
`DAYS[di]`'s sections — `notes`/`allhands`/`waves`/`sims`/`dutywaves`/
`ground`, plus each section's own note field, and (owner, 29 Aug 26) the
optional `secOrder` — the day's section arrangement, so a saved template
remembers the order (absent = default; `cleanSecOrder` strips unknowns and
repeats on mint AND on the untrusted load) — never the day's calendar
identity. `dow`/`dt`/`today` stay off the blob on purpose: a template is
reusable across days, and baking in "Monday, Jul 13" would make every apply
silently rewrite the target day's own date. `wc` stays off it too, for a
different reason — it is not derived, but it is an authored per-day label
seeded once per day exactly like `dow`/`dt`, not a property of the
structure a template captures, so it stays with the day being edited.

**Crew blanked, cx/flag stripped.** `mintBlob` deep-clones the six sections
first, then walks the clone: every person reference is blanked (a flying
seat's `p`/`w` → `''`, a duty/ground row's `who` → `''`, a sim's `pax` →
`[]`, every `more` array → an array of `''`), and every `cx`/`cxr`/`flag`
mark is deleted wherever it can sit — allhands, formations, aircraft, sims,
duty rows, ground rows. A template is a clean plan offered for a FUTURE
day, not a record of one day's cancellations; carrying a cancellation
forward would seat a new day pre-cancelled for a reason that belongs to the
day the template was captured from. A ground row's `src` is stripped too —
the accepted-input token is an identity reference to a specific personal
input, exactly like a crewed seat, not part of the row's shape.

**`applyDayTpl(di, id)` refuses a published day** (`dayApproved(di)` is
`true` → returns `false`, caller toasts "Reopen the day first"): a
whole-day swap under an issued document would let the day silently diverge
from what the squadron holds, with no AL trail. A template replaces the
DRAFT, not the record. **`draftDup`/`draftSelect` used to share this
refusal and no longer do (15 Aug 26)** — a draft switch on a published day
runs `rebaseDayPending` (§Drafts below), which re-marks the day against the
issued snapshot and so closes the silent-divergence hole the refusal exists
for. A template apply has no such rebase, which is why this guard stays; if
it is ever wanted on published days, reuse the rebase rather than just
dropping the guard.

**Applying mirrors `restoreDayVersion`'s direct-write shape** (§Version
snapshots / restore above, `engine/restore.ts:90-110`): build the new day
object, write `DAYS[di]` straight (keeping the live `dow`/`dt`/`today`/
`wc`), then retire the day's WHOLE mark state — `SCHED.pending`,
`SCHED.added` AND `SCHED.changes` — the same three slices
`restoreDayVersion` wipes before installing the restored version's own
marks. The swap does not try to line up old and new row indices, so a stale
address may now name a different row entirely rather than the one it used
to. **`SCHED.changes` MUST be cleared too**, and this is a corner an earlier
build missed: a template swap marks NOTHING pending (unlike an ordinary
edit, which marks the one field it touches and so clears that field's
changes-mark through `markEdit`). Reopening a published day keeps its issued
AL changes-marks (it voids the signature, not the history), so left in
place every AL tint the day wore before it was reopened would survive onto
the template's brand-new, unrelated rows — cells reading "changed in AL2"
that AL2 never saw. A template has no issued marks of its own to reinstall
(it is a clean plan, never an AL), so `applyDayTpl` just clears and installs
nothing. Pinned by `daytpl.test.ts` (publish → AL1 tints a note → reopen →
apply → the tint is gone). No `histPush`/reflow inside the engine call —
the caller's `afterSchedMutate()` is the one undo step, the same contract
`restoreDayVersion` carries.

**Persistence mirrors `dutytpl`/`stores`**: a `daytpl` storage key, an
incrementing `'dt'+N` id past a module `SEQ`, untrusted-load sanitised
field by field (`sanitiseBlob` — a template missing its `d` blob entirely
is dropped, and every allowlisted field of `d` is type-checked or replaced
with an empty one). The standard set is deliberately EMPTY (unlike
`dutytpl`'s three seeded desks): a whole day is too specific to the
squadron's own programme to guess at, so the library opens with nothing and
every entry is one the owner captured off a real day of his own; an
unedited library writes `null`, the same "nothing persisted" idiom
`dutytpl`/`stores` use for their own seed.

## Drafts — per-day alternate schedules (`engine/drafts.ts`, owner ask, 15 Aug 26)

**The stow model.** A draft is an alternate CONTENT blob for one day, made
before that day is published. `SCHED.drafts = {di: [{id, name, d}]}` holds
each day's blobs, `SCHED.curDraft = {di: id}` which entry the live day
currently IS — there is no shadow copy being edited somewhere else.
**The live `DAYS[di]` IS the selected draft's working copy.** Switching
drafts stows the live day back into the selected entry's own blob
(`clone(DAYS[di])`), then loads the OTHER blob in as the live day. `d` is a
deep clone of the WHOLE day object (`daySnap`'s JSON idiom) — content only,
never a changes slice, because a draft is pre-publish by definition and
carries no issued marks.

`draftDup(di)` — the FIRST call on a day stows the live day as "Draft 1"
and mints "Draft 2" as a copy of it, selected: one tap turns "the schedule"
into two named alternatives. Every later call stows the currently-selected
entry and mints "Draft N" (highest existing "Draft N" name + 1) as a fresh
copy of live, selected. `draftSelect(di, id)` stows the outgoing live day
into its own entry, installs a CLONE of the target blob as `DAYS[di]`
(never the blob itself — editing the live day must never reach back into
the stowed copy), restamps `.today` from the live day (tracks the calendar,
not the document — the `restoreDayVersion` precedent again), and on an
UNPUBLISHED day retires the day's `SCHED.pending`/`SCHED.added` marks the
same way `applyDayTpl` does above — each draft's own edits were recorded
while IT was live and stop meaning anything the moment it is not, and a
draft day's marks never reach an AL anyway.

**A PUBLISHED day switches and duplicates too (owner, 15 Aug 26 — "change
to draft 1 to publish as AL1 but make some edits prior"), and the marks are
REBASED, not retired.** The original reopen-first refusal existed because a
wholesale swap under an issued document would diverge silently — the wipe
left no pending mark and no AL trail. `rebaseDayPending(di)` closes exactly
that hole, so the refusal is gone: after `draftSelect` installs the new
blob on a published day, it recomputes the day's whole mark state from
scratch against the issued snapshot (`daySnapOf(di, dayCurVer(di))`), using
`dayKeys` (§Version snapshots below — the walker kept as "executable
documentation" is load-bearing again). The result is indistinguishable from
hand-editing the live day into the draft's shape:

- a key whose value differs from the issued one → `SCHED.pending`;
- a key matching the issued day → wears its issued `changes` mark again
  (the `restoreDayVersion` reinstall idiom), so AL tints survive the swap;
- an issued sub-value gone from a SURVIVING row (a `who[]` hole, a shrunk
  `more[]`/`pax[]`) → pending — the address is stable, `slotVal` answers
  `''`, and the AL carries the clear;
- an issued row/structure gone entirely → one inert `del:` tombstone per
  row via `deletionKey`, the same granularity the board's own delete
  buttons mint (never via `markDeletion`/`markEdit`, whose `histPush`
  would shred the one-undo-step contract);
- a structure beyond the issued count → a draft-add identity key in
  `SCHED.added` (the `markStructuralAdd` vocabulary: `wl:`/`ff:`/`fr:`/
  `dn:`/`ap:.prog`/`dl:`/`dr:.role`/`sr:.label`/`gr:.prog`), so
  `deletionWasIssued` still answers "add-then-delete is a no-op" and
  `alIssue`/`unpublishAL` carry the adds unchanged;
- `inp:` pending keys are PRESERVED — an input filing addresses `INPUTS`,
  not the day blob; `dayKeys` cannot re-derive it and dropping it would
  silently lose a real amendment item.

Positional honesty is accepted: the whole marks machinery is positional,
so a draft that inserted a row at the front reads as "everything after
differs plus one row added" — the same thing hand-editing to that result
reads as. An A→B→A switch round-trip ends clean (zero pending). `Publish
AL<n>` then issues exactly the rebased set with no publish-path change,
and the issued snapshots never move under any of this — which is the whole
reason the switch became safe. `draftDup` on a published day needs NO
rebase: a dup changes no content (live is stowed and an identical copy
selected), so whatever was already pending stays exactly as it was.

**Refusal rules.** `draftSelect` refuses the already-selected id (nothing
to do, and "stow then reload yourself" would clobber live edits with a
stale stow). `applyDayTpl` still refuses a published day — a template
apply has no rebase and keeps the reopen-first flow. `draftDelete`
refuses the SELECTED entry only — the selected draft IS the live day, and
deleting the thing being edited from underneath itself is exactly the
ambiguity the refusal exists to prevent; a list holding one entry is legal,
it just leaves the selected plan as the only named one. `draftRename`
refuses an empty name and a duplicate name within the day (trimmed, 1..24
chars via `MAX_DRAFT_NAME`) — two drafts answering to one name would make
the switch toast, the version labels and the picker all ambiguous at once.

**Undo semantics.** Neither `draftDup` nor `draftSelect` calls `histPush`
or reflows — the UI caller's `afterSchedMutate()` is the single undo step,
the `restoreDayVersion`/`applyDayTpl` contract again. Because
`SCHED.drafts`/`SCHED.curDraft` ride `histSnap` (`dr`/`cd`, §History
below), a duplicate or a switch is one ordinary undo step and undoing past
it brings the blobs back too. `draftRename`/`draftDelete` are called from
`DraftsModal.tsx`, outside the engine's own write path, and push their own
explicit `HOOKS.histPush()` — renaming/deleting a draft is schedule
bookkeeping the undo stack should carry the same way.

**Publish unchanged.** `setDayApproved` needed ZERO change: it publishes
whatever is live, which is by construction the selected draft. There is no
second "which draft ships" decision anywhere in the publish path.

**The `'d:<id>'` version shape.** `daySnapOf(di, ver)` (`publish.ts`) grew
one resolution branch: a `ver` of the form `'d:<id>'` resolves to
`{d: t.d, c: {}}` for the day's own draft carrying that id — the empty
changes slice is the truth, since a draft has no issued marks. That is what
lets the whole preview machinery (`withDaySnap`, `dayPreviewHTML`, `DPREV`,
`prunePreviews`) work on a draft with no second code path. `isDraftVer(ver)`
tests the `'d:'` prefix; `draftVerLabel(di, ver)` is the one label reader —
a draft version names its draft, everything else falls through to
`verLabel` — so nowhere else derives a draft's display name independently.
A draft's preview carries no Restore button: restoring is the
published-version rollback, and making a draft live is the Drafts menu's
job (`draftSelect`, surfaced as `board.ts`'s `switchDraft`) — a second path
here would be a second write path to keep in step with it. `prunePreviews`
drops a `'d:'` preview both when its draft no longer exists (deleted, or
undone away) AND when its draft IS now the selected one — an undo can
restore that selection under an open preview, which would otherwise freeze
a stale stowed blob while the live day already is that draft.

`SCHED.drafts`/`SCHED.curDraft` are session-only, exactly like the AL list.

## Auth / roles

`ad/a` = admin, `us/us` = member (owner, 24 Aug 26 — renamed from a/a and
user/user; the sign-in card no longer prints them). `canEditSched()` =
session AND admin.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

**What a member may do (owner, 5 Aug 26).** The line is *their own record vs
the squadron's programme*, not read vs write:

| | member | admin |
|---|---|---|
| Inputs — add / edit / delete | **yes** | yes |
| Inputs — choosing WHO an input is for | no — always the view-as person | yes |
| Quals — `Enable editing`: tick a qualification, edit initials / flight / CAT | **yes** | yes |
| Quals — `Edit quals` (which columns the LoX carries) | no | yes |
| Quals — `Add person` (put someone on the roster) | no | yes |
| Quals — archive a person (the row's ✕) / Restore from the Archived drawer | no | yes |
| Accepting an input into the issued programme | no | yes |
| The Edit Schedule page at all (`canEditSched()`) | no | yes |
| Logic — editing VCONF / SHIFT_HARD | no | yes |
| Leave War — advancing the cycle stage (→ BIDDING CLOSED / → PUBLISHED) | no | yes |
| Leave War — deciding a bid (Pending / Approve / Refuse), at closed OR published | no | yes |
| Editing or deleting ANOTHER person's personal input (own inputs: either role) | no | yes |

**In the Leave War, moving the cycle FORWARD is admin-only (owner, 27 Aug 26
— "for a member i shouldnt be able to click on bidding closed or published,
thats an admin function").** This is the ONLY member-facing change to the
war: a member still bids while the war is open exactly as before
(`leavewar/engine/stages.ts:canEdit` stays `role==='admin' || stage==='open'`,
unchanged). `store.ts:advanceStage` — which had NO role guard, the lone gap
beside `reopenStage`/`setBidWindow`, both already admin-only — now refuses a
member at the write, and `Chrome.tsx` renders the stage-advance control only
for an admin (absent, not disabled — the same idiom the step-back control
uses). Nothing else about the war changed: member bidding, the bid window,
the out-of-window dim and every sync seam are as they were. Pinned in
`store.test.ts` (advanceStage refuses a member) and `chrome.test.tsx` (the
control is hidden from a member).

**The Leave War drag-select batch writers carry the single-cell gates
(owner, 27 Aug 26).** `setCells` / `clearCells` fill or empty many cells and
ride `canEditCell` per cell — a member fills what they could fill one cell at
a time (open stage, in window), skipping Raptor-owned/locked/out-of-squadron
days (PARTIAL by design, like `setCellRange`). `setBidStates` AND the single
`setBidState` both check `canDecide` at the write (27 Aug 26 overnight pass —
the single writer's "no login in this prototype" rationale pre-dated the
merge and had left it wholly ungated: a member could self-approve through
the store). A medical code is refused from a member in `setCell` itself (the
sheets only ever offered it to an admin; the store now agrees), and the batch
predicates carry the same term so the refusal lands in the COUNT.
`moveCells` is `shiftBid` for a whole selection: role-gated by `canEditCell`,
ATOMIC (every source and every landing day validated before any write — a
half-moved block is worse than a refused one, and there is no undo), landing
`{state:'pending', source:'bid', shiftedFrom}` per cell; a landing that is
occupied by a non-selected cell, Raptor-owned, or outside the war refuses the
whole move. All batch to ONE save-and-notify under the store's `quiet`
suppression. A batch API growing its OWN guard would be the drift-seam to
avoid — they must always call through the same per-cell checks. Since the
27 Aug overnight pass that cuts BOTH ways: `shiftBid`, the single-cell mover,
carries `moveCells`' whole day law (stage/window via `canEditCell` on both
ends, the landing on a real war day the person is still in the squadron for —
a typed off-war date used to land a bid on a day no column renders, silently
draining the balance), the validation half of `moveCells` is factored as
`moveProblem` (the grid's landing preview asks it, so the preview and the
commit cannot disagree), and a CHAIN of closed-war moves keeps the ORIGINAL
`shiftedFrom`. Pinned in `store.test.ts` §the batch writers. On screen:
`docs/ui-contracts.md` §Selecting on the Leave War grid.

**An admin keeps the bid decision after PUBLISHING (owner, 27 Aug 26 — "if
leave war is published, the admin can still have these functions").**
`stages.ts:canDecide` is now `admin && (closed || published)`, not closed
only: publication freezes the picture for the SQUADRON, but the admin still
runs the war, so a late change tapped in after publication is approved /
refused / moved exactly as at closed — via the drag-selection sheet's Decide
row, and the single-cell decision sheet. Since the 27 Aug overnight pass BOTH
store writers (`setBidState` and `setBidStates`) check this same `canDecide`
body at the write, so the store and the sheets cannot disagree about who
decides or when. `canDecide` and `canEdit` are still disjoint per stage (a
member never edits at closed or published), so the "no stage lets a member
bid and an admin decide at once" invariant holds. Pinned in `stages.test.ts`
and `deciding.test.tsx` (the admin decision survives into published). The
single click that a MEMBER makes on their own published leave is the remarks
editor (`docs/ui-contracts.md` §Published-stage remarks editing) — a member
edits their own note, an admin edits anyone's, and the save runs through
Raptor's `setLeaveRemarks → commitInputEdit`, so the same member-own gate
applies. `sync.ts:leaveInputAt` is a new query on the sync seam that finds the
Raptor input a war cell derives from.

**A member edits and deletes only their OWN personal inputs (owner, 27 Aug
26 — "they cant edit other people's input, only can view").** On the Inputs
page a member LANDS on their own inputs (the person filter defaults to `ME`
for a member, `all` for a scheduler) with "Everyone" one pick away; on every
other person's row the ✎ and ✕ are not rendered, but the document paperclip
stays (anyone may VIEW any attachment — owner, same day). The write-path
backstop behind the hidden controls is in `commitInputEdit` / `removeInput`,
gated on a signed-in session that CANNOT edit the schedule (`SESSION &&
!canEditSched() && r.person !== ME`) — the render gate's own predicate.
NOT the role literal `'member'`: the first cut compared against that string,
which no account ever carries (the member login is role `'main'`, auth.ts),
so the gate never fired in production while its tests logged in with the
fabricated shape and stayed green (27 Aug 26 overnight find — the fixtures
now use the real role). The app's own edit cascades (sync retraction,
medical trims, the accepted-row relink) stay person-scoped to the row's own
person, and a sessionless test/boot context is not gated. `resetSession`
also resets `ME` to the boot default now — the "View as" identity every
member gate keys on used to survive a logout, handing the next login the
previous session's person. This SITS BESIDE the
existing 22 Aug person-MOVE guard (a member may not reassign an input to
another person), which stays. Pinned in `audit-guards-inputs.test.ts`
(a member is refused another's edit and delete, allowed their own, a
scheduler allowed any).

**An admin can VIEW AS a member — the role badge is a toggle (owner, 27 Aug
26).** Clicking the topbar's Admin/Member chip (or the drawer's Account-row
button on a phone) flips the EFFECTIVE role the whole app reads; a member
account's chip stays an inert label. `auth.ts` keeps `LOGINROLE`, the true
role captured at login and never moved by the toggle — the ceiling that
means a member can never climb and a parked admin always has the way back.
`store.ts:toggleRole` is the one coordinator: it flips `SESSION.role`
(every gate reads it live), falls an admin-only page back to View-only
Sched, disarms any armed slot, drops Logic edit mode, and walks the Leave
War's role through the same `lwSetRole` seam `resetSession` drives — the
second and last production writer of that role. Deliberately NOT a full
`resetSession`: the week, selection, filters and undo history stay, because
the point is seeing the SAME screen through the other role's eyes. Pinned
in `roletoggle.test.tsx`.

Inputs opened because they are the crews' OWN leave, downchits and
detachments — the reference's `View only — ask a scheduler` gate made the
people they belong to ask someone else to type them. Accepting one into the
programme did NOT open with it: entering an input is the crew's, issuing it
is the scheduler's (`interactions.ts`, `canEditSched()`).

**Who an input is FOR is part of that line (owner, 22 Aug 26 — "for normal
user account they can only input their own self. Which is whoever they are
viewing as").** An admin picks anyone, on the Inputs page's form and the
month calendar alike; a member's input always lands on the view-as person
(`ME`), read live at commit. The Person control is therefore a scheduler's
on every editor — the page's add form and row editor print a member's
person as a plain value, the shared dialog hides the field
(`inputedit.tsx`, `canEditSched()`-gated) — and the write paths repeat the
gate: `commitNewInput` pins a non-scheduler's draft onto `ME`,
`commitInputEdit` refuses a non-scheduler person change, and the calendar
drag (`caldrag.ts`) has always refused moving someone else's chip. Pinned
in `inputs.test.tsx`.

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign, orig, cur, drafts, curDraft}` (`o`/`cv`/`dr`/`cd` fields); undo/redo
restores wholesale. Publishing is its own undo step, and so is a rollback.
`drafts`/`curDraft` (§Drafts above) ride the same snapshot for the same
reason the AL records do — a duplicate or a draft switch is one ordinary
undo step, and undoing past it brings the stowed blobs back too. Undo is
refused while focus is in an editable field.

The snapshot also carries the Inputs-calendar's two session-only planning
stores (`state/plan.ts`) — `PLANPUCKS` (`pp`) and `DAYRMK` (`dm`), the
scheduler's month-calendar to-dos and day remarks. Neither persists to
storage, but both ride undo/redo like any other edit; an older snapshot
taken before this feature landed carries neither field and restores both to
empty rather than throwing.

## The edit log (`engine/editlog.ts`, owner, 11 Aug 26)

Who changed which detail, when, and what it was before. Distinct from
§History above: that is the undo stack (whole-state snapshots, no
attribution); this is a per-key record with a name and a clock on it.

`ELOG = {rows, cap:400}`, each row
`{t, who, di, key, lbl, from, to}` — a ring buffer, oldest dropped. 400
rather than HIST's 60 because a row is a handful of short strings where a
history snapshot is a whole serialised schedule.

**The rows' keys move with the key space** (audit, 12 Aug 26). A delete or
reorder renumbers every index-addressed key; `keys.ts` already rewrote
pending/changes/ALs and now calls `elogRemap(move)` with the same remap, so
a logged edit keeps naming the ROW it happened on, not the address it
happened at — before this, the changes list jumped to whatever row had slid
into the old address and pinned one man's history onto another. A key whose
own row was deleted is dropped (the entry stays, as a plain unjumpable row —
the deletion's own "what it held" sentence sits beside it).

**Written at the two funnel choke points, and only when both values are
handed over.** `noteChange(key, was, now)` (`slots.ts`) and
`markEdit(key, was, now)` (`publish.ts`) each end in `logEdit`, which
returns immediately unless it has a key AND both values AND they differ.
That single rule is what keeps the log clean of the two calls that would
otherwise flood it: `afterSchedMutate()`'s bare `markEdit()` epilogue fires
after every mutation and carries nothing, and the board's structural marks
after an add carry a key with no "before".

**The two orderings are not the same and the code depends on it.**
`setSlotVal` calls `noteChange` BEFORE it assigns, so it reads the old
value itself; `txtSet` calls it AFTER, so it captures the old string into a
local first and passes it. Reversing either silently logs `X → X`, which
renders as no row at all. Pinned by the first two tests in
`editlog.test.ts`.

**Structural changes carry a sentence, not a pair of values.** A line, wave,
row or note added or removed reaches `markEdit()` with no key on purpose, so
`logAction(di, text)` names it instead — routed through `act()` in `board.ts`
so the toast and the log say the same words. Sort all logs one line, not six:
the sorters mark keys whose values never move, so `logEdit` is silent through
all of it by construction. Undo and redo log themselves.

**A deletion's sentence names what it deleted, an addition's does not.**
`board.ts`'s `desc()` reads the row the moment before its splice and appends
what it held — a formation's callsign and crew, a note's own words, a duty
row's role and man — so `Note removed` reads `Note removed — "EP OF THE
WEEK"` and the changes list stops asking the reader to remember. Free text is
clipped to ~60 chars because `act()` hands the same sentence to the toast, and
the toast stays one line. An addition says only "Line added": the row is
still empty the moment it is logged, so there is nothing yet to describe.

**A removed personal input logs its own line too** (`inputedit.tsx`'s
`removeInput`), naming the man, the type and the date — the input surfaces
are the one thing §Accepting/undoing above still leaves silent, and a deleted
input is otherwise a row that vanishes with no trace in either list.

**Three more ACTIONS carry a sentence for the same reason** (added 11 Aug 26,
after a review found the list silently missing them). Each changes the
schedule and reaches `markEdit` with no key, or with a key whose values it
cannot diff, so each says its own toast to the log through `logAction`:

| action | where | why it has no value pair |
|---|---|---|
| Accepting an input to the ground programme (and undoing it) | `interactions.ts`, the `[data-acc]` branch | the row did not exist a moment ago, so there is no "before" |
| Cancelling with a reason, and restoring | `cxCommit`, `board.ts` | `cx`/`cxr` are not addressed by any slot key |
| Rolling a day back to a published version | `interactions.ts`, the `[data-restore]` branch | `restoreDayVersion` swaps the whole day object — not one key passes through the funnel |

Accepting through `inputedit.tsx`'s relink (an accepted input edited onto
another person or date) is deliberately NOT logged: it is one user action that
internally unaccepts and re-accepts, and logging the engine call would put two
contradictory lines against one edit. The gap is the input surfaces, which the
changes list has never covered — it is a record of the SCHEDULE.

**The fields that write their own model must pass their values by hand.**
Stores chips, the bombs box, area, area time, in-times and traffic live
outside the txt-key grammar: they assign to the model directly and call
`markEdit(key)` themselves rather than going through `txtSet`. The board's
wave-title `<select>` (`[data-wsel]`) is the same shape and was the last
one found (audit, 12 Aug 26): it books under the week's `wl:` key, valued
by the TITLES the control shows, so a retitle from the board logs and marks
the amendment exactly as the week's cell does. Every one of
them passed a key alone until 11 Aug 26, so changing a jet's stores or an
airspace booking marked the cell as edited and then had nothing to say when
History was asked what changed — while the cell still wore the `cursor:help`
that promises an answer. They now pass `was`/`now`, read BEFORE the assignment
in each case. Two of them need care and the reason is written beside each:

- **`st:` is per-AIRCRAFT, and the chips and the bombs box share it**, because
  the amendment mark does. Both log `storesText(a.opts)` (`stores.ts`) — the
  whole load either side, not the one control that was touched — or two rows
  would carry the same label and contradict each other.
- **Traffic cannot read its own "before" at commit time.** All three handlers
  in `AirPop` write `traffic` in place before `airEdit()` runs (the typing one
  has to; a React-controlled list repaints under the caret), so the list is
  snapshotted when the popup opens and refreshed on every commit. The
  snapshot effect is keyed on `AIRKEY`, not on every render — the render
  effect below it deliberately has no dependency list, and re-snapshotting on
  an unrelated repaint would adopt the half-typed value as the "before".

Pinned by `ui/editlog-writers.test.tsx`, which drives the real gestures: the
bug was never in the log, it was in what the callers handed it, so a test
calling `markEdit` with two values by hand would have passed throughout.

**Three queries, and the ORDER of each is part of the contract.** `elogRows`
is newest-first — a feed answering "what just happened". `elogAllFor(key)` is
OLDEST-first — the story of one detail, so the last line is what it says now;
it is what the expanded bubble and an unfolded group show. `elogGroups(di)` is
one row per detail, newest-TOUCHED first, each carrying its own rows
oldest-first. A structural entry has no key and cannot group with anything —
a line removed and a wave added are different events that happen to share an
empty address — so each is its own group of one, keyed by its position in the
log so two identical sentences never fold together. A group takes its NAME
from its newest row: `keyLabel` is frozen per row, so a line renamed between
two edits would otherwise head its own group with a name it has stopped
having.

**`who` arrives through `HOOKS.whoami()`**, wired in `wireStore()` from
`SESSION`/`ACCOUNTS`. Accounts are hard-coded, so today it only ever reads
`Admin` or `Squadron member`. That hook is the one seam a real server has to
fill; nothing else changes when it does.

**Session-scoped, and cleared by `resetSession`.** Not persisted — the
schedule it describes is not either. Deliberately NOT in `histSnap()`: an
undo restores the schedule and leaves the record standing, because a log you
can rewrite by pressing undo is not a log.

`keyLabel(key)` turns a slot key into plain words ("MONSOON 1 · FCP", "Duty ·
SOF") and is **frozen onto the row at log time** — the row it names can be
deleted a minute later, and re-deriving then would print the wrong row's name
once the indices below it shift up. **The four per-AIRCRAFT keys name their
jet where the line flies more than one** (`· #2 FCP`, `· #2 stores`, added
11 Aug 26): the aircraft index used to be dropped from a flying seat, from
`fr:` and from `st:`, so on the demo Monday — two `VL BFM` lines of two jets
each — one label named four different details. `ff:`/`ar:`/`at:` address the
FORMATION and take no number. It appears only where there is something to tell
apart, so a single-ship reads as it always did, and the bubble was never
affected: it matches on the key, not on the words. `state/view.ts`'s `slotTitle()` answers a
similar question for the arm picker and is deliberately separate: it emits
HTML, covers only the crew keys, and lives where the engine cannot reach it.
