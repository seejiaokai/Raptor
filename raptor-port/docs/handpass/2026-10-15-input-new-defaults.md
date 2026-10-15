# Bug check — `[INPUT-NEW-DEFAULTS]`: a new input opens on OL (D917), the title's pencil (D918, D919), When and Remarks above the calendar (D920)

Branch `claude/input-new-defaults`, build commit `c23ca1a46`. Drawn first for him (D853): the page
https://claude.ai/artifact/BQa1WwKjmu62kgNv2FA4op (`docs/mock/2026-10-15-input-new-defaults/`); his answer "All as
recommended" — P1 and A.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — no rule or figure changes; a saved input's kind is what the window shows at Save, as before. OL never earns and is never asked (D804), as before. |
| 2 | Published record | NO — an input filed on a published day takes the path every input takes; nothing in it changed. |
| 3 | Saved data | NO — no stored field added or changed; only the window's starting value. |
| 4 | A shared drawer | **YES** — one form (`ui/inputedit.tsx` InputEditor) is drawn from the Inputs page, a day, a run, SANS "+ Commitment", the board's Personal / Ground and Unavailable adds, the upchit, a shared input's row (D748). The order and the pencil reach all of them. |
| 5 | A new gesture or mode | NO — the pencil is a drawing; a tap on it is a tap on the box (walked). |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the pencil reads the window's existing read-only state; who may change an input is untouched (`state/perms.ts`). |
| 8 | The warning list | NO. |

**Tier: WALK.**

## 2. The rulings swept

