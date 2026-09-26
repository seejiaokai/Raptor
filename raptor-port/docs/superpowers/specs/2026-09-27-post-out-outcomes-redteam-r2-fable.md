# Red team, round 2 — the `[POST-OUT-OUTCOMES]` plan (Fable 5.1, 27 Sep 26)

Read: the plan's "Round 1 — what changed" section against both round-1 reports (mine, Astra's) and the round-1
brief. Code read only where a fix needed checking: `undo/timeline.ts` (the dispatcher, `undoConflict`,
`redoConflict`, `isEligible`), `state/store.ts` (`applyWeekModel`, `initStore`, the stash yardstick),
`engine/weekstash.ts`, `engine/weekctx.ts bundle`, `ui/peek.ts peekWeekHTML`, `engine/people.ts`,
`testing/refwin.ts`, `state/accounts.ts signIn`/`pidProblem`, `leavewar/sync.ts` (`availableFor`, `creditable`,
`runPoArchive`), `ui/weeknav.ts TODAY`, `engine/publish.ts discardPending`, `src/main.tsx` (the boot order), and on
PR #444's branch `undo-wire.ts` (`restoreRefusal`), `timeline.ts`, `sync.ts` (`postOut`, `undoPostOut`,
`restoreArchivedPerson`) and `store.ts postingProblem`. Nothing was edited but this file.

**Verdict: APPROVE WITH CHANGES.** Every round-1 finding is either fixed by the Round 1 section or put to him with a
default that one line can change. The fixes introduce three defects worth fixing before the build (the Undo wall, a
toast storm in the outcome pass, and a seed read the belt misses) and one question (3) that does not tell him what his
answer decides. None reshapes the plan.

---

## 1. Each round-1 finding — fixed?

### Fable F1–F13 and the brief answers

