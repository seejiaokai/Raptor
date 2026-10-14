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

Met again 15 Oct 26 (`[LW-LANDING-LINE-FIGURES]`): a `python - <<'EOF'` edit script inserting a test wrote each `\\b` of a regex as a BACKSPACE byte and each escaped apostrophe as a bare one — the file first failed to parse, then every `\b` assertion matched nothing; two more inline fixes (`sed` replacements) mangled it again before a script written with the file tool put it right. The guard is the one already proposed and approved to build — `[SHELL-SCRIPT-GUARD]` (D811): a script is written to a file, always.

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
