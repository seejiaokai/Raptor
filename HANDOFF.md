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

<!-- now:claude/leave-late-published -->
### `claude/leave-late-published` — the overnight session (D181): a member change after publishing waits for the admin (D177–D180); written 25 Sep 26 23:50 — verify before use
- **Where it started:** PR #437 (D174–D176) MERGED 25 Sep 26 (its block removed here; its one open item,
  `[LEAVE-LATE-PUBLISHED]`, is this block). Asked where that item goes, he answered "What can we work overnight", then
  "Yes" to the plan: **D180** — it goes NEXT, before `[ACCOUNTS]` (D173 amended again); **D181** — tonight's one-off
  permission to work without him (no merge, no re-deciding a ruled item; product questions filed with a recommendation;
  may compact after saving state).
- **The night's order (D181):** (1) `[LEAVE-LATE-PUBLISHED]` built and FULLY checked on this branch — scope
  `raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md` (A0–A7 freeze; B1 medical, B2
  qualifications and rule settings and B5 a neighbour day's input freeze too by D179; only B3, B4, B6 stay live);
  pushed, PR opened, look card written, D179 put to him again; (2) if time is left, the `[ACCOUNTS]` PLAN only, red-teamed
  by Fable and Astra, no code; (3) last, the documents-only tidy of `OUTSTANDING.md` (54 over its tripwire) on its own branch.
- **Found on the way:** `HANDOFF.md` had lost its `## Next, in order` section, this block's end marker and the
  `## Gate baseline` heading — one span replace in `119dff45` (D176's check) ate them, and the document gate did not
  notice. Restored from `d13162dc`; the gap in the gate is filed as `[HANDOFF-SHAPE-GUARD]`.
- **Progress:** rulings D180, D181 recorded. Nothing built yet.
- **Branch:** `claude/leave-late-published` from `main` @ 5f4496a3. Rulings range for this chat: D180–D189.
- **Gates:** `main` = PR #437's final code, whose counts are below.
- **Pick up here:** step (1) — the plan, and Fable's and Astra's scenario lists, first.
<!-- /now -->

## Next, in order

1. **HIS ORDER — D173, amended by D175 and D180** (the `## Now` block above): PR #435 and PR #437 MERGED 25 Sep 26 →
   `[LEAVE-LATE-PUBLISHED]` on its own branch, full check, his look, "merge live" (D180; built overnight, D181) →
   `[ACCOUNTS]` on a new branch → the one changes window (`[DRAFT-PENDING]`) → one full check → "merge live". **`[HUMAN-RETEST]`** — the amendment system MERGED 25 Sep 26 (PR #434; evidence
   `raptor-port/docs/handpass/2026-09-24-amendment.md`). Next, in his order (D147): the absence record
   together with `[S4-HUNT-REST]`, then change-recording (with D148 and `[UNDO-ROSTER-SETTINGS]`), then the Leave War
   links last. The two evidence sheets (Tracker 23 Sep, amendment 24 Sep) are the worked examples.
2. Then his after-the-hunt order: `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` → the OIL award fix and the
   small OIL follow-ups as one batch (D147) → `[DB-STEP]`. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 25 Sep 26 22:14–22:26, `claude/request-one-row` (PR #437: D174, D175, D176, with `main` after
PR #436 merged in; MERGED 25 Sep 26 as it stood), one run on a quiet PC (`raptor-port/docs/handpass/2026-09-25-req-one-row.md` §12):
unit **5939 / 5939** (365 files) · build clean · tfin **728 / 0** · e2e **471 passed**, 48 skipped · smoke **442 / 0** ·
rulecheck OK · docsize OK. Restate a count only
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
