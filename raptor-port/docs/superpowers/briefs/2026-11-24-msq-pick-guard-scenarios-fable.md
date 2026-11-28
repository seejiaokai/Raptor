# [MSQ-PICK-GUARD] the walk's scenarios — a fresh Fable's list (D2443; chat 171, 24 Nov 26)

Saved verbatim from the helper's report file by the host. **Who:** a fresh Fable helper, read-only, started with no
context of the chat. **Brief:** `2026-11-24-msq-pick-guard-scenario-brief.md`. **Read:** `C:\Users\User\projects\Raptor-msq`,
the branch `claude/msq-b1-screens-135` at `6c83d5802`. **Blind to:** Astra's list, written meanwhile into another
scratch folder it was told not to open. **Ran:** about 15 minutes, 70 tool uses; no compaction (its own statement,
below).

---

# Scenario design — the guard rail at a squadron pick, a change of view and sign-out (blind designer: a fresh Fable), 24 Nov 26

Folder read: `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`. Read-only; nothing built, run or changed.
No other scenario list, reader's report or hand-pass sheet was opened; no compaction happened in this run.

**What I read:** the brief; the full rows of D2403, D2405, D2590–D2595, D2318, D2323, D2389, D2395, D2637, D2381, D148,
D1622, D1667, D1668; the People & accounts page §Many squadrons; the press report; the questions page (`page.html`); the
drawings p1b, p2b, p3-p, p4b, p5, p6, p8; `OUTSTANDING.md` [MSQ-PICK-GUARD] and [MSQ-NIGHT-153-OPEN]; the checklist's
lessons; and today's doors in the code (`state/pick.ts`, `state/belltap.ts`, `state/store.ts` enterSquadron /
switchRoleView / the landings / the bands, `state/typing-hold.ts`, `ui/topstate.ts`, `ui/logout.ts`, `ui/Shell.tsx`,
`ui/Drawer.tsx`, `ui/SquadronMenu.tsx`, `ui/pops.ts`, `ui/barfree.ts`, `ui/textedit.ts`, `ui/SaveStatus.tsx`,
`ui/UsersPanel.tsx`, `ui/InputWindow.tsx`, `leavewar/ui/Sheet.tsx`, `tracker/role.js`, `tracker/app/core.js`,
`undo/timeline.ts`, `ui/Login.tsx`).

**Names used below, as the app shows them**
- **The picker** — the squadron number beside TALON in the top bar, "142 ▾"; its list is headed "Schedules", a row per
  squadron ("142 Your squadron", "149 Full access" / "149 View only"), a tick on the one in view.
- **The ☰ picker** — the same "142 ▾" at the head of the ☰ menu, its rows opening inside the menu.
- **The badge** — "SABER · ADMIN" / "SABER · MEMBER" at the bar's far right (a desktop only).
- **The ☰ role line** — "Switch to the member view" / "Back to the admin view" under "Signed in as".
- **Logout** — the bar's button, and the ☰ menu's.
- **The grey note** — the app's plain grey passing note, a red "no entry" sign, "Blocked:" in bold white (D1668).
- **The refresh card** — a shade over the whole app, one card, one button "Refresh" (D2591).
- **The Tracker's question** — "You have unsaved chart edits on “2026”. Save them before switching to 149?" — Stay /
  Discard them / Save them.
- **The Input window's own question** — "This input has unsaved changes. Close it and lose them?" — "Discard and close" /
  "Keep editing".
- **The failed-save band** — "Not saved — keep this page open" with Retry; the other band is "Not kept — this browser
  loses your work on a reload" (no Retry).

**People:** Saber (`ad` / `a`) master admin, home 142. Hunter (`hunter`) 142's admin, given Plan of 149 by Saber where a
scenario says so. Ranger (`us` / `us`) a 142 member, given View of 149 where a scenario says so. Kestrel 149's admin.
Osprey a 149 member.

**Sizes:** D = desktop 1536 × 864. P = phone 402 × 874 (WebKit where a scenario says so). PL = a phone on its side,
874 × 402. T = a tablet upright, 768 × 1024.

---

## 1. Doors × states

