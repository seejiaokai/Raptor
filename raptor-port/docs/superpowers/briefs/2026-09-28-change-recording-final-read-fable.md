# Final code read — the change-recording build (Fable 5.1, 29 Sep 26)

Branch `claude/change-recording-retest`, read against `origin/main` (already merged in). Read blind to Astra's report.
Inputs read whole: the brief; the plan (§11–§13 taken over §3–§6); the evidence sheet; the full rows of D148, D347, D348,
D349, D350, D352, D286, D287, D292, D322, D56. Code read: every file the brief names, plus the seams they lean on that
the diff did not touch — `perms.ts` (the command gate and its per-record scan), `people-settings-commit.ts` (both stores'
`write()`), `accounts.ts` (the write path's guards, the bell's seen, the welcome note), `person-delete.ts`, `view.ts`
(`setPage` closes the board), `derive.ts` (owners, `weekOf`), the Leave War store's `gesture` / `persistNotify` /
`createWar` / `ackReplacement`, `WelcomeBack.tsx`, `reports.ts`, `AdminPage.tsx`'s data buttons. Tests read:
`timeline-cr.test.ts`, `roster-restore.test.ts`, `undo-wire.test.ts`, `person-delete.test.ts`, `changelines.test.ts`,
`stage-undo.test.ts`, `scenarios-corners.test.ts`, `timeline.test.ts`, `quals.test.tsx`; the walk scripts `cr-c-steps`,
`cr-a2-inputs`. Nothing run that writes; the app not started.

