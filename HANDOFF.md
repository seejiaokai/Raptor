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

<!-- now:claude/docs-tidy-7-oct -->
### `claude/docs-tidy-7-oct` — documents only: what a new chat loads, cut by about 20 thousand tokens (D609, options 1 to 6), the walk ledger's history and figures, the walk-sizing wording approved and in the checking guide (D608) — DONE, the document check green, the pull request open for his "merge live"; NOT merged — written 7 Oct 26 — verify before use
- **Where it started:** his instruction of 7 Oct 26 (an unattended run, then his answers the same day): bring this file up to date; compile the past walks; measure what a new chat loads and put the options to him; draft the walk-sizing wording and have Astra and Sol read it. Cut from `main` at the merge of PR #484 (`[OIL-WORK-START]` — live, 7 Oct 26).
- **His rulings here (How we work):** **D608** — the walk-sizing wording (version 2) is approved and is in `raptor-port/docs/bug-check-order.md` §7.0 and around it: the walk is SIZED for each change before it starts (the five lines of `raptor-port/docs/walk-ledger.md`), a WALK or FULL change never has no walk, a test that changes the data directly never stands in for pressing a control. **D609** — of the start-of-chat options, 1 to 4 then 5 to 7 with the two readers, one branch, a pull request for his "merge live" (which approves the guide wording; a part he changes is read again first). **D610** — the SANS availability calendar's new layout (Codex, branch `codex/inputs-sans-calendar`) is on hold until he calls it back: no chat reviews, rebuilds or merges it, and no tidy-up deletes anything of it (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]`). **D611** — the scheduler's rulings stay in one file, not split by screen.
- **Done:** (1) the seven blocks of branches merged with PR #481 moved whole to `raptor-port/docs/archive/handoff-merged-blocks-2026-10-07.md`; (2) 27 spent or replaced rulings archived, each full row opened first (D465 was archived too and came back the same day — Astra's read found a condition still in force); (3) 20 finished backlog items archived, each read in full first — what they still named as open is `[STACK-LEFTOVERS]`; (4) 21 of his memory notes on this PC that only repeated an always-loaded rule moved to a retired folder (not deleted); (5, 6) the text the Codex-only arrangement of 2–5 Oct left in the guides moved whole to `raptor-port/docs/archive/codex-arrangement-2026-10-07.md`, `AGENTS.md` rewritten as today's bridge, three stale short lines corrected — after Astra's and Sol's reads, both CHANGES REQUIRED, every finding taken (`raptor-port/docs/superpowers/specs/2026-10-07-expired-guide-text.md`, its foot); (7) nothing to do — the rule files repeat subjects, not words. The walk ledger: 65 rows and its figures (`raptor-port/docs/walk-ledger.md`). What each option saved: the foot of `raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md` — before the first message 96,800 → about 92,900 tokens; this file about 16,500 lighter.
- **Checked:** documents only — no app code, no gate but the document check, which passes (`npm run docsize`). Four size markers were raised, each with its reason beside it in `raptor-port/scripts/docsize.mjs` (the backlog, the scheduler's and the Tracker's rulings, the bug-check reminder). Four reads by Astra and Sol 6.1 (two on the walk-sizing wording, two on the expired guide text), each alone; their reports are in `raptor-port/docs/superpowers/briefs/2026-10-07-*-read-{astra,sol}.md`. **The corrections made on those reads have had no read of their own** (one round each is the cap, D70).
- **QUESTIONS WAITING FOR HIM:** (a) **the branch on his PC with his four phone screenshots** (`[PRIVATE-BRANCH-NEVER-PUSH]`): he said "Delete the photo branch", then "So don't delete*" — read as correcting his sentence about the calendar, but NOT assumed: the branch is untouched until he says "delete it" or "keep it". Until then: never push it, never `git push --all`. (b) `[WALK-COST]` — his question on making walks cheaper: a proposal is filed (measure where a walker's tokens go on the next fanned-out walk, then a library of ready walk steps); his word starts it. (c) his own settings, if he wants more off the start of a chat: connected services a coding chat does not use (up to 17 thousand tokens), and the skill-notes guide loaded at every start (its review is overdue: last 24 Sep, 178 notes waiting).
- **Still open in `[START-CONTEXT-AUDIT]`:** the check that stops the start-of-chat load growing back (a merged block failing the document check after one handoff; a marker for `AGENTS.md`) — not built, low.
- **Branch:** `claude/docs-tidy-7-oct`, pushed; the pull request is open, NOT for merging until his "merge live" (`gh pr list --head claude/docs-tidy-7-oct`) — documents only, so only the Docs guard runs on it; read its result before anything else is pushed (D151). If it has MERGED: remove this block at the next handoff; a new job starts from `main` — in the normal folder when no other chat is open (the chat makes its own branch), on a worktree only when two chats run at once (told to him 7 Oct 26, when he asked why a worktree again). **Pick up here:** after "merge live", carry it to live (`.claude/rules/shipping.md` — a documents-only merge changes nothing in the app, but check the Production deployment started). The order after this, his to change: the feature batches of D495 (`OUTSTANDING.md` `[FEATURE-WISHLIST]`) — the next is how inputs show on the calendar, of which the SANS calendar's layout is on hold (D610), so ask him which job he wants. Any build sizes its walk first (D607, D608). Rulings: D608–D611 recorded this chat; the next number is D612 after checking the live rulings (D567–D585 are held by the calendar branch). To him say **OIL**; his PC's screen runs at 125%; an opening line he pastes needs one word typed by him beside it, or the new chat stops to confirm.
<!-- /now -->

## Next, in order

**RIGHT NOW (his word, D602, 6 Oct 26):** the Codex stack is LIVE (PR #481, merged 6 Oct 26 on his "merge live" — D589) → the crew-rest fault `[REST-BLANK-LINE]` (LIVE, PR #482, 6 Oct 26) →
`[BLANK-TIMES-ABSENCE]` with `[SC-PICKER-INTIME-REST]` (D605 — LIVE, PR #483, 6 Oct 26) → `[OIL-WORK-START]` (D591, D592, D606 — LIVE, PR #484, 7 Oct 26) → `[START-CONTEXT-AUDIT]` (what a new chat loads at its start: measured, options to him, then
his ruling — DONE 7 Oct 26 on `claude/docs-tidy-7-oct` (D609: options 1 to 6; the walk ledger's history and the walk-sizing wording with it, D608), waiting for his "merge live") → the feature batches in D495's order (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

**ON HOLD, HIS TO CALL BACK (D610, 7 Oct 26):** the new layout for the SANS availability calendar, worked on with Codex — on the branch `codex/inputs-sans-calendar` (its own block, rulings D567–D585 and records are there). Nothing of it is deleted, reviewed, rebuilt or merged until he calls it back (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]`).

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

The latest counts watched — 6 Oct 26, `claude/oil-work-start-build-35a0e3` on its final code (D591, D592; since MERGED — PR #484, so this is `main`'s code; the documents-only chat of 7 Oct 26 ran no gate but the document check), under the PC lock, 7 Oct 26 with D606 built: unit **8061 / 8061 (500 files)** · build clean · tfin **728 / 0** · e2e **619 passed, 0 failed, 50 skipped** · smoke **445 / 0** · rulecheck OK · docsize OK (over its size markers, deferred — D29); perf **4 / 0**, week DOM 5131 ≤ 5450, board DOM 1018 ≤ 1150 and the six adapted probes (155 checks) from the run before D606, 6 Oct 26 — not run again for it. `main` itself (PR #483, as its own chat recorded it — not re-run here): unit 7964 / 7964 (496 files), e2e 617 passed and 50 skipped, the rest the same. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a history. How to run them: `raptor-port/CLAUDE.md` §Build & verify; how they mislead, and the checks on his PC: `raptor-port/docs/gates-and-deploy.md`.

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
