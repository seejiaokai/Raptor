# The rulings audit — slice 9, the bell (24 Nov 26)

A fresh Opus helper, blind to the other slices. Read-only apart from this file. The app read is this working copy
(`claude/readings-lapse-fix-fdbb3c`, `main`'s app plus the SANS job before its round 5). Rulings read: the area pages'
bell lines (scheduler, people-accounts, leave-war, oil, design, how-we-work), every full row named below (opened with
the shell), the archive for D1199, the open branch `claude/words-pass-163` (D2521 and chat 170's four rulings, saved
word for word in its `HANDOFF.md` block, numbers D2600–D2609 being recorded — treated as rulings, as the brief says).

## Findings

| Id | Class | The item | Where | Ruling(s) and his words quoted | The difference, in one sentence | The reading's standing | Harm | The question it would become |
|---|---|---|---|---|---|---|---|---|
| S9-M1 | MISMATCH | The bell's line for a changed input says only the first two changes and drops the rest without a word; a change of kind reads as a rename ("Renamed — was Training") | `raptor-port/src/state/notices.ts:1221` (`noticeWords`, `.slice(0, 2)`), order set by `common()` at 420–452 | Chat 170 (24 Nov 26, numbers D2600–D2609 being recorded): *"ok saying everything sounds good"* — "the bell's line for a changed input says EVERY change, never 'and N more change(s)'", replacing D2521's Q3. D2521: "Training changed to Meeting", "Now LL (AM)" | On `main` a third or later change is silently left out and a kind change is called a rename; D2521's fix is built only on the unmerged words-pass branch (and still counts rather than names), and chat 170's "every change" is built nowhere | Not a reading — two rulings, neither on `main` | Told wrongly: a man is not told part of what changed | When it happens: a scheduler, building the week at his desk, moves Ranger's Training from Wed 15 to Thu 16 Jul, adds Ace and edits the remark in one save. Ranger's bell reads "Training · Thu 16 Jul / Now Thu 16 Jul, Ace added · Saber" — the new remark is never mentioned. Not a question: a fault, waiting on the words-pass merge and then the "every change" build |
| S9-M2 | MISMATCH | The register's head still states the take-back as the struck look — "read, it is replaced by its own words struck through, then 'taken back · <who>'" — as the rule to build for every line | `raptor-port/docs/notifications-register.md:19`; also P8's and B13's descriptions | D2437 (24 Nov 26, "Yes, every line"): "his new line drops the crossed-out words and 'taken back' and says what is true now … on every bell line"; D2423: *"Perhaps we could use the term undone instead of taken back"*; D2561 (inputs and holidays get the undone line; "You're SANS again."; a Redo adds "again"; two lines for a date moved earlier) | The one document that says how each line should work still describes the replaced look and none of D2437, D2423 or D2561 | Not a reading — the register was not updated when the rulings were made (D201's step 1) | Wording only today; told wrongly once a builder follows the register | Not a question: the register's head to be rewritten to D2437 / D2423 / D2561, the struck look named as what is built today |
| S9-M3 | MISMATCH | The register is not the list of every place the app tells someone: built bell triggers and ruled lines are missing from it | `raptor-port/docs/notifications-register.md` (no row); built: `raptor-port/src/ui/topstate.ts:49–60` (`accessAlert`, `bugAlert`) | D1151: *"create a document to note down all the areas in which we should have a notification and how it should work … automatically fill it in"*. Missing: the access request on the admins' bell (D216, built); the new bug report on the bell (built — the bell lights and the tap says "N new bug reports"); a posting that could not run (D2214, ruled — "Outlaw · Fri 20 Nov / Posting out could not run. See his row on Admin → Users."); a person told of his own account's status (D2251, ruled); a detachment's planned end reminding its admins, and its early close telling each man (D2134, D2135, ruled); a transfer told when set as well as on its date (D2147 via scheduler page line 228); chat 170's "a change that is undone gets a notification of its own" | Five ruled lines and two built ones are absent from the one document meant to hold them all | — | Told wrongly by omission: a builder working from the register misses them | Not a question: add each, with its ruling |
| S9-M4 | MISMATCH | The register's P15 — a man posted out to the other squadron — is still "proposed, his to strike", worded "Posted out · now with 149" to both squadrons, told only when it runs | `raptor-port/docs/notifications-register.md:84` | D2215: *"U should let 149 know what. The posting went from 142 to 149. Now 142 took it back. 149 should know that."* (treats P15 as the line 149 got); D2220: "a transfer's date read by the receiving side as 'Posted in · from 142'"; scheduler page line 228 (D2147, D2160 …): "the bell tells both squadrons' admins, when it is set and on the date" | The register gives one wording for both sides and one moment; the rulings give the receiving side its own words and a second moment, and treat the line as ruled | Not a reading | Told wrongly once built: 149 reads "Posted out" for a man arriving, and nobody is told on the day the transfer is set | Not a question: P15 moved to "Ruled, not built" with D2147, D2215, D2220's words. Same tidy, lower harm: P4's words in the register ("Apr – Jun open for leave") differ from the built and ruled words (D1214: "Bidding open 1 Apr – 30 Jun · Saber"); P10 and P12 still say "proposed, his to strike" though D1460 rests on them |
| S9-M5 | MISMATCH | The scheduler page's borrowing line says a pick "rings its [home squadron's] schedulers' bell" at once | `.claude/rules/decisions/scheduler.md:183` (D2091, D2098, D2145, D2149) | D2219: "his home schedulers are told when the other squadron publishes, not at each draft change" — "the agent's reading of D2160 over D2091, told to him and taken as recommended"; scheduler page line 202 says the same ("the home schedulers' bell rung each time" it is published) | Two lines of one page answer "when is the home squadron's bell rung for a borrowed man" differently — at the pick, and at the other squadron's publish; D2091's row does not carry D2219 as a narrowing | Approved (D2219, his "as recommended" to the stated reading) | Told wrongly once built: home schedulers rung at every draft change | Not a question: D2091's row and line 183 to carry D2219's narrowing |
| S9-O1 | OPEN READING | A master admin who filed an input for another squadron's man is told of every change to it on his bell; the admin lines of that squadron (postings, holidays) never reach him there | `raptor-port/src/state/notices.ts:321` (`adminThen`: the master mark counts in every squadron) beside `raptor-port/src/state/accounts.ts:326–338` (`adminsOf`: a master only through his home) | D2223's row: "The agent's reading: the master stays an admin everywhere, so a master filer is still told." D2198: *"for master admin by default the notification is turned on for the primary sqn. And the other sqns will be turned off"* (not built); D2218's reading: "a master admin with that squadron on in his bell is still told" | Two readers of "is he an admin of that squadron then" disagree for the master: the filer test says yes everywhere, the admin audience says home only — while D2198 says other squadrons' lines are off by default | Never put to him — in D2223's row with no word of telling; searched the rows, the archive, the register, the backlog | Told wrongly (a master's bell carries another squadron's input news D2198 switches off) | When it happens: Saber, master admin at home in 142, files a Training for 149's Kestrel on Wed 15 Jul; 149's admin changes its remark; Saber's bell reads "Training · Wed 15 Jul / Remark changed · Viper", though no 149 posting or holiday line would reach him. Should a master filer be told of another squadron's input he filed, before his per-squadron switch exists? |
| S9-O2 | OPEN READING | Three or more people put in or taken out of an input read as a count — "3 people added" — not their names | `raptor-port/src/state/notices.ts:1046` (`names`) | D769 (the shorter wording; register B8's example "Saber, Ranger added"); chat 170: *"See what else in the app also has this existing numerical change and perhaps its better to say everything instead."* | The count is the builder's choice; no ruling sets where names stop; his newest words lean against counts | Never put to him — found in no row, register or page | Told wrongly in part: the man does not learn who joined | When it happens: a scheduler adds Ace, Bane and Casper to Ranger's meeting on Thu 16 Jul; Ranger reads "Meeting · Thu 16 Jul / 3 people added · Saber". Names every time, as with the changes? |
| S9-O3 | OPEN READING | The SANS reminder names his first three planned days, then "and 2 more" | `raptor-port/src/state/notices.ts:1119–1124` (`sansDaysWords`; comment C0186) | D2342's row: "The agent's reading, as chat 147 recommended: past three days the line says 'and 2 more' after the dates" — he "chose neither" of chat 147's rewordings and gave his own words (D2340, D2390), which name no cut; chat 170 as in S9-O2 | A count where his own words list the days; his newest words lean towards saying everything | Disclosed, unanswered — offered inside wordings he set aside | Told wrongly in part: days he must file for go unnamed | When it happens: Ranger, SANS from Fri 17 Jul, is planned on five days with nothing filed; his bell reads "You're planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed." Name every day? (shared with slice 5) |
| S9-O4 | OPEN READING | An Undo of a change a man has NOT yet read: today and as ruled, his line simply goes and he is told nothing | built: `state/sched-commit.ts tellPass` (input lines go with their change), `leavewar/sync.ts warNoticesReversed`; ruled: D2437 "that a read line is answered by a new line, and an unread one simply goes, stands" | Chat 170: *"And if its undone perhaps we should also create a notification thats applicable to it"* — said after being told a phone alert (Teams, at the database step) cannot be taken back | Whether his newer word reaches an unread line — which, once alerts go by Teams, he may already have seen on his phone — is not said; D2437 and D2391 ("the SANS reminder simply goes") say no new line | Not yet put — chat 170's handoff names the clash to search first | Told wrongly: a man told by phone of a change that was then undone hears nothing more | When it happens: at 20:00 Saber approves Ranger's LL for Mon 20 Jul; Ranger's phone gets the Teams alert; at 20:05 Saber presses Undo; Ranger has not opened the app. Does Ranger get "Your LL on Mon 20 Jul is no longer approved"? |
| S9-O5 | OPEN READING | The SANS reminder goes to the man himself only, never to an admin's bell | register B13 ("the agent's reading, told to him"); `src/leavewar/sansunfiled.ts` | D2338's row: "The agent's readings, told to him: the bell line goes to the man himself only" — his "Yes" was to his own proposal and to the agent's answer to "Should we tell the user too" | Whether his "Yes" covered "never the admin" or only "the man too" is not shown | Disclosed; his "Yes" may cover it — the host to read chat 146's answer to settle | Low — the crew list already strikes the man for the admin | When it happens: Ranger, SANS from Fri 17 Jul, is planned Sat 18 Jul with nothing filed; Saber, building the week, sees the strike but no bell line. Is that his intent? (shared with slice 5) |
| S9-O6 | OPEN READING | A moved filer counted as "that man's admin" by his admin role as it stands when the input changes | `raptor-port/src/state/notices.ts:179–196` (`filerVia`, comment C0184) | D2228: "is told when that input changes, as any admin of the man's squadron is"; the row: "The agent's reading: 'that man's admin' is read on the input's own days … the filer an admin of that squadron today" — not marked told | When his role is read (today, not the input's days) is the builder's | Never put to him | Told wrongly in a narrow case | Low harm — for the one list. When Hunter, moved with Ranger to 149, is made 149's admin only after a change to Ranger's leave, is he told of that change? (today: no — his role at the change counts) |
| S9-O7 | OPEN READING | A master admin may switch another squadron's lines on himself (and his own off) | `.claude/rules/decisions/people-accounts.md:152` ("(the agent's reading)"); not built | D2198's row: "The agent's readings: 'by default' means he may switch another squadron's on (and his own off) himself" | The switch and who holds it are the builder's reading of "by default" | Never put — to be drawn first per the row | Low (not built) | Low harm — for the one list, with the drawing of the switch |
| S9-O8 | OPEN READING | The words of P12, "LL bid changed to OL", and P10, "LL bid moved to Thu 29 Jan" / "LL bid deleted" | `raptor-port/src/state/notices.ts:1089–1092` | D1460: *"I think the user should be informed"* (the line ruled; its words "the agent's, his to change"); P10 rests on D1460's "as he is told of every other change to his leave by someone else" | The lines are his; their words were never shown to him | Never put (words only) | Wording only | Low harm — for the one list |

## Side-by-side tables (step B's questions 26–29)

### 26. Which admins are told

| Surface | The rule it applies | The ruling it rests on |
|---|---|---|
| A posting's lines and their take-back (B12) | `adminsOf`: admins at home there that day, a plain admin holding Plan of it; a master through his home only; suspended or archived accounts left out | D2194, D2198, D2202, D1690 |
| A holiday's OIL line (B10) | the same `adminsOf`, the holiday's own squadron | D2195, D2202, D781 |
| An input's line to its filer, not named in it | `filerVia` → `adminThen`: the master mark in EVERY squadron; a Plan grant with an admin role; his home while not moved; his home's admin role after a move | D2223 (its master reading), D2225, D2228 |
| The commit gate's check of a posting or holiday line | the same `adminsOf` | D2194 |

**Verdict: DIFFER** for the master admin — S9-O1. The first two and the gate agree. A suspended filer is still counted
by `filerVia` (no `on` check) where `adminsOf` leaves him out — no ruling found on a suspended person's bell beyond
D2251's reading that he reads it once enabled; not raised as a finding (low, and he cannot sign in meanwhile).

### 27. Who is told when an input changes, and who is not — each register row beside its writer

| Row | Who is told (register) | The writer | Agree? |
|---|---|---|---|
| B1 Deleted | each person in it, its filer | `noticePass`, the `!a` branch: named men and the filer while `filerTold` | AGREE (D769, D2223) |
| B2 / B3 added / taken off | the man | `noticePass`: in after not before / before not after | AGREE |
| B4 cancelled / un-cancelled | its people | `common`: cx / uncx | AGREE (D760) |
| B5 programme / B6 Unavailable | its people | `common`: unav / unavoff asked first, then off / on | AGREE (D815, D1393) |
| B7 days or hours move | its people | `common`: when | AGREE in who; the words are D2521's (S9-M1) |
| B8 others put in or out | its people | `common`: add / rem, never the reader himself | AGREE; 3+ as a count (S9-O2) |
| B9 renamed / remark | its people | `common`: title / rmk | AGREE in who; kind change read as rename (S9-M1) |
| (all of B1–B9) | never the one who made the change | `tell`: `to === o.actor` skipped | AGREE |
| (all of B1–B9) | an ALL / ALL AVAIL input tells no man behind it | named men only (`ids`); the placeholder only in who-was-added | AGREE (D702, D397) |
| B10 | the holiday squadron's admins | `holidayTodo` | AGREE (D2195) |
| B11 | the filer of an ALL / ALL AVAIL input with no OIL answer | `oilPendingFor` lights his bell; a tap opens the question (no stored line) | AGREE (D711) |
| P9 | the admins — no bell line, the Approvals group | `alsoSince` | AGREE (D1199 → D1231, D1208) |
| P11 | the man whose bid an input replaced, on the input's line | `rbid` part, said after the rest, never cut | AGREE (D1142) |
| — | the man's own bell for an access request, a bug report | `accessAlert`, `bugAlert` — admins only | AGREE with D216; not in the register (S9-M3) |

**Verdict: AGREE** in who is told; the differences are in the words (S9-M1, S9-O2) and the register's gaps (S9-M3).

### 28. Is this bell line still live, and has he read it

| Surface | What "new" means there | Ruling |
|---|---|---|
| The bell's count and dots | his own read record a line (`noticeseen`) | D769, D227 |
| The SANS reminder | read record keyed by its days; relit only by a day not in it when read | D2560, D2394 |
| A member's own leave window | the moment he last opened it (`lwseen`); lines changed since are dotted | D1481, D1231 |
| An admin's Approvals "since you last looked" | the moment he last opened Approvals (`apprseen`) | D1231, D1208 |

**Verdict: DIFFER, RULED.** Reading a decision in the bell leaves it dotted in his leave window, and the other way round;
D1481 sets them side by side on purpose ("what is new is dotted inside his person window's list only, and his bell
tells him each decision"). Not a finding.

### 29. Does an Undo take the line back, and what does a man who read it see — each line's present form

| Line | Unread, undone | Read, undone — today | Read, undone — as ruled (not built) |
|---|---|---|---|
| Input lines B1–B9 | goes | goes too (`tellPass` — [NOTICE-UNDO-RETRACT] step 2 open) | a new line, "You're no longer in Training on Wed 15 Jul. · Saber" (D2561) |
| Holiday line B10 | goes | goes | a new line; "…is no longer a public holiday" opens nothing (D2561) |
| Posting line B12 | goes | struck, "taken back · <who>" (D1699, D1710) | a new line saying what is true now, "undone" (D2437, D2423); a date moved earlier: two lines (D2561) |
| Leave War lines R1, P2, P4, P7, P8, P10, P12 | goes | struck, "taken back · <who>" (D1216, D1699) | as above (D2437, D2423) |
| SANS reminder B13 | goes | goes (D2391 — "simply goes") | unchanged |
| SANS change lines (D2391's A–E) | goes | struck, "taken back · <who>" (untick's Undo) | "You're SANS again. · Saber" (D2561), "undone" (D2423) |

**Verdict: DIFFER, RULED** — every gap between today and the ruled form is a ruled-not-built item filed as
[BELL-WORDS-CLEAR] / [NOTICE-UNDO-RETRACT]. The open point is S9-O4 (chat 170's word on an unread line).

## Coverage ledger

Lists 1 and 2a (comments, words):
- C0137 · passed — "his to change" there is the man's own input, not a reading; slice 5/3's subject (dropped)
- C0139 · MATCH — the line-stays reading superseded by D1693, as the test's own note says
- C0165 · passed — "his call" matched "this call"; not a reading (dropped, slice 6)
- C0179 · MATCH — the Plan branch's bare-role reading audited against K3; D2160
- C0183 · MATCH — "a member who filed for a squadron-mate and never moved is still told": approved by D2225
- C0184 · OPEN READING — S9-O6
- C0185 · MATCH — D2225's reading is the worked case Q17 he answered
- C0186 · OPEN READING — S9-O3
- C0187, C0217, C0248 · passed — "his call" matched "callsign"
- W0737 "Omit", W0739 · passed / OPEN READING — W0739 is `names` (S9-O2)
- W0738 "Your SANS availability" · passed — the stored name of a line from before D2391, read only for old lines (D56)
- W0740–W0745 · MATCH — D769, D815
- W0746 "Renamed — was" · MISMATCH — S9-M1 (a change of kind)
- W0747 "Inputs need an OIL answer" · MATCH — D783 (the holiday's line counts what is left)
- W0748–W0754 · MATCH — D2340, D2390, D2391, D2394, D2421's drawn words
- W2164, W2171 · dropped — a refusal and a save note, slices 3 and 5
- W2666, W2667 · MATCH — D782 ("<name> is now a public holiday."; a holiday with no name says its dates)
- W2671 "OIL — dates" · passed — a window title, no rule
- W3032 "Notifications" · passed — a label
- Added (missed by the guess): `notices.ts:1098` "Bidding closed · its dates ended" / "Bidding open" · MATCH — D1214, D1433; `notices.ts:992–997` the posting outcomes · MATCH — D1690; `topstate.ts:54,59` "N waiting for access", "N new bug reports" · MATCH D216 (register gap S9-M3)

List 2b (the register's rows):
- GR001 B1 · MATCH — D769 (its rewording filed, D2563)
- GR002–GR006 B2–B6 · MATCH — D769, D760, D815
- GR007 B7 · MATCH in who; words S9-M1
- GR008 B8 · MATCH in who; S9-O2
- GR009 B9 · MISMATCH in part — S9-M1
- GR010 B10 · MATCH — D781, D2195, D2202
- GR011 B11 · MATCH — D711
- GR012 B12 · MATCH — D1690, D1691, D1694, D1696, D2198, D2202
- GR013 B13 · MATCH in words (D2340, D2390, D2391, D2394, D2421, D2560); readings S9-O3, S9-O5; the take-back paragraph S9-M2
- GR014 R1 · MATCH — D1142
- GR015 P2 · MATCH — D1422
- GR016 P4 · MATCH in the app (D1214); register words stale — S9-M4
- GR017 P7 · MATCH — D1214, D1433
- GR018 P8 · MATCH today (D1216, D1699); replaced form S9-M2
- GR019 P9 · MATCH — D1199 answered by D1231; D1208
- GR020 P11 · MATCH — D1142
- GR021 · passed — a placeholder row
- GR022 D2206 · MATCH — not built; words D2213
- GR023 D2200 · MATCH — not built
- GR024 P1 · MATCH — proposed, not built; D1150
- GR025 P3 · MATCH — proposed, not built
- GR026 P5 · MATCH — struck, D1208, D1219
- GR027 P6 · MATCH — struck, D1166
- GR028 P10 · MATCH — rests on D1460's principle; label stale (S9-M4); words S9-O8
- GR029 P12 · MATCH — D1460; words S9-O8
- GR030 P13 · MATCH — proposed, not built
- GR031 P15 · MISMATCH — S9-M4

Lists 3a, 3b (designs, ruled-not-built):
- GD010 postout-bell · MATCH — built to D1690; the ring's place ruled (D1694)
- GD012 taken-back-sans (picture 8) · passed — the struck look since replaced on his word (D2437)
- GD045 sans-words · MATCH — B13's change lines as drawn (D2421); shared with slice 5
- GN023 · MATCH — View never the other's bell (D2202)
- GN028 · OPEN READING — S9-O7
- GN029 · MATCH — D2200
- GN031 · MATCH — D2202 (built in the audience; the mark not built)
- GN040, GN041 · MATCH — the page's "not built" true for `main`; built on the SANS branch (slice 5)
- GN056 · MISMATCH — S9-M5
- GN059, GN060 · MATCH — D2194, D2213
- GN063 · MATCH — built, `holidayTodo` (D2195)
- GN075 · MATCH — D2219 (the other half of S9-M5)
- GN081 · MATCH — not built
- GN083 · dropped — Insights, slice 10
- GN100 · MATCH — not built; missing from the register (S9-M3)
- GN101 · MATCH — not built; the register's P15 does not carry it (S9-M4)
- GN131 · MATCH — not built (D2561–D2563); register S9-M2

List 3c: no specs tagged 9; GS055, GS089, GS095, GS097, GS098 name [NOTIFY-REGISTER] or [NOTICE-RETENTION] — their bell
parts are built (M4) and read through the register's rows above; not opened further.

**Count:** 83 items tagged 9 in the lists (11 comments, 24 strings, 31 register rows, 1 drawing, 16 ruled-not-built),
5 of them dropped as other slices' (C0137, C0165, W2164, W2171, GN083); added: 2 drawings and 4 strings; and the 4
step-B questions. All checked; none left. Findings: MISMATCH 5,
OPEN READING 8, NO RULING 0.