Method (the finder wording): from the promise — one Undo, only your own, every pair in the top bar, the roster and the
settings undoable except D350's five — I listed every writer (every command type the app registers), every reader of the
words (hover, bubble, history line), every door (the pair on each page, the board's bar, the ⋯ menu, the bell), every
restore re-check, and every place a not-a-step write shares a record with a step. Then I ranked the scenarios that would
disprove each. Five findings; none HIGH. Nothing found that loses or corrupts data.

Severity: **HIGH** = a wrong record or a lost change · **MEDIUM** = a person is told something untrue, or an undo lands
where its change cannot be seen · **LOW** = a nuisance with an obvious way back.

---

## Findings

### F1 — MEDIUM — creating a new Leave War period reads "taking the war back to a draft"

**What.** The new stage words (D352) are derived from any `lw.war` record change, not only from a stage move. Creating
a war writes an `lw.war` record with no before-image and `stage: 'draft'` after, so the describer reads it as a move
"to draft" and labels it as a step BACK.

**Where.** `raptor-port/src/undo/describe.ts` — `stageMove` (lines 142–147) returns a move whenever `before.stage !==
after.stage`, and `before` is `undefined` on a create; `stageLabel` (149–156) then returns `STAGE_TO['draft']` = "taking
the war back to a draft"; `lwLabel` line 194 reaches it for every `lw.edit` closure that carries an `lw.war` record. The
create path: `raptor-port/src/leavewar/state/store.ts` `createWar` (4489–4505) → `persistNotify` at idle (1241–1246)
commits a user `lw.edit`; `raptor-port/src/leavewar/engine/wars.ts:39` — a new war starts at `stage: 'draft'`.

**Scenario.** Setup: sign in as `ad`, open the Leave War. Action: "+ New" → name "2029", 1 Jan – 31 Dec 2029 → create.
What shows: the top bar's Undo hover reads "Undo — taking the war back to a draft"; a press says "Undid: taking the war
back to a draft" and the new war disappears. What should: "Undo — a new Leave War period" / "Undid: a new Leave War
period". (Renaming a war or changing its dates still reads "the war's dates or name" — correct; only the create is wrong.)

**Does `main` do the same?** No. On `main` a create read the generic "a change to the leave board". The wrong words are
new on this branch (B8's Leave War phrases). No test covers a create's label (`stage-undo.test.ts` covers advance / reopen
only).

**Fix — exact steps.**
1. `describe.ts` `stageMove`: change the find to `entry.forward.find(c => c.collection === 'lw.war' && c.op === 'put' && c.before && c.after)`
   so a create (no before) and a delete (no after) never read as a stage move.
2. `describe.ts` `lwLabel`, before the `if (colls.has('lw.war'))` line, add:
   `const war = entry.forward.find(c => c.collection === 'lw.war'); if (war && war.op === 'put' && !war.before) return 'a new Leave War period'; if (war && war.op === 'delete') return 'deleting a Leave War period'`
3. `bubbleText` needs no change (it only adds the suffix for `entry.type === 'lw.stage'`).
4. Red test in `raptor-port/src/leavewar/stage-undo.test.ts` (B8 block): `expect(createWar('2029', '2029-01-01', '2029-12-31')).toBe('created'); expect(undoState().undoLabel).toBe('a new Leave War period'); expect(undoState().undoLabel).not.toMatch(/draft/)`.
5. Re-walk: C8's script (`cr-c-steps`) can take one more check — create a war, read the hover.

### F2 — MEDIUM — a planning-calendar change undone from another page lands on the Inputs page, but not on its calendar

**What.** The plan's §11.6 (Fable 8, Astra 7 — accepted): "`lookahead`, `inputs` and `plan` closures → the Inputs page
(**calendar view for `plan`**)". The build lands on the Inputs page and leaves its view where it was — the table view by
default — where nothing of the planning calendar shows. AM39b's promise ("takes you to where the change was") is not met
for the calendar.

**Where.** `raptor-port/src/state/undo-wire.ts` `landingOf` lines 116–117: a `plan` record pushes `'inputs'` with no
`then`; `snapView` (138–157) runs `then` only for the roster (`focusQualsRow`) and the accounts (`requestAdminUsers`).
The Inputs page's view is `INPVIEW` / `setInpView` in `raptor-port/src/state/view.ts:65–66` (`'table' | 'cal' | 'med'`,
reset to `'table'` per session); `InputsPage.tsx:1114` draws the calendar only when `INPVIEW === 'cal'`.

**Scenario.** Setup: `ad`; Inputs → 📅 Calendar view → type a day title on Thu 16 Jul; go to Edit Schedule. Action: press
Undo in the top bar. What shows: the bubble "Undid: a change to the plan"; the Inputs page opens on its TABLE view (or on
whichever view it last had) — the calendar and its cleared title are out of sight. What should: the Inputs page opens on
the calendar, the day whose title went visible. The same when already on Inputs in the table view: the undo happens under
the calendar you are not looking at. (Walker A2's I3 noted the page "neither jumped"; the re-walk re-ran the same script,
which records the page as a note, not an assertion — so the calendar landing was never checked.)

**Does `main` do the same?** `main` never moves the page at all (A2-F4). The branch built the page half of the fix and
left the view half; new promise, half kept.

**Fix — exact steps.**
1. `undo-wire.ts`: import `setInpView` from `./view` (it already imports from there).
2. In `landingOf`, after line 117 (the `pages.push('inputs')` for inputs / plan / weekstash / lookahead), add:
   `if (fwd.some(c => c.collection === 'plan') && !fwd.some(c => c.collection === 'inputs')) then = then || (() => setInpView('cal'))`
   — a closure that is the calendar's alone opens the calendar; a closure that also carries an input keeps the table
   (the input is the change the eye looks for).
3. `snapView` already runs `land.then()` whether or not the page changed, so a person on the Inputs table view is switched
   to the calendar too. The Inputs page repaints on the restore's deferred `notify`.
4. Red test in `raptor-port/src/state/undo-wire.test.ts` (B7 block): `setDayRemark('2026-07-16', 'B7 PLAN')` from
   `state/plan.ts` (the calendar's day-title write, a `plan` step), `view.setPage('editsched')`, `globalUndo()`, then
   `expect(view.CURPAGE).toBe('inputs'); expect(view.INPVIEW).toBe('cal')`.
5. Re-walk `cr-a2-inputs` I3 with an assertion on the page AND the view.

### F3 — LOW (words) — an older account or Quals step under a later add / archive / restore / posting is refused without naming the act

**What.** Plan B3 (§4, kept by §11.4 which reworded only the greyed button): "The non-linear refusal (`undoConflict`, a
newer ineligible entry sharing a key) keeps 'can't be undone yet' but **names the act**: *… a later change to a person
(added, archived, restored or posted) touches the same thing*". Not built: the refusal is the generic sentence.

**Where.** `raptor-port/src/undo/timeline.ts` `undoConflictOf` lines 561–566 — the non-linear branch returns "A later
change touches the same thing and can't be undone yet." for an ineligible newer entry, whatever it was. `notUndoneWhat`
(696–702) already knows the act's word but is used only in the success bubble (line 777).

**Scenario.** Setup: `ad`; Admin → Users → suspend Outlaw (E1, a step). Then "Add a person" → New person Viper with a
sign-in (E2 — `account.addNew`, not undone here, D350). Action: press Undo. What shows: the button is ENABLED and its
hover promises "Undo — suspending Outlaw's sign-in"; the press says "A later change touches the same thing and can't be
undone yet." — nothing says WHAT the later change was or what to do instead. What should (B3): "A later change to a person
(added, archived, restored or posted) touches the same thing — it can't be undone yet. Enable, Restore or Delete on
Admin → Users is the way back." The same for a Quals tick on a man later archived, and for any account step made before a
posting out ran on its date (plan §8.1 accepts the strictness; it promised the words).

**Does `main` do the same?** `main` has the same generic sentence — but on `main` no account or roster step was undoable,
so nobody met it there. The plan asked for the words with the cutover; they were not built.

**Fix — exact steps.**
1. `timeline.ts` `undoConflictOf`, line 565, split the ineligible case: when `!isEligible(o) && touchesDeferred(o)` return
   `{ text: 'A later change to a person (added, archived, restored or posted) touches the same thing — it can’t be undone yet. Enable, Restore or Delete on Admin → Users is the way back.', sticky: false }`;
   keep today's sentence for every other ineligible newer entry.
2. Red test in `raptor-port/src/undo/timeline-cr.test.ts` (B3 block): a settings step on key `accounts`, then an
   `account.addNew`-typed step on the same key (a fake store, module `settings` cut over), `globalUndo()` →
   `expect(r.reason).toMatch(/change to a person/)`.
3. Put the sentence on the look card beside B3's greyed-button words (Fable Q6 in the plan).

### F4 — LOW — a "seen" mark that lives on a record a step also holds is quietly put back by that step's Undo

**What.** B1 makes the five seen-type commands "never a step: records the expectation only". Three of them write INTO a
record that steps also write, so the recorded before-image of an older step still holds the un-seen state, and undoing
that step writes the seen mark away with it:
- `person.backSeen` clears `back` on the man's own `people/<id>` record (`accounts.ts:408–415`); a Quals edit on his row is
  a step on the same record; `WelcomeBack.tsx:20–24` shows the note whenever `p.back` is set.
- `lw.ack` removes the notice from the `lw.cell` list (`leavewar/state/store.ts:2849–2868`, `putList`); a bid, decision
  or award on the same day is a step on the same cell.
- `access.seen` writes `seenBy` into `settings/accessreqs` (`accounts.ts:553–558`); refusing a request is a step on the
  same record.
(`changes.seen` has its own record, `changeseen`, that no step touches — fine; `access.request` is the waiting person's
own session — fine.)

**Where.** `raptor-port/src/undo/timeline.ts` `ingest` lines 143–146 and `NOT_STEPS` line 185: `trackExpectation` only,
so the older entry's `inverse` (and, after an undo, its `forward`) keeps the stale image; `applyRestore` then pins
`expectedRevs` to the CURRENT revision (608–613), so the write is accepted.

**Scenario (certain — the welcome note).** Setup: `ad` restores Hex on Admin → Users (`back` is set on his record);
sign out; Hex signs in — "Welcome back, Hex — check your quals and CAT" shows under the bar. Action: Hex ticks a qual on
his own Quals row (a step: `people/rocky`, its before-image still carries `back`), THEN taps "Later" (the note goes),
then presses Undo. What shows: "Undid: Hex's quals" — and the welcome note is BACK under the bar. What should: the tick
goes, the note stays dismissed. **The admin's bell (certain):** refuse Viper's request, open Admin → Users (marks the
other waiting requests seen), Undo the refusal → the bell lights again for requests already seen. **The war notice
(likely, not proved without running):** a member whose bid was replaced by a notice bids again on that day (the store
refuses nothing on a notice; whether the clash gate lets the day take a bid I could not prove from the code), taps "OK,
seen", presses Undo → the bid goes and the dismissed notice is back.

**Does `main` do the same?** No — on `main` the seen marks were steps of their own (the scenarios-corners test used to
prove "undo restores it"), so no stale image existed; the plan's own aim was that a member's Undo "must not bring the note
back". This is the class the plan's B1 wording did not cover.

**Why LOW.** Nothing of the squadron's record is wrong: a note, a notice or a bell mark comes back and one more tap
clears it again. But it is the exact thing B1 set out to prevent, and it happens on the member's own door.

**Fix — exact steps** (an overlay, not a fold — folding the seen write into the step would still restore the pre-step
image, which holds the mark):
1. `timeline.ts` `UndoHooks`: add `seenOverlay?(env: CommitEnvelope, image: Change): Change | null` — "this seen write
   touched the record `image` restores; return the image with the seen state carried over, or null to leave it".
2. `ingest` `NOT_STEPS` branch, after `trackExpectation(env)`: for each not-undone entry `e` in `entries` whose
   `keySet(e)` shares a key with `env`'s changes, for each change `c` in `e.inverse` AND `e.forward` on that key, if
   `hooks.seenOverlay` returns a patched change, replace `c` with it.
3. `undo-wire.ts` installs the overlay with three cases, each on `env.type`: `person.backSeen` → if `image.after` is an
   object, return a copy with `back` deleted; `lw.ack` → the ids of the notices the envelope's change removed (in
   `before`, absent from `after`) are filtered out of `image.after`'s list; `access.seen` → for each request in
   `image.after` whose id is in the envelope's `after`, replace its `seenBy` with the envelope's.
