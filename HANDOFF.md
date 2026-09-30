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
### `claude/db-readiness-table-shaping-4094f6` — `[DB-READINESS]` group A: phases 0–5b BUILT and FULL-checked; **phase 6 (a), (b), (d) BUILT (not yet FULL-checked); (c) needs v3** — written 30 Sep 26 — verify before use
- **Where it started (this chat):** "plan and build phase 6 (worked out on read)"; mid-way he ruled D465 (build it now, (c)
  included, without waiting for IT), D466 (work needing IT's confirmation is held; (c) does not), D467 (the FULL check of
  (a), (b), (d) first, in a new chat; (c) v3 after, in a fresh chat on its own branch).
- **The plan:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` (v2 + §9 build log); reviews and
  dispositions beside it in `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-*` (round 1: Fable REVISE,
  Astra BLOCK; round 2 on (c): Fable REVISE, Astra BLOCK).
- **Shipped (this branch, pushed up to the D466 commit; no PR):** (a) a hand-over writes no day — `Input.hand`, `Input.leftAt`,
  `oild.pa`, the read-side prune (`engine/oilev.ts`); `clearOilPersonDecisions` gone. (b) no `inp:` filing marks. (d) a delete
  writes no week — `engine/overlay.ts` (new) applied wherever a week's days come into memory (`applyWeekModel` + the boot's
  seed path, `weekstash.ts stashDays`, `weekctx.ts bundle`'s seed branch, `ui/peek.ts`) and AFTER the delete's command (a
  phase-8 effect, baseline moved on — a nested command joins its outer envelope, so no command-type rule could work); the
  load belt and the overlay decide a landed row by the request's CURRENT holder. Documents fixed (D201).
- **Unfinished:** (1) the FULL bug check of (a), (b), (d) — not started (D467): roll-call, Astra's scenarios, the walk, both
  code reads, the evidence sheet, his look. (2) (c) v3 — the HOLDER BASE (the week on screen always = the overlay applied to
  the day as its holder last committed it), dispositions `…/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md`; its red
  tests drafted and committed SKIPPED (`raptor-port/src/state/p6c-requestonread.test.ts`). (3) Phase 7. All under
  `[DB-READINESS]` in `OUTSTANDING.md`.
- **Gates (30 Sep 26, under the lock, on (a)+(b)+(d)):** unit 7357/7358 — the one a test premise (b) moved
  (`ui/amendretest.test.tsx` AM23), fixed and re-run alone 26/26 · build · tfin 728/0 · e2e 509 passed, 0 failed, 49 skipped ·
  smoke 445/0 · rulecheck · docsize. After that: the load-belt fix (Fable r2 F1) — the delete suites 31/31. `npm run perf`
  NOT run this chat (the overlay adds work to `stashDays` / `bundle`, read on every keystroke) — run it in the check.
- **Before this branch's "merge live": remind him to EXPORT a copy of his Tracker first (D464).** His preview only with that
  reminder. His look at phases 0–5b (the card at the foot of `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`) is
  also still to do.
- **Open questions for him:** none open. The FULL check's look card will carry D363 / D175's `kept` reading only once (c) is built.
- **Parallel (D302):** rulings D460–D469 (D460–D467 used — a next chat on this branch takes D468–D469, then a new range);
  observations #392–#393 used this chat (a next chat takes #394 on). No other open branch known.
- **Traps met:** a heredoc eats `\` — write Python edit scripts to a FILE; `console.log` in a unit test is swallowed — write
  debug to a file; the gatelock `run` gate list has no perf; `src/state/store.ts` is LF now (the old CRLF note is stale).
- **Pick up here:** the FULL bug check of phase 6 (a), (b), (d) — `raptor-port/docs/bug-check-order.md`, the plan's §5; then
  his look; then (c) v3 per D467.
<!-- /now -->

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL check done (the walk and both code reads, every finding fixed); phase 6 (a), (b), (d) built 30 Sep 26 — next their FULL check in a new chat, his look, then phase 6 (c) v3 in a fresh chat on its own branch (D467), then phase 7 (D453). The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 30 Sep 26, `claude/db-readiness-table-shaping-4094f6` (group A with phase 6 (a), (b), (d)), under the
PC lock: unit **7357 / 7358** (463 files — the one a test premise phase 6 (b) moved, fixed and re-run alone 26/26) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK · docsize OK · perf not run (last 4 / 4, before phase 6). Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
