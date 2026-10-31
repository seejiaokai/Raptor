# Bug check — [LW-HELD-DAY-ADD]: a day filled from the Inputs page still takes more (D1548, D1552, D1553)

Branch `claude/lw-held-day-add-eabfce`, pull request 608. His drawing (approved 1 Nov 26, "Yes, as recommended"):
https://claude.ai/artifact/TAKNwJVkxJVcGbf6Kp2QUy — pictures `docs/img/handpass/2026-10-31-lw-held-day/draw/`, script
`scripts/handpass/lw-held-draw.mjs`. Walk pictures: `docs/img/handpass/2026-11-01-lw-held-day/walk/` (first walk) and
`…/rewalk/` (the fixed build), script `scripts/handpass/lw-held-walk.mjs`, results `…/rewalk/walk-results.json`.

## The eight answers and the tier
1. Money — YES: the window opens Grant OIL (owed time off, D25) on days it could not be reached before, and a filing from
   it (CSE, OD, Attach, Other) changes manning. 2. Published record — NO: no publish, signing or amendment path is
   touched. 3. Saved data — NO: no new stored field; every write goes through the doors that already existed (setDayAward,
   fileStraight, setCell / setCellRange, setLeaveRemarks). 4. Shared drawer — NO: the bid window is drawn by one component.
