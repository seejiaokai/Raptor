# [DB-READINESS] group A, phase 6 — what a day shows, worked out on read (plan v2, 30 Sep 26 — after round 1; step (c) v3, 1 Oct 26 — after round 2)

**Branch:** `claude/db-readiness-table-shaping-4094f6` (group A's; phases 0–5b built and FULL-checked there).
**The parent plan:** `2026-09-30-db-readiness-group-a-plan.md` §3 phase 6 and §9 (this file is phase 6's detail; the parent
plan's §2 decisions bind it). **The design of record:** `raptor-port/docs/data-model.md` §9 rule 9 (and §3 ScheduleWeek,
§11). **Tier:** FULL (saved data, the published record, OIL — earned leave, D25 — and who may write a day, §11).
**Reviews:** the red team BOTH (D353 — an important plan): round 1 on v1 (Fable REVISE, Astra BLOCK — dispositions
`…/briefs/2026-09-30-db-readiness-phase6-dispositions-r1.md`; v1 = commit 90e1bd8a); round 2 on (c) v2 only; then the
build; then the FULL check (Astra's scenarios, the roll-call, the walk, both final code reads). **Rulings range:** D465–D469. **Observations:** #392 on.
**PROVISIONAL until IT confirms in writing** (the parent plan's head): "no plug-in" makes working-out-on-read the only
way; whether REPORTS can reproduce it is IT's (§12 q9) — the final hand-over of the `ScheduleDay` / `Input` shape waits
on that answer, and nothing here waits on it — **his ruling D465 (30 Sep 26, "Carry on"): phase 6 is built now, (c)
included, without waiting for IT's written answers.** **D466 (the same evening): work that needs IT's confirmation is held
until it comes; (c) does not — it follows from D450 — so D465 stands.** **D467 (the same evening, after round 2): the
built steps (a), (b), (d) get their FULL bug check first, in a new chat; (c) v3 (a holder base) follows in a fresh chat
on its own branch, with its last review round and its own FULL check.**

## 0. What phase 6 is for, plainly

In the database, a day is written only by the scheduler holding it (the day lock, D450). Four things today WRITE days
nobody asked them to — sometimes days in weeks nobody has open — and would therefore be refused, or would need a
scheduler to hold every day they touch:

- **(a)** handing a request to another man clears the old holder's OIL refusal off every day of every saved week;
- **(b)** filing an "Other" request under Unavailable writes a pending mark on every loaded day it covers;
- **(c)** filing, changing or deleting a request lands, re-makes or removes its row on its day — a member's own action
  writing a day (the one exception `data-model.md` §11 carries for IT, "until phase 6(c)");
- **(d)** deleting a man (or the posting pass on its date) rewrites every saved week from his cutoff on.

Phase 6 makes each of these write only its own record (the request, the person) and makes every day SHOW the effect by
working it out when the day is read — at every load now, and at every 30-second check once the app is connected (group
B). Nothing a person sees changes, except where §8 says so.

## 1. What the code does today (three read-only sweeps, 30 Sep 26, and direct reads)

The sweeps' notes: the session scratchpad, condensed here. Four facts change the parent plan's sketch:

1. **(a) is half built.** `engine/oilev.ts pruneHandedOverDecisions` (called by `oilEvidence`, the one door every OIL
   reader goes through) already ignores, on a COPY, an `i:<iid>` decision whose request now names someone else. The
   cross-week clear (`ui/oilmode.ts clearOilPersonDecisions`, one caller: `ui/inputedit.tsx commitInputEdit` on a person
   change) exists for ONE case the prune cannot see: **A → B → A** — once the request is back with A, A's old refusal
   matches again and revives (pinned: `ui/oilconfirm.test.tsx` "A → B → A across weeks", Codex scenario 7). So the stored
   decision must say WHICH holding of the request it was made under.
2. **(b) is cosmetic already.** A published day's count, its pending list and its sign-offs all come from the filing
   axis (`publish.ts filingDelta` against the issued version's `fil`) — never from the stored `inp:` marks. The marks are
   written only by an Unavailable filing, its undo, and the adoption of a standing row (`publish.ts markInputFiling`,
   three callers in `engine/slots.ts`); they ride the book, are moved at issue and re-opened at an Unpublish, and are
   counted only by "Discard marks" on never-published days (`discardableCount`, `discardPending`,
   `commitDiscardPending`).
3. **(c) is narrower than "18 readers" suggests.** Only ACTIVITY requests (`isPersonal` — a meeting, an appointment)
   ever become a row on a day: `slots.ts acceptInput` puts `{prog, str, end, who, rmks, src: <iid>, srcType}` into
   `day.ground`. Leave, medical, overseas duty, SANS and upchits are never written into a day — the Unavailable and
   Personal Inputs panels are drawn from the requests at render time (`inputsOn(dt)`), i.e. already worked out on read.
   The landed row's link is `row.src`. The 18 readers read that row IN MEMORY and do not change.
4. **(d) has no single place to filter.** Rendering, the validator, the canonical diff (the pending count and the
   sign-offs) and the OIL pass each read a day's seats raw. So the filter must be applied where a week's days come
   into memory — not at each reader. `state/person-delete.ts stripPersonFromDay` already strips every seat kind.

What the group-A final read already did (Fable F2/F1, 30 Sep 26): **a week load's and a boot's landing are never saved**
— `sched.load` writes nothing; the landing is worked out at every load. What remains of (c) is a request's own
command (filed, changed, deleted, handed over) still saving the day rows its landing touched.

## 2. The decisions (technical — mine; v2 after round 1 — `…/briefs/2026-09-30-db-readiness-phase6-dispositions-r1.md`)

1. **One read-time overlay, `engine/overlay.ts`, applied wherever a week's days come into memory** (the engine may not
   import `state/`, and the engine's own cross-week readers need it). **The doors** (Fable F1, Astra 1):
   - the loaded week — `state/store.ts applyWeekModel` and the boot's seed path, BEFORE the command layer's baseline is
     taken (the overlay is nobody's change);
   - a saved week read for anything — INSIDE `engine/weekstash.ts stashDays`, so every reader shares one overlaid copy:
     the cross-week checks in both worlds (`weekctx.ts bundle` — `issuedDayIn` still hands a PUBLISHED day's issued
     snapshot to the official world, D299), the alias gate (`windowDiverges` / `windowInputs` / `windowFiling`), the
     next-week peek, the row finder (`stashGroundBySrc` / `rowElsewhere` / `oilev.ts stashStanding`);
   - a week never saved — `weekctx.ts bundle`'s seed branch (on a copy: the cache holds the pure seed) and `ui/peek.ts`'s
     seed fallback;
   - a whole-day replacement — `engine/drafts.ts liveDay` (a plan switched in, a version loaded onto the working copy):
     D175's leave-out, then the `kept` / `srcv` marking of §3 (c), then the deleted-man strip (`HOOKS.stripDeleted`);
   - the week on screen after a command that changed a request, a person or a day (§2.2).
   Memos keyed on a saved week's bytes (`stashGroundBySrc`, the peek) also key on the deleted-men signature (built) and,
   with (c), a request revision (a counter moved by every command that changed a request).
   **The contract** (Astra 2): each door hands the overlay the week it reads — its Monday, its days, and (where the
   door has them) that week's OWN book (sign-offs, their bindings, its saved plans) and issuance context (for a saved
   week `stashSched(v)`, for the loaded week the live `SCHED`) — never the loaded week's `SCHED` for another week; the
   official world is never overlaid. **The order: (1) reconcile the request rows, (2) strip the deleted men, (3) land.**
   Astra asked for land before strip; the composition bug behind it (hand A's request to B, delete A, and B's row lost) is
   closed at its root instead — the strip decides a landed row by its request's CURRENT holder, never the name the row
   last carried (built, red first) — and landing last adds rows only for current requests, of which a deleted man has none
   from his cutoff.
2. **A derived change is made AFTER its command, never inside it** (Astra 3; and found building (d): a nested command
   JOINS its outer command's envelope — the Leave War's posting command carried the posting pass's day changes — so no
   list of command types can tell derived from intended changes). A command changes, inside itself, only what it means
   to change; everything it changes there is saved as today. What the command's change does to the week on screen is
   worked out by the overlay AFTER it — a phase-8 effect (after the command's changes are recorded, before its stream
   consumers), with the command layer's baseline moved on — so it is shown at once, is nobody's change, and nothing saves
   it until the day's holder next changes that day. Built for (d) (`applyDelete`). For (c): after EVERY command that
   changed a request, a person or a day (an Undo included — Fable F6's belt), the loaded week is reconciled once.
   The type list `DERIVED_DAY_TYPES` of v1 is withdrawn; `sched.load` keeps its own rule (a week load's landing, never
   saved — the group-A final read).
3. **The order of the steps: (a) → (b) → (d) → (c)**, each with red tests first, its own suites, the engine suite and
   `tfin.js` 728/0 before the next. (a), (b) and (d) are BUILT (§9).
4. **Nothing stored is converted.** Every change reads old stored rows correctly (a missing new field reads as "made
   under the current state"); the stored world is demo data, cleared before the database (D54, D56); the format stays 6.

## 3. The steps

### (a) An OIL decision made for one holding of a request ignores itself when the request is handed on — BUILT

As built (commits e6ebf963, f1bd1cf6): the request counts its holdings (`Input.hand`, +1 at every change of person in
`commitInputEdit`) and records when it LEFT each man (`Input.leftAt[pid]` = the new holding); every decision about a
request records its holding (`oild.pa` beside `oild.people`, written by `toggleOilPerson`, tidied with it, stripped with
a deleted man's decisions); `pruneHandedOverDecisions` drops a decision about a man the request has left since it was
made — the old write-side clear's rule (it voided the old holder's decisions), said on the request, so a hand-over
writes no day. A man on the row as an extra keeps his refusal when the request comes to him and loses it once it leaves
him (Fable F2 — with a stricter fix than Fable's, which would have revived it on extra → holder → away → back). An Undo
restores `hand` and `leftAt` with the person. **Not done: "dropped at that day's next save"** — kept inert, so an Undo
can bring it back (both reviewers agree). `dayDiscardCount`'s raw compare: a hand-over no longer changes the raw block,
so the case it could mislead on is gone; left.

### (b) An Unavailable filing's pending marks are worked out, never written — BUILT

As built (commit 4cff3bac): `markInputFiling` / `markInputDays` gone; Unpublish no longer re-opens `inp:` keys; the
filing axis (`filingDelta` against the issued `fil`) counts, lists and binds the sign-offs, as it already did.

### (d) A deleted man is taken off his days on read — BUILT

As built (commits 24536325, 79978d3c): `engine/overlay.ts overlayDeletedWeek` at every door of §2.1; the delete writes
his records only; the week on screen is overlaid after the command (§2.2); the change history keeps one line per seat he
held on the week on screen, as built (D337); a landed row goes with its request's CURRENT holder. The delete's refusals,
the version-load belt, the cutoff and `deletedRestoreProblem` are unchanged.

### (c) A request's row is worked out from the request when its day is read — v3 (a holder base)

*v2 = commit 0894227c. v3 answers round 2 (`…/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md`): the holder
base (Astra 1), the marks as a target state (Astra 2), `kept`'s exit (Astra 3, Fable F6), a version keeps its `srcv`
(Fable F1 — step 2 built, 3f847bdb), a finder that never lands and a landing on read at every door (Fable F2), marks only
(F3), the reflow (F4), the load's count (F5). Built on its own branch, `claude/db-readiness-p6c-holder-base` (D467).*

**1. Two row fields**, neither canonical (`restore.ts dayKeys` names neither, so neither moves a digest, a count or a
signature):
- `srcv` — a short hash of the six fields `acceptInput` writes from the request (`prog`, `str`, `end`, `who`, `rmks`,
  `srcType`). Set when a row is made (`acceptInput`, a landing) or re-made (rule 6 below). A whole-day replacement keeps
  the `srcv` its row carries (Fable F1).
- `kept` — set by a whole-day replacement (a version loaded, a plan switched in) on a row whose request is gone, is not
  an activity, is filed under Unavailable, or no longer covers the day (D363's letter: "every row that version had").

**2. The holder base — the loaded week only** (`state/holderbase.ts`). For each day of the loaded week, `BASE[di]` =
{ the day as its holder last committed it, that day's marks (the `pending` / `changes` / `added` keys naming it) }. The
week on screen — `DAYS` and those marks — is ALWAYS the view worked out from `BASE` (§3), never an overlay of an
already-overlaid day. So a removal the view makes is undone by giving the request back: the base still holds the row,
with its id, place, hand-set times and extras (Astra 1's scenario).
- **Set** at every week load and at boot, from the stored week (or the seed), before anything is worked out.
- **Moves** in the after-command pass (§5), for a day whose row the command wrote — its `days`, `sched.book` or
  `sched.mutes` record in the command's changes, exactly the days the row writer saves (`persist.ts scheduleRows`) — and
  for a day whose live content or marks differ from what the last pass left (a change made outside every command:
  tests, a legacy restore). Such a day's base becomes the live day, then — once the view is worked out — the VIEW of
  it: the holder saves the day overlay and all, and the row writer stores exactly that view, so `BASE[di]` is always the
  stored row.
- **Never moves** for a request's or a person's command, their Undo / Redo, or a refused command (the pass runs at
  phase 8, which a rolled-back command never reaches).
- **The week's copy in memory** (the stash written on the way out — `store.ts weekStashSnap`) is the base's days and
  marks with the live book's other fields, so a return to the week and every cross-week read of it start from what its
  holder committed, as a reload does.

**3. The view — one pure body, `engine/overlay.ts viewOfWeek`, over a copy.** Used by the loaded week's pass, `stashDays`
(a saved week), `weekctx.ts bundle()`'s seed branch and `ui/peek.ts`'s seed fallback (a week never saved — Fable F2 step
3), and the load's count (§7). In order: (i) reconcile the request rows, (ii) strip the deleted men (built, (d)), (iii)
land.
*Reconcile*, each ground row with `src`, its request found by id:
1. the request is gone → the row goes, unless `kept`;
2. the request no longer covers the day, is not an activity, or is filed under Unavailable (`'u'`) → the row goes, unless
   `kept`;
3. `kept`, and the request is again an activity covering the day and not `'u'` → `kept` is cleared in the view and the
   rules below apply (Astra 3, Fable F6); the stored row keeps `kept` until the holder next saves the day (§8);
4. the request is taken off (`'r'`) → the row stands as it is (`[REQ-ORPHAN-ROW]` 3 — Accept adopts it);
5. no `srcv` (a row from before this build — D56) → stamped with the request's fingerprint, not re-made;
6. `srcv` differs from the request's fingerprint → re-made in place: the six fields from the request, a new `srcv`; its
   id, its place and every other field kept (`more`, `flag`, `cx`, `info` — the relink kept only the first three); D271 —
   a new holder standing among `more` is blanked there (said, §5);
7. two or more rows for one request on the week → the first on a day the request covers stays, the rest go. A `kept`
   row on a day its request does not cover is a dead row (D363), not one of them.
*Land*: an activity request, not `'r'` / `'u'`, not read-only (`inputProtected`), with no row standing for it — on this
week's view, on the loaded week's `DAYS` (when the week read is another), or on any other saved week (`rowElsewhere`, the
finder §4; `'unreadable'` fails closed, as `acceptInput` does) — lands on its START day if that day is in the week read
(as `autoAcceptInput` does: never on a later day of its span). **On a published day, not when that day's current issued
version placed it on that day (its row is in the issued day) or took it off (`'r'` at issue)** — any other lands as a pending
change: one filed since (the 16 Sep 26 rule, after a reload too), and one the issued day held while its row stood on
another day it covers (re-dated onto this day since — round 3, Fable F2: keyed on the filing record alone, a request
shortened onto a published day it already covered fell off the programme). A request the issued day placed is put back
only by the holder's Accept, with its issued id (so loading an older version keeps that version's day, D98). The row:
`acceptInput`'s six fields, `srcv`, and the id `'r' + <request id>` — deterministic, so the same row right after and after
a reload — with a suffix while another row of the week holds that id (a dead `kept` row of the same request — round 3,
Fable F3); appended — the oldest request first (the FULL check's walk, W1: a request list read front to back landed a later
filing ABOVE earlier ones).

**4. The finder, and "the request's row"** (round 3, Astra 1 and Fable F1). A request's STANDING row is its row: a dead
`kept` row (on a day its request cannot stand on) is never it — one predicate, `engine/overlay.ts standsOn`, read by every
lookup that acts on "the request's row" on the week on screen (the OIL evidence, Accept's one-row guard, ✕, `acceptedDay`,
the load's leave-out, the card, the pending list, the checker's accepted-row deferral). On a saved week — `weekstash.ts
stashGroundBySrc` / `standingRowIn`, read by `rowElsewhere` (the landing's "stands elsewhere", `acceptInput`'s
guard, the card, the load's leave-out) and `oilev.ts stashStanding` — a saved week's STANDING rows: the parse with rules
1, 2, 4 and 7 applied (a `kept` row on a day its request does not cover ignored), no landing, no strip (a deleted man's
requests from his cutoff are gone, so rule 1 takes their rows), memoised on (the stored blob, the activity requests'
signature). It never lands, so a landing on read cannot recurse (Fable F2). `stashStanding` then reads `'unlanded'` where
a request's only row on a saved week is landed on read — money-neutral: `'active'` and `'unlanded'` both pay the man's own
answer (`ui/oilmode.ts`); `'cx'` / `'info'` / `'elsewhere'` come from standing rows, as now.

**5. The loaded week's pass** — `state/holderbase.ts`, one body, run at load (§8, nothing absorbed) and as the
after-command effect of every command that enlists the scheduler store (registered once per command in
`sched-commit.ts applyEnd`; the delete's own after-command overlay folds into it): absorb (§2) → work out the view →
install it (a day object replaced only where the view differs) → the marks → the requests' `acc` → the absorbed days'
base becomes their view → the messages → if anything changed, `resyncSchedBaseline()` and then `HOOKS.reflow()` (Fable F4).
- **The marks, per day** (Astra 2): the view equals the base's day, or differs from it only by the deleted strip → the
  base's marks, exactly; the request rows differ on a PUBLISHED day → rebuilt from the view against the day's current
  issued version (`drafts.ts rebaseDayPending`) — a target state, so A → B → A, an edit → Undo → Redo and a delete → Undo
  each come back to the base's marks exactly, with no hollow tag or tombstone left — and then a request's NEW row (its id
  not in the issued day) keeps only the add on its item, as its Accept marks it, plus any box the scheduler set apart from
  what the request makes (the FULL check's walk, W2: the rebuild marked every box and hung a hollow tag on the puck); on a day NOT published → the base's
  marks less any whose row is not in the view — a derived change there makes no mark (a never-published day's landings
  are its zero state, as at load; `discardableCount` is the only reader of those marks). Declined, as in round 2: a draft
  day's OG tag for a request's change (no line keys one today either).
- **`acc`**: `'r'` and `'u'` are a scheduler's decisions and stay; otherwise `'g'` when the request's row stands on the
  loaded week's view, else none — what every load already derives.
- **The messages** (after a command only, never at a load), raised after the caller's own line: a row that went this
  pass because its request was retyped to a type that never goes on the programme — "<type> does not go on the Ground
  Programme — its row has been removed"; D271's "<callsign> — already on this row as an extra · kept once, as its holder".
- No `logEdit` / `logAction` anywhere in the view or the pass (Fable F3); the request's own history line is its record.

**6. The commands** (§2.2). A filing (`commitNewInput`; the Inputs page's two adds), any edit of a request
(`commitInputEdit` — dates, times, words, type, person, the hand-over; every door that reaches it: the dialog, the Inputs
page, the in-place cells, the calendar drag, a reassign), a delete (`removeInput`, the clear-old-data sweep), and their
Undo / Redo change the REQUEST only. Removed: `commitInputEdit`'s relink (the unaccept / re-accept, the extras restore, its
D271 block and its three toasts), `dropInputRow`'s row removal, both "Load the week of … to edit / delete this accepted
input" refusals (`landedOnUnloadedWeek`), and the auto-landing in `commitNewInput` and `InputsPage`. Kept in
`commitInputEdit`, because they are the request's own filing: `'r'` cleared by a retype (as today); `'u'` cleared when the
new type is one never filed there (leave, medical, overseas duty — today's result on the loaded week, now the same off
it). **What stays inside a holder's command, and is saved:** Accept, → Ground, → Unavail, ✕, the board's Ground
"+ Inputs" (`acceptInput`, which now stamps `srcv`), every schedule edit, a whole-day replacement.

**7. A whole-day replacement** (`drafts.ts` load onto the working copy, plan switch): D175's leave-out; the deleted strip
by the request's current holder (built — F1 step 2); `kept` marked (§1); `srcv` kept as the version or plan carries it.
The load's confirm count (`dayDiscardCount`) compares against the day the load and the pass would leave — the version day
through the same leave-out, strip and `kept`, then `viewOfWeek` over the week with that day in place (Fable F5). Not
simulated there: the filing the load puts back (D98) — its only effect on the count is a request it takes off or files
under Unavailable, which then does not land.

**8. The week load and the boot** (`store.ts applyWeekModel`, `initStore`): the base is set from the stored week, every
`acc` but `'r'` / `'u'` cleared, and the pass run — out of band, then `resyncSchedBaseline()`. **In that order, AFTER the row
ids are minted** (`migrateLegacyIds` / `ensureRowIds` / `backfillSnapshotIds` — round 3, Fable F6): a base taken before them
would hold id-less rows, and the next command's apply-end would mint them inside that command — a day change in whoever's
command came next, refused if a member's (§9). The load also mints the requests' and the planning notes' places itself
(the retired command's apply-end did). The `sched.load` command goes:
it existed to latch the landing's repaint (`markEdit` → `notify` mid-pass), and the pass paints nothing. A read-only
(byte-preserved) week is shown as it is saved, as for (d): no pass.

**9. §11.** A member's command changes no schedule record — `perms.ts ownershipViolation`'s exception (the schedule, the
week stash) goes for members: any `days` / `sched.*` / `weekstash` change in a member's envelope is refused. The ownership
test pins it.

**Stated limits** (for the red team to attack, and on his look card where they show):
- `kept` lives on the stored row. While its request is back, the view treats the row as the request's (rule 3); if the
  request goes again before the holder has saved that day, the row is protected again. Once the holder saves the day with
  the request back, `kept` is gone for good.
- A holder's save of a day while a derived removal shows bakes the removal in (§2): an Undo of the request's delete after
  that lands a new row on a day not published; on a published day the issued version saw the request, so it is not landed
  (the day reads it pending, and Accept puts it back — the issued row's id with it). Right after and after a reload agree.

**The rulings it must keep, each a test:** D114, D174, D176, D175, D177 / D178, D363 (after a RELOAD too), D271, D18, D98,
D91, the 16 Sep 26 live-filing rule (after a reload too), D170 / D172 (no OG tag appears for a request's change — as
today).

**Tests first** (`state/p6c-requestonread.test.ts`, un-skipped, plus v3's): the twelve drafted cases; and — each checked
right after AND after a reload — a scheduler-placed row with hand-set times and extras, the request deleted → Undo → the
exact row back (id, place, times, extras) on a day not published and on a published one, Redo removes it, no day row
written either way (Astra 1); A → B → A and edit → Undo → Redo on a published day with no hollow tag left, delete → Undo
with no tombstone (Astra 2); delete → load the old version (`kept`) → Undo → edit the request: the row follows the edit
(Astra 3); `kept` on Monday, the request re-dated to Wednesday: it lands on Wednesday and Monday's dead row stays (Fable
F6); the version load after a hand-over re-makes the row for the new holder, before and after a reload (Fable F1); the
peek of a week where the request's row stands on another saved week shows none, a request whose start week is never saved
lands in the peek and on its load alike, an unreadable saved week it covers → no landing (Fable F2); a re-make and a
landing write no change-history line (F3); `WARN` reads the landed row's clash straight after `commitNewInput` (F4); the
load's confirm count after a hand-over (F5); the retype message; a member's command carrying a schedule record is refused.

## 4. Documents fixed in the same change (D201)

`data-model.md`: §9 rule 9 (the three bullets as built — the assignment stamp; the delete's overlay; the landing's
`srcv` / `kept`; "dropped at the next save" corrected); §3 ScheduleWeek (the note on a member's own landing — gone) and
ScheduleDay (the snapshot's landed rows carry `srcv` / `kept`; `ScheduleInputPlacement.sourceInputVersion` is `srcv`);
§3 Input (`hand`); §11 (the exception removed); §12 q9 (unchanged: reports and the overlay). `data-schema.md` (the new
fields). `engine-rules.md` (the delete and the landing worked out on read). `feature-impact.md` Flow E. `undo-contract.md`
(a derived change is made after its command, never saved). `file-map.md` (`engine/overlay.ts`). The parent plan's §9 build
log. `OUTSTANDING.md`: `[OIL-RELINK-XWEEK]` closed by script; `[DB-READINESS]`'s state; anything filed on the way.

## 5. Checks (FULL — `raptor-port/docs/bug-check-order.md`)

Per step: red tests first; the step's own suites; the whole unit suite; `tfin.js` 728/0; a short host walk of what the
step changed (a real browser on `vite preview`, reload after each act, the stored rows compared before and after).
Then, over the whole phase: the full gate set under the PC lock (unit, build, tfin, e2e, smoke, perf, rulecheck,
docsize); Astra designs the scenarios (one reviewer, D353); the roll-call — every writer of a day row, and every place
the app reads a week's days into memory (the overlay's three doors), each with has-it / must-not-because / MISSING; the
walk on a frozen build; then BOTH reviewers read the code, blind, with the evidence sheet; fixes red first; the re-walk;
the evidence sheet with pictures; then his look. **Excluded from every brief (D56):** a problem living only in data
already stored, when the code is correct going forward.

## 6. Risks, said plainly

- **(c) touches the rules of the published record** (D114, D174–D178, D363). Each is a named test above; the walk
  seeds each case on a published day.
- **Consistency between "right after" and "after a reload."** The whole design rests on the in-memory change and the
  overlay agreeing. Every test above checks both.
- **Two copies of one rule** — the relink (`commitInputEdit`) and the overlay's rule 4 re-make a row the same way. They
  share one body (`remakeLandedRow`), or they drift.
- **The load-time landing on a published day** is new behaviour at load; it is limited to requests the issued version
  never saw, which is exactly what a live filing already does.
- **Time.** (a) and (b): short. (d): medium. (c): the largest. Then the FULL check.

## 7. Not in phase 6

The 30-second check that applies the overlay to a day already on screen (group B — the stand-in has no other writer, so
a reload is its check); the reportable projection, if IT's answer to q9 needs one; the lock's own screens.

## 8. What he will see change

Nothing on screen, by design — every change is in where things are saved and when they are worked out — except:
1. a request filed on a published day by someone else (in the database, another device; here, a reload) shows on that
   day's working copy as pending when the day is next read, as it already does for the person who filed it (§3 (c));
2. editing or deleting a request whose row sits on a week not on screen is no longer refused with "Load the week of …
   to edit this accepted input" — it goes ahead, and that week shows the change when it is opened (§3 (c)).

**Found by the FULL check of (a), (b), (d)** (30 Sep 26 — the walk run on this build and on the build before phase 6, the
screen compared step by step; `docs/handpass/2026-09-30-dbr-phase6-check.md` F1, F2):
3. **(b), (d) — the Amendments panel on Edit Schedule no longer counts the marks a filing under Unavailable, or a delete, used
   to leave on days never published.** Before: after → Unavail on a never-published day it read "Changes are on unpublished
   days — publish the day first" and offered "Clear the marks on days not yet published (2)", which cleared the two marks and
   left the filing exactly as it was; now "No pending changes", the button greyed. Every day head, pending list and sign-off
   is unchanged.
4. **(d) — a delete now also takes the man off a week nobody has saved yet.** Before phase 6 a delete rewrote only the weeks
   already saved, so a week still showing its seed (week 2, untouched) kept the deleted man on every day he was seeded; now
   every week reads without him from his cutoff. A defect of the build before, closed.

**Step (c) v3 — the changes he will see** (1 Oct 26; on his look card):
5. **On a day not yet published, a member's filing, edit or delete no longer leaves marks** that the Amendments panel's
   "Clear the marks on days not yet published (N)" counts (as item 3 for (b) and (d)).
6. **A request on a week nobody has opened shows on that week's next-week preview, and counts in the cross-week checks,**
   as it would if that week were open (it lands on read at every door).
7. **Editing a request so it moves to another week** no longer says "Moved outside the programmed week — it is no longer
   accepted": it goes on that week's programme when that week is read.
8. **A member's edit re-makes the row keeping everything the scheduler set on it** — "information only" too, where the old
   re-make kept only the extra crew, the flag and CX.
9. **Loading a version onto the working copy (or switching in a plan) keeps a request filed on that day since it was
   published ON the programme, pending** — it used to leave it waiting under Personal Inputs; the count is the same (one
   pending either way, D178 / AM1: a load never takes back a member's own filing).
10. **An Undo of a request's delete puts its row back exactly** — same place, hand-set times and extras — where it used to
   come back as a new row at the end (a defect of v2's design, Astra round 2).
11. **✕ on a request's row on a day not yet published leaves a removal mark** the Amendments panel's "Clear the marks … (N)"
   counts — as the removal of any row there does (a member's live filing used to cancel it with its own add mark; under (c)
   the landing makes no mark — round 3, Fable F4.1).
12. **A request "taken off" and then retyped to another activity goes on the programme at once**, where it used to wait under
   Personal Inputs until the next week load (Fable F4.2).
13. **Loading a week no longer runs a command of its own** — nothing a person sees; the change history and the Undo list
   never showed it.

**Found by the FULL check of (c)** (1 Oct 26 — `docs/handpass/2026-10-01-dbr-phase6c-check.md` W3, W4):
14. **A request moved to another day leaves the scheduler's own additions (a second man, a red box, CX) with the day they
   were made on** — they come back if the request returns there; the old re-link carried them to the new day. Under the day
   lock a member's move cannot write the new day, and a carry worked out from the old day's row would last only until that
   day's holder next saved it. Put to him on his look card; `[REQ-MOVE-EXTRAS]` holds his answer.
15. **The pending mark of an issued request's changed time sits on the time box, not on the item's name** — the mark sits on
   what changed (D93); the count is the same (one pending). The old re-link re-made the row, which marked its item.
*(An item 16 — the pending list naming the member as the one who deleted his issued request — was listed during the check
and withdrawn the same night: Fable's final-read F2 fix, the baseline always following the pass, brought the list back to
naming as before.)*

## 9. Build log

**(a) — built 30 Sep 26** (commits e6ebf963, then f1bd1cf6 for Fable F2): `Input.hand`, `Input.leftAt`, `oild.pa`;
`clearOilPersonDecisions` and the week-stash enlistment gone; red first (`state/p6a-oilstamp.test.ts`, 3 of 6 red, then
the F2 case red); the pinned `oilconfirm` tests read the evidence; broken on purpose → red. Unit 7335/7335, tfin 728/0.
**(b) — built 30 Sep 26** (commit 4cff3bac): the filing marks gone; red first (`state/p6b-filingmarks.test.ts`, 5 of 6
red); four tests moved to the filing axis; broken on purpose → red. Engine 1735/1735, tfin 728/0.
**(d) — built 30 Sep 26** (commits 24536325, 79978d3c): `engine/overlay.ts` (new — the strip moved from
`state/person-delete.ts`) at every door of §2.1; the delete's week on screen overlaid after the command; red first
(`state/p6d-deleteonread.test.ts`, `engine/overlay.test.ts`); two pinned tests moved to the read-side requirement; each
door broken on purpose → red. **Found on the way:** the Leave War's posting command (`lw.postout`) carried the posting
pass's day changes (a nested command joins its outer envelope) — why v1's type list could not have held (§2.2).
Engine, state, Leave War and undo 4648/4648, tfin 728/0.
**The FULL check of (a), (b), (d) — done 30 Sep 26 (D467)** (the evidence sheet `docs/handpass/2026-09-30-dbr-phase6-check.md`):
Astra's scenarios; the roll-call (no missing door); five walks, each on this build AND the build before phase 6, the screen
compared fact by fact, and three at phone width; thirteen break tests (four wires had no test — tests written); the gates and
perf; both final reads (Astra: no findings; Fable: two low — F1, a delete on a read-only week ON SCREEN, fixed red first; F2,
the overlay's cost growing with the deleted roster, filed for group B). Two visible changes the §8 list lacked, now items 3
and 4. The orphaned week writers `stashEditDays` / `stashEditWeek` removed.
**(c)** — round 2 on v2: Fable REVISE (F1–F6), Astra BLOCK (1–3); dispositions `…/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md` — v3 needs a HOLDER BASE (the week on screen always the overlay applied to the day as its holder last committed it), so a derived removal is reversible by an Undo. Fable F1 step 2 built (commit 3f847bdb). His call where v3 is built. Red tests for (c) drafted (`state/p6c-requestonread.test.ts`, uncommitted — 9 of 12 red on today's code).
**(c) v3 — written 1 Oct 26** on its own branch, `claude/db-readiness-p6c-holder-base` (D467), §3 (c) above; round 3 (the last
of his cap) next, both reviewers blind.
**(c) v3 — round 3 and the build, 1 Oct 26:** Astra REVISE (1 — the OIL evidence could read a dead kept row), Fable REVISE (F1–F6);
all folded into the build — dispositions `…/briefs/2026-10-01-db-readiness-phase6c-dispositions-r3.md`. Built: `state/holderbase.ts`
(new — the base and the pass), `engine/overlay.ts` (the view: `viewOfWeek`, `requestRowFields`, `srcvOf`, `standsOn`),
`weekstash.ts` (the standing finder; a saved week worked out on read), `weekctx.ts` / `peek.ts` (a never-saved week too),
`sched-commit.ts` (the after-command pass; `sched.load` retired), `store.ts` (the load and the boot; the stash is the base),
`inputedit.tsx` / `InputsPage.tsx` (the request commands write the request only; the refusals gone), `drafts.ts` (`kept`,
the load's count), `perms.ts` (§11), `changelines.ts`, `board.ts`, `daytpl.ts`, `oilev.ts`, `slots.ts`, `publish.ts`,
`events.ts`, `interactions.ts`, `pendlist.ts`. Red first: `state/p6c-requestonread.test.ts` (30 cases, 9 of the 12 v2 ones and
every v3 and round-3 one red on the code before; each round-3 fix broken on purpose → its test red). The unit suite's 67 old
failures read one by one against the plan: tests of the removed relink and refusals rewritten to the new rule, set-ups that
planted an unplaced request (no longer a state) moved to the app's own route (✕, then Accept or → Unavail), and six real
defects of the first build found and fixed (the dispositions' last paragraph).

**(c) v3 — its FULL check, 1 Oct 26** (`docs/handpass/2026-10-01-dbr-phase6c-check.md`): Astra's scenarios; eight walks on
this build and the build before (c), one at phone width; the gates and perf; both final reads (Astra REVISE 1–4, Fable REVISE
F1–F2, F3 low). Found and fixed, each red first: the landing order (W1), a request's new row's marks on a published day (W2),
five places a DEAD `kept` row was taken for the request's row — the load's filing (twice: another day's dead row, and the
version's own row issued dead), the changes-window jump, the retype message, the OIL evidence (money), a dead issued row read
as the request's placement, the marks of a dead row cleared by another request's change — the load's confirm count, a
landing's id colliding with a stored dead row (Fable F1), and the baseline after a delete's book change (Fable F2). The one
rule since: **a row that carries `kept` is never the request's row** — on screen (the view clears the mark from a row that
can stand) and in an issued version (kept as it went out). §8 items 14–15 added; `[REQ-MOVE-EXTRAS]` put to him.