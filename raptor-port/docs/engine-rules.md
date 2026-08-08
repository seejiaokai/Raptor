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
  every brief-driven check follows is the indicated B. A standalone wave is a
  shift and briefs nothing, so a value typed on one stays inert. Brief window
  = brief → T/O. A published in-time still moves report time and crew rest,
  never the brief.
- Crew rest (VCONF.crewRest) runs off the last REST-BEARING commitment
  (sortie or shift), and anchors on the earlier of the published in-time and
  the leg's own brief. Breach = hard CR; nominal-inside-rest = adv TT.
  Exactly `crewRest` is legal — the breach is strictly less (owner, 6 Aug 26).
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
  counted with the rest. While the man still clears rest by the **latest
  show** (`VCONF.showLead`, 60 min before T/O, editable) his puck rings
  **dashed** — sanctioned, and he makes the jet. Past that line it rings
  **solid**: he cannot walk, kit up and start engines, so he is unable to
  make the flight. Published per person as `WARN.dash[di][id]` (`dashOf`),
  because a chip carries no stroke of its own.
- **Every CR warning names the leave-by time** and the day it is measured
  from (`leaveBy`, `prevDi` on the warning).
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
- Tight turn needs `max(VCONF.tightTurn, dekit + step)`.
- Double turn: two+ sorties in a day → ONE DT_SUM line naming everyone;
  **adv, not hard** (owner, 4 Aug 26 — double turning is routine and planned),
  matching the amber pucks. No span test.
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
  gone with them. `Fly` gets no exemption: filed under Unavailable it raises
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
  clash twice. (Accepted rows raising advisory `SHIFT_SOFT` vs SC shifts
  where the raw input raised nothing is intended — do not "fix" it.) Accepted
  to `'u'` the input itself clashes, like a Detachment. Known edge, by
  design: an all-day input accepted to `'g'` makes a time-less ground row →
  no event → no flag, same as any time-less scheduler-typed row — **except an
  all-day `Fly`** (owner report, 4 Aug 26): he is flying with another squadron
  the whole day, so `inputFlags` keeps that one case visible and the clash
  prints once, off the input. `acceptInput` refuses Unavailable-typed inputs
  outright (they are already issued, and promoting one would make its row
  clash with its own source input).