4. Red tests: (a) `timeline-cr.test.ts` B1: a `people` step, then a `person.backSeen`-typed write on the same record
   that deletes `back`, then `globalUndo()` → the restored record has no `back`; (b) `leavewar/scenarios-corners.test.ts`
   "OK, seen": a second bid after the notice, ack, `globalUndo()` → no notice on the day.
5. Re-walk C11 with the war twin above.

### F5 — LOW (belt) — the "a delete is final" scan misses an accounts image stored as null

**What.** B4 keeps a step dead whose image holds a deleted man's account. `deletedRestoreProblem` reads the accounts image
only when it is an array; a stored `null` means "the seeded list" (`accountsLoad`; `roster-restore.ts:90` already treats
it so), and the seed holds Saber's and Ranger's accounts.

**Where.** `raptor-port/src/state/person-delete.ts:337` — `Array.isArray(v) && v.some(...)`; the seed:
`raptor-port/src/state/accounts.ts:91–94`, `seedAccounts` line 101.

**Scenario.** Reachable only if a seeded account's man is deleted while the war does not hold him (a hidden SANS man — the
Fable red-team 10 case), on a world whose first-ever accounts write was the step being undone: the very first account
change (before-image `null`) → later delete Ranger → Undo the first change → the accounts list is written back as
`null`, the loader reads the seed, and Ranger's sign-in is back. Every seeded man is on the war today, so the newer
delete's `lw.postouts` write blocks it first ("can't be undone yet"); I could not build a route that reaches it on the
seed as shipped. Reported as the belt B4 meant to be, since the code would do it to new data if a seeded man were ever a
hidden SANS man.

