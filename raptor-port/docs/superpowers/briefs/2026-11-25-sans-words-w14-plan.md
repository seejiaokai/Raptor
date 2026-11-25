# w14 walk plan — the SANS words and rules (round 7), on the build after fix rounds 1–5 and main brought in

Planned by a fresh Opus helper for chat 174, the night of 24–25 Nov 26. Plan only: nothing walked, built or changed in
the repo. Build to walk: branch `claude/allavail-sans-postout-141` at `e80742fc5` or later (pull request 825), which holds
the fixes `0eaacc411` (W11-1), `f73602f9f` (round 1), `2391f9dfa` (round 2), `0e59ea5f3` (round 3, D2560),
`264a1f3d4` (round 4), `1d2ed3415` (round 5, D2564), `41c811259`, `330ded7df`, and main's words pass (`f3f0e7388`, D2521).

## 0. Read this first — three facts that change what the old walks proved

1. **Every reminder day in w11–w13 was made with a Ground Programme row** (`swd-w11-lib planRow`, `swd-w12-lib plan`,
   22:00–22:30 "W11 BRIEF" / "W12 BRIEF"). Under his D2564 a ground row never puts a day in the reminder. So every
   w11–w13 step whose EXPECTED rested on "planned on a ground row → the day is named" proves nothing on this build, and
   several would now FAIL by design (e.g. w11's "Mon 20, Thu 23 Jul": Ranger's demo Thu 23 is a ground row only, so under
   D2564 it drops out; Mon 20 stays — his demo waves — once week 2 is a saved week, D2394 Q8). **w14 makes every
   "planned" day with a flying seat (a wave's cockpit seat) or a sim (OFT / AMT box)**, and uses a ground row only (a) to
   make a week a saved one and (b) as D2564's "never counts" case. A walker who reuses `plan()` to plan a man has walked
   nothing.
2. **D2560 (round 3) reversed four answers the old walks recorded or passed:** a day he saw, taken off and put back no
   longer relights a read reminder (w12 S2 step 3 / S14a passed "lit" — now must stay read); a date moved EARLIER over a
   day he is planned on and never saw now lights it (w11 S12 recorded "stays read" — now lit); a filing deleted for a day
   he never saw in the line he read now lights it (w12 S16d recorded "stays read" — D2565: lit, left as built); after Undo
   then Redo of an untick, a later tick brings the reminder back unread (round 3's O3-1 — a builder's reading, below).
3. **Main's words pass now shares the bell** (D2521): a changed input's line reads "LL changed to OL", "Now LL (AM)",
   "…, and 1 more change". `noticeWords` was joined by hand at the merge (`f3f0e7388`). Nothing on the old walks saw the
   two kinds of line side by side. **His later words of 24 Nov, about 21:00 (HANDOFF.md, chat 170's block — NOT YET IN
   THE RULINGS FILES)** say the changed-input line should name EVERY change, never "and N more change(s)" — replacing
   D2521's Q3. Until recorded and built, w14 expects D2521 as built and only RECORDS the count; the host raises it.

## 0b. The rulings, and which are NOT built (a walker must not FAIL the build for these)

Built on this branch and walked here: D2388 (the cut run), D2390 ("Tap to file for availability."), D2391 (lines A–E),
D2394 (2a as narrowed by D2560, 2b, Q1, Q4 as narrowed by D2421, Q6, Q10), D2420 (no reason line in the crew list),
D2421 (as drawn), D2560 (relight only for a day not seen), D2564 (flying seat or sim only), D2565 (his own deleted
filing relights, left as built), D2568 (no-times seat counts; cancelled never; crew list still strikes on a cancelled
line), D2562 (lines stay instant — nothing to build; EXPECTED: each line appears at once, none held or merged later).
**Ruled, NOT built — the screen still shows the older look, and that is not a finding:** D2437 (a read line undone
gets a new plain line, no strike — today: struck "taken back · Saber", D1699), D2423 / D2438 ("undone" in place of
"taken back"), D2561 ("You're SANS again.", "again" on a Redo's line, an admin's two lines, two undone at once), D2563
(an input's "Deleted" line reworded — today: bold name and date, "Deleted · Saber"), D2566 (a SANS info line for a ground
row, duty desk or all hands — today: the man is told nothing), and his unrecorded "every change named" (above). Each
such step is written RECORDED, with the ruling named, never FAIL.
**The bell's take-back look on this build:** a read SANS change line undone by Saber's top-bar Undo is struck,
"taken back · Saber", unread (D1699 as it stands until [BELL-WORDS-CLEAR]); an unread one simply goes (D1693).

**Not a finding (paste into every walker part):** a problem that lives only in data already stored, when the code is right
going forward (D56); anything that needs a scheduler who is not an admin (D785). Also not a finding: the demo's own unsaved
weeks naming a man (D2394 Q8, "demo weeks only"); WebKit's "Couldn't save that document" note (walk-scripts §7 (a)).

## A. Fable's 24 scenarios against w11–w13 (`docs/superpowers/briefs/2026-11-24-sans-words-scenarios-fable.md`)

"COVERED" means a w11–w13 row walked the same presses and EXPECTED on build `99581f03d`; "still valid?" says whether it
holds on this build (facts 1 and 2 above). Row ids are the walkers' step ids in `docs/handpass/parts/swd/w1x-walk.md`.

| Fable | What it walks | w11–w13 | Still valid on this build? | w14 |
|---|---|---|---|---|
| S1 | date moved twice before he reads, then back to Fri 17; no reminder read → at the end NO line | PARTLY — w11 s3a/s3b (moved twice, one line, latest title; back only to Sat 18); w11 s1a/s1b (back to Fri 17, but with the reminder READ → title alone) | the unread, never-read return to the first date was never walked | **NOT COVERED → A1** |
| S2 | read reminder relights only for a new DATE; dropped and planned again relights; reload / sign-out | w12 s2a, s2b (equal count), s14a (dropped and planned again → lit), s22a (reload / sign-out) | NO — staged on ground rows; step 3's "relights" is reversed by D2560 | **re-walk → B8** |
| S3 | read, nothing filed, date moved later twice; reminder must not relight; what the title-alone line's tap opens | w11 s10 (later, read: title alone), s1a (reminder stays read under the new date) | the reminder half staged on ground rows; the tap on a title-alone line never walked | **re-walk in B8; the tap → A2** |
| S4 | ticked AND posted: Undo post out while the tick stands, then untick → one line | PARTLY — w11 s5a/s5b (moved / removed with the tick standing → bare title; untick with the posting ahead → no line) | W11-1's fix and round 1's `ended` mark changed this path; the order "Undo post out, then untick" never walked | **NOT COVERED → B2** |
| S5 | a run starting too early, every door; Undo / Redo of the cut filing | w13 s6a–s6h (every door, Ranger and Saber), s19g.08, s19i.08 (Undo, Redo: Fri 17 – Sat 18 back, Thu 16 not) | yes (rounds 1–5 touched only the window's stretch, B5) | COVERED |
| S6 | several left out as one run; admin; one day kept; the window opening on another man | w13 s19a (several), s19b (one kept), s6f–s6h, s19i (admin); s20b showed the window opens on Zenith | the cut when the window opened on another man and Ranger is chosen at Save never walked | **gap → A3** |
| S7 | a NEW shared offer refused, never trimmed; take one out; one-man words | w13 s8c (new shared, refused whole), s8a (take Hex out), s20a (one-man, no SANS day: today's words) | yes | COVERED |
| S8 | an EXISTING shared offer stretched earlier; Ranger as a member tries the same | w13 s8a (Saber; Hex named; Hex out → saves) | the member's own try never walked | **gap → A4** |
| S9 | 2b: ticked, no date ahead, four days "and 1 more"; file one; a new day relights; self-untick → no line | w12 s15a/s15b (four days, self-tick), s16a–c (filing shrinks it), s23a (self-untick, no line) | NO — every day was a ground row | **re-walk → C9** |
| S10 | C: untick, filed / not × read / unread; tick again | w11 s4a, s4b (filed), s9untick (nothing, unread → nothing), s10 untick (read → title alone); w12 s22b.07 (tick again: reminder back UNREAD) | the change lines yes; the reminder's read state rested on ground rows | COVERED for the lines; the reminder in B9 |
| S11 | B, then posted again from a LATER date: partial return, singular, stale title; then back to Fri 17 → line gone | w11 s11a–c (Undo post out, posted again on the SAME date) | the later-date repost never walked | **NOT COVERED → A5** |
| S12 | D: moved earlier, read / unread; reminder brought up to date and UNREAD; the hint on Wed 15 | w11 s12a–c (D's title alone; reminder RECORDED "stays read") | NO — D2560 now lights it (Thu 16 is a day he never saw); Thu 16 must be a flying seat (his demo wave 2 is — the walker reads it first) | **re-walk → B8 (c)** |
| S13 | E: another outcome and back | w11 s13a–c (one, two, three days; read and unread reminders; RECORDED: back to SANS → the reminder unread, the E line title alone where read) | the lines yes; the returning reminder's read state is a reading (B9) | COVERED for the lines |
| S14 | the greyed "+ Commitment": Ranger, a non-SANS member, Saber; after a date move | w13 s18a (both sides of his date; after the clock passed it), s18b (not SANS), Saber | the hint after Saber MOVES his date never walked | **gap → A6** |
| S15 | the date arrives: title changes, no relight; Sun 19: a day gone by leaves; a move after the date | w12 s15c (clock Fri 17, Sat 18, reload: title changes, still read) | NO for the days (ground rows); Sun 19 and a move after the date never walked | **re-walk + new → B10** |
| S16 | deleting a filing never relights; file all, then a new day does | w12 s16d (RECORDED: stays read) | NO — D2560 / D2565 now light it for a day he never saw; ground rows | **re-walk → C8** |
| S17 | two men, two bells; read on one device is read on the other | w12 s7 (Mark all read on one never reads the other), w11 s11c (Hex's bell has none of Ranger's) | yes for two men. "Read on the other device" cannot be walked: two browser contexts are two stores (walk-scripts §3) — the database step's | COVERED (cross-device: not walkable) |
| S18 | Saber's top-bar Undo refuses a posting; Ranger's own Undo / Redo of a filing with his take-back line unread | w11 s11 (top-bar Undo after Undo post out: no posting back) | Ranger's own Undo / Redo beside an unread A line never walked | **gap → A7** |
| S19 | nothing filed, never read: a chain of five changes says nothing | w11 s9later, s9earlier, s9outcome, s9undo, s9untick (each change alone) | each alone yes; the reminder half rested on ground rows | COVERED (its reminder half folds into C) |
| S20 | a cut run beside a no-fly day; a month's end | w13 s19c, s19d (month's end) | the no-fly day never walked | **gap → A8** |
| S21 | a gap in the middle refused; a run starting before the SECOND SANS start trimmed | w13 s20c, s20d (gap refused whole) | the second half never walked | **gap → A9** |
| S22 | many hidden days on a phone ("and 3 more"); a hidden day gone by | w11 s1b (three days hidden) | four or more hidden days, and one gone by, never walked | **NOT COVERED → A10** |
| S23 | Mark all read on a C line; reload; its tap | w11 s10 (both reading routes; the line's tap) | yes | COVERED |
| S24 | the crew list gains nothing; counts follow the hiding | w13 s24 (struck, "0 free", no reason line; hover as built; an ARMED GROUND row) | an armed FLYING seat never walked; D2564 ties the reminder to the same places | **re-walk inside C (C1–C7 read the crew list beside the bell)** |

### Fable's 12 open points

| # | Point | Can a walk show it? | w14 |
|---|---|---|---|
| 1 | posted and ticked together: B's / C's "active again" untrue | the screen yes (w11 S5 recorded it); the words are his to rule | B1, B2 RECORD — **his question, not a walk**, for the words |
| 2 | a reminder that went and came back (untick → tick; outcome → SANS; undo → repost): read or unread | yes | B9 — NOT RULED, RECORD (the builder's "a new SANS period is news" against D2560's letter; a case on each side, lesson 32) |
| 3 | an existing one-man filing stretched earlier in its window | yes | B5 |
| 4 | a stale title once part of the body is true again (reposted from a later date) | yes | A5 RECORD — **his question** for the title's words |
| 5 | a hidden day that goes by ("It comes back…" for a past day) | yes, by the clock and a reload | A10 RECORD — NOT RULED, **his question** |
| 6 | what a title-alone line opens on a tap | yes | A2 RECORD — NOT RULED |
| 7 | "the reminder had been read" = stood and was read when the change was made | already shown (w11 s10; D2391: "only when something he filed was hidden or he had read the reminder") | none new |
| 8 | a man changing his own status gets no line | already shown (w12 s23a) | re-checked once in C9 |
| 9 | singular / plural, and a line shrinking from several days to one | yes | A5 (shrinks to "that day"), A10 (many) |
| 10 | the trim when the admin's window opened on another man; a trim landing wholly on his own earlier filing | the first yes; the second only as a unit test (the "already filed" refusal, w13 s21b, is the nearest screen) | A3; the second: a unit test, not a walk |
| 11 | other squadrons and saved weeks: loading a week never relights | the week change yes; the squadron case only if the host proves a door that moves a man's squadron | B11; the squadron: `src/leavewar/sans-reads-r3.test.tsx` "Astra F2" |
| 12 | the Quals untick as a new door for the line's permission check | no — the check has no control of its own | not a walk: tests `src/leavewar/sansplan-sec156.test.ts` (SEC156-3), `sans-seen-sec-r4.test.ts`, and the security reader |

## 1. The common world (every scenario, unless it says otherwise)

- **Clock** installed before the app loads and left RUNNING: Wed 15 Jul 26 09:00 (`ctx.clock.install`). Log the app's own
  today at the head of every scenario.
- **Sizes:** desktop Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`, scale 3, real taps, a picture
  within about 100 ms of each tap beside the settled one. Each scenario in a FRESH browser context (a fresh store).
- **People:** Saber `ad`/`a` (admin); Ranger `us`/`us` (member, id `bane`); Hex `hex`/`x` (member, id `rocky` — the demo
  already holds his sign-in, w12 s7); Casper (callsign Outlaw — his badge reads "Outlaw").
- **Read each man's own days first** (read only), each row named by its KIND — flying line (which wave, which seat), sim
  (OFT / AMT), ground row, duty desk, all hands. From w11–w12's probes, to re-check: Ranger Mon 13 (wave, sim), Thu 16
  (wave 2 and a ground row), Mon 20 (waves 1 and 2), Thu 23 (ground row only); Hex Mon 13 – Thu 16, Mon 20, Wed 22; no demo
  row of Ranger's on Fri 17 – Sun 19. Put every new event at hours clear of their demo flights (17 false FAILs once).
- **"Post Ranger SANS from Fri 17"** = Leave War → his Fri 17 cell → ⋯ → Post out → SANS → Post out (`swd-w11-lib post`).
  A man ticked SANS on Quals sits in the Leave War's hidden SANS group: turn ⚙ "+ SANS" on first (w11 s5, door 2).
- **"Seat Ranger on <day>"** = Edit Schedule, that day: Saber adds a flying line where the day has none (`sud-w5-lib
  addWave`), arms a cockpit seat and picks Ranger's puck (`asp-w2-lib armAndPick`), times typed unless the step says "no
  times"; read back that he holds the seat. **"Sim Ranger on <day>"** = an OFT or AMT box (`swd-w12-lib planSim`).
  **Never `swd-w12-lib plan()` / `swd-w11-lib planRow()` to plan a man** — those make a ground row (fact 1).
- **"Save week 2"** = one Ground Programme row on a day of the week of Mon 20 naming CASPER (not Ranger or Hex), so that
  week counts in the reminder (D2394 Q8) without naming the man under test.
- **The reminder's words** (D2340, D2390): title "You're SANS from Fri 17 Jul." (no date ahead or his date come: "Your SANS
  availability is needed.", D2394 2b), body "You're planned on Sat 18, Sun 19 Jul with nothing filed. Tap to file for
  availability."; past three days "… and 1 more" (D2342's reading, told to him). **Lines A–E** exactly as D2391 and the
  drawing page `docs/mock/2026-11-24-sans-words/` give them (the walk brief `…-sans-words-walk-brief.md` §"The words to
  expect" has them typed out). "Lit" = the bell's dot on AND the reminder's own unread mark (never only another line's).
- **Every look at a bell:** each line inside the panel, words wrapped not cut, "Mark all read" reachable; the words read
  from the drawn title and body elements (`swd-w11-lib bell`), never `innerText`.

## B. A re-walk of every fix of rounds 1–5 that a person can see (both sizes)

Each names the fix it re-walks. "RECORD" = no ruling decides it: write what the screen says, never PASS / FAIL (D2611).

**B1 — a man ticked AND posted (W11-1, `0eaacc411`; and `41c811259`'s "tick off beside a posting ahead").**
State: Saber ticks Ranger SANS on Quals (today, Wed 15); ⚙ "+ SANS" on; posts him SANS from Fri 17. Seat Ranger on Sat 18;
his demo Thu 16 wave 2 seat stands. Nothing filed.
Steps: 1. Ranger's bell. 2. Ranger files Thu 16 (Fly) and Fri 17 (Fly) as two filings, then taps the reminder (read).
3. Saber unticks him on Quals (the posting from Fri 17 stands). 4. Ranger's bell and SANS calendar.
EXPECTED: 1 — one unread reminder naming **Thu 16, Sat 18** (every SANS man planned with nothing filed: D2394 2b; he is
SANS on Thu 16 by the tick; both are flying seats: D2564); its TITLE: **NOT RULED** (the build's reading: "Your SANS
availability is needed." — he is SANS today) → RECORD. 2 — the reminder names Sat 18 only. 4 — Thu 16's filing hidden,
Fri 17's still shown and counted (D2341: shows only on a day he is SANS); one line "You're no longer SANS. · Saber" whose
body names **Thu 16 Jul only**, "that day" (D2391 C; D2394 Q6 — the sentence names only what is hidden) → words PASS/FAIL;
whether "You're no longer SANS." is true for a man still SANS from Fri 17 is Fable's open point 1 — RECORD, his question.
Variant (b): as 1–3 but nothing filed before Fri 17 and the reminder read → RECORD (w11 recorded no line).

**B2 — Undo post out while the tick stands, then the untick (round 1 item 2, the `ended` mark; Fable S4).**
State: Saber ticks Hex SANS; ⚙ "+ SANS"; posts Hex SANS from Fri 17. Seat Hex on Sat 18 (and read whether his demo Thu 16
is a seat). Hex files Sat 18; Hex taps his reminder (read; it names his other seated days, or — if he has none — sim him
on Sun 19 first so a reminder stands).
Steps: 1. Saber presses Undo post out. 2. Hex looks (sign in). 3. Saber unticks Hex. 4. Hex looks.
EXPECTED: 2 — Sat 18's filing still shows and counts (he is SANS by his tick: D2341); no line says "active again" or "is
hidden" (D2391's bodies name hidden filings, D2394 Q6 — none is hidden); his reminder still READ, the bell not lit by it
(D2560 — no day new to him); its title "Your SANS availability is needed." (D2394 2b — no date ahead); whether a title-alone
"You're no longer posted out as SANS. · Saber" appears: RECORD (his open point 1). 4 — the reminder gone, not struck
(D2391); a line "You're no longer SANS. · Saber" / "You're active again, so the SANS availability you filed for Sat 18 Jul
is hidden. It comes back if you're SANS that day again." (D2391 C); how many SANS change lines stand in all: RECORD (one is
the coordinator's reading, not a ruling).

**B3 — his reads of the reminder are kept through "Mark all read" (round 1 item 3; read record as saved, item 8).**
State: Ranger posted SANS from Fri 17; seated Sat 18. Steps: 1. Ranger presses Mark all read. 2. Saber files a Meeting for
Ranger on Mon 27 Jul (a new line in his bell). 3. Ranger: Mark all read again; reload; sign out and in. 4. Saber seats him
on Sun 19. 5. Ranger looks; taps the reminder; Mark all read twice; reload.
EXPECTED: 1–3 — the reminder READ, the bell not lit, after each (D2560: lit only for a day not in it when he read it);
the Meeting's line its own (D769's words). 5 — lit, unread, naming Sat 18, Sun 19 (D2560: Sun 19 is new); after his tap and
the two Mark all reads and the reload: read, not lit.

**B4 — an admin's Undo of a tick tells him; the Redo takes it back; Undo / Redo over and over leaves one true line (round 1
item 4; round 2's Redo and "the hidden sentence through repeated Undo / Redo"; W12-1).**
State: Saber ticks Hex SANS and signs out; Hex signs in and files Sat 18; signs out. Saber signs in (ONE sign-in for all of
step 1 — a sign-out clears his Undo list, D148). Steps: 1. Saber unticks Hex → ticks him again → presses Undo (the tick
comes off) → Redo → Undo → Redo → Undo. 2. Hex signs in and looks; SANS calendar Sat 18. 3. Hex reads the line. 4. Saber
signs in, ticks Hex again. 5. Hex looks.
EXPECTED: 2 — exactly the state of "Hex unticked": Sat 18 hidden (D2341); ONE line "You're no longer SANS. · Saber" with
Sat 18's sentence (D2391 C; the Undo of a tick takes his SANS off as an untick does); never two lines with the same words
(W12-1; D2394 Q6); nothing struck (he had read nothing, D1693: an unread line simply goes). 5 — Sat 18 shows again; the
sentence gone (D2394 Q6); the line's title stays, read: RECORD whether it stays or goes (Q6's "the line with it if nothing
is left" — a reading). The words of a Redo's line ("again", D2561) are NOT built — not a finding.

**B5 — an existing one-man filing stretched back in its own window says the cut (round 1 item 5; Fable's open point 3).**
State: Ranger posted SANS from Fri 17; Ranger files Fri 17 – Sat 18 as one filing. Steps: 1. Ranger opens it from Fri 17's
line; in its window the Dates calendar moves the first day back to Thu 16 (end Sat 18); Save. 2. The same, the end moved
on to Sun 19 as well. 3. Saber does step 1 for Ranger.
EXPECTED: one filing, Fri 17 – Sat 18 (step 2: Fri 17 – Sun 19), nothing saved on Thu 16 (D2388: the final save's check
stays; every way of picking days alike); the note "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS
from Fri 17 Jul." (D2394 Q1; Saber: "…because Ranger is SANS…") — that an EDIT of a saved filing is one of D2388's "ways of
picking days" is the agent's reading told to him → PASS/FAIL on the words, RECORD if the window refuses instead.

**B6 — the cut note never leaks into the next save (round 1 item 10).** After B5 step 1 or a cut drag: (a) Ranger files Sun
19 alone; (b) a run with no kind ticked, Add; (c) "+ Commitment", Cancel. EXPECTED: (a) the ordinary note only, never the
cut's words; (b) "Tick at least one of Fly / AMT / OFT" only (as built, w13 s21a); (c) no note (w13 s19f). The note read
from its drawn element, after the whole action (single-slot surface).

**B7 — the same change made again leaves one line with the sentence (W12-1 in `f73602f9f`) — w12 s22a / s22b re-walked.**
(a) Ranger posted from Fri 17, files Fri 17 – Sat 18 (one filing), taps his reminder (seat Sun 19 so one stands). Saber
moves PO from to Sat 18 → Ranger taps the A line → Saber moves it back to Fri 17 → Saber moves it to Sat 18 again → Saber
moves it back → to Sat 18 a third time. Ranger looks after every move; reload and sign out / in at the end.
(b) the same with the Quals tick (Ranger ticked, no posting): untick → read → tick → untick → tick → untick.
EXPECTED: after each "hidden again", exactly ONE line carries "…filed for Fri 17 Jul is hidden…" (W12-1, resting on D2394
Q6); every older line titled alone or gone (RECORD which); no two lines with the same full words; the reminder for Sun 19
read throughout (D2560 — no new day). Survives reload and sign-out.

**B8 — D2560 on this build, with real seats (round 3; Fable S2, S3, S12).**
(a) Ranger posted from Fri 17; seated Sat 18; simmed (OFT) Sun 19. He taps the reminder. Saber takes him off Sat 18 (the
seat emptied). Ranger looks. Saber seats him on Sat 18 again. Ranger looks; reload; sign out and in.
EXPECTED: off — the line names Sun 19, READ, not lit (D2394 2a: a day dropping off never lights); back on — "Sat 18, Sun 19
Jul", still READ, not lit (D2560: a day he saw, taken off and put back, does not relight; "the line still lists it").
(b) from (a)'s end: Saber takes him off Sun 19 and sims him on Fri 17 (the count stays two). EXPECTED: lit, unread, "Fri 17,
Sat 18 Jul" (D2560: Fri 17 is new).
(c) Ranger posted from Fri 17; seated Sat 18; his demo Thu 16 wave 2 seat read first. He taps the reminder (it names Sat 18
only). Saber moves PO from to Thu 16. Ranger looks, taps the reminder.
EXPECTED: the reminder "You're SANS from Thu 16 Jul." / "You're planned on Thu 16, Sat 18 Jul…", UNREAD, bell lit (D2560:
Thu 16 was not in it when he read it — the reverse of w11 s12's recorded "stays read"); beside it the title alone "Your SANS
date moved to Thu 16 Jul. · Saber" (D2391 D, he had read the reminder); no hidden sentence; nothing struck; the tap opens
the SANS calendar on Thu 16 with its window (D2340: "its tap opening the SANS calendar on the first day"). Variant: the
reminder unread before the move → one updated reminder, unread, and NO D line (D2391: a line only when something filed was
hidden or he had read the reminder).
(d) Ranger posted from Fri 17; seated Sat 18; save week 2 so his demo Mon 20 waves count. He taps the reminder ("Sat 18, Mon
20 Jul"). Saber moves PO from to Sat 18; Ranger looks; Saber moves it to Sun 19; Ranger looks.
EXPECTED: first move — the reminder keeps both days, titled "You're SANS from Sat 18 Jul.", still READ (D2560 — nothing
new); one unread title-alone line "Your SANS date moved to Sat 18 Jul. · Saber" (D2391 A, nothing filed so no body). Second
— Sat 18 leaves the reminder (no relight, D2394 2a); the change line's title "…moved to Sun 19 Jul." — whether ONE line or
two: RECORD (the coordinator's reading). His demo Thu 23 (a ground row) NEVER in the reminder (D2564).
(e) The week change (round 5's held weeks): with (d)'s reminder read, Saber turns Edit Schedule's week forward two weeks,
back, forward, back; Ranger reloads after. EXPECTED: the reminder's days and its read state unchanged (D2560 — no day new
to him). Speed itself is a test's (below).

**B9 — a SANS that ends and starts again: is the reminder news? (round 3 O3-1; Fable's open point 2) — RECORD every step.**
Hex ticked SANS; seated Sat 18; Hex taps the reminder. (i) Saber unticks, then ticks again. (ii) Fresh: Saber unticks,
Undo, Redo, then ticks again (one Saber sign-in). (iii) Ranger posted from Fri 17, seated Sat 18, read: Undo post out, then
post out again from Fri 17. (iv) Ranger as (iii): another outcome, then SANS again.
EXPECTED: **NOT RULED.** D2560's words ("only for a day not in it when he last read it") would leave it read; the build keeps
"a new SANS period is news" (round 3's builder, "kept on purpose") and shows it unread. RECORD read / unread and the bell, both
sizes, each a case to put to him (lesson 32). The change lines' words in (i)–(iv) are PASS / FAIL as D2391 C / B / E.

**B10 — the date arrives, a day goes by, a move after the date (Fable S15) — with seats.**
Ranger posted from Fri 17; seated Sat 18; save week 2 (demo Mon 20 waves). He taps the reminder on Wed 15.
Steps: 1. Clock Fri 17 09:00, reload, sign in as Ranger. 2. Clock Sun 19 09:00, reload. 3. Saber (clock Sun 19) opens the
Post out sheet and moves the posting later to Tue 21. 4. Ranger looks. 5. (lesson 29) A fresh world: the page left open as
Ranger at Thu 16 23:59:30, the clock running past midnight, NO reload; then Fri 17 00:01.
EXPECTED: 1 — title "Your SANS availability is needed." (D2394 2b: no SANS date ahead once it has come), same days, still
READ, not lit (D2560). 2 — Sat 18, now past, gone from the line (D2394 2a: a day dropping off never lights) → RECORD that it
goes (no ruling names a past day). 3 — RECORD whether the sheet lets a posting that has begun be moved. 4 — if moved: one
title-alone line "Your SANS date moved to Tue 21 Jul. · Saber" (D2391 A; he had read the reminder); Mon 20 leaves the
reminder. 5 — RECORD whether the title changes without a reload (lesson 29's check; no ruling on when).

**B11 — a man moved to another squadron (round 3 Astra F2; round 4 R4-O1's next-week preview).** Only if the host proves a
door on this build that moves a man's home squadron from a date (multi-squadron: Admin → Users or the posting sheet). If
none: test-only, `src/leavewar/sans-reads-r3.test.tsx` "Astra F2" and `src/ui/peek-home-key.test.tsx` — say so in the sheet.
If walkable: Hex SANS, seated in his old squadron's week after his move day — RECORD (the builder's "found, not fixed" 2:
borrowing is not built).

**Fixes only a test can show — no screen shows them (name each in the sheet's §18.7):**
- Round 1 items 6, 7 (only a verified replay deletes a SANS line; the gate requires `how` and `to`) — permission checks with
  no control: `src/leavewar/sans-reads-156.test.tsx`, `src/leavewar/sansplan-sec156.test.ts`.
- Round 1 item 9, round 3's O3-2 and round 5 item 2 (how many saved weeks are read on a change) — a count, not a screen:
  `src/leavewar/sans-held-weeks-r5.test.tsx` (330 → 0; across the New Year), `src/leavewar/sans-reads-r3.test.tsx` O3-2. B8 (e)
  walks only that nothing on screen changes.
- Round 3's removal of the hidden planning mark, and round 4's SEC-R4-1 (only he writes his read record; the projection door)
  — no control writes another man's record: `src/leavewar/sans-reads-r3.test.tsx`, `src/leavewar/sans-seen-sec-r4.test.ts`.
- `0eaacc411`'s Redo after a READ Undo, and round 2's Redo of a read line (struck "taken back") — needs Hex's read mark and
  Saber's Undo list in one browser at once: a sign-out clears the list (D148) and two tabs do not share the read mark
  (walk-scripts §3). `src/leavewar/sans-words-156.test.tsx`, `sans-reads-156.test.tsx` R2. **Probe P6 below may open it.**
- `41c811259`'s "a change that leaves him posted out on the same date owes no line" and "a posting date that is not a date"
  — no door can make either (the commit says so): `src/leavewar/sans-words-156.test.tsx`.
- `330ded7df` (both whole-list SANS readers through one helper) — a source-scan guard; nothing new on screen.
- Round 5's "one definition" tied to the checks and the armed seat — `src/leavewar/sans-planned-r5.test.ts`; C walks its
  screen side.

## C. D2564, D2568 and D2565 on each side — what counts as "planned"

Base for C1–C8: Ranger posted SANS from Fri 17, nothing filed, his bell never opened; the ONE placement the case names, on a
day of his SANS (Sat 18 unless it says), clear of demo flights. After the placement: (i) Ranger's bell; (ii) as Saber, Edit
Schedule's crew list on that day with no seat picked, then with a FLYING seat of that day armed (add one if needed), hovering
his struck name on desktop; (iii) the warning list for that day. D2564's own words tie the three together — "the only things
SANS availability covers, the same the crew list greys and the warning reads" — so every C case also asks: **do the reminder,
the armed seat and the warning agree?** Where they differ and no ruling names the difference, it is a finding-candidate for
the host to put to him (lesson 32), never a PASS.

| # | Placement (each on its own, a fresh world) | EXPECTED, the reminder (both sizes) | Rests on |
|---|---|---|---|
| C1 | a Ground Programme row naming him, Sat 18 | NO reminder, the bell not lit; nothing in his bell about Sat 18 (an info line for a ground row is D2566, NOT built → RECORD only) | D2564 |
| C2 | a duty desk, Sat 18 (the host proves the desk's door first) | NO reminder | D2564 |
| C3 | all hands (the Common Programme row) on Fri 17 | NO reminder | D2564 |
| C4 | a cockpit seat on a flying line with times, Sat 18 | ONE reminder, unread, the bell lit: "You're SANS from Fri 17 Jul." / "You're planned on Sat 18 Jul with nothing filed. Tap to file for availability."; its tap opens the SANS calendar on Sat 18, its window open; Ranger files Sat 18 (Fly) → the line goes, no take-back line | D2564, D2340, D2390 |
| C5 | (a) an OFT box, Sun 19; (b) an AMT box, Sun 19 | ONE reminder naming Sun 19, unread; then Ranger files Sun 19 with OFT only (a) / AMT only (b) → the line goes. Whether a Fly-only filing clears a sim day: RECORD (no ruling matches a filing's kind to the seat) | D2564 ("a sim (OFT, AMT)"), D2340 ("nothing filed") |
| C6 | a cockpit seat Sat 18 (lit), then Saber CANCELS that line (CX); then un-cancels it. (b) the same with an OFT box cancelled | cancelled → Sat 18 leaves the reminder (the line goes if it was the only day), no take-back line; un-cancelled → Sat 18 back: UNREAD if he never read it; if he had tapped it before the cancel → still READ, not lit (a day he saw, put back) | D2568 ("a cancelled line or box never counts"), D2560 |
| C7 | a flying line added on Sat 18 with NO times typed, Ranger seated | ONE reminder naming Sat 18, unread; Saber then types the times → still one line, one Sat 18, no relight if read | D2568 ("counts as planned before its times are typed") |
| C8 | D2565 / D2560 — see below | | |

**The crew list and the warning, for C1–C7 (with the reminder's result beside them):**
- C4, C5, C7: the armed flying seat / sim strikes him in SANS Avail ("0 free" where he is the only SANS man) and the warning
  list carries the SANS warning — the same places (D2564); **C7 only:** the round-5 builder reports that "an armed seat with no
  times does not ask" — if the armed seat on the no-times line does NOT strike him while his reminder names the day, that is a
  difference D2568 did not name → RECORD with pictures as a **finding-candidate for the host** (lesson 32).
- C6: armed onto the cancelled line the crew list STILL strikes him (D2568: "as built"); the warning list on a cancelled line:
  RECORD (D2568 names only the crew list).
- C1–C3: no strike when a ground row / desk is armed (w13 s24: "a ground row takes a SANS man"), no SANS warning (D2564).
- Every case: no new reason line printed under his name in the list (D2420); the desktop hover as built (D2420's reading).

**C8 — a filing deleted (D2565, D2560), both sides.**
(a) Seated Sat 18, simmed Sun 19. Ranger files Sat 18; taps the reminder (it names Sun 19 only); deletes his own Sat 18
filing. EXPECTED: lit, unread, "Sat 18, Sun 19 Jul" (D2565: his own deleted filing for a day he never saw relights it).
(b) Seated Sat 18, simmed Sun 19, nothing filed; he taps the reminder (both days); files Sat 18 (the line: Sun 19, read);
deletes the Sat 18 filing. EXPECTED: "Sat 18, Sun 19 Jul", still READ, not lit (D2560: a day he saw).
(c) as (a), but SABER deletes the Sat 18 filing. EXPECTED: lit (D2560's words: Sat 18 was not in it when he read it; D2565 names
only his own deleting, so the host says whether Saber's is the same → RECORD the result beside D2560's reading).
(d) the ground side: Sat 18 a ground row only; Ranger files Sat 18, then deletes it. EXPECTED: no reminder at any step (D2564).
(e) the Undo side (Fable S16's end): after (a), Ranger's top-bar Undo of the delete → the line shrinks to Sun 19, read state as
before the Undo: RECORD (no ruling on an Undo's relight).

**C9 — a man ticked SANS with no date ahead (D2394 2b), with real seats (re-walk of w12 s15, s16, s23a).**
Hex ticked SANS on Quals by Saber; save week 2. Seated (or simmed) on Thu 16 (his demo, if a seat — read first), Sat 18 (sim),
Mon 20 (his demo, if a seat), Tue 21 (a seat); and a Ground Programme row naming him on Wed 22.
EXPECTED: "Your SANS availability is needed." / "You're planned on Thu 16, Sat 18, Mon 20 Jul and 1 more with nothing filed.
Tap to file for availability." — Wed 22 NEVER named (D2564); the four days as they really are seats (adjust the words to the
read days); Hex files Thu 16 → "Sat 18, Mon 20, Tue 21 Jul", no "and 0 more"; Hex taps it (read); Saber sims him on Fri 24 →
lit (D2560); Hex unticks HIMSELF on Quals → the reminder goes; any line to himself: RECORD (the agent's reading, Fable's point 8).

**C10 — mixed days, and the demo week (D2564 on the demo's own rows).**
(a) Ranger posted from Fri 17; save week 2. EXPECTED before anything else is added: the reminder names **Mon 20** (his demo
waves) and NOT Thu 23 (his demo ground row only) — the old walks' "Mon 20, Thu 23" is now wrong by D2564.
(b) Sat 18: a ground row AND a cockpit seat → Sat 18 named once. Sun 19: a ground row only, beside the Sat 18 seat → Sun 19 never.
(c) A second seat on Sat 18 after he read → no relight (D2560: a day he saw).
(d) Read, then Saber puts him on a ground row on a NEW day (Tue 21) → no relight, Tue 21 never named (D2564); then seats him
on Tue 21 → lit (D2560, D2564).

**C11 — seats that only stand by (the reading's own case, lesson 32).** The round-5 build counts an SC MAIN seat and not an
SC SPARE, nor an AVALON / BB row unless that row flies ("the checks' own test"). His D2564 says "a flying seat or a sim … the
same the crew list greys and the warning reads". Walk, each in a fresh world, Ranger posted from Fri 17: (a) an SC MAIN seat
Sat 18; (b) an SC SPARE seat Sat 18; (c) an AVALON (or BB) row naming him Sat 18, not flying; (d) the same row made to fly.
EXPECTED: for each, the reminder, the armed seat and the warning AGREE (D2564) → PASS / FAIL on agreement; whether a standby
seat should count at all is **NOT RULED** in his words → RECORD each, both sides, as a case to show him.

## A-scenarios — Fable's cases no old table walked

**A1 — moved twice before he reads, then back to the first date (Fable S1).** Ranger posted from Fri 17; files Fri 17 and
Sat 18 as two one-day filings; no seat anywhere (no reminder); his bell never opened. Saber moves PO from to Sat 18; Ranger
looks (does not tap). Saber moves it to Mon 20; Ranger looks. Saber moves it back to Fri 17; Ranger looks.
EXPECTED: first — one unread line "Your SANS date moved to Sat 18 Jul. · Saber" / "You're active until then, so the SANS
availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again." (D2391 A). Second — the words
"…moved to Mon 20 Jul." / "…filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again." (D2391 A,
plural); ONE line or two: RECORD (the coordinator's reading). Back at Fri 17 — both filings shown and counted (D2341); NO SANS
change line left at all, the bell not lit (D2391: a line only where something he filed is hidden or he had read the reminder —
now neither; D2394 Q6: the sentence goes once untrue). The SANS calendar's counts and the crew list's "free" for Fri 17 and Sat
18 follow each step (hidden = not counted, D2341).

**A2 — what a title-alone line opens on a tap (Fable's point 6).** Tap (a) B8 (d)'s "Your SANS date moved to Sat 18 Jul. ·
Saber" (nothing hidden); (b) B8 (c)'s D line "Your SANS date moved to Thu 16 Jul. · Saber"; (c) a C line "You're no longer SANS.
· Saber" with nothing filed (Ranger ticked, read reminder, Saber unticks). EXPECTED: **NOT RULED** (D2340 rules the reminder's
tap; D1699 "a tap opens what the line opened" covers a struck line) → RECORD where each opens, whether the line turns read and
whether the list stays open, both sizes; no error and no window on a day he cannot file for.

**A3 — the admin's window opened on another man, Ranger chosen at Save (Fable S6; `41c811259` "one run").** Ranger posted from
Fri 17. Saber, SANS calendar: drag Wed 15 → Sat 18; the window opens on its default person (w13 s20b: Zenith); Saber picks
Ranger in the Person box; Add. EXPECTED: one filing for Ranger, Fri 17 – Sat 18; the note "Saved Fri 17 – Sat 18 Jul. Wed 15 –
Thu 16 Jul were left out because Ranger is SANS from Fri 17 Jul." (D2388, D2394 Q1 as drawn; the left-out days said as one run);
nothing saved for Zenith. If the Person box will not offer Ranger for a run starting Wed 15 (w13 s20b saw that for a run with
no SANS day of his) — RECORD which door refused.

**A4 — the member's own stretch of a shared offer (Fable S8).** Saber makes one SANS offer on Sat 18 for Ranger and Hex (both
SANS: Ranger posted from Fri 17, Hex ticked), then posts Hex out as SANS from Fri 24 (untick him first so the posting decides).
Ranger signs in, opens the offer from Sat 18, moves its end to Sun 19, Save. EXPECTED: refused, "Hex is SANS from Fri 24 Jul.
Take him out of this offer to add earlier days." (D2394 Q10), nothing changed. If a member's window offers no edit of a shared
offer → RECORD (no ruling says he may).

**A5 — Undo post out, then posted again from a LATER date (Fable S11; open points 4 and 9).** Ranger posted from Fri 17; files
Fri 17 and Sat 18 (two one-day filings). Saber Undo post out; Ranger looks and taps the B line (read). Saber posts him out again
as SANS from Sat 18; Ranger looks. Saber moves PO from to Fri 17; Ranger looks.
EXPECTED: after Undo — "You're no longer posted out as SANS. · Saber" / "You're active again, so the SANS availability you filed
for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again." (D2391 B). Posted from Sat 18 — Sat 18 shown
again; the line's body names Fri 17 only, singular: "…filed for Fri 17 Jul is hidden. It comes back if you're SANS that day
again." (D2394 Q6, D2391); the bell not lit for the shrinking: RECORD; the title, no longer true — **his question** (point 4),
RECORD. At Fri 17 — both shown; the sentence gone (Q6); the read line's title alone or gone: RECORD.

**A6 — the greyed "+ Commitment" after his date is MOVED (Fable S14).** Ranger posted from Fri 17. Saber moves PO from to Mon 20.
Ranger opens Fri 17, Sun 19 and Mon 20. Then Saber moves it to Thu 16; Ranger opens Wed 15 and Thu 16. EXPECTED: Fri 17 and Sun 19
greyed, "You're SANS from Mon 20 Jul."; Mon 20 live; after the second move Wed 15 greyed "You're SANS from Thu 16 Jul.", Thu 16
live (D2394 Q4 as D2421 narrowed it); on the phone the words inside the day's sheet at both heights. Saber's button never grey
(D2421).

**A7 — his own Undo and Redo of a filing beside an unread change line (Fable S18).** Ranger posted from Fri 17, files Fri 17.
Saber moves PO from to Sat 18 (an unread A line naming Fri 17), then looks at the top bar's Undo. Ranger signs in (does not open
the bell), drags Sat 18 → Sun 19, Add; presses Undo; Redo; then opens the bell.
EXPECTED: Saber's Undo greyed, saying why (D350: the one undo never takes back a posting). Ranger's filing, Undo and Redo leave
his A line exactly as it was — one line, unread, naming Fri 17 only (D2391: the line is about his posting; a filing is no
take-back); no second SANS change line.

**A8 — a cut run beside a no-fly day (Fable S20).** Saber sets Fri 17 as a no-fly day (the host proves the door first). Ranger,
posted from Fri 17, drags Thu 16 → Fri 17 with Fly ticked, Add; then again with OFT only. EXPECTED: never a Fly offer saved on a
no-fly day; what the window does with Fly there: RECORD (none of these rulings covers it); where it saves, the note is
"Saved Fri 17 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (D2394 Q1), never a "Saved" note for a save
refused.

**A9 — a run that starts before his SECOND SANS start (Fable S21's second half).** w13 s20c's staging: Ranger ticked Wed 15
(clock Wed 15), unticked on Thu 16 (clock Thu 16), ticked again on Fri 17 (clock Fri 17)… then, clock back where w13 had it, drag
Thu 16 → Sat 18 (Thu 16 not SANS, Fri 17 and Sat 18 SANS). EXPECTED: saved Fri 17 – Sat 18, Thu 16 left out with the note (D2388:
a run that starts before his SANS days is cut; no non-SANS day in its MIDDLE here); the date the note names: RECORD. Then drag Wed
15 → Sat 18 → refused whole (D2388: a gap in the middle keeps today's refusal) — w13's result, kept as the control. If the clock
staging cannot make this world by pressing, NOT WALKED with the reason (a unit test's).

**A10 — many hidden days, and a hidden day gone by (Fable S22; open points 5, 9).** Ranger posted from Fri 17; files Fri 17,
Sat 18, Mon 20, Tue 21 and Fri 31 Jul – Sat 1 Aug. Saber Undo post out. Ranger opens his bell at 402 wide and on desktop. Then
the clock to Sun 19 09:00, reload, Ranger looks again.
EXPECTED: the B title and the D2391 B body; how a long list of days is said ("Fri 17, Sat 18, Mon 20 Jul and 3 more"?): RECORD
the exact words (D2342's "first three, then and N more" is ruled for the reminder only); inside the panel, wrapped, title and "·
Saber" readable (the drawing). Sun 19: whether Fri 17 and Sat 18, now past, leave the sentence — **NOT RULED, his question**
(point 5): RECORD; a past day must never be the only day said to "come back".

## D. The words pass and the SANS lines in one bell (main's D2521, merged by hand at `f3f0e7388`)

**D1 — the reminder beside changed-input lines.** Ranger posted from Fri 17; seated Sat 18 (an unread reminder). Saber: (1) files
a titled input "Training" for Ranger on Mon 27 Jul; (2) files an LL for Ranger on Tue 28 Jul; (3) changes the LL to OL; (4) makes
the OL a morning half day; (5) on "Training", in ONE save: moves it to Thu 30 Jul, renames it "Range brief", changes its remark.
Ranger opens his bell (both sizes).
EXPECTED, each line's words: (1) "You were added · Saber" under the input's name and date (D769); (3) "LL changed to OL · Saber"
(D2521 Q1); (4) "Now OL (AM) · Saber" (D2521 Q2); (5) "Now Thu 30 Jul, renamed — was Training, and 1 more change · Saber" (D2521
Q3 — and on his iPhone it may take two lines, D2521) — his later "say every change" (unrecorded) → RECORD only; the reminder's
words exactly D2340 / D2390, untouched by the words pass (no "and N more change", no small first letter, nothing joined to it).
Each unread line has its own dot, the bell lit (D769's list); input lines newest first (the bell's list, D769) — **where the
reminder sits among them: NOT RULED → RECORD**. Each line appears at once after Saber's save (D2562: lines stay instant).
Then: tap line (5) → the input's own window opens and that line turns read; the reminder still unread, the bell still lit
(D769). Tap the reminder → the SANS calendar on Sat 18 with its window (D2340). Mark all read → all read, the bell dark; reload
→ the same.

**D2 — a SANS change line beside an input line, and Saber's Undo.** Ranger posted from Fri 17; files Fri 17. Saber, in one
sign-in: moves PO from to Sat 18 (an A line), then changes Ranger's Meeting of Mon 27 to Tue 28 (an input line), then presses
the top bar's Undo once, then looks at it again.
EXPECTED: the first Undo takes back the Meeting's move: Ranger's unread input line simply goes (D1693); his A line untouched,
unread, its words D2391 A. The second Undo reaches the posting: greyed, saying why (D350). Ranger signs in: the A line alone
(and any "You were added" from before). The READ case (he had read the input line; struck "taken back · Saber" as built, D1699
— D2437's new line NOT built) only if probe P6 opens it; else NOT WALKED, test-only.

**D3 — the 2b reminder beside an input's added and deleted lines, Hex the member.** Hex ticked SANS; seated Sat 18; Saber files a Meeting for Hex and deletes it. Hex's bell (both
sizes): the reminder ("Your SANS availability is needed." …), the Meeting's "You were added", and its deleted line — today the
input's name and date in bold, "Deleted · Saber" (D2563's reword NOT built → RECORD); its tap says "That input is gone", marks it
read and leaves the list open (D2563 records today's tap). Every line inside the panel; the reminder's words unchanged.

## E. The plain-user round (order §7.0a), short, on this build — both sizes

As Ranger (posted from Fri 17, seated Sat 18, nothing filed):
1. The bell: open it; close by Escape, by the bell again, by a press outside; open, tap the reminder.
2. The SANS day window the tap opened (Sat 18): close by ✕, Escape, a press outside; on the phone, drag its six-dot bar down and
   up (D648, w13 pu1).
3. "+ Commitment" → the commitment window: Cancel; ✕; Escape; ✕ with a remark typed ("Close it and lose them?"); then save Sat
   18 (Fly) — the reminder goes.
4. Open the saved commitment from Sat 18's line; delete it — Sat 18 back in the reminder, which stays READ, the bell not lit
   (D2560: he tapped it in step 1 with Sat 18 in it — a day he saw; D2565 is only for a day he never saw).
5. **The leftover [SANS-WORDS-LEFTOVERS] (5):** on the phone, with the SANS day window open, save a filing so the passing note
   shows over the window's title bar; tap the window's ✕ under the note within the note's seconds. RECORD whether the tap
   lands (the note sits over the date and ✕ — w13's lead, to reproduce); pictures straight after the tap.
As Saber: the Leave War's Post out sheet (✕, Escape, a press outside; post out; Undo post out); Quals → Edit quals → Done and its
Escape.
Then every other place that should show the result: the SANS month (Sat 18's count), Edit Schedule's crew list (D2420: no reason
line), the Scheduler Board's crew drawer and its own bell, View-only Sched (no SANS section, w13), the changes window ("All
changes": the filing, its delete).
EXPECTED: every window closes each way and leaves the page under it as it was (lesson 19); the counts follow the filing (D2341);
nothing new appears in the crew list (D2420).

## 2. The host's probes before any walker starts (walk-scripts §1–2: every route proved on this build first)

None of these routes was driven by w11–w13 (they planned with ground rows). Each is proved once, by a short script that passes,
and named in the part's brief as its recipe — never a control guessed from the source.
- **P1** a cockpit seat on a day with no flying line (Sat 18): add the line (`sud-w5-lib addWave`), arm a seat, pick Ranger
  (`asp-w2-lib armAndPick`), read it back. **P7** the same with NO times typed — can a seat be armed before times? (C7)
- **P2** an OFT and an AMT box (`swd-w12-lib planSim` passed in w12). **P5** cancel and un-cancel a flying line and a sim box
  (candidates: `aa-B-s23.mjs`, `onerule-mock-cancelled.mjs`).
- **P3** a duty desk naming Ranger on Sat 18 (candidates: `aa-B-s54.mjs`, `kbs-B-duty.mjs`). **P4** a Common Programme (all
  hands) row naming him on Fri 17 (`allavail-common.mjs`, the day's `.allhands` block).
- **P8** SC MAIN, SC SPARE and an AVALON / BB row on Sat 18, and making that row fly (C11).
- **P14** where the warning list for one day is read on Edit Schedule, and its SANS warning's words (C).
- **P6** does Saber's Undo list survive a reload of his own tab, after Hex signed in and read in a second tab? If YES, the
  read-then-Undo cases (D2's read case; `0eaacc411`'s Redo after a read Undo; round 2's struck Redo) are walkable by
  "the acting tab reloaded after the other's step" (walk-scripts §3) — add them to w14b. If NO, they stay test-only.
- **P9** the No fly switch for a day (A8). **P10** whether a member can edit a shared offer (A4). **P11** whether the Post out
  sheet moves a posting whose date has come (B10). **P12** a door that moves a man's home squadron from a date (B11).
- **P0** the served build's bundle name equals the local build's; ports free (never 4700–4719; w11–w13 used 4801–4803 —
  suggest 4821–4824); the walkers' pictures under a NEW folder `docs/img/handpass/2026-11-24-sans-words/w14<x>/` (lean copies:
  no old folder needs fetching unless a part compares with w11–w13's pictures — then `lean-copy.mjs get` that folder first).

## 3. The walker parts — one Opus walker each, one after another, about 1–1.5 hours each, both sizes

Every part's brief carries: the common world (§1); "Not a finding" (D56, D785, the demo's unsaved weeks D2394 Q8, WebKit's
document note); the NOT-BUILT list of §0b (RECORD, never FAIL); D2611 — a case no ruling names is RECORDED and put to him,
never judged; the traps below; its probes as recipes; "stop after three failed tries at one gesture"; its table to
`docs/handpass/parts/swd/w14<x>-walk.md`; scripts `scripts/handpass/swd-w14<x>*.mjs`; raw pictures on
`D:\raptor-work\c174-walk\w14<x>\`; the lessons list answered row by row.

| Part | Scenarios | Steps, roughly (both sizes) | Needs set up |
|---|---|---|---|
| **w14a — what counts as planned** | C1–C11 (each with the crew list and the warning read beside the bell) | ~260 | P1–P5, P7, P8, P14; a fresh world per placement; Ranger posted from Fri 17; week 2 saved by a Casper ground row (C10) |
| **w14b — the change lines and the read rule through ticks and postings** | B1, B2, B3, B4, B7, B9 (and P6's read-then-Undo cases if P6 says yes) | ~280 | Quals tick (`sfd-w1-lib`), ⚙ "+ SANS", Post out / move / Undo post out / the SANS chip (`swd-w11-lib`), Hex's sign-in; seats from P1 / P2 |
| **w14c — the reminder over dates and days** | B8 (a)–(e), B10, A1, A2, A5, A7, A10 | ~260 | seats and sims (P1, P2); week 2 saved; clock moves with a reload (`sah-w10-lib moveClock`) and one left running past midnight; P11 |
| **w14d — the calendar's doors, the merged bell, the plain-user round** | B5, B6, A3, A4, A6, A8, A9, D1–D3, E (with [SANS-WORDS-LEFTOVERS] (5)) | ~240 | the SANS calendar's doors (`swd-w13-lib`); the input window for a titled input, an LL and its kind / half day / move (the words pass's walk scripts `docs/handpass/parts/wr4/`); P9, P10 |

B11 goes to whichever part the host chooses if P12 finds a door; otherwise it is test-only.

**Traps every brief carries (met on this branch's walks, and walk-scripts §3–§7):** ground rows plan nothing now (fact 1);
the demo's week 2 counts only once saved (D2394 Q8) — save it with a Casper row, not Ranger's; Hex and Ranger have demo flights:
read their days first, keep new events clear; a ticked man's Leave War cell needs ⚙ "+ SANS"; the Leave War behind its loading
claw: wait on the grid, never a fixed 900 ms; the cell's count "F10" is text, not a number; Saber filing for a man sends him
"You were added" — not a stray line; Casper's badge reads "Outlaw"; two people act in ONE tab, signing out between — and a
sign-out clears Saber's Undo list (D148); two tabs never share a read mark; on the Scheduler Board press `#sbUndo` / `#sbRedo`,
not the page's `#undoBtn`; on the window's calendar a tap after a whole run starts a new pick (tap the first day, then the last);
WebKit's in-page touches drive no pointer events — a held finger drag is Chromium's fingers over CDP, his iPhone's drag his look;
WebKit's "Couldn't save that document" note is the test browser's; a step whose right result is "nothing changed" also proves its
subject exists; words read from drawn elements; a script rewritten and run never in one step; a version line on every run.

## 4. The roll-call (evidence sheet §18.3) — where w14 reads each row

R1 C4, C5, C9, B8, D1 · R2 B1, B2, B4, B7, A1, A5, A10 · R3 B4 (unread), D2 (read case only via P6) · R4 D1 (top bar), E (the
Scheduler Board's own bell) · R5 C4, B8 (c), D1 · R6–R8 w13 (unchanged doors), A3, A9 · R9 B5 · R10 w13 s8c · R11 A4, w13 s8a ·
R12 A6 · R13 A3, B5, B6, A8 · R14 B1, B2, A1, A5, B9 · R15 B1, B4, B9, C9 · R16 C1–C11 (crew list, armed seat, hover) · R17 B3,
B7, B8 (a), B10 · R18 B4 (Saber's bell), D1, w12 s7 · R19 A3, E · R20 E (the changes window) · R21 not touched by rounds 1–5 —
one look in E at a published day's face, unchanged.

## 5. The order's lessons (§7.11, `docs/bug-check-checklist.md`) — the scenario that covers each, or why not

1. State table — C's table (seat × sim × ground × desk × all hands × cancelled × no times × standby) and B8 / B9 (read × unread ×
   new day × seen day × new SANS period).
2. Drags at ordinary speed and quick — A3 and A7's drags at an ordinary pace; a quick flick and a held finger drag stay w13's
   (no fix touched the drag); named NOT WALKED with that reason.
3. After every press, what tells him — the bell's dot and the reminder's own unread mark read after every Saber step (all parts).
4. A window leaving the page working — E2 (a press on another day behind the SANS day window, w13 pu1.08's check).
5. Moved into sight — C4 / B8 (c) / D1: the SANS day the tap opens, pictured where it lands; E5 the note over the window's head.
6. Handed to the phone itself — E3's remark box raises his keys: a look for his iPhone, named.
7. Steered against the phone's motion — nothing in this change.
8. The approved drawing — every line's words against `docs/mock/2026-11-24-sans-words/`; no part list exists, so by exact text
   and by eye.
9. Every list measured — each bell line inside its panel with the longest content (A10's many days, D1's three-change line on
   the phone); the crew list's SANS Avail heading against its struck names (C).
10. Hidden and shown again — B3 / B7: reload and sign-out; the app hidden and shown again is not part of this change (no idle
    timer touched) — named.
11. Fit-dependent readings — none.
12. Every page a window opens from — the bell opened from View-only Sched, the Inputs page, the Leave War, Edit Schedule and the
    Scheduler Board (E, D1).
13. Pinch — none.
14. Keyboard boxes — the SANS month's keys were w13's (unchanged); none new.
15. Bars over a scrolling area — none changed.
16. After a refusal at a box — A4 (refused, then Hex taken out, saved), A8 (Fly refused on a no-fly day, then OFT), B6 (b).
17. Show / hide controls — the crew panel and the board's drawer opened and closed (C); the phone window's bar (E2).
18. Print or download — none.
19. Every window closed each way — E (bell, SANS day window, commitment window, Post out sheet, Quals edit), both sizes.
20. A gesture traced — none new (the drags are w13's).
21. The test browser's touch is not his phone's — E's phone taps in WebKit; his iPhone's look named on the look card.
22. What is drawn — every word read from its drawn element; the deciding pictures opened by the host.
23. What a tap opens, by the rulings — the reminder's tap (D2340) in C4 / B8 (c) / D1; an input line's (D769) in D1; a deleted
    input's ("That input is gone") in D3; the title-alone line's in A2 (NOT RULED — RECORD).
23b. Side-by-side boxes — no new pair.
24. Against the top bar — the bell panel hangs from the top bar; E5's note against the window's head on the phone.
25. Made in every place it can be put — C: a flying seat, a sim (OFT and AMT), a ground row, a duty desk, all hands, a cancelled
    line and box, a line with no times, SC MAIN / SPARE / AVALON; the demo's own seats (C10); a saved next week (C9, C10).
26. Gesture by what is under the fingers — none new.
27. Neighbouring controls — none moved by these presses.
28. On a phone, what a press opens proved on screen first — each tap pictured at once, never a script that scrolls first.
29. Anything that reads today — B10: the clock moved with a reload AND the page left open past midnight.
30. Every phone tap pictured within about 100 ms — all parts.
31. A page fitted to the screen at 125% — not this change's (no fitted page touched).
32. A builder's reading of a ruled word — C is its own scenario set: each side of "planned" (C1–C3 against C4, C5, C7; C6 and
    C11 the readings' own cases), each reading's case marked RECORD for him, never PASS; B9 and A2, A5, A10 the same for the
    readings his rulings do not name.

## 6. Counts, and what this plan could not settle

**Scenarios:** 36 — A1–A10 (10), B1–B11 (11), C1–C11 (11), D1–D3 (3), E (1, with [SANS-WORDS-LEFTOVERS] (5)), plus the host's
probes P0–P12 and P14. Fable's 24: 7 COVERED by w11–w13 (S5, S7, S17, S19, S23 whole; S10 and S13 for their lines, their reminder half
in B9); the other 17 re-walked (their old rows staged on ground rows or reversed by D2560) or new. Of the 12 open points: the
walk shows 1–6, 9, 10's first half and 11's week change (each RECORDED where no ruling decides); 7 and 8 were already shown;
10's second half and 12 are tests only; the words of 1 and 4, and point 5, are his questions.

**Could not settle (the host's to decide or prove):**
1. Whether this build has a door for a duty desk on a weekend, a flying line with no times, an SC SPARE / AVALON row, a No fly
   day, a member editing a shared offer, moving a posting after its date, and moving a man's squadron — probes P3, P7–P12. A
   scenario whose door does not exist is NOT WALKED with that reason, never FAIL.
2. **C7 may show a real difference his rulings do not name:** the round-5 builder says an armed seat on a line with no times
   "does not ask", while D2568 makes that day count in the reminder. If the walk confirms it, it is a finding-candidate to put to
   him (D2564 ties the reminder to "the same the crew list greys"; D2568 named only the cancelled-line difference).
3. His words of 24 Nov about 21:00 ("say every change", replacing D2521's count) are not yet in the rulings files; D1 records the
   count as built and the host raises it.
4. D2611 ("put to him, never guessed") is still on chat 173's branch; this plan follows it as the rule meanwhile (HANDOFF.md).
5. The demo's own rows were read from w11–w12's probes (Ranger's Thu 16 wave 2, Mon 20 waves; Thu 23 a ground row only; Hex's
   days' kinds unknown) — each part reads them again before relying on them.
6. Where the SANS reminder sits among the input lines in the bell, and what a title-alone line opens, are not ruled: RECORDED in
   D1 and A2 for his questions.

