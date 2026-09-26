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
### `claude/accounts-new-person` — `[ACCOUNTS-NEW-PERSON]` FULL check done, PR #443 waiting for his look; then his posting-out rulings (D229, D280–D299) and their APPROVED mock-up — written 27 Sep 26, verify before use
- **Where it started:** fix the two code reads' findings (Fable 1, Astra 1, 2, 4 + the record items), break tests, re-walk,
  the gates under the lock, the sheet, the PR. Then, in conversation, he ruled how a posting out and accounts should work.
- **Shipped:** PR #443 — open when written; its checks green on `5fb2cab5` (11 pass, 2 skipped; the handoff push re-runs
  them on GitHub's machines). Three read rounds by Fable + Astra, every finding dispositioned (sheet §6); walk3 **58/58**;
  break tests **32/32 red**; gates on the final code unit **6259/6259** · tfin **728/0** · e2e **476** · smoke **443/0** ·
  rulecheck · docsize. Evidence `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`.
- **Then — rulings and a mock-up only, no code:** D229, D280–D299 (`.claude/rules/decisions/how-we-work.md`): a posting
  out's four outcomes (chips "Overseas Sqn · Delete · SANS · Transfer to Sqn"); accounts Suspend / Enable / Delete
  account; a deleted man kept underneath as a hidden mark — the past keeps its record of him, today and the future lose
  him (the list: mock-up §5, D299); SANS on the date; back from overseas as he was, with a prompt; an archived man's
  callsign reusable, renamed right on the archived list; the admin's member view back (D292); no Sign-up button (D293);
  squadrons plan each other's people (D282), callsigns unique per community, a guest's orange corner (D288, D289, D296).
  **Mock-up APPROVED (D299):** `raptor-port/docs/mock/post-out.html` (Artifact
  https://claude.ai/artifact/BjZgFjGxRxohuoV1vgEFjp), made by `raptor-port/scripts/handpass/am/mk-post-out.mjs`.
  Build: `[POST-OUT-OUTCOMES]` (next, D291); transfers and guests: `[XFER]` (with the database).
- **Done 27 Sep 26 (next chat):** the mock-up's word trim (D300) — each thing said once on the page and in every drawn
  piece (the approval once, in the header; the table rows use his chip names; D299's stays/goes list kept whole);
  republished to the same Artifact link as **Version 6**, with the D300 sheet pictures that Version 5 had missed.
- **Unfinished:** PR #443 awaits his look and "merge live" (`main` still `e27e15fe`, already in the branch).
- **Branch:** `claude/accounts-new-person`, PR #443. If it has MERGED, reset before new work:
  `git fetch origin main && git checkout -B <new-branch> origin/main`.
- **Gates:** as above; `probes:adapted` · `perf` NOT RUN (the dense surfaces they measure are untouched).
- **Parallel chats (D228):** every heavy run takes `node raptor-port/scripts/gatelock.mjs`. This chat used preview 4174
  (`raptor-walk-2`) and `E2E_PORT=4191`; 4173 is another chat's.
- **Traps met:** seeded callsigns (Nomad, Bolt…) are demo people — never new names in a test; a walk step's picture is
  taken after the step (skill-observation #280); a break test left green may be aimed at the wrong tests (#282) and runs
  in a scratch worktree (#281, `np-breaks.mjs`'s header); Bash heredocs mangle backslashes — use the Edit tool.
- **Open questions for him:** none.
- **Pick up here:** after his "merge live" of PR #443, archive `[ACCOUNTS-NEW-PERSON]`
  (`node raptor-port/scripts/backlog-archive.mjs ACCOUNTS-NEW-PERSON --homes raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`),
  then plan `[POST-OUT-OUTCOMES]` from the approved mock-up and D229, D280–D299 (Opus 5.5 high; Fable + Astra red-team;
  FULL check).
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
