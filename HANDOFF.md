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

<!-- now:claude/request-one-row -->
### `claude/request-one-row` — D175's step: a request's row and its filing on a published day (D174, D175, D176); written 25 Sep 26 — verify before use
- **Where it started:** PR #435 (the amendment batch) MERGED 25 Sep 26. His order D175 put a step between D173's 1 and 2:
  `[REQ-TWO-ROWS]` (D175) and `[REQ-DECLINED-PENDING]` (D174) on their own branch, cut from `main`.
- **Built, FULL check done (PR #437):** D174 — a request filed since the day was published and then taken off reads 0 and
  the four hold (`publish.ts filingSame`); D175 — a load or a plan switch leaves out a row whose request stands on another
  day and every door names it (`publish.ts rowsLeftOut`, `drafts.ts rowsLeftSaid`); the pending list names such a row;
  **D176** (his answer on the look card, "make it 0") — a request taken off before publishing, then deleted or re-dated off
  the day, reads 0 too (`filingSame`'s `present`). `main` (PR #436, the Tracker chat) merged in first (D78). Evidence
  `raptor-port/docs/handpass/2026-09-25-req-one-row.md` (§1–§12: the reads, the walks 49/49 desktop + phone, break tests,
  gates, his look card §10). All three items archived. Rulings this chat: **D176, D177, D178** (`scheduler.md`).
- **Unfinished — in order:**
  1. **His "merge live" of PR #437** — every check is done and the gates are green on the merged code.
  2. **`[LEAVE-LATE-PUBLISHED]` (D177, WIDENED by D178) on its OWN branch** — EVERY member input change after
     publishing (filed, edited, deleted, moved) reads pending, the four fall, and the published face keeps what it was
     issued with until the next AL (or an Unpublish and publish again). What stays live: the agent's recommendation in
     D178, awaiting his word. Scope, from the sweep he asked for:
     `raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md` (A0–A7 to freeze; B5 to put to him
     under D45; medical stays live). FULL tier. **Its place in his order is still to be asked** — the agent recommends
     right after this merges, BEFORE `[ACCOUNTS]` (it reworks the one pending comparison the changes window reads).
  3. **`[ACCOUNTS]` (D165, D166) on a NEW branch from `main`** (D173 step 2).
  4. **`[DRAFT-PENDING]` — the one changes window (D118, D167–D172)** on top of accounts; it absorbs D116's list, D117
     and D119 — do NOT build those separately (D173 step 3).
  5. **One FULL check of 3 and 4** (permissions → FULL tier), his look, "merge live" (D173 step 4).
  - Also: `OUTSTANDING.md` is ~48 lines over its size tripwire — a documents-only tidy (D29, D141), its own commit.
- **Branch:** `claude/request-one-row`, PR #437. Vercel preview:
  https://raptor-git-claude-request-one-row-kai-e2f5.vercel.app . GitHub's machines run the checks while the repo is
  public (D106, ~11 min); never push while they run (D151).
- **Gates:** the full set green on the final merged code (`## Gate baseline

The latest counts watched — 25 Sep 26 22:14–22:26, `claude/request-one-row` (PR #437: D174, D175, D176, with `main` after
PR #436 merged in; not yet merged), one run on a quiet PC (`raptor-port/docs/handpass/2026-09-25-req-one-row.md` §12):
unit **5939 / 5939** (365 files) · build clean · tfin **728 / 0** · e2e **471 passed**, 48 skipped · smoke **442 / 0** ·
rulecheck OK · docsize OK. `main` (after PR #436) stands at 5916 unit until this branch merges. Restate a count only
from a run you watched, and REPLACE the previous counts — never stack a history. How to run them: `raptor-port/CLAUDE.md`
§Build & verify; how they mislead, and the checks on his PC: `raptor-port/docs/gates-and-deploy.md`.

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
