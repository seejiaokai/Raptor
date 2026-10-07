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

<!-- now:claude/calendar-next-7-oct -->
### `claude/calendar-next-7-oct` — documents only: his word that the NEXT job is the Inputs calendar and the SANS availability calendar (D614), and that Opus builds it (D615), recorded; his "merge live" given for it (D616 — pull request #486) — written 7 Oct 26 — verify before use
- **Just before this:** the documents pass of 7 Oct 26 is LIVE — pull request #485 merged on his "merge live" (D612, now marked spent), the live deployment finished, the live version's document check passed. What it did (a new chat about 20 thousand tokens lighter; the walk sized per change, D608; the walk ledger's history; D609–D611) is in `raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md` (its foot) and `raptor-port/docs/walk-ledger.md`. The branch on his PC with his phone screenshots is deleted (D613). That chat's block is removed here: merged, its open points filed (`[WALK-COST]`, `[STACK-LEFTOVERS]`, what is left in `[START-CONTEXT-AUDIT]`).
- **NEXT (D614):** the Inputs calendar and the SANS availability calendar — the work held on `codex/inputs-sans-calendar` since 5 Oct, called back. **Read first:** that branch's own block (`git show origin/codex/inputs-sans-calendar:HANDOFF.md`), `OUTSTANDING.md` `[SANS-CALENDAR-WIP]`, the scheduler's rulings, and on that branch its rulings D567–D585. **First step:** bring that branch level with `main` — it is 124 commits behind and meets `main` in the rulings files (the filing script's `--merge`), `AGENTS.md`, `HANDOFF.md`, `OUTSTANDING.md`, `raptor-port/docs/ui-contracts.md`, `raptor-port/playwright.config.ts` and one screen file, `raptor-port/src/ui/InputsCal.tsx`. A fresh checkout of it needs `npm ci` in `raptor-port/`. **Who builds (D615):** Opus 5.5, here — it reads what Codex built first (a read by a model that did not write it), then carries on; Astra and Sol 6.1 review what Opus adds. Nothing of that work is deleted (D610). Size the walk before any walker starts (D607, D608).
- **Branch:** `claude/calendar-next-7-oct`, pushed; its pull request #486 is documents only, merged on his word (D616). If `gh pr view 486` says MERGED, remove this block at the next handoff. Rulings: D614, D615, D616 recorded here; D612 and D616 marked spent; the next number is D617 after checking the live rulings (D567–D585 are held by the calendar branch). To him say **OIL**; his PC's screen runs at 125%; an opening line he pastes needs one word typed by him beside it.
<!-- /now -->

## Next, in order

**RIGHT NOW (his word, D602, 6 Oct 26):** the Codex stack is LIVE (PR #481, merged 6 Oct 26 on his "merge live" — D589) → the crew-rest fault `[REST-BLANK-LINE]` (LIVE, PR #482, 6 Oct 26) →
`[BLANK-TIMES-ABSENCE]` with `[SC-PICKER-INTIME-REST]` (D605 — LIVE, PR #483, 6 Oct 26) → `[OIL-WORK-START]` (D591, D592, D606 — LIVE, PR #484, 7 Oct 26) → `[START-CONTEXT-AUDIT]` (what a new chat loads at its start: measured, options to him, then
his ruling — DONE 7 Oct 26 on `claude/docs-tidy-7-oct` (D609: options 1 to 6; the walk ledger's history and the walk-sizing wording with it, D608) — LIVE, PR #485, 7 Oct 26) → **the Inputs calendar and the SANS availability calendar (D614 — next)** → the feature batches in D495's order (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

**NEXT, HIS WORD (D614, 7 Oct 26): the Inputs calendar and the SANS availability calendar** — the work on the branch `codex/inputs-sans-calendar` (its own block, rulings D567–D585 and records are there), called back from its hold (D610). It is 124 commits behind the live version: bring it level first, with care (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]` names where it meets `main`). **Opus 5.5 builds it, in Claude Code (D615)** — reading what Codex built first; Astra and Sol 6.1 review what Opus adds. Nothing of it is deleted.

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
