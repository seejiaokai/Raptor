# Phase 2's helpers — the common brief and each helper's items (chat 127, 21 Nov 26)

Drafted by chat 127 for the reshape plan §10's phase 2. BRANCHNAME = the helper's short name (undo, session, war, schedule, ownpages); BASECOMMIT = the tip of `claude/multi-sqn-b1-107` when the helper starts. A helper can work in a git worktree of its own (the trial of 21 Nov 26 — Write, Edit and the shell all write there, no refusal), so helpers whose files are disjoint may run at once; the host merges each `claude/msq-b1-<name>` back into `claude/multi-sqn-b1-107`.

## How every phase-2 helper works (the reshape plan §10 — his D2244: Opus builds)

**The job.** You build one helper's part of the multi-squadron reshape, by its plan:
`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`. Read first: §0 (ground rules), §9 (the tests —
§9.1 red first, §9.2 setup-only changes, §9.3 rewrites to a ruling), §10 (file ownership — your files only; the order
inside phase 2), §11 (what a person sees — nothing new unless named there) and your own sections, named in your items
below. The plan's §12 says all eight of his questions are answered (D2239–D2243): build as answered.

**Your copy.** You are in a git worktree of your own. Start with:
`git fetch -q origin claude/multi-sqn-b1-107 && git switch -c claude/msq-b1-BRANCHNAME FETCH_HEAD` and check
`git log --oneline -1` reads BASECOMMIT (if it does not, stop and report). Then link the packages — never install them:
PowerShell `New-Item -ItemType Junction -Path "<your worktree>\raptor-port\node_modules" -Target "C:\Users\User\projects\Raptor-msq\raptor-port\node_modules"`.

**Read before you change anything:** `raptor-port/CLAUDE.md` (the project guide); the rulings pages of every area your
work touches and every area linked to it — `.claude/rules/decisions/people-accounts.md`, `leave-war.md`, `scheduler.md`,
`inputs.md`, `oil.md`, `tracker.md` as they apply (a page is the rule; before acting on a ruling's detail open its full
row: `grep -h '^| D2203 |' .claude/decisions-full/*.md` in the shell — the Grep tool hides a long row). Where the plan and
a ruling differ, the ruling wins: say so in your report.

