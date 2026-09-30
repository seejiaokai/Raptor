# [DB-READINESS] group A, phase 6 — what a day shows, worked out on read (plan v2, 30 Sep 26 — after round 1)

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

### (c) A request's row is worked out from the request when its day is read — v2

**The model.** The stored day keeps its landed rows (the scheduler's placement — where it sits, its extras, its hand-set
times and words), plus two row fields that are not canonical content (`restore.ts dayKeys` names every field it
compares; neither is there, so neither moves a digest, a count or a signature):
- `srcv` — a short fingerprint of what the row was last made or re-made from: the request's type label, times, all-day,
  person and remarks, as `acceptInput` writes them. Set whenever a row is made or re-made, and by a holder's whole-day
  replacement (below).
- `kept` — a row a holder brought back with a version or a plan although its request is gone or no longer covers the day
  (D363's letter: "every row that version had"). The overlay leaves a `kept` row alone, except the deleted-man strip.

**The reconciliation** (one body, `engine/overlay.ts reconcileRequestRows`), for each ground row with `src` on a working
day of the week it is handed:
1. its request is gone → the row goes, unless `kept`;
2. its request no longer covers the day, is no longer an activity type, or is filed under Unavailable (`acc 'u'`) → the
   row goes, unless `kept`;
3. its request is taken off (`acc 'r'`) → the row stands as it is (`[REQ-ORPHAN-ROW]` 3 — Accept adopts it);
4. the request's fingerprint differs from `srcv` → the row is re-made from the request, keeping its id, its place and the
   scheduler's extras (`more`, `flag`, `cx`), with D271 (a man who is now the holder is not also an extra) — one body,
   `remakeLandedRow`;
5. no `srcv` (old data) → stamped with the current fingerprint, not re-made;
6. a second row for the same request in the week → the one on a day the request covers stays, the others go (D175's one
   row, as a belt).
**Then the strip (d), then the landing:** on the loaded week, the app's own landing pass (`relandInputs` / the seed pass)
with one change — on a PUBLISHED day it now also lands a request the day's current issued version never saw (no entry in
its `fil`), as a request filed live on a published day already lands (16 Sep 26 — a pending amendment on the working
copy, the issued face frozen) — this is what makes a filing made elsewhere read pending after a reload. On a saved week
read through `stashDays`, the same landing without touching any request (`acc` is the loaded week's): a request lands on
its start day in that week unless it is taken off, filed under Unavailable, or already has a row there or on the loaded
week; a published day uses that week's own issuance context.
**Marks** (Fable F3), on the loaded week only (a saved week read through `stashDays` has no marks): a re-made row marks
each cell it changed (`markEdit`, rid-anchored), a removed row its deletion (`markDeletion` with `deletionWasIssued`),
on any day — live and at load alike, so the same marks stand before and after a reload; a landing marks as today
(`acceptInput`), and at load only on a published day (a never-published day's landings are its zero state).

**The commands** (§2.2): a member's filing, any edit of a request (dates, times, words, type, person — the hand-over
included), a delete, and their Undo / Redo change the REQUEST only; `commitNewInput` (its auto-landing), `commitInputEdit`
(its unaccept / re-accept relink and extras restore) and `removeInput` (its row drop) no longer touch a day — the loaded
week is reconciled after the command, by the same body every other read uses. The messages the relink gave (a retype to
a leave: "… does not go on the Ground Programme — its row has been removed"; a move off the loaded week) are said from the
reconciliation's before / after. **What stays inside a command, and is saved:** a scheduler's explicit placements —
Accept, → Ground, → Unavail, ✕ (take off), the board's Ground "+ Inputs" placing a new request on that day (Astra 3) —
and every other schedule edit, as today.

**A whole-day replacement** (a version loaded, a plan switched in — `drafts.ts liveDay`): D175's leave-out first (a row
whose request now stands on another day is left out and named, as today); then every request row it brings is the
holder's choice — one whose request is gone or no longer covers the day is marked `kept` (D363's letter), any other is
stamped with its request's current fingerprint (not re-made); then the deleted-man strip. `dayDiscardCount` needs no
change (it already measures the day as the load leaves it).

**What goes with it:** the §11 exception (a member's request writing `ScheduleWeek` / `ScheduleDay`) — a member's actions
write no day row, pinned by the ownership test; the refusal "Load the week of … to edit / delete this accepted input"
(`inputedit.tsx landedOnUnloadedWeek`) — the edit goes ahead and the other week's row is put right when that week is
read; `[OIL-RELINK-XWEEK]` — closed (a stashed week's row can no longer keep the old man or land twice). The "no second
row on another week" guard (`rowElsewhere`) reads the overlaid saved weeks, so a request moved between weeks is not
refused by its own stale row.

**The rulings it must keep, each a test:** D114, D174, D176, D175, D177 / D178, D363 (after a RELOAD too), D271, D18, the
16 Sep 26 live-filing rule (after a reload too), D170 / D172 (the OG tag on an unpublished day's changed row, before and
after a reload).

**Tests first** (the reviewers' and mine): a member files an activity request on the week on screen — his request's row
is written, NO day row, the screen shows it at once, a reload shows the same; the same on a PUBLISHED day — "1 pending"
and the same mark on the row before and after a reload; he edits its remarks — the second client (the stand-in reader)
reads the new remarks, the day row untouched; the scheduler had re-timed the row, then the member edits only the remarks —
the row is re-made (today's relink rule), its id and place kept; he deletes it — gone after a reload, "deleted" pending on
a published day; the board's Ground "+ Inputs" — the request AND the day row saved (Astra 3); Accept / ✕ — the day row
saved with the filing; D363 after a reload (`kept`); D175 on a load and a plan switch; the hand-over of a request whose
row is on a saved week not on screen (the old `[OIL-RELINK-XWEEK]` cases: the new man drawn there, never two rows); a
request moved from week B to week A lands in A with B's stale row stored; A's request handed to B then A deleted, on the
week on screen and on a saved week (Astra 2); the next-week peek after a request change (Astra 1); the Undo and Redo of a
request edit — the week on screen re-derived, no day row written; every member action writes only rows his role may
write (§11, the exception gone).

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
