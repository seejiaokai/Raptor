# Fable's words check — a sim named OFT or AMT in every warning line (D2848), 28 Nov 26

Read: the draft (`raptor-port/docs/superpowers/briefs/2026-11-28-sans-sim-names-words.md`), the writing guide (head, §0,
§1, §1a, §1b whole), `events.ts` (the sim branch, the sim windows, the sim crew), `validate.ts` (every line that prints
an event's name), `avail.ts` (the crew list's reasons), the scheduler page's D2754 line. Nothing was run; every "today"
below that is not in the draft's table is read from the code, not seen in the app, and is marked "from the code".

## 1. The nine drafted lines

| # | Verdict | Why |
|---|---|---|
| 1 | Keep as drafted | Only "Sim" → "OFT"; every name and hour kept. |
| 2 | Keep as drafted | The line now says which sim is which, the fact D2848 is for. |
| 3 | Keep as drafted | The flight's side untouched. |
| 4 | Keep as drafted | The reason and the till date untouched. |
| 5 | Keep as drafted | Same. |
| 6 | Keep as drafted | Only the item after the colon changes. |
| 7 | Keep as drafted | The head already says "OFT EP-10" today; now both halves name a sim the same way (one name for one thing, §1). |
| 8 | Keep as drafted | Same; the order of the two items stays as the app lists them. |
| 9 | Keep as drafted | "already on OFT EP-9 10:00–11:00". |

No word is cut and none added but the swap "Sim" → "OFT" / "AMT", which is known true from the row's own box (the
event's key carries `oft` or `amt`). No cold read is needed for these nine: a swap of one name, no reason, cost or
instruction changed (§1b test 11).

## 2. The two open questions

### 2a. A row with no name, in a line that names two things

**Recommendation: "this OFT row", with its hours, in every warning-list line — not the draft's bare "OFT 10:00–11:00".**

- Conflict: this OFT row 10:00–11:00 & OFT EP-10 10:15–11:15
- Misses OFT EP-9 debrief 11:00–11:30: this AMT row 10:30–11:30
- Downchit + planned: this OFT row 17:00–18:30. Reason: Medically down till 17 Jul

Why:
1. They are his ruled words for exactly this thing (D2754), and one thing has one name everywhere (§1).
2. The app already says it this way in two-thing lines today: "Conflict: this sim row 10:00–11:00 & Appointment
   10:30–11:30" (an input against an unnamed sim row), and "this line" for a flight with no name on either side of a
   conflict. A family speaks alike (§1b test 9).
3. "OFT 10:00–11:00" drops the fact that the row has no name, and reads like the whole OFT box — the same shape as
   "Misses AMT brief", where bare "AMT" does mean the whole block.
4. "This" is not left pointing at nothing: a click on the line lights both items.

Two rows with no name against each other read "Conflict: this OFT row 10:00–11:00 & this OFT row 10:15–11:15". It is
clumsy but true, and the hours tell them apart. Rare enough to leave.

**One exception, the crew list's reason (line 9's family).** There "this row" already means the row being filled
("already on this row · not added twice"). An unnamed sim elsewhere in his day would read as that row. So:

- on another row, no name: **already on an OFT row 10:00–11:00**
- on the very row being filled (the "not added twice" reason): **already on this OFT row 10:00–11:00 · not added twice**

"an OFT row" is my wording, not a ruled one — his to take or leave.

### 2b. Does "(end assumed)" belong in the other lines?

**Recommendation: yes in the warning list, wherever the line prints that sim's hours; no in the crew list's reasons.**

- Conflict: OFT EP-9 10:00–11:00 (end assumed) & OFT EP-10 10:15–11:15
- Downchit + planned: OFT EP-6N 17:00–18:30 (end assumed). Reason: Medically down till 17 Jul
- Misses VL BFM brief 10:20–12:40: OFT EP-4 12:00–13:30 (end assumed)
- crew list, unchanged in shape: already on OFT EP-9 10:00–11:00

Why yes: the fact is true and already known to the app for each sim (the same mark the SANS line reads); the flight's
side of these same lines already says "landing assumed"; and without it the line prints an hour nobody typed as if it
were typed. D2848 says "the same way". Why not in the crew list: its reasons do not say "assumed" for a flight either,
and it is a short reason under a name. These lines end longer than today's by two words — marked "longer", his to take.

**A fact for the builder, not a wording:** the brackets go straight after the hours of the sim they belong to, before
"&", the full stop or the comma — never at the line's end, where they would read as the other item's.

**One more place, put to him and not built unasked:** an OFT's own debrief window is counted from that same assumed end.
The flight's line says so — "Misses VL BFM debrief 13:00–15:00 (landing assumed): …". The pair for a sim would be
"Misses OFT EP-9 debrief 11:00–11:30 (end assumed): …". The AMT block is left alone (its debrief comes from its DEBRIEF
row). This is beyond naming the sim, so it is a question, not part of this job's words.

