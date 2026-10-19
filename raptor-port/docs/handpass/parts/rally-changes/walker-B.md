# Walker B (phone, by finger) — [RALLY-BOX-CHANGES], 19 Oct 26

Build: served page on port 4312, bundle `index-D602A6a_.js` (proved by the index page). Chromium touch emulation, 402×874,
device scale 3, `isMobile`, `hasTouch`; every press is `page.touchscreen.tap` at the box's centre (not WebKit — Safari's
selection behaviour is not tested). Sideways phone: 874×402. Browser error list and page errors stayed EMPTY in every run.
Pictures: `raptor-port/docs/img/handpass/2026-10-19-rally-changes/walk/B/` (names below are file stems, `.png`). Scripts: scratch
folder `C:\Users\User\AppData\Local\Temp\claude\walkB\`. Fixtures were built in a fresh browser context each run, through the
app's own controls where the step is about a box, and `window.addWave` / `window.setSlotVal` only for set-up (the seat of a man).

## Scenario 3 — SC MAIN rally breaks crew rest (phone part; desktop part NOT walked)
Fixture: Monday night wave, Saber lands 21:10; Tuesday SC AM, Saber on MAIN row 1, START typed 09:00.
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| START 09:00, R empty | breach says START | "…but SC AM starts 09:00 — only 9h50 rest." | PASS | — |
| type R 07:00 | warning says "rally" | "…but SC AM's rally is 07:00 — only 7h50 rest." (red, in the open issues list) | PASS | B-3-h-issues-list-open-R0700, B-3-c-R0700 |
| R 07:00 and B 06:50 (B earlier) | names the in-time | "SC AM's in-time is 06:50 — only 7h40 rest." | PASS | B-3-d-R0700-B0650-earlier |
| R 07:00 and B 08:30 (R earlier) | the earlier counts = rally | "SC AM's rally is 07:00 — only 7h50 rest." | PASS | — |
| clear R and B | back to START | "SC AM starts 09:00 — only 9h50 rest." | PASS | B-3-f-cleared |
| man moved to SPARE row, R 07:00 still typed | no SC warning | none after the next real edit (see note) | PASS | — |
Note: right after `setSlotVal` (my set-up, no real edit) the old sentence still showed; one ordinary retype of START cleared it. That
is the script's own stale list, not a finding. Puck dotted ring, crew-palette mark and "arming another Saturday seat" were not looked at.

## Scenario 6 — the flash on the phone (Chromium touch; dark only)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| before: flying R box, faint 05:40 | faint, no ring | empty value, placeholder 05:40, no shadow | PASS | B-6-dark-0-before |
| tap R, 250 ms later | 05:40 placed, normal colour, blue ring | value "05:40", class `sugbox sugtook`, inset shadow `rgb(30,134,255) 2px`, animation `sugtook`, colour same as typed ink (241,244,247), caret after (5-5), focused | PASS | B-6-dark-1-tapR-250ms |
| ring over time | ends in about a second | 550 ms: shadow 46% alpha; 2 s: class gone, shadow none | PASS | B-6-dark-2-after-ring |
| then type 0915 | replaces (never 05:400915) | "0915" | PASS | B-6-dark-3-typed |
| leave by tapping elsewhere | saved | stored "09:15" | PASS | — |
| tap B | same | value 06:20, ring at 250 ms | PASS | B-6-dark-4-tapB-250ms |
| tap R then scroll the board by a finger drag | no stuck ring; scroll fine | board scrolled (524 -> 909); ring ended after its second; box STAYED focused with 05:40, nothing stored until the box is left | RECORD (the scenario list says "saved"; here it is saved only when the box is left; iPhone Safari may blur on scroll — not testable here) | B-6-scroll-after |
| light theme | — | the app drew identically with the browser set to light; no theme switch was found on the phone screens I walked | NOT WALKED | — |
| keyboard "Done" | saved | Chromium has no such key; not walked | NOT WALKED | — |

## Scenario 7 — fast actions inside the flash (phone, dark)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| (a) tap R then B, 150 ms apart | both placed and saved, both normal ink, rings end | at 200 ms both wear the ring, R unfocused, B focused; after the ring both plain; R stored "05:40" at once, B "06:20" on leaving; reload not checked | PASS | B-7a-1-200ms, B-7a-2-after-ring, B-7a-3-left |
| (b) tap R, Escape at ~300 ms | empty again, faint back, ring gone, no Undo entry | empty, faint 05:40 back, nothing stored, Undo stayed disabled — BUT the blue ring kept fading on the emptied box for about another 450 ms (class `sugtook` until Esc + 750 ms) | FAIL (cosmetic: ring not removed by Escape; it runs out its second on an empty box) | B-7b-2-esc-plus0, B-7b-3-esc-plus300 |
| (c) tap R, wait 2 s, Escape | RECORD | Escape STILL takes the placed time out: box empty, faint back, nothing stored | RECORD | B-7c-1-after-esc |
| (e) tap, wait 3 s, type 0830 | replaces | "0830", stored "08:30" | PASS | — |
| (d) tap R then ✓ Done at 120 ms | RECORD | rally saved (05:40), board closed, no ring on the next screen, 0 `sugtook` | RECORD (saved, no leftover ring) | B-7d-done-1 |
| (d) tap R then the next-day arrow | RECORD | rally saved on Tuesday (05:40), new day (Wed) drew with no ring | RECORD | B-7d-arrow-1 |
| (d) tap R then Undo (after an earlier TO change) | RECORD | R empty, TO kept 09:00, no ring, nothing saved; Undo then offers Redo | RECORD | B-7d-undo-2 |

## Scenario 9 — the flash on the Edit Schedule week, by finger
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| tap faint R (33×10 px box, centre) | placed in ordinary colour + ring | text "05:40", class `sugtook`, shadow blue 2px at 250 ms, ring gone by 1.75 s | PASS | B-9-1-tapR-250ms |
| type 0745 | replaces | "0745" | PASS | B-9-2-typed |
| tap B | same | "06:20" + ring at 250 ms; R left saved | PASS | B-9-3-tapB-250ms |
| type 0830, leave | replaces, saved | stored rl 07:45, br 08:30; boxes read 07:45 / 08:30 | PASS | B-9-4-final |
Note (first attempt): the week is a sideways slider; the box centre read before the slider finished scrolling gave a missed tap — the
script's own fault, fixed by waiting for the scroll to settle (not a finding).

## Scenario 10 — no faint times on standby lines
| Surface | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| Board (phone), SC / AVALON / BB lines with TO/START and END typed | R and B empty, no faint time, no placeholder | every R and B box empty, placeholder "" , class `tm` only (flying boxes carry `sugbox` + placeholder) | PASS | B-12-board-1_2_0 |
| Board: flying line on the same day | still shows faint R/B | 05:40 / 06:20 faint | PASS | B-12-board-1_0_0 |
| Edit Schedule week | no faint on standby; flying keeps theirs | standby R shows only an empty dash; flying faint 05:40/06:20 | PASS | B-12-week-sc-header |
| View-only Sched (admin and member), Tuesday | standby prints nothing for an empty B; flying prints its suggested brief | standby cells blank; flying prints the brief (gold, e.g. 12:20) | PASS | B-12-view-ad-SC, B-12-view-member-SC |
| clicking an empty standby box places nothing, no ring | — | not tapped separately; no ring in any standby run | NOT WALKED |  |

## Scenario 12 — where the standby R sits
| Surface | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| Board, phone stacked | R above B in the R/B cell, TO over LD unchanged | R at x=260 above B at x=260 (25 px apart), TO/LD at x=314; same geometry as the flying line; header cell reads "R / B" | PASS | B-12-board-1_2_0, B-12t-board-1_3_0 |
| Board, SC / AVALON / BB with R typed | R shows | SC AM 06:30 shown (07:00 after typing in other runs); AV 17:00; BB 07:00 — repeated on every aircraft row of the line | PASS | B-12t-board-1_3_0 |
| Week (Edit Schedule) | heading "R / START", R over START | heading "R START" stacked, typed R above START in all three kinds | PASS | B-12-week-sc-header |
| View-only Sched (admin, member) | same | SC AM 06:30 / 07:00, SC PM 12:30 / 13:00, AV 17:00 / 19:00, BB 07:00 / 08:00 | PASS | B-12t-view-member-SC, B-12t-view-admin-SC |
| Next-week peek (viewed from the week before, 874-wide only) | "R / START", R above START | heading cells read "R START" three times; Tuesday's standby cells 06:30/07:00 · 13:00 · 17:00/19:00 · 07:00/08:00. The peek is not drawn at 402 wide (by the doc: above 820 px) | PASS (peek reached by switching the week chip with a script click, because the phone hides the week chips) | B-12-peek-standby |

## Scenario 19 — a member's view (us / us)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| typed standby R in View-only Sched | shows under "R / START" | all four lines show their typed R above START | PASS | B-12t-view-member-SC |
| faint times on standby lines | none | none | PASS | same |
| tap the R/B cell of a flying line | nothing: no focus, no toast, no ring, no write | 0 editable boxes on the page, active element BODY, 0 rings, data unchanged | PASS | B-19-member-view-tap-250ms |
| read-only board | — | a member cannot open the board (`openScheduler(1)` leaves it hidden); the other route in (a published-version preview) needs a published day | NOT WALKED |  |
| member's own crew-rest sentence | — | not looked at | NOT WALKED |  |

## Scenario 21 — sideways phone 874×402 (phone parts)
| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| Board: one line R, B, TO, LD (desktop layout) | standby cells level with flying | same x and width (48 px each, 184/238/292/346) and same y (±1 px) for flying, SC, AVALON, BB; header reads R B TO LD; no horizontal overflow (874/874) | PASS | B-21-board-1_2_0, B-21-board-1_0_0 |
| MAIN badge vs remarks | not clipped | badge x=560 w=40, remarks unchanged | PASS | — |
| Week: R over START/TO, END beside | level | SC/AV cells at x=360 (R over START) and 408 (END), same y pairs as the flying line; no horizontal overflow | PASS | B-21-week-sc |
| Peek | see scenario 12 | present only past the last day, reached by scrolling the slider | PASS | B-21-peek-scan |

## Break test 5 — clearing a box (phone, unpublished)
| Step | Expected | Seen | Result |
|---|---|---|---|
| type R 07:00 on SC MAIN, leave | stored | rl 07:00 | PASS |
| Backspace to empty, leave | day returns to START, no faint time, stored empty | rl empty, box empty with no placeholder, crew-rest sentence back to "starts 09:00" | PASS |
| Undo | value back | box 07:00, stored 07:00; Undo's words "Undo — a rally time" | PASS |
| Redo | cleared again | cleared; Redo then disabled | PASS |
| reload after Undo/Redo | persists | R 07:00 survived a reload | PASS |
| published day reads pending only if issued with that R | — | needs a published Saturday | NOT WALKED |

## Faults found
1. **Escape inside the ring leaves the ring on an emptied box** (cosmetic, dark theme, phone). Steps: Board, day Tue, flying line 1 R box faint 05:40; tap it; within the second press Escape. Result: box is empty and the faint time is back (correct, nothing stored, Undo untouched) but the blue ring stays and fades for about 450 ms more (class `sugtook` removed only at Esc + 750 ms). The scenario list expects "ring gone". Pictures B-7b-2-esc-plus0, B-7b-3-esc-plus300.

## Observations (not defects of this change, no verdict)
- On the board, finishing a typed time by tapping elsewhere leaves the raw digits in the box ("0700", "0915", and TO "0905") until the next redraw; the stored value is the formatted one ("07:00"). Leaving with Tab shows "07:00". Same for the untouched TO box, so it predates this change. Pictures B-3-1-R0700 (R shows "0700", before the redraw) and B-3-c-R0700 (formatted).
- After the first tap on a faint box the white focus ring and the blue sugtook ring show together for the second (B-6-dark-1-tapR-250ms) — reads as one ring with a blue inner edge.

## Not walked, and why
Scenario 3 desktop part and the puck / crew-palette / arming checks; scenario 6 light theme and the keyboard's Done (no such control in Chromium emulation; no theme switch found); scenario 10's tap on an empty standby box; scenario 19's member read-only board (no route found for a member) and member crew-rest sentence; break test 5's published-day pending mark (no published Saturday built). WebKit / iPhone behaviour is untested throughout.