**Does `main` do the same?** `main` has no B4 at all (roster and settings were not undoable).

**Fix — exact steps.**
1. `person-delete.ts` line 337: `else if (ch.collection === 'settings' && rid === 'accounts') { const list = v == null ? seedAccounts() : v; hit = Array.isArray(list) && list.some((a: any) => a && a.pid === id) }` — import `seedAccounts` from `./accounts` (the file already imports from it).
2. Test in `person-delete.test.ts` B4: `deletedRestoreProblem([{ op: 'put', collection: 'settings', id: 'accounts', after: null }])` after deleting `bane` (Ranger) → matches `/has been deleted/`.

---

## Explicit negatives — checked and found sound

**The dispatcher and D148 (`timeline.ts`).**
- Own steps only: `isOwn` compares the PERSON, so an admin's step is still his in the member view and refuses "Switch
  back…" every press (never passed over — §11.5 (a) honoured); another person's step is skipped silently, never greys, never
  offered (`newestUndoable`, `mostRecentlyUndone`); `mayReverse` for a member still requires every owned record to be his.
- The named barriers: a `remote` envelope and the posting pass (`lw.postoutRun`, never folded — §11.1) set a sticky
  barrier with the actor; an orphan projection sets it at ingest; a gap found by revision names its writer through
  `writerOf`. The refusal names the callsign through `hooks.nameOf` (read live, so a rename shows the new name), the app
  for a system actor (with "a posting out ran" when it was), and falls back to today's words. "You changed this somewhere
  else" for one's own remote change is correct for a second device.
- Say-once-then-pass-over: only a STICKY conflict marks the entry; a temporary one (a newer own step, the publication
  barrier, a restore rule) refuses every press; the blocked entry stays `undone:false` and still guards older steps through
  the non-linear rule (SEQ-003); the first refusal names the next step and the hover then reads that step. Redo has the
  same, from the undo's restore seq (`undoneSeq`).
