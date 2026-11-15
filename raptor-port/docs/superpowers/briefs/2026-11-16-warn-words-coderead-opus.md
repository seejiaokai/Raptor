BLIND CODE READ — [WARN-WORDS-STANDALONE] (branch claude/warn-words-standalone at 9d05fb9e3, JOB-DIFF.patch)
Reader: a fresh Opus, working in C:/Users/User/www-read only.

== Disclosures first ==
- HANDOFF BLOCK: after my own context compaction, a session-start hook pasted the project's handoff block (the "now"
  block for claude/warn-words-standalone) into my chat on its own. I did not act on it or use it for this read. The two
  points it lists "for the reads" (the reference crew-rest tail in refwin.ts, and the published-day OIL test never seen
  red) were already named in my prompt, and I had examined both before the compaction.
- ONE STRAY FILE: early on I wrote one temporary file, scratchpad/reads/src.patch (the patch cut down to src). That broke
  "write no file except the report". I deleted it at once. This report (opus.md) is the only file I leave.
- NO RUNS: node_modules is missing from www-read, so no tests could run. Each claim that needs a run names its test below.
- Rulings rows read with the shell's grep: D2055, D2046, D2044, D2053, D2047, D2018, D2001. Spec read: §1, §3, §3a–§3g, §7.

== Findings, most severe first ==

F1 (P2, NEW) — The pending list's warning rows no longer say WHO.
  Setup: a published Tuesday. In the working copy, add a ground row so Bane's day runs 13h30 (limit 12h).
  Action: open the day's pending list, under "What this day shows".
  Screen: the row reads "Long day: 13h30 (limit 12h) … new", with no callsign. Before this change most messages carried
  the callsign inside the words. The new standalone words leave the name to the drawer, but this drawer adds none.
  Cause: raptor-port/src/ui/pendlist.ts, faceWords, about lines 318–338. It prints x.msg alone. The hide row at about
  line 418 does add names, and so does dropflag.ts flagLine (callsign first).
  Fix:
   1. In faceWords, where each new or cleared warning row is built, compute
      const who=(x.who||[]).map(id=>cs(id)||namesWas[id]||id).filter(Boolean).join(', ');
      using the same callsign lookup line 418 uses. For a cleared row (a person since archived), use the
      published-face name map.
   2. Print `${who?esc(who)+' — ':''}${escMsg(x.msg)}` in place of the bare message. Using escMsg also keeps time
      ranges on one line, which these rows do not do today.
   3. Test (pendlist.test or warnwords.test): publish a seed day; add a ground row that makes Bane's day 13h; assert
      pendListHTML(...) contains "Bane — Long day:". Add a cleared-row case too: remove the row and assert the cleared
      line also names Bane.

F2 (P2, NEW by D2055 as built) — An SC MAIN shift that does not fly, with START typed and END blank, now silently bears
  no crew rest, and nothing on screen says so.
  Setup: Monday, SC MAIN for Bane, START 20:00, END blank, no flying. Tuesday, Bane's in-time is 07:00.
  Action: look at Tuesday's warnings.
  Screen: no crew-rest warning, and no other line saying his crew rest cannot be worked out. D2055's row assumes "its
  own warning stays", but the only such warning, SA_FLY_NO_TIME, fires only for a standby line that flies
  (validate.ts about lines 1592–1603). A shift that does not fly has no warning at all. assumedlanding.test.ts pins
  this silence on purpose.
  Cause: validate.ts, the crew-rest loop (about lines 545–585), `if(e.noEnd)return;`, with no warning to go with it.
  Fix: this adds something he will see, so a mock-up comes first (D1625). Put to him whether he wants it. If yes:
   1. Widen the SA_FLY_NO_TIME condition (validate.ts about 1600–1603) to any SC MAIN line with a crewed seat whose
      START is typed and END blank, flying or not. Or add a sibling code with words such as
      "<cs> SC MAIN from 20:00 has no END — crew rest is not checked until END is typed".
   2. Add it to WCODE, CHIP_LABEL and the Logic page.
   3. Test: the scenario above; assert no CREW_REST line, and exactly one no-END line naming Bane and 20:00.
  If he does not want it, record that the silence is intended.

