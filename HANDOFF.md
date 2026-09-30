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
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: phases 0–5b BUILT; **the group-wide FULL check DONE — the walk, both code reads, every finding fixed; his look next** — written 30 Sep 26 — verify before use
- **Where it started:** his ask: plan group A (D453), red-team it with both reviewers, then build it; D460–D464 ruled on the way;
  then (this chat) "run group A's group-wide FULL bug check: the roll-call over phases 0–5b, the walk, then both reviewers'
  code reads (Fable and Astra, blind)".
- **Shipped (this branch, pushed, no PR):** the plan (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`,
  v4 + §9 build log — phases 0–5b, the group walk, **the final reads**); every saved record one row per thing, written from
  each command's changes, one change-log batch per saved group, the one-time conversion (format 6), no demo in a shared store.
- **The group-wide FULL walk (30 Sep 26):** evidence `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md` — scenarios by
  Astra (one reviewer, D353), five walkers on a frozen build, 2,576 checks (the shared driver `scripts/handpass/dbrA-lib.mjs`).
  Six fixes, each red first (H3, H1, H2, W5-1, W5-2, W3-F2 — the sheet's table); thirteen items filed (the notable one
  `[UNDO-PUBLISH-ERASES-ISSUANCE]`, group B). The conversion held on a `main`-written browser (D464).
- **The code reads (30 Sep 26), blind to each other:** Fable (4) and Astra (3) — reports
  `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-final-read-{fable,astra}.md`, dispositions in the
  sheet §The code reads. Both found the same two: **a landing is never saved now** (a week switch and the boot wrote this
  browser's copy of a day or a request over another person's later change — `writeLoadedWeekAtBoot` removed, the walk's H1
  fix with it), and **§11 matched who writes the history and the change log** (`EditLog` admin C R D / member C R;
  `ChangeBatch` C for a waiting person; the Admin → Data sweep runs as the admin — Astra's "system identity" set aside by
  evidence: no plug-in, so only the signed-in browser writes). Fable alone: **the conversion one converter at a time**, a space
  check first, `StoreFullError` and its own screen (a browser over half full could never convert — D401, D464); **a week that
  will not split refuses the action**. Astra alone: **the change log names a Tracker mark `Attempt`, pace and lulls
  `CoursePlan`** (all were `Enrolment`). Each with a break test; re-walked in the app (`dbrA-host-fable2` 3/3,
  `dbrA-host-final` 10/10).
- **Gates (with every fix, watched, under the lock):** unit 7329/7329 · build · tfin 728/0 · e2e 509 passed, 0 failed, 49 skipped · smoke 445/0 · rulecheck · docsize (over, deferred — D29) · perf 4/4 (1.31–1.46×). One test fixed on the way: it muted a warning under a key the app never makes, which the split-failure fix now rightly refuses.
- **Before this branch's "merge live": remind him to EXPORT a copy of his Tracker first (D464)** — the conversion runs on his
  browser at its first load of the new build (walked on a `main`-written browser: nothing lost).
- **Branch:** `claude/db-readiness-table-shaping-4094f6`; no PR. Build on it. A branch push runs no checks (workflows are main / PR only).
- **Open questions for him:** none of this chat's. **For IT:** `OUTSTANDING.md` `[IT-QUESTIONS]` (+ `data-model.md` §12 q1–q11;
  "no plug-in" is still to be confirmed in writing — the sweep's identity rests on it).
- **Parallel (D302):** rulings D460–D469 (D460–D464 used); observations #380–#391 (ALL used — #387–#391 by this check; a next
  chat on this branch takes a new range). No other open branch on 30 Sep 26 past observation #370.
- **His preview:** send the link only with the export reminder above.
- **Recipes:** a shared-store build — `VITE_SEED_DEMO=false VITE_BOOTSTRAP_ADMIN='{"principal":"boss@unit.example","person":{"cs":"Boss","ini":"BS","seat":"FCP","cat":"A"}}' npx vite build --outDir dist-blank`;
  `main`'s app — `git archive origin/main raptor-port/src raptor-port/index.html raptor-port/vite.config.ts raptor-port/package.json
  raptor-port/public raptor-port/tsconfig*.json` into a SHORT folder, `node_modules` a junction, `npx vite build --outDir dist-main`,
  served on the SAME port as the new build in turn (`scripts/handpass/dbrA-W4-fold.mjs` old / new). A walk serves a FROZEN copy
  of `dist` (`dist-walk`) so fixing and rebuilding never swaps the bundle under the walkers; a re-walk writes to its own folders
  (`HP_SHOTS` / `HP_OUT` / `HP_REWALK_OUT` — the first walk's pictures are the evidence).
- **Traps met:** `src/state/store.ts` and `src/leavewar/state/store.ts` are CRLF — edit by script; `src/engine/editlog.ts` holds one
  NUL byte — edit by bytes; a Python edit script is safest WRITTEN TO A FILE (a heredoc eats `\`); a test that writes a
  history line with no command running now waits for the end of the turn (`await Promise.resolve()`); a test fixture must
  CHANGE a day for its row to be saved (no seven-day first save); a landing is never saved, so a test that expects a row
  after a week load or a boot is wrong; a gate run you STOP leaves the PC lock held — release it (`gatelock.mjs release`);
  the demo's seeded accounts are not stored as rows until one changes (read an account id off a batch instead);
  `.claude/rules/decisions/tracker.md` is near its byte tripwire (17.6k of 18k).
- **Pick up here:** his look (the card at the foot of the sheet) on the preview, with the export reminder; then phase 6
  (worked out on read — its hand-over waits on IT's reporting answer, §12 q9; the landing WRITES are already gone), then 7.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL check done (the walk and both code reads, every finding fixed) — his look next, then phases 6 and 7 (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A, with the walk's and both code reads' fixes), under the
PC lock: unit **7329 / 7329** (459 files) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK · docsize OK · perf 4 / 4. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
