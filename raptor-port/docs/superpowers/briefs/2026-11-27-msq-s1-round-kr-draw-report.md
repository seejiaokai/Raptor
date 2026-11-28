# Section 1 (the guard rail) — one round of six cards: the drawings and the card text (chat 204, 27 Nov 26)

Drawn by an Opus drawing helper in its own copy, at commit `baba2b52a` (after `586a7bcd9`), from
`2026-11-27-msq-s1-round-q32-37-draw-brief.md`. No file under `raptor-port/src` changed; nothing committed.

- **Scripts:** `raptor-port/scripts/handpass/n204/draw-round-kr.mjs` (KR-Q1 to KR-Q4, new) and `draw-q30-31.mjs` (cards 30
  and 31, first run here; fixed as listed under "How it ran").
- **Pictures:** `raptor-port/docs/mock/2026-11-26-msq-questions/round-kr/` — `kr-q1/`, `kr-q2/`, `kr-q3/`, `kr-q4/`,
  `q30/`, `q31/`. There are 92 in all. Each is at a desktop's 1536×864 (Chromium) and a phone's 390×844 (WebKit, with
  touch), at 2×. Each comes as a whole screen plus a `-crop`, with the teal ring on what the card is about. Every picture
  was looked at.
- **No page errors and no console errors** came up in any run.

## How it ran

