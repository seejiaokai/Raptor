# The end-time guard rail (G1–G4) and six untrue sentences (F1–F6): drafts, drawn on the real app (25 Nov 26)

Drawn on the live app's build (`main` at 3787015aa, the same code the audit walked), served locally, the demo week of
13–19 Jul 26, the browser clock held at Wed 15 Jul 26 09:00. Every "today" picture is the app as it draws itself after
staging through its own controls. Every "proposed" picture changes only the words of an element the app drew, or adds
one class (G's red edge) to boxes the app drew. Nothing in the app's code changed.

- Desktop pictures: 1536 x 864, Chromium, at 2x. Phone pictures: his iPhone's 402 x 874, WebKit, touch, 3x. Each is
  cropped to its place. Pink rings and numbered pink tags are the drawing's marks, not the app's. A yellow label that
  starts "Hover words (drawn by the script)" is the drawing's too: a browser never paints hover words, so the script
  reads them off the control and writes them under it. On a phone nobody ever sees hover words.
- Scripts: `kit.mjs` (shared), `draw-g.mjs`, `draw-f.mjs`. What each run read off the screen is in
  `img/facts-*.json`. Pictures: `img/`.
- Every new sentence below is an Opus draft. By D2441 a fresh Fable reviews and adjusts it before he sees it.

---

## G — the end-time guard rail (his D2612, narrowed by D2613)

**The day drawn:** Saturday 18 Jul on Edit Schedule. Thursday's waves were put on it with the day's own Templates. Hunter
and Ranger went into wave 1 VL (take-off 12:45, landing cleared). Ridge went on the SXO desk (START 08:00, END cleared).
Thursday's template also brought the demo's own AMT sim block, whose BRIEF (11:00) and DEBRIEF (12:30) rows are typed
with a start and no end. So Saturday holds **four** items with a start and no end, all found on screen by the script:
VL's landing, the SXO desk's END, AMT BRIEF's END and AMT DEBRIEF's END.

**The red, and where it comes from.** The red is the app's own warning red (`--hard`, #F0555F). The app already puts it
on these very time boxes in two places:

- `.badtm.wfoc` is a 2px red edge on a take-off and landing pair, shown when their warning is tapped.
- `.lgin.bad` is the Logic page's red box round a value it refuses.

The shape is the app's resting mark on these boxes, `.badtm`: a 1px edge inside the week's cell, and the border of the
board's box. Today the app draws that mark in amber, for a take-off and landing typed the same. The proposal is that one
shape in the warning red. No new colour, no new shape.

### G1 — a flight with a take-off and no landing: the landing box outlined red

- **Where:** Edit Schedule's week, the flight row's TO / LD cell. Also the Scheduler Board's LD box. The board draws
  the formation's landing box twice, once per jet row. Both are outlined.
- **Today:** the empty LD shows a grey dash and nothing else.
- **Proposed:** the LD box gets the red edge from the moment the take-off is typed.
- **Pictures:**
  - `g1-today-desktop.png` / `g1-proposed-desktop.png`
  - `g1-today-phone.png` / `g1-proposed-phone.png`
  - the board: `g1-today-board-desktop.png` / `g1-proposed-board-desktop.png`, `g1-today-board-phone.png` /
    `g1-proposed-board-phone.png`

### G2 — a duty desk with a START and no END: the END box outlined red

- **Where:** Edit Schedule's week, the Duties block, the SXO row.
- **Today:** the END is empty. It shows no dash and no mark. The only sign anywhere is the warning list's OIL line,
  because Saturday is a weekend: "SXO has no usable times, so nobody on it earns OIL for this day". On a weekday there
  would be no sign at all.
- **Proposed:** the END box gets the red edge.
- **Pictures:** `g2-today-desktop.png` / `g2-proposed-desktop.png`, `g2-today-phone.png` / `g2-proposed-phone.png`.
- **The demo's AMT rows, drawn by the rule as recorded:** `g2b-sims-today-*.png` / `g2b-sims-proposed-*.png` (tags 3
  and 4). See question G-Q1.

