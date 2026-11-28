# The rulings audit — round 2 reproduced in the running app (Q7, Q8, Q9, F3, F4, F5, F6)

Walked 25 Nov 26 by an Opus walker for chat 173. This was a reading of the app only: no app code was changed and nothing
was committed.

**Build walked:** the live app's code, `origin/main` at 3787015aa, the build already in `D:/raptor-work/c173-main`
(index bundle `index-DIr933hk.js`, the same file the server served). Nothing was rebuilt. It was served on port 4731,
and that server is now stopped.

**How:** Playwright scripts in Chromium on the desktop at 1536×864. Each run used a fresh browser context on the app's
real storage, opening on the demo week of 13–19 Jul 26. Sign-ins: `ad`/`a` (Saber, admin), `us`/`us` (Ranger, member),
and `hex` (Hex, a member account the demo already has on Admin → Users, which takes any password). Every fixture was
made through the screen's own controls: the Inputs calendar and its input window, the SANS calendar's "+ Commitment",
the crew list (a tap on the seat, then a tap on the name, or a drag of the puck), the board's "+ Wave" and CX, the time
boxes, the in-time lines, the day's Templates, the sign-off boxes and Publish day. Data was read from the page only to
check that each step had landed. The clock was not pinned. No run had a console error, a page error or a failed
request.

