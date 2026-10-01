# [INSIGHTS-WHICH-COPY] which schedule the Insights window counts — the WALK bug check (1 Oct 26)

Branch `claude/insights-which-copy`, the build walked: commit `b739c54c`, frozen in `raptor-port/dist-wh`. Rulings D477,
D478 (D472 for the hidden warning); the rule IN1 (`docs/superpowers/specs/2026-10-01-insights-which-copy-behaviour-register.md`);
the contract `docs/ui-contracts.md` §Week Insights. Pictures: `docs/img/handpass/2026-10-01-insights/` (`a/` the Opus
walker, `s/` the Sonnet walker of the D476 trial, `host/` the host's own reproduction).

## 1. The eight questions — tier WALK
| # | Question | Answer |
|---|---|---|
| 1 | earned leave | no — the window shows sorties, hours and issue counts; nothing of OIL reads it or is read differently |
| 2 | the published record | no — it READS each day's current issued version through the readers the published face already uses; it writes nothing, and publishing, signing, amendments and the pending comparison are untouched (the walk's scenario 19 checked that opening the window changes none of them) |
| 3 | saved data | no — nothing new is stored; the stored rows were byte-identical before and after (scenario 19) |
| 4 | a shared drawer | **YES** — one window, opened over every page, by every signed-in person |
| 5 | a new gesture | no |
| 6 | a new surface | no |
| 7 | roles | no — who may open it is unchanged (every signed-in person; the guest view has no button, as before) |
| 8 | the warning list | no — no warning's words, rule or list changed; the window's COUNT of them now comes from the published face's own list |

YES to 4 only → **WALK**. One reviewer (D353): Astra — the scenario design, and the final read.