- **The lock.** It was held for about 10 minutes by another chat (chat 208's fix build). The build waited for it, ran
  under it (`gatelock exec … npm run build`) and released it. The preview ran on port 4741 and was stopped afterwards; the
  port and the lock are free. The `node_modules` junction was made and then removed.
- **The grey note's fade** is held (its see-through level only), so the note can be pictured. Its words, place and look
  are the app's own.
  - Fixed on the way: the first hold cancelled nothing when the app had not yet drawn a note that session. It also
    *finished* the fade animation, which leaves the note invisible.
- **Setup that is not a press**, named in each caption:
  - **Moves of squadron.** No screen saves one yet. Saber's move for KR-Q2, and the moves of Quill (record "nasty") and
    Osprey for cards 30 and 31, are written into the browser's saved data, as the walk libraries do it.
  - **KR-Q1's failed save.** After sign-in, the browser's own storage is filled with junk until it refuses more, so the
    next save fails as it does on a full store.
    - Why not the app's ?savefail test switch: with it on, **sign-in itself now waits for a save that never lands**. The
      card says "The last change has not saved yet — check the connection. Sign in waits until it saves." A reload loses
      the sign-in.
    - So the switch can no longer be used for an admin walk. `scripts/handpass/mgb-savefail.mjs` assumes it can.
- **Fixes to `draw-q30-31.mjs`** (never run before):
  - Pictures go under `round-kr/`.
  - Nasty's card is found by his callsign, **Quill**.
  - Card 31's bell line is found by "Training … 27 Jul". The line names the request, not the man.
  - On a phone the squadron number is ringed only where it can be seen. The Input window covers the top bar there.

## KR-Q1 — words for three rare presses while a save has failed

**What could be drawn.** None of the three presses the card names can be reached by a press in today's app:
- **A Redo that changes the squadron.** A test calls this road "a belt: no button reaches it". The first run here bore
  that out. Saber filed an input on 149, picked 142 and pressed Undo. The input was taken back, the app said "Undid:
  Osprey's Training", and **142 stayed in view**.
- **The OIL list's card that brings another squadron.** The list stands over another squadron only by a raw entry,
  "reached by no press since" his rulings of the list (the tests' own words).
- **"Check my quals".** It shows only on his own squadron.

So the round draws the look answer A would copy: the Retry note on an ordinary pick, the app's own words.

**For the coordinator:** since no button reaches the three presses today, the card may be worth dropping or holding. Its
answer changes nothing he can press. That is the coordinator's call; the card text is kept below in case it goes.

**Card text**
- **Title:** When a save has failed, what a stopped press says.
- **When this happens:** almost never. An admin's change has not saved, the yellow "Not saved" band with Retry is across
  the top, and before pressing Retry he presses something that would take him to another squadron. Picking a squadron
  then already says "Blocked: press Retry to save your changes, then pick 149." Three rarer presses say nothing today:
  - Redo, where it would change the squadron;
  - a card on the OIL list that belongs to another squadron;
  - a button that brings his own squadron back.

  In today's app no button reaches any of the three.
- **Choice A:** they say the same note as a pick, with their own ending: "…then press the card again.", "…then press Redo
  again.", "…then try again." He sees the grey note under what he pressed, as in the picture.
- **Choice B:** they stay silent. The press does nothing and nothing is said.
- **Recommended: A.** It is one rule for every stopped press, and it costs nothing in risk.

**Pictures** (all real presses, after the store was filled):
| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `kr-q1/q1-notsaved-desktop` (+crop) | desktop | Saber files a Training for Ranger on 142's Inputs. The save fails: "Not saved — keep this page open" with Retry across the top (ringed). | Today |
| `kr-q1/q1-notsaved-phone` (+crop) | phone | The same on a phone: the band under the top bar. | Today |
| `kr-q1/q1-pick-today-desktop` (+crop) | desktop | With the band up he picks 149. Refused; 142 stays. The grey note (ringed): "Blocked: press Retry to save your changes, then pick 149." This is the look answer A copies. | Today |
| `kr-q1/q1-pick-today-phone` (+crop) | phone | The same through ☰: the note at the foot, on two lines. | Today |

## KR-Q2 — a window held since his move at midnight, then his pick of that window's squadron

**Card text**
- **Title:** A window held at his midnight move, then he picks its squadron back.
- **When this happens:** rare. Saber, a master admin, is moving from 142 to 149 from Thursday. On Wednesday night he has a
  "New input" window open on 142 with words typed. Midnight passes, his view becomes 149's, and the window is held: a
  yellow band "This change could not be saved." with Close, his words still visible so he can copy them. In the morning
  he picks 142, the window's own squadron.
- **Choice A:** the pick goes through and the window closes like any other, its words gone. He sees 142 with no window.
- **Choice B:** the pick goes through and the window comes back live on 142, his words there to finish and save.
- **What he sees today:** the pick is refused: "Blocked: close the open window, then pick 142." The window stays, held.
  **On a phone he cannot even press the pick**, because the window fills the screen and covers ☰. He has to press Close
  first.
- **Recommended: A.** The pick is his own act, he has had the words in front of him since midnight, and B keeps one
  exception alive. B costs about 1.5 hours.

**Pictures** (clock Wed 15 Jul 2026 23:40, run past midnight; his move written as setup):
| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `kr-q2/q2-held-desktop` (+crop) | desktop | Past midnight: the bar reads 149. The "New input" window carries "This change could not be saved." and Close (ringed), with his remarks "Course brief, 0800" under it. | Today |
| `kr-q2/q2-held-phone` (+crop) | phone | The same: the window fills the screen. | Today |
| `kr-q2/q2-pick-today-desktop` (+crop) | desktop | He picks 142. Refused, 149 stays, the window stays. Note (ringed): "Blocked: close the open window, then pick 142." | Today |
| `kr-q2/q2-pick-today-phone` (+crop) | phone | No pick can be pressed: the window lies over ☰. The picture is the screen as it stands. | Today |
| `kr-q2/q2-proposed-desktop` (+crop) | desktop | How answer A would look: 142's Inputs, no window, no note (the number 142 ringed). | Proposed, reached by the band's Close, then the pick of 142 |
| `kr-q2/q2-proposed-phone` (+crop) | phone | The same on a phone. | Proposed, reached by Close, then ☰ → 142 |

Answer B (the window given back live on 142) cannot be reached by presses, so it is not drawn.

## KR-Q3 — a holiday the Calendar says it is keeping, then a pick

**Card text**
- **Title:** A holiday waiting for its leave period, then he picks another squadron.
- **When this happens:** rare. An admin adds a holiday, or changes a saved one's dates, in a year with no leave period yet.
  The Calendar says "It is kept here, and saved by itself as soon as a leave period covers it." Before making the leave
  period he picks another squadron, or presses a bell line that brings one. Nothing is saved yet; only the open form holds
  it. The Calendar's own ✕ drops it without a word today.
- **Choice A:** it is dropped, as the ✕ drops it. The pick goes through and the form closes; he sees the other squadron.
- **Choice B:** the press stops with the note he has seen, "Blocked: cancel the new holiday, or create its leave period,
  then pick 149." This is a new exception to "nothing open stops a pick".
- **Choice C:** B, and the ✕ asks too. That is new on screen and would be drawn first.
- **Choice D:** the waiting holiday is kept apart from the form, so it survives any close. This is a bigger build.
- **What he sees today:** exactly B's note.
- **Recommended: A.** No new note, as he asked, and the "kept" promise already holds only while the Calendar stays open.

**Pictures** (Saber on 142: Inputs → its calendar settings → Calendar… → Holidays):
- Year 2028 had no leave period.
- "+ Add", "Founders Day", Thu 9 Mar 28, Save.

| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `kr-q3/q3-waiting-desktop` (+crop) | desktop | The form says "No leave period covers 9 Mar 28 yet." and "It is kept here, and saved by itself as soon as a leave period covers it." (ringed), with "Create the 2028 leave period". | Today |
| `kr-q3/q3-waiting-phone` (+crop) | phone | The same. On a phone the form is a window of its own, "Add a holiday", over the Calendar. | Today |
| `kr-q3/q3-pick-today-desktop` (+crop) | desktop | He picks 149. Refused, 142 stays. Note (ringed): "Blocked: cancel the new holiday, or create its leave period, then pick 149." | Today |
| `kr-q3/q3-pick-today-phone` (+crop) | phone | The same through ☰. The note stands over the foot of the form. | Today |
| `kr-q3/q3-proposed-desktop` (+crop) | desktop | How answer A would look: 149's Inputs calendar, no Calendar window, no note. | Proposed, reached by the Calendar's ✕, the settings' Cancel, then the pick of 149 |
| `kr-q3/q3-proposed-phone` (+crop) | phone | The same on a phone. | Proposed, reached by the holiday form's ✕ (it closed with no question), the Calendar's ✕, the settings' Cancel, then ☰ → 149 |

Choices C and D are not on screen anywhere, so they are not drawn.

## KR-Q4 — words that keep themselves when he leaves a box

Two examples were drawn. The first behaves differently from what the plan assumed.

**Finding 1 — the Plans window.**
- The Plans window ("Plans — Monday") lies over the whole page, its dark backdrop covering the top bar. A press where the
  squadron button is drawn lands on the backdrop.
- That press **closes the window and keeps the typed name**: it is saved to 142 as he leaves the box. **No note is shown,
  and the squadron list does not open.** A second press picks 149.
- With 142 picked back, the plan menu lists "Wet weather". So for this window, today already behaves like answer A,
  except that it takes two presses. The same happens on a phone.

**Finding 2 — the calendar note.** The Inputs calendar's day window does not cover the top bar on a desktop, so the guard
sees it:
- He types "Brief the new guy" in a new note and, without leaving the box, presses the squadron button.
- The press itself takes him out of the box, so **the note is saved on 142 at once**.
- The pick is then refused: "Blocked: close the open window, then pick 149."
- So today the words are already kept; only the window and the note stand in the way.
- On a phone the day window fills the screen and covers ☰, so no pick can be pressed.

**Card text**
- **Title:** Words in a box that saves itself, when he picks another squadron.
- **When this happens:** now and then, any admin. He is typing in a box that saves itself when he leaves it: a plan's name,
  a template's time, a calendar note. Or he is in a Leave War window whose close keeps his words, such as a held bid's
  remarks. Without leaving it, he picks another squadron or switches view.
- **Choice A:** kept. What he typed is saved into the squadron it belongs to (142) before the squadron changes, exactly as
  leaving the box keeps it today, and never into the new squadron. A value the box itself would refuse is dropped without
  a word. He sees the new squadron, and his words are there when he comes back to 142.
- **Choice B:** dropped, because the ruling says half-typed work is dropped. Each of those boxes and windows would need a
  new "discard" way out, and remarks typed over saved bids would be lost. B costs about 5 hours and a wider walk.
- **What he sees today:** in the two boxes drawn, his words are already kept.
  - In the Plans window, the press closes it and keeps the name. No note.
  - In the calendar's day window, the press saves the note, and then the pick is refused with "Blocked: close the open
    window, then pick 149."
- **Recommended: A.** It matches what the app already does when he leaves a box: nothing is lost, nothing lands in the
  wrong squadron, and no new code is needed.

**Pictures — the Plans window** (Saber on 142, Edit Schedule, Monday's plan menu):
- "+ Alt Plan" made Plan B, the live day.
- The pencil on Plan A, then "Wet weather" typed in Plan name, the box not left.

| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `kr-q4/q4-typed-desktop` (+crop) | desktop | "Plans — Monday", "Wet weather" typed in the name box (ringed). | Today |
| `kr-q4/q4-typed-phone` (+crop) | phone | The same. The app's own message from making Plan B is still at the foot. | Today |
| `kr-q4/q4-pick-today-desktop` (+crop) | desktop | After one press where the squadron button is drawn: the window has closed, 142 stays, no note, no list opened. | Today |
| `kr-q4/q4-pick-today-phone` (+crop) | phone | The same after a tap on ☰'s spot. | Today |
| `kr-q4/q4-proposed-149-desktop` (+crop) | desktop | A second press picks 149: 149's Edit Schedule, no note. | Today's second press, which is also how A looks |
| `kr-q4/q4-proposed-149-phone` (+crop) | phone | The same on a phone. | Same |
| `kr-q4/q4-proposed-kept-desktop` (+crop) | desktop | 142 picked back, the plan menu open: "Wet weather" (ringed) kept on 142. | Today — the name kept |
| `kr-q4/q4-proposed-kept-phone` (+crop) | phone | The same on a phone. | Same |

**Pictures — the calendar note** (Saber on 142, Inputs → Calendar, Mon 30 Nov opened, "+ Note"; the calendar opens on the
real month):
| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `kr-q4/q4n-typed-desktop` (+crop) | desktop | The day window, "Brief the new guy" typed in a new note (ringed), the box not left. | Today |
| `kr-q4/q4n-typed-phone` (+crop) | phone | The same. The window fills the screen. | Today |
| `kr-q4/q4n-pick-today-desktop` (+crop) | desktop | He picks 149. The note is already saved (Mon 30 shows "Brief the new guy"), the pick is refused, and the grey note (ringed) says "Blocked: close the open window, then pick 149." | Today |
| `kr-q4/q4n-pick-today-phone` (+crop) | phone | No pick can be pressed: the day window lies over ☰. | Today |
| `kr-q4/q4n-proposed-149-desktop` (+crop) | desktop | How A would look: 149's Inputs calendar, no window, no note. | Proposed, reached by leaving the box (Tab), the window's ✕, then the pick of 149 |
| `kr-q4/q4n-proposed-149-phone` (+crop) | phone | The same on a phone. | Proposed, same presses |
| `kr-q4/q4n-proposed-kept-desktop` (+crop) | desktop | 142 picked back, Mon 30 Nov opened: "Brief the new guy" (ringed) kept on 142. | Proposed, same presses |
| `kr-q4/q4n-proposed-kept-phone` (+crop) | phone | The same on a phone. | Same |

Answer B (the words dropped) cannot be reached by presses, so it is not drawn.

## Card 30 — the Medical tab after a man moves

**Card text**
- **Title:** A moved man's old medical record: which squadron's Medical tab shows it?
- **When this happens:** a few times a year, whenever a man moves squadron while a medical record is still open. Quill
  moved from 142 to 149 from Thu 16 Jul. His OML of 6–9 Jul was filed while he was 142's. An admin of 149 (or Saber)
  opens Inputs → Medical with "as of" set to 16 Jul.
- **What he sees today:**
  - Quill's 142 OML stands on **149's** Medical tab, under "Pending upchit".
  - Pressing it and "Edit input" opens it live under a bar reading 149, with Save ready. A Save there changes a 142
    record from 149's page.
  - On **142's** tab, the same day, it is not shown.
- **Choice A:** the record stays on 142's tab, and 149's tab shows only his records from the move on. 149's tab would have
  no card for it; 142's would.
- **Choice B:** as today: his old records follow him to 149's tab and open there, live.
- **Recommended: A.** It is the same rule he chose for the Inputs list: a record of 142 is never changed under a bar reading
  149.

**Pictures** (clock Thu 16 Jul 2026 09:00; Quill's move written as setup):
| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `q30/q30-149-today-desktop` (+crop) | desktop | Saber, 149 picked, Medical as of 16 Jul: "Pending upchit 1", Quill's card "OML 6–9 Jul" (ringed). | Today |
| `q30/q30-149-today-phone` (+crop) | phone | The same. | Today |
| `q30/q30-149-today-open-desktop` (+crop) | desktop | The card, then "Edit input": "Quill · 6 Jul → 9 Jul", live (not greyed) under a bar reading 149 (149 ringed), Save ready (ringed). | Today |
| `q30/q30-149-today-open-phone` (+crop) | phone | The same. The window covers the top bar, so only Save is ringed; the bar read 149. | Today |
| `q30/q30-142-today-desktop` (+crop) | desktop | 142 picked, the same day: Grit, Vector and Zenith only — **Quill's OML is not on 142's tab today.** | Today |
| `q30/q30-142-today-phone` (+crop) | phone | The same. | Today |
| `q30/q30-149-proposed-desktop` (+crop) | desktop | **Proposed: drawn by hiding the card.** 149's tab with Quill's card hidden. Nothing else changed, so the "Pending upchit" count still reads 1. | Proposed, drawn by hiding the card |
| `q30/q30-149-proposed-phone` (+crop) | phone | The same. | Proposed, drawn by hiding the card |

`q30-142-proposed` is **not drawn**. The card is not on 142's tab today, so there is no picture to reuse, and putting it
there cannot be done by presses. In words: 142's tab as of 16 Jul would list Quill's OML 6–9 Jul under "Pending upchit"
beside Vector's.

## Card 31 — a bell line about a request whose man has moved since

**Card text**
- **Title:** A bell line about someone who has since moved: which squadron does it open in?
- **When this happens:** now and then. Kestrel (149's admin, who also plans 150) filed a Training for Osprey on Mon 27
  Jul. Saber changed its remarks, so Kestrel's bell got a line. Then Osprey moved to 150 from Thu 16 Jul. On the 16th
  Kestrel presses that line.
- **What he sees today:** the page stays on **149**: Inputs, with the Training's window open and live, Save ready. Since he
  also plans 150, a Save there changes 150's record under a bar reading 149.
- **Choice A:** the line brings the request's own squadron, 150, into view first, then opens it. He sees 150's Inputs with
  the Training open.
- **Choice B:** as today: the line opens the request on 149's page.
- **Recommended: A.** It is one rule: a record is opened only under its own squadron's bar.

  **This is the agent's reading of his ruling of 25 Nov (D2621).** That ruling speaks of a man's *own* requests: "a bell
  line about such an input brings its squadron into view first". Here it is someone else's request, so the step to this
  case is ours.
- **Someone who only views 150 (such as Hunter)** — the earlier helper's reading of the code, unchanged:
  - Under A, he cannot be let into 150, so the press would go on to **his own** squadron's Inputs.
  - It would open the 150 Training there. That is the same fault in another form.
  - So A needs its own rule for view-only people: say nothing and open nothing, or open only 150's View-only Sched.
  - The bell's notes say such a line "opens nothing", but for a request's line the code does not.

**Pictures** (clock Thu 16 Jul 2026 09:00; the filing and the change made by presses on Wed 15 Jul; Osprey's move written
as setup):
| File | Size | Caption | Today or proposed |
|---|---|---|---|
| `q31/q31-bell-desktop` (+crop) | desktop | Kestrel on 149 opens the bell: "Training Mon 27 Jul — Remark changed · Saber" (ringed). | Today |
| `q31/q31-bell-phone` (+crop) | phone | The same. | Today |
| `q31/q31-today-open-desktop` (+crop) | desktop | He presses the line: 149 in the bar (ringed), Inputs, "Osprey · 27 Jul" open and live, remarks "Moved to the afternoon slot", Save ready (ringed). | Today |
| `q31/q31-today-open-phone` (+crop) | phone | The same. The window covers the bar, so only Save is ringed; the bar read 149. | Today |
| `q31/q31-proposed-open-desktop` (+crop) | desktop | **Proposed: reached by picking 150, then opening it.** 150's Inputs list shows the Training; opened, it is live under 150 (ringed). | Proposed, reached by the window's Cancel, picking 150, Inputs, the row |
| `q31/q31-proposed-open-phone` (+crop) | phone | The same. Only Save is ringed; the bar read 150. | Proposed, same presses |

## What went differently from the brief

- KR-Q1's three presses cannot be reached, so only the look answer A would copy is drawn. The ?savefail switch now stops
  sign-in, so the store was filled instead. Both are said above.
- KR-Q4 has two examples, and the Plans window did not behave as the plan expected. Both are said above.
- **On a phone, two windows cover ☰, so no pick can be pressed while they are open:** the held Input window (KR-Q2) and
  the calendar's day window (KR-Q4).
- Cards 30 and 31: the script's fixes are listed under "How it ran". `q30-142-proposed` is not drawn.
- Nothing was forced through the developer's bridge.
- `raptor-port/.tmp/` holds this run's working files (error shots, saved worlds). It is untracked; leave it out of any
  commit.
