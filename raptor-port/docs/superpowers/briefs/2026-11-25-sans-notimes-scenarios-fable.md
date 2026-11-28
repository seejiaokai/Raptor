# Scenarios — a SANS man struck on a flying seat with no times yet (D2573)

Designer: fresh, blind (Fable). Read only inside `D:/raptor-work/c179-sc/copy`: `BRIEF.md`, `RULINGS.md`, `CHANGE.diff`,
the change's test, `src/engine/avail.ts` (the seat's rules, the SANS gate, the per-seat reason), and the callers of the
per-seat reason in `src/ui/palette-html.ts`, `src/ui/drag.ts`, `src/ui/highlights.ts`, `src/state/view.ts`,
`src/state/dropflag.ts`, the warning list's SANS check in `src/engine/validate.ts`, and the head of
`src/leavewar/sansunfiled.ts`. No other designer's or reader's output was opened. No handoff block appeared in my context.
I could not run the app; nothing below was observed, all of it is what the walk should look for.

## What the change reaches (the roll-call behind the scenarios)

The one changed answer — "why may this man not take this place" — is read by six things. Each needs its own look:

| Place it shows | Where | What should now happen on a flying seat with no take-off typed, SANS man, nothing filed |
|---|---|---|
| Crew list, a seat picked | Edit Schedule's crew panel; the Scheduler Board's crew list (the same drawing, without its heading) | struck, reason printed under his name, sorted last, left out of "SANS Avail · N free" |
| Crew list, no seat picked | both | unchanged: struck, no reason line (D2420) |
| Drag hover | under the dragged puck, target outlined amber | the reason |
| The drop's note | after a drag-drop, and after a tap on a name with a seat picked | the warning-style note "<callsign> — <reason>" in place of "<callsign> planned" |
| Green "where can he go" rings | after tapping a man in the crew list with nothing picked | no green ring on that seat |
| His own bell | Ranger's sign-in | unchanged; must now agree with the crew list |

"No times yet" in the code means **no take-off typed** (or one that does not read as a time). A take-off with no landing
is already a timed seat (the app assumes a landing), and a landing alone still counts as no times.

