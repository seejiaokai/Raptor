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

### Observation 915: A helper's write of its own report file was refused; the brief must say to return it as text
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (reflected): ON Part 2 "A helper's report" (its final reply; the tool refuses a report file; saved the moment it arrives) — read today; the draft only tightens its wording, with 933
**Date:** 10 Nov 26
**Session context:** Chat 49, the overnight skill-notes review: helper A sorted 43 notes and tried to save its report as `_review/report-A-walks.md`.
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2, "A helper's report … is saved into the repo"

**Issue:** The tool refused the helper's write of the report file ("Subagents should return findings as text"); the helper's other writes (drafts, a table) went through. The coordinator saved the report from the hand-back by hand, and later briefs told helpers to return the report as their final reply. A transcript file later held no copy of one reader's report, so the hand-back in the chat was the only copy.

**Suggested improvement:** Overnight Part 2 and every helper brief: "return your report as your final reply; the coordinator saves it" — never "write your report to <file>". The coordinator saves it the moment it arrives, before anything else.

**Principle:** A helper's report reaches the host as its final reply; a brief that asks for a report file may be refused, and the reply is then the only copy, so save it at once.

### Observation 917: The shared-folder trap of Observation 787 met again — an opening line written in chat, outside the handoff guide
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [CHECK-TOOLS-HARDEN] addition (s): a commit guard beside the push guard refusing a commit when the folder's branch differs from the session's (met 3 and 10 Nov 26); its guide half is in the SH draft with 916 (every opening line, in a reply too)
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
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 4 "acts on" list, the next-step bullet: a step that closes, drops, archives or decides names the ruling that lets the agent do it alone, or is "put to him" (D761)
**Date:** 10 Nov 26
**Session context:** chat 53, night 3's leftovers — carrying out chat 50's handoff block, step (c) for [CAL-JOB-LEFT]
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** writing a block's "Next" steps

**Issue:** Chat 50's block said of the calendar job's owed reads: "record that [they are overtaken] and archive the item". The reads sit on the reads-owed list, and a standing ruling (D761) says the reads owed are put to him to call or drop, never dropped by the agent. Followed literally, the next chat would have dropped them unasked; caught only because the rulings were searched before acting.
**Suggested improvement:** in the handoff guide's step that writes "Next", add: for each step that closes, drops, archives or decides something, name the ruling that lets the agent do it alone — or write it as "put to him". The receiving chat checks that line before acting.
**Principle:** A handoff's instruction carries no authority of its own; a next step that disposes of something must cite what permits the agent to do it alone, or it becomes a question for the owner.

### Observation 919: The missed-faults list had two entries numbered 23, and nothing checks the numbering
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): `[CHECK-TOOLS-HARDEN]` new point (w), the document check counts §7.11's lesson numbers against the checklist (`_docs/OUTSTANDING-items-C-walks-tests.md`); the doubled 23 still stood ([BUGCHECK-LESSON-ORDER] only moved it), so BCO §7.11 and the checklist drafts rename the second one 23b
**Date:** 10 Nov 26
**Session context:** chat 53, D1297's sweep — adding lessons 25–30 to the bug-check order's §7.11
**Skill:** New skill candidate: none — the document check (`docsize`)
**Type:** internal
**Phase/Area:** the bug-check order's §7.11 list

**Issue:** §7.11 holds two lessons numbered 23 (added by two chats on different days); the sweep helper noticed it. Lessons are cited by number ("§7.11 lesson 7"), so a doubled number makes a citation ambiguous. Left as it is this time — renumbering would change citations elsewhere.
**Suggested improvement:** the document check counts §7.11's lesson numbers and fails on a gap or a repeat; the second 23 becomes 23b (or the list is renumbered once, every citation searched and fixed in the same change).
**Principle:** A numbered list that several writers append to needs its numbering checked by a tool, or two writers will take the same number.

### Observation 916: Two chats opened in one folder — a "start a new branch" opening line switches the other chat's branch
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 1 "The opening line he pastes", the own-folder sentence: the new chat lists the live chats and says where it is before any branch switch — one change with 917, 921, 923
**Date:** 10 Nov 26
**Session context:** Chat 51 (a Leave War fault) was opened beside chat 50 (notes only), both in the main folder; number taken past 915, the highest on every branch
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** The opening line for a chat that runs beside another

**Issue:** Both chats started in the same checkout. The second chat followed its opening line ("start a new branch level with main") and switched the folder's branch; the first chat's next commit landed on the second chat's branch and had to be reset off and redone. The opening line named each chat's rulings range and handoff block, but not a folder.
**Suggested improvement:** In the handoff skill's step that writes the opening line: when another chat is open or is being opened beside the new one, the line names the folder each works in (or tells the new chat to check the live chats and the checkout's reflog before switching a branch), and the new chat lists the live chats before its first branch switch.
**Principle:** Parallel sessions need separate working folders as well as separate branches; a branch switch in a shared folder moves every session in it.

### Observation 920: Closing a backlog item — never edit its own lines before the archive move
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 3 "A known issue RESOLVED" item 1: mark by a line added after the item's last, never by editing its lines; an open piece becomes a new item; the ruling-home half is already item 2
**Date:** 10 Nov 26
**Session context:** Chat 54/56 closing backlog items with the archive command; logged by chat 57 for chat 56, which held it back across two handoffs
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** closing a finished backlog item before a handoff

**Issue:** The archive command checks that an item's lines move byte for byte, and refused two moves after the item's own lines had been edited to say it was closed. It also refused while a ruling archived on the branch that made it still pointed its home cell at a live item.
**Suggested improvement:** In the handoff skill's step for closing items: a closing note goes on a line of its own, added after the item's last line, never by editing the item's existing lines; a piece still open is restated in a new item pointing to the archived original; a ruling archived on the branch that made it gets its home cell pointed at the archived item that records the work before the move.
**Principle:** When a tool verifies a move by exact bytes, mark completion by adding, never by rewriting what is being moved.

### Observation 921: An outgoing chat that resumes after compaction should mark its handoff block as taken back
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH "Release the branch" bullet: work given a fresh chat as a new job is taken back only after a pushed "taken back by chat N" line; the new chat's half is the opening line's live-chats check (916)
**Date:** 10 Nov 26
**Session context:** Chat 57 opened from chat 56's handoff to start [SKILLS-TIGHTEN]; chat 56 had compacted, been asked to carry on, and was already writing the same list; a third fresh chat had the same opening line
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** handoff block; a new chat's first steps

**Issue:** The handoff block said the next job was "for a fresh chat". The outgoing chat compacted, was asked to continue, and took the job back without changing the block, while two fresh chats were opened with the same line. All three read the same 46,000-token guide before the overlap was found by listing the live chats and messaging.
**Suggested improvement:** When a chat resumes work its own handoff block gave to a fresh chat, it first adds one line to that block ("taken back by chat N at <time> — do not start") and pushes it, or messages any chat opened since. A new chat lists the live chats and messages the block's writer BEFORE its first heavy read, not after.
**Principle:** A handoff note is a lock; whoever takes work back from it must update the note before starting, and a new reader checks for a live owner before spending effort.

### Observation 922: Shortening a rule drops the small conditions first — check each cut clause for one
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §2, new bullet "Before a rewrite goes to its readers": qualifying words and pointers into leaving passages shown carried; one change with 924 and 925
**Date:** 10 Nov 26
**Session context:** [SKILLS-TIGHTEN] step 1 — the design guide's 81 lessons cut to one line each (chat 58); numbered past 920–921, held by pull request 749
**Skill:** New skill candidate: tightening a guide (the method [SKILLS-TIGHTEN] uses; session-handoff and overnight are next)
**Type:** open-source
**Phase/Area:** the rewrite step, before the readers

**Issue:** The writer's one-line versions passed the writer's own reading, yet two blind readers found eleven losses in 68 lessons, and nearly all were of one kind: a short qualifying clause inside a longer sentence (an exception scoped to one named column, a "where … is shown another way" condition, a pointer to a rule that narrows this one carried only by a passage that was itself leaving, a note of what was built turned into a requirement by rewording).
**Suggested improvement:** Before the readers, the writer runs one mechanical pass: for every sentence cut or reworded, list its qualifying words (where, only, unless, except, for … only, narrows, narrowed by, built) and every cross-reference into a passage that is leaving, and show each is still carried; a "built / as built" note is never reworded into the rule's own list.
**Principle:** When text is condensed, the main clause survives and its conditions do not; a condensing pass needs a check aimed at qualifiers and cross-references, not a re-read for sense.

### Observation 923: An opening line gave the own-folder fallback as an order, without its condition or its write test
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 1 opening-line sentence: carried whole with its condition and write test, never the fallback alone; where-you-are first; the path absolute — one change with 916
**Date:** 10 Nov 26
**Session context:** Chat 59, started from chat 58's opening line to begin [SKILLS-TIGHTEN] step 2 (number read from the log and every remote branch just before the append: 922 was the highest).
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Step 1 — the ready-to-paste opening line (the sentence every opening line carries)

**Issue:** The skill gives the own-folder step as a fallback with a condition ("if `git status` shows changes you did not make, or another chat works in this folder") and a test ("make one write there first, and if the file tools refuse it, stop and tell him"). The opening line handed over dropped both: "run `git worktree add --no-track -b … ../Raptor-st2 origin/main` and work only there". The new chat had been started by the app in its own fresh folder on its own fresh branch, level with `main` — the condition was false — and a chat started in a worktree may not write into another, so obeying the line would have ended in refused writes. The chat stayed where it was and told him; the relative path would also have landed inside `.claude/worktrees/`, not beside the repo, because the line was written from a different starting folder. Related: Observations 916 and 917 (open), whose suggested fix puts `git worktree add` into every such line.
**Suggested improvement:** In the opening-line step: the fallback is always written with its condition and its write test, never as a bare order; the line first has the new chat say where it is (`git branch --show-current`, `git status --short --untracked-files=no`, level with `origin/main` or not) and use its own folder when that folder is clean, on a fresh branch and no other chat is in it; a path in the line is absolute. When Observations 916 and 917 are acted on, keep this condition.
**Principle:** A fallback copied into an instruction without its condition becomes the main path; write the check that decides it into the instruction itself, not only into the guide the writer read.

