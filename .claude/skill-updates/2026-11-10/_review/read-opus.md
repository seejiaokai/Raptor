# The fresh, blind Opus reader's report — the skill-notes review of 10 Nov 26

Read at commit 0669d87a1 on the brief `reader-brief.md`. Saved by the coordinator as it came back (its transcript did not
keep it on disk): the verdict and the twelve findings with their replacement texts word for word; the reader's Notes
and sampled-rows list condensed for room, their substance kept.

**Verdict: REVISE.** Most of the 160 rows are faithful to their notes. Twelve findings need a change before install. Five
would make an agent do the wrong thing: 1, 2, 4, 5 and 6. The live files are unchanged since the drafts' base. No file
changed; helper scripts lived in `C:\Users\User\AppData\Local\Temp\blindreader-b\`; nothing under `Temp\claude\` and no
`read-*` file opened (one accident: `git worktree list` printed folder names under that area; none opened).

## Findings

**1. Session-handoff guide, Step 1, the opening line's own-folder clause (787, 831).** Passage: *"Every opening line
says: "if `git status` shows changes you did not make, or another chat works in this folder, run `git worktree add
--detach ../Raptor-<short> origin/main` (a continuing chat: its branch in place of `origin/main`; …) and work only
there""*. Against 787, 831, D975, the memory note one-checkout-per-session. Wrong three ways: (a) it fires on every chat
started in the main folder — `git status` counts untracked files; today the main folder holds 727 untracked walk
pictures (the new gates paragraph itself says it holds "the walks' untracked pictures"); (b) a continuing chat would lose
its commits — `--detach` with the branch name starts detached at the branch tip, commits on no branch (note 911's trap:
the push says "Everything up-to-date"); (c) the tools may refuse the work — a session started in a worktree has its writes
into another worktree refused (memory note, never route round it); whether a chat started in the main folder may write
into a second worktree is unproven (831 says only that the folder was made).
Replacement:
> Every opening line says: "if `git status --short --untracked-files=no` shows changes you did not make, or another chat works in this folder, do not switch branches here: a new job runs `git worktree add --detach ../Raptor-<short> origin/main`, a continuing one `git worktree add ../Raptor-<short> claude/<name>` (the branch itself, never detached, so its commits land on it) — a short path, never under a temp or scratchpad folder — and works only there; make one write there first, and if the file tools refuse it (a chat started in a worktree may not write into another), stop and tell him." The walks' untracked pictures are not another chat's changes. Two chats switching one folder put one chat's commit on the other's branch (3 and 5 Nov 26).

**2. Gates guide, "A worktree chat loads its settings…" ([MAIN-CHECKOUT-STALE] step 2), matched in the session-handoff
guide's "When that folder is not on `main`, or behind it".** Passage: *"only when its `status --short` shows no tracked
change, its `status -sb` no "ahead" and no other chat works in it, `switch main` if it is elsewhere and `merge --ff-only
origin/main`"*. Against 911 and the handoff guide's own release step (`git switch --detach`): `status -sb` shows no
"ahead" for a detached folder (`## HEAD (no branch)`) nor for a branch with no upstream; 911 met exactly that (three
commits on a detached checkout); every chat's last step leaves a folder detached, so the case is common; `switch main`
then leaves those commits reachable only through the reflog — the lost work the paragraph exists to prevent.
Replacement, in both files: replace *"its `status -sb` no "ahead""* with
> `git -C … log --oneline HEAD --not --remotes` prints nothing (no commit there that is not on GitHub — a detached folder's included)

**3. Bug-check order §7.0, the drawing-check line, and walk-scripts §10's new bullet (875; a writers' doubt).** Passage:
*"or, where the drawing script saved its own measured figures, is checked by that script's own measure"*; in
walk-scripts *"may be checked without a part list: the build is measured by that script's own measuring function…"*.
Against D1494 (the check measures *"where each part sits, its size, colour and text alignment — at his iPhone's and a
desktop's size"*) and D1495 (the guides' wording approved *"as drafted"*). In 875's own case the saved figures were line
heights, widths and what was cut — no colour, no text alignment, one state per option; so the alternative narrows the
check to whatever the drawing script recorded, and a surface could be called checked with colour and alignment never
compared. It also rewords text he approved as drafted; the report to him must name that.
Replacement for the walk-scripts bullet's first sentence:
> A drawing script that saved its own measured figures may stand in for a part list for the properties and sizes those figures cover: the build is measured by that script's own measuring function, copied whole, never rewritten, against the saved figures at the same 2px; what they do not cover of D1494's list — where each part sits, its size, colour and text alignment, at his iPhone's size and a desktop's — gets a part list for those parts, or is written "not compared".
In the bug-check order §7.0, after "by that script's own measure", add: "for what its figures cover (`docs/walk-scripts.md` §10)". In the report to him: "this narrows the drawing-check wording you approved on 29 Oct 26 (D1495) — your word needed".

