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
### `claude/spring-clean` — the spring clean (`[DOC-TRIM]`), written 24 Sep 26 — verify before use
- **The job** (his ask, D138–D141): every chat reads only what the job needs and finds the rest; new information
  follows the structure by itself; nothing is reworded on the way (a move is byte for byte; a rewrite is checked
  for meaning by Fable and Astra). Plan, both red teams and what changed after them:
  `raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-plan.md` (§7 wins over §1–§6).
- **Done and pushed (not merged):** step 1 (four merged worktrees removed, ~1 GB freed; three empty folders stay
  held by old chats), steps 2–5 and the "teach it" layer — `raptor-port/CLAUDE.md` 1,543 → 704 lines, `HANDOFF.md`
  984 → ~90, `OUTSTANDING.md` 1,226 → ~1,030 (live items only), a fresh chat now reads ~58k tokens before work, not
  ~118k; the new `.claude/rules/shipping.md` and `doc-structure.md`; the exact mover and the misfiling checks
  (self-test 97/97); Fable's meaning check done and all nine findings fixed. Rulings D139–D144.
- **Left, in order:** (1) **Astra's meaning check** — it was still running when this chat filled; its report may be at
  the scratchpad path `…/8dc6f608-…/scratchpad/astra-meaning.md` on his PC; if not, re-run it with
  `raptor-port/docs/superpowers/briefs/2026-09-24-spring-clean-meaning-brief.md` (Codex, read-only, gpt-5.6-sol, high),
  fix what it finds, save it beside Fable's. (2) **His approval of the session-handoff skill change** (D70 — both
  reviews in hand first). (3) Close `[DOC-TRIM]` (rewrite it without targets — D141; its leftover is the `.gitattributes`
  LF pin, which rides the next code change) and mark D139 SPENT. (4) Offer "merge live"; "done" = live on Vercel (D143).
<!-- /now -->

## Next, in order

1. **Finish the spring clean and offer it for "merge live"** — after both meaning checks (D138) and his approval of
   the session-handoff skill change (D70).
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
