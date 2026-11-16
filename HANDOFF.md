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
<!-- now:claude/multi-sqn-design-r3 -->
### CHAT 92 — THE NIGHT OF 17 NOV 26 (overnight run, 12 h from about 01:15, Low)
- After a compaction: re-read this block, the overnight guide and the files of the step in hand before the next change; note the compaction here with its time, read from the clock (`date`).
- **His selection (17 Nov ~01:10):** "yes all as recommended … u can also run jobs 1-5 tonight on low", plus a job of his own (6). Read as: round 2's answers all as recommended (recorded D2102–D2111), the night's three questions as recommended (Q1 run the schedule's small fixes ahead of caps — yes; Q2 Escape closes the changes window — yes, D2112; Q3 start caps's design before round 2 — yes, moot now), Low: one helper at a time. Nothing merges; nothing on `main`. One notification at the end.
- **The night's order** (his own job first, the last job left if time runs short — about 12¼ h of work in 11):
  6. **Multi-squadron design review and walkthrough — his job, his words (17 Nov):** "could u take a look at your design for the detachment and sqn … is this design good … based on our design skill … does it affect other functions … is it user friendly … if 149 is going to be in the same home as 142, how does the user run through the interface to put these sqns in the same location … if the admin scheduler has to click twice to create a line, is that a lot more work? should we have that window open while the click happens multiple times until the admin closes the window by clicking outside it … but the user may also realise that the input they click is not in their view and the user keeps clicking, only to find out there's a lot of lines created … think thoroughly … how the user interface is like and show me mock ups of your design." Deliver: a round-3 questions page (Artifact, new) — a critique of the whole design by the design guide (§0, §3, §9 lessons, `/impeccable critique`), its ripple across the app (`raptor-port/docs/feature-impact.md`), end-to-end walkthroughs drawn on the real app (Admin → Squadrons: set 149's place to 142's home; a detachment opened, manned, closed; 142 joining 149's wave and adding lines; the signing orders), and his "+ Line" idea weighed (a card that stays open for repeated taps vs the risk of lines made out of view — e.g. each tap adds the line in view with the just-added ring and a count on the card, or a stepper "Add 3 lines") with a recommendation, today beside proposed, desktop and phone. Also the stale records the design lists (D201): the spec `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` updated with D2099–D2111. Branch: this one, `claude/multi-sqn-design-r3`; script `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/`, pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`. Check: one fresh Opus reader of the page against his words. Nothing in the app changes. ~2½ h.
  1. **Caps and ops limits, design round 1** — the four points D2084 left open, each with a recommendation and mock-ups on the real app. Branch `claude/caps-design-r1` from `main`. Check: one fresh Opus reader. Nothing in the app changes. ~2½ h.
  2. **The schedule's small fixes** — Escape closes the ALL AVAIL window and the changes window (D2112); the phone week's ALL AVAIL count checked, fixed if it opens the crew list; React Doctor's last two findings in the schedule's tap code; the rules check's unfinished checks (two old walk scripts, one end-to-end test, print and export walked). Branch `claude/sched-small-fixes` from `main`, its pull request opened once built. Check: WALK, one Sonnet walker, phone and desktop, the plain-user round; Astra and a fresh, blind Opus read. ~3 h.
  3. **Pictures for the schedule's held small fixes** (the standby "Illegal seat (no times yet)" words, "+ Block"'s "BB desk", the singular "warning", the look banner on two lines, "N changes" beside "N pending", the damaged week's notices, the missing "Original" entry, the late cut-off box) — a questions page kept until he says (D994). Branch `claude/held-fixes-pictures` from `main`. Nothing in the app changes. ~2 h.
  4. **The Tracker's small fixes prepared** — whether a cancelled medical input can exist today; pictures for the menus under the keys and the typed-student box. Branch `claude/trk-small-prep` from `main`. Nothing in the app changes. ~1½ h.
  5. **Stale backlog and handoff lines put right** — the list in the planning helper's report (scratch `overnight-plan.txt` §5; copied below). Notes only, waits for the morning. Branch `claude/stale-records-17nov` from `main`. ~45 min.
- **Stale lines found (job 5's list):** the priority list's batch of four and the rules check "waiting for merge live" (merged 14 Nov); [ONE-RULE-LEFTOVERS], [DOC-POINTERS-CODE] "awaiting merge" (merged 14 Nov); [CI-BROWSER-DEPS-DOWNLOAD] "main red, waits for merge live 761" (761 merged 14 Nov); [TRK-STANDALONE-LEFTOVERS] "archive once live" (merged, pull request 637); three Quals items "close once live" (merged 6–8 Nov); priority lines for [LW-MORE-BELOW-CUE] and [CSS-WRAPPER-GUARD] whose items are archived; [BATCH-14OCT-LEFTOVERS] ready to archive whole; [VEILED-WINDOWS-BAR]'s bar part looks built (D1645, pull request 636); the handoff's Next item 0 names [WORKSPAN-NEGATIVE] and item 3 [SAVE-NOTE-COVERS], both archived; the caps item "cancelled, wait for the owner" and the progress graph before caps in the priority line — D2086 superseded both.
- **Done before the night (this chat):** round 2's page (https://claude.ai/artifact/E3TMwG749ZYmxxJo1YggNS, version 4) — B1 redrawn after "so ugly" (D2099, look 2 chosen D2104), B7 dropped (D2100), A1 answered (D2101), B3 drawn in both signing orders and the join flow (pictures 10–12); all of round 2 answered (D2102–D2111). Pictures `raptor-port/docs/img/2026-11-16-multi-sqn-r2/`, script `raptor-port/docs/mock/2026-11-16-multi-sqn-r2/draw.mjs` (`pic5b`, `pic10`, `pic12`). A preview of the built app serves on port 4180 (stop it by port at the end).
- **The chat:** 75% full at 03:55, 17 Nov. The block was written here at a clean point; the app's own compaction comes about 96%.
- **Compactions:** one at 00:37, 17 Nov (just after the night's block was pushed and job 6's helper started); the block, the guide and the step re-read.
- **Progress through the night:**
  - Job 6 DONE 00:37–01:40: the round-3 page, https://claude.ai/artifact/JoPDDtnY2twJQpmesinuHF (version 1; source `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/page.html`, pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`, script `draw.mjs` there). The spec has a section for round 2's answers (D2099–D2111), and the file map is updated. The fresh Opus reader returned 17 findings (6 must); I confirmed three on the page myself, and all 17 were fixed in one batch. One was fixed differently: the board has no room after the mission, so the "142" badge sits inside the mission box on the board only, put to him as R2. The critique was one pass, no extra readers, on Low. Nothing in the app changed.
  - Job 1 DONE 01:45–02:30, on branch `claude/caps-design-r1` (from `main`, last commit 95f7bafb8). The page is https://claude.ai/artifact/9VQ2YL9CceeCZL6XgQRS4p (version 1; source `raptor-port/docs/mock/2026-11-17-caps-r1/page.html`, pictures `raptor-port/docs/img/2026-11-17-caps-r1/`). Also on the branch: the spec `raptor-port/docs/superpowers/specs/2026-11-17-caps-design.md`, the caps item's link in `OUTSTANDING.md`, and its priority line pointed to D2086. The fresh Opus reader returned 13 findings (8 must); I confirmed one picture myself, and all 13 were fixed in one batch, adding Q7 (published days) and Q8 (can members see who has done it). Notes only; no pull request opened at night, it waits for his look.
  - Job 2 BUILT 02:30–03:00 on `claude/sched-small-fixes` (from `main`, commit a3164107a); its pull request is to be opened next. Built:
    - Escape closes the ALL AVAIL window and the changes window (D2112).
    - The phone week's ALL AVAIL count was REAL: a finger tap armed the row instead of opening the window, 12 of 12 times in WebKit. It is fixed and pinned.
    - React Doctor's two findings in the tap code.
    - The two old walk scripts now look for D2003's and D2004's words, and an end-to-end test of "Full day of OIL" on a published Saturday was added.
    - 14 new unit cases, 13 red first. The full unit suite: 14,538 passed, 1 failed (a Leave War double-tap timing test that passed alone twice).
    - New: when Escape puts the keys back on the count, they wear the app's cyan keyboard ring (D1646). It was not drawn for him; it is named in the morning report for him to strike.
    - Evidence sheet: `raptor-port/docs/handpass/2026-11-17-sched-small-fixes.md`. Tier WALK, scenarios W1–W7, the plain-user round, print and export.
    - Pull request 794 opened 03:05; Auto-fix found off; its first run green (8bb07e571's run going).
    - WALKED 03:05–03:45 (one Sonnet walker, desktop 1536 and phone 402 by touch, WebKit and Chromium): W1–W7, the plain-user round, and print and export under D2005 all PASS. No console errors. Report and 142 pictures in `raptor-port/docs/handpass/2026-11-17-sched-small-fixes/` (`walk-report.md`, `img/`). I opened the phone tap and the ring pictures myself.
    - Not walked: a duty desk with ALL AVAIL (the drag did not land), the phone's keyboard Escape, a real iPhone (synthetic touches only).
    - The walk's lead, reproduced by the builder on this branch AND on `main` (old, not ours): the schedule's input window, with Remarks typed, closes on Escape or ✕ without "Close it and lose them?". On the Inputs page it asks. The code asks only on the Inputs page, and a code comment says the schedule's window was meant to close at once. To file as a question for him (does D1622 cover the schedule's input window?), with job 5's notes.
    - READ 04:00–04:12. Astra (gpt-6-astra): 4 must. The fresh Opus reader: 1 must, 2 should. Saved in the sheet's folder as `read-astra.md` and `read-opus.md`. Merged into a fix list A–F, sent to the same builder 04:15:
      - A: a newer menu (☰, the phone Insights ⋯, the phone more menu, the board's more menu) loses Escape to the window under it.
      - B: an armed seat keeps Escape after the window is pressed.
      - C: the window order lacks both windows (the OIL answer list jumps ahead).
      - D: the keys go back to the first count.
      - E: ✕ leaves the window "in front".
      - F: stale text.
    - FIXED 04:15–04:45, commit c96154e0d: A–F all fixed red-first, 10 new cases (10 red on 8bb07e571, now 24 of 24). 86 Escape-related test files: 2,407 pass. Build, lint, docsize and rulecheck OK. The run on 8bb07e571 was red on the code check (18 notes in the walk's own scripts); the builder kept each with its reason. The sheet's §6, §9 and §10 are filled. The "seen mirrors strays" tidiness note is still to file.
    - **Job 2 DONE 04:45**, branch head a9cf5d591 (records only). The run on c96154e0d was green: 22 of 22, the code check included. The run on a9cf5d591 was still going at 04:45; read it in the morning. Filed: `[INPUT-WIN-SCHED-ASKS]` (his question) and `[SCHED-SMALL-TIDY]`. `[ALLAVAIL-ESCAPE]`, `[CHGWIN-ESCAPE]` and `[WEEK-AA-CHIP-PHONE]` are marked walked, read and re-walked, waiting for his iPhone look and "merge live". The sheet is complete, with its Walk and Reads lines, and has a ledger row.
  - Job 3 BUILT 04:35–05:20 on `claude/held-fixes-pictures` (from `main`, commit d9b5ad0cb). The page is `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, with 37 pictures in `raptor-port/docs/img/2026-11-17-held-fixes/`, and is linked from the six backlog items. Each of the eight items is drawn with a recommendation:
    - "+ Block"'s "BB desk" is not a fault: close it.
    - The late cut-off box is drawn two ways.
    - Parts of the damaged week are parked: print and export with D1644, the "older version" refusal, the Leave War part.
    - **DONE 05:35** (commit d99ec53cc): all 37 pictures opened. 16 desktop pairs were cut to their subject (D1222), and one tag moved off a heading.
    - The page is kept until he asks (D994): it is not published to him tonight, only its link given in the morning.
  - Then job 4 (the Tracker's small fixes prepared), on `claude/trk-small-prep` from `main`.
    - RE-WALKED 04:20–04:30 (Sonnet): R1–R4 and R7 PASS, no faults. R5 (the holiday OIL list) could not be raised in the demo and is carried by its test. R6 was pressed only as variants. Report: `rewalk-report.md`. The builder is closing the records (04:35): the sheet's remaining parts, a ledger row, `[INPUT-WIN-SCHED-ASKS]` filed as his question, the tidiness note filed, push, then the checkout back on this branch. After that, job 2 is DONE (pull request 794, waits for his look and "merge live"), and job 3 starts.
    - (Kept:) the re-walk covered:
      - ☰ and each ⋯ menu over each window, at 820 wide and phone width;
      - an armed seat, then a press on the window, then Escape;
      - count A, then count B, then Escape;
      - the holiday OIL list, then ALL AVAIL, then History, then three Escapes;
      - an input's window, then ALL AVAIL closed by ✕, then Escape.
      Then the sheet's §4, §7, §8 and closing lines, a walk-ledger row, and the run on c96154e0d read green. Then job 3.
    - (Earlier plan, kept for its brief:) Astra's read (the codex CLI, read-only, `-m gpt-6-astra`; brief per `raptor-port/docs/codex-guide.md`) and a fresh, blind Opus read, each blind to the walk and to each other. Then fixes (the same builder), the re-walk of what they touch, and the evidence sheet's sections 4, 7–10 and the closing lines filled, with a walk-ledger row.
  - Round 3's page republished (version 2): its worked-example boxes take a light tint in place of a side bar, after the design check.
- **Questions waiting for him:** round 3's page, Q1–Q7 and R1–R3, each with its recommendation. Q5 recommends moving "+ Line" to the wave's foot, which would change D2106's "stays as today". Q6 names the clash between D2089 and D2105. The caps page, Q1–Q8 and R1–R4, each with its recommendation, plus the platform flag: answers checked in the app can be read by anyone who knows how, and the way to check them out of sight is a question for the IT side.
- **Also waiting:** chat 91's three skill notes (957–959) on `claude/skill-notes-chat91`, his "merge live". His real schedule pictures hold real names — never in the project; the caps example's public link is never written into the repo.
- **Rulings:** D2099–D2112 recorded → the scheduler's page · **Walk:** job 2 walked twice (the first walk, then the re-walk after the reads' fixes), desktop and phone, all PASS, 211 pictures, `raptor-port/docs/handpass/2026-11-17-sched-small-fixes/` (jobs 6 and 1 are drawings only) · **Reads owed:** none yet · **Next chat number:** 93 (D1744)
<!-- /now -->
## Next, in order

**HIS ORDER OF WORK (D2086, 16 Nov 26):** the multi-squadron and detachment design, design only (`[MULTI-SQN-DESIGN]`) → caps and ops limits with the schedule's small fixes (`[CAPS-OPS-LIMITS]`) → the Tracker expansion with the Tracker's small fixes → the multi-squadron build last, at the database step.

**RIGHT NOW (7 Nov 26):** the rules diet (`[RULES-DIET]`, plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §7) — step 1 LIVE (pull request 656) → step 2 LIVE (pull request 657) → step 3, reading by section, LIVE (pull request 658; re-measured: about 7% of a job's read) → step 4, the every-chat layer → step 5a, the small areas, OIL first → re-measure and report to him → step 5b, the big three (all LIVE 9 Nov 26: Inputs, the scheduler, the Leave War — pull request 732) → step 6, the final measure, to him (done 9 Nov 26) → one follow-up (D1949, LIVE 10 Nov 26, pull request 735); each step on his "merge live" (D1737). Left: stating once what both the general page and a checklist state (D1762), later.

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