**Your files only.** The core's files are NOT yours: `state/perms.ts`, `state/units.ts`, `state/units-model.ts`,
`state/accounts.ts`, `state/notices.ts`, `state/lastadmin.ts`. If your work needs a line there, do not edit them: stop
that item, and give in your report the exact line and where it goes — the core builder adds it. Nor another helper's
files (§10's table). Never edit `HANDOFF.md`, `OUTSTANDING*.md`, `DECISIONS*.md`, `.claude/`, or anything under
`raptor-port/docs/` except a test-free note the plan asks for.

**Red first (§9.1).** Every fault's proof is copied word for word from the repro brief folder the item names
(`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/` or `…/2026-11-20-msq-plan-audit-repro/`), only its
harness changed to `src/test-support/msq-world.ts` (or the harness file beside it). Run it on BASECOMMIT before your
change — it must be red, the controls green — and green after. Name both commits in your report. A test that rests on
two helpers' work is written by the job §10 names, never left red by you.

**Words and looks.** Nothing new a person sees unless the plan names its approved words or drawing (D1625). Where the
plan says a drawing is approved (D1478), build to it and check beside it (D1494): the drawings are in
`raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/`. Where a part would need words the plan does not give, use the
generic "This change could not be saved." and report it.

**Not findings, not to build:** a problem only in data already stored (D56); a scheduler who is not an admin (D785).

**Checks.** After each item: its own tests and every test file you touched; whenever you add or edit a source file,
the four that scan source text — `src/engine/inputs-readers.test.ts`, `src/engine/inputsfor-readers.test.ts`,
`src/engine/roster-readers.test.ts`, `src/state/perms-scan.test.ts`; `npx tsc -b`; `npm run lint:changed` (each from
`raptor-port/`). One or a few unit files need no lock. The full unit suite, or ANY browser (Playwright) test, only
through the shared lock, which waits its turn: `node scripts/gatelock.mjs exec "claude/msq-b1-BRANCHNAME — <what>" --
npx vitest run` (from `raptor-port/`, timeout 600000, in the background). Before you stop: the full unit suite once
through the lock; report its counts (one known red stays: `multi-sqn-fixread11` F11-4, owed to "undo & roles" — say if
yours touches it).

**Shell traps here:** a guard refuses `sed -i` on tracked files and any typed script holding a backslash — change files
with the Edit or Write tool, or write a script file with Write and run it. In a JS edit script use
`s.replace(a, () => b)`, never a replacement string.

**Commits.** Commit on your branch as you go, messages in plain words, each ending with the line
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push your branch only, alone in its own command:
`git push origin HEAD:refs/heads/claude/msq-b1-BRANCHNAME`. Never push to `main` or to `claude/multi-sqn-b1-107`; never
open a pull request; never merge.

**Stop when your items are built and checked.** Your final reply is your report (not a file), starting with the token
HELPER-BRANCHNAME-DONE: per item — what you built, the files, the proof's red and green commits; the tests run and their
counts; every line you need from the core (exact); every word a person sees that you used and where it came from; what
is left and why. Under about 1,200 words.

## ITEMS — helper "undo & roles", first pass (branch `undo`)
Your files (§10, §3.6): `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, `command/commit.ts` (its key hook),
then K4's: `engine/mission-role.ts`, `engine/insights.ts`, `state/mission-roles.ts`, `state/persist.ts` (the mapper
line), `state/changelines.ts`, `ui/mission-role-offer.ts`.
1. **A-v first** (plan §3.2 "A-v. Every Undo step carries its squadron", with §16–§18's rows that name A-v — Fable F2,
   Fable 5, Astra 3, Fable 4, Opus 5, Opus 6): the stamp on `lw.*` and `trk.*` steps only; their key
   `<collection>/<unit>@<id>` in the revision counter, `revs` and `recordKey`; `lwx.profile`, `lwx.ledger` and `lwx.rec`
   keyed as the war's own records; `verifiedWarRestore` and `carrySeen` on the qualified key; a step checked at
   selection and again before the restore; a step in a world he can no longer enter passed over, and a step sharing a
   key with one he can no longer reach blocked for good in today's sticky words. Its tests (§3.4's A-v list) — and §10's
   "a 149 posting, then Kestrel's Undo of setting it: refused as a later change", through an Admin → Users door.
2. **Then K4 + B5** (plan §7): the blue/red answer's change id carries its squadron (`<unit>@<encodedRoleId>`), the
   `persist.ts` mapper writes `ensureUnit(id)`, no stored key moves. Proofs `r-k4-mission-role-crosses-squadron` and
   `b-b05-role-undo-after-pick`, red first; K4's tests add Hunter with View and with Plan (§19b R11).
NOT in this pass: the per-record store for the planning record (waits on helper "session"'s stored half) and Piece B's
restore lines (the leave-out wiring, F11-4) — a later pass of yours.

## ITEMS — helper "session" (branch `session`)
Your files (§10, §3.6): `boot.ts`, `state/store.ts`, `state/sched-commit.ts`, `tracker/storage.js`,
`tracker/TrackerPage.tsx`, the Tracker load files step 0 names, `state/plan.ts`, `state/plan-foreign.ts` (new),
`state/person-delete.ts`.
1. **Read the Tracker's load path first** (§10's row; §3.2 A-iv, F9) and name its files in your report.
2. **The routed planning writer** (§3.2 A-ii — the planning calendar's record by the page's squadron): `sched-commit.ts`'s
   `plan` case and its stored half, which loads the ids it will write before it joins. Commit it on its own (helper
   "undo & roles" and helper "own pages" build on it later).
3. **B1's strip** (§6.2): a delete takes the man off EVERY squadron's planning calendar, inside the delete's own command,
   rolled back whole on a refusal (`person-delete.ts`, `plan-foreign.ts`). The gate's half is built (`perms.ts`
   section 7's `deleteStripsOnly` — its test `state/delete-strips-other-calendar-gate.test.ts`). Proof
   `b-b01-delete-other-sqn-calendar`, red first.
4. **`store.ts`'s input callers on the day** (A-i, "first day", F4).
5. **`enterSquadron`** (§3.2 A-iv): one entry for the open page — the pick rule, the Tracker rebind, its band slot (the
   band itself is phase 3), **the midnight trigger OFF** (switched on in phase 3, after "undo & roles" merges), its hold
   answering "none".
NOT now: the midnight swap on, the band, `typing-hold.ts` — phase 3.

## ITEMS — helper "war" (branch `war`)
Your files (§10): `leavewar/sync.ts`, `leavewar/state/store.ts`, `raptorRoster.ts`, `foreign.ts`, and the Leave War
row files A1's drawing needs (name them in your report). The core's last change to `sync.ts` is Archive's lock words
(`archiveLockWords` → `lastAdminIfGone`) — keep it.
1. **A1 with A7's probe, one tested change** (§6.2; §11 A1's and A7's rows; the approved drawing, his D2243 Q6 —
   `docs/mock/2026-11-20-multi-sqn-reshape/`): each war counts him only inside his squadron stints (`stintsOf`), kept
   apart from postings — his old squadron's row striped from the move day in the war's existing "away" look, the new
   war's before it, no "PO", no posting tag; install `setLwManDayProbe` (perms.ts, built) so a war's change to a man's
   day not its squadron's only removes (D2243 Q3 — refused for everyone). A7's Undo sentence beside the probe, as
   approved: "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War." (said through the timeline's
   `restoreRefusal` hook by "undo & roles" later — you provide the sentence's function and its test of the words).
   Proofs `a-a01-move-both-wars`, `a-a07-old-war-writes-after-move`, red first. The drawing check (D1494) beside the
   drawing at his iPhone's and a desktop's size: report each difference over about 2px.
2. **A5's caller** (§6.2, on phase 1's gate chain — `setLwxPostingProbe` to install, `adminsOf`, PC1): both halves of a
   foreign Delete, owed work, the coalesced run after accounts, people, homes or rights change, one posting per command
   and a refused one given up for the session, a moved man's posting skipped by both passes, no passing note from the
   foreign half, the run typed `lw.postoutRun`, `adminsOf` with today for both passes and `ownSchedulerIds`' other
   readers. Proof `a-a05-other-sqn-posting-waits`, red first; PC1's gate test through a real posting line.
3. **A6** (§6.2): the "posting could not run" note reads the man's own squadron's posting. Proof `a-a06-held-note-other-sqn`.
4. **PB1, PB2** (§19): the posting take-back and the "off the manpower" line for every reader in `adminsOf` (a Plan
   holder included) — the loaded war's from its postings, another squadron's through `readForeign`. No repro file: write
   each proof yourself, red first.
5. **`oilOpenOn` by day, and the today readers §6.2 names; the flying plan's calls the inventory names.**
NOT yours: A4 (phase 3, core).

## ITEMS — helper "schedule" (branch `schedule`) — drafted by chat 128
Your files (§10, §3.6): `engine/faceattrs.ts`, `engine/avail.ts` (one call), `engine/publish.ts` (`snap.ros`, `signPeople`),
`engine/validate.ts` (`issuedRoster`), `engine/overlay.ts` (renamed calls, first day), `engine/weekstash.ts` (C8),
`engine/editlog.ts` (l.449), `state/holderbase.ts` (renamed, first day), `ui/html.ts`, `ui/palette-html.ts`,
`ui/interactions.ts`, `ui/inputedit.tsx`, `ui/PeoplePick.tsx`, `ui/peoplepick-model.ts`, `ui/InputWindow.tsx`,
`engine/drafts.ts`, `engine/oilev.ts`, `engine/slots.ts`, `engine/weekctx.ts`, `ui/oilputback.ts` (renamed calls only), and
the demo seed's placeholder inputs (name the seed file in your report). `src/engine/` bodies are verbatim ports: change only
the multi-squadron lines §0 names. The original's 728 stay 728/0 (`node reference/tfin.js`).
1. **A-i's callers on the schedule side** (§3.2 A-i, A-iii): each call to `inputsFor`/`inputBelongs` in your files moved to
   `inputsOnDay`/`inputOnDay` with the day it means; the landing and accepted-mark writers keep the first day (F4 — a
   writer never iterates "touches"); `engine/editlog.ts` l.449 the line's own date, today when it has none.
2. **C4** (§3.3): `rosterIds(iso)`, `rosterShown(iso)`; `avail.ts availByWave` passes its day; `publish.ts` freezes
   `snap.ros = rosterIds(dayIso(CURWEEK, di))`; `validate.ts issuedRoster` reads each unpublished day's own list. Proof
   `c-c04-free-all-day-reads-today`, red first.
3. **C5 with R8** (§12 Q2 — D2243; §19b R8 — D2245): `signPeople` offers the day's own people
   (`rosterOf(UNIT, dayIso(CURWEEK, di))`); SKED CK, PLANNED BY and APPROVED BY then offer, after them, an admin holding
   Plan of the squadron while his Plan holds that day, and a master admin, each carrying the Scheduler tick; CUR CK stays
   the day's own people. Proof `c-c05-sign-boxes-read-today`, red first; R8's cases written by you, red first.
4. **C3** (§12 Q1 — D2243): filing stamps `u` on a placeholder-only input (ALL AVAIL / ALL) — `InputWindow`'s save and the
   demo seed's placeholder inputs; the reader (`inputSquadrons`' placeholder branch, core, built) honours it. Proof
   `c-c03-allavail-follows-filer`, red first.
5. **C6** (§3.3; §11's C6 row; §12 Q8 — D2240, D2241): the picker and the save door on phase 1's `inputWhoProblem`
   (`perms.ts`, built — with `inputWhoProblemNow` for the doors): a man is offered where the draft with him added passes;
   the save door asks before the gate, and an existing input's save too; asked again when the draft's dates or people
   change; `rosterOptions(unit, iso)`, `archivedOptions(unit, iso)`, `pickRoster` and `PeoplePick` take the draft's first
   day; the board's reassign pool (`interactions.ts` l.1343) passes its day. The refusal's words, approved: "Not saved:
   Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his
   move." — built to the approved drawing in `docs/mock/2026-11-20-multi-sqn-reshape/` and checked beside it (D1494) at
   his iPhone's and a desktop's size; report each difference over about 2px. Proof `c-c06-pickers-read-today`, red first;
   §3.4's table of actor × span × move.
6. **C8** (§7): `weekstash.ts stashDays` passes `qk(v)` to `viewOfWeek`; the bare week only for `weekBundle`'s dates.
   Proof `c-c08-stash-qualified-key`, red first.

## ITEMS — helper "own pages" (branch `ownpages`) — drafted by chat 128
Your files (§10, §3.6): `ui/InputsPage.tsx`, `ui/InputsCal.tsx` (its calendar part LAST — see 4), `ui/QualsPage.tsx`,
`ui/MedicalView.tsx`, `ui/SansCal.tsx`, `ui/SansDay.tsx`, `ui/sansadd.ts`, `ui/oilday.ts`, `ui/OilDayList.tsx`,
`tracker/peoplewire.ts`, `state/flyplan.ts`, `state/flyplan-model.ts`, `engine/qualcols.ts`.
1. **The own-page setting inventory, read only, FIRST** (§3.2 A-ii, "Own-page settings"): every reader and writer of a
   unit setting (`storage/keyowner.ts UNIT_SETTINGS` and its prefixes) outside the schedule pages' files — file, line, the
   setting, read or write, and its owner by §10 (yours; helper "war"'s for the flying plan's calls in `leavewar/sync.ts`;
   the core's or helper "undo & roles"' for `perms.ts`/`undo-wire.ts`). **Stop after the inventory and report it,
   starting with `HELPER-ownpages-INVENTORY:`** — the host checks it before anything moves and continues you.
2. **A-ii's callers in your files** (§3.2 A-ii): each own page reads `pageUnit('own', today)` where it read `myUnit()`, and
   reads AND writes its settings through `unitSetting(pageUnit('own'), name, …)` (B4 — `engine/hooks.ts`, built). A
   reader that gains a squadron argument keeps its old form beside the new until phase 3. The guard test: a plain-name
   read or write of a unit setting outside the schedule pages' files fails. Proof `b-b04-own-pages-follow-pick` (its
   own-page half — the core's `membersFileOn` half is built, `state/memberfile-own-unit.test.ts`), red first.
3. **C2 and C11** (§3.3): his own Inputs page lists `inputsListed(unit, pid)` (C2); the Inputs page's filter, rows,
   deleted and archived groups read `pageUnit('own')` and `inputsTouching` (C11, C1's list half — never a writer). Proofs
   `c-c01-leave-across-move-lists` (its list half), `c-c02-own-input-after-move-vanishes`,
   `c-c11-inputs-filter-other-squadron`, red first; §3.4's `pageUnit` rows for the own pages.
4. **LAST, only once helper "session"'s routed planning writer and helper "undo & roles"' per-record store are merged
   into the branch** (§3.2 A-ii, "The Inputs calendar"; §10): the Inputs calendar's notes, day titles, their edits,
   change capture and Undo by `pageUnit('own')`; §3.4's planning-calendar test through the Inputs calendar's page.
NOT yours: `ui/oilday.ts`'s A4 lines (core, phase 3) — leave its holiday code as it is.

## ITEMS — helper "undo & roles", second pass (branch `undo2`) — drafted by chat 129
Your files: as the first pass (`state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, `command/commit.ts`'s key hook,
K4's list with `state/changelines.ts`). Every phase-2 helper before you is merged: "session"'s stored half
(`state/plan-foreign.ts`), "war"'s A7 sentence (`leavewar/sync.ts warDayRefusal` / `warDaySentence`), the core's Piece B
with `perms.ts restoreLeavesOut` and its probe setter `setRestoreGrantCtx`. One test is red on BASECOMMIT and yours to
turn green: `leavewar/multi-sqn-fixread11.test.ts` F11-4. In this order, each its own commit:
1. **The planning record's per-record store** (§3.2 A-ii "The Inputs calendar", its "Through Undo, in both directions";
   §10's ordering): the timeline picks the store per record — a `plan` record (`plan/<unit>@pp:<id>` or `@dm:<iso>`) of a
   squadron not loaded goes to `storedPlan(unit)` (session's: `load`, `join(txn, locals)`, `write(entries, {restore: true})`),
   enlisted as its own store; the loaded squadron's stays with the schedule store, as now. Its tests (§3.4 "The planning
   calendar's one identity", both directions — yours at this commit, through the store layer; the same through the
   Inputs calendar's page is "own pages"' last item): a note edited on 142's calendar while 149 is picked, then 142
   loaded, then a newer edit, then Undo — refused as a later change; edit, load, Undo, Redo, reload — the stored copy, the
   loaded calendar and the screen's data agree; and a 142 plain admin with View of 149 picks 149 (`switchUnit`) and edits
   an existing note of 142's (not loaded) — a change, its before-image the stored note — Undo: the note as it was, stored
   and cached; Redo; a restore refused part-way leaves the stored and cached copies untouched.
2. **Piece B's restore lines** (§4.3 "At the restore", "A step the leave-out empties", "At the gate"; §4.4; §10's
   two-job tests): `restoreLeavesOut` wired into the timeline's `leaveOut` hook (which already leaves out a bell line put
   back to no one, D2218); the man and the link day of each grant row's account a step touches recorded on the step as it
   is recorded (asked once, kept on the entry as `closedAt` is), the hook handed the restore's other changes and
   `stoodBefore`; the gate's probe installed (`setRestoreGrantCtx`) from what the step recorded; and `master` passed
   (whether the person pressing Undo or Redo is a master admin) — the body's rule 4 (chat 129, his D2250): a Plan row is
   put back only by a master admin's restore. A step the leave-out empties commits nothing and is blocked for good in
   that direction (`sayBlocked`), in today's words "Something else changed this after your action — it can’t be undone
   now." Tests through the real Undo and Redo: §4.4's re-link and guardrail-2 cases; F11-4 green; and **D2250's Undo**
   (red on BASECOMMIT — the Undo is offered, labelled "Hunter’s role", then fails "That couldn’t be completed just now."):
   Saber gives Hunter Plan of 149 and makes Ranger an admin; Ranger makes Hunter a member, presses Undo — Hunter an admin
   of 142 again, no Plan of 149; Redo — a member again; the same three by Saber — his Undo puts back the role and the Plan.
