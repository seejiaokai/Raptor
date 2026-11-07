# HANDOFF — where things stand, and what is next

**A new chat reads this first.** It is the ONE handoff (D140, 24 Sep 26): `## Now` holds one block per open chat's
branch — where it stands, what it left, what to do next — and `## Next, in order` is the project's order; below
them, the standing facts. It holds CURRENT state only: a finished story is in git and, when a whole section left,
in `raptor-port/docs/archive/` (the 4 Sep 26 snapshot of this file is `HANDOFF-ARCHIVE.md`, frozen); open work is
in `OUTSTANDING.md`; where each kind of fact goes is `.claude/rules/doc-structure.md`, loaded in every chat.

**Before acting on a block:** `git fetch`, then check the branch and PR it names — it describes the world when it
was written. Never push while a PR's checks are running (D151) — a push starts two runs, so read them all: `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`, none of the last pushed commit `queued` or `in_progress` (D870).
Bring the checkout level BEFORE reading this file: a chat continuing a pushed branch runs `git pull --ff-only`; a fresh
worktree has no upstream, so "git pull" pulls nothing there — `git fetch origin`, then `git merge --ff-only origin/main`.
List the live chats (`ListAgents`): if the one that wrote
the block is still running, or another already holds the item you were told to start, message it and agree who owns
each remaining step before touching anything. If your opening message and the block's "Opening line" or "Pick up
here" differ, name the difference to him and ask before starting.
**Writing a block** (the session-handoff skill does it, at every handoff): rewrite ONLY your own block, between its
markers, even when nothing is pending; newest block first; remove another chat's block only after `git fetch` shows
its work merged and its open residue is filed in `OUTSTANDING.md`. Two parallel chats each keep their own block, and
the later merge keeps both (D78).

