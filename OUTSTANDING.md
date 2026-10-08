# Outstanding & standby tasks

A running backlog of work deferred or placed on standby, so it can be picked up
in a future session. Companion to `HANDOFF.md`; this is the "not now, but don't
lose it" list.

**To resume:** read this file first, then the relevant design record (linked per
item).

> ## Maintaining this file — do this every time it's touched
> **The three D29 rules (owner, 22 Sep 26), enforced by `npm run docsize` in CI and a Stop hook:**
> 1. **Finished work LEAVES this file** for `OUTSTANDING-ARCHIVE.md` — moved whole, never deleted,
>    never summarised on the way, and ONLY by `node raptor-port/scripts/backlog-archive.mjs <ID>
>    --homes <file>`, which refuses what it cannot do exactly. (Supersedes "move the item to Done at the bottom".) **The test for
>    "finished" is never the heading's words** (they go stale — Fable F4): every fact a later session
>    would need must first have a pointer in a tier-2 doc or a code comment. Write the pointer, THEN
>    move the item.
> 2. **A ruling never lives only here.** It gets a D-number in its area's rulings file (`.claude/rules/decisions/`;
>    the map is `DECISIONS.md`) and a real home.
> 3. **Never trim this file inside a code change.** Over budget there is deferred; the trim is its
>    own docs-only pass.
> - **Item ids are UNIQUE.** A second heading for the same work gets its own id.
> - **A script edits this file's BYTES and never normalises its line endings** (pinned LF by
>   `.gitattributes`): a whole-file rewrite hides a destroyed item inside a diff nobody can read.
> - **Deferred again / changed** → update the item's status and note why, and
>   adjust its place in the priority list.
> - **Re-order the priority list whenever items change** — by *logical* order,
>   not habit: what's actionable now, what's blocked, dependencies, and effort
>   vs. risk. Call out any non-obvious ordering in one line.
> - **Before adding an item, verify it isn't already done** (check git log /
>   `main` / the code) — don't backlog completed work.
> - Keep it true, like `HANDOFF.md`. A stale backlog is worse than none.
> - Item **IDs are stable** (`[AMEND]`, `[OIL]`…); priority is a separate
>   ordered list that references them, so re-prioritising never renumbers items.
> - **Rich context → a committed context doc.** When a task carries reasoning worth
>   keeping (why a decision went that way, research, rejected options, mockup links),
>   capture it in a committed doc in the repo and link it from the item's **Context**
>   line — so the next session pulls the *thinking* out, not just the task title.
>   Don't leave the reasoning only in a chat; the chat is gone next session.

**Models:** Opus 5.5 plans and builds; Fable 5.1 and Astra review — never the model that wrote the thing (D67,
`.claude/rules/decisions/how-we-work.md`). *(The 7 Sep "Opus 4.8, default" line that stood here is archived.)*

## Priority — live items only (rewritten 24 Sep 26)

**Where this order comes from:** his own orders, each cited; where he has set none, the item's own "Place" line —
said as such, never dressed up as his. One line per item, in plain words; the detail is the item below. The old
list (13–23 Sep 26), its finished entries and the "In plain terms" block are in `OUTSTANDING-ARCHIVE.md`, moved
whole on 24 Sep 26. **Re-order this list whenever an item changes** (§Maintaining).

**Straight after the Inputs / SANS calendar job, as its own job (D662, 7 Oct 26 — ahead of the Tracker batch unless he says otherwise):** [GROUP-INPUT-ONE-ROW] — on the schedule a group input is ONE row holding everyone (D661); not built, and its rules are not yet asked.

**A test to steady, with the Tracker batch (found 7 Oct 26):** [TRK-DLG-FOCUS-UNSTEADY] — one Tracker unit test about the keyboard inside a question box failed once in a full run and passes alone.

**A question for him, found while building the phone's two lines (8 Oct 26):** [LW-HEAD-BIG-PHONE] — between 431 and about 700 wide (the largest iPhones are 440) the top of the Leave War is at its TALLEST; D679 keeps everything wider than a phone as it is. Should those screens get the phone's two lines?

**Soon, on his word (8 Oct 26), its own documents-only chat:** [SKILL-OBS-REVIEW] — review the skill-observation backlog (about 200 open, last reviewed 24 Sep 26).

**A test to steady, any time (found 8 Oct 26):** [LW-REQ-PICK-MONTH-UNSTEADY] — one Leave War browser test (the Required panel, phone size) failed once in a full run at its month-button step and passes alone and in the next whole run.

**Found by the calendar job's bug check (8 Oct 26) — after its merge, his to place:** [CAL-UNDO-OTHERS] (reproduce first), [CAL-TOGO-ONE-ITEM], [CAL-CHECK-SEEN] — small, none loses data or OIL.

