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
