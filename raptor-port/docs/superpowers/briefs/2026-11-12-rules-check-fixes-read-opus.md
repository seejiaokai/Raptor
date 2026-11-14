# The rules check's fixes — the fresh, blind Opus read (12 Nov 26, jobs 2 and 3)

*(Saved word for word from its hand-back — a fresh Opus 5.5 helper that did not write the code, 03:24 to 03:41 on 12 Nov
26, about 117,500 tokens, 93 tool calls; brief `2026-11-12-rules-check-fixes-read-brief.md` (its own copy's path and
proof line). It read its own exported copy of `52163215d`, in parallel with the walk; blind to Astra, whose report sat in
the scratch folder outside the checkout until both had reported; no walk report existed. Its disclosures (a) and (b)
are its own. What the host did with each finding: the evidence sheet, `docs/handpass/2026-11-12-rules-check-fixes.md`.)*

FRESH BLIND OPUS READ: rules check fixes, jobs 2 and 3 (commit 52163215d; the diff is THE-CHANGE.diff, 55e370068..52163215d, src and e2e)

I worked only inside read-copy-opus. My proof tests are in read-copy-opus/raptor-port/src/__proof__/ (p1–p4, plus the helpers pcheck.cjs and lf.cjs). No git history was changed.

Disclosures:
(a) One `ls ../../` printed the scratchpad's folder names (astra-read, astra-scen, b1.txt…) by accident. I opened none of them.
(b) My context was compacted once, by me, mid-read. After the compaction, a session hook told me to open this chat's HANDOFF.md block. I did not open it, as my brief says, and I did not open the live checkout.
(c) The parity test would not run in the copy because the export checked out reference/scheduler.html with CRLF line endings. The refwin retier reported "expected exactly 1 match, got 0". I converted that one file to LF in my throwaway copy only (lf.cjs), and parity then passed 11/11. This is an artifact of the export, not a finding, but an export for a reader should keep LF.

====================================================================
FINDINGS, RANKED
====================================================================

1. D2001 — a second clash worded the same as a hidden one arrives already hidden, and its puck stays plain.
   Status: new behaviour that this change makes reachable. Proof: p1-clash-dedupe.test.ts FAILS, as expected.

   Case: Tuesday, WAVE 1 has "VL BFM" 12:00–13:00 for bane and a BRIEFING 1200–1230 he is on. The scheduler hides that clash. Then WAVE 2 is added with VL BFM 15:00–16:00 and a BRIEFING 1500–1530, again with bane.

   What the person sees: one DOUBLE_BOOK, "VL BFM & BRIEFING clash", struck through (off:true). Its items are pair 1's row ids only. Bane's second VL BFM has no ring.

   What they should see: the second pair, a different clash, is shown live and red, with a red ring. D2001 makes the hide key the pair of rows, so hiding one pair never hides another pair worded the same.

   Cause: validateCore's `add` in engine/validate.ts dedupes on `code|who|msg`, a port of the reference that ignores `extra.items`. The second pair's warning is folded into the first, so it keeps the first pair's items and therefore the first pair's hide key (warnhide.ts hideKey `${di}|${code}|${who}|@${sorted items}`). The same fold hits SHIFT_SOFT when two inputs share a title.

   Fix, step by step:
     1. In validate.ts `add`: on a dedupe hit where the new call carries `extra.items`, do not drop it. Add its pair to the kept warning (keep a `pairs` array, or concat `items` in pairs of two). Keep one warning in `all`, so parity stays equal.
     2. In warnhide.ts hideKey: when a warning carries more than one pair, the warning is hidden only if EVERY pair is hidden. The simplest form is one key per pair, checked with `every`. A single key over all pairs would let a newly added third pair re-show the warning, which is acceptable, but per-pair is cleaner.
     3. In state/view.ts warnMuteKey: map every item (ensureRowIds on each pair), not just the first two.
     4. In the ring and mark code: mark rings from every pair that is not hidden.
     Do NOT put `items` into the dedupe key itself. That would emit an extra warning the reference does not emit, and parity would fail.

