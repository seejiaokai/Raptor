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
<!-- now:claude/rules-diet-step-5a-design-9bc219 -->
### CHAT 24 — the rules diet's step 5a, the screen-design rulings as a page — BUILT, waiting for his "merge live" (pull request 708); written 8 Nov 26 — verify before use
- **Built:** `.claude/rules/decisions/design.md` is a page, "Screen design — how it works now" (D1735): its 74 rulings stated by topic, a "Settled" section and 35 pointers to other areas, found by subject; its tripwire in `docsize.mjs` raised 23,700 → 46,300 bytes (the page 42,087, about 15,700 tokens) — a script change, so it waits for his "merge live" typed in this chat (D1737). D349 marked NARROWED by D854, the scheduler's D475 by D1792 (D201). The account by requirement (73 rulings, 509 parts, 17 gaps fixed) and the two blind reads (Astra 7, a fresh Opus reader 10 — all held, all fixed): `raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-design-*.md`; the reads compared and the lessons for 5b: the plan's §Step 5a — Screen design. No reads owed. On his PC: the document check and the rule check OK; the 15 unit files that read documents run before the merge.
- **On his "merge live":** the four merge-lock steps (`.claude/rules/shipping.md`), `main`'s run and Vercel's Production READY; then a notes-only records follow-up (this block MERGED, the `[RULES-DIET]` line, the plan's heading), merged by the same steps once green (D1407).
- **Left open (on `[RULES-DIET]`'s line):** the Inputs pages' D1300 "cyan ring" and the scheduler's D1038 "Not built", for their pages in 5b; the page loads with every file of the app's code, so the re-measure before 5b counts it. Chat 17's block (People & accounts, merged, its residue on the same line) removed here.
- **Rulings:** none in chat 24.
<!-- /now -->
<!-- now:claude/pr-sched-marks-3205d7 -->
### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — MERGED 8 Nov 26 on his "merge live", typed in this chat about 15:35 (pull request 691); written 8 Nov 26, about 15:40 — verify before use
- **Built** (an Opus builder helper, reviewed by the host): the waiting mark on an Unavailable row (D1784); the unreadable week's notice and grey refusal (D1785); the drawn eye and Reset arrow (D1792 a, d). Brief `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-build.md`. **Pull request 691** into `main` (Auto-fix off, D1090).
- **Checked — the sheet is CLOSED:** `raptor-port/docs/handpass/2026-11-08-sched-marks.md` (§1–§15, the roll-call's 27 rows, every reader's claim and its disposition, the `Walk:` line). Four walkers on `b8011e768` and the re-walk W4 on `9d330d50c` (17 PASS, 0 FAIL — `…/parts/2026-11-08-sched-marks-w4.md`); the host opened every deciding picture. The three final reads and the narrow re-read: every finding fixed red first (`9d330d50c`, `26aa4de19`); the host's last look at the re-read's fix on the build with `main` in (`scripts/handpass/sm-host-f3.mjs`, pictures `…/host/f3-*`): Hex's "taken out" line stands still. The drawing check 15 of 15 on `9d330d50c`. The walk ledger's row added; the file map's line updated; skill notes 887, 888.
- **`main` brought in** (`32e9b096d`, about 14:45): the pull request had gone into a clash (three notes files — the handoff, the file map, the screen contracts; both sides kept), which is why the pushes of `6371020a9` and `26aa4de19` started no GitHub run. The build passed with it (the checks lock); frozen `<scratch>/dist-sm3`.
- **Merged** on his "merge live" ("merge live dont clash with the rest"), typed here: `main` brought in a third time (only this file clashed — chat 17's block kept), GitHub's run green, then merged under the merge lock after the level check, one at a time. **Remove this block at the next handoff** once its filed items (below) are carried; the questions for him stay with chat 21.
- **To put to him** (none blocks the merge): whether an Unavailable change's mark should also show in OIL Earn (Opus reading b); whether the older-version refusal should also say "Report it with "Report a problem"…"; whether "this week's saved copy" reads right when the week refused is another, stashed week (Opus reading d); the Leave War's own "on a locked week" words; the section side-bars the design check flags (`04-pucks-sections.css`, not this job's lines).
- **Filed:** `[DAMAGED-WEEK-LEFTOVERS]` (point 5 added — the Leave War's pending bid on a damaged date); `[SCHED-MARKS-WALK-ODDS]` (new — the changes window's foot over a still line, the phone board's banner on two lines, "2 warning", the "N changes" chip). Tidiness notes: the readers' reports. Still unchecked (older): the ✕'s keyboard ring and Enter on ✕.
- **Rulings:** none this session (D1820–D1829 unused). **Reads owed:** none (Astra read; Sol 6.1 in the second seat inside D1743's window; the fresh Opus read beside them). **Context:** about 77% at this save; compacted four times (about 13:20, 13:30, 14:00 and 14:40 on 8 Nov 26), each time the state re-read from this block. Chat 11's and chat 18's work is in through `main`; no overlap with either.
<!-- /now -->
<!-- now:claude/chat20-answers -->
### CHAT 20 — the Tracker's small batch MERGED (pull request 696, 8 Nov 26, on his "merge live"); this branch `claude/chat20-answers` carries his answers' records; written 8 Nov 26 — verify before use
- **Started by chat 3** on his "Start both"; reports to **chat 21, the coordinator** (`local_242a19d5-…`). Compacted 8 Nov 26 about 16:00, after the merge; the state re-read from this block.
- **Live (merge commit `41b264227`, under the merge lock, level, its run green):** D1860 (the course delete's question and the import's deleted-course note without ↺ ⇅) and [TRK-KEPT-COPIES] (the Tracker's pencil, Reorder, gear, Reset and list the app's own icons; its page colours linked to Raptor's). Evidence `raptor-port/docs/handpass/2026-11-08-chat20-tracker.md` (the `Walk:` line there). Chat 21 told; the merges it held for 696 released by it.
- **This branch — notes only, to `main` by itself once green (D1407):** his answers of 8 Nov 26 to the questions page https://claude.ai/artifact/RL8hZp77xYhRYcBS1a8cay — **D1900** (the Tracker's magnifier the app's own, `tracker.md`) and **D1901** (a "Not kept" band under the top bar in a browser that keeps nothing, `design.md`); D1660 spent and archived; the builds filed in [TRK-KEPT-COPIES] (left open for the magnifier) and [TRK-NOSTORE-SAVED] — one job, not started; [TRK-POP-ASKED] archived.
- **Next:** (1) the Production deployment for `41b264227` Ready on Vercel (the branch's last preview hung on "deploying" — if Production does too, tell him, his Vercel page); (2) this branch: `npm run rulecheck` and the doc-reading unit tests, push, a pull request into `main` (Auto-fix off, not watched), merge it once green under the merge lock; (3) delete the stale remote branch `claude/chat20-records` (an older copy of these records); (4) tell chat 21 and him; remove this block at the next handoff.
- **Filed, open:** [TRK-MARKS-LEFT], [TRK-MENU-KEYS], [TRK-COPIES-TIDY].
- **Rulings:** D1900 → `tracker.md`, D1901 → `design.md` (D1902–D1909 free).
<!-- /now -->
<!-- now:claude/coordinator-2 -->
### CHAT 30 — coordinator (took over from chat 21, 8 Nov 26 ~16:45) — verify before use
- **Taken over:** chats 16, 26, 27, 28, 29 told ~16:45 that they report to chat 30 (`local_242a19d5-fb7e-45dc-aea3-ddffcd800a46`). This branch's notes-only pull request merged by itself once green, no other merge in flight.
- **Chat 26 handed off at 80% full** with the first half of 702's full check done (GitHub's checks green, break tests done, Astra's scenarios saved, no fault found); its opening line named "27", already taken — its successor is **chat 31**, "31 · React Doctor's last findings — the walk and the reads", on `claude/chat22-rd-last-findings`, reporting to chat 30; he starts it. Next free number after it: 32.
- **Live today:** the whole pictures round (D1780–D1793) — group 3, the schedule's marks and words, merged 8 Nov 26 ~16:25 (pull request 691, his "merge live" in chat 13); the Tracker's small batch (696; records 704: D1900, D1901 to build); chat 3's notes (695) and this chat's first block (701).
- **Chats in hand** (as chat 21 left them; the app still sends turn notes from 27–29 to chat 21, their starter — read them with the session tools): chat 16, the Leave War pinned row (`local_c39c4aec-e234-4148-bfa0-426d0ba8b1ad`, 694 — his iPhone look of https://raptor-git-claude-lw-pin-last-frame-kai-e2f5.vercel.app, then "merge live" in chat 16); chat 26, React Doctor's last findings' full bug check (`local_31dc360d-fae6-49c0-b6e5-92f7b8f1ef52`, 702; count 421 → 402); **started by him ~16:35 from chat 21's cards:** chat 27, the checks job's two reads and merge (`local_ff7279e1-80fc-4fde-bc7c-cef3d71e4216`, on `claude/chat19-checks`, 698; with the rule check's "Q11 now covered" one-line tidy); chat 28, the Tracker's magnifier (D1900) and "Not kept" band (D1901) with [TRK-COPIES-TIDY] (`local_cefe68ae-44c0-4220-9a3c-5e4d598ef7f6`, rulings D1910–D1919); chat 29, Inputs and Medical — [MED-ROOM-DRAGGED], [INP-ROOM-TIDY], React Doctor's 8 in `MedicalView`, `DateCal`, `CutFields`, `TypeLegend` (`local_ec145054-fa8b-4261-b750-6a6cb1112e75`, rulings D1920–D1929). Not this chat's: chat 24 (the rules diet's design page, from chat 23).
- **Next to offer him, once free:** the board's two small faults ([BOARD-UNDO-SAME-DAY], [BOARD-TAB-MENU-BUTTONS], React Doctor's 2 in `interactions.ts`) — the board is free now 691 is in; [LW-FULL-EDITING] (his D1724, drawn first) once chat 16 is done. Left out on purpose: rulings-file jobs while the rules diet runs; `SansCal`/`SansDay` (D610); [TRK-MENU-KEYS] (a new look — drawn first, D1625); [REPO-TIDY] until today's chats finish.
- **Merging:** each chat asks him to type "merge live" in it; the app refuses a relayed word. When one has his word, ask the others to hold merges into `main` (done for 696 ~15:50). The app pauses a chat's messages to other chats after 10 in a row until he types in it. Walks: one at a time through his PC's checks lock.
- **Chat numbers (D1744):** 23–26 went to other chats' successors; 27–29 to his starts above; the next free is 30 (this handoff) — read the open chats' titles before naming one.
- **Open:** the compaction guard back to `--back` when he is back. The skill-notes log: 128 open, last reviewed 27 Oct 26 — a review offered, a job of its own. Skill notes 889, 890 (chat 21) ride pull request 702. Weekly allowance 63% at ~16:00, resets Mon 9 Nov 26 ~19:00 (D1033: his aim is to use it).
- **Rulings:** none in chat 21; none in chat 30 so far.
<!-- /now -->
<!-- now:claude/m365-it-answers -->
### `claude/m365-it-answers` — chat 4 (D1744): the IT side's written answers folded into the database plans — MERGED 8 Nov 26 (pull request 662, on his "merge live"); written 8 Nov 26 — verify before use
- **Where it started:** `main` at `9b42a96b6` (chat 1's pull request 661 merged). Notes only, no app change: the IT side's written reply of 8 Nov 26 to the 12 questions (no names, on D1748) in `OUTSTANDING.md` [IT-QUESTIONS] — with pointers in [DB-SECURITY-ROLES], [AIRCRAFT-TYPE-SETTING], [MULTI-SQN-DESIGN] — and folded into `raptor-port/docs/data-model.md` (head note, Attachment, Squadrons, §9 rule 8 and the change log, §11, §12), `raptor-port/docs/handover-dataverse.md` and the M365 move plan (head, points 2, 19, 24, 35, 36, §4, §5, §Platform flags). Chat 1's block was removed (its work merged); its open points are below and in [IT-QUESTIONS].
- **What the answers say, short:** our `tables.json` in their kit's format is accepted; the PP CoE has ONE production environment for code apps, sets the short code and builds from our final `tables.json` (his test tables are for testing only — D1749); access is one security group, and who may do what is the app's own roles, not the database's; only M365 services (Power Automate, Teams); large files in SharePoint with a link; flows run by themselves under a unit role-based account; auditing is on. Answer 2 (pasted after the rest): a simple "who is editing" field, cleared once saved, not a hard lock — he sent it again as his own answer: **D1751** (replaces D450; what D450 left behind fixed in this branch). Unique keys and change tracking "not sure".
- **Waiting on:** (1) **another IT person's answers** (he said so, 8 Nov 26) — pull request 662 merged without them, on his "merge live" of 8 Nov 26; when they come, a new chat folds them in on a fresh branch from `main`, the way this chat did; (2) D1101 (a database per aircraft type) meets one environment — recommended: no change now, the F-15 squadrons first, settled when a second type joins; he asked how another squadron's different rules would work — answered: each squadron's rule settings are its own rows, and one code base picks each type's quirks by its aircraft-type setting (D1100), so either choice handles it; (3) D1653 (security roles IT enters) rests on database rights the IT side keeps — recommended: follow their advice, the app's own roles. Next free ruling number D1754, every branch checked first.
- **For IT, when he likes (D1745):** a version 3 of the questions, 6 short ones, kept with the package on his PC (`Questions-for-IT-v3.txt`), never in this project.
- **On his "merge live"** — the D1746 merge-lock steps, each command whole on one line, the Bash call's timeout 600000: (1) `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs take "claude/m365-it-answers — merge <PR>"`, going on only once it prints `gatelock: taken`; (2) `git fetch origin main claude/m365-it-answers`, then `git merge-base --is-ancestor origin/main origin/claude/m365-it-answers && echo level || echo behind` — behind: release, and once no run of the branch is going (D151) bring `main` in, wait for that run to pass, start again at (1); (3) level and green: `gh pr merge <PR> --merge`, never `--auto`; (4) release only a lock you took: `RAPTOR_GATE_LOCK='C:/Users/User/.raptor-merge-lock' node raptor-port/scripts/gatelock.mjs release`; then confirm `main`'s run.
- **Next:** nothing is built before the database step (D473, D1682 — his test account is not ready). At that step (D1749): the app and its tables first into his test account, built with the IT side's kit, set up to match theirs (one security group, no outside connectors), and there proved: a fixed id refused twice, the version check on a save, the change log read without change tracking, SharePoint from the app; then the table list to IT.
- **Chat numbers (D1744):** this is chat 4; 5 to 14 were taken by later chats — read the open chats' titles for the next free one.
- **Rulings:** D1751 (the day lock a simple mark; D450 replaced and archived); D1752 (Admin → Data's "Clear edit history…" removed at the database step; D351 replaced and archived; filed under [DB-STEP]); D1753 (his test tables use the short code "talon" for now; question 1 of version 3 reworded to tell the IT side) — each short line read against its full row by a fresh reader (D138), D1752's corrected on that read. Compacted once, 8 Nov 26.
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
