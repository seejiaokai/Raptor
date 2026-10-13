# The wordings of 13 Oct 26, rechecked against the writing guide — APPROVED 14 Oct 26, THE WORDINGS OF RECORD (`[SKILL-FUSION-WRITING]` step 4 — D833, D834; D837, D838, D839)

**What this is.** Every wording he approved on the design page (`raptor-port/docs/mock/design-look-13oct.html` — the
passing notes N1–N33, D829; the clash note's words, D827; the OIL question's words, D830) read again against the
finished writing guide (`raptor-port/docs/design-practices.md` §1, §1a, §1b). **APPROVED BY HIM ON 14 OCT 26 — "All approved as recommended": List 1 and the two tables are D837, List 2 is D838, List 3 is D839 — all ten rows, each REPLACING its note's wording in Lists 1 and 2 (N4, N6, N9, N10's second line, N15, N19, N24, N28, "Left OIL Earn", the OIL question's small print). The two ruled bars stay as they are. NOTHING IS BUILT YET: these are the words to build, in place of the design page's §2 (D829, replaced).**
The page that puts it to him: `raptor-port/docs/mock/writing-guide-13oct.html`. The designs he approved stand; only
words are here.

**How it was done.** The writer (this chat) read each note where the app raises it, so that a link word is known and
not guessed; reworded by §1b; a fresh Opus helper, given only the new wordings, read them cold (§1a test 9); then the
guide's third read — a fresh Opus reader and Fable, blind to each other — checked every row against the guide and
every "checked in the app" against the code (`2026-10-13-writing-guide-reads-2.md`). Word counts are a check, never a
target (§1a test 11), counted by a script; **"longer" marks a wording that ends longer than the app's today** (§1b).

## List 1 — the thirteen he approved reworded: twelve to build, one that can never show (APPROVED — D837)