- The stateless pre-check runs before the snap (`outOfBandConflict` inside `undoConflictOf`, called before `snap`), so a
  stale record is refused in words with the view unmoved; `plainRestoreReason` no longer says "Try again" and says "this
  week" only for a week's records.
- A1-F1: a newer entry that is dead or ineligible reads "can't be undone" / "can't be undone yet", never "undo that first".
- B1: the five types are never entries; their revisions are tracked so nothing reads out-of-band (F4 is the one side
  effect). B3: `NOT_UNDONE_TYPES` covers all seven writer types the app registers for D350's five acts (I listed every
  `commitPeopleIntent` / `commitPeopleSettingsIntent` / `commitIntent` / sync.ts caller); the collection belt
  (`lw.postouts`) stays; the greyed button's hover and the press both say the §11.4 sentence; an older step taken past
  one says it stays. The Leave War's "Undo post out" is `lw.postout` — never a step.
- `applyRestore` asks `deadRefusal` and `restoreRefusal` again inside the reducer before any write and keeps a
  `CmdRefused`'s own sentence (§11.3).
- `endUndoSession` is called by `resetSession` on every sign-in and sign-out; the member-view switch does not clear it
  (his own steps stay his — right).
- The perms gate: `undo.restore` is mapped (`perms.ts:278`); the per-record scan (`ownershipViolation`) still limits a
  member's restore to his own input, his own Quals row, his own war row and the schedule records his own input landed — a
  member can never restore a settings record.