3. **A7's line** (§6.2 A7; §10 "A7's Undo sentence through the top bar's Undo"): the timeline's `restoreRefusal` hook in
   `state/undo-wire.ts` answers with `warDayRefusal(changes)` beside its other refusals, so an Undo that would put an
   entry back on a day now another squadron's says war's sentence before anything is written; removing one entry of a
   two-entry cell, or its last entry, still passes. Its test through the top bar's Undo, red first.
4. **A Quals change worded with the right columns** (`state/changelines.ts`, the `qualCols()` loop of the person lines):
   Quals is an own page (A-ii), so a tick is named by the man's own squadron's columns (`engine/qualcols.ts qualColsOf`),
   never the pick's. Red first: a master admin picks 149 (whose Quals columns differ) and reads the line of a 142 man's
   Quals change.
5. **An own-page step's Undo while another squadron is picked** (§3.2 A-v "Eligibility": "In view" is the pick on
   schedule pages, `pageUnit('own')` on own pages): `inUnitView` lets a step whose ids name his own page's squadron be
   taken while another squadron is picked. Red first: a 142 admin with View of 149 picks 149 (`switchUnit`), changes a
   142 own-page setting (Quals' columns), presses Undo — taken; a 142 schedule step made before the pick — passed over,
   as today; a master admin who picked 149 and changed 149's Quals — taken.
NOT in this pass: the Inputs calendar's page ("own pages" item 4, after you); the midnight switch (session, phase 3).