### G3 — Publish pressed: refused

- **What the app does today, read off the screen:**
  - Before the four sign-offs are picked, "Publish day" is greyed with a lock. Its hover words are "Sign off CUR CK, SKED
    CK, PLANNED BY, APPROVED BY before publishing Saturday". A press on it does nothing and shows no note. On a phone it
    gives no reason at all, because a phone has no hover. Pictures: `g3-today-greyed-desktop.png`,
    `g3-today-greyed-phone.png`.
  - With the four picked, Publish works. With the landing and the END still blank, it says "Saturday 18 Jul published
    and approved. The SXO desk has no usable times, so nobody on it earns OIL." Pictures: `g3-today-desktop.png`,
    `g3-today-phone.png`.
- **The refusal's look.** No control refuses Publish with a note today. A real refusal on Edit Schedule could not be
  reached: the app's "Blocked:" notes on that page only come from a week that will not read, or from a squadron move.
  So the note is raised through the app's own note with its built "blocked" kind and the drafted words. That gives the
  grey "Blocked:" note of D1667–D1669: the red no-entry sign, "Blocked:" in bold white, the rest quieter. The 5 Nov 26
  refusal drawings raised their notes the same way.
- **Drafted words:**
  - Count only, as his ruling words it ("Publish says how many items have no end time"): **"Blocked: 4 items have no end
    time, each outlined in red. Saturday was not published."** Pictures: `g3-proposed-count-desktop.png`,
    `g3-proposed-count-phone.png`.
  - Naming each item, for comparison: **"Blocked: 4 items have no end time: VL SAT (T/O 12:45), SXO 08:00, AMT BRIEF
    11:00 and AMT DEBRIEF 12:30. Saturday was not published."** The names follow the warning list's own way of naming a
    line: its name, then its start. Pictures: `g3-proposed-named-desktop.png`, `g3-proposed-named-phone.png`.
- **QUESTION FOR HIM (G-Q2): should the refusal name the items, or only count them?** His ruling says Publish "says
  how many". Naming them is more than that. **Recommendation:** the count. Each box is already outlined in red, and
  four names already run the note to three lines on his iPhone. The named version is drawn beside it so he can see the
  cost.
- **QUESTION FOR HIM (G-Q3): when does Publish ever say it?** The sign-off boxes are refused first (G4), so while an end
  is empty the four can never all be signed. That means "Publish day" stays greyed as it is today and is never pressed
  for real. Its note can only come from a press on the greyed button, which today does nothing.
  **Recommendation:** a press on the greyed "Publish day" raises this note whenever an end is missing. That is new
  behaviour, and it is the only way the ruling's "Publish says how many" can happen. It also gives the phone a reason it
  never gets today. Its hover words can stay as they are.
- **Not drawn: an amendment's "Publish AL1" on an already-published day.** It is the same gate, so the recommendation is
  the same note with "…AL1 was not published". This is the agent's reading; it is not in his words.

### G4 — a sign-off box pressed: refused

- **Today:** picking a name in CUR CK signs at once. The box reads "CUR CK Ace". Pictures: `g4-today-desktop.png`,
  `g4-today-phone.png`.
- **Proposed:** the name is not taken, the box stays "— name —", and the grey note says why. Drafted words: **"Blocked:
  4 items have no end time, each outlined in red. Type their ends, then sign."** Pictures: `g4-proposed-desktop.png`,
  `g4-proposed-phone.png`. The note is raised the same way as G3's.
- **QUESTION FOR HIM (G-Q4): which comes first on a day that also has an unanswered OIL question?** Today the first
  press of a sign-off box opens the day's OIL list before the name is recorded (D2294). If the same day also has an
  item with no end, the two clash. **Recommendation:** the end-time refusal comes first and the OIL list does not open.
  There is nothing to sign until the ends are typed, and the OIL list then opens at the next press as it does today.
  His rulings do not say which comes first.

