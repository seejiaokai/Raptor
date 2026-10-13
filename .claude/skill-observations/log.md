# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

## 2026-09-06

### Observation 120: Vendoring a whole app as a tab is a repeatable recipe — worth a skill

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Merging the standalone OCU Progress Tracker (seejiaokai/Tracker) into Raptor as a new tab — the second time this repo has vendored a whole React app (Leave War, 16 Aug 26), and the steps were the same both times.
**Skill:** New skill candidate: vendor-app-as-tab
**Type:** open-source
**Phase/Area:** whole workflow

**Issue:** Both merges followed one unwritten sequence, re-derived from the first merge's comments each time: (1) intersect the two apps' element IDs and CLASS names before touching anything (this merge found 2 id collisions and 5 bare-class collisions — `.day`, `.modal`, `.sub` … — the class ones only surfaced when the vendored browser suite ran inside the host); (2) wrap the vendored stylesheet in the host's page-section selector with native CSS nesting, converting `:root`/`body`/`#root` rules to `&` and moving body-appended elements' rules OUTSIDE the wrapper; (3) replace the vendored app's storage/sync layers with one small doorway module of the same async shape; (4) put the host→guest role flag in a no-import module so the host can set it without loading the guest bundle (the first cut pulled ~280 KB into the host's first download via a store import); (5) keep the guest mounted after first visit when its render is imperative/once-only, and gate its document-level listeners on an `active` prop; (6) adapt the guest's browser suite by replacing every `goto`/`reload` with ONE "open via host login + tab" helper; (7) enforce the host's roles at the guest's write paths AND its affordances, and pin the pair with a test.

**Suggested improvement:** Write a `vendor-app-as-tab` skill whose core is that ordered checklist plus the two audits as runnable one-liners (id intersection; class intersection restricted to bare-class rules in the host stylesheet). Include the "measure the guest's column height off the section's own top edge, not a hard-coded bar height" note and the "lazy chunk regression guard" test pattern.

**Principle:** A second occurrence of a multi-hour integration is the moment to capture it as a skill; the two collision audits are the part nobody remembers and the browser suite is the only thing that catches what they miss.

### Observation 122: "Keep it mounted" is not enough when the HOST unmounts everything — a once-only imperative init needs a remount redraw

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Bug sweep after vendoring the OCU Tracker into Raptor as a tab. The tab was kept mounted across tab switches because its flow board is drawn imperatively by a once-only init — but Raptor's logout swaps the WHOLE shell for the login screen, so the next login remounted the tab with an empty board and the guarded init drew nothing. Found only by a scenario that crossed a session boundary; every tab-switch test passed.
**Skill:** New skill candidate: vendor-app-as-tab (extends observation 120)
**Type:** open-source
**Phase/Area:** integration checklist — lifecycle

**Issue:** The "keep the guest mounted so its once-only render survives" rule (obs 120, step 5) has a hole: any host lifecycle that unmounts ABOVE the guest (logout, a route change, an error boundary reset) brings the guest back with fresh DOM and a guard that refuses to re-run. Tab-switch tests cannot see it.

**Suggested improvement:** Add to the vendor-app-as-tab checklist: "for every once-only init in the guest, make the mount effect 'boot if not ready, else REDRAW' — and test mount → unmount → mount explicitly, plus the host's session boundary (logout/login) in the browser sweep." The bug sweep's scenario list (session boundary, in-between widths, live resize, host overlays over the guest, host notify while the guest is up) is the reusable part.

**Principle:** A guard against double-initialisation is also a guard against re-initialisation; wherever a host can recreate the guest's DOM, the guest needs a redraw path that is not the init path — and the test that proves it must cross the host's own lifecycle boundaries, not just the guest's.

## 2026-09-23 — [HUMAN-RETEST] the Tracker

