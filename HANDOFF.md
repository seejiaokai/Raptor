# HANDOFF — where things stand, and what is next

**A new chat reads this first.** It is the ONE handoff (D140, 24 Sep 26): `## Now` holds one block per open chat's
branch — where it stands, what it left, what to do next — and `## Next, in order` is the project's order; below
them, the standing facts. It holds CURRENT state only: a finished story is in git and, when a whole section left,
in `raptor-port/docs/archive/` (the 4 Sep 26 snapshot of this file is `HANDOFF-ARCHIVE.md`, frozen); open work is
in `OUTSTANDING.md`; where each kind of fact goes is `.claude/rules/doc-structure.md`, loaded in every chat.

**Before acting on a block:** `git fetch`, then check the branch and PR it names — it describes the world when it
was written. Never push while a PR's checks are running (D151) — a push starts two runs, so read them all: `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`, none of the last pushed commit `queued` or `in_progress` (D870).
Bring the checkout level BEFORE reading this file: a chat continuing a pushed branch runs `git pull --ff-only`; a fresh
worktree has no upstream, so "git pull" pulls nothing there — `git fetch origin`, then `git merge --ff-only origin/main`.
List the live chats (`ListAgents`): if the one that wrote
the block is still running, or another already holds the item you were told to start, message it and agree who owns
each remaining step before touching anything. If your opening message and the block's "Opening line" or "Pick up
here" differ, name the difference to him and ask before starting.
**Writing a block** (the session-handoff skill does it, at every handoff): rewrite ONLY your own block, between its
markers, even when nothing is pending; newest block first; remove another chat's block only after `git fetch` shows
its work merged and its open residue is filed in `OUTSTANDING.md`. Two parallel chats each keep their own block, and
the later merge keeps both (D78).

