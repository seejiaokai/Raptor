# Bell walk scenarios — a person added to an input by someone else (fresh Fable designer, blind; 26 Nov 26)

Designed from the brief `raptor-port/docs/superpowers/briefs/2026-11-26-bell-added-scenarios-brief.md`, the full rows
of D769, D755, D757, D776, D702, D711, D2200, D2779, D1693, D2437, D1422, D763, D655, D1724, the notifications register
(B1–B13, R1, P2, P10–P12) and a read of how the bell is written today (`state/notices.ts noticePass`,
`state/sched-commit.ts tellPass`, `ui/reqdoor.ts`, `ui/drag.ts`, `ui/inputedit.tsx reassignInput / commitInput /
commitNewInput`, `leavewar/state/store.ts decisionTells / fileStraight`, `leavewar/sync.ts tellWar`). I did not walk the
app and did not judge the code; where I say "the code today appears to…" it is a pointer for the walker, not a finding.

## How to read a line, and how to check one

- A bell line (D769): the input's name in bold with its date, then what happened and who did it, its age at the right.
  Written here as: **Name** Wed 15 Jul · what · who.
- The added man's line: **<input>** <its first day> · *You were added* · Saber (B2). The input's other named people and
  its filer (if he is not the one who made the change): *<callsign> added* (B8). A man replaced: *You were taken off*
  (B3). Whoever made the change gets no line of his own.
- A Leave War leave is a different line: **Your leave** Wed 15 Jul · *LL added and approved* · Saber (P2, D1422).
- To read a man's bell the walker signs in as him. Only Saber (`ad`) and Ranger (`us`) have sign-ins; for a third man
  (called TALLY below — any other member) Saber first makes an account on Admin → Users. So: most scenarios add RANGER
  (read his bell as `us`); scenarios that need "the others in the input" use Ranger as the one already in it and read
  his bell for the *X added* line, or use the extra account.
- For every scenario check all of: (a) the bell is lit / shows unread for the man told; (b) the line's words, date and
  who; (c) a tap opens the input (or the Leave War grid at that day for a "Your leave" line); (d) the man who made the
  change has no line; (e) exactly ONE line for one act — never two; (f) desktop list and the phone's full-width panel.
- Each scenario marked **[phone too]** is repeated on a phone; on a phone a puck is placed by tapping it to arm it and
  then tapping the place, where a desktop drags — both hands are named in the door (`reqdoor.ts`: a drop, an armed
  place filled), so both must be walked.
- ★ = I think it is among the most likely to fail. ◆ = today's behaviour matters to the coming combined-row change
  (D2770–D2780) — record exactly what happens, as the baseline.

Demo week Wed 15 Jul. "Training" below means any Ground Programme input (Training, Meeting, a duty); pick one that
exists or file it first as Saber.

---

## A. The schedule — a puck put on a row that came from an input (Edit Schedule and the Scheduler Board)

1. **Add onto an empty place, Edit Schedule, desktop. [phone too] ◆**
   Start: Saber has filed a Training for TALLY alone on Wed 15 Jul (a weekday, so no OIL question); it shows as a Ground
   Programme row. Saber drags Ranger's puck from the crew list onto the row's "+ add" place.
   Expected — Ranger: **Training** Wed 15 Jul · *You were added* · Saber; a tap opens the input. Tally: **Training** Wed
   15 Jul · *Ranger added* · Saber. Saber: nothing. Rulings: D755, D757 ("the member is told by his bell"), D769, B2, B8.

2. **Join by dropping on a shared input's puck, Edit Schedule, desktop. [phone too] ◆**
   Start: a Training holding TALLY and one other man. Saber drops Ranger on TALLY's puck (not on the empty place).
   Expected today: Ranger JOINS (nobody leaves) — Ranger *You were added*; each other named man *Ranger added*. D755,
   D776, D769. ◆ After D2772 this same drop will REPLACE Tally — so note carefully that today nobody gets "taken off".

