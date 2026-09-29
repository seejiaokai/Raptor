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

<!-- now:claude/db-readiness-table-shaping-4094f6 -->
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: plan v4 final; **phases 0, 1 and 2 BUILT** (all gates green); phase 3 next — written 30 Sep 26 — verify before use
- **Where it started:** his ask: plan group A (D453), red-team it with both reviewers, then build it; D460–D463 ruled on the way.
- **Shipped (this branch, pushed, no PR):** the plan (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`,
  v4 + §9 build log for phases 0 and 1); **phase 0** (the `SchemaVersion` stamp, the boot group, the fold machinery, the stream
  consumer — see §9); **phase 1 — the schedule one day per piece:** `src/state/weekrows.ts` splits a week into its week row, seven
  day rows, one row per issuance (`:is:<verId>~<n>`, append-only) and per Unpublish (`:rx:`); the command layer's records follow
  (per-day `days` / `sched.book` / `sched.mutes`, `sched.week`, `sched.issuance`, `sched.retraction`); the rows are written from each
  command (a composer in `rowmap.ts`, registered by `persist.ts`); the week-deleting reconcile is gone; `un` is not stored (read
  from the request's own `acc:'r'`); a week switch is read-only (a saved week's landing is one `sched.load` command, origin seed);
  the stale-mark sweep and the row-id fixer touch only the days a command changed. **Found on the way:** another person's Tuesday
  change blocked his Undo of Monday (fixed, D148); the retired entry lost the issued record's `ros` / `added` (now kept as `rec`).
  **Phase 2 — requests, roster, planning calendar one row each** (`inputs/<iid>`, `people/<pid>`, `plan/pp:<id>`,
  `plan/dm:<iso>`; each list's order on its rows — `ord`, `src/engine/ord.ts`; `persistAll` gone; a first boot stores the seed's
  rows; opaque note ids; a cleared setting removes its key). **Found on the way (on `main` too):** deleting a man never took him
  off the planning calendar's puck rows (the delete read `iso`; the rows carry `date`) — fixed red-first.
- **Gates (phase 2, watched, under the lock):** unit 7136/7136 · build · tfin 728/0 · e2e 509/0 (49 skipped) · smoke 445/0 · perf 4/4
  (unchanged since before phase 1 — measured side by side then) · rulecheck · docsize.
- **Unfinished:** phases 3 → 5 and 5b (the shape IT needs), then the FULL walk and BOTH reviewers' code reads (D11, D353), then 6
  (worked out on read — its hand-over waits on IT's reporting answer, §12 q9), then 7.
- **Branch:** `claude/db-readiness-table-shaping-4094f6`; no PR. Build on it. A branch push runs no checks (workflows are main / PR only).
- **Open questions for him:** none of this chat's. For IT (`[IT-QUESTIONS]`): "no plug-in" in writing; Custom APIs / Power
  Automate allowed?; can reports combine a day with the leave and people tables; when do their tables settle.
- **Parallel (D302):** rulings D460–D469 (D460–D463 used); observations #380–#389 (#380–#382 used). No other chat was building on 30 Sep 26.
- **Don't send him this branch's preview yet:** between phases a browser holding old whole-list records reads them only
  after the fold, which runs once all eight converters exist (end of group A); a fresh browser is fine.
- **Traps met:** `src/state/store.ts` is a CRLF file — edit scripts must convert their literals, and `sed -i` in Git Bash turned it
  to LF once (fixed by an endings-only commit; memory `python-edits-crlf-trap`); a test that edits a blank week must ADD a note.
- **Pick up here:** plan §3 phase 3 (the Leave War one record each) with §8's P3-CELL-DIFF — red tests first; `npm run perf`
  before and after; D460/D461: the war's "Edit person" and `PersonSheet.tsx` go, seat / SXO from the person, band from his CAT.
  Read `src/leavewar/state/store.ts` (`lwDecompose`, `rawPersist`, `lwStore`), `src/leavewar/engine/warrecs.ts`,
  `src/leavewar/sync.ts` and `src/state/persist.ts` (the mappers are the model) first; the area file
  `.claude/rules/decisions/leave-war.md` loads when a Leave War file is read.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–2 built 30 Sep 26, phase 3 next (D453). The IT team is taking the app into Dataverse now, and he means to
   keep working on the app beside it. What to finish before the hand-over was put to him the same day; record his answer
   here and in `OUTSTANDING.md`'s priority list the moment he gives it. Everything below keeps its ORDER; its timing is overtaken.
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
   screens. Ask IT when its tables settle. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[LW-FROZEN-BAR-GAP]`; the Tracker leftovers'
   own residue — `[SAVE-NOTE-COVERS]` (medium, next), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A phase 2), under the PC lock: unit
**7136 / 7136** (445 files) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** ·
rulecheck OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
