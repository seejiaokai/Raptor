# Fresh, blind Opus read — skill-notes review drafts of 27 Oct 26 (D1414)

Read at 09d4818fd: live files, the named rulings' full rows, `[OVERNIGHT-SESSION-PER-JOB]`, the notes below; check 8's
commands run read-only.

## Findings, most severe first

### 1. HIGH — `overnight/SKILL.md`, Part 2 "Stop starting new jobs": the new exception widens D1033 and contradicts its own cited case

D1033's full row: the 90% stop yields only "where the weekly reset falls before the run would end". The draft's "unless
what is left resets before it could be used" is a different condition — used by the night, or by him the next day? Its
cited night, 26 Oct 26 (note 643), had the reset 17 hours off, AFTER the 12-hour night: D1033's reading starts no job,
and the draft's words, read either way, stop too. The cited case is one the draft would not allow. **Why it matters:** an
unattended run stops for no reason or spends allowance against his recorded reading.
**Fix:** replace "figure passes 90% — unless what is left resets before it could be used, and then run until the limit,
saving at every step (his D1033: allowance is not saved by stopping; 19 and 26 Oct 26) — or when his selection is done."
with:
> figure passes 90% and the weekly reset falls after the night would end — where the reset falls before it, jobs go on
> being started past 90% until the limit, saving at every step (his D1033) — or when his selection is done.

Put the 26 Oct case to him as a question in his rounds: "when the reset falls after the night ends, should the night still
run past 90%?" If he says yes, it is a new ruling, and the line names it.

### 2. HIGH — `overnight/SKILL.md`, Part 2 "Each job is handed to one fresh helper": it presents a change to his ruling as the ruling

D1103 rules "a fresh **session** of its own … if it works, the overnight guide is changed to say so". The night tried
helpers, not sessions, and no verdict that it worked is recorded (13% → 16% for three jobs, with no baseline). "(D1103, as
that night found it)" turns the substitution into the ruling, and drops the alternative D1103's row records ("a separate
session per job needs his message typed in the desktop app, all started together"). Row 715 rightly plans to ask him
(Round 2, Q1), but the line as worded would be installed citing the wrong ruling.
**Fix:** the bullet's last sentence becomes:
> His D1103 asked for a fresh session per job; on 21 Oct 26 the app started none from a turn his phone sent or a finished
> job woke, so the night ran helpers instead — this line is his approval of that change (D<new>, <date>). A session per job
> still works when he types the night's message in the desktop app, all of them started together.

Install it only with the D-number of his answer. `[OVERNIGHT-SESSION-PER-JOB]` closes only then.

### 3. MEDIUM — the same bullet: four mechanics that contradict the rest of the guide (found replaying a night, check 2c)

(a) "wakes itself within the hour" contradicts step 9 ("never by ending the turn"); note 715 says it was a background
timer every 45 minutes. (b) "Auto-fix off" is put in the helper's brief, but note 718 found "the helper may not have the
tool — the coordinator does it". (c) The helper makes "no edits to `HANDOFF.md`", yet the block is committed BEFORE a pull
request opens; nothing says who opens it. (d) One checkout: the coordinator "keeps the records" while the helper builds
in the same tree, and "Medium … several at once" reads as two builders at once — D1104 reading (4) means several walkers
or readers inside one job.
**Fix:** replace the bullet's first two sentences with:
> **Each job is handed to one fresh helper** (the Agent tool, in the background), one job at a time — never two builders
> in this one checkout; Medium means more walkers or a scenario designer inside a job, not two jobs at once — with a
> complete brief: its branch, its items, its check, the helper limit Low or Medium sets, push by explicit refspec, no
> edits to `HANDOFF.md`, its own Sonnet walker and fresh Opus reader; under Low the read's fixes and the re-walk go back to
> the same helper while its copy is warm (D1104). The night's chat only coordinates: while a helper runs it writes nothing
> into the tree (records are drafted in the scratch folder and committed between jobs); it switches Auto-fix off itself
> when a pull request's event arrives, since a helper may not have the tool (D1090); it commits and pushes the block,
> then opens each job's pull request; and it checks each report. It waits inside the turn; where it must end the turn, it
> first arms a background timer of under an hour, so the night is woken before its cache goes cold (21 Oct 26).

And in step 9, after "never by ending the turn", add: "— except as Part 2's coordinator does, with a background timer
armed —".