3. **Replace the only man from the crew list, Edit Schedule, desktop. [phone too] ★ ◆**
   Start: a Training filed by Saber for TALLY alone. Saber drops Ranger from the crew list onto Tally's puck.
   Expected — Ranger: *You were added* · Saber. Tally: **Training** Wed 15 Jul · *You were taken off* · Saber (B3). No
   *Ranger added* line for Tally (he is out). D755 (2), D769.
   ★ because the input "becomes the new man's" — check Ranger gets "added", not a "renamed / changed" line or nothing.

4. **Replace the only man when HE filed it himself. ★**
   Start: Ranger (`us`) files a Training for himself alone. Saber drops TALLY on Ranger's puck.
   Expected — Tally: *You were added* · Saber. Ranger (the filer, now out): *You were taken off* · Saber — one line, not
   a second "Tally added" as its filer. D755 (2), D759 reading 7 (the filing passes to the scheduler), D769.

5. **Replace by a swap from a flying seat or a duty desk, desktop. ★**
   Start: TALLY alone on a Training row; Ranger sits in a seat elsewhere that day. Saber drags Ranger from that seat onto
   Tally's puck (the two swap — Tally takes the seat).
   Expected — Ranger: *You were added*. Tally: *You were taken off* — and nothing more for the seat he was given (a seat
   is not an input). One Undo step. `reqdoor.ts` (Fable F8), D755 (2), D769.
   Also once where the seat refuses Tally: the whole drop is refused, and NO line reaches anyone.

6. **Move from one input's row to another input's row. ★**
   Start: Ranger is on Training A (with Tally) and there is a Meeting B (holding one other man). Saber drags Ranger's puck
   from row A to row B.
   Expected — Ranger: two lines, **Training** · *You were taken off* and **Meeting** · *You were added*, both · Saber.
   A's others: *Ranger taken off*; B's others: *Ranger added*. One Undo takes both back. `reqdoor.ts` (rowMove), D769.

7. **The same add on the Scheduler Board, desktop. [phone too]**
   Repeat 1 and 3 on the Scheduler Board (its own drop targets and its ✓ done). Expected: the same lines, written at the
   drop — not held until "✓ done", and not written a second time at it. D755, D769. (No ruling says whether the Board's
   line waits for ✓ done — if it does, the agent must ask.)

8. **The add waits on an OIL question (a weekend input with no answer yet). ★ [phone too]**
   Start: a Training on Sat 18 Jul filed with its OIL question unanswered. Saber drops Ranger on the row.
   Expected: nothing moves and NO bell line while the question bar is up (D780, D783: "not made until the question is
   answered"). (a) Saber answers → the add is made and Ranger gets exactly one *You were added*; (b) Saber cancels /
   leaves it → Ranger gets nothing, ever. Check there is no line from the "tried and thrown away" save.

9. **An add where the input's OIL answer is No.**
   Start: a Sat 18 Jul Training answered No. Saber drops Ranger on it.
   Expected: Ranger *You were added* · Saber as on any input (the note to Saber says he is not counted). No ruling says
   the bell line tells Ranger he earns no OIL — the agent's reading; record the words.

10. **A drop that is refused tells nobody.**
    Each once: Ranger dropped where he is already on the input ("already on this input"); a drop on an input the
    schedule cannot change (read-only / taken off the programme); a clash the input's own save refuses (e.g. Ranger on
    leave that day, if refused). Expected: the refusal's words to Saber, no bell line for Ranger or the others. D757
    ("a drop that cannot apply is refused with its reason").

