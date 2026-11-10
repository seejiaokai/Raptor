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
<!-- now:claude/skills-tighten-2-9a9f74 -->
### CHAT 59 — [SKILLS-TIGHTEN] step 2: the session-handoff skill's list PUT TO HIM, his answer awaited; the skill NOT changed — written 10 Nov 26, 19:22, its merge noted 19:31 — verify before use
- **Where it started:** chat 58's opening line, pull request 750 merged and live; he added: first correct the record lines that still said step 1 waited for his "merge live".
- **Shipped (notes only — pull request 751, merged by itself once green, 10 Nov 26 19:30, D1407):** those lines corrected (chat 58's block below, [SKILLS-TIGHTEN]'s item and its priority-list line); the list put to him, `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-session-handoff.md` — what would leave the skill (§B), where it has fallen behind a later ruling (§C, five corrections, one of which adds a line to the template), what is said once (§D) and shorter (§E), the estimate (§G: 29,508 bytes to about 17,000–19,000) and the method (§H).
- **Unfinished:** the rewrite itself — nothing in `.claude/skills/session-handoff/SKILL.md` is changed; it waits for his answer to the list.
- **Branch:** `claude/skills-tighten-2-9a9f74` — the app's own fresh folder and branch for this chat, level with `origin/main` when it started. The opening line's `git worktree add … ../Raptor-st2` was NOT run: this chat already had its own folder, and a chat started in a worktree may not write into another. Not released — the chat is open.
- **Gates:** `npm run docsize` OK (10 Nov 26). No app code changed.
- **Open questions for him:** the list — go as recommended, §C's corrections included?
- **Running when written:** none.
- **Pick up here:** on his answer, the plan's §H in order — copy the skill whole to `raptor-port/docs/archive/session-handoff-skill-2026-11-10.md`, rewrite, the writer's pass of skill note 922, then Astra and a fresh, blind Opus reader (D1761, D1738), fix, measure, his "merge live". Then step 3, the overnight skill, the same way (a list to him first); last, ask him about the outside skills. Chat 58's block below goes at this chat's handoff, after its residue read.
- **Opening line:** none yet — the chat is open.
- **Rulings:** none this chat. **Walk:** none — nothing of the app changed. **Reads owed:** none yet. **Next chat number:** 60 (D1744).
<!-- /now -->
<!-- now:claude/skills-tighten -->
### CHAT 58 — [SKILLS-TIGHTEN] step 1: the design guide REWRITTEN, both reads IN and every finding fixed — MERGED and live 10 Nov 26 on his "merge live", pull request 750 (D1737); the two skills NOT started — written 10 Nov 26, its merge noted by chat 59 — verify before use
- **Done (commit `82899c758`):** `raptor-port/docs/design-practices.md` from 137,131 to about 97,800 bytes — a screen job reads about 31,500 tokens of it, was about 45,900 (`docsize --reads`). §9: 68 lessons, one line each, newest first by date; each lesson as first written moved whole (`--move`) to `raptor-port/docs/archive/design-lessons-detail-2026-11-10.md`. Thirteen single-screen lessons left the list (93, 92, 81, 76, 74, 71, 67, 50, 21, 14, 5, 4, 3), each confirmed by a fresh reader as a rule on its own screen's rulings page; lesson 60 stays. Outside §9: the dated stories, the accounts of which words were his, text stated twice and pointers to archived backlog items taken out; the old wording copied whole to `raptor-port/docs/archive/design-practices-2026-11-10.md` (the old point 2 of `.claude/rules/ui-design.md` at its end). The short form's "Words" point in `.claude/rules/ui-design.md` is shorter.
- **Not taken from the plan's list, and why:** §B item 11 — §5's Tracker bounce stays, reworded: D987 stands, met by the phone's own scrolling (D992). §D — §3's "one row" and §0's list of his rulings left as they were: no word could go without a rule.
- **For his notice, from the fresh reader's check of the thirteen:** the rule of each is on its page, but his REASON is now only in the archive and the ruling's row for 93 (the two causes he named), 50 ("save vertical space"), 21 ("can't tell a half day"), 14 ("available to be planned"), 5 ("no symmetry"); lesson 81's working lesson (look at spacing by eye after a word beside a mark changes) was the agent's reading and left with it. He may ask for any back (D941).
- **The fresh Opus reader's read is IN and fixed:** ten findings (three changed meaning), each set beside the old wording, all fixed in commit `027b4012c`; its report: `raptor-port/docs/superpowers/briefs/2026-11-10-design-guide-tighten-read-opus.md`.
- **Astra's read is IN and fixed:** three findings, two of them the Opus reader's too and already fixed, one its own (lesson 64's exception named the Approvals list's PLACED column, not any list's last column); its report: `raptor-port/docs/superpowers/briefs/2026-11-10-design-guide-tighten-read-astra.md`. Astra read the first commit; the fixes after it were read by nobody but their writer — each puts back the original's own words.
- **Pick up here:** pull request 750 merged on his "merge live" and is live (10 Nov 26) — nothing of step 1 is left. Next, [SKILLS-TIGHTEN] step 2, the session-handoff skill, the same way (a list to him first, as chat 56 did for the guide) — taken up by chat 59 on `claude/skills-tighten-2-9a9f74`, never on this merged branch; then overnight; last, ask him about the outside skills.
- **From chat 57:** pull request 749 (`claude/chat57-skill-note`, skill notes 920–921) merged 10 Nov 26.
- **Branch:** `claude/skills-tighten`. **Gates:** `npm run docsize` OK (10 Nov 26). **Walk:** none — nothing of the app changed. **Rulings:** none this chat (D1976 and D1977 were recorded by chats 56 and 57). **Design lessons added:** none. **Reads owed:** none yet. **Next chat number:** 59 (D1744).
- **Opening line:** "Run `git fetch origin`. Read `HANDOFF.md` on `origin/main` if pull request 750 has merged, otherwise on `origin/claude/skills-tighten` — the `claude/skills-tighten` block under `## Now` (chat 58). If pull request 750 is still open, tell me and wait for my 'merge live' before anything else. Once it has merged, start [SKILLS-TIGHTEN] step 2, the session-handoff skill, as a new job level with `origin/main`: run `git worktree add --no-track -b claude/skills-tighten-2 ../Raptor-st2 origin/main` and work only there — never switch to the merged branch — and put the list of what would leave and what would be said shorter to me before changing the skill. Your chat number is 59."
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
