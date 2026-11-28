# The rulings audit — review 2: slices 3 (who may do what), 4 (the schedule's day), 5 (inputs and SANS)

Written 25 Nov 26 by a fresh Fable reviewer, blind to who wrote what. Reading only: nothing in the app, a drawing or a
rule was changed, nothing committed. Plan: `../plans/2026-11-24-rulings-audit-plan.md` §6 (with §3–§5, §10). Files
reviewed: `2026-11-24-rulings-audit-slice3.md`, `…-slice4.md`, `…-slice5.md`; the helpers' brief `…-slice-brief.md`.
Review 1 (`2026-11-24-rulings-audit-review-1.md`) was read only for its shape and its numbers; this file continues them
(its faults are F1–F2, its questions Q1–Q6, its low items L1–L8, its records fixes R1–R11).

**How each finding was checked:** the ruling's full row opened with the shell (and the rows it names), the cited code
read at its lines in this working copy, the SANS job's branch tip read where the finding turns on it
(`claude/allavail-sans-postout-141` — its rulings D2560–D2568 and `state/notices.ts`, `leavewar/sansunfiled.ts`), and
for every open reading a search of every full-rows file, `DECISIONS-ARCHIVE.md`, `OUTSTANDING.md` and that branch for an
answer of his. Nothing was run in the app: reproduction is the host's step. Ids below carry their slice (S3-, S4-, S5-).

## 1. Counts

23 findings read (slice 3: 5 · slice 4: 11 · slice 5: 7).