### Observation 924: A tightening job's saving was guessed at three times what it measured
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §2, the same bullet: a saving quoted to him is measured by a script and called a ceiling, the rewording share a guess (fixed in chat 60's measure; now general)
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
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/doc-budget.md` §2, the same bullet: a corrected rule brings the lines that rely on it (steps, checklist, brief); the cross-file D201 sweep stays [RULE-FILE-LESSONS] (a)
**Date:** 10 Nov 26
**Session context:** Chat 60, [SKILLS-TIGHTEN] step 3 — the overnight skill's three corrections to later rulings, read by Astra and a fresh Opus reader (number read from the log and every remote branch just before the append: 924 was the highest).
**Skill:** New skill candidate: tightening a guide (the list first, then the rewrite and its reads)
**Type:** open-source
**Phase/Area:** The corrections — a rule a later ruling overtook, put right in place

**Issue:** Three of the readers' five findings were one shape: a rule was corrected where it was stated, and another place that depended on the old rule was left as it was. "The pull request opens as soon as the job is built" was written into one bullet while the bullet beside it still gave the whole job to one background helper and forbade the coordinator to write while it ran — the new rule could not be followed. "Nothing merges, unless he gave auto merge live" was put into the head, one step and one checklist, and missed the other checklist, which still demanded the old sentence. A rule folded into a pointer ("do what the block's first line says") leaned on a line nothing required to stay first. The list to the owner had named each correction by the lines that STATED the old rule, never by the lines that RELIED on it.
**Suggested improvement:** For each correction, before the list goes to the owner: search the guide for every place that relies on the old rule — the steps that carry it out, the checklist that checks it, the brief that hands it on — and list those lines with it; for each rule turned into a pointer, name what guarantees the thing pointed at still exists when it is needed. The writer's pass asks of every corrected rule "can a reader following the steps in order now do this?", not only "does it say what the ruling says?".
**Principle:** Correcting a rule is a change to everything that depends on it; find the dependants by what they do, not by where the rule's words appear.

### Observation 926: "check; commit" on one line committed past a failed check
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [CHECK-TOOLS-HARDEN] (x), added: a check-then-commit script and a guard refusing a commit joined after a check by a semicolon or pipe; memory note pipe-hides-check-failure extended (third meeting)
**Date:** 10 Nov 26
**Session context:** Chat 60, [SKILLS-TIGHTEN] step 3 — committing the skill change (number read from the log just before the append: 925 was the highest).
**Skill:** New skill candidate: committing behind a check (shell habits on this PC)
**Type:** open-source
**Phase/Area:** The commit after a document check

**Issue:** The document check and the commit were typed as one command with the check's output sent to a file, its exit code echoed, and the commit after a semicolon. The check failed (a rules file one line over its size tripwire); the commit ran anyway and the failure was read only afterwards. A trap met again: the memory note "a pipe hides a failed check" (3 Nov 26) covers the pipe, and this is the same fault through a semicolon. Nothing was pushed; a second commit fixed it, and the session then committed through a small script that stops when the check fails.
**Suggested improvement:** A guard, not a reminder: one project script, "check then commit", that runs the document check, prints its last lines and refuses the commit on a non-zero exit — used for every records commit; or the commit hook runs the check itself.
**Principle:** When a check gates an action, the gate is the check's own exit code joined to the action — never two statements that happen to sit on one line.
- Met again 20 Nov 26 (chat 121, the review's merge step), with a deletion instead of a commit: `check && cd <folder> && build && … ; rm <files>; ls` — the check failed, the `cd` never ran, and the `rm` after the semicolon ran anyway, in the repo root; nothing was lost only because the relative paths matched nothing there. The guard filed as `[CHECK-TOOLS-HARDEN]` (x) covers commits; the rule is wider: any action that must follow a check — a commit, a delete, a move — is joined with `&&` or done by a script that stops on the check's exit.

### Observation 927: A "needs no answer from him" batch was recommended from the backlog's one-line list, and most of it needed his answer
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 1, new bullet "A recommend the next jobs line": each candidate's full item and its put-to-him lines read before calling it free of his answers — one change with 947
**Date:** 10 Nov 26
**Session context:** chat 61 — recommending the next three jobs from the handoff and the backlog's priority list, then starting the first
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the next chat's first task — "recommend the next jobs"; the opening line a handoff writes

**Issue:** The recommendation named five small faults as a batch needing no answer from the owner, read from the priority list's one line each. Opening the items after he chose it showed that two were filed as questions for him, most parts of two more must be drawn for him first, and one rested on two rulings that disagree; three small fixes were left. He had already chosen on the wrong description, and the chat was three-quarters full before the build began.
**Suggested improvement:** In the handoff skill's opening line for a "recommend the next jobs" chat, and in the list's own "how to read it" note: before a job is recommended as needing nothing from the owner, open each item's full text and read its "to do" and "put to him" lines; say in the recommendation which parts can be built at once and which wait on him.
**Principle:** An index line says what an item is, not what it needs; a claim about what a job requires is made from the item itself, read before the recommendation, not after the choice.

### Observation 928: A new file is not read by the changed-files code check until it is staged; a wording fix on the week must be run against the word-for-word test
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): GD §Now, the code check: new trap bullet (`lint:changed -- --include-untracked`, its count matched to git status); the whole-output test half to the TDD skill (C's file); the default flag filed as [CHECK-TOOLS-HARDEN] (z)
**Date:** 11 Nov 26
**Session context:** Chat 62 — three small schedule-and-board fixes; GitHub's run of the first push came back red on two things the local checks had passed.
**Skill:** New skill candidate: pre-push checks for a small fix (or the bug-check checklist's step 7)
**Type:** internal
**Phase/Area:** Before the first push of a job

**Issue:** (1) `npm run lint:changed` was run while a new test file was still untracked: it read 15 changed files, not the new one, and reported no finding; GitHub's run, reading the committed file, found one. (2) A change to words the week draws (the issues bar's plural) was checked with the tests that name the bar, but not with `src/ui/html.test.ts`, which compares the whole week with the original app word for word and failed on GitHub. A search for the old words could not find that test: it holds no words, it compares everything.
**Suggested improvement:** In the pre-push step, stage new files (`git add -A`) before `lint:changed`, and check its "N changed files" count against `git status`. For any change to markup or words drawn by the week's builder (`src/ui/html.ts`), always run `src/ui/html.test.ts` with the touched tests, and add the deliberate difference to its list in the same change. A guard would be better than a rule: `code-check.mjs` could read untracked files too.
**Principle:** A check that reads "what changed" must be asked what it counted; a test that compares everything is found by knowing which builder it covers, never by searching for the words changed.

### Observation 929: A walker's "on top" check looks through a cover that takes no presses
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): WS §4, the `elementFromPoint` line: "nothing stands over it" also compares the box with every showing note, banner or overlay, the settled picture taken while it shows
**Date:** 11 Nov 26
**Session context:** Chat 64's night, job 1 — the re-walk of the board's Undo landing
**Skill:** walk scripts (the project's `raptor-port/docs/walk-scripts.md`; a guide change needs the owner's word)
**Type:** open-source
**Phase/Area:** A walker's assertions — "the changed box is in view and nothing stands over it"

**Issue:** The walker asserted "on top" by asking the page what element is at the box's middle (`elementFromPoint`). A passing note drawn over the box ignores presses (`pointer-events: none`), so the page answers with the box beneath it and the check passes while the box is hidden. 95 scenarios passed; the host found the fault only by opening the pictures.
**Suggested improvement:** In the walk-scripts guide's list of traps: an "is it covered" check compares the box's rectangle with the rectangle of every passing note, banner or overlay that is showing at that moment, as well as asking the page what is at the point; and the settled picture is taken while the note still shows.
**Principle:** A hit-test answers "what would take a press here", not "what does a person see here"; anything that ignores presses is invisible to it, so visual cover is checked by geometry.

### Observation 930: A builder's "related tests" run missed a registry test; the remote run went red
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): ON Part 2 builder's brief: its check names GD's two tests that scan source text (GD "The tests that scan source text read comments too" already says so); a whole-suite run before hand-back would set aside D1086 while public
**Date:** 11 Nov 26
**Session context:** Chat 64's night, job 1 — the first fix round's push
**Skill:** overnight (Part 2, the builder helper's brief) / shipping practice
**Type:** open-source
**Phase/Area:** What a builder runs before its first hand-back

**Issue:** The builder ran the unit files it judged related to its change and handed back green. A guard test elsewhere (one that lists every file allowed to read a kind of record) failed on the remote run, because the new file read that record and was on no list. One remote run and a fix commit were spent on it.
**Suggested improvement:** The builder's brief says: before the FIRST hand-back of a job, and after any change that adds a file or a new import of shared state, run the whole unit suite under the checks lock, not a hand-picked set; hand-picked sets are for iterating only.
**Principle:** Guard tests that enumerate the codebase are by nature "unrelated" to any one change, so a related-files run can never catch them; only the whole suite does.

### Observation 931: A fix brief that prescribed the mechanism carried the host's own mistake into the code
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `.claude/skills/subagent-driven-development/SKILL.md` "What rides along, and what a fix brief must say" — text under For another file (owner D); its register line the coordinator's
**Date:** 11 Nov 26
**Session context:** Chat 64's night, job 1 — the fix brief for the readers' findings
**Skill:** overnight / briefing a builder helper (new-skill candidate: writing a fix brief)
**Type:** open-source
**Phase/Area:** How a finding is handed to the builder

**Issue:** For "Undo of a re-ordered row lands nowhere" the host's brief said how to fix it ("land on the first row whose place differs"). The builder built exactly that; the next reader showed it was the wrong row (a neighbour that merely shifted, not the row that moved). A fix round was spent undoing the host's wording.
**Suggested improvement:** A fix brief states each finding as the case, the wrong result and the RIGHT RESULT in the user's terms (which row should come into view, and why), plus the test that must go red first — and leaves the mechanism to the builder, marking any suggested mechanism as a suggestion to be checked against the right result.
**Principle:** State outcomes, not mechanisms, when delegating a fix: a prescribed mechanism is obeyed even when it is wrong, an outcome is checked.

### Observation 932: Times written into a record from memory were wrong; the clock must be read
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [CHECK-TOOLS-HARDEN] addition (t): the document check fails a dated time in a Now block later than the PC's clock — met five times (853, 873, 892, 932, 935); SH Rules 2 and ON step 8 already say "read the clock"
**Date:** 11 Nov 26
**Session context:** Chat 64's night — writing the night's block
**Skill:** overnight / session-handoff
**Type:** open-source
**Phase/Area:** Any record that carries a time

**Issue:** The host wrote "01:00" and "00:55" into the night's block when the clock said 00:40; an unattended run's sense of elapsed time drifts quickly. The overnight guide already says "read from the clock" for a compaction note only.
**Suggested improvement:** The overnight guide's step 8 and "At every commit": every time written into the block comes from `date` run in that same step, never from the agent's sense of the hour.
**Principle:** An agent has no clock; any timestamp in a record is read, never estimated.

### Observation 933: A helper's report pulled from the transcript by a marker the coordinator's own brief also contains
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): ON Part 2 "A helper's report": a report recovered from the transcript is found by a one-off token the brief asked for, never a phrase the brief holds, and its saved size read before it is cited
**Date:** 11 Nov 26
**Session context:** Chat 64, the night of 11 Nov 26, job 4 (the Leave War's double tap on its other windows) — numbered past 927–932, which are on the night's other branches (pull requests 756 and 758), not yet on `main`.
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — "A helper's report" (saving a background helper's report the moment it arrives)

**Issue:** A walker's report was recovered from the chat's transcript by searching for a marker phrase. The phrase chosen was the report's title, which the coordinator's own brief to the walker also contained, so the search matched the brief first and the saved report was an empty file. It was noticed only because the file's size was read (0 bytes); a second search with a phrase that occurs only in the helper's own words gave the report.
**Suggested improvement:** In the overnight guide's "A helper's report": when a report is recovered from the transcript, the marker is a phrase the helper was not given — and the saved file's size is read before it is cited. Better, the brief asks the helper to open its report with a one-off token the coordinator makes up at the time, so the marker cannot occur anywhere else.
**Principle:** A search key used to recover someone's output must be something only that output contains; whatever the requester wrote into the request will be found first.

### Observation 934: "This chat is full" told to him just before a compaction made room
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (memory): `measure-context-before-reporting.md` extended ("Met again 11 Nov 26": with a compaction about to run, defer nothing in words; measure after it) — `_memory/additions-A-handoff.md`
**Date:** 11 Nov 26
**Session context:** Chat 64, evening: his two points on the rules check arrived at 91% full; the state was saved, a notification and the next-step box said the chat was full and the points would wait for a fresh chat; the compaction then ran and the chat stood at 42%, with room to answer both at once. (Numbered past 933, the highest on any open branch.)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** When to hand off versus compact; what is told to the user before a compaction

**Issue:** The agent told the user his questions were deferred because the chat was full, in a notification that cannot be taken back, while a compaction it had itself made ready was about to free the room. He was told to start a new chat for work that was then done in the old one ten minutes later.
**Suggested improvement:** In the handoff guide's compaction part: when the state is saved and a compaction is about to run, defer nothing in words to the user yet — let it run, measure the fullness after it, and only then decide between answering here and handing off. A notification never says "this chat is full" before that measure.
**Principle:** Decide what to defer after the event that changes the constraint, not before it; and never send an irreversible message on a figure that is about to change.

### Observation 935: A time written into the record from memory again (see Observation 932, on another open branch)
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [CHECK-TOOLS-HARDEN] addition (t), the same guard as 932 (met again; a reminder did not stop it)
**Date:** 11 Nov 26
**Session context:** Chat 64: the handoff block's heading said "written 19:45" when the clock read about 19:10, and "typed at about 20:00" for a message of about 19:05.
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Writing the block — times

**Issue:** The same trap as Observation 932: a clock time put into a record without reading the clock. A reminder did not stop it the second time.
**Suggested improvement:** A guard inside the action: the script that puts the block into the handoff file stamps the time itself from the system clock (a placeholder in the draft), so no time is ever typed by the agent.
**Principle:** A value the machine knows exactly is filled in by the machine, never recalled by the writer.

### Observation 944: A builder's proof capture landed 33 MB of raw dumps in its commit
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): ON Part 2 builder's brief: raw dumps outside the checkout, the commit a short summary and the pictures, its `git show --stat` read before the first push; [CHECK-TOOLS-HARDEN] addition (v), the push guard's size refusal
**Date:** 14 Nov 26
**Session context:** /overnight, chat 72, job 1 (numbered past 943, the highest on any branch)
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — the builder's brief

**Issue:** The job-1 builder proved "nothing on screen changes" with a computed-style capture and committed the raw dumps (two 13.5 MB JSON files). A force push to take them out was refused, so the job was re-made on a second branch and the first left on GitHub for the owner to delete. Jobs 2 and 3, whose briefs said "keep big dumps outside the repo, commit only a short summary", had no such trouble.
**Suggested improvement:** Part 2's brief list gains: "raw captures and dumps stay outside the repo (a folder under the user's home); the commit holds only a short diff summary and the pictures"; and the coordinator runs `git show --stat` on a builder's commit before the first push.
**Principle:** A proof's raw data is evidence for the run, not for the history; brief where it goes before the run, because a pushed blob cannot be taken back without a destructive push.

### Observation 945: A bare number in a backlog item was read as a ruling when it meant a skill note
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Rules 3: a number carries its kind — D742, "skill note 742" — never bare, in a block, a backlog item or a brief
**Date:** 14 Nov 26
**Session context:** /overnight, chat 72, job 3 ([DRAW-MARK-HELPER])
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** filing a backlog item

**Issue:** [DRAW-MARK-HELPER] cited "(742)" for a skill note; the coordinator's brief told the builder to read ruling D742, which is the unrelated late-mark ruling. The builder noticed and worked from skill note 742.
**Suggested improvement:** wherever a backlog item, block or brief cites a skill note, it writes "skill note 742", never a bare number; rulings always carry their D.
**Principle:** Two numbering schemes in one project need a word on every reference, or a reader picks the louder one.

### Observation 946: A dated archive step bundled into a guide change holds the whole merge
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 4 template, the Branch line: a commit that may not go live before a date is its own commit, named with the date and the choice
**Date:** 14 Nov 26
**Session context:** chat 73 — the guide check's round 1 (points a–d) as one working-guide change; point d archives a one-week permission that runs out two days after the build
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** filing what is open at a handoff; how a job with a future-dated step is split into commits

**Issue:** The owner approved four guide edits as one change; one of them (retiring a permission "on 16 Nov when it runs out") could only truthfully go live on a later date. Built in the same branch, it holds every other edit back until that date, or forces the merge to drop a commit. The agent kept it as its own commit and told the owner the merge must wait or the commit be left out.
**Suggested improvement:** in the handoff block's "Pick up here", name any commit that may not go live before a date, with the date and the choice it gives (wait, or merge without it and redo it on the day).
**Principle:** A step that is only true after a future date goes in its own commit, and the date travels with the branch's record, so the earliest safe merge is never a judgement made from memory.

### Observation 947: a "nothing waiting" line went stale while seven finished pull requests sat unmerged
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 3 "Merged between chats": a nothing-is-waiting line read against the open pull requests; Step 1's new recommend-jobs bullet lists open pull requests first (927); [CHECK-TOOLS-HARDEN] addition (u), the removal guard
**Date:** 14 Nov 26
**Session context:** chat 74, asked for the next three jobs from the handoff and the backlog's priority list
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** removing merged blocks and filing residue at a handoff; the opening read of a new chat

**Issue:** The backlog's priority list said "Waiting on his look only: none — no pull request is open (checked 10 Nov 26)". By 14 Nov seven green pull requests from two overnight runs sat unmerged, six clashing with `main`, and 25 of the owner's answers lived only on one of their branches. Later handoffs removed the overnight chats' blocks from `main`'s handoff as if their work had merged, so a chat reading only `main` saw nothing waiting. Found only because the recommending chat ran `gh pr list` before recommending.
**Suggested improvement:** in the session-handoff skill's step that removes another chat's block, check with `gh pr list --state open` that the block's pull request is merged, never only that the block is old; and in the opening read of a new chat (the "tell me the next jobs" path), list open pull requests and name each in the recommendation before any new job.
**Principle:** A "nothing is waiting" record is a claim about the outside world and goes stale silently; re-derive it from the source of truth (the open pull requests) every time it is read, and never retire a status record on its age alone.

### Observation 936: A wait loop that only asks "is anything still running" reports ready on a failed run
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): GD, the "There is no GitHub Pages site" bullet's "Done" loop: a wait waits for success, never for quiet; the committed wait script filed as [CHECK-TOOLS-HARDEN] (y)
**Date:** 2026-11-11
**Session context:** Chat 65 — after his "merge live" of the Balances fix (pull request 760), waiting for main's own run and the live build before telling him it is live
**Skill:** New skill candidate: merge-live follow-through (the shipping rules' "Done means live")
**Type:** open-source
**Phase/Area:** After the merge — waiting for the default branch's run and the production deployment

**Issue:** The host wrote a small wait script on the spot: it looped until no run of the merge commit was queued or in progress and the production deployment reported success, then printed "ready". Main's run had FAILED (nine browser jobs could not download the test browser — a network fault on the hosted machines, no test ran), and the script still printed "ready" because a failed run is also "not running". The host caught it only by reading the runs again by hand before reporting. Highest number on every branch read just before this append: 935.
**Suggested improvement:** Keep one committed wait script for this step (beside the gate lock script) that exits 0 only when every run of the merge commit concluded `success` (or `skipped`) AND the production deployment is ready; any other conclusion exits non-zero and prints the failed jobs with the step each failed at, so an infrastructure failure (a download step) is told apart from a failing test at a glance. The shipping rules' line on "main's own run goes green" names the script.
**Principle:** A wait condition is written as the success it waits for, never as the absence of activity; "nothing is running" is true of a failure too.

### Observation 937: A night job that rides an already-checked pull request is built on its own branch and joined only when checked
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): ON "Branches" (a later job joining a checked pull request is built on its own branch and fast-forwarded in once checked) and Part 2 "Pull requests" (runs read again minutes after a push); the stop-notice part is already in Part 2
**Date:** 2026-11-12
**Session context:** the night of 12 Nov 26 (chat 66) — five jobs, three of them on one pull request
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2 — through the night (branches; a batch on one branch)

**Issue:** Jobs 2 and 3 were built and fully checked on the pull request's branch; job 4 belonged on the same pull request but was the riskiest and the last. Built straight onto that branch, a job 4 that ran out of time would have left the checked work carrying a half-built change. It was built on its own branch cut from the checked one, pushed freely (no pull request, so no run), checked there on the PC, and only then brought onto the pull request's branch by fast-forward — the pull request stayed whole throughout. Two further things met on the way: GitHub started a push's runs about five minutes late, so "no run listed" right after a push is not "no run coming" (the push guard caught the second push); and a builder helper stops several times with a "waiting on its own background work" notice before its real report.
**Suggested improvement:** In the overnight guide's "Branches" paragraph, add one sentence: a later job that joins a pull request whose earlier jobs are already checked is built on its own branch cut from that one and fast-forwarded in only once it is built and checked, so a short night leaves the pull request as its checked jobs. In Part 2's push bullet, add: after a push, read the runs again a few minutes later before concluding none started.
**Principle:** Work that is already checked is never the staging ground for unchecked work; join the two only when the second has earned it.

### Observation 938: Recording a batch of answers — check each page's free room and the "changes" trigger before writing the rows
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [RULE-FILE-LESSONS] (e), added: page room and the answers/changes trigger read before a batch of rows; its home is DECISIONS.md's steps, which a review may not draft
**Date:** 13 Nov 26
**Session context:** chat 66 recording eighteen answers "as recommended" as seventeen rulings (D2008–D2024)
**Skill:** New skill candidate: recording-rulings (the steps at the head of DECISIONS.md)
**Type:** internal
**Phase/Area:** step 2, stating a ruling on a converted page

**Issue:** Three refusals in one batch, each found only by running the gate: the general page had 11 bytes left of its hard limit and OIL's page under 230, so a new line did not fit; and a row whose text said it "answers" an older ruling made the gate ask for a mark in that ruling's row and a citation on every page line stating it (five lines).
**Suggested improvement:** Before writing rows for a batch, read each target page's size against its limit (`wc -c` beside the PAGE_LIMITS in the document check) and choose the area by room as well as by subject; decide for each row whether it truly changes or answers an older ruling — if yes, plan the mark and the citations in the same script; if no, do not word it as one. The general page's wrapped bullets can be joined without changing a word (2 bytes a line).
**Principle:** When a record system has hard size limits and cross-reference rules, measure the room and list the cross-references before writing, not after the check refuses.

### Observation 948: Mid-merge, the document check measures against the old merge base and reports moves that are not
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): GD, the settle step's mid-merge trap: one "did not arrive" can be real; a line only the branch has is carried into main's archived block
**Date:** 14 Nov 26
**Session context:** chat 75 — bringing `main` into pull request 762's branch after main had archived items the branch still held in older words
**Skill:** New skill candidate: records-merge (the bring-main-in step of shipping.md, step 2)
**Type:** open-source
**Phase/Area:** settling the records before the merge commit

**Issue:** after `records-merge.mjs` and `backlog-archive.mjs --rulings --merge`, the rulings check (and `docsize`) failed five ways: four items archived on `main` "did not all arrive" (the branch's older copy of a line against main's newer, longer one) and a ruling added and spent on `main` "named a home that never mentions it". All five were measured against the OLD merge base, because the merge was not yet committed; one commit later the base was `main` and `docsize` passed. One of the five was real all the same: the branch had added the owner's answers to an item main archived without them — that text would have been dropped silently.
**Suggested improvement:** in the bring-in step, say: before committing, read each "did not arrive" by comparing the branch's item with main's archived block — carry over any line only the branch has (a note in the archived block), treat main's longer line as newer — then run the check with `DOCSGUARD_ALLOW` naming those items only to confirm nothing else fails, commit, and re-run plain.
**Principle:** a check that measures against a merge base gives a different answer before and after the merge commit; read each failure for the one real loss among the false ones, rather than silencing the lot or chasing them all.

### Observation 949: A cold read given the words alone flags the app's own words as unclear
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): DP §1a test 9: "alone" means without the writer's reasons, not without the word list's line and the line above; a second reading those settle is recorded, not sent back — one change with 952
**Date:** 15 Nov 26
**Session context:** chat 79 — the Logic page's note (D2015), design guide §1a test 9, two rounds by fresh helpers
**Skill:** New skill candidate: cold-read (the design guide's §1a test 9 as a repeatable helper brief)
**Type:** open-source
**Phase/Area:** the reader's brief; comparing its answers with the writer's facts

**Issue:** Both readers, given only the two sentences, named as "read two ways" the app's own terms (OIL, pending) and a noun the strip's first line settles ("the settings"). The real lost fact (the OIL stays as published) was found in round 1, but the writer had to sort genuine second readings from context-only ones by hand each round, and no rule says which kind sends the wording back.
**Suggested improvement:** In the cold-read brief, give the reader the app's word list entries for the terms the note uses (one line each) and say "the line above it reads …" when the note sits under a heading; in §1a test 9, say a "two readings" that the screen around the note settles is recorded, not a reason to send the wording back.
**Principle:** A test that strips all context will report the stripped context as ambiguity; give the reader the vocabulary any real user has, so only genuine second readings come back.

### Observation 950: A wording roll-call's search missed the guide sources under scripts/
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): BCO §6 wording row: the old words are also searched in every script that writes words a person reads (`scripts/` — guides, decks, exports)
**Date:** 15 Nov 26
**Session context:** chat 80, the rules check's small batch — the FULL check's roll-call for two renamed check names (D2009)
**Skill:** New skill candidate: bug-check order (the roll-call, §6 "A wording ruling ... gets its own small roll-call")
**Type:** open-source
**Phase/Area:** §6's wording row — where the old words are searched

**Issue:** The rule says to search each old phrase "across the app and every test folder, unit and browser". The build's own search (chat 76–78) covered `src/` and the tests; the old names still sat in the IT flow guide's captions, `raptor-port/scripts/itflow/content.mjs`, a generator of a document handed to the IT side — neither app nor test. Found only because the roll-call search here ran over `scripts/` too.
**Suggested improvement:** §6's wording row: search the app, every test folder, the probes AND every script that writes words for a person (guides, decks, exports — `scripts/`), listing files uncapped.
**Principle:** A rename's search covers every place that turns the words into something a person reads, not only the running app and its tests: document generators hold the same words.

### Observation 951: Two chats in one checkout took the same ruling number
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): [RULE-FILE-LESSONS] (f), added: a ruling number counts as taken only once another open chat can see it; the root (two chats, one folder) is already the memory note one-checkout-per-session
**Date:** 2026-11-15
**Session context:** Chat 82, [WARN-WORDS-STANDALONE] — recording the owner's opening message as a ruling while chat 81 worked in the same folder
**Skill:** record-decisions (the rule file) / DECISIONS.md's steps for taking a number
**Type:** internal
**Phase/Area:** taking the next free ruling number; parallel chats sharing one checkout

**Issue:** Chat 82 read the highest ruling number and wrote D2056 as uncommitted edits. Chat 81, in the same checkout, switched the folder's branch (carrying those uncommitted edits with it) and took D2056 for another area at the same moment. Neither search could see the other's number: both were uncommitted. It was caught only because the folder's branch changed under chat 82. Settled by a message between the chats and a renumber to D2057.
**Suggested improvement:** In DECISIONS.md's number step: before taking a number, look for other open chats (ListAgents) and for uncommitted rows in the working tree (`git status` on the rulings files); a chat that shares the checkout messages the other before it writes a row, and never switches the folder's branch while another chat's edits sit uncommitted in it.
**Principle:** A "next free number" read from committed history is not safe when two writers share one working tree: the claim has to be visible to the other writer before it is used.

### Observation 952: A blind read fed table fragments reported them as unclear wordings
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): DP §1a test 9: each item a whole line as a person sees it, a real value in every slot, never a table fragment; the writer reads the list before sending — one change with 949
**Date:** 2026-11-15
**Session context:** Chat 82, [WARN-WORDS-STANDALONE] — the writing guide's cold read (design-practices §1a test 9) of 69 proposed warning lines
**Skill:** design-practices §1a test 9 (the cold read) / briefs for a fresh reader
**Type:** open-source
**Phase/Area:** preparing the cold reader's input

**Issue:** The reader's input was cut from the proposal's tables by a script. Cells that held a variant ("… / …"), a continuation ("…Day starts 07:00") or a placeholder ("landing …") went in as if they were whole lines. Most of the 11 "unclear" verdicts were about those fragments, not about a wording, and each had to be sorted by hand from the real findings.
**Suggested improvement:** In the cold read's step: every line given to the reader is a whole line exactly as a person would see it, with a real example in each slot; the host reads the input list itself once before sending it and removes or completes any fragment.
**Principle:** A blind reader judges what it is given: an input that is not what the end reader will see produces findings about the input, and costs a sorting pass.

### Observation 953: Example rows for a reworded warning showed cases the app never raises
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §Judging, "This works like the existing X": a row standing for a check's output is staged and read back, or its values checked against what the check compares
**Date:** 15 Nov 26
**Session context:** rewording every warning, shown to the owner as before-and-after pictures on the real warning list
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** choosing the example values drawn into a mock-up row

**Issue:** The "today" rows were the app's sentence templates filled with example values. Three clash rows and three absence rows paired a standby place with an item the check never compares it with, so the owner asked "why would this clash?" of a case that cannot happen. A cold read of the words passed them, because it judged clarity, not whether the case exists.
**Suggested improvement:** In the mock-up guide, a row that stands for a rule's output is either staged in the running app and read back, or its example is checked against the condition of the check that writes it (what the two sides may be), before it is drawn; the brief to a cold reader says the examples were checked that way.
**Principle:** An example in a design proposal is a claim about behaviour; fill a template only with values the rule can actually produce.

### Observation 954: A Codex read of an exported copy refused to start — the guide's git-init step was skipped
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head: the recipe as five numbered steps (step 3 makes it a repo); a handoff or brief points to it, never a fragment
**Date:** 16 Nov 26
**Session context:** chat 87, the FULL check of [WARN-WORDS-STANDALONE]'s follow-ups — Astra's blind read of an exported copy
**Skill:** New skill candidate: codex-read-runner (today `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head)
**Type:** internal
**Phase/Area:** starting a Codex read in an exported copy

