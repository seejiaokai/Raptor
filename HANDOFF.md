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

<!-- now:claude/it-flow-guide-flowchart-da7ca1 -->
### `claude/it-flow-guide-flowchart-da7ca1` — [IT-FLOW-GUIDE]: the FULL deck (42 slides) built, Astra-checked, committed and SENT to him; waiting on his look — written 29 Sep 26 — verify before use
- **His rulings this chat (D410–D418):** the format (D410); the sample approved + the alternate-plan flow and the work flows
  (D411); step by step with every alternate way — templates, blocks (D412); the Leave War's own flow (D413); the Tracker in full
  (D414); what happens by itself (D415); the two editing modes (D416); the Leave War's manning (D417); his answers on the Leave
  War as built — three kept, a drag below zero asks too (D418, filed `[LW-DRAG-BELOW-ZERO]`). Also filed: `[PDF-PRINT-TWICE]`,
  `[TRK-REFUSALS-UNTESTED]`.
- **The deck:** map, two work flows, 17 journeys in 39 slides (steps / ways / compare / ripple kinds). Made by
  `raptor-port/scripts/itflow/` — `capture.mjs` + `j/*.mjs` shoot the running app (port 4185), `content.mjs` holds the words,
  `deck.mjs` lays out, `pdf.ps1` has PowerPoint write the PDF. `pptxgenjs` and `sharp` live in the chat's scratch folder
  (`ITFLOW_MODULES`), never `package.json`. The pictures and decks are NOT committed until the final (docs/it-flow-guide/).
- **Done:** Astra read every caption, check and test against the code (588 checked; 7 wrong, 5 unsupported — all fixed); the
  final `raptor-it-flow-guide.pptx` (13.6 MB) and `.pdf` (3.9 MB) are in `raptor-port/docs/it-flow-guide/` and were sent to him.
- **Next:** his look → any changes (edit `content.mjs` or a `j/` file, re-shoot, rebuild — README) → open the PR (it carries
  `.mjs`, so the full checks run on his PC) → his "merge live" → archive `[IT-FLOW-GUIDE]`.
- **Parallel (D302):** the handoff-review chat (D400–D409, observation #348) and the OIL award chat
  (`claude/award-earned-vs-granted-2ed66d`, D401–D409) — no shared lines. The OIL chat changes the Leave War's OIL words
  ("earned" / "awarded") and will message when they change and when it merges — then re-shoot `lw` and `ripple`. This chat:
  D410–D429 (D410–D418 used), observations #350+, preview port 4185 (`raptor-itflow` in `.claude/launch.json`).
<!-- /now -->

<!-- now:claude/small-fixes-tidy -->
### `claude/small-fixes-tidy` — the small-fixes batch is LIVE (PR #463, merged 29 Sep 26 on his "merge live"); this notes-only follow-up waits for his own "merge live" — written 29 Sep 26 — verify before use
- **What it carries (documents only):** his look at D367 on his iPhone ("Looks good"); `[DOCSIZE-MERGE-CEILING]` filed; the
  batch's eight finished items archived by the script (`[AVAILWIN-PREVIEW-BAR]`, `[GHOST-FLAG-SHADOW]`, `[ALLAVAIL-OPEN-ROW]`,
  `[LW-ISO-DATES]`, `[LW-SPARE-MOVE-DOORS]`, `[REQ-DOOR-WORDS]`, `[REQ-ORPHAN-ROW]`, `[ABSENCE-SMALL-SEEN]` — their facts in
  `raptor-port/docs/ui-contracts.md` and the evidence sheet `raptor-port/docs/handpass/2026-09-28-small-fixes.md`);
  `[AMEND-SMALL-SEEN]` stays open (items 2 and 6–8 belong to other chats; 5 answered, D362).
- **Left from the batch, filed:** `[PLAN-BANNER-DOOR]`, `[GATELOCK-STALE-LIVE]`, `[ROW-NO-TIME-MARK]` (D361, a future job),
  `[APP-FONTS-NOT-LOADED]` (his call), `[DOCSIZE-MERGE-CEILING]`. Rulings D360–D367 (D366 archived); D368–D369 unused.
- **Next:** his "merge live" for this branch, then remove this block. Folder `.claude/worktrees/trk-smoke-add-race-bug-007eed`.
<!-- /now -->