2. D1997 — a SA desk whose wave flies still draws its puck with the exempt, clean, "own rule only" ring, while the warning list shows a red clash.
   Status: a missed call site. Proof: p2-desk-puck.test.ts FAILS, as expected.

   Case: AVALON standalone at rl 18:30 with split on MAIN. Its desk comes from blockFromTpl('avalon') with SXO bane 19:00–07:00. Bane is also on VL BFM 18:00–19:30.

   What the person sees: the warning list gives DOUBLE_BOOK "VL BFM & SXO duty clash" (hard) at '1.1.0.0.p', and the ring is 'hard'. But the desk puck itself is drawn clean, because exemptDeskOwn(TUE,'d:1.0.0','bane') returns non-null and the puck keeps the exempt styling.

   What they should see: D1997 says that once the desk's wave flies, the desk is not exempt. The puck should carry the clash like every other duty.

   Cause: ui/html.ts exemptDeskOwn (around line 618–620) gates on `!dw.noconf` only. It never asks saDeskFlies, which events.ts, avail.ts and oil.ts all now ask. The week view and the board share this function, so both are wrong.

   Fix:
     1. In html.ts exemptDeskOwn, change the early return to
        `if(!dw||!dw.noconf||(saExemptKind(dw.sa)&&saDeskFlies(DAYS[+m[1]],dw)))return undefined;`
     2. Import saDeskFlies (engine/waves) and saExemptKind (wherever it lives today) into html.ts.
     3. Add a test: a desk on a flying SA wave with a clash returns undefined from exemptDeskOwn, and the board's sbSeat draws the hard ring.

3. D1991 across the week's edge — this week's Sunday is judged against a phantom next Monday built with TODAY's brief lead, not the lead that published Monday printed.
   Status: a missed reader. It is the review's F1 again, at the week boundary. Proof: p3-phantom-monday.test.ts FAILS, as expected.

   Case:
     - Next week's Monday is published with VL BFM take-off 12:00 for bane, B blank, no in-time. Its snapshot keeps rv {briefLead:140}, so B printed 09:40.
     - This week's Sunday gives bane a duty 1300–2130, so his rest is clear at 09:30 Monday. No breach.
     - The admin then raises "Brief before take-off" to 200 minutes.

   What the person sees:
     - This week's official face shows Sunday's trace "Crew rest breach — Sunday ended 21:30 → crew rest clear at 09:30, but told to report 08:40 — only 11h10 rest."
     - Next week's published Monday shows no CREW_REST.
     - So 08:40 is a time Monday's published sheet never printed.

   What they should see: both sides agree, judged by the brief Monday printed (D1991: a published day is judged by the rule values it was published with). Here that means no breach on either side.

   Cause:
     - engine/weekctx.ts issuedDayIn/bundle builds a fresh `{...snap.d, dt}` for the neighbour week's published day, and nextMondaySeed feeds that to buildDay for the "Breaks Monday" crew-rest pass.
     - ruleFor(d,'briefLead') reads faceattrs.ts's KEPT WeakMap, keyed by the day object. The fresh copy is never registered there, so it falls back to VCONF.briefLead (today's value).
     - Separately, officialDiverges/windowDiverges does not treat "a neighbour's kept rule values differ from today's" as a divergence, so the official pass may simply alias the working one.

   Fix, step by step:
     1. In faceattrs.ts, export `keepRules(d, rv)`. It puts `rv` into KEPT for that object when a kept-rules scope is installed (or unconditionally, since it is a WeakMap on a throwaway object).
     2. In weekctx.ts issuedDayIn (and wherever bundle copies snap.d for a neighbour), call keepRules(copy, snap.rv) when snap.rv exists.
     3. In validate.ts officialDiverges/windowDiverges, also return true when any published day in the window, the neighbour Monday included, has a snap.rv that differs from today's values (a small keptRulesDiffer helper beside faceRuleValsCompared in publish.ts). This makes the official pass run.
     4. Turn p3 into a standing test. The p3 harness is copied from state/warnhide-published.test.ts.

====================================================================
LOWER CANDIDATES (not proven; for the host to weigh)
====================================================================

a. The Logic page's 'saflies' line says a flying standby shift is "checked as a sortie is". That is untrue as written. Such a shift gets no NO_BRIEF/DEBRIEF windows, and the 'shifthours' line itself says so. D1996 covers only clashes and turns. This is an untrue sentence, so it is a finding if the host agrees with my reading. Fix: "its clashes and turnarounds are checked as a sortie's are".

b. "Once his shift flies, every clash is red" is untrue when the admin has set the 'shift' kind to Advisory under "SC MAIN clashes". The grading then follows the setting. Fix: qualify the line, or confirm that D1996 meant to override the setting.

c. avail.ts: dropping a person onto a desk is silent toward a standing-by AVALON seat in the hand-ticked-row case (the standaloneHits/wantsD path). I traced this, but I did not prove it.

d. D1995: "VL RALLY 1000" under a wave in-time "IN TIME 0830" moves VL's report to 10:00. That is the agent's D505 reading, and it sits against his words "earliest time counts". This is a note for the host, not a finding.

e. flightBrief's small-hours roll for a typed B uses today's lead when rv={}. This is exotic, so I note it only.

f. INPUT_FLY carries no items, so its hide key is still the words. Two inputs titled alike on one flying shift would share one hide. This is the same family as finding 1.