## Now
<!-- now:claude/chat22-rd-last-findings -->
### `claude/chat22-rd-last-findings` — chat 22: React Doctor's last findings in People & accounts ([RD-LEFT-1108] parts 1 and 2), written 8 Nov 26 — verify before use
- **Where it started:** chat 21 (coordinator, `local_242a19d5-fb7e-45dc-aea3-ddffcd800a46`) gave this job on his word of 8 Nov 26: part 1, the 13 import cycles through `raptor-port/src/state/people-settings-commit.ts`; part 2, the 6 findings in `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `ui/AccessScreen.tsx`. The other 12 of `[RD-LEFT-1108]` ride their own areas' batches. Report to chat 21, never chat 3. Rulings range D1910–D1919 (none used). He was told the tier: FULL (saved data, sign-in and permissions code).
- **Shipped:** part 1 — PR #702, open when written; first run in progress at handoff. The save layer imports none of the files that save through it; `state/people-settings-wire.ts` (new) registers it at start-up (`state/store.ts` wireStore), handing in the four loaders a rollback or undo re-runs and the command types. Red first: `state/people-settings-wire.test.ts` (the break red on `main`; each loader and every type pinned, green on `main` and after). React Doctor 0.9.18 fresh run 421 → 408, no import cycle left. Chat 13 told of the one changed import line in `store.ts` (D302). Skill notes 889 and 890 (chat 21's, from `claude/chat21-skill-note`) appended whole at the log's end.
- **Unfinished:** (1) part 2, the 6 findings, not started: `UsersPanel.tsx` 84 (a label not tied to its box), 257 and 344 (two over-long functions), `AdminPage.tsx` 91 and 104 (labels), `AccessScreen.tsx` 176 (autofocus) — each fixed, or kept with a written reason on the line (D1534, D1572); first ask whether a fix adds anything he will see (D1625). (2) The FULL check for both parts, nothing of it done: lay down the evidence sheet `raptor-port/docs/handpass/2026-11-08-rd-last-findings.md` (the checklist's step 4), roll-call, size the walk, the walk on his PC through the checks lock (Sonnet walkers; the plain-user round, D1557 — People settings save, Admin → Users, signing in and out, the bell's read marks, the change history's seen marks, the flying plan, an undo of each), Astra's read beside a fresh blind Opus read, a security read (D1411). (3) Not flagged by React Doctor and not this job's to fix — for the reads to weigh: the save layer still imports the command layer, whose actor reads `state/auth.ts` → `state/perms.ts` → `state/accounts.ts` → the save layer; `perms.ts` ↔ `auth.ts` likewise.
- **Branch:** `claude/chat22-rd-last-findings`; its PR #702; released here (`git switch --detach`). Its upstream is `origin/claude/chat22-rd-last-findings` — never `origin/main`.
- **Gates:** `npm test` — the three save-layer files only, 22/22; type check `npx tsc -p tsconfig.app.json --noEmit` clean (proved to catch a planted error); `npm run lint:changed` no new finding; `npm run docsize` OK; GitHub's run of #702 at `25bae6081`: every job green but one unit test, `state/stores-boot.test.ts` (it read the loader list by its old name) — fixed in the handoff commit and passing locally; the run on that commit is the one to read; `npm run build`, `node reference/tfin.js`, e2e, probes, perf not run here (the checks lock was held by chat 16).
- **Open questions for him:** none.
- **Running when written:** GitHub's run of #702 (nobody watching; Auto-fix found on and switched off, D1090). Nothing else.
- **Pick up here:** read #702's run; then part 2, then the FULL check by `raptor-port/docs/bug-check-checklist.md`. On his "merge live" typed in that chat: `shipping.md`'s four merge-lock steps, then `main`'s run and the Production deployment Ready.
- **Opening line:** see the next chat's first message — "25 · React Doctor's last findings (continued). Switch this chat to the branch `claude/chat22-rd-last-findings`: …"; the new chat is chat 25 (D1744; 23 and 24 are taken).
- **Also open, waiting on their own chats (no block here owns them):** none beyond chat 21's list — #698, #696, #694, #691 are its chats'.
<!-- /now -->
<!-- now:claude/coordinator-2 -->
### CHAT 21 — coordinator after the pictures round (took over chat 3's job, 8 Nov 26 ~14:40, on his ask; D1744); written 8 Nov 26 — verify before use
- **The pictures round (D1780–D1793):** groups 1, 2, 4, 5, 6 and 7 live (chats 11, 5, 6, 7 → 18, 8, 9 → 10 — pull requests 689, 679, 678, 676, 680, 687; their records too). **In hand:** group 3, the schedule's marks and words (chat 13, pull request 691). Build plan `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`. Every finished job had Astra's read beside a fresh Opus read; none is on the reads-owed list.
- **This block replaces chat 3's** (it held D1780–D1797; its notes pull request 695 — D1797, the cloud-walk trial dropped, [CLOUD-WALKS] archived — rides this branch's pull request, `main` brought in twice, rulecheck, docsize and the 13 unit files that read documents green first). The blocks of chats 15, 10, 5, 11, 8, 18, 2 and the morning records were removed here: their work is live and each one's residue is filed (checked 8 Nov 26).
- **Chats reporting here now (told 8 Nov 26 ~14:40):** chat 13 (`local_24807c39-55ee-4b38-9fde-334f7958b596`, 691); chat 16, the Leave War pinned row for keeps (`local_c39c4aec-e234-4148-bfa0-426d0ba8b1ad`, 694 — parked on his iPhone feel of https://raptor-git-claude-lw-pin-last-frame-kai-e2f5.vercel.app; **694 clashed with `main`, so GitHub ran no checks on its last commit** — told to bring `main` in); chat 19, the checks (`local_d627ec59-1133-4fd0-ab78-dc53131847ea`, 698); chat 20, the Tracker's small batch (`local_da527aaa-3f87-4613-bb5b-795862ad49f9`, 696 — walk 90/90, Astra nothing, the second read and a questions page going). Chat 17 (the rules diet's People page) is not this chat's.
- **Merging:** D1795/D1796 cover only the jobs chat 3 started, and the app refuses a merge on his word relayed by another chat — each chat asks him to type "merge live" in it; no chat merges another's job. Starting a chat needs his words typed at the PC. Walks stay on his PC, one at a time through the checks lock (D1797's trial dropped).
- **Next, waiting on his word (recommended, not started):** chat 22 — React Doctor's 31 left ([RD-LEFT-1108]): the 13 import cycles through the People-settings save and the 6 in Admin → Users and the sign-in screen; re-checked 8 Nov 26 ~14:45 that no open pull request's branch (691, 694, 696, 698) nor chat 17's touches those files — check again before it starts; tier WALK at least, Astra plus a fresh Opus read, a security read (D1411). Then, once the Leave War pinned row is done, [LW-FULL-EDITING] (his D1724), drawn first. A second pictures round only on his word (D994); [REPO-TIDY] once today's chats have finished.
- **Open:** the compaction guard back to `--back` when he is back (`node "$(git rev-parse --show-toplevel)/.claude/hooks/compact-ready.mjs" --back`). The skill-notes log holds 128 open notes, last reviewed 27 Oct 26 (847–849, 853, 858 and 861 among them) — a review is a job of its own, offered to him. Weekly allowance 62% used at 14:45, resets Mon 9 Nov 26 about 19:00 (D1033: his aim is to use it). The next new chat takes 22. Skill note 887 (chat 21) waits on the pushed branch `claude/chat21-skill-note` — the skill log is not on the notes-only list, so the note rides the next pull request that goes on his "merge live" (chat 22's, cherry-picked).
- **Rulings:** none in chat 21 (chat 3's D1780–D1797 are recorded).
<!-- /now -->
<!-- now:claude/m365-it-answers -->
### `claude/m365-it-answers` — chat 4 (D1744): the IT side's written answers folded into the database plans — MERGED 8 Nov 26 (pull request 662, on his "merge live"); written 8 Nov 26 — verify before use
- **Where it started:** `main` at `9b42a96b6` (chat 1's pull request 661 merged). Notes only, no app change: the IT side's written reply of 8 Nov 26 to the 12 questions (no names, on D1748) in `OUTSTANDING.md` [IT-QUESTIONS] — with pointers in [DB-SECURITY-ROLES], [AIRCRAFT-TYPE-SETTING], [MULTI-SQN-DESIGN] — and folded into `raptor-port/docs/data-model.md` (head note, Attachment, Squadrons, §9 rule 8 and the change log, §11, §12), `raptor-port/docs/handover-dataverse.md` and the M365 move plan (head, points 2, 19, 24, 35, 36, §4, §5, §Platform flags). Chat 1's block was removed (its work merged); its open points are below and in [IT-QUESTIONS].
- **What the answers say, short:** our `tables.json` in their kit's format is accepted; the PP CoE has ONE production environment for code apps, sets the short code and builds from our final `tables.json` (his test tables are for testing only — D1749); access is one security group, and who may do what is the app's own roles, not the database's; only M365 services (Power Automate, Teams); large files in SharePoint with a link; flows run by themselves under a unit role-based account; auditing is on. Answer 2 (pasted after the rest): a simple "who is editing" field, cleared once saved, not a hard lock — he sent it again as his own answer: **D1751** (replaces D450; what D450 left behind fixed in this branch). Unique keys and change tracking "not sure".
- **Waiting on:** (1) **another IT person's answers** (he said so, 8 Nov 26) — pull request 662 merged without them, on his "merge live" of 8 Nov 26; when they come, a new chat folds them in on a fresh branch from `main`, the way this chat did; (2) D1101 (a database per aircraft type) meets one environment — recommended: no change now, the F-15 squadrons first, settled when a second type joins; he asked how another squadron's different rules would work — answered: each squadron's rule settings are its own rows, and one code base picks each type's quirks by its aircraft-type setting (D1100), so either choice handles it; (3) D1653 (security roles IT enters) rests on database rights the IT side keeps — recommended: follow their advice, the app's own roles. Next free ruling number D1754, every branch checked first.
- **For IT, when he likes (D1745):** a version 3 of the questions, 6 short ones, kept with the package on his PC (`Questions-for-IT-v3.txt`), never in this project.
- **On his "merge live"** — the D1746 merge-lock steps, each command whole on one line, the Bash call's timeout 600000: (1) `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs take "claude/m365-it-answers — merge <PR>"`, going on only once it prints `gatelock: taken`; (2) `git fetch origin main claude/m365-it-answers`, then `git merge-base --is-ancestor origin/main origin/claude/m365-it-answers && echo level || echo behind` — behind: release, and once no run of the branch is going (D151) bring `main` in, wait for that run to pass, start again at (1); (3) level and green: `gh pr merge <PR> --merge`, never `--auto`; (4) release only a lock you took: `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs release`; then confirm `main`'s run.
- **Next:** nothing is built before the database step (D473, D1682 — his test account is not ready). At that step (D1749): the app and its tables first into his test account, built with the IT side's kit, set up to match theirs (one security group, no outside connectors), and there proved: a fixed id refused twice, the version check on a save, the change log read without change tracking, SharePoint from the app; then the table list to IT.
- **Chat numbers (D1744):** this is chat 4; 5 to 14 were taken by later chats — read the open chats' titles for the next free one.
- **Rulings:** D1751 (the day lock a simple mark; D450 replaced and archived); D1752 (Admin → Data's "Clear edit history…" removed at the database step; D351 replaced and archived; filed under [DB-STEP]); D1753 (his test tables use the short code "talon" for now; question 1 of version 3 reworded to tell the IT side) — each short line read against its full row by a fresh reader (D138), D1752's corrected on that read. Compacted once, 8 Nov 26.
<!-- /now -->
## Next, in order

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three; each step on his "merge live" (D1737).

*(The "RIGHT NOW" lines of 6 Oct to 5 Nov 26, with his two words of 12 Oct 26 (D774, D775 — rulings in `how-we-work.md`) — all done, live or filed — are in `raptor-port/docs/archive/handoff-right-now-2026-11-07.md`, moved whole on 7 Nov 26; more of 13 to 20 Oct 26 in `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`.)*

0. **THE DATABASE COMES AT THE END (D473, 1 Oct 26 — replaces D354's "starts now"):** the app's features are built first; after
   phase 7 no more database-readiness work until then; the table list (`raptor-port/docs/data-model.md`) is kept up to date as
   each feature is added, and he — with his AI — writes the table format for the IT side to enter. `[WARN-HIDE-KEPT]` is BUILT, FULL-checked and MERGED (1 Oct 26, PR #478); `[INSIGHTS-WHICH-COPY]` (D477, D478) BUILT, WALK-checked and MERGED on his "merge live" (1 Oct 26, PR #479). **Next (D483): `[WORKSPAN-NEGATIVE]`** — the negative work-hours fault, in a fresh chat, with the second Sonnet-walker trial on its walk (D480); then `[INSIGHTS-BOARD-DOOR]` (D481).
   *Done while the step was "starting now" (29 Sep – 1 Oct 26):* `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL check done (the walk and both code reads, every finding fixed); phase 6 (a), (b), (d) built and FULL-checked 30 Sep 26 (`raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`); phase 6 (c) v3 built and FULL-checked 1 Oct 26 on `claude/db-readiness-p6c-holder-base` (D467 — `…/2026-10-01-dbr-phase6c-check.md`) — phases 0–6 MERGED 1 Oct 26 on his "merge live" (PR #476); phase 7, the small OIL follow-ups, BUILT and FULL-checked 1 Oct 26 (`…/2026-10-01-dbr-phase7-check.md`) and MERGED the same day on his "merge live" (PR #477) — group A is closed (D453); `[WARN-HIDE-KEPT]` (D469, D471, D472, D475) BUILT, FULL-checked and MERGED 1 Oct 26 (PR #478). The IT team is taking the app into Dataverse now, and he means to
   keep working on the app beside it. What to finish before the hand-over was put to him the same day; record his answer
   here and in `OUTSTANDING.md`'s priority list the moment he gives it. Everything below keeps its ORDER; its timing is overtaken — *and that hand-over now waits for the end (D473).*
1. **HIS ORDER to the database step (D203, 26 Sep 26 — its timing overtaken by D354):** `[ACCOUNTS]`, `[ACCOUNTS-NEW-PERSON]`,
   `[POST-OUT-OUTCOMES]`, `[LW-MOVE-STANDARD]` (D264–D266) and `[ONE-DOOR]` (D309, D310, with `[POST-IN-DATE]`) MERGED
   (PRs #442, #443, #446, #447, #450) → **the one changes window (`[DRAFT-PENDING]`)** MERGED (PR #451, 28 Sep 26); its
   two follow-ups `[HIST-PHONE-HIDE]` and `[CHG-BY-ITEM]` (D345, D346) MERGED (PR #455, 28 Sep 26); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **HIS ORDER NOW (D453, 29 Sep 26):** `[DB-SYNC-MODEL]`'s design fixed with the red team's findings → `[DB-READINESS]`
   **group A** (what decides the tables' shape — saving in small pieces, the schedule a day per piece, the change log, no
   week-deleting reconcile, the planning calendar's own records, no demo seed; with the small OIL follow-ups, D147) BEFORE
   IT settles its tables → the app connected (`[DB-STEP]`) → **group B** (tuned against the real database) → the lock's
   screens. *(D473, 1 Oct 26: group A is built; the connection, group B and the lock's screens wait for the end — there is no
   "before its tables settle" to race now.)* The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[LW-FROZEN-BAR-GAP]`; the Tracker leftovers'
   own residue — `[SAVE-NOTE-COVERS]` (built on `codex/save-note-controls`, 5 Oct 26 — his look and "merge live" left), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

**The latest counts watched — 19 Oct 26, `claude/schedule-amendments-fixes-fffce0` at `40c7af45e` (`main` with the D994 batch, every fix of its check in — NOT `main`'s code), the whole gate set under the PC lock in one run, browser tests on 4232: build clean · tfin 728 / 0 · unit 11855 / 11855 · e2e 865 passed, 0 failed, 61 skipped · smoke 453 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.** (The run before it, at `9cbdc5e64`, met the Leave War phone test of `[LW-WINDOW-PRUNE-FLAKE-2]` once — 2 of 3 alone.)

Older counts, 9–19 Oct 26: moved whole to `raptor-port/docs/archive/handoff-gate-baseline-2026-11-07.md` (D1733).

Only the newest count stays in this section: when a newer one is written, the one it replaces moves whole to that archive file (D1733).

## Standing constraints

Every one of these is the same missing piece — the server / sync backend —
wearing a different hat.

- **No shared data.** localStorage only; two devices never see each other's
  edits. Needs a server or sync backend; touches the storage seam (`raptor-port/src/storage/`,
  `raptor-port/CLAUDE.md` §Where things live) and the mutation funnel. *(Corrected 24 Sep 26: it used to name
  `engine/hooks.ts:storeBackend`, which the storage seam replaced for everything but the `sqn142_*` settings.)*
- **Prototype auth.** *(Rewritten 26 Sep 26 by `[ACCOUNTS]`, on its branch.)* Accounts — one per person, tied to a
  callsign, managed on Admin → Users; the sign-in stands for the defence mail's and the app keeps no password; people on
  no list ask for access (D166, D204). Like all data, they live in one browser until the database, and the sign-in is no
  security (the app sits behind his Vercel sign-in — Vercel's lock, not the app's). A member is NOT view-only: they
  add, edit and delete their own Inputs and edit their own Quals row (D149).
  Roles table `docs/engine-rules.md` §Auth / roles; ONE permissions module (`raptor-port/src/state/perms.ts`,
  mirroring `data-model.md` §11, drift-tested); enforcement at the page, the write path and the command gate.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26; the
  weekend is non-flying, duty crew only). Week chips re-label but every week
  shows the same data. *(Corrected 24 Sep 26: a second demo week is authored from Mon 20 Jul —
  `raptor-port/src/engine/week2.ts` — and a week once edited keeps its own copy, persisted; an untouched week
  still falls back to the seed.)*
- **What survives a reload** — nearly everything, on a built site (the 19 Aug "session-only" rule was superseded 17 Sep 26 and its text archived in `raptor-port/docs/archive/handoff-2026-09-24.md`): the authoritative table is `raptor-port/docs/data-schema.md`; the short form is `raptor-port/CLAUDE.md` §WHAT ACTUALLY PERSISTS.

## Where to look

The map of every document is `raptor-port/CLAUDE.md` §Where things live (it loads with any file under
`raptor-port/`). From the root: the backlog `OUTSTANDING.md`, the rulings map `DECISIONS.md`, and — loaded in every
chat — `.claude/rules/shipping.md` (how a change ships) and `.claude/rules/doc-structure.md` (where each fact goes).

## Moved on 24 Sep 26 — where each old section of this file lives now

| Old section | Now |
|---|---|
| §Reference docs — where to look | `raptor-port/CLAUDE.md` §Where things live; the old table: `raptor-port/docs/archive/handoff-2026-09-24.md` |
| §Gate status (the baselines, the per-gate table, the Windows note, "How the gates lie") | `raptor-port/docs/gates-and-deploy.md` §How the gates lie |
| §In flight (and its storage-seam "Historical" story) | `raptor-port/docs/archive/handoff-2026-09-24.md` |
| §Open / deferred / queued — incl. "PARKED DIRECTION", "Unverified on a real iPhone", "Open questions for the owner" | open items → `OUTSTANDING.md`; the parked Power Apps direction → `raptor-port/docs/architecture-direction.md`; the iPhone caveats → `raptor-port/docs/ui-contracts.md` §Device caveats; the rest → `raptor-port/docs/archive/handoff-2026-09-24.md` (its head lists every new home) |
| §Known issues / open work (its name before 4 Sep 26) | `HANDOFF-ARCHIVE.md` (the frozen 4 Sep snapshot) |
| §Deploy — the traps | `raptor-port/docs/gates-and-deploy.md` §Deploy |
| §File map | `raptor-port/docs/file-map.md` |
| `HANDOFF-NEXT.md` | this file's `## Now` and `## Next, in order`; "How rulings are kept" → `DECISIONS.md` (its head) and `.claude/rules/record-decisions.md`; its merged stories → `raptor-port/docs/archive/handoff-2026-09-24.md`; "the checks run on his PC" and "how pushes cost runs" → `raptor-port/docs/gates-and-deploy.md` |
