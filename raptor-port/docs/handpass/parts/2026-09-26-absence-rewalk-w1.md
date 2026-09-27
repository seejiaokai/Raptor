# [HUMAN-RETEST] the absence record — RE-WALK W1, the Inputs calendar (26 Sep 26)

**What:** the re-walk of W1's four findings (W1-F1 to F4) and the final reads' FR3, on the REBUILT app
(`http://localhost:4175`, bundle `index-KbvILaPW.js` — checked before the walk). Brief:
`docs/superpowers/briefs/2026-09-26-absence-rewalk-brief.md`; expected = register §12
(`docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`).
**Driver:** Chromium via Playwright, a fresh demo world per script, the app's own controls only; the finger is CDP touch
(`Input.dispatchTouchEvent` with touch emulation). Nothing was written through `window`.
**Scripts:** `scripts/handpass/ab/rw-w1-*.mjs` — copies of the first walk's scripts (their `AB_WHO` and results path
were hard-coded to the first walk's, so every script needed a copy; each change of premise or added check is marked
`RE-WALK`), plus new ones: `rw-w1-12-fr3-till.mjs` (FR3), `rw-w1-13-member-phone.mjs` (W1-F3 by finger — the first walk
never walked the member on a phone), probes `rw-w1-14` (a tap on a chip lying under the edit window's buttons),
`rw-w1-15` (a sideways flick from a chip), `rw-w1-16` (the corner readout). The first walk's scripts, pictures and logs
are untouched.
**Pictures:** `docs/img/handpass/2026-09-26-absence/rewalk/w1/`. **Results:** `docs/handpass/parts/2026-09-26-absence-rewalk-w1-*.txt`.

**Tally:** the five re-walked items — **5 PASS, 0 FAIL**, at both widths (and, for W1-F3, as the member at both widths).
Scripted checks: 120 PASS, 1 FAIL (the FAIL is NEW-1 below, not a re-walked finding). Console errors: none in any run.
**New evidence: 2 findings** (NEW-1 introduced by W1-F1's fix; NEW-2 older than this branch).

## a. The re-walked findings

| finding | what must happen now (register §12) | what I SAW | result | pictures |
|---|---|---|---|---|
| **W1-F1** — phone swipe pages the month | "The Inputs calendar on a phone: a sideways swipe pages the month" | **Phone, finger:** a 150 px swipe left on empty 8 Jul → **AUGUST 2026**, nothing else opened; right from August → July; a slow sweep (120 ms settle, 150 px) → August. The probe's events now run pointerdown → move → **up** (no pointercancel); the grid reads `touch-action: pan-y`. **Desktop, mouse (control):** 120 px left → August, right → July; a 40 px or mostly-vertical drag leaves the month. Also checked the fix did not break the finger drag: a held chip carried DOWN a row (20 → 28 Jul) and back UP lands both ways, no ghost; a vertical finger sweep on empty space pages nothing and opens nothing. | **PASS** (both widths) | `w1-05-06-swipe-left.png` (August on screen), `w1-03-swipe-left.png`, `rw-w1-05-drag-down-in-flight.png`, `rw-w1-05-drag-down-after.png`; events `…-rewalk-w1-06-phone.txt` |
| **W1-F2** — a finger's tap on a chip opens its edit once | "a tap on a chip opens its edit once" | **Phone:** a tap on Piston's chip (Mon 20 Jul) opens "Piston · Jul 20" and it stays. The probe's tap on Grit's chip in the MONDAY column (outside the window's box — the first walk's closing case): the tap's own click lands on the dim backdrop and the window **stays open**. The first walk's survey of every July chip: **33 of 33 stay open** (first walk: 10 of 33 shut at once), no input changed. Extended to six phone sizes (390×844, 375×667, 360×740, 414×896, 390×700, 412×915): 198 taps, 0 shut, 0 inputs changed; at four sizes the chip lay under the window's ALL DAY / AM / PM buttons (16 taps) and the tap's click **did not press them** — ALL DAY stayed chosen. No chip lay under Delete / Save at those sizes, so that exact case was not seen; the same click is eaten whatever it lands on. **Desktop, mouse (control):** a click opens the window normally. | **PASS** (both widths) | `w1-05-09-tap-chip-edit.png`, `w1-06-probe-tap-phone.png`, `w1-06-probe-tap-desktop.png`, `rw-w1-14-under-PM-390x844-2026-07-17.png`; `…-rewalk-w1-07-phone.txt`, `…-rewalk-w1-14-under-button.txt` |
| **W1-F3** — a member's calendar and another man's chip | "A member's calendar does not lift another man's chip, and an input he may not change opens READ ONLY — no Delete, no Save, 'Only {callsign} or an admin can change this.'" | **Desktop (Ranger, filter widened to everyone):** dragging Tally's chip on 24 Jul — **no ghost, no lit day**, it stays, no refusal needed. A click opens "Tally · Jul 24" with Type / When / Remarks, **no Delete, no Save**, a **Close** button and the line **"Only Tally or an admin can change this."**; the fields are inert (typing into Remarks does nothing). Control: his OWN chip (9 Mar) opens with Delete and Save. The Inputs table (same filter) shows no controls on other men's rows — the two doors now agree. **Phone, finger (new — not walked in the first walk):** the same — Tally's chip does not lift under a 260 ms hold and carry; a tap opens it read only with the same line and it stays open; his own Appointment (16 Jul) opens with Delete and Save. | **PASS** (both widths) | `w1-08-other-in-flight.png`, `w1-08-other-tap.png`, `w1-08-own-tap-editable.png`, `rw-w1-13-other-finger-tap.png`, `rw-w1-13-own-finger-tap.png`, `w1-09-member-table-all.png` |
| **W1-F4** — a noon leave prints 12:00 in the war's tap list | "A leave filed from 12:00 prints 12:00." | Comet, LL 12:00–14:00 on 24 Aug with a morning bid beside it; the war's day list: **"LL — local leave, 12:00–14:00 · filed on the Inputs page"**, under it the "<LL … morning · bid, not decided yet". Same words at 1440 and 390; the Inputs page's row reads 12:00–14:00 too. The half is still the afternoon (box "LL>"). | **PASS** (both widths) | `w1-10-noon-taplist.png`, `w1-10-noon-taplist-phone.png` |
| **FR3** — a DRAGGED input's "till / on" follows its dates | "A re-dated input too — a calendar drag … rewrites the token and keeps the other words; a remarks-only edit keeps what was typed" | Filed through the Inputs form (the picker writes "till 14 Jul", then "Bali" typed after it). **Leave** Vandal 13–14 Jul "till 14 Jul Bali", dragged to 15–16 → **"till 16 Jul Bali"** — on the Inputs page's Remarks column, on Wed 15 and Thu 16's Unavailable row (Edit Schedule and View-only Sched), and Mon 13 no longer lists him. One Undo → back to 13–14 and "till 14 Jul Bali" (Monday's row too); Redo → 15–16 and "till 16 Jul Bali". **One day with "on"**: Drifter "Dentist on 15 Jul" dragged to Fri 17 → **"Dentist on 17 Jul"** (Inputs page and Friday's Unavailable row). **Medical**: Hunter OML 14–15 "till 15 Jul fever" dragged to 16–17 → **"till 17 Jul fever"** (Inputs page; Thu 16 Edit Schedule; Fri 17 View-only Sched); nothing in its way, so nothing was asked. **Controls:** a remarks-only edit to "till 30 Jul Bali — back early" is kept exactly as typed; a remark with no token ("Wedding") stays "Wedding" after a drag. Same at 390 by finger. | **PASS** (both widths) | desktop: `rw-w1-12-desktop-leave-inputs-row.png`, `…-leave-unav-work-wed.png`, `…-leave-unav-view-wed.png`, `…-on-unav-work-fri.png`, `…-med-unav-view-fri.png`, `…-leave-remarks-only-edit.png`; phone: the same names with `phone` |

**Re-run as controls, still right on the rebuilt app (no change expected):** CSE / OD leave a bid alone (H1), leave
onto a course (Q8), hold-to-add exactly that date (C3), a tap opens the popover, "+1 more", N1 (noon is the afternoon;
11:00–12:00 the morning; the overnight tail), the finger drag onto a bid (told, "!" on the war), a refused finger drop
leaves no ghost, finger hold-to-add, a chip held and let go in place does nothing, the member's own bid replaced with a
message and no notice (B6) and his Undo, the member's hold-to-add, Q14 inside / outside the window and with bidding
CLOSED, a reload, Edit Schedule's top-bar Undo / Redo of a calendar move — all PASS (`…-rewalk-w1-03-desk.txt`,
`…-05-phone.txt`, `…-08-member.txt`, `…-10-desk.txt`).

## b. New evidence

**NEW-1 — on a phone, a sideways swipe that starts ON a chip opens that chip's edit window (and does not page the
month).** Introduced by W1-F1's fix: before it, the browser took any sideways finger and cancelled the pointer, so the
gesture did nothing (the first walk's FLICK-CHIP left no window open — its next step, the swipe, found the month
clear and read "dialog: none"). Now the sideways movement reaches the calendar, and
the chip's wobble rule re-bases its start point on every small move, so a steady swipe made of small steps (under the
26 px give-up distance each — a real finger reports moves at 60–120 a second) ends "where it last was" and is read as
a TAP on the lift (`src/ui/caldrag.ts` onPointerMove → onPointerUp). Reproduced 5 of 5 in a fresh world: 130 px left
from Vapor's chip (Mon 20), from Gambit's (Thu 16, quick and slow), 130 px right from Grit's (Tue 14), and a short 60 px
from Gambit's — each opened the chip's edit window; month unchanged; nothing written.
Steps (fresh world, 390 × 844, a finger): Inputs → Calendar view → ‹ to July 2026 → put a finger ON Gambit's chip in
Thu 16 Jul, sweep 130 px left, lift → "Gambit · Jul 16" edit window open, still July.
Rule: register §12 "a tap on a chip opens its edit once" / Fable S15 — a flick is not a tap (the first walk's own check:
"a quick sideways flick that starts on a chip never lifts it", and nothing was left open then).
Who it hurts: a phone user paging the month whose thumb starts on one of the small chip bars (the busy weeks are full of
them) gets some man's edit window instead of the next month — it carries Delete (no confirm), though pressing it takes a
second, deliberate tap. Nothing changes by itself. Chromium touch emulation — his own phone should confirm.
Pictures: `rw-w1-05-flick-chip-after.png` (Piston's window after the flick), `rw-w1-15-thu-chip-left-onscreen.png`;
events `…-rewalk-w1-15-flick-phone.txt` (pointerdown → move → up → "DIALOG open", no click).

**NEW-2 — the drag DIAGNOSTIC readout switches itself on when a person pages the Inputs calendar back five months.**
A green-on-black strip "DRAG #0 / PD 0 MV 0 ARM 0 / NAT 0 CAN 0 BLUR 0 / PU 0 EFP — DROP —" spreads across the top 82 px
of the screen, full width, over the calendar's month title and arrows (the arrows still work — the strip lets presses
through — but "MARCH 2026" is barely readable under it), and it STAYS: on the Inputs list page after the calendar is
closed it darkens the whole top bar; only a reload clears it. Cause: `src/ui/dragdbg.ts` arms the readout on five taps
within 2.5 s in the screen's top-left 64 px corner (its secret switch for a browser with no address bar) — and the
calendar's own "previous month" arrow sits in that corner (desktop 16,10 44×44; phone 10,8 44×44). Reproduced at both
widths, admin and member: five presses of ‹ at a normal pace (one every 350 ms), September → April, switch it on.
**Older than this branch** — the first walk's member pictures already carry it (`w1/w1-08-other-in-flight.png`), it was
not reported then; not filed in `OUTSTANDING.md` (searched "dragdbg", "readout", "five-tap", "top-left corner").
Steps: Inputs → Calendar view (opens on Sep 2026) → press ‹ five times in quick succession → the green strip appears.
Who it hurts: anyone looking back at earlier months (a member reaching his March leave does exactly this) — the page
looks broken, and the strip rides over every page until a reload. Pictures: `rw-w1-16-corner-phone-a.png`,
`rw-w1-16-corner-desktop-a.png`, `rw-w1-16-corner-desktop-m.png`, `rw-w1-16-corner-desktop-a-list.png`; results
`…-rewalk-w1-16-corner.txt`.

