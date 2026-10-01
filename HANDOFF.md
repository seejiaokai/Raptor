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

<!-- now:claude/db-readiness-p6c-holder-base -->
### `claude/db-readiness-p6c-holder-base` — `[DB-READINESS]` group A phase 6 (c) v3, the holder base: BUILT and FULL-checked (1 Oct 26, D467) — written 1 Oct 26 — verify before use
- **This chat:** his opening line (round 3, the build and its FULL check of (c) v3 on a new branch cut from
  `claude/db-readiness-table-shaping-4094f6`) — all done. One ruling: D468 (a moved request's extras stay with the old day — leave it); D469 unused. He asked, and was answered in
  plain words (filed, not ruled): how long; what comes next; whether to build against the database (yes, on IT's TEST copy)
  and whether to move now (after (c) and phase 7 merge; then one repo only) — `[RESTRICTED-ENV-WORKFLOW]`; why the folder is
  8 GB (leftover worktrees ~6 GB, pictures, history — not the code) — `[REPO-TIDY]`.
- **Built:** plan §3 (c) v3 and §9 (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md`); round 3's
  dispositions `…/briefs/2026-10-01-db-readiness-phase6c-dispositions-r3.md`.
- **The check:** `raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md` — Astra's scenarios (one reviewer); seven
  walks (`scripts/handpass/p6c-walk-*.mjs`), each on this build AND the build before (c) (`9191910b`, served from
  `raptor-port/dist-p6cbase` — ignored; `.claude/launch.json` `raptor-p6c` 4203 / `raptor-p6c-base` 4202), one at phone
  width; the gates and perf; both final reads (Astra REVISE 1–4, Fable REVISE F1–F2 + F3 low) — every finding fixed red
  first but Astra #3's Accept half (declined, with its reason) and F3 (measured, filed); the re-walk of all eight, 189/189.
- **Found and fixed, red first:** new filings landed above older rows (W1); a member's new row on a published day marked on
  every box (W2); a dead `kept` row taken for the request's row — the load's filing (another day's, and the version's own
  issued dead), the changes-window jump, the retype message, **the OIL evidence (money: a man on the dead row of a request
  filed under Unavailable was paid)**, a dead issued row read as its placement, a dead row's marks cleared by another
  request; the load's confirm count ("already at Original"); a landing's id colliding with a stored dead row (Fable F1);
  the baseline after a delete's book change (Fable F2). **The one rule since: a row that carries `kept` is never the
  request's row.** **Intended, plan §8 items 14–15:** a moved request leaves the scheduler's additions on the old day
  (**his answer, 1 Oct 26: leave it — D468**); an issued row's retimed mark on the time box. **Filed for group B:** the
  after-command pass costs ~5–9 ms a command (`[DB-READINESS]` (iii)).
- **Unfinished:** his look (the card at the foot of the sheet); then "merge live" —
  this branch AND its parent `claude/db-readiness-table-shaping-4094f6` (phases 0–6), whose own cards are still unlooked-at.
  **Before "merge live": remind him to EXPORT a copy of his Tracker first (D464).** Then phase 7.
- **Parallel (D302):** rulings: D468 used — a next chat on this lineage takes D469, then a new range; observations
  #396–#400 used here (a next chat takes #401 on).
- **Traps met:** `codex exec` run in the background waits on stdin forever — add `< /dev/null` (observation #399);
  `tsc -p tsconfig.json` checks nothing here — `npx tsc --noEmit -p tsconfig.app.json` (#397); a CX on the board opens its
  "Cancel this item" sheet ("Cancel line" confirms); the desktop week's scroll is held by the app — to picture the
  next-week preview, move its scroller by the element's offset (`p6c-probe5.mjs`).
- **Pick up here:** his look and his answer; then his "merge live" for the lineage (parent first or together — his call).
<!-- /now -->

<!-- now:claude/db-readiness-table-shaping-4094f6 -->
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: phases 0–5b BUILT and FULL-checked; **phase 6 (a), (b), (d) BUILT and FULL-checked (30 Sep 26); (c) needs v3** — written 30 Sep 26 — verify before use
- **This chat:** opened with the previous chat's opening line ("plan and build phase 6"); asked, he confirmed D467's order —
  the FULL bug check of (a), (b), (d) — which is done. No new ruling.
- **The check:** `raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md` — Astra's scenarios (one reviewer); the roll-call
  (no missing door); five walks, each run on this build AND on the build before phase 6 (`0d1a5e18`, exported to `C:\p6b` —
  a worktree fails on this repo's long picture names), the screen compared fact by fact (`scripts/handpass/p6-*.mjs`); three
  at phone width; thirteen break tests; the gates and perf; both final reads (Astra: no findings; Fable: two low).
- **Found and done:** F1 / F2 — two visible changes the plan's §8 lacked (the Amendments panel no longer counts marks a filing
  or a delete left on never-published days; a delete now also clears a week nobody has saved — a defect of the build before)
  — plan §8 items 3–4, his look card; F3 a stale comment; F4 four overlay wires with no test — tests written, each red when
  broken; F5 the orphaned week writers `stashEditDays` / `stashEditWeek` removed; Fable F1 (a delete on a read-only week ON
  SCREEN went ahead, a reload put him back) — fixed red first, one refusal rule; Fable F2 (the overlay's cost grows with the
  deleted roster, ≈0.2 ms per `validate()` today) and Fable's question (the delete's seat history lines cover only the week on
  screen — pre-existing) — both FILED in `OUTSTANDING.md` `[DB-READINESS]` "for group B".
- **Unfinished:** (1) his look (the card at the foot of the sheet — step 1 walked at the real date) AND his look at phases
  0–5b (the card at the foot of `…/2026-09-30-dbrA-group-walk.md`). (2) (c) v3 — the HOLDER BASE, dispositions
  `…/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md`, red tests committed SKIPPED (`src/state/p6c-requestonread.test.ts`) —
  in a fresh chat on its own branch (D467). (3) Phase 7. All under `[DB-READINESS]` in `OUTSTANDING.md`.
- **Gates (30 Sep 26, under the lock, the final code):** unit 7363 passed, 12 skipped · build · tfin 728/0 · e2e 509 passed, 0 failed, 49 skipped · smoke 445/0 · rulecheck OK · docsize OK (OVER by 342, deferred — D29) · perf 4/0 (on the walked build and the build before phase 6, level) · the saved-week test files re-run after the last removal 47 files / 685 passed.
- **Before this branch's "merge live": remind him to EXPORT a copy of his Tracker first (D464).** Branch pushed; no PR.
- **Open question for him (not blocking):** the long message after "Load onto working copy" (he asked what it was, 30 Sep
  26) — offered to file a shorter two-line version as its own small job; his answer, if any, not yet given.
- **Parallel (D302):** rulings D460–D469 (D460–D467 used — a next chat on this branch takes D468–D469, then a new range);
  observations #392–#395 used on this branch (a next chat takes #396 on). No other open branch known.
- **Traps met:** a heredoc eats `\` — write Python edit scripts to a FILE; the gatelock `run` gate list has no perf (run
  `PORT_URL=<build> npm run perf` under `gatelock take`); `git worktree add` of an old commit fails on this repo (long picture
  names) — `git archive <commit> raptor-port/src …` to a short path and junction `node_modules`; a walk's toast recorder
  dies with a reload — re-arm it (or read the picture).
- **Pick up here:** his look; then (c) v3 per D467 — a fresh chat, its own branch cut from this one.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL check done (the walk and both code reads, every finding fixed); phase 6 (a), (b), (d) built and FULL-checked 30 Sep 26 (`raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`); phase 6 (c) v3 built and FULL-checked 1 Oct 26 on `claude/db-readiness-p6c-holder-base` (D467 — `…/2026-10-01-dbr-phase6c-check.md`) — next his look at both, his "merge live", then phase 7 (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 1 Oct 26, `claude/db-readiness-p6c-holder-base` (phase 6 (c) v3 with every fix of its FULL check
and both final reads), under the PC lock: unit **7401 / 7401** (463 files) · build clean · tfin **728 / 0** · e2e **509 passed,
0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK (notes `AM39d` now covered — older, left) · docsize OK (OVER, deferred
— D29) · perf **4 / 0** (board DOM 1024 ≤ 1150, week 5134 ≤ 5450). Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
