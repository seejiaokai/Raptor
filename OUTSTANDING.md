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
- **Next, in order — sized 5 Nov 26 (his "size it"; the plan `raptor-port/docs/superpowers/plans/2026-11-05-backlog-sizing.md`,
  his page https://claude.ai/artifact/NthXwi7aV811LMmuC1ENmE).** Each job its own branch from `main`, its own check, live on
  his "merge live"; React Doctor's 183 findings in the app ride with their area's job (D1534, D490).
  - **Night 1:** (1) Leave War faults — [LW-NIGHT1025-OLDER] (a) first, then (c), (d), (f), (g); [CSS-WRAPPER-GUARD] — FULL.
    (2) The board by the keys — [BOARD-KEYS-LEFT], [WINDOWS-KEEP-KEYS]' three leftovers, [WEEK-GLIDE-TWO-PAGES] — WALK. Live 8 Nov 26 (pull request 664).
    (3) React Doctor on the shell, state and windows (about 90), with [DOC-POINTERS-CODE] and [ONE-RULE-LEFTOVERS] (3) — WALK. Live 8 Nov 26 (667).
  - **Night 2:** (4) People and Quals — [QUALS-HEAD-FINGER-CAPTURE], [QUALS-PINCH-NOSDA-HEAD], [QUALS-ZOOM-EDGE-SLIVER], React
    Doctor's ~55 there. (5) Inputs — [INP-CARD-COLUMNS], [BATCH-14OCT-LEFTOVERS] (a)–(f), React Doctor's ~35 there. (6) Insights —
    [STACK-LEFTOVERS] (1), (2), React Doctor's 3; [LW-M1-READ-LEFTOVERS] archived. Live 8 Nov 26 (669).
  - **Night 3 (no app change):** (7) the checks — [CI-SMOKE-TIMEOUT], [SHELL-SCRIPT-GUARD], [MERGE-ONCE-RECORDS] (his "merge
    live"). (8) documents — [RULINGS-SPENT-PASS], [CAL-JOB-LEFT], [LW-READS-OWED-1024], [WORD-LIST]. (9) the folder —
    [REPO-TIDY] (1), [MAIN-CHECKOUT-STALE] (2).
  - **Then one pictures round for him** (about 12 questions, each drawn first — D1625): [BOARD-SIDEWAYS-KEYS],
    [BOARD-NARROW-DESKTOP-REMARKS], [SCHED-UNAV-PENDING-MARK], [READONLY-WEEK-WORDS], [TRK-ROUND-SEEN]
    (2), (3), [LOGIC-WORDS-WORKHOURS], [OIL-EARN-DAY-SWITCH-WORDS], [OIL-INERT-TAP-SILENT], [INP-ADD-RIGHT], [LW-MORE-BELOW-CUE],
    [LW-FROZEN-BAR-GAP], round 5 of [UI-CONSISTENCY-LOOK]; his answers built in about one night.
  - **His two answers (5 Nov 26):** React Doctor skips the mock-up pages and the original app, the tests' and scripts'
    notes left (D1716 — the setting with job 7); fixes first, the pictures round after (D1717).
  - **Started 7 Nov 26, on Opus (D1732):** [RULES-DIET] — the rules diet: plan v3 APPROVED 7 Nov 26, "As recommended" (D1735–D1738); steps 1 and 2 merged 7 Nov 26 (pull requests 656 and 657); step 3 (reading by section) merged 7 Nov 26, pull request 658 — about 7% of a job's read saved, not the plan's three quarters of the three reads; step 4 (the every-chat layer) merged 8 Nov 26, pull requests 663 and 665, his answers on it (D1760–D1762) pull request 671; step 5a (OIL as a page, the full trial) merged 8 Nov 26 on his "merge live", pull request 684, read blind by Astra and a fresh Opus reader; the IT guide as a page merged 8 Nov 26 on his "merge live" (chat 15, pull request 690), read blind by both; People & accounts as a page merged 8 Nov 26 on his "merge live" (chat 17, pull request 700), accounted and read blind by both — it loads with files most jobs open, so the re-measure counts it and narrowing its `paths:` is a question for him then; the scheduler's D212 stale clause (a member may tick SCHEDULER, since D1651) goes with the scheduler's page in 5b; the screen-design rulings as a page built, accounted and read blind by both, waiting for his "merge live" (chat 24, pull request 708) — it loads with every file of the app's code, so the re-measure counts it; for 5b, the Inputs pages' D1300 "cyan ring" (the mark is the one blue) and the scheduler's D1038 row's "Not built" (it is drawn); next the Tracker, on his word, and a re-measure before 5b.
    Found by its step 3, low, the agent's: [BUGCHECK-LESSON-ORDER] — the bug-check order's list of missed faults has a second 23 outside it and 8 before 7.
    Found by its step 5a (People), medium, the agent's: [DOCSIZE-PATHS-OPEN] — a rules file whose `paths:` list is never closed passes the document check, its page checks skipped.
  - **Waiting on his look only:** pull requests 636, 637, 639, 641 (other chats' work).
- **Then (D495, D585):** the Tracker's progress graph once he releases it (D774), then caps and ops limits
  ([CAPS-OPS-LIMITS] — started only on his word, D568; its questions wait under D994), then one whole-app check.
- **At the end (D473):** the database step — the "Database step" group below.
- **ChatGPT is back on a Pro plan (D1734, 7 Nov 26) — Astra the standing reviewer again (D1770, 8 Nov 26), Sol 6.1 on his word:** the reads owed in [NO-ASTRA-LIST], each his to call (D761).
- **Before any collaborator is added:** the checks runner comes off this repo ([REPO-PRIVATE]).
- **His step:** the repo is public today for a short period (D106); making it private again, and restarting his PC's check runner, is his ([REPO-PRIVATE]).

**Schedule and amendments**
- [DAMAGED-WEEK-LEFTOVERS] — a week whose saved copy cannot be read still prints and exports the demo days, shows them in the next-week preview, and refuses a person's delete in the amber note, not the grey "Blocked:" one (older; found 8 Nov 26, chat 13's walk).
- [SCHED-MARKS-WALK-ODDS] — four small older things chat 13's walk saw: the changes window's foot says "Tap a change to go to it." over a line that cannot be tapped; the look banner on two lines on the phone board; "2 warning" beside the board's "2 warnings"; a day's "N changes" chip beside "N pending".
- [SINGLE-SEAT] — a line with only its front seat filled must work fully, for F-16 and F-35 squadrons (D1099): the check is done (21 Oct 26); his answers to its 8 questions next, then the build.
- [CREW-REASON-TWICE] — a crossed-out man's reason says each fact once, not the kind's meaning and his remark both (D1121) — a later job of its own, its words put to him first.
- [IPHONE-CARET-CHECKS] — two checks only his iPhone can make, carried from the one-tap time boxes (D1047): dragging the caret with the space bar, and a long press (the loupe).
- [LOOK-COUNT-BOARD-ASK] — the board's look at a version shows no "N pending", the week's look shows one — whether a look should show it is his question, kept (D994).
- [HIST-JUMP-SEEN] — five small leftovers of tapping a change in the changes window — his to place.
- [PLAN-BANNER-DOOR] — the preview banner's "Switch to this plan" has no route a person can reach — retire it or give it one: his question.
- [PDF-PRINT-TWICE] — **HELD on his word (D1644, 4 Nov 26: "skip the pdf until i say so")** — on his iPhone "Export as PDF" prints the app screen (the working copy), not the published report (his picture, 1 Nov 26); his "Later" — the next batch of small fixes; set for the night of 3 Nov 26, then skipped on his word that night ("Skip the pdf") — waits for a later batch.
- [FLAG-EXPORT] — **HELD on his word (D1644)** — the PDF prints the published version but still the whole week, not the day — sample PDFs for his look.
- [ROW-NO-TIME-MARK] — a "?" on a row with no timing or no end time (D361) — scoped with him first.
- [KBD-PUCK] — a puck cannot be picked up, put down, swapped or taken off by keyboard — a job of its own, his questions first.
- [REST-FIRST-CREW-HINT] — an empty formation gives no crew-rest hint for its first man — with caps and ops limits.
- [EOD] — End-of-Day "record actuals": designed on paper, nothing built — his word.
- [BOARD-DESKLAYOUT-DAYBAR-EDGE] — on a phone in the board's desktop layout, the day bar's Templates and OIL Earn stand off the right edge until he pans — older; his question with a picture.

**Inputs and calendars**
- [PRINT-FLYING-ONLY-ASK] — the printed page and the schedule's spreadsheet carry flying lines only, no Ground Programme row — his question, kept from [ALLAVAIL-CHECK-SEEN] (not walked again 3 Nov 26).
- [UI-CONSISTENCY-LOOK] — the whole app looked over for the same thing drawn differently (D1124): rounds 1–3 answered and live; round 4 (findings 12, 15, 17, 18; the gear and calendar drawn as ruled — D1509, D1508) ANSWERED 5 Nov 26 "all as recommended" (D1701–D1707, with D1700) — BUILT, bug-checked and LIVE on his "merge live" of 5 Nov 26 (pull request 643), with his answer to the one question, A (D1708 — where the Inputs row wraps, the filters and gear at the LEFT of the second line), drawn and approved ("Yes"); round 5 (the 👁 line, the Inputs ⤢) after — its (e), the phone day bar's marks (D1793), BUILT and bug-checked 8 Nov 26 by chat 5 (`claude/pr-oil-earn-ffbf07`, pull request 679).
- [INPUTS-LIVE-LEFT] — what the Inputs pages' work left: readings he has not answered, his iPhone looks, three unconfirmed observations.
- [SANS-PREVIOUS-REPORT-OFFER] — a previous evening's availability is not combined with the day's — his rule first; with caps and ops limits.

**OIL**
- [OIL-INERT-WHY-CX-INFO] — in OIL Earn a cancelled or ⓘ row with times says "This row gives him no working hours to count OIL from" (as D1783 ruled); a finer reason is his question.
- [OIL-EARN-WORDS-LEFT] — two OIL Earn wordings not ruled: the switch's passing note "…and the marks underneath are back" and an item's hover "the day blanket is on" — his look.
- [OIL-WINDOW-FOOT-SHAPE] — in OIL Earn the ALL AVAIL window's foot gives an inert man's reason as "<callsign> — <reason>", where the board now says "Nothing changed for <callsign>. <Reason>." — older; his question.
- [OIL-ROSTER-TAP-SELECTS] — in OIL Earn a tap on a man in the board's crew list still picks him; D65's "no tap selects" read literally reaches it, D1783's "row" does not — his question.
- [OIL-SWITCH-NOSAVE-SHOW] — "No OIL earned" is a box the browser ticks itself; a press that saves nothing would leave it showing the opposite of the day (not reachable today) — a one-line guard, with the database step's failed saves.
- [OIL-EARN-BOARD-TIDY] — the three code reads' tidiness notes on the OIL Earn board change (D489), filed not fixed.

**Leave War**
- [PAGE-FAULT-BLANKS-APP] — a fault inside the Leave War or the Tracker (not a failed download, now caught — D1631) still blanks the whole app; a message for it is a new screen, drawn for him first.
- [KBS-LW-SHEETS] — the Leave War's sheets and bid windows place themselves the moment the phone pans for the keys; by the keyboard job's reading the same jump-then-slide class D1412 forbids; drawn for him if he sees it there (named under D852, 27 Oct 26).
- [LOAD-MOVES-ROW-DAY] — a load of one day can move a several-day course's row onto another published day (its start day) — a question for him with pictures (D994), older.
- [LOGIN-OPENS-TODAY] — his D1383: before the app goes out for testing, signing in always opens on today's date; not now (demo data).
- [LOGIN-NOT-AT-TOP] — after signing in on a phone the page now opens at its top (live, pull request 569); his iPhone look owed, then archive.
- [SCHED-UNAV-PENDING-MARK] — on a published day an input under the Unavailable list carries no "waiting to go out" mark on its row, where a Ground Programme row does (the count and the changes window do say it) — older than the M3 build; found by its FULL check.
- [LW-NIGHT1025-OLDER] — only (b) is left, with the database step: (d), (f) LIVE 6 Nov 26 (pull request 646); (c) LIVE as his D1720, D1722; (a), (g) done earlier.
- [LW-PICK-HELD-MARK] — the tapped day's cyan mark (D1289) BUILT 28 Oct 26 with [LW-WHOLE-LEAVE-WINDOW], and the phone's scroll (D1290) built in M3; left: whether the one-day window can be shorter — pictures to him first.
- [INP-CAL-CLICK-BEHIND-NEW] — on the Inputs and SANS calendars a date clicked behind a new input's window lights as picked while the window keeps its date (his D1298); his choice of what it does first.
- [LW-READS-OWED-1024] — left: design lessons 49, 50 and 52 reworded to what he said (the fix worded in the reader's file), and D1297's sweep of earlier evidence sheets with its fresh reader.
- [CSS-WRAPPER-GUARD] — BUILT the night of 6 Nov 26 (`claude/lw-faults-1106`): the check, with the 202 rules after the bid sheet's wrapper listed — not deliberate after all; moving them is [LW-BIDPICKER-CSS-INSIDE].
- [LW-PO-DAYS-DRAWING] — his D1720 (6 Nov 26): BUILT and walked on `claude/lw-faults-1106` (pull request 646); close once live.
- [LW-FULL-EDITING] — his D1724: every entry on the Leave War moved, deleted, its days and remarks changed there; a day of several entries opens the window that adds more; drawn first, then a FULL check; brief `raptor-port/docs/superpowers/plans/2026-11-06-lw-full-editing.md`.
- [LW-DOUBLETAP-OTHER-WINDOWS] — the double tap's second tap still falls through the person window, ⚙ Settings, the event window and five more over the grid; the guard of 6 Nov 26 covers them cheaply (low, the agent's).
- [LW-ROLLBACK-FOCUS] — a refused war change still puts back the jump-to-a-day state, so the grid can jump back after one (low, needs its own look).
- [LW-BIDPICKER-CSS-INSIDE] — the bid sheet's 202 style rules move inside the Leave War's wrapper, as a walked job (low, the agent's).
- [LW-BID-BUBBLE] — the bubble after a bid: his question, waiting (the pick-look page's Q3); redrawn with D1313, D1314 in place before it is put to him again.
- [INP-HEAD-SORT-READER] — the Inputs List's column headings sort from the keys since 6 Nov 26, but a screen reader is not told a heading can be pressed; the fix, a button in each heading, changes its look — a picture first (low, with the keyboard sweep D807).
- [QUALS-HEAD-SORT-KEYS] — the Quals table's headings sort by a click only; the keys cannot reach them (low, with the keyboard sweep D807).
- [WALK-SCRIPT-UTF8] — a walk script saved partly in another letter coding made the code check fail (6 Nov 26); a line in the walkers' brief guide that scripts are saved as UTF-8 — a guide change, on his word.
- [MED-ROOM-DRAGGED] — the Medical tab's room for its window (D1300) stays when the window is dragged away, so the cards are squeezed and covered; the Inputs list's fix of 8 Nov 26 applies as it is (low, found by both readers of chat 7).
- [INP-ROOM-TIDY] — two tidy-ups the code read of 8 Nov 26 filed: the room's size written in two stylesheets, the calendar expand button's unused font size and line height (low, the agent's).
- [LW-MORE-BELOW-CUE] — the day panel says how many more are below its foot ("↓ 10 more") when its list runs past it (his D1295) — built as the bell's grey foot (D1788) on `claude/pr-leave-war-4988a8`, pull request 680; walk, reads and his look to come.
- [LW-OVERHAUL] — the Leave War's overhaul (D1140): M1–M4 live (pull requests 566, 567, 569, 581; follow-ups 571–573, 582); M5 PLANNED 28 Oct 26 (`raptor-port/docs/superpowers/plans/2026-10-28-lw-m5-plan.md`) — its four rules and the split answered 28 Oct 26 (D1472–D1475: M5a, balances, then M5b); M5a's drawings all answered 28 Oct 26 (D1479–D1489); M5a built and FULL-checked the night of 28–29 Oct 26 and live on his "merge live" of 29 Oct 26 (pull request 586; his drawing picks D1493; left for his iPhone: a tapped box above the keys, no page zoom on a tap, the number keys' minus, the slide and pinch, My leave with three figures, the "Saving…" note); next, M5b in a fresh chat (D1475) — its drawings in the app's own design (D1496) and its build run through the drawing check (D1495, walk-scripts §10). **M5b round 1 drawn 29 Oct 26** on `claude/leave-war-m5b-iphone-balances-1402b7` (`full-m5b-draw.mjs`, pictures `full/m5b/`): the Settings window, the Events list, holidays by file with its preview, Management on Quals — four questions on https://claude.ai/artifact/F8PHq6k2bTBMS3ukL8qykH, **answered 29 Oct 26 "All as recommended" (D1499 Settings, D1500 the Events list, D1501 holidays by file — public holidays and Off days only, D1502 Management already on Quals)**; **M5b's build spec written and M5b built 29 Oct 26** (`raptor-port/docs/superpowers/plans/2026-10-29-lw-m5b-build-spec.md`; the drawing check green, 10 states); FULL-checked (`raptor-port/docs/handpass/2026-10-29-lw-m5b.md`); then D1510 and the Events list's split (D1512–D1517) built and checked (§10, §11); **all live on his "merge live" of 29 Oct 26 (pull request 588)**. All six of D1250's merges are live (M5b the last — D1475); the rulings files' tripwires raised 29 Oct 26 (D1262). Left: what his iPhone look owes M5a (above) and the overhaul's own leftover items in this list.
- [LW-EVENTS-LANE] — parked: a better way to show the Leave War's events (round 21's study, B an events lane recommended) — not put to him until he raises it (D1259).
- [NOTIFY-REGISTER] — the register of notifications (D1151) is written; its six proposed lines (P1–P6) wait for him to keep or strike.
- [HUMAN-RETEST] — the last re-test left: the Leave War links, with the 7 Sep phone check.
- [BACKLOG-ORDER] — his order of 21 Sep 26 for after the re-test: [LW-LOCKMARK] (done 31 Oct 26), then [LW-WEEKDAY-WORK], then the database.
- [MULTI-SQN-DESIGN] — one app, one database, many squadrons: home squadron at account creation, view-only rights to others, transfer on posting out, a day split between squadrons (his D1695, 5 Nov 26) — a design job of its own with pictures, before the database step.
- [NOTICE-UNDO-RETRACT] — every bell line retracted by the undo of what made it: unread goes, read becomes "… taken back · <who>" (his D1693, 5 Nov 26) — step 1 (the posting line) LIVE 5 Nov 26; step 2 (the input lines, the holiday's OIL line) open, his to place. — the posting line first, on `claude/postout-bell-look`; draw the new words first (D1625).
- [LW-FROZEN-BAR-GAP] — for one frame no dates header shows while the page scrolls — built (D1789; Quals too) on `claude/pr-leave-war-4988a8`, pull request 680; walked: halved, two painted frames to one, scrolling not slower; the last frame is [LW-PIN-LAST-FRAME]; reads and his look to come.
- [LW-PIN-LAST-FRAME] — the pinned dates row (and Quals' heading) still blinks for one painted frame: the browser's own; it went live so (D1850), and this is the job: a new way of pinning, measured first.
- [LW-WINDOWS-NONBLOCKING] — the war's other windows still block the grid behind them — which stay up is his choice.
- [LW-WEEKDAY-WORK] — the war cannot see ordinary weekday work — talk to him before building any of it.
- [LW-COMMIT-MANNING] — duty and commitments lowering the war's manning: parked "for now" (D998), his to raise.
- [LW-OIL-OPENING-AWARD] — at go-live: an opening OIL balance given as an award (D1255) shows on the grid as an FO / HO on its date and follows the OIL expiry rule — a question for him before the database step.
- [LEAVE-YEAR] — yearly leave balances and carry-over — ruled (D1218, D1224, D1229, D1234, D1235, D1473, D1474, D1489 — the other kinds keep their figures on 1 Jan), built with the Leave War overhaul's M5a.
- [LW-SORT-BY-FLIGHT] — sort the war by flight — his idea, not designed (D1001).
- [LW-UNDO-BLOCK-REOPEN] — with the database step: a member's Undo or Redo refused onto a day closed for him stays passed over until sign-out, even if an admin reopens the day from another device.

**Tracker**
- [TRK-STANDALONE-LEFTOVERS] — built and checked 5 Nov 26 (pull request 637, `claude/tracker-standalone-tidy`); archive once live.
- [TRK-KEPT-COPIES] — the Tracker's own glyph, pencil and colour copies, kept from the standalone app; merge them into the app's, checked by pictures (low, the agent's). BUILT 8 Nov 26 (chat 20, PR #696) but the magnifier: he ruled it matched to the app's (D1900) — to build.
- [TRK-MARKS-LEFT] — typed marks still in four Tracker messages and hints, and the Tracker's Export / Import drawings unlike Admin's; for the consistency look (found by chat 20).
- [TRK-MENU-KEYS] — the Tracker's course, syllabus and File menus wear the browser's white keyboard ring, not the app's cyan, and the arrow keys do not move through them, unlike the board's menus (found by chat 20's walk).
- [TRK-COPIES-TIDY] — the code reads' tidiness notes on [TRK-KEPT-COPIES] (D489), filed not fixed.
- [TRK-NOSTORE-SAVED] — in a browser that refuses storage the Tracker's corner says "● saved" though a reload loses the work, on every page; he chose a "Not kept" band under the top bar on every page (D1901) — to build.
- *(The Tracker's database-step items are in that group below.)*

**People, accounts and Quals**
- [QUALS-PINCH-NOSDA-HEAD] — Quals mid-pinch in, only in a browser without scroll-driven animations: the pinned row's name heading is carried left until the lift (found 31 Oct 26 while building [QUALS-PINCH-MID]; small). **BUILT the night of 6 Nov 26** (`claude/people-quals-1106`, his look and "merge live"; evidence `raptor-port/docs/handpass/2026-11-06-people-quals.md`) — close once live.
- [LW-PINCH-FROZEN-WEBKIT-OFF] — Leave War, Safari's engine only: mid-pinch in with the dates frozen, the frozen date row read about 360 px off its columns (older — origin/main the same; found 31 Oct 26; maybe a reading, not a fault — a look first).
- [QUALS-ZOOM-EDGE-SLIVER] — Quals after a pinch, at a fractional zoom: a one-pixel sliver of a scrolled cell's letters at the name column's left edge (older; found 30 Oct 26). **BUILT the night of 6 Nov 26** (`claude/people-quals-1106`, his look and "merge live"; evidence `raptor-port/docs/handpass/2026-11-06-people-quals.md`) — close once live.
- [QUALS-HEAD-FINGER-CAPTURE] — in Edit quals a finger pressed on a heading's words may never reach another column (the press stays held by the words) — a check on his phone, then a one-line fix. **BUILT the night of 6 Nov 26** (`claude/people-quals-1106`, his look and "merge live"; evidence `raptor-port/docs/handpass/2026-11-06-people-quals.md`) — close once live.
- [QUALS-PINNED-HEAD-NO-DRAG] — in Edit quals, scrolled down, a heading in the pinned row under the top bar cannot start a column drag; the table's own heading row can (older; low, with the next Quals job).
- [QUALS-OUTLINE-RESCROLL] — Quals' outline after "Check his quals" or an Undo is never cleared, so a later change with that row off screen may scroll the page back to it (found by a code read 6 Nov 26, not walked; low, with the next Quals job).
- [LINE-ICONS-ELSEWHERE-ASK] — a suggestion kept for him (D852): other lists whose lines open only by a tap may want D1512's edit and cross icons too.
- [QUALS-COL-WAR-GROUP-ASK] — a question kept for him (D994): a member may tick his own Quals columns, so he can put himself in a Leave War group made from one (Management excepted, D1510).
- [UNDO-POSTING-RECORD] — Undo for adding, archiving and restoring a person and for postings (D350) — his word.
- [RECALL] — bringing an archived man back fresh into Quals — a future feature, his word.

**Insights and Logic**
- [LOGIC-IOS-REFOCUS] — on his iPhone, does the keyboard stay up when a Logic setting is saved by tapping the next box? (a check on his phone; found 21 Oct 26).
- [STACK-LEFTOVERS] — three small loose ends left (the Insights edges and the shared wording helper done 8 Nov 26): an old audit script's three checks (with its own job), a "back to last published" button (only if he raises it), one tidiness note — a line's callsign tidied in three places for the Blue/Red answer (with the next change to its role question).
- [LOGIC-SWITCH-RING] — the Logic page's own switches wear the browser's keyboard ring, where the board's "No OIL earned" now wears the app's cyan one — to match, his look first.

**Look, words and the phone (the whole app)**
- [READONLY-WEEK-WORDS] — a week read-only because a row will not read still says "open it on the device that created it".
- [BATCH-14OCT-LEFTOVERS] — older small faults found by the three builds' check (not caused by them): the Cancel-item sheet's chips wear the browser's ring, notes a screen reader is not told, stale comments, a test on the real clock. **Checked 6 Nov 26: pull requests 558 and 556 are both live, so by its own line this item is ready to archive whole.**
- [VEILED-WINDOWS-BAR] — his answers D1645, D1647 (5 Nov 26), building the night of 5 Nov 26 — the other veiled windows keep the bar covered, and the Traffic and day-details windows and the board's small menus do not close on Escape (found 30 Oct 26; low, the agent's). **The Escape part BUILT the night of 3 Nov 26** (`claude/week-swipe-pdf-print`); the bar part stays open.
- [SCHED-CTRL-Z] — the schedule pages have no Ctrl+Z (only the Tracker has one): a question for him, not put until he says (D994).
- [LOCATE-ITEM-MARKS] — the way the app finds a redrawn button again trusts the button's first mark; a short list of the marks that name an item would be surer (the keyboard batch's second fix read, 5 Nov 26; low, the agent's).
- [BOARD-OTHER-RINGS] — most other Scheduler Board buttons and its time boxes still wear the browser's own ring under the keys, not the app's cyan one: a question for him with pictures, not built (D1625).
- [BOARD-TAB-MENU-BUTTONS] — a walker found Tab never stops on the board's + Block, + Wave or a jet's stores, which D1646 says the keys reach: to reproduce, then fix or put to him.
- [BOARD-UNDO-SAME-DAY] — on the Scheduler Board an Undo of a change out of view, on the same day, leaves the screen where it was; D672 says it moves to the change: to reproduce, then fix (older; found 8 Nov 26).
- [BOARD-SIDEWAYS-SMALL-PHONE] — a question kept for him: on a smaller phone on its side (844 wide) the board's pinned bar is two rows, so the list above the keys is 101px, not his phone's 151.
- [VH-SHEETS-IPHONE] — some phone pop-ups may be cut off by the browser's own bars — only after his iPhone look.
- [COUNT-CHIP-PHONE-TAP] — a finger tap on an ALL AVAIL count: fixed in the test browser; his iPhone look owed.
- [WEEK-ADD-TAP-PHONE] — on a phone, "+ add" on the week arms nothing when the row already holds someone — left out of the phone batch, his choice.
- [APP-FONTS-NOT-LOADED] — the app names fonts it never loads, so each device draws its own — his call.
- [ONE-RULE-SMALL-WORDS] — ten small sentences and marks that read oddly — for the words pass; two wordings his.
- [UI-SLEEK-PASS] — the sleeker interface (D765): the first word rounds are live; the rest page by page, on his word.
- [PERF-RESIDUALS] — measured speed wins held back; two change wording or feel — his call.
- [ADMIN-DISPLAY] — an Admin "Display" area of fold defaults — not built without his go-ahead (D161).

**Checks and tooling**
- [BOARDNAV-SCRUB-CLICK-TIMER] — the board's day-dots test "the click after a scrub does not snap back" leans on a real 350 ms window; it failed once in a crowded run (86 files) and passes alone — make the test wait on what it needs.
- [TESTS-REQUIRED-ON-MAIN] — GitHub refuses a merge to main only when the secrets scan fails, not the tests; a summary job made required would close it (Astra, 8 Nov 26) — night 3, the setting his own click.
- [CI-SMOKE-TIMEOUT] — the time limits on GitHub's test jobs live 8 Nov 26 (pull request 670); left: React Doctor to skip the records (D1716) and the design check's one false alarm (night 3, job 7).
- [LW-ZOOM-TEST-SLOW] — the Leave War desktop browser test "a pinch (phone) or Ctrl+scroll (desktop) zooms the whole grid down and back" timed out twice in one GitHub run (3 Nov 26, at 31.8s and 32.0s) and passed on the next commit's run; watch it (D84).
- [REVIEW-LAYERS] — his five rulings from the review-process page (D1407–D1411): the scorecard's baseline first, then notes-only pull requests merging by themselves, the secrets scan, the security read, the reader's test set. Steps 1 (the scorecard) and 4 (the secrets scan) built 31 Oct 26, not merged; two repository settings his to approve.
- [DESIGN-CHECK-GOLD-DOT] — the design checker calls the gold history dot a "grid background" (a false alarm); an ignore for that one file needs his OK.
- [ONE-RULE-LEFTOVERS] — the one-rule job's 55 behaviour ids are not yet checked by the rule check.
- [RD-LEFT-1108] — React Doctor's 31 findings left after the shell-and-state job: 13 import cycles through the people-settings save (a cycle cannot be kept with a reason) and 18 in other areas' files — each with its area's next batch.
- [SHELL-SCRIPT-GUARD] — a guard that refuses a script typed into the command line — his go given (D811).
- [MERGE-ONCE-RECORDS] — finished jobs merged as one pull request, and record files that merge without clashing (D822).
- [MAIN-CHECKOUT-STALE] — step 2 left: a guide line to bring the main folder level after a merge that touches settings, hooks or skills.
- [REPO-TIDY] — clear the old worktrees (47 today) and the 6 Nov night's three build folders after safety checks; moving the walk pictures out is his call.
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
- [DOC-POINTERS-CODE] — four code comments still point at documents moved in the spring clean: in the rules engine and in pull request 664's files, each with its next change; one to read against D338.
- [WORD-LIST] — the app's word list was drafted, never checked or filed — checked, then read before his approval.
- [SKILL-FUSION] — the planning guide's harder questioning and three proposals — each read before his approval.
- [CAL-JOB-LEFT] — the calendar job's leftovers: a stale line in the Codex guide, owed reads, looks never recorded.
- [IT-GUIDE-DATEBOX-SCRIPT] — the IT guide's picture script still types into date boxes that are buttons now — at its next re-shoot.
- [ITFLOW-OIL-RESHOOT] — re-shoot the IT flow guide's Leave War and OIL pictures — on his word (D403).
- [IMPECCABLE-UPDATE] — the design skill to v4.1.3 (D625): the calendar job it waited for is live; its reads and his word next.
- [START-CONTEXT-AUDIT] — the guard that stops a new chat's load growing back is not built; two of his own settings.
- [SKILL-FUSION-WRITING] — the writing guide applied to how the agent writes to him (D835): to draft, have read and put to him — his to place.
- [GUIDE-MAP-ROWS] — the project guide's map has long rows that could move to its full text — his question.
- [EVIDENCE-RECORD-SIZE] — the big machine-written records and pictures: kept or moved — his call.
- [USER-GUIDE] — a guide for users and admins — wanted, not started, not urgent.

**Database step — at the end (D473)**
- [M365-MOVE-PLAN] — the M365 move plan, his strikes owed.
- [AIRCRAFT-TYPE-SETTING] — each deployment set to its aircraft type by a setting, one code base (D1536); at the database step or hand-over.
- [M365-HOSTING-TRIAL] — the app on his own M365 with no database (D1532) — **waits for his word: no test account yet (D1682, 5 Nov 26)**; not proposed again until he raises it.
- [DB-STEP] — the move into the shared database: the table format written on his side, then the one adapter.
- [DB-SECURITY-ROLES] — the agent designs the database's security roles from data-model §11 (D1653); IT enters them; a member-only account tests them.
- [DB-WAITING-CREATEDBY] — the database's own "created by" on a waiting person's change-log row would name him; write such rows through a service account.
- [DB-ONE-MASTER-FIXES] — the check's places that do not read the one table, for the database step (D1587, D1589): Quals ticks, holidays, a posted-out man, a Tracker student, medical documents, four smaller, history names.
- [DB-OIL-OWN-TABLE] — at the database step earned OIL gets its own table by person and date, not tied to a Leave War period, read by every screen (D1579, 3 Nov 26).
- [DB-WEEK-AHEAD] — at the database step, the weeks on either side are fetched ahead and kept on the phone, so a cross never waits on the network (his question, 3 Nov 26).
- [ONE-LIVE-WEEK-WEIGH] — whether the app should hold several weeks at once instead of one live week — weighed at the database step, not before (his question, 3 Nov 26).
- [SERVER-SIDE-PASSES] — every pass the app runs under its own name (the posting pass, the war's sync, the inputs' sync) runs on the server at the database step, never under a credential a browser holds, limited to the rows it owns.
- [SYSTEM-ACTOR-ONE-TEST] — "the app itself" is decided two ways (the posting pass's wait by a command's origin, the commit gate by its actor); make them one before any seed or remote commit exists.
- [POSTPASS-FIRSTWRITE-WHOLE-SEED] — this build only, out of the app's reach: the posting pass's first account write is checked row by row but never that the whole seeded list is there.
- [DB-READINESS] — group A is live; group B and the lock's screens come after the app is connected.
- [DB-SYNC-MODEL] — the sharing and day-lock design is done; five of its screen questions and the build wait.
- [IT-QUESTIONS] — the IT side's written reply of 8 Nov 26 is in; five small points still to ask (their short code, what basic access allows, SharePoint, the audit's keeping, a role-based account), and the first admin.
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

### [SCHED-MARKS-WALK-ODDS] Four small older things the schedule-marks walk saw (found 8 Nov 26, chat 13's walk)
**What:** seen by the walk of chat 13's job (D1784, D1785, D1792 a, d — branch `claude/pr-sched-marks-3205d7`, evidence
`raptor-port/docs/handpass/2026-11-08-sched-marks.md` §15), each older than that job, none losing anything: (1) the changes window's
foot on "To go out" always reads "Tap a change to go to it." — fixed words since the window was built — even when every line on it
stands still (a SANS availability; a man taken out of a shared input), pictures `…/2026-11-08-sched-marks/host/f3-fix3-list.png`,
`…/w4/s4-pc-week-1-list.png`; the old pending list's foot said it only where a line could be tapped (`raptor-port/src/ui/ChangesWindow.tsx`);
(2) a look at a published version on the phone board: the banner's words take two lines and it sits under the Aircrew tab
(`…/w3/s28-phone-b-look0.png` — the same on `main`, the drawing check matching `main`'s drawing pixel for pixel); (3) Edit Schedule's
issues bar reads "2 issues · 2 warning" where the board reads "2 warnings" (`…/w3/s26-pc-e-hide1.png`); (4) a published day's
chip reads "N changes" (what the issued versions changed) beside "N pending", which a person may read as changes not yet sent
(W1a, W3). **To do:** (1) the foot only where a line can be tapped; (3) the plural; (2) and (4) drawn for him before anything
changes (D1625). **Place:** Schedule and amendments, small — with the next job on the changes window or the words pass.

### [DAMAGED-WEEK-LEFTOVERS] What a week whose saved copy cannot be read still gets wrong (found 8 Nov 26, chat 13's walk)
**What:** found by the walk of chat 13's job (D1785, the unreadable week's words — branch `claude/pr-sched-marks-3205d7`, evidence
`raptor-port/docs/handpass/2026-11-08-sched-marks.md`, walker W2's report `…/parts/2026-11-08-sched-marks-w2.md`), each older than that
job (the builder found the first three in the code, the walk saw them): (1) the desktop next-week preview draws a damaged next week as
the demo days, with no notice (`raptor-port/src/ui/peek.ts`); (2) print and the spreadsheet export of a damaged week give the demo
days, headed "WORKING DRAFT — NOT YET SIGNED" (`Shell.tsx`, `export.ts`, `printpdf.ts`); (3) deleting a person while the week is
damaged refuses in the AMBER note, "The week of 13/07/2026 can't be changed — the delete was not made" — not the grey "Blocked:" note
every other refusal of one change takes (D1667, D1668), nor D1785's words; (4) a week read-only because its records belong to another
week says it was "published by an older version"; (5) the Leave War lets a pending bid be placed, refused or deleted on a date in such a week with no words at all, while Approve and "send back" say "is on a locked week" (W2's S2 — the war's own record; its code untouched by that job). Nothing is lost in any of them — each draws or refuses, none saves. **To do:** (1),
(2) draw D1785's notice where the days would be, as Edit Schedule does; (3) the grey "Blocked:" note in D1785's words — put to him
first only if it needs words of its own; (4) its own reason; (5) the war says why, as its Approve does — put to him first, with its words. **Place:** Schedule and amendments, small — with the next job on saved
weeks, or the database step's read of saved data.


### [BOARDNAV-SCRUB-CLICK-TIMER] A day-dots test leans on a real 350 ms window (found 8 Nov 26, chat 5's wide run)
**What:** `raptor-port/src/ui/boardnav.test.tsx`, "dragging along the day dots runs through the week › the click after a scrub does not
snap back to where the drag started". After a drag along the board's day dots the browser fires a click naming the dot the finger went
down on; `src/ui/board.ts` eats that one click for 350 ms (`setTimeout(…, 350)`). The test releases, then dispatches the click in a
second `act` — on a crowded machine that gap passed 350 ms: in chat 5's run of 86 OIL, board and SANS files at once (8 Nov 26, branch
`claude/pr-oil-earn-ffbf07` with `main` at `4d5b3828a` merged in) the test took 3009 ms and the click moved the day back (expected 6,
got 2); alone it passed three times out of three. The code is untouched by that branch. The app is not wrong — a real click follows the
release within a few milliseconds. **To do:** make the test hold the window open while it clicks (a fake timer around the release and
the click), never widen the app's 350 ms. **Place:** Checks and tooling, small — with the next board-navigation change, or sooner if
GitHub's run trips on it.
**Built 8 Nov 26 on `claude/chat19-checks` (chat 19, not yet merged):** the test's clock stands still from the release to the
click (only `setTimeout` faked, restored in a `finally`); the app's 350 ms untouched. Red first: a real 400 ms wait put between
the release and the click failed it exactly as chat 5 saw (expected 6, got 2); with the fake clock it passed with the wait still
in; the wait then taken out — the file 41/41. Chats 11 and 13 asked first (D302): chat 11's work is merged and leaves the file
alone, chat 13 confirmed by message that its branch changes `board.ts` in three other places only (the unreadable-week notice, its import, the hidden warning's Reset arrow). Leaves for the archive once merged.

### [RD-LEFT-1108] React Doctor's 31 findings left in the app after the shell-and-state job (found 8 Nov 26)
**What:** after `claude/rd-shell-state` (evidence `raptor-port/docs/handpass/2026-11-08-rd-shell-state.md`), React Doctor 0.9.18 finds 31 in the app's own code
(not the rules engine, not tests). **(1) 13 import cycles**, every one through `raptor-port/src/state/people-settings-commit.ts`
(with `accounts.ts`, `roster-add.ts`, `noticeseen.ts`, `flyplan.ts`, and `command/actor.ts` → `auth.ts` → `perms.ts` →
`accounts.ts`). A cycle cannot be kept with a reason on a line, so it is broken or it stays counted. The app starts and every
test passes, so none reads a value before it is set today; the risk is a later import that does. **To do:** find which of
its functions each importer takes, and move those to a file with no app imports, as the save indicator's source was moved
to `ui/savestatus-source.ts` — a change to saved data's path, so its own check (tier WALK at least). **(2) 18 in files outside
that job:** `ui/UsersPanel.tsx` 3, `ui/AdminPage.tsx` 2, `ui/CutFields.tsx` 2, `ui/DateCal.tsx` 2, `ui/MedicalView.tsx` 2,
`ui/TypeLegend.tsx` 2, `ui/AccessScreen.tsx` 1, `ui/SansCal.tsx` 1, `ui/SansDay.tsx` 1, and `ui/interactions.ts` 2 (a list
lookup in a loop — a file of job 1's pull request 664, left alone that night). Each rides with its area's next batch (D490,
D1534). **Place:** the agent's, low — (1) with the next People and accounts change, (2) as listed.

### [BUGCHECK-LESSON-ORDER] The bug-check order's list of missed faults is out of order (found 7 Nov 26, the rules diet's step 3)
**What:** in `raptor-port/docs/bug-check-order.md` §7.11 the lessons run 1–6, 8, 7, 9–23, and a second lesson numbered 23
(every screen a walk pictures checked for the standing layout lessons — each pair of side-by-side boxes one height and one
line) stands after §8, outside §7.11. An agent going through §7.11 "for each lesson" (D1297) can miss that one; meanwhile
the checklist (`raptor-port/docs/bug-check-checklist.md`) names it "the second 23". **To do:** move the second 23 into
§7.11, whole (D138), and put 7's text before 8's; lessons are cited by number elsewhere (the backlog, evidence sheets,
briefs), so search for each number first and keep a number that is cited; then match the checklist's list. **Place:**
low, the agent's — with the rules diet's step 4 or the next change to the order.

### [DOCSIZE-PATHS-OPEN] A rules file whose `paths:` list is never closed passes the document check (found 8 Nov 26, the rules diet's step 5a, chat 17)
**What:** the People & accounts page's first draft lost the `---` line that closes its `paths:` list. With it open, the
file would not load by itself with the files it names, and `npm run docsize` and `backlog-archive.mjs --rulings` both
passed it — the check read the page as unscoped (the general page's shape), so the area-page checks (the "Settled" and
"From other areas" sections, statement sizes, no table rows) never ran on it. Found only by the account's helper reading
the file; fixed on the branch `claude/rules-diet-step-5a-people-1288c3` before the reads. **To do:** in
`raptor-port/scripts/docsize-rulings.mjs` (and the self-test, `docsize-selftest.mjs`), fail a rules file under
`.claude/rules/` that opens a frontmatter block (`---` on its first line) and never closes it, and fail a page whose
`paths:` list cannot be parsed; a self-test case for each. A script change — goes live on his "merge live" (D1407).
**Place:** medium, the agent's — before the next area converts (design, the Tracker), or with it.

### [QUALS-PINNED-HEAD-NO-DRAG] A heading in Quals' pinned row cannot start a column drag (the night of 6 Nov 26)
In Edit quals with the page scrolled down, a heading in the pinned row under the top bar cannot be pressed to start a column drag: the press listener is on the table alone. Scrolling up to the table's own heading row works. Older than the night's job (`raptor-port/docs/handpass/2026-11-06-people-quals.md`). **Place:** small, with the next Quals job.

### [QUALS-OUTLINE-RESCROLL] Quals' outline can pull the page back to its row (the night of 6 Nov 26, the code read)
Quals' outline after "Check his quals" or an Undo is never cleared, and runs after every repaint: a later change (ticking another man's box) with that row off screen may scroll the page back to it. Found by reading (`raptor-port/docs/handpass/parts/pq1106/read-opus.md`), not walked — one walk step would confirm it. **Place:** small, with the next Quals job.

### [INP-HEAD-SORT-READER] The Inputs List's headings sort from the keys but a screen reader is not told (the night of 6 Nov 26, read R3)
Since `claude/inputs-batch-1106` the desktop List's column headings sort from the keyboard (Tab, then Enter or Space) with the app's cyan ring; a screen reader is still not told a heading can be pressed. The proper fix is a button inside each heading, which changes how it is drawn — a picture first (D1625). **Place:** with the keyboard sweep (D807).

### [QUALS-HEAD-SORT-KEYS] The Quals table's headings sort by a click only (the night of 6 Nov 26)
Seen by job 2's builder: as the Inputs List's did before 6 Nov 26, the Quals table's headings sort only by a click; the keys cannot reach them. **Place:** with the keyboard sweep (D807), the Inputs List's fix as its pattern.

### [WALK-SCRIPT-UTF8] A walk script must be saved as UTF-8 (the night of 6 Nov 26)
A walk script written partly in another letter coding (Latin-1) made the code check of changed files stop with "could not compare". **To do:** one line in `raptor-port/docs/walk-scripts.md` (a working guide, so on his word). **Place:** with the next guide changes.

### [LW-PO-DAYS-DRAWING] What an input over a posted-out man's gone days looks like on the Leave War (the night of 6 Nov 26)
**The case:** Diesel is posted out from Tue 29 Dec. Saber drags Diesel's Mon 28 – Wed 30 Dec on the Leave War and presses OD. One OD covering 28–30 Dec is filed and shows on the Inputs page, but the war's row shows OD on the 28th and a bare "PO" on the 29th and 30th, so it reads as if two days were skipped. Leave placed on such days does show. **Recommended:** draw whatever is filed on such a day the way leave already is there — its box over the posting hatch, counting nobody. **Alternative:** the filing skips those days and says so in the window's note. **A drawing first** (D1625), then the build in the grid's row drawing. **Drawn 6 Nov 26** (a real build with the one test changed — `MatrixRows.tsx` `outLeave` taken to any filed entry: one OD bar across 28–30 Dec over the hatch, PO tags on the gone days): https://claude.ai/artifact/NjwCh2sTrR9eda245Aq1Vh — his answer waited. Pictures: `raptor-port/docs/img/handpass/2026-11-06-lw-faults/walk/s7-*`. **Place:** his to answer.

**LIVE 6 Nov 26 (pull request 646), with his D1722 and D1725: an admin's tap on a posted-out day that holds anything opens what it opens on any other day — the day's list below was the first build, replaced.** **BUILT 6 Nov 26** on `claude/lw-faults-1106` (his D1720): any filed entry draws over the hatch; an admin's tap opens the day's list; a man's own course or OD there keeps his bid window (F3). Walked at both sizes — evidence `raptor-port/docs/handpass/2026-11-06-lw-faults.md` §His D1720. Close once live.

### [LW-FULL-EDITING] Full editing on the Leave War (his D1724, 6 Nov 26)
**What:** every entry, whatever its kind and whoever filed it, can be moved, deleted and its days and remarks changed on the Leave War; a day of two or more entries opens the window that adds more, each entry on its own line with its own Move and Delete; the Inputs page's own rules hold. Brief: `raptor-port/docs/superpowers/plans/2026-11-06-lw-full-editing.md`. **Place:** after [LW-CELL-COMBOS] or beside it, in a fresh chat of its own; drawings first.

### [LW-DOUBLETAP-OTHER-WINDOWS] The double tap falls through the Leave War's other windows (the night of 6 Nov 26, read F1)
The guard built for the one-day and drag windows (`claude/lw-faults-1106`) does not cover the person window, ⚙ Settings, the event window, the counter form, the Events list, the Manning sheet, the OIL tracker and the event peek: a fast second tap after one closes still reaches the grid behind. **To do:** extend the same place-checked guard, tests first, walked on a phone. **Place:** the next Leave War batch.

### [LW-ROLLBACK-FOCUS] A refused war change puts back the jump-to-a-day state (the night of 6 Nov 26, read F5)
A refused change restores the war's records, and since 6 Nov 26 keeps the role and viewer; it still restores the fields that make the grid jump to a day, so the grid can jump back after one. Keeping them live could part them from the person in view, so it needs its own look. **Place:** the next Leave War batch.

### [LW-BIDPICKER-CSS-INSIDE] The bid sheet's style rules after its wrapper (the night of 6 Nov 26)
The 202 rules after the wrapper's close in the bid sheet's stylesheet (the counter form onward, since 19 Aug 26) are not deliberate — every war window draws inside the Leave War's page — and work only because their names are unique. **To do:** move them inside the wrapper as a walked job (their weight changes), lowering the guard's allowed count as they leave. **Place:** the next Leave War batch.

### [RULES-DIET] Cut what a chat must read before it touches code (D1718, 6 Nov 26; started now on Opus — D1732, 7 Nov 26)
**What:** chats fill up and hallucinate; measured 6 Nov 26, a job reads about 250,000 tokens of rules, notes and records before any code, with 1,302 live ruling lines. Each area's rulings become a short page of how it works now, the old rows archived but searched; the working rules and the bug-check order become one-page checklists; rules become automatic checks where they can. **Started 7 Nov 26 on Opus with high thinking (D1732, replacing D1718); the plan is read by Astra and a fresh Opus reader, each blind.** Needs his word on the rulings that keep every live ruling in the list and set no size targets. The brief, with the measurements: `raptor-port/docs/superpowers/plans/2026-11-06-rules-diet.md`. **Plan v1 drawn 7 Nov 26** on `claude/rules-diet-plan`: `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`, with two measured samples (`…-sample-how-we-work.md`, `…-sample-oil.md`) and the readers' brief `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-plan-read.md`; v2 folds in the fresh Opus reader's report (`…/briefs/2026-11-07-rules-diet-plan-read-opus.md`); v3 folds in Astra's blind read of v1 (`…/briefs/2026-11-07-rules-diet-plan-read-astra.md`, 7 Nov 26 on his PC), with the two reads compared in the plan's review log; **approved 7 Nov 26 as recommended — D1735 (the shape), D1736 (permission for the hooks and the document check), D1737 (every step on his "merge live"), D1738 (Astra beside the fresh Opus reader on the Inputs, scheduler and Leave War pages).** **Place:** now — step 1 (the checks and scripts) and step 2 (the cheap moves; the skill-notes short form and the shorter note on each message switched on, D1740) merged 7 Nov 26, pull requests 656 and 657; step 3 (reading by section) merged 7 Nov 26, pull request 658: the three reads 119,787 → 98,547 tokens (−18%), not the plan's ~29,000, since every section a step names stays a whole read (D1735) — the plan's §Step 3; step 4 (the every-chat layer) merged 8 Nov 26 by his "auto merge live" (D1750), pull requests 663 and 665: what every chat reads at its start 42,767 → 33,423 tokens (−22%); his answers on it recorded and merged 8 Nov 26, pull request 671 (D1760–D1762) — his question whether Sol 6.1 is worth adding as a third reader of the diet's reworded steps answered "keep two" (D1763), no third reader; step 5a (OIL first, the full trial) merged 8 Nov 26 on his "merge live", pull request 684 — the page and its account, the trial of the whole route and the two reads compared: the plan's §Step 5a; next, the rest of step 5 in its order (§7), each on his word; later, stating once what both the general page and a checklist state (D1762).
**Found in step 5a (8 Nov 26), not fixed:** D43's full row in `.claude/decisions-full/oil.md` stops mid-sentence ("it inherits the seat's") and has since it was first written — the page states D43 from its short line and D755; the lost words are not guessed at. **To do:** find them in the chat or commit that recorded D43 (22 Sep 26), or put the sentence to him. **Place:** with the next OIL work.

### [PAGE-FAULT-BLANKS-APP] A fault inside the Leave War or the Tracker still blanks the whole app (found 4 Nov 26, the Leave War small fixes)
**What:** since D1631 a failed DOWNLOAD of either page is caught on its own page, with Retry (`raptor-port/src/ui/pageload.tsx`); a fault in the page's own code while it draws is deliberately passed on, and with nothing above it to catch it the whole app goes blank, top bar included, as a failed download did before. Not seen happening; worked out from the code and pinned as passed on by `pageload.test.tsx`. **To do:** if wanted, a catch of its own with words that do not blame the signal ("Something went wrong opening the Leave War" — his to see first, D1625), and what it reports. **Place:** his to place; a look at the whole app's other pages with it.

### [TRK-KEPT-COPIES] The Tracker's own copies of the app's glyphs, pencil and colours (filed 5 Nov 26 — the Tracker tidy's read, L2)
**What:** three things the standalone Tracker carried for itself were kept on purpose by [TRK-STANDALONE-LEFTOVERS], since
merging them could move a pixel if a copy has drifted: the Tracker's own drawings of the app's glyphs and pencil
(`src/tracker/components/Glyphs.jsx`, `SrchGlyph.jsx`, held equal by `tracker.test.tsx`), and its own colour list for a page
with no `:root` (`trk-palette.test.ts`). Today they live only in `docs/tracker/known-gaps.md`. **To do:** draw each from the
app's one copy instead, with pictures of the Tracker before and after at a desktop and a phone size; nothing a person sees
should change. **Place:** low, the agent's — with the Tracker's next batch (D490). Evidence:
`raptor-port/docs/handpass/parts/trk1105/read-opus.md`.
**Built 8 Nov 26 (chat 20, `claude/chat20-tracker-small-batch`, PR #696):** the pencil, Reorder, gear, Reset and list
are the app's own icons; the page colours link to Raptor's tokens; pictures before (twice) and after, pixel-compared —
nothing a person can see changed (`raptor-port/docs/handpass/2026-11-08-chat20-tracker.md`). **Left:** the magnifier
(`SrchGlyph.jsx`) has drifted from the app's — its handle a fifth shorter — so matching it is a change he would see: put
to him with a picture (D1625). **His answer, 8 Nov 26 (D1900): match the app's** — draw the app's magnifier (`ui/icons.tsx`)
in place of `SrchGlyph.jsx`'s, checked by pictures before and after; archive this item once that is built and live.
**Place:** with [TRK-NOSTORE-SAVED]'s build, one job.

### [TRK-MARKS-LEFT] Typed marks left in Tracker words, and its Export / Import drawings (filed 8 Nov 26 — chat 20)
**What:** building D1860, more typed marks were found in words a message box or a hint carries, where the app cannot draw
its marks: the built-in syllabus delete's "you can bring it back later from ⇅ Reorder" (`core.js`, about line 6276),
the import's "Set them again in ⚙." (about 7292), and the "No details yet" hints with ☰ and ⓘ (about 234–236 and 4878);
a ✎ in help text stays (D1134). Separately, the Tracker's Export and Import drawings (its own, D1135) differ from the
download and upload marks Admin and the input window wear. **The case to put to him:** the same treatment as D1860 (the
words alone) for the four messages, and whether the Tracker's two marks should match Admin's — with pictures, in a
consistency-look round. Not asked yet (D994). **Place:** low, with the Tracker's next batch or the consistency look.

### [TRK-MENU-KEYS] The Tracker's menus under the keys (filed 8 Nov 26 — chat 20)
**What:** chat 20's walk pressed the Tracker's course, syllabus and File menus with the keyboard on a desktop: a row with
the keys on it wears the browser's own white rounded ring, not the app's cyan keyboard ring, and the down arrow does not
move to the next row — only Tab does. The board's ⋯ menus have both (D1646 the arrows, D1771 the cyan ring); D1706 gave
the Tracker's menus the board's look but said nothing of the keys. Not caused by chat 20's change (the menus' code was not
touched). Pictures: `raptor-port/docs/img/handpass/2026-11-08-chat20-tracker/walk/s4-desktop-*-keyboard-crop.png`.
**The case to put to him:** the same keys and ring as the board's menus, with a picture. Not asked yet (D994).
**Place:** low, with the Tracker's next batch or the consistency look.

### [TRK-COPIES-TIDY] The code reads' tidiness notes on the Tracker's copies taken back (D489 — filed, not fixed; 8 Nov 26 — chat 20)
**What:** the fresh Opus read of [TRK-KEPT-COPIES] (`raptor-port/docs/superpowers/briefs/2026-11-08-chat20-tracker-read-opus.md`,
its tidiness note; Astra had none): (1) `tracker.css`'s `#ordList .ordrow.dragging` keeps a fallback that repeats
Raptor's `--lift-box` value for value — the sheet's last copy; dropping it changes nothing on screen; (2)
`src/ui/icons-markup.test.tsx`'s recording switch (`PRINT_ICON_MARKUP`) makes its six checks pass without comparing —
a separate script, or the checks marked skipped while it is set; (3) `ListIcon` (`ui/icons.tsx`) still writes its own
`<svg>` — a `LIST_INNER` drawn through `Drawn` would make it one source (its recorded markup then re-recorded), and the
Tracker's own wrapper `G` (`components/Glyphs.jsx`) repeats `Drawn`'s attributes; the `shapes()` test helper is
written twice (`onepencil.test.ts`, `tracker.test.tsx`, older); (4) comments now overstated: `Glyphs.jsx`'s header
("the marks only the Tracker wears" — Export, Import and the magnifier are the app's marks too, drawn differently),
`tracker.css`'s palette block's last line ("the copy here kept…" → "the copy that stood here…"), `ui/pen.ts`'s
"Sized by `.pen-ic`" (true of the app's pencil only), and, older, `tracker.css`'s header "The ONE rule outside the
wrapper is #detailBubble". **(4) DONE 8 Nov 26 (chat 28, `claude/chat28-not-kept`)** — the four comments corrected,
`Glyphs.jsx`'s header naming the magnifier among the app's own marks (D1900); (1)–(3) stay open: each reworks a
test's recording or an icon's drawing, more than a band's branch should carry after its walk. **Place:** low — with the Tracker's next batch ([TRK-MARKS-LEFT], the magnifier's answer) or
the tidiness audit ([CODE-TIDY-AUDIT]).

### [TRK-NOSTORE-SAVED] "● saved" in a browser that keeps nothing (filed 5 Nov 26 — seen in passing by the Tracker tidy's check)
**What:** in a browser that refuses storage (a private or locked-down browser), the Tracker's corner says "● saved" and the
top bar says nothing, yet nothing survives a reload: mark an event, reload, and the mark is gone. Older — the same before
the tidy. **The case to put to him:** a line telling the person "This browser won't keep your work after a reload" (or the
app's failed-save band, D587). New words on screen, so a mock-up first (D1625). **His answer, 5 Nov 26 (D1660): drawn with the Tracker's next batch, not now.**
**Drawn 8 Nov 26 (chat 20's questions page, https://claude.ai/artifact/RL8hZp77xYhRYcBS1a8cay; `raptor-port/docs/mock/2026-11-08-chat20-tracker-questions.html`) —
his answer the same day (D1901): option A.** **To build:** a band under the top bar on every page while the browser refuses
storage — the drawn warning sign, **Not kept**, "this browser loses your work on a reload", no Retry, the "Not saved"
strip's look (D1655), the page moved down under it as that band does (D587, D1657 for the screens without the top bar to
weigh); the Tracker's corner empty while it is up. It touches the storage boot (how the app knows storage is refused),
every page's top, and the Tracker's corner — a bug check of its own (saved data: the tier's question 3). **Place:** the
next Tracker / app job, with D1900's magnifier, one branch. Evidence:
`raptor-port/docs/handpass/2026-11-05-tracker-tidy.md`.

### [DB-SECURITY-ROLES] The database's security roles, designed for the IT side (D1653, 5 Nov 26)
**8 Nov 26 — the IT side's answers 3, 8, 9 (`[IT-QUESTIONS]`):** database-level rights are the PP CoE's — one user security group gives basic access, and who may do what is the app's own roles, controlled inside the app. So (1)–(3) below are not ours to set; put to him 8 Nov 26 (the day lock is settled: D1751).
**What:** at the database step (D473) the agent writes the security-role design from `raptor-port/docs/data-model.md` §11
(26 tables × admin, member, guest, pending): (1) each table's create / read / change / delete per role, at none, own rows or
all rows; (2) row ownership — the app sets a person's account as owner of his rows when it makes them (his Person and
QualMark rows, his inputs), so "his own row only" holds in the database; (3) column-level protection for the columns a member
may not change on his own row (the callsign, Management, Scheduler — D218, D1510, D1651); (4) every rule a role cannot hold
(a published day changes only by amendment, the day lock, the commit gate's checks) with what stands in for it, the platform
having no server-side code today (`docs/handover-dataverse.md`), and the risk left. Read by a fresh reader and a security
reader (D1411). **Joining:** the admin's one choice, member or admin, puts the person into a group ("TALON members" /
"TALON admins") that carries the role — no per-person ticking. **For the IT side:** whether the admin accounts may add people
to those groups from the app (a role-assigning permission granted once) or IT does it per joiner; and the one squadron group
that lets an account into the environment at all. **Then:** IT enters the roles (by hand or as one package, an hour or two);
the kit's test with a second, member-only account (the move plan's point 35). The agent's reading of Dataverse, to check in
the hosting trial ([M365-HOSTING-TRIAL]) and with the IT side. **Place:** the database step.
**The day lock without a plug-in (the agent's reading, 5 Nov 26, to check in the hosting trial):** `data-model.md` §3 ScheduleDay's lock rests on ownership plus one plug-in and SYSTEM Custom APIs. Without them: ownership and the free team stay as designed (a non-holder's save refused by the database itself); schedulers get Assign at User depth only; every change of holder (take a free or idle day, a take-over asked or forced) goes through an instant Power Automate flow the app starts, run under a service account IT sets up, which checks the rules first — idle read from the row's own `modifiedon`, the server's clock — and then reassigns; a code app can call a flow directly (since about April 2026, a community source). Left soft, in the app only: one person's two tabs (the database cannot tell them apart). For IT: may a flow run as a service account and reassign rows; does it need a premium connector.

### [TRK-STANDALONE-LEFTOVERS] The code kept only for a standalone Tracker (D1538, 31 Oct 26)
**Built and checked 5 Nov 26** on `claude/tracker-standalone-tidy` (pull request 637): the bare `ocu:` path and the bar's own
Undo / Redo pair with its `hosted` flag removed; the roster prompt and `role.js`/`people.js`'s shape kept with their reasons;
FULL check — 206 PASS, 0 FAIL, a fresh Opus read 0 high. Evidence `raptor-port/docs/handpass/2026-11-05-tracker-tidy.md`.
What it kept on purpose: [TRK-KEPT-COPIES]. Archive once live.
**What:** since D1538 the Tracker will never be exported back out as its own app, so the code that exists only for a standalone
Tracker is no longer needed: `+ Add` falling back to the bare "Student callsign:" prompt when no roster is handed over
(`components/Modals.jsx`, the one `people.length` branch), the bare `ocu:` localStorage path in `src/tracker/storage.js` used when no
storage target is plugged in (also the path of tests that never boot the app — check them first), `role.js`'s and `people.js`'s
no-import shape kept so the Tracker could leave without Raptor, and the "a standalone export must carry …" notes in
`docs/tracker/known-gaps.md`. **To do:** list each, say whether anything still uses it (a test, the smoke suite
`scripts/tracker/smoke.mjs`, the boot), and remove or simplify it with its tests; nothing a person sees changes. **Place:** with
the Tracker's next batch (D490) — not inside [REACT-DOCTOR-CLEANUP].

### [AIRCRAFT-TYPE-SETTING] Each deployment set to its aircraft type by a setting (D1536, 31 Oct 26)
**8 Nov 26 — the IT side's answer 7 (`[IT-QUESTIONS]`):** the PP CoE has one production environment for code apps, so a database per aircraft type cannot be three environments today; put to him the same day (D1101).
**What:** one code base serves every aircraft type (D1100, D1101); each deployment — F-15, F-16, F-35, each with its own
database — is set to its type by a setting, not by changing code. Today the app names the type in a few places as the bare
"F-15" (D63); the setting would supply it, and anything else that differs by type. Built at the database step or hand-over,
not now; the plan's point 2 (`raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md`). What the setting holds, and
who may change it, is put to him at that build.

### [M365-HOSTING-TRIAL] The app on his own M365 with no database — a hosting trial (D1532, 31 Oct 26)
**What:** at a good stopping point in the Tracker's work (the agent proposes it, he agrees first), the app is put on his own
M365 subscription as a Power Apps code app that still saves in the browser as today — no Dataverse — so he can test it
there himself: Microsoft's sign-in, his iPhone, the Power Apps player. About 1–2 days. Covers the move plan's points that
add Microsoft's Power Apps add-on to the app and replace the sign-in card with Microsoft's
(`raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md`). **Before he buys anything:** confirm his plan includes
Power Apps (a Microsoft 365 Business plan with a work or school account; a Family or Personal plan does not). Only the app's
made-up demo data goes there. The database step stays at the end (D473).

### [M365-MOVE-PLAN] The M365 move plan — his strikes owed (written 31 Oct 26, D1530, D1531)
Every point of the SWiFT build-and-deploy kit set against Raptor, numbered in the recommended order, with React Doctor's
count: `raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md`. Waiting on him: the points he strikes, the
his-call points, and whether new code follows the code check's rules. Nothing on it is built until he says so; the kit's
red flags, its Vercel rule and its private-project rule are set aside (D1530).

### [LW-PINCH-FROZEN-WEBKIT-OFF] Leave War, WebKit only: the frozen date row read off its columns mid-pinch in (found 31 Oct 26, the pinch fixes' second re-walk)
**What:** in Safari's engine (WebKit in the test browser, touches made inside the page), 45% down the grid with the dates frozen under the top bar, a pinch in read mid-gesture puts each day heading of the frozen row about 360 px right of the grid's own heading for that day (`scripts/handpass/pinch1031-walk.mjs` L6, the reading "the frozen date row over its columns" — added 31 Oct 26); Chrome lines up; after the lift both line up; origin/main's build reads the same in WebKit, so it is older than the pinch fixes. Not yet looked at as a picture: it may be how WebKit reports a box under a paused scroll-driven animation (the frozen row's follow is paused while pinching) rather than what it draws. Pictures `raptor-port/docs/img/handpass/2026-10-31-pinch-fixes/after-fix2/webkit/L6-mid.png`. Also once in the round-3 re-walk (not repeated in two re-runs): Quals scrolled sideways, a pinch in, the frozen headings read 47 px off mid-pinch in WebKit (`after-fix3/webkit/Q5-mid.png`) — likely the same reading. **To do:** the picture first (do the dates over the grid's columns match, mid-pinch?); if they do not, the frozen row's follow while pinching in WebKit; his iPhone look decides. **Place:** with the next Leave War pinch job.


### [MULTI-SQN-DESIGN] One app, one database, many squadrons (his D1695, 5 Nov 26)
**8 Nov 26 — the IT side's answer 8 (`[IT-QUESTIONS]`):** manage it by app role — a column naming the squadron and the app's own rules stopping one squadron editing another's; database-level rights are the PP CoE's. The design uses the app's roles, not business units (`data-model.md` §Squadrons).
**What:** his direction, the design open ("I'm not sure how should we design it"): each person's home squadron set when his account is made (Admin → Users); rights to view other squadrons read only; a permanent transfer on posting out (the Post out sheet's greyed "Transfer to Sqn" — D281); a day planned half in one squadron, half in another (D282, D1100 — a man lent). **Steps:** (1) the agent drafts the design — the person and his one day shared, each schedule a squadron's; crew rest and warnings read across both; who sees what — with pictures on the real app, put to him in rounds; (2) the table format for the IT side gains the squadron on each record and the security split (business units, roles — the IT side's to set up); (3) built at or after the database step (D473). Platform: doable on Dataverse (D1551). **Place:** a fresh chat of its own, before the database step.

### [NOTICE-UNDO-RETRACT] Undo retracts every bell line (his D1693, 5 Nov 26)
**What:** today only the Leave War's lines do this (D1216 — `leavewar/sync.ts warNoticesReversed`, the `lw.notice` follow-up); an input's line simply goes with its change's Undo even when read (`state/sched-commit.ts tellPass`, the one-rule plan's R11), the holiday's OIL line likewise, and the posting line stays after the posting sheet's Undo post out (`sync.ts undoPostOut` — a command of its own, not an Undo step). **Steps:** (1) the posting line: Undo post out retracts its line — unread goes, read gets "Ranger · Mon 16 Nov / Posting out taken back · Saber" (the worked-out "off the manpower" line too, read or not); (2) the input lines and the holiday line, by the same follow-up as the war's; the words of each "taken back" line drawn for him first (D1625); tests; a WALK check. **Place:** (1) with [PO-SANS-PUCK-EDGE] on `claude/postout-bell-look`; (2) its own job after, his to place.
**Step 1 LIVE 5 Nov 26** (his "merge live", pull request 641): Undo post out takes back the posting's lines, struck through (D1699), and a change of a posting that ran does the same (D1710) — evidence `raptor-port/docs/handpass/2026-11-05-taken-back-sans.md`, the register `raptor-port/docs/notifications-register.md` §Undo retracts every line. **Step 2 is what stays open.**

### [REVIEW-LAYERS] The review layers he approved (27 Oct 26 — D1407–D1411)
**What:** the Claude Code team's review layers (Anthropic, 15 Oct 26) set against Raptor's, put to him on the page
https://claude.ai/artifact/5n9NqPAM5YywqFZhKDqiG8; his answer "All as recommended". **Steps, in order:** (1) the
scorecard (D1409): a script counting, per two weeks, his finds after a change went live, changes undone or redone within
two weeks, and merges — the first run is the baseline, before anything else here changes how work merges; (2) the
standing brief every code reader is given (the agent's own call, the pattern of Anthropic's REVIEW.md): what is
important here (OIL, a published record, saved data, permissions), what to skip (demo data D56, docs, style), at most
five small notes, a file and line for every claim, the summary opening with a count — and three loop rules written into
the bug-check order (after the first pass a reader reads only what changed; a fault is named by its kind so every copy is
fixed; a finding already raised is never repeated) — a guide change, read before he approves it (D70); (3) notes-only
pull requests merging by themselves (D1407): a check that lists the files and allows the merge only when every one is a
note, running `npm run rulecheck`, the unit tests that read documents and the secrets scan on it (the gates skip notes), and the session-handoff skill's merge wording brought level with D1407 (a guide change, read before he approves it, D70 — until then shipping.md's newer rule wins, D90); (4) the secrets scan on every pull request, in a workflow with no skip list so notes-only ones are scanned too, and one scan of the whole history (D1408); (5) the security read on
sign-in and permissions changes (D1411) in the bug-check order's tiers and the reader's brief, and the full security
review placed before the database step; (6) the reader's test set from §7.11's six faults (D1410), the reader scored on
it once; (7) the way back: putting the previous live version back on Vercel, checked on his plan, written for him (the page's improvement 7 — not one of his five rulings; the agent's own step, as is its "circuit breaker", which is not built without his word).
**For the full security review, from M4's security read (27 Oct 26 — `raptor-port/docs/handpass/parts/lw-m4/security-read.md` §Lower):** (a) older than M4 — on an open day of his own row a member's command may write a war record of ANY kind, an OIL credit (`{kind:'credit', code:'FO', oil:'auto'}`) among them, and the war adds such credits up (`dayview.ts earnsOil`); whether the schedule's credit pass rewrites a forged one was not confirmed; (b) one admin can write another admin's Approvals marker (`apprseen:`), the same pattern as the `reqseen:` row — no fix, a note; (c) a member's notice text is never compared with what his change did (a line about his own input that misdescribes it) — the war's line kinds are refused since M4.
**For the full security review, from the Inputs batch's fix-round read (3 Nov 26 — [INPUTS-FIXES-1103], `raptor-port/docs/handpass/2026-11-03-inputs-batch-check.md` §13):** a member's new input counts as a piece of a record his same command changed when it carries that record's filer and filing time (`state/perms.ts inputBreach`), and a piece carries the record's scheduler marks; so a hand-made new input that copies them can wear a LATE drop or a cancel it was never given. Every record the app makes is held; the server should know a piece's lineage itself, not read it from those two fields.
**For the full security review, from the security read of React Doctor on the shell and the state (8 Nov 26 —
`raptor-port/docs/handpass/parts/rss1108/read-security.md`, both "before this change"):** (a) for any man whose posting the
pass marks done, the posting pass may change his existing account row in every field but its person, role and name, or
delete it, whatever the outcome — SANS and a posting with no outcome included, neither of which writes an account row
(`state/perms.ts postingPassViolation`, the account branch); only the app's own `lw.postoutRun` reaches it, so it is the
database rule's to narrow ([SERVER-SIDE-PASSES]); (b) the medical document's PDF frame (`ui/DocViewer.tsx`) is not
sandboxed — true and safe today (filing takes only PDFs and pictures, and the frame shows the browser's own copy); once
documents come from a shared store, the type the frame is served must be pinned to the kind stored.
**For the full security review, from the posting-out bell line's reads (5 Nov 26 — `raptor-port/docs/handpass/parts/pb1105/read-security.md` 1 fix 2, 2; `read-fixes.md` 1, 2):** the posting pass's gate (`state/perms.ts postingPassViolation`) asks its people, settings, posting and notice rows but not its schedule, input or planning rows — allow those only where the pass deletes (exempting the id housekeeping's own `rid`/`iid`/`ord`-only changes, or a real pass is refused), and a line's `at` and unknown keys; and a stray schedule change in memory is taken in by the pass, not put back (`revertUnsavedSched`, the roster's twin). The browser route is closed by the pass's resync; these are the database rule's.
After four weeks, the scorecard against the baseline. **Place:** after the iPhone keyboard fault (D1366) and M4 (D1404)
unless he says otherwise; Opus 5.5, high effort; a fresh chat.
**Steps (1) and (4) BUILT the night of 31 Oct 26 on `claude/secrets-scan-scorecard`** (not merged; evidence
`raptor-port/docs/handpass/2026-10-31-secrets-scorecard.md`). (1) `raptor-port/scripts/scorecard.mjs`; the baseline,
scorecard 1, `raptor-port/docs/superpowers/plans/2026-10-31-scorecard-1.md` (18–31 Oct: 17 of his finds not said to be on a
preview, 1 change redone, 61 merges); the next is due 14 Nov 26 (D1409 — the agent's standing job). (4)
`.github/workflows/secrets-scan.yml` + its self-test `raptor-port/scripts/secrets-scan-selftest.mjs` + `.gitleaksignore`;
how it works and how to read a red run: `raptor-port/docs/gates-and-deploy.md` §Now (D1408). **Owed before it counts as
proven:** its first run on GitHub (the self-test with the real gitleaks, and the whole-history scan, which runs on that
same pull request) — read its summary, triage each history finding as that section says. **Both settings below DONE by him, 31 Oct 26** (D1535, D1540 — read back: GitHub's own scanning and push protection on; the ruleset "main: secrets scan" active, no bypass, requiring `secrets scan`; `raptor-port/docs/gates-and-deploy.md` §Now). The steps as they were put to him: **His to approve, never done by
the agent (repository settings — read only on 31 Oct 26, before he switched them on: GitHub's own secret scanning and push protection OFF, `main`
unprotected, no rulesets):** (a) make `secrets scan` a required check — GitHub → the repository → Settings → Rules →
Rulesets → New ruleset → New branch ruleset; name "main"; Enforcement: Active; Target branches: Add target → Include
default branch; tick "Require status checks to pass", Add checks → type `secrets scan` → pick it (source GitHub Actions;
it is listed only once it has run once); no other rule; Create. Only that check, never a `deploy.yml` leg (a path filter
skips those on a notes-only pull request, which could then never merge); an admin is held by it too unless put on its
bypass list. (b) switch on GitHub's own scanning, free on a public repository — Settings → "Code security" (GitHub
has also called the page "Advanced Security"; the agent did not open it) → Secret scanning (or "Secret Protection"):
Enable, then Push protection: Enable; it refuses a push carrying a known provider's key before it lands, which
the check above cannot (it sees the key only once pushed). Recommended: both.

### [SINGLE-SEAT] Single-seat jets — the app works with only the front seat filled (his intent, 21 Oct 26 — D1099)
**What:** a flying line with only its FCP filled must work as fully as a two-seat line — every check, mark, count and page — for F-16 squadrons (mixed fleet) and F-35 squadrons (all single-seat); an admin switch to hide the RCP is his idea, not designed. **Steps:** (1) the check — every place that reads the back seat and what it does with only the front seat filled, in the code and on screen, written up for him with the design questions (nothing in the app changes); (2) his answers, in rounds of four with pictures; (3) the build, on his word. **Design note:** `raptor-port/docs/superpowers/specs/2026-10-21-single-seat.md`. **Step 1 done (the night of 21 Oct 26):** `raptor-port/docs/superpowers/specs/2026-10-21-single-seat-check.md` — 44 places; three rules wrong for a real single-seat jet (AAR training, an IRT in one jet's remarks, OCU solo); the app cannot tell single-seat from a back seat not yet filled; 8 questions for him with marked pictures — put to him when he says (D994).

### [KBS-LW-SHEETS] The Leave War's sheets and the keys — the same jump-then-slide class? (named under D852, 27 Oct 26)

The Leave War's sheets and bid windows place themselves at the pan's word (`raptor-port/src/leavewar/ui/Sheet.tsx useKeyboardInset`: their
top set to the visible top and their height capped, at once, followed frame by frame for 900 ms). On his iPhone the numbers come final at
once, so by the keyboard job's reading (`raptor-port/docs/handpass/2026-10-27-kbs-carried.md`) the sheet jumps to its final place and then
slides with the page — the class D1412 forbids. Not seen by him and not recorded; **to do only if he sees it:** the same design as the
windows (the phone carries the sheet; its body scrolls a covered box), drawn for him first (D852), its own tests and walk.

### [LOGIN-NOT-AT-TOP] After signing in the page does not open at its top (his report, 26 Oct 26)

**His words:** *"Why everytime I login I don't see the top of the page?"* — picture `raptor-port/docs/img/handpass/2026-10-25-lw-m3-build/owner/2026-10-26-login-not-top.png`: Edit Schedule on his iPhone, opened with the day's heading and sign-off scrolled under the top bar, "4 changes" the first thing in view. **To do:** reproduce at his iPhone's size, find the cause, fix red-first, walk it; a bug report, so the bug-check order fires.

### [LOGIN-OPENS-TODAY] Signing in opens on today's date — before testing (his D1383, 26 Oct 26)

**His ruling:** D1383. Not now — the demo data is what is worked on; due before the app is put out for testing.

### [LOAD-MOVES-ROW-DAY] A load of one day can move a course's row onto another published day (found 26 Oct 26 — [LW-LOAD-RELAND-RID]'s code read, F3)

**Found** by the fresh Opus code read of [LW-LOAD-RELAND-RID] (reproduced in a unit probe), older than that change. **To reproduce:** a course Wed 15 – Fri 17 Jul under Unavailable; Wednesday and Thursday published; on **Thursday** Reject, then → Ground (its row on Thursday); load Thursday's Original. **What happens:** the version holds no row for it, so the load's reconcile takes it off the programme; it covers other days, so the load cannot put its filing back; the working-out then lands it again on its START day — Wednesday, a published day the load was never meant to change (AM1, D175) — and the load's note said it was "off Wednesday and Friday too" (that sentence is now true to the state after the working-out, [LW-LOAD-RELAND-RID]'s F2 fix, so it no longer says "off"). **What it costs:** Wednesday gains a pending change no one made there. **A question for him (D994 — not put until he says):** when a day's load cannot put a several-day course back as published, should the course (a) stay on that day's programme as it is (the load leaves it), (b) go back under Unavailable on every day it covers (the load says so, as an overseas duty's does), or (c) be parked as rejected (Personal Inputs) — with pictures of each. Recommended: (b), as the overseas duty already behaves.

### [SCHED-UNAV-PENDING-MARK] No pending mark on an Unavailable row of a published day (found 25 Oct 26, W2 15)

On a published day, an input filed under Unavailable — a leave filed after publishing (D177), and now an Other's Goes to, a
"→ Unavail" — reads "1 pending" on the day and in the changes window, but its row on the Unavailable list wears no mark,
where a Ground Programme row's name is underlined as waiting (pictures `…/w2/e-15-1-ground-edit.png` beside
`…/w2/e-15-2-unavail-edit.png`). The Unavailable list is drawn from the inputs, not from the schedule's rows, so no mark ever
reached it. Older than the M3 build; to put to him whether its rows should wear the mark.
**Drawn 7–8 Nov 26; answered 8 Nov 26, "All as recommended" (D1784) — to build by `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`** — the pictures round's page https://claude.ai/artifact/WYuwD2itLGrt7e2Y1bLReJ, question "A waiting mark on Unavailable" (pictures, notes and script: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/`).

### [LW-NIGHT1025-OLDER] Older faults the night's walk met in passing (25 Oct 26) — none caused by its builds
Found by the walkers of `raptor-port/docs/handpass/2026-10-25-lw-night.md` (reports `parts/lw-night/w1.md`, `w2.md`, with steps and pictures). (a) **Words go to the wrong bid** (w2 INC-1): on a day holding a pending morning bid with words, the one-day window opens with those words in its Remarks box; PM pressed, words typed, OL placed — the words land on the morning bid ("Am" became "AmPm") and the new afternoon bid has none. Code going forward, so not D56's: a fault to fix, tests first (`BidPicker.tsx`'s held request's words against the new bid's). (b) **Two tabs** (w2 FAIL 4): a window left open in a second tab saves onto a leave deleted in the first and writes it back, silently — the war carries no change across tabs; with the database step ([GLOBAL-UNDO]'s multi-user leftovers). Met again 5 Nov 26 (the take-back code read, `docs/handpass/parts/tb1105/read-code.md` 4): the posting sheet's Undo post out pressed in a tab opened before the posting ran works from that tab's old copy of the bell and its read records, so the posting's line can stand. (c) **A posted-out man's gone days** (w1 S9): a drag fill writes pending bids on them; an OD over them files the first day and skips the rest with no note. (d) **A double tap on a leave button** (w1 S21): the second tap falls through to the grid behind the closed window (a CAT pop-up, the man's figures). (e) **As built, the agent's reading:** on the closed-day window, words typed then Delete — the first Undo brings the bid back with the typed words, each save its own Undo step (w2 FAIL 3); on a phone a second touch on "Show ›" stops the page's smooth scroll part-way (the browser's own). (f) **A refused war command puts the war's role and viewer back to the last saved state** (the last narrow read, its reading 1 — `parts/lw-night/read-fixes-2.md`): `setRole` / `setViewer` do not move the baseline a rollback restores, so an admin who switched to the member view and then made a refused change would see an admin's controls under a member badge; its fix is worded there (keep role and viewer on a restore); not walked. (g) **On a phone the bubble's foot note lies under a resting day panel** (z-index 55 against 410) — read from the stylesheets, not seen. **Place:** (a) with the next Leave War batch, first; (c), (d), (f), (g) with it; (b) the database step.
**LIVE 6 Nov 26 on his "merge live" (pull request 646): (d), (f), and (c) as his D1720 and D1722 — only (b) is left.** **The night of 6 Nov 26** (`claude/lw-faults-1106`, evidence `raptor-port/docs/handpass/2026-11-06-lw-faults.md`): (d) BUILT — a tap or double click within 32 px of the press that closed a one-day or drag window is swallowed for 600 ms; (f) BUILT — a refused war change keeps the role and viewer. (c) is not a store fault: the drag fill writes pending bids as D1541 says, and the OD is filed whole — the grid draws "PO" over it; its drawing is [LW-PO-DAYS-DRAWING]. (a) and (g) were already fixed on `main`. Close this item once that branch is live, leaving (b).

### [UI-CONSISTENCY-LOOK] The whole app looked over for the same thing drawn differently (his D1124, 21 Oct 26)
**Round 5, the Inputs calendar's ⤢ / ⤡ (D1792 (b)) — BUILT 8 Nov 26 (chat 7)** on `claude/pr-inputs-add-right-5b2653` (pull
request 676): arrows out at rest, arrows in pressed, drawn at 16px; its words and pressed look unchanged; checked beside the
drawings `q-r5b-*-drawn.png` (`raptor-port/docs/handpass/2026-11-08-chat7-inputs.md`). Round 5's other marks belong to their
own chats.
**His words** (after D1123): *"can u check elsewhere on the app that have these inconsistensies"* — *"Desktop and phone"*. **To do:** picture every page's and window's top rows at a desktop and his iPhone's size — Edit Schedule, View-only Sched, the Scheduler Board, the Inputs / SANS / Medical tabs, Quals, Logic, the Leave War, the Tracker, Help, Admin, the Calendar window and the app's calendars, the floating windows — and measure what should match (a month's name and its arrows, Today, tabs, a gear, a title bar, button heights); each mismatch put to him with its picture marked and a recommended way to match, in rounds of at most four (the design guide's rule 7); nothing changed before his answer. A difference his rulings made on purpose is named as such. **Place:** the look's pictures and findings with the evidence sheet of `claude/board-side-width` (`raptor-port/docs/handpass/2026-10-21-board-side-width.md` §7d). **The sweep (21 Oct 26, `raptor-port/scripts/handpass/bsw-consistency.mjs`, 13 screens at 1536 × 864 and 402 × 874, pictures `raptor-port/docs/img/handpass/2026-10-21-board-side-width/look1/sweep/`) found 12.** **Round 1, put to him 21 Oct 26** (the page https://claude.ai/artifact/PftDJpeNxNvqxWsJPmAkFC, drawn by `bsw-consistency-look.mjs`): (1) the Inputs and SANS top rows ([INPUTS-SANS-HEAD-SAME]); (2) Edit Schedule's top bar on two lines at 1500–1550 wide, his PC's 1536 among them (its changes clock; the laptop rule in `02-shell.css` stops at 1499) — recommended: that rule up to 1599 on every page; (3) search boxes four ways (the week's line magnifier; an emoji magnifier on the board, Quals, Logic; none on Admin, Inputs; the Tracker's with a separate ✕) — recommended: the week's everywhere; (4) Quals' "Enable editing" (blue) / "Save changes" (plain) against Logic's "✎ Edit" (plain) / "Done" (blue) — recommended: Logic's pair on both (Quals keeps each change as made; its button only ends editing). **Rounds 2 and 3, not yet put to him (their pictures are in `sweep/`):** (5) the highlight button three ways — boxed icon on the board, a bare icon on the week, "Highlight" with a word on SANS; (6) the labels before fields — small spaced capitals on the Leave War and Quals ("PERIOD", "STAGE", "VIEWING"), ordinary grey words on the Tracker ("Crew", "Course", "Syllabus"); (7) the Medical tab's controls inside a bordered panel, and "+ Medical" at its right end where the Inputs list's "+ Input" stands at the left of a second row; (8) page titles — Help and Admin a large title, Logic its name on its row (approved, D928 — name it as such), the rest none; (9) the tool rows' button heights — the schedule pages 28–30, Quals and Logic 36, Inputs 44, the Tracker 22–30 (a size change is his word, D487); (10) the gear's colour — the Leave War's cyan, the others white; (11) the Tracker's emoji icons (map, magnifier, ⇪, ⓘ, ^) and its separate-box view buttons, against the app's line icons and joined tabs; (12) the legends — a fold on the schedule, a button on the Leave War and the Tracker, a key in the row on Inputs and SANS (the Leave War's "Legend" pop-out is settled — name it as such); (13, found building round 1) the Scheduler Board's own bar keeps "Undo" / "Redo" in words at every desktop width while the top bar shows their arrows to 1599 (D1126); (14, found building round 1) while editing Quals, "Done" (blue, D1128) and "Edit quals" (blue at rest — his 5 Aug 26 rule) stand side by side, two bright-blue buttons — recommended: "Edit quals" plain until pressed, so Done is the one blue. (15, found building round 1) on the Inputs calendar at 1366 wide the row wraps and the gear stands alone on a second line (older; letting the filters narrow first held one line, but at 1280 put the gear under an open input window's corner, so it was taken back) — to draw for him with the window in the picture. **His answers to round 1 (21 Oct 26): all four as recommended — D1125–D1128, built on `claude/board-side-width` (the sheet §7e).** **The count, corrected 21 Oct 26:** eleven are left after round 1, not thirteen — (5)–(12) from the sweep and (13)–(15) found building. **Round 2, put to him 21 Oct 26 on `claude/consistency-round2`** (the page https://claude.ai/artifact/5VUi1FHQTvcHPBdxZvXWMU, drawn by `raptor-port/scripts/handpass/cr2-look.mjs`, pictures and page `raptor-port/docs/img/handpass/2026-10-21-consistency-round2/`; the page's questions 1–4 are findings 14, 13, 5, 11): Q1 (14) "Edit quals" plain until pressed, so Done is the one blue — it replaces his 5 Aug 26 rule for that button; Q2 (13, widened when pictured) the board's own bar writes "Undo", "Redo", "History" and "Sync · slow" where every top bar shows their icons to 1599 — recommended: the board's four follow D1126's rule (desktop only); Q3 (5) the highlight mark — found when pictured: the board's boxed button by its search folds nothing on a desktop (its fold, `.sb-hl`, is phone-only, `13-board-rows-responsive.css`), so a press there does nothing visible — recommended: on a desktop the board's mark leads its CAT / TYPE / QUALS row as the week's does and the dead button goes; the phone's toggles stay; SANS's "Highlight" stays (another job: one man, his callsign shown); Q4 (11) the Tracker's typed marks (✎ ⓘ ☰ ⇪ ^, the phone's 🗺 emoji) become the app's line icons, and the phone's three view tabs one joined box as the Inputs tabs (D919 is the pencil precedent). **His answers to round 2 (21 Oct 26): "1 yes, 2 yes, 3 yes, 4 yes" — D1129–D1132, built on `claude/consistency-round2`, pull request 563 (the sheet `raptor-port/docs/handpass/2026-10-21-consistency-round2.md`).** **Left for rounds 3 and 4:** (6), (7), (8), (9), (10), (12), (15) — and (16, found walking round 2's build, 21 Oct 26) the Tracker's other typed marks, outside D1132's list: the Students card's ✎ (rename) and × (remove) on each name and "⇅ Reorder", the items inside its ✎ and File menus (✎ Rename…, ⧉ Duplicate…, ⇅ Reorder…, 🗑 Delete… — an emoji on an iPhone — ⇪ Import…, ⤓ Export…) and the empty Tracker's "⇪ Import a file…" — recommended: the same line icons (`src/tracker/components/Glyphs.jsx`), pictured for him first (the evidence sheet §2) — the Leave War's (6 in part, 10, 12) last, after the Leave War overhaul's plan (its own chat, `claude/leave-war-overhaul`). **Round 3, first half, put to him 21 Oct 26 on `claude/sharp-spence-adf59e`** (the page https://claude.ai/artifact/UT34rbwMNC9Zs8M4vdYP24, drawn by `raptor-port/scripts/handpass/cr3-look.mjs`, pictures and page `raptor-port/docs/img/handpass/2026-10-21-consistency-round3/`; questions 1–4 are findings 16 (pencils), 16 (the Tracker's other marks), 6, 7): Q1 every typed ✎ / ✏ becomes the drawn pencil, tip bottom right — Quals' and Logic's "✎ Edit", the board's "✎ Manage templates", "✎ Manage plans" and each plan's ✎, a row's CX window "✎ Edit", a jet's stores list ✎, the Inputs list's "✎ Default window", the Inputs calendar note's ✏ (an emoji on an iPhone), the Tracker's Course and Syllabus menu items, "✎ Edit details" and Edit chart layout's "✎ Text"; kept typed: a ✎ inside a sentence of help text and after an edited chart's name in the Syllabus list (a drawing cannot go there); the Students card's pencils are already drawn; Q2 the Tracker's menu and Students-card marks (⇅ ⧉ ⇪ ⤓ × 🗑, the empty Tracker's "⇪ Import a file…") become line icons; Q3 the Tracker's "Crew", "Course", "Syllabus" labels take Quals' small spaced capitals (desktop only — the phone shows none); Q4 "+ Medical" stands first, at the left, as "+ Input" (D729 — it changes D965's place for it), the Medical tab's outer frame goes, and the Inputs list's dates button's 📅 emoji becomes the line calendar. **Round 3's second half, after his answers:** (8) the page titles and (9) the tool rows' button heights (the desktop Inputs list's "+ Input" and dates button are 44 tall where the rest of the Inputs page is 36). **(17, found picturing round 3, 21 Oct 26)** the Scheduler Board's "⇅ Sort all" and "▤ Templates" and the Leave War's "⇅ Rearrange" and "◷ OIL tracker" are typed marks too — for round 4 with the Leave War's items. **Seen, not a consistency item:** the Tracker Students card's rename ✎ and remove × are not buttons (no keyboard reach) — left as they were by the build (a keyboard job, not a look). **His answers to round 3's first four (21 Oct 26):** to Q1 a picture of the typed ✎ as his PC draws it and "i like this pencil better" — D1134, every pencil his solid one, drawn by the app; "the rest yes" — D1135–D1137; built on `claude/sharp-spence-adf59e`, pull request 564 (the sheet `raptor-port/docs/handpass/2026-10-21-consistency-round3.md`). **(18, found building round 3, 21 Oct 26)** the Tracker's Info panel ("⧉ Copy to…", a lull's ×) and Edit chart layout's tools (✋ — an emoji on an iPhone — ▣, →, 🗑, ╱, ❐) keep typed marks — for round 4 with (17). **Round 3, second half, put to him 21 Oct 26** (the same page, version 2, questions 5–7; pictures by `cr3-look.mjs` q5–q7): Q5 (8) Help's and Admin's large titles take Logic's size and weight (D928's name), the pages without one left; Q6 (9) the desktop Inputs list's "+ Input" and dates button 44 → 36, as on a phone and the rest of the page; Q7 (9) every control on the Tracker's bar as tall as its dropdowns, 30 desktop, 26 phone (both size changes his word, D487); considered and left: the schedule pages', the board's and the Leave War's rows (26–30, dense working screens) and Quals' view switch. **His answer to round 3's second half (21 Oct 26): "yes all" — D1138 (the titles), D1139 (the list's two buttons 36), D1170 (the Tracker bar one height); to build on `claude/sharp-spence-adf59e`, pull request 564.** **Built 21 Oct 26 (`80fb78aae` and after):** the titles at Logic's 18 / 700 (16 on a phone), the list's two buttons 36 (pressed 46), every control on the Tracker's bar 30 / 26 — the search box and the dropdowns held at the same number; walk 136/136, one fresh Opus read (two findings, fixed) — `raptor-port/docs/handpass/2026-10-21-consistency-round3.md` §8. **His answer to the page's question 8 — "8 leave it" (D1171):** where a narrow desktop (about 1051–1200) wraps the bar, its second row holds no dropdown and the bar is 2 taller (87 → 89), left as built.
**Round 4, put to him 5 Nov 26 on `claude/ui-consistency-round4`** (the page https://claude.ai/artifact/Eg1hSt3b17u2oVL2owKLux; its file and pictures `raptor-port/docs/img/handpass/2026-11-05-consistency-round4/`, drawn by `raptor-port/scripts/handpass/cr4-look.mjs`, its measures `cr4-measured.json` there; pictured on `main` at `f197e586f`). **Found picturing it:** (10) is overtaken — the Leave War's gear button is cyan but its drawn gear is the grey every drawn icon has (`.btnglyph`, `02-shell.css`: 182,192,203 measured), so D1509 settles its colour; the "◷ OIL tracker" of (17) is already a drawn tab and its "⇅ Rearrange" now sits in ⚙ Settings. **Open questions (four):** Q1 (12) the legends — recommended leave all four (Edit Schedule's fold, D926; the Leave War's and the Tracker's Legend buttons already open the same panel; the Inputs and SANS keys stay in view); Q2 (15) the Inputs calendar at 1366 — the gear drops alone to a second line (the row 88 → 44 drawn): recommended the filters and the gear wrap as one group and below 1440 the search box's basis 220 → 170 (its box 135 → 102, "Search inputs" whole); **for the build:** on a phone the filters are hidden behind their button (`25-inputs-calendar.css` `.inputs-filterfields{display:none}`), so the gear joins their group on a desktop only; Q3 (17 and the sweep) the board's ⇅ Sort all, ▤ Templates, ◧ OIL Earn, ⇅ Auto sort, the phone menu's 📱 / 🖥, and the Leave War's ⇅ Rearrange the grid, ↺ Reset order, ⇅ Done — recommended line icons (the Tracker's ReorderGlyph, the Leave War's ClockGlyph for OIL, three new: templates, reset, phone / desktop); Q4 (18) Edit chart layout's thirteen typed tools and the lull's ⧉ Copy to… (its × not pictured: no lull in the demo) — recommended line icons (the Tracker's copy, bin, list, ✕; the rest new, their paths in the script's `ICON`). **Shown as ruled, built with the answers:** D1509's gear in five places (the SANS calendar's added — "wherever it stands"), in the drawn-icon grey at each button's own size; D1508's calendar on the OIL tracker's RANGE. **Considered and left (on the page):** ↶ ↷, ⇄ Move (D334), the date picker's today icon (his request), ✕ ▸ ⚠ ⓘ ⌫ ⋮⋮. **Next round (5):** the 👁 before "Viewing plan" and the Inputs calendar's ⤢ "Show every input". **Revised the same day (page version 3), after his catch and a fresh design read:** his *"Isint the oil earned symbol the same as history? That u drew"* (D1700, lesson 92) — Q3 gains 3b, OIL Earn A words alone or B a ticket on OIL Earn and the Leave War's OIL tab alike (recommended B), the clock left to History; the gears drawn in their buttons' own colour (white beside the white icons of the Inputs, SANS, Tracker, OIL tracker and board rows; the Leave War's stays grey, its row's colour — every other drawn icon in the app takes its button's colour, measured); Q2's narrower search box only between 1340 and 1439, and the wrapped filters-and-gear group at the row's right end (`margin-left:auto`), so the gear keeps its corner at 1300 and 1280; **for the build** the group is a new wrapper round Filters, the fields and the gear, `display:contents` at a phone's width, so D693's phone row is untouched (the fresh reader's point); Q4's look-alikes redrawn — Select all the dashed box with a tick, Connect two points joined, Fit four corners, Merge and Unmerge in words alone. The fresh reader (one Opus read, blind to the measures) agreed with Q1 and Q3 and missed his OIL / History catch. **His question, the same evening (page version 4, Q5):** *"should I just follow this design"* — his iPhone pictures: the board's ⋯ menu as drawn (plain rows) beside the Leave War window's ⋯ (Attach, Other, Post out, Post in, a box each). Found: menus of actions are drawn two ways — plain rows (the board's ⋯, Edit Schedule's ⋯ on a phone; `18-oil-board.css` `.sb-moremenu`) and a box per item (the Leave War's `.bp-menu` in `bidpicker.css`, the Tracker's `.menupanel` File and pencil menus). Drawn (`cr4-look.mjs` q6): the boxed two in the board's rows; recommended yes, Grant OIL keeping its green tint (D1320); the board's Templates and + Wave menus (choices, not actions) left. **His answer, 5 Nov 26: "all as recommended" — D1701 (legends stay), D1702 (the Inputs top row), D1703 (board and Leave War marks), D1704 (OIL's ticket — answers D1700), D1705 (the Tracker's marks), D1706 (one look for menus of actions), D1707 (the gear in its button's colour, the SANS gear included; the OIL tracker's calendar — narrows D1509); the record `raptor-port/docs/ui-contracts.md` §Matching looks, round 4.** **The build — where each lands (read on `main` at `f197e586f`):** one drawn gear for all (the Leave War's `GearGlyph`, `leavewar/ui/Chrome.tsx`, moved to `ui/icons.tsx` as the shared one) in `ui/InputsPage.tsx` `#inGear`, `ui/SansCal.tsx` `.sc-gear`, `leavewar/ui/OilTracker.tsx` `.oil-gear`, `tracker/components/FlexSettings.jsx` `#flexBtn`, `ui/board.ts` `waveMenu` `.wm-mng` (an HTML string), each in its button's colour; the OIL tracker's `.ci` 📅 → `CalIcon`; D1702 in `ui/InputsPage.tsx` (a wrapper round `#inFiltersBtn`, `.inputs-filterfields`, `#inGear`) and `ui/scheduler/25-inputs-calendar.css` (the wrapper `margin-left:auto`, `display:contents` at a phone's width, the search basis 170 only at 1340–1439) — check the SANS row (`ui/SansCal.tsx`) for the same lone gear; D1703 in `ui/SchedBoard.tsx` (▤ Templates, ⇅ Sort all twice, the phone menu's 📱/🖥), `ui/board-html.ts` (⇅ Auto sort, an HTML string), `leavewar/ui/SettingsSheet.tsx` (⇅ Rearrange the grid, ↺ Reset order), `leavewar/ui/Matrix.tsx` (⇅ Done); D1704 a ticket glyph for `ui/SchedBoard.tsx` `#sbOil` (◧) and the Leave War's OIL tab (`Chrome.tsx` `ClockGlyph` → the ticket); D1705 in `tracker/components/ArrangeTools.jsx`, `SidePanel.jsx` (⧉ Copy to…, the lull's ×), new glyphs in `tracker/components/Glyphs.jsx`; D1706 in `leavewar/ui/bidpicker.css` (`.bp-menu`, `.bp-menu-item`; keep `.oil-give`'s green) and `tracker/tracker.css` (`.menupanel`). Every new mark's path is in `scripts/handpass/cr4-look.mjs` `ICON`; build to those drawings and check beside them (D1424, D1495). **Watch:** open pull requests 636 (keyboard and windows) and 637 (the Tracker tidy) touch the same areas — compare branches first (D302). **Built 5 Nov 26 (`claude/ui-consistency-round4`, 06fde6c82 and after; pull request 643; evidence `raptor-port/docs/handpass/2026-11-05-consistency-round4-build.md`).** The walk and the drawing check found five of the build's own faults, four fixed (the 1340–1439 search box's rule overruled; the OIL tracker's chips 33 → 30; the Leave War ⋯ menu 176 wide where drawn 150; the Tracker menus' phone padding). **His question, ANSWERED "A" 5 Nov 26 (D1708 — to draw for him, then build):** at 1280 × 720 with an input window open the gear, at the row's right end as ruled and as drawn (the approved `q3-1280-new.png` shows it under the window's corner), is under the window and cannot be pressed (`e2e/inputs-calendar.spec.ts` "Escape closes the window in FRONT" fails on it); before, it stood alone at the left. Recommended: below 1340, where the row wraps, the filters and gear start the second line at its LEFT, together — draw it for him first (D1625). **Seen in passing, older:** the SANS row at 821 wraps Highlight and the gear to the left of a second line, together. **Left to do:** his answer and its build; re-run the drawing check and the walk's rows on the fixed build; GitHub's run green; the fresh Opus code read (brief ready in the evidence sheet's §6); his look. **For round 5 — typed marks round 4's rulings do not reach, seen by its code read (5 Nov 26), to be put to him with pictures before anything changes (D1124):** the Tracker's Reorder window's "↺ Restore" (`tracker/components/Modals.jsx` — D1700's reading makes the drawn arrow turning back "put back" wherever it stands); the warning lines' "✕ / ↺" on the board and Edit Schedule (`board.ts`, `html.ts`, the switched-off warning); the Inputs calendar's "⤢ / ⤡" (already round 5's — the same ⤢ the Tracker's Fit lost to a drawn mark); the phone day bar's Templates and OIL Earn in words alone where the desktop's now wear marks (as ruled — the drawing drew none there).
**Drawn 7–8 Nov 26; answered 8 Nov 26, "All as recommended" (D1792, D1793) — to build by `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`** — the pictures round's page https://claude.ai/artifact/WYuwD2itLGrt7e2Y1bLReJ, round 5's two questions, "The last typed marks" and "The phone day bar's marks" (pictures, notes and script: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/`). Seen picturing it: the Tracker's order window still has the typed ⠿ ▲ ▼ — for a later round.
**(c) the Tracker's Restore — BUILT 8 Nov 26 by chat 9 on `claude/pr-tracker-787259`, live on his "merge live"** (D1792 (c)): Restore in the Course and Syllabus order windows wears the Tracker's own drawn Reset arrow; the record `raptor-port/docs/ui-contracts.md` §The pictures round's answers; evidence `raptor-port/docs/handpass/2026-11-08-chat9-tracker.md`. Left typed, put to him at the look: the words of the delete-course question and of the import's report still name "↺ Restore in ⇅ Reorder" (the walk's search, S31).

### [INP-CAL-CLICK-BEHIND-NEW] A date clicked behind a new input's window (his D1298, 24 Oct 26)
**Seen (his desktop, pull request 569):** "New input · Jul 8" open; a click on 9 Jul outlines 9 Jul and nothing else changes — and the same on the SANS calendar (1 Jul outlined, his "likewise for san calander"). **To do:** his choice first (recommended: the new input takes the clicked date, keeping what was typed); then a test and a walk (the bug-check order §7.11, lesson 4). **Place:** with the M3 follow-ups on `claude/lw-m3-placing-leave`.

### [LW-PICK-HELD-MARK] The tapped day stays marked and in view while its bid window is open (his D1289, D1290 — 24 Oct 26, his look at pull request 569)
**What:** on the Leave War a day tapped to open its bid window wears the grid's cyan selection mark (`matrix.css .selcell`, the drag-selection's look) until the window closes or the leave is placed (D1289); on a phone, when the window opens over what was picked, the grid scrolls so it stands just above the window (D1290). **And his question the same message:** can the one-day bid window be less tall — put to him with pictures of ways to do it, each naming the ruling it would change (D1144's day line, D1212's rows). **Place:** with the M3 follow-ups on `claude/lw-m3-placing-leave` (pull request 569), after his answer on the pictures; the design guide's lesson 45.

### [LW-OVERHAUL] The Leave War's major overhaul, taking the good things from a colleague's app (his word, 21 Oct 26 — D1140)
**M5b's leftovers (29 Oct 26, on `claude/leave-war-m5b-iphone-balances-1402b7`, pull request 588):** (1) D1510 — only an admin ticks Management on Quals: **built 29 Oct 26 red first** (the Quals write, his own cell read only, the commit gate's `people` case — which now also refuses his callsign, archive and placeholder marks), walked 30/30, a fresh read and a security read (evidence `raptor-port/docs/handpass/2026-10-29-lw-m5b.md` §10); (2) his ask, 29 Oct 26 ("Can we do a mock up of the separation in the next chat … of the events page"): **drawn 29 Oct 26 on the real app** (`raptor-port/scripts/handpass/mock-events-split.mjs`, pictures `raptor-port/docs/mock/lw-overhaul/full/m5b/events-split/`) and put to him on his M5b page as question 3 — **answered 29 Oct 26: B (D1514), side by side on a desktop, one under the other on a phone** (A: two sections, Holidays and Squadron events, in the same window — recommended; B: side by side on a desktop) and question 4 (which section first — recommended: Holidays); waits for his answers, then built as its own small job — **with D1512** (29 Oct 26, "theres no edit icon or cross icon": each line shows how to edit and delete it), drawn as question 5 (the pencil and a ✕ asking "Delete?" once; on a phone the name under the date — `events-split/P-C-line-controls.png`, `D-C-line-controls.png`) — and **D1513** (29 Oct 26: every line's kind starts at the same place, one column); and **D1515** (29 Oct 26, "Fix all six": the design review's six fixes); questions 4 and 5 **answered 29 Oct 26, D1516** (Squadron events first; the ✕ asks once) — **all answered, and BUILT 29 Oct 26 red first** (`raptor-port/src/leavewar/ui/EventsSheet.tsx`), the drawing check green against the script's F- frames (`raptor-port/scripts/drawcheck/specs/lw-m5b-events.mjs`), walked 98/98 at the iPhone's 402, 820, 1024 and the PC's 1536, a fresh code read and the fix's narrow read (evidence `raptor-port/docs/handpass/2026-10-29-lw-m5b.md` §11) — **live on his "merge live" of 29 Oct 26 (pull request 588)**, the in-between width kept (D1517); (3) the Events list's full page on a phone (D1511, built) — its phone picture on his page (`events-split/P-0-today.png`); (4) his "merge live" — **given 29 Oct 26, pull request 588 merged**.
**M3's leftovers, from its fresh Opus read (24 Oct 26 — `raptor-port/docs/handpass/parts/lw-m3/read-opus.md`, findings 7 and 8; not built in M3):** (7) — **BUILT 27 Oct 26 with M4 (9.3a): the grid notice keeps the bid's remarks and documents and offers them onto the replacing leave of the same man (`sync.ts replacedCarry`, `ui/DayList.tsx`; `m4ride.test.ts`); a member's own filing over his own bid leaves no notice, as before, so his own words are not carried — the build's reading** — a bid replaced by a clashing Inputs-page leave or medical drops its documents and remarks from every record (`leavewar/inputgate.ts replaceClashingBids` writes a notice carrying neither) — carry them onto the same man's replacing leave, or keep them on the notice; (8) the 20-document cap on a request is silent (a 21st file picked disappears) and the Inputs page has none — one cap for both, said on screen. And from the walk, older and met in passing: an approved leave's one-record window has no "Back to bid" (the day's list has it); a drag made while a drag-selection window stays open does not replace its selection.
**M5's plan (28 Oct 26):** `raptor-port/docs/superpowers/plans/2026-10-28-lw-m5-plan.md` — the seven jobs, what is ruled, drawn and built; recommended split into M5a (balances, with [LEAVE-YEAR]) and M5b (Settings, Management, holidays and events by file); four points for him without pictures (War bal after an approval, a leave across 31 Dec, D1235's readings, the split), then the redrawn screens.
**M5a's drawings, all answered (28 Oct 26):** D1479–D1489 (the person window, the Balances page, the leave year's other kinds), drawn by `raptor-port/docs/mock/lw-overhaul/full-m5a-person.mjs` and `full-m5a-balances.mjs`; the rulings D1478–D1489 were read by one fresh reader against his words on 28 Oct 26 (D138): eight as recorded, four corrected the same day (D1472's and D1248's short lines, D1480's home, D1483's 375 wide). **M5a's build spec (28 Oct 26):** `raptor-port/docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` — the figures' one engine and the leave year, the screens, what is stored and who may write it, the code as read on main, the roll-call seed, the walk, the FULL checks; two questions put to him (Q1 a grade changed after 1 Jan; Q2 the grid's drag-to-give-days bar, picture `full/m5a/m5a-q2-grant-desk`) and 24 readings, read twice before (a fresh read, 14 findings; a narrow read of the rewrite, 9) — **answered 28 Oct 26, "as recommended": D1490 (from the next 1 Jan), D1491 (the bar goes), D1492 (the readings stand).** Next: the build, in a fresh chat.
**Answered 28 Oct 26, "All as recommended" (D1472–D1475):** War bal is App bal less every leave since App bal was typed; a leave across 31 Dec counts each day in its own year; D1235's readings hold; M5 is two merges, M5a (balances) then M5b (the admin's set-up).
**M4's build spec (27 Oct 26):** `raptor-port/docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md` — batches 8 and 9, the code read again on main, one look and two questions for him (`raptor-port/docs/mock/lw-overhaul/m4-questions.html`, pictures `full/r22-*`).
**M3's build list (23 Oct 26, the night's):** `raptor-port/docs/superpowers/plans/2026-10-24-lw-m3-build-spec.md` — batches 5–7 and the folded items, step by step, with the roll-call seed and the walk's scenarios; built on `claude/lw-m3-placing-leave`.
**His words:** *"Should we create another worktree chat for a major overhaul planning of the leave war? … I saw this app
created by my colleague and would like to take the good things from it"*. **What:** compare the colleague's leave app
with ours, list what it does better, what ours already does or he has ruled against, and what is new; put each product
choice to him in rounds of four with pictures (D853), checked against his rulings; then a design note he approves, red-teamed
by a fresh, blind Opus reader before anything is built. **The design note:**
`raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` (the comparison, the questions, his answers, the
build batches). **It decides together:** [LEAVE-YEAR] (yearly balances), [LW-SORT-BY-FLIGHT] (D1001), [LW-PHONE-PINCH-ZOOM]
(D1117), [LW-COMMIT-MANNING] (parked, D998) — each stays its own item until the note says otherwise. **Branch:**
`claude/leave-war-overhaul` (planning only). **Place:** his rounds of questions first; the build in batches by area (D1087),
each with its own bug check. **21 Oct 26:** round 1 answered (D1141-D1144); his list of 22 points recorded (D1145-D1156); next, a full mock-up of the new Leave War in a fresh chat, with the design skill. **21 Oct 26, later:** the full mock-up published (https://claude.ai/artifact/6xaVkA1QHg7UmevMBRFaT9); round 2 answered (D1157-D1160: the year grid kept, Ack gone, the one Document button, a half day's box filling its half), question 2 redrawn his way and put again with 4b (two whole-day entries on one day), 5 and 6 as round 3.
**The night of 21–22 Oct 26 (/overnight, D1204–D1207):** the person window, "since your last visit" and the Settings window drawn (`full/r6-*`); the whole design red-teamed by two fresh, blind Opus readers (the note's §10 — fixes settled, twelve questions for him in three rounds, §10.3); every screen as it will be drawn (`full/r7-*`, D1206); the build plan written for his approval (`raptor-port/docs/superpowers/plans/2026-10-22-leave-war-overhaul-build-plan.md`, five merges); the owed fresh read done. **Next:** his answers to §10.3 (Q5 and Q6 before the first merge) and his approval of the plan.

### [SERVER-SIDE-PASSES] Every pass the app runs under its own name runs on the server at the database step (filed 31 Oct 26 — the security read of `claude/lw-roster-restore-fixes`)

**What:** today the app's own passes run in every signed-in browser, a member's too, and commit as the app itself, which
the commit gate does not limit by role: the posting pass (`raptor-port/src/leavewar/sync.ts runPoOutcomes`, `lw.postoutRun`
— runs from every notify through `lwSyncTurn`), the war's sync projection (`leavewar/state/store.ts`, `lw.sync`) and the
inputs projection (`writeInputsBatchProjection`). Translated as they stand, the database would need a service account a
member's browser could use. **The rule for the database step:** each such pass runs on the server (a scheduled flow or a
server-side handler), never under a credential a browser holds, and is limited to the rows it owns — the posting pass to
the men whose posting it carries out, as the commit gate's `postingPassViolation` (`state/perms.ts`) and
`raptor-port/docs/data-model.md` §11 already say for that one pass. **Sources:**
`raptor-port/docs/handpass/parts/lw-rr1031/read-security.md` findings 1(b) (Medium at the database step) and 2 (Low — the
war's and the inputs' projections). **Place:** the database step (D473); nothing to build before it.

### [POSTPASS-FIRSTWRITE-WHOLE-SEED] The posting pass's first account write: each row checked, never the whole list (found 31 Oct 26 by the fix read; not built at the cap; unreachable from the app)

**What:** the commit gate's rule for the posting pass (`raptor-port/src/state/perms.ts postingPassViolation`) checks each row
of the accounts' first write against the seeded list, but never that the whole seeded list is there. (a) A pass changeset
carrying only Ranger's suspended seed row passes; the loader then reads the stored rows, so every other seeded account is
gone, admins included. (b) With some rows stored and a seeded account deleted by an admin, a changeset putting only that row
back passes the "first write" test (every row in it has no before-image) and it returns at its seeded role. **Cause:** "first
write" is still judged from the rows present. **The reader's exact fix:** when `firstStore` is true, require a put for every
row of `seedAccounts()` except a Delete's posted man. **Reach:** this build only — no path in the app produces such a changeset
(the pass's own first write stores the whole list); at the database step the accounts are made at set-up and there are no
seeds (`raptor-port/docs/data-model.md` §11). **Why filed:** found 31 Oct 26 by the security reader's narrow read of fix round
2 (`raptor-port/docs/handpass/parts/lw-rr1031/read-fix2.md`), not built at the cap of about three fix rounds (the bug-check
order §5). **Place:** with the next Leave War or accounts batch; small; nothing waits on it.

### [SYSTEM-ACTOR-ONE-TEST] "The app itself" is decided in two places — make them one (filed 31 Oct 26 — the code read of `claude/lw-roster-restore-fixes`, tidiness note 1)

**What:** the posting pass's wait under another command (`raptor-port/src/leavewar/sync.ts runPoOutcomes`) keys on
`parent.origin === 'projection'`; the commit gate (`state/perms.ts ownershipViolation`) keys on `actor.role === 'system'`. A
command run as the app itself with another origin — a `seed`, or a `remote` change at the database step — would let the
pass join it unjudged and put nothing back. No production `seed` or `remote` command exists today, so nothing can reach it.
**The reader's fix:** key the wait on `parent.actor?.role === 'system'`, so the two agree; a test with a system-actor parent
of another origin. **Place:** before the first `seed` or `remote` command is written (the database step); not built now.
Source: `raptor-port/docs/handpass/parts/lw-rr1031/read-opus.md`.

### [LINE-ICONS-ELSEWHERE-ASK] Other lists that may want D1512's edit and cross icons (named 29 Oct 26, D852)

His D1512 ("theres no edit icon or cross icon") is for the Leave War's Events list; lesson 71 keeps it there. Places the agent names where a line also opens only by a tap, none changed: (1) the Calendar window's Holidays list (`raptor-port/src/ui/HolidaysPanel.tsx`) — the same line, the same holidays; (2) the Inputs page's List rows; (3) the Event window's presets list. Each one he takes up is drawn for him before it is built. Lean: (1) yes, with the Events list's build, since it shows the same holidays.

### [QUALS-COL-WAR-GROUP-ASK] A question for him: a member's own ticks and the Leave War's groups (kept under D994)

Found 29 Oct 26 by D1510's code read. The Leave War can make a group from any Quals column (⚙ Settings, a qualification group). A member ticks every column of his own Quals row (D149) except his callsign (D218) and Management (D1510), so he can put himself into such a group — e.g. a group made from NVG. D1510 answered this for Management only. **The question, when he asks for the kept questions:** should a column the Leave War uses as a group be the admin's to tick, as Management is? The agent's lean: no — the other columns are qualifications a member records himself (D149), and a group made from one only draws him where his qualification already says.

### [LW-EVENTS-LANE] A better way to show the Leave War's events — parked (his word, 22 Oct 26 — D1259)
**His words:** *"/impeccable /design is there a better way to design the events"*, then, shown the study: *"Leave E out first. Means that events are shown as full rows"*. **What stands:** the events stay full Event rows as built (D1259); G3 and G3b are not built. **The study, kept for when he raises it** (D994 — not put to him before): three ways drawn on one busy squadron (`raptor-port/docs/mock/lw-overhaul/full-r21-events.mjs`, `full/r21-ev-*`; his page, version 59, section E): A tags in the date heading with an Events fold (322px to the first person on his phone, 375px open), B an events lane, recommended (each event one thin bar across its days in its kind's colour, packed into as few lanes as the period needs, no row to pick; 345px), C leave events only (a tag only for PH, OFF, NL, a dot for the rest; 302px). Found in it: A's tag on a several-day event hides the day's own event behind the count. **Place:** after the overhaul's merges, only on his word.

### [NOTIFY-REGISTER] One register of every notification the app should send (his word, 21 Oct 26 — D1151)
**His words:** *"Can u create a document to note down all the areas in which we should have a notification and how it
should work … I want u to automatically see which areas needs a notification and automatically fill it in and tell me if
I want to reject"*. **What:** one document — every place a notification should go out, who gets it, when, what it says,
what a tap opens, and whether it is built. The first entry: a reminder to attach a leave's document one day before it
starts (D1150). The bell's notices already built are listed in it too. Kept by the agent: any job that finds a place that
needs one adds a line and names it in its closing report; he may strike any. **Where:** `raptor-port/docs/notifications-register.md`
(its row in the project guide's map). **21 Oct 26:** written — 11 built, 1 ruled (D1142), 6 proposed by the full mock-up (P1–P6), put to him to strike; the item stays open while proposed lines wait.

### [DESIGN-CHECK-GOLD-DOT] The design checker flags the gold history dot (filed 26 Oct 26 from the night of 21 Oct 26's handoff block)
**Seen (21 Oct 26, the overnight run):** the design checker flags the gold history dot in `raptor-port/src/ui/scheduler/20-changes-quals.css` as a "grid background" — a false alarm. An ignore for that one file was added that night and taken out by job 5's helper; adding it needs his OK. **Place:** Checks and tooling — low, his word.
**His OK, 8 Nov 26 (D1890, asked with a picture): built by chat 19 on `claude/chat19-checks`** — one scoped skip (rule `codex-grid-background`, that file only) in both copies of the checker's settings, its reason naming D1890. Leaves for the archive once merged.

### [CREW-REASON-TWICE] A crossed-out man's reason says each fact once (his D1121, 21 Oct 26; a later job)
**His words** (to round 2 of [BOARD-SIDE-WIDTH], whose "checked and left" item showed Grit's reason): *"Yeah we shouldnt have the reason explained twice. we can do that job later too"*. **What is there:** with a place picked, a man struck for an absence reads the kind's meaning, then his own remark — "medically down — cannot report to work (ATT C) — Medically down till 17 Jul", "ordinary medical leave (OML) — Medical leave 13 Jul" (`raptor-port/src/engine/avail.ts` slotBar and `inputs.ts` offWord build it; the same sentence is the note a tap raises and the ALL AVAIL window's reason). Picture: `raptor-port/docs/img/handpass/2026-10-21-board-side-width/look/crop-reason-repeat.png`. **To do:** a wording that keeps the kind's fact where his remark does not say it ("cannot report to work") and drops the repeat; put to him before and after, read cold first (`design-practices.md` §1a); the design guide's lesson 15. **Place:** a job of its own after [BOARD-SIDE-WIDTH], or with the words pass ([UI-SLEEK-PASS], D808) — his to place.

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

### [PRINT-FLYING-ONLY-ASK] The print and the schedule's spreadsheet carry flying lines only (filed 9 Oct 26 in [ALLAVAIL-CHECK-SEEN]; its own item 3 Nov 26)
Seen by the ALL AVAIL / Event check (`raptor-port/docs/handpass/2026-10-09-all-avail-event-check.md` §5.3): the printed page and the schedule's CSV carry flying lines only — no Ground Programme row of any kind. Whether they should is his question, put to him with pictures when he raises print or export (D994); `[FLAG-EXPORT]` and `[PDF-PRINT-TWICE]` touch the same pages.

### [DB-ONE-MASTER-FIXES] What does not read the one table — for the database step (3 Nov 26, D1587, D1589)
The list and why each: `raptor-port/docs/superpowers/specs/2026-11-03-data-one-master-check.md` §A, A1 and A4–A11 — A1 Quals ticks homed in QualMark alone (and the table plan's §5 people row corrected: it maps from the top-level flags, not what Quals writes); A4 an input's "landed on the Ground Programme" worked out per day, never stored; A5 holidays and Off days a table of their own by date (D638's two doors stand); A6 a posted-out man read from Person (LeavePersonProfile keeps dates and outcome only); A7 a Tracker student linked to the roster shows Person's callsign live; A8 medical documents in the shared file store; A9 a Ground row's `sourceInputId`; A10 the shared "last period opened" setting dropped or per person; A11 SANS quarter "flown" worked out from published days. And D1589: every who-stamp keeps the person's id beside his name as it was. Earned OIL is its own item, [DB-OIL-OWN-TABLE]. **Place:** the Database step (D473).

### [DB-OIL-OWN-TABLE] Earned OIL in a table of its own, by person and date (3 Nov 26, his "file it" — D1579)
**What:** at the database step, a credit the published schedule earns stops being a record of a Leave War period (`raptor-port/docs/data-model.md` §LeaveBid, `warId` required) and becomes a row of its own — person, date, amount, the work it came from — read by the Leave War grid, the OIL tracker, Balances and anything else. **Why (his question):** *"Shouldnt OIL be stored on a table in the database. And anything can call that data?"* — earned OIL is a fact about a man and a day, not about whether a period exists; tied to a period, a weekend in a year with no period has nowhere to go (D19's advisory, D1578's waiting case). A hand-given award is already its own `LeaveLedger` row. **What it changes then:** the OIL pass writes this table; D19's "no OIL can be earned" advisory is no longer needed for OIL (the period offer may stay for the Leave War's own sake — his to rule then); the OIL tracker's derivation reads the new rows. **Place:** the Database step (D473), with [DB-STEP].

### [DB-WEEK-AHEAD] Fetch the neighbouring weeks ahead, so a cross never waits on the network (3 Nov 26, his question)
**His question (3 Nov 26):** *"so with the database, the scroll between every day including next week will have no delay? Just
like limit of how fast the data is being called up?"* — answered: not by itself. Today every week is already on the phone, so a
cross costs only the app's own preparation of the week (measured 3 Nov 26: about 84 ms on his PC to the next paint, ~470 ms with
the processor slowed 4×). With the database a week the phone has not fetched must first come over the network (a Dataverse read
— typically a fraction of a second, longer on poor signal), and that wait would come on top. Scrolling inside a loaded week
stays the phone's own scroll, no fetch. **To do at the database step:** when a week opens, fetch the week before and after in
the background and keep them on the phone (one read of a week's day rows each — well inside the 40,000 requests a day each
person has, D1570), refreshed when another scheduler changes them (the sharing design, [DB-SYNC-MODEL]); a cross then costs only the app's own preparation, as today
(the end cards that would have hidden it were set aside, D1577). A week fetched for the first
time with no signal shows a plain "loading" state, never another week's data. **Place:** with [DB-STEP].

### [ONE-LIVE-WEEK-WEIGH] One live week at a time — weigh at the database step whether to change it (3 Nov 26, his question)
**His question (3 Nov 26, after the [WEEK-CROSS-END-CARDS] plan's fresh read):** *"Does that mean that the way the app is designed now
is not right? … do u recommend me to keep the same as now or change it"* — answered: keep it. The app holds ONE week live at a
time (the original app's design: `state/store.ts loadWeek` swaps the days, dates and schedule book in place; `engine/validate.ts`
and the day builders work on that one week), and the rules engine stays word for word (D1537), protected by the original's 728
tests. It is correct for everything built; it only makes a feature that needs two weeks at once more work: cross-week dragging
(D1573, skipped) and the full-day end cards (D1574, which needed a neighbour's day drawn in a borrowed moment — the plan,
`raptor-port/docs/superpowers/plans/2026-11-03-week-cross-end-cards.md`; set aside by D1577). **To do:** at the database step, with the list of
features that then want several weeks at once, weigh whether weeks become separately held (and the engine reads any week, not
the live one) — put to him with its cost; until then nothing changes. **Place:** with [DB-STEP].

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
- **D1100 (21 Oct 26) — one app for every squadron and aircraft type, detachments, lending a man:** an aircraft-type setting carrying its rules; a detachment with its own schedule and its people moved to it; the two F-15 squadrons sharing one app and lending a man for a day or a period (one squadron's morning, the other's afternoon); one shared system or split apart is his question (security classification). At the end, after the F-15 app's faults are fixed (`docs/architecture-direction.md` §3).
- **D1101 (21 Oct 26) — split by aircraft type:** a deployment and a database for each type; the F-15 squadrons share theirs. A guest flyer from another type and a man moving between types cross two databases — his question at the database step.

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

### [LW-PIN-LAST-FRAME] The pinned dates row still blinks for one painted frame (8 Nov 26)

**His answer, 8 Nov 26 (D1850):** "Merge live" — the fix went live with this frame left, and this item is the job of its own: the fresh code reader's idea, a pinned row the browser moves by itself (a scroll-driven timeline, the pinned copy always drawn), tried and its frames measured before anything is built.

Found by the walk of [LW-FROZEN-BAR-GAP]'s build (chat 8, `raptor-port/docs/handpass/2026-11-08-lw-group6.md` finding A;
pictures `raptor-port/docs/img/handpass/2026-11-08-lw-group6/pc-s10-painted-frames.png` frame 3,
`ph-chromium-s11-painted-frames.png` frame 5). D1789's build commits the pinned row in the same frame the PAGE'S CODE
hears of the scroll — that took the blink from two painted frames to one on the desktop wheel, and leaves one on a phone
flick (the Leave War and Quals). The last frame is the browser's own: it moves the page and paints it before the page's
code hears of the scroll, so a pinned row drawn by the code is always one frame late there. **To remove it:** the browser
must keep the row pinned itself — a pinned copy always there, laid under what scrolls above it so it shows only once the
real row has gone under the bar, or the browser's own pinning — a change to the grid's layering (its pinned names
column, zoom, Rearrange, the month strip and the windows over it), with its own walk. **His question, with the pictures
(lesson 7 — his iPhone first):** does he still see the blink on his iPhone, and if so, is it worth that change? Nothing
built. **Place:** after his look at pull request 680.

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

### [LW-OIL-OPENING-AWARD] An opening OIL balance from the old system, at go-live — a question for him before the database step (found 28 Oct 26, M5a's build spec)
**What:** D1255 rules that an opening OIL balance from an old system is given once in the OIL tracker as an award, "Opening balance from the old system", so every day of OIL has its record; M5a stops OIL being typed as a figure by any door (red-team fix B6). The code survey of 28 Oct 26 found two side effects of giving it as an ordinary award: every hand award is drawn on the grid as an FO or HO box on its date (D402), so the opening balance would show as a box on a day nothing happened; and an award follows the OIL expiry rule, where today's undated opening figure never expires (`leavewar/state/oiltracker.ts`, the `openings.oil` credit); an award is also capped at 365 days. **Why later:** only real data meets it — today's store is demo data, cleared before the database (D56). **To put to him, with a picture, before the database step:** whether an opening award is drawn on the grid and whether it can expire (recommended: dated the day the old system's figure was read, not drawn on the grid, and expiring as the old system would have it — to be drawn first). Where it is planned: `raptor-port/docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` §6 reading 16.

### [LEAVE-YEAR] Yearly leave balances and carry-over — OPEN (owner, 19 Sep 26: "we will do this next time")
**Planned 28 Oct 26 in M5a's build spec** (`raptor-port/docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` §1.3): worked out, never stored — the typed figure, its date, the approved leave and the grade held on each 1 Jan; nothing runs on 1 Jan. Built with M5a.
Today each person has ONE running balance per counter; leave on 1 Jan simply comes off it, and a new
year is handled by the admin's "Reset counters". Decide next session: separate balances per year/war,
carry-over rules, and which year a leave crossing 31 Dec charges (ruled 28 Oct 26 — D1473, D1474). Context: clash catalogue Q10.
**28 Oct 26 — D1473, D1474:** a leave crossing 31 Dec counts each day in the year it falls in (D1473); D1235's three readings hold — no grade, nothing added; pending days in the year they fall in; below zero carries nothing forward, the overdrawn days still coming off (D1474). Built with the overhaul's M5a ([LW-OVERHAUL], D1475).
**22 Oct 26 — D1218:** his ruling on carry-over: a year's unused annual leave carries forward one year, and carried-forward leave not used by the start of the year after that is gone (his official leave app: "Carried forward leave … valid to 31 Dec 2026"; "Annual leave … valid to 31 Dec 2027"). This item now joins [LW-OVERHAUL] (the person window, M5); which days a leave uses first: the carried-forward days (D1224); each person's leave grade adds the year's annual leave on 1 January by itself (D1229); one page sets everyone's balances and grades (D1230); still to rule: which year a leave crossing 31 Dec charges — ruled 28 Oct 26, D1473.

### [DB-STEP] The shared-database step (Dataverse) — at the end (D473, 1 Oct 26; "starts now", D354, is replaced)
**At the end (D473, 1 Oct 26 — "Database at the end."):** the app goes into Dataverse once its features are built — the IT side's
own advice (the app about 60% built; once it is in, every change needs their review and merge, and no AI outside that environment
can sign in to check it). He, with his AI, writes the table format and schema for them to enter; `raptor-port/docs/data-model.md`
is that list, kept up to date as each feature is added. What the platform offers today: `[IT-QUESTIONS]` (1 Oct 26). **2 Nov 26:** his IT colleague's advice on building the tables, checked against Microsoft's pages, and how the tables are built and handed over (D1570, D1571) — `raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md` §5.
**Found 5 Nov 26 for the database step (the [PO-CHANGE-RETRACT] reads, `raptor-port/docs/handpass/parts/tb1105/read-pcr-fixes.md`):** a posting's own bell lines are told apart from an earlier posting's (same man, date and outcome after a Restore on its own day) by the moment one run of the posting pass stamps on them all (`leavewar/sync.ts postingLinesOf`); with one shared database and several devices' clocks, the posting record should carry the runs it made instead (the first read's `poRan` list).

**Remove "Clear edit history…" (owner, D1752, 8 Nov 26 — replacing D351):** at this step Admin → Data's Clear edit history section goes, with its permission entry (`elog.sweep`) and its tests; nobody deletes change history by hand. The agent's reading, told to him: if room is ever short, history older than the IT side's audit period is dropped by the app itself — built only if needed.

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

### [DB-WAITING-CREATEDBY] The database's own "created by" on a waiting person's change-log row (filed 5 Nov 26)
**What:** since the member / guest check (`claude/member-guest-checks`), the change-log batch saved with a waiting person's
access request names his role ("pending"), not his sign-in name (`raptor-port/src/state/changebatch.ts batchActor`), because every
member and guest reads the change log (data-model §11). Dataverse stamps every row with its own "created by", which would name
him again. **To do at the database step:** write such rows through a service account, or keep that column from members and
guests. Evidence `raptor-port/docs/handpass/parts/mg1105/read-opus.md`. **Place:** the Database step (D473), with [DB-STEP].

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
(`raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`). All low. **(1) and (2) done 8 Nov 26** on
`claude/insights-leftovers` (evidence `raptor-port/docs/handpass/2026-11-08-insights-leftovers.md`): (1)'s two edges tried
and found no fault — the "pending" chip and the board's "Not yet signed" count the saved typing at once; Templates is never
offered while a look is open — pinned by `raptor-port/src/ui/insights-leftovers.test.tsx`; (2) built as
`roleAnswerName` / `roleSideWord`, the words unchanged. (1) **Insights, two edges never tried**
(`[INSIGHTS-MISSION-MIX]`, the Opus interim read of 3 Oct 26): what a published day's "changes to go out" strip shows after
"Choose mission role" is pressed with unsaved typing in the Remarks box; and the week's Templates button while a saved
plan is being looked at. (2) **Insights, one tidy-up** (D489's note): the change history and Undo each work out the wording
for a Blue/Red answer by themselves — one shared helper would stop them drifting; with `[CODE-TIDY-AUDIT]`. (3) **Three
checks of the older "adapted audit" script failed the same way before and after the Insights build** (an AL mark that
moves, an issued key rewritten, where an input's Undo lands) — written down then as limits of the script, not faults; look
again when that script is next run. (4) **Discard marks — not ruled, his to raise:** a button that puts a published day
back to its last published version (`[DISCARD-MARKS-REMOVE]`, D488). The second cheaper-model trial — one small fix built
by a Sonnet helper — ran 21 Oct 26 on `[OG-TAG-OVER-COUNT]` (archived; the verdict: `raptor-port/docs/handpass/2026-10-21-look-keys.md` §12). **Place (the agent's line):** (1) with the next change to Insights'
role question; (2) and (3) with their own jobs; (4) only if he raises it. **(5) Filed 8 Nov 26, D489's tidiness note from
the fresh Opus read of job 6** (`raptor-port/docs/superpowers/briefs/2026-11-08-insights-leftovers-read-opus.md`, low 3):
a line's callsign is still tidied for the Blue/Red answer in three bodies — the question's name
(`src/state/mission-roles.ts`, no 80-letter cut), the history's name for a copied answer (`src/state/changelines.ts`
`roleFormationName`) and `src/engine/mission-role.ts roleAnswerName`; they agree today, and one shared body would stop a
later change to one making a copied answer's history line name the line differently from a typed one. Not a fault now.
**Place:** with the next change to Insights' role question, or with `[CODE-TIDY-AUDIT]`. **Now open: (3), (4), (5).**
**Seen 10 Oct 26, not corrected (a helper's scan of the backlog's own status lines):** `[INSIGHTS-CLOSE-STAYS-VISIBLE]`, `[LOGIC-STICKY-SEARCH-COMPACT]` and `[TRK-FLIGHT-LABEL-READABILITY]` still say "owner look and Claude reads pending" although the workflow UI pass is live (PR #481, 6 Oct 26) — read each, then archive it or say what is left; `[ITFLOW-OIL-RESHOOT]` waits on a merge that has happened (PR #469).

### [IMPECCABLE-UPDATE] Move Impeccable to v4.1.3, the last version built from readable scripts — AFTER the calendar job (D625; the newest version is not taken, D623 — 7 Oct 26)
**Place (his word, D625):** after the Inputs / SANS calendar job — its own small branch from `main`, the vendoring note's own steps (copy the publisher's files at the tag `skill-v4.1.3`, merge the two hook lines by hand), Astra's read beside a fresh, blind Opus reader's (D70, D1761; Sol 6.1 only on his call), then his "merge live". *The paragraph below is how the question arose; its two points "to put to him" are answered by D625 — v4.1.1 stays until then, and the update is 4.1.3, not a later version's guide text.*
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
**Drawn 7–8 Nov 26; answered 8 Nov 26, "All as recommended" (D1785) — to build by `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`** — the pictures round's page https://claude.ai/artifact/WYuwD2itLGrt7e2Y1bLReJ, question "A week that cannot be read" (pictures, notes and script: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/`). Seen drawing it: that week's refusal is still the amber note, where D1669 made every other refusal of one change the grey "Blocked:" note — to build with this item's words.

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
**8 Nov 26 — his D1751 replaces D450:** the day lock is a simple mark — who is editing the day — set when he starts and cleared once saved, held by the app; the database refuses nobody; no row ownership, free team or server check (`raptor-port/docs/data-model.md` §9). The code comments citing D450 for "only the day's holder saves a day" stay true (the app holds it — §9 rule 9); the few saying the database refuses are corrected with the lock's build.
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
from inside the app, or must IT assign it?** (decides whether "make Hex an admin" is one tap or an IT request). **And (5 Nov 26, his "as recommended"): would you import a ready-made solution file built on his own Microsoft 365, or only build the tables from `SCHEMA.md`, as the SWiFT kit says — and what publisher prefix should the tables use (a file built with another prefix would not drop in)?** **And (D351,
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
**Questions for the IT side on notifications (22 Oct 26, from the Leave War overhaul — D1208, D1214, D1219):** (1) may a Power Automate flow, triggered when a notice row is added in Dataverse, send a Teams message to ONE named person (a member told his leave was decided), and what does it need to find him — his work email on his person record? (2) may it post to a Teams group chat (every member told bidding opened or closed; the admins told of an access request — D216)? (3) can a Teams message carry a link that opens the app on the right page (the Leave War, that period in view — D1214)? (4) any daily limit on messages a flow may send? The app's own bell works without any of these; Teams is the push on top.
**Answers from the IT side, 7 Nov 26 (his chat with them, shown to chat 1 — heard in chat, not a formal reply; written here, without names, on his D1748):** (1) *Plug-ins:* plug-ins and external connectors do not work — locked down, for security, to the Power Platform's own software. So the IT deployment kit's optional server add-on (a plug-in with one Custom API) cannot be used, and the day lock's firm check (D450) is designed without server code, as planned since 30 Sep 26. (2) *How the tables are built:* the person who builds them now creates tables by a script from a table schema we hand over, and will not take a solution file, because he cannot see inside one to scan it before deployment — so D1571's reading (1), a managed package handed over with the script beside it, no longer holds: we hand over the table schema (and the code, as agreed 29 Sep 26); `raptor-port/docs/handover-dataverse.md` §What happens next and the M365 move plan §5 still say otherwise, to be corrected when IT's answers are folded in (`HANDOFF.md`, chat 1's block). (3) *Testing:* he is fine with the owner using his own external test account for testing, and IT suggests getting the same script to build the tables the same way there (by hand is tedious and error-prone). His idea the same evening — deploy the app to that account, test it there, then hand over the schema — was put to him with its cost and a recommendation (chat 1); the questions still open went to him as a shorter list the same day.
**The IT side's written reply to the 12 questions (version 2), 8 Nov 26 (pasted by him to chat 4 — written here without names, on D1748):** (1) *The table list:* "no issues" — they take a `tables.json` in their kit's format and build it with the same kit. (2) *Functions and flows with more rights* (pasted by him the same night): the AI's suggestion is a hard access lock, not needed since the app is used within the unit, not by strangers — a simple field saying who is updating, cleared once saved, so two people never edit at once by accident; the "service account" is a role-based account; too much complexity for a simple problem. He sent the same words as his answer: D1751, the day lock a simple mark. (3) *What his test account must match:* no outside connectors, only other M365 services such as Power Automate and Teams; their data-loss policies need not be known; access to the app is one user security group from the M365 directory (Entra), giving basic app access. (4) *Unique keys:* not sure; the tables are made again in the real environment anyway, so ours are for our own testing only, and theirs are built exactly from the `tables.json` we finally send — so no unique key can be counted on (the kit's format has no place for one), and the app keeps out a second copy itself (the agent's reading: a fixed id worked out from the natural key — a week's from its squadron and Monday — which the database refuses twice; to prove in the test account, D1749). (5) *Change tracking:* not sure, they think not ("a Dataverse feature", to look up); and great care with refreshing — a patchy connection, or code that downloads or uploads too much, causes problems. So the 30-second check (D356) does not rest on change tracking until it is proven in the test account; the fallback is an ordinary read of the change log for rows newer than the last one seen — still one small request when nothing changed (`data-model.md` §9). (6) *Documents:* Dataverse by default, but each environment has limited space — avoid large uploads; keep large files in SharePoint and save a link. Who may read them: not answered. (7) *Environments and short code:* the PP CoE has ONE production environment for code apps today; the short code (prefix) is theirs, set when they create the tables; our own tables are not carried over. So D1101's database per aircraft type cannot be three environments today (put to him 8 Nov 26), and the app's link to the tables is made again on their build, with their prefix (the agent's reading: ask the prefix early, so the test account uses the same one). (8) *Two squadrons in one database:* manage it by app role — a column naming the unit, and the app's own rules stopping one unit editing another's; not at database level, which is the PP CoE's and beyond our control. (9) *Giving and removing roles:* app roles, controlled inside the app — the squadron admin sets a person's role on Admin → Users (as built), not IT; access to the app at all is IT's security group. (10) *A run on a date with nobody signed in:* Power Automate runs by itself; the unit should have a role-based account — never one person — owning these flows, for continuity. (11) *Audit and history:* managed by the PP CoE; auditing is already on. (12) *The kit's role installer:* don't know — moot, since roles are the app's own (9) and access is the security group (3).
**What it changes (chat 4, 8 Nov 26):** written into `raptor-port/docs/data-model.md` (head note, Attachment, Squadrons, §9's lock rule 8 and change log, §11, §12), `raptor-port/docs/handover-dataverse.md` (head note, what we need, the access constraint, what happens next) and the M365 move plan (`raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md` — its head, points 2, 19, 24, 35, 36, §4, §5 and §Platform flags). D450 (the firm day lock) is replaced by his D1751 (a simple mark the app holds); D1653 (the security roles per table, which IT would enter) rests on database rights too, which the IT side keeps — put to him 8 Nov 26. D1101 (a database per aircraft type) meets one environment: put to him the same day.
**Still to ask the IT side, whenever convenient (no rush — D1745):** the short code they will use, so his test tables match (his test tables use "talon" for now — D1753); what their basic access lets a person do on the app's tables (read and write every row?); whether the app may save and open files in SharePoint, and who sets up the library and who may read it (every member, D211); how long the audit is kept (it sets how long the app keeps its own history — D1752); how the unit gets a role-based account. And, from before: the first admin of the empty tables (`data-model.md` §12 q11). A short version 3 of the questions, these points only, is kept with the package on his PC, not in this project.

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
**Narrowed 8 Nov 26** (`claude/rd-shell-state`, evidence `raptor-port/docs/handpass/2026-11-08-rd-shell-state.md`): every pointer listed below now
names its new home, and `raptor-port/src/ui/board.ts` and `inputedit.tsx` were re-pointed in that job. **Four are left**, in
files that job could not touch: `raptor-port/src/engine/canonical.ts:35` ("CLAUDE.md §Drag-reordering" →
`.claude/rules/decisions/scheduler.md` §Drag-reordering) — the engine changes only for a behaviour change (D1537), so with
the next one; `raptor-port/src/ui/weekglide.ts:45` ("CLAUDE.md §Week navigation" → `scheduler.md` §Week navigation &
cross-week continuity) and `raptor-port/src/ui/SchedBoard.tsx:607` ("CLAUDE.md §the phone board is ONE window" →
`raptor-port/docs/ui-contracts.md` §The board on a phone is ONE window) — both files of pull request 664, with their next
change; and `raptor-port/src/ui/pendlist.ts:16`, whose pointer still lands (`raptor-port/CLAUDE.md` §What actually persists)
but which says the edit log is kept only while the page is open — read it against D338 (the change history outlives a
reload) before changing a word.
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


### [ITFLOW-OIL-RESHOOT] Re-shoot the IT flow guide's Leave War pictures once the OIL words change (29 Sep 26)
**Also for the next re-shoot (8 Nov 26 — D1177, found by the rules diet's step 5a on the IT guide):** the Leave War's stages (draft, open for bidding, bidding closed, published) went on 21 Oct 26, and D1177's readings had the documents describing them swept at the build (the overhaul, built and live); the deck's Leave War work flow slide and journeys still picture them, and its words in `raptor-port/scripts/itflow/content.mjs` still state stage-era rules — Undo takes a stage back; the admin decides in every stage but Draft; a dotted edge after bidding closed; Published locks members out; a new war opens in Draft and members pick it in Period; Approve "before the war is published". Redraw the flow as create → open the dates → bid → close the dates and decide (his best order, D1208) → text the squadron, remarks at any time, with the rebuild he asks for (D403). The README's D413 and D418 lines were marked at once (8 Nov 26), as its drag line was.
**Also for the next re-shoot (21 Oct 26 — D1098):** J14's picture settings-4 framed the RULES MODIFIED tag on View-only Sched, which is gone; its script now frames the Logic page's strip and its words say so (`scripts/itflow/j/settings.mjs`, `content.mjs`) — the deck's picture is re-shot with the rest.
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

### [PDF-PRINT-TWICE] Edit Schedule's "Export as PDF" asks the browser to print twice — the first time on a blank page (found 29 Sep 26)
**SEEN ON HIS IPHONE, 1 Nov 26 — and worse than this item says:** one press of Export as PDF opened the iPhone's print preview on
the APP SCREEN itself — 4 pages of the working copy (DRAFT, "Live working copy", the open Aircrew panel, the "Print dialog opened"
note printed on the page) — not the white report of the published schedule ([FLAG-EXPORT]); so on his iPhone an unpublished working
copy can go out as the record. Likely cause, to confirm: iPhone Safari prints the parent page when a frame's print is called, and
the load handler fires on the blank frame first. His picture: `C:\Users\User\.claude\uploads\bfb7a1b4-282f-4e4f-bffc-7fed8f1b15a0\37e79b02-image.png`
(copy it into the evidence folder when the fix is built). **Fix:** every browser prints only the report, once (e.g. the report in a
print-only part of the main page, `@media print` hiding the app, `window.print()`, cleaned up on `afterprint`), red first; checked
with print-media pictures in Chromium and WebKit, and his iPhone look. **His word, 2 Nov 26: "Later"** — not now; with the next batch
of small fixes. The lesson: `raptor-port/docs/bug-check-order.md` §7.11 lesson 18.
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

### [PLAN-BANNER-DOOR] The preview banner's "Switch to this plan" has no screen route — low (filed 28 Sep 26)
Found by the small-fixes batch's walk (`raptor-port/scripts/handpass/sf/sf-f-banner.mjs`) while walking `[REQ-DOOR-WORDS]` 1, which made that button say the switch in the plans menu's own words. The button is drawn only on an EDIT surface (`html.ts`, `vsel`) over a PLAN preview ('d:'), and no screen reaches one: Edit Schedule's plans menu previews issued versions only and switches plans directly, View-only Sched's plan picker shows the plan's banner read-only (no Switch), and that preview does not carry over to Edit Schedule. So the button, its handler (`interactions.ts` `data-draftgo`) and the wording fix are reachable only by a test. **To decide:** retire the door (as `[LW-SPARE-MOVE-DOORS]` retired the war's unused move doors), or give it a route (a plan preview on the edit surfaces). Not a defect a person can meet today. **Place:** low, with the next change to the plans menu or the preview bar.

### [LW-UNDO-BLOCK-REOPEN] A refused Undo or Redo onto a closed day stays passed over after the day reopens — with the database step (filed 22 Oct 26)
From the narrow read of D1263's fix (evidence sheet `raptor-port/docs/handpass/2026-10-22-lw-m1-open-dates.md` §15). A member's
Undo or Redo the commit refuses onto a Leave War day closed for him is BLOCKED for the rest of his sign-in, and so is an older
step sharing its record (`undo/timeline.ts refusedFor`, `undoConflictOf`, `redoConflictOf`) — right for a day closed by time,
which never reopens. A day the admin closes can be reopened (`openDates`); that writes the war's own record, not his day's, so
nothing clears the block: the step stays skipped and the greyed button says bidding is closed. **Not reachable today:** in one
browser the admin's close sits on the shared timeline above the member's step, which is then refused "Switch back to the admin
view…". It becomes real once two people work on one database. **Fix then:** when the war's open dates change (an `lw.war`
change arriving from elsewhere, in `ingest`), clear the blocks `refusedFor` set and the ones behind them. **Place:** the database step.

### [CI-FAIL-PICTURES] GitHub's browser-test jobs keep no pictures of a failure (filed 27 Sep 26)
The `[LW-MOVE-CI-RED]` investigation found NO artifacts on any failed run: `.github/workflows/deploy.yml`'s geometry jobs
upload no Playwright report, trace or error picture, so a red run on GitHub can only be read from its log. **Do, if he
agrees:** upload `raptor-port/test-results/` from the geometry jobs `if: failure()` (traces stay off — too slow on the Leave
War grid). **His call, because:** while the repo is PUBLIC (D106) anything uploaded is downloadable by anyone with a GitHub
login — the pictures show only the invented demo world (no real names — D58, D62), but it is publishing. **Place:** low —
ask him with the next change to the checks; the agent's recommendation: yes, once the repo is private again (D106's
"afterwards").

### [RULING-HOME-HOOK] Name the rulings whose home a file is, at the moment it is edited — OPEN (Fable's red team of [RULINGS-SLIM], 28 Sep 26)
**What:** once every ruling loads as one short line (D390) — or, in an area converted to a page, as a statement of it
(D1735) — the guard that a chat opens the full row before acting on its
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
code — put the choice to him with `[RESTRICTED-ENV-WORKFLOW]`'s go-ahead; (3) the night of 6 Nov 26 left three temporary
build folders outside the repo on his PC — `C:dw1106`, `C:db1106` (each with a link into the app's packages: delete the link
before the folder) and `C:da1106` (from that night's handoff block, removed 7 Nov 26). **Place:** (1) and (3) at any clean
point, a short job; (2) before the go-ahead to IT.

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
**(1) `AGENTS.md` is stale:** "`AGENTS.md` on `main` still names the calendar as "the job on hold" (a working guide — D70's two reads before it changes)". The calendar job is built and live; the line to correct is its first paragraph ("the job on hold is the SANS availability calendar's new layout") — that paragraph moved whole to `raptor-port/docs/codex-guide.md` on 2 Nov 26 (D1556). **And (2 Nov 26, the trim's fresh reader — [START-LOAD-TRIM] archived):** `AGENTS.md`'s read-first item 4 does not name the screen-design rulings `.claude/rules/decisions/design.md` (D1554), which until 1 Nov 26 sat in the general rulings Codex reads whole — add it to that list, e.g. ", `design.md` (screen design — read it before any interface work)"; a working-guide change, his to approve (D70). A second stale sentence there: "D567–D585 stay reserved for the calendar branch" — those rulings are all on `main` now. One round each by Astra and Sol 6.1, then his approval.
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
**Met again since it was filed (13–26 Oct 26 — observations 601, 609, 668):** about forty more times by the three notes'
own count, five of them hangs of two to five minutes on overnight runs; every time the Write or Edit tool put it
right.
**Two more refusals for the guard:** a command that begins `cat >` (or `cat >>`) with no here-document or file of its own —
it waits on input for ever and the tool moves it to the background after two minutes (609); and every script run from
the shell gets `< /dev/null`, so anything that reads input ends at once. **Conditions from the two notes about writing a
command-refusing hook (598, 626):** read the shell's real grammar before the rule — quotes and escapes per shell,
here-document and here-string bodies, comments, `$( … )`, `bash -c` / `eval`, redirects, launcher words (`timeout`,
`env`) — and judge only the word in command position (`grep vitest` is not vitest); write the everyday commands as tests
first (a commit with a here-document message, a pull request body, a grep for the tool's own name); list every situation
in which the platform fires the hook's event and refuse only in the one the rule is for, never twice on unchanged state.
The cheaper helper's find-and-replace pairs match each spot's own line endings (694).
**Built 8 Nov 26 on `claude/chat19-checks` (chat 19, not yet merged — a hook, his "merge live" in that chat):** `.claude/hooks/script-guard.mjs`, 20 tests written first, the everyday commands among them; what the shell does was measured before each refusal (the file's header) — so the "every script gets `< /dev/null`" point above was not taken: Python takes `/dev/null` for a keyboard and waits in its prompt, so the guard refuses that instead. The in-chat proof comes in the first chat started after the merge (the app reads hook settings when a chat starts). Readers owed: Astra and a fresh Opus reader (D811, D1761).
**Read 8 Nov 26 (chat 27):** Astra and a fresh, blind Opus reader, one brief, blind to each other (`raptor-port/docs/superpowers/briefs/2026-11-08-chat19-checks-read-{brief,astra,opus}.md`). Every finding fixed red-first: here-strings, `--help`, single-quoted inline scripts, a quoted `<` and a message piped to `tee` no longer refused; `sed -e'…'`/`-f…` written on, launcher options with values (`env -u X`, `xargs -n 1`), reserved words (`then`, `do`, `!`) and a list git refuses whole no longer let through (24 tests); "checks passed" fails a first job that gave no answer, and its tests run in the Docs guard; the board test pins the 350 ms window both ways (shown red at 1 ms and 5 s); the rule check no longer counts a drawing's "Q11.5" as a test (Q11 back in its baseline); `shipping.md` names the right list. Also measured: in chat 27 the shell's input was `/dev/null`, not a pipe that never ends — the refusal message says both. **Tidiness, filed not fixed:** `nativePath` copied from push-guard, not imported; the `<`/`>` pattern written twice in `tokens()`, its comment about a digit before `>` not matching the code; docsize's comment says the gates skip `.impeccable/**`, untrue of the `raptor-port/` copy; `python -VV` refused; a quoted `<` mid-word in an option is still read as a redirect for cat, tee and the interpreters (rare); once private, the two new jobs bill about 2 minutes a run.

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
- **A reused server is proved before it is used (586, 590, 616, 630, 634, 644 — six meetings; the guide lines already
  exist and kept being missed).** The browser tests (`playwright.config.ts`, which reuses any server on its port outside
  CI) and the walk drivers' `open()` (`lib.mjs`, `trk-lib.mjs`) check that the server they reach serves THIS checkout's
  build — the hashed bundle name in the served `index.html` equals the local `dist`'s — and stop with that sentence if
  not; a walk refuses to run with no address given, and a runner passes its address on (634).
- **The walk helpers' pictures.** `pic(…, { around })` scrolls its subject into view, or refuses when the box is off the
  screen (603); a crop helper given several selectors boxes all of them (666); the Leave War walk helpers that set their
  folder with `=` take it with `||=` (705) — all but a re-walk's own setter file, whose one line names its `rewalk/`
  folder on purpose.
- **The check lock.** `gatelock.mjs` ends its child processes and releases the lock when it is itself stopped (607); and,
  while this checkout holds the lock for a run, an edit under `raptor-port/src` (or a document the document check reads)
  is refused — or the run works from a copy of the last commit — so the tree it checks cannot move under it (595, met
  twice). A gate script's `--logs` default is under the checkout or carries the session's id, never a fixed name in
  `$TEMP` (624).
- **The backlog script.** `backlog-archive.mjs <ID>` removes the item's line from the priority list with its section (or
  refuses and names it), and the document check fails on a priority-list line whose item is archived (657); its
  `--dry-run` runs the same last inventory as the real run (569).
- **The push guard.** A push from a worktree was judged by the main folder's branch on 21 Oct 26 ("this checkout is on
  main") — reproduce and fix (717); and a push of a commit that touches `raptor-port/src` warns when the last build is
  older than the last source edit, since GitHub's build then refuses what the PC never built (570, met again 25 Oct 26).

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

### [LOGIC-IOS-REFOCUS] On his iPhone, does the keyboard stay up when a Logic setting is saved by tapping the next box? (found 21 Oct 26 by the fresh code read of the Insights and Logic fixes — OLDER than that job; a check on his device)
In ✎ Edit, type a new value into one setting and tap the next setting's box. The save redraws the list a beat later, and
the page puts the keyboard back on the box drawn in place of the one tapped (`ui/LogicPage.tsx`, the keeper) — a `focus()`
from the redraw, not from the tap itself. iOS normally raises the keyboard only for a focus inside a tap, so the keyboard
may drop and a second tap be needed. The page did the same before the fix (a timer's `focus()` after a redraw at once);
Chromium's phone emulation cannot show it (`e2e/logicedit.spec.ts` passes there). **To do:** try it on his iPhone first;
if the keyboard drops, keep the tapped box itself through the save (draw the list again row by row, leaving rows whose
markup did not change — `ui/dayswap.ts` is the week's own pattern) instead of rebuilding it. **Place:** low, with the
Logic page's next change; it needs his phone.

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
| The night of 5 Nov 26 (his "Go"): the keyboard and windows batch (D1645–D1648 — `claude/keyboard-windows-batch-5eff45`); [TRK-STANDALONE-LEFTOVERS] with the Tracker's React Doctor warnings (saved data: the Tracker's storage path); [MEMBER-EDITPAGE-CHECK] with [GUEST-SAVE-WARNING] (who may do what) | a fresh, blind Opus reader each (D790), and for the last a security read (D1411) | Astra and Sol 6.1 |
| The Inputs batch [INPUTS-FIXES-1103] — the October finds and his answers (saved data: the LATE drop and Make public; the published record: To go out, Make public on a published day; D1594) — on `claude/inputs-small-fixes-2`, pull request 625 | a fresh, blind Opus reader (D790), its scenarios a fresh Opus reader's (D1594) | Astra's scenario design and code read; Sol 6.1's second read |
| The night of 31 Oct 26 (D1531) — the M365 move plan page (`claude/m365-move-plan`); [SYSTEM-PASS-SAVES-ROSTER] with [LW-DELETED-RESTORE-OVERREFUSE] (saved data, who may write it — `claude/lw-roster-restore-fixes`); the secrets scan and scorecard (D1408, D1409 — `claude/secrets-scan-scorecard`); the pinch fixes (`claude/pinch-fixes-1031`) | each: one fresh, blind Opus reader (D790, D903); job 2 also the security read (D1411) | Astra's and Sol 6.1's reads (job 2's two, D590) |
| The Leave War small fixes — a deleted man's leftover bid refused at every door and in Undo / Redo (saved data: an approval writes a leave input), the clash note's and credited sheet's codes, the month's memo across its edge; FULL-checked on the night of 29–30 Oct 26 on `claude/lw-small-fixes-1030` (pull request 592) | the scenario design and the code read: fresh, blind Opus readers (D790); the two fix rounds' narrow reads: fresh Opus readers (the second still owed at the time of writing) | Astra's scenario design and Astra's and Sol 6.1's reads of the finished code (saved data) |
| The Leave War overhaul's M5b — the admin's set-up (D1499–D1502): a saved built-in Quals column, holidays imported by file (saved data, one Undo step), the import an admin's only; FULL-checked 29 Oct 26 on `claude/leave-war-m5b-iphone-balances-1402b7` (pull request 588) | the security read (D1411); one fresh, blind Opus reader of the finished code (D790) and one of its fixes; the scenarios designed by a fresh Opus helper | Astra's and Sol 6.1's two reads of the finished code, and the other provider's scenario design (`raptor-port/docs/handpass/2026-10-29-lw-m5b.md`) |
| The drawing check's guide wording (D1494) — the bug-check order §7.0 and §7.10, walk-scripts §10 — drafted 29 Oct 26 on `claude/drawing-check-b783bd` (`raptor-port/docs/superpowers/specs/2026-10-29-drawing-check-guide-wording.md`), not yet in the guides | one fresh, blind Opus reader (16 findings, all taken) | the guide change's two reads (D70: Astra and Sol 6.1) |
| The Leave War overhaul's M5a — a person's leave figures, the Balances page and its lock, a member typing his own figures, the leave year (D1479–D1492) — saved data and who may write it; built on the night of 28–29 Oct 26 on `claude/leave-war-m5a-screens-ced9d7` | one fresh, blind Opus reader of the finished code (D790) and the security read (D1411) | Astra's and Sol 6.1's reads of the finished code; the other provider's scenario design (the spec §8) |
| The skill-notes review of 27 Oct 26 — the guide drafts from the 152 notes of 13–26 Oct 26, on `claude/observation-log-review-triage-7f6090` | one fresh, blind Opus reader, on his word (D1414) | the guide changes' two reads (D70: Astra and Sol 6.1) |
| `[GROUP-INPUT-ONE-ROW]` — the schedule's one row for a shared input; LIVE since 11 Oct 26 (pull request #490) | its PLAN: Astra and Sol 6.1, two rounds; its finished CODE: Fable alone, on his word (D749, D752) | Astra's and Sol 6.1's reads of the finished code (`raptor-port/docs/handpass/2026-10-11-group-input-one-row.md`) |
| The ring colours he found (D751) — fixed on the same branch, LIVE with it | walked and gated (the sheet's §14, WALK tier); no model read of its own | any ChatGPT read |
| `[METHOD-LIT-COLOUR]` — the line his find costs the checking guide | MADE 13 Oct 26 with the skill-notes review, on that review's one fresh Opus read, on his word (D811) | the guide change's two reads (D70) |
| `[CAL-JOB-LEFT]` (1) and (2) — `AGENTS.md`'s stale paragraph; the one sentence added to `.claude/rules/doc-structure.md` (D667); Astra's meaning read of the short ruling lines D658–D665, D676–D679 and D734–D741 | nobody | D70's two reads; Astra's D138 read |
| The short ruling lines D742–D761 (recorded 10–11 Oct 26) | the host, at the writing | Astra's D138 meaning read, as for the lines above |
| The night of 26 Oct 26 on `claude/lw-m3-placing-leave` — [LW-REJECTED-CSE] (D1381, D1389, D1390: who counts as present), [LOGIN-NOT-AT-TOP], [LW-DRAG-MORE-MENU] (Post in, an admin's); the short lines D1381–D1390 and design lessons 56–59 | one fresh, blind Opus code reader; one fresh Opus reader for the lines and lessons (D790, D903) | Astra's and Sol 6.1's reads (the count of who is present is a "money" change — two readers); Astra's D138 read |
| [LW-OTHER-GOES-TO-LOCK] (his D1388 — who may change where an input stands: a permissions change, a saved field) with [LW-OD-DISCARD-COUNT] (the load's count on a published day), on `claude/lw-other-goes-to-lock` (pull request 572), 26 Oct 26 | one fresh, blind Opus reader of the finished code (D790, D903); walked (FULL, `raptor-port/docs/handpass/2026-10-26-lw-goes-lock.md`) | Astra's and Sol 6.1's two reads — permissions and saved data take two (D590) |
| [LW-LOAD-RELAND-RID] (the load's "Discard N edits" on a published day and the hidden name of a request's row — the published record, saved data), on `claude/lw-load-reland-rid` (pull request 573), 26 Oct 26 | one fresh, blind Opus reader of the finished code (D790, D903) | Astra's and Sol 6.1's two reads of the finished code (`raptor-port/docs/handpass/2026-10-26-lw-load-reland-rid.md`) |
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
| The night of 21 Oct 26 — the schedule pages ([RULES-TAG-OFF], [INNERHTML-REPAINT-SWEEP]), the Leave War small fixes, the Tracker small fixes, the look and keyboard small fixes, the checks themselves (D994, D1098, D1102) — each on its own branch | one fresh, blind Opus reader of each finished branch (D790, D903); each walked and checked by GitHub's run | Astra's and Sol 6.1's reads |
| Round 2 of the consistency look — D1129–D1132 (Quals' Edit quals plain, the board's bar and highlighter mark, the Tracker's line icons); built 21 Oct 26 on `claude/consistency-round2` (pull request 563) | one fresh, blind Opus reader of the finished code (D790, D903); walked 100/100 (`raptor-port/docs/handpass/2026-10-21-consistency-round2.md`) | Astra's code read (a WALK-tier interface change: one reader) |
| `[LW-OVERHAUL]` — the whole design's red team, the twelve questions and the build plan (the night of 21–22 Oct 26, branch `claude/leave-war-overhaul`; D1204) | two fresh, blind Opus readers, each blind to the other (A the design, B the what-ifs); one fresh Opus reader of the rulings' short lines (D138); one fresh, blind Opus reader of the build plan (ten findings, taken) | a ChatGPT reader of the plan — an important plan wants two providers (D590) |
| The Leave War overhaul's M1 — open dates (22 Oct 26; branch `claude/lw-m1-open-dates`, pull request 566): permissions and saved data | a fresh, blind Opus read and Fable beside it, blind to each other (D790, D1260), after the walk | the two ChatGPT reads (D590) — `raptor-port/docs/handpass/2026-10-22-lw-m1-open-dates.md` |
| The Leave War overhaul's M2 — how it looks (the night of 23 Oct 26; branch `claude/lw-m2-looks`, cut from M1's): the OIL award's half (saved data), the Required and Available rows' points and names | a fresh, blind Opus scenario designer and one fresh, blind Opus reader of the finished code (D790, D903), after the walk | the two ChatGPT reads (D590) and Astra's scenario design (D353) — `raptor-port/docs/handpass/2026-10-23-lw-m2-looks.md` |
| The Leave War overhaul's M3 — placing leave (the night of 23–24 Oct 26; branch `claude/lw-m3-placing-leave`): a new admin command (place and approve), documents saved and carried | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| Round 2 of the Leave War's design questions — a course and an overseas duty filed on the war (D1318), UNA the war's own record, an admin's (D1338); FULL-checked 24 Oct 26 on `claude/lw-m3-placing-leave` (sheet `raptor-port/docs/handpass/2026-10-24-lw-round2.md`) — saved data and who may change it | a fresh Opus scenario designer; one fresh, blind Opus read of the finished code (D790, D903) | Astra and Sol 6.1 |
| The night of 25 Oct 26 on `claude/lw-m3-placing-leave` — the bubble (D1344, D1345, D1351), the drag window's words (D1339, D1341), the one Remarks row (D1354); and the design skill's critique of the lit Approve / Refuse (D1348) | a fresh Opus scenario designer; one fresh, blind Opus reader of the finished code (D790, D903) — the sheet `raptor-port/docs/handpass/2026-10-25-lw-night.md`; the critique's two assessments by fresh Opus helpers | Astra's and Sol 6.1's reads (saved data — two readers, D590) |
| The six old pull requests of 21–23 Oct 26 brought level and merged (D1402; 556 the Leave War small fixes, 570 windows and Escape — each merge read) | a fresh, blind Opus read of each hand-resolved merge (D790) | Astra and Sol 6.1 |
| The night of 26–27 Oct 26, job 1 — the Leave War small fixes (groups after an archive, four armed questions across a page switch, D1105's Delete words) | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The night of 26–27 Oct 26, job 2 — the Tracker chart's three pinch edges ([TRK-PINCH-MORE-EDGES]) | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The Leave War overhaul's M4 (deciding — Approvals, the bell's war lines) and the night of 27–28 Oct 26's fixes (`claude/leave-war-m4-planning-d18224`, pull request 581) | a security read (D1411); two blind code reads — a fresh Opus reader and Fable (his D1425), each blind to the other; three fresh, blind Opus reads of the fixes, one a round | Astra and Sol 6.1 — saved data, permissions and a published record's who-decided want two providers (D590) |
| A leave of several days opens whole in its bid window, with D1289's cyan mark ([LW-WHOLE-LEAVE-WINDOW], `claude/lw-whole-leave-window`, pull request 582) | a fresh Opus scenario designer; a fresh, blind Opus code read and a security read (D790, D1411) | Astra and Sol 6.1 |
| The night of 30 Oct 26, job 2 (`claude/lw-small-fixes-1030`): `[LW-DELETED-NO-ROW-APPROVE]`, `[LW-HALF-DAY-WORDS-LEFT]`, `[LW-M1-READ-LEFTOVERS]` (2), `[LW-MONTH-MEMO-UNPINNED]` — an approval that writes an input (saved data) | one fresh, blind Opus reader of the finished code (D790, D903) | Astra's and Sol 6.1's two independent reads (D590) |
| The night of 1–2 Nov 26, job 1 (`claude/lw-next-batch-1101`): `[LW-HELDHALF-WORDS]`, `[E2E-POSTING-DATES-PIN]`, `[LW-DELETE-POSTING-RESTORE]`, `[LW-DELETED-REDO-NETSUM]` | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The night of 3 Nov 26 and the morning after (`claude/week-swipe-pdf-print` — the morning: the swipe Safari gives no touch for, the week stilled under the slide; four fresh Opus reads in all): `[WEEK-SWIPE-CROSS]` (the phone's swipe across weeks), the keyboard leftovers (`[BOARD-OPEN-BY-KEYS]`, `[VEILED-WINDOWS-BAR]`'s Escape part) and the schedule's React Doctor warnings — WALK for the batch | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The member / guest build of his morning answers (`claude/member-guest-checks`, pull request 638): [ACCESS-WAIT-LOOK], [SAVEBAND-LOOK], [GUEST-SAVE-WARNING], [MEMBER-SCHED-TICK] — who may tick Scheduler (roles) | a fresh Opus scenario designer; a fresh, blind Opus code read and a security read (D790, D1411) | Astra and Sol 6.1 |
| The night of 6 Nov 26, job 1 (`claude/lw-faults-1106`): [LW-NIGHT1025-OLDER] (a), (c), (d), (f), (g), [CSS-WRAPPER-GUARD] — bids are saved data | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The night of 6 Nov 26, job 2 (`claude/inputs-batch-1106`): [INP-CARD-COLUMNS], [BATCH-14OCT-LEFTOVERS] (a)–(f), React Doctor on the Inputs pages | a fresh, blind Opus read (D790) | Astra and Sol 6.1 |
| The night of 6 Nov 26, job 3 (`claude/people-quals-1106`): the three Quals touch faults, React Doctor on People, Quals, Holidays and sign-in | a fresh, blind Opus read; a security read if sign-in is touched (D790, D1411) | Astra and Sol 6.1 |

### [WEEK-ADD-TAP-PHONE] On a phone, a tap on a row's "+ add" on Edit Schedule's week arms nothing when the row already holds someone (found 11 Oct 26 by `[GROUP-INPUT-ONE-ROW]`'s walk — older than that job; his to place)
**Found, NOT fixed, NOT reproduced by the host on `main`.** Walker W2, scenario 3 (`raptor-port/docs/handpass/parts/gi-w2.md`; pictures `raptor-port/docs/img/handpass/2026-10-11-group-input-one-row/w2/s3-week-tap-add.png`, `s3-board-armed.png`): on a 390-wide phone, on the WEEK, a tap on a ground row's "+ add" arms nothing — no ring, no drawer — where the row's first place is filled; the same on an ordinary one-man row, so it is not the shared row's. The same tap on the Scheduler Board arms the row and the crew drawer opens. The walker read that the week's "+ add" label takes no taps and the people cell arms only an empty first place. **As filed:** low — the board's tap and a held-finger drag both add a man (walked, passing); to reproduce on `main` first, then either make the week's cell arm as the board's does or leave it by his word.

### [MERGE-ONCE-RECORDS] Merge finished jobs as ONE pull request, and make the record files merge without clashing (his ruling D822, 13 Oct 26) — OPEN, the agent's to work out; from the next job on

**Why (13 Oct 26):** nine merges in one afternoon took about three hours. Two causes were fixed the same day (the slow unit check split in four, a settings change no longer starting the full run — D822). Two are left. **(1) Merge once.** When several jobs finish together (a night's run — D799), combine their branches on ONE branch, run the checks once, and merge once on his word — each job keeps its own check, evidence sheet and backlog item; D485's batch, applied to the merge. Never stack one pull request on another's branch: it runs no checks until pointed at `main` and pushed to. **(2) The records clash at every merge** — `HANDOFF.md` (every chat rewrites the top of `## Now` and the first line of the gate baseline), `OUTSTANDING.md` (the priority list and the list of jobs without a ChatGPT reader), the rulings files and `DECISIONS.md`'s map (every new ruling goes at the top of a table), `raptor-port/docs/walk-ledger.md` and the two archives (every job adds at one place). Thirteen such clashes were resolved by hand that afternoon, every one "keep both sides". **Ways to weigh (measure on a copy first):** git's own "keep both sides" setting for the add-only files (`.gitattributes` — the ledger, the archives, the skill log), and note Fable's finding CI-PATHS-001: a change to that file runs every check; the gate baseline's "latest" line kept as a list that only grows; the rulings map rebuilt by the script after every merge (`backlog-archive.mjs --rulings` already does it); one records-only pull request at the end of a batch instead of records in every job's. Whatever is chosen must keep the document check's guarantees (no ruling or item lost or doubled). Ruling: D822.

**The plan (8 Nov 26, chat 27 — measured on a replay of that day's 113 merges, 66 of which clashed; put to him, nothing built before his go):** `raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md` — "keep both sides" only for the add-only files (it would have cleared 12 of the 66, and is wrong for the handoff and the map), a "settle the records" step for the rest, and one merge for jobs that finish together.

### [SKILL-FUSION-WRITING] The writing guide — outside writing guides and skills read at the source, their best parts taken into our own guide (he asked, 13 Oct 26) — the guide is approved (D836) and the rechecked wordings with it (D837–D839); what is left here is D835's step: the guide for how the agent writes to him
**He has answered (14 Oct 26 — "All approved as recommended"): the guide is approved (D836) and so are the rechecked wordings (D837, D838, D839). STEPS 1 TO 4 are done; STEP 5, the build, is next.** The guide goes live with this branch on his "merge live". **What is left of this item — D835's step, after the build or beside it, his to place:** the part of the guide that fits prose drafted into `.claude/rules/plain-language.md` for how the agent writes to him, read by the guide's readers, put to him (the tests that would go WRONG if copied across are listed at the foot of `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads-2.md`). The paragraph below is the state before his answer.
**Where it stands (14 Oct 26, early): put to him, waiting on his four answers.** The guide is `raptor-port/docs/design-practices.md` §1 (its additions), §1a (shortening — the first reads folded in) and the new §1b (how the app speaks, twelve tests), with short forms in `.claude/rules/ui-design.md`, check 4 of `.claude/rules/plain-language.md` and a line of `raptor-port/docs/PRODUCT.md`. **Read three times, each by a fresh Opus reader and by Fable, blind** — every finding applied: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md` (the first draft) and `…-writing-guide-reads-2.md` (the second, the third, and the cold read). The outside reading: `…-ux-writing-guides-research.md` (GOV.UK, Google, Apple, Microsoft, Atlassian, Mailchimp, the US plain-language guide, Nielsen Norman — and `blader/humanizer`, which he sent: read in full, its list of machine-writing habits taken as test 12, NOT installed). **His rulings on the way:** D834 — the long dash is not the app's ordinary way of joining two thoughts ("dash feels very AI"), a colon may be used, a dash where it makes sense; D835 — once approved, the guide is adopted for how the agent writes to him too, as a step of its own, and the guide was read again with his tool beside it. **The recheck (step 4) is done and with him:** `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` — List 1, the thirteen he approved (twelve to build; N8 can no longer be shown by the app — its line is dead since D96); List 2, the notes left whole, where only the dash changes; List 3, ten wordings a fresh reader tripped on; the clash note's and the OIL question's words; the two ruled bars, recommended left. **The page for him:** `raptor-port/docs/mock/writing-guide-13oct.html`, published as an Artifact (its link is in `HANDOFF.md`). **His four answers owed:** (1) the guide, with the agent's order — every fact, then a sentence a person would say, then short; (2) List 1 and the clash / OIL words; (3) List 2 in this build or in the whole-app words job; (4) List 3. **THEN:** each answer recorded as a ruling; the guide's wording is then approved (D70) and goes live with the branch on his "merge live"; the build of the three approved jobs starts — to the wordings he takes. **Still open after that — D835's step:** draft the part of the guide that fits prose into `.claude/rules/plain-language.md` (the tests that would go WRONG on messages are listed at the foot of the reads-2 record), have it read, put it to him. **And the relatives** of these notes that were not on the 13 Oct list (the recheck record's last section) go to the whole-app words pass (D808).
**His direction — D833 (13 Oct 26, late):** the writing guide complements the design guide and the design skill and is used every time app text is written — "intuitive clean simple smooth less verbose more human text with less -" (fewer dashes: the agent's reading); it shapes the Logic page's wording and this job's; and the wordings he approved (D827, D829, D830) are rechecked against the finished guide BEFORE the build. **The two reads are back (13 Oct 26, late) — both "ready with these changes", none applied yet:** every finding with its exact replacement wording, where the two agree and the one place they differ (the closed list of four kinds of word: Opus shows it forbids cuts he approved in D829; Fable tightens it) — `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md`. **And he added (two messages, in D833's row):** outside skills and guides, and reviews of which are good, may be used to shape the guide — so the part on how the app speaks starts with a read, at the source, of the best UX-writing guides and of what reviewers say of them (the first research read only the shortening side, and three sources would not open: GOV.UK's, Google Material's, the US plain-language site). **So the order is now:** (1) the two readers' findings on the shortening method folded in (`raptor-port/docs/design-practices.md` §1a, drafted — D832); (2) the part on how the app speaks drafted beside it — voice, plain human sentences, fewer dashes, intuitive naming — and read by a fresh Opus reader and Fable; (3) his approval of the guide's wording; (4) every wording of `raptor-port/docs/mock/design-look-13oct.html` (the notes N1–N33, the clash lines, the OIL question's a–f, "Back / Add") rechecked against it — each shown today · proposed · the exact words changed — and put to him again; (5) only then the build of the three approved jobs.
**READ 13 Oct 26 (his second ask: "Can u read online on skills similar to this, is it worth installing") — the record: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-skills-research.md`.** Both Strunk-based skills are a 1918 essay guide with "omit needless words" as a headline and no test — the instruction that caused the day's over-cut notes; the two UX-writing skills add little the design guide's §1 does not hold. Worth taking, as TESTS not maxims: a shortened note stays a full sentence; only four named kinds of word may be cut; swap before deleting; never trade a named thing for "it"; a fresh-reader test with set questions; "left whole" a proper result; no word count as a goal — eleven in all, with the day's notes 579 and 580. **Next, on his word:** draft them into the design guide's §1 and the wording method, one line in the plain-language rule; an independent read (D70); his approval. Nothing is installed.
**He asked (13 Oct 26, after sending the first shorter wordings back as "too summarised" — D825):** *"Is there a language skill u can download online to improve how you write clearly"*. **Told to him:** yes, several exist; the day's fault was a rule not applied (a shorter version must not change what the original meant — D138), not a missing skill; and by his standing practice nothing outside is installed whole (D486, D491, D812) — the best are read at the source and their good parts written into our own guides, read before he approves the wording (D70). **To do:** read two or three at the source, the Strunk-based "write-concisely" of `neolabhq/context-engineering-kit` first (found by one web search, 13 Oct 26 — a registry's summary, not yet read; its own listing calls Strunk "occasionally dated"), and anything better found then; bring him the pieces worth taking for `.claude/rules/plain-language.md` and the design guide's §1 — with the day's two lessons already in the working notes (579, 580): show the exact words cut, and read each rewrite cold. No app change.

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

**Not faults — nothing a person sees.** Named in that job’s handoff as "step 8’s leftovers" and carried, not done, by the `[OIL-ASK-NOTIFY]` chat (its check was closing: a code change after the walked build would have been a change nobody walked). (1) The behaviour register’s 55 proposed ids (`raptor-port/docs/handpass/parts/or-step8-register.md`) are not wired into the tests’ names or `raptor-port/scripts/rulecheck.mjs`, so the rule check does not yet fail when one loses its test. (2) **DONE 13 Oct 26 with the Inputs batch** (`raptor-port/docs/handpass/2026-10-13-inputs-batch.md`): `PendItem.mates` and its three readers in `raptor-port/src/ui/pendlist.ts` are removed. (3) **DONE 8 Nov 26 on `claude/rd-shell-state`** (evidence `raptor-port/docs/handpass/2026-11-08-rd-shell-state.md` — each re-worded to the code beside it, and the job's blind read found each true): four comments that named removed code — `raptor-port/src/ui/drag.ts` near "ONE OF A SHARED INPUT’S MEN" and the seat branch below it, `raptor-port/src/ui/inputedit.tsx` near the OIL ask’s reader and `askOilIfPending`’s callers (the handoff of 12 Oct 26 gave line numbers that have since moved: read each against the code beside it). **Place:** the agent’s — with the next Inputs / schedule batch (D490).

### [IT-GUIDE-DATEBOX-SCRIPT] The IT flow guide's picture script still types into two date boxes that are buttons now (found 13 Oct 26 by the read of `[ONE-DATE-CALENDAR]`) — OPEN

`raptor-port/scripts/itflow/j/leaving.mjs` fills a posting's date as text; since step one those boxes are the app's own (`src/ui/DateBox.tsx`) and are picked on a calendar, so the script will stop at the guide's next re-shoot (D403). **To do:** open the box and tap the date, as `raptor-port/e2e/app.ts pickDate` does. Not a fault of the app. **Place (the agent's):** with the guide's next re-shoot.

### [ONE-RULE-SMALL-WORDS] Ten small sentences, hints and marks of the one-rule job that read oddly — seen by the Opus trial read and the re-walk, not changed (12 Oct 26)
**Found, not changed — low; words only, nothing owed or published is wrong. For the look-and-feel pass (`[UI-SLEEK-PASS]`, D765) or the next Inputs batch.** (1) A man whose own leave is cut in the middle by a medical is told "You were added" by his bell for the later piece of his own leave (the piece is a new input: `raptor-port/src/state/notices.ts noticePass`). (2) The others in a shared leave are told "Hex taken off" when Hex is only given a leave of his own — a remark typed on his Leave War cell, a time on his Unavailable row — which reads as if he lost his leave (the re-walk's RW3-7). (3) A man moved onto an input whose OIL answer is No gets no "— not counted for OIL" in the note, where a man ADDED to it does (`raptor-port/src/ui/reqdoor.ts rowMove`). (4) A remark typed on one man's Unavailable row of a shared overseas duty gives him an input of his own, so a scheduler's OIL switch-off about him on the shared one ends — worth one sentence to him when the OIL words are next looked at. (5) On a published day, a tap on the line of a swap from a flying seat ("Trident · Range drill — Ranger → Trident") rings the row and ALSO says "That seat is empty now" (the second re-walk, RX3-3 — the line's first place is one nobody stands on any more). (6) The jet's own line for that swap calls the lone man's old place "RANGE DRILL · extras". (7) After a member cancels the OIL question his bell opened, a second tap on the bell shows nothing — no list, no question — though he has an unread line (RX2-3; older than the one-rule job's last round; not reproduced by the host). (8) In OIL Earn the reason a puck earns nothing ("a personal request earns no OIL") is the hint of the seat round the puck; a pointer on the puck itself shows the callsign line (RX1-6) — the ALL AVAIL window says the reason in plain sight. (9) After the MIDDLE man is taken off a published row, the hollow "goes out as AL…" tag sits on the puck that closed up into his place — the count and the line ("taken out") are right (the third re-walk, RX4-5; Fable's third read: a row's places are compared one by one — older than the one-rule job). (10) On a row of several pucks that tag sits on the top corner of its own puck, which is the bottom of the puck above: at a glance it reads as the other man's (RX4-9 — on his look card). **To put to him when picked up:** the wording for (1) and (2).

### [OPUS-SECOND-READ-GUIDE] The checking guide does not yet say when a second, blind Opus read is run (decided 12 Oct 26 under D595 — a guide change, so it waits for its two readers)
**DECIDED, not written into the guide — waits for Astra and Sol (D70; out until about 1 Nov 26 — D761).** The one-rule job's trial (his word, D595): a fresh Opus reader, blind, on the walked build found eight real faults that Fable's read and a twelve-walker walk had not — and missed five of the nine faults already known. The agent's decision, written in `raptor-port/docs/handpass/2026-10-12-one-rule.md` §10b and told to him: on high-consequence work, while the ChatGPT readers are out, a second blind Opus read is run BESIDE the independent read, never in its place; only its findings count, each reproduced as a failing test first — its "sound" is not evidence. **To do when the readers are back:** one paragraph in `raptor-port/docs/bug-check-order.md` §4, read by both, then his approval; and whether it still earns its place once Astra and Sol read again.

### [NOTICE-RETENTION] The bell's notices are kept for good — a retention rule at the database step (the one-rule build's step 7, 12 Oct 26 — deferred)
**DEFERRED — for the database step.** Each notice is one saved record (`notices/<id>`), made inside the change that owes it and never pruned: a person's list shows his newest thirty, the rest stay stored. In this build that is demo data, cleared before the database (D56); in the database it grows with every change to a shared input. **Why it is not pruned now:** a notice is part of its maker's Undo step — a prune inside someone else's command would advance its revision and refuse that Undo, the fault the plan's F9 names for reading (`raptor-port/docs/undo-contract.md` §4). **At the database step:** how long a notice is kept is the organisation's retention rule, with the change history's (D351) — a server-side sweep by age, outside any person's command; and each person's read record (`settings/noticeseen:<pid>`) drops the ids of swept notices with it. `raptor-port/docs/data-model.md` §Notice says the same.

### [IPHONE-CARET-CHECKS] Two checks of the one-tap time boxes only his iPhone can make (carried from pull request 541's round-3 read; filed 20 Oct 26)
D1047: one tap into a time box then typing replaces its time; a second tap, dragging the caret or an arrow key puts the
caret where he wants it. Chromium cannot show two iPhone gestures: (1) dragging the caret with the space bar held — it is
not caught as a drag, so the box may still be armed and the next key replace the time; (2) a long press (the loupe) on the
box. **To do:** at his next iPhone look at a time box, ask him to try both; fix whichever arms wrongly (`interactions.ts`
armFreshTime). **Place:** low — with the next iPhone look at the board.

### [LOOK-COUNT-BOARD-ASK] The Scheduler Board's look at a version shows no "N pending"; the week's look shows one (found 2 Nov 26 by the schedule leftovers' walk — a question kept for him)
**A question for him, not put until he says (D994).** Opened from the plans selector on a published day with changes waiting, the week's 👁 look at an issued version shows the day's "N pending" (since 2 Nov 26 the working copy's own count — `[LOOK-PENDING-COUNT]`, `html.ts` PVPC), while the Scheduler Board's look shows none: its strip under a look carries only who signed the version and the plans selector (`board.ts boardSignBody`, its `pv` branch). View-only Sched's issued face shows none either (AM24). Pictures: `raptor-port/docs/img/handpass/2026-11-02-schedule-leftovers/walk/D8-2-look-at-original-count.png` (the week) beside `D8-4-board-look-count.png` (the board). **To ask:** should a look at an issued version show the day's waiting count — on both, on neither? Recommended when put: on both, since the look's bar offers "Load onto working copy", and what it would throw away is the point. **Place:** with the next change to the version look or the board's sign strip.

### [LOCATE-ITEM-MARKS] Finding a redrawn button again by its first mark (filed 5 Nov 26 — the keyboard and windows batch's second narrow read)
**What:** `raptor-port/src/ui/sheetfocus.ts locate()` finds a control again after a string redraw by its id, else by its FIRST
`data-` attribute. Where a button's first mark names an action shared by many items (an input's "→ Ground"), the search can
land on another item's button — the read's H1, where the keys' "twin" could have been another input's "→ Ground", one Enter
from putting that input on the programme unseen. H1 itself is fixed in that batch (the twin must carry the same `data-acck`).
**The reader's question:** should `locate()` know a short list of the marks that name the item a button belongs to (an
input's, a row's, a wave's), and match on them before the first mark? **To do:** list the controls `locate()` is used for,
which carry such a mark, and either teach it the list with a test per kind or close this with the reason. Nothing a person
sees changes. **Place:** low, the agent's — with the next keyboard or windows job. Evidence:
`raptor-port/docs/handpass/parts/kw1105/read-fixes2-opus.md`.

### [BOARD-OTHER-RINGS] The Scheduler Board's other buttons under the keys wear the browser's ring (found 8 Nov 26 by chat 11; low)
Found while building D1771 (`claude/pr-board-layout-62eb71`, pull request 689): with the keyboard, most of the board's other
buttons — ✕, ■, Auto sort, + Note, + Row, ⓘ, Traffic, Make public, the CAT tabs, sync — and its time boxes show the
browser's own white ring, where the ⋯ items, + Block, Templates, + Wave, the plans selector, a jet's stores and the phone day
bar's buttons now wear the app's cyan ring (D1771, D1646). D1771 named only its own controls, so the rest is a new look to
put to him (D1625), with pictures of each (the walk's keyboard pictures: `raptor-port/docs/img/handpass/2026-11-08-board-layout/walk/c/`)
and a recommendation — the agent's: the cyan ring on every board control, by one rule, as D1646's "the board's small menus"
began. Nothing is built before his answer. Where: the board's rules, `raptor-port/src/ui/scheduler/10-board-history.css`.

### [BOARD-TAB-MENU-BUTTONS] Tab never reaches + Block, + Wave or a jet's stores on the Scheduler Board (found 8 Nov 26 by chat 11's walk; to check)
Walker C of the board-layout walk (`raptor-port/docs/handpass/2026-11-08-board-layout.md` §9, script `raptor-port/scripts/handpass/bl-walk-c.mjs`) pressed Tab,
either way, through about 331 stops on the board at 1536 and never landed on + Block, + Wave or a jet's stores "C" — the board's
own Tab route goes box to box (D550–D556). D1646 says the board's small menus, + Block, + Wave and the stores among them, are
reached and pressed by the keyboard. Not this change's (pull request 689 touches no Tab route), and not yet reproduced by the host:
first reproduce on `main`, then read D1646's and D553's full rows — whether "reached" means by Tab — and fix, or put the reading
to him. Also seen: Enter on the AMT section's + Block adds a block at once and the keys drop to the page, so a following Escape
would close the board. Where: the board's Tab route (`raptor-port/src/ui/` — search `D554`).

### [BOARD-UNDO-SAME-DAY] An Undo on the Scheduler Board does not bring a change out of view into view (found 8 Nov 26 by chat 11's walk; older)
Walker B of the board-layout walk (`raptor-port/docs/handpass/2026-11-08-board-layout.md` row B7 and §14 W-B3) changed a
line, scrolled it out of view and pressed Undo: the change was taken back and the board stayed where it was. The same at 1100
on a desktop, where nothing of pull request 689 applies — so older. D672: undo and redo leave the screen where it is when the
change is in view, and move to it only when it is out of view; its full row told him the board "changes day only when the
change is on another day", so a change on the same day has never been scrolled to. To do: reproduce on `main`, then bring the
changed row just under the board's bar when it is not wholly in view (the Inputs list's way, `raptor-port/src/ui/onscreen.ts`
`bringRowOnScreen`), a test first. Where: the board's undo landing (`raptor-port/src/ui/` — search `D672`). Low.

### [BOARD-SIDEWAYS-SMALL-PHONE] The pinned bar on a smaller phone on its side is two rows (found 8 Nov 26 by chat 11's walk; a question for him)
D1780 pins the Scheduler Board's bar at the top on a phone on its side; on his iPhone (874 × 402) the bar is one row, 51px, and
with the keys up the list gets about 151px. Walker B (the sheet above, row B1 and §14 W-B2) found that at 844 × 390, a smaller
iPhone on its side, the bar's buttons wrap to two rows, 89px, and the list gets 101px. The buttons and their wrapping are
`main`'s (the change only pins the bar; before it the whole head stood fixed, so the list was smaller still) — the host's
reading from the code. A question kept for him (D994), not put until he says: should the sideways bar fit one row on smaller
phones too (fewer words on its buttons, or some behind the ⋯), drawn for him first (D1625)? Pictures:
`raptor-port/docs/img/handpass/2026-11-08-board-layout/walk/b/chromium-844x390/`.

### [CI-SMOKE-TIMEOUT] The checks job: time limits built 8 Nov 26; React Doctor's record skip and one design-check false alarm left (found 5 Nov 26, the round-4 merge; the agent's)
**Seen:** on pull request 643's closing push (`2e37edb23`, notes only — the same app code had passed the same job on
`4d13c06d8` half an hour before), `tracker (smoke 1/2)` ran 16 minutes with every other job finished; it was cancelled and
re-run alone, and passed. `.github/workflows/deploy.yml` sets no `timeout-minutes` on that job (nor, by reading, on most
others), so a hang waits for GitHub's default of 6 hours. **To do:** a `timeout-minutes` on each test job, set from its measured
length on GitHub's machines with room to spare (the smoke halves about 3–4 min — measure first); if the smoke hangs again,
find where (its own log), as D87 says. **The time limits: built 8 Nov 26 on `claude/ci-smoke-timeout`** (a workflow change —
his "merge live"), from the 20 green runs before 8 Nov 26: build 10 minutes (0.9 at most), unit 20 (7.5), geometry 30
(16.4), the Tracker smoke 30 a half (17.7) and the smoke's own step 12 (3.9 at most, over 40 halves). **Measured, not guessed: the 16 minutes
of 5 Nov 26 were not a hang in the smoke** — that half's "Install Chromium" (the system packages it fetches) took 12.3 of
them and the smoke 3.8; the same install took 8 to 16 minutes in 9 of the 20 green runs (10 jobs), while the browser tests
themselves never passed 6.2. A slow install is the browser jobs' long tail, so their limits sit well above it. **Two real
stalls did happen, both before the smoke, and only the job's limit catches them** (the fresh Opus read of the change):
26 Oct 26, `claude/tracker-small-1021`, smoke 2/2's "Install Chromium" printed nothing for 62 minutes until cancelled; 5 Nov
26, `claude/postout-bell-look`, smoke 2/2's Node set-up took 34 minutes and its install 9 more, cancelled. Each would now
stop at 30 minutes. The smoke itself has never hung (4.0 minutes at most over about 1,000 halves, by that read's count). **Still open here:** the two points below, which are not workflow
changes. **Also here (D1716):** React Doctor told to skip `docs/mock/`, `docs/img/` and `reference/` — records nobody edits — one setting, no file of them changed, the full run re-made after to confirm the count (about 400 today, about 215 once nights 1–2 are in). **And:** the design check's one false alarm on `src/tracker/trk-palette.test.ts`
(a test's pattern that reads the Tracker's `borderLeft` text, flagged as a side stripe) — a narrow ignore with its reason, in
`.impeccable/config.json`. **Place:** night 3, job 7 of the sizing plan; a workflow change — his "merge live".
**Both points built 8 Nov 26 on `claude/chat19-checks` (chat 19, not yet merged):** React Doctor's three skips — its full check 421 findings → 236, none left in those folders. The design check's "false alarm" was not the test file: the checker reads its settings only from the chat's current folder, so a chat whose shell had moved into `raptor-port/` had no skip list at all (his ruled side stripes flagged with it); a byte-for-byte copy there, and the document check fails if the two differ (`raptor-port/docs/file-map.md`, the `.impeccable` row). Leaves for the archive once merged.
**Astra's read (8 Nov 26, the morning after — D1743; the night's helper had run only the fresh Opus read):** no finding in the
change — it measured the same 20 green runs (build 0:54 at most, unit 7:29, geometry 16:26, the smoke half 17:41, the smoke
step 3:53), found every test job covered and each limit where GitHub reads it, and nothing else in the workflow changed; one
older gap, filed as [TESTS-REQUIRED-ON-MAIN] (`raptor-port/docs/superpowers/briefs/2026-11-08-ci-smoke-timeout-read-astra.md`).

### [TESTS-REQUIRED-ON-MAIN] GitHub requires only the secrets scan before a merge to main, not the tests (found 8 Nov 26 by Astra; the agent's)
**Seen:** Astra's read of [CI-SMOKE-TIMEOUT]'s change; checked by the host the same morning — the one ruleset on `main`
("main: secrets scan", D1540) requires only `secrets scan`, and `main` has no branch protection. So a pull request whose test
jobs failed or timed out can still be merged on GitHub; today only the merge steps keep it out (D1746 step 3: "its last run
green", read by hand). **The fix, as Astra gives it:** one summary job in `deploy.yml` that runs on every pull request, passes a
notes-only one (the gates skip those by `paths-ignore`) and otherwise passes only when every test job of the run passed; that
one job then made a required check on `main` in the same ruleset — never the path-filtered jobs themselves, or a notes-only pull
request could never merge. **Place:** with the checks batch (night 3); the workflow job his "merge live", the ruleset setting
his own click, as D1540's was — the steps put to him with the build.
**Built 8 Nov 26 on `claude/chat19-checks` (chat 19, not yet merged):** the "checks passed" job and its script (8 tests). The notes-only skip for pull requests moved from the trigger into a first job, "what changed" — left on the trigger, a required check would never report on a notes-only pull request, which could then never merge (`raptor-port/docs/gates-and-deploy.md` §Now). **Left:** his click in the ruleset, once one notes-only pull request after the merge has shown "checks passed" green.

### [LW-ZOOM-TEST-SLOW] A Leave War desktop browser test timed out twice in one GitHub run (found 3 Nov 26; low, the agent's)
On pull request 621 (`claude/week-swipe-pdf-print`, a branch that changes nothing in the Leave War), GitHub's run of commit
`62556cdde` failed one job, `geometry (lw-desktop 2/2)`: `e2e/leavewar.spec.ts` "a pinch (phone) or Ctrl+scroll (desktop) zooms the
whole grid down and back, within its limits" ran out of time at 31.8s and again on its retry at 32.0s. The run of the next commit,
`f5c1b0046`, passed it with everything else. D84: a Leave War desktop timeout gets one re-run, not an investigation — the next run
was that. **To do:** if it fails again, make it wait on what it needs, not on time (D87), and measure its length on GitHub's machines.
**Place:** low — watch.

### [VEILED-WINDOWS-BAR] The other veiled windows keep the bar covered; three things do not close on Escape (found 30 Oct 26 by [TRAFFIC-WIN-COVERS-UNDO]'s roll-call; older; low)
**His answers, 5 Nov 26 ("Go" — the mock-up page's questions 1 and 3): D1645** — the bar stays pressable over "Jump to a date", the day-details window and the document viewer (the input window and the question boxes keep it covered); **D1647** — on View-only Sched the Traffic window is the read-only list for everyone. Building the night of 5 Nov 26 on `claude/keyboard-windows-batch-5eff45`.
**The Escape part BUILT the night of 3 Nov 26 (commit `e76f32440`):** the board's small menus (and the duty role list, built by the same menu), the Traffic window and the day-details window close on Escape, newest first, the board staying open, the keys back on their button; a Traffic line being typed is saved as ✕ saves it. Which windows cover the top bar is unchanged — that part stays open. The report: `raptor-port/docs/handpass/2026-11-03-week-swipe-keys.md` §1b.
Every window drawn on the `.airpop` veil covers the top bar (or the board's bar) as the Traffic window did. Its roll-call, in `raptor-port/docs/handpass/2026-10-30-board-escape-traffic.md` §2: the day-details window (read only), the schedule's own input window, the document viewer and the week calendar could take the Traffic window's way (the veil from the bar's foot, Undo and Redo free, any other bar control closing them first); the question sheets (the OIL question, upchit, "covers other days", no medical document, the medical clash, the cancel-reason and Sort all dialogs) must keep it — a change behind an unanswered question is what they exist to stop. D641 does not plainly cover any of them (its windows are the calendar job's, with no veil), so none was changed. Also not closing on Escape, met by the same check: the Traffic window and the day-details window (neither holds the keys — the [WINDOWS-KEEP-KEYS] kind), and the Scheduler Board's small menus (+ Block, Templates, the plans selector, a jet's stores, + Wave — `ui/board.ts popMenu`); with any of them up, Escape now leaves the board open. Also met, not judged: on View-only Sched an admin's Traffic window is the editing one (its boxes, Add row, ✕) — a page that changes nothing otherwise and carries no Undo (D347); whether that is meant is to be checked against the rulings before it is called a fault. **To do:** for each window, the agent's call by the window rules, a test first; the menus close on Escape, the keyboard back on their button. **Place:** low — with the next windows job.

### [SCHED-CTRL-Z] The schedule pages have no Ctrl+Z (found 30 Oct 26 by [TRAFFIC-WIN-COVERS-UNDO]'s build)
Only the Tracker answers Ctrl+Z and Ctrl+Y (`raptor-port/src/tracker/app/core.js`, D372). On Edit Schedule, View-only Sched, the Scheduler Board and the other pages of the app, Ctrl+Z inside a box is the browser's own undo of that box's typing, and anywhere else nothing — which is why the walk of 21 Oct 26 found "Ctrl+Z inside the Traffic window does nothing". **A question for him (D994 — not put until he says):** should Ctrl+Z / Ctrl+Y (⌘Z on a Mac) press the top bar's Undo / Redo everywhere, leaving a box's own typing undo to the box while it has the caret? Recommended: yes — the schedulers work mostly at a desktop and want to be as efficient as possible (D820), and the Tracker already does it. **Place:** with the next keyboard batch, on his answer.

### [REST-FIRST-CREW-HINT] Empty formation gives no predictive crew-rest hint for its first occupant (found 2 Oct 26)
Rally runtime evidence: an empty Wednesday formation resolves reporting to Tuesday11:00, but Ranger gets no pre-placement rest hint. First assignment correctly raises9h crew rest against Monday's overnight endingTuesday02:00. A different remaining crew member supplies a sibling and Ranger's hypothetical placement then correctly gives clearance14:00. Removal restores the missing-first-hint condition. Baseline query contract and a dedicated test explicitly return null for an empty formation; this is existing behaviour, not a new Rally regression, and is not exempted as stored-demo-only harm. The broad guide claim that the query never disagrees has been qualified in `raptor-port/docs/engine-rules.md`.
Independent bounded cause/disposition: `raptor-port/docs/superpowers/plans/2026-10-02-rally-empty-formation-triage.md`. Possible repair: construct the hypothetical first leg through the shared day builder on a copied day, then use the existing rest probe; never duplicate reporting/date arithmetic. Replace the pinned empty-formation contract deliberately with regression coverage and an independently challenged scoped plan. Owner has not approved this repair or limitation. **Place:** caps and ops limits batch under D495; final Rally inspector must judge its declared scope, not assume universal picker/post-drop agreement.

### [SANS-PREVIOUS-REPORT-OFFER] Prior-date availability is not combined across a previous-evening reporting window (characterized 3 Oct 26)
Actual I2 walk on the Rally review-fix snapshot: Tuesday01:00–11:00 flying reportsMonday22:00, dekitTuesday11:30. Kraken's MondayPM Fly offer gives the actual armed picker "no availability filed for today"; accepted placement has no persistent SANS_AVAIL warning under the existing none-offer rule. Adding TuesdayAM Fly gives picker00:00–12:00-only and the same placed advisory: the target-day window cannot cover report−120 through690. The two date-specific offers are not combined. This characterizes the prior-date gap named unproven in Claude's small review; it does not assert cross-date support, invent coverage policy, or treat live writes as stored-demo harm. Evidence: `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`, downstream07 results/pictures in this round's portable proof. **Place:** caps and ops limits with availability under D490/D495; owner policy/design and a scoped independently challenged plan precede any repair. No source change or owner acceptance here; the final Rally inspector judges this explicit scope.

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

### [MED-ROOM-DRAGGED] The Medical tab's room stays for a window dragged away (found 8 Nov 26)
**Found by both code readers of chat 7** (Astra, `raptor-port/docs/superpowers/briefs/2026-11-08-chat7-inputs-read-astra.md` (1),
and the fresh Opus reader): the Medical tab makes room for the input window (D1300, `.med-room`, `16-medical.css`), but a window
he has dragged away keeps its place for the session, so the cards stay squeezed AND covered. **Fix:** as the Inputs list's of
8 Nov 26 (`06-inputs.css`): the room only while the window stands where it opens — `body:has(.floatwin.inpedwin:not([data-placed]))`
before the room's rules; a browser test that drags the window away first, red. **Place:** with the next Medical or Inputs batch.

### [INP-ROOM-TIDY] Tidy-ups the code read of 8 Nov 26 filed
**Filed by the fresh Opus reader of chat 7, not fixed (D489):** (1) the room's size (the window's 430px, its 16px) is written in
both `06-inputs.css` and `16-medical.css` — one variable would keep them together; (2) `.ib-sub .ib-expand`'s font size and
line height (`25-inputs-calendar.css`) styled the typed mark and now style nothing. **Place:** with [MED-ROOM-DRAGGED].
### [LW-READS-OWED-1024] Fresh reads owed from 24 Oct 26
**25 Oct 26 (the night): the reader of D1305–D1355 and lessons 45–54 RAN** — `raptor-port/docs/handpass/parts/lw-1025/reads-1305-1355.md`; its short-line and full-row findings and lesson 54 fixed the same night. **Left:** lessons 49, 50 and 52 (each claims a little more than he said — the fix worded in that file), and D1297's sweep of earlier evidence sheets with its reader.
One fresh, blind Opus reader of the short lines of D1305–D1334 against their full rows (D138) and of design lessons 45–53
against his words (D941); and D1297's sweep — each earlier evidence sheet's "found at his look" fault given a §7.11 lesson where
the walk missed it, then one fresh reader of §7.11's lessons. **Place:** with [LW-ROUND3-BUILD]'s code read, or before it.

### [LW-BID-BUBBLE] The bubble after a bid (his question, 24 Oct 26)
Put to him on https://claude.ai/artifact/CaQkNnknq7J57JvDKMj5Gg as Q3 (drawn by `raptor-port/scripts/handpass/lw-pick-look.mjs`):
recommended red when any row turns red, a row a line, before → after. Not answered. Since then his D1313 / D1314 put the day
line's rows side by side and only amber or red (design lesson 50 names the bubble as a place it would apply), so it is redrawn
with those in place before it is asked again (D1301's step 4). **Place:** after [LW-ROUND3-BUILD].

### [OIL-INERT-WHY-CX-INFO] A cancelled or ⓘ row's reason in OIL Earn (walk find, 8 Nov 26 — chat 5, `claude/pr-oil-earn-ffbf07`)
W2's A21 (pictures `raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/``w2/s21-*`): in OIL Earn a tap on a man on a cancelled (CX) or information-only (ⓘ) row says
"Nothing changed for <callsign>. This row gives him no working hours to count OIL from." — while the row shows its times
(09:00–11:00). As ruled: D1783's full row gives every "nothing measurable to earn from here" case that sentence, and a
cancelled or ⓘ row gives him no working hours. **To do, if he wants it:** a reason of its own — recommended "This row is
cancelled." / "This row is information only." (`ui/oilmode.ts inertWhy`). **Place:** low — his question with a picture,
with the next OIL Earn change.

### [OIL-EARN-WORDS-LEFT] Two OIL Earn wordings never put to him (seen building D1782, 8 Nov 26 — chat 5)
(1) The passing note after "No OIL earned" is switched off: "This day can earn OIL again, and the marks underneath are
back" — "the marks underneath" names nothing he sees by that name; recommended "This day can earn OIL again. Each man
earns as he did before." (the bar's own note, D1782). The "on" note, "Nothing on this day earns OIL, including anything
added later", reads plainly. (2) An event's OIL mark under the switch says, on hover, "the day blanket is on"
(`ui/oilmode.ts` near the item's title) — "blanket" is the code's word; recommended "the day's No OIL earned switch is
on". Pictures: `raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/``w1/W1.3-pc-slider-off-now.png`. **Place:** low — with the next words pass or OIL Earn change; his
look first (D836's guide).

### [LOGIC-SWITCH-RING] The Logic page's switches wear the browser's keyboard ring (seen 8 Nov 26 — chat 5)
The board's "No OIL earned" borrows the Logic page's switch (`01-logic.css .lgmix`), which sets no keyboard ring; the
board's was given the app's cyan one (D1646, walk find W1.4, `18-oil-board.css`), so the Logic page's own switches now
differ from it under the keys. **To do:** the same `:focus-visible` ring on `.lgmix input` — a one-line match, shown to him
with its picture first. **Place:** low — with the next Logic or consistency round.

### [BOARD-DESKLAYOUT-DAYBAR-EDGE] On a phone, the desktop layout's day bar buttons stand off the right edge (walk find, 8 Nov 26 — chat 5)
W1's A27 (`raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/``w1/A27-phone-desktop-layout.png`): in the Scheduler Board's desktop layout on a phone (⋯ → desktop
layout) the day bar spans the day's desktop width, so Templates and OIL Earn sit past the screen's right edge — measured
on `main` at 650–818 on a 402-wide screen (this branch 616–818, the marks' width); the phone layout's bar has neither
button, so in that layout they are reached only by panning sideways. Older than D1793. **To do, if he wants it:** keep the
two buttons in view (at the bar's left, or stuck to the screen's right) — drawn for him first. **Place:** low — with the
next phone-board change.

### [OIL-WINDOW-FOOT-SHAPE] The ALL AVAIL window's foot keeps the old shape for an inert man (code read, 8 Nov 26 — chat 5, `claude/pr-oil-earn-ffbf07`)
F6 of the fresh Opus read (`raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-board-read-opus.md`): in OIL Earn a tap on a man who cannot earn in the window's OIL half sets its foot to
"<callsign> — <reason>" (`AvailWindow.tsx onBody`, from the seat's title); the board's own tap now says "Nothing changed for
<callsign>. <Reason>." (D1783). D1783 is worded as carrying the rule to the board; Astra's scenario 3 saw the same and did not
call it a fault. **To do, if he wants the window too:** set the foot from the seat's `data-oilsay`, the title as the fallback.
**Place:** low — his question with a picture, with the next OIL Earn change.

### [OIL-ROSTER-TAP-SELECTS] In OIL Earn the crew list still picks a man (code read, 8 Nov 26 — chat 5)
The Opus read's negatives (`raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-board-read-opus.md`): a tap on a man in the board's crew list (`#sbRoster`) in the mode still picks him — the
new placeholder guard leaves the list out on purpose. D65's "inside the mode no tap selects" read literally would reach it;
D1783 speaks of a man's puck "on its row". **To do, if he wants it:** his answer first — the crew list is how a seat is
planned, so picking there may be wanted in the mode. **Place:** low — his question.

### [OIL-SWITCH-NOSAVE-SHOW] "No OIL earned" could show the opposite of the day after a press that saves nothing (code read, 8 Nov 26 — chat 5)
F5 of the Opus read (`raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-board-read-opus.md`): the switch is a checkbox the browser ticks before the board's handler runs; the screen comes right
only because the bar is drawn again. A press the handler drops before the switch's branch (a stale preview, not in edit mode),
or a save the store refuses (`toastFail`, which never fires today), would leave the box showing the opposite of the day. Not
reachable today. **To do:** `e.preventDefault()` as soon as `boardMbtn` finds the switch, so the box always shows the day
after the redraw — with a test that a refused press leaves it as it was. **Place:** with the database step's failed-save work.

### [OIL-EARN-BOARD-TIDY] The code reads' tidiness notes on the OIL Earn board change (D489 — filed, not fixed; 8 Nov 26 — chat 5)
From the three reads (`raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-board-read-{astra,sol,opus}.md`): the inert
wrap is built in two places (`oilInertWrap` and `oilSeatHTML`), and `oilSeatHTML` calls `inertWhy` twice for one puck;
`EVENT_EARNS_NOBODY` is a constant in `board.ts` while `AvailWindow.tsx` keeps its own copy — one export beside
`DAY_EARNS_NOTHING` would serve both; `.mbtn.daybtn` has two rules in `18-oil-board.css`; the placeholder's day-switch
refusal is reached by two branches of `boardArmClick`; `sbInpRow`'s puck line nests two arrow functions called on the spot
inside a ternary — a named `inner` would read straighter; the switch's keys put-back hand-rolls what `sheetfocus.ts`
`locate` / `keysBack` do; `inert.dataset.oilsay || ''` would toast an empty note if the attribute were missing; `.mbtn.oilblank.on`
and `.mbtn.oilbtn.on` in `18-oil-board.css` have no user. **Place:** low — with the next OIL Earn change or the tidiness audit
before the database step (D486).

