# Rules diet step 5a — the account of the Tracker's rulings, by requirement (8 Nov 26)

**What it is.** The account the plan asks of every conversion (`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`
§2 "The account — by requirement", §7 step 5a), in the shape of the screen-design account
(`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-design-account.md`): every ruling of the old
`.claude/rules/decisions/tracker.md`, split into its parts, each part → the page line that states it now, or marked
spent, detail or superseded, or a gap. **Compared:** old = `aee0de3f2` (the table of 72 short lines, D64–D1900, and its
head paragraphs); new = `5ed8dbd48` (the page, first draft, by a fresh Opus helper).

**How it was made.** By a fresh Opus helper that did not write the page. For every one of the 72 rulings the full row in
`.claude/decisions-full/tracker.md` was read sentence by sentence — his words, the meaning cell with every mark, the
readings he was told. The drawings behind the "as drawn" rows were read for their visible words and the agent's calls:
the reorder drag (`raptor-port/docs/mock/2026-10-15-trk-reorder-drag/index.html`, D922, D924), the night pictures of
18 Oct 26 (`raptor-port/docs/superpowers/briefs/2026-10-18-night-pictures.md` §2–3 and the picture
`raptor-port/docs/img/handpass/2026-10-18-trk-down-days/3-window-phone.png`, D1018), the round-1 page
(`raptor-port/docs/mock/2026-10-17-tracker-r1/index.html`, D979–D984), the glide page
(`raptor-port/docs/mock/2026-10-17-trk-glide-r1/index.html`, D985–D989), the pictures round's answers in
`raptor-port/docs/ui-contracts.md` (D1790, D1791, D1861). The design guide's wording was read clause by clause where a
ruling rests on it — §5 Motion (the one bounce, D987; the glide on for less motion, D989, since D992 the phone's own
scrolling) and §5a Dragging (D895's three parts, for D899, D922, D924). The old head was read item by item; every
"From other areas" pointer and every other area's number cited on the page was checked against that ruling in its own
area today (its page line or short line, and its full row); the other areas' full rows were searched by subject
("Tracker"). Whether a thing is built was checked in `OUTSTANDING.md`, `OUTSTANDING-ARCHIVE.md` and the app's code.

**Fixes applied by the same helper** (8 Nov 26, the working tree, not committed): every gap below carries a **Fixed:**
note saying where it is stated now. **The table describes `5ed8dbd48`**: a part marked A# or B# was missing, bent or
stated as his where it was the agent's there; its "where" names the page line as fixed. **Not yet read by the blind
readers.** The page's D1900 wording (built in chat 28, pull request 706, not yet live) is the host's and was left as it
stands.

**Counts.** 72 rulings, **466 parts: 346 stated, 31 spent, 15 superseded, 30 detail, 44 in a gap** (nine of them, the
leftovers batch's readings, in one gap, A5; A2 and A3 are pointers, so no Tracker part of theirs is counted). **31
gaps: 8 that bent or dropped a rule (A1–A8), 23 smaller (B1–B23)**; besides them, 7 pointers corrected and 2 added
(§The pointers, §The other areas). No full-row mark written; no row moved.

**Codes.** Page sections: **P-head** (the paragraphs before the first heading — the privacy rule, where the detail
lives), **P-What** §What the Tracker is, and the data it keeps, **P-Who** §Who may do what, **P-Stu** §Students and
courses, **P-Own** §Each person's own place, **P-Look** §The chart's look, **P-Move** §Moving round the chart, **P-Land**
§Where the chart lands, **P-Key** §The keyboard, **P-Mark** §The marking window, **P-Info** §The Info panel, **P-Bar**
§The bar and its controls, **P-Find** §Find, **P-Edit** §Edit chart layout and its drags, **P-Ord** §The reorder windows,
**P-Undo** §Undo, **P-Imp** §Import, export and backups, **P-Del** §Deleting and restoring a course, **P-Out** §Logging
out, **P-Set** §Settled, **P-From** §From other areas. A page line is named by its section code and its first words.
Marks: **S** — the line states the part; **spent** — a one-off part done; **det** — only an example, a figure that is
not a rule, a reason, a file list or history (never a wording on screen, a mark, a control, a scope or a size);
**sup** — a later ruling replaced the part (named; the newer wins); **A#/B#** — a gap, below. "r" before a part is the
agent's reading told to him in the row; "d" a part only the approved drawing holds.

## Gaps

### A — a rule bent or dropped (8)

- **A1** D464 — **a one-off export reminder made standing.** The row: "Before "merge live" of the Tracker's conversion he
  is reminded to export a copy first" — the conversion of the charts to one record per thing (`[DB-READINESS]` group A
  phase 5b), merged on his "merge live" on 1 Oct 26 (pull request 476, `OUTSTANDING-ARCHIVE.md`). The draft read "he is
  reminded to export before a "merge live"", a reminder before every merge. Spent; what stands is the rule that any
  change that would wipe his charts is told to him first, so he can export a copy (already on P-What). **Fixed:**
  P-What "The agent's readings of that: a wipe of the saved data's shape never touches the Tracker; the database step
  moves the charts by his own export, wipe and import, his own act" [D464, D120] — the reminder gone as spent.
- **A2** The claw pointer (the design file's D1607, D1610, D1611). The draft read "the start-up claw shows over the
  Tracker's first open after sign-in". The start-up claw is another thing (every start, from its first moment, its own
  timing — D1615, D1605); what shows over the Tracker is the claw over a page that opens slowly — from the tap with no
  wait, never adding to the page's time, the top bar staying in view and in reach (the design page, §Loading). **Fixed:**
  P-From "The design file's: the claw shown over a page that opens slowly — not the start-up claw — shows over the
  Tracker's first open after sign-in, from the tap with no wait, … never adding to its time, the top bar staying in view
  and in reach" [D1607, D1610, D1611], and "Still loading…" on a line of its own [D1632].
- **A3** The drag pointer (the design file's D895). The draft read "a thing dragged shows one landing line and scrolls
  its box at the edge". The guide's §5a, clause by clause: one landing line is for a thing moved between a list's rows,
  on the top edge of the row under; a thing dropped onto a place marks that place once; the edge scroll runs in the
  direction the thing can move, at the app's edge distance and speed, and stays on for less motion; a drag already
  built that does otherwise is named to him, never changed unasked. The draft widened the first to every drag (the
  chart's ball drags land on a place, not between rows) and dropped the other three. **Fixed:** P-From "The design
  file's: dragging, as the design guide's §5A words it — …" [D895].
- **A4** D374 r1–r3 — **three readings stated as his rule.** His rule: a day after today refused in four boxes, the box
  going back to what it had and one line saying the day cannot be after today, nothing saved, no undo step. The
  readings told to him: "today" is the squadron's (Singapore's) day, not the device's clock; the full failures list's
  rows are Failed on days too; a future day already stored is not rewritten (D56). The draft folded the first two into
  his sentence and gave the third as a rule of its own. **Fixed:** P-Mark "A day after today is refused in four boxes …"
  [D374], then "The agent's readings of that, told to him: "today" is the squadron's own day (Singapore's), not the
  device's clock; …" [D374, D56].
- **A5** D371 r, D372 r1–r4, D373 r1–r3 — **the leftovers batch's readings stated as his rule.** D372: the
  two-second grouping, a lull's set, change and removal each a step, Copy to… one step, either bar — all readings,
  stated in his sentence. D371: undated and same-day failures' order, the same. D373: his scope is "a short screen (a
  phone on its side)"; the draft made the agent's "under about 500px tall" the rule's scope, took "closes on a choice"
  as his, and dropped "the folded row then shows that tool". **Fixed:** P-Undo "A change to a student's pace, either end
  date or his lull periods is an undo step …" [D372] and "The agent's readings of that, told to him: keystrokes in one
  box within two seconds …" [D372]; P-Mark "Failures follow their days: … the agent's reading, told to him: undated
  failures follow the dated ones …" [D371]; P-Edit "On a short screen — a phone on its side — Edit chart layout folds
  its tools into one row …" [D373] and "The agent's readings of that, told to him: a short screen is a window under
  about 500px tall; choosing a tool from the opened set closes it, and the folded row then shows that tool" [D373].
- **A6** D1018 r1–r3 — **three readings stated as his rule.** The row lists them as "the agent's readings, to tell
  him": the desktop's colour strip moves into the Legend so a phone has one; with flex off "Days since syllabus" goes
  (the night-pictures brief: "the helper's reading, not his ruling") and the currency bar takes the full width; the
  legend's words as drawn, any change put to him first. They were drawn in the pictures he approved, so they stand —
  as readings. **Fixed:** P-Info "With flex off the heading reads "Currency" and the flex bar goes — on a desktop the
  flex sentence too" [D1018, D1006], "The agent's readings, drawn in the pictures he approved: with flex off "Days since
  syllabus", which feeds only flex, goes too, …" [D1018]; ""Legend" sits beside Show All, a copy of the Leave War's
  Legend pop-out" [D1018] and "The agent's readings, drawn in the pictures he approved: the desktop's colour strip moves
  into the Legend, …" [D1018].
- **A7** D924 r4 — **a mark dropped.** The row's reading, as drawn (picture 3 of the reorder-drag page: "The ring on the
  dropped row in picture 3 is the app's own landing mark, the one a note dropped on a day gets"): the landed row wears
  the app's landing mark. The draft left it out. **Fixed:** P-Ord "The agent's readings, as drawn: … the landed row
  wears the app's landing mark, as a dropped note does; …" [D924, D922].
- **A8** D1018 d — **a wording on screen bent.** The draft read ""No. of Down Days" reads such as "14 1/2 days"" and
  "("1/2 day")", copied from the brief's text. The approved drawing (`3-window-phone.png`) and the build
  (`src/tracker/app/core.js`, "a half as ½ … (as drawn)") read "14½ days" and "½ day". **Fixed:** P-Info ""No. of Down
  Days" reads such as "14½ days", … ("½ day"), a cut one "cut by an upchit on … · filed to …" with its old end struck,
  …" [D1018, D1002].

### B — smaller (23)

- **B1** D1538 r1 — his rule and the reading folded ("…, so a change no longer has to keep a standalone copy working"
  stated as his), and "or carry Raptor's own parts with it" dropped. **Fixed:** P-What "The Tracker is no longer to be
  exported back out as a standalone app …" [D1538], "The agent's readings of that, not checked with him: … so a change
  no longer has to keep a standalone copy working or carry the app's own parts with it; …" [D1538] and "The agent's
  reading too: the code kept only for a standalone Tracker went with the Tracker's next batch …" [D1538].
- **B2** D474 — the advice's "the file stays a format (Export / Import); JSON only inside a row" dropped. **Fixed:**
  P-What "As stored: … no "one file per save" — the file stays a format (Export and Import), JSON only inside a row, for
  what the app reads whole" [D474].
- **B3** D463 — "and its demo students" dropped. **Fixed:** P-What "An empty real database … the demo course and its
  demo students are made only with the demo on, and never reach a shared store" [D463].
- **B4** D120 — "The guard D56 set still holds: if the app would do it again to NEW data, it is a finding" dropped
  (the draft kept only "marking, students and dates must still work for new data"). **Fixed:** P-What "The guard of How
  we work's rule on data already stored still holds: if the app would do it again to new data, it is a finding" [D120,
  D56].