### Observation 542: A rehearsal's "put the live files back" also rolled back the review's own drafts — they were tracked too

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The skill review of 13 Oct 26. To prove the document check would pass with the drafts installed, the staged drafts were copied over the live files, the check was run, and the live files were restored with `git checkout -- .`.
**Skill:** task-observer (`references/weekly-review.md`, Delivering updated skills; this repo's `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo — Staging)
**Type:** open-source
**Phase/Area:** Staging and rehearsing a review's drafts

**Issue:** The first rehearsal was safe only by accident: the holding folder was still untracked, so a whole-tree restore could not touch it. After the drafts were committed (so the independent reader would read a fixed snapshot) and then edited again to take the reader's 21 findings, the same whole-tree restore returned every draft to its committed state and silently threw away those edits — about twenty-five of them, re-applied from the conversation. It is the trap notes 262 and 341 record for break tests ("a restore that returns to the last commit, not to the state just before"), met in a new place: the thing restored and the thing being worked on sat in one tree.

**Suggested improvement:** In the review procedure's staging section (and this repo's Staging line): "Rehearse the project's document check with the drafts in place before the read and again after the reader's fixes: COMMIT the drafts first, copy them over the live files, run the check, then restore ONLY the live paths, by name — never the whole tree — and delete only the files the drafts add." Keep the list of live paths in the install script so the rehearsal and the install use one list.

**Principle:** An undo scoped wider than the do reaches work that was never part of the experiment; commit what must survive, and restore by the same list you copied by.

### Observation 543: A review left for three weeks held 272 notes, and a third of them were one lesson logged again

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The same review: 272 open notes since 24 Sep 26, about 70,000 words, one whole session to read and sort.
**Skill:** task-observer (SKILL.md Session Start Protocol step 3; `references/weekly-review.md`, the 7-day fallback)
**Type:** open-source
**Phase/Area:** When a review is triggered

**Issue:** The 7-day fallback offers the review in one line at the start of every interactive session and never gates the task — so across about forty busy sessions the offer was made and passed over each time, and the backlog grew past what a session can review beside its own job. The cost fell on the review: twelve notes of one shell trap, six of "an assertion of absence passes on nothing", four of "the re-walk overwrote the first walk's pictures". Several said in their own text "the note has been tested and has failed; build the guard" — and were themselves only notes.

**Suggested improvement:** Add a SIZE trigger beside the age one: when OPEN notes pass a threshold (say 60), the offer stops being a one-line aside and becomes a line in the session's closing report or handoff ("the notebook holds N unreviewed notes — a review is its own job; start one?"), so the owner places it like any other work. And let a review be run on ONE skill's notes when a cluster on it passes a smaller threshold (say 10), which is cheap enough to do beside a task.

**Principle:** An offer that never blocks is never taken while there is work to do; a backlog needs a trigger that turns it into scheduled work before it is too large to do in passing.

### Observation 544: A large review is kept honest by a table every note appears in exactly once, checked by machine, and by a brief that names where the drafts are most likely wrong

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The same review. Positive signal.
**Skill:** task-observer (`references/weekly-review.md` Steps 1, 3 and 8)
**Type:** open-source
**Phase/Area:** Dispositioning many notes; briefing the independent reader

**Issue:** Two things carried a 272-note review. (1) One table, one row a note, with a code per row (carried by a draft / already written / filed / memory / recommend closed / stays open) — and a three-line check that the set of numbers in the table equals the set of `### Observation` headers in the log, with no duplicate. The reader ran the same check independently. The install script then reads the table, so the statuses written into the log cannot drift from what was approved. (2) The reader's brief did not ask "is this right?": it listed nine checks and, under "contradictions", the eight places the writer already suspected (an approved wording touched, a ruling's recipe narrowed, a rule file corrected). The reader found 21 things, 8 of them in those named places, and its factual claims held when checked.

**Suggested improvement:** In `weekly-review.md`: extend Step 1's reconciliation guard to the output — "the dispositions table has exactly one row per header; check it by machine before the read and before the install" — and add to Step 8 that the reader's brief names the writer's own doubts as targets, asks for exact replacement text, and lets the reader write one file, its report.

**Principle:** A review of many items needs an account in which every item appears exactly once and a machine says so; and a reviewer told where the author is unsure finds more than one asked whether the work is good.

## 2026-10-13

### Observation 560: A fit fix for a phone's own control, proved only on another platform, was recorded as done and failed on the real phone

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [CAL-PHONE-SWIPE-FIT] — reading the Calendar window before its questions and picture (branch claude/cal-phone-swipe-fit-2affa0; numbered from 560 by agreement with the parallel skills-review chat, which keeps 542–559)
**Skill:** impeccable (reference/adapt.md); also the bug-check order's walk step
**Type:** open-source
**Phase/Area:** Adapt — "Verify adaptations"; the walk's device caveats