**The restore re-checks (`roster-restore.ts`, `accounts.ts`, `person-delete.ts`).**
- One body asked twice over the combined candidate (people images laid over `PEOPLE`, the accounts image over the roster
  as it would stand). Rule 1 mirrors `callsignTakenBy` (placeholders, ids, D286's "archived is free"); a redo of a rename
  onto a name since taken is refused too. Rule 2: the accounts guards are the write path's — one name one account, one
  person one account, no account for someone not on the roster, D322 (an archived man never turned on by Undo or Redo — a
  redo of "Give sign-in" to a since-archived man is refused), ADMIN_LOCK counting only men on the roster and not deleted,
  never your own account (every field he signs in with), a request under an account's name (Fable 11); a stored `null`
  read as the seed, never as "no accounts". Rule 3 (a person removed) fails closed. `Account.on` is always a boolean
  (`accountsLoad` normalises it), so the own-account comparison cannot misfire.
- B4: a people image of the man un-deleted, or an array holding his account, is dead — cached once, passed over by the
  dispatcher, still guarding (F5 is the null belt).

**The stores' `write()` (derived indexes).** `settingsStore.write` runs the reset-then-overlay rehydrate over ALL twelve
loaders (rules, stores, cancel reasons, day / duty / wave templates + hide, LoX columns, look-ahead, both defaults,
accounts, changeseen) and defers a reflow; `peopleStore.write` clones on write, rebuilds `ID_BY_CS`, advances the baseline,
persists and reflows — and the Leave War roster and the Tracker's people bridge re-project on that notify. A wave-template
save is ONE command through `store.group` (raw inside a running command). The Quals page reads the one column list on
every repaint and writes it only from its edit handlers (B9) — no stale copy can be written back.

**The words (`describe.ts`).** A text command's key is carried as a fact (`meta.key` → envelope `detail` → entry), never
a label; `textLabel` maps every prefix of the slot-key grammar (times, day note, section notes, names, callsign, mission,
remarks, in-time, stores, area, area time) with a safe fallback. One input through the batch door reads "a personal
input"; N read "N inputs". The Leave War: bids, awards and their removal name the man; settings, balances, the OIL policy,
a ledger entry, the stage (own words, plus what the war is now on the bubble — D352) — never "leave board" (F1 is the one
wrong label). The roster: callsign, CAT, quals, initials, flight, remarks per man. The accounts: suspend / enable / role /
sign-in name / the puck, reading the seed when the stored list was null. The five D350 acts have names for the greyed
button.

**The landing (`undo-wire.ts`).** A war step lands on the war (even when its approved leave lands on a week); a week
record on Edit Schedule (for someone who has it), the board reopened on the changed day when a week load closed it
(A1-F2), the day brought into view on the week (A1-F3, `bringDayIntoView`); an input on the loaded week stays on Edit
Schedule (W4), an absence on the war stays there (W3), an input elsewhere opens Inputs; the roster → Quals on his row; the
accounts / requests / guest switch → Admin → Users; a rule → Logic; the LoX columns → Quals; the templates and defaults
→ Admin; the stores and cancel reasons stay. Not when already on the page. F2 is the one gap (the calendar view).
`setSecDefOffer(null)` in `postRestore` closes the "set as default?" offer (A1 O5).

**The history line (`changelines.ts`).** An Undo / Redo line only where the change wrote one (dated days, or the roster /
ledger / postings dated today); none for a settings, `lw.config`, stage, war or balance closure (A2-F5, §11.9).

**The pair and the bars (`topbits.tsx`, `Shell.tsx`, `SchedBoard.tsx`, the CSS).**
- One `UndoPair`, handed an ENGINE: the one undo everywhere but the Tracker, the Tracker's own history there, never both
  (§11.10). The OIL Earn stop is inside the one-undo engine, so both doors ask it. `#undoBtn/#redoBtn` on every page,
  `#trUndoBtn/#trRedoBtn` on the Tracker, `#sbUndo/#sbRedo` on the board.
- Where the pair shows (D347, §11.6): Edit Schedule, Leave War, Inputs, Quals, Tracker for anyone; Admin and Logic for an
  admin only; never View-only Sched or Help — and nothing undoable is made on those two (a bug report is a plain session
  array, not a command; the changes window's "Mark all as seen" is never a step). No keyboard door to the one undo exists
  outside the pair. A guest / waiting person never mounts the Shell.
- The order (D348): DOM order is Undo · Redo · (the clock on Edit Schedule for an admin) · the Sync chip · the bell;
  `order:9` is gone; `has-undo` (never `editing`) drops the Sync label to its dot on a phone and at 821–1499px, where the
  pair also goes icon-only (W1) — pinned by `topbar-css.test.ts`. The Edit Schedule tint stays on `.editing`.
- The changes clock is Edit Schedule's only and its number is a memo dep (W2).
- The board (D349 (3)): Undo · Redo · History · Sync · bell · ✓ Done; ✕ gone; Escape and the scrim still close it; the
  bell's three navigating taps go through `setPage`, which closes the board (view.ts) — never under it; the Sync state is
  module state shared by both chips; on a desktop Sort all sits before Undo inside the `display:contents` wrapper the
  geometry gate already counts through; on a phone Sort all and the layout switch sit behind ⋯ in the second row, the
  menu closing on a tap outside, on Escape (stopping the board's own Escape) and after a choice, and closed with the board;
  Sort all keeps its `open && editMode && !DPREV` gate in both places.
- The Tracker: a no-import bridge (`undo-bridge.js`) registered at the end of `core.init()` with the core's own subscribe
  as the change signal; the Header hides its pair only when hosted (`setTrackerHosted(true)` runs at the page chunk's
  load, before any render), so the standalone Tracker keeps its own; before the chunk loads both buttons are greyed with
  "Nothing to undo"; Ctrl+Z untouched.
- The Leave War's Period-row pair and its CSS are gone; every test re-pointed to `#undoBtn` deliberately.

**D352 (`lw.stage`).** Registered with the war's commands, its `perms.ts` row admin-only (`op(T.bid,'U')`; the test
proves admin true / member false), used by both `advanceStage` and `reopenStage`; the stage's projections (the OIL pass on
publish) wake restore-caused and advance `expected` without a barrier.

**What the plan decided that I did not re-open (per the brief).** Say-once-then-pass-over; "OK, seen" never a step;
D350's scope and the coarse `settings/accounts` record (plan §8.1); the phone bar's one-time order change; the board losing
✕; the Tracker's second engine behind the same-looking buttons; a settings-only undo writing no history line.

**Not a finding (D56).** Nothing in this read depends on data already stored; every scenario above is new data.

## Summary

| # | Severity | One line |
|---|---|---|
| F1 | MEDIUM | Creating a new Leave War period reads "Undo — taking the war back to a draft" (new on this branch; a create has no before-image) |
| F2 | MEDIUM | A planning-calendar change undone from elsewhere opens the Inputs page but not its calendar view (plan §11.6 asked for it) — the change stays out of sight |
| F3 | LOW | An older account / Quals step under a later add / archive / restore / posting is refused with the generic sentence; plan B3 asked it to name the act and the way back |
| F4 | LOW | A seen mark on a record a step also holds (the welcome-back note, a war notice, the admins' bell) is put back by that step's Undo — the very thing B1 set out to stop; overlay fix given |
| F5 | LOW | The "a delete is final" scan misses an accounts image stored as null (the seed); unreachable on the seed as shipped; one-line belt |

No HIGH. Nothing found that loses or corrupts a record, reverses another person's change, or lets a refusal pass.
