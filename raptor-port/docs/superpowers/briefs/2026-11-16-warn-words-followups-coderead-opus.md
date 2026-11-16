Fresh, blind Opus reader; commit 7eade5b52; folder C:/Users/User/wwf-read; blind to the walk and to Astra's read

(No compaction happened during this read; no handoff block was pasted or read. Nothing under C:/Users/User/projects/Raptor was opened. The brief's last paragraph, addressed to Astra, was ignored as instructed.)

Scope read: JOB-DIFF.patch whole; the D2055, D2070-D2078 full rows; engine/events.ts (buildDay, push, standaloneHits), engine/validate.ts (WCODE, CHIP_LABEL, crewRestDay, restDayAt, restIfPlaced, crossDayIfPlaced, every QUAL / SC_QUAL / AAR_* markChip), engine/avail.ts (slot info, slotBar's crew-rest refusal), engine/dutytpl.ts, engine/waves.ts, engine/daytpl.ts, engine/restore.ts, engine/canonical.ts, engine/drafts.ts, engine/publish.ts (snapshot clones), engine/weekctx.ts (cross-week seeds), ui/html.ts (legendHTML, puck), ui/Shell.tsx (both Legend homes), ui/logic-html.ts, ui/LogicPage.tsx, engine/rules.ts (KIND_LABEL, RULE_SPEC), state/dropflag.ts, testing/refwin.ts, reference/scheduler.html's legend, the 02-shell.css legend rules.

=====================================================================
FINDINGS, most serious first
=====================================================================

F1 — The Q chip is called "Illegal seat" on a man whose only fault is a lapsed qualification (not SC current, not AAR current, not cleared to instruct AAR). OLDER (from the merged warning-words build, where it read "Wrong seat"); this change re-wrote the very line and carried it forward. Severity: medium (a wrong reason on every puck that wears Q for a currency lapse, and on the Logic page's chip key; the approved Legend says the opposite).

  Setup: any day; put a pilot who is NOT SC DAY current on SC AM MAIN 07:00-13:00 (or put a pilot who is not DAAR current in the front seat of a line whose remarks say AAR on a day wave; or an instructor without the AAR "I" mark in the back of such a jet).
  Action: let the day validate; hover (desktop) or long-press (phone) the man's puck on Edit Schedule or View-only Sched; open the Logic page's chip key.
  What the screen shows: the puck's red Q chip has the hover title "Illegal seat", and the puck's own title ends "· Illegal seat" — for a man sitting in a perfectly legal seat. The warning list beside it says "Not SC DAY current: SC AM MAIN 07:00–13:00". The Logic page's chip row prints "Q Illegal seat". The week's Legend (D2074/D2075/D2078, approved picture) says "Q qual / illegal seat" — two names for one chip, and the hover's name is false for this man.
  Cause:
   - engine/validate.ts:75 — CHIP_LABEL Q:'Illegal seat'.
   - Q is not a one-check chip: engine/validate.ts:1150 (SC_QUAL, standby seats), :1373-1374 (AAR_INSTR, BOTH men), :1378 (AAR_QUAL), :1422 (SC_QUAL, SC lines) all markChip(...,'Q',...). RANK puts Q at the top (13), so whenever any of these fires, the printed flag is Q.
   - ui/html.ts:538 (the chip's title) and :553 (the puck's title) print wlbl(CHIP_LABEL[flag]); ui/logic-html.ts:92 (lgChipRow) prints the same label.
   - engine/validate.test.ts:70-73 pins the error: it lists Q:'QUAL' among the "chips that stand for one check only", which is false.
   - testing/refwin.ts:408-409 swaps the reference's Q label to the same word.
  Old vs new: minus line was Q:'Wrong seat' (same defect, older); before the warning-words build it was the reference's 'Qualification — illegal seat', which covered both halves. D2074's "the check's short name is Illegal seat" is about WCODE.QUAL (the check), and its "the Legend keeps qual / illegal seat" exists precisely because Q also marks a lapsed qualification (D2075's row says so). The chip is the Legend's thing, not the check's.
  Fix, step by step (wording "Qual / illegal seat" is the Legend's own approved wording, so no new words are invented; if the host prefers to ask him, ask with this as the recommendation):
   1. engine/validate.ts:75 — change `Q:'Illegal seat'` to `Q:'Qual / illegal seat'`. Leave WCODE.QUAL:'Illegal seat' (line 28) as it is.
   2. engine/validate.test.ts:71 — remove `Q: 'QUAL', ` from the `one` map (Q stands for four checks), and add below line 73:
      `expect(CHIP_LABEL.Q, 'Q stands for QUAL, SC_QUAL, AAR_QUAL and AAR_INSTR, so it carries the Legend\'s name').toBe('Qual / illegal seat')`
   3. testing/refwin.ts:409 — change the `to` side to `"CR:'Crew rest breach (<{crewRest})',Q:'Qual / illegal seat',"` so the reference's CHIP_LABEL table stays byte-identical to the port's.
   4. Add the red-first test (engine/validate.test.ts or warnwords.test.ts): seat a pilot who is not SC DAY current on an SC AM MAIN seat, validate(), assert `WARN.chip[di][id]==='Q'`, that the day's warnings for him are SC_QUAL only (no QUAL), and that `puck(id, …, 'Q')` from ui/html.ts has a title that does NOT contain "Illegal seat" and DOES contain "Qual / illegal seat". It fails today.
   5. Search the html.test parity tests for a hard-coded 'Illegal seat' chip title (none found by this read) and re-run html.test.ts, validate.test.ts, warnwords.test.ts, logic.test.tsx.

F2 — The Logic page still says a duty row with no END is assumed to run an hour, and that the day before "ends at its last commitment of any kind"; for crew rest that is now false for an SC-template desk (and was already false for a standby shift, D2055). NEW in part (D2073 adds a second unexplained exception); the D2055 half is OLDER. Severity: low (explanatory text; no wrong warning).
  Setup: Logic page, any role.
  Action: read "Rows with no end time → Any other row" and "Crew rest → How it works".
  What the screen shows: "The same for a ground, programme or duty row." (i.e. taken to run the Assumed length) and "The day before ends at its last commitment of any kind … Anything else ends at its written end." Nothing says that a standby shift, or a desk from an SC shift template, with START and no END is left out of crew rest until its END is typed. A scheduler who sees Friday's 20:00 SC desk with no END and Saturday 07:00 with no crew-rest warning reads the Logic page and finds a rule that says it should have fired.
  Cause: ui/logic-html.ts:62 and :104-113 (the crewrest `how` list); not touched by this change; events.ts:519-522 and validate.ts:546-547 now skip the desk.
  Fix (new visible words — put the sentence to him before building, D1625/D2071 practice; recommended text):
   1. In ui/logic-html.ts, crewrest `how` (line ~106), after "Anything else ends at its written end." append one sentence: "A standby shift, or a desk from an SC shift template, with its START typed and no END ends nothing until its END is typed."
   2. Keep line 62 as it is (the assumed hour still stands for every other check, per D2073's reading).
   3. Pin it in logic.test.tsx: `expect(how('crewrest').join(' ')).toContain('a desk from an SC shift template')`.
   4. Note the "how" fold is "exactly four (D928)" in the type comment at logic-html.ts:83 while crewrest already has eight lines — so append to an existing line, do not add a ninth, if that rule is still enforced.

F3 — Question, not a defect: an AVALON or BB desk whose wave flies (D1997 makes it an ordinary duty row) with START typed and END blank still counts START + one hour in crew rest. OLDER behaviour, but D2073 now draws the line at "SC template only". Severity: low / a product question.
  Setup: AVALON wave with a row that flies (B or R typed) so its desk is checked (waves.ts saDeskFlies); on the AVALON desk, Friday, type START 20:00 and clear END; same man on a Saturday 07:00 in-time.
  Action: validate.
  What the screen shows: Saturday "Crew rest" naming Friday's desk "ended 21:00". The same desk from the SC template shows nothing (D2073); the AVALON/BB standby SHIFT with no END shows nothing (D2055 covers SC, AVALON, BB).
  Cause: engine/events.ts:542 `const scDesk=dw.sa==='sc'` — only 'sc'.
  Fix: none without his word. If he says "the same for AVALON and BB desks", change line 542 to `const scDesk=dw.sa==='sc'||saExemptKind(dw.sa)` (only reachable once the wave flies, because a non-flying AVALON/BB desk returns early at line 527-537), and add the mirror of the D2073 test with `sa:'avalon'` and a flying AVALON line.

=====================================================================
EXPLICIT NEGATIVES — checked and found right
=====================================================================

D2073 — every way a desk gets, keeps or loses its SC mark (`dutywaves[i].sa==='sc'`):
- + Block → SC Shift: ui/board.ts blockMenu → engine/dutytpl.ts:184 blockFromTpl sets blk.sa=t.wave. A user template whose wave is set to SC gets it too; "Empty block" and a template with no wave get none (a block named "SC Shift" typed by hand is plain — matches the agent's reading).
- Library loaded from storage: dutytpl.ts:219-225 keeps 'sc' (and restores it to the seeded 'sc' id when the field is missing).
- Day templates: daytpl.ts mintBlob deep-clones dutywaves and strips only ids/cx/flags — sa survives; apply clones again (line 251).
- Alt Plan / saved plan, duplicate: drafts.ts works on full clones; the mark is part of the dl: composite (restore.ts:104 `label␟sa␟noconf`), so a change of it is tracked.
- Publish / 👁 look / load back: publish.ts:555, 956, 961 are JSON deep clones of the whole day — sa survives.
- Renaming a block: slots.ts:334 writes `label` only — the mark stays.
- Reordering blocks: reorder.ts:418-424 moves the block objects — the mark travels.
- Adding a row inside an SC block / moving a row between blocks: the mark is per block, so a row takes the mark of the block it sits in (consistent with "a template's block carries its template mark").
- No copy/paste of days or blocks exists in src (searched).
- Undo/Redo and reload restore whole day objects; nothing whitelists block fields (schema.ts DutyBlock carries sa).

D2073 — every reader of a desk's end that is crew rest:
- The warning line and the day-loop: validate.ts:1303 crewRestDay → the skip at :547 before rawEnd is worked out.
- The forward trace / "Breaks <tomorrow>" box / dotted mark: markTrace inside the same body.
- Sunday → next Monday: validate.ts:1720-1722 (phantom next Monday) and :1302 (PREVSUN) both feed restDayAt → weekctx.ts datedRestSeed, which builds through the same buildDay (weekctx.ts:169, 250, 260, 314) on the stored day object, so the mark is read there too.
- The crew picker's SC-seat crew-rest refusal and ALL AVAIL: avail.ts:469 restClear ← REST[di], built at validate.ts:601 from the same maps.
- The pre-drop probe (restIfPlaced): CREWREST_BODY is the same closure; strip()/spreads keep `noEnd` because it is an ordinary (enumerable) property — unlike `ae`, which a spread would drop. `{...sibE}` carries it as well.
- Extras on the desk row (`more`): push is called with scDesk for them too (events.ts:544).
- A desk with END typed: `en!=null` → no flag → counts at its END (the control test).
- A desk with words in END ("TBD"): parseHM → null → treated as blank, same as D1990's reading for landings.
- A desk with no START: goes to `blank` before the flag (events.ts:505) — unchanged.
- Not crew rest, so correctly untouched by D2073 (agent's reading, D2073 "crew rest only"): the long day, Insights' hours, OIL (openEndRows), the tight turn, the conflict check and the "already on SC desk" same-hours check (avail.ts:207-214 slotStart/slotEnd = START + Assumed length) all still use START + the assumed hour. No reader of `noEnd` other than validate.ts:547 exists.
- Parity: `noEnd` is enumerable, but the seed weeks carry no `sa:'sc'` block (data.ts / week2.ts), so parity.test's event comparison is not affected.

D2074 — "Wrong seat" anywhere a person can see it: none left in src. All twelve QUAL lines (validate.ts:1161-1163, 1337, 1343, 1347, 1495-1497, 1561-1563) read "Illegal seat:"; WCODE.QUAL is "Illegal seat" (Insights' by-type counts, the issues list grouping, the Logic page's check name via lgChkName). The only remaining "Wrong seat" strings are in docs/mock/2026-11-15-warn-words/* (old proposal pages) and scripts/handpass/www/* (old walk scripts) — not the app. The crew picker's own refusal reasons (avail.ts:416-422 "WSO — cannot fly front seat" …) never said "Wrong seat" and are a different surface. The one open problem on this surface is F1 (the chip label, not the check).

D2077 — "clash" on the Logic page: none left in lgSettings()/lgChecks() (the new test walks every string and every function's result, including `how` and `value`); LogicPage.tsx has "clash" only in comments; KIND_LABEL (the six switches' labels), RULE_SPEC titles, LG_TIER and wavetpl.ts kindNote carry no "clash". Renaming the setting "SC MAIN clashes" → "SC MAIN conflicts" breaks nothing: it is used only as a display name, aria-label and data-lgname; no CSS, e2e spec or code selects on the old name (searched src and e2e). Elsewhere "clash" survives only in the Leave War's "N clashes with the schedule" strip (leavewar/ui/Chrome.tsx:675) — outside D2077's scope (the Logic page) and not named by any ruling; noted, not a finding.

D2075/D2078 — the Legend:
- One builder for both homes: ui/html.ts legendHTML, used by Shell.tsx:579 (View-only Sched, #vLegend) and :661 (Edit Schedule, #eLegend); same `.legend` CSS (02-shell.css:363-381), no rule that targets either id, so both homes change together and wrap the same way.
- The six words match D2075 exactly; letters, colours and order unchanged; "qual / illegal seat" kept.
- The reference-side swaps in refwin.ts:319-323 each match exactly one string in reference/scheduler.html (lines 2605-2609), so the count-checked swap will not throw; the html.test excisions (noRunKey, noBriefKey) were moved to the new words on both sides.

=====================================================================
WHAT THE HOST SHOULD RUN
=====================================================================

Unit tests (red first where marked):
1. (red today) F1's test: a pilot not SC DAY current on SC AM MAIN 07:00-13:00 → WARN.chip[di][id]==='Q', his warnings SC_QUAL only, and ui/html.ts puck(...) title must not contain "Illegal seat". Same with a not-DAAR-current front seater on a day-wave line with "AAR" in the remarks (AAR_QUAL).
2. engine/validate.test.ts 'a one-check chip carries the warning list's short name' — after F1's edit, with Q removed from the map.
3. The existing suites touched by this change: assumedlanding.test.ts, warnwords.test.ts, validate.test.ts, scspare-rules.test.ts, sansavail.test.ts, html.test.ts (both parity blocks — they exercise the refwin swaps), logic.test.tsx, drag.test.tsx, parity.test.ts.
4. A D2073 week-edge test (not in the patch): Sunday SC-template desk START 20:00, END blank; next Monday an in-time 07:00 (seed next week through the stash/bundle as crossweek.test.ts does) → no "Breaks Monday" trace on Sunday and no Monday CREW_REST; type END 23:00 → the trace appears.
5. A D2073 picker test: Friday SC-template desk 20:00, END blank, man M; ask crossDayIfPlaced(M, '<Sat SC AM MAIN seat key>') → '' (no crew-rest refusal); restClear(SAT, M) → null.

In the app (desktop and his iPhone width, Edit Schedule):
6. F1: Saturday, put a pilot without SC DAY on SC AM MAIN. Hover his puck: today it reads "Illegal seat"; the Legend's Q row reads "qual / illegal seat"; the warning list reads "Not SC DAY current: …". Picture the three side by side.
7. D2073: Friday, + Block → SC Shift, put Bane on SXO PM, START 20:00, clear END; Saturday give Bane a 07:00 in-time. Expect no crew-rest warning on Saturday, no dotted mark on Friday, and Saturday's SC AM seat picker NOT striking him for crew rest. Then type END 23:00: the warning, the Friday trace and the picker strike all appear. Repeat with + Block → Standard (plain desk): the warning shows with END blank ("ended 21:00").
8. D2073 survives: after step 7's blank-END state, (a) rename the block, (b) save the day as a day template and apply it to Thursday, (c) publish Friday and use the 👁 look, (d) Undo then Redo, (e) reload the page — Saturday must stay clear each time.
9. Legend: open the Legend fold on View-only Sched as well as Edit Schedule, at the phone width the drawing check used and at desktop; count its rows against the approved picture — the drawing check covered Edit Schedule's fold, and View-only Sched's is the second home of the same markup.
10. F3 (only if he wants it answered): AVALON wave flying (an R typed), its desk START 20:00 END blank on Friday, same man 07:00 Saturday → today a crew-rest warning "ended 21:00".
