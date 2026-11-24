# Notes — the look for other counts (his D2603; the night of 25 Nov 26, job 2)

For the host and whoever builds an answer later. The brief: `2026-11-25-counts-look-brief.md` (beside this file); the
four counts chat 173 handed over: `2026-11-25-counts-look-handover-from-173.md`. The page (a draft, its words not yet
read by the fresh Fable reader): `raptor-port/docs/mock/counts-look.html`, made by
`raptor-port/scripts/handpass/cnt-page.mjs` from the runs of `raptor-port/scripts/handpass/cnt-draw.mjs` (worlds S, P,
L). Pictures: `raptor-port/docs/img/handpass/2026-11-25-counts-look/`. Raw runs and logs (not in the repo):
`D:/rw4/night2/job2/` (`run-S`, `run-P`, `run-L`, each with `cnt.json` and `facts.json`).

## The build and the method

- `D:/rw4/build-new3`, bundle `index-DIr933hk.js` — `main`'s app code with round 4 live. No build made, no checks lock.
- Chromium at 402x874, device scale 2, touch; the build served inside the test browser (`wr4-lib.mjs`, its phone scale
  set to 2 by `cnt-draw.mjs`). Each case made by the app's own controls, except world P's fixtures: the four plus one
  Trainings with no OIL answer are planted through the bridge's `fileInput`, as chat 140's walk of the publish note did
  (`sfd-w2.mjs` s6) — the window itself always asks the OIL question. Sign-off (Later on the OIL list), publish, the
  cancels and the amendment's publish are the real controls.
- Today's words ringed amber; "named" words put into the app's own element (round 4's swap), ringed green; rows counted
  from the distinct line boxes of the element's text. The named wordings follow the app's own patterns where it has one
  (the publish note names three as "Tally’s Training, Ace’s Training and Hex’s Training"); elsewhere they are the
  drafter's and the page says so.
- Measured facts the page leans on: the input window's title stays on one row and is cut with "…" (`.win-ttl`,
  `white-space: nowrap; text-overflow: ellipsis`) — ten names cut after about six; when Delete is pressed in that window
  it scrolls to its foot and no picked person is in view (`peopleInView: false`); "Input added for N people" is said only
  where the new input is not in view (`InputWindow.tsx saidSaved` → `noteUnlessSeen`), so it is silent from the Inputs
  calendar's day; four names in the OIL tracker's credit heading push its date box to a second row.

## The whole list

A = a count standing in for things it could name (a question); B = the count is the fact, or opens the list it counts
(kept, one line on the page); C = unsure (a question). Paths under `raptor-port/src/`. "From" = from what number the
count is used instead of names.

### A — questions, with pictures

