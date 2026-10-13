# The Tracker's date boxes (`[TRK-DATE-BOXES]`, D801) — the bug check (WALK, sized small)

**Where it stands (night of 13 Oct 26):** built, tests re-expressed first; the host's own scripted walk at a phone and a
desktop — four faults of fit found and fixed (§6); its finished code read by a fresh, blind Opus reader — nine claims,
none false: eight fixed tests-first, one a reading of D123 built and told to him (§9); 35 unit breaks and 9 browser
breaks, every one caught (§8); the whole gate set in one run, twice — before the read's fixes and after (§10). **Left: his look (the card,
§11) and his "merge live" — after step one's, which this branch is cut from.**

`Walk: docs/handpass/2026-10-13-tracker-date-boxes.md · 30 pictures (the host's scripted walk, 15 at each of two sizes) · 8 surfaces (the roll-call's eight date boxes, each seen and operated) · 12 scenarios walked (6 at each size) · MISSING: none open — 4 faults of fit fixed by the walk, 8 by the read (the double taps re-walked), 1 older unsteady test steadied`

Branch `claude/tracker-date-boxes`, cut from `claude/one-date-calendar-step-one-55ba13`. Ruling D801
(`grep -h '^| D801 |' .claude/decisions-full/*.md`). The design: `docs/superpowers/specs/2026-10-13-one-date-calendar.md`
§The Tracker's date boxes. The contract: `docs/ui-contracts.md` §The Tracker tab → Marking.

## 1. The eight questions — tier WALK

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | OIL | NO | the Tracker has no OIL |
| 2 | The published record | NO | the Tracker publishes nothing |
| 3 | Saved data | NO | nothing new is stored and no stored shape moves: each box hands its own writer the same "yyyy-mm-dd" (or "" for a date taken off) the typed box did. WHEN it is saved moved — at the pick, not when the box is left — so the walk follows a pick to what is saved and across a reload |
| 4 | A shared drawer | YES | the Tracker's own date box is drawn in six places by one file, and the pop-up's two by another |
| 5 | A new gesture | YES | a date is picked on a calendar where it was typed; "take this date off" |
| 6 | A new surface | YES | the calendar floating over the marking pop-up and over the failures list |
| 7 | Roles | NO | the Tracker reads no role (D121) |
| 8 | The warning list | NO | no warning; the one refusal line (D374) keeps its words |

## 2. The rulings swept