### G — questions his rulings do not plainly answer

- **QUESTION FOR HIM (G-Q1): the AMT sim's BRIEF and DEBRIEF rows.** The demo's own Thursday (and so this Saturday)
  types them with a start and no end. The app treats that as normal: the Logic page's "Overlap sim debrief" check reads
  "or an AMT's DEBRIEF row (AMT debrief, where that row has no end)". Under the rule as recorded ("a sim") they are items
  with no end, so every day carrying an AMT block like the demo's could not be signed or published until someone types
  two more times. **Recommendation:** leave out an AMT block's own BRIEF and DEBRIEF rows. They are the sim's brief and
  debrief, the app already gives them their length from the Logic page, and "every item" read literally would block a
  routine day. The pictures draw them outlined (by the rule as recorded), so he can see what that would mean.
- **QUESTION FOR HIM (G-Q5): a "TBD" landing.** His ruling counts "a TBD landing" as no end. **Recommendation:** the same
  red edge round the box holding "TBD", the same count, no words of its own. **Not drawn:** no TBD was staged.
- **QUESTION FOR HIM (G-Q6): which screens show the red edge.** Drawn: Edit Schedule's week and the Scheduler Board,
  where the ends are typed. **Recommendation:** no red edge on View-only Sched or the next-week peek. A member reading
  them cannot type an end, and his ruling places the red "all through drafting".
- **The words "item" and "end time".** The app calls a schedule line an item (the warning list and the Logic page do).
  "End time" is the ruling's own phrase.

---

## F1 — OIL Earn names the filer as having said No when an admin did (audit fault F1)

**Staged as the audit reproduced it:**

1. Ranger, a member, filed two Trainings on Fri 17 Jul: "Range brief" for ALL AVAIL, 09:00–12:00, and "Sim prep" for
   himself, 13:00–15:00.
2. Saber made Friday a public holiday ("National Day"). The day's OIL list opened by itself.
3. Saber pressed "No to all", then Save.
4. Then: the Scheduler Board for Friday, OIL Earn.

**What the app keeps, read off the records after Saber's answer:** each input keeps `by` (Ranger, who filed it), `modBy`
(Saber, who last changed it) and the answer (0 for the day). **Nothing records who gave the answer.** "Last changed by"
is overwritten by any later edit, so it cannot stand in for it. This differs from D782's wording, "each answer the
input's own, stamped with who gave it". That stamp is not in the app today.

| Place | Today | Drafted |
|---|---|---|
| (1) the ALL AVAIL count window in OIL Earn, its foot line | "Whoever filed this “Range brief” answered No to OIL, so by default nobody behind it earns. Tap an unlit puck to credit a man; tap a lit one to stop his credit." | **"The OIL answer for this “Range brief” is No, so by default nobody behind it earns. Tap an unlit puck to credit a man; tap a lit one to stop his credit."** |
| (2) hover words of a man behind the ALL AVAIL, in that window (Reaper) | "Reaper — whoever filed this “Range brief” answered No to OIL; tap to credit him anyway" | **"Reaper — the OIL answer for this “Range brief” is No; tap to credit him anyway"** |
| (3) hover words of Ranger's own puck on his one-man "Sim prep" | "Ranger answered No for this “Sim prep” — tap to put him on it anyway" | **"The OIL answer for this “Sim prep” is No — tap to put Ranger on it anyway"** |

- **Pictures:**
  - (1) `f1-window-today-*.png` / `f1-window-proposed-*.png`
  - (2) `f1-behind-today-*.png` / `f1-behind-proposed-*.png`
  - (3) `f1-own-today-*.png` / `f1-own-proposed-*.png`
- **Not drawn, same family:** the unanswered forms, "has not answered the OIL question…" and "the OIL question … has
  not been answered yet". These are true as worded (no answer exists), so they are left alone.
