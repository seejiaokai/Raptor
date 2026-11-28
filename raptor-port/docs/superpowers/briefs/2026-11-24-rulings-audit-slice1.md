# The rulings audit — slice 1, OIL (chat 173, 24 Nov 26)

A fresh Opus helper, blind to the other slices. Reading only: nothing in the app, a drawing or a rule was changed. Brief:
`2026-11-24-rulings-audit-slice-brief.md`; plan: `../plans/2026-11-24-rulings-audit-plan.md` §3–§5. OIL is earned
leave — time off banked, never pay. The app read is this working copy (`claude/readings-lapse-fix-fdbb3c`); nothing in
this slice lives only on the SANS branch.

**Counts:** findings 5 — MISMATCH 2, OPEN READING 3, NO RULING 0. Items in the lists: 173 (C 28, W 121, GD 2, GN 12,
GS 10) + 7 added (plainly OIL, missed by the lists) = 180; all 180 checked; none left. Step-B questions: 1–5 and the OIL
half of 9 — six tables below.

## Findings

| Id | Class | The item (what a person sees or the app does) | Where | Ruling(s) and his words quoted | The difference, in one sentence | The reading's standing | Harm | When it happens · worked example | The question it would become (recommendation) |
|---|---|---|---|---|---|---|---|---|---|
| S1-01 | OPEN READING | A weekend or holiday flight with a take-off typed and **no landing** (blank or "TBD") earns OIL up to its assumed landing (take-off + Logic's "A flight", 60 min) plus the debrief; it is no longer named as a line with no usable times. A published day keeps the flight length with its OIL, and changing "A flight" on the Logic page makes a published weekend read pending and drops its four sign-offs. | `src/engine/oil.ts` 187–190 (`fltOilWin`), 240–241, 341, 523; `src/engine/faceattrs.ts` 96; `src/ui/pendlist.ts` 534–535 (`OIL_VALS` adds `fltLen`); the Logic page's words `src/ui/logic-html.ts` 59, 201–203; tests `engine/oilflighttimes.test.ts` 154–157, `engine/assumedlanding.test.ts` 146, `leavewar/assumedlanding-published.test.ts` 1 | D2046: *"B"* — "every check that reads the landing uses that assumed time", the row adding "**The agent's reading, not checked:** the tight turn, the debrief, the crew rest, the long day and OIL all read the assumed landing." D2053 (his *"Insights and long day yes"*) answers only Insights and the long day, and repeats "**The agent's reading, not checked:** OIL reads the same assumed landing." Against it: D31 — "Where there is no window, a credit would be invented rather than earned"; D360 — "Still credit nobody OIL for that row … nothing is credited from a guessed hour". | His question was about warnings (the tight turn on Ranger's Friday) and Insights' hours; the build carried the guessed landing into OIL, where two earlier rulings of his say a guessed end credits nothing. | **Never put to him.** Both rows say "not checked". Searched: every full row and the archive for "assumed" with OIL; the 15 Nov warning-words questions page (`docs/mock/2026-11-15-warn-words/page.html` — OIL not asked); the build, check and code-read briefs of 16 Nov (OIL named only as built); HANDOFF and its archives. The test note "OIL among them is the agent's reading, flagged to him" (`oilflighttimes.test.ts` 155) has no question, page or answer behind it that I could find. | **OIL** — earned or not, from a guessed time | Rare but real: a weekend sortie whose landing box is left blank or "TBD" when the day is published. **Sat 18 Jul:** Ranger on VL BFM, take-off 09:00, landing blank. Before 15 Nov the day named the line ("no usable times") and he earned nothing until someone typed a landing. Today it earns from his report 06:00 to 10:00 plus the 2 h debrief — 06:00–12:00, credited on publish with no landing ever typed. And if an admin later changes "A flight" to 90 min, every published weekend with such a flight reads "1 pending" and loses its sign-offs. | "When a weekend flight is published with no landing typed, should it earn OIL up to the assumed landing (as built), or earn nothing and be named until the landing is typed — as a row with no end time does today?" Recommendation: put it to him with both cases; I lean to **earn nothing, named**, because his D31/D360 rule ("a credit would be invented") is about OIL and is the more specific, while D2046 was asked about crew-rest warnings. |
| S1-02 | MISMATCH | In OIL Earn, the words explaining why a man earns nothing from an input name the wrong person as having said No: the ALL AVAIL window's hint "Whoever filed this “Training” answered No to OIL, so by default nobody behind it earns."; a puck's title "<cs> — whoever filed this “Training” answered No to OIL; tap to credit him anyway"; and, on a one-person input, "<cs> answered No for this “Training” — tap to put him on it anyway". | `src/ui/oilmode.ts` 318–320 (`oilHeldClaimHint`), 795–803 (the `declined` and `filerNo` titles); the reason picked at 285–296 (`oilOffReason`) | D762: "the OIL question has one answer, for everyone in it: **whoever filed it, or an admin, gives it**". D782: "The admin answers a day's open OIL questions from one list … each answer the input's own, stamped with who gave it." The app's own note at `oilmode.ts` 286–288 says the words should say the answer is "whoever filed it's or an admin's". | The answer may be an admin's (from the day's one list, the holiday list, or the input window), but the words always pin it on the filer, or on the man himself. | n/a — a clear ruling; the words simply lag D762 (they date from D711 (1), "the answer is the FILER's", which D762 replaced). | **Told wrongly** — wording only; who earns is right | Whenever an admin answers No for an input someone else filed — the day's one list, "No to all" after a holiday is declared. **Sat 18 Jul:** Ranger files a Training for ALL AVAIL and leaves the OIL question open; Hunter, an admin, picks "No to all" in the day's list. The scheduler opens OIL Earn, then the ALL AVAIL window: "Whoever filed this “Training” answered No to OIL" — Ranger never answered. On Ranger's own one-person input the puck says "Ranger answered No". | Not a question — a fault to file: the words should say the input's answer was No without naming who gave it ("This “Training” was answered No for OIL…"), or name the person the stamp records. New words a person reads: Opus drafts, a fresh Fable reviews (D2441). |
| S1-03 | MISMATCH | The Leave War's sheet for an OIL box the app credited says where it came from: "Earned off the published schedule — change the schedule and the OIL follows." or "Earned off a duty input that was accepted — change that input, not the schedule." | `src/leavewar/ui/BidPicker.tsx` 1161–1164 | D2: "**Only the issued (published) schedule earns OIL, both ways**"; D142: "A day's OIL comes from its latest published version"; the engine rule of 21 Sep 26 (`docs/engine-rules.md` §One source…): "**All OIL now waits for publication** — the schedule's and a claim's alike". | Changing the schedule or the input moves nothing; only publishing the day again does — the sheet tells a reader the OIL "follows" a change. | n/a — a clear ruling; wording. | **Wording only** — a member or scheduler is misled about what moves OIL | Whenever someone taps an FO* / HO* box to ask why it is there. **Ranger's FO* on Sat 18 Jul:** the sheet says "change the schedule and the OIL follows"; the scheduler takes him off Saturday on Edit Schedule and saves — his FO* stays, because the change is waiting in the working copy and nothing has been published. | Not a question — a wording fault to file: "…change the schedule and publish the day again, and the OIL follows." (and the same for the input line). Fable reviews the words (D2441). |
| S1-04 | OPEN READING | An ALL AVAIL / ALL row with a start and no end: "No OIL worked out — this row has no end time" is said only in the ALL AVAIL window's "Who earns OIL" half and on the row in OIL Earn; the "who's available" half, open to everyone, shows only "an hour assumed". | `src/ui/oilmode.ts` 955–960; tests `ui/availopenrow.test.tsx` 3, 134 | D360: *"ok, need to say something like no oil worked out due end time **to the admin**"*. The row's readings (1)–(3) — including (2), "'to the admin' = where OIL is decided — the window's 'Who earns OIL' half and the row's seat in OIL Earn mode … the 'who's available' half, open to everyone, carries the assumed-hour line only" — are "stated to him so he can correct them". | Which places count as "to the admin" was the builder's choice. | **Disclosed, unanswered** — stated in the same turn as his ok, no answer to the readings found (searched the full rows citing D360, the archive, the backlog). | **Told** — low: a member never learns the row earns nothing | Weekend dinner rows with no end. **Sat 18 Jul, DINNER WITH CMD 18:30, ALL AVAIL:** Hunter in OIL Earn sees "No OIL worked out"; Ranger opening "who's available" sees "18:30–19:30 · no end time, an hour assumed" and nothing about OIL. | Low-harm list: "Should members also be told such a row earns no OIL, or only the admin, as built?" Recommendation: as built. |
| S1-05 | OPEN READING | The publish note naming inputs with no OIL answer: more than three are counted ("4 inputs have no OIL answer, so nobody on them earns OIL"); an input holding ALL AVAIL beside named men reads "Training for ALL AVAIL". | `src/leavewar/sync.ts` 2606–2633 (`oilUnansweredLine`) | D2314: "one person 'Ranger's Training', two … three or more 'Training for 3 people', and an input for ALL AVAIL 'Training for ALL AVAIL'"; the row adds "an input holding ALL AVAIL beside named people reads 'Training for ALL AVAIL' too — the agent's reading, told to him." The four-or-more count is the code's own "agent's wording … told to him", in no row. | Two wordings his ruling does not cover were chosen by the builder. | **Disclosed, unanswered** (the ALL AVAIL-beside-names case, told in D2314's row); the four-or-more count: **never put** — only in a code note (searched the full rows and the questions page of 22 Nov). | **Wording only** | A day with four or more unanswered inputs at publish — rare. **Sat 18 Jul** with four Trainings unanswered: "Saturday 18 Jul published and approved. 4 inputs have no OIL answer, so nobody on them earns OIL." — which four is not said. | Low-harm list, one line: "Four or more unanswered inputs are counted, not named — fine?" Recommendation: as built. |

## Side-by-side — the step-B questions

### Q1. Does this man earn OIL from this event on this day, and how much

| Surface | The rule it applies | Rests on |
|---|---|---|
| OIL Earn on the board (green bar, figure) | `oilEarnedWork` over the day's evidence; `oilAmount` against the day's kept "Full day of OIL" | D1, D15, D24, D28, D31, D43, D592, D755 |
| The credit at publication | `creditFrom` → the same `oilEarnedWork`, issued block only; pooled per man per date | D2, D142, D48 |
| The warning list ("earns nobody any OIL") | `oilWouldEarn` → the same body | D81 |
| The pending mark | evidence key of the working copy against the issued one; kept values incl. `fltLen` | D592 (8), D2044, D2054 |
| The ALL AVAIL count chip | the frozen crowd (`sent`) | D1, D44 |

**AGREE** — one body. The one open point is S1-01: all five read the assumed landing, by the builder's reading.

### Q2. Is this day one that can earn OIL

| Surface | Rule | Rests on |
|---|---|---|
| OIL Earn, the evidence's `earns` | `nonWorkingFor(UNIT, iso)` → `isNonWorkingDay` (weekend, `ph`, or an `off`-kind event) | D2, D21, D2195 |
| The warning list | day name Sat/Sun or the same hook | D81 |
| Leave charging | the same `isNonWorkingDay` | D21 ("leave charging is untouched") |
| The tracker's reason words | weekend by date, else PH | — (label) |
| A new holiday's "already published as working days" | `holidayOutOfDate` over the squadron's own published days (`sync.ts` 1350) | D2193, D2195 |

**AGREE** — one predicate; an Off day (`free` kind) is not non-working in any reader (D21).

### Q3. Is this a day off for an input's OIL question — and whose holiday list decides

| Surface | Rule | Rests on |
|---|---|---|
| The question at filing, the one list, the bell | weekend; else off for **any** squadron the input sits in that day (`inputDayOff`, `sync.ts` 1406–1411) | D2195, D2262 |
| The credit | each squadron's pass reads **its own** published day, whose frozen `earns` came from its own list, and credits only its own men (`creditable` → `homeUnitOf(id, iso) === unit`, `sync.ts` 2437) | D2206 ("A man's holiday OIL follows his own squadron's list") |

**DIFFER, RULED.** Followed to the end: an input naming a 142 man and a 149 man on a day only 142 lists asks its one
question; a yes credits the 142 man (142's day earns) and not the 149 man (149's day does not) — what D2206 rules. The
question's words do not say that only some of its people can earn; no ruling covers those words, and the case needs a
borrowed man or a shared input across squadrons, which are not built (D2183) — passed, not a finding.

### Q4. How much OIL does he hold — earned, awarded, the balance

| Surface | Body |
|---|---|
| The OIL tracker's list and balance | `oiltracker.ts` `oilLedgerFor` |
| Balances' OIL BAL, the person window, a bid's "leaves you at −x", approvals | `counters.ts` `oilLedgerOf` → `oilLedgerFor` (`approvals.ts` 154, `myleave.ts` 61, `store.ts` 5232) |
| The Unpublish warning's "already spent" | `sync.ts` 2759–2763 → `oilLedgerOf` with the credit left out |

**AGREE** — one ledger body. Earned vs awarded named apart (D400): `earned` / `awarded` kept separately in the ledger.
Expiry ("OIL lasts", default Forever) is his own ask of 2 Sep 26 (commit `dfc0dde5e`, "Owner asks"), applied in the same
one body. The Balances page's own drawing is slice 7's.

### Q5. What an input's yes is worth — half a day or a full day

| Surface | Rule | Rests on |
|---|---|---|
| The OIL question's "Yes: credit FO/HO" | the input's own hours (`inputOilAmt`) — shown, not chosen | D782, D837 |
| The box finally posted | the man's whole day's span against "Full day of OIL" (`oilAmount`); the answer's value counts only as yes/no (`oilev.ts` 1263) | D592 (5), the owner's ask of 29 Aug 26 |

**DIFFER, RULED.** The approved wording of the question (D837/D839, list 3 row 10) said "Hours count start to finish
for the day, so published work the same day can raise the credit."; he then had that line deleted as self-explanatory
(D846) — the rule stands, unsaid on screen by his choice.

### Q9 (OIL half). Which Logic settings judge a published day's OIL

| Surface | Values | Rests on |
|---|---|---|
| The credit (`desiredOilCells` → the block's kept values) | report lead, debrief, Full day of OIL, **flight length** | D592 (4), D2044; `fltLen` by S1-01's reading |
| The pending list (`pendlist.ts` `OIL_VALS`) | the same four | D2054 (built, see ledger GN047) |
| The working copy once anything waits | today's | D2013 |

**AGREE** among the readers. D2044 names three settings; the fourth is S1-01.

## Coverage ledger

Form: `item · class · ruling — note`. MATCH means it does what the ruling says (on an approved reading where one is
involved); "pass" means it states or enforces no rule, or is plainly not this slice's.

**List 1 — comments (C)**
- C0018 · OPEN READING → S1-01 · D2046, D2053
- C0027 · MATCH · D2053 (Insights/long-day half approved by "Insights and long day yes"); its OIL clause is S1-01
- C0041 · OPEN READING → S1-01 · D2046, D2005
- C0048 · OPEN READING → S1-01 · D2046, D2044
- C0049 · OPEN READING → S1-01 · D2046
- C0050 · OPEN READING → S1-01 · D2046 (the D56 clause for an old block is right)
- C0051 · OPEN READING → S1-01 · D2046
- C0052 · OPEN READING → S1-01 · D2046
- C0055 · OPEN READING → S1-01 · D2046 ("flagged to him" — no trace found)
- C0059 · MATCH · D470, D755, D776 — a Personal input earns nobody, whoever is behind its puck (the page states it)
- C0097 · MATCH · D591 ("the actual intime/rally time … not the nominal report timing"), D592 (1)–(2) — a later typed time starting the day later is his own words' consequence; reading (6) needs no answer
- C0098 · MATCH · D360 (crowd counted over the assumed hour; nobody credited) — his ok to that proposal
- C0099 · MATCH · D606, D1041 — "The shift still earns OIL from its R or B." is true of a MAIN shift; new words, "his to change" — wording for slice 10/Fable
- C0117 · OPEN READING → S1-01 · D2046, D2044
- C0149 · pass · comment on pass order (`sync.ts` 4216), no rule — slice 7
- C0162 · pass · "tbc" is a class name in a test; D1158 — slice 6
- C0189 · MATCH · D660, D762 — the filer gives the one OIL answer for everyone; permissions are slice 3's
- C0209 · OPEN READING → S1-04 · D360 reading (2)
- C0213 · OPEN READING → S1-04 · D360 reading (2)
- C0236 · MATCH · D762, D660 — "OIL?" shown to whoever may answer (the filer or an admin); its permission test is slice 3's
- C0240 · OPEN READING → S1-01 · the Logic page line saying OIL counts to the assumed landing
- C0245 · OPEN READING → S1-01 · D2046 (the OIL "How it works" line)
- C0246 · MATCH · D2046, D2047 — the "A flight" setting's own row and words; the OIL half is S1-01
- C0250 · OPEN READING → S1-04 · D360
- C0255 · pass · "his call" matched a callsign helper; the line's words are D592 (8)/D2054's pending-list words — MATCH
- C0258 · OPEN READING → S1-01 · `fltLen` in the pending list's values
- C0274 · pass · "not his to change" = a member's permission, slice 5/3
- C0275 · pass · the same; D762 ("he has none of his own") — MATCH

**List 2a — words (W)**
- W0032 · pass · aria label "open his OIL" — D1209 (a tap on OIL opens the tracker) MATCH
- W0049 · pass · column label
- W0066 · MATCH · D260 ("its confirm names each award first")
- W0070 · MATCH · D402 / D261 (an award's box, change from the day's list)
- W0071 · MATCH · D261 ("its reason, who gave it and how many days")
- W0072 · MATCH · D79 ("OIL may be credited by hand on any day")
- W0097 · pass · a code comment the net caught, not on screen
- W0101 · MISMATCH → S1-03 · D2, D142
- W0105 · MATCH · D400 ("earned" = what the app credited)
- W0112 · pass · label
- W0128 · pass · title
- W0158 · pass · legend label
- W0159 · MATCH · D400, D402, D1306 (the star marks the app's credit)
- W0281 · MATCH · D2 (a PH can earn; publication is said elsewhere)
- W0282 · MATCH · D21
- W0284 · MATCH · D2
- W0285 · MATCH · D21
- W0434 · pass · label
- W0435 · pass · heading
- W0438 · MATCH · his ask of 2 Sep 26 (OIL expiry policy, `dfc0dde5e`)
- W0442 · pass · label of the same
- W0461 · pass · label
- W0477 · pass · title
- W0478 · MATCH · his ask of 2 Sep 26 (batch credit), D79
- W0504 · pass · colour table, not words
- W0515 · pass · aria label
- W0566 · pass · label
- W0567 · MATCH · D79
- W0747 · pass · bell line — slice 9
- W0760 · pass · permission table entry — slice 3
- W1569 · MATCH · D838 (N12 second sentence)
- W1571 · MATCH · D142, D44 (the issued day's earners)
- W1579 · pass · heading
- W1600 · MATCH · D15, D24, D31 (an ⓘ row earns nothing)
- W1602 · MATCH · D839 list 3 row 8, D15
- W1608 · MATCH · the same
- W1640 · MATCH · D838
- W1659 · MATCH · D31 (never a silent absence) — overflow rows carry no switch, the line says where it is
- W1682 · MATCH · D838 (N11)
- W1683 · MATCH · D838 (N11)
- W1688 · MATCH · D838 (N10)
- W1689 · MATCH · D839 list 3 row 8
- W1690 · MATCH · D839 list 3 row 2
- W1837 · MATCH · D1994, D2019, D2026
- W1838 · MATCH · the same
- W1992 · MATCH · D1 (the bar's amount in the title)
- W1997 · MATCH · the same
- W1999 · MATCH · D31 ("No measurable hours yet")
- W2007 · MATCH · D1, D37
- W2009 · MATCH · the same
- W2053 · MATCH · D15, D31
- W2058 · MATCH · D1044, D1045, D1061
- W2081 · MATCH · D1094 ("words that stand as built")
- W2083 · MATCH · D1094
- W2161 · pass · tag "OIL?" — D814/D804 MATCH (shown only where the question can be asked; slice 5 owns the card)
- W2186 · MATCH · D804, D782
- W2261 · pass · done note
- W2309 · pass · title — who may change it is slice 3/5
- W2310 · pass · label
- W2311 · MATCH · D804
- W2312 · pass · aria label
- W2313 · pass · label
- W2315 · pass · aria label
- W2369 · pass · label
- W2451 · MATCH · D1094, D839 list 3 row 4
- W2452 · MATCH · D1094 ([UNPUB-WARN-AL-RESTORES] words, D142)
- W2456 · MATCH · D838 (N2)
- W2457 · MATCH · D142 (the earlier version credits again)
- W2498 · pass · the setting's name
- W2523 · MATCH · D49
- W2533 · MATCH · D31, D2055
- W2534 · MATCH · D606, D1041
- W2542 · pass · check name
- W2543 · MATCH · D2, D592 (5)
- W2544 · MATCH · D2
- W2548 · MATCH · D24, D1042–D1046, D606
- W2549 · MATCH · D2019 (approved "once the wave flies the desk earns by itself"), D1997
- W2550 · MATCH · D804 (publication said in the line above)
- W2551 · MATCH · D48, D142
- W2552 · MATCH · D31, D81
- W2554 · MATCH · D19
- W2556 · MATCH · D2 (republishing says so: OIL_STALE_HOLIDAY)
- W2557 · MATCH · D54
- W2653 · MATCH · the several-days form keeps its words (D808, noted in `OilConfirm.tsx` 64–66); D923
- W2656 · MATCH · D837 (the question's words of record)
- W2659 · pass · done note
- W2660 · pass · done note
- W2662 · MATCH · D2193
- W2663 · MATCH · D2193
- W2671 · pass · title
- W2675 · MATCH · D762 (unanswered: no person named)
- W2676 · MISMATCH → S1-02 · D762
- W2678 · pass · label
- W2680 · pass · title
- W2681 · pass · label
- W2682 · pass · title
- W2683 · MATCH · D1782 (its hover, word for word)
- W2684 · MATCH · D1782 ("No OIL earned")
- W2685 · MATCH · D1782 (the note under the bar)
- W2692 · MATCH · D31
- W2698 · MATCH · D28 (an item switch)
- W2704 · MATCH · D360
- W2705 · pass · OIL Earn holds the day still while open — a mode's behaviour, not who may act or what earns; built 22 Sep 26 with the mode, design of record GS027
- W2710 · MATCH · D783, D831, D840
- W2711 · MATCH · D840
- W2712 · MATCH · D783 (a move waits the same way)
- W2714 · MATCH · D793
- W2715 · MATCH · D804, D840
- W2716 · MATCH · D816, D840
- W2717 · MATCH · D816 (the ⓘ mark treated as the cancel), D865
- W2726 · MATCH · D783 ("Answer OIL")
- W2768 · MATCH · D2054 (built; see GN047)
- W2769 · MATCH · D2054
- W2770 · MATCH · D592 (8), D2044
- W2845 · MATCH · D839 list 3 row 8
- W2937 · pass · title (dup of W2680)
- W2938 · pass · title (dup of W2682)
- W2939 · MATCH · D839 list 3 row 2
- W2941 · pass · label
- W3037 · pass · passing note on a bell tap — slice 9
- W3041 · MATCH · D839 list 3 row 7

**Added — plainly OIL, missed by list 2a (built from pieces)**
- W-add1 `ui/oilmode.ts` 795–797, a one-person input's puck title "<cs> answered No for this … — tap to put him on it anyway" · MISMATCH → S1-02 · D762, D782
- W-add2 `ui/oilmode.ts` 802–803, "<cs> — whoever filed … answered No to OIL; tap to credit him anyway" · MISMATCH → S1-02 · D762
- W-add3 `ui/oilmode.ts` 804–805, 806–807 ("has not been answered yet; tap to credit him"; "this kind of event earns nothing by default") · MATCH · D762, D24
- W-add4 `ui/AvailWindow.tsx` 347, "Nothing on this day earns. Turn off the switch to change men one by one." · MATCH · D845 reading (1), D1782
- W-add5 `ui/OilDayList.tsx` 68, 87 ("waiting for your answer"; "Later: <name> signs, but nobody on it earns OIL.") · MATCH · D2299, D2312 (the plural "on them" is the same sentence)
- W-add6 `leavewar/sync.ts` 2631–2633, the publish note's unanswered-input sentence · MATCH · D2294, D2314; its two uncovered wordings → S1-05
- W-add7 `ui/OilConfirm.tsx` 150–153, the single-day question and "Yes: credit FO/HO" · MATCH · D837, D846 (small print and hint deleted on his word)

**List 3a — drawings (GD)**
- GD027 `mock/2026-11-17-lw-oil-editor/` · MATCH · D2150, D2155 — built as option 2 (`OilTracker.tsx` 599, `oiltracker.css` 380–396); a built drawing is out of scope from here (layout only, slice 7 for the editor)
- GD041 `mock/2026-11-22-oil-unanswered-publish/` · MATCH · D2294, D2297, D2299, D2312, D2316 — built as round 6 (`OilDayList.tsx`, `oilsign.ts`, `sync.ts` 2606–2633)

**List 3b — ruled, not built (GN)**
- GN017 (oil page, the swap bar) · MATCH · D783, D831, D840 — built (`oilwait.ts` `WAIT_WORDS`, `OilWaitSheet.tsx` 125–126); the list's "says not built" is a keyword catch
- GN037 (move: a group OIL credit gives the lawful ones) · not built; nothing built contradicts it — drawing is slice 3's
- GN047 (D2054, the pending list's OIL line) · MATCH · **built** (`pendlist.ts` 537–551 `oilShiftNote`, commit `195bf8ec4`); the scheduler page's line 158 still says "not built" — a stale record line, for the host to correct
- GN051 (take a man out of an ALL AVAIL crowd by hand, D2330–D2436) · not built; its OIL half (D2433, out of the count and the earning) is consistent with the OIL page — slice 4/5
- GN059 (bell lines across squadrons) · pass — slice 9
- GN063 (each squadron's own holiday list) · MATCH for what is built: `nonWorkingFor(unit)` per war, `holidayOutOfDate` lists only the squadron's own published days (`sync.ts` 1350); the detachment list is not built
- GN087 (a line judged by its schedule's Logic, OIL's full-day line aside) · not built (multi-squadron) — nothing built contradicts it
- GN103 (a transfer carries his OIL) · not built — slice 3
- GN105 (OIL for a day worked for both squadrons, D2183) · not built: today a squadron's pass credits only its own men from its own days (`desiredOilCells` `creditable`); a borrowed man's line is "not this step's" in the code — consistent until built
- GN126 (the writing guide's wordings, the OIL question's) · MATCH · D837, D839 — built (`OilConfirm.tsx` title, sentence, buttons)
- GN129 (D2428, the ALL AVAIL window's earning side, "Tap a puck to stop a man earning from this event.") · not built; no clash with the board's own OIL Earn line (W1690, a different place) — slice 4/5
- GN130 (deleting a man lists each OIL award) · pass — D337, D710, slice 3/5; "never a credit the schedule earned" agrees with D290/D299 in `desiredOilCells`

**List 3c — specs and plans (GS)** — all are OIL jobs built and merged; the open items they name are not OIL's.
- GS012 · pass · not OIL (person ids) — slice 4
- GS027 (OIL Earn's design of record, §8–§9) · MATCH · the oil page's Settled line; the mode as built follows it
- GS028 (award add review log) · pass · history of a built job (D82, D400)
- GS030 (OIL seats final read) · pass · history; its D54 item is ledger W2557
- GS043 · pass · red team of a built plan
- GS044 · pass · the same
- GS067 (engine rules review, family 9) · MATCH · its two drifts are fixed: 9.1 (the Logic line now "Any other row the scheduler adds … but a request answered yes earns over its own times", `logic-html.ts` 203) and 9.2 (D1994's words, W1837)
- GS078 · pass · plan of the built one-kind award (D400)
- GS081 · pass · plan of built phase 7 (D25 words — "OIL is earned leave" on screen)
- GS087 · pass · plan of built [OIL-WORK-START] (D591, D592, D606)
- GS090 · pass · plan of the built small OIL job (D816, D818, D865)

**Closing count:** 180 items (173 listed + 7 added); 180 checked; 0 left. Dropped as plainly not this slice's (named
above as "pass — slice n"): C0149, C0162, W0747, W0760, W3037, GN059, GN103, GS012, and the permission halves of C0189,
C0236, W2309. Findings: S1-01 to S1-05. One record out of step, not a finding class: the scheduler page's D2054 line
says "not built" though it is built (GN047).
