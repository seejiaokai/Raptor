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
<!-- now:claude/next-jobs-recommendation-c110df -->
### CHAT 64 — THE NIGHT OF 11 Nov 26 (hosted by Fable 5.2, D1972): four jobs — (1) chat 63's small schedule-and-board fixes finished (pull request 756), (2) the rules-first review of the warnings ([ENGINE-RULES-REVIEW], D1983), (3) two small Quals faults, (4) the Leave War's double tap — rewritten 11 Nov 26, 02:20, job 1's fixes built and pushed, its last read and its re-walk to come — verify before use
- **After a compaction: re-read this block, the overnight guide and the files of the step in hand before the next change; note the compaction here with its time, read from the clock (`date`).** Compactions so far: none (the chat was 74% full at 02:16 — one is near).
- **The night:** his `/overnight` at 00:35 on 11 Nov 26, 12 hours (to about 12:35; the last hour, from about 11:30, kept for the report). **Low**, confirmed by him ("Go on low", 00:45): the fewest helpers, ONE AFTER ANOTHER. Nothing merges, nothing touches `main` (no "auto merge live"). The compaction guard is off for the night (`compact-ready.mjs --away`); the morning report puts it back (`--back`). Keep-awake is held; the coordinator waits by ending its turn with a background timer armed (a Monitor, `sleep 1700`, re-armed at each expiry). The night's one checkout: `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`. The night's scratch folder (on disk, survives a compaction): `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/`. Allowance: weekly 20% (Fable 21%) at 00:35; 25% (Fable 29%) at 02:16.
- **His selection (his reply at 00:40, "Go: 3 and 4 too"):** all four, in this order. If the night runs short the LAST job is left, never a check.
- **Job 1 — chat 63's job** (branch `claude/next-jobs-recommendation-c110df`, pull request 756 into `main`; tier WALK, a shared drawer). The four fixes of chats 61–63: the week's issues bar "N warnings" by count ([SCHED-MARKS-WALK-ODDS] 1); the changes window's foot only where a drawn line can be tapped ([SCHED-MARKS-WALK-ODDS] 3); the board's Undo and Redo bring the changed box on screen when out of view (D672, [BOARD-UNDO-SAME-DAY]); W9b (the landing under the changes window on a phone). Chat 63's walk: `raptor-port/scripts/handpass/sb63-walk.mjs`, 99 pass, 81 pictures in `walk2/`; sheet `raptor-port/docs/handpass/2026-11-10-sched-board-small.md` (§5 "GATES", §6 "READS" still placeholders).
  - **DONE tonight:** both blind reads saved beside the readers' brief in `raptor-port/docs/superpowers/briefs/` (`2026-11-11-sched-board-small-read-astra.md`, three findings; `…-read-opus.md`, five findings and two cases). The builder's brief `…-fix-brief.md` (findings 1–8, cases S1, S2). **Fix round 1** (`2eac8d6f9`, `ac05bd045`): all eight reproduced red-first and fixed in `src/ui/boardland.ts` and `src/state/undo-wire.ts`; S1 real and fixed; S2 passed on the old code, no change. **The narrow read of round 1** (`…-read-narrow1.md`): three confirmed, two read. **Fix round 2** (`41c6f79b4`, `3e06de33d`): N1 a re-ordered row lands on the row that MOVED (the fix brief's "first whose place differs" was the host's wrong wording); N2 a hidden warning's own line, the bar only where the line is not laid out; N3 Personal Inputs unfolds only on a day the input covers; N4 a sign-off line only when the board draws none of the step's own places; N5 a publish Undo landing tested, was right. **GitHub's run on `ac05bd045` was RED in one unit test** (`src/engine/inputs-readers.test.ts`, the D756 guard: `ui/boardland.ts` read the inputs and was on no list) — fixed in `52154e71d` (on RECORDS, and reading through `inpById`). On `52154e71d`: the whole unit suite under the lock 14,134 pass, 20 skipped, 0 failed (816 files); `tsc -b` clean; `lint:changed` no new finding; `e2e/board-undo-land.spec.ts` 32 pass; `raptor-port/dist` built from it. Pushed at 02:15 (`6122567bb`, with the walker's brief `…-rewalk-brief.md`); GitHub's run on it not yet read.
  - **RUNNING at 02:20:** the narrow read of round 2 (a fresh Opus helper, read-only, on `41c6f79b4`, `3e06de33d`, `52154e71d`) — save its report word for word as `…-read-narrow2.md`. This is round 2 of at most about three (the order §5).
  - **NEXT, in order:** (a) its findings, if any, back to the builder red-first (the same helper while it is warm; else a fresh one given the fix brief and the three reads), then the whole unit suite and the browser file again, a fresh `dist`; (b) **the re-walk** by ONE Sonnet walker, brief `…-rewalk-brief.md` (R1–R9; pictures to `docs/img/handpass/2026-11-10-sched-board-small/rewalk/`, notes to `docs/handpass/parts/2026-11-11-sched-board-small-rewalk.md`) — the host opens every deciding picture and reproduces every FAIL; (c) the sheet's §5 (GitHub's run on the last pushed commit) and §6 (each finding's disposition, each read and its round), the re-walk's lines, the walk-ledger row (`raptor-port/docs/walk-ledger.md` §The record); (d) the backlog: [SCHED-MARKS-WALK-ODDS] 1 and 3 and [BOARD-UNDO-SAME-DAY] done on this branch (to archive at merge by `backlog-archive.mjs`); the ⓘ panel's and Insights' "N warning" filed under [SCHED-MARKS-WALK-ODDS] for his word; chat 62's other items (its block, in git at `b7d82005d`); **new to file:** an input's date move, Redo sends the board to the OLD day (older, `undo-wire.ts inputDayOf` reads the before image first); the LATE chip tapped off on a Personal Inputs line out of view while its programme row is in view — Undo returns it unseen (N6, not built: no cheap list of what each drawing shows); the refused-Undo fix has no browser test; the three reads' tidiness notes (D489); (e) `npm run docsize`; push (never while a run is going); the report with pictures — `walk2/w9b-phone-3-after-undo.png`, `walk2/w5-pc-1-to-go-out.png`, `walk/w1-pc-edit-bar.png`, `walk/w3-pc-3-after-undo.png`, and the re-walk's — and the branch's Vercel link from the pull request.
  - **Recorded by chat 63, not faults of this change:** the scheduler has no keyboard Undo (Ctrl+Z); Escape does not close the changes window ([CHGWIN-ESCAPE]); the next-week preview draws no issues bar (by design).
  - **His to answer, not yet put (D994 — ask once, in the morning report, whether he wants this small round now):** as chat 62's block listed — Escape and the changes window; Tab and the board's buttons; the drawings that need his look (D1625); the two other "N warning" places. Chat 61 told him these needed no answer; that was wrong for these — say so.
- **Job 2 — the rules-first review** ([ENGINE-RULES-REVIEW], D1983; nothing in the app changes): PREPARED, not started. In the scratch folder's `engine-review/`: `worklist.md` (96 items W1–W96 covering 127 numbered rulings, in nine families; 16 rulings no test names; 46 pairs) and `family-brief.md` (one reviewer per family). **To do:** cut `claude/engine-rules-review` from `origin/main` in the night's checkout once job 1 is pushed and closed; commit the worklist as `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-worklist.md` and the brief as `raptor-port/docs/superpowers/briefs/2026-11-11-engine-rules-review-family-brief.md`; then ONE reviewer helper per family, one after another, each writing ONE new test file `raptor-port/src/engine/rulesfirst-<n>-<slug>.test.ts` and its results to the scratch folder (`engine-review/family-<n>-results.md`); a finding is a test of what he ruled, seen red, then marked `it.fails` (the host's technical choice, so GitHub's run stays green and the test turns red the day the app is fixed). The families: 1 report times, rallies, briefs, where a day starts (13 items); 2 standby lines and those that fly (13); 3 crew rest, the run of days, the long work day, turns (13); 4 availability, absences, inputs against a seat (14); 5 seats, pairing, quals, placeholders (8); 6 hidden warnings and the issue counts (6); 7 the published day, amendments, the freeze (11); 8 OIL hours — how a day is measured, which version pays (9); 9 OIL — which seats and people earn (9). Then: the host reproduces every finding; the report for him in plain words (`raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md`, and a page for his phone), each finding put to him or filed; the whole unit suite under the lock, `tsc -b`, `npm run rulecheck`, `npm run docsize`; its pull request into `main`, GitHub's run green. About 4 to 5 hours (a guess).
- **Job 3 — two small Quals faults** ([QUALS-OUTLINE-RESCROLL], [QUALS-PINNED-HEAD-NO-DRAG]): one branch from `main` (`claude/quals-small-1111`), WALK, about 2 hours (a guess). **Job 4 — the Leave War's double tap** ([LW-DOUBLETAP-OTHER-WINDOWS]): its own branch from `main` (`claude/lw-doubletap-windows`), tests first, walked on a phone, about 2 hours (a guess). Each: one fresh builder helper, a Sonnet walker, Astra's read and a fresh, blind Opus read, the bug-check order in full.
- **Ports:** 4173, 4188, 4191, 4197, 4463 and 4477 have been used tonight or by other chats — check a port is free before use.
- **Questions waiting for him:** none yet.
- **Rulings:** none this chat so far (his selection and "Low" are the night's settings, not rulings, D869). **Walk:** job 1's by chat 63 — `raptor-port/docs/handpass/2026-11-10-sched-board-small.md` · 81 + 21 pictures · 3 drawers, the window's 4 openers, 9 Undo routes · MISSING: 1 fixed (W9b), 2 filed for his word; the re-walk of tonight's fixes NOT DONE yet. **Reads owed:** none for job 1 beyond the narrow read running. **Next chat number:** 65 (D1744).
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