- **QUESTION FOR HIM (F1-Q): name nobody, or name who answered?**
  - Naming nobody (drafted) is true whoever answered, and it can be built with words alone.
  - Naming the person would need the app to keep, with each answer, who gave it. Today it does not, though D782 says
    it should.
  - **Recommendation:** name nobody now (the drafted words). File the missing stamp of who answered as its own job, and
    the words can name him once it exists.

## F2 — the Leave War's OIL card: "the OIL follows" (audit fault F2)

**Staged:** the guard rail's Saturday (G above). The four were signed and "Publish day" pressed. Hunter's Sat 18 Jul box
on the Leave War reads HO*. A tap on it opens his card.

| Place | Today | Drafted |
|---|---|---|
| the admin's card, "Where it came from" | "Earned off the published schedule — change the schedule and the OIL follows." | **"Earned off the published schedule. To change it, change the schedule and publish the day again."** |
| a member's own read-only card, the same line (the same two sentences are printed in the code a second time) | the same | the same |

- **Pictures:** `f2-admin-today-*.png` / `f2-admin-proposed-*.png`; the member's card `f2-member-today-*.png` /
  `f2-member-proposed-*.png`, where the run reached it (see the report).
- **The card's other sentence, "Earned off a duty input that was accepted — change that input, not the schedule."**
  It was not reached: no OIL was credited from an input's Yes here, so whether it moves before the day is published
  again was not checked. It is not reworded. **QUESTION FOR HIM (F2-Q):** if an input's credit also waits for the day to
  be published again, that sentence needs the same ending: "…change that input, then publish the day again."
  **Recommendation:** check it in the build job before rewording, and word it the same way if it waits.

## F3 — who a refusal names (audit fault F3)

**Staged as the audit reproduced it:**

1. Ranger (a member) filed a Training "Range brief" for Ace on Thu 16 Jul. The members' switch was on, as the demo
   starts.
2. Hex (another member) set the Inputs calendar's person filter to Ace, opened Thu 16 and opened the input.

| Place | Today | Drafted |
|---|---|---|
| (1) the input's window, read-only line | "Only Ace or an admin can change this." | **"Only Ace, Ranger (who filed it) or an admin can change this."** |
| (2) the Delete key on its card in the opened day (desktop: a phone has no Delete key) | "Only Ace or an admin can delete this input" | **"Only Ace, Ranger (who filed it) or an admin can delete this input"** |

- **Pictures:** (1) `f3-open-today-*.png` / `f3-open-proposed-*.png`; (2) `f3-delete-today-desktop.png` /
  `f3-delete-proposed-desktop.png`.
- **The family's form:** an input of several already says "Only Ranger — who filed it — or an admin can …". These
  drafts use brackets in place of the two dashes, by the writing guide's one-dash rule. The shared form keeps its
  dashes, and a Fable pass may make the two alike.
- **Not drawn: the drag sentence "Only a scheduler can move someone else's input".** The audit found it unreachable: a
  bar its reader may not move never lifts. Drafted all the same for the build: **"Only Ace, Ranger (who filed it) or an
  admin can move this input"**. Also not drawn, same family: "You can only edit your own inputs" and "You can only
  delete your own inputs". A member may also change one he filed. They were not reached in this run.
- **QUESTION FOR HIM (F3-Q): with the members' switch off.** Ranger, the filer, may no longer change it then, and is told
  the switch is off (D731 (8)). So the new sentence naming the filer must show only while the switch is on. With it
  off, today's "Only Ace or an admin can change this." is true. **Recommendation:** two forms, chosen by the switch.
  The switch-off case was not walked.

## F4 — "misses" in the Legend and the warnings' small headings (audit fault F4; his words, D2615)

His words, decided: "overlap flight brief", "overlap sim brief", "overlap flight debrief", "overlap sim debrief". The B
and D chips stay.

