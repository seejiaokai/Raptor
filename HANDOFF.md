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
### `claude/post-out-outcomes` — `[POST-OUT-OUTCOMES]` BUILT, FULL-checked, his look card answered; `main` merged in — his "merge live" next (the last of the four) — written 27 Sep 26 ~13:30, verify before use
- **Where it stands:** PR #446. #445, #444 and #443 are MERGED (his order: #445, #444, #443); `main` (`d77f1e56`) merged in
  here — the app's code merged by itself, the shared records by keeping both sides (the rulings map rebuilt; this chat's
  merged `claude/accounts-new-person` block removed and `[ACCOUNTS-NEW-PERSON]` archived; this branch's observations
  297–298 renumbered 304–305, past main's 302). The gates re-run on the merge (§Gate baseline). **Evidence sheet — read it
  first:** `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` (the roll-call, the walk A–D and its re-walk, the two
  code reads, every finding fixed red first, the break tests, the gates, §10 the look card with his answers).
- **What it does:** the posting sheets' four chips (Overseas Sqn · Delete · SANS · Transfer, the last not yet) and what
  each does on its date; Suspend / Enable / Delete account; a delete kept underneath as a hidden mark (days he flew keep
  his puck, days to come lose him); an archived man's callsign free, Rename and Restore-as on Quals' Archived list, the
  "he's back" prompt; the admin's member view (the badge; the phone drawer).
- **His look card (27 Sep 26):** 1 keep the no-chip posting (D303); 3 a delete counts from the real calendar date (D304);
  4 the man himself should be told to check his quals (D305 — 3a); 9 the last admin's posting waits (D306); 11 Enable on a
  hand-suspended man shows the note (D307). Then his post-in date rule (D308) and his ONE-DOOR direction, approved as
  proposed (D309, D310 — narrows D217 and D295): Admin → Users carries every person's sign-in and roster state and every
  action; Quals loses its archive. **Not in this PR, by the agent's recommendation ("#446 as is" — his word pending):**
  3a, 3b, the archived group and `[POST-IN-DATE]` all go into `[ONE-DOOR]`, its own branch after this merges (mock-up
  first). Filed, not built: `[POST-OUT-TRACKER]` (question 5), and questions 2, 6, 7, 8, 10 as asked.
