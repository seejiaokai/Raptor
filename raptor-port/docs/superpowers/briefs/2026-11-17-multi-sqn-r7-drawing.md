# Round 7's pictures — the drawing brief (chat 102, 17 Nov 26)

Four helpers draw round 7's pictures on the REAL running app, one group each (A Close, B DET, C planning each
other's people, D access, transfer and Admin). The words below are the spec: draw them exactly, letter for letter. If
the app makes a word impossible or wrong-looking, do not invent another — draw what is written and report it.

## Read first (each helper)

1. `.claude/skills/brainstorming/mockups-on-the-real-app.md` — the method and its traps, whole.
2. The design guide `raptor-port/docs/design-practices.md`: its §2 (words), and the sections its own checklist names
   for a card, a window or a list; invoke the `impeccable` skill for the new parts (D812, D813). A new part is built
   from the app's own parts (D1496) — clone a real neighbour; never a hand-made look.
3. The kit to start from: `raptor-port/docs/mock/2026-11-17-multi-sqn-r7/draw-q4.mjs` (Q4, Saber's row, the input
   window) and `draw-transfer.mjs` (the Post out sheet, variant F). Earlier kits: `docs/mock/2026-11-17-multi-sqn-r6/
   draw.mjs`, `docs/mock/2026-11-17-multi-sqn-r4/draw.mjs` (Admin → Squadrons, the place card, "+ Put people on it",
   the Close card `7-close`), `docs/mock/2026-11-17-multi-sqn-r3/draw.mjs` (round 3's picture 5, the OD input with its
   Detachment choice). Copy helpers whole; run them the way their header says.
4. The app is ALREADY BUILT AND SERVED at `http://localhost:4180/` from this folder (`C:\Users\User\projects\Raptor-msqn\
   raptor-port`). **Do not build, do not run `npm run build`, do not start another server, do not run any browser test
   suite** — another chat's gates share this PC. Only your own drawing script against 4180.

## Rules for every picture

