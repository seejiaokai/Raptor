# Section 1: three pieces of on-screen wording, drafted (chat A211, 28 Nov 26)

Drafted by a fresh Opus helper from `2026-11-28-msq-s1-words-draft-brief.md` (his D2441: Opus drafts, then a different
fresh Fable reviews and adjusts the words before they reach him). Read first: `design-practices.md` head, §0, §1, §1a,
§1b, §9; `design.md` §Saving; `inputs.md`. No source file was changed. Every example was checked against the code on
branch `a211-s1` (the files named under each piece). The lines in quotation marks are what the screen shows; the
roles in brackets belong to the examples only and never appear on screen.

The people in the examples are the demo's own: Ranger (member; 142's until his move), Saber (master admin), Hunter
(142's admin, `prowler`), Kestrel (149's admin), Nasty (member) and Osprey (149's member).

---

## 1. The waiting holiday's line (his D2837)

**Where it sits.** `src/ui/HolidaysPanel.tsx`, the "Add a holiday" window opened from the Calendar, the
`hol-waiting` line (about line 416). It shows only when Save was refused because no leave period covers the
holiday's first day (`waiting && gap`). Directly above it is the red line from the Leave War's store, for example
"No leave period covers 9 Aug 27 yet."; directly below it is one button, either "Create the 2027 leave period" or
"Add a leave period for 1 – 31 Aug…".

**Today (16 words):** "It is kept here, and saved by itself as soon as a leave period covers it."

**Draft (21 words, longer by 5):**
> It is kept only while this window stays open, and saved by itself as soon as a leave period covers it.

**Alternative (20 words, longer by 4):**
> It is saved by itself as soon as a leave period covers it. Closing this window before then drops it.

**Worked example.** Saber (master admin) adds "National Day" on Mon 9 Aug 2027. No leave period covers 2027, so Save
is refused. The window shows "No leave period covers 9 Aug 27 yet.", then the line above, then "Create the 2027 leave
period". If Saber (master admin) presses that button with the window still open, the holiday is saved by itself. If
he presses ✕ or Cancel first, closes the Calendar, or switches squadron, the holiday is dropped with no note (D2837).

**What changed against today's wording (§1a test 8):**
- Swapped: "here" became "only while this window stays open". "Window stays open" is his own wording in D2837. "Only"
  is the warning, and it must stay: closing the window costs him what he typed (§1, "No warning is dropped").
- Kept: "and saved by itself as soon as a leave period covers it" is word for word as today.
- Added, and how each addition is known true: closing drops it. The ✕ drops it (D2837; `ui/guard.ts` closeCalendar's
  comment). Cancel unmounts the form. A squadron switch closes the window (KR, D2825), and D2837 says no note
  is raised. A page change made by "Add a leave period for…" does not drop it: that button goes to the Leave War page
  (`leavewar/sync.ts` openNewPeriod), and the holiday form is a window that stays up across pages (`guard.ts` row
  `holiday: 'any'`; `holidayspanel.test.tsx`: "Days stays up").

**Facts it must keep:**
- The holiday is not saved yet.
- It is saved by itself once a leave period covers it.
- That holds only while this window stays open; closing it loses the holiday.

**Unsure of, for the reviewer:**
- **"This window" or "the Calendar".** The form is its own window, "Add a holiday", drawn inside the Calendar window,
  and closing either one drops the holiday. "This window" is true of both, so I kept it.
- **Whether to name the squadron switch.** I left it out. Lesson 97 asks for a short in-window line, and the switch
  closes the window anyway. His D2837 asks only that the words say the holiday is kept while the window stays open.
- **Typing in the form also ends the wait.** Any edit after the refusal clears it (`edit()` sets waiting to false), and
  the line then disappears. The line never has to say so, because it is only on screen while the wait holds.
- **Code that quotes today's words:** the test `holidayspanel.test.tsx` (about line 211) and two comments in
  `ui/guard.ts` (about lines 153–155) quote today's sentence. They change with the build.

---

## 2. K10-f's refusal at Save

**Where it sits.** The Input window's save door, `src/ui/InputWindow.tsx` `save()`. The words are raised in the grey
"Blocked:" note (`HOOKS.toast(why, 'blocked')`, design.md §Saving). The new check sits beside the who-rule's refusal
(`whoDoorRefusal`, about line 766), and its words live with that refusal in `ui/inputedit.tsx`. The window stays open
with the draft as typed.

**Its family (§1b test 9).** The nearest relative is a wording he approved (D2240, D2241). It is raised at this same
door by `acrossMoveWords`:
"Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs
across his move."
The draft opens the same way: who moved, to which squadron and from which day. Like that wording, it has no
"Nothing was saved." That phrase belongs to the schedule's refusal family (`reasonRefusal`, D1669). It is offered
below as an option.

**A correction to the brief's example.** As the brief gives it, Ranger's (member) leave runs Tue 14 – Sat 18 Jul,
which already runs across his move on Thu 16 Jul. Once the move has run, that leave is carried to 149, and on 142's
page its window opens read only (the K10 plan §4.3 case 4, his Q1 choice A). It never reaches Save there. The case
that does reach this refusal is leave that ended **before** the move and is then stretched past it. The example
below uses Tue 14 – Wed 15 Jul, stretched to Sat 18 Jul.

**Worked example.** Ranger (member) has local leave from Tue 14 to Wed 15 Jul. He moved from 142 to 149 on Thu 16 Jul,
and today is Fri 17 Jul. The leave is still 142's because it ended before his move. On 142's Inputs list, Saber
(master admin, an admin of both squadrons) opens it and changes the end date to Sat 18 Jul. With those dates the
leave runs past the move, so it would go with Ranger (member) to 149 (`holderOf` gives 149; the window stands on
142). He presses Save.

**Draft:**
> Blocked: Ranger is 149's from Thu 16 Jul, so these dates would take his leave to 149. End it by Wed 15 Jul, and file Thu 16 – Sat 18 Jul as new leave on 149's page.

**Alternative (what the change would do comes first):**
> Blocked: these dates would take Ranger's leave to 149, as he is 149's from Thu 16 Jul. End it by Wed 15 Jul, and file the later days on 149's page.

**Variants the same check raises.** The builder picks the variant by case, and the Fable reviewer words each one:
- **a. The new dates all fall after the move** (Tue 14 – Wed 15 Jul moved to Thu 16 – Sat 18 Jul; this case is
  refused even before the move has run, because a record with no day on 142 is 149's by its first day):
  > Blocked: Ranger is 149's from Thu 16 Jul, so these dates would take his leave to 149. File it as new leave on 149's page, and delete this one.
- **b. The mirror on the new squadron's page.** Ranger's (member) carried leave of Tue 14 – Sat 18 Jul is cut back to
  Tue 14 – Wed 15 Jul on 149's page. With no day left after the move it would be 142's again:
  > Blocked: Ranger was 142's until Wed 15 Jul, so these dates would take his leave back to 142. Keep a day from Thu 16 Jul in it, or delete it and file the leave on 142's page.
  See "Unsure" below: I could not tell whether this case should be refused at all.
- **c. A kind other than leave** (a duty or commitment across the move, the plan's R6): say "this input" in place of
  "his leave" ("…so these dates would take this input to 149.").
- **d. A man, ALL or ALL AVAIL added.** See "Unsure": I found no case where this path is reached.

**Facts it must keep:**
- It opens with "Blocked:".
- Who moved, to which squadron and from which day. The day is the move into the squadron the record would go to.
- That these dates would take the record to that squadron.
- The way to put it right: end it the day before the move, and file the later days on the new squadron's page.
- Nothing is saved. The grey note and the window staying open with his draft say this; the words need not.

**Unsure of, for the reviewer and the builder:**
- **The man himself is refused on his own page.** Ranger (member) is 149's now. His old 142 leave of Tue 14 – Wed 15
  Jul opens live on his 149 page, because his pages may never be 142 (D2621, `letOpenOn` case 1). If he stretches it
  to Sat 18 Jul there, the record would move from 142 to 149, so by the plan's §0 item 4 and §4.2 item 2 he is refused
  too. The words still read true, because his page is 149's, but "file … on 149's page" is odd when he is already on
  it. The builder could drop "on 149's page" when the window stands on 149. Whether refusing him here is meant at all
  is the planner's or his question, not a wording one.
- **Who reaches these words.** The check that runs first is the existing who-rule. It catches anyone who may not
  change leave across a move. For example, Hunter (142's admin, no right in 149) stretching the same leave gets the
  approved words above, "…Only Ranger or an admin of both 142 and 149 can…". So K10-f's words reach only an admin of
  both squadrons, a master admin, or the man himself. The builder should keep that order.
- **Variant b may have no way out.** On 142's page a carried leave is read only (Q1 A). If 149's page also refuses
  cutting it back before the move, the only route left is delete-and-refile. Whether 142's page may then file Tue 14
  – Wed 15 Jul for him is the planner's question.
- **Variant d (a man, ALL or ALL AVAIL added) — no path found.** By today's `inputSqn` (`state/inputsqn.ts`), adding
  someone turns a one-man record into a group, and a group is never carried (R8). It is then the page's own wherever
  any man's days touch the page (`inputSquadrons`). A carried leave or duty always touches its holder, because the
  holder is his squadron on its last day. The only carried record that does not touch its holder is an open medical
  downchit, and a medical entry cannot hold a second person ("A medical entry is one person's own…", the save
  door). So I found no case where adding a man moves a record off its squadron. The plan's §7.4 example, "adds a 149
  man to it" for a carried OML, is refused earlier by that medical sentence. If the builder finds a path, the shape
  would be: "Blocked: with Osprey in it, this input would be 142's. Take Osprey out, or file his on 142's page."
- **"Nothing was saved."** I left it out to match the across-move sibling at the same door. Adding it would match
  the D1669 family instead.
- **The date format.** "Thu 16 Jul" is `noticeDay`, the sibling's format. A range is printed with " – ", as the
  holiday form's `gapSaid` prints one.

---

## 3. The read-only line in an input's window when the record has gone with a moved man (K10-d)

**Where it sits.** `src/ui/InputWindow.tsx`, the window's foot, the `inped-ro` span (about line 1395). It sits left of
the "Close" button, after the paperclip where the input has a document. Today the one-man line is
`` `Only ${who || 'its owner'} or an admin can change this.` `` The line for several people, ALL or ALL AVAIL comes
from `sharedRefusal` ("Only Saber — who filed it — or an admin can change this for everyone."). The drawer's picture
`docs/mock/2026-11-28-msq-k10-q1/q1-2-choiceA-read-only-proposed.png` shows the line in that place, two lines tall
at a desktop's width.

**Worked example (the plan's Q1).** Ranger (member) has leave Tue 14 – Sat 18 Jul. He moved from 142 to 149 on Thu
16 Jul, so the leave went with him to 149 (D2847). On Fri 17 Jul, Hunter (142's admin) opens 142's Inputs list and
taps the leave. It opens read only (Q1 choice A).

**Draft:**
> Ranger moved to 149 on Thu 16 Jul, so this input is 149's now. Only Ranger or an admin of 149 can change it.

**Alternative:**
> Ranger moved to 149 on Thu 16 Jul, so this input is 149's now and can't be changed on 142's page.

The alternative makes no claim about who may change it. Choose it if the gate change below is not built with K10-d.

**Its pair: a move saved ahead.** The record has not moved yet, and the page is the squadron he moves into (K10 plan
§4.3 case 4, "on 149's ahead of a saved move"). The pair is the same sentence turned round (§1b test 9):
> Nasty moves to 149 on Mon 20 Jul, so until then this input is 142's. Only Nasty or an admin of 142 can change it.

Example: Nasty (member) has an open OML and a move to 149 saved for Mon 20 Jul. Kestrel (149's admin) opens it on
149's Medical tab, where it shows as one of 149's ahead of the move. Without this pair, the draft above would
say "moved" of a move that has not happened.

**Against the drawer's draft ("Ranger has moved to 149. Only Ranger, 149's admins or a master admin can change
this."):**
- Lesson 98 (D2336) says a line about who may act names one role once ("Only an admin of 149 can give access to
  149."). "An admin of 149" already covers 149's own admins, a Plan holder of 149 and a master admin, so the list of
  three goes.
- The date is added. It is the same fact, in the same form, as the approved refusal's "is 149's from Thu 16 Jul", and
  it tells Hunter (142's admin) why the leave is still on his list for its first two days.
- "So this input is 149's now" is added. It is the reason the window is read only, and it is what tells Saber (master
  admin), an admin of 149 who is reading it on 142's page, that it is changed on 149's page.

**How each part is known true:**
- The squadron is the record's holder (`holderOf`). The day is the move into that squadron: the latest day his home
  became the holder's, on or before the day the holder is read (`homeChangesOn`). It is **not** his squadron today.
  Ranger (member) moved on again to 150 on Mon 20 Jul keeps the leave at 149 (the plan §2.1). "Ranger moved to 149 on
  Thu 16 Jul, so this input is 149's now" stays true, where "Ranger is 149's" would not.
- "Only Ranger…": the man may change his own carried input from his own page (`letOpenOn` case 1, D2621). Today's line
  makes the same claim for any kind of record.

**Facts it must keep:**
- Who moved, to which squadron and on which day.
- That the input is that squadron's now, which is why it is read only here.
- Who may change it: the man, or an admin of that squadron.

**Unsure of, for the reviewer and the builder. The first is a fact to settle before the draft is built:**
- **"An admin of 149 can change it" is not yet true in the app.** The gate still judges by days (the plan §5). To save
  Ranger's (member) carried leave of Tue 14 – Sat 18 Jul, Kestrel (149's admin only) needs to be "an admin of both 142
  and 149", and today he is refused at Save in those approved words. A carried open medical record whose days are all
  142's can be changed by 142's admins today, and by 149's only through an Upchit (R13). Letting 149's admins change
  them is D2847, filed under `[XFER]` with the security reader. Either `[XFER]`'s gate change lands with K10-d, or the
  line takes the alternative (no "who"). Otherwise Kestrel (149's admin) is told he may change it, then refused.
- **Medical records and "Only Nasty…".** I did not check whether a member may change his own medical downchit
  (`medicalLocked`, `protectedInput`). Today's line makes the same claim for every kind. If he may not, the
  medical case reads "Only an admin of 149 can change it."
- **Size.** The draft is 21 words against the drawer's 16, and still two lines at a desktop's width in the drawer's
  picture. Not measured on a phone (§1a test 1).

### Does today's line need the same fix elsewhere? Yes, in three places

Today's line says "or an admin", and an admin reading it is the case where that is untrue. That happens wherever the
window opens read only for an admin:

1. **Another squadron's input, read only to an admin of neither** (the window's `foreign` test, step A). Example:
   Hunter (142's admin, View of 149) opens Osprey's (149's member) input on 149's View-only Sched and reads "Only
   Osprey or an admin can change this." Hunter (142's admin) is an admin. It should say "an admin of 149".
2. **`letReadOnly` case 3 (R12).** Example: Hunter (Plan of 149, View of 150) presses a 149 bell line about Osprey's
   (member) Training after Osprey moved to 150. The plan keeps today's look until D2835's drawing, so Hunter (an admin
   of 149) is told an admin can change it. It should say "an admin of 150".
3. **The line for several people, ALL or ALL AVAIL** (`sharedRefusal`), on a foreign input: "…or an admin can change
   this for everyone". The same untruth for the same reader. The same function also gives a refusal's reason at Save,
   so changing it there changes the refusal too.

**Recommendation:** one line, worded as one family, with each change put to him together (§1b test 9):
"Only <man> or an admin of <its squadron> can change this." <its squadron> is the input's own (`inputSqn`). For an
input that runs across a move it is "both 142 and 149", as the approved refusal says. A member's view (another man's
input in his own squadron) is true today as it stands. Naming the squadron there too keeps the family alike, but adds
words on a one-squadron day. That choice is his.

---

## For the Fable reviewer: the facts list, piece by piece

| Piece | What happened | Why | What it costs | Where to put it right |
|---|---|---|---|---|
| 1 | the holiday is not saved yet | no leave period covers it | lost if this window closes first | create or add the leave period with the window open |
| 2 | Save refused | the dates would take the record to the squadron he moved into | nothing saved (the note and the open window show it) | end it the day before the move; file the later days on the new squadron's page |
| 3 | the window is read only | the input went with the man to his new squadron on that day | — | the man, or an admin of that squadron |
