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

## Priority — open items only, by area (rewritten 18 Oct 26, D1024)

**How to read it:** one line an open item, grouped by area, the detail in the item below. In each area the small fixes
the agent can do with no answer from him come first; then what waits on him, or on an event. Finished work leaves for
`OUTSTANDING-ARCHIVE.md` by script, and how a job went live stays in git and its evidence sheet — never here (D1024).
Every item was checked against git and the code on 18 Oct 26. **Re-order this list whenever an item changes**
(§Maintaining).
*(The list as it stood from 24 Sep to 18 Oct 26 is in OUTSTANDING-ARCHIVE.md, moved whole on 18 Oct 26.)*

**His order, as it stands:**
- **Now (D994, 18 Oct 26):** the small fixes that need no answer or look from him, batched by area with one check each.
  The scheduling pages on a phone are done (pull request 533); the next area is next. The questions the backlog keeps
  for him wait until he says so.
- **Then (D495, D585):** the Tracker's progress graph once he releases it (D774), then caps and ops limits
  ([CAPS-OPS-LIMITS] — started only on his word, D568; its questions wait under D994), then one whole-app check.
- **At the end (D473):** the database step — the "Database step" group below.
- **When ChatGPT is back (not before 1 Nov 26 — D761):** the reads owed in [NO-ASTRA-LIST].
- **Before any collaborator is added:** the checks runner comes off this repo ([REPO-PRIVATE]).
- **His step:** the repo is public today for a short period (D106); making it private again, and restarting his PC's check runner, is his ([REPO-PRIVATE]).

**Schedule and amendments**
- [OIL-NOTIFY-SEEN] — three small things left: a puck dropped on nothing says nothing, the ALL AVAIL chip out of reach, a crew-list puck on a sideways phone never scrolls the board.
- [BOARD-SIDEWAYS-KEYS] — a phone on its side with the keys up: the Scheduler Board's heading fills the 200px left, so no box can show (found by the D1048 walk; older layout, low).
- [INNERHTML-REPAINT-SWEEP] — eleven screens hand React their markup as a new object every repaint, which React sets again — a box being typed in there is thrown away by any repaint (Quals fixed in [KEYBOARD-SCROLL]); sweep the rest (low).
- [IPHONE-CARET-CHECKS] — two checks only his iPhone can make, carried from the one-tap time boxes (D1047): dragging the caret with the space bar, and a long press (the loupe).
- [LOOK-PENDING-COUNT] — the 👁 look at the Original shows "1 pending" where the working copy shows "2 pending" (reproduce first).
- [HIST-JUMP-SEEN] — five small leftovers of tapping a change in the changes window — his to place.
- [PLAN-BANNER-DOOR] — the preview banner's "Switch to this plan" has no route a person can reach — retire it or give it one: his question.
- [PDF-PRINT-TWICE] — "Export as PDF" may print twice, first on a blank page — to confirm in real Chrome and on his iPhone.
- [FLAG-EXPORT] — the PDF prints the published version but still the whole week, not the day — sample PDFs for his look.
- [ROW-NO-TIME-MARK] — a "?" on a row with no timing or no end time (D361) — scoped with him first.
- [KBD-PUCK] — a puck cannot be picked up, put down, swapped or taken off by keyboard — a job of its own, his questions first.
- [REST-FIRST-CREW-HINT] — an empty formation gives no crew-rest hint for its first man — with caps and ops limits.
- [EOD] — End-of-Day "record actuals": designed on paper, nothing built — his word.

**Inputs and calendars**
- [TITLE-CHECK-SEEN] — three older small finds left: one line a man in "To go out", a re-accepted request read as a words change, a long OIL Earn name cut on a phone.
- [ALLAVAIL-CHECK-SEEN] — the ALL AVAIL / Event check's older small finds, none fixed.
- [CAL-CHECK-SEEN] — the calendar job's small finds still open: a phone on its side, two gesture finds, the windows' five, each man's LATE tag on a shared card.
- [INPUTS-LIVE-LEFT] — what the Inputs pages' work left: readings he has not answered, his iPhone looks, three unconfirmed observations.
- [SANS-PREVIOUS-REPORT-OFFER] — a previous evening's availability is not combined with the day's — his rule first; with caps and ops limits.

**OIL**
- [OIL-EARN-DAY-SWITCH-WORDS] — OIL Earn's "Nothing today earns" button reads like a status — new words are his, with a picture.
- [OIL-INERT-TAP-SILENT] — in OIL Earn a tap on a puck that cannot earn says nothing — should it say why: his question.

**Leave War**
- [HUMAN-RETEST] — the last re-test left: the Leave War links, with the 7 Sep phone check.
- [BACKLOG-ORDER] — his order of 21 Sep 26 for after the re-test: [LW-LOCKMARK], then [LW-WEEKDAY-WORK], then the database.
- [LW-LOCKMARK] — the war still locks a day with an old marker; per-record checks replace it.
- [LW-OFFER-ONLY-TAKEABLE] — two war sheets offer a choice the war then refuses — with [LW-LOCKMARK].
- [LW-SEL-HALF-LABELS] — the drag-selection sheet shows half-day leave as "FCL*" where the one-day sheet shows "<FCL".
- [LW-SETTINGS-SMALL] — two small ⚙ Settings edges: Reset order judges the whole roster; an armed "Really reset?" survives a page switch.
- [LW-DOZE-GUARDS] — a check: do the war's measuring guards run while its page is asleep?
- [LW-MONTH-MEMO-UNPINNED] — one cell changed redraws every month of every row, and no test pins the month's redraw guard.
- [LW-ROWS-STALE-NOTES] — notes and comments still name the old grid file for code that moved (documents only).
- [LW-PHONE-AWAY-ROW-MISSING] — on a phone a man archived and restored with a later post-in has no row (reproduce first).
- [PO-MOVE-DATE-DELETE-ASK] — does moving the date of a posting whose outcome is Delete delete him without its second ask? (test first).
- [LW-FROZEN-BAR-GAP] — for one frame no dates header shows while the page scrolls — shown to him first.
- [LW-WINDOWS-NONBLOCKING] — the war's other windows still block the grid behind them — which stay up is his choice.
- [LW-WEEKDAY-WORK] — the war cannot see ordinary weekday work — talk to him before building any of it.
- [LW-COMMIT-MANNING] — duty and commitments lowering the war's manning: parked "for now" (D998), his to raise.
- [LEAVE-YEAR] — yearly leave balances and carry-over — undecided ("we will do this next time").
- [LW-SORT-BY-FLIGHT] — sort the war by flight — his idea, not designed (D1001).

**Tracker**
- [TRK-PINCH-OLD-EDGES] — two older edges of the chart's pinch: a throw in Edit chart layout, a stale zoom label.
- [TRK-REFUSALS-UNTESTED] — tests only: several of the chart editor's refusals have no test.
- *(The Tracker's database-step items are in that group below.)*

**People, accounts and Quals**
- [QUALS-PINNED-COLS-REFLOW] — Quals' pinned header row can sit a few pixels off its column after a column changes width.
- [MEMBER-EDITPAGE-CHECK] — a check: a member sent to Edit Schedule by the developer bridge sees live-looking Amendments buttons.
- [GUEST-SAVE-WARNING] — a check: does anything a guest does get saved through the app's saver? If not, close it with the reason.
- [UNDO-POSTING-RECORD] — Undo for adding, archiving and restoring a person and for postings (D350) — his word.
- [RECALL] — bringing an archived man back fresh into Quals — a future feature, his word.

**Insights and Logic**
- [LOGIC-REDRAW-DROPS-TYPING] — the Logic page redraws just after it opens and can drop a value being typed.
- [LOGIC-DONE-FIRST-PRESS] — on the Logic page, the first press of Done straight after a changed setting is lost (older; found 19 Oct 26).
- [LOGIC-WORDS-WORKHOURS] — the Logic page says the long day and Insights hours of a line with nothing entered count from the default rally; they count from take-off less the step — his question, which is right (older; found 19 Oct 26).
- [BOARD-NARROW-DESKTOP-REMARKS] — the desktop board from 821 to about 1000 wide leaves the remarks 16px and each jet's line 189px tall (older; found 19 Oct 26).
- [STACK-LEFTOVERS] — four small loose ends from the Codex stack: two Insights edges (with the next change to its role question), a shared wording helper and an old audit script's three checks (with their own jobs), a "back to last published" button (only if he raises it).

**Look, words and the phone (the whole app)**
- [FLOATWIN-TWO-LINE-BAR] — the two movable windows open over the bottom of a two-line top bar.
- [READONLY-WEEK-WORDS] — a week read-only because a row will not read still says "open it on the device that created it".
- [BATCH-14OCT-LEFTOVERS] — older small faults found by the three builds' check (not caused by them): the Cancel-item sheet's chips wear the browser's ring, a raw id in a clash note, notes a screen reader is not told, stale comments, a test on the real clock.
- [WINDOWS-KEEP-KEYS] — the larger windows let Tab walk into the page behind them.
- [OG-TAG-OVER-COUNT] — the "OG" tag sits over the top edge of an ALL AVAIL count.
- [INP-OIL-CHIP-PHONE] — the green OIL chip once covered a request card's date on a phone; the card has been rebuilt since — look, then close or fix.
- [SHELL-SIDEWAYS-BAR] — the top bar takes 149 of 390 px on a sideways phone — his look.
- [VH-SHEETS-IPHONE] — some phone pop-ups may be cut off by the browser's own bars — only after his iPhone look.
- [COUNT-CHIP-PHONE-TAP] — a finger tap on an ALL AVAIL count: fixed in the test browser; his iPhone look owed.
- [WEEK-ADD-TAP-PHONE] — on a phone, "+ add" on the week arms nothing when the row already holds someone — left out of the phone batch, his choice.
- [APP-FONTS-NOT-LOADED] — the app names fonts it never loads, so each device draws its own — his call.
- [ONE-RULE-SMALL-WORDS] — ten small sentences and marks that read oddly — for the words pass; two wordings his.
- [UI-SLEEK-PASS] — the sleeker interface (D765): the first word rounds are live; the rest page by page, on his word.
- [PERF-RESIDUALS] — measured speed wins held back; two change wording or feel — his call.
- [ADMIN-DISPLAY] — an Admin "Display" area of fold defaults — not built without his go-ahead (D161).

**Checks and tooling**
- [CI-UNIT-SHARE-2-6] — GitHub's check is now 5m33s, set by one unit share (raptor 2/6, 5m29s; the next 4m31s): the split is by a hash of each file's path, not by time — rebalance (more shares, or a time-based split) for about a minute (low).
- [GATELOCK-STALE-LIVE] — the lock is broken as "stale" on age alone and can cut into a live run.
- [LW-HARNESS-VIEWER-PIN] — in the Leave War browser tests a role switch quietly undoes the pinned viewer.
- [SAVE-NOTE-TEST-GAPS] — two soft spots in the failed-save warning's browser test.
- [DOCSIZE-MERGE-CEILING] — the document check wrongly flags a merge of `main` that carried a size-marker move.
- [RULINGS-LF-PIN] — pin the rulings folders to LF line endings — with the next change that runs the full checks.
- [DEPLOY-DOCS] — the deploy workflow's header still describes the old Pages site.
- [ONE-RULE-LEFTOVERS] — the one-rule job's 55 behaviour ids are not yet checked by the rule check; a few comments to look at.
- [SHELL-SCRIPT-GUARD] — a guard that refuses a script typed into the command line — his go given (D811).
- [MERGE-ONCE-RECORDS] — finished jobs merged as one pull request, and record files that merge without clashing (D822).
- [MAIN-CHECKOUT-STALE] — step 2 left: a guide line to bring the main folder level after a merge that touches settings, hooks or skills.
- [REPO-TIDY] — clear the old worktrees (47 today) after safety checks; moving the walk pictures out is his call.
- [COMPACT-WHEN-MOD] — two of the compaction set-up's four checks still unseen — they need a chat that reaches 80%.
- [OVERNIGHT-RETRY-TRIAL] — the next /overnight night tries the keep-retrying setting (D885).
- [PROMPT-AUDIT] — he runs the guide check in a terminal and brings its list back (D886).
- [CI-FAIL-PICTURES] — GitHub's browser-test jobs keep no pictures of a failure — his call.
- [CHECK-TOOLS-HARDEN] — small hardening of the checking tools — his word.
- [WALK-COST] — make a walk cost fewer tokens — a proposal; his word starts it.
- [CODE-TIDY-AUDIT] — tests that no longer apply and the skipped browser tests — his to confirm; one leftover for the database step, one put to him only if a later feature needs it.
- [RULING-HOME-HOOK] — only if a chat is seen acting on a ruling's short line alone.
- [REPO-PRIVATE] — the repo is public for a short period (D106; public on 18 Oct 26): making it private again, and restarting his PC's check runner, is his step; the sharing half (adding developers) is his call — the checks runner comes off first.
- [NO-ASTRA-LIST] — the jobs that went ahead without a ChatGPT reader — put to him when it is back (D761).
- [OPUS-SECOND-READ-GUIDE] — the checking guide's line on when a second, blind Opus read is run: decided (D595), not written — it waits for Astra's and Sol's reads (D70) when ChatGPT is back, then his approval; and whether it still earns its place then.

**Documents and guides**
- [RULINGS-SPENT-PASS] — the rulings files' size markers were raised past their sizes (the Tracker's to 27,500 on 18 Oct 26): their spent and restated rulings archived after a fresh reader's check, the Tracker's D560 and D564 first; then the Tracker area split if still near its marker.
- [DOC-POINTERS-CODE] — code comments point at documents moved in the spring clean — with the next code change.
- [WORD-LIST] — the app's word list was drafted, never checked or filed — checked, then read before his approval.
- [SKILL-FUSION] — the planning guide's harder questioning and three proposals — each read before his approval.
- [CAL-JOB-LEFT] — the calendar job's leftovers: a stale line in the Codex guide, owed reads, looks never recorded.
- [IT-GUIDE-DATEBOX-SCRIPT] — the IT guide's picture script still types into date boxes that are buttons now — at its next re-shoot.
- [ITFLOW-OIL-RESHOOT] — re-shoot the IT flow guide's Leave War and OIL pictures — on his word (D403).
- [IMPECCABLE-UPDATE] — the design skill to v4.1.3 (D625): the calendar job it waited for is live; its reads and his word next.
- [START-CONTEXT-AUDIT] — the guard that stops a new chat's load growing back is not built; two of his own settings.
- [CONTEXT-START-SIZE] — left: the short skill-notes guide (F) and his own connectors setting (E).
- [SKILL-FUSION-WRITING] — the writing guide applied to how the agent writes to him (D835): to draft, have read and put to him — his to place.
- [GUIDE-MAP-ROWS] — the project guide's map has long rows that could move to its full text — his question.
- [EVIDENCE-RECORD-SIZE] — the big machine-written records and pictures: kept or moved — his call.
- [USER-GUIDE] — a guide for users and admins — wanted, not started, not urgent.

**Database step — at the end (D473)**
- [DB-STEP] — the move into the shared database: the table format written on his side, then the one adapter.
- [DB-READINESS] — group A is live; group B and the lock's screens come after the app is connected.
- [DB-SYNC-MODEL] — the sharing and day-lock design is done; five of its screen questions and the build wait.
- [IT-QUESTIONS] — the IT side's written answers (licences, plug-ins, retention, the first admin).
- [RESTRICTED-ENV-WORKFLOW] — a stand-in database and the working steps for the restricted environment.
- [ARCH-STACK] — the root-cause stack's steps 5 and 6: the record storage door, then the old machinery retired.
- [AMEND] — the amendment core's three missing parts, the saved content frozen with a publish among them.
- [GLOBAL-UNDO] — six small multi-user leftovers of the one undo.
- [UNDO-PUBLISH-ERASES-ISSUANCE] — an Undo of a publish deletes the issued version's row; it should withdraw it.
- [ELOG-LINE-AFTER-COMMAND] — a few history lines are saved as their own group, after their action.
- [NOTICE-RETENTION] — how long the bell's notices are kept, with the change history's rule.
- [SHARED-OPENS-DEMO-WEEK] — a shared store opens on the demo's week, not this week (before the first real deployment).
- [SETTINGS-LIST-ROWS] — a setting holding a list is one row, so two admins at once, the later wins — only if it bites.
- [ACCOUNTS-SEED-FIRST-WRITE] — on a fresh demo browser one tab's first account change can undo another's (demo only).
- [TRK-DISK] — the Tracker can delete an original before its copy is safely saved.
- [TRK-IMPORT-ONE-GROUP] — a Tracker Import is saved as many groups, not one (D983).
- [TRK-FIRST-ORDER-PLACE] — a stale tab can undo the first save of the chart order (D983).
- [TRK-ASYNC-STALE] — once storage is slow, a Tracker job re-checks its person and target after every wait.
- [CAL-UNDO-OTHERS] — every holiday of one war is saved in the war's one record, so in a shared database another man's holiday would block an Undo of a different one; how finely the war's records are saved is decided with the database (20 Oct 26 — not reachable today).

