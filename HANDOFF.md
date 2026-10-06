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
### `claude/docs-tidy-7-oct` — documents only: the handoff brought up to date, the walk ledger's history and figures, the start-of-chat measurement with thirteen options, the walk-sizing wording drafted, read by Astra and Sol, APPROVED (D608) and put into the checking guide — the start-of-chat options and the photo branch WAIT FOR HIS RULING; nothing trimmed, not merged, no pull request — written 7 Oct 26 — verify before use
- **Where it started:** his instruction (7 Oct 26, then "I'm asleep" — an unattended run, D596): bring this file up to date; compile the past walks (`[WALK-LEDGER-HISTORY]`); measure what a new chat loads and write the options with savings and risks (`[START-CONTEXT-AUDIT]` step 1); draft `[WALK-SIZING-GUIDE]`'s wording and have Astra and Sol read it. **Trim nothing and change no guide before he rules. Merge nothing.** Cut from `main` at the merge of PR #484.
- **`[OIL-WORK-START]` (D591, D592, D606) is LIVE** — PR #484 merged on his "merge live", the Production deployment finished (7 Oct 26). Its block is removed: its filed items each have a heading in `OUTSTANDING.md` (checked one by one), its readings stand in D592's and D606's full rows and in its backlog item, its gate trap is in `raptor-port/docs/gates-and-deploy.md`. The read it left owed — D607's short line against its full row (D138) — is PAID: Astra and Sol both checked it, nothing lost or added.
- **Done here:** (1) `raptor-port/docs/walk-ledger.md` — 63 rows added from 56 evidence sheets (65 in all; four Sonnet helpers extracted them, the host checked 45 figures and set the types; their full output: `raptor-port/docs/handpass/parts/ledger-g1.md` … `g4.md`), type R added, "The figures" written and then corrected on the two reads. (2) `raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md` — the measurement (about 97 thousand tokens before the first message, 68 of it the app's own; about 189 thousand once a scheduler build has opened its first files) and thirteen options. (3) `raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md` — sixteen "now → proposed" edits, VERSION 2: both readers said CHANGES REQUIRED on version 1 (a test could stand in for a control that must be pressed; seven sentences still ordered the unsized walk; the ledger's figures claimed too much), every finding taken; their reports are beside the brief in `raptor-port/docs/superpowers/briefs/2026-10-07-walk-sizing-wording-read-*.md`. **He approved version 2 on 7 Oct 26 (D608, "Approve") and it is IN THE GUIDE** — `raptor-port/docs/bug-check-order.md` §7.0 and the sentences around it, `.claude/rules/bug-check.md` steps 3 and 4 (its size marker raised by the two lines, with the reason), three passages of `raptor-port/docs/guide-full.md`, the ledger's fourth sizing line; version 2 had no read of its own (the cap of one round each, D70) — a later change to those sentences is read once more first. (4) Filed: `[PRIVATE-BRANCH-NEVER-PUSH]` — a branch on his PC with his phone photos, whose only caution stood in a merged block below.
- **QUESTIONS WAITING FOR HIM (the one list, D596):** (a) **the start-of-chat options** — which to do; recommended: 1 to 4 at once (the seven merged blocks out of this file, the spent rulings to the archive, the finished backlog items to the archive, his memory index pruned — about 25 thousand tokens off every chat, no rule lost), 5 to 7 with Astra and Sol reading first, 8 (the scheduler's rulings split by screen) as its own job, 9 and 10 are his own settings, 11 to 13 not recommended; everything in `[STACK-MERGED-TIDY]` waits on this. He asked on 7 Oct 26 what options 1 to 13 are and was told in plain words — his choice is still open. (b) ANSWERED — D608. (c) **the branch with his phone screenshots** (`[PRIVATE-BRANCH-NEVER-PUSH]`) — he asked what they are and was told: four screenshots of the app's preview for the phone Insights menu job, which is live; delete the branch from the PC, or keep it? recommended: delete — a deletion, only on his word. (d) ANSWERED — most chats start around 20%, as measured.
- **The document check fails here on six size markers only** (`OUTSTANDING.md`, this file, `.claude/rules/bug-check.md`, the rulings of How we work, the scheduler and the Tracker) — put off since 6 Oct while every branch carried code (D29); on this documents-only branch they bite, and they are exactly what options 1 to 3 answer. So NO pull request was opened: its documents check would stand red until he rules. Everything else in the check passes.
- **EVERY BLOCK BELOW THIS ONE is of a branch that merged with PR #481** (`codex/save-note-controls`, `codex/workflow-ui`, `codex/insights-mission-mix`, `claude/codex-review-3-oct`, `codex/rally-workspan`, `codex/discard-marks-remove`, `claude/planning-filing-3-oct`): history, not state. Do not act on them. Their removal is option 1; every backlog item they name is filed (checked); still to read before they go: their "not proven" caveats against the evidence sheets, and the folders they say to leave untouched.
- **Branch:** `claude/docs-tidy-7-oct`, pushed, no pull request. **Pick up here:** when he rules — on this same branch (pick `claude/docs-tidy-7-oct` in the picker, no new worktree; never `main`): do the options he chose, each a move by script, never a rewording (D138); bring the document check green; then open the pull request for his "merge live". A new BUILD job instead starts on a worktree from `main` — and sizes its walk first (D607; the ledger's five lines). Rulings: D608 recorded this chat (How we work); D607 marked changed by it; the next number is D609 (the calendar branch holds D567–D585). To him say **OIL**; his PC's screen runs at 125%. The skill-observation review is overdue (last 24 Sep, 178 notes waiting — option 10); one note written here (#447).
<!-- /now -->

## Next, in order

**RIGHT NOW (his word, D602, 6 Oct 26):** the Codex stack is LIVE (PR #481, merged 6 Oct 26 on his "merge live" — D589) → the crew-rest fault `[REST-BLANK-LINE]` (LIVE, PR #482, 6 Oct 26) →
`[BLANK-TIMES-ABSENCE]` with `[SC-PICKER-INTIME-REST]` (D605 — LIVE, PR #483, 6 Oct 26) → `[OIL-WORK-START]` (D591, D592, D606 — LIVE, PR #484, 7 Oct 26) → `[START-CONTEXT-AUDIT]` (what a new chat loads at its start: measured, options to him, nothing
trimmed before he rules — step 1 under way on `claude/docs-tidy-7-oct`, with `[WALK-LEDGER-HISTORY]` and `[WALK-SIZING-GUIDE]`) → the feature batches in D495's order (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

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
