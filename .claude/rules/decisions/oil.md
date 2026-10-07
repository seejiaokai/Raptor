---
paths:
  - raptor-port/src/**/*oil*
  - raptor-port/src/**/*Oil*
  - raptor-port/src/leavewar/**
  - raptor-port/src/**/*avail*
  - raptor-port/src/**/*Avail*
  - raptor-port/src/**/*publish*
  - raptor-port/src/**/*Publish*
  - raptor-port/e2e/*leavewar*
  - raptor-port/src/ui/board-html.ts
  - raptor-port/src/ui/interactions.ts
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/leavewar/**
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*oil*
  - raptor-port/docs/**/*oil*/**
  - raptor-port/docs/handpass/parts/blocks-*
  - raptor-port/docs/**/*allavail*
  - raptor-port/docs/**/*one-absence*
  - raptor-port/scripts/handpass/**
  - raptor-port/docs/archive/HANDOFF-OIL-WALK.md
---

# Rulings — OIL (off in lieu: earned leave)

**Loads by itself** whenever a session reads an OIL, Leave War, placeholder-puck or publishing file (the
`paths:` at the top of this file). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/oil.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Also read** — in `scheduler.md`: **D660** (whoever files an input for other people answers its OIL question for all of them at the save; each man may still change his own), **D360** (an ALL AVAIL on a row with a start and no end counts over the one-hour default, earns nobody OIL, and tells the admin "no OIL worked out — this row has no end time"). In `leave-war.md`: **D265** (a bid that shares its day with an OIL award moves alone; the award stays where it is, D260). In `scheduler.md` (it loads by itself with any board or engine file): **D272** (in OIL Earn mode his own puck shows the green OIL ring, not the purple one); **D27, D33, D47** (where
the ALL / ALL AVAIL pucks may land and where they are refused), **D36–D41, D51** (who counts as available,
and the window that lists them), **D44, D45** (the crowd frozen at publication; the pending mark). In How we
work, already loaded: **D54** (an issued weekend carrying a placeholder raises the mark — leave it) and **D56**. In `people-accounts.md`:
**D327** (an archived man stays in the ALL AVAIL crowd on every day before his archive).
**Also know** — `[OIL-AUTO-REMOVE]` (the OIL Earn mode; merged 22 Sep 26, D34 — spent, in `DECISIONS-ARCHIVE.md`) went live with his five-minute look WAIVED: its evidence is the walk (`raptor-port/docs/handpass/2026-09-22-oil-walk.md` — the defects it found are fixed red-first; do not re-do them) and the gates, never an owner sighting, so never assume he eyeballed the walked Saturday. Its design of record, with the rulings not to relitigate (§8/§9): `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`. The item itself: `OUTSTANDING-ARCHIVE.md` (moved 27 Sep 26, `[BACKLOG-TIDY]`).

| # | Date | The rule |
|---|---|---|
| D606 | 7 Oct 26 | AN SC SHIFT'S TYPED B (ITS IN-TIME), WHERE FILLED, COUNTS AS WORK: THE SHIFT'S OIL IS WORKED OUT FROM THAT IN-TIME TO THE SHIFT'S END, AND ITS WORK HOURS COUNT FROM IT TOO; A BLANK B LEAVES THE SHIFT ITS WRITTEN START TO END. |
| D592 | 5 Oct 26 | D591'S DETAILS: OIL USES THE EARLIEST IN-TIME / RALLY THAT APPLIES TO THE FORMATION, THE NOMINAL TIME WHERE NONE IS TYPED; AN EVENING-BEFORE REPORT LENGTHENS THE LINE'S OWN DAY ONLY; A PUBLISHED DAY KEEPS ITS OIL UNTIL PUBLISHED AGAIN — A LATER TIME OR LOGIC CHANGE READS AS PENDING; THE DAY COUNTS FIRST EVENT TO LAST END, BREAKS INCLUDED. |
| D591 | 5 Oct 26 | A FLYING LINE'S EARNED LEAVE (OIL) IS WORKED OUT FROM ITS EARLIEST APPLICABLE ENTERED IN-TIME / RALLY — THE NOMINAL REPORT TIME ONLY WHERE NONE IS ENTERED (DETAILS: D592). |
| D470 | 1 Oct 26 | A MAN THE SCHEDULER PUTS IN THE NAME BOX OF ANOTHER MAN'S REQUEST ROW EARNS OIL FROM IT, AS A MAN ADDED UNDER THE ROW DOES (D18); THE MEMBER WHO FILED IT STILL EARNS ON HIS OWN ANSWER, AND EITHER CAN BE TAPPED OFF IN OIL EARN. |
| D402 | 29 Sep 26 | EVERY OIL AWARD GIVEN BY HAND SHOWS ON THE LEAVE WAR GRID ON ITS DATE, WHEREVER IT WAS GIVEN — TYPED ON THE GRID OR CREDITED FROM THE OIL TRACKER — AS AN FO OR HO BOX; A TAP SAYS WHO GAVE IT AND WHY. |
| D401 | 29 Sep 26 | THE OIL AWARD FIX CONVERTS NO STORED AWARD: WHAT IS SAVED TODAY IS DEMO DATA, WIPED BEFORE THE DATABASE (D54, D56), SO ONLY THE DEMO SEED IS REWRITTEN IN THE NEW ONE KIND OF AWARD — AND A RECORD IN THE OLD SHAPE MUST STILL NOT BREAK A LOAD. |
| D400 | 29 Sep 26 | OIL'S "EARNED" COUNTS ONLY WHAT THE APP CREDITED ITSELF — THE PUBLISHED SCHEDULE OR AN ACCEPTED DUTY INPUT — AND EVERY OIL AN ADMIN GIVES BY HAND, TYPED ON THE WAR GRID OR CREDITED FROM THE TRACKER, IS SHOWN APART AS "AWARDED". |
| D261 | 27 Sep 26 | A MEMBER OPENS HIS OWN OIL AWARD, READ ONLY, AT EVERY STAGE |
| D260 | 27 Sep 26 | A DRAGGED BLOCK'S DELETE REMOVES EVERYTHING IN IT, OIL AWARDS INCLUDED — AND ITS CONFIRM NAMES EACH AWARD FIRST |
| D163 | 24 Sep 26 | Leave both — demo data only, wiped before the database (D54, D56): [DEMO-AWARD-DATES-ASK] and [POSTOUT-LOST] are closed. |
| D142 | 24 Sep 26 | A DAY’S OIL COMES FROM ITS LATEST PUBLISHED VERSION — THE LATEST AMENDMENT, OR THE EOD IF THAT IS THE LATEST — HOWEVER LONG AGO THE DAY WAS. NO LOCK, NO CLOCK. |
| D82 | 23 Sep 26 | AN OIL AWARD AND A WORKED DAY ADD UP. |
| D81 | 23 Sep 26 | A WORKED WEEKEND THAT EARNS NOBODY ANY OIL SAYS SO |
| D80 | 23 Sep 26 | AN OIL AWARD DOES NOT FLAG A LEAVE DAY |
| D79 | 23 Sep 26 | OIL MAY BE CREDITED BY HAND ON ANY DAY. |
| D52 | 22 Sep 26 | Three OIL behaviours are correct as built and not in conflict: a ground crewman NAMED on a weekend duty earns; a placeholder on it earns for the men it stands for unless switched off; ALL / ALL AVAIL do not include ground crew — nothing to build. |
| D49 | 22 Sep 26 | A FLYING LINE WHOSE WRITTEN TAKE-OFF AND LANDING ARE THE SAME STILL EARNS. |
| D48 | 22 Sep 26 | AN ISSUED DAY KEEPS THE MONEY IT WENT OUT WITH WHEN A RULE CHANGES UNDER IT. |
| D46 | 22 Sep 26 | THE PLACEHOLDER IS ALLOWED ON AN ACCEPTED REQUEST ROW AND CREDITS BY DEFAULT. NO EXCEPTION TO D43 ANYWHERE. |
| D43 | 22 Sep 26 | THE PLACEHOLDER PUCKS BEHAVE EXACTLY LIKE NAMED PEOPLE: ON BY DEFAULT, EVERYWHERE THEY CAN LAND. |
| D42 | 22 Sep 26 | AN OVERNIGHT LINE EARNS ON THE DAY IT SITS ON, AND THE HOURS SPILLING PAST MIDNIGHT EARN THE NEXT DAY NOTHING. |
| D35 | 22 Sep 26 | Re-confirms D24 and makes its template half explicit: the four exempt kinds offer the OIL switch (off by default), and so does a duty block minted from an AVALON template — the same seat, one answer. |
| D32 | 22 Sep 26 | One list, not two: wherever a placeholder puck is allowed to land, it also offers the OIL switch — landing and earning are one decision; on by default there, like named people (D43). — changed by D43 |
| D31 | 22 Sep 26 | A SEAT WITH NOTHING TO MEASURE OFFERS NO OIL SWITCH — IT SAYS WHY INSTEAD. |
| D28 | 22 Sep 26 | One principle instead of an allow-list: every seat can earn, its default decides whether it does, and the admin can always override; the placeholder pucks default on wherever they land (D43); a seat with nothing to measure offers no switch and says why (D31). — changed by D43, D31 |
| D26 | 22 Sep 26 | Leave the OIL mode's phone tap targets as they are — he settles OIL on his phone easily; do not re-open it or re-file it as a defect; nothing to build. |
| D25 | 22 Sep 26 | OIL IS EARNED LEAVE, NOT PAY — say it that way. |
| D24 | 22 Sep 26 | The exempt kinds — SC SPARE, AVALON flying lines and duty desks, BB flying lines — become creditable: they offer the OIL switch in the mode, defaulting off, so an activated one can be credited (on a published day through an ordinary amendment). Supersedes D15 and D20 in part. |
| D21 | 22 Sep 26 | AN "OFF DAY" DOES NOT EARN OIL. Settled; do not reopen. |
| D20 | 22 Sep 26 | AVALON flying lines, AVALON duty desks and BB flying lines — and a duty block made from an AVALON template — earn no OIL by default; they offer the switch, so an activated one can be credited (D24). — changed by D24 |
| D19 | 22 Sep 26 | A weekend or holiday that no Leave War period covers must NAME the reason and offer the way out, not just refuse. |
| D18 | 21 Sep 26 | All five hand-pass findings accepted as real, and finding 2 settled his way: a second man the scheduler puts on a member's landed request row EARNS from it, the same as the man who filed it. |
| D15 | 21 Sep 26 | The feature's acceptance criteria, in his words: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks and ground rows earn; SC SPARE, AVALON/BB lines and desks and ⓘ rows do not by default — SC SPARE, AVALON and BB offer the switch (D24). — changed by D24 |
| D3 | 21 Sep 26 | The two OIL bugs found beside R-1 (D2) are fixed on that branch, not filed — they share its root cause. |
| D2 | 21 Sep 26 | Only the issued (published) schedule earns OIL, both directions: a holiday declared after publication waits for a republication and the day says so; revoking one no longer removes OIL silently. |
| D1 | 21 Sep 26 | The green OIL bar shows only on the events that COUNTED towards a man's day, not on every puck he wears (supersedes §2.10 / OIL21); the ALL AVAIL count chip agrees with it. |
