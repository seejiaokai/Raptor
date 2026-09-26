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

<!-- now:claude/accounts-new-person -->
### `claude/accounts-new-person` — `[ACCOUNTS-NEW-PERSON]` (D214, D216, D217, D219, D220, D222, D224–D227): FULL check DONE — PR open, waiting for his look and "merge live" — written 26 Sep 26, verify before use
- **Where it stands:** built, walked, read three rounds by Fable and Astra, every finding fixed red first, re-walked
  (walk3 **58/58**, 0 browser errors), break tests **32/32 red**, the full checks green (§9 of the sheet), the PR open
  from this branch (`gh pr list --head claude/accounts-new-person`). **Next: his look (the sheet's §10 card), then his
  "merge live"** — then archive `[ACCOUNTS-NEW-PERSON]` (`backlog-archive.mjs`) and start **`[POST-OUT-OUTCOMES]`** (D291),
  then `[DRAFT-PENDING]`. After the check he ruled on posting out and accounts (D229, D280–D291 — how-we-work.md).
- **Evidence:** `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md` (§3 roll-call, §5 walks, §6 the three read
  rounds and every disposition, §7 breaks, §9 gates, §10 the look card). Reads: `…-{fable,astra}-read.md` (round 1),
  `…-{fable,astra}-fixcheck.md` (round 2), `…-{fable,astra}-fixcheck2.md` (round 3 — Fable CLEAN; Astra's one fixed).
  Walk `raptor-port/scripts/handpass/np-walk.mjs` → `docs/img/handpass/2026-09-26-accounts-new-person/walk3/`; breaks
  `scripts/handpass/np-breaks.mjs` (run it in a scratch worktree — its header says how).
- **What the reads changed (all on this branch):** the approve note never asks the admin to do what the screen can't —
  someone who already has an account (archived or not) is said so, with both ways out (him on a new sign-in: change that
  account's sign-in, another admin's job when it is your own; someone else: New person); the Add form clears whole after
  an add; personnel hold no CAT anywhere (`catsFor`); an account's editor keeps its archived person in its picker (on
  `main` since `[ACCOUNTS]`, fixed here); the two older `[ACCOUNTS]` walks run again (38/38, 42/42).
- **Not run, with the reason:** `probes:adapted` and `perf` — the dense surfaces they measure (board, week, palette) are
  untouched; a real iPhone (nothing here depends on touch timing).
- **Parallel chats (D228):** every heavy run takes the PC-wide lock (`node raptor-port/scripts/gatelock.mjs`). This chat:
  preview 4174 (`raptor-walk-2`), browser tests `E2E_PORT=4191`. Port 4173 is another chat's — leave it.
- **Traps met:** "Nomad" and "Bolt" (and every seeded callsign) are demo people — never use them as new names in a test;
  a walk step's picture is taken AFTER its step, so a step must leave on screen what it asserted (observation #280); a
  break that stays green may be aimed at tests that cannot see the layer (#282); Bash heredocs mangle backslashes —
  edit with the Edit tool.
- **Open questions for him:** none — the look card §10 lists the agent's calls for him to correct.
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** now `[ACCOUNTS]` (with D200, D202 —
   answer his "how does a new user join" question first — answered, D204) with ITS OWN full check (D210) → its follow-on
   `[ACCOUNTS-NEW-PERSON]` (PR #443, waiting for his look) → **`[POST-OUT-OUTCOMES]`** (D291 — a posting out's outcomes;
   accounts suspended and deleted) with its own full check → the one changes window (`[DRAFT-PENDING]`) with its own full check →
   "merge live" (D173); beside it, he talks to the IT side (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s
   remaining three in his order (D147 — the absence record with `[S4-HUNT-REST]`, change-recording, the Leave War links
   last), then `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]`.
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 26 Sep 26 evening, `claude/accounts-new-person` (`facb1bc1`, the `[ACCOUNTS-NEW-PERSON]` final
code), one run under the PC-wide lock (`raptor-port/docs/handpass/2026-09-26-accounts-new-person.md` §9):
unit **6259 / 6259** (381 files) · build clean · tfin **728 / 0** · e2e **476 passed**, 48 skipped · smoke **443 / 0** ·
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
