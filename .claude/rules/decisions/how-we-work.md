# Rulings — How we work (loaded in every session)

The general rulings: how his rulings are recorded, models and reviews, bug checks, merging and pushing, the
PC that runs the checks, the repo and privacy, the docs. Every session carries these. Each other area loads
by itself when a file in that area is read — the map, and how to add or retire a ruling: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/how-we-work.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Also read** — filed under OIL, but it governs every report: **D25** (OIL is earned leave, time off banked —
never pay or money).

| # | Date | The rule |
|---|---|---|
| D417 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS HOW THE LEAVE WAR'S MANNING IS SET UP AND CUSTOMISED — WHERE THE MANNING ROWS COME FROM, HOW AN ADMIN ADDS, CHANGES OR REMOVES ONE, AND WHAT THE GRID SHOWS AFTER — AS SCREENS, NOT THE COUNT'S ARITHMETIC. |
| D416 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS THE SCHEDULE'S TWO EDITING MODES AND WHEN TO USE EACH: THE SCHEDULER BOARD — ONE DAY, WITH THE MORE FUNCTIONS DEDICATED TO A DAY — AND EDIT SCHEDULE'S WEEK — THE BIG PICTURE, FOR SMALLER EDITS. |
| D415 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS WHAT HAPPENS BY ITSELF: FOR ONE ACTION (ONE INPUT FILED, AND THE OTHER ACTIONS THAT SPREAD THE SAME WAY), EVERY PLACE IN THE APP THAT CHANGES WITHOUT ANYONE TOUCHING IT, AND WHAT IT SHOWS THERE. |
| D414 | 29 Sep 26 | THE IT FLOW GUIDE COVERS THE TRACKER IN FULL: HOW A FLOW CHART IS MADE (EACH TOOL AND WHAT IT DOES, JOINING EVENTS, EDITING AN EVENT'S DETAILS), HOW A MEMBER UPDATES IT AND WHAT HE SEES, EVERY OTHER WAY TO UPDATE, WHAT IT REFUSES (AN NA CANNOT HAVE FAILS), MAKING STUDENTS AND COURSES, EXPORT AND IMPORT — AND WHAT ELSE THE AGENT FINDS. |
| D413 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS THE LEAVE WAR'S OWN WORK FLOW, IN HIS ORDER: THE ADMIN CREATES THE PERIOD → OPENS IT FOR BIDDING → MEMBERS BID → IT IS CLOSED FOR THE ADMIN'S DECISIONS → PUBLISHED → MEMBERS EDIT THEIR REMARKS; LATER CHANGES MAINLY BY THE MEMBER THROUGH INPUTS; THE ADMIN MAY STILL EDIT ON THE WAR DIRECTLY. |
| D412 | 29 Sep 26 | THE IT FLOW GUIDE GOES STEP BY STEP THROUGH HOW A SCHEDULE IS MADE, AND WHEREVER THE APP OFFERS MORE THAN ONE WAY TO DO A THING (A PUCK BROUGHT ONTO A SEAT, AND EVERY OTHER SUCH CASE THE AGENT FINDS — HIS EXAMPLES ARE NOT THE LIMIT) IT SHOWS EACH WAY. |
| D411 | 29 Sep 26 | THE IT FLOW GUIDE'S SAMPLE IS APPROVED AS DRAWN (FOUR PICTURES A SLIDE, THE STYLE KEPT); THE DECK ALSO COVERS THE ALTERNATE-PLAN FLOW (SAVED PLANS: MAKING ONE, SWITCHING, BRINGING ONE OUT) AND SHOWS THE WORK FLOW — HOW THE JOURNEYS FOLLOW ONE ANOTHER, FROM INPUTS FILED TO A DAY PUBLISHED AND AMENDED. |
| D410 | 29 Sep 26 | THE IT FLOW GUIDE IS A POWERPOINT DECK PLUS A PDF OF IT: A MAP SLIDE OF EVERY JOURNEY, THEN ONE SLIDE PER JOURNEY — REAL SCREENSHOTS, NUMBERED CLICK MARKS, ARROWS, A SHORT CAPTION PER STEP, AND A "WHAT TO TEST" BOX NAMING THE CHECKS AND THE AUTOMATED TEST; NO RULES-ENGINE DETAIL; A TWO-SLIDE SAMPLE TO HIM FIRST. |
| D354 | 29 Sep 26 | THE DATABASE STEP STARTS NOW (29 SEP 26), NOT ABOUT TWO MONTHS AWAY: THE IT TEAM IS TAKING THE APP INTO DATAVERSE NOW, AND HE MEANS TO KEEP WORKING ON THE APP BESIDE IT. |
| D353 | 28 Sep 26 | HOW MANY REVIEWERS: SCENARIO DESIGN AND SIDE QUESTIONS ONE (ASTRA FIRST); AN IMPORTANT PLAN'S RED TEAM BOTH; THE FINAL CODE READS ON RISKY WORK — MONEY / EARNED LEAVE, PERMISSIONS, THE PUBLISHED RECORD, SAVED DATA — BOTH; EVERYTHING ELSE ONE. |
| D351 | 28 Sep 26 | ADMIN → DATA → "CLEAR EDIT HISTORY…" STAYS AS IT IS UNTIL THE DATABASE STEP, WHERE THE ORGANISATION'S RETENTION RULE DECIDES HOW LONG THE CHANGE HISTORY IS KEPT. |
| D350 | 28 Sep 26 | IN THIS BUILD THE ONE UNDO DOES NOT TAKE BACK ADDING A PERSON (with or without his sign-in), ARCHIVE, RESTORE / RESTORE AS, DELETE, OR A POSTING (post out / post in and their sheet's undos). |
| D349 | 28 Sep 26 | THE UNDO-TOPBAR MOCK-UP IS APPROVED AS DRAWN: THE TRACKER'S OWN UNDO / REDO MOVE TO THE TOP BAR TOO, AND THE SCHEDULER BOARD'S BAR GETS SYNC AND THE BELL AND ONE EXIT, ✓ DONE (✕ CLOSE GOES), WITH SORT ALL AND THE LAYOUT SWITCH BEHIND ONE ⋯ ON A PHONE. |
| D348 | 28 Sep 26 | ON A PHONE THE TOP BAR'S BUTTONS RUN IN THE DESKTOP'S ORDER: UNDO · REDO (· THE CHANGES CLOCK ON EDIT SCHEDULE) · THE SYNC DOT · THE BELL — THE BELL AT THE FAR RIGHT. |
| D347 | 28 Sep 26 | EVERY UNDO / REDO PAIR SITS IN THE TOP BAR, IN THE SAME PLACE, ORDER AND LOOK AS EDIT SCHEDULE'S — ON THE DESKTOP AND ON THE PHONE; THE SCHEDULER BOARD KEEPS ITS OWN BAR (D349). — changed by D348 |
| D391 | 28 Sep 26 | THE PROJECT GUIDE'S SHORT FORMS (THE SLIM-DOWN'S GUIDE STEP) ARE DONE NOW, IN A FRESH CHAT ON THEIR OWN BRANCH, WITHOUT WAITING FOR THE SMALL-FIXES BRANCH TO MERGE — LEAVING UNTOUCHED THE ONE ROW OF THE GUIDE THAT BRANCH EDITS (THE LEAVE WAR ROW OF §WHERE THINGS LIVE). |
| D390 | 28 Sep 26 | Every ruling loads as one short line — its number, its date, the rule — with its full row kept whole beside it in .claude/decisions-full/, searched, never loaded; a chat opens the full row before acting on its detail or asking him; the project guide gets the same treatment, now (D391). — changed by D391 |
| D343 | 28 Sep 26 | NO PUBLIC GITHUB WEB ADDRESS — D341 IS WITHDRAWN THE SAME HOUR. |
| D324 | 27 Sep 26 | THE BACKLOG TIDY (`[BACKLOG-TIDY]`) IS DONE NOW, DOCS ONLY, ON ITS OWN BRANCH (`claude/backlog-tidy`, cut from `main`), AND MERGED BEFORE `[ONE-DOOR]` AND `[LW-MOVE-STANDARD]` |
| D302 | 27 Sep 26 | PARALLEL CHATS COORDINATE DIRECTLY, SO THEY DO NOT CLASH. |
| D228 | 26 Sep 26 | BOTH PARALLEL CHATS RUN, AND THE FULL CHECKS TAKE TURNS THROUGH ONE LOCK ON HIS PC. |
| D203 | 26 Sep 26 | The order to the database: [ACCOUNTS], then [POST-OUT-OUTCOMES] (D291), then the one changes window ([DRAFT-PENDING]), talking to the IT side; then the database-readiness batch with the OIL award fix; then the data model to Manfred and [DB-STEP] — the step now starts at once (D354), so the rest is due before the tables settle. Narrows D147 in part. — changed by D354, D291 |
| D201 | 26 Sep 26 | WHEN A NEW RULING OVERWRITES OR NARROWS AN OLDER ONE, FIX EVERYTHING THE OLD ONE LEFT BEHIND — IN THE SAME CHANGE THAT RECORDS IT. |
| D180 | 25 Sep 26 | [LEAVE-LATE-PUBLISHED] (D177–D179) is built next, on its own branch, BEFORE [ACCOUNTS], with its own full check, his look and "merge live" — amending D173's order in part. |
| D173 | 25 Sep 26 | The order after his look at PR #435: (1) D114's full check, his look, "merge live"; (2) accounts on a new branch; (3) the one changes window on top of accounts; (4) a full check of (2) and (3) — accounts later got its own (D210), and two steps were inserted (D175, D180). Replaces D115. — changed by D210, D180, D175 |
| D106 | 25 Sep 26 | The repo goes public for a short period, for GitHub's faster free machines: while it is public his PC's check runner stays stopped (never a self-hosted runner on a public repo); afterwards it goes private again and the runner restarts. Sets D89 aside for that period. |
| D90 | 24 Sep 26 | Where two of his rulings conflict, the later one wins: name the ruling followed and the one set aside; an undated rule loses to a dated one; fix what the old one left behind in the same change — the documents, the app, the lists (D201); where the newer one does not clearly cover the case, ask him. — changed by D201 |
| D162 | 24 Sep 26 | Add the background-command guard ([BG-CWD-GUARD]): a hook refuses a backgrounded npm command that does not move into raptor-port — his go for this standing configuration. |
| D148 | 24 Sep 26 | Undo reverses only the signed-in person's own changes (the list clears at sign-out); it never undoes another person's change, and if someone has since changed the same thing it refuses and says who. |
| D147 | 24 Sep 26 | The order after the amendment re-test: (1) the absence record with [S4-HUNT-REST]; (2) change-recording; (3) the Leave War links last, with the 7 Sep phone check; (4) [OIL-AWARD-IS-A-GRANT] (with [OIL-EARNED-VS-GRANTED]) before [DB-STEP], timed with the readiness batch (D203), and the small OIL follow-ups as one batch. — changed by D203 |
| D145 | 24 Sep 26 | THE SESSION-HANDOFF SKILL CHANGE IS APPROVED. |
| D144 | 24 Sep 26 | FIX THE ARCHITECTURE FIRST, THEN THE INDIVIDUAL BUGS. |
| D143 | 24 Sep 26 | "DONE" AFTER "MERGE LIVE" MEANS LIVE ON VERCEL. |
| D141 | 24 Sep 26 | No line targets: the test is whether each piece of information is needed where it sits, organised and written clearly; a size ceiling is a tripwire — move what does not belong, or raise it with its reason — never a number to cut to; for a loaded rulings file it counts bytes, not lines. — changed by D390 |
| D140 | 24 Sep 26 | The whole repo reads by relevance and keeps itself tidy: a small general layer every chat reads; each area's context loads by itself; every new fact has one home; what is finished leaves for an archive; the gate enforces it with tripwires, never targets (D141); the rulings' full text is a searched tier (D390). — changed by D390, D141 |
| D138 | 24 Sep 26 | A SUMMARY MUST NEVER CHANGE WHAT THE ORIGINAL MEANT. |
| D137 | 24 Sep 26 | THE RULINGS ARE READ BY RELEVANCE, NOT ALL AT ONCE — AND THE STRUCTURE KEEPS ITSELF. |
| D136 | 24 Sep 26 | The rulings list is never shrunk by moving a live ruling out: every live ruling stays in the list chats read — one file per area, loaded by relevance (D137), each ruling as one short line with its full row beside it (D390); only replaced rulings and spent permissions leave, for DECISIONS-ARCHIVE.md. — changed by D390, D137 |
| D135 | 24 Sep 26 | THE PRESENTATION / DEMO-VIDEO WORK (D154) IS FINISHED — THE PC IS NO LONGER SHARED WITH IT. |
| D151 | 23 Sep 26 | NEVER PUSH TO A BRANCH WHILE ITS PULL REQUEST'S CHECKS ARE RUNNING. |
| D89 | 23 Sep 26 | The repo stays private and GitHub's checks run on his PC (a self-hosted runner he registers himself; reverses D88) — set aside for a short period by D106: public for GitHub's faster machines, his runner stopped, private again afterwards. — changed by D106 |
| D87 | 23 Sep 26 | A BROWSER TEST THAT FAILS ON A SLOW MACHINE IS FIXED BY MAKING IT WAIT ON WHAT IT NEEDS, NOT ON A FIXED TIME. |
| D86 | 23 Sep 26 | [HUMAN-RETEST] runs two chats in parallel — the Tracker and the amendment system — on three conditions: separate ports (4173 / 4180), never two full gate runs at once (now one lock every chat takes, D228), separate ruling-number ranges. — changed by D228 |
| D85 | 23 Sep 26 | [HUMAN-RETEST] started with the Tracker (his call over the agent's amendment-first recommendation); the amendment system then ran beside it, in parallel (D86). — changed by D86 |
| D84 | 23 Sep 26 | A LEAVE WAR DESKTOP E2E TIMEOUT ON GITHUB GETS ONE RE-RUN OF THE FAILED GROUP, NOT AN INVESTIGATION. |
| D78 | 23 Sep 26 | PARALLEL CHATS MERGE ONE AT A TIME, AND THE LATER ONE ADAPTS. |
| D73 | 23 Sep 26 | No guide yet for bringing a whole separate app in as a new tab — write it only if a third app is brought in; notes #120 and #122 stay open for that job. |
| D72 | 23 Sep 26 | THE BUG-TESTING LIST IS RETIRED. |
| D70 | 23 Sep 26 | CHANGES TO THE WORKING GUIDES (the skills) ARE READ BY BOTH FABLE AND ASTRA BEFORE HE APPROVES THEM — ONE ROUND EACH, NEVER BY THE MODEL THAT WROTE THEM. |
| D69 | 23 Sep 26 | Write the state into the repo as you go (D68); when the work closes, condense what it wrote in its own docs-only commit, never inside a fix — a saved context is a summary (decisions, state, next step), never the conversation. |
| D68 | 23 Sep 26 | CORRECTNESS BEATS CONTEXT ECONOMY: NEVER SKIP OR SHRINK A READ TO SAVE CONTEXT. |
| D67 | 23 Sep 26 | ADOPTED: OPUS 5.5 PLANS AND BUILDS; FABLE 5.1 AND ASTRA REVIEW. — changed by D353 |
| D63 | 23 Sep 26 | The country-specific aircraft type goes: where a sentence describes the squadron or him it reads "fighter squadron"; where it names the aircraft or its documents, the bare "F-15" — the Tracker's event-box hint too (D64); its syllabus data is left (D62). — changed by D64 |
| D62 | 23 Sep 26 | THE TRACKER'S SYLLABUS DATA IS OUT OF SCOPE FOR EVERY PRIVACY OR "WHAT CAN A STRANGER READ" SWEEP. LEAVE IT; DO NOT FLAG IT AGAIN. |
| D60 | 23 Sep 26 | PUSHING A BRANCH NEEDS NO PERMISSION; `main` ALWAYS DOES. |
| D59 | 23 Sep 26 | The repo went private on 23 Sep 26 (done by him): GitHub Pages is gone, the publish job is off, the app is viewed on Vercel — made public again for a short period by D106, private again afterwards. — changed by D106 |
| D58 | 23 Sep 26 | THE BARE NUMBER STAYS; THE SQUADRON ABBREVIATION AND THE SERVICE ABBREVIATION GO, EVERYWHERE. |
| D57 | 23 Sep 26 | The commander briefing deck (RAPTOR-Command-Brief.pptx, in the history) is his and stays — not a concern; never propose wiping it. |
| D56 | 23 Sep 26 | A problem that lives only in data already stored is not a finding — no reviewer, walk step or fix — but only when the code is already correct going forward (both must be true); say so in every reviewer's brief. |
| D54 | 23 Sep 26 | An issued weekend carrying a placeholder on a duty desk, sim seat or extras line raises the pending mark once [OIL-SEATS-CAN-EARN] ships — leave it (he republishes it once); the demo data is wiped before the database, so harm that lives only in stored demo data and is prevented going forward is not worth building around. |
| D53 | 22 Sep 26 | Before telling him anything is undecided, putting a choice to him, or calling something missing: search every rulings file (short lines and full text), DECISIONS-ARCHIVE.md and OUTSTANDING.md first — a code comment is never evidence that something is unruled. — changed by D137 |
| D30 | 22 Sep 26 | Fable's order is the plan of record for [DOCS-GUARD]: (1) F1 + F3, (2) F2 + F6, (3) F4 items 1/3/4 and F5 items 1–2, (4) F5's archive mover and F7 when due — do not re-decide the scope or the sequence. |
| D29 | 22 Sep 26 | Three standing rules for the backlog: finished work leaves OUTSTANDING.md for its archive, only by the script; a ruling never lives only in the backlog — it gets a D-number in its area's rulings file and a real home; never trim documents in the same change as a fix. — changed by D137 |
| D23 | 22 Sep 26 | A REVIEWER'S OPEN FINDINGS OUTRANK THE PLANNED JOB LIST. |
| D22 | 22 Sep 26 | Clearing the demo data is APPROVED whenever it is the simpler path |
| D17 | 21 Sep 26 | For a long hand pass, drive the app with a SCRIPTED real browser from the start |
| D16 | 21 Sep 26 | A long hand-test pass is FANNED OUT across parallel Opus agents, not walked serially. |
| D14 | 21 Sep 26 | Records state the decision, not the transcript: quote him only where the exact words matter; otherwise one line, the date and a pointer — and a condensed record never changes what the original meant (D138). — changed by D141, D138 |
| D13 | 21 Sep 26 | Record a ruling the moment it is made, before doing the work it implies — a hook on every message and a Rulings: line in every report enforce it. — changed by D137 |
| D12 | 21 Sep 26 | The bug-check order adapts to any kind of work (interface, rules, cross-platform…), not only the OIL feature. |
| D11 | 21 Sep 26 | Claudex owns the plan and the code read; the bug-check order owns the running app — the walk goes before Claudex's final inspection, and money work needs both providers. |
| D10 | 21 Sep 26 | The bug-check order supersedes the 16 Sep scenario rule, the 20 Sep rules sweep and the 21 Sep test-like-a-human rule — one method, not four. |
| D9 | 21 Sep 26 | The bug-check order fires itself: the agent states the tier and the checks; he never has to pick them. |
| D8 | 21 Sep 26 | The bug-check order is the merged result of Fable's and Codex's independent proposals. |
| D7 | 21 Sep 26 | Run all three kinds of check — code read, automated tests, a hand pass — scaled by what the change touches. |
| D6 | 21 Sep 26 | The other providers design the test scenarios; Opus executes them in the running app. |
| D5 | 21 Sep 26 | Driving the running app IS the bug test; a code review plus green tests is not one. |
| D4 | 21 Sep 26 | Every earlier feature checked the review-plus-tests way is likely carrying the same class of defect — sweep them ([HUMAN-RETEST]) after OIL closes. |