Two men are needed: **Ipman** (seed, SANS by tick, no date — reason "SANS — no availability filed for today") and
**Ranger** posted out as SANS from Fri 17 Jul (reason "SANS from Fri 17 Jul: no availability filed. File it on the Inputs
page's SANS tab."). If the seed does not already carry Ranger's posting, Saber saves it on Admin → Users (post out, SANS,
from Fri 17 Jul) before the walk.

## Scenarios, most likely to fail first

### S1 — The drop's note after a tap with a seat picked (the least-shared door)
- Surface: Edit Schedule's crew panel, tap-to-plan. Size: phone 402×874.
- Setup: `ad`/`a`. Sat 18 Jul: add a new flying line, type nothing in take-off or landing. Ranger SANS from Fri 17 Jul, nothing filed.
- Action: tap the line's front seat (the panel reads "Tap a name to plan"), tap Ranger in SANS Avail.
- Expected: Ranger lands in the seat (never refused — only a placeholder in a jet and a second copy on one row are refused); the drawer parks; a warning-style note reads "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." Source: D2573 "same reason as a timed seat"; as a timed seat does on main today.
- Disproves: the note says "Ranger planned"; or the drop is refused; or the note's words differ from the words under his name in S2; or the note is cut off on the phone.

### S2 — The crew list with a seat picked: struck, reason printed, counted out
- Surface: Edit Schedule's crew panel. Sizes: phone 402×874 and desktop 1536 (two pictures).
- Setup: as S1, before planting. Also note the "SANS Avail · N free" figure with nothing picked.
- Action: pick the blank flight's front seat; look at SANS Avail. Then pick its rear seat.
- Expected: Ranger struck, his reason printed under his name, each unfiled SANS man (Ipman and the other seed SANS men) struck with "SANS — no availability filed for today"; struck men sorted after free ones; "SANS Avail · N free" the same figure as with nothing picked. Rear seat the same for a pilot; a SANS WSO picked onto the front seat reads "WSO — cannot fly front seat" (the seat rule outranks). Source: D2573; the count and order as a timed seat on main (D1119).
- Disproves: any unfiled SANS man drawn plain or counted in "N free" once the seat is picked (that was the fault); a reason line running under the badge or off the panel at 402 wide (the long "SANS from…" sentence, five men at once).

### S3 — His reminder and the crew list agree (the promise itself)
- Surfaces: the bell's SANS reminder (Ranger) and Edit Schedule's crew panel (Saber). Size: phone for Ranger, desktop for Saber.
- Setup: S1 done — Ranger seated on the Sat 18 blank flight.
- Action: sign in `us`/`us`, open the bell. Sign in `ad`/`a`, pick the other seat of the same flight.
- Expected: Ranger's bell names Sat 18 (D2568); the crew list strikes him for that flight (D2573). Two surfaces that must agree.
- Disproves: the bell names Sat 18 while the crew list shows him plain; or the reverse.

### S4 — The same words before and after the times are typed, and after they are cleared again
- Surface: Edit Schedule's week and crew panel. Size: desktop 1536.
- Setup: blank flight on Sat 18, its front seat picked, Ranger nothing filed.
- Action: (a) read Ranger's line; (b) type take-off 13:00 and landing 14:00, pick the seat again, read; (c) clear both times, read; (d) type a landing only, read; (e) type a take-off only, read.
- Expected: the same sentence at every step, struck throughout. Source: D2573 "the same reason as a timed seat".
- Disproves: the strike or its words vanish or change at any step — (c) and (d) are the ones the old build got wrong.

### S5 — The drag hover and the drag's own note
- Surface: the drag hover, the drop's note. Sizes: desktop 1536 (mouse), phone 402×874 (touch drag).
- Setup: blank flight on Mon 13 Jul; Ipman nothing filed for Mon.
- Action: drag Ipman from the crew list over the blank flight's seat, hold, then drop. Then drag him from that seat to the other seat of a second blank flight.
- Expected: under the dragged puck "SANS — no availability filed for today", the target outlined amber; the drop goes through; the note reads "Ipman — SANS — no availability filed for today". Seat-to-seat drag the same. Source: as a timed seat on main; hover, list and note must agree (one answer feeds all three).
- Disproves: no words on the hover; a note of plain success; the drop refused; hover and note in different words.

### S6 — A man who has filed something is unchanged
- Surface: Edit Schedule's crew panel. Size: desktop 1536.
- Setup: Saber files SANS availability for Ipman for Mon 13 Jul on the Inputs page's SANS tab — three runs: (a) Fly, all day; (b) Fly, 08:00–12:00 only; (c) OFT only.
- Action: each time, back on Edit Schedule pick the Mon 13 blank flight's seat. In (b), then type take-off 13:00.
- Expected: (a), (b), (c) — Ipman plain, counted free, no reason, with the times blank (D2573 "a man who has filed something is unchanged"). In (b) after 13:00 is typed: "SANS — available 08:00–12:00 only" (as main). In (c) after times: "SANS — not offering Fly" (as main; D2575's new words are not built).
- Disproves: Ipman struck on the blank flight in any of the three; or the strike not lifting until the page is reloaded after the filing.

### S7 — Standby lines strike nobody for nothing filed, on screen
- Surface: Edit Schedule's crew panel. Size: desktop 1536.
- Setup: on one day, an SC line, an AVALON line and a BB line, each with its times cleared; the AVALON line also once ticked FLIES with times blank.
- Action: pick each MAIN seat and each SPARE seat in turn; read Ipman's line.
- Expected: Ipman not struck for SANS on any of them (D2576, D2578; standby stays as it is). He may be left off or struck for SC currency — that is its own rule.
- Disproves: any "SANS — no availability filed…" on a standby seat with no times.
- Not a finding: SC MAIN, or AVALON/BB ticked FLIES, **with** times still strikes him today (the brief; D2576–D2578 not built).

### S8 — Before his SANS date he is an ordinary man
- Surface: Edit Schedule's crew panel. Size: desktop 1536.
- Setup: Ranger SANS from Fri 17 Jul. Blank flights on Thu 16 and Fri 17.
- Action: pick the Thu 16 seat; then the Fri 17 seat.
- Expected: Thu 16 — Ranger in his own Pilots/WSOs column, plain. Fri 17 — under SANS Avail, struck, "SANS from Fri 17 Jul: …" (D2338/D2340, D2313).
- Disproves: struck on Thu 16; plain on Fri 17.

### S9 — The green rings for a selected SANS man
- Surface: Edit Schedule's week; the Scheduler Board. Size: desktop 1536.
- Setup: Mon 13 with one blank flight, one timed flight, one blank SC line. Nothing picked. Ipman nothing filed.
- Action: tap Ipman in the crew list.
- Expected: no green ring on the blank flight's seats (as on the timed flight's, main today); rings unchanged elsewhere (ground rows, duty desks, the SC line if he is current). Then file Fly all day for him (S6a) and tap him again: the blank flight's seats ring green.
- Disproves: green rings on the blank flight while the crew list strikes him for it; or rings not returning after the filing.

### S10 — The Scheduler Board's crew list
- Surface: the Scheduler Board's crew list. Sizes: desktop 1536, phone 402×874.
- Setup and action: S2 and S5 repeated on the Board (pick the blank flight's seat there; drag there).
- Expected: the same strike, words, count and note as in Edit Schedule (one drawing, two homes).
- Disproves: the Board showing him plain, or different words.

### S11 — An absence still outranks; a whole-day meeting no longer speaks first
- Surface: Edit Schedule's crew panel. Size: desktop 1536.
- Setup: (a) Ipman on leave all day Mon 13, nothing filed; (b) instead, a whole-day Meeting input for him, not on the Ground Programme, nothing filed.
- Action: pick the blank flight's seat.
- Expected: (a) the leave's own word, not the SANS sentence (absences outrank, as a timed seat). (b) the SANS sentence — before this change the blank seat said "already on Meeting…"; a timed seat on main says the SANS sentence first, so this is the intended order. Source: as a timed seat on main.
- Disproves: (a) reads the SANS sentence; (b) reads anything a timed seat would not.

### S12 — A cancelled flight with no times
- Surfaces: crew panel, the bell. Size: desktop 1536.
- Setup: Ranger seated on a Sat 18 blank flight; cancel the line. A second man's seat on it picked, if a cancelled line's seat can still be picked.
- Expected: Ranger's bell drops Sat 18 (D2568, a cancelled line never counts); the crew list, if the seat can be picked, strikes him as it does on a cancelled timed line (D2568: "the crew list still strikes a SANS man armed onto a cancelled line, as built").
- Disproves: the bell still names Sat 18; or a cancelled blank line behaving differently from a cancelled timed one.

### S13 — The strike lifts when he stops being SANS, and after Undo
- Surface: crew panel. Size: desktop 1536.
- Setup: blank flight seat picked, Ipman struck.
- Action: (a) on the Quals page an admin unticks SANS for Ipman, return, pick the seat; (b) for Ranger, take the posting back, return; (c) plant Ranger (S1) then press Undo.
- Expected: (a), (b) the man is in his seat column, plain; (c) the seat empties, the list as before, no stale note.
- Disproves: a strike left behind after either.

### S14 — Next week, and the usual words after his date
- Surface: crew panel. Size: desktop 1536.
- Setup: Ranger SANS from Fri 17 Jul. Step to the week of 20 Jul; add a blank flight on Mon 20.
- Action: pick its seat.
- Expected: Ranger struck with the same sentence the unpicked list's hover gives him that day (no seat picked and seat picked must use one sentence).
- Disproves: plain on Mon 20; or the picked-seat words differing from the hover words with nothing picked.

### S15 — A part-week filing
- Surface: crew panel. Size: desktop 1536.
- Setup: Ranger files (as `us`, on the Inputs page's SANS tab) Fly all day for Sat 18 only. Blank flights on Sat 18 and Sun 19.
- Action: as Saber pick each seat.
- Expected: Sat 18 plain; Sun 19 struck. His bell names Sun 19 only once he is seated there.
- Disproves: both struck or both plain.

### S16 — Publishing and the warning list are untouched
- Surface: the day's warning list, the seat's own puck on the week, publish. Size: desktop 1536.
- Setup: Ipman seated on the Mon 13 blank flight, nothing filed.
- Expected: no new warning line, no chip or amber ring on his seat's puck, the day publishes as before (D2579's amber line is not built — as main today).
- Disproves: any new line, chip or block to publishing.

### S17 — View-only Sched and a member's view
- Surface: View-only Sched; Ranger's own sign-in. Size: phone 402×874.
- Expected: no crew list, no strike, no reason shown anywhere to a member; the schedule's face for the blank flight unchanged.
- Disproves: any SANS sentence reaching a screen that has no crew list.

## Explicit negatives — checked in the code, expect nothing to change

1. **No seat picked** — the crew list's strike and its lack of a reason line come from a separate path the change does not touch (D2420).
2. **A sim row (OFT, AMT) with no times** — still not struck when its seat is picked (the build leaves it out on purpose). See question Q1.
3. **A man who is not SANS, and a placeholder** (ALL, ALL AVAIL) — the new check asks only a man who is SANS on that day; a placeholder is answered before it.
4. **A timed flying seat** — the earlier check answers first; the new one runs only where a time is missing.
5. **SC MAIN, SC SPARE, AVALON, BB with no times** — left out by name; the test holds every MAIN and SPARE seat.
6. **The warning list, the seat puck's marks, publishing, OIL** — the warning list's SANS check still stays silent for nothing filed and does not read the changed answer.
7. **The ALL AVAIL window and the crew list's fade for "already tasked"** — they read a different question (who is busy or away), not this one.
8. **A ground row, duty desk, all hands** — never asked for SANS availability (D2564); the new check is for flying seats only.
9. **The reminder's own count** — not changed by this build.
10. **The drop note telling a scheduler where to file** ("File it on the Inputs page's SANS tab.") now also shows on a blank flight for a man ahead of his date. D2420's reading left the picked-seat words "as built", so I do not raise it as a fault — but he will now see that sentence in one more place; worth showing him in the pictures.

Known disagreements between his bell and the crew list that this change does **not** close, none a finding here:
SC MAIN with no times (bell counts the day today, crew list plain — goes away with D2576); AVALON/BB ticked FLIES with no
times (the same, D2578); a cancelled line (bell silent, crew list strikes — his D2568 "as built"); a sim with no times (Q1).

## Questions his rulings do not settle

**Q1 — a sim with no times.** When: Saber adds an OFT box on Sun 19 Jul, types no start time, and picks its seat; Ranger,
SANS from Fri 17 Jul, has filed nothing. Today and after this build: the crew list shows Ranger plain and counts him free
for that seat, while his bell already names Sun 19 once he is in it (D2568 says a sim box counts before its times are
typed). D2573's words say "a flight". Should the OFT or AMT seat strike him too, as the flight now does? (My reading of
his aim — "so the crew list agrees with his reminder" — points to yes, but it is his call.)

**Q2 — a landing typed, no take-off.** When: Saber types a landing of 14:00 on a Sat 18 flight and leaves the take-off
blank. The build treats that as "no times yet": Ranger with nothing filed is struck (new), and a man who filed
08:00–12:00 is shown plain until the take-off is typed. Is that what he wants, or is a half-typed flight no different
from a blank one to him? (Likely no different; put only if the host thinks it worth a question.)

## For the host to run (I could not)

- If the app's test bridge is on in the build walked, in the browser console on Edit Schedule: `slotRules('<day>.<line>.0.0.p').slotStart` should be `null` for the blank flight, and `slotBar('ipman','<day>.<line>.0.0.p')` should return `SANS — no availability filed for today` — with `<day>` 0 for Monday and `<line>` the blank line's place in that day's flying lines.
- `npx vitest run src/engine/sans-notimes-strike.test.ts` — the change's own test.
