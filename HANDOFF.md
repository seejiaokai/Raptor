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
<!-- now:claude/multi-sqn-design-r4 -->
### CHAT 97 — multi-squadron design: the plan's red team run, round 6 put to him; written 17 Nov 26 — verify before use
- **Where it started:** chat 95 left the plan's red team owed (his question: was it red-teamed by Astra? no) and D2136 to draw.
- **Done (this branch):** the red team, Astra first and a fresh blind Opus reader, one brief — `raptor-port/docs/superpowers/briefs/2026-11-17-multi-sqn-red-team.md`, reports beside it (`…-astra.md` 7 findings, `…-opus.md` 16; five overlap); the host checked the claims it acts on against the rulings and code. Round 6's page — **https://claude.ai/artifact/VcdxV4u3iACCZKiW4ce9JL** — `raptor-port/docs/mock/2026-11-17-multi-sqn-r6/` (`draw.mjs` draws X1/X2, the Post out sheet with "Transfer to Sqn" working; the other pictures are rounds 2–4's shown again). The design note's §Round 6 lists every question.
- **Put to him, nothing ruled yet:** Q1 OIL on a day worked for both squadrons (one span, one credit, his own squadron's settings); Q2 Close detachment with published days after today (withdraw by amendment; past days still correctable — narrows D2103); Q3 a pick from 149's draft onto 142's published day (follows 149's published version — narrows D2107); Q4 "concerns both" = one squadron's own line in the other's wave only (corrects the agent's D2114 reading); Q5 "Scheduler of 149" and "Admin of 149" two grants (narrows D785); Q6 the worked-out Attach row never counts out on the Leave War (narrows D1374); Q7 Transfer to Sqn as drawn, with its carry table. R1–R11 his to strike; L nine for later rounds.
- **His correction D2139 (after round 6 went out):** the "Close Exercise North?" card's words are not clear on what will happen — redraw its words in round 7 (proposed words in the design note's §Round 6; the design guide's §2 already asks a question to name what will happen, so no new lesson).
- **His correction D2140 ("u are hallucinating. the quality of work is bad. I need more than 5 corrections"):** the Close card's drafts in this chat were wrong — a false reason given (an admin picks all four sign-off names, D212), lines contradicting each other, a fact dropped. **Redo the Close card from scratch in round 7**, every line checked against the rulings. His last question: who publishes AL1 on the cleared days, and before or after closing? Put to him as A (recommended: one press clears them and publishes AL1 on each) or B (Close greyed until he has published them himself); open: whose names stand on that AL1's four sign-offs.
- **Corrections told to him:** round 3's "a sortie on 149's schedule counts on the student's Tracker" was wrong (R10); round 4's picture 7 drew VL whole on 142's schedule against D2098 — redraw after Q4.
- **Pick up here:** 1. record his answers to Q1–Q7 (and any R he strikes) as rulings, fixing what each narrows (D201: D2103, D2107, D2114's reading, D785, D1374). 2. Round 7 draws what they need: Admin → Users' two grants (Q5), Close's card with its published-days line (Q2), the dotted Attach row (Q3), round 4's picture 7 redrawn (Q4), the transfer's bell line (Q7), the Close card's new words (D2139). 3. This branch's notes-only pull request (merges by itself once green, `shipping.md`) — still notes only.
- **Still open elsewhere:** the caps page's Q1–Q8, R1–R4 (https://claude.ai/artifact/9VQ2YL9CceeCZL6XgQRS4p); `[INPUT-WIN-SCHED-ASKS]`. Side chat 96 (Leave War grid hover / tap highlight) in its own worktree, rulings from D2150.
- **Gates:** docsize before the push. No app code.
- **Running when written:** none.
- **His answers at the end:** "raise the limit" (D2141, done); "A" (D2142, closing clears and publishes AL1 in one press). **His order for chat 98: FIRST show him your wording for everything discussed in chat 97** (the Close card; Q3 as rewritten; the transfer sheet lines), every line checked against his rulings before he sees it (D2140) — then his round 6 answers.
- **Rulings:** 4 recorded (D2139 → `scheduler.md`; D2140, D2141 → `how-we-work.md`, the document check; D2142 → the design note) · **Walk:** none — design only · **Reads owed:** none (Astra and the fresh Opus reader both read the plan) · **Next chat number:** 98 (D1744) · **Next free ruling:** D2143 (chat 96 holds D2150 up)
- **CHAT 98 (17 Nov 26), in its own folder `C:\Users\User\projects\Raptor-msqn`** (another chat — the wheel-drag job, which also calls itself chat 98 — switched the main folder to its branch mid-turn; nothing of this branch was written there). **Done:** his correction D2143 recorded (every change worked through for its knock-on effects to the second and third step, on D2140's line in `how-we-work.md`); the wording he asked for saved in the design note §Round 6 "Chat 98's wording" and put on round 6's page (same link, version 3): a block at the top, C1–C7 with recommendations — C1 the four sign-off names on Close's amendments (the day's last issue's), C2 149's home days left pending for its scheduler, C3 the closing day not cleared, C4 the home days named on the card, C5 a second bell line when 149 publishes, C6 his access to 142 ends at a transfer, C7 the transfer sheet's two lines, C8 the card names no amendment label when its days are on different ones (a range past 3 days) — and Q2, Q3, Q7 updated in place; Q2 now sketches the new Close card as a card (A plain, B full, each line numbered and explained), a sketch only — round 7 draws it on the real app. Corrections told to him: AL label per day; Q3's draft row faint grey, not dotted; the transfer bell Fri 3 Apr not Mon 3 Aug; the notifications register's P15 to read "Posted out · now with 149" (D58) — **P15 not yet edited, do it with round 7**. He asked twice why the old card (round 3's picture) does not show the clearing: it predates "A"; answered. **Pick up here:** record his C1–C7 and round 6 answers (Q1–Q7, R strikes), fixing what each narrows (D201); then round 7 in a fresh chat. **Next free ruling:** D2144 (other branches hold D2150 up).
- **CHAT 99 (17 Nov 26), same folder `Raptor-msqn`** (the main folder held the wheel-drag chat's unsaved work, so it was not switched). His answers to C1–C8 and Q1–Q7 were never on the page — **still not given**. **Done:** (1) his call: **Fable red-teamed the plan** on Astra's brief, blind to the two earlier reports, then the newest wording — brief `raptor-port/docs/superpowers/briefs/2026-11-17-multi-sqn-red-team-fable.md`, report `…-fable.report.md` (24 findings: 6 HIGH, 16 MEDIUM, 2 LOW; HIGH 1–4 overlap Q1, R2, Q2, R4). Host checks so far: #22 WRONG (no published-war freeze since D1177 — `clashwayout.test.tsx`); #6 true in substance (one role per account, §11). **Every other Fable claim is unchecked — check each before round 7 uses it** (#5 place history, #13 transfer read by date from his stints, #21 quals/Tracker wording, #15–#20, #23–#24). (2) **D2144** recorded (R1: the hand-filed Attach input stays, for staff work; the automatic "Attach · 149" beside it). (3) **His idea, choices on the transfer sheet**, drawn on the real sheet (`raptor-port/docs/mock/2026-11-17-multi-sqn-r7/draw-transfer.mjs`; pictures `docs/img/2026-11-17-multi-sqn-r7/`): T3 "In 149" Member/Scheduler/Admin (admin of both only), T1 "142 access" None/View/Scheduler (replaces C6), T2 "142 lines" Keep him/Take him off; X4 cut to "with his sign-in, leave, OIL and inputs" pending Fable #21. Put to him on round 6's page (version 7, same link), blocks T and F at the top. **Pick up here:** his answers to T, C1–C8, Q1–Q7 (R1 done) → record each, D201; check Fable's claims; then round 7. **Next free ruling:** D2145 (D2150–D2158 and D2170 held by other branches).
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
