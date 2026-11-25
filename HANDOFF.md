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
<!-- now:claude/sans-leftovers-179 -->
### THE SANS LEFTOVERS (23)–(25) — chat 179, 25 Nov 26 (branch `claude/sans-leftovers-179`, draft pull request 848; rulings D2581–D2589 held, none used yet)
- **His ask:** draw [SANS-WORDS-LEFTOVERS] (23)–(25) for his look — the mismatch bell line and crew-list words (D2570–D2572, D2575), the amber warning line (D2579), the "S" puck letter and Legend line (D2580), the standby seats' crew-list note (D2577) — then build (24), read as D2573 only (D2579/D2580 are drawn first, built after his look).
- **D2573 BUILT** (`3eb45f0cc`, pushed): `engine/avail.ts slotBar` — a flying seat with no times, SANS, nothing filed → `sansNoneWhy` words; never a standby line (`spareLike0`, `scLine`, `avFly`), never a sim (a question for him, D2611). Test `src/engine/sans-notimes-strike.test.ts` (red first; standby guard break-tested); 59 SANS / crew-list files pass. Bug check FULL (Q8), sheet `raptor-port/docs/handpass/2026-11-25-sans-notimes-strike.md` laid down.
- **In flight (25 Nov ~11:30):** scenarios — Fable DONE `D:/raptor-work/c179-sc-fable/scenarios.md` (17 + 2 questions: a sim with no times; a landing typed, no take-off), Astra running → `D:/raptor-work/c179-sc-astra/scenarios.md` (copy `D:/raptor-work/c179-sc/copy`); Fable word review → `D:/raptor-work/c179-words/fable-words.md` (brief beside it); drawing brief written `D:/raptor-work/c179-draw/BRIEF.md` (an Opus helper draws once a build exists; page `raptor-port/docs/mock/2026-11-25-sans-leftovers/`, port 4880). The checks lock was held by chat 178 (walkers); the build of `3eb45f0cc` waits for it, then is copied frozen to `D:/raptor-work/c179-build` for the drawing and the walk (port 4881).
- **Update (~11:00):** build made (`3eb45f0cc`, chat 178 lent the lock), frozen `D:/raptor-work/c179-build`; Astra's 22 scenarios in; combined in the sheet §5; drawing helper (port 4880) and walkers A (4881) and B (4882) running, reports to `D:/raptor-work/c179-draw/report.md`, `D:/raptor-work/c179-walk/{A,B}-report.md`. Fable's word review DONE `D:/raptor-work/c179-words/fable-words.md`.
- **Next, in order (was):** build → drawing helper → combine the two scenario lists, sizing lines into the sheet → walk (one Opus helper) → break tests → blind reads (Astra + a fresh Opus, exported copy) → fixes → GitHub green → sheet closed → publish the questions page (read it whole first) with the built change's pictures → his look.
- **Overlaps:** chat 180 (`claude/readings-lapse-fix-fdbb3c`, now in worktree `chat-156-handoff-a6d8d7`) draws the Legend's brief/debrief labels (D2615) — whoever builds the Legend messages the other first; its helpers write two untracked folders in the main folder, `raptor-port/docs/mock/2026-11-25-rulings-round2/` and `…-guardrail-wording/` — never commit, clean or delete them.

