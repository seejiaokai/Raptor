# HANDOFF — where things stand, and what is next

**A new chat reads this first.** It is the ONE handoff (D140, 24 Sep 26): `## Now` holds one block per open chat's
branch — where it stands, what it left, what to do next — and `## Next, in order` is the project's order; below
them, the standing facts. It holds CURRENT state only: a finished story is in git and, when a whole section left,
in `raptor-port/docs/archive/` (the 4 Sep 26 snapshot of this file is `HANDOFF-ARCHIVE.md`, frozen); open work is
in `OUTSTANDING.md`; where each kind of fact goes is `.claude/rules/doc-structure.md`, loaded in every chat.

**Before acting on a block:** `git fetch`, then check the branch and PR it names — it describes the world when it
was written. Never push while a PR's checks are running (`gh run list --branch <branch> --limit 1`; D151).
**Writing a block** (the session-handoff skill does it, at every handoff): rewrite ONLY your own block, between its
markers, even when nothing is pending; newest block first; remove another chat's block only after `git fetch` shows
its work merged and its open residue is filed in `OUTSTANDING.md`. Two parallel chats each keep their own block, and
the later merge keeps both (D78).

## Now

<!-- now:claude/planning-filing-3-oct -->
### `claude/planning-filing-3-oct` — UNTIL MONDAY'S RESET CODEX PLANS AND BUILDS (D494), in his order (D495); Claude reviews every Codex branch after the reset — this branch: documents only, pushed, no PR yet — written 2 Oct 26 — verify before use
- **CODEX (D494, 2 Oct 26):** his Claude allowance is at 94%; he uses his ChatGPT allowance and its resets for heavy work.
  Codex reads `AGENTS.md` (repo root — the bridge to every rule file), plans with him and builds, each job on its own
  `codex/<name>` branch based on THIS branch; it never reviews its own work and never merges. **Owed by Claude after the
  reset (Monday 5 Oct 26, 19:00), before any "merge live":** the independent read of every `codex/…` branch (both Fable and
  Opus on risky work — earned leave, permissions, the published record, saved data), and of any plan Codex wrote. Codex's own
  `## Now` block lists them. `AGENTS.md` itself is a working guide of a kind — Fable reads it after the reset (D70).