| Verdict | Count | Which |
|---|---|---|
| REAL, as stated | 16 | S3-M1, S3-O3, S4-F1, S4-F2, S4-F3, S4-F4, S4-F5, S4-F7, S4-F8, S4-F9, S4-F10, S5-M1, S5-M2, S5-O2, S5-O3, S5-O4 |
| REAL BUT RECLASSIFY | 3 | S3-O4, S4-F6, S4-F11 |
| DUPLICATE | 4 | S3-O1 (of review 1's S9-O6, L6), S3-O2 (of S2-07, Q6), S5-O1 (of S4-F2), S5-O5 (of S9-O3, Q4 — with new evidence) |
| NOT A FINDING | 0 | — |

Marked LOW (changes nothing a person gets that matters, or only in a rare corner): S3-O3, S3-O4, S4-F3, S4-F4, S4-F8,
S4-F9, S4-F10, S5-M2, S5-O2, S5-O3, S5-O4. One decision found by two slices: S3-M1 with S5-M1 (the same refusal words).

| Group | Count | What |
|---|---|---|
| (a) Faults — a clash with a clear ruling, fix list, no question | 4 new | F3–F6 (all four are words on screen); one more already filed and with him (S4-F6) |
| (b) Questions for him | 3 new | Q7–Q9; and Q4 of review 1 gains a fourth place and a correction |
| (c) The low-harm list (one list, D2610) | 11 | L9–L19 |
| (d) Records fixes only | 8 | R12–R19 |
| Not put to him now | 1 | S4-F11 — caps and ops limits, paused by his D2186 |

**MATCH sampling (§5):** slice 3 — every ledger line read, 11 rows opened, none wrong. Slice 4 — all 176 lines it
passed as "a rule-stating string with no clash found" were read by me string by string, because the ledger names no
ruling for any of them; **two are wrong** (W2538, W1736). Slice 5 — its OIL, published-day and permission MATCH lines
and one line in eight of the rest; **one is wrong** (W2392) and two who-may strings were passed as labels (W2192,
W2204). All five belong to faults F3 and F6 below, so no decision was lost — but by the plan's rule (two wrong matches)
part of slice 4 goes back: see §5.

## 2. Verdict on every finding

### Slice 3 — who may do what

| Id | Verdict | Why (what I opened) | Harm |
|---|---|---|---|
| S3-M1 | **REAL** — MISMATCH, a fault; one decision with S5-M1 | D655: "Him, the filer, and an admin". Code confirmed: `ui/InputWindow.tsx` 1274 "Only <man> or an admin can change this."; `ui/InputsCal.tsx` 982 "Only <man> or an admin can delete this input". `state/perms.ts` lets the filer in (`filedForOther`); the shared-input sentence (`sharedRefusal`) names him. | Told wrongly who to ask (words) |
| S3-O1 | **DUPLICATE** of review 1's S9-O6 (L6) | The same reading in D2228's row ("the filer an admin of that squadron today"), the same code (`state/notices.ts filerVia`). Nothing new. | — |
| S3-O2 | **DUPLICATE** of review 1's S2-07 (Q6) | D2212's row: "the take-over's further detail (one minute, 'Take over anyway', the saved plan) stays the agent's reading". Already Q6, waiting for the database step's design round. This slice adds one sharper point for that question: his word was "ask", and "Take over anyway" takes the day without the holder's yes. | — |
| S3-O3 | **REAL, LOW** | D2250 lets an admin of the man's own squadron end his Plan by making him a member; `state/accounts.ts relinkRightsProblem` (440–449) still keeps a re-link of a sign-in holding Plan to a master admin alone. D2241's row says the re-link rule was to be "brought in line by the next chat"; it was, for a View right only. But D2266 (22 Nov): no control moves a sign-in to another person, "for now" — so no one can meet it. No answer of his found. | None today — unreachable |
| S3-O4 | **REAL BUT RECLASSIFY** → LOW, settles on a drawing already owed; plus a records fix (R14) | D1667 (5 Nov): a refusal opens "Blocked:", never "Not saved", which is the failed-save band's alone — his own pick. D2261 (22 Nov) quotes the ✕'s words beginning "Not saved:"; those words were the agent's draft inside a reading, and his "b10 ok" answered who may take the leave off, not the first word. The built door (`ui/inputedit.tsx` 170) says "Blocked:". Not built; D2261 itself says "drawn first". | Words only, not built |

### Slice 4 — the schedule's day

| Id | Verdict | Why | Harm |
|---|---|---|---|
| S4-F1 | **REAL** — two places differ, never asked | Code confirmed: `engine/avail.ts personBusy` (16–54) counts every row naming a man, an SC SPARE, AVALON or BB row and its desk included; the ALL AVAIL crowd drops anyone busy in the item's hours (`leavewar/sync.ts` 2226). The crew list, the seat check and the warning list all read a standing-by man as free (D1120, D2061, D2065). His words: "they are available to be planned" (D1120); "They can be doing other things during standby" (D2061); "for planning they can be planned for other thing which ive already set with u" (D2065). No row names the crowd for a standby man (searched standby / SPARE / AVALON beside ALL AVAIL and "crowd" in every full row, the archive, the backlog). | **OIL** — the crowd on a weekend or holiday item earns |
| S4-F2 | **REAL** — OPEN READING, never asked; one decision with S5-O1 | Code confirmed: `engine/validate.ts` 1526–1545 — only "not offering" and "outside his hours" raise; nothing filed is "DELIBERATELY silent", on the builder's note of 14 Aug 26. The Logic page says "Filing nothing raises nothing." (`ui/logic-html.ts` 191). The crew list strikes him and an armed seat gives the reason. D2564's "the same the crew list greys and the warning reads" is about which rows count as planned, not this. D2420 is the nearest word of his — the crew list needs no reason line, "0 free" already says it — and it is about the crew list, before the drop. Nothing on the SANS branch (D2560–D2568) answers it. | **Published record** — a day goes out with a SANS man in a jet he never offered for, nothing on the list |
| S4-F3 | **REAL, LOW** — disclosed, unanswered | D1120's row: reading (4), the day's figures and the Leave War "left as they are", and D1118's "a man on ATT B who is also tasked keeps today's faded look" — both "told to him", no answer found. Code confirmed: `avail.ts dayTasked(d)` for the day panel and `availByWave`, `dayTasked(d,true)` for the crew list. So on one screen the crew list counts a standing-by man free and "Aircrew tasked" counts him tasked. | Low — two figures that disagree |
| S4-F4 | **REAL, LOW** | Code confirmed: `ui/palette-html.ts` 157 and 270 drop a man by today's archive mark on every day; D327 ("4 correct") and D323 read an archived man by his dates. No row names the crew list on a day before an archive. Only met when a scheduler corrects a day before the archive. | Low |
| S4-F5 | **REAL** — MISMATCH, a fault | D2424 (24 Nov): the mark "must not say he 'misses' it"; D2427: "overlaps", "in the warning list and the ALL AVAIL window alike". Code confirmed: the Legend's four labels (`ui/html.ts` 455–458) and the checks' short names (`engine/validate.ts` 30, 77) say "misses"; the filed job ([ALL-AVAIL-WINDOW-FLAGS]) names only the four sentence bodies. D2078's approval of the Legend (16 Nov) is the older ruling. | Words only |
| S4-F6 | **REAL BUT RECLASSIFY** → already found, filed and drawn for him; no new entry | `OUTSTANDING.md` [STANDBY-NO-TIMES-SEAT] (16 Nov), drawn as Q1 of `docs/mock/2026-11-17-held-fixes/page.html`. No ruling of his cites that page, so it is still unanswered — told, not answered. The fix itself is clear (the seat check and the warning list must agree); only its words wait for his look (D1625). | Published record |
| S4-F7 | **REAL** — OPEN READING, never asked | D2073's row: "The agent's reading, not checked with him: only a desk made from an SC shift template, not every duty row with no END." D2080's and D2055's rows say the same of their parts. Test confirmed: `engine/assumedlanding.test.ts` 217–220, "a plain desk (no SC template) with END blank keeps the assumed hour: ended 21:00". He has answered this same shape three times (D2055, D2073, D2080), each time "left out until its END is typed"; the plain desk was never the case shown. The test's comment says "told to him" where the row says "not checked" (R17). | **Published record** — crew rest worked out from an hour nobody typed |
| S4-F8 | **REAL, LOW** | D1062's row: "The agent's reading: 'nobody seated' means neither seat holds a person or a placeholder." His case had both seats empty. Test confirmed: `engine/rulesfirst-2-standby.test.ts` 194. A jet with one seat filled counting as a jet is the plain sense. | Low — a count |
| S4-F9 | **REAL, LOW** — disclosed, unanswered | D605's row, reading (6): the reach to "a whole-day course, an overseas duty or an all-day meeting too … this wider reach is the agent's and his to narrow", told in the build's report. No answer found. The timed check already flags those kinds once the seat has times, so this only brings the same flag forward. | Low |
| S4-F10 | **REAL, LOW** — MISMATCH, a fault (what a later ruling left behind) | "It returns if the warning changes." is his approved wording (D839, 14 Oct). D2001 (11 Nov) then ruled that a hidden clash stays hidden "whatever their times" — built (`engine/warnhide.ts hideKey`). So for a clash the words now promise a return that does not come when only the times move. Three strings: `ui/board.ts` 546, `ui/html.ts` 1216, `ui/interactions.ts` 1873. | Words only |
| S4-F11 | **REAL BUT RECLASSIFY** → not put to him now | Caps and ops limits is paused by his D2186: "its questions are not put to him again … until he says". The eight questions and reading R4 stay in the caps design note and wait for his call. | None until built |

### Slice 5 — inputs and SANS

| Id | Verdict | Why | Harm |
|---|---|---|---|
| S5-M1 | **REAL** — MISMATCH, a fault; one decision with S3-M1 | The delete sentence is S3-M1's own string. New here: `ui/caldrag.ts` 114, "Only a scheduler can move someone else's input" — the man himself and the filer may move it too (the comment four lines above says so). | Told wrongly who may act (words) |
| S5-M2 | **REAL, LOW** — MISMATCH, a fault | Code confirmed: `ui/logic-html.ts` 184, "Every input closes the man for the hours it covers … One a scheduler has taken off the programme closes nothing." A cancelled input and an information-only one close nothing either (D760, D814; `personBusy` skips both). | Words only (rule text) |
| S5-O1 | **DUPLICATE** of S4-F2 | The same silence, the same code note. Its worked case (a copied week) is the better one for when it happens; kept in Q8. | — |
| S5-O2 | **REAL, LOW** — already filed, never put | D2313's row: "left on today's tick, the agent's reading: who may file SANS availability, the Quals tick itself and the Leave War's row". D2327 answered "the two places that go by today" — the highlight chip and who may be filed; the Leave War's rows were not on that page. Code confirmed: `leavewar/engine/availrows.ts withoutSans` and `state/raptorRoster.ts` 62 read today's tick for every date. Already in the backlog: [FABLE-READ-FAULTS] (g), "each to be decided in the bug check's roll-call". | Low — a count on days before a hand tick |
| S5-O3 | **REAL, LOW** | D2560 put the working copy to him for a week being built ("a scheduler moving SANS men around while building the week"); D2566 says "as soon as he is planned". Which copy the reminder reads on a day already published, with an amendment waiting, was never said. Branch tip confirmed: `leavewar/sansunfiled.ts` reads the loaded days and the saved weeks as they stand. | Low — told a little early or late |
| S5-O4 | **REAL, LOW** | D2341: "hidden on every screen and in every count". The offer's own window still names both men (the builder's reason: hiding him there would let a save drop him). "Told to him" in a closing report only — never put. | Low — a name in a window, nothing counted |
| S5-O5 | **DUPLICATE** of review 1's S9-O3 (Q4), with two things new | (1) For the reminder, "and 1 more" was on the drawing he approved as drawn (D2421; `docs/mock/2026-11-24-sans-words/index.html` line 75) — so its standing is *approved in a drawing, then reopened by his own words of 24 Nov* ("see what else in the app also has this"), not "inside wordings he set aside" as review 1 has it. (2) The same body cuts the "hidden" sentence of the posting-changed lines past three days (`state/notices.ts sansDaysWords`, used at the branch's 1204–1205), which no drawing ever showed with a count. Both go into Q4. | Told in part |