**Issue:** A date box drawn by the phone's own browser ran off a window's edge on the owner's iPhone. Five days earlier the same box had been given "fit" style rules after an earlier picture of his, measured as fitting in a Windows browser, and written up as fixed. It still ran off on the real phone. The desktop browser cannot reproduce the fault at all (it draws that control differently), so the first fix was never proven — and nothing in the record said so.

**Suggested improvement:** In adapt.md's verify step (and the walk's device caveats): when the faulty part is a control the platform draws itself (a date, time, select or file box), say plainly that an emulated walk cannot prove a fix to it; then EITHER replace it with the product's own control, which behaves the same everywhere, OR mark the fix "unproven until seen on the device" in the evidence and on the owner's look card. A second style-only attempt after a first one failed on the device needs a stated reason.

**Principle:** A fix can only be called done on the surface where the fault can be reproduced. Where the fault lives in a platform-drawn control that the test environment draws differently, prefer removing the dependency over tuning it blind — and never record a blind fix as proven.

### Observation 561: The handoff told him to pick the unmerged branch with no new worktree — the app refused, because the old chat's worktree still holds that branch

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [ONE-DATE-CALENDAR] — handing the build of step one to a fresh chat (branch claude/cal-phone-swipe-fit-2affa0, itself an app-made worktree)
**Skill:** session-handoff (and the always-loaded rule .claude/rules/doc-structure.md, D368's line: "an unmerged branch continuing: that claude/<name> branch")
**Type:** internal
**Phase/Area:** Step 1 — the ready-to-paste opening line and the picker advice

**Issue:** The handoff's standing advice for an unmerged branch is "pick that branch in the new-chat picker — no new worktree". The owner did exactly that and the app answered "Couldn't check out the branch": the finishing chat runs in a worktree of its own that still has the branch checked out, and git opens a branch in one folder only. The app's hint ("uncommitted changes — commit or stash") pointed at the wrong cause. He had to send a picture and wait for a second set of instructions. The same handoff had already needed two corrections that evening (main had moved under the branch; the app's update of a worktree needed two settings on his PC).

**Suggested improvement:** In the skill's Step 1 and in D368's line: when the finishing chat is itself in a worktree, the advice is "pick the branch AND tick worktree" (the new chat gets its own folder cut from the branch, under its own branch name, and renames the handoff block to it) — "no new worktree" holds only when the branch is checked out nowhere. Before giving the opening line, run `git worktree list` and say which case applies; and check `git rev-list --count HEAD..origin/main` so a branch behind main is brought level BEFORE the handoff is given, not discovered after.

**Principle:** A handoff instruction is a procedure someone else will execute on a machine whose state the writer can inspect — so inspect it. State the precondition each step relies on (where the branch is checked out, whether the base has moved) and verify it before handing the step over.

### Observation 562: A test that "typed" into a control that had become a button still passed — it never checked the value it typed

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [ONE-DATE-CALENDAR] step one — every date box that was the phone's own replaced by a button that opens the app's calendar
**Skill:** test-driven-development (re-expressing older tests); the bug-check order's roll-call row "a change that REMOVES or replaces a control"
**Type:** open-source
**Phase/Area:** After the build, the sweep of older tests of the replaced control

**Issue:** After the date boxes became buttons, the affected test files were run and the failures re-expressed (open the calendar, tap a date). One older test did not fail: it fired a change event at the box — now a button, so the event did nothing — and went on to assert only the refusal text, never the date. It passed for the wrong reason and would have stayed that way; it was found only by searching the tests for every WRITE to the replaced control, not by reading the red list.

**Suggested improvement:** In the re-expression step: after replacing a control with another kind of element, search every test (unit and browser) for writes to the old control — by its id, test id and label — and re-express each one, green or red; then make each re-expressed test assert the value the control handed on (the writer was asked for THAT date), so the same silent pass cannot return. One line in the roll-call rule for a replaced control: "its tests are found by searching for the control, not by what went red".

**Principle:** A red list names the tests that noticed a change; it says nothing about the tests that should have. When a control changes kind, the tests to re-express are found by searching for the control.

### Observation 563: A new worktree has none of the installed packages — the handoff named the old folder's link, and the first test run of the new chat failed

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [ONE-DATE-CALENDAR] step one — a fresh chat in a new app-made worktree cut from the unmerged branch
**Skill:** session-handoff (Step 1 — what the next chat needs before its first command); using-git-worktrees
**Type:** internal
**Phase/Area:** The handoff block's "Branch" line; the first minutes of a chat in a new worktree

**Issue:** The handoff block said that the FINISHING chat's worktree reaches the installed packages through a folder link to the main checkout's. The new chat's worktree is another folder and had none; its first test run stopped on a missing package, and the cause had to be worked out (the block's sentence was about a different folder) before the link was made by hand (`cmd //c mklink /J`). The block also said its built bundle was stale — true of the old folder; the new one had no bundle at all.

