# The Inputs trial — the fresh, blind Opus reader's report (9 Nov 26, chat 41)

The report as it came back, word for word. Its brief: `2026-11-09-inputs-trial-read-brief.md`; the read of commit `34176a2ec`. What was done with each finding: the plan's §Step 5b — the Inputs trial.

Blind read of the Inputs page conversion (b87243496 → 34176a2ec). I changed no files.

## Findings, most serious first

**1. D1388 and D1398. Question 1: a rule was cut back to its older, narrower wording.**
- **What the page says** (Who files an input): "once a scheduler has moved a member's Other only a scheduler changes where it goes", cited [D655, D658, D763, D1388, D660, D762].
- **What the rulings say:** D1388's row is marked "WIDENED 26 Oct 26 BY D1398". D1398's rule: "The lock of D1388 holds for every input a scheduler can move — an Other, Training, Meeting, Appointment, Duty, Event, Personal, Attach, course and overseas duty — not only an Other." The leave-war page's D1388 line also says "a member's input … (every kind he can move — D1398)".
- **What would go wrong:** a fresh model reading only this page would let a member move back a Training, Duty, Attach or course that a scheduler has moved. That is a permissions rule.
- **Fix:** "once a scheduler has moved a member's input — any kind he can move: an Other, a commitment, an Event, a Personal, an Attach, a course, an overseas duty — only a scheduler changes where it goes; its times, dates, remarks and taking himself out stay the member's [D1388, D1398]".

**2. D712, D778 (with D713, D711, D753). Question 1: the merged line contradicts later rulings.**
- **What the page says:** "ALL / ALL AVAIL is offered only for training, a meeting, an appointment, a duty and other, and for a one-day Personal input; never for an Attach".
- **Problem 1, Event left out:** "only" excludes Event. But D713 says Event is "for ALL AVAIL, ALL or several people", and the app's own message (asserted in `src/engine/onerecord.test.ts:105` and `oilpersonalcrowd.test.ts:86`) reads "ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other".
- **Problem 2, "one-day" sits on Personal alone:** it reads as if other kinds may run several days. D711 (3), D753 and the tests ("ALL AVAIL is for one day") make it one day for every kind. D711 (2), "not for an overseas duty or a course", is also gone.
- **Fix:** "ALL / ALL AVAIL is offered for Training, Meeting, Appointment, Duty, Event, Other and Personal, one day at a time; never for leave, medical, an Attach, an overseas duty or a course [D712, D778, D713, D711, D753]".

**3. D569. Question 1: a standing preference was filed as history, and proposed for archive on a wrong claim.**
- **His words in the row:** "remarks just leave the faded words blank. so no faded words on remarks." The rule sentence includes "Remarks has no placeholder."
- **Where it sits now:** only under "Done once — kept until he archives them".
- **Why the archive claim is wrong:** the sorting table says D569 is "restated by D570, D572, D617, D618". None of those four says anything about the remarks placeholder. No test names D569.
- **What would go wrong:** archiving it as proposed loses the rule; until then, it reads as spent.
- **Fix:** state it as standing in the SANS calendar section: "A commitment's remarks box shows no faded placeholder words [D569]". Strike D569 from the archive proposal, or name the part nothing restates.

**4. D687. Question 1: scope narrowed to the phone.**
- **What the page says:** the line starts "On a phone the inputs calendar's month arrows … the calendar / list switch at the right end, in the same place on the Calendar and the List, never moving under the finger" [D705, D687].
- **What the ruling says:** D687 is not phone-only — "stays in the same place whichever of the two is shown". Its reading (2) covers the desktop. D705 reading (3) says "a desktop is not changed", meaning D687 keeps holding there.
- **What would go wrong:** a fresh model would think the desktop switch is free to move.
- **Fix:** move D687 to a line of its own: "On a phone and a desktop the Calendar / List switch stands in the same place on the Calendar and the List — it never moves under the finger that pressed it [D687]".

**5. D1386 and D1396. Question 1: the expand control is scoped to the phone.**
- **What the page says:** "expanded (⤢ at the end of the 'How this works' row) its weeks grow…", inside the bullet "On a phone the month — Inputs and SANS alike — …".
- **What the rulings say:** D1396's rule has no phone condition, and D1386's reading says "the same on a phone and a desktop". It is built for both: `inputsmonth.test.tsx` runs it with `phone(false)`. The page also drops "no day says '+n more'".
- **Fix:** a line of its own: "On a phone and a desktop, ⤢ at the end of the 'How this works' row shows every input in the month, no '+n more', each week as tall as its inputs need, the page scrolling; remembered per person [D1386, D1396]".

