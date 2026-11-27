# Section 1: the three wordings, reviewed and adjusted by a fresh Fable (chat A211, 28 Nov 26)

His D2441: Opus drafted (`2026-11-28-msq-s1-words-draft.md`), this is the fresh Fable's review. Read whole first:
`design-practices.md` head, §0, §1, §1a, §1b, §9; `design.md` §Saving. Code read beside each place:
`ui/HolidaysPanel.tsx` (the waiting line and its wait), `ui/guard.ts` (the Calendar's close), `leavewar/sync.ts
openNewPeriod`, `ui/inputedit.tsx` (`whoDoorRefusal`, `acrossMoveWords`, `sharedRefusal`), `ui/InputWindow.tsx` (the
foot's `inped-ro` line), the K10 plan §0, §3.1, §4.3, §5, §7.4, §9, the drawer's picture, and the full rows of D2837,
D2240, D2241, D2336, D2847. No source file changed, nothing committed.

The lines in quotation marks are what the screen shows. The roles in brackets belong to the examples only.

**Not done here, and still owed before any of these reaches him:** the cold read by someone else (§1a test 9, §1b
test 11) of each adjusted line, the box measured on a phone (§1a test 1), and the drawing on the real app (D1625).

---

## The short answer

| Piece | Start from | Adjusted words | Ready to draw? |
|---|---|---|---|
| 1 | the draft | kept as drafted | yes, after one check for the builder (below) |
| 2 | the draft | reworded in its second half | yes for the main case; variant b waits on the planner |
| 3 | the draft | one word cut — but its "who" claim is not true in the app today | only with `[XFER]`'s gate change; otherwise the fallback line |
| The family | — | agreed, with two conditions | his to approve as one change, with pictures |

---

## 1. The waiting holiday's line (D2837)

**Adjusted words: the draft, unchanged (21 words; today's is 16, so "longer", by 5).**
> It is kept only while this window stays open, and saved by itself as soon as a leave period covers it.

**Why the draft and not its alternative.** D2837's own words are that the form says the holiday "is kept only while
the window stays open". The draft says exactly that and changes nothing else: "here" is swapped for "only while this
window stays open", and the second half is today's, word for word. The alternative ("…Closing this window before then
drops it.") rewrites the whole line, puts the cost in a second sentence with two more "it"s, and uses "drops", which
is not a word the app uses for this anywhere (the guard's notes say "cancel the new holiday"). The draft is one
sentence a person would say, and "only" carries the warning.

**Every fact is still there:** not saved yet (the red line above it and "kept"); saved by itself once a leave period
covers it; lost if the window closes first ("only while this window stays open").

**Claims checked against the app:**
- "this window": true of both ways out. The form's own ✕ and Cancel unmount it, and the Calendar's ✕ closes the form
  with it (`guard.ts closeCalendar`). True for "Change a holiday" too, where what is lost is the change, the saved
  holiday staying as it was.
- "saved by itself as soon as a leave period covers it": true (`coveredNow` presses the same Save). Today's words
  already claim it.

**One thing for the builder to check before this is built — a claim that could become untrue.** The second button
under the line, "Add a leave period for 1 – 31 Aug…", changes page to the Leave War through the page door
(`openNewPeriod` → `ownPageRefused`, `setPage`). Today the holiday form stays up across that. KR-4 converts the page
door from refusing to closing what is open. If, after KR-4, that press ever closes the Calendar, the button the line
offers as the way to save the holiday would itself drop it. Example: Saber (master admin) presses "Add a leave period
for 1 – 31 Aug…" under the line and the holiday is gone when he comes back. KR-4 needs a test that this press leaves
the waiting form open.

**An option for him, not taken unasked (§0: nothing built is reworded beyond what he asked).** The line opens on
"It", straight after the red line "No leave period covers 9 Aug 27 yet.", where "it" could first be read as the leave
period. Naming it would read: "The holiday is kept only while this window stays open, and saved by itself as soon as a
leave period covers it." (two words more). Today's line already opens on "It" and he did not correct that, so the
draft keeps it.

**Agreed with the drafter:** the squadron switch is not named (the switch closes the window, and the line already
covers closing; lesson 97). The test and the two comments in `guard.ts` that quote today's sentence change with the
build.

---

## 2. K10-f's refusal at Save

**Start from the draft, not the alternative.** The draft opens as its approved sibling at the same door does
("Blocked: Ranger is 149's from Thu 16 Jul…", D2240), so the family reads alike (§1b test 9). The alternative joins
its reason with "as", which can be read as "because" or "while", and its "the later days" loses the dates a person
needs to act (§1a: every number).

**Adjusted words (the main case):**
> Blocked: Ranger is 149's from Thu 16 Jul, so with these dates this leave would be 149's. End it by Wed 15 Jul, and file Thu 16 – Sat 18 Jul as new leave on 149's page.

*Example:* Ranger (member) has local leave Tue 14 – Wed 15 Jul and moved from 142 to 149 on Thu 16 Jul. On 142's
Inputs list Saber (master admin) opens it, changes the end to Sat 18 Jul and presses Save. The grey note shows the
words above, and the window stays open with his dates.

**What changed against the draft, and why:**
- Swapped: "these dates would take his leave to 149" → "with these dates this leave would be 149's". Two reasons.
  "Take his leave" reads two ways (to take leave is also to go on leave). And the app's own way of saying whose a
  thing is, is "is 149's" — the same sentence already says "Ranger is 149's". No fact lost: these dates, this leave,
  149.
- Kept: the opening, the link "so" (true: the leave would be 149's because he is 149's from that day —
  `holderOf`), both dates of the remedy, the page to file on.
- Kept out, as the drafter left it: "Nothing was saved." The sibling at this door does not say it, and the open window
  with his dates shows it.

**Facts, each found in the words:** who moved, where and from which day · that these dates would make the leave the
new squadron's · the way to put it right, with its dates and its page. Nothing saved: shown by the note and the open
window.

**Claims the builder must press on the running app before the words are drawn (§1: an error names the form that WILL
work).** I did not run them:
- that Saber (master admin) can file Thu 16 – Sat 18 Jul for Ranger (member) as new leave on 149's page;
- that ending the draft at Wed 15 Jul then saves.
If either is refused, the remedy sends him into a second refusal and the words go back.

**A point for the planner, not a wording one.** The remedy leaves Ranger's (member) leave as two inputs, one in each
squadron. D2847 describes leave across a move as "one input, never cut". The other way out — delete it and file Tue
14 – Sat 18 Jul whole on 149's page — keeps one input. Which of the two the app should point to is the planner's
call; the words follow it.

### The variants

- **a. The new dates all fall after the move.** The draft's "File it as new leave on 149's page, and delete this one"
  has "it" and "this one" for the same leave. Adjusted:
  > Blocked: Ranger is 149's from Thu 16 Jul, so with these dates this leave would be 149's. File Thu 16 – Sat 18 Jul as new leave on 149's page, then delete this one.

  "then" is the true order: filed first, so nothing is lost if the filing is refused.
- **b. The mirror on 149's page** (a carried leave cut back to before the move). **Do not build these words yet.** The
  drafter could not tell whether this case is refused at all, nor whether 142's page will take Tue 14 – Wed 15 Jul for
  a man who is now 149's; a remedy that is itself refused is worse than none. If the planner confirms both, the family
  keeps its one opening rather than a new "was 142's until":
  > Blocked: Ranger is 149's from Thu 16 Jul, so leave that ends before then is 142's. Keep a day from Thu 16 Jul in it, or delete it and file Tue 14 – Wed 15 Jul as new leave on 142's page.
- **c. A kind other than leave.** "this input" for "this leave", and "as a new input" for "as new leave". Agreed.
- **d. A man, ALL or ALL AVAIL added.** The drafter found no way to reach it. No words are written for a path nothing
  reaches (§1a test 0). If the builder finds one, it comes back for words.

**When the man himself meets it on his own 149 page.** Example: Ranger (member) stretches his old Tue 14 – Wed 15 Jul
leave to Sat 18 Jul from his own page. "On 149's page" would point him to the page he is on, so the builder drops
those three words there: "…and file Thu 16 – Sat 18 Jul as new leave." Whether he should be refused at all is the
planner's or his question — D2847 says leave across his move may be changed by him.

**Order at the door (agreed with the drafter):** the who-rule's refusal runs first. Hunter (142's admin) stretching
the same leave gets the approved "Only Ranger or an admin of both 142 and 149 can change leave that runs across his
move." These new words reach only an admin of both squadrons or the man himself.

---

## 3. The read-only line when the input has gone with a moved man (K10-d)

**Start from the draft.** It names one role once (lesson 98, D2336), gives the day, and says whose the input is —
the same shape as two lines already in the app: "This is 149's set-up. Only an admin of 149 can change it." (Admin)
and "He is 149's. Only an admin of 149 can change his account." (Users). The drawer's list of three kinds of people
rightly goes.

**Adjusted words — one word cut:**
> Ranger moved to 149 on Thu 16 Jul, so this input is 149's. Only Ranger or an admin of 149 can change it.

*Example:* Ranger (member) has leave Tue 14 – Sat 18 Jul and moved from 142 to 149 on Thu 16 Jul. On Fri 17 Jul
Hunter (142's admin) taps it on 142's Inputs list. It opens read only with this line at its foot, left of "Close".

- Cut: "now" (a helper word beside a verb that stays — §1a test 2's fifth kind; "is 149's" already says today). Its
  proof is the cold read, still owed.
- "moved to 149 on Thu 16 Jul" is kept over the sibling's "is 149's from Thu 16 Jul": the drafter is right that it
  stays true if Ranger (member) later moves on to 150 while the leave stays 149's. "Moved" matches the approved
  refusal's "his move".

### A claim the app does not make true today — the main finding

**"an admin of 149 can change it" is not true of the app as built.** The save check still judges by the input's days.
Kestrel (149's admin) changing Ranger's (member) carried leave is refused today, in the approved words "Only Ranger or
an admin of both 142 and 149 can change leave that runs across his move." So with the draft built alone, Hunter
(142's admin) reads that Kestrel (149's admin) can change it, Kestrel (149's admin) tries, and is told only an admin
of both can. The right for 149's admins is D2847's, filed under `[XFER]` with the security reader, and K10 does not
change who may write (the plan §0 item 7, §5).

So one of two, the builder's and the coordinator's choice by build order:
1. **`[XFER]`'s gate change lands with or before K10-d:** the adjusted words above.
2. **K10-d lands first:** a line that makes no "who" claim and is true before and after `[XFER]`:
   > Ranger moved to 149 on Thu 16 Jul, so this input is 149's. It can be changed only on 149's page.

   This is the drafter's alternative turned to say what will work (§1b test 6) in place of "can't be changed on 142's
   page". It is true for every reader: Hunter (142's admin) has no 149 page to change it on; Saber (master admin) is
   told where to go; Ranger's (member) own page is 149's. It drops the fact "who may change it", so it is a stop-gap,
   replaced by the line in 1 when the gate changes.

**The same gate change makes an approved sentence untrue.** Once 149's admins may change carried leave (D2847), the
refusal "Only Ranger or an admin of both 142 and 149 can change leave that runs across his move." is no longer
right. `[XFER]` must reword it in the same change, put to him, since he ruled those words (D2240).

**Not checked by me either:** whether a member may change his own medical downchit. If he may not, the medical case
reads "Only an admin of 149 can change it." The builder settles it from the save check before the line is drawn.

### Its pair — a move saved ahead

Kept as drafted. It is the same sentence turned round (§1b test 9), and its claim is true today, because every day of
that input is still 142's:
> Nasty moves to 149 on Mon 20 Jul, so until then this input is 142's. Only Nasty or an admin of 142 can change it.

*Example:* Nasty (member) has an open OML and a move to 149 saved for Mon 20 Jul. Kestrel (149's admin) opens it on
149's Medical tab. (The medical point above applies to "Only Nasty".)

---

## The proposed family for today's untrue line

**The proposal:** "Only <man> or an admin of <its squadron> can change this.", and "an admin of both 142 and 149" for
an input that runs across a move.

**Agreed. It is the right family.** It is lesson 98's shape, it matches the two lines of the same kind already in the
app, and "both 142 and 149" is word for word his approved phrase (D2240, D2336). Today's bare "or an admin" is untrue
for exactly the person most likely to act on it. Example: Hunter (142's admin) opens Osprey's (149's member) input on
149's View-only Sched and reads "Only Osprey or an admin can change this." Hunter (142's admin) is an admin and cannot.

**Name the squadron always, a member's view of his own squadron included.** Example: Nasty (member) opening the
leave of Tally (member), another 142 man, would read "Only Tally or an admin of 142 can change this." — two words more. One sentence with no
second version is the family speaking alike, and the bare "an admin" is the form that goes wrong the moment a second
squadron is in view. This is my recommendation; the choice is his, as the drafter says.

**Two conditions before it is put to him:**
1. **"Both 142 and 149" has a short life for leave.** It is true today. After `[XFER]` (D2847) a carried leave is
   changed by an admin of the new squadron alone, so that member of the family changes again. If `[XFER]` is close,
   build the family once, after it.
2. **The line for several people, ALL or ALL AVAIL is not ready.** `sharedRefusal` ("Only Saber — who filed it — or an
   admin can change this for everyone") serves the window's foot and four refusals at other doors, so it changes in
   all of them at once. And for an input whose people sit in two squadrons I could not confirm from the code whether
   an admin of either squadron, or only of both, may change it. Until the builder states that from the save check,
   "an admin of <its squadron>" there would be a guess. Its dashes are built words too, his to keep or change.

**It is a change to words already on screen, in three or more places.** By §0 and §1b test 9 it goes to him as one
change, each place with its picture before and after — not built on the guide's word alone. The bell-line case
(Hunter (Plan of 149, View of 150) on Osprey's (member) Training after Osprey's (member) move to 150) is one of the
two looks D2835 already owes him as a drawing; the new words go on that drawing.

---

## Flags, in one list

| # | What | Whose |
|---|---|---|
| 1 | Piece 3's "an admin of 149 can change it" is untrue until `[XFER]`'s gate change; build the fallback line or wait | coordinator, builder |
| 2 | After `[XFER]`, the approved "admin of both 142 and 149 … across his move" refusal becomes untrue and must be reworded with him | `[XFER]` |
| 3 | Piece 2's remedy (file the later days on 149's page; end it by Wed 15 Jul) not yet pressed on the running app | K10-f's builder |
| 4 | Piece 2: two inputs against D2847's "one input, never cut" — which remedy the app should point to | planner |
| 5 | Piece 2 variant b: whether it is refused, and whether its way out works — no words built until known | planner |
| 6 | Piece 2: whether the man himself is refused on his own page | planner or him |
| 7 | Piece 1: after KR-4, does "Add a leave period for…" still leave the waiting form open? | KR-4's builder |
| 8 | Piece 3 and its pair: may a member change his own medical downchit? | K10-d's builder |
| 9 | The family: who may change a several-people input across two squadrons | builder, from the save check |
| 10 | Cold read, phone measurement and drawing still owed for every line here | the host |
