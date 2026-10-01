# [DB-READINESS] group A phase 7 — the small OIL follow-ups: the FULL bug check (1 Oct 26)

Branch `claude/db-readiness-p7-oil-followups`. Plan `docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`.
Method `docs/bug-check-order.md`. OIL is earned leave — time off banked, never pay (D25).

## 1. The eight questions — tier FULL
| # | Question | Answer |
|---|---|---|
| 1 | earned leave | YES — the OIL evidence block is edited (who stands behind a placeholder); the credit must not move |
| 2 | the published record | YES — the crowd frozen at publication gains an entry; the issued face reads the record's own sim windows |
| 3 | saved data | YES — a sim row's saved seat list; four readers of stored records |
| 4 | a shared drawer | YES — the count chip (board, edit week, View-only Sched); the ALL AVAIL window's flags |
| 5 | a new gesture | no |
| 6 | a new surface | no (one new line in the counter form; one new reason on an inert puck) |
| 7 | roles | no |
| 8 | the warning list | YES — two of its sentences moved into one shared body; the window reads its rule |

## 2. The rulings walked (the rules sweep) — pass or fail, each on the surface it is about
| Ruling | What it says here | Walked | Result |
|---|---|---|---|
| D25 | OIL is earned leave, never pay — on screen | the Logic page's sentences, the drag message inside OIL Earn (`oilscreenwords.test.ts` reads every sentence the Logic page draws) | PASS after the fix: four on-screen sentences said pay / paid |
| D27, D37 | the count shows wherever the puck lands, OIL Earn on or off | A1–A5: a Personal row, weekday and weekend, timed and all-day, name box and extras, board and edit week | PASS |
| D31 | never a silent absence; no credit from a guessed time | A2–A5: "a personal request earns no OIL" on every man, the row's cell, the earn half's own hint | PASS (the hint after walker A's O2) |
| D33, D47 | a placeholder is refused in a cockpit at every door | C29–C32: 45 attempts — tap-arm, drag from the crew list, drag from another seat, a swap, the keyboard, the search box, the edit week, the phone | PASS — no door lets one in |
| D36, D38 | the availability window stays narrow; a flagged man APPEARS, flagged | B14–B19: the OFT's brief and debrief, the AMT block's own rows, negatives, ground crew | PASS |
| D43, D46 | a placeholder behaves like named people; allowed on a request row | A8 / A9 / A28b: the same row as Training earns, as Personal earns nobody | PASS |
| D18, D470 | a second man on a request row earns — under the row, and (D470) in its name box | C33 on the walked build (the name box earned nothing), then the host on the build with D470: Blade FO in OIL Earn and FO* in the Leave War, Ranger FO* on his own answer | PASS |
| D44, D45, D103 | the crowd frozen at publication; a later change reads pending and the four sign-offs fall | A26–A28, B18, C34b | PASS |
| D50 | a sim row always shows a spare seat | B20–B25 | PASS |
| D52 | ALL / ALL AVAIL never include ground crew | B19 (Ratchet riding the sim is not in the window) | PASS |
| D468 | a moved request's extras stay with the old day, back if it returns before that day is saved | A10 | PASS (the old day saved first: not walked) |
| D469, D471, D472 | hidden warnings (ruled during this check) | C37-v recorded what the app does TODAY | not built here — `[WARN-HIDE-KEPT]`, its own job |
**No clash found between any two rulings.** One choice between two, named: **D56 followed, D48 set aside** — D470 makes a
man in a request's name box earn; a day ALREADY published in today's demo data that happened to carry one would credit him
without a republish. That harm lives only in stored demo data and cannot recur (every day published from now on goes out
under the rule), so it is not built around (D54, D56 — later than D48).

## 3. What was built, each red first
| Item | What changed | The test that was red before it |
|---|---|---|
| `[OIL-PERSONAL-PLACEHOLDER]` | ALL / ALL AVAIL on a Personal request's row is written down as a crowd (the count, the window, frozen at publication); nobody earns from it; the men behind it and the requester read "a personal request earns no OIL" in OIL Earn | `engine/oilpersonalcrowd.test.ts` (8 of 17 red), `ui/oilpersonalcrowd.test.tsx` |
| `[CROWD-SIM-BRIEF]` | the ALL AVAIL window flags an event inside a crowd man's own sim brief or debrief, in the warning list's own two sentences; the issued face reads the record's own sim windows | `engine/crowdsim.test.ts` (6 of 10 red), `ui/availwin.test.tsx` |
| `[OIL-READ-LEFTOVERS]` 2 | a drop on the second spare sim seat pads the saved list — no hole, no `null` | `ui/simspare.test.tsx` (2 red) |
| `[STORE-READER-SWEEP]` F2 | the Leave War's counters: one limit (60) for the reader and the writer; the form says the list is full | `leavewar/state/store.test.ts`, `leavewar/ui/counterform.test.tsx` |
| `[STORE-READER-SWEEP]` F3 | a list emptied on purpose — stores, cancel reasons, LoX columns — stays empty after a reload | `engine/stores.test.ts`, `cxreasons.test.ts`, `qualcols.test.ts` (1 red each) |
| `[STORE-READER-SWEEP]` F4 | a remark carried back onto a request is stored at the length the reader keeps (200) | `leavewar/inputgate.test.ts` |
| `[OIL-REQ-NAMEBOX]` — D470 | a named man in the name box of another man's request row earns from it as a man under the row does; the member who filed still earns on his own answer | `engine/oilnamebox.test.ts` (7 of 16 red), `ui/oilclaimcrowd.test.tsx` |
| `[OIL-WORDS]`, on screen (D25) | three Logic-page sentences and the drag message inside OIL Earn said pay / paid — reworded | `ui/oilscreenwords.test.ts` (3 red) |
| the walk's finding 1 | the ALL AVAIL window's foot keeps WHO was tapped and says what is true of him at every draw | `ui/availwin.test.tsx` |
| the walk's finding 2 | on a Personal row the earn half's hint says "A personal request earns no OIL." | `ui/oilpersonalcrowd.test.tsx` |

## 4. `[STORE-READER-SWEEP]` — every stored record's reader against its writers
A read-only sweep (an Opus helper), every finding then verified by the host in the code and reproduced by a test.
**Headline: no reader is narrower than its writer on official dates, OIL / earned leave, or publish state.**

| Finding | What the app could lose | Disposition |
|---|---|---|
| F1 hidden warnings | a hide is saved with its day, but a sign-in clears the hidden list and the boot does not read the saved ones back for the week on screen — while a week opened later does | **a question for him** — `OUTSTANDING.md` `[WARN-HIDE-KEPT]` (how long a hide lasts, and for whom, is his; it decides whether the day's table keeps it) |
| F2 counters | the 61st counter saved; the reload then replaced every counter with the built-in set | **fixed, red first** |
| F3 emptied lists | every store / cancel reason / LoX column removed → the standard set back after a reload | **fixed, red first** (a qualcols test had pinned `[]` as "unusable" — it pinned the defect; changed with its reason) |
| F4 carried remark | approve → take back → approve → take back grew a 200-letter remark past the reader's cut | **fixed, red first** |

**Pairs checked and found matching** (the sweep's table, verified by sampling): the war row, each record, the ledger, the
openings, the posting profile and every stint shape, the keep rule, the OIL policy, the event definitions, groups, colours
and orders; the request, person and planning rows; the week / day / issued-version / withdrawal rows (every field but
F1's); the store stamp; the rules; lookahead; the duty, wave and day templates; the section and wave defaults; accounts,
access requests, seen marks; the change history (all 20 fields); documents; the Tracker's student, course, chart and
ball-detail rows, its marks and catalogue. **Not walked by the sweep:** the Tracker's file Export → Import pair (a format,
not a store — its checker refuses by name rather than dropping); whether every writer runs inside a command (a different
way to lose data, covered by group A's own walk). **Stale lines it noticed, corrected in this change:** `data-schema.md`
(`mod` no longer writes `'now'`; document ids are random), the project guide's "what persists" line and its full text
(the change history has been kept since D338).

## 5. Closed without code
- `[OIL-READ-LEFTOVERS]` 1 — already fixed by `[ALL-AVAIL-WINDOW]` (one body, `ui/oilmode.ts oilFromWords`; pinned for a
  parked plan by `ui/availwin.test.tsx`). Walked: §6.
- `[OIL-READ-LEFTOVERS]` 4 — D56, once the walk shows every door refuses a placeholder in a cockpit (§6).

## 6. The walk — three walkers, one world each, then the host (1 Oct 26)
A scripted real browser on the production build (a frozen copy, `dist-p7`), desktop 1440×900 and phone 390×844, the clock
fixed at Wed 15 Jul 26, every fixture through the app's own controls. Scenarios: Astra's design
(`docs/superpowers/briefs/2026-10-01-db-readiness-phase7-scenarios-astra.md`). The walkers' own tables, every step:
`docs/handpass/parts/p7-a.md`, `p7-b.md`, `p7-c.md`; pictures `docs/img/handpass/2026-10-01-dbr-phase7/{a,b,c,h}/`
(115 + 84 + 186 + 35). **No console error, page error, 4xx or native dialog in any run. Every reload gave back the same
state and wrote nothing.**

### 6.1 The roll-call — every place the app draws the thing
**The count of a placeholder on a Personal request's row**
| Place | Shows the count | The tap opens the window | Result |
|---|---|---|---|
| the board's row — name box, extras, both at once | yes | yes | PASS (A1–A5) |
| the edit week's row | yes | yes (desktop) | PASS; **phone: a finger tap arms the row instead — older than this batch, filed `[COUNT-CHIP-PHONE-TAP]`** |
| View-only Sched, a published day | the count it went out with, "who was free when this day was issued" | yes, one list, read only | PASS (A26, A27) |
| a version preview (board, edit week, View-only) | the version's own | yes; a tap writes nothing | PASS (R1, C34b) |
| a saved-plan preview | today's, "as things stand now" | yes | PASS (R2, C34a) — `[OIL-READ-LEFTOVERS]` 1, already fixed |
| the next-week peek | must not — a peek is not the day | — | PASS (R3: no chip) |
| OIL Earn — the row, the window's earn half | the plain count; "0 of 44"; every man inert with the reason | no switch to tap | PASS (A2, A3, A5) |
| the member's view | yes | reads; no earn controls | PASS (R4) |
| the phone — board | yes | a bottom panel, the reason readable | PASS (A1 / A3 phone) |
| the changes window | must not add a line of its own | — | PASS (A27: one line, the leave) |
| the Leave War | must not credit | — | PASS (A26b: none of 44; A28b the positive control) |
| print, CSV | must not (exports carry no chip) | — | NOT WALKED — no chip is drawn by either builder; unchanged by this batch |
**A crowd man's sim flag** — the window on the board (B14–B17), the edit week (B18), View-only Sched from the RECORD (B18),
the phone (B14p), the warning list's own lines for a named man (B19w), ground crew never (B19), a man not on the sim never
(B19): all PASS. A plain version preview shows no flags, as every flag there (not walked for the sim).
**A sim row's seats** — the board by drag and by tap (B20–B23), the stored day and the issued version (B24: 14 lists read,
all text), Undo / Redo (B25), the edit week and View-only Sched draw the man after the last filled seat (they draw no
empty seats — as before), the changes window one line (B24c): all PASS.

### 6.2 The door check
Every door a placeholder could reach a cockpit by — 45 attempts, both pucks, both seats, empty and occupied, desktop and
phone: refused with "ALL — cannot crew a jet; name the people flying it", the seat as it was, no pending mark, no Undo
step, no history line, no row written (C29–C32). **So `[OIL-READ-LEFTOVERS]` 4 is D56**: only data stored before 22 Sep 26
can hold one. The name box of another man's request: a tap does not arm a filled box; a DRAG from the crew list replaces
him on the row, and so does taking him off and "+ add" (C33) — the door D470 is about.

### 6.3 What the walk found, and each disposition
| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | walker B (F1) | the window's foot kept the sentence from the tap after a time was edited behind it — older than the batch | **fixed, red first**; re-walked by the host (B19f: 3 / 3) |
| 2 | walker A (O2) | on a Personal row the earn half's hint said "Tap a puck to stop a man earning" beside "0 of 44" — this batch's | **fixed, red first**; re-walked (A3, A5: "A personal request earns no OIL.") |
| 3 | walker C (F2) | the name box earned nothing — the walked build predates D470 | **built (D470), red first**; re-walked by the host (C33-N1: Blade FO, Leave War Ranger FO*, Blade FO*, the same after a reload) |
| 4 | walker C (F1) | phone: a finger tap on a count on the edit week arms the row instead of opening the window | reproduced by the host on this build AND on the build before the batch — **older; filed `[COUNT-CHIP-PHONE-TAP]`**; on his look card (a real iPhone) |
| 5 | walker A (O4) | the Inputs editor leaves "till 19 Jul" when a range is taken back to one day | older; **filed `[INP-TILL-STALE]`** |
| 6 | walker A (O1) | in OIL Earn a tap on a puck that cannot earn says nothing | older; **filed `[OIL-INERT-TAP-SILENT]`** |
| 7 | walker A (O3) | the member's "OG" tag overlaps a count's top edge | older, cosmetic; **filed `[OG-TAG-OVER-COUNT]`** |
| 8 | walker A (O5) | a member forced onto Edit Schedule through the developer bridge sees live-looking buttons | no control leads there; **filed as a check, `[MEMBER-EDITPAGE-CHECK]`** |
| 9 | walker C (F3) | which hidden warnings survive a reload | **ruled D469 / D471 / D472** during the check; the build is `[WARN-HIDE-KEPT]` |
| 10 | walker C (F4) | Quals' save message says "prototype" | already filed — `[QUALS-PROTO-TOAST]` |

### 6.4 The break tests — one wire broken on purpose, one named test red
| Wire | Broken | The test that went red |
|---|---|---|
| the Personal row's crowd is written down | the new loop removed | `engine/oilpersonalcrowd.test.ts` (8) |
| the inert reason on a Personal row | the branch switched off | `ui/oilpersonalcrowd.test.tsx` (2) |
| the sim half of the crowd check | removed | `engine/crowdsim.test.ts` (6) |
| the day's sim windows published | emptied | `engine/crowdsim.test.ts` (4) |
| the issued face hands the record's sim windows | the argument dropped | `ui/availwin.test.tsx` "a sim-brief flag on the issued face" |
| the seat list padded | removed | `ui/simspare.test.tsx` (2) |
| the counter limit in the store / in the form | removed / switched off | `leavewar/state/store.test.ts` / `leavewar/ui/counterform.test.tsx` |
| the three empty-list readers | as before | one test each |
| the carried remark's length | as before | `leavewar/inputgate.test.ts` |
| the name box gathered (D470) | as before | `engine/oilnamebox.test.ts` (7) |
| the foot follows the man | as before | `ui/availwin.test.tsx` |

### 6.5 What was NOT walked, and why
- The phone beyond the sim BRIEF case, the count on the board and the cockpit doors (the debrief, the AMT block, the spare
  seat, the previews at phone width) — the same builders draw both widths; the phone-only risk found is finding 4.
- A published day's request edited, moved, taken off, deleted or handed over (only a leave filed and a retype were).
- D468's other branch (the old day saved before the request returns) — walked in phase 6 (c)'s own check.
- Print / PDF / CSV. A second scheduler account (only the admin and the member exist in the demo).
- Templates, copied days and loaded plans as ways a placeholder reaches a cockpit — they are not placement doors; a day made
  by this build cannot hold one to copy.
- About thirty of walker B's 84 pictures did not come back to it when opened (a tool limit); those steps rest on the
  script's reading, confirmed by eye on their neighbours. The host opened the name-box pictures and the phone tap's.
- **Only a real iPhone can prove:** finding 4 (the finger tap on a count on the week) — on his look card.