## 2. The rulings walked
| Ruling | What it says | In the running build |
|---|---|---|
| D478 | each day's latest published version; the working copy only for a day not yet published; changes waiting on a published day not counted until they go out; every page; every figure | PASS — scenarios 3–18, both walkers |
| D477 | a hidden warning is not counted — 4 issues with 1 hidden read 3 — by the hides that version went out with | PASS — scenario 6 (33·2·4 → waiting 33·2·4 → AL1 32·1·3 → unhidden, waiting 32·1·3 → AL2 33·2·4) |
| D472 | a hidden warning is not counted | PASS — scenarios 6, 12 |
| D183–D185 | a crew-rest breach stays LIVE on a published face | PASS — scenario 3: the published day's bar and the window gain it together, at once, with no pending |
| D98, D101 | a round trip back to what was published is no change; Unpublish | PASS — scenarios 7, 11, 15 |
| D45, D103 | nothing on a published day changes without the scheduler's amendment | PASS — the window now obeys it (it was the one reader that did not) |
No clash between these rulings; D478 narrowed D477 the same evening (recorded in D477's full row).

## 3. What was built, each with its test
| Change | Test (red before the change) |
|---|---|
| `engine/validate.ts issuedWorld()` — the days, the per-person events and the warnings of the week as everyone reads it; the official pass keeps the days and events it judged | `ui/insights-published.test.tsx` — 3 of its 5 cases failed on the code before |
| `engine/insights.ts computeInsights()` reads that one world, never the working globals; returns the week's two totals | the same; `engine/insights.test.ts`, `ui/warnhide-readers.test.tsx` (row 14) still green |
| `ui/Modals.tsx insightsHTML()` — the issues tile comes from the same computation (it was counted apart, off the working list) | "the issues tile is the sum of By day…" |

## 4. The roll-call — every place the window is drawn, and every figure in it
One window (`InsightsModal`, mounted once in the shell). Its doors:
| Door | Has it | Walked |
|---|---|---|
| the top bar's "Insights" button (desktop), over View-only Sched, Edit Schedule, Inputs, Quals, Logic, Leave War, Tracker, Help, Admin | yes | scenario 18 — identical words on all nine, topmost at its centre |
| the ☰ drawer's "Week insights" (phone), over the same pages | yes | scenario 18, 390×844 |
| the Scheduler Board's own bar | **must not — it never has** (its approved bar: Undo, Redo, History, Sync, the bell, ✓ Done — D349); the shell's button is covered by the board. A window opened before the board stays on top of it and reads the same | scenario 1, RECORDED at both widths; a question for him, §8 |
| the guest view | must not — the guest tree has no Insights button (pinned by `accounts-ui.test.tsx`) | excluded |
Its figures — each reads the ONE world (no blank cell):
| Figure | Days as published | Events as published | Warnings as the face shows them |
|---|---|---|---|
| Sorties, Formations tiles; By day's sorties · formations | yes | — | — |
| Aircrew flying; Flying load; Not on the flying programme | yes | — | — |
| Work hours | — | yes | — |
| the issues tile and its "N warning"; Conflicts by type; By day's issues | — | — | yes |
| the title's dates | the loaded week's (the same in every version) | — | — |

## 5. The walk
### 5.1 How it was walked
Astra designed 19 scenarios (`docs/superpowers/briefs/2026-10-01-insights-which-copy-scenarios-astra.md`). Two walkers,
apart, each handed the same brief (`…-walk-brief.md`), the whole list and the same frozen build — an Opus walker
(`a`, port 4211) and, for D476's trial, a Sonnet 5.5 walker (`s`, port 4212, the same folder); each scenario in a fresh
browser world; desktop 1440×900 throughout, phone 390×844 for scenarios 1, 2, 3, 18, 19. Every fixture through the app's
own controls. Their tables: `docs/handpass/parts/ins-a.md`, `ins-s.md` (and `.json`); scripts
`scripts/handpass/ins-a-*.mjs`, `ins-s-*.mjs`.
*(The app allows five preview servers per folder and four were other chats', so the two walkers could not each be given a
server this chat started: the Sonnet walker used a server an earlier chat left running on the same frozen folder —
checked beforehand to serve the same bundle. Each walker still had its own worlds: a browser context is its own copy of
the data.)*

| # | Scenario | Opus walker | Sonnet walker |
|---|---|---|---|
| 1 | the Scheduler Board | RECORDED: no door at either width; counting half PASS | the same |
| 2 | a Logic rule change | RECORDED with numbers | RECORDED with numbers |
| 3 | a draft neighbour raises a live crew-rest warning on a published day | PASS, both widths | PASS, both widths |
| 4 | a look at the Original while AL1 is current | PASS | PASS |
| 5 | a saved plan switched in on a published day | PASS (and from the board's picker) | PASS |
| 6 | a hide, across AL1 and AL2 | PASS | PASS |
| 7 | a man off, back, replaced | PASS | PASS |
| 8 | a line and a formation cancelled | PASS | PASS |
| 9 | take-off time moved | PASS (two moves, AL1 and AL2) | PASS |
| 10 | duty and ground rows added | PASS | PASS |
| 11 | a leave and a timed request from Inputs | PASS | PASS |
| 12 | a draft day moves at once; publishing it changes nothing | PASS | PASS |
| 13 | View-only's "Working draft" | PASS (admin and member) | PASS (its own note: one of its checks proved nothing — the picture carries it) |
| 14 | Undo / Redo, and Undo of AL1 | PASS | PASS |
| 15 | Load onto working copy; Unpublish | PASS | PASS |
| 16 | a second week | PASS | PASS |
| 17 | a reload at five states | PASS | PASS |
| 18 | every page, width and role | PASS — 46 openings | PASS |
| 19 | opening the window changes nothing else | PASS — incl. CSV and the print sheet | PASS — Print / CSV NOT WALKED (it took a download to need the owner's say-so) |

### 5.2 What the walk found, and each disposition
1. **No Insights button while the Scheduler Board is up** (both walkers; Astra's prediction 1). Reproduced on the pictures
   (`a/dk-04-s1-c-board-bar.png`, `s/dk-04-s1-c-board-bar.png`). **Not a defect of this build and not a missing wire:**
   the board has never carried the button (D349's approved bar), and D478 is about what the window COUNTS — proven on the
   board's changes all the same (a change made on the board, ✓ Done, the window unchanged until AL1). Whether the board
   should gain a way in is his: filed `[INSIGHTS-BOARD-DOOR]`, on the look card.
2. **A rule changed on the Logic page moves the window at once, published days included** (both walkers; Astra's
   prediction 2). Flight debrief 2h → 3h: every flyer's Work hours +1h at once, the week's issues 33 → 35, Tuesday 4 → 5 —
   **and published Tuesday's own bar on View-only Sched read 5 at the same moment**; the day went "1 pending"; publishing
   AL1 then moved nothing. So the window and the published day agree with each other throughout. **Left as it is:** the
   app keeps no versions of its rules (the standing product invariant, narrowed only for the brief lead — D186), a
   published day's live warnings follow today's rules by ruling (D183–D185), and hours are worked out from the published
   day's CONTENT by today's rules. Holding hours at the old rule would need each version to store them — a saved-data
   change nobody ruled. Told to him on the look card; filed `[INSIGHTS-RULE-CHANGE]` as a question.
3. **A negative Work-hours figure** (Opus walker only, a side observation outside the 19; reproduced by the host —
   `host/dk-02-s3x-insights-wisp-bar.png`). With nothing published: a line's take-off and landing moved EARLIER than its
   wave's in-time (in-time 19:20, landing 11:25) → "Wisp -2h-30" with a full-width bar. **Confirmed older than this
   build** — the span is `validate.ts workSpan`, untouched here, and with nothing published the window reads the working
   copy exactly as on `main`. It would happen again to new data, so it is real; it sits in the one measure the long-work-day
   warning shares, which is a warning-rule change (FULL tier), not this job's. Filed `[WORKSPAN-NEGATIVE]`, low.
No finding against the build itself; nothing was fixed, so there was no re-walk.

## 6. The break tests (order §8.4)
`issuedWorld` hands the window three things; each wire cut once, the named test watched:
| Wire cut | Red |
|---|---|
| the days (the working `DAYS` handed back) | "a hide, a seat, a cancelled formation and a leave waiting on published Tuesday…" (sorties 30 against 32) |
| the events (the working `EVD`) | the same case (the hours) |
| the warnings (the working list) | that case, "a hide alone (D477)…" and "the issues tile is the sum of By day…" |

## 7. Errors seen
None — no console error, page error or 4xx in either walker's runs, nor in the host's.

## 8. What was NOT walked, and why
- A guest: the guest view has no Insights button, by design.
- Scenarios 4–17 at phone width: the window's content does not depend on width; both widths were walked for 1, 2, 3, 18, 19.
- A real iPhone: nothing here is touch- or font-dependent beyond what scenario 18 measured in Chromium.
- A week whose saved book is unreadable or from an older format (the quarantine notice): demo-only (D56).
- The Sonnet walker did not export Print / CSV (the Opus walker did).

## 9. The gates
On the final code (the commits after are documents, briefs and walk files only), under the PC lock, 1 Oct 26: unit
**7558 / 7558** (474 files) · build clean · tfin **728 / 0** · e2e **518 passed, 0 failed**, 49 skipped · smoke
**445 / 0** · rulecheck OK · docsize OK (OVER, deferred — D29). `npm run perf` not run: the change draws nothing new (the
window's markup is unchanged).

## 10. The final read — Astra (one reviewer, D353)
See `docs/superpowers/briefs/2026-10-01-insights-which-copy-final-read-astra.md`; its findings and their dispositions are
appended below when it is back.

## 11. The Sonnet-walker trial (D476) — the comparison
| | Opus walker | Sonnet 5.5 walker |
|---|---|---|
| Scenarios walked | 19 of 19 | 19 of 19 (one part skipped: Print / CSV) |
| Verdicts | 17 pass, 2 recorded | 17 pass, 2 recorded — the same on every line |
| The two recorded points | the same facts, the same numbers' direction | the same |
| Found that the other missed | the negative work-hours figure — off the list, met while setting up scenario 3 its own way | nothing |
| False alarms | none | none |
| Pictures | 281 saved; says all opened | 207 saved; says all opened at least once, but some only came back as "removed" by its viewer and were covered by a sibling picture of the same step |
| Owned up to a weak check | — | yes — scenario 13's own comparison proved nothing; it said so |
| The host's spot check of its pictures | — | two opened (scenario 6): both match its report |
| Cost | about 620,000 tokens, 926 actions, 76 minutes | about 613,000 tokens, 728 actions, 64 minutes |
One walk, on a build that turned out to have no defect in it — so this trial shows the Sonnet walker follows the brief,
reports honestly and raises no false alarm; it does NOT show whether it would catch a defect the Opus walker catches.

## 12. His look — the "look here" card (five minutes, on the preview link)
1. On Edit Schedule, publish Tuesday (sign the four, Publish day). Open **Insights** and note Tuesday's line under "By day".
2. Take a man off a Tuesday seat on the board, ✓ Done. Tuesday reads "1 pending". Open Insights: nothing has moved.
3. Hide one Tuesday warning (✕ on its line). Insights still reads the same count for Tuesday.
4. Sign the four and Publish AL1. Insights now moves — the man's sortie and hours, and one issue fewer on Tuesday.
5. Change anything on Wednesday (not published): Insights moves at once.
**Two things to answer, one to know:** (a) the Scheduler Board has no Insights button — want one? (b) a rule changed on the
Logic page moves Insights' work hours at once, published days too (the published day's own count moves with it) — leave
it? (c) know: a line timed earlier than its wave's in-time can show negative work hours — older than this change, filed.
