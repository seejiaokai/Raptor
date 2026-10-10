# The design vet of the Inputs calendar and the Inputs list — 10 Oct 26

**Asked by him** (10 Oct 26): *"can u vet how the inputs calendar and list is designed? Like every component including
the text. I don't like too wordy interface as well. And show me a mock up in what u suggest to improve"* — the second
sentence is ruling **D726** (`.claude/rules/decisions/how-we-work.md`; `docs/ui-contracts.md` §Words on screen).

**Method:** dual-agent, as the design guide's critique asks — a design review from the pictures (two passes, the second
on every word) and, apart from it, the guide's automatic detector on the three screen files and in the running page.
**NOTHING IS BUILT.** The mock-up he was sent: `docs/mock/inputs-vet.html` (pictures `docs/mock/img/inputs-vet/`, drawn
from the built app by `scripts/handpass/mk-inputs-vet.mjs`). The evidence the reviewers read: 33 pictures and every
word on both screens, `docs/img/handpass/2026-10-10-inputs-vet/` (`words.md`; `scripts/handpass/inputs-vet-look.mjs`).
The backlog item: `OUTSTANDING.md` `[INPUTS-VET]`. **His choices are V1–V5 on the mock-up page; record each as a ruling
before building it.**

## Design health — 29 of 40 ("good")

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | the opened day is ringed in the window's own cyan; nothing on the month says late or timed |
| 2 | Match with the real world | 3 | the squadron's own words; "+3" is borrowed |
| 3 | User control and freedom | 3 | Escape peels layers, undo and redo, the window drags and closes |
| 4 | Consistency and standards | 3 | one card on three screens; the kind's look, and two different add forms, diverge |
| 5 | Error prevention | 3 | delete asks first; a bar can be dragged to new dates by accident (undo covers it) |
| 6 | Recognition rather than recall | 2 | who is in a shared input, and its hours, sit behind a hover on the month |
| 7 | Flexibility and efficiency | 3 | arrows, Enter, Escape, filters, search, group filing |
| 8 | Aesthetic and minimalist design | 3 | a quiet two-colour month; the list's form and its small print are the noise |
| 9 | Error recovery | 3 | the failed-save band exists; not seen in this vet |
| 10 | Help and documentation | 3 | "How this works" in place; bar tooltips |

**Specificity:** authored for this product — red / amber carried from the schedule, callsign-first bars, the squadron's
codes, the LATE word, "By Saber", a day window that leaves the month workable. The month's skeleton is Google
Calendar's, by his choice (D626).

**The detector:** the three screen files scan clean (their sizes and colours live in the stylesheet). In the running
page it flags, on these screens: small text in the input's window and the list's form (the small calendar's weekday
letters 8.5px, its "today" corner number 7.5px, labels 10–10.5px — deliberate density, the far end of it); the Medical
count badge, white on red, 3.4 : 1 at 10px (wants 4.5 : 1); a heading level skipped (h1 "Inputs" then h4). Judged
false alarms: "text covered" on the day numbers (a click layer under them), the cyan accent as an "AI palette", the
window's shadow.

## Priority issues

1. **[P1] The list opens on a form, not on the list.** On a phone the add form fills the whole first screen; on a
   desktop the table starts 45% down. It is a SECOND, different form from the calendar's window ("How long: All day /
   AM / PM / Custom" against "When: all day"; "Add input" against "Add"). *Fix:* remove the inline form; one "+ Input"
   beside the dates button opens the calendar's window. **(V1.)** It removes a door, so its check is not a LOOK — the
   list form's own rules (the OIL question, the medical question, a document, several people, `[CARD-CHECK-SEEN]`) must
   each be found in the window first, as the pencil's were.
2. **[P1] A shared input's bar names the wrong person.** The bar leads with the alphabetically first member whatever
   the person filter or the viewer ("Drifter +3 · Meeting" on a month filtered to Saber). *Fix:* the count first — "4 ·
   Meeting", "9 · Squadron photo" — so a cut-off bar never loses it; when the month is filtered to one person, or the
   viewer is in it, lead with him ("Saber +3 · Meeting"). **(V4.)**
3. **[P1, TO VERIFY FIRST] Hours may read am / pm in the two forms.** The time boxes are the browser's own and follow
   the device's setting ("05:00 pm" beside "17:00–18:30" on the card) — against the settled "every time reads 08:00".
   Seen in the pictures (a Windows browser); to be reproduced on his iPhone before any fix. *Fix if real:* the
   schedule's own time box.