**Cell words.** REFUSED-W = the grey note "Blocked: close the open window, then …" (D2590). REFUSED-R = "Blocked: close the
open row, then …" (D2595, a draft). REFUSED-S = the grey note asking for Retry first, never the words "Not saved" (D2594,
words not yet given). ASKED-T = the Tracker's question. ASKED-W = the open window's own question. GOES = goes through.
N/R = cannot be reached (why). NOT SAID = the rulings do not say (the question's number in §4). Every REFUSED is drawn
just under the control pressed on a desktop and at the screen's foot on a phone; after it the window is live, its typing
kept, the squadron and the view as they were.

**The endings of the note, by door:** a pick "…then pick 149."; the badge or the ☰ role line "…then switch to the member
view." / "…then switch back to the admin view."; a bell line "…then press this line again."

### 1a. The doors he presses himself

| State when the door is pressed | Pick — the picker's row, the ☰ picker's row | View switch — the badge, the ☰ role line | A bell line (or the bell itself) that would bring another squadron in | Logout — the bar's, the ☰ menu's |
|---|---|---|---|---|
| S0 Nothing open, nothing unsaved | GOES (as today; a View-only squadron lands on its View-only Sched, D2381) | GOES | GOES — the line's squadron entered, its window or page opened (D2325) | GOES — signs out, page reloads (as today) |
| S1 Input window open, nothing typed (an existing input; a new one) | REFUSED-W (D2403, D2590; drawing p1b) | REFUSED-W (p2b) | REFUSED-W "…then press this line again." (p4b); the bell's own tap: NOT SAID which words (Q7) | GOES, nothing asked (D1622: the question is only for typed words) |
| S2 Input window with typed words | REFUSED-W | REFUSED-W | REFUSED-W; never today's "Open Hunter's input and lose them?" card over a moved page | ASKED-W first, then ASKED-T if chart edits, one at a time (D2592) |
| S3 Input window with one of its own questions already up (the ✕'s "Close it and lose them?", "Open …'s input and lose them?", the OIL answer, a medical or document question) | D: REFUSED-W if the bar is free under the question; else N/R — NOT SAID which (Q4) | the same | the same | NOT SAID: a second question over the first? (Q14) |
| S4 Leave War "My leave" (a person's window — it leaves the page working) | REFUSED-W (D: under the picker; P: foot, drawing p3-p) | REFUSED-W | REFUSED-W | NOT SAID: it has no question of its own (Q16) |
| S5 Leave War windows with a shade — Open for bidding, Place a bid, Settings, Legend, the OIL tracker, a day's window, Events, Grades, Manning, Remarks | D: N/R (the shade covers the picker, the badge and the bell — press report A); P: Place a bid and Settings leave the bar bare but a tap opens nothing — NOT SAID (Q22) | the same | the same | D: N/R by mouse; by the Tab key NOT SAID (Q38); P: D2592 says Logout is reachable — NOT SAID how (Q17) |
| S6 SANS day window | REFUSED-W (the questions page: "the guard will refuse that pick") | REFUSED-W | REFUSED-W | NOT SAID (Q16) |
| S7 The OIL list (a holiday's list; one opened by a sign-off box, a name held unwritten) | REFUSED-W (D2403's row: "the OIL list counts as a window") | REFUSED-W | REFUSED-W | NOT SAID (Q16) — the held sign-off is dropped today |
| S8 Inputs settings, SANS settings, Calendar (Days), Add a holiday (a name typed), Every Monday | REFUSED-W (each has a title and ✕ — the host's reading; today each closes silently and the typed name is lost) | REFUSED-W | REFUSED-W | NOT SAID (Q16) |
| S9 Changes window; ALL AVAIL window | REFUSED-W by the host's reading — NOT SAID by a ruling (Q4) | the same | the same | GOES (nothing typed in them) |
| S10 Windows that leave the bar free and close at any other bar press (D1645) — Traffic, Jump to a date, Day details ⓘ, the document viewer | NOT SAID: the press on the picker closes them before any row is pressed, so the guard is never met (Q2) | NOT SAID (Q2) | NOT SAID (Q2) | GOES |
| S11 Shaded schedule windows and question cards — Insights, Duty templates, Flying waves, Day templates, the Plans (drafts) manager, the OIL question put before a change, the medical-move question, any app question card | N/R (the shade) — the walk confirms each, D and P | N/R | N/R | N/R by mouse; by Tab NOT SAID (Q38) |
| S12 The Scheduler Board open (it lies over the top bar; it has its own bell, Undo and Redo); its cancel-reason box with a typed reason; Sort all | N/R from the board's bar (no picker there); the ☰ menu — the walk says whether it can be opened over the board | N/R / as the ☰ | The board's own bell is live: NOT SAID whether the board, or its cancel-reason box, is "a window" (Q3) | the ☰ Logout if reachable: GOES |
| S13 A drop-down or a list that closes by a press elsewhere — Templates menu, Plans menu, the Tracker's File menu, the bell's list, the Schedules list itself, the ☰ menu | GOES; the menu closes as today (the host's reading) | GOES | GOES (the bell's list is where the line is) | GOES |
| S14 Tracker windows — the marking window, an event's ⓘ, Show All, the flex settings, + Add (a student); Export, Legend, + Add question (shaded) | Marking window, ⓘ, Show All, flex: REFUSED-W; Export, Legend, + Add question: N/R (the shade) | the same | the same | GOES after ASKED-T where chart edits are unsaved |
| S15 Tracker "Edit chart layout" open, no edit made; Reorder | NOT SAID (Q5) — today a pick closes the toolbar, the view switch leaves it | NOT SAID (Q5) | NOT SAID (Q5) | GOES |
| S16 Unsaved Tracker chart edits, no window | ASKED-T "…before switching to 149?" (D2403, D2318, D2637 — a View-only squadron too) | ASKED-T "…before switching to the member view?" (D2403; drawing p5) — back: words NOT SAID (Q34) | ASKED-T, then the line opens after Save or Discard, nothing after Stay (as today) | ASKED-T "…before logging out?" (as today, D129) |
| S17 Admin → Users, an opened row with typing in it | REFUSED-R "Blocked: close the open row, then pick 149." (D2595) | REFUSED-R, ending as the door's (D2595) | NOT SAID by D2595 (it names the pick and the view switch only) — D2403's "same rule" suggests REFUSED-R (Q19) | ASKED (the host's reading; words NOT SAID — Q16) |
| S18 Admin → Users, other unsaved work — a changed Role or None · View · Plan with nothing typed; the Waiting list's "Give access" form; "+ Add person" with a callsign typed; an archived man's row; "+ New squadron" | NOT SAID (Q18) — today all lost silently | NOT SAID (Q18) | NOT SAID (Q18) | NOT SAID (Q18) |
| S19 A text box that is not a window, with typing — a day's note on Edit Schedule, Logic's search, Quals' filter, Help's bug-report box, a figure box on the Leave War's Balances, the Tracker's "Find event…" | GOES; the words stay where typed (the host's reading; press report C). P WebKit with the caret still in the box: NOT SAID (Q21) | GOES | GOES | GOES |
| S20 "Not saved" band up (Retry) | REFUSED-S (D2594) | REFUSED-S | REFUSED-S | ASKED "This change isn't saved. Log out and lose it?" (D2594, a draft) |
| S21 "Not kept" band up | GOES — it never blocks (D2594) | GOES | GOES | GOES |
| S22 "Saving…" — a save still going | NOT SAID (Q10); today GOES and the save lands in its own record | NOT SAID (Q10) | NOT SAID (Q10) | as today: the sign-out waits for the saves, then reloads |
| S23 A drag in progress (a puck, a row, a calendar chip, a float window by its handle, a Tracker ball) | by a mouse N/R (one pointer); by touch (a second finger) or the keys NOT SAID (Q41) | the same | the same | the same |
| S24 The Tracker's question already up | N/R by mouse (its shade — press report F); by the keys N/R once [MSQ-NIGHT-153-OPEN] A1 is in (the question takes the keys) | N/R | N/R | N/R by mouse; by keys: the question is answered first (as today, `core.js`) |
| S25 The refresh card up | N/R — only Refresh acts | N/R | N/R | N/R |
| S26 The grey note still showing from a refusal | a second pick: REFUSED again, one note, not two (my reading) | REFUSED, the note moves under the badge with the badge's words (my reading) | the same | GOES / ASKED as its state says |
| S2 + S16 — a window open AND unsaved chart edits | REFUSED-W first, nothing asked, the chart edits untouched (my reading of D2403 — Q35) | the same | the same | ASKED-W, then ASKED-T (D2592) |
| S2 + S20 — a window open AND "Not saved" | REFUSED-W first (the host's reading), then after the window is closed REFUSED-S | the same | the same | NOT SAID: the order of three questions (Q14) |
| S16 + S20 — chart edits AND "Not saved" | REFUSED-S first, nothing asked (my reading — Q35) | the same | the same | NOT SAID (Q14) |
| S17 + S20 | REFUSED-R first (my reading, as a window) | the same | the same | NOT SAID (Q14) |
| Modes that are not windows — OIL Earn on a day, an armed slot, "Discard N edits & load — confirm" armed, a published version in preview, Logic's edit mode, Edit quals | GOES; each is cleared by the change of week or page as today (code: a pick reloads the week, which clears them) — RECORD each (Q40) | GOES (Logic's edit mode and an armed slot are switched off, as today) | GOES | GOES |

### 1b. The doors that are not his press, and the rest

| Door | What the rulings give | Not said |
|---|---|---|
| His own move landing at midnight (page open; or the page hidden and shown again on the new day) | The refresh card "You are 149's from today" / "Your move to 149 took effect at midnight. Refresh and sign in again to carry on. Anything you hadn't saved is lost." over EVERY state above — no greyed window, no band, no Tracker hold (D2405, D2591; p6) | With nothing open and nothing unsaved: still the card? (Q27). Opened days later: "from today"? (Q26) |
| A right taken away — a Plan or View removed, made a member, the master admin switch off | The refresh card "Your access has changed" / "An admin changed what you can do here. …" (D2405, D2591) | No press in this build raises it: another tab is not noticed until a reload (the questions page). How it is walked: Q30. A posting out or an archive landing at midnight: which words? (Q26) |
| The Tracker failing part-way through a switch | The refresh card "The switch to 149 didn't finish" / "The Tracker stopped part-way. Refresh and sign in again. …", and the panel's "Reload to try again" gone behind it (D2405, D2591; p8) | What he can do afterwards if 149's Tracker fails every time (Q31) |
| A reload (the browser's own, or the card's Refresh) | Sign-in screen; after sign-in his home squadron, the admin view, an empty Undo list (as today, D2405's row; D148) | With "Not saved" waiting (Q28) |
| The next person's sign-in on a shared computer | Nothing of the last person: no window, no note, no card, his own home squadron, the admin view for an admin, an empty Undo list; a sign-in pressed while the last person's save waits is held, "Saved. Press Sign in again." after it lands (D2322, D2205, D148) | After D2594's "Log out and lose it?" answered yes — is there still a save to wait for? (Q13) |
| One of his own pages opened while a squadron he only views is in view (a bell line of his own squadron, the bell's own OIL tap) — today his own squadron comes back into view by itself (`state/store.ts` landOnOfferedPage) | By D2403's words a bell line that would take him to another squadron follows the guard | Whether this landing counts (Q37) |
| An Undo or Redo whose step lands him elsewhere | Undo and Redo reach only the squadron in view (D2593), so none brings another squadron in | A step that belongs to no squadron or to two; Undo of "+ New squadron" with that squadron in view (Q32, Q33) |
| A link | None found: the app has no addresses per squadron or page (code search: no hash or history routing) | — |


---

## 2. The scenarios, ranked — most likely to find a fault first

How they are ranked: first the places a builder working from the named doors (the pick, the view switch, the bell's
line) is least likely to have reached — a door nobody listed, a window whose "open" is known only to its own page, an
order of two rules — then the rulings' main cases, then what must stay as today. "RECORD" means no ruling settles it:
the walker writes down exactly what the screen says and does, with a picture, and it goes to the owner as its question
in §4 — never judged pass or fail.

Common set-up, unless a scenario says otherwise: Saber signed in, 142 in view, the admin view.
"Hunter with Plan" = Saber first opens Hunter's row on Admin → Users, sets "149" to Plan, Save; then Hunter signs in.
"Ranger with View" = the same with View on Ranger's row.
"A failed save" = the press report's stand-in (the browser's storage made to refuse every write just before the Save,
lifted before Retry) — name it in the evidence.

### 1. The bell's own tap opens a 142 input while the bar says 149 — [MSQ-NIGHT-153-OPEN] (1), the door nobody listed
- **Who / device:** Hunter with Plan, D and P.
- **Set-up:** Hunter has a duty input of his own on a weekend (not a public holiday — for an admin a holiday's line
  takes the tap to the list instead) whose OIL question is unanswered, so the bell is lit for it; no access request and
  no bug report is waiting (either would take the bell's tap first). He picks 149 in the picker. The bar reads 149.
- **Steps:** (a) press the bell (the bell itself — this tap goes straight to his OIL question, no list). (b) In the
  window that opens, answer the OIL question; then change Remarks and press Save; then reopen and press Delete.
- **EXPECTED:** at no moment is a 142 input live under a bar reading 149 ([MSQ-NIGHT-153-OPEN] (1): "fixed at its root —
  the Input window records the input's own squadron"). By D2325 ("a bell tap moving him there") the bar reads 142 before
  the window can be used. Which of the two the build does — the squadron in view moved to 142 first, or the window
  refusing to act — RECORD (Q36).
- **Disproved by:** the bar reads 149 and Save, Delete or the OIL answer changes Hunter's 142 input (check on 142's
  Inputs list afterwards).

### 2. 142's OIL list left open, then 149 picked — the list is a window (D2403's row), and its rows open 142 inputs
- **Who / device:** Hunter with Plan (then Saber), D; P if the list leaves the picker or ☰ uncovered.
- **Set-up:** on 142, Inputs → the gear → Calendar → Add a holiday on a date where two people have duty inputs → Save, so
  the list opens by itself ("… is now a public holiday."). Or open it from the bell's holiday line.
- **Steps:** with the list open, (a) press the picker → the row "149". (b) Press the badge. (c) Close the list, pick 149,
  press the bell → the 142 holiday line.
- **EXPECTED:** (a) REFUSED: "Blocked: close the open window, then pick 149." under the picker; the list still open and
  working; the bar still 142 (D2403 row: "the OIL list counts as a window"; D2590). (b) "Blocked: close the open window,
  then switch to the member view." under the badge. (c) the bar goes to 142, then the list opens (D2325) — never 142's
  list over a bar reading 149.
- **Disproved by:** the pick goes through with the list still up; or a row of 142's list pressed on 149 opens a live
  142 input whose Save or OIL answer changes 142's record ([MSQ-NIGHT-153-OPEN] F1).

### 3. A window open AND unsaved Tracker chart edits — which rule speaks first
- **Who / device:** Saber, D.
- **Set-up:** Tracker → Edit chart layout → move one ball (the bar shows "✓ Save changes ●"); do not save. Go to Inputs,
  open Drifter's input, type in Remarks.
- **Steps:** (a) picker → "149". (b) the badge. (c) Close the window with Cancel; picker → "149" again.
- **EXPECTED:** (a) and (b) REFUSED with the window's note; the Tracker's question does NOT appear; back on the Tracker
  the moved ball and "✓ Save changes ●" are still there (D2403: refused while a window is open; the order is my reading —
  Q35). (c) now the Tracker's question, "…Save them before switching to 149?" (D2403, D2318).
- **Disproved by:** the question appears while the window is open; or, worst, he answers "Discard them", loses the
  chart edit, and is then refused for the window.

### 4. A bell line of the other squadron pressed with a window open — the line must still be there to "press again"
- **Who / device:** Hunter with Plan, on 149, D. His bell holds a 142 line ("OL · You were added · Saber" — the press
  report's bell set-up) shown unread (the blue dot).
- **Steps:** open an input on 149 and type in Remarks. Press the bell, then the 142 line.
- **EXPECTED:** "Blocked: close the open window, then press this line again." just under the bell's list (the note is
  wider than the list — drawing p4b); the list stays open; the bar still 149; the window live with the typed words; none
  of today's "This input has unsaved changes. Open Hunter's input and lose them?" card (D2590, D2403 row). The line is
  still in the list and still unread, so "this line" can be pressed again (my reading of the note's own words — Q8).
  Then: close the window, press the line → 142 entered, "Hunter · 8 Dec" opens (D2325).
- **Disproved by:** the line is marked read or gone after the refusal; the list closes so there is no line to press; the
  bar moves to 142 with the 149 window still open; the old greyed band "This is 149's. You picked 142 — close this to go
  on." appears.

### 5. The Tracker's marking window open at a pick and at the view switch — a window only the Tracker knows about
- **Who / device:** Saber, D and P.
- **Steps:** Tracker → press a student's event so its marking window opens; type a remark or pick a grade without
  closing. (a) picker → "149" (P: ☰ → "142 ▾" → "149"). (b) the badge (P: ☰ → "Switch to the member view"). Repeat with
  an event's ⓘ window, Show All and the gear's flex settings open instead.
- **EXPECTED:** REFUSED-W each time; the window still open with what was typed; the Tracker still 142's (D2403: "an
  Input, Leave War or other window"; today each closes silently — press report A).
- **Disproved by:** the window closes and 149's Tracker is drawn; or the window stays open over 149's chart (a mark
  written into the wrong squadron's course).

### 6. "Add a holiday" with a name typed, and "Every Monday" — windows inside a window
- **Who / device:** Saber, D and P.
- **Steps:** Inputs → the gear → Calendar → Add a holiday → type "N-TEST DAY" (do not save). Picker → "149". Then the
  badge. Then the same with "Every Monday" open, and with only Inputs settings or SANS settings open.
- **EXPECTED:** REFUSED-W each; the typed name still in its box (the host's reading: a title and ✕; today the name is
  lost — press report A). After closing each window by its own ✕ the pick goes through.
- **Disproved by:** any of them closes at the pick or the switch; the name is gone; or the pick stays refused after
  the last window has closed (a window counted that is no longer there).

### 7. A refusal must not go stale: close the window while the note is up, then pick
- **Who / device:** Saber, D and P.
- **Steps:** Input window open → picker → "149" (note appears) → at once press the window's Cancel → at once picker →
  "149".
- **EXPECTED:** the second pick goes through; the bar reads 149; no "Blocked:" note is left on screen over 149's page
  (D2590: "it passes in a few seconds"; a note about a refusal that no longer holds is my reading of "nothing else
  changes").
- **Disproved by:** the note from the first press still hangs under the picker on 149; or the second pick is refused
  though nothing is open.

### 8. "Not saved" — the pick, the view switch and the bell line all refused, and never in the band's words
- **Who / device:** Hunter with Plan, on 142, D and P.
- **Steps:** make a failed save of an input (band: "Not saved — keep this page open", Retry). (a) picker → "149". (b)
  the badge. (c) the bell → a 149 line. (d) lift the stand-in, press Retry (band clears), repeat (a).
- **EXPECTED:** (a)–(c) REFUSED with the grey note asking for Retry first, its words never containing "Not saved"
  (D2594, D1667); the band and Retry stay; the bar stays 142. RECORD the note's exact words for each door (drafts — Q11).
  (d) the pick goes through; no band on 149.
- **Disproved by:** any of the three goes through with the band up; the band or Retry is drawn on 149; the note says
  "Not saved"; after Retry lands the pick is still refused.

### 9. A save still going when the pick is pressed, which then fails
- **Who / device:** Saber, D.
- **Steps:** install the storage stand-in so the next write fails; change an input and press Save; while the bar still
  says "Saving…" press picker → "149" at once.
- **EXPECTED:** RECORD (Q10) — no ruling covers "Saving…". What must not happen is plain from D2594's reason: a "Not
  saved" band and Retry for a 142 change must never stand on 149.
- **Disproved by (as a fault to report, not a ruling broken):** the pick goes through, then "Not saved — keep this page
  open" comes up under a bar reading 149, and Retry there writes 142's input.

### 10. Logout with an Input window with typed words AND unsaved chart edits — one question at a time, every path
- **Who / device:** Saber, D.
- **Set-up:** as scenario 3 (a moved ball unsaved; an input open with typed Remarks).
- **Steps and EXPECTED (D2592, D1622):** press Logout →
  first only "This input has unsaved changes. Close it and lose them?" (Discard and close / Keep editing); the Tracker's
  question is not on screen and nothing is drawn over the card.
  - Path A: "Keep editing" → still signed in, the window and its words there, no second question.
  - Path B: "Discard and close" → the window gone → now "…Save them before logging out?"; nothing stands over its
    buttons. "Stay" → still signed in, the chart edit kept (the window's words are gone — RECORD that this is so, Q15).
  - Path C: B then "Discard them" → signed out, the sign-in screen after the reload.
  - Path D: B then "Save them" → signed out; sign in again: the chart edit is saved.
- **Disproved by:** the window drawn over the Tracker's question (today's fault, press report E4); both questions on
  screen at once; a press landing on the window under a question; signed out while a question was still unanswered.

### 11. Logout on a phone with a window open — it must be reachable (D2592)
- **Who / device:** Ranger (a member) and Saber, P; also PL and T.
- **Steps:** open an input from Inputs and type in Remarks (the window covers the ☰ and the picker — press report A).
  Look for Logout without closing the window. Then the same with Leave War → My leave open.
- **EXPECTED:** Logout can be pressed with the window open (D2592: "on a phone Logout can be reached with a window
  open"); it then asks the window's question first. HOW it is reached is not drawn or ruled — RECORD what the build
  offers and picture it (Q17; D1625 says something new on screen is drawn for him first).
- **Disproved by:** no way to Logout until the window is closed; or the way offered also lets a pick or the view switch
  through with the window open.

### 12. Undo on 149 must not take back a 142 input change; the step waits on 142
- **Who / device:** Saber, D and P.
- **Steps:** on 142 change Drifter's OL input (Remarks) and Save. Picker → "149". Look at Undo; hover or long-press it;
  press it. Press Ctrl+Z with the page focused. Open the Scheduler Board on 149 and look at its Undo. Picker → "142";
  press Undo.
- **EXPECTED:** on 149, having changed nothing there, Undo is greyed and says why — the draft "Your 142 changes are on
  142's Undo." (D2593; RECORD the built words). Ctrl+Z and the board's Undo do nothing to 142. Back on 142, Undo reads
  "Undo — Drifter's OL" and takes the change back, toast "Undid: Drifter's OL" (D2593: "there again when that squadron
  is picked"; D148).
- **Disproved by:** on 149 Undo reads "Undo — Drifter's OL" and works (today's fault, press report F); Ctrl+Z undoes it
  though the button is grey; back on 142 the step is gone.

### 13. Redo, and a new change on the other squadron
- **Who / device:** Saber, D.
- **Steps:** on 142 change an input, Undo it (Redo now offers it). Picker → "149". Look at Redo. On 149 change something
  (a day's note on Edit Schedule). Undo it on 149. Picker → "142". Look at Undo and Redo.
- **EXPECTED:** on 149 Redo does not offer or redo 142's step (D2593 "Undo and Redo reach only the squadron in view").
  Its greyed reason: the host's reading is that it follows Undo's — RECORD the words. On 149, Undo takes back only the
  149 note. Back on 142: whether Redo still offers the 142 step after a change was made on 149 — RECORD (Q32).
- **Disproved by:** Redo on 149 redoes 142's change; Undo on 149 reaches past the 149 note into 142's step.

### 14. A change of someone's access belongs to the squadron it was made on
- **Who / device:** Saber, D.
- **Steps:** on 142, Admin → Users → Hunter's row → 149: Plan → Save. Picker → "149". Look at Undo. On 149, Admin →
  Users → Kestrel's row → change Role → Save. Undo on 149. Picker → "142". Undo.
- **EXPECTED:** on 149 the grant made on 142 is not offered (D2593: "a change of someone's access belongs to the
  squadron it was made on"); the 149 change is, and its Undo names it in the bell's words (D2402). On 142: "Undid: Plan
  of 149 given · Hunter" (D2326).
- **Disproved by:** on 149 Undo reads or takes back "Plan of 149 given · Hunter".

### 15. The Tracker's own Undo after a pick (D2593's row: "not yet pressed; it is in the build's walk")
- **Who / device:** Saber, D.
- **Steps:** on 142's Tracker mark an event done for a student (the Tracker's Undo lights). Picker → "149" (nothing is
  asked: a mark is saved at once). On 149's Tracker look at Undo, press Ctrl+Z. Mark something on 149. Undo it. Picker →
  "142" → Tracker → Undo.
- **EXPECTED:** on 149 the Tracker's Undo is greyed ("Nothing to undo") until a 149 change is made; it never takes back
  142's mark; back on 142 the 142 mark is offered again (D2593).
- **Disproved by:** Undo on 149's Tracker changes 142's record, or changes 149's chart with 142's step; back on 142 the
  step is lost.

### 16. Admin → Users: an opened row with typing — every door
- **Who / device:** Saber, D and P (both pickers on P).
- **Steps:** Admin → Users → open Hunter's row → type in the sign-in box (do not Save). (a) picker → "149". (b) the
  badge. (c) the bell → a line of 149 (Saber switches 149 on in his bell's "Show" first). (d) Logout.
- **EXPECTED:** (a) "Blocked: close the open row, then pick 149." (D2595, a draft — RECORD the built words); the row
  still open, the typed words in the box, the bar 142. (b) REFUSED-R with the view switch's ending (D2595). (c) RECORD
  (Q19). (d) asked, never refused (the host's reading of D2592) — RECORD the question's words (Q16).
- **Disproved by:** the row closes and the words are gone (today, press report C); the note says "window"; the switch to
  the member view lands on View-only Sched with the row's typing lost.

### 17. Admin → Users: unsaved work that is not typing, and the other forms
- **Who / device:** Saber, D.
- **Steps, each then picker → "149" and, afresh, the badge:** (a) open Hunter's row and change only "149" from None to
  Plan (no typing, no Save). (b) Type in the sign-in box, then delete what was typed (the box as it was). (c) Type a
  callsign in "+ Add person" at the list's foot. (d) Open a waiting request's "Give access" and change a field. (e) Open
  an archived man's row and change his callsign. (f) Admin → Squadrons → "+ New squadron", type a number.
- **EXPECTED:** RECORD each — D2595 says only "an opened row … with typing in it" (Q18). An opened row with nothing
  changed: GOES, the row closing as today.
- **Disproved by:** nothing can disprove a RECORD; a fault to report is any of these losing typed words with nothing
  said while (a typed row) is refused — the same loss the ruling was made to stop.

### 18. The own-page landing from a squadron he only views, with a window open
- **Who / device:** Ranger with View, D and P.
- **Set-up:** an admin changed one of Ranger's inputs, so his bell holds a 142 line. Ranger picks 149 (he is offered
  View-only Sched and Help only — D2381).
- **Steps:** on 149's View-only Sched open a day's changes from its count (the Changes window) and leave it open. Press
  the bell → his 142 line.
- **EXPECTED:** by D2403's row ("a bell line that would take him to another squadron follows the same rule") REFUSED-W
  "…then press this line again."; the bar stays 149 — if the Changes window counts as a window (Q4) and this landing
  counts as that door (Q37). RECORD. With nothing open: 142 comes back into view and his input's window opens (as today).
- **Disproved by:** the bar jumps to 142 with a window left over from 149; or his input's window opens live over 149's
  View-only Sched.

### 19. Midnight: his own move lands with an Input window open and words typed
- **Who / device:** Hunter (moved to 149 from tomorrow — the press report's stand-in: the move written as a home row,
  the page clock run from 23:58:30 to 00:00:30), D and P.
- **Steps:** open an input, type in Remarks, let midnight pass. Press Escape; press Tab several times and Enter; click
  the shade; press Ctrl+Z. Then press Refresh.
- **EXPECTED:** a shade over the whole app and one card in the middle: "You are 149's from today" / "Your move to 149
  took effect at midnight. Refresh and sign in again to carry on. Anything you hadn't saved is lost." — one button,
  Refresh (D2405, D2591; drawings p6-d, p6-p). No greyed window, no band "This change could not be saved.", no "You are
  149's from today. This can't be saved in 142's Leave War." (D2405: "the build removes" them). Nothing under the shade
  answers a key or a press; Escape does not close the card. Refresh reloads to the sign-in screen; after sign-in the bar
  reads 149, Hunter a member there.
- **Disproved by:** the old band under or instead of the card; the window's Save reachable by Tab under the shade and
  writing the input; Escape or a press on the shade closing the card; Refresh doing nothing.

### 20. Midnight: the same move with other things open — the card must come over each
- **Who / device:** Hunter (the same stand-in), D.
- **Steps, one run each, midnight passing with:** (a) Leave War → Place a bid open. (b) The Tracker with Edit chart
  layout open and a ball moved. (c) The Tracker's question up (Hunter with Plan, a pick of 149 pressed at 23:59 and not
  answered). (d) The Input window's "Close it and lose them?" card up. (e) The grey note showing (a refused pick at
  00:00:00). (f) The ☰ menu open (P). (g) "Not saved" band up. (h) Nothing open at all, on View-only Sched.
- **EXPECTED:** the same card over all of (a)–(g), on top of every window, question, menu and note, and nothing under
  it answering (D2405, D2591). In (b) no "…in 142's Tracker." band and no held Tracker (D2405's row: "the Tracker's hold
  at his own move goes the same way"). In (c) the unanswered question must not go on to enter 149 or open anything
  after the card. (h): the card too, by D2405's words — RECORD, it replaces today's quiet change (Q27).
- **Disproved by:** any window or question drawn above the card; a question's button still pressable; in (c) the pick
  completing behind the card.

### 21. Midnight for someone who is NOT moving — nothing may appear
- **Who / device:** Saber, D; and Ranger, P (WebKit).
- **Steps:** an Input window open with typed words; run the clock past midnight (no move of his own; make Hunter's move
  land at the same midnight). Then a second run with the page hidden at 23:58 and shown again at 00:05.
- **EXPECTED:** no card, no note; the window live, the words kept; the pick, the badge and Logout behave as the table
  says (D2405 is only for "his own move"; lesson 29 — the readings follow the new day without a reload).
- **Disproved by:** the refresh card for a man who did not move; the window closed or greyed.

### 22. The Tracker fails part-way through a switch
- **Who / device:** Saber, D (the stand-in: reads of 149's Tracker records throw — chat 162's, named in the press
  report).
- **Steps:** load the Tracker on 142; picker → "149". Then Refresh; sign in; picker → "149" again; open Edit Schedule
  on 149.
- **EXPECTED:** the card "The switch to 149 didn't finish" / "The Tracker stopped part-way. Refresh and sign in again.
  Anything you hadn't saved is lost." with Refresh (D2591; p8); behind it no "Reload to try again" line and no
  button-less panel left as the only thing on screen (the questions page: "goes once this is built"). After Refresh and
  sign-in: his home, 142. What a second pick of 149 does while its Tracker still fails — RECORD (Q31).
- **Disproved by:** today's panel with no button; a window held with "This is 142's. You picked 149…"; the bar reading
  149 with 142's Tracker under it.

### 23. A right taken away — what this build can and cannot show
- **Who / device:** Hunter with Plan on 149 in tab A; Saber in tab B of the same browser; D.
- **Steps:** in tab B Saber sets Hunter's 149 back to None, Save. In tab A: press nothing for a minute; then change a
  149 input and Save; then reload.
- **EXPECTED:** as today, by the questions page ("not noticed in this build until a reload"): tab A shows no card; a
  reload brings the sign-in screen. RECORD whether tab A's Save still writes on 149 (press report E2 — known, for the
  database step). The card "Your access has changed" / "An admin changed what you can do here. …" cannot be raised by a
  press here — say in the evidence how it was shown (Q30).
- **Disproved by:** nothing new here is promised; a fault to report is the card appearing for the wrong person (tab B's
  Saber).

### 24. Switching BACK to the admin view with a window opened in the member view
- **Who / device:** Saber, D; P by the ☰ role line.
- **Steps:** badge → member view. Inputs → "+ Input" (a new input for himself), type Remarks. Press the badge ("SABER · MEMBER").
  Then with Leave War → My leave open instead.
- **EXPECTED:** "Blocked: close the open window, then switch back to the admin view." under the badge (P: at the foot);
  still the member view; the window live (D2590).
- **Disproved by:** the view flips to admin with the window open; the note says "…switch to the member view."

### 25. The view switch with unsaved chart edits — asked both ways, and on his own squadron
- **Who / device:** Saber on 142 (his home), then Hunter with Plan on 149; D and P.
- **Steps:** Tracker → move a ball, unsaved. Press the badge. Try each answer in turn (Stay; Discard them; Save them).
  Then, in the member view, make another chart edit and press the badge again.
- **EXPECTED:** "You have unsaved chart edits on “2026”. Save them before switching to the member view?" — Stay / Discard
  them / Save them (D2403; drawing p5 shows it on Saber's own 142). Stay: admin view, the edit kept. Discard: member
  view, the chart as stored. Save: saved, then member view. Back: asked again — RECORD its last words (Q34). For Hunter
  on 149: after Save or Discard he is in the member view on 149's View-only Sched, and no page shows "This is 149's
  Tracker. Leave the member view to open it." (D2318's narrowing: "no longer held there by his own switch").
- **Disproved by:** nothing asked (today, press report B); the cover band appears; the edit silently kept behind a
  member view.

### 26. A drag in progress at a switch
- **Who / device:** Saber, P and T (touch), D (keys).
- **Steps:** (a) P/T, Edit Schedule: hold a puck with one finger so it lifts; with a second finger open ☰ → "142 ▾" →
  "149". (b) D: start dragging the Input window by its handle (the dots beside its title); while holding, press Tab to
  the picker and Enter, arrow to "149", Enter. (c) Tracker, Edit chart layout: hold a ball mid-drag, second finger on the
  picker. (d) Inputs calendar: hold a chip mid-drag, the same.
- **EXPECTED:** RECORD each (Q41). No ruling names a drag. What must hold from D2403 ("nothing is left held behind a
  switch"): after whatever happens, no puck, chip or ball is left hanging, and nothing dragged on 142 is dropped into
  149's day.
- **Disproved by (a fault to report):** the drop lands in 149's schedule or chart; a lifted puck stays stuck on screen
  after the pick.

### 27. The phone's caret left in a schedule text box at a pick (WebKit moves no focus on a tap)
- **Who / device:** Saber, P in WebKit; then D.
- **Steps:** Edit Schedule → tap a day's note, type "N-NOTE" — do not tap away. ☰ → "142 ▾" → "149". Look at 149's same
  day's note; tap elsewhere; go back to 142 and look at its note.
- **EXPECTED:** the words are in 142's note and nowhere in 149's (the host's reading: "its words stay where they were
  typed, as today"; press report C). No band or toast "This change could not be saved." (D2405 removes the held
  handling for a switch he made himself). If WebKit keeps the caret in the box across the pick — RECORD exactly what
  leaving the box then says (Q21).
- **Disproved by:** "N-NOTE" appears in 149's note; or the words vanish from both with nothing said.

### 28. The Scheduler Board's own bell
- **Who / device:** Hunter with Plan, on 142, D and P.
- **Steps:** Edit Schedule → open a day on the Scheduler Board. (a) press the board's bell → a 149 line. (b) Open a
  flight's cancel-reason box, type a reason, do not confirm; try the board's bell. (c) Try to open ☰ over the board.
- **EXPECTED:** RECORD (Q3) — no ruling says whether the board is "a window". (b): if the bell can be pressed over the
  typed reason, that is the case D2403 exists for — typed words under a switch.
- **Disproved by (a fault to report):** the bar moves to 149 with the board still showing 142's day; the typed reason
  lost with nothing said.

### 29. The windows that leave the bar free (Traffic, Jump to a date, Day details ⓘ, the document viewer)
- **Who / device:** Saber, D and P.
- **Steps:** open each in turn; press the picker; if its list opens, press "149". Then the document viewer opened from
  inside an Input window with typed words (the paperclip): press the picker.
- **EXPECTED:** RECORD (Q2). By D1645 a press on any bar control but Undo and Redo closes these first, so the pick may
  find nothing open and go through as today. The document viewer over an Input window: the window under it is still
  open, so the pick is REFUSED-W (D2403) and the typed words stay.
- **Disproved by:** the viewer case: the pick goes through and the Input window's words are lost.

### 30. SANS day, and Leave War "My leave" — the main cases as drawn
- **Who / device:** Saber, D; P for My leave (drawing p3-p).
- **Steps:** Inputs → SANS → open a day → picker → "149"; badge. Leave War → My leave → picker (P: ☰ → "142 ▾" → "149");
  badge (P: ☰ role line).
- **EXPECTED:** REFUSED-W each. SANS day: still open, still 142's figures (the questions page). My leave on P: the note
  across the foot, "Blocked: close the open window, then pick 149.", the ☰ menu no longer over the page, the window in
  sight (drawing p3-p). Compare each picture beside its drawing (lesson 8).
- **Disproved by:** SANS day redrawn with 149's figures under the same date (today); My leave greyed with a band; the
  note hidden behind the ☰ menu.

### 31. Logout while a change is not saved, and the next person at the same computer
- **Who / device:** Hunter, then Kestrel, D.
- **Steps:** a failed save on 142 (band up). Press Logout. Answer each way in two runs. After logging out, leave the
  stand-in on; Kestrel types her name and presses Sign in; lift the stand-in.
- **EXPECTED:** Logout is not refused: it asks "This change isn't saved. Log out and lose it?" (D2594, a draft — RECORD
  the built words and button names). Staying: still signed in, the band and Retry there. Going: signed out. What then
  becomes of the waiting save — thrown away, or still tried with Kestrel's sign-in held ("Signing in…", then "Saved.
  Press Sign in again.", D2322, D2205) — RECORD exactly (Q13): the question's "lose it" and the held sign-in cannot both
  be true.
- **Disproved by:** Logout refused with a passing note (set aside in D2592's row); Hunter's change saved under
  Kestrel's session; Kestrel signed in on a page still holding 142's world.

### 32. Sign-out and the next person — nothing of the last one is left
- **Who / device:** Hunter with Plan, then Ranger; D and P.
- **Steps:** Hunter: pick 149; switch to the member view; open the bell's list; make one change and leave Undo lit;
  press a refused pick so the grey note is up; Logout at once (answer any question to go). Ranger signs in.
- **EXPECTED:** Ranger sees 142 (his home), "RANGER · MEMBER", no window, no bell list, no ☰ menu open, no grey note, Undo
  greyed, his own bell (D148 "the list clears when they sign out"; D2322; as today — the sign-out reloads the page).
- **Disproved by:** the bar reading 149; a "Blocked:" note carried onto the sign-in screen or Ranger's first page; Undo
  offering Hunter's step.

### 33. Logout with windows that have no question of their own
- **Who / device:** Saber, D.
- **Steps, one run each, then Logout:** (a) Add a holiday with a name typed. (b) Leave War → My leave with a figure
  typed in "App bal" and not left. (c) The OIL list with answers chosen and not saved. (d) The Tracker's marking window
  with a remark typed. (e) An Input window with nothing typed. (f) The Changes window.
- **EXPECTED:** (e), (f): signs out at once, nothing asked (D1622: only typed words are asked about). (a)–(d): RECORD —
  D2592 says "the open window's own question", and these have none (Q16).
- **Disproved by:** Logout refused; Logout doing nothing at all with one of these open; a question from one window
  drawn under another window.

### 34. The note's place on a desktop — under the control pressed, never over the window's ✕
- **Who / device:** Saber, D at 1536 × 864; again in a browser started at 125 % scaling (his PC's); again at 2560 wide;
  again at about 1366 wide, where the bar is two lines tall; again at 1100 wide, where the page names fold into ☰.
- **Steps:** open an input; drag the window by its handle up and left until its ✕ sits just under the picker; picker →
  "149". Drag it under the badge; press the badge. At 1100 wide: ☰ → "142 ▾" → "149".
- **EXPECTED:** the note hangs just under the control pressed (D2590; drawings p1b, p2b); it may cover the Inputs tabs
  or the window's top edge but never the window's ✕ ("covering what lies under it meanwhile, never the window's ✕"); it
  is wholly on screen; it goes by itself in a few seconds. At 1100 with the pick made in the ☰ menu — RECORD where the
  note is drawn (Q25).
- **Disproved by:** the ✕ covered or unpressable while the note is up; the note cut off at the screen's edge; the note
  still there after ten seconds; a press on the ✕ landing on the note.

### 35. The note's look — the ruled grey note, compared with the drawings
- **Who / device:** D and P, any refused pick, the badge and a bell line.
- **Steps:** picture each note within a second of the press, beside p1b, p2b, p4b and p3-p.
- **EXPECTED:** the app's plain grey note, a red "no entry" sign, "Blocked:" in bold white, the rest quieter (D1668,
  D1667); the words exactly "Blocked: close the open window, then pick 149." / "…then switch to the member view." /
  "…then press this line again." (D2590); the number is the squadron picked, not the one in view; not a red box; no
  glow.
- **Disproved by:** "Refused", "Not saved" or the window's name in the note; a red box; the wrong squadron's number (a
  third squadron picked reads "149").

### 36. Pressing again while the note is up; two doors in turn
- **Who / device:** Saber, D.
- **Steps:** Input window open. Picker → "149"; at once picker → "149" again; at once the badge; at once the bell → a
  149 line. Then one more refused pick, and at once hide the page (another browser tab) for ten seconds and come back.
- **EXPECTED:** one note at a time: each press replaces the last note with its own words under its own control (my
  reading of D2590 — one passing note); nothing queues to replay later; the window never loses focus of what was typed;
  after the page was hidden and shown again the note is gone, not shown afresh (lesson 10).
- **Disproved by:** two or three notes stacked; the first door's note replayed seconds later; the typed words or the
  caret's place in the window changed by the presses.

### 37. The picker by the keyboard, and Escape with the list open over an Input window — [MSQ-NIGHT-153-OPEN] C2
- **Who / device:** Saber, D.
- **Steps:** Input window open with typed words. Tab to the picker; Arrow Down (the list opens); Escape. Open it again;
  arrow to "149"; Enter.
- **EXPECTED:** Escape closes the list only — the Input window stays and its "Close it and lose them?" card does not
  appear ([MSQ-NIGHT-153-OPEN] (4) C2, built, not yet walked). Enter on "149": REFUSED-W, the note under the picker;
  the keys go back to the picker's button; whether a screen reader is told — RECORD (Q38).
- **Disproved by:** Escape reaches the window (its question pops, or it closes); Enter picks 149 though the mouse is
  refused.

### 38. The Tracker's question takes the keys — [MSQ-NIGHT-153-OPEN] A1
- **Who / device:** Saber, D.
- **Steps:** unsaved chart edit; picker → "149" so the question is up. Without the mouse: Tab eight times, Shift+Tab,
  Enter, Escape; try Ctrl+Z.
- **EXPECTED:** the keys are inside the question from the moment it shows; Tab never reaches the picker, the badge, the
  bell or Logout behind it; Escape is "Stay"; Ctrl+Z does not undo a chart step under the question ([MSQ-NIGHT-153-OPEN]
  (4) A1, built, not yet walked; press report F for the mouse).
- **Disproved by:** Tab lands on Logout or the badge and Enter there acts; a second question or a refusal note opened
  from the keys while the first is up.

### 39. A bell line that waited for the Tracker's question is judged again when it goes on — [MSQ-NIGHT-153-OPEN] F3
- **Who / device:** Hunter with Plan, on 142 with an unsaved chart edit, D.
- **Steps:** press the bell → a 149 line: the question is up. While it is up, his right to 149 ends (the only ways in
  this build: the clock stand-in run past the midnight of a move, or the test's own stand-in — say which was used).
  Press "Discard them".
- **EXPECTED:** nothing of 149 opens ([MSQ-NIGHT-153-OPEN] (2), built: "a line that has left his bell opens nothing");
  and by D2405 the refresh card stands over the app, since his rights changed without his press.
- **Disproved by:** 149's input opens for a man with no right left there.

### 40. A window that opens after the guard has looked
- **Who / device:** Saber, D.
- **Steps:** (a) Inputs → gear → Calendar → Add a holiday on a date with duty inputs → press Save and, in the same
  breath, picker → "149" (the OIL list opens by itself a moment after the save). (b) Press the bell's own OIL tap and at
  once the picker → "149" (the Input window opens a moment later). (c) With an unsaved chart edit: bell → a 149 line →
  the question → "Save them" (the line then opens an Input window on 149) → at once the badge.
- **EXPECTED:** never a window of one squadron open over the other: either the pick is refused, or it goes through and
  the window does not then open over 149 (D2403: "nothing is left held behind a switch he made himself"). In (c) the
  badge is REFUSED-W once the window is up.
- **Disproved by:** 149 in the bar with 142's "… is now a public holiday." list or 142's input open under it.

### 41. Two switches at once
- **Who / device:** Saber, D and P.
- **Steps:** (a) picker → "149" then at once → "142", five times fast, on the Tracker page and on Edit Schedule. (b)
  picker → "149" and at once the badge. (c) the badge twice fast. (d) Unsaved chart edit: picker → "149" (question up),
  answer "Save them" and press the picker again while the save is going.
- **EXPECTED:** each run ends in a state the bar tells truthfully: the number in the bar, the tick in the Schedules
  list, the page's own squadron (its Inputs list, Leave War, Tracker) and the badge all agree (press report F: "ends on
  142 with the chart drawn and nothing asked" — as today).
- **Disproved by:** the bar reading one squadron and the Tracker, the Leave War or the Inputs list showing the other;
  the member view on with the badge reading ADMIN.

### 42. Hunter's member view on the squadron he plans
- **Who / device:** Hunter with Plan, 149 picked, D and P.
- **Steps:** nothing open. Press the badge. Look at the tabs. Open the Schedules list. Press the bell → one of his own
  142 lines. Press the badge again (back).
- **EXPECTED:** the member view: on 149 only View-only Sched and Help (D2253, D2381); no band, no held window, no "This
  is 149's Tracker. Leave the member view to open it." (D2403/D2405: nothing is left held). The 142 line brings 142 into
  view and opens it (D2325). Back to the admin view: every page again.
- **Disproved by:** Edit Schedule or Admin of 149 reachable in the member view; the Leave War showing 142's war under a
  bar reading 149.

### 43. A member with View — his whole round
- **Who / device:** Ranger with View, D and P.
- **Steps:** on 142 open his own input, type Remarks; picker → "149". Close it; pick 149. On 149: look at the tabs; open
  a day's ⓘ; pick 142 with it open. On 142 again: Leave War → My leave open → pick 149.
- **EXPECTED:** refused with a window open, as for an admin (D2403 names no role); he has no switch to a member view (the
  badge is a plain label); on 149 only View-only Sched and Help (D2381); every pick with nothing open goes through.
- **Disproved by:** his input window left open or greyed over 149; Inputs, Leave War or Tracker tabs offered on 149.

### 44. Typing on Help's bug-report box, the Inputs calendar's "+ Note", and the Balances figure box
- **Who / device:** Ranger with View (Help is offered on both squadrons), Saber for the other two; D and P.
- **Steps:** (a) Help → type a bug report, do not send; picker → "149"; look at the box; pick 142; look again. (b) Inputs
  → Calendar → a day → "+ Note", type, do not save; picker → "149". (c) Leave War → Balances → type a figure in a
  person's box, do not leave it; picker → "149".
- **EXPECTED:** RECORD each (Q20). The host's reading for a box that is not a window is "not refused: its words stay
  where they were typed". (b)'s day pop-up and (c)'s box were not pressed in the press report.
- **Disproved by (a fault to report):** typed words written into the other squadron's record; a figure typed for a 142
  person saved under 149's war.

### 45. After a refusal the window is truly as it was
- **Who / device:** Saber, D and P.
- **Steps:** open Drifter's input; type Remarks; change the date; picker → "149" (refused); badge (refused). Then press
  Save in the window. Then open the input again and look.
- **EXPECTED:** every control in the window still works; nothing greyed; the typed words and the date are saved into
  142's input (D2590: "the window stays live with his typing, the squadron as it was"); Undo offers that save.
- **Disproved by:** any control dead or greyed after the refusals; Save refused with "This change could not be saved.";
  the keys no longer inside the window.

### 46. The same refusal from every page an Input window opens on (lesson 12)
- **Who / device:** Saber, D.
- **Steps:** open an input from: the Inputs list; the Inputs calendar's chip; an input's row on Edit Schedule; the
  Scheduler Board; the Medical view; a bell line of his own squadron. On each: picker → "149"; then ✕; then the pick.
- **EXPECTED:** REFUSED-W on each, the note under the picker; after ✕ the pick goes through and the page under the
  window is as it was left.
- **Disproved by:** one of the pages lets the pick through with the window open (a call site missed).

### 47. The phone on its side and the small tablet upright
- **Who / device:** Saber, PL (874 × 402) and T (768 × 1024).
- **Steps:** open an input with typed words. Is the picker, the ☰, the badge, the bell reachable? Press each that is.
  Then My leave. Then rotate the phone upright with the window open and press again.
- **EXPECTED:** wherever a door can be pressed with the window open: REFUSED-W, the window live, the words kept — never
  today's held window whose Close drops the words unasked (D2403's row: "on a small tablet upright no way back keeps
  them"). Where the note is drawn at each size (under the control, or at the foot) — RECORD (Q23).
- **Disproved by:** a greyed window with a band at any size; the note drawn off screen on a 402-high screen; the typed
  words lost by rotating.

### 48. The ☰ menu's two doors on a phone
- **Who / device:** Saber, P; My leave open (the ☰ is reachable — drawing p3-p).
- **Steps:** ☰ → "142 ▾" → "149". ☰ → "Switch to the member view". With nothing open but an unsaved chart edit: ☰ → "142
  ▾" → "149".
- **EXPECTED:** refused picks and switches: the note at the screen's foot, in sight — the menu not standing over it
  (drawing p3-p shows the page and the window with the menu closed; D2384 says the menu stays open after a pick that
  goes through — RECORD which the build does on a refusal, Q24). The chart-edit pick: the menu closes first, then the
  question (as today, D2637's row).
- **Disproved by:** the note drawn under the ☰ menu's panel or shade where it cannot be read; the menu's page list
  changing to 149's though the pick was refused.

### 49. Leave War windows whose bar looks free on a phone
- **Who / device:** Saber, P.
- **Steps:** Leave War → Place a bid; tap the picker, the ☰ and the bell. The same with the Leave War's Settings.
- **EXPECTED:** RECORD (Q22). Today the taps open nothing and nothing is said (press report A, "surprise 6").
- **Disproved by (a fault to report):** a tap now opens the Schedules list and a pick goes through under the open
  window.

### 50. The windows whose shade covers the doors — confirm each cannot be passed, mouse and keys
- **Who / device:** Saber, D and P.
- **Steps:** with each open — Insights; Duty templates; Flying waves; Day templates; the Plans manager; Leave War Open
  for bidding, Legend, OIL tracker, a day's window; Tracker Export, Legend, + Add question — click where the picker, the
  badge and the bell are; then press Tab until the keys leave the window, and Enter.
- **EXPECTED:** N/R by the mouse (press report A). By the keys: if Tab reaches the picker, the badge, the bell or
  Logout, the door is met after all and must answer as the table says for an open window — REFUSED-W (D2403), Logout
  asked or going (D2592).
- **Disproved by:** a pick or view switch made by the keys under a shaded window.

### 51. Unsaved chart edits — the question at a pick is exactly as today
- **Who / device:** Saber (pick 149), Hunter with View only of 149 (pick 149), D and P, both pickers.
- **Steps:** move a ball, unsaved; pick. Each answer in turn.
- **EXPECTED (must stay as today — press report B; D2318, D2637, D2395):** "You have unsaved chart edits on “2026”. Save
  them before switching to 149?" — Stay / Discard them / Save them; asked over the page he is on; Stay keeps 142 and the
  edit; Save then shows 149's Tracker (Saber) or 149's View-only Sched (the View holder); a refused Save says so and
  keeps him on 142.
- **Disproved by:** the grey note instead of the question; nothing asked for the View-only pick.

### 52. Menus and lists are not windows — they close as today
- **Who / device:** Saber, D and P.
- **Steps:** with each open — the Templates menu, the Plans menu, the Tracker's File menu, the bell's list, a Type or
  Person drop-down on a page — press the picker → "149", and afresh the badge.
- **EXPECTED:** the menu closes and the pick or switch goes through, as today (the host's reading; press report A).
- **Disproved by:** a refusal naming "the open window" when only a menu was open; a menu left hanging over 149's page.

### 53. "Not kept" never blocks; "Not saved" on the full-screen surfaces
- **Who / device:** Saber, D and P.
- **Steps:** (a) start the app in a browser that refuses its storage (band: "Not kept — this browser loses your work on
  a reload"); pick 149; badge; a bell line; Logout. (b) A failed save, then open the Scheduler Board (it carries the band
  under its own bar) and press the board's bell → a 149 line.
- **EXPECTED:** (a) all go through; the band stays (D2594: "the "Not kept" band never blocks anything"); Logout asks
  nothing about it. (b) REFUSED-S (D2594) — the note drawn where it can be seen over the board.
- **Disproved by:** (a) any refusal; (b) the line entering 149 with the board's "Not saved" band still up.

### 54. The save lands by itself while he is refused
- **Who / device:** Saber, D.
- **Steps:** a failed save (band up); picker → "149" (refused); lift the stand-in and wait without pressing Retry until
  the band clears by itself; picker → "149".
- **EXPECTED:** once the band is gone the pick goes through (D2594: refused "while a change is not saved").
- **Disproved by:** the pick still refused with no band on screen — nothing left for him to do.

### 55. The refresh card on a phone, and what Refresh does with a save waiting
- **Who / device:** Hunter (the midnight stand-in), P in WebKit; D for the second half.
- **Steps:** midnight with My leave open; picture the card beside p6-p; scroll, pinch, rotate; press Refresh. Second
  run on D with a "Not saved" band up at midnight: press Refresh.
- **EXPECTED:** the card in the middle, wholly on screen in both turns of the phone, its words as D2591; the page under
  it does not scroll. Refresh reloads. With a save waiting — RECORD whether the change is lost or saved (Q28); the
  card's words say unsaved work is lost.
- **Disproved by:** the card off screen or under the keyboard; Refresh held back with nothing said.

### 56. Undo's greyed words with steps on two other squadrons; steps that belong to none
- **Who / device:** Saber (a third squadron made by "+ New squadron", 150), D.
- **Steps:** change something on 142, then on 150; pick 149; read Undo's greyed words. Then on 149: Admin → Squadrons →
  "+ New squadron" 151; pick 142; read Undo. Pick 151; Undo the making of 151 while it is in view.
- **EXPECTED:** RECORD all three (Q32, Q33) — D2593's draft names one squadron ("Your 142 changes are on 142's Undo.")
  and says nothing of a step that makes a squadron.
- **Disproved by (a fault to report):** the bar left reading a squadron that no longer exists; Undo taking back the
  wrong squadron's step.

### 57. Modes that are not windows, at a pick
- **Who / device:** Saber, D.
- **Steps, each then picker → "149":** OIL Earn switched on for a day on Edit Schedule; a slot armed (tapped, waiting
  for a person); a published version open in preview with "Load onto working copy" armed ("Discard N edits & load —
  confirm"); Logic in its edit mode; Quals in "✎ Edit".
- **EXPECTED:** the pick goes through and each mode is off on 149 — no OIL Earn bar, no armed slot, no armed confirm
  (code as it stands: a pick reloads the week, which clears them; RECORD, Q40). Back on 142 nothing was changed by it.
- **Disproved by (a fault to report):** an armed slot or an armed "confirm" carried onto 149's day so the next tap
  writes there; OIL Earn shown on over 149's day.

### 58. The bell's access alert — the bell itself moving him
- **Who / device:** Saber (149 switched on in his bell's "Show"), on 142, D and P.
- **Set-up:** a new person asks for access to 149 (the sign-in card's "Request access"), so Saber's bell is lit.
- **Steps:** (a) nothing open: press the bell. (b) An Input window open with typed words: press the bell. (c) A failed
  save: press the bell.
- **EXPECTED:** (a) 149 entered, Admin → Users, toast "1 waiting for access to 149" (D2325, as today). (b), (c): by
  D2403's "same rule" the tap is refused — but "…then press this line again." does not fit a tap on the bell: RECORD the
  words (Q7).
- **Disproved by:** the bar moving to 149 with 142's window still open; the request marked seen though he was refused.

### What must be left exactly as today (each is a scenario above)
- The Tracker's question at a pick, its words, its three buttons, the ☰ menu closing first — 51.
- Menus and lists closing by a press elsewhere, never refused — 52.
- A pick with nothing open: instant, nothing asked; two picks back to back end where the bar says — 41, 43.
- Midnight for a man who is not moving: nothing — 21.
- Sign-out: every window closed, the page reloaded, the next person's own home and an empty Undo list — 32.
- "Not kept" blocks nothing — 53 (a).
- A text box that is not a window: its words where they were typed — 27, 44.
- A View-only squadron offers View-only Sched and Help alone — 43.

### The ten seeds — where each is covered
| Seed | Scenarios |
|---|---|
| 1 Unsaved typing that is not a window | 16, 17, 27, 44 |
| 2 A drag in progress | 26 |
| 3 A save still going, or failed | 8, 9, 31, 53, 54 |
| 4 A second switch during the first | 7, 36, 41 |
| 5 A window that opens after the guard has looked | 3, 39, 40 |
| 6 Undo and Redo of one squadron pressed on another | 12, 13, 14, 15, 56 |
| 7 The bell's lines of the other squadron | 1, 2, 4, 18, 28, 58 |
| 8 A change he did not make, with a window open | 19, 20, 21, 22, 23, 39 |
| 9 Sign-out and the next person | 10, 11, 31, 32, 33 |
| 10 The phone, where a window covers the control | 11, 30, 47, 48, 49, 55 |

---

## 3. The lessons of §7.11 — the scenario that covers each, or why it cannot apply

| Lesson | Covered by / why not |
|---|---|
| 1 A surface with more than one state: a table | §1's table; every cell that is not N/R has a scenario |
| 2 Drags and swipes at ordinary speed | 26 only — the build adds no drag; its four drags are pressed quick and slow |
| 3 After every press: what tells him, what is out of sight | 4 (the line still there), 7 (no stale note), 12 (the greyed Undo's reason), 34, 48 (the note not hidden by the ☰ menu) |
| 4 A window that leaves the page behind working: press the page behind | The whole job — 2, 5, 6, 30, 45, 46 |
| 5 A thing moved into sight, checked at its resting place against what can stand over it | The note's resting place: 34 (a window dragged under it), 48 (the ☰ menu), 53 (b) (over the board), 55 (the card) |
| 6 What only the real phone draws | The note at the foot above the home bar and with the keyboard up; the card under the keyboard — 47, 48, 55; named for his iPhone look |
| 7 Steered frame by frame against the phone's motion | Cannot apply: the note and the card are fixed in place, nothing follows a finger |
| 8 An approved drawing compared while built | 30 and 35 (p1b, p2b, p4b, p3-p), 25 (p5), 19 and 55 (p6-d, p6-p), 22 (p8); the drawing check script run on each |
| 9 Every list or table measured | No list or table is added; the bell's list and the Schedules list are pictured in 4 and 35 with the note beside them to show no row moved |
| 10 A page hidden and shown again | 21 (second run), 20, 55 — and 36: a refusal's note is gone, not replayed, when the page is shown again |
| 11 A reading that depends on how much fits | 34 at 1536, at 125 %, at 2560 and at 1100 wide |
| 12 Every page each window opens from | 46 |
| 13 A pinch part-way down a list | Cannot apply to the guard; 55 pinches under the card only to show the page does not move |
| 14 A keyboard walk's boxes found by searching the code | 37, 38, 50, 19 — the note and the card add no text box; the builder's search confirms |
| 15 Every bar over a scrolling area | The "Not saved" band with the note under the bar (8), the note at a phone's foot over a scrolled page (48), the card's shade (55) |
| 16 After a refusal at a box: tap away, tap afresh, type | 45 (the window used after two refusals), 7 |
| 17 Every control that shows, hides or resizes part of a page | The band adds a line to the bar: 8 pictures the note's place with the band up and after Retry |
| 18 A change that prints or downloads | Cannot apply: nothing printed or downloaded changes |
| 19 Every window over another closed by each of its own ways | 10 (two questions, each button), 37 (Escape with the list over a window), 29 (the viewer over an Input window), 20 (d) |
| 20 A gesture the ways a hand makes it | 26 only |
| 21 A test browser's touch is not his phone's | 11, 26, 27, 47, 48 each name what only his iPhone shows: the caret kept at a tap (27), the way to Logout (11), the note at the foot (48) |
| 22 What he is meant to see checked by what is drawn, first frames too | 35 (the note within a second), 19 (no flash of a greyed window or band before the card), 41 |
| 23 What the rulings say a tap on that entry opens | 1, 4, 18, 58 — each bell tap walked against D2325 and D769, not against the build |
| 23b The standing layout lessons on every pictured screen | 24 and 35 on a phone with an iPhone's letters: the longest note ("…then switch back to the admin view.") wraps inside its box; the card's button and words on one line each |
| 24 Anything placed against the top bar, flicked and resized | 34 with the page scrolled and the bar two lines tall (about 1366 wide), 47 (rotation), 48 with the page flicked to its foot; the bounce named for his iPhone |
| 25 The thing made in every place it can be put | 5 and 6 (each kind of window), 17 (each form), 46 (each page) |
| 26 A gesture measured by what the person sees | 26 — what was under the finger is where it was, or back in its place |
| 27 Every press that changes what stands beside a control | The picker, the tabs, the badge, Undo and Redo measured before and after the note shows and goes (34, 12): none moves |
| 28 On a phone, what a press opens proved before anything in it is pressed | 48, 11, 30 on a phone: the ☰ list pictured open before a row is tapped |
| 29 Anything that reads today: the clock past midnight | 19, 20, 21, 55 |
| 30 On a phone every tap pictured within about 100 ms | 30, 35, 48 |
| 31 A page fitted to the screen that scrolls inside itself | 55 (nothing scrolls under the card), 34 in a real window at 125 %; otherwise cannot apply |

---

## 4. Questions — where the rulings do not say; each with the choice I would recommend

Each begins with when it happens. None is written as a scenario with an invented result; the scenarios that RECORD them
are named.

1. **Which press is refused — opening the Schedules list, or the row in it?** A man with a window open presses "142 ▾".
   The note names the squadron ("then pick 149"), so I read: the list opens, the row's press is refused, the list
   closes. *Recommend that reading; the builder to say so.* (All pick scenarios.)
2. **Traffic, Jump to a date, Day details ⓘ, the document viewer.** They close by themselves at any press on the bar
   (D1645), so a pick never finds them open. *Recommend: leave as today — nothing can be typed in them — and say so on
   the evidence sheet; the viewer opened over an Input window is refused for the window under it.* (29)
3. **The Scheduler Board.** Its own bell works with the board open, and its cancel-reason box holds typing. Is the
   board "a window" for a bell line to another squadron? *Recommend: the board alone no (it closes, as today); with its
   cancel-reason box or Sort all up, yes — refused.* (28)
4. **Windows with nothing to lose** — Changes, ALL AVAIL, a Legend; and an Input window with one of its own questions
   already showing. *Recommend: one rule — anything with a title and ✕ refuses; under a question card the doors are
   treated as covered.* (18, 29, table S3, S9)
5. **The Tracker's "Edit chart layout" open with nothing moved, and Reorder.** Today a pick closes the toolbar and the
   view switch leaves it. *Recommend: not a window — as today.* (table S15)
6. **Which Tracker states the guard is told about.** The marking window, ⓘ, Show All and the flex settings are known
   only inside the Tracker. *Recommend: all four refuse (5); the builder lists them in the report.*
7. **The bell itself moving him** — the access alert and his own OIL question are taps on the bell, not on a line.
   "…then press this line again." does not fit. *Recommend: "…then press the bell again.", read by a fresh Fable
   (D2441).* (1, 58)
8. **A refused bell line: is it left unread, the list open?** *Recommend yes — the note tells him to press it again.*
   (4)
9. **A bell line of his own squadron pressed with an Input window open** (no squadron changes). Today: "This input has
   unsaved changes. Open Hunter's input and lose them?" *Recommend: unchanged — the guard is only for a change of
   squadron.*
10. **"Saving…" still going at a pick.** Rare today, common once the database is in. *Recommend: the pick waits for the
    save to land; if it fails, the "Not saved" refusal takes over — so a failed 142 save can never show on 149.* (9)
11. **The Retry-first note's words for each door** are not yet given. *Recommend: drafted by Opus, adjusted by a fresh
    Fable, drawn for him first (D1625), in the same three endings.* (8)
12. **Retry keeps failing.** He cannot leave 142 until a save lands or he refreshes (the cost told to him). Should the
    note say so? *Recommend: no — one short line; the band already says "keep this page open".*
13. **Logout while "Not saved", answered "log out".** Is the waiting save thrown away, or still tried with the next
    person's sign-in held as today (D2322, D2205)? The words "lose it" say the first. *Recommend: it is still tried and
    the next sign-in held, as today, and the question's words changed to match — losing a save he was told to keep the
    page open for is the worse result.* (31)
14. **The order of Logout's questions when three could be asked** (the window's, the unsaved change's, the Tracker's),
    and when one is already on screen. *Recommend: the window's, then the unsaved change's, then the Tracker's; a
    question already up is answered first and Logout pressed again.* (10, 31)
15. **Logout: "Discard and close", then "Stay" at the Tracker's question** — he stays signed in but the window's words
    are gone. *Recommend: accept; he chose Discard.* (10)
16. **Logout with a window that has no question of its own** — a holiday's name typed, a Leave War figure, the OIL list's
    answers, a Tracker remark, an opened Admin → Users row with typing. *Recommend: where typed words would be lost, one
    common question in the Input window's words ("… Close it and lose them?"); where nothing is typed, close and go.*
    (16, 33)
17. **How Logout is reached on a phone with a window open** (D2592 says it can be). Nothing is drawn. *Recommend: drawn
    for him first (D1625).* (11)
18. **How far D2595 reaches on Admin → Users.** A changed Role or None · View · Plan with nothing typed; typing put back
    as it was; "+ Add person"; the Waiting list's "Give access" form; an archived man's row; "+ New squadron".
    *Recommend: any unsaved change in any of them counts, as the row does.* (17)
19. **The row's note at the view switch and a bell line, and the word "close"** — the row has Cancel and Save, no Close
    or ✕. *Recommend: the same three endings; Fable to check "close the open row" against the row's own buttons.* (16)
20. **Text boxes that are not windows and were not pressed:** Help's bug-report box, the Inputs calendar's "+ Note", a
    Balances figure box. *Recommend: press each on today's build first; a figure box is saved or put back, never
    carried.* (44)
21. **A phone's caret left in a schedule text box at a pick.** Today the box remembers its squadron and says "This
    change could not be saved." *Recommend: the pick first lets the caret go, saving the words into 142's note as a
    desktop click does, then goes on.* (27)
22. **Leave War's Place a bid and Settings on a phone:** the bar looks free, a tap opens nothing, nothing is said.
    *Recommend: leave it and file it — the window has its own ✕ in sight.* (49)
23. **Which screens draw the note at the foot** — a small tablet upright (768 wide), a phone on its side (874 wide, 402
    high)? *Recommend: the foot wherever the app uses its phone layout (820 wide or less); under the control otherwise.*
    (47)
24. **The ☰ menu after a refused pick.** The drawing shows it closed; D2384 keeps it open after a pick that goes
    through. *Recommend: closed on a refusal, as drawn, so the note and the window are in sight.* (48)
25. **A desktop narrow enough to show ☰:** the pick is made inside the menu. *Recommend: the note at the foot whenever
    the door was in the ☰ menu.* (34)
26. **The refresh card's words in the cases the drawings do not show:** a posting out or an archive landing at
    midnight; a Plan ending by date; the app opened two days after the move ("from today", "at midnight").
    *Recommend: "Your access has changed" for the first two; "You are 149's now" where the move was not last night.*
27. **The card when nothing is open and nothing unsaved.** D2405's words say the app stops anyway. *Recommend: yes, as
    ruled — one behaviour — and say on his look that the quiet change at midnight is gone.* (20 h)
28. **Refresh with a save waiting.** *Recommend: Refresh tries the waiting save once before reloading.* (55)
29. **Under the card,** the drawing p6 still shows today's greyed window and its "This change could not be saved."
    band, dimmed. *Recommend: the window stays as it was, dimmed, with no band — the band is removed (D2405).* (19)
30. **"Your access has changed" cannot be raised by a press in this build.** *Recommend: shown by a test with a named
    stand-in, said plainly on the evidence sheet, and walked for real at the database step.* (23)
31. **149's Tracker fails at every pick.** After Refresh he is on 142; another pick of 149 brings the card again.
    *Recommend: the card only once the Tracker's page is opened on 149, so 149's other pages stay usable.* (22)
32. **Undo's edges:** the greyed words with steps waiting on two squadrons; Redo's greyed reason; whether a change on
    149 clears a Redo waiting on 142; a step that belongs to two squadrons or to none. *Recommend: "Your changes on
    142 and 150 are on their own Undo."; Redo's reason in the same form; a Redo is cleared only by a new change on its
    own squadron; a two-squadron step is offered on either.* (13, 56)
33. **Undo of "+ New squadron" while that squadron is in view.** *Recommend: refused there with a note to pick another
    squadron first.* (56)
34. **The Tracker's question at the switch back** — its last words — and whether it is asked on his own squadron, where
    the Tracker would not move. The drawing p5 asks on his own squadron. *Recommend: "…before switching back to the
    admin view?"; asked always, as drawn.* (25)
35. **A window open and unsaved chart edits; an unsaved change and unsaved chart edits.** *Recommend: the refusal
    first, nothing asked — so he never discards chart edits only to be refused.* (3)
36. **The bell's OIL tap for a 142 input while 149 is in view:** what he sees after the fix. *Recommend: 142 comes into
    view first (D2325), then the window — and with a window already open, refused, in the words of question 7.* (1)
37. **One of his own pages opened from a squadron he only views** brings his own squadron back by itself. Is that "a
    bell line that would take him to another squadron"? *Recommend: yes.* (18)
38. **The keyboard.** Tab can pass some shades the mouse cannot; is the note read out to a screen reader; where the
    keys rest after a refusal. *Recommend: a door reached by keys answers as by mouse; the note is announced; the keys
    stay on the control pressed.* (37, 50)
39. **Someone else's move at midnight while his input is open in an admin's window.** *Recommend: no card for the
    admin; the window stays; RECORD what its Save then does.* (21)
40. **Modes that are not windows** — OIL Earn on a day, an armed slot, an armed "Discard N edits & load — confirm".
    *Recommend: not windows; cleared by the pick, as today.* (57)
41. **A drag in progress** when a second finger or the keyboard presses a door. *Recommend: the drag is cancelled and
    put back, then the door answers as the table says.* (26)

---

## 5. Explicit negatives — looked for, found already covered

- **Links.** No page or squadron has an address of its own (no hash or history routing in `src`), so no link can bring
  another squadron in. The browser's Back does nothing to the squadron.
- **Sign-out closes every window and reloads.** One list of every window's flag is cleared at sign-in and sign-out, a
  test fails if a flag is left off it (`ui/pops.ts`), and the page reloads; the Undo list and the Tracker's own are
  cleared there (D148). Scenario 32 only confirms.
- **The mouse cannot pass a shaded window or the Tracker's question** (press report A, F) — 50 and 38 add the keys only.
- **Two picks back to back** end where the bar says, nothing asked (press report F).
- **A save started before a pick lands in its own record** (press report D) — records are not mixed; what is open is
  only what the screen says (9).
- **Undo is already kept apart for the schedule's days, settings and planning calendar** (their records carry the
  squadron); the gap is records that carry none — inputs, access, the Tracker — which is what 12, 14 and 15 press.
- **A pick already clears the week's own state** — ALL AVAIL, the Changes window, the board's day, an armed slot, OIL
  Earn (the week is loaded afresh) — so nothing of those is carried today; 57 confirms after the build.
- **The midnight clock is already heard** with the page open, and when a hidden page is shown or focused on a new day —
  no new trigger is needed for the card, only what is drawn.
- **A schedule text box already knows the squadron it was entered on** and never writes into another (27 checks the
  build does not lose that when the held handling goes).
- **The Tracker's question, its words and the ☰ menu closing first** are built and pinned by tests (51 confirms).
- **"Clear edit history…"** is an inline two-tap control, not a window (press report A).
- **Not raised, as told:** a scheduler who is not an admin (D785); any harm that lives only in data already stored
  (D56); the Tracker's drag and press handling beyond "a drag in progress at a switch".
- **Nothing here depends on another squadron's stored data being right:** every set-up is made through the app's own
  controls, or by a stand-in the press report already names.