| # | In the app today | Approved 13 Oct | Proposed now | What changed from the approved wording — and what is cut or swapped since today | Words: today · approved · now |
|---|---|---|---|---|---|
| N1 | Monday published — APPROVED · Monday 13 Jul: the common programme has no usable times, so nobody on it earns OIL | Monday published — approved · Common Programme has no usable times: nobody on it earns OIL | Monday 13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL. | "—" → "and" (two done things, one lead); "·" → a full stop; ":" → ", so" (the link word back — it is the why); "13 Jul" back (a number: it moves to the one "Monday" kept). Since today: the second "Monday" cut (said twice); APPROVED's capitals go (a state said as an ordinary word — §1b test 8) | 19 · 14 · 19 |
| N2 | Monday unpublished — it is a draft again; publishing reissues the Original · its OIL credits leave the Leave War until it is published again | Monday unpublished — a draft again; publishing reissues the Original · its OIL credits leave the Leave War until it is republished | Monday unpublished. It is a draft again, and publishing reissues the Original. Its OIL credits are withdrawn from the Leave War until it is republished. | "—" → a full stop (a lead, then a sentence); "it is" back (a clause keeps its subject and verb); ";" → ", and"; "·" → a full stop. Since today, two swaps: "leave" → "are withdrawn from" (N4's own word for the same thing on the tap before; "leave the Leave War" trips when said aloud); "published again" → "republished" (the app's word). **Longer: 23 → 25.** | 23 · 20 · 25 |
| N3 | Monday: AL2 withdrawn — its changes are back on the working copy as pending; AL1 is the issued schedule; publishing again reissues AL2 | the same, less "again" | Monday: AL2 withdrawn. Its changes are back on the working copy as pending, and AL1 is the issued schedule. Publishing reissues AL2. | "—" → a full stop; the first ";" → ", and"; the second → a full stop. Since today: "again" cut (a helper word — "reissues" says it) | 22 · 21 · 22 |
| N4 | Heads up — Monday's OIL credits are bid against on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm. | Monday's OIL credits are bid against on the Leave War — unpublishing withdraws them until you republish. Tap again to confirm. | Monday's OIL credits are bid against on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm. | the dash the approved wording had put in goes back to the full stop the app has today. Since today: "Heads up —" cut (an announcement). List 3 row 4 offers a plainer first sentence | 22 · 20 · 20 |
| N7 | This week is locked — it was published by an older version and can't be edited · its twin: Monday is locked — it was published by an older version and can't be amended here | This week is locked — published by an older version, it can't be edited | This week is locked. It was published by an older version of the app, so it can't be edited. · Monday is locked. It was published by an older version of the app, so it can't be amended here. | "—" → a full stop; "it was" back; "and" → "so", ADDED and checked in the app (the week is locked because its saved format is an older version's); "of the app" ADDED — "an older version" can be read as an older version of the schedule (the Original, AL1). **Longer: 15 → 19.** | 15 · 13 · 19 |
| N8 | Applying "Standard Monday" replaces your unpublished edits on Monday — open Templates and pick it again to confirm | "Standard Monday" replaces your unpublished edits on Monday — pick it again in Templates to confirm | **nothing to reword — the app can no longer show this note** | Since D96 (25 Sep 26) a template is refused on a published day and applied on the FIRST pick on a draft day; the "pick it again" step is never raised (`raptor-port/src/ui/board.ts pickDayTpl` — "'armed' is no longer returned"). Found by the third read. The dead line is removed in the whole-app words pass (D808) | — |
| N10 | Info only — this item is no longer checked against the rules, and earns nobody any OIL / This item is checked against the rules again | Info only — no longer checked against the rules, earns nobody any OIL / Checked against the rules again | This item is info only: no longer checked against the rules, and earns nobody any OIL / This item is checked against the rules again | "this item is" back, and first, in both lines (the subject); "—" → ":" (what follows is a phrase that spells "info only" out); "and" back (a link word). The cold reader took a bare "Info only:" for "for your information". Since today: no word cut, the order changed | 16+8 · 12+5 · 16+8 |
| N11 | Nothing on this day earns OIL — anything added later is covered too / This day can earn again — the marks underneath are back | Nothing on this day earns OIL, including anything added later / This day can earn again — its marks are back | Nothing on this day earns OIL, including anything added later / This day can earn OIL again, and the marks underneath are back | first line as approved — since today a clause became a phrase ("anything added later is covered too" → "including anything added later"), a swap the cold read passed. Second line: "—" → ", and"; "underneath" BACK (no kind of cut fits it, and the bar on the same screen says "the marks underneath"); "OIL" added to match the first line. **Second line longer: 10 → 12.** | 12+10 · 10+9 · 10+12 |
| N14 | Line is SPARE now — standing by, checked for availability and currency only / Line is MAIN now — fully cross-checked | the same, less "now" | Line is SPARE now: standing by, checked for availability and currency only / Line is MAIN now: fully cross-checked | "now" BACK — without it the cold reader took the line for a standing fact, not a change just made (the fifth kind's own proof failed); "—" → ":" (the rest is a phrase that spells the state out). Since today: nothing cut | 12+6 · 11+5 · 12+6 |
| N16 | Note now shows on the view-only schedule / Note is scheduler-only again | Note shows on the view-only schedule / the same | **today's wording, whole** | "now" BACK for the same reason; there was never a dash in it | 7+4 · 6+4 · 7+4 |
| N19 | The 07:30 brief was after the new take-off, so it has been cleared | The 07:30 brief was after the new take-off — cleared | The 07:30 brief was after the new take-off, so it was cleared | the dash → ", so it was" (the link word and the verb back). Since today: "has been" → "was" (a helper word). List 3 row 3 offers "removed" | 13 · 9 · 12 |
| N24 | An input for ALL AVAIL is changed in its own window — open it to change who it is for / Who is in this input is changed in its own window | An ALL AVAIL input is changed in its own window — open it to change who it is for / the same | An ALL AVAIL input is changed in its own window. Open it to change who it is for. / Who is in this input is changed in its own window | "—" → a full stop (a fact, then what to do). Since today: "An input for ALL AVAIL" → "An ALL AVAIL input" (a swap, every name kept). List 3 row 9 offers a plainer pair | 19+11 · 18+11 · 18+11 |
| N26 | A medical entry is one person's own. Take the other people out and save first — then change its kind. | A medical entry is one person's own — take the other people out and save, then change its kind | A medical entry is one person's own. Take the other people out and save, then change its kind. | the dash the approved wording had put in goes back to today's full stop. Since today: "first" cut (a helper word — "then" carries the order) | 19 · 18 · 18 |
| N33 | Shortcut to the Admin page (Django-style backend in the full build). | removed | removed, as approved | — | — |

## List 2 — left whole on 13 Oct: the dash changes; in three a link word or a subject comes in where the dash hid it (APPROVED, in the same build — D838)

| # | In the app today | Proposed now | The dash became |
|---|---|---|---|
| N5 | Published AL2 · 3 items on Monday only · approved by Saber · 2 days with changes still held | left whole | (its dots stand between facts none of which is a sentence — a receipt) |
| N6 | Monday is still draft — publish the day before publishing its changes | Monday is still draft. Publish the day before publishing its changes. | a full stop — a fact, then what to do (List 3 row 1) |
| N9 | OIL mode — tap a puck to take a man off that event, or an item to stop the whole item earning | OIL mode: tap a puck to take a man off that event, or an item to stop the whole item earning | a colon — the first part is only a name (List 3 row 2) |
| N12 | Nothing on this day earns — turn that off first / This event earns nobody any OIL — turn the event back on first | Nothing on this day earns. Turn that off first. / This event earns nobody any OIL. Turn the event back on first. **— THE FIRST SENTENCE CHANGED BY HIM THE SAME DAY (D844 — "What is turn ‘that’ off mean", then "Clearer"): `Nothing on this day earns. Turn off “Nothing today earns” first.` — the switch named, in every place it is said.** | a full stop — a fact, then what to do |
| N13 | SC added — standalone, every seat checked for availability, SC currency, front seat and overlapping places only | SC added: standalone, every seat checked for availability, SC currency, front seat and overlapping places only | a colon — a done thing, then a phrase |
| N15 | Warning hidden — no flag, not counted. It returns if the day changes | Warning hidden: no flag, not counted. It returns if the day changes. | a colon — a done thing, then a phrase (List 3 row 5) |
| N17 | Desktop layout — pan sideways to read the whole day | Desktop layout: pan sideways to read the whole day | a colon — a name |
| N22 | Keep at least one document on this entry — add the replacement before removing the last file | Keep at least one document on this entry. Add the replacement before removing the last file. | a full stop |
| N23 | An identical row is already on the Ground Programme — added under Personal Inputs instead | An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead | "so" — checked in the app: the Ground Programme refuses a second identical row and the input stays under Personal Inputs; "this one was" ADDED (the subject). **Longer: 14 → 18.** |
| N25 | That input was removed while its window was open — the window has closed | That input was removed while its window was open, so the window has closed | "so" — the words themselves give it. **Longer: 13 → 14.** |
| N27 | Ranger is the last on this input — take the input off the programme, or delete it in its own window | Ranger is the last on this input. Take the input off the programme, or delete it in its own window. | a full stop |
| N28 | Bane needs the DAAR instructor mark before NAAR can carry it — the tick comes off instead | Bane needs the DAAR instructor mark before NAAR can carry it, so the tick comes off instead | "so" — checked in the app: the instructor mark is not offered, and the press unticks. **Longer: 16 → 17.** (List 3 row 6) |
| N29 | NVG removed from the LoX. Nobody's record changed — add it back and the ticks return. | NVG removed from the LoX. Nobody's record changed. Add it back and the ticks return. | a full stop |
| N30 | AIM-9 removed from the list — every jet carrying it keeps it. Add it back and the chips return. | AIM-9 removed from the list. Every jet carrying it keeps it. Add it back and the chips return. | a full stop — a done thing, then a sentence (as N29) |
| N31 | The 2027 leave war period is created — set its bidding window here | The 2027 leave war period is created. Set its bidding window here. | a full stop |
| N32 | A leave war already covers part of 2027 — open the Leave War and extend it instead | A leave war already covers part of 2027. Open the Leave War and extend it instead. | a full stop |
| — | 2590 is not a time — try 0900 or 09:00 (the page of 13 Oct showed it as "0730 is not a time") | 2590 is not a time. Try 0900 or 09:00. | a full stop |
| — | Red box — flagged for the next scheduler | Red box: flagged for the next scheduler | a colon — a name |
| — | LATE mark hidden — the Inputs page still shows it | LATE mark hidden. The Inputs page still shows it. | a full stop — a done thing, then a sentence ("still" already says the contrast) |
| — | Left OIL Earn — the next undo would change the day itself | Left OIL Earn. The next undo would change the day itself. | a full stop — a done thing, then a sentence (List 3 row 7) |

N18, N20, N21 and every "Only a scheduler can …" have no dash and are left as they are.

## List 3 — what the fresh reader tripped on (APPROVED, all ten — D839; each replaces its note's wording above)

| # | The words | How a fresh reader took them | Proposed | Words: today · now |
|---|---|---|---|---|
| 1 | N6 "Publish the day before publishing its changes" | "the day before" = Sunday | Monday is still a draft. Publish the day first, then its changes. | 11 · 12 **longer** |
| 2 | N9 "tap a puck to take a man off that event" — and the note says "OIL mode" where the button says "OIL Earn" | taking him off the schedule, not only off earning | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | 20 · 20 |
| 3 | N19 "so it was cleared" | "cleared" = approved, as in cleared for take-off | The 07:30 brief was after the new take-off, so it was removed | 13 · 12 |
| 4 | N4 "are bid against" | not something anyone says; two readings | Some of Monday's OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm. (Checked in the app: the warning shows when taking the day's credit away would put a credited person's OIL balance below zero — `raptor-port/src/leavewar/sync.ts oilCreditBidAgainst`.) | 22 · 22 |
| 5 | N15 "It returns if the day changes" | "when tomorrow comes" | Warning hidden: no flag, not counted. It returns if the warning changes. (Checked in the app: the hide is keyed to the warning's own words — `raptor-port/src/engine/warnhide.ts`; his words of Aug 26, "if things change that warning will appear again".) | 12 · 12 |
| 6 | N28 "before NAAR can carry it … the tick comes off instead" | could not tell what "it" is or which tick | Bane needs the DAAR instructor mark before NAAR can carry one, so the NAAR tick comes off instead | 16 · 18 **longer** |
| 7 | "Left OIL Earn. The next undo would change the day itself." | could not tell whether the undo was done | Left OIL Earn without undoing. The next undo would change the day itself. (Checked in the app: the press closes the mode and undoes nothing.) | 11 · 13 **longer** |
| 8 | N10's second line "This item is checked against the rules again" | the first line took away two things (the checks, OIL); this names one coming back | This item is checked against the rules again and can earn OIL (Checked in the app: an info-only item earns nothing; with the switch off it earns by the ordinary rules. By §1b test 9 this is HIS to add, not the writer's.) | 8 · 12 **longer** |
| 9 | N24 "is changed in its own window" | a report that something was just changed, not a rule | An ALL AVAIL input can only be changed in its own window. Open it to change who it is for. / Open this input's own window to change who is in it | 19+11 · 20+11 **longer** |
| 10 | The OIL question "…so published work the same day can raise it" | raise what — the credit, or the balance? | …so published work the same day can raise the credit. | — |

**Heard and left:** "approved" (by whom) and "no usable times" (deliberately covers a start with no end) in N1; "publishing
reissues the Original" (which Original) in N2; which chips return in N30; "the next scheduler" on the red box; "Step the
war back" (whose war); where "only" falls in N13 (not checked in the app, so not moved). A scheduler at the screen has
what the cold reader lacked.

## The clash note's words (D827) and the OIL question's (D830) — APPROVED, D837

| Where | Approved 13 Oct | Proposed now | What changed |
|---|---|---|---|
| The line | 2 clashes with the schedule · Show / Hide | the same | — |
| A weekend clash | Weekend/PH work earns FO, but the day holds LL | the same | — ("weekend/PH" is the squadron's own pair and keeps its slash) |
| A leave clash | Input OML against bid LL | The input is OML, but the bid is LL | a sentence with its verbs, in the shape of the line above (today's reads "input OML vs bid LL on 10 Aug"; the day stands on the row). **Longer than the approved: 5 → 9.** |
| The four instructions | Decide the bid · Change the leave on Inputs · Send the leave back or delete it · Step back to Bidding Closed | the first three the same; the last: Step the war back to Bidding Closed | "the war" back — the thing that steps back (today's wording names it) |
| The desktop's one line | … holds LL — Decide the bid | … holds LL. Decide the bid › | the dash → a full stop; the instruction is its own link and takes none |
| The OIL question's title | OIL — Tally, Range brief | OIL: Tally, Range brief | the dash → a colon ("OIL" is only a name) |
| Its reason and question | This input falls on a non-working day — Sat 18 Jul (weekend / PH). Does it deserve HO — half a day of OIL? | This input falls on Sat 18 Jul, a non-working day (weekend/PH). Does it deserve HO, half a day of OIL? | two dashes → commas (each second part is a name for the thing just before it); the bracket now stands beside the words it explains; "weekend/PH" spelt as the clash note spells it |
| Its small print | The credit lands on the Leave War as an HO cell and moves the OIL balance. Hours count start to finish for the day, so published work the same day can raise it. | the same (List 3 row 10 offers one word) | — (cut on 13 Oct, since today: "whole", "schedule", "on") |
| Its answer button | Yes — credit HO | Yes: credit HO | the dash → a colon. The page of 13 Oct called this "ruled"; no ruling fixes its dash, so it goes through the guide (the third read) |
| Its other buttons | No OIL · Don't swap · Swap; Back / Add; Back / Save | the same | — |

## Wordings he has ruled, with a dash — LEFT AS THEY ARE, as recommended (D837 reading 3)

| Ruled | As the guide would say it | Recommended |
|---|---|---|
| Not saved — keep this page open (D587) | Not saved. Keep this page open. | leave it — a headline and what to do, short, and D834 keeps the dash where it makes sense |
| Not swapped — OIL not answered, and its four siblings: Not added / Not moved / Not put back / Not filed (D783) | Not swapped, because OIL was not answered | leave it, for the same reason (the guide's wording is two words longer) |

## For the builder

- The tests that pin each sentence are re-expressed with the build.
- **N1 is two notes joined by the app** (`raptor-port/src/engine/publish.ts` "published — APPROVED";
  `raptor-port/src/leavewar/sync.ts oilBlindLine`; `raptor-port/src/ui/toast.ts toastBatch`, which joins with a middle
  dot). The join adds the full stops and the capital; a note shown alone keeps none (§1b test 4). Shown alone the
  publish note reads "Monday published and approved". Where the day's OIL line follows the same day's publish note, the
  day is named once, at the head, with its date. After an amendment's receipt (N5) the OIL line keeps its own day.
- **N7's family is seven strings:** `raptor-port/src/state/store.ts` once, `raptor-port/src/ui/inputedit.tsx` four
  times, `raptor-port/src/engine/publish.ts` twice (the "amended here" twin).
- **Relatives NOT on the 13 Oct list — for the whole-app words pass (D808) unless he says otherwise; never changed
  unasked:** the OIL line's second form, "Monday 13 Jul earned nobody any OIL — the common programme has no usable
  times" (`sync.ts`), and the two other lines that can ride the same join ("no leave war period for 2027 …", "… now
  sits on published work — the day is flagged, the bid is still live"); the day bar's "Nothing on this day earns OIL.
  The marks underneath are kept — turn it off and they come back." (`raptor-port/src/ui/oilmode.ts`); "That is not a
  time — try 0900 or 09:00" (`inputedit.tsx`, twice); N32's twin in `raptor-port/src/leavewar/ui/HolidaysPanel.tsx`;
  ~~N12's copies in `raptor-port/src/ui/AvailWindow.tsx` and `raptor-port/src/ui/board.ts`~~ (**CHANGED on his word, D843, 14 Oct 26 — "Yes":** the walk found that N12's own place, a man's puck under the day's switch, cannot be tapped, so these two copies are the only ones a person sees; both took the approved wording — and minutes later, with the puck's own, the wording that names the switch, D844: "Nothing on this day earns. Turn off “Nothing today earns” first."; the ALL AVAIL window's hint the same way, and its copy of the event's refusal the full stop); N10's and the red box's words
  in hover titles (`raptor-port/src/ui/board-html.ts`, `raptor-port/src/ui/html.ts`); N8's dead line.
