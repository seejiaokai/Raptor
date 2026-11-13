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

## 2026-10-13

### Observation 722: A rehearsal of the project's check, and a fingerprint of each live file, caught two faults in a review's drafts before the reader saw them
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/task-observer/references/weekly-review.md` Delivering updated skills: "a draft is a diff against a moment" — the base recorded, the install refuses a changed live file; the rehearsal before the read was already there
**Date:** 2026-10-27
**Session context:** The skill review of 27 Oct 26 (152 notes, 19 drafted guides). Positive signal.
**Skill:** task-observer (`references/weekly-review.md`, Delivering updated skills)
**Type:** open-source
**Phase/Area:** Staging drafts; the install script

**Issue:** Two faults surfaced before the independent read, each from a step taken for another reason. (1) The install script stored each live file's blob id at staging and refused to copy a draft over a live file that had changed since: the rulings index had been rewritten by a script run after the copy, and an install would have put back its stale lines. (2) The rehearsal (drafts copied over the live files, the document check run, the live paths restored by name) failed on a line-count tripwire the drafts pushed over, so the lines were moved to the right home before the reader read them. Neither was visible from the drafts alone.

**Suggested improvement:** In Delivering updated skills: record each live file's fingerprint when its draft is made, and have the install refuse a live file that has changed since ("rebase the draft first"); rehearse the project's checks with the drafts in place before the read, not only before the install.

**Principle:** A draft is a diff against a moment; check the moment still holds before applying it, and run the target's own checks on the drafts while they are still cheap to change.

### Observation 723: Every rulings filing rewrote the map a staged DECISIONS.md draft is built on
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/task-observer/references/weekly-review.md` Delivering updated skills: a file a script keeps rewriting is staged as its addition only, applied at install (the same change as 722)
**Date:** 2026-10-27
**Session context:** the skill-notes review of 27 Oct 26, recording his answers to two rounds while the drafts waited for install
**Skill:** task-observer (references/weekly-review.md — staging and delivering)
**Type:** internal
**Phase/Area:** weekly-review — staging a draft of a file a script rewrites

**Issue:** The review staged a draft of `DECISIONS.md` (three lines added to its head). Each of his answers was recorded as a ruling, and `backlog-archive.mjs --rulings` rewrites that file's map every time; five times in one day the staged draft fell behind the live file. The install guard caught it each time (good), but each catch cost a rebase, a fresh blob id in `_review/live-hashes.txt` and a commit; once the rebase ran before a second `--rulings` call in the same step, and the rehearsal refused again.

**Suggested improvement:** In weekly-review's staging step: a draft of a file a project script rewrites (here the rulings map) is staged as the ADDITION only — its anchor and its text — and `install.mjs` applies it to the live file at install, so no ruling recorded during the rounds can make it stale. Until then: rebase and refresh the hash only after the LAST `--rulings` call of a step.

**Principle:** Stage a change to a generated or script-maintained file as a patch applied at install, not as a whole-file copy; a whole-file draft of a file that keeps changing goes stale at every write.

### Observation 724: A plan's "waits on his answer" table is not updated when the answers come
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/writing-plans/SKILL.md` Self-Review 10: a table of the questions a step waits on is a home of each answer; the D201 sweep's half filed as [RULE-FILE-LESSONS] (a)
**Date:** 2026-10-27
**Session context:** Planning the Leave War overhaul's M4 from the approved build plan of 22 Oct 26
**Skill:** writing-plans (and the record-decisions rule's D201 sweep)
**Type:** internal
**Phase/Area:** a plan's table of the questions each step waits on

**Issue:** The build plan's §2 table still read "Q8 … without his answer: not sent" and "Q11 … taken back silently" five days after he answered both (D1214, D1216). The rulings named the notifications register as their home and were filed there; the plan that listed them as open was never touched, so the next chat met two settled questions presented as open and had to search the rulings to find them answered. The plan's M4 row also still described Approvals as a docked window after D1254 made it a tab.

**Suggested improvement:** In writing-plans: a plan that lists the questions a step waits on names, in the same table, the plan file itself as a home every answering ruling must update; and the D201 sweep's "search for the rule's SUBJECT" step lists `docs/superpowers/plans/` explicitly.

**Principle:** A list of open questions is one more home of every answer to it; record the answer there too, or the list keeps asking.

### Observation 725: A mock-up built from an older drawing's script inherits its look-alikes
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging, new bullet "Reusing an older drawing or its script" (stand-ins replaced by the app's own markup; the probe-bridge example cut for size by the Opus reader's O12) and step 6's prefix line (`.r`) — one change with 737; his correction itself is already lesson 25 / D1180
**Date:** 2026-10-27
**Session context:** Drawing the Leave War's Approvals tab for M4, reusing round 7's Approvals markup
**Skill:** brainstorming (mockups-on-the-real-app.md, "An existing component shown inside a mock is measured, not styled")
**Type:** internal
**Phase/Area:** drawing an existing component inside a mock-up

**Issue:** The Approvals pictures copied round 7's hand-made person "puck" (an olive box and a separate CAT circle) instead of the app's own puck, though his ruling D1180 and design lesson 25 say the line shows his own puck and the guide says an existing component is reproduced, not styled. He circled it on his phone: "Why don't just do a puck here". The real one was one call away on a local build (`window.puck(id, …)`, the schedule's puck); dropping it in also exposed a class clash (the mock's row class `.r` matched the real puck's rear-seat class `.r` and stretched it).

**Suggested improvement:** In mockups-on-the-real-app.md: before reusing an older drawing script, list every app component it draws and replace each stand-in with the running app's own markup (on a local build the probe bridge exposes several builders, `window.puck` among them); and a mock's own classes take a prefix, never a one-letter name the app already uses.

**Principle:** Reusing an old mock's code reuses its shortcuts; re-check every component it draws against the real one before the picture goes out.

### Observation 726: Never `git checkout <file>` to drop a debug line — it drops every uncommitted edit in that file
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 4: instrumentation taken out by an exact edit of its tagged lines, never a file restore; or commit first
**Date:** 2026-10-27
**Session context:** The Leave War overhaul's M4 build — two temporary debug prints were added to a file that also held two hours of uncommitted edits.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Cleaning up after instrumentation

**Issue:** To remove two debug prints, the agent ran `git checkout <file>`, which reverted the whole file to its last commit — the two uncommitted feature edits in it went too. They were recoverable only because each edit had been applied by a saved script that could be re-run.

**Suggested improvement:** In the debugging guide's instrumentation step: remove a debug line by an exact edit of that line (or mark it with a unique tag and delete the tagged lines), never by restoring the file; or commit (a WIP commit) before adding instrumentation, so a restore can only take the instrumentation.

**Principle:** A restore works on files, not on intentions: before using one to undo a small temporary change, check what else in that file is uncommitted — or make the temporary change only on top of a commit.

### Observation 727: A fit fix reshaped an approved drawing; nobody held the build beside the drawing until the owner did
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): BCO §7.10 "Built to the drawing, from the first line" (D1424, as built and after every fix) and §7.11 lesson 8 (the same Approvals fix); BCO §7.0 names the drawing per surface
**Date:** 27 Oct 26
**Session context:** The Leave War M4 bug check (Approvals page), the third chat
**Skill:** brainstorming (mockups-on-the-real-app) / the bug-check order — New skill candidate: none
**Type:** internal
**Phase/Area:** building a screen from an approved drawing; fixing a layout fault on it

**Issue:** A chip's words wrapped on a phone. The agent fixed the symptom by rearranging the grid (a fourth row) without opening the approved drawing, and the first build had narrowed the desktop card where the drawing kept it full width with the list inside. The drawing comparison (bug-check order §7.10) was scheduled for after the walk, so the owner found both by looking at his drawing (D1424, §7.11 lesson 8).

**Suggested improvement:** In the build and in any fix to a drawn screen, open the drawing first and picture the result beside it before committing — a step in the build spec's checklist and in the bug-check sizing step, not only at the walk.

**Principle:** A layout fix is checked against the approved picture, not only against the fault it fixes — a fix that satisfies the test can still undo the design.

### Observation 728: A rule begun at body in a page-scoped stylesheet never matches; a walk's pinned date makes faults that are not there
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §7 (a walk that pins the war's today but not the real clock: reproduce in a unit test with both pinned); its CSS part is already in the Leave War stylesheets' scoping comments (matrix.css head, approvals.css), its picture part in BCO §4 (D1271)
**Date:** 2026-10-27
**Session context:** the Leave War overhaul's M4, fixing the walk's faults (branch claude/leave-war-m4-planning-d18224)
**Skill:** New skill candidate: none — the bug-check order's walk scripts (raptor-port/docs/walk-scripts.md) and the design guide's CSS notes
**Type:** internal
**Phase/Area:** fixing a walk's finding; writing a walker's brief

**Issue:** (1) A CSS fix written `body:has(...) .bidsheet` in a Leave War stylesheet did nothing: the build scopes every rule there under #page-leavewar, producing "#page-leavewar body:has(...)", which never matches. Two builds went before the built CSS was read. Written from the page instead (`&:has(...)` inside the scoped block) it worked. (2) Two walk findings (the member's "bidding ended" line, a posted-out man's approval) were first read as faults because the walk pinned the war's today to Jan 26 while notices, postings and stamps ran on the real clock (Oct 26). One hid a real fault in the same code. (3) A browser test that passed (the date "on one line") missed that the date was now covered by the buttons; only opening a picture showed it.

**Suggested improvement:** walk-scripts.md: a scenario that crosses the war's pinned today and the real clock is reproduced in a unit test with both pinned before it is called a fault. The guide's CSS note: in a scoped stylesheet, read the built rule (grep dist) after the first build that does not change the screen. A layout fix is looked at in a picture even when its test passes.

**Principle:** When a fix has no effect, read what the build actually produced before trying again; when a test passes, look at the screen it measures, since a test checks only what it names.

### Observation 729: A walker's "the mark is missing" on a few-pixel mark is checked enlarged before it is called a fault
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §7 (a small mark said missing is looked at cropped and enlarged, or measured, before it is a finding or code is traced)
**Date:** 27 Oct 26
**Session context:** Leave War M4 bug check, the fifth chat — confirming walker A's observation O3 (a SANS man's puck in Approvals "has no purple edge").
**Skill:** New skill candidate: none — walk-scripts.md (project guide) / the walker's brief
**Type:** open-source
**Phase/Area:** confirming walk findings; the walker's brief

**Issue:** A Sonnet walker reported a 4px coloured edge missing from a small badge on a list row. The host traced the drawing code and stylesheet looking for what hid it, then measured it in the live app and found it drawn; cropping and enlarging the walker's own picture showed the edge was there all along. The walker had judged a few-pixel mark at the row's normal scale.

**Suggested improvement:** walk-scripts.md and every walker's brief: a finding that a SMALL mark (an edge, a dot, a chip under ~6px) is absent or wrong is confirmed on a cropped, enlarged picture — or by measuring the element — before it is written as a fault; the host does the same before tracing code.

**Principle:** Absence of a small visual mark is a claim about pixels; check it at a scale where the mark would be unmistakable before spending effort explaining why it is missing.

### Observation 730: A "matches the drawing" verdict needs its own pair, the same as a difference
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §7.10 drawing-check bullet: "Matches" needs its pair or its check's record, else "not compared"
**Date:** 27 Oct 26
**Session context:** Leave War M4 — building the owner's answers to a drawing-vs-build page; the page had listed three surfaces as "matches, nothing to choose".
**Skill:** brainstorming (mockups-on-the-real-app.md) / the bug-check order §7.10 (the built screen beside its drawing)
**Type:** open-source
**Phase/Area:** comparing a build with its approved mock-ups

**Issue:** The comparison page cut a ringed pair for every difference it found, but declared three surfaces "matching" without cutting a pair for them. One (the phone's slim bar) carried the same three differences as the desktop one the owner then ruled on; a ruling's reading repeated the false "matches" and had to be corrected, and a new question had to go back to the owner.

**Suggested improvement:** In the drawing-comparison step, every surface with an approved drawing gets a pair — the differences ringed, a match shown unringed — and a "matches" line cites its pair; a surface with no pair is listed as "not compared", never as matching.

**Principle:** A negative verdict ("no difference") is a claim like any other and needs the same evidence as a positive one; listing a surface as checked without its evidence is how a difference survives a careful review.

### Observation 731: Answer a question about a screen on the device of the picture he attached
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §The Method head paragraph, "His picture is part of the question" (name its device and width, answer on the same one) — one change with 800
**Date:** 27 Oct 26
**Session context:** Leave War M4 — he asked how a lowered Manning row would show in Approvals' LOWEST AVAIL, attaching a phone screenshot; the answer came with a desktop picture, and he had to say "i said this is for a phone".
**Skill:** New skill candidate: none — plain-language.md / the D921 picture rule
**Type:** open-source
**Phase/Area:** answering questions about what a screen shows

**Issue:** The attached picture was cropped and showed the phone's two-line layout, but the agent answered from code and reached for the nearest existing picture, which was a desktop one. The two layouts show the same figures in different places, so the answer did not show him what he asked about.

**Suggested improvement:** Before answering a question about a screen, name the device and width of any picture he attached (phone or desktop) and make the answer's picture on the same device, the place marked; where the case needs data the demo lacks, set it up through the app's own windows rather than substituting a nearby picture.

**Principle:** The picture a person attaches is part of the question: answer on the same view they asked about, not the one that is easiest to find.

### Observation 732: A skill loaded from the main checkout's stale copy, not the worktree's current one
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 1 step 1: a guide loaded from another folder is compared with this branch's copy, the branch's followed; the mechanism is already in gates-and-deploy "A worktree chat loads…" and the handoff guide's Step 3
**Date:** 2026-10-28
**Session context:** /overnight 12 for the Leave War M4 bug check, run in a worktree whose branch carries the installed skill-notes review (D1419)
**Skill:** overnight (and every project skill loaded from a worktree)
**Type:** internal
**Phase/Area:** loading the skill (Part 1)

**Issue:** The Skill tool loaded `.claude/skills/overnight/SKILL.md` from the MAIN checkout's folder (its base directory named the main folder), which sits on an older commit. The worktree's own copy carries the review installed on D1419 — "Low or Medium?" (D1104), one fresh helper per job (D1416), the weekly figure stopping nothing (D1415). The night started on the old text: no Low/Medium question, the first jobs built in the night's chat. He asked "didnt i say overnight 12?" two hours in, which is what made the agent compare the two copies.

**Suggested improvement:** At the head of every project skill (or in the session-start hook): when the loaded base directory is not the current worktree's `.claude/skills/`, diff the two and follow the worktree's copy. A guard better than a line: the hook that injects skills checks the worktree path.

**Principle:** In a worktree, the skill text that governs is the branch's own; a loader that reads a shared root can hand you a stale rulebook with no error.

**Met again 28 Oct 26:** the records-and-M5 chat (`claude/lw-whole-records`) — the session-start hook's task-observer loaded from the main folder (on 26 Oct 26's commit); the worktree's copy differs (the size trigger, the cross-branch `git grep`). Caught by diffing the two; nothing in this session turned on the difference. Every project skill differs the same way, overnight included.

### Observation 733: A planning report put screen questions to him in words only
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [RULE-FILE-LESSONS] (d), new in `_docs/OUTSTANDING-items.md`: the counting step belongs in plain-language.md's check before sending, a rule file not drafted here
**Date:** 2026-10-28
**Session context:** planning the Leave War overhaul's M5 (claude/leave-war-m5-handoff-3a6602)
**Skill:** New skill candidate: planning-report (or the closing-report check in plain-language.md)
**Type:** internal
**Phase/Area:** the closing report of a planning job

**Issue:** The M5 plan's closing message named the person window, War bal, the Balances page and Settings and asked four questions about them with no picture. He replied "Where is the drawing". D853 and D921 already require pictures of the real app, the place marked, the first time anything on screen is raised; the rule was loaded and still missed, because the four points felt like "rules, not screens" and the redraw was planned for the next step.

**Suggested improvement:** Add to plain-language.md's check-before-you-send a mechanical step: list every screen, tile, figure or control the message names; each needs a picture link in the same message (an existing drawing, cropped and marked, is enough) or the message is not sent.

**Principle:** A rule judged case by case ("is this a screen question?") slips under the pressure of a long job; a checklist step that counts the screen names in the draft does not.

### Observation 734: An "all as recommended" ruling was written from the plan's wording, not the page he saw
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [RULE-FILE-LESSONS] (c), new: blanket approvals recorded from the page version he answered, and the reader checks the line against it — DECISIONS.md's steps, not drafted here
**Date:** 2026-10-28
**Session context:** recording the owner's "All as recommended" to the Leave War M5 plan's four points (claude/leave-war-m5-handoff-3a6602)
**Skill:** New skill candidate: recording-rulings (record-decisions.md's three steps)
**Type:** internal
**Phase/Area:** writing a ruling's bold rule after a blanket approval

**Issue:** The owner approved four recommendations shown on a questions page. The agent wrote the rulings from the plan document's fuller wording ("dated on or after the day App bal was last typed"), which carried a condition the page never showed him; it also filed a point the page did show ("each with its own full check") as the agent's reading, and wrote a reason he did not give unlabelled. The fresh reader caught all three.

**Suggested improvement:** In record-decisions.md's step 1: when he approves a page "as recommended", open that page and write each bold rule from the page's own recommended text; anything only in the plan behind it goes under "The agent's readings", marked to check with him.

**Principle:** A blanket approval covers exactly what the approver was shown; the richer internal document behind it is the agent's reading until shown.

**Met again 2026-10-28** (claude/leave-war-m5a-screens-ced9d7): D1483's short line said the tabs drop their icons "under 400 wide" — the drawing script's cut-off; the page he answered showed only 375 wide. The fresh reader of D1478–D1489 caught it (and three more). **Proposed guard:** the fresh reader's brief for every blanket-approved ruling names the page version answered (`git show <sha>:<page>`) and checks each number and condition in the short line against it — an unconditional step, not a judgement.

### Observation 735: A roll-call's search for a removed class was confined to the area's own files
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §6 new row after the removal row (a removed, renamed or moved selector searched across the whole app, every test folder and the probes; tests checked not hollow); CL step 8 names it
**Date:** 2026-10-28
**Session context:** [LW-NAME-PUCKS] — the Leave War grid's name bar and badge replaced by the schedule's puck (claude/leave-war-m5-handoff-3a6602)
**Skill:** bug-check order §6 (the roll-call)
**Type:** internal
**Phase/Area:** the roll-call's list of readers of what a change removes

**Issue:** The removed classes (`.cs`, `.catchip`) were searched for in the Leave War's folder and the browser tests with patterns built around the area's own idioms. The fresh code read then found a style test in the scheduler's folder and two browser tests still reading them — one of which had silently gone vacuous (its list of cut names was now always empty, so it could never fail).

**Suggested improvement:** In §6's row "A change that REMOVES or replaces a control…": a removed class or test id is searched for across the whole app, every test folder and the probes, by each exact selector on its own, uncapped; and every test whose query used it is checked for going vacuous (a guard that it still finds things).

**Principle:** A removal's readers are found by searching for the removed thing everywhere, not where the change lives; a check that reads a removed element passes silently.

### Observation 736: The `\b` backspace trap of observation 668 met again — a quoted heredoc feeding a node edit script
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): `.claude/hooks/script-guard.mjs` refusal 1 (live, read today; it refused this helper's own first script): a file-writing script typed into the shell holding a backslash
**Date:** 2026-10-28
**Session context:** `claude/leave-war-m5a-screens-ced9d7`, drawing M5a's person window on the real app
**Skill:** New skill candidate: none — the project's script-writing memory notes and [SHELL-SCRIPT-GUARD] (observation 668, closed 27 Oct 26)
**Type:** internal
**Phase/Area:** editing a drawing script from the shell

**Issue:** An edit script written through a quoted `<<'EOF'` heredoc and run with node carried `/\\bam\\b/` search strings; the strings reached the file as a backspace character, so the first replacement failed ("missing: const half = /am/…"). Redone with the file-edit tool, which worked first time. Observation 668 (closed) and two memory notes name this trap; it still cost a round trip because the shell path was chosen by habit.

**Suggested improvement:** Count it toward [SHELL-SCRIPT-GUARD] — the guard that refuses a shell-written script carrying a backslash — rather than another note.

**Principle:** A trap noted three times and still met wants a check in the action itself, not a fourth note.

### Observation 737: A control added to a new tab page duplicated one the app's own top row already carries
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging, "Reusing an older drawing" bullet (each carried control checked against the controls built since; a duplicate put to him) — one change with 725
**Date:** 2026-10-28
**Session context:** Leave War M5a round 2 — the Balances page redrawn from round 14's drawing onto today's app, which now has a tab row with the View period picker above every tab's page.
**Skill:** brainstorming (mockups-on-the-real-app.md) / impeccable (critique)
**Type:** open-source
**Phase/Area:** carrying an older drawing's controls into a page that now sits under a shared top row

**Issue:** Round 14's page carried its own year picker. Redrawn under the new tab row, the agent kept it on the "Days taken" view, beside the View period picker the top row already shows — two year controls on one screen that could disagree. The agent's own side-by-side against the approved drawing did not catch it (the picker matched the drawing); a fresh design reviewer looking at the pictures did.

**Suggested improvement:** In mockups-on-the-real-app.md, when an older drawing's page is placed under chrome built since: list each control the page carries and check the surrounding chrome for one doing the same job; a duplicate goes (or is put to the owner), it is not carried over because the old drawing had it.

**Principle:** A side-by-side with the old drawing proves sameness, not fitness: re-check each carried control against what the screen around it now already offers.

### Observation 738: A differences list written mid-night goes stale before the morning look
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 3, report item 1: a list written in the night is checked against a picture of the last build, closed items marked
**Date:** 2026-10-29
**Session context:** Showing him M5a's drawing differences from the night's walk triage, the morning after the build.
**Skill:** overnight
**Type:** open-source
**Phase/Area:** the morning report — the "differences from the drawings" list put to him (D1426)

**Issue:** The triage was written at ~02:20, before three fix rounds. One of its seven differences (the Grades window's place and box width) had since been put right by a later fix; only opening the latest re-walk picture beside the drawing showed it. Shown as written, he would have been asked to choose on a difference that no longer exists.

**Suggested improvement:** In the overnight skill's morning-report step, re-check each listed drawing difference against a picture of the LAST build before it goes to him, and mark any that a later fix closed.

**Principle:** A list of findings is dated by the build it was taken from; before putting it to someone for a decision, re-verify each item against the latest build.
### Observation 739: A drawing's placement formula is not the spec — its picture is
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 6 "From the picture to the build" (a computed place is a means of drawing; the note says where in words); its second-state half is already WS §10 "Bring the build to the drawing's own world"
**Date:** 2026-10-29
**Session context:** Building the drawing check (D1494) and proving it on the Leave War M5a build. (Numbered past 736–738, held on `claude/leave-war-m5a-screens-ced9d7`.)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** "From the picture to the build" — the drawing script handed to the builder

**Issue:** The approved drawing placed a docked window by a formula on the page's scroll (the card's top + 64, floored at 0). The drawing script had scrolled the page first, so the picture shows the window under the top bar. The builder copied the drawing script's formula verbatim; in the drawing's own scroll position build and drawing match, but with the page at its top the built window stands 136px lower. A by-eye check of the build in its usual state saw the gap; the build's author, reading the script, believed it matched.

**Suggested improvement:** In mockups-on-the-real-app.md §"From the picture to the build", add: a placement a drawing script computes from the live page (scroll, a neighbour's box) is a means of drawing, not a requirement; the builder takes the PICTURE's place and the drawing note says in words where the part stands ("under the top bar, whatever the scroll"). And the drawing check gives every docked or floating part a second state with the page at its top.

**Principle:** A drawing's code reproduces one picture; what the picture means must be written in words, or a builder will copy the code's accidents.

### Observation 740: Drawings drawn on the real app can be replayed exactly — record their measures as they are drawn
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 6 (drawn with the drawing check's recorder beside it, pointing at WS §10); the recorder and the replay proof are already WS §10 "Record the drawing when it is drawn"
**Date:** 2026-10-29
**Session context:** Building the drawing check (D1494).
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** step 6 — "commit the injection script beside the pictures"

**Issue:** Replaying the committed M5a drawing scripts on the build they were drawn on (served from its built folder inside the test browser, the clock and saved world the scripts already fix) reproduced every one of the 33 approved pictures it re-drew, pixel for pixel. A preload module (`node --import`) that wraps the browser's screenshot measured each named part at the exact moment of the approved picture — no drawing script changed. The drawing thus yields numbers (boxes, colours, where words sit), which the by-eye comparison never had.

**Suggested improvement:** In mockups-on-the-real-app.md step 6, add: draw with the drawing check's recorder beside the script (`raptor-port/scripts/drawcheck/record.mjs`, a part list naming what the build must match), so the record and its whole-screen picture are committed with the drawing; an old drawing is replayed on its own build and its replay proved pixel-identical before its record is trusted.

**Principle:** A picture that was drawn by a script on the real thing is a measurement waiting to be taken; take it when it is drawn, and prove the replay before trusting it.

### Observation 741: A drawing laid over the live page can cover the page's own parts, and a ruling "back to the drawing" then copies the cover
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Traps new bullet (a panel laid in at a measured place can cover live parts; assert no overlap), MOCK §Showing It (approved pictures kept as files), BCO §7.10 (look where the drawing meets the page before "back to the drawing")
**Date:** 29 Oct 26
**Session context:** the Leave War's iPhone locked Balances page brought back to its approved drawing (a ruled fix found by the drawing check), then M5b's drawings
**Skill:** brainstorming (its reference mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** "The Method" step 3 (one transform) and "Traps When Injecting Into a Live Page"

**Issue:** The approved drawing of a member's Balances page was a panel laid onto the running app at a fixed place. On the member's screen the row above it (a period picker and a summary box) was a few pixels taller than on the admin's, so the drawn panel covered that row's bottom 6px: two boxes lost their bottom edges. Nobody saw it at approval; the drawing check later reported the built page 6px "lower than drawn", and the owner ruled "back to the drawing". Following the ruling literally would have built the covering into the app. Only cropping the band where the drawing meets the live page showed the cause. A second thing: the approved picture existed only inside a side-by-side sheet, so the check could not confirm the replayed drawing pixel for pixel.

**Suggested improvement:** In "Traps", add: after injecting a panel or window at a measured place, look at its top and bottom edges against the live parts beside it, on every role and size drawn (a part above it may be taller for one role), and assert in the script that no live control's box is overlapped by the injected one. In "Showing It": keep each approved state's picture as its own file beside any side-by-side sheet, so a later measurement can compare against it.

**Principle:** A drawing is evidence of intent, not ground truth: before building "to the drawing" a difference measured against it, look at where the drawing meets the live page — a drawing's own defect is found there, and copying it is a regression.

### Observation 742: A drawing's own marker ring is measured as a design difference by the drawing check
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §10 "Name the parts" (a drawing's inline marker ring left out of the checks); the recorder stripping it rides [DRAW-MARK-HELPER]
**Date:** 2026-10-29
**Session context:** M5b's build (the Leave War's Settings, Events list, holidays by file, Management on Quals) and its drawing-check part list, recorded from full-m5b-draw.mjs
**Skill:** walk-scripts §10 (the drawing check) — project guide, not a skill file
**Type:** internal
**Phase/Area:** writing a part list; the comparing's "look" checks

**Issue:** The M5b drawing marked its new Quals heading with an inset pink box-shadow (its pointer at the change, set inline by the drawing script). The part list compared the heading's whole look, so the run reported "its shadow — drawing pink ring, built none" as an unexplained difference. Every other marked part in that drawing used an outline (not measured), so only the one drawn with a box-shadow tripped it.

**Suggested improvement:** In walk-scripts §10 "Name the parts", add: a part the drawing script marks with an inline ring (box-shadow or border in the marker colour) leaves that look out of its checks, with a comment naming the marker; better, the recorder could strip the marker styles (`.zz-new` outline, the `#ff2d95` inline shadow) before it measures.

**Principle:** A measurement of an annotated picture must separate the annotation from the design, or the check reports the annotation as a fault.