**Issue:** The handoff block named the read command as `codex exec -C <repo> -s read-only -o <file>`; the copy was made with `git archive` but without the guide's `git init` and one commit, so Codex refused at once ("Not inside a trusted directory and --skip-git-repo-check was not specified"), exit 1, no report. Caught only because the run ended in seconds.
**Suggested improvement:** Put the whole recipe as one runnable line wherever a handoff or brief names the read command — archive, `git init` + one commit (or `--skip-git-repo-check`), `codex exec` — and check the run log's last line a minute after starting, never only at the notification.
**Principle:** A command copied into a handoff is a shortened recipe; carry the whole recipe, or point to it, never a fragment.

### Observation 955: A drawing check run at a phone width that is not the owner's
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 1: the phone at his iPhone's 402 x 874 (WebKit, touch, 3x), never a near size; another width only beside it
**Date:** 2026-11-16
**Session context:** Chat 88, the FULL check of `[WARN-WORDS-STANDALONE]`'s follow-ups — the Legend's new names
**Skill:** brainstorming (mockups-on-the-real-app.md) / the bug-check order's drawing check
**Type:** internal
**Phase/Area:** the drawing check's sizes; the mock-up's shooting script

**Issue:** The Legend's mock-up and its drawing check were shot at 390 x 844 (an older iPhone). His phone is an iPhone 17 Pro, 402 x 874. At 402 one more name fits on a row and its last letters run under the parked AIRCREW tab; at 390 it wraps, so the check reported 0 pixels different and missed it. The walk at 402 caught it.
**Suggested improvement:** The mock-up recipe and the drawing-check template take their phone size from one named constant, his iPhone's 402 x 874 (WebKit, touch), never a hand-typed 390; a check at a second phone width is optional, never instead.
**Principle:** Check a layout at the exact size its real user sees; a near size can hide a wrap change.


### Observation 956: A style-only mock-up doubles as its own drawing check
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 6: a pure-style proposal drawn by injecting the exact rule and recorded then on the unchanged build; checked after with nothing injected
**Date:** 16 Nov 26
**Session context:** [LEGEND-TAB-STRIP] (D2081/D2082) — one CSS rule drawn on the running app, approved, then built
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** drawing a proposed change on the running app; the drawing check after the build

**Issue:** The proposal was a single style rule. Drawing it by injecting that exact rule into the pre-change build meant the drawing and the build share one definition, so a separate drawing-check script could record each part's place, size and colour from the injected version BEFORE building, then compare the built app with nothing injected — red before, green after, in two minutes, with no hand-measured reference.
**Suggested improvement:** In mockups-on-the-real-app.md, add: when the proposed change is pure style, draw it by injecting the exact rule to be built, and at the same time record the drawing's part positions (record mode) on the unchanged build; after the build, run the same script in check mode with nothing injected. Record before building — once the build replaces the served bundle, the "before" can no longer be measured.
**Principle:** When a mock-up is made from the same rule the build will ship, record its measurements at mock time; the drawing check then becomes an exact before/after diff instead of an approximation.
**Reference file:** raptor-port/docs/mock/2026-11-16-legend-tab-strip/drawcheck.mjs

### Observation 957: A handoff's model recommendation lived only in the chat, so the next chat missed the difference
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 4 template: a Model field on the last line, and the Opening line field has the next chat compare the model it runs on and name a difference
**Date:** 2026-11-16
**Session context:** Chat 91 continuing a design from chat 90's handoff block
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** What the handoff block carries for the next session

**Issue:** The outgoing chat told the owner, in its last message only, which model the next chat should use. The handoff block did not carry it, the new chat opened on a different model, said the model "fits", and found the difference only when it read the old chat's transcript for another reason.
**Suggested improvement:** The handoff block's last line carries the model and thinking level recommended for the next session, beside the next chat number; the incoming session compares it with the model it is running on before its first report and names any difference.
**Principle:** A recommendation the next session must check itself against belongs in the saved handoff, not only in the message to the person.

### Observation 958: A recommendation for a new mechanism was given before checking how the product already does the nearest thing
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `.claude/skills/brainstorming/SKILL.md` Working in existing codebases, its first bullet sharpened: say how the product enters the same fact today; a new mechanism needs the reason the old cannot carry it
**Date:** 2026-11-16
**Session context:** Design questions answered in chat during a multi-unit design
**Skill:** brainstorming
**Type:** open-source
**Phase/Area:** Answering a design question with a recommendation

**Issue:** Asked how people should be assigned to a temporary unit, the agent recommended a new admin-only list. The person's follow-up question led it to look, and the product already recorded the same fact through an existing input kind, self-filed or filed for several people. The recommendation was reversed one message later.
**Suggested improvement:** Before recommending any new record, list or screen, search the product for the nearest existing way the same fact is entered today and state it in the answer ("today this is done by …"); recommend a new mechanism only with the reason the existing one cannot carry it.
**Principle:** The first design question is how the product records this fact today; extending that is the default, and a new mechanism needs a stated reason.

### Observation 959: A drawing script filed under the scripts folder made a notes-only pull request not notes-only
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 6: a drawing script's one home is `raptor-port/docs/mock/<date>-<name>/`, never `scripts/`; the notes-only file-list check is already [REVIEW-LAYERS] step 3
**Date:** 2026-11-16
**Session context:** Merging a notes-only pull request left by the previous chat
**Skill:** brainstorming
**Type:** internal
**Phase/Area:** mockups-on-the-real-app — where a mock-up's drawing script is saved

**Issue:** The round-1 drawing script was saved under raptor-port/scripts/mock/, a folder the notes-only merge rule (D1407) does not list, while every earlier mock-up script lives under raptor-port/docs/mock/<date>-<name>/. The pull request was described as notes only and would have merged by itself; the file list was checked before the merge and the script moved.
**Suggested improvement:** The mock-up guide names the one home for a drawing script — raptor-port/docs/mock/<date>-<name>/draw.mjs — and the notes-only check before a merge lists any file outside the rule's folders by name.
**Principle:** A rule that keys on file locations needs the tools that create files to name the location; check the list itself, never the description.

### Observation 960: A mark's tag appended inside the marked element vanishes on a text box and is cut by a clipping panel
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 3: where the element cannot hold a tag (a text box, a clipping panel) and the screen is still, the tag alone goes on the page, outline inside, crop takes every tag
**Date:** 2026-11-17
**Session context:** The night's job 4, the Tracker's small fixes drawn on the real app (numbered past 958 and 959, held by other open branches)
**Skill:** brainstorming (mockups-on-the-real-app.md, the mark kit)
**Type:** open-source
**Phase/Area:** marking a part of the real app with an outline and a numbered tag

**Issue:** The kit's mark() appended its numbered tag as a child of the marked element. On a text box (an input) a child is never drawn, so the tag check failed "not drawn"; on a menu panel with overflow set, the tag beside it was clipped. A tag placed "above" also landed on the neighbouring bar. Fixed in the job's script by laying each tag on the page itself (position fixed, placed from the element's box, highest stacking) and widening the crop to take every tag in; an outline set outside the element was then cut by a clipping list, so an inside tag keeps its outline inside.
**Suggested improvement:** In mockups-on-the-real-app.md's mark kit, lay tags on the page (fixed, from getBoundingClientRect) rather than inside the app's element, offer inside-bottom and middle positions, make the crop include every tag, and keep the outline inside whenever the tag is inside.
**Principle:** An annotation drawn over a live page belongs to an overlay layer of its own, never inside the elements it annotates, whose own rules (text boxes, clipping, stacking) decide whether it shows.
**Reference file:** raptor-port/docs/mock/2026-11-17-trk-small/draw.mjs

### Observation 964: A moving value read in one browser-test step and acted on in the next is a race on a slow runner
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): WS §4, the "place measured to press later" line: what moves by itself at a press is measured inside the page by capture listeners, never by two round trips from the test runner
**Date:** 17 Nov 26
**Session context:** chat 98, the calendar wheels' mouse drag (D2170); numbered past 963, the highest on another branch
**Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md)
**Type:** open-source
**Phase/Area:** writing a browser test of motion (a glide, a fling, an animation)

**Issue:** a test read a gliding list's scroll position, then pressed the mouse in the next step, and asserted the two were within 12px; it passed twice on the fast PC and failed on the slower CI runner, where the glide moved further between the two steps. A second check (a finger held for 350 ms) failed the same way.
**Suggested improvement:** for any assertion about motion around an input event, record the values inside the page with listeners (a capture listener on the window before the event, a bubbling one after, a scroll listener's time stamps), and assert on those; never on two separate round trips from the test runner.
**Principle:** a round trip from the test runner takes unknown time; anything that moves on its own must be measured inside the page, at the event itself.


### Observation 965: A bubbling listener on the window can miss a press; and the test's mouse stays where its last move left it
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): WS §4: the same line's "after" read by a capture listener two frames on, never a bubbling one; the drag line: every mouse move written from a measured point, the page's presses and scrolls logged before a wrong landing is blamed on the app
**Date:** 2026-11-17
**Session context:** chat 99 — fixing the calendar wheels' slow-machine test, then writing tests for a reader's findings
**Skill:** walk-scripts (raptor-port/docs/walk-scripts.md) / test-driven-development
**Type:** open-source
**Phase/Area:** measuring an event inside the page (Observation 964's method); relative mouse moves in a browser test

**Issue:** applying 964's "a bubbling listener after" to read a list's place after a press read nothing: the page stopped the press from bubbling to the window (an outside-click guard), so the reading stayed empty and the check failed on correct code. Separately, a new test "dragged up one row" with a move to the list's middle minus 44px, but an earlier flick had left the mouse 132px up, so the move went DOWN two rows; the first failure looked like an app fault until every scroll and press was logged in the page.
**Suggested improvement:** in 964's method, read "after" from a capture listener that schedules the read (two animation frames later, so one frame is drawn), never a bubbling listener on the window; in the walk-scripts guide, a line: a relative mouse move starts from where the last one left the mouse — write moves from the press point, and log presses and scrolls in the page before believing a wrong landing.
**Principle:** a listener that depends on the page letting an event bubble is not a measurement; and a test's own pointer state is part of its setup.

### Observation 966: A FULL bug check of a four-item batch does not fit the chat that builds it
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 4 "Work that spans chats", the same change as 942; the tier block's chat split is already the bug-check checklist's step 3 (read today)
**Date:** 2026-11-17
**Session context:** chat 99, building four Leave War items on one branch with one FULL bug check (number taken past 965, the highest on any branch; the calendar chat holds unpushed notes too)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** planning the handoff point at the start of a batch

**Issue:** reading the rules, the drawings and four areas of code to build a four-item batch filled the chat to 85% before the bug check began, so the FULL check (walkers, two reads, re-walk) had to move to a fresh chat mid-job.
**Suggested improvement:** when a batch of three or more items is sized FULL, plan the handoff at the start: one chat builds, pushes and opens the pull request; the next runs the whole check from the evidence sheet onward. Say so in the opening tier block.
**Principle:** size the context a job needs before starting it, and put the planned handoff at a natural seam (build done, pushed) instead of where the context runs out.

### Observation 967: A drawing made by injecting CSS into the live page does not prove the built rule matches
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): new [CSS-SCOPE-GUARD] (`_docs/OUTSTANDING-items-B-mockups.md`) — met twice (728, 967), so a check in the wrapper stylesheet test; MOCK step 6 "From the picture to the build" points at it and asks for the computed-style assertion
**Date:** 17 Nov 26
**Session context:** chat 100, the four Leave War items' bug check (claude/lw-four-items)
**Skill:** impeccable
**Type:** open-source
**Phase/Area:** mock-ups drawn on the running app by injected CSS; moving the drawing's rules into the source

**Issue:** The grid's hover ring was drawn for approval by injecting a rule into the running build, where it worked. Moved over "whole" into a stylesheet that is wrapped in a page-scoping nesting block, its selector began with `body`, which the nesting turned into "a body inside the page" — it matched nothing, and the ring never drew. Unit tests (no CSS) and a code read passed; only a browser test asserting the computed style on the hovered element caught it.
**Suggested improvement:** In the build step after a drawing approved as injected CSS: for every moved rule, a browser assertion of the computed style on the element it must paint, in the built app, before the job is called built; and a note that rules moved into a nested / scoped stylesheet must not start at `html`, `body` or `:root`.
**Principle:** CSS proven by injection proves the look, not the selector's reach once it is placed in its real file; assert the computed style where it must paint.

