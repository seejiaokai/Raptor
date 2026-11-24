# Words pass, round 4 — the draft words (chat 163, 24 Nov 26; D2520)

Drafted by the chat that will build them (Fable). To be adjusted by a different, fresh Fable helper (D2441) before
anything reaches him; nothing is built. Method: `../../design-practices.md` §1, §1a, §1b. Each item gives the case,
today's wording exactly as the code prints it, the draft, the words cut / added / swapped (§1a test 8), and the facts
the wording must still carry.

"Undone" is his word wherever an Undo is meant (D2423). The bell lines an Undo leaves behind are another job
(`[BELL-WORDS-CLEAR]`) and are not in this round.

## How a bell line is laid out today (his D769 — not changing)

Line 1, bold: the input's name (its title, or its kind — LL, OL, ATT C — when it has no title), then its date.
Line 2: what happened, then " · " and who did it. Its age sits at the right.

## Q1 — the bell: a leave changed to another kind

- Case: Saber opens Ranger's LL on Wed 15 Jul on the Inputs page and changes its kind to OL.
- Today, Ranger's bell: **OL** Wed 15 Jul / `Renamed — was LL · Saber`
- Why it reads wrong: nothing was renamed; the kind of leave changed. The bell says "Renamed" whenever the bold name
  changes, and for an input with no title the bold name is its kind (`state/notices.ts common`, the `title` part;
  `engine/inputs.ts inpLabel`).
- Draft: **OL** Wed 15 Jul / `LL changed to OL · Saber`
- Swapped: "Renamed — was LL" → "LL changed to OL". Added: "changed to OL" (true: it is the new kind, already printed
  in bold above). Cut: "Renamed" (untrue here), the dash.
- Its nearest relative, already live: the Leave War's bid line "LL bid changed to OL · Saber" (P12, D1460).
- Facts to keep: what it was (LL), what it is now (OL), who did it.
- A true rename keeps today's words: **Range brief** Wed 15 Jul / `Renamed — was Training · Saber` (not in this round).

## Q2 — the bell: a leave made a half day

- Case: Saber changes Ranger's LL on Wed 15 Jul from the whole day to the morning only.
- Today, Ranger's bell: **LL** Wed 15 Jul / `Now 00:00–12:00 am · Saber` (an afternoon: `Now 12:01–23:59 pm · Saber`)
- Why it reads wrong: everywhere else the app writes a half day as AM or PM after the code, "LL (AM)" (his D1525, which
  names the bell); the clock times are the app's own bookkeeping, and "am" is in small letters.
- Draft, the half alone changed: **LL** Wed 15 Jul / `Now LL (AM) · Saber` (afternoon: `Now LL (PM) · Saber`)
- Draft, the day moved as well: **LL** Thu 16 Jul / `Now Thu 16 Jul (AM) · Saber`
- Back to a whole day keeps today's words: `Now all day · Saber`.
- Swapped: "00:00–12:00 am" → "LL (AM)" / "(AM)". Cut: the clock times (they say only "the morning half", which AM
  says). Added: nothing.
- Facts to keep: it is now the morning (or afternoon) half; the day, where the day moved; who did it.

## Q3 — the bell: three or more things changed in one save

- Case: in one save Saber cancels "Range brief" (reason: weather), moves it from Wed 15 to Thu 16 Jul, and renames it
  (it was "Training").
- Today, each person in it reads: **Range brief** Thu 16 Jul / `Cancelled — weather, Now Thu 16 Jul · Saber`
- What is wrong: the bell says only the first two changes (`state/notices.ts noticeWords`, `.slice(0, 2)` — the one-rule
  plan's own choice, never put to him), so the rename is never said and nothing shows that more changed. And "Now"
  keeps its capital after the comma.
- Draft A (recommended): `Cancelled — weather, now Thu 16 Jul, and 1 more change · Saber` ("and 2 more changes" for
  two). A tap already opens the input, where everything shows.
- Draft B: say every change: `Cancelled — weather, now Thu 16 Jul, renamed — was Training · Saber` (two lines on a
  phone; a fourth change makes it three).
- Draft C: leave as today.
- Either way: "Now" in small letters after a comma ("Cancelled — weather, now Thu 16 Jul").
- Added in A: "and 1 more change" (true: counted from the same list of changes). Swapped: "Now" → "now" after a comma.
- The dash in "Cancelled — weather" is his ruled wording (D760, D769) and stays; it is listed for him, not changed.
- Facts to keep: it is cancelled and why; its new day; that more changed; who did it.

## Q4 — one thing said two ways

Each pair is one message raised from two places with different words. Draft: one wording for each pair.

a. **A time the app cannot read.**
   - Typed in a time box on the schedule: `2560 is not a time. Try 0900 or 09:00.`
   - Typed in an input's window: `That is not a time — try 0900 or 09:00`
   - Draft, both: `2560 is not a time. Try 0900 or 09:00.` (the first form: it names what was typed, and has no dash).
   - Swapped in the second: "That" → the typed value; the dash → a full stop.
b. **A man put on the seat he already holds.**
   - By a tap: `Ranger — already in that seat`
   - By a drag: `Already in that seat`
   - Draft, both: `Ranger is already in that seat`
   - Swapped: the dash → "is". Added to the drag's: the man's name (true: he is the one dragged).
c. **A refusal that breaks its family.** Twelve refusals read "Only a scheduler can …" ("Only a scheduler can accept
   inputs", "Only a scheduler can hide a warning"). One does not:
   - Today: `Only a scheduler answers from this list` (a member presses Save on a day's list of OIL questions)
   - Draft: `Only a scheduler can answer from this list`
   - Swapped: "answers" → "can answer".

## Fixed with this round, no question — two slips

S1. **The Inputs page's look-ahead, saved.** Today: `Everyone now opens on next 4 weeks, to sunday` (the code puts the
   whole label in small letters, so "Sunday" loses its capital).
   Draft: `Everyone now opens on the next 4 weeks, to Sunday` (without "to Sunday": `Everyone now opens on the next 4 weeks`)
   Added: "the". Swapped: "sunday" → "Sunday".
S2. **Publishing a weekend or holiday that no Leave War period covers.** Today, when it is the only line:
   `there is no leave war period for 2026, so no OIL can be earned for this day — create the period on the Leave War`
   (small first letter; "leave war" in small letters beside "Leave War").
   Draft: `There is no Leave War period for 2026, so no OIL can be earned for this day. Create the period on the Leave War.`
   Swapped: "there" → "There"; "leave war" → "Leave War" (the app's name, as the same note's end writes it); the dash
   → a full stop, the instruction its own sentence (§1b test 2 (b)). The words are his D19's; the dash is listed for him.
   Facts to keep: no period for that year; so no OIL for this day; where to put it right.

## Held back, with reasons

- **One wording for a save that failed** (seven wordings today): most are safety nets a person rarely or never meets,
  and the commonest, "This change could not be saved.", is in a question the two-squadron chat is putting to him. A
  later round, once he has answered there.
- **"You are not allowed to do that" / "Only a master admin can do that":** safety nets behind buttons the screen
  already hides or greys; a later round, as a table.
- **The dashes** (103 notes): the next rounds, area by area.