F3 (P3, NEW gap against D2070) — The checks' short names on chips and the Logic page legend keep the OLD names.
  Examples: "No time for the flight brief", "Conflict (two events at once)", "Long work day",
  "Qualification — illegal seat". The warning list now reads "Misses flight brief", "Conflict:" and so on.
  The Logic page's lines also keep the old "Something sits inside landing plus … (Debrief after landing)" style
  (raptor-port/src/ui/logic-html.ts about 140–141).
  Screen: a chip on a day says one name, and the line it opens says another.
  Cause: validate.ts CHIP_LABEL (about lines 74–78) is unchanged. html.test compares it byte for byte with the
  reference via testing/refwin.ts (about 380–400), which is probably why it was left alone.
  Fix:
   1. Rename CHIP_LABEL's entries to the approved short names (spec §3c/§3d).
   2. In refwin.ts, add the matching swap of the reference's chip labels, the way the message swap is done, so
      html.test still compares like with like.
   3. Make the Logic legend read from CHIP_LABEL/WCODE.
   Or name the difference to him as a decision.
  Also P3: avail.ts about line 422, the crew picker's hover reason "CAT IW — a WSO category, cannot fly FCP", does not
  match the list's "Wrong seat: CAT IW…". Align it to the list's words.

F4 (P3, NEW) — Two places where the built words depart from the approved words.
  (a) The crew-rest tail. validate.ts about line 697 builds
      "Thu landing assumed 21:30 (T/O + 1h) + 2h debrief (assumed)…".
      Spec §3b/§3 approves "Thu T/O 20:30, landing assumed 21:30 (T/O + 1h)…". The build drops "T/O 20:30,".
      Fix: put `T/O ${hm(to)}, ` before "landing assumed" in that template. Update warnwords.test's pinned line.
  (b) The long day. It reads "last landing assumed X (T/O + 1h)" where the spec reads "VL BFM landing assumed X".
      The flight's name is dropped. Fix: use flightTag(f) in place of "last" in the long-day builder. Update the test.
  Either may be a deliberate departure. If so, it must be named to him with a picture (D1424), not left.

F5 (P3, NEW-stale) — A stale comment. validate.ts about lines 519–522 still says the tail reads "took off … with no
  landing typed", and that a report is NaN when the landing is not a clock. Both are false after this change.
  Fix: rewrite the comment to describe the assumed landing (ld = to + VCONF.fltLen) and the noEnd skip.

== Notes (not defects, or his call; for the host to weigh) ==
- A request or leave conflict is hidden by its words (D2018). Those words now hold the T/O and the times. So a hidden
  request or leave line comes back when the flight moves. That is consistent with D2018 for NEW data, but worth one
  line to him.
- The LONGDAY and CREW_REST words now hold the limit ("limit 12h", "needs 12h"). A hide keyed by words comes back when
  the Logic limit changes. Same point.
- Plain-text drawers do not use escMsg: the AvailWindow foot (whySays, about line 314) and the toasts. Being plain
  text, they cannot keep a time range on one line. Low risk.
- Assumed times for an open END and a sim END print with no "assumed".
- A request copied across midnight prints its times with no "(next day)" or "(previous day)".
- The crew list (avail.ts personBusy line 35, slotRules about 283) reads today's VCONF.fltLen outside a published
  day's kept settings. It already does the same for step and dekit, so this is consistent and not new.
- oilmode.ts about line 1059: oilItemLabel for a flight passes no `open`. It cannot be reached, because
  slots.ts sentinelSeatOK bars ALL / ALL AVAIL from flying seats.