**Suggested improvement:** In the skill's Step 1, where the handoff tells him to tick "worktree": add a line to the block's Pick-up — "a new worktree has no installed packages and no built bundle: link `raptor-port/node_modules` to the main checkout's before the first test (`cmd //c "mklink /J node_modules <main>aptor-port
ode_modules"`), and build before any look" — and say that facts about THIS folder (a link, a stale bundle) do not carry to the next one.

**Principle:** A handoff describes a machine state. A fact that belongs to the finishing chat's folder must be marked as such, and what the next chat's folder will LACK is worth more to it than what the old one holds.

### Observation 564: A class name added to the one global stylesheet was already the Tracker's — the roll-call listed where the new box is DRAWN, never who already used its name

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [ONE-DATE-CALENDAR] step one, found on starting the Tracker's date boxes (D801)
**Skill:** bug-check (the roll-call, order §6); raptor-executor (inspect before editing)
**Type:** internal
**Phase/Area:** The roll-call's question "where is this drawn" for a change that adds a stylesheet rule

**Issue:** The app's new date box was styled by a class named `datebox` on the scheduler's stylesheet, which is one global sheet for all three apps. The Tracker already wrapped each of ITS date boxes in an element of that same class, so the new look (a border, a height, a flex row) reached every Tracker date box. The roll-call had fourteen rows — every place the new box is drawn — and all fourteen were right; three walkers and a blind read passed it. None of them looks at a place the change does not draw in. It was found only when the next job opened the Tracker's file.

**Suggested improvement:** In the roll-call step, for any change that ADDS a class, an id or a `data-` name to a shared stylesheet or a shared query: one more row — "who already uses this name" — answered by a search of all three apps' sources (`grep -rn "datebox" src/`) BEFORE the name is chosen, with the result written in the table. Prefer a selector that names the element kind too (`button.datebox`).

**Principle:** A roll-call of "everywhere I draw it" cannot find a collision with something that was already there. A new NAME on shared ground needs its own search — for the name, not for the feature.