- **Next, in order:** his "merge live" for #446 → `[ONE-DOOR]` (fresh chat, mock-up first, FULL check) → the D264–D266
  build (`[LW-MOVE-STANDARD]`, the #444 chat's handoff) — after #446, because both change the Leave War's sheets.
- **Coordination (D302):** the #444 and #445 chats were told of every shared file; both are merged and idle.
- **Traps written down:** ports 4186/4187 on this PC are held by the old presentation server (`docs/gates-and-deploy.md`);
  scripted edits must keep each file's own line endings (memory `python-edits-crlf-trap`); a branch built on another
  chat's in-flight branch must re-take its FINAL head before its own final gates (observation 303).
- **Rulings:** D301–D310 (range D301–D319 — D310 took the tenth).
<!-- /now -->

<!-- now:claude/absence-record-d147-af6a50 -->
### `claude/absence-record-d147-af6a50` — `[HUMAN-RETEST]` the absence record (D147) walked and FULL-checked; his answers D260–D262 BUILT and FULL-checked on it — his look and "merge live" next — written 27 Sep 26 — verify before use
- **The re-test** (26 Sep 26): the absence record walked the way a person uses it, every finding fixed red first, filed or
  put to him; evidence `raptor-port/docs/handpass/2026-09-26-absence.md` (its look card §12). PR
  [seejiaokai/Raptor#444](https://github.com/seejiaokai/Raptor/pull/444).
- **His answers, built 27 Sep 26** (worktree `five-flags-batch-build-ef7d85`, pushed to this branch): **D260** a clear that
  takes an OIL award names it first — a dragged block's Delete, the bid sheet's Clear (one day or a range), one Undo back;
  **D261** a member opens his own award read only at every stage (and outside his posting dates); **D262** one chip, one
  Move — no date box; the chip rides the grid's move mode (edge scroll at the days' edges, months keep it, an empty tap
  outside the grid ends it, a double-click lands nothing, leaving the war ends it, one move at a time). **D263** (the
  change history records every change to an absence) goes with `[DRAFT-PENDING]`, not here.
- **The check (FULL):** evidence `raptor-port/docs/handpass/2026-09-27-d260-d262.md` — Fable designed the scenarios first;
  walked at both widths (a real touch phone over CDP); 27 wires broken on purpose, each turns a named test red; Fable's and
  Astra's blind final reads — nine findings, eight fixed red first, one left with its reason (§8); a re-walk of every fix
  (§10); the final gates all green (§9). His look card is §11; its one question is answered (D266).
- **From his look (27 Sep 26, four phone pictures): D264–D266** — one format and look for the one-day and drag-selection
  sheets; a Move on every record that can move (a bid beside an OIL award moves alone — Vector's 3 Jan offered none);
  the day's list moves a record by the move mode, no date box. Filed as `[LW-MOVE-STANDARD]`: a mock-up first (D264 is
  visual), then the build, FULL-checked. `main` (PR #445) merged in here first — code merged by itself; the full gates
  not yet re-run on the merged code.
- **Carries the five-flags chat's `[LW-MOVE-CI-RED]` test fix** (its commit `11f26903`, cherry-picked here as `3bf23e18`,
  tests only): three older Leave War Move tests now wait for the fill before their second drag — the GitHub failure this
  PR met. The same change is on `claude/five-flags-batch-continue-2cfa70`; whichever merges second meets it as identical.
- **Files this build changed that the post-out chat (`claude/post-out-outcomes`) will meet at its merge** (it asked, per
  the owner's D302 — parallel chats message each other before changing a shared file): `BidPicker.tsx` (Move → `onMove`,
  Clear's award ask, `AwardSheet`, `DecisionSheet` removed), `SelectSheet.tsx` (the Delete / Move row only), `store.ts`
  (`awardsIn`; `clearCells`), `select.ts` (`wireMove`), `Matrix.tsx` (the move wiring, `ownAwardOnly`, awards outside
  the posting dates drawn). No posting function or posting sheet was touched.
- **Next:** his look (§11) and "merge live" once GitHub's checks on the merged code are green; then `[LW-MOVE-STANDARD]`
  on a NEW branch from `main` in a fresh chat (his "1", D267): the mock-up →
  his approval → the build, red first → walk both widths → both reads → the gates → his look → "merge live". Then, in his order (D147): change-recording, then the Leave War links.
- **Filed from it:** `[LW-MOVE-STANDARD]` (his D264–D266); `[LW-MOVE-TAPLIST-ASK]` (answered, archived); notes in `[LW-MOVE-BENEATH]` (a bid beside an award moves by
  no door) and `[LW-ISO-DATES]` (the award sheet's date). `[ABSENCE-ASK]` and `[LW-MOVE-ONE-CHIP]` archived; earlier:
  `[LW-ISO-DATES]`, `[LW-MOVE-BENEATH]`, `[LW-OFFER-ONLY-TAKEABLE]`, `[PO-RESTORE-POSTING]`, `[ABSENCE-SMALL-SEEN]`.
<!-- /now -->

<!-- now:claude/five-flags-batch-continue-2cfa70 -->
### `claude/five-flags-batch-continue-2cfa70` — the five-flags batch AND his answers D270–D275: BUILT and FULL-checked (PR #445) — waiting for his look and "merge live"; the red Leave War tests' cause found and fixed (confirm on GitHub) — written 27 Sep 26 — verify before use
- **The branch:** carries `claude/five-flags-batch-build-ef7d85` whole (that branch has no PR and nothing of its own —
  delete it once this merges). PR #445 is from THIS branch. This chat worked in the folder
  `.claude/worktrees/trk-smoke-add-race-bug-007eed` (the block's earlier folder, `five-flags-batch-continue-2cfa70`, is
  another checkout at the same commit).
- **Parallel** with `claude/accounts-new-person` (PR #443) / the post-out work on `claude/post-out-outcomes` (the main
  checkout — its chat asked to coordinate: told the files this branch touches; it won't touch ours) and the absence-record
  re-test (PR #444, folder `five-flags-batch-build-ef7d85`). Ports: preview 4176 (`.claude/launch.json` "raptor-walk-4"),
  browser tests `E2E_PORT=4193`; rulings D276–D279 (all four used — his look-card answers). Full checks take turns through the PC-wide lock (D228,
  `gatelock.mjs … run --from <this worktree>/raptor-port`). The later merge takes `main` in first. Nothing to `main`
  without his "merge live".
- **Done 27 Sep 26 (the evidence sheet `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`):** D275 — the room
  beside the ‹ arrow taken out (`[ARROW-ROOM-OUT]`); D270 / D272 — his own puck wears any other ring (a flag's, the green
  OIL one), the purple fill stays; D271 — one man, once per row, REFUSED at every door with the reason, plus Fable's F1 (a
  request handed to a man already on its row keeps him once). FULL tier: Fable's scenarios, the roll-calls, the walk (W1
  71/0, W3 f6–f10 all green, W6 18/0 — pictures `docs/img/handpass/2026-09-27-five-flags-answers/`), the gates (§7), Fable
  and Astra's blind reads (no defect against the rulings; two test gaps fixed), the re-walk, the look card (§9). The three
  items archived. **His answers to the card's four questions, 27 Sep 26:** Q1 a jet line's two seats stay a warning (D276,
  against the recommendation), Q2 keep the faded purple ring (D277), Q3 and Q4 leave (D278, D279) — nothing to build.
- **`[LW-MOVE-CI-RED]` — cause found, tests fixed:** a timing race in three Leave War tests (the second drag straight after
  an admin's fill, which since `[ACCOUNTS]` re-renders longer on GitHub's machines); fixed with the 18 Sep stable drag
  (`e2e/leavewar.spec.ts`). It never failed on the PC; GitHub's next two runs of this branch were green with the three passing first time — archived.
  Side-findings filed: `[LW-HARNESS-VIEWER-PIN]`, `[CI-FAIL-PICTURES]` (his call — public pictures while the repo is public).
- **Next, in order:** (1) **his look** — the card is the sheet's §9 (the four questions are answered); (2) "merge live", one at a time with #443 and #444. **The absence chat's D262 reworks `select.ts` wireMove** (PR #444) —
  if it merges first, bring `main` in and re-run the three Move tests here; a conflict in those test lines keeps BOTH its
  behaviour and the stable drag (told to that chat).
- **His "2 chats" remark (27 Sep 26)** is still unanswered — put to him once; recommended: keep the one-at-a-time queue
  for full check runs (two chats working side by side needs nothing).
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** `[ACCOUNTS]` and `[ACCOUNTS-NEW-PERSON]`
   MERGED (PRs #442, #443) → **`[POST-OUT-OUTCOMES]`** (PR #446, his look card answered — his "merge live" next) →
   **`[ONE-DOOR]`** (D309, D310, carrying `[POST-IN-DATE]`, D308 — mock-up first) → `[LW-MOVE-STANDARD]` (D264–D266) → the
   one changes window (`[DRAFT-PENDING]`) with its own full check → "merge live" (D173); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 27 Sep 26, `claude/post-out-outcomes` (`[POST-OUT-OUTCOMES]` with `main` merged in — #445,
#444, #443 — `c5c1e921`), one run under the PC lock (`raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` §9):
unit **6543 / 6543** (403 files) · build clean · tfin **728 / 0** · e2e **478 passed**, 48 skipped · smoke **443 / 0** ·
rulecheck OK · docsize OK · GitHub on the same commit: every job green. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
