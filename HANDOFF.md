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
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: plan v4 final; **phases 0–5 and 5b BUILT**; the group's FULL walk + both code reads next — written 30 Sep 26 — verify before use
- **Where it started:** his ask: plan group A (D453), red-team it with both reviewers, then build it; D460–D464 ruled on the way.
- **Shipped (this branch, pushed, no PR):** the plan (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`,
  v4 + §9 build log per phase); phase 0 (the `SchemaVersion` stamp, the boot group, the fold machinery, the stream consumer);
  1 — the schedule one day per row; 2 — requests, roster, planning calendar one row each (`ord` — `src/command/ord.ts`,
  moved from `engine/` in 5b); 3 — the Leave War one row per record (D460/D461); 4 — the change log, the edit log a row per
  line, accounts a row each, every Tracker save inside its command; 5 — never seed a shared store (the boot policy, frozen
  seeds, the first admin, the empty war and Tracker pages); **5b — the Tracker one piece per thing (D462, D464)**: the
  course list, each course and chart's student list, the charts (definitions, names, order, hidden, deleted) and the details
  on each ball stored one row per thing, through a row door in `core.js` (`src/tracker/app/rows.js`); the fold's eighth
  converter (`src/tracker/fold.ts`, registered by `src/boot.ts`) — **the manifest is complete: the app writes format 6 and
  converts a browser's old records once at its next boot**; the chart a signed-in person opens is his own place, never the
  course's shared plan (the finding filed in phase 4 — fixed). Tests: `tracker/app/rows.test.ts`, `tracker/trk-rows.test.ts`
  (several browsers on one store; his old records read and exported exactly as before), two in `trk-restore.test.ts`, one in
  `eventDetails.test.tsx`.
- **Gates (5b, watched, under the lock):** unit 7303/7303 (459 files) · build · tfin 728/0 · e2e 509 passed, 0 failed, 49
  skipped · smoke 445/0 · rulecheck · docsize; perf 4/4 (oneEdit 1.37×, noop 1.46×, board 1.29×, noopB 1.46×). **The walk:**
  `raptor-port/docs/handpass/2026-09-30-dbr-phase5b.md` — `main`'s app built from main's source made his kind of Tracker work,
  this build then opened that browser: converted once, nothing lost anywhere in the app, the Tracker read and exported
  exactly as before (10/10); two tabs each saving — both kept; each person's own chart (8/8); ten break tests, each red.
- **Unfinished:** the group-wide FULL walk (bug-check order §5 — the roll-call over phases 0–5b, the other model's scenarios
  first) and BOTH reviewers' code reads (persistence — D11, D353; the brief carries the D56 exclusion and the evidence
  sheets), then 6 (worked out on read — its hand-over waits on IT's reporting answer, §12 q9), then 7.
- **Before this branch's "merge live": remind him to EXPORT a copy of his Tracker first (D464)** — the conversion runs on his
  browser at its first load of the new build (walked on a `main`-written browser: nothing lost).
- **Branch:** `claude/db-readiness-table-shaping-4094f6`; no PR. Build on it. A branch push runs no checks (workflows are main / PR only).
- **Open questions for him:** none of this chat's. **For IT:** the whole list — `OUTSTANDING.md` `[IT-QUESTIONS]` (+ `data-model.md`
  §12 q1–q11), given to him as a copyable text on 30 Sep 26.
- **Parallel (D302):** rulings D460–D469 (D460–D464 used); observations #380–#389 (#380–#386 used). No other open branch on 30 Sep 26.
- **His preview:** the fold now runs (all eight converters exist), so a browser holding the old records converts at its first
  load — walked on a `main`-written browser. Still, send him the link only with the export reminder above.
- **A shared-store build, for a walk:** `VITE_SEED_DEMO=false VITE_BOOTSTRAP_ADMIN='{"principal":"boss@unit.example","person":{"cs":"Boss","ini":"BS","seat":"FCP","cat":"A"}}' npx vite build --outDir dist-blank`,
  then `npx vite preview --outDir dist-blank --port 4191`; sign in as `boss@unit.example` with any password. **`main`'s app,
  for a before/after walk:** `git archive origin/main raptor-port/src raptor-port/index.html raptor-port/vite.config.ts
  raptor-port/package.json raptor-port/public raptor-port/tsconfig*.json` into a SHORT folder (a full checkout of main fails
  on the long picture paths), link its `node_modules` to this checkout's (a junction), `npx vite build --outDir dist-main`;
  serve the old and the new build on the SAME port in turn (`scripts/handpass/dbr5b-walk.mjs` old / new / live).
- **Traps met:** `src/state/store.ts` and `src/leavewar/state/store.ts` are CRLF files — edit them by script converting the
  literals, never `sed -i` (memory `python-edits-crlf-trap`); `src/engine/editlog.ts` holds one deliberate NUL byte — edit it
  by bytes; a Python edit script is safest WRITTEN TO A FILE (the Write tool) — a heredoc mangles `\`; a test fake settings
  backend needs `keys()` and a `'null'` = delete; a test that swaps the Tracker's store without a boot calls
  `rehydrateForTests()` (its saves compare with what it has read); a `.claude/rules/decisions/tracker.md` edit is near its
  byte tripwire (17.6k of 18k).
- **Pick up here:** the group-wide FULL walk and both reviewers' reads (plan §6 for the walk list; `docs/bug-check-order.md`
  §4 for the reviewers' brief) — Opus 5.5 walks; Fable 5.1 AND Astra read, blind to each other.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL walk and both code reads next (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A phase 5b), under the PC lock: unit
**7303 / 7303** (459 files) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** ·
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
