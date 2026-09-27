# Red team, round 1 — the `[POST-OUT-OUTCOMES]` plan (Fable 5.1, 27 Sep 26)

Plan read: `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` (the whole file). Also read: the
approved mock-up and its sixteen pictures; the rulings named in the brief (how-we-work D229, D280–D302, D165–D223;
scheduler D45, D103, D149, D175, D186, D218; oil D48, D142; the Leave War file whole); the backlog item; data-model §3,
§10, §11; the code the brief lists, in full or at the named functions; PR #444's `sync.ts`, `store.ts`, `BidPicker.tsx`,
`Matrix.tsx` and `SelectSheet.tsx` from its branch. Nothing was edited but this file.

**Verdict: APPROVE WITH CHANGES.** The shape is right — the hidden mark, one command, the past kept by keeping
`PEOPLE[id]`, the callsign rule in one place, the member view as the session's role. Three things would break the
plan's own promise PO6 ("days he already flew never read pending for the delete; nothing brings him back") the moment
the app is opened, and they are all missing call sites, not wrong lines. Fix those before the build starts; the rest
can land during it.

---

## Findings, most severe first

### F1 — Every published day he already flew behind an ALL / ALL AVAIL puck reads "1 pending" after the delete, and its four sign-offs fall (breaks D297/D299, PO6)

