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

<!-- now:claude/amendment-retest -->
### `claude/amendment-retest` — the amendment system re-test, FULL tier, done and waiting for his look, written 24 Sep 26 (evening) — verify before use
- **Where it started:** his message of 24 Sep 26: start `[HUMAN-RETEST]` — the amendment system — FULL tier, build the
  behaviour register first and ask nothing it settles; he was away ~6 h: work without waiting, file questions, never
  merge, leave the branch pushed. "Latest rule is the most correct" → D90 (recorded, `how-we-work.md`).
- **Shipped (on the branch, NOT merged):** the register `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`
  (AM1–AM52, clashes by D90, the rule-coverage gate); the evidence sheet `raptor-port/docs/handpass/2026-09-24-amendment.md`
  (§3 every finding and its disposition, §4 roll-call, §10 gates, §11 the two code reads, §12 the re-walk, §13 his look
  card); fixes, each red first, in `7c69bd58`, `767799ae` and the code reads' commit after them: the board's "Not yet
  signed", one count everywhere, Discard marks, the phantom mark and the false "changed at AL1", the confirms on every
  navigation (page, board day, close), Undo handing back spent sign-offs and a stuck Redo, the issued face's count and
  its ⓘ, the input put-back, the Leave War holiday advisory, the Unavailable way back, plain check headings, the board
  preview strip, the plan editor's page, History's footnote and wrap, the sign-off line naming a signer who no longer
  counts, the sign-offs bound to the ground programme's shown order. The PR: opened with this push — `gh pr view
  claude/amendment-retest`; its checks run on his PC.
- **Unfinished:** none of the re-test's own work. Filed, not fixed: `[AMEND-EMPTY-SEAT-MARK]` (no mark where a man is
  taken off a desk / programme row / sim seat — needs a picture first), `[AMEND-MARK-RING-CLASH]`,
  `[AVAILWIN-PREVIEW-BAR]`, `[AMEND-SMALL-SEEN]`; for the change-recording re-test: D148 (not built),
  `[UNDO-ROSTER-SETTINGS]`, the Undo wording in `[AMEND-SMALL-SEEN]` item 2.
- **Branch:** `claude/amendment-retest`, cut from `main` at `bff76c1b` (`main` had not moved when written); it also
  carries the previous chat's recorded answers D147–D164 (docs). If it has MERGED: `git fetch origin main && git
  checkout -B <branch> origin/main` before new work.
- **Gates:** see `## Gate baseline` (this branch's final code, one watched run); `npm run probes:adapted` **6 / 6** (129
  checks — the probes now fall back to Playwright's own browser, and audit-async's step 3, stale since 13 Sep 26, looks
  for the input's id) · `npm run perf` **4 / 0** (week 5134 / 5450 nodes, board 1024 / 1150).
- **Open questions for him (filed, none blocking the merge):** `[AMEND-D45-FILING]`, `[AMEND-PHONE-APPROVER]`,
  `[AMEND-TEMPLATE-PUBLISHED]`, `[AMEND-NYS-WORDING]`, `[AMEND-REISSUE-DOOR]`, `[AMEND-LOAD-FILING]` — each with the
  agent's recommendation in its item.
- **Pick up here:** his five-minute look (evidence sheet §13) and his "merge live"; then his order (D147): the absence
  record together with `[S4-HUNT-REST]` — `[HUMAN-RETEST]` in `OUTSTANDING.md`.
<!-- /now -->

## Next, in order

1. **`[HUMAN-RETEST]`** — the amendment system is DONE on `claude/amendment-retest`, waiting for his look and "merge
   live" (evidence `raptor-port/docs/handpass/2026-09-24-amendment.md`). Next, in his order (D147): the absence record
   together with `[S4-HUNT-REST]`, then change-recording (with D148 and `[UNDO-ROSTER-SETTINGS]`), then the Leave War
   links last. The two evidence sheets (Tracker 23 Sep, amendment 24 Sep) are the worked examples.
2. Then his after-the-hunt order: `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` → the OIL award fix and the
   small OIL follow-ups as one batch (D147) → `[DB-STEP]`. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-SMOKE-ADD-RACE]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 24 Sep 26, `claude/amendment-retest`'s final code (waiting for "merge live"), one run on a
quiet PC (`raptor-port/docs/handpass/2026-09-24-amendment.md` §10): unit **5855 / 5855** (360 files) · build clean ·
tfin **728 / 0** · e2e **469 passed**, 48 skipped · smoke **442 / 0** · rulecheck OK · docsize OK (`OUTSTANDING.md` 2 lines
over its tripwire, deferred by the gate to a documents-only pass, D29). Restate a count only from a
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