### Observation 743: Walk fixes pushed with only their unit tests left the PR's build red for three pushes, unseen
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §5 "Between fix rounds" (the type check, `npx tsc -b`, which writes no `dist`, beside the touched tests before each push — the Opus reader's O6); the handoff half is already in session-handoff Step 1 ("a gate that is red" is Unfinished)
**Date:** 2026-10-29
**Session context:** M5b's FULL check, picking up a handoff mid-walk (fixes F1, F3–F6 already pushed)
**Skill:** bug-check-order §5 "Between fix rounds" / shipping §The checks — project guides, not skill files
**Type:** internal
**Phase/Area:** fixing walk findings, pushing, the handoff

**Issue:** A fix's new test typed a byte array in a way the project's type check (run only by the build) refuses; the fix ran its touched unit tests (which do not type-check), was pushed, and GitHub's whole run went red — build, every browser set — on three pushes in a row. The handoff block said nothing of it; the next chat found it only by reading the run list.

**Suggested improvement:** In the order's "Between fix rounds" and in shipping's touched-tests rule: a fix round runs `npm run build` (the type check) beside its touched tests before the push; and the session-handoff block's checklist reads the branch's last run conclusion and writes it.

**Principle:** A test runner that does not type-check cannot stand in for the build; a handoff states the last check run's result, not only what was meant to run.

### Observation 744: A walker's unpictured note became a finding that did not reproduce
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §7 (a note without a picture, or a fault seen in passing, is a lead: reproduced and read against the rulings before it is a finding; "to check", never "to file") — one change with 899
**Date:** 2026-10-29
**Session context:** M5b's FULL check, finding F8
**Skill:** walk-scripts (walker briefs) / bug-check-order §7 — project guides
**Type:** internal
**Phase/Area:** recording walk findings

**Issue:** The W1 walker hard-coded a note into its script ("a qualification nobody holds adds no group row … picture w1-02-odd-dead-chip") — the picture was never taken. It was recorded as finding F8. Reproduced on the same build it did not happen; a press-and-lift step on the old build showed it was F7's slide (the chips moving under the finger), seen once by hand and misread.

**Suggested improvement:** In walk-scripts' walker brief: a finding is recorded only with its picture and the step that produced it; a note written into a script's text is not evidence. The host reproduces a finding before it is written into the sheet (the order already says so — enforce it at the sheet: no picture name, no finding).

**Principle:** An observation with no captured evidence is a lead to reproduce, not a finding.

### Observation 745: A walk script that reloads must not open the app in its no-save mode
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): TOOLS addition (h) in _docs/OUTSTANDING-items.md (refuse fresh=1 with savefail, and a reload on fresh=1 — met twice); WS §3 fixture line widened to scripts that reload or use ?savefail
**Date:** 2026-10-29
**Session context:** D1510 (Quals Management, admin only) — the walk script `quals-mgmt-walk.mjs`
**Skill:** brainstorming (its walk-script companion, `raptor-port/docs/walk-scripts.md`)
**Type:** internal
**Phase/Area:** walk scripts — the start page

**Issue:** The walk copied an older script's `goto('/?fresh=1')`. That start keeps everything in memory only, so every
`reload()` in the walk began from the demo world again: an admin's tick "did not survive a reload" — six FAILs that were
the script's, not the app's. A walk that checks a save across a reload proves nothing from that start, and one that
passes a "kept after reload" step from it passes by accident when the value happened to be the seed's.

**Suggested improvement:** In walk-scripts.md's list of traps: a script that reloads, or checks anything is kept, opens
`/` in a fresh browser context (which holds no storage, so the first load is still the demo world) — never `?fresh=1`.

**Principle:** A test fixture's "clean start" switch can also switch off the very behaviour under test; check what a
reset mode disables before reusing it.

