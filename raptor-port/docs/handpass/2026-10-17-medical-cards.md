# Evidence — the Medical tab's cards three a row and its "+ Medical" button (D961, D963, D964, D965) — 17 Oct 26

Branch `claude/sharp-goldberg-6d0656` (pull request 524). The build: `raptor-port/src/ui/MedicalView.tsx`,
`raptor-port/src/ui/scheduler/16-medical.css`; tests `raptor-port/src/ui/medicalview.test.tsx`, `raptor-port/e2e/medical.spec.ts`;
the walk `raptor-port/scripts/handpass/medical-walk.mjs`, pictures `raptor-port/docs/img/handpass/2026-10-17-medical-walk/`;
the break list `raptor-port/scripts/handpass/breaks/2026-10-17-medical-cards.json`. The design of record: his "All as
recommended" to the Medical page (D965) — the drawings `raptor-port/docs/img/handpass/2026-10-17-medical-cards/`.

## The eight answers and the tier

1. Money — NO: the cards only display; the button opens the existing window, whose OIL handling is unchanged, and a
   medical input never earns OIL (D804).
2. The published record — NO: nothing is published, signed or amended by it.
3. Saved data — NO: nothing new is stored; a save through "+ Medical" is the window's existing save.
4. A shared drawer — NO: the medical card is drawn by ONE builder on ONE surface (roll-call below).
5. A new gesture or control — **YES**: the "+ Medical" button.
6. A new surface — NO: the Medical tab exists; its cards change shape.
7. Roles — NO: the button opens the same seed as "+ Input" (`newInputSeed`: the signed-in person); who may file for whom is
   the window's (D655), unchanged; `perms.ts` untouched.
8. The warning list — NO.

**Tier: WALK.**

## The roll-call

The thing: a medical card (`.medcard`) and the "+ Medical" door.

| Where | Shows the new card / door | Usable there | Painted on the same pixels |
|---|---|---|---|
| The Medical tab, Medically Down | YES — puck, then kind + period (walk A, B, C) | YES — opens the document viewer (e2e, walk A) | nothing else |
| The Medical tab, Pending Upchit | YES — "OML 6–9 Jul" (walk A) | YES — opens the viewer in its upchit context (unit test) | nothing else |
| The Medical tab, Upchit Complete | YES — "20 Jun" + one page a document (walk A) | YES — opens the viewer, "2 of 2" (walk A) | nothing else |
| The Medical tab's "as of" row | YES — "+ Medical" at its right end, 36 tall (walk A, B, C) | YES — mouse, finger, keyboard (walk A–D, e2e) | Today and the as-of button share the row at 375 (walk B) |
| The document viewer (`DocViewer`) | MUST NOT — it draws the document, not a card; it reuses no `.medcard` (grep) | — | — |
| The Inputs list / calendar / SANS pages | MUST NOT — they draw inputs as rows and bars; no `.medcard` (grep) | — | — |
| The input window opened by "+ Medical" | (the window, unchanged) | YES — opened over the Medical tab on screen, a press reaches it (walk A, B, C) | at the moment of a phone tap the test browser draws its own brief tap flash over the button's place (below) |

## The sizing step (§7.0)

1. **Type:** C (a new control) and E (the cards' layout on one surface).
2. **What only a walk could find here:** three cards actually standing in one row at 390 and 375; the row fitting "as
   of", Today and "+ Medical"; the window opening ON SCREEN on a phone from the new button; a save from the Medical tab
   leaving that tab in front with the new card; the keyboard's way; a typed remark not widening a card. The words on a
   card and the seed the button hands over are carried by unit tests.
3. **The ledger:** walks of a new control on one surface (C/E) found faults at the phone and in the order of actions;
   the comparable recent rows (16 Oct 26, Quals' one row, E) were the host alone, one scripted pass.
4. **The walk chosen:** the host alone, one scripted pass (`medical-walk.mjs`), 4 scenarios / 31 assertions: A) a member
   at 390 with real touch — Cancel, filing his own HL through "+ Medical" with a remark and a document, three a row, Undo,
   Redo, the two other sections, the upchit's documents; B) an admin at 375 — the row with Today showing, filing for
   another man, three a row; C) an admin on a 1440 desktop at his PC's 125% — the row, the keyboard (Tab, Enter, Escape,
   back on the button), a one-day card; D) a member on a desktop — the window his own. Carried by tests: the words of
   a card in every section (`medicalview.test.tsx` — through the real App, rendering real records; the words only, not
   a route), the seed's kind and person for both roles (`medicalview.test.tsx`, by a real click on `#medNew`), the
   button's geometry and keyboard way at both sizes and both roles (`e2e/medical.spec.ts`, real presses).
5. **The row** is added to `docs/walk-ledger.md` (17 Oct 26, `[MEDICAL-CARDS-3]`).

## The orders walked

