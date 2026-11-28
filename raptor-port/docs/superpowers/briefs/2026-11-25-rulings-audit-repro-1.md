# The rulings audit — round 1 reproduced in the running app (F1, F2, Q1, Q2, Q4, Q5)

Walked 25 Nov 26 by an Opus walker for chat 173. Reading of the app only: no app code changed, nothing committed.

**Build walked:** the live app's code, `origin/main` at 3787015aa (pull request 841 merged). It sits in a detached
working copy, `D:/raptor-work/c173-main`, which is left in place. `origin/main` later moved to 24a1a6458 (pull request
842). That merge changes nothing under `raptor-port/src` (checked with a diff), so the build walked is the live app.
The build ran under the checks lock and was served on port 4731. That server is now stopped.

**How:** Playwright scripts in Chromium on the desktop at 1536×864, each world a fresh browser context on the app's
real storage (the demo week of 13–19 Jul 26). Sign-ins: `ad`/`a` (Saber, admin) and `us`/`us` (Ranger, member). Every
fixture was made through the screen's own controls: the day's Templates, the crew list, the time boxes, the sign-off
boxes, Publish day, the Inputs window, the Inputs gear's Calendar → Holidays, the OIL list, the Logic page's Edit, and
the Inputs gear's late cut-off. Data was read from the page only to check that each step landed. Only Q5 pins the
browser clock (to Thu 25 Jun 26), so that an input can be filed on time. Without it every July input reads LATE,
because the late mark judges the real date the input was filed. No console errors, page errors or failed requests
in any run.

**Pictures:** `raptor-port/docs/img/handpass/2026-11-25-audit-round1/` (18 PNGs, one final run). Each is cropped to the
place, and a red box marks the place. Scripts: `D:/raptor-work/c173-walk/` (`q1setup.mjs`, `q1d.mjs`, `q1e.mjs`,
`f1.mjs`, `q2.mjs`, `q4.mjs`, `q5.mjs`, `fsetup.mjs`, `lib.mjs`). Exploration pictures are in `…/c173-walk/scr/` and are
not evidence.

## Results

| Item | Verdict | In one line |
|---|---|---|
| Q1 | PASS-REPRODUCED | A Saturday flight published with a take-off and no landing credits half a day of OIL, worked to the assumed landing plus the debrief. Changing "A flight" then makes the published Saturday read 1 pending and clears its four names. |
| F2 | PASS-REPRODUCED | The Leave War's OIL card says "change the schedule and the OIL follows", with no word about publishing the day again. |
| F1 | PASS-REPRODUCED | Saber pressed "No to all", but OIL Earn says "Whoever filed this "Range brief" answered No" and "Ranger answered No for this "Sim prep"". Ranger never answered. |
| Q2 | PASS-REPRODUCED | One of three questions answered at CUR CK, then Save. SKED CK, PLANNED BY and APPROVED BY ask nothing more, and the publish note names the two left. |
| Q4 | PASS-REPRODUCED for 2 of 3; CANNOT-REACH for the SANS reminder | The bell shows "3 people added · Saber", and the publish note shows "4 inputs have no OIL answer". The SANS reminder's "and N more" is not on `main`. |
| Q5 | PASS-REPRODUCED | Raising the Inputs late cut-off from 14 to 21 days puts LATE on Ranger's LL on the published Tuesday at once. Nothing reads pending, and the four signatures stay. |

## Q1 — a weekend flight published with no landing typed

**What I did:**
1. Saved Thursday as a day template and applied it to Saturday 18 Jul (Templates). This gives Saturday Thursday's
   waves.
2. Put Hunter on VL's first front seat. I used Hunter, not Ranger, because Ranger carries a leave mark that week.
3. Typed take-off 10:00 and cleared the landing.
4. Picked the four sign-off names and pressed Publish day. The note read "Saturday published and approved".

**What happened:**
- The Leave War shows Hunter "HO*" on Sat 18 Jul.
- Tapping it opens the card: Reason FLT, Given by Weekend/PH, Days "half a day, AM — worked 09:45–13:00". That is the
  wave's in-time 09:45, to the assumed landing 11:00 (take-off plus the 1-hour flight length), plus the 2-hour debrief.
  No landing was ever typed.
