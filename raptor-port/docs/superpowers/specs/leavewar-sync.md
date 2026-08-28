# Leave War ⇄ RAPTOR sync — the design

**STATUS (17 Aug 26): wires 0–3 are BUILT** — `src/leavewar/state/raptorRoster.ts`
(projection) + `state/demoworld.ts` (the fresh-browser demo re-key, DEMO_MAP) +
`src/leavewar/sync.ts` (both reconcilers, the clash strip, `wireLeaveWarSync`
booted from `main.tsx` with a post-sync `histInit` re-baseline). Three build-time
divergences worth knowing: `ingestFromRaptor` now writes into the war HOLDING the
date (it wrote only the current war — a 2027 input would have landed in the 2026
grid); the seed's two Raptor-owned cells are backed by boot-time demo inputs
(else the reverse-clear would erase them); and both directions skip persons the
other side does not know. **Wire 4 (weekend/PH OIL) is BUILT too (17 Aug 26)**
— `engine/oil.ts` (the credit computation) + `sync.ts:runOilPass` (the
reconciler) — with five build-time divergences from the sketch below, each
argued where it lives. **Wire 4 was then REWORKED by the owner on 28 Aug 26**
(the block after the divergences is the shipped shape); the five divergences
stay as the 17 Aug record, each marked in place where the rework superseded
it:

- **The credit is DERIVED, not a cell-plus-ledger-entry.** The FO/HO cell
  (spelled FS/HS until the 28 Aug 26 rename) IS the record the work stood;
  the OIL balance derives `+ earned` straight from
  the cells' `earnsOil` (`counters.ts:earnedOil`). A ledger entry for the
  same fact would be the two-records-of-one-fact the counters module refuses,
  and reverse-and-replace comes free: the cell changes, the balance follows.
  The demanded distinguishability holds — only the wire mints raptor-owned
  FO/HO — and an **OIL BAL** figure joined the counter column so the credit
  lands somewhere visible.
- **No publish hook; a third reconciler pass.** Rather than a fifth
  cross-app seam on `setDayApproved`, `runOilPass` runs beside
  inbound/outbound on both stores' notifies and derives desired credits from
  `dayApproved` + the issued snapshot (`daySnapOf(dayCurVer)`). Every path
  that moves the issued document — publish, reopen, AL, reissue, undo,
  restore — is covered by construction, and "on publish, not on every
  keystroke" still holds: an unpublished edit changes no snapshot, so the
  pass finds an empty diff. (Since 28 Aug 26 this gate covers the SCHEDULE
  half only: an acknowledged INPUT claim — `row.oil`, the ask-flow's answer
  — is deliberately NOT publish-gated; the owner's acknowledgment is its
  gate.)
- **The non-working-day answer grew the event half.** Weekend from the date
  (`isWeekend`, UTC), holiday from the war holding the date — `DayInfo.ph`
  OR an event classified **'off'** by `columnKindFor`, which wires in the
  owner's own PH input path from the 17 Aug event build. Since the 18 Aug
  per-event tags, `columnKindFor` reads an event's own instance tag first
  and falls back to the type-library word match — so a one-off event tagged
  'off' in the sheet makes the day a holiday here exactly as a library word
  does. (`isNonWorkingISO` is EXPORTED since 28 Aug 26: the ask-flow's plan,
  the OilConfirm sheet and the bell's pending scan all read this same
  answer, so "is this day applicable" can never fork from the credit pass.)
- **The SC/duty split is the owner's 17 Aug refinement** — **DELETED
  28 Aug 26**, kept here only as the record it was: an SC AM/PM shift
  (wholly inside one half of the SC day window) was 0.5, anything more 1.0,
  with a midpoint tiebreak and a night clause (`scShiftCredit`); other duty
  rows went by summed written hours against `VCONF.oilFullMin`. The owner
  removed the shift-window rule by name ("It will just use the same rule as
  all I mentioned"), and `scShiftCredit` is gone from `engine/oil.ts` and
  the probe bridge — do not resurrect it. The uniform replacement is in the
  28 Aug block below; `oilFullMin` (default 361 — the owner's "6 hours 1
  min or more"; exactly 6h is a half — Logic-editable, its `RULE_SPEC`
  label now 'Full-day OIL threshold (worked mins)') survives as the ONE
  threshold, and spares and time-less rows still earn nothing.
- **The ownership partition is by vocabulary.** Wire 4's cells wear the same
  `{approved, raptor}` marker as wire 2's (every existing guard protects
  them for free), so each reverse sweep clears only its OWN codes — inbound
  skips FO/HO, the OIL pass clears nothing else — and on a contested cell
  **leave wins** while the duty credit raises a `kind:'duty'` clash on the
  strip. Without the partition each wire would garbage-collect the other's
  writes.