## 3. What stands, grouped

### (a) Faults — clear ruling, fix list, told to him in one list, no question

All four are words a person reads: Opus drafts, a fresh Fable reviews and adjusts (D2441); new words are drawn for him
first (D1625).

- **F3 — a refused change to one man's input names the wrong people** (S3-M1, S5-M1). When: a member taps or drags a
  squadron-mate's input on the Inputs page, any day — weekly. Example: Ranger files a Training on Thu 16 Jul for Ace.
  Hex opens it and reads "Only Ace or an admin can change this." — Ranger, who filed it, can, and is the one Hex should
  ask. Hex drags its bar and reads "Only a scheduler can move someone else's input" — Ace and Ranger both may. Fix: the
  three sentences name the man, the filer where he still may, and an admin, as the shared-input sentence already does;
  and say the members' switch is off where that is the reason. Strings: `ui/InputWindow.tsx` 1274, `ui/InputsCal.tsx`
  982, `ui/caldrag.ts` 114. For the wording reviewer, same family: "You can only edit your own inputs" and "You can
  only delete your own inputs" (`ui/inputedit.tsx` 1336, 2105) — a member may also change one he filed.
- **F4 — the Legend and the checks' short names still say "misses"** (S4-F5). When: every scheduler reads the Legend;
  the short names head the warnings' groups — daily. Example: the Legend reads "B misses flight brief" beside a mark
  that, by his ruling of 24 Nov, must only state the overlap. Fix: add the Legend's four labels (`ui/html.ts` 455–458)
  and the four short names (`engine/validate.ts` 30, 77) to [ALL-AVAIL-WINDOW-FLAGS]'s wording job, so they change
  with the four sentences and are drawn with them.