- **B5** D191 — "OK or Enter adds": Enter is the agent's call, told to him. **Fixed:** P-Stu "When the + Add search
  matches nobody … the agent's call, told to him: Enter in the search does the same as OK" [D191].
- **B6** D981 r2 — "put to him only if the two pull apart" and "in the build's plan" dropped. **Fixed:** P-Stu "The
  agent's readings of that: … checked against the delete's rule and the import's (below) in the build's plan, and put to
  him only if the two pull apart" [D981].
- **B7** D157 — "that it reads at a glance on a phone is still to be checked" reopened a closed check: the build went
  live on 26 Sep 26 (pull request 441), the at-a-glance phone look item 1 of his look card
  (`raptor-port/docs/handpass/2026-09-26-trk-palette.md` §11) before his "merge live" (How we work: his "merge live"
  means his own look is done). **Fixed:** P-Look "The Tracker takes Raptor's colours fully — … it is built and live
  since 26 Sep 26 (pull request 441), the check that it still reads at a glance on a phone put on his look card before
  his "merge live"" [D157].
- **B8** D564 p6 with D566 p4 — the constraints lost "ball/ring size", "mark/hit behaviour" (a tap) and "unless he
  changes them". **Fixed:** P-Look "The ball's and rings' size, the palette, his fonts, charts and details, and how a
  ball is marked and tapped stay as they are, unless he changes them" [D566, D564].
- **B9** D982 — "the bar's colour and its ink come from the same place in the app, so no bar can be given one without
  the other" dropped, and the bars unnamed. **Fixed:** P-Look "The Currency & flex bars take dark words … a bar's colour
  and its ink come from one place, so no bar takes one without the other" [D982].
- **B10** D989 — "the pinch and its take-back unchanged" dropped; "for a reader who asked for less motion" put back to
  the row's "when the phone asks for less motion" (the same setting). **Fixed:** P-Move "Two fingers stop a glide, the
  pinch and its take-back unchanged; … the glide stays on when the phone asks for less motion; …" [D989, D992].