5. New gesture or mode — YES: a tap on such a day now opens a window it never opened. 6. New surface — NO: the window
   exists (a course's day, D1395); it gains a line an entry. 7. Roles — YES: what a member may do from his own day
   changes (CSE, OD, Attach from his leave's day). 8. Warning list — NO.
**Tier: FULL.** The permission rules themselves are untouched (`state/perms.ts` unchanged; every door keeps its own
check), so no extra security read (D1411) — the window only reaches doors each role already had.

## Rulings swept
D1548, D1552, D1553 (this job); D1395 (a course's day — the same window, kept); D1371, D1525 (a held half's line, AM / PM
words); D1543 (Whole day greyed beside approved half-day leave — reused for an Inputs half beside an OD / Other half);
D1544, D1549, D1550 (Approve greyed; not offered at all here — nothing to decide); D1354, D1307 (a member's own leave
words in one row — kept in the window where one leave fills the day); D1318 (a member may file CSE / OD); D1379
(Attach in his ⋯); D1349 (Grant OIL third, an admin's); D1211, D1225 (a member never bids on a past day — his past or
closed day keeps its remarks window); D1290, D1289 (on a phone the day stands above the window, wearing the cyan mark);
D79, D80 (an award on any day, never flagging a leave day); D1350 (an OD or a course has no half); answer C of
[ARCH-STACK] (outside his time in the squadron, the day's list). Each checked in the running app or a named test below.

## The roll-call — every route that opens a window on such a day
| Route | Shows the new window | Usable there | What else is painted |
|---|---|---|---|
| A click on a grid cell, desktop (admin) | YES — D1, D6–D9, D11, D13 | YES — Grant OIL D2, OD D12, a range D5, a leave over an OD D7 | the cyan mark on the day (D10's after-state: none left) |
| A tap on a grid cell, iPhone (admin, Chromium and WebKit) | YES — P1 | YES — Pick a range on and off, P2 | the day above the window (P1-in-view); see the look card |
| A member's tap on his own day, open for him | YES — M1 | YES — his words saved, M2; ⋯ holds Attach, M3 | — |
| A member's tap on his own day, closed for him | NO, because his remarks window stays (D1211) — M4 | — | — |
| A member's tap on another man's day | NO, because it is read only — M5 | — | — |
| The clash note's tap (opens one man's day by the same call as a cell tap, `Matrix.tsx takeFocusOpen`) | YES by construction: the same `setOpen` as a tap; a clash day carries a notice, so it opens the day's list as before (`inputsFilledDay` refuses a day with any war record — heldday.test.tsx) | — | — |
| A keyboard route into a cell | NO, because cells have no key route by design (performance.md §E — the date heading row is the way in); the window opened, Tab reaches its controls and Escape closes it — K1, as on every bid window | | |
| The drag-selection window over such days | NO, because D1548 names a tap; the drag window is unchanged and already offers Grant OIL per day (D1394) | — | — |
| An admin's tap on a posted-out / not-yet-arrived day | NO, because the posting sheet stays (unchanged condition, `Matrix.tsx openHeld`) | — | — |
| A day outside his time in the squadron | NO, because the day's list stays (answer C) — heldday.test.tsx, red first | — | — |

## The sizing lines (§7.0)
1. **Type:** C (a tap opens a new window state; a new control state — leave row absent, Whole day greyed), H (what a
   member can do from his own day), D in part (a line per entry drawn in one place).
2. **Only a walk could find:** whether the window really opens on each kind of day in the running app, on an iPhone
   (WebKit), above the tapped day; whether Grant OIL and the filings land and Undo takes them back; the member's words box
   saving; the range bringing the leave buttons back; the window's look beside the approved drawing.
3. **The ledger:** walks of type C on the Leave War windows (M3, round 3, the fixes of 31 Oct) found faults in states
   after an action and in a second role — so the walk covers after-Grant, after-Undo, a range, and the member.
4. **The walk chosen:** the host alone, one script on the built bundle: desktop 1536 admin (13 steps), iPhone 402
   Chromium touch and WebKit (2 steps each), a member on an iPhone (5 steps), the keyboard (1). Carried by tests (named
   below): the posted-out and outside-squadron days, the days that must not take this path, the D1543 words.
5. **After the walk:** row added to `docs/walk-ledger.md`.

## The scenario designer (fresh Opus, blind)
25 scenarios. **Its 1** (a morning of Inputs leave beside an afternoon OD / Other: Whole day offered and refused with
"clear it first") — a FAULT, fixed red first (`heldday.test.tsx`, two tests; walked D13 with an afternoon Other, since
an OD has no half — D1350). **Its 4** (a member's two halves of his own leave: one box for two leaves) — fixed red first:
the box only where one leave fills the day. **Its 13 (member)** — already fixed red first before it arrived (outside his
time in the squadron). **Its 14, 15** — pinned (`inputsFilledDay` null for each). The rest: walked (5 → D2–D4; 6 → D7,
D12; 7 → D11, daylist.test 12:00; 8 → D5; 10 → by construction, Inputs leave of several days is not a war leave run;
11 → M5; 12 → M4; 17 → D1-buttons; 18 → D10; 19 → P1, P2; 20 → K1; 21 → P2; 23 → the roll-call) or set aside with a
reason: 2 and 3 (a filing from the member's leave window carries no words, and a range swaps the box) — the same as the
window on a leave approved on the war (D1307) has always done, unchanged code; 9 (the drag window) — not changed by this
job; 16 (an OD filed on the war reads "change it on the Inputs page") — true, it is an Inputs record, pinned since round
2; 22 (zoomed out at 1536 / 2560) — the window opens from the cell tapped, whatever its size, with no reading of what is
on screen; 24 (a hidden page changed) — which window opens is worked out at the tap from the day as it stands, never kept.

## The orders walked (re-walk on the fixed build — 31/31 PASS)
| Step | What was pressed | What the screen said |
|---|---|---|
| D1 | Gambit's whole-day OML (his picture) | the window, its line "OML · Whole day · “Medical leave — grounded” · change it on the Inputs page"; no leave buttons, no Approve / Delete / Move; CSE, OD, Grant OIL, ⋯ |
| D2–D4 | Grant OIL HO 0.5 → reopen → Undo → reopen | cell OML + HO; reopened, the day's list (it now holds an award); after Undo, OML alone and the window again |
| D5 | Pick a range 23–25 Jul, LL | the leave buttons back; 24 Jul LL, 23 Jul skipped "1 day not written: already holding leave or a medical." |
| D6 | Quill's whole-day LL filed on the Inputs page | the LL line; no Approve, no leave buttons; the Remarks box empty for what is added |
| D7 | Nomad's OD, then LL | the OD line, the leave buttons drawn; LL lands beside the OD |
| D8 | Comet's whole-day Other under Unavailable | the window (was the day's list), "OTH · 06:00–18:00 · “Station board”" |
| D9 | Drifter's Inputs LL morning + OML afternoon | two lines, AM then PM; no leave buttons |
| D10 | the page behind pressed with the window open | the window closes (as every bid window), no cyan mark left |
| D11 | Cobra's ATT C 09:00–14:00 | the line gives the hours; no leave buttons |
| D12 | OD filed from the window over the OML, then Undo | OML + OD; Undo takes it back |
| D13 | Hex's Inputs LL morning + an afternoon Other, OIL | Whole day greyed, PM lit; OIL saved on the afternoon, approved |
| P1, P2 | iPhone, Chromium and WebKit | the window under the day tapped (WebKit: cell 589–607, window 614–860 of 874); a range on and off keeps it on screen, nothing sideways |
| M1–M5 | Ranger (member) | his open day: the window, "Family wedding" in its box, no Grant OIL; the words changed are saved on his leave; the ⋯ holds Attach; his closed day: his remarks window; Gambit's day: the read-only note |
| K1 | keys | Tab reaches every control, Escape closes — as on any bid window |

## Carried by tests (each red before its fix)
`src/leavewar/ui/heldday.test.tsx` (22): each kind of held day; no leave buttons over leave or a medical; Grant OIL on a
medical's day; a range brings the leave buttons back; the member's box; the mixed halves (D1543's way, two tests); a
member's two halves; outside his time in the squadron; another man's day; `inputsFilledDay` refusing an award, the app's
credit, a bid, a clash, a spill, three entries, a free half, war-approved leave. Changed with the rulings (each said why
in its file): `freehalf`, `round2`, `deciding`, `remarks`, `scrim`, `daylist`, `otherunavail`; `e2e/leavewar.spec.ts`
"a cell Raptor owns…" and "a member's own approved leave…" (4/4 locally, desktop and phone).

## Break tests
The red-first runs are the break tests of the one surface: before the build 12 of 14 failed (`heldday.test.tsx`), before
each later fix its own test failed (outside his time in the squadron 1; mixed halves 2; a member's two halves 1).

## Errors seen
None in any walk (desktop, iPhone Chromium, iPhone WebKit, member).

## Not walked, and why
The drag-selection window (unchanged); a zoomed-out grid (nothing read from what is on screen); posted-out days (unchanged
condition, carried by test); his real iPhone (below).

## His look card
1. On your iPhone, tap Gambit's OML day (23 Jul): the window as drawn, OML's line on top, Grant OIL there.
2. Over a whole-day ATT B (grounded, may still work) the leave buttons stay — the war takes leave over ATT B; say if you
   want them off there too.
3. In WebKit's settled picture (`rewalk/p1-webkit-gambit-oml.png`) the PM chip wore a cyan edge — most likely the tap's
   held state (an iPhone keeps what was last touched "hovered"); worth a glance on your phone.

## The code read (fresh, blind Opus, this sheet in hand — 3 findings, all fixed red first)
- **F1 (medium)** — an entry's documents no longer showed: the read-only note and the day's list listed them. Fixed: a
  chip each in its line, read only, a tap opening the document (`HeldLine.docs`); red first (`heldday.test.tsx` F1);
  re-walked `rewalk2/f1-trident-doc*.png` — "approval.pdf" in Trident's LL line, the document viewer opened.
- **F2 (low)** — the line dropped the "till <date>" the day's list printed (D948). Fixed with `remarksShown`; red first
  (F2); re-walked `rewalk2/f2-havoc-till.png` — "Exercise till 23 Jul".
- **F3 (low)** — the outside-his-time guard was wider than answer C: a course, medical or OD outside his time lost the
  window. Fixed to answer C's own rule (only leave keeps the day's list); red first (F3), the leave test still green.
- **Small notes, dispositions:** (1) over a whole-day ATT B the leave buttons stay — the war takes leave over ATT B
  ("may still work"), and D1552 follows what the war refuses; named to him on his look card. (2) an entry of several
  time windows in one day reads its half — rare, no stored entry has it on the Inputs page; left. (3) state changes while
  the window is open beyond D4's Undo — carried by `heldday.test.tsx` and the round 2 Undo tests of the filings.
- **The narrow read of the fixes** (the order's §5, "a fix is new code" — fresh Opus, the fix commit only): **0 findings**; each fix the day's list's own body, no chip twice (his own leave's box carries his documents), F3 the day's list's own rule word for word. It noted, outside this change, that the free half's line for a commitment (D1371) lacks the "till" and the documents too — filed as [LW-HELDHALF-WORDS]. One round; the read cap not reached.

## Gates
Leave War unit: 228 files, 4062 tests green (on his PC, under the lock). Code check: no new finding. GitHub's run on the
first push: three reds (the inputs guard — a capital INPUTS in a comment, reworded; two e2e — updated); the re-run on the
last pushed commit: (to read).
