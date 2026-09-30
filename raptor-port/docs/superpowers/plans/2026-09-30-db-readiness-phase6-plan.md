# [DB-READINESS] group A, phase 6 — what a day shows, worked out on read (plan v1, 30 Sep 26)

**Branch:** `claude/db-readiness-table-shaping-4094f6` (group A's; phases 0–5b built and FULL-checked there).
**The parent plan:** `2026-09-30-db-readiness-group-a-plan.md` §3 phase 6 and §9 (this file is phase 6's detail; the parent
plan's §2 decisions bind it). **The design of record:** `raptor-port/docs/data-model.md` §9 rule 9 (and §3 ScheduleWeek,
§11). **Tier:** FULL (saved data, the published record, OIL — earned leave, D25 — and who may write a day, §11).
**Reviews:** the red team BOTH (D353 — an important plan), one round; then the build; then the FULL check (Astra's
scenarios, the roll-call, the walk, both final code reads). **Rulings range:** D465–D469. **Observations:** #392 on.
**PROVISIONAL until IT confirms in writing** (the parent plan's head): "no plug-in" makes working-out-on-read the only
way; whether REPORTS can reproduce it is IT's (§12 q9) — the final hand-over of the `ScheduleDay` / `Input` shape waits
on that answer, and nothing here waits on it — **his ruling D465 (30 Sep 26, "Carry on"): phase 6 is built now, (c)
included, without waiting for IT's written answers.**

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

## 2. The decisions (technical — mine; stated for the reviewers)

1. **One read-time overlay, applied where a week's days enter memory** — `state/overlay.ts` (new), pure over a week's
   days + its dates, used at: `applyWeekModel` (the loaded week, from its saved copy or from the seed — BEFORE the
   command layer's baseline is taken, so the overlay is not a change of anyone's); `weekctx.ts bundle()` (the cross-week
   reads — crew rest, the 7-day run; the WORKING world only: the official world reads issued versions, which keep
   everything they were issued with); `drafts.ts liveDay` (a saved plan switched in, an issued version loaded onto the
   working copy). It holds (d)'s strip and (c)'s reconciliation; (a) needs none (its prune is already on the one read
   door).
2. **Derived day changes are made in memory, inside their command, and NOT SAVED.** A command whose job is a request or
   a person (§3) still changes the loaded week in memory exactly as today, inside the same command — so the screen
   updates at once, the undo machinery sees the same records it sees today, and a later Undo of an earlier step on that
   day compares against what is really there — but the schedule composer (`state/persist.ts scheduleRows`) writes NO
   day row, week row or off-screen week row for it. The day is saved, overlay and all, by the next command that changes
   it — the rule `sched.load` already follows (F2). The commands this covers are named in one list
   (`state/persist.ts DERIVED_DAY_TYPES`): `inputs.batch`, `inputs.write`, `person.delete`, `lw.postoutRun` — and an
   Undo or Redo of a step of one of them (`undo.restore` whose reversed step's type is in the list; the timeline hands
   that type to the envelope — `CommitEnvelope.restores`, new, optional).
3. **Why not by actor** (a member's commands only): the design's rule is by what the command IS — "nothing but the
   holder writes a day; everything else that changes what a day shows is worked out on read" (§9 rule 9). An admin
   handing a request over on the Inputs page does not hold its day either (D450). And a rule by command type is one line
   the reviewers can check against the list of commands.
4. **The order: (a) → (b) → (d) → (c)**, each its own step with red tests first, its own suites, the whole engine suite
   and `tfin.js` 728/0 before the next; the parent plan listed (c) before (d) — (d) goes first because it introduces the
   overlay module and the derived-change rule on the narrower case, and (c) then reuses both.
5. **Nothing stored is converted.** Every change reads old stored rows correctly (a missing new field reads as "made
   under the current state"); the stored world is demo data, cleared before the database (D54, D56); the format stays 6.

## 3. The steps

### (a) An OIL decision made for one holding of a request ignores itself when the request is handed on

- **The stamp.** `Input.hand` (new, a count, absent = 0): +1 at every change of the request's person
  (`commitInputEdit`, the one place `r.person` is written — every door reaches it: the Inputs page, the edit dialog,
  `reassignInput` from the Unavailable row and the drag, the medical-move confirm). An Undo restores it with the person,
  because it is a field of the same record.
- **The decision records it.** `day.oild.pa` (new, beside `people`): `"<pid>|i:<iid>" → hand` — written by
  `toggleOilPerson` whenever it writes `people[key]` for an `i:` item, removed with it by `tidy`. Only `i:` items (a
  hand-built row, `r:<rid>`, has no holder to change).
- **Read.** `pruneHandedOverDecisions` gains one rule: a decision about the request's CURRENT holder whose recorded
  holding is not the current one is ignored (a decision with no `pa` entry reads as made under the current holding — the
  old stored data). Extras on the row (D18) and placeholders keep today's rule.
- **Gone:** `clearOilPersonDecisions` and its call; the week stash no longer joins a person-change batch
  (`inputedit.tsx` "THE WEEKSTASH JOINS THE BATCH WHEN THE HOLDER MOVES").
- **Not done: "dropped at that day's next save"** (the design's line). A stale decision is inert on read forever; dropping
  it at a save would LOSE a refusal in one order: A→B, then the day is saved by its holder, then the hand-over is undone
  — A holds the request again, and the refusal the scheduler made about him is gone, so he silently earns OIL on a day
  he was refused. Kept inert, the Undo brings it back. `data-model.md` §9 rule 9 is corrected to say so (D201).
- **Found on the way (the sweep):** `dayDiscardCount` compares the RAW decision block (`publish.ts` ~:688) where the
  pending count reads the pruned one — a stale key could read "Discard 1 edit" beside "0 pending". Compared pruned, with
  a red test, if it reproduces; filed if it does not.
- **Tests first:** A→B→A with the refusal on a day of a week NOT loaded (the pinned case, now with no write to that week
  — its stored row byte-identical); A→B→A on the loaded day; the Undo of the hand-over brings the refusal back (the
  pinned "ONE undo" test, now with no weekstash in the step); a hand-over writes no week row at all (the request's row
  only); an extra's decision (D18) survives a hand-over; the stamp survives a reload. The pinned test "handing a request
  away CLEARS the old holder's decision on every loaded day" changes to "… makes it inert, and writes no day" — the
  requirement it pinned (the old holder's refusal does not follow the request) is unchanged.

### (b) An Unavailable filing's pending marks are worked out, never written

- `markInputFiling` and its three callers go (`slots.ts` — `markInputDays`); Unpublish no longer re-opens `inp:` keys; an
  `inp:` key already in a stored book is ignored by every reader (old data; nothing new writes one).
- The published day is unchanged (its count, list and sign-offs already come from the filing axis). A NEVER-published
  day: "Discard marks" no longer counts a filing — there was never a mark on screen for it (D118: an unpublished day shows
  no count) and discarding a mark never undid the filing itself.
- **Tests first:** filing under Unavailable on a published day → "1 pending", the sign-offs fall, the pending list names
  it, and the day's stored book gains no `inp:` key; its undo → 0; the same on a never-published day → no mark, Discard
  offers nothing for it; Publish AL then Unpublish → the filing reads pending again from the axis. The tests that pin the
  mark itself (`engine/accept`, `engine/drafts`, `engine/daytpl`, `engine/rowids`, `ui/unavailedit`,
  `ui/audit-e-commit-relink`) move to the axis — each change names its reason.

### (d) A deleted man is taken off his days on read

- **The overlay's delete half:** for every person with `deleted` and `deletedFrom`, on every WORKING day dated on or
  after `deletedFrom`: `stripPersonFromDay` (every seat kind, extras, programme names, ground holders, his OIL switches)
  plus the day's working sign-offs naming him and his places in the day's saved plans (`sg`/`sb`/`dr` — the same fields
  the delete clears today, `person-delete.ts` §3b), and the ground rows landed from his requests. Days before the cutoff
  keep him (D297); issued versions keep him (D299 — the published record); loading an issued version onto the working
  copy still strips him (`HOOKS.stripDeleted`, unchanged).
- **The delete itself** (`applyDelete`, both doors — Admin → Users and the posting pass): the person, his requests
  (future ones gone, a spanning one ended), his account, the planning calendar and the Leave War — as today. The loaded
  week: EXACTLY today's strip, through the edit funnel (the screen, its change-history lines and the undo records as
  today — D337 "everything the delete took away, one line each" untouched), and NOT saved (§2.2). Saved weeks: NOT
  rewritten — the `stashEditWeek` pass goes; each is stripped, silently, when it is read (as today: they never had
  lines).
- **Kept as is:** the delete's refusals (the last admin; an unreadable or preserved saved week holding him on a day to
  come — a read-only week is shown as saved, so the refusal still protects what it protected); `deletedRestoreProblem`;
  the cutoff (`max(date, today)`, D304). `Person.deletedFrom` joins the declared type (`schema.ts`).
- **Tests first:** after a delete, the stored row of a saved week to come is BYTE-IDENTICAL, and loading that week shows
  him on no day from the cutoff and on every day before it; a published day to come reads pending with its sign-offs
  fallen, its issued version byte-identical; the loaded week's rows are not written by the delete, and the next edit of a
  day there writes it without him; a reload after the delete shows the same as before it; crew rest across a week
  boundary reads the stripped neighbour; a saved plan switched in on a day to come is stripped; the posting pass at boot
  writes no week row. The two pinned tests "a stashed week to come is rewritten" and "the saved row no longer holds him"
  (`state/person-delete.test.ts`, `leavewar/postout-outcomes.test.ts`) change to the read-side assertions above.

### (c) A request's row is worked out from the request when its day is read

**The model.** The stored day keeps its landed rows (the scheduler's placement — where, its extras, its hand-set times
and words), plus two new row fields:
- `srcv` — a short fingerprint of what the row was last MADE from: the request's type, times, all-day, person and
  remarks as `acceptInput` writes them. Set by `acceptInput` (every landing and every relink goes through it) and by a
  holder's whole-day replacement (a plan switched in, a version loaded — the holder is choosing that content).
- `kept` — set on a row whose request no longer exists when a holder's whole-day replacement brings it back (D363: "a
  deleted request's row included").
Neither is canonical content (`restore.ts dayKeys` names the fields it compares; neither is among them), so neither
changes a digest, a count or a signature.

**The overlay's request half** (at every read — §2.1), for each ground row with `src` on a working day:
1. its request is gone → the row goes, unless `kept`;
2. its request no longer covers the day, or is no longer an activity type → the row goes (the request lands on its own
   day by the landing pass, if that day is loaded);
3. its request is "taken off" (`acc 'r'`) → left as it stands (today's rule: a row brought back by a plan while its
   request was taken off stays, and Accept adopts it — `[REQ-ORPHAN-ROW]` 3);
4. the request's fingerprint differs from `srcv` → the row is re-made from the request, keeping its id, its place and
   the scheduler's extras (`more`, `flag`, `cx`) — exactly what today's relink keeps (`commitInputEdit`), including
   D271 (a man who is now the holder is not also an extra);
5. no `srcv` (old data) → stamped with the current fingerprint, not re-made.
Then the landing pass as today — with ONE change: on a PUBLISHED day it lands a request the day's current issued
version never saw (no entry in its `fil`), as a request filed live on a published day already lands (16 Sep 26 — a
pending amendment on the working copy, the issued face frozen), wearing the same pending mark. A request the issued
version saw unlanded, or taken off, is left as it is.

**The commands** (§2.2): filing, changing, deleting and handing over a request (`inputs.batch` / `inputs.write`, and
their Undo / Redo) save the request's row only. The screen of the person who did it updates at once as today; every
other screen — and his own after a reload — gets the same result from the overlay.

**What goes with it:** the §11 exception (a member's request writing `ScheduleWeek` / `ScheduleDay`) — a member's
actions write no day row, pinned by the ownership test; `[OIL-RELINK-XWEEK]` — a stashed week's row can no longer keep
the old man or land twice, because every read re-makes it from the request (the item closes); the refusal "Load the
week of … to edit this accepted input" (`inputedit.tsx landedOnUnloadedWeek`) — the edit goes ahead, the other week's
row is put right when that week is read; `rowElsewhere` (the "no second row on another week" guard) skips a stashed
row the overlay would remove (its request no longer covers that day), so a request moved between weeks is not refused
by its own stale row.

**The rulings it must keep, each a test:** D114 (taking an accepted request off a published day is ONE pending change),
D174 and D176 (a request filed since publication and taken off, or taken off at publication and since deleted — 0
pending), D175 (a load or a plan switch never puts a request on a second day), D177 / D178 (a member's filing, edit,
delete or move after publication is pending, the issued face frozen), D363 (loading an older version puts back a deleted
request's row, and the pending list names it — after a RELOAD too), D271, D18 (a second man on a member's row earns),
16 Sep 26 (a request filed live on a published day lands on the working copy as pending — after a reload too).

**Tests first:** a member files an activity request on a week that is loaded — the day's stored row is unchanged, the
request's row is written, the screen shows it at once; reload → the same; the same on a PUBLISHED day → "1 pending" before
and after a reload, the same mark on the row; he edits its remarks → the scheduler's view (a second client reading the
store) shows the new remarks; the scheduler had re-timed the row by hand, then the member edits only the remarks → the
row is re-made (today's relink rule, kept); he deletes it → gone on the other client, "deleted" pending on a published
day; D363 after a reload; the hand-over on a stashed week's request (the old `[OIL-RELINK-XWEEK]` cases: the new man
drawn, never two rows); a request moved from week B to week A is landed in A even with B's stale row stored; every
member action writes only rows his role may write (§11 test, the exception gone).

## 4. Documents fixed in the same change (D201)

`data-model.md`: §9 rule 9 (the three bullets as built — the assignment stamp; the delete's overlay; the landing's
`srcv` / `kept`; "dropped at the next save" corrected); §3 ScheduleWeek (the note on a member's own landing — gone) and
ScheduleDay (the snapshot's landed rows carry `srcv` / `kept`; `ScheduleInputPlacement.sourceInputVersion` is `srcv`);
§3 Input (`hand`); §11 (the exception removed); §12 q9 (unchanged: reports and the overlay). `data-schema.md` (the new
fields). `engine-rules.md` (the delete and the landing worked out on read). `feature-impact.md` Flow E. `undo-contract.md`
(derived changes are in the undo records but not saved). `file-map.md` (`state/overlay.ts`). The parent plan's §9 build
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

Nothing on screen, by design — every change is in where things are saved and when they are worked out. The one new
behaviour a person could notice: a request filed on a published day by someone else (in the database, another device;
here, a reload) now shows on that day's working copy as pending when the day is next read, as it already does in the
browser of the person who filed it (§3 (c), the landing pass).

## 9. Build log

*(filled as each step lands)*