**4. Overnight guide, Part 2, "A helper's report … is saved into the repo … the moment it arrives" (left beside 857 and
907), against bug-check order §4's new blindness sentence (852).** The drafted §4 sentence: *"nor any copy or summary of
them anywhere a reader can open … until every reader has reported, they stay in a scratch folder outside the checkout (8
Nov 26)"*; D1770 puts two readers on every job of a night. The two drafts contradict: under the overnight rule the first
reader's report enters the checkout while the second reader may still be reading — the 8 Nov 26 leak itself.
Replacement: after *"before anything is done about it"* add
> — except a reader's report while another reader of the same job is still reading: it waits in a scratch folder outside the checkout and enters the repo once every reader has reported (the bug-check order §4)

**5. Session-handoff guide, Step 4, *"His "merge live" does not travel in another chat's text … The chat he said it in
merges, or the block says the merge waits for his word typed in the chat that will make it."* (877).** Against D1093,
D1795, D1796: D1796 names chat 10, the very chat in 877, as allowed to merge on his word given in chat 3 — what was
refused was the app's safety check, not his permission; as a rule the line reads as though his standing cross-chat
permissions do not exist, so a chat following it would hold a merge he had allowed. The draft also drops the note's third
way: brief the side chat, and warn him he will be asked there once more.
Replacement:
> The app's safety check judges who typed the word: a merge made on his "merge live" quoted in a side session's brief was refused (8 Nov 26), even though his standing word covered that chat (D1796). So the chat he said it in merges; or the brief says the merge will need his word typed in the chat that makes it, and he is told now that he will be asked there once more.

**6. Bug-check order §5, "Between fix rounds" (743).** Passage: *"And run `npm run build` (the type check) beside the
touched tests before each push"*. Against shipping.md ("anything that builds … waits until the lock is free", D228), the
memory notes no-building-test-during-gate-run and tsc-noemit-is-hollow, and §4's "What each part of a check holds
still": `npm run build` rewrites `dist`; run on every push of a fix round it breaks another chat's gate run in flight, or
changes a build a walker in this checkout is served. The type check alone is `npx tsc -b` in `raptor-port/` (both
configs set `noEmit`; writes no `dist`).
Replacement:
> And run the type check — `npx tsc -b` in `raptor-port/` (it writes no `dist`; after `npm ci` in a fresh worktree) — beside the touched tests before each push: the unit runner does not type-check (29 Oct 26: …)

**7. Doc-budget §3, *"A peek costs an area's whole load: … for a few lines of a file whose area the job does not need,
use those"* (843; a writers' doubt).** Against doc-structure's *"Before planning or editing in an area, open its file
yourself"*, D68, D390: the condition is a judgement a builder can stretch — fixing one line of a scheduler source file
by an edit script would keep the scheduler rulings out of a chat editing the scheduler; 843's case was a reference
document edited for unrelated work.
Replacement for the last clause:
> … so for a few lines of a reference document or note whose area the job does not touch, use those — never for a file under `raptor-port/src`, `e2e` or the handpass scripts, and never to edit what that area's rulings govern (doc-structure.md: before planning or editing in an area, open its file yourself; D68).

