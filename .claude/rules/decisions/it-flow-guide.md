---
paths:
  - raptor-port/docs/it-flow-guide/**
  - raptor-port/scripts/itflow/**
  - raptor-port/docs/**/*it-flow*
  - raptor-port/docs/**/*itflow*
---

# Rulings — The IT flow guide

**Loads by itself** whenever a session reads a file of the IT flow guide — the deck's folder
(`raptor-port/docs/it-flow-guide/`), the scripts that shoot and build it (`raptor-port/scripts/itflow/`), its plans and
briefs (the `paths:` at the top of this file) — **and open it yourself before PLANNING any work on the guide**, before
one of those files is open (`.claude/rules/doc-structure.md`). Its rulings moved here from How we work on 2 Oct 26
(`[DOCS-SIZE-PASS]`): they say what the deck shows and when it is rebuilt, which only a chat working on the guide needs
(D137, D141). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of
every ruling and how to add or retire one: `DECISIONS.md`.

**One line per ruling — its number, its date, the rule as it stands** (D390). **Its full row** — his words, the
readings he was told, where it lives — is in `.claude/decisions-full/it-flow-guide.md`, never loaded by itself:
**open it before acting on a ruling's detail or asking him about it** — `grep -h '^| D410 |' .claude/decisions-full/*.md`
(the shell; the Grep tool hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.

| # | Date | The rule |
|---|---|---|
| D403 | 29 Sep 26 | THE IT FLOW GUIDE IS RE-SHOT AND REBUILT ONLY WHEN HE SAYS SO — NOT AFTER EACH APP CHANGE, AND NOT ON A SCHEDULE. |
| D417 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS HOW THE LEAVE WAR'S MANNING IS SET UP AND CUSTOMISED — WHERE THE MANNING ROWS COME FROM, HOW AN ADMIN ADDS, CHANGES OR REMOVES ONE, AND WHAT THE GRID SHOWS AFTER — AS SCREENS, NOT THE COUNT'S ARITHMETIC. |
| D416 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS THE SCHEDULE'S TWO EDITING MODES AND WHEN TO USE EACH: THE SCHEDULER BOARD — ONE DAY, WITH THE MORE FUNCTIONS DEDICATED TO A DAY — AND EDIT SCHEDULE'S WEEK — THE BIG PICTURE, FOR SMALLER EDITS. |
| D415 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS WHAT HAPPENS BY ITSELF: FOR ONE ACTION (ONE INPUT FILED, AND THE OTHER ACTIONS THAT SPREAD THE SAME WAY), EVERY PLACE IN THE APP THAT CHANGES WITHOUT ANYONE TOUCHING IT, AND WHAT IT SHOWS THERE. |
| D414 | 29 Sep 26 | THE IT FLOW GUIDE COVERS THE TRACKER IN FULL: HOW A FLOW CHART IS MADE (EACH TOOL AND WHAT IT DOES, JOINING EVENTS, EDITING AN EVENT'S DETAILS), HOW A MEMBER UPDATES IT AND WHAT HE SEES, EVERY OTHER WAY TO UPDATE, WHAT IT REFUSES (AN NA CANNOT HAVE FAILS), MAKING STUDENTS AND COURSES, EXPORT AND IMPORT — AND WHAT ELSE THE AGENT FINDS. |
| D413 | 29 Sep 26 | THE IT FLOW GUIDE SHOWS THE LEAVE WAR'S OWN WORK FLOW, IN HIS ORDER: THE ADMIN CREATES THE PERIOD → OPENS IT FOR BIDDING → MEMBERS BID → IT IS CLOSED FOR THE ADMIN'S DECISIONS → PUBLISHED → MEMBERS EDIT THEIR REMARKS; LATER CHANGES MAINLY BY THE MEMBER THROUGH INPUTS; THE ADMIN MAY STILL EDIT ON THE WAR DIRECTLY. |
| D412 | 29 Sep 26 | THE IT FLOW GUIDE GOES STEP BY STEP THROUGH HOW A SCHEDULE IS MADE, AND WHEREVER THE APP OFFERS MORE THAN ONE WAY TO DO A THING (A PUCK BROUGHT ONTO A SEAT, AND EVERY OTHER SUCH CASE THE AGENT FINDS — HIS EXAMPLES ARE NOT THE LIMIT) IT SHOWS EACH WAY. |
| D411 | 29 Sep 26 | THE IT FLOW GUIDE'S SAMPLE IS APPROVED AS DRAWN (FOUR PICTURES A SLIDE, THE STYLE KEPT); THE DECK ALSO COVERS THE ALTERNATE-PLAN FLOW (SAVED PLANS: MAKING ONE, SWITCHING, BRINGING ONE OUT) AND SHOWS THE WORK FLOW — HOW THE JOURNEYS FOLLOW ONE ANOTHER, FROM INPUTS FILED TO A DAY PUBLISHED AND AMENDED. |
| D410 | 29 Sep 26 | THE IT FLOW GUIDE IS A POWERPOINT DECK PLUS A PDF OF IT: A MAP SLIDE OF EVERY JOURNEY, THEN ONE SLIDE PER JOURNEY — REAL SCREENSHOTS, NUMBERED CLICK MARKS, ARROWS, A SHORT CAPTION PER STEP, AND A "WHAT TO TEST" BOX NAMING THE CHECKS AND THE AUTOMATED TEST; NO RULES-ENGINE DETAIL; A TWO-SLIDE SAMPLE TO HIM FIRST. |