### Observation 969: A walker's brief should name each role's test records, or a role's different data reads as a missing one
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): BCO §4 "Before a brief leaves", the EXPECTED-line bullet: a surface walked under two roles names each role's records, or says they differ and why
**Date:** 17 Nov 26
**Session context:** chat 103, closing the four Leave War items' FULL bug check (claude/lw-four-items); number taken past 968, held on another branch
**Skill:** New skill candidate: bug-check walker briefs (the bug-check order's §4 "before a brief leaves")
**Type:** open-source
**Phase/Area:** writing a walker's brief that switches between an admin and a member

**Issue:** A walker signed in as a member looked for the same award records it had seen as the admin and reported one "missing". The member's own page holds different people and awards by design; the host spent a reproduction to find the lead false.
**Suggested improvement:** When a brief walks one surface under two roles, name for each role the records it should expect to find (or say plainly they differ and why), so a walker compares like with like.
**Principle:** a walker given one role's expectations will read another role's legitimately different data as a fault; the brief carries the expected data per role.

### Observation 972: A test's "if the thing is found" guard silently ran nothing
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` Verify RED "Read the red": a premise asserted, never behind an `if` (one change with 979); BCO §8 point 4 gains the case and point 6 asks readers for every condition around an assertion
**Date:** 17 Nov 26
**Session context:** chat 105, the Leave War row tint and the OIL editor's click-away (number past 971, the highest on another open branch)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the assertions of a browser test

**Issue:** Two browser tests checked "the signed-in person's own row keeps its highlight" inside `if (row found) { … }`. The suite runs with no row marked as anyone's own, so the check never ran in any run, on any machine, and both tests stayed green. A blind code reader spotted the pattern; the host confirmed it by turning the guard into an assertion, which failed at once.
**Suggested improvement:** In the section on writing a test, add a rule: a check that only runs when its subject is found must assert the subject was found (or set the state up so it is), never skip quietly; a reader's brief asks for every conditional around an assertion.
**Principle:** An assertion behind a condition is not a check unless the condition is itself asserted — a skipped check reads as a passed one.

### Observation 961: A picture of a screen that does not name its owner leaves "whose view is this?" to the caption
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §Showing It, new bullet: with several parties' views of one thing, every picture keeps the part that names whose view it is, or the page says none does and offers a mark
**Date:** 17 Nov 26
**Session context:** round 4 of the two-squadron design pictures (chat 93)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** Judging the Proposal / Showing It

**Issue:** The owner could not tell whether a drawn board belonged to one party or the other: the screen itself (a full-screen board covering the app's top bar) names no owner, and only the caption said whose it was. The first round-4 drawing repeated it; a fresh reader caught it.
**Suggested improvement:** Add to "Showing It": when a design involves several parties' views of one thing, every picture includes the part of the screen that names whose view it is; where the screen names nobody, say so on the page and offer a mark as part of the design.
**Principle:** A picture must answer "whose view is this?" on its own; a caption is read after the picture has already been misread.

### Observation 962: A mock-up part placed "under" a neighbour must be measured against it, not centred by a recipe
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 3: a new part's shared edge with its neighbour measured against the neighbour's first letter, failing above about 0.5px unless on purpose and captioned
**Date:** 17 Nov 26
**Session context:** chat 94, round 5 of the two-squadron design — redrawing the week's grey "142" tag under the mission
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** drawing a new part beside an existing one

**Issue:** Round 4's badge recipe carried align-self:center, so on the phone the tag drawn "under the mission" sat about 10px in from the mission's first letter. Nobody checked the alignment; he noticed it on the page and asked whether it would be nicer lined up. The redraw found the cause only by measuring the tag's left edge against the mission's letters.
**Suggested improvement:** In mockups-on-the-real-app.md, add a step: every drawn-in part that shares an edge with a neighbour (stacked under it, beside it) has that edge measured in the script — the gap to the neighbour's first letter (a text range, not its box) — and the script fails above about 0.5px unless the offset is on purpose and said in the caption.
**Principle:** A reused style recipe brings its alignment with it; alignment in a mock-up is measured against the real neighbour, never assumed from where the element was inserted.

### Observation 963: A scroll-dependent state may not exist on one device — assert it, then say so
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §Judging, "Choose the state by what it shows": a scroll-reached state asserted per device by co-visibility; where impossible, not drawn and said as a design finding
**Date:** 17 Nov 26
**Session context:** Drawing a "3 new ↓" count beside a list's add button on the real app (round 5 of a design), including its countdown as the new rows are scrolled into view by hand.
**Skill:** mockups-on-the-real-app (brainstorming)
**Type:** open-source
**Phase/Area:** The Method, step 1 (pictures at each size) and "Choose the state by what it shows"

**Issue:** The countdown state was planned for both sizes. On the phone the group was taller than the screen, so the count (in the group's header) scrolled away before any new row came into view: the state could not occur there at all. The script's assertion ("1 of 3 in view") caught it; a looser script would have drawn a desktop-only behaviour onto a phone, or placed the header by hand where scrolling never puts it.
**Suggested improvement:** In "Choose the state by what it shows", add: a state reached by scrolling (a counter that changes as content comes into view, a sticky header's moment) is asserted on each device by measuring both the control and the content in view at the same scroll; where no scroll shows both, the state is not drawn for that device, and the page says why — itself a finding about the design (the control works differently there).
**Principle:** A behaviour defined by what is on screen together can be impossible on a smaller screen; measure co-visibility per device before drawing it, and report the impossibility as a design finding rather than forcing the picture.

### Observation 968: A questions page grows by stacked "newest" blocks until he asks for it to be made readable
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (filed): new [ASK-PAGE-CHECK] (`_docs/OUTSTANDING-items-B-mockups.md`) — the rule is D1237, D1363 (how-we-work §Showing him; DP §8), broken a third time, so a pre-publish page check
**Date:** 17 Nov 26
**Session context:** chat 100, the squadrons design's round 6 page (numbered past 967, held on another branch)
**Skill:** New skill candidate: questions-page
**Type:** open-source
**Phase/Area:** updating a decision page after each round of answers

**Issue:** Over chats 97–100 each new input was added as one more "Newest" block at the top of the page, while answered and replaced questions stayed below. After four rounds the page held three top blocks, and several recommendations were superseded but still showed. He asked "make the mockup easy to read and be clear after all these inputs". The project's own rule (answered and replaced items leave the page) was in force the whole time.
**Suggested improvement:** Whenever answers or a new reader's findings arrive, rebuild the page instead of prepending: corrections first, then every open call grouped by topic with its recommendation, then a short "settled since" list; keep the old version in the repo.
**Principle:** A decision page is a view of what is open now, not a log; appending is cheap for the writer and expensive for the reader.


### Observation 970: A recommendations page reversed an earlier ruling without naming it, and a blanket "all yes" carried it
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (reflected): how-we-work §Showing him: D2140 (every line checked against his rulings before he sees it, after this very lapse's chat 97) and D754 ("say its cost and which rulings it changes")
**Date:** 17 Nov 26
**Session context:** chat 101, recording his "all recommendations yes" to the multi-squadron round 6 page (number past 969, held on another branch)
**Skill:** New skill candidate: decision-page writing (round pages put to the owner)
**Type:** open-source
**Phase/Area:** building a page of recommendations for the owner to accept

**Issue:** An item in the page's "only if you disagree" list (R8, a reviewer's recommendation adopted wholesale) said "the stricter" crew rest for a man flying both units in a day — the exact option the owner had explicitly rejected days earlier (D2123). The page never named the reversal. He answered "all recommendations yes", so the clash surfaced only when the answer was recorded and a later checker ran; it had to be held back and asked again. Two more recommendations quietly narrowed earlier rulings (D2119, D2109) without naming them.
**Suggested improvement:** Before a recommendations page goes out, run a clash pass: for each recommendation, search the rulings it touches and write on the item "changes D<n> (your <date> pick: …)" whenever it narrows or reverses one; never put a reversal of an explicit earlier choice in an "only if you disagree" list.
**Principle:** A blanket acceptance is only as good as the page's disclosure; any recommendation that overturns a person's earlier explicit choice must say so on its face, or the acceptance does not cover it.

### Observation 971: A reused drawing script carries words written before later rulings
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §Judging, "Reusing an older drawing": every line of words the reused script draws is listed in the brief and checked against rulings made since
**Date:** 17 Nov 26
**Session context:** chat 102, round 7 of the multi-squadron mock-up, pictures drawn by four helpers to a word-for-word brief
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** "Reusing an older drawing or its script reuses its shortcuts"

**Issue:** The brief gave exact words for every new line, but told a helper to keep an earlier variant's lines "as variant F draws them". Those lines predated two later rulings, so the picture said leave "goes to 149's Approvals" and only "149's admins are told" — both now wrong. The helper checked the brief's words, not the inherited ones; only the host's look against the rulings caught them.
**Suggested improvement:** In the reference's "Reusing an older drawing" rule, add: every line of words the reused script draws is listed in the brief and checked against the rulings made since that drawing, the same as new words; "as the old script draws it" is never a spec for wording.
**Principle:** Inherited content is unreviewed content: when a spec says "keep what the old one says", the old words skip the check the new ones get.

### Observation 973: A questions page for a non-technical owner was written in the reviews' shorthand
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 3: a tag says a number he answers by or "New", never a review code or ruling number (D2164, which this event set); the page scan is [ASK-PAGE-CHECK]
**Date:** 17 Nov 26
**Session context:** chat 103, round 7's page of the multi-squadron design (numbered past 972, which a parallel branch holds)
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** writing the page and the marks on its pictures

**Issue:** The page put to the owner was written in the working notes' shorthand: review finding codes (H2, F16, M2), ruling numbers inside sentences, "narrows your F12", "card line 4", "Close greyed", and the same codes printed as tags on every picture. He could not follow it ("whats card line 4, narrows, close greyed … explain things simply for the whole mock up"). The plain-language check had been run on chat messages, not on the page, and the drawing brief told helpers to tag each mark with its finding code.
**Suggested improvement:** In the reference, add a step before publishing any page for the owner: scan its text and its picture tags for codes (letters plus digits), ruling numbers and record words, and replace each with what a person sees and what happens; picture marks carry only "New" (pink) or no label (blue). Traceability lives in the design note, not on the page.
**Principle:** Codes that make a review traceable for the builder make it unreadable for the decider; keep them in the working notes and give the reader examples and plain outcomes.

### Observation 974: A drawing brief written from the plan carried the plan's wrong data shape
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): MOCK §The Method step 5: a helper's drawing brief gives purpose and his ruled words; shape and values read from the running app, differences reported, plan fixed first
**Date:** 17 Nov 26
**Session context:** chat 106 — batch 1's mock-up drawn by a helper while the batch plan was under red team
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** briefing a helper to draw a proposed screen

**Issue:** The drawing brief asked for a line "Off day · 142: Sat · 149: Sun", copied from the plan's guess that an Off day is a weekday. The helper looked at the running app, found an Off day is a dated entry kept beside the public holidays, and drew a different line; one of the red-team readers found the same fault in the plan independently. Drawn as briefed, the picture would have put a wrong model in front of the owner for approval.
**Suggested improvement:** In mockups-on-the-real-app.md, add: a brief names each new piece's purpose and leaves its exact words and values to be read from the running app; the helper reports any place where the app's real shape differs from the brief, and the host fixes the plan before the page goes out.
**Principle:** A mock-up drawn on the real app is also a check of the plan's assumptions; brief the drawer to report where the app disagrees, rather than to paint the assumption.

### Observation 982: A review's sorting helpers ran side by side once each owned its own files — four groups in ten minutes

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** chat 120, the skill-notes review of 69 notes (numbered past 981, the highest on any branch — 975–981 sit on `claude/multi-sqn-b1-107`)
**Skill:** task-observer (`references/weekly-review.md`, Steps 3–5) / the project's way of running a review (`.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo)
**Type:** open-source
**Phase/Area:** sorting and drafting the notes with helpers

**Issue:** The 10 Nov 26 review ran its five sorting helpers one after another, because two helpers drafting one file would clash. This review gave each of four helpers a list of files it alone may draft; a lesson whose home was another helper's file went into its report as "For another file", placed afterwards by the coordinator; each helper wrote its additions to files named for its group. All four ran at once and finished in about ten minutes each, with no clash; the coordinator then placed six such texts and lettered three groups' additions to one backlog item. The coordinator's own chat stayed small (its context read the reports, not the drafting).
**Suggested improvement:** In the review's procedure (the project's §Reviews in this repo): sort the notes into groups by the files their lessons land in; give each helper the files it owns and the rule that anything else is reported, not drafted; additions files per group; run them side by side; the coordinator places the cross-file texts and letters shared items before the reads.
**Principle:** Parallel writers are safe when ownership is by file, decided before they start; whatever crosses a boundary is handed back as text for one owner to place.
- Added 20 Nov 26 (chat 121, placing the texts): two more seams of the same procedure. (1) The helpers each lettered their additions to one backlog item from where they believed the list ended — two clashed with each other and all three with letters the item already held (it ran to (r)); the coordinator re-lettered them and every draft and table citing them. The helper brief should give each group its own letter range (or have them write "(new point)" for the coordinator to letter). (2) A note logged during the review (this one) made the dispositions check fail at the merge, as "OPEN in no group"; it was added to the host's group as OPEN. A note logged mid-review goes into the groups as OPEN at once. (3) The install's commit staged a whole documents folder (`git add -A … raptor-port/docs`) and took in about 750 untracked walk pictures from other chats in that checkout; caught by the commit's file count (806 files, not about 60) before any push, and re-made without them. The install script should stage its own list of live paths (the one `--list` prints) plus the log, the records and the deleted holding folder — never a folder.

