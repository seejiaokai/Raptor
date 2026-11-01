# Bug check — [LW-INPUT-RANGE-WHOLE] (D1563, D1565) and [LW-OWN-ROW-SELMARK] (D1568, D1569)

Branch `claude/lw-input-range-whole-02fa06`, pull request 612. His drawings: an Inputs entry opened whole —
`docs/img/mock/2026-11-02-input-range/` (A, picked D1565); the picked day on his own row —
`docs/img/mock/2026-11-02-ownrow-mark/` (A, picked D1569, page https://claude.ai/artifact/2kVE2kEbUks9uNu4icixYt). Walk:
`scripts/handpass/lw-input-range-walk.mjs`, pictures `docs/img/handpass/2026-11-02-input-range/walk/`.

## The eight answers and the tier
1. Money — YES: on "All", Grant OIL now gives OIL (owed time off, D25) on every day of the entry in one press.
2. Published record — NO: no publish, signing or amendment path. 3. Saved data — NO: no new stored field; every write goes
through a door that already existed (`grantOilDays`, `fileStraight`, `placeApproved`, `setCellRange`). 4. Shared drawer — YES:
the selection mark on his own row is drawn by one stylesheet rule over every day cell. 5. New gesture or mode — YES: the
"All n days" / day choice on a window that had "Pick a range". 6. New surface — NO. 7. Roles — NO: no role gains a door;
the window reaches only what each role already had (members: CSE, OD, Attach; admins: Grant OIL, Other). 8. Warnings — NO.
**Tier: FULL.** `state/perms.ts` untouched, so no extra security read (D1411).

## Rulings swept
D1563, D1565 (this job); D1568, D1569 (his own row); D1461, D1465, D1466, D1467 (the war leave's whole window — copied: the
title's dates, the day's list where a day holds a second entry, no "Pick a range"); D1548, D1552, D1553 (the held day's
window: its lines, no leave buttons over leave or a medical — D1552 narrowed by D1565: no range is picked from such a
window); D1394 (Grant OIL over several days: one award a day, one reason); D82, D79 (awards add up; any day); D1289, D1290
(the cyan mark, held in view on a phone — D1289 narrowed by D1568 for his own row); D876 (one mark, one look: the same cyan,
heavier); D1177, D1176 (a member's day not open for bidding shows the closed note — so his window opens only on open days);
D1318, D1379, D1349 (who files CSE, OD, Attach; Grant OIL an admin's).

## The roll-call
| Place | Has it / must not, because… |
|---|---|
| The bid window opened on a day held whole by ONE Inputs entry of several days | HAS IT: title, marks, "All n days" / day, Grant OIL / CSE / OD / ⋯ / leave on All over every day (walk D1–D6, U1, U6–U7; `inputrange.test.tsx`) |
| The same, the entry a single day | MUST NOT: one day is no run — one-day window, "Pick a range" (test) |
| A day holding two Inputs entries (a morning and an afternoon) | MUST NOT: no one entry to widen to — `heldEntry` is null, one-day window (held-day tests) |
| A day of the entry also holding something the war wrote (an award, a bid) | MUST NOT: the day's list (D1466) — walk U2, test |
| A day outside his time in the squadron / a posted-out admin route | unchanged: `openHeld` rules decide first; the run reads only the period holding the day |
| A member's own day not open for bidding | MUST NOT: the closed note (D1177) — walk M (first premise), as built |
| The drag window over the same days | unchanged — it acts on what is dragged (D1394) |
| The war's own leave of several days (D1461) | unchanged — `leaveRunAt` first; the 216 neighbouring window tests and `wholeleave-leavewar.spec.ts` green |
| The selection mark on his own row (`tr.me`) — one day, a run, phone and desktop, admin and member | HAS IT: the heavier look (walk M1–M5, `e2e/inputrange-leavewar.spec.ts`) |
| The selection mark on every other row | MUST NOT change (the e2e "another row" check) |
| The grid's joined bar over the entry | agrees: both read the entry by its one id (`matrixrowparts.ts entryKey`, `store.ts heldRunAt`) |

## Sizing the walk (D607)
1. **Type:** C (a choice in an existing window), D (a mark drawn on every day cell of one row), E (that mark's look).
2. **Only a walk finds:** the iPhone's tapped state over his own row, the chips' fit at 402 in WebKit, the window's ways out
   with the marks taken off, what the OIL tracker and an Undo show after "All", a member's route to the window.
3. **The ledger:** the two nearest walks — the war leave's whole window (28 Oct 26) and the held day's window (1 Nov 26) —
   found nothing by their walk; their faults came from the scenario designer and the host's look at pictures.
4. **Chosen:** the host alone, one assertion script on the built bundle: desktop 1536 admin (12 steps), iPhone WebKit 402
   admin (6, a picture 90 ms after the tap), his own row (8: iPhone admin, desktop member with July opened for bidding through
   the app's own window and the name badge's member view), the plain-user round (11). Repeated cases a test carries: the
   run's dates from every day, one-day / two-entry / award-day refusals, Grant OIL on the day tapped, a leave over an OD on
   both choices (`inputrange.test.tsx`, through the grid and the window's real buttons).
5. **After:** its row is in `docs/walk-ledger.md`.
**The drawing check (D1495):** both drawings have no part list for the check tool; each was compared by measure and by eye
beside the build — his case at 402 and 1536 (walk P1, D1 against `raw/phone-A.png`, `raw/desktop-A.png`), his own row by
`CHECK=1 … lw-ownrow-mark-draw.mjs` (`check-*.png`: the build and drawing A alike; the computed fill .34 and 2px ring
measured in the walk and the e2e).

## The scenario designer (a fresh Opus reader, 18 scenarios) — what became of each
Walked: 2 (Undo / Redo after a filing on All — U8, U9; after Grant OIL — U4), 12 (the window's ✕, Escape, outside tap — D7,
D9, D10), 13 (a tap behind the window — P5), 15 (his own row on a phone, a picture right after the tap — M1), 17 (an award on
a day of it — U2). Carried by a named test: 8 (a half held, the other half free — the free-half window, `heldday.test.tsx`
and `freehalf.test.tsx`; a one-day entry — `inputrange.test.tsx`), 11 in part (the till date and the marks on both choices —
`inputrange.test.tsx`; words typed then CSE on All is NOT tested: the box's words ride with `fileStraight` as on a picked
range, unchanged code). Set aside with reason: 5 (an entry changed under the open window — every press reads the run again,
`runNow()`, the war leave's own pattern G4 of 28 Oct 26; a tapped day emptied leaves `heldEntry` and the run null, the one
day);  1 (the amount is a day each — the drag window's own
reading, D1394, unchanged here); 3 (a run stops at the period's end, as the war leave's does, D1461, and the till date then
names what is filed — its last day in the period); 4, 10 (a day of the run the war refuses is skipped and said by the
same writers as a picked range — unchanged code); 6, 7 (a member's closed days and his own leave's words — the writers'
own rules, unchanged); 9 (the bar and the window both key on the entry's id — read in the code); 14, 16 (the chips' room
and a month drawn later — the war leave's own, `wholeleave-leavewar.spec.ts` "All 14 days" and its mark keeper); 18 (the
posted-out route — `openHeld` decides before the run).

## The walk — 37 of 37 PASS (first run 31 of 33: the two FAILs were the script's premise — a member's day not open for
bidding shows the closed note, as built; his own row was then walked as Saber, his case, and as a member with July opened)
Pictures opened by the host: P1 (his case on the iPhone just after the tap — the drawing's look), M1 (Saber's own row, three
course days in the heavier mark), U1 (an FO beside the OML on each of his four days), U3 (the OIL tracker: Quill +4, one
credit on each of 6–9 Jul "Recalled for a flypast"), M2, D1, U6, U7, U9. No page error on any route.

## Found and fixed during the build
- **The own-row mark's fill lost to the touched row's tint on a phone** (the e2e's phone run, red): a tap leaves the row
  "hovered", and that rule out-weighed the new one; given the same weight, later in the sheet — the phone now matches drawing
  A. Other rows on a phone keep their ring under that tint, as built.

## Tests and gates
`src/leavewar/ui/inputrange.test.tsx` 15 (13 red on the old window); the ten neighbouring window suites 216; the Leave War
browser set with `e2e/inputrange-leavewar.spec.ts` 400 (phone and desktop) on his PC; the build; the code check (no new
finding); the document check. GitHub's run of pull request 612 is the full gate set (D1086).

## The code read (a fresh, blind Opus reader, the sheet in hand — D790)
**No finding.** Checked: every reader of a leave run across `src` (only `BidPicker.tsx`; each branch on the kind safe for
`'held'`); Grant OIL on "All" against the one-day path and the drag window (the same amount reading, the same refusals but
the several-awards edit one, which cannot apply where awards are added; one command, one Undo); the till date for the war
leave's runs; the choice when a run appears or goes under the window; leave on "All"; the stylesheet rule's weight against
every rule on a day cell of his row; what a member can reach; the rulings swept. Two low notes, neither changed: (1) on a
war bid run with the OTHER half picked, the grey till date now names the run's dates — what that press writes, so it is
kept; (2) Grant OIL's button names the amount, given on each day — the drag window's own wording (D1394).

## Found in GitHub's first run, and what became of it
- `inputs-readers.test.ts` (a guard): a comment in capitals ("THE INPUTS PAGE") read as the stored list's name — reworded.
- The new browser test's phone check assumed Windows' letter widths; with Linux's wider letters the chips wrap whole, as
  designed — the test now pins Arial's widths, as the whole-leave test does.
- `inputs-calendar.spec.ts` "a finger held on a date…": fails on his PC with `main`'s own files too (run with this branch's
  four app files put back to `main`'s, 2 Nov 26) — not this change; filed as [INPCAL-HOLD-FLAKE].

Walk: 37/37 PASS on the built bundle — desktop 1536, iPhone WebKit 402, admin and member, the plain-user round; pictures
`docs/img/handpass/2026-11-02-input-range/walk/`.
