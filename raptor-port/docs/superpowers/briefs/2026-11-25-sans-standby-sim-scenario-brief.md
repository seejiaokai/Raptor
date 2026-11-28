# Scenario design — standby lines never ask a SANS man; an untimed sim strikes him (his D2584 Q4, Q5)

You design the WALK's scenarios for a change to the Raptor app (a fighter squadron's flying-schedule planner), on branch
`claude/sans-leftovers-179` at commit `ee6c9b0a7` (read the code in `C:/Users/User/projects/Raptor/raptor-port` read-only;
change nothing there). You are blind: do not open `HANDOFF.md`, any `docs/handpass/` sheet, any walker or reader report,
or another designer's list. You are asked what is MISSING — what a person driving the real app must check — not whether
the code is wrong.

## The change (commit `ee6c9b0a7`)

- `src/engine/avail.ts slotBarNow` — the crew list's per-seat reason: a seat on an SC, AVALON or BB row (MAIN or SPARE,
  flying or not, timed or not) never gives a SANS man a SANS reason; an OFT or AMT seat with no times gives a SANS man
  with nothing filed "SANS — no availability filed for today", as a flight with no times already does.
- `src/engine/validate.ts` — the warning list's amber SANS line ("SANS: not offering … today. Planned on …") is never
  raised for an SC / AVALON / BB row.
- `src/engine/avail.ts daySansSeats` — his bell's SANS reminder never counts a day for an SC / AVALON / BB row.

## The rulings (from the owner's full rows; cited)

- **D2584 (25 Nov 26), Q4:** "SC MAIN, SC SPARE, BB and AVALON never strike him for nothing filed, the 'SANS — told on
  his bell' note built with the SANS info line, nothing before (answers D2577)."
- **D2576 / D2578:** SC MAIN, SC SPARE, BB and AVALON need no SANS availability, flying or not.
- **D2584, Q5:** "an OFT or AMT seat with no times strikes him as a flight with no times does."
- **D2573:** a SANS man with nothing filed is struck on the crew list for a flight with no times, the same reason as a
  timed seat; a man who has filed something is unchanged.
- **D2568 / D2564:** his reminder counts a day only where he is in a flying seat or a sim with nothing filed — never a
  ground row, a duty desk, all hands; a seat with no times counts, a cancelled line never.
- **D2420:** with no seat picked, the crew list draws no reason line for a man struck for nothing filed.
- **D2338, D2340:** a man posted out as SANS from a date ahead is ordinary before that date.
- **The host's reading (a question, not a requirement):** a SANS man who filed something, on an untimed sim, stays plain.

## The places the answer shows (the roll-call to walk)

Edit Schedule's crew panel and the Scheduler Board's crew list, desktop 1536 and phone 402 (a seat picked, and none);
the "N free" count; the drag hover over a seat; the note after a drop or a tap-to-plan; the green "where can he go"
rings; the warning list and his puck's amber "A" chip and ring; his bell's SANS reminder (sign in as him); the
published day.

## What to hand back

A numbered list of scenarios, most specialised first. Each: SETUP (made through the app's own controls — "+ Wave" for a
standby wave, typing B or R to make a standby line fly, the Flies tick, the Inputs page's SANS tab to file), ACTION,
EXPECTED (naming its source: a ruling above, or "RECORD exactly what it says" where no ruling settles it), and the
observation that would prove it wrong. Then a list of negatives (what must NOT change). Then any question for the owner
the rulings do not settle. Sign-ins: `ad` / `a` (admin, Saber), `us` / `us` (member, Ranger — a SANS man in the demo
data from a date ahead). Write the whole list to the file named in your prompt.
