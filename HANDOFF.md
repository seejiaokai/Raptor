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

<!-- now:claude/one-door -->
### `claude/one-door` — `[ONE-DOOR]` BUILT, walked, break-tested; the final gates and the two final code reads next, then his look — written 27 Sep 26 (late) — verify before use
- **What it is:** Admin → Users as the one door for a person's whole state (D309, D310, D322 — the approved mock-up
  `raptor-port/docs/mock/one-door.html`), Archive = "posted out from today" on the war with his past kept (D323), Restore
  asks the post-in date and opens a new stint (D308, D320), his "Welcome back" note (D305), Quals without its archive.
  Rulings D320–D324 (range D320–D329). Plan `raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md` (red-teamed by
  Fable and Astra, round 1 folded in).
- **The FULL check so far — the evidence sheet `raptor-port/docs/handpass/2026-09-27-one-door.md`** (§0 says where it
  stands): Fable's walk design (`…/specs/2026-09-27-one-door-scenarios-fable.md`) → 6 gaps fixed red first; the walk
  (`scripts/handpass/od-walk.mjs`, 23 scenes, both widths; `walk3` 238/0) → W1 (an archived man's leave sheet offered a
  posting door) and W2 (his welcome note scrolled away on a phone) fixed red first; the break tests
  (`scripts/handpass/od-breaks.py`, 32 wires; three unwatched ones given tests — one watched only by the walk's `pastrow`
  scene, proved with a broken build). `main` (PR #447) merged in; no code clash.
- **Next, in order:** read `walk5`'s results (`docs/img/handpass/2026-09-27-one-door/walk5/results.md`) → the gates under
  the PC lock (`E2E_PORT=4196 node raptor-port/scripts/gatelock.mjs run --from raptor-port`) → the two final code reads,
  blind to each other, brief `raptor-port/docs/superpowers/briefs/2026-09-27-one-door-final-read.md` (Astra:
  `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only …`) → fix red first → re-walk what the fixes
  touched → gates → finish the sheet (§8, §9) → open the PR → his look card (sheet §10, five questions) → his "merge live".
- **Beside it:** `[LW-MOVE-STANDARD]` merged (#447); its docs-only paperwork is PR #449
  (`claude/lw-move-standard-paperwork`, waiting on his "merge live") touching OUTSTANDING's priority list item 1 / item 3 and HANDOFF (its own block
  and #444's) — told it (D302) this branch touches only `[ONE-DOOR]`'s sentence there, will fix the stale
  "[POST-OUT-OUTCOMES] … merge live next" words itself, and merges `main` in before its own gates.
- **Ports:** preview 4178 (`.claude/launch.json` "raptor-onedoor"), E2E 4196. A scratch worktree for break tests at
  `C:\Users\User\odbw` (node_modules is a junction to this checkout's — remove with `git worktree remove --force`).
- **Traps:** the Bash tool mangles backslashes inside inline heredoc scripts — write an edit script to a file first.
  Codex: pass `-m gpt-5.6-sol`; stop a Codex run by its own PID, never `taskkill /IM codex.exe`. Scripted edits keep
  each file's line endings.
<!-- /now -->

<!-- now:claude/rulings-d264-d266-leave-war-f0f4ab -->
### `claude/rulings-d264-d266-leave-war-f0f4ab` — `[LW-MOVE-STANDARD]` (D264–D266, D330–D335): BUILT and FULL-checked — waiting for his look and "merge live" — written 27 Sep 26, verify before use
- **The job:** his D264–D266 plus his answers to the mock-up (D330–D335: order A, "Delete", a member's own Move, the Move
  button B — grey chip with a teal arrow, How many kept). Backlog `OUTSTANDING.md` `[LW-MOVE-STANDARD]` (folds in
  `[LW-MOVE-BENEATH]`). Branch cut from `main` (`818dbb04`). PR [seejiaokai/Raptor#447](https://github.com/seejiaokai/Raptor/pull/447);
  preview https://raptor-git-claude-rulings-d264-d266-leave-war-f0f4ab-kai-e2f5.vercel.app (behind his Vercel sign-in).
- **Evidence sheet — read it first:** `raptor-port/docs/handpass/2026-09-27-lw-move-standard.md` (the tier FULL, the
  readings he can correct §2, the roll-call, the door check, the walk and re-walk, 26 break tests, the two blind reads §8 —
  six findings, all fixed red first — the gates §9, his look card §10). The approved design:
  `raptor-port/docs/mock/lw-move-standard.html` (Artifact https://claude.ai/artifact/68SpLtpVYdimk6zZzfZohP).
- **What the build is:** a move carries RECORDS (`store.ts movableRecords` / `moveRecords` / `moveRecordsProblem` /
  `stayingIn` / `deletableIn` / `decidableIn`), both sheets in order A with one Move and one Delete (`ui/SheetActions.tsx`),
  the day's list's Move into the move mode by record id (`moveSel.only`), a picked range widening Decide / Move / Delete;
  `sync.ts doorMoveApproved` gained `skip` (agreed with the `[ONE-DOOR]` chat).
- **Next:** his look (the card, §10) → **his D324: PR #448 (the `OUTSTANDING.md` tidy, docs only) merges BEFORE this one — so
  once it has merged, merge `main` into this branch (no archive conflict expected: this branch archived nothing) and let the
  checks go green** → "merge live" (the later of this and `[ONE-DOOR]` takes `main` in first) → archive
  `[LW-MOVE-STANDARD]` and `[LW-MOVE-BENEATH]`. Filed from it: `[LW-SPARE-MOVE-DOORS]` (low).
- **Parallel (D302):** `[ONE-DOOR]` on `claude/one-door` (main checkout, preview 4178, E2E 4196) — exact shared lines
  exchanged, no overlap: it takes `store.ts` setPostIn / postingProblem / windowRecord / windowFor / readPostOuts /
  setPeople / forgetPersonFrom (+ a new openStint), `engine/people.ts`, `Matrix.tsx rowInWindow` and `PersonMonth`'s day
  cell, `BidPicker.tsx PostInSheet`; this chat's `Matrix.tsx` lines are the move block, `stayWords` (after `moveReason`,
  ~30 lines above `rowInWindow`), the banner, the DayList/BidPicker props. `OUTSTANDING.md` is over its tripwire on
  `main`; the `[ONE-DOOR]` chat put ONE docs-only tidy to him — neither chat trims it meanwhile. Observation numbers: this
  chat 310–319 (used 310–313), it 306–309. Ports here: preview 4177, E2E 4195.
- **Traps met:** the Codex config's default model is refused — `codex exec -m gpt-5.6-sol` (memory
  `astra-codex-cli-available`); stop a background run by its own id, never by process name (observation 312); a walk step
  pressing a leave chip must answer the "below zero — tap again" ask (observation 313).
- **Rulings:** D330–D335 (range D330–D339).
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
   MERGED (PRs #442, #443) → **`[POST-OUT-OUTCOMES]`** MERGED (PR #446) →
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

The latest counts watched — 27 Sep 26, `claude/rulings-d264-d266-leave-war-f0f4ab` (`[LW-MOVE-STANDARD]`, `86d7fea1`), one run
under the PC lock (`raptor-port/docs/handpass/2026-09-27-lw-move-standard.md` §9): unit **6591 / 6591** (406 files) · build
clean · tfin **728 / 0** · e2e **478 passed**, 48 skipped · smoke **443 / 0** · rulecheck OK · docsize OK. Restate a count only
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