**Setup.** A Saturday in July was published with a Common Programme row holding ALL AVAIL; Hex was free that day, so
the issued OIL evidence block froze him in the crowd (`oilev.sent`, D44). **Action.** Delete Hex (from Admin → Users,
or the posting's Delete on its date). **Expected (the plan, §4.4).** That Saturday reads nothing pending — the past keeps
its record. **What happens.** §4.4 stops the ROSTER-ATTRIBUTE comparison (`attrsOf`) for a day before `deletedFrom`, but
a published day has a second comparison the plan never names: `publish.ts oilDelta` (line 471) re-derives the live OIL
evidence with `oilEvidence(di)` → `HOOKS.oilSentinel` → `leavewar/sync.ts availableFor`, and `availableFor` line 765
skips every `p.archived` body. The delete sets `archived: true` (§1), so Hex drops out of the live crowd, the block's key
differs from the issued one, and the day reads "1 pending" on its OIL line with the sign-offs down (D103). Every past
published day he stood behind a placeholder does this at once. **Disproof.** Publish such a Saturday, delete him, open
the day: it reads 0 pending and the four stay green.

**Fix.** In `leavewar/sync.ts availableFor(iso, win, day)`: replace `if (!p || p.special || p.archived || p.pers)
continue` with a rule that reads a deleted man by DATE — `if (!p || p.special || p.pers) continue; if (p.deleted ?
iso >= p.deletedFrom : p.archived) continue`. (A deleted man is available on a day before his date exactly as he was; on
or after it he is out. An archived-only man keeps today's rule.) Add the same date-aware test to `engine/faceattrs.ts
rosterIds()` is NOT needed — `snap.ros` is drawn, never compared — but say so in a comment there. Pin it with a test in
`leavewar/oilsync.test.ts` (or `publish.test.ts`): a published weekend with a frozen crowd naming him; delete from a
later date; `dayDelta(di)` is empty. Then re-read §4.4 as "a deleted man's roster attributes AND his crowd membership are
not compared on a day before his date".

Note for the look card: the same two comparisons fire today for the OVERSEAS archive on days before the posting (the
plan's last "Not in this build" bullet names the attribute; it should name the crowd too).

### F2 — Undo can put him back on a day still to come (the belt has a hole; PO6 "loading a version or switching a plan never brings him back" — undo is a third whole-day replacement)

**Setup.** Signed in as admin; Hex is on next Tuesday's programme. The admin takes Hex off Tuesday by hand (an ordinary
edit). Then the admin deletes Hex. **Action.** Press Undo. **Expected (the plan, §4.3 "Undo cannot").** Refused.
**What happens.** The delete's own entry is ineligible (`undo/timeline.ts isEligible`: the `people` module is not cut
over — `state/undo-wire.ts` line 145 cuts over `sched`, `lw`, `inputs`, `plan` only), so `newestUndoable()` SKIPS it and
offers the earlier removal. `undoConflict()` refuses only where a newer entry SHARES A RECORD KEY (line 441–447). The
delete changed nothing on Tuesday (he was already off it), so Tuesday's `days/<wk>#<di>` record is not in its closure,
nothing is shared, and the restore writes Tuesday's before-image — with Hex — through `schedStore.write()`. The same
hole exists for Redo (an "add Hex to Tuesday" undone before the delete, redone after). The plan's sentence "blocks undo
of any earlier change to the records it touched" is literally true and is exactly the gap: it does not touch a day he
is not on. **Disproof.** Do the four steps above; Undo says "refused" and Tuesday stays without him.

**Fix (Part A, in `state/store.ts`, no #444 file).** Put the belt at the restore seam, the same one `rowsLeftOut`
guards for loads and plan switches: in `schedStore.write(entries, opts)` (the `days` collection) and
`weekstashStore.write(...)`, when `opts.restore` is true, run `stripDeleted(day, iso)` (the plan's own function) on every
day record written, on or after each deleted man's `deletedFrom`, before it lands — and for the stash, on every day
and parked plan (`d`, `dr`) in the blob. Then a restore can never re-seat him, whichever entry it replays. Second belt
(Part B, `state/undo-wire.ts` — a #444 file): use #444's new `restoreRefusal(changes, dir)` hook to REFUSE the restore
with a plain reason ("Hex has been deleted — that change can't be undone") when its images would put a deleted man on
a day on or after his date, so the person is told rather than silently stripped. Tests: `undo-wire.test.ts` — remove
him by hand, delete him, `globalUndo()`; assert the day stays without him (and, with the hook, the refusal text).

### F3 — Every posting door and posting writer must refuse a deleted man, or Undo post out / Post out on his past row restores him

**Setup.** Hex was posted out with Delete from 14 Oct; the date came; the delete ran. His row is kept on the war for the
months before he left (the keep rule, §4.2) — so in September an admin can still tap his cells. **Action.** Tap one of his
September days → the bid sheet → PO → post him out from 1 Sep. Or, where a greyed day of his is still on screen (the
month of his date), tap it → the Post out sheet → "Undo post out". **Expected.** Refused: a delete is final (§3).
**What happens.** The plan says only that the Post out sheet "is not offered" for a deleted man. The functions behind
every door do not know `deleted`: #444's `undoPostOut(id)` → `body.archived && body.archivedBy === 'po'` → if the delete
does not set `archivedBy` it falls through to `setPostOut(id, null)`, which clears his window; with `to` null the keep
rule no longer keeps him as posted out and `rowInWindow` shows his row in EVERY month — his row after he left is back,
with `deleted` set and nothing on screen to say so. If the delete DOES set `archivedBy: 'po'`, `undoPostOut` calls
`restoreArchivedPerson`, which un-archives a deleted man onto the Quals roster. #444's `postOut(id, from, archive)` on
his past cell moves the window and can un-archive him the same way. `setPostIn` likewise. The drag selection's PO
(`SelectSheet` `sel-postout`, single person) reaches the same route. **Disproof.** After the delete, the bid sheet on his
past day shows no PO row, and a hand-made `postOut('rocky', '2026-09-01')` / `undoPostOut('rocky')` /
`restoreArchivedPerson('rocky')` / `setPostOut('rocky', null)` all return false and change nothing.

**Fix.** (a) `leavewar/sync.ts`: at the top of `postOut`, `undoPostOut` and `restoreArchivedPerson` add `if
((PEOPLE as any)[id]?.deleted) return false` — with the reason surfaced through `postingProblem` for the sheets
("Hex has been deleted — the posting can't be changed"). (b) `leavewar/state/store.ts setPostOut` / `setPostIn`: the
war's Person must carry the mark (see F6) and refuse `p.gone`. (c) The doors: `Matrix.tsx` passes `onPostOut` /
`onPostIn` only when `!openPerson.gone`; the PostOutSheet / PostInSheet mount conditions (lines 4184, 4204 on main)
add `&& !openPerson.gone`; `SelectSheet` receives `onPostOut` only when the one selected person is not gone. (d) Quals
Restore: `restoreArchivedPerson` refusing `deleted` covers the hand-made call; the Archived list already hides him.
Tests: `po.test.tsx`, `poarchive.test.ts` — each door on a deleted man.

### F4 — The date pass cannot run the delete through the user door; it must be a projection with the mutation split from the door

**Setup.** A posting with Delete, date to come. The date arrives while the app is open — the pass runs on a notify
(`runPoOutcomes`, §3). **Action.** Nothing; the pass fires. **Expected.** He is deleted, once, in one envelope.
**What happens.** §4.1 defines `deletePerson(id, from)` as "admin only (`mayDeletePerson()`)" with refusals for "his own
person" and "the last admin". The pass is a reconciler (a projection, the SYSTEM actor — `command/commit.ts
commitProjection`); calling the user door from it asks the SIGNED-IN session's permission for an act the ADMIN ordered
on the sheet. With an admin signed in it works by luck; headless it refuses (`mayDeletePerson` would have to answer
"no session → true", and then a member's device could run it — today one browser is one world, so this is moot until
the database, but the shape is wrong now). And `persistPeopleProjection()` (`state/people-settings-commit.ts` line
247) enlists ONLY `peopleStore` — the overseas outcome's account suspend writes `settings/accounts`, and the whole-world
guard (`commit.ts guardCheck`) rolls back a change in an un-enlisted registered store. **Disproof.** Under a test with
no session, the pass on a due Delete posting deletes him and the envelope carries people + settings + lw + days
changes.

**Fix.** `state/person-delete.ts`: two functions. `applyDelete(id, from)` — the mutation only, runs inside ANY enlisted
command (it calls `txn.enlist` on every store it writes, or is given a txn). `deletePerson(id, from)` — the user door:
`mayDeletePerson()`, the four refusals, then `commit({ type: 'person.delete', apply: txn => applyDelete(...) })`. The
pass calls `commitProjection` with ONE command that enlists `peopleStore`, `settingsStore`, `lwStore`, `schedStore`,
`weekstashStore`, the inputs store and the plan store and runs each outcome's mutation (`applyDelete`, the archive +
suspend, the SANS tick) — add `commitPeopleSettingsProjection(type, fn)` beside `persistPeopleProjection` in
`people-settings-commit.ts`. The "last admin" refusal stays in the pass as a skip-with-toast (the posting stands,
`poDone` not set, so it is retried and named), never a silent drop. The "you cannot delete yourself" refusal belongs to
the door only.

### F5 — Part A is not free of PR #444's files

PR #444 changes 26 non-test source files (its branch diff against `main`), among them `src/ui/inputedit.tsx` (+110
lines), `src/ui/InputsPage.tsx`, `src/ui/InputsCal.tsx`, `src/undo/timeline.ts`, `src/state/undo-wire.ts`,
`src/ui/App.tsx`, `src/ui/SchedBoard.tsx`, `src/ui/export.ts`, `src/ui/scheduler.css`. Part A (plan §13) claims
none of these, but: §4.5's input ending/removal names `withRemarksTail` (fine — `engine/inputs.ts`, untouched by #444
in that function) AND `dropInputRow` (private to `inputedit.tsx`, a #444 file); §4.2's `!deleted` on the Inputs
"Posted out / archived" group is `inputedit.tsx archivedOptions` / `ArchivedGroup`; §10's Undo reason wording is
`timeline.ts mayReverse`; F2's second belt is `undo-wire.ts`; every new style (the back prompt, the danger button, the
Rename box, the SANS tag) is `scheduler.css`, and two branches both APPENDING to the same file end is a textual git
conflict, not a clean merge, whatever the HANDOFF promise says. **Fix.** Part A writes the input removal inline in
`person-delete.ts` from engine helpers only (`INPUTS.splice`, `engine/slots.ts unacceptInput`, `engine/inputs.ts
withRemarksTail`, `inpId`) and does not import from `inputedit.tsx`; the one-line `!deleted` in `archivedOptions`, the
`mayReverse` wording, the `restoreRefusal` belt and the CSS move to Part B (after #444 is taken in), or the CSS goes into
a NEW file `src/ui/postout.css` imported from `Shell.tsx`. State the corrected list in §13.

### F6 — The war's kept row does not know he is deleted, so "the OIL tracker skips him" and the posting refusals (F3) have nothing to read

The war's `Person` (the projection, `leavewar/state/raptorRoster.ts projectPeople`) drops an archived body; the keep
rule (`store.ts setPeople` line 1608, `sync.ts reprojectRoster` line 1308) puts back the FROZEN copy from `postOuts`,
captured before the delete — it carries no `deleted`. §4.2 has `displayRoster` / the OIL tracker "skip a deleted man"
and F3 needs `setPostOut` to refuse one, but the Leave War store may not import `PEOPLE` (the seam rule: only
`sync.ts` crosses). **Fix.** In `sync.ts reprojectRoster`, when a kept person's Raptor body is `deleted`, push the kept
copy as `{ ...p, gone: true }` (a new optional field on the war's `Person`, `leavewar/engine/people.ts`), include `gone`
in the change-guard `sig`, and lay it in `setPeople`'s keep branch from the frozen copy as well (the frozen copy is
rewritten by `windowRecord` when `applyDelete` sets `to`, so store `gone` on it there). Readers: `OilTracker.tsx` line
238 `displayRoster().filter(p => !p.gone)`; `store.ts setPostOut` / `setPostIn` refuse `p.gone`; `Matrix.tsx` hides the
posting doors on `gone` (F3c). `rowInWindow` needs no change — his `to` is the day before his date, and §4.5 clears the
records that would stretch the row (hand-typed awards are NOT in `merge.ts spans`, so a kept grant cannot stretch it —
checked).

### F7 — A roster-only SANS man with Show SANS off has no door to a delete (a missing door, 7.7)

D217 lets the admin make a person with a blank sign-in ("a SANS man from another squadron"). Such a man has no
account (no "Delete account" on Admin → Users) and, unless Show SANS is on, no row on the Leave War (`projectPeople`
skips `p.san`), so §4.8's two doors both miss him; the Quals ✕ only archives. The plan's look-card item 3 assumes the
war's sheet reaches everyone; it does not. **Fix (small, but a visual change — one line on the mock-up first, D294's
rule):** a "Delete" button on each row of the Quals Archived list beside Rename and Restore (admin only), with the same
second tap and the same line as the account editor; it calls `deletePerson(id, today)`. That gives every person one
sure door: archive him (✕), then delete him from the Archived list. Put to him (question 2 below).

### F8 — On a day on or after his date the pending list would name the delete twice

`ui/pendlist.ts faceWords` line 191–203 walks `snap.pa` (every man the version froze) against `peopleAttrsNow`, and
`CATW.archived` reads "posted out". After the sweep he is off the working copy (one removal line per place, D109) AND
his attrs now read `archived: yes` → a second line "Hex · posted out: no → yes" on the same day. §4.4's rule is dated
("before `deletedFrom`"); for a deleted man it should be unconditional. **Fix.** `engine/publish.ts peopleAttrsNow(pa)`:
for an id whose `PEOPLE[id].deleted` is set, return the snapshot's OWN attrs (`out[id] = pa[id]`) — never compared, on
any day: before his date the day is the past (F1's rule), on or after it the removal is the change. `pendlist.ts` reads
the same function, so the double line goes with it. Pin in `pendunits.test.ts`: one man on one seat, deleted, the day
counts 1.

### F9 — `stashEditDays` cannot reach what §4.3 says it sweeps

`engine/weekstash.ts stashEditDays(v, edit)` hands the callback `p.d` only. §4.3 sweeps a stashed week's parked plans
(`dr`) and sign boxes (`sg`, `sb`) too. **Fix.** Add `stashEditBlob(v, edit: (blob) => boolean)` beside it (same
preserved-week refusal, same "write only if changed" rule), and have the sweep clear `blob.sg[di][role]` and
`blob.sb[di][role]` for his signatures and walk `blob.dr[di][k].d` and `.sign` for days on or after his date. Also
`oild.people` keys `"<id>|<item>"` on those days, in `d` and `dr` alike.

### F10 — #444's `reprojectRoster` and `readPostOuts` carry `poArchive`, not the new outcome

`sync.ts reprojectRoster` (#444 line 1315) lays back `ex.from / ex.to / ex.poArchive` and its change-guard `sig` (line
1347) includes `poArchive`; `store.ts setPeople` lays `w.poArchive`; `readPostOuts` reads the record; `runPoArchive`
keys on `poArchive === true`. §1 renames the field to `poOutcome` + `poDone` and says the loader tolerates the old one,
but §13/§14 never list these four places. **Fix (Part B).** Carry `poOutcome` and `poDone` in all four (and `sanBy` /
`offBy` need no war copy — they live on the Raptor person and the account). A `poArchive` still in a stored record
reads as `'overseas'` in `readPostOuts` (the plan's tolerance), and `windowRecord` writes the new shape only.

### F11 — `callsignProblem` must carry D226's 14-letter rule, or Rename and Restore-as cut or refuse silently

`renameCallsign` (`engine/slots.ts` line 695) has no length rule; the Quals box relies on `maxlength="14"`, which cuts
silently — the thing D226 forbids. The new Rename box and "Restore as Ace 2" go through `callsignProblem`. **Fix.**
`callsignProblem(cs, exceptId?)` returns `CS_TOO_LONG` (from `roster-add.ts`) above `MAX_CS` and "Type the callsign or
name" for blank, before the taken/collision tests; the Rename box and the Restore-as box take no `maxLength` and show the
reason (the sign-up's pattern, `AccessScreen.tsx` line 100–104). "Ace 2" when "Ace" is 14 letters is 16 — the next-free
suggestion must be shortened to fit or the box opens with the reason already shown.

### F12 — The member view's Undo refusal says "someone else's change"

`undo/timeline.ts globalUndo` refuses with "You can't undo that — it was someone else's change." when `mayReverse`
fails; in the member view the change was HIS, made as admin. §10 says "with its reason (on the look card)" but names
no words. **Fix (Part B, `timeline.ts`).** When `entry.actor.id === cur.id` and `entry.actor.role === 'admin'` and
`cur.role !== 'admin'`: "Switch back to the admin view to undo that."

### F13 — Small things the plan should state so the build cannot drift

- `accounts.ts canSignInAsAdmin` and the lock-out check `personOk` must add `!deleted`, and the delete's "last admin"
  refusal must count with the same body (`ADMIN_LOCK`), or the two disagree.
- `accounts.ts accountsLoad` drops nothing for a deleted pid; the delete removes the account in the same command, so
  state it as the invariant and pin it (an account whose person is deleted is never loaded — `pidProblem` already
  refuses linking to an archived one).
- `Drawer.tsx` line 94 prints "Signed in as Saber · Admin" from `isAdmin()`; in the member view it must read
  "· Member" (the plan's picture 7c shows the button only) — `isAdmin()` already follows the session role, so it does,
  but name it on the roll-call (#29).
- `auth.ts setEffectiveRole` says "No production caller" — §10 makes it one; correct the comment, and keep the
  perms-scan allow-list unchanged (the switch reads `SESSION.acct` only in `perms.ts`).
- The `sched.sign` command gate: a sign-box clear inside the delete is a child of `person.delete` (not re-authorised),
  fine — but `setSign(di, role, '')` writes `signBind` too; use it (not a raw `signOf(di)[role] = ''`), as §4.3 says.
- `state/plan.ts` mutators read `canEditSched()`; the sweep of `PLANPUCKS` inside the command must write the arrays
  directly (blank the slot as `togglePuckPerson` does — a gap, not a splice, or surviving pucks shift), enlisting the
  plan store.

---

## The brief's questions, answered

**1. The rulings.** The plan obeys every ruling I read, with these readings to state out loud:

- D286 (2) "a typed callsign finds the person on the roster, never the archived one": the plan's `callsignHolder` returns
  the archived man when NO roster man holds the callsign. That is today's behaviour and D286 (5)'s note needs it; say it
  as the reading.
- D284 "when the admin restores him / enables his account": the plan narrows the back prompt to Restore (look-card 6)
  and leaves Enable-alone as an enabled account on an ARCHIVED man (no roster row, no prompt). D284's words name both
  acts. Not the agent's to narrow silently — question 3 below.
- D287 (3) "cannot be undone" is met only with F2/F3.
- D299's "his place on a course still running — goes" is approved and NOT built (§4.7). That is a deferral of an
  approved item and must be said as one on the look card, with his one-word yes (question 5).
- D178/D189: an input the delete ENDS the day before his date rewrites its "till" — every published day it still covers
  before his date then reads "1 pending" (D189 keeps that). The plan's §4.5 changes the END, so a leave running 10–20 Oct
  ended on 13 Oct reads pending on the published 10th–13th. Correct under D189, but PO7 ("his past inputs stay") should
  say the tail rewrite is a change on the days before too — or end the input WITHOUT rewriting the tail (the till note
  then reads past his date, wrong). Recommend: rewrite the tail; it is the truth.
- Rulings the plan FORGOT to list: D91 (taking a man off a seat leaves no mark on the row — the sweep's emptied seats
  read empty, no crossed name: consistent, state it), D109/D113 (one removal per place; F8's double line breaks it),
  D176/D174 (the filing axis: his deleted inputs on a published day are "gone" — reads as a change only where the issued
  day showed it), D221/D204 (a deleted man who signs in again lands on Request access; approve opens New person — no
  "archived" note for him), D129 (the member-view switch is not a logout: the Tracker's unsaved-edits ask must not fire).

**On the look card, his to decide BEFORE the build** (a product fork the build would bake in): items 1 (a posting with no
outcome), 3 (no delete door for a hidden SANS man — F7), 5/6 together (Enable alone vs Restore), 9 (the Tracker item
approved as "goes"). Items 2, 4, 7, 8 are the agent's calls.

**2. The delete — completeness.** Checked every place a person id can live: flying seats / duty holder and extras / sim
seats, pax and extras / ground `who` / programme `who[]` and extras / sign boxes / `oild.people` — §4.3 reaches each
through `setSlotVal`, `setSign`, and the `oild` clear (verified the key grammar in `engine/slots.ts`; `more[]`
appends are trimmed by `setSlotVal` itself). The stash: reached, with F9. Parked plans of the live week: `SCHED.drafts`
— reached. Published versions: never rewritten — right, `daySnapIn` reads `als[].snap.d` / `orig[di]` which the sweep
does not touch. The planning calendar: reached (F13 gap rule). Inputs: reached; a multi-day input lands ONE ground row
on its start day, so an input spanning his date keeps its row (start < date) — correct. Leave War records: reached
(`forgetPersonFrom`). A day template: carries no crew — checked, `engine/daytpl.ts blankWho` blanks every `who`/`id`.
A copied day (duplicate wave): copies what is there — he is not. A published version loaded onto the working copy and
a plan switch: the `rowsLeftOut` belt — right place (`drafts.ts leaveOut` runs on both doors). **I found nothing else
on a day or in a store that holds him.** What CAN bring him back: Undo/Redo (F2 — a third whole-day replacement the belt
misses); a never-visited SEED week on or after his date (none exists — the seeds are July, and seeds are code the
database step replaces; belt it anyway in `applyWeekModel`'s seed branch with the same `stripDeleted`, one line); an
input re-landing (`relandInputs` / `autoAcceptSeedInputs` land from `INPUTS`, which no longer holds his inputs on those
dates — nothing re-lands: checked); the OIL pass (F1's rule covers the crowd; the pass never writes a day); the crowd
frozen on an issued day (drawn from `oilev.sent`, never written back: checked); a Leave War re-projection (`setPeople`
writes the war's people, never a day: checked). "The later of his date and the real today" is right: the demo `TODAY`
(13 Jul 26) is a day FLAG on the seed, not a clock the app reads for dates, and the posting pass already uses
`localToday()`; the consequence for the walk (the July weeks are all "already flown") is stated in §4.3.

**3. Atomicity.** Read `command/commit.ts` whole: enlistment is explicit; a change in a registered store that was not
enlisted is rolled back by the whole-world guard and refused; a `CmdRefused` or a throw in phase 3 restores every
enlisted snapshot and the whiteboard savepoint (`wtx.rollbackTo`), so nothing persists; a nested `commit` inside the
reducer joins (one envelope); the Leave War's `persistNotify` inside a running command routes as a join
(`store.ts gesture` — `cmdIsCommitting()`), and `histPush`/`persistAll`/`notify` are latched to phase 8. So ONE command
over people + settings + `days` + `weekstash` + inputs + `lw` + plan IS all-or-nothing in memory and in storage — PROVIDED
every store is enlisted up front (F4's helper) — the `weekstashStore` exists (`state/store.ts` line 211, `[CMDL-FINISH]
§6`) and restores both maps. What sees the world mid-command: nothing outside the reducer — `reprojectRoster`, the
Tracker bridge and every subscriber run at phase 8/9 on the finished state; `ID_BY_CS` is rebuilt inside the reducer, so
a later step of the same reducer sees the freed callsign (the plan's order — mark, index, account, days — is right). A
storage quota failure at phase 8 after the seal leaves memory correct and storage behind — the same exposure every
command has today; not new. **I found no atomicity hole beyond F4's missing enlistment.**

**4. The past keeps its record.** `attrsOf` (§4.4): holds with F8's unconditional form. `snap.ros`: drawn, not compared
(`faceattrs.ts rosterShown` keeps every id that still resolves — he does). The Available crew on an issued face reads
`rosterShown()` — as issued. The pending list's "no longer on the roster" line fires only when `PEOPLE[id]` is gone —
never now. The OIL pass's reverse sweep: `desired` still lists him for dates before his date (F1's dated `creditable`),
so past credits stand; `protectedDates` unchanged. `rowInWindow`: right with F6. The OIL tracker: F6. **What DOES make a
day he flew read pending: F1 (the crowd) and, until F8, the attrs on any day.** Nothing else — the warnings axis
(`warnDelta`) keys warnings by person id with callsigns keyed out, so his kept `cs` reads the same.

**5. The outcome pass and #444's code.** `poDone` is sound beside #444's `postOut` / `undoPostOut` /
`restoreArchivedPerson` / `archivedBy` IF the delete sets `archivedBy` to something #444's two tests do not read as
"the Post out's own" (`'del'`, say) — otherwise `undoPostOut` restores a deleted man (F3). Walked: Overseas for a date
to come → the date arrives (archive + suspend, `poDone`) → the admin Enables by hand (`offBy` cleared) → the pass does
not re-suspend (`poDone` equal) ✓. The admin changes the outcome after the date (Overseas → SANS): `postOut`'s take-back
un-archives and un-suspends (`offBy === 'po'`), `poDone` cleared, the pass ticks SANS at once ✓ — state that
`restoreArchivedPerson`'s Enable half must NOT fire here (a take-back is not "he's back"; no prompt). Undo post out after
each date: Overseas → restore + enable + prompt ✓ (the plan says the prompt is Restore's; Undo post out IS
`restoreArchivedPerson` on #444 — so the prompt fires from the war too; say so on the roll-call #2); SANS → tick taken
back if `sanBy === 'po'` ✓; Delete → must refuse (F3). A posting's date moved later after it ran: `postOut`'s existing
rule (line 1465: `localToday() > addDays(from, -1)`) un-archives when the new date is still to come ✓ and must extend to
the suspension and the SANS tick — the plan says so; also clear `poDone` in `setPostOut` itself, not only in `postOut`
(the drag door and the sheet's date box reach `setPostOut` through `postOutOr` → `postOut` — fine — but `setPostIn`
does not clear it and need not). SANS with Show SANS toggled either side of the date: OFF → projection drops him, the
keep rule shows his old place greyed with the tag ✓; ON → in the SANS group, window not laid ✓; ON before the date →
he is a non-SANS aircrew until the tick, then his whole row moves — ✓ as the plan states. **Found nothing else.**

**6. Permissions.** `cmdAuthorize` refuses `person.delete` to anyone without `Person D` (member, guest, pending, off:
none hold it — `PERMS` read); `person.rename` rides `people.edit` with `own: required` and the archived man's id as owner,
which a member's `personId` never equals, plus `mayRenameCallsign` (admin) ✓; `person.restoreAs` must be declared with
`own: 'never'` (a member holds `Person U own`) — say it in §12. A hand-made call from the member view: `deriveActor()`
reads `SESSION.role` → member → every gate above applies; `ownershipViolation` treats him as a member; the war's
`state.role` follows `lwSetRole` → `setPostOut` refuses (`state.role !== 'admin'`) ✓. The page gates (`AdminPage
#admDeny`, `HOOKS.editMode`, the tabs) read `isAdmin()` / `canEditSched()` → the session role ✓. The bell:
`currentAdminAccountId` reads `isAdmin()` → dark in the member view ✓. Undo: `mayReverse` reads the live actor ✓ (F12
wording). Decided outside `perms.ts`: nothing new — `mayViewAsMember` reads `SESSION.acct` inside `perms.ts`; the
switch in `store.ts` must not read `SESSION.role` (the scan) — the plan says so. The §11 edits: `User` C R U D ✓;
add to §11's `Person` note "deleted with the hidden mark (D290)" and to `LeavePersonProfile` the outcome — the plan has
both. **I found no door a member, guest, pending or suspended session can reach.**

**7. The callsign rule.** Writers of `ID_BY_CS` on `main`: `engine/people.ts` line 261 (module init), `state/persist.ts
hydrate` line 68–72, `state/people-settings-commit.ts restorePeople` and `rebuildIdByCs`, `engine/slots.ts
renameCallsign`, `state/roster-add.ts putNewPerson`, `testing/refwin.ts` — six, all in the plan's list ✓. Readers of a
typed callsign: `nameToId` is called from `roster-add.ts newPersonProblem` and `UsersPanel.tsx rosterMatch` only; the
search box does not resolve names; `whoId` is the render-side resolver. So ONE `callsignProblem` + ONE
`indexCallsigns` cover every writer and reader ✓, with F11's length rule added. A legacy callsign STRING in a stored
`who`: `whoId(v)` → `PEOPLE[v]` misses → `nameToId` → the index → once the callsign is free and reused, the old row would
resolve to the NEW man. Such strings can exist only in data written before 14 Sep 26 (every writer stores the id since
ARCH-STACK 1C; the seeds store ids) — demo data, cleared: not a finding (D56), and I checked the seed weeks store ids.
`nameToId`'s id tolerance is the one thing to keep: `callsignProblem` must refuse a callsign equal to ANY id, deleted
included (the plan says so ✓).

**8. The Leave War side.** Keeping him as a posted-out row IS D299's "as a posted-out man's today" ✓ — with F6 so the
row knows. `setPeople` as the one place the SANS window is (not) laid: right — every reader of the window (`inSquadron`
in `availability.ts countsFor` / `availabilityOf`, `sync.ts availableFor`, `Matrix.tsx` lines 478/707/3342 for the grey
hatch and the sheets, `rowInWindow`, the OIL tracker through `displayRoster`) reads the LIVE person's `from`/`to`, which
`setPeople` writes; none reads `postOuts` directly. So not laying `to` for a shown SANS man changes all of them at once
✓. One caveat: `reprojectRoster` (sync.ts) copies `ex.to` from the CURRENT person, so after `setPeople` leaves `to`
unlaid the next re-projection keeps it unlaid — consistent, but the change-guard `sig` must then read the outcome (F10)
or a Show SANS toggle will not re-lay. **Found nothing else.**

**9. Missing from the roll-call.** Add: the search box (`#searchB`, a typed callsign — must not find a deleted man);
the CSV export and the print of a past day that holds him (kept — say so); the guest view on a past published day
(kept) and a day to come (without him); the day ⓘ panel's "free all day" on an issued face (`rosterShown`, kept);
the ALL AVAIL window opened on an issued face (his puck from `oilev.sent`, kept) and on the working copy (gone);
Undo post out on the war as a door to the back prompt (Q5); the drawer's account line in the member view ("· Member");
the Leave War's Legend / manning counts after the date (zero — `inSquadron`); Restore-as's second callsign in the
edit log and the toast; the Tracker Students `+ Add` picker (hidden — `projectForTracker` skips archived); a reload
between EVERY step of the Delete (the mark, the account, the stash, the war records, `poDone`); and the door check for
a hand-made call on each posting writer (F3).

**10. The build order.** Part A is NOT free of #444's files (F5). Building Part B on #444's posting code is sound —
`postOut` / `undoPostOut` / `restoreArchivedPerson` / `postingProblem` are the right seams and their take-back rule is
what §3 extends; F3/F10 are the additions. Merge order (this branch last, `main` in first) is right.

---

## For the owner — one word each

1. When a posting's chip is tapped off again, it is "off the manpower, nothing else" — no archive, no delete, no SANS
   (today's switch-off case, and the only way to record a transfer until Transfer is built). Keep that fifth state?
   **yes / no**
2. A man with no account who is hidden from the Leave War (a SANS man, Show SANS off) has no delete door. Add "Delete"
   on his row in Quals' Archived list (archive him first, then delete from there)? **yes / no**
3. When you press Enable on a suspended account whose man is still archived from an overseas posting, should the app
   also restore him to the roster and show the "he's back" prompt — or only let him sign in? **restore / sign-in only**
4. Archiving a man for an overseas posting makes the published days BEFORE the posting date read "1 pending" (his
   posting on the puck, and the crowd behind any ALL AVAIL puck he was in). That is today's behaviour. Keep it?
   **keep / stop**
5. "His place on a course still running — goes" is on your approved list; the Tracker has no "still running", so the
   plan leaves his name on every course, unlinked, and files the question. Defer it? **yes / no**

## Ranked list

1. F1 — past published days read pending through the crowd axis (`availableFor` must read `deleted` by date).
2. F2 — Undo/Redo can re-seat him on a day to come (belt at `schedStore.write` / `weekstashStore.write`; `restoreRefusal`).
3. F3 — posting writers and doors must refuse a deleted man (else Undo post out / Post out restore him).
4. F4 — the pass must be a projection with the mutation split from the user door, enlisting every store.
5. F5 — Part A touches #444's files (`inputedit.tsx`, `timeline.ts`, `undo-wire.ts`, `scheduler.css`).
6. F6 — the war's kept row needs a `gone` mark (`reprojectRoster` / `setPeople`) for the OIL tracker and F3.
7. F7 — no delete door for a hidden roster-only SANS man (owner question 2).
8. F8 — the pending list names a delete twice; make `peopleAttrsNow` skip a deleted man on every day.
9. F9 — `stashEditDays` cannot reach `dr`/`sg`/`sb`; add `stashEditBlob`.
10. F10 — #444's `reprojectRoster` sig / `setPeople` / `readPostOuts` must carry `poOutcome`/`poDone`.
11. F11 — `callsignProblem` needs the 14-letter rule (D226) for Rename and Restore-as.
12. F12 — the member-view Undo refusal's words.
13. F13 — the small invariants (last-admin body, `setEffectiveRole` comment, sign-box clear via `setSign`, plan gaps).
