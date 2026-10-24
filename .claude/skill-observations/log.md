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

### Observation 573: A pull request stacked on another branch showed two green ticks and had run none of the real checks

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** Merging the night's five pull requests one after another; two of them were stacked on the first
**Skill:** shipping (the loop; the checks); session-handoff
**Type:** internal
**Phase/Area:** Reading a pull request's checks before a merge

**Issue:** Two pull requests were based on another pull request's branch, not on `main`. GitHub runs the full set only for a pull request aimed at `main`, so each showed two passing ticks (the preview's) and nothing else. After the base merged, pointing them at `main` did NOT start the checks either — only a new push did. One was caught seconds before a merge that would have gone in on the preview's ticks alone.

**Suggested improvement:** In `shipping.md` §The checks, one line: "a pull request based on another branch runs no checks — before merging it, point it at `main` AND push a commit (an empty one will do), then read the full list: fewer than the usual eleven is not green."

**Principle:** "All checks passed" is only a claim about the checks that ran. Count them against what should have run before believing the colour.

### Observation 574: An edit anchored on a heading's words landed in the paragraph that merely mentioned the heading

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** Rewriting this chat's block in `HANDOFF.md` with a script
**Skill:** session-handoff; doc-structure
**Type:** internal
**Phase/Area:** Scripted edits to the records

**Issue:** The script found where to insert a block with a search for the text "## Now". The file's opening paragraph also says "`## Now` holds one block per…", and the first match was that sentence — the block was written into the introduction. The document check caught it ("a block's end marker closes no block"), and the file was restored and redone with the search tied to the start of a line.

**Suggested improvement:** In the handoff guide's notes on scripted edits: "find a heading by its whole line (a newline before and after), never by its words — the guide files talk about their own headings in prose."

**Principle:** A document that explains its own structure contains every structural marker at least twice. Anchor on position, not on words.

### Observation 575: The document check, run in the middle of a merge, reported a fault that was the merge itself

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** Bringing `main` into a branch that also touches the app's code, several times in one afternoon
**Skill:** doc-structure (the check that keeps it); shipping
**Type:** internal
**Phase/Area:** Resolving conflicts in the records, then running the check

**Issue:** With a merge resolved but not yet committed, the check said "a size marker changed in a change that also touches the app's code — move it to a documents-only commit". Nothing of the kind had been done: the marker's change came in with `main`, and the check reads everything uncommitted as one change. Committed, the same tree passed. The first time cost a few minutes of looking for a fault that was not there.

**Suggested improvement:** Either the check recognises a merge in progress and compares against the merge's two parents, or `shipping.md` says: "after resolving a merge, commit it before running the document check — run mid-merge it reads the other side's changes as yours."

**Principle:** A check that reads "what is uncommitted" cannot tell your change from one you are in the middle of receiving. Finish receiving first.

### Observation 576: A question put to him without an example was answered about something else — twice in one morning

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** The one question parked for him overnight ("should the Unavailable button ask the OIL question too?") and the two that followed
**Skill:** plain-language; record-decisions (questions put to him)
**Type:** internal
**Phase/Area:** Putting a parked question to him

**Issue:** The parked question named a button and a rule and gave no worked case. His answer was about leave and medical inputs — a different thing — and it was first recorded as a ruling on the wrong subject, then corrected, then replaced the same morning when the question was finally put with one named person, one day and what the screen shows. The same happened with "un-cancel", a word the app does not use: he had approved a job he then had to ask the meaning of. A memory note already says a question needs a worked example; it was not applied to a question written during an unattended run.

**Suggested improvement:** In the unattended-run rule (`doc-structure.md` §In his workflow, and the evidence sheet's "Questions waiting for him"): the parked question's shape is fixed — "the case (a named person, a day, what he pressed) · what the app does today · the choice · recommended". And: a word that is not on any screen is not used in a question.

**Principle:** A question is only as good as the picture the reader forms of it. If he could answer it about a different situation than the one you mean, it is not yet a question.

### Observation 577: A complaint about wordy notes was half a layout fault — the box was measured only after the words had been drafted

**Status:** ACTIONED (2026-10-14) — the design guide §1a test 1 (measure the box before the words; a pass that did not says so); on the branch, awaiting his approval of the guide's wording (D832)
**Date:** 2026-10-13
**Session context:** [DESIGN-LOOK-13OCT] — the design page: the shorter passing notes (D806), drawn before and after on the built app at a phone's size
**Skill:** impeccable (reference/clarify.md); the design guide §1 (words on screen)
**Type:** open-source
**Phase/Area:** Clarify — before shortening any words

**Issue:** The owner sent two pictures of a passing note five lines deep and asked for shorter words. The backlog item drafted shorter wordings and nothing else. Only when the built note was drawn at the phone's size and its box measured did it show that the box was half the screen wide (a box centred by "left: 50%" can only be as wide as the half it starts in). The same words in a full-width box were three lines; shorter words alone left it at three as well; both together made two. A second surface (a bar that stays) had the same cause.

**Suggested improvement:** In clarify.md's first step, and the guide's §1: before rewording a note, a label or a hint that "runs long", measure the box it sits in at the smallest shipped width — its width against the screen's, its line count — and report the words and the box as two separate findings. A wording pass that never measured the box says so.

**Principle:** "Too wordy" is a report of how much room the words take, not of how many there are. Measure the container before editing the text; the cheaper half of the fix is often not in the words.

### Observation 578: The design skill's critique saves its snapshot where this repo's document check refuses a new document

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [DESIGN-LOOK-13OCT] — /impeccable critique, the "Persist the snapshot" step
**Skill:** impeccable (reference/critique.md — Persist the Snapshot); .claude/skills/TASK-OBSERVER-VENDORED.md's sibling note for impeccable, if one is kept
**Type:** internal
**Phase/Area:** Critique — persistence

**Issue:** The helper wrote the snapshot to the repository root's .impeccable/critique/. The document check then failed the turn: a new document outside raptor-port/docs/. The snapshot was moved by hand to docs/handpass/parts/ and the record points there — so the skill's own "trend" and a later /impeccable polish will not find it. Two older snapshots sit in the skill's folders from before the check existed.

**Suggested improvement:** Decide once, in the project's note on the vendored design skill: either the document check lets .impeccable/critique/ through (it is the skill's own store, like its config), or critique is told here to skip persistence and write its scores into the look's own record under docs/handpass/. Until then a critique in this repo ends with a moved file and a broken trend.

**Principle:** A vendored tool's own store and the host project's filing rule have to be reconciled once, in writing — otherwise every run pays for the clash again, and the tool's later steps silently lose what an earlier step saved.

**Met again 2026-10-22:** Leave War overhaul round 14 (the LVE tile critique): persistence skipped on purpose, the synthesis put on his mock-up page instead; still undecided in writing.

### Observation 579: "Shorten it" was answered with summaries — the owner sent the list back: "the key words are gone"

**Status:** ACTIONED (2026-10-14) — the design guide §1a tests 2, 3, 4 and 8 (a word is cut only if the note states the same facts without it; show the change); on the branch, awaiting his approval (D832)
**Date:** 2026-10-13
**Session context:** [DESIGN-LOOK-13OCT] / [NOTES-SHORTER] — 33 shorter wordings for the app's passing notes, put to him before and after; his answer the same evening (D825)
**Skill:** impeccable (reference/clarify.md); the design guide §1 (words on screen); plain-language (the same failure as a "condensed record that changed what the original meant", D138)
**Type:** open-source
**Phase/Area:** Clarify — rewriting existing copy shorter

**Issue:** Asked to make wordy notes shorter, the first draft rewrote each note as a summary: named things became pronouns, reasons and consequences were dropped or compressed ("the common programme has no usable times, so nobody on it earns OIL" became "no times — no OIL from it"). The owner read it as key words gone. Redone with one test per word — would the sentence still say the same fact without it — the honest result was fourteen notes with filler cut (a day said twice, "Heads up", "it has been") and nineteen left whole. Nothing in the method had asked for the cut words to be listed, so the loss was invisible until he read it.

**Suggested improvement:** In clarify.md and the guide's §1: a shortening is shown as before, after, and the exact words cut. A cut is allowed only for a word the sentence says the same without; a named thing, a number, a reason, a consequence and the place to fix it are never cut. A note that cannot lose a word that way is reported as "left whole", and the next question is its box, not its words.

**Principle:** Shortening removes words; summarising removes facts. Show the removed words, and the difference polices itself.

### Observation 580: A gap the machine record held never reached the page; a redraft said the opposite of its original — both caught only by a second model's read

**Status:** ACTIONED (2026-10-14) — the design guide §1a test 9 (the cold read by someone else) and §8 (counts compared by a script); the wider-letters line is in the mock-up guide; on the branch, awaiting his approval (D832)
**Date:** 2026-10-13
**Session context:** [DESIGN-LOOK-13OCT] — Fable's read of the whole design page, on the owner's word (D826), after the host's own look and a fresh Opus reader's
**Skill:** impeccable (reference/critique.md — synthesis; reference/clarify.md); the design guide §8 (how a look is reported)
**Type:** open-source
**Phase/Area:** Critique — from evidence to report; Clarify — checking a rewrite

**Issue:** (1) The keyboard sweep wrote one row per key pressed, with a verdict. One row marked a gap (Delete on a filled date box does nothing) was reasoned away while the page was written and silently left off its list. Nothing compared the record's gap rows with the page's. (2) One shortened wording ("Nothing on this day earns OIL — anything added later too") could be read as the opposite of its original; the writer, knowing the meaning, could not see it. (3) A drawing's "every row the same shape" was proved only in the test browser's letters, and the column allowed to shrink was the date. A same-model reader given the pictures found none of the three; a different model given the page, the record and the source found all three.

**Suggested improvement:** In the look's report step: every row a machine record marks as a gap appears on the page by number, or in "considered and left" with its reason — and the count is checked by a script, not by eye. In clarify: each rewrite is read back COLD for its literal meaning, without the original beside it, before the pair is shown. In a mock-up's script: name which part gives way when the letters are wider, and draw that case.

**Principle:** Evidence that is gathered by machine must reach the report by count, not by recollection; and a rewrite is checked by someone who does not already know what it is meant to say.

### Observation 581: Three sources recorded as "would not open" had only moved — a second read reached all three by following the redirect or using a real browser

**Status:** OPEN
**Date:** 2026-10-13
**Session context:** [SKILL-FUSION-WRITING] — the second read of outside writing guides (D833); the first read's note listed GOV.UK's, Google Material's and the US plain-language site's pages as "NOT read (redirects, an empty page, not found)"
**Skill:** New skill candidate: reading outside sources for a guide (today a helper's brief; `anthropic-skills:deep-research` where it is used)
**Type:** open-source
**Phase/Area:** Research — fetching a source; what the record says of one that failed

**Issue:** The fetch tool does not follow a redirect to another host: it returns the new address and stops. It also returns only a title for a page drawn by script. The first read took both as "the source would not open" and judged without them — and they were the three most relevant sources (one holds the only published rule on dashes). The second read fetched the address each redirect named (two hops for one of them) and opened the scripted page in a real browser: all three were read in an hour. The fetch tool also answers through a small model, so a page read that way is an account of the page, not the page — the first note did say so.

**Suggested improvement:** In a research brief: a source is recorded as unread only after (1) the address a redirect names has been fetched, hop by hop, and (2) a page that came back empty has been opened in a real browser. The record says, for each source, how it was read — word for word, or a tool's account — and for each one not read, what was tried.

**Principle:** "Would not open" is a finding about the tool until the redirect has been followed and a real browser tried; a source set that silently lost its most relevant members biases the conclusion as surely as a bad source does.

### Observation 582: "Checked in the app" was written from a note's words, not from whether its branch can run — one of thirteen approved wordings was a note the app can no longer show

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** [SKILL-FUSION-WRITING] — the wordings of 13 Oct rechecked against the writing guide; the third read (a fresh Opus reader and Fable, blind) asked to confirm every "checked in the app" in the record against the code
**Skill:** impeccable (reference/clarify.md — Audit the language); the design guide §1a test 8 and §1b test 2; plain-language ("Verified vs assumed")
**Type:** open-source
**Phase/Area:** Clarify — establishing what a string means before rewording it

**Issue:** The writer reworded a two-tap warning ("pick it again to confirm") and wrote "checked in the app: nothing is replaced until the second pick" — from the string and the lines round it. The function that would raise it had stopped returning that state three weeks earlier (its own comment says so); the note is dead code. The owner had approved a shorter wording of it on a page, a first reader had "confirmed" the check, and only the second reader, who followed the call to its source, found it. The same pass found a fix written on a guess ("returns if the day's schedule changes" — it is keyed to the warning's own words) and a family counted as three strings that is seven. When the two readers disagreed on the dead note, the host settled it by reading the function, not by weighing the reports.

**Suggested improvement:** In clarify's audit and the guide's §1a: before a string is reworded, find (1) every place it is raised — by search, with the count stated — and (2) for each, the condition that reaches it, followed one call up; a string no path reaches is reported as dead, not reworded. "Checked in the app" in a record names the function read. And in any multi-reader round: two readers who disagree on a FACT are settled by the primary source, at once, before either report is folded in.

**Principle:** A wording is checked against the behaviour that raises it, not against its own words; and a disagreement between reviewers about a fact is a question for the source, never a vote.

### Observation 583: Each of three read rounds of a guide found faults the last had missed — and nearly all came from making the reader APPLY the guide to real cases and to the code, not from reading it

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** [SKILL-FUSION-WRITING] — a writing guide read three times by two blind readers (D832, D833, D835)
**Skill:** New skill candidate: briefing a reader of a working guide (today in each brief; `claudex-loop` for plans); writing-skills
**Type:** open-source
**Phase/Area:** Review — what the brief asks the reader to do

**Issue:** Round one asked "is the draft faithful and sound" and returned wording fixes. Rounds two and three added three tasks to the brief: reword eight real notes by the guide alone and say whether two careful writers would land apart; try to construct a rewording that passes every test and still reverses a fact; run the new rule over eleven named cases and tabulate what it yields against what the record did. Those tasks produced the heavy findings — a link word guessed, an order of branches that could not be applied as written, two fixes from the previous round contradicting each other — which a reading of the guide's text had passed twice. A separate cold reader, given only the outputs, found what all the guide-readers missed (a flying word that means "approved").

**Suggested improvement:** A brief for reading a guide, rule or skill always carries: (1) apply it to N named real cases and show the result; (2) construct a case that passes every rule and is still wrong; (3) tabulate rule-yields against what the author did. And stop at three rounds: say what was not re-read after the last fixes instead of opening a fourth.

**Principle:** A rule is reviewed by running it, not by reading it; ask the reviewer for outputs and counter-examples, and the faults in the text find themselves.

### Observation 584: A drawing's parts had names of their own; the build shortened them, and a bare name met one the app's global stylesheet already owned

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** [LW-CLASH-NOTE-PHONE] — building an approved mock-up (a list drawn into the running app by an injection script) as real markup
**Skill:** brainstorming (`mockups-on-the-real-app.md` — from the picture to the build); impeccable (building a drawn design)
**Type:** open-source
**Phase/Area:** Build — turning an injected mock-up into the component

**Issue:** The injection script drew the list with prefixed class names (`dn-line`, `dn-go`, `dn-who`). The build renamed them to short ones inside the component's own class (`.clashline .go`, `.clashrow .day`). The app has one global stylesheet that already owns `.go` (a wave) and `.day` (a day of the week); the wave's margin and border reached the new span and the line stood 46 px tall instead of 30. Unit tests could not see it (no stylesheet); the first scripted run on the built screen did, because it asserted the line's measured height against the drawing's figure. The same job was FIXING an older case of exactly this (`.seg`).

**Suggested improvement:** In the mock-up guide's "from the picture to the build" step: keep the drawing's prefixed names, or prefix every new class with the component's own word; before using any bare class name in an app with a global sheet, search the stylesheets for it. And the built screen's first check re-measures the figures the drawing printed (heights, edges), not only its words. A cheap unit guard: every class inside the new component starts with its prefix.

**Principle:** A scoped selector limits where YOUR rule lands, not which of the app's rules land on you; a new name is free only after a search says so, and a drawing's measured figures are assertions for the build.

### Observation 585: Two helpers reported a typecheck PASS from a command that checked no file

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** A three-job batch built with two same-model helpers, each told to run the typecheck
**Skill:** New skill candidate: briefing a build helper (today in each brief; `dispatching-parallel-agents`, `verification-before-completion`)
**Type:** open-source
**Phase/Area:** Verification — the command a brief names

**Issue:** The host's brief named a typecheck command from memory (`tsc --noEmit -p .`). The project's root config is a solution file with no sources (it only references the app's and the tooling's configs), so the command exits 0 having read nothing. Both helpers ran it and reported PASS; the host caught it only because its own run printed nothing at all for a tree that was mid-edit.

**Suggested improvement:** A brief names verification commands copied from the project's own scripts (the build's, the gate's), never composed; and a check that a helper will lean on is first proved able to fail (one deliberate error) — or the helper is told to do so once. verification-before-completion: "exit 0 with no output" is asked "did it read anything?".

**Principle:** A check is evidence only after it has been seen to fail; a command that cannot go red proves the command, not the code.

### Observation 586: A break test of a stylesheet rule passed with the rule cut: the browser tests reused a preview already serving

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** A three-job batch's bug check - a browser test written to pin a one-line stylesheet fix, then broken on purpose
**Skill:** verification-before-completion; the walk-scripts guide (`raptor-port/docs/walk-scripts.md` - break tests)
**Type:** open-source
**Phase/Area:** Verification - proving a new browser test can fail

**Issue:** The fix's rule was cut and the new browser test run: green. The test runner is configured to reuse a server already on its port, and the walk's preview was serving the build made BEFORE the cut - the cut never reached what the test ran on. Cut again, rebuilt, run: red. The same trap makes any single browser-test run after a source change silently test the old build while a preview is up.

**Suggested improvement:** In the walk-scripts guide's break-test section and the project guide's live-view rule: a browser test's verdict belongs to the BUILD it ran on - rebuild before it whenever source changed and a preview is serving, and for a break test of a rule no unit test can reach (a stylesheet's), cut, BUILD, run, restore, BUILD. Print the build's time or commit in the run's first line.

**Principle:** A test's result is a fact about the artefact it ran against, not about the working tree; where a runner can reuse a running server, 'I changed the source and ran the test' proves nothing until the build is known to be the changed one.

**Met again 2026-10-17** ([OIL-CONFIRM-DAYGRID]): a CSS fix was checked by a browser test while the walk's preview still served the build from before the fix — it failed with the OLD numbers, and only reading them as the old numbers showed the run never saw the fix. Proposed guard, inside the action: `gatelock.mjs exec` (or the push-and-lock guard) refuses, or rebuilds first, a Playwright run when a server already answers on its port and any file under `raptor-port/src` is newer than `raptor-port/dist/index.html`.

### Observation 587: An assertion that 'nothing moved' read the screen before the movement had finished - and the unit test beside it asked for the cause of the fault

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The same bug check - a calendar's month-and-year lists, keys that should do nothing
**Skill:** the walk-scripts guide (`raptor-port/docs/walk-scripts.md` - asserting an absence); test-driven-development
**Type:** open-source
**Phase/Area:** Walk script - asserting that a key does nothing

**Issue:** A walk script pressed End in a scrolling list, waited 450ms and asserted the year unchanged: it passed. The browser's own scroll for that key takes about 750ms to settle, and only then is the row in the band read as the choice - End chose a year sixty years on. The script went red one run in four, when the NEXT key raced the settling. The unit test for the same keys asserted 'the key is not taken' (default not prevented) - in a real browser exactly what lets the box scroll; the test world has no scrolling, so it could never see the consequence.

**Suggested improvement:** In the walk-scripts guide: an assertion of ABSENCE ('nothing moves', 'no note', 'no question') names what would have moved and waits out the slowest path by which it could (an animation, a debounce, a timer) - or reads the cause directly (scroll position over time). And when a unit test asserts an event is LEFT to the browser on an element that scrolls, holds focus or submits, write beside it what the browser then does with it.

**Principle:** Absence is only evidence after the longest route to presence has had time to run; and 'leave the key to the browser' is a behaviour, not a no-op - on a scrollable, focusable box the browser's default is itself a feature someone must want.

### Observation 588: A new script written over an older one of the same name - the write tool said 'updated' and the host read past it

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The same bug check - adding one more walk script to a folder of earlier jobs' scripts
**Skill:** New skill candidate: adding files to a shared scripts folder (today nowhere; the Write tool's own result is the only signal)
**Type:** open-source
**Phase/Area:** File creation - choosing a name

**Issue:** The host wrote a new walk script under a short obvious name. A script of that name already existed from the previous day's job (a different purpose, named in the file map). The tool's result read 'updated' rather than 'created'; the host missed it for several steps and ran, edited and cited the new file under the old one's name before a search of the file map showed the clash. The old file was restored from git and the new one renamed; had the old one been uncommitted it would have been lost.

**Suggested improvement:** Before creating a file in a folder other jobs write to: list the folder (or search the file map) for the name; treat a create that reports 'updated' as a stop. In this repo's walk-scripts guide: a new script's name carries its job's word (as this batch's others did: '-built').

**Principle:** A name is free only after a look says so (the same rule as a class name in a global stylesheet, entry 584); and a tool's 'updated' on what was meant as a create is an alarm, not a synonym.

### Observation 589: A mark that lasts a few seconds holds state too - the walk sized "no new control" and never pressed twice inside its lifetime

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** A small batch that put a six-second "just added" mark in place of a passing note; the bug check was sized SHORT because no control was new
**Skill:** the checking guide (`raptor-port/docs/bug-check-order.md` §7.4, the state table; §7.0 sizing)
**Type:** open-source
**Phase/Area:** Walk sizing - deciding whether a state table is owed

**Issue:** The sizing step reasoned "no new control, every screen walked this week" and walked single saves. The fresh code read then found three faults, every one an ORDER of action against a thing with a lifetime: a second save inside the six seconds (one timer never restarted; a stylesheet animation that does not start again while its class stays; a list row keyed by its place), two lit cards in one day (the window went to the older), and a note said late over a warning raised meanwhile. §7.4 asks for a state table for "a control that holds state between presses"; a mark with a timer and a note that waits are not controls, so the table was not written.

**Suggested improvement:** In §7.4 and in the walk ledger's type D row: anything that holds state between presses gets the state table - a control, AND a transient mark, a timer, a note that waits, an animation. The minimum rows for a transient: the same trigger again inside its lifetime; a second, different trigger inside it; the thing removed, hidden or re-made while it runs; and its end arriving while another is running. A walk of single presses cannot find any of them.

**Principle:** Lifetime is state. A thing that is only on screen for six seconds has a before, a during and an after, and every press that can land in "during" is an order of action nobody walked unless it was listed.

### Observation 590: The browser tests' default port was another chat's server - a run without the port set would have tested someone else's build

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The same batch - running one browser test file from a second worktree on a PC where another chat's preview held the default port
**Skill:** the gates-and-deploy guide (`raptor-port/docs/gates-and-deploy.md`); verification-before-completion
**Type:** open-source
**Phase/Area:** Verification - which build a browser test ran against

**Issue:** The preview tool refused the default port ("in use by another chat's dev server"). The browser-test runner reuses any server already on its port when run locally, so `npx playwright test` with no port set would have run this branch's tests against the OTHER chat's bundle and reported whatever that build did. It was caught only because the preview start failed first; the runner itself says nothing.

**Suggested improvement:** In the gates guide and the shipping rule's paragraph on the lock: a chat names its own port for every browser run (the environment setting the runner reads), and the first step of any browser test is to prove whose build is on that port - for example a build stamp the page exposes, compared with the commit in hand. Until such a stamp exists: start the preview through the preview tool first; a refusal there is the signal.

**Principle:** A reused server makes a test's verdict a fact about whatever is listening, not about the checkout. On a machine shared by several chats, "which build did this run against" has to be answered by the build, not assumed from the folder the command was typed in.

### Observation 591: He asked the same pre-sleep questions for the third night running - and asked for them to become a command

**Status:** ACTIONED (2026-10-15) — the `/overnight` command, `.claude/skills/overnight/SKILL.md` (his approval D869; shaped by D867, D868)
**Date:** 2026-10-14
**Session context:** An unattended overnight run: what can be built without him, what must be asked before he sleeps, how the state is kept across a compaction
**Skill:** New skill candidate: overnight-run (filed as `[OVERNIGHT-SKILL]`, his word D859)
**Type:** open-source
**Phase/Area:** Session start of an unattended run

**Issue:** Each night he asks: how long is the job in hand, what else is outstanding, what can run unattended, what do you need from me before I sleep - then gives the same permissions (decide yourself, this chat, compact, save to the repo, no merge). The agent answers from the handoff and the backlog each time, records a one-off permission each time, and re-derives the same rules (D596, D667, D766) from four places.

**Suggested improvement:** A skill that does it in one call: read the handoff and the backlog's order; list what is ruled and buildable and what is not and why; at most four questions with a recommended answer each (design ones with a picture); record the night's permission; state each job's check; write the state into the repo before the first job and at every commit; park his choices in one list; never merge; one notification; a morning report with pictures and a numbered "what you do now". Its worked example is the night of 14 Oct 26 (the rulings D856 to D859 and that chat's handoff block).

