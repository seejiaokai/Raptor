# Skill review, 10 Nov 26 (chat 49) — every OPEN note's disposition

The log: `.claude/skill-observations/log.md` — 160 OPEN notes (120, 122 and 722 to 914, with gaps) once the 152 notes
resolved on 27 Oct 26 were archived to `archive/log-2026-11-10.md` (step 1 of the night). How this repo runs a review:
`.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo. Who reads these drafts: Astra and a fresh, blind Opus
reader, each blind to the other, before his approval (D70, D1761, D1770). Drafts sit beside this folder at the live
files' paths; the whole change set, live to draft, is `diff.patch`. **Nothing live is changed until he approves.**

**Sorted by five helpers, one after another** (Low, D1104), each by `_review/helper-brief.md`; their reports
`_review/report-<group>.md`; the groups `_review/groups.json`. Their tables are merged here by
`_install/check-dispositions.mjs --merge`, which checks every OPEN note appears exactly once.

**Codes** (read by the install script): `APPLY` a draft carries it · `REFLECTED` already written where it belongs (the
place named) · `FILED` a backlog item carries it (the item named; new items and additions in `_docs/OUTSTANDING-items.md`)
· `MEMORY` a memory note carries it (`_memory/additions.md`) · `ASK` recommend closing with no change — his word
(`_review/questions.md`) · `OPEN` stays open. APPLY, REFLECTED, FILED and MEMORY become `ACTIONED (<install date>) — …`;
ASK becomes `DECLINED (<install date>) — …` only if he agrees; OPEN is not touched.

**Short names:** BCO `raptor-port/docs/bug-check-order.md` · WS `raptor-port/docs/walk-scripts.md` · GD
`raptor-port/docs/gates-and-deploy.md` · DP `raptor-port/docs/design-practices.md`.

**Two extra jobs he selected the same night ("Go + word list")** ride in these drafts with no note number:
`[BUGCHECK-LESSON-ORDER]` (BCO §7.11 and the checklist) and `[MAIN-CHECKOUT-STALE]` step 2 (GD's main-checkout paragraph,
matched in the session-handoff guide); and his ruling D1443 lands in the overnight guide, as it said it would.

| Note | Code | Where it lands, or why |
|---|---|---|
| 120 | OPEN | D73 (23 Sep 26, full row read) rules the two notes stay OPEN, their status carrying its condition, so a job bringing a third app in as a tab finds them; closing them would set D73 aside |
| 122 | OPEN | the same as 120: D73 keeps it open as the second half of the same recipe |
| 722 | APPLY | `.claude/skills/task-observer/references/weekly-review.md` Delivering updated skills: "a draft is a diff against a moment" — the base recorded, the install refuses a changed live file; the rehearsal before the read was already there |
| 723 | APPLY | `.claude/skills/task-observer/references/weekly-review.md` Delivering updated skills: a file a script keeps rewriting is staged as its addition only, applied at install (the same change as 722) |
| 724 | APPLY | `.claude/skills/writing-plans/SKILL.md` Self-Review 10: a table of the questions a step waits on is a home of each answer; the D201 sweep's half filed as [RULE-FILE-LESSONS] (a) |
| 725 | APPLY | MOCK §Judging, new bullet "Reusing an older drawing or its script" (stand-ins replaced by the app's own markup; the probe-bridge example cut for size by the Opus reader's O12) and step 6's prefix line (`.r`) — one change with 737; his correction itself is already lesson 25 / D1180 |
| 726 | APPLY | `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 4: instrumentation taken out by an exact edit of its tagged lines, never a file restore; or commit first |
| 727 | REFLECTED | BCO §7.10 "Built to the drawing, from the first line" (D1424, as built and after every fix) and §7.11 lesson 8 (the same Approvals fix); BCO §7.0 names the drawing per surface |
| 728 | APPLY | WS §7 (a walk that pins the war's today but not the real clock: reproduce in a unit test with both pinned); its CSS part is already in the Leave War stylesheets' scoping comments (matrix.css head, approvals.css), its picture part in BCO §4 (D1271) |
| 729 | APPLY | WS §7 (a small mark said missing is looked at cropped and enlarged, or measured, before it is a finding or code is traced) |
| 730 | APPLY | BCO §7.10 drawing-check bullet: "Matches" needs its pair or its check's record, else "not compared" |
| 731 | APPLY | MOCK §The Method head paragraph, "His picture is part of the question" (name its device and width, answer on the same one) — one change with 800 |
| 732 | APPLY | `.claude/skills/overnight/SKILL.md` Part 1 step 1: a guide loaded from another folder is compared with this branch's copy, the branch's followed; the mechanism is already in gates-and-deploy "A worktree chat loads…" and the handoff guide's Step 3 |
| 733 | FILED | [RULE-FILE-LESSONS] (d), new in `_docs/OUTSTANDING-items.md`: the counting step belongs in plain-language.md's check before sending, a rule file not drafted here |
| 734 | FILED | [RULE-FILE-LESSONS] (c), new: blanket approvals recorded from the page version he answered, and the reader checks the line against it — DECISIONS.md's steps, not drafted here |
| 735 | APPLY | BCO §6 new row after the removal row (a removed, renamed or moved selector searched across the whole app, every test folder and the probes; tests checked not hollow); CL step 8 names it |
| 736 | REFLECTED | `.claude/hooks/script-guard.mjs` refusal 1 (live, read today; it refused this helper's own first script): a file-writing script typed into the shell holding a backslash |
| 737 | APPLY | MOCK §Judging, "Reusing an older drawing" bullet (each carried control checked against the controls built since; a duplicate put to him) — one change with 725 |
| 738 | APPLY | `.claude/skills/overnight/SKILL.md` Part 3, report item 1: a list written in the night is checked against a picture of the last build, closed items marked |
| 739 | APPLY | MOCK step 6 "From the picture to the build" (a computed place is a means of drawing; the note says where in words); its second-state half is already WS §10 "Bring the build to the drawing's own world" |
| 740 | APPLY | MOCK step 6 (drawn with the drawing check's recorder beside it, pointing at WS §10); the recorder and the replay proof are already WS §10 "Record the drawing when it is drawn" |
| 741 | APPLY | MOCK §Traps new bullet (a panel laid in at a measured place can cover live parts; assert no overlap), MOCK §Showing It (approved pictures kept as files), BCO §7.10 (look where the drawing meets the page before "back to the drawing") |
| 742 | APPLY | WS §10 "Name the parts" (a drawing's inline marker ring left out of the checks); the recorder stripping it rides [DRAW-MARK-HELPER] |
| 743 | APPLY | BCO §5 "Between fix rounds" (the type check, `npx tsc -b`, which writes no `dist`, beside the touched tests before each push — the Opus reader's O6); the handoff half is already in session-handoff Step 1 ("a gate that is red" is Unfinished) |
| 744 | APPLY | WS §7 (a note without a picture, or a fault seen in passing, is a lead: reproduced and read against the rulings before it is a finding; "to check", never "to file") — one change with 899 |
| 745 | FILED | TOOLS addition (h) in _docs/OUTSTANDING-items.md (refuse fresh=1 with savefail, and a reload on fresh=1 — met twice); WS §3 fixture line widened to scripts that reload or use ?savefail |
| 746 | APPLY | WS §10 "Name the parts" (a child coloured in the drawing named for colour, the column for place); its letters-at-open half is already BCO §7.2 "force them from the first paint … a style added after the page loads misses what the app measures as it loads" |
| 747 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: a next step naming a numbered piece of a plan is checked against the plan and its ruling's full row |
| 748 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: how a job ships is decided by its files against shipping's "only notes" list |
| 749 | APPLY | BCO §6 wording row (each old word alone, case ignored, no assertion shape around it, every test folder) |
| 750 | APPLY | WS §8 "The build before the change": prove which build supplies the "before" — the served bundle checked against the base commit; a check of the intended change fails on the base, a check of what must not change passes on both and identifies nothing (Astra's A7) |
| 751 | ASK | recommend closing: the background-command guard, tested tonight, lets the `/c/…` spelling through (unchanged since 26 Sep 26), so the refusal cannot be reproduced; question in `_review/questions.md` |
| 752 | APPLY | WS §4 new line "A clean-up step is a claim too" (a cancel is asserted, or ends on a no-op move) |
| 753 | APPLY | `.claude/skills/test-driven-development/SKILL.md` RED, the "flash or a jump" paragraph: a frame-sampled loop gets at least one frame per in-between position |
| 754 | APPLY | `.claude/skills/overnight/SKILL.md` Part 2, helper bullet: Auto-fix switched off right after each pull request opens; a relayed Vercel status comment needs no reply |
| 755 | APPLY | WS §4 "A negative assertion first asserts that its subject exists" sharpened (a clip, pin or hide check reads both sides; a pinch asserts its zoom changed) |
| 756 | APPLY | WS §8 "The build before the change" (archive the whole app folder but docs/, since the type check compiles tests that import scripts/, e2e/, probes/) — one change with 835 |
| 757 | REFLECTED | GD §Now, the code check's "Trap — the silent pass" (the script goes red unless React Doctor's own report says it compared) |
| 758 | APPLY | `.claude/skills/dispatching-parallel-agents/SKILL.md` When Agents Share the Working Tree: shared vocabulary decided before the fan-out; the junction command in `raptor-port/docs/gates-and-deploy.md` (four traps) |
| 759 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4: the template's Gates line names the run and its count, never a bare green; a removal runs its area's whole suite before green |
| 760 | APPLY | `raptor-port/docs/gates-and-deploy.md` (the push guard's `exec` line): one quoted string goes to Windows' shell, several commands go in a script; refusal filed as [CHECK-TOOLS-HARDEN] (i) |
| 761 | APPLY | MOCK step 1 (each staged record asserted on screen; "today" pictured for every role the change touches) |
| 762 | APPLY | `.claude/skills/overnight/SKILL.md` Part 2, helper bullet: how the coordinator waits on a background helper (turn ended, keep-awake on, silent re-armed timer, no polling); Auto-fix as 754 |
| 763 | APPLY | BCO §6 new row "A part the app draws in more than one COPY" (listed copy by copy from the running page; a moving value walked in each, judged on what is on top); CL step 8 names it |
| 764 | REFLECTED | memory note node-e-in-git-bash-mangles-escapes ("unconditionally: every edit script is written with the Write tool", 19 Oct 26) and the script guard's refusal 1 for the backslash case |
| 765 | APPLY | WS §7 (c) sharpened with the recipe: open his month by the admin's "Open for bidding" window, then the name badge (walkM) |
| 766 | REFLECTED | `.claude/hooks/script-guard.mjs` refusal 2: `sed -i` on a file git tracks is refused (M5 measured the line-ending rewrite) |
| 767 | FILED | [CHECK-TOOLS-HARDEN] (p), added: the inputs guard chooses its file list through its own comment-stripping `code()`; the TDD guide's "tests that scan source text (they read comments too)" already warns |
| 768 | APPLY | BCO §4 "Before a brief leaves", the EXPECTED-line bullet (an expectation that differs by surface is read from its own roll-call column) — one change with 897 |
| 769 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, release bullet: when this chat stays open, the new chat works the branch from its own (fast-forward, upstream set, explicit push) |
| 770 | APPLY | `.claude/skills/systematic-debugging/SKILL.md` Phase 3 step 3: how many passes an intermittent failure needs (8 at one in five proves little; 21 for 99%), and recording what the failing step did |
| 771 | APPLY | WS §5 "One run, one folder" (only an unfiltered run empties the folder; a filtered run writes its own sub-folder) — one change with 896 |
| 772 | APPLY | `raptor-port/docs/walk-scripts.md` §5 Pictures: reading his phone recordings frame by frame (Edge channel, file page, seek, element picture, contact sheets) |
| 773 | APPLY | MOCK §Judging new bullet "A question about FEEL" (a page he operates on his phone, real captures, the app's scroll rules, a switch per choice) — one change with 786 |
| 774 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, the Next-in-order bullet: its first line read before the commit, a merged RIGHT NOW line archived and replaced by a pointer to the backlog |
| 775 | APPLY | `.claude/skills/writing-plans/SKILL.md` Self-Review 8: findings filed more than a week or two ago re-checked on today's build first |
| 776 | APPLY | `.claude/skills/test-driven-development/writing-good-tests.md` Reach the state the way production does: a reload re-bases the change comparison; baseline put level in shared set-up; "fails only in the full file" was already in SKILL.md RED |
| 777 | APPLY | WS §1 "One served folder a round" (serve the frozen folder inside the test browser; every new walk library takes its build and picture folders from settings) |
| 778 | FILED | TOOLS addition (d) in _docs/OUTSTANDING-items.md (the code check prints React Doctor's own skip reasons and refuses a non-UTF-8 file); WS §2 gains the UTF-8 line, which closes [WALK-SCRIPT-UTF8] |
| 779 | APPLY | BCO §4 "What to do with what they hand back" step 1 (every app noun in a finding checked against the app's own list before it is repeated to him) |
| 780 | REFLECTED | BCO §5 "Before building any change, a fix included — does it add something he will see?" (D1625) and CL step 5; the note itself says so; no extra sizing line (one gate is enough) |
| 786 | APPLY | `raptor-port/docs/walk-scripts.md` §5, "An animation is checked frame by frame" (animations paused at fixed moments in WebKit and Chromium, a strip per engine; talon-claw-frames.mjs), moved whole there from MOCK's "A question about FEEL" bullet, which keeps a one-line pointer (the Opus reader's O12) — one change with 773 |
| 787 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: tracked changes not this chat's (the walks' untracked pictures are not another chat's), or another chat in the folder, means its own short-path worktree — a new job detached at origin/main, a continuing one on its branch itself — with one write there first, and a refusal stopped and told to him (the Opus reader's O1); with 831; memory one-checkout-per-session already holds it |
| 788 | APPLY | WS §5 new line "A response is timed from the press" (capture-phase pointerdown, performance.now in each frame; a whole animation cycle sampled) |
| 789 | APPLY | IMP §Known caveats new line "The design checker's settings are two copies here" (the fix built 8 Nov 26 — two byte-for-byte copies the document check keeps equal; hook-admin writes the copy of its folder) |
| 790 | APPLY | IMP §Known caveats new line "A read-only critique injects the detector itself" (no live server; the banner is not the page's fault) and the offline-detector line (a degraded empty list is not a clean bill) |
| 796 | APPLY | MOCK §Traps new bullet "Code sent into the page runs without its module" (self-contained evaluate; a shared kit tried once at both sizes; a card placed within its control's own window) |
| 797 | APPLY | BCO §6 new row "A part drawn inside another surface but owned by a different component" (the handlers of both pressed in the real browser); CL step 8 names it |
| 798 | APPLY | MOCK step 1 (a fault filed from reading code is reproduced for its "today" picture and the proposal sized by it) |
| 799 | REFLECTED | WS §5 "A script writes only under its own checkout … never a fixed name in the shell's $TEMP" and GD §Now "Six more" (1) (read only a results folder this run made, quote its start line) |
| 800 | APPLY | MOCK §The Method head paragraph (where his picture shows what the PC does not, find the differing input; his picture is "today", the proposal drawn as his device measures) — one change with 731 |
| 801 | REFLECTED | `.claude/hooks/script-guard.mjs`, built 8 Nov 26 after this note: refusal 1 covers the escaped apostrophe (a backslash); M4 measured the bare apostrophe working in bash 5.3 |
| 802 | APPLY | MOCK step 1 (a safety-net message reached through the nearest real refusal, only its words changed and named) |
| 803 | APPLY | `raptor-port/docs/gates-and-deploy.md`, the settle step: the clashed files from `git diff --name-only --diff-filter=U`, never a printout cut by tail; the check filed as [CHECK-TOOLS-HARDEN] (m) |
| 804 | APPLY | MOCK §Traps new bullet "Restyling a live element in place keeps what the app set on it" (clear it or re-run the app's placing); the case itself was settled by D1670 |
| 810 | APPLY | MOCK §Traps "A script that toggles styles…" (a CSS-only fix drawn in the real rule in place, found once) and the n-th visible line (the front window, not the first in the page's order) |
| 820 | APPLY | MOCK step 3 (a mark never sets position, display, size or overflow on its element; the box asserted unchanged) — one change with 848; the guard rides [DRAW-MARK-HELPER] |
| 821 | APPLY | MOCK §Judging "This works like the existing X" (a drawn event result asserted to fire for every case drawn) and session-handoff SKILL.md Rules 2 (a build note on an existing mechanism names its ruling or test, or says unchecked) |
| 822 | APPLY | MOCK §Traps first bullet (hide, never remove, a part the app drew; print the page's errors as they happen) and step 3's transform ("moves, hides or clones", was "removes") |
| 823 | APPLY | WS §4 new line "A control reported MISSING has had every door tried" (first whether the state draws it, then every route, each failed try pictured) |
| 830 | APPLY | MOCK §Judging "An existing component shown inside a mock is measured" (a colour read on the drawn part itself, never its container) |
| 831 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: the same clause as 787 |
| 832 | REFLECTED | DP §9 lesson 92 (D1700), the agent's reading: before a new mark is proposed it is set beside every mark already on its bar and page; §9 is read whole on every design job (ui-design.md, D941) |
| 833 | FILED | [CHECK-TOOLS-HARDEN] (q), added: a script listing every test that names a changed file, run before the first push (met twice); the drawing half in `raptor-port/docs/bug-check-order.md` §7, the drawing-check line |
| 834 | FILED | TOOLS addition (e) (one shared ink-based "letters fit" helper — the guide line was missed the day it was written); WS §5 ink line sharpened (letters hidden by design; box against box) |
| 835 | APPLY | WS §8 (the archive recipe for main beside a branch, vite build --outDir) and WS §5 "A close-up is made by its browser context" (pixel density set at creation) |
| 836 | APPLY | `raptor-port/docs/doc-budget.md` §3, new "Measuring what a chat reads": `docsize.mjs --reads` (the calibrated estimate), never a stock tokenizer; check one measured load first |
| 837 | REFLECTED | `raptor-port/docs/doc-budget.md` §4 "The rulings": a converted area's every live ruling cited on a statement, each change mark travelling with it, none citing a replaced one — the gate checks each (read today) |
| 838 | APPLY | `raptor-port/docs/bug-check-order.md` §4 "Never show either model": a blind reader of a commit that is not the head runs in an exported copy of it, the recipe moved to `raptor-port/docs/codex-guide.md` "Reading a commit that is not the branch head" (the Opus reader's size cut); the ready script is (g) |
| 839 | APPLY | `.claude/skills/writing-plans/SKILL.md` Task Right-Sizing (each session's slice and clean stop) and `.claude/skills/session-handoff/SKILL.md` Step 4 "acts on" list (Pick up here names the next slice) |
| 840 | FILED | [CHECK-TOOLS-HARDEN] (n), added: the backlog script's git wrapper still swallows errors with no output buffer (docsize's two were fixed 7 Nov 26); the rule for new scripts in the item |
| 841 | APPLY | `.claude/skills/receiving-code-review/SKILL.md` Two of a Kind Is a Family: a "decided from one source" finding is a family, a case per sibling state; the self-test's name filter filed as [CHECK-TOOLS-HARDEN] (o) |
| 842 | APPLY | `.claude/skills/task-observer/references/environments.md` §Recommended activation setup: a hook printing a longer text — the host's cap, control characters, the fallback, four test cases; the project's hook already does it |
| 843 | APPLY | `raptor-port/docs/doc-budget.md` §3, "A peek costs an area's whole load": a shell read and an edit script load nothing, the Read and Edit tools load the area — the peek only for a reference document or note whose area the job does not touch, never for source, tests or what that area's rulings govern (the Opus reader's O7) |
| 844 | APPLY | `.claude/skills/writing-plans/SKILL.md` Self-Review 4: a promised saving estimated from the parts one stated case must use under the plan's own safety condition |
| 845 | APPLY | `raptor-port/docs/bug-check-order.md` §4, after "What to do with what they hand back": a saved report's head copied from the brief, the run command and the run log |
| 846 | APPLY | `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", the sandbox bullet: every named file inside the reader's copy or the scratchpad, each path probed first |
| 847 | APPLY | `.claude/skills/overnight/SKILL.md` Part 2 (a session per job: each brief names the branch with the night's block) and `.claude/skills/session-handoff/SKILL.md` Step 4 (briefs name branch and commit), with 913 |
| 848 | FILED | new item [DRAW-MARK-HELPER] in _docs/OUTSTANDING-items.md (a shared marking helper refusing a clipped tag — met twice in one night); MOCK step 3 carries the line — one change with 820 |
| 849 | APPLY | WS §5 "A close-up is made by its browser context" (a protocol screenshot's clip is in page coordinates: add the scroll offset); the headless scroll-gesture half is already WS §4 (synthesizeScrollGesture, headless CDP finger) |
| 851 | APPLY | `raptor-port/docs/gates-and-deploy.md`, new trap after the new-area-file trap: loaded text is replaced by writing the new text first, then `--move` of the old |
| 852 | APPLY | BCO §4 "Never show either model the other's conclusions" sharpened (no copy or summary anywhere a reader can open, the handoff note included); `.claude/skills/overnight/SKILL.md` Part 2 matched: a reader's report waits in a scratch folder outside the checkout while another reader of the same job still reads (both readers' finding, A2 and O4) |
| 853 | APPLY | `.claude/skills/session-handoff/SKILL.md` Rules 2 (a time read from the clock or its commit, or the commit named instead) and `.claude/skills/overnight/SKILL.md` step 8 and Part 2's compaction note; with 873, 892 |
| 854 | APPLY | `raptor-port/docs/walk-scripts.md` §2 The walker's brief: a window that opens filtered names its opening view and the one showing the walk's own changes |
| 855 | APPLY | `raptor-port/docs/gates-and-deploy.md`, the intermittent-stop bullet: step times of recent runs read before a check is called hung |
| 856 | APPLY | BCO §7.4 (a press that moves the keys is walked with the key held as well as pressed once); the design guide's §2 keyboard half is left to group B |
| 857 | APPLY | `.claude/skills/overnight/SKILL.md` Part 2, the report bullet: each reader the block names ticked against the report before it is accepted |
| 858 | APPLY | MOCK §Judging new bullet "A change that takes or gives width" (drawn at the narrowest desktop width and about 1280, its narrowest column measured, the cost in the recommendation) |
| 859 | FILED | [RULE-FILE-LESSONS] (a), new: the D201 sweep searches every Markdown file by subject and names its search — record-decisions.md, not drafted here |
| 860 | FILED | [RULE-FILE-LESSONS] (b), new: a ruling changing one party's rule is rewritten clause by clause — DECISIONS.md's step 2, not drafted here |
| 861 | MEMORY | `_memory/additions.md`: new note side-chats-start-only-from-his-pc (the app opens a side chat only on a message he types at the PC; offer helpers in the same message) |
| 862 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4, the brief-for-another-chat bullet: rulings named by number and sections, the first area file loads its whole page, the side chat commits its block after its first change |
| 863 | APPLY | BCO §4 "Before a brief leaves", new bullet (a code reader's proof tests go in its scratch folder; staging while helpers work pointed to the dispatching guide's "Stage by explicit path" — the Opus reader's size cut) |
| 864 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4: the same change as 862; its other asks are done (the scheduler page converted, docsize --reads counts a small job) |
| 865 | FILED | [CHECK-TOOLS-HARDEN] (r), added: the Inputs list's browser tests open on every date (met twice); the TDD guide's premises line gains the date-windowed row |
| 866 | APPLY | WS §4 "A negative assertion first asserts that its subject exists" (the read calibrated on a state where it did happen; shown, never merely present; a press by position brings its target into view) |
| 870 | APPLY | WS §5 new line "What is on screen is counted on PAINTED frames" (never only the page's own frame log; the deciding frame named and opened) |
| 871 | APPLY | `.claude/skills/test-driven-development/SKILL.md` RED, the device-specific paragraph: a change behind a guard the test environment trips gets the sizes and features, and fails on the framework's warnings; GREEN: a new flag's every caller listed |
| 872 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, opening line: a chat number is a hint, checked against main's handoff before use |
| 873 | APPLY | `.claude/skills/session-handoff/SKILL.md` Rules 2 and `.claude/skills/overnight/SKILL.md`: the same change as 853 |
| 875 | APPLY | WS §10 new bullet "Reuse a drawing script's own measuring function, copied whole, for the measures it already covers" (the part list and every safeguard kept) and BCO §7.0's drawing-check line (saved figures help prepare the part list and record; they never replace the D1495 checks) — after the two reads: Astra's A1 taken (the Opus reader's O3 set aside), so the method he approved stays word for word and no question goes to him |
| 876 | APPLY | `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 2: a press during an animation re-run at slowed processor speeds, then pinned by a pace-free check (squared with the existing "slowing reproduces nothing" line for two driver actions) |
| 877 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: the app's safety check judges who typed his merge word, even where his standing word covers the chat (D1796); the chat he said it in merges, or the brief says it will need his word typed there and he is told now (the Opus reader's O5) |
| 878 | APPLY | `raptor-port/docs/bug-check-order.md` §4, "And the reader's half": a helper's check that builds is handed a commit, and its label checked before its result is quoted |
| 879 | APPLY | `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", a new bullet: a conformance read searches related sources by each claim's subject, not the document's name |
| 880 | APPLY | `.claude/skills/test-driven-development/SKILL.md` RED, "Proving an existing fix red": a committed fix's own diff taken back by `git apply -R`, checked, restored in a trap, one lock turn |
| 881 | FILED | [CHECK-TOOLS-HARDEN] (k), added in `_docs/OUTSTANDING-items.md`: the change-mark check reads every number after a change verb and runs once over every live row |
| 882 | FILED | TOOLS addition (f) (a unit check that flags a new text-width browser test with no pinned letters — the trap met twice); BCO §7.2 wider-letters line sharpened to say so |
| 883 | APPLY | BCO §6 new selectors row (what scrolls among the moved selectors; a carried thing held just inside each new edge) — one change with 735 |
| 884 | APPLY | WS §5 new line "A frame measure keeps every raw interval" (the display's refresh interval established and buckets reported around its multiples, the boundaries stated — 20 / 34.5 / 50 ms the recorded 60 Hz case only; a repeat; the suspect switched off for one comparison — Astra's A9) |
| 885 | APPLY | WS §2 (a script outside the project loads Playwright by createRequire, run from raptor-port/); its selector half is already WS §2 and §4 (controls from a passing run; press what the app routes) |
| 886 | APPLY | `raptor-port/docs/gates-and-deploy.md`, after the worktree-settings paragraph: a hook is not in force in the chat that adds it, how to prove it there, and a refusal's remedy measured per tool |
| 887 | APPLY | `raptor-port/docs/gates-and-deploy.md`, new "After a push" bullet (a clashing pull request starts no run); the guard filed as [CHECK-TOOLS-HARDEN] (j); memory stacked-pr-runs-no-checks holds it too |
| 888 | FILED | new item [READER-COMPACT-HANDOFF] in _docs/OUTSTANDING-items.md (the start hook pastes the handoff into a reader that compacts — a hook change); BCO §4 carries the stop-gap in the readers' brief |
| 889 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1: one notes branch per chat, merged once |
| 890 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 1, another chat's block: open pull requests that change the handoff listed first; leave blocks beside theirs or tell their chats |
| 891 | APPLY | `raptor-port/docs/gates-and-deploy.md`, the four by-hand traps' typecheck line: `npx tsc` with no packages runs an unrelated download; the overnight guide's step 9 already runs `npm ci` |
| 892 | APPLY | `.claude/skills/session-handoff/SKILL.md` Rules 2 and `.claude/skills/overnight/SKILL.md`: the same change as 853; the guard it asks for is answered by naming the commit instead of a time |
| 893 | APPLY | BCO §0a step 3 (a FULL check names its chats when its start plus what its area pages will load, measured by `docsize.mjs --reads`, leaves too little room for the walk; unattended, the night stays one chat and compacts at a clean point) and CL step 3 — after the two reads: no fixed 40% (the Opus reader's O8 taken, Astra's unattended clause added), so the writers' question on it is dropped |
| 894 | APPLY | WS §2 "Each helper gets its own scratch sub-folder…" sharpened (a file prefix of its own for every file it writes) |
| 895 | REFLECTED | the settle step `raptor-port/scripts/records-merge.mjs` settles HANDOFF.md block by block, its tests cover two new blocks and a closing line both sides added (gates-and-deploy, the settle step; shipping step 2) |
| 896 | APPLY | WS §5 "One run, one folder" (each attempt a fresh sub-folder, no picture number reused in it; the final run and its count named, earlier attempts labelled apart, every picture behind a finding kept, failed attempts never mixed into the cited run — Astra's A8) — one change with 771 |
| 897 | APPLY | BCO §4 "Before a brief leaves", the EXPECTED-line bullet (each names its source — a ruling, a contract line, main's control run, or two surfaces of the app that must agree — or is RECORD) — one change with 768 |
| 898 | FILED | TOOLS addition (g) (a ready script for a blind reader's clean copy: named paths, core.longpaths, BASE tag) |
| 899 | APPLY | WS §7 (a side note read against the rulings and reproduced before a handoff calls it "to file") — one change with 744 |
| 900 | FILED | [CHECK-TOOLS-HARDEN] (l), added: the backlog script warns before moving an item that is a ruling's last backlog mention |
| 901 | APPLY | `.claude/skills/receiving-code-review/SKILL.md` A Finding, Its Diagnosis, and Its Fix: two reviewers' diverging fixes settled by the project's conflict rule before the fixer starts |
| 902 | REFLECTED | WS §5 "Nothing a walk keeps goes under raptor-port/test-results/" (written 8 Nov 26 from this very loss; the note says so) |
| 903 | APPLY | WS §6 new line "A case the red-first test never turned red is proved by the walker's own steps" (old build must show it, fixed build must not) |
| 904 | APPLY | `.claude/skills/systematic-debugging/SKILL.md` Phase 1 step 3, the layout-shift bullet: measure across widths before slowing anything, and add the matching width to the test |
| 905 | APPLY | `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", the plan's-brief bullet: every file-shape claim broken with a named commit from its history |
| 906 | APPLY | BCO §8 item 4 (a test builds its own precondition and asserts it; a conditional skip is a finding; the break goes red at the assertion that matters) |
| 907 | APPLY | `.claude/skills/overnight/SKILL.md` Part 2, the report bullet: a helper paused on its own background work is stopped or awaited before the checkout changes; its log read after |
| 908 | APPLY | `raptor-port/docs/gates-and-deploy.md`, the docs-only bullet: a change to the document check's scripts runs its self-test on the PC before the push; a new rule gets cases |
| 909 | ASK | recommend closing: every area's rulings are a page since 9 Nov 26, so the conversion skill has nothing left to serve; its general lesson lands with 912; question in `_review/questions.md` |
| 910 | APPLY | `raptor-port/docs/gates-and-deploy.md`, C1's self-test line: 10 to 20 minutes, in the background with no `timeout`; exit 124 is the limit, not the script |
| 911 | APPLY | `raptor-port/docs/gates-and-deploy.md`, new "After a push" bullet: "Everything up-to-date" after new commits means a detached checkout; push HEAD by its full name; and its preventive half in `.claude/skills/dispatching-parallel-agents/SKILL.md` "When Agents Share the Working Tree": a helper that shares the checkout never moves it (the Opus reader's O10; the superpowers register's row too) |
| 912 | APPLY | `raptor-port/docs/gates-and-deploy.md`, the same new trap as 851: a change that switches on checks reaching other files is tried on the file first, then the file put back |
| 913 | APPLY | `.claude/skills/session-handoff/SKILL.md` Step 4, "acts on" list: a brief for a later chat names branch and commit, never a worktree folder; with 847 |
| 914 | APPLY | `raptor-port/docs/doc-budget.md` §"Keeping the list whole", the paths bullet: narrowing a file's `paths:` checked by its lines first, pointers added on the losing side as new lines |
