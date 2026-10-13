# The Inputs / schedule batch (D793 and three small things) — the bug check (FULL)

**Where it stands (13 Oct 26):** four changes built, tests first; walked by one helper — 34 checks, no fault, one older
overlap seen in passing and fixed (§7); its finished code read by a fresh, blind Opus reader AND by Fable, blind to each
other (D790 — it touches the OIL question): eight claims, none false, every one a failing test first, all fixed (§10);
the fixes read again, narrowly, by a second fresh Opus reader (§10.3); 24 unit breaks, every one caught (§9); the whole
gate set (§12). **Left: his look (the card, §13), one question parked for him (§13), and his "merge live".**

`Walk: docs/handpass/2026-10-13-inputs-batch.md · 55 pictures · 4 surfaces (the Accept on the board's card and on the week's line; the question's sheet; the bar) + the gold dot's 2 (board, week) · 20 scenarios walked at a desktop and a phone (38 checks) · MISSING: none open — 0 faults found by the walk, 1 older overlap fixed, 8 claims of the reads fixed`

Branch `claude/inputs-schedule-batch`, cut from `main`. Ruling D793 (`grep -h '^| D793 |' .claude/decisions-full/*.md`).

## 0. What is in the batch — and what is NOT

| # | The change | Its backlog item |
|---|---|---|
| 1 | **An input put back on the programme by a scheduler's "Accept" waits on its OIL question, as a swap does** (owner D793 — "Yes it should wait on it"): the question first; the put-back and the answer one step; not answered → not put back, and the bar says so | `[OIL-ACCEPT-BACK-UNASKED]` |
| 2 | History's gold dot, and its bubble, on the puck of a man put on an input's row of the Ground Programme — added, or put in place of its only person | `[HIST-DOT-INPUT-ROW]` |
| 3 | The unused `mates` field and its three readers leave the published day's "to go out" list — nothing on screen changes | `[ONE-RULE-LEFTOVERS]` part 2 |
| 4 | A stray 350ms timer of the Inputs calendar's drag (and its twin in the puck drag) that reached for a page already gone in a test run — one of GitHub's check runs went red with every test passed | found the same night (the run on step one's branch) |

**NOT done of the batch his list named, still on the backlog:** `[DISCARD-FILING-NOOP]` (to be compared with the live
app first), `[ONE-RULE-LEFTOVERS]` parts 1 and 3 (the behaviour register's ids; four stale comments),
`[OIL-NOTIFY-SEEN]` (five small older things). The night's time went to checking the four above properly.

## 1. The eight questions — tier FULL

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | OIL (earned leave — D25) | **YES** | change 1 decides when an OIL answer is asked for and written |
| 2 | The published record | **YES** | a put-back on a published day is a change waiting to go out (D103); change 3 edits the "to go out" list's code |
| 3 | Saved data | NO | nothing new is stored: the answer and the filing are the fields they were |
| 4 | A shared drawer | YES | the gold dot is painted on the board and the edit week by one pass; the Accept is drawn on both |
| 5 | A new gesture or mode | YES | an existing button gains a waiting question |
| 6 | A new surface | NO | the sheet and the bar are D783's own |
| 7 | Roles | NO | the Accept was and is a scheduler's (a member sees none — walked, scenario 13) |
| 8 | The warning list | NO | — |

## 2. The rulings swept

| Ruling | What it asks here | Checked by | Result |
|---|---|---|---|
| D793 | the put-back waits on the question; put back only on an answer | walk 1–6, 11, 12, 14; `oilwait.test.tsx` (ON9); `e2e/oilwait.spec.ts` at three sizes | PASS |
| D793 reading 3 | an Undo of the take-off asks nothing | walk 9; unit | PASS |
| D783 | not made until answered; not answered: a bar that stays ("… OIL not answered" · Answer OIL · OK) | walk 4, 5, 10; unit | PASS |
| D781 | what the scheduler answers there notifies nobody | unit (`world()` holds the bell — unchanged on an unanswered question; Fable's read: clean) | PASS |
| D762 | one answer for everyone in a shared input | walk 12; unit (the heading — the Opus read's F2, fixed) | PASS after fix |
| D755 | a row that came from an input is the input | walk 12 (one row, both men) | PASS |
| D103 | on a published day nothing waits to go out until the answer is given; a pending change wipes the sign-offs | unit (two tests; the Opus read's F1 — a stray "goes out" mark — fixed) | PASS after fix |
| D792 | a delete asks nothing | untouched | — |
| D25 | OIL is earned leave, never pay | the words on screen are D783's own | PASS |
| D345, D339 | History on: a gold dot on every detail with a history; a dot and a bubble never disagree | walk 15–20; `reqdoor.test.tsx` | PASS |
| D726 | few words | three new phrases: "Don't put back", "Put back", "Not put back — OIL not answered" | PASS |
| D56 | a problem only in stored data is not a finding | in both readers' brief | — |

## 3. The roll-call

| The thing | Every place it is drawn or pressed | Has it | Proved by |
|---|---|---|---|
| "Accept" on a taken-off input | the Scheduler Board's Personal Inputs card | has the question | walk 1–10, 12, 14; e2e |
| | Edit Schedule's week, the line under Personal Inputs | has it (one click router for both) | walk 11 |
| | "→ Ground" (an input of kind Other) | has it — the same button, the same door | unit (the door is `[data-acc="g"]`) |
| | "→ Unavail" (an Other filed under Unavailable) | MUST NOT by D793's words ("on the programme") — **parked for him, §13** | unit |
| | a member's page | MUST NOT show it | walk 13 |
| | View-only Sched | MUST NOT show it | walk 13 |
| every OTHER way an input comes to stand on the programme (the readers' list of doors) | the board's Ground "+ Inputs", an input's own window, a date moved, a week loaded, a plan switched, Undo / Redo, the working-out after every command, a publish | each already asks where it should (the window, the move — D783) or must not (Undo, a load: nobody pressed "put it back") | both reads: every door listed, none missing |
| The gold dot on an input's row | the board; the edit week | has it | walk 15, 17 |
| | a version look, View-only Sched | MUST NOT (no dots there at all) | `histbubble.test.tsx` |

## 4. The door check

The Accept's two ends: the question answered (Yes, No), and left (the sheet's "Don't put back", ✕, Escape, a press
outside) — each walked. The bar's two buttons — each walked. Both orders around Undo — walked (9, 10). The take-off has
two doors on the board (the row's ✕ on the Ground Programme; a card's "Undo") — both end in the same store call.

## 5. Sizing the walk (written before it)

1. **The type of change:** C (an existing control gains a waiting mode), G (the put-back and its answer as one step;
   Undo; a published day), D (the gold dot, painted on two surfaces by one pass).
2. **What only a walk could find:** where the Accept really stands (a folded panel on the board; the week's line); the
   sheet and the bar over the real board at a phone's sizes; the whole route by the app's own controls — an input
   filed, its day made a holiday in the Calendar window, the list left for later, the take-off, the Accept; a member's
   pages. **What the tests already hold:** every state of the question, the one step, a published day, the words.
3. **What the ledger says:** C — eight walks of fifteen found a real fault; G — four of seven; D — ten of ten.
4. **The walk chosen — ONE Sonnet 5.5 walker,** twenty scenarios at a desktop and a phone (one on a phone on its side),
   on a frozen build served apart; beside it the browser test of the whole route at three sizes.
5. **Scenario design:** the builder's own. The checking guide gives it to the other maker's model, and neither ChatGPT
   reader was available (D761) — written on the one list.

## 6. The host's own run before the walk

`e2e/oilwait.spec.ts`'s new test, at 1440 × 900, 390 × 844 and 844 × 390: the whole route; the sheet's words and its
greyed "Put back"; nothing put back; both buttons inside the card; the bar on top and inside the screen; "Answer OIL",
Yes, "Put back" → the row and its answer. Writing it showed the walker's brief two things it had wrong (the take-off
on the board is the row's ✕, not a button named "Undo"; the Personal Inputs panel opens folded).

## 7. The walk

One walker, 317,564 tokens; report `docs/handpass/parts/ib/w1.md`; pictures
`docs/img/handpass/2026-10-13-inputs-batch/w1/` (55). **38 checks: 34 PASS, 0 FAIL, 4 RECORD, none unwalked.** The host
read every RECORD and opened the pictures of the question, the bar, the toast and the dot.

| What it recorded | The host's reading |
|---|---|
| 9 — after the app's Undo of a take-off the card shows no "OIL?" tag | as ruled: the tag is the Inputs calendar's card's and the Inputs list's (D777), not the board's |
| 12 — the shared input's first line: "Putting 2 people's Range brief back on the programme" | as built |
| 13 — Ranger sees no Accept, Undo or ✕ anywhere | as it must be |
| 18 — Tally taken off the row: no dot is left; the changes window lists both lines | as expected (no puck is left to wear one) |
| 4 — what flashes when it is left unanswered | the Accept button itself — as built (it is the thing he pressed) |
| 3 — the Undo button reads "Undo — a personal input" | the filed `[OIL-NOTIFY-SEEN]` (1); not this job's |
| **Seen in passing — on a phone on its side the note of the take-off lay over the question's two buttons** (a look-only overlap: presses went through) | **FIXED:** a note still up is taken down when a question is put — test first |
| Seen in passing — on a phone the crew drawer's armed tap drops when the drawer is closed | older; the filed `[OIL-NOTIFY-SEEN]` (5) |

## 8. What the tests found while it was built

- The first version asked on "→ Unavail" too; a test written for D793's own words ("on the programme") failed, and the
  door now asks only for the programme.
- One Leave War browser test failed in the first full run ("Undo and Redo leave the grid where it is…", at its
  month-button step) and passes alone three times of three — the unsteady step already filed
  (`[LW-REQ-PICK-MONTH-UNSTEADY]`), seen in a second test. Nothing of this batch touches the Leave War.

## 9. The break tests

`scripts/handpass/breaks/2026-10-13-inputs-batch.json` — **24 of 24 caught.** Four were not at the first run: two were
no break at all (the code they changed does the same either way) and were dropped; one was rewritten to break what it
named (the one step is the BATCH); one showed a wire with no test — the ANSWER arriving after the input was put back
another way — and the test was written. The twin timer in the puck drag has no break of its own (a one-line guard; the
Inputs calendar's twin is pinned).

## 10. The reads of the finished code

Two readers, blind to each other, to the walk and to this sheet (D790); one brief
(`docs/superpowers/briefs/2026-10-13-inputs-batch-read.md`). Every claim was written as a test and failed before it was
believed.

### 10.1 What each found

| | Fable (374,441 tokens) | A fresh Opus reader (566,948 tokens) |
|---|---|---|
| Claims | 2 low | 1 medium, 5 low |
| False alarms | 0 | 0 |
| Found by both | — | — (no claim in common) |

| # | The claim | What was done |
|---|---|---|
| Fable F1 low | The answer is written first and the put-back second in one step; a put-back refused at that moment left the answer written alone | FIXED: the refusal says why and throws the whole step away |
| Fable F2 low | A test could pass having tested nothing (an early return) | FIXED: the premise is asserted |
| Opus F1 medium | On a published day that went out WITH the row, a put-back made with its answer left a "goes out" mark on a row exactly as issued | FIXED: the marks are settled inside the step |
| Opus F2 low | The question for an input of several was headed with one man | FIXED: headed for everyone, as at every other door |
| Opus F3 low | A man put on the row by REPLACING its only person wore no gold dot | FIXED: the hand-over line is his too |
| Opus F4 low | The put-back tried before the question left the "just added" flash armed for six seconds | FIXED: a tried save flashes nothing |
| Opus F5 low | "Answer OIL" after the input was moved to another week wrote a row on a day it no longer covered | FIXED: it says the input has changed, and writes nothing |
| Opus F6 low | The same stray timer stands in the puck drag | FIXED (a one-line guard) |

### 10.2 The builder's readings, as the readers ruled them

All supported by both — but one the Opus reader marked HIS to decide: "→ Unavail" asks nothing (§13).

### 10.3 The narrow read of the fixes

A fix is new code: the fix commit (`22ca4385d`) rewrote logic at three of the nine points, so it was read again by a
SECOND fresh Opus reader handed only that commit and the nine findings (428,355 tokens; report
`docs/handpass/parts/ib/read-fixes-opus.md`). **All nine fixes do what they say and break nothing beside them.** One
low claim: the heading fix (Opus F2) did not reach two OLDER doors of the same question — an input of several dragged
on the Inputs calendar, and one man of several replaced on an Unavailable row; the first reader had named them as
older code. FILED, not fixed here: `[OIL-ASK-HEAD-SEVERAL]`. Two notes: the table documents did not list the new value
of a history line's field (`whose`) — added to `data-schema.md`, `data-model.md` and the type's own comment (D473); a
refused answered put-back puts an armed "+ add" down, as every refused save does — harmless. This was the last round.

## 11. What was NOT walked, and why

- A published day (the stray mark of the Opus read's F1) — a unit test holds it; no helper published a day.
- The refusal after an answer (Fable's F1) and "Answer OIL" after a move to another week (Opus F5) — states a person
  reaches only with the page changed under a question; unit tests hold each.
- The re-walk of what the fixes touched: the browser test of the whole route, at three sizes, in the final gate run.

## 12. The gates

The whole set in ONE run under the PC's lock with nothing else running, twice:

1. **Before the walk and the reads, on `c294678c7`:** unit 10906 / 10906 (624 files) · build clean · tfin 728 / 0 · e2e
   774 passed, **1 failed**, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK. The one failure is a Leave War
   browser test at its month-button step (§8) — alone, three of three; nothing of this batch touches the Leave War.
2. **After every fix, on `9c1762414`:** unit 10916 / 10916 (624 files) · build clean · tfin 728 / 0 · e2e 778 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK.

After it, only a comment in `engine/editlog.ts` and documents changed. Not run for this batch: `npm run perf` and the
adapted probes — no drawing of the week or the board changes (the gold dots' pass runs only while History is on, and
does one lookup more for a seat of an input's row).

## 13. His look, and what is parked for him

**The card — on this branch's preview link:**
1. Inputs → file a Training for a member on a Friday; ⚙ → Calendar → Holidays → make that Friday a public holiday;
   "Later" on the list that opens.
2. Edit Schedule → that Friday's board → the ✕ at the end of the input's row on the Ground Programme.
3. Open Personal Inputs → **Accept**: the question should come, with "Don't put back" and "Put back" — and nothing
   on the programme yet.
4. **Don't put back** → the bar "Not put back — OIL not answered". **Answer OIL** → Yes → **Put back** → the row is back.
5. One **Undo** → the row is off again and the answer with it.
6. History on (the clock): drop a man on an input's row → his puck wears a gold dot; tap it → the bubble tells it.

**Questions waiting for him (D596 — parked; nothing else waits on it):**

| # | The question, in the app's words | Recommended | What waits on it |
|---|---|---|---|
| 1 | An input of kind "Other" that was taken off can be filed under Unavailable ("→ Unavail") instead of put back on the programme. It then counts again and still needs its OIL answer. Should "→ Unavail" put the OIL question first too, as "Accept" now does? Example: Ranger's "Other" on a public holiday, taken off; a scheduler presses "→ Unavail" — today it is filed there at once and nobody is asked; its "OIL?" tag and the bell still say it needs an answer. | Yes — the same rule at that button | nothing built waits; as built it asks nothing there (D793 says "on the programme") |

**Told, not asked:** the three new phrases; left unanswered, the Accept button itself flashes; a note still on screen is
taken down when any OIL question is put; a man who replaced an input's only person wears History's dot too.