**8. Bug-check order §0a step 3 and checklist step 3: "A FULL check whose chat starts past about 40% full … names its
chats" (893; a writers' doubt).** No clash with D868, D871, D874 (planning two chats is a handoff point chosen ahead,
which D874 allows); but one case (49% to 76%) became a fixed threshold, which is not the note's point ("Count what a job
will load by itself"): a check starting at 38% on a scheduler change would not split yet reach about 65% before its walk;
a Tracker-only check at 45% would split for nothing. The measure exists (the doc-budget line from 836).
Replacement in the order:
> A FULL check also names its chats when where its chat starts, plus what will load by itself as its files are opened (the area pages — `node raptor-port/scripts/docsize.mjs --reads`, by job), leaves too little room for the walk and the reads (8 Nov 26: 49% to 76% before the walk) — chat A the tier, sheet, roll-call, break tests and scenario brief, its report handed into the repo; chat B the walk, the reads and the fixes.
Replacement in the checklist:
> A FULL check names its chats too when its start plus what its area pages will load (`docsize.mjs --reads`) leaves too little room for the walk: A for …, B for ….

**9. `_docs/OUTSTANDING-items.md`: a [CHECK-TOOLS-HARDEN] letter clash (rows 778 and 745; the guides cite (f) and (l)).**
The live item already has *"Added 10 Nov 26 (chat 48, from chat 19's handoff block): (a) … (b) … (c) The two reads'
tidiness notes…"*; group A's addition starts again at (c) and anchors on "its 'Added 10 Nov 26' paragraph", of which
there will be two — two different (c) parts, ambiguous citations and install anchor.
Replacement: renumber the review's parts (c)–(q) as (d)–(r), and match: the bug-check order §4 "the ready script is
`[CHECK-TOOLS-HARDEN]` (f)" → **(g)**; the gates guide's settle step "[CHECK-TOOLS-HARDEN] (l)" → **(m)**; the letters in
rows 745, 760, 767, 778, 803, 833, 834, 840, 841, 865, 881, 882, 887, 898 and 900. Name the anchor "after the chat-48
paragraph's (c)".

**10. Note 911's preventive half is dropped** (row 911 drafts only "'Everything up-to-date' after new commits means a
detached checkout"). The note's second part — *"A helper's brief that says 'read only' also says 'never check out,
switch or detach'"* — is drafted nowhere and filed nowhere; a read-only helper sharing the checkout can still detach the
host's folder.
Replacement: add to `.claude/skills/dispatching-parallel-agents/SKILL.md`, "When Agents Share the Working Tree", after
"Stage by explicit path":
> - **A helper that shares the checkout never moves it:** its brief says no `checkout`, `switch`, `stash` or detach there — it reads by `git show <commit>:<path>` (9 Nov 26: the checkout went detached under the host while helpers worked, and three commits went off the branch).
Add the same to the superpowers register's `dispatching-parallel-agents` row.

**11. Checklist, the new lesson line 24.** Passage: *"Anything placed against the top bar, … named as a look for his
iPhone."* Lesson 24 in §7.11 has two halves, a walk and a test; the line keeps only the walk (every other line with a
test half keeps it — lessons 6 and 21).
Replacement:
> 24. Anything placed against the top bar, or measured on a scroll or a screen-size change: flicked to the page's very foot and back on a phone; a test stands the bar out of place for a moment and sends the screen-size change; what the PC cannot show (the bounce, the folding toolbar) named as a look for his iPhone.

**12. Size: cuts and merges.** Measured against the base: walk-scripts +27% (35,679 → 45,409 bytes), the mock-up guide
+49% (13,041 → 19,449), session-handoff +18%, overnight +11%, bug-check order +8%.
- Bug-check order §4, the proof-tests bullet (863): delete *"and while any helper works in the checkout the builder stages by named paths and reads `git show --stat HEAD` before pushing"*; replace with *"(staging while helpers work: the dispatching guide's "Stage by explicit path")"* — it restates that guide's rule and the one-checkout memory note.
- Bug-check order §4, the blindness paragraph (838): move the export recipe *"(`git archive <commit> -- . ':(exclude)<picture folders>'` … then `codex exec -C <copy> -s read-only`)"* to `raptor-port/docs/codex-guide.md`, or leave it to the ready script (f)/(g); keep the rule and a pointer (about 3 lines saved in a file read by section at every bug check).
- Overnight guide, the D1443 paragraph restates step 6's list word for word; shorten to:
  > Even then the first message lists the night's jobs as step 6 does, beside "Low or Medium?" (his D1443, D1104); the list does not hold the start: with no question open it goes straight to steps 8 and 9 without ending the turn, the recommended Low or Medium taken.
