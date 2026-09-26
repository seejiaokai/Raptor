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
### `claude/accounts-new-person` — `[ACCOUNTS-NEW-PERSON]` (D214, D216, D217, D219, D220, D222, D224–D227): BUILT, walked, gates green; the two code reads say FIX FIRST — written 26 Sep 26, verify before use
- **Where it started:** his "mock-up approved" (D224) → plan (Opus 5.5) → Fable + Astra red-team (both APPROVE WITH CHANGES;
  his answers D225 initials never required, D226 14 letters said not cut, D227 each admin's own bell) → build → walk → FULL check.
  Plan `raptor-port/docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md` (§Round 1 = every red-team finding).
- **Shipped (on the branch, NO PR yet):** the one add `state/roster-add.ts`; person + account in ONE command
  (`commitPeopleSettingsIntent`); `CommandOp.more` + four new command types, §11 `AccessRequest` Admin R U D; the sign-up's four
  fields; approve / add with On the roster | New person; the bell per admin (`seenBy`, `shown`); `ADMINOPEN` (one consumer,
  AdminPage); Quals' "+ Add person" a button there; "Callsign/Name" everywhere (the CSV too); docs per plan §8. Evidence
  `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md` (§3 roll-call, §4 doors, §5 walk: walk1 42/47 → one real miss
  fixed red-first, walk2 47/47, 0 browser errors; §6–§10 still to fill). Walk script `raptor-port/scripts/handpass/np-walk.mjs`.
- **Unfinished — the two code reads, both FIX FIRST** (`raptor-port/docs/handpass/2026-09-26-accounts-new-person-fable-read.md`,
  `…-astra-read.md`, blind to each other): **Fable 1** — approving: a typed callsign whose person ALREADY HAS AN ACCOUNT
  (Ranger, Saber…) gets "Pick them" but the picker cannot offer him (fix steps in the file; the NP5 test and walk S8 pinned the
  wrong thing); **Astra 1** — the Add form does not fully clear after success (stale hidden state); **Astra 2** — personnel
  keep an internal CAT list, so a CAT can survive invisibly through Personnel; **Astra 4** — `acc-walk.mjs` / `acc-walk2.mjs`
  abort at approval (they assume the old roster-only form; Approve now opens New person). Record fixes: Fable 2 (three
  roll-call items narrowed without a §8 line — walk them or say why), Fable 3 (the plan says the ui-contracts passages were
  MOVED; they were kept verbatim in place — correct the plan or move them), Fable 4 (`scripts/handpass/am/mk-new-person.mjs`
  still fills `#accFull`), Astra 3 (P1/P2 landed after walk2 — re-walk them; gates and break tests into the sheet).
- **Branch:** `claude/accounts-new-person`, pushed; no PR yet. Base `origin/main` (e27e15fe + D223's commits).
- **Gates** (build `09cc00e3`, one run, watched): unit **6248 / 6248** (381 files) · build clean · tfin **728 / 0** · e2e **476
  passed**, 48 skipped · smoke **443 / 0** · rulecheck OK · docsize OK. `probes:adapted` · `perf` — NOT RUN.
- **Parallel chats (D228):** he may run two worktree chats beside this one — the absence-record re-test with `[S4-HUNT-REST]`
  (ports 4175 / 4192, rulings D260–D269) and a small-fixes batch (`[PUCK-FLAG-GLOW]`, `[LW-RESET-ORDER]`,
  `[CROWD-SWAP-SAYS-BUSY]`, `[VIEW-ARROW-OVER-LIST]`, `[BG-GUARD-FALSE]`; ports 4176 / 4193, rulings D270–D279). Every heavy
  run takes the PC-wide lock first: `node raptor-port/scripts/gatelock.mjs take|release|run` (`.claude/rules/shipping.md` §The
  checks). This chat: preview 4174 (`raptor-walk-2` in `.claude/launch.json`), browser tests `E2E_PORT=4191`. Port 4173 is held
  by a leftover preview from an earlier chat — do not use it or kill it.
- **Traps met:** "Nomad" and "Bolt" are demo callsigns — never use them as new names in a test (a clean-up that deletes by
  callsign removes the seed person); a background command starts inside `raptor-port/` here, so use
  `cd /c/Users/User/projects/Raptor && cd raptor-port && …` (`[BG-GUARD-FALSE]`); Bash heredocs mangle backslashes — write
  edit scripts with the Write tool.
- **Open questions for him:** none (D230 filed as spent, his "that job was done").
- **Pick up here:** fix Fable 1 and Astra 1, 2, 4 (red first), the record items, then break tests (sheet §7), re-walk what the
  fixes touched into `walk3/`, the gates under the lock, fill the sheet §6–§10 (the look card: the plan's "On the look card"
  list), open the PR, send him the Vercel link — then his look and "merge live"; then `[DRAFT-PENDING]`.
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** now `[ACCOUNTS]` (with D200, D202 —
   answer his "how does a new user join" question first — answered, D204) with ITS OWN full check (D210) → the one changes
   window (`[DRAFT-PENDING]`) with its own full check →
   "merge live" (D173); beside it, he talks to the IT side (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s
   remaining three in his order (D147 — the absence record with `[S4-HUNT-REST]`, change-recording, the Leave War links
   last), then `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]`.
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 26 Sep 26 evening, `claude/accounts-new-person` (`09cc00e3`, the `[ACCOUNTS-NEW-PERSON]` build
before its reads' fixes), one run, the PC otherwise quiet (`raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`):
unit **6248 / 6248** (381 files) · build clean · tfin **728 / 0** · e2e **476 passed**, 48 skipped · smoke **443 / 0** ·
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
