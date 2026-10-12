# `[ALL-AVAIL-AS-MEMBER]` steps 5 and 7 — a cancelled input's look, and the bell's notices: the check at this stop (12 Oct 26)

**What was built:** the plan's steps 5 and 7 (`docs/superpowers/plans/2026-10-11-one-rule-plan.md` §5, §4.5, §4.10;
what was built and found — its §10), after his answers on the pictures (D767–D770). Step 5: a cancelled input wears a
small red CX tag before its title, the title struck through and the reason after it in red, on the card and the
List's row; its bar is struck through and faded; the schedule's own line of it wears the tag and the struck name.
Step 7: someone else's change to an input a person is in is a notice on his bell — the list he approved, in the
shorter wording. Branch `claude/all-avail-as-member`; nothing merged; no pull request.

**This is a step of a batch, not the job's check** (D485). The one-rule job gets ONE full check now that its last
screen is built (the plan's §7 is its roll-call; Fable's twenty-one scenarios its walk's start; Fable reads the
finished code — D764). What follows is what was checked of these two steps by themselves, and, as plainly, what was
NOT.

## 1. The eight questions, and the tier

| # | Question | Step 5 — the cancelled look | Step 7 — the bell |
|---|---|---|---|
| 1 | OIL / what a man is owed | NO — it draws a mark step 4 already made count | NO — a notice changes nothing anyone is owed |
| 2 | The published record | **YES** — the To go out line of a cancelled input (the fault the older tests found) | NO — a publish, an amendment and a load tell nobody and remove nothing (pinned) |
| 3 | Saved data | NO | **YES** — a new saved record kind, a new settings row a person, the snapshot, the wipe list |
| 4 | A shared drawer | **YES** — the card (two screens), the List's row, the bar, the schedule's line (two builders) | **YES** — one bell in two bars, one list |
| 5 | A new gesture or mode | NO | **YES** — the bell's tap opens a list; a tap on a line; "Mark all read" |
| 6 | A new surface | NO | **YES** — the list |
| 7 | Roles | NO | **YES** — who may write a notice, who reads one, each person's own read record |
| 8 | The warning list | NO | NO |

**Tier: FULL**, by the facts — and FULL is what the job gets, once, next.

- **Done at this stop:** a failing test first for each step; every older test touching either step re-expressed by
  two helpers who did not write the build, each with a second scenario pass of its area (§3); a short LOOK at the
  running built app by real presses, a desktop and a phone, for each step (§2); the whole gate set (§4).
- **NOT done at this stop — the job's own check does it:** the roll-call of every surface (the plan's §7); the walk
  from Fable's twenty-one scenarios; the break tests; the member's and a guest's face on every screen; print and the
  PDF; a change arriving from a second device; Fable's read of the finished code; a ChatGPT read (his call at the
  merge — D761, D764).

## 2. The looks (the sizing step — D607)

1. **The type of change.** Step 5: D (a mark drawn in several places, each by its own code) and E (look). Step 7:
   B (a new surface), C (a new tap), G (a new saved record, Undo, a reload), H (who may write and read).
2. **What only a look could find.** Wrapping and what a strike or a fade runs onto; the tag inside a seven-column row
   on a phone; where a floating list lands when a full-screen board covers the bar it belongs to; a control that does
   not redraw. The words, the order and who is told are the tests'.
3. **What the ledger says.** Every one of ten walks of a mark drawn in several places found a fault; new surfaces
   nearly every time; layout four of ten.
4. **The look chosen:** the host alone, one scripted browser on the built bundle, short on purpose — the job's wide
   walk is next. Step 5 — `scripts/handpass/onerule-step5-look.mjs`: an input for two filed on the Inputs calendar,
   cancelled by the board's own CX button, then every surface; a second with no title and no reason; the first
   brought back. Step 7 — `scripts/handpass/onerule-step7-look.mjs`: Saber files, cancels, re-times; Ranger reads;
   Ranger files for Saber; Saber on the board. Nothing injected; no state set directly.
