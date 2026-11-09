# The scheduler's page — what was done with each reader's finding (9 Nov 26, chat 43, D1944)

The page read: `.claude/rules/decisions/scheduler.md` at `43f2bfd02`. The reports: `2026-11-09-scheduler-page-read-opus.md`
and `…-read-astra.md`. Each finding was checked against the ruling's full row (`.claude/decisions-full/`), the old short
line (`5d8ddf6f8`) and, for a test claim, the test's own assertions (read myself for D663, D1010, D65, D114, D1031,
D1020, D550; the rest of Opus 13's test readings taken as reported and acted on under the strict rule — unsure means it
stays written out), by a fresh Opus helper that wrote neither the page nor either report. No test, app code or script was
changed. The sorting tables' rows for every ruling touched (and Sorter D's rows for the settled entries touched) carry a
"read 9 Nov 26" note. `npm run docsize` and `npm run rulecheck` pass.

Result: 84 points (Opus 19 findings, 69 points counting the sub-items of 13, 16, 17 and 18; Astra 15) — 71 distinct, 13 of
Astra's being Opus's points counted once (Astra 1, 2 = Opus 4; 3 = 9; 4 = 5; 5 = 3; 6 = 2; 7, 8, 9, 10 = Opus 13's D517,
D828, D551, D824; 12 = Opus 16's D40/D41; 14 = Opus 16's D360; 15 = Opus 18's bracket). Held 67, not held 3, left for the
host 1 (D1041's mark). The readers' one disagreement (Q6) went to Opus 19: held. Numbers on the "Built, held by tests"
line: 56 → 28. The page: 75,470 → 82,294 bytes (limit 120,888); How we work 37,973 → 37,971 (limit 38,000).

| Reader | # | Ruling(s) | Held? | What was done | Why |
|---|---|---|---|---|---|
| Opus | 1 | D755 | held | "— once the scheduler has added others, changing it for everyone is the scheduler's" put after "may always take himself out". | Accompaniment (3), "taken by his word"; no page stated it. |
| Opus | 2 | D663 (D736) | held | Off the built line; stated as ruled — one item, its kind and how many people, the names under it — with "the build titles it with every name and no count, a difference put to him"; cites D736 (its mark). Question 1 below. | `changesmodel.test.ts`'s last describe asserts `Input · <names A to Z> · Meeting` for a filing made today; the "4 people" asserts cover only old group-id history (the file's own comment). D721/D727 are the card and the desktop list, not this window. |
| Opus | 3 | D531 (D518) | held | Off the built line; the Insights line now says a mission containing DS or red without being exactly one of the three (DS-2, red air 2, ACM/DS) asks too, never counted blue or red by guessing. | D531's bold rule; D518 carries "NARROWED BY D531"; the line as drafted let a DS-2 with empty remarks go blue. |
| Opus | 4 | D1751 over D355, D356, D451, D452, D454 | held | The take / free / take-over lines now open "kept beside the simple mark by the agent's reading of D1751 only, told to him and not yet checked with him (he may strike any part)", cite D1751; D454's "(asked again, noted in the history)" put back; the sync line (D452, D356) split off on its own, not marked, since D1751's readings do not cover it. | D1751's row: "The agent's readings, told to him, not yet checked with him … he may strike any". |
| Opus | 5 | D186 | held | "a callsign rename updates the published schedule at once (a label); the published brief lead is the one printed value for which the 'no rule versioning' invariant is narrowed, the rulebook itself staying unversioned". | D186's row: the narrowing is "for ONE printed value: a published day keeps the brief lead it printed"; the callsign is "a label". |
| Opus | 6 | D179, D183, D184, D185, D188 | held | "never making the day pending" now on a line of its own marked "(the agent's reading, told to him)"; "provisional: put to him again when the build shows it, never re-decided without him" put back. | D183, D184 (3), D185 (b) state it as readings; D188 confirms D185's reading on the question put (which warnings), not plainly this one — strict reading. D179's row: "'For now': provisional …". |
| Opus | 7 | D278 (D753, D755, D776) | held | "A placeholder (ALL / ALL AVAIL) may stand on a row twice — 'one man, once per row' is about men; an input takes ALL or ALL AVAIL, never both". "a row nobody filed" and "never the same one twice" removed. | D278's bold rule has no row limit; no cited row says "never the same one twice" (D753: "never both"). See Unsure. |
| Opus | 8 | settled: duty desks from templates (oil.md D24, D35) | held | "earning no OIL" → "earning OIL as the OIL page's defaults say". | `oil.md`: SC-shift desks earn by default; AVALON desks off with the switch; a BB desk does not earn by default. A later ruling wins (the page's own Settled preamble). |
| Opus | 9 | D1045 (D1044) | held | "On a flying standby line every row's day ends at the line's END, with no debrief added; for a SPARE what counting as a flight changes is its crew rest and its OIL". | D1045's bold: "the line's day ends at its END" for the whole line; D1044's bold: "for a SPARE, what counting as a flight changes is its crew rest and its OIL". |
| Opus | 10 | D475 (D1792) | held | A line of its own: the bar's colour follows what is left, a man with two warnings keeps the flag of the one still showing, a hidden crew-rest warning drops the dotted mark on the day before. | "Approved with them, as the page listed them" in D475's row. |
| Opus | 11 | D712 (D778, D713) | held | "for the kinds D712 lists" → "only for Training, Meeting, Appointment, Duty, Event, Other and a one-day Personal" [D702, D711, D712, D713, D778]. | D712's list is narrowed by D778 and widened by D713; the pointer gave a stale list. |
| Opus | 12 | D1781 against D1083–D1085 | held | Standby headings: "in one line from 1100 wide, R over B and START over END on a phone and from 821 to 1099 wide", cites D1781. | D1781: "the headings stack the same way"; the narrow-desktop stylesheet applies it to standby lines. See Unsure. |
| Opus | 13 | D65 | held | Off the built line; already stated whole (OIL on the schedule). | Test checks only the stored selection. |
| Opus | 13 | D114 | held | Off; stated: one change in every count, its pending line naming whose request and that it was taken off. | No assertion of "whose request". |
| Opus | 13 | D187 | held | Off; stated: the board's and edit week's 👁 look shows its warnings as View-only Sched does. | The test builds the look itself; the board's wrapping is unchecked. |
| Opus | 13 | D270, D272 (D877) | held | Off; stated together on one line, citing D877 (it narrows D270). | Stylesheet arithmetic only; no rendered own puck. |
| Opus | 13 | D513 | held | Off; stated: the first twelve in the existing order, Show all for the rest. | Fixture ties every flyer; Show all set directly. |
| Opus | 13 | D517 | held | Off; stated: the answer categorises every eligible aircraft and their cockpit crew. (= Astra 7) | The answer reader is stubbed to null. |
| Opus | 13 | D531 | held | As finding 3. | — |
| Opus | 13 | D551, D553 (D555, D597) | held | Off; one Tab line: only boxes already open, empty ones included, never a closed editor, folded section or popup; on past the last box to the next ordinary button, no loop or day change; no button below, the caret stays. (= Astra 9) | D551 only in a range comment; D553's parts held by tests not naming it. |
| Opus | 13 | D562 | held | Off; stated: the close cross stays at the top, in sight and reachable, while scrolled. | Only a lower bound; no scroll asserted. D563 (its narrowing) is archived, not cited. |
| Opus | 13 | D594 | held | Off; stated, "his call over the agent's recommendation" kept. | A declined option a test cannot hold; named only in a comment. |
| Opus | 13 | D605 | held | Off; stated with "a part-day absence against a seat with no times stays silent". | That part held only by a describe not naming D605. |
| Opus | 13 | D663 | held | As finding 2. | — |
| Opus | 13 | D769 | held | Off; stated: the input first in bold with its date, then what and who, its age at the right; the bell's tap goes straight to a waiting question. | Order and layout unchecked. |
| Opus | 13 | D824 | held | Off; stated: the picked date a plain disc, a ring only for a keyboard. (= Astra 10) | Only `outline:` checked. |
| Opus | 13 | D828 | held | Off; stated: full width less a margin on a phone, the desktop unchanged. (= Astra 8) | jsdom cannot measure width (the test says so). |
| Opus | 13 | D831, D840 | held | Off; one line: the band under the top bar, never the foot, always one line on his iPhone's letters. D831's reading (2), under the board's own bar, left to the row. | The top bar's band never measured; one line measured only on the board's. |
| Opus | 13 | D860 | held | Off; stated: one just-added look, no glow, on the Inputs pages too, ringed round a note's own box. | The e2e asserts the card only. |
| Opus | 13 | D958 | held | Off; the three places and "a row on the Ground Programme keeps 'ground'" put back on the line. | Held only by tests not naming it; the page had dropped the clause. |
| Opus | 13 | D1010 | held | Off; stated: nothing added, changed or deleted since shows on View-only's preview. | Read myself: `peek.test.tsx` checks an added row only. |
| Opus | 13 | D1031 | held | Off; already stated whole (Warnings). | "3 hours to start" pinned by a test not naming it. |
| Opus | 13 | D1064 | held | Off; already stated; see 16 (D1063/D1064). | Named only in the file's header. |
| Opus | 13 | D1781 | held | Off; already stated (R · B · TO · LD in one line wider). | TO/LD unchecked at 1100. |
| Opus | 13 also | D271, D276 | not held | Nothing changed: D271 stays on the line (held), D276 is stated (the Settled section). | Opus says so itself. |
| Opus | 13 also | D1020 | held | Off; already stated (the floating calendar's Escape). | Named only in a comment. |
| Opus | 13 also | D550 | held | Off; see 16 (D550 / D544). | View-only outside held only under a D556 describe. |
| Opus | 14 | D733 | held | Off; stated with "a note naming who stands there now was offered and declined". | A "don't reopen" no test can hold. |
| Opus | 15 | settled: SC B box (D1083, D1085) | held | "an early one on a MAIN starts the long-day span, and anything cutting into the B-to-start window raises the amber in-time advisory, both on a MAIN only"; pointer `engine-rules.md`, `ui-contracts.md` §The B box. "SPARE rows have no event stream" not restated (the later D1044, D1045 make a typed SPARE fly). | The old entry: the advisory is separate from the early B. |
| Opus | 16 | D936 | held | "while a value out of bounds is still refused with its note, never silently". | D936's row. |
| Opus | 16 | D1699, D1693 | held | "the person who pressed Undo gets nothing, and a tap opens what the line opened". | D1699: "The rest of D1693 stands". |
| Opus | 16 | D1041 (D1044, D1045) | for the host | No mark written. See Unsure. | — |
| Opus | 16 | D360 (D361) | held | Readings (2) and (3) on a line of their own, "by the agent's readings of D360, told to him", with the who's-available half's assumed-hour line. (= Astra 14) | Both marked readings in the row. |
| Opus | 16 | D550, D544 | held | "the Tab route covers Edit Schedule's week and the Scheduler Board, view-only and issued read-only surfaces staying outside it". | D550's bold rule and its scope sentence. |
| Opus | 16 | D36 | held | "and is shown flagged" removed. | In neither the line nor the row. |
| Opus | 16 | D1526, D1527 | held | "see-through at rest and still slightly see-through when open" (D1526's bold) put back; the old-arrow look tied to slid out only. | "At rest it looks as the old arrow" was D1526's reading. |
| Opus | 16 | D802 | held | Both both-areas lines marked as the agent's reading. | D802's row. |
| Opus | 16 | D111 | held | "on every surface it is drawn (the agent's reading)". | D111's row. |
| Opus | 16 | D815 | held | "Goes to" marked "(a build's code read, not his ruling)"; "never on a retype into a kind the list shows by itself" put back. | The NARROWED mark comes from the M3 build's code read (F6). |
| Opus | 16 | D102 | held | "(roles on a desktop, names only on a phone)". | D102's bold. |
| Opus | 16 | D507 | held | "the existing brief-before-take-off and exception checks staying". | D507's bold. |
| Opus | 16 | D40, D41 (D1106) | held | A line of its own: the reason under the puck at the skinny width, beside it when wider, never disappearing. (= Astra 12) | D40 and D41 (the reasons' placement). |
| Opus | 16 | D1063, D1064 | held | "on Edit Schedule's week (shown, not pressed: the agent's reading) and read only on View-only Sched"; D1063's full row marked NARROWED BY D1064. | D1064's reading; D1064's own words narrow D1063's "on Edit Schedule and the board" as they do D1060's (already marked). |
| Opus | 16 | D1080 | held | "not callsign, mission, remarks, nor an input's start and end". | D1080's row. |
| Opus | 16 | D668, D1193 | held | "— only their name, never who they count". | D1193: "only their name"; D668 keeps re-defining to the Available rows. |
| Opus | 16 | D807, D830 | held | "K5, K6 and K11 … his to place (the agent's reading)"; D807 "and the ones then coming". | D830's reading (1); D807's bold. |
| Opus | 16 | D481 (D532) | held | Cites D532: "the place approved with the final Insights look". | D532 approves "chart and board entry placement". |
| Opus | 17 | moved text, the glide (D1577) | held | Pointer: `performance.md` §Compositor layers, the fresh-add box and the cross-week glide. | The built detail was findable only there. |
| Opus | 17 | the Inputs calendar's popover | held | Pointer: `ui-contracts.md` §The Inputs month calendar. | — |
| Opus | 17 | the four crew panels | held | "never folded into a fixed tail, and the old one-week 'Apply to all days' stays gone". | Two "don'ts" of the old entry. |
| Opus | 17 | across the week's edge | held | "the tight-turn note never draws the trace" and the pointers `engine-rules.md`, `ui-contracts.md` §Three crew-rest rings. | The old entry's "CREW_TIGHT never traces". |
| Opus | 18 | people-accounts.md (D1699, D1710) | held | Moved from the ring sentence's bracket to the off-the-manpower sentence's: [D1696, D1693, D1699, D1710] and [D1694]. Byte-neutral. (= Astra 15) | They change D1693's taken-back line, not the ring. |
| Opus | 18 | "From other areas": D981 | not held | Left on the People line. | The gate pairs D981 with D299 (D981 narrows People's D299): moving it fails the check. |
| Opus | 18 | "From other areas": D755, D776 on OIL's line | not held | Left. | The gate pairs D755 with OIL's D43 (D755 narrows it). |
| Opus | 18 | the Inputs line's "an input's title" | held | "an input's title box", D919 added. | D715 archived; D716 is stated on this page, D919 is the Inputs page's title box. |
| Opus | 19 | How we work §Records (D611, D976, D1944) | held | "never split by screen" → "not split by screen" (and "trial's" → "trials'"), 2 bytes smaller. | D611's rule is "not split … look again if it grows"; D1944 answered this look-again, its words ("One page") say nothing of never. Astra's "no finding" set aside: "never" closes what no ruling closes. |
| Astra | 1, 2 | D1751, D454 | held | As Opus 4. | — |
| Astra | 3 | D1045 | held | As Opus 9. | — |
| Astra | 4 | D186 | held | As Opus 5. | — |
| Astra | 5 | D531 | held | As Opus 3. | — |
| Astra | 6 | D663 | held | As Opus 2. | — |
| Astra | 7–10 | D517, D828, D551, D824 | held | As Opus 13. | — |
| Astra | 11 | D345, D167 | held | "every group, in Item and Who, open until folded". | D345's approved calls; D167's NARROWED BY D345. |
| Astra | 12 | D40, D41 | held | As Opus 16. | — |
| Astra | 13 | D947 | held | "where there is room, dropping under the people where too many leave none". | D947's answer (3). |
| Astra | 14 | D360 | held | As Opus 16. | — |
| Astra | 15 | D1699, D1710 | held | As Opus 18. | — |

Chat 42's list (brief step 4): D1063 by D1064 — marked. D950 by D949 — marked ("· rejected"; D950's own row already said so).
D1782 on D844, D845, D882 and D1106 on D41 — the marks were already there. D1041 by D1044, D1045 — not written (Unsure).
D1030 by D1038 and D278 by D753 — not plainly a change (Unsure).

## Questions for him
1. **The changes window's heading for a group input (D663).** He chose, from two pictures, a meeting for four men shown as
   one item, "Input · Meeting · 4 people", the four names listed under it. As built today, a meeting filed for four men
   shows "Input · Bane, Casper, DJ, Stiff · Meeting" — every name in the heading, no count, nothing under it (the
   test for it was written with the one-record build of 12 Oct 26). Recommendation: put the two side by side to him
   with a picture of a big group (eight names); if he keeps his pick, rebuild the heading as a small fix; if he prefers
   the names, record the ruling that changes D663.
2. **The day lock's details after the simple mark (D1751).** Taking a day, the 30 minutes, "Done editing" and the
   admin's take-over asking first are kept only by the agent's reading, told to him and never checked. Recommendation:
   put them to him in one short question when [DB-SYNC-MODEL] is planned, not before (nothing of it is built).

## Unsure, for the host
- **D1041's mark.** D1045's own words ("when … rally is typed it's treated like a jet that's flying") plainly change
  D1041's "on an SC SPARE, AVALON or BB line … shown, printed and exported only". Writing the mark makes the gate demand
  D1044, D1045 on the OIL page's D1041 line, and `oil.md` stands 7 bytes under its hard limit — not written. The page
  already states the change (the rally box line, citing D1041, D1044, D1045). Write it with his word on the OIL page's
  room, or leave it.
- **D1030 by D1038.** D1038 answers D1035 (how a taken suggestion shows) and may only refine D1030's "highlighted"; not
  plainly a change — no mark. The page states both.
- **D278 by D753.** "Never both" is not "never twice": no mark. Whether one placeholder may stand twice on an input's row
  (D755's one rule, D756's one record, the list of people holding it once) is not ruled; the page no longer says either way.
- **D188.** Its bold rule, "Confirmed: the agent's reading of D185, as built", may confirm all of D185's readings,
  "never pending" among them; marked as the agent's reading under the strict rule.
- **D1781 on the standby headings.** "The headings stack the same way" read as covering the standby waves' headings too,
  as the stylesheet does; stated plainly, cited D1781.
- **Opus 13's test readings** other than D663, D605, D1064, D187 (Opus's own) and D1010, D65 (read here) are the helpers'
  readings; all were taken off the built line under the strict rule.
- **How we work's line** now reads "not split by screen" but does not restate D611's look-again trigger in words: the
  line has 29 bytes of room and must not grow.
