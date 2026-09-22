# [OIL-SEATS-CAN-EARN] — the behaviour register

One line per ruling, in the words the app uses, with the test that pins it. This
is the list the rules sweep walks in the RUNNING APP before the change can be
reported ready — not a summary of the code, a list of promises to check.

Built against the plan at
`2026-09-22-oil-seats-can-earn-plan.md`. Steps 5–11 add their rows as they land;
a ruling with no row here has not been built yet, and that is the point of the
blank.

**Status: steps 1–9 built.** Steps 10–11 outstanding.

---

## What is promised, ruling by ruling

| # | The promise, in plain words | Built | Pinned by |
|---|---|---|---|
| **D24** | An SC SPARE, an AVALON line, an AVALON duty desk and a BB line all OFFER the earn switch, and all start OFF. The admin can switch any of them on. | step 4 | `engine/oilexempt.test.ts` |
| **D35** | A duty block minted from an AVALON template is the same seat, so it gets the same answer — off by default, switch offered. | step 4 | `engine/oilexempt.test.ts` ("same seat, one answer") |
| **D28** | Nothing that earns today stops earning. An ordinary flying line, a sim, a duty desk, a ground row and the Common Programme all pay exactly as before. | steps 3–4 | `engine/oilexempt.test.ts` (the D28 controls), whole suite |
| **D33** | ALL and ALL AVAIL are refused on a flying line's cockpit seats, and nowhere else. The reason shows at every door. | step 2 | `engine/oilseat-refusal.test.ts`, `ui/oilseat-refusal.test.tsx` |
| **D47** | That refusal stands rather than becoming a warning. The 13 Aug "a placeholder puck arms its seat" shortcut still works everywhere a placeholder is legal. | step 2 | `ui/interact.test.tsx`, `ui/oilseat-refusal.test.tsx` |
| **D46** | A placeholder is allowed on an accepted request row — no carve-outs — and it credits by default there like anywhere else, in the name box and in the extras alike. Taking the puck off takes the crediting with it. | step 2 (the refusal leaves it alone), step 6 (the crediting) | `engine/oilseat-refusal.test.ts`, `engine/oilclaimcrowd.test.ts`, `ui/oilclaimcrowd.test.tsx` |
| **D18, extended** | The man who filed a request still answers for himself: his own No stands, and the crowd beside him never buries it or pays him twice. | step 6 | `engine/oilclaimcrowd.test.ts` |
| **D44, on a request** | The people behind a puck on a request row are written down when the day is published, so an issued day keeps paying the men it went out with even after someone files leave. | step 6 | `engine/oilclaimcrowd.test.ts` ("an issued day keeps the people it went out with") |
| **D43** | The placeholder pucks are ON by default everywhere they can land, like named people. The crowd inherits the seat's answer rather than having one of its own. | step 3 (the rule), step 5 (the seats it actually lands on) | `engine/oilspandefault.test.ts`, `engine/oilexpand.test.ts` |
| **D43 / D32, in practice** | A placeholder put on a DUTY DESK, a sim seat, a sim passenger line, or the extras line under a ground row, a duty desk, a sim or the Common Programme now counts the people it stands for — the owner's Sunday desk. Before this it silently counted nobody. | step 5 | `engine/oilexpand.test.ts` |
| **The freeze has something to hold** | A row with no id yet gathers nobody, because there is nowhere to write down who it stood for. Every real row is given an id, so this never shows on screen — it is the belt under the promise that the count on an issued day cannot move. | step 5 | `engine/oilexpand.test.ts` |
| **D42** | An overnight line earns the day it sits on; the day the hours spill into earns nothing from it. | step 4 | `engine/oilexempt.test.ts` (the 19:00–07:00 AVALON line) |
| **D31** | A seat the rules cannot measure offers no switch, and says why. | pre-existing, held through step 8 | `ui/oilmode.test.tsx` (OIL28, the ⓘ row) |
| **D49** | A flying line typed with the SAME take-off and landing still earns — the man reported and debriefed, so he was at work whatever the times say. The day says the times cannot be right, on the line, on any day; it never refuses the line. **This overrules the plan's step 8 and both reviewers.** | step 8 | `engine/oilflighttimes.test.ts` |
| **D49, the other half** | A flying line with crew on it and NO readable times earns nothing, and is now named beside the duty desks instead of failing in silence. | step 8 | `engine/oilflighttimes.test.ts` |
| **D48** | When a rule changes under an already-published day, the day keeps the money it went out with until somebody corrects it and re-publishes. | **nothing built — D49 removed the rule change it was given about**; kept as the answer for the next one | — |
| **D36** | The availability window stays narrow — step to dekit. The flying rules' wider report→debrief window is never handed to the placeholder's crowd. | step 2 (the belt), re-pinned at step 5 where the expansion arrived | `engine/oilseat-refusal.test.ts` ("never hands its window to the expander"), `engine/oilexpand.test.ts` |
| **D32** | One list: wherever a puck may land, the switch must also be offered. | steps 3–4 for the exempt kinds; the rest is step 9 | `engine/oilexempt.test.ts` |
| **D27** | The count shows on every seat, on every day, with the earn mode off — a placeholder dropped anywhere says how many would attend. | step 9a | `ui/oilcount.test.tsx`, `engine/oilsent.test.ts` |
| **D37** | It reads as what it is — the men with nothing else on at that time — and on a day that earns nothing it does not mention OIL at all. | step 9a | `ui/oilcount.test.tsx` |
| **D44** | Who was behind a puck is written down when the day is published, on every day. The issued page keeps that list; the working copy shows today's. A schedule issued before the app kept the record says so rather than having an answer invented for it. | step 9a | `engine/oilsent.test.ts`, `ui/oilcount.test.tsx` |
| **D44, the tap** | The chip carries the version it was drawn in, so tapping an issued page lists the men that page went out with — not whoever is free now. | step 9a | `ui/oilcount.test.tsx` |
| **D44, the mark** | When the crowd behind a puck on a published day is no longer what it went out with, the day reads as having something pending — on every day, not just a weekend — and the scheduler amends or publishes the end-of-day version. | step 9b | `engine/oilmembership.test.ts` |
| **D45** | A change in availability NEVER invalidates a signature. The pending mark is the whole mechanism. A changed OIL decision still does invalidate it, because that is a change of mind about what was approved. | step 9b | `engine/oilmembership.test.ts` (with its control), `engine/oilev.test.ts` |
| **No amendment nobody made** | A day published before the app kept this record does not light up the moment the change ships. | step 9b | `engine/oilmembership.test.ts` |
| **OIL7** | Tapping an item's name stops the whole item earning, so a man added later does not earn silently. | unchanged | `ui/oilmode.test.tsx` |
| **OIL28** | Nothing overrides ineligibility. An "allow" is permission to count real work, never to invent it. | unchanged | `ui/oilmode.test.tsx` |
| **OIL8** | A placeholder opens into real pucks inside the mode, so one man can be taken off a crowd — on a duty desk, a sim row and every extras line, not just a ground row. | step 7 | `ui/oilrowpucks.test.tsx`, `ui/oilclaimcrowd.test.tsx` |