### 4. MEDIUM — `bug-check-order.md` §4, the new table "What each part of a check holds still": two cells wrong, against `walk-scripts.md` §9

`walk-scripts.md` §9 says: "A runner that edits source holds the tree until it prints DONE: no edit, build, browser test
or commit meanwhile". The table gives a break test "—" under "Needs held still". It also gives a build "—", but a build
reads the source, so an edit or break made during a build ships a mixed build. Someone following the table could run a
build beside a break test, which the order then forbids two lines later.
**Fix:** two rows become:
> | A break test | the whole tree until it prints DONE — no edit, build, browser test or commit meanwhile (`docs/walk-scripts.md` §9) | the source, for minutes |
> | A build, or a browser test (which builds) | the source it builds | the built folder |

### 5. MEDIUM — `walk-scripts.md` §6, the drafted check before a re-walk: a false stop

The drafted line says `grep -n "LW_OUT =\|HP_SHOTS =" <its files>` "must print nothing". But the same line says to run a
re-walk "from a small script FILE that sets the folder first", and that file sets the folder with a plain `=` on purpose.
The live `scripts/handpass/lw-night-rw-lib.mjs:4` (`process.env.LW_OUT = '2026-10-25-lw-night/rewalk'`) is exactly that
file. So does `process.env.HP_SHOTS = process.env.HP_REWALK || …` in `am/b1-01…`, which is also safe. The check is never
clean, and the agent learns to read past it, which is the failure note 705 records.
**Fix:** replace "must print nothing (each must read `||=`)" with:
> must print nothing but the re-walk's own setter file (its one line naming the `rewalk/` folder) — every other helper
> must read `||=`

The matching sentence in `_docs/OUTSTANDING-items.md` ([CHECK-TOOLS-HARDEN], 705) needs the same exception.

### 6. MEDIUM — `task-observer/SKILL.md`, Numbering discipline item 4: the drafted command floods the chat

Run here, `git grep -o -E '^### Observation [0-9]+' $(… refs/remotes) -- .claude/skill-observations/log.md` prints
**23,180 lines**, each prefixed `ref:path:`, and gives no highest number. Read as written, it fills an agent's context;
cut short with `head`, it reproduces the trap of note 602. The rulings form in `DECISIONS.md` (with `-h`, sort and tail)
printed `D1412 / D1413 / D1414`, which is right.
**Fix:** the parenthesis becomes:
> (`git grep -h -o -E '^### Observation [0-9]+' $(git for-each-ref --format='%(refname)' refs/remotes) -- <log path> | sort -u -k3,3n | tail -3`)

Tested: it prints 719, 720, 721.

### 7. MEDIUM — `session-handoff/SKILL.md` Step 3 and `gates-and-deploy.md`, the main-checkout paragraph: "Tell him" is the wrong action

The hook (memory `one-checkout-per-session`) refuses Write/Edit into another worktree, not git; the handoff guide already
runs `git -C <that folder> switch --detach` there when it is clean (D975 reading 2). Note 600 asks to bring the main
checkout to `main`. "Tell him", with no step for a non-technical owner, leaves merged hooks and skills dead (the 14 Oct 26
case); the gates paragraph names no one. And "verify in a NEW chat" belongs in the block's pick-up.
**Fix (SH):** replace "Tell him when that folder is not on `main`, and verify in a NEW chat by what the app itself reports
(`get_usage`, the skill list) — never by running the script by hand" with:
> When that folder is not on `main`: if `git -C C:\Users\User\projects\Raptor status --short` shows no tracked change and
> no chat is working in it, switch it (`git -C … switch main`) and say so; otherwise tell him in one plain line what holds
> it. The block's pick-up then tells the next chat to verify by what the app itself reports (`get_usage`, the skill list) —
> never by running the script by hand

**Fix (GD):** after "clean of tracked changes", add "— the chat that saw the merge switches it, as the handoff guide
says —".

### 8. MEDIUM — `design-practices.md` §0 step 2, the added sentence: one clause contradicts its own step, and one narrows approved wording

