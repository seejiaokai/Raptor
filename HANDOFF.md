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

<!-- now:claude/change-recording-retest -->
### `claude/change-recording-retest` — the change-recording re-test (`[HUMAN-RETEST]`, D147) with `[UNDO-ROSTER-SETTINGS]`, D148 and `[UNDO-TOPBAR]` — PLANNED, red-teamed (round 1), Phase A WALKED; NO app code yet; the BUILD is next, in a fresh chat — written 28 Sep 26 — verify before use
- **BUILD IN PROGRESS (28 Sep 26, late — paused for a PC restart; pushed):** B1–B9 built red-first and committed (the
  engine rules, B4 → B2 cutover + `lw.stage`, B5 roster-restore, B7 landing, B8 words, B9 Quals columns). B10 is a WIP
  commit (`[UNDO-TOPBAR] WIP`): its known red — `leavewar/ui/chrome.test.tsx` pair tests (move to a Shell test), the Leave
  War e2e `lw-undo` ids → `#undoBtn`, the Tracker smoke's undo-button lines (plan §11.10), `histlist.test.tsx` timing out
  only under a full run. Then B11 docs, the gates under the lock, the walk, the two reads, the look card.
- **Where it stood before the build:** the main checkout (`C:/Users/User/projects/Raptor`), cut from `main` at `60a6792c`; nothing under
  `raptor-port/src` changed. The plan: `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md` (Phases
  A–D, steps B1–B11). His rulings today: **D347** (every Undo/Redo pair in the top bar, as Edit Schedule's), **D348**
  (the phone's order is the desktop's; the changes clock stays Edit Schedule's), **D349** (the mock-up
  `raptor-port/docs/mock/undo-topbar.html` v4 APPROVED — the Tracker's pair moves too; the board gets Sync + bell and ONE
  exit, ✓ Done; on a phone Sort all + the layout switch behind ⋯), **D350** (adding / archiving / restoring / deleting a
  person and postings stay OUT of Undo — `[UNDO-POSTING-RECORD]`). Filed: `[HIST-PER-PAGE]`. Baseline walk:
  `scripts/handpass/cr-base.mjs`.
- **Done this chat (all committed and pushed):** the scenarios (Fable, Astra), the "which changes get Undo" review
  (both), the plan's round-1 red team (both) — every finding ACCEPTED and folded into the plan's §10–§11; Phase A walked
  by two walkers (A1 the schedule and board: 178 pass / 12 fail = 3 real defects; A2 inputs, the Leave War, roles: 158 /
  8, all words) — folded as §12–§13, reports `raptor-port/docs/handpass/parts/2026-09-28-cr-a{1,2}.md`. His rulings of the
  day: D347–D353 (D351 Clear edit history kept until the database; D352 the stage stays undoable with its own words;
  D353 how many reviewers — scenarios / side questions ONE, Astra first; a plan's red team and risky code reads BOTH).
  Filed: `[UNDO-POSTING-RECORD]`, `[HIST-PER-PAGE]`, `[PHONE-DISCARD-MARKS]`.
- **Next, in order (the build chat):** (1) read the plan WHOLE — §11–§13 win over §3–§6 where they differ; (2) a round-2
  red team only if the build finds the plan's shape wrong (D353: both reviewers for a plan red team); (3) reproduce A1-F1–F3
  and A2-F1–F6 red-first; (4) build in §4's order as §11 amends it (B4 before B2; B6 and B10 split); (5) gates under the PC
  lock; (6) walk the build at 1440×900, 390×844, 844×390 and re-run the Phase A scripts into a new folder (send the Tracker
  chat the 844×390 top-bar height); (7) Fable + Astra read the finished code with the evidence sheet
  `docs/handpass/2026-09-28-change-recording.md`; (8) fix, re-walk, the look card, his "merge live".
- **Files this branch changes — a parallel chat leaves them alone and says so first (D302):** the undo engine
  (`src/undo/*`), `src/state/undo-wire.ts`, `src/state/people-settings-commit.ts`, `src/state/person-delete.ts`
  (`deletedRestoreProblem`), `src/state/accounts.ts` (a restore check), `src/state/roster-restore.ts` (new), the Undo /
  Redo pairs — `src/ui/Shell.tsx`, `src/ui/SchedBoard.tsx`, `src/leavewar/ui/Chrome.tsx`, `src/tracker/components/Header.jsx`
  — `src/tracker/undo-bridge.js` (new) + one registration at the END of `core.js init()`, `QualsPage.tsx`'s column list,
  and `scheduler.css`'s top bar / board bar. Backlog items: `[UNDO-ROSTER-SETTINGS]`, `[UNDO-TOPBAR]`, `[GLOBAL-UNDO]`,
  `[AMEND-SMALL-SEEN]` item 2.
- **Agreed with the parallel chats (D302, 28 Sep 26):** the Tracker leftovers chat (`claude/tracker-leftovers-f79d36`,
  D370–D379) owns core.js's session / dialogs / date boxes / the undo section's bodies (its D372: pace, end-date and lull
  become Tracker undo steps) and the key handler, and Header.jsx's Crew and find boxes; this branch takes only the ↶ ↷ pair
  out of Header.jsx and adds the bridge. The small-fixes chat (`claude/small-fixes-batch-d223f6`, D360–D369) changes
  text in Chrome.tsx (the clash strip) and sync.ts (three refusal sentences), the Leave War store's two dead move doors,
  scheduler.css away from the top bar. The docs-tidy chat (`claude/docs-tidy-subheads-audit-ec8f87`, D380–D389) inserts
  heading lines in ui-contracts / engine-rules / feature-impact / performance and a new docsize check (a new ruling's .md
  homes must name its D-number). **Certain one-line clash:** the `docs/mock/` row of `raptor-port/docs/file-map.md` (both
  this branch and the Tracker chat add a sentence) — keep both. Keep both sides on every other doc conflict; re-run
  `backlog-archive.mjs --rulings` after merging `main`.
- **Ports:** preview 4173 (`raptor-walk`, running), browser tests `E2E_PORT=4190`. **Rulings:** D347–D353 used, D354–D359
  free. Nothing to `main` without his "merge live".
- **The rulings slim-down (D390, PR #458) is MERGED INTO THIS BRANCH (28 Sep 26):** D347–D353 are short lines in the
  area files, their full rows in `.claude/decisions-full/`; the Also-read lines and the ranges sentence re-applied by hand.
  **Left:** one reviewer (Astra first, D353) reads the seven short lines D347–D353 against their full rows (D138) — the
  merge printed them as UNREAD. New rulings: add the FULL row at the top of the area table, first bold sentence = the
  rule on its own (≤350 characters, no "|"), then `backlog-archive.mjs --rulings`.
<!-- /now -->

<!-- now:claude/docs-rulings-slim-down-e83c74 -->
### `claude/docs-rulings-slim-down-e83c74` — [RULINGS-SLIM] (D390): every ruling loads as one short line — BUILT and read; the guide step and his look left — written 28 Sep 26 — verify before use
- **The branch:** cut from `main` at PR #457; folder `.claude/worktrees/docs-rulings-slim-down-e83c74`. Docs and the
  document gate's scripts only — no `raptor-port/src`, so only the Docs guard runs. Rulings range D390–D399 (D390 used).
  No PR opened yet.
- **Done:** D390 recorded; the plan red-teamed by Fable AND Astra (`raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`,
  review log §6 — every finding and what became of it); the converter (`backlog-archive.mjs --rulings`, `--short-text`,
  `--move-rows`, `--merge`), the gate (`docsize.mjs`, shared reader `docsize-rulings.mjs`, `--marks`), 178 self-test
  cases; all 265 rows converted; People & accounts (62 rows); 114 short lines hand-written; Fable's meaning read (252/265,
  the 13 others rewritten; 23 older rulings marked); both code reads and both verifications folded; a trial merge of
  each open parallel branch ends green. **Measured:** every chat ~50k → ~13k tokens; a scheduler build chat ~110k → ~44k.
- **Parallel chats (D302):** change-recording (D347–D359), small fixes (D360–D369), Tracker leftovers (D370–D379) hold
  the merge steps in their HANDOFF blocks: `git merge --no-commit --no-ff origin/main`, resolve HANDOFF / OUTSTANDING,
  `node raptor-port/scripts/backlog-archive.mjs --rulings --merge`, re-apply the printed lines, one reviewer reads the
  UNREAD lines. The change-recording merge will say WRITTEN and ask for its hand work (D347 in the leave-war and tracker
  "Also read" lines; a mark in D347's full row for D348); D350 may belong in People & accounts.
- **Next:** (1) the guide step NOW (D391, 28 Sep 26 — his "Confirm do 1 now?"): plan §2.6, `raptor-port/CLAUDE.md`
  ~16k → ~6k, on its own branch cut from this one, in a fresh chat, Opus 5.5 high, then Fable's meaning read — the Leave
  War row of §Where things live left untouched (`claude/small-fixes-batch-d223f6` edits it); D390's short line was rewritten
  for D391 by hand — add it to that meaning read; (2) open the PR, his look, "merge live" — ideally before the three parallel chats merge,
  since they are set up to merge across it; (3) his optional question 4 (the older "settled before" notes, ~9k in the
  scheduler file) stays unanswered.
<!-- /now -->

<!-- now:claude/docs-tidy-subheads-audit-ec8f87 -->
### `claude/docs-tidy-subheads-audit-ec8f87` — docs-only tidy DONE: [HANDOFF-SHAPE-GUARD], [DOC-SUBHEADS], [RULING-HOMES-AUDIT] — waiting for his "merge live" — written 28 Sep 26 — verify before use
- **The branch:** cut from `main` at PR #456; folder `.claude/worktrees/bg-cwd-guard-4cc654`. Documents and the
  document gate's scripts only — no `raptor-port/src`, so the full checks do not run; the Docs guard does. Rulings
  range D380–D389 — none used (no ruling this session).
- **Done:** the gate fails `HANDOFF.md` losing a block's `<!-- /now -->` or one of its three headings; 81 sub-headings
  in the four long reference docs (heading lines only, proved byte-identical otherwise); the ruling-homes audit
  (`raptor-port/docs/superpowers/specs/2026-09-28-ruling-homes-audit.md` — D21's "corrected" contract sentence never had
  been, now is) and the gate now fails a NEW ruling row whose Markdown home never mentions its number. Fable read it all
  for meaning (D138); its five findings are fixed. The three items are archived.
- **Parallel chats (D302):** change-recording, small fixes and Tracker leftovers were told every shared file and the two
  gate changes before they landed; all three made their new rows pass (D349 fixed on theirs). A trial merge with each is
  clean except `HANDOFF.md` with the change-recording branch — both blocks added at the top of `## Now`: the later merge
  keeps BOTH, each with its own `<!-- /now -->` (D78; the new shape check fails a resolution that drops one).
- **Next:** his look at the PR and "merge live" (one at a time with the parallel chats, D78). Not this branch's: the
  merged five-flags block below still sits in `## Now` (the gate notes it) — the next handoff that files its residue removes it.
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

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** `[ACCOUNTS]`, `[ACCOUNTS-NEW-PERSON]`,
   `[POST-OUT-OUTCOMES]`, `[LW-MOVE-STANDARD]` (D264–D266) and `[ONE-DOOR]` (D309, D310, with `[POST-IN-DATE]`) MERGED
   (PRs #442, #443, #446, #447, #450) → **the one changes window (`[DRAFT-PENDING]`)** MERGED (PR #451, 28 Sep 26); its
   two follow-ups `[HIST-PHONE-HIDE]` and `[CHG-BY-ITEM]` (D345, D346) MERGED (PR #455, 28 Sep 26); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 28 Sep 26, `claude/hist-phone-by-item`'s final code (`14b14360`, `main` taken in), one run
under the PC lock: unit **6775 / 6775** (417 files) · build clean · tfin **728 / 0** · e2e **495 passed**, 48 skipped ·
smoke **443 / 0** · rulecheck OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
