# Full editing on the Leave War (his D1724, 6 Nov 26) — brief

**His words:** "should the leave war have the function to make OD, CSE, ATCH, OTH move? … when I have 2 inputs for some
combination. I can't edit it or delete or replace. It just says change at input. Should we create those functionality so
that any combination like multiple inputs a day or the above mentioned can still have the full editable functionality like
move delete, add more etc" — then "1 & 3 yes". Backlog item: [LW-FULL-EDITING].

## Today (his iPhone pictures of pull request 646's preview, 6 Nov 26)

- An entry filed on the Inputs page (or from the war's CSE / OD / ⋯ buttons — an OD, a course, an Attach, an Other, a
  medical, leave filed there) shows one line, "Change it on the Inputs page": no Move, no Delete, no change of days.
  That was the agent's reading when those windows were built (D1548, D1553, D1565's readings), never his ruling.
- A day holding two or more entries (an Attach beside an Other, an Attach beside an FO award) opens the day's list: the
  war's own records (a leave bid, an OIL award) have their buttons; an Inputs entry only its line; nothing can be added.
- A day held by one Inputs entry opens the bid window (D1548, D1553): more can be added, the entry itself not changed.

## What he asked for

Every entry, whatever its kind and whoever filed it, can be moved, deleted, and its days and remarks changed on the Leave
War — for the whole entry or one day of it, as a leave of several days already is (D1461, D1467); a day of two or more
entries opens the window that adds more (leave, Grant OIL, CSE, OD, ⋯), each entry on its own line with its own Move and
Delete. The Inputs page's own rules hold: a member changes only his own entries, an admin anyone's; a change on a published
day waits for the next amendment (D178); a clash is refused with its reason (the inputs door, `leavewar/inputgate.ts`).

## The job, in order

1. **Design, drawn first (D1625, D853):** with Impeccable, standardised to the app (D1496), at his iPhone's size and a
   desktop's — the one-entry window, the window of a day with two and three entries, Move of an Inputs entry, Delete's
   question, a change of days; what a member sees beside an admin; a medical (its document); a published day. Rounds of at
   most four questions, each with a recommendation and a picture.
2. **Build** through the one command layer and the inputs door (every change an Input edit: `commitInputEdit`), never a
   second store path; undo and redo; the bell where a change is made to another man's entry (as the war's decisions are).
3. **Check: FULL** (the published record and saved data are touched): roll-call of every place an entry is changed or drawn
   (the war's windows, the Inputs page, the schedule's rows, the bell), scenarios from a fresh Opus designer, the walk with
   the plain-user round, a fresh blind Opus code read, the evidence sheet; his look and "merge live".

With [LW-CELL-COMBOS] (D1723) beside it: that job is how a day's entries are DRAWN; this one is what can be DONE with them.