11. **ALL AVAIL dropped on an input's row. ◆**
    Start: a Wed 15 Jul duty or commitment holding Ranger. Saber drops ALL AVAIL on the row.
    Expected: no line on the bell of any man standing behind ALL AVAIL (D702: "not … on his bell"; D757). Ranger, who is
    named in it: **<input>** · *ALL AVAIL added* · Saber (the register's B8 — a placeholder is one of the people).
    No ruling says in so many words that the named man is told the placeholder joined — the agent's reading; show him.

12. **A named man dropped on an input filed for ALL AVAIL only.**
    Start: Saber files a duty for ALL AVAIL on Wed 15 Jul. Saber drops Ranger on its puck (he joins beside it).
    Expected — Ranger: *You were added* · Saber. Nobody behind ALL AVAIL told. D753, D755, D702.

13. **An Unavailable row's puck replaced — an Other filed under Unavailable. [phone too] ★ ◆**
    Start: Saber files an Other "→ Unavailable" for TALLY alone on Wed 15 Jul. On Edit Schedule Saber drops Ranger on
    Tally's puck in the Unavailable list (and, on a phone, arms Ranger and taps it).
    Expected — Ranger: **Other** Wed 15 Jul · *You were added* · Saber. Tally: *You were taken off* · Saber. D776 (B2 —
    "leave it swapping"), D769, D2779's "still told on his own bell".

14. **An Unavailable row's puck replaced — a LEAVE filed on the Inputs page. ★ ◆**
    Start: Saber files LL for TALLY on Wed 15 Jul on the Inputs page (it lands approved, D1166). Saber drops Ranger on
    Tally's puck in the Unavailable list.
    Expected (if the drop is allowed today): Ranger **LL** Wed 15 Jul · *You were added* · Saber; Tally *You were taken
    off* · Saber; exactly one line each — and no second "Your leave" line from the Leave War for either. If the drop is
    refused today, record the words: it is the baseline D2779 changes.

15. **An Unavailable row's puck replaced — a leave the LEAVE WAR approved. ★★ ◆ (my top pick)**
    Start: Tally has LL on Wed 15 Jul that Saber approved on the Leave War (or entered with Auto-approve on). On Edit
    Schedule Saber drops Ranger on Tally's puck in the Unavailable list.
    Expected by the rulings: Ranger is told he was put on leave, Tally that he was taken off (D755, D757, D2779 "the man
    added or taken off is still told"). Which words — the input's *You were added* or the war's *LL added and approved*
    — no ruling says; the agent must ask. ★★ because the bell deliberately says nothing through the Inputs door about a
    new leave the war approved (the war "tells by its own page"), so a new man put on such a leave by a schedule drop
    may be told by neither. Record: Ranger's bell, Tally's bell, and whether the Leave War shows Ranger's leave.

16. **The same drop where the newcomer has a pending leave bid that day. ★ ◆**
    Start: as 14, and Ranger has a pending LL bid on Wed 15 Jul on the Leave War. Saber drops Ranger on Tally's leave.
    Expected: one line — **LL** Wed 15 Jul · *You were added · replaces your LL bid* · Saber (P11, D1142) — never a
    second line from the war about the bid.

17. **An Unavailable row's puck replaced — a medical. ◆**
    Start: Tally has a medical (downchit) on Wed 15 Jul. Saber drops Ranger on it.
    Expected today: asked about first / refused (the code asks before handing a medical on); if it goes through, Ranger
    *You were added*, Tally *You were taken off*. D2775, D2776 (not built) will refuse it saying why — record today's.

18. **One man's row of a shared Unavailable input.**
    Start: an Other "→ Unavailable" for TALLY and a second man (two rows, one input). Saber drops Ranger on Tally's row.
    Expected — Ranger *You were added*; Tally *You were taken off*; the second man *Ranger added, Tally taken off* ·
    Saber (one line carrying both). D755, D737, D769, B8.
    Then: Saber types a time on the second man's own Unavailable row (he is given an input of his own). Expected: he is
    NOT told "You were taken off" + "You were added" — only what changed for him (*Now 09:00–11:00*). ★ a false "added".

19. **The input's own window opened from the schedule — a person added there. [phone too]**
    Start: a Training with Tally. On Edit Schedule Saber opens the row's window (its pencil / a tap on the row), turns
    on "Several people", adds Ranger, saves.
    Expected — Ranger *You were added*; Tally *Ranger added*. Then the same with the time changed in the same save:
    Ranger still only *You were added* (nothing about the time, new to him anyway); Tally *Now 09:00–11:00, Ranger
    added* · Saber (D2521's first-two rule). D769, B2, B7, B8.

20. **The window from the schedule — the one person changed (admin changes who it is for).**
    Start: a Personal input (or an Other) of Tally's alone. Saber opens it from the schedule, changes Person to Ranger.
    Expected — Ranger *You were added*; Tally *You were taken off*. D776 ("an admin changing the person in its own
    window stays as it is"), D769.

## B. The Inputs page

21. **A new input filed by an admin for one other person. [phone too]**
    Saber, Inputs page, "+ Input": a Training for Ranger alone, Wed 15 Jul. Expected — Ranger: **Training** Wed 15 Jul ·
    *You were added* · Saber; tap opens it. D769 ("or one filed for him"), B2.

22. **A new input filed by an admin for several. ★**
    Saber files one Meeting for Ranger, Tally and himself. Expected — Ranger and Tally: ONE *You were added* each — not
    two, and not also *Tally added* (saving for several runs the save in two parts inside one command: the classic
    place for a doubled line). Saber: nothing. D769, D655 (one shared input).

23. **An existing input's window on the Inputs page — a person added; and added on the calendar's opened day.**
    Start: Tally's Training. Saber opens it from (a) the list and (b) a day opened on the calendar, adds Ranger, saves.
    Expected each time — Ranger *You were added*; Tally *Ranger added*. D769.

24. **A filer who is not in the input is told.**
    Start: Ranger (`us`) files a Meeting for TALLY only (a member files a commitment for another, D655). Saber then adds
    a third man in its window. Expected — the third man *You were added* · Saber; Tally *X added*; Ranger, the filer and
    not in it, also *X added* · Saber. D769 (the pass tells "whoever filed it"), D655.

25. **A member files a duty or commitment for others. [phone too]**
    Ranger (`us`) files a Meeting for Saber and Tally. Expected — Saber's bell: **Meeting** Wed 15 Jul · *You were
    added* · Ranger. Tally the same. Ranger nothing. D655, D702 (3), D769.

26. **A member tries what he may not file for another.**
    Ranger tries LL, a medical, SANS availability for Saber. Expected: refused ("You can file leave only for yourself"),
    no line anywhere. Then with the members' "file for others" switch off (Admin), a Meeting for Saber: refused, no
    line. D655, D658.

27. **A man who is IN a shared input he did not file adds someone. ★**
    Start: Saber files a Meeting for Ranger and Tally. Ranger (`us`) opens it and tries to add a third man.
    Expected by D763: he cannot — only the filer or a scheduler changes who is in it. If the app lets him, record that
    and whether the third man is told *You were added* · Ranger. (Whether D763 is built is for the host to check.)

28. **A Personal input filed for another, and one holding several.**
    Saber files a Personal input for Ranger; then adds Tally to it. Expected — *You were added* each; Ranger *Tally
    added*. D776 (a Personal input may hold several). Whether a MEMBER may file a Personal for others is unsettled
    (D776's reading 3) — if the app offers it to `us`, record it; the agent must ask.

29. **An input filed for ALL AVAIL / ALL on the Inputs page.**
    Saber files a duty for ALL AVAIL on Wed 15 Jul; then Ranger (`us`) files one for ALL (members may, D702).
    Expected: no line on any man's own bell, and it is not listed in each man's own inputs. D702, D711. On a weekend
    with the OIL question left unanswered: the FILER's bell lights (no line in the list; a tap opens the question) and
    only his — B11, D711 (4).

30. **A medical and an upchit filed by an admin for a man.**
    Saber, Inputs → Medical: a downchit for Ranger Wed 15 – Thu 16 Jul. Expected — Ranger: **<kind>** Wed 15 Jul · *You
    were added* · Saber. With a pending leave bid of Ranger's on those days: *You were added · replaces your LL bid*
    (P11). D769, D1142.

31. **A leave filed by an admin for a man on the Inputs page. ★**
    Saber files LL for Ranger, Mon 20 – Tue 21 Jul, on the Inputs page (not the Leave War). Expected — Ranger: **LL**
    Mon 20 Jul · *You were added* · Saber — one line, the Inputs door's, none from the war (D1166: lands approved; P11's
    "never a second from the war"). Tap opens the input.

32. **SANS: an admin files for a SANS man.**
    Saber, Inputs → SANS: (a) SANS availability for a SANS man, (b) a SANS commitment for him.
    Expected: *You were added* · Saber for each (B2 covers every input) — but no ruling speaks of SANS availability on
    the bell; the agent must ask whether he wants it. Also watch his "nothing filed" reminder (B13) shrink or go for the
    days Saber filed. The SANS man needs an account made first.

33. **A note's pucks on a day opened on the calendar.**
    Saber opens Wed 15 Jul on the Inputs calendar, "+ Note", puts Ranger's puck on the note.
    Expected today: no bell line — a note is not an input (the code reads only inputs). No ruling says a man put on a
    note is told or not; the agent must ask.

34. **An input dragged to another day on the calendar is not an "add".**
    Saber drags Ranger's and Tally's shared Training to Thu 16 Jul. Expected: *Now Thu 16 Jul* · Saber to both — never
    *You were added* (B7). A guard against a move read as a remove-and-add.

## C. The Leave War

35. **An admin enters leave on a man's row, Auto-approve ON. [phone too]**
    Saber, Leave War, taps Ranger's cell Wed 22 Jul, LL, Auto-approve on. Expected — Ranger: **Your leave** Wed 22 Jul ·
    *LL added and approved* · Saber; a tap opens the grid at that day. D1422, P2. Three days in a row in one go: ONE
    line, *Wed 22 – Fri 24 Jul*. A half day: said as a half (*LL (AM)*-style) — record the words.

36. **Auto-approve OFF — the admin leaves a pending bid on the man's row. ★**
    As 35 with the switch off. Expected by the rulings: nothing is ruled — P2 covers only the approved case, and P5
    (telling admins of new requests) was struck. The code today appears to tell Ranger nothing. So a man can have a bid
    placed for him by someone else unseen: record it; "no ruling; the agent must ask".

37. **Auto-approve ON over the man's own pending bid.**
    Start: Ranger has a pending LL bid Wed 22 Jul. (a) Saber places LL approved on it → Ranger: *LL approved* (R1), not
    "added"; (b) Saber places OL approved on it → Ranger: *OL added and approved* and nothing misleading about his LL
    bid — record exactly what is said of the bid. D1142, D1422.

38. **Several people at once on the war. ★**
    Saber selects cells on Ranger's and Tally's rows (the several-people / drag window), LL, Auto-approve on.
    Expected: each man one **Your leave** line of his own; neither is told about the other. D1422.

39. **Auto-approve ON on a day from the man's posting-out date.**
    Start: Tally has a posting out saved for a date. Saber places leave, Auto-approve on, on a day from that date.
    Expected: it is kept pending (the war's own rule) — so, as 36, no line. Record; the agent must ask.

40. **A course or an overseas duty filed from the war for a man. [phone too]**
    Saber files OD (then CSE) on Ranger's row, Mon 27 – Wed 29 Jul. Expected — Ranger: **OD** Mon 27 Jul · *You were
    added* · Saber (the Inputs door's line — it is an input, not war leave); a tap opens the input, not the grid.
    D1318, D769. ★ Check it is not silent because it came by a Leave War door.

41. **An Other and an Attach filed from the war.**
    Saber, the bid window's ⋯: an Other (whole day, then AM) and an Attach on Ranger's row. Expected: **Other** <day> ·
    *You were added* · Saber; likewise Attach. D1365, D1378–D1380, D769. A member cannot file an Other from the war.

42. **Full editing of an entry on the Leave War (D1724).**
    Not built — nothing to walk. Say so in the sheet. When built it adds ways to move / change another man's entry.

43. **A leave on the war swapped to another man — is there any way today?**
    Try on the Leave War to move Tally's approved LL onto Ranger's row (a drag across rows). Expected: not possible (a
    move stays on his own row). If it is possible: Ranger must be told (*LL added and approved*), Tally *LL deleted /
    moved*. No ruling; record.

## D. Everything else

44. **An add on a published day (an amendment waiting). ★ ◆**
    Start: Wed 15 Jul is published. Saber drops Ranger on a Training row there (and, separately, files a new input for
    Ranger on that day from the Inputs page). The change waits as a pending amendment.
    Expected: no ruling says whether the bell tells him at once or when the amendment is published. The code appears to
    tell at once. Record what Ranger sees and when; then Saber publishes the amendment — Ranger must NOT get a second
    line. And if Saber discards the pending change instead: does the line stay, claiming something that never issued?
    The agent must ask.

45. **Undo of the add — unread. [phone too] ◆**
    Saber adds Ranger (as 1), then presses the top bar's Undo before Ranger looks. Expected: Ranger's line is gone, the
    bell not lit; Tally's *Ranger added* gone too. Redo: the lines are back, unread. D1693, D148.

46. **Undo of the add — after he has read it. ★ ◆**
    Saber adds Ranger; Ranger signs in, opens the bell (line read); Saber signs in and presses Undo.
    Expected by ruling: a NEW unread line saying what is true now — he is no longer on it (D1693 as narrowed by D2437).
    Not built for input lines ([NOTICE-UNDO-RETRACT] step 2 is open): today the line appears simply to go, so Ranger is
    left believing he is on it. Record today's behaviour as the baseline — D2779 rests on "Undo the way back".
    Same for the Leave War's line (35 then Undo): there a read line should be answered (D1216; today's look is the
    struck *~~LL added and approved~~ · taken back · Saber*; D2437's new words not built).

47. **Added, then taken off again by hand (not Undo).**
    Saber adds Ranger, then drags his puck off the row. Expected: two lines, *You were added* then *You were taken
    off*, newest first. D769, B3. (No ruling folds them into one or into none.)

48. **A man of another squadron. ★**
    (a) Saber tries to put a 149 man on a 142 input — by the window's people picker, and by a puck if the crew list
    shows him. Expected: if allowed, he is told *You were added* · Saber on his own bell (D2194: a line crosses where
    the matter concerns both; a line about himself); the squadron mark on such a line is not built (D2202).
    (b) Saber enters leave, Auto-approve on, for a man not at home in this squadron's war: the code appears to skip the
    war's line for him. No clear ruling for either; record and ask.

49. **A man with no sign-in, an archived man, a man deleted later.**
    Saber adds a man with no account: nothing to read — but give him an account afterwards and sign in: is the old line
    waiting, unread? (No ruling; record.) An archived man cannot be picked; if he can, no line.

50. **The one who adds is himself in the input; and adds himself.**
    (a) Saber is in a Meeting with Ranger and adds Tally: Tally *You were added*, Ranger *Tally added*, Saber nothing.
    (b) Saber adds HIMSELF to Ranger's Training: Saber nothing; Ranger *Saber added* · Saber. D769.

51. **Two adds, one after another, and two men in one drop-save.**
    Saber adds Ranger, then Tally, to a third man's Training (two acts): Ranger gets *You were added* and then a
    separate *Tally added*; the third man two lines. Then in the window add both in ONE save: the third man one line,
    *Ranger, Tally added* (B8). D769.

52. **The line is still right after the input changes or goes.**
    Saber adds Ranger to a Training, then renames it and moves it to Thu, then deletes it. Expected: the first line
    still reads **Training** Wed 15 Jul · *You were added* (a line is never rewritten); then *Now Thu 16 Jul, renamed —
    was Training*; then *Deleted* (B1). A tap on the "added" line of a deleted input opens nothing broken. D769, B1.

53. **The line hidden behind a question. [phone too]**
    Start: Ranger has an OIL question waiting (he filed a weekend input and left it). Saber adds him to another input.
    Expected: a tap on Ranger's bell goes straight to the OIL question (D769) — so check the *You were added* line is
    still there, unread, once the question is answered, and that the bell stays lit for it.

54. **Each person's own choice of notifications (D2200).**
    Not built — there is no switch to turn off, so nothing to walk; say so. (When built: a man who switched "inputs I
    am added to" off is not told.)

---

## The ones I think most likely to fail (in order)

1. **15** — a schedule drop on a leave the Leave War approved: the new man may be told by neither the Inputs line nor
   the war's line. This is exactly the case D2779 will make ordinary.
2. **46** — Undo after the line was read: the ruling (D1693, D2437) is not built for input lines; the man keeps a
   belief that is no longer true.
3. **36 / 39** — a pending bid placed for a man by an admin: silent today, and nothing ruled.
4. **44** — an add on a published day: told at once for a change that has not issued, or told twice.
5. **22** — one input saved for several: a doubled line.
6. **8** — an add waiting on the OIL question: a line written before the answer, or after a cancel.
7. **14 / 16** — a drop on an Inputs-page leave: one line only, with the "replaces your LL bid" tail where owed.
8. **5 / 6** — the swap from a seat and the row-to-row move: both men told, one Undo.
9. **18 (second half)** — a man given his own part of a shared input wrongly told "taken off" and "added".
10. **27 / 48** — a non-filer adding people (D763), and a man of another squadron.

## What in the rules is unclear or contradicts

1. **Which words for a man put on LEAVE by a schedule drop (15, and D2779 when built).** D755/D757/D2779 say "told on
   his own bell" but not whether as the input's *You were added* or the war's *LL added and approved*, nor which page
   a tap opens (the input, or the Leave War grid). The two lines exist for the same kind of thing by two doors.
2. **A pending bid entered for a man by an admin (36, 39).** P2/D1422 rule only the approved case; D1208 struck telling
   ADMINS of new requests, which is the other direction. Nothing says the member is, or is not, told.
3. **A published day (44).** No ruling says when the bell speaks for a change that waits as an amendment — at the
   change, or at its publication — or what happens to the line if the pending change is dropped.
4. **Undo after reading (46).** D1693 and D2437 both stand and neither is built for input lines; the code's own note
   still describes the older rule ("nobody is told it was undone"). D2779 leans on Undo as "the way back", so this gap
   will matter more after the combined-row change.
5. **Join versus replace on a shared row's puck (2).** Today a drop on a shared input's puck joins (D755, D776);
   D2772 (not built) makes it replace. The bell rules cover both, but the walk's baseline must be read knowing the
   same gesture will soon tell someone "You were taken off".
6. **ALL AVAIL joining an input with named people (11).** D702 says the men behind it are not told; whether the NAMED
   people are told "ALL AVAIL added" is only the register's B8 by reading, not his words.
7. **A note's pucks (33).** A note is not an input, so D769 does not reach it; nothing says a man put on a note is told.
8. **SANS availability filed for a man by an admin (32).** B2 covers it by its wording; no ruling of his mentions it,
   and his SANS bell lines (B13, D2391) have their own plain style, which "You were added" does not match.
9. **A man of another squadron (48).** D2194 gives the rule for crossing lines and D2202's squadron mark is not built;
   whether a 142 scheduler can put a 149 man in a 142 input at all today, and what his bell then says, is not stated.
10. **Who may add (27, 28).** D763 (only the filer or a scheduler) was to come with the one-rule job — whether it is
    built is not stated on the brief; D776 left open whether a member may file a Personal input for others.
11. **D2200 (54) and D1724 (42)** are named in the brief but not built — nothing to walk; the sheet should say so
    rather than leave a blank.
12. **Added then taken off by hand (47)** and **a man with no sign-in when added (49)**: nothing says whether two
    lines, or an old line waiting for a later account, is what he wants.
