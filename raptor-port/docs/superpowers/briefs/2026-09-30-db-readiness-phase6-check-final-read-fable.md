# Final code read — `[DB-READINESS]` group A phase 6, built steps (a), (b), (d) — Fable (30 Sep 26)

Read blind (the other reviewer's report unseen), against `git diff 0d1a5e18..HEAD -- raptor-port/src` plus the working
tree's comment fix in `state/person-delete.ts`; the plan (v2), the round-1 dispositions, `data-model.md` §9 rule 9 / §11,
`undo-contract.md` §0, the evidence sheet and its roll-call, Astra's scenario design, and the rulings named in the brief
(How we work, scheduler, OIL, people & accounts, the Leave War's architecture, the executor rule). Read-only: no file
changed but this one; no app, build, browser test or suite run. I re-ran the walk's own comparison script over the saved
facts of all five walks (a read of stored results, not a walk) to see exactly which screen facts differed between the
two builds — they are the ones the sheet names (storage, F1, F2) and nothing else.

**Verdict: no high or medium finding. Two low findings, one of them pre-existing in shape. The three steps do what the
plan says, at every door I could find, and the "missing call site" hunt came back empty.**

## The user promise, and how I looked

In the database a day is written only by its holder (D450). So the promise of (a), (b), (d) is: a hand-over, a filing
under Unavailable and a delete write their OWN record only, and every day still SHOWS the effect — at once, after a
reload, on a week not on screen, in the next-week peek, in the cross-week checks — with nothing on screen changed except
the plan's §8 items. I enumerated, from the code rather than the sheet:

- every place a week's WORKING days come into memory (the readers of `stashGet` / `stashDays` / `weekBundle` /
  `bundle`, the boot, the week load, the version load, the plan switch, the peek, the Leave War's readers);
- every writer and reader of an OIL per-man decision (`oild.people`, now `oild.pa`);
- every reader of an `inp:` mark;
- every door that changes a request's holder;
- the command layer's phase order (the diff at phase 4, deferred effects at phase 8, stream consumers at phase 9,
  rollback discarding effects), the scheduler baseline, the row composer, the change history's storage, the undo guard.

## Findings

### F1 — low — a delete made while the week ON SCREEN is read-only shows him gone until the next reload; the same week off screen would have refused the delete

**Where.** `state/person-delete.ts`: `stashPreflight` skips the loaded week (`if (v === CURWEEK) continue`);
`applyDelete`'s deferred effect calls `overlayDeletedWeek(String(CURWEEK), DAYS, …)` unconditionally. `state/store.ts
applyWeekModel` applies the overlay only `if (!isPreservedWeek(v))`. `engine/weekstash.ts stashDays` overlays a
preserved week's parsed copy too (the cross-week checks and the peek).

**Scenario.** Setup: the week on screen is one the app holds byte-preserved (read-only — a saved book in a format this
build does not support, or one that would not parse; `protectedWeek()` is true and the week says it cannot be edited).
Hex sits on Friday of it, a day to come. Gesture: Admin → Users → Hex → Delete, asked twice. Screen right after: Hex
gone from Friday (the overlay ran on the loaded model). Reload: Hex back on Friday (the read-only week is shown as
saved; the overlay is skipped for it, on purpose). From another week, the peek and the crew-rest look-ahead read him
gone, opening the week shows him. Had the admin been looking at ANY OTHER week, the delete would have been refused —
"The week of … can't be changed — the delete was not made" — which is the rule the plan keeps for a preserved week
holding him on a day to come.

**Before phase 6.** Pre-existing in shape: the old `applyDelete` wrote the loaded week through the funnel and the row
writer never writes a preserved week, so "right after" and "after a reload" already disagreed on such a week. Phase 6
did not create it; it moved the disagreement from the funnel to the overlay.

**Fix (my call — one rule for the loaded and the off-screen week).**
1. In `stashPreflight(id, cutoff)`, before the loop over `stashKeys()`, add the loaded week's own check: if
   `isPreservedWeek(CURWEEK)`, walk `DAYS` (`for (let di = 0; di < DAYS.length; di++)`), and for each day with
   `dayIso(CURWEEK, di) >= cutoff` whose `JSON.stringify(DAYS[di] || {}).includes(`"${id}"`)`, return
   `` `The week of ${CURWEEK} can't be changed — the delete was not made` `` (the same words as the off-screen refusal).
   Keep the existing `if (v === CURWEEK) continue` in the loop (its stash blob is the stale copy).
2. As a belt, in `applyDelete`'s deferred effect, guard the loaded-week overlay:
   `if (!isPreservedWeek(String(CURWEEK))) overlayDeletedWeek(String(CURWEEK), DAYS, …)` — importing `isPreservedWeek`
   from `../engine/weekstash` (already imported in `store.ts`). Keep `resyncSchedBaseline()` and `validate()` outside
   the guard.
3. In `engine/weekstash.ts stashDays`, skip the overlay for a preserved week: `if (!isPreservedWeek(v))
   overlayDeletedWeek(String(v), days)` — so the peek and the cross-week reads agree with what opening the week shows.
   (A preserved week can no longer hold him on a day to come once step 1 refuses the delete, so this is a belt.)
4. Pin: in `state/p6d-deleteonread.test.ts`, a case that loads a week, marks it preserved (`setPreservedBlob(W1, …)`
   from `engine/weekstash`), plants him on a day to come, calls `deletePerson(HIM)` and expects the refusal string, with
   `personKeysOnDay(TO_COME, HIM).length > 0` still and no `people` row written.

### F2 — low (performance, grows with the roster's history) — the overlay re-derives "his landed rows" per deleted man per day on every read of a saved week, inside `validate()`

**Where.** `engine/overlay.ts overlayDeletedWeek` → for each day × each deleted man → `stripPersonFromDay(d, id,
hisLanded(d, id))`; `hisLanded` does `INPUTS.find(…)` for every ground row carrying `src`. Callers: `stashDays` (read
by `weekctx.ts bundle`, `windowDiverges`, `windowInputs`, `windowFiling`, `stashGroundBySrc`, the peek), `bundle`'s
seed branch (a fresh `JSON.parse(JSON.stringify(b.days))` per call while a delete is due), `applyWeekModel`, the
delete's deferred effect. `validate()` runs on every keystroke and reads the neighbouring weeks through `bundle` /
`stashDays` several times (`seedRunIn`, `prevSundaySeed`, `nextMondaySeed`, `nextMondayWorked`, the three `window*`).

**Scenario.** Not a wrong answer — a cost. `deletedOverlayDue(v)` is true for every week whose Sunday is on or after
ANY deleted man's cutoff — that is every week from now on, for ever, once one man has been deleted (a deleted man is
never erased, D290). Each `stashDays` call then does, per day, per deleted man: a full walk of the day's structures
plus `INPUTS.find` per landed row. With a few deleted men and a few hundred requests it is a few hundred string
compares per call; with a squadron's turnover over years (tens of deleted men) it is tens of thousands per keystroke,
on top of the JSON parse that was already there. Today it is inside the noise; it is the one term in phase 6 that
grows without bound.

