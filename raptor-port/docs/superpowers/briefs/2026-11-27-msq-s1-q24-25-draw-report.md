# Section 1 (the guard rail): the drawings for questions 24 and 25. The drawer's report (chat 204, 27 Nov 26)

Drawn to `2026-11-27-msq-s1-q24-25-draw-brief.md`, with the orchestrator's change to question 25 of 27 Nov: two answers,
for Saber (a master admin) and for Hunter (an admin who is not a master). No file under `raptor-port/src` changed.
Nothing is committed or pushed.

## How it ran

- **The first try was NOT RUN.** The checks lock was held by another chat's FULL walk for the full 40 minutes allowed
  (20:25–21:05 UTC). The orchestrator then said it was free, and the run went ahead.
- **The lock.** I took it at 21:11 UTC. The push-and-lock guard would not let a plain `npm run build` start while this copy
  held the lock (it reads it as another chat's), so the lock was released, the build run through `gatelock.mjs exec`
  (which takes and releases it itself), and the lock taken again at once. It was released after the last picture.
- **The build:** PASS, bundle `index-B5VdDUfK.js`.
- **The server:** `npx vite preview --port 4741`, checked free first, stopped by its port at the end.
- **The browser:** Chromium at 1536×864, 2×, Singapore time. Each case started a fresh browser.
- **Errors:** no console error, page error or failed request in any run.
- The `node_modules` link to the section's copy is removed again. The copy stays at commit `7d4965c72`.
- **Scripts** (in `raptor-port/scripts/handpass/n204/`): `q2425-lib.mjs`, `draw-q24.mjs` and `draw-q25.mjs` v2. **Logs:**
  `raptor-port/.tmp/n204-q24-25/log-q24.txt`, `log-q25.txt`.
- **Two first-run fixes:**
  - The demo already has a "Zulu", so Add answered "Zulu is already taken — callsigns must be unique". Saber's callsign is
    now **Bandit**.
  - The app's note code sits in a shared part of the build, not its main file. The probe now looks in every part.
- **Three squadrons in the picker:** 142, 149 and 150 (Saber makes 150, first admin Kestrel).
- **The teal dashed ring** marks only what the picture is about: the new question, the editor left open, a drawn band or
  note, the new man.

### How each state was reached

- **24, all real presses.**
  - **The world:** Saber makes 150, then Admin → Users → Hunter's row → Access to 149: Plan → Save. The saved data is
    copied into each fresh browser.
- **25.**
  - **The page clock** starts at 23:40 on Wed 15 Jul 2026 and is run forward to 00:00:05 on Thu 16 Jul. The app's own
    timers fire on the way, and the window's focus event is sent, as the tests do.
  - **No screen saves a move of squadron yet**, so each move is written into the browser's saved data before the
    sign-in, as the walk libraries do it: his old squadron from 1 Jan, the new one from 16 Jul. Everything else is a real
    press.
  - **The two drawings that are not built** are added in the page:
    - **25-1's note:** the app's own passing note, raised by its own note code with the draft words, so its look and place
      are the app's.
    - **25-2's band:** the Input window's band, its own markup read from the real held window in case (b), put across the
      top of the form, with Add made to do nothing while it stands.

## Pictures

All are in `raptor-port/docs/mock/2026-11-26-msq-questions/q24-25/`. Each has a whole-screen `.png` and a `-crop.png`,
except where only a crop is named.

### Question 24

| Picture | What it shows (seen) |
|---|---|
| `q24a-back` / `-crop` | Saber in the member view ("SABER · MEMBER"), Tracker, after a new test event and "Done editing chart": the question "You have unsaved chart edits on “2026”. Save them before switching back to the admin view?", with Stay, Discard them and Save them. It is ringed. The badge is at the top right and "✓ Save changes ●" shows. |
| `q24a-back-question-crop` | The same question alone, tight. |
| `q24a-to` / `-crop`, `q24a-to-question-crop` | The approved twin from the admin view: "…Save them before switching to the member view?". Same three buttons. Not ringed. |
| `q24b-saber-before` / `-crop` | Saber, admin view, 142, Tracker with "Edit chart layout" open: the tool strip (Move, Select … Fit, Reset layout, Edit events) and the lit pencil. Nothing is moved, and the top right shows "● saved". |
| `q24b-saber-after` / `-crop` | After the badge: "SABER · MEMBER", still the Tracker on 142, **the chart editor still open**, its strip ringed. No question was asked. |
| `q24b-hunter-before` / `-crop` | Hunter, admin view, 149 picked, Tracker with the editor open. |
| `q24b-hunter-after` / `-crop` | After the badge: "HUNTER · MEMBER". **The app lands him on 149's View-only Sched**, whose member view offers only View-only Sched and Help. The editor is closed, and no question was asked. |
| `q24b-saber-proposed` / `-crop` | Saber, after Edit chart layout, then "✓ Done editing chart", then the badge: the member view, the Tracker on 142, the editor closed (pencil not lit, no tool strip). This is the proposed look, drawn as the app draws a closed editor. |

### Question 25

| Picture | What it shows (seen) |
|---|---|
| `q25b-input-band` / `-crop` | The look 25-2 copies. Hunter (moving 142 → 149) has a "New input" window open, Remarks "Course brief, 0800". Past midnight: the yellow band "⚠ This change could not be saved." and "Close" across the window's top, his words still under it, the bar now 149. Not ringed: it is in the app today. |
| `q25-saber-before-midnight` / `-crop` | Saber, 23:40, 142's Admin → Users, "Add a person": Bandit, BD, Pilot, CAT C, post-in Wed 15 Jul 26. |
| `q25-saber-today-after-midnight` / `-crop` | Today, past midnight: the bar says **150**, the same form still open with all his typing, and nothing said. |
| `q25-saber-today-added` / `-crop` | Today, Add pressed: "Bandit added to the roster — set flight and quals on the Quals page", and 150's list "People · 2" with Bandit, Kestrel and Saber. |
| `q25-saber-today-list150` / `-crop` | 150's list with Bandit's row ringed: he was added to 150, not to 142, where he was typed. |
| `q25-hunter-before-midnight` / `-crop` | Hunter ("HUNTER · ADMIN"), 23:40, 142's Users, "Add a person" with "Typedman" typed. The crop does not show the squadron number, since Hunter has no squadron picker in this world; the whole screen shows 142 at the top left. |
| `q25-hunter-today-after-midnight` / `-crop` | Today, past midnight: "HUNTER · MEMBER", **150's View-only Sched**, no Admin tab, the form and his typing gone, nothing said. The crop is the top bar only and cuts off the "150" mark; use the whole screen, which shows it. A "Sync · slow" mark shows in his bar (below). |
| `q25-1-compare-row-note` / `-crop` | For comparison: his ruled note for a row the page throws away, raised by the app's own note code on 142's Users: "Ace’s row changed while it was open, so nothing was saved. Open it again." (yellow text, at the foot). These words are built on the Users branch, not in this build. |
| `q25-1-saber-note` / `-crop` | **25-1, DRAWN, NOT BUILT, Saber:** 150's Users after midnight. The form is closed (by its own Cancel) and "+ Add a person" is back; the note "Bandit was not added: you are 150’s from today." is at the foot in the same look, ringed, with a "Draft words" label. |
| `q25-1-hunter-note` / `-crop` | **25-1, DRAWN, NOT BUILT, Hunter:** where the app lands him (150's View-only Sched, member view), the note "Typedman was not added: you are 150’s from today." in the same place and look, ringed, "Draft words". |
| `q25-2-saber-band` / `-crop` | **25-2, DRAWN, NOT BUILT, Saber:** 150's Users after midnight, the Input window's band "⚠ This change could not be saved." and "Close" across the top of "Add a person", ringed. His typing (Bandit, BD, Pilot, C) is still there. Add was pressed once and did nothing. |

## Where this differs from the brief

- **Hunter's sign-in is `ad2` / `a2`**, not `hu`. That is what the seed accounts hold.
- **24B, Hunter:** the brief expected "the Tracker goes to his own squadron".
  - What he sees is different. His member view stays on **149** and shows **149's View-only Sched**: the member view there
    offers no Tracker. The chart editor is closed.
  - So the proposed picture for Saber, on his own Tracker with the editor closed, is not the same screen as Hunter's. It
    is the same rule, "no editor left open".
- **25(b) uses Hunter's move to 149, not Saber's to 150**, because that is the state the Input window's midnight test
  reaches. The band's words and look do not depend on who moves.
- **A move cannot be pressed yet**, so it is written as set-up. Said above.
- **The callsign is Bandit, not a name chosen in the brief.** "Zulu" is already taken in the demo.

### Two things seen along the way (not asked for, for whoever owns them)

1. **The post-in date stays at yesterday.** After midnight, Saber's still-open form keeps "Post in: Wed 15 Jul 26", while
   the app's day is now Thu 16 Jul; the emptied form after Add shows Thu 16 Jul. So a man added from a form left open
   across midnight may get yesterday's post-in date. Not checked further.
2. **"Sync · slow" in Hunter's bar.** Hunter's bar shows it after his switch to the member view (24B) and after his
   midnight move (25). It may come from the clock jump or the demo's saving. Not looked into.

## Draft cards (checked against the pictures)

**Question 24A: the words when he switches back to the admin view**
- *When it happens:* an admin who has switched to the member view opens the Tracker, changes the chart (for example adds
  an event), does not save, and presses his name badge to go back to the admin view. This is rare: chart work is mostly
  done in the admin view.
- *What he sees today:* "You have unsaved chart edits on “2026”. Save them before switching back to the admin view?", with
  Stay, Discard them and Save them.
- *Recommended:* keep these words. They are the question he approved on 24 Nov, with "back to the admin view" in place of
  "to the member view", so he meets one question both ways.
- *Other answer:* word it differently. He would say how.
- *Pictures:* `q24a-back-crop` (whole screen behind a tap), with the approved `q24a-to-question-crop` beside it.

**Question 24B: the chart editor left open when he switches view on his own squadron**
- *When it happens:* an admin on his own squadron opens "Edit chart layout" on the Tracker, moves nothing, and presses his
  name badge for the member view. It happens now and then.
- *What he sees today:* the member view comes up on the Tracker, and the chart editor stays open, tool strip and all. For
  someone working another squadron, his 26 Nov answer already closes the editor: Hunter on 149 lands on 149's View-only
  Sched with nothing left open.
- *Recommended:* close the editor on his own squadron too, so a switch never leaves the editor open, whoever presses it.
  He lands on the Tracker with the chart as he left it. **This is the builder's reading of his 26 Nov answer,** which was
  asked about someone working another squadron.
- *Other answer:* leave it open on his own squadron, as today. Nothing is lost either way, since nothing was moved.
- *Pictures:*
  - today: `q24b-saber-before-crop` and `q24b-saber-after-crop`;
  - what his answer already does elsewhere: `q24b-hunter-after`;
  - proposed: `q24b-saber-proposed-crop`.
  
  Each comes with its whole screen.

**Question 25: "Add a person" half-typed when his own move to another squadron starts at midnight**
- *When it happens:* an admin is adding someone on Admin → Users late in the evening before his own move to another
  squadron takes effect, and leaves the form open past midnight. This is rare: his own move happens once in a long while,
  and lands at midnight.
- *What he sees today:*
  - **Saber**, a master admin: at midnight the page becomes 150's, the form stays open with his typing, and nothing is
    said. If he presses Add, the man is added to 150, not to 142, where he was typing.
  - **Hunter**, an admin who is not a master: at midnight he becomes a member of 150. The Admin page is taken away and he
    lands on 150's View-only Sched. His typing is gone, and nothing is said.
- *Recommended (25-1):* the form closes, and a short note at the foot says nothing was added: "Bandit was not added: you
  are 150’s from today." (draft words).
  - It is one rule for every half-done piece of work on Admin → Users across his own move. It works whether or not he
    still has the Admin page.
  - It matches how the page already treats a row it has to throw away: "Ace’s row changed while it was open, so nothing
    was saved. Open it again."
  - The cost is one callsign typed again.
- *Other answer (25-2):* keep the form open with the Input window's band across its top, "This change could not be saved."
  and Close. Add does nothing, and his typing stays visible.
  - It fits only Saber, whose page stays. **Hunter's case would still need the note of 25-1.**
- *Pictures:*
  - today: `q25-saber-before-midnight-crop`, `q25-saber-today-after-midnight-crop`, `q25-saber-today-added-crop`,
    `q25-saber-today-list150-crop`, `q25-hunter-before-midnight` and `q25-hunter-today-after-midnight` (whole screens);
  - 25-1: `q25-1-saber-note`, `q25-1-hunter-note`, and `q25-1-compare-row-note-crop` for comparison;
  - 25-2: `q25-2-saber-band-crop`, and the look it copies, `q25b-input-band-crop`.

## What could not be drawn

- **Nothing is left undrawn.**
- **Two crops lack the squadron number,** because Hunter has no squadron picker in that world: `q25-hunter-before-midnight-crop`
  and `q25-hunter-today-after-midnight-crop`. Use their whole screens.
