# A fresh Opus reader's blind read — the rules diet's step 5a, the Tracker's rulings as a page (8 Nov 26, of `05d2aeec3`)

A fresh Opus helper, blind to Astra's read, on the brief `2026-11-08-rules-diet-step5a-tracker-read-brief.md`; its report
saved whole below, unchanged.

Blind read of the rules diet's step 5a (the Tracker's rulings as a page), branch claude/rules-diet-step-5a-tracker-de959c at 05d2aeec3. Read only: I changed no file and committed nothing. I did not open any *tracker-read-astra* or *tracker-read-opus* file. My only file is a scratch script outside the repo.

Overall: the page holds up. Nearly every ruling is carried whole. There are 10 findings: one medium (two lines that contradict each other), the rest low.

## Findings, most serious first

**1. MEDIUM (close to high): D1005 against D191, on whether a student can be a typed name.**
- Page lines: "Every student is a man on the roster … the typed "No. of Down Days" box is gone for everyone [D1005]". Two lines below it: "When the + Add search matches nobody … OK adds the typed name as a new crew member linked to nobody [D191]".
- What the rows say: D1005, the later ruling (18 Oct), quotes him: "a student can't be a typed student as I'm removing this feature". Its meaning cell states as the rule "Every Tracker student is a man on the roster". Its reading (2) narrows that to the down-days box only: "no student keeps a typed box". D191 (25 Sep) is not marked as changed by D1005.
- How it stands: the app still adds a typed, unlinked student. The add code keeps "Or type a callsign". The down-days count returns "unlinked" and reads "—" for such a student. The Tracker's gaps document still says "A typed name still adds an unlinked student". Nothing in the backlog removes typed students.
- What the page says: both statements, side by side, with nothing between them. An agent following the first line would treat typed students as gone, or remove them. An agent following the second keeps them. Neither knows the question is unsettled.
- Fix: say once, plainly, that + Add still takes a typed name linked to nobody (his down days read "—"), and that whether his "I'm removing this feature" removes typed students too was read only as the down-days box. Then file that as a question for him, and mark D191's row.