- **B11** D1790 — "the Leave War's rule that a window never hides what it is about": the Leave War's ruling D1290 is
  that its grid scrolls the picked days into view just above the bid window; "a window never hides what it is about"
  is that day's lesson. **Fixed:** P-Mark "It follows the Leave War's grid, which scrolls the picked days into view just
  above their window (the Leave War's D1290), and that day's lesson that a window never hides what it is about; …"
  [D1790, D1861, D1290, D984].
- **B12** D801 — the fallback's condition, "if a tap proves too easy to get wrong there", dropped. **Fixed:** P-Mark
  "The three date boxes … his own idea stays the fallback: if a tap proves too easy to get wrong there, a tick at the
  top right of the calendar's head, for the Tracker alone" [D801].
- **B13** D1004 r — "and put to him if it does not" dropped, and "was left to the build to check" stated a past fact
  the row does not give (no result is recorded — §Left open). **Fixed:** P-Info "The agent's reading, told to him:
  whether a non-syllabus flight graded on the chart moves "Last currency" by itself, or it is typed, is checked in the
  build and put to him if it does not" [D1004].
- **B14** D1005 r1 — "a syllabus flight moves both" is the agent's reading of his "a last flown currency will affect
  the ip requirement and flex", stated as his. **Fixed:** P-Info ""Last flown currency" is typed … — "syllabus" the
  agent's reading of his "a last flown currency", as the app worked" [D1005].
- **B15** D980 — the scope "on a desktop" dropped. **Fixed:** P-Key "On a desktop one Tab stop takes the keys into the
  chart, …" [D980].
- **B16** D1132 — "no button changes what it does" dropped from the bar's icons line. **Fixed:** P-Bar "The bar's
  buttons wear the app's line icons — … nothing moving and no button changing what it does; …" [D1132, D1134, D919].
- **B17** D1705 — "the rest new in the same style" dropped. **Fixed:** P-Bar "Merge and Unmerge keep their words alone;
  … the Tracker's own drawn marks, the rest new in the same line style" [D1705].
- **B18** D123 r2, r4 — the reading that correcting a flight to an earlier day, or un-marking it, pulls Last Flown back,
  and that a hand-typed Last Flown is left as it was, dropped. **Fixed:** P-Mark "Last Flown is the latest day actually
  flown, …" [D123] and "The agent's readings of that, told to him: it is worked out from the flights marked done, so
  correcting a flight to an earlier day, or un-marking it, pulls Last Flown back …" [D123].
- **B19** D130 — "for the balls the edits had added" dropped after "Revert edits only". **Fixed:** P-Edit "Both happen
  at ✓ Save changes (and "Revert edits only", for the balls the edits had added), …" [D124, D130].
- **B20** D132 — "a chart import writes no mark" (the 9 Sep rule it confirms) dropped. **Fixed:** P-Imp "An import
  never deletes marks, and a chart import writes none: …" [D132, D124].
- **B21** D131 — the delete question's "in this browser" is the agent's call, stated as part of his "leave it".
  **Fixed:** P-Set "A backup does not carry deleted courses — leave it: Restore before exporting; the agent's call, told
  to him: the delete question says the course comes back "in this browser", …" [D131].
- **B22** D134 with D992 — "any second finger, however long the first had been down, means a zoom" and "in both modes"
  dropped; D992's "kept, and put back to him only if the phone will not allow it" (on the finger left down) not stated.
  **Fixed:** P-Set "The pinch's take-back stays as built: … — any second finger, however long the first had been down,
  means a zoom — … in both modes" [D134] and "Neither is re-proposed; since the phone's own scrolling the second is put
  back to him only if the phone will not allow it" [D134, D992].
- **B23** D1018 d — the drawing's "no height added" (the Info panel's course-start box in the Upchit box's place) — a
  size — dropped. **Fixed:** P-Stu "A course start is entered … changed in the Info panel, where the Upchit box was,
  with no clear cross and no height added" [D1003, D1004, D1005, D1018].

## By ruling (newest first, as the full rows)

| # | Parts → where (the page as fixed) |
|---|---|
| D1900 | magnifier the app's own, handle as long as every other box's → S P-Bar "The Tracker's search magnifier"; the shorter drawing goes → S P-Bar; handle grows under a pixel → S P-Bar; 3.1 to 3.8 px, the two paths → det; "not built yet" → S P-Bar (the host's wording, "built in chat 28 (pull request 706), not yet live", left) |
| D1860 | "Delete course" question drops typed ↺ ⇅ → S P-Del "The "Delete course" question"; the import's deleted-course note too → S P-Del; the two wordings → S P-Del; every other word kept → S P-Del; a message cannot draw a mark → S P-Del; built with the next batch → S P-Del ("built and live (pull request 696)") |
| D1861 | too-short screen (phone on its side): event lifted as high as it may go → S P-Mark "On a screen too short"; window under it, scrolling inside → S P-Mark; event in view, grade buttons first → S P-Mark; as built, nothing to build → S P-Mark; the walk's S10 figures → det |
| D1790 | window would not fit: chart slides the event up under the tabs, own smooth scroll → S P-Mark "When the marking window"; only as far as needed → S P-Mark; stays after Close → S P-Mark; window opens whole below, phone and desktop → S P-Mark; too near the end → option B → S P-Mark "An event too near"; narrowed by D1861 → S P-Mark "On a screen too short"; follows D1290 and that day's lesson → B11 P-Mark "It follows the Leave War's grid"; D984 unchanged, slide only on opening → S P-Mark "It follows"; as built 4px, 22px, no press while sliding, jump for less motion, shown once at rest (its home, the screen contracts) → S P-Mark "As built" |
| D1791 | phone ✕ empties the box and puts Find away → S P-Find "On a phone the Find ✕"; keyboard down, tabs back, as Escape → S P-Find; hover words → S P-Find; a pick puts Find away on purpose → S P-Find; desktop unchanged → S P-Find; ✕ stays in the box (D1127) → S P-Find; as built up to 1050, wider clears and keeps the keys → S P-Find "As built" |
| D1705 | typed marks become drawn line icons, as drawn → S P-Bar "Each tool of Edit chart layout"; the eleven tools' marks → S P-Bar; Merge, Unmerge words alone → S P-Bar "Merge and Unmerge"; Copy to… the copy mark, its × the drawn ✕ → S P-Bar; copy, bin, list, ✕ the Tracker's own marks → S P-Bar; the rest new in the same style → B17 P-Bar; the paths in the walk script → det |
| D1564 | his iPhone draws the three dropdowns' words whole → S P-Set "On his iPhone"; the cut words the test browser's → S P-Set; nothing changed → S P-Set; closes point (1) → spent; points (2), (3) stay open → sup D1790, D1791 |
| D1538 | no longer exported as a standalone app → S P-What "The Tracker is no longer"; lives in the app for good, a tab → S P-What; r1 replaces the 9 Sep 26 passage → S P-What "The agent's readings"; r1 no standalone copy kept working, no app parts carried → B1 P-What "The agent's readings"; r2 ordinary code, store and doorway kept till the database step and the command layer → S P-What; r3 standalone-only code with the next batch, not the clean-up → S P-What "The agent's reading too"; r4 rulings not resting on the export stand → S P-What |
| D1406 | touch screen: chart draws no bars → S P-Move "On a touch screen"; still scrolls, glides, pinches → S P-Move; Info half, Show All, windows keep bars → S P-Move; desktop with a mouse keeps chart's and Info's → S P-Move; narrows D1405's reading → S P-Move "The stray bars"; r touch screen = only pointer a finger; touch laptop with mouse keeps bars → S P-Move "The agent's readings"; r not checked on an iPad → S P-Move |
| D1405 | stray bars fixed first → S P-Move "The stray bars" (order spent, stated as history); before the keyboard fault and M4 → S P-Move; each pictured, place marked, first → S P-Move; r a bar scrolling something real stays → sup D1406 (stated as the reading on P-Move); filed → det; every other bar stays (its narrowing) → S P-Move "On a touch screen" |
| D1171 | 1051–1200 wide: bar wraps, may be 2 taller (87 to 89), as built → S P-Set "At about 1051"; lines not moved closer → S P-Set; 1536, 1050 and under, phone unchanged → S P-Set; nothing to build → det |
| D1170 | every bar control as tall as its dropdowns, 30 / 26 → S P-Bar "Every control on the bar"; bar no taller, nothing moves → S P-Bar; his word for a button's size (D487) → S P-Bar; the old heights → S P-Bar; narrowed by D1171 → S P-Set; the number's range note → det; to be built → S P-Bar (built, round 3, 21 Oct 26) |
| D1136 | desktop labels in Quals' "Viewing" small capitals — size, weight, spacing, grey → S P-Bar "On a desktop the labels"; words kept, nothing moves → S P-Bar; phone shows no labels → S P-Bar |
| D1135 | menu items and Students card wear line icons — Reorder, Duplicate, Import (+ "Import a file…"), Export, Delete, each student's × → S P-Bar "The menu items"; the bar's style → S P-Bar; nothing moves, no button changes → S P-Bar; pencils per D1134 → S P-Bar; the board's and the Leave War's marks typed until round 4 → spent (D1703) |
| D1132 | buttons wear line icons — pencils, ⓘ, ☰, ⇪, ^, the map → S P-Bar "The bar's buttons"; phone tabs joined in one box, as the Inputs tabs → S P-Bar "On a phone the Flow chart"; nothing moves → S P-Bar; no button changes what it does → B16 P-Bar; D919 the precedent → S P-Bar; narrowed by D1134 (the solid pencil) → S P-Bar |
| D1018 | built as drawn → S P-Info, P-Stu (each line below); course start in "+ Add" and the Info panel → S P-Stu "A course start"; default today → S P-Stu; window only shows → S P-Info "The window only shows"; "—" before a course start → S P-Info; one-line prompt → S P-Info; running input counts to today → S P-Info; only the six From days typed → S P-Info "That window is a copy"; member read-only → S P-Info "The flex figures and the switch"; "Legend" beside Show All → S P-Info ""Legend" sits"; the Inputs page edits → S P-Info; answers D1002–D1007, D1014 → det; r1 colour strip into the Legend → A6 P-Info "The agent's readings, drawn" (Legend); r2 "Days since syllabus" goes, currency bar full width → A6 P-Info "The agent's readings, drawn" (flex off); r3 legend words as drawn, change put to him → A6 P-Info (Legend); r4 how far a cut input first ran once its first end is kept → S P-Info "The agent's readings of that"; r5 through the people bridge, a rider, not a fourth seam → S P-Info; d "14½ days", "½ day" → A8 P-Info ""No. of Down Days""; d the cut and running rows' words → S P-Info; d no clear cross, the box above the list → S P-Stu; d no height added → B23 P-Stu; d the gear, the settings window a copy of the Inputs calendar's, Logic's switch, Cancel / Save → S P-Info; d flex off: "Currency", flex bar gone, desktop flex sentence → S P-Info "With flex off"; d legend leaves out the corner number → S P-Info (Legend readings); d phone bar two rows, desktop one → S P-Info "The phone's bar" |
| D1015 | refusal wording → S P-Imp "The import's refusal"; an older file keeps its own words → S P-Imp; not-found, deleted-chart, two-onto-one get it → S P-Imp "The not-found"; to build → spent (built, `[TRK-IMPORT-REFUSAL-WORDS]` archived) |
| D1014 | flex settings open from a settings icon in the top bar → S P-Info "The flex figures and the switch"; only an admin changes them → S P-Info; narrows D121 → S P-Who; r1 member read-only or no icon → sup D1018 (read-only); r2 which figures → sup D1018 (the six From days) |
| D1007 | legend: what each ball means → S P-Info "The legend shows"; currency a flight needs, when an IP is required → S P-Info; when a flex happens → S P-Info; flex off → its flex part goes → S P-Info; not designed, picture first → spent (D1018) |
| D1006 | flex figures editable → S P-Info "The flex figures are editable"; one switch for the whole Tracker → S P-Info; flex off → all of flex gone (bar, windows, words, legend part) → S P-Info; r1 "the flex number" = the day limits, today's listed → S P-Info "The agent's reading of today's limits"; r2 which figures, who changes them → sup D1014, D1018 |
| D1005 | every student a man on the roster → S P-Stu "Every student is a man"; down days always from the Inputs → S P-Stu; the typed box gone for everyone → S P-Stu; Last flown currency typed by the member for a non-syllabus flight → S P-Info ""Last flown currency""; moves only the IP requirement → S P-Info; a syllabus flight moves both → S P-Info; r1 "a last flown currency" read as a syllabus flight → B14 P-Info; r2 answers D1003's open point → S P-Stu |
| D1004 | the currency bar counts only days since the last currency or non-syllabus flight → S P-Info "The landing-currency bar"; down days take no part → S P-Info; "(−5 down = 5d)", "(minus down days)" removed → S P-Info; down days a figure of record, feeding no bar → S P-Info; r whether a graded non-syllabus flight moves it, checked in the build → S P-Info "The agent's reading, told"; r put to him if it does not → B13 P-Info |
| D1003 | down days count medical days since his course start → S P-Info "The Upchit Date box is gone"; a course start entered when added → S P-Stu "A course start"; half-day medical counts half → S P-Info; the typed box goes for a roster man → S P-Stu; r1 "3 typed where" his question → det; r2 a non-roster student → sup D1005; r3 the bar's subtraction → sup D1004 |
| D1002 | Upchit Date box goes → S P-Info "The Upchit Date box"; down days worked out from the Inputs → S P-Info; every medical day, ATT B included → S P-Info; a tap opens a window listing each input, dates and days → S P-Info ""No. of Down Days""; counts inputs as they stand, an upchit's cut included → S P-Info "The window only shows"; not designed, questions first → spent (D1003–D1007, D1018); today typed, shortening currency → det |
| D992 | phone scrolls chart and Info half itself — frame rate, glide, bounce, touch-to-stop → S P-Move "On a phone the chart"; pinch a picture, sharp once at the lift → S P-Move "A pinch stretches"; spot under the fingers kept → S P-Move; Edit chart layout pans as it does → S P-Move; replaces D990's step → det; mouse drag unchanged (D988) → S P-Move "Only a finger"; app's own move wins (D989) → S P-Move "Two fingers"; D134 kept, back to him only if the phone will not allow it → B22 P-Set "Neither is re-proposed"; D985–D987 met by the phone → S P-Move "On a phone the chart"; r soft until the lift → S P-Move; r up to 60 frames in Chrome → S P-Move; r the walk cannot copy an iPhone, his look the proof → spent (his look given); his look "Yes this feels good" → S P-Move |
| D989 | two fingers stop it → S P-Move "Two fingers"; pinch and take-back unchanged → B10 P-Move; app's own move stops it and wins → S P-Move; on when the phone asks for less motion → S P-Move (wording aligned, B10); Edit chart layout untouched → S P-Move; a lift opens nothing → S P-Move; less motion's reason (the guide's §5a) → det; take-back as built (D134) → S P-Set; landing stays D984's → det |
| D988 | only a finger or pen glides — phone, iPad, touch laptop → S P-Move "Only a finger"; mouse drag stops where let go, no bounce → S P-Move; trackpad and wheel the browser's own → S P-Move; checked in the code → det |
| D987 | bounces a little past an end, springs back, like the iPhone's lists → S P-Move "The glide bounces"; the one bounce the guide allows (§5, clause read) → S P-Move; his choice over none → S P-Move; r all four ends, the Info half → S P-Move; r a finger pulled past an end, the same stretch → S P-Move; r mouse never bounces → S P-Move "Only a finger"; the guide names it → det |
| D986 | a touch while gliding or bouncing only stops it → S P-Move "A touch while"; nothing opens → S P-Move; a second tap works → S P-Move; a touch going on to drag carries on → S P-Move |
| D985 | phone finger scroll of chart and Info half glides → S P-Move "The finger's scroll glides"; speeds with the finger, slows to a stop → S P-Move; built in its own chat → spent; feel, reach, what stops it → spent (D986–D989) |
| D984 | lands its event in the middle wherever it can → S P-Land "The chart lands"; never empty space above the chart's start → S P-Land; near the top sits as high as it goes → S P-Land; one body does every landing, the five cases → S P-Land "One body"; r the left edge too → S P-Land |
| D983 | two faults wait for the database step, filed → S P-What "Two faults"; import saved as many groups → S P-What; stale tab and the first order save → S P-What; not built with the batch → S P-What |
| D982 | dark words on green, amber, red → S P-Look "The Currency & flex bars"; white on grey → S P-Look; colours and words kept → S P-Look; the amber chips' recipe → S P-Look; colour and ink from one place → B9 P-Look; not built yet → spent (built, `[TRK-FLEXBAR-INK]` archived) |
| D981 | leaves every course with events to do → S P-Stu "A man deleted"; neither done (DCO, DPCO, Marginal) nor N.A. → S P-Stu; stays, record kept, where all are → S P-Stu; D299's "a course still running" → S P-Stu; r "leaves" = his place on the list → S P-Stu "The agent's readings"; r marks checked against D299 and D132 → S P-Stu; r put to him only if they pull apart → B6 P-Stu; r the test at the delete, no date → S P-Stu; not built yet → spent (`[POST-OUT-TRACKER]` built) |
| D980 | on a desktop → B15 P-Key; one Tab into the chart → S P-Key "On a desktop one Tab"; arrows follow the lines → S P-Key; Enter opens the pop-up, keyboard inside → S P-Key "Enter opens"; Escape back to the event → S P-Key; the plain blue ring, no glow → S P-Key; not one Tab stop per event → S P-Key; the build chooses where two, says so → S P-Key; not built yet → spent (`[TRK-KBD-CHART]` built) |
| D979 | attempt history = the pop-up's record (failure days, done day, who) → S P-Mark "The attempt history"; and the Failures card → S P-Mark; no second list → S P-Mark; a later grade a correction → S P-Mark; the old note closed → spent |
| D924 | built as drawn → S P-Ord; grip ⠿ not ☰ → S P-Ord "The reorder windows"; mouse drag wears the finger's look → S P-Ord; ringed row, one landing line in the gap, not a box → S P-Ord; "Drag a row, or use ▲/▼." deleted from all three → S P-Ord ""Drag a row""; each second sentence kept → S P-Ord; r only the grip drags → S P-Ord "The agent's readings, as drawn"; r the list follows at its edge (D900) → S P-Ord; r ▲ ▼ stay → S P-Ord; r the landed row's landing mark → A7 P-Ord; r Save order, Cancel unchanged → S P-Ord; d a bigger invisible grip area, no bigger look → S P-Ord |
| D922 | courses, syllabi, crew windows take a finger drag on a phone → S P-Ord "The reorder windows"; as a mouse on a desktop → S P-Ord; the app's drag look: one landing line, edge scroll (§5a) → S P-Ord; r "the same animation" = the other lists' look, nothing new → S P-Ord ("with the app's own look"); r ▲ ▼ stay → S P-Ord; r picture first → spent; r its own small job → spent |
| D899 | ball, line end, bend handle carried to the edge pan the chart → S P-Edit "The chart's drags"; at the other edge scrolls' feel → S P-Edit; fixed that night, not only put to him → spent; answers D896 → det; a fix adding a look waits for him → S P-Edit |
| D801 | the three boxes (course date, Done on, Failed on) open the one calendar → S P-Mark "The three date boxes"; a tap picks, calendar goes, no tick → S P-Mark; pop-up stays, box reads the date in words → S P-Mark; settles D798 → det; his fallback, if a tap proves too easy to get wrong, the tick, Tracker alone → B12 P-Mark; built that night → spent; r saved the moment picked → S P-Mark "The agent's readings of that: a date"; r each box keeps its own today → S P-Mark; r nothing else changes → spent; r a box that empties keeps its way to empty, no Clear → S P-Mark |
| D566 | the tapered wing, option 4 → S P-Look "The flight symbol"; sloping edges, curved lower wing, nose and tail, blue label backing → S P-Look; not the blocky or options 1–3 → S P-Look "The flight balls' labels"; ball, rings, palette, fonts, charts, details, marking kept → S P-Look "The ball's and rings' size"; no other redesign or merge authority → spent; the pictures outside the repo → S P-Look "The private pictures"; checks, read, preview → spent |
| D564 | the blocky wide wing rejected → S P-Look "The flight balls' labels"; label goal kept → S P-Look; options first → spent (D565, D566); no new shape chosen → spent (D566); the Logic and Insights work kept → spent; ball/ring size and mark/hit behaviour constraints unless he changes them → B8 P-Look "The ball's and rings' size"; the close-up private → S P-Look "The private pictures"; narrowed by D565 → spent |
| D560 | clearer labels in the blue flight balls → S P-Look "The flight balls' labels"; his proposed wider wing → sup D564, D566; no shape, size or palette approved by it → S P-Look; Impeccable as read-only advice → spent; keep D157's palette and D464's charts and details → S P-Look "The ball's and rings' size"; the collection hold → sup D563; the private reference kept local, no student name, mark or date copied → S P-Look "The private pictures"; narrowed by D564 → S P-Look |
| D474 | a syllabus one shared thing, an edit reaching every course and student → S P-What "A syllabus is one shared thing"; never a copy per course → S P-What; marks the student's → S P-What; one Syllabus row a chart → S P-What "As stored"; an enrolment one student, course, chart → S P-What; marks under enrolment and code → S P-What; moving, redrawing, re-wording keeps marks; new ball ungraded; delete removes → S P-What "Moving, redrawing"; a variant by Duplicate → S P-What; advice: no one file per save → S P-What; advice: the file a format, JSON inside a row → B2 P-What |
| D464 | his charts, syllabi, ball details kept → S P-What "His charts"; no wipe without putting back → S P-What; told first, so he can export → S P-What; r phase 5 touches a never-started store → spent; r a schema wipe never touches the Tracker → S P-What "The agent's readings of that"; r phase 5b carries every chart across → spent (merged 1 Oct 26, pull request 476); r the database step by his export, wipe, import → S P-What; the export reminder before the conversion's "merge live" → A1 (spent; the widened text gone) |
| D462 | joins group A → spent; one piece per thing before the IT side's tables → S P-What "The course list"; marks, dates, pace, lulls already one per student → S P-What; lists, courses, charts one record each, with order → S P-What; the correction told to him → det |
| D463 | an empty database starts with no course → S P-What "An empty real database"; the first person adds one → S P-What; demo course and its students never shared → B3 P-What; with the demo on it makes its course → S P-What; works with no course, a way in → S P-What ("No course yet" card) |
| D377 | his look done → spent; the chart part of his own place → S P-Own "The chart is part"; a half-typed day refused, never today → S P-Own; an empty box still today → S P-Own; r "Looks good" answers the card → spent |
| D376 | reopens on his own last course and student → S P-Own "Each person reopens"; per person, that browser, never another's → S P-Own; someone new: first course, last-graded student else the first → S P-Own; r the account's person, a rename keeps it → S P-Own "The agent's readings"; r every way of picking → S P-Own; r the admin's member view the same → S P-Own; r4 the standalone keeps one place → sup D1538; r5 the chart part of the place (D377) → S P-Own |
| D375 | a students import adds a course at the bottom → S P-Set "A students import"; existing courses keep places → S P-Set; Reorder moves it → S P-Set; not a defect, not re-filed → S P-Set; students do not travel the database route → S P-Set |
| D374 | refused in four boxes → S P-Mark "A day after today"; box goes back, one line says the day cannot be after today → S P-Mark (wording restored, A4); nothing saved, no undo step → S P-Mark; Upchit takes any day → sup D1002 (the box is gone); end dates A and B take any day → S P-Mark; narrows R50 → det; r1 Singapore's day, not the device's → A4 P-Mark "The agent's readings of that, told"; r2 the failures list's rows → A4 P-Mark; r3 a stored future day not rewritten (D56) → A4 P-Mark |
| D373 | a short screen (a phone on its side) folds into one row → A5 P-Edit "On a short screen"; the tool with its one-line hint, Fit, "Tools ▾" → S P-Edit; Tools ▾ opens the whole set over the chart → S P-Edit; a tap outside closes it → S P-Edit; note, hint line, tabs step aside → S P-Edit; upright phones and computers keep the strip → S P-Edit; r1 short = under about 500px → A5 P-Edit "The agent's readings"; r2 a choice closes the set → A5 P-Edit; r3 the folded row shows that tool → A5 P-Edit |
| D372 | pace, end dates, lulls undo steps → S P-Undo "A change to a student's pace"; ↶ / Ctrl+Z, ↷ / Ctrl+Y → S P-Undo; R110's not-undoable list stands → S P-Undo "Not undoable"; r1 two seconds one step → A5 P-Undo "The agent's readings"; r2 a lull's set, change, removal each a step, removal asks → A5 P-Undo; r3 Copy to… one step → A5 P-Undo; r4 either bar → A5 P-Undo; r4 the parallel chat told → spent |
| D371 | failures by their days, earliest plain, next X → S P-Mark "Failures follow"; − takes the latest day → S P-Mark; re-dating re-orders → S P-Mark; settles R42, R43 → det; r undated after dated, same day as recorded → A5 P-Mark |
| D370 | the card leaves out N.A. failures — chip, total, full list → S P-Mark "The Failures card"; back with their days if graded again → S P-Mark; R52 carried → det |
| D191 | no match and the box empty: OK adds the typed name, unlinked → S P-Stu "When the + Add search"; as if typed below → S P-Stu; "Nobody on the roster matches" says so first → S P-Stu; a name below wins → S P-Stu; a search still matching adds nothing → S P-Stu; no roster → the old prompt → sup D1538 (built away, pull request 637); r Enter does the same → B5 P-Stu |
| D158 | not a real-device fault, closed as the test browser's → S P-Set "The tap after a drag"; reopened only if seen on a real phone → S P-Set |
| D157 | Raptor's colours fully — backgrounds, text, event colours → S P-Look "The Tracker takes"; the seven kinds, sim to amber → S P-Look; chosen over B → S P-Look; the small build → spent (pull request 441); the phone check at a glance → B7 P-Look |
| D134 | take-back stays as built → S P-Set "The pinch's take-back"; a ball dragged on purpose and a second finger goes back → S P-Set; any second finger means a zoom → B22 P-Set; the finger left down does nothing until it lifts → S P-Set; in both modes → B22 P-Set; not re-proposed → S P-Set "Neither is re-proposed" |
| D132 | an import never deletes marks → S P-Imp "An import never deletes"; "Replace it" keeps a dropped ball's marks out of sight → S P-Imp; the old chart back brings them back → S P-Imp; the catch accepted → S P-Imp; a chart import writes no mark → B20 P-Imp; D124's wipe a Save / Revert thing only → S P-Imp; never arises on his route → det |
| D131 | a backup does not carry deleted courses — leave it → S P-Set "A backup does not carry"; demo data before the database step → det; restore before exporting → S P-Set; c the question says "in this browser" → B21 P-Set |
| D130 | deleting a ball deletes its typed details → S P-Edit "Deleting a ball"; a new ball starts with nothing typed → S P-Edit; shipped wording not typed work → S P-Edit; the same moment as the marks → S P-Edit "Both happen"; Revert for the balls the edits had added → B19 P-Edit; undo before the save brings all back → S P-Edit |
| D129 | logout with unsaved chart edits asks: Save, Discard, Stay → S P-Out; the next person never lands on a half-done chart → det; replaces the F10 interim → det; r the Logout asks, a reload or closed tab the browser's question → S P-Out |
| D128 | a deleted course can be restored → S P-Del "A deleted course"; listed in the course Reorder window with Restore → S P-Del (its ↺ → sup D1792, the drawn Reset arrow); back with students and marks, its own id → S P-Del; a wrong tap loses nothing → det; the question says so → S P-Del |
| D127 | the export remembers a deleted built-in chart → S P-Imp "The export file remembers"; stays deleted, restorable → S P-Imp; part of D120's round trip → det |
| D126 | details belong to their chart → S P-Imp "Event details belong"; one code a different sortie → S P-Imp; typed once per chart, the cost accepted → S P-Imp; settles D122 → S P-Imp "An export carries"; export each chart's edits, import only the imported charts' → S P-Imp; keeps R83 → det |
| D124 | deleting a ball wipes its marks → S P-Edit "Deleting a ball"; grade, failures, dates go → S P-Edit; a new ball ungraded, not in Overall → S P-Edit; undo before the save → S P-Edit "Both happen" |
| D123 | the latest day actually flown, whatever the order → S P-Mark "Last Flown is"; keeps R50, replaces the ratchet → det; r from the flights marked done → S P-Mark "The agent's readings of that, told to him: it is worked out"; r a correction or un-mark pulls it back → B18 P-Mark; r a briefly empty box not a day → S P-Mark; r a hand-typed one left as it was → B18 P-Mark |
| D122 | an import may reset marks → S P-Imp "An import may reset"; never wipes typed details — hours, prerequisites, crew pairing, name, type and format → S P-Imp; r the file's own edits, never the shipped wording → S P-Imp; shared or per chart, not settled → sup D126 |
| D121 | a member can do everything an admin can, the File menu too → S P-Who; Import and Export no longer admin-only → S P-Who; the Tracker reads no role → sup D1014; r only the File menu changes → det; Import after its question and one yes, Export with names when ticked, the warning kept → S P-Who; the rest of the app's roles untouched → S P-Who; narrowed by D1014 → S P-Who |
| D120 | export → wipe → import, a bug that route removes not a finding → S P-What "The route to the database"; D56 applied → S P-What "The guard"; today's stored data dropped from checks → S P-What; older converters → S P-What; older file formats → S P-What; r the round trip the one path, a current export or import losing a ball, line, position, font, name or detail the highest finding → S P-What "The highest finding"; r marking, students, dates must work for new data → S P-What; D56's guard still holds → B4 P-What "The guard" |
| D64 | narrows D62 and D63 → S P-What "The event box's hint"; the hint "e.g. Lecture, OFT/AMT, 2 x F-15" → S P-What; syllabus data and its smoke lines out of the sweeps → S P-What; the newer wins, the old rows marked → det |

## The old head, item by item

- **"Loads by itself whenever a session reads a Tracker file …, so work that strays into the Tracker … picks these up
  too"** → P-head, first paragraph, with what the `paths:` cover named.
- **The general rulings and the map** (`how-we-work.md`, `DECISIONS.md`) → P-head, third paragraph.
- **"One line per ruling … Its full row … open it before acting on a ruling's detail …", the grep, "— changed by"
  tails, "Newest first"** → the one-line shape is superseded by the page's shape (D1735, DECISIONS.md's steps for a
  converted area); the full rows, the grep and the Grep tool's limit → P-head, second paragraph.
- **"Also read"**: D1901 (design) → P-From "The design file's: in a browser that keeps nothing"; D900 (Inputs) → P-From
  "The Inputs pages'"; D881 (Leave War) → P-From "The Leave War's: the Tracker's gold"; D62 and D63 (How we work) → P-From
  "How we work: the Tracker's syllabus data" and P-What "The event box's hint"; D347 (design) → P-From "every Undo / Redo
  pair".
- **The privacy rule** — "No student name, mark or date may enter the repository", the seed data verbatim course
  content only → P-head, fourth paragraph. **Its stale reason** ("PRIVATE since 23 Sep 26 (D59)") → corrected there:
  private from 23 Sep 26, public again since 25 Sep 26 until he says otherwise (How we work's D106, D1530), collaborators
  would read it in any case; D59 (the app viewed on Vercel) no longer cited for it. The smoke suite's and the bake
  script's placeholder check comes from `raptor-port/docs/tracker/known-gaps.md`, whose own stale line the host
  corrected in the same change. "(Copied here 24 Sep 26 …)" → det (history). The rule cites no Tracker ruling: it came
  in with the Tracker (7–9 Sep 26), before the numbered rulings; D560's privacy clause (the private reference) is the
  narrower rule, on P-Look "The private pictures".
- **"Where the detail lives"** — the seams file, the screen contracts §The Tracker tab, the known gaps, the data schema
  §World 3, the data model, the smoke suite, the file map → P-head, "Where the detail lives", every pointer kept.
- **The Architecture pointer** → the page's last line, unchanged.
- **`paths:`** — the old eight entries, the same, in the same order, the block closed by `---` (checked against
  `aee0de3f2`).

## The pointers checked (the draft's 27 lines of §From other areas, and every other area's number cited elsewhere)

Every other area's number the page cites is live — none is in `DECISIONS-ARCHIVE.md` or marked replaced: How we work's
D56, D62, D63, D106, D228, D473, D487, D774, D1281, D1530, D1534, D1537, D1587; People and accounts' D292, D299, D300,
D1101, D1105; the design file's D347, D348, D672, D876, D887, D895, D926, D1122, D1127, D1134, D1509, D1567, D1607,
D1610, D1611, D1614, D1631, D1632, D1633, D1635, D1638, D1655, D1667, D1700, D1701, D1703, D1704, D1706, D1707, D1792,
D1793, D1901; the scheduler's D796, D797, D800, D824, D830, D1012, D1020, D1038, D1589; the Inputs pages' D893, D897,
D900, D919, D999; the Leave War's D881, D1287, D1290, D1404, D1449; the IT flow guide's D414. Each pointer was read
against its own area's statement — no more, no less:

- **Corrected (A2, A3 above):** the claw; the drag rule.
- **Corrected (7 more):** D672 "the Tracker's Undo moves nothing" is the agent's reading on the design page — marked;
  D1127 "the Tracker's ✕ that clears its search kept" the same — marked; the reset arrow "means "put back" wherever it
  stands" is D1700's reading, kept since he tells it apart (D1792) — marked; D1101's "one database" is the agent's
  reading on the People page, nothing built for it — marked; D1281's "added for the Tracker when it is next worked on"
  is the agent's reading there — marked, and the test named in its own words; D1287 "was put to him" — the row says the
  same rule for Quals and the Tracker "is put to him as a suggestion, not built", with no record that it was; the
  Leave War's own rule (the pinned parts stay pinned while the fingers pinch) now stated first; the scheduler's calendar
  pointer cited D824 without stating it — the plain disc, a ring only while a keyboard is on a date, added.
- **Checked and right as drafted:** D1901 (not built yet, filed); D347, D348; D1706; D1701, D926; D1134; D1122; D1567
  (the design page lists the Tracker's chart among the grids that pinch, though D1567's own row does not — the page is
  the statement); D1631, D1633, D1638; D876, D1038, D1449, D887, D1614; D900, D893, D897; D881; D796, D797, D800,
  D1012, D1020; D830 (the batch, `[LOOK-13OCT-SMALL-FIXES]`, built 14 Oct 26 and archived as done); D1589; D299, D300, D1105, D981; D62,
  D63, D64; D1587, D473; D1534 (the clean-up batch archived as done, 31 Oct 26); D1537 (marked a reading); D228; D774.
  Inline: D56 (now on two lines, D374's reading and D120's guard), D106 and D1530, D292, D796, D919, D1290 (B11), D1404,
  D487, D1509 and D1707, D999.

## The other areas, searched by subject

The full rows of every other area were searched for "Tracker" (the Leave War's "OIL tracker" set aside). Read and
decided:

- **Added (2):** the design file's **D1635** — Retry on the failed-download card reloads the app and reopens the
  Tracker by itself once he is signed in — on P-From's failed-download line; the IT flow guide's **D414** — the guide
  covers the Tracker in full, in several slides each checked in the running app — a new P-From line.
- **Read, not pointed (each general, spent or not a Tracker rule):** How we work's D493 (the Tracker's file save and
  load out of its core — built 17 Oct 26, `[TRK-FILE-TRANSFER-SPLIT]` on the reads-owed list), D495 and D568 (the batch
  order; the progress graph is D774's), D73 (no guide for a third app), D991 (frame rate as the measure — loaded every
  chat; the chart's case met by D992), D1086 and D1089 (the run includes the Tracker's checks), D1532, D1796, D353, D136,
  D137, D813, D921; the design file's D349 (cited with D347 on its own page), D1591 (the start-up claw — A2), D1615 and
  D1605 (the same); the scheduler's D66 (the window closes on a page change — a schedule rule), D807 (the 13 Oct look,
  spent — its fixes are D830), D837 (its reading that the Tracker's own notes were not in the 13 Oct wording batch —
  spent with that batch); the Inputs pages' D1023 (no Tracker part); the Leave War's D1397 (its reading "the Tracker's
  "11½ days" is another area, not touched" — agrees with A8's "14½"); OIL's D400 ("credited from the tracker" — the
  Leave War's OIL tracker).
- **No contradiction found** between a page line and another area's ruling, beyond the pointers corrected above.

## The drafter's points, answered

- **D564 restated in full by D566? — not confirmed.** D566 keeps "ball/rings/palette/authored fonts/charts/details/
  marking behaviour" but not D564's "ball/ring size" or "hit behaviour" (B8), nor the close-up's privacy (D566 names
  only its own two pictures). D564 stays live.
- **D560 to archive? — not confirmed.** Its labels goal is met by D566 and its hold is spent, but its privacy clause
  ("Retain the private reference locally, never publish it or copy student names, marks or dates into the repo") is
  carried by no later ruling. D560 stays live, cited on P-Look "The private pictures".
- **D1405 spent? — confirmed in part.** Its order is done (`[TRK-STRAY-SCROLLBARS]` archived) and its one standing
  part, "every other bar stays", is carried by D1406, whose line states it. A reader may archive it as spent once the
  host checks that P-Move "The stray bars" (history) is not needed; it stays live and stated until then.
- **D985 restated in full by D992? — not confirmed.** D992's own row says "D985–D987 stand, met by the phone's own
  glide": D985 is the requirement, D992 the means; and D988 widens the glide to an iPad and a touch-screen laptop,
  which D992's "on a phone" does not cover. D985 stays live.
- **Kept live though partly spent (D899, D377, D1003, D983) — agreed;** each keeps a standing part.
- **D1900** — left to the host. **D1860** — built and live in pull request 696, as the brief says.
- **D157** — the check was not missing: B7. **D1004** — no result found (§Left open). **D830** — built 14 Oct 26,
  its item archived as done. **D1534** — the batch ran (archived 31 Oct 26). **D1537** — marked a reading, right.
- **D981's "checked against the delete's rule and the import's"** — matches D299 and D132; the condition was missing (B6).
- **D299 with D300 and D1105** — cited because the gate asks for D299's changers; right.
- **D1018's readings (4) and (5)** — right as drafted; (1)–(3) were not marked (A6).
- **D1287** — corrected (§The pointers).
- **The privacy paragraph's reason** — right as drafted.

## Marks written

None. No full row was marked and no row moved (the brief). Nothing was archived.

## Left open (for the host)

- **D1004's reading** — whether a non-syllabus flight graded on the chart moves "Last currency" by itself, checked in
  the build: no result is recorded anywhere (the down-days spec, the evidence sheets, the screen contracts). D1005 (the
  same message: "Non syllabus flight is just an update manually by the member on the last flown currency") may answer
  it; the host decides.
- **D1018** — how the flex settings window looks with flex switched off (bands kept and dimmed?) was never drawn (the
  night-pictures brief §3); not stated on the page.
- **TRK-DOWN-DAYS-AUTO's open point** — a cancelled medical input still counts (the agent's reading, open for his look);
  not a ruling, not on the page.
- **The page's size** — 35,238 bytes after these fixes, over its 32,500-byte tripwire by 2,738 (the only failure of the
  document check); the tripwire is the host's to raise with its reason or to answer by archiving.
- **Stale text elsewhere (the drafter's list, not touched here):** the full rows still saying "to build" for work since
  built (D1900 pending its merge, D1860, D1018, D982, D981, D980, D985, D1170); D1564's row (points 2–3 now D1790,
  D1791); D1538's and D121's "Where it lives now" (§Architecture now the seams file); D374's Upchit box (gone, D1002);
  the seams file's map row "to build" for D1014 (marked by the host); `OUTSTANDING.md`'s D1900 "to build"; the design
  page's D1900 "to build".
