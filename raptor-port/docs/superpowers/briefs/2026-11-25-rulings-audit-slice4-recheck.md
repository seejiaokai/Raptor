# The rulings audit — slice 4's 176 strings, read again (and slice 5's "passed" strings of the four inputs files)

Written 25 Nov 26 by a fresh Opus helper, blind to slice 4's helper. Reading only: nothing in the app, a drawing or a
rule was changed, nothing committed. Asked for by review 2 (`2026-11-25-rulings-audit-review-2.md` §5, R19): slice 4's
ledger passed 176 rule-stating strings as "read; a rule-stating string with no clash found" and named no ruling for any;
two were wrong (W2538, W1736). Method: the helpers' brief (`2026-11-24-rulings-audit-slice-brief.md`) and the plan's §3
(`../plans/2026-11-24-rulings-audit-plan.md`). For each string: what it says, read from the code at its line where it
was not plain; the governing ruling found by subject with the shell across every full-rows file and
`DECISIONS-ARCHIVE.md`; the row opened and compared word by word; the original app (`raptor-port/reference/scheduler.html`)
searched where the behaviour predates the rulings list. Nothing was run in the app.

Already known and not re-reported (cited only): review 2's F3–F6, review 1's and review 2's questions (Q1–Q9) and low
items. Not findings, by the brief: data already stored (D56); a scheduler who is not an admin (D785).

**About the ids:** the 176 are exactly the ledger's lines carrying that stock phrase (`…-slice4.md`, List 2a). W2538, which
review 2 names as one of the two wrong ones, is not among them in the ledger as it stands (it carries its own line citing
D178, D1357); W1736 is. W2538 is review 2's F6 either way.

## 1. Counts

| Class | The 176 of slice 4 | Slice 5's who-may sentences (§4) |
|---|---|---|
| MATCH, with its ruling named | 94 | 9 |
| NO RULE STATED (a label, heading, empty-state line, generic failure, code fragment or a description of a control — plan §3.6) | 79 | — |
| OPEN READING | 2 (W1572, W2785) | 0 |
| MISMATCH — new | 0 | 0 |
| MISMATCH — already known (F3) | 1 (W1736) | 2 (W2192, W2204) |
| NO RULING | 0 | 0 |

Of the 94 MATCH lines, two carry a note: W0806 (its ruling defers the words to the Transfer step; the code comment above
it is stale — R-a) and W1947 (D1785 replaced these words for one case; the cases left live only in stored data — D56,
A-c). One more aside on wording only (W1735, A-b).

## 2. Findings — the two OPEN READINGs (plan §4 form)

