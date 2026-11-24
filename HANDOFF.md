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
### CHAT 170 — round 4 of the words pass (his D2521): its FULL bug check WALKED (179 checks pass, one fault fixed), the re-walk and the three blind code reads RUNNING when written; written 24 Nov 26, 18:50 — verify before use
- **Where it started:** opened with chat 168's line as "chat 169" (taken by the ALL AVAIL chat — this one is 170), to finish the bug check of round 4's build: combine the two scenario lists, walk, the code reads, the fixes, then the preview link and pictures to him. Model: the latest Fable, high (bell lines are saved records).
- **Shipped (committed, NOT yet pushed):** `872cf5214` the two lists combined (23 scenarios), the walk sized, the walkers' and the readers' briefs, the host's own run (6 of 6); `68ab6d1db` the three walkers' scripts, pictures and reports and the walk's one fix — a title in small letters that the new kind's name swallows ("meeting" on a Training made a Meeting) read as a phantom "renamed — was meeting"; fixed red-first in `state/notices.ts common` (`swallowed`), two tests in `ui/bellnotices.test.tsx`. Built by chat 168 before: `a358d4b1a`, `39367445f` (pushed; pull request 841, a draft).
- **The evidence sheet:** `raptor-port/docs/handpass/2026-11-24-words-r4-build.md` — the roll-call filled (R1–R16), §3 the sizing, §4 the combined list, §5 what the screen said, §10 what was not walked, §12 the findings and each disposition. STILL EMPTY: §8 break tests, §11 gate counts, §13 the code reads, §14 lessons; the `Walk:` line; the walk ledger's row (`docs/walk-ledger.md`).
- **Running when written (all started 18:45):** (1) walker **d**, an Opus helper — the re-walk on the FIXED build `D:/rw4/build-new2` (bundle `index-BNHpQA1S.js`): D1 the fix on both builds, D2 nine lines that must not have moved, D3 an input changed on the Scheduler Board's row (a door the first walk did not reach), D4 a lead of walker c's (the week's Ground Programme row said to read 08:00 after the Board saved 09:00, on a phone) — its report `raptor-port/docs/handpass/parts/wr4/d-report.md`, pictures `…/2026-11-24-words-r4-walk/d/`. (2) Three blind code readers on an exported copy of `68ab6d1db` at `D:/rw4/read-copy` (the sheet, the scenario lists, the walk brief, the walkers' reports and scripts and this block taken out; `BRIEF.md` = `raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-read-brief.md`): Astra (`gpt-6-astra`, high — report `D:/rw4/reads/astra.md`, log `astra.log`), a fresh Opus (`D:/rw4/reads/opus.md`), a fresh Fable (`D:/rw4/reads/fable.md`). Their reports stay OUTSIDE the checkout until all three exist; then each is saved whole under `raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-read-{astra,opus,fable}.md`, its head copied from the run's own log.
- **Pick up here:** (a) when d reports: open its deciding pictures, judge D4 (a real stale time is an older fault — file it, it is not this words change's), fill §12 item 4 and the re-walk's line. (b) When the three reads exist: reproduce every claim with a failing test before believing it (§4 "What to do with what they hand back": against the ruling, against `main`, each dispositioned), fix red-first, a fix that rewrites logic gets its own narrow fresh-Opus read; re-walk only what a fix touches (a new frozen build in a NEW folder — take the checks lock for anything that builds while another chat holds none). (c) Break tests for the two fixes (`scripts/handpass/breaks.mjs`, a list). (d) `npx tsc -b`, the touched tests (`bellnotices`, `bellnotices-scenarios`, `noteswords`, `audit-guards-inputs`, `drag`), `npm run docsize`; check pull request 841's runs are finished before the ONE push (`gh run list --branch claude/words-pass-163 --limit 6 --json status,workflowName,headSha`); GitHub's run green on the last pushed commit. (e) Close the sheet (§9 of the order: the `Walk:` line, §11, §13, §14), add the ledger's row, tick §12 of the order. (f) His look: the preview link once its Vercel build is Ready, pictures of the real app (the bell on a phone: the kind change, the half day, the three-change line; one note), a "look here" card of three to five lines; one `PushNotification`.
- **Findings so far, and where each went:** the phantom rename — fixed. A 60-letter value typed in a time box runs 10px past the passing note's border on a phone (older; contrived) — filed, `OUTSTANDING.md` `[UI-SLEEK-PASS]`, "Round 4's walk, left for a later round", with three unruled wordings ("Now OL (AM), LL changed to OL"; "Now 00:00–12:00, LL changed to Training"; a moved half-day leave says no "(AM)") and the "leave war" small letters round 4 did not touch. `OUTSTANDING.md` is 2 lines over its tripwire (deferred — a code change never trims, D29).
- **Branch:** `claude/words-pass-163`, folder `C:\Users\User\projects\Raptor-words` (a lean copy; `node_modules` a junction to the main folder's — unlink before removing the folder), 2 commits ahead of its pushed tip, level with `main` when checked at 17:50. Scratch outside the checkout: `D:/rw4/` — `build-new` (the walked build), `build-new2` (the fixed one), `build-main`, `main/` (main's source, `node_modules` a junction — unlink first), `read-copy` (a junction too), `reads/`; the walkers' uncited first attempts `raptor-port/.tmp/wr4-attempts/` (untracked). The checks lock: released at 18:38.
- **Gates:** on his PC — `bellnotices.test.tsx` 46 of 46 after the fix; `npx tsc -b` clean on `68ab6d1db`; `npm run docsize` OK. GitHub's run on the two new commits: not started (not pushed).
- **Promised to the other chats (shipping.md), unchanged from chat 168:** the ALL AVAIL chat's branch (`claude/allavail-sans-postout-141`) changes `sansRetracted`, the SANS reminder's reads, `leavewar/sansunfiled.ts`, `state/perms.ts` — this branch leaves those alone; it leaves `common`, `partWords`' title / when / kind and `noticeWords`' last lines to this branch. The two-squadron chat changes none of these lines. Whichever merges second keeps both at `noticeWords` and in the register's table.
- **Open questions for him:** none.
- **Opening line:** "This is chat 171 — a hint: use the next free number in `main`'s `HANDOFF.md` and the session titles when you start (170 was the highest on 24 Nov 26, 18:50), and put it in this chat's title first. First list the live chats (`ListAgents`) and say where you are: `git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not. If a live chat already holds this job — the block's writer, or one opened with this same line — message it before any heavy read. The main folder may hold another chat's changes: work in `C:\Users\User\projects\Raptor-words` with `git -C C:/Users/User/projects/Raptor-words switch claude/words-pass-163` and `git -C C:/Users/User/projects/Raptor-words pull --ff-only`, and only there; make one write there first, and if the file tools refuse it, stop and tell him. Then read `HANDOFF.md` there — the `claude/words-pass-163` block under `## Now` — and the evidence sheet `raptor-port/docs/handpass/2026-11-24-words-r4-build.md`, and carry on the FULL bug check of round 4 of the words pass from its 'Pick up here'."
- **Rulings:** none this chat · **Walk:** round 4's build walked on a desktop and at his iPhone's size by the host and three Opus walkers (179 checks pass, none fail; one fault found and fixed); the re-walk of the fix running · **Reads owed:** none yet (Astra, a fresh Opus and a fresh Fable are reading) · **Skill notes:** none yet · **Next chat number:** 171 (170 the highest named on any branch's `HANDOFF.md` and in the session titles at 18:50) · **Model:** the latest Fable, high, with Astra and a fresh Opus reading beside it — saved records.
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
