# Walker C — [RALLY-BOX-CHANGES] walk, desktop 1440x900 by mouse (19 Oct 26)

Served build: `http://localhost:4312/`, bundle `index-D602A6a_.js` (the served index page named it). Admin `ad` / `a`, plus member
`us` / `us` for the read-only looks. Plain Node + Playwright scripts, in the scratch folder
`C:\Users\User\AppData\Local\Temp\claude\walkC\` (lib.mjs and the s04 / s16 / s18 / s20 / b04 / b06 / ml / wk scripts). Pictures:
`raptor-port/docs/img/handpass/2026-10-19-rally-changes/walk/C/` (named below without the folder). Every fixture is built through
the board's own controls (+ Wave menu, typing, the seat picker, Publish day, the plan menu). One run, one fresh browser world.
Where a figure is "hours" it is Insights' "Work hours, report to debrief, this week" for the named man, read by pressing the board's
real Insights button; a delta between two readings is the day's start moving. Chromium desktop only; no phone check was needed for
my scenarios. The browser's error list was empty in every script that printed it (s04f, s16, s18, s20c, s20d, b04).

Men used: Vandal (id split) is idle all week; Cobra (taipan), Diesel (fantom), Hunter (prowler) carry small fixed hours, so
only deltas are judged. Days 4-6 (Fri-Sun) of the seeded week have no waves, so they were my clean days.

## Scenario 4 — an empty standby R counts for nothing
Fixture: Friday a flying line ZZ, take-off 14:00, landing 16:00, Vandal in the front seat (his rest clears Saturday 06:00 exactly).
Saturday an SC wave (unpublished), shift AM START 06:00 END 12:00, Vandal on the first MAIN row, R and B empty.

| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 4.1 R empty | No crew-rest warning; day counts from 06:00 (Fri 5h00 + 6h00 = 11h00) | No warning; hours 11h00 (+6h00 for the shift) | PASS | s04-1-sc-r-empty-hours.png |
| 4.2 Logic "Default rally before take-off" 3h to 2h | Nothing about the SC line moves | Hours 11h00, no warning. NOTE: no control changes this setting (the Logic page and Admin > Squadron config only display it), so I set it on the page's settings object and then retyped START 06:05 > 06:00 through the real box | PASS (set-up not by a control) | |
| 4.3 same, to 5h | Nothing moves | Hours 11h00, no warning | PASS | |
| 4.4 Control: R 05:00 typed | Day starts 05:00 (hours +1h), warning says rally | Hours 12h00; red warning "Vandal - Crew rest breach - Friday landed 16:00, +2h debrief assumed > ended 18:00 > crew rest clear at 06:00, but SC AM's rally is 05:00 - only 11h00 rest." | PASS | s04-4-sc-r-0500.png |
| 4.5 R cleared | Back to START | Hours 11h00, no warning, rally empty in the record | PASS | |
| 4.6 Saturday published with ONLY a standby wave; default rally changed 3h to 2h; day reopened | Does not read pending | Chip ORIG, no "Publish AL" button, "No conflicts flagged" | PASS | s04-6-published-after-lead-change.png |
| 4.7 Control: END 12:00 to 12:30 on that published line | Raises "Publish AL1" | Button "Publish AL1" appeared | PASS | s04-7-control-pending.png |

Side note (not a fault of the build): the model object `window.WARN.byDay[n]` did not list the crew-rest warning that the board's issues panel showed;
I read the panel (what a person sees).

## Scenario 16 — two SC shifts on one day (unpublished Saturday)
SC AM 06:00-12:00 (MAIN A = Vandal, SPARE B = Cobra), SC PM 12:00-18:00 (MAIN C = Diesel, SPARE D = Hunter). Base hours: A none, B 1h00, C 4h00, D 1h00.

| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 16.0 no R | (record) | A 6h00, B 1h00 (spare adds nothing), C 10h00 (+6h), D 1h00 | RECORD | s16-1-two-shifts-no-r.png |
| 16.1 R 05:30 on AM, 11:00 on PM | A +30min, C +60min, B and D untouched; no leak between shifts | A 6h30, B 1h00, C 11h00, D 1h00 | PASS | s16-2-r-typed.png |
| 16.2 A also on a flying line ZQ, take-off 10:00 (report 07:40) | His day still starts at the first event, 05:30 | A 7h30 = 05:30 to 13:00 (flight debrief). Warnings (true ones, the two jobs overlap): "SC AM & ZQ clash", "No time for the ZQ flight brief - SC AM sits inside 07:40-10:00", "Not enough time to attend the ZQ debrief - SC AM sits inside 11:00-13:00" | PASS | s16-3-a-also-flying.png |
| 16.3 variant: flying take-off 08:00 (brief 05:40, later than R 05:30) | Start stays 05:30 | A 6h30 (05:30 to 12:00) | PASS | s16-4-a-flying-0800.png |
| 16.4 AM R cleared, A still flying 10:00 | Day back to 06:00 | A 7h00 (06:00 to 13:00) | PASS | |

## Scenario 18 — the long day and Insights from a standby R (unpublished Friday)
SC MAIN, START 07:00 END 18:00, Vandal on the MAIN row. Insights opened from the board's real "Insights" button.

| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 18.1 R empty (11h day) | No long-day note | None; Insights work hours for Vandal 11h | PASS | s18-1-no-r.png |
| 18.2 R 05:00 (13h day) | Grey long-day note; Insights hours start 05:00 | Issues panel: "Vandal - Vandal has a long work day: 13h00, 05:00 > 18:00" (grey); Insights work hours 11h to 13h (+2h) | PASS | s18-2-board-after-r.png, s18-2-insights-open.png |
| 18.3 rest of Insights | Flying load untouched | Sorties 32, formations 16, aircrew flying 38 unchanged; only the work-hours figure and the warning total (36 to 37, "13 WARNING") moved | PASS (RECORD of the diff) | |
| 18.4 same R 05:00 on an AVALON line, a man seated on its MAIN row (Cobra) | No long-day note, no work hours, no flying load | Cobra's hours identical before and after the R; no long-day note | PASS | s18-3-avalon-board.png |

## Scenario 20 — copies carry the standby rally
| Copy | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| Day template (Friday with SC AM 05:30 / PM 11:15, AVALON 17:00, BB 06:15, saved with "+ Save this day as a template") | RECORD whether R travels | The template editor lists the times with R carried; applied to the empty Saturday, the model reads the same R on all four lines (SC 05:30 and 11:15, AVALON 17:00, BB 06:15), B empty. **R travels with a day template.** | RECORD (carries) | s20-1-template-editor.png, s20-3-after-apply-click.png |
| Saved plan (published Saturday with SC R 05:30; "+ Alt Plan" makes Plan B, live) | Plan carries R; R changed to 05:00 reads as a pending amendment with R marked; bringing out Plan A returns R and clears pending | Plan B starts with R 05:30. After R 05:00: button "Publish AL1" appears and the R box's mark reads "Edited - goes out as AL1". Bringing Plan A out: R 05:30, no AL button | PASS | s20-4-plan-b-rally-0500.png, s20-5-plan-a-live.png |
| Wave from the + Wave menu (SC, AVALON, BB) | R empty and no faint time | R and B empty in the record and the boxes, no placeholder on all three. Contrast: a flying line placed the same way shows a faint "09:00" placeholder (class sugbox) in R | PASS | s20-6-sc.png, s20-6-avalon.png, s20-6-bb.png, s20-7-flying-contrast.png |
| "Copy a day" | RECORD if offered | Not found: the Templates menu has only "Save this day as a template" and "Manage templates" | NOT WALKED (no such control) | |

## Break test 4 — overnight lines, R 17:00 and R 01:00
| Line | Seen | Verdict | Picture |
|---|---|---|---|
| AVALON 19:00-07:00, R 17:00 (Cobra seated) | Board shows 17:00; the week shows R 17:00 over START 19:00; no warning; Cobra's hours unchanged | PASS | b04-avalon-r1700-board.png, b04-avalon-r1700-week.png |
| AVALON, R 01:00 | Board and week show 01:00 as typed (no "(prev day)" label on the board or week); no warning; hours unchanged; nothing counts | PASS | b04-avalon-r0100-board.png, b04-avalon-r0100-week.png |
| SC MAIN 19:00-07:00, R 17:00 | Day starts 17:00: hours 12h to 14h, grey "Vandal has a long work day: 14h00, 17:00 > 07:00" (true: 14 hours) | PASS | b04-sc-r1700-side.png |
| SC MAIN 19:00-07:00, R 01:00 | **FALSE 30-hour day**: hours 12h to 30h00; "Vandal has a long work day: 30h00, 01:00 > 07:00". With Friday landing 20:00 (rest clear Saturday 10:00) the same R also raises a **false crew-rest breach**: "Crew rest breach - Friday landed 20:00, +2h debrief assumed > ended 22:00 > crew rest clear at 10:00, but SC AM's rally is 01:00 - only 3h00 rest." No "timings out of order" warning appeared. Control: with R 17:00 on the same Friday landing there is no breach | FAIL (see Faults) | b04-sc-crewrest-r0100.png (opened), b04-sc-r0100-side.png |
| Same, B (the in-time box, older) 01:00 on that overnight SC line | Identical result: 30h00 and the same long-day sentence. So R inherits what B has always done | RECORD | b04-sc-b0100-side.png |

## Break test 6 — one man on two SC shifts (MAIN on AM 06:00-12:00 and MAIN on PM 12:00-18:00, Vandal on both)
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 6.0 no R | (record) | Hours 12h00 (06:00-18:00), no warning | RECORD | b06-1-both-main.png |
| 6.1 R 11:00 on PM only (inside the AM shift) | Day still starts 06:00 | Hours 12h00 (unchanged). Warning list: "Vandal reports 11:00 for SC PM - SC AM (06:00-12:00) cuts into the in-time window before the 12:00 start" (amber advisory) | PASS | |
| 6.2 R 05:00 on PM (earlier than everything) | Day starts 05:00 | Hours 13h00; the same advisory ("reports 05:00 for SC PM") and grey "long work day: 13h00, 05:00 > 18:00" | PASS | b06-2-pm-r-0500.png |
| 6.3 plus R 04:30 on AM | Day starts at the earliest, 04:30 | Hours 13h30; "long work day: 13h30, 04:30 > 18:00" | PASS | |
| SPARE-on-the-second-shift variant | | not run | NOT WALKED | |

## "Most likely missing" list
| Item | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| Earlier-version look, board (Saturday issued with SC R 05:30, then AL1 with R 05:00; plan menu > "Original" / "AL1", read-only) | Shows R as issued | Original: all four SC AM rows read 05:30; AL1: 05:00 | PASS | ml-10-version-ORIG.png (opened), ml-11-version-AL1.png |
| Earlier-version look, Edit Schedule week | Shows R as issued | The week's Original look shows SC AM "05:30 over 06:00" (picture) | PASS | wk-4-week-original-look.png (opened) |
| Changes window, "All changes" | Names the line and Rally | Group "Flying - SC AM", row "Rally 05:30 > 05:00" (and "Rally - > 05:30" for the first typing) | PASS | ml-6-all-changes.png (opened) |
| Changes window, "To go out - AL1" tab | Words the pending rally | "Waiting to go out as AL1 - 1 change: SC - rally  05:30 > 05:00". Note: the two tabs word the same change differently ("Flying - SC AM / Rally" against "SC - rally"); not a fault, noted | RECORD | ml-10-to-go-out-tab.png (opened) |
| Publish AL1 | Click goes out | After re-signing, the click published AL1 at once (no review sheet); chip AL1, "16 changes" | RECORD | ml-9-al-review.png (opened) |
| Undo's description | Says a rally time | Button title "Undo - a rally time", before and after publishing | PASS | |
| Logic page, SC in-time line, quoted | Mentions the rally on SC MAIN | Under "In-time window cut - busy between report and shift start": "A typed B (the crew's in-time) or R (its rally) on an SC MAIN, whichever is earlier, and something sits between it and the shift start. It also starts his crew rest, his long day and his OIL from that time. A SPARE's B and R do nothing." (matches D1041). Still unmentioning the rally: the crew-rest line ("For a flying member: at least 12h ... to his earliest in-time"), the tight-turn advisory ("but his typed in-time is later") and "Default rally before take-off" ("a flyer's day starts here") — they speak of flying lines only; RECORD, no contradiction | RECORD | |
| MAIN/SPARE badge flip, unpublished | R counts only while MAIN | R 05:30 on MAIN: hours 6h30; flipped to SPARE: man's hours "none", role SPARE; flipped back: 6h30 | PASS | ml-1-flipped-to-spare.png |
| Badge flip on a published day | Raises pending; flip back clears | One "Publish AL1" button after the flip; none after flipping back | PASS | ml-2-flip-on-published.png |
| Board's read-only mode | Typed R shows, taps do nothing | The board's read-only form is the version look above (boxes disabled, R as issued). A member has no board to open (the board exists but is not displayed, 0 by 0, after `openScheduler`; the member's surface is View-only Sched). The member's View-only Sched shows SC AM 05:30 / START 06:00, AVALON 17:00 / 19:00, BB 06:15 / 08:00 (text read; the clipped picture ml-14 is poor — use a fresh one) | RECORD | ml-14-viewonly-member.png (opened, clipped) |
| Week, SC / AVALON / BB rows | R above START | Edit Schedule week: heading "R over START", AVALON 17:00 over 19:00, BB 06:15 over 08:00, empty R shows a dash | PASS | wk-1-edit-week-sc.png (opened) |
| Gold dots in the changes window | | Dots on R, take-off, landing and the man's puck appear only while the changes window lists those items; they are the window's pointers, not marks of the build | not a fault | ml-5-to-go-out.png |

## Faults found
1. **An overnight SC MAIN line with an early rally reads as a false 30-hour day and a false crew-rest breach.**
   Where: Scheduler Board, SC wave, MAIN row, R box. Steps: add an SC wave on a day; type START 19:00, END 07:00; seat a man on the
   first MAIN row; type R 01:00. Seen: grey note "has a long work day: 30h00, 01:00 > 07:00", Insights work hours +18h, and (man
   landed 20:00 the day before) a red "Crew rest breach ... SC AM's rally is 01:00 - only 3h00 rest". No timing-order warning. The
   same happens with the older B box typed 01:00, so the rally inherits the older reading (a clock earlier than START is taken as
   that same day, as D503 reads it). R 17:00 on the same line is read correctly. Severity low-to-moderate (needs a rally 18 hours
   before the shift); the brief for this break test calls it a failure, so it stands as FAIL for the host to rule. Pictures:
   b04-sc-crewrest-r0100.png, b04-sc-r0100-side.png.

No other faults found in my scenarios.

## Not walked, and why
- Break test 6 with the second shift SPARE (variant): not run, time.
- Scenario 20 "Copy a day": the app offers no such control (Templates menu has save/manage only).
- Phone check and flash scenarios (not mine). The member's phone look of View-only Sched was not taken.
- Changing the Logic "Default rally" by a control: none exists; I set the settings object and retyped a real box (recorded in 4.2).
- The next-week peek's heading row and the Excel / PDF of standby lines are other walkers' scenarios.
