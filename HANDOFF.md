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
<!-- now:claude/rules-diet-plan -->
### `claude/rules-diet-plan` — [RULES-DIET] plan v3 APPROVED (D1735–D1738); step 1 next, on a new branch; written 7 Nov 26 — verify before use
- **Where it started:** he asked (7 Nov 26) to start the rules diet (D1732): measure what a chat reads, draw the plan with sizes before and after, put it to him, change no rule until he approves; Astra (his call, D1734) and a fresh Opus reader each read v1 blind. v1 and v2 were drawn in a cloud session; this chat, on his PC, ran Astra's read and drew v3.
- **Shipped (notes only, no rule changed):** plan v3 `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` (review log: every finding of both reads, what was done, and the two reads compared — D1732's "see which is better"); samples v3 `…/plans/2026-11-07-rules-diet-sample-how-we-work.md`, `…-sample-oil.md` (both pass the plan's two trial checks, rebuilt on his PC; general page 6,602 tokens, OIL 3,975); Astra's report saved whole `…/briefs/2026-11-07-rules-diet-plan-read-astra.md` (2 high, 5 medium — run from a `git archive` copy of `a294a09f`, so v2 and the Opus report were out of its reach). v3's main changes: reads that load more rulings files counted (layer J) and his messages taken out of Part 1's table; steps 1–4 shown to bring most of the saving with no area rewritten; the account by requirement; seam files on own + seam paths; the recorder in both shapes; reading by section moved to step 3, OIL first in 5a as a full trial; D766 kept live; D148, D493, D787, D486/D491, D1094 fixed in the samples; 21–23 chats.
- **Branch:** `claude/rules-diet-plan` — pull request 655, merged on his "merge live" (7 Nov 26); this block can go at the next handoff once step 1's chat has its own.
- **Gates:** not run — notes only; `npm run docsize` green. Bug-check tier NONE (a plan document; nothing in the app).
- **His answers (7 Nov 26, "As recommended"):** recorded as D1735 (the shape — narrows D136, D390, D68, D1554 as each area or checklist lands; corrects D1732 on D141), D1736 (permission for the hooks and the document check — spent when steps 1–2 land), D1737 (every step on his "merge live" — narrows D1407 for this job), D1738 (Astra beside the fresh Opus reader on the Inputs, scheduler and Leave War pages — narrows D1734). Open questions for him: none.
- **Running when written:** none. The trial-check script used for v3's numbers is in this chat's scratch folder only; step 1 rebuilds it as the gate's checks.
- **Pick up here:** start the plan's step 1 (§5, §7: the page checks with self-tests in both shapes, the recorder by marker, `--merge` and `--move-rows` taught the page shape, `docsize --reads`) in a FRESH chat on a new branch from `main`, Opus high thinking.
- **Opening line:** "Fetch `origin` and make a new branch from `main` without tracking it: `git fetch origin`, `git switch --no-track -c claude/rules-diet-step1 origin/main`. Read `HANDOFF.md` — the `claude/rules-diet-plan` block under `## Now` — then start the rules-diet plan v3's step 1 (approved: D1735–D1738), following its §5 and §7."
<!-- /now -->

## Next, in order

**RIGHT NOW (5 Nov 26, morning):** pull requests 634 and 635 LIVE (the `claude/topbar-names-build` block removed); the night's three jobs CHECKED — 636, 637, 638, waiting for his look and "merge live" → the build of his morning answers (D1651, D1655–D1657) on this branch (its block).

**RIGHT NOW (4 Nov 26, night):** the Leave War small fixes LIVE (pull request 632) → his request, the page names beside TALON (D1641): the mock-up answered "both yes" (D1642, D1643) → BUILT and checked on `claude/topbar-names-build` (pull request 634), LIVE 4 Nov 26 → **the PDF export work ([PDF-PRINT-TWICE], [FLAG-EXPORT]) HELD until he says so (D1644)** → his next pick from the backlog.

**RIGHT NOW (4 Nov 26):** the questions at the button (pull request 630), the loading claw (628) and the input window's ✕ (629) LIVE; no pull request open → his next pick from the backlog (D994), the Leave War small fixes recommended.