(a) "the fresh reader is handed his words, the option he picked and the line, nothing else" contradicts the same step's
approved sentence, "that rule gets a short pointer to it, checked by the same fresh reader as part of the lesson". A
reader given nothing else cannot check the pointer or whether the lesson really narrows the rule.
(b) "is no wider than what he corrected" stands against the approved "One line: the lesson in terms of the app he
intends", and against D852's step 1, which asks for the point behind the correction. Today's lessons carry that point
inside the line (Lesson 61: "What it says about the app he intends (D852): …"). Under the draft, that sentence becomes "a
reason of the agent's" that must move out. It narrows the D855 and D941 wording without saying so.
**Fix:** replace the added sentence with:
> **The line keeps to his words:** it quotes or closely paraphrases them, covers no case he did not correct, and gives no
> reason he did not give; the point behind it (step 1) is stated as his words support it, and anything of the agent's own
> is marked as the agent's reading. The fresh reader is handed his words, the option he picked and the line — and, where
> the lesson narrows a rule, that rule and its pointer — nothing else (16 Oct 26: the first lesson gained a reason he never
> gave and a wider scope, both found that way).

Name it to him as a change inside wording he approved. The §9 head's range sentence narrows nothing, and is fine.

### 9. MEDIUM — `_install/install.mjs`: a failure can leave the archive doubled and the drafts half-installed

(a) The archive file is written (line 152) BEFORE the count check (line 153). On a mismatch, the log is put back but the
moved entries stay appended in `archive/log-2026-10-27.md`, so they are now in both files, and a re-run appends them
again. (b) The drafts are copied over the live files (line 90) before any log check, so a failure leaves new guides beside
old statuses. (c) `--decline-asks` declines 623 and 703 together, while he may answer them apart.
**Fix:** move lines 151–152 below line 153, so the count check runs first and the archive is written only once it passes;
move `copyDrafts(...)` to just before `fs.writeFileSync(logPath, after)`; and replace `--decline-asks` with
`--decline <n>[,<n>]`, testing `declined.has(n)`. Checked and sound: the stale-base guard, the one-entry status edit,
`--skip` (the regex does not let `BC` match `BCO`), and the rehearsal restoring only `LIVE`, by name.

### 10. MEDIUM — `walk-scripts.md` §4, "A word is found by the element that draws it": a false PASS that obeys every drafted line (check 2b)

