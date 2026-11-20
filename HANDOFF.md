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
<!-- now:claude/skill-notes-review-0c3a78 -->
### CHAT 121 (carrying on chat 120) — the skill-notes review of 20 Nov 26 (his "u can do the skills notes log review in a separate chat"), started from chat 118 — rewritten 20 Nov 26 by chat 121, waiting on his final approval — verify before use
- **Branch / PR:** `claude/skill-notes-review-0c3a78`, no pull request yet; push only by `git push origin HEAD:refs/heads/claude/skill-notes-review-0c3a78` (no upstream). Never touches `claude/multi-sqn-b1-107` or pull requests 806 and 808.
- **What:** 69 OPEN notes — `main`'s 57 and 12 held only on open branches (939–943 on `claude/rules-check-small-batch`, 975–981 on `claude/multi-sqn-b1-107`, copied to `_review/branch-notes.md`). Holding folder `.claude/skill-updates/2026-11-20/` (method: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo).
- **Done:** four helpers sorted and drafted (tables `_review/dispositions-*.md`, reports `_review/report-*.md`; `_install/check-dispositions.mjs` OK: APPLY 54, FILED 9, MEMORY 2, REFLECTED 2, OPEN 2 — 120, 122 deferred, D73). His answers in `_review/answers.md`: all four rounds "yes", as recommended (D2230). The overnight draft's compaction figures moved to D2229's.
- **Done in chat 121:** the cross-file texts placed (BCO §4 980/978, TDD 928, subagent-driven-development 931, SUPERPOWERS-VENDORED change 8); the [CHECK-TOOLS-HARDEN] additions lettered (s)–(z) after its (r) and merged into `_docs/OUTSTANDING-items.md`, memory into `_memory/additions.md`; `_review/dispositions.md` merged (982, logged mid-review, left OPEN); both blind reads run — Astra REVISE 9, fresh Opus REVISE 12 (`_review/read-*.md`); every finding fixed (`_review/fixes.md`); `_install/install.mjs` written (re-appends 939–943 and 975–981 as the reviewed side, D78); its rehearsal passes the document check.
- **Pick up here:** waiting on his final approval of the fixed drafts. On his yes: `node .claude/skill-updates/2026-11-20/_install/install.mjs --install`, then by hand `_memory/additions.md` and `_docs/OUTSTANDING-items.md`, the docsize check, delete the holding folder (D69), draft pull request; live only on his "merge live" (a guide change, never notes-only).
- **Rulings:** 2 recorded → `how-we-work.md` (D2229, compact at about 600,000 — built on `claude/compact-600k`, pull request 814, MERGED 20 Nov 26 on his "merge live", main's checks green; new chats compact at about 600,000); D2230 → `how-we-work.md` (the four rounds approved; D811's line carries it) · **Model:** Opus, high · **Next chat number:** 121.
<!-- /now -->