## 3. Lines that print a sim's name which the draft missed (all from the code)

| # | Where | Today | Proposed |
|---|---|---|---|
| M1 | A sim overlapping a standby that is only advised (amber) | Overlaps standby: Sim EP-9 10:00–11:00 & SC AM 07:00–13:00 | Overlaps standby: OFT EP-9 10:00–11:00 & SC AM 07:00–13:00 |
| M2 | A sim against a standby that cannot spare him (red) | Conflict: SC AM 07:00–13:00 & Sim EP-9 10:00–11:00 | Conflict: SC AM 07:00–13:00 & OFT EP-9 10:00–11:00 |
| M3 | One man twice on one sim row | Conflict: in two seats on Sim EP-9 10:00–11:00 at once | Conflict: in two seats on OFT EP-9 10:00–11:00 at once |
| M4 | A sim inside a standby's in-time | Busy before SC AM: Sim EP-9 06:00–07:00 is between his 05:30 in-time and the 07:00 start | Busy before SC AM: OFT EP-9 06:00–07:00 is between his 05:30 in-time and the 07:00 start |
| M5 | Crew rest, where a sim is the first thing of his day | Crew rest: … Day starts 07:00 (Sim EP-9), before report 09:40: 10h rest, needs 12h. | … Day starts 07:00 (OFT EP-9), before report 09:40: 10h rest, needs 12h. |
| M6 | On leave and on a sim | On leave + planned: Sim EP-9 10:00–11:00 | On leave + planned: OFT EP-9 10:00–11:00 |
| M7 | A whole-day input and a sim row with no times | Downchit + planned: Sim EP-9 (no times yet). Reason: flu — and "On leave + planned: …", "Conflict: Sim EP-9 (no times yet) & Course (all day)" | Downchit + planned: OFT EP-9 (no times yet). Reason: flu — and the other two the same way |
| M8 | The same, the row with no name | … planned: this sim row (no times yet) · Conflict: this sim row 10:00–11:00 & Appointment 10:30–11:30 | … planned: this OFT row (no times yet) · Conflict: this OFT row 10:00–11:00 & Appointment 10:30–11:30 |
| M9 | Crew list, a standby seat's reason | on Sim EP-9 10:00–11:00 — inside this shift | on OFT EP-9 10:00–11:00 — inside this shift |
| M10 | Crew list, already on this very sim row | already on Sim EP-9 10:00–11:00 · not added twice | already on OFT EP-9 10:00–11:00 · not added twice |
| M11 | Wrong front seat on a sim, the row with no name | Illegal seat: a WSO in the front seat of OFT sim 10:00–11:30 | Illegal seat: a WSO in the front seat of this OFT row 10:00–11:30 |

Notes on these:
- M7 corrects the draft: it says these lines never fire for a row with no times. They do, for a man away the whole
  day (the rows with no start are checked against whole-day inputs). The "(no times yet)" words stay as he left them.
- M8: "this sim row" is today's wording for an unnamed sim in these input lines; D2754's "this OFT row" replaces it, so
  the two no longer differ.
- M5 and the dash in M9 keep every other word as built; only the sim's name changes.
- M11 already says OFT / AMT; only its no-name fallback ("OFT sim") is out of step. It is the same line with a named
  row ("… front seat of OFT EP-9 10:00–11:30"), which needs no change.
- Already right, no change: "Misses OFT EP-10 brief …" (the head), "Misses AMT brief …" (the whole block, rightly
  bare), the SANS line.

## 4. Facts for the builder (not wordings)

1. Today, with no name, the lines between two events print the bare word with a doubled space — "Conflict: Sim
   10:00–11:00 & …", "already on Sim  10:00–11:00" (from the code: the name is built as "Sim " plus nothing). 2a's words
   replace that.
2. Two different sim rows sharing one name on the OFT and the AMT (OFT EP-9 and AMT EP-9) print today as "in two seats
   on Sim EP-9 … at once", because the two names compare equal. Once each carries its kind they will print as an
   ordinary "Conflict: OFT EP-9 … & AMT EP-9 …". That is the true reading, but it is a change in which sentence shows —
   say so in the report. Two different unnamed rows of one kind would still compare equal: they must not read "in two
   seats on this OFT row" (the flying lines already tell two blank lines apart by their place).
3. A row its scheduler named "SIM" keeps that name — "OFT SIM 10:00–11:00" — as the draft says.
4. The list folds lines worded the same into one: with the kind in the name, an OFT line and an AMT line no longer fold
   together. Hidden-warning keys built from the old words will not match the new ones.

## 5. Not checked

- No line was seen in the running app; M1–M11's "today" is read from the code and the example hours are made up.
- No cold read by a second reader was run on 2a's "an OFT row" or on the "(end assumed)" lines; they carry no reason,
  cost or instruction, but "an OFT row" is a new phrase and is his to rule.
