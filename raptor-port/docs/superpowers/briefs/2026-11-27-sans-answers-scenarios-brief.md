# Scenario design brief — SANS warning-lines answers (chat 208, 27 Nov 26)

You design the scenarios a walker will run in the REAL app (a browser driving the production build, desktop and an
iPhone-size phone). You are not reviewing code for bugs; you are asked what must be walked so that nothing this change
touches is left unlooked-at — **what is missing**, the cases and places a builder would forget. You are blind: no other
designer's list, no walk report.

Repo (read-only for you): `C:/Users/User/projects/Raptor-sans` (branch `claude/sans-warnlines-185`). The change is the
two commits `1ea13a30b` (the rulings, documents only) and `232df4490` (the code): `git -C C:/Users/User/projects/Raptor-sans show 232df4490`.
Area rulings: `.claude/rules/decisions/scheduler.md` §Crew and pucks (the SANS lines); full rows
`.claude/decisions-full/scheduler.md` (D2753–D2759 at the top; D2584, D2587, D2750, D2751 for context). Project map:
`raptor-port/CLAUDE.md`. The bug-check order's scenario rules: `raptor-port/docs/bug-check-order.md` §4 and §7.11 (the
lessons list — check your scenarios against it).

## What changed (the owner's answers, 27 Nov 26, "all as recommended")

1. **D2753 — the short pop-up note after a scheduler plants a SANS man** (drag from the crew list onto a seat, tap a man
   onto an armed seat, a drag seat-to-seat, a drop onto an input's row, the OIL-question path) now reads the CREW LIST's
   reason words ("Bolt — SANS — offered Fly only, not AMT", "Marlin — SANS — no availability filed for today", "Ranger —
   SANS from Fri 17 Jul: no availability filed"), the same whether or not his warning line was hidden; before, it
   repeated the warning list's longer line. The warning list keeps its longer line.
2. **D2754 — a SANS warning line naming a sim** names it OFT or AMT with its row: "Planned on OFT EP-9 10:00–11:00";
   an end nobody typed → "… 09:00–10:30 (end assumed)"; no times → "(no times yet)"; a row with no name → "this OFT row".
   Applies to the nothing-filed line, the "offered X only today" line and the "available 08:00–12:00 only" line.
   Flying lines unchanged.
3. **D2755 — the SANS calendar's "+ Commitment" form's tick boxes** read Fly · OFT · AMT (were Fly · AMT · OFT); its
   refusal "Tick at least one of Fly / OFT / AMT".
4. **D2756 — kept as built:** one SANS line a flight (two flights → two lines, each hidden alone); on leave and planned →
   both the leave line and the SANS line.
5. **D2757 — the amber "A" on a puck**, its hover words: "Advisory — on shift and also down for a ground event or
   programme item; or SANS availability not filed, or planned outside it".
6. **D2758 — kept as built:** with a seat picked, AM / PM goes under the F / O / A letter in the crew list for every SANS
   man; nothing picked, "F · AM" on one line.
7. **D2759 — a morning- or afternoon-only filing** reads "SANS — available AM only" / "available PM only" in his struck
   crew-list reason (and so in the drag hint and the note after planting), never "00:00–12:00" / "12:01–23:59"; typed
   hours stay hours. The warning list's longer line still prints clock times (not ruled — leave it).

## What not to produce

- A problem that lives only in data already stored is not a finding (D56): a hidden warning whose words changed may show
  again — that is stored data, leave it.
- A scheduler is always an admin (D785): no scenario for a scheduler who is not one.
- No code review findings; no restyling ideas.

## What to return

A numbered list of scenarios. Each: the surface and device (desktop / phone), the set-up (which SANS man, which day of
the demo week, what he filed, which seat or sim row and its times — use the app's own controls), the exact steps a person
takes, and an **EXPECTED:** line giving the exact words or state that a correct build shows. Include the plain-user round
(the everyday task end to end: file SANS availability on the calendar, plan him, read the warning list, hide a line,
plant from the phone). Mark each scenario with the ruling(s) it covers. Then a short "places the builder may have
missed" list: every other place the app shows these words or this order (search the code if useful) that the change may
not reach. Keep the whole under about 2,500 words.

Write your whole answer to the report file named in your prompt, and return it as your final message too.