- Two sizes each: desktop 1536×864 and phone 390×844, deviceScaleFactor 2 (the kit's SIZES). Name
  `R7<group><n>-d-proposed.png` / `-p-proposed.png`, or `-today.png` for a picture of the app as it is. Write them to
  `raptor-port/docs/mock/2026-11-17-multi-sqn-r7/img/` (the page's folder) and copy to `raptor-port/docs/img/2026-11-17-
  multi-sqn-r7/`. Your script: `raptor-port/docs/mock/2026-11-17-multi-sqn-r7/draw-r7<group>.mjs`, committed by the host.
- **Two mark colours (his D2159):** what he has already ruled (round 6's recommendations, now his D2160, D2161 and the
  earlier rulings) is drawn plainly, its place marked with a BLUE ring and tag `#0e7fa6` naming its id (e.g. "F19").
  What is new in round 7 — from the two reviews — gets the PINK ring and tag `#ff2d95`, "New · H6". A "today" picture
  for a question gets a pink ring with the question's id. Marks drawn on the element by the kit's `mq.mark` (outline +
  child tag), never laid over the page.
- The names (made up; demo people re-lettered as the earlier kits do): **149's** Hawk, Spur, Talc, Vane, Crisp, Moss
  (the six on the detachment), Gale, Jolt, Ace (an admin of 149); **142's** Saber, Viper, Ranger, Rune, Tally; **242's**
  Kite, Lark. **Exercise North** is 149's detachment, numbered **249**, open **13–31 Jul**, 7 hours ahead of home.
  Never "Sqn" after a number (D58).
- Look at every picture yourself before you report it (crop and zoom on the marked part). A picture that does not
  show the words below is not done.
- Report back: each picture's file names, one line on what it shows, and a list of everything you had to touch that
  this brief did not name (the guide's step 5). Keep the report short; no log output.

## Group A — Closing a detachment (rulings F15–F18, C2, C8, M7; new H1, H2, M2)

**A1 · The Close card, pressed Thu 23 Jul 14:00 home (21:00 at Exercise North).** Exercise North's row on Admin →
Squadrons (or wherever round 4's `7-close` drew the card) → "Close detachment" → the card, in the app's own card look
(as `7-close`). Title: **Close Exercise North?** Lines, numbered, in this order:
1. `Hawk, Spur, Talc, Vane, Crisp and Moss: their DET ends today, Thu 23 Jul (was 31 Jul). On 149's schedule from Fri
   24 Jul.` — blue "F15"; pink "New · M2" on "(was 31 Jul)".
2. `Exercise North's Fri 24, Sat 25 and Sun 26 Jul: cleared, and an amendment published on each. Later days, never published, are
   dropped.` — blue "F16".
3. `OIL taken back: Sat 25 Jul, 4 people 1 day, 2 people ½ · Sun 26 Jul, 6 people 1 day. Spur has already used his:
   his OIL goes to −1.` — blue "F17".
4. `Sat 25 Jul holds 242's RU (Kite, Lark): it moves to a wave of 242's own, same times, and 242's day goes pending for
   its scheduler.` — pink "New · H2".
5. `149's published Fri 24 – Sun 26 Jul go pending: the 6 are free there now, for 149's scheduler to plan.` — blue "C2".
6. `Gale was due from Mon 27 Jul: his DET is removed and he is told.` — blue "F17".
7. `Jolt is editing Sun 26 Jul.` — blue "F17".
8. `Kept under Past detachments.`
Buttons: **Keep open** · **Close detachment**. No amendment label anywhere on the card (C8).

**A2 · The same card pressed at 23:00 home, Thu 23 Jul (Fri 24 06:00 at Exercise North).** Lines 1, 2, 5 change; the
rest as A1:
1. `It is already Fri 24 Jul at Exercise North (7 h ahead): Fri 24 is kept. Their DET ends Fri 24 Jul (was 31 Jul); on
   149's schedule from Sat 25 Jul.` — pink "New · H1".
2. `Exercise North's Sat 25 and Sun 26 Jul: cleared, and an amendment published on each. Later days, never published, are dropped.`
5. `149's published Sat 25 and Sun 26 Jul go pending: the 6 are free there now, for 149's scheduler to plan.`
Draw only the card (crop to it), desktop and phone.

**A3 · 249's Sat 25 Jul after Close.** The detachment's schedule for Sat 25 (empty of lines, waves, programme rows and
duty desks). Where the four sign-off names stand on a published day, one line instead: `Cleared when Exercise North was
closed · Ace · Thu 23 Jul` — blue "F18". The day's menu (wherever the app offers Unpublish for a published amendment)
open, with **Unpublish** greyed and its reason under it: `Published when Exercise North was closed. Correct it with a
new amendment.` — pink "New · M7". An input row standing on the day, Hawk's `MED DOWNCHIT` row, stays — pink "New · H3"
(inputs are never cleared; they follow the man).

**A4 · Moving the detachment's "To" earlier.** Exercise North's dates on Admin → Squadrons, "To" changed from 31 Jul to
28 Jul → a question card in the app's card look: title `Shorten the 6 people's DET to 28 Jul?`, line `Hawk, Spur, Talc,
Vane, Crisp and Moss are on DET to 31 Jul.`, buttons **Keep to 31 Jul** · **Shorten** (Shorten the default) — pink
"New · M2". (Round 6's R4 already asks "Extend …" when "To" moves later; this is its mirror.)

## Group B — the DET input and where it shows (rulings D2146, F4, L1, R6; new M2(DET), M3, M4, M5, M6, M8, M16, H4)

**B1 · The DET input window** — round 3's picture 5 redrawn as the DET input (D2146 (7)). Inputs page → new input →
the kind **DET**. Fields: `Detachment` with a picker listing both squadrons' open detachments, showing `Exercise North
· 249 · 13–31 Jul` picked — blue "D2146"; `From` 13 Jul, `To` 31 Jul as whole days — **no All day box and no times**
(pink "New · M6" on the dates row); the person (Hawk); remarks. No OIL question (D2146 (2)). Under the dates, before
Save, a short list in the window's own list look: `On 149's schedule in these dates:` / `Sat 18 Jul · SDO desk
(published)` with two chips `Take him off` (selected) · `Keep` — pink "New · M2". Save.

**B2 · The same DET opened again after saving.** Its kind shown fixed (the kind control greyed), and none of OD's extra
doors: no `→ Ground`, no `CX` and no information-only mark, no Reject (blue "F4" on the place Reject would be, if the
app shows a scheduler's Accept/Reject there; else on the window's button row) — pink "New · M6" on the kind.

**B3 · 149's home schedule, Wed 15 Jul.** Under Unavailable, one row titled `Exercise North` with `DET` small under it,
the six names on it (or the row's own people look) — blue "D2146". They cannot be planned there (the app's own
"away" look).

**B4 · The Inputs page list (People list), several people filed with "+ Put people on it".** One DET per man, grouped:
a group heading `Exercise North · 6 people · 13–31 Jul` and six rows under it, one per man; Spur's row's "To" reads
`20 Jul` while the others read `31 Jul` — pink "New · H4" (a change to one man touches only his DET).

**B5 · The Leave War, 149, July.** (a) The six's cells on 15 Jul wear a DET mark of its own (clone the OD mark's look,
letters `DET`, its own colour from the Leave War's palette — say which you chose) — blue "D2146"; (b) the legend gains
`DET — on a detachment; still counts as manpower` — pink "New · M16"; (c) the day panel for 15 Jul gains a line `On DET
· 6` — pink "New · M3"; (d) the member's button row reads `CSE · OD · DET` — pink "Q14" (a question; drawn as
recommended).

**B6 · Leave for a man on DET.** Hawk bids leave on Wed 22 Jul (on DET). The bid window (and the approver's line, if one
picture can hold both) gains: `On DET · 249: 6 there, 5 with this.` — pink "New · M4".

**B7 · The bell, 249's and 149's schedulers.** Two lines in the bell's own look: `Spur · DET Exercise North · 13–31 Jul
· joining 249` and `Spur · DET Exercise North · ends 20 Jul (was 31 Jul) · back home 21 Jul` — pink "New · M8".

**B8 · Today, marked, for the questions.** (a) Insights' "not flying" list (one picture, desktop and phone), its list
ringed pink "Q16". (b) A count row's settings on the scheduler page (the row filter: seats, CATs, quals), ringed pink
"Q15". (c) The Leave War's days-taken table, its OD column ringed pink "Q19".

## Group C — planning each other's people (rulings F19, F20, F8, R9, D2149; new H6, L2, M12)

**C1 · 142's published Tue 14 Jul, Saber's automatic row** (draw-q4.mjs's `Q4N` rows). The row `ACADEMICS · 149` over
the small `ATTACH` (D2149) wears 149's grey badge and the time it was published by 149 — blue "F19". Beside it, faint
(the app's faint/pending look), 149's change not yet published: `15:00–17:00 · not yet published by 149` — blue "F19".
The cross-squadron people warning on 142's own 14:30 line for Saber reads: `Saber is still on 149's issued ACADEMICS
14:00 — it changes when 149 publishes.` — pink "New · H6".

**C2 · The input window from that row** (Q4NE's window) — `Set by 149's plan`, fields not changeable, no Save, its
Delete `Take him off ACADEMICS` with the line under it: `His seat is left empty; 149 is told. Until 149 publishes, he
stays on its issued ACADEMICS.` — blue "D2149" on the button, pink "New · H6" on the second sentence.

**C3 · Saber's own view, phone first.** His schedule, Mon 13 Jul: 149's published line he is on, read only, with 149's
badge, and the wave's reporting notes under it (the wave's own in-time / rally / remarks field as the app shows them,
e.g. `In 13:00 · Brief room 2`) — blue "F20", pink "New · L2" on the notes. His bell, open: `149 planned you · Mon 13 Jul
14:00` — blue "F20".

**C4 · The fourth sentence (F8).** 142's schedule, Mon 13 Jul: RU inside 149's wave (round 5's shared-wave look), the
grey line under the wave's title reading `RU changed · goes out when 149 publishes`, pending dots on RU's changed cells
(Tally in the seat Viper had) — blue "F8". 149's schedulers' bell line: `142 changed RU on Mon 13 Jul · publish to send
it` — blue "F8".

**C5 · Two schedulers on one shared line (R9).** 149's schedule, Tue 14 Jul: the editing mark on RU `Saber (142) –
editing Tue` — blue "R9"; 149's Publish card with its warning line `Saber (142) is editing RU.` and Publish still
pressable — blue "R9".

**C6 · The printed day (M12).** The print/PDF of a published day: today its title and heading read `142 Flying
Programme` / `142 — Flying Programme` on 149's schedule — picture `-today` ringed pink "New · M12"; the proposed one
reads `149 Flying Programme` / `149 — Flying Programme`. (Desktop only if the print view has no phone layout; say so.)

## Group D — access, transfer, Admin (rulings Q5, T, Q7, F13, D2147, P15; new L1, M1, M5(red), K2, H1, M4(red), K7)

**D1 · Admin → Users, Saber's access to 149.** Round 2's `2-B-142vo` redrawn: one choice only, `149 · View` (no
"as a scheduler") — blue "Q5".

**D2 · The transfer sheet** (draw-transfer.mjs variant F, Ranger to 149, Fri 3 Apr): the top line `On Fri 3 Apr: moves
to 149 as a member, with his sign-in, leave, OIL and inputs. His admin rights and his Scheduler, Management and SXO
ticks in 142 end.` — blue "T" on the sheet, pink "New · L1" on "Management and SXO". The lines under it start `Today:`
(D2147), as variant F draws them — blue "D2147". No rows of choices (T).

**D3 · The same sheet, Ranger 142's last admin.** Save greyed, and the line: `Ranger is 142's last admin. Make another
admin of 142 first.` — pink "Q10" (a question; drawn as recommended).

**D4 · Post out "Delete" (or Archive) for Viper, whom 149 has on its lines.** On the Post out sheet with a non-transfer
outcome, a line: `149 has him on 3 lines, 1–5 Dec: those seats are left empty and 149's schedulers are told.` — pink
"New · M5".

**D5 · Admin → Squadrons, the place.** (a) The place row (round 4's `8-place`) gains `Hours from home` with `+7` for
Exercise North's place — pink "Q8" (a question; drawn as recommended). (b) The place card's line reads `From tomorrow,
142 and 149 can plan each other's people.` — pink "New · K2" (round 4's card said "Once saved, …").

**D6 · The shared public-holiday list (M4).** Where the app keeps public holidays today: 149's admin types Fri 7 Aug;
before saving, a line in the app's warning look: `142's published Fri 7 Aug and 149's published Fri 7 Aug become
holidays after publishing: each needs republishing for its OIL. Both squadrons' admins are told.` — pink "New · M4".

**D7 · Today, marked, for the questions.** (a) Logic's full-day OIL setting (the value a published day keeps), ringed
pink "Q9". (b) A line's area field (typed text) on the schedule, ringed pink "Q11". (c) The Tracker's syllabus chart,
the control that deletes a ball, ringed pink "Q12". (d) A published day's four sign-off boxes, ringed pink "Q13".
(e) The Post out sheet's outcome chips, ringed pink "Q17".