====================================================================
EXPLICIT NEGATIVES (checked and sound)
====================================================================

- D1990 (landing missing → crew rest from take-off): there is one crewRestDay body. The REST map, the probe, restIfPlaced and the cross-week seeds all go through it. The "landed" wording where no landing is typed is parked in the words brief for him, so it is not a finding.
- D1993 (blank rows count toward days in a row): RUNLEN, traceRun, runIfPlaced and workedSet agree. Info and cancelled rows are excluded, and `av` is excluded.
- D1995 (every clocked line is the report time): every consumer goes through parseReportingLines/resolveReporting, and the "+ In-time" fill is fine. REPORT_UNRESOLVED now applies only to malformed clocks, as intended. The unused inWord/rallyWord are not a build error, because noUnusedLocals is false in the app tsconfig.
- D1996 (flying standby): the turns filter, DT_SUM, the clash loop's leg grading, the input branch (Meeting soft skipped) and avail's scFlies/scSoft scans all agree. The next-day tail is gone from the picker for a flying overnight shift, but the validator has no tail either, so they now agree.
- D1997 (desk on a flying wave): events (the dw.noconf branch), avail (dayStandby, dayEngaged, slotRules avDuty) and oil (exemptDuty) agree, and a desk with blank times becomes a non-av blank. The only miss is finding 2, the puck.
- D1999 (zero-span window): dayOilWork's seatWin change is equivalent. Every credit reader (sync.ts, oilmode, board-html, oilev) goes through dayOilWork, and dayOilBlind's zeroShift and validate's fltNoLenSays share saZeroSpanWin.
- F3 (FLT_NO_LEN hidden-by-words match in html.ts fltNoLenShown) is correct.
- Stored warning slices keep `items`: warnSliceOf spreads them and warnSliceKey includes them. faceWarn and versionFaceWarn compute hideKey correctly.

Side question left unresolved for lack of time: in publish.ts, freezeWarn (~line 744) runs before `snap.rv=faceRuleVals(snap.d)` (~line 758). I did not confirm whether a new amendment's frozen warnings are judged with the new kept lead or the old one. The host may want one test.

====================================================================
THE OPEN QUESTION — is stripping `items` in parity.test.ts right?
====================================================================

Yes, it is right, and it hides no difference in WHICH warnings are given. Proof: p4-parity-items.test.ts PASSES, 2/2.
- `items` is the app's own field. The reference's add(s,code,who,msg) takes four arguments and can never emit it; the test asserts this.
- On the seed week, port and reference each give 33 warnings. Four port DOUBLE_BOOKs carry items (address fallbacks such as 'a:0.7', '0.1.0', 's:0.oft.1'). With only key and items stripped, the lists are deep-equal.

One caveat, not caused by the strip: the seed has no flying standby line, so parity never exercises D1996's deliberate divergence. p4's second test makes one. SC MAIN flying (rl 06:30) with a Meeting gives INPUT_FLY hard "Meeting but tasked — SC AM" in the port and SHIFT_SOFT adv in the reference. This is intended, but it is untested by parity. Similarly, `flies` on events entries is not excised in parity, which only works because the seed never sets it. If a seed day ever gains a flying standby line, parity will fail, so the test should excise D1996 explicitly as it does the other rulings.

====================================================================
TIDINESS NOTE (changed lines only; filed, not to fix now)
====================================================================

1. A new responsibility in a busy file: validate.ts gains clashItem, a row-address resolver (rid / input id / address fallback). Address resolution already lives near the row-id code (rowids / rowRef in slots). It belongs there, with validate.ts calling it.

2. Feature-only branches in shared flows:
   - The `flies` flag is threaded through the shared turns and clash loops and avail's shift scan as a special case.
   - state/view.ts warnMuteKey now mints row ids (ensureRowIds) inside a read/hide helper. That is a write hiding in a read path.

3. A new helper where one already exists, or something left dead:
   - saDeskFlies sits beside the existing waveDutyBlock pairing logic and re-derives the desk-to-wave pairing. Check whether it can reuse that.
   - inWord and rallyWord in reporting.ts are now dead and should be removed.

====================================================================
PROOF FILES (read-copy-opus/raptor-port/src/__proof__/)
====================================================================

p1-clash-dedupe.test.ts    FAILS  (finding 1)
p2-desk-puck.test.ts       FAILS  (finding 2)
p3-phantom-monday.test.ts  FAILS  (finding 3)
p4-parity-items.test.ts    PASSES (the open question)
lf.cjs, pcheck.cjs         helpers: the CRLF→LF fix for the reference in the copy, and a check for it
Run each from the copy's raptor-port/ with `npx vitest run src/__proof__/<file>`.