### The 28 Aug 26 rework (owner) — the shipped wire 4

The owner's word: *"It will just use the same rule as all I mentioned … they
see if the person works 6 hours or less, it's auto HO credited. If it's more
than 6 hours, it's FO. Regardless of time or shift in that day."* What
shipped:

- **FS/HS became FO/HO** — 'full day OIL' (earns 1) / 'half day OIL' (earns
  0.5); the chip and its legend swatch are CYAN (`rgba(59,198,232,…)`, the
  `--q-c` family), not amber. NOTE: `HO` is a RESURRECTED retired code — it
  once meant half a day of OIL TAKEN (long since migrated to `*OIL`), and
  the owner reused the letters with the new EARNED meaning; the negative
  parse pins were flipped and the history is commented in
  `leavewar/engine/codes.ts`.
- **ONE uniform rule, every source.** Pool each person's worked minutes for
  the day as an interval UNION (`engine/oil.ts:mergeMin` — overlapping rows
  count once; the 1.0/day cap now falls out structurally, a union cannot pay
  twice for one hour), then apply the one threshold (`uniformOil`): under
  `VCONF.oilFullMin` (361) is HO, at or over it is FO.
- **The auto-credit set WIDENED** (`dayOilSpans`): SC MAIN shifts by their
  written shift times; ordinary FLYING seats by the working day the sortie
  costs — T-O − `reportLead` through LD + `debrief`, the owner's
  report-to-debrief pick, with typed in-time lines deliberately NOT
  consulted (a stated simplification that keeps the read snapshot-pure);
  sims (amt + oft) by written str→end; duty rows; ground-programme rows;
  and Common Programme (`day.allhands`). EXCLUDED, deliberately: SC SPARE;
  AVALON and BB — the seats AND the `sa` desk blocks they bring; cancelled
  (`cx`) structures at any level; rows without both written times (no
  invented `openEnd`/`simLen` defaults — display may guess, money may not);
  and ground rows carrying `src` (input-derived — the ask-flow owns those;
  a Saturday dental must not auto-mint).
- **The ALL sentinel puck** (`people.ts` `all`, cs 'ALL') joined ALL AVAIL
  — byte-for-byte the same semantics: palette Placeholders strip, never
  validated, no warnings anywhere. On a ground/Common-Programme row on a
  non-working day, ALL or ALL AVAIL expands (sync-side `availableFor`,
  injected as `opts.expandAll` so `engine/oil.ts` stays Leave-War-free) to
  everyone available for the event's window: REGULAR AIRCREW ONLY — no
  SANS, no ground-crew Personnel, no sentinels or archived bodies — minus
  anyone an away input (`isAway`) overlaps.
- **The input ask-flow.** A duty-&-commitments input (`oilAsks(t)` —
  exactly the `restsInput` 8: Training, CSE, Meeting, Fly with,
  Appointment, Duty, OD, Other; Personal and SANS Availability excluded)
  whose span covers a weekend/PH is NEVER credited or skipped silently.
  Saving one opens **OilConfirm** (`ui/OilConfirm.tsx` — the UpchitConfirm
  recipe: nothing written before the answer, no default, Save disabled
  until a choice, Cancel writes nothing). A single day asks Yes (showing
  'HO — half a day' or 'FO — a full day', from `inputOilAmt`: all-day = FO
  per the owner; timed ≤6h = HO, >6h = FO) / No OIL; a multi-day span asks
  All days / Only some days… / No OIL, where 'some' opens a month grid (the
  RangeCal arithmetic) with only the applicable days tappable — tap to
  select, tap again to deselect, Save. The one gate body is `oilGate`
  (`ui/inputedit.tsx`), used by `InputEditor.save()`, `InputsPage.add()`
  and `InputsPage.saveEdit()`; decisions ride the same `writeInputsBatch`
  as the save — ONE undo step. The per-day plan body is `oilAskPlan`
  (`leavewar/sync.ts`), reading the exported `isNonWorkingISO` — the same
  applicability answer the credit pass uses.
