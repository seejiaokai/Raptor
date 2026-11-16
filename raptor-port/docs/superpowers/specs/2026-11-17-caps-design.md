# Caps and ops limits — design, round 1 (17 Nov 26)

`[CAPS-OPS-LIMITS]`, design only: nothing of the app is changed. Drawn on the night of 17 Nov 26 by a helper of the
overnight run, unattended, so nothing here is ruled by this round; every choice below is a recommendation put to him.
The old design start (`2026-10-05-caps-ops-limits.md`, D567) is cancelled history (D568) and is not built on.

- **Questions page:** `raptor-port/docs/mock/2026-11-17-caps-r1/page.html` (published by the coordinator); revised the
  same night after a fresh reader's look (Q4's Ops limits, Q7 and Q8 added, the marks renumbered to match each
  question, the platform flag rewritten).
- **Pictures:** `raptor-port/docs/img/2026-11-17-caps-r1/`, captions in its `manifest.json`; drawn by
  `raptor-port/docs/mock/2026-11-17-caps-r1/draw.mjs` on the real app (demo week Jul 13 – Jul 19), today beside
  proposed, desktop and phone.

## What is ruled

D2084 (16 Nov 26), his words: "It's basically like u fill in form at the start of the week and it clears automatically
every week. And 1 button u can click to see who has completed it. Especially those flying. And then click to toggle off
the check." Ruled from it: a weekly form, cleared by itself every week; one button showing who has completed it, those
flying above all; a click that switches the check off. Its home is the scheduler page, §Not built yet. Order of work:
second, after the multi-squadron design, with the schedule area's small fixes (D2086).

## What his squadron uses today (his example, described in words only)

He sent the link to his squadron's current page. Its address is never written into the project, and its results page
holds real callsigns, which are kept out too.

- A web page titled "142 e-CAPS": a link to an "Ops Limit" page at its top and the line that it can be submitted from
  Saturday. Emergency procedures as headings in capitals (fire during start or ground operation, abort, bleed air
  caution with its cases, positive g out of control recovery, negative g, loss of brakes and others); under each, pairs
  of empty boxes, item and action, typed from memory, sometimes with fixed words between them ("(if app)", "(as req)").
  Then "Check Answers"; a greyed callsign box and Submit that work only once the answers are right; a link to check
  who has submitted.
- The Ops Limit page: tables of numbers typed from memory (engine temperatures, RPM and oil pressure on the ground and
  in flight; landing gear and flap speeds and g; canopy; tyres; start times; fuel warnings; crosswind; negative g),
  with the same Check Answers, a callsign-only box and Submit.
- The results page: two tables, CAPS and LIMITS, each a name and the date done, a refresh, the time the data is
  correct as at, and a count of each (17 and 38 when seen). The CAPS dates all fell in the week of 13–16 Nov; the
  LIMITS dates ran from 30 Oct to 15 Nov — Ops limits looks like a longer cycle, so Q3 asks.

## The open points and the questions put to him