- **F5 — the words for hiding a warning promise a return that a clash no longer makes** (S4-F10). When: a scheduler
  hides a clash he has accepted, then moves one of the two items in time — weekly. Example: Saber hides "Ranger: VL
  BFM clashes with OPS BRIEF", reading "It returns if the warning changes."; he moves the brief by 30 minutes; the
  clash still stands and stays hidden, as ruled on 11 Nov. Fix: the three strings say what brings it back — another
  man, or a different item. His approved sentence of 14 Oct changes, so the new one is drawn for him.
- **F6 — the Logic page says every input closes its hours** (S5-M2). When: a scheduler reads the Logic page to judge
  why a man reads free — rare. Example: Ranger's Training on Wed 15 Jul is cancelled by a CX; the crew list reads him
  free in those hours, the Logic page says every input closes them unless taken off the programme. Fix: the line
  names a cancelled input and an information-only one beside the one taken off (`ui/logic-html.ts` 184).
- **Already filed, no new number — a WSO in an AVALON or BB front seat with no times raises nothing** (S4-F6):
  [STANDBY-NO-TIMES-SEAT], drawn for him on the held-fixes page of 17 Nov as its Q1 and still unanswered. The host
  lists it with these so it is not lost; the combined list carries it as "waiting — his look at the words".

### (b) Questions for him — highest harm first

**Q7. A man on standby (SC SPARE, AVALON or BB): is he counted in ALL AVAIL for something in his standby hours?**
(S4-F1)
- When: a weekend or holiday with a standby crew and a briefing or event for ALL AVAIL in the same hours — a few
  times a month; on a weekday it changes only the count.
