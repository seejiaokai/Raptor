# [OIL-SEATS-CAN-EARN] — the behaviour register

One line per ruling, in the words the app uses, with the test that pins it. This
is the list the rules sweep walks in the RUNNING APP before the change can be
reported ready — not a summary of the code, a list of promises to check.

Built against the plan at
`2026-09-22-oil-seats-can-earn-plan.md`. Steps 5–11 add their rows as they land;
a ruling with no row here has not been built yet, and that is the point of the
blank.

**Status: steps 1–4 built.** Steps 5–11 outstanding.

---

## What is promised, ruling by ruling

| # | The promise, in plain words | Built | Pinned by |
|---|---|---|---|
| **D24** | An SC SPARE, an AVALON line, an AVALON duty desk and a BB line all OFFER the earn switch, and all start OFF. The admin can switch any of them on. | step 4 | `engine/oilexempt.test.ts` |
| **D35** | A duty block minted from an AVALON template is the same seat, so it gets the same answer — off by default, switch offered. | step 4 | `engine/oilexempt.test.ts` ("same seat, one answer") |
| **D28** | Nothing that earns today stops earning. An ordinary flying line, a sim, a duty desk, a ground row and the Common Programme all pay exactly as before. | steps 3–4 | `engine/oilexempt.test.ts` (the D28 controls), whole suite |
| **D33** | ALL and ALL AVAIL are refused on a flying line's cockpit seats, and nowhere else. The reason shows at every door. | step 2 | `engine/oilseat-refusal.test.ts`, `ui/oilseat-refusal.test.tsx` |
| **D47** | That refusal stands rather than becoming a warning. The 13 Aug "a placeholder puck arms its seat" shortcut still works everywhere a placeholder is legal. | step 2 | `ui/interact.test.tsx`, `ui/oilseat-refusal.test.tsx` |
| **D46** | A placeholder is allowed on an accepted request row — no carve-outs. | step 2 (the refusal does not touch it); the crediting is step 6 | `engine/oilseat-refusal.test.ts` |
| **D43** | The placeholder pucks are ON by default everywhere they can land, like named people. The crowd inherits the seat's answer rather than having one of its own. | step 3 | `engine/oilspandefault.test.ts` |
| **D42** | An overnight line earns the day it sits on; the day the hours spill into earns nothing from it. | step 4 | `engine/oilexempt.test.ts` (the 19:00–07:00 AVALON line) |
| **D31** | A seat the rules cannot measure offers no switch, and says why. | pre-existing, held through step 4 | `ui/oilmode.test.tsx` (OIL28, the ⓘ row) |
| **D36** | The availability window stays narrow — step to dekit. The flying rules' wider report→debrief window is never handed to the placeholder's crowd. | step 2 (the belt) | `engine/oilseat-refusal.test.ts` ("never hands its window to the expander") |
| **D32** | One list: wherever a puck may land, the switch must also be offered. | steps 3–4 for the exempt kinds; the rest is step 9 | `engine/oilexempt.test.ts` |
| **D27 / D37 / D44 / D45** | The count shows on every seat, frozen at publication, worded as what it is. | **not built yet — step 9** | — |
| **OIL7** | Tapping an item's name stops the whole item earning, so a man added later does not earn silently. | unchanged | `ui/oilmode.test.tsx` |
| **OIL28** | Nothing overrides ineligibility. An "allow" is permission to count real work, never to invent it. | unchanged | `ui/oilmode.test.tsx` |
| **OIL8** | A placeholder opens into real pucks inside the mode, so one man can be taken off a crowd. | **not built yet — step 7** | — |

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
