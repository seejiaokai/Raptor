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

<!-- now:claude/award-earned-vs-granted-2ed66d -->
### `claude/award-earned-vs-granted-2ed66d` — `[OIL-AWARD-IS-A-GRANT]` with D400: one kind of hand award; "earned" and "awarded" apart — written 29 Sep 26 — verify before use
- **The branch:** cut at `21869a2c`, the handoff-review chat's last commit (its block replaced here, with its leave; that
  branch gets no PR — this one carries its documents: the merged-block tidy, the OIL-sits-today note, D400). Folder
  `.claude/worktrees/five-flags-batch-continue-2cfa70`.
- **His brief (29 Sep 26):** build `[OIL-AWARD-IS-A-GRANT]` with `[OIL-EARNED-VS-GRANTED]` folded in (D400); no stored award
  converted, only the demo seed (D401); plan first, both reviewers on it; FULL tier, both read the final code. **D402**
  (his answer the same hour): every hand award shows on the grid on its date, wherever it was given.
- **BUILT, walked, both final reads fixed — waiting on his look and "merge live".** Plan (r2, two red-team rounds each
  from Fable and Astra): `raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`. Every hand OIL award
  is one positive OIL ledger entry, drawn on the grid on its date (FO / HO); "earned" is the automatic credits only,
  "awarded" every hand award, corrections their own row; an award's date is fixed; one 365-day ceiling; who entered it
  and when kept; old-shape war awards dropped on read, the demo seed rewritten.
- **Evidence sheet:** `raptor-port/docs/handpass/2026-09-29-oil-award.md` — roll-call R1–R15, the walk (W1–W8, Astra's
  ranks, X1–X5 the re-walk of the fixes; desktop and phone, no console errors), the gates, §7 the final reads: Fable
  SHIP, Astra FIX-FIRST (OA-001 the 365-day cap, OA-002 a correction's "given by", OA-003 the Undo label, OA-004 speed)
  — every finding fixed red-first (`src/leavewar/oilaward-finalreads.test.ts`) and re-walked.
- **Filed, not built here:** `[LEDGER-READ-ASK]` (what a member may read of another man's awards — a "+n" day's list
  shows them; D261 kept as it is), `[RESTRICTED-ENV-WORKFLOW]` (how bug checks work once the app is in IT's restricted
  environment), `[IT-QUESTIONS]` carries IT's answers.
- **Rulings D401–D402 recorded** (D403–D409 unused). **Ports:** preview 4183, browser tests `E2E_PORT=4197`; full checks
  through the PC lock (D228). **Parallel (D302):** the IT flow guide chat was told the OIL words change (29 Sep 26);
  promised a second message when this merges — its pictures re-shoot waits on that (`[ITFLOW-OIL-RESHOOT]`, filed on its branch, PR #468).
- **Next:** push → PR → the Vercel link to him → his look → his "merge live" → tell the IT flow guide chat it merged.
<!-- /now -->

<!-- now:claude/it-flow-guide-flowchart-da7ca1 -->
### `claude/it-flow-guide-flowchart-da7ca1` — [IT-FLOW-GUIDE]: DONE — 42 slides, Astra-checked; his "Good merge live" given 29 Sep 26, merging — written 29 Sep 26 — verify before use
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
- **Next:** his "Good merge live" (29 Sep 26): `main` merged in (D368), `[IT-FLOW-GUIDE]` archived; the PR's checks → merge → `main`'s
  run → live on Vercel. After that this block goes at the next handoff. Later: when the OIL award chat's words change the Leave
  War, re-shoot and rebuild — filed `[ITFLOW-OIL-RESHOOT]`; the OIL chat will message.
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

## Next, in order

0. **THE DATABASE STEP STARTS NOW (D354, 29 Sep 26)** — `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); next `[DB-SYNC-MODEL]`'s mock-up (D355, D356) and the readiness work. The IT team is taking the app into Dataverse now, and he means to
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

The latest counts watched — 29 Sep 26, `claude/award-earned-vs-granted-2ed66d` (`e7de1f80`), one run under the PC lock: unit
**6992 / 6992** (433 files) · build clean · tfin **728 / 0** · e2e **507 passed, 1 failed** (the month-window test, a timing
flake — alone 3 / 3, its file 154 / 0 straight after; `[LW-WINDOW-PRUNE-FLAKE]`), 48 skipped · smoke **445 / 0** · rulecheck
OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
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