A walk checks the Leave War's "FO*" on a phone: it asserts the list's size first (31 cells), finds each cell whose own
trimmed text equals "FO*", and passes, obeying every line. But the query matched the copy the app keeps hidden (a frozen
band, the week behind the board), and the drawn cell is wrong. The mock-up guide carries the guard ("the n-th VISIBLE
match"); the walk guide does not. Likewise "every scroll step asserts that the scroll position moved" passes when
`window.scrollY` moved but the grid's own scroller did not (note 706's case).
**Fix:** in the word line, after "find a drawn element", insert "— a box wider than zero, inside the surface being
checked: the app keeps hidden copies (the week behind the board, a phone's frozen band) —". In the scroll line, after
"asserts that the scroll position moved", insert "— of the scroller the step means to move, not the window —".

### 11. MEDIUM — `overnight/SKILL.md`, Part 1 step 5 (live text, found replaying a night): Fable against D903

It still says "Fable as well on OIL, published days, who may do what, saved data"; D903 says Fable reads nothing unless
he calls for it, so a night sizes and spends Fable reads he ruled out (D201: fix what an old ruling left behind).
**Fix:** "its model reads (D790, D903: a fresh, blind Opus read of the finished code; Fable only on his word)".

### 12. LOW — `overnight/SKILL.md`, Part 1: three small points of the replay

(a) The order "Write and commit the block BEFORE opening it" leaves open whether the block is pushed. **Fix:** "Write,
commit and push the block BEFORE opening it". (b) "Low or Medium?" sits beside "at most four questions", and the checklist
counts it apart. **Fix:** add to its bullet "— outside the four; "go" takes the recommended one". (c) In step 7, where his
answer is recorded is not named. **Fix:** in step 8's list, after "his answers", add "Low or Medium,".

### 13. LOW — `bug-check-order.md` §7.9, "A stand-in is believed only once it is calibrated": "is where this ends" is cryptic

The sentence can be read as saying a keyboard stand-in, once calibrated, may be trusted, which §7.11 lesson 7 rules out.
**Fix:** replace "§7.11 lesson 7 is where this ends for a motion the phone makes." with "For a motion the phone itself
makes, even a calibrated stand-in proves nothing (§7.11 lesson 7)."

### 14. LOW — `systematic-debugging/SKILL.md` Phase 4: two misses on a device vs step 4

Step 4 still says "If < 3: Return to Phase 1"; the device rule sits in step 5, which is reached only at three or more.
**Fix:** in step 4, after "If < 3: Return to Phase 1, re-analyze with new information", add " — on a device you cannot
run, two misses already stop you (step 5)".

### 15. LOW — `.claude/rules/decisions/how-we-work.md`: the short lines of D70 and D590 do not state D1414

D1414's own short line matches its full row (checked, D138). But D70's short line still says only "the 13 Oct 26
skill-notes review's by one fresh, blind Opus reader (D810)", with D1414 left in its tail. `record-decisions.md` says a
narrowed ruling's short line is rewritten to state the rule as it now stands.
**Fix (D70):** replace "the 13 Oct 26 skill-notes review's by one fresh, blind Opus reader (D810)" with "the 13 Oct 26 and
27 Oct 26 skill-notes reviews' by one fresh, blind Opus reader (D810, D1414)".

## Explicit negatives

**Check 1, fidelity.** I read every row citing OVN (573, 576, 594, 596, 620, 621, 643, 699, 715, 717, 718), SH (561, 563,
574, 599, 600, 615, 657, 714), DP (582, 618, 619, 631, 661, 672, 689), DEC (569, 670), TO (543, 670), WR (542, 544, 583)
and GD (569, 575, 600, 607, 644, 664, 680). I also read these 52 APPLY rows: WS 565 566 567 587 588 603 604 605 610 624
627 633 647 649 660 666 678 690 696 697 705 706; BCO 560 568 589 593 602 638 662 679 687 695 698 708 709 710; MOCK 584 606
612 614 617 642 646 659 663 665 667 673 674 676 677 682; SD 632 645 650 651 702 711 712; TDD 640 652 692 693; VBC 639 719;
BC 611 636; WGT 701; DOB 635; IMPV 578. Apart from findings 1–3, 5 and 8, each change says what its note meant, with its
conditions and dates. The merges (697/707/713, 711/712) are faithful. 599's "compare the pull request's head before merge
live" is not carried; it is minor, since the push read-back covers it.

**Check 2a, running the drafts on real notes.** 714: following the drafted handoff line would have named all six pull
requests. 587: the absence line would have waited out the 750ms. 621: it would have been avoided once finding 12a is fixed.
705: blocked by finding 5.

**Check 3, the writer's doubts.** §1a test 0: nothing counts §1a's tests from 1 ("test 1" twice means §1b's; every "§1a
test N" names 2, 4, 8, 9 or 11). The size trigger gates no work. No leakage into the generic skills. 623 is overtaken by
D1088 (one closing push on his word, nothing else before the merge) and D1407; nothing survives. 703 is a checkpoint
marker; closing is right.

**Check 6, closures.** Sound as REFLECTED: 561, 562, 563, 564, 570, 574, 594, 596, 608, 625, 629, 658, 669, 681, 686, 689,
700, 718 (but see 3b; 562's "assert the value handed on" half is weakly carried; 629 is memory-only, acceptable since
overnight runs only on this PC). FILED 586/590/616/630/634/644 is enough: the rule is already in `browser-checks.md`,
`walk-scripts.md` §1 and the gates guide; the missing guard is filed.

**Check 5, safeguards.** Of the 25 removed lines, all reappear extended. Only the 90% stop is weakened (finding 1).

**Check 8, commands, names and paths.** All exist or are right: the `DECISIONS.md` `git grep` (ran: D1414), `pic(…, {
around })`, an `ONLY=` filter (ten scripts), `LW_WIDE_LETTERS` (`e2e/leavewar.spec.ts`), `Input.synthesizeScrollGesture`,
`video-frames.mjs`, both scan tests, `RULING_BYTES`, `--move-rows` / `--dry-run`, `raptor:` plus `leavewar/rec:`,
`':(exclude)raptor-port/docs'`, and every section and lesson number cited.

**Check 7, doubling.** The stand-in lesson stands in `bug-check-order.md` §7.9, `writing-good-tests.md`, the debugging
guide and §7.11, each from a different angle; earned. The tests that scan source text appear in TDD (general) and the gates
guide (named files); earned.

**Check 10, memory notes and backlog additions.** They say what their notes meant. None is a repo rule that belongs in the
repo.

REVISE