**Recorded, not findings:**
- The read-only edit window (W1-F3's fix) LOOKS like the editable one — the Type box, the When buttons and Remarks are
  drawn as live controls; only the footer line and the lone Close say it cannot be changed (`rw-w1-13-other-finger-tap.png`).
  They do nothing when pressed. A look question, not a defect of the register's line.
- A medical in the week's Unavailable row carries no LATE mark where a leave filed the same minute does ("LATE till 16
  Jul Bali" vs "till 17 Jul fever") — as the Inputs table already shows; not looked into further.
- A refused bid's banner prints the raw date ("Comet 2026-08-27") — `[LW-ISO-DATES]`, filed.
- The first run of `rw-w1-12` chose one free man for all four scenarios (a fixture mistake in the script, fixed by
  choosing per scenario); its two FAILs were the script's, the re-run is the record.

## c. Not walked, and why
- A chip lying under the edit window's **Delete** or **Save** (the first walk's predicted worst case): at none of six
  phone sizes did a demo chip sit there; the same eaten click was seen over the window's own buttons (ALL DAY / AM / PM).
- The calendar's vertical scroll on a phone: at 390 × 844 the month fits (the grid is not taller than the screen), so
  the vertical sweep was checked only for "pages nothing, opens nothing".
- iOS Safari (Chromium only) — NEW-1 and W1-F1 / F2 should be seen on his own phone.

## d. Console errors
None in any run (every `console-errors` check PASS; every probe's `errors` empty — desktop, phone, member, six phone sizes).