| Order | Result | How |
|---|---|---|
| "+ Medical" → Cancel | PASS — nothing filed (49 → 49) | walk A |
| "+ Medical" → dates, document, remark → Save | PASS — window closed, one new input, Medical tab still in front, card "HL 12–15 Jul" | walk A, B, C |
| Save → Undo → Redo | PASS — the card goes, then comes back as it was | walk A |
| "+ Medical" (keyboard) → Escape | PASS — window closed, the keyboard back on "+ Medical" | walk C, e2e (4 sizes/roles) |
| Pick an earlier as-of date → the row with Today → Today | PASS — one row at 375, no overflow | walk B |
| Tap the upchit card → the viewer | PASS — "2 of 2" | walk A |

## Cases carried by a test

| Claim | Test | Through |
|---|---|---|
| Row 1 is the puck alone; row 2 "ATT C" + "10–14 Jul"; Pending "OML" + "1–5 Jul", no "was down"; Upchit Complete no kind, no "upchitted" | `medicalview.test.tsx` "D965 a card is the puck, then the kind and the period on one row" | the real App rendering planted records |
| One page drawing per document on file; none where none is on file; never in the other two sections | `medicalview.test.tsx` "D961 D965 an upchit draws one page a document…" | the real App |
| "+ Medical" opens the window with HL, the signed-in person, no date — admin and member | `medicalview.test.tsx` "D963 D965 …", by a click on `#medNew` | a real click |
| 36 tall, at the row's right end, mouse and keyboard, four sizes/roles | `e2e/medical.spec.ts` "D965 "+ Medical" opens…" | real presses in a browser |
| Three in one row at 390 and 375 | `e2e/medical.spec.ts` "D965 three medical cards stand in one row" | a browser (the third man filed by the page's test door — the walk filed him through the button) |

## The break tests

`node scripts/handpass/breaks.mjs scripts/handpass/breaks/2026-10-17-medical-cards.json` — 7 of 7 caught (unit tests).
A first eighth break — "a page drawn per document even with none on file" — stayed green: its guard (`docs &&`)
decided nothing, because zero documents already draw zero pages (reading 4 of `walk-scripts.md` §9); the guard was
removed and the break dropped from the list. Browser-only, proved red in the browser: the "+ Medical" row height
taken off the 36 rule and every card given a 130px floor, one build — all 6 `D965` browser tests failed; put back.

## Pictures

Opened by the host: `01` (member at 390, before), `02` (the window opened from the button), `03` (three a row, his card
with a remark), `07` (375 with Today), `08` (the admin's window), `11` (the keyboard on the button, desktop), `14` (the
desktop after a filing). The rest (`04–06`, `09–10`, `12–13`, `15`) are the steps' own records.

## Errors seen

None: no page error, console error or failed request in any of the four runs.

**Met in passing, not a finding:** in pictures `02` and `08` a dim blue rectangle lies over the window where "+ Medical"
was tapped. A probe showed what stands at that point is the window's own label (the button is NOT drawn above it), the
colour is the test browser's own tap flash (`rgba(51,181,229,.4)` — the app sets none), and a picture two seconds later
has no rectangle. It is the browser's brief flash of a tap, as on any tapped button in the app.

## What was NOT walked, and why

- A sideways phone / a 700px-tall window: the tab is not a viewport-tall column and the change adds one button to an
  existing row; the window it opens is unchanged and was walked short in its own job.
- A guest or pending session: neither reaches the Inputs page — a guest is given its own read-only app and a pending
  person the waiting screen (`ui/App.tsx`, `who === 'guest'`), unchanged by this job.
- His iPhone's own letters (Apple's font, wider than Windows'): the three-a-row margin at 375 is 37px (three cards of
  94–100 in 343); a real-device look is on his look card below.

## The code read (one fresh, blind Opus reader — D790; Fable not used, D903)

Given the change, the rulings and this sheet's roll-call; asked for absences. Five findings, each with its disposition:

| # | Finding | Disposition |
|---|---|---|
| F1 | A period across a month end ("ATT C 28 Jun – 2 Jul") is wider than a third of a phone's row: that row falls to two | Put to him with pictures (`docs/img/handpass/2026-10-17-medical-cards-r2/`, the page https://claude.ai/artifact/VZHvNS7f4n2kwxnQo7YbU6); **D967**: on a phone a card is at most a third of the row and row 2 wraps between its parts — FIXED, `e2e/medical.spec.ts` "D967 a long period…" (red without the cap, at 390 and 375) |
| F2 | A medically-down or pending card with two documents no longer said so on a phone (the pill went from every section; D965 gave drawings to Upchit Complete only) | Put to him; **D966** ("those with documents should show the document icon too"), **D967** (from two documents one drawing and the number, every section; one shows none) — FIXED, `medicalview.test.tsx` "D966 D967 …" |
| F3 | A screen reader did not hear the document count | FIXED — the group is `role="img"` named "N documents"; same test |
| F4 | A save from the Medical tab turned the Inputs and SANS calendars to the input's month, unseen | FIXED — `inputedit.tsx` `onMedTab` guards the reveal; `e2e/medical.spec.ts` "…leaves the Inputs calendar on its month" (red without the guard) |
| F5 | Many documents spilled past an Upchit Complete card | FIXED by D967's form — five documents read "▯ 5" (unit test) |