**With step 5 of the calendar job, the Inputs calendar (found 8 Oct 26):** [INPUTS-LIST-NEXT-YEAR] — the Inputs list shows a next year's input among this year's dates, without its year, until it is edited (seen on the demo's 15 Feb 2027 OIL; the cause read in the code, to reproduce first).

**After the Inputs / SANS calendar job (its place is his to set):** [LW-WINDOWS-NONBLOCKING] — the Leave War's other windows still block the grid behind them and close on a click outside; D641 and D642 changed that for the calendar job's windows and for one war panel only. Its own job, its own check.

**From Claude's check of the Codex stack (5 Oct 26) — its place is his to set:** [OIL-WORK-START] — a flying line's earned leave is to
count from its entered in-time / Rally (D591), and a published weekend must keep the earned leave it went out with when a Logic value
changes (today it moves at once). **BUILT, FULL-checked and MERGED on his "merge live" — live since 7 Oct 26 (PR #484; D591, D592, D606); archived 7 Oct 26.** Low, beside it: [OIL-ZERO-SPAN-SORTIE] (words only); low-medium, older than it: [UNPUB-WARN-AL-RESTORES] (the Unpublish warning over-warns when an amendment is withdrawn); low, older than it, found by its browser test: [LOGIC-REDRAW-DROPS-TYPING] (the Logic page redraws its rules just after it opens, and a value being typed at that instant is dropped); low, words only, from its walks: [OIL-EARN-DAY-SWITCH-WORDS] (OIL Earn's "Nothing today earns" button reads like a status), [SC-B-CHANGE-SAYS-BRIEF] (the changes window calls an SC shift's in-time "brief"). **D606 (7 Oct 26 — an SC shift's typed in-time counts for OIL) was built and checked on the same branch.** **From his D607 (7 Oct 26 — a walk is sized per change by Opus, from a record of past walks), next, with [START-CONTEXT-AUDIT]:** *(both DONE 7 Oct 26 — D607, D608 — and archived:)* [WALK-LEDGER-HISTORY] (compile the past walks into the record and write its figures), [WALK-SIZING-GUIDE] (the checking guide's wording, read by Astra and Sol before he approves it). [INTIME-LINES-DRAG] (D593, his ask of
5 Oct 26 — drag a wave's In-time / Rally lines into order on the Scheduler Board, Auto sort too; proposed in the same batch). Low, from the same
check, each with the next change to its page: [INP-OIL-CHIP-PHONE] (the OIL chip over a phone request card's date), [BOARD-TIME-ESCAPE]
(Escape does not restore a time box on the board — a question for him). [EDIT-SECOND-CLICK] (low — after a
changed text box on Edit Schedule, the first click into another box lands on the page and a second is needed; the same on the live
app; with the next change to the schedule's text boxes). **The same check's three parked questions were answered on 6 Oct 26 (D597–D599) and built on the stack branch** — the items
are in `OUTSTANDING-ARCHIVE.md`; the sheet's §13 has the walk. Low, a question for him: [INSIGHTS-EMPTY-LINE-COUNT] (an uncrewed line counts as a sortie and a formation in Insights). Low, a question for him: [REQ-ROW-OWN-BOXES] (typing in a request's programme row changes the row, not the request). **From the four readers' second pass (6 Oct 26) — older than the stack or low, not fixed in the check:** [REST-BLANK-LINE] (MEDIUM — a man put on a flying line with no take-off loses his crew-rest check; **BUILT and FULL-checked 6 Oct 26 on `claude/rest-blank-line` (D602) — MERGED, live since 6 Oct 26 (PR #482)**; [OIL-WORK-START] (since built and live, 7 Oct 26 — archived) was NOT built with it — his instruction for that chat named the crew-rest fault alone — and stays next, its own job), **found by that check and filed, none of them this fix's doing: [BLANK-TIMES-ABSENCE] (MEDIUM — a man on all-day leave or a downchit seated on a line with no times gets no line in the warning list until a time is typed; answered YES, flag him at once — D605; **BUILT and FULL-checked 6 Oct 26 on `claude/blank-times-absence-picker-2cebae` — MERGED, live since 6 Oct 26 (PR #483)**), [SC-PICKER-INTIME-REST] (low–medium — the crew list does not warn of crew rest before a man is put on an SC seat whose typed in-time is early; from Sol's read of the fix; **BUILT with it, the same branch**), [SC-BLANK-SHIFT-QUAL] (low), [CREW-REST-MARK-COPIES] (low, a question for him), [BLANK-LINE-SANS-WORDS] (low — its absence sentences done with D605), [TAB-LAST-BOX-TEST-GAPS] (low, tests only)**, **found by the D605 check and filed, none of them its doing: [BLANK-STANDBY-STRIKE] (low — the crew list strikes a man on local leave for a standby seat whose shift times are blank), [BLANK-SEAT-ACTIVITY-HINT] (low — the crew list says nothing before a man with a whole-day course is put on a seat with no times; the list flags him after), [SC-SPARE-RING-BORROWS] (low — one man in a MAIN and a SPARE seat of one SC line: the spare puck wears the MAIN's leave ring), [REQ-ROW-SELF-CLASH] (low — times typed on an all-day request's own row flag its own man), [SC-INTIME-REST-WORDS] (low — the crew-rest sentence calls an SC line's in-time its "start"), [UPCHIT-MOVE-NO-REGROW] (low, a question for him — an Upchit moved later does not give back the days it cut), [OFT-ADD-TWICE-SILENT] (low), [LOOK-PENDING-COUNT] (low)**, then [START-CONTEXT-AUDIT] (what a new chat loads at its start, measured and cut to what a job needs, never at the cost of quality — D602; its first step, the tidy-up after the Codex stack went live, is done and archived; **MEASURED and its options written 7 Oct 26; HIS RULING D609 the same day — options 1 to 4 DONE on `claude/docs-tidy-7-oct` (the merged handoff blocks out, 28 spent rulings and 19 finished items to their archives, his memory notes pruned), 5 and 6 after Astra's and Sol's reads, 7 found nothing to do; option 8 NOT done — the scheduler's rulings stay whole (D611); left open in it: the check that stops it growing back, low**; with it [WALK-LEDGER-HISTORY] (DONE 7 Oct 26) and [WALK-SIZING-GUIDE] (DONE 7 Oct 26 — read by Astra and Sol, approved by him, D608, and in the guide)), [R3-OWED-READS] (both reads done 6 Oct 26 with the crew-rest fix's scenario read — it leaves at the next documents-only pass), (the two small Blue/Red fixes that stood here were built in the check's third round, 6 Oct 26, and archived; `[ROLE-NOT-CHOSEN]` was answered "leave it" — D603), [PEND-INTIME-WORDS], [BOARD-INTIME-JUMP], [WINDOWS-KEEP-KEYS]. Low, tests only: [SAVE-NOTE-TEST-GAPS] (two soft spots in the failed-save warning's browser test, from Astra's read of its last round).

**THE DATABASE COMES AT THE END (D473, 1 Oct 26 — replaces D354's "starts now", on the IT side's own advice):** the app's features
are built first; group A of `[DB-READINESS]` is built and its last phase (7) waits on his look; group B, the lock's screens and
`[DB-STEP]` wait for the end; the table list is kept up to date as each feature is added, and the table format is written on his
side for the IT side to enter. The paragraph below is as written while the step was "starting now"; its ORDER stands.
**THE DATABASE STEP STARTS NOW (D354, 29 Sep 26):** — and how it shares and locks, [DB-SYNC-MODEL] (D355, D356 — the mock-up and §9 DONE 29 Sep 26 on `claude/day-lock-mockup-data-model-493d27`, the red team running; his six screen questions open); for the IT team, the flow guide [IT-FLOW-GUIDE] is DONE (42 slides, `raptor-port/docs/it-flow-guide/`, merged on his "merge live" 29 Sep 26; archived). The IT team is taking the app into Dataverse now; the order below
stands, its timing ("about two months away", "about a month before") is overtaken — the readiness batch and the OIL
award fix are due before the tables are settled. What to finish before the hand-over: his answer to be recorded here.
**His order — to the database step (D203, 26 Sep 26; D173, D147 within it):**
1. **Done — [DRAFT-PENDING]**, the one changes window (D210), MERGED 28 Sep 26 (PR #451); its two follow-ups
   [HIST-PHONE-HIDE] and [CHG-BY-ITEM] (D339, D340, D345, D346) MERGED 28 Sep 26 (PR #455), and [LW-FIGSEL-FLAKE] (D342,
   PR #454) — all archived. Before it: **[ONE-DOOR]** (D309, D310, carrying [POST-IN-DATE], D308) MERGED 28 Sep 26 (PR #450;
   archived); `[POST-OUT-OUTCOMES]` (PR #446), `[ACCOUNTS-NEW-PERSON]` (PR #443), `[ACCOUNTS]` (PR #442) and
   **[LW-MOVE-STANDARD]** (D264–D266, PR #447) MERGED 27 Sep 26. Left from them: `[POST-OUT-TRACKER]`, on his answer.
2. **Now, beside the building — [IT-QUESTIONS]:** talk to the IT side (his, not code); their approvals take weeks.
3. **Development as normal — [HUMAN-RETEST]**'s remaining three, in HIS order (D147): the absence record TOGETHER with
   [S4-HUNT-REST] — **WALKED 26 Sep 26** on `claude/absence-record-d147-af6a50`; his answers to its questions (D260–D263)
   recorded, and D260–D262 BUILT and FULL-checked there 27 Sep 26 (D263 goes with [DRAFT-PENDING]); from his look, D264–D266
   (one look for the sheets, a Move on every record that can move) — [LW-MOVE-STANDARD], BUILT and MERGED 27 Sep 26
   (PR #447; archived) — then change-recording (with [UNDO-ROSTER-SETTINGS], D148 and [UNDO-TOPBAR] — MERGED
   29 Sep 26, PR #464; both archived),
   then the Leave War links LAST (with the 7 Sep phone check). Then "after the hunt" (21 Sep 26): [LW-LOCKMARK] →
   [LW-WEEKDAY-WORK] (talk to him before building any of it) — its first, the published day's unavailable list, was
   closed by the same re-test (built by [LEAVE-LATE-PUBLISHED]; archived).
4. **Split in two (D453, 29 Sep 26 — narrows D203's "ONE batch"):** **[DB-READINESS] group A** (what decides the tables'
   shape) BEFORE IT settles its tables, with the small OIL follow-ups below and [OIL-EARNED-VS-GRANTED] (D147);
   **group B** (tuned against the real database) AFTER the app is connected. First, [DB-SYNC-MODEL]'s design fixed.
   ([OIL-AWARD-IS-A-GRANT] is DONE, merged 29 Sep 26.) Group A: plan v4 final (30 Sep 26); **phases 0–5 and 5b built
   30 Sep 26** on `claude/db-readiness-table-shaping-4094f6` (plan §9); **its FULL check done 30 Sep 26** (the walk and both
   reviewers' code reads, every finding fixed — `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`); **phase 6 (a),
   (b), (d) built and FULL-checked 30 Sep 26** (`raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`); **phase 6 (c) v3
   (the holder base) planned, red-teamed (round 3, the last), BUILT and FULL-checked 1 Oct 26 on
   `claude/db-readiness-p6c-holder-base`** (D467 — `raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md`; the walk and
   both final reads found twelve defects, all fixed red first, one of them money; his answer on a moved request's extras:
   leave it, D468);
   **phases 0–6 MERGED 1 Oct 26 on his "merge live" (PR #476); phase 7 — the small OIL follow-ups below — BUILT and FULL-checked
   1 Oct 26 on `claude/db-readiness-p7-oil-followups`** (plan and build log
   `raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`; evidence `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`) — **MERGED 1 Oct 26 on his
   "merge live" (PR #477). Group A is closed.**
5. **At the END, once the features are built (D473, 1 Oct 26) — [DB-STEP]:** the table format written on his side (with his AI)
   for the IT side to enter, then the one adapter to those tables; the stack
   ([ARCH-STACK]) resumes there, with its step 6 still to come; the [AMEND] work is queued behind it. Architecture first,
   then the individual bugs (D144).
6. **Before ANY collaborator is added** — an event, not a slot: take the checks runner off this repo (SEC-101, in
   [REPO-PRIVATE]); and make the repo private again once the public period (D106) ends — his. IT's clone is such an event
   ([RESTRICTED-ENV-WORKFLOW]'s go-ahead), and so is [REPO-TIDY]'s screenshot move (the clear of the old worktrees any time).

**The small OIL follow-ups — ONE batch, with the OIL award fix, before the tables are settled (D147, D203, D354): BUILT 1 Oct 26 as
`[DB-READINESS]` phase 7, all six archived** — [OIL-READ-LEFTOVERS] (its items 1, 2, 4), [STORE-READER-SWEEP], [OIL-REQ-NAMEBOX]
(answered D470 — a man in the name box of another man's request earns), [OIL-WORDS], [OIL-PERSONAL-PLACEHOLDER], [CROWD-SIM-BRIEF];
evidence `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`. MERGED 1 Oct 26 (PR #477). ([OIL-RELINK-XWEEK] closed 1 Oct 26 by `[DB-READINESS]` phase 6 (c).)

**BUILT, FULL-checked and MERGED 1 Oct 26 (PR #478; archived):** [WARN-HIDE-KEPT] — a hidden warning stays hidden for everyone until unhidden, flags no puck, is not counted, and its line stays in the list struck out (D469, D471, D472, D475); the evidence: `raptor-port/docs/handpass/2026-10-01-warn-hide-check.md`. Out of the check, all answered the same evening: Insights counts each day's latest published version ([INSIGHTS-WHICH-COPY], D477, D478 — the next build), the drop's amber note stays (D479), and one Sonnet walker goes on trial on the next walk ([SONNET-WALKER-TRIAL], D476).

**Placed by their own lines — not his rulings:** from the `[DB-READINESS]` phase 7 walk (1 Oct 26), none of them this batch's — low, each with the next change there: [COUNT-CHIP-PHONE-TAP] (fixed for Chromium in phase 7; his iPhone look left), [INP-TILL-STALE] (a remark keeps a "till" date its request no longer reaches — new data), [OIL-INERT-TAP-SILENT], [OG-TAG-OVER-COUNT], [MEMBER-EDITPAGE-CHECK] (a check, not a known fault); from the group-A FULL walk (30 Sep 26) — with group B:
[UNDO-PUBLISH-ERASES-ISSUANCE], [TRK-IMPORT-ONE-GROUP], [TRK-FIRST-ORDER-PLACE] (low); low, with the next change there:
[TRK-UNDO-WRITES-DEFAULTS], [SECDEFAULT-OFFER-BEHIND-BOARD], [BLOCK-NO-HISTORY-LINE], [ACCOUNTS-SEED-FIRST-WRITE] (demo
only), [SETTINGS-LIST-ROWS] (a stage-2 split, only if it bites), [LW-OIL-DATECHIP-HIDDEN], [READONLY-WEEK-WORDS];
before the first real deployment: [SHARED-OPENS-DEMO-WEEK]; a question for him: [LW-LABEL-NO-DOOR]; with group B:
[ELOG-LINE-AFTER-COMMAND] (low); the Leave War — [LW-FROZEN-BAR-GAP] (after [HUMAN-RETEST]; show him
first), [LW-SCRUBBER-FLAKY] (test-only),
[PO-RESTORE-POSTING] (low, from its final code read), [LW-OFFER-ONLY-TAKEABLE] (low, with [LW-LOCKMARK]), [LW-HARNESS-VIEWER-PIN] (test-only, low), [CI-FAIL-PICTURES] (his call, low), [IMPECCABLE-UPDATE] (D625 — to v4.1.3, after the calendar job), [STACK-LEFTOVERS] (low — four small loose ends named in the Codex stack's archived items), [WALK-COST] (a proposal, his word starts it — measure where a walker's tokens go on the next fanned-out walk, then a library of ready walk steps), [SANS-CALENDAR-WIP] (**NEXT — called back 7 Oct 26, D614**; it was on hold, his to call back — the SANS availability calendar's new layout, on its own Codex branch; nothing of it is deleted, D610), [LW-DOZE-GUARDS] (low, check first); the shell — [SHELL-SIDEWAYS-BAR] (low, with the next top-bar change), [SAVE-NOTE-COVERS] (BUILT 5 Oct 26 on `codex/save-note-controls` — MERGED with the Codex stack, live since 6 Oct 26, PR #481), [FLOATWIN-TWO-LINE-BAR] (low, with the next change to either movable window), [GUEST-SAVE-WARNING] (low — a check first, with the next change to the guest's pages), [EVIDENCE-RECORD-SIZE] (low, his call — at Claude's review of the Codex branches), [TRK-SAVE-FAIL-SAYS-SAVED] (low, with [DB-READINESS]), [TRK-ASYNC-STALE] (with [DB-READINESS]), [LW-WINDOW-PRUNE-FLAKE-2] (test-only, low); the Tracker — [TRK-REMOUNT-LANDING] (low, with the next Tracker change), [TRK-KEY-NAME-CLIP] (low, with the next Tracker change). The Tracker — [TRK-PINCH-ASK] (his next Tracker session), [TRK-FLEXBAR-INK] (a question for him, on the Tracker-palette
look card — D157, merged PR #441).
The amendment area — PR #434, #435, #437 and #438 MERGED (25–26 Sep 26); left (the small-fixes batch, PR #463, merged 29 Sep 26, filed): [PLAN-BANNER-DOOR] (low, filed by that batch's walk), [ROW-NO-TIME-MARK] (low, a future job, D361), [APP-FONTS-NOT-LOADED] (his call — found 29 Sep 26; every measured width rides on it), [GATELOCK-STALE-LIVE] (low, the check lock's stale rule), [DOCSIZE-MERGE-CEILING] (low, a false alarm of the document check on a merge), [PDF-PRINT-TWICE] (low, found by the IT flow guide research — to confirm in real Chrome), [LW-SEL-HALF-LABELS] (low, the drag sheet's half-day labels — D264), [ITFLOW-OIL-RESHOOT] (low, on his word — D403), [TRK-REFUSALS-UNTESTED] (low, test gaps the guide research found). Left from the amendment batch (D91–D111, merged): [AMEND-SMALL-SEEN] (any time). The docs and the checks — [DEPLOY-DOCS] (its operational half), [DOC-POINTERS-CODE] and
[RULINGS-LF-PIN] (with the next code change), [PEEK-ISSUED] (a question for him, low), [RULING-HOME-HOOK] (low), [GUIDE-MAP-ROWS] (low, a question for him), [DOCS-SIZE-PASS] (DONE 2 Oct 26; archived), [INSIGHTS-WHICH-COPY] (D477, D478 — MERGED 1 Oct 26, PR #479; archived), [WORKSPAN-NEGATIVE] (DONE — live 6 Oct 26 with the Codex stack, archived; as filed: **NEXT — the next chat, D483**; the second Sonnet-walker trial rides on its walk), [SONNET-WALKER-TRIAL] (DONE — both trials ran and were decided under D595, archived; as filed: the first walked 1 Oct 26; **ONE MORE, on a build with known defects — D480**, with `[WORKSPAN-NEGATIVE]`'s walk), [INSIGHTS-BOARD-DOOR] (DONE — built, live 6 Oct 26, archived; as filed: RULED D481 — to build: a picture first; after `[WORKSPAN-NEGATIVE]`), [INSIGHTS-RULE-CHANGE] (ANSWERED D482 — closed; archived) — [DOC-SUBHEADS], [RULING-HOMES-AUDIT]
and [HANDOFF-SHAPE-GUARD] done on `claude/docs-tidy-subheads-audit-ec8f87` (28 Sep 26; archived),
Roles — [QUALS-MEMBER-SCOPE] (folded into [ACCOUNTS], D200), and beside it [QUALS-PROTO-TOAST] (low, one line of words).
The five-flags batch (built on `claude/five-flags-batch-build-ef7d85`, 26 Sep 26; FULL-checked and its PR from `claude/five-flags-batch-continue-2cfa70`, 27 Sep 26 — its five items archived) — his answers D270–D275 BUILT and FULL-checked on that branch, 27 Sep 26 (their three items archived); his look card's four questions answered 27 Sep 26 (D276–D279, nothing to build);
[ARROW-GUTTER-STRIP] (its strip moot by D275; one small leftover, low); low: [GHOST-FLAG-SHADOW], [LW-SETTINGS-SMALL],
[ALLAVAIL-OPEN-ROW] (investigate first), [VH-SHEETS-IPHONE] (low — other pop-ups sized by `vh`, his D536 find fixed for the windows), [MODAL-DRAG-CLOSE] (DONE — live 6 Oct 26, archived; his report — a window closes when text is drag-selected and let go outside it; FIXED on the Insights branch, D538, awaiting the reads).
Insights — [INSIGHTS-MISSION-MIX] (DONE — live 6 Oct 26 with the Codex stack, archived; what it left open is [STACK-LEFTOVERS]; as filed: D512–D532 settled; built on the isolated branch, qualified FULL checks complete,
fresh independent Astra R2 PASS; Opus interim code read (D533) found three small findings, fixed by Opus the same day (D534, D535);
Claude's later read owed before main), with [INSIGHTS-BOARD-DOOR].
The changes window — [HIST-PER-PAGE] (an idea, filed D349; a mock-up first, after the change-recording re-test). The
phone — [PHONE-DISCARD-MARKS] (MOOT under D488; archived 2 Oct 26 with the Codex build), [PHONE-WIDE-BOARD-BLANK] (medium, from the same walk). The bubble — [BUBBLE-SMALL-SEEN] (low, from the same walk).

**His word, D488; order narrowed by D495 (2 Oct 26):** [DISCARD-MARKS-REMOVE] — DONE, live 6 Oct 26, archived; as filed: BUILT on `codex/discard-marks-remove`; FULL checks and independent Astra inspection passed. Claude's Monday further reads and owner look remain owed before main.

**From the article he sent — his word, D486 (2 Oct 26):** [CODE-TIDY-AUDIT] (Astra's read can run before the reset, D484; the report to him; before [DB-STEP]) and [SKILL-FUSION] (after the reset, a fresh chat on its own branch; three proposals in it wait on his yes or no). **D491 (3 Oct 26):** Astra's tidiness read and its draft of [WORD-LIST] run BEFORE the reset; three pieces of `mattpocock/skills` ride with [SKILL-FUSION]. **D493 (2 Oct 26):** the tidiness read is answered — three tidy-ups approved, each with its area's batch: [LW-ROWS-SPLIT] (the next Leave War batch), [CSS-SPLIT-BY-SCREEN] (DONE — live 6 Oct 26, archived; it was the first step of the workflow UI pass), [TRK-FILE-TRANSFER-SPLIT] (the Tracker batch); two not now (in [CODE-TIDY-AUDIT]).

**IN HAND (7 Oct 26): the Inputs calendar and the SANS availability calendar — called back (D614), Opus 5.5 builds from here (D615), on `claude/inputs-sans-calendar`; where it stands: [SANS-COMMITMENT-CALENDAR] and that branch's block in `HANDOFF.md`.** **Historical build authority — D580, put ON HOLD by D585 (5 Oct 26), the hold ended by D614:** [SANS-COMMITMENT-CALENDAR] is authorized to build from delegated recommendations while the owner sleeps; includes Member Inputs calendar and secondary List. Initial D569 scope: monthly SANS demand/shortage calendar, shared day commitments and existing Custom timing form with no Remarks placeholder. Caps/ops new-chat handoff remains cancelled D568; no new chat created. Caps/ops, other Inputs work and Tracker remain outstanding. Earlier builds/every owed read unchanged; agent settles product choices with reasons and pictures before source work; independent review/required checks and Claude before main remain.
**The feature batches — HIS ORDER, D495 (2 Oct 26); Astra plans/reviews, Sol 6.1 builds in Codex until the reset (D496), Claude reviews after it (D494):** *(7 Oct 26: the first four — Discard marks, the work-hours fix, Insights, the workflow UI pass — are built and live (PR #481) and archived; next in this order is Inputs: the Inputs calendar and the SANS availability calendar, called back on 7 Oct 26 and in hand (D614, D615) — [SANS-CALENDAR-WIP], [SANS-COMMITMENT-CALENDAR].)* [DISCARD-MARKS-REMOVE] (the small first job) → [WORKSPAN-NEGATIVE] → Insights ([INSIGHTS-MISSION-MIX], with [INSIGHTS-BOARD-DOOR]) → the workflow UI pass ([CSS-SPLIT-BY-SCREEN] first) → Inputs → the Tracker (with [TRK-FILE-TRANSFER-SPLIT]) → caps and ops limits → one whole-app check — the list: [FEATURE-WISHLIST].
**Timing follow-up:** [REST-FIRST-CREW-HINT] — existing empty-formation predictive-rest gap, filed with caps and ops limits; committed placement still validates. Current Rally evidence declares this limitation; no owner approval inferred.
**Availability follow-up:** [SANS-PREVIOUS-REPORT-OFFER] — previous-date offers are not combined with target-date half-days for a previous-evening report; characterized in this round's actual picker/placement, with caps and ops limits. No new availability policy or owner waiver inferred.
**Workflow UI follow-up:** [PALETTE-WRAPPED-HEADER] — inherited sticky-palette overlap under a wrapped desktop account bar; with the UI pass after [CSS-SPLIT-BY-SCREEN]. Current Rally and baseline reproduce it; not dismissed as a helper-only failure.
**Owner's current workflow UI requests — collection complete, build authorized D563 (4 Oct 26):** [TRK-FLIGHT-LABEL-READABILITY] — clearer words inside blue flight balls, wider wing label area proposed; [LOGIC-STICKY-SEARCH-COMPACT] — keep search visible while scrolling and pack existing controls into fewer rows; [INSIGHTS-CLOSE-STAYS-VISIBLE] — keep the close cross at the top while scrolling Insights. Built on codex/workflow-ui after numbered candidates and independent plan challenge; combined first-build checks passed; D564 rejects the first flight shape, D565 steers to a tapered leading edge via his annotation. Specific tapered redraw with native sizes accepted D566; finish checks and fresh inspection of implemented chosen replacement, affected checks/fresh final read/current preview next. Logic/Insights retained. This does not start the Tracker progress-graph batch or change D495's order.

**Waiting on him — no order exists:**
[LOAD-MSG-SHORT] (a question for him, low — the long line after "Load onto working copy"),
[OIL-EARNED-VS-GRANTED] (ANSWERED D400 and built with the award fix — merged, PR #469, 29 Sep 26; archived 2 Oct 26),
[LEDGER-READ-ASK] (a question for him, from the OIL award build), [LW-COMMIT-MANNING] (his call), [LEAVE-YEAR] ("we will do this next time", 19 Sep — no slot since),
[REPO-PRIVATE]'s sharing half, [EOD] (design first; no slot
ruled), [CRP-FLAG]'s remainder and then [FLAG-EXPORT], the [AMEND] leftovers, [ADMIN-DISPLAY] ("next time we revisit",
D161), with [USER-GUIDE] (wanted, not urgent) and [PERF-RESIDUALS] (two of them change wording
or feel — his call).

**Future milestones:** [DB-STEP] (item 5 above, with [TRK-DISK] inside it, and [RESTRICTED-ENV-WORKFLOW] — the stand-in database and the pull-request workflow — before the first deploy he approves), [XFER], [RECALL], [TRK-ATTEMPTS] (low urgency).

---

## Items

### [AMEND] Amendment engine redesign — CORE BUILDING (decisions resolved)
**STATUS 24 Sep 26 (the spring clean, from Fable's read of the code):** the core is BUILT and merged — per-day
numbering, AM-01 version ids (`engine/verid.ts`), AM-06 signatures bound to content, Phase 2 (the reopen control
gone). AM-02's migration was dropped on his word (14 Sep 26: reset, don't migrate). **Left:** AM-04 (frozen
availability in the canonical content — `publish.ts` says it is not done), the publish-entry validation matrix,
AM-09 (durable write/lease). *(Corrected 24 Sep 26 by the amendment re-test: PSF-001 — a filing-only change
publishing on stale signatures — is NOT open: he answered it 15 Sep 26, "close it now", and it is built; register
AM14 in `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`.)* The
heading and the lines below about "building on `claude/amendment-engine-core`" and "Opus 4.8" are history.
Rebuild the publish/amend/version model: per-day isolated numbering (never
week-wide), published = immutable, every change a new AL, supersede-never-retract,
undo cannot cross a publish, load-old-version → republish-as-next-AL as the safe
recovery path. *(Superseded in part 18 Sep 26, marked 24 Sep 26 per D90: undo of a published day = UNPUBLISH it;
a quiet correction republishes under the SAME label; every issuance is still kept, never erased — register
AM32–AM37c.)*
- **Decisions RESOLVED (owner, 12 Sep 26):** plans SURVIVE as backups; ALL FOUR roles
  re-sign every amendment; crew SEE the live draft (issued stays authority). OIL for
  this build = latest AL/Original per day, per-day, read-failure protection (the
  worked-day lock stays **[OIL]**). *(Superseded 24 Sep 26 by D142 (his ruling of 20 Sep 26): a day's OIL comes
  from its latest published version — the latest amendment, or the EOD if that is the latest — however old the
  day; no lock, no clock. `[OIL]` is archived.)*
- **Reviewed:** the design brief was re-frozen (Rev 3) and re-reviewed by BOTH providers
  (converged), then Rev 4 owner additions (EOD, OIL simplification, plan names) got a
  further Astra/Codex red-team → Rev 5. Plan naming passed clean; the EOD findings
  (REV5-01…05) are why EOD is split out (see **[EOD]**).
- **Must-build (still in scope):** AM-01 date-qualified version IDs; AM-02 versioned
  saved-week migration (incl. Leave War's direct reads); AM-04 what a published version
  captures; AM-06 signatures bound to content; AM-09 durable write/lease.
- **Now:** building the CORE test-first on `claude/amendment-engine-core`, phase by
  phase; full gates per phase; **no merge without "merge live"**; fresh Codex inspection
  of the final code.
- **Model:** build on Opus 4.8 (high); final code inspection on Codex; Fable reserved
  for a single high-stakes finding.
- **Context & records (read to resume):** the build plan
  `raptor-port/docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md` (phases +
  proofs), the frozen spec `…-amendment-core-build-brief.md`, the decisions doc
  `…-2026-09-11-amendment-model-decisions.md` (rationale, mockups §10), and the review
  log `…-amendment-rev4-rev5-review-log.md`.

### [EOD] End-of-Day "record actuals" — DEFERRED (design follow-on, after [AMEND] core)
The end-of-day actuals record: a distinct end-of-day publish that captures what actually
flew (scrubs, deviations), labelled EOD, with **no four-role sign-off** — just "recorded
by X". Owner designed it 12 Sep; split out of the core build because an unsigned publish
path in a clock-free app needs its own design cycle. Astra/Codex REV5 findings to resolve:
- **REV5-01** the "day is closed" boundary is scheduler-asserted with no eligibility rule
  → a future day could be closed+EOD'd to publish an unsigned plan change; the app has no
  clock (`weeknav.ts TODAY` fixed). Needs a real "day is done" mechanism or a narrowed,
  documented trust guarantee (EOD is never the forward-plan authority).
- **REV5-04** "worked" ≠ "marked closed": a worked-as-planned day gets no EOD and stays
  unclosed, so a later AL can still strip its OIL; legacy worked days too. Needs a
  no-content-change closure path + treatment of unclosed/legacy worked dates. *(Superseded in part 24 Sep 26 by
  D142: a later published version that takes a man off a past day DOES take that day's OIL — he confirmed it —
  so "a later AL can still strip its OIL" is the rule, not the defect. What may remain is the closure path itself.)*
- **REV5-02** a late OIL acknowledgement (`reviseOil`→`row.oil`, no publication gate) has
  no defined transition into an immutable/closed day.
- **REV5-03** pick ONE correction transition (corrections are EOD-kind, not signed AL).
- **REV5-05** closing a day doesn't freeze holiday eligibility (`setDayEvent` removing a
  PH → `runOilPass` deletes the credit, no closed-day guard); freeze the non-working basis.
- **Design record:** the EOD design is preserved in §3b of `…-amendment-core-build-brief.md`;
  findings + dispositions in the review log. **Model:** design-first, red-team both
  providers again before building; then Opus build + Codex inspection.

### [ARCH-STACK] The architectural root-cause stack — the backbone (both providers, 13 Sep 26)
**STEP 1A DONE + LIVE (13 Sep 26, PR #396):** stable ids on the scheduler side — input filing by
`iid` (`[INP-CSID]` done), day notes as `{rid,t}` objects, coordinated storage-format reset;
plus a history-ordering determinism fix and a cross-week accepted-input edit/delete guard. Both
providers inspected the built code; all findings fixed. Remaining in step 1: **1B** (`[TRK-CSID]`,
Tracker ids — split 13 Sep 26: **1B-i COURSE ids DONE + LIVE**; **1B-ii SYLLABUS ids DONE + LIVE**
(14 Sep 26 — incl. a Fable review, then an independent Codex re-review that found RR-01/02/03 +
owner-requested RR-03b, all fixed and merged via PR #402)) and **1C** (`who→personId`,
parity-sensitive). **1C DONE + LIVE (14 Sep 26, PR #403, merged to `main`, deployed & live-verified).**
Ground/Common-Programme `who` now store the stable person id (flying/duty/sim/inputs already did);
rename is label-only (the DAYS-walk is gone); sim `who` is free text only; `addPerson` refuses an
id-colliding callsign; coordinated storage reset (SCHEMA_VERSION 1→2). Process: design →
cross-provider plan red-team (Claude + Codex, both REVISE → fixes folded) → Opus 4.8 build →
independent cross-provider code inspection (Claude SHIP-READY; Codex REVISE → test-strength + a
peek regression fixed + locked; two-tab reset limitation acknowledged as [DB-STEP]-owned). Gates:
tfin.js 728/0, vitest 4728/4728, smoke 425/0, build; live-verified (ground/programme names resolve
id→cs, sim `who` shows as text, all assets 200, no console errors). *(Deploy note: the first two
publish runs hit the known `addStudent` smoke flake — deploy skipped; a fresh workflow_dispatch run
was green and published, exactly the #398 pattern.)* Spec + dispositions:
`raptor-port/docs/superpowers/specs/2026-09-14-arch-stack-1c-personid-spec.md` (§§12–13 binding).
**With 1C, step 1 (stable ids everywhere) is COMPLETE.**

**STEP 1b — PARTIAL, in review (14 Sep 26, PR #404, held for "merge live").** The two
GENUINE quick wins of 1b are built on `claude/arch-stack-1b-quickwins`: (a) the `mod:'now'`
late-mark freeze — input write paths stored the literal 'now' and re-resolved it to
read-time "today", so an on-time input silently read LATE once re-read on a later day
(latent until INPUTS persist at the DB step); now frozen to today's ISO at the write
(`nowStamp()`, all 7 sites), display still reads "now" same-day. (b) A **SessionState reset
registry** (`view.ts` `VIEW_RESET`) — `resetSession`/`loadWeek` hand-clear-lists had drifted;
one declared per-field policy both iterate, plus a drift-guard test; closed two leaks it
surfaced (HLGROUP, RESTARM). Gates: vitest 4737/4737, build, tfin 728/0 (e2e's 2 phone-width
fails + tracker smoke `addStudent` timeout are pre-existing on `main`, verified). **The other
two 1b items were NOT quick wins on inspection and are SPLIT OUT (owner-approved, 14 Sep 26):**
**ISO dates** is a parity-sensitive record-shape change across ~20 files (`date`+`yr`+`endDate`
→ ISO, Leave War sync, medical, quarantine, storage reset) — promote to its own item with a
design + cross-provider red-team before building; **landing-on-the-row** is largely delivered
by 1A (ground row `src`→stable iid) and its remainder is owned by **step 4** (one Absence
record) — no separate 1b work.

Deferred
follow-ups: (finding 2, orphaned `Other` hard-grade) noted below; and a
**pre-existing** peek-preview cache nit surfaced by the 1C code inspection
(Codex PID-R03) — the ViewWeek preview cache keys on the week only, so a person
rename isn't reflected in the cached preview until a week change. Predates 1C
(perf-cache-adjacent); fix by adding a roster-revision to the preview cache key
when convenient (low priority, cosmetic).
A whole-app architectural review by BOTH Astra and Fable (read-only) converged on one story:
the app is **one store-pattern built three times** (Scheduler / Leave War / Tracker), and it
knows only THAT something changed, never WHAT. The fix is a **record-level change stream over
stable ids** that undo, persistence, sync and the database all consume — build once, not four
times. Several existing items are STEPS of this stack. **Full plan (root causes, order, effort,
what to stop):** `raptor-port/docs/superpowers/specs/2026-09-13-architecture-rootcause-plan.md`.
- **Order:** (1) stable ids everywhere [INP-CSID]/[TRK-CSID] + `who→personId`/note-ids/`iid`→UUID
  — DONE; (1b) quick wins — the `mod:'now'` late-mark fix + a session-reset registry DONE (PR #404,
  in review); landing-on-row folded into step 4, ISO dates split to its own item (see 1b status
  above); (2) ONE write/command layer (all 3 modules, PEOPLE/settings included);
  (3) global per-session undo as inverse-patch [GLOBAL-UNDO]; (4) ONE Absence record (design NOW,
  before the Dataverse tables freeze); (5) record-oriented storage door → Dataverse [DB-STEP];
  (6) remove the quarantine/legacy machinery.
- **Stop now:** interim two-system undo patches and further quarantine rounds (both replaced by
  steps 2–3 and 6). Only the small [SYNC-INTEG] guardrails remain worth doing pre-stack.
- **Model/process:** HEAVY, foundational. Each step: design → red-team (Astra lead, Fable for the
  crux) → build → inspect → gates → hold for "merge live". Start with (1) — cheap, independent.
- **Context:** the plan doc above (synthesises both reviews); memories
  `architectural-root-cause-before-minute-fixes`, `future-undo-semantics-multiuser`.
- **Sequence re-review (Astra/GPT-6 high, 13 Sep 26) — REVISE, backbone SOUND.** Adds a
  **split/incremental invariant + property-testing layer** (small harness now → grown per step →
  property tests at the command layer → persistence fault tests at the DB step; NOT big-bang, NOT
  DB-eve). Invariants must be CLASSIFIED first (hard-enforce vs advisory-detect vs frozen-issued) —
  don't enforce example rules literally (double-booking is intentionally warn-not-block; only the
  ISSUED snapshot is immutable). Order refinements: undo (3) must respect the amendment publish
  boundary; pull the transaction/conflict contract + storage test-double ahead of undo (into 2);
  do one-Absence (4) before retiring the 3 undo stacks. Full dispositions in the plan doc's
  "Sequence re-review" section.
- **1A follow-ups (post-build inspection, 13 Sep 26):** two faces of the cross-week accepted-input
  LANDING model that step (4) "one Absence record" dissolves. (a) **DONE now (owner: guard):** editing/
  deleting an accepted input whose ground row is on a non-loaded week is refused with "Load the week
  of <date>…" (was a silent stale link under stable ids) — `inputedit.tsx:landedOnUnloadedWeek`. (b)
  **DEFERRED to step (4):** an accepted `Other` whose input is later deleted loses its hard-clash
  grade (orphaned row → `shiftHardGround` can't resolve the type; narrow — Fable inspect #2). Fix
  when landings become the one Absence record, or a cheap `srcType` on the ground row if it surfaces.
- **Still deferred, carried here 2 Oct 26 from `[OIL-AWARD-IS-A-GRANT]` (built, merged PR #469, archived):** OIL itself as a
  read-time derivation — the step-4 design §7 (`specs/2026-09-19-arch-stack-4-one-absence-design.md`); the award half is done
  (one ledger entry per hand award, D400–D402), the automatic credit is still a stored record.

### [GLOBAL-UNDO] One global per-session undo — BUILT + MERGED LIVE (18 Sep 26)

Phase 1 (engine) + phase 2 (live cutover) built, five gates green, driven in the app, dual-reviewed
(Fable + Codex), merged on his "merge live". Every Undo/Redo — scheduler, board, Leave War — drives
the ONE timeline; the Unpublish button and off-week undo are live. Shipped behaviour:
`raptor-port/docs/undo-contract.md`. Review dispositions and the full reasoning for each deferral
below: `git log -S"GU-P2" -- OUTSTANDING.md` (`docs/session-state.md` was deleted in `d92303b`).

**SEVEN DEFERRALS, all still open, none blocking — they land at the multi-user / DB step:**

- **[GU-E2E]** two Leave War undo e2e tests `test.fixme`d for CI — a second admin drag-select never
  arms on the CI runners (traced to the sync re-scoping the war). Passes locally; not a product
  defect. Fix the harness, then un-fixme.
- **[CMDLF-002]** rebuild the Leave War posting-out windows on a `lw.postouts` restore, and
  whole-Import undo granularity — both inherited from `[CMDL-FINISH]`; `lw.postouts` is still a
  deferred collection. *(Its person-and-posting half is its own item since D350: `[UNDO-POSTING-RECORD]`.)*
- **[GU-C3]** reland conflict/auth coverage — the restore re-derives `acc` beyond the entry's
  closure without widening the conflict set. Inert single-user; real with concurrent users.
- **[GU-MAYREV] BUILT 28 Sep 26** (the change-recording re-test, `claude/change-recording-retest` — `undo/timeline.ts` `isOwn`, the named barriers; `undo-contract.md` §4). The text below is the question as it stood:
  **[GU-MAYREV] ANSWERED (D148, 24 Sep 26): Undo reverses only the signed-in person's own changes, clears on sign-out, and refuses (saying who) if someone else has since changed the same thing — `raptor-port/docs/undo-contract.md` §4. Build it with the amendment or change-recording work. The question as it was put:** — Undo is enabled on the newest eligible entry
  whatever the actor, and the timeline is not cleared on logout, so a member behind an admin edit
  sees an enabled-but-refused Undo. Grey it, or skip past non-reversible entries. Clearing the
  timeline on logout is the near-term direction (memory `future-undo-semantics-multiuser`).
- **[GU-E5]** an input-only undo does not jump to its week (the record restores correctly). *(28 Sep 26: an input's
  Undo now lands on the Inputs page, which carries the pair — the page the input was filed on; the week jump stays open.)*
- **[GU-LWLOCK]** a restore can push a vestigial legacy-LW history step. No user-facing effect.
- **[GU-COSMETIC]** an AL barrier bound to the loaded week; view-effects not rolled back on a
  failed restore. Both LOW.

### [RECALL] Fresh recall from archive — FUTURE FEATURE
An admin recalls an archived person back into Quals. **NARROWED 26 Sep 26 BY D284: a man archived while OVERSEAS
(D229) comes back AS HE WAS, with a prompt to update his quals — "fresh" below now covers someone who left flying for
good (account deleted) and is ever taken back; `[POST-OUT-OUTCOMES]` builds the overseas return.** **Behaviour (owner, 13 Sep 26):**
leaving the whole app SYSTEM then being posted back = **FRESH** — new/updated quals and
new Leave War balances; only past history stays frozen. NOT "restored exactly as they
left." Replaces the current Quals ✕ / "Restore exactly" behaviour (see [SYNC-INTEG] P6).
- **Absorbs `[SYNC-INTEG]` P6** (carried here 24 Sep 26, when that item was archived): a Quals ✕ confirm — a
  confirmation that archiving someone removes their leave; small, and `QualsPage.tsx` archives with no
  question today. Its P7 (a stale "Leave War session-only" line) is done: `raptor-port/CLAUDE.md` and the Leave
  War's architecture say it persists.
- **Context:** the sync spec §Parked; memories `multi-squadron-and-person-transfer`,
  `future-undo-semantics-multiuser`.

### [XFER] Multi-squadron + transfer a person with their data — FUTURE MILESTONE (with [DB-STEP])
**Behaviour (owner, 13 Sep 26):** many squadrons on one app / one backend; transferring a
person BETWEEN squadrons carries ALL their data across (quals, history, leave) — distinct
from leaving the system entirely, which is a fresh return. The identity model must let one
person move between squadrons with data intact.
- **Context:** memory `multi-squadron-and-person-transfer`; ties to
  `docs/architecture-direction.md` and [DB-STEP].
- **D281 (26 Sep 26) — the posting-out date and the neighbours:** a posting to another squadron IS this transfer — on
  the posting-out date he belongs to the other squadron, moved automatically on that date or by the admin's hand; and
  because the squadrons are local and near each other, another squadron (e.g. 149) may PLAN a 142 man — **normally, at
  any time, not only during a posting (D282)** — his leave, quals and account staying his own squadron's (`docs/architecture-direction.md` §3, More than one squadron). The Leave
  War's post-out sheet will offer it as its fourth outcome (`[POST-OUT-OUTCOMES]`, D229) once this is built.
- **D288 (27 Sep 26) — communities and guest flyers:** callsigns unique within a community (the F-15 one), not
  app-wide; a future F-16 community reuses them, and its men may fly with us as guests (tagged "Viper · F-16",
  picked from a guest list, never by typing a bare callsign). **D289:** a community = the squadrons of one aircraft
  type; a guest always marked — on a puck an orange corner (D296, option A of `docs/mock/post-out.html` §8).

### [TRK-ATTEMPTS] Keep a student's attempt history — OPEN (small, feature)
Remember a student's *earlier* tries at an event, not just the latest grade. More a
new feature than a cleanup. (Verified open: no attempt-history in `tracker/`.)
- **Model:** build on Opus, default; small, clear spec.

### [TRK-DISK] Tracker migration/rename "safety check" reads memory, not disk — Decision A — OPEN
On upgrade or a course/syllabus rename, the app copies records, checks the copy in
**working memory**, then deletes the originals — so a failed disk write (storage
full) can delete an original before its copy is safely saved. Same gap on syllabus
rename. Largely self-healing; bites only near-full storage + tab closed before the
retry (more likely on iPhone). Never fixed, not logged as a limitation.
- **Fix within [DB-STEP]:** a real "it's saved" signal the delete waits for, rather
  than a piecemeal patch in three places. Or pull earlier on request.

### [HUMAN-RETEST] Re-test the earlier builds the way a person uses them (owner, 21 Sep 26)
**ORDER (D85 + D86, 23 Sep 26): TWO CHATS IN PARALLEL — THE TRACKER and THE AMENDMENT SYSTEM**, one
feature per chat. Amendment chat: port 4173, rulings from D90. Tracker chat: port 4180, rulings from
D120. Never two full gate runs at once (false failures under load). **The order of the other three — SET by him
(D147, 24 Sep 26):** the absence record, walked TOGETHER with [S4-HUNT-REST]; then change-recording; then the Leave
War links LAST, with the 7 Sep phone check folded in.
*(Its lines on which chat ran when — D153, D154, D155, D135, D125, every one spent — moved 24 Sep 26 to `OUTSTANDING-ARCHIVE.md`. The Tracker part is merged; the demo is done.)*
**THE TRACKER PART IS DONE — MERGED to `main` 23 Sep 26 on his "merge live", after his look** (evidence
`raptor-port/docs/handpass/2026-09-23-tracker.md`; rulings D120–D132).
**THE AMENDMENT SYSTEM PART IS DONE — MERGED to `main` 25 Sep 26 on his "merge live" (PR #434), after his look (all six steps; his three points became D107–D109 and the batch)**
(evidence `raptor-port/docs/handpass/2026-09-24-amendment.md`, his look card §13; the register
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`; its questions `[AMEND-D45-FILING]`,
`[AMEND-PHONE-APPROVER]`, `[AMEND-TEMPLATE-PUBLISHED]`, `[AMEND-NYS-WORDING]`, `[AMEND-REISSUE-DOOR]`,
`[AMEND-LOAD-FILING]`). The older-amendment unpublish ("BUG 1") was walked three deep and has not come back. Next
here, in his order (D147): the absence record with [S4-HUNT-REST], then change-recording, then the Leave War links.
**THE ABSENCE RECORD PART — WALKED 26 Sep 26** on `claude/absence-record-d147-af6a50`, together with [S4-HUNT-REST]
(all seven of its grounds) and the published day's unavailable list: a host walk and five walkers at both widths, every
defect reproduced and fixed red first (evidence `raptor-port/docs/handpass/2026-09-26-absence.md`; plan
`raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md`). Its questions for him were [ABSENCE-ASK] (all answered — D260–D263; archived); what
it filed is [LW-ISO-DATES], [LW-MOVE-BENEATH] (built by [LW-MOVE-STANDARD]; both archived) and a line in [AMEND-SMALL-SEEN] item 6. It closes with the final code
reads, his look and his "merge live". **Next here: change-recording** (with [UNDO-ROSTER-SETTINGS] and D148 — MERGED 29 Sep 26,
PR #464, evidence `raptor-port/docs/handpass/2026-09-28-change-recording.md`), then the Leave War links.
**Added 24 Sep 26 (the spring clean, from `HANDOFF.md` §Open as Fable classified it):** the amendment walk includes
unpublishing an OLDER amendment — the 11 Sep review's "BUG 1" (the day left contradictory) looks dissolved by the
supersede-never-retract rebuild (`unpublishAL` is gone), which only a walk can confirm; and the Leave War half of
the 7 Sep 26 device pass (the figures drawer, the bulk balance entry, the 6 Sep phone fixes) was never given his
iPhone look — fold it into the Leave War links walk.
**Tracker scope (D120):** his charts reach the database by export → wipe → import, so the older-data
converters and old file formats are NOT walked; the current export → wipe → import round trip is
walked FIRST (`docs/tracker/known-gaps.md`, head note).
**His words: "This also means that all the previous bug tests we did there will be bugs not
captured. Because I didnt test them when i told u that u would test like a human since."** He is
right, and the OIL build is the proof. It had a two-model cross-provider review and 5341 green
tests, and he then opened the app and found three defects within minutes: the green OIL strip never
reached the board's flying seats or its Common Programme; any advisory chip on a puck painted over
the strip; and in OIL Earn mode the flying seats, the SC shifts and the Common Programme were not
tappable at all — the mode's one gesture did not work on the biggest part of a weekend schedule.

**All three are the same shape: a surface that was never wired up.** Every line of code that IS
there is correct, so reading code cannot find them, and no test caught them because every assertion
about the strip had been written against a duty desk or a ground row — the two surfaces that DO go
through the shared renderer. `docs/feature-impact.md` had even NAMED this drift-seam in advance,
worded as "a new seat renderer"; the hole was in two existing ones.

**So any earlier feature whose bug check was a code review plus unit tests is carrying this class of
defect, unfound.** The scope is every build reviewed that way — the amendment core, the command
layer, the one-absence record, the Leave War wires, the Tracker. The method is the owner's standing
rule, applied properly: build the real thing in the running app, walk every surface that draws the
feature, walk every ORDER of gestures, and ask of each screen whether what is drawn is what a person
would expect to see and can actually use.

**DO THIS AFTER [OIL-AUTO-REMOVE] is closed and merged** (owner: "perhaps the next session we can do
that after this task is truely completed and free of bugs"). Start from
`raptor-port/docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md` §"the two the owner found",
which records why the static pass missed them, and from the scenario lists Fable and Codex wrote for
the OIL pass — the same scenario-design-then-execute shape is what this needs.

### [LW-COMMIT-MANNING] Duty & commitments must reduce the Leave War manning — the OTHER half of N17 (owner, 21 Sep 26)
**Owner's words, and he then said to file it: "The manning should only reduce if they are like
planned by things like leave, duty & commitments."**

N17 built the first half — an OIL credit no longer removes a man. The second half is NOT true and
never was: **duty-and-commitment inputs do not reach the Leave War at all.** `absences.ts warVisible`
admits leave, medical, a course and overseas duty, and nothing else — so Training, Meeting, Fly
with, Appointment, Duty and Other are invisible to that grid and to its manning.

Found by Astra in the N16 bug check, and verified: it is NOT a regression from N17. What N17 removed
was an ACCIDENTAL reduction — a duty input that happened to earn an OIL credit used to zero the man
through the credit, on a weekend only. A weekday commitment never counted at all.

**The scenario that shows it:** an SC-day team needs six and the squadron has exactly six on a
Saturday. One of them has an accepted all-day Training input. The Leave War still reads six and one
complete team; it should read five and a shortage.

**The shape, when it is built:**
1. Project active duty-and-commitment inputs into a manning-only contribution — NOT into the war's
   editable cells, its clashes, its charges, or anything that reads as OIL evidence.
2. Fold its full/half-day portions into `DayView.away`, capped per half so leave and a commitment on
   the same half cannot subtract the man twice.
3. Carry it through the category counts, `ruleHave`, the presence counts and `scTeams`.
4. Respect removed/dormant inputs, the posting dates and the ground-crew rules.
5. An OIL credit still removes nobody (N17), whichever way the input that earned it was filed.

**Why it is its own job:** it changes the manning figures on a screen the owner reads, it needs a
decision about which of the six types count (a two-hour Appointment is not a day off the programme),
and the projection is a new seam into the war. Not a line. **Priority: his call — raised with him on
21 Sep and filed at his word.**

### [LW-FROZEN-BAR-GAP] For one frame no dates header shows while the page scrolls it away (23 Sep 26)

Found by the frame-by-frame pictures of the frozen-bar fix (evidence sheet §11, frame 1 of
`fixed-desktop-frozen-bar-first-frames.png`). When the page scrolls the real dates header up under the
top bar, the frozen copy arrives ONE painted frame later — it is React state set in the window's scroll
handler, so it renders on the next frame — and that frame has no header at all. **Pre-existing, and not
the owner's "scrolling rapidly horizontally"** (that jump is fixed): a blink, not a slide. Fix direction:
in `Matrix.tsx`'s stuck effect, commit the change of stuck-or-not synchronously (`flushSync`) — ONLY when
it changes, never per scroll event, because the whole grid re-renders on it — or keep the bar mounted and
show/hide it outside React; either needs a speed check (the re-render would land inside the scroll
frame). The Quals page's frozen header has the same shape. **Place:** the next Leave War polish item,
after `[HUMAN-RETEST]`; show him first — he may not see a one-frame blink at all.

### [DEPLOY-DOCS] The Pages-era deploy text is stale since the repo went private (D59, 23 Sep 26)
**STATUS 24 Sep 26: the DOCS half is DONE** in the spring clean — the Pages-era text of `raptor-port/CLAUDE.md` and
`HANDOFF.md` moved whole to `raptor-port/docs/archive/`; the live rules are `.claude/rules/shipping.md` and
`raptor-port/docs/gates-and-deploy.md` (its Now block); "done" means live on Vercel (D143); the "site is public"
sentences corrected. **Left** (Astra's red team, finding 12): the header and comments of
`.github/workflows/deploy.yml` and `raptor-port/scripts/handpass/live-check.mjs`, which still describe a Pages
deploy — files that start the gates, so their own small change.

`raptor-port/CLAUDE.md` §Build & verify and §How to work here, and `HANDOFF.md` §Deploy, still describe GitHub Pages as the official live site, the "done means live" chain ending at Pages, and `seejiaokai.github.io/Raptor` as the page to check. All of it stopped being true on 23 Sep 26: Pages is gone, the publish job is off, Vercel is the only viewer. Marked SUPERSEDED in place at the two most misleading lines; the proper rewrite is its own docs pass (D29 — never trim inside another change). **Tier: NONE.** Do it with `[DOC-TRIM]`, which owns the same two files.

### [REPO-PRIVATE] Make the repo private and share it with developers — HALF DONE 23 Sep 26 (D59)

**23 Sep 26, later: D88 ("I'll make it public for now") was REVERSED by D89 before he switched — it
stays PRIVATE** and the checks move to his own PC (`[CI-TWO-CORES]`). Why it mattered: 146 old branches
on GitHub still carry the D58 unit designation IN THEIR FILES, and `main`'s history in 14 commits.

**DONE, BY HIM, 23 Sep 26 (D59): THE REPO IS PRIVATE**, reversing his own *"nvm disregard this
first"* the same day after a check found the unit named in the app. Pages is GONE (API 404), so the
publish job in `.github/workflows/deploy.yml` is OFF — it would fail every push and still bill —
with the gates left running. `README.md` corrected. **The app is viewed on VERCEL now.**

**STILL OPEN — the sharing half** (*"i would like to make my repo private, and share with developers
on my app"*). Route: Settings → Collaborators, by username, Write; they run it locally and do not
need Vercel. **Unmade question:** a collaborator here sees the uploaded original, the whole history
and every agent-facing doc. If that matters, the fresh single-commit repo below is the answer.
**BEFORE THE FIRST COLLABORATOR IS ADDED (Astra SEC-101, 23 Sep 26): take the self-hosted runner off
this repo** (Settings → Actions → Runners → JK → Remove) and set `CI_ON_GITHUB=true` — or move the
runner to a separate owner-only CI repo. A pull request runs its own copy of the workflow, so the
guard in `deploy.yml` cannot stop a collaborator's PR from aiming a job at his PC.
**What was established while it was up, so it is not re-derived:**
- The repo is **PUBLIC** today and the live site answers **200 to anyone** with the URL, no login.
  The hard-coded accounts are one search away in `src/state/auth.ts`, so removing credentials from
  the README was never a security change (it was done anyway — they were STALE and contradicted the
  24 Aug decision to keep them off the sign-in card).
- **Pages cannot serve privately.** From a private repo it needs a paid plan, and even then the
  published site is public — private Pages is enterprise-only. So Pages is not a sharing route at
  any sensible price. Going private on the free plan simply turns the live site off.
- **Collaborators** is the sharing route: Settings → Collaborators → add by GitHub username, Write.
- **The Vercel preview is HIS alone** — it sits behind Vercel's own sign-in, and a developer cannot
  generate one. Adding them needs a Vercel team seat (the free tier is single-person). **Developers
  do not need it**: `cd raptor-port && npm install && npm run dev` gives each of them the whole app.
- **MEASURED, 23 Sep 26 — one push costs 37 BILLED Actions minutes** (31 real minutes over nine
  jobs; GitHub rounds every job up, so the rounding alone is 6). Public repos are unlimited; private
  ones are metered. At the commonly-quoted 2,000/month that is ~54 pushes, and one heavy session
  (23 Sep) used ~220. **His plan and live usage were NOT readable from the session** and should be
  read off Settings → Billing and plans rather than assumed.

**The recommendation on the table:** private + collaborators with Write + Pages OFF + developers run
it locally; pay for Vercel seats only if non-developers need to look. **His call, unmade.**

**WHAT A DEVELOPER WOULD FIND, measured 23 Sep 26.** `raptor-port/reference/scheduler.html` (435 KB)
is the original app, in the open, and LOAD-BEARING — `npm run test:reference` (the 728/0 line) runs
it; `PORTING.md` calls the job a port of it. `RAPTOR-Command-Brief.pptx` is gone from the tree but
lives in three commits, and **slide 1 still carries the service name** (binary, so D58's text sweep
could not reach it). Plus ~660 agent-taken screenshots, and 1,296 commits across ~25 branches all
carrying agent attribution and agent-facing docs. **A history rewrite does NOT clean GitHub** —
old objects stay reachable via PR refs and forks; only support can purge them. **A worktree does
not isolate any of this; it shares the same history.** The clean route is a FRESH repo with ONE
commit — app source only — which drops the deck, the original and the archive in a single step.

**NO RESTRICTED MATERIAL WAS EVER UPLOADED — checked 23 Sep 26, do not re-run.** Clean: the uploaded
original (no marking of any kind), the deck's 10 slides, the demo data (63 invented callsigns, no
real names/IDs/DOB/next-of-kin/rank), and the stores, mission and area vocabulary (generic training
terms and compass points). The only `RESTRICTED` is the stamp the app PRINTS on schedules it
generates (`src/ui/printpdf.ts`) — the product working, not a trace of anything received.
`tracker.css`'s `.restricted` banner is dead style, rendered nowhere. **That check never opened the Tracker's SYLLABUS data** (222 events of course content) — and he has since ruled it OUT OF SCOPE (D62): leave it, never flag it again. Every other mention of the aircraft type is now "fighter squadron" or the bare "F-15" (D63, D64) — only that syllabus data keeps it.
### [LW-SCRUBBER-FLAKY] Leave War e2e tests time out on a saturated machine — PRE-EXISTING (21 Sep 26)
`e2e/leavewar.spec.ts` "the bottom scrollbar is a year-wide scrubber", lw-desktop only. Under a full
parallel run it sometimes times out after the SEP month button is clicked: the grid has not scrolled
within 4s, so the bar's fraction still reads 0. Checked the way the OIL handoff demanded — the SAME
full run on `main` (bdd51cc) FAILED it (446 passed, 1 failed) while `claude/oil-auto-remove-design`
PASSED it (447 passed, 0 failed). **Pre-existing; not the OIL branch's.** It also passes in isolation
(287/0 for the Leave War projects alone). The fault is the test's, not the app's: a fixed 4s poll on
a year-wide grid redraw. Fix by waiting for the grid's own scroll to settle instead of a wall clock,
or raise that poll and the twelve-months one beside it. Low priority — it bites only a loaded dev
box; CI runs three workers with one retry. Logs from both runs are in the 21 Sep evidence sheet,
`raptor-port/docs/handpass/2026-09-21-oil.md`.

**WIDENED 22 Sep 26 — it is a FAMILY, not one test.** The overnight run on this branch failed a
different one, `e2e/step4-leavewar.spec.ts` "leave during a course", lw-desktop, and it failed on the
LOGIN page: the sign-in form had not rendered before the fill timed out. Run on its own it passes in
six seconds. Same cause, same shape — a fixed wall-clock wait on a loaded box — so the fix is the
same one, and it belongs to the Leave War e2e suite rather than to any branch.

### [BACKLOG-ORDER] The backlog proper, in the owner's order (21 Sep 26)
After the hunt. Recorded here because he gave the ORDER, which the individual items do not carry:
1. **[PUB-UNAVAIL]** — a published day's "not available" list changes silently. File a new absence
   over an already-published day and that day's list changes with no amendment, no re-sign and no
   line in the history. An audit hole on published paperwork; **the next one he would fix**.
   **CLOSED 26 Sep 26** — built by [LEAVE-LATE-PUBLISHED] (D177–D179), walked correct by the absence-record re-test
   (H1); the item is archived.
2. **[LW-LOCKMARK] / the day-vs-record lock** — the grid locks by DAY, not by RECORD. The free-half
   fix works around this rather than fixing it. Worth doing once, properly.
3. **[LW-WEEKDAY-WORK] — the Leave War cannot see ordinary weekday work at all.** Work only reaches
   that grid as an OIL credit, and credits only happen on weekends and holidays, so a man flying
   every Tuesday has nothing on his row to show it. **Bigger than everything else on this page put
   together, and it needs a conversation with the owner before any of it is built.**
4. **[DB-STEP]**, and then the **[AMEND]** work queued behind it.

### [LW-WEEKDAY-WORK] The Leave War cannot see ordinary weekday work — OPEN, needs the owner first (21 Sep 26)
Its place in the order and the one-paragraph description are item 3 of `[BACKLOG-ORDER]` above.
Given a heading 23 Sep 26 ([DOCS-GUARD] F5) so the document gate counts it — it had been named in
his order without ever having an item of its own. **Talk to him before building any of it.**

### [LW-LOCKMARK] Retire the war's `source:'raptor'` lock marker — OPEN (follow-up to step 4, 20 Sep 26)
Codex's round-2 inspection (AS4-R2-004, low): the merged view still synthesises `source:'raptor'` ("locked on
the war") and Matrix reads it through `raptorOwns`, and the published remarks sheet finds its Input via
`leaveInputAt` (person/date/code) rather than the record id. Correct today (the tap list acts by id on any
multi-record day), but design §6 wants the lock derived from each contribution's own Input. Replace the
Matrix `raptorOwns` checks with per-contribution predicates, open the remarks sheet by iid, then delete
`sourceOf`/`raptorOwns` and the synthesised `source`. Also open: a publish → undo → publish → undo → redo
refusal ("an earlier undone change touches the same thing") that exists on `main` too (found by the step-4
scenario tester) — the global undo timeline's own item.

### [LEAVE-YEAR] Yearly leave balances and carry-over — OPEN (owner, 19 Sep 26: "we will do this next time")
Today each person has ONE running balance per counter; leave on 1 Jan simply comes off it, and a new
year is handled by the admin's "Reset counters". Decide next session: separate balances per year/war,
carry-over rules, and which year a leave crossing 31 Dec charges. Context: clash catalogue Q10.

### [DB-STEP] The shared-database step (Dataverse) — AT THE END (D473, 1 Oct 26; "starts now", D354, is replaced)
**AT THE END (D473, 1 Oct 26 — "Database at the end."):** the app goes into Dataverse once its features are built — the IT side's
own advice (the app about 60% built; once it is in, every change needs their review and merge, and no AI outside that environment
can sign in to check it). He, with his AI, writes the table format and schema for them to enter; `raptor-port/docs/data-model.md`
is that list, kept up to date as each feature is added. What the platform offers today: `[IT-QUESTIONS]` (1 Oct 26).

*(As written 29 Sep 26, replaced by D473:)* **STARTED 29 Sep 26 (D354):** the IT team is taking the app into Dataverse now; he means to keep working on the app beside it.


**ACCESS CHANGES TAKE EFFECT AT ONCE (Astra's read of `[ACCOUNTS]`, 26 Sep 26):** switching an account off, demoting
an admin or relinking a person must stop the old rights on his very next request, in every open tab and device — the
server checks the current account on every write (`raptor-port/docs/handover-dataverse.md`, the non-negotiables). Today
it cannot: accounts live in one browser and open tabs share nothing, so a change reaches that browser's next sign-in.
**ACCOUNTS (owner, D165, 25 Sep 26):** everyone signs in with their own defence mail account; the admin creates each
person in the app (callsign, name, admin or member) tied to their defence mail address; "View as" goes away. Per-person
"what changed since YOU last looked" follows (`[DRAFT-PENDING]`). The Microsoft side (access, licences, whether code
apps are allowed in the environment, the data rules for defence data) is his helper's, briefed by
`raptor-port/docs/handover-dataverse.md`.

**THE DATA GETS WIPED ON THE WAY IN (owner, D54, 23 Sep 26 — "this app is going to get wiped of
data before its being brought into a database as these are demo data anyway").** Stated as a PLAN,
not an option: nothing now in the store has to survive the move. It is the 13 Sep dev-phase rule and
D22 strengthened — those approved clearing when it was simpler; this says the clearing is going to
happen, so "the harm lives only in data that already exists, and it is prevented going forward" is
a reason to STOP, not a cost to weigh. Use it as a test on any finding from here to the database.
**The Tracker's hand-drawn charts are the exception, and they travel by EXPORT → WIPE → IMPORT
(owner, D120, 23 Sep 26):** he exports them, the app is wiped, he imports the file. So the current
Export and Import of charts must be faithful at this step; the older-data converters and old file
formats need not be (`docs/tracker/known-gaps.md`, head note).
The big future move: Raptor, Leave War and Tracker all run on `localStorage` /
session today; the target is a shared database (**Dataverse** — `src/storage/`
seam, `docs/data-model.md`). Large, design-first, its own red-team. Several parked
items are meant to be resolved here — notably **[TRK-DISK]** (the memory-not-disk
save signal) and the Tracker's dropped SharePoint/Dataverse/Firebase layers.
- **Model:** design review on Fable, high (the expensive-to-get-wrong decision);
  build volume on Opus.
- **Tooling to revisit HERE (owner asked 17 Sep 26; Opus + Fable both advised defer):** when the
  Dataverse adapter/API + auth are being built, reconsider a **cross-layer (frontend↔backend↔DB)
  reviewer** and a **security-audit skill** — both premature until a backend/login exist. NOT worth
  installing now: generic PR-review / systematic-debugging / test-generation / Playwright skills
  duplicate the current pipeline (cross-provider red-team, the 6-gate suite, vendored
  systematic-debugging / test-driven-development / `/code-review` / `/security-review`); and any
  Postgres-specific tuning tool does NOT apply — the DB is Dataverse, not Postgres.

- **The notional TODAY stays pinned to the demo week until real data arrives**
  (owner, 24 Aug 26). `weeknav.ts`'s `TODAY = '13/07/2026'` drives only the
  today-ring/dot on the week pickers; every time-STAMP already reads the device
  clock. When the demo is replaced, point that one literal (and nothing else) at
  the device date.

### [CRP-FLAG] Live flagging on the PUBLISHED schedule — DESIGNED + RED-TEAMED, ready to build (15 Sep 26)
**STATUS 24 Sep 26: PARTLY BUILT** — PR #406 (16 Sep 26) merged the plan's "Item 2 + 3(a)" (the two checked
versions; the official-flags overlay). The note of what came next was lost with an old handoff line and the
retired `docs/session-state.md`. **Before touching this, check the code against the plan's §11 test list**
(`raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md`). "Ready to build" above is history.
Show live warnings (crew rest incl. cross-day/past-midnight, the 7-day work rule, timing
clashes) on the published/signed schedule again — today publishing a day hides them. Model:
two checked versions (signed + working); each screen flags the version it shows; check a day
against each surrounding day's **published version if it has one, else its working copy**; the
day being amended drives the scheduler's own preview. Content byte-frozen; "Not Yet Signed"
marker (everyone). Clock-free; NOT coupled to EOD.
- **Fully scoped + cross-provider red-teamed** (2 rounds + a confirmation, Codex + Fable). On
  branch `claude/crewrest-published-flagging`. **Build spec:**
  `raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md` (§5 mechanism,
  §11 tests, §14 tricky build spots); review log alongside it.
- **HEAVY**, test-first, Opus; keep `tfin.js` 728/0; fresh Codex+Fable CODE inspection after
  build; no merge without "merge live". Owner decisions are in `DECISIONS.md`.

### [FLAG-EXPORT] PDF export — print the PUBLISHED version, CURRENT DAY only + a nicer agency-facing redesign — OPEN (follow-up of [CRP-FLAG])
**STATUS 24 Sep 26: PART DONE** — it prints the PUBLISHED version with a per-day signed/working stamp, as a
white one-layout report (`raptor-port/src/ui/printpdf.ts`). **Left:** the current day only (it still prints the
whole loaded week), the 1–2 sample PDFs for him to pick, and the next-week peek's label. The "functional" bullet
below is done.
THREE halves now (owner, 15–17 Sep 26):
- **SCOPE — CURRENT DAY ONLY (owner, 17 Sep 26): "my end goal is to export the current day
  only's published schedule … its only purpose is to export the snapshot of the current
  schedule."** Today `ui/printpdf.ts:printSchedPDF` exports the WHOLE loaded week
  (`publishedDays()` + a Mon–Sun label). Narrow it to the one day. Same ruling also settled
  two other things worth keeping together: the export is a **scheduler-only** function ("they
  know what's the latest copy to use"), and it is **NOT** a publication boundary — exporting
  does not constrain undo, which is why the three export/print/session-end "disclosure" call
  sites were removed on 17 Sep (see `docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md`
  §3.4 and `src/state/disclosure.ts`). Flagged during the 17 Sep correctness sweep and
  deliberately NOT changed there — it is a real behaviour change needing its own gate and a
  live check. Context: that sweep doc's §G.
- **Functional (not a design call — safe to build):** exports (`schedRows`→export.ts/printpdf.ts)
  read the live working `DAYS`; export the **published** version instead, and label the
  next-week peek working-vs-signed.
- **Visual redesign (owner direction, 16 Sep 26 — "your call on the design"):** the PDF is a
  REPORTING tool to an agency next time, not a planning tool. So:
  - **DROP the right-hand personnel / "Aircrew Available" roster columns** (planning-only, not
    needed for the report).
  - **White background** (not the app's dark theme).
  - **Make the format nicer / cleaner — NOT multiple grids** (a single clean layout).
  - Similar to Raptor style is fine; it need NOT match the sheet exactly. Initials-vs-callsign
    doesn't matter.
  - **Sample of the current sheet:** `raptor-port/docs/img/flag-export-sample-current.png`
    (the "16 Sep 2026 Schedule AL0" export the squadron sends today).
  - **Process:** produce 1–2 rendered sample PDFs for the owner to PICK before finalizing
    (his "show a picture before product code" rule); nothing merges without "merge live".
- Separate gated PR after [CRP-FLAG]. Context: [CRP-FLAG]'s review log + the sample image.

### [TRK-PINCH-ASK] His iPhone look at the pinch fix (24 Sep 26)
**Place:** his next Tracker session — nothing is broken; `[TRK-PINCH-DRAGS-BALL]` merged on D133 without his look.
The two feel questions are ANSWERED — **D134: keep both as built** (a deliberate drag joined by a second finger goes
back; the finger left down after a pinch does nothing). Left: his look card, on his iPhone on the live app:
`raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md` §12 — Safari is the one browser no walk here drives, and
one line of the fix (the board holding both fingers) is proven only there.

### [LW-DOZE-GUARDS] Do the Leave War's measurement guards ever run while its page dozes? (filed 28 Sep 26)
**Place:** low — check before building anything. Found by Fable's read of the Tracker leftovers plan (F12): the
`.page.doze` comment in `raptor-port/src/ui/scheduler.css` said a dozing page's insides "read 0×0 … which is what every
Matrix measurement guard already checks for"; measured 28 Sep 26 (the leftovers' baseline walk, O), they do NOT — a dozing
section is 0 tall but its insides keep their last boxes, unpainted. The comment is corrected (on
`claude/tracker-leftovers-f79d36`). **Do:** check whether `raptor-port/src/leavewar/ui/Matrix.tsx`'s guards on
`width === 0` (~2285, ~3133, ~3135) can run while the Leave War page dozes; if one can, it would measure stale boxes —
switch it to the section's `.on` / `.doze`. Nothing on screen is known to be wrong.

### [SHELL-SIDEWAYS-BAR] Raptor's own top bar is 149px tall on a sideways phone (filed 28 Sep 26)
**Place:** low — with the next change to Raptor's top bar (the parallel chat's D347 move of the Tracker's ↶ ↷ into it
measured it at 149px before and after). At 844×390 the desktop menu wraps into two rows and takes 149 of 390px — the
biggest single piece of a sideways phone's screen (the Tracker walk's w3 O4, moved here from `[TRK-RETEST-NOTES]` when the
Tracker's own fold, D373, was built). A shell layout question, and a visual one: a picture first.
*(5 Oct 26, `[SAVE-NOTE-COVERS]`: while a save has failed the warning's band adds 36px to it — 185 of 390px on a
sideways phone, until the save lands.)*

### [FLOATWIN-TWO-LINE-BAR] The two movable windows open over the bottom of a two-line top bar (filed 5 Oct 26)
**Place:** low — with the next change to the changes window or the ALL AVAIL window. Found while building
`[SAVE-NOTE-COVERS]`: both open at a fixed spot, 96px down the right edge, whatever the top bar's height. Where the bar
is two lines (Edit Schedule at about 1400px wide and under: 103px) the window's top edge lies over the bar's last 7px,
on `main` too. With a failed save showing it now opens lower by the warning's band, so it stands where it stood — still
those 7px over the band's lower edge; Retry's middle stays clear and a real press reaches it (tested). **Do:** measure
the opening spot from the bar's bottom, as the failed-save warning does (`raptor-port/src/ui/floatwin.ts`,
`raptor-port/src/ui/SaveStatus.tsx`).

### [GUEST-SAVE-WARNING] Does a guest's own page ever need the failed-save warning? — a check (filed 5 Oct 26)
**Place:** low — check first, with the next change to the guest's pages. Astra's second read of `[SAVE-NOTE-COVERS]`
noted that someone signed in without access gets a separate, read-only set of pages (`raptor-port/src/ui/GuestApp.tsx`)
that has never drawn the save warning, before or after that fix. **To check:** does anything a guest does get saved
through the app's saver (an access request, for one)? If it does and that save can fail, the guest is told nothing —
give that page the same warning (`SaveBand`, `raptor-port/src/ui/SaveStatus.tsx`). If nothing of a guest's is saved
that way, close this with the reason. Not walked; nothing on screen is known to be wrong.

### [WALK-COST] Make a walk cost fewer tokens — measure where a walker's tokens go, then cut the avoidable part (his question, 7 Oct 26; a proposal, not ruled)
His words: *"how can we make walks less token intensive? Or it's inevitable."* Told to him: not inevitable — a walker's half
million tokens (`raptor-port/docs/walk-ledger.md` §The figures) go to loading the project, writing and fixing its own
browser scripts, opening pictures and writing its report; only the looking is the part nothing else replaces; how the cost
splits has NOT been measured. **Proposed, in order of likely saving:** (1) fewer walkers — already the rule (D607, D608);
(2) a kept library of ready walk steps per screen (`raptor-port/scripts/handpass/` has the drivers; most walkers still write
their own scripts and lose runs to script mistakes — the ledger's "not faults" column), so a walker runs and reads rather
than writes; (3) the script judges pass or fail in words, the walker opens pictures only behind a fail and a high-stakes
pass (D595's condition, extended from the host to the walker), and looks at one sheet of small pictures instead of each
full one; (4) a scenario that passed in a walk becomes a browser test, so the gates run it from then on. **First step,
with the next walk that uses helpers:** record in that walk's ledger row how each walker's tokens split (reading, script
writing and re-runs, pictures opened, the report) — then build (2) for the screens walked most. **Not ruled — his word
starts it.** **Place (the agent's line):** the measuring rides with the next fanned-out walk; the library is a small job of
its own after it (a change to how walks are run — its guide wording read by Astra and Sol, D70).

### [STACK-LEFTOVERS] Small loose ends named in the Codex stack's finished items, kept when those items went to the archive (filed 7 Oct 26)
Each stood inside an item that is otherwise built, checked and live (PR #481), and none was settled in the stack's check
(`raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`). All low. (1) **Insights, two edges never tried**
(`[INSIGHTS-MISSION-MIX]`, the Opus interim read of 3 Oct 26): what a published day's "changes to go out" strip shows after
"Choose mission role" is pressed with unsaved typing in the Remarks box; and the week's Templates button while a saved
plan is being looked at. (2) **Insights, one tidy-up** (D489's note): the change history and Undo each work out the wording
for a Blue/Red answer by themselves — one shared helper would stop them drifting; with `[CODE-TIDY-AUDIT]`. (3) **Three
checks of the older "adapted audit" script failed the same way before and after the Insights build** (an AL mark that
moves, an issued key rewritten, where an input's Undo lands) — written down then as limits of the script, not faults; look
again when that script is next run. (4) **Discard marks — not ruled, his to raise:** a button that puts a published day
back to its last published version (`[DISCARD-MARKS-REMOVE]`, D488). The second cheaper-model trial — one small fix built
by a Sonnet helper — lives in `[OG-TAG-OVER-COUNT]`. **Place (the agent's line):** (1) with the next change to Insights'
role question; (2) and (3) with their own jobs; (4) only if he raises it.

### [SANS-CALENDAR-WIP] The new layout for the SANS availability calendar, worked on with Codex, is in progress and on hold — nothing of it is deleted (owner, D610, 7 Oct 26)
**CALLED BACK 7 Oct 26 (D614): the NEXT job is the Inputs calendar and the SANS availability calendar.** *(7 Oct 26, the job's own chat: the branch is brought level on `claude/inputs-sans-calendar`; what is built and what is owed: [SANS-COMMITMENT-CALENDAR].)* Start from
`codex/inputs-sans-calendar`'s own `HANDOFF.md` block (read it with `git show origin/codex/inputs-sans-calendar:HANDOFF.md`).
That branch is 124 commits behind the live version: bring it level FIRST — it meets `main` in the rulings files (use
`backlog-archive.mjs --rulings --merge`), `AGENTS.md`, `HANDOFF.md`, `OUTSTANDING.md`, `raptor-port/docs/ui-contracts.md`,
`raptor-port/playwright.config.ts` and `raptor-port/src/ui/InputsCal.tsx` (the failed-save band, D587). **Opus 5.5 builds it, in Claude Code (D615, 7 Oct 26)** — it reads
what Codex built first; Astra and Sol 6.1 review what Opus adds. Nothing of it is deleted (D610). Size the walk first (D607, D608).
His words: *"That's still work in progress and I may call it back to work on it anytime. So don't delete"*. The work is on
the branch `codex/inputs-sans-calendar` (on his PC and on GitHub; checked 7 Oct 26) — its own handoff block, its rulings
D567–D585 and its records are on that branch, not on `main`; Codex recorded his hold there (D585) and D589 kept it outside
the Codex stack. **Until he calls it back: no chat reviews, rebuilds, merges or tidies it, and no tidy-up deletes its branch,
its records, its pictures, its backlog items or its rulings.** When he calls it back: read that branch's `HANDOFF.md` block
first; its ruling numbers D567–D585 are reserved. In D495's order it is the batch "how inputs show on the calendar"
(`[FEATURE-WISHLIST]`). **Place:** his to call.

### [IMPECCABLE-UPDATE] Move Impeccable to v4.1.3, the last version built from readable scripts — AFTER the calendar job (D625; the newest version is not taken, D623 — 7 Oct 26)
**Place (his word, D625):** after the Inputs / SANS calendar job — its own small branch from `main`, the vendoring note's own steps (copy the publisher's files at the tag `skill-v4.1.3`, merge the two hook lines by hand), Astra's and Sol 6.1's reads (D70), then his "merge live". *The paragraph below is how the question arose; its two points "to put to him" are answered by D625 — v4.1.1 stays until then, and the update is 4.1.3, not a later version's guide text.*
**As filed:** low — his call, after the Inputs / SANS calendar job. He asked for the update on 7 Oct 26; it was tried on a
throwaway branch and undone, because v4.5.0 replaces the readable scripts with a 17 MB program that the two automatic
checks would run on every turn, and nobody — Astra, Sol or another model — can read a program (D623: guides and tools stay
reviewable by different models). What was found, first-hand, and the publisher's claims for the new version (guidance
tuned for working screens, design variants cycling in the browser, side-by-side review, checks that measure what the
browser draws): `.claude/skills/IMPECCABLE-VENDORED.md` §Updating. **Two things to put to him:** (1) confirm in so many
words that the installed version stays; (2) whether to take the new guide TEXT with the program kept out — which features
then work is NOT tested (the automatic checks would stop: the old scripts are deleted in that version). A guide change
either way: Astra and Sol 6.1 read it before he approves it (D70). **Two facts not yet checked:** whether the program's
source is published, and whether it updates itself.

### [EVIDENCE-RECORD-SIZE] The Codex branches carry very large machine-written record files (filed 5 Oct 26)
**Place:** low — his call, put to him at Claude's review of the Codex branches, before any of them reaches `main`. He
asked on 5 Oct 26 why the branch showed about 680,000 added lines. About 585,000 are records of checks, not the app:
two measurement files of about 122,000 lines each and two of about 33,000 under
`raptor-port/docs/handpass/css-split/`, a 29,000-line test log under `raptor-port/docs/handpass/insights-mission-mix/`,
and the evidence archives beside them. They do not run in the app or slow it; they make the repository heavier to
fetch and to search. *(6 Oct 26: the crew-rest fix's walk added about 150 MB of pictures — four walkers' and the host's, 1,298 —
under `raptor-port/docs/img/handpass/2026-10-06-rest-blank-line/`, kept whole as the Codex stack check's 224 MB were; the same
question covers them.)* **The question for him:** keep them whole, or keep each check's evidence sheet and pictures and
move the raw measurement files and logs out of the repository (their fingerprints stay in the sheets). Nothing is
deleted without his word.

### [TRK-SAVE-FAIL-SAYS-SAVED] Inside Raptor the Tracker says "saved" when the save failed (filed 28 Sep 26)
**Place:** low — with `[DB-READINESS]` (honest refusals and saves in small pieces are that batch's job). Found by the
Tracker leftovers' walk (walker c, F3; pictures `…/walk/lo-2c-b07-1200.png`, `…-b07-390.png`): with storage refusing
writes, ✓ Save changes turned the Tracker's corner green — "● syllabus “2026” saved …" — beside Raptor's "Not saved —
Retry". Raptor's in-memory store accepts the write and only its background saver fails, so the Tracker never hears of
it; its red error words can only fire for a failed Export. Nothing is lost if Retry is pressed (walked). **Do:** let the
Tracker's save status follow the storage seam's real outcome (the whiteboard's pending / failed state), so a failed save
never reads "saved" anywhere.

### [TRK-KEY-NAME-CLIP] A longer student name on the left of the Students card's key is cut off at the card's edge (filed 30 Sep 26)
**Place:** low — with the next Tracker change. Seen by the `[DB-READINESS]` group A phase 5b walk
(`raptor-port/docs/img/handpass/2026-09-30-dbr-phase5b/1-old-tracker-his-work.png` and `2-new-…`): with three students on
a chart the key around the course ball puts the third name on the LEFT, and "HIS STUDENT" reads "IIS STUDENT" — its first
letter under the card's edge. On `main` too (the first picture is main's build), so not the phase's doing; a real
callsign of ten or more letters would lose its first letters the same way. **Do:** keep every name of the key inside the
card (shrink the name, or wrap it under the ball, on the left as the right does), and check at the phone width too.

### [UNDO-PUBLISH-ERASES-ISSUANCE] An Undo of a publish deletes the issued version's stored row (filed 30 Sep 26)
**Place:** with `[DB-READINESS]` group B — before the `Amendment` table has another reader (the database step), where
"has the shared database registered this version?" (`raptor-port/docs/undo-contract.md` §4, AM32) is first answerable.
Seen by the group-A FULL walk (W1 steps 7c–7h, `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`): the top bar's
↶ right after a publish (or a reissue) removes `weeks/<wk>:is:<verId>~<n>`, and its ↷ writes the same key again; an ↶ of an
Unpublish removes its `:rx:` row. His rulings say otherwise: **AM4** — an issued version is never erased; **AM32** — an
Undo of a published day IS an Unpublish (a retraction beside the issuance; the version under it current again). Known
since 24 Sep 26 as the amendment re-test's Q6 (`docs/handpass/2026-09-24-amendment-fable-scenarios.md` 5-10 — then in
memory only, "a rule/code gap for the database step"); group A made it a real row delete. Nothing on screen differs
(the day reads exactly as an Unpublish leaves it). **Do:** make the global undo's reversal of `sched.publish` /
`sched.publishAL` an Unpublish (a `sched.retraction` put, never an issuance delete), its redo a reissue (a new `~n+1`
issuance), and an undo of an Unpublish a reissue too — the Amendment rows then only ever grow; correct
`data-model.md` §5's "a row is removed only by … an Undo of a publish" in the same change (D201). Both reviewers' code
reads of group B cover it.

### [TRK-IMPORT-ONE-GROUP] A Tracker Import is saved as many groups, not one (filed 30 Sep 26)
**Place:** with `[DB-READINESS]` group B (one changeset per command on the wire). Seen by the group-A FULL walk (W5 C4, C5,
F1): ⇪ Import of a charts file wrote 7 rows in 9 change-log batches; a students file with a new course 11 rows in 6 —
every row named (since the walk's fix of its bookkeeping rows, W5 finding 1), but one confirmed action is many saved
groups, so a failure part-way leaves a half import stored — the very route his charts take to the database (D120:
Export → wipe → Import). **Do:** gather the import's reads first, then write everything in ONE Tracker gesture (the
delete-chart pattern, `core.js delSyl`) — one group, one batch.

### [TRK-FIRST-ORDER-PLACE] A stale tab can undo the first save of the chart order (filed 30 Sep 26)
**Place:** low — with group B's live refresh (which closes most of the stale window). Seen by the group-A FULL walk (W5
E5): on a store where no chart has a place yet (the shipped charts are stored at the Tracker's first opening without
one), the FIRST ⇅ Reorder syllabi places every chart; a second tab opened before it, adding a syllabus, places them all
again in its own old order — the first tab's order is lost (only the order; no chart, detail or mark). After the first
order save, every later one writes only the chart that moved (walked). On `main` a stale tab overwrites the whole order
every time. **Do:** give the shipped charts their places when the Tracker first stores them (its first opening), so the
first reorder writes only the chart moved.

### [TRK-UNDO-WRITES-DEFAULTS] The first Tracker Undo of a mark stores a pace, lulls and dates nobody set (filed 30 Sep 26)
**Place:** low — with the next Tracker change. Seen by the group-A FULL walk (W5 D2b, F2c; `scripts/handpass/dbrA-W5-probe3.mjs`):
a fresh world, one mark, ↶ — the undo writes `…:pace:<student>` = `{epw:2}`, `…:lulls:<student>` = `[]`, the chart's dates
record for him, and leaves his marks row as `{}` instead of removing it; later undos write only the mark. Nothing changes
on screen (the stored values ARE the defaults), but Export and the database gain records nobody made. Probably on `main`
too (the same undo snapshot, D372). **Do:** the undo's snapshot restores only what the step changed — a record the
student never had is removed, not written as its default.

### [SECDEFAULT-OFFER-BEHIND-BOARD] The "Set as default order?" offer after a section drag on the board is drawn behind the board (filed 30 Sep 26)
**Place:** low — with the next board change. Seen in passing by the group-A FULL walk (W1 G4,
`docs/img/handpass/2026-09-30-dbrA/W1/W1.G4-offer-hidden-behind-board.png`): the snackbar only shows once ✓ Done closes
the board. Not a storage matter; likely on `main` too (not compared). **Do:** lift the snackbar above the full-screen
board, with the bug-check order's §6 layering test (the element at its centre is the snackbar).

### [BLOCK-NO-HISTORY-LINE] Placing a duty block from + Block, or removing a medical document, writes no history line (filed 30 Sep 26)
**Place:** low — with the next change-history change. Seen in passing by the group-A FULL walk: a block placed (W1 G2c)
is saved (its day row, one batch) but the changes window has no line for it, unlike + Wave or + Line; a document removed
from a medical request (W2 13g) saves the request with no line. Probably old behaviour (not compared). **Do:** log the
block's addition as + Wave logs a wave's, and a document's removal as its addition is logged.

### [ACCOUNTS-SEED-FIRST-WRITE] On a fresh DEMO browser, one tab's first account change can undo another's (filed 30 Sep 26)
**Place:** low — demo only. Seen by the group-A FULL walk (W2 08a): a fresh browser, two tabs signed in before any account
changed; A suspends Hex, B (not reloaded) adds a person with a sign-in → after a reload Hex's sign-in is ON again. A demo
store holds no account rows until the first account write, which stores every account that tab holds
(`src/state/accounts.ts` — "no account row at all = the seeded list in memory"), stale ones included. **Cannot reach a
shared store:** there the first admin's account is stored at the first boot (phase 5.4), and the demo accounts never
exist; once accounts are stored, every save is exact (W2 08h: two admins adding at once — both kept). **Do (if the demo
should be exact too):** store the seeded accounts as rows in the first boot's group, as the roster's are.

### [SETTINGS-LIST-ROWS] A setting that holds a list (the templates, the rules, the stores) is ONE row — two admins at once, the later wins (filed 30 Sep 26)
**Place:** low — a stage-2 table split if squadron setup is ever edited by two admins at once. Seen by the group-A FULL
walk (W2 10e): two tabs rename two DIFFERENT duty templates; after a reload only the later rename is there — each save
rewrites `settings/dutytpl` whole. The plan decided it (§2.5: `settings/<key>` rows unchanged, "as today"; a variable list
stays JSON on its parent at stage 1 — Astra R2-01): setup is admin-only and rare, and the day lock does not cover it.
Recorded here so the choice is visible: wave, duty and day templates, the rules, the stores, the hidden wave types, the
Leave War's settings-like lists all behave this way — and so does a Leave War period (W3 finding 1: its stage, window and
events are one `war:` row). **On the database this is not silent:** the design refuses a stale write (`data-model.md` §9,
reject and reload — `If-Match` on every update; the `LeaveWar` row added to its table 30 Sep 26), so the later admin is
told and re-reads; only the stand-in store, with no row versions, lets the later write win. **Do (only if it bites):**
split the template libraries into a row per template (`WaveTemplate`, `DutyTemplate`, `DayTemplate`) — a table-shape
change, so tell IT first.

### [LW-OIL-DATECHIP-HIDDEN] The OIL tracker's correction date calendar opens hidden behind the rows above (filed 30 Sep 26)
**Place:** low — with the next OIL tracker change. Seen by the group-A FULL walk (W3 finding 3,
`docs/img/handpass/2026-09-30-dbrA/W3/I8-correction-date-chip-open.png`): open the OIL tracker, give Warden a −1
correction, tap its box, tap "📅 30 Sep 26 ▾" — the chip reads open but nothing is drawn; the day it would show sits under
another row's box, so a correction's date cannot be changed through the app. Not a storage matter; not compared with
`main`. **Do:** draw the calendar above the tracker's rows, with the bug-check order's §6 layering test.

### [SHARED-OPENS-DEMO-WEEK] A shared store opens on the demo's week (13 Jul 26), not this week (filed 30 Sep 26)
**Place:** before the first real deployment. Seen by the group-A FULL walk (W4 observation 2): on the shared-store build
the schedule opens on the week of 13 Jul 26 and the Inputs form's calendar on July 2026 — the demo's boot week
(`engine/waves.ts BOOT_WEEK`, set by `state/seeds.ts resetSeedWorld` under both policies). Nothing demo is stored; it is
where the screens land. **Do:** under the shared policy open on the week holding today (the demo keeps its week).

### [READONLY-WEEK-WORDS] A week read-only because a row will not read says "created by an older version … open it on the device that created it" (filed 30 Sep 26)
**Place:** low — before the database step's first shared use. Seen by the group-A FULL walk (W4 observation 1): a
hand-damaged day row makes the week read-only (correct), with a notice written for an older app's published schedule;
"the device that created it" means nothing once the store is shared. `main`'s read-only week says the same. **Do:** say
what happened and what to do in the app's words ("This week's saved copy could not be read — it is shown read-only. Ask
an admin.").

### [LW-LABEL-NO-DOOR] The Leave War's personnel label has no control on screen (filed 30 Sep 26)
**Place:** low — a question for him before building. Seen by the group-A FULL walk (W4 observation 4): the war stores a
man's personnel label (`leavewar/profile:<pid>` `label`, `setPersLabel`) and reads it, but no screen calls the setter,
in `main` or this build — a stored field no one can set. **Do:** ask him whether the label is wanted; if yes, give it
its door (the name sheet); if no, retire the field before IT settles `LeavePersonProfile`.

### [ELOG-LINE-AFTER-COMMAND] A history line worded from its action's result is still saved as its own group (filed 30 Sep 26)
**Place:** low — with group B (one changeset per command on the wire). The group-A FULL walk (H2) put every other edit's
line inside its own action's saved group — a line given just BEFORE its command opens is held and adopted by it, and
the board's structural edits now log first (`src/ui/board.ts`, `act`'s note). Left: a line whose words depend on how the
action landed, so it can only be logged AFTER its command — the OIL Earn switches (a man, an item, the day's blanket), a
plan switch (its "N differences pending"), a day template applied, a version loaded onto the working copy (its counts of
what was replaced or left). Each is its own saved group with its own batch (named, never bare), a moment after its
action's. **Do:** word the line inside the command (its latched effects see the result), e.g. `schedWrite(type, () => {
…; logAction(di, wordsFrom(result)) })`.

### [TRK-REMOUNT-LANDING] Coming back to the Tracker the chart lands at its top corner, or with empty chart above (filed 28 Sep 26)
**Place:** low — with the next Tracker change. Seen by the Tracker leftovers' walk, both walkers (walker a obs. 3 —
the same person out and in, the chart jumps from the centred first ball to the top corner, scroll 73 → 396, phone
36 → 352, `…/walk/lo-2a-D07b…`, `…-D07c…`; walker c — at 390 a reopened Tracker, centred on the last-marked ball, shows
~240px of empty chart above ST-01, `…/walk/lo-2c-e09…`). The existing remount drawing (App.jsx's ready effect redraws
without landing), not the per-person pick (D376). **Do:** land a remounted chart the way a pick lands it (the last
mark, else the first event), and check the phone's landing leaves no empty band above the first ball.

### [ADMIN-DISPLAY] An Admin "Display" area of per-section fold defaults — awaiting his go-ahead, do NOT build without it (moved from HANDOFF.md, 24 Sep 26)
**DEFERRED BY HIM (D161, 24 Sep 26): "next time we revisit this again"** — put it to him again when Admin or the
section folds are next touched. (Its first half — the wave show/hide toggle leaving Admin — was done 30 Aug 26.)

- **QUEUED, awaiting the owner's go-ahead — an Admin "Display" area (owner,
  26 Aug 26; do NOT build without his confirmation).** Remove the wave
  Shown/Hidden toggle (`WAVEHIDE`) from Admin → Squadron config and replace it
  with a "Display" category holding per-section open/collapsed fold defaults,
  set separately for View schedule, Edit schedule and the Scheduler board —
  generalising the `PIOPEN` fold idiom to every section.

### [USER-GUIDE] A user guide for users and admins — wanted, not started, not urgent (moved from HANDOFF.md, 24 Sep 26)

- **A USER GUIDE is wanted, for users and admins** (owner, 10 Aug 26). Not
  started, not urgent. The half that can't be worked out by looking at the
  screen is already collected in `docs/remarks-vocabulary.md` — **keep that
  file true as rules are added.** Still to gather: the day/AL publishing flow,
  the roles split, what each warning means in practice, the phone gestures.

### [DB-SYNC-MODEL] How the app shares and locks once it is in the database — his idea, to be designed now, built with the adapter (29 Sep 26)
His idea, stated as "just an idea" (not a ruling yet): *"a refresh to update button for all members. And if a scheduler
wants to edit a schedule for that particular day they have click edit for that day. This will block any other scheduler
from editing the schedule until the initial schedule is out of edit mode and the other scheduler can also see who is
editing. With the callsign - editing. For edit scheduler and schedule board mode. And the scheduler has to click on save
to save the changes … editing can be opened day by day or multiple days selected. Not sure how the rest of the app should
work for inputs, leave war, tracker … ideally if we can do like a google sheets/slide standard way of editing conflicts
that would be ideal."* **What exists:** `raptor-port/docs/data-model.md` §9 — a version check on every save (a stale save
is refused and reloaded), a stage-1 edit lease per WEEK (`editingBy` + `leaseUntil`, the holder shown, others read-only,
five minutes renewed on activity), stage-2 row merge (two schedulers on different rows of one day both land — the
Sheets-like step), and a change feed for live updates; **ANSWERED 29 Sep 26 (D355): lock by DAY (one or several chosen); freed after 30 minutes idle; an admin can take it over** **and SETTLED the same day (D356): idle = no change by the holder on that day for 30 minutes (a warning at 25; closing the page or signing out frees it); saved as you go with "Done editing"; others' changes arrive by themselves every 30 seconds while on screen (paused in the background; the Sync fast mode; a refresh button as a backup)** — left: the mock-up, §9 rewritten, the red team; the top bar's Sync pill ("Sync · slow", 1-second sync for
publishing / meetings) is the placeholder for it. **To decide with him (design now — it shapes the tables):** the lock's
unit (a day, or chosen days — his; the week — §9's); explicit Save vs saved-as-you-go while the lock is held ("Done
editing" releases); what frees a forgotten lock (idle time-out; an admin's "take over"); how others see changes (a
refresh button — his; automatic every few seconds through the Sync pill; both); Inputs, the Leave War, Quals and the
Tracker per record (a stale save refused, "Hex changed this — reload"), no lock. **Do:** a mock-up of the day lock on
Edit Schedule and the board, desktop and phone; §9 rewritten to his answers; both reviewers red-team it (a plan, D353);
hand it to IT with the tables. **Place:** with `[DB-READINESS]`, before the tables are settled (D354).
**29 Sep 26 — DONE on `claude/day-lock-mockup-data-model-493d27`:** (1) the mock-up, `raptor-port/docs/mock/day-lock.html`
(also an Artifact; pictures by `raptor-port/scripts/handpass/mk-day-lock.mjs`) — the lock strips on Edit Schedule and the
board, "Edit days…", the 25-minute warning, a take-over, the Sync menu, desktop and phone, with **six screen questions to
him** (a tap on a free day asks "Edit Monday?"; the board's ✓ Done frees the day or not; Undo on a day given back; no lock
outside the schedule; the Sync chip opens a menu; approve as drawn); (2) `data-model.md` rewritten to his answers — §9
the day lock (rules 1–10, the `DayLock` table), §3 a week stored as a week row plus ONE ROW PER DAY from stage 1, §11's
note, §12 Open questions 8 (a plug-in to make the lock strict) and 9 (how a member's input reaches a held day); the old
text moved whole to `raptor-port/docs/archive/data-model-2026-09-29.md`; `handover-dataverse.md` question 6 narrowed;
(3) the red team, both providers — brief `raptor-port/docs/superpowers/briefs/2026-09-29-day-lock-redteam.md`.
**THE DESIGN IS DONE, 29 Sep 26 — three red-team rounds, both providers, closed at his cap** (every finding and what
was done with it: `raptor-port/docs/superpowers/briefs/2026-09-29-day-lock-redteam-reviews.md`; his rulings on the way:
D450 the lock firm, D451 a change takes a free day, D452 Fast sync off after 20 minutes, D453 the order, D454 the
take-over asks first and keeps a saved plan). The design of record is `raptor-port/docs/data-model.md` §3 (a week row,
one `ScheduleDay` row per day carrying its lock, `PlanningPuck`, `DayRemark`, the per-day `Amendment`,
`AmendmentRetraction`, working and issued sign-offs, `TakeOverRequest`, `ScheduleInputPlacement` at stage 2), §9 (the
day lock, rules 1–13; the `ChangeBatch` change log), §11 (who owns each table's rows) and §12 questions 8–10 (for IT).
**Left, for the build of the lock (with `[DB-STEP]`, after `[DB-READINESS]` — D453):** his answers to the mock-up's
questions 1, 3, 4, 5 and 6 (question 2 answered, D451); the screens listed in §9 rule 13, drawn then; the §11 rows and
`src/state/perms.ts` for the new tables, together (the drift test reads every row — the `Amendment, Signoff` row renamed
then); the server-side check (a plug-in and Custom APIs — IT's, §12 q8); §12 q10 before any stage-2 table.
**The shape work it hands to `[DB-READINESS]` group A** is listed there.

### [DB-READINESS] Our side of the database, built against the fake database — before the tables are settled (D203; D354 — the step starts now; filed 26 Sep 26)
**D473 (1 Oct 26): THE DATABASE COMES AT THE END. Group A is built (phases 0–7, the last waiting on his look); GROUP B AND THE
LOCK'S SCREENS WAIT for the connection — no more readiness work until then. New features keep to the same saving route, and the
table list is updated with each.**
**SPLIT (owner, D453, 29 Sep 26): GROUP A — before the IT team settles its tables — (1) saving in small pieces, (4) never
seeding demo data, plus the design's shape work from `[DB-SYNC-MODEL]` (the schedule a day per piece, the single change
log, no week-deleting reconcile, the planning calendar's own records — and, from the design's red team: the command
layer's records per day (`sched.book`, `sched.mutes`), one changeset per command, and the day's effects worked out on
read instead of written into it — `data-model.md` §3 and §9 rule 9; settle §12 q9 with IT first); GROUP B — after the app is connected, tuned
against the real database — (2), (3), (5), (6), (7).** The requirements are `raptor-port/docs/data-model.md` §7 (from the 9 Sep 26 stress test; pinned as GAP tests in
`raptor-port/src/storage/dbreadiness.test.ts`). Ours to build now-able, none needing Manfred's tables: (1) **saving in small
pieces** — `inputs/all`, `people/all` and `leavewar/wars` are one record each, so two people editing different leaves
overwrite each other; one record per leave / person / war row; (2) **honest refusals** — a save the store refuses (signed
out, not allowed, someone changed it first) says so and stops, instead of retrying for ever (the top bar's "Not saved —
Retry" is for network failures); his look at the words first; (3) **a safe start-up** — a slow or half load says so, never a
blank app, never re-seeds demo data; (4) **never seed demo data into a shared store**; (5) a stuck record never marks the whole
app unsaved; (6) **two tabs of one browser** — each tab keeps its own copy of the store and the last save wins, so two tabs
open at once overwrite each other's work (every record; the change history's `elog` and `seq` too — `[DRAFT-PENDING]`'s red
team, Fable F10 / Astra DP-01, 28 Sep 26: declined there as the whole app's limit, filed here). (7) **load by need** (his question, 29 Sep
26 — "does it pull only the required data, so it is fast?"): today `loadAll()` reads every collection at start-up, fine in
one browser; against the shared store the first screen reads only people, settings and the week on screen (with the days
either side the crew-rest checks read), the Leave War and the Tracker read their own records when first opened, and the
30-second check brings only what changed (`data-model.md` §8 "Per-collection lazy load", §9 the change feed). Measured
against the fake database before the tables settle. **Group A's plan (30 Sep 26, red-teamed by both, three rounds):
`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`; D460 (Quals is the truth for SXO — the war shows it read only,
and cannot make anyone SXO) and D461 (the war's Edit person goes — seat, band and SXO change only on Quals) are built in its phase 3; the Tracker joins it (D462, phase 5b) and an empty real database starts the Tracker with no
course (D463).** With `[OIL-AWARD-IS-A-GRANT]`
and the small OIL follow-ups as ONE batch. **Tier:** FULL (saved data). **(1) in part, 29 Sep 26 (`[OIL-AWARD-IS-A-GRANT]`):
the ledger's COMMAND records are one per entry now (`lw.ledger/<id>`); its STORAGE is still one blob (`leavewar/ledger`)
— until phase 3.** **(1) BUILT, 30 Sep 26, on `claude/db-readiness-table-shaping-4094f6` (not merged): the schedule a day per
row (phase 1), the requests, the roster and the planning calendar a row each (phase 2), the Leave War a row per war,
record, ledger entry, opening and man's profile (phase 3 — D460 and D461 built with it: no Edit person on the war); the
change log — one `ChangeBatch` per saved group — the change history a row per line, each person's seen and the accounts,
requests and admins' seen a row each, and every Tracker save and its own Undo / Redo inside their command (phase 4).
**(4) BUILT, 30 Sep 26 (phase 5):** the boot policy (`src/bootpolicy.ts` — the demo by default; `VITE_SEED_DEMO=false` a
shared store), the boot in one function (`src/boot.ts`), frozen seed copies reset every boot (`src/state/seeds.ts`); a
shared store gets nothing demo — no requests, roster, weeks, accounts, Leave War world, Tracker course or pair (D463) —
and its first admin from `VITE_BOOTSTRAP_ADMIN` (person, account and stamp in one group, idempotent, failing closed);
the Leave War stands up with no war ("No leave period yet") and the Tracker with no course ("No course yet").
**(1) for the Tracker BUILT, 30 Sep 26 (phase 5b — D462, D464):** the course list and the deleted courses one row per
course, each course and chart's student list one row per enrolment, the charts one row per chart (definitions, names,
order, hidden, deleted) and the details typed on each ball one row per chart and ball — a save writes only the rows it
changed, so two people's work on two things never overwrites; a browser's old records are converted once at boot by the
fold's eighth converter (the store's format is now 6), every chart, layout and detail carried across (tested: his old
records read and export exactly as before). **Before its "merge live", remind him to EXPORT a copy of his Tracker first
(D464).** Still in group A: the FULL check is DONE (30 Sep 26 — the walk and both code reads, every finding fixed; the evidence sheet `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`); his look, then phase 6, then 7; the plan's §9 is the build log.** **Phase 6 (plan `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md`) is built now, (c) included, without waiting for IT's written answers (D465, 30 Sep 26 — "Carry on"; D466 — only work needing IT's confirmation is held, and (c) does not): (a), (b) and (d) BUILT 30 Sep 26 (a hand-over, an Unavailable filing and a delete write no day; a deleted man is read off every day from his cutoff); (c) redesigned after both reviewers' round 1 (plan v2); round 2 (Fable REVISE, Astra BLOCK) — (c) v3 needs a holder base (dispositions r2). **The FULL bug check of (a), (b), (d) DONE 30 Sep 26 (D467 — `raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`: the walk on both builds, both reads, every finding fixed or filed below). Next: his look (the card at its foot), then (c) v3 in a fresh chat on its own branch, its last review round, its build and its own FULL check.** **(c) v3 BUILT 1 Oct 26** on its own branch, `claude/db-readiness-p6c-holder-base` (D467): round 3 (Astra REVISE — 1; Fable REVISE — F1–F6; all folded into the build — `raptor-port/docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-dispositions-r3.md`), the build (the plan's §9), its FULL check next; `[OIL-RELINK-XWEEK]` closed by it.
**Found in phase 4, for phase 5b — FIXED 30 Sep 26 in phase 5b:** the
Tracker writes one person's syllabus pick (D376 — his own last chart, a per-person view choice) into the course's SHARED
plan record (`v3:<course>:plan` `sylId`, `src/tracker/app/core.js loadCourseNow`) whenever a course loads — in a shared
store, whoever opened the course last would move everyone's chart. The plan's chart pointer should be the course's, the
person's pick his own place. *(Fixed: a signed-in person's chart is read from and written to his own place only; the course's plan names the
course's chart, written at its creation, a repair, an import, or by the standalone Tracker — `trk-rows.test.ts`.)* **And for group B:** the Leave War's "which war is on screen" (`leavewar/current`) is saved
as shared data with a change-log batch — a per-person view choice (it is recorded, never honoured at boot — settled 7 Sep
26); move it to per-person or per-browser state when the app is connected. **And for group B, from phase 6's FULL check
(30 Sep 26 — `raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`):** (i) *the delete's read-time overlay grows with
the deleted roster* (Fable's final read, F2, low): `engine/overlay.ts overlayDeletedWeek` walks each day once per deleted man
and finds each landed row's request by a full `INPUTS` search, on every read of a week inside every keystroke's `validate()`;
a deleted man is never erased (D290). Measured ≈0.2 ms per `validate()` with two deleted (`raptor-port/docs/performance.md`
item 26). Fix when the 30-second check lands (it runs the same overlay on a day on screen — measure it there): filter the
cutoffs that reach the week once; one request index per call reading `r.iid` (never `inpId`, which mints on read); one
src → holder map per day, `hisLanded` over the same helper (so the version-load belt cannot drift); and memoise
`weekctx.ts bundle`'s overlaid seed on (week, `deletedSig()`). (ii) *A question for him, not urgent:* a delete writes its
"seat emptied" history lines for the week ON SCREEN only (the requests', bids' and awards' lines are written whatever week
is open — D337); pre-existing, not phase 6's. Fable's recommendation: leave it — the record of why (his "deleted" line, each
request's line) is complete; a seat line for every week to come could be made on read once the 30-second check exists.
(iii) *(c)'s after-command pass costs some 5–9 ms a command* (measured 1 Oct 26 against the build before (c), same machine:
an edit that changes nothing 69 vs 65 ms, on the board 92 vs 83 ms; a real edit and the board level —
`raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md` §Gates): `state/holderbase.ts rederive` compares each day of
the base as JSON and works the view out over a copy of all seven, at every scheduler command. Measure again with the
30-second check (it runs the same pass); if it matters, compare only the days a command named plus those whose requests
changed (`requestsSig` per day), and skip the view when neither moved.
**Phases 0–6 MERGED 1 Oct 26 (PR #476, his "merge live"; live on Vercel). Phase 7 — the small OIL follow-ups — BUILT and
FULL-checked 1 Oct 26 on `claude/db-readiness-p7-oil-followups`: plan and build log
`raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`, evidence `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`. Left: his look
and "merge live" — then group A is whole.**

### [IT-QUESTIONS] Talk to the IT side now — their approvals take weeks (his, not code; D203, filed 26 Sep 26)
The checklist is the primer's §7 (Artifact "Raptor Backend Primer"; its questions, kept here so they outlive it): code apps
switched on in our environment? a separate development environment? Dataverse available, Manfred owning the tables? a
developer ("maker") seat in dev? how people get in (a security group, security roles)? which connectors are allowed?
how work moves from dev to production, and who presses it? auditing and backups on, and how to restore? where settings and
secrets live? can server-side rules be plug-ins, and who may deploy them? **and: can our squadron admin set a person's role
from inside the app, or must IT assign it?** (decides whether "make Hex an admin" is one tap or an IT request). **And (D351,
28 Sep 26): how long is the change history kept (the retention rule)?** — it decides whether Admin → Data's "Clear edit
history…" follows that rule or goes; until then it stays as it is. **And (D356, 29 Sep 26): what request limit applies to
each person's app on our licences?** *(29 Sep 26: Microsoft's figure is 40,000 requests a person a day on the Power Apps
per-user licence, less on lower ones — which licence do our people have? Fast sync turns itself off after 20 minutes, D452.)* — others' changes arrive by a small check every 30 seconds while a page is on screen. **And (29 Sep 26, `[DB-SYNC-MODEL]` — `data-model.md` §12 questions 8 and 9): the day lock must be FIRM (D450): row ownership
plus ONE small server-side check (a Custom API or plug-in) that every change of holder and every save to a day goes
through — who writes, deploys and reviews it? How does a new admin join the "free" team? Please set
`ShareToPreviousOwnerOnAssign` false and every relationship from `ScheduleDay` Referential, Assign = Cascade None. And how should a
member's filed input reach a day a scheduler holds, when a member may not write the day?**
**ANSWERS FROM THE IT SIDE, 29 Sep 26 (his chat with them, shown to the OIL award chat):** IT will CLONE the repo and all
work moves to the new repo; he keeps working with his AI as now, but opens a PULL REQUEST there instead of merging — IT
reviews it and deploys it into the restricted environment after approving; minor changes consolidated into one pull request,
a major change its own; the Dataverse connection will add files to the code "for reference" (the tables' shape); it all
starts on HIS go-ahead to deploy. AI inside the restricted environment: only by opening the code in VS Code there and
connecting his own Claude subscription (Edwin). What this does to the workflow and the bug check: `[RESTRICTED-ENV-WORKFLOW]`.
**HEARD FROM THE IT SIDE, 30 Sep 26 (his words: "what i heard no plugin for now" — heard, not yet confirmed in writing):
no plug-in for now.** What it does: (1) `data-model.md` §12 q9 — nothing on the server can write a day, so a member's
input, a delete and a request handed on are worked out on read (§9 rule 9) with no alternative; `[DB-READINESS]` group A
no longer waits on q9's answer (its reporting half still goes to IT). (2) D450's firm lock was designed with ONE plug-in
plus SYSTEM Custom APIs (§3 ScheduleDay, §12 q8): row ownership alone still refuses another person's save, but a
take-over, freeing an idle day and telling two tabs of one person apart need another route — decided with the lock's
build (group B, D453), not now. **To ask IT:** is it plug-ins only, or also Custom APIs and Power Automate flows?
**Held until IT answers in writing (D466, 30 Sep 26): any piece of work that rests on one of these answers — name the dependency and hold it; work that does not goes ahead.** And (30 Sep 26 — he found it in his environment's Power Apps menu): are Dataverse **Functions** (Power Fx, marked
"Preview") allowed, and could one be the lock's small server-side check in place of a plug-in? Unverified that it can
refuse a save to a day or act for a take-over — ask, and check Microsoft's current documentation before relying on it.
**And (30 Sep 26, `[DB-READINESS]` group A phase 4 — `data-model.md` §12 q4, §9):** `EditLog.seq` is the store's own
rising number, assigned as each line is saved (until then the app orders the history by time and its own line id, and
"seen" and an account's `seenFrom` are positions in that order) — can they assign it? And the change log (`ChangeBatch`,
one row per saved change, naming the rows it changed — §9) needs change tracking switched on for that one table.
**And (30 Sep 26, `[DB-READINESS]` group A phase 5 — `data-model.md` §12 q11): the FIRST ADMIN of an empty store** — a build
setting naming his sign-in and his person (or a `Person` IT made) from which the app's first start makes his admin account,
or IT makes both rows; which do they prefer, where do app settings live, which value does sign-in hand the app (mail, UPN,
object id) and can the UPN differ from the mail? **And three the plan names for IT (§4):** a decimal `sortIndex` on `Input`,
`Person`, `LeaveBid` (order `(sortIndex, key)`); the app's own ids as unique ALTERNATE KEYS on every table (plus the design's
natural keys — a week's start, week + day, a remark's date, person + counter); `InputType` and `LeaveCounter` seeded by IT
from the app's shipped lists. **The whole list — 29 questions in four groups (A: before the tables settle; B: the day lock;
C: the design's other open questions; D: environment and process), each with its context — was given to him as a
copyable text on 30 Sep 26, to send to IT; record their answers here as they come.**
**ANSWERS FROM THE IT SIDE, 1 Oct 26 (told to him in person, relayed in chat the same day — heard, not in writing):**
(1) *Timing:* the app is about 60% built with a lot of function still to come, so do NOT worry about the tables and schema
now — do them at the END, or add to them as each new feature is created; IT's advice is NOT to put the app in the database
yet. (2) *Why:* once it is there, every change means telling IT, a pull request, IT's review (does it need a new table?) and
IT's merge; and no AI outside that environment can sign in to the app there, so bug checks become manual (as
`[RESTRICTED-ENV-WORKFLOW]` already says). (3) *Who writes the tables:* HE does, with his AI — the table format and data
schema, for IT to enter into Dataverse at the end. This reverses the 10 Sep agreement in
`raptor-port/docs/handover-dataverse.md` ("You design the tables"). (4) *What the platform offers today:* no plug-ins and no
Custom APIs; Dataverse functions work; Power Automate flows exist and can send a notification to a Teams chat group or to
named users — NOT to an app role (so "the schedulers" would be a Teams group chat he creates). (5) *The change history's
running number:* yes, the database can assign it (answers the `EditLog.seq` question above). (6) *A reading limit:* Dataverse
"can only read 2000 lines of the latest" — his words; whether that is 2,000 rows per read with more pages to ask for, or a
hard cap, is still to ask.
**What it touches, each waiting on HIS decision (asked 1 Oct 26 — the agent's advice: follow IT; group A is whole once phase
7 merges, group B and the lock's screens were always after the connection, so they simply wait):** D354 and D453's timing
("the database step starts now"); `handover-dataverse.md` §What we agreed and §What happens next; the day lock's server-side
check (D450, `data-model.md` §9 and §12 q8 — designed with one plug-in plus Custom APIs; with neither, a take-over and freeing
an idle day need another route — a Dataverse function or a flow — to design when the lock is built); the 2,000-row reading
limit against the Leave War's records and the change history (`data-model.md` §8 load by need). **DECIDED 1 Oct 26 — D473:
"Database at the end."** D354 is replaced, D453 and D203 narrowed in their timing, the handover note corrected at its head; the
lock's server-side check is redesigned when the lock is built.
**THE IT SIDE'S WRITTEN REPLIES, 1 Oct 26 (to the Tracker proposal he forwarded — one syllabus row shared by its courses, its
events and its drawing as JSON text in a multi-line column, marks per student; D474):** (1) *the format of the table list* —
"doesn't matter. Just make sure it's readable by a human"; (2) *the prefix and naming* — the publisher prefix is decided when
the tables are created; names can be anything that accurately labels what the table is for; (3) *the 2,000-row limit* — **per
request, WITH PAGING** (not a hard cap), so a large read is asked for page by page and filtered on the server; (4) *whether a
multi-line text column suits the two JSON columns* — he cannot say until he knows the largest chart's size. **Measured the same
day and sent to him** (`raptor-port/src/tracker/data/`, the four shipped charts): the largest has 212 events and 285 links;
its events are about 21,300 characters of JSON and the largest drawing about 33,200 — some 55,000 together, against Dataverse's
documented ceiling of 1,048,576 characters for a multi-line text column (to confirm in his environment). No objection was
raised to the proposal itself. **Was to ask (answered above):** an example
of the format he wants the tables written in (one table, his way), the publisher prefix and naming rule, and what exactly the
2,000 limit is.

### [LW-REQ-PICK-MONTH-UNSTEADY] The Required-panel browser test's month-button step failed once inside a full run — test-only (filed 8 Oct 26)
`raptor-port/e2e/leavewar.spec.ts` "several Required cells are picked with a drag and given one number, and the panel
leaves the grid behind it working" (lw-phone) failed once in the full gate run on `claude/inputs-sans-calendar`
(`a35fc26b`, 656 of 657): with the Required panel up it presses the second month button, waits for the grid to have
moved, then presses the first one at once — and the grid stayed on February (the 5-second wait for it to come back ran
out). Straight after: 8 of 8 alone, 40 of 40 run eight at a time, and green in a second whole run of the browser set
(657 of 657). The change that run was checking (D674, the Inputs list's landing) does not touch the month buttons or
the phone's window of months. The likely cause, NOT proven (it did not reproduce): the second press lands while the
first jump is still settling the phone's rolling window of months — the family of `[LW-WINDOW-PRUNE-FLAKE-2]`. **Do
(D87):** let the grid come to rest between the two presses (`settleGrid(page)`, the helper the file already has), not
a fixed time — and if it can be reproduced first, check whether a person pressing two month buttons quickly can leave
the grid on the wrong month. **Place:** test-only, low, any time; with `[LW-WINDOW-PRUNE-FLAKE-2]`.

### [LW-WINDOW-PRUNE-FLAKE-2] The month-window browser test's OTHER branch timed out once inside the full run — test-only (filed 30 Sep 26)
`raptor-port/e2e/leavewar.spec.ts` "the grid draws a window of months over year-wide placeholders, keeps every row aligned,
and draws in place" (lw-desktop) failed once in the full gate run on `claude/db-readiness-table-shaping-4094f6` (phase 4,
557 of 558): January was NOT drawn when its button was pressed, and the 5-second poll for December to leave the drawn
months ran out. The first fix (`[LW-WINDOW-PRUNE-FLAKE]`, archived 29 Sep 26) made the premise exact; this branch still
waits a fixed 5 seconds for a prune that happens only when the PC is idle (`state/idle.ts`) — a busy PC outlasts it. Alone
3 / 3 straight after; phase 4 does not touch the grid. **Do (D87):** wait on the idle signal or the window's settled state,
not a fixed time. **Place:** test-only, low, any time. **Seen again 9 Oct 26** (`claude/inputs-sans-calendar`, the final gate run after the shared input's date door — a change to the input editor only): the same branch, the same 5-second wait; alone 3 / 3 and its whole group 186 / 0 straight after.

### [PEEK-ISSUED] The desktop next-week preview on View-only Sched shows next week's working copy, even for a published day — a question for him (filed 26 Sep 26)
Noted by the sweep behind `[LEAVE-LATE-PUBLISHED]` (Astra, its plan read; carried in `[LATE-PUB-FACE-LIVE]`, archived
26 Sep 26): the peek of next week at the right of the desktop week (`raptor-port/src/ui/peek.ts`) draws next week's live
working copy, so on View-only Sched a published next-week day shows edits not yet issued. Astra recommends the issued
content there too, as the published face does (D178, D179). **The question:** should the peek show the published version
of a published day? **Place:** low; its own small WALK-tier build if yes.

### [TRK-ASYNC-STALE] Once storage is truly slow, a Tracker job must re-check its person and target after every wait (filed 28 Sep 26)
**Place:** with `[DB-READINESS]` — it cannot happen before the shared database. Found by Astra's final read of the
Tracker leftovers (ASTRA-02, ASTRA-04): a job that waits on storage and then acts — a person's place loading, + Add,
Remove, an undo; Delete course, Reset layout after their question — reads the LIVE person, course and chart when it
acts, not the ones it started with. Today the Tracker's storage answers at once without handing control back to the
browser, so no tap, sign-in or course switch can land between a job's steps (walked 28 Sep 26: under a 20× slowed
processor no press could reach the page mid-load). With a network behind it, one could: a sign-in during the last
person's place loading would leave their place on screen; a course switch landing under "Delete course 26ABSG?" would
delete the course switched to. **Do:** give each such job the person, course and chart it started with (Astra: a
counter bumped at every session end or load, captured at the start, checked after each wait — the import already does
this for the session, Fable's F6); `resumeForPerson` re-runs when the person changed while it loaded; a question's
answer acts only if what it named is still what is on screen, else says the selection changed. With a test on a
deliberately slow storage.


### [QUALS-PROTO-TOAST] The Quals page's "Save changes" says "prototype — writes to Dataverse in the full build" (filed 26 Sep 26)
Found by the Quals walker of `[LEAVE-LATE-PUBLISHED]`'s check (evidence `raptor-port/docs/handpass/2026-09-26-late-pub.md`
§4c): pressing Save changes toasts "Quals saved (prototype — writes to Dataverse in the full build)."
(`raptor-port/src/ui/QualsPage.tsx`, the Save button). That breaks his 25 Aug 26 rule that UI copy reads production,
never prototype (`raptor-port/CLAUDE.md` §Product bar): the database-era user would read "Qualifications saved". The same
on `main`; out of that branch's scope. **Do:** reword the toast; keep the prototype truth as a code comment beside it;
grep the app for other "prototype" / "full build" / "Dataverse" words on screen. LOOK tier. **Place:** low, with
`[QUALS-MEMBER-SCOPE]` or any time.

### [TRK-FLEXBAR-INK] The Tracker's Currency & Flex bars print white words on green and amber — hard to read (filed 26 Sep 26)
Found by the `[TRK-PALETTE-ASK]` walk (evidence `raptor-port/docs/handpass/2026-09-26-trk-palette.md` §7 F4). The bars
under Currency & Flex ("Current — no flex required", "1 Optional Flex", "Landing Current — No IP Required") are a
coloured fill with WHITE words (`tracker.css .flexbar{color:#fff}`; the fill comes from `app/core.js`'s flex and
currency functions). White on the green reads ~2.1:1 and on the amber ~2.1:1, against a floor of 4.5:1; the red 3.4:1,
the grey 6.2:1. **Not new:** before D157 the same bars read 1.9 / 2.2 / 3.7:1. **Recommended:** dark words (Raptor's
`--bg`) on the green, amber and red bars, white only on the grey — the recipe Raptor's own amber chips use; the functions
return an ink with the colour. A design choice, so his: it is question 4 on that branch's look card. LOOK tier.
**Place:** after his answer; low, none blocking.

### [DOC-POINTERS-CODE] Code comments that point at documentation moved in the spring clean (filed 24 Sep 26)
**Place:** ride the next change that touches `raptor-port/src` anyway — a pointer-only edit there starts the full
check run on his PC (D89, D151), which a docs pass must not do. Every one of these still LANDS today, through a
signpost or an index left at the old place, so none is urgent; each should name the new home directly:
- `raptor-port/e2e/leavewar.spec.ts:2387` — "BUG-TESTING.md #371" → `raptor-port/docs/archive/BUG-TESTING.md`.
- `raptor-port/src/engine/audit-d-keyspace.test.ts:279` — "HANDOFF §Known issues" → `HANDOFF-ARCHIVE.md` (the frozen
  4 Sep snapshot; `HANDOFF.md` §Moved says so).
- `raptor-port/src/engine/overnight.test.ts:2` — "docs/session-state.md" → `raptor-port/docs/archive/session-state.md`.
- `raptor-port/src/ui/html.ts:1180` and `raptor-port/src/ui/latemark.test.tsx:13` — "§Stable decisions" (the late-input
  mark) → `.claude/rules/decisions/scheduler.md` §Settled before this list.
- `raptor-port/src/ui/AdminPage.tsx:240, 283` — "HANDOFF" (the caveat; the parked Power Apps end state) →
  `raptor-port/docs/architecture-direction.md` §Parked direction.
- `raptor-port/src/engine/hooks.ts:72` — "the file map" → `raptor-port/docs/file-map.md`.
- `raptor-port/src/testing/refwin.ts:578` — "HANDOFF.md records the same trap" → `raptor-port/docs/gates-and-deploy.md`.
- Comments citing a §Stable decisions sub-heading by name (e.g. §Drag-reordering in `canonical.ts`, §Week navigation
  in `weekglide.ts`) land through `raptor-port/CLAUDE.md` §Stable decisions → "Moved to the area files", which
  keeps every old name; point them at the area file when their file is next touched.
Found by `git grep` on 24 Sep 26 (the spring clean's red team, Fable finding 10, Astra finding 11).

### [PERF-RESIDUALS] Speed wins measured and deferred — two are his call (filed 24 Sep 26)
From `HANDOFF.md` §In flight (archived 24 Sep 26): several speed wins are measured and deferred — the seven
day-strings sort, the JS-bound drop, hover-boundary repaints, the `body.dnd` decorations, the one `validate`
call; two are the owner's call because they change wording or feel. The ledger and each one's measurement:
`raptor-port/docs/performance.md` (Part 2; §Dead ends says what not to retry). **Place:** when a speed complaint
or a board change comes near one of them; put the two that change wording or feel to him first.

### [RULINGS-LF-PIN] Pin the rulings files to LF line endings, with the next change that runs the checks (filed 24 Sep 26)
A leftover of `[DOC-TRIM]` (archived 24 Sep 26). `.gitattributes` pins `OUTSTANDING.md`, `OUTSTANDING-ARCHIVE.md`,
`DECISIONS.md` and `HANDOFF.md` to LF ([DOCS-GUARD] F4, 23 Sep 26), so no script or editor setting can rewrite every
line of them at once — a whole-file diff is where a destroyed record hides. The rulings split (D137) added
`DECISIONS-ARCHIVE.md` and the area files under `.claude/rules/decisions/` — and, since D390, the full rows under `.claude/decisions-full/` — which are NOT pinned; all of them are LF
today (checked 24 Sep 26 with `git ls-files --eol`). Add them — a pattern for the folder covers a new area file too.
**Place:** ride the next change that starts the full checks on his PC anyway: `.gitattributes` is not on the deploy
workflow's docs-only skip list, so a change to it alone starts a full run (D89, D151), which a docs pass must not do.

### [DOCSIZE-MERGE-CEILING] The document check's ceiling rule fires on a MERGE of `main` that carried a ceiling move (found 29 Sep 26)
`npm run docsize` on `claude/small-fixes-batch-d223f6` (after `main` #464 was taken in) fails: "a ceiling in raptor-port/scripts/docsize.mjs
changed in commit 593c357e, which also touches raptor-port/src". 593c357e is the MERGE of `main` #459–#462; the ceiling moved on
`main` in the guide step's own docs-only commit (D391), and the merge merely carried it beside the Tracker's code. The rule
(`docsize.mjs` `ceilingMovedWithCode`) walks `git log BASE..HEAD -- docsize.mjs` and compares each commit with its FIRST parent, so
a merge reads as a commit that moved the ceiling with code. The same HEAD passed the Docs guard on GitHub (72cf61e7), so it did
not block the PR. **To do:** skip merge commits in that walk (`--no-merges`: every ceiling move is judged in the commit that made
it, on whichever side) with a self-test — in a docs-only change of its own, never inside a code PR (the gate is not edited to pass
the PR that trips it). **Place:** low; with the next document-gate change.

### [ITFLOW-OIL-RESHOOT] Re-shoot the IT flow guide's Leave War pictures once the OIL words change (29 Sep 26)
The IT flow guide (`raptor-port/docs/it-flow-guide/`, archived `[IT-FLOW-GUIDE]`) pictures the Leave War as it was on 29 Sep 26. The OIL
award chat (`claude/award-earned-vs-granted-2ed66d`, `[OIL-AWARD-IS-A-GRANT]`, D402) changes the war's OIL words ("earned" / "awarded")
and boxes, and said it would message when they change and when it merges. **To do:** after it merges, re-run
`capture.mjs` for `lw` and `ripple` (and `map`), rebuild the deck and PDF (the README's four steps), look at the Leave War slides,
send him the new copies. **Place:** low; **only when he says so (D403, 29 Sep 26 — "I'll tell u when to update")**. The OIL award
PR merged 29 Sep 26 (PR #469), so the change is ready to picture whenever he asks; fold in any other journey that changed by then.
**Also changed since the guide was drawn: the drag below zero now asks** (`[LW-DRAG-BELOW-ZERO]`, D418, built 29 Sep 26 on
`claude/lw-drag-flaky-tests-batch-c0719b`): the "Other ways to bid" slide's check line is already corrected in `scripts/itflow/content.mjs`
(it said the drag "can go below zero without asking") — the deck and PDF carry the old line until the rebuild he asks for.

### [LW-SEL-HALF-LABELS] The drag-selection sheet labels its half-day leave buttons in the stored notation — "FCL*" — where the one-day sheet shows "<FCL" / "FCL>" (filed 29 Sep 26)
Seen by `[LW-DRAG-BELOW-ZERO]`'s walk (picture `raptor-port/docs/img/handpass/2026-09-29-lw-drag-below-zero/D7-afternoon-beside-morning.png`):
with How much on AM or PM, the drag sheet's Which leave buttons read `*LL`, `LL*`… (`SelectSheet.tsx` prints `formatCell`),
while the one-day sheet's read `<LL`, `LL>` — what the box on the grid will show (`BidPicker.tsx` prints `displayCell`). D264 says
the two sheets share one format and one look. Not caused by that change (on `main` too). **To do:** print `displayCell(formatCell(…))`
on the drag sheet's chips, as the one-day sheet does, the write still speaking the stored grammar; a test beside
`movestandard.test.tsx`'s one-look checks. **Place:** low; with the next Leave War batch.

### [TRK-REFUSALS-UNTESTED] Some of the Tracker chart editor's refusals have no gate test (found 29 Sep 26)
Found by the IT flow guide's research into the Tracker (D414): no test in the gates drives → Connect or its refusals ("That link
would create a loop", "That link already exists.", "A link can't start and end on the same event."), nor Edit poke-ball's link refusals
("No such event", "cannot be its own prerequisite", "Those links would create a loop"), the course-name refusals (a name already
used, a colon) or "Keep at least one course." Each was seen working in the running app; only the proof is missing. **To do:** add them
to `scripts/tracker/smoke.mjs` (or `src/tracker/*.test.tsx`), one check each. **Place:** low; with the next Tracker batch.

### [PDF-PRINT-TWICE] Edit Schedule's "Export as PDF" asks the browser to print twice — the first time on a blank page (found 29 Sep 26)
Found by the IT flow guide's research (`[IT-FLOW-GUIDE]`), with the browser's print stubbed and each call recorded: one press of
`#exportPdf` prints first an empty frame (`about:blank`), then the report (`about:srcdoc`). The frame's load handler fires when the
blank frame is inserted AND when the report lands (`src/ui/printpdf.ts` `printSchedPDF`). Headless it is silent; in real Chrome a
blank print preview may appear first. **To do:** confirm it in real Chrome on the PC and on his iPhone (one press, how many print
sheets?); if real, print only once the report has landed, with a test that counts the print calls. **Place:** low; with the next
batch of small fixes.

### [APP-FONTS-NOT-LOADED] The app names its fonts but never loads them — every device draws a different one (found 29 Sep 26)
Found by the small-fixes PR's check on GitHub's Linux machines: "a flying line's callsign shows six letters whole" passed on
the Windows PC and failed there (W6LINE cut on the phone edit week). `scheduler.css` asks for 'Inter Tight' (the body) and
'JetBrains Mono' (times, codes), but nothing in the app loads either — no `@font-face`, no font link, no font package (searched
29 Sep 26). So each device falls back to its own system font: Segoe UI on Windows, San Francisco on an iPhone, Roboto on
Android, DejaVu on the Linux check machines. Measured at 9.5px bold (29 Sep 26): W6LINE is 35 (Segoe) / 34 (Roboto) /
36 (Helvetica, near San Francisco) / 43px (a DejaVu-width face); RANGER 38 / 37 / 41 / 45px — so a width "measured" in
`scheduler.css` holds on the machine it was measured on and may not on his phone. Every measured contract there (the
puck's 74px, the time boxes sized for "hh:mm" in JetBrains Mono, the callsign column) carries the same assumption.
**To do:** his call on the direction — ship the two fonts with the app (self-hosted files, ~100–200 KB, one look on every
device and every check machine; every measured width re-measured once, a wide visual change) or name a system font per
platform and measure on the widest. **Place:** his call; before the database step is fine.

### [ROW-NO-TIME-MARK] A "?" where a row has no timing or no end time (filed 29 Sep 26, D361)
**Owner, 29 Sep 26 (D361):** *"In the future I think there’s a ? Shown if no timing or end time is entered. As a future job
I think."* Today a row with a start and no end shows nothing missing on the row itself; only an ALL AVAIL on it names the
assumed hour, in the window its count opens (D360, D361 — a "~" on the count was mocked up and declined). A row with NO start
already makes its ALL AVAIL count a "?" (D360 (4)). **To do:** scope it with him first — which rows (programme, duties,
sims, ground; the flying line's times?), where the "?" sits (the empty time box, or beside it), what a tap or hover says,
and whether a published face prints it. LOOK tier. **Place:** low; a future job, his "as a future job I think".

### [UNDO-POSTING-RECORD] Undo for adding, archiving, restoring a person and for postings — the war's posting record (D350, 28 Sep 26)
Left out of the change-recording build by his "4 ok" (D350). All five write the Leave War's posting record
(`lw.postouts/all` — his stints, D308, D320), which the one undo cannot restore safely: `src/undo/timeline.ts`
`deferredCollections` holds it out (CMDLF-002, `[GLOBAL-UNDO]`), because restoring the record alone leaves the war's roster
windows as they were (`reprojectRoster` carries a person's window forward when he has no record, and `setPeople` re-records
it). **To do:** the global-undo design's §10.1 re-lay (`raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md`),
brought up to date for stints — a restored record laid over the clean projection inside `lwStore.write`; then lift the
deferral; then the restore checks a person's add / archive / restore needs (the one-callsign rule, a man added and since
used). A Delete stays dead (D287). FULL tier. **Place:** after the change-recording re-test; beside `[DB-READINESS]` if not
sooner — his call.

### [PHONE-WIDE-BOARD-BLANK] On a phone, the board's Desktop layout shows nothing below the sign-off (found 29 Sep 26)
Found by the change-recording re-test's picture check (`raptor-port/docs/handpass/2026-09-28-change-recording.md` §4), and
the same on `main` (measured on the live bundle): at 390×844, the board → ⋯ (on `main` the bar's own switch) → Desktop
layout lays the board out 1180px wide, but every section of the day (`.sb-sec`) is drawn 0px wide at x≈830, so below the
sign-off the screen is empty; the bar's buttons sit off to the right (pan sideways, as its bubble says). A scheduler who
picks it on a phone sees a blank day. **To do:** find why the sections collapse in the wide layout under 820px (the
phone's own grid rules probably still apply), then walk it at 390 and 844×390 with both layouts. WALK tier. **Place:**
medium; any time, none blocking.
4 Oct diagnostic on the unchanged workflow bundle confirms the first cause: phone
`display:contents` on the board wrapper survives Desktop layout's horizontal parent.
All ten sections are0px at390/820,832px at821/844 landscape; Phone layout restores346px.
At that diagnostic, candidate only: restore the wide wrapper's flex column, then
verify widths, actual panning and return/Done. No repair built or picture approved
in that investigation. Evidence:
`raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md` §Phone Desktop layout.
**D548, 4 Oct:** owner selected this repair only: "Just fix the desktop layout on
a phone. The rest don't fix it it's fine". Retain the existing Desktop layout,
sideways navigation, Phone return and Done. Candidate pictures and independent
plan challenge preceded the source edit. Repair built: only wide wrapper's
`display:flex`; original regression red then green; WALK26 inspected final originals,
10 section headers/8 real-row hits plus Available/SANS grid proof, native toolbar
touch pan, independent crew/schedule scrolling and Phone return/Done. Normal phone
and desktop geometry unchanged. Five repair gates/relevant checks and fresh Astra
read are in `raptor-port/docs/handpass/2026-10-04-phone-desktop-board-repair.md`.
Physical Safari/full-area touch and absent guest/issued fixture remain qualified.
**D549, 4 Oct:** owner accepts the delivered repair preview: "looks good, whats the next task".
Owner-look step passed, without device-specific Safari verification or broader UI approval.
Not main/live; item remains open for Claude's Monday read and authorized merge.

### [BUBBLE-SMALL-SEEN] Two small things about the message bubble, found by the change-recording walk (29 Sep 26)
Both the same on `main` (the Phase A pictures, taken on `main`, show them): (1) **Unpublish says nothing** — pressed on a
day, the day goes back as it should, but the bubble still reads the PUBLISH's words ("Published AL1 · 1 item on Sat only ·
approved by Anvil") for its few seconds, the opposite of what just happened (`a1/<w>/pub-09`). (2) **A bubble covers the
"Use this section order as the default for every day?" offer** — a section dragged within a few seconds of an Undo /
Redo shows the offer under the lingering bubble, hiding "Set as default" and, on a phone, "Not now" (`a1/phone/struct-19`).
(3) **A lingering bubble covers the changes window** — on a phone, an Undo / Redo's bubble still up when the window opens
sits over its first lines (`a2-rewalk/phone/lw-24`). (4) **An empty gold pill in an input's row** on the Inputs list, on a
phone, beside the remarks of a LATE leave the admin filed for himself in the member view (`a2/phone/roles-05`, the same on
the re-walk). **To do:** Unpublish says what it did ("Taken back: <day> — its changes wait on the working copy"); the offer
opening clears the bubble or sits above it; the window likewise; find what the empty pill is meant to hold. LOOK tier.
**Place:** low; any time.

### [HIST-PER-PAGE] A changes button on the Leave War and Quals, showing that page's changes — an idea, filed (D349, 28 Sep 26)
His question during the D347 mock-up: *"should i have a edit history button too for each page thats applicable"* — answered
not in the change-recording build, and filed on his "ok" (D349). Today the one changes window (Edit Schedule's clock, the
day counts) already lists inputs, Leave War decisions, OIL awards and Quals changes as lines on their day (D263, D338 (7)),
so nothing made elsewhere is lost; what a per-page button would add is a view FILTERED to that page's changes, where members
look (who approved or refused my leave, who changed my quals — D169's transparency). It would also need changes the window
does not record today (an account change on Admin, a rule on the Logic page) if those pages were included. **To do:** a
mock-up first (the Leave War and Quals first; Admin and Logic only if he wants them), then his word. **Place:** after the
change-recording re-test; none blocking.

### [AMEND-SMALL-SEEN] Small things the amendment re-test saw in passing (24 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — items 1 (a publish's messages joined; Unpublish says what it did), 3 (six-letter callsigns), 4 (the time's AL tag under the time; the arrow half answered by D275) and 9 (Sort keeps the sign-offs, on a published day too) built; item 5 (AL8's colour) answered: leave it (D362). **MERGED 29 Sep 26 (PR #463).** Items 2 and 6–8 stay with their own chats — this item closes with the last of them.
None breaks an amendment rule; each is a line to fix or ask about, from the walkers' reports
(`raptor-port/docs/handpass/parts/2026-09-24-amendment-w1.md` §5, `-w4.md` §6):
1. **Saturday's "Published AL1 · 14 items" toast** is replaced in the same instant by the OIL warning; the person only
   ever sees the warning. **Unpublish** says nothing at all (only the tag changes) — AM15b's principle would favour a word.
2. **Undo of a take-off time change** says "Undid: a note on the schedule" (AM39b: say what it did) — for the
   change-recording re-test, with [UNDO-ROSTER-SETTINGS]. **BUILT 28 Sep 26** on `claude/change-recording-retest`: a text
   command carries which box it wrote, and Undo says "a take-off time", "a day note" (`undo/describe.ts`).
3. **Five-letter callsigns** (VIPER, COBRA) drawn "…" in the edit week's callsign column; on the phone board they wrap
   ("VIP/R").
4. At 390px the solid **"AL1" tag** beside a time is clipped to "AL"; on the desktop week the **left scroll arrow** sits
   over the first sign-off pill of the leftmost day. **The same arrow also covers the left day's Unavailable type**
   ("ATT C") on the desktop week (the absence-record re-test's re-walk, W2, 26 Sep 26 — pictures
   `raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/w2/rw-w2-05-desktop-P4a-face`, `-P4b-working-copy`); one fix
   with `[VIEW-ARROW-OVER-LIST]`.
5. **AL7 and AL8** are the same orange; the register names no colour past AL7 (ask him if it matters). **ANSWERED 29 Sep 26 — D362: leave it.**
6. **Leave War, phone:** a man's figure sheet sends the grid back to 1 January, and it stays there after the sheet
   closes (desktop keeps its place). **Its sharper form (the absence-record re-test, W4, 26 Sep 26):** for a late joiner
   or a posted-out man, the jump takes his ROW off the screen — in January he is not in the squadron, so the row the
   admin was working on is simply gone (`raptor-port/docs/handpass/parts/2026-09-26-absence-w4.md`, the F3 note).
7. **Leave War bid sheet:** placing an LL bid on a weekend asks "That takes Fable to -1 ANNUAL", though a weekend LL
   charges nothing (his figure stays 0).
8. **A phone drag-off** removes a puck silently; right-click says "Fable removed".
9. **"Sort" on the ground programme** of a published day whose rows are kept out of time order moves them in the
   array without changing what is shown — and blanks the four sign-offs though "no changes to publish" (the final read,
   Fable #1's mirror; the digest keys ground rows by position). A false re-sign, never a false publish.
**Place:** any time; items 6–8 with the Leave War links re-test (D147, last).

### [POST-OUT-TRACKER] A deleted man and the Tracker's courses "still running" (D299 — approved, NOT built; filed 27 Sep 26)
D299 lists "his place on any course still running — goes". The Tracker has no notion of a course "still running", and the
build cannot decide what it means without him, so a deleted man is left on his Tracker courses, unlinked (his name as
text). **Put to him on the `[POST-OUT-OUTCOMES]` look card (question 5):** what makes a course still running — or leave
his name on his courses for now (then D299 is narrowed in his words). **Place:** after `[POST-OUT-OUTCOMES]` merges, on
his answer. Touches `raptor-port/src/tracker/` (its own store) — its own small check.
### [ARROW-GUTTER-STRIP] The day before the front one shows a 42px strip beside the ‹ arrow — MOOT (D275, the room taken out 27 Sep 26); one small leftover (filed 26 Sep 26)
The five-flags walk (W4, `raptor-port/docs/img/handpass/2026-09-26-five-flags/w4/GUTTER-prevday-tail-view-1440x900.png`):
the desktop week's 54px room ([VIEW-ARROW-OVER-LIST]) leaves the previous day's last 42px visible around the arrow (8px
on `main`). The look card's Q3: keep (it hints at a day to the left — recommended) or leave that strip empty — **mock-up shown
27 Sep 26** (his ask): `raptor-port/docs/mock/five-flags.html` §Question 3, keep / empty / fade — **ANSWERED "Q3 keep" (D273), then MOOT by D275:
the room comes out (`[ARROW-ROOM-OUT]`), so the strip goes back to 8px.** Still open, low — also from
the same walk, small: straight after a window resize a day can sit partly under the ‹ until the next press (a resize
never re-lands the week); "day a–b of 7" counts a third day that shows only ~212px at 1440. **Place:** his answer; low.

### [LW-SETTINGS-SMALL] Two small ⚙ Settings edges in the Leave War (filed 26 Sep 26)
From the five-flags batch (Fable's read F4, W2's walk): (1) Reset order judges "the default" over the WHOLE roster while
the grid draws only the men in the visible months, so a hand order that differs only for a posted-out man lights the
line while the grid looks default (a press clears it, harmlessly, with an Undo step); (2) an armed "Really reset?" (either
reset) survives a page switch while the sheet stays open. **Do, if wanted:** give `rosterFollowsDefault` the grid's window
predicate; disarm both on leaving the page. **Place:** low, any time.

### [GATELOCK-STALE-LIVE] The check lock is broken as "stale" on age alone — it nearly cut into a live run — low (filed 28 Sep 26)
Found by the small-fixes batch (28 Sep 26): its `gatelock.mjs run` was queued behind the Tracker-leftovers chat, which had taken the PC check lock by hand ~2 h earlier and was running its Tracker smoke under it. The waiter breaks any lock older than 2 hours (`STALE_MS`), and the pid in `owner.txt` is the `take` command's (gone at once), so nothing distinguished a live run from a dead one; the queued run was stopped by hand three minutes before it would have broken the lock. **The fix:** a heartbeat — the holder touches `owner.txt` while its work runs (`run` does it itself; a hand-taken lock is refreshed by `gatelock.mjs beat`, or by each suite it runs) and "stale" means no heartbeat for, say, 20 minutes; the owner file names the session, not the take command's pid. `raptor-port/scripts/gatelock.test.*` gains the case. Until then: ask the holder before a queued run reaches the 2-hour mark (D302). **Place:** low, any time — docs/scripts only; `shipping.md` §The checks describes the stale rule and changes with it.

### [PLAN-BANNER-DOOR] The preview banner's "Switch to this plan" has no screen route — low (filed 28 Sep 26)
Found by the small-fixes batch's walk (`raptor-port/scripts/handpass/sf/sf-f-banner.mjs`) while walking `[REQ-DOOR-WORDS]` 1, which made that button say the switch in the plans menu's own words. The button is drawn only on an EDIT surface (`html.ts`, `vsel`) over a PLAN preview ('d:'), and no screen reaches one: Edit Schedule's plans menu previews issued versions only and switches plans directly, View-only Sched's plan picker shows the plan's banner read-only (no Switch), and that preview does not carry over to Edit Schedule. So the button, its handler (`interactions.ts` `data-draftgo`) and the wording fix are reachable only by a test. **To decide:** retire the door (as `[LW-SPARE-MOVE-DOORS]` retired the war's unused move doors), or give it a route (a plan preview on the edit surfaces). Not a defect a person can meet today. **Place:** low, with the next change to the plans menu or the preview bar.

### [PO-RESTORE-POSTING] The Quals Restore clears a posting it did not make — low (Fable's final code read, N7, 26 Sep 26)
Unchanged `main` code, found by Fable's read of the absence-record re-test: `sync.ts restoreArchivedPerson` (the Quals
page's Restore) always clears the man's post-out, because a surviving past-dated posting with "Archive on PO date" on
would archive him again on the next pass. But a man archived BY HAND on Quals who also carries a posting the admin set
on purpose — a future date, or the custom "Archive on PO date" off — loses that posting on Restore, with nothing said.
Since the re-test the Post out's own archive is marked (`PEOPLE` body `archivedBy: 'po'`). **Build:** clear the posting
only when it made the archive (`archivedBy === 'po'`) or would re-archive him at once (switch on, date come); keep it
otherwise; a test per case. **Place:** low, with the next posting or Quals roster change; not his ruling.

### [LW-OFFER-ONLY-TAKEABLE] Two Leave War sheets offer a choice the war then refuses — low (the absence-record re-test's re-walk, W3, 26 Sep 26)
Found by the war re-walker on the rebuilt app; no record is harmed and each refusal is said, but the principle the
re-test applied elsewhere (item D, W5-F4: a half is offered only when it can be taken) is not kept here:
1. **A morning the WAR approved, then a tap on that day:** the bid sheet offers Whole day (already picked) and AM, and
   pressing LL is refused "That time is already taken by LL — clear it first." The same morning filed on the Inputs page
   offers only PM (the free half, `Matrix.tsx freeHalfBeside`, runs only for Inputs-filed leave — `raptorOwns`).
   Pictures: `docs/img/handpass/2026-09-26-absence/rewalk/w3/rw-w3-11-{desktop,phone}-A-whole-a-sheet`, `-A-whole-b-after-LL`,
   `-C-inputs-filed-sheet`.
2. **A refused bid under a medical filed since:** the tap list still offers Approve and Ack on it; both are refused in
   words that never name the medical ("Couldn't change that", "Couldn't approve — something else is on that time"),
   where the Undo / Redo road to the same state names it. Pictures: `rw-w3-10-{desktop,phone}-ack-b-after-press`,
   `-approve-b-after-press`.
**Build:** offer only the halves and decisions that can be taken, off the same question the door asks, and name the
blocker in any refusal that remains. **Place:** low, with `[LW-LOCKMARK]` (the lock by day vs by record is the same
root). Not checked against `main` by the walker; the free-half rule predates this branch. Evidence
`raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-w3.md`.

### [LW-HARNESS-VIEWER-PIN] In the Leave War browser tests, switching the role quietly undoes the pinned viewer (filed 27 Sep 26)
Found by the `[LW-MOVE-CI-RED]` investigation, confirmed in the running bundle: the test bridge's `raptorRole()` →
`setEffectiveRole()` (`raptor-port/src/state/auth.ts`) REPLACES the session object, and the viewer pin `lwSetViewer` sets
(`raptor-port/src/leavewar/sync.ts` ~1428–1430) is tied to that object — so after `lwRole('admin')` the next Raptor refresh
re-lights the signed-in man's row (`row-bane`) instead of the pinned one. Not the cause of the red Move tests (the fill
triggers no such refresh within 1.5 s), but a test that pins a viewer and then switches role is testing a different man
than it thinks. **Do:** tie the pin to the sign-in rather than the session object, or re-pin inside the bridge's
`raptorRole` (the bridge is the developer's PC only since `[ACCOUNTS]`); a test that pins, switches role and asserts the
pinned row. **Place:** low, test-only — with the next Leave War test change.

### [CI-FAIL-PICTURES] GitHub's browser-test jobs keep no pictures of a failure (filed 27 Sep 26)
The `[LW-MOVE-CI-RED]` investigation found NO artifacts on any failed run: `.github/workflows/deploy.yml`'s geometry jobs
upload no Playwright report, trace or error picture, so a red run on GitHub can only be read from its log. **Do, if he
agrees:** upload `raptor-port/test-results/` from the geometry jobs `if: failure()` (traces stay off — too slow on the Leave
War grid). **His call, because:** while the repo is PUBLIC (D106) anything uploaded is downloadable by anyone with a GitHub
login — the pictures show only the invented demo world (no real names — D58, D62), but it is publishing. **Place:** low —
ask him with the next change to the checks; the agent's recommendation: yes, once the repo is private again (D106's
"afterwards").

### [RULING-HOME-HOOK] Name the rulings whose home a file is, at the moment it is edited — OPEN (Fable's red team of [RULINGS-SLIM], 28 Sep 26)
**What:** once every ruling loads as one short line (D390), the guard that a chat opens the full row before acting on its
detail is a rule. Fable's stronger, structural form: a hook on Edit / Write that searches the full rows'
"Where it lives now" cells (`.claude/decisions-full/`) for the path being edited and tells the chat "this file is the home
of D320, D323, D328 — open their full rows first". **Open before building:** which hook event can put words in front of
the model without blocking the edit, and how to keep it quiet (once per file per session). **Context:**
`raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md` §2.8 and §5. **Place:** low — after
[RULINGS-SLIM] merges, if a chat is seen acting on a short line alone; put to him first.

### [LEDGER-READ-ASK] May a member see other men's OIL tracker entries and leave grants? — a question for him (filed 29 Sep 26)
Found by both red teams of the `[OIL-AWARD-IS-A-GRANT]` plan (Fable F5, Astra F10): the app has ALWAYS shown every member
every man's OIL tracker (grants and corrections — `OilTracker.tsx` lists every person for both roles) and every man's
figure breakdown with its itemised grants on every pool (owner, 17 Aug 26: "everyone should be able to click on that
person's name and see these logics"), while `raptor-port/docs/data-model.md` §11 — the table IT builds the database's
access rules from — says a member reads only his OWN `LeaveLedger` / `LeaveOpening` rows. The award build settles only the
award (every member reads every man's, D402 — its own row in §11); everything else in the ledger stays as §11 says, with a
note naming this gap. **The question:** should a member see every man's ledger entries (as the app shows today) or only his
own (as §11 says)? If "everyone", §11 and `state/perms.ts` widen; if "own only", the tracker and the breakdown hide other
men's entries from a member. **Also on the grid (the award walk, 29 Sep 26):** a day wearing a "+n" mark opens its day's
list for ANY member, as it always has — so a member can read another man's award reason, "Given by" and "Entered by" there
when that man's day holds two records (two awards, or an award beside his leave); a day holding just his one award opens
nothing (D261's "another man's award stays as today"). Same answer as the ledger's. **Place:** a question for him, before
the tables settle (D354).

### [RESTRICTED-ENV-WORKFLOW] Working and bug-checking once the app lives in the restricted environment (filed 29 Sep 26)
From IT's answers (`[IT-QUESTIONS]`, 29 Sep 26): the live app runs only inside the restricted environment, which this
PC's AI cannot reach; changes go to IT as pull requests. **What is lost:** the agent can no longer drive the REAL app on
the REAL database (the walk); a Vercel link per branch; seeing what only the real database does (security roles and
sign-in, request limits, network slowness, real data volume). **What is kept:** every change is still built and checked
here — the app reaches its database through ONE door (`raptor-port/src/storage/`), so a stand-in database behind that door
lets every gate and every walk run as today. **To do:** (1) a MOCK DATAVERSE backend behind the storage door, shaped from
the reference files the Dataverse connection adds to the code (its tables and columns) and behaving like it (a stale save
refused, the role rules of `data-model.md` §11, the day lock D355/D356, the 30-second refresh) — the walk runs against it;
(2) ask IT that those reference files live in the repo, and whether a separate development environment exists there;
(3) a short check INSIDE the restricted environment after each deploy (IT, or him with Claude in VS Code there) for what
only the real database shows; (4) the app says what went wrong in words he can copy out, so a fault seen there can be
rebuilt in the stand-in; (5) the shipping rules (`.claude/rules/shipping.md` — "merge live", the Vercel link, "done means
live") rewritten for pull requests to IT, on his word. **Place:** with `[DB-STEP]`, before the first deploy he approves.
**His questions, 1 Oct 26, and the advice he was given** (not rulings — his answers still to come): *"when its in the database, its
better for me to find bugs right?"* — yes for what only the database shows (two people on one day, the lock, slowness, real
volumes), but on a TEST copy IT provides, never the live one; the app's own rules are still found the same way, by walking.
*"should i put this in a database first or just continue working in my repo?"* — keep working here until phase 6 (c) and
phase 7 are merged (they decide the tables' shape), then give IT the go-ahead *(overtaken 1 Oct 26 by D473 — the database comes at the END, once the features are built)*; after the clone, work ONLY in IT's repo (one
copy on his desktop), never two. **To ask IT, with (2) above:** a test environment separate from the live one, with test data,
that this PC can run the app against (so the walk still runs); push access for branches and pull requests from his desktop;
whether the checks run on each pull request and whether a preview link exists; that IT's own changes (the connection files)
come back so the copies never drift. **Before the go-ahead:** the checks runner off this repo (`[REPO-PRIVATE]`, Astra SEC-101
— IT cloning it is a collaborator), and `[REPO-TIDY]`'s screenshot move.

### [REPO-TIDY] The folder is ~8 GB; the app ~14 MB of code and a ~2 MB built bundle (measured 1 Oct 26, his question)
**Where it goes:** ~6.2 GB `.claude/worktrees/` — the working copies parallel chats made and left behind, each a full checkout
with its own tools; ~1.2 GB `raptor-port/docs/` — mostly the walks' screenshots (`docs/img/handpass/`); ~0.9 GB the history
(`.git`, every screenshot ever committed in it); ~150 MB `node_modules` (build tools, never shipped). Not inefficient code.
**To do:** (1) clear the leftover worktrees — each checked first for unpushed or uncommitted work, only then removed
(`git worktree list`, then per worktree `git status` and its branch against its remote); (2) before IT clones the repo,
consider moving the walk screenshots out of it (and out of its history), or IT downloads ~1 GB of pictures with 14 MB of
code — put the choice to him with `[RESTRICTED-ENV-WORKFLOW]`'s go-ahead. **Place:** (1) at any clean point, a short job;
(2) before the go-ahead to IT.

### [GUIDE-MAP-ROWS] The guide's map table: its long rows to the full text too? — OPEN (the guide step, D391, 28 Sep 26)
**What:** after the guide step the project guide is ~9.5k tokens, not the plan's ~6k. Of what is left, the map table
(§Where things live) is ~9k bytes, its Leave War row alone 2.2k (left untouched for `claude/small-fixes-batch-d223f6`, D391),
then the Storage, Tracker, rulings, command-layer and architecture rows (~0.4–0.7k each). Moving their detail to
`raptor-port/docs/guide-full.md` would save roughly another 1–1.5k tokens in every build chat. **Open before doing it:**
`backlog-archive.mjs --move` puts a blank line before a block it lands, so a table row moved alone would not sit inside a
table there — either the mover learns to land a row under a table header, or each row's detail is moved as a paragraph.
**Place:** low; not a target (D141) — worth it only when the small-fixes branch has merged; put to him first.

### [LOAD-MSG-SHORT] The line shown after "Load onto working copy" is long — a shorter two-line version? — a question for him (filed 1 Oct 26)
**His question, 30 Sep 26** (on the group-A branch's look): what the long message after "Load onto working copy" was. It is
the one sentence that load writes to the screen AND to the change history (`raptor-port/src/ui/interactions.ts`, the
`data-restore` branch): "<day>: <version> loaded onto the working copy — viewers still see <version> until you publish ·
N unpublished edits replaced · N requests also cover another day — left as filed · N requests came back onto the programme
with their row — <days> read that too …" — each clause a real fact the load could not otherwise say (D98, D175, D363), so
none can simply be dropped. **Offered to him, unanswered:** a shorter two-line version on screen (the first line what was
loaded and what viewers still see; the second "N things to know ▾" opening the rest), the full sentence kept in the change
history. **Place:** low — his call; its own small job (WALK tier: a message on a shared surface), never inside another change.
Carried here from the merged `claude/db-readiness-table-shaping-4094f6` handoff block when it was removed (1 Oct 26).

### [VH-SHEETS-IPHONE] Other pop-ups sized by the screen height without the browser's bars — found 3 Oct 26, not changed
His find on the Insights preview (D536): on his iPhone the Insights window's title bar and ✕ sat under the address bar, because
a phone pop-up window's limit was written in `vh` — the screen WITHOUT the browser's bars. Fixed for every `.modal` window
(`src/ui/scheduler.css`, pinned by `modal-phone-height.test.ts`). **Left as they are, each to be looked at on his phone and
changed only if it can be cut off:** the airspace pop-up (`80vh`), the input picker's sheet (`75vh`), two menus (`70vh`,
`82vh`), the availability and changes windows (`62vh`), the calendar and notification panels (`calc(100vh − …)`), the document
viewer (`58vh`), the History bubble's list (`40vh`), and the Tracker's and Leave War's own stylesheets (not read). The short
ones leave room and nobody has reported them. **A line for the bug-check order, for its reviewers (D70 — not edited here):**
a surface pinned to a screen edge and limited by screen height is checked for the unit it is limited in (`dvh` or a `%` of a
fixed parent, never `vh`), because the check's browser has no address bar and cannot show the fault (§7.9). **Place:** low —
with the workflow UI pass (D495), or sooner if he meets one. Report:
`raptor-port/docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md` §His find.
4 Oct bounded investigation: tested portrait footers reachable; landscape editor,
day-details and document footers recover through native outer scrolling. No physical
iPhone bars/keyboard proof. Current inventory corrects the older list: the phone
people picker already uses100dvh, week calendar shares80vh, and the bell has no panel.
Availability lacks an existing count-chip fixture. Type-help60vh card has awkward
absolute placement; page/inner scrolling reaches its last text and outside closes,
so no trapped-panel claim. Keep open; change only a demonstrated problem after the
owner's picture look. Evidence: `raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md`.
**D547, owner iPhone check, 4 Oct:** picture 3's New input popup is not a problem;
he can scroll to its buttons. Withdraw the agent's pinned-title/footer proposal
and leave that popup unchanged. This does not clear other panels or unspecified
keyboard/browser-bar states; no app repair is filed for that recovered behaviour.
**D548:** leave these popup behaviours unchanged in this repair; only the phone
Board's blank Desktop layout is selected. The original observations are retained.

### [FEATURE-WISHLIST] Features he means to add — his list, not yet ruled or designed (2 Oct 26)
His words, 2 Oct 26, asking where new features fit in the order of work: *"1. Format of how the inputs are displayed to calendar
2. Caps & Ops limits 3. Insights to what type of mission each person flew 4. Training progress tracker graph 5. Workflow UI
changes — More to come"*. D512 now defines Insights' blue/red sortie categories; its picture and remaining choices are in
`[INSIGHTS-MISSION-MIX]`. The other features remain undesigned; what each means is asked when its batch is planned (the planning step's rounds of
questions) — never guessed. **The agent's proposed grouping, told to him, not ruled:** by area, each batch carrying the open small
finds of its area and one check for the lot (D485) — Inputs (1, with `[INP-TILL-STALE]`); Insights (3, with `[INSIGHTS-BOARD-DOOR]`,
after `[WORKSPAN-NEGATIVE]`); the Tracker (4, with its small finds); the rules (2 — a rules change, FULL tier); 5 placed once he
says what it changes (before the features that would sit on the screens it moves). **Place:** his call — waiting on his order.
**D490 (2 Oct 26, "Yes"): features first by area, each area's small finds riding with its batch, one whole-app check at the
end.** **Item 5, in his words the same day:** *"how the UI flows, to make it more efficient for the user, how does the keyboard
interact, how the mobile usage is done, moving of buttons etc."* — it crosses every screen, so it is planned as its own pass
with pictures first; where it moves a screen's controls, that screen's feature batch comes after it or carries it.
**ORIGINAL ORDER — D495 (2 Oct 26, "the batch order looks ok"); the D567 narrowing below is CANCELLED by D568:** (1) `[WORKSPAN-NEGATIVE]`; (2) Insights — item 3, with
`[INSIGHTS-BOARD-DOOR]`; (3) the workflow UI pass — item 5, `[CSS-SPLIT-BY-SCREEN]` its first step (D493); (4) Inputs — item 1,
with `[INP-TILL-STALE]`; (5) the Tracker — item 4, with `[TRK-FILE-TRANSFER-SPLIT]` and its small finds; (6) the rules —
item 2, caps and ops limits, FULL tier; (7) one whole-app check. **Who builds — D494:** until the reset (Monday 5 Oct 26,
19:00) Codex plans and builds, started by one small job to prove it (`[DISCARD-MARKS-REMOVE]`); **D496:** Astra plans/coordinates and independently reviews Sol 6.1's builds; Sol challenges Astra plans. Claude reviews each branch
after the reset, before any "merge live". Insights is built. D546 (4 Oct 26) defers the first two workflow recommendations
(D542/D543: build/correct a day first, phone quick checks/small edits first); he will introduce ideas during building.
D544's times/notes keyboard entry keeping Enter/Escape stays pending. The usability/file-split distinction has been explained;
no layout is approved. D545 adds [SCHEDULE-TAB-ROW-FLOW]; D550–D553 settle both surfaces, available boxes only, reverse Shift+Tab and final-day exit; D554 chooses B flight sequence after the shown comparison. D555 includes open headings/notes through displayed section order. Product scope settled; independent plan/challenge precedes source work. The other feature batches' questions wait.

**CANCELLED PRIORITY — D567, cancelled D568, 5 Oct 26:** owner requests a new chat for caps and ops limits,
ahead of Inputs and Tracker. The remaining order is caps/ops → Inputs → Tracker →
one whole-app check. This chooses the next batch; its policies and design still
need the owner. See [CAPS-OPS-LIMITS]; it does not accept the latest UI preview,
waive owed reads or authorize a live merge.

**Current direction — D585, 5 Oct 26:** Inputs/SANS calendar is on hold; preserve the completed preview and context. No more design/build/Claude vetting until owner resumes. Other outstanding tasks may be discussed; no new batch starts automatically. Existing D495 later order remains Tracker progress graph → caps/ops limits → whole-app check, with database connection at the end; this pause does not approve another build.

### [CAL-UNDO-OTHERS] Undo after another person's change: the refusal does not say who, and a holiday on another date blocks it (the calendar job's bug check, 8 Oct 26)
**Found, not fixed — REPORTED BY ONE WALKER, NOT YET SEEN BY THE HOST: reproduce first.** Walker H (X-10), `raptor-port/docs/handpass/parts/cal-H.md`, scripts `raptor-port/scripts/handpass/cal-H-*.mjs`, pictures `raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/H/x10-*.png`. (a) Saber files a meeting for three; a second admin changes its remark; Saber's Undo is refused with "A later change touches the same thing — undo that first" — D148 has the refusal say WHO; the same line for a holiday renamed and a Required cell retyped by the other. (b) Saber adds a holiday on 12 Aug, the other admin adds one on 19 Aug, Saber's Undo of his own is refused — a different date is not "the same thing" (a different Required day and a different group input DO undo cleanly). Likely place: how the Leave War's holiday commands name what they touch for the Undo's "changed since" test. **As filed:** medium-low — an Undo that refuses too readily loses nothing. The sheet: `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §7.

### [CAL-TOGO-ONE-ITEM] "To go out" lists a shared input as a line for each man (D663 reading 2 — the calendar job's bug check, 8 Oct 26)
**Found, not fixed.** Walkers G (X-01) and H (X-11): on a published day's "To go out" tab one meeting filed for three is three lines ("Ranger · Meeting", "Drifter · Meeting", "Ace · Meeting"); "All changes" and "New to you" show ONE item with the names under it (fixed in the same check — `ui/changesmodel.ts mergeFiled`). He was told the one item "holds on every tab" (D663 reading 2). The pending list is built by `ui/pendlist.ts`, which finds a line by its man; the count beside it stays per man by his ruling (reading 3). **As filed:** low — the list and its count agree; fold the men of one filing there as `mergeFiled` does. Also seen: after one man left a shared input, "All changes" titled the item "2 people" over three "added" names.

### [CAL-NOTE-WITH-PUCKS] A note in an opened day carries its own pucks; the separate "+ Pucks" button goes (his direction, D684 — 9 Oct 26)
**Ruled as a direction ("perhaps"), not built — a picture first.** His words, shown the day window with "+ Note" and "+ Pucks" in its bar (D683): "For the +note, perhaps just have a function to add pucks on the text written, instead of a +pucks button." **Today** a day’s planning sections are two kinds, each its own block and button (his asks of 22–24 Aug 26; `raptor-port/src/state/plan.ts` — a note is `{ id, iso, text }`, a pucks row `{ id, iso, kind: 'pucks', ids }`; drawn in `raptor-port/src/ui/InputsCal.tsx`, the month’s cell shows a note as words and a pucks row as small pucks). **The direction:** one kind — a note with words, people, or both; people are added on the note itself. **Before any build, put to him with the picture (one round):** may a note hold people and no words (so nothing a pucks row does today is lost); how the month’s cell shows a note with people; whether it is built before or after the calendar job’s "merge live". **What it touches:** what is saved for a note (`raptor-port/docs/data-schema.md`, `data-model.md` — so the check is FULL on the saved-data question), the people picker of the day, the three-across pucks grid and its swap / move / drag-off gestures, the drag that reorders sections, the month’s cell, Undo. The demo’s existing pucks rows need no carrying over (D56). **As filed:** medium; its own small job.

**THE PICTURE IS DRAWN AND WITH HIM (9 Oct 26 — his "Draw the note"):** `raptor-port/docs/mock/note-with-pucks.html` (also an Artifact, private: https://claude.ai/artifact/DrpirYQFv9kBTbhoxmAVQq), four pictures in `raptor-port/docs/mock/img/note-with-pucks/`, made from the built app by `raptor-port/scripts/handpass/mk-note-pucks.mjs` — today (a note, and a separate row of pucks), the direction (one "+ Note"; the note’s box holds its words, then its people, then "+ people"), a note with people and no words, and the month’s cell. **A drawing, not an approved design until he says so.** The three questions on it, each with the agent’s recommendation: (1) may a note hold people and no words — yes; (2) how a person is taken off a note — as today, dragged off or onto another to swap; (3) built before or after the calendar job’s "merge live" — after, as its own job. **Waiting on his answers.**

### [CAL-CHECK-SEEN] The small finds of the calendar job's bug check, none fixed (8 Oct 26)
**Found, not fixed** — each with its walker's report under `raptor-port/docs/handpass/parts/cal-<letter>.md` and pictures under `raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/<letter>/`. **A phone on its SIDE (844 × 390):** the number pad covers the Required cell being typed (B); windows lie over the top bar's Undo / Redo, the month's arrows and gear, and the failed-save band's Retry until dragged or closed (A, H); the SANS Highlight list runs off the foot (D). **Gestures:** the first tap after a finger-drag of a counter in Rearrange is ignored, the second works (B — one walker, not seen by the host); Escape pressed during a bar's mouse drag leaves the picked-up copy following the pointer until the next drag (E — one walker, not seen by the host). **Windows:** the "Calendar" window on a 568-tall phone is 588 tall once dragged and brought back, its last week cut (C); Escape on an opened day's Delete question, after a press on the page behind, closes the whole day (C); Escape does nothing while a control on the page behind has the keyboard (the shell's rule, as built — C); a settings window left open stays up when the page is changed (C); "Calendar…" from the SANS day at 1440 lands exactly over that day's window (A). **The editor:** after a bar's drag is undone the "changed while this window was open" note stays, with "theirs" equal to the value at opening (G); a reader's OIL row draws a "Change…" button that cannot be pressed (F); with the members' switch off the filer is told "Only <himself> — who filed it — or an admin can change this" and offered "Take me out" (F); a group's OIL question after a drag is titled with one man's name (F). **The List:** its row does not flash on Undo or Redo where a month's bar does (E). **Outside this job, seen in passing:** the Quals save toast reads "Quals saved (prototype — writes to Dataverse in the full build)" — a prototype caveat on screen (the 25 Aug 26 rule: UI copy reads production) (D). **As filed:** low, his to place; the sheet's §7.

**Added 9 Oct 26 (the look at D683):** Escape pressed while typing a planning note in an opened day closes the whole day, where it might be expected to leave only the note box — the window shell’s rule (Escape closes the window in front), older than D683.

### [GROUP-INPUT-ONE-ROW] On the schedule a group input is ONE row holding everyone (D661 — 7 Oct 26)

**Ruled, not built.** He chose picture B of the mock-ups (https://claude.ai/artifact/RU8YNk1gDXj8sddcWvA76b, drawn by `shoot10.cjs` on his PC): a meeting filed for four men shows on the Ground Programme as one row with four pucks, not four rows. **Today** every landed input is its own row with one man (`raptor-port/src/state/holderbase.ts`, `engine/overlay.ts viewOfWeek`), and the group input of the calendar job is kept as one record per man (the build plan `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.13) — so until this is built the schedule shows one row per man. **Its place — his ruling, D662 (7 Oct 26): its own job, straight after the calendar job, not inside it** (it reaches into how a published day counts changes waiting to go out: D109, D113, D114, D178). **Before it is planned, put to him with pictures (rounds of at most four):** a scheduler takes ONE man off the shared row, or cancels or re-times it for one man — does he leave the group, or does the whole input change; on a published day is a change to the row one change waiting or one per man; a man on leave that day — is his puck on the row flagged or left off; does the row show on Personal Inputs, on the Ground Programme, or wherever its men's rows would each have landed. **Then:** a plan read by Astra and Sol 6.1 (published records), built tests first, its own bug check or the calendar job's if it rides with it (D485).

### [TRK-DLG-FOCUS-UNSTEADY] A Tracker unit test of the question box's keyboard fails now and then in a full run (found 7 Oct 26)

**Found, not fixed** — by the Inputs / SANS calendar chat (`claude/inputs-sans-calendar`), which touched nothing of the Tracker. In a full unit run under the PC lock (7 Oct 26, 506 files, 8,186 tests) ONE test failed: `raptor-port/src/tracker/leftovers.test.tsx`, "[TRK-DLG-LEFTOVERS] B1 — while a question is up, the rest of the Tracker page is inert, and Tab / Shift+Tab stay inside the box" — its last check, "Shift+Tab from the first goes to the last", found the focus still on the text box. Run alone straight afterwards it passed three times out of three (53 of 53), and the full run of that morning passed it. **Seen again 8 Oct 26, night** (the same chat, step 5): the same check failed in ONE of three full runs that evening (9,293 tests), and passed alone twice. So it depends on timing or on what ran before it in the same worker, not on the app's rule. **To do, with the next Tracker batch (D490):** read how the test moves focus (a key event sent before the box has taken focus is the likely cause), make it wait on what it needs rather than on timing (D87's rule for browser tests, applied here), and run the file fifty times in a loaded run to prove it. Until then: a red full run whose only failure is this test is re-run once for that file, and said so in the report.

### [LW-HEAD-BIG-PHONE] Between a phone and a tablet the top of the Leave War is at its tallest — his call (found 8 Oct 26)

**Found, not changed** — while measuring for `[LW-PHONE-HEADER-SPACE]` (D678, D679). The Leave War calls a screen "a
phone" at 430px wide or less, and only there does the top become two lines. From 431px up to about 700px the page is the
desktop's strip squeezed: "Viewing as" on a line of its own, the Stage line wrapped over three — the grid's first row
354px down at 431 wide, against 182 on a phone and 222 on a desktop. **Who meets it:** the largest iPhones (the newest
Pro Max models are 440 wide — the agent's knowledge of them, not measured on one), a small tablet in a split view. His own phone's
picture showed the phone layout, so his is 430 or less.
**Why it was left:** D679 — "keep the same for desktop"; its reading (1) fixed "a phone" as the width the top changes
at today, and everything wider stays whole. Widening "a phone" is a new choice, and the grid below has
phone rules of its own at other widths (it opens one step out at 700 and under), which this would not touch.
**The question for him:** should a screen up to about 700 wide get the phone's two lines too? **Recommended:** yes, for
the TOP AREA only (one width in two places — `leavewar/ui/phone.ts PHONE_QUERY` and `chrome.css`'s phone block — and the
browser test's three sizes), leaving the grid's own widths alone; a picture first, drawn into the running build at 440
and 600 wide (D634). **Place:** his to set — small, the Leave War's own; it does not wait for the calendar job.

### [SKILL-OBS-REVIEW] Review the skill-observation backlog — he asked for it "soon" (8 Oct 26)

Told that the observation backlog had not been reviewed since 24 Sep 26 (about 200 open entries in
`.claude/skill-observations/log.md`), he said: *"Yeah we should review the skill soon too"*. **To do:** run the review as
its own job, in a fresh chat, documents only — the way this repo runs it is `.claude/skills/TASK-OBSERVER-VENDORED.md`
and the skill's `references/weekly-review.md`; a change to a working guide that comes out of it is read by Astra and
Sol 6.1 before his approval (D70), and merges only on his "merge live". **Place:** his "soon" — offer it at the next
handoff; it needs no code and can run beside the calendar job in its own worktree on `main`.

### [INPUTS-LIST-NEXT-YEAR] The Inputs list reads a next-year input as this year's (found 8 Oct 26) — OPEN, not started

**What was seen, in the running build (8 Oct 26, while writing the browser test of the Inputs list's Undo landing):** with
the list on "All dates", the demo squadron's OIL input for 15 Feb 2027 (the one the 2027 leave period carries) is shown as
"15 Feb" — no year — and sits between this year's 17 Jan and 2 Mar rows. Saved once through the row's own editor (only
its remarks changed) it then reads "15 Feb 2027" and moves to the foot of the list, where it belongs.

**The cause, read in the code, NOT yet reproduced through the Leave War's own Approve:** an input keeps its date as a
label and an anchor year (`yr`); the Leave War's approval writes the label WITHOUT a year and the anchor year beside it
(`raptor-port/src/leavewar/absences.ts isoToInputDate` / `inputRowFor`), and the list orders its rows by the label alone
(`raptor-port/src/ui/InputsPage.tsx SORTKEY.start` / `.end` — `unfmt(r.date)`, never `r.yr`). So a leave approved on a
NEXT year's period would be listed among this year's dates, without its year, until someone edits it. New data, not only
the demo's — which is why it is filed and not left under D56. The schedule and the Leave War read the anchor year and
are right; whether the list's date window ("Next 2 weeks") also misreads it is to check with it.

**To do:** reproduce it first through the app's own controls (make a 2027 period, approve a leave on it, open Inputs →
List → All dates); then order, print and window the list by the label WITH its anchor year (`dateOrd(r.date, r.yr)` is
the app's one reading of the two); a test first. **Its place:** with step 5 of the calendar job — the Inputs calendar —
which rebuilds the Inputs screens and keeps the List behind one switch (D490: an area's small finds ride the batch that
touches the area). Not a fault that harms a published record or OIL: the input itself is right.

### [LW-WINDOWS-NONBLOCKING] The Leave War's other windows: stay up, and let the grid behind them work (D641, D642 — 7 Oct 26)
Every Leave War window blocks the grid behind it and closes on a click outside (`src/leavewar/ui/Sheet.tsx`). D641 asked that the
windows of the Inputs / SANS calendar job drag and leave the page behind usable, and D642 brought ONE existing war window into line
inside that job — the panel for a picked block of people's days (`SelectSheet.tsx`). The rest keep today's behaviour: the one-day
sheet, the day's list, the Event sheet, the counter form, ⚙ Settings, the Manning explainer, the OIL tracker, Remarks, the war sheet.
**To do, as its own job with its own check (bids and OIL are behind these windows):** decide with him which of them should stay
up, then give each the non-blocking form built for the calendar job; an outside press that today cancels a move (D262) is a ruling
to re-read first. Not started. Depends on `[SANS-COMMITMENT-CALENDAR]` shipping the non-blocking form.
**8 Oct 26 — the form is BUILT on `claude/inputs-sans-calendar` (not merged):** `Sheet`'s `modal={false}` (no veil, no close on a
press outside, no Tab trap) and `ui/gridclick.ts` (a plain click on a cell closes the panel for that cell's own sheet); the
people's-days panel uses both (`raptor-port/docs/ui-contracts.md` §The page stays fully usable behind an open sheet). What this
item still needs is his choice of which other windows stay up, and their own check.

### [SANS-COMMITMENT-CALENDAR] Inputs and SANS calendars — CALLED BACK 7 Oct 26 (D614), Opus 5.5 builds from here (D615); was ON HOLD D585; built preview/evidence preserved (5 Oct 26)
**8 Oct 26, night — STEP 4, THE SANS CALENDAR, IS BUILT (seven pieces, each its own commit, pushed for his look):** the SANS
tab is its own screen — the month on the one resolver, the day's window, Highlight, the gear's settings, "How this works"
— and the first build's SANS store, command and controls are gone (the plan's "AS BUILT" note under §3.5; the contract:
`raptor-port/docs/ui-contracts.md` "The SANS calendar"). **Still to build:** step 5 (the Inputs calendar — tabs, bars, the
gear, the editor as a window, who placed it on the other lists, the group input's screens) and step 6; then the job's ONE
bug check, FULL. Where it stands: that branch's block in `HANDOFF.md`.
**7 Oct 26 — where it stands now (the job's own chat, `claude/inputs-sans-calendar`):** the live version is brought into the
calendar work on that branch (the failed-save band, D587, sits under the calendar's bar). **Owed before any "merge live":**
Opus's own read of what Codex built (D615 — its finds fixed, each with a test that fails first); his look at the design, which
he has NOT accepted (D583, D584); his answers to the open product points; the walk of the running app, sized first (D607, D608);
Astra's and Sol 6.1's reads of what Opus adds. The current state and the next step: that branch's block under `## Now` in
`HANDOFF.md`. Everything below is Codex's record of 5 Oct 26, unchanged.
**His picks and new points, 7 Oct 26 afternoon (D626–D629):** lined-up columns in the first set's own colours (D630 — the
deeper tints tried in the second set were too much contrast), three slimmer tabs, bars, the rest as drawn (D626); a day is day flying, night flying or no fly — NF needs nobody and shows "NF" — and
PH and Off days show on both calendars from the Leave War's own record (D627); the late cut-off as days or as a weekday of a
week before, stated in "How this works" (D628); who placed an entry and when, in small print (D629). Three questions are back
with him, drawn in the second mock-ups (D630 settled the colour): where the cut-off is set, one door or three, a SANS-needed row on the Leave War.
**The baseline is set once, not day by day (D631, 7 Oct 26):** a day is day flying unless night is selected; no-fly days can repeat
from a date onward; the year's holidays in one list; drawn as ONE home, "Days" (normal week, holidays, month), the one-day sheet
kept as the quick door. **D632:** a denser desktop Inputs month, drawn for him to pick.
**No normal-week view (D633, 7 Oct 26):** the month carries a select button on every day (Day / Night / No fly), the weekday's
heading sets every such day from a date onward, and the required pilots and WSOs are set on the Leave War's columns (a figure can
run "from this day on"); PH and Off days in the Holidays list, No Leave on the Leave War's Event row — drawn in the fourth mock-ups.
**The Leave War's Event sheet stays as built (D634, 7 Oct 26):** colours, tags, "Edit types", a day or a range — nothing of it is
redrawn or removed in this job.
**The settings icon is a gear, never like the day-flying sun (D635, 7 Oct 26).**
**The required figures are typed straight into the Leave War's cells, several picked by a drag and given one number (D636, 7 Oct 26)** —
drawn on real pictures of the Leave War in the fifth mock-ups (7 Oct 26).
**His answers on the fifth set, 7 Oct 26 (D637–D640) — the design is settled but for two small readings:** the typed rows are Required P
and Required W, the four rows (those two, Available P, Available W) sit under the Leave War's Event rows, a figure can run "from a
date on" skipping weekends, public holidays, Off days and no-fly days, and there is no "SANS needed" row (D637); a phone date carries
one stepping button and a desktop date three, three choices are enough (no "day and night"), a weekday's heading sets repeating days,
a public holiday and an Off day each have two doors onto one record and No Leave is on the Leave War only (D638); the late cut-off is
behind each calendar's own gear, the Logic page lists both, a cut-off is the end of its day, and the desktop Inputs month is compact
with no switch (D639); the two Available rows are ordinary Leave War count rows an admin can rename and re-define — leaving out OCU,
say — and the SANS calendar uses whatever they count (D640). **Every pop-up window drawn for this job drags, and the page behind it still works — a click outside does not close it (D641).** **Weekends start with no flying set; a no-fly day still shows and takes OFT and AMT; the war's panel for picked people's days is
brought into line with D641 in this job (D642). The Event sheet is to be made plainer and a long event name shows as a short form that
opens at a click — a mock-up first (D643); the drawing in fewer words, its first row "Presets", not "Type" (D644). **The group input's three later answers (7 Oct 26, evening): a member never files SANS availability for another man, an admin may for several (D658); the "Several people" picker has a fourth heading, "Personnel", where the roster holds ground crew (D659); whoever files for other people answers the OIL question for all of them at the save (D660). And in the changes window a group filing is ONE item with its people listed, built in this job (D663); on the schedule it is one row holding everyone, built as its own job straight after — `[GROUP-INPUT-ONE-ROW]` (D661, D662).** **"How this works" is cut to five short lines, no worked example (D646).** **On the SANS day each committed person is the schedule's own puck, his CAT chip attached, all one size, in proportion with the row's letters, wearing the SANS purple edge (D647, D649, D650, D651).** **The Holidays list's "Add a day" form carries the short form too (D652).** **On a phone the Inputs month fills the screen's height with thin bars and fits any phone's height (D653).** **HE ACCEPTED THE DESIGN AND GAVE THE GO TO BUILD IN THE NEXT CHAT (D657).** **An input can be filed for a group of people at once, by an admin and for now by a member (D654) — it changes who may file for whom; a member only duties and commitments, one shared group input, the man, the filer and an admin may change it (D655); the picker is a hybrid — one person from a list by default, a "Several people" switch showing compact pucks in three groups, Pilots, WSOs and SANS, each A to Z (D656); NOT in the plan yet — an add-on for both readers first.** **The opened day lists everyone and scrolls, no "+ more"; not full screen, but it pulls up on a phone (D648).** **TAKEN, "yes to all" (D645): built as redrawn, short forms on the grid, each preset with its own (PH, OFF, NL, SC) — the plan's §3.12, to both readers as an add-on first.** **The build plan (7 Oct 26, nothing built):** `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` — with Astra and Sol 6.1 for one round of challenge each, blind (D590; the brief: `raptor-port/docs/superpowers/briefs/2026-10-07-inputs-sans-redesign-plan-challenge-brief.md`); its section 8 holds what is still with him. No build before both have read it.
**In this job's bug check (D624, 7 Oct 26):** each approved mock-up is set beside a picture of the built screen at the same size, in
the evidence sheet.
**HIS DIRECTION, 7 Oct 26 (D617–D621) — the design changes; mock-ups first, nothing built before he picks:** each SANS date
shows pilots / WSOs — still needed to fly, and SANS committed to F, O and A; still needed comes from the Leave War's pax
required, less those available, less the SANS committed to fly (D617 — the pax required figure is NEW on the Leave War, kept as
two figures, pilots and WSOs: D622); three
colours, yellow / amber / red, set from a settings icon (D618); a Highlight picker rings one SANS person's days in cyan (D619);
the layout — Medical, the SANS calendar and the Inputs calendar from one place, Inputs keeps its List, SANS availability
leaves the List for the SANS calendar (D620); ideas to draw — Google-style bars, drag a range, an Instructions fold, the
keyboard (D621). The design note: `raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`.
**D585:** owner puts this task on hold before choosing other outstanding work.
Pause further design, building and Claude vetting until explicit resume. Keep
the existing branch/Ready preview, settled requirements, recommendations and
all evidence/owed reads. No cancellation, main authority or new batch inferred.
**D583 delivery:** show finished desktop and mobile mockups from the actual preview,
then bring to Claude for vetting. No owner design acceptance or main authority inferred.
**D584 handoff:** explain owner intent, original references and settled answers;
separate agent choices and invite fresh independent critique of how to tackle it.
Home: `raptor-port/docs/handpass/2026-10-05-inputs-sans-claude-handoff.md`.
**Current corrections D581/D582:** show F/Fly, O/OFT and A/AMT unique-person
availability counts on every SANS date; flying-only target/shortage remains.
Compact Inputs entry/header delegated addendum and independent challenge:
`raptor-port/docs/superpowers/plans/2026-10-05-inputs-sans-header-counts-addendum.md`
and `raptor-port/docs/superpowers/plans/2026-10-05-inputs-sans-header-counts-sol-challenge.md`.
Simplify the cluttered phone Inputs entry/header through Impeccable, retaining
the existing mode/view/Medical/filter/export doors. Recommended compact layout,
pre-source phone/desktop pictures and independent plan challenge precede these
additions. Original R2 remains frozen on the old build; new code's independent
Claude read after reset is owed before main, no third Astra inspection inferred.
**Build status:** Calendar-first Inputs with Member/SANS modes and secondary List,
shared day/editor and date-range gestures, admin daily Fly demand/manual day/night
intent and global amber1/red3 deficit cutoffs built on `codex/inputs-sans-calendar`.
Independent plan/challenge and private pre-source pictures complete. FULL evidence:
`raptor-port/docs/handpass/2026-10-05-inputs-sans-calendar.md`. A final picture walk
caught a hold-release date change; fixed after failing proof. Corrected-build
gates and31 independent runtime groups PASS on the earlier snapshot. Fresh Astra
R1 found three save/reveal orders; corrected with failing-first tests. The rewalk
also exposed a restore-before-data-replay error; corrected directional metadata
and primary restored-row selection. Final independent runtime50groups PASS with
seven actual showcase states; all42 original pictures personally opened/hashed.
Corrected final gates unit7810/494files, browser570/49existing skips, six adapted
156assertions and performance4/0 PASS on that older snapshot. Final Astra R2
CHANGES REQUIRED (one P2 colour-popup dismissal/Escape defect), immutable2of2.
Corrected capturing outside press/Escape/focus/role cleanup; no third Astra code
read. New D581/D582 header/counts plus popup correction: focused72unit,
11production-browser/build PASS; independent expanded34runtimegroups PASS,
all25 original pictures opened. Two original harness errors preserved/corrected
(native all-date seed rows; hidden phone role badge), no app defect established.
Current Freeze13 has identical18served assets to walked Freeze11/12; one CSS
source CRLF→LF byte normalization only. Final new full gates PASS: unit7819/494,
browser572PASS/49existing skips/0FAIL, adapted156/performance4/reference728/
Tracker445; build/rulecheck/whitespace PASS. Final expanded
code's independent Claude read after reset remains owed before main.
Owner look/Claude reads/explicit
merge remain owed. Existing per-browser backend; no shared database is delivered.
D570–D572 settle flying-only demand, deficit-based admin-editable red/amber baselines and one count/person with hours visible. D573 initially deferred placement; D574 asks for recommendations, D575 requests app-style pictures/Claude review, D576 considers secondary List, D577 sun/day and moon/night flying. D578 held build; D579/D580 supersede that hold and delegate choices/build now. Monthly calendar shows the resulting flying-offer shortage.
Members open a day to see others' commitments and add their own. Form follows the
fourth private reference/current app availability controls, with Custom start/end;
Remarks has no faded placeholder. References1/2 supply month/day direction,3 is
contrast only. Remaining numbers/boundaries/config scope and day-list/navigation choices are delegated by D580; explain them in the plan rather than waiting for another answer. Existing timing/edit/delete/overlap
behaviour retained, not re-asked. One short offer counts once, not full-day coverage.
**Home:** `raptor-port/docs/superpowers/specs/2026-10-05-sans-commitment-calendar.md`.
**Independent initial read:** `raptor-port/docs/superpowers/plans/2026-10-05-sans-calendar-initial-read.md`; first round answered D570–D573 (flying demand, deficit colours, unique people with hours, location deferred). Concrete Astra plan/pictures and Sol challenge completed before source work. No new unseen picture acceptance is inferred; D580 supplies recommendation-based build authority.
**Place:** replacement current build task after D568 cancels caps/ops handoff;
no new chat requested. Other feature batches remain outstanding. Picture/plan and
independent challenge precede source work; calendar request/count/permission and
published consequences retain applicable FULL checks. All old Claude reads owed.

### [CAPS-OPS-LIMITS] Caps and ops limits — handoff CANCELLED D568, remains unbuilt (5 Oct 26)
**Current — D568:** "nvm i will do something else." Stop the immediate handoff; no new chat created, no replacement task chosen. Wait for the owner. The following D567 design-start draft is cancelled history, not current authority.

His words: "lets handoff to a new chat and i want to do the caps and ops limits".
Move this batch ahead of Inputs and Tracker; both remain outstanding. Begin with
his meaning and examples, after searching existing rules, in product-question
rounds of at most four with recommendations. No cap value, counting period,
applicability, exceptions, severity or publication policy is yet chosen by D567.
**Home/design start:** `raptor-port/docs/superpowers/specs/2026-10-05-caps-ops-limits.md`;
entry and all previous checks/owed reads in own `HANDOFF.md` workflow block.
**With this batch:** [REST-FIRST-CREW-HINT] and [SANS-PREVIOUS-REPORT-OFFER], retaining
their unresolved policy/repair boundaries. Source work waits for agreed product
scope and an independently challenged plan; rules changes are FULL tier.
**Place:** unbuilt backlog under original D495; immediate D567 priority/handoff cancelled D568. No batch starts automatically. Previous builds remain separate for review; no main/live authority.

### [SKILL-FUSION] Fuse the harder questioning into the planning step — and three proposals from the same read (D486, 2 Oct 26)
From the article he sent (codelynx.dev — five recommended skills): none is installed whole (D486). To build, documents only: the
planning skill (`.claude/skills/brainstorming/SKILL.md`) gains the decision tree, the rulings search first, questions by ROUNDS of
at most four with a recommended answer each (replacing "one question per message" for him), product choices only, and "done
means no branch left assumed". **APPROVED by him as Astra changed them (D489, 2 Oct 26) — build from the spec's §7.** As first filed: three proposals waited on his yes or no — a standing three-line tidiness guard in the final code
read's brief; five look-and-feel checks beside Impeccable; three evidence rules for the bug-check order. **Astra read
them 2 Oct 26 (the spec's §7): the first two adopt-with-changes, the third rejected and withdrawn, and one new proposal from it —
a reviewer's claim is a finding only with a concrete failure, its cause and its fix.** Whatever he
answers, no check resizes a button (D487). Both Fable and Astra
read the changed guide before he approves it (D70); copied upstream text gets its credit line. **Context:**
`raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md` §1, §3–§5. **Place — D486: after the reset of his weekly
allowance (Monday 5 Oct 26, 19:00, D484), a fresh chat on its own branch.**
**3 Oct 26 — he sent the whole `mattpocock/skills` collection and asked whether to implement it:** read at the source; the
agent's verdict is not whole (D486's reasoning), with three small pieces PROPOSED to ride with this job — a word list (screen
name, meaning, code name), two lines for the debugging guide, one line for `[CODE-TIDY-AUDIT]`'s brief. **APPROVED — D491
(3 Oct 26, "Yes for all"):** the two debugging lines are built here; the word list is its own item, `[WORD-LIST]`; the spec's §8.

### [WORD-LIST] One page of the app's words — the name on screen, what it means, its name in the code (D491, 3 Oct 26)
From `mattpocock/skills` (its glossary idea, adapted: theirs forbids the code name, ours keeps it — the translation is the
point). A reference doc under `raptor-port/docs/` with a row in the project guide's map; searched when writing to him or
briefing a reviewer, never loaded in every chat; a term settled in a planning round is added the moment it is settled.
**Astra drafts it before the reset (D491)** — from the screens' own labels and the reference docs, by area; the host checks
the draft against the app before it is used, and the plain-language rule then points at it (that pointer is a guide change:
it rides with `[SKILL-FUSION]`, D70). **Context:** `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md`
§8. **Place:** the draft now (light work, D484); the check and the pointer with `[SKILL-FUSION]`, after the reset.

### [CODE-TIDY-AUDIT] One tidiness audit of the code before the database step — a report for him, nothing restructured on its word (D486, 2 Oct 26)
The "thermo-nuclear" rubric, read at its source, is a reviewer's checklist for ONE change; the audit is our adaptation of it to
the standing code. One reader, Astra first (D353), never the model that wrote the code (D67); it reads the files that are both
large and often changed (nineteen files are over 1,000 lines; the table is in the context doc), reports at most ten restructures
that each DELETE something, and for each: what must behave the same, the tests that pin it, the bug-check tier it would need.
The brief carries D56 and the one-command-layer architecture. He rules on each; an approved restructure becomes its own item,
built with related work (D485). His question — does it save tokens — is answered in the context doc §2: on building and code
reads yes, on the walkers (the biggest cost) no. **Context:** `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md`
§2. **Place — D486: before `[DB-STEP]`; Astra's read is light work and may run before the reset (D484).** **D491 (3 Oct 26):
it runs BEFORE the reset, and its brief gains the deletion test — report a restructure only if removing the piece gathers the
complexity in one place, not merely moves it (the spec's §8).**
**RUN, REPORTED AND ANSWERED — D493 (2 Oct 26, "as recommended"):** Astra's report is
`raptor-port/docs/superpowers/briefs/2026-10-03-code-tidy-audit-astra.md` (five separations, none a fault). Three approved, each
its own item — `[LW-ROWS-SPLIT]`, `[CSS-SPLIT-BY-SCREEN]`, `[TRK-FILE-TRANSFER-SPLIT]`. **Left open here, two:** the Leave War's
saved-data reading (the report's §4) is looked at again at `[DB-STEP]`, which replaces it; the Leave War's link to the schedule
(§5) is not split unless a later feature has to work heavily inside it — put it to him then.

### [LW-ROWS-SPLIT] The Leave War's row drawing moves out of its grid file — APPROVED D493 (2 Oct 26), to build with the next Leave War batch
From Astra's tidiness read (its §1 — read it before building: what must stay identical, the tests that pin it, the test to
write FIRST). `PersonRow`, `PersonMonth`, their props and row-only predicates leave `src/leavewar/ui/Matrix.tsx` (about 4,700
lines) for a new `MatrixRows.tsx`; the grid file keeps its state, geometry, selection and sheets. Nothing on screen changes.
New file → `docs/file-map.md` in the same change. Tier by the order's questions at build time (Astra says FULL: permissions
and the OIL display are drawn there). **Place — D493, D485: with the next Leave War feature batch, never alone.**

### [INSIGHTS-CLOSE-STAYS-VISIBLE] Keep the Insights close cross at the top while scrolling — D562, 4 Oct 26
Owner's two private phone photos show the Week insights title/cross at the top initially, then out of view after
scrolling. He asks for the existing cross to remain at the top. **Status:** built on codex/workflow-ui under D563 after numbered pictures/independent plan challenge; all normal gates and fresh independent Astra R1PASS, owner look and Claude reads pending.
Built on codex/workflow-ui after numbered candidates and independent plan challenge; normal refreshed gates underway; fresh final read and owner look pending. Chosen sticky header placement
was pictured before source and has current phone/desktop native proof. Preserve dismissal, D536/D537 window height/top
strip and all Insights data/permissions. No whole-popup-family redesign. Both reference photos remain private.
**Home:** `raptor-port/docs/ui-contracts.md` Week Insights (D562); short/full Scheduler ruling.
**Place:** current workflow UI batch with the Tracker/Logic requests, authorized together by D563.
Separate from the earlier D536 phone-top clipping repair and [MODAL-DRAG-CLOSE] accidental dismissal fix.

**Insights close design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).

### [LOGIC-STICKY-SEARCH-COMPACT] Keep Logic search visible while scrolling and pack its controls closer — D561, 4 Oct 26
Owner's two private phone photos show existing filter/edit controls staying visible after search has left the screen.
He asks to keep search there too and pack the buttons together into fewer vertical rows. **Status:** built on codex/workflow-ui under D563 after numbered pictures/independent plan challenge; all normal gates and fresh independent Astra R1PASS, owner look and Claude reads pending.
Keep All, Warnings, Advisories, Notes, Fired this week, Edit rules and rule count with their existing actions;
preserve filtering, permissions and rule values/calculations. Chosen local layout108px tall at390px keeps
search/controls visible below the actual header; narrow modified actions wrap. No global button resizing. Both photos stay private.
**Home:** `raptor-port/docs/ui-contracts.md` Logic search and controls (D561); short/full Scheduler ruling.
**Place:** current workflow UI batch with Tracker/Insights, authorized together by D563. No change to D495's later feature order.

**Logic controls design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).

### [TRK-FLIGHT-LABEL-READABILITY] Make the words inside blue flight balls easier to read — D560, 4 Oct 26
Owner's private Photo 1 shows the Tracker Flow chart's blue flight symbols with text hard to read inside the narrow
wing. He asks for a shape redesign, suggests more wing surface for the label and contrast, invokes Impeccable, then
says he has more tasks and to hold on. **Status:** first build checked; D564 rejects its blocky wide-wing design and asks for better numbered options. D565 tapered redraw accepted D566 "Yes, use this tapered wing"; chosen replacement built, current native walk29PASS/18opened/0errors; all normal gates and independent final R1PASS. Completed Logic/Insights fixes retained. Branch preview shipping follows completed fresh read.
Rejected first wing/evidence retained privately. D566 chosen tapered wing implemented; retain historical alternatives privately. No whole-ball size, palette or font-scope extension approved.
**Home:** `raptor-port/docs/ui-contracts.md` The Tracker tab (D560); short/full Tracker ruling.
**Place:** current workflow UI pass, together with Logic/Insights under D563. Preserve authored charts/details (D464), Raptor palette (D157) and existing chart behaviour. Private photo stays
outside the repo; no student names, marks or dates copied into records. Numbered phone/desktop pictures before build.
This is separate from [TRK-KEY-NAME-CLIP] and [TRK-FLEXBAR-INK], and does not start the progress graph or file split.

**Tracker wing design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).

**D564 replacement options:** `raptor-port/docs/superpowers/specs/2026-10-04-flight-centre-options.md`; private pictured host variants and independent corrected-font confirmation in `raptor-port/docs/handpass/2026-10-04-flight-centre-options-picture-read.md`. D565 now proposes a tapered leading-edge wing based on an annotated smooth-wing picture; original host recommendation3 is superseded. D566 subsequently accepts the exact final redraw; earlier options remain historical.

**D565 tapered redraw:** `raptor-port/docs/superpowers/specs/2026-10-04-flight-leading-edge-taper.md`; independent Sol challenge/picture read in `raptor-port/docs/handpass/2026-10-04-flight-leading-edge-taper-picture-read.md`. Both-size specific picture shown and accepted D566; chosen replacement implemented; refreshed gates and separate fresh final R1PASS. No further shape-choice question pending.

### [TRK-FILE-TRANSFER-SPLIT] The Tracker's file save and load move out of its main file — APPROVED D493 (2 Oct 26), to build with the Tracker batch
From Astra's tidiness read (its §3 — read it before building). The export / import workflow (about 730 lines) leaves
`src/tracker/app/core.js` for one module beside `fileFormat.js` and `fileStore.js`; the menus keep calling what they call now.
**Astra's stop condition, kept:** if it cannot use the store and the format through a small explicit interface — no
catch-all "core context" — stop and report, do not force it. First the boundary test Astra names (export, fresh store,
import, compare every record and id; cancel; a conflicting syllabus; no partial write on a refusal). FULL tier — saved data.
**Place — D493, D485: with the Tracker batch (`[FEATURE-WISHLIST]` item 4).**

### [OIL-ZERO-SPAN-SORTIE] A take-off-equals-landing line whose report is also its take-off, with the debrief setting at zero, earns nothing — and the day's advisory still says it "earns from the report and debrief" (found 6 Oct 26, the plan challenge of `[OIL-WORK-START]` — Astra's finding 4; LOW)
A flying line typed with the SAME take-off and landing earns from the report before it and the debrief after it (D49). Where
there is neither — the Logic page's "Flight debrief after land" set to zero AND the line's entered in-time equal to its
take-off (or, as before this build, both the debrief and "Nominal report before T/O" set to zero) — the line measures nothing
and its crew earn nothing: correct by the standing rule that OIL comes only from written times (D31), and pinned as built in
`raptor-port/src/engine/oilworkstart.test.ts`. What is wrong is the WORDS: the day's "Flight times — the same" advisory still
tells the scheduler the line "still earns from the report and debrief", and the day's "no usable times" list does not name it.
Reached only with a debrief of zero, which no squadron sets. **To build:** word the advisory from what the line actually
measures, and name the line in the "no usable times" list when it measures nothing. **Tier:** WALK (the warning list).
**Place (the agent's line):** low — with the next change to the OIL warnings.

### [LOGIC-REDRAW-DROPS-TYPING] The Logic page redraws its rules about half a second after it opens — a value being typed into a box at that instant is dropped (found 6 Oct 26 by `[OIL-WORK-START]`'s browser test; OLD, not that job's doing; LOW)
**Seen:** the browser test of `[OIL-WORK-START]` failed once in two full runs on the busy PC at one step — Logic opened with
"Edit rules" already on, "Nominal report before T/O" typed, Tab — and the box read the OLD value afterwards, the setting
unchanged. Traced with a watcher on the page's body: shortly after the page opens (about half a second on a free machine) the
list of rules is replaced by the same markup — new boxes, nothing visibly different — and whatever sits half-typed in a box
goes with the old box. With a pause put between the typing and the Tab it happens every time; in a second trace the box lost
its place about two seconds after "Edit rules" was pressed and the value was SAVED without a Tab. **Not traced:** what asks
for that redraw (a late re-check of the week after the page change is the likely cause — the page redraws whenever the app's
state moves, and its body is rebuilt as one piece), and whether anything can set it off LATER, while a person is typing —
that is the question that decides whether this matters outside a test. A person's hands cannot reach the half-second after
opening. **Why it may matter later:** once the app is in the database, other people's changes arrive by themselves every 30
seconds (D356); if such an arrival redraws this page, a value being typed is dropped with no message. **To do:** (1) find
what asks for the redraw; (2) either stop the page redrawing when nothing in it changed, or keep a box that is being typed in
out of the redraw, as the schedule's text boxes are; (3) a test that types, lets the app's state move, and finds the typing
still there. The browser test now types again until the app holds the value (`raptor-port/e2e/oilworkstart.spec.ts`,
`logicLead`) — take that retry out when this is fixed. **Tier:** WALK (the Logic page, a typed value, both sizes).
**Place (the agent's line):** low — with the next change to the Logic page, and before the database step for the reason above.

### [OIL-EARN-DAY-SWITCH-WORDS] OIL Earn's "Nothing today earns" button reads like a status — two walkers took it for one (found 6–7 Oct 26, the walks of `[OIL-WORK-START]`; OLD; LOW, words)
On the Scheduler Board in OIL Earn mode the bar carries a button labelled "Nothing today earns". It is a SWITCH — pressed, it
makes nothing on that day earn — and its label does not change with the day's state (only its tooltip does). With a man on the
day plainly earning (his puck reads FO), the bar still says "Nothing today earns" beside it. Two walkers, on separate walks and
without seeing each other's work, each reported it as the app contradicting itself (the first walk's W8; the D606 walk's E03 —
picture `raptor-port/docs/img/handpass/2026-10-06-oil-work-start/E/dk-08-E03-oilearn-board.png`). **To build:** word the button
as the action it is, and say the day's state apart from it — a product wording choice, so a picture and his word first.
**Tier:** WALK (a control's label on the board, both sizes). **Place (the agent's line):** low — with the next change to OIL Earn.

### [SC-B-CHANGE-SAYS-BRIEF] The changes window calls an SC shift's in-time "brief" (found 7 Oct 26, the D606 walk — E02, E06, E15; OLD; LOW, words)
On an SC line the B box is the crew's in-time, not a brief (owner, 24 Aug 26), and since D606 (7 Oct 26) it moves OIL. A B typed
or changed on a published day is listed under "To go out" as "SC · brief  06:00" (and "06:00 → 08:00") — the box's general name.
**To build:** on an SC line, name the change "in-time" in the changes window, the pending list and the edit history; every other
line keeps "brief". **Tier:** WALK (the changes window's words, a published day, both sizes). **Place (the agent's line):** low —
with the next change to the changes window's wording, or with `[OIL-EARN-DAY-SWITCH-WORDS]`.

### [UNPUB-WARN-AL-RESTORES] The Unpublish warning assumes the day's OIL disappears — when withdrawing an AMENDMENT puts the earlier version's OIL back (found 6 Oct 26, the scenario read of `[OIL-WORK-START]` — Astra's F2; OLD, the same on the live app; LOW-MEDIUM)
Unpublish on a published weekend warns when taking the day's OIL away would leave a man who has already spent it below
zero (`leavewar/sync.ts oilCreditBidAgainst`, asked by the Unpublish button — `ui/interactions.ts`). It works that out by
rebuilding his OIL with the day's credit LEFT OUT. That is right for withdrawing an ORIGINAL (the day becomes a draft and
earns nothing). It is wrong for withdrawing an AMENDMENT: the version before it becomes the published one again
(`engine/publish.ts unpublishDay`) and ITS OIL pays — so withdrawing a half-day amendment that restores a full-day
original RAISES his balance, and the warning still says the withdrawal would strand his leave. It errs toward warning,
never toward silence. **Seen on screen (the walk of `[OIL-WORK-START]`, walker C, S02):** the first tap said "Heads up —
Saturday's OIL credits are bid against on the Leave War. Unpublishing withdraws them until you republish"; the second,
"AL1 withdrawn … its OIL credits leave the Leave War until it is published again" — while the Original's full day came
back and his balance went from 0 to 0.5. Both sentences are wrong for an amendment. Astra's steps: find the version that survives the withdrawal; work out its OIL records from its own
kept evidence and values; rebuild the man's OIL with THAT in place of today's; warn only if the real result goes below
zero; and word the warning and the done-message for "back to a draft" and "back to the earlier version" apart. Checks: an
ORIGINAL withdrawn; an AL withdrawn to a higher, a lower and an equal credit; a credit that never landed.
**Tier:** FULL (OIL, the published record). **Place (the agent's line):** low-medium — with the next change to Unpublish or
to the OIL tracker.

### [INTIME-LINES-DRAG] Drag a wave's In-time / Rally lines into order on the Scheduler Board; Auto sort orders them too (D593, 5 Oct 26)
**His ruling (D593):** *"I also want the option to be able to [drag] and rearrange in Time/rally. In the schedule board. And the auto sort
button also helps in rearranging."* Full row: `.claude/decisions-full/scheduler.md` D593.
**Today:** a line is added by "+ In-time / Rally", typed in, and removed with its ✕; the lines stay in the order they were added. Their
order changes nothing the app works out — the earliest applicable clock is used whatever the order (D506).
**Answered — nothing is left to ask before building (D594, 5 Oct 26):** the board ONLY — no drag for these lines on Edit Schedule's week,
which shows them in the order the board left them; Auto sort's order is by time, earliest first, a previous-evening clock first, a line
with no clock last, from the wave's own Auto sort and from Sort all; a new order on a published day reads as a pending change. The
six-dot grip is the app's own (the agent's call).
**Tier (the agent's reading):** WALK at least — a new gesture on a shared drawer; FULL if the reorder is recorded on a published day.
**Place (the agent's proposal, his to set):** one batch with `[OIL-WORK-START]` — both are about the In-time / Rally lines — on its own
branch after the Codex stack goes live, with one check for the two (D485).

### [INP-OIL-CHIP-PHONE] On a phone the green OIL chip is painted over a request card's date and time (found 5 Oct 26, the Codex stack check)
Inputs page at phone width (390): the card of a request that carries an OIL answer (walked: Torch, Training, 18 Jul 11:00–12:00) draws its
green "OIL" chip over the date and time — about 37 × 12 px of overlap. Walker E's picture:
`raptor-port/docs/img/handpass/2026-10-05-codex-stack/E/oilchip-phone-torch-row.png`. Older than the Codex stack: nothing in the stack
touched the Inputs page or its stylesheet part. **Place (the agent's line):** low — with the next change to the Inputs page; a browser
test that the chip and the date do not overlap at 390 and 320.

### [BOARD-TIME-ESCAPE] On the Scheduler Board, Escape in a TIME box does not put the old time back (found 5 Oct 26, the Codex stack check)
The board's take-off, landing, Brief and duty-start boxes keep what was typed after Escape, the caret stays in the box, and leaving the
box then saves it; the week's time boxes and the board's text boxes restore the saved value. The same on `main` (`de470db5`) and on the
stack — the host ran walker D's probe (`raptor-port/scripts/handpass/stk-D-1b.mjs`) on both builds, box for box. D544 kept "the existing
Enter and Escape meanings", so the Tab route did not change it. Not ruled. **Place (the agent's line):** low — a question for him with
the next change to the board's boxes: should Escape restore there as it does on the week?

### [REQ-ROW-OWN-BOXES] Typing in the programme row of an accepted request changes the row, not the request (both walks of the Codex stack check, 5–6 Oct 26 — a question for him)
A timed request (walked: Training, Sat 18 Jul, 11:00–12:00) accepted onto the Ground / Common Programme: typing a new start, end or
remark in the PROGRAMME ROW's own boxes changes that row (10:15–11:45, the new words) while the request — its line under Personal
Inputs, the Inputs page — keeps 11:00–12:00 and its own remark, also after a reload; typing in the request's own boxes changes the
request and the row follows. On the week and on the board, by click and by Tab alike. Older than the Codex stack: nothing in it touched
that code (the row's boxes are the scheduler's own layer over the request — `raptor-port/src/engine/overlay.ts`, unchanged against
`main`); Astra's scenario P4c-03 assumed the row IS the request. Walkers D and P, `raptor-port/docs/handpass/parts/stk-D.md`,
`stk2-P.md`. Not ruled. **Place (the agent's line):** low — ask him: should the row's times be the request's (one record), or may the
scheduler re-time the row on the programme and leave the member's request as filed (as now)? With the next change to requests on the
programme.

### [START-CONTEXT-AUDIT] A new chat starts at about 30% of its context — measure what it loads, then cut it to what a job needs (owner, D602, 6 Oct 26)
**DONE 7 Oct 26 under his ruling, on `claude/docs-tidy-7-oct` — options 1 to 6 (what each did and saved: the foot of the
spec named below); 7 found nothing to do; the document check is green. STILL OPEN, why this item stays: step (4)'s check
that stops it growing back is not built (a merged handoff block failing the check after one handoff; a ruling whose
permission names a merged branch listed as "spent?"; a marker for `AGENTS.md`) — low, with the next change to the
document check; and options 9 and 10, his own settings.** **HIS RULING (D609, 7 Oct 26): options 1 to 4 now, then 5 to 7 with Astra and Sol reading; one branch, the document
check green, then a pull request for his "merge live". Option 8 — NOT done: the scheduler's rulings stay in one file (D611, the same day).** As it stood
before: steps (1) and (2) done 7 Oct 26 on `claude/docs-tidy-7-oct`, nothing trimmed, no guide changed. The measurement and thirteen options, each with what it saves and risks:
`raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md`. In short: about 97 thousand tokens before the
first message (68 thousand of it the app's own tools), about 189 thousand once a scheduler build has opened its first
files; the largest avoidable piece is 18 thousand of merged blocks in the handoff. The text below is the item as filed.
His words: *"why I am at 30% context the moment I start a new chat? Is it required? Is there a way we can optimise how the repo is
structured so that we only read what's required? Or summarise it. Or u suggest. A lot of tokens are wasted if we carry on like this.
But we should not cut down at the expense of losing the quality of work."* The rulings were slimmed once (one line each — D390,
28 Sep 26) and the guide after them (D391); since then about two hundred rulings were added, most to the list every chat loads and
to the scheduler's. **The job, in order:** (1) MEASURE — every piece loaded before a chat's first message (the unscoped rule files,
the general rulings, the memory index, the tool and skill lists) and on opening its first file (the project guide, an area's
rulings), each with its size, and what a typical job actually used of it; (2) OPTIONS for him, each with what it saves and what it
risks — among those to weigh: the general rulings split so that only the rules of conduct load every time and the dated one-off
ones (a build's permissions, an order of work already done) load by search; spent permissions retired (D136 already allows it);
the scheduler's rulings split by screen; the handoff's merged blocks removed; rule files that repeat each other merged; (3) his
ruling; (4) the change, read by Astra and Sol before he approves it (D70), with the document check extended so it cannot grow back
unseen. **The test of every option (D602): never at the cost of the quality of the work** — D68 (correctness beats context
economy), D136 (no live ruling leaves the list a chat reads), D138 (a summary never changes the meaning), D141 (no size targets).
**Place (D602):** after the crew-rest fix (`[REST-BLANK-LINE]`), in a fresh chat on its own branch — documents only.
**A measurement to start step (1) from (the `[OIL-WORK-START]` chat, 6 Oct 26, read off the app's own context meter before any
work was done):** that chat had used about a fifth of its room — roughly 197 thousand tokens — after its opening instruction
(read the handoff, check the branch): about 97 thousand in messages (the handoff, the rule files, the project guide and the area
rulings its first reads pulled in), about 38 thousand in the tool list, about 29 thousand in the memory files, about 17 thousand
in the connected services' tool descriptions. The handoff alone is some 29 thousand, most of it the seven blocks of branches
that merged with PR #481 (`[STACK-MERGED-TIDY]`).

### [SC-BLANK-SHIFT-QUAL] An SC line whose shift times were cleared prints "(NaN:NaN–NaN:NaN)" in its currency warning, and asks for NIGHT currency (found 6 Oct 26, the crew-rest fix's check — OLD; low)
Tuesday "+ Wave" → SC; clear the first shift's start and end boxes; put a man who holds SC DAY currency only in its first MAIN
seat: the list says "SC currency — wrong shift — SC NIGHT currency needed for SC AM (NaN:NaN–NaN:NaN) — Scribe is not current"
(walkers A and C, and the host's unit run; picture `…/2026-10-06-rest-blank-line/C/dk-01-h03-plain-list.png`). With no shift
times there is no day or night to tell (`validate.ts`, the SC currency check). Clearing an SC shift's times is a rare act — the
wave is minted with them. **Fix:** with no usable shift window, say nothing about day or night currency (or say the shift has
no times) — never print a clock that is not there; a red test first. **Place:** low — with the next change to the SC rules, or
with `[BLANK-TIMES-ABSENCE]` (the same family: a rule reading times that are not there).

### [CREW-REST-MARK-COPIES] The dotted "breaks tomorrow" ring and the dashed late-show ring are drawn on the cockpit and row pucks only — the same man's other pucks show a solid red ring; and an open day list paints over both (found 6 Oct 26, the crew-rest fix's check — OLD; low; a question for him)
Seen by all three walkers, none of it this fix's doing (nothing that draws a puck was touched). (1) On the day that CAUSES a
breach (Monday, when Tuesday's rest is broken) the man's cockpit puck and ground-row puck wear the dotted red ring — but his
SANS card, his Unavailable row and his Personal Inputs row wear a SOLID red ring with the R chip, which reads as a breach ON
Monday; the crew list's copy shows neither. (2) A sanctioned late show (the dashed ring) is dashed on the cockpit and the row
and SOLID on the SANS card, the Unavailable and Personal Inputs rows and the crew list (walker C, S01 — pictures
`…/2026-10-06-rest-blank-line/C/dk-06…26-s01-*.png`; the builders pass no dash or trace to those copies: `ui/html.ts`,
`ui/board-html.ts`, `ui/palette-html.ts` — Astra's roll-call). (3) While a day's issue list is OPEN, every puck it names is lit
with a solid ring, which covers the dotted and the dashed ring until the list is shut (walkers A, B and C). **The question for
him:** should every copy of a man's puck wear the same crew-rest ring as his seat does, and should an open list leave the
dotted and dashed rings readable? **Place:** low — with the next change to how pucks are drawn (D94 put all three rings on the
board; these copies were not in its roll-call).

### [BLANK-LINE-SANS-WORDS] On a line with no times a SANS man's offer is still worded as a clash, and a line with no callsign leaves holes in sentences (found 6 Oct 26, the crew-rest fix's check — OLD; low)
(1) A SANS man offering Fly 14:00–16:00, seated on a blank line: the list says "… planned for   — available 14:00–16:00 only"
although there is no time yet to compare with his offer; the crew list does not strike him (it has no window to test) — the two
disagree (walker C, S28c). (2) A line with no callsign or mission prints its blank name into sentences: "cannot fly FCP ( )",
"OCU in   with no IP", "planned for   —". **Place:** low — with `[BLANK-TIMES-ABSENCE]` (what each rule says when a seat has no
times) or the next change to those sentences; "this line" where the name is blank.
**Part done 6 Oct 26 with D605 (`claude/blank-times-absence-picker-2cebae`):** the three ABSENCE sentences ("On leave but
planned to fly …", "… but tasked — …", "… clashes with …") say "this line" / "this row" where the seat has no name, with
times and without. Still open: (1) the SANS offer worded as a clash on a line with no times, and the blank name in every
OTHER sentence ("cannot fly FCP ( )", "OCU in   with no IP", the clash and brief sentences).

### [TAB-LAST-BOX-TEST-GAPS] The Tab that keeps the caret in a day's last box (D597): what its test does not cover (Astra's owed read, 6 Oct 26 — no defect found; low, tests only)
From `[R3-OWED-READS]` (1): the fix in `raptor-port/src/ui/schedule-tab.ts` is sound for the redraw it was written for. Not
covered by `schedule-tab.test.tsx`: the reverse change (the day's LAST warning going away at that Tab, not only its first
appearing); the caret seen in a real browser after the day is replaced (the short phone board, a window open over it); the
fallback when the exact box no longer exists; a day replaced during the box's own blur (the earlier same-scope check exits
first — a coverage boundary, not a shown failure). The read: `raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md` §5(a).
**Place:** low — with the next change to the Tab route.

### [BLANK-STANDBY-STRIKE] On a standby seat whose shift times are blank, the crew list strikes a man on LOCAL leave — whom the rule lets stand it (found 6 Oct 26, the D605 build — OLD; low)
"+ Wave" → BB (it comes up with no shift times), or an SC wave with its first shift's start and end cleared; a man on
local leave (LL) all day; arm a BB seat, or the SC SPARE seat: his name is struck "local leave (LL)". Type the shift's
times and the strike goes; seat him either way and the day's list says nothing — a local leave may stand a standby place
(owner, 10–11 Aug 26; D605 keeps each kind's exemptions). **Cause:** the crew list tells a standby place by its HOURS —
`raptor-port/src/engine/avail.ts` `slotRules` sets `avJet` only beside a start time, and `slotBar`'s `spareLike` reads
`r.sc`, the shift's day / night kind, which is null without times — so a blank standby seat is judged like an ordinary
one ("unknown fails closed", pinned in `slotrules.test.ts` with exactly this case). Stricter than the rule, never looser:
no man the list flags is offered clean (pinned in `blankabsence.test.ts`, which names this gap). **Fix:** set the standby
flags whatever the hours (`avJet` for any AVALON / BB line; `spareLike` on `scSpare` alone), keep failing closed for a
type that DOES bar the seat, and change the `slotrules.test.ts` pin to an overseas leave; a red test first. **Place:**
low — with the next change to the crew list.

### [BLANK-SEAT-ACTIVITY-HINT] Before a man with a whole-day course or meeting is put on a seat with no times, the crew list says nothing — the list flags him the moment he is seated (Astra's code read of D605, F2, 6 Oct 26 — a gap the build left on purpose; low)
A whole-day Training for a man; "+ Line" (no times); arm its seat: his name is offered with no reason. Place him: "Training
clashes with this line" (the drop's toast says it at once). With hours on the seat the crew list does advise first
("already on Training") — its soft check for a personal commitment needs the seat's hours
(`raptor-port/src/engine/avail.ts` `slotBar`, the "IS HE ALREADY BUSY AT THIS HOUR" block, guarded on `slotStart`). For a
LEAVE, a downchit or an overseas duty there is no such gap: the crew list strikes those on a seat with no hours. D605 was
built with the crew list unchanged (its full row, reading (7)); pinned as it stands in `blankabsence.test.ts`. **Fix:** in
that block, a whole-day personal commitment advises against a seat with no hours too ("already on Training", never a
strike); a red test first. **Place:** low — with `[BLANK-STANDBY-STRIKE]`, the next change to the crew list.

### [SC-SPARE-RING-BORROWS] One man in a MAIN and a SPARE seat of ONE SC line: his SPARE puck wears the MAIN seat's leave ring (Astra's scenario read of D605, F3, 6 Oct 26 — OLD; low)
An SC line, the same man in a MAIN seat and a SPARE seat of the same shift, a local leave all day: the MAIN seat is
flagged ("On leave but tasked — SC AM"), rightly; the SPARE seat's puck wears the red ring and C too, though local leave
may stand a spare. Reproduced by the host through the rule and the week's own drawer, with the shift's times blank and
typed (typed, the pair is red anyway — "standing SC SPARE and also on SC AM MAIN"). **Cause:** the exempt seat's puck
rings for any warning anchored anywhere in its formation (`raptor-port/src/ui/html.ts` `exemptLineOwn` — the key-prefix
match), and a MAIN seat's absence warning is anchored on the MAIN seat of that formation. It needs one man in two seats
of one shift — already a planning error. **Fix (Astra's steps):** for an SC SPARE's absence ring accept the
formation-level spare warning and not a MAIN seat's key that merely shares the prefix; keep the currency and two-places
matching; pin week and Board, blank and timed, with an overseas leave and ATT C as positive controls. **Place:** low —
with `[CREW-REST-MARK-COPIES]` (the next change to how pucks are drawn).

### [REQ-ROW-SELF-CLASH] Times typed on the row of an ALL-DAY request put on the Ground Programme flag the request's own man against it (found 6 Oct 26, the D605 build — OLD; low)
File an all-day Training for a man; put it on the Ground Programme (its row has no times, by design); type 09:00–10:00
in that row's own boxes: the list says "Training but tasked — TRAINING" for him — his request against its own row. Run
by the host through the rule on the unchanged timed path; the same on the live app. An all-day request keeps its own
voice beside its row (`raptor-port/src/engine/inputs.ts` `inputFlags` — a time-less row cannot carry a clash), and the
timed absence loop does not know the row IS that request. D605's new look does know (`events.ts` — `src` against the
input's id) and stays silent while the row has no times. Kin of `[REQ-ROW-OWN-BOXES]` (typing in a request's row changes
the row, not the request — a question for him). **Fix:** the timed loop skips an input against the ground row whose
`src` is that input; a red test first. **Place:** low — with `[REQ-ROW-OWN-BOXES]`.

### [SC-INTIME-REST-WORDS] The crew-rest sentence calls an SC line's typed in-time its "start" (seen 6 Oct 26, the D605 walk — OLD; low)
An SC shift 13:00–19:00 with B (its in-time) 05:00, a man clear at 12:30 placed on a MAIN seat: "… crew rest clear at
12:30, but SC AM starts 05:00 — only 4h30 rest." The shift starts 13:00; 05:00 is its in-time. The arithmetic is right
(the in-time is the report); the word is not. `raptor-port/src/engine/validate.ts`, the crew-rest sentence's shift
branch. **Fix:** "… but SC AM's in-time is 05:00 …" when the report is the typed B and "starts" only when it is the
shift's start; the crew list's line is unaffected. **Place:** low — with `[OIL-WORK-START]` or the next change to the
crew-rest sentences.

### [UPCHIT-MOVE-NO-REGROW] An Upchit moved to a LATER date does not give back the medical days it cut (walker B, the D605 walk, 6 Oct 26 — OLD; low; a question for him)
A downchit (ATT C) Monday to Friday; an Upchit effective Wednesday — the downchit is cut to end Tuesday, as it should
be. Then the Upchit's date is changed to Thursday in the Inputs page's row editor: the downchit still ends Tuesday (the
editor's sheet says "no current entry needs shortening"), so Wednesday reads fit although the man was cleared only from
Thursday. Seen by walker B (S26; `raptor-port/docs/handpass/parts/bta-B.md`), NOT reproduced by the host; the Upchit's
write path only ever shortens. **The question for him:** when an Upchit is moved later, should the downchit it cut grow
back to the day before the new date — or is the Upchit deleted and filed again? **Place:** low — with the next change
to the Medical view.

### [OFT-ADD-TWICE-SILENT] The second press of an OFT row's "+" for a man already on that row is refused with no message (walker A, the D605 walk, 6 Oct 26 — OLD; low)
"One man, once per row" (D271) refuses the second place and says why — on a duty row, a ground row, a Common Programme
row and from an OFT row's front seat to its rear. Pressing the OFT row's "+" twice with the same man armed: the row is
unchanged, rightly, and nothing is said. Seen by walker A (S24; `raptor-port/docs/handpass/parts/bta-A.md`), not
reproduced by the host. **Fix:** that door shows the same sentence the others do; a browser test first. **Place:** low —
with the next change to the sim rows.

### [LOOK-PENDING-COUNT] The 👁 look at the Original shows "1 pending" in its head while the working copy shows "2 pending" (walker D, the D605 walk, 6 Oct 26 — OLD; low)
A published Tuesday; a man seated on a new line and a leave filed for him afterwards: the working copy's head reads
"2 pending" ("Vandal · LL filed", "WAVE 3 added"), and the 👁 look at the Original, opened at the same moment, reads
"1 pending". Seen by walker D in two of its orders (pictures
`raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/D/dk-04-dk-obs-2-after-leave-W.png`, `dk-06-…-L.png`),
not reproduced or explained by the host; nothing about a warning. **To do:** find which count the look's head prints and
whether a pending chip belongs on a look at an issued version at all. **Place:** low — with the next change to the
changes window or the version look.

### [PEND-INTIME-WORDS] "To go out" words an edited reporting line as "2 In-time / Rally lines → 2 In-time / Rally lines" (reader AB's second pass, 6 Oct 26 — OLD)
A line's clock changed on a published day, with the number of lines unchanged: the pending list shows the same words before and
after (the changes window's "All changes" shows the real text). The same on `main` ("2 in-times → 2 in-times"). Fix: word the lines
that differ — `…/stack-read2-AB.md` F3. **Place:** low — with the next change to the changes window.

### [BOARD-INTIME-JUMP] On the Scheduler Board a reporting-line change in the changes window is not a button (reader AB's second pass, 6 Oct 26 — OLD)
The board draws the In-time / Rally block with its address, but the list of "details the board does not draw" still names it
(`raptor-port/src/ui/histbubble.ts`), so its line cannot be tapped to go there. `…/stack-read2-AB.md` F4. **Place:** low.

### [WINDOWS-KEEP-KEYS] Only the six question sheets keep the keyboard; the larger windows let Tab walk into the page behind (reader D2's second pass, 6 Oct 26 — OLD)
The request's edit window, Insights, the document viewer and the template windows take no focus and hold none: Tab goes on into the
schedule behind them (the Tab route stands down; a box there still saves on leaving). The same on `main`. The six sheets fixed in the
check use `raptor-port/src/ui/sheetfocus.ts`; the same hook fits these. Also from that pass, low: after the OIL question is answered
the caret is on nothing (his place in a Tab run is lost); the red explanation refresh (AB-F2) has no test of its own; with several
unnamed lines an unreadable clock is explained once per line under the box. **Place:** low — with the next change to those windows.

### [SAVE-NOTE-TEST-GAPS] Two soft spots in the failed-save warning's browser test (Astra's read of the last round, 6 Oct 26 — tests only, the app is right)
Astra read commit `bcc69fc8` (the last round of `[SAVE-NOTE-COVERS]`, never independently read before): the three repairs are sound
in the app. Two weaknesses in `raptor-port/e2e/save-note.spec.ts`, neither a fault a person can meet: (1) the proof that a press on
Retry itself tried to save reads the write counter one task later (`setTimeout(…, 0)`), so an automatic retry falling due at that very
moment could pass for the press — sample it in the same click, after the button's own handler, and repeat the disabled-handler check
with a retry due at the click; (2) "a window he has moved keeps its place and size" is pinned for a MOVED changes window only — add
a resized one, an operated ALL AVAIL window and the preview-bar combinations. The report:
`raptor-port/docs/superpowers/briefs/2026-10-06-owed-small-reads-astra.md` Part 3. **Place (the agent's line):** low — with the next
change to the failed-save warning or its test.

### [INSIGHTS-EMPTY-LINE-COUNT] A flying line with nobody on it counts as a sortie and a formation in Insights (the Codex stack check's W17, 5 Oct 26 — a question for him)
"+ Line" on a flying wave, no crew: Insights' SORTIES tile goes up by one and FORMATIONS by one; the per-person bars are right. The
same on `main` (`de470db5`) — `raptor-port/src/engine/insights.ts` counts every line and jet that is not cancelled, crewed or not, as
the day's own "4 X 4 X 0" count does (`waves.ts dayCount`, the precedent its comment names). Not ruled. **Place (the agent's line):**
low — ask him whether an uncrewed line is a planned sortie (as now) or should wait for its crew; with the next change to Insights.

### [EDIT-SECOND-CLICK] After a changed text box on Edit Schedule, the first click into another box does not take the caret (found 5 Oct 26, the Codex stack check)
On Edit Schedule's week: type a new value in a text box (a take-off, a mission), then click ONCE into another text box. The day
redraws as the first box is left, the box that was clicked is replaced, and the caret is nowhere (the page itself has the focus); a
second click takes it. With an UNCHANGED first box one click is enough. The same on `main` (`de470db5`) and on the stack — measured
on both builds with real clicks: `raptor-port/scripts/handpass/stk-host-click-cmp.mjs`; walker K met it in L-10 and L-12
(`raptor-port/docs/handpass/parts/stk-K.md`). Nothing is saved wrongly; it costs him a click each time, and the Tab route (D544) is the
way round it. Not ruled; no fix proposed in the stack check. **Place (the agent's line, not his ruling):** low — with the next change
to the schedule's text boxes; if fixed, restore the caret to the box at the click's position after the redraw.

### [PALETTE-WRAPPED-HEADER] Wrapped desktop account bar covers the sticky palette's first option (found 2 Oct 26)
At1280×560 with RANGER · ADMIN and a two-row104px top bar, ALL AVAIL's center at y64 is behind the account badge after the page scrolls. Current actual reporting-warning jump reaches it before any target scroll; frozen9cc baseline lacks that new warning door, but native page scroll plus target scroll reaches the identical covered rectangle with the same badge/flight/reporting strings. Both served bundles are verified; no force click or data injection. Initial empty-week geometry did not reproduce the covered state and is retained, not offered as clearance. Required1440×480 and six named-person picker phone/short routes pass, without excusing the1280 defect.
Cause/fix triage: `raptor-port/docs/superpowers/plans/2026-10-02-rally-header-overlap-triage.md`; raw linked results in the Rally main consolidated manifest, preserved in `raptor-port/docs/handpass/2026-10-02-rally-workspan-evidence.zip`. Adapt the palette's sticky clearance to the actual header height, preserving existing control sizes and scroll/paint contracts. No repair or owner acceptance inferred. **Place:** workflow UI batch under D490/D495, after [CSS-SPLIT-BY-SCREEN]; final current-batch inspector judges the declared scope.
4 Oct normal-scroll reproduction on the unchanged workflow bundle with **Saber admin**:
header104px at1280×560, crew list stuck at y8; both placeholders covered. At1600×900
and1440×480 header58px and those hits work; return to1280 covers them again. Candidate
remains actual-header clearance plus available-height update, not raised stacking or
hard-coded104px. Still open, no repair/picture approval. Evidence:
`raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md` §Desktop crew list.
**D548, 4 Oct:** owner says leave this behaviour unchanged; only the phone Board's
blank Desktop layout is selected for repair. Retain the finding as history,
outside the current repair scope; no crew-list/header change is authorized here.

### [REST-FIRST-CREW-HINT] Empty formation gives no predictive crew-rest hint for its first occupant (found 2 Oct 26)
Rally runtime evidence: an empty Wednesday formation resolves reporting to Tuesday11:00, but Ranger gets no pre-placement rest hint. First assignment correctly raises9h crew rest against Monday's overnight endingTuesday02:00. A different remaining crew member supplies a sibling and Ranger's hypothetical placement then correctly gives clearance14:00. Removal restores the missing-first-hint condition. Baseline query contract and a dedicated test explicitly return null for an empty formation; this is existing behaviour, not a new Rally regression, and is not exempted as stored-demo-only harm. The broad guide claim that the query never disagrees has been qualified in `raptor-port/docs/engine-rules.md`.
Independent bounded cause/disposition: `raptor-port/docs/superpowers/plans/2026-10-02-rally-empty-formation-triage.md`. Possible repair: construct the hypothetical first leg through the shared day builder on a copied day, then use the existing rest probe; never duplicate reporting/date arithmetic. Replace the pinned empty-formation contract deliberately with regression coverage and an independently challenged scoped plan. Owner has not approved this repair or limitation. **Place:** caps and ops limits batch under D495; final Rally inspector must judge its declared scope, not assume universal picker/post-drop agreement.

### [SANS-PREVIOUS-REPORT-OFFER] Prior-date availability is not combined across a previous-evening reporting window (characterized 3 Oct 26)
Actual I2 walk on the Rally review-fix snapshot: Tuesday01:00–11:00 flying reportsMonday22:00, dekitTuesday11:30. Kraken's MondayPM Fly offer gives the actual armed picker "no availability filed for today"; accepted placement has no persistent SANS_AVAIL warning under the existing none-offer rule. Adding TuesdayAM Fly gives picker00:00–12:00-only and the same placed advisory: the target-day window cannot cover report−120 through690. The two date-specific offers are not combined. This characterizes the prior-date gap named unproven in Claude's small review; it does not assert cross-date support, invent coverage policy, or treat live writes as stored-demo harm. Evidence: `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`, downstream07 results/pictures in this round's portable proof. **Place:** caps and ops limits with availability under D490/D495; owner policy/design and a scoped independently challenged plan precede any repair. No source change or owner acceptance here; the final Rally inspector judges this explicit scope.

### [PRIORITY-LIST-REWRITE] The backlog's priority list still tells finished stories — a rewrite, read by a reviewer (filed 2 Oct 26)
Left by `[DOCS-SIZE-PASS]`: the list at the head of this file (about 90 lines) carries the merge stories of work long
archived (its items 1, 3 and 4, the small-OIL paragraph, the five-flags paragraph). Moving them needs the list REWORDED, and a
reword is read against the original for meaning (D138) — one reviewer, Astra first (D353). The old text moves whole to
`OUTSTANDING-ARCHIVE.md` by `backlog-archive.mjs --move`. **Place:** low — documents only, any time; it would take the file
about 60 lines further under its tripwire.

### [INP-TILL-STALE] The Inputs editor leaves "till <date>" in the remarks when a range is taken back to one day (walk find, 1 Oct 26)
**Characterized 5 Oct, Inputs/SANS batch:** the exact18→18–19→single19 sequence
passes both incumbent List and shared calendar editor doors: one matching
`till 19 Jul`, user prose Bangkok, one-day saved dates and durable reload.
The established one-day till wording is valid; no token-removal policy/fix is
invented. Evidence/forward facts: `raptor-port/docs/handpass/2026-10-05-inputs-sans-calendar.md`.
Original report below is retained for Claude's later review; its described sequence
does not demonstrate a currently stale date. No source change made for this item.
Found by walker A of the `[DB-READINESS]` phase 7 walk (its O4; picture `raptor-port/docs/img/handpass/2026-10-01-dbr-phase7/a/A10x.png`),
outside that batch. **Steps:** Inputs page, the editor of a one-day request on 18 Jul; click 19 Jul in its calendar (dates read
"18 Jul → 19 Jul", the remarks gain "till 19 Jul"); click 19 Jul again (dates "19 Jul") — the remarks keep "till 19 Jul"; Save
stores it and the row prints it. New data, not stored-only (so not D56). The app owns that token (`engine/inputs.ts
withRemarksTail`) and D189 counts it on a published day. **To do:** the editor's re-pick rewrites or drops the token on every
change of the span, the collapse to one day included; a test that drives the editor's own calendar. **Tier:** WALK (the
published day's words). **Place:** low — with the next Inputs change.

### [OIL-INERT-TAP-SILENT] In OIL Earn a tap on a puck that cannot earn says nothing (walk find, 1 Oct 26)
Walker A's O1 (pictures `…/2026-10-01-dbr-phase7/a/A3r-phone-1.png`, `A3r-desk-1.png`). A puck with nothing to earn from its row
(a row with no end time, a Personal request — and every other inert case) carries its reason as a hover title only; a tap
selects it (blue) and says nothing, so on a phone the reason cannot be read on the row — only in the ALL AVAIL window's foot.
The mode's general behaviour, older than phase 7. D31 says a seat with nothing to measure "says why instead"; D26 (leave the
mode's phone tap targets as they are) is about the targets, not this silence. **To do, if he wants it:** a tap on an inert
puck in the mode says its reason (the app's own message line), selecting nothing. **Place:** low — with the next OIL Earn change;
a question for him first.

### [OG-TAG-OVER-COUNT] The "OG" new-to-you tag sits over the top edge of an ALL AVAIL count (walk find, 1 Oct 26)
Walker A's O3 (pictures `…/2026-10-01-dbr-phase7/a/R4b-*.png`, `R4-1.png`): on the member's View-only Sched, the dotted "OG" tag on
a changed seat overlaps the count chip's top edge; the number stays legible close up, crowded at normal size. The admin's view
is clean. Cosmetic, older than phase 7 (D172's tag, D37's chip). **Place:** low — with the next change to the tag or the chip;
measure both at phone width. **It is also Trial 2 of D588 (not started):** ONE Sonnet 5.5 helper builds this fix to a precise spec; Opus reads
its diff and tests, decides what that model takes, and tells him what it decided and why (D595).

### [MEMBER-EDITPAGE-CHECK] A member sent to Edit Schedule by the developer bridge sees live-looking Amendments buttons — a check (walk note, 1 Oct 26)
Walker A's O5 (picture `…/2026-10-01-dbr-phase7/a/R4-4.png`). No control leads a member to Edit Schedule; reached through the
developer bridge on this PC, the page drew the Amendments panel with "Discard marks" and "Publish AL1" looking live. Nothing
was pressed. The rule is that the page, the write path and the command gate all ask `raptor-port/src/state/perms.ts`.
**To do:** press each as a member in a walk and confirm the write path refuses with its reason; if the page gate is the only
thing between a member and those buttons, gate the panel too. **Place:** low — a check to run with the next roles work.

### [COUNT-CHIP-PHONE-TAP] A finger tap on an ALL AVAIL count on the phone's week — FIXED for Chromium 1 Oct 26; his iPhone look left
Found by walker C of the `[DB-READINESS]` phase 7 walk (F1), pressed by Astra's final read (1), reproduced by the host on that
build and on the build before the batch (`9191910b`) — older than phase 7. **What happened:** at 390 px a finger tap on the count
under an ALL / ALL AVAIL puck armed the row on Edit Schedule and selected the puck on View-only Sched; the window never
opened. **Cause (diagnosed, `raptor-port/scripts/handpass/p7-h-phonetap2.mjs`):** a browser snaps a touch to the nearest element it
believes answers a tap; the count's click is handled on the document, so it was not one, and the puck 2 px above took every
event of the tap. **Fixed:** the count answers a press itself (`scheduler.css` `.oilcount:active`) — no size change; pinned by
a real-touch browser test (`e2e/availwin.spec.ts` "phone, by finger") and re-walked on both week views.
**Left:** (1) HIS IPHONE — the fix is proven in Chromium's phone emulation only; Safari decides a touch's target its own way
(on his look card: tap a count under ALL AVAIL on View-only Sched). (2) A question for him if it is still fiddly there: the
count is 20 × 14 px; Astra proposed a 28 × 28 px target on the phone's week, which costs a line of height on rows that carry
one (a measured layout — a picture first). **Place:** his look; then close, or the bigger target as its own small job.

**Current D566 batch evidence:** `raptor-port/docs/handpass/2026-10-04-accepted-taper-interface-batch.md`; accepted taper addendum and independent challenge linked there. All three scoped items built/checked with fresh independent R1PASS; owner look/Claude reads/authorized merge remain outstanding.

**Delivered D566 combined branch preview,5Oct26:** https://raptor-q27mo3zqg-kai-e2f5.vercel.app (source7f0b78bf; completed VercelSUCCESS/Preview9ZKYvXmsMPbWpc3RkwppHcWKzqqN). All3interface fixes checked/fresh independent R1PASS; owner look/Claude reads/authorized merge remain outstanding. Shipping method/limits in current accepted-batch evidence; no live authority.