## The three supersessions this change makes, named out loud

1. **D24 over the old "AVALON and BB earn nothing".** They were not *off*, they
   were *absent* — skipped before the walk saw them, so no switch could be drawn
   and no decision could exist. They now reach the walk carrying a default of
   off. The money is unchanged: nothing is paid unless somebody says so.
   Tests that proved the rule by ABSENCE now prove it by the DEFAULT, which is
   stronger — absence could not tell "exempt" from "the walk is broken".

2. **D33/D47 over the 13 Aug 26 "everything plants, warning after".** This change
   carves the first hard refusal out of that rule, narrowly: placeholder ids on
   flying keys, nothing else.

3. **D33/D47 over the 13 Aug 26 "a placeholder puck arms its seat".** Only the
   COCKPIT instance of that shortcut is gone. It still works on every seat a
   placeholder is legal on, and an empty cockpit seat still arms as before.

## What the walk must check that no test can

- An SC shift showing MAIN and SPARE under **one** switch — does "part of this
  row earns" read sensibly beside two pucks, one glowing and one not?
- The five switch sentences, read side by side on one screen.
- Whether crediting a spare **by tapping the man** is discoverable at all, or
  whether the fallback (a switch on the MAIN/SPARE badge) is needed.
- Both widths, and the version preview — the only place "as issued" is visible.
- The Leave War side: the OIL tracker figure, the FO/HO cell, the clash strip,
  and the reverse sweep after a switch is turned off on a published day.
