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
<!-- now:claude/words-pass-163 -->
### CHAT 170 — round 4 of the words pass (his D2521): BUILT and its FULL bug check CLOSED; waiting for HIS LOOK and his "merge live"; written 24 Nov 26, 20:20 — verify before use
- **Where it started:** opened with chat 168's line as "chat 169" (taken by the ALL AVAIL chat — this one is 170), to finish the bug check of round 4's build and bring him the preview link and pictures. Model: the latest Fable, high (bell lines are saved records).
- **Shipped (all pushed; pull request 841, a draft):** chat 168's build (`a358d4b1a`, `39367445f`) and this chat's bug check — the two scenario lists combined (23), the walk (the host and three Opus walkers, 179 checks pass, none fail), three blind code reads (Astra, a fresh Opus, a fresh Fable), **four faults fixed, each with a test that failed first** — `68ab6d1db` a swallowed title read as a phantom rename; `b4cd80acb` the publish note's ". ·" behind another OIL line (`leavewar/sync.ts publishFlagsBids`, `leavewar/noperiod-join.test.ts`); `c3498b918` a crew-list name dragged onto his own seat said nothing (`ui/drag.ts applyDrop`, `same()`); `489420a0c` a real rename unsaid (`state/notices.ts ownName`) — the fixes read again by a fresh Opus (nothing wrong), re-walked (walkers d and e, all pass), 10 of 10 break tests caught (`scripts/handpass/breaks/wr4-words.json`).
- **The evidence sheet, closed:** `raptor-port/docs/handpass/2026-11-24-words-r4-build.md` (its §15 the `Walk:` line and the order's §12 ticked); the readers' reports whole beside their brief (`raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-read-{astra,opus,fable,narrow}.md`); the walk ledger's row; skill note 1054.
- **Unfinished:** nothing of the check. LEFT: his look (the preview link and the pictures were sent to him at 20:25), then his "merge live" — before the merge: bring `main` in if the branch is behind, the four merge steps (`raptor-port/docs/shipping-steps.md` §"Push" and "merge live"), compare the branches of the other open chats once more (below), then `main`'s own run green and a READY Production deployment. After the merge: mark D2521's row and `[UI-SLEEK-PASS]`'s round 4 as live where they say "on the words-pass branch", and remove this block at the next handoff.
- **Filed, not fixed** (`OUTSTANDING.md` `[UI-SLEEK-PASS]`, "Round 4's walk, left for a later round"): a 60-letter value in a time box runs 10px past the note's border on a phone (older, contrived); the unruled wordings for him ("Now OL (AM), LL changed to OL"; "Now 00:00–12:00, LL changed to Training"; a moved half-day leave says no "(AM)"; the three "Renamed — was …" readings); "leave war" in small letters in sentences round 4 did not touch; the Scheduler Board's Ground Programme row one change behind an input changed in its in-place box (older, reproduced on `main`). `OUTSTANDING.md` is a few lines over its tripwire (deferred — a code change never trims, D29).
- **Branch:** `claude/words-pass-163`, folder `C:\Users\User\projects\Raptor-words` (a lean copy; `node_modules` a junction to the main folder's — unlink before removing the folder); 0 behind `main` at 20:15. Scratch outside the checkout, safe to delete once merged: `D:/rw4/` (`main/` and `read-copy/` each hold a `node_modules` junction — unlink first); the walkers' uncited first attempts `raptor-port/.tmp/wr4-attempts/` (untracked).
- **Gates:** GitHub green on `489420a0c`, the last commit that changed the app (its run on `4d5f037af` failed one browser test twice, `e2e/schedule-tab.spec.ts:177`, which passed on the next push with nothing near it changed — a flake, written in the sheet's §11); the last push after it is notes, pictures and walk scripts — read its run before the merge. On his PC: the twenty touched test files 656 of 656; the bell's three files 212 of 212 after the last fix; `npx tsc -b` clean; `npm run docsize` OK.
- **Promised to the other chats (shipping.md), unchanged from chat 168:** the ALL AVAIL chat's branch (`claude/allavail-sans-postout-141`) changes `sansRetracted`, the SANS reminder's reads, `leavewar/sansunfiled.ts`, `state/perms.ts` — this branch leaves those alone; it leaves `common`, `partWords`' title / when / kind and `noticeWords`' last lines to this branch. The two-squadron chat changes none of these lines. Whichever merges second keeps both at `noticeWords` and in the register's table. This chat also changed `publishFlagsBids`'s no-period exit and `applyDrop`'s roster branch — neither is in another chat's list; compare again before the merge (`git diff --name-only $(git merge-base origin/main <branch>) <branch>`).
- **HIS RULINGS OF 24 Nov 26, about 21:00 — NOT YET IN THE RULINGS FILES (this chat was full; RECORD THESE FIRST, before any other work — the steps at the head of `DECISIONS.md`, a free D-number checked against every open branch):** his words, whole: *"I think ill do team notification. And if its undone perhaps we should also create a notification thats applicable to it. ok saying everything sounds good. See what else in the app also has this existing numerical change and perhaps its better to say everything instead."* What each answers: (1) **Phone alerts at the database step go by a Teams message** (he had asked whether Power Automate is the only way to a real phone notification; told: one flow on the bell's table, the app saving each line's finished sentence as text for it; a Power Apps push to a code app is unproven) — People & accounts / the platform (`how-we-work.md` §The platform and the database, `raptor-port/docs/how-we-work-when-needed.md`), nothing built before the database step (D1571). (2) **A change that is undone gets a notification of its own** ("perhaps" — a lean; told that an alert already sent cannot be taken back) — beside D2437, D2438, D2561 and `[BELL-WORDS-CLEAR]` (D2392): search them first. (3) **The bell's line for a changed input says EVERY change, never "and N more change(s)"** — replaces D2521's Q3 (option A, the first two then a count; the later wins, D201: fix `raptor-port/docs/ui-contracts.md` §the bell, `docs/notifications-register.md`, `.claude/rules/decisions/scheduler.md`, the words record, and file the build). Told to him: two rows on a phone hold about 100 letters (four or five changes), six changes or a long old title run to three rows; the scenarios as they would read are in this chat's answer and are to be DRAWN on the real app at his iPhone's size, worst case included, and shown before the build (D1625); recommended as a follow-up job after round 4 as built goes live — he has NOT yet said "merge live". (4) **A new job: look through the whole app for every other place that gives a number where it could say the things themselves, and put each to him with a picture and a recommendation** — an `OUTSTANDING.md` item, with the Teams question for the database step.
- **Open questions for him:** whether round 4 as built is good to "merge live" now (asked twice; not answered yet). (The unruled wordings above wait in the backlog for the bell's next round, D994.)
- **Opening line:** "This is chat 171 — a hint: use the next free number in `main`'s `HANDOFF.md` and the session titles when you start (170 was the highest on 24 Nov 26, 20:20), and put it in this chat's title first. First list the live chats (`ListAgents`) and say where you are: `git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not. If a live chat already holds this job — the block's writer, or one opened with this same line — message it before any heavy read. The main folder may hold another chat's changes: work in `C:\Users\User\projects\Raptor-words` with `git -C C:/Users/User/projects/Raptor-words switch claude/words-pass-163` and `git -C C:/Users/User/projects/Raptor-words pull --ff-only`, and only there; make one write there first, and if the file tools refuse it, stop and tell him. Then read `HANDOFF.md` there — the `claude/words-pass-163` block under `## Now`: round 4 of the words pass is built and bug-checked and waits for my look and my 'merge live' — carry it live on my word, or take what my look brings."
- **Rulings:** none this chat · **Walk:** round 4's build driven on the frozen production build, a desktop 1440×900 and his iPhone's size 402×874 (the long line in WebKit too): the host's run, three Opus walkers (179 checks pass, none fail), two re-walks of the fixes (all pass) — the sheet's §15 · **Reads owed:** none (Astra, a fresh Opus and a fresh Fable each read the finished code blind; a fresh Opus read the fixes) · **Skill notes:** 1054 · **Next chat number:** 171 · **Model:** for the merge, Opus, high, is enough (a mechanical carry); the latest Fable only if his look brings a change to the bell's saved lines.
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