D917, D918, D919, D920 (the job); D913, D916 (the calendar stays showing — kept); D716 (only commitment kinds take a
title — the box and its pencil show only there); D655, D658 (a member never files leave for others — the "Several
people" switch stays hidden for a member while OL is picked, as for any leave: unchanged, told to him); D729 (the
List's "+ Input" opens with no date — kept: "pick a start date"); D797 (where the dates are what the form is for the
calendar stays inside it — kept, below Remarks now); D364 (another's input read only, its fields as values — kept);
D487 (no button resized — the pencil is not a button); D853, D921 (pictures first — done). No clash.

## 3. The roll-call — every place the input's window is drawn

| Place (door) | Opens on | Title box + pencil | When / Remarks above the calendar | Walked / carried |
|---|---|---|---|---|
| Inputs List "+ Input" | OL — has it | none on OL — must not (D716) | has it | W1 both sizes; `inputnewdefaults.test.tsx` |
| A day on the Inputs calendar, its "+ Input" | OL — has it | as above | has it | W2 both sizes; unit |
| A run of days on the Inputs calendar | OL — has it; the run's dates kept | as above | has it | W3 both sizes |
| A new input switched to a commitment kind (Event) | — | has it: inside the box, its grey, a tap lands in the box | has it; Remarks in sight on a phone | W4 both sizes; unit |
| A saved input reopened (his own) | keeps its kind — must not change | has it | has it | W5 both sizes; unit |
| Another man's input, read by a member | keeps its kind | box drawn as a value, no pencil — must not | no calendar on a read-only one-person input (as before) | W6 both sizes; unit (red without its guard) |
| SANS "+ Commitment" | SANS availability — must not be OL | no title box — must not | has it: Availability, When, Remarks above Dates | W7 both sizes |
| Board "+ Add", Personal / Ground (`.g`) | first commitment kind — must not be OL | has it | no calendar here (as before) | W8 both sizes |
| Board "+ Add", Unavailable (`.u`) | first absence (LL) — unchanged | none (leave) | has it | W9 both sizes |
| Upchit from the Medical card (`up`) | upchit — unchanged | none — must not | its one date box keeps its place (not a calendar) | not walked: no line of it changed; its date box is above the moved block, by the code read |
| A shared input's window from the schedule's row (D748) | keeps its kind | has it (its reader may change it) / none (read only) | has it where its calendar shows (D681) | carried: the same form, W5 and W6 cover both states; not walked separately |

## 4. Sizing the walk (§7.0)

1. **Type:** D (one form drawn from several doors) and E (layout: the order, the pencil's place).
2. **What only a walk could find:** a door that seeds its own kind (the board's, SANS) and would wrongly take OL or not;
   the pencil's real place and colour and a real tap on it; whether Remarks is in sight on a phone; the read-only face.
   The unit tests cover the seed, the markup and the order in jsdom; no layout.
3. **The ledger:** type D/E walks of 13–15 Oct 26 (the host alone, one script as assertions) found 0–2 faults each, cheap.
4. **Chosen:** the host alone, one script (`scripts/handpass/ind-walk.mjs`) on the built bundle, desktop 1440 × 900 by
   mouse and phone 390 × 844 by touch, every door in the roll-call that a control reaches; 33 checks a size.
5. **Row added:** `docs/walk-ledger.md`, 15 Oct 26.

## 5. The walk

**66 of 66 checks pass**, both sizes, no page error, no console error, no failed request
(`node scripts/handpass/ind-walk.mjs both`). Pictures: `docs/img/handpass/2026-10-15-input-new-defaults/walk/` —
20, all looked at. Measured: the pencil 34 px wide inside the box at its right edge (0 px gap), the box the field's full
width (398 of 398 desktop, 326 of 326 phone), right padding 36 ≥ 34, colour equal to the field label's; a tap at the
pencil's centre leaves the caret in the title box with the kind's name selected; a 45-letter title is held at the box's
40 (its own limit, as before) and stops short of the pencil. Event on a phone: Remarks wholly in sight above the
Cancel / Add bar (it was under it before — the drawing's measurement).

**Seen, not a fault of this change:** on a phone the board's Unavailable add is a box that scrolls inside itself
(content 814, box 673) — Add is one swipe down, as before the change (its height did not change, only the order).

**The script's own corrections while writing it (not app faults):** the List's calendar opens on the demo clock's July,
not October; the store keeps inputs newest-first, so a new one is found by its id; the box's 40-letter limit; a member
cannot write another man's input even through the test helper (the store refuses — right), so W6 files it as the
admin, signs out and signs in as the member; a member's day opens filtered to his own, so W6 presses "Clear filters".

## 6. Break tests

- **Browser:** `--break` knocks the pencil out of its place (`position:static`) — W4 RED at both sizes
  (`docs/img/handpass/2026-10-15-input-new-defaults/walk-break/`). A first break, letting the pencil take presses
  again, stayed GREEN — rightly: the box sits inside its `<label>`, so a tap on any part of it lands in the box; the
  pencil's pointer-events rule is a second guard, not the only one.
- **Unit:** `inputnewdefaults.test.tsx` — 8 of 12 red on the old code for the reason they test (the OL seed ×3, the pencil ×2,
  the order ×3 — counted by the reader; a ninth, the read-only test, failed then only on its first way of opening the input); the read-only test red with its
  `!readOnly` guard taken out, green with it back.

## 7. What was NOT walked, and why

- The upchit's window (Medical → a pending card) — no line of it changed; its one date box stands above the moved block.
- A shared input's window opened from its schedule row — the same form; its two states (may change / read only) are W5, W6.
- His iPhone's own font (wider than the test browser's): the pencil never moves; a title's words stop short of it and
  scroll inside the box. Only his phone proves it — his look.

## 8. The code read (D790 — one fresh, blind Opus reader)

A fresh, blind Opus reader read commit `c23ca1a46` with this sheet's questions (every door's starting kind; OL's
effects downstream — the Several people switch, all day, OIL, clashes, the "till" tail, where a save files; anything
that leaned on the calendar block's place; the pencil's wrapper against every style and the read-only face; whether
the tests are real). **No defect a person would hit.** One low finding, FIXED: a stale comment over the Inputs
calendar's add door still said its seed was the board's "same defaults" (`ui/InputsCal.tsx`) — reworded to say this
door opens on OL and the board's keeps its kind (D201). One pointer, carried by the gates below: five browser tests save
a new input on the window's start without picking a kind — they now save an OL; the full browser run decides it.
Sound, by the reader: only two callers of the seed (the List, the calendar's openAdd — a day, a drag, the keyboard
run); the board, SANS, the upchit and saved inputs keep their kinds; a member on OL sees no "Several people" switch
until he picks a commitment kind (D655 — told to him); nothing depends on the calendar block's place; the read-only
style still strips the box's padding; `readOnly` is the same fact the form's inert uses; 29 related unit files green.

## 9. The gates

15 Oct 26, this branch at `c23ca1a46` (the reader's comment fix after it is a comment only), the whole set under the
PC lock in one run (`gatelock.mjs run`): build clean · tfin 728 / 0 · unit 11473 / 11473 (644 files) · e2e 820 passed,
0 failed, 59 skipped — the five browser tests the reader pointed at among them, green · smoke 446 / 0 · rulecheck OK ·
docsize OK (records). **WHOLLY GREEN.**

## 10. Closing lines

`Walk: docs/handpass/2026-10-15-input-new-defaults.md · 20 pictures · 9 surfaces · 2 sizes · MISSING: none`
`Docs: OUTSTANDING 191 items (+2 −2, −2 all in ARCHIVE) · DECISIONS D1–D923 (new: D919, D920, D921, D922, D923) · homes OK`
`docsize: OVER by 3388, deferred (D29)`
His look: on his iPhone — the pencil in an Event's title box, and an Event's window with Remarks in sight.
