# Evidence — the posting-out bell line ([POSTOUT-RUN-NOTICE]), 5 Nov 26

Branch `claude/postout-bell-look` (pull request 641). Rulings: D1546, D1547, D1690, D1691. Drawing of record
`docs/mock/2026-11-05-postout-bell/` (pictures 2b and 3). Pictures: `docs/img/handpass/2026-11-05-postout-bell/` (walk 1),
`…/round2/` (walk 2's first run, C5's fault), `…/rewalk/` and `…/round2-rewalk/` (both on the fixed build), the drawing
check `docs/img/handpass/2026-11-05-drawcheck-postout-bell/`. Reads: `docs/handpass/parts/pb1105/`.

## 1. The eight questions and the tier
Money NO (no OIL, leave or count changes — a posting's outcomes are as before) · the published record NO · **saved data YES** (a
new kind of stored bell line, its writer inside the posting pass) · a shared drawer YES (the bell's one list, both bars) · a new
gesture YES (a line's tap) · a new surface NO (a line in the existing list; the landing on Admin → Users) · **roles YES** (the
permission gate's notice rules; admins only) · the warning list NO. **Tier: FULL**, with a security read (D1411).

## 2. The roll-call — every place that draws or reads a bell line, and the posting run's openers
| Place | Shows the new line | The tap usable | What else is on its pixels |
|---|---|---|---|
| The bell's list, the app's top bar (desktop) | YES (walk 1 B2) | YES (B3–B7) | the unread dot, the age, "Mark all read" foot — measured, one line of words each (B2c) |
| The bell's list, the phone's top bar | YES (B2, phone) | YES (touch, pictured right after the lift) | the same; the drawing check, 21 parts |
| The bell's list over the Scheduler Board's bar | YES — the same one list (`ui/topbits.tsx BellList`, drawn once) | YES | carried by that one list; not walked separately (same component, same tap body) |
| The bell lit (`bellOn` → `unreadFor`) | YES (B1, B8) | — | — |
| "Mark all read" / a line's read mark (`noticeseen`) | YES (B5a, B8, B10) | — | — |
| The member view (D292) | MUST NOT, because the line opens a scheduler's page — hidden (B11a; `noticeLive`) | — | — |
| A member's own bell | MUST NOT — never addressed to him (B13; the gate) | — | — |
| A second admin's bell | YES, his own lines (B12) | YES | — |
| The posted man himself (an admin made SANS, or off the manpower) | MUST NOT — never told of his own posting (tests) | — | — |
| `noticesFor`'s 30-line cut | counted among the 30, as any line | — | carried by the existing list test |
| Saved and read back (`persist.ts` notices mapper, `history.ts` snapshot) | YES (B10: after a reload, the same four, read) | — | — |
| The war's "taken back" follow-up (`warNoticesReversed`) | MUST NOT treat a posting line as the war's — `isWarNotice` excludes it (code roll-call) | — | — |
| The gate: a member's command (`WAR_LINE_KINDS`) | MUST NOT write one (test) | — | — |
| The gate: the posting pass (`postingPassViolation`) | YES, only its own lines (tests: 8 forged kinds refused) | — | — |
| Admin → Users, the roster row (SANS, off the manpower) | the landing: ringed, in view (B5, B6) | — | the sticky top bar (row below it, uncovered — measured) |
| Admin → Users, the Archived fold | the landing: the fold opened, ringed (B3) | — | the same |
| A deleted man (no row) | MUST NOT open anything — D1691 (B7) | — | the list stays up; the line read |
| Openers of Admin → Users (`ADMINOPEN`): the access alert, Quals' "+ Add person", now the posting line | each still lands as before (accounts tests green) | — | the new `person` rides the same intent |
| The posting run's wake: every change, and now midnight / a page shown again after the day turned | YES (walk 2 C5; test) | — | — |

## 3. The sizing step (§7.0)
- **Type of change:** B (stored data — a new line kind), D (a new tap that navigates), H (permissions).
- **What only a walk could find here:** the lines in the real bell at both sizes beside the drawing; the landing's scroll and ring
  against the sticky bar; what the phone shows right after a tap; the run happening through the app's own wiring, not a test call.
- **The ledger:** stored-data and tap changes have found layout and order faults in walks that the tests passed.
- **The walk chosen:** the host alone, two scripted rounds (walk 1, then the fresh scenario designer's missing scenarios as walk 2),
  both sizes, both re-walked on the fixed build; the drawing check on 6 states. Repeated cases (each forged gate case, each outcome's
  words, two dates in one run) carried by the unit tests named in §5.
- **The row:** added to `docs/walk-ledger.md`.

## 4. Orders walked (what the screen said)
Walk 1 (`scripts/handpass/pbw-walk.mjs`, 51 checks): posted through the sheet today → nothing before the date (A1) → the date
comes: lit, four lines in his words and the drawn order (B1, B2) → each line tapped (B3 archived, B5 SANS, B6 off the manpower,
B7 deleted) → the ring's end (B4) → Mark all read (B8) → closed by the bell, Escape, a press outside (B9) → reload (B10) → member
view and back (B11) → the second admin (B12) → a member (B13).
Walk 2 (`pbw-walk2.mjs`, 21 checks): C1 a posting dated today — the line at once; the top bar's Undo takes no posting back (D350);
the posting sheet's Undo post out puts him back and the line stays; its tap rings his roster row · C2 renamed after the line, then
restored · C3 a second tap inside the six seconds · C4 half-typed work on Users kept · C5 midnight with the app untouched · C6 the
plain-user round (the Leave War grid, Quals, Edit Schedule, Admin → Users's tags "posted out 16 Nov · SANS" and "posted out 16 Nov").
**After the fixes:** walk 1 51/51, walk 2 21/21, both sizes, no page or console errors.

## 5. Carried by a test (`src/leavewar/postout-notice.test.ts`, 26; `src/ui/postout-landing.test.tsx`, 4)
Each outcome's words and who is told (through the real Post out writer and the pass) · told once though the pass runs again · the
run's one envelope passes the gate · two dates in one run, the later first · an admin not told of his own posting (stored and worked
out) · a held posting tells nothing · the gate refuses 8 forged posting lines and 3 other lines · a stray request change in memory
does not ride the pass · the midnight wake (fake timers) · the worked-out "off the manpower" line from its date for 14 days · the
member session · the tap (archived → Admin → Users with the man; deleted → nothing) · the landing's fold, ring, its six seconds, a
second tap, a search cleared, half-typed work kept. Each red on the code before its fix (§8).

## 6. Break tests
`postout-notice.test.ts` was red 15 of 18 before the build, then 6 of 29 before the fix round, the midnight case before its fix;
`postout-landing.test.tsx` red 2 of 3 before the ring-timer fix and 1 (half-typed work) before the fix round.

## 7. The drawing check (§7.10) — `scripts/drawcheck/specs/postout-bell.mjs`
Its six records replay identical to the approved pictures. Every part of the four lines matches (place, words, colours, letters,
dots) at 1536 and 402. Kept as drawing states (named in the spec): the list 36px taller — the app's own "Mark all read" foot under
unread lines, which the drawing's cloned lines never raised; the phone row name's cyan in the drawing — its hover under the
resting finger. **Red, put to him (Q3):** the ring on Admin → Users stands 8px outside the row (x −8, width +16) so it never touches
his name, as the drawing's did.

## 8. What the checks found, and each disposition
| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | walk 1 (B2b) | a run's lines in reverse of the drawn order (the postings keep no order) | fixed: date, then the sheet's order of outcomes, then callsign; test |
| 2 | walk 1 (B4, through reading) | the ring never ended (its timer cancelled by the page's own effect) | fixed; `postout-landing.test.tsx` red before |
| 3 | walk 1 (b3 phone picture) | a row's hover colour lit under the finger on a touch screen | fixed: hover only where a pointer hovers |
| 4 | code read 1, security read 1 (high) | the pass took in the schedule's records without bringing its starting point up first — a console change rode the pass as the app's act | fixed: resync first, every pass; test |
| 5 | security read 2 | the gate's posting-line check loose | fixed: outcome, date, admin, not himself, one each, one part; other no-maker lines only in a delete; tests |
| 6 | code read 3, scenarios S2 | a tap redrew the Users list and lost half-typed work | fixed: no redraw; test and walk C4 |
| 7 | scenarios S5 | two dates in one run interleaved | fixed (with 1) |
| 8 | code note 1 | an admin made SANS told about himself | fixed; tests |
| 9 | scenarios S1, walk C5 | midnight passed with the app untouched: the posting did not run at all, nobody told (older, in the pass) | fixed: the app wakes the pass at midnight and when shown after the day turned; test, walk C5 |
| 10 | code read 2, security read 3 | the records did not describe the line | fixed: data-schema, data-model §11 and the pass paragraph, the register (B12), the file map |
| 11 | scenarios S4, code note 2 | "off the manpower", worked out live, goes if the posting is undone/moved; the other three stay | **put to him — Q1** (recommended: keep) |
| 12 | the build (Undo) | after the posting sheet's Undo post out the line stays | **put to him — Q2** (recommended: keep) |
| 13 | the drawing check | the ring 8px outside the row | **put to him — Q3** (recommended: keep) |
| 14 | scenarios S12 | an admin made after a run sees only later lines | noted — as every notice; nothing to build |
Notes taken: the StrictMode ring (dev server only) and the stale comments — fixed with 2 and 12; `CSS.escape` in the row search — fixed.

## 9. §7.11's lessons
Mapped one by one in `docs/handpass/parts/pb1105/scenarios.md` (the scenario designer's table): 1 (states × readings — B2/B10/B11,
C2), 3 (feedback — the ring, the read dot), 4 (a press behind the list — B9c), 5 (a row brought into view — B3d, B5b, B6), 10 (a page
hidden and shown — C3 from Users itself, C5), 12 (opened from several pages — B3 from Edit Schedule, B7 from the Leave War, C3 from
Users), 19 (closed by each way — B9), 22 (judged by what is drawn — the drawing check's pixels and the ring's computed shadow). 7, 13,
16 and 18 cannot apply (no frame-steered motion, pinch, typed box or print); 6 and 21 ask for his iPhone look (the tap's lift state).

## 10. Not walked, and why
The Scheduler Board's bell (the same one list and tap body — carried by the list's own tests); a held posting released later (the
hold is older behaviour; "tells nothing new" carried by a test); two admins in two windows at once (no live sharing between browsers
until the database step).

## 11. Gates
On his PC: the build; the touched tests (32 files, 727, and 7 files, 211 after merging `main`); the code check clean; docsize OK.
The full set: GitHub's run of pull request 641 (D1086).

## 12. The fix round's narrow read — `docs/handpass/parts/pb1105/read-fixes.md`
None of the fixes refuses a legitimate pass or breaks its twin (each question checked). Its notes: the midnight clock armed by
every Leave War test — fixed (started by the app's boot only); a kept tap re-applied when the Users list is drawn again under the
page — fixed (the ring cleared whole); the database document's sentence on reading admins after the changeset — added; the gate's
allow-list for the pass's schedule, input and planning rows, and putting a stray schedule change back rather than taking it in —
**filed** for the full security review before the database step (`OUTSTANDING.md` [REVIEW-LAYERS]: a stricter rule here risks
refusing a real posting; the browser route is already closed). This round's own fixes are one-line or moved code; no further read.
