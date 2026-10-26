# Only a scheduler moves an input he has moved (D1388); the load's count for a request filed back off the programme — the evidence sheet

Branch `claude/lw-other-goes-to-lock` (pull request 572), 26 Oct 26. Two filed Leave War leftovers in one check (D485,
D1087): [LW-OTHER-GOES-TO-LOCK] (his D1388) and [LW-OD-DISCARD-COUNT] (the M3 batch's third code read).

**Tier: FULL.** The eight answers: 1 earned leave / who counts as present — no new rule, but where an input stands decides
whether the Leave War counts him away, and that is now held: YES · 2 published record — the load's "Discard N edits"
count: YES · 3 saved data — a new field on an input (`schedPlaced`): YES · 4 shared drawer — the one input window, opened
from the Inputs list, the calendar's bar and the opened day: yes · 5 new gesture — no (two existing buttons made dead for a
member) · 6 new surface — no · 7 roles — who may change where an input stands: YES · 8 warnings — no.
The server question (§5): the rule is in `state/perms.ts mayMovePlace` and the commit gate's `inputBreach`; `perms.test.ts`
(§11's `Input` note, word for word) and `perms-scan.test.ts` ran green; §11 rows touched: `Input` (its note and a new
column `movedByScheduler`).

**Rulings swept:** D1388 (the lock — the one being built), D1356 / D1365 (whoever files an Other picks where it goes; the
war's Other goes straight under Unavailable), D655 / D763 / D770 (a member changes his own input; who is in it), G5 (a
rejected one is a scheduler's — `ui/inputedit.tsx` before this build), D1357 / D1372 / D1374 (what lands under
Unavailable by itself), D1393 / D1381 / D1389 (an overseas duty's and a course's way out of Unavailable), D109 / D114 (one
change counts one), D98 / D175 (what a load puts back), D56 (stored demo data is not a finding), D1090 (Auto-fix stays
off — the app switched it on for this pull request; switched off at once).

**The agent's readings of D1388, for his look** (each a question for him, below): (a) the lock holds for EVERY input a
scheduler moved — a course, an Attach, a Meeting — not only an Other; (b) a member's retype no longer revives one a
scheduler rejected (the 26 Aug 26 rule "a dormant record retyped counts again" narrowed for a member — `engine-rules.md`
marked); (c) ALL AVAIL put into one a scheduler moved under Unavailable is refused, since it would take it off; (d) a
scheduler FILING an input for a member is not a move — the member may still pick.

## The roll-call (§6)

**The thing:** where an input stands (under Unavailable, on the Ground Programme, parked by a Reject) and its Goes to.

| Where | Shows the lock / is held | Notes |
|---|---|---|
| The member's input window, from the Inputs list | HAS IT — walked W2, W3, W4, W4b, W5 (desk), W2 (phone) | the same component from every door |
| The member's input window, from the calendar's bar / the opened day | HAS IT — the same component and the same `goesLocked` reading; not walked separately (the list door walked) | one builder (`InputEditor`) |
| The scheduler's input window (Inputs page) | MUST NOT lock, because only a scheduler moves it — walked W6 | |
| The schedule's own input window (Edit Schedule / the board) | MUST NOT show Goes to — never had it (`ctx 's'`), unchanged | scheduler only |
| The Leave War's bid window ⋯ Other | MUST NOT ask — files straight under Unavailable (D1365), unchanged | |
| A scheduler's doors that move it: the week's Reject / → Ground / → Unavail | HAS IT (writes the mark) — walked W1, W4-fixture, W7 | `ui/interactions.ts` |
| The Scheduler Board's same buttons, and its Ground Programme row's ✕ | HAS IT — walked W1b | `ui/board.ts`, `routeClick` |
| The scheduler's window Goes to / a retype that moves it | HAS IT — test (`goesheld` (1)); W6 walks his window moving it | `markMoved` |
| A member's save: Goes to · retype · ALL AVAIL in | HELD — walked W2, W3, W4, W4b | `commitInputEdit`, `commitInput` |
| A member's command made by hand | REFUSED by the commit gate — test (`goesheld` (5)) | a test may carry it: no screen route |
| One Undo of a scheduler's move | takes the mark back with it — test (`goesheld` (1), through the app's real Undo) | |
| The load's "Discard N edits" | HAS IT (counts 1) — walked W7, tests (`odreject`) | `engine/publish.ts dayDiscardCount` |

## The sizing step (§7.0)

