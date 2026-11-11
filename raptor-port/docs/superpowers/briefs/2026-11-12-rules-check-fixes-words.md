# The rules check's fixes — every sentence changed, 12 Nov 26

[RULES-CHECK-FIXES], jobs 2 and 3, branch `claude/rules-check-fixes`. Every sentence the nine rule fixes and the words job
changed, where it shows, its old and new words, the ruling, and whether the words are his ("ruled words") or the agent's
("new, his to change"). The owner's morning page is made from this file. Commits: `facb81d5a` (the crew list, D1996),
`5a8b1b332` and `83b9b15e3` (the words).

## The crew list (D1996) — no new words

A man on a standby shift that flies, with a lecture, Meeting or other input inside it, is now crossed out in the crew
list as on a sortie ("already on LECTURE 09:00–10:00"); while the shift only stands by he stays clear. The crew list's
existing look; nothing new on screen.

## Ruled words, built exactly

1. **The amber line, a PH set after publishing (D2003).** Old: "This day started earning OIL after it was published —
   publish it again so the OIL lands". New: "Publish this day again so OIL is earned. The PH was set after the day was
   published." Heading unchanged. — ruled words
2. **The amber line, a PH removed after publishing (D2004).** Old: "This day stopped being a holiday after it was
   published — publish it again to withdraw the OIL". New: "Publish this day again to withdraw the OIL. The PH was
   removed after the day was published." Heading unchanged. — ruled words
3. **The duty-template sheet, the AVALON and BB notes (D1994).** Old tail: "…and earns no OIL on a weekend or holiday."
   New tail: "…and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated." — ruled words
4. **"Pays" (D2000).** No string a person sees in the app used pay, pays or paid of OIL — every hit was a code comment,
   and the Logic page and OIL Earn's messages were already pinned against pay words by a test. The rules check's report:
   "before it pays" → "before OIL can be earned"; "which version pays" → "which version earns"; the same heading in the
   review's results-8 file, its worklist and the family 8 test's header; `ui-contracts.md` "pays / money" → "earns OIL /
   credit". — ruled words

## New words, his to change

### The Logic page, F5–F11 (the report's suggested words; a semicolon turned to "but" or a full stop by the writing guide)

| Line | Old | New | Ruling |
|---|---|---|---|
| F5, crew-rest fold | "…his in-time, his B where no in-time is typed, or anything earlier, such as a meeting." | "…his in-time or rally, his B where neither is typed, or anything earlier, such as a meeting." | F5 |
| F6, crew-rest fold | "An SC SPARE carries no crew rest either way, and a shift's start is its report." | "An SC SPARE standing by carries no crew rest either way, but one that flies carries it as any flyer does. A shift reports at its start, or at its B or R where one is earlier than the start." | F6; the second sentence D606, D1041 |
| F7, tight turn | "…but his typed in-time is later, so it clears." | "…but his in-time or rally, or his B where neither is typed, is later, so it clears." | D1988, D1989 ("or rally" added, "his B" to match F5) |
| F8, OIL fold | "…from its B or R (the earlier) to its END." | "…from its B or R if earlier than its START, otherwise from its START, to its END." | F8 |
| F9, OIL fold | "A row with no times, or no end time, earns nothing." | "A row the scheduler adds with no times, or no end time, earns nothing, but a request answered yes earns over its own times." | F9 |
| F10, ground crew | "…checked only for clashes, the long day and days in a row." | "…checked for clashes, the long day, days in a row and their own absences, and a front seat is always a warning. None of the flying rules apply to them: crew rest, turns, pairing, AAR, SC currency or briefs." | D1992 |
| F11, AAR | "…an instructor in the back seat… That clears the front seat's currency warning; an instructor without the mark is flagged instead." | "…an instructor pilot (IP, IR or FI) in the back seat… That clears the front seat's currency warning, but an instructor pilot without the mark is flagged instead." | F11 |

### Other sentences the nine fixes made untrue

