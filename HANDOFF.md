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

<!-- now:claude/post-out-outcomes -->
### `claude/post-out-outcomes` — `[POST-OUT-OUTCOMES]` BUILT and FULL-checked; waiting for his look and his "merge live" (merge LAST) — written 27 Sep 26 ~06:30, verify before use
- **Where it stands:** built on `claude/accounts-new-person` (PR #443) with PR #444's posting code merged in (`4f3c40cc`).
  Plan `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` (Round 2 wins). **Evidence sheet — read
  it first:** `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` (the roll-call, the walk's 14 finds, the two
  code reads' 9, every one fixed red-first; the break tests; the gates; **§10 his look card — 11 questions**). Walks A–D
  (`scripts/handpass/po-walk-{a,b,c,d}.mjs`) all pass on the fixed build; pictures `docs/img/handpass/2026-09-27-post-out-outcomes/`.
- **What it does:** the posting sheets' four chips (Overseas Sqn · Delete · SANS · Transfer, the last not yet) and what
  each does on its date; Suspend / Enable / Delete account; a delete kept underneath as a hidden mark (days he flew keep
  his puck, days to come lose him, saved, never brought back by a load or Undo); an archived man's callsign free, Rename
  and Restore-as on Quals' Archived list, the "he's back" prompt; the admin's member view (the badge; the phone drawer).
- **Found and fixed tonight (the big ones):** a delete not saved for the week on screen (a reload brought him back); an
  endless loop in the posting pass; a SANS posting lost when made with Show SANS on; an admin able to delete himself by a
  posting; a half-done posting for the last admin; a spanning request left "taken off"; a phone layout overflow.
- **Not built, said so:** the Tracker half of D299 → `[POST-OUT-TRACKER]` (his question 5).
- **Merge order for him (his "merge live" each, one at a time — D78):** #443 (accounts-new-person) and #445 (five
  flags) in either order → #444 (absence record) → THIS branch last: merge `main` in first (conflicts expected only in the
  shared records: HANDOFF, the file map, the rulings map — keep both sides), then the full checks again, then his word.
- **Coordination (D302):** told the #444 and #445 chats every shared file changed (their promises unchanged: #444 left
  `postOut` / `undoPostOut` / the posting sheets alone — confirmed at its head `1f25cccb`; #445 left `renameCallsign`,
  `setPeople`, the badge and the Archived list alone). Settled with #444: `Matrix.tsx`, `sync.ts`, `BidPicker.tsx` are LF
  on `main` and on both branches (the store is CRLF) — counted in raw bytes; Git Bash's `grep -c` misreports it.
- **#445 MERGED 27 Sep 26 (`2715d49d`).** A dry-run merge of that `main` into this branch: NO code conflicts (every
  `src` / `e2e` file merges by itself); conflicts only in the shared records — `.claude/rules/decisions/{leave-war,scheduler}.md`,
  `DECISIONS.md` (rebuild the map with `backlog-archive.mjs --rulings`), `DECISIONS-ARCHIVE.md`, `HANDOFF.md`,
  `OUTSTANDING.md` / `-ARCHIVE.md`, `docs/file-map.md`, the observation log — keep both sides. **The log:** this branch's
  entries 297–298 clash with #445's 298–300 → renumber THIS branch's past main's highest at the merge (D78; its skill's
  "parallel branches" rule), fixing any cross-reference.
- **Traps written down:** ports 4186/4187 on this PC are held by the old presentation server (`docs/gates-and-deploy.md`);
  scripted edits must keep each file's own line endings (memory `python-edits-crlf-trap`).
- **Rulings:** D301 (start now), D302 (chats coordinate). Range D301–D309.
<!-- /now -->

<!-- now:claude/absence-record-d147-af6a50 -->
### `claude/absence-record-d147-af6a50` — `[HUMAN-RETEST]` the absence record, with `[S4-HUNT-REST]` (D147): walked, fixed, FULL-checked; his answers D260–D263 recorded, THREE TO BUILD NEXT — written 27 Sep 26 — verify before use
- **What it is:** the absence record re-tested the way a person uses it — a host and five walkers at both widths (admin,
  member, guest), a sixth for the roll-call rows nobody reached; every finding reproduced and fixed red first, filed, or
  put to him. Plan `raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md`; evidence sheet
  `raptor-port/docs/handpass/2026-09-26-absence.md` (§3 every finding, §4 the roll-call, §6 the break tests, §8 the two
  final code reads, §9 the gates, §11 the re-walks, §12 his look card); the register's §12 says how the absence record
  now behaves.
- **The check:** the break tests (two thin wires pinned); Fable's and Astra's blind final reads — six findings, all fixed
  red first; a re-walk of every fix on the rebuilt app, and a second re-walk of what the first found (the phone hold,
  a vanishing row, a chip swipe, the board's crew column); the gates on the final code all green (§9). PR
  [seejiaokai/Raptor#444](https://github.com/seejiaokai/Raptor/pull/444).
- **His answers, 27 Sep 26 (all recorded, none built — his word: "first i answer all the questions then we handoff task
  in the next chat"):** **D260** (`oil.md`) a dragged block's Delete and the one-day Clear remove OIL awards too, naming
  each first; awards never move. **D261** (`oil.md`) a member opens his own OIL award read only at every stage. **D262**
  (`leave-war.md`) one chip, one Move: the one-day sheet's Move is always pressable and picks the chip up (the date box
  goes); while moving, the grid scrolls at its edges, the month buttons keep the move on, a click outside the grid cancels
  — `[LW-MOVE-ONE-CHIP]`. **D263** (`scheduler.md`) the change history records every change to an absence — built with
  the one changes window, `[DRAFT-PENDING]`, NOT now.
- **Next (the next chat):** build D260, D261, D262 ON THIS BRANCH (the agent's reading — before his "merge live"), each
  red first, walked at both widths with pictures, the gates under the lock (D228) → his five-minute look (the sheet's §12,
  plus the new Move) → his "merge live". Then, in his order (D147): change-recording, then the Leave War links.
- **Filed from it:** `[LW-ISO-DATES]`, `[LW-MOVE-BENEATH]`, `[LW-OFFER-ONLY-TAKEABLE]`, `[PO-RESTORE-POSTING]`,
  `[ABSENCE-SMALL-SEEN]`, a note in `[DRAFT-PENDING]` (the pending list's late-input line, R30), `[AMEND-SMALL-SEEN]`
  items 4 and 6. `[S4-HUNT-REST]` and `[PUB-UNAVAIL]` archived.
<!-- /now -->

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
   accounts suspended and deleted; STARTED beside #443 before it merges, D301) — BUILT and FULL-checked 27 Sep 26, his look and "merge live" next, merged LAST → the one changes window (`[DRAFT-PENDING]`) with its own full check →
   "merge live" (D173); beside it, he talks to the IT side (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s
   remaining three in his order (D147 — the absence record with `[S4-HUNT-REST]` — walked, on its branch, his look
   next — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 27 Sep 26, `claude/post-out-outcomes` (the final code of `[POST-OUT-OUTCOMES]`), one run under
the PC lock (`raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` §9): unit **6469 / 6469** (399 files) · build
clean · tfin **728 / 0** · e2e **478 passed**, 48 skipped · smoke **443 / 0** · rulecheck OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
history. How to run them: `raptor-port/CLAUDE.md` §Build & verify; how they mislead, and the checks on his PC:
`raptor-port/docs/gates-and-deploy.md`.

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
