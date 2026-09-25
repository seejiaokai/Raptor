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

<!-- now:claude/amendment-batch -->
### `claude/amendment-batch` — the amendment batch (PR #435) and his inputs from its look; written 25 Sep 26 — verify before use
- **Where it started:** D112's overnight build of the 14-item amendment batch (FULL tier, all checked — evidence
  `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, incl. §5a the two blind reads and the later walk of Fable's
  three un-walked situations, 12/12 desktop and phone). Then his look began and he gave a run of inputs, each recorded:
  D113–D119 and D165–D173. The chat was compacted once; its early context is in the evidence sheet and commit messages.
- **Shipped (pushed to this branch, PR #435 OPEN, not merged):** the batch; **D114** (a request taken off / put on a
  published day counts ONE — `publish.ts dayPendingItemsIn` pairs the filing with its ground row; the AL stores `ukinds`;
  red first, the neighbouring suites green, **NOT yet fully checked**); the rulings D113–D119, D165–D173 (D115 replaced
  by D173 and archived); seven mock-ups under `raptor-port/docs/mock/` (the design of record for the next work is
  `changes-window.html` option A, with `changes-doors.html` and `tags-ticks.html`); `[MOVE-REPLACE-ONE]` closed (D113).
- **Unfinished — HIS ORDER, D173:**
  1. **D114's FULL check — DONE 25 Sep 26 (evening), waiting for his look and "merge live" of #435.** Evidence
     `raptor-port/docs/handpass/2026-09-25-amendment-batch.md` §9 (the reads, the walk desktop + phone, break tests,
     gates, his look card §9.11). Two gaps fixed ("Discard N edits" read 2; a deleted request's line named nobody);
     three older findings filed — `[REQ-TWO-ROWS]` (high), `[REQ-DECLINED-PENDING]`, `[REQ-ORPHAN-ROW]` — the first two
     are questions on his look card. `[REQUEST-OFF-ONE]` archived.
  1b. **HIS ANSWERS (D174, D175): `[REQ-TWO-ROWS]` + `[REQ-DECLINED-PENDING]` on their own small branch once #435 has
     merged, BEFORE accounts** — the load leaves out a row whose request stands on another day and says so; a request
     filed since publishing and then taken off reads 0. Its own check, his look, "merge live".
  2. **`[ACCOUNTS]` (D165, D166) on a NEW branch from `main`** once #435 has merged.
  3. **`[DRAFT-PENDING]` — the one changes window (D118, D167–D172)** on top of accounts; it absorbs D116's list, D117
     and D119 — do NOT build those separately.
  4. **One FULL check of 2 and 3** (permissions → FULL tier), his look, "merge live".
  - Also: `OUTSTANDING.md` is 17 lines over its size tripwire — a documents-only tidy (D29, D141), its own commit.
- **Branch:** `claude/amendment-batch`; PR #435 (open when written — check before acting). Vercel preview:
  https://raptor-git-claude-amendment-batch-kai-e2f5.vercel.app . GitHub's machines run the checks while the repo is
  public (D106, ~11 min); never push while they run (D151).
- **Gates:** the full set green on the D114 check's final code, 25 Sep 26 18:20 (`## Gate baseline`).
- **Open questions for him:** none — every question put to him this chat is answered and recorded.
- **Pick up here:** his look and "merge live" of #435 (step 1 is done — his look card is the evidence sheet §9.11;
  its two questions answered, D174 and D175); then D175's step (1b above), then step 2, `[ACCOUNTS]` (D165, D166), on a
  NEW branch — stacked on this one if #435 has not merged yet, taking `main` in once it has. Read the rulings D113–D119
  and D165–D173 in `.claude/rules/decisions/scheduler.md` and `how-we-work.md` before building anything; models per his
  rule — Opus 5.5 (high) plans and builds, Fable 5.1 and Astra review the plan and the code (permissions → both).
<!-- /now -->

## Next, in order

1. **The amendment batch and his look's inputs — HIS ORDER, D173** (the `## Now` block above): D114's full check and
   "merge live" of PR #435 → `[ACCOUNTS]` on a new branch → the one changes window (`[DRAFT-PENDING]`) → one full check
   → "merge live". **`[HUMAN-RETEST]`** — the amendment system MERGED 25 Sep 26 (PR #434; evidence
   `raptor-port/docs/handpass/2026-09-24-amendment.md`). Next, in his order (D147): the absence record
   together with `[S4-HUNT-REST]`, then change-recording (with D148 and `[UNDO-ROSTER-SETTINGS]`), then the Leave War
   links last. The two evidence sheets (Tracker 23 Sep, amendment 24 Sep) are the worked examples.
2. Then his after-the-hunt order: `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` → the OIL award fix and the
   small OIL follow-ups as one batch (D147) → `[DB-STEP]`. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-SMOKE-ADD-RACE]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 25 Sep 26 18:20, `claude/amendment-batch` after D114's check (not yet merged), one run on a
quiet PC (`raptor-port/docs/handpass/2026-09-25-amendment-batch.md` §9.10): unit **5910 / 5910** (363 files) · build clean ·
tfin **728 / 0** · e2e **471 passed**, 48 skipped · smoke **442 / 0** · rulecheck OK · docsize OK. `main` (PR #434) stands at
5855 unit and 469 e2e until the batch merges. Restate a count only from a
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