<!-- now:claude/multi-sqn-batch-plan-106 -->
### CHAT 106 — the multi-squadron build's batch plan, red-teamed; batch 1's page put to him; written 17 Nov 26 — verify before use
- **Branch / PR:** `claude/multi-sqn-batch-plan-106`, notes only (the plan, two red-team reports and their brief, batch 1's page and pictures, the backlog, this file) — merges by itself once green, after `npm run rulecheck` and the document-reading unit tests on his PC (`shipping.md`).
- **Done:** (1) **The batch plan** `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`: 1 squadrons foundation → 2 detachments → 3 borrowing and shared waves → 4 Transfer to Sqn and Post out from Admin → Users → 5 the whole-app check. His opening order had transfer 3rd and borrowing 4th, "unless the reading shows a better one": swapped, recommended, put to him as point 1 (a transferred man's old lines make him a borrowed man, which only shows and is checked once borrowing exists). Knock-ons go with the batch that causes them (§1). Batch 1 in detail: §3 (agreed lines, open points O1–O8, the architecture §3.4, steps §3.6 — steps 0–4 may be a first pull request, 5–6 a second). (2) **Red team, his call: Astra and a fresh, blind Fable reader** (Fable on his word) — brief `…/briefs/2026-11-17-multi-sqn-batches-red-team.md`, reports `-astra.md` (5 HIGH, 1 MED) and `-fable.md` (5 HIGH, 7 MED, 5 LOW); both upheld the order and the swap; every claim checked against the code and folded in — table in the plan §9 (OIL read from the home squadron's own days, never the schedule in view; inputs asked for by squadron; the Tracker's and the Leave War's whole worlds per squadron; one identity for a squadron's records end to end; sign-out reloads; one DET per man; a man's hours, rest and OIL across schedules in batch 2). (3) **Batch 1's page** https://claude.ai/artifact/1464QnHx85Dwcd63fWH46x (`raptor-port/docs/mock/2026-11-17-multi-sqn-b1/page.html`, pictures by `draw-b1.mjs`, 8 at desktop and iPhone) — six points with recommendations, approved drawings redrawn from their own scripts, new pieces pink.
- **His answer, 17 Nov 26: "All as recommended"** — recorded as D2190 (the order with borrowing before Transfer to Sqn, 149 at Home base, the new pieces as drawn; answers D2189) and D2191 (the master admin, Admin → Users by squadron, what View shows); the People & accounts page's limit raised 21,200 → 21,600 under his standing word (D2148) for D2191. This pull request touches `raptor-port/scripts/docsize.mjs` (that limit), so it waits for his "merge live".
- **Pick up here (chat 107, Opus high):** 1. Merge this pull request on his "merge live" if not done. 2. Batch 1's build on a NEW branch from `main`, by the plan §3.6, starting with step 0 (the key inventory) — FULL bug check, security read (D1411), the drawing check against `…-b1/img/` (D1494). Not before his look (D2188).
- **Rulings:** 2 recorded → `scheduler.md`, `people-accounts.md` (D2190–D2191); his call for Fable was for this job only · **Walk:** none — notes and mock-ups only · **Reads owed:** none (the plan had Astra and Fable) · **Next chat number:** 107 · **Next free ruling:** D2192.
<!-- /now -->

<!-- now:claude/cal-wheel-drag-e4107b -->
### CHAT 99 — the calendar wheels' mouse drag (his fault of 17 Nov 26, D2170), rewritten 17 Nov 26 at its end — verify before use
- **What:** on a desktop the month-and-year chooser's wheels moved only with the mouse wheel, never a press and drag. Fixed once in the shared wheel (`raptor-port/src/ui/DateCal.tsx` `Wheel`), so every calendar has it; tests in `raptor-port/e2e/datecal.spec.ts`.
- **Branch / PR:** `claude/cal-wheel-drag-e4107b`, pull request 797 into `main`; `main` brought in by chat 99 (records settled); waits for his look and his "merge live".
- **Bug check — done:** WALK tier. Walk 144 PASS; re-walk 144 PASS after the two blind reads' four fixes (Astra and a fresh Opus reader). Chat 99: GitHub's slow-machine failure of the catch-a-glide test fixed (it measures inside the page); the fix round's narrow read by fresh Opus readers, two rounds, last round 2 (brief and findings `raptor-port/docs/superpowers/briefs/2026-11-17-cal-wheel-drag-fixread-brief.md`): round 1 found a held catch then a drag jumping ~30 years, Enter during a drag closing on the old year, a press let go on the other list moving it later; round 2 found the keys acting on the old year during a held catch — each red first, fixed, green. Re-walk 2 (desktop, the fixed mouse paths) 112 PASS. The calendar file 28 of 28 three runs in a row; calendar unit tests 167 of 167; code check clean (the walk scripts' 14 notes kept with reasons); docsize and rulecheck OK. Evidence sheet `raptor-port/docs/handpass/2026-11-17-cal-wheel-drag.md`.
- **Pick up here:** GitHub's run on the last pushed commit must be green (it ran no checks while the branch clashed with `main`); then his look — the Vercel link, a few pictures from `rewalk2/`, and the flick's feel to judge on his PC.
- **Reads owed:** none — the first code read had Astra and a fresh Opus reader; the fix rounds fresh Opus readers, as the order's §5 says.
- **Rulings:** D2170 recorded → the scheduler's page. None in chat 99.
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