**6. D621 and D626. Question 1: a "stands as drawn" was dropped, and two chosen ideas now read as not chosen.**
- **The old D621 line:** "the instructions fold stays and states the late cut-off as set (D628); the keyboard set — arrows, enter, delete, Escape — stands as drawn."
- **The page:** "Ideas shown in the mock-ups: … a fold of instructions, keyboard use; bars and the drag were chosen". That implies the fold and the keyboard set were not chosen.
- **D626's "the rest of the drawings stand as drawn"** was also dropped from the three-tabs line. The sorting table proposes archiving D621 as "chosen by D626, D628", but with that phrase gone the keyboard set stands on nothing on the page. It is built: `inputskeys.test.tsx` covers Enter on a date, Escape and so on.
- **Fix:** put back "the fold of instructions and the keyboard set — arrows, Enter, Delete, Escape — stand as drawn [D621, D626, D628]", and keep "the rest of the drawings stand as drawn" on the D626 line.

**7. D1841. Question 1: a condition was attached to the wrong part of the line.**
- **What the page says:** "below about 1340 no room is made and the window covers the list, standing over '+ Input' while open".
- **What the ruling says:** D1841 has two separate clauses. The second, "and the window standing over '+ Input' while it is open, as it stands over '+ Medical', stays as drawn", has no width condition. The page ties it to below 1340 only.
- **Fix:** "…below about 1340 no room is made and the window covers the list; at any width the open window stands over '+ Input', as it stands over '+ Medical' [D1841]".

**8. The page's opening paragraph and its `paths:` list. Question 1, low: a claim the file list does not back.**
- **What the page claims:** it "Loads by itself with a file of the Inputs pages (the `paths:` above): … the Medical tab", and it now holds the Medical tab's rulings (D959–D977, D1137, D1300).
- **What the file list says:** no Medical file is listed — `MedicalView.tsx`, `MedMoveConfirm.tsx`, `MedClashConfirm.tsx` and the `med*.test` files match no path.
- This gap existed before the change, but the new sentence states it as true.
- **Fix:** add `raptor-port/src/ui/Med*.tsx` and `raptor-port/src/ui/med*.test.ts*` to `paths:`, or drop "the Medical tab" from the sentence.

**9. D1943. Question 1, low: conditions dropped.**
- The page's line keeps "no other area changes until he says". It drops two parts of D1943's rule: "the documents check eased for that page only" and "read by Astra and a fresh Opus reader, blind; merged on his 'merge live'". The first is a standing scope limit on the gate's easing; the second holds until this change merges.
- **Fix:** add "the documents check eased for this page only [D1943]".

**10. Question 3: the "Built, held by tests" line holds up — two small notes.**
- I opened the tests naming all 17 numbers: D572, D649, D651, D675, D685, D707, D732, D768, D773, D879, D968, D999, D1022, D1023, D1179, D1581, D1622. Each has assertions that fail if a part of its rule goes.
- **D968:** the part "the Inputs tab's '+ Input' stays on OL" is not asserted by the D968 test (`medicalview.test.tsx:234`). It is held only by the D917 cases in `inputnewdefaults.test.tsx`. It is also restated on the page ([D917, D968]), so nothing is lost. If the line must mean "named and held whole", add one assertion to the D968 test that "+ Input" opens on OL.
- **D649:** `sansday.test.tsx:149` checks the CAT chip only `if (PEOPLE[sansW[0]].q)`, and checks size on one puck only. Make the chip assertion unconditional, using a seeded SANS man who has a CAT.

**11. Question 4: the map lines and the two other pages. No meaning changed.**
- `DECISIONS.md`, `AGENTS.md`, `raptor-port/CLAUDE.md` and the full-text file's head each only add that Inputs is a page since 9 Nov 26 (D1943).
- `how-we-work.md` (checked with `git diff -w --word-diff`): the only change is D570, D572, D617 and D618 added to the batch-order line.
- `design.md`: only D630 added. It now sits on the save-failure band line, where it means nothing — harmless noise.
- One pointer was lost: the old file's "Where the detail lives" paragraph (`ui-contracts.md` §The Inputs month calendar, §Days — the month, §The SANS calendar; `feature-impact.md`; `data-schema.md`; `file-map.md`) is gone. Worth putting back as one line.

**Checked, not a finding:** every number from the old "Also read" paragraph is still cited on the page, except D18, D46, D468, D643, D700, D738, D741, D744, D745 and D780. All of those are archived in `DECISIONS-ARCHIVE.md` as replaced, and the rulings that replace them are cited. D390 and D802 describe the old file's own shape. All 165 numbers of the old list appear on the page. The line "every date the app keeps keeps its full year" (D1096) and the "on a phone 36 … a finger over 44" wording (D698 via D653) are his: they come from marked "ANSWERED" / "AMENDED" notes in the rows, not from the agent's readings.

rulings checked: 165 (every ruling of the old list compared to its page line; full rows opened for 40; tests opened for all 17 on the built line; plus the 70-odd pointer numbers checked for presence or archive)