- On the Logic page, "A flight" reads 1h, and its words say OIL counts to the assumed landing. The "A sim" line just
  below it says a sim with no end "earns no OIL until its end is typed".
- I changed "A flight" to 2h (Logic → Edit → Done). Saturday then read "1 pending" and "Not yet signed", its four
  sign-off boxes went empty, and the amendments panel read "Sat · 1 change · what this day earns changed". This is
  the brief's "loses its four names".
- I did not open the board's OIL Earn on Saturday. The Leave War card is where the person's OIL shows.

**Pictures:**
- `q1-01-sat-flight-no-landing.png` — VL on Saturday: take-off 10:00, landing blank, Hunter on the front seat.
- `q1-02-lw-hunter-sat18-oil-box.png` — Hunter's HO* box on Sat 18 Jul on the Leave War grid.
- `q1-03-lw-card-half-day-from-assumed-landing.png` — the card's Days line: "half a day, AM — worked 09:45–13:00".
- `q1-04-logic-a-flight-setting.png` — Logic's "A flight 1h" (marked), with the "A sim … earns no OIL" line under it.
- `q1-05-a-flight-changed-sat-pending-names-cleared.png` — after "A flight" changed to 2h: "1 pending", "Not yet
  signed", the four boxes empty, and "what this day earns changed" in the amendments panel.

## F2 — the Leave War's OIL card: "the OIL follows"

**What happened:** on the same HO* card as Q1, the "Where it came from" line reads "Earned off the published schedule
— change the schedule and the OIL follows." An admin, or any person who taps an FO*/HO* box, sees it. The card's other
wording, "Earned off a duty input that was accepted — change that input, not the schedule.", was not reached in this
walk: no OIL was credited from an input's Yes here.

**Picture:** `f2-01-lw-card-oil-follows-the-schedule.png` — the card, with the "Where it came from" line marked.

## F1 — OIL Earn names the filer when an admin said No

**What I did:**
1. As Ranger, a member, filed two Trainings on working Friday 17 Jul. "Range brief" is for ALL AVAIL, 09:00–12:00.
   "Sim prep" is for himself, 13:00–15:00. Neither asked the OIL question, because Friday was a working day.
2. As Saber, made Friday a public holiday ("National Day"). The day's OIL list opened by itself.
3. Pressed "No to all", then Save. The list showed "By Ranger" on the ALL AVAIL card. Afterwards both inputs carry an
   answer of 0, last changed by Saber.

**What happened:** on the Scheduler Board, Friday, OIL Earn:
- The count window of Range brief's ALL AVAIL reads "Whoever filed this "Range brief" answered No to OIL, so by
  default nobody behind it earns."
- The hover words on Ranger's puck on Sim prep read "Ranger answered No for this "Sim prep" — tap to put him on it
  anyway".
- Ranger answered neither. Saber did.

**Pictures:**
- `f1-01-admin-no-to-all.png` — the OIL list after Saber's "No to all" (marked), every card on No.
- `f1-02-oilearn-window-whoever-filed-answered-no.png` — the ALL AVAIL count window, its "Whoever filed this … answered
  No" line marked.
- `f1-03-oilearn-puck-ranger-answered-no.png` — Ranger's puck on Sim prep, marked. A browser never paints hover words
  in a picture, so the script read the puck's own hover words and drew them in a yellow label under it ("Hover words:
  …"). The label is the walker's, not the app's.

## Q2 — a sign-off that answers only some of the day's OIL questions

**What I did:**
1. As Saber, filed Ranger's Training "Range brief" and Hunter's Duty "Gate duty" on Fri 17 Jul. The demo's Nomad OD is
   already on that day.
2. Made Friday a holiday and pressed Later on its list.
3. On the edit week, picked a name in Friday's CUR CK box. The list opened, headed "CUR CK Ace waiting for your
   answer", "3 TO ANSWER".
4. Picked Yes · HO on Ranger's Range brief only, and left the other two. The list read "1 OF 3 ANSWERED". Its foot read
   "Later: Ace signs, but nobody on them earns OIL." I pressed Save.

**What happened:**
- Range brief now has its answer. Gate duty and Nomad's OD still have none.
- Picking SKED CK, PLANNED BY and APPROVED BY opened no list. The names went straight in.
- Publish note: "Friday 17 Jul published and approved. Hunter's Gate duty and Nomad's OD have no OIL answer, so
  nobody on them earns OIL."