<!-- now:claude/db-step-now -->
### `claude/db-step-now` — the database step starts now (D354–D356) and the tidy-up after PR #464 — docs only; waiting on his "merge live" — written 29 Sep 26 — verify before use
- **His news (D354, 29 Sep 26):** the IT team is taking the app into Dataverse now; he means to keep working on it beside
  them. D203's timing is overtaken; its order stands. How the app shares once it is in the database is SETTLED in part:
  **D355** (a scheduler locks a DAY — one or several — others see "<callsign> – editing"; freed after 30 minutes idle; an
  admin can take over) and **D356** (idle = no change by the holder for 30 minutes, a warning at 25; saved as you go with
  "Done editing"; others' changes arrive every 30 seconds while on screen). `data-model.md` §9 marked;
  `OUTSTANDING.md` `[DB-SYNC-MODEL]` (left: the mock-up of the day lock, §9 rewritten, both reviewers' red team).
- **NEXT (his ask, a fresh chat): `[IT-FLOW-GUIDE]`** — the compact, picture-led flowchart of every journey through the
  app (what a person clicks, what he sees next) with "what to test" per journey, for the IT team and the next developer.
  Recommend the format first (the agent's lean: a slide deck — a map slide, then a slide per journey); his memory rule:
  few words, real screenshots, short captions.
- **Also due before the tables settle (D354):** bring `raptor-port/docs/handover-dataverse.md` up to date (written 10 Sep;
  its "one-time import of what is in the browsers today" contradicts the wipe plan D54); `[DB-READINESS]` with
  `[OIL-AWARD-IS-A-GRANT]` (tell IT the two saving changes coming); his Tracker charts exported before the wipe (D120);
  before IT gets the code: the runner off the repo (`[REPO-PRIVATE]`, SEC-101). Open question to him: does IT want the
  documents, the code, or both?
- **Done here:** PR #464's residue — `[UNDO-ROSTER-SETTINGS]` and `[UNDO-TOPBAR]` archived; its `## Now` block removed.
  Still first on the test side: `[INPUTSCAL-TAP-FLAKY]` (failed 3 of 4 PC runs on 29 Sep 26). Rulings D357–D359 free.
<!-- /now -->

<!-- now:claude/rulings-slim-d391-078ad2 -->
### `claude/rulings-slim-d391-078ad2` — [RULINGS-SLIM]'s guide step (D391): the guide's rules as one-line short forms — BUILT, his "merge live" given — written 28 Sep 26 — verify before use
- **The branch:** cut from `main` after PR #458 (the rulings part of the slim-down, whose block this replaces — merged; its
  residue: this step, and the optional question 4 kept in the plan §2.1). Docs, the document gate and `docs-guard.yml` only —
  no `raptor-port/src`, so only the Docs guard runs. No ruling this session.
- **Done:** 35 blocks of `raptor-port/CLAUDE.md` moved whole to `raptor-port/docs/guide-full.md` by `backlog-archive.mjs --move`,
  each leaving a short form of at most 350 characters; the gate pairs them (`docsize.mjs guidePairing`, 11 new self-test
  cases); the guide ~16.2k → ~9.5k tokens (why not ~6k: plan §2.6); its line tripwire 760 → 340; the Docs guard's time
  limit 5 → 10 minutes. The Leave War row of §Where things live untouched (small fixes edits it); trial merges with small
  fixes, change-recording and Tracker leftovers are clean, and all three chats were told (D302). Fable's meaning read (30 of 35 faithful, five rewritten from its replacements, its gate points folded — plan §2.6):
  brief `raptor-port/docs/superpowers/briefs/2026-09-28-guide-short-forms-meaning-brief.md`.
- **Next:** his "merge live" was given 28 Sep 26 — merge when the PR's checks are green, then `main`'s run, then live.
  Filed, low: `[GUIDE-MAP-ROWS]` (the map's long rows, a question for him).
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

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — first `[IT-FLOW-GUIDE]` (his ask for IT), then `[DB-SYNC-MODEL]`'s mock-up (D355, D356) and the readiness work. The IT team is taking the app into Dataverse now, and he means to
   keep working on the app beside it. What to finish before the hand-over was put to him the same day; record his answer
   here and in `OUTSTANDING.md`'s priority list the moment he gives it. Everything below keeps its ORDER; its timing is overtaken.
1. **HIS ORDER to the database step (D203, 26 Sep 26 — its timing overtaken by D354):** `[ACCOUNTS]`, `[ACCOUNTS-NEW-PERSON]`,
   `[POST-OUT-OUTCOMES]`, `[LW-MOVE-STANDARD]` (D264–D266) and `[ONE-DOOR]` (D309, D310, with `[POST-IN-DATE]`) MERGED
   (PRs #442, #443, #446, #447, #450) → **the one changes window (`[DRAFT-PENDING]`)** MERGED (PR #451, 28 Sep 26); its
   two follow-ups `[HIST-PHONE-HIDE]` and `[CHG-BY-ITEM]` (D345, D346) MERGED (PR #455, 28 Sep 26); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **Before the tables are settled (was "about a month before the database" — D354):** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[LW-FROZEN-BAR-GAP]`; the Tracker leftovers'
   own residue — `[SAVE-NOTE-COVERS]` (medium, next), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 29 Sep 26, `claude/change-recording-retest`, each run under the PC lock: unit **6898 / 6898**
(423 files) · build clean · tfin **728 / 0** · e2e **495 passed**, 48 skipped · smoke **445 / 0** · rulecheck OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