### Observation 565: A look script that passed everything had picked a date in one box of five — the narrow boxes were only ever seen empty

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The Tracker's date boxes (D801) — the host's scripted look at a phone and a desktop
**Skill:** bug-check (the host's look; `raptor-port/docs/walk-scripts.md`)
**Type:** internal
**Phase/Area:** What state a fit check is run in

**Issue:** The first version of the look checked "no box's words are cut short" on all five side-panel boxes and passed at both sizes. Four of the five were EMPTY ("Pick a date" — short words). Only when the script was made to put a date in every box did two of them (108px wide on a phone, three across in their card) show "Wed 28 Oct 20…", and a third place (the failures list) the same. The check was true and worthless: it measured the shortest words each box can hold. The same run also wrote a wrong expectation ("a refused day goes back") that the app's own ruled behaviour contradicted — the look's author had not read the store's comment first.

**Suggested improvement:** In `walk-scripts.md`, under the fit checks: "a fit check is run with the LONGEST content the control can hold, in EVERY instance — fill each box (the widest weekday and month: a Wednesday in a long month), then measure; an empty control proves nothing about fit". And: an expectation about what a control does after a refusal is taken from the rule's own text (the ruling's full row, the code's comment), not from what seems natural.

**Principle:** A fit check proves only the content it was run with. Fill every instance with its worst case before measuring; a pass on the default state is a pass on the easiest input.

### Observation 566: The break run used the look script as its detector and overwrote the committed evidence pictures with pictures of broken builds

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The Tracker's date boxes (D801) — browser break tests whose detector was the host's look script
**Skill:** bug-check (break tests, order §8.4; `raptor-port/docs/walk-scripts.md` on break-test lists)
**Type:** internal
**Phase/Area:** A script that both proves and records

**Issue:** The look script empties its pictures folder and writes new pictures on every run — right for a look, since stale pictures must not survive. The browser break script ran that same look against six deliberately broken builds, so the folder of committed evidence pictures was replaced, six times, by pictures of broken screens; `git status` showed them deleted or changed mid-run. Nothing was lost (they were committed, and the look was run again on the true build), but a stop half-way would have left broken-build pictures sitting in the evidence folder.

**Suggested improvement:** In `walk-scripts.md`: a look or walk script takes its output folder from an environment variable (`LOOK_OUT`), defaulting to the evidence folder; any script that runs it as a DETECTOR (break tests, a re-run to reproduce) passes a scratch folder. And the break script's closing step re-runs the look on the true build, or says that it must be.

**Principle:** A script that records evidence must not be reused as a detector without redirecting what it writes: proof runs and record runs need different output folders.

### Observation 567: The walker's brief named a control that is not there — the host's own browser test of the route was written AFTER the brief, and corrected it

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The Inputs / schedule batch (D793) — one Sonnet walker, a brief written by the host. (Numbered past 564–566, which are on the open branch claude/tracker-date-boxes and not in this copy of the log.)
**Skill:** bug-check (the walk — `raptor-port/docs/walk-scripts.md`, writing a walker's brief)
**Type:** internal
**Phase/Area:** The order of the host's own run and the walker's brief

**Issue:** The brief told the walker to take an input off the programme with a button it named and to press "Accept" on its card. Written from the code: the button exists in the source. On the real board the take-off is a different control (the ✕ at the end of the row), and the card with "Accept" is inside a panel that opens folded — so the first control named was not on screen at all. This was found only because the host then wrote a browser test of the same route for the gates, which failed three times on exactly those steps before anything of the app was wrong. Had the walker gone first, its first hour would have been spent finding the route.

**Suggested improvement:** In `walk-scripts.md`, under writing a walker's brief: "the route every scenario starts from is DRIVEN by the host first — a browser test or a look script that passes — and the brief names that file as the recipe. Control names in a brief come from that passing run, never from reading the source: the source says what exists, not what is on screen, visible, in which panel."

**Principle:** A brief written from the code describes the code. The route a helper must walk is proved by walking it once before the brief is written.

### Observation 568: A new path that skips the usual ending of a write dropped a duty that ending performed — found by a blind reader, not by any test of the path

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The Inputs / schedule batch (D793) — the put-back made WITH its OIL answer is its own command and so does not call the schedule's usual ending
**Skill:** raptor-executor (inspect before editing); bug-check (the reads)
**Type:** internal
**Phase/Area:** Giving one branch of an existing handler a different ending

**Issue:** Every "Accept" ended in the schedule's standard ending (the epilogue that validates, saves and reconciles the "goes out" marks). The new answered path is saved as one input batch, so the builder skipped that ending for it — "a second command would be a second Undo step" — and tested the Undo. The ending also reconciled the marks on an issued row; with it skipped, a row put back exactly as issued kept a "goes out" mark. Every test of the new path published the day AFTER the take-off, so no test had an issued row to put back. A fresh reader found it by listing what the skipped call does.

**Suggested improvement:** In the executor's guide, under minimal changes: "when a new branch SKIPS a call the other branches make (an epilogue, an after-step, a notify), write down — in the comment beside the skip — each thing that call does, and for each either show where the new branch gets it or say why it does not need it." And in the bug-check brief for readers, keep the line that asked for it: "what does the changed path no longer run?"

**Principle:** Skipping a shared ending is a change to everything that ending does, not only to the one effect you meant to avoid. List its effects before skipping it.

### Observation 569: A rulings move was refused twice by its own script for reasons that were one line each — the refusal named the fix, and both were the builder's set-up slips

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** D802 — the Inputs pages' rulings moved to a file of their own with `backlog-archive.mjs --rulings --move-rows`
**Skill:** record-decisions / doc-structure (a NEW area file); session work with the mover script
**Type:** internal
**Phase/Area:** Setting up a new area file before the mover runs

**Issue:** A new area needs four things before a row can move into it: the file with its short table, a row in the map, a byte tripwire, and (the script makes it) the full-text file. The builder's set-up left the map row's last cell empty — the map reader then did not see the row and the move was put back whole with "not in the map"; and a placeholder string was written into the checker's tripwire list by a patch that did not match, which removed the scheduler's own tripwire. Both were caught by the script's own all-or-nothing check — nothing was lost — but each cost a round, and the dry run did not show the first (it reports the map as rewritten).

**Suggested improvement:** In `DECISIONS.md`'s steps (or `record-decisions.md` §Keeping the list whole): a four-line recipe for a NEW area — "(1) the file: `paths:`, title, preamble, the short table's header; (2) its map row with at least one D-number in the last cell (the script rewrites it); (3) its row in `RULING_BYTES`, added beside the others — never a placeholder; (4) `--dry-run`, then the move, then a row-by-row compare against the base". And have `--dry-run` run the same inventory the real run does.

**Principle:** An all-or-nothing script turns set-up slips into refusals, which is right — but a rehearsal that skips the real run's last check rehearses the wrong thing.

### Observation 570: The quick type check the builder ran while iterating was not the build's own — a move of code passed it and then failed the first full gate run

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** `[LW-ROWS-SPLIT]` — the Leave War's row drawing moved to a file of its own (branch `claude/lw-rows-split`; this note is written on `claude/inputs-rulings-file`, the night's documents-only branch, because the log there holds the night's other notes — numbered past 564–566 on the Tracker branch and 567–569 here)
**Skill:** raptor-executor (Verification without self-approval); the project guide's Build & verify
**Type:** internal
**Phase/Area:** Checking a change before the full gate run

**Issue:** After the move the builder ran a bare type check (`npx tsc --noEmit -p .`), which passed. The build's own type check is stricter (it refuses a type name imported as a value) and failed on three names — found only by the first full gate run, under the PC's lock, about fifteen minutes in. Both blind readers then reported the same three as their top finding. A whole gate run and two readers' attention went on something one command would have shown in a minute.

**Suggested improvement:** In the project guide's Token discipline or Build & verify, one line: "while iterating, the type check is the BUILD's own (`npm run build`, or its type-check half) — a bare `tsc --noEmit -p .` uses a different set-up and passes what the build refuses." And in the executor's guide: run the build once before taking the lock for the full set.

**Principle:** A faster stand-in for a gate is only worth running if it refuses what the gate refuses. Check which configuration the real gate uses before trusting a shortcut to it.

### Observation 571: Putting a file back with `git checkout --` after a hand-run break test also threw away two edits not yet committed

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** `[LW-ROWS-SPLIT]` — a break test run by hand because its output was too large for the break runner
**Skill:** bug-check order (the break tests); `raptor-port/docs/walk-scripts.md`
**Type:** internal
**Phase/Area:** Running a break test by hand

**Issue:** The break runner restores the file it breaks from a copy it took. Run by hand, the builder restored the file with `git checkout -- <file>` — which restores the last COMMIT, not the file as it stood. Two edits made after the last commit (a reader's finding fixed, a comment corrected) went with the break and had to be made again; nothing warned.

**Suggested improvement:** In `walk-scripts.md`, beside the break-test section: "a break run by hand is run on a COMMITTED tree (commit first, even a work-in-progress commit), or the file is copied aside and copied back — never restored with `git checkout --`, which also discards whatever was not yet committed."

**Principle:** "Put it back" by way of version control puts back the last commit, not the last state. Before a deliberate break, make the state you want back a state that exists somewhere.

### Observation 572: The break runner reported an ERROR, not a caught break, when the failing test's output was a very large recorded-markup difference

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** `[LW-ROWS-SPLIT]` — break 1 changed a class on a row; the test that pins every row's whole markup (about 375,000 characters of record) failed as it should
**Skill:** bug-check order (the break tests); `raptor-port/scripts/handpass/breaks.mjs`
**Type:** internal
**Phase/Area:** Break tests against a test that compares a large recorded file

**Issue:** The test failed correctly, but its failure message is the whole difference between two very large records, and the runner could not hold the output: it reported an error for that break. An error reads as "the list is wrong", not "caught" — the builder had to run the break by hand to learn it was caught, and say so in the evidence sheet. (Running it by hand is also what led to Observation 571.)

**Suggested improvement:** Either the runner judges a break by the test run's exit code and keeps only the first lines of its output (a larger buffer, or output sent to a file), or `walk-scripts.md` says: "a break aimed at a test that compares a large record is run with the output cut short — the runner cannot hold it." And a test that pins a large record should fail with a short message naming the first place the two differ, not the whole of both.

**Principle:** A check's verdict should come from the result, not from being able to hold everything the result printed. A tool that fails on large output turns a pass into an unknown.