**Features he means to add — each on his word**
- [CAPS-OPS-LIMITS] — caps and ops limits: next in his order (D495); its questions, plan and build.
- [FEATURE-WISHLIST] — his list of features not yet designed (the Tracker's progress graph waits, D774).
- [XFER] — moving a man between squadrons with all his data — a milestone, with the database.
- [HIST-PER-PAGE] — a changes button on the Leave War and Quals — an idea; a mock-up first.
- [SIMILAR-APPS-LOOK] — what other apps like ours do: answered; whether any of it becomes a job is his.

---

## Items

### [CI-UNIT-SHARE-2-6] One unit share sets GitHub's check time (found 20 Oct 26, pull request 548's run; low)
**Seen:** with the Tracker smoke in two (pull request 548), the run is 5m33s and its slowest leg `unit (raptor 2/6)` 5m29s (the next, `unit (raptor 5/6)`, 4m31s; the Tracker parts 4m19s and less). Vitest's `--shard` splits the file list by a hash of each path, not by time, so one share carries the heavy files. **To do:** measure each raptor unit file's time on GitHub; then either more shares (the plan's 20 side by side is already exceeded by one with the Docs guard — merge two short legs first) or a split by time (a list of the heavy files spread by hand). **Place:** Checks and tooling — low, with the next change to the checks file.

### [HIST-JUMP-SEEN] Older small finds met by the check of the tap on a change (10 Oct 26) — none caused by that job; filed, not fixed
Met by `[HIST-JUMP-EMPTY-SEAT]`'s build and walk (`raptor-port/docs/handpass/2026-10-10-hist-jump-empty-seat.md` §8); each is older than that change and on `main`. His to place; low. **(1) On the Scheduler Board, the lines about the area strip and the In-time / Rally are listed but cannot be tapped** — the board draws those boxes since it gained them, but the list that says "the board cannot show this" was never updated (`raptor-port/src/ui/histbubble.ts` `NO_BOARD_CELL`; a test, `histlist.test.tsx` "a detail the board cannot draw…", pins the old answer). One line and its test. **(2) An extra man put under a desk and taken off again reads "Static moved place 2 → place 2"** in the changes window (`raptor-port/src/ui/changesmodel.ts` — the two lines are folded into one "move"); it should read as put on, then taken off. Words. **(3) With the board looking at an older version, a tap on a "warning hidden" line stays on the older version** (`raptor-port/src/ui/interactions.ts jumpToWarnLine` — the same gap the tap on a change had; its own door, its own test). **(4) On a phone the passing note lies over the changes bar's "Show" for its two seconds** — every note does; on `claude/day-window-compact` D731 (1) moves the note to the top while a WINDOW is up, and the bar is not a window. **(5) Two limits of the new landing, told to him (the sheet's §0):** on View-only Sched a row nobody is left on has nothing to ring, so the sentence alone is said; a read-only page would need each row to carry its own address to do better — and the printed week must stay byte for byte the reference's. **As filed:** each small.

### [AMEND] Amendment engine redesign — core building (decisions resolved)
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
- **Decisions RESOLVED (owner, 12 Sep 26):** plans SURVIVE as backups; all four roles
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
**Step 1A DONE + LIVE (13 Sep 26, PR #396):** stable ids on the scheduler side — input filing by
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
two 1b items were NOT quick wins on inspection and are split out (owner-approved, 14 Sep 26):**
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

**Seven deferrals, all still open, none blocking — they land at the multi-user / DB step:**

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

### [RECALL] Fresh recall from archive — future feature
An admin recalls an archived person back into Quals. **NARROWED 26 Sep 26 BY D284: a man archived while OVERSEAS
(D229) comes back as he was, with a prompt to update his quals — "fresh" below now covers someone who left flying for
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

### [XFER] Multi-squadron + transfer a person with their data — future milestone (with [DB-STEP])
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

### [TRK-DISK] Tracker migration/rename "safety check" reads memory, not disk — Decision A — OPEN
On upgrade or a course/syllabus rename, the app copies records, checks the copy in
**working memory**, then deletes the originals — so a failed disk write (storage
full) can delete an original before its copy is safely saved. Same gap on syllabus
rename. Largely self-healing; bites only near-full storage + tab closed before the
retry (more likely on iPhone). Never fixed, not logged as a limitation.
- **Fix within [DB-STEP]:** a real "it's saved" signal the delete waits for, rather
  than a piecemeal patch in three places. Or pull earlier on request.

### [HUMAN-RETEST] Re-test the earlier builds the way a person uses them (owner, 21 Sep 26)
**ORDER (D85 + D86, 23 Sep 26): two chats in parallel — the Tracker and the amendment system**, one
feature per chat. Amendment chat: port 4173, rulings from D90. Tracker chat: port 4180, rulings from
D120. Never two full gate runs at once (false failures under load). **The order of the other three — SET by him
(D147, 24 Sep 26):** the absence record, walked TOGETHER with [S4-HUNT-REST]; then change-recording; then the Leave
War links LAST, with the 7 Sep phone check folded in.
*(Its lines on which chat ran when — D153, D154, D155, D135, D125, every one spent — moved 24 Sep 26 to `OUTSTANDING-ARCHIVE.md`. The Tracker part is merged; the demo is done.)*
**The Tracker part is done — MERGED to `main` 23 Sep 26 on his "merge live", after his look** (evidence
`raptor-port/docs/handpass/2026-09-23-tracker.md`; rulings D120–D132).
**The amendment system part is done — MERGED to `main` 25 Sep 26 on his "merge live" (PR #434), after his look (all six steps; his three points became D107–D109 and the batch)**
(evidence `raptor-port/docs/handpass/2026-09-24-amendment.md`, his look card §13; the register
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`; its questions `[AMEND-D45-FILING]`,
`[AMEND-PHONE-APPROVER]`, `[AMEND-TEMPLATE-PUBLISHED]`, `[AMEND-NYS-WORDING]`, `[AMEND-REISSUE-DOOR]`,
`[AMEND-LOAD-FILING]`). The older-amendment unpublish ("BUG 1") was walked three deep and has not come back. Next
here, in his order (D147): the absence record with [S4-HUNT-REST], then change-recording, then the Leave War links.
**The absence record part — WALKED 26 Sep 26** on `claude/absence-record-d147-af6a50`, together with [S4-HUNT-REST]
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

**Do this after [OIL-AUTO-REMOVE] is closed and merged** (owner: "perhaps the next session we can do
that after this task is truely completed and free of bugs"). Start from
`raptor-port/docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md` §"the two the owner found",
which records why the static pass missed them, and from the scenario lists Fable and Codex wrote for
the OIL pass — the same scenario-design-then-execute shape is what this needs.

### [LW-COMMIT-MANNING] Duty & commitments must reduce the Leave War manning — the OTHER half of N17 (owner, 21 Sep 26)
**PARKED 18 Oct 26 — D998 ("No leave it for 1 for now"): the manning stays as built; not built, and not put to him again before he raises it or the Leave War's next batch.**
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

### [REPO-PRIVATE] Make the repo private and share it with developers — half done 23 Sep 26 (D59)
**18 Oct 26 (the backlog tidy):** the repo is PUBLIC today (GitHub says so) — made public for a short period under D106, for GitHub's faster machines. Making it private again, and restarting his PC's check runner (D89), is still open and his step.

**23 Sep 26, later: D88 ("I'll make it public for now") was REVERSED by D89 before he switched — it
stays PRIVATE** and the checks move to his own PC (`[CI-TWO-CORES]`). Why it mattered: 146 old branches
on GitHub still carry the D58 unit designation in their files, and `main`'s history in 14 commits.

**DONE, by him, 23 Sep 26 (D59): the repo is private**, reversing his own *"nvm disregard this
first"* the same day after a check found the unit named in the app. Pages is GONE (API 404), so the
publish job in `.github/workflows/deploy.yml` is OFF — it would fail every push and still bill —
with the gates left running. `README.md` corrected. **The app is viewed on VERCEL now.**

**Still open — the sharing half** (*"i would like to make my repo private, and share with developers
on my app"*). Route: Settings → Collaborators, by username, Write; they run it locally and do not
need Vercel. **Unmade question:** a collaborator here sees the uploaded original, the whole history
and every agent-facing doc. If that matters, the fresh single-commit repo below is the answer.
**Before the first collaborator is added (Astra SEC-101, 23 Sep 26): take the self-hosted runner off
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

**What a developer would find, measured 23 Sep 26.** `raptor-port/reference/scheduler.html` (435 KB)
is the original app, in the open, and load-bearing — `npm run test:reference` (the 728/0 line) runs
it; `PORTING.md` calls the job a port of it. `RAPTOR-Command-Brief.pptx` is gone from the tree but
lives in three commits, and **slide 1 still carries the service name** (binary, so D58's text sweep
could not reach it). Plus ~660 agent-taken screenshots, and 1,296 commits across ~25 branches all
carrying agent attribution and agent-facing docs. **A history rewrite does NOT clean GitHub** —
old objects stay reachable via PR refs and forks; only support can purge them. **A worktree does
not isolate any of this; it shares the same history.** The clean route is a FRESH repo with ONE
commit — app source only — which drops the deck, the original and the archive in a single step.

**No restricted material was ever uploaded — checked 23 Sep 26, do not re-run.** Clean: the uploaded
original (no marking of any kind), the deck's 10 slides, the demo data (63 invented callsigns, no
real names/IDs/DOB/next-of-kin/rank), and the stores, mission and area vocabulary (generic training
terms and compass points). The only `RESTRICTED` is the stamp the app PRINTS on schedules it
generates (`src/ui/printpdf.ts`) — the product working, not a trace of anything received.
`tracker.css`'s `.restricted` banner is dead style, rendered nowhere. **That check never opened the Tracker's SYLLABUS data** (222 events of course content) — and he has since ruled it out of scope (D62): leave it, never flag it again. Every other mention of the aircraft type is now "fighter squadron" or the bare "F-15" (D63, D64) — only that syllabus data keeps it.
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

### [DB-STEP] The shared-database step (Dataverse) — at the end (D473, 1 Oct 26; "starts now", D354, is replaced)
**At the end (D473, 1 Oct 26 — "Database at the end."):** the app goes into Dataverse once its features are built — the IT side's
own advice (the app about 60% built; once it is in, every change needs their review and merge, and no AI outside that environment
can sign in to check it). He, with his AI, writes the table format and schema for them to enter; `raptor-port/docs/data-model.md`
is that list, kept up to date as each feature is added. What the platform offers today: `[IT-QUESTIONS]` (1 Oct 26).

*(As written 29 Sep 26, replaced by D473:)* **STARTED 29 Sep 26 (D354):** the IT team is taking the app into Dataverse now; he means to keep working on the app beside it.


**Access changes take effect at once (Astra's read of `[ACCOUNTS]`, 26 Sep 26):** switching an account off, demoting
an admin or relinking a person must stop the old rights on his very next request, in every open tab and device — the
server checks the current account on every write (`raptor-port/docs/handover-dataverse.md`, the non-negotiables). Today
it cannot: accounts live in one browser and open tabs share nothing, so a change reaches that browser's next sign-in.
**ACCOUNTS (owner, D165, 25 Sep 26):** everyone signs in with their own defence mail account; the admin creates each
person in the app (callsign, name, admin or member) tied to their defence mail address; "View as" goes away. Per-person
"what changed since YOU last looked" follows (`[DRAFT-PENDING]`). The Microsoft side (access, licences, whether code
apps are allowed in the environment, the data rules for defence data) is his helper's, briefed by
`raptor-port/docs/handover-dataverse.md`.

**The data gets wiped on the way in (owner, D54, 23 Sep 26 — "this app is going to get wiped of
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

### [FLAG-EXPORT] PDF export — print the PUBLISHED version, current day only + a nicer agency-facing redesign — OPEN (follow-up of [CRP-FLAG])
**STATUS 24 Sep 26: part done** — it prints the PUBLISHED version with a per-day signed/working stamp, as a
white one-layout report (`raptor-port/src/ui/printpdf.ts`). **Left:** the current day only (it still prints the
whole loaded week), the 1–2 sample PDFs for him to pick, and the next-week peek's label. The "functional" bullet
below is done.
THREE halves now (owner, 15–17 Sep 26):
- **SCOPE — current day only (owner, 17 Sep 26): "my end goal is to export the current day
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
**Seen 10 Oct 26, not corrected (a helper's scan of the backlog's own status lines):** `[INSIGHTS-CLOSE-STAYS-VISIBLE]`, `[LOGIC-STICKY-SEARCH-COMPACT]` and `[TRK-FLIGHT-LABEL-READABILITY]` still say "owner look and Claude reads pending" although the workflow UI pass is live (PR #481, 6 Oct 26) — read each, then archive it or say what is left; `[ITFLOW-OIL-RESHOOT]` waits on a merge that has happened (PR #469).

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
**Waits for the database step — his word, D983 (17 Oct 26):** left out of the Tracker batch; nobody meets it today, and it touches the import the night before's check had just cleared.
**Place:** with `[DB-READINESS]` group B (one changeset per command on the wire). Seen by the group-A FULL walk (W5 C4, C5,
F1): ⇪ Import of a charts file wrote 7 rows in 9 change-log batches; a students file with a new course 11 rows in 6 —
every row named (since the walk's fix of its bookkeeping rows, W5 finding 1), but one confirmed action is many saved
groups, so a failure part-way leaves a half import stored — the very route his charts take to the database (D120:
Export → wipe → Import). **Do:** gather the import's reads first, then write everything in ONE Tracker gesture (the
delete-chart pattern, `core.js delSyl`) — one group, one batch.

### [TRK-FIRST-ORDER-PLACE] A stale tab can undo the first save of the chart order (filed 30 Sep 26)
**Waits for the database step — his word, D983 (17 Oct 26):** left out of the Tracker batch; nobody meets it today (group B's live refresh closes most of it).
**Place:** low — with group B's live refresh (which closes most of the stale window). Seen by the group-A FULL walk (W5
E5): on a store where no chart has a place yet (the shipped charts are stored at the Tracker's first opening without
one), the FIRST ⇅ Reorder syllabi places every chart; a second tab opened before it, adding a syllabus, places them all
again in its own old order — the first tab's order is lost (only the order; no chart, detail or mark). After the first
order save, every later one writes only the chart that moved (walked). On `main` a stale tab overwrites the whole order
every time. **Do:** give the shipped charts their places when the Tracker first stores them (its first opening), so the
first reorder writes only the chart moved.

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

### [LW-SORT-BY-FLIGHT] An option to sort the Leave War by flight — his intent, an idea not yet designed (18 Oct 26, D1001)
**His words:** *"I intend to have an option to sort according to flight"* (asked about the hidden personnel label — kept for it).
**Not designed, not started.** When he raises it: which men carry a flight (today the label is filled for ground crew, from
their flight in Raptor), where the option sits on the Leave War, and how it meets the categories and "Who wins" — put to him
with pictures (D853) before anything is built. **Place:** his to raise.

### [ELOG-LINE-AFTER-COMMAND] A history line worded from its action's result is still saved as its own group (filed 30 Sep 26)
**Place:** low — with group B (one changeset per command on the wire). The group-A FULL walk (H2) put every other edit's
line inside its own action's saved group — a line given just BEFORE its command opens is held and adopted by it, and
the board's structural edits now log first (`src/ui/board.ts`, `act`'s note). Left: a line whose words depend on how the
action landed, so it can only be logged AFTER its command — the OIL Earn switches (a man, an item, the day's blanket), a
plan switch (its "N differences pending"), a day template applied, a version loaded onto the working copy (its counts of
what was replaced or left). Each is its own saved group with its own batch (named, never bare), a moment after its
action's. **Do:** word the line inside the command (its latched effects see the result), e.g. `schedWrite(type, () => {
…; logAction(di, wordsFrom(result)) })`.

### [ADMIN-DISPLAY] An Admin "Display" area of per-section fold defaults — awaiting his go-ahead, do NOT build without it (moved from HANDOFF.md, 24 Sep 26)
**Deferred by him (D161, 24 Sep 26): "next time we revisit this again"** — put it to him again when Admin or the
section folds are next touched. (Its first half — the wave show/hide toggle leaving Admin — was done 30 Aug 26.)

- **QUEUED, awaiting the owner's go-ahead — an Admin "Display" area (owner,
  26 Aug 26; do NOT build without his confirmation).** Remove the wave
  Shown/Hidden toggle (`WAVEHIDE`) from Admin → Squadron config and replace it
  with a "Display" category holding per-section open/collapsed fold defaults,
  set separately for View schedule, Edit schedule and the Scheduler board —
  generalising the `PIOPEN` fold idiom to every section.

### [USER-GUIDE] A user guide for users and admins — wanted, not started, not urgent (moved from HANDOFF.md, 24 Sep 26)

- **A user guide is wanted, for users and admins** (owner, 10 Aug 26). Not
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
the day lock (rules 1–10, the `DayLock` table), §3 a week stored as a week row plus one row per day from stage 1, §11's
note, §12 Open questions 8 (a plug-in to make the lock strict) and 9 (how a member's input reaches a held day); the old
text moved whole to `raptor-port/docs/archive/data-model-2026-09-29.md`; `handover-dataverse.md` question 6 narrowed;
(3) the red team, both providers — brief `raptor-port/docs/superpowers/briefs/2026-09-29-day-lock-redteam.md`.
**The design is done, 29 Sep 26 — three red-team rounds, both providers, closed at his cap** (every finding and what
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
**D473 (1 Oct 26): the database comes at the end. Group A is built (phases 0–7, the last waiting on his look); group B and the
lock's screens wait for the connection — no more readiness work until then. New features keep to the same saving route, and the
table list is updated with each.**
**SPLIT (owner, D453, 29 Sep 26): group A — before the IT team settles its tables — (1) saving in small pieces, (4) never
seeding demo data, plus the design's shape work from `[DB-SYNC-MODEL]` (the schedule a day per piece, the single change
log, no week-deleting reconcile, the planning calendar's own records — and, from the design's red team: the command
layer's records per day (`sched.book`, `sched.mutes`), one changeset per command, and the day's effects worked out on
read instead of written into it — `data-model.md` §3 and §9 rule 9; settle §12 q9 with IT first); group B — after the app is connected, tuned
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
"seat emptied" history lines for the week on screen only (the requests', bids' and awards' lines are written whatever week
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
**Answers from the IT side, 29 Sep 26 (his chat with them, shown to the OIL award chat):** IT will CLONE the repo and all
work moves to the new repo; he keeps working with his AI as now, but opens a pull request there instead of merging — IT
reviews it and deploys it into the restricted environment after approving; minor changes consolidated into one pull request,
a major change its own; the Dataverse connection will add files to the code "for reference" (the tables' shape); it all
starts on HIS go-ahead to deploy. AI inside the restricted environment: only by opening the code in VS Code there and
connecting his own Claude subscription (Edwin). What this does to the workflow and the bug check: `[RESTRICTED-ENV-WORKFLOW]`.
**Heard from the IT side, 30 Sep 26 (his words: "what i heard no plugin for now" — heard, not yet confirmed in writing):
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
**And (30 Sep 26, `[DB-READINESS]` group A phase 5 — `data-model.md` §12 q11): the first admin of an empty store** — a build
setting naming his sign-in and his person (or a `Person` IT made) from which the app's first start makes his admin account,
or IT makes both rows; which do they prefer, where do app settings live, which value does sign-in hand the app (mail, UPN,
object id) and can the UPN differ from the mail? **And three the plan names for IT (§4):** a decimal `sortIndex` on `Input`,
`Person`, `LeaveBid` (order `(sortIndex, key)`); the app's own ids as unique alternate keys on every table (plus the design's
natural keys — a week's start, week + day, a remark's date, person + counter); `InputType` and `LeaveCounter` seeded by IT
from the app's shipped lists. **The whole list — 29 questions in four groups (A: before the tables settle; B: the day lock;
C: the design's other open questions; D: environment and process), each with its context — was given to him as a
copyable text on 30 Sep 26, to send to IT; record their answers here as they come.**
**Answers from the IT side, 1 Oct 26 (told to him in person, relayed in chat the same day — heard, not in writing):**
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
**The IT side's written replies, 1 Oct 26 (to the Tracker proposal he forwarded — one syllabus row shared by its courses, its
events and its drawing as JSON text in a multi-line column, marks per student; D474):** (1) *the format of the table list* —
"doesn't matter. Just make sure it's readable by a human"; (2) *the prefix and naming* — the publisher prefix is decided when
the tables are created; names can be anything that accurately labels what the table is for; (3) *the 2,000-row limit* — **per
request, with paging** (not a hard cap), so a large read is asked for page by page and filtered on the server; (4) *whether a
multi-line text column suits the two JSON columns* — he cannot say until he knows the largest chart's size. **Measured the same
day and sent to him** (`raptor-port/src/tracker/data/`, the four shipped charts): the largest has 212 events and 285 links;
its events are about 21,300 characters of JSON and the largest drawing about 33,200 — some 55,000 together, against Dataverse's
documented ceiling of 1,048,576 characters for a multi-line text column (to confirm in his environment). No objection was
raised to the proposal itself. **Was to ask (answered above):** an example
of the format he wants the tables written in (one table, his way), the publisher prefix and naming rule, and what exactly the
2,000 limit is.

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
**Also for the next re-shoot (12 Oct 26 — D773; Fable's second read of the one-rule job, finding 3):** the deck's "Print, export and data" slide still pictures the Inputs List's "Export to Excel", a button that is removed. Its sources are corrected (`raptor-port/scripts/itflow/j/export.mjs`, `content.mjs` — the shot is gone, the Admin → Data step is step 3); the built deck keeps the old slide until he asks for a re-shoot (D403).
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

### [HIST-PER-PAGE] A changes button on the Leave War and Quals, showing that page's changes — an idea, filed (D349, 28 Sep 26)
His question during the D347 mock-up: *"should i have a edit history button too for each page thats applicable"* — answered
not in the change-recording build, and filed on his "ok" (D349). Today the one changes window (Edit Schedule's clock, the
day counts) already lists inputs, Leave War decisions, OIL awards and Quals changes as lines on their day (D263, D338 (7)),
so nothing made elsewhere is lost; what a per-page button would add is a view FILTERED to that page's changes, where members
look (who approved or refused my leave, who changed my quals — D169's transparency). It would also need changes the window
does not record today (an account change on Admin, a rule on the Logic page) if those pages were included. **To do:** a
mock-up first (the Leave War and Quals first; Admin and Logic only if he wants them), then his word. **Place:** after the
change-recording re-test; none blocking.

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

### [LW-OFFER-ONLY-TAKEABLE] Two Leave War sheets offer a choice the war then refuses — low (the absence-record re-test's re-walk, W3, 26 Sep 26)
Found by the war re-walker on the rebuilt app; no record is harmed and each refusal is said, but the principle the
re-test applied elsewhere (item D, W5-F4: a half is offered only when it can be taken) is not kept here:
1. **A morning the WAR approved, then a tap on that day:** the bid sheet offers Whole day (already picked) and AM, and
   pressing LL is refused "That time is already taken by LL — clear it first." The same morning filed on the Inputs page
   offers only PM (the free half, `MatrixRows.tsx freeHalfBeside`, runs only for Inputs-filed leave — `raptorOwns`).
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

### [RESTRICTED-ENV-WORKFLOW] Working and bug-checking once the app lives in the restricted environment (filed 29 Sep 26)
From IT's answers (`[IT-QUESTIONS]`, 29 Sep 26): the live app runs only inside the restricted environment, which this
PC's AI cannot reach; changes go to IT as pull requests. **What is lost:** the agent can no longer drive the REAL app on
the REAL database (the walk); a Vercel link per branch; seeing what only the real database does (security roles and
sign-in, request limits, network slowness, real data volume). **What is kept:** every change is still built and checked
here — the app reaches its database through ONE door (`raptor-port/src/storage/`), so a stand-in database behind that door
lets every gate and every walk run as today. **To do:** (1) a mock Dataverse backend behind the storage door, shaped from
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
**The Tracker batch, 17 Oct 26 (his word with `/overnight`):** its open items sorted and round 1 of his questions drawn — `raptor-port/docs/superpowers/plans/2026-10-17-tracker-batch-triage.md`; the progress graph stays out (D774).
**D774 (12 Oct 26, *"I'll not work on the tracker progress graph yet"*): item 4, the Tracker's progress graph, is not started — questions, design or build — until he says so; the order below is unchanged.**
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
**Original order — D495 (2 Oct 26, "the batch order looks ok"); the D567 narrowing below is CANCELLED by D568:** (1) `[WORKSPAN-NEGATIVE]`; (2) Insights — item 3, with
`[INSIGHTS-BOARD-DOOR]`; (3) the workflow UI pass — item 5, `[CSS-SPLIT-BY-SCREEN]` its first step (D493); (4) Inputs — item 1,
with `[INP-TILL-STALE]`; (5) the Tracker — item 4, with `[TRK-FILE-TRANSFER-SPLIT]` and its small finds; (6) the rules —
item 2, caps and ops limits, FULL tier; (7) one whole-app check. **Who builds — D494:** until the reset (Monday 5 Oct 26,
19:00) Codex plans and builds, started by one small job to prove it (`[DISCARD-MARKS-REMOVE]`); **D496:** Astra plans/coordinates and independently reviews Sol 6.1's builds; Sol challenges Astra plans. Claude reviews each branch
after the reset, before any "merge live". Insights is built. D546 (4 Oct 26) defers the first two workflow recommendations
(D542/D543: build/correct a day first, phone quick checks/small edits first); he will introduce ideas during building.
D544's times/notes keyboard entry keeping Enter/Escape stays pending. The usability/file-split distinction has been explained;
no layout is approved. D545 adds [SCHEDULE-TAB-ROW-FLOW]; D550–D553 settle both surfaces, available boxes only, reverse Shift+Tab and final-day exit; D554 chooses B flight sequence after the shown comparison. D555 includes open headings/notes through displayed section order. Product scope settled; independent plan/challenge precedes source work. The other feature batches' questions wait.

**Cancelled priority — D567, cancelled D568, 5 Oct 26:** owner requests a new chat for caps and ops limits,
ahead of Inputs and Tracker. The remaining order is caps/ops → Inputs → Tracker →
one whole-app check. This chooses the next batch; its policies and design still
need the owner. See [CAPS-OPS-LIMITS]; it does not accept the latest UI preview,
waive owed reads or authorize a live merge.

**Current direction — D585, 5 Oct 26:** Inputs/SANS calendar is on hold; preserve the completed preview and context. No more design/build/Claude vetting until owner resumes. Other outstanding tasks may be discussed; no new batch starts automatically. Existing D495 later order remains Tracker progress graph → caps/ops limits → whole-app check, with database connection at the end; this pause does not approve another build.

### [CAL-UNDO-OTHERS] Undo after another person's change: the refusal does not say who, and a holiday on another date blocks it (the calendar job's bug check, 8 Oct 26)
**Checked 20 Oct 26 (the Inputs batch, `raptor-port/docs/handpass/2026-10-20-inputs-small-fixes.md` §0) — NOT reachable in the running app today; (b) kept for the database step.** Walker H made both by changing the signed-in person IN PLACE through the developer's bridge. In the app another person must sign in, which ends the first person's Undo list (D148, `undo/timeline.ts endUndoSession`), and no second tab shares changes. Another person's change will reach the list only from the shared database, as a "remote" step, and that path already refuses naming who (`undo/timeline.ts outOfBandWords`, pinned by `undo/timeline-cr.test.ts`) — so (a) is closed. (b) stands for that future: `leavewar/state/store.ts holidayRun` saves every holiday of a war inside the war's own period record, so one man's new holiday would refuse another's Undo of a different holiday of the same war — decide how finely the war's records are saved, with `[DB-STEP]`. **Place:** the Database step group.
**Found, not fixed — reported by one walker, not yet seen by the host: reproduce first.** Walker H (X-10), `raptor-port/docs/handpass/parts/cal-H.md`, scripts `raptor-port/scripts/handpass/cal-H-*.mjs`, pictures `raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/H/x10-*.png`. (a) Saber files a meeting for three; a second admin changes its remark; Saber's Undo is refused with "A later change touches the same thing — undo that first" — D148 has the refusal say WHO; the same line for a holiday renamed and a Required cell retyped by the other. (b) Saber adds a holiday on 12 Aug, the other admin adds one on 19 Aug, Saber's Undo of his own is refused — a different date is not "the same thing" (a different Required day and a different group input DO undo cleanly). Likely place: how the Leave War's holiday commands name what they touch for the Undo's "changed since" test. **As filed:** medium-low — an Undo that refuses too readily loses nothing. The sheet: `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §7.

### [TITLE-CHECK-SEEN] Older small finds met by the title's check (9 Oct 26) — none caused by the title; filed, not fixed
**Fixed 10 Oct 26 by `[SEEN-BATCH-2]` (on `claude/day-window-compact` — live since 10 Oct 26, PR #488):** (2) the take-off message names the request (D731 (5)); (4) the "Unsaved changes" question comes to the front; (5) Enter in Remarks or Title no longer opens a second "New input". (10) was withdrawn — a member can leave himself out. **Still open here:** (1), (3), (8).
**The title's list, placed by him (D730, 10 Oct 26):** the finds here that need no choice from him are fixed as a second batch after `[INPUTS-VET]`'s build, with its own tests and check; those that need his choice are listed for him.
Met by the walkers of `[INPUT-OWN-TITLE]`'s check (`raptor-port/docs/handpass/2026-10-09-input-title-check.md` §5.3) and placed by the host as OLDER than that change — each behaves the same with an input that has no title. His to place; several go away with `[INPUT-LIST-AS-DAY-CARD]` (D718). **(1) "To go out" lists a shared input's change one line per man** — D663's reading (2) said the group is one item on every tab; the waiting-to-go-out list (`raptor-port/src/ui/pendlist.ts`) never grouped (walker B, scenario 37; the count of changes is rightly one per man until D661's single row is built). **(2) The take-off message says only "Accept undone"** and names no input (`raptor-port/src/ui/interactions.ts`; walker B, 40). **(3) A request taken off BEFORE a day is published, changed while off, then accepted again reads in "To go out" as a change of its words** ("Sports day → Games afternoon"), not as an addition; the count is right (walker B, 41). **(4) On a phone, the "Unsaved changes" question is raised BEHIND the day's window** when another input's card is tapped with a draft open — the day's window comes to the front and covers it until closed (walker A, 9; the host drove it with a remarks-only draft: the same). **(5) Enter in a new input's Remarks box (and now its Title box) saves it and a blank "New input" window opens again** (walker A; the host drove both boxes: the same). **(6) The List's pencil row:** its tick and cross cannot be reached by Tab, and its end-time box is clipped on a desktop (walker A) — goes with D718. *[GONE 10 Oct 26: the pencil's row was removed with `[INPUT-LIST-AS-DAY-CARD]`; the row's Name is a button.]* **(7) On a phone's List the OIL button is drawn over the date** on a weekend input's card (the mock-up's picture `b-list-as-built`) — goes with D718. *[GONE 10 Oct 26: the phone's card carries no OIL button — the answer is in the input's window.]* **(8) In OIL Earn on a phone a long item name is cut on one line** where the same row wraps with the mode off (walker C). **(9) A 900-point-tall desktop needs scrolling to reach Save in a shared input's window** (walker A). *[FIXED 10 Oct 26 with `[INPUT-LIST-AS-DAY-CARD]`: the window's Delete, Cancel and Save are pinned to its foot.]* **(10) A member filing for "Several people" cannot switch his own puck off at creation, only in the saved window** (walker A). **As filed:** each small; (4) is the one a person would trip on.

### [ALLAVAIL-CHECK-SEEN] The small finds of the ALL AVAIL / Event check that are older than that job, none fixed (9 Oct 26)
**Found, not fixed** — each seen by a walker of the check (`raptor-port/docs/handpass/2026-10-09-all-avail-event-check.md` §5.3; the walkers' reports `raptor-port/docs/handpass/parts/aa-A.md`, `aa-B.md`, `aa-C.md`, pictures under `raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/`), each true of ANY input, not only one filed for ALL AVAIL. **The Inputs List's pencil:** saved with nothing changed it still makes an Undo step, a "changed by" stamp and "Input updated". **The windows:** Escape with the keyboard still in the editor's remark box, after the day's window was pressed to the front, closes both windows and the unsaved draft (beside the Escape items of `[CAL-CHECK-SEEN]`). **A year with no Leave War period:** on a weekend there the OIL question is asked and a Yes saved, and nothing on the Inputs page says the period is missing (D19 says it on the schedule side). **The editor's calendar:** "till <date>" is added to the remark of a one-day input; a tap on the day already picked, then another, gives one day where one tap gives a range. **A published day's count:** changing an input's person to or from a placeholder, or dragging its puck off the row, reads "2 pending" for one act (the input, and what the day earns); "What this day earns changed" names no cause, where a Logic change is named exactly. **Undo's words:** "Undo — a personal input" for any one input — neither the person nor the kind (`raptor-port/src/undo/describe.ts`). **The ALL AVAIL window on a phone:** a 1–2 px speck where a desktop has its resize corner (D77 — no phone corner). **Print:** the printed page and the schedule's CSV carry flying lines only — no Ground Programme row of any kind. **As filed:** low, his to place; ride with the next Inputs or amendment batch (D490).

### [CAL-CHECK-SEEN] The small finds of the calendar job's bug check, none fixed (8 Oct 26)
**Fixed 10 Oct 26 by `[SEEN-BATCH-2]` (on `claude/day-window-compact` — live since 10 Oct 26, PR #488):** the editor's four (the note left after an undone drag; a reader's dead "Change…"; the filer told "Only <himself>…" with the switch off — D731 (8); a group's OIL question headed with one name); the Quals save note; Escape while a planning note is typed (D731 (9)). **Answered:** several picked days open the window at once — kept as built (D731 (11)). **Still open here:** a phone on its side; the two gesture finds one walker saw; the windows' five (the "Calendar" window on a 568-tall phone, Escape on a day's Delete question after a press behind, Escape while a control behind has the keyboard, a settings window left up on a page change, "Calendar…" over the SANS day); each man's LATE tag on a shared card.
**The calendar job's list, placed by him (D730, 10 Oct 26):** the finds here that need no choice from him are fixed as a second batch after `[INPUTS-VET]`'s build, with its own tests and check; those that need his choice are listed for him.
**Found, not fixed** — each with its walker's report under `raptor-port/docs/handpass/parts/cal-<letter>.md` and pictures under `raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/<letter>/`. **A phone on its SIDE (844 × 390):** the number pad covers the Required cell being typed (B); windows lie over the top bar's Undo / Redo, the month's arrows and gear, and the failed-save band's Retry until dragged or closed (A, H); the SANS Highlight list runs off the foot (D). **Gestures:** the first tap after a finger-drag of a counter in Rearrange is ignored, the second works (B — one walker, not seen by the host); Escape pressed during a bar's mouse drag leaves the picked-up copy following the pointer until the next drag (E — one walker, not seen by the host). **Windows:** the "Calendar" window on a 568-tall phone is 588 tall once dragged and brought back, its last week cut (C); Escape on an opened day's Delete question, after a press on the page behind, closes the whole day (C); Escape does nothing while a control on the page behind has the keyboard (the shell's rule, as built — C); a settings window left open stays up when the page is changed (C); "Calendar…" from the SANS day at 1440 lands exactly over that day's window (A). **The editor:** after a bar's drag is undone the "changed while this window was open" note stays, with "theirs" equal to the value at opening (G); a reader's OIL row draws a "Change…" button that cannot be pressed (F); with the members' switch off the filer is told "Only <himself> — who filed it — or an admin can change this" and offered "Take me out" (F); a group's OIL question after a drag is titled with one man's name (F). **The List:** its row does not flash on Undo or Redo where a month's bar does (E). **Outside this job, seen in passing:** the Quals save toast reads "Quals saved (prototype — writes to Dataverse in the full build)" — a prototype caveat on screen (the 25 Aug 26 rule: UI copy reads production) (D). **As filed:** low, his to place; the sheet's §7.

**Added 9 Oct 26 (the look at D683):** Escape pressed while typing a planning note in an opened day closes the whole day, where it might be expected to leave only the note box — the window shell’s rule (Escape closes the window in front), older than D683.
**Added 9 Oct 26 (Astra, scenario 2.4 of the day-window check):** on a shared input’s card in an opened day, each man’s own LATE tag is a tag with a hover title, not a button — a finger on a phone cannot open what it says (the whole-entry LATE tag is a button and can). `raptor-port/src/ui/InputsCal.tsx` (`idy-manlate`). Not fixed: it is the calendar job’s, seen while checking the next job.
**ANSWERED 10 Oct 26 (D731 (11) — kept as built, the window at once); as it was filed — Still his to answer (carried from the merged calendar job's handoff, 9 Oct 26):** picking several days on the Inputs month opens the new-input window at once, where the drawing had a bar to confirm first — he was shown both and withdrew his answer; keep as built until he says.

### [INPUTS-LIVE-LEFT] What the Inputs pages' work left open when it went live (pull request #488, 10 Oct 26) — readings he has not answered, his looks, three unconfirmed observations
**Status: OPEN — nothing to build. Filed 10 Oct 26, when that work's eight finished items went to `OUTSTANDING-ARCHIVE.md` and its block left `HANDOFF.md`, so their open ends keep a home.** Pull request #488 merged on his "merge live" on 10 Oct 26 and is live: the day window's two jobs (D684–D695, D701), ALL / ALL AVAIL and the kind Event (D700, D702, D711–D714), an input's own title (D715–D717), the input card (D718–D725), the design vet's changes (D726–D729), the second batch (D730, D731) and the day's title box (D732). Archived with it: `[INPUT-ALL-AVAIL]`, `[INPUT-EVENT-KIND]`, `[INPUT-OWN-TITLE]`, `[INPUT-LIST-AS-DAY-CARD]`, `[INPUTS-VET]`, `[SEEN-BATCH-2]`, `[DAY-TITLE-ESCAPE]`, `[CARD-CHECK-SEEN]`.
**(1) Readings he was told and has not said yes or no to.** Each is how the app is built and live; a "merge live" is not a yes to any of them (the agent's reading). Never assume one is approved; put one to him again only when a job touches what it is about. They are the §0 of each check's sheet under `raptor-port/docs/handpass/`: `2026-10-09-all-avail-event-check.md` (five readings); `2026-10-09-input-title-check.md` (six); `2026-10-10-input-card-check.md` (ten readings — its three questions are answered: D725, D727, D728); `2026-10-10-inputs-vet-check.md` (twelve); `2026-10-10-batch2-check.md` (nine); and, from the changes-window fix that went live the same day (pull request #489), `2026-10-10-hist-jump-empty-seat.md` (six). The day window's two questions (`2026-10-09-day-window-compact-check.md` §0) are answered — D709, D710.
**(2) His looks on his iPhone — the look cards he has not reported on:** §8 of the day-window, ALL AVAIL / Event, title, input-card and vet sheets; §10 of the batch's sheet (six steps; step 6, on his PC, is the title box); §11 of the changes-window fix's sheet (four steps). A find of his from any of them is a new item.
**(3) From `[INPUTS-VET]` — "to check before any fix (found, not confirmed)", never reproduced since:** hours reading am / pm in a form's time boxes (reproduce on his iPhone first); a saved shared input's window opening on the whole people picker; the desktop month re-laying when a day opens.
**(4) Not walked, as each sheet says:** a phone on its side; the two lines only his iPhone can prove and the OIL figures on the Leave War (the batch's sheet, §6); the Scheduler Board's own Add dialog with ALL AVAIL (the ALL AVAIL / Event sheet — its list is the shared one).
**(5) The IT flow guide still pictures the Inputs list's old add form** (gone since D729), and its picture-taking scripts press that form's buttons — re-shot only on his word (D403); beside `[ITFLOW-OIL-RESHOOT]`.
**Still filed, each its own item:** `[TILL-FROM-DATES]` (D728 step 2), `[DELETE-LIST-CAL-NOTES]` (D710), `[TITLE-CHECK-SEEN]` (its 1, 3 and 8), `[CAL-CHECK-SEEN]`, `[ALLAVAIL-CHECK-SEEN]`, `[HIST-JUMP-SEEN]`, `[WALK-FINGER-NOT-LOCATOR]`.
**Place:** none — a list to read before the next Inputs job; (3) rides with it.

### [CAL-JOB-LEFT] What the calendar job's handoff block still owed when the block left `HANDOFF.md` (pull request #487, live 9 Oct 26) — filed 10 Oct 26
**Status: OPEN — small, none of it a fault in the app.** The block of `claude/inputs-sans-calendar` was removed from `HANDOFF.md` on 10 Oct 26 (its work merged); a helper read all of it against the backlog, the rulings and the sheets, and these were the lines with no other home. Each is quoted from the block as it was written.
**(1) `AGENTS.md` is stale:** "`AGENTS.md` on `main` still names the calendar as "the job on hold" (a working guide — D70's two reads before it changes)". The calendar job is built and live; the line to correct is its first paragraph ("the job on hold is the SANS availability calendar's new layout"). A second stale sentence there: "D567–D585 stay reserved for the calendar branch" — those rulings are all on `main` now. One round each by Astra and Sol 6.1, then his approval.
**(2) Two reads never run:** "Astra's D138 read of the short lines D658–D664 is owed with the first code read", "Astra's D138 read of D665's short line, with D658–D664's" and "Astra's D138 read of the short lines D676–D679 is owed with D658–D665's" — a meaning read of those short ruling lines against their full rows (no brief for it exists under `raptor-port/docs/superpowers/briefs/`); and "D70's two reads of the one sentence added to `.claude/rules/doc-structure.md` are owed" (D667's sentence on unattended runs). **Added 10 Oct 26:** the same meaning read of the short lines D734–D741 (each is its full row's own first sentence, word for word) — with the read of `[GROUP-INPUT-ONE-ROW]`'s plan.
**(3) The size markers:** "the rulings files for the scheduler and for How we work are over their size markers (D611: the scheduler's stays one file — raise each marker with its reason in a documents-only change, D29; never trim a ruling)" — RAISED 10 Oct 26 with this filing (`raptor-port/scripts/docsize.mjs`, the Leave War's too); what is still to do is `[RULINGS-SPENT-PASS]`.
**(4) An old page:** "**Owed from D665:** the main mock-ups page (https://claude.ai/artifact/U3WNp6VARTdVeDP5cUoQvD) still draws the rows under the Event rows — add a "Since drawn:" line under those pictures when that page is next published".
**(5) Seen, not filed until now:** "(not shown to be a fault a person would meet): in Rearrange on a desktop, a row dropped within about four pixels of the screen's bottom edge does not move."
**(6) His looks nobody recorded:** "**OWED: his look on his own iPhone** — whether "Legend" stays on the second line in Apple's font cannot be measured here (15px to spare at 390 on this PC); if it drops to a third line for him, the room is in the chips' side padding (`chrome.css`, "LINE 2")" — the Leave War's phone header, `raptor-port/docs/handpass/2026-10-08-lw-phone-header.md`; the calendar check's look card line on the people picker ("puck spacing: tighter, as drawn?" — `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §8); and D675's caution, "the app also has an Inputs calendar and a SANS calendar, so "Calendar…" inside a calendar's own settings may read oddly — look at it when those settings are built" (they are built and live; he has not said). Each stands as built unless he says otherwise.
**Place:** (1) and (2) with the next change to a working guide (`[WALK-FINGER-NOT-LOCATOR]` is one); (4) when that page is next published; the rest, none.

### [RULINGS-SPENT-PASS] The rulings files have grown past their size markers: archive what is spent or replaced, and put the scheduler file's size back to him (D611) — filed 10 Oct 26
**18 Oct 26 (the backlog tidy):** `.claude/rules/decisions/tracker.md` stood at 26,665 bytes on `main` (marker 23,500) with D1002–D1007, D1014, D1018 — the document check failed on `main` itself. The marker was RAISED to 27,500 with its reason (`raptor-port/scripts/docsize.mjs`), so documents-only changes pass; the 17 Oct note below said the next crossing is the time to split the Tracker area. **To do here:** first the candidates D560 and D564 (a fresh reader, D971), then split the area if it is still near its marker.
**17 Oct 26:** `.claude/rules/decisions/tracker.md` crossed its tripwire (21034 of 20500 bytes) with D979–D982 — deferred by D29 (its branch carries code); candidates at the tidy: D560 and D564 (changed by D563–D566, the wing built and live — a fresh reader checks whether D566 restates them in full, D971).
**Status: OPEN — a documents-only job of its own; nothing is trimmed (D136).** On 10 Oct 26 the scheduler's rulings file held 95,514 bytes (marker 69,000), How we work 23,032 (22,000) and the Leave War's 34,273 (32,000): the calendar job and the Inputs pages' work added about 120 rulings (D617–D733) in four days. The three markers were raised that day so the document check passes (`raptor-port/scripts/docsize.mjs`, each with its reason). **Still to do:** (a) read those files' rows — and the Inputs pages' file, `.claude/rules/decisions/inputs.md`, which took 101 of the scheduler's on 13 Oct 26 (D802) — for rulings that are SPENT (a one-off permission used: "built after the merge", "built in the next chat", a mock-up asked for and since chosen) or REPLACED by a later ruling, mark each in its full row and run `node raptor-port/scripts/backlog-archive.mjs --rulings` (`DECISIONS.md` step 2) — a meaning read by Astra of whatever short lines are rewritten (D138); (b) ANSWERED 13 Oct 26 by D802: the Inputs pages' rulings have a file of their own; nothing further to put to him.
**Seen again 16 Oct 26 (pull request 519 merged with the overs deferred, D29):** How we work 40,313 bytes (marker 39,500), the Scheduler's 94,224 (92,000), the Inputs pages' 35,026 (32,000); and `plain-language.md` and `shipping.md` over their tripwires. All five markers RAISED the same day with their reasons (`raptor-port/scripts/docsize.mjs`), so documents-only changes pass again; the spent-row pass that brings them down is still this job.
**Place:** the agent's — a documents-only chat; (b) is his.

### [SHELL-SCRIPT-GUARD] A guard that refuses a script typed into the shell — eighteen skill notes ask for it (filed 13 Oct 26 by the skill-notes review; his go to build it given the same day — D811)

**What keeps happening.** On this PC a script handed to the shell inline (a here-document, `node -e`, `python -c`)
loses its backslashes or fails on an apostrophe, often with no error: a regular expression arrives as a backspace
character, a test asserts the wrong pattern, a file is written with real line breaks inside a string. The rule
("write the script to a file with the file tool, then run the file") has been in memory since 28 Sep 26
(`bash-heredoc-apostrophes-fail`, `node-e-in-git-bash-mangles-escapes`, `python-edits-crlf-trap`) and in several
handoffs — and the same mistake was logged again in twelve later chats, three times in the chat after a note said
"stop adding notes and build the guard" (observations 246, 259, 402, 411, 415, 469, 472, 495, 500, 512, 518, 526; in
part 248, 311, 328). The same family: an in-place stream edit (`sed -i`) that rewrote a whole file's line endings
(403, 460).

**To build (small; no app code):** a check that runs before every shell command, as the background-command guard
does (`.claude/hooks/bg-cwd-guard.mjs`, D162), and REFUSES, with the sentence "write the script with the Write tool
and run the file": (1) a here-document, or an inline `-e` / `-c` script, whose body holds a backslash followed by a
letter or an apostrophe and which writes or edits a file; (2) `sed -i` on a tracked file ("use the editor tool").
**Conditions from two notes about writing such a guard:** it is wired `if …; then …; else exit 0; fi` — the
`test && run || exit 0` form turns its own refusal into "allowed" (270) — and proved live with one refused and one
allowed command; what it assumes about the harness is MEASURED first and written at its head, and its tests take the
environment as an input (285). **A cheaper alternative, if he prefers no new guard:** one committed helper that
applies a list of exact find-and-replace pairs read from a file, so no script is typed at all (469).
**Place:** allowed by him (D811, "Approve all"). The agent's placing: a small job on its own branch, read by a fresh
Opus reader, after the Calendar job unless he says sooner; it removes the commonest lost round trip of every chat.

### [CHECK-TOOLS-HARDEN] Small hardening of the checking tools, asked for by seventeen skill notes (filed 13 Oct 26 by the skill-notes review; none urgent)

Each line is a place where a tool allowed a mistake that a guide now only warns about. Scripts under
`raptor-port/scripts/` — no app code.

- **The walk helpers (`scripts/handpass/lib.mjs`, `trk-lib.mjs`).** Refuse to save a world from a page opened on the
  "start fresh" address (237, 506). One setting for a run's output folder, and a refusal to write a picture or a
  step log over a file git already tracks unless the run is named a re-walk (239, 247, 338). "Fill this field"
  with a short wait and an error that names the selector and lists the fields the window does have (508). A
  `pressLeave` helper for the Leave War that answers "tap the same leave again" (313). The "N pending" chip's
  selector, which now also matches "N changes" (443).
- **The check lock (`scripts/gatelock.mjs`).** A heartbeat from the run it protects, so "stale" means no heartbeat —
  not two hours of age, and not the process id of the command that took it (342). `run` records its own process, so
  the next taker can tell a stopped run from a live one (391). `run` checks its `--from` folder holds a
  `package.json` before taking the lock, and its usage line shows the form that works from both folders (504). Its
  header still says "one test file needs no lock" — bring it in step with the corrected rule (444).
- **The break-test runners (`scripts/handpass/breaks.mjs`, `breaks-browser.mjs`).** Check every entry of a list
  before the first break, and restore the true build on every way out, an error included (471). A subset chosen by
  a pattern, and the result written as a table into the evidence folder (540).
- **The document check (`scripts/docsize.mjs`, `backlog-archive.mjs`).** Refuse a REPLACED or SPENT mark written in
  the wrong cell of a ruling's row instead of reading it as a narrowing (407). Its message lists every mark word it
  accepts, ANSWERED among them (408). A branch name in backticks in a ruling's home cell is not read as a missing
  file (314). A search of the walk scripts' write paths for an absolute worktree path (298).
- **The browser tests (`playwright.config.ts`).** Refuse to build while another run holds the check lock (444).

**Place:** his to place. The agent's recommendation: one small tools job, any time, its own branch; the gates and a
fresh Opus read of the scripts; no walk (nothing of the app changes).

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
**Asked by him, 11 Oct 26 ("are there non applicable tests, because the app had changed so much") — to add to this audit's brief, his to confirm:** a sweep of the TESTS themselves for ones that no longer apply — a test that still passes but checks something no screen can reach any more (a function kept only for its tests, a path only a made-up event reaches), and the browser tests that are skipped (57 in the run of 11 Oct 26, a number steady for days and not read one by one). What he was told: tests whose RULE changed are rewritten to the new ruling in the same change, each saying so (never deleted or loosened); a leftover test of unreachable code wastes time but hides no fault; nobody has swept the whole set for them.
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
**RUN, reported and answered — D493 (2 Oct 26, "as recommended"):** Astra's report is
`raptor-port/docs/superpowers/briefs/2026-10-03-code-tidy-audit-astra.md` (five separations, none a fault). Three approved, each
its own item — `[LW-ROWS-SPLIT]`, `[CSS-SPLIT-BY-SCREEN]`, `[TRK-FILE-TRANSFER-SPLIT]`. **Left open here, two:** the Leave War's
saved-data reading (the report's §4) is looked at again at `[DB-STEP]`, which replaces it; the Leave War's link to the schedule
(§5) is not split unless a later feature has to work heavily inside it — put it to him then.

### [LW-MONTH-MEMO-UNPINNED] Nothing pins the Leave War month's own redraw guard — and one cell changed redraws every month of every row (found 13 Oct 26 by `[LW-ROWS-SPLIT]`'s break tests) — OPEN, low

**Found, not fixed — older behaviour, nothing a person sees wrong.** Each person's row on the Leave War is drawn as twelve month blocks, each meant to be left alone when its days have not changed (`PersonMonth`, a `memo` — `raptor-port/src/leavewar/ui/MatrixRows.tsx`; `raptor-port/docs/performance.md` §E: "Day cells stay one memoised `PersonMonth` per month"). Two things: (1) no test fails when that guard is taken off — the new `matrix-rows-memo.test.tsx` pins the ROW's guard only (a month is reached only through its row); (2) measured while trying to pin it: a change to ONE cell of the war (`setCell`) redraws every month of every row drawn (5,840 month-draws for 16 rows in the unit test, the same as a first draw) — so on a cell write the month's guard saves nothing as the grid stands, because every row is handed the whole grid and the whole set of day views afresh. **To do, with the next Leave War batch (D490):** find which prop of `PersonMonth` changes for an untouched month on a cell write (the read `raptor-port/docs/handpass/parts/lwrows/read-opus.md` F4 has a recipe that did NOT work as written), decide whether it should — it is the phone's cost of a bid — and pin the guard with a test that fails when it is removed. Measure on the built app before changing anything (`raptor-port/docs/performance.md` Part 1).

### [LW-ROWS-STALE-NOTES] A few notes and comments still name `Matrix.tsx` for code that moved to `MatrixRows.tsx` (13 Oct 26) — OPEN, documents only

**Found by the two reads of `[LW-ROWS-SPLIT]`, partly fixed.** Five were corrected with the move (`ui-contracts.md` twice, `CountRows.tsx`, `FigureCell.tsx`, one backlog line). The readers tabled more, each with its correction: `raptor-port/docs/handpass/parts/lwrows/read-opus.md` (its table of 13) and `read-fable.md` (F4). Left: the ones in `raptor-port/docs/performance.md` (ledger entries — a record of past work, which named the file as it was: judge each, do not rewrite history), `raptor-port/docs/leavewar/known-gaps.md`, and comments in other Leave War files. A documents-only pass; no check beyond the document check.

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

### [LOGIC-DONE-FIRST-PRESS] On the Logic page, the first press of Done straight after a changed setting is lost (found 19 Oct 26, the rally box walk, walker B — OLDER than that job; low)
In edit mode, change "Default rally before take-off" (any setting) and press Done once by finger at 402 wide: the value saves, the page stays in
edit mode; a second press ends it; with nothing changed, one press works. Pictures `raptor-port/docs/img/handpass/2026-10-19-rally-build/B/B08z-L2.png`,
`B08z-logic-Done.png`; the walker's table `raptor-port/docs/handpass/parts/rally-box/walker-B.md` (F2). **Not** the schedule's redraw that
[EDIT-BUTTON-AFTER-CHANGE] fixed: Done is a React button that is never replaced (`ui/LogicPage.tsx` `#lgDone`), so the host's reading is that
saving the setting moves the button out from under the press (a "rules changed" bar or the Reset button appearing) — reproduce and measure the
button's position before and after the save first. **Place:** low, with the next change to the Logic page; a browser test that changes a
setting and presses Done once, by mouse and by finger.

### [LOGIC-WORDS-WORKHOURS] The Logic page says a line with nothing entered starts its long day and Insights hours at the default rally; the app starts them at take-off less the step (found 19 Oct 26, the rally box walk, walker A — OLDER than that job; a question for him)
The Logic page's "Default rally before take-off" (renamed by D1031; the sentence itself dates from [LOGIC-PAGE-LAYOUT], D928) says "With no in-time or
rally entered, a flyer's day starts here: his long day, OIL and Insights hours count from it". Walked: an empty R box, the setting 3h → 2h30 — the
Insights hours did not move (1510 min both times); a typed R at the default time added 120 min, so with nothing entered the work span starts at the
take-off less the step (1h). OIL does start at the default rally (D592 (2)); the long day and Insights read the one work span (`engine/validate.ts
workSpan`, RT8 — "report/work hours … keep separate definitions"). Walker A's table `raptor-port/docs/handpass/parts/rally-box/walker-A.md` (scenario 9).
**The question for him** (when he says so, D994): with nothing entered, should a flyer's long day and Insights hours start at the default rally
(3 hours before take-off, as OIL does) or at the step (1 hour)? **Recommended:** the default rally — one start for a day with nothing entered,
as the Logic page already says and OIL already does; it makes more long-day notes appear. Until he answers, the words are left as they are.

### [BOARD-NARROW-DESKTOP-REMARKS] The desktop board from 821 to about 1000 wide leaves the remarks 16px and each jet's line 189px tall (found 19 Oct 26, the rally box walk, walker A — OLDER than that job; low)
Walker A: at 821, 900 and 1000 wide (the desktop layout, pucks on the line) the remarks box is 16px and a line 189px tall; measured the same with the
R box taken away (`raptor-port/scripts/handpass/rally-narrow.mjs`), so it is older than [RALLY-PER-FORMATION] (which keeps the remarks within 2px of
before from 1100 to 1439 — `13-board-rows-responsive.css`). Picture `raptor-port/docs/img/handpass/2026-10-19-rally-build/A/A15-d821-board.png`.
**Place:** with the next change to the board's layout — a picture to him first (a visual change, D541): stack the times there as a phone does, or
let the remarks take a line of their own.

### [OIL-EARN-DAY-SWITCH-WORDS] OIL Earn's "Nothing today earns" button reads like a status — two walkers took it for one (found 6–7 Oct 26, the walks of `[OIL-WORK-START]`; OLD; LOW, words)
On the Scheduler Board in OIL Earn mode the bar carries a button labelled "Nothing today earns". It is a SWITCH — pressed, it
makes nothing on that day earn — and its label does not change with the day's state (only its tooltip does). With a man on the
day plainly earning (his puck reads FO), the bar still says "Nothing today earns" beside it. Two walkers, on separate walks and
without seeing each other's work, each reported it as the app contradicting itself (the first walk's W8; the D606 walk's E03 —
picture `raptor-port/docs/img/handpass/2026-10-06-oil-work-start/E/dk-08-E03-oilearn-board.png`). **To build:** word the button
as the action it is, and say the day's state apart from it — a product wording choice, so a picture and his word first.
**Tier:** WALK (a control's label on the board, both sizes). **Place (the agent's line):** low — with the next change to OIL Earn.

### [INP-OIL-CHIP-PHONE] On a phone the green OIL chip is painted over a request card's date and time (found 5 Oct 26, the Codex stack check)
Inputs page at phone width (390): the card of a request that carries an OIL answer (walked: Torch, Training, 18 Jul 11:00–12:00) draws its
green "OIL" chip over the date and time — about 37 × 12 px of overlap. Walker E's picture:
`raptor-port/docs/img/handpass/2026-10-05-codex-stack/E/oilchip-phone-torch-row.png`. Older than the Codex stack: nothing in the stack
touched the Inputs page or its stylesheet part. **Place (the agent's line):** low — with the next change to the Inputs page; a browser
test that the chip and the date do not overlap at 390 and 320.

### [START-CONTEXT-AUDIT] A new chat starts at about 30% of its context — measure what it loads, then cut it to what a job needs (owner, D602, 6 Oct 26)
**DONE 7 Oct 26 under his ruling, on `claude/docs-tidy-7-oct` — options 1 to 6 (what each did and saved: the foot of the
spec named below); 7 found nothing to do; the document check is green. Still open, why this item stays: step (4)'s check
that stops it growing back is not built (a merged handoff block failing the check after one handoff; a ruling whose
permission names a merged branch listed as "spent?"; a marker for `AGENTS.md`) — low, with the next change to the
document check; and options 9 and 10, his own settings.** **His ruling (D609, 7 Oct 26): options 1 to 4 now, then 5 to 7 with Astra and Sol reading; one branch, the document
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

### [SIMILAR-APPS-LOOK] Other apps like ours, and what to learn from them — his question, answered; his to act on or leave (12 Oct 26)

**His words (12 Oct 26, while step 3 of the one-rule job was being built):** *"can we search the web to see if there's any other similar web app that is similar to raptor and see if we can take reference from them to see if what we are doing has been done and we can learn from them"*. **Done the same night:** one helper searched the public web; its report, whole — eleven products (military squadron schedulers, flight-school schedulers, airline bidding, fatigue scoring, shift rostering), eight lessons each tied to its product, where ours does what they do not and where it appears to lack what they have, and every link opened — is `raptor-port/docs/superpowers/briefs/2026-10-12-similar-apps-research.md`. Military tools publish little; what was only a search summary is marked there.

**What is his here — nothing is built until he says:** whether any of it becomes a job. The five things ours appears to lack, as the report names them: suggested filling of seats; a fatigue score beside the crew-rest rule; member-to-member swaps; phone alerts with "I have seen it"; the training syllabus telling the scheduler who needs what next. Two of its lessons touch work already in hand: telling only the people whose day changed (the bell's notices, `[ALL-AVAIL-AS-MEMBER]` step 7) and fewer, plainer screens (`[UI-SLEEK-PASS]`).

### [CONTEXT-START-SIZE] Why a new chat starts 30–40% full, whether it grows with the app, and ways to cut it (his question, 17 Oct 26)

**Status: A, B, C, G done 17 Oct 26 on `claude/sharp-goldberg-6d0656` (his "As recommended", D969–D971) — on `main` by D974. Measured again in the next chat: an empty chat 13%, a build chat 22%; D (the scheduler split) is not recommended — its file is under D611's mark — and is put to him; the capitals sweep [CAPS-SWEEP] done (archived). D not done, by his D976; [PUSH-LOCK-GUARD] done. Left: F, the short skill-notes guide, not done (told him).** Done: the rulings in ordinary letters; 78 rulings archived after a fresh read; the document check's real cost. Measured: the general rulings 25,500 → 14,100 tokens; all rulings files ≈147,000 → ≈96,000. E: only the documents connector costs real room (~0.3 pts) — his setting. F: not done (a shorter skill-notes guide would cut instructions it uses, for ~1,500 tokens). H filed as [PUSH-LOCK-GUARD]; the other capitals as [CAPS-SWEEP]. **Was: measured, options put to him 17 Oct 26.** The page he read: `raptor-port/docs/superpowers/specs/2026-10-17-context-start-size.html` (published to him as an Artifact). **Found:** an empty chat is 14% full (125,784 of 880,000 — 9 points the app's own, 4 his connectors and plug-ins, 4 the always-loaded files); the first app file opened adds about 17 points — the project guide, and the scheduler's rulings (about 54,000 tokens), which load for ANY app file by their paths; then one to three more areas' rulings and the job's opening reads → about 31% before work (measured in 15 chats of 16–17 Oct 26 from their own records). The rulings are about 14 points and grew from about 5 to about 12 in 15 days (~30 rulings a day; every line stays, 220 of 754 carry "changed by"). **Capitals cost almost double:** the same 40 Inputs rulings loaded into the chat took 8,400 tokens as written and 4,600 in ordinary letters (the 7 Oct audit counted letters, so it under-read the rulings by about half). **Options put to him (A–H):** A ordinary letters for the short lines, word for word (−4 to 5 pts; his OK); B archive spent one-off permissions (already the rule, overdue); C a ruling a later one fully restates leaves the loaded list, a fresh reader checking each (−2 pts; his ruling); D split the scheduler's rulings — D611's "grows by about half" trigger is met — not yet, re-measure after A–C; E his connectors and plug-ins off (up to −2 pts every chat); F a short form of the skill-notes guide; G the document check reports real cost and lists "changed by" lines; H mods (push guard, PC lock) for reliability, not room. Recommended: A, B, C, G now; E and F tried; D later; H its own job.
**His words (17 Oct 26, during pull request 524):** *"could u find out why am I using so much context for every new chat
like 30-40% immediately and will this be unsustainable if this app becomes more complex? Is there a way to optimise it"*;
and, a message later, whether "mods" could replace some instruction files (he had read of people who "threw away their MD
files and used Mods"). **What he was told then:** a mod is an automatic check or panel that runs at a set moment (a hook
before a push, the document check at a turn's end); it can take over PROCEDURE rules ("always do X before Y") but not his
rulings (what the app must do), which the agent must know while building — and the project already has some (the
ruling-recording hook, the document check, the background-folder guard, the PC lock). **The job:** (1) the new chat
measures its OWN start first (`mcp__ccd_session_mgmt__get_usage`), then after the reads a chat makes at its start
(`HANDOFF.md`, the always-loaded rule files, `raptor-port/CLAUDE.md`, an area rulings file — `scheduler.md` is ~26k tokens,
`inputs.md` ~10k); (2) how each piece grows as the app grows; (3) every loaded piece sorted into: rulings that must stay /
procedures a hook or check could enforce instead / text that need not load at the start; (4) a short page of options with
what each saves (tokens and %) and its risk, with a recommendation, in plain words. First figures (the 524 chat at 59–70%
full): loaded instructions ~4%, tool descriptions ~8%; the rest was that chat's own work and reads. **Read first:** D602,
D609 (the start-of-chat measure of 7 Oct 26), D70 (a working-guide change is read before he approves it), D623 (guides
stay readable by other models). **Place:** next, after pull request 524.

### [UI-SLEEK-PASS] The interface made more minimal, intuitive and sleek — fewer words, button placement, motion, colour meaning, icons, flow; the Raptor look kept, never at a cost of speed (his direction, D765, 12 Oct 26 — AFTER the one-rule build; his to place)
**Suggested 20 Oct 26 under D852 (his D1095 — the till date's year in two digits, the design guide's lesson 13), not changed:** the desktop Inputs list's date column and the phone list's day heading print "15 Feb 2027", and the LATE mark's note "Jan 4 2027" — the same two-digit year there is his to say. **Answered the same evening, D1096 ("All 27 instead") — built with the Inputs batch.**
**BUILT 17 Oct 26 — D949, D950, D951 + D953 on `claude/whole-app-words-pass-1b-6cfe51` (pull request 522), FULL-checked (`raptor-port/docs/handpass/2026-10-17-tick-r2.md`): LIVE 17 Oct 26 (pull request 522 merged on his "merge live").** **D953 (17 Oct 26) — D952 drawn and answered ("1B 2-5 yes"): a tick box before the grey date, like the window's "all day" tick; readings 2–5 as drawn. To build with D949–D951.** **D952 (17 Oct 26) — draw first, then build with D949–D951:** a switch on every input for its "till <date>" (the grey date in its window), on by default except a one-day duty or other commitment; the default follows the dates; the person can still turn it.
**D951 (17 Oct 26) — to build with D949, D950:** a one-day duty or other commitment prints no "till <date>" anywhere it is printed (the window still shows it while picking); one-day leave and medical wait for his answer.
**D950 (17 Oct 26) — to build with D949:** round 2 — View-only Sched's boxed "Draft" goes; the peek reads "Next week: click a day to load it"; "· accepted" / "· rejected" once a row, after the name; "Placeholders · drag in" → "Placeholders".
**D949 (17 Oct 26) — to build, on `claude/whole-app-words-pass-1b-6cfe51`:** the board's wave header shows "(prev day)" where a rally is the evening before; "removed" → "rejected" in the Personal Inputs note and a rejected row's hover; the Ground Programme row's "till <date>" grey after its box.
**Places suggested to him under D852 for D960 (17 Oct 26 — the Medical card lost its "Placed by <name> · <date>, <time>" line and says the period instead) — each a suggestion, drawn for him before it is built if he takes it up:** (1) a day opened on the SANS calendar — its short line "Grit · 12 Jul, 14:42" under each commitment; (2) the document viewer — the full placed line under the document. In each, who filed it and the time of day might give way to what the reader came for, as on the Medical card. (The Inputs calendar's day and the List already say only "By Saber", and only where someone else filed it — D723, D729.) Not changed.
**Places suggested to him under D852, filed here as its list (14 Oct 26) — each a suggestion, to be drawn for him if he takes it up; the detail and the build notes are in `[BATCH-14OCT-LEFTOVERS]`:** passing notes that only say what the screen shows (the design guide's §1, D850) — "Schedule updated" after the Scheduler Board's ✓ Done; "<name> added to <row>" / "<name> taken out of <row>" when a puck is dropped on or taken off a row; "Input updated" after a change the card shows.
**His direction sharpened 13 Oct 26 — D821:** *"raptor style design but cleaner look like apple, intuitive design that doesn’t require a lot of instructions because of that. Placement of buttons and everything just makes sense"* — Apple's cleanliness and sense of place inside the Raptor look (not its light colours, single accent or empty space — the agent's reading); the test for a screen: could someone use it without its hint? In the design guide (§0, §3) and the design skill's record of the app.
**13 Oct 26, later:** step 1's first half is done — the design skill's record of what the app is (`raptor-port/docs/PRODUCT.md`, D820). Its second half is still this job's: the record of the LOOK as it is (`DESIGN.md`, the skill's `document` step — it reads the stylesheets and writes down the Raptor look so the skill stops reporting it as undocumented).
**The words half started 16 Oct 26 (his "Start the whole-app words pass", `claude/whole-app-words-pass-73790e`):** the survey of every page (`raptor-port/scripts/handpass/words-survey.mjs`, `raptor-port/docs/img/handpass/2026-10-16-words-pass/survey/`) and round 1 — the day panels of Edit Schedule and the Scheduler Board, four questions — put to him as pictures (`…/r1/`, drawn by `raptor-port/scripts/handpass/words-r1.mjs`); his first answers are D938 (the editing hint deleted, not moved) and D939 (the design guide learns from his suggestions — the how put to him). Rounds and answers: `raptor-port/docs/superpowers/specs/2026-10-16-words-pass.md`; where it stands: that branch's `HANDOFF.md` block.
**ADDED 13 Oct 26 — D808 ("also look at clear and concise notes, text around the whole app etc. I don’t like so much clutter. But this can be a job on its own later"):** the WORDS half of this job is every page's notes, hints, labels and small print gone over for clear, concise wording and less clutter — one sweep, page by page, each change shown before and after, no warning a person needs dropped. **And his two additions the same hour:** *"sometimes removing the notes is also ok. Because it’s self explanatory"*; *"or u can think of having a how it works drop down thats clear and concise etc"* — so each note is shortened, removed (the screen says it already), or moved under a short "How it works" fold of its page, as the two calendars have. Not held for it: the passing notes (`[NOTES-SHORTER]`, D806) and the look over the designs of 13 Oct 26 (`[DESIGN-LOOK-13OCT]`, D807), which go to him now.
**His words (D765), looking at the input's window and its OIL question on his iPhone:** *"it's just that there are too many words. It doesn't make the app look sleek as well. … make my app interface more minimal, intuitive, sleek in terms of user interface. How buttons should be placed, how the animation should go. How the colours mean things etc. icons. Flow, workflow. Minimal words but people understand. … With the raptor style still there but not at a cost of speed that slows down the app. We can design this later after this building task is completed"*. **NOT designed, NOT built.** It opens as every look-and-feel job does: his answers in small rounds with pictures on the real screens before any visual build (D541); the size of the app's buttons does not change without his word (D487); the measured speed rules stand over every choice (`raptor-port/docs/performance.md` Part 1).

**The first screens he pointed at (his two phone pictures of 12 Oct 26; the same screens are `raptor-port/docs/mock/img/one-rule-oil/`):**
- **The OIL question** — "THIS INPUT FALLS ON A NON-WORKING DAY — 17 OCT (WEEKEND / PH)", "Does it deserve HO — half a day of OIL?", a paragraph ("The credit lands on the Leave War as an HO cell and moves the OIL balance. Hours count start to finish for the whole day, so published schedule work on the same day can raise it."), "Choose an option above". Four pieces of text to ask one Yes or No.
- **An input's window, read only** — the whole roster of pucks is drawn to someone who can change nothing; "Only Saber — who filed it — or an admin can change this for everyone."; "Take me out" wrapped onto three lines; "Placed by Saber for 4 people · 11 Oct 26, 22:35 · changed by Ranger · 11 Oct 26, 22:35"; "Date changes apply to all 4."; "credited on its non-working day".

**The skill he named — `github.com/rukkiecodes/claude-apple-design-system` — looked at 12 Oct 26, not installed.** What it is: six Markdown documents and a `SKILL.md` (MIT licence; a small personal repository — 11 stars, 3 commits), an Apple-style design language taken from a phone shopping app built in React Native; no program of its own, but its `SKILL.md` tells the agent to run `npx getdesign@latest add apple`, which downloads and runs a package and writes a design file into the project. **Why not installed whole (his own earlier rulings):** a skill's good practices are read at the source and fused into our own guides (D486, D491); a working guide stays in a form other models can read, and nothing that downloads a program is taken without his word (D623); a change to a working guide is read by two reviewers before he approves it (D70 — and ChatGPT is out until about 1 Nov 26, D761). **And on its merits:** much of it is the opposite of this app — a light, airy shop front with ONE accent colour, big titles and generous empty space, where Raptor is a dark, dense working tool whose colours each carry a meaning (CAT, the amendment tags, amber and red warnings, the green OIL edge, the purple "this is you") and whose rulings ask for MORE on a screen, not less (D688, D696, D653); half of it is for phone apps built another way (haptics, native tabs); and it has NO rules for wording, for the flow of a task or for what an icon means — his first complaint. A second design skill loaded beside Impeccable (`.claude/skills/impeccable/`, already here, whose `distill`, `clarify`, `animate` and `critique` passes are made for exactly this) would give two guides answering the same request.
**What IS worth taking from it, as rules of our own — to put to him as pictures, then written into Raptor's own design record:**
1. **A colour is either "you can press this" or a status — never decoration.** One colour for what is pressable (the app's cyan); red, amber and green only where they mean stop, look, fine. An audit of where the app breaks this is the first pass.
2. **Emphasis by surface or weight before another box.** The windows draw a border round almost everything; removing boxes and letting a slightly different background or a bolder word carry the grouping is most of what "sleek" is.
3. **Motion: quiet and quick.** 150–240 thousandths of a second, easing out, no bounce; a pressed button gives a little (to about 95–98% of its size); a sheet slides up, a window grows in from 94%, a passing note fades. Held to the speed rules: only movement and fading (never anything that re-lays the page), never on the week or the board's dense grid, off for a reader who asked for reduced motion.
4. **A passing note for what is done; a question only when he must choose.** Fewer windows that ask, fewer words to read.
5. **One main button a window, in the same place every time; the dangerous one apart.** (Largely true already — to be made a rule and checked.)
6. **Three weights of letter, one scale of corner, hair-thin lines.** Consistency a reader feels without seeing.
7. **An empty screen says one short thing and offers one button.**
**What it cannot give, and where that comes from instead:** the words. That is D726's rule and Impeccable's `clarify` and `distill` passes — every label, hint and sentence earns its place or goes, the same information in fewer words.
**How the job would run (the agent's proposal, for his word):** (1) record the Raptor look as it is — the project has no design record yet, which is why the design skill starts every session blind (`/impeccable init`, then `document`; the record lives under `raptor-port/docs/`); (2) a critique of the screens he uses most, as a short list with pictures; (3) his picks, in rounds of at most four (D541); (4) built area by area, each with its own check, timings before and after. **Place:** his — after `[ALL-AVAIL-AS-MEMBER]` merges. **Meanwhile:** the one-rule build keeps every NEW word it adds as short as it can be understood (D765 reading 5) and redesigns nothing it does not otherwise touch.

### [NO-ASTRA-LIST] The jobs that went ahead without a ChatGPT reader (Astra or Sol 6.1) — the ONE list, kept for when his subscription is back (D761, 11 Oct 26)
**His word (D761):** *"take note of the tasks we did not have Astra involved. I may only get my subscription on 1st November onwards."* His ChatGPT allowance ran out on 11 Oct 26; wherever a record says "after 14 Oct 26", read "when ChatGPT is back — not before 1 Nov 26". **A list to put to him, not a promise:** when ChatGPT is back he says which of these reads he still wants. Add a line here in the same change that lets a job go ahead on one reader; a line leaves only when its read is done or he says it is not wanted.
**16 Oct 26 (the night):** round 1b of the words pass (D945, D947) and the till date (D948, [TILL-FROM-DATES]) on `claude/whole-app-words-pass-1b-6cfe51` — read by one fresh, blind Opus reader (D790, D903); without Astra and Sol 6.1.

| The job | Who did read it | What it went without |
|---|---|---|
| `[GROUP-INPUT-ONE-ROW]` — the schedule's one row for a shared input; LIVE since 11 Oct 26 (pull request #490) | its PLAN: Astra and Sol 6.1, two rounds; its finished CODE: Fable alone, on his word (D749, D752) | Astra's and Sol 6.1's reads of the finished code (`raptor-port/docs/handpass/2026-10-11-group-input-one-row.md`) |
| The ring colours he found (D751) — fixed on the same branch, LIVE with it | walked and gated (the sheet's §14, WALK tier); no model read of its own | any ChatGPT read |
| `[METHOD-LIT-COLOUR]` — the line his find costs the checking guide | MADE 13 Oct 26 with the skill-notes review, on that review's one fresh Opus read, on his word (D811) | the guide change's two reads (D70) |
| `[CAL-JOB-LEFT]` (1) and (2) — `AGENTS.md`'s stale paragraph; the one sentence added to `.claude/rules/doc-structure.md` (D667); Astra's meaning read of the short ruling lines D658–D665, D676–D679 and D734–D741 | nobody | D70's two reads; Astra's D138 read |
| The short ruling lines D742–D761 (recorded 10–11 Oct 26) | the host, at the writing | Astra's D138 meaning read, as for the lines above |
| `[OIL-PLAN-SWITCH-UNASKED]` — "Switch to this plan" says what it left to answer (D865), built 15 Oct 26 on `claude/checkout-stale-compaction-7ee93a` | one fresh, blind Opus reader of the finished code, on his word (D875) | Fable's read (D790 gives OIL work one) and any ChatGPT read |
| `[OIL-UNCANCEL-UNASKED]` with `[OIL-LOAD-VERSION-UNASKED]` — the small OIL job (D816, D818), BUILT on the night of 14 Oct 26 (branch `claude/oil-uncancel-load-ask`) | one fresh Opus reader of the finished code, on his word (D858), and a second fresh Opus reader of the fixes that followed | Fable's read (D790 gives OIL work one) and any ChatGPT read |
| `[ALL-AVAIL-AS-MEMBER]` — the one-rule job: the advice on a one-person request's row (11 Oct 26) | Fable, on his word | a second reader (it was advice for a ruling of his — D755 has since been made) |
| `[ALL-AVAIL-AS-MEMBER]` — its finished code, with `[PERSONAL-SEVERAL]` and `[OIL-ASK-LIST-SEVERAL]`; LIVE on his "merge live" of 12 Oct 26 (D779) | Fable, three times (the walked build, the nine fixes, the last round); a fresh Opus reader once, blind, as a trial — not an independent read (D67) | a ChatGPT read of the finished code (`raptor-port/docs/handpass/2026-10-12-one-rule.md` §10g, §14) |
| `[ALL-AVAIL-AS-MEMBER]` — its PLAN (`raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`) | Fable, on his word (D758) | the one ChatGPT reader D758 names. **His word on the build is given — D764: it starts on Fable's read alone, and at the merge he decides whether to wait for a ChatGPT read of the finished code.** |
| `[OIL-ASK-NOTIFY]` — a day made a holiday afterwards, the one list, a swap whose OIL question is not answered; BUILT and FULL-checked 13 Oct 26 | its PLAN: Fable, 12 Oct 26 (ten findings, all taken — the plan's §5a); its finished CODE: Fable, 13 Oct 26, on his word (D784 — three findings, all fixed), and a fresh Opus reader beside it, blind (the one test of D789 — eight findings, all dispositioned; NOT an independent read, D67): `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md` §12 | Astra’s and Sol 6.1’s reads of the plan and of the finished code. **His word at the merge — D791 (13 Oct 26, "Merge live"): it goes live on Fable’s read and the fresh Opus read, without waiting.** |
| The combined design guide — `raptor-port/docs/design-practices.md`, its self-loading rule and one clause in `AGENTS.md` (13 Oct 26 — D812, D813): a NEW working guide | one fresh, blind Opus reader (D812 reading 3; D810's precedent) — `raptor-port/docs/superpowers/briefs/2026-10-13-design-guide-read.md`: thirty wording points, all taken or answered | the two ChatGPT reads a working-guide change is owed (D70 — Astra and Sol 6.1) |
| `[ONE-DATE-CALENDAR]` step one, the Tracker's date boxes (`[TRK-DATE-BOXES]`) and the Inputs / schedule batch (D793) — the three jobs of the night of 13 Oct 26 (D799), each BUILT and checked on its own branch | each: a fresh, blind Opus read of its finished code (D790); the Inputs batch also Fable, blind beside it (it touches OIL) — and a second fresh Opus reader on its fixes | a ChatGPT read of the finished code of each; and for the Inputs batch (tier FULL) the scenario design, which the checking guide gives to the other maker's model — the builder wrote its scenarios (`raptor-port/docs/handpass/2026-10-13-inputs-batch.md` §5) |
| `[LW-ROWS-SPLIT]` — the Leave War's row drawing moved to its own file (13 Oct 26, the night's run — D799) | Fable and a fresh Opus reader, blind to each other (D790 — permissions and the OIL display are drawn in the moved lines) | a ChatGPT read of the finished code (`raptor-port/docs/handpass/2026-10-13-lw-rows-split.md`) |
| `[SKILL-OBS-REVIEW]` — the guide changes drafted by the skill-notes review of 13 Oct 26 (branch `claude/skill-observation-review-258b48`), and with them the two lines `[WALK-FINGER-NOT-LOCATOR]` proposed for the checking guide (D811); installed 13 Oct 26 on his "Approve all" | one fresh, blind Opus reader — an Opus that did not write them — on his word (D810: "u can use opus to do the review solely"); not Fable | D70's two reads of a changed working guide (Astra's and Sol 6.1's) |
| `[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]` — the three approved builds as one batch (14 Oct 26; branch `claude/approved-jobs-batch-build-cc42ef`), BUILT and checked, waiting for his "merge live" | one fresh, blind Opus read of the finished code (D790 — `raptor-port/docs/superpowers/briefs/2026-10-14-three-builds-read.md`: four findings, all applied); no Fable read — the batch changes no OIL figure, published day, permission or saved shape (it moves where the OIL bar is drawn and rewords notes) | a ChatGPT read of the finished code (Astra) |
| The design guide's rule for text that only explains what the screen makes plain (D846, 14 Oct 26) — one point in `raptor-port/docs/design-practices.md` §1, one in §8, one clause in `.claude/rules/ui-design.md`; on branch `claude/approved-jobs-batch-build-cc42ef`, its wording put to him | one fresh, blind Opus reader (D810's precedent): nine findings — two of the three tests and the "never deleted" list were too wide or too narrow — all taken, its wording used | the guide change's two reads by Astra and Sol 6.1 (D70) |
| The design guide's two further points of 14 Oct 26 — feedback is designed into the screen and a note is only for what the screen does not make plain (D850: §1, §5, §8 of `raptor-port/docs/design-practices.md`), and what follows when he corrects a design (D852: §0) — with their short forms in `.claude/rules/ui-design.md`; on branch `claude/approved-jobs-batch-build-cc42ef`, their wording put to him | one fresh, blind Opus reader (D810's precedent): twelve findings on D850's point, all taken in the reader's wording; D852's point read by the same reader (eight findings, taken); **D853's one clause beside D541 — his own words, quoted — went in with NO read** | the guide changes' two reads by Astra and Sol 6.1 (D70); for D853's clause, any read |
| `[DRAG-EDGE-SCROLL-ELSEWHERE]` (D897–D899) — the Inputs month turns at its side; the Tracker chart pans at its edge; built the night of 15 Oct 26 on `claude/drag-edge-scroll-elsewhere-51bfc4` | one fresh, blind Opus reader of the finished code, and a second on its fixes (`raptor-port/docs/handpass/parts/edge-turn/`) — tier WALK, which needs none | any ChatGPT read |
| `[TRK-REORDER-FINGER-DRAG]` (D922, D924) — the Tracker's ⇅ Reorder rows drag by finger and by mouse, one look; built 15 Oct 26 on `claude/trk-reorder-finger-drag` | one fresh, blind Opus reader of the finished code (four minor, fixed) and one fresh Opus reader of the fixes (none) | the ChatGPT read (Astra) of the finished code |
| `[MEDICAL-ONE-ROW]`, `[LOGIC-PAGE-LAYOUT]` (D927–D933, D936) — the Medical tab's one row and the Logic page rewritten for its reader; LIVE 16 Oct 26 (pull request 519) | every line of the Logic page read by one fresh Opus reader before the build; the finished code by one fresh, blind Opus reader (four small, fixed and tested) — `raptor-port/docs/handpass/2026-10-15-logic-medical.md` | the ChatGPT read (Astra) of the finished code |
| Quals' one row and its paragraph deleted, "Save" on a phone, Quals opening at its top (D935, D937); LIVE 16 Oct 26 (pull request 519) | walked and gated (WALK tier, breaks 9/9, re-walk 30/30 — `raptor-port/docs/handpass/2026-10-16-quals-one-row.md`); no model read of its own | any ChatGPT read |
| The short ruling lines D926–D937 (recorded 15–16 Oct 26) | the host, at the writing | Astra's D138 meaning read, as for the lines above |
| `[OIL-CONFIRM-DAYGRID]` — the OIL question's "Only some days…" as the app's one calendar (D923), built 17 Oct 26 on `claude/oil-confirm-daygrid-d05aeb` | a fresh Opus scenario designer; one fresh, blind Opus reader of the finished code (D790, D903); walked and gated (FULL — `raptor-port/docs/handpass/2026-10-17-oil-confirm-daygrid.md`) | Astra's scenario design and the two ChatGPT code reads OIL work takes (D590) |
| `[TRK-FILE-TRANSFER-SPLIT]` — what is left of it: the Tracker file import's normalising and comparing moved beside its file format (the night of 17 Oct 26, on `claude/tracker-feature-batch-6ea3a7`) | a fresh Opus scenario designer; one fresh, blind Opus reader of the finished code (D790, D903) — only a move; two test-only findings, fixed (`raptor-port/docs/handpass/parts/trk-file-transfer/reads.md`) | Astra's scenario design and the two ChatGPT code reads (saved data) |
| `[TRK-SCROLL-GLIDE]` — the Tracker's finger glide on the chart and Info half (D985–D989), built 17 Oct 26 on `claude/trk-scroll-glide` | one fresh, blind Opus reader of the finished code (D790, D903) and its D138 read of the lines D986–D989; walked and gated (WALK tier — `raptor-port/docs/handpass/2026-10-17-trk-glide.md`) | any ChatGPT read he wants of it |
| `[TRK-CHART-FPS]` — the Tracker's chart and Info half scrolled by the phone itself, the pinch as a picture (D992), built 18 Oct 26 on `claude/trk-chart-fps` | three fresh, blind Opus readers (the build, then each of two fix rounds — D790, D903) and the D138 read of the lines D991, D992; walked and gated (WALK tier — `raptor-port/docs/handpass/2026-10-18-trk-chart-fps.md`) | any ChatGPT read he wants of it |
| `[SCHED-INPUT-WINDOW-PHONE]` D996, D997 — every pop-up window in the middle of a phone's screen, built 18 Oct 26 on `claude/window-middle-d996` | walked 7/7 and gated (the night of 18 Oct 26); one fresh Opus read of design lesson 6's widening | Astra's read of the change, and the D138 read of D1016–D1018 |
| The night of 18 Oct 26 — D1008 + D1015, D1000 + D1016, D1013 + D1017, the scheduler's small batch (D1010, D1011, D1012, D710); D999 and the Tracker's D1002–D1007, D1014, D1018 if reached — each on its own branch (the `claude/window-middle-d996` block names them) | one fresh, blind Opus reader of each job's finished code (D790, D903); walked and gated | Astra's, and Sol 6.1's for the two FULL jobs (who may see; the published record) |
| His three follow-ups of 18 Oct 26 — D1019, D1020, D1022 ([LW-CARD-SHORT-WORDS-700], [DATEBOX-ESC-LISTS], [UPCHIT-DELETE-REGROW]), built on `claude/three-small-jobs-1018` | one fresh, blind Opus reader of the finished code (D790, D903); walked 58/58 and gated (FULL — `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`) | Astra's, and Sol 6.1's for D1022 (saved data, a published day) |
| [UPCHIT-SHEET-LEAVE-CUT] (D1023) — the upchit sheet lists each leave and bid a give-back will cut, from the save tried and thrown away, built on `claude/upchit-sheet-leave-cut` | one fresh, blind Opus reader of the finished code (D790, D903 — one finding, fixed red first); walked 28/28 and gated (FULL — `raptor-port/docs/handpass/2026-10-18-upchit-sheet-leave-cut.md`) | Astra's, and Sol 6.1's (saved data, a published day — the thrown-away save) |
| D994's Schedule and amendments small fixes (21 items) on `claude/schedule-amendments-fixes-fffce0`, checked 18–19 Oct 26 | the scenario design and the code read: fresh, blind Opus readers (D790); the fix rounds' narrow reads: fresh Opus readers, rounds 1 and 2 | Astra's scenario design and Astra's and Sol 6.1's reads of the finished code (a published-day change, saved history lines) |
| [RALLY-PER-FORMATION] with [EDIT-BUTTON-AFTER-CHANGE] — a rally box for each formation (D1026–D1034), built 19 Oct 26 on `claude/rally-box-mockup-452b95` | one fresh, blind Opus reader of the finished code (D790, D903); walked and gated (FULL) | Astra's and Sol 6.1's reads (OIL, the published record) |
| [RALLY-BOX-CHANGES] — his three changes to the rally box (D1038–D1041): a taken suggestion's short flash, SC / AVALON / BB rally boxes, their worked-out times hidden, the SC MAIN rally in crew rest and OIL; built 19 Oct 26 on `claude/rally-box-changes` | one fresh, blind Opus reader of the finished code and one narrow Opus read of its fixes (D790, D903); walked and gated (FULL) | Astra's and Sol 6.1's reads (OIL, the published record) |
| [KEYBOARD-SCROLL] with D1080 — the box being typed in lifted above a phone's keyboard; one tap then typing replaces in four more places; built 19 Oct 26 on `claude/keyboard-scroll` | one fresh, blind Opus reader of the finished code and two narrow Opus reads of its fixes (D790, D903); walked and gated (WALK) | Astra's read (a shared behaviour on every surface); the board's hardenings of 19 Oct 26 were built by Fable on his call and read by the host (Opus) only |
| `[STANDBY-WEEK-B]` — the week's and the board's standby lines read R over B, then START over END (D1083–D1085); LIVE 20 Oct 26 (pull request 544) | one fresh, blind Opus reader of the finished code (D790, D903); walked and gated (`raptor-port/docs/handpass/2026-10-20-standby-week-b.md`) | Astra's scenario design and code read (D353); Sol 6.1's second read (money and the published record: the week's new door to SC MAIN's in-time and to a standby shift flying) |
| `[CI-SPLIT-SLOW-JOBS]` — GitHub’s checks split across more machines and the walk pictures not downloaded (D1089, D1091); LIVE 20 Oct 26 (pull request 546) | no reader — a change to the checks file only; proved by its own run: the same 676 unit files and 12,004 unit tests, 893 browser tests and 453 Tracker checks as main’s last run (`raptor-port/docs/gates-and-deploy.md`, 20 Oct 26) | Astra’s read of the checks file (none was required by the bug-check order — no app code changed)|
| The standby batch — `[BOARD-TAB-FOLD]` with the week's half, `[SA-HEAD-CLIP-360]`, `[STANDBY-UNDO-WORDS]`, `[BUBBLE-SMALL-SEEN]` (D994); LIVE 20 Oct 26 (pull request 547) | one fresh, blind Opus reader of the finished code (D790, D903) — 3 low, all fixed; walked and gated (`raptor-port/docs/handpass/2026-10-20-standby-batch.md`) | Astra's code read (D353) |
| The night of 20 Oct 26 — the Tracker smoke in two, `[GATELOCK-STALE-PORT]`, the lazy pages loaded up front in three test files (D1092); LIVE on his advance word once green | one fresh, blind Opus reader of the finished branch (D790, D903); proved by the counts (the same 453 Tracker checks by name) and the tests | Astra's read of a checks-and-tooling change |
| The OIL batch — `[UNPUB-WARN-AL-RESTORES]`, `[OIL-ZERO-SPAN-SORTIE]`, `[LW-OIL-DATECHIP-HIDDEN]` (D994); built 20 Oct 26 on `claude/oil-small-fixes-1020` (pull request 550) | a fresh, blind Opus scenario designer and one fresh, blind Opus reader of the finished code (D790, D903); walked and gated (`raptor-port/docs/handpass/2026-10-20-oil-batch.md`) | Astra's scenario design (D353); Astra's and Sol 6.1's two code reads (OIL and the published record — rank 2) |
| The Inputs batch — `[TILL-NEXT-YEAR]`, `[OIL-ASK-HEAD-SEVERAL]`, `[INP-TILL-STALE]`, `[CAL-UNDO-OTHERS]` (D994); built 20 Oct 26 on `claude/inputs-small-fixes` (pull request 553) | one fresh, blind Opus reader of the finished code, asked for missing scenarios too (D790, D903); walked and gated (`raptor-port/docs/handpass/2026-10-20-inputs-small-fixes.md`) | Astra's scenario design (D353); Sol 6.1's second read (the published record: the printed till date a published day compares) |

### [WEEK-ADD-TAP-PHONE] On a phone, a tap on a row's "+ add" on Edit Schedule's week arms nothing when the row already holds someone (found 11 Oct 26 by `[GROUP-INPUT-ONE-ROW]`'s walk — older than that job; his to place)
**Found, NOT fixed, NOT reproduced by the host on `main`.** Walker W2, scenario 3 (`raptor-port/docs/handpass/parts/gi-w2.md`; pictures `raptor-port/docs/img/handpass/2026-10-11-group-input-one-row/w2/s3-week-tap-add.png`, `s3-board-armed.png`): on a 390-wide phone, on the WEEK, a tap on a ground row's "+ add" arms nothing — no ring, no drawer — where the row's first place is filled; the same on an ordinary one-man row, so it is not the shared row's. The same tap on the Scheduler Board arms the row and the crew drawer opens. The walker read that the week's "+ add" label takes no taps and the people cell arms only an empty first place. **As filed:** low — the board's tap and a held-finger drag both add a man (walked, passing); to reproduce on `main` first, then either make the week's cell arm as the board's does or leave it by his word.

### [MERGE-ONCE-RECORDS] Merge finished jobs as ONE pull request, and make the record files merge without clashing (his ruling D822, 13 Oct 26) — OPEN, the agent's to work out; from the next job on

**Why (13 Oct 26):** nine merges in one afternoon took about three hours. Two causes were fixed the same day (the slow unit check split in four, a settings change no longer starting the full run — D822). Two are left. **(1) Merge once.** When several jobs finish together (a night's run — D799), combine their branches on ONE branch, run the checks once, and merge once on his word — each job keeps its own check, evidence sheet and backlog item; D485's batch, applied to the merge. Never stack one pull request on another's branch: it runs no checks until pointed at `main` and pushed to. **(2) The records clash at every merge** — `HANDOFF.md` (every chat rewrites the top of `## Now` and the first line of the gate baseline), `OUTSTANDING.md` (the priority list and the list of jobs without a ChatGPT reader), the rulings files and `DECISIONS.md`'s map (every new ruling goes at the top of a table), `raptor-port/docs/walk-ledger.md` and the two archives (every job adds at one place). Thirteen such clashes were resolved by hand that afternoon, every one "keep both sides". **Ways to weigh (measure on a copy first):** git's own "keep both sides" setting for the add-only files (`.gitattributes` — the ledger, the archives, the skill log), and note Fable's finding CI-PATHS-001: a change to that file runs every check; the gate baseline's "latest" line kept as a list that only grows; the rulings map rebuilt by the script after every merge (`backlog-archive.mjs --rulings` already does it); one records-only pull request at the end of a batch instead of records in every job's. Whatever is chosen must keep the document check's guarantees (no ruling or item lost or doubled). Ruling: D822.

### [SKILL-FUSION-WRITING] The writing guide — outside writing guides and skills read at the source, their best parts taken into our own guide (he asked, 13 Oct 26) — the guide is approved (D836) and the rechecked wordings with it (D837–D839); what is left here is D835's step: the guide for how the agent writes to him
**He has answered (14 Oct 26 — "All approved as recommended"): the guide is approved (D836) and so are the rechecked wordings (D837, D838, D839). STEPS 1 TO 4 are done; STEP 5, the build, is next.** The guide goes live with this branch on his "merge live". **What is left of this item — D835's step, after the build or beside it, his to place:** the part of the guide that fits prose drafted into `.claude/rules/plain-language.md` for how the agent writes to him, read by the guide's readers, put to him (the tests that would go WRONG if copied across are listed at the foot of `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads-2.md`). The paragraph below is the state before his answer.
**Where it stands (14 Oct 26, early): put to him, waiting on his four answers.** The guide is `raptor-port/docs/design-practices.md` §1 (its additions), §1a (shortening — the first reads folded in) and the new §1b (how the app speaks, twelve tests), with short forms in `.claude/rules/ui-design.md`, check 4 of `.claude/rules/plain-language.md` and a line of `raptor-port/docs/PRODUCT.md`. **Read three times, each by a fresh Opus reader and by Fable, blind** — every finding applied: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md` (the first draft) and `…-writing-guide-reads-2.md` (the second, the third, and the cold read). The outside reading: `…-ux-writing-guides-research.md` (GOV.UK, Google, Apple, Microsoft, Atlassian, Mailchimp, the US plain-language guide, Nielsen Norman — and `blader/humanizer`, which he sent: read in full, its list of machine-writing habits taken as test 12, NOT installed). **His rulings on the way:** D834 — the long dash is not the app's ordinary way of joining two thoughts ("dash feels very AI"), a colon may be used, a dash where it makes sense; D835 — once approved, the guide is adopted for how the agent writes to him too, as a step of its own, and the guide was read again with his tool beside it. **The recheck (step 4) is done and with him:** `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` — List 1, the thirteen he approved (twelve to build; N8 can no longer be shown by the app — its line is dead since D96); List 2, the notes left whole, where only the dash changes; List 3, ten wordings a fresh reader tripped on; the clash note's and the OIL question's words; the two ruled bars, recommended left. **The page for him:** `raptor-port/docs/mock/writing-guide-13oct.html`, published as an Artifact (its link is in `HANDOFF.md`). **His four answers owed:** (1) the guide, with the agent's order — every fact, then a sentence a person would say, then short; (2) List 1 and the clash / OIL words; (3) List 2 in this build or in the whole-app words job; (4) List 3. **THEN:** each answer recorded as a ruling; the guide's wording is then approved (D70) and goes live with the branch on his "merge live"; the build of the three approved jobs starts — to the wordings he takes. **Still open after that — D835's step:** draft the part of the guide that fits prose into `.claude/rules/plain-language.md` (the tests that would go WRONG on messages are listed at the foot of the reads-2 record), have it read, put it to him. **And the relatives** of these notes that were not on the 13 Oct list (the recheck record's last section) go to the whole-app words pass (D808).
**His direction — D833 (13 Oct 26, late):** the writing guide complements the design guide and the design skill and is used every time app text is written — "intuitive clean simple smooth less verbose more human text with less -" (fewer dashes: the agent's reading); it shapes the Logic page's wording and this job's; and the wordings he approved (D827, D829, D830) are rechecked against the finished guide BEFORE the build. **The two reads are back (13 Oct 26, late) — both "ready with these changes", none applied yet:** every finding with its exact replacement wording, where the two agree and the one place they differ (the closed list of four kinds of word: Opus shows it forbids cuts he approved in D829; Fable tightens it) — `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md`. **And he added (two messages, in D833's row):** outside skills and guides, and reviews of which are good, may be used to shape the guide — so the part on how the app speaks starts with a read, at the source, of the best UX-writing guides and of what reviewers say of them (the first research read only the shortening side, and three sources would not open: GOV.UK's, Google Material's, the US plain-language site). **So the order is now:** (1) the two readers' findings on the shortening method folded in (`raptor-port/docs/design-practices.md` §1a, drafted — D832); (2) the part on how the app speaks drafted beside it — voice, plain human sentences, fewer dashes, intuitive naming — and read by a fresh Opus reader and Fable; (3) his approval of the guide's wording; (4) every wording of `raptor-port/docs/mock/design-look-13oct.html` (the notes N1–N33, the clash lines, the OIL question's a–f, "Back / Add") rechecked against it — each shown today · proposed · the exact words changed — and put to him again; (5) only then the build of the three approved jobs.
**READ 13 Oct 26 (his second ask: "Can u read online on skills similar to this, is it worth installing") — the record: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-skills-research.md`.** Both Strunk-based skills are a 1918 essay guide with "omit needless words" as a headline and no test — the instruction that caused the day's over-cut notes; the two UX-writing skills add little the design guide's §1 does not hold. Worth taking, as TESTS not maxims: a shortened note stays a full sentence; only four named kinds of word may be cut; swap before deleting; never trade a named thing for "it"; a fresh-reader test with set questions; "left whole" a proper result; no word count as a goal — eleven in all, with the day's notes 579 and 580. **Next, on his word:** draft them into the design guide's §1 and the wording method, one line in the plain-language rule; an independent read (D70); his approval. Nothing is installed.
**He asked (13 Oct 26, after sending the first shorter wordings back as "too summarised" — D825):** *"Is there a language skill u can download online to improve how you write clearly"*. **Told to him:** yes, several exist; the day's fault was a rule not applied (a shorter version must not change what the original meant — D138), not a missing skill; and by his standing practice nothing outside is installed whole (D486, D491, D812) — the best are read at the source and their good parts written into our own guides, read before he approves the wording (D70). **To do:** read two or three at the source, the Strunk-based "write-concisely" of `neolabhq/context-engineering-kit` first (found by one web search, 13 Oct 26 — a registry's summary, not yet read; its own listing calls Strunk "occasionally dated"), and anything better found then; bring him the pieces worth taking for `.claude/rules/plain-language.md` and the design guide's §1 — with the day's two lessons already in the working notes (579, 580): show the exact words cut, and read each rewrite cold. No app change.

### [BATCH-14OCT-LEFTOVERS] What the check of the three builds found that is not theirs — three questions for him and five small filed faults (filed 14 Oct 26) — the three answers and three note deletions are built and checked (the night of 14 Oct 26), waiting for his look and "merge live"; the small faults (a)–(f) OPEN
**BUILT on the night of 14 Oct 26, on the same branch (pull request 505 carries it with the three builds — D851); its check `raptor-port/docs/handpass/2026-10-14-leftovers.md` (tier WALK; the walk `raptor-port/scripts/handpass/lo-walk.mjs`, pictures `raptor-port/docs/img/handpass/2026-10-14-leftovers/`); the contract `raptor-port/docs/ui-contracts.md` §The passing notes' wording ("BUILT 14 Oct 26, the leftovers batch").** What is in the app: the just-added mark on the opened day's card and the month's bar (the List wore it), "Input added" / "Input updated" left unsaid where the input can be seen wearing it and said as before everywhere else, the mark steady for a reader who asked for less motion and its words told to a screen reader; the cancelled input's tag and reason after its window's title; the two question sheets' answers flat; no "Schedule updated"; no note for a puck put on or taken off an input's row (the note with "— not counted for OIL" is kept). **Three small things for his look, none holding the merge (the sheet's §0):** the month's bar shows its quick flash and then the blue box; on the desktop List the box is drawn round each cell, as since August; "OIL answer saved" is still said.
**His answers (14 Oct 26, late — D849): question (2) YES — the cancelled input's CX tag and reason follow the title; question (3) YES — the upchit and medical-clash questions' answers sit flat, no patch, no line (on the medical clash the buttons stay at the right). Both are approved to build, as drawn (`raptor-port/docs/mock/2026-10-14-leftovers/`). Question (1) is open in a new form: he asked why "Input added" is said at all where the new input can be seen arriving, and whether it should flash as an item added on the Scheduler Board does. The proposal put back to him: where the new input is in view (the day's window, the month, the List) no note, and its card wears the board's just-added mark (the board's blue box of about six seconds — `raptor-port/src/ui/highlights.ts` `paintFreshAdds`; the List's row already wears it, `raptor-port/src/ui/InputsPage.tsx`; the day's window's card does not); the note stays only where the new input is out of view or the save has a warning to give with it. **RULED — "1 yes" (D851), and D850 is its general rule (feedback designed into the screen; a note only for what the screen cannot show). All three are approved to build, as ONE small batch with its own check — in the next chat, on this same branch (`claude/approved-jobs-batch-build-cc42ef`), without merging first (his word, D851): one merge then carries the three builds and these together.**
**Found by the walk and the read of 14 Oct 26 (`raptor-port/docs/handpass/2026-10-14-three-builds.md` §0 and §9), not fixed — each is older than the batch or outside the lists he approved. Recommended: one small batch, with its own check, when he has answered.**
**Build notes for (1) — "Input added" (D851), from the fresh read of the guide's new point (D850):** the just-added mark on the Inputs List's row and on the Inputs calendar's card exists today ONLY as an animation and is switched off whole for a reader who asked for less motion (`raptor-port/src/ui/scheduler/06-inputs.css` `.innew>td`, `raptor-port/src/ui/scheduler/25-inputs-calendar.css` `.icard.innew`) — with the note gone that reader would get nothing: give both the Scheduler Board's shape (a steady box, only its fade animated); the passing note is not spoken to a screen reader today (`raptor-port/src/ui/toast.ts`), so what the mark says is to be told in words; the keyboard goes back to the button that opened the window, never to the new card; "in view" is D672's (wholly on screen, clear of the top bar and of any window over it) — on a phone the new card can be behind the form it was added from. **Suggested to him under D852 (other places like it) — not ruled; by D853 each is put to him with a picture in which the note is marked, before he is asked to decide:** **Put to him with pictures 14 Oct 26, late (`raptor-port/docs/mock/2026-10-14-feedback/`, drawn by `raptor-port/scripts/handpass/dl-feedback-mock.mjs`; the page's link is in this job's chat) — his answer: "Yes to all" (D854) — all three are approved to build with the leftovers ("Input updated" where the changed input is in view, its card marked; "Schedule updated"; the puck added / taken-out notes, no mark), and the six-second blue box is confirmed for "Input added":** "Schedule updated" after the Scheduler Board's ✓ Done (the board closing is the sign); "<name> added to <row>" / "<name> taken out of <row>" when a puck is dropped on or taken off a row (the puck is the sign; no mark there — the dense grid); "Input updated" after a change the card shows. "OIL answer saved" was suggested and is probably a KEEP by the guide's case 1 (a save on a form that stays open) — to check on screen. **Put to him as before-and-after pictures (14 Oct 26, late — he asked for them): `raptor-port/docs/mock/2026-10-14-leftovers/` (drawn by `raptor-port/scripts/handpass/dl-leftover-mock.mjs`; the page's link is in this job's chat), a recommended answer each; nothing built until he answers.** **Questions for him (each with its picture in the sheet's §0):** (1) on a phone a note raised while a window is open goes to the top (D731 (1)) and, full width now (D828), lies over the window's title and ✕ for its three seconds — and over the lower part of an open Leave War day sheet; recommended: look at it on his iPhone first; if it bothers him, the note sits just under the window's head. (2) In a cancelled input's own window the red CX tag and its reason stand by the ✕, not next to the title (D771 says "beside the window's title"; built that way on 12 Oct — the tag is one of the movable window's head tools, `raptor-port/src/ui/inputedit.tsx`, `raptor-port/src/ui/FloatWindow.tsx`); recommended: move them to follow the title. (3) The upchit question's "Keep / Remove" and the medical-clash question's two answers still sit on the stray darker strip with a line under it that L1 took off the OIL question (`.seg` — `raptor-port/src/ui/UpchitConfirm.tsx`, `raptor-port/src/ui/MedClashConfirm.tsx`); recommended: the same fix.
**Small faults, filed — (f) added by the leftovers' own walk:** (f) the passing note is not spoken to a screen reader (it never was — `raptor-port/src/ui/toast.ts` draws a plain box): where a note IS shown, a screen reader hears nothing; the leftovers batch tells one the words only where the note is left unsaid (`raptor-port/src/ui/seen.ts`). To fix: the note's box a polite live region, with a look at whether a long published-day note is then read whole. (a) the board's "Cancel this item" sheet: its reason chips (WX, OPS, LOGS) and "Edit" show the browser's own white ring, not the app's cyan one — K10's list did not hold them. (b) Quals: the links "Set which quals your squadron uses" and "Admin page" do nothing; and a member who presses "Add qualifications" lands on Admin's refusal (`raptor-port/src/ui/QualsPage.tsx`). (c) A clash for a person with no Leave War row prints his raw id in the note (`raptor-port/src/leavewar/ui/Chrome.tsx` `whoOf`). (d) The Medical view's two bands (the save warning's and the OIL bar's) are code no screen can reach — it is a tab of the Inputs page since D620; the head comments of `raptor-port/src/ui/SaveStatus.tsx` and `raptor-port/src/ui/OilWaitSheet.tsx` still name it as a full-screen surface. (e) The unit suite reads the real clock in places: two files were held on 14 Oct (`placeholderlist`, `sharedline`); the whole suite was then run with the clock moved on: 20 days on, every test passes (11310 of 11310) — nothing else is about to come due; 200 days on (May 2027), three tests of `raptor-port/src/ui/inputs.test.tsx` fail ("the date window › opens on today → the default window…", "…keeps a span that began before today but has not ended", "a new input announces itself › rides the top row…") — a longer fuse of the same fault; that file wants the same hold (the recipe: the read's report, `raptor-port/docs/superpowers/briefs/2026-10-14-three-builds-read.md`, R1 and its last section).
**For the whole-app words pass (D808) — sentences met on the way, not on his list, left as they are:** "Fable is recorded as working 08:00–18:00 on 18 Jul — this LL is filed anyway and flagged for someone to resolve" (`raptor-port/src/leavewar/inputgate.ts`); the day bar's hover title "Nothing on this day earns — the day blanket is on" (`raptor-port/src/ui/oilmode.ts` — "day blanket" is the code's word, not the screen's); on a desktop a two-line note's words are left-aligned where the phone's are centred; the OIL line's second form and the two lines that can ride behind it (`raptor-port/src/leavewar/sync.ts`); the several-days form of the OIL question; "common programme" in small letters wherever the day's own warning says it.
**Delete candidates by his rule of 14 Oct 26 (D846; the guide's §1, its wording approved — D847) — DONE the same day on his word (D848 — "Delete all three"):** "Choose Keep or Remove for each entry above" (the upchit question), "Choose for each clash above" and the small print under the answers (the medical-clash question) are deleted; the one fact he asked to keep, that a day holds one status, is that sheet's heading now ("A day holds one status: choose who holds these days" — shown to him as built, his to change). Kept, and why: "What is left goes to the schedulers' bells" in the day's one list of OIL questions (a consequence he cannot see), the several-days form's "No days selected — tap the highlighted days to credit them" (an instruction for a gesture nothing else suggests). The first whole-app look under D808 lists the rest.
**Why it is filed and not built:** D830's and D838's lists are his; a wording or a look he has not been shown is not changed unasked (the design guide's §1). His answers come first (D541 for the two that change a look).

### [PROMPT-AUDIT] He runs Claude Code's guide check, `/doctor prompt-audit`, in a terminal next time (his D886, 15 Oct 26) — OPEN, his step
**What it is:** a read-only report (Claude Code 2.1.283) of wording in the project's instruction files — CLAUDE.md, the
`.claude/rules/` files, the skills — written for older models. **How:** in a terminal at the repo root, `claude`, then
`/doctor prompt-audit` (or `/checkup prompt-audit`); paste or save its list into a chat. **Then:** that chat sorts the
points by file, recommends each, and puts them to him in rounds of at most four; a guide changes only on his word and
its read (D70). Nothing changes because the report says so.

### [OVERNIGHT-RETRY-TRIAL] One /overnight run tries the setting that keeps retrying when the service is overloaded (his D885, 15 Oct 26) — OPEN, for the next night he runs /overnight
**His yes (D885).** For that one night: before the run starts, add `"CLAUDE_CODE_RETRY_WATCHDOG": "1"` to the `env` block
of the MAIN folder's `.claude/settings.json` (the app reads settings from there — `[MAIN-CHECKOUT-STALE]`), committed on
the night's branch; in the morning read the run's record for any wait the setting rode out, and confirm no real failure
was hidden (a check that failed must still read failed). Then take the setting out again unless he says keep it. Not
known: whether the desktop app honours it — the night is the test. Optional companion, only if a wait was seen too
short: `CLAUDE_CODE_RETRY_WATCHDOG_MAX_WAIT_MS`. The `/overnight` guide is not changed for the trial (D70).

### [COMPACT-WHEN-MOD] A small sign in the Claude app that says how full the chat is and when it is a good moment to compact (his question, 14 Oct 26 — D857) — WIDENED 15 Oct 26 BY D868; BUILT 15 Oct 26 on his go (D870, D871), branch `claude/overnight-skill-c02843`, read by one fresh reader and fixed (design and read: `raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`); APPROVED (D872 — the guard off whenever he is away); LIVE 15 Oct 26 (pull request 509); OPEN until the next new chat's four checks in the app (the design's §"Still untested")
**His question:** *"is there a mod u can create or install to be able to tell I when to start compacting smartly"*. **The answer given him:** one can be made — a line in the app showing how full the chat is, marked at a good moment to compact (a clean, committed point with the state in the repo); the agent already reads that figure itself, so nothing waited on it that night. **Why it is put to him first and not installed:** it changes his Claude settings (a status line or a small mod of the app), which is standing configuration — his go each time (D162's precedent), and a tool that runs automatically here stays in a form other models can read (D623). **To put to him:** what it would show (the percentage; a colour at "good moment"; whether the state is committed), with a picture, and whether it should only show or also remind. Not app work: nothing under `raptor-port/src`. **Asked again 15 Oct 26** (whether the agent can see the figure, and that it matters for compacting at night): the agent reads the figure itself at any time, so the sign is for HIM; what the agent cannot do is START a compaction — the app does it by itself near 97% full. **To try with this job, safely, and rely on only if it works:** whether a message the app sends this chat at a set time (a scheduled prompt) can start a compaction earlier, on purpose — that would let the overnight command (D867) compact at a mark it chooses. **Widened by D868 (15 Oct 26): the agent chooses the moment itself, from about 80% full, without asking him, for day work and the overnight command — so a big job does not compact twice.** The build the agent proposes, from Claude Code's documentation (read 15 Oct 26 — the pages: env-vars, model-config, settings-reference, hooks, hooks-guide, context-window, statusline, scheduled-tasks on code.claude.com): (1) the app's own compaction point set near 80% (the `autoCompactWindow` setting, a token count — about 800000 on a 1M chat); (2) a guard run before every compaction (a PreCompact hook) that holds back an automatic one until the agent has marked a clean point with the state written (a small file the agent writes after its checkpoint) — the app's last-moment compaction near full stays the backstop; (3) after a compaction, the chat's `HANDOFF.md` block printed back in front of it (a SessionStart hook on "compact" — documented); (4) the fullness shown to him on screen (the status line, which receives it); (5) the scheduled-prompt route above, tried as an alternative. **Untested in the desktop app:** whether a held-back compaction is tried again later, whether the setting applies to this chat, whether the status line shows there — each tested on a throwaway chat before anything is relied on. Changes his Claude settings and adds automatic scripts: built on a branch on his go, read by one fresh reader, approved by him (D162's precedent, D70). **Answered (15 Oct 26, D868's row):** a handoff to a fresh chat stays his usual way; this is for a big job that would otherwise reach the app's compaction at 97%, and for the overnight command.

### [MAIN-CHECKOUT-STALE] Every desktop chat takes its Claude settings, hooks and skills from the main folder, which sat 208 commits behind `main` — so the compaction set-up and `/overnight` were in force in no chat (found 14 Oct 26, observation 600) — OPEN
**Found running the compaction set-up's four checks, not fixed.** A new worktree chat on `main` still read "compacts at 97%". Its process is started with `--project-config-root C:\Users\User\projects\Raptor`, and Claude Code's worktree page says why: a worktree chat started from the desktop app reads settings, hooks, skills, agents, commands and `.mcp.json` from the MAIN checkout's root (`${CLAUDE_PROJECT_DIR}` points there); only `CLAUDE.md` and `.claude/rules/` come from the worktree. The main checkout was on `claude/after-oil-ask-notify` (13 Oct 26, nothing unmerged, no tracked changes, 828 untracked walk files), so every chat ran 13 Oct's hooks and skills: no `autoCompactWindow`, no compaction hooks, no status line, no `/overnight`, the older session-handoff guide. The compaction hooks themselves already read the worktree from the hook's `cwd`, so they need no change. **Fix:** (1) put the main checkout on `main` and bring it level (`git -C <main folder> checkout main && git -C <main folder> merge --ff-only origin/main`), then re-run the four checks in a NEW chat — **DONE 14 Oct 26 on his "yes, update the main folder"** (the main checkout on `main` at `62b649e29`, its untracked walk files kept); the re-run is owed by the next new chat; (2) add to the merge-live steps (`.claude/rules/shipping.md`) and the session-handoff guide: after a merge that touches `.claude/settings*.json`, `.claude/hooks/` or `.claude/skills/`, bring the main checkout level, and verify by the app's own reading in a new chat, never by running a script by hand. (2) is a working-guide change: one fresh reader, his approval (D70).

### [KBD-PUCK] A puck cannot be picked up, put down, swapped or taken off by keyboard — and the week's 440 pucks are Tab stops that do nothing (filed 13 Oct 26, the design look's K11) — OPEN, a job of its own, his to place
**Found by `[DESIGN-LOOK-13OCT]`, not fixed — the question the design guide left open ("whether a keyboard can arm a puck is for the keyboard sweep to say", `raptor-port/docs/design-practices.md` §2): it cannot.** Every puck is drawn as a Tab stop (`raptor-port/src/ui/html.ts`) and wears the app's ring, but no key is heard on one: Enter, Space and Delete do nothing on the Scheduler Board or on Edit Schedule's week (`raptor-port/docs/mock/2026-10-13-design-look/keyboard.json`). So a scheduler at a desktop cannot move a man without the mouse, and Tab crosses hundreds of stops with nothing to do on any. **The shape to design (questions for him first — D541):** Enter or Space picks a puck up as a tap does on a phone (the app's own "armed" state), the seats that can take him are then the Tab stops, Enter puts him down, Escape lets go, Delete takes him off with Undo; the crew list reachable the same way. **Risk to weigh:** the dense week is swapped as text for speed (`raptor-port/docs/performance.md` Part 1) — the keys must ride the one listener the board already has, never one per puck. Tier WALK at least; a puck's drop is the schedule's main write.

### [ONE-RULE-LEFTOVERS] Three housekeeping jobs the one-rule job’s last step did not reach (filed 13 Oct 26) — OPEN, low

**Not faults — nothing a person sees.** Named in that job’s handoff as "step 8’s leftovers" and carried, not done, by the `[OIL-ASK-NOTIFY]` chat (its check was closing: a code change after the walked build would have been a change nobody walked). (1) The behaviour register’s 55 proposed ids (`raptor-port/docs/handpass/parts/or-step8-register.md`) are not wired into the tests’ names or `raptor-port/scripts/rulecheck.mjs`, so the rule check does not yet fail when one loses its test. (2) **DONE 13 Oct 26 with the Inputs batch** (`raptor-port/docs/handpass/2026-10-13-inputs-batch.md`): `PendItem.mates` and its three readers in `raptor-port/src/ui/pendlist.ts` are removed. (3) Four comments that name removed code — `raptor-port/src/ui/drag.ts` near "ONE OF A SHARED INPUT’S MEN" and the seat branch below it, `raptor-port/src/ui/inputedit.tsx` near the OIL ask’s reader and `askOilIfPending`’s callers (the handoff of 12 Oct 26 gave line numbers that have since moved: read each against the code beside it). **Place:** the agent’s — with the next Inputs / schedule batch (D490).

### [OIL-NOTIFY-SEEN] Five small older things met by `[OIL-ASK-NOTIFY]`’s walk (13 Oct 26) — none caused by that job; filed, not fixed
**(1) and the sideways phone's drag DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): Undo names a swap and an OIL answer; a touch drag's edge band is a sixth of a short pane. **Left:** a puck dropped on nothing says nothing — the same as `[AMEND-SMALL-SEEN]` item 8, a phone drag-off that removes a puck silently (carried here 19 Oct 26); the ALL AVAIL chip out of reach. **And met 19 Oct 26 (re-walk F, S3-16):** on a phone on its side a puck lifted from the crew list and held near the top of the board pane never scrolls the pane — its drag scrolls the list it came from (`ui/drag.ts tdScrollerFor`, older, unchanged by the batch); a puck lifted from a seat does.

**Found, not fixed — older behaviour, low.** (1) After a swap on an input’s row, the Undo note reads "Undid: a personal input" (and the Undo button "Undo — a personal input") — true, but it does not say it was a swap (walker A; the same words follow an OIL answer given in an input’s own window — walker D). (2) A puck dragged off a row to nowhere gives no note of its own (walker A, A13). (3) On Edit Schedule’s week the crew list’s ALL AVAIL chip scrolls out of the mouse’s reach when a lower day is in view (walker A, A5). (5) **BUILT 18 Oct 26 with D994's first batch (`raptor-port/docs/handpass/2026-10-18-sched-phone.md`): a made hand-over parks the drawer, at once or when its OIL answer makes it; a refusal leaves it up.** On a phone, after a hand-over by an armed tap on the Unavailable row the crew drawer stays open, where the row’s "+ add" puts it away (walker B, B6 — the ring’s half of this was new and is fixed: Fable’s read, the sheet’s C10) — and while it is open the drawer covers the top bar, so a finger on Undo lands on the drawer (the re-walk’s RX1-7, reproduced by the host: with the drawer put away one Undo works — the sheet’s §13.2). (6) On a phone on its side the Scheduler Board leaves a pane about 190 px tall, and a drag held near its top or foot scrolls the board under the finger: the puck is let go over nothing and comes off its row, with no note (Undo brings it back) — met by walker B, the re-walk’s RX2-10 and the job’s own browser test; older drag behaviour, for his iPhone look. (4) "Delete" in an input’s own window deletes at once, with no "are you sure" — Undo brings it back (walker D, D9). **ANSWERED 13 Oct 26 — D792 (*"No need to show are you sure"*): (4) is NOT a fault — a delete asks nothing, as built; do not build a confirm.** **Place:** the agent’s — with the next Inputs / schedule batch (D490). The walk’s record: `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md` §11.3.

### [QUALS-PINNED-COLS-REFLOW] Quals' pinned header row keeps its measured column widths when a column reflows inside a table of the same width (met by the D993 read, 18 Oct 26) — OPEN, low
**Older than D993, not changed by it.** On a desktop wider than the table (or a phone while the table sits at its least width), an undo of a remark or a rename, or a change arriving from elsewhere, can change one column's width while the table keeps its total width: nothing re-pins the row, so each pinned heading stands a few pixels off its column until the page is next scrolled back up and down. The sideways follow itself stays right (the table's range is unchanged); a change of the table's own width is caught (D993's read, F1). **To do:** watch the real header's cells as well (`QualsPage` `pin`), with a guard that skips a re-render when nothing moved; a test that reflows one column on a desktop. **Place (the agent's):** with the next Quals job.

### [TRK-PINCH-OLD-EDGES] Two older edges of the Tracker chart's pinch, met by the code reads of [TRK-CHART-FPS] (18 Oct 26) — OPEN, low
**Found by reading, not by him; older than D992, not changed by it.** (1) Edit chart layout switched on while a pinch runs (only with a third finger, through the menu) throws in the pinch's move: its start was taken for the other mode (`enablePinchZoom`, `raptor-port/src/tracker/app/core.js`). (2) A pinch ended by a lift lost to a redraw settles its zoom but leaves the zoom's % label stale and does not mark the zoom as his, so the next redraw fits the chart to the phone's width again. **To do:** a failing test for each, then end the pinch in the mode it began in, and run the ordinary end (`zoomIsMine`, `notify`) on the lost-lift path. **Place (the agent's):** with the next Tracker batch.

### [LW-PHONE-AWAY-ROW-MISSING] On a phone, a man archived and restored with a later post-in has no row on the Leave War (seen 13 Oct 26 by `[ONE-DATE-CALENDAR]`'s walk) — OPEN, to reproduce first

**Seen (W2, scenarios 2 and 13 — `raptor-port/docs/handpass/parts/odc/w2.md`; pictures `raptor-port/docs/img/handpass/2026-10-13-one-date-calendar/w2/phone-s12-s2-leavewar-row.png`, `phone-s2-probe-nov-his-row-missing.png`, beside `desktop-s12-s2-leavewar-row.png`):** a man added with a post-in ten days on, archived the same day, then restored with a post-in three weeks on: at 390 × 844 the Leave War draws 49 rows, not 50 — he has none, on October or November, and across a reload; at 1440 × 900 the same world draws him, hatched until his post-in. **Not `[ONE-DATE-CALENDAR]`'s doing (the host's reading, not yet reproduced):** the date box handed the same date at both sizes and the desktop's grid is right; that job's diff touches nothing of the war's roster, stints or grid. It looks like the phone grid's own answer to "is he here in the months drawn" for a man with two stays. **To do:** reproduce on `main`; then a failing test; the fix is the Leave War's. **Place (the agent's):** with the next Leave War batch.

### [PO-MOVE-DATE-DELETE-ASK] The Post out sheet takes a moved date at one tap — does a posting whose outcome is Delete then delete him without its second ask? (raised 13 Oct 26 by the read of `[ONE-DATE-CALENDAR]`; older code) — OPEN, to reproduce first

**Raised, not traced (`raptor-port/docs/handpass/parts/odc/read-opus.md` §5):** on the Leave War's Post out sheet a date picked is committed at once (as the phone's date box committed it). Where the posting's stored outcome is Delete and the date now picked has already come, does the delete run at that tap — without the second ask a Delete is owed (D287)? **Not `[ONE-DATE-CALENDAR]`'s doing** — the box hands on the same date the phone's did; but the app's calendar makes a past date one tap. **To do:** a test on `main`'s behaviour first (a posting out with Delete at a date to come; move the date to today). If it deletes at the tap: a question for him with a safe interim, and it bears on the tick he kept as a fallback (D801). **Place (the agent's):** before the Tracker's date boxes are built, since the same question — is one tap enough — is asked there.

### [IT-GUIDE-DATEBOX-SCRIPT] The IT flow guide's picture script still types into two date boxes that are buttons now (found 13 Oct 26 by the read of `[ONE-DATE-CALENDAR]`) — OPEN

`raptor-port/scripts/itflow/j/leaving.mjs` fills a posting's date as text; since step one those boxes are the app's own (`src/ui/DateBox.tsx`) and are picked on a calendar, so the script will stop at the guide's next re-shoot (D403). **To do:** open the box and tap the date, as `raptor-port/e2e/app.ts pickDate` does. Not a fault of the app. **Place (the agent's):** with the guide's next re-shoot.

### [ONE-RULE-SMALL-WORDS] Ten small sentences, hints and marks of the one-rule job that read oddly — seen by the Opus trial read and the re-walk, not changed (12 Oct 26)
**Found, not changed — low; words only, nothing owed or published is wrong. For the look-and-feel pass (`[UI-SLEEK-PASS]`, D765) or the next Inputs batch.** (1) A man whose own leave is cut in the middle by a medical is told "You were added" by his bell for the later piece of his own leave (the piece is a new input: `raptor-port/src/state/notices.ts noticePass`). (2) The others in a shared leave are told "Hex taken off" when Hex is only given a leave of his own — a remark typed on his Leave War cell, a time on his Unavailable row — which reads as if he lost his leave (the re-walk's RW3-7). (3) A man moved onto an input whose OIL answer is No gets no "— not counted for OIL" in the note, where a man ADDED to it does (`raptor-port/src/ui/reqdoor.ts rowMove`). (4) A remark typed on one man's Unavailable row of a shared overseas duty gives him an input of his own, so a scheduler's OIL switch-off about him on the shared one ends — worth one sentence to him when the OIL words are next looked at. (5) On a published day, a tap on the line of a swap from a flying seat ("Trident · Range drill — Ranger → Trident") rings the row and ALSO says "That seat is empty now" (the second re-walk, RX3-3 — the line's first place is one nobody stands on any more). (6) The jet's own line for that swap calls the lone man's old place "RANGE DRILL · extras". (7) After a member cancels the OIL question his bell opened, a second tap on the bell shows nothing — no list, no question — though he has an unread line (RX2-3; older than the one-rule job's last round; not reproduced by the host). (8) In OIL Earn the reason a puck earns nothing ("a personal request earns no OIL") is the hint of the seat round the puck; a pointer on the puck itself shows the callsign line (RX1-6) — the ALL AVAIL window says the reason in plain sight. (9) After the MIDDLE man is taken off a published row, the hollow "goes out as AL…" tag sits on the puck that closed up into his place — the count and the line ("taken out") are right (the third re-walk, RX4-5; Fable's third read: a row's places are compared one by one — older than the one-rule job). (10) On a row of several pucks that tag sits on the top corner of its own puck, which is the bottom of the puck above: at a glance it reads as the other man's (RX4-9 — on his look card). **To put to him when picked up:** the wording for (1) and (2).

### [OPUS-SECOND-READ-GUIDE] The checking guide does not yet say when a second, blind Opus read is run (decided 12 Oct 26 under D595 — a guide change, so it waits for its two readers)
**DECIDED, not written into the guide — waits for Astra and Sol (D70; out until about 1 Nov 26 — D761).** The one-rule job's trial (his word, D595): a fresh Opus reader, blind, on the walked build found eight real faults that Fable's read and a twelve-walker walk had not — and missed five of the nine faults already known. The agent's decision, written in `raptor-port/docs/handpass/2026-10-12-one-rule.md` §10b and told to him: on high-consequence work, while the ChatGPT readers are out, a second blind Opus read is run BESIDE the independent read, never in its place; only its findings count, each reproduced as a failing test first — its "sound" is not evidence. **To do when the readers are back:** one paragraph in `raptor-port/docs/bug-check-order.md` §4, read by both, then his approval; and whether it still earns its place once Astra and Sol read again.

### [NOTICE-RETENTION] The bell's notices are kept for good — a retention rule at the database step (the one-rule build's step 7, 12 Oct 26 — deferred)
**DEFERRED — for the database step.** Each notice is one saved record (`notices/<id>`), made inside the change that owes it and never pruned: a person's list shows his newest thirty, the rest stay stored. In this build that is demo data, cleared before the database (D56); in the database it grows with every change to a shared input. **Why it is not pruned now:** a notice is part of its maker's Undo step — a prune inside someone else's command would advance its revision and refuse that Undo, the fault the plan's F9 names for reading (`raptor-port/docs/undo-contract.md` §4). **At the database step:** how long a notice is kept is the organisation's retention rule, with the change history's (D351) — a server-side sweep by age, outside any person's command; and each person's read record (`settings/noticeseen:<pid>`) drops the ids of swept notices with it. `raptor-port/docs/data-model.md` §Notice says the same.

### [BOARD-SIDEWAYS-KEYS] A phone on its side with the keys up: the Scheduler Board's heading fills what is left (found 19 Oct 26 — the D1048 walk, walker A's A2; low)
*(Since 19–20 Oct 26 the board no longer follows the visible screen — it is page content, D1081 — so look again on a phone on
its side before building.)* With the phone on its side (874 × 402) and a keyboard of about 200px up, the board follows the visible screen (its fit to
`visualViewport`, `SchedBoard.tsx`) and is 202px tall; its bar, day strip and headings take 186px of it, leaving a 16px
strip to scroll in — a time box tapped low ends under the keys, and none can be brought up (`kbscroll.ts` scrolls the
panel to its end). Older than D1048 (the layout of the board's top on a short screen). Pictures:
`raptor-port/docs/img/handpass/2026-10-19-keyboard-scroll/walk/A/A2-*.png`; the sheet
`raptor-port/docs/handpass/2026-10-19-keyboard-scroll.md`. **To do:** on a short screen with the keys up, fold the board's
top to its one bar (the day strip and section headings scroll with the panel). A picture to him first (D853). **Place:**
low — with the next change to the board's top on a phone.

### [IPHONE-CARET-CHECKS] Two checks of the one-tap time boxes only his iPhone can make (carried from pull request 541's round-3 read; filed 20 Oct 26)
D1047: one tap into a time box then typing replaces its time; a second tap, dragging the caret or an arrow key puts the
caret where he wants it. Chromium cannot show two iPhone gestures: (1) dragging the caret with the space bar held — it is
not caught as a drag, so the box may still be armed and the next key replace the time; (2) a long press (the loupe) on the
box. **To do:** at his next iPhone look at a time box, ask him to try both; fix whichever arms wrongly (`interactions.ts`
armFreshTime). **Place:** low — with the next iPhone look at the board.

### [INNERHTML-REPAINT-SWEEP] A box inside markup React sets again on every repaint loses its caret (found 19 Oct 26 — the D1048 walk, walker A's A12; low)
React sets a `dangerouslySetInnerHTML` again whenever its object is a new one, not only when the markup differs (probed
on the built app, 19 Oct 26: the same Quals table set again on a repaint that changed nothing). A screen that writes
`dangerouslySetInnerHTML={{ __html: … }}` therefore throws its markup away on every repaint, with any box being typed in
inside it. Quals was fixed in [KEYBOARD-SCROLL] (the object made once per change — `QualsPage.tsx` `tableInner`, pinned
by `quals.test.tsx`). The rest: `ALPanel`, `AvailWindow`, `ChangesWindow`, `InputsCal`, `LogicPage`, `MedicalView`,
`Modals`, `PeoplePick`, `SansCal`, `SansDay`, `Shell` — most hold no box to type in; the walk met no lost caret on the
Inputs calendar, the SANS day or the Logic page. **To do:** for each, does its markup hold a box to type in, and does it
repaint while one has the caret; where both, make the object once per change. **Place:** low — a sweep of its own.
### [LOOK-PENDING-COUNT] The 👁 look at the Original shows "1 pending" in its head while the working copy shows "2 pending" (walker D, the D605 walk, 6 Oct 26 — OLD; low)
A published Tuesday; a man seated on a new line and a leave filed for him afterwards: the working copy's head reads
"2 pending" ("Vandal · LL filed", "WAVE 3 added"), and the 👁 look at the Original, opened at the same moment, reads
"1 pending". Seen by walker D in two of its orders (pictures
`raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/D/dk-04-dk-obs-2-after-leave-W.png`, `dk-06-…-L.png`),
not reproduced or explained by the host; nothing about a warning. **To do:** find which count the look's head prints and
whether a pending chip belongs on a look at an issued version at all. **Place:** low — with the next change to the
changes window or the version look.

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

### [REST-FIRST-CREW-HINT] Empty formation gives no predictive crew-rest hint for its first occupant (found 2 Oct 26)
Rally runtime evidence: an empty Wednesday formation resolves reporting to Tuesday11:00, but Ranger gets no pre-placement rest hint. First assignment correctly raises9h crew rest against Monday's overnight endingTuesday02:00. A different remaining crew member supplies a sibling and Ranger's hypothetical placement then correctly gives clearance14:00. Removal restores the missing-first-hint condition. Baseline query contract and a dedicated test explicitly return null for an empty formation; this is existing behaviour, not a new Rally regression, and is not exempted as stored-demo-only harm. The broad guide claim that the query never disagrees has been qualified in `raptor-port/docs/engine-rules.md`.
Independent bounded cause/disposition: `raptor-port/docs/superpowers/plans/2026-10-02-rally-empty-formation-triage.md`. Possible repair: construct the hypothetical first leg through the shared day builder on a copied day, then use the existing rest probe; never duplicate reporting/date arithmetic. Replace the pinned empty-formation contract deliberately with regression coverage and an independently challenged scoped plan. Owner has not approved this repair or limitation. **Place:** caps and ops limits batch under D495; final Rally inspector must judge its declared scope, not assume universal picker/post-drop agreement.

### [SANS-PREVIOUS-REPORT-OFFER] Prior-date availability is not combined across a previous-evening reporting window (characterized 3 Oct 26)
Actual I2 walk on the Rally review-fix snapshot: Tuesday01:00–11:00 flying reportsMonday22:00, dekitTuesday11:30. Kraken's MondayPM Fly offer gives the actual armed picker "no availability filed for today"; accepted placement has no persistent SANS_AVAIL warning under the existing none-offer rule. Adding TuesdayAM Fly gives picker00:00–12:00-only and the same placed advisory: the target-day window cannot cover report−120 through690. The two date-specific offers are not combined. This characterizes the prior-date gap named unproven in Claude's small review; it does not assert cross-date support, invent coverage policy, or treat live writes as stored-demo harm. Evidence: `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`, downstream07 results/pictures in this round's portable proof. **Place:** caps and ops limits with availability under D490/D495; owner policy/design and a scoped independently challenged plan precede any repair. No source change or owner acceptance here; the final Rally inspector judges this explicit scope.

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
**Left:** (1) his iPhone — the fix is proven in Chromium's phone emulation only; Safari decides a touch's target its own way
(on his look card: tap a count under ALL AVAIL on View-only Sched). (2) A question for him if it is still fiddly there: the
count is 20 × 14 px; Astra proposed a 28 × 28 px target on the phone's week, which costs a line of height on rows that carry
one (a measured layout — a picture first). **Place:** his look; then close, or the bigger target as its own small job.

**Current D566 batch evidence:** `raptor-port/docs/handpass/2026-10-04-accepted-taper-interface-batch.md`; accepted taper addendum and independent challenge linked there. All three scoped items built/checked with fresh independent R1PASS; owner look/Claude reads/authorized merge remain outstanding.

**Delivered D566 combined branch preview,5Oct26:** https://raptor-q27mo3zqg-kai-e2f5.vercel.app (source7f0b78bf; completed VercelSUCCESS/Preview9ZKYvXmsMPbWpc3RkwppHcWKzqqN). All3interface fixes checked/fresh independent R1PASS; owner look/Claude reads/authorized merge remain outstanding. Shipping method/limits in current accepted-batch evidence; no live authority.