| # | Question | Recommendation | Other choice |
|---|---|---|---|
| Q1 | What does the form hold? (D2084's open point 1) | His squadron's two tests kept in the app with their right answers, laid out as today: two tabs, headings, paired boxes, Check answers (wrong boxes red, a count left to fix, the answer never shown), Submit dimmed and not pressable until all are right; an admin keeps the questions and answers | A plain "Done" tick, no test in the app |
| Q2 | Who must fill it in? (open point 2) | Every pilot and WSO on the Quals page, students included; not ground crew or guests; the list shows those flying this week first | Only those flying this week |
| Q3 | Does Ops limits clear every week too? | Each test its own period on the Logic page: CAPS every week (his ruling), Ops limits every month; he is asked what it is today | Both every week |
| Q4 | Does a flyer not done raise anything on the schedule, and does Ops limits count too? (open point 3) | Yes, for either test: the amber advisory — the ring on his puck, a line in the day's warning list that reads on its own (D2045), "CAPS not done" or "Ops limits out of date", the day's issues count up by one (the red "warnings" figure unchanged: an amber line is not one); never stops a publish; switched on or off on Logic, listed with the checks | CAPS only; or nothing on the schedule, the list only |
| Q5 | What does "toggle off the check" switch off? (open point 4) | One man for this week (a switch on his row; "Not checked"; on again next week), with Logic's switch for the whole squadron as every check has | One switch for the whole week; the third meaning, Logic's switch alone |
| Q6 | Where does a person open it? | "CAPS" just after Insights on a desktop's top bar, so Insights keeps its place beside the bell (D481, D854); still one row on a scheduler's Edit Schedule bar at 1536 wide; "CAPS and Ops limits" after Insights in the ⋯ menu on a phone; a bell line when the week opens and before he flies if not done | A page of its own among the page names |
| Q7 | On a day already published, does the amber line show? (the test opens on the Saturday, often after the coming days are published) | Live, as the qualification warnings are today (D179 as narrowed by D183–D185): shown on the published face, judged by today, never making the day pending, the sign-offs kept (D45, D103); on a Saturday morning most of Monday's flyers show amber until they submit | Frozen until the next amendment |
| Q8 | Can members see who has done it? (his current page lets anyone with the link see) | Yes, to read only: the Q2 list without its switches | Schedulers only |

Answer only if he disagrees: R1 the not-done flyers first, in amber; R2 the week's test opens the Saturday before, as
today; R3 no callsign typed, since he is signed in; R4 (the agent's reading, not ruled) a man on leave or an overseas
duty the whole week is not checked that week, by itself.

## Platform flag (D1551)

Checking the answers in the app sends the right answers to each person's phone: anyone who knows how can read every
right answer, so passing proves less. The likely way to check out of sight is an automatic flow inside the IT side's
own Power Platform using Dataverse's own connector (not an outside connector), comparing his answers with ones members
cannot read and recording the result; the IT side allows no add-on code on their server (D1749), so whether that flow
is allowed is asked of them at the database step. How his current page checks answers is not known. The bell shows
only inside the app; reaching his phone when the app is closed needs the IT side. Clearing every week needs no
deletion: each submission carries its week.

## Where it would touch the app

The top bar and the ⋯ menus (Edit Schedule, View-only Sched, the board's bar); the warnings (a new amber check, its
line, the puck ring, the day's count, the Legend's flags); the Logic page (a settings card and a check); Quals (who must
do it); Insights (its neighbour, its window reused); the bell (new lines, `notifications-register.md` when built);
publishing (never stops one; live or not shown on a published day's face, never pending — Q7); Undo (a
switch is undoable, a submission is not); the Leave War and Inputs (R4); Admin (the tests' editor); two squadrons (the multi-squadron design, already under way: each
keeps its own tests); the database step (two tables: the tests with their answers, the submissions with their week).

## Not drawn

The bell's lines (the demo's bell is empty, nothing real to draw from); Ops limits' table layout and the admin's editor
(drawn once Q1 is answered); a member's view of the list (once Q8 is answered); his squadron's current page (holds real names; described in words above).

## Shape brief (impeccable `shape`, no human present — every assumption marked as one)

- **Job:** a member proves each week he knows his emergency procedures and limits; a scheduler sees at a glance who
  flying this week has not, and can excuse one.
- **Mode:** Operate. **Direction:** the app's own parts only — Insights' window, Quals' table and seat switch, Logic's
  card, switch and check row, the warning list's amber line, the puck's amber ring; no new colour, no new mark.
- **States:** not started, partly filled (a count), checked with wrong boxes, all right (Submit lit), submitted (a
  date), excused (Not checked), and, for the scheduler, an empty list (assumption: "Everyone has done it" in its place).
- **Keyboard (assumption, for the build):** Tab through the boxes in order; Enter on the last box runs Check answers;
  Escape closes the window, the keys back on the button that opened it.
- **Words:** the app's names ("CAPS", "Ops limits", "Not done", "Not checked"); the boxes' words in the pictures are
  made up and are not the squadron's procedures.
