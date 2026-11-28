# Name a sim OFT or AMT in every warning line — the words, drafted for a fresh Fable's check (28 Nov 26, chat A213)

His ruling D2848 (27 Nov 26, question 42, "as recommended"): every other warning line names a sim OFT or AMT the same way
the SANS line already does ("OFT EP-9", "this OFT row"), a job of its own, the exact words checked by a fresh Fable
first (his D2441: Opus drafts, a fresh Fable reviews and adjusts). The SANS line's own rule, already built (D2754): "a
SANS warning line naming a sim says OFT or AMT and its row — 'Planned on OFT EP-9 10:00–11:00' — with '(end assumed)'
where no end was typed, '(no times yet)' with none and 'this OFT row' for a row with no name".

## Where "Sim …" comes from today

Every event a sim row makes for the day's checks is labelled `'Sim ' + the row's name` (`raptor-port/src/engine/events.ts`,
the sim branch of the day's events). Every line that prints an event's name therefore prints "Sim EP-9" for an OFT and
"Sim BOX" for an AMT. Only the SANS line maps it to OFT / AMT (`validate.ts`, `simWhat`).

## Today's lines, read from the running engine (28 Nov 26, a dump of the seed week plus a staged clash)

The staged day: one pilot on OFT EP-9 10:00–11:00, OFT EP-10 10:15–11:15, AMT BOX 10:30–11:30 and a flight; the seed
week's own lines as they stand. Each line is exactly as the warning list prints it.

| # | Check | Today | Drafted |
|---|---|---|---|
| 1 | Double booking, two sims | Conflict: Sim EP-9 10:00–11:00 & Sim EP-10 10:15–11:15 | Conflict: OFT EP-9 10:00–11:00 & OFT EP-10 10:15–11:15 |
| 2 | Double booking, OFT and AMT | Conflict: Sim EP-9 10:00–11:00 & Sim BOX 10:30–11:30 | Conflict: OFT EP-9 10:00–11:00 & AMT BOX 10:30–11:30 |
| 3 | Double booking, flight and sim | Conflict: VL BFM (step 11:40, T/O 12:40) & Sim EP-4 12:00–13:30 | Conflict: VL BFM (step 11:40, T/O 12:40) & OFT EP-4 12:00–13:30 |
| 4 | Medically down and planned | Downchit + planned: Sim EP-6N 17:00–18:30. Reason: Medically down till 17 Jul | Downchit + planned: OFT EP-6N 17:00–18:30. Reason: Medically down till 17 Jul |
| 5 | An input against a sim | Conflict: Sim BOX 11:30–12:30 & Attach (all day). Reason: Keen for any wave | Conflict: AMT BOX 11:30–12:30 & Attach (all day). Reason: Keen for any wave |
| 6 | A flight's brief missed | Misses VL BFM brief 10:20–12:40: Sim EP-4 12:00–13:30 | Misses VL BFM brief 10:20–12:40: OFT EP-4 12:00–13:30 |
| 7 | A sim's brief missed | Misses OFT EP-10 brief 10:00–10:15: Sim EP-9 10:00–11:00 | Misses OFT EP-10 brief 10:00–10:15: OFT EP-9 10:00–11:00 |
| 8 | A sim's debrief missed | Misses OFT EP-9 debrief 11:00–11:30: Sim BOX 10:30–11:30, Sim EP-10 10:15–11:15 | Misses OFT EP-9 debrief 11:00–11:30: AMT BOX 10:30–11:30, OFT EP-10 10:15–11:15 |
| 9 | The crew list's reason, a man already on a sim at that time (seen in chat 208's walk, not in this dump) | already on Sim EP-9 10:00–11:00 | already on OFT EP-9 10:00–11:00 |

The same three cases the SANS line has, applied to every line above (the drafting rule, to be checked):
- a row with no name: "this OFT row" in the SANS line; in a line naming two things ("Conflict: … & …") the draft reads
  "OFT 10:00–11:00" (the kind and its hours), since "this" points at nothing when two rows are named — **a question for
  Fable**;
- an end nobody typed: the lines above print the assumed end as if typed; the SANS line adds "(end assumed)" — whether the
  others should too is **a question for Fable** (D2848 says "the same way"; the draft adds it only where the line prints
  a time range);
- no times at all: these lines do not fire for a row with no times (no time, no clash), so nothing to word.
- a row named "SIM" by its scheduler keeps its name: "OFT SIM 10:00–11:00" (the SANS line's rule, Astra's read of chat 208).

Not in this job: the change history's "Sim · OFT EP-9" titles (not a warning line), Logic's setting names ("Sim brief",
"Sim debrief") and the check names ("Misses sim brief").