Met again 8 Nov 26 (`claude/rd-shell-state`, `scripts/handpass/rss1108-same.mjs`): the "Not saved" band's test switch
`?savefail` (D1666) works only on the browser's store, so under `?fresh=1` the band never showed and the comparison pictured
two identical screens with no band. Guard proposed: `scripts/drawcheck/lib.mjs` (or the walk's start helper) refuses a
start address carrying both `fresh=1` and `savefail`, so the trap stops the script rather than passing in silence.

### Observation 746: A walk that checks a font-dependent measurement must reopen the surface after changing the letters
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §10 "Name the parts" (a child coloured in the drawing named for colour, the column for place); its letters-at-open half is already BCO §7.2 "force them from the first paint … a style added after the page loads misses what the app measures as it loads"
**Date:** 29 Oct 26
**Session context:** Building the Leave War's Events list split (D1512–D1516); the walk checked its columns in letters a seventh wider (his iPhone's).
**Skill:** brainstorming (its guide `mockups-on-the-real-app.md`) and the walk-script guide (`raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** the walk script's "wider letters" fit check

**Issue:** The list measures its column widths in its own letters once, when it opens. The walk swapped in a wider typeface on the open list and measured: the kind column looked misaligned (a false failure), because the widths were still the ones measured in the narrower letters. Reopening the list after the swap measured correctly. Separately, the drawing check's colour comparison read the wrong element because the drawing coloured its words in a child element (a bold span) where the build colours the column itself.

**Suggested improvement:** In walk-scripts.md's fit-check trap list: when a surface measures text at open (canvas or layout), apply the wider letters BEFORE opening it, or close and reopen it after. In the mock-up guide: where a drawing styles words through a child element, a drawing-check part names that child for the colour and the column for the place.

**Principle:** A check that changes an input the code reads only once (at mount) must re-run that read, or it tests the stale value, not the code.

### Observation 747: A handoff's "next" named a merge the plan does not have
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: a next step naming a numbered piece of a plan is checked against the plan and its ruling's full row
**Date:** 29 Oct 26
**Session context:** the closing records after the Leave War's M5b went live
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** writing "Pick up here" / "Next" in the outgoing block

**Issue:** The outgoing block, and the backlog line it copied, said "next by D1250's order: the overhaul's M6". The approved plan had five merges, later split to six (M5a, M5b), and its ruling's full row said M5b was the last. The next chat would have opened a fresh chat for a job that does not exist; it was caught only by reading the plan and the ruling's full row before answering "what is next".

**Suggested improvement:** In the handoff skill's "Pick up here" step: when the next step names a numbered piece of a plan (a merge, a phase, a batch), open the plan and its ruling and confirm that piece exists and is not the last already done; say "the plan is finished" when it is.

**Principle:** A "next step" written from the series' pattern (M1…M5, so M6) is a guess; check it against the plan that defines the series before handing it on.

### Observation 748: A "notes-only" job that edits a check script is not notes-only
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: how a job ships is decided by its files against shipping's "only notes" list
**Date:** 29 Oct 26
**Session context:** raising two rulings files' size tripwires after M5b
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** naming how the next job ships

**Issue:** The block called the tripwire job "a notes-only pull request (D1407 — merges by itself once green)". The tripwires live in `raptor-port/scripts/docsize.mjs`, which D1407's list of notes does not include, so the pull request waits for his "merge live". Read as written, the next chat might have merged a script change without his word.

**Suggested improvement:** Where a handoff says how a job ships, name the files it will change and check them against shipping.md's notes-only list; a size-tripwire raise is always a script change.

**Principle:** Whether a change may merge by itself is decided by the files it touches, not by what kind of job it is called.

### Observation 749: A search for words a ruling changes must also read the tests' patterns
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §6 wording row (each old word alone, case ignored, no assertion shape around it, every test folder)
**Date:** 2026-10-30
**Session context:** building D1525 (a half day written "LL (AM)" in place of "LL (morning)") on `claude/lw-small-fixes-1030`
**Skill:** New skill candidate: wording-change sweep (or the bug-check order's roll-call)
**Type:** open-source
**Phase/Area:** finding every test that pins the old words before the change is pushed

**Issue:** The unit and browser tests were searched for the old words as literal strings ("(morning)", "Morning ·"); two browser tests escaped — one held the words inside a regular expression (`\((morning|afternoon)\)`), one in an array of expected lines a grep for `toBe(` lines missed. GitHub's full run caught both after the push, costing a red run and a second push.

**Suggested improvement:** When a ruling changes words the app prints, search every test folder (unit and browser) for each old word ALONE, case-insensitive, with no assertion pattern around it, and read each hit; add the browser folder's hits to the red-first run before the first push.

**Principle:** A test can pin text in many shapes — a literal, a pattern, a list — so the search for changed words looks for the bare word, not for one shape of assertion.

### Observation 750: A before picture must prove it is of the old build
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §8 "The build before the change": prove which build supplies the "before" — the served bundle checked against the base commit; a check of the intended change fails on the base, a check of what must not change passes on both and identifies nothing (Astra's A7)
**Date:** 2026-10-30
**Session context:** showing him two built changes before and after, on `claude/lw-scroll-pinned-sweep`, with the after pictures taken on their own branches
**Skill:** brainstorming/mockups-on-the-real-app.md (or the bug-check order's evidence sheet)
**Type:** open-source
**Phase/Area:** taking "before" pictures to put beside a change's "after"

**Issue:** The checkout's built bundle was served for the before pictures, but the same checkout had earlier been switched to the change's branch and built there, so the served bundle already carried the change: the before walk passed every check of the new words. It was caught only because the walk's own checks passed where they should have failed; the bundle was rebuilt from the branch without the change and the walk then failed as a before should.

**Suggested improvement:** Before taking before pictures, rebuild from the base (or confirm the built bundle's source), and treat the change's own checks FAILING on that build as the proof it is the old one; a before walk whose checks pass is not a before.

**Principle:** A comparison picture is only evidence once the build it shows is proven — run the change's checks on it and expect them to fail.


### Observation 751: The background-command guard refuses a full path written the Git Bash way
**Status:** DECLINED (2026-11-10) — closed on his word in the skill review of 10 Nov 26: recommend closing: the background-command guard, tested tonight, lets the `/c/…` spelling through (unchanged since 26 Sep 26), so the refusal cannot be reproduced; question in `_review/questions.md`
**Date:** 2026-10-31
**Session context:** [WEEK-DRAG-EDGE-PAN] — installing packages in a fresh worktree in the background before taking pictures
**Skill:** New skill candidate: none — the project's background-command guard (`.claude/hooks/bg-cwd-guard.mjs`, D162)
**Type:** internal
**Phase/Area:** a backgrounded npm command in a worktree

**Issue:** `cd /c/Users/User/projects/Raptor/.claude/worktrees/<wt>/raptor-port && npm ci` run in the background was refused as if it did not move into raptor-port; the same command with `cd "C:/Users/User/…/raptor-port"` passed. The refusal's advice ("move in by its FULL path") was already followed — only the spelling differed. Cost one round trip.

**Suggested improvement:** the guard reads `/c/…` (Git Bash's form) as the same path as `C:/…` and `C:\…`; until then, the line in `raptor-port/CLAUDE.md` §Build & verify and the guard's message say "written `C:/…`".

**Principle:** A guard that checks a path must accept every spelling the shell it guards accepts, or its refusal sends the agent to do what it already did.

### Observation 752: A walk script's "cancel" assumed Escape puts a dragged man back — it does not
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §4 new line "A clean-up step is a claim too" (a cancel is asserted, or ends on a no-op move)
**Date:** 2026-10-31
**Session context:** [WEEK-DRAG-EDGE-PAN] walk (D1529), Edit Schedule, a mouse drag held at the week's side
**Skill:** New skill candidate: none — the walk-script guide (`raptor-port/docs/walk-scripts.md`)
**Type:** internal
**Phase/Area:** a walk step's clean-up between scenarios

**Issue:** the walk ended each held drag with "Escape, then let go", copied from the arrows' walk. Nothing in the drag code listens for Escape, so each "cancel" dropped the man wherever the mouse was; later pictures showed Thursday's "3 changes" from the walk's own drops. The measurements were taken before the release, so no result was wrong — but a later step could have measured a day the walk itself had changed.

**Suggested improvement:** `docs/walk-scripts.md` gains a line: a step that cancels a gesture checks the cancel worked (the store unchanged, or the changes count unchanged) — or ends the gesture by a move that is a no-op by construction (back onto the man's own seat) — never assumes a key does it.

**Principle:** A clean-up step in a test script is itself a claim about the app; verify it like any other, or choose one that cannot change the state.

### Observation 753: A unit test of a frame-loop gesture sent two moves inside one frame
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` RED, the "flash or a jump" paragraph: a frame-sampled loop gets at least one frame per in-between position
**Date:** 2026-10-31
**Session context:** [WEEK-DRAG-EDGE-PAN], `src/ui/weekdragstep.test.tsx` with fake timers and fake frames
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the red test for behaviour driven by a requestAnimationFrame loop

**Issue:** the test moved the pointer out of an edge band and straight back in with no time between; the loop never saw the pointer outside, so the "left the band" state never happened and the test failed against correct code. One trace found it.

**Suggested improvement:** in the test-writing guidance: when the code under test samples state once a frame, every intermediate position the test means to exist gets at least one frame (advance the fake clock between events).

**Principle:** A test drives the code at the code's own sampling rate; an event the sampler never sees did not happen.

### Observation 754: The app switches Auto-fix on for every new pull request, not once a session
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 2, helper bullet: Auto-fix switched off right after each pull request opens; a relayed Vercel status comment needs no reply
**Date:** 31 Oct 26
**Session context:** the overnight run of 31 Oct 26 (four pull requests, 596–599)
**Skill:** overnight
**Type:** internal
**Phase/Area:** Part 2, pull requests

**Issue:** each `gh pr create` was followed by the app switching "Auto-fix pull requests" on for that pull request; it had to be switched off four times (D1090), and one Vercel status comment arrived as a "review comment" event before the switch-off landed.

**Suggested improvement:** the overnight guide's pull-request line: right after opening any pull request, read the app's monitor state and switch Auto-fix off for that pull request, every time; a Vercel bot status comment relayed as a review comment needs no reply.

**Principle:** A standing setting that a tool re-applies per object is enforced per object, at the moment the object is made.

Met again 7 Nov 26: the rules diet's step 3, pull request 658 — the app switched Auto-fix on as the pull request opened; switched off at once (D1090).

### Observation 755: Walk checks that only read for what must not be drawn pass a blank screen
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §4 "A negative assertion first asserts that its subject exists" sharpened (a clip, pin or hide check reads both sides; a pinch asserts its zoom changed)
**Date:** 31 Oct 26
**Session context:** job 4 of the overnight run (the pinch fixes, pull request 599)
**Skill:** bug-check order (§7.11) / walk scripts
**Type:** open-source
**Phase/Area:** the walk's automated checks

**Issue:** twice in one job a scripted check passed a fault the picture showed: first "names never drawn over the corner" passed a names column that was blank mid-pinch; then "no frozen row off its columns" passed a frozen date row that was missing altogether. Both checks asked only that nothing wrong was drawn, never that the right thing was drawn. The host's look at the deciding pictures (D1271) caught both.

**Suggested improvement:** in the walk-script guidance: every check of a clip, a pin or a hide reads both sides — what must not show AND what must show — and a pinch step asserts its own zoom changed.

**Principle:** A check that only forbids can be satisfied by nothing; pair every "must not" with a "must".

### Observation 756: A before-build from `git archive` needs the scripts folder too
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §8 "The build before the change" (archive the whole app folder but docs/, since the type check compiles tests that import scripts/, e2e/, probes/) — one change with 835
**Date:** 2026-10-31
**Session context:** [REACT-DOCTOR-CLEANUP] — building main's code in a scratch folder as the "before" side of a nothing-on-screen-changes comparison.
**Skill:** walk-scripts guidance (raptor-port/docs/walk-scripts.md §8, "The build before the change")
**Type:** internal
**Phase/Area:** §8, archiving the old build

**Issue:** the guide says to archive "the source and the config" and leave the bulky folders out. An archive of src, public, the configs, reference and sample-data failed to build: the type check compiles test files that import `scripts/gatelock.mjs`. Adding `scripts/`, `e2e/`, `probes/` and `playwright.config.ts` fixed it (the picture folders still left out — they are what make a whole `raptor-port` archive take minutes).

**Suggested improvement:** §8 names the folders the type check needs: everything under `raptor-port/` except `docs/` (and `node_modules`, joined by a junction).

**Principle:** A recipe that says "the source" should name the folders, because the build's own definition of source is wider than the app's.

### Observation 757: A linter's "changed only" mode can pass silently when it cannot see the base
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): GD §Now, the code check's "Trap — the silent pass" (the script goes red unless React Doctor's own report says it compared)
**Date:** 2026-10-31
**Session context:** [CODE-CHECK-CI] — React Doctor's "no new finding" check as a GitHub check and a Stop hook (D1539)
**Skill:** New skill candidate: wiring a third-party check into CI / hooks (or the bug-check order's tooling walk)
**Type:** open-source
**Phase/Area:** wiring a tool's diff/baseline mode into a gate

**Issue:** React Doctor 0.9.18's `--scope changed` compares each changed file with the base. Read in its source: when the base cannot be resolved (a shallow CI checkout with no merge base, a base side that fails to read) it falls back to listing every finding AND marks the run "gate exempt", so it exits 0 whatever the change holds. A CI job built the obvious way (shallow checkout, run the command, trust the exit code) would have been green forever. Found only by reading the tool's code before wiring it.

**Suggested improvement:** before a tool's exit code becomes a gate, read (or test) what it does when its comparison cannot be made; gate on its machine-readable report's own "comparison made" field, and prove the gate red on a planted fault in the real CI copy (shallow, sparse) — not only on the full local checkout.

**Principle:** A gate is only as good as its failure mode: find out what the tool does when it cannot do its job, and make that case red.

### Observation 758: Parallel helpers that each type a shared record give it different shapes, which clash only at the merge
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/dispatching-parallel-agents/SKILL.md` When Agents Share the Working Tree: shared vocabulary decided before the fan-out; the junction command in `raptor-port/docs/gates-and-deploy.md` (four traps)
**Date:** 2026-10-31
**Session context:** the Leave War's strict-checking and React Doctor clean-up, fanned out to four Opus helpers, each in its own worktree on a disjoint set of files.
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** the brief for parallel helpers working on one codebase

**Issue:** Each helper was told to replace loose types with real ones in its own files. Two of them met the same untyped record (a leave input) from opposite sides: one introduced a wider "as the war reads it" shape at the shared edge, the other typed its windows with the narrower schema shape. Each helper's own type check was green; the clash surfaced only after both branches were merged — six type errors across five files, settled by hand by the host. A second, smaller clash came from two helpers each re-routing the same moved helper function. Also, the brief's suggested junction command (`cmd //c mklink //J`) was refused in two helpers' shells; they fell back to PowerShell `New-Item -ItemType Junction`.

**Suggested improvement:** In the parallel-dispatch brief, when helpers will add types at boundaries they share, name the ONE canonical type for each shared record up front (or have one helper own the shared edge and finish first); and name which helper owns any helper function another may move. Give the PowerShell junction command as the default.

**Principle:** Partitioning parallel work by file is not enough when the work introduces shared vocabulary (types, moved helpers): decide the shared vocabulary before the fan-out, or the merge becomes the integration step.

### Observation 759: A handoff's "tests green" that named no run hid six red tests
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4: the template's Gates line names the run and its count, never a bare green; a removal runs its area's whole suite before green
**Date:** 2026-10-31
**Session context:** continuing `claude/leave-war-fixes-react-doctor-d90ac5` from its HANDOFF block (build D1542–D1544, then the bug check)
**Skill:** session-handoff (the block's "Built and committed (tests green on his PC)" line)
**Type:** open-source
**Phase/Area:** writing the handoff block — what was checked and how

**Issue:** The block said the branch's first three steps were "tests green on his PC". The whole Leave War suite, run on the untouched branch before any new change, had six red tests in four files — every one an old test still asserting a mark the branch had removed on purpose ([LW-LOCKMARK]) or a rule a ruling had replaced (D1541). The earlier chat had run only the files it touched. The next chat found it only because its own full run failed, and had to prove which reds were its own by running the four files on the untouched branch in a second checkout.

**Suggested improvement:** In the session-handoff skill's block template, the "checked" line names the exact run and its count ("Leave War project, 227 files / 4,037 tests, green" or "only the touched files: a, b, c"), never a bare "tests green"; and a step that REMOVES a field, a mark or a rule runs the whole suite of its area (or names a search for the removed name across the tests) before the block may say green.

**Principle:** A verification claim carries its scope. "Green" without the run that made it is read as the whole suite, and a removal breaks tests far from the files it touched.

### Observation 760: `gatelock.mjs exec` mangles a compound command passed as one string
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md` (the push guard's `exec` line): one quoted string goes to Windows' shell, several commands go in a script; refusal filed as [CHECK-TOOLS-HARDEN] (i)
**Date:** 2026-10-31
**Session context:** the same branch — running the Leave War suite and the build under the PC's check lock
**Skill:** shipping rule, the checks (`.claude/rules/shipping.md`) and `raptor-port/scripts/gatelock.mjs`
**Type:** internal
**Phase/Area:** taking the lock for a run of more than one command

**Issue:** `gatelock.mjs exec "<who>" -- "cmd1 > f1; echo X >> f1; cmd2 > f2"` (a quoted compound with redirections) ran something else: the first file was never written, the second held a two-file vitest run, and the lock reported a clean exit. Writing the commands into a small script and passing `-- bash <script>` worked first time.

**Suggested improvement:** shipping.md's lock paragraph (and gatelock.mjs's usage text): for more than one command, write them to a script and pass `-- bash <script>`; or make `exec` refuse an argument holding `;`, `>` or `&&` with that advice.

**Principle:** A wrapper that re-parses a shell string should refuse what it cannot run faithfully rather than run part of it and report success.

### Observation 761: A "today" picture taken from a test fixture can silently show nothing staged
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 1 (each staged record asserted on screen; "today" pictured for every role the change touches)
**Date:** 2026-10-31
**Session context:** [LW-HELD-DAY-ADD] — drawing the Leave War's bid window on a day held by an entry filed on the Inputs page
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 1 (driving the build to the state) and the Traps list

**Issue:** The drawing staged its entries through the app's test bridge. One entry was filed under the war's short code ("OTH") instead of the Inputs page's own type name ("Other"), so it never reached the grid; the "today" picture showed an ordinary empty day's window and the script reported success. Only reading the picture showed the cell was empty. A second surprise the same run: the member's "today" was a window the ruling had not mentioned (his own remarks window), which changed the proposal.

**Suggested improvement:** In The Method, step 1: after staging, assert each staged record is ON SCREEN in the today state (the cell holds its box, the window names it) before any proposal is drawn, and draw "today" for every role the change touches before designing the proposed state, since a role may already have a window of its own there.

**Principle:** A fixture is staged only when the screen shows it; check the today picture's premise as strictly as the proposal's, and look at today for each role before deciding what changes.


### Observation 762: The overnight guide's "wait inside the turn" meets helpers that launch in the background
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 2, helper bullet: how the coordinator waits on a background helper (turn ended, keep-awake on, silent re-armed timer, no polling); Auto-fix as 754
**Date:** 2026-11-01
**Session context:** The night of 1–2 Nov 26 (Leave War batch + start-load trim), run from the owner's phone.
**Skill:** overnight
**Type:** internal
**Phase/Area:** Part 1 step 9 and Part 2 ("wait on a long run INSIDE the turn … never by ending the turn"); D1416 (each job to one fresh helper inside the night's chat)

**Issue:** D1416 sends each job to a helper inside the night's chat, but the Agent tool here launches helpers in the background and returns at once, so the night's chat cannot wait for one in a foreground call; ending the turn is the only way to wait. The chat bridged the gap with a 30-minute silent Monitor timer re-armed on each expiry, plus the keep-awake hold (`until: session_idle`). It worked (the helper ran ~1 h 50 min and reported back), but the guide does not say so, and the job-1 helper's pull request also came up with the app's Auto-fix switched ON by itself (D1090 — switched off at once).

**Suggested improvement:** In step 9 / Part 2, say how to wait on a background helper: keep-awake `session_idle`, then a silent re-armed Monitor timer as the heartbeat (no polling of the helper's transcript); and after any helper opens a pull request, check Auto-fix (`ccd_pr get_status`) and switch it off (D1090).

**Principle:** A rule about how to wait must name the waiting mechanism the tools actually offer; when a delegated step opens a pull request, the coordinator re-applies the project's PR switches itself.

### Observation 763: A mark drawn in a copied part was walked only at rest
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §6 new row "A part the app draws in more than one COPY" (listed copy by copy from the running page; a moving value walked in each, judged on what is on top); CL step 8 names it
**Date:** 2026-11-02
**Session context:** building the Leave War grid's corner year (D1561) — a value repainted on scroll into a header that the app draws in three copies (the grid, a pinned bar's sliding row, its frozen corner)
**Skill:** New skill candidate: none — the project's bug-check order (`raptor-port/docs/bug-check-order.md` §7.11) and the walk-scripts guide
**Type:** open-source
**Phase/Area:** the walk's sizing step; the roll-call of copies

**Issue:** The walk checked the pinned header "scrolled down, still reads 2027" — the copy on top at rest — and crossed the New Year only with the page at its top. The fresh code read found the pinned bar's frozen corner was a third copy never repainted, so crossing 1 January while scrolled down left the old year. The roll-call listed "the mirror" as one place, not its two parts.

**Suggested improvement:** In the roll-call, list every COPY a part is drawn in (find them on the running page by the element's own class, not from the component), and walk the moving reading (a scroll, a turn of the year) in each copy, with the assertion made on what is drawn on top (`elementFromPoint`), not on the first match.

**Principle:** A value that changes as the view moves must be walked moving in every copy of the part that shows it; a check at rest proves only the copy that happened to be painted last.

### Observation 764: Python run from a Bash heredoc mangles non-ASCII and escapes on Windows
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): memory note node-e-in-git-bash-mangles-escapes ("unconditionally: every edit script is written with the Write tool", 19 Oct 26) and the script guard's refusal 1 for the backslash case
**Date:** 2026-11-02
**Session context:** editing CSS and TSX through short Python scripts
**Skill:** New skill candidate: none — the project's memory notes on shell edits (`node-e-in-git-bash`, `bash-heredoc-apostrophes`)
**Type:** open-source
**Phase/Area:** editing files by script

**Issue:** A heredoc-fed Python edit turned the CSS escape `'\25BE'` into a control character plus "BE", and a replace of a line holding "›" failed its assertion (the heredoc's stdin decoded in the console's code page). Scripts written to a file with the Write tool and run from there had neither problem.

**Suggested improvement:** Make it unconditional: an edit script is always written to a file and run (never a heredoc), whatever it contains — extend the existing memory note to Python and to non-ASCII text, not only apostrophes and `node -e`.

**Principle:** A rule with a condition ("unless it holds an apostrophe") fails on the next unforeseen character; where the safe route costs nothing extra, make it the only route.

### Observation 765: A member's walk step needs the days open for him first
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §7 (c) sharpened with the recipe: open his month by the admin's "Open for bidding" window, then the name badge (walkM)
**Date:** 2 Nov 26
**Session context:** walking [LW-INPUT-RANGE-WHOLE] (the Leave War's bid window opening an Inputs entry whole)
**Skill:** internal — `raptor-port/docs/walk-scripts.md`
**Type:** internal
**Phase/Area:** writing a walk script's member steps on the Leave War

**Issue:** The walk's member steps tapped the member's own day and expected the bid window; in the demo nothing is open for bidding, so a member's tap shows the closed note (D1177) — two FAILs that were the script's premise, not the app. The fix: open the month through the admin's own "Open for bidding" window, then the name badge's switch to the member view (D292).

**Suggested improvement:** walk-scripts.md: a Leave War step that needs a member's bid window first opens the dates through the app's own window (open-chip → od-month-<m> → open-dates-close), then switches with #roleBadge — the recipe in `scripts/handpass/lw-input-range-walk.mjs` walkM.

**Principle:** A walk step's premise is checked against the state the demo really starts in, before its FAIL is read as the app's.

### Observation 766: Git Bash `sed -i` on a CRLF file rewrites every line ending
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): `.claude/hooks/script-guard.mjs` refusal 2: `sed -i` on a file git tracks is refused (M5 measured the line-ending rewrite)
**Date:** 2 Nov 26
**Session context:** a one-word comment fix in `src/leavewar/state/store.ts`
**Skill:** internal — the memory note on edit scripts (Python newline='')
**Type:** internal
**Phase/Area:** editing files on Windows

**Issue:** `sed -i 's/…/…/'` on a CRLF file left it LF throughout: git showed 12,576 lines changed for one word. Restored from HEAD and the change re-made with Python `newline=''`.

**Suggested improvement:** extend the memory note: on Windows never `sed -i` a tracked file — an edit script (Python, newline='') written to a file; and check `git diff --stat` after any shell edit.

**Principle:** The safe default for any in-place edit on Windows is the one tool known to keep line endings; a quick tool that silently rewrites them costs more than it saves.

### Observation 767: The inputs guard reads comments — a capitalised INPUTS trips it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (p), added: the inputs guard chooses its file list through its own comment-stripping `code()`; the TDD guide's "tests that scan source text (they read comments too)" already warns
**Date:** 2 Nov 26
**Session context:** GitHub's run of pull request 612
**Skill:** internal — `src/engine/inputs-readers.test.ts`
**Type:** internal
**Phase/Area:** comments in app code

**Issue:** The guard decides which files "reach the inputs" by searching their raw text (comments included) for `INPUTS`; a comment heading "FILED ON THE INPUTS PAGE" put store.ts in that set and turned the unit run red.

**Suggested improvement:** either strip comments in the guard's NAMES test as its other tests already do (`code()`), or a line in the coding conventions: never write the word INPUTS in capitals in a comment.

**Principle:** A source-scanning guard that strips comments in some checks and not others will trip on prose; make it consistent.

### Observation 768: A walk script's "holds Tab" expectation applied to a window that, by ruling, never holds the keyboard
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §4 "Before a brief leaves", the EXPECTED-line bullet (an expectation that differs by surface is read from its own roll-call column) — one change with 897
**Date:** 2 Nov 26
**Session context:** the WALK of [LW-VIEWER-TAB] (the document viewer over Leave War windows), a side session continuing a handed-off task
**Skill:** New skill candidate: walk-script authoring (docs/walk-scripts.md)
**Type:** open-source
**Phase/Area:** writing a walk's expected lines from a roll-call

**Issue:** The walk asked every window the viewer opens over to "hold Tab again" once the viewer closed. One of them (the person window) is a non-blocking window that by an owner ruling never holds the keyboard, so the first run reported a FAIL that was the script's own premise. The roll-call had a "holds Tab?" column only after the failure, not before.

**Suggested improvement:** When a walk's expected line rides on a property that varies by surface (blocking or not, a role, a size), the roll-call gets that property as its own column BEFORE the script is written, and each expected line reads it from the column.

**Principle:** An expectation that differs per surface belongs in the roll-call as a column, decided per row before the script runs; a uniform expectation across mixed surfaces manufactures false failures.

### Observation 769: Handing a task to a new session while its branch is still checked out in the old worktree
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, release bullet: when this chat stays open, the new chat works the branch from its own (fast-forward, upstream set, explicit push)
**Date:** 2 Nov 26
**Session context:** a forked side session continuing [LW-VIEWER-TAB] from another worktree
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** picking up a handed-off branch in a fresh worktree

**Issue:** The new worktree could not check out the task's branch because the original session's worktree still held it. Fast-forwarding the new worktree's own branch to the commit, renaming it, and setting its upstream to the remote branch worked (pushes then land on the right remote branch), but nothing in the hand-off said to do it.

**Suggested improvement:** The hand-off's remaining plan, when the outgoing session cannot release its branch first, names the recipe: fast-forward the new worktree's branch to the task's commit and set its upstream to `origin/<task-branch>` (checking `branch.<b>.merge` is not `main`).

**Principle:** A hand-off between two checkouts of one repository either releases the branch first or tells the receiver how to work on it from a second checkout.

### Observation 770: A shaky test chased by a guess that a small repeat count seemed to confirm
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/systematic-debugging/SKILL.md` Phase 3 step 3: how many passes an intermittent failure needs (8 at one in five proves little; 21 for 99%), and recording what the failing step did
**Date:** 2 Nov 26
**Session context:** the test-reliability batch — [INPCAL-HOLD-FLAKE], a browser test failing about one run in five
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** forming and testing a hypothesis for an intermittent failure

**Issue:** The test passed 8 of 8 on the current code and failed 1 of 8 with a recent change taken out, so a plausible story (the browser's double-tap wait, removed by that change) looked proven. A run of 40 on the current code then failed 8 times: the story was wrong. Recording every press's real target in the failing step found the cause at once (the press landed on the neighbouring date, because the test measured positions while an animation was still running).

**Suggested improvement:** In the phase that tests a hypothesis, add: for a failure of rate p, a pass count proves nothing until it is large enough that the old failure rate would almost surely have shown (at one in five, 8 clean runs happen about one time in six); before believing a story, instrument the failing step to record what actually happened (the event's target, the element's position at each moment) rather than reasoning from the code.

**Principle:** An intermittent failure is diagnosed by recording what the failing step actually did, and a fix is believed only after a run long enough that the old rate could not hide in it.

### Observation 771: A walk script's step filter emptied the whole run's picture folder
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 "One run, one folder" (only an unfiltered run empties the folder; a filtered run writes its own sub-folder) — one change with 896
**Date:** 2026-11-02
**Session context:** the schedule leftovers' WALK (pull request 620) — a filtered re-run of one step group (`ONLY=S`) after fixing a script step
**Skill:** project doc `raptor-port/docs/walk-scripts.md` (§5 "One run, one folder", §6 the re-walk's step filter)
**Type:** open-source
**Phase/Area:** walk scripts — folders and step filters

**Issue:** The new walk script emptied its picture folder at start (as §5 asks of a numbering script) and also took a step filter (as §6 asks). Run with the filter to fix one step, it wiped the desktop and phone pictures of the full run before it, and the whole walk had to be run again to have one folder of evidence.

**Suggested improvement:** In §5/§6 add: a script that empties its folder empties it only on an unfiltered run; a filtered run writes to its own sub-folder (`<folder>/only-<filter>`), or refuses to clear.

**Principle:** A cleanup step that is right for a full run destroys evidence when the same script is run in part; tie destructive setup to the run's scope, not to the script.


### Observation 772: An iPhone screen recording read frame by frame with no video tool installed
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/walk-scripts.md` §5 Pictures: reading his phone recordings frame by frame (Edge channel, file page, seek, element picture, contact sheets)
**Date:** 2026-11-03
**Session context:** the night of 3 Nov 26 — the owner sent an iPhone .mp4 of a swipe fault; the PC has no ffmpeg or OpenCV.
**Skill:** overnight (and any bug-diagnosis from a recording) — New skill candidate: a short "read a recording" note in the walk-scripts guide
**Type:** open-source
**Phase/Area:** diagnosing a fault the owner recorded

**Issue:** The fault (a transition "abrupt", swipes that "sometimes don't" work) only showed in motion; a still was useless and no
video tool was installed. What worked: Playwright with `channel: 'msedge'` (Edge decodes the iPhone's H.264/HEVC, the bundled
Chromium does not), a local HTML page holding `<video src>` opened by `page.goto('file:///…')` (a `setContent` page cannot load
a file: URL), seek by `currentTime` and wait for `seeked`, then an element screenshot of the video (a canvas `toDataURL` is
refused — the canvas is tainted by the file: origin). Frames every 0.25 s, laid out 8 to a sheet, read the whole 7.7 s clip in
four images; the builder later found two frames that showed the slide's end, which settled whether the animation ran at all.

**Suggested improvement:** a few lines in `raptor-port/docs/walk-scripts.md` (or the debugging guide) on reading his recordings:
Edge channel, file page, seek + element screenshot, contact sheets; frames saved with the evidence.

**Principle:** When a fault lives in motion, read the recording frame by frame before theorising; a browser that can decode the
format is a sufficient video tool, and a contact sheet of evenly spaced frames shows the whole gesture at a glance.

### Observation 773: A question about how something FEELS (motion) gets a swipeable page of real pictures, not a picture
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging new bullet "A question about FEEL" (a page he operates on his phone, real captures, the app's scroll rules, a switch per choice) — one change with 786
**Date:** 3 Nov 26
**Session context:** [WEEK-CROSS-END-CARDS] — he asked for a mock-up "to test the feel first before building" a change to how the phone crosses between weeks.
**Skill:** brainstorming (`mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** Judging the Proposal / Showing It

**Issue:** The guide covers pictures and working markup for layout questions, but not a question about motion or touch feel. A still picture (the earlier strips picture) could not answer it. What worked: real element screenshots of every card at the phone's size and density, laid in a strip that copies the app's own scroll rules (padding, gap, snap), with the proposed behaviour scripted on top and a switch per open choice, published as a page he opens on his own phone. Drawing it surfaced four requirements nobody had written (the preview card far plainer than the live one, so the card jumps at the load; a desktop-only label; a desktop-only veil; the last card never scrolling fully in). Two harness traps on the way: a file without the viewport line lays out 980 wide (already in the guide), and a CDP finger in headless Chromium never ends a native scroll (written to walk-scripts.md §4).

**Suggested improvement:** In `mockups-on-the-real-app.md` §Judging the Proposal, add: "A question about feel — a swipe, a scroll, an animation — is answered by a page the owner operates on his own device: real pictures of each part at the device's size, the container built to the app's own measured scroll rules, the proposed behaviour scripted, a switch per open choice; checked by a real finger in a visible browser before it is sent."

**Principle:** When the question is how an interaction feels, the mock-up must be operable on the target device; build it from real captures inside a container that reproduces the real scroll physics, so what is judged is the behaviour, not a drawing of it.

### Observation 774: The handoff's "Next, in order" section had become history, so a fresh chat read the order from the backlog
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, the Next-in-order bullet: its first line read before the commit, a merged RIGHT NOW line archived and replaced by a pointer to the backlog
**Date:** 3 Nov 26
**Session context:** a fresh chat told to "start the next job from ## Next, in order" — HANDOFF.md's section opened with "RIGHT NOW" lines dated 13–21 Oct 26, every step done; the live order was the backlog's priority list (his D994: small fixes by area).
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** Writing the handoff — the project-order section

**Issue:** Each handoff rewrites only its own `## Now` block; nobody rewrites the shared "Next, in order" section, so its "RIGHT NOW" lines pile up and go stale while the owner's opening line still points a new chat at it. The chat had to notice the dates, discard the section and find the real order in OUTSTANDING.md's priority list. A less careful chat would start a long-finished job or ask him a settled question.

**Suggested improvement:** In the session-handoff skill, add a step: before committing, read the top of "Next, in order"; if its first "RIGHT NOW" line names work that is merged, replace the stale lines with one line pointing at the backlog's priority list ("His order, as it stands"), moving the old lines whole to the archive. Or retire the section's "RIGHT NOW" lines for good, since the backlog already carries the order.

**Principle:** A shared section that no writer owns goes stale; give it an owner at the moment every chat already touches the file, or point it at the one place that is kept current.

### Observation 775: A backlog of small "seen" finds goes stale as later batches fix them — re-walk before planning
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/writing-plans/SKILL.md` Self-Review 8: findings filed more than a week or two ago re-checked on today's build first
**Date:** 3 Nov 26
**Session context:** planning the next Inputs small-fixes batch from [TITLE-CHECK-SEEN], [ALLAVAIL-CHECK-SEEN] and [CAL-CHECK-SEEN], filed 8–10 Oct 26.
**Skill:** New skill candidate: batch-planning (or the bug-check order's sizing step)
**Type:** internal
**Phase/Area:** Planning a small-fixes batch from old filed finds

**Issue:** Of 31 open finds, 15 were already gone — fixed in passing by later batches whose code comments even cite the item, but nobody updated the item. A batch planned from the text alone would have built fixes for faults that no longer exist, or asked him settled questions. Two Sonnet walkers re-checking every find on the built app (about 35 minutes, host opening the deciding pictures) sorted them reliably, and found one new, worse fault in passing.

**Suggested improvement:** (1) Before planning a batch from filed small finds older than a week or two, re-walk each on today's build and sort it still there / gone / can't reproduce, pictures kept. (2) When a fix lands for a find that lives inside a multi-find backlog item, the same change marks that find fixed in the item (a grep of the item id in the diff's comments makes this checkable).

**Principle:** A list of observed faults describes the app on the day it was written; re-observe before acting on it, and close a finding where it is fixed, not later.

### Observation 776: A test that writes records by hand leaves the save layer's baseline stale, and a later real tap then records nothing
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/test-driven-development/writing-good-tests.md` Reach the state the way production does: a reload re-bases the change comparison; baseline put level in shared set-up; "fails only in the full file" was already in SKILL.md RED
**Date:** 3 Nov 26
**Session context:** the Inputs batch ([INPUTS-FIXES-1103]) — moving the LATE mark's drop from a session-only set onto the input, through its own command
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the regression test for a change that moves state into saved records

**Issue:** The new test (tap the chip → a command of its own changes the input record) passed alone and failed in its file. An earlier test in the same file set and cleared the field straight on the records (a fixture, outside any command) and then signed out and in, which re-based the save layer's snapshot while the field was set. The later tap wrote the same value as that stale snapshot, so the command layer saw no change, emitted nothing, and Undo said "Nothing to undo" — a test-order artefact that looked exactly like the feature being broken.

**Suggested improvement:** In "Write the failing test", add: when a test file mixes hand-written fixtures on saved records with tests that drive the real write path, put the save layer's baseline back level with the records in the shared setup (beforeEach), and when a commit-level assertion fails only in the full file, run it alone before debugging the code.

**Principle:** A diff-based save layer judges a change against its last snapshot; any test that edits the records behind its back must re-level that snapshot, or later tests inherit a false "nothing changed".

### Observation 777: A walk's frozen build served from inside the test browser frees the lock question from the server
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §1 "One served folder a round" (serve the frozen folder inside the test browser; every new walk library takes its build and picture folders from settings)
**Date:** 2026-11-03
**Session context:** the FULL bug check of the Inputs batch (PR 625) — a host walk, a re-run of an earlier round's scripts and three Sonnet walkers, all on one frozen build
**Skill:** New skill candidate: bug-check walk set-up (or `raptor-port/docs/walk-scripts.md` §1)
**Type:** internal
**Phase/Area:** standing up the walk

**Issue:** The earlier round's scripts were hard-wired to a running preview on a fixed port and a fixed picture folder, so a re-walk would have overwritten the first round's evidence and needed a server per walker. A small module that answers every request from a frozen build folder inside the test browser (`page.context().route`), plus two settings (the build folder and the picture folder), let the old scripts re-run unchanged into a new folder and let three walkers share one build with no port and no server to start or stop.

**Suggested improvement:** walk-scripts.md §1 names the frozen-folder serve as the default for every walk library (not only "the build before the change"), and every new walk library takes the picture folder from a setting from its first line.

**Principle:** Evidence-producing scripts take their output location and their target as settings from the start; a re-run must never overwrite the run it is compared with.
### Observation 786: A motion mock-up checked on the iPhone's engine without a phone, by pausing its animations at fixed moments
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/walk-scripts.md` §5, "An animation is checked frame by frame" (animations paused at fixed moments in WebKit and Chromium, a strip per engine; talon-claw-frames.mjs), moved whole there from MOCK's "A question about FEEL" bullet, which keeps a one-line pointer (the Opus reader's O12)
**Date:** 3 Nov 26
**Session context:** [TALON-LOADING-CLAW] — a loading animation (three claws drawn in turn) put to the owner as a page he plays on his iPhone.
**Skill:** brainstorming (`mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** Judging the Proposal — a question about feel (observation 773)
**Number range:** this chat holds 786–795 (the Inputs batch chat holds 776–785).

**Issue:** The animation used SVG masks animated by CSS — a technique Safari has historically repainted badly — and the owner judges it on an iPhone. A screen recording of a headless browser is unreliable for timing. What worked: open the page in Playwright's WebKit as well as Chromium, call `document.getAnimations()`, pause each and set `currentTime` to a list of fixed moments, screenshot the element at each, and lay the frames out as one strip per engine (`raptor-port/scripts/handpass/talon-claw-frames.mjs`). Both strips matched frame for frame, so the order and direction of the drawing were proved on the phone's engine before the link was sent.

**Suggested improvement:** In `mockups-on-the-real-app.md` §Judging the Proposal, beside observation 773's line on feel: "An animation is checked frame by frame before it is sent: in WebKit (the iPhone's engine) as well as Chromium, every animation paused at fixed moments (`document.getAnimations()`, `currentTime`), one strip of frames per engine and per option, read by eye for order and direction."

**Principle:** Motion is verified by sampling it at known times on the target device's engine, not by watching it play: a paused frame at a fixed moment is a fact, a recording is an impression.

### Observation 787: Two parallel chats told to switch branches in the same folder — one chat's commit landed on the other's branch
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: tracked changes not this chat's (the walks' untracked pictures are not another chat's), or another chat in the folder, means its own short-path worktree — a new job detached at origin/main, a continuing one on its branch itself — with o
**Date:** 3 Nov 26
**Session context:** [TALON-LOADING-CLAW] / [TALON-RENAME], run beside the Inputs batch chat as the handoff allowed ("Two chats may run side by side").
**Skill:** session-handoff (the opening lines it writes for parallel chats)
**Type:** open-source
**Phase/Area:** Writing the opening line when two chats will run side by side

**Issue:** The handoff gave two opening lines, both working in the main folder: one cut a new branch there with `git switch -c`, the other ran `git switch` to its own branch there. The second chat started 16 minutes after the first and switched the shared folder, so the first chat's later commit landed on the second chat's branch (caught at once by comparing the branch with its remote; moved with `git branch -f` to the right branch, pushed, and the other branch put back with `git reset --keep`, nothing of the other chat lost). A worktree made under the session's scratchpad then failed on Windows: the repository holds paths too long for it.

**Suggested improvement:** In session-handoff, where two chats are to run side by side: the second opening line creates its own folder (`git worktree add ../<repo>-<name> <branch>`, a short path beside the repository, never under a temp or scratchpad folder) and works only there; and every chat checks `git branch --show-current` against its own branch before each commit.

**Principle:** Parallel agents need separate working folders, not just separate branches: a branch switch is a change to the shared folder, felt by every agent in it.

### Observation 778: A walk script saved in a Windows encoding blinds the code check, and its message blames main
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): TOOLS addition (d) in _docs/OUTSTANDING-items.md (the code check prints React Doctor's own skip reasons and refuses a non-UTF-8 file); WS §2 gains the UTF-8 line, which closes [WALK-SCRIPT-UTF8]
**Date:** 2026-11-03
**Session context:** Inputs batch [INPUTS-FIXES-1103] — reading GitHub's run after main was merged in; number 778 from this branch's reserved range 776–785.
**Skill:** internal — the code check (`raptor-port/scripts/code-check.mjs`) and `docs/walk-scripts.md`
**Type:** internal
**Phase/Area:** the code check's failure message; how walkers write scripts

**Issue:** A walker's script carried one em dash in Windows-1252 (byte 0x97). React Doctor's linter refused the file ("stream did not contain valid UTF-8"), skipped the whole lint, and marked the comparison degraded. The code check reported only "could not read origin/main's side, so it compared nothing" — pointing at main, when the unreadable file was on the branch. It looked like a GitHub or merge problem; finding the cause took reading React Doctor's raw report (`projects[].skippedCheckReasons.lint`).

**Suggested improvement:** (1) In `code-check.mjs read()`, when `baselineDegraded` is set, print `skippedCheckReasons` too (the real cause). (2) A cheap guard: the code check (or the walk-script lint) refuses a changed code file that is not valid UTF-8, naming the file. (3) `docs/walk-scripts.md`: walk scripts are written with the Write tool or a UTF-8 writer — never through a tool that saves in the console's code page.

**Principle:** When a checker gives up, its message must carry the reason the tool itself gave, not a guess at which side failed; a misleading "could not compare" sends the reader to the wrong half of the problem.

### Observation 779: A reader's word for a thing reached the owner without being checked against the app
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §4 "What to do with what they hand back" step 1 (every app noun in a finding checked against the app's own list before it is repeated to him)
**Date:** 2026-11-03
**Session context:** Inputs batch [INPUTS-FIXES-1103] — relaying the security reader's finding; number 779 from this branch's reserved range 776–785.
**Skill:** internal — the bug-check order's "What to do with what they hand back" (§4), and plain-language.md check 2
**Type:** internal
**Phase/Area:** turning a reader's report into words for the owner

**Issue:** The security reader's probe test named a medical kind "MC", which this app does not have (its kinds are HL, OML, ATT C, ATT B). The host carried "MC" into its message to the owner, then translated it as "sick leave"; when the owner asked why "sick leave", the host said "the app calls it an MC" — a second wrong claim. The walk later failed to select "MC" in the kind list, which is how the error surfaced. A hand-made probe works on any string, so the reader's test passed on a kind no screen can make.

**Suggested improvement:** In the order's §4 step 1 ("Reproduce each finding through the real production route"), add: every app noun a reader's finding uses — a kind, a page, a control — is checked against the app's own list (the code's type table, the screen) before it is repeated to the owner; a probe built on a value the app cannot produce is re-run with one it can. The walk helper `fileOn` also assumed an admin's person picker; scripts should be written for the role they sign in as.

**Principle:** A reviewer's vocabulary is evidence about the reviewer, not about the product: check each name against the product before passing it on, or the error is multiplied by every reader downstream.

### Observation 788: A frame recorder that starts its clock at the click, or stamps frames with their start time, hides a freeze that begins at the press
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 new line "A response is timed from the press" (capture-phase pointerdown, performance.now in each frame; a whole animation cycle sampled)
**Date:** 3 Nov 26
**Session context:** [TALON-CLAW-PAGES] — timing how long every page of the menu stays blank when opened, before the loading claw's design
**Skill:** New skill candidate: none — the walk-script guide (`raptor-port/docs/walk-scripts.md`) and `mockups-on-the-real-app.md` §Judging the Proposal
**Type:** open-source
**Phase/Area:** measuring a screen's response to a tap

**Issue:** The first timing run read every ordinary page as drawn 6–14 ms after the tap on a 4x-slowed phone. A cross-check with the browser's long-task record showed a 150–280 ms freeze starting at the press itself: the click event's own time stamp, and each requestAnimationFrame's frame-start time, both fall after a long task that begins with the press, so the freeze was invisible. The same walk also had two checks of a moving claw fail falsely: two looks 0.12 s apart, and a busy stretch, each landed inside the animation's hold phase, when nothing moves.

**Suggested improvement:** In walk-scripts.md: a tap's response is timed from a capture-phase pointerdown (performance.now()) and each frame is stamped with performance.now() inside its callback; any "it was instant" result is cross-checked once against the long-task record before it is reported. And a check that something animates samples a whole cycle (or aligns its window to the cycle's start), never two looks or a window that may fall in a hold.

**Principle:** Time a response from the moment the input happened, measured by the clock you control, and confirm a suspiciously good number by a second, independent instrument; when checking that a cyclic animation moves, sample a whole cycle.

### Observation 789: The design hook's suppress command writes its config under the folder it is run from
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): IMP §Known caveats new line "The design checker's settings are two copies here" (the fix built 8 Nov 26 — two byte-for-byte copies the document check keeps equal; hook-admin writes the copy of its folder)
**Date:** 3 Nov 26
**Session context:** [TALON-CLAW-BG] — a design-hook finding (the word "img" inside a CSS comment) suppressed with hook-admin.mjs ignore-value
**Skill:** impeccable (reference/hooks.md; scripts/hook-admin.mjs)
**Type:** open-source
**Phase/Area:** hooks — the suppression ladder

**Issue:** Run from the app's subfolder, `hook-admin.mjs ignore-value` created a second `.impeccable/config.json` inside that subfolder, beside the repository root's, which already carried the very same exception (from three weeks earlier). The hook still raised the finding before the suppression, so it seems to read the config of the project root it resolves (the subfolder), not the repository's — two configs, two answers. The duplicate was removed by hand.

**Suggested improvement:** hook-admin resolves the same project root the hook and context.mjs resolve (context.mjs reported the subfolder as projectRoot) and says which config file it wrote; or the hook reads the repository root's config as well. Until then, in this repo: run hook-admin from the repository root, and check for a stray config after it.

**Principle:** A tool that writes a setting and the tool that reads it must agree on where it lives; a write that lands beside an existing copy creates two truths, and the reader silently follows one.

### Observation 790: The critique's browser step writes state into the project, so a read-only reviewer injected the detector directly
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): IMP §Known caveats new line "A read-only critique injects the detector itself" (no live server; the banner is not the page's fault) and the offline-detector line (a degraded empty list is not a clean bill)
**Date:** 3 Nov 26
**Session context:** /impeccable critique of the loading claw — Assessment B (detector + browser evidence), run by a read-only helper
**Skill:** impeccable (reference/critique.md — Assessment B)
**Type:** open-source
**Phase/Area:** Assessment B — the overlay flow

**Issue:** The overlay flow says to start `live-server.mjs` and inject `/detect.js`. Starting the server writes session and annotation folders and a server-info file into the project, which breaks a read-only review; the helper injected the same browser detector file directly with a script tag instead, and it worked. Two more frictions: the detector's own banner (its gradient text, its larger type) was reported as findings on the page body, and the banner blocked the test browser's clicks until its pointer events were switched off. The CLI scan also ran degraded (its HTML parser modules missing), so its empty result was an undercount.

**Suggested improvement:** Assessment B offers the direct injection of the browser detector as the read-only path; the detector skips its own overlay when it scans (and sets pointer-events:none on it); a degraded CLI scan says plainly in the report that an empty list is not a clean bill.

**Principle:** A review step that must not change anything needs a path that writes nothing; and a checker must not report its own drawing as the page's fault.
### Observation 780: A new box on screen slipped in as "part of a fix" and reached the owner with no mock-up
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): BCO §5 "Before building any change, a fix included — does it add something he will see?" (D1625) and CL step 5; the note itself says so; no extra sizing line (one gate is enough)
**Date:** 2026-11-03
**Session context:** [INPUT-WIN-X-ASKS] — the owner saw the input window's "Close it and lose them?" box in the walk's pictures, said it was ugly, then "U didn't show me a mock up right before u built this"; number 780 from this branch's reserved range 776–785.
**Skill:** internal — the bug-check order §5 (the build's first step), and `.claude/rules/ui-design.md` short form 1 (D541, D853)
**Type:** internal
**Phase/Area:** deciding whether a change needs a picture before it is built

**Issue:** The Inputs batch's F2 ("Escape throws away typed words with no word") was filed and built as a fault fix. Its fix added a new question box to the input window, its look copied from the window's existing swap question. Because the work was classed as a fix and the look was "already the app's", the mock-up step never fired; the box went through the walk, the code reads and a second change (✕ asks) before the owner first saw it. The rule (D541, D853) already said a visual change is a picture first; nothing in the build's checklist asked the question at the moment of building a fix.

**Suggested improvement:** Done for the order: a line before "Order of steps in FULL" asks, before any build including a fix, "does this add something he will see?" (D1625). Also worth adding to the walk-sizing step (§7.0): a sizing that finds a new visible part in a fix stops and checks a picture was put to him.

**Principle:** A rule keyed to the kind of work ("a design change") is skipped when the same output arrives under another kind ("a fix"); key the check to the output — something new on screen — not to the label of the task.

### Observation 796: A drawing helper handed to the page loses every function beside it in its file
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Traps new bullet "Code sent into the page runs without its module" (self-contained evaluate; a shared kit tried once at both sizes; a card placed within its control's own window)
**Date:** 4 Nov 26
**Session context:** [ASK-AT-THE-CONTROL] — a shared kit (`raptor-port/scripts/handpass/ask-at-lib.mjs`) that hangs any question as a card from its control, for five drawing helpers at once
**Skill:** brainstorming (`mockups-on-the-real-app.md` §Traps) and the walk-script guide (`raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** injecting into a live page

**Issue:** The kit's placing function, passed to the browser as `page.evaluate(hangInPage, args)`, called a small helper defined beside it in the same module. The browser receives only the function's own text, so the helper was undefined there and the first trial failed with a reference error inside the page. A second trap in the same trial: the card lined itself up by the halves of the SCREEN, so a Delete on the left of a window docked at the screen's right got a card hanging out over the page beside the window.

**Suggested improvement:** In §Traps: a function given to the page is self-contained — every helper it calls is declared inside it (or passed as text); a shared kit is tried once on one real case at both sizes before it is handed to parallel helpers. And a card or pop-up placed "by the side the control is on" measures that side within the control's own window or sheet, not the screen.

**Principle:** Code sent into a page runs without its module: make it self-contained, and try a shared kit once before several helpers rely on it; place anything anchored to a control relative to the control's own container.

### Observation 797: A part drawn into another window is still its owner's child to React — presses, focus and Escape go to the owner
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §6 new row "A part drawn inside another surface but owned by a different component" (the handlers of both pressed in the real browser); CL step 8 names it
**Date:** 2026-11-04
**Session context:** [ASK-AT-THE-CONTROL] build — a question card drawn (React portal) inside the opened day, owned by the input window behind it
**Skill:** New skill candidate: walking floating surfaces (walk-scripts guide, raptor-port/docs/walk-scripts.md)
**Type:** internal
**Phase/Area:** the walk's design of scenarios for a surface drawn into another surface

**Issue:** Four of the walk's six finds came from one cause: the card was drawn in one window's box but belonged to another component. A press on it reached the owner's "come forward on press" handler (capture phase, so the card could not stop it), the owner jumped over the card and the tap's click hit the owner; the owner's Escape guard asked "am I in front?" and let the other window's Escape close the day under the card; the card measured hidden could not take focus; a Leave War sheet's capture-phase Escape closed the sheet over the card. Unit tests in jsdom passed all four (no layout, focus on hidden nodes allowed, synthetic events dispatched directly).

**Suggested improvement:** In walk-scripts.md (or the bug-check order's roll-call rows): a surface drawn into ANOTHER surface gets one walk row per handler of each kind on BOTH surfaces — press-to-front, Escape, outside-press, focus trap — each pressed on the real browser at a phone's size, with the answer button pressed (not only seen) and Escape typed with the keyboard both on the card and elsewhere.

**Principle:** Where something is drawn and who owns it can differ; list the handlers of both, and press, not just look, on the real browser — the test harness's direct event dispatch hides every one of these.

### Observation 798: A fault "worked out from the code, not seen" was smaller on paper than on screen
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 1 (a fault filed from reading code is reproduced for its "today" picture and the proposal sized by it)
**Date:** 4 Nov 26
**Session context:** The Leave War small fixes — drawing the mock-up for [LAZY-PAGE-LOAD-FAIL], a failed download of a page's separate file
**Skill:** brainstorming (`mockups-on-the-real-app.md` §The Method, step 1) / the bug-check order's sizing step
**Type:** open-source
**Phase/Area:** the "today" picture of a fault filed from reading code

**Issue:** The backlog item, filed from reading code, said a failed download left that page with "nothing to show in its place". Reproducing it for the mock-up's "today" picture (the download refused in the test browser) showed the whole app going black, top bar included — and on a desktop with no tap at all, because a background pre-fetch of the same file fails the same way. The proposal's scope (catch it at the page, keep the bar, never surface a failed background fetch) came from the reproduction, not from the item.

**Suggested improvement:** In step 1 of the method, where the "today" state is a fault filed from code and not seen, reproduce the fault itself for the today picture (refuse the request, cut the signal, feed the bad value) before drawing the proposal, and widen the proposal to what the reproduction shows.

**Principle:** A fault worked out from reading code is sized by reading too; reproduce it before drawing its fix, because what the screen does at the failure is often larger than what the code seemed to say.

### Observation 799: A fixed output name in the shared temp folder returned another session's run
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): WS §5 "A script writes only under its own checkout … never a fixed name in the shell's $TEMP" and GD §Now "Six more" (1) (read only a results folder this run made, quote its start line)
**Date:** 2026-11-04
**Session context:** the re-walk of D1633 on `claude/leave-war-small-fixes` — a probe's output sent to `$TEMP/probe2.txt`
**Skill:** New skill candidate: none — the working practice of every walk and probe (`raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** collecting a script's output to read back

**Issue:** A probe's output was redirected to `$TEMP/probe2.txt`. My own run had not written it (its command had hung earlier), and the file read back was a run of a different probe from another worktree's session that had used the same name in the same system temp folder. It read as plausible results until its first line named the other worktree. Had it been a run of the same probe, it would have been taken for this one's.

**Suggested improvement:** In walk-scripts.md's rules for output: every run's output goes to this session's scratchpad (or the repo's own `docs/handpass/parts/`), never a fixed name in the shared system temp folder; and a read-back checks a line the run itself prints first (its own tag or start time) before any result is believed.

**Principle:** A shared scratch location is a shared writer: a fixed file name there can hold another process's output, and reading it back proves nothing about your own run unless the file carries your run's own mark.

### Observation 800: His picture shows a layout the PC cannot reproduce — the fonts, not the code
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §The Method head paragraph (where his picture shows what the PC does not, find the differing input; his picture is "today", the proposal drawn as his device measures) — one change with 731
**Date:** 2026-11-04
**Session context:** mock-up of the page names beside TALON (D1641), drawn on the real app at six widths
**Skill:** impeccable (the mock-up method, `.claude/skills/brainstorming/mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** The Method, step 1 (picture the "today" state)

**Issue:** His screenshot (iPhone held sideways) showed the top bar wrapped onto three rows. The same width on the PC's Chromium drew it on two: the page names measured 695 against 706 of room, because the iPhone's system letters are wider. The first round of pictures showed "no change" everywhere and would have misled him had they been sent.

**Suggested improvement:** In the mock-up method, step 1: when his own picture shows a state the PC's render does not, compare the two before drawing anything; where the difference is letter width, use his picture as the "today" frame and draw the proposed frame as his device measures it (forced, and said so on the page), and make the build measure on the device rather than at a fixed width.

**Principle:** A user's own screenshot outranks a re-render on a different device; when the two disagree, find which input differs (fonts, zoom, text scaling) before trusting either picture.

### Observation 801: The here-document trap (Observation 601) met again — a script truncated silently, not refused
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): `.claude/hooks/script-guard.mjs`, built 8 Nov 26 after this note: refusal 1 covers the escaped apostrophe (a backslash); M4 measured the bare apostrophe working in bash 5.3
**Date:** 2026-11-05
**Session context:** building the member / guest batch ([ACCESS-WAIT-LOOK] and three more) on `claude/member-guest-checks`
**Skill:** New skill candidate: none — the working practice behind every build (Observation 601, ACTIONED 2026-10-27 as a filed guard)
**Type:** internal
**Phase/Area:** edit scripts passed to Python through a bash here-document

**Issue:** Met again 5 Nov 26: an edit script written through `cat > file <<'PY'` whose body held JSX with apostrophes ("You're on the schedule") was cut off at the shell's "here-document delimited by end-of-file" warning — the file was written, 126 of its lines, ending mid-statement, and Python was never run; the step was saved by trimming and re-running. Twice more the same session, a test name holding an escaped apostrophe (`\'`) inside a Python string came out as a bare apostrophe and broke the TypeScript parse. Smaller here-documents in the same session worked, so the habit held.

**Suggested improvement:** The guard filed by Observation 601 (an unconditional default: any multi-line script goes to a scratchpad file through the file tool) is still not built; count this as a further met-again for it. Until it is, apostrophes in test names are best avoided in generated edits (a double-quoted string or a reworded name).

**Principle:** A lesson filed but not built recurs at the same rate; a silent partial write (a file truncated, no error) is the costlier form of the same trap, because the next step can run on half a script.

### Observation 820: A mark's own style moved the floating panel it marked
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 3 (a mark never sets position, display, size or overflow on its element; the box asserted unchanged) — one change with 848; the guard rides [DRAW-MARK-HELPER]
**Date:** 2026-11-05
**Session context:** drawing the posting-out bell line on the real app ([POSTOUT-RUN-NOTICE]); numbered in this chat's range 820–829 (a parallel chat holds 802–819)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 3 — the mark drawn on the element

**Issue:** The "today" mark (a dashed outline and a tag in `::after`) carried `position:relative` so the tag had a box to sit against. On the bell's list, which is `position:fixed`, that rule pulled the list out of its place into the page's flow: the "today" picture showed no list at all, and the script passed with no error. Found only by looking at the picture.

**Suggested improvement:** In step 3, add: a mark's class never sets `position` (or display, size, overflow-hiding) on the element it marks; a fixed, absolute or sticky element already gives its tag a box, and a static one gets the tag as a child instead. Have the drawing script assert the marked element's box is unchanged (same rect before and after the class is added).

**Principle:** A mark drawn on an element must not change that element's layout; check the element's box before and after adding the mark, because a broken frame passes silently.

### Observation 821: A drawn mock-up of an event's result never asked whether the event happens in every case drawn
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging "This works like the existing X" (a drawn event result asserted to fire for every case drawn) and session-handoff SKILL.md Rules 2 (a build note on an existing mechanism names its ruling or test, or says unchecked)
**Date:** 2026-11-05
**Session context:** building the posting-out bell line ([POSTOUT-RUN-NOTICE]) from its approved drawing and the handoff's build notes
**Skill:** mockups-on-the-real-app (brainstorming) and session-handoff
**Type:** open-source
**Phase/Area:** the drawing step; the handoff's "what the build carries"

**Issue:** The drawing showed four bell lines, one per outcome of a posting, as if each were written when "the posting runs on its date". In the app one of the four outcomes ("off the manpower") never runs anything on its date — so there was no moment to write its line, and the build needed a different mechanism (a line each bell works out from stored data). The drawing script had moved the clock and seen the other three run, but cloned all four lines by hand, so the gap never showed. Separately, the handoff said the line was written "inside the command, so an Undo takes it back" — but an earlier ruling says the top-bar Undo never takes a posting back; the build had to find that out from a failing test.

**Suggested improvement:** In the mock-up guide: when a drawing shows what an event produces (a notification, a mark, a line), the drawing script asserts for EVERY drawn case that the event actually fires in the running app (a hook, a log, a state change), and lists any case where it does not as a design question. In the handoff skill: a build note that claims a behaviour of an existing mechanism (Undo, a save, a permission) names the ruling or test that shows it, or says it is unchecked.

**Principle:** A picture of a result is not evidence that its cause happens; and a claim about how an existing mechanism behaves is a guess until a ruling or a test is named for it.
### Observation 810: A CSS fix drawn by editing the app's own rule in place
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Traps "A script that toggles styles…" (a CSS-only fix drawn in the real rule in place, found once) and the n-th visible line (the front window, not the first in the page's order)
**Date:** 2026-11-05
**Session context:** [CSS-FONT-INHERIT] — drawing nine dropped `font:` lines today beside the fix (branch claude/css-font-inherit-look)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** Traps When Injecting Into a Live Page / the transform

**Issue:** The fix was a stylesheet correction. An injected sheet would sit at a different place in the cascade and could beat (or lose to) rules the real fix would not. Writing the corrected declarations into the page's own CSSOM rule (`rule.style.setProperty`), found by its exact selector text, gave an exact "after", reversible with `removeProperty`; the script refused unless each rule was found once. A second trap: the crop picked the first visible `.floatwin` in document order — a day window behind the input window.

**Suggested improvement:** Add to the method: "a fix that only corrects existing CSS is drawn by editing that rule in the page's CSSOM in place, never by an injected sheet; assert each rule found exactly once". And in the n-th-visible-match line: "the front window, not the first in document order".

**Principle:** Draw a style fix where it will live: change the real rule in place, so the picture inherits the cascade the build will have.

### Observation 822: A drawing that removes a node the app draws blanks the app on its next redraw
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Traps first bullet (hide, never remove, a part the app drew; print the page's errors as they happen) and step 3's transform ("moves, hides or clones", was "removes")
**Date:** 2026-11-05
**Session context:** drawing [PO-SANS-PUCK-EDGE] on the real app (claude/postout-bell-look; numbers 820–829 held by this branch)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** Traps When Injecting Into a Live Page

**Issue:** The drawing took the "SANS" tag out with `remove()` to picture the proposal. Two steps later the app redrew that row (a setting changed, a posting was undone) and the whole screen went blank: React threw "removeChild: the node to be removed is not a child", because the node it owned was gone. Three runs were spent on the wrong cause (a button not found, a sheet in the way) before the page's own error was printed.

**Suggested improvement:** Add to the guide's traps: "To take away a part the app draws, hide it (`style.display='none'`), never remove it — a removed node crashes the app's next redraw of it, and every later step reads a blank screen. Print the page's errors to the run's log as they happen, not only at the end."

**Principle:** In a page a framework owns, a drawing may hide or add, never delete what the framework made; and a script's first move on a strange failure is to read the page's own error.

### Observation 823: A walk helper that reaches a control by one route blames the app when the state changes the route
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §4 new line "A control reported MISSING has had every door tried" (first whether the state draws it, then every route, each failed try pictured)
**Date:** 5 Nov 26
**Session context:** the take-back walk (claude/postout-bell-look); the posting sheet's Undo after the posting's date was moved
**Skill:** New skill candidate: walk-script helpers (docs/walk-scripts.md)
**Type:** open-source
**Phase/Area:** walk-scripts §4 — pressing the control the app routes

**Issue:** The helper opened the posting sheet by tapping the posting date's day. Once the date was moved later, that day became an ordinary day and opened another sheet, so the walk reported the Undo button MISSING and the scenario FAILED, as if the app had lost a door. Two more first-run FAILs had the same shape (a deleted man's row is kept; a page tab hid the grid).

**Suggested improvement:** walk-scripts §4: a helper that reaches a control lists every route a person has to it (the day itself, a day inside the state, a menu), tries each in turn, logs which one worked, and pictures each failed try, so a FAIL means "no route found", never "my one route changed".

**Principle:** A door check proves absence only when it has tried every door the state can offer; one remembered route is evidence about the script, not the app.

- Met again 5 Nov 26 ([PO-CHANGE-RETRACT], walk S22): the step tried every route and still found no Undo — because with "+ SANS" on the app draws a ran SANS posting with no posting day (D283), so no route exists in that state. A door check must first ask whether the STATE offers the door at all (read the app's drawing rule), not only try every route; proposed guard: a walker's brief names, for each door it presses, the states in which the app draws it.

### Observation 830: A finding about a drawn icon's colour was read from its button, not the icon
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging "An existing component shown inside a mock is measured" (a colour read on the drawn part itself, never its container)
**Date:** 2026-11-05
**Session context:** [UI-CONSISTENCY-LOOK] round 4 — picturing the settings gears (numbers 830–839 held by this branch; 820–829 by `claude/postout-bell-look`)
**Skill:** brainstorming (mockups-on-the-real-app.md, "Judging the Proposal")
**Type:** open-source
**Phase/Area:** measuring an existing component before a finding is filed

**Issue:** A consistency sweep filed "the Leave War's gear is cyan, the others white" from the button's computed `color`. The button's colour was indeed the accent, but the svg inside it carries its own class whose rule sets a grey, so on screen the gear was grey like every other drawn icon. The finding sat in the backlog for two weeks as a question for the owner; picturing it at 2x showed the grey, and measuring the svg's own computed colour confirmed it.

**Suggested improvement:** In "An existing component shown inside a mock is measured, not styled", add: measure the colour of the drawn part itself (the svg, the glyph's element), not its container — an icon's class may override the colour it would inherit; and look at the picture before filing a colour finding.

**Principle:** A colour finding is measured on the pixels' own element; a container's colour is a guess about its children.

### Observation 831: An opening line that switches branches in the main folder can land on another chat's unsaved work
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: the same clause as 787
**Date:** 2026-11-05
**Session context:** start of [UI-CONSISTENCY-LOOK] round 4; the opening line said `git switch --detach origin/main` in the main folder, which held another live chat's branch and ten uncommitted source files
**Skill:** session-handoff (the opening line it writes)
**Type:** internal
**Phase/Area:** the ready-to-paste opening line for a new job

**Issue:** The opening line for a new job tells the new chat to detach and branch in the folder it starts in. With parallel chats, that folder is often another chat's working copy with uncommitted work: switching would carry those edits onto the new branch or disturb the other chat (the 3 Nov 26 note in memory records a commit landing on the wrong branch this way). This chat checked `git status` first and made its own short-path folder (`git worktree add ../Raptor-<name>`), as the memory note says, but the opening line itself did not.

**Suggested improvement:** The session-handoff skill's opening-line template for a new job gains one clause: "if `git status` shows changes you did not make, or another chat is on this folder's branch, run `git worktree add --detach ../Raptor-<short> origin/main` and work there instead."

**Principle:** An instruction to switch branches must first check whose folder it is; the guard belongs in the instruction, not in the reader's memory.

### Observation 832: A design reader passed a new icon that the owner saw at once looked like its neighbour
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): DP §9 lesson 92 (D1700), the agent's reading: before a new mark is proposed it is set beside every mark already on its bar and page; §9 is read whole on every design job (ui-design.md, D941)
**Date:** 2026-11-05
**Session context:** [UI-CONSISTENCY-LOOK] round 4 — the drawn OIL Earn mark (a clock) beside the board's History button (a clock with an arrow)
**Skill:** impeccable (critique, Assessment A's brief) and brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** checking newly drawn icons before they are put to the owner

**Issue:** The drawing borrowed an existing mark (a plain clock) for a button whose bar already carried a clock-shaped mark meaning something else. The owner saw it at once; a fresh, blind design reader asked to judge whether the new icons "read clearly, match each other and the app's line icons, and are ambiguous" called the borrowing "a good link" — it compared each new mark with its source and with the other new marks, never with the marks already standing beside it.

**Suggested improvement:** In the mock-up method and in the critique reader's brief, add one step for any new or borrowed mark: lay it beside every mark already on its bar and its page (an inventory taken from the running page, not the source) and name any pair a person could mistake.

**Principle:** A borrowed icon carries its old meaning into a new neighbourhood; check it against its neighbours, not only against where it came from.

### Observation 833: A search for tests that read an old mark, filtered to "assertion-looking" lines, missed the browser tests
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (q), added: a script listing every test that names a changed file, run before the first push (met twice); the drawing half in `raptor-port/docs/bug-check-order.md` §7, the drawing-check line
**Date:** 2026-11-05
**Session context:** Raptor, building round 4 of the consistency look (typed marks → drawn icons)
**Skill:** New skill candidate: replacing a visible string/glyph across an app
**Type:** open-source
**Phase/Area:** finding every test that pins the old text before changing it

**Issue:** Before swapping typed marks for drawings, the agent grepped tests for the marks but piped through a filter of assertion keywords and a comment filter; the e2e specs and a smoke script that clicked `has-text("╱ Line")` or asserted `toBe('⇅ Done')` slipped through, and only the CI run (minutes later, on another machine) found five of them. Separately, the approved drawing itself showed a control covered by a window — a pixel-faithful build reproduced the defect, and only a test that PRESSES the control in that state found it.

**Suggested improvement:** When replacing a visible string, list FILES (not lines) containing the old string across every test kind — unit, browser, smoke scripts — with no filter, then read each hit. And for any layout move, press each moved control in the states the drawing shows (a window open), not only measure it.

**Principle:** A filtered search is a guess about how tests are written; list every file that contains the old text, unfiltered, and read each. A drawing proves appearance, never reachability — press the moved control in the drawn state.

Met again 8 Nov 26 (chat 20, `claude/chat20-tracker-small-batch`, [TRK-KEPT-COPIES]): turning the Tracker's copied colours into links, the job ran the tests it wrote and the ones named for the Tracker, but not the date box's look test, which also reads the Tracker's stylesheet and pinned one copied value; GitHub's full run found it. The TDD skill already says "every test that reads the stylesheets, for a style change" — a rule broken, so a guard: before the first push of a change to a file, list every test file that names it (`grep -rl "<file's base name>" src e2e scripts`) and run them all, a step in the push checklist, not a judgement each time.

### Observation 834: A geometric "letters fit" check needs the letters' own pixels, and must know which letters are hidden on purpose
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): TOOLS addition (e) (one shared ink-based "letters fit" helper — the guide line was missed the day it was written); WS §5 ink line sharpened (letters hidden by design; box against box)
**Date:** 2026-11-06
**Session context:** Raptor, the walk of a Leave War cell redesign (boxes side by side, halves over wholes, corner tags)
**Skill:** bug-check order (walk scripts — docs/walk-scripts.md §4)
**Type:** open-source
**Phase/Area:** on-screen assertions that a box's text is not cut or covered

**Issue:** The walk script judged "cut" by comparing the text's line box with its box; on half-height boxes the line box is taller than the capitals, so four kinds of day failed falsely. Then a picture showed a box with no letters at all, which read as a fault; it was a joined multi-day bar whose later days hide their code on purpose (transparent text). The full combination measure, by contrast, read ink pixels but only checked corner tags — never whether one box covers another's letters.

**Met again, same day:** `docs/walk-scripts.md` already says "Whether letters fit is measured on their ink" (6 Nov 26) — the new walk script was written without it, so the rule did not reach the moment of writing. The guard to propose: one shared on-screen helper (ink-based) that walk scripts import for "letters fit", in place of each script writing its own.

**Suggested improvement:** In walk-scripts §4, a step that judges text fit uses the glyphs' ink (or the long axis only, for a line box) and lists the classes that hide text by design (e.g. a joined bar's later days) before calling a missing word a fault; and a combination measure checks box-over-box overlap of ink as well as tag-over-ink.

**Principle:** Judge "cut" by ink, not by the text's layout box; and before calling missing text a fault, ask whether the design hides it on purpose.

### Observation 835: A build of the live branch for a before/after measure needs a recipe that skips the picture folders
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §8 (the archive recipe for main beside a branch, vite build --outDir) and WS §5 "A close-up is made by its browser context" (pixel density set at creation)
**Date:** 2026-11-06
**Session context:** Raptor, measuring the branch against today's main for a "made worse?" count
**Skill:** bug-check order (walk scripts) / gates-and-deploy
**Type:** internal
**Phase/Area:** making a comparison build of main without a second worktree

**Issue:** No document says how to build main beside a branch. A first try copied main's whole app folder (git archive) and spent minutes dragging gigabytes of walk pictures; excluding the docs folder made the copy take 8 seconds, and linking the installed packages let it build in one second. A per-session browser test also ignored a pixel-density override sent on a second debugging session, so close-up pictures came out at normal size.

**Suggested improvement:** Add to docs/walk-scripts.md: "a build of main: git archive origin/main -- raptor-port ':(exclude)raptor-port/docs' into scratch, junction node_modules, vite build --outDir <scratch>, LW_DIST=<that>"; and for 4x close-ups make the context with that pixel density rather than overriding it mid-run.

**Principle:** A comparison build should copy only what the build reads; and set rendering density when the browser context is made, not after.

### Observation 802: A safety-net message no control reaches is pictured through its element's nearest real refusal
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK step 1 (a safety-net message reached through the nearest real refusal, only its words changed and named)
**Date:** 2026-11-05
**Session context:** [NOTSAVED-REFUSAL-LOOK] — picturing four "not saved" refusals as they look today before drawing one shared look
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 1 ("drive … to the 'today' state through the app's own controls")

**Issue:** Each message was a backstop that fires only when a check disagrees with the screen. Forcing that disagreement through a developer hook (flipping the page's role) made the app refuse AND undo the hook, so the box carrying the message vanished with it — a run lost to a state the app is built to correct. What worked: reach the same element through its nearest REAL refusal (a typing refusal raises the same tag under the same box), then set only its words — one named transform — and say so on the page; for a passing note, raise the app's own note with the exact constant.

**Suggested improvement:** add to the method's step 1: "A message no control reaches (a safety net) is pictured by reaching its ELEMENT through the nearest real state that raises it, then changing only its words, named on the page; first try whether the forcing hook survives the app's own correction — a refusal often restores what it refused."

**Principle:** When the state you need is one the system actively corrects, picture the container from a reachable sibling state and change the minimum, rather than fighting the correction.

### Observation 803: The document check passed with a merge's clash markers still in a full-text rulings file
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, the settle step: the clashed files from `git diff --name-only --diff-filter=U`, never a printout cut by tail; the check filed as [CHECK-TOOLS-HARDEN] (m)
**Date:** 2026-11-06
**Session context:** [NOTSAVED-REFUSAL-LOOK] — bringing main (202 commits) into the branch before the build
**Skill:** New skill candidate: none — the project's document check (`raptor-port/scripts/docsize.mjs`)
**Type:** internal
**Phase/Area:** the merge of notes files; the document check as the guard

**Issue:** Six notes files clashed; one more (`.claude/decisions-full/design.md`) was missed by the resolver because the merge's printed list was cut short by `tail`. The document check then passed (exit 0) with `<<<<<<<`, `=======` and `>>>>>>>` lines still in that file; only `git commit` refused, naming it.

**Suggested improvement:** the document check fails on any line beginning `<<<<<<< `, `=======` or `>>>>>>> ` in a file it reads; and a merge's clash list is read from `git diff --name-only --diff-filter=U`, never from the merge's own printout through `tail`.

**Principle:** A guard that reads files should refuse the one marker a half-finished merge always leaves; and a list that decides what to fix is taken whole from the tool that keeps it, never from a cut-short printout.

### Observation 804: A drawing laid over a live element inherits whatever the app had done to that element
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Traps new bullet "Restyling a live element in place keeps what the app set on it" (clear it or re-run the app's placing); the case itself was settled by D1670
**Date:** 2026-11-06
**Session context:** [NOTSAVED-REFUSAL-LOOK] — the drawing check after the build
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method — drawing a new face on an existing element

**Issue:** The drawing restyled a red refusal tag into the grey "Blocked" tag in place. On the phone the app had already moved the red tag sideways to keep it on screen (an inline nudge set from its first width); the restyled, narrower tag kept the nudge, so the approved picture shows it 53px from its box. The build, drawing the tag fresh, needs no nudge — and the drawing check reported a difference that was the drawing's, not the build's. Found only by measuring both builds with a probe.

**Suggested improvement:** add to the method: "when a drawing restyles a live element, clear what the app set on it for its old look (inline position, transform, a measured width) or re-run the app's own placing after the restyle; name in the drawing any element whose place the app works out from its size."

**Principle:** A mock made by restyling a live element carries the app's adjustments for the old look; reset them, or the approved picture records an artefact the real build will never draw.

### Observation 836: Measure what a chat reads with the project's calibrated estimate, never a stock tokenizer
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §3, new "Measuring what a chat reads": `docsize.mjs --reads` (the calibrated estimate), never a stock tokenizer; check one measured load first
**Date:** 2026-11-07
**Session context:** [RULES-DIET] — measuring what a chat reads before code, for the rules-diet plan
**Skill:** New skill candidate: context-load audit (measure what a session must read, by rule, per job profile)
**Type:** open-source
**Phase/Area:** measurement

**Issue:** The first pass counted tokens with Anthropic's older public tokenizer package and got numbers about 30% lower
than the project's own estimate (`docsize.mjs` `estTokens`, fitted on measured loads, 2.74 characters a token, capitals
dearer). Only the calibrated estimate matched the app's own count of the every-chat layer (≈38,000). The 6 Nov brief had
used 4 bytes a token and under-read the same way. A plan whose headline rests on "how full a chat gets" would have
under-stated the problem by a third.

**Suggested improvement:** a context-load audit (a skill, or `docsize --reads`) that (1) uses the calibration fitted on
the app's own measured loads, (2) checks it against one fresh measured load before trusting it, (3) counts by layer —
every chat, per message, per file opened, per job's required reads — and by job profile, (4) states each "read by rule"
assumption beside its number.

**Principle:** A size measure is only as good as its calibration against the system that actually pays the cost; check
one known figure before trusting a tool's count, and prefer the project's measured fit over a generic counter.

### Observation 837: Compressing a rule set needs mechanical checks for the links the old format carried
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): `raptor-port/docs/doc-budget.md` §4 "The rulings": a converted area's every live ruling cited on a statement, each change mark travelling with it, none citing a replaced one — the gate checks each (read today)
**Date:** 2026-11-07
**Session context:** [RULES-DIET] — converting one-line rulings into "how it works now" pages; a fresh blind reader read plan v1
**Skill:** New skill candidate: context-load audit / rules consolidation (with #836)
**Type:** open-source
**Phase/Area:** converting a list of rulings into a current-state page

**Issue:** The first sample pages, written carefully by hand, still dropped six clauses of rulings they cited, "placed"
46 rulings as a bare list of numbers, and lost the "changed by" links that told a reader a rule had been narrowed. The
account also invented a disposition ("history") the project's archive rules do not allow. A blind reader found all of it;
two small checks then found the same class mechanically — a citation counts only in a statement (enough words per cited
number), and a line citing a rule must also cite every later rule its full record marks as changing it.

**Suggested improvement:** when consolidating rules, write the checks first and run them on the first sample before
writing more: (1) every live rule is cited on a statement line somewhere that loads; (2) no bare lists; (3) each rule's
change marks travel with it; (4) dispositions use only the project's own archive categories, each confirmed against the
full record.

**Principle:** A compressed format must carry, as a check, every relationship the verbose format carried implicitly —
otherwise the compression silently drops exactly the narrowings and clauses that mattered.

### Observation 838: A blind second read of an older version needs a copy of that commit, not the live branch
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4 "Never show either model": a blind reader of a commit that is not the head runs in an exported copy of it, the recipe moved to `raptor-port/docs/codex-guide.md` "Reading a commit that is not the branch head" (the Opus reader's size cut); the ready script is (
**Date:** 2026-11-07
**Session context:** Astra's blind read of the rules-diet plan v1, run after v2 (which folds in the first reader's report) was already on the branch
**Skill:** claudex-loop:codex-review (and the project's reader briefs)
**Type:** open-source
**Phase/Area:** launching an independent reviewer

**Issue:** The brief asked for a read "blind to the other reader" of commit a294a09f, but the branch by then held v2 of the plan, whose review log lists the first reader's findings, and the first reader's report itself. Pointing the reviewer at the live checkout would have shown it both. An old-commit worktree fails on this repo (very long picture names). What worked: `git archive <commit> -- . ':(exclude)<picture folders>' | tar -x -C <scratch>`, `git init` and one commit there so the repo's scripts run, then `codex exec -C <scratch> -s read-only`. 87 MB, seconds; the reviewer saw exactly the commit and nothing later.

**Suggested improvement:** In the codex-review / claudex-loop review step: when the version under review is not the branch head, or the branch already holds another reviewer's report or a revision built from it, run the reviewer in an exported copy of that commit (picture or binary folders excluded), and say so in the saved report's header.

**Principle:** Blindness is a property of what the reviewer can reach, not of what the brief tells it not to open; give it a tree that contains only what it should see.

### Observation 839: A plan step sized at several chats should name where each chat stops
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/writing-plans/SKILL.md` Task Right-Sizing (each session's slice and clean stop) and `.claude/skills/session-handoff/SKILL.md` Step 4 "acts on" list (Pick up here names the next slice)
**Date:** 7 Nov 26
**Session context:** the rules diet, step 1 (the checks and scripts), started from a handoff that said "start step 1" for a step the plan sizes at three chats
**Skill:** writing-plans; session-handoff
**Type:** open-source
**Phase/Area:** writing-plans — the task list; session-handoff — "Pick up here"

**Issue:** The chat opened at about half full from what loads at the start, and the step it was handed was sized at three chats with no split named. It had to choose its own slice mid-way (the checks first, then the recorder, then merging and the report), and the next two chats depend on that choice being written down.

**Suggested improvement:** writing-plans: when a task is sized at more than one session, list each session's slice and the clean stopping point after it (what is built, tested and committed). session-handoff: when the work in hand spans sessions, the "Pick up here" line names the next slice by its parts, not the whole step.

**Principle:** Work too big for one session is split where it is planned, not where the session happens to fill up; each slice ends at a point that is built, tested and committed.

**Met again 7 Nov 26 (`claude/rules-diet-step1`, part 3):** the handoff named "part 3" as one slice though it held three builds (`--merge` in both shapes, the seam files, `docsize --reads`); the chat started at 41% from what loads at the start and reached 76% from reading the plan and the scripts alone, so it built the smallest (the seam files) and handed off with the other two designed in the block. Proposed guard: the outgoing chat sizes the next slice against what a fresh chat has left after its start-up load (measured, not guessed) and names one build per slice where a build needs its scripts read whole.

### Observation 840: A helper that turns a failed command into empty output made a report read "nothing loads"
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (n), added: the backlog script's git wrapper still swallows errors with no output buffer (docsize's two were fixed 7 Nov 26); the rule for new scripts in the item
**Date:** 2026-11-07
**Session context:** the rules diet, step 1 part 3c — `docsize --reads`, a report of what a chat reads
**Skill:** New skill candidate: writing repo scripts (no skill covers it; the project guide's token-discipline rules are nearest)
**Type:** open-source
**Phase/Area:** a script's shell-out wrapper

**Issue:** The new report listed files with `git ls-files` through the house wrapper `try { return execFileSync(...) } catch { return '' }`. In this repo the listing outgrows Node's default output buffer (1 MB), so the call threw and the wrapper returned an empty list; the report then printed every rules file as not loading — plausible-looking numbers, wrong by 300,000 tokens. Only comparing them with the plan's known figures caught it.

**Suggested improvement:** In any repo script, a shell-out whose empty result is a meaningful answer ("no files", "nothing changed") must not swallow errors: let it throw, or return null and test for it. Narrow listings to the paths needed, and set `maxBuffer` on any listing of a whole repo.

**Principle:** An error that becomes an empty value is indistinguishable from a true "none"; only swallow errors where "none" and "failed" lead to the same action — and check a new report's first numbers against an independent figure before trusting it.


### Observation 841: A reader's fix needs its own reader — and a red-first loop needs a way to run only the new cases
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/receiving-code-review/SKILL.md` Two of a Kind Is a Family: a "decided from one source" finding is a family, a case per sibling state; the self-test's name filter filed as [CHECK-TOOLS-HARDEN] (o)
**Date:** 2026-11-07
**Session context:** Rules diet step 1 — fixing a fresh reader's findings in the document-check scripts, red-first.
**Skill:** receiving-code-review (and the project's self-test of its document checks)
**Type:** open-source
**Phase/Area:** acting on review findings; the fix → re-read loop

**Issue:** Each fix round on a merge tool was read again by a fresh reader, and each read found a gap the fix had left beside it — first a whole neighbouring shape (a new file made in the new layout WITH an item moved into it), then a sibling shape (that item retired on the other side), a filter made too broad, and a false positive from comparing "absent" with a value. All were in the same family as the original finding: a branch that decided "is this the new shape?" from one source when two existed. The self-test suite had no way to run a subset, so seeing only the new cases fail first meant building a scratch copy with each case-runner patched to skip non-matching names (about 12 minutes saved per round over the full run).

**Suggested improvement:** In receiving-code-review: when a finding says "X is decided from source A alone", search for EVERY place that decides X, not just the ones named, and write the case for each sibling state (created / changed / moved / retired) before fixing. For a long test suite used red-first, give it a name filter (an environment variable) so the new cases can be run alone.

**Principle:** A finding names one instance of a decision made from too narrow a source; the fix is complete only when every reader of that decision and every sibling state of the data has a case — and a slow suite without a filter turns red-first into a scratch-copy chore.

### Observation 842: A text a start hook injects must stay under the host's size cap and free of control characters, or the session silently gets less or nothing
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/task-observer/references/environments.md` §Recommended activation setup: a hook printing a longer text — the host's cap, control characters, the fallback, four test cases; the project's hook already does it
**Date:** 2026-11-07
**Session context:** Switching on a project's short form of this skill through its session-start hook (the hook now prints a ~7,400-character file instead of a ~870-character instruction).
**Skill:** task-observer
**Type:** open-source
**Phase/Area:** `references/environments.md` §Recommended activation setup (the session-start hook)

**Issue:** The recommended hook injects a short instruction, which is far from any limit. Once a project made the hook print a longer text read from a file, a fresh reader found two silent failures: Claude Code caps a hook's `additionalContext` at 10,000 characters (past it, the chat gets a 2,000-character preview and a file path it is not asked to read), and the hook's JSON escaping covered only backslash, quote, newline, carriage return and tab — one stray control character in the file makes the output invalid JSON, and the session then starts with no note at all. Neither showed in a normal run.

**Suggested improvement:** In §Recommended activation setup, where the hook is described: if the hook prints text read from a file, strip control characters before escaping, and fall back to the short instruction when the text is empty or near the host's cap; test the hook on a missing, empty, oversized and control-character file, not only the normal one.

**Principle:** A hook that feeds text to the agent fails silently at its edges — size caps and encoding — so it should fail open to a known-good minimal text, and its test cases must include those edges, not just the happy path.

### Observation 843: A few lines of a reference doc read with the Read tool loaded a whole rulings file
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §3, "A peek costs an area's whole load": a shell read and an edit script load nothing, the Read and Edit tools load the area — the peek only for a reference document or note whose area the job does not touch, never for source, tests or what that area's rulings govern
**Date:** 7 Nov 26
**Session context:** the rules diet's step 3 — editing pointer lines in the ripple map, the design guide and the project guide's full text
**Skill:** session-handoff (context budgeting); New skill candidate: none
**Type:** open-source
**Phase/Area:** reading for an edit late in a long chat

**Issue:** To edit two lines under the ripple map's title, the chat opened three lines of it with the file reader. The project's scoped rules load a rulings file whenever a matching file is opened with that reader, and the ripple map is on the scheduler rulings' paths, so about 45,000 tokens loaded for three lines, taking the chat from about 50% to 84% and forcing a handoff before the step's reads could run. A shell read (sed, grep) loads nothing.
**Suggested improvement:** In the handoff and context guidance: before opening a file only to edit or peek at a few lines, check whether it sits on a scoped rules file's paths (the measure's layer J lists the known ones); if it does and that rules file is not needed for the job, take the lines with a shell read and make the edit by a small script or the editor after a shell read.
**Principle:** A tool that loads context as a side effect should be chosen deliberately: for a small peek late in a long session, use the read path with no side effects.

Met again 7 Nov 26 (the same chat, after its compaction): one Edit of the ripple map's head note loaded the scheduler's rulings file again (~45,000 tokens) — the Edit tool needs the file read first and loads the same scoped rules; an edit script run from Bash would not have.

### Observation 844: A saving promised for reading by section was estimated from a typical job, not from what the routing text names
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/writing-plans/SKILL.md` Self-Review 4: a promised saving estimated from the parts one stated case must use under the plan's own safety condition
**Date:** 7 Nov 26
**Session context:** the rules diet's step 3 — the bug-check order, the design guide and the ripple map read by section, measured after drafting
**Skill:** writing-plans
**Type:** open-source
**Phase/Area:** sizing a plan's "after" figures

**Issue:** The plan said the three documents would fall from about 120,000 tokens to about 29,000 when read by section. Measured once the routing texts were written, they fell to 67,949; after two readers made the routing texts say "every section a step names is read whole" (the plan's own condition), to 91,958 — a quarter saved, not three quarters. The estimate had assumed a typical job opens a few sections, while the condition that made the change safe requires a job to open every section that applies, and one section (the owner's design lessons, half of one guide) is read whole by every job.
**Suggested improvement:** In writing-plans, where a plan promises a size or cost saving from reading less: write the routing text (the list of when to open what) first, or at least list the parts one stated case must open under the plan's own safety condition, and estimate the "after" figure from those parts — measured, not assumed; say in the plan which parts are always read whole.
**Principle:** A saving estimated before the rule that bounds it is written tends to assume the lean case; estimate it from the parts the safety condition forces in, and state that case.

### Observation 845: A saved report's head described how its read was run from memory, and was wrong twice
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4, after "What to do with what they hand back": a saved report's head copied from the brief, the run command and the run log
**Date:** 7 Nov 26
**Session context:** the rules diet's step 3 — moving four readers' reports into the repo, each with a head saying how it was read
**Skill:** claudex-loop (codex-review); requesting-code-review
**Type:** open-source
**Phase/Area:** saving a reviewer's report — the provenance line written above it

**Issue:** two heads were drafted from memory and were wrong: one called the second script reader "blind to the first one's report" when its brief gave it those findings to check each fix against; one said Astra's first run "stopped on its usage limit before it read anything" when its log shows it read for a while (157,600 tokens) and stopped before reporting. The plan's review log compares the reads on exactly these facts. Both were caught only because the brief and the run log were opened before committing. Closed Observation 676 met the same lesson for a mock-up's caption about the app.

**Suggested improvement:** where a review's report is saved, each claim in its head — who read, blind to what, which commit, how long, why an earlier run failed — is copied from the brief, the run command and the run log, opened at that moment; a claim not found there is left out.

**Principle:** A provenance line is a record later comparisons rely on; take each of its facts from the brief and the run log, never from the memory of setting the run up.

### Observation 846: A Codex read-only run cannot open the app's shared notes folder
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", the sandbox bullet: every named file inside the reader's copy or the scratchpad, each path probed first
**Date:** 7 Nov 26
**Session context:** chat 1 — Astra's blind read of the plan for the M365 data package (D1743)
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** building a brief for the other provider (the files it is pointed at)

**Issue:** The plan and the brief were written into the session-family's shared notes folder (under the user's roaming application-data folder), kept outside the public project on purpose. `codex exec -s read-only` read the package in the session's scratchpad (under the local temporary folder) but was refused the notes folder, and answered after a full run with "access to its private notes folder was denied" — about 5 minutes lost and a second run needed.
**Suggested improvement:** In the brief-building step, add: every file the reviewer must open sits inside the repo or the session scratchpad; a file kept elsewhere (a notes folder, the home folder) is copied into the scratchpad first and the brief names the copy. A one-line read probe of each named path before the full run would catch it in seconds.
**Principle:** Before a long run by another tool, check that its sandbox can read every file the brief names; a location your own tools can read is not proof that the other tool's sandbox can.

### Observation 847: A side chat's brief pointed at a handoff block that lives only on another branch
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 2 (a session per job: each brief names the branch with the night's block) and `.claude/skills/session-handoff/SKILL.md` Step 4 (briefs name branch and commit), with 913
**Date:** 7 Nov 26
**Session context:** Chat 3 of the overnight run of 7–8 Nov 26 (the pictures round), started by the coordinating chat; numbered past 846, which another open branch holds.
**Skill:** overnight
**Type:** open-source
**Phase/Area:** starting the side chats of a night (their opening briefs)

**Issue:** The brief told the side chat to cut its branch from `main` and then read the handoff file's block for the night. That block had been written on the coordinating chat's own branch and was not on `main`, so the fresh branch did not have it; the side chat found it only by searching every remote branch's copy of the file.
**Suggested improvement:** In the overnight guide's step that starts side chats, the brief names the branch that carries the night's block (or the block is pushed to `main` first, or pasted into the brief).
**Principle:** A pointer handed to a fresh worker must resolve from where that worker starts; state written on one branch is invisible to a worker started from another.

### Observation 848: A tag on a ringed part was cut off by a panel that hides overflow, and the script ran clean
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): new item [DRAW-MARK-HELPER] in _docs/OUTSTANDING-items.md (a shared marking helper refusing a clipped tag — met twice in one night); MOCK step 3 carries the line — one change with 820
**Date:** 8 Nov 26
**Session context:** Chat 3's pictures round (D1747), the board helper's drawings; numbered past 846, which another open branch holds.
**Skill:** brainstorming (the reference `mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** marking the place on a picture (the method's step 3)

**Issue:** Twice in one night a plain-words tag drawn on a ringed part (its own `::before`) was clipped by a parent that hides what overflows it — the board's OIL Earn bar, and a flying wave's panel at 821 wide. The script reported no error; only looking at the picture showed the cut tag.
**Suggested improvement:** In the method file's traps, and in the tag helper of the drawing scripts: before the picture, check that each tag's box lies inside every ancestor whose overflow is hidden or clipped, and refuse the picture (or move the tag) when it does not.
**Principle:** A mark drawn inside a component inherits its clipping; a check that the mark is wholly visible belongs in the step that draws it, not in the eye afterwards.

### Observation 849: Two headless-browser traps when picturing a scroll frame by frame
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 "A close-up is made by its browser context" (a protocol screenshot's clip is in page coordinates: add the scroll offset); the headless scroll-gesture half is already WS §4 (synthesizeScrollGesture, headless CDP finger)
**Date:** 8 Nov 26
**Session context:** Chat 3's pictures round (D1747), the Leave War helper capturing a one-frame blink of a frozen header.
**Skill:** New skill candidate: a "frame-by-frame capture" note in the walk-scripts guide (`raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** capturing motion as a series of still frames

**Issue:** (1) The browser's synthesized scroll gesture moved nothing on the page in headless mode; raw touch events did. (2) The developer-protocol screenshot's clip is in page coordinates, so on a scrolled page the scroll offset has to be added or the crop lands in the wrong place.
**Suggested improvement:** Add both to the walk-scripts guide's traps, with the working recipe (raw touch events for a phone scroll; clip plus scroll offset).
**Principle:** A capture tool's defaults are tuned for a page at rest; a scroll under test needs the gesture and the coordinates checked against what the picture shows.

### Observation 851: A replacement must be written before the old text is moved out
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, new trap after the new-area-file trap: loaded text is replaced by writing the new text first, then `--move` of the old
**Date:** 2026-11-08
**Session context:** chat 2, the rules diet's step 4 part 2 (the five always-loaded rule files as checklists); numbered past 850, the highest on any branch
**Skill:** New skill candidate: rewriting a loaded rules file (the move script `backlog-archive.mjs --move` and the briefs that use it)
**Type:** internal
**Phase/Area:** the build brief's order of steps

**Issue:** The build brief said to move each file's old text whole to the archive first, then write the checklist in its place. The move script checks the whole record after every move and puts both files back when a live ruling is no longer stated in a file that loads, so moving first failed every time; the helper wrote each checklist above the old text first, then moved the old text, which passed.
**Suggested improvement:** In any brief or guide step that replaces loaded text by moving the old text out, say "write the replacement above the old text, then move the old text whole".
**Principle:** When a tool verifies the whole state after each step, order the steps so every intermediate state is valid: add the new thing before you remove the old one.

### Observation 852: A blind reader's findings leaked into a file the other reader could open
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §4 "Never show either model the other's conclusions" sharpened (no copy or summary anywhere a reader can open, the handoff note included); `.claude/skills/overnight/SKILL.md` Part 2 matched: a reader's report waits in a scratch folder outside the checkout while another reader of the same job sti
**Date:** 2026-11-08
**Session context:** chat 2, the rules diet's step 4 part 1 (two blind reads running at once, D1739)
**Skill:** claudex-loop (blind cross-reads) and the bug-check order §4 (fresh, blind readers)
**Type:** open-source
**Phase/Area:** keeping two parallel readers blind to each other

**Issue:** The first reader's report was kept outside the working folder, but its findings were then summarised into the handoff note inside the working folder while the second reader was still running, and the second reader's brief told it to read the project's notes. It was caught and the note set aside until the second report came in; nothing showed the second reader had read it.
**Suggested improvement:** While any blind reader is running, write nothing about another reader's findings anywhere in the folder it reads — the handoff note included; keep reports and notes on them in a scratch folder outside it until every reader has reported.
**Principle:** Blindness covers every copy and summary of a report, not only the report file; anything the reader can open is visible.

### Observation 853: A handoff block's times were written from memory and were wrong twice in one night
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Rules 2 (a time read from the clock or its commit, or the commit named instead) and `.claude/skills/overnight/SKILL.md` step 8 and Part 2's compaction note; with 873, 892
**Date:** 8 Nov 26
**Session context:** Chat 3's pictures round (D1747), run unattended overnight; numbered past 852, which other open branches hold.
**Skill:** session-handoff (and the overnight guide's "save the state at every step")
**Type:** open-source
**Phase/Area:** writing the progress lines of a handoff block during a long run

**Issue:** The block's progress lines carry a time each. Three were written as guesses and had to be corrected against the clock in a commit of their own; later the same night a fourth line said 01:50 for a commit the log shows at 01:35. Nothing failed, but a reader who times the run, or compares it with another chat's block, is misled, and nothing in the step catches it.
**Suggested improvement:** In the handoff guide's step that writes a progress line: take the time from the clock in the same command that writes it (the shell's date, or the time of the commit the line describes), never typed; the line names which ("01:35, the page's commit").
**Principle:** A time in a record is a measured fact; read it from the clock or the commit at the moment of writing, the same as any other number a later reader will rely on.

### Observation 854: A walk of a window that opens on a filtered view must press the view that shows everything
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/walk-scripts.md` §2 The walker's brief: a window that opens filtered names its opening view and the one showing the walk's own changes
**Date:** 8 Nov 26
**Session context:** the night of 7–8 Nov 26 (/overnight, 9 hours), reported by its job helpers
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — the walk briefs

**Issue:** Job 3's walk of the change history saw nothing at first: the window opens on "New to you", and the changes the walk made were not new to the walker; it had to press "All changes" to see them.
**Suggested improvement:** Each walker's brief names the filter or tab a window opens on and the one to press to see the walk's own changes.
**Principle:** A view that opens filtered can hide exactly what the test just did; name the unfiltered view in the walk's steps.

### Observation 855: Measure the step times before calling a CI job hung
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, the intermittent-stop bullet: step times of recent runs read before a check is called hung
**Date:** 8 Nov 26
**Session context:** the night of 7–8 Nov 26 (/overnight, 9 hours), reported by its job helpers
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — the jobs; any job about a slow or stuck check

**Issue:** The backlog item said the Tracker's smoke test "hung 16 minutes" on 5 Nov 26; the job measured GitHub's step times over 20 runs and found 12.3 of the 16 minutes were the browser install's system download, slow in 9 of 20 runs, and two older stalls of 62 and 43 minutes before the smoke.
**Suggested improvement:** A job about a slow or stuck check first reads the step times of recent runs (`gh run view <id> --json jobs`) and names the slow step before setting limits or blaming a test.
**Principle:** A label from one failed run is a guess; the step times across many runs say where the time goes.

### Observation 857: The coordinator accepted a job's report without checking each reader the night's plan named
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 2, the report bullet: each reader the block names ticked against the report before it is accepted
**Date:** 8 Nov 26
**Session context:** the night of 7–8 Nov 26 (/overnight, 9 hours); found while writing the morning report
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — the coordinator checking each helper's report; Part 3's "before sending the morning report" check

**Issue:** The night's plan named two readers for every job (a fresh, blind Opus reader and Astra). Job 4's helper ran only the Opus reader, said so in its pull request, and did not put the job on the reads-owed list; the coordinator accepted the report without comparing its readers to the plan, and the gap surfaced only at the morning check. Astra's read was then run in the morning.
**Suggested improvement:** In Part 2, when a helper's report arrives, the coordinator ticks each reader the plan's block names for that job against the report before accepting it; a missing one is run then, or the job goes on the reads-owed list in the same change. Each job's brief lists its readers as a checklist the helper's report must answer one by one.
**Principle:** A plan's named checks are verified against each result as it arrives, not at the end; a check the helper silently left out reads like a check done.

### Observation 856: A key held down was never pressed by a keyboard walk — the reader found it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §7.4 (a press that moves the keys is walked with the key held as well as pressed once); the design guide's §2 keyboard half is left to group B
**Renumbered:** written as 850 on the board-keys branch; renumbered 856 when main came in on 8 Nov 26 (851 and 852 were live, 853 to 855 held by other branches)
**Date:** 8 Nov 26
**Session context:** the board-keys job of the night of 7–8 Nov 26 (`claude/board-keys`); numbered past the 849 another open branch holds
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md`) — the walk of a keyboard change
**Type:** open-source
**Phase/Area:** §7 the walk; §7.11 lessons — the orders a keyboard walk presses

**Issue:** Two keyboard walks (5 Nov and 7 Nov) pressed Enter, Space and the arrows once each and passed. The fresh code reader then asked what a HELD Enter does: a button pressed by Enter's key-down opens a menu and moves the keys onto its first pick, and the same key, still down, repeats on that pick and presses it — on the live app a held Enter on + Block added a duty block nobody chose. The walk could have found it in one step (Playwright's `keyboard.down` twice sends a repeat) but no list of orders named it.
**Suggested improvement:** in the walk's orders for any change that moves the keys when a control is pressed (a menu that opens on its first item, a window that takes the keys), add "the key held down" beside "the key pressed once"; and in the design guide's §2 keyboard rule, that a repeated key never presses what the first press moved the keys onto.
**Principle:** When a press moves the focus, the key that pressed is still down: a held key's repeat lands on the new focus. Walk the held key as an order of its own.

### Observation 858: A layout drawing made only at the owner's own screen width missed that the option breaks on smaller desktops
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): MOCK §Judging new bullet "A change that takes or gives width" (drawn at the narrowest desktop width and about 1280, its narrowest column measured, the cost in the recommendation)
**Date:** 8 Nov 26
**Session context:** the pictures round (chat 3); his follow-up on question 8, "how would 8 look like for a smaller screen if i choose A". Numbered past 855–857, which other branches hold.
**Skill:** brainstorming (`mockups-on-the-real-app.md`) and the pictures-round brief
**Type:** open-source
**Phase/Area:** drawing a layout change on the running app — which screen sizes to draw it at

**Issue:** A change that makes a table give up room for a side window was drawn only at the owner's PC width (1536) and his phone. It looked fine there. Asked about a smaller screen, the same drawing at 1280, 1024 and 821 showed the table crushing one column to a single letter, because the table's other columns had fixed widths. Drawing it at the narrower widths also showed the table was already broken below about 950 wide with no window open at all. The recommendation shown to him had named only the cost at his own width.
**Suggested improvement:** In the mock-up guide's rules for drawing a change that alters widths or makes room (a side panel, a window that pushes content, a column added or narrowed), draw it at the narrowest width that still gets the desktop layout and at one laptop width (about 1280), as well as at the owner's own sizes. Measure the narrowest column at each width. Put that cost in the recommendation, or draw a safe version, before the page goes to him.
**Principle:** A layout option is judged at the edges of the range it will run in, not only at the size of the person reviewing it. A fixed-width table that fits one screen can collapse on the next size down, so draw and measure at the narrowest width each layout covers.

### Observation 859: A sweep for what a new ruling leaves behind missed the guides outside a hand-picked list
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [RULE-FILE-LESSONS] (a), new: the D201 sweep searches every Markdown file by subject and names its search — record-decisions.md, not drafted here
**Date:** 8 Nov 26
**Session context:** chat 2 recording his answers D1760–D1762 (who reads a plan and a guide change) and bringing older text in step (D201); numbered past 857–858, which other open branches hold
**Skill:** New skill candidate: ruling-sweep (the D201 step of recording a ruling)
**Type:** open-source
**Phase/Area:** finding every place an older rule is still stated

**Issue:** the sweep for "who reads a guide change" searched a hand-picked list of files (the rule files, the project guide, the bug-check order, the Codex guide). Both blind readers then found four more guides still stating the old readers — two vendoring notes under the skills folder, the design guide, the agents' bridge file — and a backlog item. A chat following any of them would have called the wrong reader.
**Suggested improvement:** the D201 sweep searches every Markdown file in the repo by the rule's subject (archives and full-text rulings excluded), not a list chosen from memory, and its brief to the readers names the search it ran so they can widen it.
**Principle:** a search for stale statements of a rule must cover every place a rule can be written, chosen by the search itself, never by the writer's memory of where rules live.

### Observation 860: A ruling that changes the rule for one of two named parties dropped a safeguard for the other
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [RULE-FILE-LESSONS] (b), new: a ruling changing one party's rule is rewritten clause by clause — DECISIONS.md's step 2, not drafted here
**Date:** 8 Nov 26
**Session context:** recording D1770 (one of two reviewers made standing again; the other left on call) across a rules page, two always-loaded rule files and a guide
**Skill:** New skill candidate: recording a ruling (the steps at the head of DECISIONS.md)
**Type:** open-source
**Phase/Area:** step 2 — fixing what the older ruling left behind (D201)
**Reference file:** raptor-port/docs/superpowers/briefs/2026-11-08-d1770-placed-read.md

**Issue:** The new ruling changed one reviewer's role. Rewriting each line about "the reviewers", the writer re-stated the safeguards for the named reviewer only — "a job he could not read goes on the owed list" — and silently dropped the same safeguard for the other, unchanged one; it also left lines elsewhere that still described the old arrangement as current. Both blind readers caught it, in five files.
**Suggested improvement:** Before rewriting the lines a narrowing ruling touches, list every clause of the old line (each party, each safeguard, each window or date) and mark for each: changed by the new ruling, or carried over unchanged; a rewritten line must still carry every "unchanged" clause. Then search for the subject (not the number) across every file that states it, including guides another branch is rewriting.
**Principle:** A rule changed for one party must be rewritten clause by clause; a rewrite from the changed party's point of view drops what the others kept.

### Observation 861: Parallel build chats proposed to him on his phone could not be opened — the app starts no chat over Remote Control, even on his own message
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (memory): `_memory/additions.md`: new note side-chats-start-only-from-his-pc (the app opens a side chat only on a message he types at the PC; offer helpers in the same message)
**Date:** 8 Nov 26
**Session context:** chat 3, the pictures round's build: after his answers he agreed to five parallel build chats ("Yes, both": merge the plan, then start them), on his phone.
**Skill:** New skill candidate: running a build as parallel chats (the day-time cousin of overnight's Part 2); cites the closed Observation 715
**Type:** internal
**Phase/Area:** starting side sessions

**Issue:** The app refused all five starts three times: first on a turn a finished background wait had woken (as Observation 715 found overnight), then on his own reply "Start them" sent from his phone — over Remote Control the app opens no chat at all. He had to go to his PC and type the go there; the five started at once. Nothing was lost, but he was asked twice and had to move.
**Suggested improvement:** Guard: when a plan proposes parallel chats, say in the same message that the app can open them only on a message he types at the PC, and offer the other way at once — helpers inside this chat (D1416) — so he chooses before the work that precedes the starts. Never put the start on a turn that a background wait or timer will wake.
**Principle:** Before promising a delegation step, check which surface the user is on and whether the host allows that step from it; offer the fallback in the same breath as the plan.

### Observation 862: A side session on the rules engine reaches three-quarters full before its first commit
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4, the brief-for-another-chat bullet: rulings named by number and sections, the first area file loads its whole page, the side chat commits its block after its first change
**Date:** 8 Nov 26
**Session context:** chat 6, the pictures round's group 4 (D1786) — an engine change started as a side session (numbered past 861, the highest on any pushed branch)
**Skill:** New skill candidate: side-session-briefing
**Type:** open-source
**Phase/Area:** starting a delegated build session

**Issue:** The session reached 75% of its context window after about twenty tool calls, before any commit: opening one engine file loaded every scheduler-area rulings file and design rule set by path (well over 100 KB), on top of the always-loaded rules. The save-state warning arrived when the build had only one change in it.
**Suggested improvement:** A brief for a side session names, up front, the slices it needs (the full rows by number, the exact sections), and the session commits its handoff block after its first change rather than at the first warning; the starting session warns its children that opening an area file costs that area's whole rulings load.
**Principle:** In a repository whose rules load by file path, the first file a delegated session opens can cost most of its context; a delegated session should save its state early and read by slice.

### Observation 863: A code reader's proof test, written into the shared checkout, swept into the builder's commit
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §4 "Before a brief leaves", new bullet (a code reader's proof tests go in its scratch folder; staging while helpers work pointed to the dispatching guide's "Stage by explicit path" — the Opus reader's size cut)
**Date:** 8 Nov 26
**Session context:** chat 6, D1786 (a day with nothing entered starts at the default rally): a fresh, blind Opus reader ran as a subagent in the same worktree while the builder fixed the other readers' findings
**Skill:** New skill candidate: none — the bug-check order's reader brief (§4) and the one-checkout note; met again after Observation 648 (closed)
**Type:** open-source
**Phase/Area:** committing while a helper works in the same checkout

**Issue:** The reader wrote a throwaway proof test (a deliberately failing one) under the app's source folder; the builder's commit staged that folder whole (`git add -A <dir>`) and took the file in. Caught only because the reader reported it; had the branch been pushed, the pull request's run would have gone red on a test nobody meant to keep.
**Suggested improvement:** Two guards, both unconditional: (1) every code reader's brief says where proof tests go — a name the repo ignores (for example `*.reader-tmp.test.*` in `.gitignore`) or the reader's own scratch folder — never a plain test name under the source folder; (2) while any helper works in the checkout, the builder stages by named paths only and reads `git show --stat HEAD` before pushing.
**Principle:** A helper sharing the checkout writes files the builder did not make; a whole-folder stage turns them into the builder's commit. Give helpers' throwaway files a name the repository ignores, and stage by name while they work.

### Observation 866: A "nothing happened" check that reads a value which is never set passes whatever the app does
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §4 "A negative assertion first asserts that its subject exists" (the read calibrated on a state where it did happen; shown, never merely present; a press by position brings its target into view)
**Date:** 2026-11-08
**Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — OIL Earn on the Scheduler Board (D1783: a tap on a puck that cannot earn picks nothing). Numbered past 865, the highest on the other branches.
**Skill:** New skill candidate: none — the walk-script and drawing-check method (`raptor-port/docs/walk-scripts.md`, `raptor-port/scripts/drawcheck/`), and the bug-check order's §8 (tests find rather than confirm)
**Type:** open-source
**Phase/Area:** writing an assertion that something did NOT happen (nobody picked, no window opened)

**Issue:** Two checks in one job proved "nothing happened" by reading something that never changes. (1) The drawing check's "the tap picked nobody" step read `window.SELID`, a name that does not exist in the built app; it was always undefined, so the step passed even on the build where the tap visibly picked the man blue. The same name had been written into the walkers' brief. (2) Two unit tests proved "the ALL AVAIL window opened" by finding its frame on the page; the frame is always there, hidden, so "opened" was always true. Both were found only because a reproduction on screen disagreed with a green check. They were fixed by reading the mark the app draws (`.puck.sel` on the board) and the frame's shown state (`.availwin:not([hidden])`).
**Suggested improvement:** In `walk-scripts.md`'s rules for a step's assertion, and in the bug-check order §8: every assertion of absence ("nothing picked", "no note", "not opened") is first run once against a state where the thing DID happen (a positive control: tap an ordinary puck and see the same read report it picked), and the step names that control. A read of a global, a frame or an attribute that never changes value across the two states fails the step.
**Principle:** A check that something did not happen is only evidence if the same check, run where it did happen, says so; run the positive case once before trusting the negative.
Met again 8 Nov 26 (chat 5, the host's re-walk): a press made by screen position on a switch scrolled off screen landed on nothing, so the check failed on the fixed build and the old build alike — the calibration run caught it only because the row also printed the switch's state ("switch off"). Guard: a press by position first brings its target into view, and the row prints the press's own effect beside the result it measures.
Met again 8 Nov 26 (chat 5, the walk): a check that a window had opened looked for the ALL AVAIL window's frame, which is always on the page and only hidden, so it read "open" whatever the app did. Guard: a check that something appeared reads whether it is shown (its size, or the property that hides it), never whether it exists.

### Observation 870: A blink counted "gone" by the page's own frame log was still there in the painted frames
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 new line "What is on screen is counted on PAINTED frames" (never only the page's own frame log; the deciding frame named and opened)
**Date:** 8 Nov 26
**Session context:** chat 8 — measuring D1789's fix (the Leave War's pinned dates row and Quals' heading drawn in the same frame as the scroll) before and after; numbered past 865, the highest on any branch at 10:00, 866–869 left for the sibling chats writing tonight
**Skill:** walk-scripts (project guide, not a skill file) — measuring a visual change's frames; verification-before-completion
**Type:** open-source
**Phase/Area:** measuring frames before and after a change to what is drawn while scrolling
**Reference file:** raptor-port/docs/handpass/2026-11-08-lw-group6.md §The frames

**Issue:** The speed helper counted the frames in which the pinned row was missing from a log the page's own code kept, read on each animation frame. Before the fix it counted 2, after it 0, and the evidence sheet and the speed ledger said "the blink is gone". The walker's painted-frame sheets (a screencast of what the browser actually painted) showed one frame still missing after the fix — the desktop wheel 2 → 1, a phone flick 1. The browser moves and paints a scroll before the page's code hears of it, so a log kept by that code can never see that frame. The walker itself also judged the desktop case a PASS; the host's own look at the painted frames overturned it.
**Suggested improvement:** In the walk-scripts guide's part on measuring frames, say that a glitch tied to scrolling or the compositor is counted on PAINTED frames (a screencast or a recording), never only on a frame log kept by the page's own code; the page's log may stand beside it for timing, not for "is it on screen". Name the frame the decision rests on in the evidence sheet, and have the host open it.
**Principle:** A measurement taken by the code under test can only see what that code sees. When what matters is what the screen showed, measure the screen's own output, and treat a count of zero from inside the page as unproven.

### Observation 871: Code that runs only when a box has a size was never run by tests drawn without layout
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` RED, the device-specific paragraph: a change behind a guard the test environment trips gets the sizes and features, and fails on the framework's warnings; GREEN: a new flag's every caller listed
**Date:** 8 Nov 26
**Session context:** chat 8 — D1789's fix to the Leave War's pinned dates row and Quals' heading; Astra's code read found the setup path broken
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the failing test for a change behind a layout guard

**Issue:** The fix added an "instant" flag for calls from the scroll listener and a comment that the effect's own call keeps the old route. The effect's last line called the listener itself, so it took the instant route too, and React refused it on every setup. The unit tests never saw it: the test environment has no layout, every box measures 0, and the code returns early on a 0-height box — so the pinning code never ran in any unit test. Only the browser tests ran it, and they do not fail on a warning. A reader running the effect with given box sizes found it at once.
**Suggested improvement:** In the skill's "write the failing test" step: when the changed code sits behind a layout or feature guard (a 0-size box, no matchMedia, no ResizeObserver), the test gives the sizes and the feature so the changed lines actually run, and it fails on the framework's own warnings for the path (a spy on console.error), not only on the result. Before writing, list every caller of a function whose behaviour now depends on a new flag, including callers through an alias.
**Principle:** A test proves only the lines it runs. Code behind a guard that the test environment always trips needs the guard's conditions supplied, or the test passes without testing anything.

### Observation 872: A chat number given in a starting brief was already taken
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: a chat number is a hint, checked against main's handoff before use
**Date:** 8 Nov 26
**Session context:** the rules diet's step 5a (OIL as a page), a session started by another session with "this chat is number 5"
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the opening line / a started session's brief — naming the next chat's number

**Issue:** the starting session wrote "this chat is number 5" from its own reading of the handoff, but a parallel session had already given 5 to a build chat (and held 10 and 11) in a commit made minutes before; the started chat found the clash only by reading the newest handoff on the main branch. (Numbers 862 to 871 were taken by other branches; this note was renumbered 863 → 864 → 872 at the merges.)
**Suggested improvement:** in the handoff skill's opening-line step and in any brief for a started session, give the number as "the next free number in the handoff on main when you start (was N at <time>)", and have the new chat confirm it against the main branch's handoff before using it.
**Principle:** an identifier handed from one parallel worker to another is a hint, not a grant — the receiver checks it against the shared, newest record before acting on it.

### Observation 864: A side session's auto-loaded rulings filled most of its context before the build began
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4: the same change as 862; its other asks are done (the scheduler page converted, docsize --reads counts a small job)
**Date:** 8 Nov 26
**Session context:** chat 7, a side session started from chat 3 to build one small Inputs-page group (D1787, D1792 b); numbered past 863, the highest on any branch
**Skill:** New skill candidate: side-session-brief (or doc-budget §the every-chat layer)
**Type:** internal
**Phase/Area:** what a chat loads at its start, and the brief a parent session writes for a child

**Issue:** Opening the first source files of the Inputs page loaded the inputs, scheduler and design rulings files, the seam file and the guides by themselves; with the brief, the plan and the drawings read, the chat stood at about 78% full before a line was built, and had to compact twice in a small job. The scheduler file alone is long and governs only its tail of rulings here.
**Suggested improvement:** The rules diet's measure step counts what a small one-area job loads before its first edit; a brief from a parent session names the rulings the job needs by number, so the child can work from those full rows; the scheduler's page conversion goes ahead of the Inputs page's, as the larger cost.
**Principle:** What loads by itself must be sized against the smallest job that triggers it, not the largest: a small job that pays the whole area's reading cost loses most of its room to it.

### Observation 865: A browser test on today's clock found an empty list and failed its own setup
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (r), added: the Inputs list's browser tests open on every date (met twice); the TDD guide's premises line gains the date-windowed row
**Date:** 8 Nov 26
**Session context:** chat 7, the Inputs list's new browser test for a dragged input window (D1787)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing a browser test's setup

**Issue:** The new test opened a row of the Inputs list to reopen the window. The list shows a date window starting today; the test ran on the real clock, whose fortnight held no demo inputs, so the row was missing and the test failed on its setup, not on the app. The first green run was lost to it. Earlier tests of the same file had widened the dates or set the clock; the new one copied a neighbour that did not need rows.
**Suggested improvement:** In the skill's "write the failing test" step: before a test acts on rows of a date-windowed list, it fixes the dates (sets the clock, or widens the list's range) and asserts a row exists, so a red run means the app, not the fixture.
**Principle:** A test whose setup depends on today's date is a different test every day; pin the date or widen the window, and assert the premise before the check.

met again 8 Nov 26: chat 7's D1840 follow-up — a new check of the Type column's pills in the same "D1787 at <width>" test found no rows (today's clock, the demo fortnight in July) and failed its own setup; fixed by showing every date first. Guard proposed: a browser test that measures the list's rows asserts a row is visible before measuring, and the Inputs list's test helper opens on every date by default.
### Observation 873: Time stamps written into a handoff from the agent's sense of elapsed time ran up to two hours ahead of the clock
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Rules 2 and `.claude/skills/overnight/SKILL.md`: the same change as 853
**Date:** 2026-11-08
**Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — the close of OIL Earn on the board, across five compactions
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** writing the "where it stands" lines of a handoff block as the work goes on

**Issue:** Each line the chat added to its handoff block carried a time ("~11:20", "~12:30", "~12:45"), written from a feel for how long the work had taken. After the sixth compaction the clock read 11:16 and the commits showed the lines had run ahead by 20 minutes to two hours. A later chat that orders events by these times, or a person told "merged at 12:45", is misled; the error grew with each compaction, since a compacted chat has no sense of the time that passed.
**Suggested improvement:** In the handoff step (and wherever a record takes a time): read the clock (`date`) or the commit's own time before writing a time, never estimate; where a time cannot be read, write none.
**Principle:** An agent has no reliable sense of elapsed time, least of all across a context reset; any time written into a record is read from a clock or left out.
### Observation 880: Red first for a style-only fix, in the same lock turn as the green run
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` RED, "Proving an existing fix red": a committed fix's own diff taken back by `git apply -R`, checked, restored in a trap, one lock turn
**Date:** 8 Nov 26
**Session context:** chat 7, the D1843 build (a line round the desktop Inputs list, "No document" inside its column) — a two-rule stylesheet change, its browser test to be shown failing on the old look first. Numbered past the open branches' 878.
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** RED — watching the test fail, when the build is shared and taken in turns

**Issue:** the fix was already written and committed when the test was, and every browser run rebuilds the app under one lock shared with other chats; showing it red meant either two lock turns (revert, run, wait, restore, run) or skipping the red. One script taken under one lock turn did both: it reverse-applied ONLY the fix commit's own diff to the stylesheet (`git diff <fix>~1 <fix> -- <file>`, then `git apply -R` from the repo root — so whatever a merge of main brought into the same file stays), checked the file really changed, ran the new test (want failure), restored the file from a copy under a trap on exit and signals, then ran the new test with its neighbours (want pass), then the pictures on the build the green run left.
**Suggested improvement:** in the skill's RED section, a short case: "code written before the test" — reverse-apply the fix's own diff to get the old behaviour, assert the file changed, run red, restore under a trap, run green, in one run of the shared resource."
**Principle:** when the fix came first, recreate the old behaviour by taking back only the fix's own diff — never by checking out an older file — prove the take-back happened, and restore it by a trap, so the red run costs no second turn of a shared resource and cannot leave the old code behind.


### Observation 875: A drawing with recorded figures but no part list — measure the build with the drawing script's own measure
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §10 new bullet "Reuse a drawing script's own measuring function, copied whole, for the measures it already covers" (the part list and every safeguard kept) and BCO §7.0's drawing-check line (saved figures help prepare the part list and record; they never replace the D1495 checks) — after the two 
**Date:** 8 Nov 26
**Session context:** chat 11, the board's layout (D1780, D1781) — the drawing check; numbered past 873, held on another branch (Numbered 875 at the rebase on 8 Nov 26: 874 is held by the open branch claude/lw-pin-last-frame.)
**Skill:** New skill candidate: drawing-check-from-figures (or a section of `raptor-port/docs/walk-scripts.md` §10)
**Type:** open-source
**Phase/Area:** the drawing check before the walk (bug-check order §7.0, §7.10)

**Issue:** The approved drawings had been made by a script that measured each drawn option and saved the figures (line
heights, widths, what was cut) to a file, but no part list existed for the standing drawing-check tool. Writing a part
list first would have cost a separate job; instead the build was measured with the drawing script's own measuring
function, copied whole, and compared figure by figure (78 figures, 2px). It caught nothing false and named the one real
difference — a state the drawing showed scrolled while the build, rightly, does not scroll.
**Suggested improvement:** In the walk-scripts guide's drawing-check section, add: where a drawing was produced by a
script that saved its measured figures, the drawing check may reuse that script's measure (copied whole, never
rewritten) against the saved figures, in place of building a part list first; each difference is still named.
**Principle:** When a design was drawn by code that measured itself, compare the build with the same measuring code —
the same ruler on both sides removes a whole class of false differences.

### Observation 876: A pin that goes red or green by the machine's pace was handed over as "unexplained" — slow the processor to reproduce it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 2: a press during an animation re-run at slowed processor speeds, then pinned by a pace-free check (squared with the existing "slowing reproduces nothing" line for two driver actions)
**Date:** 8 Nov 26
**Session context:** chat 10, the Tracker's group 7 — fixing the one red browser check chat 9 left (a double-click during the chart's slide); 872 is taken on another branch, so this one is 873 (was 873. Renumbered by chat 10 at bringing `main` in, 8 Nov 26: chat 5's 866 and 873 reached `main` first, and 874 is taken on `claude/lw-pin-last-frame`.)
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** reproducing a timing-dependent fault before guessing at a cause

**Issue:** The check was red in the previous chat's full run and green in this chat's first probes at every click gap tried, so it looked fixed or flaky. Slowing the page's processor to half speed (the browser's own CPU throttling) made it fail every time, and a per-frame log then showed the real cause in one run: a child element with its own "takes presses" setting ignored the parent's "no presses" — neither of the two suspects handed over. The suite's pace alone had decided whether the fault showed.
**Suggested improvement:** In the reproduce phase: when a fault involves a press, key or frame during an animation or scroll and does not reproduce, re-run it at two or three slowed processor speeds before calling it flaky or fixed; once found, add a check that proves the cause whatever the pace (here, hit-testing every element mid-animation), beside the end-to-end check run at a slowed pace.
**Principle:** A timing fault that a test catches only on some machines is still a fault; slow the clock down to make it certain, then pin the cause with a check that does not depend on timing.

### Observation 877: A merge approval relayed in another session's brief is refused by the safety check — the merging chat needs his word typed there
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: the app's safety check judges who typed his merge word, even where his standing word covers the chat (D1796); the chat he said it in merges, or the brief says it will need his word typed there and he is told now (the Opus reader's O5)
**Date:** 8 Nov 26
**Session context:** Chat 10, a side session started by chat 9 to fix the Tracker's last red check and carry chat 9's "merge live" through to the live app (was 874. Renumbered by chat 10 at bringing `main` in, 8 Nov 26: chat 5's 866 and 873 reached `main` first, and 874 is taken on `claude/lw-pin-last-frame`.)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** handing a job that already holds the owner's merge approval to another chat (a side session's brief, or the next chat's opening line)

**Issue:** The owner typed "merge live" in chat 9. Chat 9 started chat 10 as a side session and wrote the approval into its brief, with the time and his words. Chat 10 fixed the red check, got the run green, took the merge lock and found the branch level — and the merge command was refused by the app's auto-mode safety check ("merge without review"): a brief written by another session is not the owner's message, so the approval did not count. The lock was released and the job stopped to ask him again, a round-trip the plan had not allowed for.
**Suggested improvement:** In session-handoff (and wherever a job is passed on with an approval attached): say plainly that an approval does not travel in another agent's text. Either the chat that received the approval does the merge itself, or the new chat starts from an opening line the owner pastes himself (his own message), with the approval in it — never from a side session's brief alone. If a side session must merge, say so in the brief and warn the owner that he will be asked once more there.
**Principle:** A permission given to one agent is not carried by that agent's message to another; automated guards judge the speaker, not the quoted words. Plan the step that needs the approval to run where the person gave it, or have the person repeat it where it will run.

### Observation 878: A helper's "the code is unchanged since commit X" must be checked before its build label is believed
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4, "And the reader's half": a helper's check that builds is handed a commit, and its label checked before its result is quoted
**Date:** 8 Nov 26
**Session context:** chat 9, the Tracker's group 7 — the drawing check run by a background helper while the host fixed the readers' findings (numbered past 865, the highest on any branch) (was 866, then 875. Renumbered by chat 10 at bringing `main` in, 8 Nov 26: chat 5's 866 and 873 reached `main` first, 874 is taken on `claude/lw-pin-last-frame` and 875 on `claude/pr-board-layout-62eb71`; moved to the end.)
**Skill:** subagent-driven-development
**Type:** open-source
**Phase/Area:** taking a helper's result — what build it measured

**Issue:** The drawing-check helper labelled its measured build "the branch at 7d750640e" and wrote that the app's code was unchanged between that commit and the tip, so it built from the working folder. Two commits since had changed the code, and the host's fixes were landing in the same folder while it built; its build matched neither commit. The numbers happened to hold (the fixes did not move what it measured), but the label was false. Separately, the check script can measure only a part that is drawn, so a part meant to be gone on both sides read as a red "not found".
**Suggested improvement:** In the step that takes a helper's result: when a helper names the commit it measured, run `git diff --stat <its commit> HEAD -- <code folder>` and compare the build's time with the commits' times before quoting it; where the code moved under it, re-run the cheap part (build + check) on a fixed commit. In a helper's brief for any check that builds: "build from a named commit (a `git worktree` or `git archive`), never from the live folder while the host is editing".
**Principle:** A measurement is only as good as the label on what was measured; a helper working beside an editing host must pin its input to a commit, and the host verifies the pin rather than the helper's word.

### Observation 879: A blind reader told to find related rules "by name" misses the ones that change the subject
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", a new bullet: a conformance read searches related sources by each claim's subject, not the document's name
**Date:** 2026-11-08
**Session context:** chat 15, the rules diet's step 5a on the IT flow guide — two blind readers checked that a rewritten rules page still carried every part of its rulings and pointed to every other area's ruling that bears on it (first written as 878 past 873–877 on other open branches; renumbered 879 when `main` was brought in, where chat 10 had taken 876–878)
**Skill:** requesting-code-review
**Type:** open-source
**Phase/Area:** writing the reviewer's brief — what the reviewer searches beyond the change itself

**Issue:** the builder's account and the brief both searched the other areas for rulings that bear on the guide by the guide's own name; only two rulings named it. One reader, searching the same way, found nothing more; the other found the most serious gap of the step — a later ruling that changes what the guide pictures (full editing on another screen) and a second that sets a preferred order, neither naming the guide. The page had stated the old behaviour as current.
**Suggested improvement:** in the brief template for a conformance read (a summary, a page, a port checked against its sources), add a line: "search related sources by the subject of each claim — the actions, screens and terms it names — not by the name of the document under review; a later rule that changes a subject rarely names every document that describes it."
**Principle:** dependencies are found by topic, not by title — a check that searches only for references to the artefact misses the changes to what the artefact describes.

### Observation 881: A later ruling says "narrows Dx" in its own row, but Dx's row carries no mark — the change check cannot see it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (k), added in `_docs/OUTSTANDING-items.md`: the change-mark check reads every number after a change verb and runs once over every live row
**Date:** 8 Nov 26
**Session context:** chat 17, the rules diet's step 5a — People & accounts as a page (numbered past 880, held by two open branches)
**Skill:** New skill candidate: rules-diet page conversion
**Type:** open-source
**Phase/Area:** drafting a page from its rulings; the change-mark check

**Issue:** D1651's own meaning cell said "Narrows D1510 and D149", and D1510's row carried the mark, but D149's did not (nor D218's, which still listed SCHEDULER as a member's). The document check follows only the marks written in the older row, so it asked for nothing; the page's drafter found the gap only by reading every row sentence by sentence.
**Suggested improvement:** in the rulings check, for every row whose meaning cell says "narrows / replaces / answers D<n>", require D<n>'s row to carry a mark naming it (or list it as owed); until then, every conversion's account checks each such sentence against the older row.
**Principle:** a link recorded on one side only is invisible to a check that reads the other side — when a record can be changed from either end, check both ends agree.

### Observation 882: A new text-fit browser test was checked only in this PC's letters and went red on the CI's Linux machines — the trap of Observation 680 met again
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): TOOLS addition (f) (a unit check that flags a new text-width browser test with no pinned letters — the trap met twice); BCO §7.2 wider-letters line sharpened to say so
**Date:** 8 Nov 26
**Session context:** Chat 18 taking over chat 7's merge of the Inputs list's right-end line (D1843); GitHub's run of the pull request red on the new test. Numbered 882 because 881 is already taken on another branch.
**Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md` §7.2) and `raptor-port/docs/gates-and-deploy.md` (§A geometry test red on GitHub's Linux machines only)
**Type:** open-source
**Phase/Area:** writing a browser test that measures text against a fixed width, before its first push

**Issue:** A new browser test asserted that a short label ("No document") ends inside a fixed-width table column, with a 0.5px tolerance. It was written, proved red-then-green and pushed on a Windows PC only. On the CI's Linux machines, whose fallback sans-serif is much wider, the label overflowed the column by 3px at every width, so the test failed at all five widths and the merge stalled until the next chat diagnosed it. The same trap was met and documented on 23 Oct 26 (Observation 680, now ACTIONED: the gates guide says to rerun with wider letters forced from the first paint), and the repo already had a pattern for it — two tests pin Arial / Liberation Sans so a fit is measured in letters close to the owner's devices on every machine. The documented step was not taken, because nothing in the act of writing such a test calls for it.
**Suggested improvement:** Make it a default rather than a judgement: in the bug-check order §8 (writing the tests) and the gates guide's trap, "a new browser test that asserts text fits a fixed width pins its letters from the first paint (Arial, Liberation Sans) unless the test is about the device's own letters; and before its first push it is run once with wide letters (Verdana) in that place, where it must fail only if the layout itself is too tight." A cheaper guard still: a unit check over `e2e/*.spec.ts` that flags a new `getBoundingClientRect` text-width assertion in a test with no pinned font — filed for the next review to weigh.
**Principle:** When a system draws text in whatever font each machine has, every assertion about text width is an assertion about one machine's font. Pin the font the assertion is about, from the first paint, and prove the test both ways (fails on the old layout, passes on the new) in that font — otherwise the first other machine finds the gap.
### Observation 883: A change of what scrolls breaks every test that names the old scroller, not only its own spec
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §6 new selectors row (what scrolls among the moved selectors; a carried thing held just inside each new edge) — one change with 735
**Renumbered:** 880 on `main` (chat 11, the board layout); renumbered 883 when chat 18 brought `main` into `claude/pr-inputs-add-right-5b2653`, which already held chat 7's 880 (881 is taken on another branch, 882 is chat 18's).
**Date:** 8 Nov 26
**Session context:** chat 11, the board layout (D1780: the sideways board scrolls as one page). Numbered past 878–879, held by other branches.
**Skill:** New skill candidate: bug-check sizing (walk-ledger / the bug-check order §3)
**Type:** open-source
**Phase/Area:** sizing the walk and the local test run before the first push

**Issue:** The change moved a screen's scrolling from an inner pane to the whole surface. Its own new browser spec passed locally and the walk passed, but an older spec in another file set the inner pane's scroll and failed on CI; fixing that test then showed a real fault — the drag's edge band still measured from the old scroller's top, hidden under the newly pinned bar. The walker had held a drag at the foot and over the bar, never just under it.
**Suggested improvement:** When a change alters which element scrolls, the sizing step greps every test and every scroll-reading function for the old scroller's selector and runs those specs before the first push; the walker's brief adds "hold a carried thing just inside each new edge of the visible area" (under a pinned bar, above a pinned foot).
**Principle:** A layout change that moves the scroller invalidates every caller that measured the old one; find them by the selector, not by the files the change touched.

### Observation 889: A notes-only merge is overtaken again and again while many chats merge notes
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1: one notes branch per chat, merged once
**Date:** 2026-11-08
**Session context:** chat 21, the coordinator, merging chat 3's notes-only pull request 695 while five other chats were merging their own (first numbered 887; renumbered 889 on 8 Nov 26 because chat 13's branch had taken 887 and 888 meanwhile — a collision)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the merge of a notes-only pull request (shipping's four merge-lock steps), and the handoff's own notes branch

**Issue:** pull request 695 was level and green, but each time the merge lock was taken the level check said "behind": another chat's pull request (the Inputs page, then its records) had merged during the local document checks or the remote documents run (about four minutes). Each round meant bringing `main` in, the checks again, a push and another wait — and the coordinator's own handoff notes needed a second pull request on top, a third race.
**Suggested improvement:** in the handoff skill's merge step, say: when a chat has more than one notes-only change waiting (an inherited notes pull request and its own handoff block), put them on one branch and merge once; and bring `main` in immediately before the push, not before the local checks, so the window between the level check and the merge is one remote run only.
**Principle:** When many writers merge into one base, every separate pull request is another race against the level check; batch the small ones and shorten the gap between the last sync and the merge.

### Observation 890: A tidy of the shared handoff file makes every open branch clash at once
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 1, another chat's block: open pull requests that change the handoff listed first; leave blocks beside theirs or tell their chats
**Date:** 2026-11-08
**Session context:** chat 21, the coordinator, removed eight finished chats' blocks from the shared handoff file in one notes-only pull request while four chats still had open branches carrying their own blocks in it
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the step that removes merged chats' blocks from the shared handoff file

**Issue:** within minutes three open pull requests (the Leave War pinned row, the Tracker batch, the checks) went to "clashing with main", so GitHub stopped running checks on their new pushes, and each chat had to stop, bring `main` in and settle the handoff file before its merge. The removal itself was right (each block's work was live and its residue filed); its timing cost every open branch a round.
**Suggested improvement:** in the handoff skill's "removes merged blocks" step, add: before removing other chats' blocks, list the open pull requests that change the handoff file; if any are open, remove only the blocks far from theirs, or wait until they have merged — and in either case message each open chat that its next push will need `main` brought in.
**Principle:** A clean-up of a file that every parallel branch edits is a change to all of them; schedule it for a quiet moment or tell each writer before it lands.

### Observation 891: A fresh worktree has no packages, and `npx tsc` then runs a stand-in that fails
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, the four by-hand traps' typecheck line: `npx tsc` with no packages runs an unrelated download; the overnight guide's step 9 already runs `npm ci`
**Date:** 8 Nov 26
**Session context:** chat 25, React Doctor's last findings (part 2), type-checking in a worktree just switched to the branch
**Skill:** New skill candidate: worktree-setup (or the project guide's §Build & verify)
**Type:** open-source
**Phase/Area:** first check run in a new worktree

**Issue:** The worktree had no installed packages. `npx tsc -p tsconfig.app.json --noEmit` did not fail with "not installed": npx fetched an unrelated package named `tsc`, which printed a banner and exited non-zero, so the first type check looked like a broken build until the packages were installed (`npm ci`) and it ran clean.
**Suggested improvement:** Before the first check in a worktree, test that the package folder exists and run the install if not; never read an `npx <tool>` failure as the project's until the tool is known to be the project's own.
**Principle:** `npx` falls back to downloading whatever is published under a name; in a checkout without its dependencies, the tool that runs may not be the project's — install first, then trust the result.

### Observation 893: A FULL check's chat fills before its walk when the area files load into it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §0a step 3 (a FULL check names its chats when its start plus what its area pages will load, measured by `docsize.mjs --reads`, leaves too little room for the walk; unattended, the night stays one chat and compacts at a clean point) and CL step 3 — after the two reads: no fixed 40% (the Opus read
**Date:** 8 Nov 26
**Session context:** chat 26, the FULL bug check of [RD-LEFT-1108] (a no-visible-change tidy-up of People & accounts)
**Skill:** New skill candidate: bug-check sizing (the order's §7.0 and the session-handoff step)
**Type:** internal
**Phase/Area:** planning the check's chats before it starts
**Issue:** The check began at 49% context (the always-loaded rules) and reached 76% before the walk: opening the area page, the order's sections, and editing one test and one evidence sheet loaded the scheduler and screen-design rulings by themselves (their paths match `src/` and the handpass folder), about 100k tokens the check never used. The walk and the four reads had to move to a fresh chat. (Number 892 is taken on another branch; this note numbers past it.)
**Suggested improvement:** In the checklist's step 3 (telling him the plan), name the chats too: a FULL check whose chat starts past about 40% plans two chats from the start — chat A: tier, sheet, roll-call, break tests, scenario brief; chat B: walk, reads, fixes — and chat A hands the scenario designer's report into the repo before it ends.
**Principle:** Count what a job will load by itself, not only what it reads on purpose, when deciding how many sessions it needs.

### Observation 892: Times written into a handoff after a compaction came from the summary, not the clock

*Numbered 881 on `claude/lw-pin-last-frame`; renumbered 892 when `main` was brought in on 8 Nov 26 — `main` holds its own 881.*
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Rules 2 and `.claude/skills/overnight/SKILL.md`: the same change as 853; the guard it asks for is answered by naming the commit instead of a time
**Date:** 2026-11-08
**Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbered 874 → 881 when `main` was brought in, 8 Nov 26 — 874 is also used on another branch)
**Skill:** session-handoff (writing the block's times)
**Type:** open-source
**Phase/Area:** the state written into the handoff block

**Issue:** The block said the measure ran "~03:40–04:05Z" and the preview was looked for "at 04:06Z"; the clock read 03:36Z and the results files were written 03:29Z and 03:33Z. The times were carried from the compaction summary's guesses, and a next chat reading them would have mis-ordered the work against other chats' commits.
**Suggested improvement:** In the handoff skill's block-writing step: every time or date written into the block is read from the clock (`date -u`) or from the file or commit it names, at the moment of writing, never carried from memory or a summary.
**Principle:** After a compaction, a time is a fact to look up, not to remember; read it from the clock or the artifact it describes.
Met again 2026-11-08, the same chat ten minutes later: "04:00Z" and "03:50Z" written from memory for what the clock and the files put at 03:45Z and 03:42Z — a guard is wanted (the block's writer reads `date -u` itself), not more care.

### Observation 884: A frame count at a threshold hid the change; the raw intervals and a switch-off run told it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 new line "A frame measure keeps every raw interval" (the display's refresh interval established and buckets reported around its multiples, the boundaries stated — 20 / 34.5 / 50 ms the recorded 60 Hz case only; a repeat; the suspect switched off for one comparison — Astra's A9)
**Date:** 8 Nov 26
**Session context:** chat 16, [LW-PIN-LAST-FRAME] (D1870) — re-measuring a pinned row after a CSS scroll-timeline change (numbered past 883, held on another branch)
**Skill:** New skill candidate: measuring-scroll-performance
**Type:** open-source
**Phase/Area:** the before/after frame measure

**Issue:** The measure counted frames "over 33.4 ms" — the exact edge of two screen refreshes — so a frame landing a tenth of a millisecond either side flipped the count, and the before/after medians looked like noise (4 → 17). Pooling every run's raw intervals into buckets (under 20, one refresh skipped, 34.5–50, over 50) showed a fivefold rise in skipped refreshes; a second run with only the suspect style switched off (injected CSS) showed the cost was that one rule, and three cheaper variants were ruled out in minutes. One run's "the page works a third less" did not repeat.

**Suggested improvement:** A frame measure records every raw interval, reports buckets around each refresh multiple rather than one threshold count, repeats the run before believing a total, and diagnoses by switching the suspect rule off for one run before any fix is written.

**Principle:** A threshold placed on a quantised value measures rounding; bucket around the quanta, repeat the run, and isolate a suspected cause by removing it alone.

### Observation 886: The cure a note recommended for a hang was itself a hang for one interpreter; and a new hook cannot be proved live in the chat that adds it
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, after the worktree-settings paragraph: a hook is not in force in the chat that adds it, how to prove it there, and a refusal's remedy measured per tool
**Date:** 8 Nov 26
**Session context:** chat 19 building [SHELL-SCRIPT-GUARD] (D811) — measuring the shell before writing the guard (numbered past 882, the highest on another open branch; renumbered 883 → 886 on bringing main in, where another chat's 883 had landed)
**Skill:** New skill candidate: writing a command-refusing hook (the conditions of notes 270, 285, 598, 626)
**Type:** open-source
**Phase/Area:** measuring the harness; proving a hook live

**Issue:** A filed note's advice for commands that wait on input was "give every script `< /dev/null`". Measured before building: right for `cat` and `node`, but Python on Windows takes `/dev/null` for a keyboard (`isatty()` True) and opens its interactive prompt, which loops until stopped — the measuring itself hung two minutes on it. Second: the hook settings file is read when a chat starts, so a hook added mid-chat does not run in that chat; a "proof live" there shows nothing.
**Suggested improvement:** In the hook-writing conditions: measure each remedy a note proposes, per tool and interpreter, before a refusal message repeats it; prove a new hook by running the settings file's exact command on a refused and an allowed input (stdin JSON), and leave the in-chat proof to the next new chat, saying so in the handoff.
**Principle:** A workaround recorded once is a claim like any other; measure the cure as well as the fault, in each environment the advice will reach.

### Observation 885: A walk script kept in a scratch folder cannot import the project's browser library
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §2 (a script outside the project loads Playwright by createRequire, run from raptor-port/); its selector half is already WS §2 and §4 (controls from a passing run; press what the app routes)
**Date:** 8 Nov 26
**Session context:** chat 19, a one-off picture for a question to him ([DESIGN-CHECK-GOLD-DOT]); numbered past 884, held by another open branch
**Skill:** New skill candidate: walk scripts (`raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** writing a throwaway browser script outside the repo

**Issue:** A one-off picture script written to the session's scratch folder failed at once with "module not found" for the browser library, though it was run from the project folder: an ES module resolves its imports from the script file's own folder, never from the folder it is run in. Two more runs were lost after it to guessed selectors (a button found by a word in its title matched a hidden tab first) before the script was steered by the real element read from the running page.
**Suggested improvement:** In the walk-scripts guide: a script kept outside the project loads the library with `createRequire(process.cwd() + '/package.json')('playwright')`, run from the project folder; and find a control's selector by reading the running page first (its id at the point pressed), never by a word that may also sit in a hidden control's title.
**Principle:** Module lookup follows the file, not the shell; and a selector guessed from a word is checked against the live page before a script relies on it.
### Observation 887: A pull request that clashes with main starts no checks, and nothing says so
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, new "After a push" bullet (a clashing pull request starts no run); the guard filed as [CHECK-TOOLS-HARDEN] (j); memory stacked-pr-runs-no-checks holds it too
**Date:** 2026-11-08
**Session context:** Chat 13, the schedule's marks and words (pull request 691); numbered past 886, the highest on another open branch.
**Skill:** New skill candidate: shipping-checks (the rule lives in `.claude/rules/shipping.md` §The checks)
**Type:** open-source
**Phase/Area:** after a push — waiting for the pull request's run

**Issue:** Two pushes to an open pull request started no GitHub Actions run — only the preview host's checks appeared. The cause, found only after both: notes-only pull requests merged into `main` meanwhile had made the branch clash (its merge state "CONFLICTING / DIRTY"), and GitHub does not start `pull_request` workflows on a pull request it cannot merge. The same day another chat met it twice ("the pull request had gone into a clash, so its run never started"). Each time the agent first waited for a run that was never coming.
**Suggested improvement:** In `shipping.md` §The checks, beside "read the run list before a push": right after any push to an open pull request, read its merge state (`gh pr view <n> --json mergeable,mergeStateStatus`); CONFLICTING means no run will start — bring `main` in first. Better, a guard: the push hook prints the merge state after the push and says so when it is CONFLICTING.
**Principle:** When a check is expected to start by itself, confirm it started; a missing run is a signal, and the most common silent cause is that the platform refused to build the merge.

### Observation 888: A blind reader that compacts gets the host's handoff pasted in by the start hook
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): new item [READER-COMPACT-HANDOFF] in _docs/OUTSTANDING-items.md (the start hook pastes the handoff into a reader that compacts — a hook change); BCO §4 carries the stop-gap in the readers' brief
**Date:** 2026-11-08
**Session context:** Chat 13 — the final code read, three readers blind to each other; the fresh Opus reader compacted mid-read.
**Skill:** New skill candidate: blind-read (the bug-check order's §4 reads; the compaction start hook)
**Type:** internal
**Phase/Area:** a blind reader's session after its own compaction

**Issue:** The fresh, blind Opus reader ran long enough to compact. The project's compaction start hook then pasted the branch's HANDOFF.md block into it — the host's own record of the walk's fault and its fix, which the reader was meant not to see. The reader said so in its report, so its read was not fully blind (noted in the evidence sheet). Related: Observations 842 (what a start hook injects) and 852 (a blind reader's findings leaking).
**Suggested improvement:** The compaction start hook pastes the HANDOFF block only into the chat that owns the branch — not into a helper or reader session (tell them apart by the session's parent or a marker the reader's brief sets); until then, every blind reader's brief says "if a pasted handoff block appears after a compaction, do not read it, and say so in the report", and the host sizes a read to finish before the reader would compact.
**Principle:** Anything injected into a session automatically can break a reader's blindness; blindness must be guarded where the injection happens, not only in the brief.

### Observation 894: Two walkers fanned out in one folder overwrote each other's helper file
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §2 "Each helper gets its own scratch sub-folder…" sharpened (a file prefix of its own for every file it writes)
**Date:** 8 Nov 26
**Session context:** chat 31, the FULL check of [RD-LEFT-1108] — two Sonnet walkers at once on the same two builds
**Skill:** New skill candidate: fanned-out walk brief (the bug-check order §4's fan-out paragraphs, `docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** the walkers' brief — file names

**Issue:** The brief gave each walker its own ports and picture folder but named only the main script for each. Both walkers made a shared helper library and chose the same name; walker B's overwrote walker A's mid-run, and A lost time finding out why its script broke, then renamed its own.
**Suggested improvement:** In the fan-out brief, give each walker a file prefix of its own for EVERY file it writes (scripts, helpers, scratch output), not only its folder and ports — e.g. `<job>-a-*` and `<job>-b-*` — and say "write nothing outside your prefix and folder".
**Principle:** Parallel workers in one working folder need disjoint names for everything they may create, not just for the outputs the coordinator expects; isolate by name or by folder for all writes.
### Observation 895: Two handoff blocks added at once share their closing line in git's conflict
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): the settle step `raptor-port/scripts/records-merge.mjs` settles HANDOFF.md block by block, its tests cover two new blocks and a closing line both sides added (gates-and-deploy, the settle step; shipping step 2)
**Date:** 2026-11-08
**Session context:** chat 24, the rules diet's design page; bringing `main` in while another chat had added its own `## Now` block at the top of the handoff file (numbered past 894, the highest on any branch).
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** writing a block — merging a branch whose block clashes with another chat's new block

**Issue:** Both branches added a new block at the same place, each ending in the identical closing marker line. Git's conflict took that shared last line out of both sides and kept one copy after the conflict, so deleting only the three conflict marks left the first block with no closing marker; the document check caught it ("has no <!-- /now --> before the next block") and the marker was added back by hand.
**Suggested improvement:** In the skill's merge step: when the handoff file clashes, resolve by keeping both blocks whole, then count the opening and closing markers (`grep -c '<!-- now:'` must equal `grep -c '<!-- /now -->'`) before staging — or rebuild the region from each side's own block (`git show :2:HANDOFF.md`, `:3:`) instead of deleting conflict marks.
**Principle:** When both sides of a conflict end in the same line, git keeps that line once, outside the conflict; "keep both" then needs that line added back to the first side — count paired markers after any such resolution.

### Observation 896: A walker's failed runs leave pictures mixed into the cited range
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §5 "One run, one folder" (each attempt a fresh sub-folder, no picture number reused in it; the final run and its count named, earlier attempts labelled apart, every picture behind a finding kept, failed attempts never mixed into the cited run — Astra's A8) — one change with 771
**Date:** 2026-11-08
**Session context:** chat 29, the Inputs and Medical walk (one Sonnet walker, several attempts at some scenarios)
**Skill:** New skill candidate: walk-scripts (the walker's brief, `raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** the walker's pictures and its hand-back

**Issue:** The walker re-ran some scenarios after failed attempts, and each attempt wrote pictures into the same number range (101–200) under new names, so the folder held about 60 stale pictures beside the cited ones — some even sharing a number with a cited one (181-H1-1536 and 181-H1-phone). The walker listed which numbers it cited, and the host had to delete the rest by hand, guessing at the overlaps.
**Suggested improvement:** In the walker's brief: each attempt writes to a fresh sub-folder or a fresh number range, and before hand-back the walker deletes its own failed attempts' pictures and states the final count; a picture number is never reused within one walk.
**Principle:** Evidence produced by retries must be separable from the evidence that counts, by construction rather than by a list the reader has to apply.

### Observation 897: A walker's EXPECTED line written from the host's assumption produced two false FAILs
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §4 "Before a brief leaves", the EXPECTED-line bullet (each names its source — a ruling, a contract line, main's control run, or two surfaces of the app that must agree — or is RECORD) — one change with 768
**Date:** 8 Nov 26
**Session context:** chat 28's walk of the "Not kept" band (two Sonnet walkers, a host route check); numbered past 896, held by another branch
**Skill:** New skill candidate: walk-brief-writing (the bug-check order's walkers' brief, §7)
**Type:** open-source
**Phase/Area:** writing each scenario's EXPECTED line

**Issue:** Two of the walk's FAILs came from expectations the host wrote without a source: "a moved window, closed and reopened, keeps the place you gave it" (no ruling says so; the app has always reopened it at its first place), and the host's own route check expected the band's text without the hidden screen-reader separator that the existing band also carries. Both cost a control run and a reproduction to set aside, and either could have been reported as a fault of the change.
**Suggested improvement:** In the walkers' brief template, every EXPECTED line names its source — a ruling, a contract line, or "as on main today (control run)"; an expectation with no source is written as RECORD (measure and report), not PASS/FAIL. For text checks, compare the visible parts (or a fixture taken from the existing sibling element), not a string typed by hand.
**Principle:** An expected result with no source is a guess; grade only against a cited rule or a measured baseline, and record everything else.

### Observation 898: A blind reader's clean copy of the whole repo fails or crawls on Windows
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): TOOLS addition (g) (a ready script for a blind reader's clean copy: named paths, core.longpaths, BASE tag)
**Date:** 8 Nov 26
**Session context:** chat 32, the four blind code reads of pull request 702 (numbered past 896–897 on other branches)
**Skill:** claudex-loop (the blind-reader set-up), and the bug-check order §4's "a clean copy for the readers"
**Type:** open-source
**Phase/Area:** preparing the copy a blind reader reads

**Issue:** The first copy (`git archive` of the whole tree into a scratch folder, then a fresh repo with two commits) took over ten minutes and then failed: `git add` refused a "Filename too long" in an old evidence folder, so the repo had no commits. Deleting the tree file by file between the two commits was the slow part. The second copy, archiving only the folders a code reader needs (source, docs without evidence and pictures, the rulings, the backlog), with `core.longpaths` set and `git rm -r` between the commits, worked.
**Suggested improvement:** Give the copy step a ready script: archive named paths only, exclude evidence sheets, pictures and the archive, set `core.longpaths`, tag the base commit `BASE`, and tell the reader `BASE` stands for the real base id.
**Principle:** A blind reader's copy should hold only what the read needs; copying the whole history-laden tree costs time and breaks on platform limits.

### Observation 899: A walker's "seen in passing" fault was carried to the backlog step before anyone checked the ruling
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §7 (a side note read against the rulings and reproduced before a handoff calls it "to file") — one change with 744
**Date:** 8 Nov 26
**Session context:** chat 35, closing the evidence sheet of pull request 702 (numbered past 898)
**Skill:** the bug-check order §7 (the walk's side findings) and session-handoff (what a block hands on as "to file")
**Type:** open-source
**Phase/Area:** turning a walker's side note into a backlog item

**Issue:** A walker noted that an admin's bell read "Nothing new" after an access request, on both builds. The handoff carried it forward as a fault "to reproduce and file". Read against the ruling, the behaviour was exactly as ruled: each admin's bell goes out once he has had the waiting list on screen, and the walker's admin had opened that list first. A two-minute script on a fresh request showed the bell lit and its tap opening the list.
**Suggested improvement:** Before a side note enters a handoff or the backlog as a fault, check it against the area's rulings for that subject and, where they allow it, reproduce it with the precondition that would make it right; the handoff names it "to check" until then, never "to file".
**Principle:** A walker sees behaviour, not intent; a side note is a question until it is read against the rules that govern it.

### Observation 901: Two reviewers flag one clash and propose opposite fixes — the host decides by the project's conflict rule before the fixer starts
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/receiving-code-review/SKILL.md` A Finding, Its Diagnosis, and Its Fix: two reviewers' diverging fixes settled by the project's conflict rule before the fixer starts
**Date:** 8 Nov 26
**Session context:** chat 34, the rules diet's step 5a — the Tracker's rulings as a page, two blind reads (numbered past 900, the highest on any branch)
**Skill:** receiving-code-review
**Type:** open-source
**Phase/Area:** acting on reviewers' findings — before handing fixes to a helper

**Issue:** Both blind readers' first finding was the same clash (a later decision's rule sentence says every student is on the roster; an earlier one, still built, adds typed students). One proposed marking the earlier decision superseded; the other read the later decision's own interpretation as narrower and proposed putting the question to the owner. Handing both reports to a fix helper as they stood would have let it pick either fix.
**Suggested improvement:** In "receiving-code-review", add a step: where two reviewers' fixes for one finding disagree, the host settles it first by the project's own conflict rule (here: the newer instruction wins only where it clearly covers the case, otherwise it goes to the owner) and writes that decision into the fixer's brief.
**Principle:** Agreement on a finding is not agreement on its fix; the coordinator resolves divergent fixes by an explicit rule before delegating, never by letting the implementer choose.

### Observation 900: Archiving a backlog item can strip a new ruling's only backlog mention
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (l), added: the backlog script warns before moving an item that is a ruling's last backlog mention
**Date:** 8 Nov 26
**Session context:** chat 16, closing [LW-PIN-LAST-FRAME] (D1870, D1871) — numbered past 899, the highest on another open branch
**Skill:** New skill candidate: closing a job's records (the backlog-archive step)
**Type:** internal
**Phase/Area:** archiving a finished backlog item, then the document check

**Issue:** D1871's full row named the backlog as one of its homes, through the job's own item. Archiving that item, and dropping its priority line, removed every mention of D1871 from the backlog, so the document check failed on the ruling's home only after the archive, at the closing step.
**Suggested improvement:** before archiving an item, grep the backlog for each ruling number the item carries; where the item is a ruling's last mention there and the ruling's row names the backlog as a home, write the number onto the item that stays (here the follow-up item), or have the archive script warn of it before it moves anything.
**Principle:** a check that one record is mentioned in another breaks when the mentioning record is moved; run the check, or the search it does, before the move rather than after.

### Observation 902: A test runner's output folder is emptied by its next run — never keep walk evidence or scripts there
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (reflected): WS §5 "Nothing a walk keeps goes under raptor-port/test-results/" (written 8 Nov 26 from this very loss; the note says so)
**Date:** 2026-11-08
**Session context:** A re-walk of a top-bar fix: two measuring scripts and a reviewer's evidence folder (pixel records, side-by-side pictures) sat in the browser-test runner's output folder; a test run started an hour later deleted all of it. (Numbered past 901, held by another open branch.)
**Skill:** New skill candidate: walk-scripts (the project's walk-script guide)
**Type:** open-source
**Phase/Area:** Where a walk's scripts and evidence are written

**Issue:** The folder looked like the natural home for test pictures, and nothing marks it as temporary; the loss showed only when the scripts failed with "cannot find module", and the reviewer's evidence could not be reopened afterwards.
**Suggested improvement:** The walk-script guide's §5 now says it; a reviewer's or walker's brief names an output folder outside the runner's, and a check before a test run could warn when that folder holds files not written by the runner.
**Principle:** A tool's output folder belongs to the tool, which may clear it at any run; keep anything meant to last in a folder no tool owns.

### Observation 903: A fault seen only in the walker's own phone set-up is re-checked with its exact steps, not only with the test suite's phone

*Numbered 891 on `claude/lw-pin-last-frame`; renumbered 903 when `main` was brought in on 8 Nov 26 — `main` holds its own 891.*
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): WS §6 new line "A case the red-first test never turned red is proved by the walker's own steps" (old build must show it, fixed build must not)
**Date:** 2026-11-08
**Session context:** Chat 16, [LW-PIN-LAST-FRAME] (D1870): walker L found the pinned dates row shown early after a resize or a phone turn (L22). Numbered past 890, the highest on any branch at the write.
**Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md) / bug-check order §7 (re-walk after a fix)
**Type:** open-source
**Phase/Area:** turning a walker's finding into a red-first test, and the re-walk after the fix

**Issue:** The walker saw the fault on a desktop narrowed to 420 and on a phone turned sideways and back (its phone: device scale 2, mobile, touch, 402x874). The red-first test reproduced the desktop case but passed on the suite's own phone project and on Quals at both sizes, so a green suite after the fix proved nothing for the phone. Only re-running the walker's exact steps (same context options, same sequence, measured at the same scroll offsets) on the walked build (wrong) and the fixed build (right) closed it.
**Suggested improvement:** In the re-walk step, and in walk-scripts.md's "turning a finding into a test": when a red-first test does not go red for one of the cases a walker reported, keep the walker's exact steps as a small script and run it on the old build (must reproduce) and the fixed build (must not) before calling that case fixed; name in the evidence sheet which case is proved by a test and which by the script.
**Principle:** A test that never went red for a case is not evidence that the fix cures that case; reproduce with the finder's own set-up before and after.

### Observation 904: A browser test red only on the CI machine may be the CI machine's letters, not its speed
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 3, the layout-shift bullet: measure across widths before slowing anything, and add the matching width to the test
**Date:** 8 Nov 26
**Session context:** chat 39, pull request 694 - a Leave War browser test failed on GitHub (a row 47px low) and passed on the PC, even with the browser's processor slowed three-fold.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** reproducing a failure that only the CI machine shows

**Issue:** The first guess was timing (a slower machine exposing a frame-late write), so the test was re-run slowed - still green. The real difference was the fonts: Linux's wider letters wrapped one page's top bar to two rows at the test's 1440 width, Windows' did not. Measuring the bar's height on both pages at a few widths found 1360 as the width where the PC wraps too, and the test went red at once.
**Suggested improvement:** In the skill's "reproduce first" phase, for a layout-dependent browser test that fails only in CI: before slowing anything, measure the elements the failure depends on across a few viewport widths on the local machine, and run the test at the width where the local layout matches CI's; then make the test itself cover that width so it fails on any machine.
**Principle:** A CI-only layout failure is often the fonts, not the clock: text metrics differ by operating system, so measure the layout across widths before reaching for throttling.

### Observation 906: A test that skips when its setup did not happen proves nothing on that run
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): BCO §8 item 4 (a test builds its own precondition and asserts it; a conditional skip is a finding; the break goes red at the assertion that matters)
**Date:** 2026-11-09
**Session context:** [E2E-BOARD-KEYS-SKIP] (D1936) — fixing a browser test that skipped itself when its chosen box already sat above the simulated keyboard. Numbered past 905, which another open branch holds.
**Skill:** New skill candidate: browser-test fixtures (or the bug-check order, §8 and `docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** writing a browser test; reviewing one

**Issue:** The test picked "the seventh box", hoped it landed low on the screen, and called a skip when it did not. A skip reads green in a run summary, so on any run where the seed shifted the box, the case went unproved with no sign. Two independent readers found it only by reading the code. The fix placed the box deliberately (chose a box with enough list under it and scrolled it to a set spot) and asserted the fixture, so a fixture that cannot be built fails instead.
**Suggested improvement:** In the order's §8 (tests find rather than confirm) and the walk-scripts guide, add: "A test builds its own precondition and asserts it; a conditional skip on the precondition is a finding. A break test — the feature switched off for one run — must turn the test red at the assertion that matters, not at the fixture."
**Principle:** A test must create the situation it checks and fail if it cannot; a skip conditioned on the situation silently turns a check into a no-op, and only a break test proves the check bites.

### Observation 905: "Add-only" was a guess about a file — its edit history said otherwise
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", the plan's-brief bullet: every file-shape claim broken with a named commit from its history
**Date:** 8 Nov 26
**Session context:** Chat 33, [MERGE-ONCE-RECORDS] — the plan's red team and build (number checked past 903, the highest on any remote branch).
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** plan red team — the brief's questions

**Issue:** A plan to merge record files with git's "keep both sides" setting rested on calling four files "add-only". Both blind red-team readers disproved it from the files' own git history in minutes (a ledger row rewritten in place, a note's status edited, notes archived), and showed the setting would have doubled records unseen and let some merges skip every check. The plan's author had measured clash counts on 113 real merges, but never measured how each file is edited.
**Suggested improvement:** In the red-team brief template, add a standing question: "for every file the plan treats by its shape (add-only, one owner, never edited), check that shape against its own commit history and name a commit that breaks it."
**Principle:** A plan's assumptions about a file's shape are claims to test against the file's history, not facts; ask the red team to break them with real commits.

### Observation 907: A helper that "completed" while waiting on its own runs can wake and write later
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/overnight/SKILL.md` Part 2, the report bullet: a helper paused on its own background work is stopped or awaited before the checkout changes; its log read after
**Date:** 9 Nov 26
**Session context:** Chat 36's overnight run, job 2 (the Tracker trial), one helper at a time in one shared checkout (number past 905–906 held on other branches)
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — each job handed to one fresh helper; the coordinator checks each report

**Issue:** The trial helper's completion notice said it "stopped with background work of its own still running" and had no report. The coordinator took that as finished, saved its tree as a commit and switched the checkout to another branch to fix a red check. The helper then woke and made one more commit on its branch; had it edited files, they would have landed in the other branch's working tree.
**Suggested improvement:** In Part 2, add: a helper's notice that says it is waiting on its own background work is NOT a finished job — before switching the checkout's branch or writing into it, stop that helper (TaskStop) or wait for its real report; then read `git log` of its branch for commits made after the notice.
**Principle:** A subagent paused on its own background work is still live; stop it before the shared workspace changes under it.

### Observation 908: A change to a gate script runs that gate's own self-test before the push
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, the docs-only bullet: a change to the document check's scripts runs its self-test on the PC before the push; a new rule gets cases
**Date:** 9 Nov 26
**Session context:** Chat 36's overnight job 1: a new hard-limit rule added to the document check
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — "at every commit"

**Issue:** The document check passed on the PC, but the pull request's documents guard ran the check's self-test, which builds practice files; the new rule failed 8 of its cases. The self-test was never run locally, so the red came back only from the remote run.
**Suggested improvement:** Under "at every commit", add: a commit that changes a check's own script runs that check's self-test (the documents guard's: `node raptor-port/scripts/docsize-selftest.mjs`, about 10 minutes) before the push, and a new rule gets self-test cases of its own.
**Principle:** A checker that has its own test harness must pass that harness, not only the real files, before its change ships.

### Observation 909: Converting a rulings area to a page is now a repeatable workflow
**Status:** DECLINED (2026-11-10) — closed on his word in the skill review of 10 Nov 26: recommend closing: every area's rulings are a page since 9 Nov 26, so the conversion skill has nothing left to serve; its general lesson lands with 912; question in `_review/questions.md`
**Date:** 9 Nov 26
**Session context:** chat 41, the rules diet's Inputs pages in the Tracker trial's shape (D1943)
**Skill:** New skill candidate: rulings-page-conversion
**Type:** internal
**Phase/Area:** the whole job — brief, sort, draft, blind reads, fix, before-and-after page

**Issue:** the Tracker trial (chat 36) and the Inputs pages (chat 41) ran the same shape: a drafting brief told the last trial's lessons, a fresh helper sorts every ruling (standing / built held whole / not built / spent) and drafts the page, Astra and a fresh Opus reader read blind on four questions, a third helper checks and fixes every finding, then a before-and-after page. Each time the brief was rebuilt by hand, and this time the drafting helper stopped on a duty the brief missed: converting an area makes the gate check other pages' citations of it, and How we work had 4 bytes spare.
**Suggested improvement:** a project skill holding the brief template (the strict "held whole" test with its exclusions, conditions and scope; the readers' four questions; the check of other pages' citations of the area before drafting, with each page's spare bytes), the order of helpers, and the before-and-after page's sections. Wait for his word on the next area before writing it.
**Principle:** when a multi-helper documentation job has run twice with the same shape, its brief and its reader questions belong in one reusable place, with each run's surprise added as a check before the step it would have blocked.

### Observation 910: A time limit around the document self-test turns a pass into a fake crash
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, C1's self-test line: 10 to 20 minutes, in the background with no `timeout`; exit 124 is the limit, not the script
**Date:** 9 Nov 26
**Session context:** chat 43, the rules diet's scheduler page — re-running the document checks' self-test before the readers' fixes
**Skill:** task-observer short form (the project's gate habits); note 908's "about 10 minutes" figure
**Type:** open-source
**Phase/Area:** running a long check script in the background

**Issue:** The self-test was started under `timeout 900`. At 15 minutes the limit killed the child check of the case then running; the case read the killed child's empty answer as a failure and threw, so the log showed a stack trace and "the inventory was not clean", and the exit code was 124. It looked like a broken script. Twenty minutes went on comparing against main's copy before the cause was plain. Run again with no limit, the same self-test passed all 334 cases in about 17 minutes (with two other heavy jobs on the PC); note 908 says "about 10 minutes".
**Suggested improvement:** Run the document self-test in the background with no `timeout` wrapper (the harness notifies when it ends); if a limit is wanted, make it 40 minutes. Before diagnosing a failure of anything run under `timeout`, read the exit code first: 124 means the limit fired, not the script. Update note 908's duration to "10–20 minutes".
**Principle:** a time limit that kills a child process makes the parent report a failure that looks real; check for the limit's own exit code before reading the failure, and run long checks unbounded in the background instead.

### Observation 911: Commits landed off the branch, and the push said "Everything up-to-date"
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, new "After a push" bullet: "Everything up-to-date" after new commits means a detached checkout; push HEAD by its full name; and its preventive half in `.claude/skills/dispatching-parallel-agents/SKILL.md` "When Agents Share the Working Tree": a helper that sha
**Date:** 9 Nov 26
**Session context:** chat 43, the rules diet's scheduler page — three commits made while helpers worked in the same checkout
**Skill:** session-handoff / the shipping loop (push step)
**Type:** open-source
**Phase/Area:** committing and pushing in a checkout that helpers also use

**Issue:** Right after the chat switched to its branch, something (not the host's own commands — likely a helper of a read-only reader) moved the checkout to a detached state at the same commit. The host's next three commits went onto that detached state; the branch name stayed one commit behind. `git push -u origin <branch>` then answered "Everything up-to-date" and pushed nothing. Only `git status -sb` showing "HEAD (no branch)" revealed it; the branch was moved forward with a fast-forward and pushed.
**Suggested improvement:** In the push step, before pushing: `git branch --show-current` must print the branch; if it prints nothing, fast-forward the branch to HEAD (`git switch <branch> && git merge --ff-only <sha>`) first. And treat "Everything up-to-date" after new commits as a fault to check, never a success. A helper's brief that says "read only" also says "never check out, switch or detach".
**Principle:** a push reports on the branch name, not on the commits you just made; confirm the checkout is on the branch before trusting a push's "up to date".

### Observation 912: Find what a conversion will demand of other files by trial-running the gate on a marked copy
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/gates-and-deploy.md`, the same new trap as 851: a change that switches on checks reaching other files is tried on the file first, then the file put back
**Date:** 9 Nov 26
**Session context:** chat 45, the Leave War's rulings becoming one page (D1947)
**Skill:** New skill candidate: rules-diet-area-conversion
**Type:** open-source
**Phase/Area:** before drafting a converted area — the other pages it touches

**Issue:** Twice (the Inputs and the scheduler conversions) the drafter only learned at the gate that converting an area made other, already converted pages owe the numbers of later rulings — and one of those pages was at its hard size limit, so the job stopped mid-way for an owner question. This time the host copied the area file aside, added the page marker to it, ran the documents check once, read only the other-page failures, and put the file back: ten lines on four pages, one page 6 bytes short — the owner's question was asked while the sorters were still working, and the drafter's brief listed every owed line.
**Suggested improvement:** In a conversion workflow (the rules diet's step 5b, or any skill that converts an area), add a step before the sorters start: trial-run the gate with the marker added to a copy, record every failure in another file and each page's room under its hard limit, and put any shortfall to the owner at once. Restore the file and confirm `git status` is clean.
**Principle:** when a change switches on checks that reach other files, run the check once with the switch flipped before doing the work, so the cross-file debts and any owner questions surface first instead of at the end.

### Observation 913: A brief written for a later chat named the writer's own worktree folder
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: a brief for a later chat names branch and commit, never a worktree folder; with 847
**Date:** 9 Nov 26
**Session context:** chat 46, the Leave War page's two blind reads (D1947), run from a brief chat 45 wrote
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** briefs written for the next chat's helpers

**Issue:** the readers' brief, written by chat 45 to be sent "word for word" in chat 46, named chat 45's own worktree folder as the place to work. Chat 46 ran in a different worktree on the same branch; the old folder happened still to exist at the same commit, so the brief would have worked by luck, but a helper could have read a stale or moved checkout. Chat 46 sent the brief unchanged with a one-line host's note naming the right folder.
**Suggested improvement:** in the handoff skill's step for briefs left for the next chat: a brief meant for a later chat names the branch and the commit to read, never a worktree path; the chat that sends it adds the folder it runs in.
**Principle:** a brief that outlives its writer's session should name what is stable (the branch, the commit), not where the writer happened to be working.

### Observation 914: Before narrowing what loads a rules file, list what the other jobs lose — by the file's lines, not its section names
**Status:** ACTIONED (2026-11-10) — the skill review of 10 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §"Keeping the list whole", the paths bullet: narrowing a file's `paths:` checked by its lines first, pointers added on the losing side as new lines
**Date:** 10 Nov 26
**Session context:** the rules diet's follow-up (chat 48): two guides taken out of the scheduler rulings page's load paths so Leave War and Tracker jobs stop loading it.
**Skill:** New skill candidate: narrowing a context file's load scope
**Type:** open-source
**Phase/Area:** before the edit — the impact check

**Issue:** the load link looked accidental (two guides pulling a whole area's rulings into unrelated jobs), but a line-by-line check of the scheduler page found rulings that govern the Leave War's own screens (its Event sheet, its panel for picked days, its bidding dates' calendar) stated only there; cutting the link alone would have silently hidden them from the very jobs that change those screens. A second trap: widening an existing pointer line made the document check re-test that line's old citations and its length limit, so the addition went on new lines instead.
**Suggested improvement:** a short procedure for any change that narrows when a context file loads: (1) list the jobs that lose it (by the measure's model jobs and by every other file's load paths); (2) grep the file for every line naming those jobs' areas or claiming to hold "everywhere / every screen"; (3) check each cited ruling against what the losing jobs still load; (4) add pointers on the losing side for what is stated nowhere else, as new lines; (5) measure again.
**Principle:** a load path that looks accidental may be the only route a rule has to the job that needs it; check what travels on it before cutting it.

### Observation 915: A helper's write of its own report file was refused; the brief must say to return it as text

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 49, the overnight skill-notes review: helper A sorted 43 notes and tried to save its report as `_review/report-A-walks.md`.
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2, "A helper's report … is saved into the repo"

**Issue:** The tool refused the helper's write of the report file ("Subagents should return findings as text"); the helper's other writes (drafts, a table) went through. The coordinator saved the report from the hand-back by hand, and later briefs told helpers to return the report as their final reply. A transcript file later held no copy of one reader's report, so the hand-back in the chat was the only copy.

**Suggested improvement:** Overnight Part 2 and every helper brief: "return your report as your final reply; the coordinator saves it" — never "write your report to <file>". The coordinator saves it the moment it arrives, before anything else.

**Principle:** A helper's report reaches the host as its final reply; a brief that asks for a report file may be refused, and the reply is then the only copy, so save it at once.

### Observation 917: The shared-folder trap of Observation 787 met again — an opening line written in chat, outside the handoff guide

**Status:** OPEN
**Date:** 10 Nov 26
**Numbering:** first appended as 916; chat 51 appended its own 916 on `claude/lw-frozen-bar-stutter` the same minute (the same event, from the other chat's side), so this one is renumbered 917 — read the two together at the next review.
**Session context:** Chat 50 (night 3's notes leftovers); mid-turn he said he would open a parallel chat for a Leave War fault, and the agent wrote its opening line in the reply
**Skill:** session-handoff (and every place the agent writes an opening line for a parallel chat)
**Type:** open-source
**Phase/Area:** Opening lines for a chat that will run beside this one

**Issue:** Observation 787 (3 Nov 26) was actioned the morning of 10 Nov 26 in the handoff guide's Step 1: a parallel chat gets its own short-path worktree. Two hours later the agent wrote a parallel chat's opening line by hand in a reply, not through the handoff guide, and it said "start a new branch level with origin/main" with no folder. The new chat cut its branch in the main folder this chat was using; this chat's next commit (notes only) landed on the new chat's branch. Caught by reading `git worktree list` before the next job (the main folder showed the other branch); moved with `git branch -f` and `git reset --keep`, nothing pushed, nothing of either chat lost; this chat moved to `../Raptor-n3`. The rule to check `git branch --show-current` before each commit was known and not run.

**Suggested improvement:** (1) An unconditional guard in place of the judgement: a commit hook (beside `push-guard.mjs`) that records the branch this session last checked out or created and refuses `git commit` when the folder's current branch differs, naming both — the check then cannot be forgotten. (2) In the handoff guide's Step 1 and the general rules on parallel chats: the own-folder line applies to EVERY opening line the agent writes for a chat that will run beside this one, written in a reply as much as in a handoff, and the line itself carries `git worktree add ../<repo>-<name> -b <branch> origin/main`.

**Principle:** A rule placed only in the workflow where it was first learned does not reach the same act done by hand elsewhere; where a check costs nothing, a guard inside the act (here, the commit) beats a step in one guide.

### Observation 918: A handoff's "Next" told the next chat to drop owed reads that a ruling reserves for him

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** chat 53, night 3's leftovers — carrying out chat 50's handoff block, step (c) for [CAL-JOB-LEFT]
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** writing a block's "Next" steps

**Issue:** Chat 50's block said of the calendar job's owed reads: "record that [they are overtaken] and archive the item". The reads sit on the reads-owed list, and a standing ruling (D761) says the reads owed are put to him to call or drop, never dropped by the agent. Followed literally, the next chat would have dropped them unasked; caught only because the rulings were searched before acting.
**Suggested improvement:** in the handoff guide's step that writes "Next", add: for each step that closes, drops, archives or decides something, name the ruling that lets the agent do it alone — or write it as "put to him". The receiving chat checks that line before acting.
**Principle:** A handoff's instruction carries no authority of its own; a next step that disposes of something must cite what permits the agent to do it alone, or it becomes a question for the owner.

### Observation 919: The missed-faults list had two entries numbered 23, and nothing checks the numbering

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** chat 53, D1297's sweep — adding lessons 25–30 to the bug-check order's §7.11
**Skill:** New skill candidate: none — the document check (`docsize`)
**Type:** internal
**Phase/Area:** the bug-check order's §7.11 list

**Issue:** §7.11 holds two lessons numbered 23 (added by two chats on different days); the sweep helper noticed it. Lessons are cited by number ("§7.11 lesson 7"), so a doubled number makes a citation ambiguous. Left as it is this time — renumbering would change citations elsewhere.
**Suggested improvement:** the document check counts §7.11's lesson numbers and fails on a gap or a repeat; the second 23 becomes 23b (or the list is renumbered once, every citation searched and fixed in the same change).
**Principle:** A numbered list that several writers append to needs its numbering checked by a tool, or two writers will take the same number.

### Observation 916: Two chats opened in one folder — a "start a new branch" opening line switches the other chat's branch

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 51 (a Leave War fault) was opened beside chat 50 (notes only), both in the main folder; number taken past 915, the highest on every branch
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** The opening line for a chat that runs beside another

**Issue:** Both chats started in the same checkout. The second chat followed its opening line ("start a new branch level with main") and switched the folder's branch; the first chat's next commit landed on the second chat's branch and had to be reset off and redone. The opening line named each chat's rulings range and handoff block, but not a folder.
**Suggested improvement:** In the handoff skill's step that writes the opening line: when another chat is open or is being opened beside the new one, the line names the folder each works in (or tells the new chat to check the live chats and the checkout's reflog before switching a branch), and the new chat lists the live chats before its first branch switch.
**Principle:** Parallel sessions need separate working folders as well as separate branches; a branch switch in a shared folder moves every session in it.

### Observation 920: Closing a backlog item — never edit its own lines before the archive move

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 54/56 closing backlog items with the archive command; logged by chat 57 for chat 56, which held it back across two handoffs
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** closing a finished backlog item before a handoff

**Issue:** The archive command checks that an item's lines move byte for byte, and refused two moves after the item's own lines had been edited to say it was closed. It also refused while a ruling archived on the branch that made it still pointed its home cell at a live item.
**Suggested improvement:** In the handoff skill's step for closing items: a closing note goes on a line of its own, added after the item's last line, never by editing the item's existing lines; a piece still open is restated in a new item pointing to the archived original; a ruling archived on the branch that made it gets its home cell pointed at the archived item that records the work before the move.
**Principle:** When a tool verifies a move by exact bytes, mark completion by adding, never by rewriting what is being moved.

### Observation 921: An outgoing chat that resumes after compaction should mark its handoff block as taken back

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 57 opened from chat 56's handoff to start [SKILLS-TIGHTEN]; chat 56 had compacted, been asked to carry on, and was already writing the same list; a third fresh chat had the same opening line
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** handoff block; a new chat's first steps

**Issue:** The handoff block said the next job was "for a fresh chat". The outgoing chat compacted, was asked to continue, and took the job back without changing the block, while two fresh chats were opened with the same line. All three read the same 46,000-token guide before the overlap was found by listing the live chats and messaging.
**Suggested improvement:** When a chat resumes work its own handoff block gave to a fresh chat, it first adds one line to that block ("taken back by chat N at <time> — do not start") and pushes it, or messages any chat opened since. A new chat lists the live chats and messages the block's writer BEFORE its first heavy read, not after.
**Principle:** A handoff note is a lock; whoever takes work back from it must update the note before starting, and a new reader checks for a live owner before spending effort.

### Observation 922: Shortening a rule drops the small conditions first — check each cut clause for one

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** [SKILLS-TIGHTEN] step 1 — the design guide's 81 lessons cut to one line each (chat 58); numbered past 920–921, held by pull request 749
**Skill:** New skill candidate: tightening a guide (the method [SKILLS-TIGHTEN] uses; session-handoff and overnight are next)
**Type:** open-source
**Phase/Area:** the rewrite step, before the readers

**Issue:** The writer's one-line versions passed the writer's own reading, yet two blind readers found eleven losses in 68 lessons, and nearly all were of one kind: a short qualifying clause inside a longer sentence (an exception scoped to one named column, a "where … is shown another way" condition, a pointer to a rule that narrows this one carried only by a passage that was itself leaving, a note of what was built turned into a requirement by rewording).
**Suggested improvement:** Before the readers, the writer runs one mechanical pass: for every sentence cut or reworded, list its qualifying words (where, only, unless, except, for … only, narrows, narrowed by, built) and every cross-reference into a passage that is leaving, and show each is still carried; a "built / as built" note is never reworded into the rule's own list.
**Principle:** When text is condensed, the main clause survives and its conditions do not; a condensing pass needs a check aimed at qualifiers and cross-references, not a re-read for sense.

### Observation 923: An opening line gave the own-folder fallback as an order, without its condition or its write test

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 59, started from chat 58's opening line to begin [SKILLS-TIGHTEN] step 2 (number read from the log and every remote branch just before the append: 922 was the highest).
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Step 1 — the ready-to-paste opening line (the sentence every opening line carries)

**Issue:** The skill gives the own-folder step as a fallback with a condition ("if `git status` shows changes you did not make, or another chat works in this folder") and a test ("make one write there first, and if the file tools refuse it, stop and tell him"). The opening line handed over dropped both: "run `git worktree add --no-track -b … ../Raptor-st2 origin/main` and work only there". The new chat had been started by the app in its own fresh folder on its own fresh branch, level with `main` — the condition was false — and a chat started in a worktree may not write into another, so obeying the line would have ended in refused writes. The chat stayed where it was and told him; the relative path would also have landed inside `.claude/worktrees/`, not beside the repo, because the line was written from a different starting folder. Related: Observations 916 and 917 (open), whose suggested fix puts `git worktree add` into every such line.
**Suggested improvement:** In the opening-line step: the fallback is always written with its condition and its write test, never as a bare order; the line first has the new chat say where it is (`git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not) and use its own folder when that folder is clean, on a fresh branch and no other chat is in it; a path in the line is absolute. When Observations 916 and 917 are acted on, keep this condition.
**Principle:** A fallback copied into an instruction without its condition becomes the main path; write the check that decides it into the instruction itself, not only into the guide the writer read.

### Observation 924: A tightening job's saving was guessed at three times what it measured

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 59, [SKILLS-TIGHTEN] step 2 — the list put to the owner before the session-handoff skill was rewritten (number read from the log just before the append: 923 was the highest).
**Skill:** New skill candidate: tightening a guide (the list first, then the rewrite and its reads)
**Type:** open-source
**Phase/Area:** The list put to the owner — its "estimated saving" line

**Issue:** The list told the owner the skill would come out a third to two-fifths shorter. It measured 11%. The figure was built from guesses by category ("about 25 stories, say 6,000 bytes") made while reading, never from the passages themselves; the stories were about half that, and most of the file was commands, quoted sentences and conditions the same list promised to keep word for word. The owner approved on the wrong number, and had to be told afterwards.
**Suggested improvement:** Before a saving is quoted, measure it: mark each passage listed to leave or to be stated once (by line range), sum their bytes with a script, and quote that sum as the ceiling; quote the "said in fewer words" part separately and as a guess, or not at all. State what share of the file is protected text (commands, templates, quoted sentences) — that share cannot shrink.
**Principle:** An estimate put to the person who decides is a measurement or it is labelled a guess; when the parts to be removed are already listed, summing them costs one script and replaces the guess.

Applied 10 Nov 26 (chat 60, [SKILLS-TIGHTEN] step 3, the overnight skill): each passage listed was written into a script with the text that would replace it, found exactly once in the file, and summed — 1,141 of 21,958 bytes, about 5%, quoted to the owner before his answer; corrections that add words were counted against the saving; the rewording part was labelled a guess and not recommended. A first try at measuring the "protected share" by matching quote marks gave a nonsense figure (text between unrelated quote marks) and was dropped — that share needs marking by hand or not quoting. Script: `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-overnight-measure.mjs`. The final figure was about 1%: the owner's answer to the list's question added a sentence, and the readers' fixes put text back — a measured ceiling is still a ceiling, and the list should say so.

### Observation 925: A correction to one paragraph of a guide contradicted paragraphs the list promised to leave alone

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 60, [SKILLS-TIGHTEN] step 3 — the overnight skill's three corrections to later rulings, read by Astra and a fresh Opus reader (number read from the log and every remote branch just before the append: 924 was the highest).
**Skill:** New skill candidate: tightening a guide (the list first, then the rewrite and its reads)
**Type:** open-source
**Phase/Area:** The corrections — a rule a later ruling overtook, put right in place

**Issue:** Three of the readers' five findings were one shape: a rule was corrected where it was stated, and another place that depended on the old rule was left as it was. "The pull request opens as soon as the job is built" was written into one bullet while the bullet beside it still gave the whole job to one background helper and forbade the coordinator to write while it ran — the new rule could not be followed. "Nothing merges, unless he gave auto merge live" was put into the head, one step and one checklist, and missed the other checklist, which still demanded the old sentence. A rule folded into a pointer ("do what the block's first line says") leaned on a line nothing required to stay first. The list to the owner had named each correction by the lines that STATED the old rule, never by the lines that RELIED on it.
**Suggested improvement:** For each correction, before the list goes to the owner: search the guide for every place that relies on the old rule — the steps that carry it out, the checklist that checks it, the brief that hands it on — and list those lines with it; for each rule turned into a pointer, name what guarantees the thing pointed at still exists when it is needed. The writer's pass asks of every corrected rule "can a reader following the steps in order now do this?", not only "does it say what the ruling says?".
**Principle:** Correcting a rule is a change to everything that depends on it; find the dependants by what they do, not by where the rule's words appear.

### Observation 926: "check; commit" on one line committed past a failed check

**Status:** OPEN
**Date:** 10 Nov 26
**Session context:** Chat 60, [SKILLS-TIGHTEN] step 3 — committing the skill change (number read from the log just before the append: 925 was the highest).
**Skill:** New skill candidate: committing behind a check (shell habits on this PC)
**Type:** open-source
**Phase/Area:** The commit after a document check

**Issue:** The document check and the commit were typed as one command with the check's output sent to a file, its exit code echoed, and the commit after a semicolon. The check failed (a rules file one line over its size tripwire); the commit ran anyway and the failure was read only afterwards. A trap met again: the memory note "a pipe hides a failed check" (3 Nov 26) covers the pipe, and this is the same fault through a semicolon. Nothing was pushed; a second commit fixed it, and the session then committed through a small script that stops when the check fails.
**Suggested improvement:** A guard, not a reminder: one project script, "check then commit", that runs the document check, prints its last lines and refuses the commit on a non-zero exit — used for every records commit; or the commit hook runs the check itself.
**Principle:** When a check gates an action, the gate is the check's own exit code joined to the action — never two statements that happen to sit on one line.

### Observation 934: "This chat is full" told to him just before a compaction made room

**Status:** OPEN
**Date:** 11 Nov 26
**Session context:** Chat 64, evening: his two points on the rules check arrived at 91% full; the state was saved, a notification and the next-step box said the chat was full and the points would wait for a fresh chat; the compaction then ran and the chat stood at 42%, with room to answer both at once. (Numbered past 933, the highest on any open branch.)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** When to hand off versus compact; what is told to the user before a compaction

**Issue:** The agent told the user his questions were deferred because the chat was full, in a notification that cannot be taken back, while a compaction it had itself made ready was about to free the room. He was told to start a new chat for work that was then done in the old one ten minutes later.
**Suggested improvement:** In the handoff guide's compaction part: when the state is saved and a compaction is about to run, defer nothing in words to the user yet — let it run, measure the fullness after it, and only then decide between answering here and handing off. A notification never says "this chat is full" before that measure.
**Principle:** Decide what to defer after the event that changes the constraint, not before it; and never send an irreversible message on a figure that is about to change.

### Observation 935: A time written into the record from memory again (see Observation 932, on another open branch)

**Status:** OPEN
**Date:** 11 Nov 26
**Session context:** Chat 64: the handoff block's heading said "written 19:45" when the clock read about 19:10, and "typed at about 20:00" for a message of about 19:05.
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Writing the block — times

**Issue:** The same trap as Observation 932: a clock time put into a record without reading the clock. A reminder did not stop it the second time.
**Suggested improvement:** A guard inside the action: the script that puts the block into the handoff file stamps the time itself from the system clock (a placeholder in the draft), so no time is ever typed by the agent.
**Principle:** A value the machine knows exactly is filled in by the machine, never recalled by the writer.

### Observation 936: A wait loop that only asks "is anything still running" reports ready on a failed run

**Status:** OPEN
**Date:** 2026-11-11
**Session context:** Chat 65 — after his "merge live" of the Balances fix (pull request 760), waiting for main's own run and the live build before telling him it is live
**Skill:** New skill candidate: merge-live follow-through (the shipping rules' "Done means live")
**Type:** open-source
**Phase/Area:** After the merge — waiting for the default branch's run and the production deployment

**Issue:** The host wrote a small wait script on the spot: it looped until no run of the merge commit was queued or in progress and the production deployment reported success, then printed "ready". Main's run had FAILED (nine browser jobs could not download the test browser — a network fault on the hosted machines, no test ran), and the script still printed "ready" because a failed run is also "not running". The host caught it only by reading the runs again by hand before reporting. Highest number on every branch read just before this append: 935.
**Suggested improvement:** Keep one committed wait script for this step (beside the gate lock script) that exits 0 only when every run of the merge commit concluded `success` (or `skipped`) AND the production deployment is ready; any other conclusion exits non-zero and prints the failed jobs with the step each failed at, so an infrastructure failure (a download step) is told apart from a failing test at a glance. The shipping rules' line on "main's own run goes green" names the script.
**Principle:** A wait condition is written as the success it waits for, never as the absence of activity; "nothing is running" is true of a failure too.

### Observation 937: A night job that rides an already-checked pull request is built on its own branch and joined only when checked

**Status:** OPEN
**Date:** 2026-11-12
**Session context:** the night of 12 Nov 26 (chat 66) — five jobs, three of them on one pull request
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — through the night (branches; a batch on one branch)

**Issue:** Jobs 2 and 3 were built and fully checked on the pull request's branch; job 4 belonged on the same pull request but was the riskiest and the last. Built straight onto that branch, a job 4 that ran out of time would have left the checked work carrying a half-built change. It was built on its own branch cut from the checked one, pushed freely (no pull request, so no run), checked there on the PC, and only then brought onto the pull request's branch by fast-forward — the pull request stayed whole throughout. Two further things met on the way: GitHub started a push's runs about five minutes late, so "no run listed" right after a push is not "no run coming" (the push guard caught the second push); and a builder helper stops several times with a "waiting on its own background work" notice before its real report.
**Suggested improvement:** In the overnight guide's "Branches" paragraph, add one sentence: a later job that joins a pull request whose earlier jobs are already checked is built on its own branch cut from that one and fast-forwarded in only once it is built and checked, so a short night leaves the pull request as its checked jobs. In Part 2's push bullet, add: after a push, read the runs again a few minutes later before concluding none started.
**Principle:** Work that is already checked is never the staging ground for unchecked work; join the two only when the second has earned it.

### Observation 938: Recording a batch of answers — check each page's free room and the "changes" trigger before writing the rows

**Status:** OPEN
**Date:** 13 Nov 26
**Session context:** chat 66 recording eighteen answers "as recommended" as seventeen rulings (D2008–D2024)
**Skill:** New skill candidate: recording-rulings (the steps at the head of DECISIONS.md)
**Type:** internal
**Phase/Area:** step 2, stating a ruling on a converted page

**Issue:** Three refusals in one batch, each found only by running the gate: the general page had 11 bytes left of its hard limit and OIL's page under 230, so a new line did not fit; and a row whose text said it "answers" an older ruling made the gate ask for a mark in that ruling's row and a citation on every page line stating it (five lines).
**Suggested improvement:** Before writing rows for a batch, read each target page's size against its limit (`wc -c` beside the PAGE_LIMITS in the document check) and choose the area by room as well as by subject; decide for each row whether it truly changes or answers an older ruling — if yes, plan the mark and the citations in the same script; if no, do not word it as one. The general page's wrapped bullets can be joined without changing a word (2 bytes a line).
**Principle:** When a record system has hard size limits and cross-reference rules, measure the room and list the cross-references before writing, not after the check refuses.

### Observation 939: A walk of a page fitted to the screen is sized at a narrow desktop width too, not only the wide one

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the Approvals page made to fit the screen on a PC, a WALK with both code reads
**Skill:** New skill candidate: bug-check walk sizing (the project's bug-check order, its sizing step and lesson 11)
**Type:** open-source
**Phase/Area:** sizing the walk — which window widths a layout change is walked at

**Issue:** Every desktop scenario of the first walk ran at the widest common window or wider. Two faults that exist only in a narrower desktop window (the list's lines showing past the pinned headings; a newly opened calendar and a new list opening out of sight after a sideways scroll) were found only by the code readers, not by the walk. The sizing step had named heights (neighbouring and fractional) carefully but took the width from the usual desktop size.
**Suggested improvement:** In the sizing step for a page that fits the screen or scrolls inside itself, name at least one narrow desktop width just above the phone split and one mid width, beside the usual wide one, and walk the sideways scroll there; add it to the lesson on fitted pages.
**Principle:** When a layout has a breakpoint, the walk covers both sides of it close up — the narrowest window that still gets the wide layout is where the wide layout is most likely to fail.

### Observation 940: A warning drawn live on a published day reads the settings too — it belongs in the roll-call

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch: a published day keeps the Logic settings it was published under (D2005, D2014)
**Skill:** New skill candidate: bug-check roll-call (the project's bug-check order, its roll-call step)
**Type:** open-source
**Phase/Area:** the roll-call — listing every place the app draws the thing a change touches

**Issue:** The change made a published day keep the settings it was published with. The roll-call listed the places that show the day's stored figures, and each kept them. A red warning line that is not stored but worked out each time the day is drawn (the "no usable times" line) still read today's settings, so it moved at once with a settings change on a published day. Only the blind code read found it; the roll-call had no row for it, because the line is not a "place that shows the figure" — it is a check that reads the same setting.
**Suggested improvement:** In the roll-call step, add a second question beside "where is this thing drawn": "what else reads the same setting or input each time the screen is drawn" — warnings, counts, notes and marks worked out live — and give each its own row with has it / must not / MISSING.
**Principle:** When a change freezes or redirects an input, list every reader of that input, not only every display of its result; a derived message is a reader even when it stores nothing.

### Observation 941: Type-check a new test file before calling it done — the test runner does not

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch, new test files written by a builder helper
**Skill:** New skill candidate: build-step checks (the project's executor rule, its "tests first" step)
**Type:** open-source
**Phase/Area:** verifying a new test file before the full check

**Issue:** A new test file ran green in the test runner while carrying type errors, because the runner strips types without checking them. The errors surfaced only later, at the build step of the full check, costing a second round. (In this project the plain no-output type check is also hollow, so the project's build-mode type check is the one to run.)
**Suggested improvement:** In the builder's brief and the executor rule, add to "its own tests green": run the project's real type check (here `npx tsc -b`, or the build) on any new or changed test file before the job is called built.
**Principle:** A test runner that transpiles without type-checking proves behaviour, not types; run the type check that the full gate will run before handing work on.

### Observation 942: A build chat was three-quarters full before its first edit — the area pages load whole on the first source file opened

**Status:** OPEN
**Date:** 13 Nov 26
**Session context:** Chat 68, D2028's build on `claude/rules-check-small-batch` (a small engine change at the FULL tier)
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** The opening line a handoff writes; what a continuing chat loads at its start

**Issue:** The chat followed its opening line (the block, the backlog item, two briefs, three full rows) and then opened engine and screen files to read the code. Opening them loaded the project guide, the scheduler page, the screen-design page, the OIL page, the builder's rules and the design short form, each whole. The chat read 76% full after the reading alone, 90% by the time the fix and its tests were committed, with the walk, the reads and the gates all still ahead — so the job's long half starts on a compaction. No other open note was checked for the same cause (the log was not read beyond its highest number, 941, the same on every pushed branch).
**Suggested improvement:** In the session-handoff skill's step that writes the opening line: when the next step is a build with a FULL check, have the opening line say to write the reading of the code into a plan file and commit it BEFORE any fix, and name which checks a fresh helper should carry (the walk, the reads) so the host keeps room. Separately, a job for the rules diet's follow-up (D1960): measure what a scheduler-engine job loads on its first source file, as was done for the Leave War.
**Principle:** A chat's room is spent by what loads, not only by what it reads on purpose; when the pages a job loads are large, save the reading before the first edit and plan the checks around a compaction.

### Observation 943: A walk script's own checks must be proven on a known-clean and a known-changed screen before its result is believed

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** The host's own walk of a fix (D2028, chat 68) — a new script that changed a setting, made a change, took it back and published.
**Skill:** New skill candidate: walk-script writing (the project's `raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** Writing a new walk script — the step that takes a change back, and the script's own pass/fail lines

**Issue:** Two faults in a freshly written walk script, both in the script and neither in the app, each caught only because the host opened the pictures: (1) the put-back step pressed the keyboard's undo keys, which did nothing in the driven browser, so the "put back" picture still showed the change; the helper that presses the app's own Undo button worked. (2) The script's pass/fail line searched the page's whole text for the word that marks a waiting change, and matched the change history's count label instead, so it printed a failure on a clean screen.
**Suggested improvement:** In the walk-scripts guide: take a change back by the app's own button through the shared helper, never by a key press; and a script's pass/fail line reads one named element's text (the list's own empty line), never the page's whole text — and is run once against a screen known to be clean and once against one known to be changed before the walk's results are read.
**Principle:** A check written inside a test script is itself untested code: prove it can say both yes and no on known cases, and read the narrowest element that carries the answer, before trusting what it prints.

_13 Nov 26, chat 68 (the sim count fix and the two explanations): no observations beyond 943._
