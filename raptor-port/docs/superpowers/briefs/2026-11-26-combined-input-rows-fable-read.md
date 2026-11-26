# Fable's read of the combined-input-rows plan (26 Nov 26)

Read: the plan whole (with the added "Likewise Personal Inputs" paragraph); the full rows of D655, D658, D661,
D734–D743, D745, D748, D755–D757, D759, D760, D762, D763, D770, D776, D917, D1586, D1784, D2219; the scheduler and
Inputs pages' lines on shared inputs and Unavailable; `[SHARED-ROW-HELD-LEFTOVERS]`; the shared-row evidence sheet's
head; and three code facts (named where used). Nothing was run on the app — every claim about what the app does today
is from the plan's own survey or from the code lines named, and is marked where I did not check it.

## 1. Verdict — sound with changes

The direction is right. One input drawn as several rows that look separate but act as one is the cause of a real
family of faults, and "the row is the input" (D755) is already his rule on the other two lists. Carrying it to
Unavailable removes a special case rather than adding one.

But as written the plan is not yet one rule, and it is silent on the case that matters most on this list. Four
things must be settled before it is a ruling:

- **A. The drop rule in the plan is not the Ground Programme's rule** (it says it is). See 2.1.
- **B. Absences run for several days; Ground Programme rows mostly do not.** Add and remove by a drop act on every
  day of the input, past and published days included. See 2.2. This is the largest gap.
- **C. Most leave rows will refuse the add.** A leave approved on the Leave War is one person's, by a refusal already
  in the app. See 2.3 and section 3.
- **D. The Board's Personal Inputs panel is today the place a dragged puck is dropped to take a man off his seat.**
  Making its lines "drop to add" collides with that. See 2.4.

## 2. What is missing