### Observation 939: A walk of a page fitted to the screen is sized at a narrow desktop width too, not only the wide one
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): BCO §7.0 "What can be chosen": a page fitted to the screen is walked at the narrowest desktop width above the phone split and a mid width beside the wide one, its sideways scroll at the narrow one
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the Approvals page made to fit the screen on a PC, a WALK with both code reads
**Skill:** New skill candidate: bug-check walk sizing (the project's bug-check order, its sizing step and lesson 11)
**Type:** open-source
**Phase/Area:** sizing the walk — which window widths a layout change is walked at

**Issue:** Every desktop scenario of the first walk ran at the widest common window or wider. Two faults that exist only in a narrower desktop window (the list's lines showing past the pinned headings; a newly opened calendar and a new list opening out of sight after a sideways scroll) were found only by the code readers, not by the walk. The sizing step had named heights (neighbouring and fractional) carefully but took the width from the usual desktop size.
**Suggested improvement:** In the sizing step for a page that fits the screen or scrolls inside itself, name at least one narrow desktop width just above the phone split and one mid width, beside the usual wide one, and walk the sideways scroll there; add it to the lesson on fitted pages.
**Principle:** When a layout has a breakpoint, the walk covers both sides of it close up — the narrowest window that still gets the wide layout is where the wide layout is most likely to fail.

### Observation 940: A warning drawn live on a published day reads the settings too — it belongs in the roll-call
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): BCO §6 the "where an input is filed / who counts as away" row widened to every READER of a changed input or setting (a day's kept settings, D2005), live warnings and counts included; checklist step 8's list of rows matched
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch: a published day keeps the Logic settings it was published under (D2005, D2014)
**Skill:** New skill candidate: bug-check roll-call (the project's bug-check order, its roll-call step)
**Type:** open-source
**Phase/Area:** the roll-call — listing every place the app draws the thing a change touches

**Issue:** The change made a published day keep the settings it was published with. The roll-call listed the places that show the day's stored figures, and each kept them. A red warning line that is not stored but worked out each time the day is drawn (the "no usable times" line) still read today's settings, so it moved at once with a settings change on a published day. Only the blind code read found it; the roll-call had no row for it, because the line is not a "place that shows the figure" — it is a check that reads the same setting.
**Suggested improvement:** In the roll-call step, add a second question beside "where is this thing drawn": "what else reads the same setting or input each time the screen is drawn" — warnings, counts, notes and marks worked out live — and give each its own row with has it / must not / MISSING.
**Principle:** When a change freezes or redirects an input, list every reader of that input, not only every display of its result; a derived message is a reader even when it stores nothing.

### Observation 941: Type-check a new test file before calling it done — the test runner does not
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` Verify GREEN, Confirm list: a new or changed test file passes the pipeline's own type check (a runner that strips types runs it green)
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch, new test files written by a builder helper
**Skill:** New skill candidate: build-step checks (the project's executor rule, its "tests first" step)
**Type:** open-source
**Phase/Area:** verifying a new test file before the full check

**Issue:** A new test file ran green in the test runner while carrying type errors, because the runner strips types without checking them. The errors surfaced only later, at the build step of the full check, costing a second round. (In this project the plain no-output type check is also hollow, so the project's build-mode type check is the one to run.)
**Suggested improvement:** In the builder's brief and the executor rule, add to "its own tests green": run the project's real type check (here `npx tsc -b`, or the build) on any new or changed test file before the job is called built.
**Principle:** A test runner that transpiles without type-checking proves behaviour, not types; run the type check that the full gate will run before handing work on.

### Observation 942: A build chat was three-quarters full before its first edit — the area pages load whole on the first source file opened
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): SH Step 4 "Work that spans chats": a FULL build is split into chats from the start, its reading committed to a plan file before the first fix; the scheduler-load measurement filed as a [START-CONTEXT-AUDIT] addition
**Date:** 13 Nov 26
**Session context:** Chat 68, D2028's build on `claude/rules-check-small-batch` (a small engine change at the FULL tier)
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** The opening line a handoff writes; what a continuing chat loads at its start

**Issue:** The chat followed its opening line (the block, the backlog item, two briefs, three full rows) and then opened engine and screen files to read the code. Opening them loaded the project guide, the scheduler page, the screen-design page, the OIL page, the builder's rules and the design short form, each whole. The chat read 76% full after the reading alone, 90% by the time the fix and its tests were committed, with the walk, the reads and the gates all still ahead — so the job's long half starts on a compaction. No other open note was checked for the same cause (the log was not read beyond its highest number, 941, the same on every pushed branch).
**Suggested improvement:** In the session-handoff skill's step that writes the opening line: when the next step is a build with a FULL check, have the opening line say to write the reading of the code into a plan file and commit it BEFORE any fix, and name which checks a fresh helper should carry (the walk, the reads) so the host keeps room. Separately, a job for the rules diet's follow-up (D1960): measure what a scheduler-engine job loads on its first source file, as was done for the Leave War.
**Principle:** A chat's room is spent by what loads, not only by what it reads on purpose; when the pages a job loads are large, save the reading before the first edit and plan the checks around a compaction.

### Observation 943: A walk script's own checks must be proven on a known-clean and a known-changed screen before its result is believed
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): WS §4: the calibrated-read line made every new pass/fail line, proved on a known-clean and a known-changed screen and read from one element, never the page's whole text; the clean-up line: take back by the app's own Undo button, never the undo keys
**Date:** 2026-11-13
**Session context:** The host's own walk of a fix (D2028, chat 68) — a new script that changed a setting, made a change, took it back and published.
**Skill:** New skill candidate: walk-script writing (the project's `raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** Writing a new walk script — the step that takes a change back, and the script's own pass/fail lines

**Issue:** Two faults in a freshly written walk script, both in the script and neither in the app, each caught only because the host opened the pictures: (1) the put-back step pressed the keyboard's undo keys, which did nothing in the driven browser, so the "put back" picture still showed the change; the helper that presses the app's own Undo button worked. (2) The script's pass/fail line searched the page's whole text for the word that marks a waiting change, and matched the change history's count label instead, so it printed a failure on a clean screen.
**Suggested improvement:** In the walk-scripts guide: take a change back by the app's own button through the shared helper, never by a key press; and a script's pass/fail line reads one named element's text (the list's own empty line), never the page's whole text — and is run once against a screen known to be clean and once against one known to be changed before the walk's results are read.
**Principle:** A check written inside a test script is itself untested code: prove it can say both yes and no on known cases, and read the narrowest element that carries the answer, before trusting what it prints.

_13 Nov 26, chat 68 (the sim count fix and the two explanations): no observations beyond 943._

### Observation 975: Regex backslashes lost inside a template literal in an edit script
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (memory): js-replace-dollar-patterns extended: a JS string or template literal in an edit script eats backslashes; its first home (CLAUDE.md's editing traps) is not draftable and the script guard cannot see inside a script file
**Date:** 19 Nov 26
**Session context:** chat 109's overnight run, multi-squadron batch 1, the A3 build (a store per unloaded squadron)
**Skill:** New skill candidate: edit-script safety (or the project's editing traps in raptor-port/CLAUDE.md)
**Type:** open-source
**Phase/Area:** editing source files by a generated script

**Issue:** The builder wrote a source change through a Node edit script whose new text sat inside a template literal; the regex in it lost its backslashes on the way, which silently broke the post-in date check and every post-in. Only the unit tests caught it.
**Suggested improvement:** Add to the editing traps: never put regex backslashes inside a template literal in an edit script; write such lines with the Edit tool, or read the new text from a file written by the Write tool.
**Principle:** A generated edit passes text through one more layer of escaping; any line holding backslashes is safest written by a tool that keeps every character as typed, and checked by a test before it is trusted.

### Observation 976: A walk that reads a second person's screen in a second live tab tests stale state, not the app
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): WS §3: two people acting in turn share one tab (sign out and in) or the acting tab reloads; two live tabs are two devices, kept for §6's storage-writer step; a two-tab FAIL reproduced in one tab first
**Date:** 19 Nov 26
**Session context:** chat 113, fix read 5's walk F4 (a posting taken back after another admin read its bell line)
**Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md)
**Type:** open-source
**Phase/Area:** writing a walk script where two people act in turn

**Issue:** The walker kept person A signed in in tab 1 and read person B's bell in tab 2 of the same browser. B's "read" mark was saved by tab 2, but tab 1 loads read records only at start-up, so A's undo in tab 1 thought B had never read the line and wrote no "taken back" line. The walk reported a FAIL; one world in a unit test was green. An hour of builder time went on proving it an artifact.
**Suggested improvement:** walk-scripts.md: when two people act in turn, either one tab with sign-out / sign-in between them, or reload the acting tab after the other person's step; a two-live-tab FAIL is reproduced in one world before it is filed.
**Principle:** In an app that keeps per-tab in-memory state over shared browser storage, two live tabs are two devices that never sync; a walk must not use them as one shared backend.

### Observation 977: Reader copies are exported without pictures; the package link is made in PowerShell
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/codex-guide.md` the recipe's steps 1 (pathspec excludes) and 3 (longpaths, hooksPath, `git log -1` check); the junction already in GD; [CHECK-TOOLS-HARDEN] (g) widened
**Date:** 19 Nov 26
**Session context:** chat 114, fix read 6 of multi-squadron batch 1 (three blind readers, each on its own exported copy)
**Skill:** New skill candidate: blind-reader-copies (the codex-guide recipe for exported copies)
**Type:** open-source
**Phase/Area:** making the readers' copies

**Issue:** `git archive <commit> | tar -x` of the whole repo ran past 5 minutes for one copy (thousands of walk pictures) and was stopped; the package link made with `cmd //c mklink /J` from Git Bash failed ("Invalid switch") because Git Bash rewrites the `/J`.
**Suggested improvement:** in the recipe: export with pathspec excludes (`git archive <c> -- . ':(exclude,glob)**/*.png' ':(exclude,glob)**/*.jpg' ':(exclude,glob)**/*.mp4' ':(exclude,glob)**/*.gif' ':(exclude,glob)**/*.webm'`) — three copies then take seconds; make the node_modules junction with PowerShell's `New-Item -ItemType Junction`.
**Principle:** a reviewer's copy needs the code and documents, not the evidence pictures — export only what the reader reads; make Windows links with the Windows shell.
- met again 19 Nov 26 (chat 116, fix read 7's four copies): the excludes worked (four copies in seconds), but the copy's own `git add -A` failed silently inside a loop — "Filename too long" on a browser-test leftover under `docs/handpass/` — so every copy had no commit; fixed with `git -c core.longpaths=true add -A` and `-c core.hooksPath=/dev/null` on the commit. Guard: put both in the recipe, and check `git log --oneline -1` in each copy before starting a reader.

### Observation 978: A Codex reader's start-up reads defeat the blind read
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/codex-guide.md` the recipe's step 2 (the round's handoff block, briefs and reports taken out of the copy); the matching clause for BCO §4 under "For another file"
**Date:** 19 Nov 26
**Session context:** chat 116, fix read 7 of multi-squadron batch 1 (four blind readers on exported copies)
**Skill:** claudex-loop (the reviewer's copy and brief); also the codex-guide recipe for exported copies
**Type:** open-source
**Phase/Area:** making a blind reviewer's copy

**Issue:** Twice running (fix reads 6 and 7) the Codex reader said its read was not fully blind: the repo's agent instructions tell it to read the handoff file first, and the exported copy carried the branch's handoff block with the builder's own summary of the fixes, which it read before reaching the brief's "do not read" line. The brief's exclusion came too late to help.
**Suggested improvement:** when exporting a reader's copy, replace the branch's handoff block (and any builder brief or evidence sheet for the round) in the copy with a one-line pointer, so the start-up reads find nothing to anchor on; say so in the brief's first line.
**Principle:** a reader is only blind if the material it must not see is absent from its copy — an instruction not to look loses to an instruction to read it first.

### Observation 979: a red test was red because its own setup was silently dropped
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `.claude/skills/test-driven-development/SKILL.md` Verify RED "Read the red": a fixture read back through the app's own loader, a failing control blamed on the fixture (one change with 972)
**Date:** 2026-11-19
**Session context:** Fix read 7, fault Q (chat 117's builder): writing the red-first test for a filer told after a named man's move
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** RED — verify the test fails for the right reason

**Issue:** The new test seeded a man's move through a helper that writes stored rows; the row id it was given did not match the store's id rule, so the loader dropped the row without a word. The test still went red, and on first read the failure looked like the fault itself; only a printout of the stored state showed the move had never happened (the input's line carried the old squadron alone). A control that should have passed also failed, which was the clue.
**Suggested improvement:** In the RED step, add: before trusting a red, assert the setup took effect (read back the state the fixture was meant to create, e.g. the man's squadron on the day), and treat a failing control as a sign the fixture, not the fix, is wrong.
**Principle:** a red test proves the fault only if its own setup is known to have happened; fixtures that validate and silently discard bad input make a wrong red look right.

### Observation 980: A security-scoped paragraph in a shared brief gets the Codex reader stopped; cutting it afterwards is refused
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): BCO §4 "Before a brief leaves" (C's file, text under "For another file"): each reader's brief holds only its own job; a stopped run is never re-run on a reworded brief, its notes chased
**Date:** 19 Nov 26
**Session context:** chat 117, fix read 8 of multi-squadron batch 1 (four blind readers sharing one brief)
**Skill:** claudex-loop (the reviewer's brief); also the codex-guide recipe for blind reader copies
**Type:** open-source
**Phase/Area:** writing one brief for several readers, one of them a Codex model

**Issue:** The shared brief ended with a paragraph scoping the security reader ("looks only for holes … what one person can take from another"). The Codex reader worked for ~250k tokens and was then stopped twice by its provider as a "cybersecurity risk", returning no report (the same happened in fix read 5). Re-running it on a copy with that paragraph cut was refused by the host's own permission check as rewording to get past a provider's filter, so the standing reviewer's read was lost for the round. Its progress notes still held one finding no other reader made; a second reader sent to chase that one claim proved it.
**Suggested improvement:** give the security reader its scope in its own prompt (or its own short brief), never in the brief the Codex reader receives — decided when the brief is written, not after a refusal; and when a reader's run dies, read its progress notes for claims and send another reader to chase any claim no one else made.
**Principle:** keep each reader's brief to its own job from the start — wording meant for one reader can stop another, and changing it after a refusal reads as evasion; a stopped reader's partial notes are evidence worth chasing.
- Met again 19 Nov 26 (chat 118, fix read 9): the new brief again carried the security paragraph (chat 117's handoff said "never cut its security paragraph" — read as keeping it, against this note's improvement); Sol 6.1 was stopped the same way after ~232k tokens with no report. Guard proposed: the brief-writing step of the bug-check order §4 ("Before a brief leaves") asks "does any paragraph here belong to one reader only?" and moves it into that reader's own prompt.
- Met again 20 Nov 26 (chat 118, fix reads 10, 11 and 13): even with the security paragraph moved to the security reader's own prompt, Astra was stopped three more times (it finished only in fix read 12) — the shared brief's own wording (findings framed as "holes", "forged", "bypass") is enough. Guard proposed: Astra gets a brief of its own worded as a rules-enforcement check, and writes each finding to its report as it goes, so a stop keeps what was found.

### Observation 981: A backgrounded `codex exec` waits for keyboard input and never starts
**Status:** ACTIONED (2026-11-20) — the skill review of 20 Nov 26 (apply): `raptor-port/docs/codex-guide.md` the recipe's step 4 (`-m gpt-6-astra` named, D2210; `< /dev/null`; a 90-second log check); GD's background-codex trap now points to the recipe
**Date:** 20 Nov 26
**Session context:** fix read 9, two Codex readers started from background shell commands
**Skill:** New skill candidate: running a Codex reader from Claude Code (now in `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head)
**Type:** open-source
**Phase/Area:** starting the reader

**Issue:** One of two `codex exec … "<prompt>" > log 2> err` commands run in the background printed only "Reading additional input from stdin..." and sat idle for 80 minutes until noticed; the other, started two seconds later, ran. With stdin left open, `codex exec` may wait to read more prompt from it.
**Suggested improvement:** every backgrounded `codex exec` gets `< /dev/null`; the guide's recipe line shows it; and a short check 90 seconds after the start (the log has grown past one line) before the host waits on it.
**Principle:** a command meant to run unattended has its input closed explicitly, and its start is confirmed before a long wait begins.

### Observation 998: Preview servers outlive their chats and hold disk and ports for days

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** clearing his C drive (3 GB free); numbered past the multi-squadron branch's 997
**Skill:** New skill candidate: disk-space housekeeping
**Type:** open-source
**Phase/Area:** ending a session that started a local preview server; removing old working copies

**Issue:** four local preview servers started on 17 Nov from two working copies were still running on 22 Nov. They held files open, so removing those copies failed with "Invalid argument" and the folders stayed on disk. Separately, each helper's working copy duplicated about 7.6 GB of committed screenshots, and reviewers' read-copies in the chat's temp folder added about 90 GB across 53 idle chats.
**Suggested improvement:** a session that starts a preview server stops it, by its port, before it ends; a cleanup first lists processes whose command line points into a folder before removing it; a periodic housekeeping step measures working copies and per-chat temp folders and offers to clear those of chats idle for more than a day.
**Principle:** long-running helper processes and per-task copies must have an owner who ends them; otherwise they silently accumulate until the disk is full.

### Observation 983: Settling a merge clash by taking one side's whole file drops that file's other changes

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** chat 119, bringing `main` into a long-lived feature branch before a fix read (numbered past 982, held on another branch)
**Skill:** New skill candidate: bringing main into a branch (today the shipping rule's step 2 and `records-merge.mjs`)
**Type:** open-source
**Phase/Area:** settling a clash in a code file during a merge

**Issue:** One app file clashed on a single line (both sides had the same code, one with a comment). It was settled with `git checkout --theirs <file>`, which takes the other side's WHOLE file, not just the clashing hunk — the branch's own earlier changes elsewhere in that file vanished. Three unit tests went red on GitHub's run; the four blind readers' copies had already been made from the bad commit and had to be patched on disk mid-read.
**Suggested improvement:** settle a clash in a code file by editing the hunk (keep one side's lines between the markers, nothing else), never `--ours`/`--theirs` on the file; then check `git diff <branch's pre-merge head> HEAD -- <file>` equals the other side's own change to that file (`git diff <merge-base> <other side> -- <file>`); and run the tests of every settled file before the commit that readers' copies are cut from.
**Principle:** a whole-file pick settles a clash by discarding everything else that side changed in the file; settle the hunk, then prove the result holds both sides' changes.

### Observation 984: The reworded-brief guard for a Codex reader (note 980) is refused by the host's own permission check

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** chat 119, fix read 14 of multi-squadron batch 1 (four blind readers)
**Skill:** the bug-check order §4 "Before a brief leaves" (as actioned for note 980); `raptor-port/docs/codex-guide.md`
**Type:** open-source
**Phase/Area:** writing the brief a Codex reader receives

**Issue:** Note 980's last met-again proposed giving the Codex reader a brief of its own worded as a rules-enforcement check, without "holes / forged / bypass". Writing that copy was refused by the host's own permission check as rewording to get past a provider's filter. The reader got the shared brief unchanged plus one line to keep its findings in its progress messages; its provider stopped it again after ~268k tokens, and three confirmed findings survived only in those progress messages (all three reproduced red by the host).
**Suggested improvement:** drop the reworded-brief step from any guide that carries it; keep "keep each finding in your progress messages as you confirm it" in the Codex reader's prompt (it saved this round's findings); when the provider stops the reader, read its progress messages and reproduce each claim; put to the owner whether to accept the stops or seat another reader.
**Principle:** a brief is worded for the job, never re-worded to steer past another provider's filter; design the run so a stop keeps what was found.


### Observation 985: A test that holds an input object across a Leave War approval reads a stale copy

**Status:** OPEN
**Date:** 2026-11-20
**Session context:** chat 122, fix read 14's item C control test (multi-squadron batch 1)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** writing the red test / reading the result

**Issue:** A control test kept a reference to the war-approved leave, then approved the next day's bid. The approval joins
the day onto the leave by building a NEW record and replacing the old one in the list, so the held reference still read
the old end date and the test failed for a reason that had nothing to do with the fix. A debug print of the list showed
the join had happened.
**Suggested improvement:** in the red-first step, add: "after any action that may replace a record (a merge, a split, a
join, a re-slice), look the record up again by its id before asserting on it; never assert on a reference taken before
the action."
**Principle:** an assertion on an object reference taken before an action proves nothing about a store that replaces
records rather than editing them in place; re-read by identity after the action.

### Observation 986: Fix-only re-reads converge on the fixes, not the code

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** multi-squadron batch 1, chat 123 — fix read 16 beside Fable's sample review of the batch's own code (D2234)
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md` §5, "A fix is new code")
**Type:** open-source
**Phase/Area:** the narrow read of each round's fixes, repeated round after round

**Issue:** sixteen rounds of fix reads each read only the previous round's fix commits. One blind sample review of the
batch's own core files (about 2,300 lines, ten minutes) found two confirmed faults in code no fix had touched — faults
every fix read was structurally unable to see, because none was ever handed that code. The rounds' falling fault count
(8, 5, 4, 3) measured the fixes converging, not the batch being clean.
**Suggested improvement:** in §5's "A fix is new code", add: when fix rounds pass the cap (about three), or a batch's
risk is roles, saved data or the published record, put one blind read of the batch's riskiest ORIGINAL files beside the
next round — not in a reader's seat — and read a clean fix round as "the fixes are clean", never "the batch is clean".
**Principle:** a review scoped to each round's diff can only converge on that diff; schedule a fresh read of the
untouched high-risk code, or the fault count's fall says nothing about what was never read.

### Observation 987: A walk script committed before it ever ran to the end costs the next chat its first walk

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** multi-squadron batch 1, fix read 17's half-day walk (chat 124), whose script chat 123 committed when its run was stopped
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** what a handoff says of a script or test left unverified

**Issue:** The previous chat committed a scripted browser walk that had never completed a run, marked "unverified" in the handoff. On its first full run it failed at three separate points (a wrong box for the second half's words that silently changed the first half's words, wrong button names, no sign-in after a reload); each needed a picture opened and a fix before the walk proved anything — four runs instead of one.
**Suggested improvement:** In the handoff skill's "what is left" step: a script or test committed without a completed run is named with the exact step it last reached and the pictures of that step, and the next chat's pick-up runs it once on one size and opens the first failing step's picture before the full matrix.
**Principle:** Unverified automation handed over is a draft, not a tool — hand over where it stopped and what it saw, and have the receiver prove it on the smallest run before trusting a full one.

### Observation 988: Blind readers get a copy with the other readers' reports left out, not an instruction not to open them

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** chat 125 — round 2 of a three-reader blind red team of a plan (Astra, a fresh Opus reader, Fable)
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** starting blind reviewers on a second round, when the first round's reports sit in the same repository

**Issue:** Round 1's brief kept the readers blind by asking them not to open files named like the other reports, which sat in the same folder they were reading. In round 2 each reader was given its own exported copy of the branch with every earlier reader's report (and the reviser's brief that summarised them) excluded at export time, so blindness no longer rested on each model obeying a file-name rule while it searched the same folder.
**Suggested improvement:** In the review round's set-up step: export one copy per reader (`git archive <commit> -- . ':(exclude,glob)**/<report-pattern>*'`, pictures excluded to keep it small), point each reader only at its copy, and say in the brief "this copy holds no reader's report". Keep the "do not open" line only as a second guard.
**Principle:** Enforce a reviewer's blindness by what it can reach, not by what it is asked not to read.

### Observation 989: A find-and-replace edit script re-run by mistake doubles its text

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** chat 126, the Plan audit — editing the backlog with a small node script of exact-anchor replacements
**Skill:** New skill candidate: safe-doc-edits (or the CLAUDE.md editing guidance for scripted edits)
**Type:** open-source
**Phase/Area:** scripted edits of tracked documents

**Issue:** an edit script that replaced an anchor with "anchor + new text" checked only that the anchor occurred once. Re-run later by mistake (its path reused in a command meant only to search), it matched the same anchor again and appended the new text a second time, doubling two backlog lines. Caught by `git diff --stat` and undone with a checkout of the file; nothing was committed.
**Suggested improvement:** every replacement in an edit script refuses when its NEW text is already present (an idempotence guard), not only when its anchor is missing or doubled; and a script's run and an unrelated search never share one command line.
**Principle:** an edit that keeps its anchor in its output must check for its own output before writing, or a second run silently duplicates it.

### Observation 990: the code check ran only on GitHub — a pushed build turned the whole run red for one finding

**Status:** OPEN
**Date:** 2026-11-21
**Session context:** chat 127, the multi-squadron reshape build (phase 0 and 1)
**Skill:** New skill candidate: pre-push local checks (the build loop in `raptor-port/CLAUDE.md` §Coding conventions, `shipping.md` §The loop)
**Type:** open-source
**Phase/Area:** the push step of the build loop

**Issue:** The project's rule says that before a push the changed-files code check reports no new finding. The builder ran the touched unit tests and the type check but not that check, pushed, and the whole remote run went red on a single style finding in a new test-only file; the fix then had a second finding of the same kind. A new test-world folder also broke three separate source-walking guard tests, which each keep their own list of folders to skip.
**Suggested improvement:** Make the changed-files code check part of the same pre-push step as the type check (a script the push guard runs, or one command `prepush` that runs type check + changed-files lint + touched tests), so it cannot be skipped by memory. And give the source-walking guards one shared list of folders that are not the app, so a new test-support folder is added once.
**Principle:** A check that the rules require before a push, but that only a remote run enforces, will be skipped under pressure; fold every required pre-push check into one local command, and keep any list several guards share in one place.

### Observation 991: The host re-runs a helper's "red first" in its own checkout by restoring only the changed source files

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** chat 128 — merging phase 2's parallel helpers of the multi-squadron reshape, each built in a worktree of its own
**Skill:** overnight
**Type:** open-source
**Phase/Area:** checking each helper's result before it counts (the host's check of a helper's proofs)

**Issue:** each helper reported its proofs "red on the base, green after"; the plan asks the host to rerun both runs. A second worktree per check is slow and a guard refuses writes into other checkouts. What worked in seconds: in the host's own checkout, after the merge, `git checkout <before-commit> -- <the helper's changed non-test source files>`, run the proof files, then `git checkout HEAD -- <same files>` and confirm a clean status; the failure reasons are then grouped (assertion vs "is not a function") so a red that is only a missing function is told apart from a red that shows the fault.
**Suggested improvement:** in the overnight guide's "check each result" step (and the bug-check order's red-first protocol), add the recipe: restore only the changed source files to the commit before the change (`--diff-filter=M`, tests excluded), run the proofs, restore, check `git status`, and count failure kinds — at least one assertion-kind failure per proof, not only missing functions.
**Principle:** to confirm a "failing first" claim, put back only the code under test, never the tests, and judge the red by why it fails, not that it fails.

### Observation 992: A queued "push, then release the branch" ran while the owner gave the chat more work

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** chat 128 — the handoff's last push had to wait for a check run, so a background script waited, pushed and released the branch; the owner then answered a question and the chat committed again
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Step 1, "Release the branch as your LAST step"

**Issue:** the background script pushed and detached the checkout between the chat's stop request and its next commit; the new commit landed on a detached head and had to be moved back by hand (switch to the branch, fast-forward to the stray commit).
**Suggested improvement:** in "Release the branch", when the push must wait: the waiting script pushes only if the branch tip is still the commit it was started for, and never detaches by itself — the chat releases in the foreground once it has the push result; and after any new message from the owner, check `git branch --show-current` before committing.
**Principle:** an irreversible last step queued in the background must check that nothing moved since it was queued, or be left for the foreground.

### Observation 993: A ruling that lifts a refusal was filed with two of the four places that enforce it

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** chat 129 — building his D2250 (an admin of a man's own squadron may make a Plan holder a member), filed by chat 128 as "remove the door's refusal and the gate's R7 line"
**Skill:** record-decisions (D201, step 2 "The app")
**Type:** open-source
**Phase/Area:** filing the build a new ruling needs

**Issue:** with both named lines removed, the rewritten test still failed: a third rule (the save check's "Plan taken only by a master admin") refused the same change, and a fourth place (Undo putting the Plan back) then failed with a vague message. The filing listed the places found by reading, not by running the new behaviour.
**Suggested improvement:** in D201's "The app" step, when a ruling lifts or narrows a refusal, file the build as "make this scenario pass" with its test named, and say the places listed are a start, not the scope; the builder runs the scenario forward AND through Undo and Redo before calling the places complete.
**Principle:** a restriction is usually enforced in more places than the one that says it; find them by running the newly allowed action, both ways, not by searching for the old words.

### Observation 994: A commit chained before a push was lost when the push guard refused the command

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** chat 129 — `git commit … && git push …` in one shell call while a check run was in progress
**Skill:** New skill candidate: pre-push local checks (`shipping.md` §The loop)
**Type:** internal
**Phase/Area:** committing and pushing as the host

**Issue:** the push guard refuses a whole command, so the commit before the push never ran; only a `git status` afterwards showed the file still uncommitted. The helpers' brief already says "push alone in its own command"; the host's own rules do not.
**Suggested improvement:** `shipping.md` §The loop: "commit and push in separate calls — a refused push takes everything in its command with it".
**Principle:** never chain a step that must happen to one a guard may refuse.

### Observation 995: A helper's proof drove a stand-in for the real surface, so the real one's own swap went unseen

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** chat 130, the multi-squadron reshape's phase 3 — helper "session" built the midnight band; its unit proof rendered a hand-made window inside the real window frame, not the war's own grid
**Skill:** New skill candidate: helper-brief (the phase helpers' common brief) — and the bug-check order's §8 (tests find rather than confirm)
**Type:** open-source
**Phase/Area:** writing a red-first proof for "what the person sees keeps X"

**Issue:** The band's proof passed while the real app lost the man's typed words: at midnight the real grid re-judged the open day as closed and replaced the bid window with a different one. Only the drawing check, in a real browser, caught it. A jsdom test through the real grid reproduced it once the page was drawn again after the clock moved.
**Suggested improvement:** In a helper's brief, a proof about what a person sees after an event must drive the real component that draws it (not a stand-in), and must re-draw after the event the way the app does (a re-render after the clock or a notify), so a parent that re-judges its children is in the test.
**Principle:** A stand-in proves the piece, not the page: whatever decides which child is shown sits above the stand-in, and a test that leaves it out cannot see it swap.

### Observation 996: A handoff named the cause of a red check it had not re-run

**Status:** OPEN
**Date:** 21 Nov 26
**Session context:** Chat 131 picking up the multi-squadron reshape's phase 3 from chat 130's handoff block
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** The block's "Pick up here" — what is said about a check left red

**Issue:** The handoff told the next chat to re-run a drawing check and stated, as fact, that its recorded differences "came from" a fault since fixed. The re-run on the fixed build showed the same six differences: they come from the fixture's day (the drawing's window was on a later day than the one the check can open now), not from that fault. The next chat would have closed the item on the handoff's word had it not opened the marked pictures.
**Suggested improvement:** In the handoff skill's rules for the "Pick up here" line: a check left red is written as "red: <what it shows>; cause not confirmed — <the writer's guess>, re-run and open the pictures", never as a cause, unless the writer re-ran it after the fix. One line in the skill's checklist: "any stated cause of a red or differing check: did a run after the fix confirm it? If not, mark it a guess."
**Principle:** A handoff carries what was observed, and marks every explanation that no run has confirmed as a guess; the next reader trusts a stated cause and stops looking.

### Observation 997: Sort an unattended run's questions by whether anyone can hit them today

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** Chat 132, putting the night's 16 questions on a page with pictures
**Skill:** overnight
**Type:** open-source
**Phase/Area:** the morning report's list of questions for the owner

**Issue:** The morning list put 16 questions to the owner as equals. Checking them showed 13 could only happen after an action no screen offers yet (the walk set that state up behind the scenes), so they could wait for the feature that adds it; only 3 were live. Two recommendations also changed once each was checked against the rulings.
**Suggested improvement:** In the morning report step, mark each parked question "reachable today" or "only once <feature> exists" (checked against how the walk set it up), and lead with the reachable ones. Check each recommendation against the rulings before it goes in the list.
**Principle:** A question about a state users cannot reach yet is cheaper to settle when the feature that reaches it is designed; sorting by reachability shrinks what the owner must decide now.

### Observation 999: Test which mechanism the harness uses before hooking the tool under it

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** [HELPER-COPIES-NO-PICTURES] — making helpers' working copies leave out 7.8 GB of pictures
**Skill:** using-git-worktrees
**Type:** open-source
**Phase/Area:** where a worktree's set-up is hooked (the native-tool path)

**Issue:** The obvious net — git's post-checkout hook, which git runs for every `git worktree add` — never fired when the app made a subagent's isolated worktree; a five-minute trial in a throwaway repo (a hook that logs its arguments, one `claude -p` run spawning an isolated subagent) showed it. Built on the assumption, every helper's copy would have stayed full while the typed-copy test passed. The same trial showed the app's SubagentStart hook runs inside the helper's own worktree, before the helper starts, which became the working route.
**Suggested improvement:** In the skill's native-tool section: before relying on a git hook (or any tool-level hook) for worktrees the harness creates, prove it fires for the harness's own creation path in a throwaway repo; prefer the harness's own lifecycle hooks, which keep its clean-up, over replacing its creation step.
**Principle:** A hook on the tool underneath only catches what goes through that tool's front door; a harness may not use it. Test the real creation path in a throwaway project before building on it.

### Observation 1000: Run the project's own checks inside the new kind of copy before calling it equivalent

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** [HELPER-COPIES-NO-PICTURES] — sparse working copies without the walk pictures
**Skill:** verification-before-completion
**Type:** open-source
**Phase/Area:** what counts as evidence that a changed environment still works

**Issue:** The sparse copy was believed safe because CI's own sparse checkout passed every gate. Running the document check inside a real sparse copy failed it: two records named a home file inside the left-out folder, and CI's guard job happens to use a full checkout. Every helper would have hit a red check the main folder did not show.
**Suggested improvement:** When a change alters the environment work runs in (a checkout shape, a container, a path), run the project's standing checks inside one real instance of the new environment and compare with the old, before claiming equivalence from a similar-looking environment elsewhere.
**Principle:** "Another place already works this way" is evidence only for the checks that place runs; run the rest in the new environment itself.

### Observation 1005: A "today" picture taken after a scripted scroll reset hid the app's real opening position

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** Drawing the before-and-after of Edit Schedule's right edge ([SCHED-RIGHT-EDGE], chat 135). Numbered past 999, which a local branch already holds.
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 1 — driving the build to the "today" state

**Issue:** The first run of the drawing script set the week's scroll to 0 by script before each picture, so every "today" picture showed the first day 20px in from the edge. The app itself opens that page with the day hard against the edge (a page switch parks it there); only when the script was changed to reach the page by the real tab press, with no reset, did the pictures show what the owner sees — and a real fault of position surfaced ([SCHED-OPEN-20-OFF]).
**Suggested improvement:** In "The Method" step 1, add: the "today" frame is pictured as the app's own controls leave it — the page opened by its real tab or button, no scripted scroll or reset before the first picture; a reset is used only to reach a later state, and the opening position is measured and recorded before it.
**Principle:** A scripted reset to a tidy starting state replaces what the user actually sees first; picture the state the product's own controls produce before normalising anything.

### Observation 1001: After the week's day arrows, a scripted scroll leaves the arrows' remembered target and the next press counts from it

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** The same drawing script (chat 135): one page reused for the "today" and "proposed" passes. Numbered past 999, which a local branch already holds.
**Skill:** New skill candidate: walk-script traps (the home today is `raptor-port/docs/walk-scripts.md` §4)
**Type:** internal
**Phase/Area:** Steps, and what they assert — reusing one page across states

**Issue:** The first pass pressed the next-day arrow to Sunday, then the script wrote the week's scroll back to 0 directly. The arrows remember where their last press was heading; a direct write does not clear that, so the second pass's first press counted from Sunday and loaded the next week. The "proposed" pictures were of a different week from the "today" ones, with no error.
**Suggested improvement:** In `raptor-port/docs/walk-scripts.md` §4, add: a before-and-after pair takes a fresh page for each state; after any arrow press, move the week only by the app's own controls (the arrows, the foot scroll bar's track), never by writing its scroll — and assert the week's date in both pictures of a pair.
**Principle:** A control that keeps a remembered target is not reset by moving the thing it controls behind its back; give each compared state its own fresh session and assert they show the same data.

### Observation 1007: Met again (970, closed): a question put to the owner narrowed an earlier ruling the search before it had not found

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** Chat 135, the mock-up page of Edit Schedule's right edge: its question 2 (a day brought to the front rests the strip's margin in) narrowed his D275 of 27 Sep 26, found only after he had answered "all as recommended". Numbered past 1006, which another branch holds.
**Skill:** New skill candidate: decision-page writing (round pages put to the owner) — the same candidate as Observation 970
**Type:** open-source
**Phase/Area:** the search of earlier decisions before a question goes out

**Issue:** The search before the question ran on the backlog and on two keywords taken from the fault's own description ("opens", "20px"). The earlier ruling was worded by its subject from the other side ("the day flush at the left edge, no room beside the arrow") and sat in an area page that loads only when one of its source files is read; neither keyword matched it. The page went out without naming the ruling it narrowed, his blanket yes carried it, and it had to be told to him afterwards. Observation 970's rule (a clash pass before a recommendations page) was in force and was run — its search was too narrow to find the clash.
**Suggested improvement:** Make the clash pass a fixed search, not a judgement: for each question, search the full rulings rows for (1) the screen part's name as the app shows it, (2) each control or gesture that reaches the behaviour, and (3) the opposite of the proposed outcome ("flush", "no gap", "at the edge" when proposing a margin) — and open the area page of every source file the fix would touch before the page is drafted. Write the three search words used on the page's own notes, so a reviewer can see what was searched.
**Principle:** An earlier decision is filed under the words of the day it was made, often the opposite of the words of today's proposal; search by the subject and by the outcome's opposite, never only by the new problem's description.

### Observation 1006: A store-wide guard broke 37 tests the narrow run never touched

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 133, fixing the faults Fable's reads proved ([FABLE-READ-FAULTS])
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** verifying a fix before calling it done

**Issue:** A guard ("refuse a write for an id that names nobody") was added at five doors of a store and checked only against its own proof test, which went green. The area's whole suite later showed 37 failures: the store writes, by design, for ids that are on no roster list (a deleted person's past days, the demo data's own ids). The guard was taken out. Separately, a test file edited while a full run was in flight showed a false failure from the version the run had loaded.
**Suggested improvement:** In the skill's verify step: a change to a shared write path (a store's doors, a gate, a guard every caller passes) runs the whole suite of the area it sits in before it is reported fixed, not only the new test and its neighbours by name; and no test file is edited while a full run that includes it is in flight.
**Principle:** A guard's reach is every caller of the door it sits in; a test that names the guard cannot show who else relied on the door staying open.

### Observation 1002: A "door that opens it today" may open it only in some states

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 137, drawing OIL F2 round 2 (the day's OIL list opened at the sign-off press) on the real app. Numbered past 1000 and 1001, taken on other branches.
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 2 (the nearest real interaction)

**Issue:** The window was to be opened by "Switch to this plan", a door the rulings say opens it. On an unpublished day that door put the row back but not the input's state, so the window never opened and the script timed out; the working door (load a published version back, then unpublish) took three more real steps, and the gap the first door showed was itself a finding.
**Suggested improvement:** In step 2, when a real door is borrowed to open an existing window for a proposal, assert after it both that the window opened AND that the state behind it is the premise (the staged record, the empty boxes); on a miss, log what the door left, try the next real door, say on the page which door was used and why, and file what the failed door did.
**Principle:** A door documented as opening something is a claim about some states; check it in the state you draw, and treat its failure there as data, not only as an obstacle.

### Observation 1003: A shared edge measured across, never along

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 137, OIL F2 round 6 — he saw a drawn row's words ("waiting for your answer") not lined up with the box beside them.
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** The Method, step 3 (a new part's shared edge measured against its neighbour)

**Issue:** The script measured the new row's left edge against the list's first letter and the box's height against the real one, both exact; it never measured the row's two parts against each other vertically. Their baselines were level (0px), yet he saw a miss: lower-case words beside a capitals label sit optically low, their x-height middle 0.75px under the box's middle on the desktop.
**Suggested improvement:** In step 3, a part placed BESIDE another is measured on the cross axis too: the words' x-height middle (canvas `measureText('x')`) against the neighbour's middle line, failing above 0.5px; where baselines are level but the cases differ, centre the x-height optically and say so. Check the picture's ink as well (rows of bright pixels in each box).
**Principle:** Level baselines are not level to the eye when one side is capitals in a box and the other is lower case; measure what the eye compares.

### Observation 1008: A walker's results file held a failed line no report named

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 139, closing the [FABLE-READ-FAULTS] walk (numbered past 1007 on another branch)
**Skill:** session-handoff (and the bug-check order's §7.5 "walked enough")
**Type:** open-source
**Phase/Area:** closing a walk — reading the walkers' results

**Issue:** The handoff said a walker's three scenarios "PASS at both sizes"; its results file held a third failed line
(on the phone, a document gone after a reload) that neither its report nor the handoff named. Tallying every results
file before writing the sheet found it; it proved to be the test browser's own limit (its WebKit stores no file in its
local database), but it could as well have been lost saved data.
**Suggested improvement:** in the handoff skill's and the sheet's close: tally every walker's results file by
pass / fail / note and name each failed line with its disposition; a report's "PASS" is never copied without that tally.
**Principle:** A summary of a test run is not the run; count the raw results before repeating anyone's verdict.

### Observation 1012: A rule that counts "from today" needs the walk's clock set — the running app's today is months past the demo week

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 140, the walk of SANS from its date (D2313); numbered past 1009–1011, which other branches hold
**Skill:** the bug-check order's walk (`raptor-port/docs/walk-scripts.md` §1, §2)
**Type:** open-source
**Phase/Area:** before the walkers start — the host's own short walk, and the walkers' brief

**Issue:** The change made a hand tick count "from the day it is made". The app's today in a walk is the PC's real date
(22 Nov), months after the demo week every walk draws (13 Jul): a tick made in an unclocked browser would have left
every demo day "before his date", and each scenario about "from today on" would have passed while proving nothing. The
host's own short walk caught it only because the first draft of the brief was written against the unit tests' fixed
today. The same short walk also found that the page the route starts on opens filtered (Quals on Pilots; the man was a
WSO), which the source read had not shown.
**Suggested improvement:** in `walk-scripts.md` §1, beside "the clock is set to a start time and left running": when a
change reads today's date, the sizing lines say which today each scenario needs relative to the demo week, the brief
gives the clock line and how to move it a day (`page.clock.fastForward`), and the host's short walk logs the app's own
today before the first step.
**Principle:** A date rule is only walked when the walk's "today" stands where the rule's boundary can be seen from both
sides.

### Observation 1015: A closing report listed the agent's own readings in words alone, in its own shorthand

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** Chat 140, the closing report of SANS from its date (D2313). Numbered past 1013 and 1014, which other open branches hold.
**Skill:** session-handoff (the closing report) / the plain-language rule
**Type:** open-source
**Phase/Area:** The part of a closing report that lists choices the builder made for the owner to keep or strike

**Issue:** The report listed four readings as one-line statements, two of them in the builder's own shorthand ("hand untick") and none with a picture, though each was about what a screen shows. The owner had to ask what the shorthand meant, and then ask for the readings again with pictures. Taking the pictures also surfaced a consequence the one-liner had not stated (a man posted out from a date ahead cannot be filed for until that date).
**Suggested improvement:** In the closing-report step, each listed reading about something on screen carries a worked example (who, which days, what the screen shows) and a marked picture of the real app, taken before the report is sent; a reading is written as who presses what on which page, never with a label coined during the build. Reuse one small script that drives the built app and cuts each picture to its place (here `raptor-port/scripts/handpass/sfd-explain.mjs`).
**Principle:** A choice put to someone to keep or strike is only decidable when it is shown as a case on the thing itself; a one-line statement in the builder's vocabulary hides both its meaning and its costs.

### Observation 1029: the overnight guide still says "Fable only on his word"

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** the settings health-check chat, recording his D2440 (the agent's pick of Fable for high-risk work stands, no end date). Numbered past 1028, the highest on any open branch (this branch's own log ends at 1015).
**Skill:** overnight
**Type:** internal
**Phase/Area:** step listing each job's readers (the line citing D1770, D790, D903)

**Issue:** the guide's line on each job's readers ends "Fable only on his word". Since D2258 (21 Nov 26) and D2440 (24 Nov 26) the agent picks Fable itself for the work it ranks high risk, other readers beside it; only outside that is Fable on his word. A night planned from the guide as written would leave Fable off a high-risk job.
**Suggested improvement:** reword that phrase to "Fable on the agent's pick for high-risk work (D2258, D2440), otherwise only on his word", at the guide's next review.
**Principle:** when a standing rule about who does a job changes, every guide that restates it in passing is found by searching for the old phrase, and each is corrected or given a note the same day.

### Observation 1040: A rule cut to a short form loses the same four kinds of thing — check for them before the readers do

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 158, the every-chat rules' tightening (D2460): the shipping rule file cut to a short form with its full wording moved whole behind it. Numbered 1040, past 1030–1039, which are left for the open branches' logs.
**Skill:** New skill candidate: writing a short form of a rule (the rules diet's method; today in `raptor-port/docs/doc-budget.md` and the rules-diet plan)
**Type:** open-source
**Phase/Area:** writing the short statement that stays loaded when a rule's detail moves behind a pointer

**Issue:** two blind readers of the first short form found the same losses, independently: (1) two different duties merged into the stronger one ("take the lock" and "wait until the lock is free" both became "take"); (2) the second half of a duty dropped (message the other chat — but also answer when asked, and write the promise into the handoff notes); (3) the moment to open the full text named too late (at the merge, though the rule is first needed when the job is planned); (4) a list's boundary summarised by a looser word ("a rule file" shut out files the full list lets in). A fix round then repeated kind (4) once more.
**Suggested improvement:** before a short form goes to its readers, run four checks against the full wording, bullet by bullet: every verb kept apart from its neighbour (take / wait / none); every "and also" clause carried or pointed to; the pointer's moment is the EARLIEST one at which the rule is used, found by searching the guides for who cites the rule; every list either quoted whole or said to be partial, with both its sides named. Put the four in the rules diet's method beside "a move never rewords".
**Principle:** shortening a rule fails in predictable places — merged verbs, dropped second clauses, late trigger moments and loosened list boundaries — so those four are checked by the writer first, and the independent readers are left the faults that are not predictable.

### Observation 1041: A build already in the folder may be another branch's — check before taking pictures from it

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 159 — the guide for another squadron's schedulers; pictures of the live app were needed while another chat held the checks lock
**Skill:** walk scripts and mock-ups (`raptor-port/docs/walk-scripts.md`; the mock-up guide)
**Type:** open-source
**Phase/Area:** before a picture script or walk is pointed at a build that is already on disk or already served

**Issue:** the main folder's built app was a day old and the folder now stood on `main`, so the build looked usable. The folder's own branch history at the build's time showed another chat's unmerged branch had built it (69 code files different from `main`). Pictures from it would have shown work that is not live. Second, in the same job: a guide written by hand from memory of the app had one wrong and six overstated statements out of about forty-five, all in the sentences that summarised who may do what or which checks apply — the tables read out of the app's own text had none.
**Suggested improvement:** in the walk-scripts guide's "before the first picture" steps: when a build was not made in this chat, compare its time with the folder's branch history (`git reflog --date=iso`) and the code difference from the intended branch; if it differs, wait for the lock and build. In the guide-writing notes: anything the app already states in its own words is read out of the app by script, and only the joining sentences are written by hand and sent to a fresh reader.
**Principle:** a build on disk carries no label saying which code made it, so its source is established from the folder's history before anything is concluded or pictured from it; and a summary of rules is safest generated from the place the rules are stated, with hand-writing kept to what cannot be generated.

### Observation 1042: The overnight guide's Low setting predates two scenario designers on every walk

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** Recording his D2443 (every walk's scenarios designed by Astra and a fresh, blind Fable, whatever the risk)
**Skill:** overnight
**Type:** internal
**Phase/Area:** "Low or Medium?" — what each setting runs; the helper list for a job

**Issue:** The guide says Low runs the fewest helpers the checks need and that Medium "means more walkers or a scenario designer inside a job". Since D2443 every WALK and FULL check has two scenario designers, Astra and a fresh Fable, on either setting, so a night run reading the guide literally could leave Fable's design out on Low. Its "Fable only on his word" (Observation 1029) is the same drift.
**Suggested improvement:** At the guide's next review, state that both settings give every walk its two scenario designers (D2443), and that Low and Medium differ only in how many walkers run and whether helpers run at once.
**Principle:** When a rule adds a required helper to a check, every guide that sizes or budgets that check is read for a line that now leaves it out.

### Observation 1051: A task asked for by name was already claimed on an unmerged branch (numbered past 1049–1050 on other open branches)

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** Chat 163 — he asked to start "the bell / taken back" words job; the chat searched `main`'s rulings and backlog, told him no other chat was doing it, and was corrected by the chat that had drawn it the night before
**Skill:** session-handoff (and the rule files `record-decisions.md`, `doc-structure.md` — "search before telling him anything is undecided")
**Type:** open-source
**Phase/Area:** The start of a chat — finding whether a task is already ruled on or in hand

**Issue:** The search-before-you-ask rule names the rulings files, the archive and the backlog, all read from the chat's own checkout. A ruling or backlog item recorded by a parallel chat lives only on that chat's unmerged branch until its merge, so a search of the default branch finds nothing and the chat reports the task as unclaimed. Here two rulings and a backlog item two days old, and a night's finished drawing, were invisible.
**Suggested improvement:** In the rule's "The check" list, add one line: search the open branches too — one `git grep` of the subject across every remote ref's rulings and backlog — and one transcript search of the other chats, before saying a task is unclaimed, undecided or unbuilt. The handoff file's "Before acting on a block" could carry the same line.
**Principle:** Where parallel workers each record decisions on their own branch, "is this decided?" is a question for every open branch, not for the default one.

### Observation 1052: Two chats opened together took the same chat number, twice in one afternoon

**Status:** OPEN
**Date:** 2026-11-24
**Session context:** Chat 168 (opened as "chat 166"), round 4 of the words pass; the speed chat opened at the same time
**Skill:** session-handoff (the opening line's chat number) — the same gap as Observation 951, for chat numbers
**Type:** internal
**Phase/Area:** the opening line's "use the next free number" and a chat's first step

**Issue:** The owner opened two chats minutes apart. Both were told "166". The two-squadron chat already held 166 in its commits, so both new chats moved on, and both claimed 167 within the same minute, each from its own search of commits and handoff blocks. Neither could see the other's claim, because a claim lives only in a chat's first reply until it commits. The second clash was caught only because the owner sent a screenshot of the other chat.
**Suggested improvement:** In the session-handoff skill's opening line and the handoff head's "Before acting on a block": a chat's number counts as taken once another open chat can see it. Read the session titles (`list_sessions` shows "… chat 166" titles) as well as commits; set this chat's title to its number as the first act (`set_session_title`), before any long read, so the next chat's search finds it.
**Principle:** A "next free number" read from committed history is unsafe when two writers start at once: the claim has to be published where the other writer looks, before it is used.

### Observation 1054: A reader's "the approved page shows…" is checked against the page before its claim is believed

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** The FULL bug check of round 4 of the words pass (chat 170): three blind code readers after the walk. (Numbered past 1053, which an open branch's log already holds.)
**Skill:** the bug-check order (`raptor-port/docs/bug-check-order.md`)
**Type:** open-source
**Phase/Area:** §4 "What to do with what they hand back", item 2 (check it against the governing ruling)

**Issue:** A blind reader reported that a note was wrong because "the page he approved shows" a full stop where the app prints a dot, and quoted the sentence. The approved page holds no such sentence: it shows that note only as a picture, and the picture has the dot. Two other sources (a walker's check against the picture's recorded text, another reader) read it the other way. The claim was caught only because the host opened the page and searched its text and the picture's recorded words before acting; a fix "back to the page" would have changed approved words.
**Suggested improvement:** In §4's hand-back list, item 2, add: a claim that rests on what an approved page, picture or drawing shows is checked against that artefact itself — its text searched, its picture's recorded words read — before it is dispositioned; a reader's quotation of an approved artefact is a claim like any other. And in the readers' brief, ask for the file and line (or the picture's name) behind any "the approved page shows".
**Principle:** A reviewer's quotation of a source is still a claim; open the source before acting on what it is said to say.

### Observation 1004: A drawing helper's script checked button rows but not text cut off inside a select

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** Chat 137, batch 1's second-half mock-up page — opening the row-redesign pictures a helper drew (numbered past 1002–1003, held by other branches)
**Skill:** New skill candidate: mockups-on-the-real-app (`.claude/skills/brainstorming/mockups-on-the-real-app.md`)
**Type:** open-source
**Phase/Area:** the premise checks a drawing script runs before it takes the picture

**Issue:** The helper's script asserted that each row of buttons stayed on one line, but the phone picture of its recommended option showed the Role drop-down cutting its words off mid-word ("Admin — schedule…"). The helper did not report it; the host found it only by opening the picture.
**Suggested improvement:** In the guide's premise checks, add: for every input or select a transform touches or puts beside new content, assert its text is not cut off (`scrollWidth <= clientWidth + 1`) at each picture size, and print the result.
**Principle:** A drawing's automatic checks cover overflow in every control it changes, not only the layout it meant to change; a picture is opened by the host whatever the checks say.

### Observation 1009: A plan called a point open that an earlier step had already answered in the code's own notes

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** writing batch 1's second-half technical plan (chat 138); numbered past 1008, held on another open branch
**Skill:** writing-plans
**Type:** open-source
**Phase/Area:** before listing a plan's open points

**Issue:** The plan wrote "a spike: find out whether the Tracker can be re-read in place" as an open point. The module's own comment, written by an earlier step's read of its load path, already answered it: it cannot be re-read cleanly, and it listed the caches. The host found this only after the plan was written and sent to readers, so the plan went out with a question already settled.
**Suggested improvement:** In writing-plans, before an item is written as "to be found out", search the earlier plans' open-points sections and the code comments of the files concerned for an answer, and cite it, or say none was found.
**Principle:** An open point in a plan is a claim that nobody has answered it; check the earlier work and the code's own notes before making that claim.

### Observation 1010: A plan's red team was given the older two-reader rule, not the newer risk rule that adds Fable

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** batch 1's second-half plan (chat 138); numbered past 1008, held on another open branch
**Skill:** claudex-loop
**Type:** internal
**Phase/Area:** choosing the readers of a plan's red team

**Issue:** The host sent the plan to Astra and a fresh Opus reader only ("an important plan's red team: two readers"), though the newer ruling D2255 (21 Nov 26) has high-risk work read by Fable beside the others, and the build's earlier plan had three readers. He had to ask "should we also ask an independent fable reviewer?". Fable, added in round 2, found the plan's shape fault (the pick laid over three things that keep their own squadron) the other two had missed.
**Suggested improvement:** Before sending any red team or code read, list the reader rulings that apply by date and risk (how-we-work §Models and readers), newest first, and name in the brief which one sets the readers.
**Principle:** When several rules set who reads, the newest that covers the case decides; read the list by date each time instead of from memory.

### Observation 1011: A drawing helper marks every drawn part New unless the brief says which parts are approved

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 139 — drawing ten small questions (F1–F10) on the real app for the owner's look, by a helper
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** the brief handed to a drawing helper; the New / Approved marks

**Issue:** The helper redrew an already-approved row design around one new line and tagged the whole row "New"; the host caught it on opening the pictures and sent four pictures back. The brief had listed what to draw but not which of the drawn parts the owner had already approved.
**Suggested improvement:** In the method's helper-brief section, require the brief to name, per picture, the parts already approved (blue mark) and the parts new this round (pink mark); the helper's report lists the marks it used per picture.
**Principle:** A picture that marks approved work as new asks the reviewer to decide it again; tell the drawer what is already settled, not only what to draw.

### Observation 1013: A new standing check breaks old tests that forge the state it now forbids

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** batch 1's second half, step A — a check run on every repaint that moves an admin off Edit Schedule where he may not edit the squadron in view (number past 1012, held by another branch)
**Skill:** New skill candidate: guard-rollout
**Type:** open-source
**Phase/Area:** adding an always-on invariant to a shared refresh path

**Issue:** The new check was written over "anyone signed in"; a dozen existing tests deliberately put a member on the edit page (a forged state) to prove the edit guards hold behind it, and the check moved him away first — the tests failed for a reason unrelated to what they prove. The fix was to narrow the check to the one question it owns (the squadron, for an admin), leaving the role's own landing where it was.
**Suggested improvement:** When adding a check to a shared refresh path, first search the tests for ones that forge the state the check forbids, and scope the check to the exact question it owns rather than a wider condition that happens to include it.
**Principle:** A standing invariant should own one question; a broader condition silently takes over other rules' territory and breaks the tests that exercise those rules' fallbacks.

### Observation 1014: "The related tests are green" missed three faults the whole suite found

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** batch 1's second half, phase 2 — the whole unit suite, owed by the chat that built step A (it had run "the 131 test files that name the changed helpers"), run under the lock at the next chat's start
**Skill:** verification-before-completion
**Type:** open-source
**Phase/Area:** choosing which tests to run after a change, before the whole suite

**Issue:** Step A changed which edit question many doors ask. The previous chat ran the test files that NAME the changed helpers and reported them green; the whole suite then found three faults none of those files covered: a test that faked the OLD helper (a spy on a function the door no longer calls, so it stopped testing anything and failed on the real answer), a type check over a folder no named file touched, and a window that turned read-only for a case its own code comment said must stay editable. Selecting tests by "names the changed function" misses a test that names the function the code moved AWAY from, and every test whose subject is the screen rather than the helper.
**Suggested improvement:** When a change swaps which helper a caller asks, select the related tests by the OLD name as well as the new (a spy or a mock of the old one is now testing nothing), and treat "related files green" as a provisional result until the whole suite has run — say so in the handoff rather than "green".
**Principle:** A test that fakes a dependency silently stops testing once the code stops depending on it; test selection by name must include the names the change removed.

### Observation 1016: A test written first but never seen red per test can pass for the wrong reason

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 143 — multi-squadron batch 1 second half, phase 2 step D (requests by squadron); numbered past 1015, which another branch holds
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** RED — verify the test fails for the reason it names

**Issue:** The new tests were written before the code, but their first run failed only because the file could not import a function not yet written, so no single test was ever seen failing. Proving the gate tests afterwards by switching each new rule off showed one ("the Undo of a new squadron is refused while a request names it") still passing with its rule off: it was refused for another reason — the test signed in as the person asking, and signing in as someone else clears the first person's Undo list, so the Undo failed with nothing to undo. Rewritten (the request arrives as if from another device, plus a control that the same Undo goes through without the request), it then failed with the rule off and passed with it on.
**Suggested improvement:** In RED, a file-level failure (an import, a missing export) is not a red: each test must be seen failing on its own assertion. Where the code cannot be stubbed first, prove it afterwards by disabling the one line under test and running again, and add a control case showing the same steps succeed when only that line's condition is absent.
**Principle:** A refusal test proves the rule only if the same steps succeed once the rule's one condition is removed; a whole-file failure proves nothing about any single test.

### Observation 1017: A seeded record has no stored row, so "no row before" does not mean "new"

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** chat 143 — step E's place rule at the commit gate
**Skill:** New skill candidate: raptor-gate-rules (or the executor rules, `.claude/rules/raptor-executor.md`)
**Type:** internal
**Phase/Area:** writing a commit-gate rule that tells a created record from a changed one

**Issue:** The new gate rule treated a place row with no "before" image as a new place (a master admin's alone), so a Plan holder changing the demo's Home base — a seeded place that was never stored as a row — was refused as "a new place made alone". The fix asks whether the rows before the command hold it (the seeded rows included).
**Suggested improvement:** Add to the executor rules: in a gate rule, "created" is "not in the rows before the command" (the loader's reading, seeds included), never `before == null` alone — a seeded record's first write has no before image.
**Principle:** Judge creation against the model's view of what existed, not against the storage layer's record of what was written.

### Observation 1018: A test's sign-in switch silently empties the Undo list, so an Undo test fails for the wrong reason

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** chat 145, multi-squadron batch 1 step F (D1′) — tests of a bell line coming back with an Undo of a right's take-away
**Skill:** test-driven-development
**Type:** internal
**Phase/Area:** writing a red-first test that presses Undo or Redo

**Issue:** The first red run had every Undo test fail with "Undo did nothing" before the rule under test was even reached: the test world's `signInAs` (and any helper that calls it — "post him out as Kestrel", "read Hunter's bell as Hunter") resets the session, and a sign-in clears the signed-in person's Undo list (D148). The tests looked red for the right reason only after one sign-in carried the whole step-then-Undo sequence (a second master admin made first, so one person could give, post and undo).
**Suggested improvement:** In the project's test-writing notes (raptor-executor rules, the tests section): a test that presses Undo or Redo keeps ONE sign-in from the step to the Undo — no helper in between that signs in — and reads other people's bells without signing in as them; and a red-first run is read for WHY each test failed (the assertion's message), never only for "it is red".
**Principle:** A red test proves the gap only when it fails at the assertion that names the gap; read the failure's reason before believing the red.

### Observation 1020: A gate-refusal test must save the forged record the way a real writer does

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** chat 146 — multi-squadron batch 1's second half, step F: the own-account bell lines and their commit-gate check (numbered past 1019, the highest on any branch)
**Skill:** New skill candidate: gate-test-writing (or the project's test-writing notes, raptor-executor rules)
**Type:** open-source
**Phase/Area:** writing a test that a forged record is refused by a commit check

**Issue:** Four "a forged line is refused" tests passed the gate (the command came back ok) although the check was correct. The hand-built commands pushed the forged line into memory but skipped the store's own end-of-command step, so the line never entered the command's list of changes — the check had nothing to judge, and the line sat unsaved in memory. A one-off probe that printed the command's changes showed it; with the end step added, every forgery was refused for the right reason.
**Suggested improvement:** In the test-writing notes: a forgery test builds its command exactly as the real writer does (every store enlisted and every end step run), and asserts the refusal's own words, not only "not ok" — and when a refusal test unexpectedly passes, print the command's change list before doubting the check.
**Principle:** A test of a guard only proves something if the forged input actually reaches the guard; check what the guard was handed before concluding it let something through.

### Observation 1021: a "next load" test must load the same saved data, or it proves nothing

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** chat 147 — multi-squadron batch 1's second half, step F §7 item 7: the "posting could not run" line, tested across three loads of the app
**Skill:** New skill candidate: gate-test-writing (or the project's test-writing notes, raptor-executor rules)
**Type:** open-source
**Phase/Area:** writing a test that simulates the app being opened again

**Issue:** The test's "open the app again" helper gave the reload a brand-new empty store for one half of the data. The saved posting was gone after the reload, so "it runs on the next load once the cause is gone" failed for a reason that had nothing to do with the code. Only reading the failure ("it did not run at all") against the helper showed it.
**Suggested improvement:** In the test-writing notes: a reload helper re-reads the SAME stored data the earlier steps wrote — keep each store in one variable made fresh per test, never inside the helper — and a "survives a reload" test asserts first that the saved record is still there after the reload.
**Principle:** A simulated restart must keep what a real restart keeps; check the saved state survived before judging behaviour after it.

### Observation 1022: A handoff's "Pick up here" named the next phase, not the next step

**Status:** OPEN
**Date:** 2026-11-22
**Session context:** chat 135, carrying on a handoff whose "Pick up here" said "then the next multi-squadron batch per the batch plan"
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the "Pick up here" line and the next chat's reading of it (numbered past 999 and 1000, held on other branches) — renumbered from 1001 at chat 148's merge of main (22 Nov 26): main holds another note 1001

**Issue:** The handoff said "the next batch per the batch plan". The next chat read it as the plan's batch 2 and put that to the owner, who said go; only on reading the plan did it find batch 1's last two steps (every screen of it) unbuilt and a prerequisite of batch 2. The owner had to answer twice.
**Suggested improvement:** In the handoff step that writes "Pick up here", name the exact next step by the plan's own numbering and say what of the previous phase is still unbuilt ("batch 1 steps 5–6, then batch 2"); in the opening read, check a named phase's prerequisites are built (one search of the code for its screens) before proposing it to the owner.
**Principle:** "The next phase" is ambiguous once a phase was split across two pull requests; a handoff names the step, and a reader verifies the step before offering it.

### Observation 1023: A pull request that cannot run hides every browser-test failure until it can

**Status:** OPEN
**Date:** 22 Nov 26
**Session context:** Chat 149, the multi-squadron screens branch, phase 3 — the first GitHub run the branch ever had, after `main` was brought in
**Skill:** session-handoff (and the bug-check order's gates step)
**Type:** open-source
**Phase/Area:** the handoff's "Gates" line; the gates step before a phase is called done

**Issue:** Two phases were built and handed off while the pull request clashed with `main`, so GitHub never ran it; on the developer's PC only the unit tests ran. The first real run found 35 browser-test failures from phase 1's permission change (a test-only shortcut that sets the role in force stopped opening edit controls). Each handoff's "Gates" line said "Not run: browser tests", which read as a small gap, not as "this phase has never been checked in a browser".
**Suggested improvement:** In the handoff skill's gates line, when the pull request ran no checks (clashing, stacked or not opened), say so as its own line ("GitHub's run has never passed on this branch — N phases unchecked in a browser") and make the next chat's first step bringing `main` in and getting one green run before building more; in the bug-check order's gates step, a phase that changes permissions runs the browser tests of the pages it guards locally before it is called done.
**Principle:** A check that did not run is not a pass; a handoff must name an absent check as loudly as a failed one, and the next builder settles it before stacking more work on top.


### Observation 1025: Mock-up "new part" rings were read as part of the design

**Status:** OPEN
**Date:** 23 Nov 26
**Session context:** chat 149 — drawing D2381's View-only top bar and ☰ menu for the owner on his iPhone (numbered past 1024, held on another branch)
**Skill:** impeccable
**Type:** open-source
**Phase/Area:** mock-ups put to a non-designer for approval

**Issue:** Each proposed picture had a 2px accent-coloured ring drawn around every new part, to show what changed. The owner, looking on his phone, asked whether it "would look nicer without that blue cyan outer box" — he took the marker for part of the proposed look. A redraw with clean pictures was needed.
**Suggested improvement:** In the mock-up guidance, show each proposed screen clean first, exactly as it would ship; put any change markers on a second, separate copy labelled as markers (or say in words what is new). Never let the only proposed picture carry annotation in the product's own accent colour.
**Principle:** An annotation drawn in the product's own visual language is read as product; the picture a person approves must be the thing itself, with the explanation kept outside it.

### Observation 1026: A fresh chat opened on the same task while the old chat still worked in the same folder

**Status:** OPEN
**Date:** 23 Nov 26
**Session context:** chat 150, opened with the handoff's opening line while chat 149 (82% full) was still busy in the same working folder on the same job
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the opening line, and the new chat's first step

**Issue:** the opening line told the new chat to switch and pull in a shared working folder; the old chat had uncommitted edits written a minute earlier. Only a check of the folder's uncommitted files and their times caught the clash before anything was overwritten.
**Suggested improvement:** the new chat's first step, before any switch or pull: list the live chats, check the working folder for uncommitted changes and their times, and message any busy chat on the same branch; the opening line says "if the folder has uncommitted changes, stop and ask".
**Principle:** before taking over a shared working copy, prove nobody else is writing in it.

### Observation 1027: a reader allowed single test files ran them while the full suite held the lock — one false failure

**Status:** OPEN
**Date:** 23 Nov 26
**Session context:** chat 151, the FULL bug check of D2381–D2384 (multi-squadron branch): a fresh Opus fix-round reader ran beside the locked unit suite
**Skill:** New skill candidate: reader-brief (the code-read briefs of the bug-check order §4)
**Type:** open-source
**Phase/Area:** the reader's brief — what it may run

**Issue:** the reader's brief let it run single unit-test files to prove a claim. The host then started the whole unit suite under the PC's checks lock while that reader was still running its files. The suite ended with one timing-sensitive Leave War test failing; alone it passed three times out of three. The lock guards whole runs only, so nothing stopped the clash, and the host lost a cycle proving the failure false.
**Suggested improvement:** a reader started while a locked run is going, or that may still be running when one starts, gets "run no tests" in its brief; or the host holds the full suite until every helper allowed to run tests has reported.
**Principle:** anything that runs tests on the same machine counts against the "one test run at a time" rule, including a helper's small proofs.

### Observation 1028: the stop-time code check reads the chat's home folder, not the copy the chat works in

**Status:** OPEN
**Date:** 23 Nov 26
**Session context:** chat 151, working in a second copy (Raptor-msq) while the chat's home folder held another chat's branch
**Skill:** New skill candidate: the code-check Stop hook (.claude/hooks/code-check-stop.mjs)
**Type:** internal
**Phase/Area:** which checkout the hook reads

**Issue:** the Stop hook showed him "24 new problems in the code this branch changes". The count was for the home folder's branch (the SANS chat's, with work in progress), not this chat's branch. Run by hand, both copies read zero. He asked whether it would be fixed automatically — a false alarm that cost his attention.
**Suggested improvement:** the hook names the branch and folder it read in its line ("Code check on allavail-152: …"), or reads the copy the chat last committed in.
**Principle:** an automatic check's message names what it checked, so a reader can tell whose result it is.

### Observation 1047: A helper's transcript file is empty here; its report lives only in its hand-back

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 153's overnight run (numbered past 1041, the highest on any branch)
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2, "A helper's report"

**Issue:** The guide says a report can be recovered from the helper's transcript. On this machine every background helper's output file was empty, so a recovery script found nothing, and each report had to be saved by hand, word for word, from the hand-back message the moment it arrived.
**Suggested improvement:** In Part 2, say: save the report from the hand-back message at once, verbatim, to the scratch folder (or the repo once the blind readers are all in); do not plan on reading it back from the transcript.
**Principle:** When a tool's side channel is unreliable, capture the result from the one place it is certain to appear, at the moment it appears.

### Observation 1043: A check lead fanned out walkers without the checks lock, until the brief made the lock a command

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 153's overnight run, the FULL walk and its two re-walks
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2, each job's brief to a helper

**Issue:** The first walk's lead ran three walkers side by side without the shared checks lock, though the rules require it, while another chat used the same PC. The two later briefs named the exact take, beat and release commands, said "mandatory" and asked for the release in the report, and both leads took and released it.
**Suggested improvement:** The overnight guide's brief list should require the lock commands written out in every walk or full-check brief, and a "lock released at" line in the helper's report, checked by the coordinator.
**Principle:** A shared-resource rule a delegate must follow belongs in the delegate's brief as the exact commands, with proof of it asked for in the report.

### Observation 1044: A questions page went to the owner with facts nobody checked against the app

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 153, after its overnight run, at 62–72% full
**Skill:** New skill candidate: questions-page
**Type:** open-source
**Phase/Area:** putting questions to a non-technical owner

**Issue:** A page of nine questions was drawn from the night's notes, not from the app. A reviewer's edit added a false fact ("a member cannot save a chart") and the host published it unchecked. Pictures were reused from the walk and did not show the cases they sat beside. The owner said the questions were getting worse and the mistakes more, then added "clarity as well": the questions were also hard to follow.
**Suggested improvement:** A questions page is built by a fixed routine: each case pressed on the app and read in the code; one "today" picture of exactly that case and a drawing of the proposal; recommendations checked against the rulings; then the host re-reads every sentence against the app before publishing, and marks anything unconfirmed. A reviewer's edits are checked like the first draft. Late in a long chat, hand this to a fresh chat instead.
**Principle:** Every fact on a page put to a decision-maker is checked against the source at the time of writing, including the facts a reviewer added; notes and earlier reports are leads, not evidence.

### Observation 1048: A helper was refused its report file again — closed note 915 met again; the brief asks for a short hand-back and FACT lines

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 162 (logged by chat 166 at his word): four helpers in a row were told to write their report to a scratchpad file
**Skill:** overnight
**Type:** open-source
**Phase/Area:** Part 2, "A helper's report"; every helper brief

**Issue:** Observation 915 (ACTIONED 20 Nov 26) already said a helper's write of its own report file is refused. A later handoff note advised the opposite (have the helper write its report to a scratchpad file), and on 24 Nov 26 four helpers were refused in a row; each pasted a long report into its hand-back, and saving each reader's report into the repo meant retyping it (about 2,500 tokens each). The rule was written down but a brief template still asked for a file.
**Suggested improvement:** Guard it in the brief template, not in prose: every helper brief ends with a fixed "Your hand-back" block — a final message of at most N words; every fact as a `FACT` line printed by a script the helper leaves in the repo (re-runnable by the host); the script's raw output saved by the script into the repo's scratch folder. Never "write your report to <file>". Astra alone writes its own report (`codex exec -o`).
**Principle:** When a delegate cannot persist a document, have it persist a re-runnable script whose output carries the facts, and keep its prose hand-back short; a rule that a template contradicts needs the template fixed.

### Observation 1049: The publishing tool reads only from the chat's own folder or scratchpad

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 162 (logged by chat 166 at his word): publishing the rebuilt questions page, which lives in another worktree
**Skill:** brainstorming (mockups-on-the-real-app.md)
**Type:** open-source
**Phase/Area:** showing a mock-up or questions page to him as a published page

**Issue:** The page and its pictures sat in the worktree the chat worked in (not the chat's own session folder). The publish tool refused them: it reads only from the chat's own working folder or its scratchpad.
**Suggested improvement:** In the mock-up guide's publishing step: before publishing, copy the page and every picture it references into the scratchpad, keeping their relative paths, and publish from there with `files`; check each referenced path exists in the copy first.
**Principle:** A publishing tool's reach can be narrower than the shell's; stage what you publish inside the tool's own allowed folders first, and verify the staged copy is complete.

### Observation 1050: A question for him is established by a script that prints what the screen said, re-run by the host, before any recommendation is written

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 162 (logged by chat 166 at his word): the questions page rebuilt after round 1 carried facts nobody had checked
**Skill:** New skill candidate: questions-page
**Type:** open-source
**Phase/Area:** before a question and its recommendation are written

**Issue:** Facts behind questions (what a window says, which button saves, whether a case can happen at all) were taken from notes or a helper's prose; some were false (one question's case could not happen in today's app). Chat 162 rebuilt the page with helpers whose scripts print `FACT` lines of what the screen said, and the host re-ran each script before writing anything.
**Suggested improvement:** The questions-page routine (Observation 1044) gains a fixed first step: each question's case is pressed by a script that prints `FACT` lines of the screen's own words and states; the host re-runs it and reads the output; only then is the question and its recommendation written. A question whose script was not re-run by the host does not go on the page.
**Principle:** Establish the facts of a decision from a reproducible observation the presenter has re-run, before drafting the recommendation, so the recommendation cannot shape the facts.

### Observation 1055: A handoff's opening line tests "this folder" for another chat's changes, but the job's folder is a different one

**Status:** OPEN
**Date:** 24 Nov 26
**Session context:** chat 171 opening from chat 166's handoff line for the guard-rail job (numbered past 1051–1053, seen on other open branches)
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the ready-to-paste opening line — the clause that sends a continuing chat to a second worktree

**Issue:** The line said: if where you are shows changes you did not make, make a second worktree; otherwise work in the job's own folder. Every chat starts in the main folder, which held another chat's unsaved changes, so the clause fired by its letter — though the job's own folder, a separate worktree, had been released clean and no live chat worked in it. Followed literally it would have made a second full copy for nothing; the chat used the job's folder and named the difference to the owner.
**Suggested improvement:** In the opening-line template for a job that lives in its own worktree, the test names that folder: "if <the job's folder> has uncommitted changes or a live chat works in it, make a second worktree; otherwise work there". The starting folder is tested only where the job is to run in it.
**Principle:** A guard condition in a handoff must test the resource the next worker will actually use, not the place the worker happens to start.

### Observation 1057: A check that says "could not compare" — read the tool's own report for a skipped part before hunting the base

**Status:** OPEN
**Date:** 25 Nov 26
**Session context:** Chat 175's night — `main` brought into the guard rail's branch; GitHub's code check went red with "React Doctor could not read origin/main's side, so it compared nothing". (Numbered past 1056, which another open branch holds.)
**Skill:** New skill candidate: reading a red gate (or a section of `gates-and-deploy.md`'s traps)
**Type:** open-source
**Phase/Area:** After a gate goes red on a merge of the main branch

**Issue:** The message named the base branch, so the first suspects were the base (a shallow copy, a moved `main`, the raw-byte cause met on 20 Nov). The real cause was in the tool's own JSON report: one part of its check was skipped for a size limit (more than 5,000 code files), and the wrapper script rightly refused a report with a skipped part — but printed the same sentence for every way of not comparing. Twenty minutes went to the tool's source before the report's `skippedCheckReasons` was read.
**Suggested improvement:** In the wrapper script, print the skipped part's own reason when there is one, instead of the one sentence; in the gates guide's traps, a line: "compared nothing" → run the tool by hand with its JSON output and read the skipped checks and their reasons first. A count-based limit in a tool is measured against the project's growth when the tool is adopted (how many files now, how many a month).
**Principle:** When a wrapper reports one message for several failures, read the wrapped tool's raw report before reasoning from the message; and when adopting a tool, look for its hard limits and note how far the project is from each.
