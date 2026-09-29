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

<!-- now:claude/day-lock-mockup-data-model-493d27 -->
### `claude/day-lock-mockup-data-model-493d27` — `[DB-SYNC-MODEL]`: the day-lock mock-up and `data-model.md` §9 done, the red team running — documents only — written 29 Sep 26 — verify before use
- **Done:** the mock-up `raptor-port/docs/mock/day-lock.html` (Artifact "Taking a Day to Edit"), made by
  `raptor-port/scripts/handpass/mk-day-lock.mjs` against the preview on port 4187 (`raptor-daylock` in `.claude/launch.json`);
  `data-model.md` §9 the day lock (rules 1–10, `DayLock`), §3 a week stored as a week row plus one row per day, §11 note,
  §12 questions 8–9; the old text in `raptor-port/docs/archive/data-model-2026-09-29.md`; `handover-dataverse.md` q6.
- **Running:** the red team, Fable and Astra, from `raptor-port/docs/superpowers/briefs/2026-09-29-day-lock-redteam.md`.
- **Waiting on him:** the mock-up's six screen questions (none changes the tables). His questions this chat, answered in
  chat: this is a before-the-tables job; the OIL award fix is live (its ledger's saving in small pieces is `[DB-READINESS]`);
  design now, build with the database.
- **Rulings:** none new so far; this chat's range D450–D459 (D430–D439 went to the Leave War drag chat, D440–D449 to the DB-sync mock-up chat — D302).
<!-- /now -->

<!-- now:claude/db-sync-model-mockup-4a00e5 -->
### `claude/db-sync-model-mockup-4a00e5` — the IT hand-over document brought up to date (docs only); waits for his "merge live" — written 29 Sep 26 — verify before use
- **Asked to start `[DB-SYNC-MODEL]`'s mock-up, found it already done** by the day-lock chat
  (`claude/day-lock-mockup-data-model-493d27`, his page "Taking a Day to Edit"); built nothing for it. He chose (a):
  the `claude/db-step-now` block's residue — `handover-dataverse.md` promised "a one-time import of what is in the
  browsers today", against the wipe (D54, D56, D120). **Done:** its "What happens next" rewritten (the readiness work now,
  no import — the tables start empty, only his Tracker charts cross by Export → Import — and the 30-second updates,
  D356); `architecture-direction.md`'s one sentence marked. Its question 6 left to the day-lock chat, which edits it.
- **Handed to the day-lock chat (D302), since it is editing `data-model.md`:** §7's "One-time legacy import" row and §5's
  "import only" wording — the same stale idea; it put both on `[DB-SYNC-MODEL]`'s fold-in list (on its branch).
  Both branches edit `handover-dataverse.md` (different lines) — the later merge brings `main` in first (D78).
- **Parallel:** rulings D440–D449 (none used), observations #370+; the Leave War chat D430–D439, the day-lock chat D450–D459.
<!-- /now -->

<!-- now:claude/itflow-handoff -->
### `claude/itflow-handoff` — the IT flow guide chat's handoff: the guide is LIVE, `main`'s flaky test fixed; nothing pending but this notes branch — written 29 Sep 26 — verify before use
- **Where it started:** his `[IT-FLOW-GUIDE]` — a picture-led PowerPoint + PDF of every journey for the IT team; grew by his
  rulings D410–D418 (step by step, every alternate way, the work flows, the Tracker in full, what happens by itself, the two
  editing modes, the Leave War's manning and his answers on it).
- **Shipped:** the guide (42 slides, `raptor-port/docs/it-flow-guide/`, made by `raptor-port/scripts/itflow/`) — PR #468, MERGED,
  live on Vercel. `main` then went red twice on `[HISTLIST-SLOW-TEST]` (a test fault) — split into three tests, PR #470,
  MERGED (checks green on his PC); archived here. `main`'s own run for #470 was still going when this was written — read it.
- **Unfinished:** none. Filed: `[ITFLOW-OIL-RESHOOT]` (re-shoot the Leave War pictures — only on his word, D403),
  `[PDF-PRINT-TWICE]`, `[LW-DRAG-BELOW-ZERO]` (D418), `[TRK-REFUSALS-UNTESTED]`.
- **Branch:** `claude/itflow-handoff` (notes only); both work branches merged — never reuse them.
- **Gates:** not run here (docs only); #470's full PC run green; the Docs guard green on each PR.
- **Open questions for him:** none. The app's Help → Troubleshooting → Review Pinned Git Origins would let the app's own
  "bring main in" tool work in this repo (it refused on `.claude/launch.json`); `git merge` did the job meanwhile.
- **Pick up here:** his "merge live" for this notes branch, then remove this block. Next job per `## Next, in order`:
  `[DB-SYNC-MODEL]`'s mock-up (D355, D356).
<!-- /now -->

<!-- now:claude/itflow-update-on-his-word -->
### `claude/itflow-update-on-his-word` — the OIL award chat's last word: `[OIL-AWARD-IS-A-GRANT]` is LIVE (PR #469, merged 29 Sep 26 on his "merge live"); this notes-only follow-up (D403) waits for his own "merge live" — written 29 Sep 26 — verify before use
- **Live:** every hand OIL award is one ledger entry drawn on the grid on its date; "earned" and "awarded" apart (D400–D402).
  Evidence `raptor-port/docs/handpass/2026-09-29-oil-award.md`; Vercel READY for the merge commit. `main`'s run on his PC
  was still going when this was written — read its result before trusting `main`.
- **This branch carries D403** (his answer, 29 Sep 26: *"I'll tell u when to update"*) — the IT flow guide is re-shot only
  on his word; `[ITFLOW-OIL-RESHOOT]` now waits for it. Homes: the guide's README, the backlog item.
- **Left, filed:** `[LEDGER-READ-ASK]` (his question), `[RESTRICTED-ENV-WORKFLOW]`, `[LW-WINDOW-PRUNE-FLAKE]` (test-only).
  Rulings D404–D409 unused. The IT flow guide chat was told the change merged.
- **Next:** his "merge live" for this notes branch, then remove this block.
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
