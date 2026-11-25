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
  - **Night 3 (no app change):** (7) the checks — [CI-SMOKE-TIMEOUT], [SHELL-SCRIPT-GUARD], [MERGE-ONCE-RECORDS] (live 9 Nov 26, "merge
    live"). (8) documents — [RULINGS-SPENT-PASS], [CAL-JOB-LEFT], [LW-READS-OWED-1024], [WORD-LIST] (done 10 Nov 26 — chats 50, 53, 54; the "Done once" rulings archived on his D1970). (9) the folder —
    [REPO-TIDY] (1), [MAIN-CHECKOUT-STALE] (2).
  - **The pictures round for him — done:** drawn 7–8 Nov 26, answered 8 Nov 26 "All as recommended", built and live 8 Nov 26 by
    its plan (`raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`, which names each ruling); every item of it
    archived (the last two, [SCHED-UNAV-PENDING-MARK] and [READONLY-WEEK-WORDS], on 10 Nov 26, chat 50); round 5's leftovers
    stay in [UI-CONSISTENCY-LOOK].
  - **His two answers (5 Nov 26):** React Doctor skips the mock-up pages and the original app, the tests' and scripts'
    notes left (D1716 — the setting with job 7); fixes first, the pictures round after (D1717).
  - **Started 7 Nov 26, on Opus (D1732):** [RULES-DIET] — the rules diet: plan v3 APPROVED 7 Nov 26, "As recommended" (D1735–D1738); steps 1 and 2 merged 7 Nov 26 (pull requests 656 and 657); step 3 (reading by section) merged 7 Nov 26, pull request 658 — about 7% of a job's read saved, not the plan's three quarters of the three reads; step 4 (the every-chat layer) merged 8 Nov 26, pull requests 663 and 665, his answers on it (D1760–D1762) pull request 671; step 5a (OIL as a page, the full trial) merged 8 Nov 26 on his "merge live", pull request 684, read blind by Astra and a fresh Opus reader; the IT guide as a page merged 8 Nov 26 on his "merge live" (chat 15, pull request 690), read blind by both; People & accounts as a page merged 8 Nov 26 on his "merge live" (chat 17, pull request 700), accounted and read blind by both — it loads with files most jobs open, so the re-measure counts it and narrowing its `paths:` is a question for him then; the scheduler's D212 stale clause (a member may tick SCHEDULER, since D1651) goes with the scheduler's page in 5b; the screen-design rulings as a page merged 8 Nov 26 on his "merge live" (chat 24, pull request 708), accounted and read blind by both — it loads with every file of the app's code, so the re-measure counts it; for 5b, the Inputs pages' D1300 "cyan ring" (the mark is the one blue) and the scheduler's D1038 row's "Not built" (it is drawn); the Tracker as a page built (chat 34, pull request 714 — merged 8 Nov 26 on his "merge live"), accounted and read blind by both, D191 against D1005 filed for him as [TRK-TYPED-STUDENT-Q] and answered the same day, his D1931 (no student added by a typed name; the build filed as [TRK-NO-TYPED-STUDENT]); **STOPPED 8 Nov 26 (D1932): the five area pages came out about twice their old lists' size (82,706 → 160,224 characters; How we work alone shrank, 59,493 → 37,952) — five tripwire raises, none reported to him plainly. Next, before anything else of the diet: the fix, by Fable 5.1 on his call — each page back under its old list's size, no rule dropped, the tripwire a hard limit; the plan is chat 34's handoff block.** Only then the re-measure before 5b. **Since: the fix done (chat 36), the re-measure reported, and step 5b LIVE 9 Nov 26 — the Inputs pages (D1943), the scheduler (D1944, pull request 730) and the Leave War (D1947, pull request 732), each read blind by Astra and a fresh Opus reader; every area is now a page. Step 6, the final measure, done 9 Nov 26 (chat 47; the plan's §Step 6): a job's whole read down 13–25% (Leave War 359,657 → 303,218 tokens, scheduler, Inputs and Tracker about −25%, notes −13%), far short of the plan's forecast; the rulings files 168,117 → 116,389. Next, on his word: whether the diet ends here or takes one small follow-up (the scheduler page no longer loading with the performance guide and ripple map in Leave War and Tracker jobs, about 31,000 each; the handoff's merged blocks filed and removed).**
  - **Done (his D1949, 10 Nov 26):** the diet's one small follow-up LIVE 10 Nov 26 on his "merge live" (chat 48, pull request 735) — a Leave War job about 265,000 tokens, a Tracker job about 230,400 (the plan's §Step 6; archived). Left in `[RULES-DIET]`: stating once what both the general page and a checklist state (D1762) — taken 24 Nov 26 on his go (D2460), chat 158: the every-chat rules tightened, one small job — LIVE 24 Nov 26 on his "merge live" (pull request 833; read blind by Astra and a fresh Opus reader, the fixes read again; the measure and every finding: `raptor-port/docs/superpowers/briefs/2026-11-24-rules-tighten-findings.md`): a chat's start 36,977 → 31,686 tokens. **Offered to him the same day, each his to call, none started:** the notes the agent keeps about him on his PC (about 4,000 tokens of every chat's start) tightened — no merge needed; `AGENTS.md`, written for Codex, also loading into every Claude chat (about 1,900 tokens); the two-squadron build's read lines of the general page §Models and readers moved behind a pointer as the other when-needed lines were. **Next chat number: 159** (157 unknown — check the open branches); **next free ruling: D2461** (chat 158 held D2460–D2479).
    Found by its step 3, low, the agent's: [BUGCHECK-LESSON-ORDER] — the bug-check order's lessons put in order, the second 23 inside them — done by the skill review of 10 Nov 26, archived.
    Found by its step 5a (People), medium, the agent's: [DOCSIZE-PATHS-OPEN] — a rules file whose `paths:` list is never closed passes the document check, its page checks skipped — BUILT 10 Nov 26 on `claude/docsize-paths-open`, live on his "merge live".
  - **Live 14 Nov 26 on his "merge live" (checked 17 Nov 26):** (a) the batch of four — the small schedule-and-board fixes (pull request 756), two Quals faults (758), the Leave War double tap on its other windows (759), the Approvals page on a PC (763) — merged by its one branch, `claude/batch-ready4-1114` (pull request 776); (b) the rules check — its fixes, words and D2005 (pull request 762), with the report (757) and the browser checks in Playwright's own image (761); his answers D2002–D2026 are on `main` with it.
- **Then (D495, D585; his order D2086, 16 Nov 26, changed 17 Nov 26 by D2186, D2187):** the multi-squadron and detachment
  BUILD now, in batches, each batch's agreed design and mock-up shown to him before it starts ([MULTI-SQN-DESIGN]; D2187, D2188);
  caps and ops limits PAUSED until he calls for it ([CAPS-OPS-LIMITS], D2186 — its design round 1 and eight questions kept), then
  the Tracker expansion with the Tracker's small fixes ([FEATURE-WISHLIST]), then one whole-app check; the Tracker's
  progress graph still waits until he releases it (D774).
- **At the end (D473):** the database step — the "Database step" group below.
- **ChatGPT is back on a Pro plan (D1734, 7 Nov 26) — Astra the standing reviewer again (D1770, 8 Nov 26), Sol 6.1 on his word:** the reads owed in [NO-ASTRA-LIST], each his to call (D761).
- **Before any collaborator is added:** the checks runner comes off this repo ([REPO-PRIVATE]).
- **His step:** the repo is public today for a short period (D106); making it private again, and restarting his PC's check runner, is his ([REPO-PRIVATE]).

