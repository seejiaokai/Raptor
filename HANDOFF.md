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
### `claude/amendment-retest` — his answers recorded; the amendment re-test starts here, written 24 Sep 26 (late night) — verify before use
- **Where it started:** the spring-clean chat, after PR #433 merged (the spring clean and the 24 Sep skills review are
  live — `git log origin/main`). He asked for the whole backlog and a recommended order, then answered every question.
- **Shipped:** his answers, recorded as rulings on this branch (NOT merged — they reach `main` with this branch):
  D147 (the order after the amendment re-test; the OIL award fix has his go), D148 (Undo reverses only your own
  changes), D149 (Quals: a member edits his own row, every column), D157 (the Tracker takes Raptor's colours fully),
  D158 (the tap-after-drag quirk closed), D159 (desktop Leave War zoom: leave it), D160 (build a "Reset order" line),
  D161 (Admin "Display": revisit later), D162 (build the background-command guard), D163 (the two demo-data oddities
  left), D164 (a flagged puck does not glow). Four items archived; `[PUCK-FLAG-GLOW]` filed.
- **Unfinished:** the amendment re-test itself has NOT started. Decided and queued as small builds, none started:
  `[PUCK-FLAG-GLOW]`, `[TRK-PALETTE-ASK]`, `[LW-RESET-ORDER]`, `[QUALS-MEMBER-SCOPE]` (FULL tier: roles), `[BG-CWD-GUARD]`.
- **Branch:** `claude/amendment-retest`, cut from `main` at `bff76c1b`; pushed; its PR none when written.
- **Gates:** not run — docs only so far; `npm run docsize` OK.
- **Open questions for him:** none.
- **READ FIRST — his settled amendment rules; ask him NOTHING these already settle** (he asked, 24 Sep 26: "I don't
  want to repeat myself"; D53 and `.claude/rules/record-decisions.md` §Read it before you ask him anything). They are
  in four kinds of place, and the rulings file is only one of them:
  1. `.claude/rules/decisions/scheduler.md` — the amendment rulings AND its §Settled before this list. Open it with the
     Read tool first: it loads by itself only when a scheduler or amendment file is read. Also `oil.md` (a published
     day and a rule change D48/D49; a day's OIL = its latest published version D142) and, already loaded,
     `how-we-work.md` (D147 the order; D148 Undo reverses only your own changes).
  2. This PC's memory notes (the rulings of 11–18 Sep 26 live ONLY there and in the design records):
     `amendment-per-day-isolated` (each day its own track, never the week — "do not reopen"),
     `published-day-input-is-pending-amendment`, `amendment-plan-activation-is-plain-edit` (no keep/revert screen),
     `plans-selector-redesign-locked` (built and merged — do not re-open), `undo-of-publish-semantics` (the NEWEST,
     18 Sep, wins: undo of a publish = unpublish), `future-undo-semantics-multiuser`, `oil-truth-latest-published-version`.
  3. The design records: `raptor-port/docs/superpowers/specs/2026-09-11-amendment-model-decisions.md` (his decisions
     and the mock-ups), the frozen spec `…/2026-09-12-amendment-core-build-brief.md`, the plan
     `…/2026-09-12-amendment-core-build-plan.md`; `raptor-port/docs/engine-rules.md` (publishing/AL),
     `raptor-port/docs/ui-contracts.md` §Amendment marks.
  4. `OUTSTANDING.md` `[AMEND]` (what is left), `[HUMAN-RETEST]` (the older-amendment unpublish and BUG 1 it must
     walk), `[EOD]`, `[CRP-FLAG]`; and `DECISIONS-ARCHIVE.md` (replaced rulings) — searched, so no replaced rule is
     treated as live. Where two disagree, the NEWER wins (the newest-instruction rule); say which one you set aside.
  **First job of the re-test: gather all of it into ONE amendment behaviour register** —
  `raptor-port/docs/superpowers/specs/<date>-amendment-behaviour-register.md`, one line per rule with its date and
  source, like the OIL register — the bug-check order's rules sweep. It becomes the list the walk tests against, and
  the only questions left for him are real gaps or real clashes between two of his rules.
- **Pick up here:** `[HUMAN-RETEST]` — the amendment system, FULL tier (`raptor-port/docs/bug-check-order.md`): port
  4173, rulings from D90 (D86). He is away ~6 hours from 24 Sep 26 night: work without waiting — file any question
  for him in `OUTSTANDING.md` and this block rather than stopping; never merge; leave the branch pushed, ready for
  his look and his "merge live". Reviews: Fable 5.1 and Astra, both at `--effort high`.
<!-- /now -->

## Next, in order

1. **`[HUMAN-RETEST]` — THE AMENDMENT SYSTEM** (D85/D86): port 4173, rulings from D90, FULL tier; the Tracker's
   evidence sheet `raptor-port/docs/handpass/2026-09-23-tracker.md` is the worked example. Then, in his order (D147):
   the absence record together with `[S4-HUNT-REST]`, then change-recording, then the Leave War links last.
2. Then his after-the-hunt order: `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` → the OIL award fix and the
   small OIL follow-ups as one batch (D147) → `[DB-STEP]`. The whole list: `OUTSTANDING.md`'s priority list.
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