### 2.1 Two different drop rules under one name (the plan contradicts itself)
- **Case:** a scheduler at his desk drops Tally on Hex's puck in a three-man row.
- **What goes wrong:** the proposal says a drop on a puck REPLACES and a drop on the row ADDS. The plan then says this
  is "as on a Ground Programme row (D755, D757, D776, D861)". Its own survey says otherwise: on the Ground Programme a
  drop on a shared input's puck JOINS, and only a drop on a one-man input's only puck replaces (D755 (2); D776 "swaps
  or joins as on any input's"). So the same gesture would add a man on the Ground Programme and remove a man on
  Unavailable and Personal Inputs. That is the exact trick he is trying to remove, moved to a new place.
- **Add:** pick one rule for all three lists and say which rulings it changes. My lean: keep the Ground Programme's
  rule as built and tested (on a row of several, a drop anywhere joins; on a one-man row the only puck swaps, the
  "+ add" strip or empty part joins; replacing one of several is drag him off, drop the other on). Reason: on a phone
  a tall row is nearly all pucks, so "puck = replace" makes adding hard and an accidental replace easy, and a replace
  on an absence takes a man's leave or duty away. If he prefers "puck = replace" everywhere, it changes D755 (2) and
  D776 on the Ground Programme too, and that must be built in the same job.

### 2.2 Several-day absences: one man back early, one man joining late
- **Case 1:** six men on an overseas duty Mon–Fri. Hex flies home Wednesday night. On Thursday morning the scheduler
  drags Hex's puck off Thursday's row to free him.
- **Case 2:** Tally joins the same duty on Wednesday; the scheduler drops him on Wednesday's row.
- **What goes wrong:** who is in an input is the same on every day of it (D759 reading 5: "a person added to a
  several-day input is on every day of it"). So case 1 takes Hex out of Monday to Wednesday as well — days already
  flown and published; each becomes a change waiting, its four sign-offs fall (D103), and the record now says he was
  never away. Case 2 marks Tally away on Monday and Tuesday. The plan's answer ("taken off the row and filed on his
  own") is two steps and still disturbs the past days before the re-file puts them back. On the Ground Programme this
  seldom bites because a meeting is one day; under Unavailable nearly every row is a run of days. D737's own second
  reason — "each man's absence can end on its own day" — is exactly this, and the plan answers it only for leave
  (the Leave War) and not for a duty, a course or an attach.
- **Also:** D861 says a man dragged off an input's row "stays silent". Silent is wrong for a drag that removes five
  days of a man's absence, three of them published.
- **Add:** a stated rule for a drop or a drag-off on a row of a several-day input, drawn for him first (D1625). My
  lean: the drag-off on a day means "from this day on" — the man keeps the earlier days as an input of his own and is
  free from that day; a drop on a day adds him "from this day to the end", as an input of his own if the days differ.
  Either way a short note names the man and the days ("Hex taken out of OD, Thu 16 – Fri 17 Jul") with Undo. If he
  prefers "all days, always", the plan must say so, say that past published days go pending, and give the note. Also
  say plainly: "on a published day" in D736 means one change on EACH published day the input covers.

### 2.3 The add is refused on most leave rows
- **Case:** Hex has leave he bid for and had approved on the Leave War. The scheduler drops Tally on Hex's leave row to
  add him.
- **What goes wrong:** the app already refuses it — "A leave approved on the Leave War is one person's — file the
  other person's leave as its own input" (`src/engine/inputs.ts`, the `LW_OWN` line). Most leave reaches the schedule
  from the Leave War, so "drop on the row to add, everywhere" would answer no on most leave rows and yes on the few an
  admin filed from the Inputs page. Two leave rows that look the same would behave differently.
- **Not said either:** a man added to leave by a drop skips the Leave War's bid, its manning colours and its approval,
  and takes days off his leave balance. The plan should say whether that is intended (an admin can already file leave
  for several on the Inputs page, so it may be), and that the Leave War shows it at once.
- **Add:** see section 3 — I think this is the sign that leave belongs with medical.

### 2.4 Personal Inputs on the Board is the "take him off" drop place
- **Case:** on the Scheduler Board the scheduler drags Rune out of a flying seat and lets go over the lower panels to
  take him off, as he does today.
- **What goes wrong:** the survey itself records that while a puck from elsewhere is dragged over Personal Inputs the
  Board shows "drop to unassign", and letting go there takes the man off his row. If a Personal Inputs line becomes
  "drop to add", the same let-go would put Rune into somebody's request (and, by D755 (3), ring that member's bell and
  take the request out of the member's hands). The plan does not say which wins.
- **Add:** say where a puck is dropped to take a man off once the lines accept people, and whether a puck dragged from
  a seat onto an input's row MOVES him (leaves the seat) or COPIES him. Check what the Ground Programme does today and
  make all three the same.
- **Note for him:** "likewise Personal Inputs" is not a new rule. D776 already says a puck dropped on a Personal
  input's row "swaps or joins as on any input's", and D755 covers every row that came from an input. The line doing
  nothing is a build that never caught up with his ruling. No ruling changes for this part.

### 2.5 Reject, "→ Ground", and "take one man out" are three different things
- **Case:** eight men on a course under Unavailable; the course is off for Hex only.
- **What goes wrong:** Reject takes the whole input out of Unavailable (it stays an input, back under Personal
  Inputs). Dragging Hex off takes him out of the input altogether — for leave, his leave is gone, not "rejected". The
  plan says only "one button, the whole input". A scheduler who wants "reject it for Hex" has no door that does what
  the word means, and the two doors leave different records and different bell lines.
- **Add:** state both outcomes side by side, the bell line each sends the member (D755 (3), D815: "Taken out of
  Unavailable" is for the list, not for leaving the input), what a drag-off of a man from leave does to his leave
  balance, and that "→ Ground" and "press the type to change it" on a combined row act on everyone. Reject on a row
  of eight should say the number before or after ("8 people's CSE taken out of Unavailable" exists — keep it).
- This also answers the backlog's open question in `[SHARED-ROW-HELD-LEFTOVERS]` (4): with one row there is no "one
  man's Reject" left to ask about. The plan should say it closes that question.

### 2.6 The kind pressed on a combined row
- **Case:** the scheduler presses the kind on a row of three (the row lets the type be changed) and picks ATT C.
- **What goes wrong:** a medical for three people — the one thing the plan says cannot exist.
- **Add:** a retype of an input of several into a medical kind is refused with its reason, on the row and in the
  window; so is a drop that would add a second man to a medical row. Then "medical is one person's" is true at every
  door, not only at filing. (The survey checked ATT C and OML only; HL and ATT B should be checked too.)

### 2.7 ALL / ALL AVAIL
- A drop of ALL or ALL AVAIL on a leave, overseas duty, course or attach row must be refused with its reason (D712,
  D711, D1373). The plan does not list it.
- A Training or an Other that holds ALL AVAIL and is moved "→ Unavail" already exists as an idea; on a combined row
  the placeholder is one puck among the men (D755). Say so, and say what "everyone free is unavailable" means for the
  crew list — or refuse the move for an input holding a placeholder. His call.

### 2.8 A man added who is already away, or not in the squadron, that day
- **Case:** Tally is dropped on a Mon–Fri duty row; he is on leave Tuesday, or downed medically, or posted out
  Thursday, or SANS only from Wednesday.
- **Add:** the drop runs the same checks and questions as saving the input's own window — the clash question, the
  refusal for days he is not on the roster — never a quieter path. D759 reading 6 already takes a posted-out or
  deleted man out of the input; the row should simply stop drawing him from that day, the others unchanged.

### 2.9 Two squadrons
- **Borrowed men:** the row made by itself on a home schedule for a man another squadron is using ("ACADEMICS · 149"
  over "ATTACH", D2149) is not an input for several. Three men borrowed for one event must NOT be merged into one row
  by this change, and that row takes no drop. Say so.
- **A drop of another squadron's man** on our leave or duty row: refuse.
- **A man who moves squadron in the middle of a shared input:** the input then holds men of two squadrons. Whose
  scheduler may re-time or Reject it for everyone, and whose men does each schedule draw (D2194 — one squadron's
  business does not reach the other)? My lean: at the move he is given an input of his own. This is design-only work
  today, so it is a line for the multi-squadron batch, but the plan should file it rather than leave it unseen.

### 2.10 The LATE mark and OIL on the new row
- **LATE:** each man of an input can carry his own "changed late" date (a man added in the window after the cut-off).
  A row per man showed it on him alone; one row has one chip. Say which it shows (as the Ground Programme's shared row
  does today — check and state), and that a tap drops it for the input (D1586).
- **OIL:** a man dropped onto a weekend duty under Unavailable follows the input's answer; where there is none the
  scheduler is asked on the spot (D755 (1)). That question has never appeared on an Unavailable row. Name it as a new
  place, and check that "leave one man out in OIL Earn" (D762) can be reached for a row that lives under Unavailable.

### 2.11 Undo
- With one input for the group, more changes land on the same input, so "Undo refused because someone else changed
  this input" (D148, D759 reading 9) will be met more often than with rows that split off by themselves. Not a fault;
  worth one line so the walk expects it. A drag-off must be undone in one step, all its days.

### 2.12 The places that draw it — the plan lists none
The plan names Edit Schedule and the Board. The change also reaches, and each needs a "has it / must not, because":
View-only Sched; a look at an issued version (it must go on drawing what was issued); the printed or exported
schedule; the changes window and the Amendments panel (one line naming its people, D736); the history bubble and its
dot (now rightly the input's one story — this is what closes leftover (2)); a clicked warning lighting one man's puck
inside the row; the crew-rest ring on every copy of his puck (D1013); the waiting mark on an Unavailable row (D1784 —
drawn once, on the row); the member's bell; the phone layouts of the week and the Board.

### 2.13 The phone
- Height is not the problem: eight rows today become one row of eight pucks, about the same. The hand is. Unavailable
  pucks arm on a tap today (the survey). With drag-off live, a thumb scrolling a tall row can lift a puck. Say how a
  man is taken off on a phone (the Ground Programme's way), and keep the note with Undo from 2.2.
- A stand-down is the whole squadron: one row of thirty pucks. D743's ten-people picture does not cover it. Draw it
  once at phone width before building.

### 2.14 What the plan should claim it deletes
The gain is not only fewer faults seen; it is code removed. If no input of several is ever drawn a row a man, the
whole "one man's part of a shared row" machinery on the schedule can go (the per-man row address, the "follow him to
his own input" memory that pull request 845 added, D759 reading 4 on the schedule). The plan keeps it "for medical" —
but medical is never shared, so nothing needs it. Say it is removed; otherwise it stays as dead, untested code that
breeds the next fault. The Leave War keeps its own per-man view, so leftover (3) stays open — unless section 3's
change is taken, which closes that too.

## 3. The exception — medical is right, but it is not really an exception; leave is the open one

- **Medical:** right, and already true — the window offers no "Several people" for it. So there is no shared medical
  to draw a row a man. The honest wording is not "medical stays a row per man" but "a medical is always one
  person's". Stated that way the rule has no exception on screen at all. (Also worth his eye: today a drop on an
  ATT C puck hands that medical, with its document, to another man. That seems wrong for a medical whatever is
  decided here. Not checked by me — the survey reports it.)
- **Leave — put one more choice to him.** He compared "leave as one row" with "leave as rows per man of one shared
  input". There is a third shape he may not have been shown: **leave is never shared.** An admin may still pick
  several people and file once, but it saves one leave each — which is what the Leave War already does and already
  insists on (2.3). Then:
  - the rule is by the nature of the thing — a man's own entitlement (leave, medical) is his alone; a group's
    activity (overseas duty, course, attach, a commitment moved to Unavailable) is one row, one input;
  - every leave row behaves the same, whichever door filed it;
  - "one man back early" for leave is just his own leave changed, no splitting;
  - the Leave War's "change one man and he splits off" path, and leftover (3), go away for leave;
  - each man's balance, document and approval sit on his own record.
  Its cost: changing a stand-down's dates for everyone is done on the Leave War across the men (it has a drag over
  several men) rather than in one window; and it changes D655 reading 4 (an admin may file a group for any kind but
  medical). By his own tests in D754 — the same everywhere, fewer places for a fault — I lean to this over combining
  leave. If he still prefers leave combined, 2.3 must be answered: the add works on every leave row, or on none.
- **Overseas duty, course, attach, moved commitments:** combine. These are one event for a group, and one row is the
  truth. No other kind should stay a row per man.

## 4. The survey's other rows

- **Same job:**
  - Personal Inputs lines taking a drop (already his rule — D776, D755), with 2.4 settled first.
  - The Unavailable row's empty part doing different things on Edit Schedule and the Board — it is the add place in
    the new rule, so it must be the same on both.
  - Every silent no-op on a row this job touches: a drop that cannot apply is refused with its reason (D757's own
    words). New words are drawn for him first (D1625).
  - The last-man refusal naming doors that are not on the row in view — the same sentence will now show on
    Unavailable and Personal Inputs, so fix its words here.
- **Separate small jobs:**
  - The Board's sim seat grids with no "+ add" strip, and a drop a little off the seat replacing the FCP — a real
    trap, but a seat matter, not an input matter.
  - On a phone a tap on a filled seat never arming it while an Unavailable puck does — a consistency item for the
    consistency look.
  - The Common Programme's drag-off leaving an empty place in its saved list — harmless on screen; file it, because
    new data carries it too.
- **Stay as they are:**
  - Flying seats and standby seats — one man a seat by nature.
  - SANS AVAIL cards — a SANS man's offer to fly is his own word (D658) and is filed on the SANS calendar only (D620);
    a drop must not create one. It should refuse with a reason rather than do nothing — that small part can ride with
    the silent no-ops above.

## 5. His earlier rulings it changes or clashes with

| Ruling | What happens to it | Does the plan name it? |
|---|---|---|
| D737 — a row a man under Unavailable | Replaced (its reason "each man's absence can end on its own day" still needs an answer — 2.2) | Yes |
| D661 reading 1 — the single row is for the Ground Programme and Personal Inputs only | Widened to Unavailable | Named as background, not as changed |
| D743 reading 9 — "the Unavailable list is not in the pictures: a row a man" | Ended; and no approved picture exists for a combined Unavailable row — one is owed (D1625) | No |
| D759 reading 4 — a change to one man's part alone gives him an input of his own | Ended on the schedule (kept on the Leave War) | No |
| D755 (2), D776 — a drop on a shared input's puck joins; on the only puck it swaps | **Clashes** with "drop on a puck to replace" (2.1) | Cited as if in agreement — it is not |
| D735 — one time for all; to differ, take him off and give him a row of his own | Now applies to Unavailable; for several-day inputs it is not enough (2.2) | Cited in effect, not by number |
| D739, D740, D742 — a time or remark typed changes the input; never makes it late | Now applies to a combined Unavailable row for everyone | D739 yes; D742 no |
| D736 — one change waiting for the input, one per man added or removed | Applies; needs "on each published day covered" | Yes |
| D748 — the window from the schedule shows everyone | Applies to the Unavailable row's tap as well | Named for today's behaviour |
| D861 — a man dragged off an input's row stays silent | **Clashes** with what a several-day absence needs (2.2) | Cited, the clash not seen |
| D712, D711, D1373 — ALL / ALL AVAIL never on leave, medical, attach, overseas duty, course | Must be a stated refusal on the drop (2.7) | No |
| D655 reading 4 — an admin may file a group for any kind but medical | Unchanged by the plan; changed if leave is never shared (section 3) | No |
| The Leave War's rule that an approved leave is one person's (the `LW_OWN` refusal in the app) | **Clashes** with "drop to add everywhere" on leave (2.3) | No |
| D1784 — the waiting mark on an Unavailable row | Applies, drawn once on the row | No |
| D1586 — a dropped LATE mark is saved on the input | Applies; the per-man late date needs a line (2.10) | No |
| D2149, D2194 — the borrowed man's row; no business crossing squadrons | Must be kept out of the merge (2.9) | No |
| D762 — one OIL answer for the input | Unchanged | Yes |

## 6. Recommendation, in plain words

Go ahead with the idea, but do not rule on it as written. Before it becomes a ruling, have the agent put four
questions to him, each with a picture of the real screen and a worked case:

1. **Leave:** one row for a group's leave — or leave always each man's own, like medical (file for several, get one
   leave each)? My lean: each man's own. Then the rule reads "what is a man's own — leave, medical — is never shared;
   what a group does together — overseas duty, course, attach, a commitment — is one row."
2. **Several days:** when a man is dragged off, or dropped on, a row of a five-day duty on Thursday — from that day
   on (my lean), or every day?
3. **The drop:** one rule on all three lists. Keep the Ground Programme's as built (my lean), or change all three to
   "row adds, puck replaces"?
4. **Reject for one man** of a group: confirm there is no such thing — the scheduler takes him off the row — and see
   the note and the bell line it sends.

Then the plan adds: the refusals (ALL / ALL AVAIL, medical, another squadron's man, the borrowed man's row), the
Board's "take him off" drop place, the list of every screen that draws the row, the phone picture for a large group,
and the statement that the per-man row code is removed, not kept. It is a high-risk job — it touches published days,
who is counted away, and OIL — so it is a full bug check, and the scenario list should be built from the cases in
section 2.