- **Every input the validator can see clashes with every kind of tasking**
  (owner, 4 Aug 26). The "but tasked" loop used to cover leave and downchits
  only, so a Detachment or an actioned-to-`'u'` personal input warned against
  a sortie but let a sim seat, a duty post or a ground row through silently.
  Now all of `day.input` clashes with all of `day.events`, with one carve-out:
  ordinary personal types stay quiet against `kind==='shift'` (the accepted
  row's `SHIFT_SOFT` is the designed voice there); leave, downchits and
  detachments still hard-flag a shift.
- **An actioned `Fly` is AWAY** (owner, Aug 26: a Fly means flying with
  another squadron). `isAway(inp)` = `isOffType(type) || (isFly(type) &&
  acc)` — it feeds `dayOff` (the Available-crew strip and the palette fade),
  `slotBar` (reason: "flying with another squadron") and the palette's
  `offReason`. Whole-day, either destination, no SC-SPARE exemption (that is
  local-leave only). Un-actioned Fly affects nothing, matching the
  `inputFlags` gate — keep the two gates aligned.
- `Detachment` is a new type. It groups under Unavailable with leave and
  downchits, but it is NOT `isOffType`: it does not confer leave's special
  powers (SC-spare eligibility and the rest), it simply reads as away.
- The input types split two ways, and this is the only place the split lives:
  `isUnavail` = Detachment + leave + downchit; `isPersonal` = Meeting,
  Training, Personal, Appointment, Fly, Other. Together they partition
  `INPUT_TYPES` — a test pins that nothing falls between them.
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
- Leave: LL, OL, OIL (`isLocalLeave` = LL+OIL). LL/OIL may stand an SC SPARE;
  OL and Downchit may not (hard DNIF_FLY/LEAVE_FLY) even though spares are
  otherwise `saExempt`. SC SPARE carries no crew rest either way. SC currency
  is checked for MAIN and SPARE. SC NIGHT ⊂ SC DAY.
- Standalone waves: SC (spares uncrosschecked), AVALON/BB (`noconf`).
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
  NB the label carries no `{maxRun}` token: `wlbl()` renders every token
  through `lgT()`, which would print a day count as minutes.
- Warning labels embed `{crewRest}`-style tokens; `wlbl()` interpolates the
  LIVE VCONF value.

Where flags reach the screen: `ui/html.ts` builders read `WARN`/`chipOf`;
`ui/highlights.ts` decorates pucks after every render; the board's
live-checks panel is `boardWarnHTML` in `ui/board.ts`; warning-box
interaction is `ui/interactions.ts` + `state/view.ts` (`DWOPEN`, `WFOCUS`,
`focusWarn`).

## Accepting a personal input

A personal input is aircrew-submitted and is NOT part of the issued programme
until a scheduler accepts it. `acceptInput(di, inp, dest)` in the mutation
funnel:

- `dest='g'` pushes a real row onto `DAYS[di].ground` built from the input
  (the TYPE as the title, the remarks in the row's `rmks` cell, the CALLSIGN
  in `who` like every other ground write, `hhmm(s)`/`hhmm(e)`, blank for
  all-day) and calls `noteChange()` on its key, so it is pending and reaches
  the next AL. The row carries `src` — a content key back to the input.
- `dest='u'` only sets `acc='u'`, moving it into the Unavailable block; no row
  is created.
- `unacceptInput` reverses either, finding the created row by `src` (not by
  index, which would rot when rows above it move) and calling `markEdit()` with
  no key.

Accepting twice is a no-op; undo first. The input is never removed — it stays in
Personal Inputs, faded, so the scheduler can see what they have dealt with.

## Editable rules (Logic tab)

`VCONF` (17 numbers) + `SHIFT_HARD` (6 gradings), admin-only.
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
`shiftAircraft`/`shiftFormation`/`shiftWave` compose it. Deleting a
standalone wave also removes its duty block (`d:`/`dr:`/`dl:` keys).

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

## Version snapshots / restore

`daySnap(di)` = `{d: deep clone of DAYS[di], c: that day's slice of
SCHED.changes}` — the day "as issued, wearing its marks". Stamped at the
two issue moments: `setDayApproved(di, true)` → `SCHED.orig[di]`
(**first publish wins**; a re-publish after reopen is a later state, not a
new Original) and `alIssue` → `rec.snap[di]` per covered day. Snapshots
live on the AL record / `SCHED.orig`, so they ride `histSnap` (`a` / `o`)
and `unpublishAL` with the state they belong to. `daySnapOf(di, ver)`
(`'orig'` | AL number) and `dayVersions(di)` derive options from live
records — orphan-safe by construction. Session-only, like the AL list.

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

The `dayKeys` walker stays although the rollback no longer diffs — it is
the executable documentation of the slot-key grammar and probe-bridge
exports it.

## Auth / roles

`a/a` = admin, `user/user` = member. `canEditSched()` = session AND admin.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

**What a member may do (owner, 5 Aug 26).** The line is *their own record vs
the squadron's programme*, not read vs write:

| | member | admin |
|---|---|---|
| Inputs — add / edit / delete | **yes** | yes |
| Quals — `Enable editing`: tick a qualification, edit initials / flight / CAT | **yes** | yes |
| Quals — `Edit quals` (which columns the LoX carries) | no | yes |
| Quals — `Add person` (put someone on the roster) | no | yes |
| Accepting an input into the issued programme | no | yes |
| The Edit Schedule page at all (`canEditSched()`) | no | yes |
| Logic — editing VCONF / SHIFT_HARD | no | yes |

Inputs opened because they are the crews' OWN leave, downchits and
detachments — the reference's `View only — ask a scheduler` gate made the
people they belong to ask someone else to type them. Accepting one into the
programme did NOT open with it: entering an input is the crew's, issuing it
is the scheduler's (`interactions.ts`, `canEditSched()`).

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign, orig, cur}` (`o`/`cv` fields); undo/redo restores wholesale.
Publishing is its own undo step, and so is a rollback. Undo is refused
while focus is in an editable field.
