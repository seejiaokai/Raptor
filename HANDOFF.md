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
<!-- now:claude/rules-diet-step-3-f1a069 -->
### `claude/rules-diet-step-3-f1a069` — [RULES-DIET] step 3, reading by section: DRAFTED, MEASURED, two of three reads back; the readers' fixes and Astra's read still to do; written 7 Nov 26, 19:31 — verify before use
- **Where it started:** `main` at `32ac5bd59` (step 2 live, pull request 657). Commits here: `ab8598e70` (the drafts — the checklist `raptor-port/docs/bug-check-checklist.md`; `.claude/rules/ui-design.md` §Which part of the guide to open; the ripple map's head note; the pointers) and `cf81dc275` (the measure).
- **Done this chat:** `docsize --reads` counts the three documents by part (`docsize-reads.mjs`: `partOf` gained `spans`, `rows`, `grep`; `CHECK_READS` names each part and its case); five self-test cases; the full self-test passed 303, its one miss — an old case's wording — fixed after. The plan's §Step 3 records the measure (against `main`): the order 40,301 → 26,740 (the plan said ~10,000), the design guide 50,631 → 33,778 (~12,000), the ripple map 28,855 → 7,431 (~7,000) — **re-measure after the fixes below, which add parts.** Filed: [BUGCHECK-LESSON-ORDER]. The two briefs: `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step3-read-brief.md` (the meaning read, D1739) and `…-step3-reads-script-brief.md` (the script read, D1736).
- **The reads so far — reports kept whole OUTSIDE the repo until Astra has read** (the shared notes folder `C:\Users\User\AppData\Roaming\Claude\side-session-notes\local_4ee39652-1602-4caa-9846-f5f9cd5af150\`): `step3-meaning-read-opus.md` (the fresh Opus meaning read of `ab8598e70`: 16 findings, none high) and `step3-reads-script-read-opus.md` (the script read: 1 high, fixed; 2 medium, 6 low). **Astra's run hit his ChatGPT limit at about 7:20 PM (resets 8:11 PM); nothing came back** — its log, same folder. Astra reads the text AFTER the fixes below, so it reads what ships; the brief is unchanged.
- **Next, in this order:** (1) **fold in the meaning read**, each checked against its source first (lessons 6, 11, 18, 21, 23 already checked — they hold): the checklist — the head ("a step's parentheses name what to mind, never the part to read; a rule that applies by kind of change applies whatever the tier gating its step"), step 2's three questions in full, a step at the start that lays down the evidence sheet (open §9), step 5 (each ruling checked on every build; the unchanged half pinned first, §8 item 7), §6's rows by kind of change whatever the tier, §2a's table at the sizing step, §4 whole at the walk, §10's anti-pattern 21 at the walk, step 16 ("proved by" cells checked; the D1411 security read), step 22 (§11: every defect he finds costs the method a line), the background line without §3 and §10, the six lessons' fuller lines; `ui-design.md`'s list (2.1–2.5: §2 for any new control; §1 and §1b for words written or changed; a new action; mock-up pages to §8; changing the guide); the ripple map's note (3.1 its tested search that lists all 48, 3.2 the "Fed by" column, 3.3 §4's headings, 3.4 the dated titles). (2) **The script read's fixes:** §0a, §4 whole, §10, lessons 1, 3 and 22 counted; the design case "a new control and its words" (§1b, §2 added); Flow A's other four rows; a span's `to` from the top when it has no `from`, and no `to` meaning the file's end; the grep's range and a plain name in its label, the head's part ending at the note; the missing cases (near-miss-first spans and rows, `upTo` with other parts, the grep's empty match, the labels). Then one fresh reader of the script change again (D1736). (3) **Astra's blind read** (D1739) — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C <worktree> -o <notes folder>/step3-meaning-read-astra.md "Read and follow the brief at raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step3-read-brief.md exactly. Read long files in slices, not whole. Your final message is the report it asks for." < /dev/null`; if it cannot run, tell him first — the step never goes on without it. Fix its findings. (4) Move the three reports into `raptor-port/docs/superpowers/briefs/` (`…-step3-read-opus.md`, `…-step3-read-astra.md`, `…-step3-reads-script-read-opus.md`), a review log under the plan's §Step 3, `docsize --reads` before and after, `npm run docsize`; open the pull request — it waits for his "merge live" (D1737).
- **To tell him:** the savings are smaller than the plan said, and the readers' fixes add parts back (every section that applies stays a required read — D1735's own condition). Today's figures: above.
- **Rulings:** none this session. **Branch:** `claude/rules-diet-step-3-f1a069`, pushed, no pull request yet. **Running when written:** none. **Open question for him (carried from step 2):** [CONTEXT-START-SIZE] keeps only E, his own setting — archive it by script if he agrees.
- **Opening line:** "Continue the rules diet's step 3: `git fetch origin`, then switch to the branch `claude/rules-diet-step-3-f1a069` and `git pull --ff-only` (if the switch is refused because another worktree holds it, work in that worktree or ask me). Read `HANDOFF.md` (its `claude/rules-diet-step-3-f1a069` block), the two reports it names in the shared notes folder, and the plan (`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §4, §6, §Step 3), then do its 'Next, in this order' (1)–(4)."
<!-- /now -->

## Next, in order

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, on `claude/rules-diet-step-3-f1a069` (its block) → re-measure → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three; each step on his "merge live" (D1737).

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