- **The decision field**: `row.oil = { "2026-09-05": 1, "2026-09-06": 0.5,
  "2026-09-12": 0 }` — answered ISO day → granted amount; 0 = an explicit
  decline; an ABSENT key on an applicable day = unanswered → no credit plus
  the bell. Plain JSON, rides histSnap (undo) for free. VOIDED (deleted)
  when the type is retyped OUT of the ask set or the input moves to ANOTHER
  person (`commitInputEdit`; `reassignInput` and the calendar drag
  inherit); KEPT on time/remark edits — the save gate re-asks when the plan
  goes stale, and the credit pass re-checks coverage and non-working LIVE,
  so a moved input or a revoked PH leaves a stale yes inert.
- **Pooling across BOTH sources.** `desiredOilCells` (`leavewar/sync.ts`)
  pools per person|iso the published schedule (publish gate KEPT: issued
  snapshot, `dayApproved`) AND acknowledged input claims (NOT publish-gated
  — the owner's acknowledgment is their gate), then applies the ONE
  `uniformOil(mergeMin)` threshold (owner: hours SUM across sources; his
  worked example: 4h published duty + 4h acknowledged input = 8h → FO). The
  reverse sweep / never-overwrite-leave clash behaviour is unchanged, and
  now covers input credits for free.
- **The bell.** `oilPendingFor(person)` (`leavewar/sync.ts`) is a DERIVED
  predicate (the bugAlert shape): that person's inputs with an applicable
  covered day missing from `row.oil` (0 counts as answered; dormant
  `acc:'r'` rows never ring). The Shell's `#notifyBell` glows for the
  view-as person's pending question; the tap toasts 'Weekend/PH work —
  confirm your OIL', lands on the Inputs page and opens InputEditor on the
  exact input (iid via `inpById`) with the OIL sheet already up
  (`pops.OILASK`, one-shot). The lwSubscribe lane fires ONE
  signature-guarded Raptor notify when the pending picture changes, so a PH
  marked AFTER an input exists lights the bell at once (this closed a
  confirmed missing-repaint gap). No acknowledgment = no credit,
  structurally.
- **A pre-existing bug fixed in passing**: `leavewar/state/store.ts
  reconcile()` now keeps FO/HO (`isDuty`) raptor-ownership records through
  the storage load path — it previously listed only biddable + medical
  codes, so once the DB era makes that load path live, a credit's ownership
  record would have been dropped and the cell left an uncollectable orphan.

Rules: `docs/engine-rules.md` §Weekend/PH work earns OIL. Tests:
`src/engine/oil.test.ts`, `src/leavewar/oilsync.test.ts`,
`src/ui/oilconfirm.test.tsx`. The §Wire 4
section below is kept as the design record.

Written at the merge (16 Aug 26), when Leave War became the sixth tab
(`src/leavewar/`, see `docs/leavewar/known-gaps.md` for what the vendored
app itself leaves open). The owner's direction: approved leave in Leave War
should automatically become a leave input on the schedule and vice versa,
leave consumption should draw the counters down, and working a weekend or
public holiday — an SC line, or a duty row — should credit OIL
automatically. This file is the design for those wires, so a later session
builds against decisions instead of re-deriving them. **Each numbered wire
is a separately shippable batch.**

## What is already true (verified at the merge, both codebases first-hand)

- **The vocabularies match.** Raptor's `INPUT_META` carries all eight of
  Leave War's leave types — LL, OL, OIL, OFF, CCL, PL, FCL, EL, every one
  `grp:'leave'` — and both sides call OFF "no leave counter". Leave War's
  own `known-gaps.md` was written before Raptor caught up and still says
  Raptor holds three leave types and reads every absence as a whole day;
  **both claims are stale** — do not plan against them.
- **Half days line up.** Raptor: AM `[00:00–12:00]`, PM `[12:01–23:59]`
  (`ui/inputedit.tsx` HALF_AM/HALF_PM, minutes `[0,720]`/`[721,1439]`).
  Leave War: `portion: 'am' | 'pm'` = 0.5 of a day, no clock attached. The
  mapping is `half:'am'` ⇄ `*CODE` and `half:'pm'` ⇄ `CODE*`; a CUSTOM
  timed Raptor input has no Leave War portion — see wire 2's rule.
- **Leave War's inbound/outbound model is built and tested, wire-less.**
  `ingestFromRaptor(person, date, code)` (its `state/store.ts`) writes an
  approved, `source:'raptor'` cell, upgrades an identical pending bid in
  place (`confirmed`), refuses a different code (`clash`), and Leave War
  then refuses to edit/decide/shift Raptor-owned cells (`raptorOwns`).
  `outboundToRaptor(grid, states)` (its `engine/raptor.ts`) derives every
  approved, biddable, non-Raptor-owned cell in stable order and skips
  Raptor-owned ones — the documented loop-breaker.
- **Rosters are joinable without migration.** Leave War derives category
  from seat+band (`categoryOf`), precisely so Raptor's roster can drop in.
  The two seed rosters are different people today (16 invented callsigns vs
  Raptor's PEOPLE) — wire 0 is therefore first.

## Wire 0 — one roster (prerequisite for every other wire)

Leave War's `people` becomes a projection of Raptor's `PEOPLE`:
`id`, `callsign: cs`, `seat` (Raptor `seat:'FCP'`→pilot, `'RCP'`→wso;
ground crew `pers:true` are **excluded** — Leave War is aircrew-only
today and the owner has not asked otherwise), `band` from the CAT ladder
(instructor CATs → 'instructor', else 'ops'), `sxo` from the SXO flag,
`from`/`to` null (Raptor has no posting dates; Leave War's PO handling
starts mattering the day it does). Leave War's PersonSheet (its seat/band
editor) goes read-only or is removed — Raptor's Quals page owns identity.
Leave War's stored `people` key then stops being read, same reasoning as
its `role` key at the merge: a stored copy can only disagree.

## Wire 1 — Leave War approval → Raptor input

On a bid reaching `approved` (the decision sheet, or `ingest`'s confirm):
push a Raptor input `{person, type: code, date: <label from the ISO date>,
allday | s/e per portion, half, remarks: 'Leave War', mod: today,
iid: minted}` through `writeInputsBatch` (`state/store.ts`) — the epilogue
(re-render, reflow, ONE history step) comes free, and undo stays one step
per action. NOT through `acceptInput`: leave is `isUnavail` and that path
hard-refuses it by design — leave reaches every schedule surface the
moment the input exists.

- **Date conversion is the only real work.** Leave War is ISO
  (`2026-07-14`); Raptor inputs use the label form (`'Jul 14'`,
  year-suffixed outside `baseYear()`). `dateOrd`/`inputCoversDate` already
  compare across years; the writer converts one way, once.
- **Consecutive approved days collapse to one spanned input**
  (`date`/`endDate`), matching how a human files leave. A later refusal of
  one mid-span day splits the input — the relink machinery in
  `commitInputEdit` is the precedent for edits like this.
- **Idempotence rides `iid`.** The wire stamps the Leave War war id + date
  onto the input (a `lw:` source field beside `iid`), so re-running the
  sync updates in place instead of duplicating, and deleting an
  un-approved bid removes exactly its own input.
- The reverse guard, RESOLVED as "route edits back" (owner, 17 Aug 26 —
  "make sure both leave war and input, edits or deletes are sync"; full
  two-way chosen over read-only, members included for their own rows):
  `commitInputEdit`/`removeInput` call `retractLwRow` (sync.ts), which
  withdraws the row's war cells through `withdrawLeaveCell` — the mirror
  of `clearRaptorCell` for lw ownership; exact-notation match only, never
  a Raptor-owned cell, stage/window bypassed (Raptor's word arrives
  decided). A delete ends the leave on both sides; an edit also drops the
  `lw` tag so wire 2 lands the edited shape as Raptor-owned cells — the
  ownership follows the last writer, which is the model's own rule. A cell
  the squadron has since rebid is left for the reconcile. Caveat by
  construction: Undo after such an edit/delete does not resurrect the
  leave (the restored lw row matches no approved cells and reconciles away
  as stale); re-file instead. Tested in `sync.test.ts` §two-way.

## Wire 2 — Raptor leave input → Leave War calendar

On a leave-group input add/edit/delete (`writeInputs` call sites, one
choke: `commitInputEdit` + the add form): for each covered loaded-or-not
day, `ingestFromRaptor(person, isoDate, code-with-portion)`. Arrives
**already approved** — filing leave on the Inputs page means it was asked
and answered verbally; that is Leave War's own documented semantics.

- **Portion**: `allday` → plain code; `half:'am'` → `*CODE`; `half:'pm'` →
  `CODE*`; a custom-timed leave input (neither allday nor a recognised
  half) rounds OUT to the halves it touches — a 10:00–14:00 LL covers both
  halves, so it lands as the full-day code. Rounding out never under-
  reports an absence; the schedule keeps the exact window.
- **Clash**: `ingestFromRaptor` returns `'clash'` when a DIFFERENT code is
  already bid. The surface for that is unbuilt on both sides — build it
  with this wire (a Leave War banner listing clashes for the admin, since
  the admin owns the resolution). Until acted on, the bid stands and the
  input stands; neither is silently overwritten — Leave War's rule.
- **Deletion**: removing the input clears the Raptor-owned cell (only if
  still `source:'raptor'` — if Leave War took it back over, leave it).

## Wire 3 — counters

Nothing to build beyond wires 1–2: a Leave War balance is DERIVED
(opening + granted − drawn, over every war), so cells landing from Raptor
draw the counter the moment they land. The Openings/Ledger stay Leave
War's own. The one Raptor-side surface worth adding later: the balance
beside a person in the Inputs add form, read from Leave War's
`balanceOf` — display only, never a refusal (negative balances are shown,
never blocked — the squadron's own workbook runs negative).

## Wire 4 — weekend/PH work earns OIL (the owner's rule, 16 Aug 26)

**This section is the 16 Aug DESIGN record, kept as history.** The build
diverged from it five ways (the status block), and the 28 Aug 26 rework
(also in the status block) then renamed FS/HS → FO/HO, deleted the SC
shift-window categorisation for the one pooled threshold, widened the
earning set well past SC/duty rows, and added the input ask-flow. Read what
follows as what was DESIGNED, not what runs.

The owner's words: *"use SC shift, but also the duties follow for that day
itself, based on what timing was written — take note these can be editable
in the rules engine too. Categorise them into Leave War."*

- **What earns**: on a NON-WORKING day (weekend, or public holiday), a
  person on an SC line (`waves[]` standalone `kind:'sc'`, main or spare)
  or on any duty row (`dutywaves[].rows`, e.g. the weekend SDO the seed
  already carries) earns OIL **from the timings written on that row** —
  the shift's own `to`/`ld`, the duty row's `str`/`end`, exactly as
  scheduled, not a fixed grant.
- **How much**: full-day vs half-day duty, categorised into Leave War as
  its own codes — `FS` (1.0 OIL) / `HS` (0.5) as designed; renamed
  `FO`/`HO` 28 Aug 26. The boundary between them
  is a VCONF rule (`RULE_SPEC` entry, Logic-page editable like `scDayFrom`
  / `scDayTo`), NOT a hard-coded clock time: the natural default is
  "scheduled hours ≥ N ⇒ FS, under it ⇒ HS" with N editable. The
  standalone spec's 14:30-knock-off sketch is superseded by this
  scheduled-hours shape; pin the exact default with the owner in the
  building PR.
- **Where the credit lives**: posted into Leave War as an auto-marked
  FS/HS (now FO/HO) cell + a ledger entry tagged as schedule-earned (its spec §
  Automatic OIL already demands: distinguishable from granted OIL,
  reversed-and-replaced visibly when the schedule changes after the fact,
  and NEVER overwriting a bid — an SC-vs-bid clash goes to a human).
- **What Raptor must grow first**: a non-working-day model. Weekends are
  data-only today (`waves:[]`, `dow`), public holidays do not exist
  anywhere in Raptor's engine. Leave War's `DayInfo.ph` is per-war data
  the admin already edits — the natural home; Raptor asks Leave War "is
  this date non-working" rather than growing a second calendar. A PH earns
  exactly as a weekend does, no bonus (Leave War's settled rule).
- **When it runs**: on publish (`setDayApproved`), not on every keystroke —
  an ISSUED day is the squadron's word that the duty stood; edits after
  publish re-run it through the reissue path, which is where
  reverse-and-replace naturally lives.

## Wire 5 — medical rides wires 1+2 (built 17 Aug 26, owner's rule)

The four medical markers — ATT B, ATT C, HL, OML — cross on the SAME two
wires as leave, not a new seam: an input on Raptor's Inputs page lands as a
raptor-owned Leave War cell, and a marker the admin writes on the grid
lands as an lw-tagged input. The differences from leave, each the owner's
own word ("these will be connected to the inputs"):

- **No approval step.** Medical is assigned, not bid — `outboundToRaptor`
  sends a medical cell the moment it exists (no `approved` gate), and no
  bid state ever rides one (`setCell` strips it; the `approved/raptor`
  record an INGESTED medical cell carries is purely the ownership marker
  the reverse sweeps read — `reconcile()` on load keeps exactly that
  record and still drops any bid-sourced state on a medical cell as drift).
- **Portion rule** (`medRowPortion`, not leave's round-OUT): AM/PM presets
  are the halves; a CUSTOM window — "which they should not" file — is a
  HALF day at six hours or less (exactly six is a half; contrast wire 4's
  "6h 1min or more" full-day duty rule, which is the owner's wording in
  each case) and a FULL day past that. Which half: the side of noon the
  window sits on, midpoint deciding a straddler. Leave's own round-OUT
  rule is untouched.
- **Vocabulary bridge**: Raptor spells the types 'ATT B'/'ATT C'; Leave
  War stores ATTB/ATTC (spaceless, parseCell round-trips), prints the
  owner's bare B/C (`displayCell`), and both sides' rows reduce to ONE
  signature via `lwTypeOf` so the diff sees them as the same fact.
- **Grid entry is admin-only** (`BidPicker`'s Medical row): members file
  on the Inputs page — "normally the input comes from input" — and once
  bidding closes a member could not write cells anyway.
- **Counters**: MED USED (= ATT C + HL + OML, halves as 0.5) follows for
  free exactly as wire 3 describes; ATT B feeds no figure (the owner's sum
  names the other three) and removes nothing from manning (he is at work).
- **Clash/deletion/ownership**: identical to wire 2 — a different existing
  bid raises the clash and nothing is overwritten; deleting the input
  reverse-clears only still-raptor-owned cells; the FO/HO-vs-rest
  vocabulary partition with wire 4's sweep is unchanged (medical belongs
  to inbound's side of it).

## The standing gaps every wire inherits (say them, don't rediscover them)

- **Both sides are session-only now — the reload asymmetry is CLOSED
  (17 Aug 26).** Leave War used to persist to localStorage while Raptor's
  `INPUTS` reset on reload, so a synced pair diverged: the Leave War half
  survived a reload and the Raptor half returned to seed, leaving a cell
  reverse-cleared or reappearing. The owner chose to make both reset per
  session ("I'm ok that it resets every session… I will make it eventually
  work with database"), so `main.tsx` now boots Leave War on `memoryBackend()`
  and the whole war resets on reload exactly as Raptor does — the two forget
  in lockstep, nothing lingers on one side. Wire 1/2 are therefore consistent
  within a session and consistent across a reload (both empty back to seed).
  Leave War's storage seam (`state/storage.ts`, `localBackend` still present
  but unwired) and Raptor's `HOOKS.storeBackend` remain the two swap points
  the future shared database backend replaces together.
- **Raptor loads ONE week; Leave War holds years.** Outbound (wire 1)
  writes inputs for any date (inputs already live off-week via
  `endDate`/`dateOrd`); wire 4 can only read duties for the loaded week.
  Fixes itself the day Raptor carries more data — the same first bullet.
- **No per-person identity on either side.** Raptor's ME is a view
  filter; members may edit anyone's inputs (owner-accepted prototype
  state). Ownership rules in these wires are honest bookkeeping, not
  security.