**2. LOW to MEDIUM: the half-day mark, ½ against .5 (D1246, the design guide's lesson 37).**
- Page line: "No. of Down Days" reads such as "14½ days", and the window's rows read ("½ day").
- What the rows say: lesson 37 (D1246, with D1397) says a half is written as .5, never as ½. It names the Tracker's "11½ days" as another place the rule would apply, listed but left unchanged.
- What the page says: ½ as the wording of record, with no pointer. An agent applying the design lessons, as every design job must, could change the Tracker to .5 unasked, or never know the case was named.
- Fix: add a pointer under From other areas: the design guide's lesson 37 writes a half as .5; the Tracker's ½ was named there as another place and is left as it is until he says.

**3. LOW: D372, Undo "works the same from the Tracker's bar or the app's top bar".**
- What is true now: the Tracker's bar has had no Undo / Redo of its own since the standalone leftovers went (5 Nov 26, D1538, and D347). The page's own pointer, and the Tracker's header code, say the pair sits only in the app's top bar.
- The page keeps the old reading, which contradicts its own later pointer.
- Fix: "it works from the app's top bar (the Tracker's own pair is gone, D347, D1538)".

**4. LOW: D1170 with D1171, "the bar growing no taller".**
- D1171 makes an exception: on a narrow desktop the bar wraps and grows. The page states that exception only lower down, in Settled, but cites D1171 on the main line, which states the rule without it.
- Fix: add "except where a narrow desktop wraps it (below)" to the main line.

**5. LOW: D1790 option B, the event too near the chart's end.**
- Page line: "falls back to the page's option B: nothing moves, and the window is held between the tabs and the event, its lower part scrolling inside".
- The as-built record in the screen contracts document reads "the window stands above the event (whole where it fits, else between the chart box's top and the event, scrolling inside)". The page drops "whole where it fits".
- Separately, not the page's fault: D1790's own words cell describes option B as "the window opening below the event, part of it out of sight". That disagrees with the pictures-round notes, where B is "nothing moves; the window is held between the tabs and the event". The row should be corrected.
- Fix: add "whole above the event where it fits" to the page line, and correct the row's description of B.

**6. LOW: D1791, "on a desktop nothing changes".**
- The page states this as his rule, then "As built: … up to 1050 wide". So a narrow desktop behaves like a phone, which is wider than "on a desktop nothing changes".
- The page does not say whether that widening was named to him.
- Fix: mark the 1050 line "the agent's reading, as built (a narrow desktop behaves as a phone)", and say whether he was told.

**7. LOW: D1006, "The agent's reading of today's limits".**
- What the row says: the agent's reading was of what "the flex number" meant, namely the day limits. The list (under 7 days current … beyond, a re-course) is today's default figures, which an admin can change since D1014 and D1018.
- What the page says: the figures themselves are labelled "the agent's reading". That makes the defaults sound like a guess, and they read as fixed.
- Fix: "Today's default limits, which an admin can change: … (the agent's reading of 'the flex number' as these day limits)".

**8. LOW: the page's size limit in the document check, and the reason given beside it.**
- The reason says "about 70 pointers to other areas were found by subject".
- What is true: the page has about 30 pointer lines, citing about 70 rulings. Only about two were added by the search by subject.
- Fix: reword, for example "about 30 pointers to other areas, citing about 70 rulings".

**9. LOW: D1405, citation only.**
- The page line names "the iPhone keyboard fault" but cites only D1405 and D1406. The row names D1366.
- Fix: add D1366 to that line.

**10. LOW: other areas' phone rules not pointed to.**
- Four of the scheduler's app-wide phone rules apply to the Tracker's windows and notes but are not pointed to from the page: windows stand in the middle of the screen (D997); nothing jumps when the keys open (D1081, D1412); a passing note takes the full width (D828); D686.
- They do reach a chat working in the Tracker's code, through the screen-design page, which loads with every file of the app's code. They do not reach a chat working only on the Tracker's documents or scripts.
- Fix: one From other areas line for D997, D1081/D1412 and D828, or a note that the screen-design page carries the app-wide phone rules.

**Two notes outside the page:**
- The backlog is stale on two items. Its lines for [TRK-KEPT-COPIES] (the magnifier, D1900) and [TRK-NOSTORE-SAVED] (the "Not kept" band, D1901) still say "to build". The code and pull request 706 show both built, and the page rightly says built. The backlog should be marked.
- A cancelled medical input still counts toward the down days. The finished backlog item for the down days left that open for his look, and no live backlog item carries it. The page's "it counts the inputs as they stand" neither says so nor points to the open point. A low gap: file it, or add a line saying it is open for his look.

## The account itself
I used it as a map and checked it. It covers 72 rulings and 466 parts, and its **Fixed:** notes match the page. It maps D1005's and D191's lines as stated without noting that they clash (finding 1). It does not list lesson 37's naming of the Tracker's ½ (finding 2), nor the as-built "whole where it fits" (finding 5). Its count of 466 matches its table. I found no part it marks as detail, superseded or spent that is a live requirement, apart from findings 1, 3 and 5.

## The page's own claims and the small edits
- The head is true: when the page loads, that the full rows are searched with the shell, and where the detail lives. The rule that no student name, mark or date enters the repository is stated, and its reason now says the repo has been public again since 25 Sep 26 (D106, D1530).
- Settled holds only as-built answers, and nothing open is presented as settled. D1900 and D1901 are rightly said built (chat 28, pull request 706).
- The other pointer lines are each true of their own area's line today. That includes the design file's Undo and the "Not kept" band, the Inputs pages' drags, the one gear and calendar, the pencils, and People & accounts.
- The page's list of files it loads with is unchanged and closes properly, so it loads exactly when the table did.
- The small edits all say what is now true: the head of the main rulings map, AGENTS.md items 4 and 5, the two map rows in the project guide, the head of the Tracker's full-rows file, and the D1014 "built" mark on the architecture file's map row. All six areas are named as pages, and the scheduler, the Inputs pages and the Leave War are still in short lines. The size limit's reason is the one exception (finding 8).

## What I checked, and what I found whole
I read all 72 Tracker rulings' full rows, all three cells, against the page, using the account's 466 parts as a map. Where a row's home named a document, I opened that part: the screen contracts document for D1790 and D1791 as built; the pictures-round notes; the night-pictures brief for D1018's drawings; the down-days design for D1003 and D1005; the design guide §5 and lesson 37; the glide mock-up for D985 to D992; DateBox for D801. I also checked the add and down-days code and the Tracker's header code. I searched every area's rulings, architecture files and full rows by subject (down days, medical, half days, cancelled inputs, Undo, search magnifier, gear, pencils, menus, drags, the "Not kept" band, phone windows, keyboard, privacy).

Found whole:
- The changed chains: D1790 with D1861 (main and as-built lines), D1132 with D1134, D1135, D121 with D1014, D1003 with D1004, D1002, D1007, D1014, D1018, D1015, D560 with D563, D564, D565, D566, D985, D986, D987 (the guide's one bounce, clause by clause), D988, D989 (the glide page's five calls), D992, D922, D924, D899 with D895 (the guide's drag rules, clause by clause), D62, D63, D64, D376 with D377, D370, D371, D979, D981 with D299, D300 and D1105.
- Import, export, delete and restore: D122, D124, D126, D127, D128 with D1792, D130, D131, D132, D375, D1860 (pull request 696; the words checked against the code's "Delete course" question).
- The rest: D1900, D1901, D1705, D1564, D1538 (pull request 637), D1406, D1136, D1007, D1004, D984, D983, D982, D980, D924, D801, D474, D464, D462, D463, D374, D373, D158, D157 (pull request 441), D134, D129, D123, D120.
- Whole apart from the finding named: D1005 and D191 (1), D372 (3), D1170 and D1171 (4), D1791 (6), D1006 (7), D1405 (9).

Rulings: none this session (a read-only review).