1. **Type:** H (who may do something) leading, with C (two buttons made dead), G (a saved field; the load's count on a
   published day).
2. **What only a walk could find:** that each scheduler door on screen writes the mark (week AND board), that the member's
   window draws it dead with the right words on a phone and a desktop, that his Save of a retype keeps it where it is,
   that the refusals are said on screen and nothing is lost, and that the load's button reads the corrected number. Tests
   carry the commit gate (no screen route) and the one-Undo step.
3. **The ledger:** H-type walks are few; the last FULL walks of this area (26 Oct 26 night, the M3 batch) were the host
   alone on one script, 45 min – 1 h 15, and their code reads each found what the walk had not (a state reached by
   another route) — so the reader here is asked first for absences (other doors, other routes).
4. **The walk chosen:** the host alone, one script of 15 assertion steps (`scripts/handpass/lw-lock-walk.mjs`), desktop
   1536 and phone 402 Chromium, on one served build (port 4180); the board's doors and "Several people" added after the
   roll-call showed them unwalked. Carried by tests: the commit gate, the Undo, the course's count (same route as the
   overseas duty's, `odreject`).
5. **Row:** added to `docs/walk-ledger.md` below.

**§7.11's lessons, checked:** (1) a reading in each state — the window's line read held-under-Unavailable (W2),
held-on-the-programme (W4), unheld (W5), the scheduler's (W6); (2) a gesture at speed — none new; (3) feedback — the
refusals said on screen (W4, W4b pictures), the dead buttons' line says why; (4) a press behind an open window — the
member's window leaves the list working; a press on the dead button is the only new press (W2-dead-press); (5) a box
brought into sight — the phone's line inside the screen (W2-phone).

## The walk

`Walk: 15 PASS, 0 FAIL (first run); re-walk on the fixed build 16 PASS, 0 FAIL (W3c added for the read's F1) — scripts/handpass/lw-lock-walk.mjs on the build of the branch's first commit (its
source unchanged since), desktop 1536 and phone 402 Chromium, browser errors none on either; pictures
docs/img/handpass/2026-10-26-lw-goes-lock/ (13), results walk-results.json. The host opened w2, w4-refused-screen, w4b,
w2p (after the tap and settled) and w7.`

