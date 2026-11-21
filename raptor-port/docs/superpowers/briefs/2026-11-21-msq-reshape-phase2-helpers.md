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