5. **Their rows** are in `docs/walk-ledger.md`.

| Surface | Desktop | Phone | What was seen |
|---|---|---|---|
| The opened day's card | seen | seen | the tag, the struck title, the red reason, the remark grey after it; 51px tall, as a plain card |
| The List's row | seen (table row) | seen (the card) | the same three on the title's line, the kind's pill under it; an untitled one on the pill's own line |
| The month's bar | seen | behind "+N more" on the full day (D768); seen on a quieter day | struck through, faded to 0.6, no tag; the tooltip says "Cancelled — WX" |
| Personal Inputs line, the week | seen | seen | "CX DUE WX" then the struck name; "· accepted" not struck |
| Personal Inputs line, the board | seen | seen | the tag on one line beside the name; "CX" alone on a phone; seven columns |
| The input's Ground Programme row | seen | seen | as step 4 left it |
| Brought back | seen | seen | card, row and bar read as any other |
| The bell, lit and dark | seen | seen | lit on an unread notice; dark after "Mark all read" |
| The list under the top bar's bell | seen | seen (a panel as wide as the screen) | 348px wide, 6px under the bell; a line 52px; nothing cut |
| The list under the board's bell | seen | seen | hung under the bell that was pressed; a press on the board closes it, the board stays |
| A tap on a line | seen | seen | the input's window; that line muted afterwards |
| "Nothing new" | seen | seen | |

**Found by the looks, fixed before each commit (five):** the three of step 5 and the two of step 7 named in the
plan's §10. **Pictures:** `docs/handpass/2026-10-12-one-rule-step5/` (42), `docs/handpass/2026-10-12-one-rule-step7/`
(14); the approved ones they were set beside: `docs/mock/2026-10-12-one-rule/`. No console error, page error or failed
request in either run at either size.

## 3. The older tests, re-expressed (the four-choice brief)

| Helper | Its area | Older files changed | Its own new cases | Product faults found |
|---|---|---|---|---|
| A | the bell's notices | 8 (and 9 read and left — the rule survives) | 45 — `src/ui/bellnotices-scenarios.test.tsx` | 6 |
| B | the cancelled look | 7 (and 12 read and left) | 60 — `src/ui/inputcx-scenarios.test.tsx` | 1 |

The seven faults, each fixed by the builder and pinned by the case that found it — the plan's §10, Steps 5 and 7:
the people left in a shared leave told nothing when one man was cut out of it; a posting's delete telling nobody on
its date and naming the admin when dated today; more than thirty notices leaving the bell lit for good; a notice
back by a Redo already "read"; a member's Undo of his own "Take me out" refused on the week on screen (left by step
2); the list open across a sign-out; and the To go out line of a cancelled input saying only "changed" (left by step
4). **Two of the seven were in earlier steps of this job and had passed their gates.**

## 4. The gates

The latest counts watched — 12 Oct 26 (the afternoon), `claude/all-avail-as-member` with steps 1 to 7 of the one-rule job (a cancelled input's look; the bell's notices; the seven faults the re-expressed older tests found, fixed — NOT `main`'s code), the whole gate set under the PC lock with nothing else running, in one run: unit 10723 / 10723 (606 files) · build clean · tfin 728 / 0 · e2e 769 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN. The unit count rose by 172 over the morning's (the two steps' own tests, and the two helpers' scenario files — 45 and 60 cases); the browser tests are the same 769 — no browser test presses the bell's list or reads a cancelled input's look yet (the job's walk drives both). A full run took about 19 minutes.

## 5. For him

**Readings to tell him** — the plan's §10: R27–R31 (step 5), R32–R37 (step 7). **Two small questions parked, nothing
waits on them** (`OUTSTANDING.md` `[CX-INPUT-WINDOW-ASK]`): should a cancelled input's own window say it is cancelled
(*recommended: yes*); should the CSV export (*recommended: leave it*). **Filed for the database step:**
`[NOTICE-RETENTION]` — notices are kept for good in this build.