## Now
<!-- now:claude/rules-diet-step-4-7b92cb -->
### `claude/rules-diet-step-4-7b92cb` — chat 2: the rules diet's step 4, part 1 (the general rulings as a page); written 7 Nov 26 — verify before use
- **Built (commits 2cf3fcacc, 40a7f2711):** `.claude/rules/decisions/how-we-work.md` is a page (the v3 sample brought up to date with D1735–D1744); ten spent rulings archived (D86, D602, D832, D972, D973, D974, D1556, D1566, D1659, and D1736 — spent by its own text once steps 1 and 2 landed; told to him); D136 kept live (D1735 narrows it); the five always-loaded files got 42 citations the page shape's checks require (no rewording); the pointers in `AGENTS.md`, `raptor-port/CLAUDE.md`'s map row and `DECISIONS.md`'s head; tripwire 61000 → 25000. `docsize` OK. `docsize --reads`: start 42,767 → 28,942 tokens; each job about 4–5% less (Leave War 326,028 → 312,203).
- **In hand:** the account by requirement (`raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step4-account.md`, written by a helper) found **66 gaps** — the sample page had dropped or bent parts of rulings (worst: D90's conflict rule, D67/D790's readers, D353/D903's "two readers", D835's writing guide not yet adopted); the same helper is applying every fix and archiving D775 as spent (both tidy-ups done) → check its diff, commit, push → the two blind reads (D1739), brief `…/2026-11-07-rules-diet-step4-read-brief.md`: Astra by `codex exec -m gpt-6-astra -s read-only -c model_reasoning_effort=high "Read and follow the brief at <path> exactly. Your final message is the report it asks for." < /dev/null`, and a fresh Opus reader (Agent) — reports saved as `…-step4-read-astra.md` / `…-step4-read-opus.md`; every finding checked and fixed → a step-4 section in the plan → pull request (notes only, but his "merge live" — D1737; Auto-fix off) → report to him with "merge live?".
- **Overnight 7–8 Nov 26 (his word, relayed by the chat that started this one): both halves in THIS chat, unattended** (D596, D667, D766): compaction guard set to `--away`; the keep-awake request was refused by the app's safety check (told to the relaying chat for him). Part 2 next: the five always-loaded files as checklists (plan §3; stories moved whole to `raptor-port/docs/guide-full.md` by `--move`), each with its account and both readers; `codex-guide.md` needed no change. **His "auto merge live" for step 4 (D1748):** each part merges by itself once both readers' findings are fixed and its run is green, through the merge lock (D1746, steps in the shared notes `chat2-merge-steps-d1746.md`); a part whose Astra read cannot run is parked, not merged; step 5a waits for his word. Morning: guard `--back`, one notification, plain report of what merged and the live check.
- **Parallel:** chat 1's pull request 661 adds D1745; the branch `claude/merge-one-at-a-time` adds D1746 (two chats never merge at once — a merge lock, `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs take|release`) and changes `shipping.md`'s "merge live" and "one at a time" lines. When either merges, bring `main` in (`git merge --no-commit --no-ff origin/main`, then `backlog-archive.mjs --rulings --merge`) and state D1745 under "The platform and the database", D1746 on the shipping checklist. My next ruling number: D1749 or later, after checking every branch (D1747 is on `claude/merge-one-at-a-time`).
- **Rulings:** D1748 (his "auto merge live" for step 4).
<!-- /now -->
<!-- now:claude/merge-at-once -->
### `claude/merge-at-once` — merging at once on his word (D1742), and both his allowances used up by Mon 9 Nov 26 19:00 (D1743); written 7 Nov 26, 21:55 — verify before use
- **Live today:** the rules diet's steps 1–3 (pull requests 656, 657, 658); the start-of-chat size item closed (D1741, pull request 659).
- **This branch:** D1742 recorded — a job's closing records go before his look is asked for, and his "merge live" merges at once (`.claude/rules/shipping.md` changed; D1088 archived) — and D1743. It changes an always-loaded rule file, so it waits for his "merge live".
- **D1743:** until Mon 9 Nov 26 19:00 both allowances are spent (Claude Ultra, Codex $100) — chats side by side where the work allows; Astra's reads called on the work without asking him each time.
- **Next, in his order:** (1) **the M365 data package** he was given, with its instructions for the tables — a fresh chat reads it first (he gives its folder or attaches it), copies nothing of it into the project while the project is public, and reports in plain words what it says about the tables, what it changes in `raptor-port/docs/data-model.md`, `raptor-port/docs/handover-dataverse.md` and the M365 move plan, what needs the IT side, and whether the app can be ready by February (his target; what "ready" means is his to say), with a week-by-week plan — his requirements already ruled: D473, D1099, D1100, D1101, D1536, D1695, D774. (2) **The rules diet's step 4** in another fresh chat; recommended after it: OIL alone, then the four small areas side by side, the pause, then 5b side by side — most likely stopping before 5b.
- **Asked, not answered:** whether Astra goes back to standing reviewer of every code read (D590) after Monday — recommended yes.
- **Chat numbers (D1744):** each chat's title starts with its number — 1, the M365 package; 2, the rules diet's step 4; the next chat takes 3, and whoever starts it writes the new number here.
- **Rulings:** D1741, D1742, D1743, D1744. **Compacted 7 Nov 26, 22:30** — the state above checked after it; chat 1 (the M365 package) running.
<!-- /now -->

## Next, in order

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three; each step on his "merge live" (D1737).

*(The "RIGHT NOW" lines of 6 Oct to 5 Nov 26, with his two words of 12 Oct 26 (D774, D775 — rulings in `how-we-work.md`) — all done, live or filed — are in `raptor-port/docs/archive/handoff-right-now-2026-11-07.md`, moved whole on 7 Nov 26; more of 13 to 20 Oct 26 in `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`.)*