**Schedule and amendments**
- [SIM-OVERLAP-WARN] — two sessions overlapping on one sim raise no warning; D2181: warned. Drawn for him first, then built with the schedule's next batch.
- [ENGINE-RULES-REVIEW] — the whole rules engine reviewed rules-first, ruling by ruling with a test each, a report for him (his D1983) — the night of 11 Nov 26, on Fable 5.2.
- [DAMAGED-WEEK-LEFTOVERS] — a week whose saved copy cannot be read still prints and exports the demo days, shows them in the next-week preview, and refuses a person's delete in the amber note, not the grey "Blocked:" one (older; found 8 Nov 26, chat 13's walk).
- [SCHED-MARKS-WALK-ODDS] — four small older things chat 13's walk saw: the changes window's foot says "Tap a change to go to it." over a line that cannot be tapped; the look banner on two lines on the phone board; "2 warning" beside the board's "2 warnings"; a day's "N changes" chip beside "N pending". Parts (1) and (3) go live with the batch of four (pull request 756); (2) and (4) are left, drawn for him first.
- [SCHED-MARKS-ASKS] — five small points chat 13 left open: two readers' readings and one wording to put to him, the design check's flag on the section side-bars, a warning's hide ✕ under the keys never checked.
- [BLOCK-MENU-BB-DESK] — the "+ Block" menu calls the built-in Standard block "BB desk"; a small fix for later, the right name put to him with a picture (his D2021, 13 Nov 26).
- [RULES-CHECK-LEFTOVERS] — what the rules check's fixes left: D2005's known limits, the published-version picker's missing "Original", the Logic page's word-for-word record and four small checks not done (two done 17 Nov 26 on `claude/sched-small-fixes`: the walk scripts' amber words, the end-to-end test); low, the schedule area's next batch.
- [STANDBY-NO-TIMES-SEAT] — a WSO or ground crewman in an AVALON or BB front seat with no times raises no "Illegal seat" line (an ordinary flight does); found 16 Nov 26, older code, the scheduler's next batch.
- [INPUT-WIN-SCHED-ASKS] — the schedule's input window closes on Escape or ✕ without "Close it and lose them?" with words typed (the Inputs page's window asks); the same on `main` — his question: does D1622 cover it too (recommended: yes).
- [SCHED-SMALL-TIDY] — a code read's tidiness note on the schedule's small fixes (D489): two lists of names kept side by side in the schedule's tap code; filed, not fixed.
- [INSET-DAYS-ENTER-ONLY] — the Inputs calendar settings window's "days before" box keeps a typed number only on Enter; Tab or ✕ quietly keeps the old one; seen 15 Nov 26, older code — a small fix, its behaviour put to him.
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
- [SANS-CHIP-ON-SANS] — the Post out sheet offers the "SANS" chip to a man already SANS; D2163: not offered for him (small fix, no answer needed; the next Leave War batch).
- [LW-FOUR-ITEMS-LEFTOVERS] — what the four Leave War items (pull request 801, live 17 Nov 26) left for him: five like-for-like suggestions and three departures from the drawings — questions kept until he says (D994), pictures first.
- [MSQ-FIXREAD4-OPEN] — fix read 4's claims 1–4 done (19 Nov 26, chat 111: `ebbd4aea6`, `5b8357f92`; his question answered by D2218); claim 5, the month landing on a desktop, done in its own session (chat 112, `claude/lw-monthjump-click` to `44426c5c0`, merged in); a fresh read of the claims 1–4 fixes and of claim 5's last commit still owed, before pull request 806 merges.
- [LW-APPROVALS-PHONE-FLAKE] — a Leave War phone browser test ("the grid shown again after Approvals…") fails about 2 runs in 6 under load, alone 4/4, the same before and after the month-jump fix — a test to steady (19 Nov 26, chat 109).
- [LW-BAL-TAB-NEXT] — on Balances, Tab after typing a figure goes to the Balances tab button, not the next box (the figure is kept); seen on the four items' re-walk, its code unchanged from `main` — to reproduce on `main`, then fix or put to him.
- [PAGE-FAULT-BLANKS-APP] — a fault inside the Leave War or the Tracker (not a failed download, now caught — D1631) still blanks the whole app; a message for it is a new screen, drawn for him first.
- [KBS-LW-SHEETS] — the Leave War's sheets and bid windows place themselves the moment the phone pans for the keys; by the keyboard job's reading the same jump-then-slide class D1412 forbids; drawn for him if he sees it there (named under D852, 27 Oct 26).
- [LOAD-MOVES-ROW-DAY] — a load of one day can move a several-day course's row onto another published day (its start day) — a question for him with pictures (D994), older.
- [LOGIN-OPENS-TODAY] — his D1383: before the app goes out for testing, signing in always opens on today's date; not now (demo data).
- [LOGIN-NOT-AT-TOP] — after signing in on a phone the page now opens at its top (live, pull request 569); his iPhone look owed, then archive.
- [LW-NIGHT1025-OLDER] — only (b) is left, with the database step: (d), (f) LIVE 6 Nov 26 (pull request 646); (c) LIVE as his D1720, D1722; (a), (g) done earlier.
- [LW-PICK-HELD-MARK] — the tapped day's cyan mark (D1289) BUILT 28 Oct 26 with [LW-WHOLE-LEAVE-WINDOW], and the phone's scroll (D1290) built in M3; left: whether the one-day window can be shorter — pictures to him first.
- [INP-CAL-CLICK-BEHIND-NEW] — on the Inputs and SANS calendars a date clicked behind a new input's window lights as picked while the window keeps its date (his D1298); his choice of what it does first.
- [LW-PO-DAYS-DRAWING] — his D1720 (6 Nov 26): BUILT and walked on `claude/lw-faults-1106` (pull request 646); close once live.
- [LW-FULL-EDITING] — his D1724: every entry on the Leave War moved, deleted, its days and remarks changed there; a day of several entries opens the window that adds more; drawn first, then a FULL check; brief `raptor-port/docs/superpowers/plans/2026-11-06-lw-full-editing.md`.
- [LW-DOUBLETAP-LEFTOVERS] — what the double-tap job's reads filed, all low: tidiness, an older list that hides but stays open, the first period's Create, a slow close, a load-sensitive test, a test case, two document notes (15 Nov 26; the next Leave War batch).
- [APPR-OLDER-ODDS] — four small older things the Approvals job's walk and reads saw, each the same on `main` (low, the agent's): pressing the chip already lit jumps the list to its top; Approve all's left edge moves up to 6.8px with its count; a name's puck tap does nothing on a PC; an empty range hides the column headings.
- [LW-ROLLBACK-FOCUS] — a refused war change still puts back the jump-to-a-day state, so the grid can jump back after one (low, needs its own look).
- [CHAT72-LEFTOVERS] — small notes the three jobs of 14 Nov 26 left (all merged that day): about a dozen Leave War looks never shown, for him later; three guide wordings for the drawing helper; the readers' tidiness notes (low).
- [LW-BID-BUBBLE] — the bubble after a bid: his question, waiting (the pick-look page's Q3); redrawn with D1313, D1314 in place before it is put to him again.
- [INP-HEAD-SORT-READER] — the Inputs List's column headings sort from the keys since 6 Nov 26, but a screen reader is not told a heading can be pressed; the fix, a button in each heading, changes its look — a picture first (low, with the keyboard sweep D807).
- [QUALS-HEAD-SORT-KEYS] — the Quals table's headings sort by a click only; the keys cannot reach them (low, with the keyboard sweep D807).
- [WALK-SCRIPT-UTF8] — a walk script saved partly in another letter coding made the code check fail (6 Nov 26); a line in the walkers' brief guide that scripts are saved as UTF-8 — a guide change, on his word.
- [LW-OVERHAUL] — the Leave War's overhaul (D1140): M1–M4 live (pull requests 566, 567, 569, 581; follow-ups 571–573, 582); M5 PLANNED 28 Oct 26 (`raptor-port/docs/superpowers/plans/2026-10-28-lw-m5-plan.md`) — its four rules and the split answered 28 Oct 26 (D1472–D1475: M5a, balances, then M5b); M5a's drawings all answered 28 Oct 26 (D1479–D1489); M5a built and FULL-checked the night of 28–29 Oct 26 and live on his "merge live" of 29 Oct 26 (pull request 586; his drawing picks D1493; left for his iPhone: a tapped box above the keys, no page zoom on a tap, the number keys' minus, the slide and pinch, My leave with three figures, the "Saving…" note); next, M5b in a fresh chat (D1475) — its drawings in the app's own design (D1496) and its build run through the drawing check (D1495, walk-scripts §10). **M5b round 1 drawn 29 Oct 26** on `claude/leave-war-m5b-iphone-balances-1402b7` (`full-m5b-draw.mjs`, pictures `full/m5b/`): the Settings window, the Events list, holidays by file with its preview, Management on Quals — four questions on https://claude.ai/artifact/F8PHq6k2bTBMS3ukL8qykH, **answered 29 Oct 26 "All as recommended" (D1499 Settings, D1500 the Events list, D1501 holidays by file — public holidays and Off days only, D1502 Management already on Quals)**; **M5b's build spec written and M5b built 29 Oct 26** (`raptor-port/docs/superpowers/plans/2026-10-29-lw-m5b-build-spec.md`; the drawing check green, 10 states); FULL-checked (`raptor-port/docs/handpass/2026-10-29-lw-m5b.md`); then D1510 and the Events list's split (D1512–D1517) built and checked (§10, §11); **all live on his "merge live" of 29 Oct 26 (pull request 588)**. All six of D1250's merges are live (M5b the last — D1475); the rulings files' tripwires raised 29 Oct 26 (D1262). Left: what his iPhone look owes M5a (above) and the overhaul's own leftover items in this list.
- [LW-EVENTS-LANE] — parked: a better way to show the Leave War's events (round 21's study, B an events lane recommended) — not put to him until he raises it (D1259).
- [NOTIFY-REGISTER] — the register of notifications (D1151) is written; its six proposed lines (P1–P6) wait for him to keep or strike.
- [HUMAN-RETEST] — the last re-test left: the Leave War links, with the 7 Sep phone check.
- [MULTI-SQN-VIEW-ONLY-TABS] — by his D2381 (23 Nov 26), a View holder with that squadron picked is offered only its View-only Sched and Help; by his D2382, the ☰ menu opens with the TALON mark as the squadron drop-down; drawn for him first, then built on `claude/msq-b1-screens-135`.
- [BACKLOG-ORDER] — his order of 21 Sep 26 for after the re-test: [LW-LOCKMARK] (done 31 Oct 26), then [LW-WEEKDAY-WORK], then the database.
- [MULTI-SQN-DESIGN] — one app, one database, many squadrons: home squadron at account creation, view-only rights to others, transfer on posting out, a day split between squadrons (his D1695, 5 Nov 26), with detachment modes — the design answered whole 17 Nov 26 (rounds 1–7, chats 90–104); its BUILD now, in batches, before the database step (D2187, changing D2086), each batch's agreed design and mock-up shown to him before it starts (D2188); the batch plan written and red-teamed (chat 106, `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`); batch 1's page put to him, waiting for his look. **Batch 1 steps 0–4 built on `claude/multi-sqn-b1-107` (pull request 806, draft) the night of 17–18 Nov 26 and FULL-checked; NOT ready to merge: the last reads (18 Nov, 09:00–09:41, `raptor-port/docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixread2-{astra,opus,security}.md`) left open faults to fix red first — the last-admin lock and master guard skipped by person-only and home-only changes, the gate's account list read differently from the loader's (a re-keyed or colliding row), a plain admin able to suspend or demote the master, a 142 admin able to post a 149 man out or touch 149's history, the master's Archive / Restore / Delete of a 149 man acting on 142's Leave War, a new 149 man losing his post-in date, inputs not checked by squadron at the gate (`…-fixread-opus7-open.md`); and, by his D2205–D2207 (18 Nov 26) the eleven open questions as recommended (only a master changes a master; sign-in held for a pending save; four cross-squadron bell lines; holiday OIL by one's own list; "142's" dropped from the holiday warning; the code-check pull request to `main`); by his D2203 (18 Nov 26), a move to another squadron clearing every View and Plan held of others; by his D2202 (18 Nov 26), a planner's bell carrying the other squadron's admin lines, on by default, each line showing its squadron; by his D2200 (18 Nov 26), each person to choose which notifications reach his bell, a few that need action always on — a job after the multi-squadron batches, drawn first; by his D2192 and D2199 (18 Nov 26), step 1's 'admin' level for a right in another squadron kept only as "Plan" — full access to that squadron, as its own admins (D2201) — given person by person by a master admin, off by default — otherwise View only; by his D2195 (18 Nov 26), each squadron's own public-holiday list, never shared, and by his D2204 a detachment's own list, which may start as a copy of its squadron's — step 4's holidays by place undone, the Holidays form naming only its own squadron's days, no holiday bell to the other squadron; by his D2196 (18 Nov 26), only a master admin sets the time zone of a place more than one squadron sits on — the place's save refused for anyone else; by his D2197 and D2198 (18 Nov 26), a master admin's menu pick moves every page, each his to edit, his bell his primary squadron's by default; his idea of a master-set access table (per squadron, per role, per page) and of each person choosing his own notifications — answered by chat 108 with a recommendation, his ruling awaited, nothing built; then steps 5–6.**
- [FABLE-READ-FAULTS] — seven of eight fixed, OIL F2 built (D2294, D2299), walked and re-walked on `claude/fable-read-faults-4104f0` (pull request 820, chats 133–139); his look and "merge live" owed. His answers of 22 Nov 26 (chat 139): D2313 (SANS from its date everywhere — closes (e) and (b)) and D2314 (the publish note's names) BUILT 22 Nov 26 on `claude/sans-from-date-139` (chat 140, pull request 824), the bug check (FULL) and his look owed; D2315 (Leave War F2 waits for the database step), D2316 (the held name kept) as built.
- [MSQ-MIDNIGHT-CLOCK] — at the Transfer step, a roll-call of every window and page open at a man's midnight swap (band, close with a note, or refresh), and at the database step, which clock decides "today" (each device's own today; a detachment abroad meets it first).
- [NOTICE-UNDO-RETRACT] — every bell line retracted by the undo of what made it: unread goes, read becomes "… taken back · <who>" (his D1693, 5 Nov 26) — step 1 (the posting line) LIVE 5 Nov 26; step 2 (the input lines, the holiday's OIL line) open, his to place. — the posting line first, on `claude/postout-bell-look`; draw the new words first (D1625).
- [TOPBAR-BAND-ANCHOR] — on a scrolled desktop page the "Not saved" band covers the page's first 36px (the old build too; not on his iPhone).
- [REDUCE-MOTION-SIDEWAYS] — with "reduce motion" switched on in the phone or computer, the pinned dates row (and Quals' heading) may stop following a sideways scroll — read in the code, not yet seen on screen.
- [LW-WINDOWS-NONBLOCKING] — the war's other windows still block the grid behind them — which stay up is his choice.
- [LW-WEEKDAY-WORK] — the war cannot see ordinary weekday work — talk to him before building any of it.
- [LW-COMMIT-MANNING] — duty and commitments lowering the war's manning: parked "for now" (D998), his to raise.
- [LW-OIL-OPENING-AWARD] — at go-live: an opening OIL balance given as an award (D1255) shows on the grid as an FO / HO on its date and follows the OIL expiry rule — a question for him before the database step.
- [LEAVE-YEAR] — yearly leave balances and carry-over — ruled (D1218, D1224, D1229, D1234, D1235, D1473, D1474, D1489 — the other kinds keep their figures on 1 Jan), built with the Leave War overhaul's M5a.
- [LW-SORT-BY-FLIGHT] — sort the war by flight — his idea, not designed (D1001).
- [LW-UNDO-BLOCK-REOPEN] — with the database step: a member's Undo or Redo refused onto a day closed for him stays passed over until sign-out, even if an admin reopens the day from another device.

**Tracker**
- [TRK-MARKS-LEFT] — typed marks still in four Tracker messages and hints, and the Tracker's Export / Import drawings unlike Admin's; for the consistency look (found by chat 20).
- [TRK-MENU-KEYS] — the Tracker's course, syllabus and File menus wear the browser's white keyboard ring, not the app's cyan, and the arrow keys do not move through them, unlike the board's menus (found by chat 20's walk).
- [TRK-COPIES-TIDY] — the code reads' tidiness notes on [TRK-KEPT-COPIES] (D489), filed not fixed.
- [TRK-NO-TYPED-STUDENT] — no Tracker student can be added by a typed name (his D1931, 8 Nov 26): + Add loses its "Or type a callsign" box and adds nothing when the search matches nobody or nobody is on the roster; drawn for him first (D1625). Today it still adds a typed name, linked to nobody.
- [TRK-DOWN-DAYS-CANCELLED] — a cancelled medical input still counts toward a student's down days; left open for his look when the down days were built (18 Oct 26), carried by no item since.
- [TRK-LEAVEFLOW-DISCARD] — the Tracker's "Discard them and add (or rename) a course?" clears the unsaved mark without reloading the chart; a cancelled next prompt leaves the dropped edits drawn as saved (found 23 Nov 26, older).
- *(The Tracker's database-step items are in that group below.)*

**People, accounts and Quals**
- [MSQ-PLAN-AUDIT] — a dedicated check of everything built and planned for an admin with Plan of a squadron left out or let in wrongly, faults fixed before the reshape build; his D2242 (20 Nov 26).
- [MSQ-FABLE-REVIEW] — Fable reviews what it has not read: the kinds of sign-in together first (who edits, who only views, is each guarded), then the areas ranked by risk; his D2259 (21 Nov 26).
- [MSQ-FIXREAD17-OPEN] — fix read 17's, the core read's and the full review's 35 faults, all reproduced red, in seven cause families; his shape question first, then the fixes and one combined fix read (20 Nov 26).
- [MSQ-VIEWONLY-TRK-ASK] — with D2396 and D2400 (the questions (c)–(p) as recommended, their new words drawn and approved 24 Nov 26; (b) left as built), build D2637 (unsaved Tracker edits asked about before a pick of a squadron he only views); and D2389 (the member-view band's words on a held window), drawn first (D1625) — next, on this branch.
- [MSQ-TRK-FOLLOWS-PICK] — his D2395: the Tracker follows the squadron picked (no sign-out; its two bands go); a job of its own after [MSQ-VIEWONLY-TRK-ASK], FULL bug check.
- [MSQ-TOPBAR-LIST-KEYS] — the desktop top bar's "149 ▾" opened by the keys leaves the focus on the button, and Shift+Tab out leaves it open (older, found 23 Nov 26); with the readers' tidiness notes on D2381–D2384.
- [GUARD-RAIL-FIRST] — his D2404: the bug-check order's fix step asks "would a guard rail remove these faults?" before any patch; a working-guide change, read by Astra and a fresh Opus before his approval.
- [MSQ-PICK-GUARD] — his guard rail (D2403): a pick, or the switch to or from the member view, refused while a window is open, unsaved Tracker edits asked about at both; the refusal's note drawn for him first; on pull request 826, before "merge live".
- [MSQ-NIGHT-153-OPEN] — what the night of 24 Nov 26's last reads and walks left on pull request 826: two medium faults that let a Plan holder or master admin change a 142 input under a bar saying 149 (the OIL list, the bell's OIL line), the Tracker's press handling (medium and three low), five questions for him, three low faults; fix before "merge live".
- [ROLE-BOX-CUT-IPHONE] — on an iPhone, Admin → Users' Role box cuts "Admin — schedules and manages" off mid-word (found 22 Nov 26); fixed with batch 1's second half
- [ACCOUNT-STATUS-TOLD] — a person told on his own bell when his account status changes (D2251); drawn first
- [MSQ-FIXREAD10-LEFT] — what fix read 10 left: F (a bell line dated minutes ahead hidden for those minutes once a right is removed — for the database step, the server's clock), a war line's content field not checked, the GitHub browser-test flakes (the date calendar's glide; the Leave War phone's pinned dates row), a bell walk owed after fix read 13 (20 Nov 26); the code check cannot compare against main until pull request 817 merges (cause found 20 Nov 26); a remote-edit Undo note for the database step.
- [SEED-UNDO-DROPS-ACCOUNT] — with the demo's seeded people, an Undo of a seeded account's first saved change can take the account's own row with it (seen by fix read 9's builder, outside its brief; to reproduce first, 20 Nov 26).
- [LW-PINCH-FROZEN-WEBKIT-OFF] — Leave War, Safari's engine only: mid-pinch in with the dates frozen, the frozen date row read about 360 px off its columns (older — origin/main the same; found 31 Oct 26; maybe a reading, not a fault — a look first).
- [QUALS-PINNED-X-DEAD] — in Edit quals, scrolled down, the ✕ inside a pinned heading does nothing; the table's own ✕ removes the column (older; found by the walk of 11 Nov 26; small, with the next Quals job).
- [QUALS-DRAG-LEFTOVERS] — what the 11 Nov 26 Quals job found and left: two fingers on the pinned row do not zoom the table, no Escape cancels a column drag, the outline after "Check his quals" never ends while the page is open, and five smaller points (low, with the next Quals job; his iPhone look first).
- [USERS-ARCH-FOLD-DRAFT] — Admin → Users: folding the Archived group and opening it again keeps an archived man's editor open but puts its callsign box back to his name and disarms Delete — a typed rename lost with nothing said (older — `main` the same; found 8 Nov 26 by walker C; low, with the next People job).
- [LINE-ICONS-ELSEWHERE-ASK] — a suggestion kept for him (D852): other lists whose lines open only by a tap may want D1512's edit and cross icons too.
- [QUALS-COL-WAR-GROUP-ASK] — a question kept for him (D994): a member may tick his own Quals columns, so he can put himself in a Leave War group made from one (Management excepted, D1510).
- [UNDO-POSTING-RECORD] — Undo for adding, archiving and restoring a person and for postings (D350) — his word.
- [RECALL] — bringing an archived man back fresh into Quals — a future feature, his word.

**Insights and Logic**
- [LOGIC-IOS-REFOCUS] — on his iPhone, does the keyboard stay up when a Logic setting is saved by tapping the next box? (a check on his phone; found 21 Oct 26).
- [STACK-LEFTOVERS] — three small loose ends left (the Insights edges and the shared wording helper done 8 Nov 26): an old audit script's three checks (with its own job), a "back to last published" button (only if he raises it), one tidiness note — a line's callsign tidied in three places for the Blue/Red answer (with the next change to its role question).
- [LOGIC-SWITCH-RING] — the Logic page's own switches wear the browser's keyboard ring, where the board's "No OIL earned" now wears the app's cyan one — to match, his look first.

**Look, words and the phone (the whole app)**
- [VEILED-WINDOWS-BAR] — both parts BUILT and live: the Escape part 3 Nov 26, the bar part (his D1645, D1647) 6 Nov 26 (pull request 636). Left: on a PC an input's own window opens below the bar, which stays pressable, where D1645 says that window keeps the bar covered (seen 8 Nov 26, chat 28's walk) — to check against D1645, then fix or put to him (low).
- [SCHED-CTRL-Z] — the schedule pages have no Ctrl+Z (only the Tracker has one): a question for him, not put until he says (D994).
- [BOARD-OTHER-RINGS] — most other Scheduler Board buttons and its time boxes still wear the browser's own ring under the keys, not the app's cyan one: a question for him with pictures, not built (D1625).
- [BOARD-TAB-MENU-BUTTONS] — a walker found Tab never stops on the board's + Block, + Wave or a jet's stores, which D1646 says the keys reach: to reproduce, then fix or put to him.
- [BOARD-SIDEWAYS-SMALL-PHONE] — a question kept for him: on a smaller phone on its side (844 wide) the board's pinned bar is two rows, so the list above the keys is 101px, not his phone's 151.
- [BOARD-UNDO-LAND-ODDS] — what the board's Undo landing left after its reads and walk: nine small points — Redo of an input's date move goes to the old day, two changes that return unseen, the refused-Undo fix with unit tests only, a stale comment, the reads' tidiness notes, two touch gestures for his iPhone, a walk-scripts lesson needing his word, and the last box of the list resting under the passing note (a drawing for him first) (found 11 Nov 26, chat 64; low).
- [VH-SHEETS-IPHONE] — some phone pop-ups may be cut off by the browser's own bars — only after his iPhone look.
- [COUNT-CHIP-PHONE-TAP] — a finger tap on an ALL AVAIL count: fixed in the test browser; his iPhone look owed.
- [WEEK-ADD-TAP-PHONE] — on a phone, "+ add" on the week arms nothing when the row already holds someone — left out of the phone batch, his choice.
- [APP-FONTS-NOT-LOADED] — the app names fonts it never loads, so each device draws its own — his call.
- [ONE-RULE-SMALL-WORDS] — ten small sentences and marks that read oddly — for the words pass; two wordings his.
- [UI-SLEEK-PASS] — the sleeker interface (D765): the word rounds to round 4 are live; next the bell saying every change (D2600 — drawn for him first) and the look for the app's other counts (D2603); the rest page by page, on his word.
- [APP-SPEED] — the app's speed, his go of 24 Nov 26 (D2480): a hidden timing readout for the real slow computer first, then the week drawing the days in view first with both schedule pages kept ready, then no file re-checks on repeat visits; four more ideas wait.
- [PERF-RESIDUALS] — measured speed wins held back; two change wording or feel — his call.
- [ADMIN-DISPLAY] — an Admin "Display" area of fold defaults — not built without his go-ahead (D161).
- [CHAT66-OPEN-ROUND] — his answer to the night of 11 Nov 26's question 1 (the bell) and that night's small round of questions, put to him only when he says (D994).

**Checks and tooling**
- [CODE-CHECK-FILE-LIMIT] — pull request 826's code check is red since `main` came in: the tool leaves part of its check undone above 5,000 code files, and `main`'s walk scripts plus a branch's tip it over; leaving the walk scripts out of that check makes it run whole (tried, put back) — waits on his go; every branch will meet it soon.
- [DATECAL-GLIDE-TEST-FLAKE] — the date calendar's "a glide caught, held still, then dragged" test failed on GitHub in six runs on 17 Nov 26, each passing on re-run, in its setup's 28 quick arrow presses; first find out whether the app itself loses quick presses on a slow machine, then fix (pull request 802 waits, test-only).
- [LW-ZOOM-TEST-SLOW] — the Leave War desktop browser test "a pinch (phone) or Ctrl+scroll (desktop) zooms the whole grid down and back" timed out twice in one GitHub run (3 Nov 26, at 31.8s and 32.0s) and passed on the next commit's run; watch it (D84).
- [REVIEW-LAYERS] — his five rulings from the review-process page (D1407–D1411): the scorecard's baseline first, then notes-only pull requests merging by themselves, the secrets scan, the security read, the reader's test set. Steps 1 (the scorecard) and 4 (the secrets scan) built 31 Oct 26, not merged; two repository settings his to approve.
- [RD-LEFT-1108] — React Doctor's last 4 findings, in other areas' files (SansCal 1, SansDay 1, interactions 2 — the two in interactions fixed 17 Nov 26 on `claude/sched-small-fixes`) — each with its area's next batch; the 13 import cycles and People & accounts' 6 went live 8 Nov 26 (pull request 702), the Inputs and Medical 8 settled by chat 29 (pull request 707).
- [RECORDS-MERGE-SAME-ADD] — the settle step kept a skill note both sides had added word for word as two notes, renumbering one; found 9 Nov 26, settled by hand.
- [TRK-TRIAL-TESTS] — the Tracker trial's leftovers (D1941, D1942): the tests that would let 20 written-out rulings leave the Tracker's page, D1405 to archive, the other areas — each on his word.
- [SCHED-PAGE-LEFTOVERS] — the scheduler's page's leftovers (D1944): the changes window's group heading against his pick (D663), the tests for 28 written-out rulings, archivals and questions — each on his word.
- [LW-PAGE-LEFTOVERS] — the Leave War's page's leftovers (D1947): D1177's and D333's readings to keep as built, D1318 against D1211, the tests for 7 written-out rulings, archivals and stale reference docs — each on his word.
- [MAIN-CHECKOUT-STALE] — step 2 left: a guide line to bring the main folder level after a merge that touches settings, hooks or skills.
- [CI-BROWSER-DEPS-DOWNLOAD] — the browser checks run inside Playwright's own image, LIVE 14 Nov 26 (pull request 761); `main`'s runs green since. Left, not built: cover for an outage of that image's store, a font read-out from a bare machine, the image tag written once — with the next checks job.
- [REPO-TIDY] — the old worktrees cleared 10 Nov 26 (15 removed; five kinds kept on purpose and three folders left on disk, named in the item); left: those three, the 6 Nov night's three build folders after safety checks, and moving the walk pictures out (his call); 10 more copies and 90 GB of old chats' temporary files cleared 22 Nov 26.
- [LW-E2E-WRITES-EVIDENCE] — the Leave War's browser test re-draws two tracked walk pictures on every run, so they always show as changed (found 22 Nov 26, chat 134).
- [COMPACT-WHEN-MOD] — two of the compaction set-up's four checks still unseen — they need a chat that reaches 80%.
- [OVERNIGHT-RETRY-TRIAL] — the next /overnight night tries the keep-retrying setting (D885).
- [CI-FAIL-PICTURES] — GitHub's browser-test jobs keep no pictures of a failure — his call.
- [CHECK-TOOLS-HARDEN] — small hardening of the checking tools — his word.
- [TURN-END-CHECK-SLOW] — the turn-end backlog check was cancelled at its 20-second limit on most turns from 19 Nov 26: (a) its cause found and fixed 24 Nov 26 (36 seconds to 5), live that day on his "merge live" (pull request 828); left for his word: (b) the turn-end code check holds a turn about 43 seconds, (c) the lessons written into the superpowers skills are read by no chat, for the next skill review, (d) nothing says when a turn-end check is cancelled.
- [CSS-SCOPE-GUARD] — a rule begun at `body`, `html` or `:root` inside a page's wrapper fails the stylesheet check — small, no look from him.
- [ASK-PAGE-CHECK] — a script run on a mock-up or questions page before it is published to him: codes, ruling numbers and record words, and one "look at now" list — small, no look from him.
- [READER-COMPACT-HANDOFF] — a blind reader that compacts is pasted the host's handoff — a hook change, his word.
- [READERS-RECHECK-APP] — once 30 more app-code jobs have both reads, compare again whether one reader is enough there (D2042).
- [AGENT-BROWSER-TRIAL] — read Vercel's agent-browser at its source and time one short walk with it against the usual way; report the difference (D2043).
- [WALK-COST] — make a walk cost fewer tokens — a proposal; his word starts it.
- [CODE-TIDY-AUDIT] — tests that no longer apply and the skipped browser tests — his to confirm; one leftover for the database step, one put to him only if a later feature needs it.
- [RULING-HOME-HOOK] — only if a chat is seen acting on a ruling's short line alone.
- [REPO-PRIVATE] — the repo is public for a short period (D106; public on 18 Oct 26): making it private again, and restarting his PC's check runner, is his step; the sharing half (adding developers) is his call — the checks runner comes off first.
- [NO-ASTRA-LIST] — the jobs that went ahead without a ChatGPT reader, and walks without Fable's scenario design (D2444) — put to him to call or drop (D761).
- [OPUS-SECOND-READ-GUIDE] — the checking guide's line on when a second, blind Opus read is run: decided (D595), not written — it waits for Astra's and Sol's reads (D70) when ChatGPT is back, then his approval; and whether it still earns its place then.

**Documents and guides**
- [RULE-FILE-LESSONS] — six lessons for the rule files and the steps for recording a ruling — his word.
- [DOC-POINTERS-CODE] — three code comments in the rules engine are out of date (two point at the project guide's old headings; one says the change history clears on reload), each with the engine's next behaviour change (D1537); the rest re-pointed, live 14 Nov 26 (pull request 769).
- [WORD-LIST] — the app's word list LIVE 10 Nov 26 (pull request 739); left open only while the general rules name it with [SKILL-FUSION].
- [SKILL-FUSION] — the planning guide's harder questioning and three proposals — each read before his approval.
- [CAL-OLD-LOOKS] — three small leftovers of the calendar job: an old mock-ups page's note, a drop at the screen's bottom edge, his looks nobody recorded — none a fault.
- [IT-GUIDE-DATEBOX-SCRIPT] — the IT guide's picture script still types into date boxes that are buttons now — at its next re-shoot.
- [ITFLOW-OIL-RESHOOT] — re-shoot the IT flow guide's Leave War and OIL pictures — on his word (D403).
- [IMPECCABLE-UPDATE] — the design skill to v4.1.3 (D625): the calendar job it waited for is live; its reads and his word next.
- [START-CONTEXT-AUDIT] — the guard that stops a new chat's load growing back is not built; a scheduler-engine job's load to measure (skill note 942); two of his own settings.
- [SKILL-FUSION-WRITING] — the writing guide applied to how the agent writes to him (D835): to draft, have read and put to him — his to place.
- [GUIDE-MAP-ROWS] — the project guide's map has long rows that could move to its full text — his question.
- [EVIDENCE-RECORD-SIZE] — the big machine-written records and pictures: kept or moved — his call.
- [USER-GUIDE] — a guide for users and admins — wanted, not urgent; a first piece made 24 Nov 26: the guide for F-16 schedulers and training appointment holders (`raptor-port/docs/squadron-guide/`), their answers still to come.

**Database step — at the end (D473)**
- [M365-MOVE-PLAN] — the M365 move plan, his strikes owed.
- [CODE-APPS-RESEARCH] — the 19 Nov 26 research on Power Apps code apps set against the move plan: new commands, three things blocked inside Power Apps (tested: blocked; the phone zoom guard too), his documents choice awaited, the test account's environment type, and two saves at once (a change counter and a half-save repair, built into the one adapter); folded into the plan at the database step.
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
- [IT-QUESTIONS] — both IT people's written replies are in (8 and 10 Nov 26); still to ask: the short code confirmed, unique keys in the kit, the role-based account's licence, the first admin, whether the audit covers every table (D2209); the design notes not yet updated with the 10 Nov answers.
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
- [CAPS-OPS-LIMITS] — caps and ops limits: a weekly form, cleared every week, who has completed it at one button, the check switched off by a click (D2084); PAUSED until he calls for it (D2186, 17 Nov 26) — its eight questions unanswered, not put again.
- [FEATURE-WISHLIST] — his list of features not yet designed (the Tracker's progress graph waits, D774); added 16 Nov 26: a training tracker expansion (third in his order, with the Tracker's small fixes — D2086) and detachment modes (with the multi-squadron design).
- [XFER] — moving a man between squadrons with all his data — a milestone, with the database.
- [HIST-PER-PAGE] — a changes button on the Leave War and Quals — an idea; a mock-up first.
- [SIMILAR-APPS-LOOK] — what other apps like ours do: answered; whether any of it becomes a job is his.

---

## Items

### [CODE-CHECK-FILE-LIMIT] The code check goes red once the project holds more than 5,000 code files (found 25 Nov 26, chat 175) — OPEN, his go
**What:** pull request 826's "code check" job is red since `main` was brought in on 25 Nov 26 (GitHub's run on `38b1d6be9`: every other gate green), saying "React Doctor could not read origin/main's side, so it compared nothing". The cause is not the branch's code and not the earlier one (the raw byte, [MSQ-FIXREAD10-LEFT] (6)): React Doctor 0.9.18 leaves part of its check undone above 5,000 code files — its JSON report, `projects[0].skippedCheckReasons`: "Maintainability analysis was incomplete: source-file-limit (5067 observed, limit 5000)" — and `scripts/code-check.mjs` rightly refuses a report with a part skipped. `main` holds 4,755 walk scripts under `raptor-port/scripts/handpass` and sits about 250 files under the limit; this branch's own walk scripts and tests tip it over, and so will any branch after two or three more walks, `main` itself soon after. Reproduced on his PC (`npm run lint:changed`, exit 2). A re-run does not clear it.
**The fix tried, not kept:** `"scripts/handpass/**"` added to the ignore list of `raptor-port/doctor.config.json` — the check then runs whole: "Code check: no new finding (5450 changed files read against origin/main)". Put back the same minute (`git diff` empty): it changes what a check reads, so it waits for his go. What it gives up: React Doctor no longer reads the walk scripts — they are one-off scripts that press the app for a walk, never part of the app, and the check's findings in them have been left as they are since D1716; the app's own code, its tests and every other script are read as before. The other way out, moving old walks' scripts out of the project, loses the record of how each walk was pressed.
**To do, on his go:** the one line in `doctor.config.json`, on pull request 826 (which cannot go green without it) or on its own branch from `main` if he wants it live first; then a line in `raptor-port/docs/gates-and-deploy.md`'s traps (how to read `skippedCheckReasons` when the check says it compared nothing). Chats 173 and 174 were told on 25 Nov 26 and leave the setting alone.
**Where:** checks and tooling; with [MSQ-PICK-GUARD] on pull request 826.

### [MSQ-VIEWONLY-TRK-ASK] D2637's build, and the member-view band's words (23 Nov 26, chat 151) — OPEN
**What it is:** (1) his D2637: a pick of a squadron he only views, with unsaved chart edits on his own Tracker, asks "Save them before switching to 149?" (Save them / Discard them / Stay) as D2318's pick does — today it asks nothing and the edits wait (`raptor-port/docs/handpass/2026-11-23-msq-view-only-menu/t1-d/q5-01-after-pick-149.png`). Likely `tracker/role.js` trackerSwitchNeeds / the core's `needs` and `state/pick.ts pickWillAsk` counting a View-only pick. (2) Question 3 of chat 151's report: the member-view switch puts "This change could not be saved." on a held Input or Leave War window though nothing was tried (`rewalk/r-war-d/a-person-x-02-after-switch.png`); his D2389: "Member view." / "Switch back to the admin view to change this, or close it." — drawn first (D1625), then built.
**To do:** red first; the bug check by its tier. **Where:** People & accounts, Tracker; `raptor-port/src/tracker/role.js`, `tracker/app/core.js`, `state/pick.ts`, `state/store.ts` heldWindowBand.
**State (24 Nov 26, chat 153):** D2637's question and D2389's band built and checked on `claude/msq-b1-screens-135`, pull request 826 (the night's sheet `raptor-port/docs/handpass/2026-11-24-msq-night-check.md`); archive it when that merges.

### [MSQ-TRK-FOLLOWS-PICK] The Tracker follows the squadron picked (23 Nov 26, chat 151) — OPEN
**What it is:** his D2395 — with Plan of 149 or as a master admin, picking 149 shows and edits 149's Tracker, picking 142 brings 142's back, no sign-out; with only View it is not offered (D2381). Today it keeps the squadron it loaded until sign-out, with the bands "This is 142's Tracker. Pick 142 to change it. To open 149's, sign out and in." and "You can't open 149's Tracker any more…" — both go. Unsaved chart edits are asked about first (D2318, D2637, the latter built in [MSQ-VIEWONLY-TRK-ASK]).
**To do:** the Tracker unloads and loads a squadron's charts and students cleanly at a pick (its own memory, its saves, its Undo), red first; the cover and its bands removed; a FULL bug check (training records). **Where:** Tracker, People & accounts; `raptor-port/src/tracker/` (the core's load and session end, `role.js`), `state/store.ts` (the Tracker cover), `state/typing-hold.ts` trackerCover.
**State (24 Nov 26, chat 153):** the Tracker following the pick built and checked on `claude/msq-b1-screens-135`, pull request 826 (the night's sheet `raptor-port/docs/handpass/2026-11-24-msq-night-check.md`); archive it when that merges.

### [MSQ-TOPBAR-LIST-KEYS] The top bar's squadron list by the keys, and D2381–D2384's tidiness notes (23 Nov 26, chat 151) — OPEN
**What it is:** the re-walk of D2381–D2384 (N4): on a desktop, Enter, Space or an arrow on "149 ▾" opens the list but the focus stays on the button (`ui/SquadronMenu.tsx`'s own note: the ticked row takes it — likely its focus step runs while the list is still unplaced, `visibility: hidden`); Shift+Tab out to the page's start leaves the list open. Older than D2381 (step B); the ☰ list does both right. Pictures `raptor-port/docs/handpass/2026-11-23-msq-view-only-menu/rewalk/r-keys2-d/Enter-01.png`, `r-keys-d/ArrowDown-01-after.png`.
**Also, the readers' tidiness notes (D489, filed not fixed):** the ☰ list repeats the top bar's open, outside-press, Escape and key handling (share them); the spare note is a module variable two components share (a ref held by the menu); the landing on View-only Sched done in two places, and "something waits on a window's close" worked out twice; the war band now stays up while a View-only squadron is picked (its readers BidPicker, Matrix, BalancesPage read it as "the midnight band"); the input window's "opened on" rules inside a 1,500-line function; `pageOffered` recomputes the squadron list per call; the access line wears `drawer-acct`. Reports beside `raptor-port/docs/superpowers/briefs/2026-11-23-msq-view-only-*-opus.md`, `-astra.md`.
**Where:** People & accounts; `raptor-port/src/ui/SquadronMenu.tsx`, `ui/Drawer.tsx`, `ui/InputWindow.tsx`, `state/store.ts`.
**State (24 Nov 26, chat 153):** its two key faults are built and checked on pull request 826; the tidiness notes stay open.

### [TRK-LEAVEFLOW-DISCARD] The Tracker's other Discard leaves dropped edits drawn (23 Nov 26, chat 151) — OPEN
**What it is:** the fresh Opus reader of the walk fixes (outside its change): `leaveFlowEdits` ("Discard them and add a course?", "…rename the course?") clears the unsaved mark without reloading the chart; if the next prompt is then cancelled, `addCourse` and `renCourse` return early, so the dropped edits stay drawn, now marked saved, and the bar can keep "● unsaved flow edits". Older. The pick's and the sign-out's Discard were fixed together (`discardChartEdits`, `c2bcdb990`).
**To do:** red first — the same reload as `discardChartEdits`. **Where:** Tracker; `raptor-port/src/tracker/app/core.js`.
**State (24 Nov 26, chat 153):** this Discard built and checked on `claude/msq-b1-screens-135`, pull request 826 (the night's sheet `raptor-port/docs/handpass/2026-11-24-msq-night-check.md`); archive it when that merges.

### [GUARD-RAIL-FIRST] The fix step asks for a guard rail before a patch (his D2404, 24 Nov 26, chat 162) — OPEN
**What it is:** his D2404 — before fixing a fault, and always when one feature keeps breeding faults, the agent asks whether a guard rail (the app refusing the state the faults come from and saying why) would remove them, and puts it to him before patching each fault. The rule is live on the general page; this item is its place in the method.
**To do:** add the question to `raptor-port/docs/bug-check-order.md` (the fix step of §5, beside "A fix is new code") and its checklist's step 18, and to the fix-list template a fix helper is briefed from; the change read by Astra and a fresh, blind Opus reader before his approval (D1761), merged on his "merge live".
**Where:** How we work; `raptor-port/docs/bug-check-order.md`, `raptor-port/docs/bug-check-checklist.md`.

### [MSQ-PICK-GUARD] A squadron pick or a change of view refused while a window is open (his D2403, 24 Nov 26, chat 162) — OPEN
**His answers of 25 Nov 26 (chat 175, after the night):** D2596 and D2597 — the six windows that only show things close by themselves at a pick or the view switch; D2598 — A5, Admin → Users' half-done states count, "Add a person" with a Cancel that clears it; D2599 — "Add a person" at the top of Admin → Users; D2620 — the squadron number at the top left flashes twice, fading, at every change of squadron; D2621 — A17, the Inputs page with another squadron picked lists none of his own inputs of a squadron he can still pick, a bell line switching first; D2622 — separate squadrons, separate views, unless a man is deliberately planned onto another: a roll-call of every place one squadron still shows another's things, each put to him; D2623 — Help's bug reports one list, split by squadron when an admin views it (its readings drawn and put to him); D2624 — C1, whenever the bell shows more than one squadron every line of a squadron wears its number, his home's too (the build changes `lineSqnMark` and its pins in `ui/msq-bell-show.test.tsx`; drawn first). The last three are drawn and shown to him before anything is built (D1625); their open readings go on the page's next round. **Then D2625 (C9)** — on a squadron's Admin → Users a man of another squadron shows only his callsign, squadron number, seat, CAT and that squadron's access line; today, for Hunter (142's admin holding Plan of 149) on 149's page, Ranger's sign-in mail and Role show and Save, Suspend, Archive and Delete work — fixed in the build; Kestrel's view pressed again first. **And D2626** — Plan of a squadron given and taken away by its own admins or a master admin, never passed on by a Plan holder, its admins told on the bell: the build changes every place that keeps Plan to a master admin (Admin → Users' access line and its greyed reason, the roles table's note, giving, taking away, Undo and Redo, the commit gate) and adds the bell line; the new words drawn and read by a fresh Fable first (D1625, D2441). **And D2627** — all of group A as recommended (Fable's change where it made one), each answer in the ruling's full row; with it a fault found by A4, Quals still showing Done after the member-view switch, fixed in the build. **And D2628** — group C as recommended (Fable's change where it made one), C6 held back and put to him (it clashes with D286: an archived man's callsign may go to a new person); the colour code answered no; D2620's and D2623's open points answered; each in the ruling's full row. **And D2629** — other squadrons' people folded under one closed heading each on Admin → Users, shown to whoever may give access there; drawn first. **And D2630** — every example, drawing, scenario and walk of this work considers more than two squadrons (142, 149, 150) and a person with rights in several at once. **And D2631** — a master admin's "All squadrons" on Admin → Users opens his own primary squadron, every other folded. **And D2632 (C6)** — another squadron's archived callsign: "it's him" asks that squadron's admins to bring him back and move him (the move waits for the Transfer build), "someone new" adds him and asks them to delete the old one; words read by a fresh Fable first. **And D2633** — "It's him" waits for the Transfer step (batch 4); this build has only "Someone new: add him" and "If this is him, ask 142's admin" (Fable's words and missing cases: `raptor-port/docs/superpowers/briefs/2026-11-25-msq-c6-words-fable-report.md`). **And D2635** — the folded headings seen only by those who may give access there. **And D2636 — remind him:** group B (B1–B12) is put to him once Build 1 is built; none of it built before.

**Chat 175, the night of 24–25 Nov 26 — the second questions page PUT TO HIM, Build 1's plan written and red-teamed; nothing built.** The page: https://claude.ai/artifact/QpPTfwiib8u5Mao2GoEXYB (source `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/page.html`) — 32 questions, each pressed on today's app by five Opus pressers (`raptor-port/docs/superpowers/briefs/2026-11-25-msq-pick-guard-q2-press-p1.md` … `-p5.md`, scripts `raptor-port/scripts/handpass/n175/`), the drawings owed made by a fresh Fable (`…-q2-draw-report.md`, `…-draw-report2.md`), eight new sentences reviewed by a fresh Fable (`…-msq-pick-guard-words3-fable.md`): A1–A20 are what Build 1 waits on (H2, H3, H7, H8, H11, the host's calls his D2611 moved to him, and the plan's N1–N5), B1–B12 the later builds' (Logout, Undo, the refresh card). Build 1's plan: `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` (a fresh Fable; four families of doors, not three; one table over the flags each window is already drawn from; about 21 hours), read by Astra, a fresh Opus and a fresh Fable, each blind (`…-build1-read-{astra,opus,fable}.md`) and revised to them (its §15). Faults met while pressing, to fix in these builds: 142's OIL list stays live under a bar reading 149 and writes 142's records (part F); Quals keeps Done in the member view and Logic's and Quals' edit mode carries onto 149's page (A4); on a phone a tap on ☰ over Place a bid closes the bid and opens no menu; Undo of "+ New squadron" with that squadron in view drops him to 142 (B7). The branch's code check is red for [CODE-CHECK-FILE-LIMIT]. **Next: his answers to A1–A20, then Build 1 by the revised plan — the latest Fable, high.**
**Chat 171, 24 Nov 26 — the words read, the scenario list and the size, DONE; nothing built.** (a) A fresh Fable read the draft words (`raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-words2-fable.md`, its brief `…-words2-brief.md`): the greyed Undo "Pick 142 to undo your changes there."; the row's note "Blocked: save or cancel the open row, then pick 149." (the row has no Close; shutting it drops the typing unasked); "Blocked: press Retry to save your changes, then pick 149."; and one doubted fact for him — Logout with a change not saved loses nothing today (the band and Retry stay, the next sign-in waits, D2322), so the draft's "lose it" is untrue. (b) The walk's scenarios, by Astra and a fresh Fable, blind (`…-scenarios-astra.md`, 56; `…-scenarios-fable.md`, 58), combined by the host into 56 rows: `…-msq-pick-guard-scenarios.md` — its §2 holds thirteen questions for him (H1–H13: Logout's unsaved change kept or lost; what counts as a window; how far the Users row reaches; Logout over a window with no question; the phone's way to Logout; and the edges of Undo, the refresh card, the note's place, a drag, a save still going), its §3 the host's technical calls. (c) The reading of the code, the parts A–H and the size — about 34 hours of building in three builds, an estimate: `raptor-port/docs/superpowers/plans/2026-11-24-msq-pick-guard-build.md`; the tier FULL with the security reader, told to him. **Next: the questions page for H1–H13 with the drawings owed (D1625), and Build 1's plan (parts A, B, F) red-teamed by Astra and a second reader, then built — the latest Fable, high.**
**His D2590–D2595, 24 Nov 26 ("as recommended for all", chat 166; the page https://claude.ai/artifact/1LB8oWAE6RBT2WGUCqnmWj, version 3, source `raptor-port/docs/mock/2026-11-24-msq-pick-guard/page.html`; steps 1–2 DONE — pressed, `…/briefs/2026-11-24-msq-pick-guard-press-report.md`, re-run by the host; drawn, `…/drawn/`):** D2590 the refusal is the grey "Blocked:" note under the control pressed on a desktop, at the foot on a phone, its words as drawn; D2591 the refresh note a shaded card, one Refresh button, its words as drawn; D2592 Logout never refused — the window's own question, then the Tracker's, one at a time, Logout reachable on a phone with a window open; D2593 Undo and Redo reach only the squadron in view, the greyed Undo saying why (narrows D148); D2594 a change not saved refuses a pick, the view switch and a bell line till Retry saves, Logout asking, "Not kept" never blocking; D2595 an opened Admin → Users row with typing counts as a window. The draft words of D2593–D2595 go to a fresh Fable before the build (D2441). **Next: the scenario list (below), then step 3, the build — the latest Fable, high risk.**
**His D2405, 24 Nov 26 ("Yes refresh for those"):** where the squadron in view or his rights change without his press (his own move at midnight, a right taken away, the Tracker failing part-way through a switch) the app stops under one note asking him to refresh, with its own Refresh button; unsaved work is lost and the note says so; so the greyed windows, their two bands and the Tracker's hold at his own move are REMOVED by this build, not kept; the note and button drawn for him first, the midnight case pressed before the drawing. **His words on its scope, 24 Nov 26:** the note shown when the guard refuses, and why it is refused, is to be worked on; "also still think of any potential bugs that may still happen when switch roles/sqns". So before the build: the scenario list for every switch of squadron or view (Astra and a fresh Fable, blind, D2443), from chat 162's ten seeds — a page with unsaved typing that is not a window (an opened row on Admin → Users, a text box on Edit Schedule, Logic, Quals); a drag in progress; a save still going or failed ("Not saved" with Retry); a second switch pressed during the first; a window that opens after the guard has looked (a bell tap under a question); Undo and Redo of one squadron's steps pressed on another; the bell's lines of the other squadron; a change he did not make with a window open; sign-out and the next person; the phone, where a window covers the control.
**What it is:** his D2403, "Yes guard rail." — a pick of another squadron, and the switch to or from the member view, is refused while an Input, Leave War or other window (the OIL list among them) is open, a note saying to close it first; unsaved Tracker chart edits are asked about at both, with the question a pick asks today; a bell line that would take him to another squadron follows the same rule. It replaces, for a switch he makes himself, the greyed windows and their bands (D2323, D2389) and the Tracker held in the member view (D2318), each narrowed; a change he did not make (his own move at midnight, a right taken away, sign-out) keeps today's handling.
**To do, in order:** (1) press on the running app every case the guard would refuse, at 1536 and 402, and every window a pick or the view switch can be reached over (the night's sheet says the Leave War's and the Export window's shades already cover the squadron control, and the Input window fills an upright phone: confirm each); (2) draw the refusal's note on the real screens, its words drafted by Opus and adjusted by a fresh Fable (D2441), and show him (D1625) — the app's grey "Blocked:" note is the ruled look for a refusal of one change (D1667, D1668); (3) build, failing test first: the pick's door (`raptor-port/src/state/pick.ts`, `state/store.ts` `enterSquadron`, `switchRoleView`), the bell's `enterForLine` (`state/belltap.ts`), the question at the view switch (`tracker/role.js`, `tracker/TrackerPage.tsx`); what of the held-window code stays for the changes he did not make is decided there and said in the report; (4) the FULL bug check with [MSQ-NIGHT-153-OPEN]'s fixes, one check for the batch (D485). What a Fable helper had found for the security faults before it was stopped (D1613) is in its hand-back, saved by chat 162 beside the plan if it arrived, else `raptor-port/.tmp/fix162-held-partial.patch`.
**Where:** People & accounts, Inputs, Leave War, Tracker; with [MSQ-NIGHT-153-OPEN] on pull request 826.

### [MSQ-NIGHT-153-OPEN] What the night of 24 Nov 26 left open on pull request 826 (24 Nov 26, chat 153) — OPEN
**Chat 162, 24 Nov 26:** the questions page was rebuilt (round 1, `raptor-port/docs/mock/2026-11-24-msq-night-questions/page.html`). **His D2402:** the Undo words (q1, q2, q7) as recommended, seven sets, to build. **His D2403** (the guard rail, [MSQ-PICK-GUARD]) takes over item (1)'s security F1 and its two leads, and makes B2's main case and q11 fall away; security F2 (the bell's OIL line) still needs its own fix, with the window recording the input's own squadron as the belt. q4 as written cannot happen today (his tab never hears of the change until a reload). Still for him, round 2, each pressed and drawn first: q10 (the failed-switch panel, which the browser refusing its storage cannot raise in this build), q12, q3, q5, q9 and the red cut-off words in the cases the guard does not cover. The Tracker's press handling: the plan `raptor-port/docs/superpowers/plans/2026-11-24-trk-press-reshape.md`, revised after its first red team; a second round of reads, then his three questions, then the build.
**Chat 166, 24 Nov 26:** the press plan's second round read (Astra, a fresh Opus, a fresh Fable, blind — reports `…-read2-{astra,opus,fable}.md`; Astra two HIGH, the others MEDIUM), revised by a fresh Fable (§9, about 27 hours), a third and last round going. **Found, not fixed, filed here:** once the reshape is in, a tap on the Tracker chart in the instant it is being saved or loaded does nothing (the chart is marked busy); nothing to see today, when both are instant — look again at the database step, when a save takes time.
**What it is:** the last blind reads of the second fix round (`raptor-port/docs/superpowers/briefs/2026-11-24-msq-night-fixread2-{astra,opus,security}.md`, read of `334353046..abc44cea3`) and the walks (`raptor-port/docs/handpass/2026-11-24-msq-night-check.md` §15, §16). **To fix, failing test first, before "merge live":** (1) security F1, F2 (medium): Hunter with Plan of 149 and 149 picked opens a 142 input live from 142's OIL list or the bell's OIL line, so Save, Delete and the OIL answer change 142's record under a bar saying 149; the root: the Input window judges by the page's squadron, not the input's own (`ui/InputWindow.tsx`'s first note, `ui/OilDayList.tsx`, `ui/topstate.ts` bellTap); fix the root (the window records the input's own squadron), then the two doors; also the reader's leads: the Leave War clash note, the Inputs calendar's just-saved row. (2) security F3 (low): a bell line opened after the Tracker question though the right ended while it was up. (3) The Tracker's press handling, one cause family (`tracker/app/core.js` gestures): Opus F1 (medium, one Undo during a drag takes back two changes), Opus F3 = Astra 1 (a redraw that ends a drag leaves the move unsaved), Opus F4 (a line handle's press outlives a Discard), Opus F2 (picks survive an Undo and a clean chart switch). Four rounds tonight found faults here: reshape the press handling where they come from first (D2238), its plan read before the build. (4) From the walk, low, older: C2 Escape with the squadron list open over an Input window goes to the window; A1 the Tracker's question takes no keyboard focus. (5) A lead from the fix job: a store whose write throws is reported as saved (the command layer isolates a throwing storage listener); look at it. **For him, each drawn first (D1625):** B2 the Tracker bar cuts "This change could not be saved." to "● Th…" (recommended: the red words on their own line under Save); q10 the failed-switch panel's words; q11 a phone way back from a held Input window; q12 a bell line marked read on Stay (recommended: leave); q1, q2, q7 the Undo words (Fable's versions in the night's block).
**Where:** People & accounts, Inputs, Tracker; `raptor-port/src/ui/InputWindow.tsx`, `ui/OilDayList.tsx`, `ui/topstate.ts`, `state/belltap.ts`, `tracker/app/core.js`.

### [ROLE-BOX-CUT-IPHONE] Admin → Users' Role box cuts its words off on an iPhone (22 Nov 26, chat 137) — OPEN
**What it is:** today's app, a person's opened row on Admin → Users at an iPhone's width (402): the Role box is half the row wide and shows "Admin — schedule…", the rest of "Admin — schedules and manages" cut off. Seen in the redrawn approved picture `raptor-port/docs/mock/2026-11-22-msq-b1-screens/img/p1a-p.png`; found by the host opening a helper's picture, confirmed by chat 137's fresh reader.
**To do:** if he takes question C of batch 1's second-half page (the Role choices shortened to "Member", "Admin", "Master admin", the long words moved into "What each role allows"), the fault goes with it; if he keeps the long words, fix the box's fit on a phone anyway. Either way, a test that the Role box's text is not cut off at a phone's width.
**Where:** People & accounts; `raptor-port/src/ui/UsersPanel.tsx` (the Role choice); with batch 1's second half ([MULTI-SQN-DESIGN]).

### [ACCOUNT-STATUS-TOLD] A person told on his own bell when his account status changes (his D2251, 21 Nov 26, chat 128) — OPEN
**What it is:** his D2251 — "the players should be informed when their account status changes": a line on the person's own bell whenever he is made an admin or a member, suspended or enabled, given or losing View or Plan of a squadron (a move, or a change to member, ending it included — D2203, D2250), made or unmade a master admin; it names what changed and who changed it.
**To do:** draw the line and what a tap on it opens for him first (D1625), with the agent's reading of "account status" listed on the page for him to correct; a suspended man reads it once enabled again; it sits beside D2200's per-person choice of notifications, on by default. Then build red first (the bell lines in `raptor-port/src/state/notices.ts`; the doors in `raptor-port/src/state/accounts.ts` and `raptor-port/src/state/units.ts`), the gate's bell-line rule (`raptor-port/src/state/perms.ts` §7e) letting the line reach the man himself.
**Where:** People & accounts; with the multi-squadron batches (the Plan screen, step 5) or before — his order.

### [MSQ-FABLE-REVIEW] Fable reviews the work it has not yet read — the kinds of sign-in together first (21 Nov 26, chat 131) — OPEN
**What it is:** his D2259. (1) A table, written from his rulings and blind to the code, of every kind of sign-in — a master admin, a squadron's admin, an admin holding Plan or View of another squadron, a member, a person waiting for access, a man who has moved squadron — against every page's view and edit, in his own squadron and in another; then each cell checked against the commit gate by a test and on screen, a mismatch run red before it counts (it widens [MSQ-PLAN-AUDIT] to every kind). (2) A list of what Fable has never read, from the evidence sheets and [NO-ASTRA-LIST], ranked by risk (OIL, the published record, saved data, permissions first); Fable reads the top of it for where its shape breeds faults. (3) A report to him of the areas that need more attention; the fixes by D2258's levels, in parallel chats on his word.
**Where:** `state/perms.ts`, `state/accounts.ts`, `state/units.ts`, every page's doors; `raptor-port/docs/data-model.md` §11.
**Progress, the night of 21–22 Nov 26 (chat 131):** (1) the table `raptor-port/docs/superpowers/briefs/2026-11-21-msq-signin-kinds-table.md`, its five faults K1–K5 fixed (K2 by his D2260). (2) and the first of (3), report only, in `…/briefs/2026-11-21-msq-fable-never-read.md`: the ranked list; Fable's reads of the Leave War (F1 MED — OIL leave on a day no period covers not taken off his OIL; F2 LOW — ids naming nobody), Inputs (a shared input's document never saved; "Goes to" lost when the OIL answer is in the same save; two LATE-mark faults of shared inputs) and OIL outside the war (F1 MED — a man posted out as SANS drops from the ALL AVAIL crowd of days before his posting, so an amendment takes OIL he earned; F2 — a weekend whose work is an input with no OIL answer publishes in silence, D81) — every finding run red by the host; **not fixed — his to place** (D2258's levels).

### [MSQ-FIXREAD17-OPEN] Fix read 17's, the core read's and the full review's faults, all reproduced red, not yet fixed (20 Nov 26, chat 124) — OPEN
**What it is:** 35 faults in seven cause families, each run red by the host; the table, families and readers are in the evidence sheet `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17, the proofs (as text) in `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/`. **The job — his D2238 (20 Nov 26, "reshape and fable"):** first a plan reshaping where the families come from (one which-squadron-on-a-day answer, the day always given; homes, places and rights as dated rows under one check; one last-admin rule; passes over every squadron), read by Astra, a fresh Opus reader and Fable, blind, before anything of it is built — the plan: `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` (its readers' brief `…/briefs/2026-11-20-multi-sqn-b1-reshape-read-brief.md`); R1 fixed now beside the plan (`19608876a`); then each fix red first, a repeat of a fault an earlier fix meant to close Fable's (D2233), a new one Opus's; one combined fix read (all four readers, D2236).
**Held out of the fixes, the host's calls:** K2, K3 (the gate trusting the page's own memory — anyone who can alter it can skip the gate itself) → the database step, where the saved copy is the one source; A3 (people made on a shared store before its first boot belong to no squadron) → the database step's first boot; B7 ("Request access" names no squadron — batch 1's step 5, unbuilt) → built with step 5; C7 (sign-out's reload can sign out the next person) → with D2205's M2; C10 (measured 1.9× per edit at 4 × 40, not a fault at batch size) → a measure, kept.
**Questions for him with the fixes:** C3 (an ALL AVAIL meeting follows its filer's move — no ruling); C5 (sign-off boxes: the day's people or today's — no ruling); R2 (a move taken back the same day: refuse it and require Undo, or give the rights back); A7's master case (D2221's reading — only a master or the man may change leave across a move).
**The plan (D2238), 20 Nov 26, chat 125:** `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, red-teamed in three blind rounds (Astra, a fresh Opus reader, Fable; reports `…/briefs/2026-11-20-multi-sqn-b1-reshape-read{,2,3}-*.md`) and revised after each (§16–§18) — the red team closed. R2 now closes without a question (rights end on the move day). His eight questions (Q1–Q8: C3, C5, A7, the rights' timing, B2's stop-gap, A1's look, the midnight band, the words for leave across a move) are on the page https://claude.ai/artifact/X256rjVbhS1sNDb96ZY4kH (`raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/`). Then the build in a fresh chat by the plan's §10. **Q1–Q4, Q6, Q7 answered as recommended by his D2243 (20 Nov 26); Q8 by D2240–D2241.** **Q5 answered by his D2239 (20 Nov 26): the guest view is removed** — its Admin switch, the waiting screen's button into it, the guest session and the guest role's cells, a one-by-one job of the build (the plan §8); B2 closes by it; B7 (the request names its squadron) stays with step 5.
**Found while drawing (chat 125, to check, not one of the 35):** a Delete posting set but not yet run did not refuse an Undo that put Havoc's approved leave back on a day after the posting's date (reached through the Leave War's own Delete and Undo) — find out whether that is by design.
**Progress, chat 128 (21 Nov 26):** phase 2's five helpers built and merged on `claude/multi-sqn-b1-107` (each proof re-run red by the host): "own pages" items 2–3, "session" (routed planning writer, B1, `enterSquadron` trigger off), "war" (A1/A7, A5, A6, PB1, PB2, `oilOpenOn` by day; pass 2 the flying plan and Quals columns by the war's squadron), "undo & roles" pass 1 (A-v, K4 + B5), "schedule" (A-i, C3, C4, C5 + R8, C6, C8). **Done, chat 129 (his D2250, replacing D2248):** R7's refusal and the gate's R7 line removed; the gate's member's drop added (`perms.ts accountMadeMember`, a Plan row only); `state/piece-b-tables.test.ts` R7 and `state/reshape-r1-r7-words.test.ts` R7 rewritten red first, with a forged-command case. Also chat 129: `restoreLeavesOut` rule 4 (a Plan row put back only by a master admin's restore — D2250's Undo gives back the role only; the agent's reading of D2199, told him); "undo & roles" pass 2 built and merged (`8fac965bb`, each proof re-run red by the host; its suite 15,499 passed, 0 failed, F11-4 green): the planning record's per-record store, Piece B's restore lines with D2250's Undo, A7's line, the Quals line by the man's squadron's columns, an own-page step's Undo under another pick. "Own pages" item 4 built and merged (`bb51e259d`, both proofs re-run red by the host; its suite 15,513 passed, 0 failed): the Inputs calendar by the page's own squadron (`ui/owncal.ts`), the flying plan by it on the own pages — **phase 2 done.** **Owed, phase 3 (core):** Admin → Data's "clear the period" (`ui/inputedit.tsx` about l.2299) still clears only the loaded calendar; `flyAnswer`/`flyMonth`'s `dayFacts` reads the loaded war's holidays (A4); `engine/inputs.ts inputsOnFirstDay` (then `state/store.ts landingInputs` on it — session's ask) and `perms.ts pickStandsOn` (R6's pick half); an input's late mark by its OWN squadron's cut-off (`isLateInput` reads the loaded Logic); `storage/keyowner.ts`'s stale `lookahead` comment; optional `perms.ts ownPart` accepting a `u` stamp on a member's own take-out. **A named one-by-one (plan §14 item 3):** the Tracker cannot be re-read in place — after his own move at midnight it moves at the next sign-in, the war and schedule at midnight (to tell him with the phase-3 switch). **Evidence sheet owed:** the helpers' proofs into `raptor-port/docs/handpass/2026-11-21-msq-reshape.md`'s "cases carried by a test".
**Where:** `state/{perms,units,notices,accounts,store,persist,person-delete}.ts`, `engine/{roster,inputs,faceattrs,publish,weekstash}.ts`, `leavewar/{sync.ts,state/store.ts,state/raptorRoster.ts}`, `ui/{inputedit.tsx,InputsPage.tsx,logout.ts}`, `undo/timeline.ts`, `testing/enumguard.ts`, `boot.ts`.

### [MSQ-PLAN-AUDIT] Everything built and planned, checked for an admin with Plan of a squadron (20 Nov 26, chat 125) — OPEN
**What it is:** his D2242 — after the agent wrote "only a master admin" where an admin with Plan may act too (D2241), a dedicated run checks the whole many-squadron work for every place that leaves out, or wrongly lets in, an admin with Plan of a squadron (D2201: full access to it, its people and sign-ins included, D2211). **The job, first in the next chat, before the reshape is built:** (1) a roll-call of every place that decides who may act for a squadron — the gate (`state/perms.ts`: `levelInForce`, `levelBefore`, the sections on accounts, inputs, the war, units, the posting pass), the doors (`state/accounts.ts`, `state/units.ts`, `state/person-delete.ts`), the bell's audiences (`state/notices.ts`, `leavewar/sync.ts` `ownSchedulerIds`, `adminsOf`), the pages' squadron (`pageUnit`), the Leave War and Tracker doors, Admin → Users' lists and buttons, the reshape plan's rules, the documents (`data-model.md` §11) and the drawings — each written has it / must not, because… / missing; (2) Astra and a fresh Opus reader, blind, given the roll-call, for places it missed; (3) a walk signed in as Hunter (142's admin) with Plan of 149, every 149 page pressed, desktop and iPhone; (4) every fault run red first, fixed in the app or folded into the reshape plan (its §12 and §10); places a ruling keeps Plan holders out on purpose are named, not changed. FULL tier (permissions). Also: Admin → Users' access buttons need a line per squadron once there are more than two (D2241) — a drawing for him when built.
**Progress, chat 126 (20 Nov 26):** (1) the roll-call DONE — 171 places (`raptor-port/docs/superpowers/briefs/2026-11-20-msq-plan-audit-rollcall-{gate,doors,bell-war}.md`, brief beside them), every left-out, wrongly-let-in and wording row checked in the code; the proofs PA1–PA3 run red (`…/2026-11-20-msq-plan-audit-repro/`); every finding folded into the reshape plan §19 (PA1–PA3, PB1–PB5, PC1, PD1, PE1, PH1 built with the reshape; PF1, PG1, PK1 filed under [MULTI-SQN-DESIGN]); the plan's and the documents' sentences fixed (D2241). Evidence sheet `raptor-port/docs/handpass/2026-11-20-msq-plan-audit.md`. (2) the blind read DONE — Astra and a fresh Opus reader (`…/2026-11-20-msq-plan-audit-read-{astra,opus}.md`), 13 merged findings in the plan §19b (R1 a Plan holder moving himself or the master admin, and the Opus reader's O2 and O4, run red); (3) the walk DONE — Hunter with Plan of 149 acts on 149's man with no refusal, every kept-out door refuses (sheet §The orders walked). **Left:** R8 (may a Plan holder sign a 149 day's boxes? the rulings clash) and R12 (the last-admin words for a Plan-only squadron) put to him; then this item is archived — its lasting facts in the plan §19 and §19b and the sheet. The build: chat 127, by his D2244.
**Where:** `state/{perms,accounts,units,units-model,notices,person-delete,store}.ts`, `leavewar/sync.ts`, `leavewar/state/{store,foreign}.ts`, `tracker/`, `ui/` (Admin → Users), the reshape plan, `docs/data-model.md` §11.

### [MSQ-FIXREAD10-LEFT] What fix read 10 left on the multi-squadron fixes (20 Nov 26, chat 118) — OPEN
**What it is:** (1) fault F of `…/briefs/2026-11-20-multi-sqn-b1-fixread10-fixes-brief.md` (Opus O10-3): a filer line
dated minutes ahead (a clock set back) leaves his bell for those minutes once the right it came through is removed; an
Undo or Redo putting it back inside them drops it for good. Held by the host: the brief's rule would keep a line he
should lose (fix read 8's Opus 4 test); the held patch was in chat 118's scratch. **The job:** at the database step, the
server's clock sets every line's time — then drop the minutes-ahead exception. (2) A war line's content field is not
checked by the gate (the builder's note). (3) GitHub's browser tests failed once each on screens nothing changed:
`e2e/datecal.spec.ts` "a glide caught, held still, then dragged…" and `e2e/leavewar.spec.ts` (phone) "the pinned dates
row follows…" (D1870) — both twice in one run (with its retry), passing on the other run and 3/3 on his PC: steady them
(D87). (4) His D2228 (20 Nov 26, the night's Q1 answered "as recommended"): a filer who moved and is again an admin of
the man's squadron is told — built 20 Nov 26 (`16a566d88`, `aa96a9a0f`; fix read 9's three proofs green), its read
owed to fix read 14. (5) A walk owed to the batch's next walk: the bell after fix read 13's C and D2 — a moved filer, an
admin of the man's squadron again, told of a change; a remark changed in the Leave War's drag window on a war-approved
leave telling its filer (evidence sheet §Fix read 13). (6) **The code check still cannot compare against `main` (found 20 Nov 26, chat 119)** — pull request 808 merged and did not cure it: GitHub's run of `101f18aaa` still says React Doctor "could not read origin/main's side", so "checks passed" stays red and pull request 806 cannot merge until this is solved. Found so far: React Doctor gives up when any file changed on both sides holds a raw NUL byte on `main`'s side; `raptor-port/src/engine/editlog.ts` (`\u0000act${i}`, a raw byte) is the one such file — needs the same escape as 808, on `main` too (a code change, his "merge live"). But a local `main` with that byte escaped still came back "could not compare" (60 s run, 2,452 changed files, every changed source file analysed, no lint or dead-code failure in the report), so a second cause remains — next: instrument React Doctor's `runBaselineComparison` early returns (its `resolve-scan-exit-code-*.js`) in a scratch copy of the tool. **Found (20 Nov 26, chat 122): no second cause.** React Doctor reads the MERGE-BASE of `main` and the branch, not `main`'s tip — so the local test with `main` escaped still read the old byte. The cure: pull request 817 (the one-byte escape on `main`, its own code check red by the same cause, as 808's was — the other gates decide it) on his "merge live", then `main` brought into this branch; the 11 new findings the comparison then shows here were cleared in `0e81a165c`. Worth a line in `gates-and-deploy.md`'s traps when it lands. A latent case: `reference/probes/perf3.js` holds a raw NUL on both sides (read-only, never changed). (4) is done; its read was fix read 14. (7) **For the database step (Fable, fix read 15, named, not run):** a remote edit of a request that already has a local saved row, applied to memory without the saved copy, would make the next local edit's Undo put back the stale saved image — another person's change undone (D148); nothing raises a remote change today. (5) **walked 20 Nov 26 (chat 122)** — 0 faults (evidence sheet §Fix read 15); the bridge of two war leaves (fix read 15's Astra 1) to walk with fix read 16. (8) **A walk lead (chat 122):** after Hunter deletes Outlaw on Admin → Users, the Leave War grid still draws Outlaw's row and cells, after a reload too (`docs/img/handpass/2026-11-20-multi-sqn-b1-fixread15/w4/`) — check against D297 (his row kept for the days he flew) and how the war draws a posted-out man before calling it a fault; a picture to him if it is one. **Checked 20 Nov 26 (chat 123): by design** — his D299 keeps "his past Leave War record … in the months he was here" and takes "his Leave War row after he left": deleted on 17 Jul, his row rides July (striped from the 17th) and leaves from August, as a posted-out man's does (a helper's test through the delete's own door). (9) **A question from that check, not walked:** the Balances page lists a man by the same months' rule, nothing there leaving a deleted man out — whether it shows a deleted man's OIL for his months, against D299's "Goes: … his OIL balance", is to check. (5)'s bridge walked 20 Nov 26 (chat 123, evidence sheet §Fix read 16): 0 faults. (6) cured: pull request 817 merged, `main` brought in, the code check compares (one new finding cleared, `ab701f941`). **Where:** `state/notices.ts noticeLeftBell`, `state/perms.ts`, the two browser test files; `scripts/code-check.mjs`, `src/engine/editlog.ts`.

### [SEED-UNDO-DROPS-ACCOUNT] An Undo of a seeded account's first saved change may take the account's row (20 Nov 26, chat 118) — OPEN
**What it is:** fix read 9's builder (night of 19–20 Nov 26), writing its tests, saw that in the demo's seeded state an
Undo of the first change saved for a seeded account removed that account's stored row with it — outside its brief, not
reproduced by a host. It may be the seed's own shape (a seeded account has no stored row until its first change), and so
D56's demo-data case, or a real fault for any account whose first change is undone. **The job:** reproduce it with a
failing test; if new data would be hurt, fix it red first; if it lives only in seeded data, say so and close it.
**Where:** `raptor-port/src/state/` (the accounts' store and the Undo timeline, `undo/timeline.ts`).

### [MSQ-FIXREAD4-OPEN] Fix read 4's claims on the multi-squadron fixes, to reproduce and fix red first (19 Nov 26, chat 109) — OPEN: all five fixed, a fresh read owed
**Done 19 Nov 26 (chat 111), each red first:** claim 1 (`ebbd4aea6`) — an admin's own input on the days of a squadron
he is not admin of now keeps a member's own-input rules there; claims 2–4 (`5b8357f92`), by his answer to the question,
D2218 — a moved man's old squadron's lines leave his bell on his move day (one read rule, `state/notices.ts
noticeLeftBell`), a take-back tells only who would be told today, a Redo never puts such a line back, fix read 3's A2
undone and Astra's forged posting command refused. Claim 5 (the desktop click during the whole-year fill) — chat 112, its own
session: `caba6a269`, `ae4c632a3`, `44426c5c0` on `claude/lw-monthjump-click`, merged into this branch; besides the click, the
landing at a 125% screen and a rare redraw race; read by Astra and a fresh Opus reader up to `ae4c632a3`; evidence
`raptor-port/docs/handpass/2026-11-19-lw-monthjump-click.md`. **Left:** a fresh read of the claims 1–4 fixes and of `44426c5c0`.
**What it is:** the night's last read (Astra and a fresh, blind Opus reader of fix read 3's five fixes, `ea68a8f48`; reports `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread4-{astra,opus}.md`), none yet reproduced by a host: (1) O1 lets an admin's own input skip every own-input rule on another squadron's days — clear the other squadron's cancel mark or the war's approval on his own leave (Opus 1, proof fails; the worst); (2) O2: a Redo puts 149's "Bidding open" back on a man since moved to 142, and an Undo may put back a line its step took away (Opus 2, proof fails); (3) Undo after a moved man READ the war's line removes it silently, no "taken back" (Astra 2); (4) the posting take-back exception may delete an OLDER run's line from another squadron's bell (Astra 1); (5) O3 on a desktop: a click during the whole-year fill ends the exact landing, so the old drift can return (Opus 3). Plus a question for him (Opus 4): a moved admin's "taken back" line about a posting of his old squadron — owed by D1693, D1699, or not crossing by D2194 (the later). **The job:** each reproduced red first, fixed at its cause by the readers' fix steps, the multi-squadron unit files, the build, the Leave War browser file; then a fresh read of those fixes. **Where:** `raptor-port/src/state/perms.ts`, `timeline.ts`, `leavewar/sync.ts`, `undo-wire.ts`, `leavewar/ui/reanchor.ts`, `Matrix.tsx`. Nothing of it can be reached from a screen yet (a move of squadron is saved by no screen); pull request 806 does not merge before it.

### [LW-APPROVALS-PHONE-FLAKE] A Leave War phone test unstable under load (19 Nov 26, chat 109) — OPEN
**What it is:** `e2e/leavewar.spec.ts` (phone), "the grid shown again after Approvals draws the month in view by itself" — "drawn days in view: 0". Seen by the night's fixer of fix read 3: alone 4/4; run six times alongside the month-jump tests, 2 of 6 failed, and the same 2 of 6 on the grid as it was before the fix (`ea68a8f48`'s O3) — not caused by it. **The job:** find what the test waits on too early (D87: wait on what the test needs, never a fixed time) and steady it, red first under the same load. **Where:** the Leave War's browser tests; the grid's redraw after Approvals (`leavewar/ui/Matrix.tsx`).

### [READERS-RECHECK-APP] Compare the two readers again on app-code jobs (his D2042, 14 Nov 26) — OPEN, waits for 30 more app-code jobs
**What it is:** the 7–14 Nov 26 comparison (`raptor-port/docs/superpowers/briefs/2026-11-14-readers-compared.md`) found both readers worth keeping, but only 8 of its 42 jobs were app code — too few to say whether one reader is enough for a small app change. **When:** once 30 more app-code jobs since 14 Nov 26 have both Astra's and the fresh Opus reader's reports saved in that folder. **How:** the same count — per job, what both found, what only one found, what was confirmed (red-first) and fixed — split by the size of the change; then put to him with a recommendation. Nothing about the readers changes before his answer.

### [AGENT-BROWSER-TRIAL] Trial Vercel's agent-browser on one short walk (his D2043, 14 Nov 26, chat 77) — OPEN, after the jobs in hand
**What it is:** a free browser tool for AI agents (github: vercel-labs/agent-browser) that gives every button and box a short label so the agent clicks by label, not by reading screenshots. **The job:** read it at its source (D486: good practices fused into our own guides, never installed whole without his word); time one short walk done with it against the same walk done the usual way (a Playwright script, the host's own browser), counting tokens and time; say what it would and would not replace — the deciding pictures stay either way (D1271). **Done when:** he has the difference in one short report and has said whether to use it.

### [READER-COMPACT-HANDOFF] A blind reader that compacts is handed the host's handoff block (skill note 888, 8 Nov 26)
**What:** the compaction start hook (`.claude/hooks/compact-resume.mjs`, [COMPACT-WHEN-MOD]) pastes the branch's
`HANDOFF.md` block into any chat on that branch that compacts — a fresh, blind reader running as a helper included. On
8 Nov 26 (chat 13's final code read) the Opus reader compacted mid-read and was handed the host's own record of the
walk's fault and its fix; it said so, and its read was noted as not fully blind. **To do:** the hook pastes the block
only into the chat that owns the branch — tell a helper or reader session apart (its parent session, or a marker its
brief sets) and print the re-read reminder alone there; a test in `compact-hooks.test.mjs` for each kind of session.
Until then the readers' brief carries the stop-gap (`raptor-port/docs/bug-check-order.md` §4, "Never show either model
the other's conclusions"). A hook change: on his word, read as a guide change is. **Place:** with the next change to the
compaction hooks; low.

### [RULE-FILE-LESSONS] Six lessons whose only home is an always-loaded rule file or the steps for recording a ruling (skill notes 733, 734, 859, 860, 938, 951; 28 Oct – 15 Nov 26)
**What:** the skill-notes review of 10 Nov 26 could not draft these, because they belong in files only the rules diet or
his word may change (`.claude/rules/record-decisions.md`, `.claude/rules/plain-language.md`, `DECISIONS.md`'s steps).
(a) **The sweep for what a new ruling leaves behind (D201) searches by the rule's subject across every Markdown file in
the repo** (the archives and the full-text rulings left out), not a list chosen from memory — the plans under
`raptor-port/docs/superpowers/plans/` among them, whose tables of open questions are homes of each answer — and the
readers' brief names the search that was run, so they can widen it (859, 724: four guides and a backlog item still
named the old readers on 8 Nov 26; a plan showed two answered questions as open for five days). (b) **A ruling that
changes the rule for one of several parties is rewritten clause by clause:** before rewriting each line it touches, list
every clause of the old line (each party, each safeguard, each window or date) and mark it changed or carried over; the
rewritten line keeps every carried clause (860: D1770 dropped the "owed list" safeguard for the unchanged reader, in five
files). (c) **A blanket approval ("all as recommended") is recorded from the page he answered:** each rule is written from
that page's own recommended words, at the version he saw (`git show <commit>:<page>`); anything only in the plan behind
it is the agent's reading, marked; and the fresh reader of such rulings checks every number and condition of the line
against that page version (734, met twice on 28 Oct 26). (d) **The check before sending, a step that counts:** list every
screen, tile, figure or control the message names; each has a picture in the same message, or it is not sent (733:
D853 and D921 were loaded and missed, "rules, not screens").

**Added 20 Nov 26 (the skill-notes review, group D-reads-records) — two more for `DECISIONS.md`'s steps:** (e) **A batch
of rulings is planned before its rows are written:** read each target page's free room against its hard limit (its
`PAGE_LIMITS` row in `raptor-port/scripts/docsize.mjs`) — the area chosen by the subject it governs (D137), then its
room checked, a page's limit raised where a new feature's rulings need it (D2148); decide for
each row whether it truly changes or answers an older ruling — if so, its mark and the citations on every page line
stating that ruling go in the same script; if not, it is not worded as one (938, 13 Nov 26: three refusals in one batch
of seventeen — a page 11 bytes from its limit, another under 230, and a row saying it "answers" an older ruling, which
asked for a mark and five citations). A cheaper guard beside the words: `docsize` prints each page's free room. (f)
**A ruling number counts as taken only once another open chat could see it:** before writing a row, look for other open
chats (`ListAgents`) and for uncommitted rows in the rulings files (`git status --short .claude/rules/decisions
.claude/decisions-full`); tell a chat that shares the folder before writing (951, 15 Nov 26: two chats in one checkout
both took D2056, each blind to the other's uncommitted row; settled by a message and a renumber). The root — two chats
in one folder — is already against the memory note on one checkout per session.

**To do:** draft each as the smallest change to its file; read by Astra and a fresh, blind Opus reader, each blind to the
other (D1761, D1770); on his word, and his "merge live". **Place:** his to place — with the next change to those files.

### [TRK-TRIAL-TESTS] The Tracker trial's leftovers — each on his word (D1941, D1942; filed 9 Nov 26, chat 36)
**What:** the rules diet's Tracker trial merged live 9 Nov 26 (pull request 725). Three things it left, none started without his word: (1) **the tests** that would let the 20 rulings on the Tracker page's "Built, stated here: their tests hold only part" leave for the "Built, held by tests" line — D64, D121 with D1014, D124 with D130, D372, D373, D374, D376, D922, D924, D980, D1003 with D1018, D1132, D1135, D1170, D1406, D1705 — each missing check named in the two readers' reports, `raptor-port/docs/superpowers/briefs/2026-11-09-tracker-trial-read-{astra,opus}.md`; (2) **D1405 archived as spent, 10 Nov 26, on his D1970** (the stray scroll bars fixed first, done); (3) **the other areas** take the trial's shape one at a time, each on his word (D1942), How we work last — Inputs on his word, 9 Nov 26 (D1943), MERGED live the same day on his "merge live" (pull request 728; the plan's §Step 5b — the Inputs pages); the scheduler on his word (D1944), merged 9 Nov 26 (pull request 730); the Leave War on his word, 9 Nov 26 (D1947), started on `claude/rules-diet-leave-war-page`; the Inputs leftovers, each on his word: (a) 16 proposed archivals (the sorting table's end, `raptor-port/docs/superpowers/briefs/2026-11-09-inputs-trial-sorting.md`; D1386 and D961 noted for the D971 reader); (b) D701 against D723 — recommended: keep the app as it is (the SANS day "Grit · 12 Jul, 14:42", a card only "By Saber"); (c) the scheduler's D660 against D762 — recommended: D762 stands as built, D660 keeps only "the filer answers once"; (d) the tests that would let Inputs rulings leave for the "Built, held by tests" line (the two readers' reports, `…-inputs-trial-read-{astra,opus}.md`). The before-and-after page: https://claude.ai/artifact/DwTZaf44yRPMwhb5s4aLoN (its page 4 bytes under its limit). Before-and-after page shown to him: https://claude.ai/artifact/LKGs13C3NBJnSurmtcDwdg.

### [SCHED-PAGE-LEFTOVERS] The scheduler's page's leftovers — each on his word (D1944; filed 9 Nov 26, chat 43)
**What:** the scheduler's rulings became a page (`.claude/rules/decisions/scheduler.md`, the plan's §Step 5b — the scheduler's page), read blind by Astra and a fresh Opus reader, every finding acted on (`raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-fixes.md`). Left, none started without his word: (1) **D663, the changes window's heading for a group input:** he chose "Input · Meeting · 4 people", the names listed under it; as built a filing made today reads "Input · Bane, Casper, DJ, Stiff · Meeting" — every name in the heading, no count, nothing under it (`src/ui/changesmodel.test.ts`'s last describe pins the built form). The page states his pick and the difference. Recommended: put the two side by side to him with pictures of the real app and a group of eight; his pick kept → a small fix, a test red first; the names preferred → a ruling that changes D663. (2) **D1041's change-mark** — done 9 Nov 26 on his D1946 (spent): the mark written, the OIL page's D1041 line cites D1044, D1045, two phrases tightened. (3) **D1751's readings:** taking a day, the 30 minutes, "Done editing" and an admin's take-over asking first are kept by the agent's reading only, told to him, never checked — one short question when [DB-SYNC-MODEL] is planned. (4) **D511 against D1026, D1034:** does RALLY in "+ In-time" make a rally. (5) **The tests** that would let the 28 rulings taken off the "Built, held by tests" line go back to it (D65, D114, D187, D270, D272, D513, D517, D531, D550, D551, D553, D562, D594, D605, D663, D733, D769, D824, D828, D831, D840, D860, D958, D1010, D1020, D1031, D1064, D1781), each missing check named in the two readers' reports (`…/2026-11-09-scheduler-page-read-{astra,opus}.md`). (6) **Proposed archivals:** D1035, D1114, D1115, D1800, D830, D807, D806, D759, D703, D546, D532, D274, D110, D502, D51, D100, D340 (the sorting tables' notes). (7) **Two settled entries that concern only the Inputs pages** stay on the scheduler's page (D802's split) — moving them is his word. (8) **Rows that still say "Not built" though built:** D1038, D1042–D1046, D1060–D1065 — the agent's, a records tidy. (9) **Stale reference docs** (sorter D): `ui-contracts.md`'s board arrows "disabled at the week's ends", `feature-impact.md` naming the deleted Manage sheet, `engine-rules.md`'s "0700" against the time format's "07:00" — the agent's, with the next work there. (10) **Unsure, for the D971 reader:** D1030 by D1038, D278 by D753 — not plainly changes, no mark; whether one placeholder may stand twice on a row that came from an input is not ruled. The scheduler's D660 against D762 is item (c) of [TRK-TRIAL-TESTS].
**Place:** the rules diet's, after the page merges; (1) and (2) are his.

### [LW-PAGE-LEFTOVERS] The Leave War's page's leftovers — each on his word (D1947; filed 9 Nov 26, chat 46)
**What:** the Leave War's rulings became a page (`.claude/rules/decisions/leave-war.md`, the plan's §Step 5b — the Leave War's page), read blind by Astra and a fresh Opus reader, every finding acted on (`raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-fixes.md`). Left, none started without his word: (1) **D1177's readings and D333's admin half:** the admin decides bids at any time; the war lands on the first open date from today, else today, else the period's first day; a member moves his own bid only while it waits and its days are open; the admin may move any bid — each built, drawn for him "his to strike", never confirmed; the page marks them the agent's readings. Recommended: one short question, "keep as built?", with pictures of the real app, so each can be stated as his. (2) **D1318 against D1211:** may a member file an overseas duty or a course on a past day — D1318 says "any date, open for bidding or not", D1211 says a member never bids before today; the page keeps both. (3) **The tests** that would let the 7 rulings taken off the "Built, held by tests" line go back to it: D1270 (the colour strip opened and the armed Reset order, each without a sideways spill), D1331 (the whole title for a half and a whole day), D1469 and D1476 (the name puck's and OCU chip's colours equal to the schedule's, in a browser), D1375 (ATCH's own fill, edge and letters), D1360 (a two-level bubble, each pair in its colour), D1351 (a course and an Other filed from the window, "This course", "This Other"). (4) **Proposed archivals (about 22):** D1850, D1723, D1559, D1563, D1475, D1404, D1348, D1343, D1340, D1319, D1317, D1299, D1265, D1250, D1140, D1204, D1206, D1232, D1199, D1182, D1165, D1161 (the sorting tables' notes) — each checked for a live part first (D1563 is now cited for a reading). (5) **Stale reference docs** (sorter D): `ui-contracts.md`'s "TWO orders", its old one-row top and zoom-pair passages; `file-map.md`'s "no grip"; the pointer to "`performance.md` §Leave War window engine", which is §C and §E — the agent's, with the next work there. (6) **Unsure, for the D971 reader:** D1254 over D1227 (My leave's place — plain in D1254's words, not marked, since the mark would owe D1254 and D1483 on four bubble and Manning-rows lines that state nothing of My leave); D1326 by D1356 (the chain already runs through D1338's mark). (7) **A test of the column window's landing** — "never reset to month 0 on a war change" is now on the page and in a code comment (`src/leavewar/ui/Matrix.tsx`); a quick search found no test that names it — check, and add one red-first if none holds it.
**Place:** the rules diet's, once the Leave War's page merges; (1) and (2) are his questions.

### [RECORDS-MERGE-SAME-ADD] The settle step doubles a skill note both sides added word for word (found 9 Nov 26, chat 36)
**What:** bringing `main` into the Tracker trial's branch (pull request 725), `records-merge.mjs` reported the skill log's note 905 ("Add-only" was a guess…) as "added on main's side" and again as "added on this branch", and kept both, renumbering this branch's copy to 909. The two were identical, apart from the number. The base held neither: this branch had taken the note in an earlier bring-in of `main`, and `main`'s side then carried it from chat 40's merge. Chat 36 dropped the copy by hand. **Expected:** a note added on both sides with the same text is one note (the step's own rule: "the same on both sides … that side"), whatever its place. **Fix:** in the skill log's settle, match added notes by their text without the number before renumbering, with a test of this case in `records-merge.test.mjs`. Nothing was lost; the cost is a doubled note when unchecked.

### [USERS-ARCH-FOLD-DRAFT] Folding Archived resets an open archived editor (found 8 Nov 26, walker C of pull request 702)
**What:** on Admin → Users, with an archived man's editor open, a new callsign typed and Delete armed, folding the Archived group and unfolding it shows the editor still open, but its box reads his old callsign again and Delete is no longer armed; the roster's editors keep both through the same fold. The same on `main` and on pull request 702's branch (`raptor-port/docs/handpass/parts/2026-11-08-rd-last-findings-walkC.md`, S14 "Fold Archived, unfold — archived"). Nothing saved is wrong — only typing not yet saved is dropped, silently. **To do:** keep the archived editor's typing and armed Delete across the fold as the roster's are, or close it on the fold so it does not look kept; a test red first. **Place:** low, the agent's — with the next People and accounts job.

### [CHAT66-OPEN-ROUND] What the night of 11 Nov 26 left for him — his answer to question 1 and a small round (filed 16 Nov 26, chat 89)
Moved whole from chat 75's handoff block when it left `HANDOFF.md` (16 Nov 26, chat 89), where it was the only home: **Carried from chat 66, still open:** his answer to the night of 11 Nov's question 1 (the bell); that night's small round, not yet put to him one by one (D994 — ask first whether he wants it now): Escape and the changes window; Tab and the board's buttons; the drawings that need his look (D1625); the two other "N warning" places; a walk-scripts lesson; the last box resting under the note. The general rulings page and OIL's page are near their hard limits (D1932) — the next ruling stated on either needs a tightening or his word. Question 1 (the bell) comes from that night's Leave War double-tap job — a window's ✕ that sits over the top bar's bell, so a second tap opens the bell's list (briefs `raptor-port/docs/superpowers/briefs/2026-11-11-lw-doubletap-windows-*.md`). Escape and the changes window is also `[CHGWIN-ESCAPE]`. **Place:** put to him only when he says (D994).

### [STANDBY-NO-TIMES-SEAT] A WSO or ground crewman in an AVALON or BB front seat with no times raises no "Illegal seat" line (found 16 Nov 26, walker w1 of `[WARN-WORDS-STANDALONE]`'s follow-ups)
**What:** on an AVALON or BB line whose START and END are blank, a WSO dropped in the front seat gets only the crew picker's drop note ("WSO — cannot fly front seat") and no line in the issues list, no Q chip; with START and END typed the "Illegal seat: …" line comes. An ordinary flight with no times does warn ("… of this line (no times yet)"), and a man on leave is flagged on a row with no times (D605). The same on `main`: a standby shift with no times has no window, so its seats are never collected for their checks (`engine/validate.ts`, the AVALON checks' comment). Pictures `raptor-port/docs/img/handpass/2026-11-16-warn-words-followups/w1/s07/04-bb-main-freak.png`; evidence sheet `raptor-port/docs/handpass/2026-11-16-warn-words-followups.md`.
**Fix:** collect a standby line's seats for the seat check even with no times, the line named without hours ("… of BB SHIFT MAIN (no times yet)"), as a flight's is — tests first; the words shown to him first (D1625).
**Place:** the scheduler's next batch; older code, not urgent (the drop note still warns the scheduler at the moment of the drop).
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q1.

### [INPUT-WIN-SCHED-ASKS] The schedule's input window closes on Escape or ✕ without asking, with words typed (found 17 Nov 26, the walk of the schedule's small fixes)
**What:** on Edit Schedule, an input's window opened from a Personal Inputs name, with words typed in Remarks, closes
on Escape or on its ✕ at once — the words lost, no "Close it and lose them?". The Inputs page's own window asks in the
same case (D1622: with anything typed and not saved, ✕ asks the very question Escape asks). The same on `main`'s code
(5632936d5), from Edit Schedule and from the Inputs page — older, not that night's change: the question is asked only
where the window floats (`raptor-port/src/ui/InputWindow.tsx`, the Escape handler's `win && unsavedNow()`). Typing in
Remarks counts as unsaved. Evidence: `raptor-port/docs/handpass/2026-11-17-sched-small-fixes.md` §10 (the lead).
**His question:** does D1622 cover the schedule's input window too? **Recommended: yes** — losing typed words is the
same harm on either page, and the schedule's window is the one he uses most. If yes: Escape and ✕ ask there as on the
Inputs page (a tap outside it still closes it, as built), tests first, a short walk; the question's look is the
Inputs page's, so no new drawing.
**Place:** the schedule's next batch, once he answers (D994: put to him when he says).

### [SIM-OVERLAP-WARN] Two sessions overlapping on one sim raise no warning (his D2181, 17 Nov 26, chat 103)
**What:** on a day's schedule, two sessions on the same sim (AMT or OFT) at overlapping times — e.g. OFT 09:00–10:30
and 10:00–11:00 — raise nothing: the checks compare people, never the device (host-checked in
`raptor-port/src/engine/validate.ts`, 17 Nov 26). His D2181: overlapping sessions on one sim are warned, from one
squadron or two. **Steps:** tests first; the warning's words and look drawn and shown to him before the build (D1625,
something new he will see); a short walk. The cross-squadron half waits for the multi-squadron build ([MULTI-SQN-DESIGN]).
**Place:** the schedule's next batch.

### [SANS-CHIP-ON-SANS] The Post out sheet offers "SANS" to a man already SANS (found 17 Nov 26, chat 102's SANS drawing helper, E2)
**What:** the posting's four chips (Overseas Sqn, Delete, SANS, Transfer to Sqn) hide "SANS" only for ground crew
(D1709 — `raptor-port/src/leavewar/ui/OutcomeChips.tsx`, its `noSans`, set from the man's ground-crew mark at its three
doors: `BidPicker.tsx` twice, `Matrix.tsx`, `SelectSheet.tsx`); a man already SANS is offered "SANS" too, which posts
him out to what he already is. His D2163 (17 Nov 26): the SANS chip is not offered for a SANS man. Host-checked in the
code 17 Nov 26 (chat 103): `noSans` reads only the ground-crew mark. Not yet checked: whether today's Post out sheet
opens on a SANS man's row at all (D2163's reading) — the fix's first step, on the app.
**Steps:** tests first — a SANS man's Post out sheet (each of the three doors) shows Overseas Sqn, Delete and Transfer
to Sqn, no SANS; then `noSans` set for a SANS man as for ground crew; a short walk. Nothing new to see, so no drawing
(D1625). Independent of the multi-squadron build (D2086, D473).
**Place:** the next Leave War batch (D490).

### [SCHED-SMALL-TIDY] The code reads' tidiness note on the schedule's small fixes (D489 — filed, not fixed; 17 Nov 26)
**What:** the fresh Opus reader's tidiness note on `claude/sched-small-fixes`: in the schedule's tap code
(`raptor-port/src/ui/interactions.ts`, accepting an input onto the programme) the list `seen` mirrors the list
`strays` — two lists of the same names kept side by side. Nothing a person sees. The note's other points were fixed in
the job (one close per window, the stand-aside's name, two stale texts). Read: `raptor-port/docs/handpass/2026-11-17-sched-small-fixes/read-opus.md`.
**Place:** with the schedule's next batch that touches that code; low.

### [INSET-DAYS-ENTER-ONLY] The late cut-off's "days before" box keeps a typed number only on Enter (seen 15 Nov 26, walker W3)
**What:** in the Inputs calendar settings window (opened from the Logic page's "Inputs late cut-off"), typing 10 over 14 in the days-before box and then pressing Tab or the window's ✕ kept 14, silently; Enter keeps 10 and closes the window. A box that drops a typed value without a word breaks the guide's "a changed value shows changed". Evidence: `raptor-port/docs/handpass/parts/2026-11-15-rcb2-w3.md` observation 2. **To do:** decide with him whether leaving the box (Tab, a tap away) keeps the number as the Logic page's own boxes do — recommended — and what ✕ does; a test; a short walk. Older code, not this batch's change.
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q8.

### [ENGINE-RULES-REVIEW] The whole rules engine reviewed rules-first — his D1983, 11 Nov 26 (chat 63)
**What:** no review of the whole engine was ever run (searched 11 Nov 26: the rulings, the backlog, the evidence sheets); each change to it was checked alone (FULL, two readers). A rules-first review — the standing brief `raptor-port/docs/superpowers/briefs/rules-first-red-team.md` — lists every ruling about what the warnings flag and how a rule is read (`.claude/rules/decisions/scheduler.md` §Warnings and the rules engine and the rest of that page, OIL's hours, `raptor-port/docs/engine-rules.md`), checks each against `raptor-port/src/engine/` with a test, and reports gaps, contradictions and weak spots — above all where the rules built on the original meet (report times and rallies, standby lines that fly, hidden warnings, the published-day freeze, OIL hours). **Done is:** a report for him in plain words, each finding with its ruling, its failing test or its reason, put to him or filed; nothing in the app changed by the review (the original's engine stays word for word, D1537). **Who:** Fable 5.2 hosts (D1972), the night of 11 Nov 26, its own branch from `main`. **Under way, chat 64, 11 Nov 26** (branch `claude/engine-rules-review`): the worklist `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-worklist.md` (96 items, nine families), each family's reviewer's brief `raptor-port/docs/superpowers/briefs/2026-11-11-engine-rules-review-family-brief.md`, its tests `raptor-port/src/engine/rulesfirst-<n>-<slug>.test.ts`, the report `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md`.
**The review ran 11 Nov 26 (chat 64); its report:** `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md`. 96 items; 86 match; 11 faults; 10 questions; 119 tests added (108 `it`, 11 `it.fails`); the nine reviewers' results beside it (`…-engine-rules-review-results-<n>.md`). The faults:
1. F1 — a published day's live crew-rest warning measures to today's brief setting, not the B the day printed (7.1) — test marked `it.fails` in `rulesfirst-7-published-day`; waits on Q8.
2. F2 — a seventh day in a row is not flagged while that day's only task is a row with no times yet (3.1) — test marked `it.fails` in `rulesfirst-3-crew-rest`.
3. F3 — hiding a "takes off and lands at the same time" warning leaves a second, identically worded line's time box amber (6.1) — test marked `it.fails` in `rulesfirst-6-hidden-warnings`.
4. F4 — the duty-template sheet's AVALON and BB notes say the desk "earns no OIL"; it is off by default and can be switched on (D24, D35) (9.2) — test marked `it.fails` in `rulesfirst-9-oil-earners`.
5. F5 — Logic, crew rest: the fold never names the rally (3.4) — test marked `it.fails` in `rulesfirst-3-crew-rest`.
6. F6 — Logic, crew rest: "An SC SPARE carries no crew rest either way", untrue of a SPARE that flies (3.3) — test marked `it.fails` in `rulesfirst-3-crew-rest`.
7. F7 — Logic, tight turn: names only a typed in-time, but fires with nothing typed (3.2) — test marked `it.fails` in `rulesfirst-3-crew-rest`; waits on Q1.
8. F8 — Logic, OIL: a flying standby row earns "from its B or R (the earlier)", untrue of a B later than START (8.1) — test marked `it.fails` in `rulesfirst-8-oil-hours`.
9. F9 — Logic, OIL: "A row with no times … earns nothing", untrue of an accepted all-day request's row (9.1) — test marked `it.fails` in `rulesfirst-9-oil-earners`.
10. F10 — Logic, personnel: ground crew "checked only for clashes, the long day and days in a row", but their absences flag too (5.2) — test marked `it.fails` in `rulesfirst-5-seats-quals`; waits on Q6.
11. F11 — Logic, AAR: "an instructor without the mark is flagged instead", untrue of an instructor WSO behind (5.1) — test marked `it.fails` in `rulesfirst-5-seats-quals`.

**Waiting for his answers:** Q1–Q10 of the report.
**Not fixed by the review** (his words: a report, nothing changed) — each fault is a small build of its own once he has read the report.

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
**11 Nov 26, chat 64: built on `claude/next-jobs-recommendation-c110df` (pull request 756), waiting for his look and "merge live"; archive at merge.** Parts 1 (the plural "N warnings" on the week's issues bar) and 3 (the changes window's foot only where a drawn line can be tapped) are done; evidence `raptor-port/docs/handpass/2026-11-10-sched-board-small.md`. Still open, his word needed (D1625, a drawing first): the day's ⓘ panel "N warning · N advisory · N note" and Insights' tile "N warning" still read the singular beside the bar's plural; parts 2 and 4 as before.
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q3, Q4, Q5 (the plurals, the look banner, "N changes").

### [SCHED-MARKS-ASKS] Five small points chat 13 left open (filed 10 Nov 26 by chat 48, from chat 13's handoff block)
**What:** left by chat 13's job (D1784, D1785, D1792 a, d — evidence `raptor-port/docs/handpass/2026-11-08-sched-marks.md`
§13), none blocking anything: (1) the fresh Opus reader's reading (b) — whether an Unavailable change's waiting mark should
also show in OIL Earn (neither an Unavailable nor a Ground name wears one there now); (2) its reading (d) — the refusal's
words "this week's saved copy" when the week refused is another, stashed week (`main` said the same before); (3) whether
the older-version refusal should also say "Report it with "Report a problem"…", as the unreadable week's words do (D1785);
(4) the design check flags the section side-bars in `04-pucks-sections.css`, not that job's lines — read against the side
stripes he ruled to keep (D1025, D729) before a fix or a scoped skip; (5) older, never checked: a warning line's hide ✕
(beside its Reset arrow) — its keyboard ring, and Enter on it. **To do:** (1)–(3) put to him with a picture each when he
asks for questions (D994, D853); (4) read and settled; (5) checked in the next walk of the warnings. **Place:** Schedule and
amendments, small — with `[SCHED-MARKS-WALK-ODDS]`.

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
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q6 (parts 1 and 3).

### [RD-LEFT-1108] React Doctor's 31 findings left in the app after the shell-and-state job (found 8 Nov 26)
**What:** after `claude/rd-shell-state` (evidence `raptor-port/docs/handpass/2026-11-08-rd-shell-state.md`), React Doctor 0.9.18 finds 31 in the app's own code
(not the rules engine, not tests). **(1) 13 import cycles**, every one through `raptor-port/src/state/people-settings-commit.ts`
(with `accounts.ts`, `roster-add.ts`, `noticeseen.ts`, `flyplan.ts`, and `command/actor.ts` → `auth.ts` → `perms.ts` →
`accounts.ts`). A cycle cannot be kept with a reason on a line, so it is broken or it stays counted. The app starts and every
test passes, so none reads a value before it is set today; the risk is a later import that does. **To do:** find which of
its functions each importer takes, and move those to a file with no app imports, as the save indicator's source was moved
to `ui/savestatus-source.ts` — a change to saved data's path, so its own check (tier WALK at least). **(2) 18 in files outside
that job:** `ui/UsersPanel.tsx` 3, `ui/AdminPage.tsx` 2, `ui/AccessScreen.tsx` 1, `ui/SansCal.tsx` 1, `ui/SansDay.tsx` 1, and `ui/interactions.ts` 2 (a list
lookup in a loop — a file of job 1's pull request 664, left alone that night). Each rides with its area's next batch (D490,
D1534). **8 Nov 26, chat 29 (`claude/chat29-inputs-medical`, pull request 707):** `CutFields.tsx` 2, `DateCal.tsx` 2,
`MedicalView.tsx` 2 and `TypeLegend.tsx` 2 settled — 5 fixed, 3 kept with written reasons (evidence
`raptor-port/docs/handpass/2026-11-08-chat29-inputs-medical.md`). **Place:** the agent's, low — (1) with the next People and
accounts change, (2) as listed.
**LIVE 8 Nov 26 (pull request 702, his "merge live" typed in chat 35):** (1) the 13 cycles broken and (2)'s People & accounts six (`UsersPanel.tsx` 3, `AdminPage.tsx` 2, `AccessScreen.tsx` 1) cleared — evidence `raptor-port/docs/handpass/2026-11-08-rd-last-findings.md`. **Left: `SansCal.tsx` 1, `SansDay.tsx` 1, `interactions.ts` 2**, each with its area's batch. **17 Nov 26, `claude/sched-small-fixes`:** `interactions.ts` 2 fixed (the lookups by Set, the list order kept); left `SansCal.tsx` 1 and `SansDay.tsx` 1, the Inputs area's.

### [QUALS-PINNED-X-DEAD] The ✕ inside a pinned Quals heading does nothing (the night of 11 Nov 26, the walk)
In Edit quals with the page scrolled down, each heading in the pinned row under the top bar shows the ✕ that removes its column, and a press on it does nothing (11 columns before and after); the table's own ✕ removes the column at once and Undo brings it back. Older than the night's job — the pinned copy takes no click (`raptor-port/docs/handpass/2026-11-11-quals-small.md` §3 row b2, the walk's B4). **Place:** small, with the next Quals job — the press handed to the table's own ✕, or the ✕ not drawn in the pinned row.

### [QUALS-DRAG-LEFTOVERS] What the 11 Nov 26 Quals job found and left (the night of 11 Nov 26)
From the walk, the two code reads and the two narrow reads of `claude/quals-small-1111` (`raptor-port/docs/handpass/2026-11-11-quals-small.md` §12, §15). **His iPhone look first** (no test browser makes a finger's drag in Safari): a pinned heading dragged by a finger, a second finger put down during it, and a filter cleared when it hid the man the page was sent to. Then, each small:
1. **Two fingers on the pinned row do not zoom the table** — the table's own rows do; joining the pinned row to the pinch is a new behaviour in the pinch shared by five screens, not built (Astra's step 5).
2. **No Escape cancels a column drag** (older).
3. **The outline after "Check his quals" never ends while the page stays open** (seen for 65 s; it goes when the page is left) — his to say whether it should end.
4. **A window resized in the middle of a drag leaves the lift frame at its old place** until the drop (`raptor-port/docs/img/handpass/2026-11-11-quals-small/r-pin/R4b-pc-1-mid-drag-after-resize.png`).
5. **Two cases no test holds** (the second narrow read): a newer ask whose row is not drawn, arriving inside the waiting frame — the older waiting trip must not run; a release just after the pinned row goes mid-drag writes nothing.
6. **The browser tests of the pinned row run only where the browser pins it by scroll-driven animation** — the other path (Safari's engine) is unwalked by a test.
7. **Two fingers on the table's own heading moved the page 13px** (the re-walk's R3c, observed once).
8. **On a phone, a finger's drag of a pinned heading to the edge, and of a column just added**, were not driven (walked on a desktop).
**Place:** low, with the next Quals job.

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

### [DATECAL-GLIDE-TEST-FLAKE] The date calendar's "a glide caught, held still, then dragged" test fails on GitHub, then passes on re-run (17 Nov 26, filed by chat 105)
**What:** the browser test "a desktop: a glide caught, held still, then dragged, moves on from the year it was caught at" (`raptor-port/e2e/datecal.spec.ts`, added by the wheel-drag job, pull request 797, D2170) failed on GitHub's machines on 17 Nov 26 and passed when re-run. He saw it fail 2 of 4 runs; the host's count of that day's runs (chat 105) found it failing in six: `main`'s run after pull request 797 merged and again after 798, the multi-squadron branch twice, the Leave War four-items branch twice — each a run on its first try, the re-runs green. Every time it failed in its setup, before the part it tests: 28 quick ArrowDown presses on the open year list should carry the year from 2026 to 2054, and the list came to rest on 2027 to 2036 instead. Nothing else in the calendar file failed.
**An open question before any fix — is it the test or the app?** Each arrow press moves the choice one year and scrolls the list there; the list also takes the row left in its band once scrolling has stopped for 110 ms (`Wheel`'s `settle`, `raptor-port/src/ui/DateCal.tsx`). On a slow machine that settle may land mid-scroll and take an earlier row, so later presses count on from it and years are lost. If so, a person holding the arrow key down on a slow PC could lose years too — a real fault, not only a test's. The host has not reproduced this; it is a reading of the code.
**A fix already waits:** pull request 802 (`claude/cal-wheel-drag-e4107b`, green, open) changes only the test's setup — the list scrolled 28 rows at once and left to settle, in place of the 28 presses. That makes the test steady but would hide the app fault above if there is one, so it is not merged until step 1 is done.
**Steps:** (1) on a slowed browser (CPU slowed four to six times), press ArrowDown 28 times quickly on the year list and see whether it reaches 2054; then the same by hand on his PC. (2) If years are lost: a failing test of quick presses first, then the list fixed so every press counts (the arrows count from the chosen year, never from a row the settle caught mid-scroll), a short walk — and pull request 802's setup change kept only beside that test. If none are lost: pull request 802 as it is. Either way it goes live on his "merge live" (a test file is not notes). **Place:** the next calendar or checks job; small, needs no answer from him unless step 1 finds a fault.

### [CI-BROWSER-DEPS-DOWNLOAD] The browser checks fail when Ubuntu's package servers cannot be reached (11 Nov 26, chat 65)
After pull request 760 merged on his "merge live" (11 Nov 26, 21:57; merge commit `b476db83a`), `main`'s own run (GitHub run 43033829522) failed three times in an hour — at 22:03, 22:15 and 22:50 — the same way each time: all nine browser jobs (seven `geometry`, two `tracker (smoke)`) stopped in the step "Install Chromium" (`npx playwright install --with-deps chromium`, `.github/workflows/deploy.yml`), which fetches font packages from Ubuntu's package servers; every fetch ended "Temporary failure resolving" for `archive.ubuntu.com`, `security.ubuntu.com` and `azure.archive.ubuntu.com` (468 such lines a try). No test ran; the build, the code check and all ten unit jobs passed. The same nine jobs had passed on the same code at 21:45, on the pull request's run. GitHub's status page showed no incident. The live app was built by Vercel and is READY (the Production deployment of `b476db83a`), so the fix is live; only the after-merge run is red. **To do, in order:** (1) re-run the failed jobs once (`gh run rerun 43033829522 --failed`) and read the result — if green, say so and strike this step; a pull request's run meets the same step, so a red one there is read for this cause before anything else; (2) stop the checks depending on that download every run — the workflow's own note already says the step took 8 to 16 minutes in 9 of 20 runs. The agent's reading of the choices, not yet built or read: keep the fetched packages between runs (a cache of the font packages beside the browser's own cache), or retry the step a few times with a wait; NOT simply dropping `--with-deps` — the browser tests measure text, and a machine without those fonts may measure differently. A change under `.github/` is not notes: it merges on his "merge live", read as a working-guide change is. **Step 1 done, 12 Nov 26 (chat 66):** the fourth try failed at 00:21 the same way — the same three servers, all nine browser jobs, no test run; told to him. **Step 2 BUILT 12 Nov 26 (chat 66, the night's job 1): pull request 761, green, read by Astra and a fresh, blind Opus reader — LIVE 14 Nov 26 on his "merge live"; `main`'s runs green since (checked 17 Nov 26).** The nine browser jobs run inside Playwright's own image (runner and image Ubuntu 26.04), the runner's fonts lent to it; the reads and what was done with each finding: `raptor-port/docs/superpowers/briefs/2026-11-12-ci-browser-deps-read-*.md`. **Left, not built:** cover for an outage of Microsoft's image store (Astra's P3 — a mirrored image); a font read-out from a bare machine to compare with; the image tag written once, not twice. **Place:** the leftovers with the next checks job.

### [BLOCK-MENU-BB-DESK] The "+ Block" menu calls the built-in Standard block "BB desk" (found the night of 12 Nov 26 by the rules check's walk; his D2021, 13 Nov 26)
Older than that night's work: on the Scheduler Board and Edit Schedule the "+ Block" menu lists the built-in Standard block under the name "BB desk". His answer (D2021): a small fix for later, not now. **To do:** find where the name comes from and what the block is called everywhere else; if the right name is plainly the block's own, change it, tests first; otherwise put the name to him with a picture of the menu (D1625). A LOOK at least. **Place:** later — with the next small scheduler batch.
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q2.

### [APPR-OLDER-ODDS] Four small older things on the Approvals page (found 13 Nov 26 by the Approvals job's walk and reads)
**What:** seen by the walk and the reads of `[APPROVALS-SCROLL-INSIDE]` (`raptor-port/docs/handpass/2026-11-13-approvals-scroll-pc.md`, the builder's report beside it, findings 8, 9 and 12), each the same on `main`, none losing anything: (1) pressing the chip that is already lit starts the list afresh at its top (its lit lines go); (2) Approve all's left edge moves up to 6.8px as its count changes, its right edge still; (3) on a PC a tap on a name's puck does nothing; (4) a picked range with no requests hides the column headings. Also its tidiness note (finding 15): the fit rule and its page class are paired the same way in both pages, and the screen-height reading is exported but used only in its own file. **To do:** (1) and (3) — whether each is meant is his question, with pictures; (2) — a control that moves under the finger (2 Sep 26 rule) — to reproduce and, if it is, fix with the next Leave War batch; (4) with the same batch. **Place:** the next Leave War batch.

### [LW-DOUBLETAP-LEFTOVERS] What the double-tap job's reads filed (15 Nov 26, chat 81, job 3 — all low)
Not faults a person meets now. From the reads of `[LW-DOUBLETAP-MORE-WINDOWS]` (`raptor-port/docs/superpowers/briefs/2026-11-15-lw-doubletap-more-coderead-{astra,opus,narrow}.md`; the sheet `raptor-port/docs/handpass/2026-11-15-lw-doubletap-more.md` §15):
1. **Tidiness:**
   - the comment repeated in `Matrix.tsx` and at `gridguard.ts`'s head;
   - `useFlyWindowsGuard` is named for its job, not for the code check it satisfies;
   - the helper's `pad` argument covers the desktop editor too;
   - Matrix's own document key listener now duplicates the key counter;
   - the browser test's `behind` list is a hand-kept copy of the window presses;
   - the guard's freshness comment has two stacked layers.
2. **Older:** if the red days drop to zero while the under-manned list is open, the list hides but stays open, then catches the first Escape.
3. **Older:** the first-ever period's Create has no guard.
4. **Low:** a Required close delayed past a second would not arm the guard.
5. **A load-sensitive test:** the event window's Save then Delete (its one-second limit, on `main`) failed once under the full suite.
6. **A test case:** a finger landing a move then a tap near it. The landing test became a mouse case; keep both versions.
7. **Two document notes:**
   - `.claude/rules/seams/leave-war.md`'s list of who reads the war through `sync.ts` should name `useDaysWinUp` (the Calendar window's open state, a rider beside `openDays`);
   - `raptor-port/docs/performance.md` §E should say the page's Body now listens to the scheduler's store for it.

**Place:** the next Leave War batch; (7) with the next change to those files.

### [LW-ROLLBACK-FOCUS] A refused war change puts back the jump-to-a-day state (the night of 6 Nov 26, read F5)
A refused change restores the war's records, and since 6 Nov 26 keeps the role and viewer; it still restores the fields that make the grid jump to a day, so the grid can jump back after one. Keeping them live could part them from the person in view, so it needs its own look. **Place:** the next Leave War batch.

### [CHAT72-LEFTOVERS] Small notes the three jobs of 14 Nov 26 left — all low (filed 14 Nov 26, once pull requests 768–770 merged)
**Not faults — nothing a person sees is wrong.** Each job's whole story is in its archived item ([LW-BIDPICKER-CSS-INSIDE], [INP-ROOM-TIDY-2], [LOCATE-ITEM-MARKS], [DRAW-MARK-HELPER], in `OUTSTANDING-ARCHIVE.md`) and its evidence sheet (`raptor-port/docs/handpass/2026-11-14-{bidpicker-css,code-tidy,check-tools}.md`).
(1) **For him, with pictures, when he next looks at the Leave War — a question not put until he says (D994):** about a dozen looks the bid sheet's stylesheet meant but never showed, removed to keep the look he walked — the counter form's dashed "is / is not" and dimmed "Without" row, its 64px count box and a bad point box's red edge; Reset counters "quiet at rest" and Reset order's dim hover; the non-blocking window's brighter edge; Grant OIL's dashed 118px "other" box and 8px row gap; the leave buttons' clear edge; the Required note's width rule.
(2) **Three guide wordings for the drawing helper** (given word for word in the archived [DRAW-MARK-HELPER]): the mock-up guide's step 3 and its first trap, and the walk-scripts guide §10's marker sentence — a guide change, read by Astra and a second reader (D1761).
(3) **The readers' tidiness notes (D489):** the bid sheet's "MOVED INSIDE" comments repeat one reason (one line naming the winning rule would do); the guard test's rule-5 text now guards an empty list; the delete-sure test's name still says "wrap, in every window"; three history notes explain nothing now; one shared note on the `:where()` pattern would read easier; the stylesheet's opening claim should name the states captured; the Inputs room comments repeat their reason and the note above the unused `dragging()` could be shorter; the `oilkeysback` test largely repeats the H1 test.
(4) **A known edge, written above `locate()` in `raptor-port/src/ui/sheetfocus.ts`:** after a sheet opened from a week or board puck (the OIL question), the keys may come back to the same man's other puck that day — only the ring moves; Enter and Space do nothing on a puck.
**Place:** (1) his, when he asks; (2) with the next guide change; (3)–(4) the agent's, with the next Leave War, Inputs or drawing batch.

### [RULES-DIET] Cut what a chat must read before it touches code (D1718, 6 Nov 26; started now on Opus — D1732, 7 Nov 26)
**What:** chats fill up and hallucinate; measured 6 Nov 26, a job reads about 250,000 tokens of rules, notes and records before any code, with 1,302 live ruling lines. Each area's rulings become a short page of how it works now, the old rows archived but searched; the working rules and the bug-check order become one-page checklists; rules become automatic checks where they can. **Started 7 Nov 26 on Opus with high thinking (D1732, replacing D1718); the plan is read by Astra and a fresh Opus reader, each blind.** Needs his word on the rulings that keep every live ruling in the list and set no size targets. The brief, with the measurements: `raptor-port/docs/superpowers/plans/2026-11-06-rules-diet.md`. **Plan v1 drawn 7 Nov 26** on `claude/rules-diet-plan`: `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`, with two measured samples (`…-sample-how-we-work.md`, `…-sample-oil.md`) and the readers' brief `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-plan-read.md`; v2 folds in the fresh Opus reader's report (`…/briefs/2026-11-07-rules-diet-plan-read-opus.md`); v3 folds in Astra's blind read of v1 (`…/briefs/2026-11-07-rules-diet-plan-read-astra.md`, 7 Nov 26 on his PC), with the two reads compared in the plan's review log; **approved 7 Nov 26 as recommended — D1735 (the shape), D1736 (permission for the hooks and the document check), D1737 (every step on his "merge live"), D1738 (Astra beside the fresh Opus reader on the Inputs, scheduler and Leave War pages).** **Place:** now — step 1 (the checks and scripts) and step 2 (the cheap moves; the skill-notes short form and the shorter note on each message switched on, D1740) merged 7 Nov 26, pull requests 656 and 657; step 3 (reading by section) merged 7 Nov 26, pull request 658: the three reads 119,787 → 98,547 tokens (−18%), not the plan's ~29,000, since every section a step names stays a whole read (D1735) — the plan's §Step 3; step 4 (the every-chat layer) merged 8 Nov 26 by his "auto merge live" (D1750), pull requests 663 and 665: what every chat reads at its start 42,767 → 33,423 tokens (−22%); his answers on it recorded and merged 8 Nov 26, pull request 671 (D1760–D1762) — his question whether Sol 6.1 is worth adding as a third reader of the diet's reworded steps answered "keep two" (D1763), no third reader; step 5a (OIL first, the full trial) merged 8 Nov 26 on his "merge live", pull request 684 — the page and its account, the trial of the whole route and the two reads compared: the plan's §Step 5a; step 5 finished 9 Nov 26 (every area a page); step 6, the final measure, done 9 Nov 26 (chat 47) — the plan's §Step 6; later, stating once what both the general page and a checklist state (D1762). **The general page is full** (chat 47, 9 Nov 26): 37,998 of its 38,000-byte hard limit (D1932) — D1949 went on as a clause of D1741's line; the next ruling stated there needs a tightening, or his word to raise the limit.
**Found in step 5a (8 Nov 26), not fixed:** D43's full row in `.claude/decisions-full/oil.md` stops mid-sentence ("it inherits the seat's") and has since it was first written — the page states D43 from its short line and D755; the lost words are not guessed at. **To do:** find them in the chat or commit that recorded D43 (22 Sep 26), or put the sentence to him. **Place:** with the next OIL work.

### [PAGE-FAULT-BLANKS-APP] A fault inside the Leave War or the Tracker still blanks the whole app (found 4 Nov 26, the Leave War small fixes)
**What:** since D1631 a failed DOWNLOAD of either page is caught on its own page, with Retry (`raptor-port/src/ui/pageload.tsx`); a fault in the page's own code while it draws is deliberately passed on, and with nothing above it to catch it the whole app goes blank, top bar included, as a failed download did before. Not seen happening; worked out from the code and pinned as passed on by `pageload.test.tsx`. **To do:** if wanted, a catch of its own with words that do not blame the signal ("Something went wrong opening the Leave War" — his to see first, D1625), and what it reports. **Place:** his to place; a look at the whole app's other pages with it.

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
**Drawn 17 Nov 26 (the night's job 4):** today beside proposed, desktop and phone, on the questions page `raptor-port/docs/mock/2026-11-17-trk-small/page.html` (question 2, recommended: the board's keys and cyan ring); not yet put to him (D994).

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
test's recording or an icon's drawing, more than a band's branch should carry after its walk. **Added 8 Nov 26 (chat 28's code reads, D489):** (5) two "keeps
nothing" flags set from one answer (`ui/savestatus-source.ts setStorageKept`, `tracker/storage.js`); (6) the
`.failed` / `.nokeep` pair written out in four rules of `17-save-status.css`; (7) the test switches' address pattern
written twice in `storage/boot.ts`; (8) `Shell.tsx`'s `saveFailed` now means "a band is up"; three head comments of
`SaveStatus.tsx` and its CSS describe only the failed band; the Tracker's new setter guards a call with no value.
**Place:** low — with the Tracker's next batch ([TRK-MARKS-LEFT], the magnifier's answer) or
the tidiness audit ([CODE-TIDY-AUDIT]).

### [TRK-NO-TYPED-STUDENT] No Tracker student can be added by a typed name (his D1931, 8 Nov 26 — first filed the same day as a question, [TRK-TYPED-STUDENT-Q], by the rules diet's step 5a, both blind reads)
**His answer (8 Nov 26, typed in chat 34): "Typed student can't be added" (D1931 — replaces D191, answers D1005).** **To
build:** + Add loses its "Or type a callsign" box; a search that matches nobody adds nothing (the "Nobody on the roster
matches" line and OK / Enter adding the typed name go); with nobody on the roster to offer, the plain "Student callsign:"
box goes too and + Add adds nobody. The window and its words are drawn for him first (D1625, the agent's reading). A
student already stored with no roster link is demo data (D56), left as it is. Also to correct when built:
`raptor-port/docs/ui-contracts.md` §The Tracker tab (the + Add entry) and `raptor-port/docs/tracker/known-gaps.md` (typed
names still add an unlinked student). **Place:** with the Tracker's next batch. The question as it was filed:
**What:** his words of 18 Oct 26 (D1005), "a student can't be a typed student as I'm removing this feature", and D1005's
rule, "Every Tracker student is a man on the roster", say a student is always a man on the roster; but the agent's reading
(2) in the same row narrowed it to the typed "No. of Down Days" box ("no student keeps a typed box"), and the app was built
that way. **Today:** on + Add, a name typed in the search that matches nobody, or typed in "Or type a callsign", still adds
a student linked to nobody (D191, built — `src/tracker/app/core.js addStudent`); his down days read "—", since there are no
inputs to count; with nobody on the roster to offer, + Add is the plain "Student callsign:" box (kept by
[TRK-STANDALONE-LEFTOVERS]). No later ruling says which he meant, so it goes to him as a question (How we work: where the
newer ruling does not clearly cover the case — D90, D201). Nothing is built or removed until he answers. **The question:**
does "I'm removing this feature" take typed students out of + Add, or was it only the typed down-days box? **To do:** ask him
with a picture of the + Add box, its "Or type a callsign" line marked (D853); then record his answer and, if typed students
go, file the build. **Place:** kept until he asks for the backlog's questions (D994). The page line:
`.claude/rules/decisions/tracker.md` §Students and courses.
**Drawn 17 Nov 26 (the night's job 4):** the window without a typed name, today beside proposed, desktop and phone, on the
questions page `raptor-port/docs/mock/2026-11-17-trk-small/page.html` (question 3, recommended: no typed box and no OK, Cancel alone; "Nobody on the roster matches
“…”." and "Nobody is on the squadron roster yet."); not yet put to him (D994).

### [TRK-DOWN-DAYS-CANCELLED] A cancelled medical input still counts toward the down days (filed 8 Nov 26 — the rules diet's step 5a, the fresh Opus read)
**What:** the finished item [TRK-DOWN-DAYS-AUTO] (`OUTSTANDING-ARCHIVE.md`, built 18 Oct 26, pull request 534) left this
open: "Open for his look: a CANCELLED medical input still counts (the Medical tab's own reading)". No live item carried it
after the archive. The night's evidence (`raptor-port/docs/handpass/2026-10-18-night-jobs.md`) called it not a finding then,
since a cancel mark was set only on ground-programme rows, never a medical one. The Tracker's count reads every medical
input of the man (`src/tracker/peoplewire.ts medForTracker`), with no test of a cancel. **To do:** check whether a medical
input can be cancelled today; if it can, put it to him with a picture of the down-days window — should a cancelled one
count? Not a ruling until he answers. **Place:** low, with the Tracker's next batch. The page line:
`.claude/rules/decisions/tracker.md` §The Info panel.
**Answered 17 Nov 26 (the night's job 4): yes, one can exist today, by one route — made through the app's own controls in
the running app (a served build, demo data, signed in as an admin), not by changing data.** A medical
cannot be cancelled directly: it never stands on the Ground Programme (`engine/inputs.ts goesOnProg`), and the cancel is
set only by the board's CX on a Ground Programme row (`ui/board.ts` → `ui/reqdoor.ts rowMark`, D760). But the cancel rides
the input, and changing an input's type keeps it: (1) on the Scheduler Board, Thursday 16 Jul, Ranger's Appointment, CX,
reason WX, Cancel line; (2) on the Inputs calendar, its window (title still "CX WX"), Type → OML, Save, "No document" (the
type list for a non-medical input offers the medical types; the guard refuses only medical → non-medical; the edit keeps
the cancel). The input is then an OML with its cancel (WX), and no control takes the cancel off — only Undo, or changing
the type back. What it does: the Inputs calendar strikes "Ranger · OML" through as cancelled; the Medical tab (as of
16 Jul) lists Ranger as medically down; the Tracker (Ranger added with course start 1 Jul 26) reads "1 day", its window
"OML 16 Jul — 1 day" (`peoplewire.ts medForTracker` and `core.js downDaysOf` test no cancel). The run is
`raptor-port/docs/mock/2026-11-17-trk-small/draw.mjs` (its `q1`, which asserts each step's result); pictures
`raptor-port/docs/img/2026-11-17-trk-small/1-*.png`. **The question for him,** drawn on `raptor-port/docs/mock/2026-11-17-trk-small/page.html` (question 1):
should a cancelled medical count? Recommended (A): changing an input into a medical type takes its cancel off, so it is a
plain medical everywhere and counts (as a change of type already wakes a removed input); other choice (B): keep the cancel
and have the Medical tab and the Tracker leave it out, as the calendar does. Not a ruling until he answers; not yet put
to him (D994).

### [DB-SECURITY-ROLES] The database's security roles, designed for the IT side (D1653, 5 Nov 26)
**10 Nov 26 — his direction, D1971 (chat 55):** three levels — a few master admins (the developers, into the database directly), admins, members — and account creation with each person's rights by the two admin levels, not the IT side. The design at the database step is for these three; whether members can hold a weaker database key than admins without an IT request per change rests on the question sent to the IT side (can each database role's team be tied to a group the unit manages; can ordinary users open the tables on the Power Apps website) — `[IT-QUESTIONS]`, the 10 Nov 26 record. The agent's point for that design, not yet checked: every save a member's action causes must fit inside the member key.
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

### [CODE-APPS-RESEARCH] What Microsoft's code-apps pages and the wider web say, set against the move plan (19 Nov 26) — OPEN, for the database step
**Context:** the full research, read 19 Nov 26 at his ask (every page of Microsoft's code-apps guide, the database and connector pages, admin and moving between tenants, how the app runs inside Power Apps, other builders' reports): `raptor-port/docs/superpowers/specs/2026-11-19-power-apps-code-apps-research.md` — its §What this changes in the project's existing plan is the table to work from; the five researchers' notes, with every source dated and the addresses of Microsoft's own pictures of the admin steps, beside it in `raptor-port/docs/superpowers/specs/2026-11-19-code-apps-research-notes/`. Nothing in it is built; nothing is decided by it. **What it changes (each "the research's reading" until proven in his test account, D1749):** (1) **The commands are new.** Since 18 Aug 26 code apps use Microsoft's `pa` tool (Node 22 or newer), not `pac code`; the move plan's point 31 holds in shape, its commands do not. (2) **Three things the app does today are blocked inside Power Apps by default** (platform flags, his D1551 — told to him 19 Nov 26): the Retry after a failed page download reads the app's own page-file list (`src/ui/pagedownload.ts`), which the default content security policy forbids — build the list into the app; the medical-document viewer shows files by a browser-made address (`src/ui/DocViewer.tsx`), also forbidden — a new way to show them; what the app keeps in the browser (the page to reopen after a Retry, folded panels) can be wiped on an iPhone inside Power Apps — keep it best-effort, nothing a person needs. For the documents, two ways were put to him 19 Nov 26, his choice awaited: (a) the file kept in a SharePoint folder and opened in SharePoint's own viewer — recommended (more space, the IT side's advice, nothing blocked; a moment outside the app, a one-time "allow" per person); (b) kept in SharePoint but shown inside the app's window as today (the block to work round for PDFs, SharePoint's file bugs); either way the folder's readers are the IT side's to set (every member sees a medical input's documents — D211, D213). He said "Option 2", was shown its cost and a third way — (b) with an "Open in SharePoint" back-up when the app cannot show the file — and asked for a test first; his choice is still awaited. **Tested 19 Nov 26** (a local copy of `main` served with Microsoft's default rules as a header, the platform's own extra sources and its frame left out; Chromium and WebKit's iPhone profile; pictures and results kept outside the project, the agent's scratchpad, not committed): the app starts and runs, the Leave War and the Tracker open normally; the viewer's photo is refused (a broken-picture mark, "img-src") and its PDF refused ("frame-src") — so (2)'s documents point is proven, and showing a file inside the app needs another way (a photo can be shown in a form the rules allow; a PDF drawn by the app itself or opened outside); the failed-download Retry cannot recover and the app's fetch of its own page-file list is refused ("connect-src") — proven too; and **a new finding:** the one script written inside the app's start page — the one that stops the page itself zooming on a phone (his D1567) — is refused on every load, so inside Power Apps a phone's page would zoom again; the fix is to move it into a file of its own, which the rules allow (at the move; nothing changed now). (3) **What basic access allows on the app's tables — ANSWERED by the IT side, 19 Nov 26 (his IT colleague's messages, shown by him as pictures to this chat):** everyone gets the PP CoE's basic user role by default and it lets them do almost everything on the tables — edit, delete, amend; who may do what is the app's own roles (master admin, admin, member), not database roles, because the app is internal, people do not know how to reach the tables directly, and the database's audit records who changed what. So the app can read and save, and a change made outside the app's screens is accepted as a risk, as for the day mark (D1751); every rule must still be checked at the save, never only by hiding a button (the project's standing rule). In his test account (D1749) the test users get the same full access on the app's tables, or the test proves nothing — Microsoft's own basic role grants nothing on a new table. Nothing changes in the app-held roles being built (multi-squadron batch 1). (4) **Two saves at once — the later wins:** Microsoft's library offers no "changed since you opened it" check and no all-or-nothing save of several records. **The plan (the agent's recommendation), put to him 19 Nov 26 (he asked "so it can be solved by building its own?" and said "save it"):** each record carries a change counter; a save goes through only if the counter is still what the person opened, else it is refused with "X changed this since you opened it" and the newer version shown; a save that touches several records (a publish) notices a half-finished save and finishes or undoes it. Beside the day mark (D1751) and Undo's refusal (D148). **What it cannot close:** two saves in the same fraction of a second can both pass the check — only a check inside the database closes that, which the IT side does not allow; and nothing guards a change made outside the app. **Place:** built with the one adapter behind the save doorway (`[DB-STEP]`), designed into it from the start. (5) **Their short code differs from the test one,** so at hand-over every table's link is made again and every field name changes — keep the table and field names in one place in the app (the research's recommendation). (6) **A flow the app calls loses its link when moved to another tenant** (Microsoft's open bug, 17 Nov 26); a scheduled flow is not affected — keep app-called flows out of Raptor. (7) **His test account needs a "sandbox" or "production" environment, not a free "developer" one:** Microsoft suspends unmanaged developer environments from 15 Dec 26 and deletes them from 15 Jan 27, and no security group can gate one. Told to him 19 Nov 26 as a fact for when he is ready; the hosting trial itself still waits for his word (D1682). (8) **The SWiFT kit (version 0.6, 31 Oct 26, on his PC — its text kept out of this public project) set against the research, 19 Nov 26:** it agrees on the IT side making the app's link to their environment and publishing it, the builder never publishing; Microsoft's add-on switched on only once that link exists, on the same local address; the browser keeping only preferences; the short code kept in one setting of the app, never typed by hand (the kit's way answers (5)); removal by switching off where a flow depends on it. It lags in two places: its laptop setup accepts Node 20, where Microsoft's new tool needs 22 or later; its testing steps still use the old `pac` commands. It says nothing on (2), (4), (6) or (7), and nothing in it contradicts them. **Pictures:** Microsoft shows only five pictures of the admin steps (turning code apps on, the content security policy); the rest are taken in his test account at the step, for his picture-by-picture guide (his ask, 19 Nov 26). **Next:** at the database step, fold each row of the research's table into the move plan, `handover-dataverse.md` and `data-model.md`.
**Phone alerts (his D2602, D2601 — 24 Nov 26, chat 170):** his lean is a Teams message — one Power Automate flow sending each new bell line, the app's finished sentence saved as text for it — and a second alert when a change is undone. To find out at the database step, nothing before (D473): whether the IT side allows the Teams connector and a flow for every user; whether a Power Apps push reaches a code app at all (unproven); the saved sentence as a column of the bell's table (`raptor-port/docs/data-model.md`, when the table list is next touched).

### [LW-PINCH-FROZEN-WEBKIT-OFF] Leave War, WebKit only: the frozen date row read off its columns mid-pinch in (found 31 Oct 26, the pinch fixes' second re-walk)
**What:** in Safari's engine (WebKit in the test browser, touches made inside the page), 45% down the grid with the dates frozen under the top bar, a pinch in read mid-gesture puts each day heading of the frozen row about 360 px right of the grid's own heading for that day (`scripts/handpass/pinch1031-walk.mjs` L6, the reading "the frozen date row over its columns" — added 31 Oct 26); Chrome lines up; after the lift both line up; origin/main's build reads the same in WebKit, so it is older than the pinch fixes. Not yet looked at as a picture: it may be how WebKit reports a box under a paused scroll-driven animation (the frozen row's follow is paused while pinching) rather than what it draws. Pictures `raptor-port/docs/img/handpass/2026-10-31-pinch-fixes/after-fix2/webkit/L6-mid.png`. Also once in the round-3 re-walk (not repeated in two re-runs): Quals scrolled sideways, a pinch in, the frozen headings read 47 px off mid-pinch in WebKit (`after-fix3/webkit/Q5-mid.png`) — likely the same reading. **To do:** the picture first (do the dates over the grid's columns match, mid-pinch?); if they do not, the frozen row's follow while pinching in WebKit; his iPhone look decides. **Place:** with the next Leave War pinch job.

### [MULTI-SQN-VIEW-ONLY-TABS] A View holder sees only the other squadron's View-only Sched and Help (his D2381, 23 Nov 26)
**What:** while a squadron he holds only View of is picked, a person's top bar and phone ☰ menu offer only that squadron's View-only Sched (read only) and Help — no Edit Schedule, Inputs, Quals, Logic, Leave War, Tracker or Admin; picking his own squadron brings them back; a member and an admin alike; in the member view on another squadron, the same (D2253, the agent's reading). Today (checked 23 Nov 26, chat 149, Ranger with View of 149): every tab but Edit Schedule and Admin stays, Inputs, Quals, Leave War and Tracker showing his own squadron's under the number "149"; an admin's Admin tab stays, 149's Squadron config greyed. **To do:** draw the top bar and the ☰ menu for a View holder with 149 picked, desktop and iPhone, for his look first (D1625) — beside his two side-menu ideas of 23 Nov 26 (the squadron shown at the top of the ☰ menu, and picked from there), put to him with a recommendation; then build — the tabs (`ui/Shell.tsx`), the ☰ menu (`ui/Drawer.tsx`), a pick made on a page that goes lands on that squadron's View-only Sched (the agent's reading), the roles table (`ui/rolestable.ts`, its View column), the gate unchanged (View already writes nothing of 149); the roll-call names every page that hides; the morning questions (a) and (i) of the night of 22–23 Nov fall away with it. **Place:** batch 1's second half, branch `claude/msq-b1-screens-135`, before its "merge live".

### [MULTI-SQN-DESIGN] One app, one database, many squadrons (his D1695, 5 Nov 26)
**22 Nov 26 — chat 138:** batch 1's second half, the technical plan written (`raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md`): step A (edit rights by squadron, first), B (the Schedules menu), C (Admin → Users), D (Request access), E (Admin → Squadrons), F (the bell), G (sign-in wait); three points for his look first (its §9 F1–F3); red team next (Astra and a fresh Opus reader).
**21 Nov 26 — his D2252, D2253 (chat 129):** View never reaches another squadron's own pages (nothing to build); in the member view a Plan holder or master admin stays on the picked squadron's schedule, read only, his own pages his own squadron's — drawn with step 5's "Schedules" menu and pinned by a test there (the code's reading checked, not reachable on screen yet).
**20 Nov 26 — the Plan audit (chat 126, [MSQ-PLAN-AUDIT], D2242) filed here for later pieces:** step 5 / O3 — Admin → Users' Give access picker (`accounts.ts linkablePeople`) and every row's buttons follow the page's squadron too, not only its list (a man of a squadron the admin is no admin of opens read only, with the View buttons — D2191); step 5 / P3 — the schedule pages' edit controls (Shell, Drawer, the edit mode, Logic, the templates, Drafts, the changes window, Admin's squadron settings) ask "admin of the page's squadron" (`levelIn`, not the role), so a View holder of 149 who picks 149 sees them read only, and P3's menu is for a master admin AND an admin with Plan (D2197, D2201, D2241); P2 — a shared place's time zone: a master admin, or (the agent's reading of D2241, to tell him) an admin at home or by Plan of every squadron at the place; P1 — picture 1c's words ("Only 149's admins or a master admin give access to 149.") leave out an admin with Plan of 149: the departure named to him at P1's build; P4 — two questions for him then: do a squadron's lines leave a Plan holder's bell when his Plan is taken without a move, and does a man archived, posted Overseas or suspended keep his View and Plan. The full list: the reshape plan §19.
**17 Nov 26 — chat 106:** the batch plan written (`raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`): 1 squadrons foundation → 2 detachments → 3 borrowing and shared waves → 4 Transfer to Sqn and Post out from Admin → Users → 5 the whole-app check — his 3 and 4 swapped, recommended, put to him; red-teamed by Astra and a fresh, blind Fable reader (his call), every finding checked and folded in (§9). Batch 1's page: https://claude.ai/artifact/1464QnHx85Dwcd63fWH46x (`raptor-port/docs/mock/2026-11-17-multi-sqn-b1/`, pictures by `draw-b1.mjs`) — six points with recommendations; batch 1 is built only after his look.
**17 Nov 26 — his D2187, D2188 (chat 105):** the build comes NOW, in batches, before the database step — not last at the database step as D2086 had it (D473 stands: the database itself still at the end). Until then it saves in the browser as the whole app does: both squadrons can be seen on one PC, another PC sees nothing of it until the database. Before each batch starts he is shown again what was agreed for it, with a mock-up of just that batch, drawn on the real app. **First:** a batch plan from the agreed design (the design note's rounds 1–7 and the scheduler page §Not built yet), red-teamed by Astra and a fresh, blind Opus reader; then batch 1's page; then its build. The "(3) built at or after the database step" below is overtaken by D2187.
**16 Nov 26 — his order (D2086):** this design comes first, design only, detachment modes with it (D1100); then caps and ops limits, then the Tracker expansion; the build last, at the database step. Started by chat 90: questions to him in small rounds, each with a recommendation and pictures — the design and its rounds: `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md`. **17 Nov 26 — round 3 answered in part (D2113–D2123):** round 4 draws the board's badge at the callsign's top right (D2117), the signing look redrawn (D2121), feedback for "+ Line" without moving it (D2115), the detachment's number box with "249" (D2116), a door for several men's overseas duty (D2120), the crew-rest clash across two schedules, drawn (crew rest each squadron's own, D2122; the later line's schedule judges, D2123), what "+ Wave" offers when 149 has no wave that day, and who may change what, drawn (D2114). Still open from round 3: Q2 (the "149 ▾" schedules menu), Q3 (the other squadron's free people), R1 (what "To" means), R3 (closing early ends the overseas duty); the caps page's questions; [INPUT-WIN-SCHED-ASKS].
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

### [RULES-CHECK-LEFTOVERS] What the rules check's fixes left, filed when [RULES-CHECK-FIXES] was archived (16 Nov 26, chat 90 — all low)
Moved word for word from `[RULES-CHECK-FIXES]` (pull requests 762 and 779 merged and live); evidence sheets `raptor-port/docs/handpass/2026-11-12-rules-check-fixes.md`, `raptor-port/docs/handpass/2026-11-12-published-day-logic-settings.md`, `raptor-port/docs/handpass/2026-11-14-rules-check-batch2.md`. The Escape point is already its own item, `[CHGWIN-ESCAPE]`.
- **Known limits of D2005, not built:** the titles on a puck's chip, the same-time note and the R box still read today's settings (titles only, no ring or flag); the neighbouring week's hides and OIL entries, and the size of its window, read today's; a clash copied across midnight.
- **Older, found on the way, not fixed:** Escape does not close the changes window; View-only Sched's picker has no "Original" entry.
- **Not done:** the Logic page's word-for-word record (`raptor-port/docs/superpowers/specs/2026-10-15-logic-page-lines.md`); two old walk scripts still look for the old amber words; D482's full row not re-read against D2005 (the hours still move at once; a published day's issue count no longer does); print and export under D2005 carried by tests, not walked; a published OIL-earning day across a Logic change has no end-to-end test.
- **Done 17 Nov 26 on `claude/sched-small-fixes`:** the two walk scripts (`w4-08-r38-holiday.mjs`, `late-pub-leavewar-walk.mjs`) look for D2003's and D2004's words; the end-to-end test — `raptor-port/e2e/oilworkstart.spec.ts` "D2044", "Full day of OIL" raised on a published Saturday. Print and export under D2005 are listed for that job's walk (`raptor-port/docs/handpass/2026-11-17-sched-small-fixes.md`). Still open: the Logic page's record, D482's re-read, D2005's known limits, the picker's "Original".
**Place:** the schedule area's next batch of small fixes.
**Drawn for him (the night of 17 Nov 26):** `raptor-port/docs/mock/2026-11-17-held-fixes/page.html`, Q7 (View-only Sched's missing "Original").

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
**What:** at the database step, a credit the published schedule earns stops being a record of a Leave War period (`raptor-port/docs/data-model.md` §LeaveBid, `warId` required) and becomes a row of its own — person, date, amount, the work it came from — read by the Leave War grid, the OIL tracker, Balances and anything else. **Why (his question):** *"Shouldnt OIL be stored on a table in the database. And anything can call that data?"* — earned OIL is a fact about a man and a day, not about whether a period exists; tied to a period, a weekend in a year with no period has nowhere to go (D19's advisory, D1578's waiting case). A hand-given award is already its own `LeaveLedger` row. **What it changes then:** the OIL pass writes this table; D19's "no OIL can be earned" advisory is no longer needed for OIL (the period offer may stay for the Leave War's own sake — his to rule then); the OIL tracker's derivation reads the new rows. **Place:** the Database step (D473), with [DB-STEP] — kept there on his word of 15 Nov 26, not brought forward (D2066).

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
**His D2634 (25 Nov 26, chat 175):** postings — post out with every outcome, Transfer to Sqn among them, and post in — get a
new interface on Admin → Users with the Leave War's full functionality (a SANS man the war hides reached there); the Leave
War keeps its sheets; built with the Transfer step (batch 4), drawn first. With it, D2633's "It's him" for another
squadron's archived callsign.
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

### [REDUCE-MOTION-SIDEWAYS] With reduce motion on, the pinned rows may not follow a sideways scroll (8 Nov 26)

Found by chat 16 while building [LW-PIN-LAST-FRAME] (D1870), by reading the code — **not yet seen on screen**, and the
same on `main` today, so not that job's fault. The app switches every animation off for a person who has asked their
phone or computer for less motion (`src/ui/scheduler/09-week-responsive.css`, `*{animation:none!important}`). The
pinned dates row of the Leave War (`lwx-follow` on `.lw-sda .mxfixed-anim`, `src/leavewar/ui/matrix.css`) and Quals'
pinned heading (D993) follow a
sideways scroll by a browser-driven animation, so with reduce motion on they would stay put while the grid slides
under them: the pinned row would show its first columns' dates over the wrong columns. [LW-PIN-LAST-FRAME] exempted only
its own showing step (it moves nothing). **To do:** see it on screen first (reduce motion on, a wide grid, scroll
sideways, then down until the row pins); if it shows, exempt the two sideways-follow animations the same way — they
move the row with the finger, which is not the motion the setting is for. **Place:** with the Leave War's next batch.

### [TOPBAR-BAND-ANCHOR] On a scrolled desktop page the "Not saved" band covers the page's first 36px (8 Nov 26)

Found by the fresh, blind Opus read of the top bar's code (its I1 — `raptor-port/docs/superpowers/briefs/2026-11-08-topbar-bounce-code-read-opus.md`),
present in the old build too: on a desktop Chromium page scrolled down, when the "Not saved" (or "Not kept") band comes,
the page's room under the bar grows by the band's line but the browser's scroll anchoring moves the window with it, so
the band covers the first 36px of what he was looking at; at the page's top, and on his iPhone (Safari has no scroll
anchoring), nothing is covered. Not a fault of the D1873 change. With it, the read's minor notes: the stylesheet guard
(`src/ui/topbar-css.test.ts`) misses `will-change: transform` and `filter` on the bar's ancestors; comments still call the
bar "sticky". A job of its own, small; walk a scrolled desktop page with `?savefail`.

### [REPO-PRIVATE] Make the repo private and share it with developers — half done 23 Sep 26 (D59)
**18 Oct 26 (the backlog tidy):** the repo is PUBLIC today (GitHub says so) — made public for a short period under D106, for GitHub's faster machines. Making it private again, and restarting his PC's check runner (D89), is still open and his step.

**23 Sep 26, later: D88 ("I'll make it public for now") was REVERSED by D89 before he switched — it
stays PRIVATE** and the checks move to his own PC (`[CI-TWO-CORES]`). Why it mattered: 146 old branches
on GitHub still carry the D58 unit designation in their files, and `main`'s history in 14 commits.

**DONE, by him, 23 Sep 26 (D59): the repo is private**, reversing his own *"nvm disregard this first"* the same day after a check found the unit named in the app. Pages is GONE (API 404), so the publish job in `.github/workflows/deploy.yml` is OFF — it would fail every push and still bill — with the gates left running. `README.md` corrected. **The app is viewed on VERCEL now.**

**Still open — the sharing half** (*"i would like to make my repo private, and share with developers on my app"*). Route: Settings → Collaborators, by username, Write; they run it locally and do not
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
- **A first piece, 24 Nov 26 (chat 159, his ask):** a short guide for F-16 schedulers and training appointment
  holders seeing the app for the first time — what it is, the pages, plan to published, the flags, every Logic
  setting and check (coded S1–S23, C1–C53, read out of the Logic page's own words), how SC MAIN, SC SPARE, AVALON
  and BB are flagged, the typed words that switch a rule on, what is built around the F-15, and eleven questions for
  them. A PDF, one HTML page and the questions as plain text: `raptor-port/docs/squadron-guide/` (its README says
  how it is rebuilt). By his second ask the page is in the app's look and interactive, and published for him as a
  private Artifact page (the address is in that README). Live 24 Nov 26 on his "merge live" (pull request 835). Offered,
  his call: the guide on the app's own address, so the group's pinned link serves it; answers gathered on the page for
  him instead of copied into the chat. He sends it himself. **Next:** their answers, when they come, are put to him as rulings to
  make — they feed `[SINGLE-SEAT]` and the multi-squadron build; nothing is built from them without his word.

### [DB-SYNC-MODEL] How the app shares and locks once it is in the database — his idea, to be designed now, built with the adapter (29 Sep 26)
**Asked again at this step (his D2316, 22 Nov 26):** whether a sign-off name held while the day's OIL list is open should drop when another scheduler changes the day behind the list — kept as built until then (the OIL page).
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
**Still to ask the IT side, whenever convenient (no rush — D1745):** the short code they will use, so his test tables match (his test tables use "talon" for now — D1753); what their basic access lets a person do on the app's tables (read and write every row?); whether the app may save and open files in SharePoint, and who sets up the library and who may read it (every member, D211); how long the audit is kept (it sets how long the app keeps its own history — D1752); whether that audit covers every table the app uses, so a change made outside the app's screens — from a browser's developer tools, with a person's own access — can always be traced to a person (his D2209, 19 Nov 26: not a request to divide the database by squadron — answer 8 stands); how the unit gets a role-based account. And, from before: the first admin of the empty tables (`data-model.md` §12 q11). A short version 3 of the questions, these points only, is kept with the package on his PC, not in this project.
**The second IT person's written reply to the same 12 questions, and the first's reply to three follow-ups, both 10 Nov 26 (his screenshots to chat 55 — written here without names, on D1748; the second person writes as the team that builds the tables, "we will use that", "I can modify the kit"):** (1) *The table list:* yes — a filled `tables.json`, if we are sure its format is right, is used in place of the Excel form. (2) *Functions and flows:* Dataverse Functions and Power Automate flows are allowed; a flow runs with the rights of the person who created it; the rights of a Function, not sure. (3) *The test account:* connectors are allowed inside the M365 environment; for security roles, "write down how you want it to be set up and we can set it up for you"; data-loss policies are already in place unless the app does something else. (4) *Unique keys:* possible, and not hard to add by hand unless many tables need them; a table's primary column set to autonumber also works as a unique id. (5) *Change tracking:* can be turned on; he can modify the kit if necessary. (6) *Documents:* a Dataverse file column, made by hand since few tables need one; who may read depends on the person's permissions on the table and whether it is user-owned or organisation-owned. (7) *Environments and short code:* ONE environment; the short code is OURS to choose, a separate one for each of the three apps, and a fourth for tables the apps share. (8) *Two squadrons:* they give out roles through teams; the squadron check is coded into the app (his reason: Dataverse cannot allow reading but not writing certain rows to certain teams). (9) *Roles:* security roles are assigned by the PP CoE only; a change takes effect within about 5 minutes. (10) *Scheduled flows:* can be created. (11) *Audit:* logs are kept one year, read only by the environment's admins. (12) *The role file:* every role should be in the file; a change made by hand is written back into the file. **The three follow-ups (the first person):** basic access is the M365 environment's default "Basic User" level, which "doesn't restrict much" — the app's roles do the restricting; uploaded documents: the unit's own SharePoint site, whose members are the unit's people; a role-based account is requested through the unit's IT contact, holds the same licences as a person and is tied to nobody, so no automation breaks when someone posts out.
**Where the two differ, and what Microsoft's pages say (chat 55, read 10 Nov 26 — `learn.microsoft.com`, the code-apps page "How to: Connect your code app to Dataverse", updated 30 Oct 26, and the Dataverse security, change-tracking and Power Automate licensing pages):** (a) *the short code* — ours to choose (second) against set by the PP CoE (first): the second speaks for the builders; "talon" stands (D1753), to confirm with him, with one code per aircraft type's app if types become separate apps in the one environment; (b) *database roles* — "write down how you want it" (second) against "no need at database level" (first): not a clash in practice — the kit's role file is ours to write (12), the PP CoE assigns it through teams (8, 9), and the app's own roles decide who may do what (D1653's question, still his); Microsoft: the Basic User role alone grants nothing on custom tables — a role must name them — so what a person can do directly is exactly what our role file says; (c) *change tracking* — can be on (second) against probably not (first): Dataverse has it, but the code-app library's documented reads (filter, sort, top, paging) show no way to ask for "changes since", so the 30-second check stays on the ordinary read of the change log (as filed 8 Nov) and change tracking is not asked for unless the test account proves a use; (d) *unique keys* — possible (second): the database then refuses a duplicate itself, so the 8 Nov reading "no unique key can be counted on" is eased IF the kit is changed to create them (to ask, since by hand across some 45 tables is the "many tables" case); Microsoft lists "alternate key support" as not yet supported in code apps — the app cannot fetch a row BY such a key (it filters instead), the database still enforces it; (e) *documents* — a file column (second) against SharePoint with a link (first): Microsoft marks file upload and download from a code app to Dataverse as preview; decided by trying both in the test account (D1749), SharePoint the fallback the first person recommends for space; (f) *two squadrons* — both say the app does it; Microsoft's business units could do it in the database, but that is the PP CoE's and not offered; (g) *flows* — a scheduled flow runs as its owner and the Dataverse connector is a premium one, so the role-based account needs a premium licence (to ask when it is requested). **Still to ask after this:** the short code confirmed, and whether each aircraft type's app needs its own; whether the kit can create unique keys; the role-based account's licence; the first admin of the empty tables (`data-model.md` §12 q11). **The questions as given to him to send, 10 Nov 26 (version 4 — nine, each with why it is asked; with his D1971, the two database keys, groups the unit manages, the app changing a group, the tables view closed, developer access):** `raptor-port/docs/superpowers/briefs/2026-11-10-it-questions-v4.md`. **Not yet folded into** `data-model.md`, `handover-dataverse.md` or the M365 move plan — that fold-in is the next job here, on his word.
**Waiting, from chat 4's handoff block (filed 10 Nov 26, chat 48):** (1) another IT person's answers, which he said were coming (8 Nov 26) — CAME 10 Nov 26, recorded just above — pull request 662 merged without them; when they come, a new chat folds them in on a fresh branch from `main`, as chat 4 did; (2) his word on the two put to him 8 Nov 26, with the agent's recommendations — D1101 (a database per aircraft type) against one environment: no change now, the F-15 squadrons first, settled when a second type joins (each squadron's rule settings are its own rows, and one code base picks each type's quirks by its aircraft-type setting, D1100, so either choice handles another squadron's rules); D1653 (security roles the IT side enters) against the database rights they keep: follow their advice, the app's own roles. Neither is built before the database step (D473).
**Carried from `[PAGE-FOOT-FLASH]` when it was archived (16 Nov 26, chat 90):** whether people on managed phones will open the app in Edge at all once it is a Power Apps code app (his question of 10 Nov 26, offered as a question for the IT side, not yet sent) — no longer needed for that item, whose last cure he declined (D2056); kept here in case it matters for the move.

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
**Narrowed again 14 Nov 26** (`claude/code-tidy-1114`, chat 72's overnight job 2 — live 14 Nov 26, pull request 769): `raptor-port/src/ui/weekglide.ts`
now names `.claude/rules/decisions/scheduler.md` §Settled before this list, its "Week navigation" lines (the area page has
no heading of that name since it converted, D1944), and `raptor-port/src/ui/SchedBoard.tsx` names `raptor-port/docs/ui-contracts.md`
§The board on a phone is ONE window. `raptor-port/src/ui/pendlist.ts` was read against D338 and `raptor-port/src/engine/editlog.ts`
("THE CHANGE HISTORY"): its comment WAS wrong — the edit log is the change history now, saved row by row and loaded at
boot, outliving a reload and a sign-out; it now says so, and says why a change can still read "earlier" (only this
browser's lines until the database, and only the newest 2,000). The 8 Nov list was rechecked: every entry already names its
home (`e2e/leavewar.spec.ts`, `ui/html.ts`, `ui/latemark.test.tsx`, `ui/AdminPage.tsx`, and in the engine
`audit-d-keyspace.test.ts`, `overnight.test.ts`, `hooks.ts`); `testing/refwin.ts` names `HANDOFF-ARCHIVE.md`, which is
where the CHIP_LABEL trap is written, so it stays. **Three are left, all in the rules engine** — changed only for a behaviour
change (D1537), so each with the next one there: `raptor-port/src/engine/canonical.ts:35` ("CLAUDE.md §Drag-reordering" →
`.claude/rules/decisions/scheduler.md` §Settled before this list, its "Drag-reordering" lines) and
`raptor-port/src/engine/validate.ts:273` ("CLAUDE.md §the robustness doctrine" — it still lands, on the project guide's
one-line rule; it could name `raptor-port/docs/guide-full.md` §The rules-engine robustness doctrine); and, found by the fresh
Opus reader of b04870339 (filed, not fixed), `raptor-port/src/engine/editlog.ts`'s head comment, which still says the log
"clears on reload" — it is the change history now, kept across a reload and a sign-out (D338; its own "THE CHANGE HISTORY"
comment says so). The earlier lists are in git history.
**Place:** with the rules engine's next behaviour change. Found by `git grep` on 24 Sep 26 (the spring clean's red team,
Fable finding 10, Astra finding 11).

### [APP-SPEED] The app's speed: less waiting at start-up and between pages, above all on a slow computer (filed 24 Nov 26, chat 160; his go D2480)
His go of 24 Nov 26 (D2480), in this order: (1) a hidden timing readout — a switch on the app's address, like `?savefail` — to measure the real slow computer; (2) the week drawing the days in view first, with both schedule pages kept ready (high-risk, Fable); (3) no file re-checks on repeat visits. Not built: the sign-in card shown early (no sign-in once in Power Apps). Four more ideas wait, two of them his call. The times measured that day, each step's bounds, the waiting ideas and the measuring script: `raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md`. **Place:** a job of its own, in a fresh chat, beside the multi-squadron build; step 1 first.

### [PERF-RESIDUALS] Speed wins measured and deferred — two are his call (filed 24 Sep 26)
From `HANDOFF.md` §In flight (archived 24 Sep 26): several speed wins are measured and deferred — the seven
day-strings sort, the JS-bound drop, hover-boundary repaints, the `body.dnd` decorations, the one `validate`
call; two are the owner's call because they change wording or feel. The ledger and each one's measurement:
`raptor-port/docs/performance.md` (Part 2; §Dead ends says what not to retry). **Place:** when a speed complaint
or a board change comes near one of them; put the two that change wording or feel to him first.

### [ITFLOW-OIL-RESHOOT] Re-shoot the IT flow guide's Leave War pictures once the OIL words change (29 Sep 26)
**Also for the next re-shoot (15 Nov 26 — D2009, found by the rules check batch 2's roll-call):** the checks "On leave + flying" and "Downchit + flying" are now named "On leave + planned" and "Downchit + planned" on the warning list, the board, Insights and the Logic page; the two captions are corrected in `raptor-port/scripts/itflow/content.mjs` (the r1-warn step and the downchit line) — the deck's Issues picture and the PDF carry the old name until the rebuild he asks for (D403).
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
**(1) DONE 10 Nov 26 (chat 50):** 30 working-copy folders audited (tracked changes, untracked files, whether the commit is in `main` or on GitHub, and which chat in his sidebar uses it); 12 removed under `.claude/worktrees` (old helper copies, `codex-insights-mission-mix`, `hist-jump-empty-seat`, the dropped cloud-walk trial, its branch kept on GitHub), and the three half-unpacked scratch copies of chat `leave-war-m5a-screens-round2` deleted by hand after git refused (each first checked to hold no link). Every branch kept. Three more left git's list but stay on disk: `Raptor-ui4` and `Raptor-ui4b` (a running program still holds a file in each — likely an old preview server; delete them after a restart of his PC) and the scratch copy `main-src` (it holds a link into the app's packages: delete the link first, then the folder). **Kept on purpose, each for him or a later chat:** `agent-a9aa54061d87f01bc` (branch `m5a-e2e-fix`, two Leave War browser-test commits of late October never pushed nor in `main` — push or drop, a chat's call after reading them); `pr-oil-earn-ffbf07` (two re-taken pictures over 27 Oct evidence, uncommitted — likely an accidental overwrite, to discard); `sync-main-handoff-fe9391` (an uncommitted iPhone guide, `docs/img/handpass/2026-10-29-iphone-guide/` and `scripts/handpass/iphone-guide.mjs` — ask him whether he still wants it); Codex's own locked folder; and the eight folders of chats still in his sidebar, all merged (`beautiful-merkle`, `dreamy-maxwell`, `epic-lehmann`, `leave-war-events-design`, `pictures-round`, `pr-day-start`, `rules-diet-followup`, `xenodochial-tesla`) — free once he archives those chats (the app's own "Clean up inactive sessions" then removes them). Left: (2) and (3).
**Cleared again 22 Nov 26 (the disk-space chat, his C drive at 3 GB free; each removal on his yes):** 10 working copies removed — `Raptor-lw4`, `Raptor-msqn`, `Raptor-n3`, `Raptor-st3`, `Raptor-tj`, `Raptor-vs` (each at a commit already on GitHub, nothing uncommitted; four preview servers of 17 Nov held the first two and were stopped), `leave-war-events-design`, `agent-a9aa54061d87f01bc` (its five `m5a-e2e-fix` commits are in `main` under other ids, matched by their titles), `pr-oil-earn-ffbf07` and `sync-main-handoff-fe9391` — the last two's uncommitted pictures and the iPhone guide script first copied whole to `D:\Raptor-leftovers-2026-11-22` (whether he still wants that guide stays his question); 15 records of copies already gone pruned. The temporary folders of 53 chats idle since 20 Nov or earlier cleared (about 90 GB of reviewer copies and test output). Kept: the running multi-squadron chat's copies, `Raptor-msq` and its helpers, the Microsoft sign-up chat's copy, `raptor-demo` (his briefing deck, D57), `Raptor-ui4`/`ui4b` (190 MB each). Why the copies are so big — about 7.6 GB of each is the walk pictures — is now his D2290, filed as [HELPER-COPIES-NO-PICTURES].
**Left on his PC by chats whose work has merged (filed 24 Nov 26, chat 158, from their handoff blocks as those were removed — D2460); each removal on his yes:** `D:\Raptor-edge` (chat 135's lean copy; its `raptor-port/node_modules` is a junction to the main folder's — unlink it with `cmd /c rmdir` before removing the copy; a preview may still answer on port 4391 — stop it by its port); the night helpers' copies of 21–22 Nov under `.claude\worktrees\agent-*` (each pushed; each `node_modules` junction unlinked first); the lean-copy trials' leftovers `D:\rsp-cc`, `D:\rsp-cc-hook.log` and the empty `C:\d` (the safety check refused them — his to delete by hand); the working copies made before 22 Nov can be slimmed (`node raptor-port/scripts/lean-copy.mjs slim` in each, once its chat is done). **Also from those blocks:** the archive pass of the two-squadron batch 1's finished backlog items is still owed (the backlog's tripwire was raised for it, to come back down); when `claude/rules-check-small-batch` brings `main` in, its copies of skill notes 939–943 are duplicates — keep `main`'s (D78).

### [LW-E2E-WRITES-EVIDENCE] The Leave War's browser test re-draws tracked walk pictures — OPEN (found 22 Nov 26, chat 134, by the lean copies' reads)
**What:** `raptor-port/e2e/leavewar.spec.ts` (two picture steps, the D1444 test) saves its pictures over `raptor-port/docs/img/handpass/2026-10-27-lw-m4/d1444/f1-decided-pressed.png` and `f1-decided-settled.png`, which are committed walk evidence — so every run leaves them changed (the main folder shows them changed on 22 Nov 26), and in a lean working copy the commit guard stops the next commit until they are fetched and restored. **To do:** the test writes its pictures to a folder that is not committed (as the other browser tests do), or stops writing them; the two committed pictures stay as they are. **Place:** low — with the next Leave War batch.

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
**His order, 16 Nov 26 (D2086):** the multi-squadron and detachment design, then caps and ops limits, then the Tracker expansion, the multi-squadron build last. **Added 16 Nov 26 (chat 89, with D2083):** in his words, the work ahead is "a training tracker expansion", "detachment modes", "caps and ops limits" and "multiple squadrons" — the last two are `[CAPS-OPS-LIMITS]` and `[MULTI-SQN-DESIGN]`; detachments were first named in D1100. What the Tracker's expansion and the detachment modes mean is asked when their batches are planned, never guessed (whether the expansion is the progress graph D774 holds back is among the questions). Opus plans and builds them, Fable only on his call (D2085, which took back D2083).
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

**Historical pause — D585, 5 Oct 26 (ended by D614; the calendar went live on 9 Oct 26, pull request 487):** Inputs/SANS calendar is on hold; preserve the completed preview and context. No more design/build/Claude vetting until owner resumes. Other outstanding tasks may be discussed; no new batch starts automatically. Existing D495 later order remains Tracker progress graph → caps/ops limits → whole-app check, with database connection at the end; this pause does not approve another build.

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

### [CAL-OLD-LOOKS] Three small leftovers of the calendar job — an old mock-ups page's note, a drop at the screen's bottom edge, his looks nobody recorded (filed 10 Nov 26 from [CAL-JOB-LEFT] (4)–(6))
**Status: OPEN — small, none of it a fault in the app.** Each is quoted in full in [CAL-JOB-LEFT] (4)–(6), in `OUTSTANDING-ARCHIVE.md`.
(4) The main mock-ups page of the calendar job (https://claude.ai/artifact/U3WNp6VARTdVeDP5cUoQvD) still draws the rows under the Event rows: add a "Since drawn:" line under those pictures when that page is next published (owed from D665).
(5) In Rearrange on a desktop, a row dropped within about four pixels of the screen's bottom edge does not move — not shown to be a fault a person would meet.
(6) His looks nobody recorded: whether "Legend" stays on the Leave War phone header's second line in Apple's font (`raptor-port/docs/handpass/2026-10-08-lw-phone-header.md`); the people picker's tighter puck spacing (`raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §8); D675's caution that "Calendar…" inside a calendar's own settings may read oddly. Each stands as built unless he says otherwise.
**Place:** (4) when that page is next published; (5) and (6), none.

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
  header still says "one test file needs no lock" — bring it in step with the corrected rule (444). `take` crashes
  (ENOENT, reading the lock folder's status) when the lock is released between two of its tries, so a waiting `exec`
  dies instead of taking the freed lock — found 8 Nov 26 by chat 16 ([LW-PIN-LAST-FRAME]); treat a lock gone mid-read
  as free and try again.
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

**Added 10 Nov 26 (chat 48, from chat 19's handoff block):** (a) the secrets scan's download of its tool failed again and
again on 8 Nov 26 (GitHub answering 504, other branches hit the same minutes), each passing on a re-run — if it recurs, a
retry in the workflow's download step; its last 40 runs were green (read 10 Nov 26). (b) The design checker's one skip
for the gold history dot (`20-changes-quals.css`, D1890) has not been seen working live: fed an edit of that file the
checker printed nothing with or without the skip — the next chat that edits that file sees whether it stays quiet
(no edit of it since, read 10 Nov 26). (c) The two reads' tidiness notes on the script guard and "checks passed" (D489,
filed not fixed, 8 Nov 26 — kept until now only in `[SHELL-SCRIPT-GUARD]`'s archived entry): `nativePath` copied from the
push guard, not imported; the `<`/`>` pattern written twice in `tokens()`, its comment about a digit before `>` not
matching the code; docsize's comment says the gates skip `.impeccable/**`, untrue of the `raptor-port/` copy; `python
-VV` refused; a quoted `<` mid-word in an option still read as a redirect for cat, tee and the interpreters (rare); once
the repo is private, the two new jobs bill about 2 minutes a run.

**Added 10 Nov 26 (the skill-notes review, group A-walks):** (d) **the code check's message** (`scripts/code-check.mjs`
`read()`): when React Doctor marks the comparison degraded, the message blames `main`'s side whatever the cause — print
its own skip reasons (`skippedCheckReasons`) first, since on 3 Nov 26 the cause was a walk script on the branch with one
character not in UTF-8 (778); and a changed code file that is not valid UTF-8 is refused by name before React Doctor
runs (778; [WALK-SCRIPT-UTF8] carries the guide's line). (e) **One shared "letters fit" helper** for walk scripts,
measuring the letters' ink as `lw-cell-combos-measure.mjs` does, so a new script imports it instead of writing its own —
the guide's line was missed the day it was written (834). (f) **A unit check over `e2e/*.spec.ts`** that flags a new
text-width assertion (`getBoundingClientRect` against a fixed width) in a test that pins no letters — the Linux-letters
trap met twice, 23 Oct and 8 Nov 26 (680, 882). (g) **A ready script for a blind reader's clean copy**: archive named
paths only (the source, the docs without evidence sheets, pictures or the archive, the rulings, the backlog), set
`core.longpaths`, two commits with `git rm -r` between them, the base tagged `BASE` and the reader told what it stands
for — a whole-tree copy took over ten minutes and then failed on a long file name (898).

**Added 10 Nov 26 (the skill-notes review, group B-design):** (h) **The "start fresh" address, refused where it hides
the thing under test** — beside the walk helpers' refusal to save a world from it (237, 506): the walk and drawing
helpers' start (`scripts/handpass/lib.mjs`, `scripts/drawcheck/lib.mjs`) refuse an address carrying both `fresh=1` and
`savefail` (D1666 — the failed-save switch works only on the browser's store, so under `fresh=1` the band never shows),
and a `reload()` in a page opened on `fresh=1`, whose every reload begins from the demo world again — met 29 Oct 26 (six
"not kept after a reload" FAILs that were the script's) and 8 Nov 26 (a comparison of two identical screens) (745;
`docs/walk-scripts.md` §3 carries the guide's line).

**Added 10 Nov 26 (the skill-notes review, group C1-handoff):** (i) **The check lock's `exec`** (`scripts/gatelock.mjs`):
one quoted string after `--` is handed to Windows' own shell, not bash, so a compound with `;` or `>` ran something else
and the lock reported a clean exit (31 Oct 26) — refuse a one-string command holding `;`, `>`, `<` or `&&`, with the
advice to write a script and pass `-- bash <script>`, and say so in the usage line (760; `docs/gates-and-deploy.md`
carries the guide's line). (j) **The push guard** (`.claude/hooks/push-guard.mjs`, a hook — on his word, read as a guide
change is): before a push to a branch with an open pull request, read its merge state and, when it is CONFLICTING, say
that no check run will start until `main` is brought in — met three times on 8 Nov 26, each time after a wait for a run
that never came (887; the guide's line in `docs/gates-and-deploy.md`, "After a push", and the memory note on stacked
and clashing pull requests).

**Added 10 Nov 26 (the skill-notes review, group C2-records):** (k) **The change-mark check** (`scripts/docsize-rulings.mjs`
`backMarks`): it reads only the first number after a change verb, so "Narrows D1510 and D149" checked D1510 and never
D149, and it runs only on new rows — read every number of the list after the verb, and run it once over every live
row, listing what is owed (881: D149 and D218 unmarked, found only by a drafter reading row by row, 8 Nov 26). (l) **The
backlog script** (`backlog-archive.mjs <ID>`): before it moves an item, warn when the item is the backlog's last mention of
a ruling whose row names the backlog as a home, naming the item that could carry the number (900: D1871's home check
failed only at the closing step, 8 Nov 26). (m) **The document check** (`scripts/docsize.mjs`): fail on any line
beginning `<<<<<<< ` or `>>>>>>> ` in a file it reads, and on a `=======` line between two such lines (a heading's
underline is not one) (803: a rulings file kept a merge's clash marks through a
passing check, 6 Nov 26; only the commit refused; `docs/gates-and-deploy.md`, the settle step, carries the guide's line).

**Added 10 Nov 26 (the skill-notes review, group D-reads-code):** (n) **The backlog script's git wrapper**
(`scripts/backlog-archive.mjs`, its `git()`): it returns an empty text whenever git fails, and it sets no output buffer,
so a listing past Node's 1 MB default — the untracked walk pictures alone can pass it — reads as "no files" with no
error (840: the same wrapper made `docsize --reads` report every rules file as not loading, 300,000 tokens wrong, 7 Nov
26; `docsize.mjs` and `docsize-reads.mjs` were fixed then, this one was not). Set `maxBuffer`, and let a listing whose
empty result means "none" fail loudly; the rule for any new script: swallow an error only where "none" and "failed" lead
to the same action. (o) **The document check's self-test takes a name filter** (`scripts/docsize-selftest.mjs`, an
environment variable), so a red-first round can run only its new cases — without one, each round of fixes to the merge
tool meant a scratch copy with every case-runner patched (841, 7 Nov 26; about 12 minutes a round). (p) **The inputs
guard reads comments** (`src/engine/inputs-readers.test.ts`): its file list is chosen by `NAMES` over the raw text, so a
comment heading with the word INPUTS in capitals put a file in the set and turned the unit run red (767, 2 Nov 26) —
choose the list through the guard's own `code()` that strips comments, as its other checks do. (q) **The tests that
name a changed file, listed and run before its first push:** a small script that takes the branch's changed files and
lists every test file — unit, browser, smoke scripts — whose text names each one's base name (`grep -rl` over `src`,
`e2e` and `scripts`), unfiltered, to be run before the first push; the test-driven-development guide's "Which other
tests?" already says to find them, and it was missed twice — a filtered search missed five browser tests on 5 Nov 26,
and the date box's look test on 8 Nov 26, each found only by GitHub's run (833). (r) **The Inputs list's browser
tests open on every date by default:** the list shows a window of dates from today, so a new test on today's clock
found no rows and failed its own setup, twice on 8 Nov 26 (865) — the list's test helper shows every date unless a test
asks otherwise, and a test that measures the list's rows asserts a row is visible first; the guide's premises line
carries the rest.

**Added 20 Nov 26 (the skill-notes review, group A-handoff):** (s) **A commit guard beside the push guard**
(`.claude/hooks/`): it records, per session, the branch this session last created or switched to, and refuses
`git commit` when the checkout's current branch differs, naming both — two chats in one folder put one chat's commit on
the other's branch on 3 and 10 Nov 26 (skill notes 787, 916, 917), and the check by hand, `git branch --show-current`
before each commit, was known and not run. (t) **No time from memory in a handoff block** (skill notes 853, 873, 892,
932, 935 — met five times; the guides' "read the clock" lines did not stop it): the document check, at its Stop-hook
run on his PC, fails a dated clock time in a `## Now` block that is later than the PC's own clock — every wrong time
met so far was later (00:40 written "01:00" and "00:55"; 19:10 written "19:45"; 19:05 written "about 20:00"); CI's run
skips it, its clock being UTC. Or a placeholder in the block that the commit fills from the clock. (u) **A merged
block's removal checked** (skill note 947): run on his PC, the document check fails a change that removes another
chat's `## Now` block whose branch is not merged into `origin/main` — on 14 Nov 26 later handoffs removed two overnight
runs' blocks while seven of their pull requests sat open. (v) **The push guard refuses a push whose new commits add one
file over about 5 MB outside the picture folders** (skill note 944: two 13.5 MB raw dumps pushed on 14 Nov 26; the force
push to take them out was refused and the job was made again on a second branch).

**Added 20 Nov 26 (the skill-notes review, group C-walks-tests):** (w) **The document check counts the bug-check
order's lesson numbers** (`scripts/docsize.mjs`): §7.11's numbered lessons, read in order, must run 1, 2, 3… with no
gap and no repeat (a letter after a number, such as 23b, counts as its own number once), and the checklist's list of
lessons (`docs/bug-check-checklist.md`, "The lessons of §7.11") must carry the same numbers in the same order — fail
on either, naming the number. Two chats on different days each wrote a lesson 23, cited by number elsewhere ("§7.11
lesson 23"), so the citation was ambiguous for a fortnight; the review's draft renames the second 23b (919, 10 Nov 26).
A numbered list that several writers append to needs its numbering checked by a tool.

**Added 20 Nov 26 (the skill-notes review, group D-reads-records):** (g) **widened — the blind reader's copy script**
does the whole recipe now written in `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head:
the pictures left out by pathspec (`':(exclude,glob)**/*.png'` and the jpg, gif, mp4 and webm alike — seconds, where
the whole tree ran past five minutes); the branch's `HANDOFF.md` block and the round's builder brief, reports and
evidence sheet replaced in the copy by one line each, so the reader's start-up reads find nothing to anchor on (twice,
19 Nov 26: the Codex reader read the builder's summary before the brief's "do not read"); every git command run with
`-C <copy>`, never in the checkout — `git -c core.longpaths=true add -A` and `git -c core.hooksPath=/dev/null commit` —
refusing to finish unless the copy's `rev-parse --show-toplevel` names it and its `git log --oneline -1` prints the commit
(an `add` inside a loop failed silently on a long name, and every copy had no commit; Codex refuses a folder that is not
a repo); and, when asked to start the reader, `codex exec` with the model named (`-m gpt-6-astra`, D2210) and
`< /dev/null`, then a check after about 90 seconds that the log has grown (a backgrounded run waited 80 minutes on its
input) (954, 977, 978, 981). (x) **Check, then commit:** one script, `raptor-port/scripts/check-commit.mjs -m "<message>"
[paths…]`, runs `npm run docsize`, prints its last lines, and commits only when that check exited 0 — used for every
records commit; and the script guard (`.claude/hooks/script-guard.mjs` — a hook: on his word, read as a guide change is)
refuses a `git commit` that follows a check (`docsize`, `rulecheck`, `npm test`, `lint:changed`) joined by `;` or after a
pipe, with the advice "join the commit with `&&` to the check's own exit, or use check-commit.mjs" (926, 10 Nov 26 — a
semicolon; the pipe twice before, 3 and 8 Nov 26, the memory note on a pipe hiding a failed check). (y) **The
after-merge wait:** `raptor-port/scripts/wait-live.mjs <commit>`, beside the check lock: exits 0 only when every GitHub
run of that commit concluded `success` or `skipped` AND the Production deployment for that commit reports Ready; any
other conclusion exits non-zero naming each failed job and the step it failed at, so a download step on the hosted
machines is told from a failing test at a glance; `docs/gates-and-deploy.md`'s "Done" loop names it (936, 11 Nov 26: a
wait written as "nothing still running" printed "ready" on a failed run). (z) **The code check by hand reads new files:**
`npm run lint:changed` passes `--include-untracked` by default (the pull request's job and the end-of-turn hook read
committed files and stay as they are), and prints the changed files it read when asked (928, 11 Nov 26: a new test file
not yet staged was not read, and its finding was met only on GitHub; `docs/gates-and-deploy.md` carries the guide's line).

**Place:** his to place. The agent's recommendation: one small tools job, any time, its own branch; the gates and a
fresh Opus read of the scripts; no walk (nothing of the app changes).

### [CSS-SCOPE-GUARD] A rule begun at `body`, `html` or `:root` inside a page's wrapper matches nothing (skill notes 728 and 967; filed 20 Nov 26 by the skill-notes review)
**What:** a stylesheet that wraps itself in its page (`#page-leavewar { … }`, native nesting) turns a rule written inside
the wrapper as `body …`, `html …` or `:root …` into "a body inside the page", which never matches: nothing is drawn and
no error is raised. Met twice: 27 Oct 26 (M4, a `body:has(…) .bidsheet` fix, two builds lost — note 728) and 17 Nov 26
(chat 100, the grid's hover ring moved from an injected drawing into `matrix.css`; unit tests and a code read passed, only
a browser test of the computed style caught it — note 967). The guide lines now warn (`.claude/skills/brainstorming/mockups-on-the-real-app.md`
§The Method step 6, "From the picture to the build"; the comments in `matrix.css` and `approvals.css`), so the next step is a
check, not more words.
**The check:** extend `raptor-port/src/ui/css-wrapper-css.test.ts` ([CSS-WRAPPER-GUARD]'s test, which already parses every
stylesheet wrapped in its page) with a second rule: inside a wrapper block, at any depth (an `@media` or nested block
included), a selector whose first compound is `html`, `body` or `:root` — with or without a state (`body.x`, `body:has(…)`) —
fails, its message naming the file, the selector and the two ways that work (written from the page with `&…`, or placed
after the wrapper's close as a state of `body`, rule 3 of that test). Proved red first by putting the 17 Nov 26 rule back
in a copy of `matrix.css`.
**Place:** with the next Leave War or Tracker batch (D490), or any job that touches a wrapped stylesheet; no app change, so
no walk beyond the test's own red-then-green.

### [ASK-PAGE-CHECK] A check run on a page before it is put to him (skill notes 968 and 973; filed 20 Nov 26 by the skill-notes review)
**What:** two rules for the pages put to him keep being broken by hand, each after it was ruled. (1) A questions page shows
only what is still open, newest first (D1237, D1363; D1237's reading: rebuilt at every new version): met again over chats
97–100, when four rounds each added one more "Newest" block on top and answered items stayed below until he asked for the
page to be made readable (note 968 — the third meeting, after 22 and 25 Oct 26). (2) Every such page is in plain words — no
review codes (H2, F16), ruling numbers inside sentences or record words ("narrows") in its text or on its pictures' tags
(D2164, D2185): round 7's page and its picture tags carried the findings' codes (note 973).
**The check:** `raptor-port/scripts/askpage-check.mjs <page source>`, run on the page's HTML source before every publish
(the mock-up guide's Showing It to name it once built): fails on (a) a code of one or two capitals and digits, or a ruling
number, in the visible text — outside a small grey reference after an item (D2164's reading) — and on a picture tag whose
words are anything but a number or "New"; (b) a short list of record words kept beside the script (narrows, supersedes,
greyed, REFLECTED, ACTIONED); (c) more than one top "look at now" list, or an item marked answered or replaced still on the
page. It prints each hit with its line; a hit kept on purpose carries a marker comment. The page is still read by eye — the
script catches only what words can.
**Place:** with the next design round put to him ([MULTI-SQN-DESIGN]'s next batch), built before that round's page goes
out; no app change.

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
**Design, round 1 (17 Nov 26, overnight, nothing ruled):** `raptor-port/docs/superpowers/specs/2026-11-17-caps-design.md` — the four open points of D2084 drawn on the app and put to him as Q1–Q6, with its questions page and pictures.
**What it is — his D2084, 16 Nov 26:** a weekly form each person fills in at the start of the week, cleared by itself every week; one button shows who has completed it, those flying above all; a click switches the check off. Open, asked when its batch is planned: what the form holds, who must fill it in, whether a flyer who has not completed it raises anything on the schedule, what the switch turns off.
**PAUSED 17 Nov 26 (D2186, chat 105): until he calls for it — nothing planned or built, its eight questions (Q1–Q8, R1–R4, on its page https://claude.ai/artifact/9VQ2YL9CceeCZL6XgQRS4p) not put again.** **Before — his order D2086 (16 Nov 26):** second, after the multi-squadron design, with the schedule area's small fixes; D2084's open points asked when its batch is planned. **Before, D568 (5 Oct 26), superseded by D2086:** "nvm i will do something else." Stop the immediate handoff; no new chat created, no replacement task chosen. Wait for the owner. The following D567 design-start draft is cancelled history, not current authority.

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
**Place:** second in his order (D2086), after the multi-squadron design; unbuilt (the D567 handoff was cancelled by D568, 5 Oct 26). Previous builds remain separate for review; no main/live authority.

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
**LIVE 10 Nov 26 on his "merge live" (pull request 739); the page is kept up to date as terms settle. DRAFTED and CHECKED 10 Nov 26 on `claude/word-list` (chat 49's night, his "Go + word list" of 10 Nov 26):** Astra's draft, 225 rows by area, at `raptor-port/docs/word-list.md`, with its row in the project guide's map (a guide change — live on his approval and "merge live"); every label and code name searched in the app's source (one code name that does not exist removed), not walked on screen; read by Astra and a fresh Opus reader, eight rows corrected. Found on the way: OML read "ordinary medical leave" on the Inputs page but "outpatient medical leave" in the Leave War — he ruled "ordinary" (D1950, 10 Nov 26), and the Leave War's label was corrected on this branch. The plain-language rule's pointer to it still rides with `[SKILL-FUSION]`.

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

**Added 20 Nov 26 (skill note 942):** measure what a scheduler-engine job loads on its first source file, as
`[LW-START-LOAD]` (archived) did for the Leave War (D1960, D1973): chat 68's small engine fix at the FULL tier read 76%
full after its reading alone and 90% once the fix and its tests were committed (13 Nov 26) — opening the engine and
screen files loaded the project guide, the scheduler's, the screen-design and OIL pages, the builder's rules and the
design short form, each whole. Then options for which of them stop loading there, as for the Leave War.

### [SIMILAR-APPS-LOOK] Other apps like ours, and what to learn from them — his question, answered; his to act on or leave (12 Oct 26)

**His words (12 Oct 26, while step 3 of the one-rule job was being built):** *"can we search the web to see if there's any other similar web app that is similar to raptor and see if we can take reference from them to see if what we are doing has been done and we can learn from them"*. **Done the same night:** one helper searched the public web; its report, whole — eleven products (military squadron schedulers, flight-school schedulers, airline bidding, fatigue scoring, shift rostering), eight lessons each tied to its product, where ours does what they do not and where it appears to lack what they have, and every link opened — is `raptor-port/docs/superpowers/briefs/2026-10-12-similar-apps-research.md`. Military tools publish little; what was only a search summary is marked there.

**What is his here — nothing is built until he says:** whether any of it becomes a job. The five things ours appears to lack, as the report names them: suggested filling of seats; a fatigue score beside the crew-rest rule; member-to-member swaps; phone alerts with "I have seen it"; the training syllabus telling the scheduler who needs what next. Two of its lessons touch work already in hand: telling only the people whose day changed (the bell's notices, `[ALL-AVAIL-AS-MEMBER]` step 7) and fewer, plainer screens (`[UI-SLEEK-PASS]`).

### [UI-SLEEK-PASS] The interface made more minimal, intuitive and sleek — fewer words, button placement, motion, colour meaning, icons, flow; the Raptor look kept, never at a cost of speed (his direction, D765, 12 Oct 26 — AFTER the one-rule build; his to place)
**The other places each design lesson may apply (D852) — suggested, never changed unasked — are in one searched file since 10 Nov 26 (D1976):** `raptor-port/docs/archive/design-lessons-detail-2026-11-10.md`, by lesson number; this pass works from it, and a new lesson's list is added there under a new dated heading.
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

**Round 4's walk, left for a later round (chat 170, 24 Nov 26 — the evidence sheet `raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §12).** Nothing here is wrong on a published record or an OIL count; each is a wording nobody has ruled, or an older fault met in passing. (1) **Found, not fixed — the note's box and a long word:** a value of 60 letters with no space typed into a time box runs about 10px past the passing note's border on a phone (Chromium and WebKit; picture `raptor-port/docs/img/handpass/2026-11-24-words-r4-walk/c/c6c7-103612/c7-longnote-wk.png`). The note has named what was typed in the schedule's own time boxes since before round 4; round 4 made it reachable from an input's row too. A fix is the note's box breaking a long word, proved by a real-browser test of the box at a phone's width. (2) **Wordings for him, with pictures, when the bell's next round is put to him:** a leave made another kind and a half day in one save reads "Now OL (AM), LL changed to OL · Saber" — it names the new kind before saying it changed; a morning LL changed to a Training reads "Now 00:00–12:00, LL changed to Training · Saber" — hours nobody typed (the half went with the kind); a half-day leave only moved to another day reads "Now Wed 22 Jul · Saber", with no "(AM)"; a title given to an input that had none, a title taken away and an Attach's "To" changed still read "Renamed — was …" (the reading recorded in D2521's row). (3) **"leave war" in small letters in sentences round 4 did not touch:** "A leave war already covers part of 2028. Open the Leave War and extend it instead." (the "Create the period" button), and the New leave war window's own lines ("Only an admin can create a leave war.", "Those dates overlap a leave war that already exists…", "That would run off this leave war."). (4) **Found, not fixed — the Scheduler Board's Ground Programme row lags one change behind (walker c's lead, reproduced by walker d on this build and on `main`, a desktop and a phone):** with the Board open, an accepted input's start changed in its in-place box (0900) saves — the input, the week and the Personal Inputs row read 09:00 — but the Board's own Ground Programme row for it still shows 08:00, and after a second change shows the first; closing the Board or a reload clears it; leaving the stale box without typing writes nothing back. Older than round 4 and not of its making. Pictures `raptor-port/docs/img/handpass/2026-11-24-words-r4-walk/d/d34-r3/` (`D4-fixed-3-after-0900-on-board-board-ground-desk.png`), the steps `raptor-port/scripts/handpass/wr4-d-d4b.mjs`, the report `raptor-port/docs/handpass/parts/wr4/d-report.md`.

**The bell says every change, and the app's other counts (his D2600, D2601, D2603 — 24 Nov 26, chat 170; round 4 itself LIVE that day, pull request 841).** (1) **To draw, then build (D2600):** the changed input's bell line says every change of a save in words, never "and N more changes" — drawn on the real app at his iPhone's size first, the worst case included (six changes, a long old title: a third row), each reading in D2600's row shown on it (D1625; the readings review, [READINGS-LAPSE-FIX], asks the same of every new bell word until its checking fix is live); then `raptor-port/src/state/notices.ts firstTwo` and its tests, `raptor-port/docs/ui-contracts.md` §the bell and the register's row B9. High risk — bell lines are saved records: the latest Fable. Agree the order first with the SANS words job (pull request 825) and the guard rail (pull request 826), which change other lines of the same file. (2) **A question for him, with its worked example (D2601):** an undone change's notification — in the bell it is already ruled on pull request 825's branch; the phone's second alert is new (with [CODE-APPS-RESEARCH]). (3) **The look for other counts (D2603):** every other place in the app that gives a count where it could say the things themselves — the bell's other lines, the passing notes, Undo's words, the change history, the warning list — each put to him with a picture of the real app and a recommendation; nothing changed by the look itself.

### [NO-ASTRA-LIST] The jobs that went ahead without a ChatGPT reader (Astra or Sol 6.1) — the ONE list, kept for when his subscription is back (D761, 11 Oct 26)
**His word (D761):** *"take note of the tasks we did not have Astra involved. I may only get my subscription on 1st November onwards."* His ChatGPT allowance ran out on 11 Oct 26; wherever a record says "after 14 Oct 26", read "when ChatGPT is back — not before 1 Nov 26". **A list to put to him, not a promise:** when ChatGPT is back he says which of these reads he still wants. Add a line here in the same change that lets a job go ahead on one reader, and for every walk whose scenarios went without Fable's design, a fresh, blind Opus designing in its seat (D2444, 24 Nov 26); a line leaves only when its read is done or he says it is not wanted.
**16 Oct 26 (the night):** round 1b of the words pass (D945, D947) and the till date (D948, [TILL-FROM-DATES]) on `claude/whole-app-words-pass-1b-6cfe51` — read by one fresh, blind Opus reader (D790, D903); without Astra and Sol 6.1.

| The job | Who did read it | What it went without |
|---|---|---|
| Fix read 11 of multi-squadron batch 1 (chat 118, 20 Nov 26) on `claude/multi-sqn-b1-107` (pull request 806): fix read 10's five fixes (`3242f3b3b..eb51fa689`) | the fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) — all whole; Astra (GPT-6 Astra) ran on the unchanged brief and was stopped twice by its service as a "cybersecurity risk", the fourth round running — no claim; its last lead (a delete and its Undo under fault C) checked by the host, green (`…/briefs/2026-11-20-multi-sqn-b1-fixread11-astra.md`) | Astra's full read — owed to fix read 12 |
| Fix read 13 of multi-squadron batch 1 (chat 118, 20 Nov 26) on `claude/multi-sqn-b1-107` (pull request 806): fix read 12's five fixes (`cd8231767..3d9743036`) | the fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) — all whole; Astra (GPT-6 Astra) stopped by its service as a "cybersecurity risk", the fifth time — no report; its last line named two older leads (a command bringing back a deleted person; the Leave War's dragged-selection remark editor not telling a filer), for the host to reproduce (`…/briefs/2026-11-20-multi-sqn-b1-fixread13-astra.md`) | Astra's full read — owed to fix read 14, on a brief of its own worded as a rules check, its findings written as it goes |
| Fix read 10 of multi-squadron batch 1 (chat 118, 20 Nov 26) on `claude/multi-sqn-b1-107` (pull request 806): fix read 9's six fixes (`ae1af3806..0613720a7`) | the fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) — all whole; Astra (GPT-6 Astra) ran on the unchanged brief and was stopped twice by its service as a "cybersecurity risk", its progress claims kept (`…/briefs/2026-11-20-multi-sqn-b1-fixread10-astra.md`) | Astra's full read — owed to fix read 11 |
| Fix read 9 of multi-squadron batch 1 (chat 118, 19–20 Nov 26) on `claude/multi-sqn-b1-107` (pull request 806): both rounds of fixes, fix read 7's U, M, P, T, F, S, Q and fix read 8's R, D, G, N, H, B, W (`69a5bdb1d..ae1af3806`; who is told on a bell, the commit gate, grants' dates, Undo / Redo) | the fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) — all whole; Astra (GPT-6 Astra) and Sol 6.1 (D2227) each ran blind and were each stopped by their service as a "cybersecurity risk" after ~210k / ~232k tokens, progress notes kept (`…/briefs/2026-11-19-multi-sqn-b1-fixread9-{astra,sol}.md`) | Astra's and Sol 6.1's full reads — the brief's security paragraph is the likely trigger (skill note 980); his to call: a run with the security scope moved to the security reader's own prompt |
| Fix read 8 of multi-squadron batch 1 (chat 117, 19 Nov 26) on `claude/multi-sqn-b1-107` (pull request 806): fix read 7's seven fixes U, M, P, T, F, S, Q (`69a5bdb1d..f15bc3fa4`; who is told on a bell, the commit gate, grants' dates) | the fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) — all whole; Astra (GPT-6 Astra) ran and was stopped twice by its service as a "cybersecurity risk", its three progress claims kept (`…/briefs/2026-11-19-multi-sqn-b1-fixread8-astra.md`); his one-off GPT-6.2 Astra (D2226) not offered on his account | Astra's full read — owed to fix read 9, which reads both rounds (`69a5bdb1d..ae1af3806`) with Sol 6.1 beside Astra on his call (D2227) |
| The night of 18–19 Nov 26 (chat 109), multi-squadron batch 1 on `claude/multi-sqn-b1-107` (pull request 806): job 2's twelve fixes of the full check (permissions, saved data, the Leave War's rows, bell lines, the change history; 2b792ebc5..3dbe5a21c) | the fresh, blind Opus read of the first ten (at 80ccf1fa0); then all thirteen, with the Leave War month-jump fix b322cad23, by Astra and a fresh, blind Opus reader, blind to each other (fix read 3, 07:13–07:40 19 Nov 26, `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread3-{astra,opus}.md`) | Sol 6.1 (his call only); the reads of fix read 3's own fixes |
| The top bar held through the page's spring (D1873, [TOPBAR-BOUNCE-AWAY]) — Astra wrote the code (rounds 1 and 2) on `claude/lw-pin-last-frame`, pull request 694; the host's two fixes of the read's F1 and F2 (chat 39, 8 Nov 26) | the fresh, blind Opus read of the finished code (0 High, 0 Medium, 2 Low — both fixed) | Astra's read (he wrote it); Sol 6.1's second read |
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
| `[CAL-JOB-LEFT]` (1) and (2) — `AGENTS.md`'s stale paragraph; the one sentence added to `.claude/rules/doc-structure.md` (D667); Astra's meaning read of the short ruling lines D658–D665, D676–D679 and D734–D741 | nobody | D70's two reads; Astra's D138 read — **10 Nov 26: (1) done, live with pull request 741; (2) overtaken (those short lines became pages read blind by Astra and Opus, 9 Nov 26) — DROPPED on his D1970** |
| The short ruling lines D742–D761 (recorded 10–11 Oct 26) | the host, at the writing | Astra's D138 meaning read, as for the lines above — **10 Nov 26: overtaken as the row above — DROPPED on his D1970** |
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
| [LW-PIN-LAST-FRAME]'s last fix (D1870; `claude/lw-pin-last-frame`, pull request 694 — the pinned dates row held shown when the grid is shown again from a tab or another page), made after Astra's read of the job | a fresh, blind Opus read (D790), its one inferred case probed and not reproduced | Astra |
| Multi-squadron batch 1, fix read 14 (`claude/multi-sqn-b1-107`, pull request 806, 20 Nov 26) — Astra stopped by its service after ~268k tokens; its three saved findings reproduced red; his D2232 accepts such stops for the build's fix reads (partial reads listed here) | a fresh, blind Opus reader, Fable (D2224) and the security reader (D1411) whole; Astra partial (D2232) | Astra's full report |
| The turn-end backlog check made fast, [TURN-END-CHECK-SLOW] (a) (pull request 828, live 24 Nov 26): a change to a check's script and a hook's time limit, no app code | one fresh, blind Opus reader; old and new compared in five situations | Astra's read — **24 Nov 26: DROPPED on his word ("Drop it")** |
| Multi-squadron batch 1, the core read (his D2237; `state/{perms,notices,units}.ts` whole at `7dbc13fd0`, 20 Nov 26, chat 124) — Astra stopped by its service after one stated finding (reproduced red, R4); fix read 17 beside it had all four whole | the fresh, blind Opus reader and the security reader (D1411) whole; Astra partial (D2232) | Astra's full report |

### [WEEK-ADD-TAP-PHONE] On a phone, a tap on a row's "+ add" on Edit Schedule's week arms nothing when the row already holds someone (found 11 Oct 26 by `[GROUP-INPUT-ONE-ROW]`'s walk — older than that job; his to place)
**Found, NOT fixed, NOT reproduced by the host on `main`.** Walker W2, scenario 3 (`raptor-port/docs/handpass/parts/gi-w2.md`; pictures `raptor-port/docs/img/handpass/2026-10-11-group-input-one-row/w2/s3-week-tap-add.png`, `s3-board-armed.png`): on a 390-wide phone, on the WEEK, a tap on a ground row's "+ add" arms nothing — no ring, no drawer — where the row's first place is filled; the same on an ordinary one-man row, so it is not the shared row's. The same tap on the Scheduler Board arms the row and the crew drawer opens. The walker read that the week's "+ add" label takes no taps and the people cell arms only an empty first place. **As filed:** low — the board's tap and a held-finger drag both add a man (walked, passing); to reproduce on `main` first, then either make the week's cell arm as the board's does or leave it by his word.

### [SKILL-FUSION-WRITING] The writing guide — outside writing guides and skills read at the source, their best parts taken into our own guide (he asked, 13 Oct 26) — the guide is approved (D836) and the rechecked wordings with it (D837–D839); what is left here is D835's step: the guide for how the agent writes to him
**He has answered (14 Oct 26 — "All approved as recommended"): the guide is approved (D836) and so are the rechecked wordings (D837, D838, D839). STEPS 1 TO 4 are done; STEP 5, the build, is next.** The guide goes live with this branch on his "merge live". **What is left of this item — D835's step, after the build or beside it, his to place:** the part of the guide that fits prose drafted into `.claude/rules/plain-language.md` for how the agent writes to him, read by the guide's readers, put to him (the tests that would go WRONG if copied across are listed at the foot of `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads-2.md`). The paragraph below is the state before his answer.
**Where it stands (14 Oct 26, early): put to him, waiting on his four answers.** The guide is `raptor-port/docs/design-practices.md` §1 (its additions), §1a (shortening — the first reads folded in) and the new §1b (how the app speaks, twelve tests), with short forms in `.claude/rules/ui-design.md`, check 4 of `.claude/rules/plain-language.md` and a line of `raptor-port/docs/PRODUCT.md`. **Read three times, each by a fresh Opus reader and by Fable, blind** — every finding applied: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md` (the first draft) and `…-writing-guide-reads-2.md` (the second, the third, and the cold read). The outside reading: `…-ux-writing-guides-research.md` (GOV.UK, Google, Apple, Microsoft, Atlassian, Mailchimp, the US plain-language guide, Nielsen Norman — and `blader/humanizer`, which he sent: read in full, its list of machine-writing habits taken as test 12, NOT installed). **His rulings on the way:** D834 — the long dash is not the app's ordinary way of joining two thoughts ("dash feels very AI"), a colon may be used, a dash where it makes sense; D835 — once approved, the guide is adopted for how the agent writes to him too, as a step of its own, and the guide was read again with his tool beside it. **The recheck (step 4) is done and with him:** `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` — List 1, the thirteen he approved (twelve to build; N8 can no longer be shown by the app — its line is dead since D96); List 2, the notes left whole, where only the dash changes; List 3, ten wordings a fresh reader tripped on; the clash note's and the OIL question's words; the two ruled bars, recommended left. **The page for him:** `raptor-port/docs/mock/writing-guide-13oct.html`, published as an Artifact (its link is in `HANDOFF.md`). **His four answers owed:** (1) the guide, with the agent's order — every fact, then a sentence a person would say, then short; (2) List 1 and the clash / OIL words; (3) List 2 in this build or in the whole-app words job; (4) List 3. **THEN:** each answer recorded as a ruling; the guide's wording is then approved (D70) and goes live with the branch on his "merge live"; the build of the three approved jobs starts — to the wordings he takes. **Still open after that — D835's step:** draft the part of the guide that fits prose into `.claude/rules/plain-language.md` (the tests that would go WRONG on messages are listed at the foot of the reads-2 record), have it read, put it to him. **And the relatives** of these notes that were not on the 13 Oct list (the recheck record's last section) go to the whole-app words pass (D808).
**His direction — D833 (13 Oct 26, late):** the writing guide complements the design guide and the design skill and is used every time app text is written — "intuitive clean simple smooth less verbose more human text with less -" (fewer dashes: the agent's reading); it shapes the Logic page's wording and this job's; and the wordings he approved (D827, D829, D830) are rechecked against the finished guide BEFORE the build. **The two reads are back (13 Oct 26, late) — both "ready with these changes", none applied yet:** every finding with its exact replacement wording, where the two agree and the one place they differ (the closed list of four kinds of word: Opus shows it forbids cuts he approved in D829; Fable tightens it) — `raptor-port/docs/superpowers/briefs/2026-10-13-writing-guide-reads.md`. **And he added (two messages, in D833's row):** outside skills and guides, and reviews of which are good, may be used to shape the guide — so the part on how the app speaks starts with a read, at the source, of the best UX-writing guides and of what reviewers say of them (the first research read only the shortening side, and three sources would not open: GOV.UK's, Google Material's, the US plain-language site). **So the order is now:** (1) the two readers' findings on the shortening method folded in (`raptor-port/docs/design-practices.md` §1a, drafted — D832); (2) the part on how the app speaks drafted beside it — voice, plain human sentences, fewer dashes, intuitive naming — and read by a fresh Opus reader and Fable; (3) his approval of the guide's wording; (4) every wording of `raptor-port/docs/mock/design-look-13oct.html` (the notes N1–N33, the clash lines, the OIL question's a–f, "Back / Add") rechecked against it — each shown today · proposed · the exact words changed — and put to him again; (5) only then the build of the three approved jobs.
**READ 13 Oct 26 (his second ask: "Can u read online on skills similar to this, is it worth installing") — the record: `raptor-port/docs/superpowers/briefs/2026-10-13-writing-skills-research.md`.** Both Strunk-based skills are a 1918 essay guide with "omit needless words" as a headline and no test — the instruction that caused the day's over-cut notes; the two UX-writing skills add little the design guide's §1 does not hold. Worth taking, as TESTS not maxims: a shortened note stays a full sentence; only four named kinds of word may be cut; swap before deleting; never trade a named thing for "it"; a fresh-reader test with set questions; "left whole" a proper result; no word count as a goal — eleven in all, with the day's notes 579 and 580. **Next, on his word:** draft them into the design guide's §1 and the wording method, one line in the plain-language rule; an independent read (D70); his approval. Nothing is installed.
**He asked (13 Oct 26, after sending the first shorter wordings back as "too summarised" — D825):** *"Is there a language skill u can download online to improve how you write clearly"*. **Told to him:** yes, several exist; the day's fault was a rule not applied (a shorter version must not change what the original meant — D138), not a missing skill; and by his standing practice nothing outside is installed whole (D486, D491, D812) — the best are read at the source and their good parts written into our own guides, read before he approves the wording (D70). **To do:** read two or three at the source, the Strunk-based "write-concisely" of `neolabhq/context-engineering-kit` first (found by one web search, 13 Oct 26 — a registry's summary, not yet read; its own listing calls Strunk "occasionally dated"), and anything better found then; bring him the pieces worth taking for `.claude/rules/plain-language.md` and the design guide's §1 — with the day's two lessons already in the working notes (579, 580): show the exact words cut, and read each rewrite cold. No app change.

### [OVERNIGHT-RETRY-TRIAL] One /overnight run tries the setting that keeps retrying when the service is overloaded (his D885, 15 Oct 26) — OPEN, for the next night he runs /overnight
**His yes (D885).** For that one night: before the run starts, add `"CLAUDE_CODE_RETRY_WATCHDOG": "1"` to the `env` block
of the MAIN folder's `.claude/settings.json` (the app reads settings from there — `[MAIN-CHECKOUT-STALE]`), committed on
the night's branch; in the morning read the run's record for any wait the setting rode out, and confirm no real failure
was hidden (a check that failed must still read failed). Then take the setting out again unless he says keep it. Not
known: whether the desktop app honours it — the night is the test. Optional companion, only if a wait was seen too
short: `CLAUDE_CODE_RETRY_WATCHDOG_MAX_WAIT_MS`. The `/overnight` guide is not changed for the trial (D70).

### [COMPACT-WHEN-MOD] A small sign in the Claude app that says how full the chat is and when it is a good moment to compact (his question, 14 Oct 26 — D857) — WIDENED 15 Oct 26 BY D868; BUILT 15 Oct 26 on his go (D870, D871), branch `claude/overnight-skill-c02843`, read by one fresh reader and fixed (design and read: `raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`); APPROVED (D872 — the guard off whenever he is away); LIVE 15 Oct 26 (pull request 509); OPEN until the next new chat's four checks in the app (the design's §"Still untested")
**His question:** *"is there a mod u can create or install to be able to tell I when to start compacting smartly"*. **The answer given him:** one can be made — a line in the app showing how full the chat is, marked at a good moment to compact (a clean, committed point with the state in the repo); the agent already reads that figure itself, so nothing waited on it that night. **Why it is put to him first and not installed:** it changes his Claude settings (a status line or a small mod of the app), which is standing configuration — his go each time (D162's precedent), and a tool that runs automatically here stays in a form other models can read (D623). **To put to him:** what it would show (the percentage; a colour at "good moment"; whether the state is committed), with a picture, and whether it should only show or also remind. Not app work: nothing under `raptor-port/src`. **Asked again 15 Oct 26** (whether the agent can see the figure, and that it matters for compacting at night): the agent reads the figure itself at any time, so the sign is for HIM; what the agent cannot do is START a compaction — the app does it by itself near 97% full. **To try with this job, safely, and rely on only if it works:** whether a message the app sends this chat at a set time (a scheduled prompt) can start a compaction earlier, on purpose — that would let the overnight command (D867) compact at a mark it chooses. **Widened by D868 (15 Oct 26): the agent chooses the moment itself, from about 80% full, without asking him, for day work and the overnight command — so a big job does not compact twice.** The build the agent proposes, from Claude Code's documentation (read 15 Oct 26 — the pages: env-vars, model-config, settings-reference, hooks, hooks-guide, context-window, statusline, scheduled-tasks on code.claude.com): (1) the app's own compaction point set near 80% (the `autoCompactWindow` setting, a token count — about 800000 on a 1M chat); (2) a guard run before every compaction (a PreCompact hook) that holds back an automatic one until the agent has marked a clean point with the state written (a small file the agent writes after its checkpoint) — the app's last-moment compaction near full stays the backstop; (3) after a compaction, the chat's `HANDOFF.md` block printed back in front of it (a SessionStart hook on "compact" — documented); (4) the fullness shown to him on screen (the status line, which receives it); (5) the scheduled-prompt route above, tried as an alternative. **Untested in the desktop app:** whether a held-back compaction is tried again later, whether the setting applies to this chat, whether the status line shows there — each tested on a throwaway chat before anything is relied on. Changes his Claude settings and adds automatic scripts: built on a branch on his go, read by one fresh reader, approved by him (D162's precedent, D70). **Answered (15 Oct 26, D868's row):** a handoff to a fresh chat stays his usual way; this is for a big job that would otherwise reach the app's compaction at 97%, and for the overnight command.

### [KBD-PUCK] A puck cannot be picked up, put down, swapped or taken off by keyboard — and the week's 440 pucks are Tab stops that do nothing (filed 13 Oct 26, the design look's K11) — OPEN, a job of its own, his to place
**Found by `[DESIGN-LOOK-13OCT]`, not fixed — the question the design guide left open ("whether a keyboard can arm a puck is for the keyboard sweep to say", `raptor-port/docs/design-practices.md` §2): it cannot.** Every puck is drawn as a Tab stop (`raptor-port/src/ui/html.ts`) and wears the app's ring, but no key is heard on one: Enter, Space and Delete do nothing on the Scheduler Board or on Edit Schedule's week (`raptor-port/docs/mock/2026-10-13-design-look/keyboard.json`). So a scheduler at a desktop cannot move a man without the mouse, and Tab crosses hundreds of stops with nothing to do on any. **The shape to design (questions for him first — D541):** Enter or Space picks a puck up as a tap does on a phone (the app's own "armed" state), the seats that can take him are then the Tab stops, Enter puts him down, Escape lets go, Delete takes him off with Undo; the crew list reachable the same way. **Risk to weigh:** the dense week is swapped as text for speed (`raptor-port/docs/performance.md` Part 1) — the keys must ride the one listener the board already has, never one per puck. Tier WALK at least; a puck's drop is the schedule's main write.

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

### [BOARD-UNDO-LAND-ODDS] The board's Undo landing — what the reads and the walk left (filed 11 Nov 26, chat 64; low)
**What:** the board's Undo and Redo now bring a changed box on screen when it is out of view (D672, `[BOARD-UNDO-SAME-DAY]`, built on `claude/next-jobs-recommendation-c110df`, pull request 756). Nine small things the two blind reads, the three narrow reads and the re-walk left, none losing anything and none a wrong record; evidence `raptor-port/docs/handpass/2026-11-10-sched-board-small.md` §4a and §6, the reads beside it in `raptor-port/docs/superpowers/briefs/2026-11-11-sched-board-small-read-*.md`. (i) A person moves an input to another day on the board and presses Redo: the board goes to the OLD day, not the new one (older; the landing's day is read from the step's before image first, `raptor-port/src/state/undo-wire.ts` `inputDayOf`); the day should be the one the box is on now — not built tonight, it changes which image the landing reads and wants its own test. (ii) The LATE chip tapped off on a Personal Inputs line that is out of view while the same input's programme row is in view: Undo brings it back and the screen does not move, so the change comes back unseen; the rule "any drawing in view keeps the screen" cannot tell which drawing shows what, and a list of what each drawing shows does not exist — not built. (iii) A real edit on a signed day hides the sign-off names without changing what is saved, so Undo brings them back and, when that line is out of view, nothing brings it on screen; a traffic change on a signed day lands nowhere either — not built: new logic. (iv) The refused-Undo fix (a refused step no longer scrolls the board) has unit tests only, no browser test. (v) `raptor-port/src/ui/histbubble.ts` has a stale comment: it says the area and area-time marks are never drawn on the board; the board draws them now. (vi) The reads' tidiness notes (D489), filed not fixed: the header comment of `boardland.ts` carries about 25 lines of history that belong in commit messages; `movedRowKeys`, `drawingsOf` and `land` each pack several jobs and would read better as a table, separate finders and one helper; `boardLandKeys`' return line is a nested conditional; `noteTop` reads the note's fade from an inline value and `toast.ts` could export a "note showing" helper; the new test helper's note columns play no part. (vii) A touch drag of a programme row and a touch seat-fill could not be driven on a phone in the test browser (the re-walk's two NOT RUN) — they wait for his iPhone look. (viii) A lesson for the walk-scripts guide, `raptor-port/docs/walk-scripts.md`: an "on top" check that asks the page what is at a point looks through a passing note that takes no presses, so it passed while the "Undid: …" note lay over a box; compare the two rects with every passing note as well — a working-guide change, so it needs his word and the usual read. (ix) The LAST box of the day's list (for example the remark of the last Unavailable row), changed and then undone from far away, rests under the passing "Undid: …" note for the two seconds the note shows, on a phone and (by about 3 px at its right edge) on a desktop, because the list cannot scroll past its end; the same place as before the W1 fix, so not a regression. The cure is a choice of look — room at the list's foot, or the note drawn elsewhere on the board — a drawing for him first (D1625). Pictures: `raptor-port/docs/img/handpass/2026-11-10-sched-board-small/rewalk/w1-f-phone-2-settled-undo.png`, `…/rewalk/w1-f-pc-2-settled-undo.png`. **To do:** (i), (iii), (iv), (v) and (vi) in a later small job on the board's Undo, tests first; (ii) only if a cheap list of what each drawing shows appears; (vii) his iPhone look; (viii) his word; (ix) a drawing for him. **Place:** Schedule and amendments, low — small, no wrong record.

### [BOARD-SIDEWAYS-SMALL-PHONE] The pinned bar on a smaller phone on its side is two rows (found 8 Nov 26 by chat 11's walk; a question for him)
D1780 pins the Scheduler Board's bar at the top on a phone on its side; on his iPhone (874 × 402) the bar is one row, 51px, and
with the keys up the list gets about 151px. Walker B (the sheet above, row B1 and §14 W-B2) found that at 844 × 390, a smaller
iPhone on its side, the bar's buttons wrap to two rows, 89px, and the list gets 101px. The buttons and their wrapping are
`main`'s (the change only pins the bar; before it the whole head stood fixed, so the list was smaller still) — the host's
reading from the code. A question kept for him (D994), not put until he says: should the sideways bar fit one row on smaller
phones too (fewer words on its buttons, or some behind the ⋯), drawn for him first (D1625)? Pictures:
`raptor-port/docs/img/handpass/2026-11-08-board-layout/walk/b/chromium-844x390/`.

### [LW-ZOOM-TEST-SLOW] A Leave War desktop browser test timed out twice in one GitHub run (found 3 Nov 26; low, the agent's)
On pull request 621 (`claude/week-swipe-pdf-print`, a branch that changes nothing in the Leave War), GitHub's run of commit
`62556cdde` failed one job, `geometry (lw-desktop 2/2)`: `e2e/leavewar.spec.ts` "a pinch (phone) or Ctrl+scroll (desktop) zooms the
whole grid down and back, within its limits" ran out of time at 31.8s and again on its retry at 32.0s. The run of the next commit,
`f5c1b0046`, passed it with everything else. D84: a Leave War desktop timeout gets one re-run, not an investigation — the next run
was that. **To do:** if it fails again, make it wait on what it needs, not on time (D87), and measure its length on GitHub's machines.
**Place:** low — watch.

### [VEILED-WINDOWS-BAR] The other veiled windows keep the bar covered; three things do not close on Escape (found 30 Oct 26 by [TRAFFIC-WIN-COVERS-UNDO]'s roll-call; older; low)
**His answers, 5 Nov 26 ("Go" — the mock-up page's questions 1 and 3): D1645** — the bar stays pressable over "Jump to a date", the day-details window and the document viewer (the input window and the question boxes keep it covered); **D1647** — on View-only Sched the Traffic window is the read-only list for everyone. Building the night of 5 Nov 26 on `claude/keyboard-windows-batch-5eff45`. **BUILT and LIVE 6 Nov 26 (pull request 636; checked on `main` 17 Nov 26 — `ui/barfree.ts`, its tests and `e2e/keys-windows.spec.ts`):** the bar stays pressable over "Jump to a date", the day-details window and the document viewer, and Traffic on View-only Sched is the read list. **Left:** on a PC an input's own window opens below the bar and the bar stays pressable, where D1645 says that window keeps the bar covered (seen 8 Nov 26 — `raptor-port/docs/handpass/2026-11-08-chat28-not-kept.md`, "The desktop input window does not cover the bar"): to check against D1645, then fix or put to him.
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

### [LW-BAL-TAB-NEXT] On Balances, Tab after a typed figure goes to the tab button, not the next box (found 17 Nov 26, the re-walk of the four Leave War items)
**What:** an admin types a figure into a Balances box (Piston's CCL, 7) and presses Tab: the figure is kept, but the focus
lands on the Balances tab button at the top rather than on the next box — seen on a desktop and a phone in Chromium
(`docs/img/handpass/2026-11-17-lw-four-items/r1/REPORT.md`, a lead outside its scenarios). The four items' branch only
wrapped each box with its pending tag (`KindBox`, not focusable); the box itself — typing, saving on leaving, its keys —
is word for word as on `main`, so it is most likely older. **Next:** reproduce on `main`; if it is there too, a small fix
(the next box keeps the focus after the save re-draws the row) or a question to him if the save's re-draw is meant to end
the typing. **Place:** with the next Balances change.

### [LW-FOUR-ITEMS-LEFTOVERS] What the four Leave War items left for him (pull request 801, merged 17 Nov 26, chat 106)
**What:** the job's evidence sheet (`raptor-port/docs/handpass/2026-11-17-lw-four-items.md`, "Candidates to put to him"
and "Departures from the drawings") named these, none changed unasked (D852, D1426). **Suggestions — the same
improvement elsewhere:** (1) the person window's tiles still show a pending figure with a minus ("Pending −1"), the
reading D2154 says confuses; (2) the OIL tracker's correction editor (a taken day's) is not given the steady layout;
(3) two periods in one month take the same name ("JAN 29") — the picker tells them apart only by place; (4) the grid's day
sheet has an award editor of its own that still moves its Save; (5) on a PC, under the mouse, a Manning pair row's DAYS
(Required / Available P and W) lose their olive / green to the plain row tint, while its name keeps it (as before the
branch) — the layering of find 22 would keep it; recommended. Put to him in chat 106 with pictures
(`docs/img/handpass/2026-11-17-lw-four-items/candidate-pair-days/`); his "all looks good, merge live" did not answer it,
so it stays open. **Departures to name:** (a) the phone row keeps 18px at its end so CL's tag is whole when slid to the
end; (b) "INCL. CARRIED FWD" wraps to three lines, as the drawing has it; (c) read-only figures (a member, or locked) get
the tag on their corner too. **Next:** each with a picture when he next looks at the Leave War. **Place:** the Leave War's
next batch.

### [MSQ-MIDNIGHT-CLOCK] What happens at a man's midnight swap, everywhere — and which clock decides "today" (filed 22 Nov 26, chat 132)
**What:** two questions he raised after his D2263 (22 Nov 26). (1) **Every window and page open at the swap.** The night's
walk covered the Leave War windows and the Tracker's editor (the band, D2243 Q7), the input window (the band's plain words,
B2 — recommended his sentence), the Inputs / SANS / Calendar settings (closed with a note, D2263), the Balances page (B16 —
recommended the band) and the OIL tracker (B15). Not walked at the swap: Admin → Users and Squadron config, Quals, Edit
Schedule's own windows (a day's editor, the publish sheet, a plan's menu), the bell held open, the Holidays panel. At the
Transfer step's design: list each (a roll-call, as the bug-check order's), give each one of three answers — hold with the
band where he typed something worth keeping, close with a note where it is settings, refresh where nothing is typed — and
put the list to him in one drawing. (2) **Which clock decides "today".** Today the app reads each device's own clock and
its own time zone (`raptor-port/src/state/units.ts` todayIso — `new Date()`, local date), so a man's swap happens at his
own phone's midnight, and a phone set wrong, or abroad on another zone, swaps at another moment. A Power Apps code app runs
in each person's browser: no clock ticks from the server; Dataverse stamps each saved row with its own server time
(created on / modified on), which a device cannot set. At the database step: decide whether "today" is the squadron's
place time zone (the app already holds one per place — D2196) read from a trusted time (the server's, taken at sign-in
and kept as an offset), and whether the save check judges by that time. The IT side's restrictions (no plug-ins, D1749)
mean a server-side check of the date may not be available — a question for them, said as such (D1551).
**Place:** (1) the Transfer step (batch 4 of `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`);
(2) the detachments batch's design (batch 2) — a detachment abroad meets it first: on 22 Nov 26 he asked what the app takes
when one man abroad keeps his phone on home time and another sets the local zone, both signed in at once — today each
device its own "today", so for the hours between the two midnights they see different days (whose squadron a moved man
is, which days are past, the input's filing date that decides LATE — `src/engine/inputs.ts` nowStamp, the device's date);
recommended to him: each squadron's or detachment's pages judge by that place's own time zone read from a trusted time —
and the database step for the trusted time itself — his D2264 (22 Nov 26): the server's time, read at sign-in, never each
device's clock. **Next:** the place time zone put to him with the detachments batch's design.

### [FABLE-READ-FAULTS] The faults Fable's reads of 21–22 Nov found outside the two-squadron work — fix now (his D2268, 22 Nov 26)
**What:** proved by failing tests on the night's copy (very probably live today), none fixed: **OIL F1** (MED — a man posted
out as SANS drops from the crowd of earlier days, so the next amendment of a published day before his posting takes his
OIL — fix first); **Inputs F1** (a document attached to, or taken off, an input of several people is never saved, the
window says "Input updated"); **Inputs F2** (an Other's "Goes to" thrown away when the same save answers the OIL
question); **Inputs F3 / F4** (the LATE mark: a man added late to a shared input under Unavailable cannot have his chip
dropped; an input changed after the cut-off reads on time for a man added earlier); **Leave War F1** (OIL leave on dates
no leave period covers not taken off his OIL); **OIL F2** (a weekend whose only work is an input with no OIL answer
publishes without a word, D81); **Leave War F2** (LOW, dormant — the war writes for an id naming nobody). Each with its
cause, fix and proof: `raptor-port/docs/superpowers/briefs/2026-11-21-msq-fable-never-read.md` §2–4 (the proofs on
D: under raptor-work, job3, and the copies' test files named there). **How (D2268, D2258):** its own branch from `main`;
Fable fixes OIL F1, Inputs F1 and F2 (OIL and saved data), Opus the rest; each a failing test first; the bug-check order's
sizing, walk and reads; his look and "merge live". **Place:** now — a session of its own.
**Status (22 Nov 26, chat 133, branch `claude/fable-read-faults-4104f0`, pull request 820):** all eight re-proved red on
`main` first. FIXED, red-first: OIL F1 (Fable), Inputs F1 and F2 (Fable), Inputs F3 and F4, Leave War F1; beside them the
input window's ✕ asks over a "Goes to" / "To" not saved, and the window follows "To" / "Goes to" changed behind it (Astra's
code read F1). Reads done: Astra and a fresh blind Opus reader (no fault in the fixes). OWED: the walk of the running app,
the evidence sheet's close (`raptor-port/docs/handpass/2026-11-22-fable-read-faults.md`, laid down), GitHub's run, his look.
LEFT: **OIL F2** — his choice made, D2294 (the open OIL list at the first sign-off press, before the name is recorded;
Later asks no more that day; the publish note names the input): to draw for him (D1625), then build; its proof runs as `it.fails`.
DRAWN 22 Nov 26 (chat 137), round 2 of the same link, waiting for his look: `raptor-port/docs/mock/2026-11-22-oil-unanswered-publish/`
`index.html` + `draw-f2.mjs` (round 1 kept as `round1.html`); his two questions there — the flow and its two new lines as
drawn, and ✕ on the list cancelling the sign-off (recommended); the lead line's claim checked in the code
(`engine/publish.ts currentBindNow` binds the OIL evidence, so an answer after signing drops the four).
**Leave War F2** — a guard was built and taken out: the war writes for ids on no roster list by design (a deleted man's
past days, D327) — "names nobody" needs defining first; proof kept as `it.fails`. **Found, not fixed:** (a) a man the
scheduler adds from the schedule to an input already LATE reads LATE (D741 reading 1) — older than this job; the fix needs
a mark of its own on his entry (Astra's read F2); (b) Fable's three SANS questions — should a hand SANS tick (on or off)
keep earlier published days' crowds, should a hand re-tick after a SANS posting keep the posting's date, should a man
NAMED on a published day before his SANS posting read pending; (c) under Unavailable one LATE tap drops every man's mark
of that input — as D1586 rules ("saved on the input"), comment corrected, no change; (d) seen while drawing OIL F2
(22 Nov 26, chat 137), not yet checked as a fault: on an UNPUBLISHED day, "+ Alt Plan", the input's row rejected there,
then "Switch to this plan" back to the first plan puts the row back on the Ground Programme while the input itself stays
rejected (`acc` 'r'), so no OIL list opens (`ui/oilputback.ts` reads `acc`); on a published day the switch re-files it;
(e) found by the walk of 22 Nov 26 (chat 138, walker w1, the host saw the picture
`raptor-port/docs/img/handpass/2026-11-22-fable-read-faults/w1/s1-08-al-published-desktop.png`): after a man is posted
out as SANS, the Scheduler Board's crew list shows him under "SANS avail", greyed, on a day BEFORE his posting date too
(Hex posted out 20 Jul, the board on Sat 18 Jul: WSOs 17 free became 16), while the ALL AVAIL window on that same day
still counts him as a regular — the crew list reads today's SANS tick, the crowd reads the posting's date (the OIL F1
fix, `leavewar/sync.ts sansSince`). His D283 makes him SANS "on the date"; whether the crew list of an earlier day
should follow goes with Fable's three SANS questions in (b), one answer for all four. Nothing saved is wrong: his OIL
for the earlier day stayed, the day read nothing pending; (f) **FIXED 22 Nov 26 (chat 139)** — reproduced by the host on
a fresh build with walker w2's route, fixed red-first (`ui/InputWindow.tsx`: the window follows its record wherever it
stands, the schedule's pop-up too; test `inpwin-unsaved-goes.test.tsx`), re-walked at both sizes; the root — on a PC the
top bar stays pressable over an input's own window, where D1645 says it is covered — stays filed under
[VEILED-WINDOWS-BAR] (a visible change, drawn for him first). What it was (walker w2, desktop only): with an input's own
window open on the Inputs page (opened from the List), the top bar's Undo of a change of where that input goes (Reject,
then → Unavail on the board; or Rejected → Ground) takes the app to Edit Schedule and turns the window into the
schedule's pop-up, and (1) its "Goes to" still shows the place the Undo just took back
(`…/w2/s3-17-*`, `s3-19-*`), and (2) a remark then typed and Saved is lost behind the note "That input is no longer
there — nothing was saved", though the input is still there (`…/w2/s3-18-*`). The old place is not put back. Whether it
is older than this job's "the window follows To / Goes to changed behind it" fix is not known. On a phone the top bar
is covered while the window is up, so the route does not exist there.
**Chat 140 (22 Nov 26, branch `claude/sans-from-date-139`, pull request 824):** D2313 and D2314 BUILT, each a failing test
first — (e) and (b) closed: SANS is a dated status, the person keeping the day it starts and each stretch that ended, and
every reader about a day asking by that day (`engine/people.ts sansOn`; tests `leavewar/sans-from-date.test.ts`); the
publish note's names (`leavewar/publishdoor.test.ts`). Chat 139's two checks: a man posted out as SANS who earns OIL on a
published Saturday after his posting, SANS off the Leave War — his credit shows on the OIL tracker, the Balances page lists
him for the period and his grid cell holds it (`leavewar/sans-postout-oil.test.ts`, green on the first run: nothing to fix);
the leave-charging rule's pilot check (`leavewar/engine/charge.ts isPilot`) reads the people the war shows — a man posted
out as SANS keeps his row and seat, so he is read rightly; an ordinary SANS pilot hidden from the war has no figure on any
screen while hidden, and the charge is worked out afresh on every read, never saved, so once "+ SANS" shows him he is
read as a pilot — not a fault, nothing filed. **Found, not fixed (chat 140):** (g) readers left on today's SANS tick, each
to be decided in the bug check's roll-call: the ALL AVAIL window's pucks, the Inputs calendar's opened day (its seat lists
and pucks), the SANS day's pucks, the SANS highlight chip, and the Leave War's Available rows, which leave a SANS man out
of the count on every date — a date before his SANS date then counts one fewer (`leavewar/engine/availrows.ts`); who may
FILE SANS availability stays on today's tick on purpose (a filing asks who he is now). OWED: the bug check (FULL) — its
sizing, walk, reads and sheet (`raptor-port/docs/handpass/2026-11-22-sans-from-date.md`, not yet laid down) — then his look.
**(g) as it stands after the roll-call and Astra's scenario design (22 Nov 26, the sheet's §3 and §6):** FIXED in this
job, each with a test that failed first — the ALL AVAIL window's pucks, the Medical page's "as of" cards, View-only Sched's
next-week preview of a published day (each man as that version kept him, D186) and a preview already drawn (it now
follows a tick). STILL OPEN, each on past dates only: the Inputs calendar's opened day (its seat lists and pucks,
`ui/InputsCal.tsx` 1247–1253, 1420), the SANS day's pucks and the SANS calendar's Highlight list for a man whose SANS has
ended (`ui/SansDay.tsx`, `ui/sanscal-model.ts sansRoster`), and the Leave War's Available rows
(`leavewar/engine/availrows.ts` NO_SANS; the roster the war is handed, `leavewar/state/raptorRoster.ts`, carries no SANS
dates) — after an UNTICK a past day he was SANS on counts him BOTH as a regular available and as committed SANS, so that
day's "still needed" reads one fewer; the bid warning, Approvals' LOWEST AVAIL and the red-day list follow the same
count. The fix Astra names: hand the count the stint-aware roster with his SANS dates and leave SANS men out by the date
counted, the grid's whole-row rule kept (D321, D1692). The SANS highlight chip stays on today's tick, for his word.
**(h) the pending list can credit a SANS change to the wrong person (Astra's scenario 12, read in the code, not walked):**
admin A ticks a man SANS on a day that makes a published day read "SANS: no → yes"; a later untick by admin B (which no
longer removes that difference — D2313) is then the newest SANS line, and the pending line's "who and when" names B
(`ui/pendlist.ts qualsLine` takes the newest SANS line whatever its direction). Words only. Fix: hand `qualsLine` the
value the day now reads and take the newest SANS line whose `to` is that value, any line as the fallback; a test through
the pending list of a published day.
**From the two blind code reads of 22 Nov 26 (Astra `raptor-port/docs/superpowers/briefs/2026-11-22-sans-from-date-read-astra.md`,
the fresh Opus reader `…-read-opus.md` — each report holds its failing test), found, not fixed:**
**(i) ALL AVAIL leaves out a man posted out as SANS who is planned with us (Astra #1; reproduced by its test, then the
test taken out of the suite — it is older than this job, the same lines stand on `main`):** with "+ SANS" off the war, a
man posted out as SANS and named on a day's programme is passed by the SANS check and then dropped as "posted out" by the
war's row (`leavewar/sync.ts availableFor`, the `inSquadron` read), so the crowd a day freezes, and its OIL, lack him;
with "+ SANS" on he counts (D27). Fix Astra names: read whether he is still ours from the saved posting, not from the
row the display switch shapes — from a SANS posting's date the posting is not a departure for a man engaged that day;
keep the post-in, archive, delete and clash checks. OIL: fix with a test first, before the whole-app check.
**(j) after a hand untick, the SANS days a posting made stay when the posting is undone or moved later (Opus #2):** a
question for him — a tick touched by hand has been the admin's own since it was built; should the posting's take-back
still take the days before that untick? Fix if yes: tag the stretch a posting made, drop it in the take-back.
**(k) the SANS day says "no longer SANS" of a man who is not SANS yet (Opus #3):** `ui/sanscal-model.ts sansDayGroups`;
new words ("not yet SANS") — drawn for him first (D1625).
**(l) a member's own-row command may write any SANS start or ended stretch (Opus #4):** the screen writes only today;
the commit gate (`state/perms.ts`, the own-row check) does not hold `sanFrom` / `sanWas` to today — for the security
review before the database step (D1411, `[DB-SECURITY-ROLES]`).
**(g) gains one more reader on today's tick (Astra #3):** the input window's "Several people" picker groups and draws a
dated input's people by today's tick (`ui/PeoplePick.tsx`) — with the Inputs calendar's opened day.

### [TURN-END-CHECK-SLOW] The turn-end backlog check is cancelled at its limit on most turns; the turn-end code check's wait; skill lessons no chat reads (found 24 Nov 26 by the settings health-check chat, his "Do both")

**Status:** filed, not fixed. Measured from the transcripts of the 50 most recently used chats (all touched 21–23 Nov 26,
their content back to 23 Sep; about 790 prompts). Nothing here was run to time it — a hook is run by hand only on his word.

**(a) The backlog guard is cancelled at its limit — the fault.** `.claude/hooks/backlog-guard.sh` (the Stop hook; its
limit, 20 seconds, is in `.claude/settings.json`) runs `raptor-port/scripts/docsize.mjs --inventory`. Recorded 547 times:
546 cancelled at its limit (about 20.7 seconds each), one cancelled otherwise, none recorded as a failure — a pass that
prints nothing is not recorded, so the passes are unseen. By day: 19 Nov 28, 20 Nov 7, 21 Nov 128, 22 Nov 266, 23 Nov 95,
none earlier in those chats; in the main folder (315) and four worktrees alike. **What it costs:** most turns end with a
wait of about 20 seconds, and a cancelled hook blocks nothing, so the turn-end warning of a lost or misfiled record
(D29, D30, D140) is not given; the Docs guard still runs the same check on every pull request and every push to `main`,
so nothing lost can merge unseen. **Cause found and fixed 24 Nov 26 (his "Yes"; live that day on his "merge live", pull request 828):**
timed at 36–38 seconds in a worktree and 55–57 in the main folder — the homes check and the structure check each asked
the disk about every listed file, and the tree grew from 37,373 files (15 Oct) to 80,632 (19 Nov) and 83,660. Now the
tree is listed once from git (`docsize.mjs treeNow`) and each git question asked once: 5 seconds, the same output as the
old check in five situations (as it stands, a tracked document gone, a lean copy, and the fresh reader's two). On a busy
PC it took up to 16, so the hook's limit is 60 seconds (`.claude/settings.json`). **Left:** (d) below; and an open chat's
own copy keeps the old, slow check until it brings `main` in.

**(d) Nothing says when a turn-end check is cancelled at its limit.** It was cancelled for five days before a count of
the transcripts found it. The tree grows by about 1,500 files a day, and what is left of the check's time is git
listing it. A guard for it — the hook timing itself and saying so past half its limit — is a change to a hook: his word.

**(b) The code check at a turn's end holds the turn** (`.claude/hooks/code-check-stop.mjs`, D1539, limit 200 seconds):
105 recorded runs, typically 43 seconds, 125 at the slow tenth, 162 at worst. It only reports a count and blocks
nothing; running it in the background, or skipping it when the changed files are those of its last run, would give the
wait back. His call — D1539 set where it runs.

**(c) For the next skill-notes review: the lessons written into the superpowers skills are read by no chat.** Six
reviews (23 Sep – 20 Nov 26; `.claude/skills/SUPERPOWERS-VENDORED.md`, changes 3 to 8) added lessons to 11 of the 14
skills. Opened through the Skill tool since install: nine never, `test-driven-development` once and
`systematic-debugging` twice, all in September. In the 50 chats: none opened, and of their files only
`brainstorming/mockups-on-the-real-app.md` was read, in 3 chats — the one file the project guide's map names. The
question for the review: move those lessons into the guides chats do read (the project guide's map, the bug-check
order, `raptor-port/docs/walk-scripts.md`), or make each skill open when its work starts.