**Principle:** A question the user asks every time is a missing command. The cost of the ritual is not the minute it takes him but the chance that one night a permission is assumed that he did not give.

### Observation 592: A walk helper copied from another walk stepped the wrong way through a date picker - the two walks ran on different clocks

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** Writing a walk script for the small OIL job (a day made a public holiday through the Calendar window, then a published version loaded back)
**Skill:** walk scripts guide (`raptor-port/docs/walk-scripts.md`)
**Type:** internal
**Phase/Area:** Walk libraries - reuse of a helper across walk worlds

**Issue:** The "make a holiday" steps were copied from an earlier walk's library, which pressed "next month" until the date appeared. That library ran with the browser's clock set to the demo week; this one runs on the real clock, months after the demo week, so the picker opened on today's month and the date lay BEHIND it. The script timed out on a date that was never drawn, and three parts reported NOT WALKED. The same copy also assumed a published version's id was its label ("ORIG"); the app's id is the day's date and a number.

**Suggested improvement:** In the walk-scripts guide, under writing a library: (1) a calendar is stepped by READING the month it shows and comparing it with the month wanted, never by a fixed direction; (2) an id used in a selector is read from the page (the first version the menu lists), never assumed from its label; (3) a helper copied from another walk states the clock that walk ran on.

**Principle:** A helper lifted from another harness carries that harness's world with it - its clock, its ids. Read the state from the screen at the moment of use instead of inheriting an assumption that was only ever true next door.

### Observation 593: A reader, a walker and the break tests want three different things held still - their order was worked out by hand

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The small OIL job's FULL check, run unattended: a fresh code reader and a walk helper started together, with break tests and a new browser test still to run
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md` section 4)
**Type:** internal
**Phase/Area:** Sequencing the parts of a check on one checkout

**Issue:** The order says: nobody rebuilds the build a walker is served; nothing rewrites the source a reader reads; a break test rewrites source; a browser test builds. With one checkout and one served folder, that leaves exactly one safe order - reader (handed a commit) and walker (on the served build) together, documents and NEW tests written meanwhile, then break tests, then the build and the browser tests, then the gates - and it had to be reasoned out from four separate sentences. Getting it wrong costs a false finding (10 Oct) or a mixed walk (23 Sep).

**Suggested improvement:** One small table in section 4: for each activity (walker, reader, break test, browser test or build, unit test, document edit) what it needs held still and what it changes - and the standard order for a single checkout. Say that a reader told to read at a commit may still RUN a unit file from the working tree, so break tests wait for it all the same.

**Principle:** When several checks share one working copy, each one's precondition is another's side effect. Write the dependency table once instead of re-deriving the schedule under load.

### Observation 594: A designer's open question was parked as "leave it" - and the code reader then showed it was the very gap the ruling closes

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The small OIL job, unattended: the scenario designer asked what a load does with an input of several days whose unanswered day is not the day loaded; the host parked it for the owner with the recommendation "leave it"
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md`, the unattended-run paragraph and section 4 on scenario design)
**Type:** internal
**Phase/Area:** Parking a question during an unattended run

**Issue:** The host treated the designer's question as a product choice and parked it with a recommended answer that happened to be the cheaper one (no change). The fresh code reader, starting from the ruling's own words, showed a road on which that answer left nobody told at all - the exact fault the ruling was made to end. The parked recommendation had been written without asking "on which road does my recommended answer leave the ruling unmet?".

**Suggested improvement:** In the order's paragraph on parking a choice: before a question is parked with the recommendation "leave it as built", the agent writes the worst road for that recommendation - the setup on which "as built" most plainly fails the ruling's own sentence - and parks it only if that road is acceptable under the ruling. If it is not, it is a finding to fix, and what is parked is the reading that changed.

**Principle:** "Leave it" is a recommendation like any other and needs its own adversarial case. A question a designer raises is a candidate finding until the ruling's own words have been tried against the answer you would give.

### Observation 595: A record edited while the gate run was going failed the run's last check - nothing was wrong with the app

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** The whole gate set running in the background (about 18 minutes); the host used the time to write the backlog, the rulings' records and the handoff
**Skill:** shipping rule, the checks (`.claude/rules/shipping.md`) and the gate runner (`raptor-port/scripts/gatelock.mjs`)
**Type:** internal
**Phase/Area:** What may be edited while the gates run

**Issue:** The document check is the last gate of the set and reads the working files. A line added to a rulings record during the run (a branch name in backticks, read as a file that does not exist) failed it, so the run as a whole reported a failure although every code gate had passed. The honest report then needs a sentence explaining a failure that was never about the code.

**Suggested improvement:** Either the runner runs the document check FIRST (it takes seconds and reads only documents), so later document work cannot fail a run already judged; or the rule says: while the gate set runs, documents may be drafted in the scratch folder but are written into the repo only after the run ends. And in the rulings guide: a branch name in a home cell is written without backticks - backticks there mean a file.

**Principle:** A check that reads the working tree is only as still as the tree. Put the fast, tree-reading checks first, or keep the tree still until they have run.

Met again 15 Oct 26 (`[LW-REARRANGE-EDGE-SCROLL]`), worse: CODE under `raptor-port/src` was edited while the gate set ran (a function call added before its import), and the Tracker smoke — which builds the app itself — built the half-made file and failed in 3 s. Nothing was wrong with the finished code; the run was void and had to be repeated (~15 min). The guard proposed, now for code too: while this checkout holds the gate lock, a hook refuses an edit under `raptor-port/src` (and a document the document check reads) — or the runner works from a copy of the last commit (`git worktree add` at HEAD) so the tree it checks cannot move under it. A habit ("don't edit while it runs") already failed twice.

### Observation 596: A guide for an unattended run sent its plan as a message and so ended the turn - the night could not start until he woke

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** Drafting the overnight command ([OVERNIGHT-SKILL], D859); found by the fresh reader's F1 and F7
**Skill:** New skill candidate: overnight (draft `raptor-port/docs/superpowers/specs/2026-10-15-overnight-skill-draft.md`); writing-skills
**Type:** open-source
**Phase/Area:** Any skill that asks the user something and then must carry on without them

**Issue:** The draft said: send one message with the plan and the questions; if he does not answer, the night goes on. But a message to the user is where a turn normally ends, and nothing runs after it until the user types. The same mistake hid in waiting: a long background run waited on by ending the turn leaves the session idle, and the host lets the machine sleep after a few idle minutes. The writer did not see either; a reader asked to replay a real night did.

**Suggested improvement:** In a skill meant to run unattended: say explicitly that the question is written inside the running turn and the work goes straight on; that the user's reply is read at the next step; that long waits happen inside the turn; and that the keep-awake hold is asked for with the setting that outlasts the turn. Add a pre-flight line: "does any step end the turn before the work is done?"

**Principle:** In an agent loop, "ask and carry on" is not the default shape - asking ends the turn. A skill that must keep running without its user has to say where the turn continues, not only what to ask.

### Observation 597: "Are the checks still running?" read the newest run, and a push starts two runs at once

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** The overnight command's read (F2); filed as `[RUN-CHECK-BOTH-RUNS]`
**Skill:** session-handoff (Step 1, the push check); the shipping rule (`.claude/rules/shipping.md`, the loop)
**Type:** internal
**Phase/Area:** Before pushing to a branch with an open pull request

**Issue:** Three documents tell the agent to look with `gh run list --branch <b> --limit 1` before pushing (D151). Each push starts a short documents run and the long full-checks run at the same second; `--limit 1` can return the short one, which reads "completed" while the full run is still going, and the next push cancels it.

**Suggested improvement:** Replace the command everywhere with one that lists every run of the branch's last pushed commit (`--limit 6 --json status,workflowName,headSha`) and pushes only when none is queued or running.

**Principle:** A "latest item" query answers "is anything running?" only when one thing runs at a time; when one event starts several jobs, ask about the event, not the newest row.

### Observation 598: A guard that holds something back was built "fail open" and still could refuse the system's own recovery

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** [COMPACT-WHEN-MOD] — a hook that holds an automatic compaction until the agent has saved its state (D870); found by the fresh reader
**Skill:** New skill candidate: writing a hook that can refuse an action (today nowhere; `.claude/hooks/compact-guard.mjs` is the worked example)
**Type:** open-source
**Phase/Area:** Design of a blocking hook

**Issue:** The guard let everything through on any error or unreadable input, and the writer called that "fail open". But the same event (an automatic compaction) is fired both for an ordinary early compaction and for the app's recovery from a request that has already overrun; refusing the second makes the request fail, and every retry saw the same stale reading and was refused again. "Fail open on error" did not cover "a valid input that means something else". The writer's own tests checked the cases it had imagined; the reader built the case where the reading was stale.

**Suggested improvement:** For any hook that can refuse: list every situation in which the platform fires that event (from its documentation), and for each say whether refusing is safe; refuse only in the one situation the rule is for, identified positively (a narrow window of values, not inside a helper, a fresh reading, never twice on the same state). And a brief for its reader asks for the case where refusing breaks the platform's own recovery.

**Principle:** A guard is safe only if it can tell the case it guards from the platform's own recovery path; when the two arrive as the same event, refuse narrowly and never twice on unchanged state.

