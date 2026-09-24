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

<!-- now:claude/spring-clean -->
### `claude/spring-clean` — the spring clean (`[DOC-TRIM]`, closed) and the 24 Sep skills review, written 24 Sep 26 (late night) — verify before use
- **Where it started:** his ask (D138–D141, then D140's "weave it into my workflow"): every chat reads only what the
  job needs and finds the rest, new information follows the structure by itself, nothing reworded on the way. Plan,
  both red teams and what changed after them: `raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-plan.md` (§7 wins).
- **Shipped:** all on the branch, pushed, NOT merged; its PR is open, waiting for his "merge live".
  `raptor-port/CLAUDE.md` 1,543 → ~705 lines (area decisions and architecture moved whole to the area files),
  `HANDOFF.md` 984 → ~90 (the one handoff), `OUTSTANDING.md` live items only; `.claude/rules/shipping.md` and
  `doc-structure.md` (always loaded); the exact mover and the misfiling checks (self-test 97/97); both meaning checks
  (Fable, Astra) done and fixed; the session-handoff skill change approved (D145); `[DOC-TRIM]` closed and moved whole
  to the archive, so no line target is left in a live file; D139 spent and archived. A fresh chat reads ~58k tokens
  before work, not ~118k. **Then, on his word ("review the skills lessons then merge"), the 24 Sep 26 skills review,
  approved whole (D146, spent and archived):** all 44 open lessons dispositioned — installed into five skills, the
  bug-check order (which now also carries D16 and D17, whose rows had always named it as their home) and the gates
  doc; four into this PC's memory notes; the notebook archived down to #120/#122 (D73). Fable and Astra read the
  drafts once each (D70), 22 fixes applied; their reports are in git (the holding folder's history, D69).
- **Unfinished:** nothing on this branch. Filed, not blocking: `[RULINGS-LF-PIN]` and `[DOC-SUBHEADS]` (the item's two
  leftovers — the second one was missing from this block's earlier "only leftover"), `[BG-CWD-GUARD]` and
  `[RULING-HOMES-AUDIT]` (from the review), `[DOC-POINTERS-CODE]`, `[PERF-RESIDUALS]`.
- **Branch:** `claude/spring-clean`; its PR: `gh pr list --head claude/spring-clean`. If it has MERGED, the next chat
  removes this block and resets before new work: `git fetch origin main && git checkout -B <branch> origin/main` —
  otherwise it stacks commits onto already-merged history.
- **Gates:** not run — docs and the document-gate scripts only (bug-check tier NONE); `npm run docsize` OK and
  `node raptor-port/scripts/docsize-selftest.mjs` 97/97 on the final commit; the PR runs only the Docs guard.
- **Open questions for him:** none.
- **Pick up here:** he gave "merge live" for after the review, so this chat merges PR #433 once its Docs guard is green
  → `main`'s checks (only the Docs guard, docs-only) → Vercel reports the live app READY → one notification (D143).
  Check `gh pr view 433`: merged → remove this block and `## Next` item 1; still open → merge it on his word.
<!-- /now -->

## Next, in order

1. **The spring clean and the 24 Sep skills review — PR #433, merging on his word** (the `claude/spring-clean` block
   above); docs only.
2. **`[HUMAN-RETEST]` — THE AMENDMENT SYSTEM** (D85/D86): port 4173, rulings from D90, FULL tier; the Tracker's
   evidence sheet `raptor-port/docs/handpass/2026-09-23-tracker.md` is the worked example. The order of the other
   three (change-recording, the absence record, the Leave War links) is NOT ruled: propose it and ask.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-SMOKE-ADD-RACE]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched on `main`'s code — 24 Sep 26, the OIL credit-tags branch, one run on a quiet PC
(`raptor-port/docs/handpass/2026-09-24-oil-credit-tags.md` §8): unit **5819 / 5819** (358 files) · build clean ·
tfin **728 / 0** · e2e **469 passed**, 48 skipped · smoke **442 / 0** · rulecheck OK. Restate a count only from a
run you watched, and REPLACE the previous counts — never stack a history. How to run them: `raptor-port/CLAUDE.md` §Build & verify; how they mislead, and the checks on his
PC: `raptor-port/docs/gates-and-deploy.md`.

## Standing constraints

Every one of these is the same missing piece — the server / sync backend —
wearing a different hat.

- **No shared data.** localStorage only; two devices never see each other's
  edits. Needs a server or sync backend; touches the storage seam (`raptor-port/src/storage/`,
  `raptor-port/CLAUDE.md` §Where things live) and the mutation funnel. *(Corrected 24 Sep 26: it used to name
  `engine/hooks.ts:storeBackend`, which the storage seam replaced for everything but the `sqn142_*` settings.)*
- **Prototype auth.** Hard-coded accounts. *(Corrected 24 Sep 26: "the deployed site is public" stopped being
  true with D59 — the repo is private and the app sits behind his Vercel sign-in, which is Vercel's lock, not the
  app's.)*
  Manage-users edits the in-memory list only. A member is NOT view-only: they
  add, edit and delete their own Inputs and tick the qualifications they hold.
  Roles table `docs/engine-rules.md` §Auth / roles; enforcement (page and write
  path, never the nav) pinned by `src/state/session.test.ts`.
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