- Example: Sat 18 Jul, Hex on SC SPARE 07:00–13:00; an OPS BRIEF 09:00–10:00 for ALL AVAIL. Today the crew list
  shows Hex free and counts him in "N free", but the ALL AVAIL count leaves him out, his name is not in its window,
  and in OIL Earn he earns nothing from the brief.
- His words so far: a standby man "should not be faded as they are available to be planned"; "They can be doing
  other things during standby"; "for planning they can be planned for other thing". None was said of the ALL AVAIL
  count.
- **Recommendation: count him in** — the count is "who has nothing else on at that time", and by his own words
  standing by is not something else; the scheduler can still take one man out by hand in OIL Earn. The cost to say:
  published weekends with a standby crew and an ALL AVAIL item will read pending until published again.
- For the host: a Saturday with an SC AM (a man on a SPARE row, times typed) and an ALL AVAIL ground item inside those
  hours; the crew list's count, the item's count and window, OIL Earn. Then the same with an AVALON row and its desk.

**Q8. A SANS man in a jet or sim with nothing filed for that day: should the day's warning list say so?**
(S4-F2, S5-O1)
- When: a scheduler copies last week's waves forward, drops a man on a seat that was not picked first, or the man
  deletes his own filing after being planned — monthly.
- Example: Saber copies the waves into the week of 20 Jul; Hex (SANS, nothing filed for Tue 21 Jul) comes across in a
  WSO seat. The crew list strikes Hex, but Tuesday's warning list is clean and the day is published so. Had Hex filed
  "sim only", the list would say "not offering Fly today".
- His words so far: the reminder to the man himself (as ruled); for the crew list, "0 free" already says it and a
  scheduler need not be told to file. Nothing about the warning list, which is what stays on the day and goes out with
  it. The Logic page has said "Filing nothing raises nothing." and he was never asked.
- **Recommendation: yes, one amber line** — the same weight as "not offering Fly today", worded as a fact for the
  scheduler ("Hex has filed no SANS availability for Tue 21 Jul"), never telling him to file. It counts the same seats
  his reminder does. The cost to say: today's demo weeks, and any published day with such a man, would show the new
  line — a published day reading pending until published again. New words, so drawn first.
- For the host: a SANS man with nothing filed dragged onto a flying seat with no seat picked; the crew list and the
  warning list side by side; then the same man with "OFT only" filed.

**Q9. A duty desk with a start time and no end time: is it left out of crew rest until its end is typed?** (S4-F7)
- When: a scheduler types a duty's START and forgets or does not yet know its END — a few times a month; it matters
  when the man flies or reports early the next day.
- Example: Fri 17 Jul, Bane is SDO from 20:00, no end typed. Today the app takes the duty as ending 21:00 and clears
  him at 09:00 on Saturday — so a 07:00 in-time reads as a crew-rest breach, and if the duty really ran to 02:00 a
  10:00 report reads clear when it is not.
- His words so far: three times, for a standby shift, a desk from an SC shift template and an AVALON or BB desk whose
  wave flies — each "left out of crew rest until its END is typed", never counted as ending an hour after its START.
  The ordinary desk was never the case shown; the record says so ("not checked with him").
- **Recommendation: the same for every duty desk** — left out until its end is typed, one rule for all of them, and
  the Logic page's crew-rest line says "a duty with no end time". Kept as built for the other checks (a clash still
  reads the assumed hour).
- For the host: Friday, a plain duty row 20:00 with END blank; Saturday, a wave with a 07:00 in-time for the same man;
  the crew-rest line. Then the same with END 23:00.