| Where | Old | New | Ruling |
|---|---|---|---|
| Logic, In-time lines | "On an In-time line the first clock is used (09:00H or 0900); a line that says RALLY still counts as a rally." | "A formation's rally is its R box alone. An In-time line is an in-time whatever its words, even one that says RALLY, and its first clock is used (09:00H or 0900)." | D1995 |
| Logic, In-time lines | "RALLY AFTER IN TIME, with no clock, means rally at that formation's in-time." | "A line with no clock, RALLY AFTER IN TIME included, sets no time." | D1995 |
| Logic, an unreadable In-time line | "The app cannot read an In-time line, or RALLY AFTER IN TIME has no in-time." | "The app cannot read the clock on an In-time line." | D1995 |
| Warning list, an unreadable In-time line | A "RALLY AFTER IN TIME" line whose clock cannot be read: "…rally after in-time has no applicable in-time clock." | "…reporting line N has no recognised clock. Check the time." (the family's existing words) | D1995 |
| Logic, the SC MAIN clash advisory | — | adds "Once the shift flies, every clash with it is red." | D1996 |
| Logic, the "SC MAIN clashes" setting | — | adds "Once his shift flies, every clash is red." | D1996 |
| Logic, a standby row that flies | "checked as an SC MAIN is" | "checked as a sortie is" | D1996 |
| Logic, take-off = landing | "…; a standby shift with no length earns none, flying or not." | "…none if it has neither. A standby shift with no length earns none. One that flies with its R or B before its START earns from that time." | D1999 |
| The amber same-time note, on a flying shift that earns | "…one of the two is wrong; the day still earns from the report and debrief" | "…one of the two is wrong; the shift still earns from its R or B" | D1999 |
| Logic, crew-rest fold | "A flight ends at landing plus the debrief (2h); anything else at its written end." | "A flight ends at landing plus the debrief (2h), or at take-off plus the debrief where the landing is not a time. Anything else ends at its written end." | D1990 |
| Logic, OIL fold | "A flight runs from its in-time (or Default rally…, where neither an in-time nor a rally is entered)…" | "A flight runs from its in-time or rally, whichever is earlier (Default rally before take-off where neither is entered), to landing plus the debrief." | D592, D1995 |
| Logic, OIL fold | — | new line: "Until its wave flies, a desk made from an AVALON or BB template earns only if switched on in OIL Earn. Once the wave flies, the desk earns by default." | D1997 |
| The template notes, head | "The AVALON desk — checked only for…" | "The AVALON desk — until the AVALON flies, checked only for…" (BB the same, "until the BB flies"); his D1994 tail follows unchanged | D1997 |

A fresh reader read every new wording cold; the two lines it found read two ways (the F6 shift report, the desk line)
were reworded and are shown here as built.

## Two not built — his words wanted

**1. "On leave + flying" on a row that is not a flight.** Case: Ratchet, ground crew, on local leave all Tuesday, put on
a 09:00–10:00 BRIEFING row — and anyone on leave seated on a duty, sim or ground row. Today: the title "On leave +
flying" (its message already says "On leave but tasked — BRIEFING"). Shows as the line's title in the day's warning list
and the check's name on the Logic page. Its twin "Downchit + flying" has the same fault and would change with it.
- A, one title for every seat: "On leave + planned" (and "Downchit + planned").
- B, the title follows the seat: "On leave + flying" on a flight, "On leave + on the programme" (and "Downchit + on the
  programme") anywhere else.

**2. "landed" where no landing is typed.** Case: Monday's VL typed take-off 12:00, its landing blank or "TBD" — since
D1990 that day ends at take-off plus the debrief, and Tuesday's crew rest is measured from it. Today: "Mon landed 12:00,
+2h debrief assumed → ended 14:00 → crew rest clear at 02:00". Shows in the crew-rest warning's message and the same
sentence on the "breaks tomorrow's crew rest" trace.
- A: "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00"
- B: "Mon's landing is not typed, so its 12:00 take-off is used, +2h debrief assumed → ended 14:00 → crew rest clear at
  02:00"

## Parked for him

- D1994's "Switch it on in OIL Earn if activated" beside D1997 (once the wave flies the desk earns by default): kept his
  words, "until the AVALON / BB flies" put in front — what "activated" means is his to confirm.
- His D2003/D2004 words: the cold reader found "so OIL is earned" does not say whose OIL, and "withdraw" stiff — ruled
  words, left.
