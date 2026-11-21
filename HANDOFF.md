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
<!-- now:claude/lw-monthjump-click -->
### CHAT 112 — fix read 4's claim 5, the Leave War month landing (19 Nov 26, started by chat 111) — verify before use
- **Branch** `claude/lw-monthjump-click`, cut from `claude/multi-sqn-b1-107` at `8b6054569`; no pull request into `main` (chat 111 brings it into pull request 806); never merged here.
- **What changed:** a click or key anywhere on the page no longer ends a month jump's landing — only the person's own sideways scroll does (a scroll away from where the grid's own last write left it, a sideways wheel over the grid, its scroll bars; a phone's touch as before); and the landing rounds down on the screen's own dots, so at a 125% screen it no longer sits 0.275px under the frozen column. Files: `leavewar/ui/reanchor.ts`, `Matrix.tsx`, `reanchor.test.ts`, `e2e/leavewar.spec.ts`, `docs/file-map.md`.
- **Red first:** the two new desktop browser tests (1536 wide; a real 125% scaling) failed 6 of 6 on the old grid (the first day 0.6px under, or 1.3px clear, after the click) and pass on the fix. A phone flick test pins the phone's side (it passes with the touch clearing removed too — the flick's own scroll ends the landing; the unit tests hold the rule).
- **A second, older race fixed with it (not reproduced on demand):** one run in 280 of the month tests left the grid on September after MAR was pressed — the row window notes the first day in view at rest and redraws a task later; a month pressed in between was undone by that redraw. `jumpTo` now re-takes a waiting note at the jumped day. After it, the month tests 280 of 280 (both sizes, 20 times each).
- **Checked so far (19 Nov 26, ~13:40):** the month tests 20x as above; `reanchor.test.ts` + `colwindow.test.ts` 30/30; `matrix.test.tsx`, `monthstrip`, `monthview`, `matrix-rows`, `matrix-rows-memo` 73/73; the build (served by every browser run); docsize OK. Tier by the eight questions: all NO (scroll position only, nothing saved, no new control) → LOOK; the job's brief asks more, done below.
- **Done after that (~14:30):** the whole Leave War browser file 466 passed, 0 failed; the short walk at 1536 and iPhone 402 (pictures `raptor-port/docs/handpass/2026-11-19-lw-monthjump-click/`, sheet beside it); both blind reads of `ae4c632a3` (reports `…/briefs/2026-11-19-lw-monthjump-click-{astra,opus}.md`). Fixed from them in the third commit: a scroll between a redraw's note and the redraw is the person's and kept (`reanchorPlan`, Astra 1, Opus F3); a trackpad's downward swipe no longer ends the landing (Opus F1); the "on the edge" test within one screen dot when zoomed out (Opus F2). Not re-read by a reader — a fresh read of the third commit is owed if he wants one (reads-owed list, his call).
- **After the readers' fixes:** the month tests 10 times each, both sizes, 140/140; the whole Leave War browser file 466 passed, 0 failed; `reanchor.test.ts` 12/12; docsize OK; the code check could not compare against `main` here (GitHub's run decides). Pushed; chat 111 told the last commit. **Job done** — nothing left but chat 111 bringing the branch into pull request 806.
- **The steps as they were planned (all done):** (1) the whole Leave War browser file under the checks lock (`E2E_PORT=4191 node scripts/gatelock.mjs exec "<branch> — LW file" -- npx playwright test e2e/leavewar.spec.ts`; known unstable phone test [LW-APPROVALS-PHONE-FLAKE]); (2) the short walk: `e2e/zz-walk-leavewar.spec.ts` (NOT committed — delete after; pictures to `raptor-port/docs/handpass/2026-11-19-lw-monthjump-click/`), run with `--project lw-desktop` and `--project lw-phone`, open every picture; (3) the two blind reads of the branch head with the brief `raptor-port/docs/superpowers/briefs/2026-11-19-lw-monthjump-click-read-brief.md` — Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check -C <export> -o <report> "<brief>"`) and a fresh Opus subagent, each on an export (`git archive <head>` into the scratchpad, plus `FIX-DIFF.patch` = `git diff 8b6054569 <head> -- raptor-port/src raptor-port/e2e`; skip `git init` — it hung 15 min on this repo); save both reports beside the brief; reproduce every finding red first; (4) `npm run lint:changed`; (5) push, tell chat 111 (`local_94537a74-b132-4f15-8cdc-3c3374ff2fba`) the last commit; report to him plainly. No pull request; never merge.
<!-- /now -->

<!-- now:claude/multi-sqn-b1-107 -->
### CHAT 129 — the multi-squadron reshape's phase 2, carrying on chat 128; written 21 Nov 26 — verify before use
- **Where it started:** chat 128's opening line; chat 128 answered that it had handed off (no helper running, the folder and the lock free). This chat works in `C:\Users\User\projects\Raptor-msq` on the branch.
- **Shipped (on this branch):** his D2250's build (`6b3fda53c`): R7's refusal (`state/accounts.ts updateAccount`) and the gate's R7 line removed; the gate's member's drop added (`state/perms.ts accountMadeMember` — a Plan row removed beside the same account made a member passes whoever makes it, Plan rows only; who may change the account is still the account-row line's, the squadron the last-admin lock's); `state/piece-b-tables.test.ts` R7 and `state/reshape-r1-r7-words.test.ts` R7 rewritten red first, with a forged-command case (the View half proven red without the Plan-only test). Then rule 4 of the restore's one body (`57708aa04`, `perms.ts restoreLeavesOut`): a Plan row is put back only by a master admin's restore — found by running D2250 through Undo: Ranger's Undo of making Hunter a member was offered ("Hunter’s role"), then failed "That couldn’t be completed just now."; with the leave-out wired (helper "undo & roles" pass 2) it gives back the role only. The agent's reading of D2199 — to tell him. Pass 2's items (`54fc55384`): `raptor-port/docs/superpowers/briefs/2026-11-21-msq-reshape-phase2-helpers.md`, "undo & roles", second pass.
- **Running when written:** helper "undo & roles" pass 2 — an Opus helper (high) in its own worktree under `C:\Users\User\projects\Raptor\.claude\worktrees\agent-*`, branch `claude/msq-b1-undo2` from `54fc55384`: (1) the planning record's per-record store; (2) Piece B's restore lines, D2250's Undo with them, F11-4 green; (3) A7's `restoreRefusal` line; (4) a Quals change worded by the man's squadron's columns; (5) an own-page step's Undo while another squadron is picked. If this chat ended before its report: look for that branch (local or pushed); a helper's work not committed is lost — run the pass again.
- **Pick up here:** on the helper's report — host-check each proof (restore only the changed source files to the commit before: red; back: green), merge `claude/msq-b1-undo2` here, run its files, the four source scans and `npx tsc -b`; then "own pages" item 4 as one Opus helper (the brief's item 4); then phase 3 (core: the contract, R6, A4, B2's removal, the documents step; session: the midnight switch on, the band) and phase 4 (the four-reader fix read, the walk, the sheet, his look). All under `OUTSTANDING.md` [MSQ-FIXREAD17-OPEN].
- **Gates:** GitHub's run on `6b3fda53c` started at the push, not read when written; `57708aa04` and `54fc55384` local (the push guard held them while it ran). On his PC after D2250: the account, permission and multi-squadron unit files (42 files, 448 tests) green, `npx tsc -b` clean; after rule 4: its table test and the four source scans (5 files, 40 tests) green, `npx tsc -b` clean.
- **Open questions for him:** none waiting. To tell him (no answer needed unless he objects): D2250's Undo gives back the role only, a master admin's Undo the Plan too. Told by chat 128, no answer needed: the q6b-149 drawing departure and C6's "Blocked:" opening.
- **Carried from chat 128 — for the fix read (named, not findings):** war rewrote `multi-sqn-fixread16` Fable 2 to D2243 Q3 (the join gone; Ranger now told twice, once a leave — confirm right); session keeps the plan's kept copy updated in place on commit (not dropped) and `stripGoneFrom` takes notes; undo's Opus 7 case runs as the master admin and asserts the timeline's refusal (the Undo list clears at sign-in), Opus 5 with an award given then deleted, its midnight swap made by hand; schedule's reading that a master admin is always offered in SKED CK/PLANNED BY/APPROVED BY (D2245); own pages' cut-off window edits the squadron of the page it opens from (default the pick, so Logic is unchanged); and chat 129's member's drop at the gate (`perms.ts accountMadeMember`) with rule 4 of `restoreLeavesOut`. Chat 128's whole unit suite (first five merges): 15,461 passed, 3 failed (F11-4 and two double-tap timing tests that pass alone), 20 skipped.
- **Opening line:** "This is chat 130 (check the next free number across the open branches' `HANDOFF.md`). First list the live chats (`ListAgents`; where this chat has no such tool, say whose the folder is cannot be checked, and take the worktree below) and say where you are: `git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not. If a live chat already holds this job — the block's writer, or one opened with this same line — message it before any heavy read. If that shows changes you did not make, or another live chat works in this folder, do not switch branches here: a continuing one `git worktree add C:/Users/User/projects/Raptor-msq2 claude/multi-sqn-b1-107` (the branch itself, never detached, so its commits land on it), and works only there; make one write there first, and if the file tools refuse it (a chat started in a worktree may not write into another), stop and tell him. Otherwise work in `C:\Users\User\projects\Raptor-msq` only (`git -C` it): `git fetch origin`, `git switch claude/multi-sqn-b1-107`, `git branch -u origin/claude/multi-sqn-b1-107`, `git pull --ff-only`. Read `HANDOFF.md` — the `claude/multi-sqn-b1-107` block under `## Now` — then the reshape plan `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` (§3.2 A-ii, §10) and the phase-2 brief's last two sections, and carry on from the block's "Pick up here"."
- **Rulings:** chat 129: none (D2250 built; rule 4 the agent's reading of D2199) · **Next free ruling:** D2252 · **docsize:** OVER by 6 on `OUTSTANDING.md`, deferred (D29) · **Walk:** not yet (FULL — sized at phase 4) · **Reads owed:** as chat 126's (unchanged) · **Next chat number:** 130 · **Model:** Opus 5.5, high thinking (his D2244: Opus builds)
<!-- /now -->

<!-- now:claude/skill-notes-review-0c3a78 -->
### CHAT 121 (carrying on chat 120) — the skill-notes review of 20 Nov 26 (his "u can do the skills notes log review in a separate chat"), started from chat 118 — rewritten 20 Nov 26 by chat 121: MERGED (pull request 815, on his "merge live", live on Vercel) — verify before use
- **Branch / PR:** `claude/skill-notes-review-0c3a78` — pull request 815 MERGED 20 Nov 26 on his "merge live", main's checks green, the Production deployment Ready; the branch restarted from `main` with one commit held back from the merge (a line under skill note 982), in a pull request of its own. Push only by `git push origin HEAD:refs/heads/claude/skill-notes-review-0c3a78` (no upstream).
- **What:** 69 OPEN notes — `main`'s 57 and 12 held only on open branches (939–943 on `claude/rules-check-small-batch`, 975–981 on `claude/multi-sqn-b1-107`, copied to `_review/branch-notes.md`). Holding folder `.claude/skill-updates/2026-11-20/` (method: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo).
- **Done:** four helpers sorted and drafted (tables `_review/dispositions-*.md`, reports `_review/report-*.md`; `_install/check-dispositions.mjs` OK: APPLY 54, FILED 9, MEMORY 2, REFLECTED 2, OPEN 2 — 120, 122 deferred, D73). His answers in `_review/answers.md`: all four rounds "yes", as recommended (D2230). The overnight draft's compaction figures moved to D2229's.
- **Done in chat 121:** the cross-file texts placed (BCO §4 980/978, TDD 928, subagent-driven-development 931, SUPERPOWERS-VENDORED change 8); the [CHECK-TOOLS-HARDEN] additions lettered (s)–(z) after its (r) and merged into `_docs/OUTSTANDING-items.md`, memory into `_memory/additions.md`; `_review/dispositions.md` merged (982, logged mid-review, left OPEN); both blind reads run — Astra REVISE 9, fresh Opus REVISE 12 (`_review/read-*.md`); every finding fixed (`_review/fixes.md`); `_install/install.mjs` written (re-appends 939–943 and 975–981 as the reviewed side, D78); its rehearsal passes the document check.
- **Installed on his "Approve" (D2231):** 14 guides updated; 67 notes ACTIONED, the 12 branch-held notes appended with their numbers (none taken); 158 notes resolved on 10 Nov 26 moved to `.claude/skill-observations/archive/log-2026-11-20.md`; the backlog additions applied (two new items, five additions; its tripwire 2660 → 2830 with its reason); three memory notes extended; the holding folder deleted (D69, kept in git). Open: 120, 122 (parked, D73), 982.
- **Pick up here:** the small pull request with note 982's line waits for his "merge live" (the skill log is not on the notes-only list); then this block is removed at the next handoff. When the branches holding 939–943 (`claude/rules-check-small-batch`) and 975–981 (`claude/multi-sqn-b1-107`) bring `main` in, their log copies of those notes are duplicates: keep `main`'s (D78).
- **Rulings:** chat 120: D2229 (compact at about 600,000; pull request 814 merged), D2230 (the four rounds) → `how-we-work.md`; chat 121: D2231 (his final approval of the fixed drafts) → `how-we-work.md` · **Model:** Opus, high · **Next chat number:** 122 · **Next free ruling:** D2232.
<!-- /now -->

<!-- now:claude/multi-sqn-batch-plan-106 -->
### CHAT 106 — the multi-squadron build's batch plan, red-teamed; batch 1's page put to him; written 17 Nov 26 — verify before use
- **Branch / PR:** `claude/multi-sqn-batch-plan-106`, notes only (the plan, two red-team reports and their brief, batch 1's page and pictures, the backlog, this file) — merges by itself once green, after `npm run rulecheck` and the document-reading unit tests on his PC (`shipping.md`).
- **Done:** (1) **The batch plan** `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`: 1 squadrons foundation → 2 detachments → 3 borrowing and shared waves → 4 Transfer to Sqn and Post out from Admin → Users → 5 the whole-app check. His opening order had transfer 3rd and borrowing 4th, "unless the reading shows a better one": swapped, recommended, put to him as point 1 (a transferred man's old lines make him a borrowed man, which only shows and is checked once borrowing exists). Knock-ons go with the batch that causes them (§1). Batch 1 in detail: §3 (agreed lines, open points O1–O8, the architecture §3.4, steps §3.6 — steps 0–4 may be a first pull request, 5–6 a second). (2) **Red team, his call: Astra and a fresh, blind Fable reader** (Fable on his word) — brief `…/briefs/2026-11-17-multi-sqn-batches-red-team.md`, reports `-astra.md` (5 HIGH, 1 MED) and `-fable.md` (5 HIGH, 7 MED, 5 LOW); both upheld the order and the swap; every claim checked against the code and folded in — table in the plan §9 (OIL read from the home squadron's own days, never the schedule in view; inputs asked for by squadron; the Tracker's and the Leave War's whole worlds per squadron; one identity for a squadron's records end to end; sign-out reloads; one DET per man; a man's hours, rest and OIL across schedules in batch 2). (3) **Batch 1's page** https://claude.ai/artifact/1464QnHx85Dwcd63fWH46x (`raptor-port/docs/mock/2026-11-17-multi-sqn-b1/page.html`, pictures by `draw-b1.mjs`, 8 at desktop and iPhone) — six points with recommendations, approved drawings redrawn from their own scripts, new pieces pink.
- **His answer, 17 Nov 26: "All as recommended"** — recorded as D2190 (the order with borrowing before Transfer to Sqn, 149 at Home base, the new pieces as drawn; answers D2189) and D2191 (the master admin, Admin → Users by squadron, what View shows); the People & accounts page's limit raised 21,200 → 21,600 under his standing word (D2148) for D2191. This pull request touches `raptor-port/scripts/docsize.mjs` (that limit), so it waits for his "merge live".
- **Pick up here:** merged (pull request 805); batch 1's build is chat 107's block above. Was: Batch 1's build on a NEW branch from `main`, by the plan §3.6, starting with step 0 (the key inventory) — FULL bug check, security read (D1411), the drawing check against `…-b1/img/` (D1494). Not before his look (D2188).
- **Rulings:** 2 recorded → `scheduler.md`, `people-accounts.md` (D2190–D2191); his call for Fable was for this job only · **Walk:** none — notes and mock-ups only · **Reads owed:** none (the plan had Astra and Fable) · **Next chat number:** 107 · **Next free ruling:** D2192.
<!-- /now -->

<!-- now:claude/cal-wheel-drag-e4107b -->
### CHAT 99 — the calendar wheels' mouse drag (his fault of 17 Nov 26, D2170), rewritten 17 Nov 26 at its end — verify before use
- **What:** on a desktop the month-and-year chooser's wheels moved only with the mouse wheel, never a press and drag. Fixed once in the shared wheel (`raptor-port/src/ui/DateCal.tsx` `Wheel`), so every calendar has it; tests in `raptor-port/e2e/datecal.spec.ts`.
- **Branch / PR:** `claude/cal-wheel-drag-e4107b`, pull request 797 into `main`; `main` brought in by chat 99 (records settled); waits for his look and his "merge live".
- **Bug check — done:** WALK tier. Walk 144 PASS; re-walk 144 PASS after the two blind reads' four fixes (Astra and a fresh Opus reader). Chat 99: GitHub's slow-machine failure of the catch-a-glide test fixed (it measures inside the page); the fix round's narrow read by fresh Opus readers, two rounds, last round 2 (brief and findings `raptor-port/docs/superpowers/briefs/2026-11-17-cal-wheel-drag-fixread-brief.md`): round 1 found a held catch then a drag jumping ~30 years, Enter during a drag closing on the old year, a press let go on the other list moving it later; round 2 found the keys acting on the old year during a held catch — each red first, fixed, green. Re-walk 2 (desktop, the fixed mouse paths) 112 PASS. The calendar file 28 of 28 three runs in a row; calendar unit tests 167 of 167; code check clean (the walk scripts' 14 notes kept with reasons); docsize and rulecheck OK. Evidence sheet `raptor-port/docs/handpass/2026-11-17-cal-wheel-drag.md`.
- **MERGED and LIVE (17 Nov 26, his "merge live"):** pull request 797; Vercel's live build of it ready. `main`'s own run then went red on one new test's setup only — 28 quick arrow presses that GitHub's slower machine did not carry the whole way (2028, 2046 of 2054); the app is not at fault. Follow-up on this branch, restarted from `main`: the setup scrolls the list 28 rows at once; the file 28 of 28 twice on his PC. **Pick up here:** its pull request green → his "merge live" (it touches a test, so not notes-only) → `main`'s run green.
- **Reads owed:** none — the first code read had Astra and a fresh Opus reader; the fix rounds fresh Opus readers, as the order's §5 says.
- **Rulings:** D2170 recorded → the scheduler's page. None in chat 99.
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