| Id | Class | The item | Where | Ruling and his words | The difference | The reading's standing | Harm | The question it would become |
|---|---|---|---|---|---|---|---|---|
| O1 (W1572) | OPEN READING | The ALL AVAIL window's hint, in OIL Earn, under the day's "No OIL earned" switch: "Nothing on this day earns. Turn off the switch to change men one by one." | `raptor-port/src/ui/AvailWindow.tsx:347` | D845: the refusal reads *"Nothing on this day earns. Turn off the switch first."* — "his own wording, in every place it is said: a man's puck, an event's own OIL mark, a man in the ALL AVAIL window"; D1782 keeps those words | The window's standing hint uses a longer second sentence ("…to change men one by one") than the refusal he worded; the refusal itself, on a tap in the window, is his (`ui/availwin.test.tsx` 771) | **Disclosed, unanswered** — D845's row, reading (1): "the ALL AVAIL window's hint follows it — … ('to switch men' became 'to change men' there only because 'the switch to switch' read badly)", told; no answer of his in D845, D1782 or later (searched "change men", "one by one", the N12 rows of `2026-10-13-wording-recheck.md`) | Wording only | When: an admin settling a weekend's OIL switches the whole day off, then opens an ALL AVAIL item's window — a few times a month. Example: Saturday 18 Jul, "No OIL earned" on; Saber taps the OPS BRIEF's ALL AVAIL count; the window's foot reads "Nothing on this day earns. Turn off the switch to change men one by one." Question: keep the window's hint as it is, or make it his sentence too? Recommendation: keep it — it says the same, and the tap in the window already gives his words. For the low-harm list. |
| O2 (W2785) | OPEN READING | "RESTRICTED" printed at the top and foot of every page of Export as PDF | `raptor-port/src/ui/printpdf.ts:95,99` (the test `printpdf.test.ts` pins it as "the agency-report marking (owner, 16 Sep 26)") | None found: searched "RESTRICTED", "classification", "marking", "agency", "report-grade", [FLAG-EXPORT] in every full-rows file and the archive. Nearest: D1644 (4 Nov 26) — *"skip the pdf until i say so"*: [FLAG-EXPORT] waits for his word; D1530 sets aside the SWiFT kit's red flags, "whether the flying schedule … count[s] as operational information" among them | The page states a handling classification for the printed schedule that no ruling of his gives; the build commit (`3ed5c7b6e`, 16 Sep 26) called the whole look "a DRAFT for the owner to pick/adjust — his call", and the backlog still lists "sample PDFs for his look" | **Never put as a ruling** — a draft awaiting his look (`OUTSTANDING.md` [FLAG-EXPORT], held by D1644); the test's "(owner, 16 Sep 26)" has no row behind it | Low — words on a printout; but a classification marking is his squadron's call, not the agent's | When: a scheduler exports the week as a PDF to send on — weekly. Example: Saber exports the week of 13 Jul; both ends of every page read "RESTRICTED". Question (put only when he lifts D1644's hold on the PDF work): is "RESTRICTED" the marking his printed programme should carry, another, or none? Recommendation: ask with the [FLAG-EXPORT] samples, not before. |

**Already known, cited only:** W1736 (`ui/caldrag.ts:114`, "Only a scheduler can move someone else's input") is review
2's F3 (S5-M1). In slice 5's four files, W2192 and W2204 (`ui/inputedit.tsx` 1336, 2105) are F3's family, named in review
2's F3 and R19.

## 3. Records notes and asides (no question, nothing for him)

- **R-a (W0806) — a stale comment.** `state/typing-hold.ts` 38–43 says the approved drawing and the plan give no
  sentence for the schedule's pages, so they read "This change could not be saved." D2265 (22 Nov 26, "All outstanding
  questions as recommended") gave one: "You are 149's from today. This can't be saved in 142's Inputs." (the page named)
  — "drawn first where words are new and built at the Transfer step", filed [MULTI-SQN-DESIGN]. The interim words are
  what the ruling allows until then; the comment should cite D2265 and say the words wait for the Transfer step. Reword
  with the next change to that file.
- **A-b (W1735) — two names for one thing.** The refusal says "Only a scheduler can move planning sections"; the same
  thing is "planning note" on screen ("New planning note", "Edit planning note", and the success note "Note moved").
  Who may is right (the planning notes are the scheduler's scratch pad of his 22–24 Aug 26 asks; D683 (3) "they are an
  admin's buttons"); only the noun differs. For the wording pass (D808), not a finding.
- **A-c (W1947) — not a finding, by D56.** D1785 ("All as recommended", 8 Nov 26) "replaces the words that blame 'an
  older version of the app' and send him to 'the device that created it'". The builder replaced them for a week whose
  saved copy cannot be read (W1948, his words) and kept the old sentence for a day an older version of the app
  published, and for an approved day with no issued copy to show (`ui/html.ts` 201–212). Both cases arise only from
  data already stored; the app writes neither going forward. D56 applies: no question, no fix. Said so the next reader
  does not reopen it.

## 4. Slice 5's "passed" strings in the four inputs files — the who-may sentences

All 101 strings slice 5 passed as labels in `ui/InputWindow.tsx`, `ui/InputsCal.tsx`, `ui/caldrag.ts` and
`ui/inputedit.tsx` were read. Eleven say who may act; the other 90 are labels, buttons, headings, placeholders, generic
failures, a date-picking prompt or code fragments (W2199, W2213, W2372–W2374).

| Id | Where | The string | Class | Ruling |
|---|---|---|---|---|
| W2188 | ui/inputedit.tsx:1141 | You can file ${what} only for yourself (leave, an upchit, a medical entry, SANS availability, "this") | MATCH | D655 — a member files for others "duties and commitments only — never leave, never medical"; D658 — never SANS availability; D731 (8) the switch-off words, the line above it |
| W2192 | ui/inputedit.tsx:1336 | You can only edit your own inputs | MISMATCH (known) | D655 "Him, the filer, and an admin" — F3's family (review 2 F3, R19) |
| W2204 | ui/inputedit.tsx:2105 | You can only delete your own inputs | MISMATCH (known) | as W2192 |
| W2217 | ui/InputsCal.tsx:1013 | You are out of this input | MATCH | D755 (3) — "he may always withdraw himself"; D763 |
| W2347 | ui/InputWindow.tsx:822 | You are out of this input | MATCH | D755 (3), D763 |
| W2237 | ui/InputsCal.tsx:1197 | Take yourself out of this input? | MATCH | D755 (3); D1626, D1628 (the question hangs from its control) |
| W2385 | ui/InputWindow.tsx:1241 | Take yourself out? (its question: "…It stays for the other N people.") | MATCH | D755 (3), D762; D1626 |
| W2235 | ui/InputsCal.tsx:1195 | Delete this input? (its question: "Delete this input for all N people?" where it holds several) | MATCH | D655 — the man, the filer and an admin may delete; a shared one for everyone by its filer or an admin (D731, D756); D1626, D1628 |
| W2388 | ui/InputWindow.tsx:1250 | Delete for everyone? (the card's label; its question "Delete this input for all N people?") | MATCH | D655, D756; D1626 ("Delete this input for all N people?") |
| W2356 | ui/InputWindow.tsx:1039 | Rejected by a scheduler | MATCH | D1356, D1388 — once a scheduler has moved a member's Other, only a scheduler changes where it goes |
| W2358 | ui/InputWindow.tsx:1041 | Counted as away on the Leave War | MATCH | D1356, D1357, D1374 — under Unavailable it counts him out, 1 or 0.5 |

No new who-may fault in slice 5's passed strings beyond F3's two.

## 5. The 176 strings, one line each

Columns: id · file:line (under `raptor-port/src/`) · the string as the inventory holds it (cut at 140 characters) ·
class · the governing ruling, or why it states no rule. "The original app" means `raptor-port/reference/scheduler.html`,
the spec for behaviour that predates the rulings list (`raptor-port/CLAUDE.md`).

| Id | Where | The string | Class | Ruling, or why none |
|---|---|---|---|---|
| W0705 | state/flyplan-model.suite.ts:50 | "every Thursday from a date onward, no end" holds from that date and not before | NO RULE STATED | a test suite's own title, never shown to a person |
| W0709 | state/flyplan.ts:89 | This change could not be saved. | NO RULE STATED | the generic failure line of a refused save |
| W0710 | state/flyplan.ts:97 | The setting could not be saved. Try again. | NO RULE STATED | the generic failure line of a save that did not stick |
| W0712 | state/flyplan.ts:145 | Choose the weekday, what kind of day it is, and the date it starts — an end date cannot be before the start. | MATCH | D631, D795 — the From date, an optional Until, never before the start (D795's reading: "a date before the From date cannot be picked") |
| W0713 | state/flyplan.ts:150 | That rule is no longer there. | NO RULE STATED | a refusal for a rule already gone |
| W0716 | state/flyplan.ts:184 | No figure starts on that date. | NO RULE STATED | a refusal for a figure already gone |
| W0733 | state/mission-roles.ts:143 | Only a scheduler can copy mission roles | MATCH | D785 (a scheduler is always an admin), D2211 (Plan: full access as its own admins) — copying a day's mission roles is schedule editing |
| W0798 | state/sched-commit.ts:262 | (), restoredPersons = new Set | NO RULE STATED | a code fragment the scan took for a sentence |
| W0804 | state/store.ts:1032 | This can't be saved in ${unitNum(world)}'s ${page}. | MATCH | D2243 Q7 — the band "You are 149's from today. This can't be saved in 142's Leave War." (or "…in 142's Tracker.") |
| W0805 | state/store.ts:1034 | This change could not be saved. | NO RULE STATED | the generic lead for a world change with no approved words (a right ended mid-day — dormant) |
| W0806 | state/typing-hold.ts:44 | This change could not be saved. | MATCH — deferred by its own ruling; records fix | D2265: a schedule-side window held at midnight says "You are 149's from today. This can't be saved in 142's Inputs." — "built at the Transfer step", filed [MULTI-SQN-DESIGN]. Today's generic words are the interim; the comment above them (state/typing-hold.ts 38–43) says no words were ever given — stale since 22 Nov (§3, R-a) |
| W1562 | ui/AvailWindow.tsx:223 | This row is no longer on the schedule. | NO RULE STATED | a note that the row has gone |
| W1567 | ui/AvailWindow.tsx:279 | This is the day as it was issued. Change who earns on the working copy. | MATCH | D142 (OIL from the latest published version), D24/D45 (a published day changes only through an amendment, worked on the working copy) |
| W1568 | ui/AvailWindow.tsx:280 | Only a scheduler can change who earns | MATCH | D785; OIL page "the admin can always override in OIL Earn" (D28) |
| W1571 | ui/AvailWindow.tsx:345 | Who earned OIL on the day as it was issued. | MATCH | D142 — the window opened from an issued version lists who earned on it |
| W1572 | ui/AvailWindow.tsx:347 | Nothing on this day earns. Turn off the switch to change men one by one. | OPEN READING | D845 reading (1), told, never answered — see §2, O1 |
| W1585 | ui/board-html.ts:141 | No personal inputs submitted for this day. | NO RULE STATED | empty-state label |
| W1587 | ui/board-html.ts:178 | Add a note line | NO RULE STATED | button title |
| W1588 | ui/board-html.ts:178 | + Note | NO RULE STATED | button label |
| W1589 | ui/board-html.ts:179 | Nothing yet — “+ Note” adds a line that every viewer sees at the top of the day. | MATCH | the original app (reference/scheduler.html: "overall notes for the whole day") — the Overall notes are the day's public lines; the scheduler-only choice (D1588) is the scheduler notes', not these |
| W1591 | ui/board-html.ts:191 | Remove this note | NO RULE STATED | button title |
| W1594 | ui/board-html.ts:204 | Nothing squadron-wide yet — “+ Item” adds a mass brief, PT, safety stand-down and the like. | NO RULE STATED | empty-state description of the Common Programme (the original app's squadron-wide panel) |
| W1600 | ui/board-html.ts:266 | Info only — not checked against the rules, and earns no OIL | MATCH | D15, D24 ("an ⓘ row … do not earn"), D839 row 8, the N10 wording (D838) |
| W1601 | ui/board-html.ts:268 | ${x.cx?'Restore this item':'Cancel this item (CX)'} | MATCH | the original app's CX; D760 (5) — a CX on the scheduler's own rows unchanged |
| W1602 | ui/board-html.ts:269 | ${x.info?'Info only — tap to check this item against the rules again':'Info only — show this item on the programme, never check it agains… | MATCH | D15, D24, D839 row 8 ("This item is checked against the rules again and can earn OIL") |
| W1603 | ui/board-html.ts:270 | ${x.flag?'Clear the red box':'Red box — flag for the next scheduler'} | MATCH | the original app's red box ("next scheduler"); D760 (5) |
| W1607 | ui/board-html.ts:417 | ${o.cx?'Restore '+what:'Cancel '+what+' (CX)'} | MATCH | as W1601 |
| W1608 | ui/board-html.ts:418 | ${o.info?'Info only — tap to check this item against the rules again':'Info only — show this item on the programme, never check it agains… | MATCH | as W1602 |
| W1609 | ui/board-html.ts:419 | ${o.flag?'Clear the red box':'Red box — flag for the next scheduler'} | MATCH | as W1603 |
| W1614 | ui/board-html.ts:432 | No duty blocks yet — “+ Block” adds one. | NO RULE STATED | empty-state label |
| W1631 | ui/board-html.ts:639 | No ground items yet — “+ Item” adds one. | NO RULE STATED | empty-state label |
| W1632 | ui/board-html.ts:649 | e.g. Two medicals already at 1030 — keep the next one clear of the wave brief. | NO RULE STATED | placeholder example |
| W1633 | ui/board-html.ts:838 | No personal inputs for this day. | NO RULE STATED | empty-state label |
| W1637 | ui/board-html.ts:861 | Nil — everybody is available today. | NO RULE STATED | empty-state label of the Unavailable list |
| W1639 | ui/board-html.ts:889 | No SANS availability filed for this day. | NO RULE STATED | empty-state label of the SANS availability list |
| W1640 | ui/board.ts:62 | This event earns nobody any OIL. Turn the event back on first. | MATCH | D844 reading (3) — "takes the wording he approved for it: 'This event earns nobody any OIL. Turn the event back on first.'" (N12, D838) |
| W1655 | ui/board.ts:213 | Notes | NO RULE STATED | heading |
| W1661 | ui/board.ts:343 | Published Remarks — read only | NO RULE STATED | heading (a published day's remarks, read only — D45) |
| W1664 | ui/board.ts:358 | ${cxOn ? 'Restore this line' : 'Cancel this line (CX)'} | MATCH | as W1601 |
| W1665 | ui/board.ts:359 | ${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'} | MATCH | as W1603 |
| W1678 | ui/board.ts:554 | Creates the ${esc(mkPeriod(w, di))} leave war period, with nothing open for bidding, and takes you to the Leave War to open its dates | MATCH | D19 (the offer hands the scheduler to the Leave War to set its window), D1177 (nothing is open until he opens it) |
| W1681 | ui/board.ts:850 | Already in order | NO RULE STATED | a passing note |
| W1682 | ui/board.ts:939 | Nothing on this day earns OIL, including anything added later | MATCH | D838 — N11 "Nothing on this day earns OIL, including anything added later", as approved |
| W1683 | ui/board.ts:939 | This day can earn OIL again, and the marks underneath are back | MATCH | D838 — N11 "This day can earn OIL again, and the marks underneath are back", as approved |
| W1685 | ui/board.ts:1011 | Red box: flagged for the next scheduler | MATCH | the original app's red box; D760 (5) |
| W1688 | ui/board.ts:1109 | This item is info only: no longer checked against the rules, and earns nobody any OIL | MATCH | D838 — N10 "This item is info only: no longer checked against the rules, and earns nobody any OIL" |
| W1689 | ui/board.ts:1109 | This item is checked against the rules again and can earn OIL | MATCH | D839 row 8 — "This item is checked against the rules again and can earn OIL" |
| W1690 | ui/board.ts:1139 | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | MATCH | D839 row 2 — "OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning" |
| W1707 | ui/board.ts:1750 | No saved templates yet — save this day to start the library. | NO RULE STATED | empty-state label |
| W1714 | ui/board.ts:1815 | "${t.name}" is already the live ${d.dow} | NO RULE STATED | a passing note (templates) |
| W1715 | ui/board.ts:1839 | Nothing is pending: it matches ${the(cv)}. | NO RULE STATED | a passing note — the loaded version matches; nothing waits (D818's note family) |
| W1718 | ui/board.ts:1902 | Issued · read-only | NO RULE STATED | status label of an issued version |
| W1719 | ui/board.ts:1903 | read-only — look, don't change | NO RULE STATED | status label |
| W1735 | ui/caldrag.ts:94 | Only a scheduler can move planning sections | MATCH | D683 reading (3) and D684 reading (1): the planning notes are an admin's ("+ Note" and "+ Pucks" … are an admin's buttons"), the scheduler's scratch pad of his asks of 22–24 Aug 26 — wording aside in §3 (A-b) |
| W1736 | ui/caldrag.ts:114 | Only a scheduler can move someone else's input | MISMATCH (known) | D655 — review 2's F3 (S5-M1); not re-reported |
| W1782 | ui/DaysWindow.tsx:215 | Tap a date’s button to step: day, night, no fly. Tap a weekday’s heading for every such day. | MATCH | D638 — "a weekday's heading sets repeating days"; one stepping button on a phone |
| W1792 | ui/DayTplModal.tsx:81 | No day templates saved yet — open a day's "Templates" menu and choose | NO RULE STATED | empty-state label |
| W1860 | ui/EveryWeekday.tsx:30 | No flying set | MATCH | D642 — "Saturday and Sunday start with no flying set" |
| W1861 | ui/EveryWeekday.tsx:57 | This change could not be saved. | NO RULE STATED | generic failure line |
| W1863 | ui/EveryWeekday.tsx:61 | Choose the date it ends, or pick No end. | MATCH | D795 — Until's "A date", or No end (D631: "from a date onward, with no end") |
| W1864 | ui/EveryWeekday.tsx:62 | It cannot end before it starts. | MATCH | D795 reading — under Until, a date before the From date cannot be picked |
| W1870 | ui/EveryWeekday.tsx:92 | Until | MATCH | D795 ("Until's 'A date'") |
| W1871 | ui/EveryWeekday.tsx:94 | No end | MATCH | D631, D633 ("with no end"), D795 |
| W1874 | ui/EveryWeekday.tsx:106 | Every ${name} from ${fromSaid} onward is ${A_DAY[cls]}, until you change it here. A single ${name} can still be set by itself. | MATCH | D631, D633 reading (1), D638 — every such day from a date onward; each date still its own button |
| W1875 | ui/EveryWeekday.tsx:110 | Cancel | NO RULE STATED | button label |
| W1947 | ui/html.ts:202 | This day's published schedule was created by an older version of the app and can't be shown here. It has not changed — open it on the dev… | MATCH — not a finding (D56) | D1785 replaced these words for a week whose saved copy cannot be read (W1948 carries his words); the builder kept them for a day an older version published or an approved day with no issued copy — both live only in data already stored, the code correct going forward (D56); see §3 (A-c) |
| W1948 | ui/html.ts:210 | This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on th… | MATCH | D1785 — the drawn words, whole |
| W1954 | ui/html.ts:336 | ${esc(DAYS[di]?.dow\\|\\|'')} is still a working draft — not yet published | NO RULE STATED | status label: an unpublished day (D45) |
| W1960 | ui/html.ts:387 | All four have signed this working copy — it has not been published yet; the published schedule stays as-is until you publish | MATCH | D45 (a change to a published day waits for the next amendment), D2294 (the four sign-off boxes) |
| W1962 | ui/html.ts:388 | This working copy has edits that have not been signed and published yet — the published schedule stays as-is until you publish | MATCH | D45 |
| W1966 | ui/html.ts:428 | Working draft — not issued | NO RULE STATED | status label |
| W1977 | ui/html.ts:445 | Flags: | NO RULE STATED | legend heading |
| W1978 | ui/html.ts:446 | conflict | MATCH | D2071 ("Conflict" for "Clash"), D2078 (the Legend as drawn and approved) |
| W1979 | ui/html.ts:447 | crew pairing — not authorised | MATCH | D2078 — the Legend approved as drawn, "only the words changing" for the renamed checks; the pairing labels unchanged on it |
| W1980 | ui/html.ts:448 | crew rest | MATCH | D2078 |
| W1986 | ui/html.ts:454 | crew pairing — needs approval | MATCH | D2078 |
| W1993 | ui/html.ts:536 | Crew rest — ${trace.dow\\|\\|'the next day'} is broken by this day: he had to leave by ${trace.leaveBy} | MATCH | D183 — the dotted "breaks tomorrow's crew rest" mark stays live; D469/D475 its hide |
| W1995 | ui/html.ts:539 | ${esc(trFlag?trLbl:wlbl(CHIP_LABEL[flag]\\|\\|flag))} | NO RULE STATED | a template slot for a chip's label |
| W1998 | ui/html.ts:583 | Earns nothing from this event | MATCH | D28, D31 (a seat with nothing to measure, a short line saying why), D26 (OIL Earn's tap) |
| W1999 | ui/html.ts:585 | ${amt==='FO'?'A full day of OIL':amt==='HO'?'Half a day of OIL':'No measurable hours yet'} | MATCH | D592 (FO / HO), D28 ("no measurable hours yet" — the seat with nothing to measure) |
| W2006 | ui/html.ts:733 | All ${sum.n} earn — some a full day, some half a day — tap to see each one | MATCH | D1 — the ALL AVAIL count chip agrees with the bar; D592 FO/HO |
| W2008 | ui/html.ts:735 | All ${sum.n} earn ${sum.bar==='FO'?'a full day':'half a day'} — tap to see each one | MATCH | D1 |
| W2009 | ui/html.ts:736 | None of these ${sum.n} earn OIL today — tap to see each one | MATCH | D1 |
| W2012 | ui/html.ts:850 | Notes | NO RULE STATED | heading |
| W2013 | ui/html.ts:864 | Public: goes out with the next amendment — tap to keep it scheduler-only | MATCH | D1588, D1592 — on a published day the choice waits for the next amendment |
| W2014 | ui/html.ts:864 | Scheduler-only: goes out with the next amendment — tap to show it on the view-only schedule | MATCH | D1588, D1592 |
| W2015 | ui/html.ts:865 | Showing on the view-only schedule — tap to keep it scheduler-only | MATCH | D1588 |
| W2016 | ui/html.ts:865 | Show this note on the view-only schedule | MATCH | D1588 |
| W2021 | ui/html.ts:936 | Available crew | NO RULE STATED | heading |
| W2035 | ui/html.ts:1170 | This warning is not on the signed version — publishing this day adds it | MATCH | D2013 — the next amendment checked by the new settings, "marked 'new once signed'" |
| W2040 | ui/html.ts:1223 | Creates the ${esc(mkPeriod(w,di))} leave war period, with nothing open for bidding, and takes you to the Leave War to open its dates | MATCH | as W1678 — D19, D1177 |
| W2052 | ui/html.ts:1429 | Flagged for the next scheduler | MATCH | the original app's red box; D760 (5) |
| W2071 | ui/html.ts:1696 | ${nd} change${nd>1?'s':''} on this day — ahead of the issued schedule until you publish an AL | MATCH | D45 — changes on a published day wait for the amendment (AL) |
| W2074 | ui/html.ts:1708 | A stored draft — not the issued schedule | NO RULE STATED | status label |
| W2078 | ui/html.ts:1712 | ${sgOK?'Publish '+d.dow+' — approve this day only':'Sign off '+signMissing(di).join(', ')+' before publishing '+d.dow} | MATCH | the original app's four sign-off boxes (D2294 names them), the product invariant "no publish all days" (raptor-port/CLAUDE.md, 7 Aug 26) |
| W2103 | ui/html.ts:1911 | Nothing squadron-wide yet — add notes and programme items from the scheduler board. | NO RULE STATED | empty-state description |
| W2108 | ui/html.ts:1933 | ${esc((SAWAVE[w.kind]\\|\\|{}).note\\|\\|'Standalone — outside the day\u2019s flying count')} | MATCH | the original app (reference/scheduler.html: "outside the day\u2019s flying count" — standalone waves SC, AVALON, BB) |
| W2144 | ui/html.ts:2525 | ${esc(lbl)}${sch?' — appointed schedulers only':''}${v&&PEOPLE[v]?' — '+esc(PEOPLE[v].name\\|\\|PEOPLE[v].cs):''} | MATCH | D2245 — SKED CK, PLANNED BY and APPROVED BY need the Scheduler tick; CUR CK the day's own people (engine/publish.ts SIGN_ROLES agrees) |
| W2147 | ui/html.ts:2540 | Signed — this day can be published | MATCH | the original app's sign-off; D2294 |
| W2150 | ui/html.ts:2587 | No amendment has touched this day yet | NO RULE STATED | status label |
| W2412 | ui/insights-html.ts:45 | Nothing scheduled this week. | NO RULE STATED | empty-state label (Insights) |
| W2416 | ui/insights-html.ts:53 | everyone is scheduled | NO RULE STATED | empty-state label (Insights) |
| W2422 | ui/interactions.ts:91 | That warning is no longer raised on this day | NO RULE STATED | a note: the link's target is gone |
| W2423 | ui/interactions.ts:222 | That detail is no longer on this day | NO RULE STATED | a note: the link's target is gone |
| W2425 | ui/interactions.ts:225 | That input is not shown on this day | NO RULE STATED | a note: the link's target is not on this day |
| W2426 | ui/interactions.ts:228 | That detail is shown on the week, not on the board | NO RULE STATED | a note: where the detail is shown |
| W2439 | ui/interactions.ts:1045 | Only a scheduler can accept inputs | MATCH | D785; D713 ("lands on the schedule unless an admin takes it off") — accepting is the admin's |
| W2441 | ui/interactions.ts:1068 | Can't tell whether ${cs}'s ${inpLabel(inp)} already has a row on another week — load that week first | MATCH | D756 (one input is one record), D175 (a load never puts one input on two days) — read by subject: an input never stands twice; the refusal when another week cannot be read is the safe side of it |
| W2442 | ui/interactions.ts:1246 | Only a scheduler can change the LATE marks | MATCH | D1586, D1620 — a LATE mark is dropped by a scheduler |
| W2445 | ui/interactions.ts:1281 | Only a scheduler can edit ${REPORTING_LABEL} | MATCH | D785 — Edit Schedule's in-time lines are the scheduler's |
| W2446 | ui/interactions.ts:1341 | Only a scheduler can add inputs from here | MATCH | D785; "from here" — members file on the Inputs page (D655), which this does not refuse |
| W2447 | ui/interactions.ts:1345 | That day is not loaded | NO RULE STATED | a note: the day is not loaded |
| W2448 | ui/interactions.ts:1352 | No SANS aircrew on the roster | NO RULE STATED | a note: nobody to seed |
| W2449 | ui/interactions.ts:1352 | No crew on the roster to file an input for | NO RULE STATED | a note: nobody to seed |
| W2450 | ui/interactions.ts:1386 | Only a scheduler can edit inputs from here | MATCH | D785; "from here" as W2446 |
| W2451 | ui/interactions.ts:1553 | Some of ${DAYS[di]?.dow \\|\\| 'this day'}’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republ… | MATCH | D839 row 4 — "Some of Monday's OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm."; D1094 (stands as built) |
| W2453 | ui/interactions.ts:1564 | That day can’t be unpublished right now. | NO RULE STATED | generic refusal |
| W2457 | ui/interactions.ts:1579 | The Leave War credits ${verLabel(back)}’s OIL for the day until ${wl} is republished. | MATCH | D1094 — the Unpublish batch's done note, standing as built |
| W2459 | ui/interactions.ts:1662 | ${DAYS[di].dow} is already at ${verLabel(ver) === 'Original' ? 'the Original' : verLabel(ver)}. | NO RULE STATED | a passing note |
| W2465 | ui/interactions.ts:1841 | Only a scheduler can create a leave war period | MATCH | D19, D785 |
| W2467 | ui/interactions.ts:1849 | A leave war already covers part of ${yr}. Open the Leave War and extend it instead. | MATCH | D838 — N32 "A leave war already covers part of 2027. Open the Leave War and extend it instead." |
| W2468 | ui/interactions.ts:1851 | The ${yr} period could not be created | NO RULE STATED | generic failure line |
| W2469 | ui/interactions.ts:1858 | Only a scheduler can hide a warning | MATCH | D469 (only a scheduler hides — kept from the Aug 26 rule), D1792 (no arrow on View-only Sched), D785 |
| W2470 | ui/interactions.ts:1873 | Warning flagged again | NO RULE STATED | a passing note — the other half of this line is review 2's F5 (S4-F10), not re-reported |
| W2472 | ui/interactions.ts:1888 | Only a scheduler can change this | MATCH | D1588 (a scheduler note's Make public), D785 |
| W2474 | ui/interactions.ts:1904 | Note made scheduler-only. It goes out with the next amendment. | MATCH | D1592 — on a published day the choice waits for the next amendment |
| W2475 | ui/interactions.ts:1905 | Note now shows on the view-only schedule | MATCH | D838 — N16 "today's wording, whole" |
| W2476 | ui/interactions.ts:1905 | Note is scheduler-only again | MATCH | D838 — N16 |
| W2480 | ui/logic-html.ts:39 | Crew rest and the working day | NO RULE STATED | heading |
| W2502 | ui/logic-html.ts:105 | Rest runs from the end of the day before to the first thing today: his in-time or rally, his B where neither is typed, or anything earlie… | MATCH | D1988 — "With nothing typed, crew rest stays measured to the suggested brief, as built, not the default rally"; D1032, D1995 (the earliest in-time or rally) |
| W2503 | ui/logic-html.ts:108 | The day before ends at its last commitment of any kind. A flight ends at landing plus the debrief (${T('debrief')}), or, where no landing… | MATCH | D2046 (the assumed landing), D2055, D2073, D2079, D2080 (a standby shift or SC / AVALON / BB template desk with no END is left out) — the plain desk is review 2's Q9 (S4-F7), not re-reported |
| W2506 | ui/logic-html.ts:111 | A LATE SHOW remark keeps the warning. The ring is dashed while rest still clears by step, solid after. | MATCH | D94 (the dashed ring for a sanctioned late show); the owner's 6 Aug and 21 Aug 26 words cited in engine/validate.ts |
| W2534 | ui/logic-html.ts:180 | s in-time) or R (its rally), whichever is earlier, and something sits between it and the shift start. That time also starts his crew rest… | MATCH | D1041, D1044, D1061 — every row of a flying shift; its B or R starts crew rest, the long day and OIL |
| W2539 | ui/logic-html.ts:188 | A seat with no times | NO RULE STATED | heading — its line is review 2's L14 (S4-F9, D605 reading 6), not re-reported |
| W2542 | ui/logic-html.ts:195 | Weekend and holiday work earns OIL | MATCH | D2 — only the issued schedule earns |
| W2543 | ui/logic-html.ts:195 | Work on a weekend or public holiday earns OIL once the day is published: a full day or a half, by Full day of OIL. | MATCH | D2, D592 — FO or HO by the Full day of OIL setting |
| W2544 | ui/logic-html.ts:197 | Weekend or holiday work earns OIL once the day is published. | MATCH | D2 |
| W2547 | ui/logic-html.ts:204 | Any other row the scheduler adds with no times, or no end time, earns nothing, but a request answered yes earns over its own times. An Of… | MATCH | D28, D31, D360 (no end time: earns nobody), D2046 (the flight with no landing the one exception), D470/D755 (a request earns over its own times), D21 (an Off day does not earn) |
| W2549 | ui/logic-html.ts:206 | Until its wave flies, a desk made from an AVALON or BB template earns only if switched on in OIL Earn. Once the wave flies, the desk earn… | MATCH | D1997 — "Once its wave flies, a desk made from that wave's template … earns OIL by default"; D24, D1060 (off until then) |
| W2550 | ui/logic-html.ts:207 | A Duty & commitments input earns once its OIL question is answered yes. | MATCH | D804 — every kind that can earn is asked, its answer decides |
| W2551 | ui/logic-html.ts:208 | A published day keeps its OIL until it is published again. | MATCH | D48, D592, D142 |
| W2552 | ui/logic-html.ts:210 | On a weekend or holiday, a row with someone on it and no usable times earns nobody on it any OIL. The warning names the row. | MATCH | D28, D31, D81 — the seat with nothing to measure; the day says so with its reason |
| W2553 | ui/logic-html.ts:211 | A weekend or holiday with someone to earn is not published yet. Nobody earns until it is. | MATCH | D2 |
| W2554 | ui/logic-html.ts:212 | No Leave War period covers this weekend or holiday, so its work earns nobody OIL. The day offers to create the period, before and after i… | MATCH | D19 — names the reason, offers to create the period |
| W2555 | ui/logic-html.ts:213 | A day published as a working day that the Leave War now calls a public holiday earns nothing until it is published again. | MATCH | D2 — a holiday declared after publication waits for republication |
| W2556 | ui/logic-html.ts:214 | A day published as a holiday that the Leave War no longer calls one keeps its OIL until it is published again, which withdraws it. | MATCH | D2 — revoking one never removes OIL silently |
| W2557 | ui/logic-html.ts:215 | A weekend or holiday published before the app counted an ALL AVAIL on a duty desk, sim or extra people line shows a pending change. Publi… | MATCH | D54 — the pending mark once [OIL-SEATS-CAN-EARN] ships; he republishes it once |
| W2560 | ui/LogicPage.tsx:36 | Published days keep their old settings until published again. | MATCH | D2071 — his "Yes" to this very sentence; D2005, D592 |
| W2574 | ui/LogicPage.tsx:354 | A shift against ${KIND_LABEL[k]} is now ${c.checked ? 'a Warning' : 'an Advisory'} | NO RULE STATED | a passing note naming a Logic setting just changed |
| W2585 | ui/LogicPage.tsx:458 | Since D2005 a published day is checked by every setting it was published under, so the note says that, not only | NO RULE STATED | a code comment fragment |
| W2637 | ui/Modals.tsx:164 | No traffic booked yet — add a row. | NO RULE STATED | empty-state label |
| W2639 | ui/Modals.tsx:170 | No traffic booked. | NO RULE STATED | empty-state label |
| W2732 | ui/palette-html.ts:95 | ${esc(note)} | NO RULE STATED | a template slot |
| W2735 | ui/palette-html.ts:125 | Cancel | NO RULE STATED | button label |
| W2741 | ui/pan.ts:680 | PULL past Monday ${Math.round(pullPeak)}, no touch seen → PREV WEEK | NO RULE STATED | a debug log line, never shown |
| W2742 | ui/pan.ts:686 | PULL past Sunday +${Math.round(pullPeak - max)}, no touch seen → NEXT WEEK | NO RULE STATED | a debug log line, never shown |
| W2784 | ui/printpdf.ts:68 | No flying programmed. | NO RULE STATED | empty-state label (print) |
| W2785 | ui/printpdf.ts:99 | RESTRICTED | OPEN READING | none found; the export's look was "a DRAFT for the owner to pick" (16 Sep 26), held by D1644 — see §2, O2 |
| W2908 | ui/SchedBoard.tsx:485 | ${glyphSvg(EYE_INNER, 'pveye')} Viewing plan <b>${esc(draftVerLabel(di, ver))}</b> — read-only. Switch to it to make it your working copy. | NO RULE STATED | status line of a saved plan viewed (the plans selector, built 15 Sep 26) |
| W2914 | ui/SchedBoard.tsx:490 | Load this issued version onto your working copy to edit — nothing is published until you Publish AL, and the issued versions stay unchanged | MATCH | D818 — a version loaded back onto the working copy; issued versions never changed |
| W2934 | ui/SchedBoard.tsx:679 | Earn stays, lit green, as the way out. Drawn only where the day can | NO RULE STATED | a code comment fragment |
| W2938 | ui/SchedBoard.tsx:695 | Show who earns OIL on this day, and change it | NO RULE STATED | button title |
| W2939 | ui/SchedBoard.tsx:696 | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | MATCH | D839 row 2 |
| W2941 | ui/SchedBoard.tsx:698 | OIL Earn | NO RULE STATED | button label |
| W2945 | ui/SchedBoard.tsx:744 | THE LIST IS NOT A SECOND BUTTON, and that is measured, not | NO RULE STATED | a code comment fragment |
| W2953 | ui/SchedBoard.tsx:807 | S WARNING ([SAVE-NOTE-COVERS], D587): the board lies over the top bar, so the bar | NO RULE STATED | a code comment fragment |
| W2962 | ui/SchedBoard.tsx:910 | Reason for cancellation | NO RULE STATED | the original app's "Reason for cancellation" |
| W2967 | ui/SchedBoard.tsx:919 | Cancel reasons | NO RULE STATED | heading |
| W2971 | ui/SchedBoard.tsx:938 | No quick reasons — add one below, or reset to the standard set. | NO RULE STATED | empty-state label |
| W2973 | ui/SchedBoard.tsx:941 | New cancel reason | NO RULE STATED | placeholder |
| W2975 | ui/SchedBoard.tsx:951 | Un-cancel | NO RULE STATED | button label |
| W2976 | ui/SchedBoard.tsx:992 | Cancel | NO RULE STATED | button label |
| W2987 | ui/SecDefaultSnackbar.tsx:60 | Not now | NO RULE STATED | button label |
| W3033 | ui/topbits.tsx:108 | Nothing new | NO RULE STATED | empty-state label (the bell) |
| W3117 | ui/WaveTplModal.tsx:112 | . Built-in types can be hidden but not deleted. | NO RULE STATED | describes the control: the four built-in wave types (the owner's Aug 26 build, #340) |
| W3122 | ui/WaveTplModal.tsx:140 | No wave templates yet. | NO RULE STATED | empty-state label |

## 6. Closing count

176 strings in the list, 176 read, none left. Slice 5: 101 passed strings in the four inputs files read, 11 who-may
sentences classified, none left. Rows opened by number this pass, beyond the keyword searches: D631, D633, D638, D642,
D655, D658, D683, D684, D786, D795, D838, D839, D843, D844, D845, D1031, D1032, D1356, D1588, D1592, D1782, D1785,
D1786, D1988, D1995, D1997, D2245, D2265. The rest named in the table were read in their area page lines and keyword
hits, not opened one by one.
