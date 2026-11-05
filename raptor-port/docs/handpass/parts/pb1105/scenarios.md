# [POSTOUT-RUN-NOTICE] — what the walk did not cover (fresh scenario designer, 5 Nov 26)

The feature: the line in every admin's bell when a man's posting out runs on its date (D1546, D1547, D1690, D1691).
Read for this list: the walk `scripts/handpass/pbw-walk.mjs` (A0–B13, all 52 checks passed at both sizes, no errors), its log,
`src/leavewar/postout-notice.test.ts`, `src/ui/postout-landing.test.tsx`, the drawing script
`docs/mock/2026-11-05-postout-bell/draw.mjs`, the order's §7.0, §7.0a, §7.4, §7.10, §7.11, and — only to find states the
walk never reached, not to review it — the branch's own change to the bell, the posting pass, the Users list and the
Admin page.

Not a finding (D56): harm that lives only in demo data already stored, where the code is right going forward.

## What the walk covered

One world, one path: four men posted out for Mon 16 Nov from **today**, then the app **opened fresh at 08:00 on 16 Nov**.
Covered: the four lines and their words, order, unread state, one line of words each; Ranger's tap from the week
(Archived fold opened, ring in view, ring gone after 6 s); Cinch's and Cobra's taps from Admin → Users itself; Trident's
from the Leave War (opens nothing, line read); Mark all read; the list closed by the bell, Escape (desktop) and a tap
outside; a reload; the member view (desktop only); Hex's own unread lines; a member's empty bell. Phone taps were
pictured right after the lift.

Not driven by any walk step:
- the clock passing midnight with the page open;
- a posting dated today (it runs inside Post out);
- either Undo;
- a held posting;
- moving a posting, or changing its outcome;
- the man's state changing after the line was written;
- a tap from any page except the week, Admin → Users and the Leave War grid;
- an admin who was part-way through something on Admin → Users;
- smooth scrolling. The walk forced `scroll-behavior:auto` and froze the clock, so the row is never seen arriving the way
  his phone would draw it.

## The 22 lessons (§7.11), for this feature

