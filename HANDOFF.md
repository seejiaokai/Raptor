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
<!-- now:claude/rules-diet-step1 -->
### `claude/rules-diet-step1` — [RULES-DIET] step 1: parts 1, 2, 3a, 3b and 3c DONE (the page checks; the recorder by marker; the seam files; `--merge` in both shapes; `docsize --reads`); the fresh, blind Opus reader of all of step 1 next on this branch; written 7 Nov 26 — verify before use
- **Where it started:** plan v3 (`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`, approved D1735–D1738, pull request 655 merged) — step 1, the checks and scripts (§5, §7), sized at three chats. This chat started at 51% full from what loads at the start alone, so it took the page checks only.
- **Done (part 1):** the gate reads the new shape — `docsize-rulings.mjs` gained the page reading (`PAGE_MARK`, `isPage`, `isScoped`, `citesIn`, `statementsOf`, `pageShapeProblems`, `capsText`); `docsize.mjs` job 1c gained the page checks of §5 for any area file carrying `<!-- shape: page -->`: every live ruling stated (≥4 words, 2 per number, code spans and headings never count; a range cites what lies inside), the change-mark check (another area's narrowing included), no citation of a replaced ruling or a number that is no ruling, the page's shape (one title; an area page "— how it works now" with "## Settled…" and "## From other areas" last; no table rows; ≤600 characters; ordinary letters); the always-loaded rules files count as places to state a ruling, and join the change-mark and stale checks once the general page converts; a converted area's map row lists its full-text file's rulings; a converted area needs no short lines. Unmarked areas are checked exactly as before. 20 new self-test cases, both shapes in one repo.
- **Checks:** `node scripts/docsize-selftest.mjs` 214 / 214 (20 new); `npm run docsize` on the real repo OK, unchanged (no area is a page yet). **Dry run on both samples** against the real rulings (each page given its `paths:` and the marker, in a throwaway repo built by `git archive` of the rulings files; the script, if still there: `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\40498ac0-1b4e-4ab3-ba84-c33a1a5055e3\scratchpad\dryrun.mjs`; ignore its "homes" lines — the partial copy leaves out the documents those rows name): OIL — only two statements over the cap; general — the expected step-4 work. Both written into the plan, §"Step 1 — what the built checks found". Bug-check tier NONE (no app code; the gate's self-test is this change's test). No fresh reader yet — one reads the whole of step 1 at its end (D1736).
- **Done (part 2, a second chat):** what a page still owes is now read ONE way — `docsize-rulings.mjs` `pageDebts` (with `sectionAt`, `sectionsOf`) — by the gate (its job 1c now formats its page failures from it, same messages) and by the recorder. `backlog-archive.mjs --rulings` reads each area file's marker: an unmarked area exactly as before; for a page, a full row left on the page moves to the top of its full-text table (no short line), the map row lists the full-text file's rulings, and — computed from the files as the run would leave them — every edit the page owes (an unstated ruling with its heading and the page's sections; a line missing a change mark; a line citing a replaced ruling; a number that is no ruling, as after a renumbered clash) is printed under STATE ON THE PAGES by page, line and section, and **nothing is written** until they are made (`--merge` excepted — part 3). `--move-rows` into a page drops the short line ("it must be stated there"); out of one, it makes the short line from the heading (or `--short-text`, listed UNREAD) and prints the page lines that state it under MOVE ON THE PAGES. `DECISIONS.md` gained "The steps for a converted area" (both routes stand); its line tripwire raised 96 → 110 with the reason. 11 new self-test cases (record beside a short-line area, refused-until-stated, a row left on the page, a change mark refused then passing, a retire refused then passing, a reused number, a renumbered clash, `--move-rows` each way). Checks: self-test 225 / 225; `npm run docsize` OK on the real repo; `--rulings --dry-run` on the real repo: nothing to do. Bug-check tier NONE.
- **Done (part 3a, a third chat, which started at 41% from what loads at the start and filled by reading — so it took the seam files only):** `docsize-rulings.mjs` gained `pathsOf` (a rules file's `paths:`), `globRe` / `matchesPaths` (the globs as the rules files write them: `**`, `*`, `?`, comment lines skipped), `SEAM_DIR`, `SEAMS` (each seam file with a file inside its area and one on its seam: Leave War `src/leavewar/ui/Matrix.tsx` / `src/ui/InputsPage.tsx`; Tracker `src/tracker/app/core.js` / `src/ui/Shell.tsx` — both checked to match the area files' paths today) and `seamProblems`. The gate (job 3, `structure`) fails a seam file nobody registered, one whose `paths:` miss its area or its seam, one whose area file still loads on the seam probe (plan §2: the area then loads only on its own files — so step 2 must narrow `leave-war.md`'s and `tracker.md`'s paths in the same change, with the pointer bullets), and one with no tripwire; `RULING_BYTES` gained `seams/leave-war.md` 15,000 and `seams/tracker.md` 12,500 (the sections measured 13,077 and 10,988 bytes); an absent seam file is not reported MISSING until step 2 writes it. Self-test: 5 seam cases and 8 matcher cases. `npm run docsize` OK on the real repo. Bug-check tier NONE. Also recorded his **D1739** (7 Nov 26): every step of the diet that rewords, shortens or summarises a rule is read by Astra as well as the fresh Opus reader, each blind; step 1's scripts keep the one fresh Opus reader (D1736). Its short line is UNREAD (D138) — the step-1 reader reads it against its full row.
- **Done (part 3b, a fourth chat — `--merge` in both shapes):** `backlog-archive.mjs --rulings --merge` reads each area file's marker on both sides. A page on the other side only is taken whole (this side's full rows still in the file go on it, and step 1 moves them to the full-text table); a page here only is kept; a page on both sides is taken from the side that changed it, or merged line by line (`git merge-file`), stopping and naming the line where both edited the same one; an area converted on both sides since the base stops. A page is never re-applied as prose: what the side still in short lines changed in that area — new rulings, short lines, full rows, other lines — is printed under PLACE ON THE PAGE and never written; the other side's new rows go to the top of the full-text table; a row left on a page before writing stops the command. `DECISIONS.md` gained one sentence on it (110 lines, at its tripwire). 7 self-test cases: a real merge each way (also with a ruling the old side never ran the recorder on) — the page whole, no row on it, D9 and D8 at the top of the full-text table, D9 / D5 / D6 / the line listed and D8 not, the map from the full-text file, ending WRITTEN with the gate naming D9; a page line both sides edited (stopped, nothing written); different lines (merged clean); converted on both sides (stopped). Red-first in reverse: two deliberate breaks of the new code were each caught (7 cases, then the 2 that check D8 is not listed).
- **Done (part 3c — `docsize --reads`):** `scripts/docsize-reads.mjs`, called by `node raptor-port/scripts/docsize.mjs --reads [--verbose]` (handed `estTokens`; on the docs-only skip list by its name; in `docs/file-map.md`'s gate row). Five jobs × start / task / check, the total, and the note on each message ×40 beside it; each file once, in the first column that loads it; reads followed through the rules files' `paths:` and the CLAUDE.md folders until nothing new loads; a heading a read names and its file lacks is printed as a NOTE. 7 self-test cases on a set held in memory. **First real measure, 7 Nov 26:** start 39,692; totals before the note — notes 76,111 · Leave War 357,847 · scheduler 344,490 · Inputs 367,840 · Tracker 355,891; the note 18,800 a chat. They match §1's layers file by file (the handoff has grown to 11,293), with one difference to look at: the walk ledger's sizing section reads 472 tokens, the plan's table says 1,620 — the section alone is what the rule names, so it is left as measured.
- **Checks:** self-test 252 / 252 (14 new); `npm run docsize` on the real repo OK. Bug-check tier NONE (no app code; the self-test is these scripts' test).
- **Not done — pick up here:** ONE fresh, blind Opus reader of all of step 1 — parts 1, 2, 3a, 3b and 3c (the commits on this branch since `main`: `git log origin/main..claude/rules-diet-step1`), and D1739's UNREAD short line against its full row (D1736; step 1 rewords no rule, so no Astra — D1739). Fix what it finds, red-first; then the pull request out of draft, and his "merge live" (D1737). Then step 2 (plan §7).
- **Branch:** `claude/rules-diet-step1`, pushed; a draft pull request open (not watched); released here (`git switch --detach`). Continue on this branch.
- **Running when written:** none. Open questions for him: none.
- **Opening line:** "Switch this chat to the branch `claude/rules-diet-step1`: `git fetch origin`, `git switch claude/rules-diet-step1`, `git branch -u origin/claude/rules-diet-step1`, `git pull --ff-only`. If the switch is refused because another checkout holds the branch, release it there only if that checkout — the folder git names in the refusal — has no uncommitted changes (`git -C <that folder> status --porcelain` prints nothing) and is on the same commit as `origin/claude/rules-diet-step1`; then `git -C <that folder> switch --detach` and switch again. Otherwise stop and tell him which folder holds it and why it was left alone. Then read `HANDOFF.md` — the `claude/rules-diet-step1` block under `## Now` — and run the ONE fresh, blind Opus reader of all of step 1 of the rules-diet plan v3 (parts 1, 2, 3a, 3b, 3c and D1739's short line), fix what it finds, and take the pull request out of draft for his \"merge live\" (D1736, D1737, D1739)."
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