### THE SANS WORDS JOB — LIVE 25 Nov 26 (pull request 825, his "merge live"; chats 141–174) — what is left
- **Live:** the new SANS words and rules on the bell and the SANS calendar (his D2388, D2390, D2391, D2394, D2420, D2421, D2560, D2564, D2565, D2568), merged as `4582c2df4`; main's checks green and the Production deployment READY. The bug check: `raptor-port/docs/handpass/2026-11-22-allavail-sans-posted.md` §18 (w11–w14, 0 faults in w14, break tests 12 of 12); the night's full story is in git (chat 174's commits on `claude/allavail-sans-postout-141`).
- **Round A ANSWERED (chat 176, 25 Nov 26 — D2569–D2578, live with pull request 844):** Q1 strike on a seat with no times (D2573, to build); Q2 first "no warning for nothing filed" (D2574), then replaced the same night through chat 173 by one amber warning line stating the fact (D2579, to draw); Q3 reworded by Fable, then "tell him too" — his bell names the very event planned, OFT against AMT a miss too, the crew list naming what he offered (D2569–D2572, D2575, to draw); Q4 SC MAIN, SC SPARE, BB and AVALON need no SANS availability, flying or not, the info line telling him, the crew list maybe saying he was told (D2576–D2578, to draw). All filed under [SANS-WORDS-LEFTOVERS] (23)–(25) and [SANS-INFO-LINE]. D2560–D2579 used up; this job now holds D2580–D2589 — D2580 (via chat 173): every SANS availability flag on a puck wears "S", not "A", to draw; next free D2581.
- **Filed, for later jobs:** [SANS-WORDS-LEFTOVERS] (1)–(22) — (11)–(18) go with [BELL-WORDS-CLEAR] (D2437, D2438, D2561, D2563, D2600, D2601), (19)–(22) older cases to check against his rulings; [SANS-INFO-LINE] (D2566); the ALL AVAIL window and take-out-by-hand (D2425–D2436); [FABLE-READ-FAULTS] (x) to archive once its other parts are checked. The demo week's fixed "· Today" mark noted under [LOGIN-OPENS-TODAY].
- **Backlog tripwire (chat 176, 25 Nov 26, pull request 844):** a sweep of all 198 items found only two finished — archived; the tripwire raised 3030 → 3310 on his "Raise", the reason in the check's own line. Eight items are finished but for one small thing each (about 68 lines; chat 176's list: `OPUS-SECOND-READ-GUIDE`, `LEAVE-YEAR`, `WORD-LIST`, `SIMILAR-APPS-LOOK`, `VEILED-WINDOWS-BAR`, `COUNT-CHIP-PHONE-TAP`, `RD-LEFT-1108`, `CI-BROWSER-DEPS-DOWNLOAD`) — close each when its last thing is done.
- **Next chat:** a fresh one (177 was the next free number on 25 Nov 26). Opening line: "Chat <next number>. Read HANDOFF.md, the block for the SANS words job. Draw [SANS-WORDS-LEFTOVERS] (23)–(25) for my look — the mismatch bell line and crew-list words, and the standby seats' crew-list note — then build (24)." Branch: level with `main`. Model: Opus, high, to draw; a fresh Fable checks the words (its week resets 30 Nov).
<!-- /now -->
<!-- now:claude/words-r4-rulings-170 -->
### CHAT 170 — round 4 of the words pass is LIVE (pull request 841, 24 Nov 26); his four rulings of that evening recorded (D2600–D2603); written 25 Nov 26, 00:05 — verify before use
- **Shipped:** round 4 of the words pass (his D2521) merged on his "merge live" at 23:44 on 24 Nov 26 — `main`'s own run green, the live app's deployment READY on the merge. GitHub's run on the last push first failed ONE Leave War desktop test twice (`e2e/leavewar.spec.ts:2915`, "the box whose number changed flashes, once" — a 4-second wait; the push had changed only this file and a walk script), re-run once as D84 allows and green. The FULL bug check's sheet: `raptor-port/docs/handpass/2026-11-24-words-r4-build.md`.
- **This branch (`claude/words-r4-rulings-170`, notes only):** his four rulings recorded — **D2600** the bell's changed-input line says every change, never a count (narrows D2521; not built); **D2601** an undone change gets a notification of its own (his lean; a question for him first); **D2602** phone alerts at the database step are a Teams message (his lean); **D2603** a look through the whole app for other counts that could say the things. What D2600 leaves behind is marked in `raptor-port/docs/ui-contracts.md` §the bell and the register's row B9; the jobs are filed in the backlog with [UI-SLEEK-PASS] ("The bell says every change") and [CODE-APPS-RESEARCH] ("Phone alerts"). The backlog was two lines over its tripwire: seven doubled blank lines taken out, no word touched.
- **Next, each a job of its own (a fresh chat; the latest Fable, high — bell lines are saved records):** (1) draw "every change" on the real app at his iPhone's size, the worst case included, and put it to him with D2600's readings and D2601's question (its worked example is in the row) — before any build (D1625); (2) the look for other counts (D2603). Nothing is built on a reading of his words until he has answered it.
- **The other chats — read before touching the bell:** the SANS words job (`claude/allavail-sans-postout-141`, pull request 825, chat 174 now) changes `noticeWords` (its signature), the SANS line kinds, `sansRetracted`, and holds the bell's Undo rulings on its branch (D2437, D2438, D2561, D2563 — not on `main`), range D2560–D2579; the guard rail (`claude/msq-b1-screens-135`, pull request 826, chat 175) adds two cases at the end of `partWords`, changes the posting line's test in `noticeWords` and the register's rows B10, B12–B14, will build Undo by squadron ([MSQ-PICK-GUARD] part E), holds D2590–D2599; the readings review (`claude/readings-lapse-fix-fdbb3c`, chat 173, D2610–D2619) — **his D2611: until its checking fix is live, a chat writing or changing any note, word or bell line puts each reading of his words to him as its own question with a worked example, never building or wording on it.** Each was told of D2600–D2603 by message. Whoever builds "every change" changes `firstTwo` only, and agrees the order with pull requests 825 and 826 first.
- **Left in the folder (`C:\Users\User\projects\Raptor-words`, a lean copy; `node_modules` a junction — unlink before removing the folder):** the merged branch `claude/words-pass-163` holds one local handoff commit that was never pushed, on purpose (this block replaces it). Scratch safe to delete: `D:/rw4/` (`main/` and `read-copy/` each hold a `node_modules` junction — unlink first); `raptor-port/.tmp/` (untracked).
- **Open questions for him:** D2601's reading (is a second phone message on an Undo what he meant) — put with the drawing, not before.
- **Opening line:** "This is chat 176 — a hint: use the next free number in `main`'s `HANDOFF.md` and the session titles when you start (175 was the highest on 25 Nov 26, 00:05), and put it in this chat's title first. First list the live chats (`ListAgents`) and say where you are: `git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not. If the folder you start in shows another chat's changes, do not switch branches there: work in `C:\Users\User\projects\Raptor-words` on a new branch level with `main` (`git -C C:/Users/User/projects/Raptor-words fetch origin` then `git -C C:/Users/User/projects/Raptor-words switch -c claude/bell-every-change-176 origin/main`); make one write there first, and if the file tools refuse it, stop and tell him. Then read `HANDOFF.md` — chat 170's block under `## Now` — and the rows D2600 and D2601 (`grep -h '^| D2600 |' .claude/decisions-full/*.md`), message the chats holding pull requests 825 and 826, and draw the bell's 'every change' line on the real app at my iPhone's size, the worst case included, with D2601's question — for my look before anything is built."
- **Rulings:** 4 recorded → `.claude/decisions-full/scheduler.md` (D2600, D2601), `.claude/decisions-full/how-we-work.md` (D2602, D2603); this chat held D2600–D2609, and D2604–D2609 pass to the next chat of this job · **Walk:** round 4's, the sheet's §15; none for this notes change · **Reads owed:** none · **Skill notes:** 1054 (round 4) · **Next chat number:** 176 · **Model:** the latest Fable, high, for the drawing and the build of the bell's line; Opus, high, for the look for other counts.
<!-- /now -->
<!-- now:claude/app-speed-160 -->
### CHAT 160 — ways to make the app faster: measured, nine ideas put to him, his go recorded (D2480) and filed as `[APP-SPEED]`; written 24 Nov 26, 11:35 — verify before use
- **Where it started:** he asked, while other chats were working, for ways to improve the app's speed — less loading, or perceived; interface speed; above all on a slow computer. A thinking job: nothing in the app was changed.
- **Shipped:** notes only — ruling D2480, the backlog item `[APP-SPEED]`, and its plan document with the times measured that day, the order, the waiting ideas and the measuring script (`raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md`); this branch's pull request, merged by the notes rule once its run is green. `OUTSTANDING.md` now stands exactly at its line ceiling of 3030: the next change that adds an item there is the trim pass, or raises the ceiling with its reason.
- **Unfinished:** none of this chat's; the build is `[APP-SPEED]`'s three steps, not started.
- **Branch:** `claude/app-speed-160`; released here (`git switch --detach`) after its notes merge. Once MERGED, the next chat starts as a new job — its own fresh branch, level with `origin/main` — and never switches to this one.
- **Gates:** notes only, no app code. On his PC: `npm run docsize`, `npm run rulecheck` and the six unit test files that read documents (`engine/rally-workspan`, `engine/personnel`, `engine/sansavail`, `state/perms`, `ui/audit-a-hist`, `ui/bellnotices`) — see this branch's last commit message for each result; GitHub's run read before the merge. `npm run probes:adapted` · `npm run perf` — not run, nothing they read changed.
- **Open questions for him:** none. Two of the waiting ideas are his call when they come up (a lighter look on weak machines; the two held-back wins of `[PERF-RESIDUALS]` that change wording or feel).
- **Running when written:** none of this chat's. Chat 153 (`claude/msq-b1-screens-135`) held the checks lock for a full unit suite while the times were taken, which is why they are marked rough.
- **Pick up here:** step 1 of `[APP-SPEED]` only — the hidden timing readout (a switch on the app's address, like `?savefail`), so the real slow computer can be measured; first re-measure cleanly with the checks lock free, and check the two readings the item marks (coming back to the Leave War, Edit Schedule's open) against the speed ledger. Step 2 (the week drawing the days in view first, both schedule pages kept ready) is a later chat's, on Fable, high-risk.
- **Opening line:** "This is chat 161 — a hint: use the next free number in `main`'s `HANDOFF.md` when you start (was 161 at 11:35 on 24 Nov 26). First list the live chats (`ListAgents`; where this chat has no such tool, say whose the folder is cannot be checked, and take the worktree below) and say where you are: `git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not. If a live chat already holds this job — the block's writer, or one opened with this same line — message it before any heavy read. If that shows changes you did not make, or another live chat works in this folder, do not switch branches here: a new job runs `git worktree add --no-track -b claude/app-speed-readout-161 C:/Users/User/projects/Raptor-speed origin/main`, and works only there; make one write there first, and if the file tools refuse it (a chat started in a worktree may not write into another), stop and tell him. Otherwise run `git fetch origin` and check this branch is level with `origin/main`. Then read `HANDOFF.md` — the `claude/app-speed-160` block under `## Now` — the backlog item `[APP-SPEED]` in `OUTSTANDING.md` and its plan `raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md`, ruling D2480's full row, and `raptor-port/docs/performance.md` Part 1. Do step 1 of `[APP-SPEED]` only: re-measure the app's speed cleanly once the checks lock is free, then build the hidden timing readout, so I can measure on the real slow computer. Tell me your plan and the bug-check tier before you build."
- **Rulings:** D2480 (how we work, §Order of work); this chat held D2480–D2499, and D2481–D2499 pass to chat 161 · **Walk:** none — no app code changed · **Reads owed:** none · **Next chat number:** 161, checked 24 Nov 26 11:35 against `main`'s `HANDOFF.md` and the open branches' blocks (159 the highest named) (D1744) · **Model:** Opus 5.5, high thinking, for step 1; the latest Fable, high, with other readers beside it, for step 2.
- **Also open, waiting for his "merge live" (no block on `main` owns them; their blocks are on their own branches):** pull request 826, `claude/msq-b1-screens-135`, 6 behind `main`; pull request 825, `claude/allavail-sans-postout-141`, 22 behind `main` — read 24 Nov 26 11:30.
<!-- /now -->
## Next, in order