**RIGHT NOW (21 Oct 26):** pull request 553 LIVE (the Inputs batch, D994 — its block removed) → his pick, the Insights and Logic small fixes (D994), on `claude/insights-logic-fixes-3416c8` (pull request 554, this chat's block) → his "merge live" GIVEN → his next pick from the backlog.

**RIGHT NOW (20 Oct 26, night):** pull request 552 LIVE (the shaky-tests batch, D994 — its block removed) → his pick, the Inputs batch (D994), on `claude/inputs-small-fixes` (pull request 553, this chat's block).

**RIGHT NOW (20 Oct 26, evening):** pull requests 550 and 551 LIVE (the OIL batch) → his pick, the shaky-tests batch (D994), BUILT and WALK-checked on `claude/shaky-tests-batch-ea7fc2` (pull request 552, this chat's block) → his "merge live" GIVEN → his next pick from the backlog.

**RIGHT NOW (20 Oct 26, afternoon, later):** pull request 550 LIVE (the OIL batch, D994; D1094) → this records pull request (documents only) → his next pick from D994's small fixes by area.

*(The "RIGHT NOW" lines of 13 to 20 Oct 26 — all done or filed — are in `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`, moved whole on 20 Oct 26.)*

**RIGHT NOW (13 Oct 26):** `[OIL-ASK-NOTIFY]` is MERGED (pull request #492, 13 Oct 26 — D791) → **two jobs side by side, each in its own chat on `main` (his word, D794): `[CAL-PHONE-SWIPE-FIT]` — the Calendar window on a phone (D786, with the design guide) — and `[SKILL-OBS-REVIEW]` — the review of the skill notes, documents only (DONE 13 Oct 26 on `claude/skill-observation-review-258b48`, approved by him — D811 — and waiting for his "merge live")** → the small Inputs / schedule batch (D793's build with the older small finds — the agent's placing) → `[TILL-FROM-DATES]` (D728 step 2) → the feature batches in D495's order: the Tracker, caps and ops limits, the one whole-app check (`OUTSTANDING.md` `[FEATURE-WISHLIST]`) → the database, at the end (D473). The two paragraphs of his word below (D775, D774) stand.

**HIS WORD, 12 Oct 26 (D775): after the one-rule job is merged, the Tracker's and the Leave War's approved tidy-ups (`[TRK-FILE-TRANSFER-SPLIT]`, `[LW-ROWS-SPLIT]`) are done as jobs of their own — each started on his word, in its own chat, a worktree on `main`.**

**HIS WORD, 12 Oct 26 (D774): the Tracker's progress graph is NOT started yet — no chat begins it (its questions, its design, its build) until he says so; D495's order itself is unchanged.**

**RIGHT NOW (10 Oct 26):** the Inputs calendar and the SANS availability calendar are LIVE (D614 — PR #487, 9 Oct 26), and so is the Inputs pages' work that followed (D684–D732 — PR #488, 10 Oct 26; the changes-window fix, D733 — PR #489, the same day) → **`[GROUP-INPUT-ONE-ROW]`, the schedule's one row for a shared input (his word, D662 — IN HAND on `claude/group-input-one-row`: its rules are asked of him first)** → `[TILL-FROM-DATES]` (D728 step 2 — the agent's placing; questions first) → the feature batches in D495's order: the Tracker, caps and ops limits, the one whole-app check (`OUTSTANDING.md` `[FEATURE-WISHLIST]`) → the database, at the end (D473). **The two paragraphs below are as written on 6 and 7 Oct 26 — every step they name is done and live.**

**RIGHT NOW (his word, D602, 6 Oct 26):** the Codex stack is LIVE (PR #481, merged 6 Oct 26 on his "merge live" — D589) → the crew-rest fault `[REST-BLANK-LINE]` (LIVE, PR #482, 6 Oct 26) →
`[BLANK-TIMES-ABSENCE]` with `[SC-PICKER-INTIME-REST]` (D605 — LIVE, PR #483, 6 Oct 26) → `[OIL-WORK-START]` (D591, D592, D606 — LIVE, PR #484, 7 Oct 26) → `[START-CONTEXT-AUDIT]` (what a new chat loads at its start: measured, options to him, then
his ruling — DONE 7 Oct 26 on `claude/docs-tidy-7-oct` (D609: options 1 to 6; the walk ledger's history and the walk-sizing wording with it, D608) — LIVE, PR #485, 7 Oct 26) → **the Inputs calendar and the SANS availability calendar (D614 — next)** → the feature batches in D495's order (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

**DONE — LIVE since 9 Oct 26 (PR #487).** The Codex branch `codex/inputs-sans-calendar` stays on GitHub and nothing of that work is deleted (D610, D614): its records are `raptor-port/docs/handpass/2026-10-05-inputs-sans-calendar.md` and `…-inputs-sans-claude-handoff.md`, its backlog items `[SANS-CALENDAR-WIP]` and `[SANS-COMMITMENT-CALENDAR]` are in `OUTSTANDING-ARCHIVE.md`. *As written:* **NEXT, HIS WORD (D614, 7 Oct 26): the Inputs calendar and the SANS availability calendar** — the work on the branch `codex/inputs-sans-calendar` (its own block, rulings D567–D585 and records are there), called back from its hold (D610). It is 124 commits behind the live version: bring it level first, with care (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]` names where it meets `main`). **Opus 5.5 builds it, in Claude Code (D615)** — reading what Codex built first; Astra and Sol 6.1 review what Opus adds. Nothing of it is deleted.

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