### Observation 599: Resetting a merged branch onto main left it tracking main - every push after it quietly did nothing

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** After pull request 508 merged, the chat reset its branch onto the live version (`git checkout -B <branch> origin/main`, the form the session-handoff guide gives) and carried on; nine commits were "pushed" with `git push -q`
**Skill:** session-handoff (Step 4's template, the "Branch:" line: `git fetch origin main && git checkout -B <branch> origin/main`); shipping rule
**Type:** internal
**Phase/Area:** Continuing work on a branch whose pull request has merged

**Issue:** `checkout -B <branch> origin/main` makes the branch track `origin/main`. With the default push setting, a plain `git push` then refuses (the upstream's name differs) - and `-q` with the output piped through `tail -1` hid the refusal. The chat told him three times that work was pushed; the pull request it opened still held the old head, and its green check was for that old head. Only reading the pull request's head commit before "merge live" caught it - the merge would have shipped almost none of the work. Nothing reached `main` (the refusal is what protected it).

**Suggested improvement:** In the guide's template: `git fetch origin main && git checkout -B <branch> origin/main && git branch --unset-upstream` (or `--no-track`), and the first push `git push -u origin HEAD:<branch>`. In the shipping rule's loop: after every push, read back the remote head (`git ls-remote origin <branch>`) against `HEAD`; and before "merge live", compare the pull request's head commit with the branch's - never trust a quiet push.

**Principle:** A push is done when the remote says so, not when the command exits; any quiet or filtered push needs a read-back of the remote head.

met again 2026-10-21: the handoff's pasted opening line for round 2 of the consistency look said `git switch -c claude/consistency-round2 origin/main` - the new branch tracked `origin/main` (`branch.<b>.merge = refs/heads/main`), and with this repo's push.default=upstream a plain `git push` would have gone to MAIN. Caught by the memory note, unset at once. The guard to propose: the opening-line template ends with `--no-track` (an unconditional default, not a condition to judge).

### Observation 600: In the desktop app a worktree chat takes its settings, hooks and skills from the MAIN checkout, so a merged change to them is dead until that folder is brought to main

**Status:** OPEN
**Date:** 2026-10-14
**Session context:** Running the four checks of the compaction set-up (pull request 509) in a new worktree chat on `main`.
**Skill:** session-handoff (and the merge-live routine in shipping.md)
**Type:** open-source
**Phase/Area:** after "merge live" — verifying that a change to `.claude/settings.json`, `.claude/hooks/` or `.claude/skills/` is actually in force

**Issue:** The app still read "compacts at 97%" in a fresh chat on `main`, though `main`'s `.claude/settings.json` sets `autoCompactWindow` 880000. The chat's process was started with `--project-config-root C:\Users\User\projects\Raptor` — the main checkout — and Claude Code's worktree page says so: in a worktree session started from the desktop app, settings, hooks, skills, agents, commands and `.mcp.json` come from the main checkout's root (`${CLAUDE_PROJECT_DIR}` points there); only CLAUDE.md and `.claude/rules/` load from the worktree. The main checkout sat on an old branch 208 commits behind `main`, so the whole compaction set-up (setting, four hooks, status line) and the `/overnight` skill (pull request 508) were in force in NO chat, and every chat ran 13 Oct's hooks and skills. The previous chat's tests ran the scripts by hand, which this does not show.

**Suggested improvement:** After any merge that touches `.claude/settings*.json`, `.claude/hooks/` or `.claude/skills/`, bring the main checkout to `main` (it must stay on `main`, clean of tracked changes), and verify in a NEW chat by a reading the app itself gives (get_usage, the skill list), never by running the script by hand. Add that line to the merge-live steps and the session-handoff guide.

**Principle:** A configuration change is verified where the running tool actually loads it from — confirm the load path (process arguments, the tool's own documentation) before calling a hook, setting or skill "live"; a script that works when run by hand proves nothing about whether the host runs it.

### Observation 601: A shell here-document holding an apostrophe failed twice in one job, though a memory note names the trap

**Status:** OPEN
**Date:** 15 Oct 26
**Session context:** building [OIL-PLAN-SWITCH-UNASKED]; test bodies and edit scripts passed to Python through a bash here-document
**Skill:** New skill candidate: none — the working practice behind every build (raptor-port/CLAUDE.md §Token discipline; the memory note "Bash heredoc with an apostrophe fails")
**Type:** open-source
**Phase/Area:** writing multi-line scripts during a build

**Issue:** Twice in one job a `python - <<'PY'` here-document whose body held test code with apostrophes ("day\'s", 'it\'s') failed to parse in the shell ("unexpected EOF while looking for matching `''") and the step was redone through the file tool. The trap is already written in a memory note loaded at the start of the session ("write multi-line scripts with the Write tool and run the file; a heredoc body containing ' never parses here"), and was still not applied at the moment of writing — the condition ("unless it holds an apostrophe") has to be judged each time, and under load it is judged wrong. Smaller, apostrophe-free here-documents in the same session worked, which reinforces the habit.

**Suggested improvement:** Make it an unconditional default rather than a condition: any script longer than a one-liner is written to a file in the scratchpad with the file tool and run from there — never a here-document — and say so as one line in raptor-port/CLAUDE.md §Token discipline (or the executor rule), replacing the memory note's conditional wording. A hook that refuses a Bash command containing `<<'` with an apostrophe in its body is possible but heavier than the habit.

**Principle:** Where a safer way costs nothing extra, a rule phrased as a condition to judge each time ("unless it contains X") fails under load; phrase it as an unconditional default ("always do Y").

Met again 17 Oct 26 (the till-date tick build): a node edit script written by a bash here-document carried a regex
inside a JS template literal — `\\d` and `\\.` arrived in the source file as bare `d` and `.`, twice in one job (once in a
test's `<\/span>`), each found only by reading the line back; the Edit tool put each right. Even writing the script itself
through a here-document is the trap: the code edit goes through the Edit tool, or the script through the Write tool.
Met again 15 Oct 26 (`[LW-LANDING-LINE-FIGURES]`): a `python - <<'EOF'` edit script inserting a test wrote each `\\b` of a regex as a BACKSPACE byte and each escaped apostrophe as a bare one — the file first failed to parse, then every `\b` assertion matched nothing; two more inline fixes (`sed` replacements) mangled it again before a script written with the file tool put it right. The guard is the one already proposed and approved to build — `[SHELL-SCRIPT-GUARD]` (D811): a script is written to a file, always.

**Met again 15 Oct 26 (the night's /overnight run, `claude/drag-edge-scroll-elsewhere-51bfc4`):** three more shell here-document / stdin hangs in one night — `cat > file` with no input waited on stdin; a stray `python - <<'PY'` with `< /dev/null` dropped into Python's interactive prompt and looped on a Windows console error until stopped; each cost a two-to-five-minute stall. What held: every edit script WRITTEN WITH THE WRITE TOOL to the scratch folder and run as `python <file> < /dev/null`. The guard this entry proposes (scripts always a file, never a here-document) is the fix.
**Met again 23 Oct 26 (the night's /overnight run, `claude/lw-m2-looks`):** twice more — an empty `python - … < /dev/null <<'PY'` placeholder left in a command and a stray `python - x.mjs <<'EOF'` each hung two minutes until stopped. The rule written down was known and still broken under load: only a guard in the shell (a hook that refuses a here-document feeding an interpreter) would hold.

**Met again 18 Oct 26 (`claude/schedule-amendments-fixes-fffce0`, D994's schedule fixes):** four more — two edit scripts passed to Python through a here-document lost a `\n` (written as a real line break, the file then failed to parse) and an escaped apostrophe; a `sed` fix of a test line lost its `\n` the same way; and one script was written with a relative path one folder too high, landing OUTSIDE the worktree. Each was put right by a script written with the file tool into the scratch folder. The guard proposed here ([SHELL-SCRIPT-GUARD], D811) would have stopped all four.

**Met again 17 Oct 26 ([TRK-SCROLL-GLIDE], round 1):** a `cat >> file <<EOF` holding the question page (prose full of apostrophes) failed the same way; redone through the file tool. The guard stays unbuilt: an unconditional default (pages and scripts always go through the file tool) would have cost nothing here.

Met again 23 Oct 26: the Leave War M2 afternoon round — a here-document writing the evidence sheet's new section (prose full of apostrophes) failed the same way; redone through the file tool. The guard proposed above (scripts always written to a file) still stands.

**Met again 24 Oct 26:** building [LW-ROUND3-BUILD] (round 3 of the Leave War's bid windows) — twice more, a Python here-document of test edits holding apostrophes; redone through the file tool each time. Still the conditional habit; the unconditional default proposed above stands.

### Observation 602: A search for an old wording, cut to its first 40 lines, hid two tests that read it

**Status:** OPEN
**Date:** 15 Oct 26
**Session context:** [OIL-PLAN-SWITCH-UNASKED] — rewording the plan switch's note; finding every test that reads the old words before the change
**Skill:** New skill candidate: none — the roll-call rule "a wording ruling … gets its own small roll-call" (raptor-port/docs/bug-check-order.md §6)
**Type:** open-source
**Phase/Area:** the wording roll-call, before the full gate run

**Issue:** The search for the old sentence ORed several patterns, one of them a common phrase ("nothing pending"), and was piped through `head -40` to keep it short. The common phrase filled the forty lines with unrelated hits, so two tests that read the switch's old words (`draftsui.test.tsx`) never showed; they failed only in the full unit run, a 15-minute cycle later. The same run also failed a register test that lists every file reading the inputs — a new shared file must be added to it — which a search for the module's readers would have found.

**Suggested improvement:** In bug-check-order §6's wording roll-call (and the executor rule): search each exact old phrase ALONE, list FILES (not lines) with no cap, and treat a capped or truncated result as no result. When a change adds a new source file, also search the tests for registers that enumerate files ("every file that …") and run them before the full gates.

**Principle:** A search whose output is truncated proves nothing about what it did not print; search for the exact phrase on its own, list files rather than lines, and never cap the list you are using as a completeness check.

### Observation 603: A picture helper framing an element off screen pictures the top bar, silently

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** `[GLOW-OFF]` walk (`scripts/handpass/glowoff-walk.mjs`), phone size
**Skill:** none — the walk-script guide (`raptor-port/docs/walk-scripts.md` §5) and the shared driver `scripts/handpass/dl-lib.mjs pic()`
**Type:** internal
**Phase/Area:** walk pictures

**Issue:** `pic(w, name, { around: sel })` clips the screenshot to the element's box clamped to the screen. When the first match of `sel` was scrolled above the screen (a lit puck on a long phone board), the clip collapsed to the top of the screen and the "W4 red warning" picture showed the top bar — while the step's measurement (read from the element itself) was right and PASSed. Only opening the picture caught it.

**Suggested improvement:** `pic()` scrolls the framed element into view (block centre) before measuring, or refuses with an error when its box is not inside the viewport; §5 of the walk-script guide gains one line: "a framed picture scrolls its subject into view first — a box off screen is clamped to the edge and pictures the wrong thing".

**Principle:** A helper that silently clamps a request it cannot honour produces confident wrong evidence; make it honour the request or fail loudly.

### Observation 604: A drag aimed by a fraction of a row's height can land back in place at another size

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** `[GLOW-OFF]` walk — the board's line drag
**Skill:** none — `raptor-port/docs/walk-scripts.md` §4 (steps)
**Type:** internal
**Phase/Area:** walk gestures

**Issue:** The drag moved the pointer 1.6 line-heights below the grip. On the desktop that landed in the next formation; on the phone (taller lines, a different stack) the same script's drop resolved to the line's own place — no move, so correctly no landing flash — and the step read as a FAIL of the app. A small probe that dragged the same way passed, which cost three re-runs to separate. Aiming at the target element's own measured box (just below the middle of the next formation's first line) fixed it at both sizes. Also: the landing flash is painted after the board's redraw, so a single look 60ms after the drop missed it — a wait for the element fixed that.

**Suggested improvement:** §4 of the walk-script guide: "a drag is aimed at the TARGET's measured box, never by a distance from the grip; before judging a drop, record what moved (the order before and after) — a drop that landed in place is the script's, not the app's"; and "a mark painted after a redraw is waited for, never looked for once".

**Principle:** Express a gesture in terms of the thing it acts on, and record the state change it should cause, so a gesture that missed is told apart from an app that failed.

### Observation 605: A one-line follow-up change got the whole walk re-run — he asked why

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** `[GLOW-OFF]` — after his answer D879 (one CSS line: the people picker's chip), the agent re-ran the whole 18-step walk script at both sizes
**Skill:** none — `raptor-port/docs/bug-check-order.md` §5 "the re-walk" and `raptor-port/docs/walk-scripts.md` §6
**Type:** internal
**Phase/Area:** re-walk sizing

**Issue:** The order already says a re-walk covers only what the fixes touched. Because the walk was a script ("cheap"), the agent re-ran all of it for a one-line change: it cost minutes, ran steps unrelated to the change, and on the phone stopped at an unrelated page change before reaching the one step that mattered. The owner asked: "Why do u need a whole walk for just a change in 1 area". The chip was then checked alone, which was the right size from the start.

**Suggested improvement:** walk scripts take a step filter (e.g. `ONLY=W16`), and §6 of the walk-script guide says: "a re-walk runs only the steps of the places the change touched — a script being cheap is not a reason to run all of it".

**Principle:** Size a re-check by what changed, not by how cheap the tool makes repeating everything; extra steps add their own failures and noise.

### Observation 606: A close-up "around the element" fails for a mark bigger than the screen, and for a hidden copy

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** [GUIDE-NO-GLOW] — picturing the places that still glow, today beside no glow, for the owner
**Skill:** brainstorming (its `mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** taking the pictures of a mock-up on the real app

**Issue:** The picture script cropped each close-up as "the element plus a margin". Three of eight places came out wrong on the first run: the Leave War's open-bidding box is wider and taller than the screen, so its "close-up" was the whole grid and the glow could not be seen (and after a scroll to the page top it was off to the side entirely); today's day card is taller than the screen and its light falls BELOW it, so the crop missed the light; and on Edit Schedule the first match of a selector was a hidden copy of the week with no box, so nothing was pictured. Each cost a re-run; the pictures were only caught by opening them.

**Suggested improvement:** In the mock-up guide's picture step: (1) pick the n-th VISIBLE match (non-zero box), never the first match; (2) for a mark larger than the screen, or one whose effect falls outside its own box (a shadow below, a halo), crop the EDGE where the effect is — bring it into view first, then clip a fixed window round that edge; (3) open every close-up before building the page, comparing today against the changed version — a pair that looks identical means the crop missed the change, not that there is none.

**Principle:** A crop rule tuned for small things silently fails for big or off-box effects; frame the place where the difference lives, and verify each before/after pair actually differs before showing it.

### Observation 607: Stopping a gate run's background task leaves the run's processes alive and the PC's lock held

**Status:** OPEN
**Date:** 15 Oct 26
**Session context:** the night's /overnight run on `claude/drag-edge-scroll-elsewhere-51bfc4` — a full gate run (`gatelock.mjs run`) stopped on purpose, twice, because the code was about to change
**Skill:** overnight (internal) — and `.claude/rules/shipping.md` §The checks
**Type:** internal
**Phase/Area:** the checks under the PC lock

**Issue:** Stopping the background task that ran `node scripts/gatelock.mjs run …` ended only the shell: the `gatelock` node process, vitest and its fifteen workers ran on, and the lock stayed held (its status still showed the run). Both times they had to be found by their command lines (the worktree's path) and ended, and the lock released by hand. A chat that trusted "stopped" would have built or started a second run beside a live one — the very clash the lock exists to stop.

**Suggested improvement:** in shipping.md §The checks (and the overnight guide's "through the night"), one line: to stop a gate run, end its processes by their command line (this checkout's path), then `gatelock.mjs status` → `release`, and confirm `free` before anything builds. Better, a guard: `gatelock.mjs` kills its child tree and releases on SIGTERM / SIGINT (a structural fix, not a rule to remember).

**Principle:** Stopping a wrapper is not stopping what it started; any tool that holds a shared lock should release it — and end its children — when it is itself stopped, or the stop must be verified by reading the lock, never assumed.

### Observation 608: A "look before you push" check chained with `&&` does not stop the push — it only has to succeed, not say "none"

**Status:** OPEN
**Date:** 15 Oct 26
**Session context:** the night's /overnight run, `claude/drag-edge-scroll-elsewhere-51bfc4` — pushing the spare job's commit while the pull request's checks were running
**Skill:** overnight (internal) — and `.claude/rules/shipping.md` (D151, never push while a pull request's checks run)
**Type:** internal
**Phase/Area:** pushing a branch with an open pull request

**Issue:** The push was written `gh run list … --jq '[…queued or in_progress…] | length' && git push`. The count printed 2 — runs were going — but `gh` succeeded, so `&&` went on and pushed, restarting the checks (D151 broken). Earlier the same night a wait-loop that compared the count to "0" before pushing held correctly.

**Suggested improvement:** in shipping.md's D151 line, give the one safe form: `[ "$(gh run list … | length)" = "0" ] && git push`, or a small script (`node raptor-port/scripts/canpush.mjs <branch>`) that exits non-zero while any run of the branch's last pushed commit is queued or in progress — the guard inside the action, not a number to read.

**Principle:** A check meant to gate an action must fail when the condition fails; a command that merely reports the condition, chained with `&&`, gates nothing.

### Observation 609: A bare `cat >` at the head of a shell command waits on input for ever, and the time-out hides it as "moved to the background"

**Status:** OPEN
**Date:** 15 Oct 26
**Session context:** calendar step two (D901) — editing files by a short script run from the shell
**Skill:** New skill candidate: none — the project's script-writing memory notes (`bash-heredoc-apostrophes-fail`, `node-e-in-git-bash-mangles-escapes`)
**Type:** open-source
**Phase/Area:** writing an edit script and running it

**Issue:** Twice in one chat a command began `cat > "$TMPDIR/x" 2>/dev/null; python - <<'EOF' …` (a leftover half of a "write the script, then run it" habit). `cat` with no file and no heredoc of its own reads the terminal, which never ends; after two minutes the tool moved the command to the background and the edit never ran. Nothing said why — it looked like a slow command. The second time also carried a heredoc body with apostrophes, which the project already knows fails here.

**Suggested improvement:** In the project's notes on running scripts, one line: write every multi-line script with the file-writing tool and run the file; never begin a shell command with `cat >`; and give every shell command that runs a script `< /dev/null`, so anything that reads input ends at once instead of waiting.

**Principle:** A command that can wait for input will, in a tool with no keyboard — close its input by default, so a slip ends in an error rather than a silent stall.
- met again 20 Oct 26 (removing a merged HANDOFF block): the same `cat > "$TMPDIR/x"` lead-in stalled two minutes, again with an apostrophe in the heredoc; redone through the file tool. Third time — the guard (input closed by default) is what stops it, not the note.

Met again 18 Oct 26 (`claude/schedule-amendments-fixes-fffce0`): twice a command began `cat > <file>` with no input (once `cat > /tmp/x.test.ts 2>/dev/null; mkdir …`) — each stalled two minutes and was moved to the background before it was stopped. The same proposal stands: never begin a command with `cat >`; close input with `< /dev/null`.

Met again 24 Oct 26 (`claude/lw-m3-placing-leave`, the M3 follow-ups): five edit scripts written inline in the shell broke — a template literal's backticks inside a `node -e "…"` were run by bash as commands (two picture names came out blank), a `\\[` in a heredoc reached the regex unescaped, a `"\\n"` became a real line break. Each was redone with the file-writing tool and ran first time. The guard stands as proposed: every multi-line or quote-bearing script goes through the file tool, unconditionally.

### Observation 610: Before/after pictures of the live app need no second checkout or server

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** calendar step two — a browser gate failed on a phone size; the change had to be put to the owner with pictures of the live app beside the branch.
**Skill:** brainstorming (mockups-on-the-real-app.md); walk-scripts.md
**Type:** open-source
**Phase/Area:** taking "before" pictures of the production version

**Issue:** The first attempt extracted the whole main branch (picture folders included, ~4 GB) and stalled for minutes. Excluding the documents and reference folders from the archive made the copy, install and build take under a minute; and serving the built folder through the browser automation's own request routing (fulfil every request from the dist folder, index.html as the fallback) needed no second preview server, no launch-config edit and no port. One trap: the app exposes its test hooks only on a localhost address, so the routed base URL must be http://localhost:<unused port>, not a made-up host.

**Suggested improvement:** Add to mockups-on-the-real-app.md (or walk-scripts.md) a "before pictures" recipe: `git archive origin/main -- <app> ':(exclude)<app>/docs'` into the scratch folder, `npm ci && vite build` there, then a picture script that routes `http://localhost:<free port>/**` to that dist folder; take the same steps on the branch's served build.

**Principle:** To compare a branch with production, build production from an archive that leaves out the bulky non-code folders, and serve it from inside the test browser rather than standing up a second server.

### Observation 611: A control the change was told to leave alone is measured before and after, not eyeballed

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** calendar step two — moving two buttons into a toolbar row on a phone (D910), with "the other buttons keep their size" in the ruling.
**Skill:** bug-check-order (raptor-port/docs/bug-check-order.md §9/§10 anti-pattern 21); mockups-on-the-real-app.md
**Type:** open-source
**Phase/Area:** the walk after a layout change

**Issue:** An exclusion added to the row's shared button rule (`:not(<complex selector>)`) raised that rule's specificity, so it began to beat a later, narrower rule for a neighbouring control (the settings gear) and shrank its glyph from 17px to 12px on every screen size, the desktop included. The walk's own pictures showed the smaller gear and were "looked at"; nobody noticed, because nothing compared the untouched controls before and after. A fresh blind code reader found it from the stylesheet weights.

**Suggested improvement:** When a ruling says some controls must NOT change (keep place / keep size), the walk script measures them (computed font-size, padding, box) on the live build and on the change, and asserts equality — a before/after table, not a picture. And a CSS note for the design guide or the walk-scripts guide: an exclusion added to a shared rule is written `:where(:not(...))` so the rule keeps its weight.

**Principle:** "Unchanged" is a claim to measure against the old build, not something to see in a picture; and any selector added to a shared rule can silently change which rule wins elsewhere.

### Observation 612: Draw a layout question in the state an already-ruled change will leave the screen in — and in the case it is about

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** [INPUT-NEW-DEFAULTS] — drawing his idea D913 A (time and remarks above an input's calendar) beside D917 (a new input opens on OL, ruled, not yet built)
**Skill:** brainstorming (`mockups-on-the-real-app.md` — Judging the Proposal)
**Type:** open-source
**Phase/Area:** choosing the state to picture before the transform

**Issue:** The first drawing of A was shot with the kind the build will open on (OL). Measured, that window already fits the phone with nothing to scroll, so A looked pointless; the case his idea was about (a commitment with a title and hours, where Remarks hides under the window's button bar) only showed when the same pictures were taken again with Event. An earlier drawing of the same question had used a saved Meeting and never showed the OL case either.

**Suggested improvement:** Under "Include one BUSY state by default", add: when another change already decided will alter the screen first (a new default, a removed field), picture the proposal in that future state; and picture it in each state that changes the answer (here: a kind that fits, a kind that does not), with the measurement that shows the difference.

**Principle:** A layout proposal is judged in the states that change its answer, including the state an already-decided change will produce — one state can make a good idea look useless or a bad one look fine.

### Observation 613: A picture rule that lives only in files loaded with interface work is missed when the agent is only "explaining"

**Status:** ACTIONED (2026-10-15) — the owner's D921 put the rule in `.claude/rules/plain-language.md`, which every chat loads, and widened it to explanations; `design-practices.md` §0 and `ui-design.md` point 1 say so.
**Date:** 2026-10-15
**Session context:** [INPUT-NEW-DEFAULTS] — telling him what two backlog leftovers were (a Tracker window's row arrows, the OIL question's small calendar)
**Skill:** none (a project rule file); related: brainstorming `mockups-on-the-real-app.md`
**Type:** internal
**Phase/Area:** reporting to the owner

**Issue:** The rule "every design or interface point comes with a picture, the area marked" (D853) was loaded and in force, yet two leftovers were explained to him twice in words alone; he asked a third time where exactly, then made the rule again (D921). The agent had read the rule as covering things PUT TO HIM to decide, and classed "what is this item" as a recap, not a design point.

**Suggested improvement:** Done as D921: the rule names explanations and recaps, and sits in an always-loaded rule file. A check-before-send line could ask: "does this message name anything on screen? then is a picture attached?"

**Principle:** A rule scoped by the kind of message ("a proposal") gets skipped when the agent classes its message as another kind; scope it by its trigger (anything on screen is named) instead.

### Observation 614: A touch-emulated tap leaves a hover ring on the last button in a mock-up picture

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** Drawing the Tracker's Reorder finger drag on the real app ([TRK-REORDER-FINGER-DRAG], D922); the "after the drop" frame reached its state by tapping the real ▼ buttons.
**Skill:** brainstorming (reference: mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** Traps When Injecting Into a Live Page

**Issue:** In a touch-emulated browser context (isMobile, hasTouch), the ▼ tapped to reach the state kept a blue hover/focus ring in the screenshot, so the picture showed a pressed button that the proposed flow (a drag) never touches. `element.blur()` did not remove it; a tap on a neutral element (the window's title) did. Nothing failed — only looking at the picture caught it.

**Suggested improvement:** Add to "Traps When Injecting Into a Live Page": a state reached by tapping the app's own controls leaves the last control hovered or focused; tap a neutral, non-closing element (a heading) before the picture, and say in the caption which controls the depicted flow touches.

**Principle:** The steps used to reach a pictured state leave their own marks on the screen; clear the traces of the setup before the shot, or the picture shows actions the proposal does not involve.
### Observation 615: A script that inserts under a document heading found the heading's name in the file's own prose first

**Status:** OPEN
**Date:** 2026-10-15
**Session context:** The night run of 15 Oct 26 — writing a new chat block into HANDOFF.md under `## Now` by a Python edit (`s.index('## Now')`). Numbered past #614, which sits on the unmerged branch `claude/trk-reorder-finger-drag`.
**Skill:** session-handoff (and overnight, which writes the night's block)
**Type:** open-source
**Phase/Area:** writing a block under a heading

**Issue:** HANDOFF.md's opening paragraph mentions "`## Now`" in backticks, so a substring search for the heading matched the prose on line 3 and the new block landed above the heading. The document check caught it ("the block … sits outside ## Now"); nothing was lost, but only because the check exists.

**Suggested improvement:** In the guides that write a HANDOFF block, say: find a heading by a whole LINE (`\n## Now\n`, or a line-anchored regex), never by its words — a file that describes its own structure names its headings in its prose. Same for any marker-based insert.

**Principle:** A file that documents its own layout contains its headings' names as text; anchor every insert on the heading's full line, not on its words.

### Observation 616: A browser check reused a server another checkout left on its port, and tested the wrong app

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** Quals' one row (D935) in a fresh worktree; the first run of the new browser test.
**Skill:** New skill candidate: none — the project's checking order (bug-check-order §7.2, "Stand up the real thing")
**Type:** open-source
**Phase/Area:** standing up the build to test

**Issue:** The browser tests reuse a server already listening on their port. Another worktree's preview held that port, so the new test ran against an older build and failed on a control this change had removed; the in-app preview had silently taken the next port. A second, smaller trap the same hour: a walk and a test read a button's words with innerText, which counts the full words kept for a screen reader, so both "failed" while the pictures were right. Written into `raptor-port/docs/gates-and-deploy.md` and `raptor-port/docs/walk-scripts.md` §4.

**Suggested improvement:** In the checking order's §7.2, one line: before a browser run, confirm the server on the port is this checkout's build (its command line, or a fact only the new build has), or run on a free port.

**Principle:** A test that reuses a running server proves only that server; check whose build it is before trusting a red or a green.
**Met again 2026-10-16:** the Medical cards job (`claude/sharp-goldberg-6d0656`) — this chat's OWN walk preview was still on 4173 when it ran a browser break test, so the deliberately broken styles were never built: the tests passed in 2.6s on the unbroken build. Caught only by the time. Third meeting (590, 616, this). **Proposed guard (in place of a judgement each time):** the browser-test config refuses to reuse a server unless it serves the checkout's own build — or a break-test step always stops the port first (`gatelock.mjs` could do it before any browser run).

### Observation 617: Marks drawn as boxes over a page drift from their text on a phone; a mark drawn on the element cannot

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** the whole-app words pass, round 1 — before-and-after pictures of the real app with each text outlined and numbered
**Skill:** brainstorming (`mockups-on-the-real-app.md` — Traps When Injecting Into a Live Page); `raptor-port/docs/walk-scripts.md` §5
**Type:** open-source
**Phase/Area:** marking the area talked about in a picture

**Issue:** The first script measured each text's box and laid an absolutely placed outline over the page at those coordinates. On the desktop the boxes fitted; on a phone three of six landed a line or more below their text, and on the Scheduler Board (a layer that scrolls by itself) every box missed. The script reported no error and listed every mark as found. Drawing the mark on the element itself — an outline (it takes no room) and a numbered tag in its own `::before` — fixed all of them at once.

**Suggested improvement:** In the mock-up guide's traps: mark an element with an outline and a tag on the element itself, never an overlay at measured coordinates; and an "after" picture finds its frame again after the change, since a removed line moves everything below it.

**Principle:** A mark that is a copy of a position goes stale the moment anything moves; a mark carried by the thing itself cannot.

Met again 20 Oct 26 ([STANDBY-WEEK-B] mock-up, `mock-standby-week-b.mjs`): red boxes drawn `position:absolute` at measured coordinates on the DESKTOP week landed a column to the left of their headings — the week was still gliding to the day after the marks were placed; a wait for the day card to stop moving did not cure it, outlines on the elements did. The guard to propose at the next review: the mock-up guide's Method step 3 says marks are outlines on the element, unconditionally (not "unless").

### Observation 618: A line moved into a fold lost its subject; only the cold read caught it

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** the whole-app words pass, round 1 — the editing hint printed on every day's input panels proposed to move, word for word, into the page's Legend fold
**Skill:** the design guide (`raptor-port/docs/design-practices.md` §1 — the three ends of a note, "moved under one short fold"); impeccable (reference/clarify.md)
**Type:** open-source
**Phase/Area:** moving text rather than deleting it

**Issue:** The writer treated "moved word for word" as needing no cold read — no word changed. Labelled "Editing:" in the Legend, the line no longer said what it applied to: in its panels the heading beside it had carried that. The fresh reader asked "editing what — inputs, flights, everything?". It now opens with the two panels' names.

**Suggested improvement:** §1's third end (and §1a): a text moved away from what it describes takes that thing's name with it, and a moved text gets the cold read like a reworded one — the place it stood was part of its meaning.

**Principle:** Context is content: a sentence that leaves its place must carry with it whatever the place was saying for it.

### Observation 619: Turning his words into a guide rule drifted twice in one line — the fresh read is what kept the lesson his

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** the whole-app words pass, round 1 — his first "design lesson" written into the design guide under his new rule D941 (lessons written in by themselves, one fresh reader)
**Skill:** the design guide (`raptor-port/docs/design-practices.md` §0 step 2, §9); record-decisions (writing the "point behind it")
**Type:** open-source
**Phase/Area:** generalising an owner's correction into a standing rule

**Issue:** He wrote "There isn't a need for this. Although it's such a weird way to put just words there with no label." The writer's lesson added a reason he never gave ("a scheduler learns it once"), widened "just words with no label" into "never plain instructions" in a legend, and wrote "does not repeat", which reads as "say it once somewhere". The guide's mechanism paragraph also gained a filter the option he chose did not have ("no point beyond its own screen"). The fresh reader, given only his words and the option he picked, found all of it.

**Suggested improvement:** In §0 step 2 (and the rule's short form): the lesson line quotes or closely paraphrases his words, adds no reason he did not give (a reason of the agent's goes in the ruling's readings, marked as the agent's), and is no wider than what he corrected; the reader is handed his words and the line, nothing else.

**Principle:** When a person's correction becomes a rule, the risky step is generalising — every added reason or widened scope is the writer's, not theirs; check the rule against their exact words, not against the writer's understanding.

### Observation 620: An overnight run's worktree may have no packages installed

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** /overnight, night of 16–17 Oct 26 — a fresh worktree switched to the night's branch; the first build failed ("tsc is not recognized") because the worktree had never had `npm ci`.
**Skill:** overnight
**Type:** internal
**Phase/Area:** Part 1 step 9 (start the night)

**Issue:** The night's first build stopped on a missing package folder. A fresh worktree is created per chat, and `raptor-port/node_modules` is not shared between worktrees, so every new night chat meets this — found only when a build is first attempted, mid-job.

**Suggested improvement:** Step 9 gains one line: in the night's checkout, if `raptor-port/node_modules` is missing, run `npm ci` (a few minutes) before the first job — alongside keep-awake and the guard.

**Principle:** An unattended run should prove its tools work before its first job, not discover a missing setup step inside the work.

### Observation 621: A records commit pushed seconds after opening the pull request cancels its first run

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** /overnight, night of 16–17 Oct 26 — opened PR 522, then committed and pushed the night's block straight away; the push cancelled the PR's first full run (D151).
**Skill:** overnight
**Type:** internal
**Phase/Area:** Part 2, "Pull requests" / "At every commit"

**Issue:** The guide says to write the block at every commit and, separately, never to push while a PR's checks run. Right after opening the PR the two collide: the block is due, the run has just started, and the push restarts it (20 minutes lost).

**Suggested improvement:** In "Pull requests": write and commit the block BEFORE opening the PR (the block names the PR as "to be opened"), then open it; after that, commit records locally and push only when step 1's command shows no run of the last pushed commit queued or in progress.

**Principle:** When two standing rules meet at one moment, order the steps so the cheaper one goes first.

### Observation 622: An unattended run's checkout keeps its branch, so the morning chat cannot switch to it

**Status:** ACTIONED (2026-10-17) — D975: session-handoff's "Release the branch as your LAST step" and the switching opening line; overnight's Part 3 releases the branch last
**Date:** 2026-10-17
**Session context:** the morning chat after the night of 16–17 Oct 26, told "switch to branch claude/whole-app-words-pass-1b-6cfe51 and pull"
**Skill:** overnight (also session-handoff)
**Type:** internal
**Phase/Area:** overnight — the closing step; session-handoff — the step that frees the branch

**Issue:** The night's run ended with its branch still checked out in its own worktree. The morning chat's `git switch` was refused ("already used by worktree"), and detaching the old checkout from the new chat was refused by the permission guard as interfering with another workload. The chat had to take the branch's tip into its own checkout and push back to the branch by name instead — workable, but a detour, and it nearly touched shared git settings on the way (`push.default` written to the shared config).

**Suggested improvement:** In overnight's closing step and in session-handoff's "free the branch" step: once everything is pushed, the run itself runs `git checkout --detach` in its own checkout as its last command, and the HANDOFF block says it did. The opening line can then say "switch to <branch>" and it works.

**Principle:** A handoff is not finished while the outgoing session still holds a resource the incoming one must take; release it from the side that owns it, because the other side may not be allowed to.

Met again 2026-10-17: the [CONTEXT-START-SIZE] handoff (session-handoff, a day chat) left `claude/sharp-goldberg-6d0656` checked out; the next chat's switch was refused, and this time `git -C <old checkout> checkout --detach` from the new chat was allowed (the old checkout was clean and level with its remote). Guard to propose: the session-handoff skill's last step runs the detach itself and the block's "Branch:" line says "released"; or the opening line it writes carries a fallback ("if the switch is refused, detach the old checkout when it is clean and pushed").

### Observation 623: Tidying the handoff before a merge restarts the green pull request's checks

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** a side session sent to merge two stacked pull requests on his "merge live" (522, then 523 cut from 522's tip); the brief said "before each merge, rewrite or remove the HANDOFF blocks".
**Skill:** session-handoff (and shipping.md's merge steps)
**Type:** internal
**Phase/Area:** session-handoff — removing a merged block; shipping — the "merge live" sequence

**Issue:** Removing the first pull request's block before it merges means a push to that pull request, which restarts its whole check run (D151; a pull request carrying code re-runs every gate even for a notes-only push), so a green, ready merge waits about 15 more minutes for nothing. Done literally, the brief costs a full check run per merge.

**Suggested improvement:** In session-handoff's "remove a merged block" step and shipping.md's merge sequence: never push notes to a pull request that is green and waiting only for "merge live". Merge it as it is; carry the block's removal (and its backlog filing) on the NEXT commit that goes out anyway — the stacked pull request's level-with-main commit, or the next job's branch. Say in that commit which merged block it removes.

**Principle:** A record update that would restart a finished check rides on the next change that has to be checked anyway; never spend a check run to tidy notes.

### Observation 624: The shell's $TEMP is one folder for every chat on the PC — a fixed file name there reads another chat's file

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** the Medical cards job (`claude/sharp-goldberg-6d0656`), a background check run writing its results to `$TEMP/after.txt`.
**Skill:** New skill candidate: none — the project's checking guide (`raptor-port/docs/walk-scripts.md` §5, "A script writes only under its own checkout") and the gate scripts
**Type:** open-source
**Phase/Area:** where a run writes its logs

**Issue:** A check run wrote `$TEMP/after.txt`; before it finished, reading that name printed a list of backlog ids — another chat's file of the same name. In Git Bash `$TEMP` is the user's one temporary folder, shared by every worktree and chat; only the harness's per-session scratchpad is private. A FAIL or a count read from such a file can be another job's.

**Suggested improvement:** In `walk-scripts.md` §5 (and the gate scripts' own `--logs` default), one line: logs and scratch files go to the session's scratchpad or a folder under the checkout, never a fixed name in `$TEMP`; a name in `$TEMP` carries the session's id.

**Principle:** A shared folder is a shared namespace; a fixed file name in it is a race with every other writer.

### Observation 625: A fixed pixel limit in a browser test is a limit on one machine's letters

**Status:** OPEN
**Date:** 2026-10-16
**Session context:** the Medical cards job — "a card is at most 104 wide" passed on his PC and failed on GitHub's Linux machine (107), reported by the old merge chat.
**Skill:** New skill candidate: none — the project's checking guide (`raptor-port/docs/walk-scripts.md` §4, steps and what they assert)
**Type:** open-source
**Phase/Area:** writing geometry assertions

**Issue:** The test pinned a pixel figure measured from the drawing on one machine. Text width differs between machines (fonts, hinting), so the figure was a property of the PC, not of the ruling ("three a row"). The reader had flagged the test as font-bound; it still went out and failed only in CI, costing a red run.

**Suggested improvement:** In `walk-scripts.md` §4, one line: a geometry assertion states the ruling's relation (a third of the row, inside its card, one line) and measures both sides on the page; a fixed pixel figure only for a size the app itself fixes (the 74px puck, the 36px row).

**Principle:** Assert the relation the rule names, not the number one machine produced for it.

### Observation 626: A guard that reads commands needs a shell's reading from its first draft, not after review

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** building the push-and-lock guard ([PUSH-LOCK-GUARD], D976) — a PreToolUse hook that refuses some commands
**Skill:** New skill candidate: writing a command-refusing hook (or a section of the plugin-authoring / hook guidance)
**Type:** open-source
**Phase/Area:** design of any hook that judges a shell command line

**Issue:** The first draft split the command on `;`, `|`, `&&` and new lines before looking at quotes. Three fresh reads then found 8, 10 and 8 problems, nearly all of the same family: commit messages, heredocs, here-strings, comments, `$( … )`, PowerShell's own quoting, and tool names that appear as arguments (`grep vitest`) rather than as the command. Each was a false refusal of everyday work or a way round the guard.

**Suggested improvement:** Before writing such a hook, list the shell features it must read (quotes, escapes per shell, heredoc and here-string bodies, comments, substitutions, `bash -c`/`eval`, redirects, launcher words like `timeout`/`env`), judge only the word in command position, and write the everyday-command corpus (commit with a heredoc message, PR body, grep for the tool's name) as tests first.

**Principle:** A rule that inspects free-form input is only as good as its reading of that input; build the reader to the input's real grammar before the rule, and test the common harmless cases first, because a false refusal on every-day work costs more than the gap it closes.

### Observation 627: A fault found in passing is re-proved through the app's own door before it is filed

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** [MED-NEWYEAR] — a backlog item said a medical input across New Year never shows on the Medical tab
**Skill:** New skill candidate: none — the project's checking guide (`raptor-port/docs/bug-check-order.md`, the "found while…" findings; `raptor-port/docs/walk-scripts.md` §3 Fixtures)
**Type:** open-source
**Phase/Area:** filing a fault met while proving something else

**Issue:** A test for another fix planted a row straight into the data, without the end date's year, and the calculation it fed failed. The fault was filed as real for new data, with a planned engine change. The next chat probed the app's own save path first: every door writes the year, the screen was right, and the item closed as "not a fault" after a walk — but the backlog item, its priority line and a planned engine change had all been built on the planted row.

**Suggested improvement:** One line where the order speaks of a fault found in passing: before it is filed as a fault of the app (and before D56's "real for new data" is claimed), reproduce it through the control a person uses — or say in the item that it was seen only in planted data. In `walk-scripts.md` §3: a fixture planted straight into the data can make shapes the app never writes; a failure that depends on its shape is checked against the real door before it is reported.

**Principle:** A failure seen only with hand-made data is evidence about the data until the real input path reproduces it.

### Observation 628: A proof runner read "killed for too much output" as "the break was not caught"

**Status:** ACTIONED (2026-10-17) — `raptor-port/scripts/handpass/breaks.mjs` takes up to 256 MB of output and names a run that itself failed
**Date:** 2026-10-17
**Session context:** [OIL-CONFIRM-DAYGRID]'s break tests — eight of eleven breaks came back "did not finish (exit null)"
**Skill:** none — the project's break-test runner (`docs/walk-scripts.md` §9)
**Type:** open-source
**Phase/Area:** verification — proving a test can fail

**Issue:** The runner ran each broken build's tests through a child process with the default 1 MB output limit. A test file that renders the whole app prints the page with its failure (3.2 MB), so the child was killed and the runner reported "ERROR — the run did not finish": every break whose test went red looked like a break with no proof. Run by hand, each was caught in 12 seconds.

**Suggested improvement:** done — a large output limit and the child's own error printed. For any runner that judges a child's result: treat "the child was killed" as its own verdict with its cause, never folded into pass or fail.

**Principle:** A harness that cannot tell "the check failed" from "the harness failed" reports its own limits as findings about the code; name the harness's failure separately.

### Observation 629: An answer written mid-turn did not reach him — he asked the same question four times

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** `/overnight` (the night of 17 Oct 26): the Tracker tidy-up was running inside one long turn when he sent "What are the jobs u are doing tonight", "Any questions now?", "What is this job about again?", "What's a trackers import tidy up", "What are u tidying", "Answer me clearly … asap I want to sleep", "Answer me", "Answer me now…".
**Skill:** overnight (internal)
**Type:** internal
**Phase/Area:** Part 1, between his go and the first job — a message of his arriving while a turn runs

**Issue:** Each of his messages arrived inside the running turn. The agent answered each one in text and carried on with tool calls in the same turn. He kept asking, so the answers were evidently not reaching him (or not as an answer) while the turn ran. Only ending the turn with the answer worked, and that cost the guide's own rule (an idle session lets the PC sleep). The fix that worked: end the turn with the plain answer plus "reply go before you sleep", and on his "go" carry on to the end without stopping. The memory note "Answer a mid-run question first" (28 Sep 26) already says "what he must copy goes as a file or ends the turn", but it did not trigger for a plain question.

**Suggested improvement:** In the overnight guide, Part 1 step 9 / Part 2: "A message of his that arrives while the run is going is answered by ENDING the turn — the answer, then 'reply go before you sleep so the night keeps going' — never by text inside a running turn; on his go, carry on." Pair it with the existing memory note, widened from "something to copy" to "any question".

**Principle:** When the person is watching and asks something mid-run, the answer belongs at a turn boundary, where the interface reliably shows it; a reply buried among tool calls reads to them as silence, and silence makes them ask again.

### Observation 630: A picture run drove another chat's stale server on a port it assumed was free

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** the Tracker batch (D495) — the before pictures of each visible change
**Skill:** New skill candidate: walk-script preamble (the bug-check order §7.2, `docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** standing up the build a walk or a picture run drives

**Issue:** The before-pictures were served with `vite preview --strictPort` in the background; the server failed at once ("port in use") but the picture script, started in the same command, ran anyway and took a full set of pictures from whatever answered on that port: another chat's preview of a day-old build. Only the background job's failure notice, read afterwards, gave it away.

**Suggested improvement:** In `docs/walk-scripts.md` (and the helper drivers), a walk or picture script checks, before its first picture, that the page it loaded is the build it means to drive — the served `index.html`'s asset name against the `dist` it was built from — and stops if not; and a background server's start is confirmed before anything drives it.

**Principle:** Before trusting evidence from a running service, prove it is the instance you started — a free-looking port is not proof of identity.

### Observation 631: A keyboard walk over a graph needs a test that every node is reachable

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** the Tracker batch — D980, the chart by keyboard
**Skill:** New skill candidate: keyboard-navigation design check (the design guide §2)
**Type:** open-source
**Phase/Area:** designing arrow-key navigation over a chart, tree or graph

**Issue:** The arrows were built to the ruled mapping (along the lines, above / below) and every step test passed; the independent scenario designer asked "can every event be reached?" — and on the real charts 13 could not (branches and multi-parent events). A first exhaustive check then reported false gaps because its state left out part of the navigation's memory.

**Suggested improvement:** Wherever a keyboard walks a structure (the design guide §2's table), the check includes one exhaustive test over the REAL data: every state of the navigation (position plus whatever it remembers) explored from the start, every item reached. Keep the navigation's memory small enough that this search is finite.

**Principle:** For a navigation rule, test reachability over the whole real structure, with the full state the rule keeps — per-step tests prove the steps, not the coverage.

### Observation 632: A check that passes on main and fails on a branch — replay both builds side by side, logging state at every step

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** The Tracker batch's one open fault: a phone check in the Tracker suite failed by 51px on the branch and passed on main. The chat before had tried removing suspected changes one at a time (three experiment builds) without finding it.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause investigation) — gathering evidence

**Issue:** Guessing which change caused the difference, and building without it, spent three builds and found nothing. Replaying the check's own steps against BOTH builds, printing the same state after every step, showed in one run where the two runs first parted (an earlier step, not the one under suspicion), and why: a deliberate fix changed where an earlier step drew, so later steps started from different places and the check's promise became impossible on that path — a check that had passed on main by luck.

**Suggested improvement:** In Phase 1, add: when a test passes on one version and fails on another, run the test's own steps on both with the same state printed after every step, and find the first step where they differ before suspecting any change. The first difference names the cause; it is often upstream of the failing assertion.

**Principle:** Find where two runs first diverge before guessing at causes; a failure downstream of a deliberate change may be a test whose precondition the change made false, not a regression.

### Observation 633: A later fix that covers the same case twice makes an earlier break test silent

**Status:** OPEN
**Date:** 2026-10-17
**Session context:** The Tracker batch's break list (each fix taken out once, its test must go red) was run again after the code read's fixes: 34 of 36 caught. Two safety lines had each been backed up by a later fix (a blur handler, a reset in the close routine), so their tests passed with the line removed.
**Skill:** New skill candidate: bug-check break tests (project guide `raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** break tests — when they are re-run

**Issue:** The break list had been run and fully caught before the later fixes. Adding a second guard for the same situation silently made the first guard untestable through its old test. Only a full re-run of the list after the last change showed it.

**Suggested improvement:** Re-run the WHOLE break list after the last code change, not only the breaks for lines that changed. A break that is no longer caught means either the line is now redundant (remove it, or say why it stays) or it guards a path no test reaches (write a test that only it passes, and break it again).

**Principle:** Defence in depth hides from mutation tests: each guard needs a test that fails with that guard alone removed, and a later overlapping fix breaks that pairing without any visible failure.

### Observation 634: A walk driven through a runner went to the shared driver's default port — another chat's build — and every break result was void

**Status:** OPEN
**Date:** 17 Oct 26
**Session context:** [TRK-SCROLL-GLIDE] — the Tracker's finger glide; break tests run by a new runner that rebuilds and re-runs the job's walk script
**Skill:** New skill candidate: none — the project's walk-script guide (`raptor-port/docs/walk-scripts.md` §1, "a server found already running is used only once it is proved to serve this build")
**Type:** internal
**Phase/Area:** walk scripts and break runners

**Issue:** The job's walk printed its own default address (4181, the preview this chat started) but the shared Tracker driver it imports (`trk-lib.mjs`) defaults to 4180 — the port another chat's preview held. Run by hand the address was always given, so every run passed; run by the break runner it was not, and nine "breaks" (and a comment-only baseline) all came back red on the glide checks — the walk had driven a build with no glide at all. Three probes (frame rate, pointer type, the launcher) were spent before the cause was found. A walk-scripts rule already said to prove the served build first; nothing enforced it.

**Suggested improvement:** Every walk script proves, before its first step, that the address it drives serves THIS checkout's bundle (the hashed index name in the served page equals the local `dist`'s) and refuses to run without an address — as `scripts/handpass/trk-glide-walk.mjs` now does; better, put that check inside the shared drivers' `open()` (`trk-lib.mjs`, `lib.mjs`) so no walk can skip it. A runner passes its address on and fails without one.

**Principle:** A tool that silently falls back to a default target will one day hit someone else's; prove the target at the start of every run, in the shared code, not in a rule a script may forget.

### Observation 635: A "make it smoother" ask is measured against the device's own frame cap before any fix is chosen

**Status:** OPEN
**Date:** 2026-10-18
**Session context:** [TRK-CHART-FPS] — the owner found the Tracker chart choppy on his phone; a "small, safe step" (promote the moving layer) had been ruled before anything was measured
**Skill:** systematic-debugging (and the bug-check order's sizing step)
**Type:** open-source
**Phase/Area:** root-cause investigation, before a fix is picked

**Issue:** The ruled small step could never have helped: on a 120 Hz phone the browser holds a page's own JS-driven motion near 60 frames by default (Safari's flag; an in-app/third-party browser on iOS has no setting at all), while native scrolling runs at 120. The cause came out only after asking the device model and browser, and a one-minute on-device test (flag off) separated "the frame cap" from "slow drawing". The same measurement then showed a second, different cause (the pinch re-laid out the whole chart each step) that the cap could not explain.

**Suggested improvement:** In systematic-debugging's root-cause phase, for any smoothness/jank report add: ask the device and the browser; check the platform's frame cap for page-driven motion vs native scrolling; when the user can run it, propose a one-minute on-device toggle that isolates the cap; measure each gesture separately (before/after, at several CPU slowdowns) so two causes are not merged into one.

**Principle:** Before tuning the drawing, find out what frame rate the platform lets that kind of motion reach at all — a fix aimed below the cap is wasted, and each gesture can have its own cause.

### Observation 636: A box placed from the screen's edge "off the screen" on a phone — look for the content that widened the page first

**Status:** OPEN
**Date:** 2026-10-18
**Session context:** Raptor, D994's first small-fixes batch — a window that opened half off a phone turned on its side (844 × 390)
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause) — layout faults on phones

**Issue:** A window positioned `right:16px` opened at x 461–891 on an 844-wide phone. The window's own code (its clamp to `innerWidth`) looked right, and was: in a phone browser the LAYOUT viewport widens to whatever the page's content needs, so `innerWidth` read 907 and every right-anchored or clamped element followed it. The cause was a table elsewhere on the page (fixed columns summing to 875px) whose own sideways-scroll rule applied only below 820px. A desktop-mode browser of the same size reproduced none of it until the same view (the list, not the calendar) was open.

**Suggested improvement:** In systematic-debugging's root-cause phase, for "X is off the screen / cut at the edge on a phone": first read `document.documentElement.scrollWidth` against the screen width in the exact view and state, with a phone-emulating context (isMobile); if it is wider, walk down from the page root to the child whose extent passes the edge before touching X's positioning.

**Principle:** When an edge-anchored element is misplaced on a phone, measure whether the page itself has grown wider than the screen — the element may be correctly following a wrong viewport, and the fault lives in whatever overflowed.

### Observation 637: In a jsdom render of the input window, the modal stays drawn after a delete closes it

**Status:** OPEN
**Date:** 2026-10-18
**Session context:** his three follow-ups (D1022 — a deleted upchit gives its days back); a new unit test pressed the window's Delete
**Skill:** New skill candidate: none — the project's test-writing notes (raptor-port/docs/walk-scripts.md or a test guide)
**Type:** internal
**Phase/Area:** writing unit tests that render InputsPage + InputEditor

**Issue:** After the window's Delete (today's ordinary one included), the pop-up's record was let go (INPEDIT null) but
`#inpEditDel` was still in the jsdom page, so an assertion "the window has closed" on the button failed and looked like a
fault of the change. An older test (groupeditor) asserts on a test id the airpop form never carries, so it passed by not
looking.

**Suggested improvement:** a line in the project's test notes: in jsdom, assert a window's close on its pop-up state
(INPEDIT) and leave "it leaves the screen" to the walk; never assert absence on a test id without first asserting it was
present.

**Principle:** A negative assertion proves nothing until it has seen its subject present; and a test world that does not
repaint like the app is asked about state, not pixels.

### Observation 638: A save tried and thrown away hands back every record as a new copy — every holder must find its own again

**Status:** OPEN
**Date:** 2026-10-18
**Session context:** [UPCHIT-SHEET-LEAVE-CUT] (D1023) — the upchit sheet lists what a give-back will cut by trying the save and throwing it away
**Skill:** New skill candidate: none — the project's undo/command notes (raptor-port/docs/undo-contract.md) or the bug-check order's roll-call rows
**Type:** internal
**Phase/Area:** building on the app's "try and throw away" save (tryInputsBatch / dryRun)

**Issue:** The thrown-away save rolls the inputs back as NEW objects, and the old ones keep the tried changes. The open
input window, a sheet's leftover rows (what "Remove" removes) and the delete's plan all held old objects. A probe test
proved it before building. The break tests then showed that two of the three holders' fixes were invisible to the first
tests: on the Inputs page the window already follows its record by itself, so only a test of the window opened from the
schedule could see that holder; and a plan's rows only label, so only a test that pressed Remove on a later medical could
see stale leftovers.

**Suggested improvement:** a roll-call row in the bug-check order for any change that runs a try-and-throw-away save: list
every holder of a record object across it (open windows in each mode, sheet state, pop-up flags), each with the test that
acts on it AFTER the try.

**Principle:** A rollback that restores values, not identities, turns every held reference stale; list the holders and
prove each by acting through it after the rollback, not by reading what it shows.

### Observation 639: A backlog tidy's "finished" verdicts and its rewritten list each needed a second reader

**Status:** OPEN
**Date:** 18 Oct 26
**Session context:** the backlog tidy (D1024) — 167 items checked by four Sonnet helpers against git and the code, the priority list rewritten by area
**Skill:** New skill candidate: backlog-tidy (or a section of session-handoff)
**Type:** internal
**Phase/Area:** verifying "done" before archiving; rewriting a summary list

**Issue:** The helpers' DONE verdicts were mostly right, but one rested on the wrong surface (a guest's page saves nothing, while the access request is saved elsewhere) and was kept open on the host's re-check. The rewritten list, checked by a script for coverage (every open item named once), still lost one open step of his (making the repo private again — it lived only in the old list's prose, not in any item) and misstated six lines; only a fresh reader comparing the old list's open statements with the new found them.

**Suggested improvement:** For a backlog tidy: (1) helpers return verdict + evidence per item, the host re-checks every DONE before moving it; (2) a coverage script for ids is necessary but not sufficient — a fresh reader reads the OLD list for open statements (orders, his steps, "waits on") that live in no item; (3) move the old list whole first, so the reader has it.

**Principle:** A rewrite of a summary loses facts that lived only in the summary's prose; check coverage of the ids by script and coverage of the open statements by a reader of the original.

### Observation 640: A test that picks its case from what is on screen must work the state out afresh first

**Status:** OPEN
**Date:** 18 Oct 26
**Session context:** D994's Schedule and amendments fixes — the Tab route's missing tests ([TAB-LAST-BOX-TEST-GAPS])
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the failing test — choosing the fixture

**Issue:** A new jsdom test chose "a day with no warning" by reading the drawn week. The warning list on screen was left over from earlier tests in the file (each test restored the data but did not re-run the checks), so the day chosen changed with the run order: the test passed alone and failed in the full file, and several runs went on chasing what looked like a fault in the code. Once the checks were re-run before choosing, the failure was steady — and it was a real fault, on a different path from the one the test was written for (the Tab went on to a control, not back into the box). Beside it, an older test's precondition ("Friday starts with no warning block") used selectors that match nothing, so it could never fail.

**Suggested improvement:** In the TDD skill's "write the failing test" step: when a test selects its case from rendered or derived state, recompute that state at the top of the test (here, validate + notify) and assert the precondition with a selector proven to match in a positive case; and when a new test fails only in the full file, suspect leftover state before suspecting the code.

**Principle:** A precondition read from state another test can leave behind makes a test depend on run order; recompute before choosing, and prove a "nothing here" selector can find something.

### Observation 641: A test fixture written straight into the data before an undo test runs lands in the undo's baseline, not as a change

**Status:** OPEN
**Date:** 2026-10-19
**Session context:** D994's Schedule and amendments batch — a red-first test of Undo pressed with the caret still in an In-time line (ui/undo-caret.test.tsx)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** "write the failing test" — fixtures for undo / history tests

**Issue:** The test set three In-time lines straight into the data AFTER the store and the undo history had taken their baseline. The emptied line was then undone back to the seed's own lines, not the three the test set, so the test failed for a reason that had nothing to do with the fault — and a first reading took it for the fix not working. Moving the fixture line above the store's set-up made the test say what it meant; red without the fix, green with it.

**Suggested improvement:** In the TDD skill: a test of undo, redo or history sets its fixture BEFORE the history takes its baseline (or through the app's own write path), and asserts the state just before the action under test, so a wrong baseline shows as a wrong precondition rather than as a failed fix.

**Principle:** In a test of undo, a fixture written outside the recorded path becomes the baseline it undoes to; set it before the baseline is taken, and check the precondition before the action.

### Observation 642: A ruling made from a picture names the surface in his words; open the picture before drawing

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** the mock-up of [RALLY-PER-FORMATION] (D1026) on the real app
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 1 (before the first picture)

**Issue:** The ruling said "on the week and Edit Schedule", and the chat that recorded it read "Edit Schedule" as the Edit Schedule week ("the five boxes in a line become …"), leaving "whether the Scheduler Board gets the same columns" as an open question. The week has no five boxes in a line; the board does. The picture he ruled from (his own iPhone screenshot, marked by that chat, still in its scratchpad) was the Scheduler Board. Only finding and opening that picture showed which surface his words meant; the mock-up would otherwise have drawn the wrong screen first and asked a question his picture already answered.

**Suggested improvement:** In "The Method", before step 1: "When the decision being drawn was made from a picture (his screenshot, a marked picture), find and open that picture first — the ruling's words name the surface as he calls it, which may not be the app's own name for it. Say on the page which surface you read his words as, and why."

**Principle:** The artifact a decision was made from outranks the words it was recorded in; a user's name for a screen is not the system's name for it.

### Observation 643: The overnight guide stops at 90% weekly; his aim is to use the allowance up before the reset (D1033)

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** the handoff into an /overnight build of [RALLY-PER-FORMATION], weekly allowance at 83%
**Skill:** overnight
**Type:** internal
**Phase/Area:** the run's stop rules ("Stop starting new jobs … when the weekly figure passes 90%")

**Issue:** Told that his weekly allowance was at 83% with the reset about 13 hours away, he answered "I don't mind using up the usage. Thats my objective before the reset" (D1033). The guide's stop at 90% would end the night early and leave allowance unused that resets anyway.

**Suggested improvement:** In the stop rules: "when the weekly figure passes 90% AND the weekly reset is after the run's end; where the reset falls before the run would end, keep starting jobs (D1033) — commit, push and write the block after each step so the limit never strands work." Changed only with its reads (D70).

**Principle:** Allowance that resets unused is not saved; a stop rule for a budget should know when the budget refills.

### Observation 644: A browser-test port held by another chat's old preview silently tests the wrong build

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** /overnight build of [RALLY-PER-FORMATION]; red-first e2e for [EDIT-BUTTON-AFTER-CHANGE]
**Skill:** overnight (and the walk / gate guidance it points at)
**Type:** internal
**Phase/Area:** Part 2 — running the gates and the browser tests

**Issue:** The default browser-test port (4173) and a second one tried (4191) were each held by a vite preview left running by another worktree's chat days earlier. The Playwright config reuses an existing server outside CI, so the "red first" run and the first "green" run both drove the OTHER chat's old build — a red that proved nothing and failures (an R box "not found") that looked like the change's. Only checking the port's owning process showed it. Walker and gate runs then used E2E_PORT=4297 after proving the port free.

**Suggested improvement:** In the overnight guide's step 1 ("Level and look") and before any browser test: list the listeners on 4173/4179/4180 and the walk ports, and either use a free port by E2E_PORT or prove the served bundle's hashed name equals the local build's (walk-scripts.md §1 already says this for walk servers; the gate path has no such check).

**Principle:** A reused server must be proved to serve the build under test before any result from it counts; "reuse an existing server" turns a stale process into a silent false result.

**Met again 19 Oct 26 ([RALLY-BOX-CHANGES], the same day, a different chat):** 4173 was still held by another chat's preview; the rally-box browser test drove it and all 8 checks failed ("element not found") — read as this change's fault until the port's owner was checked; E2E_PORT=4311 (proved free) passed 8/8. **The guard proposed:** an unconditional default rather than a judgment — the config (or the gate-lock `exec` wrapper) refuses to reuse a server it did not start for this checkout (e.g. a probe that the served `index.html` names this build's asset hash), so a stale port fails loudly instead of testing another build.

**Met again 20 Oct 26 ([STANDBY-WEEK-B]):** E2E_PORT=4191 — chosen as "another port" without checking — was held by a 17 Oct worktree's vite preview; 12 of 14 rally-box tests failed, old ones included; 4197 (proved free) passed 14/14. The third time: the guard above (refuse a server this checkout did not start) is now overdue.

### Observation 645: A tap-to-fill handler fought the app's own focus-arrival refresh

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** [RALLY-PER-FORMATION] walker B's F1 — tap R then B on the phone board
**Skill:** New skill candidate: none — the bug-check order's §7.0/§8 (probe before fixing)
**Type:** open-source
**Phase/Area:** fixing a walker's finding

**Issue:** The first fix for "B stays empty after tap R then B" was written from a reading of the cause (the click lost to a redraw) and passed a test that did not reproduce the walker's exact route (it scrolled B to centre first). The walker's own script, re-run, still failed; a 30-line event probe on the built app then showed the real cause in one run: the box was placed, then the app's focus-arrival refresh set it back from the model.

**Suggested improvement:** For a walker's FAIL, re-run the walker's own script on the fixed build BEFORE trusting a new test, and when the first fix does not cure it, write an event probe (every pointer / focus / change event on the two elements, with their values) before a second guess.

**Principle:** Reproduce on the finder's exact route; when a fix misses, instrument the events rather than re-reason the cause.

### Observation 646: An emulated phone zooms the page when a script types into a small box, and the mock-up comes out shifted

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** [STANDBY-FLIES] drawing the Flies tick on the real app (`raptor-port/scripts/handpass/look-standby-flies.mjs`) at his iPhone's width
**Skill:** brainstorming (`mockups-on-the-real-app.md`, §Traps When Injecting Into a Live Page); walk-scripts.md
**Type:** open-source
**Phase/Area:** staging the "today" state before the picture

**Issue:** The script typed a rally into a small time box on the phone-width board (Playwright context with `isMobile: true`). Every picture after that came out zoomed in and shifted sideways — the right half of the board, where the change sat, was cut off — while the script passed without error. Three framing "fixes" (scroll resets, a taller page, a full-page shot) changed nothing; a one-page probe at the same width without the typing showed the page normal, which pointed at the typing. The emulated phone zooms to a focused text box smaller than 16px, as a real phone does. Setting the value through the box's own change event (no focus zoom), and `isMobile: false` with the same width and density, gave a clean frame. Also met: a mark drawn `position:absolute` on the page sat under the board's fixed overlay (drawn `fixed`, top layer, it showed), and the board kept a hidden copy of the same rows in the week behind it, so a document-wide query drew the chips twice and the mark spanned both.

**Suggested improvement:** Add to the mock-up traps: "On an emulated phone, never type into a box before a picture — set it through the app's own change event, or emulate width and density without `isMobile`; a picture zoomed to a box is the sign. Scope every injection query to the surface being pictured (the board hides a copy of the week behind it). Draw a mark `position:fixed` at the top layer when the surface is an overlay."

**Principle:** Before a third framing fix, probe the same page without the last action taken — the cause is usually the step before the picture, not the picture.

### Observation 647: Two scripted taps at one spot within a moment are a double tap that selects a word

**Status:** OPEN
**Date:** 19 Oct 26
**Session context:** [KEYBOARD-SCROLL] / D1080 browser test — tap a template time box, type, leave, tap it again, type
**Skill:** walk scripts guide (raptor-port/docs/walk-scripts.md §4) — not a skill file
**Type:** open-source
**Phase/Area:** writing a walk or browser-test step on a phone (touch emulation)

**Issue:** A test tapped a box, typed four digits and left it, then tapped the same spot again and typed. The second tap landed a few milliseconds after the first (scripted typing is instant), so Chromium's touch emulation read the pair as a double tap and SELECTED the word under the finger ("00"); the typed digit replaced only that selection and the step failed as if the feature were broken. Only a probe printing the selection after the tap (3–5 selected) showed it. (Numbered past 646 to leave room for a parallel chat's entry — standby-flies.)

**Suggested improvement:** Add to walk-scripts.md §4's traps: two taps at one point closer than about half a second are a double tap; wait ~600ms between taps on the same box unless the step is about a second tap, and print the box's selection after a tap when a typing step fails.

**Principle:** A scripted gesture sequence runs faster than a person can; check that its timing does not turn two gestures into a different one before blaming the app.

### Observation 648: Two jobs in one checkout — `git add -A` sweeps the other job's untracked files into a commit
**Status:** OPEN
**Date:** 20 Oct 26
**Session context:** two jobs one after the other in one worktree ([CI-SPLIT-SLOW-JOBS] on its branch, then the standby batch on a branch from main), switching branches in the one checkout (the one-checkout-per-session rule)
**Skill:** New skill candidate: none — belongs in raptor-port/docs/gates-and-deploy.md or the session workflow notes
**Type:** open-source
**Phase/Area:** committing after a branch switch

**Issue:** The second job's before-pictures and script were untracked files when I switched back to the first job's branch to commit its records; `git add -A` committed them into the first job's branch. Caught by reading the commit's file list, undone with a soft reset and a commit of named paths.

**Suggested improvement:** When one checkout carries more than one job, stage by named paths, never `git add -A` / `git add .`; read `git show --stat HEAD` after every commit made right after a branch switch.

**Principle:** Untracked files follow a branch switch; a whole-tree stage after a switch commits another job's work. Stage what this commit is about, by name.

### Observation 649: A layering check by elementFromPoint fails on a surface that takes no presses

**Status:** OPEN
**Date:** 2026-10-20
**Session context:** The OIL batch's walk (`raptor-port/scripts/handpass/oilfix/walk.mjs`) — checking the passing note after Unpublish was drawn on top, on the week and over the Scheduler Board.
**Skill:** New skill candidate: none — the walk-scripts guide (`raptor-port/docs/walk-scripts.md`), the project's reference for writing walk scripts
**Type:** internal
**Phase/Area:** walk scripts — proving a floating surface is on top (bug-check order §6)

**Issue:** The order's §6 test for a floating surface — the element under its middle is the surface — was applied to the passing note (`#toastEl`), which takes no presses (pointer-events none). elementFromPoint skips such an element and returns what lies beneath, so 11 checks failed while the pictures showed the note drawn on top. A second false failure in the same walk: the Leave War cell reads "FO*" (the grid's own star after an earned code), and the script compared "FO".

**Suggested improvement:** In walk-scripts.md's layering section, one line: elementFromPoint proves a surface that takes presses (a window, a calendar, a button); for one that does not (a passing note, a mark), prove it by its box inside the screen and its computed visibility / opacity, and open the picture. And: read a grid cell's text once on screen before writing its expected value.

**Principle:** A check's method must fit the thing checked; a "hit test" only sees what can be hit. Before calling a scripted FAIL a fault, open its picture.

### Observation 650: A flaky check that polls for a state the app legitimately leaves again
**Status:** OPEN
**Date:** 2026-10-20
**Session context:** The shaky-tests batch — [LW-WINDOW-PRUNE-FLAKE-2], a Leave War browser test that failed about one full run in two.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause) for an intermittent test failure

**Issue:** The test pressed a month button and then polled for the far month to leave the drawn window. The app drops it in the jump's own draw and then, on the desktop, grows the window back toward the whole year a beat at a time — so the dropped state was a transient. The filed theory ("the prune waits for an idle PC") was wrong; a 3-second pause inserted after the press made the old poll fail 2 of 2, which proved the real cause in one local run. The fix read the state at the moment of the draw (a MutationObserver installed in the same page task as the press).

**Suggested improvement:** In systematic-debugging's flaky-test guidance: before raising a wait, ask whether the asserted state is permanent or a transient the app moves on from; prove it by delaying the check on purpose (a pause before the assertion) — if a later check fails, the assertion must be taken at the event, not polled after it.

**Principle:** "Wait on what it needs" assumes the awaited state stays once reached. When the app legitimately passes through a state, a later look can miss it on a slow machine; delaying the check on purpose is the cheap experiment that tells a transient from a slow arrival.

### Observation 651: Turning traces on across a whole CI share to chase one flake changes the share
**Status:** OPEN
**Date:** 2026-10-20
**Session context:** The shaky-tests batch — [CI-E2E-FLAKES-1020], a browser test that failed only on GitHub's Linux machines.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (gather evidence) on a remote CI machine

**Issue:** A debug branch ran the failing test's whole share three times with `--trace=retain-on-failure` to catch the failure with a trace. Recording traces made every step slower, seven unrelated heavy tests timed out on every loop, and the flake itself never showed — the run measured the tracing, not the app. An in-page event log printed only when a test fails (focus, keys, input, change, value writes, node replacement) costs almost nothing and was the useful instrument.

**Suggested improvement:** In systematic-debugging, under evidence gathering for CI-only failures: instrument the one test with a cheap in-page event log dumped in afterEach on failure; reserve tracing for that single test, never a whole share; and since such failures follow the machine (both tries on one machine failed, a re-run passed), spread the repeats over several machines (a matrix) rather than many loops on one.

**Principle:** An instrument heavy enough to change timing changes a timing bug. Instrument narrowly and cheaply, and sample across machines when the failure follows the machine.

### Observation 652: A change to a page's boxes runs every browser test that drives those boxes, not only the page's own file

**Status:** OPEN
**Date:** 2026-10-21
**Session context:** Raptor — the Logic page fixes ([LOGIC-REDRAW-DROPS-TYPING], [LOGIC-DONE-FIRST-PRESS]), pull request 554
**Skill:** verification-before-completion (and the project's bug-check order, `raptor-port/docs/bug-check-order.md` §5 "between fix rounds")
**Type:** open-source
**Phase/Area:** choosing which tests to run locally before the first push

**Issue:** The fix stopped a page rebuilding its list of boxes on every repaint. Locally only the page's own unit and
browser test files were run (all green). GitHub's full run then failed a browser test in ANOTHER file (a keyboard test)
that also drives those same boxes: with the list no longer thrown away, a box blurred by script kept the page's text
cursor, and a box in a window opened next took no typing. A search of the browser tests for the page's own selectors
(`input.lgin`, `#lgEdit`) would have found that file in seconds.

**Suggested improvement:** In the "touched tests" step before a push (verification-before-completion, and the bug-check
order's "run the touched surface's own suite"), add: grep the browser/e2e tests for the changed component's selectors and
ids, and run every file that matches — a component's tests are wherever it is driven, not the file named after it.

**Principle:** The tests that cover a component are found by searching for how tests reach it (its selectors), not by
file name; a change that alters a component's lifecycle (when it is rebuilt, what it keeps) can break tests written for a
different feature that merely pass through it.

### Observation 657: The backlog's archive command leaves the item's line in the priority list, and the document check passes it

**Status:** OPEN
**Date:** 2026-10-21
**Session context:** D1106 built on the look-and-keys branch; `backlog-archive.mjs FLOATWIN-BOARD-BAR --homes …` moved the item's section to the archive (numbered past 656, the highest on the night-records branch)
**Skill:** New skill candidate: none — project tooling (`raptor-port/scripts/backlog-archive.mjs`, `docsize.mjs`)
**Type:** internal
**Phase/Area:** closing a backlog item

**Issue:** After the archive command ran, the item's one-line entry in OUTSTANDING.md's priority list was still there, and `npm run docsize` reported "every record accounted for". Found only by grepping the item's id afterwards; removed by hand.

**Suggested improvement:** the archive command removes the priority-list line with the section (or refuses and names it), and the document check fails on a priority-list line whose item is archived.

**Principle:** A move that has two homes for one item must move both, and the check that guards the move must look in both places.

### Observation 658: A new test's precondition must be shown to happen before its break test means anything

**Status:** OPEN
**Date:** 2026-10-21
**Session context:** the pinch-zoom job (numbered past 656 on `claude/night-records-1021`); two new browser tests ("a pinch on a wave grip moves no wave", "a pinch on a Quals heading moves no column") passed with their fixes taken out
**Skill:** New skill candidate: none — the bug-check order's break tests (`raptor-port/docs/bug-check-order.md` §8)
**Type:** open-source
**Phase/Area:** writing a regression test for a guard

**Issue:** Both tests asserted "nothing moved" after a pinch. With the guard removed they still passed: in the test browser a finger never picked the heading up at all, and the board's row moved but the test compared positional addresses that do not change. Only the break test exposed it; the board's test was rewritten to observe the guard's own effect mid-gesture (no row held), the Quals one removed and the older fault behind it filed.

**Suggested improvement:** in the break-test step, a test of the form "X did not happen" first asserts that its precondition did happen without the guard (the thing was picked up, the drag was live) — or is written to observe the guard's direct effect instead of the absence of a downstream change.

**Principle:** A negative assertion proves nothing until the test has shown the harness can produce the positive case; check the precondition, or assert the guard's own effect.

### Observation 659: A mock-up's picked state must show the thing being asked about

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [BOARD-SIDE-WIDTH] — drawing "a crossed-out man's reason beside his puck" on the Scheduler Board's crew list
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** "Judging the Proposal" — the busy state

**Issue:** The first drawing picked a flying FRONT seat to show reasons beside the pucks. With a front seat picked, every pilot is plannable and every WSO shares one column-wide reason, so the list printed NO per-person reason at all — three pictures of a change that was not visible. The script passed and measured "10 reasons" (placeholders), which hid it until the pictures were opened. A duty desk (each man struck for his own reason) was the state that showed it.

**Suggested improvement:** Under "Include one BUSY state by default", add: before drawing, list which app states make the proposed change VISIBLE and pick one where it shows on most rows; have the script assert a count of the exact element the change touches (here per-man reasons inside the two crew columns), not a looser selector that other rows also match.

**Principle:** A state chosen for convenience can make the proposal invisible; choose the state by what it displays, and assert on the exact element the change touches.

### Observation 660: A walk check over a list passes when the list is empty — and the touched tests miss the stylesheet tests

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [BOARD-SIDE-WIDTH] — the walk of the board's right panel, then GitHub's run
**Skill:** (project guide) raptor-port/docs/walk-scripts.md; raptor-port/docs/bug-check-order.md §5 "the touched tests"
**Type:** open-source
**Phase/Area:** walk assertions; choosing the local tests to run

**Issue:** (1) The walk asserted "every crossed-out man's reason stands beside his puck" with `rs.every(...)`. A real fault had dropped the picked seat, so the list was EMPTY and the check PASSED ("0 of 0") — the fault was caught only by a neighbouring check that happened to fail. The same shape sat in the browser test (`forEach` over an empty list). (2) The local "tests of what you change" were chosen by grepping the test files for the changed functions' names; the tests that read the stylesheets name no function, so a new CSS rule that broke a speed rule (`body.<class> *`) went to GitHub and came back red.

**Suggested improvement:** walk-scripts.md: "every check over a list asserts the list's size first (more than N, or exactly the expected count), and its premise (the seat still picked) — a check over an empty list passes". The order's §5 / shipping's "the tests of what you change": "a change to a stylesheet runs every test that reads the stylesheets (grep the tests for `.css` / readFileSync), whatever functions it touches".

**Principle:** A universal claim over a collection is vacuously true when the collection is empty; assert the collection's size and the premise that fills it. And select tests by what they READ, not only by the names they call.

### Observation 661: A fixed room sized from one machine's fonts fails on another's

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [ARROWS-STAY-PUT] (D1122) — keeping arrows still around changing words
**Skill:** (project guide) raptor-port/docs/design-practices.md §6; mockups-on-the-real-app.md "A fit drawn in the test browser's letters…"
**Type:** open-source
**Phase/Area:** sizing a label's room

**Issue:** Each label got a fixed width measured from the longest value in this PC's fallback font. Locally every pair measured still and the row fit; on GitHub's Linux machines the fallback font is wider: one arrow still moved 3px and a toolbar row wrapped. The app loads no fonts, so every device draws its own.

**Suggested improvement:** reserve a label's room by the real font on the device: stack every value the label can take in one grid cell (all but the current hidden), never a number measured on one machine; where a fixed number is unavoidable, measure it in the CI browser too before pushing.

**Principle:** A width measured in one font is a guess on every other device; let the layout measure the real text in place.

### Observation 662: A stand-in font must pass what the real one passed before it can judge a new case

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [ARROWS-STAY-PUT] — sizing labels by the real font so GitHub's Linux checks go green (applies Observation 661)
**Skill:** (project guide) raptor-port/docs/walk-scripts.md; mockups-on-the-real-app.md "A fit drawn in the test browser's letters…"
**Type:** open-source
**Phase/Area:** reproducing a CI-only layout failure locally

**Issue:** The CI machines draw a font this PC does not have. A wider font forced on the page (Verdana) was used to predict whether a toolbar row would wrap there. It wrapped — but it also wrapped in the older state that CI had passed, so the stand-in was harsher than the real font and said nothing about the new state. A first measurement also counted "needed width" as the sum of the items, which always equals the room when one item stretches.

**Suggested improvement:** before trusting a stand-in font, run it on a known-good state (one the real environment passed) and a known-bad one; it can judge only if it passes the first and fails the second. Measure spare room by growing a margin until the row's height changes, not by adding item widths. Where no stand-in qualifies, the real environment's run is the check — say so.

**Principle:** A proxy environment is calibrated against known outcomes of the real one before its verdict on a new case is believed.

### Observation 663: A part moved out of its box in a mock-up loses the box's styles

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [INPUTS-SANS-HEAD-SAME] (D1123) — drawing two calendars' top rows as one, on the running app
**Skill:** brainstorming/mockups-on-the-real-app.md — "Traps When Injecting Into a Live Page"
**Type:** open-source
**Phase/Area:** applying the one named transform (moving existing nodes)

**Issue:** To draw a page's second row joined to its first, the second row's controls were moved up into the first row's container. The page's styles were scoped under the second row's own container, so the moved month name lost its font and size and the right-hand buttons lost the rule that pushed them to the row's end. The script raised no error; only looking at the picture showed it. Moving the first row's tabs DOWN into the second row's container instead kept every scoped style, and drew the same arrangement faithfully.

**Suggested improvement:** add a trap line: when a transform moves nodes between containers, move the part whose styles are global into the container whose styles are scoped — never out of it; then measure the moved part's computed font size and position against the original before taking the picture.

**Principle:** In a live-page mock-up, a node's look can depend on where it sits; relocate the side that does not.

### Observation 664: A comment heading in capitals tripped a test that scans the source for a name

**Status:** OPEN
**Date:** 2026-10-21
**Session context:** Round 2 of the consistency look — a new comment in the Tracker's App.jsx, written in this repo's capitals-heading style ("ONE JOINED BOX, AS THE INPUTS / SANS / MEDICAL TABS ARE"), turned GitHub's unit share red: inputs-readers.test.ts lists every file whose text holds the store's name INPUTS, comments included, and demands each be classified.
**Skill:** New skill candidate: none — raptor-executor / the project guide's coding conventions
**Type:** internal
**Phase/Area:** Writing code comments; running only the touched tests before a push

**Issue:** The local run covered only the touched test files, so a source-wide scan test the change never "touched" went unrun until GitHub. The word in capitals was prose, not a reference — but the scan cannot tell.

**Suggested improvement:** One line in the guide's coding conventions (or gates-and-deploy.md): source-scanning tests (inputs-readers, perms-scan, …) read comments too — never write a store's name (INPUTS, PEOPLE, DAYS…) in capitals in prose; and when touching a new file, run the scan tests (`npx vitest run src/engine/inputs-readers.test.ts src/state/perms-scan.test.ts`) with the touched ones.

**Principle:** When tests scan source text, any file change is a change those tests touch; include them in the "touched tests" set by default.

### Observation 665: A look's picture script should tag the mark, not assume where it lives

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** Round 3 of the consistency look: picturing every typed pencil in the app, today and drawn.
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** drawing a proposed change on the running app

**Issue:** A source search listed a typed pencil on the Tracker's Students card, but the running app already drew it as a line icon (the character hidden by a style). Grepping source would have put a finding to the owner that was already fixed. Tagging every visible element whose own text holds the mark, then ringing those, found the true set on screen; the empty result for that place was the signal.

**Suggested improvement:** In mockups-on-the-real-app.md, one line: when a look covers "every X", find X by what the running page shows (visible elements whose own text or icon is X), not by a source search; a place the source lists but the screen does not show is reported as "already done", not pictured.

**Principle:** What the person sees is the inventory; source text is only a lead to check against the running screen.

### Observation 666: A walk that checks an icon is "there" passes an icon in the wrong place

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** Round 3 of the consistency look: swapping typed marks for drawn icons in many buttons, then walking them.
**Skill:** New skill candidate / bug-check order (walk-scripts.md)
**Type:** open-source
**Phase/Area:** writing a walk's assertions for an icon swap

**Issue:** The walk asserted "the button wears the svg and no typed mark" and passed 71/71, while on a desktop one button now showed its new icon ABOVE its words (the icon is a block element; that row's buttons were not flex). The walk's picture of that row was cropped to the first matching element, so the button was not even in it. A later picture for another question showed the fault; the fresh code read found it too.

**Suggested improvement:** In `raptor-port/docs/walk-scripts.md`: when a text mark becomes a drawn icon, assert its PLACE as well as its presence — the icon's box beside the words (its right edge at or before the words' left, their middles within a few px) and the control's height unchanged; and a crop helper that takes several selectors must box all of them, not the first.

**Principle:** An assertion of presence cannot catch a layout fault; check the relation the person sees (beside, same line, same height), and make every picture show the thing it is named for.

### Observation 669: A "before" worked out by undoing styles on the page is not the before — measure a build of the old look

**Status:** OPEN
**Date:** 2026-10-21
**Session context:** Raptor round 3's answers 5–7 — the Tracker bar's controls made one height; the ruling also said the bar must grow no taller (numbered past 668, held by `claude/leave-war-overhaul`)
**Skill:** New skill candidate: none — the walk-scripts guide (`raptor-port/docs/walk-scripts.md`) and the bug-check order's walk
**Type:** open-source
**Phase/Area:** walking a size change; comparing before and after

**Issue:** To check "the bar grows no taller", the walk first computed the old height by injecting a style that undid the new sizes on the live page. Its numbers disagreed with a hand measure in another browser pane (different fonts) and with each other (a phone bar "70 → 67"), and a fix (a closer row gap) was built on the pane's numbers. Building the app once with the old stylesheet and measuring it with the same script at nine widths gave the true before: the fix was not needed and in fact moved the phone's rows; it was dropped. Separately, a fresh code read caught that one side of the "as tall as" was fixed while the other was drawn by the browser (a dropdown) — true here, unproved on an iPhone — so both were pinned to the same number.

**Suggested improvement:** In `walk-scripts.md`: when a ruling says something "does not grow / does not move", record the before from a BUILD of the old look (swap the one stylesheet back, build, measure with the same script into a file, restore), and compare the after against that file; never against numbers from another browser or a style undone on the page. And when making two things "as tall as" each other, set both to the number, not one.

**Principle:** A comparison is only as good as its baseline; measure the old state the same way, in the same browser, as the new — and a match between a fixed size and a computed one is a match on one device only.
### Observation 671: A shared claude.ai app draws nothing without its database — run its saved source locally against a stand-in store to picture it

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** [LW-OVERHAUL] (D1140) — comparing a colleague's leave app (a claude.ai artifact from another organisation) with our Leave War, pictures of both for the owner. Parallel branch claude/consistency-round2 was at 663 when this was written.
**Skill:** brainstorming (`mockups-on-the-real-app.md`); impeccable (shape — studying a reference product)
**Type:** open-source
**Phase/Area:** gathering evidence about a reference app before a design comparison

**Issue:** The Artifact read of the colleague's page returned an empty summary ("only a title"), because the page builds every screen in script from its runtime database and sign-in. Opening the live page would have shown another squadron's real data. What worked: read the saved raw source whole, then serve a local copy with a small stand-in for the page's `window.claude.use('db' | 'user' | 'assets')` that feeds made-up people (snapshot listeners, set/update/delete with null-deletes), the clock held, the other unit's name replaced before any picture. Every screen then drew and could be driven like any page — tabs, its form's live preview, a drag — with zero errors, and nothing touched their real store.

**Suggested improvement:** In the mock-up guide, a short "Picturing someone else's app" note: read the source whole (the summary of a script-drawn page is empty); never open its live data; run it locally against a stand-in store with invented records; replace identifying names in the HTML before capture; do not commit the stand-in if it carries their storage keys or names.

**Principle:** To study a data-driven reference app, run its code against invented data in a sandbox rather than reading its live data or trusting a summary of its empty shell.

### Observation 667: In a zoomed grid a rect reads unzoomed, and a copied column table hides behind the real one — a mock-up's moves and marks go wrong silently

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** the Leave War overhaul's full mock-up, drawn into the real build (claude/leave-war-overhaul). Numbered 667 past main's and consistency round 2's 664.
**Skill:** brainstorming (`mockups-on-the-real-app.md` — Traps When Injecting Into a Live Page)
**Type:** open-source
**Phase/Area:** injecting into a live page

**Issue:** Three traps cost a redraw each. (1) The phone's grid is drawn at CSS zoom 0.8: `getBoundingClientRect` inside it returned unzoomed values, so a scroll computed from it overshot by days and a tag placed from it sat off its cell. (2) The app keeps second copies of rows (a desktop "figures drawer" table, a phone frozen band) beside the year table: moving a person's rows in one copy left his balance figures in the other, showing the wrong man's numbers. (3) A window drawn outside the page's styled scope (appended to body) lost every scoped style and rendered transparent over the dialog behind it. Each passed its script with no error.

**Suggested improvement:** Add to the traps: "Inside a zoomed subtree, compare rects only after dividing by the zoom (or place tags as children of the element); before moving rows, list every table holding a copy of them and move each by position from a shared anchor row; append a new window inside the page's scoped container, or style it fully inline — then look at the picture."

**Principle:** A live page often draws one thing in several places and under several coordinate systems; a transform that touches one copy, or measures in one system, leaves a picture that looks plausible and is wrong.

### Observation 668: A shell edit turned `\b` in a regex into a backspace character, twice — the trap the memory names for `node -e` hits Python and here-docs too

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** editing the mock-up's drawing scripts by Python inside a bash here-doc and by `python -c`.
**Skill:** task-observer (repo memory notes: "node -e in Git Bash loses escapes", "Python edits turn LF into CRLF")
**Type:** open-source
**Phase/Area:** editing files from a shell

**Issue:** A JS regex `/\bSXO\b/` written through a Python string in a here-doc came out as `/<BS>SXO<BS>/` (Python read `\b` as a backspace); the replacement meant to fix it did the same again. The helper silently matched nothing, and three debugging runs passed before `cat -A` showed the control characters. The apostrophe trap in here-docs struck the same session.

**Suggested improvement:** Make the default unconditional: script edits go through the Edit tool or a script file written with the Write tool, never a code string passed through a shell; when a helper "finds nothing", `cat -A` the line first.

**Principle:** Every layer that reads escapes (shell, Python string, JS) can rewrite a backslash; text that must arrive byte for byte should cross no layer that interprets it.

- Met again 22 Oct 26 (the Leave War overhaul's overnight run): a `cat > file <<'EOF'` holding a regex with a doubled backslash lost one backslash on the way (and this very note lost another when written by a script), and the script failed to parse; rewritten with the Write tool. A third meeting — the guard proposed above (scripts are always written with the Write tool, never a heredoc) is still the fix.

### Observation 670: A cross-branch search for the next free ruling number skipped every branch's area file without a word — the same Git Bash path rewrite the numbering rule warns of

**Status:** OPEN
**Date:** 21 Oct 26
**Session context:** Leave War overhaul round 4 — finding the next free D-number across every branch before recording his answers
**Skill:** record-decisions (the "take the next free number" step) / task-observer numbering rule 4 (same trap)
**Type:** internal
**Phase/Area:** checking other branches for numbers

**Issue:** A loop of `git show "$b:.claude/rules/decisions/leave-war.md" 2>/dev/null` across 100+ remote branches returned nothing for that file on every branch (Git Bash rewrote `rev:path` into a Windows path), while the same loop's other files, run with MSYS_NO_PATHCONV=1, worked. The silence read as "no numbers there", and the loop also took over two minutes. One `git grep -o -E "^\| D11[7-9][0-9] \|" $(git branch -r ...) -- .claude/rules/decisions .claude/decisions-full DECISIONS-ARCHIVE.md` answered in seconds, with no path rewrite. (Number 670: 669 exists on another branch.)

**Suggested improvement:** In record-decisions.md / DECISIONS.md step 1, give the one command for "the next free number on every branch": `git grep` over all refs, never a `git show rev:path` loop; and say a check that prints nothing must first be run where the answer is known (the current branch) to prove it works.

**Principle:** A search across refs is one `git grep` over the refs, not a loop of `git show rev:path` — on Git Bash the latter can fail silently, and silence reads as "none".

### Observation 672: Design lessons are numbered in one sequence, so two branches adding lessons collide at the merge — as rulings would without their ranges

**Status:** OPEN
**Date:** 22 Oct 26
**Session context:** the Leave War overhaul's overnight run merged `main` into `claude/leave-war-overhaul`.
**Skill:** New skill candidate / the design guide's §9 rule (D941) and `record-decisions.md`
**Type:** internal
**Phase/Area:** numbering of the design guide's lessons (§9 of `raptor-port/docs/design-practices.md`)

**Issue:** The branch had added lessons 18–28 while `main` (another chat) added its own 18 and 19 (the pencils). The merge conflicted in the guide, and the branch's eleven lessons had to be renumbered 20–30 in the guide, the Leave War rulings (short and full), the design note and the handoff — and the owner's page still says "lesson 28" for what is now 30. Rulings avoid this by each branch taking a range of D-numbers before it starts; lessons have no such rule.

**Suggested improvement:** In the design guide's §9 head (D941's rule), and in `record-decisions.md`'s parallel-branch line: a branch that will add lessons takes a range (or names lessons by their ruling, "the lesson of D1194", and numbers them only at the merge). Until then, a merge that renumbers lessons does so by a script that touches only the branch's own side, and the closing report tells him the old and new numbers.

**Principle:** Any sequence that parallel branches append to needs the same collision rule as the main one — a reserved range, or an identity that is not a position.

### Observation 673: A critique of a mock-up drawn into the running app needs a standalone markup copy before the detector can read it

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Leave War overhaul, round 14 — /impeccable critique of a balance tile that exists only as a mock-up injected into the real local build by a Playwright script
**Skill:** impeccable (reference/critique.md — Assessment B); brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** Critique — Assessment B on a drawn (not built) surface

**Issue:** Assessment B's CLI detector reads markup files and its browser path expects a served page; the tile under review lived only inside a script that draws it into the running app. A small script had to stage the scene, inline every stylesheet the page had, and write the drawn element to a standalone HTML file; the detector then ran on it (and in-page by injecting detect.js directly). It found the one defect the design reviewer missed: the "you can type this" box edges measured 1.85:1, under the 3:1 a control's edge needs — the box rule could not be seen.

**Suggested improvement:** In critique.md's Assessment B (or the mock-ups guide), add: when the target is a drawn mock-up, first write a standalone snapshot of the drawn element with the page's stylesheets inlined (one file per state), and point the detector and the browser measurements at it; measure non-text contrast of control edges, not only text.

**Principle:** A machine check that cannot reach a surface is not skipped; give it a copy it can read. And a rule that rests on a visual cue ("a box means you can type it") is only as good as that cue's measured contrast.

### Observation 674: A "less height" redraw measured its own saving in the drawing script, and the first draw saved almost nothing

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Leave War navigation, round 19 (D1240: tabs design redrawn with less height at the top), drawn into the running app.
**Skill:** brainstorming (mockups-on-the-real-app.md); impeccable (shape)
**Type:** open-source
**Phase/Area:** drawing a layout change on the real app; reporting it

**Issue:** The ask was "less vertical space at the top". The drawing script measured the top of the grid's first row before and after its own rearrangement. The desktop saved 50px (one row) on the first draw; the phone saved only 10px, because the new tab row (copied from another page so the two look alike) is taller than the row it replaced, and one bar overflowed its width. Two tightening passes, each re-measured, brought the phone to 27px; a member's phone stayed level. Without the numbers, the picture alone looked like a clear win and would have gone to him as one.

**Suggested improvement:** In the mock-ups guide, for any ask about size or space ("less height", "fits on one line", "more names on the first screen"), the drawing script measures the quantity asked about on the real build before and after its own changes, and also each row's overflow, and the page states the measured figures per device and role, including any device where nothing was saved.

**Principle:** When the request is a quantity, measure the quantity in the same run that draws the change, on every device and role it touches; a picture that looks better is not evidence of the quantity, and a saving on one device can hide none on another.

### Observation 675: A ruling answered on one picture left another picture of the same screen stale, and he caught it

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Leave War navigation, round 19: his D1242 gave members the Balances tab; the drawing of the member's main page (tabs Grid · OIL) was not redrawn in the same turn.
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** updating a mock-up page after an answer

**Issue:** The answer was recorded and its own question's pictures redrawn, but the main-page picture a few sections up still showed the member's tabs without Balances. He asked "are u updating a better design for the main page? Like members can have a balance tab?" Redrawing it then exposed a further clash (two things named Balances on one screen), which became a new question.

**Suggested improvement:** After recording a ruling that changes a design, list every picture on the page that draws the changed thing (grep the drawing scripts for the element or the role it touches) and redraw each in the same turn; then look at the redrawn screens whole for clashes the change created.

**Principle:** An answer changes every picture of the thing it governs, not only the picture it was given on; redrawing them all in the same pass is also how the change's knock-on effects are found.

### Observation 676: A drawing's caption described how today's app behaves from memory, and was wrong twice

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Leave War navigation, round 19: the under-manned chip folded into the Manning button.
**Skill:** brainstorming (mockups-on-the-real-app.md); impeccable (shape)
**Type:** open-source
**Phase/Area:** writing what a proposed control does, on the page put to him

**Issue:** The page said the count took amber and red days and that a tap jumped to the next one. His question ("is 1 short helpful with several? amber or red?") made me open the code: today's chip counts red days only and a tap opens a list. The design reading had been carried from a ruling's summary, not from the app.

**Suggested improvement:** Before a mock-up page states what an existing control does today (what it counts, what a tap does), open that control's code or run it once, and cite which; a reading not checked says "not checked".

**Principle:** A description of current behaviour is a claim about the running thing; check it at the source before it reaches the person deciding, or label it unverified.

*Met again 24 Oct 26 (the Leave War round 3 page, Q6 (b)): a caption said the lit button would read "the grid box's own code, <LL" — the grid draws a lone morning as "LL" in the top half; caught by the drawing chat on re-checking before re-asking him, the option withdrawn on the page. Guard proposed: a caption naming what another surface shows is written from a measured node (its innerHTML) in the drawing script, never from the notation in the code's comments.*

### Observation 677: A design study draws every option on one shared data set, the earlier option redrawn too

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Leave War events study (his "is there a better way to design the events"), three ways drawn on the real grid
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** drawing alternatives for a comparison

**Issue:** The option already drawn the round before (event tags in the date heading) used a different made-up data set from the new options, and its text and picture disagreed (text: two events stacked; picture: first event plus a count). Redrawing it with the same events as the new options exposed a defect the old data hid: a several-day event's tag took the day's slot and hid that day's own event behind the count.

**Suggested improvement:** In the mock-up guide's comparison step: define one data set in the script that covers the hard cases the owner named (the maximum per day, spans, a name-only item, a kind with its own colour), draw every option from it including any option drawn earlier, and measure them in one table.

**Principle:** Options compared on different sample data are not compared; a shared stress-case data set is what makes a design study's verdict hold.

### Observation 678: Close-up pictures of each changed control caught button-style faults that full-page walk pictures missed

**Status:** OPEN
**Date:** 22 Oct 26
**Session context:** the Leave War overhaul's M1 bug check — three Sonnet walkers, two re-walks, two blind code reads, then the owner's look pictures
**Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md`) and `raptor-port/docs/walk-scripts.md`
**Type:** open-source
**Phase/Area:** the walk's pictures; the look card

**Issue:** Two new buttons (a closed note's "Open the Inputs page", the admin's new Note) rendered as bare browser-default grey with a white edge — their class had no colours of its own. Over 300 full-page and full-window walk pictures, three walkers and two code readers passed them. Cropping each changed control to itself at twice the pixels for the owner's look page showed both at once, and the first fix's class name ("note") then collided with an existing small-text class and stretched the button — also seen only in the close-up.

**Suggested improvement:** In the bug-check order's walk step, after the walkers return, take one close-up picture per new or restyled control (cut to the control's window or row, deviceScaleFactor 2) and set each beside its neighbours' look before the code read; in walk-scripts.md, add an assertion pattern for a new button: its computed background and border equal a sibling button's of the same kind.

**Principle:** A full-screen picture proves a control is present; only a close-up at real pixel density proves it looks like its neighbours — check new controls at the zoom a person sees them.

### Observation 679: A refusal made permanent must be followed through both directions and one step behind

**Status:** OPEN
**Date:** 2026-10-22
**Session context:** Building D1263 (a member's Undo/Redo onto a Leave War day closed since) on M1's branch; two fresh Opus reads.
**Skill:** systematic-debugging (and the bug-check order's §5 "a fix is new code")
**Type:** open-source
**Phase/Area:** fixing a reviewer's finding about a stuck control

**Issue:** A new permission refusal for Undo/Redo was correct in itself, but the first read found it jammed the Undo button (every press picked the same refused step). The fix made the refused step "blocked" and passed over, and gave the Undo conflict check a guard for an older step behind a blocked one. The narrow read then found the identical jam on the Redo side one step later: the guard was added to one direction only.

**Suggested improvement:** In systematic-debugging's fix step (or the bug-check order's §5 "a fix is new code"), add one line: when a fix turns a refusal into a skip / block / permanent state, enumerate (a) every direction or twin path (undo AND redo, add AND remove), and (b) every step that can sit BEHIND the blocked one and still pick it — and write a test for each before calling the fix complete.

**Principle:** A stuck-control fix is only complete when every path that can select the stuck item — both directions, and the items queued behind it — has been checked; fixing the one path the finding named leaves its mirror broken.

### Observation 680: A geometry test that fails only on the CI's Linux machines is reproduced locally by forcing a wider font, not by reading the CI log

**Status:** OPEN
**Date:** 23 Oct 26
**Session context:** The Leave War's M2 — three browser geometry tests red on GitHub's Linux run, green on the owner's Windows PC
**Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md`) and `raptor-port/docs/gates-and-deploy.md` (the CI's traps)
**Type:** open-source
**Phase/Area:** reproducing a CI-only failure before fixing it

**Issue:** Three layout tests passed locally and failed in CI by 1–47px. The app loads no font of its own, so each machine draws its system font — Linux's DejaVu Sans is much wider than Windows' Segoe UI (and the owner's iPhone sits between). An opt-in switch (`LW_WIDE_LETTERS=1`) that injects `font-family: Verdana, "DejaVu Sans"` into every page from the first paint (an init script, not a style tag added after load — the app measures some text as it loads) reproduced all three failures on the PC at once, plus a fourth the CI had not reached; every fix was then proved red-then-green both ways before pushing. A style tag added after load reproduced only one of them, and a script that loaded the page at the target width (instead of narrowing a wide window, as the test does) missed another.

**Suggested improvement:** In gates-and-deploy's CI traps: "a geometry test red on Linux only — rerun it locally with wider letters forced from the first paint (the spec's LW_WIDE_LETTERS switch, or the same init script) before reading logs; reproduce the test's own order of resizes". In the bug-check order's walk section: layout fixes are walked once with wider letters too.

**Principle:** When a failure depends on the environment, make the local environment adopt the failing property on demand (font, timezone, speed) and reproduce the exact sequence the test follows; a fix proven only against the environment that never failed is not proven.

### Observation 681: The walks pictured every screen after it settled, so a fault that lives in the moment after a tap — and stays on an iPhone — was never seen

**Status:** OPEN
**Date:** 23 Oct 26
**Session context:** The Leave War's M2 — the owner, on his iPhone, found a dirty blue block over the month strip after tapping a month; three walkers, a re-walk and the host's own walk had pressed those buttons and passed
**Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md` §7) and `raptor-port/docs/walk-scripts.md`
**Type:** open-source
**Phase/Area:** the walk — when a picture is taken, and what a touch screen keeps after a tap

**Issue:** The grid's row-hover tint reached a row whose pinned cell must stay opaque; the cell went see-through. In the test browser the hover state cleared within a quarter of a second, and every walk script waited 300–900 ms after a tap before its picture, so every picture showed the settled, clean state. On an iPhone a tap leaves the element "hovered" until the next tap, so the fault stayed on his screen. The fault had been in the app since 19 Aug 26 — two months of walks pressed the same buttons. The same day he also caught two layout mismatches against the approved drawing (row heights, two boxes of different heights side by side) that no step measured. Each is a property no step looked at, not a step done badly.

**Suggested improvement:** (1) walk-scripts.md: on a touch-screen walk, take a picture within 100 ms of each tap as well as after it settles, and keep the hover state (iOS keeps it) — or force `:hover` on the pressed element before the settled picture. (2) A standing browser test per dense screen: press each control on a phone and assert every pinned (sticky) cell stays fully opaque. (3) The bug-check order's walk: a built screen from an approved drawing is measured beside it (heights and side-by-side boxes), as his lesson 42 now says.

**Principle:** A check finds only the states it is pointed at. When a device keeps a state the test browser drops (hover after a tap, wider letters, a slow frame), make the test hold that state on purpose; pictures taken only after everything settles prove only the settled screen.

### Observation 682: An iPhone screen recording can be read on a PC with no video tools — the installed Chrome, in a visible window, decodes it

**Status:** OPEN
**Date:** 23 Oct 26
**Session context:** planning the Leave War's pinch to zoom; he attached a screen recording of the fault and said to ask him to describe it if it could not be opened
**Skill:** brainstorming (its mockups-on-the-real-app reference)
**Type:** open-source
**Phase/Area:** taking in the owner's evidence before drawing

**Issue:** The PC has no ffmpeg, and an iPhone records in HEVC: the headless test browser loaded the file but reported a 0 x 0 video and drew blank frames. A search of the disk for an attached file also cost a two-minute timeout before the upload's own path arrived in his next message. Opening the same file in the installed Chrome through Playwright with `headless: false` and the HEVC decoder feature on played it, and canvas captures every half second gave clear frames; turned upright and cropped, three of them became the before / after pictures of his question page.

**Suggested improvement:** In the mockups reference, under "Showing It" or a new "His own evidence" line: a recording he sends is read first, frames pulled with the repo's `scripts/handpass/video-frames.mjs` (visible Chrome, HEVC on), and its key frames — turned and cropped to the place, marked — go on the page as his own pictures beside the drawn ones; ask him to describe it only if that fails. Wait for the upload path rather than searching the disk.

**Principle:** Before asking a person to describe evidence they sent, try the ordinary tool they used to make it (their phone's format in a full browser); a headless or minimal player failing is not the file failing.

### Observation 683: A ring on a top-cropped picture is placed against the crop, not the whole picture

**Status:** OPEN
**Date:** 2026-10-23
**Session context:** the Leave War pinch look card, an Artifact page of walk pictures with marked places (D921, D1222)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** marking the place on a picture shown cropped

**Issue:** A tall phone picture was shown cut to its top (a box of 804x1100 over a 1748-tall picture, the picture covering it from the top) and the ring round the date row was first placed in percentages of the whole picture, so it would have sat about a third too high and too short.

**Suggested improvement:** In the mock-up guide, one line: when a picture is cropped by its box, a ring placed in percent takes the BOX as its measure (pixels from the top / the box height in picture pixels), or the ring is drawn onto the picture itself.

**Principle:** A mark placed in relative units is relative to the element that holds it; once a crop makes that element differ from the source, convert every coordinate to the crop.

### Observation 686: A FULL walk read a window's top line in its "new bid" state only; the owner found it wrong in the "bid already placed" state

**Status:** OPEN
**Date:** 2026-10-24
**Session context:** his iPhone look at the Leave War M3 build (pull request 569) the morning after its FULL bug check. Numbered past 682–685 on `claude/night-records-1021` (unmerged).
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §7.4) / walk briefs
**Type:** internal
**Phase/Area:** scenario design — the state table

**Issue:** The bid window has two states, a new bid and a bid already on the day ("NOW LL"). The walk read the day line before a bid that turns Available P red (PASS) and the bubble after it (PASS); it reopened placed bids several times, but only on calm days and to check documents and remarks. Nobody listed "reopened on the day it turned red × the day line", and the day line there said "No manning row turns amber or red" (his D1296). The code read missed it too.

**Suggested improvement:** in the sizing step and the walk brief, for every window with more than one state, write a table of state × every reading the window shows (day line, figures, buttons) and give each cell a scenario or a named test — the §7.4 state table applied to readings, not only to presses.

**Principle:** A reading that is right in one state of a surface is unproved in its other states; list each state against each thing it shows, not only against each action.

### Observation 687: A unit-test world without the real door could not reach the state the default control makes

**Status:** OPEN
**Date:** 24 Oct 26
**Session context:** M3's follow-ups — fixing the bid window's day line on a day already holding the bid (D1296), red test first
**Skill:** existing — the bug-check order (`raptor-port/docs/bug-check-order.md` §7.4 / §7.11), not a skill
**Type:** open-source
**Phase/Area:** the state table of a reading; which world a red test runs in

**Issue:** The red-first tests for the fix ran in the store alone, where a bid placed stays a PENDING request. In the app the admin's "Approve what I enter" is ticked by default, so his bid lands APPROVED, becomes a leave on another page, and a second write over it is refused — a different code path. The fixed line drew nothing there; only the walk, driving the default control, found it. The owner's own report was the pending case, which the tests did cover.

**Suggested improvement:** In §7.4's state table (and §7.11 lesson 1), name the column "the state the DEFAULT controls produce for each role" explicitly, and require that the red test of a fix runs at least once through the real door that produces that state (here, the absence door with both stores), not only a store-only fixture.

**Principle:** A fix proven only in a fixture that skips the real write path is proven for the fixture's state; the state a default setting produces must be in the test's world too.


### Observation 688: The Edit tool evens out a file's mixed line endings, turning a 16-line change into 218

**Status:** OPEN
**Date:** 2026-10-24
**Session context:** Leave War — adding the demo's six counters (D1312); one Edit inserted 16 lines into `src/leavewar/state/store.ts`
**Skill:** New skill candidate: none — a repo working note (beside the memory note "Python edits turn LF into CRLF")
**Type:** internal
**Phase/Area:** editing source files on Windows

**Issue:** `store.ts` holds mostly CRLF lines with a few LF-only ones. One Edit call rewrote the LF-only lines as CRLF, so `git diff --stat` showed 117 insertions and 101 deletions for a 16-line addition. `grep -c $'\r'` in Git Bash reported 0 for both versions and hid the cause; only a byte compare in Python found it. Unnoticed, the commit would have shown a reader a hundred unchanged lines as changed.

**Suggested improvement:** after editing a file on Windows, compare `git diff --numstat` with `git diff --numstat --ignore-space-at-eol` for every changed file. Where they differ, put the original bytes back and re-insert the change with a byte-preserving script (the file's own line ending). Worth a line in `docs/gates-and-deploy.md` or a memory note.

**Principle:** A diff much larger than the change made is a signal to stop and find out why before committing. Compare the diff with and without end-of-line whitespace, because tools differ on line endings and the shell's own counters can hide a carriage return.

### Observation 689: A drawing made with the design skill kept the old words beside the new boxes

**Status:** OPEN
**Date:** 24 Oct 26
**Session context:** Leave War — drawing the day list of a day with two entries (D1327: each entry led by its coloured box)
**Skill:** impeccable (reference/shape.md — the brief); brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** shape brief → drawing

**Issue:** The brief added a coloured box in front of each entry but kept the entry's long description beside it ("Medical — ATT B, no flying but may still work, afternoon · filed on the Inputs page", then "Change it on the Inputs page."). The owner, seeing the first picture on his phone: "that's a lot of words … I thought the design skill will cut down" (D1328), and then circled a row whose button words broke over two lines (D1329). The shape step treated the words as content to carry over, not as part of the design.

**Suggested improvement:** In shape's brief (and the mock-up method), when a new visual element takes over what words used to say, the brief lists the words it makes redundant and cuts them in the same drawing; and a row of buttons is measured for one line at the target device's width with wider letters before the picture is shown.

**Principle:** Adding a visual carrier for a meaning should remove the words that carried it; a redesign that only adds is not a declutter.


### Observation 690: A field saved on blur, pressed past by a button — only a test without the blur sees an iPhone's loss

**Status:** OPEN
**Date:** 24 Oct 26
**Session context:** round 3's FULL check of the Leave War bid windows (branch claude/lw-m3-placing-leave)
**Skill:** project method — `raptor-port/docs/walk-scripts.md` (§4) and the bug-check order's scenario design (not a skill file)
**Type:** open-source
**Phase/Area:** walk scenarios for text boxes that save "when the box is left"

**Issue:** A Remarks box saves its words when it loses focus. Words typed, then Approve / Refuse / Move tapped: the walk in Chromium PASSED (the button takes focus, the box blurs and saves first), but on an iPhone a tapped button takes no focus, so no blur fires and the window closed without the words. Only the scenario designer's reading of the code named it; seven unit tests that type and press with no blur (as an iPhone does) went red.

**Suggested improvement:** walk-scripts.md §4: for every box that saves on blur, each action that can follow it is ALSO tested with no blur in between (a unit test's fireEvent, or element.click() after focus in the browser) — a Chromium walk's PASS on that order proves nothing for an iPhone.

**Principle:** When the walk's engine and the owner's device deliver focus differently, a pass in the walk's engine is not evidence; test the device's sequence directly.

### Observation 691: CSS that loses silently — a scoping wrapper and an invalid shorthand, both caught only by a real browser

**Status:** OPEN
**Date:** 24 Oct 26
**Session context:** round 3's FULL check of the Leave War bid windows
**Skill:** project method — the build's guards (`raptor-port/docs/gates-and-deploy.md`, a structural test) (not a skill file)
**Type:** open-source
**Phase/Area:** styles written for a new screen

**Issue:** Two faults in one build, both invisible to unit tests (no stylesheet) and to a code read: (1) a block of new rules written after the file's `#page-leavewar { … }` wrapper closed lost to every older wrapped rule (the file's own head warned of exactly this); (2) `font: 600 13px/1.3 inherit` is not a font, so the browser dropped the line — and eight older copies of the same line sit in other stylesheets.

**Suggested improvement:** a cheap structural test: no rule after a scoping wrapper's close in a wrapped file (or a list of allowed ones), and no `font:` shorthand naming `inherit`. A rule that only a comment states will be broken again.

**Principle:** A rule that fails silently needs a mechanical guard, not a louder comment.
