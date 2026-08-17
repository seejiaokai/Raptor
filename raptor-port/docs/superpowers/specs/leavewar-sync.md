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
argued where it lives:

- **The credit is DERIVED, not a cell-plus-ledger-entry.** The FS/HS cell IS
  the record the duty stood; the OIL balance derives `+ earned` straight from
  the cells' `earnsOil` (`counters.ts:earnedOil`). A ledger entry for the
  same fact would be the two-records-of-one-fact the counters module refuses,
  and reverse-and-replace comes free: the cell changes, the balance follows.
  The demanded distinguishability holds — only the wire mints raptor-owned
  FS/HS — and an **OIL BAL** figure joined the counter column so the credit
  lands somewhere visible.
- **No publish hook; a third reconciler pass.** Rather than a fifth
  cross-app seam on `setDayApproved`, `runOilPass` runs beside
  inbound/outbound on both stores' notifies and derives desired credits from
  `dayApproved` + the issued snapshot (`daySnapOf(dayCurVer)`). Every path
  that moves the issued document — publish, reopen, AL, reissue, undo,
  restore — is covered by construction, and "on publish, not on every
  keystroke" still holds: an unpublished edit changes no snapshot, so the
  pass finds an empty diff.
- **The non-working-day answer grew the event half.** Weekend from the date
  (`isWeekend`, UTC), holiday from the war holding the date — `DayInfo.ph`
  OR an event word whose type is tagged **'off'** (`columnKindFor`), which
  wires in the owner's own PH input path from the 17 Aug event build.
- **The SC/duty split is the owner's 17 Aug refinement**, superseding plain
  scheduled-hours for SC: an SC AM/PM shift (wholly inside one half of the
  SC day window) is 0.5, anything more 1.0; other duty rows go by summed
  written hours against `VCONF.oilFullMin` (default 360, Logic-editable);
  SC spares and time-less rows earn nothing; per-person cap 1.0/day.
- **The ownership partition is by vocabulary.** Wire 4's cells wear the same
  `{approved, raptor}` marker as wire 2's (every existing guard protects
  them for free), so each reverse sweep clears only its OWN codes — inbound
  skips FS/HS, the OIL pass clears nothing else — and on a contested cell
  **leave wins** while the duty credit raises a `kind:'duty'` clash on the
  strip. Without the partition each wire would garbage-collect the other's
  writes.

Rules: `docs/engine-rules.md` §Weekend/PH duty earns OIL. Tests:
`src/engine/oil.test.ts`, `src/leavewar/oilsync.test.ts`. The §Wire 4
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
- The reverse guard: inputs the wire wrote are Leave-War-owned on the
  Raptor side — the Inputs page may show them read-only-ish or at least
  route edits back (wire 2's clash rule decides).

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
  its own codes — `FS` (1.0 OIL) / `HS` (0.5). The boundary between them
  is a VCONF rule (`RULE_SPEC` entry, Logic-page editable like `scDayFrom`
  / `scDayTo`), NOT a hard-coded clock time: the natural default is
  "scheduled hours ≥ N ⇒ FS, under it ⇒ HS" with N editable. The
  standalone spec's 14:30-knock-off sketch is superseded by this
  scheduled-hours shape; pin the exact default with the owner in the
  building PR.
- **Where the credit lives**: posted into Leave War as an auto-marked
  FS/HS cell + a ledger entry tagged as schedule-earned (its spec §
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

## The standing gaps every wire inherits (say them, don't rediscover them)

- **Raptor's `INPUTS` are session-only; Leave War persists.** Until the
  server/sync backend exists (HANDOFF's first bullet), a synced pair
  diverges on reload: the Leave War half survives, the Raptor half
  resets to seed. Wire 1/2 are therefore honest only within a session —
  ship them WITH that caveat in the owner's words, or ship the shared
  backend first. Leave War's storage seam (`state/storage.ts`) and
  Raptor's `HOOKS.storeBackend` are the two swap points one backend
  replaces together (Leave War's own next-phase note says push, not just
  persist).
- **Raptor loads ONE week; Leave War holds years.** Outbound (wire 1)
  writes inputs for any date (inputs already live off-week via
  `endDate`/`dateOrd`); wire 4 can only read duties for the loaded week.
  Fixes itself the day Raptor carries more data — the same first bullet.
- **No per-person identity on either side.** Raptor's ME is a view
  filter; members may edit anyone's inputs (owner-accepted prototype
  state). Ownership rules in these wires are honest bookkeeping, not
  security.
