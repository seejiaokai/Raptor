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
<!-- now:claude/d1972-ended-1114 -->
### CHAT 73 — the guide check (D2038) FINISHED and live: pull request 774 merged 14 Nov 26 on his "merge live now it's ok"; this notes-only pull request records D1972's early end — written 14 Nov 26, 18:45, before its merge, to be true once it is live — verify before use
- **Shipped:** pull request 773 (notes: chat 72's and chat 64's merged blocks retired, their residue filed) and pull request 774 (the guide check's approved edits — a, b, c, d, e, f, g, k and the first read's one fix; h and j left on his word; i done in his global file as "the latest Fable, high"). Read each round by Astra and a fresh, blind Opus reader: `raptor-port/docs/superpowers/briefs/2026-11-14-guide-check-*`; the outcome at the foot of `…/2026-11-14-prompt-audit.md`. D2038 spent, [PROMPT-AUDIT] archived.
- **His word, 14 Nov 26:** *"Merge live now it's ok"* — told that point d retires D1972 (Fable hosts his chats for the week to 16 Nov 26) two days early. Its archived row's mark now reads SPENT 14 Nov 26 (this pull request). Opus plans and builds again from now (D67).
- **Branch:** `claude/d1972-ended-1114`, notes only — merges by itself once green (D1407). Nothing of this job is left.
- **Gates:** pull request 774's last run green before its merge; on his PC `docsize` and `rulecheck`. No app code changed (tier NONE, no walk).
- **Pick up here:** nothing; the next job is his to name. **Rulings:** D1972's end moved to 14 Nov 26 (its archived row); no new number. **Reads owed:** none. **Next chat number:** 74 (D1744).
<!-- /now -->
<!-- now:claude/quals-small-1111 -->
### CHAT 64 — THE NIGHT OF 11 Nov 26, JOB 3: two small Quals faults ([QUALS-OUTLINE-RESCROLL], [QUALS-PINNED-HEAD-NO-DRAG]) — rewritten 11 Nov 26, 08:40, DONE: built, walked, read, fixed twice, re-walked, recorded (pull request 758, waiting for his look and "merge live") — verify before use
- **After a compaction: re-read this block, the night's own block (below), the overnight guide and the files of the step in hand before the next change; note the compaction here with its time, read from the clock (`date`).** Compactions so far on this job: one, at 07:46 (the night's third; the two before were at about 03:30, on job 1, and about 05:40, on job 2).
- **The night's own block** — his selection, Low, the four jobs, the questions waiting for him, the allowance — is chat 64's block on branch `claude/next-jobs-recommendation-c110df` (pull request 756): `git show origin/claude/next-jobs-recommendation-c110df:HANDOFF.md`, that branch's own block under `## Now` (in Git Bash set `MSYS_NO_PATHCONV=1` first). The coordinator's newer scratch note: `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/NIGHT-STATE.md` — READ IT. Nothing merges, nothing touches `main`; one notification, in the morning; helpers one after another (Low); the coordinator waits by ending its turn with a background timer armed (a Monitor, `sleep 1700`, re-armed at each expiry); the night ends about 12:35, the last hour (from about 11:30) kept for the report. **Job 1 done, pushed, green** (pull request 756, his look); **job 2 done, pushed, green** (pull request 757 — the rules-first review's tests and report; its block is on `claude/engine-rules-review`; its report as a phone page: `https://claude.ai/artifact/XUMu5RzofZJJyXSwcHRkpp`); **job 3 done — this block**; **job 4** (the Leave War's double tap, `claude/lw-doubletap-windows` from `main`; its builder's brief is the scratch folder's `job4/builder-brief.md`): only its build may fit before the report hour — started only if this job's records are pushed by about 09:30, otherwise left and said so in the report; never a check cut.
- **What the job changed in the app** (branch `claude/quals-small-1111`, cut from `main` at `24a75372d`; the last change to the app is `8ed7b7688`, GitHub's run green on it): (A) on Quals, after "Check his quals", "Check my quals" or an Undo / Redo sends the page to a man's row, the page goes to him ONCE — a later tick, sort or any other change never throws the page back to him; with the filter box hiding him, the trip waits until his row is drawn again (the filter cleared). (B) in Edit quals with the page scrolled down, a heading in the pinned row under the top bar drags its column exactly as the table's own heading does, by mouse and by a finger; a second finger, or a mouse press during a finger's drag, cancels the drag on both heading rows. Nothing else a person sees changes.
- **How it was checked** (tier WALK; the sheet `raptor-port/docs/handpass/2026-11-11-quals-small.md`, all sixteen sections filled; 287 pictures in `raptor-port/docs/img/handpass/2026-11-11-quals-small/`): a Sonnet walker's walk on the first build (report `raptor-port/docs/handpass/parts/2026-11-11-quals-small-walk.md`) — one fault, the filter case; Astra's read and a fresh, blind Opus read (one finding each beyond the walk's, and one they read opposite ways, settled by a red test with two real fingers — Astra right); a fix round (`b8ac2e65d`, `c242ba658`); a narrow read by a fresh Opus reader (one finding, three suspicions — each made red in a test); a second fix round (`cd00ef07e`, `8ed7b7688`); a second narrow read (no findings); the re-walk on the last build by the same walker (report `…/parts/2026-11-11-quals-small-rewalk.md`) — every scenario it could drive PASSED; the host's own look at two doubtful phone lines (the walker's aim, not the app). All four reads and every brief are in `raptor-port/docs/superpowers/briefs/2026-11-11-quals-small-*.md`. On his PC under the lock: the whole unit suite on the first build and on the fix round (14,089 pass, 0 failed), the touched test files on the second round; GitHub's run green on `d4824ec68`, `ae996bffb`, `a15a668e7` and `8ed7b7688`.
- **For his morning** (the preview: `https://raptor-git-claude-quals-small-1111-kai-e2f5.vercel.app` — check it is Ready on the last pushed commit before sending): (1) **one line to tell him, his to change:** with the filter box hiding the man the page is sent to, clearing the filter takes the page to him — away from the filter box he is typing in (before this job the page did the same; the first build had lost it, the fix put it back). (2) **his iPhone look**, since no test browser makes a finger's drag in Safari: in Edit quals, scrolled down, drag a pinned heading by a finger; put a second finger down during a drag (nothing should move); "Check his quals" for a man far down, then tick someone else (the page must stay). (3) pictures for the page: `a-pc4/A1-pc-1-arrived-outlined.png`, `a-pc4/A2-pc-13-drag-pinned.png`, `b-phone4/B2-phone-5-mid-drag.png`, `r-filter-phone/R1c-phone-4-plus1s.png`.
- **Filed, not built** (`OUTSTANDING.md`): `[QUALS-PINNED-X-DEAD]` — the ✕ inside a pinned heading does nothing (older); `[QUALS-DRAG-LEFTOVERS]` — eight small points, his iPhone look first (two fingers on the pinned row do not zoom the table; no Escape cancels a column drag; the outline never ends while the page is open — his to say; the lift frame after a resize mid-drag; two cases no test holds; the rest). The two items built stay in the backlog, marked BUILT, until the merge.
- **Left in the checkout, untracked, on purpose:** the walker's failed-attempt picture folders (`a-pc`, `a-pc2`, `a-pc3`, `a5-pc`, `b-phone`, `b-phone2`, `b-phone3`, `tmp`, `wk`, `r-2f`, loose files at the folder's top) — the walker's delete was refused and the host does not delete for it; never `git add` the picture folder whole.
- **Questions waiting for him:** none from this job (the filter line above is told, not asked).
- **Rulings:** none this chat so far. **Walk:** `raptor-port/docs/handpass/2026-11-11-quals-small.md` · 287 pictures · 11 surfaces · 18 orders · MISSING: 1, older — the ✕ inside a pinned heading, filed. **Reads owed:** none. **Next chat number:** 65 (D1744).
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
