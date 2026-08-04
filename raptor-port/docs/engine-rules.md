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
- "Available fly/duty"/"Fly" inputs are OFFERS (`isOffer`): never clash with
  anything, including their own sortie's brief/debrief.
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

`SCHED = {al, pending, changes, als, dayOK, sign}`. Four sign-offs per day
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

`restoreDayVersion(di, ver)` (engine/restore.ts — its own module because
slots.ts already imports publish.ts): replaces `DAYS[di]` with a clone of
the snapshot (live `today` flag kept), then diff-marks via the `dayKeys`
walker — every key whose value moved becomes **pending** and loses any
published colour; equal keys keep their AL marks; keys existing only in
the live day (rows the restore removed) get NO mark (the delete rule).
Returns false for a missing version, else the pending count (0 = nothing
differed). It pushes NO history and calls NO reflow — the UI caller's
`afterSchedMutate()` is the single undo step. Restore is an amendment,
never a rewrite: the reverted content publishes as the next AL.

## Auth / roles

`a/a` = admin, `user/user` = member (view-only). `canEditSched()` = session
AND admin. Members: no edit page, no Inputs add/delete, read-only Logic.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign}`; undo/redo restores wholesale. Publishing is its own undo step. Undo
is refused while focus is in an editable field.
