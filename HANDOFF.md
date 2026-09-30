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
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: plan v4 final; **phases 0–5 BUILT**; phase 5b next — written 30 Sep 26 — verify before use
- **Where it started:** his ask: plan group A (D453), red-team it with both reviewers, then build it; D460–D464 ruled on the way.
- **Shipped (this branch, pushed, no PR):** the plan (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`,
  v4 + §9 build log per phase); **phase 0** (the `SchemaVersion` stamp, the boot group, the fold machinery, the stream
  consumer); **phase 1 — the schedule one day per row** (`src/state/weekrows.ts`); **phase 2 — requests, roster, planning
  calendar one row each** (`ord` — `src/engine/ord.ts`); **phase 3 — the Leave War one row per record**
  (`src/leavewar/state/rows.ts`, D460/D461 built); **phase 4 — the change log, the edit log, accounts** (one
  `changes/<clientBootId>-<first seq>` batch per saved group; the history a row per line; accounts, requests, seen a row
  each; every Tracker save inside its command); **phase 5 — never seed a shared store**: the boot policy
  (`src/bootpolicy.ts` — `VITE_SEED_DEMO=false` = a shared store; the demo by default, his preview unchanged), the boot in
  one function (`src/boot.ts bootApp`, moved whole out of `main.tsx`), frozen seed copies reset in place every boot
  (`src/state/seeds.ts`), nothing demo on a shared store (no requests, roster, weeks — the two authored weeks read blank —
  accounts, Leave War world, Tracker course or pair, D463), the FIRST ADMIN from `VITE_BOOTSTRAP_ADMIN` (person, account
  and stamp in one group, idempotent, failing closed — "RAPTOR is not set up yet"), the Leave War's "No leave period yet"
  and the Tracker's "No course yet" pages. Tests: `src/boot.test.ts`, `src/boot-walk.test.tsx` (the first admin opens every
  page; storage then holds only what the first boot stored), `leavewar/emptywar.test.tsx`, `tracker/trk-nocourse.test.tsx`.
  **Found on the way:** Tuesday's change blocked Monday's Undo (1); the retired entry lost `ros`/`added` (1); deleting a
  man left him on the planning calendar (2, on `main` too); the OIL pass would have rewritten every credit (3); almost
  every Tracker save reached storage AFTER its command (4); a key renumbering in a refused command still changed the
  history (4); a started store whose war rows all failed to read showed the DEMO's wars (5 — now none, the empty page).
- **Gates (phase 5, watched, under the lock):** unit 7263/7263 (457 files) · build · tfin 728/0 · e2e 509 passed, 0 failed, 49 skipped · smoke 445/0 · rulecheck · docsize; perf 4/4 (two runs: oneEdit 1.38–1.39×, noop 1.41–1.44×, board 1.29–1.31×, noopB 1.48× — inside phase 4's spread). **The LOOK on a shared-store build:** 16/16 (`raptor-port/scripts/handpass/dbr5-look.mjs`, pictures `raptor-port/docs/img/handpass/2026-09-30-dbr-phase5/`) — it found the two empty cards' phone gutter and the war's unstyled button, fixed after the gate run with the New-war calendar's first month (this month, not January 2026): the Leave War's screen tests 842/842 and `e2e/leavewar.spec.ts` 299 passed, 0 failed (39 skipped).
- **Unfinished:** 5b (the Tracker one piece per thing — its conversion must carry every chart, layout and ball's details:
  D464; remind him to EXPORT a copy before its "merge live"), then the FULL walk and BOTH reviewers' code reads (D11,
  D353), then 6 (worked out on read — its hand-over waits on IT's reporting answer, §12 q9), then 7.
- **Branch:** `claude/db-readiness-table-shaping-4094f6`; no PR. Build on it. A branch push runs no checks (workflows are main / PR only).
- **Open questions for him:** none of this chat's. **For IT:** the whole list — 29 questions with their context, in four
  groups (A before the tables settle: the first admin, "no plug-in" in writing, reports, when the tables settle,
  `EditLog.seq`, change tracking, `sortIndex`, alternate keys, `InputType`/`LeaveCounter`) — was given to him as a copyable
  text on 30 Sep 26 to send; the list's home is `OUTSTANDING.md` `[IT-QUESTIONS]` (+ `data-model.md` §12 q1–q11).
- **Parallel (D302):** rulings D460–D469 (D460–D464 used); observations #380–#389 (#380–#385 used). No other open branch on 30 Sep 26.
- **Don't send him this branch's preview yet:** a browser holding old whole-list records reads them only after the fold,
  which runs once all eight converters exist (the Tracker's is 5b's); a fresh browser is fine.
- **A shared-store build, for a walk:** `VITE_SEED_DEMO=false VITE_BOOTSTRAP_ADMIN='{"principal":"boss@unit.example","person":{"cs":"Boss","ini":"BS","seat":"FCP","cat":"A"}}' npx vite build --outDir dist-blank`,
  then `npx vite preview --outDir dist-blank --port 4191`; sign in as `boss@unit.example` with any password. The LOOK script:
  `raptor-port/scripts/handpass/dbr5-look.mjs`.
- **Traps met:** `src/state/store.ts` and `src/leavewar/state/store.ts` are CRLF files — edit them by script converting the
  literals, never `sed -i` (memory `python-edits-crlf-trap`); `src/engine/editlog.ts` holds one deliberate NUL byte — edit it
  by bytes; a Python edit script is safest WRITTEN TO A FILE (the Write tool) and run from there — a heredoc through the
  shell mangled `\'` and one with many quotes would not parse; a test fake settings backend needs `keys()` and a `'null'` =
  delete, as the real adapter has.
- **Pick up here:** plan §3 phase 5b (the Tracker one piece per thing — D462) with D464 (his charts, syllabi and ball details
  are kept: the converter carries them across, tested before and after) and the filed finding (the Tracker writes one
  person's chart pick into the course's SHARED plan — `OUTSTANDING.md` `[DB-READINESS]`). Red tests first: two clients add
  two students to one course and chart — both remain; two clients edit two different charts — both remain; course and
  student order kept across a reload; the conversion keeps every chart, layout and detail; the Tracker smoke green. The
  eighth converter (`tracker`) makes the fold's format 6 — then run the fold tests at 6. Read `src/tracker/app/core.js`
  (`kRosterFor`, `saveRoster`, `kCourses`, `kSyls`, `trkRegisterCommands`), `src/storage/tables.ts TRACKER`,
  `src/storage/fold.ts` first.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 built 30 Sep 26, phase 5b next (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A phase 5), under the PC lock: unit
**7263 / 7263** (457 files) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** ·
rulecheck OK · docsize OK · perf 4 / 4. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
