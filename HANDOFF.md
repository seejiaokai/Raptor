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
<!-- now:claude/lw-grid-hover-design-200c6e -->
### CHAT 96 — two Leave War design jobs (mock-ups only, no app code), written 17 Nov 26 — verify before use
- **Branch:** `claude/lw-grid-hover-design-200c6e`, cut from `main` at 3a51c06a; pushed; no pull request yet (it is notes and mock-ups only — open one as a notes-only pull request once the options pages are done).
- **Job 1, the grid's hover mark (D2151, D2152):** question page https://claude.ai/artifact/G83PmGZE9Wntv9VjA7gawp, source `raptor-port/docs/mock/2026-11-17-lw-grid-hover/` (script `today.mjs`, against a local `vite preview` on port 4191). Ruled: on a desktop the one day under the mouse wears a hollow cyan ring in the tapped day's strength (`matrix.css` `.mx td.selcell`: inset 1px rgba(59,198,232,.6), with no fill). **Next:** draw it on the real app at 1536 (inject `.mx tbody td:hover{box-shadow:inset 0 0 0 1px rgba(59,198,232,.6)}`), today beside proposed, and put it to him; today's faint row tint stays unless he says.
- **Job 2, the OIL award editor (D2150):** options page published, https://claude.ai/artifact/L45vtW9hopGHDtwp9yaN9H, source `raptor-port/docs/mock/2026-11-17-lw-oil-editor/` (script `oil.mjs`). Recommended option 1 (fixed grid, AM / PM greyed when not a half day, Delete as wide as "Really delete?"). **Waiting for his answer.**
- **Job 3, the Balances page's alignment (D2153):** his desktop picture shows headings not over their figures. **Next:** picture today on the real app (Balances tab) at 1536 and 402, draw 2–3 neater layouts by injected CSS, today beside proposed, publish, put to him. With it (D2154): the amber pending figures (Pending column's "−2.5", the "−1" after CCL / CL) are read by some as days taken this year — redraw so they read as days waiting for approval (e.g. a labelled "2.5 pending" tag, or a pending chip inside the cell), D1253 standing until he approves.
- **Rulings:** D2150–D2154 → the Leave War page. Numbers D2150 up are this chat's range (another chat holds the D2130s).
- **Reads owed:** none (no code). **Walk:** none (pictures only).
<!-- /now -->
<!-- now:claude/multi-sqn-design-r3 -->
### CHAT 92 — multi-squadron round 2, then the night of 17 Nov 26 (six jobs, all done), rewritten 17 Nov 26 after his "merge live" — verify before use
- **Where it started:** round 2 of the multi-squadron design (answered, D2099–D2111), then `/overnight 12` on Low with his "yes all as recommended … run jobs 1-5 tonight", plus a job of his own (6). Nothing merged at night; nothing on `main`. The chat compacted at 00:37 and about 06:00; each time the block, the guide and the step were re-read.
- **Shipped (all branches cut from `main`, level with it when written; check before acting):**
  - Job 6 — round 3 of the multi-squadron design, on this branch: https://claude.ai/artifact/JoPDDtnY2twJQpmesinuHF (version 2); source `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/`, pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`; the spec `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` carries round 2's answers and round 3. A fresh Opus reader's 17 findings fixed. No pull request.
  - Job 1 — caps and ops limits, design round 1, `claude/caps-design-r1` (95f7bafb8): https://claude.ai/artifact/9VQ2YL9CceeCZL6XgQRS4p (version 1); spec `raptor-port/docs/superpowers/specs/2026-11-17-caps-design.md`. A fresh Opus reader's 13 findings fixed. No pull request.
  - Job 2 — the schedule's small fixes (Escape closes ALL AVAIL and the changes window, D2112; the phone week's count tap opens its window; React Doctor's two; the rules check's leftovers), `claude/sched-small-fixes`, pull request 794, MERGED 17 Nov 26 on his "merge live" and live on Vercel. Evidence `raptor-port/docs/handpass/2026-11-17-sched-small-fixes.md`. The cyan keyboard ring on the count after Escape (D1646) went live with it; he was told and did not strike it.
  - Job 3 — pictures for the eight held schedule fixes, `claude/held-fixes-pictures` (d99ec53cc): `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, 37 pictures; kept until he asks (D994), not published. No pull request.
  - Job 4 — the Tracker's small fixes prepared, `claude/trk-small-prep` (983840972): `raptor-port/docs/mock/2026-11-17-trk-small/page.html`, 27 pictures; a cancelled medical proved possible today (`[TRK-DOWN-DAYS-CANCELLED]`, recommended A); `[TRK-MENU-KEYS]` and `[TRK-NO-TYPED-STUDENT]` drawn. No pull request.
  - Job 5 — stale backlog and handoff lines, `claude/stale-records-17nov` (564b5e361), notes only: two items archived, stale "waiting for merge" lines corrected, the handoff's Next items 0 and 3. It and `claude/caps-design-r1` both change the caps and progress-graph priority lines: the second to merge keeps job 5's wording and adds caps's "design round 1 drawn 17 Nov 26". Left (not on its list): `[LW-PO-DAYS-DRAWING]` "close once live" (live 6 Nov, pull request 646), `[SCHED-MARKS-WALK-ODDS]` "go live with the batch of four" (merged 14 Nov), the handoff's "RIGHT NOW (7 Nov 26)" line. No pull request.
- **Unfinished:** jobs 6, 1, 3 and 5 (notes only) merged as one, `claude/night-notes-17nov` (D1407, D822). Job 4's `claude/trk-small-prep` and chat 91's skill notes (pull request 793) merged on his "merge live" (17 Nov 26), as one, `claude/trk-skill-notes-17nov`. Nothing of the night is left unmerged.
- **Branch:** `claude/multi-sqn-design-r3` merged into `main` with the night's notes; the next chat starts as a new job, level with `origin/main`, never on it.
- **Gates:** GitHub's run of 794 on a9cf5d591 green, and `main`'s after the merge (22 of 22 on c96154e0d, the code check included). On his PC, job 2: 24 Escape cases, 86 Escape-related files 2,407 pass, the full unit suite 14,538 pass 1 fail (a Leave War double-tap timing test, passing alone twice), build, lint, docsize and rulecheck OK. `probes:adapted` and `perf` not run (no layout change). The other jobs: docsize only (notes and pictures).
- **Open questions for him:** round 3's Q1–Q7 and R1–R3 (Q5 moves "+ Line" to the wave's foot, changing D2106; Q6 the clash of D2089 with D2105); the caps page's Q1–Q8, R1–R4 and its platform flag (answers in the browser can be read; a Power Platform flow is the route to ask the IT side); `[INPUT-WIN-SCHED-ASKS]` (does D1622's "Close it and lose them?" cover the schedule's input window?); the held fixes and the Tracker pages, when he asks (D994).
- **Also open, waiting for his merge live:** none.
- **Running when written:** none.
- **Pick up here:** his answers to round 3 and the caps page, recorded the moment he gives them; then the multi-squadron build or caps round 2, by his answers.
- **Opening line:** "This is chat 93 (the next free number in `main`'s HANDOFF.md when you start — check it). A new job: run `git fetch origin` and check this branch is level with `origin/main`. If `git status --short --untracked-files=no` shows changes you did not make, or another chat works in this folder, do not switch branches here: `git worktree add --no-track -b claude/r3-answers ../Raptor-r3a origin/main` and work only there. Read `HANDOFF.md` — the `claude/multi-sqn-design-r3` block under `## Now` — then take my answers to round 3 and the caps page."
- **Rulings:** D2099–D2112 recorded → the scheduler's page · **Walk:** job 2 walked twice (the walk, then the re-walk after the reads' fixes), desktop and phone, all PASS, 211 pictures, `raptor-port/docs/handpass/2026-11-17-sched-small-fixes/`; jobs 6, 1, 3, 4 and 5 are drawings or notes, no walk · **Reads owed:** none (job 2 had Astra's and a fresh Opus read; jobs 3 and 4 had no fresh reader, by the plan) · **Next chat number:** 93 (D1744)
<!-- /now -->
## Next, in order

**HIS ORDER OF WORK (D2086, 16 Nov 26):** the multi-squadron and detachment design, design only (`[MULTI-SQN-DESIGN]`) → caps and ops limits with the schedule's small fixes (`[CAPS-OPS-LIMITS]`) → the Tracker expansion with the Tracker's small fixes → the multi-squadron build last, at the database step.

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