**Q4 of review 1 — one more place, and a correction** (S5-O5). The fourth place the app gives a number where it could
name the things: the "hidden" sentence of the SANS posting lines ("…the SANS availability you filed for Fri 17, Sat
18, Mon 20 Jul and 2 more is hidden…"). And the SANS reminder's "and 1 more" was on the drawing he approved on 24 Nov
— so the page should say he has seen that one and ask whether it stays, as it does for "Training for 3 people".

### (c) The low-harm list — one list he can take whole; each recommended as built unless said

| # | From | In one line | Recommendation |
|---|---|---|---|
| L9 | S4-F3 | A man only standing by reads free in the crew list, but the day's "Aircrew tasked" counts him and the free-crew strip leaves him out of every wave. | Make the day's figures read him free too, so one screen gives one answer — a small build, after Q7. |
| L10 | S4-F3 | A man on ATT B who also has a task that day keeps the faded look; an AVALON or BB desk counts as that standby's desk. | As built. |
| L11 | S4-F4 | Ranger is archived on Thursday; on Monday of the same week the crew list no longer offers him, though the ALL AVAIL count for Monday includes him. | Read him by the day, as the count does — a small fix, met only when a past day is corrected. |
| L12 | S4-F7 | A standby desk left out of crew rest still keeps its assumed hour for clashes; one commitment found twice takes the plainer end; a standby shift that flies with no END is treated as having none. | As built. |
| L13 | S4-F8 | A SPARE row of a flying shift with only one seat filled counts as a jet. | As built — one seat is somebody. |
| L14 | S4-F9 | A man with an all-day course, overseas duty or all-day meeting is flagged the moment he is seated on a row with no times, as a man on leave is. | As built. |
| L15 | S3-O3 | Moving a sign-in that holds Plan of another squadron to another person is a master admin's alone. | Nothing now — no screen moves a sign-in (his ruling of 22 Nov); ask if that control is ever drawn. |
| L16 | S3-O4 | The refused ✕ on leave that runs across a man's move was written to open "Not saved:"; every other refusal opens "Blocked:". | "Blocked:", as his rule of 5 Nov — shown on its drawing, already owed before it is built. |
| L17 | S5-O2 | The Leave War's Available rows and SANS group, and the Inputs calendar's people groups, go by who is SANS today, on every date. | Read by the day, as every other screen now does — rides [FABLE-READ-FAULTS] (g), where it is already filed. |
| L18 | S5-O3 | On a published day with an amendment waiting, a SANS man's reminder follows the working copy, so it can name a day his own schedule does not show yet. | As built — it follows the plan as soon as he is planned, as his two rulings of 24 Nov have it. |
| L19 | S5-O4 | An offer filed for two SANS men still names both in its own window on a day one of them is not SANS; the day and its counts show only the one. | As built — nothing is counted, and hiding him there could drop him from the offer. |

### (d) Records fixes only — no question, no change to the app

| # | From | The stale or missing record | The fix |
|---|---|---|---|
| R12 | S3 note N1 | `leavewar/state/store.ts` 4194–4196: the comment says a posting refuses "his days from the posting-out date" — D1436's replaced reading; the code refuses only the Delete outcome (D1541, D1545 — row opened). | Rewrite the comment to cite D1545. |
| R13 | S3 notes N2, N3 | The People & accounts page: "no guest view, switch or button into it (to be removed)" is done (D2239); the heading "Many squadrons and aircraft types — not built yet" now covers lines that are built (the master admin's doors, Plan and View rights, the last-admin count, the downgrade). | Correct both; a changed rulings page is read as the page's rules require. |
| R14 | S3-O4 | D2261's row quotes the ✕'s words opening "Not saved:", against D1667. | Mark the row: the words are a draft, to open "Blocked:" unless he says otherwise on the drawing (L16). |
| R15 | sampling (S3 GN028) | Review 1's L7 (S9-O7: a master admin switching another squadron's bell lines on himself) is listed as open; D2217 (19 Nov) approved the drawn "Show 142 149" bell buttons. | The host checks the drawing shows both halves (another squadron's on, his own off); if so L7 closes as answered and D2198 leaves review 1's list of rows to mark. |
| R16 | S4-F10 | D2001's row ends "Not built"; it is built (`engine/warnhide.ts`), and the scheduler page states it as built. | Correct the row's last words. |
| R17 | S4-F7 | `engine/assumedlanding.test.ts` (the D2055 block's comment) says "told to him" of a reading its row marks "not checked". | Reword the comment with the next change to that file. |
| R18 | S4-F5 | [ALL-AVAIL-WINDOW-FLAGS] names only the four sentence bodies for D2424's rewording. | Add the Legend's four labels and the four short names (F4). |
| R19 | sampling | Ledger lines to correct: slice 4's W2538 and W1736 (MATCH → F6, F3); slice 5's W2392 (MATCH → F3), W2192 and W2204 ("passed" → F3's family). Slice 4 names no ruling for 176 rule-stating strings. | Correct the five lines; §5 for the 176. |

## 4. Open readings to mark in their rows (plan §6 — once the method fix's §C1 is live)

D1120 with D2061, D2065 and D37 (a standby man and the ALL AVAIL count) · the SANS warning's silence for nothing filed
(no row holds it — the mark goes on D2564's line of the scheduler page and the Logic page's sentence) · D2073, D2080,
D2055 (the plain desk; the other checks; a shift that flies) · D1120 readings 2–4 and D1118 (the day's figures; ATT B
and tasked) · D327 with D323 (the crew list on a day before an archive) · D1062 (one seat filled) · D605 reading 6 ·
D2250 with D2241 (a re-link of a sign-in holding Plan) · D2261 (the first word) · D2313 (the Leave War's rows on
today's tick) · D2560 with D2566 (the reminder on a published day) · D2341 (the offer's own window) · D2342 and D2391
(the "hidden" sentence's count). Not marked again: D2228 and D2212, already in review 1's list.

## 5. The MATCH lines sampled

**Slice 3** — all 363 ledger lines read. Rows opened: D655, D763, D1545, D1667, D2196, D2198, D2205, D2217, D2225,
D2240, D2261. **Wrong: none.** Flagged: GN028 — right, and it answers review 1's L7 (R15). Said plainly by the helper
and worth repeating: 60 of the "ruled, not built" lines and the 17 drawing pages were read by their cited numbers, their
rows "not opened one by one", and no picture was fetched.

**Slice 4** — its ledger gives a ruling for the comment lines and the designs, but for the words it gives two stock
phrases: 516 "label … states no rule" and 176 "read; a rule-stating string with no clash found" with no ruling named.
I read all 176 strings from the inventory. **Wrong: 2** — W2538 (the Logic line "Every input closes…", passed as MATCH
on D178, D1357; it is F6) and W1736 ("Only a scheduler can move someone else's input", passed; it is F3). Both are
lines slice 5 also held, and slice 5 caught them. The OIL and published-day strings among the 176 (the Logic page's OIL
lines, "A published day keeps its OIL until it is published again", the working-copy and sign-off notes, "appointed
schedulers only") agree with D142, D360, D814, D1651, D1997, D2005 and D2079, whose rows I opened or review 1 had.
**By the plan's rule, two wrong matches send the slice back.** My reading: send back only those 176 lines, to a fresh
helper who names the ruling for each — the comment and design lines carry their rulings and sampled clean. The host's
call; said here so it is not lost.

**Slice 5** — every MATCH line touching OIL, a published day or who may act, and one in eight of the rest. Rows
opened: D360, D617, D655, D704, D731, D755, D760, D814, D1586, D1621, D2313, D2327, D2338, D2340–D2343, D2346, D2388,
D2390, D2391, D2394, D2420, D2421, D2560, D2564–D2566, D2568. **Wrong: 1** — W2392 ("Only <man> or an admin can change
this.", MATCH on D655; it is F3 — the helper caught the delete sentence beside it and missed this one). **Mis-passed
as labels: 2** — W2192, W2204. All three are one fault, already found; I do not send the slice back, but the host
should have the "passed" strings of the four inputs files (`ui/inputedit.tsx`, `ui/InputWindow.tsx`,
`ui/InputsCal.tsx`, `ui/caldrag.ts`) re-read for who-may sentences when F3 is fixed. Flagged: "the faded days: his view
only" rests on "shown in the drawing and not changed by him" (D2346) — he picked the look from that drawing, so
approved stands.

Not done by this review: nothing was run in the app; slice 4's 516 "label" lines were not re-read; the rows behind the
other MATCH lines were not opened one by one.

## 6. For the host's reproduction — the case for each

F3: a member opens, drags and presses Delete on a one-man input another member filed for a third (switch on, then
off). F4: the Legend and a brief-overlap warning's heading. F5: hide a clash, retime one item, the tooltip and the
passing note. F6: a cancelled input's man in the crew list beside the Logic line. Q7, Q8, Q9: the cases under each
question. L9: a day where a man only stands AVALON — the crew list's "N free" beside "Aircrew tasked". L11: archive a
man on Thursday, open Monday's crew list and Monday's ALL AVAIL window. L17: tick a WSO SANS on Wednesday, read
Monday's Available WSO figure before and after. L18: a published Saturday, a SANS man swapped in on the working copy,
his bell before the amendment goes out. L19: one offer for two SANS men, one man's SANS date moved a day later, the
day and the offer's window.