| # | Fixed | Why (one line) |
|---|---|---|
| F1 crowd axis (`availableFor` by date) | **yes** | Round 1 §"The past never reads pending" (a): the `p.archived` skip becomes `p.deleted ? iso >= p.deletedFrom : p.archived`; `oilDelta` then compares equal. One caveat to STATE (change 9): the posting window (`inSquadron`) still takes him out from his PO date — see §2(a). |
| F2 Undo/Redo re-seat him | **partly** | The Part B refusal (#444's `restoreRefusal` hook — it exists on that branch with the shape `(changes, dir) → string \| null`) covers both directions. But the Part A belt at `schedStore.write` / `weekstashStore.write` was dropped, so until Part B lands Undo CAN re-seat him and build-order step 4's "undo blocked" test cannot pass in Part A (change 6). And the refusal as designed walls the session — §2(c), change 1. |
| F3 posting writers/doors refuse a deleted man | **yes** | `archivedBy: 'del'`, `postOut`/`undoPostOut`/`restoreArchivedPerson` return false through `postingProblem`, the war refuses `gone`, the doors are not drawn. |
| F4 pass = projection, mutation split from the door | **yes** — but see change 2 | `applyDelete` / `deletePerson` / `commitPeopleSettingsProjection` is the right shape. The "last admin" skip-with-toast runs on EVERY notify (the pass's triggers) — a toast storm (§2, change 2). |
| F5 Part A touches #444's files | **yes** | The table in §13 names each file and its part; new CSS to `ui/postout.css`. |
| F6 the war's `gone` mark | **yes** | Set in `reprojectRoster`'s keep branch and on the frozen copy; in `sig`; read by the OIL tracker, `setPostOut`/`setPostIn`, `Matrix`, `SelectSheet`. |
| F7 no delete door for a hidden SANS man | **yes** (asked, Q2) | Default: Show SANS on → his sheet. Right not to change the mock-up without him. |
| F8 the pending list names the delete twice | **yes** | `peopleAttrsNow` returns the snapshot attrs for a deleted man on every day; `warnDelta` and `pendlist.ts` share it. |
| F9 `stashEditDays` cannot reach `dr`/`sg`/`sb` | **yes** | `stashEditWeek(v, edit(blob))`, same preserved-week rule, written only if changed. |
| F10 `poOutcome`/`poDone` carried by #444's four places | **yes** | `reprojectRoster` carry-over + `sig`, `setPeople`, `readPostOuts`, `windowRecord`; old `poArchive` read tolerantly. |
| F11 the 14-letter rule in `callsignProblem` | **yes** | Blank and `CS_TOO_LONG` first; the boxes take no `maxLength`; the "<cs> N" suggestion shortened to fit. |
| F12 the member-view Undo words | **yes** | "Switch back to the admin view to undo that." (Part B, `timeline.ts`). |
| F13 the six small invariants | **yes** | `canSignInAsAdmin`/`personOk` `!deleted` with the same `ADMIN_LOCK` body; the no-loaded-account-for-a-deleted-pid invariant pinned; the drawer's "· Member"; `setEffectiveRole`'s comment; `setSign` for the live boxes; `PLANPUCKS` blanked as a gap. |
| Q1 the rulings forgotten (D91, D109/D113, D174/D176, D189, D204/D221, D129) | **yes** | Added to the sweep; D189's tail rewrite taken as the truth, on the look card. |
| Q1 D284 (Restore AND Enable) | **yes** (+ asked, Q4) | Both arm the prompt through one `markBack(pid)`; Enable alone does not restore (asked). |
| Q1 D299's Tracker item | **yes** | Said as approved-and-not-done; asked (Q5). |
| Q5 the take-back is not "he's back"; clear `poDone` in `setPostOut` | **partly** | Not stated. #444's `postOut` take-back un-archives INLINE (never via `restoreArchivedPerson`), so extending it to un-suspend `offBy:'po'` is right — but the plan must say the take-back does NOT arm the prompt, and that `setPostOut` clears `poDone` itself (change 5). |
| Q6 `person.restoreAs` `own: 'never'` | **yes** | §12. |
| Q8 the change-guard `sig` reads the outcome | **yes** | Via F10. |
| Q9 the roll-call additions | **yes** — one over-statement | "The search box never finds a deleted man" is wrong on a day he flew: `#searchB` filters pucks by typed text, and his kept puck matches (change 8). |

### Astra A1–A8

| # | Fixed | Why (one line) |
|---|---|---|
| A1 the delete leaves or resurrects references | **yes** | `stashEditWeek`; the preflight refusing the whole delete on a preserved/unreadable future stash; the sweep of `d`, `sg`+`sb`, `dr[].d/.sign/.signBind`, `oild`; the belt at `applyWeekModel` (both branches), `initStore`, `rowsLeftOut`; Undo/Redo refusal; the adversarial tests listed. Input re-landing needs no belt (his inputs on those days are gone — checked in round 1). One materialisation the belt still misses: `weekctx.ts bundle()` and `peek.ts` (§2(d), change 3). |
| A2 three owner decisions | **yes** | Tracker: said as not done, asked. Restore/Enable: both arm the prompt, Enable-alone asked. Today: one helper `deleteCutoff`, the pass's due check kept separate (wall clock), asked — but Q3 as worded hides what the answer decides (§3, change 4). |
| A3 `callsignHolder` v. D286 | **yes** | The literal reading: `ID_BY_CS` holds roster people + placeholders only; `archivedHolders(cs)` many-valued; legacy strings resolve to nobody until an active man takes the callsign. |
| A4 the SANS double overlay | **yes** | One `windowFor(record, showSans)` called by `reprojectRoster` AND `setPeople` — equivalent to removing the carry-over (both now lay from the RECORD, not `ex`), and it keeps D302's promise to #444. Date-effective grouping asked (Q6). `reprojectRoster` (in `sync.ts`) can read the war's Show SANS through `getState()` — checked. |
| A5 `sanBy` erasing a hand change | **yes** | `quals-write.ts` deletes `sanBy` on every user SANS write; the same for `offBy` and `archivedBy`; the four-step test. |
| A6 the permission map; the unguarded role setter | **yes** | `lw.postout`/`lw.postin`/`lw.postoutUndo` → `LeavePersonProfile U`; `person.delete` adds `LeavePersonProfile U` (U is right, not D — the profile row is updated with `to`, never removed); `switchEffectiveRole` guarded on `SESSION.acct`; the raw setter stays localhost-only. |
| A7 `peopleAttrsNow` without a date | **yes** | The stronger form (a deleted man's snapshot attrs on every day) through the ONE function both call sites use; the key is never removed. |
| A8 Part A not disjoint | **yes** | The table; the D302 notice; the re-read of the six posting functions as one unit after integration. |

---

## 2. New defects the fixes introduce

### (a) The two clocks — the delete's cutoff is the app's today (`weeknav.ts TODAY`, 13 Jul 26), the pass fires on the wall clock

Walked every order I could construct. What holds and what does not:

- **A posting Delete dated between the two clocks** (13 Jul < P ≤ 27 Sep, e.g. 1 Sep): the pass fires at confirm
  (#444's `postOut` line 1465 already sends a date ≤ wall-today straight to `setPostOut`, and `postingProblem` refuses no
  past date — checked), `deleteCutoff(P)` = P. He is off days ≥ 1 Sep, kept before. **Consistent.**
- **A posting Delete dated before the app's today** (P ≤ 13 Jul): cutoff = 13 Jul; he keeps days P..12 Jul on the
  schedule while the war has him gone from P. On those days he is OUT of the ALL / ALL AVAIL crowd through the
  posting window — `availableFor` line 771 `inSquadron(lw, iso)` runs whatever the new deleted-by-date line says —
  so a published day in [P, cutoff) with a frozen crowd reads pending. **Not new** (an Overseas posting dated in the
  past does exactly this today — question 7's behaviour), but the Round 1 sentence "available on a day before his
  cutoff exactly as he was" is not the whole rule. State it (change 9) so the walk's #16 does not file it.
- **A hand delete** (Admin → Users, `deletePerson(pid, today)`): cutoff = 13 Jul. His Leave War records from 13 Jul
  go (`forgetPersonFrom`), his window's `to` = 12 Jul, his inputs from 13 Jul go — **including August and September,
  which the war itself shows as PAST** (the war's stages, its today and `runPoArchive` all read `localToday()` — the
  wall clock; `store.ts`, `period.ts`, `counters.ts` use `new Date()`). By the app's today those months are "to come";
  by the war's they are "months he was here" whose leave and OIL D299 says stay. Question 3 does not tell him this
  (§3, change 4).
- **This is demo-only, and the plan should say so.** `OUTSTANDING.md` (the 24 Aug 26 note, line 783) records that
  `TODAY` "drives only the today-ring/dot" and is to be pointed at the device date when the demo is replaced. From
  then on the two clocks are one and every order above collapses to "the later of his date and today". **The risk
  the plan creates:** `deleteCutoff` becomes a SECOND reader of that literal. If the database step switches the
  ring and forgets the cutoff, every delete after go-live strips a man from 13 Jul 26 onward — every day he ever
  flew — silently. Change 4 binds the cutoff to the one literal and files it where the switch will be made.
- **The OIL pass:** no clock (D48, D142). `creditable(id, iso)` by `deletedFrom` and `forgetPersonFrom` from the same
  cutoff agree; the reverse sweep's `desired` drops him from the same dates. **Consistent.**
- **`poDone` and the two clocks:** the Delete runs once; F3 then refuses every change to the posting; the pass's due
  filter keeps today's `!archived` so a deleted (hence archived) man is never re-run. A hand delete BEFORE a future
  Delete posting's date: the posting is then on a deleted man — `poDone` unset, `to !== null`, but `archived` → skipped.
  **Consistent.**
- **Boot:** `main.tsx` runs `initStore()` (line 53 — the live week loaded) before `wireLeaveWarSync()` (line 77 — the
  pass's first run), so a Delete due at boot sweeps the real live week, not the seed. **Checked, fine.**
- **NEW — the skip-with-toast storm (F4's fix):** the pass runs on boot, every Raptor notify and every Leave War
  notify. A due Delete refused as "last admin" is skipped with a toast and retried — i.e. a toast on EVERY notify,
  for as long as the posting stands (keystrokes, drags, the war's own writes). Change 2.

### (b) The callsign index holds only roster people and placeholders — does anything break?

Every reader of `ID_BY_CS` / `nameToId` on `main` (grep, non-test): `engine/people.ts` (init, `nameToId`, `whoId`),
`engine/slots.ts renameCallsign`, `state/roster-add.ts` (`newPersonProblem`, `putNewPerson`), `state/persist.ts hydrate`,
`state/people-settings-commit.ts` (`restorePeople`, `rebuildIdByCs`), `ui/UsersPanel.tsx rosterMatch`, `probe-bridge.ts`
(exposes `nameToId` — dev only), `testing/refwin.ts`. No import path, no e2e/handpass script, no `scripts/` file resolves a
callsign. Walked each:

- **The approve note** — `rosterMatch` → `nameToId` → nobody for an archived-only callsign → New person +
  `archivedHolders` note. Intended (D286 (5)). ✓
- **Restore / Rename** — `callsignProblem` reads active + placeholder holders and every person's id (PEOPLE keeps
  archived and deleted ids). ✓
- **The Leave War projection** (`raptorRoster.ts projectPeople`) — by id; `callsign: p.cs` is a display copy. ✓
- **The Tracker bridge** (`peoplewire.ts`) — by id, skips archived; a deleted man's enrolment keeps its `pid` and reads
  unlinked, as the plan says. ✓
- **`whoId`** — `PEOPLE[v]` first, so every stored id (archived, deleted) still resolves to its own man. ✓ A legacy
  callsign STRING → nobody → then the new holder: the plan's stated stance, D56. ✓
- **The two placeholders are `archived: true` in the seed** (`people.ts` lines 132, 138: `allavail`, `all` are
  `special:true, archived:true`). The plan's "a placeholder by its own callsign" clause must therefore key on
  `special` and run BEFORE the archived test, or `indexCallsigns` drops ALL / ALL AVAIL and every placeholder drop
  through a typed `who` stops resolving. The words are there; make the order explicit (change 7).
- **`testing/refwin.ts` must NOT switch to `indexCallsigns`** (the plan lists it among the writers). `recs()` rebuilds
  the REFERENCE window's own `ID_BY_CS` from ALL PEOPLE (its lines 79–80) so the reference resolves the scrubbed
  callsigns exactly as the port did before the scrub — it mirrors the reference's rule, not the port's. Switching
  it would drop the two specials from the reference's index and desync parity for nothing. Leave it; say so
  (change 7).

**Nothing else breaks.** ✓

### (c) The Undo/Redo refusal — can it trap him?

**Yes, for the whole session, and it will happen in the ordinary order of events.** Read `timeline.ts` on `main` and on
#444: `newestUndoable()` (line 541) returns the newest not-undone ELIGIBLE entry; `globalUndo()` then asks `mayReverse`,
`undoConflict`, `missingStores` and (on #444, line 568) `hooks.restoreRefusal(entry.inverse, 'undo')` — a refusal returns
without marking the entry. So the entry stays the newest undoable; the next press hits it again; everything older is
unreachable. `undoState()` keeps `canUndo: true` with that entry's label, so the button lights and every press refuses.
Redo is the mirror: `mostRecentlyUndone()` (line 548) picks the same refused entry each time.

The natural order — take him off five days by hand, then delete him — makes the fifth removal the wall, at once. Today's
deferred-collection barrier (`lw.postouts`, line 436–447, "refuse whole, never skip") is the same shape, so the trap is
not new in KIND; it is new in LIKELIHOOD, and a delete is permanent where a conflict is not. Sign-out clears it (D148),
which bounds it to a session and is not a fix.

**Skipping is safe here** where it was not for the stale-inverse hazard: the refused entry's image can NEVER be replayed
again (the delete is final), and an older entry that shares a key with it is still refused by `undoConflict` (a newer
not-undone entry sharing a key is a barrier whether or not it is skippable). Change 1.

### (d) The belt in `applyWeekModel` / `initStore` before the baseline

- **Can it make a published day read pending on load?** No. A never-stashed week has NO publication state — the seed
  branch calls `resetSched()` (line 518) and `weekctx.ts` line 83 says the same — so nothing there can read pending.
  A stashed week was swept inside the delete (or the whole delete was refused by the preflight), so the stash-branch
  strip is a no-op. `initStore`'s no-stash path is the seed. **Checked: the belt never produces a pending on load.**
- **Does it fight "pristine weeks are not stashed"?** No. The yardstick `weekBaseline = weekStashSnap()` is captured
  AFTER `applyWeekModel` (store.ts line 866 and its `loadWeek` twin), so a stripped seed week is pristine against its
  own baseline, is not stashed, and is re-stripped on every load — idempotent because the mark is permanent.
- **Which baseline.** "Before the baseline" must mean before **`resyncSchedBaseline()` at line 558** — the command
  layer's baseline — not only `weekBaseline` / `histInit()`. A strip after line 558 makes the next command diff the
  week and emit a spurious whole-week envelope (the F-01 trap in that function's own comment). The strip belongs right
  after the days are placed (line 498 stash / line 516 seed), before the relanding. Change 10.
- **A seed read the belt misses (new):** `engine/weekctx.ts bundle()` (line 97, the pure-seed fallback for a
  never-stashed week — read by `nextMondaySeed`, `prevSundaySeed`, the crew-rest / 7-day lookahead) and
  `ui/peek.ts peekWeekHTML()` (line 262, `stashDays(nextWk) || weekBundle(nextWk)` — the next-week peek column). With
  the app's today the 20 Jul seed week is "to come"; delete Vector on the 13 Jul week and the peek column still draws
  him, and next Monday's crew-rest phantom still counts him. Both are cached (`bundleCache` by `v@year`, `peekKey()`
  by `CURWEEK + stashGenOf(next)`) and a delete bumps neither. Change 3.
- **To state, not fix:** the live-week sweep goes through the funnel and leaves `SCHED.pending` marks; the stash sweep
  and the belt do not. On a PUBLISHED day the count is canonical (`dayDelta`) so both agree; on an unpublished day the
  D118 draft count (marks) shows the removal on the live week and not on a stashed one, until `[DRAFT-PENDING]`
  rebuilds that count from the change stream. `discardPending` clears draft MARKS only (line 1107) — it restores no
  content, so it is not a fifth whole-day replacement. One sentence in §4.3 so the walk's #19 does not file it.

---

## 3. The seven questions

1. **A posting with no choice** — well put; default right.
2. **Delete on Quals' Archived rows** — well put; default right (no mock-up change without him).
3. **Which "today"** — **mis-stated by omission.** It reads as a choice about the schedule alone. It must also say:
   (i) the same cutoff decides which Leave War records (leave, OIL) and inputs go — and the war runs on the calendar
   date, so with the app's today a hand delete wipes his August–September war records that the war shows as past;
   (ii) it is a DEMO choice: when the demo is replaced the app's today becomes the device date (the 24 Aug 26 note)
   and the two clocks are one — so his answer decides what the walk and his look show, not how the app behaves after
   go-live. The default (the app's today) is right to build — it is what makes the delete VISIBLE in the demo — with
   change 4's binding so the literal cannot outlive the demo.
4. **Enable alone** — well put; buildable: `signIn` returns `ok` for an enabled account whose person is archived
   (`pidProblem` line 234 lets an account keep its archived person; `signIn` line 186 tests only `on`). Default right.
5. **The Tracker** — well put; default right.
6. **SANS on the date** — well put; default right.
7. **Overseas and the past** — well put (names the crowd too); default right.

---

## The changes, numbered (exact)

1. **The Undo wall (§2c) — `undo/timeline.ts`, Part B.** When `hooks.restoreRefusal` refuses an entry with the
   delete's reason: in `globalUndo` set a new `entry.dead = true` and make `newestUndoable()` / `undoState()` /
   `undoMark()` skip `dead`; in `globalRedo` set the existing `entry.abandoned = true` (`mostRecentlyUndone` already
   skips it). In `undoConflict`, a newer entry sharing a key that is `dead` returns the "…can't be undone yet"
   wording, never "undo that first" (C1). Return the refusal's sentence as today. Tests (`undo-wire.test.ts`):
   remove-by-hand → delete → Undo refused → Undo again reaches the entry BEFORE it; an older entry sharing a day with
   the dead one is refused by `undoConflict`; add → Undo → delete → Redo refused → Redo reaches nothing wrongly;
   `undoState().canUndo` is false when only dead entries remain. (If he would rather keep the wall, it goes on the look
   card in words: "after a delete, Undo stops at the last change that had him on a day, until you sign out".)
2. **The toast storm (§2a) — `runPoOutcomes`.** The "last admin" skip toasts ONCE per posting per session (a
   module `Set` of person ids, cleared when that posting changes), and records `poBlocked: 'last-admin'` on the posting
   so the Post out sheet and Admin → Users' row can show "Delete waiting — he is the last admin who can sign in"; the
   retry itself is silent. Test: two notifies → one toast; the posting changed → the toast may fire again.
3. **The seed read the belt misses (§2d) — `engine/weekctx.ts bundle()` and `ui/peek.ts peekWeekHTML()`.** Apply
   `stripDeleted` to the pure-seed bundle's days ≥ cutoff on the seed fallback (on a COPY — `weekBundle`'s result is
   cached and shared), and make both caches see a delete: add a people-version counter (bumped in `applyDelete`) to
   `bundleCache`'s key and to `peekKey()`, or clear both from the delete command. Test: delete Vector with 13 Jul
   loaded; `peekWeekHTML()` and `nextMondaySeed(CURWEEK)` carry no row of his.
4. **Question 3 and the literal (§2a, §3).** Reword question 3 as §3 says (the war's records and the demo-only
   nature). Bind `deleteCutoff` to THE ONE literal — read `TODAY` from where `ui/weeknav.ts` declares it (move it to
   `engine/` or `state/` if `state/person-delete.ts` may not import `ui/`); never a second literal (the drift-seam rule).
   Add a pin test that `deleteCutoff` and the week pickers' today-ring read the same value. Correct the 24 Aug 26 note
   in `OUTSTANDING.md` ("drives only the today-ring/dot" — now the delete cutoff too) and add the cutoff to
   `[DB-READINESS]`'s list so the switch to the device date carries it (D201's shape: the doc that will be read at
   that step).
5. **The take-back is not "he's back" (Fable Q5) — §3 and §8.** State: a posting's outcome changed after its date
   (#444's `postOut` take-back — inline, never `restoreArchivedPerson`) un-suspends `offBy:'po'` and clears `sanBy:'po'`
   but does NOT call `markBack` (no prompt); and `setPostOut` (the war store) clears `poDone` itself whenever the date
   or outcome changes, so the drag door and the sheet's date box can never leave a stale `poDone`. Test: Overseas →
   the date passes → change to SANS → no prompt, SANS ticked, account on, `poDone` unset then set by the pass.
6. **F2's Part A gap — §13 / the build order.** Either keep my Part A belt (strip at `schedStore.write` and
   `weekstashStore.write` when `opts.restore`, in `state/store.ts` — not a #444 file) so Undo cannot re-seat him
   between Part A and Part B, or move step 4's "undo blocked" test to Part B and say Part A ships without that
   guarantee. Name which.
7. **`indexCallsigns` and the placeholders — §9.1.** Say the placeholder clause keys on `special` and runs BEFORE the
   archived test (both specials are `archived: true` in the seed). Remove `testing/refwin.ts` from the writers list:
   it rebuilds the REFERENCE window's own index by the reference's rule, for parity; leave it as it is.
8. **The roll-call's search-box line.** "The search box never finds a deleted man ON A DAY TO COME; on a day he flew
   his kept puck still matches a typed search (correct — the past keeps him)."
9. **§4.4 / the Round 1 (a) sentence.** Add: "the posting window still takes him out of the crowd from his PO date;
   for a Delete dated before the app's today, days between the PO date and the cutoff read pending through the crowd
   exactly as an Overseas posting does today (question 7)".
10. **The belt's exact seat — §"The belt".** "BEFORE the baseline" = before `resyncSchedBaseline()` (store.ts line 558):
    the strip runs right after the days are placed (line 498 / 516) and before the relanding. Add one sentence to
    §4.3 on the marks (the live-week sweep leaves `SCHED.pending` marks, the stash sweep and the belt do not; the
    published count is canonical so they agree; the draft count differs until `[DRAFT-PENDING]`).

## Ranked

1. Change 1 — the Undo wall (reaches him in the ordinary order of events; session-long).
2. Change 2 — the toast storm (reaches him at once when it fires).
3. Change 3 — the peek column and the crew-rest phantom still carry a deleted man from an unstashed week.
4. Change 4 — question 3's omissions, and the literal that must not outlive the demo.
5. Changes 5–10 — statements the build would otherwise guess at.
