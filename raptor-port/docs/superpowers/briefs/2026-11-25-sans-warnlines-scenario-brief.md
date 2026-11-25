# Scenario design — the warning list's SANS lines (his D2579, D2584 Q3 / 2a / 3b, D2583) — chat 186, 25 Nov 26

You design the WALK's scenarios for a change to the Raptor app (a fighter squadron's flying-schedule planner), on branch
`claude/sans-warnlines-185` (read the code in the folder named in your prompt, read-only; change nothing there). You are
blind: do not open `HANDOFF.md`, any `docs/handpass/` sheet, any walker or reader report, or another designer's list.
You are asked what is MISSING — what a person driving the real app must check — not whether the code is wrong.

## The change

- `src/engine/validate.ts` (the SANS check, search `sansChecks.forEach`): a SANS man planned in a flying seat or a sim
  with NOTHING filed for that day now raises one amber line, "SANS: no availability filed for today. Planned on VL BFM
  (T/O 13:00)", with the amber ring and "A" chip on his puck — a seat with no times too (the sim then reads "Planned on
  Sim EP-9"; a flying line with no name "Planned on this line (no times yet)"). Before this, nothing filed raised nothing.
- The mismatch line now names what he DID offer: "SANS: offered Fly only today. Planned on …" ("offered OFT and AMT
  only"); "not offering OFT today" stays only where his record ticks nothing. The hours line ("available 08:00–12:00
  only") is unchanged.
- The check's name in the warning list and on the Logic page: "SANS availability — not filed, or planned outside it";
  the Logic page's line: "A SANS man planned outside the event or the hours he filed, or with nothing filed."
- Edit Schedule's Legend: the amber "A" line reads "advisory — shift, ground or SANS availability".
- `src/engine/avail.ts`: `sansGate` hands back what he offered; `sansOfferedWords` words it.
- A consequence: the note that pops up after a scheduler drops or taps a SANS man with nothing filed into a seat now
  repeats the new amber line (the app's rule: the note after planning names the warning the plant raised), where it
  used to repeat the crew list's "SANS — no availability filed for today".

## The rulings (from the owner's full rows; cited)

- **D2579 (25 Nov 26):** the day's warning list gives one amber line for a SANS man planned in a flying seat or a sim
  with nothing filed — stating the fact, telling nobody to file. The mismatch case is unchanged; standby seats need
  nothing (D2576, D2578).
- **D2584 (25 Nov 26):** Q3 the amber line's words as above, wearing the amber "A" (D2583); 2a the mismatch line "SANS:
  offered Fly only today. Planned on …"; 3b the Logic line and the check's name as above; Q4 SC MAIN, SC SPARE, BB and
  AVALON never strike him for nothing filed; Q5 an OFT or AMT seat with no times strikes him as a flight with no times
  does. "Every other SANS man with nothing filed changes with these rules, and the 'N free' count."
- **D2583:** every SANS availability flag on a puck keeps the amber ring and "A", no new letter; the Legend line as above.
- **D2573, D2585, D2586:** with nothing filed he is struck on the crew list for a seat with no times too, a flight or a
  sim, a sim's extra places as its seats.
- **D2420:** with no seat picked, the crew list draws no reason line for a man struck for having nothing filed.
- **D2338, D2340, D2341, D2329:** a man posted out as SANS from a date ahead is an ordinary man before that date; SANS
  availability counts only on a day he is SANS.
- **D179, D183–D185, D2005:** on a published day what shows is frozen as published; a change reads pending; the
  Qualification-flag and crew-rest warnings stay live, the others frozen.
- **D469–D475:** a hidden warning stays hidden for everyone until the situation changes; a hidden line is struck in
  place, the day's count drops it.
- **The app's chip order (built):** an "A" outranks the tight-turn "TT" and double-turn "DT" chips on one man's puck.
- **Not a finding:** a problem only in data already stored (D56); a scheduler who is not an admin (D785).

## The places the answer shows (the roll-call to walk)

The day's warning list on Edit Schedule (desktop 1536, phone 402), View-only Sched, the Scheduler Board's issues panel
and the day-info popup (ⓘ); the puck's amber ring and "A" chip on every copy of his puck that day; the day's "N issues"
count and bar colour; hiding the line (✕) and flagging it again; the note after a drop or tap-to-plan; Edit Schedule's
Legend; the Logic page's check list; publishing the day and the published face; the demo week as it boots (four SANS
men there have nothing filed: Cards, Wrangler, Yeti, Badger).

## What to hand back

A numbered list of scenarios, most specialised first. Each: SETUP (made through the app's own controls — the Inputs
page's SANS tab to file, delete or change availability; Admin → Users or Quals for SANS; "+ Wave", "+ Line", the sims),
ACTION, EXPECTED (naming its source: a ruling above, or "RECORD exactly what it says" where no ruling settles it), and
the observation that would prove it wrong. Then a list of negatives (what must NOT change). Then any question for the
owner the rulings do not settle. Sign-ins: `ad` / `a` (admin, Saber), `us` / `us` (member, Ranger — a SANS man in the
demo data from a date ahead). Write the whole list to the file named in your prompt.