**HIS ORDER OF WORK (D2086, 16 Nov 26, changed 17 Nov 26 by D2186–D2188):** the multi-squadron and detachment design (answered whole, chat 104) → its BUILD now, in batches, before the database step, each batch's agreed design and mock-up shown to him first (`[MULTI-SQN-DESIGN]`; D2187, D2188) → the Tracker expansion with the Tracker's small fixes. Caps and ops limits (`[CAPS-OPS-LIMITS]`) PAUSED until he calls for it (D2186).

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three (all LIVE 9 Nov 26: Inputs, the scheduler, the Leave War — pull request 732) → step 6, the final measure, to him (done 9 Nov 26) → one follow-up (D1949, LIVE 10 Nov 26, pull request 735); each step on his "merge live" (D1737). Left: stating once what both the general page and a checklist state (D1762), later.

*(The "RIGHT NOW" lines of 6 Oct to 5 Nov 26, with his two words of 12 Oct 26 (D774, D775 — rulings in `how-we-work.md`) — all done, live or filed — are in `raptor-port/docs/archive/handoff-right-now-2026-11-07.md`, moved whole on 7 Nov 26; more of 13 to 20 Oct 26 in `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`.)*

0. **THE DATABASE COMES AT THE END (D473, 1 Oct 26 — replaces D354's "starts now"):** the app's features are built first; after
   phase 7 no more database-readiness work until then; the table list (`raptor-port/docs/data-model.md`) is kept up to date as
   each feature is added, and he — with his AI — writes the table format for the IT side to enter. `[WARN-HIDE-KEPT]` is BUILT, FULL-checked and MERGED (1 Oct 26, PR #478); `[INSIGHTS-WHICH-COPY]` (D477, D478) BUILT, WALK-checked and MERGED on his "merge live" (1 Oct 26, PR #479). *(Its next two, `[WORKSPAN-NEGATIVE]` (D483) and `[INSIGHTS-BOARD-DOOR]` (D481), are done and archived — checked 17 Nov 26.)*
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
3. Filed, none blocking: `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`); `[TRK-PINCH-ASK]`, `[LW-FROZEN-BAR-GAP]`, `[SAVE-NOTE-COVERS]` and
   `[TRK-REMOUNT-LANDING]` are done and archived (checked 17 Nov 26). Everything else: `OUTSTANDING.md`'s priority list.
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