4. **[P2] The desktop list says who and when twice.** "Placed by Bolt · 6 Jul 26, 09:10" under every remark, with the
   name in the first column and the date in the last; rows are two lines. *Fix:* "By Saber" only where someone else
   filed it or it is shared (the card's rule, D723 / D724), on the remark's line; the full stamp stays in the input's
   window. About 16 → 24 rows a screen. Narrows D629 for the table — his word. **(V2.)**
5. **[P2] Timed and all-day inputs look alike on the month.** A 30-minute photo draws as heavy as a day of leave.
   *Fix:* all-day stays solid; timed is the same colour as a tint with a solid edge. **(V4 — his taste, on the picture.)**
6. **[P2] A saved shared input's window opens on the whole people picker** (about 75 pucks above Type, dates and
   hours). *Fix:* its own people in one row plus "Edit people".
7. **[P2] The desktop month re-lays when a day opens** — the columns narrow (about 204 → 138px at 1440) and the date
   clicked moves from under the pointer; the filter row wraps too. Against "a control tapped repeatedly must not move".
   *Fix to weigh:* on a wide screen the day window is open from the start.
8. **[P3] The open day and the keyboard's focus wear the same cyan ring.** *Fix:* the focus ring in white.

## The words (D726), ranked by reading saved

| Where | As built | Suggested |
|---|---|---|
| The desktop list, under every remark | "Placed by Saber for 4 people · 25 Jun 26, 14:32" | "By Saber", only where someone else filed it or it is shared (V2) |
| A several-day input's card | "Medically down till 17 Jul" beside "till 17 Jul" | "Medically down" (the card-questions mock-up, question 3) |
| A saved input's window | "To change its dates, tap the new start on the calendar above, then the new end — for one day, tap that day and Save. The line under the calendar shows what Save will write." | remove; a shared input keeps "Date changes apply to all 4." (V3) |
| A new input's window | "Choose the dates and the hours. Save adds one input covering the whole date range." | remove (V3) |
| "How this works" | five lines | "Tap a day to open it. Tap a bar to edit it, drag to move it." · line 2 removed (the colour key says it) · "Several days: drag across them (phone: hold, then drag)." · "NF no-fly · green public holiday · grey Off day." · the cut-off line stays (V5) |
| Phone filters | labels "Person", "Type", "Search" | remove — the boxes read "Everyone", "All types", "Search inputs" (V5) |
| The empty list | "No inputs between 10 Oct → 24 Oct. Change the dates, or pick "All dates"." | "No inputs 10–24 Oct. Try All dates." (V5) |
| LATE's tooltip on the list | "Late input — last changed 2 Jul, after the 29 Jun deadline for its week of 13 Jul." | "Changed 2 Jul — after the cut-off, Mon 29 Jun." ("deadline" and "cut-off" are two words for one thing) (V5) |
| The gear's settings | three helper sentences | "Day, night or no-fly dates, and holidays." · "Later than this is LATE. Medical is never late." · "Members may file duties for others" / "Never leave, medical or SANS." (V5) |
| Small labels | "LAST MODIFIED" · "Default window" · "Add input" · "New input · Jul 23" · "all day" · "duty or commitment" | "CHANGED" · "Default range" · "Add" · "23 Jul" (day first, as everywhere) · "All day" · "duty" (V5) |
| A leave's and an upchit's hint (the schedule's dialogs) | "Pick the dates on the calendar — the remarks carry the till date automatically, and a leave syncs to the Inputs page and Leave War." | remove; the upchit's: "Pick the day he is fit to fly. The medical entry ends the day before." |

**To STAY:** the colour key; the cut-off line of "How this works"; "By Saber"; LATE and its reason; the day headings
with their counts; "pick a start date"; the settings' worked example ("For the week of Mon 26 Oct, inputs are due by
the end of Mon 12 Oct" — it is what makes "14" clear); the whole type help (opened on demand, and the only place that
says ATT B may still stand a duty); the OIL lines; "Placed by Ranger · 29 Jun 26, 09:07" inside the input's own window.

## Smaller observations

- One WHEN column on the desktop list in place of START and END (END is blank on most rows).
- The small calendar rings a fixed "today" (13 Jul, the demo's) while the month uses the real date; drawn as a ring
  beside a filled day it reads as a range. Likely the demo's fixed date — weigh at the database step.
- Buttons take a different typeface from text where no font is loaded (app-wide; `font-family:inherit`).
- The colour key's swatches are brighter than the bars.
- On a desktop the opened day's full-width "+ Input" is a phone pattern; beside "+ Note" it would lift the list about
  50px — a button's size and place, so his word (D487).

## On the three choices already with him (`docs/mock/card-questions.html`)

The design review, asked blind: **B** (small grey capitals on every screen — a pill on a card puts a second capsule
beside LATE, and only B meets D718's "one look everywhere"); **yes** to leaving the automatic "till …" out of the
remark on the card; the month's shared bars **changed** to the count first.