| Q | Where on screen, who | Code | Today's words (worked example) | From | Picture |
|---|---|---|---|---|---|
| 1 | The input window's title for an input of several; also the OIL question's heading and other questions naming the input ("Un-cancelling Ace +2's Training", "Open Ace +2's input and lose them?") — anyone opening it | `ui/inputedit.tsx` `inputWho` (~2081); callers `ui/InputWindow.tsx` ~802, ~1311, ~1353, `ui/reqdoor.ts` ~281, ~384, ~452, ~455, `ui/interactions.ts` ~1211, `ui/InputsPage.tsx` ~443, `ui/caldrag.ts` ~181 | "Ace +2 · 15 Jul"; ten: "Basher +9 · 16 Jul" | 2 people (first A to Z, then "+N") | `s-title-today`, `s-title-named`, `s-title10-named` (cut) |
| 2 | The input's own sentences for several people: the delete question and note, take-yourself-out, date changes, the added note, refusals, the OIL question's lead — anyone deleting or changing a shared input | `ui/inputedit.tsx` `howMany` (~2095); `ui/InputWindow.tsx` ~572, ~797, ~1229, ~1242, ~1251; `ui/interactions.ts` ~1064–1067, ~1144, ~1204–1207; `ui/board.ts` ~1252; the Inputs calendar's twin `ui/inputscal-model.ts` `everyoneIn` (~149), `ui/InputsCal.tsx` ~1003, ~1196 | "Delete this input for all 3 people?"; "Input deleted for 10 people"; "It stays for the other 2 people."; "Date changes apply to all 3."; "3 people's Training is already on the programme"; "Filing 3 people's Training under Unavailable"; "Input added for 3 people" (only when not in view) | 2 named people (one named person keeps his callsign; ALL AVAIL said beside) | `s-delete-today`, `s-delete-named`, `s-delete10-named`, `s-deleted-today`, `s-deleted-named` |
| 3 | Undo's and Redo's note for one input of several; and the publish note's unanswered-OIL line, which copies Undo's naming (D1582, D2314) | `undo/describe.ts` `oneInputNamed` (~413); `leavewar/sync.ts` `oilUnansweredLine` (~2483) | "Undid: Training for 3 people"; "Sunday 19 Jul published and approved. Training for 3 people has no OIL answer, so nobody on it earns OIL." | Undo: 2 people; publish note: 3 (two named "Ranger and Hex’s Training") | `s-undo-today`, `s-undo-named`, `p-three-today`, `p-three-named` |
| 4 | The publish note of a weekend or holiday with inputs whose OIL question is unanswered — the scheduler publishing | `leavewar/sync.ts` `oilUnansweredLine` (~2487) | "Saturday 18 Jul published and approved. 4 inputs have no OIL answer, so nobody on them earns OIL." (handed over by chat 173, its count 4) | 4 inputs (up to three named) | `p-four-today`, `p-four-named` (3 rows), `p-held-today` (three named, the app's own) |
| 5 | An amendment's publish note while other published days still hold changes | `engine/publish.ts` ~1451–1453 | "Published AL1 · 1 item on Sat only · approved by Bolt · 1 day with changes still held · …" | 1 day | `p-held-today`, `p-held-named` |
| 6 | The Leave War's OIL page: the credit bar's heading when an admin picks four or more names | `leavewar/ui/OilTracker.tsx` `namesOf` (~437–439), used ~889 | "OIL credits · Reaper, Anvil +2" | 4 names (first two, then "+N") | `l-oil-context`, `l-oil-today`, `l-oil-named` |
| 7 | The Leave War's Grades window: deleting a grade people hold | `leavewar/ui/gradeswords.ts` `deleteAsk` (~5), shown `leavewar/ui/GradesSheet.tsx` ~228 | "3 people hold Ops A: they become No grade" | 2 people ("1 person holds") | `l-grade-today`, `l-grade-named` |

### A — questions without a picture

| Q | Where, who | Code | Words | From | Why no picture |
|---|---|---|---|---|---|
| 8 | The note after placing someone on the schedule that raises several new warnings | `state/dropflag.ts` `flagDrop` (~103); test `state/dropflag.test.ts` ~76 | "<callsign> — <first warning> (+2 more)" | 2 warnings | needs a placement raising two or more warnings at once; not set up in the time |
| 9 | The note after loading an earlier version of a day (D863's short sentences) | `ui/interactions.ts` ~1702; `engine/drafts.ts` ~180–182 | "2 requests stay as filed because they cover another day." · "2 changes to members’ inputs stay pending. …" · "2 inputs filed since publishing stay on the programme, pending." (also the "moved onto the programme" sentence) | 1 (one is "1 request stays…") | needs a published, changed day loaded back with requests covering other days |
| 10 | Undo / Redo of the Leave War's open dates when three or more separate runs changed in one step | `undo/describe.ts` `runsText` (~215) | "Undid: opening bidding 1 Mar – 7 Mar and 2 more" | 3 runs | needs three separate runs opened in one step |
| 11 | The SANS reminder ("planned with nothing filed") and the SANS posting line's "hidden" sentence (handed over by chat 173) | NOT on `main`: `state/notices.ts` `sansDaysWords` on `claude/allavail-sans-postout-141` (pull request 825, ~1155–1157), used by the reminder and `sansBackWords` (~1204–1211) | "You’re planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed."; "…the SANS availability you filed for Sat 18, Mon 20 Jul and 2 more is hidden…" | 4 days (`SANS_DAYS_NAMED = 3`) | not in today's app; the wording is the SANS words job's (pull request 825, chat 174) |

### C — unsure (questions, no picture)

| Q | Where | Code | Words | From | Why unsure / no picture |
|---|---|---|---|---|---|
| 12 | The Leave War's drag-select window heading | `leavewar/ui/SelectSheet.tsx` ~233–237, ~419–420 | "5 people" beside "9–11 Nov · 3 days" | 4 people (1–3 named) | the picked rows are lit on the grid, but whether the window covers them on a phone was not checked; needs a drag across five rows |
| 13 | Holidays from a sheet: Undo's words and the "Also added" note | `undo/describe.ts` `holidayLabel` (~255); `ui/HolidaysPanel.tsx` ~169 | "Undid: adding 7 holidays"; "Also added: 3 holidays in 2027." | 2 | a sheet holds a dozen or more; other years' holidays are not on screen; needs a sheet file |
| 14 | Undo of several inputs in one step | `undo/describe.ts` ~499, ~502 | "Undid: 3 inputs" | 2 | his D1582 chose the count; whether D2603 reopens it is unclear; no single step changing several inputs was found in the time |

### Pointed to, not asked again

- The bell's "3 people added / taken off" (`state/notices.ts` `names`, ~956) — job 1's page, its question 5 (handed over
  by chat 173 as its count 1); joining two names with "and" — job 1's question 6.
- The bell's "and 1 more change" (`state/notices.ts` `firstTwo`, ~1041–1046) — settled by D2600, not built.

### B — kept, one line each on the page

| Where | Code | Words | Why kept |
|---|---|---|---|
| The day's pending button | `ui/html.ts` ~1694–1697 | "3 pending" | opens the changes it counts (picture `b-pending`) |
| The bell's badge and "↓ 3 more" cue | the bell; D1788 | "↓ 3 more" | unread count; a scroll cue he chose |
| The bell's holiday line | `state/notices.ts` ~1057; tap `ui/topstate.ts` ~98 | "3 inputs need an OIL answer" | the tap opens the OIL list; the count falls as each is answered |
| The warning list's heading | `ui/html.ts` ~1191, `ui/board.ts` ~508 | "⚠ 2 issues · 3 warnings" | heads the list it counts |
| The changes window | `ui/ChangesWindow.tsx` ~190–202, ~309; `ui/changesmodel.ts` ~155 | "5 changes"; "Input · Meeting · 4 people" | the names are listed under it (his D663) |
| The list waiting to go out | `ui/pendlist.ts` ~385, ~678 | "Range safety brief · 4 people"; "· 3 changes" | names listed under it |
| The Inputs calendar | `ui/InputsCal.tsx` ~1446–1447, ~1179; `ui/inputscal-model.ts` ~235 | "+2 more"; "4 · Meeting"; "3 inputs" | opens the day with every name (his D729, D721) |
| The Inputs page's group heads | `ui/InputsPage.tsx` ~793; `ui/board-html.ts` ~829, `ui/html.ts` ~2229 | "4 inputs · 2 on programme" | heads the list |
| Leave War corners and chips | `leavewar/engine/dayview.ts` ~355; `leavewar/ui/Chrome.tsx` ~492 | "+2"; "Open 1 Apr – 30 Jun +1" | each opens the full list |
| The amendment's size | `engine/publish.ts` ~1451; `ui/ALPanel.tsx`; `ui/html.ts` ~2585 | "Published AL1 · 1 item on Sat only"; "AL1 3 items" | the size of the amendment is the fact |
| The plan switch's pending sentence | `ui/board.ts` ~1838 | "3 differences from AL1 are pending." | the same count as the pending button, which opens them |
| The OIL-answer tail of a load or a switch | `ui/oilputback.ts` ~67 | "2 inputs need an OIL answer." | the note opens the list that names them |
| OIL answered | `ui/oilday.ts` ~63 | "OIL answered for 3 inputs" | he has just answered them in that list |
| The input window's "picked" | the input window's people box | "3 picked" | each is lit beside it (in picture `s-title-today`) |
| Grades' holders | `leavewar/ui/GradesSheet.tsx` ~25, ~221 | "3 people" | how many hold the grade (picture `b-holds`); the delete is question 7 |
| Leave War notes on picked days | `leavewar/sync.ts` ~809–810; `leavewar/ui/BidPicker.tsx` ~633, ~676, ~731; `leavewar/ui/SelectSheet.tsx` ~299, ~333, ~420 | "3 days filed. 2 days were not yours to change"; "2 of 5 days deleted. …"; "Delete 3 days for Ranger?" | the days are the ones just picked |
| Approvals | `leavewar/ui/ApprovalsPage.tsx` ~457–464 | "3 pending · 1 new"; "+2 pending in JAN – DEC 27 ›" | opens them |
| OIL and leave figures | `leavewar/ui/awardwords.ts` ~11, ~23; `leavewar/engine/credit.ts` ~49; balances | "2 OIL awards (…)"; "half a day" | the figure is the fact; awards already named |
| Admin, Logic, Help, bug reports | `ui/AdminPage.tsx` ~91; `ui/LogicPage.tsx` ~451, ~465; `ui/HelpPage.tsx` ~103; `ui/topstate.ts` ~59; `ui/inputedit.tsx` ~2365 | "Cleared 12 items"; "3 rules back to squadron standard"; "2 new bug reports" | counts what was just done, or a list shown |
| The Tracker | `tracker/app/core.js` ~6586; `tracker/components/SidePanel.jsx` ~198, ~451 | "3 events deleted — Undo restores them"; "4 fails" | the events were just picked; the fails are listed |
| Insights | `ui/insights-html.ts` ~21, ~50, ~59 | tiles and day rows | the numbers are the point |
| Settings and limits | `engine/daytpl.ts` ~363; `engine/lookahead.ts` ~121; `engine/rules.ts` ~183; `ui/CutFields.tsx` ~50; `leavewar/state/store.ts` ~5297 | "2 waves · 3 duty blocks"; "Next 2 weeks"; "That is more than <the most> days" | a setting's value or a limit |

Left out of the sweep's list as not read by a person: the developer checks in `engine/markcheck.ts` and the console
warning in `leavewar/state/store.ts` ~1015. The rules engine's warnings name the people (no counts found).

## What the page's questions rest on that a reader should check

- Q1: his D721 / D727 (10 Oct 26) — the card and the desktop list name everyone, never "+1"; the window title was not in
  those questions (the agent's reading, said on the page).
- Q3: D1582 (3 Nov 26) and D2314 (22 Nov 26) — the counts he chose; recommended kept.
- Q11: the drawing he approved with D2421 showed "…and 1 more" (chat 173's handover); the SANS words job holds it.
- Q14: D1582's "several at once by their count".
- Every "how often" on the page is marked a guess; none was measured.

## The words read (the fresh Fable reader, 25 Nov 26 — his D2441)

The page's words were read and adjusted in `cnt-page.mjs` and the page regenerated from the same runs; no picture was
redrawn or changed (22, as before). **The page's numbers changed; the Q numbers in the tables above are the draft's.**

| Page now | Draft's Q | What | Recommendation |
|---|---|---|---|
| 1 | 2 | the delete question and the input's other sentences | name them ("Date changes apply to all 3." stays, D729 V3) |
| 2 | 4 | the publish note's "4 inputs" | name them all |
| 3 | 7 | deleting a grade | name them |
| 4 | 5 | "1 day with changes still held" | name the days |
| 5 | 11 | the SANS reminder and posting line (not on `main`) | name every day |
| 6 | 1 | the window's title "Ace +2" | keep |
| 7 | 3 | Undo's and the publish note's "Training for 3 people" | keep from three; Undo names two as the publish note does (new) |
| 8 | 6 | the OIL credit bar's "+2" | keep, said to be close |
| 9 | 9 | the load note's three counts | **keep** (the draft: name them) |
| 10 | 8 | "(+2 more)" warnings | keep |
| 11 | 14 | "Undid: 3 inputs" | keep |
| 12 | 10 | "opening bidding … and 2 more" | keep |
| 13 | 13 | holidays from a sheet | keep both |
| 14 | 12 | the Leave War's "5 people" | keep for now, unchecked on a phone |

- Order: the five recommended to change first (four with pictures, then the SANS lines), then the nine recommended
  kept, which he may answer together ("Keep 6 to 14"); the list of counts that are the fact is put as one answer of its
  own ("Keep the list"), no longer "kept unless you say otherwise". No question added or removed.
- "Your earlier word" checked against each full row: D2314 (he answered "all as recommended"; the page now says so and
  asks whether 24 Nov reopens it); D1582 (covers one input by person and kind, and several inputs by their count — NOT
  one input of several people, which the page now calls the builder's choice); D721 / D727 (his words about the card
  quoted; the title and the OIL credit bar said not to be part of that question); D2421 / D2342 (the "and 1 more" was in
  the drawing he said "Go" to, never asked on its own — the agent's reading in D2342's row); D863 ("Shorten it", of the
  load note — the draft did not name it, and it is why question 9's recommendation changed); D729 V3 ("Date changes
  apply to all 4." approved as drawn — the draft's "name them" would have changed it unsaid); D1788, D663, D729 V4 in
  the list.
- Facts added from the code and the pictures: a note stays 60 ms a letter plus 1.2 s, never more than 12 s
  (`ui/toast.ts` ~216); the ten-name title is cut inside the sixth name and loses its date (`s-title10-named`); the same
  short name stands in the OIL question's heading and other questions (`inputWho`'s callers), not pictured; the load
  note's three counts are of the day's pending items (`engine/drafts.ts` ~168); the SANS lines' exact words are the SANS
  branch's (`sansDaysWords`, three days named, and the "hidden" sentence).
- The page at 402 wide, light and dark: no sideways scroll, 15 links land (`D:/rw4/night2/page-look-words/`); about 25
  phone screens, where the draft was about 20 — the growth is his earlier words and the costs.