0. **THE DATABASE COMES AT THE END (D473, 1 Oct 26 — replaces D354's "starts now"):** the app's features are built first; after
   phase 7 no more database-readiness work until then; the table list (`raptor-port/docs/data-model.md`) is kept up to date as
   each feature is added, and he — with his AI — writes the table format for the IT side to enter. `[WARN-HIDE-KEPT]` is BUILT, FULL-checked and MERGED (1 Oct 26, PR #478); `[INSIGHTS-WHICH-COPY]` (D477, D478) BUILT, WALK-checked and MERGED on his "merge live" (1 Oct 26, PR #479). **Next (D483): `[WORKSPAN-NEGATIVE]`** — the negative work-hours fault, in a fresh chat, with the second Sonnet-walker trial on its walk (D480); then `[INSIGHTS-BOARD-DOOR]` (D481).
   *Done while the step was "starting now" (29 Sep – 1 Oct 26):* `[IT-FLOW-GUIDE]` DONE (the guide for IT, `raptor-port/docs/it-flow-guide/`, 29 Sep 26); `[DB-SYNC-MODEL]`'s design DONE and merged (PR #475); `[DB-READINESS]` group A PLANNED 30 Sep 26 (plan v4,
   `claude/db-readiness-table-shaping-4094f6`) — its build under way: phases 0–5 and 5b built 30 Sep 26, the group's FULL check done (the walk and both code reads, every finding fixed); phase 6 (a), (b), (d) built and FULL-checked 30 Sep 26 (`raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`); phase 6 (c) v3 built and FULL-checked 1 Oct 26 on `claude/db-readiness-p6c-holder-base` (D467 — `…/2026-10-01-dbr-phase6c-check.md`) — phases 0–6 MERGED 1 Oct 26 on his "merge live" (PR #476); phase 7, the small OIL follow-ups, BUILT and FULL-checked 1 Oct 26 (`…/2026-10-01-dbr-phase7-check.md`) and MERGED the same day on his "merge live" (PR #477) — group A is closed (D453); `[WARN-HIDE-KEPT]` (D469, D471, D472, D475) BUILT, FULL-checked and MERGED 1 Oct 26 (PR #478). The IT team is taking the app into Dataverse now, and he means to
   keep working on the app beside it. What to finish before the hand-over was put to him the same day; record his answer
   here and in `OUTSTANDING.md`'s priority list the moment he gives it. Everything below keeps its ORDER; its timing is overtaken — *and that hand-over now waits for the end (D473).*
1. **HIS ORDER to the database step (D203, 26 Sep 26 — its timing overtaken by D354):** `[ACCOUNTS]`, `[ACCOUNTS-NEW-PERSON]`,
   `[POST-OUT-OUTCOMES]`, `[LW-MOVE-STANDARD]` (D264–D266) and `[ONE-DOOR]` (D309, D310, with `[POST-IN-DATE]`) MERGED
   (PRs #442, #443, #446, #447, #450) → **the one changes window (`[DRAFT-PENDING]`)** MERGED (PR #451, 28 Sep 26); its
   two follow-ups `[HIST-PHONE-HIDE]` and `[CHG-BY-ITEM]` (D345, D346) MERGED (PR #455, 28 Sep 26); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **HIS ORDER NOW (D453, 29 Sep 26):** `[DB-SYNC-MODEL]`'s design fixed with the red team's findings → `[DB-READINESS]`
   **group A** (what decides the tables' shape — saving in small pieces, the schedule a day per piece, the change log, no
   week-deleting reconcile, the planning calendar's own records, no demo seed; with the small OIL follow-ups, D147) BEFORE
   IT settles its tables → the app connected (`[DB-STEP]`) → **group B** (tuned against the real database) → the lock's
   screens. *(D473, 1 Oct 26: group A is built; the connection, group B and the lock's screens wait for the end — there is no
   "before its tables settle" to race now.)* The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[LW-FROZEN-BAR-GAP]`; the Tracker leftovers'
   own residue — `[SAVE-NOTE-COVERS]` (built on `codex/save-note-controls`, 5 Oct 26 — his look and "merge live" left), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

**The latest counts watched — 19 Oct 26, `claude/schedule-amendments-fixes-fffce0` at `40c7af45e` (`main` with the D994 batch, every fix of its check in — NOT `main`'s code), the whole gate set under the PC lock in one run, browser tests on 4232: build clean · tfin 728 / 0 · unit 11855 / 11855 · e2e 865 passed, 0 failed, 61 skipped · smoke 453 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.** (The run before it, at `9cbdc5e64`, met the Leave War phone test of `[LW-WINDOW-PRUNE-FLAKE-2]` once — 2 of 3 alone.)

Older counts, 9–19 Oct 26: moved whole to `raptor-port/docs/archive/handoff-gate-baseline-2026-11-07.md` (D1733).

Only the newest count stays in this section: when a newer one is written, the one it replaces moves whole to that archive file (D1733).

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
