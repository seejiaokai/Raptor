# Chat 29 — Inputs and Medical small fixes: the evidence sheet (8 Nov 26)

Branch `claude/chat29-inputs-medical`, pull request 707. Pictures: `docs/img/handpass/2026-11-08-chat29-inputs-medical/`.
The change: [MED-ROOM-DRAGGED] (the Medical tab's room only while the input window stands where it opens),
[INP-ROOM-TIDY] (the room's size one value; the expand button's unused font lines), React Doctor's 8 in these areas
([RD-LEFT-1108] part 2 — 5 fixed, 3 kept with written reasons).

## The eight answers and the tier
1 money NO — no OIL, count or credit is read or written. 2 published record NO — nothing of publishing, signing or
amendments. 3 saved data NO — no stored field or reading changes; the cut-off's draft helpers moved byte for byte.
4 a shared drawer **YES** — the date calendar (`DateCal`) is drawn in many places, and its month-and-year wheel changed.
5 a new gesture NO — no new control; the drag and the wheel are as before. 6 a new surface NO. 7 roles NO. 8 the warning
list NO. **Tier: WALK.**

## The roll-call — the date calendar's month-and-year wheel (the one shared drawer changed)
| Where it is drawn | SHOWS (the lists open from the title) | USABLE (scroll far past 30 rows, arrows, Enter, tap) | Also PAINTED there |
|---|---|---|---|
| Edit Schedule's Jump to a date (`WeekCal`) | has it — the lists open from the title (01, 11) | has it — scrolled far past 30 rows to July 2071, two arrows up, Enter, a slow three-row scroll, desktop and phone (02–05, 12–15) | the week behind unchanged |
| The input window's own calendar (`RangeCal` in the input window) | has it (34) | has it (35–38) | the dates below the lists |
| A date box — the Calendar window's "Every weekday" from date (`DateBox`) | has it — the floating calendar (06, 16) | has it (07–10, 17–20) | — |
| A date box — Admin / Users (`DateBox`) | has it — one body with the date box walked (E2), the wheel's code shared; not walked apart, nothing of the box itself changed | carried by E2 and the `datecal` unit tests | — |
| A date box — the Leave War's bid, credit and select sheets (`DateBox`) | has it — the same body; not walked apart, the same reason | carried by E2 and the tests | — |
| The Inputs and SANS calendars' month title (`DateBox` month mode) | has it (21–22, 28) | has it (23–26, 29–32); the month follows the wheels (27, 33) | the month behind turns |
| The holiday form (`RangeCal`) | has it — the same `RangeCal` as the input window's (34); not walked apart | carried by E5 | — |
| The Leave War's range (`RangePicker`) | has it (44–45, 50) | has it (46–49, 51–54) | — |
| The OIL question's "Only some days…" (`OilConfirm`) | has it — the same `RangeCal`; not walked apart (the question needs a weekend input) | carried by E5 and the tests | — |
| Admin's run (`AdminPage`) | has it (39) | has it (40–43) | — |

## The rows by kind of change (§6)
- A floating surface — the input window over the Medical tab and over the Inputs list: placed, dragged, reopened.
- A component's second home — `CutFields` in the Inputs and the SANS settings windows; `TypeLegend` ("?") in the input window.

## The five sizing lines (§7.0)
1. **Type:** E (layout — the room) and D (the date calendar drawn in many places, each its own caller).
2. **Only a walk finds:** the room at each width with the window at rest, dragged and reopened (Medical, the Inputs
   list); the wheel in each home, scrolled far enough to re-centre; the "?" card giving way to a question; both cut-off
   windows typing, refusing and saving. The tests cover: the dragged room (Medical, red first; Inputs, pull request 676),
   the wheel's re-centre in `e2e/datecal.spec.ts` and `datecal` unit tests, the legend and cut-off fields' unit tests.
3. **The ledger:** E walks find little (four of ten); D walks found a fault every time; chat 7's walk of the same room
   (pull request 676) passed every step, the reads finding the dragged-window gap this job fixes.
4. **The walk chosen:** one Sonnet walker, through the checks lock, on the production build: Medical at 1536×864,
   1229×600 (his PC at 125%) and a phone 390×844 (no room there); the Inputs list at 1536, 1340 and 1339; the expand
   button at rest and pressed; the wheel in every home above; "?" with a question raised; both cut-off windows; the
   plain-user round (D1557) on Inputs and Medical, desktop and phone.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## The lessons of §7.11 that apply
3 (after every press, what tells him) · 4 and 12 (the page behind the window works; every page the window opens from) ·
5 (the cards at rest beside the window) · 17 (the room shown and hidden, measured after each) · 19 (the window closed by
✕, Escape and Cancel) · 2 and 20 (the wheel scrolled quickly and slowly) · the second 23 (side-by-side boxes one height).
The rest do not apply: no print, no pinch, no hidden page, no keyboard rise, no approved drawing changed.

## Orders walked
One Sonnet walker, through the checks lock (released after), on the production build of `d9e3bc6fc` (Chromium; 1536 × 864,
his PC's 1229 × 600, 1500, 1340, 1339, a phone 390 × 844), scripts `scripts/handpass/chat29-walk*.mjs`, pictures `docs/img/handpass/2026-11-08-chat29-inputs-medical/`:
- **A — Medical at 1536 and 1229:** the window at rest makes the room (446px); dragged away, it goes (16); a card pressed
  (the document viewer, then Edit input); closed by ✕, by Escape and reopened where dropped; after a reload (301–322).
- **B — Medical on a phone:** the window in the middle, no room, no sideways scroll (323–325).
- **C — the Inputs list:** the room at 1536 and 1340 (446), none at 1339 (20) or dragged (326–331).
- **D — the expand button ⤢:** at rest and pressed, desktop and phone (332–341).
- **E1–E7 — the month-and-year wheels in each home** (the roll-call above, 01–54).
- **F1–F4 — "?" on the input window's Type:** opened, closed by a press outside and by Escape, a question raised over it and
  closed, the card reopened by "?" (101–103, 107, 121–123).
- **G1, G2 — both cut-off settings windows:** typing 10, "x", empty, 12, saved, reopened, put back (401–416).
- **H1, H2 — the plain-user round (D1557), desktop and phone:** a medical filed, its question answered, the new card ringed,
  opened, changed, shown on the calendar, deleted; again with a PDF attached and the "as of" date moved (136–147,
  181–188, 201–208).
- **I1–I3 — a press held on a window's bar, no movement:** Medical, the Inputs list and a calendar day window keep their
  room, held and after release (417–422) — the fix of the fresh Opus read's O1.
- **J1–J3 — other windows still drag and keep their place:** the changes window (423–425), the Calendar window (426–427),
  a tap on a phone window's bar (428–430).
## Cases carried by a test
The dragged room on Medical (`e2e/medical.spec.ts`, red first, at 1536, 1229 × 600 and 1500); the Inputs list's (pull
request 676's test); the wheel's re-centre (`e2e/datecal.spec.ts`, `datecal` unit tests); a press without movement places
nothing (`floatwindow.test.tsx`, red first); the "?" card (`inputsvet`), the cut-off fields (`inputsmonth`).
## Break tests
The wheel thrown far past its 30 rows and back, and scrolled slowly; "x" and an empty box in the cut-off; a press held on a
bar with no movement; a window dragged, closed by each door and reopened; a reload with the window placed.
## Pictures
`docs/img/handpass/2026-11-08-chat29-inputs-medical/` — 160 pictures; the host opened the deciding ones: 302 and 303 (the room at rest, gone when dragged), 314 (his PC's
size, dragged), 417 (a press held: the cards stay), 02 (the wheel far past the old end, July 2071).
## Errors seen
Console errors 0, page errors 0, failed requests (4xx) 0, in every run.
## Not walked, and why
- D2 "every input shows" with ⤢ pressed is not proven: no day of the month walked had hidden inputs ("+n more" 0 before and
  after). The button itself works; only its unused font lines went.
- Admin / Users' and the Leave War sheets' date boxes, the holiday form and the OIL question's calendar were not opened apart:
  each is one of the bodies walked (the date box, `RangeCal`), and the wheel's code is one for all.
## The reads
Both read `d8d5b1f57..7c1a13e9f` from one brief (`docs/superpowers/briefs/2026-11-08-chat29-inputs-medical-read-brief.md`),
each blind to the other and to the walk. Started before the walk, on the built code, since neither is handed the sheet
(D790); the fixes below go back to the walk.
- **Astra (Codex, gpt-6-astra, high)** — `…-read-astra.md`: no app fault. **A1** the new browser test reopened the
  window by a card press, which opens the document viewer first → fixed (`066d96f70`): the test presses its "Edit input".
  Tidiness: the "?" card's comment imprecise → reworded in the same commit (my own new line).
- **The fresh Opus reader** (helper; its report kept below): **O1** a plain press on the input window's bar, with no
  movement, set `data-placed` at once, so the Medical cards (and the Inputs list, and the calendars' day windows —
  older there) jumped out from under the window and back → fixed red first (`d9e3bc6fc`, `floatwin.ts`: placed from the
  first movement past 3px; test `floatwindow.test.tsx`); the walk re-checks it (scenario I) and that other windows still
  drag and keep their place (J). **O2** the "not a `<dialog>`" reason untrue for a non-modal `<dialog>` → reworded.
  Tidiness (filed, D489): the `body:has(…:not([data-placed]))` test written five times; the draft sentence in both
  `CutFields.tsx` and `cutdraft.ts`; the browser test repeats 430 and 16; the test now runs at 1229 × 600 too (fixed).
- **A fix is new code (§5):** O1's fix had its own narrow fresh Opus read (helper, handed only the fix and its finding):
  **no finding** — every reader of `data-placed` checked, the failed-save rules lose to the inline place written at the
  press, the room comes back at the first movement. Its one note, older than this job (the comment above `dragging()` in
  `floatwin.ts` names a caller that no longer exists), filed with the tidiness notes. Last fix round: this one.
## Gate counts
React Doctor 421 → 413 (exactly this job's 8); `lint:changed` no new finding. Unit files touched green. GitHub's run of
`7c1a13e9f` failed only on the new Medical test (Astra's A1, fixed `066d96f70`); the run on the branch's last push counts.
## What the walk found, and each disposition
- **J1 — the changes window reopens at its usual place, not where it was dragged:** not this job's, and not a fault. Closing
  the changes window forgets its place, its folds and History with it, by design since 28 Sep 26 (`state/view.ts`,
  `setChgWin`), a file this job does not touch; the Calendar window keeps its place (J2). No finding.
- Seen, not faults: a Medical card opens the document viewer first (built so); the wheel's arrow keys move the month list
  until the year list has the keys (built so).
- Nothing found in the change. **Lessons added (D1297): none** — no fault reached him past the walk.

`Walk: docs/handpass/2026-11-08-chat29-inputs-medical.md · 160 pictures · 4 surfaces · 6 widths · MISSING: none`
