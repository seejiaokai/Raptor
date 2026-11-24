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
<!-- now:claude/app-speed-readout-161 -->
### CHAT 164 — the `?timing` readout's WALK: parts 1–2 walked, three faults found and fixed red-first; parts 2–3 re-running; written 24 Nov 26, ~15:00 — verify before use
- **State:** the combined walk list (W1–W26) and the five sizing lines are in the evidence sheet. The walk is the host's own scripts, `raptor-port/scripts/handpass/timing-walk{-lib,,-2,-3}.mjs` (run from `raptor-port/` on a build already made; `TW_OUT` the picture folder, `TW_MAIN` `main`'s build for W1d — made by `git archive origin/main` into `C:/t164m`, see the sheet). Pictures: `docs/img/handpass/2026-11-24-timing-readout/walk1` (the first build), `walk2` (after fixes 1–2), `walk3` (after fix 3: parts 2 and 3, their logs `walk3-part2.log`, `walk3-part3.log`).
- **Found and fixed by the walk (each red first):** (1) W1 — without the switch the app's own first download split 15 → 19 files (the readout imported React and the movable window); now `main.tsx` hands them over (`makeTimingReadout`), no JSX in the readout's files; pinned in `timing.test.ts`; re-walked 15 = 15. (2) W5 — a tap the busy computer heard late (0.86 s once) was left out of the time; `timing.ts` now times a sign-in or page from the press's own time stamp; four tests; every figure then within 0.05 s of the outside stopwatch. (3) W14 — on a reload (each file asked again, "unchanged" — Vercel's way on a return visit) the window read "Kept 0 of 15" and "15 · 4 KB"; now `timingtext.ts filesOf` counts such a file kept and asked, its size "not given by Chrome", and `downloaded` ignores it; five tests.
- **Part 2's first run, its other FAILs were the script's own** (fixed in the script, re-running): a phone's window starts folded (rows not read), a label read as its first class, a browser forced to 125% needs no set viewport, W6's press landed after the week, W24's second tab lacked the press script. W10 RECORD for him: the Leave War opened after its background fetch reads "first time: 0.2 s" with no download.

### CHAT 161 (its block, kept until the walk closes) — the app's speed, step 1: the clean re-measure, then the hidden `?timing` readout built; written 24 Nov 26, 14:15
- **Where it started:** chat 160's opening line — step 1 of `[APP-SPEED]` only. He asked along the way what the readout is for, why his office computer is needed beside the slowed stand-in, what steps 2 and 3 are, whether step 3 works in Power Apps (not known — the readout's "Kept from an earlier visit" row answers it on each host), and whether step 2's background preparation slows View-only Sched at sign-in (D2482's two checks).
- **Done:** (1) the clean re-measure, checks lock held — about half chat 160's rough times; neither of its two flagged slowdowns is real; NEW for step 2: the second open of Edit Schedule was the slower one in 4 of 5 starts — all written into the plan `raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md`. (2) The mock-up, its words read by a fresh Fable (D2441), approved: https://claude.ai/artifact/7bgefju2mwrGJzc2ACSExS (D2483). (3) The readout built red-first: `src/ui/timing.ts` (switch + stopwatch + freeze counter, all inert without the switch), `src/ui/timingwindow.tsx` + `TimingReadout.tsx` + `timing.css` (a separate download behind the switch), `src/ui/timingtext.ts` (words); marks in `main.tsx`, `state/view.ts setPage`, `ui/Login.tsx`. (4) Scenario design by Astra and a fresh Fable, blind (D2443): both found the same stopwatch faults by reading (F1–F9 in the evidence sheet) — all fixed red-first (`timing-watch.test.ts`; F1 and F5 put back by hand, seen red). (5) The code check's two findings fixed. 50 tests in the four readout files, the touched files' neighbours green, `tsc -b` clean, code check clean locally.
- **Unfinished — the bug check (WALK):** the evidence sheet `raptor-port/docs/handpass/2026-11-24-timing-readout.md` has its tier, roll-call tables (blank cells to fill) and the scenario pointers. Still to do, in order: write the combined walk list from the two scenario reports (`raptor-port/docs/superpowers/briefs/2026-11-24-timing-readout-scenarios-{fable,astra}.md`), the sizing lines (§7.0), take the checks lock, `npm run build`, walk on the built app at desktop and phone (the plain-user round too) — the switch OFF first (no readout file fetched: check `dist/` and the network list), then ON: every page and opener against the plan's script's own times, Leave War/Tracker first opens with the claw, a failed download, Retry's reopen, sign-out with a save waiting, a hidden tab, Escape and the layers (both lists' S19–S21), Copy all; then the code read — Astra and a fresh, blind Opus with one brief, run in an exported copy WITHOUT the scenario reports, this block and the evidence sheet (the recipe: `raptor-port/docs/codex-guide.md` "Reading a commit that is not the branch head"); fix, re-walk what fixes touched; close the sheet with its `Walk:` line.
- **Open question for him (at his look, with a mock-up — D1625):** what Copy all shows when the browser refuses to copy (both readers flagged it; today the button simply stays "Copy all", never a false "Copied").
- **Branch:** `claude/app-speed-readout-161`, worktree `C:/Users/User/projects/Raptor-speed` (its `node_modules` is a junction to the main folder's — unlink it before removing the worktree). Pull request 840 (draft), `main` brought in once (D2443/D2444 kept beside D2481–D2483). Released here (`git switch --detach`) as the last step; the next chat switches to it.
- **Gates:** GitHub's run on `b7febecd4` (before the last two pushes): all green but the code check (its two findings fixed in `83f3127a1`, clean locally) — read the run on `83f3127a1` before anything else. On his PC: the readout's four test files and seven neighbours, `tsc -b`, `scripts/code-check.mjs`, `npm run docsize`.
- **Running when written (chat 164):** parts 2 and 3 of the walk, in the background, into `walk3`. The checks lock is free.
- **Pick up here (chat 164):** read `walk3-part2.log` and `walk3-part3.log`; open the deciding pictures; reproduce any FAIL; fill the sheet's roll-call A and B from them; then the code read (the brief is drafted — rewrite it from the sheet's promise section if lost: Astra and a fresh, blind Opus, one brief, an exported copy of the last commit without this block, the sheet and the two scenario reports); fix; re-walk with `ONLY=`; GitHub's run green; the sheet's `Walk:` line; the walk-ledger row; the look card with the `?timing` link and the Copy-all question's mock-up.
- **Opening line:** "This is chat 164 — a hint: use the next free number in `main`'s `HANDOFF.md` when you start (164 at 14:15 on 24 Nov 26; chats 162 and 163 are live but not yet written there). First list the live chats (`ListAgents`) and say where you are. Work only in the worktree `C:/Users/User/projects/Raptor-speed`: `git -C C:/Users/User/projects/Raptor-speed switch claude/app-speed-readout-161` (if refused because another checkout holds it, stop and tell me), then `git fetch origin` and say whether `main` is ahead. Read `HANDOFF.md` there — the `claude/app-speed-readout-161` block under `## Now` — then the evidence sheet `raptor-port/docs/handpass/2026-11-24-timing-readout.md`, the two scenario reports it names, and the bug-check checklist from step 10. Run the WALK of the hidden timing readout as the block says, then the code read, fixes and re-walk, and bring me the preview link with `?timing` and the look card."
- **Rulings:** D2481–D2483 (how we work, §Order of work; homes: the plan document); chat 164: none · **Walk:** IN PROGRESS (chat 164) · **Reads owed:** the code read (Astra and a fresh, blind Opus) · **Next chat number:** 165 · **Model:** Opus 5.5, high thinking, for the walk and fixes (medium risk); Astra and a fresh Opus for the code read.
<!-- /now -->
## Next, in order

