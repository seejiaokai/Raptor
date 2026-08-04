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
- Brief window = T/O − briefLead to T/O, **always pinned to T/O**; a
  published in-time moves report time and crew rest, never the brief.
- Crew rest (VCONF.crewRest) runs off the last REST-BEARING commitment
  (sortie or shift). Breach = hard CR; nominal-inside-rest = adv TT.
- Tight turn needs `max(VCONF.tightTurn, dekit + step)`.
- Double turn: two+ sorties in a day → ONE hard DT_SUM line naming everyone;
  pucks stay amber. No span test.
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
  no event → no flag, same as any time-less scheduler-typed row.
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
- Leave: LL, OL, OIL (`isLocalLeave` = LL+OIL). LL/OIL may stand an SC SPARE;
  OL and Downchit may not (hard DNIF_FLY/LEAVE_FLY) even though spares are
  otherwise `saExempt`. SC SPARE carries no crew rest either way. SC currency
  is checked for MAIN and SPARE. SC NIGHT ⊂ SC DAY.
- Standalone waves: SC (spares uncrosschecked), AVALON/BB (`noconf`).
- Chip ranking `RANK` (highest wins): LD<DT<TT<A<SD<SB<DB<NB<CR<C<Q.
  Glyphs shorten: CR→R, NB/SB→B, DB/SD→D, LD→L. `A` = on shift AND down for
  a ground event/programme.
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

`VCONF` (16 numbers) + `SHIFT_HARD` (6 gradings), admin-only.
`RULE_STD` frozen standard; `RULE_SPEC[k]={t,u,lo,hi}`. `ruleParse` accepts
"12h", "2h20", "90", "0700". Storage keeps ONLY the diff in
`localStorage['sqn142_rules']`; `rulesLoad` (called by `initStore` at boot —
do not remove) treats storage as untrusted: number, finite, in bounds.

## Key renumbering

`shiftKeys(head,pos,ix)` renumbers keys when a row is deleted, over
`SCHED.pending`, `SCHED.changes` and every AL's live `keys`.
`shiftAircraft`/`shiftFormation`/`shiftWave` compose it. Deleting a
standalone wave also removes its duty block (`d:`/`dr:`/`dl:` keys).

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

`a/a` = admin, `user/user` = member (view-only). `canEditSched()` = session
AND admin. Members: no edit page, no Inputs add/delete, read-only Logic.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign, orig, cur}` (`o`/`cv` fields); undo/redo restores wholesale.
Publishing is its own undo step, and so is a rollback. Undo is refused
while focus is in an editable field.