- Mock-up guide, the "A question about FEEL" bullet (10 lines): move its frame-by-frame half (the frame strip per engine, `getAnimations`) to walk-scripts §5 beside "His phone recordings are read frame by frame", leaving one line here: "an animation is checked frame by frame in WebKit and Chromium (`docs/walk-scripts.md` §5)".
- Mock-up guide, "Reusing an older drawing": cut the parenthetical example after "markup" to "(27 Oct 26: a hand-drawn puck where his ruling asked for his own)".

## Notes (condensed by the coordinator)
- The overnight D1443 paragraph is true to D1443's readings 1 and 2 and to D1104; "the recommended Low or Medium taken" is the agent's reading and could say so in four words.
- Overnight step 1 (732): the "compare the two copies" line cannot fire in the case it was written for (an older main-folder copy lacks it); the cure is [MAIN-CHECKOUT-STALE] step 2. Keep it, but it is not the guard.
- Overnight Part 2's "(10 Nov 26)" line about a helper's report file has no note behind it — tonight's own observation; no row carries it.
- 889's second half (bring `main` in just before the push, not before the local checks) and 890's "message each open chat" (drafted "or tell its chat") are narrowed — small; shipping's step 2 governs the first.
- [BUGCHECK-LESSON-ORDER]: by script, the moved lesson 7 (848 bytes), the second 23 (832 bytes) and lesson 24 are byte for byte as at the base; §7.11 runs 1–22, 23, 23, 24; the "---" before §9 stays; the cited number honoured. Fine.
- ASK rows: 751 — closing right (the guard's folder test, unchanged since 26 Sep 26, matches `/c/…/raptor-port`); 909 — closing right (all nine rulings files carry the page marker, the Leave War's since D1947). OPEN 120 and 122: D73 not opened.
- Stale-line rewrites of who reads what — each checked against its ruling and found **true**: the bug-check order §4 "How many…" (D903, D1770); "Who reads the finished code now" (D1734, D1743 answered by D1770, the window closed Mon 9 Nov 26 19:00 — the always-loaded how-we-work and bug-check still carry it, not this review's to change); the plan's brief (D1760, D1770); §4a item 2 and "WALK THE APP" (D590, D1734, D1770); overnight step 5 (D1770, D790, D903); overnight step 7 and the morning checklist (D761, D1770); overnight Part 2 (D1770, D1104); the superpowers and task-observer registers (D1761, D1770); "size tripwires (D14, D141)"; the gates guide "Done means live" (D1086, D1530). Older history-only lines in §4 are corrected by the italic line under them — acceptable.
- REFLECTED rows sampled, all hold: 727, 736, 757, 764, 766, 780, 799, 801, 832, 837, 895, 902. FILED items exist with new, unused IDs: [RULE-FILE-LESSONS] (a)–(d), [DRAW-MARK-HELPER], [READER-COMPACT-HANDOFF], [CHECK-TOOLS-HARDEN] (c)–(q) (the clash of finding 9).
- Running the drafts: (1) the opening-line clause fires on this main folder today (727 untracked files) — finding 1a; (2) the main-checkout recipe on this folder today is held back only by "no other chat works in it", correctly; the constructed case — 911's detached folder with three commits on no branch — passes every condition and is wrong (finding 2); (3) the EXPECTED-line rule (897) on the 8 Nov sched-marks walk brief turns S6, S7, S8, S25 ("the host's reading, not a ruling") into RECORD, so "the mark and the changes list agree" would no longer be PASS/FAIL — the writers may want "two surfaces of the app agree" counted as a source; (4) D1443 on the night of 27–28 Oct 26 matches readings 1 and 2; (5) 893's rule on chat 26's FULL check of [RD-LEFT-1108] (started 49%) fires and plans two chats, as happened; constructed: the same at 38% on a scheduler change does not fire and reaches about 65% before the walk (finding 8).

## Rows sampled
APPLY 82 (every drafted file covered), REFLECTED all 12, FILED 13 (733, 734, 745, 778, 833, 834, 848, 859, 860, 882, 888,
898, 900), ASK 751 and 909, OPEN 120 and 122 (not checked against D73).
