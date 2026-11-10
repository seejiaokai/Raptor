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
<!-- now:claude/night3-leftovers -->
### CHAT 50 — night 3's leftovers: [RULINGS-SPENT-PASS], [CAL-JOB-LEFT], [LW-READS-OWED-1024], [REPO-TIDY] (1), the stale "waiting on his look" line — IN PROGRESS — written 10 Nov 26 — verify before use
- **Folder:** this chat works in its OWN folder, `C:\Users\User\projects\Raptor-n3`, branch `claude/night3-leftovers` (no upstream: push with `git push -u origin claude/night3-leftovers`). The main folder belongs to chat 51 (the Leave War frozen-bar stutter, `claude/lw-frozen-bar-stutter`) — never switch it. At 08:48 chat 51 cut its branch in the shared main folder and this chat's first commit landed there; moved back (`git branch -f` + `git reset --keep`, nothing pushed, nothing lost) — skill note 917 (chat 51's 916 is the same event).
- **Done:** (1) the stale line — no pull request is open; 636, 637, 639, 641 merged 5–6 Nov 26; the pictures round marked done, its last two items ([SCHED-UNAV-PENDING-MARK], [READONLY-WEEK-WORDS], built by chat 13, pull request 691) archived. (2) [REPO-TIDY] (1) — 30 leftover folders audited; the clean ones with no live chat removed by `wt-remove.sh` (12 under `.claude/worktrees`, `Raptor-ui4`, `Raptor-ui4b`, four scratch copies) — CHECK its result before recording; KEPT on purpose: `agent-a9aa54061d87f01bc` (branch `m5a-e2e-fix`: two commits never pushed nor in `main` — "M5a e2e: the browser tests read M5a's screens…", "…docked person window stands above Approvals' slim bar"), `pr-oil-earn-ffbf07` (two re-taken pictures over 27 Oct evidence, uncommitted), `sync-main-handoff-fe9391` (an uncommitted iPhone guide: `docs/img/handpass/2026-10-29-iphone-guide/` and `scripts/handpass/iphone-guide.mjs`, never in `main`), the `.codex` folder (Codex's, locked), and the eight folders of chats still in his sidebar (all merged — free once he archives those chats). (3) [RULINGS-SPENT-PASS], first part — D1717, D1747, D1933, D1938 marked SPENT and archived; How we work's stopped-diet line rewritten to what stands (D1932's hard size limit). The size half of the item is settled by the rules diet (every area a page under a hard limit; the scheduler's page 82,303 of 120,888 — nothing to put back to him under D611).
- **In hand:** a fresh Opus helper is listing spent or replaced rulings in the other areas (report to be saved as `raptor-port/docs/superpowers/briefs/2026-11-10-rulings-spent-candidates.md`); each candidate is checked sentence by sentence before its mark.
- **Next:** (a) the helper's candidates. (b) A SECOND pull request, working guides — his "merge live", Astra + a fresh Opus reader first: D1743 (his Codex window, ended Mon 9 Nov 26 19:00; its open point answered by D1770) marked SPENT, and every line citing it rewritten — How we work lines on Astra and the allowance, the Leave War and scheduler pages' diet lines, `bug-check.md`, `doc-structure.md`, `bug-check-order.md` §Who reads; [CAL-JOB-LEFT] (1) — `AGENTS.md`'s "D567–D585 stay reserved for the calendar branch" and "the calendar's work continues on `codex/inputs-sans-calendar`" (the branch is wholly in `main`, live as pull request 487), `codex-guide.md`'s "the job on hold is the SANS … calendar's new layout"; and D610's line on How we work rewritten to what stands (nothing of that work is deleted; its full row marked ANSWERED BY D614). (c) [CAL-JOB-LEFT] (2) — the short-line reads it owes are overtaken: those short lines became pages read blind by Astra and Opus in the rules diet; record that and archive the item, (4)–(6) kept with a home. (d) [LW-READS-OWED-1024] — one fresh, blind Opus reader: design lessons 49, 50, 52 against his words (the fix worded in `raptor-port/docs/handpass/parts/lw-1025/reads-1305-1355.md`) and D1297's sweep of earlier evidence sheets. (e) Night 3's line in the priority list marked done; this block rewritten; the notes pull request merges itself once green (D1407).
- **Rulings:** none this chat. **Reads owed:** none yet. **Next chat number:** 52, unless chat 51's own successor (it was handing off at 80% full) took it — check the blocks.
<!-- /now -->
<!-- now:claude/skill-notes-review-2026-11-10 -->
### CHAT 49 — THE NIGHT OF 9–10 NOV 26 and his morning answers: the skill-notes review INSTALLED; three pull requests merging on his "merge live" — written 10 Nov 26 — verify before use
- **The night:** the task-observer review of 160 notes (20 guide drafts, read by Astra and a fresh Opus reader, both rounds fixed); [DOCSIZE-PATHS-OPEN] (pull request 738) and [WORD-LIST] (pull request 739) each on its own branch, both read twice. The chat compacted about 07:30, 10 Nov 26.
- **His answers, 10 Nov 26:** OML is ordinary medical leave (D1950 — the Leave War's medical label corrected on 739, the word list settled); "all as recommended" — a screen question is answered on the device his picture shows (D1951, the How we work page), notes 751 and 909 closed (DECLINED), the review approved; then "Merge live after" for all three.
- **Installed on this branch (737):** the 20 guides over the live files; 158 note statuses written, 3 left OPEN (120, 122, 915); last review date 10 Nov 26; the memory note on side chats added; the backlog items filed ([READER-COMPACT-HANDOFF], [DRAW-MARK-HELPER], [RULE-FILE-LESSONS], [CHECK-TOOLS-HARDEN] (d)–(r)); [BUGCHECK-LESSON-ORDER] and [MAIN-CHECKOUT-STALE] done and archived; D1795 and D1796 (chat 3's auto merge live) marked spent and archived, which made room on the How we work page; the holding folder deleted (git keeps it). The resolved notes move to the archive at the next review's start, as last time. `rulecheck` OK, `docsize` OK.
- **Merged on his "merge live" of 10 Nov 26:** 738 (live on Vercel) and 739, then 737 — one at a time under the merge lock; [DOCSIZE-PATHS-OPEN] archived; [WORD-LIST] marked live, left open while the general rules name it with [SKILL-FUSION]. **Next:** bring the main folder level (this folder — `raptor-port/docs/gates-and-deploy.md`, "A worktree chat loads its settings…"), since 737 changes skills. **Rulings:** D1950, D1951. **Reads owed:** none. **Next chat number:** 50 (D1744).
<!-- /now -->
<!-- now:claude/rules-diet-followup-4a76cd -->
### CHAT 48 — the rules diet's one follow-up, [RULES-DIET-FOLLOWUP] (D1949) — MERGED 10 Nov 26 on his "merge live" (pull request 735; main's runs green) — written 10 Nov 26 — verify before use
- **Done:** (1) the scheduler's rulings page no longer loads with the performance guide or the ripple map (its `paths:` lose `docs/performance.md` and `docs/feature-impact.md`). With (2), by `docsize --reads`: a Leave War job's whole read 304,434 → about 265,000 tokens, a Tracker job's 270,651 → about 230,400, the scheduler and Inputs jobs each about 9,200 less. With the app's fixed share (about 83,000) a Leave War job that obeys every read is about 348,000, under the point a chat compacts (about 368,000). Every scheduler-page line naming the Leave War, or held for every screen, was checked against what a Leave War or Tracker job still loads; the Leave War rulings stated only there are named on new pointer lines of the Leave War page ("From other areas"), with a line that the page no longer loads through the two guides; the Tracker's page gets that line too. The performance guide (top of Part 1) and the ripple map ("How to read it") point to the area pages; the measure script's header says what loads now. (2) Six merged blocks removed from this file (`chat19-checks`, `pr-sched-marks-3205d7`, `coordinator-2`, `m365-it-answers`, chats 46 and 47); their leftovers filed: `[SCHED-MARKS-ASKS]` (new), `[IT-QUESTIONS]`, `[CHECK-TOOLS-HARDEN]` (with chat 27's readers' tidiness notes), `[RULES-DIET]` (the general page full).
- **The skill-notes review (from the coordinator's block):** the log holds 160 open notes, last reviewed 27 Oct 26 — a review is a job of its own, offered to him; not started.
- **Seen, not changed:** the Leave War's architecture file still loads in a Tracker job through the performance guide (about 6,900 tokens); a Leave War browser test or mock-up still loads the scheduler page (`e2e/**`, `docs/mock/**`).
- **Reads:** Astra and a fresh Opus reader, blind (`raptor-port/docs/superpowers/briefs/2026-11-10-rules-diet-followup-read-{brief,astra,opus}.md`); every finding fixed (the backlog item lists them); the fixed lines re-read by the Opus reader. **Reads owed:** none.
- **Branch:** `claude/rules-diet-followup-4a76cd`, merged and released; these closing records on `claude/chat48-records`, a notes-only pull request merging by itself once green (D1407); `[RULES-DIET-FOLLOWUP]` archived. The next chat starts as a new job from `main` — the rules diet is finished but for D1762's later step; pick from `## Next, in order` or his word. **Gates:** docsize green. **Walk:** none — nothing of the app changes.
- **Rulings:** none new this chat. **Next chat number:** 49 (D1744).
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