Observations the reader made and the host checked: the onClose (overlay) variant of the view is mounted nowhere; a guest or
pending person never reaches the tab; an as-of date in the past hides a new card but the "Input added" note still shows.
**Its own find, after the code read:** GitHub's Linux machine drew a card 107 wide where the PC drew 100, so the browser
test's fixed "≤ 104" failed there (run 38903508563, reported by the old merge chat): the test now asks for "at most a
third of the row" (D967), the rule itself, not a pixel figure (the reader had flagged the same test as font-bound).

## The fix read (one more fresh Opus reader, handed only the fix commits — the order's §5, "a fix is new code")

Last round (the cap on rounds is about three; this was the first). Three findings, each fixed with a browser test proved
red without its fix (`e2e/medical.spec.ts`):

| # | Finding | Disposition |
|---|---|---|
| R1 | Undo / Redo on the Medical tab still turned the Inputs calendar's month and left the reveal waiting (`state/undo-wire.ts`) | FIXED — the same guard as the save's; "Undo and Redo on the Medical tab leave the Inputs calendar on its month" |
| R2 | At 320 (a width the app tests) the third-of-a-row cap made a card narrower than its 74px puck, which ran into the next card | FIXED — a phone card is never narrower than its puck (D487); below about 351 two stand in a row; "…at 320 no puck leaves its card" |
| R3 | A period printed with its year ran past the capped card | FIXED — it breaks only at its dash, each date whole; "D967 a period printed with its year…" (the first version of this check proved nothing — it counted text pieces, not lines; rewritten and proved red) |

**Found while proving R3 — filed, not this change:** a medical input across New Year (28 Dec – 3 Jan) never shows on the
Medical tab at all — the calculation reads its end in its start's year. Older than this job; real for new data (not D56);
filed as `[MED-NEWYEAR]` in `OUTSTANDING.md`, its own fix after 524. Its test here uses a period in another year instead.

## The re-walk (what the fixes touched)

`HP_SHOTS=…/docs/img/handpass/2026-10-17-medical-walk/rewalk node scripts/handpass/medical-walk.mjs` — v3, the same four
scenarios plus: an admin at 375 files "29 Jun – 14 Jul" through "+ Medical" (the period under its kind, inside the card,
three a row), Upchit Complete reads "20 Jun ▯ 2", and on the desktop the Inputs calendar is on October before and after a
July filing. **32 of 32 PASS, 15 pictures, no errors.** Pictures opened: `rewalk/05` (Pending and Complete), `rewalk/09`
(375, the long period under its kind). The break list after D967: 10 of 10 caught (two entries rewritten for the new form).
**The fix read's three fixes came after the re-walk** and are carried by the browser tests named above: the Undo one presses the real "+ Medical", Save, Undo and Redo and reads the calendar's own month; the other two lay out the real tab at 390 and 320 (their records filed through the page's test door, as the drawing's were) — no surface, door or role the walk had not already operated; a 320 picture is not taken (the required sizes are 390 and the desktop).

## Gate counts

The whole set under the PC lock, on the build before the code read's fixes (`claude/sharp-goldberg-6d0656` at
`299ce550a`+): build clean · tfin 728 / 0 · unit 11581 / 11581 (651 files) · e2e 832 passed, 1 failed, 59 skipped · smoke
446 / 0 · rulecheck OK · docsize — one home missing (D962, restored the same hour). The one e2e failure: the Leave War
desktop timing test "the grid draws a window of months…" (`[LW-WINDOW-PRUNE-FLAKE-2]`; this job touches nothing of the
Leave War) — run alone under the lock, 1 of 1 (D84). After the fixes and D967 (D902 — a follow-up on an open pull request
runs the tests it touches; GitHub's run is its full check): **after every fix and D967, under the lock** — unit 11581 / 11581 (651 files) · e2e of the Medical tab and every Inputs screen (medical, inputs-calendar, inputs-batch2, feedback-marks, datecal, grouprow) 125 / 125 · docsize OK (records; sizes over, deferred — D29).

## What the walk found

Nothing in the app: 31 of 31 PASS, then 32 of 32 on the re-walk. One guard that decided nothing was found by the break
tests and removed; the code read's five findings are above.

## His look

1. On his iPhone, the Medical tab: three cards in a row in Medically Down (needs three men down — the demo has two; filing one through "+ Medical" makes three).
2. "+ Medical" at the right of "as of": tap it — the input window opens on HL.

`Walk: docs/handpass/2026-10-17-medical-cards.md · 30 pictures (15 + 15 re-walk) · 4 surfaces · 8 orders · MISSING: none`