| Ruling | What it asks here | Checked by | Result |
|---|---|---|---|
| D801 | the app's box and calendar; a tap picks, no tick; the pop-up stays open; the date in words | the walk §6 (S1, S2); `leftovers.test.tsx`; the smoke suite's named check | PASS |
| D796 | no Reset, no tick on the calendar | the walk's pictures; so a date is taken off by a button of the box's own | PASS |
| D800 | a sideways finger turns the calendar's month — here too | it is the calendar's own (step one's tests); not walked again here | carried by step one |
| D374 | a day after today refused in Done on, Failed on, a failures row and both Last Flown — one line, nothing saved; Upchit and the end dates take any day | the walk S3 (Done on); `leftovers.test.tsx` (all of them, and "the end dates take it") | PASS |
| D377 | an empty Done on / Failed on means today; a day not whole is refused, never today | the two boxes open on today; `leftovers.test.tsx` (a day not whole reads as an empty box; the store's refusals) | PASS |
| D372 | one pick is one undo step; the same day again is none | `leftovers.test.tsx` ("save once per day … the undo history gets one step, and none for the same day"), break 1 | PASS |
| D371 | re-dating a failure re-orders the list | the smoke suite (the failures list block); the walk S4 picks in a row with the list open | PASS |
| D123 | Last Flown is the latest day flown | untouched; the smoke suite's Last Flown block passes | PASS |
| D121 | everyone may — no role gate | no gate added | PASS |
| D686 | a finger on a window never scrolls the page behind | the calendar's layer (step one's) | carried by step one |
| D726, D487 | few words; button sizes stay | one new small button, no words on it (a ✕ with a spoken name); no existing button resized | PASS |
| his 16 Aug choice | the Tracker's dates read dd/mm/yy | kept everywhere but INSIDE a date box, which reads in words (D801); the smoke suite's "numeric dates" check leaves only the box's own words out | PASS — told to him (§11) |
| D56 | a problem only in stored data is not a finding | in the reader's brief | — |

## 3. The roll-call — every place the Tracker draws a date box

| # | The place | Has the app's box | Seen and operated | Pinned by |
|---|---|---|---|---|
| 1 | Side panel → Currency & Flex → Last Flown (Syllabus) | has it | walk S1, both sizes | unit loop; smoke |
| 2 | … Last Flown (Currency) | has it | walk S1 (it follows a later Syllabus day — D123) | unit loop; smoke |
| 3 | … Upchit Date | has it | walk S1, S5 (a reload; taken off; a reload) | unit loop; smoke |
| 4 | Side panel → Pace & Expected End → End date A | has it, narrow (no weekday) | walk S1 | unit loop; smoke |
| 5 | … End date B | has it, narrow | walk S1 | unit loop; smoke |
| 6 | The full failures list (the Failures title) → each row | has it | walk S4 (calendar over the list; Escape order; a pick) | unit loop; smoke |
| 7 | The marking pop-up → Done on | has it (the app's box bare; never empty) | walk S2, S3 | unit; smoke |
| 8 | The marking pop-up → Failed on | has it (bare; never empty) | walk S2 | unit (written for break 15); smoke |
| — | The lull periods' calendar ("+ Set lull period") | MUST NOT, because it is not a date box: a range picked on a calendar the Tracker draws itself; D801 names date boxes, and step two's list does not name it | not touched | — |
| — | The Tracker's other dates (projected end, a failure's day in the pop-up, Show All) | MUST NOT, because they are read-outs, not boxes (dd/mm/yy, his 16 Aug choice) | — | smoke "numeric dates" |
| — | A phone's own date box anywhere in the app | MUST NOT exist | — | `ui/nodatebox.test.ts` (its list is empty; break 18) |

## 4. The door check

Every way a Tracker date is written: the eight boxes above (each a pick; six also "take this date off"); a grade or a +
in the pop-up (takes the day in the box — unchanged); Undo / Redo (unchanged); Import (unchanged, a file boundary). No
door was added; one was removed — typing a date as figures.

## 5. Sizing the walk (written before it)

1. **The type of change:** D (one box drawn in eight places by two files), C (a pick where a date was typed; a new small
   button), B (the calendar over two of the Tracker's own floating surfaces), E (the fit of words in boxes sized for figures).
2. **What only a walk could find:** the calendar under the Tracker's pop-up or failures list (their layers are the
   Tracker's own numbers); the pop-up closed by a press on the calendar (the page's own "click outside" listener is not
   mounted in a unit test); words cut short in boxes sized for "17/10/28"; a picked date followed to a reload.
   **What the tests already hold:** each box hands its writer the day picked; the refusals and their words; one undo step.
3. **What the ledger says:** D — ten walks of ten found a real fault; E — four of ten. A Sonnet walker costs 330 to 400
   thousand tokens; step one's three walked the calendar itself the same night.
4. **The walk chosen — SMALL:** no helper. The calendar was walked by three walkers hours earlier on the branch this one
   is cut from; what is new here is eight places and two overlays inside ONE page. The host's own scripted walk of the
   real built bundle (`scripts/handpass/trk-datebox-look.mjs`), at 390 × 844 by touch and 1440 × 900 by mouse: every
   control pressed on screen, each scenario measured and pictured, one through two reloads. Beside it the Tracker's own
   browser suite (446 checks, ~20 of them through these boxes).
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 6. The walk — the host's scripted walk, and what it found

`node scripts/handpass/trk-datebox-look.mjs phone|desktop` on the built bundle; pictures
`docs/img/handpass/2026-10-13-tracker-date-boxes/look-phone/`, `look-desktop/` (13 each), all opened.

| # | Scenario (each at both sizes) | Result |
|---|---|---|
| S1 | The side panel's five boxes: drawn, inside the screen, words whole; the calendar wholly on screen and on top; a tap picks and closes; then a date in EVERY box — words whole, "take this date off" inside its box and clear of the words | PASS after fixes 1–3 |
| S2 | The marking pop-up: Done on and Failed on inside it at its width; the calendar on top of the pop-up; the pop-up still open after a pick over it; a tap outside the calendar closes the calendar only | PASS |
| S3 | A day after today in Done on: the month turned by the arrow, the day refused with its one line inside the pop-up, the refused day left in the box (not turned into today); the calendar re-opens on that month; a day put right takes the line away | PASS (the first version of the script expected the box to go back — the store's rule of 28 Sep 26 says it stays; the script was wrong, not the app) |
| S4 | The failures list: one failure recorded by the pop-up's own +; the row's box inside the list, words whole; the calendar on top of the list; Escape closes the calendar first and the list stays; a pick lands in the row and the list stays; Escape then closes the list | PASS after fix 4 |
| S5 | Upchit: a pick; a reload — still there; "take this date off" — empty, the button gone; a reload — still empty | PASS |
| S6 | (added after the read) A DOUBLE TAP on Upchit, put in the middle of the screen: the calendar is open, nothing picked — on the phone the card lies under the finger; a tap on a date after that picks it; a double tap on "take this date off": the date goes and no calendar opens under the second half | PASS (it fails on the build before the read's fixes — browser breaks 7, 8, 9) |

**Found and fixed (each seen in a picture and a measurement; none was a failing test before the walk):**
1. **"Take this date off" beside the box cut the date short** — "Tue 13 Oct 2026" became "Tue 13 Oct 20…" in a
   failures row (both sizes). The button now sits INSIDE the box's right end, where the arrow was.
2. **End date A and B cut their date short even so** (108px wide on a phone, 127px on a desktop — three across in their
   card). They show the date without its weekday; the screen reader still hears it. Tests first (two, red).
3. **A check that was true and worthless:** the first walk measured the five boxes EMPTY. Only a date in every box showed 2.
4. **The failures list's date column** widened from 128px to 144px for the whole date.

No console or page error at either size.

## 7. What the tests found while it was built

- The app's new date box's look had reached every Tracker date box before this job began — both used the class name
  `datebox` on the one global stylesheet. Fixed on step one's branch, test first (its rules are now `button.datebox`).
- Four unit tests that TYPED into a box were re-expressed for a box that is picked — none weakened: looking saves
  nothing; a pick saves once; the same day again saves nothing; a date is taken off by its button.
- The Tracker's browser suite typed into these boxes in about fifteen places — each re-expressed to open the calendar
  and tap; one named check added (the pop-up stays open under the calendar).
- **`[TRK-DLG-FOCUS-UNSTEADY]` steadied** — a filed, older unsteady test of the Tracker's question box, due "with the
  next Tracker batch" (D490). The box puts the keyboard in its text box 30ms after it opens; the test pressed Tab before
  that. It now waits for the text box to have the keyboard. 15 loaded runs of 15 (it failed one in three before);
  break 19 proves it still fails when the rule is broken. Its lesson: `docs/tracker/known-gaps.md`, last section.

## 8. The break tests

**Unit — `scripts/handpass/breaks/2026-10-13-tracker-date-boxes.json`: 35 of 35 caught** (19 for the build, 16 for the
read's fixes — one of those not caught at its first run: nothing took a HAND-put Last Flown (Syllabus) day off; the test
was strengthened). Of the first nineteen, four were NOT caught at the first run, and each said something true: (1) the Tracker box's own "same day" guard was dead — the app's box already
hands over a date only when it differs; the dead line went, and the break now cuts the live one; (15, 16) nothing picked
a day in Failed on through the box itself — a test was written; (17) a day that is not whole reaching the box — the same test.

**In a browser — `scripts/handpass/trk-datebox-breaks-browser.mjs` (break, build, run the walk at both sizes, put back):**
**9 of 9 caught.** (1) a press on the calendar kept from the page behind — the pop-up stays open; (2) End date A a
narrow box; (3) a box's words clear of "take this date off"; (4) the button inside the box, not after it; (5) the
failures list's date column; (6) Done on and Failed on at the pop-up's width; and for the read's fixes — (7) the
opening tap's patch lying OVER the card, (8) the patch being left at all, (9) "take this date off" settling. Breaks 1
and 3 to 6 were run before the read's fixes (their rules are untouched since); 2 and 7 to 9 after. The first run used
the walk script as its detector and overwrote the evidence pictures with pictures of broken builds — retaken on the
true build, and a detector run now writes to a scratch folder (skill note 566).

## 9. The read of the finished code

A fresh, blind Opus reader (D790 — the builder's model, a fresh chat that had not seen the builder's check; brief
`docs/superpowers/briefs/2026-10-13-tracker-date-boxes-read.md`; report `docs/handpass/parts/trk-datebox/read-opus.md`;
389,152 tokens). **Nine claims — 0 high, 3 medium, 5 low, 1 small; none false.** Each was read against the code by the
host; every fix has a test that failed first and a break that proves it (§8).

| # | The claim | What was done |
|---|---|---|
| F1 medium | A double tap on a date box could pick and SAVE a day nobody chose: on a phone the calendar's card lands under the finger, and nothing guarded the tap that opens it | FIXED in the app's box (it protects every form): the opening tap leaves the same small patch a pick leaves, over the card. Unit tests; a browser test in the gate (`e2e/datecal.spec.ts`); walked (S6) |
| F2 medium | A double press on "take this date off" in the failures list took the day off TWO failures — the next one slides up under the finger | FIXED: the button settles for 400ms. Unit test; walked (S6) |
| F3 medium, his to decide | "Take this date off" on a Last Flown box left BOTH Last Flown days blank with flights on record (older store behaviour, now one tap away) | BUILT as D123's own words say — "Last Flown is the latest day actually flown": the button shows only for a day put in by hand, and taking it off shows the latest flight marked done (blank only where no flight is done). **The agent's reading, told to him (§11) — his to overrule.** Unit tests |
| F4 low | Two days picked in one box inside two seconds were one undo step (a fold written for typing) | FIXED: the seven date setters no longer fold; the pace and the down days (still typed) do |
| F5 low | The calendar marked the DEVICE's day as today; the Tracker refuses by the squadron's day (D374) | FIXED: the Tracker hands the calendar its own today. Test with the device set to another time zone |
| F6 low | A screen reader heard five boxes called "Date"; the keyboard was left on nothing after the ✕ | FIXED: each box is named, the ✕ says whose date it takes off, the keyboard goes back onto the box |
| F7 low | A refusal's line stayed under a box that was now right (the same day picked again is no change) | FIXED: the line goes at the next press on the box — in the side panel and, for an event already done, in the pop-up |
| F8 low | With the keyboard on a date box, Delete in "Edit chart layout" deleted the selected line (the key used to edit the typed box) | FIXED: the key does nothing there |
| F9 small | A year before 1900 could be picked and was dropped without a word | FIXED: no day before 1900 is offered |

**Its rulings of the builder's readings:** all supported; two it marked "to tell him" — the ✕ sits INSIDE the box where
D801's row said "beside" (§6 says why), and a refused day in Done on of an event not yet done stays in the box. Both are
in §11. **Unproved, for his devices:** on an iPad or desktop Safari between 621 and 1050px wide the calendar is placed
from a box measured under the side panel's zoom — Chromium is right; Safari was not available to run. Filed in §11's card.
**Its notes for the records** (stale comments in `Pop.jsx`, `SidePanel.jsx`, a test's note; the standalone export now
needs the app's date box) — all corrected.

## 10. The gates

The whole set in ONE run under the PC's lock with nothing else running, TWICE:

1. **Before the read's fixes, on `2418d92c1`:** unit 11008 / 11008 (630 files) · build clean · tfin 728 / 0 · e2e 794 passed, 0 failed, 57 skipped · smoke 446 / 0 · rulecheck OK · docsize OK (over one size marker by 480, deferred — D29).
2. **After them, on `e8e300cd2`:** build clean · tfin 728 / 0 · e2e 795 passed, 0 failed, 57 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — and **unit 11020 of 11022: two older tests failed, rightly.** Both lived in a file the builder had not run (`tracker.test.tsx`) and pinned "two keystrokes into one DATE box inside two seconds are one undo step" — the fold the read's F4 took off the date boxes. They were re-expressed, not weakened (a typed box — the down days — still folds, proved by break 36; a date picked twice is two steps), and the unit suite was run again whole, under the lock, on `679bd5755`: **11022 / 11022 (630 files).** Only test files changed between the two.

Not run for this job: `npm run perf` and the adapted probes — nothing of the week's or the board's drawing is touched (the Tracker is a page of its own; step one's run of the same night stands for the calendar).

## 11. His look, and what he is told

**The card — on the Tracker branch's preview link, on his own iPhone, in the Tracker:**
1. Info tab → Currency & Flex → tap **Last Flown (Syllabus)**: the calendar opens in the middle of the screen; tap a
   date — it closes and the box reads the day in words.
2. The small **✕ at the right end of that box**: tap it — the date he put in is taken off (and if a flight is marked
   done, the box shows that flight's day instead of going blank).
3. **Double-tap a date box** (Upchit is a good one): the calendar should open and stay — nothing picked by the second tap.
   No test browser can stand in for a real finger here.
4. **End date A**: pick a date — it reads without the weekday ("28 Oct 2026"), not cut short.
5. Flow chart → tap a ball → **Done on**: the calendar opens over the pop-up; pick a date — the pop-up is still there.
6. In that pop-up press **+** beside Fails, close it, Info tab → tap the word **Failures** → the row's date box: the
   calendar opens over the list; pick — the list is still there.

**Told, not asked (the agent's readings — his to overrule):**
- a date is saved the moment it is picked (D801's row said so);
- a box that holds a date has a small ✕ INSIDE its right end that takes the date off — D801's row said "beside the
  box"; beside it, the narrow boxes cut their date short;
- **on the two Last Flown boxes the ✕ shows only for a day he put in by hand, and taking it off shows the latest flight
  marked done** — the reading of D123 ("Last Flown is the latest day actually flown"). Before, emptying the box left
  both Last Flown days blank even with flights on record;
- End date A and B leave the weekday out (no room, three across);
- a date can no longer be typed as figures; the Tracker's other dates still read dd/mm/yy — so the marking pop-up shows
  both forms a line apart ("Tue 13 Oct 2026" over "ST-02 05/10/26");
- a day after today picked in Done on of an event not yet done stays in the box with its line until put right (as
  built on 28 Sep 26);
- two days picked one after the other are two Undo steps.

**Filed, not his card:** `[TRK-DATEBOX-SAFARI-ZOOM]` — on an iPad or desktop Safari between 621 and 1050px wide, whether
the calendar sits under its box in the Tracker's side panel (the panel is drawn zoomed there) is unproved; a phone is
not affected.

**Questions waiting for him:** none from this job.