- **THE ORDER (D495):** `[DISCARD-MARKS-REMOVE]` first (small — it proves Codex as a builder; the agent's addition) →
  `[WORKSPAN-NEGATIVE]` → Insights → the workflow UI pass → Inputs → the Tracker → caps and ops limits → one whole-app check.
  No feature is designed yet; his bugs come later. The second Sonnet-walker trial (D480) waits for Claude's first walk.
- **The tidiness read is answered (D493):** three tidy-ups approved, each with its area's batch — `[LW-ROWS-SPLIT]`,
  `[CSS-SPLIT-BY-SCREEN]`, `[TRK-FILE-TRANSFER-SPLIT]`; two not now (in `[CODE-TIDY-AUDIT]`).
- **Reviews until the reset (D492, narrowed by D494):** Astra alone reviews what CLAUDE wrote; after the reset Fable and Astra
  as before. Opus 5.5 does not take Fable's place.
- **D491:** the collection is not installed whole; a word list (`[WORD-LIST]`), two debugging lines and one audit line ride
  with `[SKILL-FUSION]` — the read: `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md` §8.
- **Astra's two runs, 3 Oct 26** (briefs and results in `raptor-port/docs/superpowers/briefs/2026-10-03-…`): the word-list
  draft is back (about 195 terms, five marked unsure — NOT yet checked against the app; that check rides with `[SKILL-FUSION]`);
  the tidiness read (`[CODE-TIDY-AUDIT]`) is back — `…-code-tidy-audit-astra.md`: five separations, each FULL tier, none a
  fault (the Leave War's row drawing out of its grid file; the scheduler's stylesheet split by screen; the Tracker's file
  export/import out of its core; the Leave War's stored-data reading out of its store; its link to the schedule split in four
  behind one front). The host spot-checked the files exist as described (line numbers are approximate).
- **Waiting on him:** what each feature means (rounds of at most four questions, a recommended answer each), and his bugs.
- **The main checkout** (`C:/Users/User/projects/Raptor`) sits on this branch, not a worktree — put it back on `main` once merged.
  This branch has no PR; it merges only on his "merge live" (documents and the document gate only).
- **Dates:** the earlier entries of this block and D491–D492 say "3 Oct 26"; the PC's calendar read Friday 2 Oct 26 on the
  day they were written.
- **Parallel (D302):** rulings D491–D495 used here — Codex takes D496 on; observation #420 used, #421 on (Claude only).
<!-- /now -->

<!-- now:claude/ai-workflow-skills-review-87bf52 -->
### `claude/ai-workflow-skills-review-87bf52` — the skills review (D486–D490), "Discard marks" to be removed (D488), the document tidy: all documents, PR #480, his "merge live" given 2 Oct 26 — until Monday's reset: PLANNING AND FILING chats only — written 2 Oct 26 — verify before use
- **UNTIL THE RESET (Monday 5 Oct 26, 19:00 — D484), his plan, 2 Oct 26:** he uses the time to talk through new features and
  report bugs he has found; each is FILED in `OUTSTANDING.md` under its area, to be built after the reset. No building, no
  walkers, no reviewers; a feature gets its questions in rounds of at most four, each with a recommended answer, and a short
  design note linked from its item; a picture only if he asks. Start from `[FEATURE-WISHLIST]` (his five, and his words on the
  workflow UI pass). **He will say which batch goes first after `[WORKSPAN-NEGATIVE]`** (D490: features first by area, fixes
  riding along, one whole-app check at the end). Check `gh pr view 480` shows MERGED before anything else.
- **The main checkout** (`C:/Users/User/projects/Raptor`) may still sit on `claude/insights-which-copy` (merged) — put it back on
  `main` (`git -C C:/Users/User/projects/Raptor branch --show-current`). Walk servers left up by earlier chats: ports 4201–4203,
  4212, 4213 (the app allows five preview servers per folder).
- **Done (documents only):** D486 recorded; the read and the fusion plan are in
  `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md`; two jobs filed — `[SKILL-FUSION]`, `[CODE-TIDY-AUDIT]`.
  No skill, guide or app file was changed.
- **His answer (D489):** the proposals are approved AS ASTRA CHANGED THEM (the spec's §7 — the guard and the look-and-feel checks
  narrowed, Astra's "what counts as a finding" rule added, the evidence rules withdrawn). **Still his to say:** whether Astra's
  tidiness read runs before the reset or after; the flow after Monday he was given: `[WORKSPAN-NEGATIVE]` → `[SKILL-FUSION]` → the
  audit's report → his choices → each approved clean-up with the feature batch of its area.
- **Next:** `[CODE-TIDY-AUDIT]` — write Astra's brief from the spec's §2, run it, report to him in plain words.
  `[SKILL-FUSION]` — after the reset (Monday 5 Oct 26, 19:00), a fresh chat, a worktree on `main` once this branch has merged
  (or this branch if it has not), Opus 5.5; Fable and Astra read the changed guide before he approves it (D70).
- **The document tidy (`[DOCS-SIZE-PASS]`) was done here, 2 Oct 26, on his word:** five finished backlog items archived, the
  backlog's tripwire raised with its reason, the nine IT-flow-guide rulings moved to their own area file
  (`.claude/rules/decisions/it-flow-guide.md` — it loads with the guide's files), D180, D324, D467 archived as spent. The
  document check passes. Left: `[PRIORITY-LIST-REWRITE]`. The merged `claude/insights-which-copy` block was removed here (PR #479 merged; its
  residue is filed: `[WORKSPAN-NEGATIVE]`, `[INSIGHTS-BOARD-DOOR]`, `[SONNET-WALKER-TRIAL]`; D480–D485 are in the rulings).
- **Not read at the source:** 13 of APEX's 16 step files, and Make Interfaces Feel Better's five reference files — read them
  before fusing anything from those two.
- **Parallel (D302):** rulings D486–D490 used here (D490: features first by area, fixes riding along, one whole-app check at the end — `[FEATURE-WISHLIST]`) (D487: the buttons keep their size; D488: "Discard marks" is removed — `[DISCARD-MARKS-REMOVE]`, filed, not built) — a next chat takes D491 on; observation #419 used, #420 on.
<!-- /now -->

## Next, in order

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
   own residue — `[SAVE-NOTE-COVERS]` (medium, next), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 1 Oct 26, `claude/insights-which-copy` (`[INSIGHTS-WHICH-COPY]` with the fix of its final read; merged
the same day, PR #479), under the PC lock: unit **7560 / 7560** (474 files) · build clean · tfin **728 / 0** · e2e **518 passed,
0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK (notes `AM39d` now covered — older, left) · docsize OK (OVER, deferred
— D29) · perf not run on this branch (last watched on `claude/warn-hide-kept`: **4 / 0**, board DOM 1024 ≤ 1150, week 5134 ≤ 5450). Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
history. How to run them: `raptor-port/CLAUDE.md` §Build & verify; how they mislead, and the checks on his PC:
`raptor-port/docs/gates-and-deploy.md`.

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
