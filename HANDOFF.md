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
<!-- now:claude/multi-sqn-design-r3 -->
### CHAT 92 — THE NIGHT OF 17 NOV 26 (overnight run, 12 h from about 01:15, Low)
- After a compaction: re-read this block, the overnight guide and the files of the step in hand before the next change; note the compaction here with its time, read from the clock (`date`).
- **His selection (17 Nov ~01:10):** "yes all as recommended … u can also run jobs 1-5 tonight on low", plus a job of his own (6). Read as: round 2's answers all as recommended (recorded D2102–D2111), the night's three questions as recommended (Q1 run the schedule's small fixes ahead of caps — yes; Q2 Escape closes the changes window — yes, D2112; Q3 start caps's design before round 2 — yes, moot now), Low: one helper at a time. Nothing merges; nothing on `main`. One notification at the end.
- **The night's order** (his own job first, the last job left if time runs short — about 12¼ h of work in 11):
  6. **Multi-squadron design review and walkthrough — his job, his words (17 Nov):** "could u take a look at your design for the detachment and sqn … is this design good … based on our design skill … does it affect other functions … is it user friendly … if 149 is going to be in the same home as 142, how does the user run through the interface to put these sqns in the same location … if the admin scheduler has to click twice to create a line, is that a lot more work? should we have that window open while the click happens multiple times until the admin closes the window by clicking outside it … but the user may also realise that the input they click is not in their view and the user keeps clicking, only to find out there's a lot of lines created … think thoroughly … how the user interface is like and show me mock ups of your design." Deliver: a round-3 questions page (Artifact, new) — a critique of the whole design by the design guide (§0, §3, §9 lessons, `/impeccable critique`), its ripple across the app (`raptor-port/docs/feature-impact.md`), end-to-end walkthroughs drawn on the real app (Admin → Squadrons: set 149's place to 142's home; a detachment opened, manned, closed; 142 joining 149's wave and adding lines; the signing orders), and his "+ Line" idea weighed (a card that stays open for repeated taps vs the risk of lines made out of view — e.g. each tap adds the line in view with the just-added ring and a count on the card, or a stepper "Add 3 lines") with a recommendation, today beside proposed, desktop and phone. Also the stale records the design lists (D201): the spec `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` updated with D2099–D2111. Branch: this one, `claude/multi-sqn-design-r3`; script `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/`, pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`. Check: one fresh Opus reader of the page against his words. Nothing in the app changes. ~2½ h.
  1. **Caps and ops limits, design round 1** — the four points D2084 left open, each with a recommendation and mock-ups on the real app. Branch `claude/caps-design-r1` from `main`. Check: one fresh Opus reader. Nothing in the app changes. ~2½ h.
  2. **The schedule's small fixes** — Escape closes the ALL AVAIL window and the changes window (D2112); the phone week's ALL AVAIL count checked, fixed if it opens the crew list; React Doctor's last two findings in the schedule's tap code; the rules check's unfinished checks (two old walk scripts, one end-to-end test, print and export walked). Branch `claude/sched-small-fixes` from `main`, its pull request opened once built. Check: WALK, one Sonnet walker, phone and desktop, the plain-user round; Astra and a fresh, blind Opus read. ~3 h.
  3. **Pictures for the schedule's held small fixes** (the standby "Illegal seat (no times yet)" words, "+ Block"'s "BB desk", the singular "warning", the look banner on two lines, "N changes" beside "N pending", the damaged week's notices, the missing "Original" entry, the late cut-off box) — a questions page kept until he says (D994). Branch `claude/held-fixes-pictures` from `main`. Nothing in the app changes. ~2 h.
  4. **The Tracker's small fixes prepared** — whether a cancelled medical input can exist today; pictures for the menus under the keys and the typed-student box. Branch `claude/trk-small-prep` from `main`. Nothing in the app changes. ~1½ h.
  5. **Stale backlog and handoff lines put right** — the list in the planning helper's report (scratch `overnight-plan.txt` §5; copied below). Notes only, waits for the morning. Branch `claude/stale-records-17nov` from `main`. ~45 min.
- **Stale lines found (job 5's list):** the priority list's batch of four and the rules check "waiting for merge live" (merged 14 Nov); [ONE-RULE-LEFTOVERS], [DOC-POINTERS-CODE] "awaiting merge" (merged 14 Nov); [CI-BROWSER-DEPS-DOWNLOAD] "main red, waits for merge live 761" (761 merged 14 Nov); [TRK-STANDALONE-LEFTOVERS] "archive once live" (merged, pull request 637); three Quals items "close once live" (merged 6–8 Nov); priority lines for [LW-MORE-BELOW-CUE] and [CSS-WRAPPER-GUARD] whose items are archived; [BATCH-14OCT-LEFTOVERS] ready to archive whole; [VEILED-WINDOWS-BAR]'s bar part looks built (D1645, pull request 636); the handoff's Next item 0 names [WORKSPAN-NEGATIVE] and item 3 [SAVE-NOTE-COVERS], both archived; the caps item "cancelled, wait for the owner" and the progress graph before caps in the priority line — D2086 superseded both.
- **Done before the night (this chat):** round 2's page (https://claude.ai/artifact/E3TMwG749ZYmxxJo1YggNS, version 4) — B1 redrawn after "so ugly" (D2099, look 2 chosen D2104), B7 dropped (D2100), A1 answered (D2101), B3 drawn in both signing orders and the join flow (pictures 10–12); all of round 2 answered (D2102–D2111). Pictures `raptor-port/docs/img/2026-11-16-multi-sqn-r2/`, script `raptor-port/docs/mock/2026-11-16-multi-sqn-r2/draw.mjs` (`pic5b`, `pic10`, `pic12`). A preview of the built app serves on port 4180 (stop it by port at the end).
- **Compactions:** one at 00:37, 17 Nov (just after the night's block was pushed and job 6's helper started); the block, the guide and the step re-read.
- **Progress through the night:**
  - Job 6 DONE 00:37–01:40: the round-3 page, https://claude.ai/artifact/JoPDDtnY2twJQpmesinuHF (version 1; source `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/page.html`, pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`, script `draw.mjs` there). The spec has a section for round 2's answers (D2099–D2111), and the file map is updated. The fresh Opus reader returned 17 findings (6 must); I confirmed three on the page myself, and all 17 were fixed in one batch. One was fixed differently: the board has no room after the mission, so the "142" badge sits inside the mission box on the board only, put to him as R2. The critique was one pass, no extra readers, on Low. Nothing in the app changed.
  - Job 1 (caps) next, on its own branch from `main`.
- **Questions waiting for him:** round 3's page, Q1–Q7 and R1–R3, each with its recommendation. Q5 recommends moving "+ Line" to the wave's foot, which would change D2106's "stays as today". Q6 names the clash between D2089 and D2105.
- **Also waiting:** chat 91's three skill notes (957–959) on `claude/skill-notes-chat91`, his "merge live". His real schedule pictures hold real names — never in the project; the caps example's public link is never written into the repo.
- **Rulings:** D2099–D2112 recorded → the scheduler's page · **Walk:** none yet (job 6 is drawings only, nothing in the app changed) · **Reads owed:** none yet · **Next chat number:** 93 (D1744)
<!-- /now -->
## Next, in order

**HIS ORDER OF WORK (D2086, 16 Nov 26):** the multi-squadron and detachment design, design only (`[MULTI-SQN-DESIGN]`) → caps and ops limits with the schedule's small fixes (`[CAPS-OPS-LIMITS]`) → the Tracker expansion with the Tracker's small fixes → the multi-squadron build last, at the database step.

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
