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
<!-- now:claude/rules-check-fixes -->
### CHAT 66 — THE NIGHT OF 12 Nov 26 (unattended, `/overnight 12 low`): the checks fix, the rules check's fixes and words, D2005, the Approvals drawings — IN PROGRESS — written 12 Nov 26, 00:50 — verify before use
- **After a compaction: re-read this block, the overnight guide and the files of the step in hand before the next change; note the compaction here with its time, read from the clock (`date`).** Compactions so far: none.
- **His go (12 Nov 26, about 00:30): "A go should be all jobs"** — read as: answer A to D1991's reach (recorded, D2005), start, all five jobs. **Low** (his word): one helper at a time, the fewest the checks need. His 12 hours end about 12:30; no new job starts after 11:30 (the last hour is the report's). Nothing merges (no "auto merge live"); nothing touches `main` or the live app. The compaction guard is off for the night (`--away`); the keep-awake hold is asked for. Builders Opus (high), walkers Sonnet, readers Astra and a fresh, blind Opus; this chat (Fable 5.2, D1972) only coordinates.
- **The night's jobs, in order — each handed to one fresh helper, one at a time; the helper never edits this file:**
  1. **[CI-BROWSER-DEPS-DOWNLOAD] step 2 — the browser checks no longer fetch from Ubuntu's servers on every run.** Branch `claude/ci-browser-deps`, cut from `origin/main`; its own pull request (to be opened once built). No app change, so no walk: its check is its own pull request's run — the nine browser jobs reaching their tests — and the reads a working-guide change gets, Astra and a fresh, blind Opus reader, one round each. About 1 hour (a guess). Merges only on his "merge live". If GitHub still cannot run the browser checks tonight, each later job's full checks run on his PC under the checks lock instead (said to him). **State: not started.**
  2. **[RULES-CHECK-FIXES] — the rule fixes** (D1990, D1991/F1, D1993/F2, D1995, D1996, D1997, D1999, F3, D2001/Q7). Branch `claude/rules-check-fixes` (this one), with pull request 757's branch `claude/engine-rules-review` merged in first for its as-built tests (the records settled by `records-merge.mjs`); one pull request into `main`, to be opened once job 2 is built; pull request 757 is closed with a pointer only after this one merges. Tests first, each flipping its as-built test. Tier: the helper answers the order's eight questions — expected FULL (OIL earning, what a published day flags). Reads: Astra and a fresh, blind Opus, blind to each other. About 6 hours (a guess). **State: not started.**
  3. **[RULES-CHECK-FIXES] — the words** (D2003, D2004, F4's note by D1994, "OIL earned" never "pays" by D2000, the Logic lines F5–F11 with F7 by D1988/D1989 and F10 by D1992). Same branch, same pull request, same check as job 2. The two new wordings ("On leave + flying" on a ground row; "landed" with no landing typed) are NOT built: proposed to him in the morning with pictures. About 1.5 hours (a guess). **State: not started.**
  4. **D2005 — a published day keeps the Logic settings it was published under** (his answer A). Same branch and pull request; a change to what is saved — FULL, both readers. Built last of the three so a short night leaves it, not the fixes. About 2.5 hours (a guess). **State: not started.**
  5. **[APPROVALS-SCROLL-INSIDE] — the drawings only** (D1986): the Approvals page before and after, at a desktop's size and his iPhone's, for his look; nothing in the app changes. Branch `claude/approvals-scroll-drawings`, cut from `origin/main`. About 1 hour (a guess). **State: not started.**
- **Questions waiting for him: none yet from the jobs.** Parked from the start, for the morning report: (a) the two new wordings above, with pictures; (b) whether a published day's OIL follows a changed "Full day of OIL" (D2005's row — not covered by his answer); (c) whether "a go should be all jobs" is also a standing rule for every `/overnight` (the agent's reading: tonight's selection only; the overnight guide is not changed at night); (d) the "no rule versioning" pointer in `raptor-port/CLAUDE.md` owed by D2005 — a working-guide change, read and put to him awake.
- **`main`'s run after pull request 760's merge is still RED — four tries (the fourth 12 Nov, 00:21), the same cause, no test run:** GitHub's machines cannot reach Ubuntu's package servers, so the nine browser jobs stop while fetching the test browser's font packages. Told to him. The live app is not affected (Vercel's Production deployment of `b476db83a` READY 11 Nov, 22:01 — not looked at again). A red pull-request run tonight is read for this cause first.
- **Carried from chat 65 (still true):** the Balances fix is live (pull request 760). The rules check's Q9 is answered as built (D2002), its pictures `raptor-port/docs/img/handpass/2026-11-11-rules-check-q9/`; his words for the two amber OIL lines are D2003 and D2004 (job 3 builds them). Pull requests 756 (the small schedule and board fixes), 758 (two small Quals faults) and 759 (the Leave War's double tap) wait for his look and "merge live", one at a time, each brought level with `main` first (the records settle step first); 757 is taken into this branch (above) — his "merge live 757" was never answered and is no longer needed first. Job 4 of the night of 11 Nov's two questions are answered (D1984, D1985) though its own block and sheet on 759's branch still list them as waiting. His answer to that night's question 1 (the bell) is still open. **Job 1 of that night's small round, not yet put to him one by one (D994 — ask first whether he wants it now):** Escape and the changes window; Tab and the board's buttons; the drawings that need his look (D1625); the two other "N warning" places; and two that wait on his word — a walk-scripts lesson, and the last box resting under the note.
- **Branch:** `claude/rules-check-fixes`, held by this chat in `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2`; through the night that one checkout switches between the night's three branches, one job at a time. No pull request yet. **This block, D2002–D2005 and the picture scripts are NOT on `main`:** a chat started from `main` must not take chat numbers 65 or 66, nor D2002–D2005. Chat 60's and chat 55's blocks below are left as they were — the open pull requests each change this file. The main folder (`C:/Users/User/projects/Raptor`) is on `main`, behind `origin/main` ([MAIN-CHECKOUT-STALE]).
- **Gates:** on his PC `npm run docsize` OK after D2005 and this block. No app code changed yet. GitHub's run on this branch: none yet.
- **Running when written:** none — job 1's helper starts next.
- **Pick up here (if this chat is lost):** read each job's "State" above; a job marked built has its branch pushed; carry on from the first job not finished, by the overnight guide's Part 2; then Part 3, the morning report.
- **Rulings:** 1 so far — D2005 (the scheduler's page). **Walk:** none yet. **Reads owed:** none yet. **Allowance at the start:** 45% of the week (all models), 61% of Fable's week; this chat 45% full. **Next chat number:** 67 (D1744).
<!-- /now -->
<!-- now:claude/skills-tighten-close -->
### CHAT 60 — [SKILLS-TIGHTEN] FINISHED and archived: the overnight skill live (pull request 754, D1979–D1981), the outside skills left as brought in (D1982); the main folder brought level, so both rewritten skills are in force in new chats — NOTES ONLY in this last pull request — written 10 Nov 26, 21:10 (the commit's time is the record), before its merge, to be true once it is live — verify before use
- **Shipped:** pull request 754 (merged on his advance "merge live", D1981) — the overnight skill changed as its list recommends, 21,958 → 21,725 bytes, three corrections to later rulings; D1980 (an unattended run merges nothing by itself, notes included, unless he gave "auto merge live") in the shipping rules and the general page. The list, its measuring script and both readers' reports: `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-overnight.md` and `raptor-port/docs/superpowers/briefs/2026-11-10-overnight-tighten-read-*.md`. Then this notes-only pull request (merged by itself once green, D1407): D1982, D1977 marked spent, [SKILLS-TIGHTEN] archived, chat 59's and this chat's merged blocks replaced by this one.
- **The main folder (`C:\Users\User\projects\Raptor`):** on his word "discard" (10 Nov 26) its two redrawn pictures (`raptor-port/docs/img/handpass/2026-10-27-lw-m4/d1444/f1-decided-pressed.png`, `…-settled.png`, redrawn that day at 12:49 by no known chat) were put back to their saved versions and the folder brought level with `main` by the deploy notes' recipe. If a later chat finds it behind again, that is a new case of [MAIN-CHECKOUT-STALE], which stays open for its guide line.
- **Branch:** `claude/skills-tighten-close`, merged; released (`git switch --detach`) in `C:/Users/User/projects/Raptor-st3`, a folder that may be removed. The next chat is a new job on its own fresh branch, level with `origin/main`.
- **Gates:** GitHub's run on this pull request's last pushed commit green before the merge; on his PC `npm run docsize` and `npm run rulecheck`. No app code changed.
- **Open questions for him:** none. **Running when written:** none.
- **Pick up here:** nothing of this job is left. The next job is his to name, or the next item of `## Next, in order` and the backlog's priority list.
- **Opening line:** "Run `git fetch origin` and check this branch is level with `origin/main`. Read `HANDOFF.md` on `origin/main` — the `claude/skills-tighten-close` block under `## Now` (chat 60), then `## Next, in order` and the priority list at the head of `OUTSTANDING.md` — and tell me, in plain words, the three jobs you recommend next and which one you would start, with the model you recommend for it. Start nothing until I choose. Work in this chat's own fresh folder and branch; if `git status --short --untracked-files=no` shows changes you did not make, or another chat works in this folder, do not switch branches here: tell me first. Your chat number is the next free number in `main`'s `HANDOFF.md` when you start (was 61 at 21:10 on 10 Nov 26)."
- **Rulings:** D1979, D1980, D1981 (spent), D1982. **Walk:** none — nothing of the app changed. **Reads owed:** none. **Next chat number:** 61 (D1744).
<!-- /now -->
<!-- now:claude/leave-war-frozen-dates-db-8d99fb -->
### CHAT 55 — the second IT person's answers compared with the first's; his three levels of people (D1971); nine questions drafted for the IT side — NOTES ONLY, nothing of the app changed — written 10 Nov 26, 16:10 — verify before use
- **Where it started:** he brought both IT people's replies to the 12 database questions and asked what conflicts, what to do, and to check Microsoft's pages. The branch's name is the app's; it has nothing to do with the Leave War's frozen dates bar (chats 51, 52).
- **Shipped (notes only, a pull request that merges itself once green — D1407):** both replies, where they differ and what Microsoft's pages say, under [IT-QUESTIONS] (the 10 Nov 26 paragraphs); D1971 on the People & accounts page and under [DB-SECURITY-ROLES]; the questions he was given to send, `raptor-port/docs/superpowers/briefs/2026-11-10-it-questions-v4.md`.
- **Told to him, not rulings (his to decide once the IT side answers):** the agent recommends two database keys — members weaker than admins — if the unit may manage the groups, with the app moving a person between groups when an admin changes his role (unverified, to try in the test account); one shared key otherwise; an automatic step that changes roles with the role-based account's rights kept in reserve only. The agent withdrew its own suggestion of one app for every aircraft type: D1101 (split by type, for classification) stands, kept in the one environment by a short code per type.
- **Unfinished:** the 10 Nov answers are NOT folded into `raptor-port/docs/data-model.md`, `raptor-port/docs/handover-dataverse.md` or the M365 move plan — [IT-QUESTIONS] says so; the 8 Nov reading "no unique key can be counted on" and the short code "theirs" are the two lines the new answers ease. He has not yet sent the nine questions.
- **Branch:** `claude/leave-war-frozen-dates-db-8d99fb`; released here. Once its pull request has merged, the next chat starts as a new job, level with `origin/main`, and never switches to this one.
- **Gates:** `npm run docsize` OK; `npm run rulecheck` OK; the document-reading unit tests run: three files (permissions, personnel, the Tracker rows), 115 pass. No app code changed.
- **Open questions for him:** none put; the nine are for the IT side.
- **Running when written:** none.
- **Pick up here:** when he pastes the IT side's replies — record them under [IT-QUESTIONS] without names (D1748), compare with the 8 and 10 Nov records, then fold all of it into the three design notes named above, on a fresh branch from `main`, as chat 4 did; put the one-key or two-key choice to him with a recommendation.
- **Opening line:** "Run `git fetch origin` and `git merge --ff-only origin/main` so this branch is level with `origin/main`. Read `HANDOFF.md` — the `claude/leave-war-frozen-dates-db-8d99fb` block under `## Now` (chat 55) — then take the IT side's new answers, which I will paste next, record them and fold them into the database design notes. Your chat number is the next free one in main's `HANDOFF.md` when you start (was 56 at 16:10 on 10 Nov 26). If `git status --short --untracked-files=no` shows changes you did not make, or another chat works in this folder, do not switch branches here: run `git worktree add --no-track -b claude/it-answers-fold ../Raptor-it origin/main` and work only there; make one write there first, and if the file tools refuse it, stop and tell me."
- **Rulings:** D1971. **Reads owed:** none. **Next chat number:** 56 (D1744).
<!-- /now -->
## Next, in order

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three (all LIVE 9 Nov 26: Inputs, the scheduler, the Leave War — pull request 732) → step 6, the final measure, to him (done 9 Nov 26) → one follow-up (D1949, LIVE 10 Nov 26, pull request 735); each step on his "merge live" (D1737). Left: stating once what both the general page and a checklist state (D1762), later.

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