**HIS ORDER OF WORK (D2086, 16 Nov 26, changed 17 Nov 26 by D2186–D2188):** the multi-squadron and detachment design (answered whole, chat 104) → its BUILD now, in batches, before the database step, each batch's agreed design and mock-up shown to him first (`[MULTI-SQN-DESIGN]`; D2187, D2188) → the Tracker expansion with the Tracker's small fixes. Caps and ops limits (`[CAPS-OPS-LIMITS]`) PAUSED until he calls for it (D2186).

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three (all LIVE 9 Nov 26: Inputs, the scheduler, the Leave War — pull request 732) → step 6, the final measure, to him (done 9 Nov 26) → one follow-up (D1949, LIVE 10 Nov 26, pull request 735); each step on his "merge live" (D1737). Left: stating once what both the general page and a checklist state (D1762), later.

*(The "RIGHT NOW" lines of 6 Oct to 5 Nov 26, with his two words of 12 Oct 26 (D774, D775 — rulings in `how-we-work.md`) — all done, live or filed — are in `raptor-port/docs/archive/handoff-right-now-2026-11-07.md`, moved whole on 7 Nov 26; more of 13 to 20 Oct 26 in `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`.)*

0. **THE DATABASE COMES AT THE END (D473, 1 Oct 26 — replaces D354's "starts now"):** the app's features are built first; after
   phase 7 no more database-readiness work until then; the table list (`raptor-port/docs/data-model.md`) is kept up to date as
   each feature is added, and he — with his AI — writes the table format for the IT side to enter. `[WARN-HIDE-KEPT]` is BUILT, FULL-checked and MERGED (1 Oct 26, PR #478); `[INSIGHTS-WHICH-COPY]` (D477, D478) BUILT, WALK-checked and MERGED on his "merge live" (1 Oct 26, PR #479). *(Its next two, `[WORKSPAN-NEGATIVE]` (D483) and `[INSIGHTS-BOARD-DOOR]` (D481), are done and archived — checked 17 Nov 26.)*
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
3. Filed, none blocking: `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`); `[TRK-PINCH-ASK]`, `[LW-FROZEN-BAR-GAP]`, `[SAVE-NOTE-COVERS]` and
   `[TRK-REMOUNT-LANDING]` are done and archived (checked 17 Nov 26). Everything else: `OUTSTANDING.md`'s priority list.
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
