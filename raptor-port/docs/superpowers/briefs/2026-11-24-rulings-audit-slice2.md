# The rulings audit — slice 2, the published record (publish, amend, sign, plans, undo of a publish, day lock)

Written 24 Nov 26 by a fresh Opus slice helper, blind to the other slices. Reading only: nothing in the app, a drawing or
a rule was changed. Plan: `../plans/2026-11-24-rulings-audit-plan.md` §3–§5, §10; brief:
`2026-11-24-rulings-audit-slice-brief.md`. Items from the step-A inventory (Slice column naming 2) and step B's
questions 6–9. Code read on this working copy (`claude/readings-lapse-fix-fdbb3c`); nothing of this slice lives only on
the SANS branch.

Counts: **MISMATCH 3 · OPEN READING 5 · NO RULING 0** (8 findings), 4 side-by-side tables, 260 inventory items placed.

## Findings

| Id | Class | The item (what a person sees or the app does) | Where | Ruling(s) and his words quoted | The difference, in one sentence | The reading's standing | Harm | When it happens · worked example · the question it would become |
|---|---|---|---|---|---|---|---|---|
| S2-01 | MISMATCH (known, filed) | The top bar's Undo straight after a publish (or a reissue) deletes the issued version's stored row; Redo writes it again; an Undo of an Unpublish deletes its retraction row. Nothing on screen differs — the day reads as an Unpublish leaves it. | `src/state/persist.ts` 345–347 (comment: "a delete (an Undo of a publish or of an Unpublish) removing that row alone"); backlog `[UNDO-PUBLISH-ERASES-ISSUANCE]` (`OUTSTANDING.md` 1604) | The amendment register (`specs/2026-09-24-amendment-behaviour-register.md`): AM4 "**An issued version is never edited in place and never erased.** … including one later pulled back by Unpublish"; AM32 "**Undo of a published day = UNPUBLISH it**" (18 Sep 26, memory `undo-of-publish-semantics`) | The rule says an Undo of a publish adds a withdrawal beside the issuance and never erases it; the app removes the issuance's row. | Not a reading — a clear rule broken; already filed for the database step. **Also a records gap:** AM4 and AM32 have no D-number and no line on the scheduler page (`scheduler.md` §Publishing / §History and undo state neither); they live only in the register and memory (searched: every area page, full rows "undo"+"publish", the archive). | Published record (the stored history of what went out loses a version) | Rare: a scheduler publishes Saturday ORIG, then presses ↶ at once. The Original's row is gone from storage; with the shared database the history of what went out would have a hole. Not a question — a fault already filed; told to him in the faults list. The missing scheduler-page line: record AM4/AM32 there. |
| S2-02 | MISMATCH | The Leave War's OIL card, under "Where it came from": "Earned off the published schedule — change the schedule and the OIL follows." | `src/leavewar/ui/BidPicker.tsx` 1164 (W0101) | D142: "**A day's OIL comes from its latest published version** … No lock, no clock"; D2044: "the OIL moves only when the day is published again" | The words say a change to the schedule moves the OIL; the rule says it moves only once the day is published again. | — | Wording only (teaches a wrong idea of when OIL moves) | Whenever a man or admin opens an earned OIL credit on the Leave War. Ranger's Saturday credit: an admin takes him off Saturday's working copy and expects the credit to go; it stays until Saturday's next amendment. Fix the words (e.g. "…change the schedule and publish it again, and the OIL follows") — a wording item for the one list. Slice 1's area too. |
| S2-03 | MISMATCH (two surfaces) | The schedule export stamps every never-published day "Working draft — not yet signed", even one all four have signed; the day on screen says "Signed — this day can be published". | `src/ui/export.ts` 74 (W1879) beside `src/ui/html.ts` 2540 (W2147) and 336 (W1954) | D97 (the marker's words): "'Not yet signed' while any of the four sign-offs is missing or no longer valid, and 'Not yet published' once all four are valid" — stated for a published day's working copy; no ruling for the export's stamp | Two surfaces answer "is this day signed" differently, and no ruling names the difference. | — | Wording only (an exported report calls a signed day unsigned) | When a scheduler exports a week with a day signed but not yet published. Friday signed by all four, not published: the screen reads "Signed — this day can be published", the export "Working draft — not yet signed". Wording item; the export work itself waits on his word (D1644). |
| S2-04 | OPEN READING | A published day's OIL reads the assumed landing of a flight with no landing typed, and keeps the Logic flight length as a fourth kept value beside D2044's three: changing the flight length makes such a day read pending and drop its sign-offs, its OIL moving only when published again. | `src/engine/oilev.ts` 659–671, `src/engine/oil.ts` 98–99, 241; `src/engine/faceattrs.ts` 96 (C0041); `src/engine/oil.ts` 96 (C0048); `src/leavewar/assumedlanding-published.test.ts` 1–8, 60, 80–104 (C0117–C0119); `src/leavewar/oilworkstart-published.test.ts` 107 (C0134) | D2046: "every check that reads the landing uses that assumed time" — row: "The agent's reading, not checked: the tight turn, the debrief, the crew rest, the long day and OIL all read the assumed landing"; D2053 row: "The agent's reading, not checked: OIL reads the same assumed landing"; D2044: "when any of the Logic page's **three** OIL settings changes — the default rally, the flight debrief, 'Full day of OIL'" | "Every check" was read to include OIL earning, and D2044's three kept values were widened to four; neither was answered. | Disclosed, unanswered — the rows say "not checked"; the test's head says "the OIL reading is the agent's, flagged to him". Searched: full rows D2044, D2046, D2047, D2053, D1990, D2022; oil page; scheduler page; the archive ("flight length"); no later answer. | OIL | Rare: a weekend flight with no landing typed. Bane, published Saturday, T/O 10:00, no landing: report 07:00 to assumed landing 11:00 + 2h debrief = 6h, a half day; the admin raises the flight length to 90 min → Saturday reads 1 pending, sign-offs drop, Bane's half day stands until republished, then becomes a full day. Question: "Should a flight with no landing earn OIL to its assumed landing, and should a published day keep the flight length it went out with, as it keeps the other three OIL settings?" (with slice 1) |
| S2-05 | OPEN READING | Crew rest across two days is judged by the settings of the day being judged: a draft Tuesday reads a published Monday's open-ended row with today's "Assumed length, no end time"; a published Tuesday reads a draft Monday's with Tuesday's kept value. | `src/published-day-logic-reads.test.ts` 1–6, 46–80 (C0172–C0176); `src/engine/faceattrs.ts` 141–149 ("A rule that looks across days is decided by the day being judged") | D2005: "A published day is checked by all the Logic settings it was published under … a changed setting applies to that day from its next amendment and to every unpublished day at once" | D2005 does not say whose settings build the neighbouring day's end when the two days differ; the build chose the judged day's. | Never put — written by the blind readers of 12 Nov 26 as proof tests; in no question page or later row (searched: full rows D2005, D2013, D2014, D2024; scheduler page; the archive). | Published record (a crew-rest flag on a day, and the two days' faces disagreeing on when Monday ended) | Rare: an open-ended row late on a day next to a published one, then a Logic change. Monday published, Bane in a 20:00 lecture with no end (ends 21:00 at 60 min); "Assumed length" raised to 120; draft Tuesday's 09:40 brief now reads a crew-rest break (Monday read as ending 22:00) while Monday's published face still shows the lecture ending 21:00. Question: "When a setting changes, should Tuesday's crew rest read Monday's end by Monday's settings or by Tuesday's?" |
| S2-06 | OPEN READING | A changed late cut-off moves the LATE marks at once on published days, the Logic page saying so ("A changed late cut-off moves the LATE marks at once, on published days too."). | `src/ui/LogicPage.tsx` 37 (W2561) | D2005: "A published day is checked by **all** the Logic settings it was published under"; D2052 row restates the note's meaning "a changed late cut-off moves the LATE marks at once" and he answered only "Q1 we will also bring to fable to reword"; D2071's "Yes" was to the other sentence; D1621 (a dropped LATE mark leaves the issued schedule at once) is about a drop, not a setting | Whether "all the Logic settings" covers the late cut-off (on the Logic page) or only the warnings' checks was read as "not the cut-off"; his answers were to the wording. | Disclosed, unanswered (D2052's row states it; §3 step 5: an answer to wording is not an answer to what it covers). Searched: full rows D2005, D2015, D2052, D2067, D2071, D1586, D1620, D1621; inputs page §The late cut-off; the archive. | Published record (a LATE mark appears or leaves an issued day without an amendment) | Rare: an admin changes the late cut-off mid-week. Tuesday published with Ranger's leave filed 2 days ahead, not late under a 1-day cut-off; the cut-off is raised to 3 days → Ranger's leave reads LATE on the issued Tuesday at once, nothing pending. Question: "Should a changed late cut-off reach a published day at once, or wait for its next amendment like every other Logic setting?" |
| S2-07 | OPEN READING | The day lock, not built: beyond D2212's own parts, it frees at once on closing the page, warns at 25 minutes, is taken by any change on a free day, and an admin's take-over hands over after one minute unanswered, offers "Take over anyway", and saves a plan "<callsign> — at take-over HH:MM". | `.claude/rules/decisions/scheduler.md` §Not built yet (D2212 lines: "the rest the agent's reading of D1751", "not yet checked with him") (GN114, GN118); `docs/mock/day-lock.html` | D1751: "**Just do a simple field** … Basically too much complexity for a relatively simple problem imo"; D2212: "it frees after 30 minutes with no change, on 'Done editing' or on sign-out, and an admin may ask to take it over" — row: "the take-over's further detail (one minute, 'Take over anyway', the saved plan) stays the agent's reading"; the parts came from his D355, D356, D451, D454 of 29 Sep, before D1751 | Whether his 29 Sep details survive his later "simple field … too much complexity" was read as yes; D2212 confirmed some, not the rest. | Disclosed, unanswered (D1751 row: "told to him, not yet checked with him"; D2212 row: "stays the agent's reading"). Searched: full rows D355, D356, D450 (archive), D451, D454, D1751, D2209, D2212; people-accounts page. | Permission (who may edit a day, and when another may take it) | At the database step; daily once two schedulers work at once. Hunter holds Tuesday and goes for a shower; Saber asks to take over; under the reading Tuesday passes to Saber after one minute and a saved plan "Hunter — at take-over 10:42" appears. Question: "Do the take-over's minute, 'Take over anyway' and the saved plan, and freeing on closing the page, still stand after your 'simple field' answer?" — fits the database step's design round. |
| S2-08 | OPEN READING | Signing off with an OIL question open: pressing Save with one of two inputs unanswered leaves it as Later — no later box asks again that day — and the publish note names it; and the save is two steps of Undo, the name first, then the answers. | `src/ui/oilsign.ts` 121–127 (C0254) | D2294: "asks it when a scheduler presses any of its four sign-off boxes … **Later asks no more that day**"; D2299: "approved as drawn, ✕ signing nothing and the next press asking again"; D148 (Undo steps back one's own changes) | D2294 names Later, not a Save that leaves one answer unpicked, and says nothing of how Undo takes the save back; the build read both. | Disclosed, unanswered — the code says "told to him" and "He saw the row and left it" (a closing report; §3 step 5: never put as a question). Searched: full rows D2294, D2297, D2299, D2312, D81; oil page; the mock `docs/mock/2026-11-22-oil-unanswered-publish/`. | OIL (an input left unanswered earns nobody OIL; the next boxes do not ask) | Weekly on an OIL-earning day with two duty inputs. Saturday: Ranger's Training and Bane's Duty both unanswered; Saber presses SKED CK, answers Ranger's only, saves; the other three boxes do not ask about Bane's, and Saturday publishes with Bane earning nothing. Question: "If a sign-off answers only some of the day's OIL questions, should the next sign-off ask about the rest?" (with slice 1) |

## Side by side — step B's questions for this slice

### 6. Which copy of a day does each reader take

| Surface | The copy | Rests on |
|---|---|---|
| View-only Sched, the issued face | latest published version; the working copy for a day never published | D477, D478, D1010 |
| Insights | the same world (`issuedWorld`), the roster each day went out with | D477, D478 |
| OIL credit | latest published version only | D142, D2 |
| Crew list, Edit Schedule, the board's edit side | the working copy | D97, D2013 |
| ALL AVAIL crowd | frozen at publication on the issued day, live on the working copy | D44, D45 |
| Export | the published version of a published day (`export.ts publishedDays`), else the working copy | owner 15 Sep 26 ([FLAG-EXPORT]); D1644 holds the rest |
| SANS reminder | the working copy of every week held | slice 5's (question 14) |

AGREE for this slice's surfaces; the SANS reminder is slice 5's.

### 7. Has this day changes waiting, and how many

| Surface | The rule | Rests on |
|---|---|---|
| Day head, ⓘ panel, plan-switch message | `dayShownPendCount` — published: the worked-out difference; never published: the draft marks (the head shows the changes chip instead, D118) | D109, D118 |
| "Not yet signed" / Publish / amendment panel | the worked-out difference (`dayHasChanges`, `dayPendingItems`) | D97, D109 |
| "Load onto working copy" button | `dayDiscardCount` — content only, by design: it says what the load discards (a member's own input is not discarded, D863); the look's head reads the working copy's count (PVPC) | D98, D863 |
| `ui/html.ts` 1802 `dayPendCount` (raw marks) | read only when no look is open, but the value is drawn only inside the look's bar (`PV && !PVQ`), where it is always the captured discard count — the raw branch is never drawn | — |
| Amendment panel "changes on unpublished days" | raw marks, never-published days only — the same body `dayShownPendCount` uses there | D488 |

AGREE — the raw read step B found is never drawn.

### 8. Is this day signed, and who may be picked

| Surface | The rule | Rests on |
|---|---|---|
| The four boxes' lists | the Scheduler tick in that squadron on that day | D212, D1651, D2245 (two-squadron part: slice 3) |
| "Signed" for publishing | no box missing (`daySigned`, `signMissing`) | D97, D103 |
| OIL list at the first press | the day's open OIL questions | D2294, D2297, D2299 (see S2-08) |
| Export stamp | "not yet signed" for every never-published day | none — S2-03 |

AGREE on screen; the export differs (S2-03).

### 9. Which Logic settings judge this day

| Surface | Settings | Rests on |
|---|---|---|
| A published day's face, its frozen and its live-on-face warnings | the version's kept values (`withRuleVals`, `withDayRules`, `withShownRules`) | D2005, D2013, D184 as narrowed |
| Its working copy once anything waits | today's | D2013 ("new once signed") |
| An unpublished day | today's | D2005 |
| Its OIL | its own kept values — rally, debrief, full day, and the flight length (S2-04) | D2044, D592 |
| Insights' work hours | today's, published days included | D482 (its "the issue count moves with it" set aside by D2005) |
| A rule across two days | the judged day's | none — S2-05 |
| The late cut-off's LATE marks | today's, at once | none — S2-06 |

AGREE at the entry points read; the three readings are findings S2-04 to S2-06. A comment in `src/engine/rules.ts` 117–118
still calls a published day's OIL following a changed setting "the owner's question" — answered by D2044; the code
follows D2044 (`oilKeptVals`). Stale comment, not a behaviour finding.

## Coverage ledger

Format: `id · class · ruling (or why dropped)`.

**List 1 — comments (37)**
- C0029 · MATCH · D2013 approves the reading (working copy of an edited published day reads today's)
- C0041 · finding S2-04 (the OIL half); the checks half MATCH D2005
- C0046 · MATCH · D179 narrowed by D183–D185, D188
- C0048 · finding S2-04
- C0064 · MATCH · D177–D179
- C0065 · MATCH · D179, D183–D185
- C0066 · MATCH · D2005, D2013 (never starts, never clears a flag — confirmed)
- C0067 · MATCH · D2005 (test row, assumed sim length)
- C0068 · MATCH · D482 explicit for the hours ("do not hold the hours"); D2005 rules the checks
- C0069 · MATCH · D482
- C0073 · not a reading ("his call" in "this callsign")
- C0095 · MATCH · D2013
- C0096 · MATCH · D2013
- C0117 · finding S2-04
- C0118 · finding S2-04
- C0119 · finding S2-04
- C0132 · dropped · the two-squadron Plan grant — slice 3
- C0133 · dropped · slice 3
- C0134 · finding S2-04
- C0145 · dropped · SANS tick by date — slice 5
- C0172 · finding S2-05
- C0173 · finding S2-05
- C0174 · finding S2-05
- C0175 · finding S2-05
- C0176 · finding S2-05 (its describe-title says the opposite of its assertion — test wording only)
- C0180 · dropped · members' switch — slice 3/5
- C0183 · dropped · the bell's squadron rule — slice 9/3
- C0197 · dropped · Plan grant — slice 3
- C0198 · dropped · slice 3
- C0231 · not a reading ("callsign")
- C0238 · MATCH · D178, D179, D183–D185
- C0239 · MATCH · D184's reading (2) confirmed by D185 ("Confirms D184's reading (2)"), D188
- C0248 · not a reading ("his callsign")
- C0254 · finding S2-08
- C0255 · not a reading
- C0264 · not a reading ("rather than assumed")
- C0268 · dropped · SANS calendar — slice 5

**List 2a — words (111)**
- W0101 · finding S2-02
- W0260 · MATCH · D142
- W0541 · dropped · no-fly day on the war — slice 6
- W0700 · pass · demo seed label
- W0730 · MATCH · label
- W0757, W0768, W0769, W0812 · dropped · Plan grant / audit texts — slice 3
- W1502, W1830, W3012 · pass · "Signed in as" — sign-in, slice 3/10
- W1531 · MATCH · §Settled Waves & duties (Default arrangement: "never re-ordering an existing or published day")
- W1553, W1560 · pass · labels
- W1554 · MATCH · D488, per-day publish
- W1556 · MATCH · owner 15 Sep 26 preview guard (A3)
- W1557 · MATCH · D97, D103
- W1661 · MATCH · D179 (published face read only)
- W1711 · MATCH · D98 (a load discards unpublished edits)
- W1720 · MATCH · plan activation is plain editing (14–15 Sep 26, memory; register)
- W1721, W1722 · MATCH · plans as backups (12 Sep 26)
- W1747, W1748 · MATCH · D97, D99
- W1810, W1811, W1813 · pass · validation labels
- W1814, W1815, W1816 · MATCH · plan activation; per-day publish
- W1817–W1821, W1823 · pass · labels
- W1879 · finding S2-03
- W1880 · MATCH · [FLAG-EXPORT] published version
- W1906 · dropped · SANS chip — slice 5
- W1947 · not a finding · shown only for a legacy store the database step clears (D56)
- W1951, W1952 · MATCH · plans and looks at a version
- W1954 · MATCH · D97
- W1958 · pass · label
- W1960, W1961, W1962, W1963 · MATCH · D97
- W1965 · MATCH · D1010
- W2013, W2014, W2473, W2474 · MATCH · D1588, D1592
- W2030 · MATCH · D1010 (a look at an issued version)
- W2035, W2036, W2041, W2042 · MATCH · D2013 ("new once signed"); the "goes away once signed" twin follows it
- W2070, W2071 · MATCH · D99, D100
- W2076 · MATCH · D97
- W2078, W2079 · MATCH · "no publish all days" (product invariant, 7 Aug 26)
- W2080 · MATCH · D103
- W2081, W2083, W2451, W2456, W2457 · MATCH · D1094 ("the Unpublish warning, its done note and the armed button's title … stand as built")
- W2084, W2085 · MATCH · D101; register AM32–AM37c
- W2086 · pass · label
- W2089–W2094 · MATCH · D98, D863
- W2143 · pass · label
- W2147, W2148, W2149, W2150 · MATCH · D97, D109
- W2453 · not a finding · refusal for an unresolvable legacy store (D56)
- W2454, W2455 · MATCH · D101, AM37c
- W2458 · MATCH · label
- W2518 · MATCH · REPORT_ORDER never blocks publishing — no ruling found that it should; a description of the built check, stating no new rule (searched "out of order", "REPORT_ORDER")
- W2543, W2544, W2553 · MATCH · D142, D2 (only the issued schedule earns)
- W2551 · MATCH · D2044
- W2554 · pass to slice 1 · Leave War period offer (OIL)
- W2555 · MATCH · D2002
- W2556 · pass to slice 1 · holiday withdrawn (OIL) — no clash seen with D142
- W2557 · MATCH · D54 ("raises the pending mark … he republishes it once")
- W2560 · MATCH · D2067, D2071 ("Yes" to that sentence)
- W2561 · finding S2-06
- W2585, W2951 · not text a person reads (code comments caught by the net)
- W2599 · dropped · the sign-in card's build note — app-wide words, slice 10 (a prototype caveat on screen there is theirs to judge)
- W2662, W2663 · MATCH · D2002
- W2708 · MATCH · D103
- W2709 · MATCH · D97
- W2770 · MATCH · D2054 (built; the page still says "not built" — records only)
- W2908–W2914 · MATCH · the board's copy of the look bar (D98, D863)
- W3031 · dropped · the sync chip — app-wide, slice 10

**List 3a — drawings (3)**
- GD037, GD039 · dropped · two-squadron Plan grant questions — slice 3
- GD041 · MATCH · D2294, D2297, D2299 ("approved as drawn"), D2312; built in `ui/oilsign.ts`; its one reading is S2-08

**List 3b — ruled, not built (39)**
- GN047 · MATCH · D2054 (built since; the page's "not built" is stale — records only)
- GN049 · MATCH · D2333, D2429, D2430 — not built, no reading in the line
- GN051 · MATCH · D2330, D2431–D2436 — not built
- GN071 · MATCH · D2142 — design only
- GN074, GN075, GN095, GN096 · MATCH · D2106, D2121, D2124, D2129, D2160 — shared wave's publishing and signing, design only
- GN082 · MATCH · D2184 — detachment sign-off boxes
- GN084 · MATCH · D2184
- GN108 · MATCH · D2212, D1751 — no lock on a shared line
- GN114 · finding S2-07
- GN118 · finding S2-07
- GN015, GN016, GN055, GN057, GN059, GN061, GN062, GN063, GN068, GN098, GN104, GN120, GN121 · dropped · not the published record (flight label, posting, places, attach, bell crossing, holidays, purple names, squadron picker, access, opening date, single seat) — slices 3, 4, 6, 9
- GN024, GN025, GN026, GN030, GN031, GN032, GN034, GN036, GN038 · dropped · the Plan grant and moves — slice 3 (GN038's sign-off-box half, D2245, is slice 3's two-squadron part)
- GN105 · dropped · two-squadron OIL — slice 1

**List 3c — specs and plans (70)**
- GS001, GS002, GS003, GS004 · MATCH · the amendment core and the EOD design (§3b) — EOD deferred on his word, nothing built; the open design points are filed in `[EOD]` (REV5-01…05, REV5-04 superseded in part by D142); §3b's "a closed day accepts only EOD corrections" agrees with D142's "An EOD, once published, is the final word on the day"
- GS005 · MATCH · the legacy-book quarantine (its notice: W1947, D56)
- GS013 · not a finding · its §4 "current safety facts are never versioned" set aside by D179 by name
- GS016 · MATCH · [FLAG-EXPORT] — published version only (`export.ts publishedDays`); held by D1644
- GS031 · source of S2-01 (AM4, AM32); its other rows read only where an item above cites them
- GS038 · not a finding · the 25 Sep sweep, overtaken by D178–D185
- GS066 · MATCH · family 7's W68–W78; its W75 (D482) agrees with C0068
- GS006, GS007, GS017, GS018, GS021, GS023 · dropped · architecture, stable ids, command layer, global undo phase 2 — build plans of built work; the undo-of-publish point is S2-01
- GS037, GS077, GS083, GS093, GS097, GS104, GS105, GS107, GS108, GS109, GS111, GS112, GS113, GS117, GS118, GS119 · dropped · how the agent works (records, skills, rules diet, scorecard, speed, this audit) — no product rule
- GS039, GS040, GS074, GS075, GS089, GS114, GS115, GS116 · dropped · accounts, post-out, one rule, two squadrons — slice 3/5
- GS041 · dropped · [DRAFT-PENDING] review log — built (D118)
- GS043, GS044, GS078, GS081, GS087, GS090 · dropped · OIL award and OIL work-start — slice 1
- GS072, GS073, GS094, GS095, GS096, GS098, GS099, GS100, GS101, GS102, GS106 · dropped · the Leave War — slices 6, 7
- GS076 · dropped · change recording / undo of the roster — slice 12 (question 34)
- GS079, GS080 · dropped · [DB-READINESS] group A — built; its undo-of-publish row is S2-01
- GS082 · dropped · hidden warnings — slice 4
- GS084, GS085, GS086, GS092 · dropped · rally, CSS, standby flies — slice 4
- GS088 · dropped · inputs and SANS — slice 5
- GS091 · dropped · Tracker — slice 8
- GS103 · dropped · the M365 move plan — platform, no published-record rule beyond the day lock (S2-07)
- GS110 · dropped · pictures round build — slice 10

**Step B questions (4):** 6 AGREE · 7 AGREE · 8 AGREE on screen, export differs (S2-03) · 9 AGREE at entry points, readings S2-04–S2-06.

**Closing count:** 260 inventory items (37 C, 111 W, 3 GD, 39 GN, 70 GS) and 4 questions; all 264 placed; checked as
this slice's: 37 C less 9 dropped, 111 W less 15 dropped, 1 GD, 13 GN, 10 GS (deep read: GS001's §3b, GS016 against
`export.ts`, GS031's AM4/AM32; the other in-scope specs read by their head and status lines only). Items left: none.
Added beyond the inventory: `src/state/persist.ts` 345–347 (S2-01), `src/engine/rules.ts` 117–118 (stale comment),
`src/engine/faceattrs.ts` 141–149 (S2-05).