**Before phase 6.** New (the old delete rewrote the week once).

**Fix.**
1. In `overlayDeletedWeek`, compute the cutoffs that can touch this week once: `const cuts = deletedCutoffs().filter(([,
   c]) => dayIso(String(v), 6) >= c)` (drop `deletedOverlayDue`'s second call).
2. Build one request index per call: `const byIid = new Map<string, any>(); for (const r of INPUTS as any[]) if (r &&
   r.iid) byIid.set(String(r.iid), r)` — read `r.iid` directly, never `inpId(r)` (it mints an id on read — the same rule
   `sched-commit.ts decompose` keeps).
3. Per day, build the holder map once, before the man loop: `const holder = new Map<string, string>()` — for each
   ground row with `src`: `const inp = byIid.get(String(r.src)); holder.set(String(r.src), inp ? String(inp.person ||
   '') : whoId(r.who))`. Then `hisLanded(d, id)` becomes `new Set([...holder].filter(([, who]) => who ===
   id).map(([src]) => src))` — pass the map in (`stripPersonFromDay(d, id, srcsFrom(holder, id))`), and do the same for
   each parked plan's day.
4. Keep the exported `hisLanded(d, id)` for `stripDeletedFromDay` (the version-load belt), reimplemented over the
   same helper so the two cannot drift; `engine/overlay.test.ts` and `p6d-deleteonread.test.ts` pin the answers.
5. Optional, only if measured: memoise `stashDays`'s parsed-and-overlaid copy on `(blob, deletedSig())` the way
   `stashGroundBySrc` does, returning a fresh deep copy — callers mutate what they get (`dt` relabel), so never hand
   out the memo itself.

## Explicit negatives — what I checked and found nothing in

**(d) — where a week's days come into memory.** Every door the sheet's roll-call (i) names has the overlay, applied
before the command layer's baseline (`applyWeekModel` → `resyncSchedBaseline()`; `initStore`'s seed path; the
delete's deferred effect → `resyncSchedBaseline()`), or on a parsed copy (`stashDays`; `bundle`'s seed branch on a
clone — the cache keeps the pure seed; `peek.ts`'s seed fallback on `weekBundle`'s fresh copy). Readers I confirmed go
through `stashDays`: `weekctx.ts bundle` (both worlds — the official world substitutes `issuedDayIn` AFTER the
working-copy overlay, on the issued snapshot untouched), `windowDiverges` / `windowInputs` / `windowFiling`,
`stashGroundBySrc` (→ `rowElsewhere`, `oilev.ts stashStanding`, the card's Accept offer), `ui/peek.ts`. Readers that
correctly do NOT overlay: `leavewar/sync.ts stashOilWeek` (its `days` field is dead — nothing reads `wk.days`; the
credits come from `daySnapIn` on the issued book), `state/weekrows.ts` (the row writer), `person-delete.ts
stashPreflight`, `roster-restore.ts stillNamed`, `quarantine.ts stashProtected` (raw bytes on purpose). Memos: the
peek's key and `stashGroundBySrc`'s memo carry `deletedSig()`; `bundleCache` holds the pure seed and overlays a copy per
read; the Leave War's `STASH_OIL_CACHE` is keyed on the issued book and needs no invalidation. No sixth door found.

**(d) — the delete writes no day.** `applyDelete` changes PEOPLE (`deleted`, `deletedFrom`, `archived`), the account,
INPUTS (gone / ended, the "till" tail), PLANPUCKS, and writes the edit-log lines; DAYS / SCHED are untouched inside the
command. The scheduler store's diff is derived at phase 4 from the lagging baseline advanced by `schedApplyEnd()` inside
`apply`; the deferred effect runs at phase 8, after that diff; a rollback (`rollback(txn)`) discards deferred effects, so
a refused delete never strips the screen. The row composer (`persist.ts scheduleRows`) writes only days the envelope
names (from the LIVE week at phase 9 — so a day the holder changes later goes out overlaid, without him, which is the
design). `weekstashStore` is no longer enlisted by the delete or the hand-over; its only production writer is the undo
seam, guarded by `deletedRestoreProblem`. The walk's own storage audit (D2, D6, P2, A2-4, B2, B5: `weekRowsWritten
[]` on this branch against two to five rows on the build before) agrees.

**(d) — inside another command (the posting pass).** `runPoOutcomes` runs `applyDelete` inside `lw.postoutRun`
(`cmdCommitProjection`): `resyncSchedBaseline()` before enlisting, `schedApplyEnd()` after the loop, the deferred
overlay registered inside `applyDelete` and the reflow / `histPush` registered after it — FIFO at the outer command's
phase 8, after the outer diff; a child-join inherits the parent's `txn.deferred`, a queued run is its own pipeline.
Nothing in the outer command reads DAYS between the delete and the overlay expecting him gone (the war's own halves
read by date and cutoff). Its Undo: none (D350; the sheet's "Undo post out" refusal, walk P3). Its baseline: resynced by
the effect. Before phase 6 the outer envelope carried the pass's day changes (the plan's own finding); now it carries
none.

**(d) — issued versions, the past, the belt.** No issued snapshot is handed to the overlay (`book` carries `sign` /
`signBind` / `drafts` only; `SCHED.orig` / `cur` / `als` untouched; `issuedDayIn` substitutes after). Days before the
cutoff: `if (iso < cut) continue` (D297, D299). The version-load / plan-switch belt (`drafts.ts leaveOut` →
`HOOKS.stripDeleted` → `stripDeletedFromDay`) works on `liveDay`'s clone, never the stored version, and now decides a
landed row by the request's current holder (`hisLanded`) — F1 step 2 of my round-2 read is built and pinned. Undo /
Redo: a restore image holding him on a day from his cutoff is refused by `deletedRestoreProblem` (`days`,
`sched.book`, `weekstash`, `inputs`, `plan`, `people`, the accounts list); a change the holder makes AFTER the delete has
a post-overlay before-image (the baseline was resynced), so its Undo is allowed and never brings him back.

**(d) — the change history (D337).** The seat lines are `logEdit(k, slotVal(k), '')` inside the command; the edit log
is held by the command latch and saved as `elog:` rows in the command's own group (`editlog.ts` DEFER; `storage/tables.ts`
EditLog), so they survive a reload. Before phase 6 the same lines came from the funnel; the landed row and the sign-off
never made a line on either build (`unacceptInput` → `markDeletion` → `logEdit` with no values returns early; `setSign`
logs nothing); the request's own "deleted" line comes from the change stream (`changelines.ts`). Same lines, same
persistence.

**(d) — reload agrees with right after.** The deferred effect and `applyWeekModel` call the same body with the same
`book`; the outgoing week's in-memory stash (`loadWeek` line 629) carries the overlaid model, and re-reading it overlays
idempotently; storage keeps the pre-delete rows until the holder's next change and every read strips him. The one
disagreement is F1's read-only week.

**(a) — the OIL door.** `oilEvidence` is the one derivation; it clones `oild` and prunes on the copy (`pruneHandedOverDecisions`)
before anything reads it; the `left` check runs before the holder check, so A → B → A drops A's first-holding refusal
even though A holds it again; an extra keeps his refusal until the request LEAVES him (F2 of my red team — three orders
pinned in `p6a-oilstamp.test.ts`); a decision about another request or a row item (`r:`) is untouched. Readers all go
through the evidence: the OIL Earn pucks and switches (`oilmode.ts personDecision` on `ev.d`), the ALL AVAIL window's
OIL tab (`AvailWindow.tsx` → `toggleOilPerson` / `oilFigureFor`), the pending axis (`publish.ts oilDelta` →
`oilEvidenceKey(oilEvidence(di))`), the publish freeze (`daySnap`: `d.oilev = oilEvidence(di)` — the pruned copy, `pa`
included), the pending list, the validator (`oilEvidenceOf`). `oild` / `oilev` are excluded from the canonical field
map (`canonical.ts DAY_EXCLUDED_FIELDS`) and `oilDecisionsKey` serialises `items` and `people` only, so a `pa`-only
difference (a refusal re-made under a later holding, same answer) reads as no change — D98 holds. `dayDiscardCount`'s
raw compare is now honest for a hand-over (the raw block no longer moves). Writers of a per-man decision: `toggleOilPerson`
alone (the board, the window); `tidyDay` keeps `pa` beside its decision and drops an orphan stamp;
`stripOilSwitches` drops both for a deleted man. Frozen `oilev` on issued versions, the Leave War's credits and the OIL
tracker read the issued block and never re-prune (D142, D2).

**(a) — the hand-over doors.** `commitInputEdit` is the one write of `person`: the edit dialog, `reassignInput` (the `iu:`
arm / drop target and the dialog's Person field, `MedMoveConfirm`'s deferred move included), the calendar drag (dates
only). The "Load the week of … to edit this accepted input" refusal runs before the batch, so a refused edit bumps
nothing. `hand` and `leftAt` are written inside the same `writeInputsBatch` as the person change; the input record is
restored whole by Undo (the pinned "Undo brings his refusal back" and "reload keeps the holding" cases). No Leave War
door changes a request's person. No second holder-change path found.

**(b) — the filing marks.** `markInputFiling` / `markInputDays` are gone; no importer remains (the build is clean);
`acceptInput('u')`, the Accept-adopts-a-standing-row branch and `unacceptInput` write `acc` and the bare `markEdit()`
epilogue only; `unpublishDay` no longer re-opens `inp:` keys. Every count and sign-off comes from `filingDelta` against
the issued `fil` (`dayDeltaIn` → `inputAxes`), `dayDiscardCount` counts what a load can put back (`filingRestorePlan`,
unchanged), `pendlist.ts` reads the delta's address. The only reader of the raw marks was `discardableCount` /
`discardPending` (the Amendments panel's "Clear the marks…") — the sheet's F1, correct as built and now on his card. The
board's door still writes its own history line. The `drafts.ts` guards read stored marks only (D56).

**Roles and the day lock (§11).** Nothing in the three steps opens a member-side door onto a day; a member's own edit
of his request (remarks, dates) runs `commitInputEdit` without a person change and bumps nothing; a hand-over is a
scheduler's act (`reassignInput` is `canEditSched()`-gated; the dialog's Person field likewise). The ownership test and
`perms-scan` are in the gate run.

**Undo of the delete.** Not offered (D350); the timeline's guard says why in the app's words (walk P3).

**Performance.** Beyond F2: `deletedSig()` and `deletedCutoffs()` walk PEOPLE (tens) — trivial; the peek's key adds one
string; `stashGroundBySrc`'s memo still bounds at 32 entries. `bundle`'s per-call clone while a delete is due is the same
order of cost as the `stashDays` parse that was already there.

**Also checked, no finding.** `inpId(r)` inside `hisLanded` and `pruneHandedOverDecisions` can mint an id on a read
(SR-006's concern) — every booted row has one and a new row is minted at its command's apply-end, so nothing observable
changes; F2's fix reads `r.iid` directly anyway. A landed row of an ended (cutoff-spanning) request sits on its start
day, before the cutoff, in every walked case; one the scheduler had moved onto a covered day at or after the cutoff is
put back on its start day by the load's landing pass — pre-existing (the old delete un-landed it the same way) and (c)'s
reconciliation territory, not a phase-6 change. A FOUNDATION-era book's id backfill runs after the overlay — stored
data only (D56). Two tabs / the 30-second check: group B, not assessed. Step (c), phase 7: not assessed.

## Questions only the owner can answer

1. **The change history's seat lines for a delete cover only the week on screen** (as built — D337's "one line per seat
   he held on the week on screen"). A delete made while looking at last week leaves no "seat emptied" line on the weeks
   to come; the request, bid and award lines are written whatever week is open. Phase 6 did not change this (the old
   delete wrote the same lines for the loaded week only). **Recommendation:** leave as built now; the record of WHY
   (his "deleted" line, each request's line) is complete, and a seat line for every future week would need every saved
   week read at delete time — revisit if he wants it once group B's 30-second check exists, where such lines could be
   made on read the way the days are.

No other question. F1's rule (refuse the delete on a read-only week whether it is on screen or not — one rule) is a
technical call and I have made it in the fix.
