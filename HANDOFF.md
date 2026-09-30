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
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: plan v4 final; **phases 0–4 BUILT** (all gates green); phase 5 next — written 30 Sep 26 — verify before use
- **Where it started:** his ask: plan group A (D453), red-team it with both reviewers, then build it; D460–D463 ruled on the way.
- **Shipped (this branch, pushed, no PR):** the plan (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`,
  v4 + §9 build log per phase); **phase 0** (the `SchemaVersion` stamp, the boot group, the fold machinery, the stream
  consumer); **phase 1 — the schedule one day per row** (`src/state/weekrows.ts`); **phase 2 — requests, roster, planning
  calendar one row each** (`ord` — `src/engine/ord.ts`); **phase 3 — the Leave War one row per record**
  (`src/leavewar/state/rows.ts`) with D460/D461 built (no Edit person on the war); **phase 4 — the change log, the edit log,
  accounts** — one `changes/<clientBootId>-<first seq>` batch per saved group, built by the whiteboard's seal
  (`src/state/changebatch.ts`, `src/storage/tables.ts`); the change history one row per line (`settings/elog:<lineId>`,
  written inside its command; order `(t, lineId)`), each person's seen `settings/seen:<pid>` (positions), accounts /
  requests / each admin's seen a row each (`account:`, `accessreq:`, `reqseen:`); every Tracker save written by the Tracker's
  own subscriber inside its command, its own Undo / Redo one restore command each; the `elog` and `accounts` converters
  (`src/state/settingsrows.ts` — seven of eight registered, target still 5). The roll-call test
  (`src/state/changebatch-rollcall.test.ts`) drives every kind of writer and fails on any save after boot with no batch;
  the one named exempt writer is the Tracker's first mount.
  **Found on the way:** Tuesday's change blocked Monday's Undo (phase 1); the retired entry lost `ros`/`added` (phase 1);
  deleting a man left him on the planning calendar (phase 2, on `main` too); the OIL pass would have rewritten every credit
  (phase 3); almost every Tracker save reached storage AFTER its command — a bare save, and a refused one still stored
  (phase 4); a key renumbering in a refused command still changed the history (phase 4).
- **Gates (phase 4, watched, under the lock):** unit 7226/7226 (453 files) · build · tfin 728/0 · e2e 508 passed, 1 failed (the month-window timing flake — `[LW-WINDOW-PRUNE-FLAKE-2]`, alone 3/3 straight after), 49 skipped · smoke 445/0 · rulecheck · docsize; perf 4/4 (four runs: oneEdit 1.32–1.38×, noop 1.48–1.51×, board 1.29–1.34×, noopB 1.55–1.59× — inside phase 3's spread, noopB at its top).
- **Unfinished:** phase 5 (never seed a shared store — `BootPolicy`, frozen seed copies, the bootstrap admin; P0-BOOTSTRAP's
  Person + User half lands here) and 5b (the Tracker one piece per thing), then the FULL walk and BOTH reviewers' code reads
  (D11, D353), then 6 (worked out on read — its hand-over waits on IT's reporting answer, §12 q9), then 7.
- **Branch:** `claude/db-readiness-table-shaping-4094f6`; no PR. Build on it. A branch push runs no checks (workflows are main / PR only).
- **Open questions for him:** none of this chat's. For IT (`[IT-QUESTIONS]`): "no plug-in" in writing; Custom APIs / Power
  Automate allowed?; can reports combine a day with the leave and people tables; when do their tables settle; can they
  assign `EditLog.seq`; change tracking on for `ChangeBatch`.
- **Parallel (D302):** rulings D460–D469 (D460–D463 used); observations #380–#389 (#380–#384 used). No other open branch on 30 Sep 26.
- **Don't send him this branch's preview yet:** a browser holding old whole-list records reads them only after the fold,
  which runs once all eight converters exist (end of group A — seven registered now); a fresh browser is fine.
- **Traps met:** `src/state/store.ts` and `src/leavewar/state/store.ts` are CRLF files — edit them by script converting the
  literals, never `sed -i` (memory `python-edits-crlf-trap`); `src/engine/editlog.ts` holds one deliberate NUL byte (the
  grouped view's key) — edit it by bytes, git shows it as binary; a Python edit script with nested quotes is safest
  written to the scratchpad and run from there; a test fake settings backend needs `keys()` and a `'null'` = delete, as the
  real adapter has, or rows are invisible to it.
- **Pick up here:** plan §3 phase 5 with §8's P5-LANDING and P0-BOOTSTRAP (its Person + User half — plan §9 phase 0's
  sequencing note), red tests first: (1) a `BootPolicy` chosen in `main.tsx` (`seedDemo`, default true — his preview
  unchanged), passed to the shell, the scheduler, the Leave War, the Tracker and accounts; (2) frozen seed copies, every
  boot resetting the LIVE arrays from a fresh clone or to blank; (3) with `seedDemo` false: no demo inputs (the landing
  pass still runs — P5-LANDING), no demo world, no Tracker demo pair or default course (D463 — its empty state, a way in),
  no seed-admin lock-out repair; the accounts' "no rows = the seeded list" (phase 4.4, `state/accounts.ts`) becomes
  "no rows = none" there; (4) the bootstrap admin from the root configuration — Person, User and `initialized` in ONE
  group, idempotent, failing closed. Read `src/main.tsx`, `src/state/store.ts initStore`, `src/leavewar/state/demoworld.ts`,
  `src/tracker/app/core.js init/applyBundle`, `src/state/accounts.ts accountsLoad` first. Also filed for 5b: the Tracker
  writes one person's chart pick into the course's shared plan (`OUTSTANDING.md` `[DB-READINESS]`).
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–4 built 30 Sep 26, phase 5 next (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A phase 4), under the PC lock: unit
**7226 / 7226** (453 files) · build clean · tfin **728 / 0** · e2e **508 passed, 1 failed** (the known month-window timing
flake, `[LW-WINDOW-PRUNE-FLAKE-2]` — alone 3 / 3 straight after), 49 skipped · smoke **445 / 0** · rulecheck OK · docsize OK ·
perf 4 / 4. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