| Place | Today | Drafted (his words) |
|---|---|---|
| (1) Edit Schedule's "Legend — colours & flags" | B misses flight brief · B misses sim brief · D misses flight debrief · D misses sim debrief | **B overlap flight brief · B overlap sim brief · D overlap flight debrief · D overlap sim debrief** |
| (2–6) Monday's open warning list, each group's small heading | "Misses flight brief" (x3), "Misses sim brief", "Misses sim debrief" | **"Overlap flight brief"**, **"Overlap sim brief"**, **"Overlap sim debrief"** (and "Overlap flight debrief" where it occurs) |
| (7) the Logic page, the four checks' own names | "Misses flight brief", "Misses flight debrief", "Misses sim brief", "Misses sim debrief" | **"Overlap flight brief"**, **"Overlap flight debrief"**, **"Overlap sim brief"**, **"Overlap sim debrief"** |
| (8) the Logic page's key of flags (B / D chips) | B Misses flight brief … | **B Overlap flight brief …** |

- **Pictures:** `f4-legend-*`, `f4-warnings-*`, `f4-logic-checks-*`, `f4-logic-key-*` (today / proposed, desktop and
  phone).
- **Same list, not pictured:** a flagged puck's hover words name its flag from the same list. "Misses flight brief"
  there becomes "Overlap flight brief".
- **QUESTION FOR HIM (F4-Q): the Logic page and the puck's hover words.** His ruling names the Legend and the warnings'
  headings. The Logic page's check names, its key and a puck's hover words print the same names from the same lists.
  **Recommendation:** change all of them to his words, so one flag is named one way everywhere.
- **Seen, not in this job:** each warning's own sentence still opens "Misses VL BFM brief 17:25–19:45: …". It is
  already ruled (D2424, D2427: "…overlaps…") and filed with [ALL-AVAIL-WINDOW-FLAGS]. These four labels change with it.

## F5 — the words for hiding a warning (audit fault F5)

**Staged:** Monday's warning list, Ranger's "Conflict: VL BFM (step 11:40, T/O 12:40) & Sim EP-4 12:00–13:30". Its ✕
was read, then pressed.

What the app does, read from its code (the audit's walk showed it): a hidden **clash** stays hidden while the same man
is on the same two items, even when their times move (D2001). **Every other warning** returns when its words change, so
today's words are true for those.

| Place | Today | Drafted (a clash's own words) |
|---|---|---|
| (1) the ✕'s hover words | "Hide this warning — it flags no puck and is not counted; it comes back if the situation changes" | **"Hide this warning — it flags no puck and is not counted; it comes back only if another man or another item is in the clash"** |
| (2) the passing note after ✕ | "Warning hidden: no flag, not counted. It returns if the warning changes." | **"Warning hidden: no flag, not counted. It returns only if another man or another item is in the clash."** |

- **Pictures:** (1) `f5-x-today-*.png` / `f5-x-proposed-*.png` (on a phone nobody sees hover words); (2)
  `f5-note-today-*.png` / `f5-note-proposed-*.png`.
- **QUESTION FOR HIM (F5-Q): one sentence for every warning, or a clash's own?** Today's words are true for every
  warning except a clash. **Recommendation:** a clash gets the drafted words, and every other warning keeps today's.
  His approved sentence of 14 Oct then stays for the warnings it is true of.

## F6 — the Logic page line about inputs (audit fault F6)

| Place | Today | Drafted |
|---|---|---|
| the Logic page, "An input closes its hours" | "Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme closes nothing." | **"Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme, cancelled (CX) or marked information only closes nothing."** |

- **Pictures:** `f6-today-*.png` / `f6-proposed-*.png`.
- "Information only" is the app's own name for the ⓘ mark (D760). The cancelled case was reproduced by the audit (the
  crew list frees the man after a CX). The information-only case is the audit's reading of the code. It was not walked
  here.
