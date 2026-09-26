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
### `claude/accounts-new-person` — `[ACCOUNTS-NEW-PERSON]` (D214, D216, D217, D219, D220, D222): IN PROGRESS — mock-up APPROVED (D224), planning; written 26 Sep 26 — verify before use
- **Where things stand:** `[ACCOUNTS]` MERGED 26 Sep 26 (PR #442) — accounts, request access / waiting / switched off, the
  guest view (what a member sees on View-only Sched, medical included — D213, D215; one tap from the waiting screen — D221),
  Admin → Users, the one permissions module; only an admin renames a callsign on Quals (D218). Evidence
  `raptor-port/docs/handpass/2026-09-26-accounts.md` (§10: his look). This branch starts from that merge and carries D223 (keep
  the password box until the database step) and the archive of `[ACCOUNTS]` / `[QUALS-MEMBER-SCOPE]`.
- **The job:** one door for a new person on Admin → Users (callsign/name, initials, pilot / WSO / personnel, CAT; a blank
  sign-in for someone who won't use the app); the sign-up asks the same (its field reads "Displayed callsign/name"); approving
  fills from it; a new request lights the admins' bell; Quals' "+ Add person" becomes a button to Admin → Users. The mock-up:
  `raptor-port/docs/mock/new-person-account.html` (pictures by `scripts/handpass/am/mk-new-person.mjs`). **His approval first.**
- **Next:** his "mock-up approved" (or changes) → plan (Opus 5.5) → Fable and Astra red-team → build → walk → FULL check → his look
  → "merge live"; then `[DRAFT-PENDING]`.
- **Parallel chats (D228, 26 Sep 26 — "why not both? and deconflict the full checks"):** he may run two more worktree chats
  beside this one — the absence-record re-test with `[S4-HUNT-REST]` (ports 4175 / 4192, rulings D260–D269) and a
  small-fixes batch (`[PUCK-FLAG-GLOW]`, `[LW-RESET-ORDER]`, `[CROWD-SWAP-SAYS-BUSY]`, `[VIEW-ARROW-OVER-LIST]`,
  `[BG-GUARD-FALSE]`; ports 4176 / 4193, rulings D270–D279). Every heavy run takes the PC-wide lock first
  (`raptor-port/scripts/gatelock.mjs`; `.claude/rules/shipping.md` §The checks). This chat: preview 4174, browser tests 4191.
- **Noticed, not this chat's:** the `claude/tracker-palette` block below says its ruling D230 was never filed — asked him
  26 Sep 26, no answer yet.
<!-- /now -->

<!-- now:claude/tracker-palette -->
### `claude/tracker-palette` — `[TRK-PALETTE-ASK]` (D157): the Tracker in Raptor's colours, fully — BUILT, WALK-checked; written 26 Sep 26 — verify before use
- **Parallel with `[ACCOUNTS]`** (`claude/accounts`, rulings D210–D229) on his instruction of 26 Sep 26: this chat serves on
  port 4180, numbers its rulings D230–D239, never runs the full checks while the accounts chat runs its own, and whichever
  merges second takes `main` in first (D78). Nothing to `main` without his "merge live".
- **What it is:** `tracker.css`'s colour tokens and `app/core.js` `PAL` / `TYPE_COLOR` / `GRADE_FILL` copy Raptor's
  `scheduler.css :root` (sim yellow → amber); `src/tracker/trk-palette.test.ts` pins every copy. Built = the picture he
  chose on 24 Sep 26 (its exact colours were recovered from that chat's comparison script).
- **The check (WALK tier):** evidence `raptor-port/docs/handpass/2026-09-26-trk-palette.md` — roll-call (18 places), walk
  65/65 at desktop and phone with 35 pictures, breaks 21/21; the walk found and fixed three (failure chips' red outline
  never drawn; the details bubble's record had no divider; "Sim (yellow)"); Fable and Astra read it blind — 10 small
  findings, all fixed, pinned and re-walked (sheet §7 F7–F14, §9); filed `[TRK-FLEXBAR-INK]` (his question). Gates on the
  final code (sheet §10): unit 6029/6030 (the one: `[LW-FIGSEL-SLOW]`, load-only, 12/12 alone) · build clean · tfin 728/0 ·
  e2e 471 passed, 48 skipped · smoke 443/0 · rulecheck OK · docsize OK.
- **RULING NOT YET FILED — the rulings file refused the write (auto mode):** D230 for `.claude/rules/decisions/tracker.md`,
  top of its table — *"Build [TRK-PALETTE-ASK] … on a new branch … use port 4180, number any rulings of yours D230–D239,
  never run the full checks while the other chat is running them … whichever of us merges second takes main in first …
  Nothing goes to main without my 'merge live'."* → `[TRK-PALETTE-ASK]` built now, on its own branch, in parallel with
  `[ACCOUNTS]`, under those conditions. File it (then `node raptor-port/scripts/backlog-archive.mjs --rulings`) once he
  approves the edit, or leave it if he says so.
- **Next:** his look (the sheet §11), his answer to `[TRK-FLEXBAR-INK]`, then "merge live" — one at a time with the
  accounts chat.
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

The latest counts watched — 26 Sep 26 morning, `claude/leave-late-published` (`09276503`, the final code of
`[LEAVE-LATE-PUBLISHED]` with D187 and its reads' fixes), one run on a quiet PC
(`raptor-port/docs/handpass/2026-09-26-late-pub.md` §6): unit **5988 / 5988** (368 files) · build clean · tfin **728 / 0** ·
e2e **471 passed**, 48 skipped · smoke **442 / 0** · rulecheck OK · docsize OK. Two tests added after it (no source
change): their file alone 45 / 45. Restate a count only
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
