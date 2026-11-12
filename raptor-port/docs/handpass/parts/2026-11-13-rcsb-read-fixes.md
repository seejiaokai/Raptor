# The narrow fresh, blind Opus read of the two fixes — job 2, saved as it arrived, 13 Nov 26 about 06:22

Blind read of the two fixes (the "no usable times" warning on a published day, and the reference-app patch). Read only; I changed no file.

## Findings

1. **A gap in the tests, not a bug in the code.** No test covers the case D2014 exists for most: a published day where a Logic change would start or clear the red "no usable times" line while nothing becomes pending.
   - **What the person would see (before the fix):** a weekend line typed 10:00–10:00 has its OIL switched off, or the day carries "nothing today earns". The day is published with report lead 0 and debrief 2h. The admin then sets debrief to 0 on the Logic page. Nobody's OIL record changes, so the day does not read pending. Yet the red line appeared at once on the published face and on Edit Schedule.
   - **Cause:** both new tests use a line that does earn. So the debrief change also moves bane's OIL, the day reads pending, and only the "change waiting" path is exercised. The path where the working copy judges a published day by its kept values (`untouchedKept`) is never driven for this warning.
   - **The fix handles it.** I traced it: the day lands in that path, and both passes read the kept values.
   - **Suggested pin:** a third case in the last describe of `src/leavewar/oil-fullday-published.test.ts`. Same build, with the line's OIL switched off or the day blanket set. Publish, set debrief to 0, validate. Then expect: no red line from `officialWarn()`, no red line from `workingWarn()`, and `dayShownPendCount(SAT)` = 0. Run against the old code, the first two would fail.
   - Severity: low.

2. **A comment left stale by the ruling.** In `src/engine/rules.ts`, the comment above `withRuleVals` says the OIL block's following a changed setting on a published day "is the owner's question". D2014 has now settled that. This diff fixed the matching comment in `faceattrs.ts` but not this one. Fix: point it at D2014, the way the `faceattrs.ts` comment now reads. Severity: trivial.

No other findings.

## Checked and found sound

**Q1 – fix 1 passes the right values in every case.**
- The day loop runs whole inside the day's own overlay (`withDayRules(DAYS[idx])`). Nothing else changes the settings between that point and the line that reads report lead and debrief, just before the switch back to today's settings. `validate()` is never called from inside an overlay, so no outer overlay can leak in.
- **Official pass, issued day:** the issued copy is installed and mapped to its kept values. Report lead and debrief are the day's own.
- **Working pass, published day, nothing waiting:** the day is mapped to its kept values. If they equal today's, nothing is laid over, and today's equals kept anyway.
- **Published day with a change waiting:** left out of the kept list, and its leftover per-copy mapping is cleared first, so it reads today's. The official pass still reads kept. This matches D2013.
- **Draft day:** today's.
- **Neighbour-week days:** they never reach this warning. The loop covers only the loaded week, and the phantom next Monday runs crew rest only.
- **The values match what the credit uses.** The kept values (`snap.rv`) and the OIL block's values are captured at the same publish, both from today's settings at that moment. `freezeWarn` always gets a warning slice back, so the kept values are always stored. The credit reads the block's values (`oilKeptVals`, then `dayOilWork`), so the warning and the credit now agree.
- **Inside the switch back to today's settings,** the blind check reads no other setting for a flying line. `resolveReporting` reads the live report lead only for a standalone wave, and that never gets this far.

**Q2 – standalone shifts.** The zero-shift test now uses the day's kept report lead. The credit uses the same value: `dayOilWork` passes the block's kept lead to the same zero-span function. The note beside the shift already used the day's value. Before, the warning used today's while the credit used kept, so this removes a mismatch rather than creating one.

**Q3 – other readers of the result.**
- The warning is one of those drawn live on the published face (`LIVE_ON_FACE`). The frozen slices drop it, so the pending comparison never sees it and it cannot make a day pending.
- The hidden-warnings check in the kept-day selection reads the previous official pass, which now uses kept values. That makes it steadier, not flippy.
- The Leave War publish note still uses today's values. It runs only from the publish gate, when today's values are the ones the day goes out with.
- Face and working copy can disagree only when something is pending, or for the same reasons every other check has. That is not new.

**Q4 – fix 2, the reference patch.**
- Each anchor appears exactly once in the reference file (I counted with grep), and both swap loops throw unless there is exactly one match.
- `_fl` is declared inside the same callback, before `end` and before the later line that uses it.
- Shift events and other event kinds are unchanged (`_fl` is just the landing; `end` is the event's end). A readable landing is unchanged.
- A line with no take-off either: both engines give not-a-number exactly as before.
- A blank landing: the reference already used the take-off, unchanged.
- The `reirest` anchor (the prevNoLd line) is still produced word for word.
- No `$` patterns in the new replacement text.
- The name swap is the only edit to that label table.
- The port reads unreadable landings the same way (same `toMin`), so the sums match.
- One possible difference, ruled out: a stored landing like "1300" or "13:00H" would still differ in the words. The port marks "no landing typed" when the landing is not a number; the reference only when parseHM can't read it. But the editor saves typed times in hh:mm form, so that form comes only from data already stored (D56) — not a finding.

**Q5 – tests pin positively and fail if reverted.**
- **Fix 1:** reverted, "lowered" puts the red line on the published face after debrief 0, failing its no-red-line check. "Raised" clears it, failing its expect-true. Both also check the working copy and the result after the amendment.
- **Fix 2:** reverted, "TBD" and "late" give the reference no crew-rest warning, so the lists differ. It also asserts the exact wording for all five landings. The label test fails on "+ flying".

## How sure I am
- Q1 sound: high.
- Q2 sound: high.
- Q3 sound: high.
- Q4 sound: high (anchors counted, scope read).
- Q5 sound: high.
- Finding 1 (missing case; the code handles it): medium-high. I traced it but did not run it.
- Finding 2: high.