**Pictures:** `raptor-port/docs/img/handpass/2026-11-25-audit-round2/` (29 PNGs, each from its item's final run).
Each is cropped to the place, and a red box marks the place. Where a picture shows hover words, the yellow label is the
walker's own: the script read the control's hover words and drew them, because a browser never paints them. Scripts:
`D:/raptor-work/c173-walk2/` (`q7.mjs`, with `KIND=avalon` for the AVALON run; `q8.mjs`, `q8b.mjs`, `q9.mjs`, `f3.mjs`,
`f4.mjs`, `f5.mjs`, `f6.mjs`; helpers `lib.mjs`, `inp.mjs`, `fsetup.mjs`). Exploration pictures are in
`D:/raptor-work/c173-walk2/scr/` and are not evidence.

## Results

| Item | Verdict | In one line |
|---|---|---|
| Q7 | PASS-REPRODUCED (SC SPARE and AVALON) | Hex stands by 07:00–13:00 on Saturday. The crew list shows him free, but the ALL AVAIL count for a 09:00 OPS BRIEF (44) leaves him out, its window does not name him, and OIL Earn's "Who earns OIL 44 of 44" does not include him. |
| Q8 | PASS-REPRODUCED | Jester is SANS with nothing filed for Tue 14 Jul. He was put in VL's front seat: the crew list strikes him, the warning list stays at the same four lines with nothing about him, and "Tuesday published and approved". Filing "OFT only" instead gives the amber line "SANS: not offering Fly today". |
| Q9 | PASS-REPRODUCED | Ridge on Friday's SXO desk from 20:00, with no end typed. Saturday's crew-rest line reads "Friday duty ended 21:00 → clear 09:00. Report 07:00: 10h rest, needs 12h." With END 23:00 typed it reads "ended 23:00 → clear 11:00". |
| F3 | PASS-REPRODUCED for the open sentence and the Delete-key sentence; NOT-REPRODUCED for the drag sentence | Hex opens the Training Ranger filed for Ace and reads "Only Ace or an admin can change this.", but Ranger, the filer, can change it. The Delete key gives "Only Ace or an admin can delete this input". A drag of the bar does nothing and says nothing, so "Only a scheduler can move someone else's input" never shows. |
| F4 | PASS-REPRODUCED | The Legend reads "misses flight brief / misses sim brief / misses flight debrief / misses sim debrief". The warning list's short names read "Misses flight brief", "Misses sim brief" and "Misses sim debrief". |
| F5 | PASS-REPRODUCED | The hide ✕'s hover words say "it comes back if the situation changes", and the passing note says "It returns if the warning changes." The sim was then moved 30 minutes later and the warning's own words changed to 12:30–14:00, but the warning stayed hidden. |
| F6 | PASS-REPRODUCED | Ranger's Training 07:00–09:00 on Wed 15 Jul closes him ("already on RANGE COURSE 07:00–09:00"). Once it is cancelled (CX) on the board, the crew list reads him free in those hours. The Logic page still says "Every input closes the man for the hours it covers… One a scheduler has taken off the programme closes nothing." |

## Q7: a man on standby and the ALL AVAIL count

**What I did (SC):**
1. Signed in as Saber. On Saturday's Scheduler Board I pressed "+ Wave" → SC. This made the AM shift 07:00–13:00 and
   the PM shift 13:00–19:00, each with two MAIN rows and two SPARE rows.
2. On the edit week I picked the AM shift's first SPARE row (WSO seat) and tapped Hex.
3. On the Inputs page I filed a Training "OPS BRIEF" for ALL AVAIL on Sat 18 Jul, 09:00–10:00. Its weekend OIL
   question was answered Yes · HO.

**What happened:**
- **Crew list** (armed on the OPS BRIEF row's people cell, Saturday, 09:00–10:00): Hex is full colour with no reason
  line, and he is counted in "WSOS · 17 FREE".
- **The ALL AVAIL count** on the row reads **44**. Its window lists "WSOS · 16", and Hex is not among them.
- **OIL Earn** (board, Saturday): the same count window reads "Who earns OIL 44 of 44", and Hex is not in it. His own
  puck on the SC SPARE line reads "this kind of event earns nothing by default". So on this weekend he earns nothing
  from the OPS BRIEF.

**AVALON (`KIND=avalon`):** "+ Wave" → AVALON made one row, NIGHT 19:00–07:00. I first ran it with those hours. The
09:00 brief then fell outside his standby, so Hex was counted (45) and named in the window. That is correct and is not
part of the finding. I then typed START 07:00 and END 13:00 on the row and put Hex on its first MAIN row. With those
hours the result matches SC exactly: he is free in the crew list, the count is 44, the window does not name him, and
OIL Earn's 44 of 44 does not include him.

**Pictures:**
- `q7-01-crew-list-hex-free.png`: the crew list armed on OPS BRIEF, with Hex full colour in the WSO column ("WSOS · 17
  FREE").
- `q7-02-allavail-count-window-no-hex.png`: the 44 count (marked) and its window, "WSOS · 16", with no Hex.
- `q7-03-oilearn-window-no-hex.png`: the OIL Earn window, "Who earns OIL 44 of 44", with no Hex.
- `q7av-01…03`: the same three for the AVALON row at 07:00–13:00.

## Q8: a SANS man with nothing filed, put in a jet

**What I did:**
1. Jester is a SANS pilot in the demo, ticked SANS from always, with no SANS availability filed on any day. I did not
   tick a man on Quals myself. A tick made by hand today counts from today (25 Nov 26), so it would not make July days
   SANS. The demo's own SANS man stands in.
2. On Tuesday 14 Jul I dragged Jester's puck from the crew list onto VL's front seat in wave 2 (14:40). The seat had held
   Ace. A tap on the seat followed by a tap on Jester did not place him, because the tap on a full seat picks Ace, so I
   used the drag. Nothing was said about it.
3. I then picked the four sign-off names and pressed Publish day.

**What happened:**
- **Crew list, Tuesday:** Jester is struck and dimmed under "SANS AVAIL · 1 FREE". His hover words read "SANS — no
  availability filed for today".
- **Warning list, Tuesday:** "4 issues · 2 warnings", the same four lines as before he was seated (Saint ×2, Outlaw,
  Static). Nothing names Jester.
- **His puck on the seat** reads "Jester · B · 2-ship FL · SANS", and it has no flag.
- **Publish:** "Tuesday published and approved". The day now carries ORIG with its four names, and nothing stood in the
  way.
- **Comparison (`q8b.mjs`, a fresh world):** I filed Jester "OFT" only for Tuesday through the SANS calendar's
  "+ Commitment", then put him on the same seat. The warning list gains "SANS availability — planned outside the
  availability filed · Jester — SANS: not offering Fly today. Planned on VL SAT (T/O 14:40)".

**Pictures:**
- `q8-01-crew-list-tuesday-jester-struck.png`: Tuesday's crew list, with Jester struck (marked) and the "SANS AVAIL · 1
  FREE" heading (marked).
- `q8-02-warning-list-nothing-about-jester.png`: Tuesday's open warning list, its four lines, no Jester.
- `q8-03-jester-on-vl-front-seat.png`: Jester on VL's front seat.
- `q8-04-tuesday-published.png`: the publish note "Tuesday published and approved", with the day's ORIG / signed line
  above it.
- `q8-05-compare-oft-only-filed-list-names-him.png`: the comparison line "SANS: not offering Fly today".

## Q9: a duty desk with a start and no end

**What I did:**
1. Saved Thursday as a day template and applied it to Saturday. I changed Saturday wave 1's two in-time lines to
   "07:00H: FIRST WAVE … IN TIME" and put Ridge on VL's front seat.
2. On Friday's Duty block I typed 20:00 in the SXO row's START (Ridge's row) and cleared its END.
3. Then I typed END 23:00.

**What happened:**
- With END blank, Saturday reads "Crew rest (<12h) · Ridge — Crew rest: Friday duty ended 21:00 → clear 09:00. Report
  07:00: 10h rest, needs 12h." The app took the duty as ending an hour after its start.
- With END 23:00: "Friday duty ended 23:00 → clear 11:00. Report 07:00: 8h rest, needs 12h."
- Ridge is not SANS, and the desk is an ordinary Duty block, made from no SC, AVALON or BB template.

**Pictures:**
- `q9-01-friday-sxo-start-2000-no-end.png`: Friday's SXO row, 20:00 with the END dash, Ridge on it.
- `q9-02-saturday-vl-intime-0700-ridge.png`: Saturday's 07:00 in-time lines and Ridge on VL.
- `q9-03-crew-rest-reads-friday-duty-ended-2100.png`: the crew-rest line, "ended 21:00".
- `q9-04-compare-end-2300-typed.png`: the same line with END 23:00.

## F3: who a refusal names

**What I did:**
1. Signed in as Ranger (a member). The members' switch is on, as the demo starts, and nothing is stored for it. On the
   Inputs calendar I filed a Training "Range brief" for Ace on Thu 16 Jul, 06:00–18:00. The stored record is Ace's,
   placed by Ranger.
2. Signed out and signed in as Hex, also a member. I set the calendar's person filter to Ace and opened Thu 16 Jul.

**What happened:**
- **Opening it:** the window reads "Placed by Ranger for Ace · …" and then **"Only Ace or an admin can change this."**
- **The Delete key** on its card in the opened day gives the passing note **"Only Ace or an admin can delete this
  input"**.
- **Dragging its bar** from Thu 16 to Fri 17 with the mouse, twice: the bar does not lift, nothing lights, no note shows,
  and the input stays on 16 Jul. The code agrees: a bar its reader may not move never lifts. So the words "Only a
  scheduler can move someone else's input" are not reached by a member dragging another man's bar on this build. They
  sit only behind a drop that started as allowed. **NOT-REPRODUCED for that sentence.**
- **The filer:** signed back in as Ranger and opened the same input. There is no refusal line and Save is shown, so
  Ranger may change it. The sentence Hex read leaves him out, though he is the one Hex should ask.
- The members' switch turned off was not walked. The item names the switch on.

**Pictures:**
- `f3-01-ranger-files-training-for-ace.png`: Ranger's new input, Person Ace and Type Training (both marked).
- `f3-02-hex-opens-refusal-ace-or-admin.png`: Hex's view, "Placed by Ranger for Ace" and the refusal (marked).
- `f3-03-hex-drags-bar-nothing-said.png`: after the drag, the bar (marked) still on 16 with no note.
- `f3-04-hex-delete-key-only-ace-or-admin.png`: the Delete-key note (marked).
- `f3-05-ranger-the-filer-may-change-it.png`: Ranger's view of the same input, with Save (marked).

## F4: "misses" in the Legend and the short names

**What happened:** on Edit Schedule I opened "Legend — colours & flags". Its flags row ends with **B misses flight
brief · B misses sim brief · D misses flight debrief · D misses sim debrief**. Monday's open warning list heads five
lines with the short names **"Misses flight brief"** (three times), **"Misses sim brief"** and **"Misses sim
debrief"**. These are the demo's own warnings, for example Saber "Misses VL BFM brief 17:25–19:45: OPS SHARING + NAV
SYS BRIEF 17:55–18:55".

**Pictures:**
- `f4-01-legend-four-misses-labels.png`: the four Legend labels (marked).
- `f4-02-warning-list-short-names-misses.png`: the five short names (each marked).

## F5: the words for hiding a warning

**What I did:**
1. On Monday's warning list, Ranger's "Conflict: VL BFM (step 11:40, T/O 12:40) & Sim EP-4 12:00–13:30". I read its
   ✕'s hover words, then pressed ✕.
2. I moved the sim 30 minutes later through its own time boxes: END 14:00, then START 12:30.

**What happened:**
- The ✕'s hover words: **"Hide this warning — it flags no puck and is not counted; it comes back if the situation
  changes"**.
- The passing note: **"Warning hidden: no flag, not counted. It returns if the warning changes."** The count went from
  17 issues · 6 warnings to 16 · 5.
- After the move, the checks still find the clash, now worded "… & Sim EP-4 12:30–14:00". It stays hidden: the line is
  struck out, its button reads "Flag this again", and the count stays 16 · 5. So the warning changed, but it did not
  return. This is as ruled (D2001: same man, same two items), and the words promise otherwise.

**Pictures:**
- `f5-01-hide-x-hover-words.png`: the ✕ (marked), with the walker's yellow label showing its hover words.
- `f5-02-hidden-note-returns-if-warning-changes.png`: the passing note (marked).
- `f5-03-after-moving-the-sim-still-hidden.png`: the clash with its new times, struck out and still hidden (marked).

## F6: the Logic page line about inputs

**What I did:**
1. As Saber I filed a Training "Range course" for Ranger on Wed 15 Jul, 07:00–09:00, on the Inputs calendar.
2. On Edit Schedule I armed Wednesday's SODB row (07:45–08:00). The crew list showed Ranger struck: "already on RANGE
   COURSE 07:00–09:00".
3. On Wednesday's Scheduler Board I pressed CX on the Training's row ("Cancel this item (CX)") with the reason "RANGE
   CLOSED". The input is now cancelled.
4. Re-armed the SODB row.

**What happened:** after the CX, Ranger is full colour in the crew list with no reason, so he is free in the hours the
input covers. The Logic page's "An input closes its hours" still reads: **"Every input closes the man for the hours it
covers, from the moment it is filed. One a scheduler has taken off the programme closes nothing."** It does not
mention a cancelled input.

**Pictures:**
- `f6-01-crew-list-ranger-closed-by-training.png`: before, Ranger struck (marked).
- `f6-02-board-training-row-cancelled.png`: the board's RANGE COURSE row with CX on (marked).
- `f6-03-crew-list-ranger-free-after-cx.png`: after, Ranger free (marked).
- `f6-04-logic-every-input-closes.png`: the Logic line (marked).

## Notes for the host

- F3's drag sentence is unreachable by the gesture the brief describes. It still stands in the code, so the fix job
  should reword it all the same, or the job should decide it is dead words.
- Q8 used the demo's SANS man (Jester) rather than a fresh Quals tick, because a hand tick counts from today's real date
  (D2313). Jester is ticked SANS with no start date, so he is SANS on every day of the demo week.
- Q7's first AVALON try showed the rule working where it should. With the row's own night hours (19:00–07:00) the 09:00
  brief is outside his standby, and he is counted.