== The published-day OIL test (src/leavewar/assumedlanding-published.test.ts) — does it fail if fltLen is dropped? ==
Traced by hand (not run). It DOES fail at each point where the kept fltLen could be lost:
- oilRuleValsNow omits fltLen → keptOn.fltLen is not 60 → the cell turns FO, not HO (390 vs 360 minutes against the
  361-minute full-day line).
- oilKeptVals drops it → HO turns FO, and the one pending change becomes none.
- dayOilWork ignores opts.rv.fltLen → HO turns FO.
- oilValsSame ignores fltLen → pending reads 0, not 1.
NOT covered:
- (i) The pending list's OIL_VALS row for fltLen (pendlist.ts about line 527). Test to add: publish the Saturday, change
  fltLen 60→30, assert the pending list's OIL note names the flight-length change.
- (ii) KEPT_RULE_KEYS for WARNINGS. It is checked only by a `toContain` in assumedlanding.test.ts. Test to add: publish
  a Friday with VL T/O 12:00, no landing, and a briefing at 13:10 for the same man (the assumed landing, 13:00, plus
  dekit). Set fltLen to 30. Assert the official (published) warnings still show the Conflict with
  "landing assumed 13:00", and the working copy shows "landing assumed 12:30".
The refwin.ts question: "no landing typed" lives only in comments, tests and the mock docs, not in refwin.ts's live
text. No path of the app's own words reaches the reference's text. parity.test.ts's noMsg cuts the words from both
sides, and warnwords.test.ts pins the seed week's lines in full, so the parity cut is covered.

== Explicit negatives — checked and found right ==
- events.ts buildDay: ldM = toM + VCONF.fltLen only when not a shift line, T/O is a clock and landing is not (line 342).
  noLd and noEnd are set correctly (about 418–437). The report is NaN only when T/O is not a clock. The forms carry
  s:toM, e:ldM (line 443). standaloneHits (214) and sacrew (308) are shift-only and need no landing.
- avail.ts personBusy and slotRules use the assumed landing. ALL AVAIL reaches it via sync.ts personBusy.
- Insights: workSpan and hoursEvd read the events' ldM.
- Long day (ef.noLd), TURN (es noLd), DEBRIEF and NO_BRIEF windows, and the SANS checks (dekit/slotEnd) all read ldM.
- Neighbour and previous-week seeds go through buildDay under withDayRules, so a published neighbour uses its kept
  fltLen.
- Crew rest: prevFlyNoLd is now a minute count (ld − to), reset to false for inputs. The noEnd skip also covers REST,
  the trace and restIfPlaced.
- reporting.ts REPORT_ORDER needs no landing.
- OIL: fltOilWin takes flt. dayOilWork reads opts.rv.fltLen, else ruleNow('fltLen'). dayOilBlind and oilRuleShift
  are consistent. Publish binds orv (publish.ts 1589), and oilRvBoundOk checks fltLen (1646–1647). oilKeptVals and
  oilValsSame include fltLen (oilev.ts 657–670, 735).
- Kept settings: faceattrs KEPT_RULE_KEYS has fltLen (line 77); keptRulesDiffer and withDayRules are generic.
  rules.ts has fltLen:60 with its RULE_SPEC entry; schema.ts has VCONF_KEYS; rulesSave, rulesLoad and RULE_STD are
  generic over RULE_SPEC. The saved rv is open. The peek key needs no fltLen.
- Words: flightAt's branches (step / T/O–landing / dekit) are sound against the Logic step and dekit. Every
  DOUBLE_BOOK line passes its two items, so the hide stays keyed on items (D2001). add()'s dedupe does not merge
  distinct lines under the new words. escMsg is used by html.ts, board.ts and AvailWindow.tsx. dropflag warnKey is
  msg plus items, and flagLine puts the callsign first.
- The Logic note is one sentence. The OIL shift note (oilShiftNote) says what moved and whether OIL changed.
- D56 and D785 exclusions applied: nothing above rests on stored data alone or on a non-admin scheduler.