| Step | Result |
|---|---|
| W1 | the week's Reject then → Unavail: stored under Unavailable, marked moved |
| W1b | the board's Ground row ✕ (Reject), then the board's → Unavail: each marks it |
| W4-fixture | Ranger's own pick under Unavailable, then a scheduler's Reject and → Ground: on the programme, marked |
| W2 | Ranger's window: Unavailable picked, both buttons dead, "A scheduler moved it here: counted as away on the Leave War" |
| W2-dead-press | a press on the dead Ground Programme button changes nothing |
| W3 | his retype to an Attach, saved: still under Unavailable; then to a Meeting: still under Unavailable |
| W3c | (the re-walk, the read's F1) the board's held one under Unavailable, retyped by Ranger to LL: saved, still under Unavailable (by its kind) |
| W4 | the one on the programme: Ground Programme picked, dead, "…still counted in the Leave War's manning"; his retype to LL refused — "A scheduler has moved this input, so only a scheduler can change it to LL" — the window stays open |
| W4b | "Several people" + ALL AVAIL into the one under Unavailable: refused — "…so only a scheduler can put ALL AVAIL or ALL in it" |
| W5 | his own unmoved Other: both live, his Unavailable saved, no mark |
| W2-phone | the same window on a phone, the line inside the screen; the picture ~80 ms after the tap shows nothing pressed-looking |
| W6 | the scheduler's window on a held one: both live, his Unavailable saved |
| W7 | a one-day overseas duty published under Unavailable, then Reject and → Ground: "1 pending"; the load arms as "Discard 1 edit & load — confirm"; loaded: nothing pending, the duty back under Unavailable |

**Found on the way, filed (not this change):** [LW-LOAD-RELAND-RID] — the seed's three-day overseas duty in W7's state
reads "Discard 2 edits" for a load that changes nothing (the row re-made under a new hidden id). Older; a count only.

## Tests and gates

- Red first: `src/ui/goesheld.test.tsx` 20 (16 red before the build, for the right reasons); `src/ui/odreject.test.tsx`
  2 (OD and course red before the count fix — run with the fix set aside, then green).
- On his PC: the 191 unit-test files that touch the input window, the permissions module or the schedule's buttons —
  4091 passed (under the lock, before the count fix); the 21 files that check the load's count — 714 passed (after it);
  the build; `rulecheck`; `docsize`. After the read's fixes: `goesheld` 25, the 191 files again under the lock — 4096
  passed; the build again (the re-walk's).
- GitHub's run of pull request 572 is the full gate set (D1086).

## The code read

One fresh, blind Opus reader (D790, D903 — no ChatGPT readers until about 1 Nov 26: the job joins [NO-ASTRA-LIST]),
handed the change, the walk's results and D56, asked first for what is missing. It ran its own probes; 31/31 of the
branch's tests passed for it.

| # | Finding | Disposition |
|---|---|---|
| F1 (medium, reproduced) | The commit gate compared the stored marks, not the place: a member's retype that LEAVES it where the scheduler put it was rolled back, silently — a held Other under Unavailable retyped to LL / ATT C / OD (each stands there by its kind, with no mark), and a held overseas duty on the programme retyped to a Training (it leaves its Ground mark) | FIXED red-first — the gate asks `placeOf` (the one answer the save keeps); `goesheld.test.tsx` "the code read's F1 and F2" (4 red before); re-walked W3c |
| F2 (low, reproduced) | A scheduler's ALL AVAIL put into a member's Other under Unavailable moved it onto the programme, unmarked — its filer could send it back | FIXED red-first — `commitInput` marks it (`markMoved`); test as above |
| Q1 | "Load onto working copy" puts a published filing back without the mark — is a load a scheduler's move? | A question for him (below, 4) |
| Q2 | A member may delete a held input and file a new one with his own Goes to | As built: deleting his own input is his (D655), and a new filing is his to place (D1356) |
| Q3 | The gate's source for a NEW record split from a held one could be the wrong record in a command that changes two of his inputs | No live route found; the same pattern the scheduler's other marks have used since 12 Oct 26 — not a finding (no concrete failure) |

**Doors the reader checked and found right:** every scheduler door writes the mark in the same command (with and
without the OIL question); the mark survives a week load, the after-command pass and Undo / Redo; pieces split off a held
input carry the mark and the place, so a member taking himself out is not refused; a scheduler's "+ Inputs" (filing) never
marks; an admin in the member view is asked as a member on both sides. **The count:** right for the overseas duty and the
course; no under-count found (rows kept, a request standing on another day and ALL AVAIL rows checked).

**Its view of the four readings:** (a) the lock for every kind is "a modest over-reach of the words" — the full row
narrows D655 "for an Other's Goes to only" — but within the ruling's purpose: **his to confirm** (question 1); (b), (c),
(d) consistent.

**The fixes' own read (§5, "a fix is new code"):** both are one-line changes (a comparison, a mark), so no narrow read;
their tests and the re-walk carry them. After the fixes: the 191 affected unit-test files again, under the lock (see
Tests).

## His answers

**26 Oct 26, "Ok everything as recommended"** (after asking what is locked and which inputs): Q1 → D1398 (the lock for every kind a scheduler can move), Q2 → D1399 (a member's retype never revives a rejected input), Q3 → D1400 (the words stand), Q4 → D1401 (a load is not a scheduler's move).

## The questions as put to him

Put to him 26 Oct 26 on the look page https://claude.ai/artifact/4GWeaEyr7NkCMKD2rjQip1 (newest first, each with its pictures), with the preview https://raptor-git-claude-lw-other-goes-to-lock-kai-e2f5.vercel.app (Ready at the pushed commit).

1. **The lock covers every input a scheduler moves, not only an Other** — a course, an Attach, a Meeting he rejected or
   moved: Ranger cannot move it back by retyping it. Recommended: yes, as built (the ruling's point — "the member could
   quietly move it back" — holds for every kind).
2. **Ranger's retype no longer brings back an input a scheduler rejected** (it used to count again once its kind
   changed). Recommended: yes, as built — a Reject is a scheduler's move.
3. **The refusal words**: "A scheduler has moved this input, so only a scheduler can change it to LL" and "…so only a
   scheduler can put ALL AVAIL or ALL in it"; the window's line "A scheduler moved it here: counted as away on the Leave
   War". Recommended: keep (pictures w4, w4b, w2).
4. **Is "Load onto working copy" a scheduler's move?** It puts each request back where the published version had it;
   today it does not mark it, so a member whose own pick it undid can pick again. Recommended: leave as built — the load
   is putting the published day back, not deciding a man's input; a scheduler who wants it held uses Reject / → Ground /
   → Unavail, which mark it.