| # | Lesson | Covered by | Or needed / why it cannot apply |
|---|---|---|---|
| 1 | One state only | B2 unread, B5a read, B10 after reload, B12 a second admin | **S4, S7, S12** — the line once the man or the posting has changed since (restored, renamed, deleted by hand, posting undone or moved); an admin made after the run |
| 2 | Gesture at one speed | — | **S13** — the bell list scrolled on a phone by a swipe that starts on a posting line, quick and slow |
| 3 | Feedback never looked for | B1 bell lit, B3 ring, B7 line read | **S11** — lines past the list's foot (the 30-line cut, more below); **S3** — the bell lighting at once after a Post out dated today, with no reload |
| 4 | Press behind an open window | B9c — a tap on blank page only | **S8** — with the list open, press a real control behind it (a grid box, a tab): does it both act and close the list, and does what lights match? |
| 5 | Box brought into sight, never checked against what stands over it | B3d — the top bar and one point at the row's top-left | **S9** — the screen's foot, the Users list's sticky heading and search, the Archived fold's heading; the last archived man and the first roster man |
| 6 | Only the real phone draws it | — | **S9** — the scroll to his row is the phone's own scroll; the walk turned smooth scrolling off. Goes on his look card |
| 7 | Model of a phone motion | — | Cannot apply — nothing here steers a motion frame by frame |
| 8 | Drawing not held beside the build | — (the walk's pictures only) | **S11** — the drawing check of the bell's lines and of the landing against the drawing of record, at both sizes (D1495) |
| 9 | List alignment judged by eye | B2c — one line of words | **S11** — name, day, words and age measured across posting lines mixed with war, holiday and OIL lines; a long callsign; wider letters forced |
| 10 | A way back walked only straight | — | **S8** — after the landing, back to the page he left by its tab: drawn at once, without a touch, in WebKit, first frame pictured |
| 11 | Reading that depends on what fits on screen | — | **S9** — "his row in view" at a 700px-tall laptop window, a phone on its side, and 2560 wide |
| 12 | Window opened from one page only | Week (B3), Admin (B5, B6), Leave War (B7) | **S8** — every other page and window the bell is open over |
| 13 | Pinch at a list's top only | — | Cannot apply — no pinch on the bell list or Admin → Users |
| 14 | Boxes left off the keyboard walk | — | Cannot apply as a keyboard walk — no new box. The typed boxes of Admin → Users are in **S2**, which is about losing what was typed |
| 15 | Pinned bar judged by place, not fill | — | **S9** — the ringed row scrolled under Users' pinned heading: the heading stays solid in front |
| 16 | Warning cleared only by a new value | — | Cannot apply — no box and no warning |
| 17 | A control that changes a page's width, at rest | — | **S9** — the landing opens the Archived fold: the page stays no wider than the screen on a phone, and the fold closes again by his own tap |
| 18 | Only a real print draws it | — | Cannot apply — nothing prints |
| 19 | Window over window, never closed | B9 — list closed three ways over a bare page | **S8** — the list open over the one-day sheet, a person window, an input window: closed each way, and the window under it left as it was |
| 20 | Gesture walked once, slowly | — | **S13** (the swipe on the list); no other gesture |
| 21 | Test browser's touch taken for his phone's | — | **S13** and his look card: a tap on a line and a scroll of the list on his own iPhone |
| 22 | Judged "shown" by being there | B3c reads the ring's style; B1 reads a class | **S9** — the ring's pixels counted in the row's box on the first frame and at 5.9 s; the bell's dot counted |

## The missing scenarios — most likely to find a real fault first

Sizes: **D** = his PC, 1536 × 864, Chromium. **P** = his iPhone, 402 × 874, WebKit with touch, with a picture within about
100 ms of each lift as well as the settled one (§7.10). Every world is built through the app's own controls (§7.7). Use the
drawing script's way in: sign in as Saber (`ad`), post out from the Leave War's one-day sheet (⋯ → Post out), and move the
browser's clock.

### S1 — Midnight passes with the page open (D, P)
**Why first:** the posting pass and the "off the manpower" line are worked out only when something in the app changes. The
only clock that notices midnight belongs to the Leave War page, and that page may never have been opened in the session.

**Steps:**
1. Post the four men out for Mon 16 Nov, as A does.
2. Set the clock to Sun 15 Nov 23:58. Open the app on **Edit Schedule**, with the Leave War never opened in this session.
   Touch nothing.
3. Let the clock pass 00:00, then wait 2 minutes.
4. Repeat with the Leave War page open. Repeat on the phone with the page hidden across midnight, then shown again (the
   phone wakes).

**To pass:** within about a minute of midnight, with no touch, the bell is lit. Its list holds the four lines, Mon 16 Nov.
Admin → Users shows Ranger in Archived and Trident gone. Ranger's sign-in is refused (try it in a second window). If the
bell stays dark until a click somewhere, that is a finding: "nobody is gone silently" (D1546) fails for the admin who leaves
his PC on.

### S2 — The tap throws away typed work on Admin → Users (D, P)
**Steps:**
1. On 16 Nov, open Admin → Users.
2. **Case a:** type a callsign and a name into the add-person form, but do not save.
3. **Case b:** open Hex's row and change his role, but do not save.
4. **Case c:** open Ranger's own archived row and type a new callsign in "Restore as".
5. In each case, open the bell and tap Ranger's line.

**To pass:** what he typed is still there, or the app asks before discarding it. A silent loss is a finding. The tap now
redraws the Users list from scratch, which empties the add form and closes any open row.

Also tap the line from the **same** page twice in a row. The second tap must not undo anything the first left open on
purpose.

### S3 — A posting dated today: it runs inside Post out (D, P)
The walk never drove this path; only a unit test covers it.

**Steps:**
1. On the Leave War, open Ranger's box for today (Thu 5 Nov), then ⋯ → Post out, keep Overseas Sqn lit, and confirm.
2. Do the same with Delete (and its second confirm) for a second man, and with SANS for a third.

**To pass:**
- After each confirm, with no reload, the bell lights at once.
- The list shows "Ranger · Thu 5 Nov / Posted out · archived, account suspended", unread and first.
- Saber is told; Hex too, when he signs in.
- The sheet closes. The grid shows the posting starting today.

**Then:**
1. Press the **top bar's Undo**.
   - **To pass:** it refuses with its message, D350, and nothing changes.
2. Open the sheet's own **Undo post out** for Ranger.
   - **To pass:** Ranger is back on the roster and his sign-in works. The line **stays** as a record.
3. Tap the line.
   - **To pass:** Users opens at his **roster** row, ringed. The Archived fold does not open.
4. Reload.
   - **To pass:** the same line, read.
5. Post him out again today.
   - **To pass:** a second line, not a duplicate of the first and not one that replaces it.

### S4 — "Off the manpower" after its date: undo it, move it, change its outcome (D, P)
**Why:** this one line is worked out from the stored posting each time, not stored itself, so it follows every later change
to the posting. The other three lines are stored. This asks whether all four behave as one kind of record.

**Steps:**
1. On 16 Nov, read Cobra's line.
2. **Case a:** use the sheet's "Undo post out" for Cobra.
3. **Case b:** move his posting to Tue 17 Nov.
4. **Case c:** move it back to 16 Nov.
5. **Case d:** change the outcome chip from none to SANS.

**To pass:**
- **Case a:** the line stays, the way the three stored lines stay after their Undo (S3). If it vanishes, put it to him beside
  S3's picture as a difference between two lines that look alike.
- **Case b:** no line today. A new unread line dated 17 Nov on 17 Nov. Nothing doubled.
- **Case c:** the line comes back unread. Say whether it should.
- **Case d:** exactly one line for Cobra, saying "now SANS". Never both lines.

Reload after each step.

### S5 — Opened days late, and two runs on two dates (D, P)
**Steps:**
1. Post Ranger and Cobra out (Overseas, none) for Mon 16 Nov, and two more men (Delete, SANS) for Wed 18 Nov.
2. **Case a:** first open the app at **Thu 19 Nov 08:00**.
3. **Case b:** open it at 16 Nov 08:00, read everything, then open it at 18 Nov 08:00.
4. Then move the clock to Mon 30 Nov and to Tue 1 Dec.

**To pass:**
- **Case a:**
  - Each line carries its own date (Mon 16 Nov, Wed 18 Nov).
  - The 18 Nov lines are above the 16 Nov lines, or the order is otherwise one he would read as newest first. The pass sorts
    one run by outcome only, so the two dates may come interleaved.
  - Cobra's line, timed at midnight on 16 Nov, is still with the posting lines rather than below that morning's other news.
  - The age text is right for each line.
- **Case b:** the 18 Nov lines arrive unread above the read 16 Nov lines. Nothing from 16 Nov is told again.
- **30 Nov:** all lines are still there.
- **1 Dec:** Cobra's line is gone, the stored lines stay, and the unread count and the bell agree.

### S6 — A held posting, later released (D, P)
**Steps:**
1. Make Saber the only admin who can sign in. Set Hex's role to member on Admin → Users.
2. Post Saber himself out to an Overseas Sqn for 16 Nov.
3. On 16 Nov, open the app as Saber.
4. Make Hex an admin again.

**To pass, after step 3:**
- No posting line.
- Saber's Users row shows why it waits.
- The bell is not lit by this posting.

**To pass, after step 4:**
- The posting runs at once and Saber is archived. Picture what Saber's own open session then shows. He is signed in while
  his account is suspended, and that must not end in a broken page.
- Hex signs in and sees "Saber · Mon 16 Nov / Posted out · archived, account suspended", unread.
- Saber is told nothing about himself.

**Repeat** with a Delete held because the last admin is the man posted out. The release must give "deleted", once.

### S7 — The man has changed since his line was written (D, P)
Start from the 16 Nov world, then change each man by hand on Admin → Users or Quals:

| Change | Then tap his line. To pass: |
|---|---|
| Restore Ranger | Roster row ringed, in view; Archived fold not opened |
| Restore Ranger as "Viper" | Line reads Viper (today's callsign) everywhere it shows; tap rings Viper's row |
| Rename Ranger while archived (Save name) | Line follows the new name; tap lands in Archived |
| Delete Ranger by hand from Archived | Line stays, opens nothing, list stays up — as Trident's |
| Post Ranger in again with a later date | Lands on his row with its "posting in" tag, ringed |
| Take Cinch off SANS in Quals | Line still says "now SANS" (history); tap rings his row |
| Archive Cobra by hand | Tap opens the Archived fold at his row |
| A new man added with Trident's old callsign | Trident's line still opens nothing; the new man is never ringed by it |

Each case: a picture of the list and of the landing.

### S8 — The line tapped from every page and over every window (D, P)
Open the bell and tap Ranger's line from each of these:
- Edit Schedule with an input's window open;
- View-only Sched with a person window open;
- Quals;
- Inputs;
- the Leave War grid with the one-day sheet open;
- Balances;
- Approvals;
- the Tracker;
- Admin → Data. On the phone, be drilled into Data.

**To pass, from each place:**
- Users is chosen, his row is ringed and in view, and the list is closed.
- The window that was open is either closed cleanly or still there as it was when he returns. Never left open over Admin.
- Then return by the page's tab. The page is drawn at once, without a touch, at the place he left it (lesson 10; WebKit;
  picture the first frame).

**Also, with the list open over each window:**
- Close the list by the bell, a tap outside, and Escape (desktop). The window under it must still be there, unchanged.
- Press a real control behind the list, such as a grid box or a tab. It must not both act and leave the list open, and what
  lights must match what then opens.

### S9 — The landing as his phone draws it, at sizes that change what fits (D, P, plus short screens)
**Steps:**
1. Repeat B3 and B5 **without** the walk's `scroll-behavior:auto` and without stopping time.
2. Take pictures at the lift, at 300 ms, and settled.
3. Count the ring's blue pixels in the row's box on its first drawn frame and again at 5.9 s. Count the bell's unread dot
   the same way.
4. Repeat for:
   - the **last** archived man (the list cannot centre him);
   - the **first** man on the roster;
   - a 1536 × 700 window;
   - the phone on its side, 874 × 402;
   - 2560 wide, and his PC with the page zoomed out.
5. After landing on the phone, measure the page width against the screen. Tap the Archived fold shut.

**To pass:**
- The row settles fully in view. Nothing stands over it: not the top bar, not the screen's foot, not the Users heading,
  search box or the fold's heading.
- The pinned heading stays solid in front.
- No sideways scroll on the phone.
- The fold closes.

Put the phone's real scroll on his look card (lessons 6, 21).

### S10 — The ring's lifetime (§7.4) (D, P)
Each case must leave exactly one ring, on the right row, ending 6 s after the **latest** tap:

1. The same line tapped again at 3 s.
2. A different line tapped at 3 s, with its row in the other group.
3. His row opened, by tapping the row itself, while ringed.
4. Leaving for the week at 2 s and coming back by the Admin tab at 4 s.
5. Restore pressed on Ranger while his row is ringed, so the row moves from Archived to the roster.
6. Mark all read while a ring runs.

A ring that never ends, or one left on the earlier row, is a finding.

### S11 — The list measured and held beside its drawing (D, P)
**Build the bell:** one admin's bell with the four posting lines plus a Leave War line, a holiday line and an OIL line. Use
a long callsign. Add more than 30 lines in all, by filing inputs that tell him.

**Measure:**
- At both sizes, each line's name, date, words and age against the same columns on every other line, in every kind of line.
- The same again with wider letters forced from the first paint (the Leave War tests' wide-letter switch). His iPhone draws
  wider letters.
- Scroll the list on the phone.
- Run the drawing check of the bell's lines and of the landing against the drawing of record
  (`docs/mock/2026-11-05-postout-bell/`) at both sizes (D1495).

**To pass:**
- Every line keeps its words on one line, with nothing cut.
- Something tells him there is more below the list's foot (lesson 3).
- With more than 30 lines: the newest posting lines are among the 30 shown; Mark all read reads the ones past 30 too; the
  bell goes out.

### S12 — Who counts as "every admin", in each view (D, P)
1. **Phone member view:** switch the phone to the member view (B11 was desktop only).
   - **To pass:** the lines are gone and the bell is out if they were the only unread. Back in the admin view they return,
     read or unread as left.
2. **A new admin:** on Tue 17 Nov make Outlaw an admin, then sign in as Outlaw.
   - The three stored lines were sent only to the admins of 16 Nov. The worked-out "off the manpower" line shows for any
     admin. Picture what Outlaw sees, and put any mismatch (one line out of four) to him as a reading.
3. **An admin demoted:** demote Hex to member after the run.
   - **To pass:** his posting lines are no longer listed and the bell is not lit by them.

### S13 — Touch on the phone's list (P)
1. Swipe the list starting on a posting line: once as a quick flick, once as a slow drag, once as a short hold and then a
   move.
   - **To pass:** the list scrolls and nothing opens.
2. Reopen the list after a landing.
   - **To pass:** the line tapped last shows no pressed or hovered tint. Look in the after-lift picture, the state an iPhone
     keeps.
3. Take the after-lift picture for Mark all read and for the bell button.

Name the real-iPhone check on his look card (lesson 21).

### S14 — Two admins at once (D)
Open two browser windows on one store: Saber in one, Hex in the other, with the page left open in both across the run of S1.

**To pass:**
- Each bell lights for its own admin.
- Reading a line in one window does not read it for the other.
- Saber's "Undo post out" in his window leaves Hex's line as a record in Hex's window after his next change or reload.
- No line is written twice, even though both windows run the pass.

### S15 — The plain-user round (D1557) (D, P; required on top of the above)
Saber's everyday task, start to finish, pressing every control that opens or closes something.

**Today (5 Nov):**
1. Open the Leave War, choose the NOV month, tap Ranger's 16 Nov box, then ⋯ → Post out.
2. Read the sheet's line ("On 16 Nov: archived, account suspended.") and confirm.
3. Close the day sheet by its ✕. Reopen it and close it by Escape (desktop) and by a tap outside (phone).
4. Look at, and picture:
   - the grid marking his posting from 16 Nov;
   - Admin → Users, where his row reads "posting out 16 Nov · Overseas Sqn";
   - his person window, opened from View-only Sched, saying the same.

**On 16 Nov:**
1. The bell is lit. Open it and tap Ranger's line. Users opens with his row ringed in Archived.
2. Tap his row: the Restore panel opens. Close it again.
3. Go to every other place that should show the result:
   - the **Leave War** grid, where his row ends on 16 Nov, and **December**, another period, where he is absent;
   - **Quals**, where Ranger and Trident are off the list and Cinch is under SANS;
   - **Edit Schedule**, the week of 16 Nov, where Ranger and Trident cannot be picked from the 16th, and the week before,
     where their days keep their pucks (the sheet's words for Trident: "Days he flew keep his puck");
   - **View-only Sched**, where Cinch's person window shows SANS;
   - **Admin → Users**, where Cobra's row reads "posted out 16 Nov" and Cinch's "posted out 16 Nov · SANS".
4. Find the door to Ranger's posting sheet's **Undo post out**, now that he is archived. If no door reaches it from the grid,
   that is a finding.
5. Use the Undo. Ranger is back. The bell line stays. A tap rings his roster row.
6. Close the bell by each of its ways.

Picture every step, at both sizes.

## Note for the closing report

S2, S4 (case a), S5 (the order of two dates) and S12 (a new admin) may prove to be design questions rather than faults.
Each is to go to him with its picture and a recommendation (D853, D1625 — an answer that adds anything he will see is
drawn first).