- Nothing on the list said that Save would leave the unpicked rows as Later leaves them. Its only foot line is Later's
  own.

**Pictures:**
- `q2-01-first-signoff-one-of-three-answered.png` — the list at the first sign-off: one Yes picked and Save marked.
- `q2-02-second-signoff-asks-nothing.png` — SKED CK (marked) signed straight in, with no list.
- `q2-03-publish-note.png` — the publish note naming the two inputs left unanswered.

## Q4 — counts in place of names

**(a) The bell — PASS-REPRODUCED.**
1. As Ranger, filed his own Meeting "Safety board" on Thu 16 Jul.
2. As Saber, opened it from the Inputs day window, switched on Several people, added Hunter, Saber and Tally, and saved.
3. Signed in as Ranger. His bell was lit, with one line: "Safety board Thu 16 Jul / 3 people added · Saber". It does
   not say who was added.

Picture: `q4-01-bell-three-people-added.png`.

**(b) The SANS reminder's "and N more" — CANNOT-REACH on `main`.** The SANS reminder is not in the live app's code at
all. The bell's code on `main` has no SANS reminder line, and there is no "planned on … with nothing filed" wording
anywhere in it. The branch that carries it, `claude/allavail-sans-postout-141`, is not merged into `main`. To show it,
that branch must be built and walked instead.

**(c) The publish note — PASS-REPRODUCED.**
1. As Saber, filed three inputs on Fri 17 Jul: Ranger's Training, Hunter's Duty, and a Training "Survival" for three
   people (Tally, Harpoon, Mamba). With the demo's Nomad OD that makes four.
2. Made Friday a holiday, pressed Later, then pressed Later again at the first sign-off ("4 TO ANSWER"), and published.
3. The note read "Friday 17 Jul published and approved. 4 inputs have no OIL answer, so nobody on them earns OIL." It
   names none of the four.

Picture: `q4-03-publish-note-four-inputs-counted.png`. For the comparison the brief asks for, `q2-03-publish-note.png`
shows the named form for two inputs. "Training for 3 people", the wording he approved, was not shown on its own: with
four unanswered, it is folded into the count.

## Q5 — a changed late cut-off moves LATE on a published day

**What I did:**
1. Set the browser clock to Thu 25 Jun 26, 09:00.
2. As Saber, filed Ranger's LL for Tue 14 Jul. It was stamped 25 Jun, on time under the 14-day cut-off.
3. Signed Tuesday's four boxes and published it ("Tuesday published and approved").
4. On the published Tuesday, Ranger's LL row read "Ranger … till 14 Jul", with no LATE. The day showed three other
   LATE tags.

**What happened:**
- I raised the cut-off on the Inputs gear (Days before 14 → 21; the window's example read "due by the end of Mon 22
  Jun") and pressed Save.
- With no other step, Ranger's LL row on the published Tuesday read "LATE … till 14 Jul" (four LATE tags now).
- The amendments panel still read "No pending changes".
- Tuesday's signed row was unchanged: "Signed ORIG · CUR CK Ace · SKED CK Anvil · PLANNED Anvil · APPROVED Anvil".
- Tuesday's "6 changes" chip read the same before and after.
- Not walked: the View-only Sched face.

**Pictures:**
- `q5-01-published-tue-ranger-ll-not-late.png` — Ranger's LL on the published Tuesday before the change: no LATE.
- `q5-02-inputs-cutoff-raised-to-21-days.png` — the Inputs gear with 21 typed (marked).
- `q5-03-published-tue-ranger-ll-now-late.png` — the same row after Save: LATE.
- `q5-04-published-tue-nothing-pending-signatures-kept.png` — "No pending changes" and Tuesday's signed row, both
  marked.

## Notes for the host

- **The same evidence also bears on L1.** The Logic page's "A sim" line ("earns no OIL until its end is typed") stands
  right under "A flight", which earns to the assumed landing. Q1's fourth picture shows the two side by side, which may
  help when Q1 is put to him.
- **Not covered:** nothing was walked on a phone. Q3 and L2 were not in this brief and were not walked.
