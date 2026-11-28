# The rulings audit — Step A: the lists (inventory)

Built 24 Nov 26 by a mechanical script, from `main`'s app as this branch holds it. **Nothing here is judged or settled** — lists only; the sort of readings (§4) only orders the work. Plan: `raptor-port/docs/superpowers/plans/2026-11-24-rulings-audit-plan.md` §2 Step A. The owner approved the core only (D2610); the *Slice* column marks which of the plan's 13 slices (§2 Step C) an item most likely falls to — a keyword guess, first number the best guess, the slice helper decides.

| List | Count |
|---|---|
| 1. Comments and test lines holding a builder's reading (C) | 275 items (206 in test files) — engine lines dropped as ported text: 4 |
| 2a. Strings a person can read, from the screen and state files (W) | 3150 |
| 2b. The notification register's rows (G-R) | 31 |
| 3a. Drawings dated 4 Nov 26 on (G-D) | 45 |
| 3b. Ruled-not-built lines (G-N) | 132 (+ 11 register rows in 2b under "Ruled, not built" / "Proposed") |
| 3c. Specs / plans whose backlog item is still open (G-S) | 119 |
| 4. Readings in the full rows, sorted (R) | 1108 readings in 1012 of 1691 rows: the row says not told 42; silent 599; the row says told 457; mixed (both words in one clause) 10 |

How list 1 was built: every line under `raptor-port/src` matching one of the plan's phrases ("his to change", "agent's / builder's / our reading", "reading of", "not (yet) ruled", "until he rules", "his call", "assumed", "for now", "TBC", "provisional"). Non-test files: comment lines only. Test files: any line (the reading may be an expected result — lesson 32). Matching lines within two lines of each other are one item; context is the line either side. `src/engine`: only lines with a strong phrase or a D-number are kept (the port's own "assumed" text is left out; that heuristic is the script's, not a check of who wrote the line). "reading of" and "assumed" match many ordinary uses — the slice helper discards those.

How list 2 was built: attribute text (title, aria-label, placeholder, label, alt, hint), JSX text, bare text lines in screen files, and string literals of three or more words that start like a sentence — in `src/ui`, `src/state`, `src/tracker`, `src/leavewar` screens; test files left out; identical text in one file counted once. It is a net, not a proof: it will include some code strings and may miss strings built by pieces. The refusal-reason tables are in `src/state` files.

## List 1 — comments and test lines holding a reading (C)

| Id | File | Line | Area | Test | Phrase matched | Context (line ± 1) | Slice |
|---|---|---|---|---|---|---|---|
| C0001 | raptor-port/src/engine/assumedlanding.test.ts | 1 | engine | test | ASSUMED | /* A FLIGHT WITH NO LANDING TYPED IS ASSUMED TO LAND A SET FLIGHT LENGTH AFTER TAKE-OFF ([WARN-WORDS-STANDALONE] piece B — ⏎ owner D2046, D2047, D2053, 15 Nov 26). "Where a flight has no landing typed (blank or "TBD"), the app assumes it lands a | 13,4 |
| C0002 | raptor-port/src/engine/assumedlanding.test.ts | 4-6 | engine | test | assumed | set flight length after take-off — a Logic setting — and says so … every check that reads the landing uses that ⏎ assumed time"; the setting starts at 60 minutes (D2047); such a flight counts in Insights' hours and the long-day note ⏎ up to its assumed landing (D2053). Changes D1990 (the day ends at the assumed landing plus the debrief), D2010 (the ⏎ crew-rest words name the assumed landing) and D2022. ⏎ | 10,13,4 |
| C0003 | raptor-port/src/engine/assumedlanding.test.ts | 9 | engine | test | assumed | Ranger's Friday, as he was shown it (D2046's own case): VL BFM took off 12:00 with no landing typed, RU took off 13:00 ⏎ — today the tight turn read 60 min and the debrief 12:00–14:00; with the assumed landing VL lands 13:00, the turn reads ⏎ 0 min and the debrief 13:00–15:00. Each reader of the landing is staged here through the engine's own doors (validate, | 13,4 |
| C0004 | raptor-port/src/engine/assumedlanding.test.ts | 60 | engine | test | assumed | ⏎ describe('Ranger\'s Friday — the tight turn and the debrief read the assumed landing (D2046)', () => { ⏎ const friday = (ld: string) => add(FRI, wave([form({ cs: 'VL', to: '12:00', ld }), form({ cs: 'RU', to: '13:00', ld: '14:00' })])) | 13,4 |
| C0005 | raptor-port/src/engine/assumedlanding.test.ts | 65 | engine | test | assumed | friday(ld) ⏎ expect(msgs(FRI, 'TURN')).toEqual(['Tight turn: VL BFM → RU BFM, 0 min (needs 90). VL BFM landing assumed 13:00 (T/O + 1h), RU BFM T/O 13:00']) ⏎ }) | 13,4 |
| C0006 | raptor-port/src/engine/assumedlanding.test.ts | 68 | engine | test | assumed | } ⏎ it('the debrief window runs from the assumed landing, 13:00–15:00', () => { ⏎ add(FRI, wave([form({ cs: 'VL', to: '12:00', ld: '' })])) | 13,4 |
| C0007 | raptor-port/src/engine/assumedlanding.test.ts | 71 | engine | test | assumed | ground(FRI, 'bane', '13:10', '13:30') ⏎ expect(msgs(FRI, 'DEBRIEF')).toEqual(['Misses VL BFM debrief 13:00–15:00 (landing assumed): BRIEFING 13:10–13:30']) ⏎ }) | 13 |
| C0008 | raptor-port/src/engine/assumedlanding.test.ts | 76 | engine | test | assumed | friday('') ⏎ expect(msgs(FRI, 'TURN')).toEqual(['Tight turn: VL BFM → RU BFM, 30 min (needs 90). VL BFM landing assumed 12:30 (T/O + 30 min), RU BFM T/O 13:00']) ⏎ }) | 13,4 |
| C0009 | raptor-port/src/engine/assumedlanding.test.ts | 83 | engine | test | ASSUMED | }) ⏎ it('a man busy from the step to the dekit after the ASSUMED landing (D2059): a briefing at 13:10 is a conflict', () => { ⏎ add(FRI, wave([form({ cs: 'VL', to: '12:00', ld: '' })])) | 13,4 |
| C0010 | raptor-port/src/engine/assumedlanding.test.ts | 86 | engine | test | assumed | ground(FRI, 'bane', '13:10', '13:20') ⏎ expect(msgs(FRI, 'DOUBLE_BOOK')).toEqual(['Conflict: VL BFM (landing assumed 13:00, dekit to 13:30) & BRIEFING 13:10–13:20']) ⏎ }) | 13 |
| C0011 | raptor-port/src/engine/assumedlanding.test.ts | 90 | engine | test | assumed | ⏎ describe('crew rest — the day ends at the assumed landing plus the debrief (D1990, D2010 as D2046 changes them)', () => { ⏎ for (const ld of ['', 'TBD']) { | 13,4 |
| C0012 | raptor-port/src/engine/assumedlanding.test.ts | 97 | engine | test | assumed | expect(m.length).toBe(1) ⏎ expect(m[0]).toContain('Crew rest: Monday T/O 12:00, landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00. ') ⏎ }) | 13,4 |
| C0013 | raptor-port/src/engine/assumedlanding.test.ts | 110-112 | engine | test | assumed | expect(m.length, 'clear 12:00 — the 11:00 brief breaks it').toBe(1) ⏎ expect(m[0]).toContain('Monday T/O 20:00, landing assumed 22:00 (T/O + 2h) + 2h debrief (assumed) → ended 00:00') ⏎ }) ⏎ it('at 03:00 exactly the rest is legal (the edge moves with the assumed landing)', () => { ⏎ add(MON, wave([form({ to: '12:00', ld: '' })])) | 13,4 |
| C0014 | raptor-port/src/engine/assumedlanding.test.ts | 119-121 | engine | test | assumed | ⏎ describe('the long day and Insights\' hours count to the assumed landing (D2053, over D1936)', () => { ⏎ for (const ld of ['', 'TBD']) { ⏎ it(`landing "${ld}": the span runs to the assumed landing plus the debrief, and the note says the landing was assumed`, () => { ⏎ ground(TUE, 'bane', '06:00', '07:00') | 10,13,4 |
| C0015 | raptor-port/src/engine/assumedlanding.test.ts | 128 | engine | test | assumed | expect(m.length).toBe(1) ⏎ expect(m[0]).toMatch(/^Long day: 15h(00)? \(limit 12h\), 06:00 → 21:00 \(VL BFM landing assumed 19:00 \+ 2h debrief assumed\)$/) // the approved words, spec §3 (D2053) ⏎ }) | 13,4 |
| C0016 | raptor-port/src/engine/assumedlanding.test.ts | 131 | engine | test | assumed | } ⏎ /* the re-walk (W3, 16 Nov 26): a line with no callsign typed read "( LATE FLT landing assumed …)" — the name trimmed */ ⏎ it('a line with no callsign typed: the flight is named by its mission, no stray space', () => { | 13 |
| C0017 | raptor-port/src/engine/assumedlanding.test.ts | 136 | engine | test | assumed | validate() ⏎ expect(msgs(TUE, 'LONGDAY')[0]).toMatch(/ \(LATE FLT landing assumed 19:00 \+ 2h debrief assumed\)$/) ⏎ }) | 13,4 |
| C0018 | raptor-port/src/engine/assumedlanding.test.ts | 146 | engine | test | assumed | ⏎ describe('OIL — a weekend flight with no landing earns to its assumed landing (D2046 "every check"; the agent\'s reading)', () => { ⏎ it('Saturday: report 06:00 (default rally) to 10:00 + 2h debrief', () => { | 1,13,4 |
| C0019 | raptor-port/src/engine/assumedlanding.test.ts | 159 | engine | test | assumed | ⏎ describe('who is busy — the crew list and the ALL AVAIL crowd read the same assumed landing', () => { ⏎ it('personBusy: step 11:00 to dekit 13:30', () => { | 5,13,4 |
| C0020 | raptor-port/src/engine/assumedlanding.test.ts | 172-174 | engine | test | assumed; the agent's reading | END IS TYPED (owner D2055, 15 Nov 26 — "never 'ended' at its START; its own 'cannot be worked out' warning stays"). A ⏎ shift's END is never assumed (D2046 is a sortie's landing): with END blank the shift used to end at its START, so a ⏎ Monday SC from 20:00 "ended" 20:00 and cleared Tuesday 08:00 — a rest worked out from a time nobody typed. The same for a ⏎ shift that flies (the agent's reading). */ ⏎ describe('D2… | 13,4 |
| C0021 | raptor-port/src/engine/assumedlanding.test.ts | 202-203 | engine | test | The agent's reading; assumed | a Friday desk from 20:00 with no END "ended 21:00 → clear 09:00", START plus the Logic page's one-hour default for any ⏎ other row). The agent's reading, told to him: only a desk from an SC shift template, never every duty row with no END — ⏎ a plain desk keeps the assumed hour (the control below). */ ⏎ describe('D2073 — an SC-template duty desk with START and no END bears no crew rest until its END is typed', () =>… | 10,13,4 |
| C0022 | raptor-port/src/engine/assumedlanding.test.ts | 219 | engine | test | assumed | }) ⏎ it('a plain desk (no SC template) with END blank keeps the assumed hour: ended 21:00, Saturday 07:00 breaks it', () => { ⏎ desk(FRI, '20:00', ''); sat() | 13,4 |
| C0023 | raptor-port/src/engine/assumedlanding.test.ts | 226 | engine | test | assumed | same role and hours swallowed the plain one — and its "no END" with it: the breach the plain desk makes vanished, by ⏎ block order alone. Both orders must read alike: one commitment, ending at the plain desk's assumed 21:00. */ ⏎ it('an SC desk BEFORE a plain desk of the same role and hours: the plain desk still ends 21:00, Saturday 07:00 breaks it', () => { | 13,4 |
| C0024 | raptor-port/src/engine/audit-a-editlog.test.ts | 55 | engine | test | his call | setSlotVal(`d:0.0.${B + 1}`, 'bane') // logged: — → Bane at address B+1 ⏎ expect(elogVal(elogFor(`d:0.0.${B + 1}`)!, 'to')).toBe('Ranger') // the log keeps his id; readers say his callsign ⏎ | 13 |
| C0025 | raptor-port/src/engine/avail.ts | 36 | engine |  | ASSUMED | than the engine reserves him. */ ⏎ /* D2046 (15 Nov 26): a sortie with its take-off and no landing typed is busy to its ASSUMED landing (take-off ⏎ plus Logic's flight length), so the crew list agrees with the conflict list; a shift keeps START to END */ | 5,10,4 |
| C0026 | raptor-port/src/engine/avail.ts | 288 | engine |  | ASSUMED | if(f){ const st=parseHM(f.to); let en=parseHM(f.ld); ⏎ /* D2046: a sortie with no landing typed lands at its ASSUMED landing (take-off + Logic's flight length); a shift ⏎ with no END keeps its START */ | 5,10 |
| C0027 | raptor-port/src/engine/daystart-default-rally.test.ts | 97-100 | engine | test | assumed; ASSUMED | /* CHANGED ON PURPOSE by D2046 / D2053 (15 Nov 26 — "a flight with its take-off typed and no landing counts in Insights' ⏎ hours and the long-day note up to its assumed landing, no longer nothing"; over D1936): it now counts from its report ⏎ to its ASSUMED landing (take-off + Logic's flight length, 60 min) plus the debrief, as OIL does with the length ⏎ handed in; fltOilWin with no length handed in (the screen's wo… | 1,10,13,4 |
| C0028 | raptor-port/src/engine/daystart-default-rally.test.ts | 175 | engine | test | assumed | expect(n.msg).toContain('12h30') ⏎ expect(n.msg).toContain('05:00 → 17:30 (last landing 15:30 + 2h debrief assumed)') ⏎ expect(WARN.chip[4]?.salsa).toContain('LD') | 13,4 |
| C0029 | raptor-port/src/engine/daystart-default-rally.test.ts | 191 | engine | test | the agent's reading | at all — not its face, not its untouched working copy, nothing waits and the sign-offs stand — until its next ⏎ amendment; once the day is edited, its working copy reads today's (the agent's reading of D2005). Insights' hours ⏎ still move at once (D482, settled, which D2005 does not touch: hours are not checks). */ | 2,10,13,4 |
| C0030 | raptor-port/src/engine/drafts.test.ts | 712 | engine | test | his call | expect(SCHED.pending[rk(key)]).toBe(1) ⏎ setSlotVal(key, 'nact') // back to the same man — setSlotVal stores his callsign 'Warden' ⏎ reconcileIssuedMarks() | 13,4 |
| C0031 | raptor-port/src/engine/dutyrest.test.ts | 65 | engine | test | assumed | expect(cr.msg).toContain('ended 21:30') ⏎ expect(cr.msg).not.toContain('debrief assumed') ⏎ }) | 13,4 |
| C0032 | raptor-port/src/engine/dutyrest.test.ts | 114-116 | engine | test | assumed | expect(cr.sev).toBe('hard') ⏎ /* a ground event ends at its written end — nothing is assumed */ ⏎ expect(cr.msg).toContain('ended 22:00') ⏎ expect(cr.msg).not.toContain('debrief assumed') ⏎ /* and the palette agrees: 22:00 + 12h − 24h = 10:00 into Tuesday */ | 13,4 |
| C0033 | raptor-port/src/engine/dutyrest.test.ts | 136 | engine | test | assumed | expect(cr.msg).toContain('ended 21:30') ⏎ expect(cr.msg).not.toContain('debrief assumed') ⏎ }) | 13,4 |
| C0034 | raptor-port/src/engine/dutyrest.test.ts | 314 | engine | test | assumed | expect(cr.msg).toContain('ended 22:00') ⏎ expect(cr.msg, 'an input ends at its written end').not.toContain('debrief assumed') ⏎ /* and the palette agrees: 22:00 + 12h − 24h = 10:00 into Tuesday */ | 5,13,4 |
| C0035 | raptor-port/src/engine/eventkind.test.ts | 8 | engine | test | assumed | So Event is one more row of the ONE table (engine/inputs.ts INPUT_META) with the flags Training, Appointment and Duty ⏎ carry, and everything else follows from the table. Each derived rule is asserted here by name rather than assumed — ⏎ a kind that silently missed one of them would be a commitment on one screen and something else on another. | 5,13,4 |
| C0036 | raptor-port/src/engine/events.ts | 273 | engine |  | ASSUMED; Assumed | read for inpShow (see its own comment) — never set by collectEvents. */ ⏎ /* AN END ASSUMED, NOT TYPED (D2005 — the two blind reads, 12 Nov 26): a sim with no end ('sim', Logic's "Assumed sim ⏎ length") or a row with no end ('open', "Assumed length, no end time"). Crew rest the next day re-measures it by THAT | 10,4 |
| C0037 | raptor-port/src/engine/events.ts | 337 | engine |  | ASSUMED | const shiftLine=isStandalone(w); ⏎ /* THE ASSUMED LANDING (owner D2046, D2047, 15 Nov 26 — over D1990 and D2022's "the landing borrows the ⏎ take-off"): a sortie with its take-off typed and no landing that is a time (blank, "TBD", any words) lands the | 4 |
| C0038 | raptor-port/src/engine/events.ts | 419 | engine |  | assumed | const noLd=!shiftLine&&isFinite(toM)&&!isFinite(toMin(f.ld\|\|'')); ⏎ /* D2055 (15 Nov 26): a standby SHIFT with its START typed and its END blank is never assumed — it bears no crew ⏎ rest until its END is typed (validate.ts reads `noEnd`); flying or not (the agent's reading). Written only | 4 |
| C0039 | raptor-port/src/engine/events.ts | 460 | engine |  | assumed | if(!sw){blank.push({id,label:'Sim '+s.label,key:'s:'+di+'.'+k+'.'+ri,kind:'sim'});return;} // a box with no start — D605, `blank` above ⏎ events.push(assumedEnd({id,s:sw[0],e:sw[1],label:'Sim '+s.label,kind:'sim',key:'s:'+di+'.'+k+'.'+ri},parseHM(s.end)==null?'sim':null)); }); })); /* an assumed end, as push() below (D2005) */ ⏎ /* ---- sim brief / debrief windows ------------------------------------- | 4 |
| C0040 | raptor-port/src/engine/events.ts | 514 | engine |  | reading of | scheduler typed by hand reads differently. `reqRows` is this day's own note of which events a request made. */ ⏎ /* D2073 (Astra's read, 16 Nov 26): one commitment found twice keeps the PLAINER reading of its end — an SC desk with no ⏎ END met first must not swallow a plain desk's assumed end for crew rest, so the kept event loses its `noEnd` when | 4 |
| C0041 | raptor-port/src/engine/faceattrs.ts | 96 | engine |  | assumed | 'epBrief', 'simDebrief', 'amtDebrief', 'openEnd', 'simLen', 'maxRun', 'scDayFrom', 'scDayTo', ⏎ /* the assumed flight length (D2046) — every check that reads a landing reads it, so a published day keeps it (D2005); ⏎ its OIL keeps it too (oil.ts OilRuleVals — D2044) */ | 1,2,4 |
| C0042 | raptor-port/src/engine/longday-msg.test.ts | 4 | engine | test | assumed | timing warning). When a sortie closes the day its end is the landing plus the ⏎ assumed 2h debrief, so the note prints the real landing and flags the pad; a ⏎ scheduler who knows a crew leaves fast can discount it. A non-flying finish is | 13,4 |
| C0043 | raptor-port/src/engine/longday-msg.test.ts | 38 | engine | test | assumed | expect(wolf, 'the real landing is named').toContain('last landing 16:05') ⏎ expect(wolf, 'and the pad is flagged as an assumption').toContain('+ 2h debrief assumed') ⏎ expect(wolf, 'the day still reads start → end').toMatch(/05:00 → 18:05/) | 13,4 |
| C0044 | raptor-port/src/engine/longday-msg.test.ts | 52 | engine | test | assumed | expect(g.msg, 'the hours are stated plainly').toMatch(/05:00 → 19:00/) ⏎ expect(g.msg, 'with no debrief clause on a non-flying end').not.toContain('debrief assumed') ⏎ }) | 13,4 |
| C0045 | raptor-port/src/engine/longday-msg.test.ts | 67-68 | engine | test | assumed | expect(wolf, 'the real landing is still named').toContain('last landing 16:05') ⏎ expect(wolf, 'the smaller pad is named as the assumption').toContain('+ 1h30 debrief assumed') ⏎ expect(wolf, 'the default 2h wording is gone').not.toContain('+ 2h debrief assumed') ⏎ expect(wolf, 'the end reflects landing + the smaller pad').toMatch(/05:00 → 17:35/) | 13,4 |
| C0046 | raptor-port/src/engine/official-flags.test.ts | 424 | engine | test | for now; provisional | ⏎ /* §4 — REVERSED 25 Sep 26 by the owner's D179 ("freeze everything for now", provisional): a qualification or a rule ⏎ change used to re-flag a published day's face at once, because PEOPLE and VCONF are not part of the frozen day. Then | 2,13,4 |
| C0047 | raptor-port/src/engine/official-flags.test.ts | 535 | engine | test | for now; provisional | ⏎ /* REVERSED 25 Sep 26 by the owner's D179 ("freeze everything for now" — medical included, provisional): §4's "current ⏎ safety facts are never versioned" was a design decision, never a ruling of his, and the newer word wins. A downchit | 13 |
| C0048 | raptor-port/src/engine/oil.ts | 96 | engine |  | assumed | `rv`) and every reader of its OIL hands them back in here; with none handed in, today's are read. */ ⏎ /* …and, since D2046 (15 Nov 26), the assumed flight length — a sortie with no landing typed earns to its take-off plus it, ⏎ so a published day keeps it with the other three (D2044). A block kept before it existed has none: today's is read. */ | 1,2,4 |
| C0049 | raptor-port/src/engine/oil.ts | 187 | engine |  | ASSUMED | read this, so a line the screen says earns can never be one the credit pays nothing for, nor the other way round. */ ⏎ /* `flt` (D2046, 15 Nov 26): a sortie with its take-off typed and no landing earns to its ASSUMED landing, the take-off ⏎ plus the Logic flight length, as every other check reads it; left out (the screen's words), no landing measures nothing | 1,10 |
| C0050 | raptor-port/src/engine/oil.ts | 240 | engine |  | assumed | const lead=opts&&opts.rv?opts.rv.reportLead:ruleNow('reportLead'), deb=opts&&opts.rv?opts.rv.debrief:ruleNow('debrief'); ⏎ /* the assumed flight length (D2046): the kept one, else today's — a block kept before it existed has none (D56) */ ⏎ const flt=opts&&opts.rv&&opts.rv.fltLen!=null?opts.rv.fltLen:ruleNow('fltLen'); | 1,4 |
| C0051 | raptor-port/src/engine/oil.ts | 341 | engine |  | assumed | :(st==null?null ⏎ :fltOilWin(wv,f,lead,deb,lines,flt)); // D2046: no landing typed → the assumed one ⏎ if(!win)return; | 1 |
| C0052 | raptor-port/src/engine/oil.ts | 523 | engine |  | assumed | if(f.cx)return; ⏎ /* D2046: a sortie with its take-off typed and no landing earns to its assumed landing, so it is not named */ ⏎ if((readable(f.to,f.ld)\|\|(!isStandalone(wv)&&parseHM(f.to)!=null))&&!zeroShift(wv,f)&&!fltMeasuresNothing(wv,f))return; | 1 |
| C0053 | raptor-port/src/engine/oilev.ts | 663 | engine |  | assumed | if (!(r && n(r.reportLead) && n(r.debrief) && n(r.oilFullMin))) return null ⏎ /* the assumed flight length (D2046, D2044) — kept since it existed; a block kept before has none, read as today's (D56) */ ⏎ return n(r.fltLen) ? { reportLead: r.reportLead, debrief: r.debrief, oilFullMin: r.oilFullMin, fltLen: r.fltLen } | 4 |
| C0054 | raptor-port/src/engine/oilflighttimes.test.ts | 16 | engine | test | reading of | squadron's own fact and the code could not supply it — the third time his ⏎ knowledge of how the squadron runs has corrected a reading of the code, after ⏎ D36 (the availability window) and D44 (membership frozen on every day). So | 3,5,13,4 |
| C0055 | raptor-port/src/engine/oilflighttimes.test.ts | 154-157 | engine | test | assumed | ⏎ /* CHANGED ON PURPOSE by D2046 (15 Nov 26 — every check reads the assumed landing; OIL among them is the agent's ⏎ reading, flagged to him): a line with a take-off and no landing now earns to its assumed landing, so it is no longer ⏎ a line with no usable times — and is not named */ ⏎ it('a line with a take-off and no landing earns to its assumed landing and is NOT named (D2046)', () => { ⏎ onlyLine(SAT, '09:00',… | 1,13 |
| C0056 | raptor-port/src/engine/oilopenrow.test.ts | 51 | engine | test | assumed | ['a duty desk', () => { day().dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '' }] }]; ensureRowIds(DAYS); return rowItemKey(day().dutywaves[0].rows[0].rid) }, 60], ⏎ ['a sim seat (its own assumed length)', () => { day().sims = { amt: [{ str: '1300', end: '', p: 'allavail', w: '' }] }; ensureRowIds(DAYS); return rowItemKey(day().sims.amt[0].rid) }, 90], ⏎ ['a Common Programme… | 5,13,4 |
| C0057 | raptor-port/src/engine/oilopenrow.test.ts | 57 | engine | test | assumed | for (const [what, build, len] of KINDS) { ⏎ it(`${what}: the crowd is written down over the assumed ${len} minutes`, () => { ⏎ const item = build() | 13 |
| C0058 | raptor-port/src/engine/oilopenrow.test.ts | 71 | engine | test | assumed | ⏎ it('the assumed length is the Logic tab\'s — change it and the window follows', () => { ⏎ VCONF.openEnd = 120 | 10,13 |
| C0059 | raptor-port/src/engine/oilpersonalcrowd.test.ts | 14 | engine | test | the agent's reading | Personal kind. AND IT IS STILL NOT WORK: no OIL question, nothing earned — by the men named in it or by the men ⏎ behind its puck (the agent's reading, told to him). ⏎ So the cases of 1 Oct are back, each re-expressed to the one record: the placeholder is one of the INPUT's people | 1,5,13 |
| C0060 | raptor-port/src/engine/oilplaceholderclaim.test.ts | 426 | engine | test | his call | 14 Oct 26: "<name> added to <row>" goes; the note is kept where it says what the puck does not) */ ⏎ expect(SAID, said ? 'one note: his callsign, the input\'s name, and that he is not counted' : 'no note: the puck is the sign (D854)') ⏎ .toEqual(said ? [`${String((PEOPLE as any).divot.cs)} added to Duty${said}`] : []) | 5,13,4 |
| C0061 | raptor-port/src/engine/oilseat-refusal.test.ts | 47 | engine | test | assumed | ⏎ /* the first cockpit seat on the loaded week, found rather than assumed — the ⏎ fixture must be a real flying line, not one built for the test */ | 3,13,4 |
| C0062 | raptor-port/src/engine/oilworkstart.test.ts | 62 | engine | test | the agent's reading | wave's in-time, and the earlier of the two starts the day; a typed "VL RALLY 1000" is VL's own in-time now, replacing ⏎ the wave-wide one for VL (D505's scope — the agent's reading, put to him). */ ⏎ it('a formation\'s own Rally does not cancel the wave\'s in-time — each activity apart, then the earlier (D505)', () => { | 13,4 |
| C0063 | raptor-port/src/engine/oilworkstart.test.ts | 207-208 | engine | test | ASSUMED; assumed | /* CHANGED ON PURPOSE by D2046 (15 Nov 26): '12:00' with no landing left the case above — it now earns from its in-time ⏎ to its ASSUMED landing (take-off + Logic's flight length) plus the debrief: 08:30 → 13:00 + 2h = 15:00 */ ⏎ it('a line with a take-off and no landing earns to its assumed landing (D2046)', () => { ⏎ expect(dayOilSpans(day([wave(['IN TIME 0830'], line('VL', '12:00', '', [jet('bane')]))])).bane).to… | 10,13,4 |
| C0064 | raptor-port/src/engine/publish.ts | 569 | engine |  | for now | return {d,c,fil:dayFilingFingerprint(di),inp:dayInputsFrozen(di)};} ⏎ /* THE DAY'S INPUTS AS ISSUED ([LEAVE-LATE-PUBLISHED], owner D177–D179, 25 Sep 26 — "freeze everything for now"). A copy ⏎ of every input covering this day's date at the moment of issue, keyed by id — every field, its filing state | 2,5,4 |
| C0065 | raptor-port/src/engine/publish.ts | 736 | engine |  | for now | export function dayDeltaCore(di:any):DeltaEntry[]{di=+di;return passMemo('dc',di,()=>dayDeltaIn(SCHED,di,CURWEEK));} ⏎ /* ---- THE DAY'S WARNINGS AS ISSUED ([LEAVE-LATE-PUBLISHED], owner D179, 25 Sep 26 — "freeze everything for now") ---- ⏎ A published day's face used to be re-judged on every change: its issued content and filings, but TODAY's people, | 2,4 |
| C0066 | raptor-port/src/engine/published-day-logic.test.ts | 8 | engine | test | The agent's reading | amendment, and to every unpublished day at once. ⏎ The agent's readings (the coordinator's, told to him with the ruling): a changed setting neither STARTS nor CLEARS a ⏎ flag on a published day; a published day with no change waiting shows the same on every surface (the working pass — | 2,10,13,4 |
| C0067 | raptor-port/src/engine/published-day-logic.test.ts | 121-122 | engine | test | Assumed | ['Long work day', (_p, di) => { day(di).waves.push(wave([form()])) }, () => { VCONF.longDay = 300 }], ⏎ ['Assumed sim length, no end time (a clash CLEARED by the change)', (_p, di) => { day(di).sims.oft.push({ label: 'BFM-9', str: '10:00', end: '', p: '', w: 'bane', rmks: '' }); day(di).ground.push(MTG('11:15', '12:00')) }, () => { VCONF.simLen = 60 }], ⏎ ['Assumed length, no end time (a clash CLEARED by the change)… | 2,10,13,4 |
| C0068 | raptor-port/src/engine/published-day-logic.test.ts | 150 | engine | test | the agent's reading | Insights' work hours still move with a changed setting, published days included — D2005 rules the day's checks only ⏎ (the agent's reading, set out in the report: D2005 does not clearly cover the hours, so D482 stands for them) */ ⏎ describe('D482 stands beside D2005: Insights\' work hours move at once with a changed setting, a published day included', () => { | 2,10,13,4 |
| C0069 | raptor-port/src/engine/published-day-logic.test.ts | 163 | engine | test | assumed | }) ⏎ it('a row with no end time counts the assumed length as it stands today — a published Tuesday\'s 10:00 lecture: 1 hour, then 1½ once the setting is 90 minutes', () => { ⏎ day(TUE).ground.push({ prog: 'LECT', str: '10:00', end: '', who: 'bane' }) | 2,10,13,4 |
| C0070 | raptor-port/src/engine/rally-workspan.test.ts | 52 | engine | test | the agent's reading | formation-specific rally here is VL's box; the typed "08:30 VL RALLY" is VL's own in-time, replacing the wide one ⏎ for VL (D505's scope, unchanged — the agent's reading, put to him). */ ⏎ it('D505 scopes IN and RALLY separately, preserving a wide IN under specific RALLY', () => { | 13 |
| C0071 | raptor-port/src/engine/rally-workspan.test.ts | 127 | engine | test | The agent's reading | formation's own in-time, so it replaces the whole-wave in-time for VL (D505's scope); RU keeps the whole-wave one. ⏎ In either order. The agent's reading, put to him with the rules-first W4 case. */ ⏎ it('W3 D505 a formation RALLY AFTER IN TIME typed WITH a clock — D1995: it is that formation\'s own in-time, in either order', () => { | 13,4 |
| C0072 | raptor-port/src/engine/restore.test.ts | 50 | engine | test | his call | /* CANONICAL person compare (owner, 16 Aug 26) — a seed/pre-fix row can hold a ⏎ person's id ('nact') where an app write stores his callsign ('Warden'). */ ⏎ it('resolves a callsign to its id so both spellings compare equal; free text passes through untouched', () => { | 13 |
| C0073 | raptor-port/src/engine/ruleflex.test.ts | 304 | engine | test | his call | today.aircraft.push({ p: 'waldo', w: '', area: '', rmks: '', opts: {} }) ⏎ /* the seed wave publishes an 06:00 in-time for this callsign, which ⏎ would bind the anchor ahead of the knob under test — clear it */ | 2,13,4 |
| C0074 | raptor-port/src/engine/rules.ts | 57 | engine |  | ASSUMED | simLen:90, // a sim row with no end time is assumed to run this long ⏎ /* A FLIGHT WITH NO LANDING TYPED (blank or "TBD") IS ASSUMED TO LAND THIS LONG AFTER TAKE-OFF (owner D2046, D2047, ⏎ 15 Nov 26 — "Default u can put 60 minutes"). Every check that reads a flying line's landing reads this assumed one | 4 |
| C0075 | raptor-port/src/engine/rulescheck-batch2.test.ts | 73-77 | engine | test | assumed; ASSUMED | } ⏎ /* CHANGED ON PURPOSE by D2046 (15 Nov 26 — "assumed it landed 13:00 (take-off + 1h)"): the day ends at the ASSUMED ⏎ landing, take-off plus Logic's flight length, plus the debrief — 15:00, clear 03:00 — and says so */ ⏎ it('a blank landing: "Monday T/O 12:00, landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00"', () => { ⏎ const msg = breach('') ⏎ expect(msg).toContain('Crew rest… | 10,13,4 |
| C0076 | raptor-port/src/engine/rulescheck-batch2.test.ts | 82 | engine | test | assumed | const msg = breach('TBD') ⏎ expect(msg).toContain('Crew rest: Monday T/O 12:00, landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00. ') ⏎ expect(msg).not.toMatch(/landed/) | 13,4 |
| C0077 | raptor-port/src/engine/rulescheck-batch2.test.ts | 87 | engine | test | assumed | const msg = breach('12:30') ⏎ expect(msg).toContain('Crew rest: Monday landed 12:30 + 2h debrief (assumed) → ended 14:30 → clear 02:30. ') ⏎ }) | 13,4 |
| C0078 | raptor-port/src/engine/rulescheck-batch2.test.ts | 94 | engine | test | ASSUMED | and its turn are measured from the take-off, so they say so — the check itself is kept */ ⏎ /* CHANGED ON PURPOSE by D2046 (15 Nov 26): the debrief and the turn are measured from the ASSUMED landing, take-off ⏎ plus Logic's flight length (13:00 and 10:00 here), and say so; the ground row moves past the dekit, where it is a | 10,13 |
| C0079 | raptor-port/src/engine/rulescheck-batch2.test.ts | 97 | engine | test | assumed | debrief miss and not a conflict (D2059) */ ⏎ it('a blank landing: the debrief line counts from the assumed landing', () => { ⏎ add(MON, wave([form({ to: '12:00', ld: '' })])) | 13,4 |
| C0080 | raptor-port/src/engine/rulescheck-batch2.test.ts | 102 | engine | test | assumed | expect(w.length).toBe(1) ⏎ expect(String(w[0].msg)).toBe('Misses VL BFM debrief 13:00–15:00 (landing assumed): BRIEFING 13:40–14:00') ⏎ expect(String(w[0].msg)).not.toMatch(/\bland\b/) | 13 |
| C0081 | raptor-port/src/engine/rulescheck-batch2.test.ts | 105 | engine | test | assumed | }) ⏎ it('a blank landing: the tight turn counts from the assumed landing', () => { ⏎ add(MON, wave([form({ cs: 'VL', to: '09:00', ld: '' }), form({ cs: 'RU', to: '10:00', ld: '11:00' })])) | 13,4 |
| C0082 | raptor-port/src/engine/rulescheck-batch2.test.ts | 109 | engine | test | assumed | expect(w.length).toBe(1) ⏎ expect(String(w[0].msg)).toMatch(/^Tight turn: VL BFM → RU BFM, 0 min \(needs \d+\)\. VL BFM landing assumed 10:00 \(T\/O \+ 1h\), RU BFM T\/O 10:00$/) ⏎ expect(String(w[0].msg)).not.toMatch(/\bland\b/) | 13 |
| C0083 | raptor-port/src/engine/rulesfirst-1-report-times.test.ts | 88 | engine | test | the agent's reading | A whole-wave rally no longer exists (the box is a formation's own); a line typed "07:00 RALLY" is a whole-wave in-time, ⏎ so VL's own in-time line replaces it (D505, D1034's kept part) — the agent's reading, put to him as a question. */ ⏎ it('whole-wave in-time 08:00 and VL\'s rally 08:30: VL reports 08:00; D1995: a whole-wave "07:00 RALLY" line is an in-time, so VL\'s own in-time 07:30 replaces it', () => { | 13,4 |
| C0084 | raptor-port/src/engine/rulesfirst-1-report-times.test.ts | 112 | engine | test | the agent's reading | own in-time and replaces the whole-wave one for VL (D505; D1034's kept part); VK still reports 06:00. D1034's answer ⏎ had everyone at 06:00, so this one case is put to him (the agent's reading). */ ⏎ w = two(['06:00 IN TIME', 'VL RALLY 07:00']) | 13,4 |
| C0085 | raptor-port/src/engine/rulesfirst-2-standby.test.ts | 194 | engine | test | the agent's reading | expect([two.sorties - one.sorties, two.forms - one.forms], 'D1062: two seated MAIN rows, both SPAREs empty — 2, not 4').toEqual([2, 1]) ⏎ am.aircraft[2].w = 'bullet' // the agent's reading: "neither seat" — one seat is somebody ⏎ expect(computeInsights().sorties - two.sorties).toBe(1) | 10,13,4 |
| C0086 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 107 | engine | test | assumed | describe('W31 — a sortie-caused breach spells out the debrief assumption; anything else ends at its written end with no tail (15 Aug 26; D1045)', () => { ⏎ it('a sortie: "landed 19:30, +2h debrief assumed"; a flying SC line: "ended 19:00", no debrief; the long-day note likewise', () => { ⏎ add(MON, wave([], [form({ to: '18:30', ld: '19:30' })])) | 13,4 |
| C0087 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 110 | engine | test | assumed | add(TUE, wave(['09:00 IN TIME'])) ⏎ expect(warns(TUE, 'bane', 'CREW_REST')[0].msg).toContain('Crew rest: Monday landed 19:30 + 2h debrief (assumed) → ended 21:30 → clear 09:30. ') ⏎ ;(DAYS[MON] as any).waves.splice(0) | 13,4 |
| C0088 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 117 | engine | test | assumed | expect(msg, 'a flying standby line ends at END').toContain('Crew rest: Monday duty ended 19:00 → clear 07:00. ') ⏎ expect(msg).not.toContain('debrief assumed') ⏎ ground(MON, 'bane', '0500', '1100') // 05:00 → 19:00 = 14h, ended by the shift | 13,4 |
| C0089 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 121 | engine | test | assumed | expect(ld.length).toBe(1) ⏎ expect(ld[0].msg, 'a non-flying finish stays bare').not.toContain('debrief assumed') ⏎ }) | 13,4 |
| C0090 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 230-234 | engine | test | assumed; ASSUMED | /* W35 CHANGED ON PURPOSE by D2053 (15 Nov 26 — "a flight with its take-off typed and no landing counts in Insights' hours ⏎ and the long-day note up to its assumed landing, no longer nothing"), over D1936; and D2046 ("assumed it landed 13:00 ⏎ (take-off + 1h)") over D1990's "take-off plus the debrief": a blank or "TBD" landing is the ASSUMED landing, take-off ⏎ plus Logic's flight length, for the hours, the long da… | 10,13,4 |
| C0091 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 245-246 | engine | test | assumed | // D1990 (11 Nov 26, [RULES-CHECK-FIXES]) over the as-built "a TBD landing ends nothing": a "TBD" landing ends the day ⏎ // as a blank one does for tomorrow's crew rest — since D2046 at the assumed landing plus the debrief. ⏎ it('D1990, D2046: a blank landing and a "TBD" landing both end the day for tomorrow\'s crew rest at the assumed landing + debrief', () => { ⏎ const vl: any = add(MON, wave([], [form({ to: '20:0… | 13,4 |
| C0092 | raptor-port/src/engine/rulesfirst-3-crew-rest.test.ts | 250 | engine | test | assumed | const blank = warns(TUE, 'bane', 'CREW_REST') ⏎ expect(blank.length, 'blank: the assumed landing ends the day').toBe(1) ⏎ for (const ld of ['TBD', 'tbd', ' TBD ']) { | 13,4 |
| C0093 | raptor-port/src/engine/rulesfirst-4-availability.test.ts | 141 | engine | test | assumed | describe('W47 — a row with a start and no end is read over the Logic tab\'s one-hour default (D360, D361)', () => { ⏎ it('as built: a NAMED man on a 10:00 row with no end is busy 10:00–11:00 — the same assumed hour the crowd is counted over; the setting moves both', () => { ⏎ day(TUE).ground.push({ prog: 'DINNER WITH CMD', str: '1000', end: '', who: X }) | 5,10,13,4 |
| C0094 | raptor-port/src/engine/rulesfirst-4-availability.test.ts | 145 | engine | test | assumed | line(TUE, '12:00', '13:00') // step 11:00 — the equal-time edge ⏎ expect(warns(TUE, X, null).filter((x: any) => x.sev === 'hard').map((x: any) => x.code), 'step at the assumed end: no clash').toEqual([]) ⏎ VCONF.openEnd = 90 | 5,13,4 |
| C0095 | raptor-port/src/engine/rulesfirst-7-published-day.test.ts | 142 | engine | test | the agent's reading | later job): a published day's crew rest is measured to the brief it PRINTED; the new setting reaches it from its next ⏎ amendment. The working copy (Edit Schedule) previews that amendment, so it reads today's setting — the agent's reading ⏎ of D2005 ("the working copy of a published day, once edited, is checked by today's settings"), pinned here. */ | 2,13,4 |
| C0096 | raptor-port/src/engine/rulesfirst-7-published-day.test.ts | 159 | engine | test | reading of | expect(officialWarn().trace?.[MON]?.bane, 'no dotted "breaks tomorrow\'s crew rest" mark on Monday from the published Tuesday').toBeUndefined() ⏎ expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the working copy previews the next amendment: today\'s 08:40 (the agent\'s reading of D2005)').toBe(true) ⏎ sign(TUE); publishALDay(TUE); validate() | 2,13,4 |
| C0097 | raptor-port/src/engine/rulesfirst-8-oil-hours.test.ts | 83 | engine | test | the agent's reading | /* Bane's Saturday: a 07:00–08:00 ground brief, then VL (take-off 12:00, landing 13:00) with the wave's in-time typed ⏎ 10:00 — later than the nominal 09:00 (the agent's reading (6): a later typed time shortens). Every reader of OIL hours ⏎ on one made-up day: the engine's walk, the board's OIL Earn figure, the work-hours span Insights and the long day | 1,10,13,4 |
| C0098 | raptor-port/src/engine/rulesfirst-8-oil-hours.test.ts | 247 | engine | test | assumed | expect(Object.keys(dayOilSpans(day(SUN))), 'D360: nobody is credited from a guessed hour').toEqual([]) ⏎ expect((oilEvidence(SUN).sent as any)['r:r-open'], 'D360: but the crowd behind the puck is counted over the assumed hour').toBeDefined() ⏎ }) | 1,13,4 |
| C0099 | raptor-port/src/engine/rulesfirst-9-oil-earners.test.ts | 135 | engine | test | his to change | /* the words job ([RULES-CHECK-FIXES] job 3): a shift has no debrief, so the flying line's "the day still earns from ⏎ the report and debrief" was not exact — it says what the shift earns from, new words his to change */ ⏎ expect(String(note[0].msg), 'its own tail').toBe('Times look wrong: SC START and END are both 08:00. The shift still earns OIL from its R or B.') | 1,13,4 |
| C0100 | raptor-port/src/engine/schema.test.ts | 157 | engine | test | assumed | openEnd: 'number?', simLen: 'number?', maxRun: 'number?', scDayFrom: 'number?', scDayTo: 'number?', ⏎ /* the assumed flight length (D2046) — a version issued before it kept none */ ⏎ fltLen: 'number?', shiftHard: { $opt: { $map: 'boolean' } } } | 13,4 |
| C0101 | raptor-port/src/engine/sort.test.ts | 53 | engine | test | assumed | is read live off `f.to` every time the sorter runs and no wave KIND ⏎ carries an assumed hour anywhere in this file — invert the two defaults ⏎ and the order must invert with them. */ | 13,4 |
| C0102 | raptor-port/src/engine/validate.ts | 219 | engine |  | ASSUMED | export const debriefSays=(lg:any,what:string)=>{const [ls,de]=legDebriefWin(lg) ⏎ /* D2046: with no landing typed the window starts at the ASSUMED landing (events.ts `noLd`) and says so */ ⏎ return `Misses ${lineWord(lg.label)?lineWord(lg.label)+'debrief':'the flight debrief'} ${rng(ls,de)}${lg.noLd?' (landing assumed)':''}: ${what}`} | 4 |
| C0103 | raptor-port/src/engine/validate.ts | 520 | engine |  | assumed | which ends at its written time with no debrief tail to assume. */ ⏎ /* D2010 (13 Nov 26) as D2046 (15 Nov 26) changes it: prevFlyNoLd is the assumed flight length, in minutes, of a ⏎ winning sortie with NO landing typed (blank or "TBD"; events.ts `noLd`) — 0 when a landing was typed — so the tail | 4 |
| C0104 | raptor-port/src/engine/validate.ts | 553 | engine |  | assumed | ever meets a sortie with no take-off, whose end stays not-a-number. */ ⏎ /* D2005 again (Astra's blind read, 16 Nov 26): the day before built its assumed landing with ITS own flight length; ⏎ the day being judged re-works it with its own, as it does the debrief below — never the day before's kept 60 */ | 4 |
| C0105 | raptor-port/src/engine/validate.ts | 556 | engine |  | ASSUMED | const flyLd=e.kind==='fly'&&e.noLd&&isFinite(e.to)?e.to+VCONF.fltLen:e.kind==='fly'&&!isFinite(e.ld)?e.to:e.ld; ⏎ /* D2005: the day being judged decides — a sortie's debrief, and an end the day before only ASSUMED (no end typed: ⏎ events.ts `ae`), are worked out with the judged day's settings, never the day before's */ | 4 |
| C0106 | raptor-port/src/engine/validate.ts | 697 | engine |  | assumed | const source=prevSource[id]\|\|prevSeed; ⏎ /* [WARN-WORDS-STANDALONE] (D2069 keeps his 22 Aug 26 order): "Monday landed 21:30 + 2h debrief (assumed) → ended ⏎ 23:30 → clear 11:30"; a day not ended by a flight says what ended, "Monday duty ended 20:00 → clear 08:00" */ | 4 |
| C0107 | raptor-port/src/engine/validate.ts | 1263-1264 | engine |  | ASSUMED; assumed | time with nothing to assume, so it stays bare. */ ⏎ /* D2046, D2053: a last sortie with no landing typed closes the day at its ASSUMED landing, and says so */ ⏎ /* the approved words (spec §3, D2053): "(VL BFM landing assumed 17:20 + 2h debrief assumed)" */ ⏎ const back=ef?`${hm24(e)} (${ef.noLd?`${String(lineName(ef.label)).trim()} landing assumed ${hm24(ef.ld)}`:`last landing ${hm24(ef.ld)}`} + ${lgT(VCONF.debrief… | 4 |
| C0108 | raptor-port/src/engine/warnwords.test.ts | 216 | engine | test | assumed | add(TUE, wave([form({ to: '11:00', ld: '12:00' })])) ⏎ expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h.']) ⏎ }) | 13,4 |
| C0109 | raptor-port/src/engine/warnwords.test.ts | 222 | engine | test | assumed | ground(TUE, 'bane', '07:00', '07:30', 'MEETING') ⏎ expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Day starts 07:00 (MEETING), before report 08:40: 7h30 rest, needs 12h.']) ⏎ }) | 13,4 |
| C0110 | raptor-port/src/engine/warnwords.test.ts | 232 | engine | test | assumed | add(TUE, wave([form({ to: '13:00', ld: '14:00', aircraft: [ac('bane', '', 'late show')] })])) ⏎ expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 10:40: 11h10 rest, needs 12h. Late show: still makes the 12:00 step.']) ⏎ }) | 13,4 |
| C0111 | raptor-port/src/engine/warnwords.test.ts | 237 | engine | test | assumed | add(TUE, wave([form({ to: '13:00', ld: '14:00', aircraft: [ac('bane', '', 'late show')] })])) ⏎ expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 23:30 + 2h debrief (assumed) → ended 01:30 → clear 13:30. Report 10:40: 9h10 rest, needs 12h. Late show doesn\'t help: the 12:00 step is before rest clears.']) ⏎ }) | 13,4 |
| C0112 | raptor-port/src/engine/warnwords.test.ts | 242 | engine | test | assumed | add(TUE, wave([form({ to: '12:00', ld: '13:00', br: '10:00' })])) ⏎ expect(msgs(TUE, 'CREW_TIGHT', 'bane')).toEqual(['Tight turning: the usual report (T/O 12:00 − 3h = 09:00) is before clear 09:30. Monday landed 19:30 + 2h debrief (assumed) → ended 21:30 → clear 09:30.']) ⏎ }) | 13,4 |
| C0113 | raptor-port/src/engine/warnwords.test.ts | 250 | engine | test | assumed | add(TUE, wave([form({ to: '13:00', ld: '17:20' })])) ⏎ expect(msgs(TUE, 'LONGDAY', 'bane')).toEqual(['Long day: 13h20 (limit 12h), 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed)']) ⏎ }) | 13,4 |
| C0114 | raptor-port/src/engine/warnwords.test.ts | 321-324 | engine | test | assumed | '0 DT_SUM \| 4 people are double turning: Saber, Echo, Piston, Relay', ⏎ '0 LONGDAY \| Long day: 15h10 (limit 12h), 08:00 → 23:10 (last landing 21:10 + 2h debrief assumed)', ⏎ '0 LONGDAY \| Long day: 13h30 (limit 12h), 09:40 → 23:10 (last landing 21:10 + 2h debrief assumed)', ⏎ '0 LONGDAY \| Long day: 12h05 (limit 12h), 10:40 → 22:45 (last landing 20:45 + 2h debrief assumed)', ⏎ '0 LONGDAY \| Long day: 12h05 (limit 12h),… | 13,4 |
| C0115 | raptor-port/src/engine/warnwords.test.ts | 328-329 | engine | test | assumed | '1 NO_BRIEF \| Misses VL SAT brief 12:20–14:40: Appointment 14:00–16:00', ⏎ '1 LONGDAY \| Long day: 13h05 (limit 12h), 05:00 → 18:05 (last landing 16:05 + 2h debrief assumed)', ⏎ '1 CREW_REST \| Crew rest: Monday landed 20:45 + 2h debrief (assumed) → ended 22:45 → clear 10:45. Report 06:00: 7h15 rest, needs 12h.', ⏎ '2 TURN \| Tight turn: VL ACM → VL BFM, 60 min (needs 120). VL ACM landing 12:00, VL BFM T/O 13:00', | 13,4 |
| C0116 | raptor-port/src/engine/weekctx.test.ts | 145 | engine | test | assumed | expect(seedRunIn(WK, VCONF.maxRun)).toEqual({ waldo: 8 }) ⏎ // the second bundle really was asked for, not just assumed present ⏎ expect(weekBundleMock.mock.calls.some((c: any) => c[0] === prevPrevKey)).toBe(true) | 13 |
| C0117 | raptor-port/src/leavewar/assumedlanding-published.test.ts | 1 | leave-war | test | ASSUMED | // [WARN-WORDS-STANDALONE] piece B — A FLIGHT WITH NO LANDING TYPED EARNS OIL TO ITS ASSUMED LANDING, AND A PUBLISHED DAY ⏎ // KEEPS THE FLIGHT LENGTH IT WENT OUT WITH (owner D2046, D2047 — "every check that reads the landing"; D2053; the OIL | 6,1,2,13,4 |
| C0118 | raptor-port/src/leavewar/assumedlanding-published.test.ts | 5 | leave-war | test | assumed | // ⏎ // Bane on a published Saturday, take-off 10:00 and NO landing typed: report 07:00 (the nominal 3h lead) to the assumed ⏎ // landing 11:00 (+1h) plus the 2h debrief = 13:00, six hours — a half day under the 6h01 line. Raising the Logic flight | 6,2,10,13,4 |
| C0119 | raptor-port/src/leavewar/assumedlanding-published.test.ts | 60 | leave-war | test | assumed | ⏎ describe('a flight with no landing typed earns to its assumed landing (D2046, D2053)', () => { ⏎ for (const ld of ['', 'TBD']) { | 6,2,13 |
| C0120 | raptor-port/src/leavewar/clashwayout.test.tsx | 159 | leave-war | test | his call | an archived man) printed his hidden id — "plasma" — where every other place names him by the roster's callsign */ ⏎ describe('a clash for a man with no war row names him by his callsign, never his hidden id', () => { ⏎ it('the desktop strip and the phone list both read "Fable", not "plasma"', () => { | 6,13 |
| C0121 | raptor-port/src/leavewar/countersamong.test.ts | 8 | leave-war | test | our reading | cares where they sit. The saved list's meaning is engine/fixedrows.test.ts; the screen is ui/countersamong.test.tsx. ⏎ The four readings told to him: (1) the four keep their own order, carry no grip and no cross — only counters move; ⏎ (2) every counter may go anywhere; (3) one order for the squadron, saved, and undone by the app's Undo; (4) a | 7,3,13 |
| C0122 | raptor-port/src/leavewar/deletednorow.test.ts | 134 | leave-war | test | his call | ⏎ it('his callsign given to a new man: the new man’s bid approves, the old one stays refused — the rule reads the id (S1-9)', () => { ⏎ const old = addIncoming('Newby') | 6,3,13 |
| C0123 | raptor-port/src/leavewar/engine/fixedrows.test.ts | 5 | leave-war | test | our reading | ⏎ The pure half: what the saved list means. The four readings told to him, each pinned here or in the store's test ⏎ (countersamong.test.ts): (1) the four keep their own order and only counters move; (2) every counter may go | 7,13 |
| C0124 | raptor-port/src/leavewar/engine/leaveyear.ts | 223 | leave-war |  | the agent's reading | * counts: a grade given, its "+ days" changed or the grade deleted ON 1 Jan counts from the next 1 Jan, never moving what ⏎ * that 1 Jan added (the code read's 4, 29 Oct 26 — the agent's reading of D1490 for a change made on 1 Jan itself; its ⏎ * writers date a change with the app's today). `gradeOn` still says what holds on a day. */ | 6,4 |
| C0125 | raptor-port/src/leavewar/groupinput.test.ts | 158 | leave-war | test | his to change | }) ⏎ it('with the switch OFF he files for himself only — and what he had filed for another man is no longer his to change', () => { ⏎ ranger() | 6,5,13 |
| C0126 | raptor-port/src/leavewar/groupinput.test.ts | 207-209 | leave-war | test | his to change | scheduler's". The retype is refused as ever. A HAND-OVER through the one-field save is still a scheduler's. But WHO ⏎ IS IN what he filed is now his to change, through the input's one writer, each entry in his own name — and never ⏎ in anybody else's. */ ⏎ it('he cannot retype what he filed to a leave; who is in it is his to change — in his own name, never by the hand-over door (D763)', () => { ⏎ ranger() | 6,3,5,13,4 |
| C0127 | raptor-port/src/leavewar/groupinput.test.ts | 336 | leave-war | test | his to change | with Outlaw kept as the entry's filer, and pass. He is refused now, in either shape; the entry's filer adds the man ⏎ himself — and the whole of it is still his to change. */ ⏎ it('a man is added to an input only by whoever filed it (or a scheduler): another member adds nobody to it, in his own name or the filer\'s (D763)', () => { | 6,3,5,13,4 |
| C0128 | raptor-port/src/leavewar/groupinput.test.ts | 352-353 | leave-war | test | his to change | expect(peopleOf(byId(id))[1]).toMatchObject({ p: 'rocky', by: 'casper' }) ⏎ expect(commitInput(byId(id), { ...draftOf(byId(id)), remarks: 'Outlaw filed it: the whole of it is his to change' }, ['casper', 'rocky'])).toBe(true) ⏎ expect(byId(id).remarks).toBe('Outlaw filed it: the whole of it is his to change') ⏎ }) | 6,5,13 |
| C0129 | raptor-port/src/leavewar/m4decide.test.ts | 186 | leave-war | test | the agent's reading | ahead and see what is left. For a posting out as Overseas Sqn, Transfer or with no outcome, before or after it runs, in ⏎ every door; a posting with the Delete outcome keeps its refusal from its date (the agent's reading — below). */ ⏎ describe('his D1541: a posting out refuses no leave on days from its date', () => { | 6,3,13,4 |
| C0130 | raptor-port/src/leavewar/m4decide.test.ts | 231 | leave-war | test | reading of | ⏎ /* A MAN WHOSE POSTING OUT HAS RUN (B12 as his D1436 narrows it — the host's reading of D1436's full row, 28 Oct 26: "a ⏎ request with no such day [after his posting-out date] approves as ever"): only his days from the posting-out date on are | 6,13,4 |
| C0131 | raptor-port/src/leavewar/m4decide.test.ts | 281 | leave-war | test | reading of | }) ⏎ /* (narrowed by D1436's full row, the host's reading of 28 Oct 26: one DATE rule in every door, whether the posting has ⏎ run or not — a day before his posting-out date approves in every door, a day from it is refused in every door) */ | 6,3,13,4 |
| C0132 | raptor-port/src/leavewar/multi-sqn-fixread10.test.ts | 392 | leave-war | test | the agent's reading | every right held before it. Its old line half — a line his move retired, kept through the move by Plan — is spent by ⏎ the same rulings: a line retires only on a move, and a move now ends the Plan (the agent's reading, chat 127 — named ⏎ for the fix read)) */ | 6,2,3,13 |
| C0133 | raptor-port/src/leavewar/multi-sqn-fixread11.test.ts | 643 | leave-war | test | agent's reading | squadron; the old line half spent by D2203/D2243 — a line retires only on a move, and a move now ends the Plan (the ⏎ agent's reading, chat 127 — named for the fix read)) */ ⏎ it('(Fable F11-5b) moved to 150 on 16 Jul; Plan of 149 from 17 Jul; on 18 Jul set to View and undone: Plan back with its own day', () => { | 6,2,3,13,4 |
| C0134 | raptor-port/src/leavewar/oilworkstart-published.test.ts | 107 | leave-war | test | assumed | publish(5) ⏎ /* …and, since D2046, the assumed flight length beside them (src/leavewar/assumedlanding-published.test.ts) */ ⏎ expect(keptOn(5)).toEqual({ reportLead: 170, debrief: 130, oilFullMin: 370, fltLen: 60 }) | 6,2,13 |
| C0135 | raptor-port/src/leavewar/onedoor.test.ts | 166 | leave-war | test | his call | ⏎ it('D295 / D286: his callsign held by a man on the roster — Restore refuses; Restore as does both', () => { ⏎ archivePerson('rocky') | 6,3,13 |
| C0136 | raptor-port/src/leavewar/onerecord-write.test.ts | 212 | leave-war | test | his to change | const r = the('Duty'), was = copy(r) ⏎ expect(mayEditInput(r), 'not his to change for everyone').toBe(false) ⏎ expect(mayDeleteInput(r), 'nor to delete').toBe(false) | 6,5,13,4 |
| C0137 | raptor-port/src/leavewar/onerecord-write.test.ts | 234 | leave-war | test | his to change | const had = new Set(NOTICES.map(n => n.id)), told = () => NOTICES.filter(n => !had.has(n.id)) ⏎ expect(mayEditInput(r), 'not his to change for everyone').toBe(false) ⏎ expect(commitInput(r, draftOf(r), ['bane', 'casper'])).toBe(true) | 6,5,9,13 |
| C0138 | raptor-port/src/leavewar/personalseveral.test.ts | 139 | leave-war | test | his to change | const r = the() ⏎ expect(mayEditInput(r), 'not his to change for everyone').toBe(false) ⏎ expect(commitInput(r, draftOf(r), ['bane', 'rocky', 'casper', 'harpoon']), 'he adds nobody').toBe(false) | 6,5,13 |
| C0139 | raptor-port/src/leavewar/postout-notice.test.ts | 192 | leave-war | test | the agent's reading | stays with it; the posting sheet's own Undo is a command of its own, and the line stays as the record that the posting ⏎ ran (the agent's reading, put to him with the build — as a deleted man's line stays, D1691) */ ⏎ /* (since his D1693, 5 Nov 26 the posting sheet's Undo takes the line back: unread it simply goes, read it becomes "taken | 6,9,13 |
| C0140 | raptor-port/src/leavewar/postout-outcomes.test.ts | 238 | leave-war | test | his call | }) ⏎ it('Undo post out, his callsign now a roster man’s: refused with where to go (D286 (1)), nothing changed', () => { ⏎ expect(postOut('bane', TODAY, 'overseas')).toBe(true) | 6,3,13,4 |
| C0141 | raptor-port/src/leavewar/postout-outcomes.test.ts | 314 | leave-war | test | his call | }) ⏎ it('Restore refuses while a roster man holds his callsign; Restore-as brings him back under another in one step', () => { ⏎ expect(postOut('bane', TODAY, 'overseas')).toBe(true) | 6,3,13,4 |
| C0142 | raptor-port/src/leavewar/postout-roster.test.ts | 133 | leave-war | test | his call | expect(saved('bane').cs).toBe('Ranger') ⏎ expect(P('bane').cs, 'his callsign as saved').toBe('Ranger') ⏎ }) | 6,13 |
| C0143 | raptor-port/src/leavewar/sans-ahead-walk152.test.tsx | 139 | leave-war | test | the agent's reading | one. The line now counts only the men the day shows. (The window a tap opens edits the whole record, so it still names ⏎ both — the agent's reading, told to him: hiding a man from it would let a save drop him from the record.) */ ⏎ describe('W10-1 — a shared offer\'s placed line counts only the men shown that day', () => { | 6,5,13,4 |
| C0144 | raptor-port/src/leavewar/sans-before.test.tsx | 5 | leave-war | test | The agent's reading | figures dimmed, never the posting-out stripes (the drawing: docs/mock/2026-11-23-sans-before-shading/, its STYLE.A). ⏎ The agent's readings shown in the drawing and kept by him: his view only, an admin's unchanged; only while his SANS date ⏎ is ahead, gone from that date; a shaded day still opens, "+ Commitment" greyed for him (D2340). | 6,3,5,13,4 |
| C0145 | raptor-port/src/leavewar/sans-from-date.test.ts | 10 | leave-war | test | the agent's reading | (b) a tick put back after a SANS posting counts from the day it is put back, the posting's earlier SANS days kept and ⏎ the days between a regular's (his D2327, 22 Nov 26 — the agent's reading until then); ⏎ (c) a man NAMED on a published day before his posting does not make it pending. | 6,2,5,13,4 |
| C0146 | raptor-port/src/leavewar/state/store.ts | 4196 | leave-war |  | reading of | * then, and the refusal of his days from that date speaks in the past tense (sync.ts postingOutWhy). Since the fixes' ⏎ * round 2 (D1436's full row, the host's reading of 28 Oct 26) a run posting no longer refuses every request of his — only ⏎ * his days from the posting-out date, as before it runs. */ | 7,3,4 |
| C0147 | raptor-port/src/leavewar/sync.ts | 811 | leave-war |  | his to change | * window's course, overseas duty, Other and Attach buttons — ui/BidPicker.tsx fileDuty): the count, then the first reason ⏎ * the door gave, else that the days were not his to change. ONE FULL STOP (the second re-walk's I3): the door's reasons ⏎ * carry none, but the app's generic words do — "1 day filed. This change could not be saved.." */ | 7,4 |
| C0148 | raptor-port/src/leavewar/sync.ts | 3877 | leave-war |  | his call | */ ⏎ /* why the posting sheet's Undo would be refused — the Post out's own archive, with his callsign now held by a man on the ⏎ roster (D286 (1): never renaming anyone by itself; Admin → Users' Archived group restores him under another in one step, | 7,3 |
| C0149 | raptor-port/src/leavewar/sync.ts | 4216 | leave-war |  | his call | // loadWeek→runOilPass crediting K cells) into ONE lw.sync projection. A no-op ⏎ // when this callback runs at phase 8 (the committing lane coalesces on its own). ⏎ /* design §4.1 order: roster, then the absence index (fresh before the OIL | 7,1 |
| C0150 | raptor-port/src/leavewar/sync.ts | 4768 | leave-war |  | his call | const h = puck(id, false, true, false).replace(' tabindex="0"', '') ⏎ /* a war person the roster no longer draws (a demo row, one deleted since) still reads as his callsign */ ⏎ return h \|\| `<span class="ll-cs">${String(callsign).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c])}</span>` | 7 |
| C0151 | raptor-port/src/leavewar/trialread.test.ts | 114 | leave-war | test | his to change | const n = commandStream().length ⏎ /* Hex, a member who is in it and did not file it, writes on OUTLAW's cell: not his to change */ ⏎ signInAs('hex') | 6,3,13 |
| C0152 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 641 | leave-war |  | until he rules | const n = VISIT.pending >= 0 ? VISIT.pending : pendingCount() ⏎ /* on a desktop the compact bar of his drawing (his D1432, r22-4-desk); a phone keeps its own until he rules on it */ ⏎ const phone = usePhone() | 6 |
| C0153 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1068 | leave-war |  | the agent's reading | > ⏎ {/* D300 (the agent's reading, stated to him): "Post in", the date already in its own box */} ⏎ Post in | 6 |
| C0154 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1423 | leave-war |  | his call | onChange: (fromDate: string, outcome: PostOutcome) => string \| void ⏎ /** a refusal comes back as its sentence (said on the sheet, which stays up) — e.g. his callsign now held on the roster */ ⏎ onUndo: () => string \| void | 6,3 |
| C0155 | raptor-port/src/leavewar/ui/bubblewords.ts | 4 | leave-war |  | reading of | ⏎ /** The bid bubble's reading of the grid at one moment (D1227): each row-day at its level (0 clear, 1 amber, 2 red) with its ⏎ * figure (`have` — D1345, D1364), the days drawn then — the two Available rows are read over the drawn days only — and the | 6,5,4 |
| C0156 | raptor-port/src/leavewar/ui/chrome.test.tsx | 115 | leave-war | test | tbc | // none of the old swatch classes is left in the colour/fill/size key ⏎ for (const old of ['appr', 'tbc', 'ref']) expect(leg.querySelector(`.leg-box .c.${old}`)).toBeNull() ⏎ // the Legend never teaches the stored half-day codes "*LL" / "LL*", which nothing on screen shows (the blind read's L3, 21 Oct 26) | 6,10,13,4 |
| C0157 | raptor-port/src/leavewar/ui/creditdoor.test.tsx | 345 | leave-war | test | reading of | /* Was 3 — the takeover kept the LARGER of the two, which was the safe ⏎ reading of a defect while the owner's decision was still open. He ⏎ ruled on 21 Sep that they ADD. */ | 7,13 |
| C0158 | raptor-port/src/leavewar/ui/daypanel.test.tsx | 63 | leave-war | test | his call | expect(line.querySelector('.ll-state')!.textContent).toBe('Pending') ⏎ expect(line.querySelector('.ll-puck')!.innerHTML, 'his puck, or his callsign where the roster draws none').toMatch(/puck\|ll-cs/) ⏎ expect(w.textContent).not.toContain('SECRET-REMARK') | 6,13,4 |
| C0159 | raptor-port/src/leavewar/ui/dragwords.test.tsx | 193 | leave-war | test | the agent's reading | ⏎ /* the agent's reading: an empty box typed nothing, so it never wipes the days' words — a remark is cleared from its own ⏎ window, where the box shows it */ | 6,13,4 |
| C0160 | raptor-port/src/leavewar/ui/flyrows.test.tsx | 203 | leave-war | test | his to change | own addition, with no screen); a record that build left in a store changes nothing now. The Available rows' names ⏎ ARE his to change — availform.test.tsx. */ ⏎ it('the Required rows read Required P and Required W whatever an earlier build left in the store', () => { | 6,5,13 |
| C0161 | raptor-port/src/leavewar/ui/LeaveLine.tsx | 29 | leave-war |  | his call | personId: string ⏎ /** his callsign, where the roster draws no puck for him */ ⏎ callsign?: string | 6 |
| C0162 | raptor-port/src/leavewar/ui/matrix.test.tsx | 359 | leave-war | test | tbc | (`s-r`) — and Ack is gone (D1158): ASICS's 24 Feb OIL, the seed's acknowledged bid, is pending now. The old ⏎ classes appr / tbc / ref are gone from the grid's box. */ ⏎ const FILLS = ['s-a', 's-w', 's-r'] | 6,1,13 |
| C0163 | raptor-port/src/leavewar/ui/matrix.test.tsx | 371 | leave-war | test | tbc | const c = screen.getByTestId(id).querySelector('.c')! ⏎ for (const old of ['appr', 'tbc', 'ref']) expect(c.classList.contains(old)).toBe(false) ⏎ } | 6,13 |
| C0164 | raptor-port/src/leavewar/ui/Matrix.tsx | 99 | leave-war |  | his to change | case 'window': return 'That lands outside what you can edit — pick another day.' ⏎ /* a member's landing on a day closed for him (M3 §4 (4) — the agent's words, shown at his look, his to change) */ ⏎ case 'closed': return 'That day is closed for bidding. Pick an open day.' | 6,3,4 |
| C0165 | raptor-port/src/leavewar/ui/Matrix.tsx | 1106 | leave-war |  | his call | const jumpTo = (date: string) => { ⏎ /* any jump spends a month pressed in the strip (D1477) — the strip's own press sets it again after this call, and a ⏎ date jumped to from Approvals, the bell, the period or today is the readout's to light (the fix read's 1) */ | 6,9,4 |
| C0166 | raptor-port/src/leavewar/ui/monthstrip.test.tsx | 55 | leave-war | test | assumed | // calendar — a war one quarter long gets three buttons. A strip that ⏎ // assumed a year would offer months the grid has no columns for. ⏎ it('follows the war on screen rather than assuming a year', () => { | 6,13 |
| C0167 | raptor-port/src/leavewar/ui/namepuck.test.tsx | 93 | leave-war | test | his call | the schedule's own SANS class on the puck (`.puck.san` — the line on the right over the chip), for a man in the SANS group ⏎ and for a man posted out as SANS shown in his old place; the separate "SANS" tag that squeezed his callsign is gone. */ ⏎ describe('the SANS purple line on the Leave War names (D1697, D1698)', () => { | 6,5,13,4 |
| C0168 | raptor-port/src/leavewar/ui/select.ts | 213 | leave-war |  | his call | leftEdge?: () => number ⏎ /** How GENTLE this caller's edge auto-scroll is. `rate` multiplies the ⏎ * per-frame step; `dwellMs` is how long the pointer must sit inside a band | 6 |
| C0169 | raptor-port/src/leavewar/ui/select.ts | 912 | leave-war |  | the agent's reading | ⏎ /* A PRESS-AND-DRAG CARRIES IT TOO, AND LANDS ON THE LIFT (D262 — the agent's reading (c), stated to him: the desktop ⏎ lands on the click OR the release). The drag-select's own machine, pointed at the move: a mouse arms at a few px, a | 6 |
| C0170 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 121 | leave-war |  | his call | const approving = role === 'admin' && approve ⏎ /* THE DAY LINE across a drag: each man's days read on their own, then the worst person-day of them all — his callsign ⏎ before the date where the drag holds several men (the agent's reading, M3 §7.1) */ | 6,3,4 |
| C0171 | raptor-port/src/leavewar/viewerpin.test.ts | 39 | leave-war | test | his call | }) ⏎ it('an admin whose own callsign is off the war\'s roster (archived) still grants under his callsign, never "admin" (Fable code read)', () => { ⏎ const was = PEOPLE.stiff.archived | 6,3,13 |
| C0172 | raptor-port/src/published-day-logic-reads.test.ts | 3 | other | test | assumed | /* D2005, THE TWO BLIND READS' FINDINGS, PINNED (12 Nov 26). Written by the fresh Opus reader as proof tests, each red on ⏎ the first build and green after its fix: F1 the day before's assumed end judged by the judged day; F2 a hide-only ⏎ change previews today's settings; F3 the picker's run question by each day's own limit; F4 a frozen advisory's words | 2,10,13,4 |
| C0173 | raptor-port/src/published-day-logic-reads.test.ts | 46-48 | other | test | ASSUMED; Assumed; assumed | ⏎ describe('F1 — cross-day crew rest: the day before\'s ASSUMED end is built under the day before\'s settings, not the judged day\'s', () => { ⏎ it('published Tuesday; Monday (a draft) ends with a 20:00 lecture with no end time; "Assumed length, no end time" 60 → 120: Tuesday must stay clean', () => { ⏎ day(MON).ground.push({ prog: 'LECT', str: '20:00', end: '', who: 'bane' }) // assumed 21:00 ⏎ day(TUE).waves.… | 2,10,13,4 |
| C0174 | raptor-port/src/published-day-logic-reads.test.ts | 52 | other | test | assumed | expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'premise: clean').toBe(false) ⏎ VCONF.openEnd = 120; validate() // Monday's lecture now assumed to 22:00 → clear 10:00 ⏎ expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'published face (View-only Sched)').toBe(false) | 2,3,10,13,4 |
| C0175 | raptor-port/src/published-day-logic-reads.test.ts | 56-57 | other | test | Assumed; assumed | }) ⏎ it('the same with Monday\'s sim with no end time and "Assumed sim length"', () => { ⏎ day(MON).sims.oft.push({ label: 'BFM-9', str: '19:30', end: '', p: 'bane', w: '', rmks: '' }) // assumed 21:00 ⏎ day(TUE).waves.push(wave([form({ br: '09:40' })])) | 2,10,13,4 |
| C0176 | raptor-port/src/published-day-logic-reads.test.ts | 67-68 | other | test | assumed; Assumed | ⏎ describe('F1 mirror — a published Monday\'s assumed end does not take a changed setting for a DRAFT Tuesday', () => { ⏎ it('Monday published with a 20:00 lecture, no end; Tuesday a draft; "Assumed length" 60 → 120: Tuesday (unpublished) must read 120 at once', () => { ⏎ day(MON).ground.push({ prog: 'LECT', str: '20:00', end: '', who: 'bane' }) | 2,10,13,4 |
| C0177 | raptor-port/src/state/callsign.test.ts | 34 | state | test | his call | describe('PO10 — the callsign index holds the roster and the placeholders only (D286 (2))', () => { ⏎ it('a man on the roster is found by his callsign, any case', () => { ⏎ expect(nameToId(cs('bane').toUpperCase())).toBe('bane') | 13 |
| C0178 | raptor-port/src/state/callsign.test.ts | 42 | state | test | his call | }) ⏎ it('an ARCHIVED man is never found by a typed callsign — his callsign resolves to nobody', () => { ⏎ keep('casper') | 13 |
| C0179 | raptor-port/src/state/corelines-bell-moved-admin.test.ts | 2 | state | test | reading of | // @vitest-environment jsdom ⏎ /* CORE LINE 5 (helper "corelines", 22 Nov 26) — THE AUDIT of the bell's reading of an admin once K3 holds (his D2160: an ⏎ admin who moves squadron arrives a member). A filer who has moved is told of a change to an input he filed only as an | 3,5,9,13 |
| C0180 | raptor-port/src/state/memberfile.test.ts | 3 | state | test | for now | /* THE MEMBERS' SWITCH — "members may file duties and commitments for other people" (owner D654, D655 reading 6: the ⏎ members' half is "for now"; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13). ⏎ | 2,3,5,13 |
| C0181 | raptor-port/src/state/multi-sqn-job2-inputs.test.ts | 82 | state | test | his to change | }) ⏎ it('his move to 149 saved for tomorrow: his own input dated after it is still his to change today', () => { ⏎ const iso = inputAtIso(mineOf().date, mineOf().yr)! | 3,5,13,4 |
| C0182 | raptor-port/src/state/multi-sqn-job2-inputs.test.ts | 93 | state | test | his to change | }) ⏎ it('after he has moved: his own input dated before the move is still his to change', () => { ⏎ const iso = inputAtIso(mineOf().date, mineOf().yr)! | 3,5,13 |
| C0183 | raptor-port/src/state/notices.ts | 149 | state |  | The agent's reading | * it names nobody (an ALL AVAIL input — no man whose squadron to ask); and while, for some man named in it, he is still ⏎ * in that man's squadron or an admin of it (a master is an admin everywhere, a Plan grant counts). The agent's reading, ⏎ * told in the closing report: a member who filed for a squadron-mate and never moved is still told — the ruling speaks of | 2,3,5,9 |
| C0184 | raptor-port/src/state/notices.ts | 179 | state |  | the agent's reading | * nothing of Kestrel's change on 17 Jul; nor was he once he moved away and back to 142. Now his home today counts too ⏎ * where he is its admin (his role as it stands when the input changes — the agent's reading in D2228's row) and it is ⏎ * the named man's home on one of the input's days (filerUnits). A moved member is still told only through a right, and | 3,5,9,4 |
| C0185 | raptor-port/src/state/notices.ts | 225 | state |  | The agent's reading | * never moved), who filed Ranger's leave 23–27 Jul, was told nothing of Saber's change once Ranger was 149's from 25 Jul, ⏎ * though 23 and 24 Jul are still 142's. The agent's reading, in the ruling's row: a day is the filer's squadron's where ⏎ * the named man's home that day is it. A moved filer is still not told (D2223): his own home and rights are read on `iso` | 3,9,4 |
| C0186 | raptor-port/src/state/notices.ts | 1119 | state |  | the agent's reading | } ⏎ /* (past three, "and 2 more" after the dates, part of the list — chat 147's rewording, the agent's reading of D2342) */ ⏎ export function sansDaysWords(days: readonly string[]): string { | 9,4 |
| C0187 | raptor-port/src/state/notices.ts | 1198 | state |  | his call | } ⏎ /* A POSTING'S LINE (D1690 — picture 2b): the man in bold, by his callsign of today (a deleted man keeps his record, so ⏎ his name still reads), the posting's date; "Posted out · archived, account suspended"; nobody named */ | 3,9,4 |
| C0188 | raptor-port/src/state/perms.test.ts | 221 | state | test | his to change | }) ⏎ it('with the switch off his filing is no longer his to change — the man and an admin still can', () => { ⏎ off() | 3,13 |
| C0189 | raptor-port/src/state/perms.ts | 439 | state |  | for now | export const INPUT_FILER_NOTE = 'or — while the squadron\'s members-file-for-others setting is on — a Duty & other commitments input (not SANS Availability) that I FILED (`filedBy` = my person; D654, D655, D658), while everyone else in it was put in by me: I may create, change and delete it, change who is in it, and give its one OIL answer for everyone in it (D660, D762); my own one-person input that I add people to… | 1,3,5,4 |
| C0190 | raptor-port/src/state/perms.ts | 1999 | state |  | his call | const sameJson = (x: unknown, y: unknown) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null) ⏎ /* the fields of a man's PERSON that make his account what it is — his callsign (his name on every sign-in line), and ⏎ whether he is on the roster at all. D2205 rules a master's ACCOUNT a master's alone; his qualifications, CAT and the | 3 |
| C0191 | raptor-port/src/state/perms.ts | 2339 | state |  | the agent's reading | } ⏎ /* G4 — A RIGHT IN ANOTHER SQUADRON CHANGES HANDS ONLY BY A MASTER (fix read 10, fault D — the agent's reading of D2094 / ⏎ D2199, "an admin of a squadron is made only by its own admins or a master admin"): re-linking an account that holds a | 3 |
| C0192 | raptor-port/src/state/person-delete.test.ts | 278 | state | test | his call | ⏎ describe('PO5 — kept underneath, gone from every list; his callsign free; his account gone', () => { ⏎ it('the hidden mark, the callsign, the account and his next sign-in', () => { | 3,13 |
| C0193 | raptor-port/src/state/person-delete.test.ts | 283 | state | test | his call | expect(PEOPLE[HIM]).toMatchObject({ deleted: true, deletedFrom: '2026-07-15', archived: true, archivedBy: 'del' }) ⏎ expect(nameToId(cs), 'his callsign is free').toBeUndefined() ⏎ expect(archivedHolders(cs), 'not an archived holder either').toEqual([]) | 13 |
| C0194 | raptor-port/src/state/person-delete.ts | 200 | state |  | his call | const cut = isoOrd(cutoff) ⏎ /* 1. the mark (and the callsign index follows — his callsign is free) */ ⏎ Object.assign(p, { deleted: true, deletedFrom: cutoff, archived: true, archivedBy: 'del' }) | 4 |
| C0195 | raptor-port/src/state/quals-write.test.ts | 211 | state | test | his call | ['Scheduler', () => { (PEOPLE as any).bane.quals.sched = !(PEOPLE as any).bane.quals.sched }, () => !!(PEOPLE as any).bane.quals.sched, 'his Scheduler tick'], ⏎ ['the callsign', () => { (PEOPLE as any).bane.cs = 'Zulu9' }, () => (PEOPLE as any).bane.cs, 'his callsign'], ⏎ ['the archive mark', () => { (PEOPLE as any).bane.archived = true }, () => !!(PEOPLE as any).bane.archived, 'his archive mark'], | 13,4 |
| C0196 | raptor-port/src/state/quals-write.test.ts | 221 | state | test | his call | /* …and a callsign of another shape that prints the same is still a change (the security read's finding 4) */ ⏎ ['the callsign\'s shape', () => { (PEOPLE as any).bane.cs = [(PEOPLE as any).bane.cs] }, () => JSON.stringify((PEOPLE as any).bane.cs), 'his callsign'], ⏎ ] | 13 |
| C0197 | raptor-port/src/state/reshape-plan-audit.test.ts | 6 | state | test | the agent's reading | Rulings: D2199, D2211 — Plan is given and taken by a master admin only; D2201 — an admin a master admin gives Plan ⏎ (the agent's reading, told to him: Plan is for an admin — a scheduler is always one, D785). */ ⏎ import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest' | 2,3,13,4 |
| C0198 | raptor-port/src/state/signin-kinds-gate.test.ts | 67-68 | state | test | his to change | it('a Plan holder in the member view: none (D292, D2253)', () => { give('hunter', 'admin'); signInAs('hunter'); switchRoleView(); expect(run()).toEqual(all(false)) }) ⏎ it('an admin the day his own move to 149 counts: his old squadron\'s Logic is no longer his to change (D2203, D2243)', () => { ⏎ /* Hunter, 142's admin, moves to 149 from Thu 16 Jul: on that day 142's Logic is not his to change */ ⏎ signInAs('saber')… | 2,3,10,13,4 |
| C0199 | raptor-port/src/state/undo-wire.ts | 585 | state |  | his call | setRecordKeyHook({ stamp: (changes) => stampOf(changes, worldNow), key: (c, stamp) => recordKeyIn(c, stamp) }) ⏎ /* the words name a man by his callsign (describe.ts — the Leave War's records carry his id) */ ⏎ setDescribeNames((pid) => ((PEOPLE as any)[pid] ? String((PEOPLE as any)[pid].cs) : null), (k) => (k === 'accounts' ? seedAccounts() : null)) | 3 |
| C0200 | raptor-port/src/testing/refwin.ts | 630 | other | test | assumed | track the winning rest-end's raw landing (null for a shift) and, when a ⏎ sortie set it, print "landed HH:MM, +Nh debrief assumed → ended HH:MM". ⏎ Parity compares the message, so the reference tracks and prints the same. */ | 4 |
| C0201 | raptor-port/src/testing/refwin.ts | 638 | other | test | assumed | + "const tail=landed!=null" ⏎ + "?`${ev[idx-1].dow} landed ${hm24(landed)}, +${lgT(VCONF.debrief)} debrief assumed → ended ${hm24(pe)} → crew rest clear at ${hm24(earliest)}`" ⏎ + ":`${ev[idx-1].dow} ended ${hm24(pe)} → crew rest clear at ${hm24(earliest)}`;"], | 4 |
| C0202 | raptor-port/src/testing/refwin.ts | 672 | other | test | assumed | /* The long-work-day note names the debrief pad on its end (owner, 15 Aug ⏎ 26): a sortie closes the day at land + the assumed 2h debrief. Parity ⏎ compares the message, so the reference tracks the bounding fly event | 4 |
| C0203 | raptor-port/src/testing/refwin.ts | 678 | other | test | assumed | ["add('note','LONGDAY',[id],`${PEOPLE[id]?PEOPLE[id].cs:id} has a long work day: ${dur(span)} (${hm24(s)} → ${hm24(e)})`);}", ⏎ "const back=ef?`${hm24(e)} (last landing ${hm24(ef.ld)} + ${lgT(VCONF.debrief)} debrief assumed)`:`${hm24(e)}`;" ⏎ + "add('note','LONGDAY',[id],`${PEOPLE[id]?PEOPLE[id].cs:id} has a long work day: ${dur(span)}, ${hm24(s)} → ${back}`);}"], | 4 |
| C0204 | raptor-port/src/tracker/leftovers.test.tsx | 1196 | tracker | test | the agent's reading | /* D123 — "Last Flown is the latest day actually flown": a day put in by hand and then TAKEN OFF leaves Last Flown on ⏎ the latest flight marked done, and blank only where no flight is done (the agent's reading of D123, told to him) */ ⏎ it('F3 — taking the date off a Last Flown box puts it back to the latest flight done; with no flight done it is blank', async () => { | 8,13,4 |
| C0205 | raptor-port/src/ui/AccessScreen.tsx | 46 | ui |  | HIS CALL | ⏎ /* HIS CALLSIGN, LARGE, ON ONE LINE (the member / guest build's walk, 5 Nov 26 - walker A's S4): a callsign may be 14 ⏎ letters (D226), and at the pass's 30px a long one broke in the middle of the name - a name breaking is an outright | 3 |
| C0206 | raptor-port/src/ui/accounts-newperson.test.tsx | 106 | ui | test | his call | await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) }) ⏎ /* the pass (D1650, D1656 — the sentence that said this went with the heading): his callsign large, then what he gave — ⏎ no initials, so no Initials field rather than a blank one */ | 3,13 |
| C0207 | raptor-port/src/ui/accounts-newperson.test.tsx | 250 | ui | test | his call | }) ⏎ /* [ONE-DOOR] (D310, D322) REPLACED "the account editor of an ARCHIVED person still shows his callsign in its picker" ⏎ (Astra's fix check #2): an archived man is no longer in the People list with an account editor — he sits in the | 3,13 |
| C0208 | raptor-port/src/ui/audit-e-commit-relink.test.tsx | 264 | ui | test | his to change | let d = draftOf(inp); d.remarks = 'mine — first' ⏎ expect(commitInputEdit(inp, d), 'his own request: his to change').toBe(true) ⏎ expect(rowsFor(inp)[0].row.rmks).toBe('mine — first') // a one-day duty or commitment prints no date (owner D951, D953) | 5,13,4 |
| C0209 | raptor-port/src/ui/availopenrow.test.tsx | 3 | ui | test | assumed | /* [ALLAVAIL-OPEN-ROW] — D360 (owner, 28 Sep 26: "ok, need to say something like no oil worked out due end time to the ⏎ admin"), on screen. The engine half (the crowd recorded over the assumed hour, nothing credited) is ⏎ engine/oilopenrow.test.ts; this is what a person reads: | 1,3,5,13 |
| C0210 | raptor-port/src/ui/availopenrow.test.tsx | 7 | ui | test | assumed | window's list (Fable correction 2 — one reader); ⏎ · the window's title names the assumed hour ("18:30–19:30 · no end time, an hour assumed") instead of saying the ⏎ row has no usable times beside a count (Fable F2); | 5,13 |
| C0211 | raptor-port/src/ui/availopenrow.test.tsx | 92 | ui | test | assumed | ⏎ it('the window names the assumed hour — not "no usable times" beside a count', async () => { ⏎ openRow(); await open(); await click(chip()) | 5,13 |
| C0212 | raptor-port/src/ui/availopenrow.test.tsx | 96 | ui | test | assumed | expect(ttl).toContain('18:30–19:30') ⏎ expect(ttl).toContain('no end time, an hour assumed') ⏎ expect($('.availwin .win-lost'), 'the list, not a reason it cannot be worked out').toBeNull() | 5,13 |
| C0213 | raptor-port/src/ui/availopenrow.test.tsx | 134 | ui | test | assumed | ⏎ it('"who\'s available", open to everyone, carries the assumed hour only — no OIL sentence', async () => { ⏎ openRow(); await open(); await click(chip()) | 1,5,13 |
| C0214 | raptor-port/src/ui/availwin.test.tsx | 806-808 | ui | test | assumed | /* CHANGED BY D360 (owner, 28 Sep 26 — [ALLAVAIL-OPEN-ROW]): a row with a start and no end is counted over the ⏎ assumed hour now, so clearing its END keeps the list and says the hour is assumed; clearing its START is the case ⏎ that cannot be worked out. */ ⏎ it('the end time cleared behind it: the list stays, over the assumed hour (D360)', async () => { ⏎ puckRow(TUE); await openWin(TUE) | 5,13 |
| C0215 | raptor-port/src/ui/availwin.test.tsx | 813 | ui | test | assumed | expect(rows().length, 'the men behind the puck').toBe(CROWD.length) ⏎ expect($('.availwin .win-ttl').textContent \|\| '').toContain('no end time, an hour assumed') ⏎ }) | 5,13 |
| C0216 | raptor-port/src/ui/batch2.test.tsx | 410 | ui | test | his to change | await as('member'); await openOn(rec) ⏎ expect(tid('inped-ro'), 'the input is not his to change').toBeTruthy() ⏎ expect($('#inpEditPop .inped-oilsum')!.textContent, 'the line still says what stands').toBe('credited on its non-working day') | 3,5,13,4 |
| C0217 | raptor-port/src/ui/bellnotices-scenarios.test.tsx | 431 | ui | test | his call | describe('the words keep up with today, and keep what the input was (state/notices.ts — "kept on the notice")', () => { ⏎ it('a renamed person reads by his callsign of today — as the man added, and as who did it', async () => { ⏎ await boot() | 5,9,13,4 |
| C0218 | raptor-port/src/ui/brieftime-ui.test.tsx | 46 | ui | test | assumed | /* the funnel key prefix (di.gi.li) for a formation found via firstForm — ⏎ located by object identity rather than assumed indices, so a seed reorder ⏎ cannot silently point this file's keys at the wrong line. */ | 13 |
| C0219 | raptor-port/src/ui/crewrest-ui.test.ts | 119 | ui | test | assumed | expect(msg, 'the real landing, not just the derived end').toContain('landed 23:30') ⏎ expect(msg, 'the pad named as an assumption the reader can override').toContain('+ 2h debrief (assumed)') ⏎ expect(msg, 'and the derived end the 12h clock actually runs from').toContain('ended 01:30') | 13,4 |
| C0220 | raptor-port/src/ui/everyweekday.test.tsx | 154 | ui | test | his to change | }) ⏎ it('the class and the start are his to change, and the sentence says what will be saved', () => { ⏎ openEvery(3) | 13,4 |
| C0221 | raptor-port/src/ui/glowoff-css.test.ts | 12 | ui | test | not ruled | calendar's "Add people" window. Left as it is on purpose: a dragged thing's dark drop shadow under its ring (`0 8px 20px` ⏎ black — depth, not a glow of a colour). The SANS puck's stripe, not ruled here, lost its light later (D882) — the whole ⏎ app's roll-call is `noglow-css.test.ts`. */ | 5,13 |
| C0222 | raptor-port/src/ui/groupeditor.test.tsx | 163 | ui | test | his to change | }) ⏎ it('a member files a meeting for himself and another man; it is his to change afterwards (D655)', async () => { ⏎ await as('member') | 3,13 |
| C0223 | raptor-port/src/ui/groupeditor.test.tsx | 312 | ui | test | his to change | await openOn(r) ⏎ expect($('#inpEditSave'), 'still his to change').toBeTruthy() ⏎ expect(tid('inped-ro')).toBeNull() | 13 |
| C0224 | raptor-port/src/ui/groupeditor.test.tsx | 323 | ui | test | his to change | await openOn(g) ⏎ expect($('#inpEditSave'), 'not his to change for everyone').toBeNull() ⏎ expect($('#inpEditDel')).toBeNull() | 13 |
| C0225 | raptor-port/src/ui/groupeditor.test.tsx | 1131 | ui | test | his call | }) ⏎ it('a SANS member files his own only: his callsign, no list, no switch', async () => { ⏎ const x = sansPeople()[0] | 3,5,13 |
| C0226 | raptor-port/src/ui/histbubble.test.tsx | 244 | ui | test | his call | expect(lis.length, 'the last three, not all five').toBe(3) ⏎ /* the log keeps a person's id; the bubble says his callsign (elogVal — Fable F4, 28 Sep 26) */ ⏎ expect(lis[0]!.textContent, 'the oldest of the three shown is edit #3').toContain(elogVal(all[2]!, 'to')) | 13 |
| C0227 | raptor-port/src/ui/histlist.test.tsx | 267-269 | ui | test | assumed | /* [WARN-HIDE-KEPT] — the walk (walker C, 1 Oct 26): a line with its own words AND a from → to ran the two together, ⏎ "…debrief assumed)hidden → flagged again". The hide's history line is the first such line; a space parts them. */ ⏎ it('a line with its own words and a from → to keeps a gap between them', async () => { ⏎ logAction(0, 'Warning · Static — a long work day (2h debrief assumed)', { sect: 'day', from: 'f… | 13,4 |
| C0228 | raptor-port/src/ui/histlist.test.tsx | 273 | ui | test | assumed | expect(row, 'the line is listed').toBeTruthy() ⏎ expect(row.textContent).toMatch(/assumed\) flagged → hidden/) ⏎ }) | 13 |
| C0229 | raptor-port/src/ui/html.test.ts | 924 | ui | test | his call | second parameter so a day frozen in manual order (moveGroundRow sets ⏎ d.gman) stops time-sorting at render — but this call site never passed ⏎ it, so the freeze-then-move machinery a scheduler just used was silently | 13,4 |
| C0230 | raptor-port/src/ui/inputcard-model.test.ts | 29 | ui | test | his call | describe('who it is for', () => { ⏎ it('one person: his callsign', () => { ⏎ expect(cardOf([rec({})], P).names).toBe('Ranger') | 5,13 |
| C0231 | raptor-port/src/ui/inputcx-scenarios.test.tsx | 209 | ui | test | his call | expect(b, 'nothing of the bar\'s item changes but the mark').toEqual(a) ⏎ /* one named person beside ALL AVAIL keeps his callsign (the plan §4.5) — cancelled too */ ⏎ const one = (over: any = {}) => monthItems([{ ...rec(over), people: [{ p: ten()[0] }, { p: 'allavail' }] }], F)[0] | 2,5,13 |
| C0232 | raptor-port/src/ui/inputedit.tsx | 2222 | ui |  | his call | * "It stays for …": the PEOPLE are counted and a placeholder is said beside them ("2 people and ALL AVAIL"; one named ⏎ * person keeps his callsign, "Ranger and ALL AVAIL") — ALL AVAIL stands for whoever is free on the day (D702), so it is ⏎ * nobody to count. The wording of the calendar's own delete question (ui/inputscal-model.ts everyoneIn); pinned equal | 5,4 |
| C0233 | raptor-port/src/ui/inputs.test.tsx | 487 | ui | test | his to change | await openRow(0) ⏎ expect(D('#inpEditSave'), 'it is his to change').toBeTruthy() ⏎ expect(D('#inpEditPerson'), 'no Person list for a member').toBeFalsy() | 3,5,13 |
| C0234 | raptor-port/src/ui/inputscal-model.ts | 147 | ui |  | his call | * people"; with a placeholder among them the count is of the NAMED people and the placeholder is said beside it, as on ⏎ * the bar ("3 people and ALL AVAIL"; one named person keeps his callsign, "Saber and ALL AVAIL") — ALL AVAIL stands ⏎ * for whoever is free on the day (D702), so it is nobody to count. */ | 5,4 |
| C0235 | raptor-port/src/ui/inputscal-model.ts | 232 | ui |  | his call | * named people and says '+ ALL AVAIL'" — ALL AVAIL stands for whoever is free on the day, D702, so it is nobody to ⏎ * count): "3 + ALL AVAIL · Meeting"; one named person beside it keeps his callsign, "Saber + ALL AVAIL · Meeting". */ ⏎ export function barText(it: BarItem, narrow: boolean): string { | 5,4 |
| C0236 | raptor-port/src/ui/inputslist.test.tsx | 403 | ui | test | the agent's reading | not a button (a tap opens the input, where "Answer…" is). And the DESKTOP List's "OIL?" button shows for an input of ⏎ SEVERAL people too. Shown to whoever may answer the question (the agent's reading, told to him): the same test the ⏎ input's own window puts on "Answer…" — state/perms.ts mayEditInput. 17 Oct 26 is a Saturday. */ | 1,3,5,13,4 |
| C0237 | raptor-port/src/ui/inputssettings.test.tsx | 8 | ui | test | for now | days, or a weekday of a number of weeks before. D654 / D655: members may file duties and commitments for other ⏎ people "for now" — one switch puts it back to admins only. D635: the icon is the app's own gear. D641: the window ⏎ drags and does not block the page. D675: the door to the day-types window reads "Calendar…". | 3,5,13,4 |
| C0238 | raptor-port/src/ui/latepub.test.tsx | 6 | ui | test | for now; provisional | · D178 — EVERY member input change after publishing (filed, edited, deleted, moved) is pending for the admin; ⏎ · D179 ("freeze everything for now", provisional) — medical and qualifications freeze too; ⏎ · D183, D184, D185 (26 Sep 26) — except what stays LIVE on the face: the dotted next-day crew-rest mark, a crew-rest | 2,3,5,13,4 |
| C0239 | raptor-port/src/ui/latepub.test.tsx | 409 | ui | test | the agent's reading | /* WHAT STAYS LIVE ON A PUBLISHED FACE (owner, 26 Sep 26): D183 the dotted "breaks tomorrow's crew rest" mark; D184 the ⏎ 7-day run warning "as well" — and, by the agent's reading, a crew-rest breach on the day itself; D185 "2 & 3 make it ⏎ live" — a lapsed qualification too, a medical downchit frozen still. Live means: drawn on the issued face from today's | 2,13,4 |
| C0240 | raptor-port/src/ui/logic-html.ts | 59 | ui |  | assumed | { g: 'Rows with no end time', items: [ ⏎ /* the assumed landing (D2046, D2047, D2053 — [WARN-WORDS-STANDALONE] piece B): its row, beside its neighbours */ ⏎ { name: 'A flight', keys: ['fltLen'], line: () => 'A flight with a take-off and no landing is taken to land this long after take-off. Conflicts, the tight turn, the debrief, crew rest, the long day, OIL and Insights hours count to that landing, and its warnings … | 1,10,4 |
| C0241 | raptor-port/src/ui/logic-html.ts | 106 | ui |  | assumed | `Rest runs from the end of the day before to the first thing today: his in-time or rally, his B where neither is typed, or anything earlier, such as a meeting.`, ⏎ /* D2046: a landing not typed is the assumed one, take-off plus the flight length (A flight); D2079: a standby shift ⏎ (D2055) or a standby template's desk (D2073, D2080) with no END ends nothing until its END is typed */ | 10,4 |
| C0242 | raptor-port/src/ui/logic-html.ts | 203 | ui |  | assumed | 'A flight runs from its in-time or rally, whichever is earlier (Default rally before take-off where neither is entered), to landing plus the debrief. With no landing typed, it lands at its assumed landing (A flight).', ⏎ /* D2046: a flight with no landing is the one row with no end time that earns — to its assumed landing */ ⏎ 'Any other row the scheduler adds with no times, or no end time, earns nothing, but a requ… | 10,4 |
| C0243 | raptor-port/src/ui/logic.test.tsx | 653-656 | ui | test | assumed | }) ⏎ /* CHANGED ON PURPOSE by D2046 (15 Nov 26): a landing not typed is the assumed one, take-off plus the flight length */ ⏎ it('D1990, D2046: a landing not typed ends the day at the assumed landing plus the debrief; a shift reports at its B or R when typed earlier', () => { ⏎ /* CHANGED ON PURPOSE by D2079 (16 Nov 26): the line no longer ends at "its written end." — the standby sentence follows */ ⏎ expect(how('cr… | 10,13,4 |
| C0244 | raptor-port/src/ui/logic.test.tsx | 661 | ui | test | the agent's reading | explanation says a standby shift, or a standby template's desk, with START and no END is left out until END is typed ⏎ (D2055, D2073, D2080 — the desk part names SC, AVALON and BB since D2080, the agent's reading told to him) */ ⏎ it('D2079: the crew-rest explanation says a standby shift or desk with START typed and END blank is left out until its END is typed', () => { | 10,13,4 |
| C0245 | raptor-port/src/ui/logic.test.tsx | 667-668 | ui | test | assumed | expect(how('oil')).toContain('Until its wave flies, a desk made from an AVALON or BB template earns only if switched on in OIL Earn. Once the wave flies, the desk earns by default.') ⏎ /* CHANGED ON PURPOSE by D2046: the line now ends with the assumed landing's sentence */ ⏎ expect(how('oil')).toContain('A flight runs from its in-time or rally, whichever is earlier (Default rally before take-off where neither is ent… | 1,10,13,4 |
| C0246 | raptor-port/src/ui/logic.test.tsx | 672-674 | ui | test | assumed | /* D2046, D2047 ([WARN-WORDS-STANDALONE] piece B): the new setting's row, in "Rows with no end time" before the sim */ ⏎ it('D2046: the assumed flight length has its row, "A flight", before "A sim", with its words', () => { ⏎ expect(lgSettings().find(g => g.g === 'Rows with no end time')!.items.map(s => s.name)).toEqual(['A flight', 'A sim', 'Any other row']) ⏎ expect(setting('A flight')).toBe('A flight with a take-… | 1,10,13,4 |
| C0247 | raptor-port/src/ui/oilclaimcrowd.test.tsx | 192 | ui | test | not ruled | points at the puck there is to tap. (What the name says of the COUNT on a row holding both is not pinned here — ⏎ reported with this re-expression, not ruled.) */ ⏎ for (const ppl of [['bane', 'allavail'], ['bane']]) { | 5,13 |
| C0248 | raptor-port/src/ui/OilDayList.tsx | 85 | ui |  | his call | } ⏎ /* the foot's quiet words: what Later does while a sign-off is held (`signer` — his callsign), else the bells' line */ ⏎ const footSaid = (signer: string, rows: number, belled: boolean): string => | 2,9,4 |
| C0249 | raptor-port/src/ui/oilmode.ts | 952 | ui |  | ASSUMED; Assumed | export const oilFromWords = (ver: any) => (ver && !isDraftVer(ver) ? OIL_FROM_ISSUED : OIL_FROM_LIVE) ⏎ /** THE ASSUMED LENGTH, AS SAID ([ALLAVAIL-OPEN-ROW], D360): the Logic tab's "Assumed length, no end time" in words — ⏎ * "an hour" at its default, "2 hours", "90 minutes". */ | 5,10 |
| C0250 | raptor-port/src/ui/oilmode.ts | 958 | ui |  | assumed | * 28 Sep 26: "need to say something like no oil worked out due end time to the admin"). One wording for the window's ⏎ * "Who earns OIL" half and the row's switch in OIL Earn mode: its crowd is counted over an assumed hour, but nobody is ⏎ * credited from a guessed time (D31). */ | 1,3 |
| C0251 | raptor-port/src/ui/oilmode.ts | 982 | ui |  | assumed | * data that arrived by copy before the refusal existed — so it is walked here ⏎ * rather than assumed impossible). A claim is named by WHAT IT IS, never by ⏎ * what is drawn in its cell — hand-pass finding 14, which produced history | 3 |
| C0252 | raptor-port/src/ui/oilscreenwords.test.ts | 39-41 | ui | test | assumed | though its row on the programme carries none (D932) */ ⏎ /* CHANGED ON PURPOSE by D2046 (16 Nov 26): a flight with no landing earns to its assumed landing, so the line now ⏎ says "Any other row", after the flight's own sentence */ ⏎ expect(all).toContain('With no landing typed, it lands at its assumed landing (A flight).') ⏎ expect(all).toContain('Any other row the scheduler adds with no times, or no end time, earns… | 13,4 |
| C0253 | raptor-port/src/ui/oilsign.test.tsx | 204 | ui | test | the agent’s reading | ⏎ it('a second input filed after Later is asked once more (the agent’s reading, told to him)', async () => { ⏎ signPick(SAT, 'cur', 'ignite'); await draw(); await click('odl-later') | 5,13 |
| C0254 | raptor-port/src/ui/oilsign.ts | 121 | ui |  | the agent's reading | /** SAVE, with a sign-off held: THE ANSWERS FIRST, THEN THE NAME (D2294) — an answer changes the day the signatures are ⏎ * bound to, so a name written before it would be cleared by it. Two steps of Undo, the name's first (the agent's reading, ⏎ * told to him: the answer is a change to the inputs, the name a change to the schedule's own record). False where the | 2,5,4 |
| C0255 | raptor-port/src/ui/oilworkstart.test.tsx | 68 | ui | test | his call | const FLYER = String((PEOPLE as any).bane.cs), DESK = String((PEOPLE as any).stiff.cs) ⏎ /* a man's line as the list prints it: his callsign, then what his OIL would go from and to */ ⏎ const moves = (who: string, from: string, to: string) => `${who} · OIL as published, under today's values${from} → ${to}` | 1,2,13,4 |
| C0256 | raptor-port/src/ui/onedoor-users.test.tsx | 179 | ui | test | his call | ⏎ it('D286 / D295: his callsign taken on the roster — the box offers the next free one; "Restore as …" does both', async () => { ⏎ await users() | 13 |
| C0257 | raptor-port/src/ui/onedoor-users.test.tsx | 355 | ui | test | his call | /* the break test of chat 26's check (8 Nov 26): an archived row's editor exists only while the row is open — drawn on ⏎ a closed row, every archived man would show his callsign box and buttons in the folded list */ ⏎ it('archived: a closed row shows no editor, before it is opened and after Cancel', async () => { | 13 |
| C0258 | raptor-port/src/ui/pendlist.ts | 535 | ui |  | assumed | other change has its own line, and what the day WILL earn is the working copy's own figure in OIL Earn. */ ⏎ /* …and the assumed flight length since D2046 — a block kept before it has none, so it reads today's and names nothing */ ⏎ const OIL_VALS = ['reportLead', 'debrief', 'oilFullMin', 'fltLen'] as const | 1,4 |
| C0259 | raptor-port/src/ui/PeoplePick.tsx | 48 | ui |  | reading of | ⏎ // eslint-disable-next-line react-doctor/no-high-complexity-react-function -- one picker in its two modes (one person, several), the placeholders and the finger's drag across the pucks share one set of props and refs; split, the drag's reading of what is picked and the lists it lights could drift apart, in the window every input is filed through ⏎ export function PeoplePick({ people, several, type, sansOnly, lock… | 5 |
| C0260 | raptor-port/src/ui/phmember.test.tsx | 362 | ui | test | his call | placeholder beside them, as the month's bar and the calendar's own delete question do (inputscal-model everyoneIn) */ ⏎ it('the people counted, the placeholder said beside them; one person keeps his callsign', async () => { ⏎ await boot() | 3,5,13 |
| C0261 | raptor-port/src/ui/placeholderdoors.test.tsx | 216 | ui | test | his to change | ⏎ it('a member files one (the switch on); it is his to change and delete, and nobody else\'s but an admin\'s', async () => { ⏎ await as('member') | 3,13 |
| C0262 | raptor-port/src/ui/placeholderdoors.test.tsx | 719 | ui | test | his to change | await openOn(r) ⏎ expect($('#inpEditSave'), 'not his to change for everyone').toBeNull() ⏎ await click(tid('inped-takeout')) | 13 |
| C0263 | raptor-port/src/ui/placeholderdoors.test.tsx | 775 | ui | test | his to change | await as('member') ⏎ expect(mayEditInput(live(r.iid)), 'the fixture: his own filing, his to change').toBe(true) ⏎ await openOn(r) | 3,5,13 |
| C0264 | raptor-port/src/ui/pubsweep.test.tsx | 591 | ui | test | assumed | Two copies of one rule is exactly where this app's publishing bugs live, ⏎ so the agreement is asserted directly rather than assumed. */ ⏎ /* the view page names its issued version through its picker (it has no green | 2,13 |
| C0265 | raptor-port/src/ui/quals.test.tsx | 338 | ui | test | his call | ⏎ /* D1510 (29 Oct 26): only an admin ticks Management — a member's own Management cell reads only, as his callsign does ⏎ (D218); every other cell of his row still ticks */ | 3,13 |
| C0266 | raptor-port/src/ui/quals.test.tsx | 405 | ui | test | the agent's reading | /* its "the help says where archive went" half went with the paragraph that said it (owner D935, 16 Oct 26 — the ⏎ paragraph under the row deleted whole; the agent's reading, told to him: this pin goes with it) */ ⏎ it('D310: no archive ✕ for an admin either — no column for it', async () => { | 3,13 |
| C0267 | raptor-port/src/ui/QualsPage.tsx | 823 | ui |  | reading of | } ⏎ }, [sdaActive]) // fixed for the page's life (asked of the browser once) — named so the listener's reading of it is plain ⏎ | 4 |
| C0268 | raptor-port/src/ui/sanscal-model.ts | 1 | ui |  | READING OF | /* THE SANS CALENDAR'S READING OF A DAY — pure: no DOM, no store writes (the build plan ⏎ docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5; owner D617, D626, D627, D642, D648). | 2,5,4 |
| C0269 | raptor-port/src/ui/sanscal-model.ts | 67 | ui |  | the agent's reading | * day question), and only while that date is still ahead — gone from it, as the drawing showed him. His view only: an ⏎ * admin, who may file for any SANS man on those days, sees the month as it was (the agent's readings, kept by him). */ ⏎ export function sansBeforeMine(iso: string, today: string, viewer: string \| null = me(), admin: boolean = isAdmin()): boolean { | 3,5,4 |
| C0270 | raptor-port/src/ui/schedule-tab.test.tsx | 395 | ui | test | reading of | const lastBox = () => boxesOf(dayEl()).at(-1)! ⏎ /* the route's own reading of "a control": a button, a box or anything the keyboard is let into, not a text box */ ⏎ const next = [...dayEl().querySelectorAll<HTMLElement>('button,input,textarea,select,a[href],[tabindex]')] | 5,13,4 |
| C0271 | raptor-port/src/ui/UsersPanel.tsx | 230 | ui |  | his call | ⏎ /* "Pilot · CAT C" / "WSO · CAT B" / "Personnel" — the seat and CAT under his callsign */ ⏎ function seatText(p: any): string { | 4 |
| C0272 | raptor-port/src/ui/UsersPanel.tsx | 258 | ui |  | his call | const roleWordOf = (a: Account \| undefined) => (a ? (isAdminAccount(a) ? 'Admin' : 'Member') : '') ⏎ /* the line under his callsign on his roster row — his sign-in, role, seat and CAT, a posting waiting, "you". A piece of ⏎ its own with the editor below (React Doctor no-high-complexity-react-function, 8 Nov 26); drawn exactly as before */ | 3,4 |
| C0273 | raptor-port/src/ui/weeknav.ts | 65 | ui |  | assumed | /** `v` shifted by `n` whole weeks (±7·n days), as a `dd/mm/yyyy` Monday. `v` ⏎ * is assumed to be a Monday already (every week key is); the shift preserves ⏎ * that. Unbounded — this is what makes the arrows continuous. */ | 4 |
| C0274 | raptor-port/src/ui/windowreads.test.tsx | 220 | ui | test | his to change | await openOn(rec) ⏎ expect($('#inpEditSave'), 'the input is not his to change').toBeNull() ⏎ expect(tid('oil-unanswered')!.querySelector('.inped-oilsum')!.textContent, 'he reads that it is unanswered').toBe('Not answered yet — 17 Oct') | 1,5,13 |
| C0275 | raptor-port/src/ui/windowreads.test.tsx | 244 | ui | test | his to change | expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['no OIL on its non-working day']) ⏎ expect(tid('oil-revise'), 'the input’s answer is not his to change').toBeNull() ⏎ expect(tid('oil-revise-own'), 'and he has none of his own (D762)').toBeNull() | 1,5,13,4 |

## List 2a — strings a person can read (W)

| Id | Screen (file) | Line | Kind | Text | Slice |
|---|---|---|---|---|---|
| W0001 | raptor-port/src/leavewar/LeaveWarPage.tsx | 149 | jsx-text | No leave period yet | 6 |
| W0002 | raptor-port/src/leavewar/LeaveWarPage.tsx | 152 | jsx-text | Create the first leave period — its name and dates. Nothing in it is open for bidding until you open dates. | 6 |
| W0003 | raptor-port/src/leavewar/LeaveWarPage.tsx | 153 | jsx-text | Create the first period | 6 |
| W0004 | raptor-port/src/leavewar/LeaveWarPage.tsx | 156 | jsx-text | An admin creates the leave period. It shows here as soon as it is made. | 6,3 |
| W0005 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 437 | attr:aria-label | Which requests to show | 6 |
| W0006 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 441 | jsx-text | Dates | 6 |
| W0007 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 448 | literal | Approve ${toApprove.length} — tap again | 6 |
| W0008 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 448 | literal | Approve all ${toApprove.length} | 6 |
| W0009 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 454 | jsx-text | Approvals | 6 |
| W0010 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 474 | jsx-text | Days | 6,4 |
| W0011 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 474 | jsx-text | LVE Bal | 6 |
| W0012 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 474 | jsx-text | Lowest Avail | 6,5 |
| W0013 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 474 | jsx-text | Placed | 6 |
| W0014 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 477 | jsx-text | Name | 6 |
| W0015 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 477 | jsx-text | Kind | 6 |
| W0016 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 482 | jsx-text | Nothing waiting for a decision. | 6 |
| W0017 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 483 | jsx-text | Nothing here for these dates. | 6 |
| W0018 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 494 | attr:aria-label | Also since you last looked | 6 |
| W0019 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 495 | jsx-text | · nothing to decide | 6 |
| W0020 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 545 | attr:aria-label | New | 6 |
| W0021 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 569 | jsx-text | SANS · not in Avail | 6,5 |
| W0022 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 644 | attr:aria-label | Back to Approvals | 6 |
| W0023 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 650 | jsx-text | Back ▴ | 6 |
| W0024 | raptor-port/src/leavewar/ui/ApprovalsPage.tsx | 651 | attr:aria-label | Close Approvals | 6 |
| W0025 | raptor-port/src/leavewar/ui/awardwords.ts | 21 | jsx-text | a.personId)).size | 6 |
| W0026 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 53 | jsx-text | k !== 'LVE') as Exclude | 7 |
| W0027 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 75 | literal | Type a figure | 7 |
| W0028 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 77 | literal | This change could not be saved. | 7 |
| W0029 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 326 | attr:aria-label | ${figWords(pend)} pending approval | 7 |
| W0030 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 357 | attr:aria-label | ${p.callsign}: open his leave | 7 |
| W0031 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 363 | attr:label | ${p.callsign} ${part === 'cf' ? 'LVE carried forward' : k === 'LVE' ? 'LVE App bal' : k} | 7 |
| W0032 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 366 | attr:aria-label | ${p.callsign} OIL ${figWords(d.oil)}: open his OIL | 7,1 |
| W0033 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 428 | jsx-text | [...(ref.current?.querySelectorAll | 7 |
| W0034 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 453 | attr:aria-label | Grade | 7 |
| W0035 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 590 | jsx-text | 0) t.querySelectorAll | 7 |
| W0036 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 687 | attr:aria-label | Show | 7 |
| W0037 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 688 | jsx-text | Balances | 7 |
| W0038 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 689 | jsx-text | Days taken | 7,4 |
| W0039 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 698 | attr:placeholder | Find a person | 7 |
| W0040 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 715 | jsx-text | Lock for members | 7,3 |
| W0041 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 725 | jsx-text | Locked by admin | 7,3 |
| W0042 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 749 | literal | DAYS TAKEN IN ${period.name} | 7,4 |
| W0043 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 754 | jsx-text | NAME · GRADE | 7 |
| W0044 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | APP BAL | 7 |
| W0045 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | CARRIED | 7 |
| W0046 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | PENDING | 7 |
| W0047 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | APPROVAL | 7 |
| W0048 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | WAR BAL | 7 |
| W0049 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 756 | jsx-text | OIL | 7,1 |
| W0050 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 773 | jsx-text | LVE | 7 |
| W0051 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 773 | jsx-text | OTHER LEAVE | 7 |
| W0052 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 775 | jsx-text | NAME | 7 |
| W0053 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 775 | jsx-text | GRADE · AUTO + LVE ON 1 JAN | 7 |
| W0054 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 776 | jsx-text | INCL. CARRIED FWD | 7 |
| W0055 | raptor-port/src/leavewar/ui/BalancesPage.tsx | 776 | jsx-text | PENDING APPROVAL | 7 |
| W0056 | raptor-port/src/leavewar/ui/belowzero.ts | 34 | literal | That takes ${named}. Tap the same leave again to go ahead. | 6 |
| W0057 | raptor-port/src/leavewar/ui/BidBits.tsx | 88 | attr:aria-label | More | 6 |
| W0058 | raptor-port/src/leavewar/ui/BidPicker.tsx | 92 | jsx-text | · change it on the Inputs page | 6,5 |
| W0059 | raptor-port/src/leavewar/ui/BidPicker.tsx | 270 | literal | The ${heldHalf === 'am' ? 'morning' : 'afternoon'} is ${codeInWords(heldType)}. Pick ${heldHalf === 'am' ? 'PM' : 'AM'} to place the ${heldHalf === 'am' ? 'afternoon' : 'morning'}. | 6 |
| W0060 | raptor-port/src/leavewar/ui/BidPicker.tsx | 401 | literal | Nothing was decided. ${o ? o.why : 'That could not be recorded'}. | 6 |
| W0061 | raptor-port/src/leavewar/ui/BidPicker.tsx | 410 | literal | None of those days holds a bid this screen can decide. | 6,4 |
| W0062 | raptor-port/src/leavewar/ui/BidPicker.tsx | 411 | literal | That could not be recorded — this day is not this screen’s to decide. | 6,4 |
| W0063 | raptor-port/src/leavewar/ui/BidPicker.tsx | 421 | literal | Type how many days | 6,4 |
| W0064 | raptor-port/src/leavewar/ui/BidPicker.tsx | 536 | literal | Nothing was filed: these days are not yours to change. | 6,4 |
| W0065 | raptor-port/src/leavewar/ui/BidPicker.tsx | 633 | literal | Nothing was deleted. ${why}. | 6 |
| W0066 | raptor-port/src/leavewar/ui/BidPicker.tsx | 646 | literal | Delete also takes ${callsign}’s OIL award (${awardDays(awards[0]!.days)}) — tap Delete again to go ahead. | 6,1,4 |
| W0067 | raptor-port/src/leavewar/ui/BidPicker.tsx | 647 | literal | Delete also takes ${awardsClause(awards, () => callsign)} — tap Delete again to go ahead. | 6 |
| W0068 | raptor-port/src/leavewar/ui/BidPicker.tsx | 702 | literal | Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs page. | 6,5 |
| W0069 | raptor-port/src/leavewar/ui/BidPicker.tsx | 730 | literal | None of those days could be ${verb}. They are ${why}. | 6,4 |
| W0070 | raptor-port/src/leavewar/ui/BidPicker.tsx | 743 | literal | This day holds several OIL awards — change them from the day's list | 6,1,4 |
| W0071 | raptor-port/src/leavewar/ui/BidPicker.tsx | 744 | literal | The OIL on this day — its reason, who gave it and how many days | 6,1,4 |
| W0072 | raptor-port/src/leavewar/ui/BidPicker.tsx | 744 | literal | Grant OIL — a day or half a day off in lieu, for any reason | 6,1,4 |
| W0073 | raptor-port/src/leavewar/ui/BidPicker.tsx | 764 | attr:label | Place a bid | 6 |
| W0074 | raptor-port/src/leavewar/ui/BidPicker.tsx | 772 | attr:aria-label | Cancel | 6 |
| W0075 | raptor-port/src/leavewar/ui/BidPicker.tsx | 802 | attr:aria-label | Actions | 6 |
| W0076 | raptor-port/src/leavewar/ui/BidPicker.tsx | 814 | literal | Approved — tap again to send it back to waiting | 6 |
| W0077 | raptor-port/src/leavewar/ui/BidPicker.tsx | 823 | literal | Refused — tap again to send it back to waiting | 6,3 |
| W0078 | raptor-port/src/leavewar/ui/BidPicker.tsx | 861 | literal | Pick a range | 6 |
| W0079 | raptor-port/src/leavewar/ui/BidPicker.tsx | 861 | literal | Just this day | 6,4 |
| W0080 | raptor-port/src/leavewar/ui/BidPicker.tsx | 864 | attr:aria-label | Duration | 6 |
| W0081 | raptor-port/src/leavewar/ui/BidPicker.tsx | 902 | attr:aria-label | What it acts on | 6 |
| W0082 | raptor-port/src/leavewar/ui/BidPicker.tsx | 958 | attr:aria-label | Which leave | 6 |
| W0083 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1012 | jsx-text | Remove | 6 |
| W0084 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1019 | attr:aria-label | Reason | 6 |
| W0085 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1019 | attr:placeholder | why — any reason | 6 |
| W0086 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1024 | attr:aria-label | Given by | 6 |
| W0087 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1024 | attr:placeholder | given by (optional) | 6 |
| W0088 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1045 | jsx-line | Same shape as its twin above, folded behind one button for the same | 6 |
| W0089 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1053 | jsx-text | PI from | 6 |
| W0090 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1058 | attr:label | Post ${callsign} in from | 6 |
| W0091 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1082 | jsx-text | PO from | 6 |
| W0092 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1091 | attr:label | Post ${callsign} out from | 6 |
| W0093 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1106 | literal | Tap again to delete | 6 |
| W0094 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1122 | attr:label | Delete ${callsign}? | 6 |
| W0095 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1126 | jsx-text | Delete | 6 |
| W0096 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1138 | jsx-line | The app's OWN credit answers them from the schedule it was earned | 7,4 |
| W0097 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1145 | jsx-line | An AWARD answers them from what the admin typed, and +OIL above | 6,1,3 |
| W0098 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1152 | jsx-line | For a few hours an admin tapping a day the schedule had earned on | 6,3,4 |
| W0099 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1160 | jsx-text | Where it came from | 6 |
| W0100 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1163 | literal | Earned off a duty input that was accepted — change that input, not the schedule. | 6,5,4 |
| W0101 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1164 | literal | Earned off the published schedule — change the schedule and the OIL follows. | 6,1,2,4 |
| W0102 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1171 | literal | Worked this day | 6,4 |
| W0103 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1182 | jsx-text | Entered by | 6 |
| W0104 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1187 | jsx-text | Days | 6,4 |
| W0105 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1250 | literal | OIL the app credited | 7,1 |
| W0106 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1250 | literal | Leave filed on the Inputs page | 6,5 |
| W0107 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1258 | attr:aria-label | Close | 6 |
| W0108 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1276 | literal | Filed on the Inputs page, so it is already approved — change it there, not here. | 6,5 |
| W0109 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1280 | literal | Change it on the Inputs page, not here. | 6,5 |
| W0110 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1281 | literal | Filed on the Inputs page — change it there, not here. | 6,5 |
| W0111 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1286 | jsx-text | Document | 6 |
| W0112 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1356 | attr:label | Your OIL award | 6,1 |
| W0113 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1367 | jsx-text | Given by an admin — only an admin can change it. | 6,3 |
| W0114 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1453 | attr:label | Posted out | 6 |
| W0115 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1467 | attr:label | Move ${callsign}'s post-out date | 6 |
| W0116 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1501 | literal | Delete Hex now? | 6 |
| W0117 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1502 | literal | Tap again to delete Hex | 6 |
| W0118 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1506 | literal | Delete ${callsign} now? | 6 |
| W0119 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1587 | attr:label | Posted in | 6 |
| W0120 | raptor-port/src/leavewar/ui/BidPicker.tsx | 1608 | attr:label | Move ${callsign}'s post-in date | 6 |
| W0121 | raptor-port/src/leavewar/ui/bubblewords.ts | 8 | jsx-text | ; drawn: Set | 6 |
| W0122 | raptor-port/src/leavewar/ui/bubblewords.ts | 43 | literal | This overseas duty | 6,4 |
| W0123 | raptor-port/src/leavewar/ui/Chrome.tsx | 54 | literal | Decide the bid | 6 |
| W0124 | raptor-port/src/leavewar/ui/Chrome.tsx | 55 | literal | Change the approved leave | 6 |
| W0125 | raptor-port/src/leavewar/ui/Chrome.tsx | 56 | literal | Change the leave on Inputs | 6,5 |
| W0126 | raptor-port/src/leavewar/ui/Chrome.tsx | 63 | literal | Decide it in Approvals | 6 |
| W0127 | raptor-port/src/leavewar/ui/Chrome.tsx | 179 | attr:aria-label | Leave War | 6 |
| W0128 | raptor-port/src/leavewar/ui/Chrome.tsx | 189 | literal | OIL balances, credits and history | 7,1 |
| W0129 | raptor-port/src/leavewar/ui/Chrome.tsx | 189 | literal | Leave waiting for a decision | 6 |
| W0130 | raptor-port/src/leavewar/ui/Chrome.tsx | 189 | literal | Everyone’s balances and grades | 7 |
| W0131 | raptor-port/src/leavewar/ui/Chrome.tsx | 189 | literal | The leave grid | 6 |
| W0132 | raptor-port/src/leavewar/ui/Chrome.tsx | 193 | jsx-text | : t === 'approvals' ? | 6 |
| W0133 | raptor-port/src/leavewar/ui/Chrome.tsx | 193 | jsx-text | : t === 'balances' ? | 7 |
| W0134 | raptor-port/src/leavewar/ui/Chrome.tsx | 195 | attr:aria-label | ${waiting} pending | 6 |
| W0135 | raptor-port/src/leavewar/ui/Chrome.tsx | 205 | attr:title | Settings — counters, event rows, roster groups and the order of the grid | 7 |
| W0136 | raptor-port/src/leavewar/ui/Chrome.tsx | 206 | attr:aria-label | Settings | 6 |
| W0137 | raptor-port/src/leavewar/ui/Chrome.tsx | 214 | jsx-text | View | 6 |
| W0138 | raptor-port/src/leavewar/ui/Chrome.tsx | 221 | attr:aria-label | View — which leave period | 6 |
| W0139 | raptor-port/src/leavewar/ui/Chrome.tsx | 230 | jsx-text | + New period | 6 |
| W0140 | raptor-port/src/leavewar/ui/Chrome.tsx | 451 | jsx-line | W row is below its rule — red only, amber is not counted — and a tap lists them, a tap on a line takes the grid | 6 |
| W0141 | raptor-port/src/leavewar/ui/Chrome.tsx | 459 | literal | Hide the manning counts | 6 |
| W0142 | raptor-port/src/leavewar/ui/Chrome.tsx | 459 | literal | Show the manning counts | 6 |
| W0143 | raptor-port/src/leavewar/ui/Chrome.tsx | 472 | attr:aria-label | ${redDays} red day${redDays === 1 ? '' : 's'}: show the days that break a manning rule | 6,4 |
| W0144 | raptor-port/src/leavewar/ui/Chrome.tsx | 473 | attr:title | Show the days that break a manning rule | 6,4 |
| W0145 | raptor-port/src/leavewar/ui/Chrome.tsx | 475 | jsx-text | red | 6 |
| W0146 | raptor-port/src/leavewar/ui/Chrome.tsx | 485 | literal | Choose the dates open for bidding | 6 |
| W0147 | raptor-port/src/leavewar/ui/Chrome.tsx | 485 | literal | The dates open for bidding | 6 |
| W0148 | raptor-port/src/leavewar/ui/Chrome.tsx | 495 | jsx-text | Bidding closed | 6 |
| W0149 | raptor-port/src/leavewar/ui/Chrome.tsx | 502 | jsx-line | Raptor topbar already shows the Admin/Member badge, and a toggle | 6,3,10 |
| W0150 | raptor-port/src/leavewar/ui/Chrome.tsx | 512 | attr:aria-label | Under-manned days | 6,4 |
| W0151 | raptor-port/src/leavewar/ui/Chrome.tsx | 515 | jsx-text | Days breaking a manning rule | 6,4 |
| W0152 | raptor-port/src/leavewar/ui/Chrome.tsx | 548 | attr:title | What the colours and marks on the grid mean | 6 |
| W0153 | raptor-port/src/leavewar/ui/Chrome.tsx | 560 | attr:aria-label | What the colours and marks mean | 6 |
| W0154 | raptor-port/src/leavewar/ui/Chrome.tsx | 563 | jsx-text | What the grid is telling you | 6 |
| W0155 | raptor-port/src/leavewar/ui/Chrome.tsx | 569 | jsx-text | The colour: what kind | 6 |
| W0156 | raptor-port/src/leavewar/ui/Chrome.tsx | 570 | jsx-text | Local leave | 6 |
| W0157 | raptor-port/src/leavewar/ui/Chrome.tsx | 571 | jsx-text | Overseas leave | 6 |
| W0158 | raptor-port/src/leavewar/ui/Chrome.tsx | 573 | jsx-text | OIL taken: time off spent | 6,1 |
| W0159 | raptor-port/src/leavewar/ui/Chrome.tsx | 574 | jsx-text | OIL given: FO a day, HO half a day; a star, the app credited it | 7,1,4 |
| W0160 | raptor-port/src/leavewar/ui/Chrome.tsx | 575 | jsx-text | Other leave: CCL, FCL, PL, CL, EL | 6 |
| W0161 | raptor-port/src/leavewar/ui/Chrome.tsx | 576 | jsx-text | Course | 6 |
| W0162 | raptor-port/src/leavewar/ui/Chrome.tsx | 577 | jsx-text | Overseas duty | 6,4 |
| W0163 | raptor-port/src/leavewar/ui/Chrome.tsx | 580 | jsx-text | Under Unavailable on the schedule: OTH, ATCH and the rest, out of the manning | 6,5,4 |
| W0164 | raptor-port/src/leavewar/ui/Chrome.tsx | 581 | jsx-text | Medical: B, C, OML, HL | 7 |
| W0165 | raptor-port/src/leavewar/ui/Chrome.tsx | 582 | jsx-text | The fill: where it stands | 6 |
| W0166 | raptor-port/src/leavewar/ui/Chrome.tsx | 583 | jsx-text | Approved | 6 |
| W0167 | raptor-port/src/leavewar/ui/Chrome.tsx | 584 | jsx-text | Pending a decision | 6 |
| W0168 | raptor-port/src/leavewar/ui/Chrome.tsx | 585 | jsx-text | Refused | 6,3 |
| W0169 | raptor-port/src/leavewar/ui/Chrome.tsx | 586 | jsx-text | The size: how much of the day | 6,4 |
| W0170 | raptor-port/src/leavewar/ui/Chrome.tsx | 587 | jsx-text | A whole day | 6,4 |
| W0171 | raptor-port/src/leavewar/ui/Chrome.tsx | 588 | jsx-text | Morning (AM) | 6 |
| W0172 | raptor-port/src/leavewar/ui/Chrome.tsx | 589 | jsx-text | Afternoon (PM) | 6 |
| W0173 | raptor-port/src/leavewar/ui/Chrome.tsx | 592 | jsx-text | Two entries on one day | 6,4 |
| W0174 | raptor-port/src/leavewar/ui/Chrome.tsx | 594 | jsx-text | The dates | 6 |
| W0175 | raptor-port/src/leavewar/ui/Chrome.tsx | 595 | jsx-text | Open for bidding | 6 |
| W0176 | raptor-port/src/leavewar/ui/Chrome.tsx | 596 | jsx-text | Not open for bidding | 6 |
| W0177 | raptor-port/src/leavewar/ui/Chrome.tsx | 597 | jsx-text | The left edge: where it came from | 6 |
| W0178 | raptor-port/src/leavewar/ui/Chrome.tsx | 598 | jsx-text | Filed on the Inputs page: change it there, not here | 6,5 |
| W0179 | raptor-port/src/leavewar/ui/Chrome.tsx | 600 | jsx-text | Moved here from another day | 6,4 |
| W0180 | raptor-port/src/leavewar/ui/Chrome.tsx | 605 | jsx-text | Marks on a day | 6,4 |
| W0181 | raptor-port/src/leavewar/ui/Chrome.tsx | 606 | jsx-text | CSE | 6 |
| W0182 | raptor-port/src/leavewar/ui/Chrome.tsx | 606 | jsx-text | Two whole days: side by side, read bottom to top | 6,4 |
| W0183 | raptor-port/src/leavewar/ui/Chrome.tsx | 607 | jsx-text | More on this day — tap to see every entry | 6,4 |
| W0184 | raptor-port/src/leavewar/ui/Chrome.tsx | 608 | jsx-text | Something on this day needs an admin — tap to see | 6,3,4 |
| W0185 | raptor-port/src/leavewar/ui/Chrome.tsx | 609 | jsx-text | His last day in the squadron | 6,3,4 |
| W0186 | raptor-port/src/leavewar/ui/Chrome.tsx | 610 | jsx-text | Leave after a posting-out — not counted for manning | 6 |
| W0187 | raptor-port/src/leavewar/ui/Chrome.tsx | 614 | jsx-text | The figure beside each name | 6 |
| W0188 | raptor-port/src/leavewar/ui/Chrome.tsx | 615 | jsx-text | LVE left: local and overseas leave | 6 |
| W0189 | raptor-port/src/leavewar/ui/Chrome.tsx | 616 | jsx-text | Red with a minus: below zero | 6 |
| W0190 | raptor-port/src/leavewar/ui/clashwhat.ts | 14 | literal | Weekend/PH work earns ${c.inputShown ?? c.inputCode}, but the day holds ${held} | 6,5,4 |
| W0191 | raptor-port/src/leavewar/ui/clashwhat.ts | 15 | literal | The input is ${c.inputShown ?? c.inputCode}, but the bid is ${held} | 6,5 |
| W0192 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 26 | literal | Bidding is closed. To change your leave, seek management’s approval, then file it on the Inputs page. Your approved leave updates here by itself. | 6,5 |
| W0193 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 27 | literal | Your bid is pending a decision. Delete it if you no longer want it. | 6 |
| W0194 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 48 | literal | Nothing was filed on this day. | 6,4 |
| W0195 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 65 | literal | Your pending bid | 6 |
| W0196 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 65 | literal | Bidding is closed | 6 |
| W0197 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 69 | attr:aria-label | Close | 6 |
| W0198 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 75 | jsx-text | Your bid | 6 |
| W0199 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 77 | literal | LL (AM) · pending | 6 |
| W0200 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 77 | literal | LL · pending | 6 |
| W0201 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 96 | jsx-text | Selected | 6 |
| W0202 | raptor-port/src/leavewar/ui/ClosedNoteSheet.tsx | 115 | jsx-line | Open the Inputs page | 6,5 |
| W0203 | raptor-port/src/leavewar/ui/CounterForm.tsx | 150 | jsx-text | Crew | 7,4 |
| W0204 | raptor-port/src/leavewar/ui/CounterForm.tsx | 156 | jsx-text | CAT | 7 |
| W0205 | raptor-port/src/leavewar/ui/CounterForm.tsx | 162 | literal | Ticked CATs are the ones counted — tap for "everyone except" | 7 |
| W0206 | raptor-port/src/leavewar/ui/CounterForm.tsx | 162 | literal | Ticked CATs are EXCLUDED — tap to count only them | 7 |
| W0207 | raptor-port/src/leavewar/ui/CounterForm.tsx | 180 | jsx-text | Holding | 7 |
| W0208 | raptor-port/src/leavewar/ui/CounterForm.tsx | 194 | jsx-text | Without | 7 |
| W0209 | raptor-port/src/leavewar/ui/CounterForm.tsx | 327 | attr:aria-label | Close | 7 |
| W0210 | raptor-port/src/leavewar/ui/CounterForm.tsx | 331 | jsx-text | Name | 7 |
| W0211 | raptor-port/src/leavewar/ui/CounterForm.tsx | 336 | attr:placeholder | e.g. NVG PILOTS | 7 |
| W0212 | raptor-port/src/leavewar/ui/CounterForm.tsx | 345 | jsx-text | Count | 7 |
| W0213 | raptor-port/src/leavewar/ui/CounterForm.tsx | 360 | jsx-line | Sets / teams | 7 |
| W0214 | raptor-port/src/leavewar/ui/CounterForm.tsx | 364 | literal | Adds up everyone matching the picks below. | 7 |
| W0215 | raptor-port/src/leavewar/ui/CounterForm.tsx | 365 | literal | Counts complete sets — every slot filled by a different person. | 7 |
| W0216 | raptor-port/src/leavewar/ui/CounterForm.tsx | 391 | jsx-text | of… | 7 |
| W0217 | raptor-port/src/leavewar/ui/CounterForm.tsx | 396 | attr:title | Remove this slot | 7 |
| W0218 | raptor-port/src/leavewar/ui/CounterForm.tsx | 416 | literal | Add another slot to the team | 7 |
| W0219 | raptor-port/src/leavewar/ui/CounterForm.tsx | 423 | jsx-text | Show | 7 |
| W0220 | raptor-port/src/leavewar/ui/CounterForm.tsx | 438 | jsx-line | People in them | 7 |
| W0221 | raptor-port/src/leavewar/ui/CounterForm.tsx | 441 | literal | SC duty still counts | 7,4 |
| W0222 | raptor-port/src/leavewar/ui/CounterForm.tsx | 446 | jsx-line | A stored `presence: true` on an old rule still loads and is still | 7 |
| W0223 | raptor-port/src/leavewar/ui/CounterForm.tsx | 455 | jsx-text | Amber below | 7 |
| W0224 | raptor-port/src/leavewar/ui/CounterForm.tsx | 462 | jsx-text | Red below | 7 |
| W0225 | raptor-port/src/leavewar/ui/CounterForm.tsx | 475 | jsx-text | Amber | 7 |
| W0226 | raptor-port/src/leavewar/ui/CounterForm.tsx | 477 | jsx-text | when under Required | 7 |
| W0227 | raptor-port/src/leavewar/ui/CounterForm.tsx | 480 | attr:placeholder | none | 7 |
| W0228 | raptor-port/src/leavewar/ui/CounterForm.tsx | 480 | attr:aria-label | Amber: a number above or below Required | 7 |
| W0229 | raptor-port/src/leavewar/ui/CounterForm.tsx | 485 | jsx-text | Red | 7 |
| W0230 | raptor-port/src/leavewar/ui/CounterForm.tsx | 490 | attr:aria-label | Red: a number above or below Required | 7 |
| W0231 | raptor-port/src/leavewar/ui/CounterForm.tsx | 495 | jsx-text | Red is set at or above amber, so amber never shows. | 7 |
| W0232 | raptor-port/src/leavewar/ui/CounterForm.tsx | 498 | jsx-text | Enter each as a number above or below Required, like + 2 or − 1. | 7 |
| W0233 | raptor-port/src/leavewar/ui/CounterForm.tsx | 505 | jsx-line | SANS people are never counted here. The SANS calendar reads this row, so it cannot be deleted. | 7,5 |
| W0234 | raptor-port/src/leavewar/ui/CounterForm.tsx | 531 | jsx-text | Cancel | 7 |
| W0235 | raptor-port/src/leavewar/ui/CountRows.tsx | 134 | attr:title | What does ${label.get(ruleId)} count? | 6 |
| W0236 | raptor-port/src/leavewar/ui/CountRows.tsx | 162 | attr:title | Drag to move ${label.get(ruleId)} | 6 |
| W0237 | raptor-port/src/leavewar/ui/CountRows.tsx | 172 | jsx-line | The cell is otherwise empty and aligns the column — in Rearrange | 6 |
| W0238 | raptor-port/src/leavewar/ui/CountRows.tsx | 186 | attr:title | Delete this counter — Undo brings it back | 7 |
| W0239 | raptor-port/src/leavewar/ui/CountRows.tsx | 187 | attr:aria-label | Delete the ${label.get(ruleId)} counter | 7 |
| W0240 | raptor-port/src/leavewar/ui/CountRows.tsx | 202 | attr:title | ${label.get(ruleId)}: ${show(r.have)} available, amber ${r.amber}, red ${r.red} | 6,5 |
| W0241 | raptor-port/src/leavewar/ui/CreditForm.tsx | 48 | attr:label | Date | 7 |
| W0242 | raptor-port/src/leavewar/ui/CreditForm.tsx | 89 | literal | Type the days — 2 adds, -2 subtracts | 7,4 |
| W0243 | raptor-port/src/leavewar/ui/CreditForm.tsx | 109 | literal | Subtracting — tap to add instead | 7 |
| W0244 | raptor-port/src/leavewar/ui/CreditForm.tsx | 109 | literal | Adding — tap to subtract instead | 7 |
| W0245 | raptor-port/src/leavewar/ui/CreditForm.tsx | 118 | attr:placeholder | days | 7,4 |
| W0246 | raptor-port/src/leavewar/ui/CreditForm.tsx | 120 | attr:aria-label | Days — 2 or +2 adds, -2 subtracts | 7,4 |
| W0247 | raptor-port/src/leavewar/ui/CreditForm.tsx | 131 | attr:placeholder | reason | 7 |
| W0248 | raptor-port/src/leavewar/ui/CreditForm.tsx | 131 | attr:aria-label | Reason | 7 |
| W0249 | raptor-port/src/leavewar/ui/CreditForm.tsx | 134 | attr:placeholder | given by (optional) | 7 |
| W0250 | raptor-port/src/leavewar/ui/CreditForm.tsx | 134 | attr:aria-label | Given by | 7 |
| W0251 | raptor-port/src/leavewar/ui/CreditForm.tsx | 136 | jsx-text | Save | 7 |
| W0252 | raptor-port/src/leavewar/ui/CreditForm.tsx | 137 | attr:aria-label | Cancel | 7 |
| W0253 | raptor-port/src/leavewar/ui/DayList.tsx | 171 | literal | Couldn’t change that | 6,4 |
| W0254 | raptor-port/src/leavewar/ui/DayList.tsx | 217 | attr:title | Approved — tap again to send it back to waiting | 6,4 |
| W0255 | raptor-port/src/leavewar/ui/DayList.tsx | 218 | jsx-text | Approved | 6,4 |
| W0256 | raptor-port/src/leavewar/ui/DayList.tsx | 219 | jsx-text | Refuse | 6,3,4 |
| W0257 | raptor-port/src/leavewar/ui/DayList.tsx | 250 | jsx-text | Approve | 6,4 |
| W0258 | raptor-port/src/leavewar/ui/DayList.tsx | 300 | jsx-text | Edit… | 6,4 |
| W0259 | raptor-port/src/leavewar/ui/DayList.tsx | 304 | literal | From a duty input that was accepted. | 6,5,4 |
| W0260 | raptor-port/src/leavewar/ui/DayList.tsx | 305 | literal | From the published schedule. | 6,2,4 |
| W0261 | raptor-port/src/leavewar/ui/DayList.tsx | 317 | jsx-text | OK, seen | 6,4 |
| W0262 | raptor-port/src/leavewar/ui/DayList.tsx | 343 | attr:label | ${callsign} — ${dayLabel(date)} | 6,4 |
| W0263 | raptor-port/src/leavewar/ui/DayList.tsx | 347 | attr:aria-label | Close | 6,4 |
| W0264 | raptor-port/src/leavewar/ui/DayList.tsx | 363 | literal | Your ${liveBids.join(' and ')} ${liveBids.length > 1 ? 'bids are' : 'bid is'} still live — something else on this day covers the same time, so an admin has to decide between them. Nothing has been thrown out. | 6,3,4 |
| W0265 | raptor-port/src/leavewar/ui/DayList.tsx | 365 | literal | Two things on this day cover the same time. An admin has to decide between them — nothing has been thrown out. | 6,3,4 |
| W0266 | raptor-port/src/leavewar/ui/DayList.tsx | 366 | literal | Two of these can’t both stand on the same time — an admin needs to change one. | 6,3,4 |
| W0267 | raptor-port/src/leavewar/ui/DayList.tsx | 397 | jsx-line | Read-only here by construction: nothing on a Raptor-owned day is | 6,4 |
| W0268 | raptor-port/src/leavewar/ui/DayList.tsx | 415 | jsx-text | Reason | 6,4 |
| W0269 | raptor-port/src/leavewar/ui/DayList.tsx | 417 | literal | Worked this day | 6,4 |
| W0270 | raptor-port/src/leavewar/ui/DayList.tsx | 421 | jsx-text | Given by | 6,4 |
| W0271 | raptor-port/src/leavewar/ui/DayList.tsx | 427 | jsx-text | Entered by | 6,4 |
| W0272 | raptor-port/src/leavewar/ui/DayList.tsx | 433 | attr:placeholder | Why it was given | 6,4 |
| W0273 | raptor-port/src/leavewar/ui/DayList.tsx | 435 | attr:aria-label | Days | 6,4 |
| W0274 | raptor-port/src/leavewar/ui/DayList.tsx | 442 | literal | Type how many days | 6,4 |
| W0275 | raptor-port/src/leavewar/ui/DayList.tsx | 446 | jsx-text | Save | 6,4 |
| W0276 | raptor-port/src/leavewar/ui/DayPanel.tsx | 76 | attr:aria-label | The day before | 6,4 |
| W0277 | raptor-port/src/leavewar/ui/DayPanel.tsx | 77 | attr:aria-label | The day after | 6,4 |
| W0278 | raptor-port/src/leavewar/ui/DayPanel.tsx | 80 | jsx-text | No leave period covers this date | 6,4 |
| W0279 | raptor-port/src/leavewar/ui/DayPanel.tsx | 81 | jsx-text | Not open for bidding | 6,4 |
| W0280 | raptor-port/src/leavewar/ui/EventRows.tsx | 167 | jsx-text | : (editable ? | 6 |
| W0281 | raptor-port/src/leavewar/ui/EventSheet.tsx | 88 | literal | Public holiday · work on it earns OIL | 6,1,4 |
| W0282 | raptor-port/src/leavewar/ui/EventSheet.tsx | 89 | literal | Off day · no OIL | 6,1,4 |
| W0283 | raptor-port/src/leavewar/ui/EventSheet.tsx | 90 | literal | No leave · heads-up only | 6 |
| W0284 | raptor-port/src/leavewar/ui/EventSheet.tsx | 94 | literal | Work on it earns OIL | 6,1 |
| W0285 | raptor-port/src/leavewar/ui/EventSheet.tsx | 95 | literal | No OIL for work on it | 6,1 |
| W0286 | raptor-port/src/leavewar/ui/EventSheet.tsx | 96 | literal | Heads-up only · never blocks a bid | 6 |
| W0287 | raptor-port/src/leavewar/ui/EventSheet.tsx | 97 | literal | A working commitment | 6 |
| W0288 | raptor-port/src/leavewar/ui/EventSheet.tsx | 98 | literal | Just a note · no colour | 6 |
| W0289 | raptor-port/src/leavewar/ui/EventSheet.tsx | 253 | literal | Pick a preset, or type a name. | 6 |
| W0290 | raptor-port/src/leavewar/ui/EventSheet.tsx | 264 | literal | “${defs[named]!.name}” is a preset — pick it above, or choose its kind here. | 6 |
| W0291 | raptor-port/src/leavewar/ui/EventSheet.tsx | 271 | literal | Pick its day — or its first and last day — on the calendar. | 6,4 |
| W0292 | raptor-port/src/leavewar/ui/EventSheet.tsx | 276 | literal | Every Event row is already used on those dates — add an Event row in the Leave War’s ⚙ Settings, then try again. | 6 |
| W0293 | raptor-port/src/leavewar/ui/EventSheet.tsx | 318 | attr:label | Event presets | 6 |
| W0294 | raptor-port/src/leavewar/ui/EventSheet.tsx | 320 | jsx-text | PRESETS | 6 |
| W0295 | raptor-port/src/leavewar/ui/EventSheet.tsx | 321 | jsx-text | name · on grid · kind | 6 |
| W0296 | raptor-port/src/leavewar/ui/EventSheet.tsx | 322 | attr:aria-label | Back | 6 |
| W0297 | raptor-port/src/leavewar/ui/EventSheet.tsx | 340 | attr:aria-label | Name of event type ${i + 1} | 6 |
| W0298 | raptor-port/src/leavewar/ui/EventSheet.tsx | 358 | attr:aria-label | What the grid prints for ${d.name} | 6 |
| W0299 | raptor-port/src/leavewar/ui/EventSheet.tsx | 383 | attr:aria-label | Delete ${d.name} | 6 |
| W0300 | raptor-port/src/leavewar/ui/EventSheet.tsx | 394 | jsx-line | Reset to standard | 6 |
| W0301 | raptor-port/src/leavewar/ui/EventSheet.tsx | 406 | attr:label | Edit event | 6 |
| W0302 | raptor-port/src/leavewar/ui/EventSheet.tsx | 413 | attr:aria-label | Cancel | 6 |
| W0303 | raptor-port/src/leavewar/ui/EventSheet.tsx | 419 | jsx-text | Presets | 6 |
| W0304 | raptor-port/src/leavewar/ui/EventSheet.tsx | 446 | jsx-text | Name | 6 |
| W0305 | raptor-port/src/leavewar/ui/EventSheet.tsx | 447 | jsx-text | On grid | 6 |
| W0306 | raptor-port/src/leavewar/ui/EventSheet.tsx | 452 | literal | Type a name… | 6 |
| W0307 | raptor-port/src/leavewar/ui/EventSheet.tsx | 495 | attr:aria-label | Kind | 6 |
| W0308 | raptor-port/src/leavewar/ui/EventSheet.tsx | 540 | jsx-line | One merged bar | 6 |
| W0309 | raptor-port/src/leavewar/ui/EventSheet.tsx | 547 | jsx-line | Repeat each day | 6,4 |
| W0310 | raptor-port/src/leavewar/ui/EventSheet.tsx | 617 | attr:placeholder | New preset… | 6 |
| W0311 | raptor-port/src/leavewar/ui/EventSheet.tsx | 618 | attr:aria-label | New preset name | 6 |
| W0312 | raptor-port/src/leavewar/ui/EventSheet.tsx | 628 | attr:aria-label | What the grid prints for the new preset | 6 |
| W0313 | raptor-port/src/leavewar/ui/EventSheet.tsx | 647 | attr:aria-label | Add event type | 6 |
| W0314 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 77 | literal | Delete — sure? | 6 |
| W0315 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 185 | literal | Delete ${armedLine.text}, ${whenSaid(armedLine.from, armedLine.to)}? Press again to delete. | 6 |
| W0316 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 228 | attr:aria-label | Edit ${l.text}, ${when} | 6 |
| W0317 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 228 | attr:title | Edit | 6 |
| W0318 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 231 | literal | Delete ${l.text}, ${when} — press again to delete | 6 |
| W0319 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 231 | literal | Press again to delete | 6 |
| W0320 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 242 | attr:label | Events | 6 |
| W0321 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 244 | jsx-text | EVENTS | 6 |
| W0322 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 246 | attr:aria-label | Close | 6 |
| W0323 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 249 | attr:title | Add an event — pick its day or days | 6,4 |
| W0324 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 249 | jsx-text | ＋ Event | 6 |
| W0325 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 250 | jsx-text | Edit presets | 6 |
| W0326 | raptor-port/src/leavewar/ui/EventsSheet.tsx | 269 | jsx-text | Undo | 6 |
| W0327 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 169 | literal | This change could not be saved. | 6 |
| W0328 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 221 | attr:aria-label | Apply to | 6 |
| W0329 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 222 | jsx-text | This day | 6,4 |
| W0330 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 225 | literal | A running figure skips weekends, public holidays and Off days | 6,4 |
| W0331 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 243 | attr:aria-label | Number pad — ${label} | 6 |
| W0332 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 252 | attr:aria-label | Previous flying day | 6,4 |
| W0333 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 253 | attr:aria-label | Next flying day | 6,4 |
| W0334 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 254 | jsx-text | Done | 6 |
| W0335 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 262 | attr:aria-label | Delete the last digit | 6 |
| W0336 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | Enter | 6 |
| W0337 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | next day | 6,4 |
| W0338 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | Tab | 6 |
| W0339 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | the other seat | 6,4 |
| W0340 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | Esc | 6 |
| W0341 | raptor-port/src/leavewar/ui/FlyEdit.tsx | 283 | jsx-text | leave it as it was | 6 |
| W0342 | raptor-port/src/leavewar/ui/flyeditparts.ts | 28 | jsx-text | floor ? Math.min(foot - floor, r.top - 64) : r.top | 6 |
| W0343 | raptor-port/src/leavewar/ui/FlyRows.tsx | 93 | literal | A no-fly day needs nobody — change the day in Days | 6,4 |
| W0344 | raptor-port/src/leavewar/ui/FlyRows.tsx | 345 | attr:title | Rename ${names[row.id].name} | 6 |
| W0345 | raptor-port/src/leavewar/ui/FlyRows.tsx | 354 | attr:title | Rename ${names[row.id].name}, change who it counts, or set its amber and red | 6 |
| W0346 | raptor-port/src/leavewar/ui/FlyRows.tsx | 396 | attr:aria-label | ${s === 'p' ? 'Pilots' : 'WSOs'}, ${dayLabel(iso)} | 6,4 |
| W0347 | raptor-port/src/leavewar/ui/FlyRows.tsx | 398 | jsx-text | Required | 6 |
| W0348 | raptor-port/src/leavewar/ui/FlyRows.tsx | 399 | jsx-text | Available | 6,5 |
| W0349 | raptor-port/src/leavewar/ui/FlyRows.tsx | 400 | jsx-text | SANS committed to fly | 6,5 |
| W0350 | raptor-port/src/leavewar/ui/FlyRows.tsx | 401 | jsx-text | Still needed | 6 |
| W0351 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 26 | literal | Type the days added each 1 Jan, like 36 | 6,4 |
| W0352 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 55 | attr:aria-label | Grade name: ${name} | 6 |
| W0353 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 197 | attr:label | Grades | 6 |
| W0354 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 200 | attr:aria-label | Close Grades | 6 |
| W0355 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 203 | jsx-text | GRADE | 6 |
| W0356 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 203 | jsx-text | HOLDS | 6 |
| W0357 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 203 | jsx-text | AUTO + LVE ON 1 JAN | 6 |
| W0358 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 215 | attr:aria-label | Move ${g.name}: drag, or the up and down arrow keys | 6 |
| W0359 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 223 | attr:label | ${g.name}: days added each 1 Jan | 6,4 |
| W0360 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 225 | attr:aria-label | Delete ${g.name} | 6 |
| W0361 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 230 | jsx-text | Delete | 6 |
| W0362 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 231 | jsx-text | Keep | 6 |
| W0363 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 249 | attr:aria-label | New grade's name | 6 |
| W0364 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 250 | attr:placeholder | Name | 6 |
| W0365 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 266 | attr:aria-label | New grade: days added each 1 Jan | 6,4 |
| W0366 | raptor-port/src/leavewar/ui/GradesSheet.tsx | 276 | jsx-text | + Grade | 6 |
| W0367 | raptor-port/src/leavewar/ui/LeaveButtons.tsx | 84 | attr:title | ${k.title}: filed at once, as on the Inputs page | 6,5 |
| W0368 | raptor-port/src/leavewar/ui/LeaveLine.tsx | 71 | attr:aria-label | New since your last visit | 6 |
| W0369 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 29 | literal | Never amber or red — this row just shows the number. | 6 |
| W0370 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 30 | literal | Amber when the day's number drops below ${show(t.amber)}. Never red. | 6,4 |
| W0371 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 31 | literal | Red when the day's number drops below ${show(t.red)} — no amber band. | 6,4 |
| W0372 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 32 | literal | Amber when the day's number drops below ${show(t.amber)} · red below ${show(t.red)}. | 6,4 |
| W0373 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 74 | attr:label | ${label} — what this row counts | 6 |
| W0374 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 77 | jsx-text | what this row counts | 6 |
| W0375 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 78 | attr:aria-label | Close | 6 |
| W0376 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 98 | jsx-text | Amber below | 6 |
| W0377 | raptor-port/src/leavewar/ui/ManningSheet.tsx | 111 | jsx-text | Red below | 6 |
| W0378 | raptor-port/src/leavewar/ui/Matrix.tsx | 87 | literal | That posting date was not taken. | 6 |
| W0379 | raptor-port/src/leavewar/ui/Matrix.tsx | 97 | literal | One of those is filed on the Inputs page and cannot be moved here. | 6,5 |
| W0380 | raptor-port/src/leavewar/ui/Matrix.tsx | 98 | literal | That lands outside what you can edit — pick another day. | 6,4 |
| W0381 | raptor-port/src/leavewar/ui/Matrix.tsx | 100 | literal | That day is closed for bidding. Pick an open day. | 6,4 |
| W0382 | raptor-port/src/leavewar/ui/Matrix.tsx | 102 | literal | This change could not be saved. | 6 |
| W0383 | raptor-port/src/leavewar/ui/Matrix.tsx | 103 | literal | Nothing to move. | 6 |
| W0384 | raptor-port/src/leavewar/ui/Matrix.tsx | 145 | jsx-text | Math.abs(w - b.cols[i]!) | 6 |
| W0385 | raptor-port/src/leavewar/ui/Matrix.tsx | 761 | literal | ${moveLive.current.movers.length === 1 ? 'It is' : 'They are'} already on that day — pick another day. | 6,4 |
| W0386 | raptor-port/src/leavewar/ui/Matrix.tsx | 805 | literal | That record changed or is no longer there — nothing to move. | 6 |
| W0387 | raptor-port/src/leavewar/ui/Matrix.tsx | 816 | literal | That would run off this leave war. | 6 |
| W0388 | raptor-port/src/leavewar/ui/Matrix.tsx | 817 | literal | Those days already carry an event on this line. | 6,4 |
| W0389 | raptor-port/src/leavewar/ui/Matrix.tsx | 927 | jsx-text | ; r: Set | 6 |
| W0390 | raptor-port/src/leavewar/ui/Matrix.tsx | 992 | jsx-text | new Map | 6 |
| W0391 | raptor-port/src/leavewar/ui/Matrix.tsx | 1341 | jsx-text | wrapRef.current?.querySelector | 6 |
| W0392 | raptor-port/src/leavewar/ui/Matrix.tsx | 1416 | jsx-text | (outer.classList.contains('lw-sda') ? [] : [...outer.querySelectorAll | 6 |
| W0393 | raptor-port/src/leavewar/ui/Matrix.tsx | 1418 | jsx-text | [...(wrapRef.current?.querySelectorAll | 6 |
| W0394 | raptor-port/src/leavewar/ui/Matrix.tsx | 1422 | jsx-text | [...outer.querySelectorAll | 6 |
| W0395 | raptor-port/src/leavewar/ui/Matrix.tsx | 2560 | jsx-text | CS/Name | 6 |
| W0396 | raptor-port/src/leavewar/ui/Matrix.tsx | 2564 | attr:aria-label | ${shown.label} balance | 7 |
| W0397 | raptor-port/src/leavewar/ui/Matrix.tsx | 3051 | jsx-text | Date.now() - lastScrollTsRef.current | 6 |
| W0398 | raptor-port/src/leavewar/ui/Matrix.tsx | 3902 | jsx-text | Show › | 6 |
| W0399 | raptor-port/src/leavewar/ui/Matrix.tsx | 3917 | attr:aria-label | Finish rearranging the roster | 6 |
| W0400 | raptor-port/src/leavewar/ui/Matrix.tsx | 3918 | attr:title | Finish rearranging — tap to leave | 6 |
| W0401 | raptor-port/src/leavewar/ui/Matrix.tsx | 3924 | jsx-text | Done | 6 |
| W0402 | raptor-port/src/leavewar/ui/Matrix.tsx | 3988 | attr:title | Jump to ${m.label} | 6 |
| W0403 | raptor-port/src/leavewar/ui/Matrix.tsx | 4009 | literal | G1 as recommended | 6 |
| W0404 | raptor-port/src/leavewar/ui/Matrix.tsx | 4102 | jsx-line | The TD is the fold target, not the div inside it: | 6 |
| W0405 | raptor-port/src/leavewar/ui/Matrix.tsx | 4105 | literal | Personnel · N | 6 |
| W0406 | raptor-port/src/leavewar/ui/Matrix.tsx | 4116 | attr:aria-label | ${labelOfGroup(g)} — ${folded.has(g) ? 'show' : 'hide'} these rows | 6 |
| W0407 | raptor-port/src/leavewar/ui/Matrix.tsx | 4117 | literal | Show the ${labelOfGroup(g)} rows | 6 |
| W0408 | raptor-port/src/leavewar/ui/Matrix.tsx | 4117 | literal | Hide the ${labelOfGroup(g)} rows | 6 |
| W0409 | raptor-port/src/leavewar/ui/Matrix.tsx | 4132 | attr:title | Drag to move ${labelOfGroup(g)} | 6 |
| W0410 | raptor-port/src/leavewar/ui/Matrix.tsx | 4267 | jsx-line | A translated table cannot keep `position: sticky`, so the | 6 |
| W0411 | raptor-port/src/leavewar/ui/Matrix.tsx | 4538 | literal | Move ${movers.length} ${movers.length === 1 ? 'entry' : 'entries'} here? | 6 |
| W0412 | raptor-port/src/leavewar/ui/Matrix.tsx | 4539 | literal | Tap a day to move ${movers.length} ${movers.length === 1 ? 'entry' : 'entries'}${stayWords(moveStays)} | 6,4 |
| W0413 | raptor-port/src/leavewar/ui/Matrix.tsx | 4542 | jsx-text | Confirm | 6 |
| W0414 | raptor-port/src/leavewar/ui/Matrix.tsx | 4548 | jsx-text | Cancel | 6 |
| W0415 | raptor-port/src/leavewar/ui/Matrix.tsx | 4559 | literal | Move this event here? | 6 |
| W0416 | raptor-port/src/leavewar/ui/Matrix.tsx | 4560 | literal | Tap a day to move this event | 6,4 |
| W0417 | raptor-port/src/leavewar/ui/Matrix.tsx | 4674 | jsx-text | No qualifications recorded | 6 |
| W0418 | raptor-port/src/leavewar/ui/Matrix.tsx | 4875 | literal | There is nothing here that can be moved. | 6 |
| W0419 | raptor-port/src/leavewar/ui/Matrix.tsx | 4904 | literal | Type how many days | 6,4 |
| W0420 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 160 | attr:title | Drag to move this row | 6 |
| W0421 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 178 | attr:title | ${p.callsign} — every figure | 6 |
| W0422 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 210 | attr:title | ${p.callsign}: ${shown.label} ${figWords(lines.top)} ${shown.kind === 'bal' ? 'left' : 'taken'}. Tap for his leave | 6 |
| W0423 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 484 | literal | More on this day — tap to see | 6,4 |
| W0424 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 486 | literal | Your bid is still live — tap to see what else is on this day | 6,4 |
| W0425 | raptor-port/src/leavewar/ui/MatrixRows.tsx | 487 | literal | Something on this day needs an admin — tap to see | 6,3,4 |
| W0426 | raptor-port/src/leavewar/ui/NamePuck.tsx | 42 | jsx-text | SANS | 6,5 |
| W0427 | raptor-port/src/leavewar/ui/OilAmount.tsx | 23 | jsx-text | Days | 6,4 |
| W0428 | raptor-port/src/leavewar/ui/OilAmount.tsx | 24 | attr:aria-label | Amount | 6 |
| W0429 | raptor-port/src/leavewar/ui/OilAmount.tsx | 26 | jsx-text | HO · 0.5 | 6 |
| W0430 | raptor-port/src/leavewar/ui/OilAmount.tsx | 28 | jsx-text | FO · 1 | 6 |
| W0431 | raptor-port/src/leavewar/ui/OilAmount.tsx | 32 | attr:aria-label | Any other amount, in days | 6,4 |
| W0432 | raptor-port/src/leavewar/ui/OilAmount.tsx | 32 | attr:placeholder | other: 1.5, 2… | 6 |
| W0433 | raptor-port/src/leavewar/ui/oilamountwords.ts | 28 | literal | Give FO · ${halfFigure(n)} days | 6,4 |
| W0434 | raptor-port/src/leavewar/ui/OilTracker.tsx | 497 | attr:label | OIL tracker settings | 6,1 |
| W0435 | raptor-port/src/leavewar/ui/OilTracker.tsx | 499 | jsx-text | OIL TRACKER | 6,1 |
| W0436 | raptor-port/src/leavewar/ui/OilTracker.tsx | 500 | jsx-text | settings · squadron-wide | 6,3 |
| W0437 | raptor-port/src/leavewar/ui/OilTracker.tsx | 501 | attr:aria-label | Close | 6 |
| W0438 | raptor-port/src/leavewar/ui/OilTracker.tsx | 508 | jsx-text | OIL lasts | 6,1 |
| W0439 | raptor-port/src/leavewar/ui/OilTracker.tsx | 509 | jsx-text | Forever | 6 |
| W0440 | raptor-port/src/leavewar/ui/OilTracker.tsx | 510 | jsx-text | Days | 6,4 |
| W0441 | raptor-port/src/leavewar/ui/OilTracker.tsx | 511 | jsx-text | Months | 6 |
| W0442 | raptor-port/src/leavewar/ui/OilTracker.tsx | 515 | attr:label | OIL lasts, in ${exp.unit} | 6,1 |
| W0443 | raptor-port/src/leavewar/ui/OilTracker.tsx | 526 | literal | A credit never expires. | 7 |
| W0444 | raptor-port/src/leavewar/ui/OilTracker.tsx | 530 | jsx-text | History | 6 |
| W0445 | raptor-port/src/leavewar/ui/OilTracker.tsx | 531 | jsx-text | From first entry | 6 |
| W0446 | raptor-port/src/leavewar/ui/OilTracker.tsx | 532 | jsx-text | Last N months | 6 |
| W0447 | raptor-port/src/leavewar/ui/OilTracker.tsx | 534 | attr:label | History, in months | 6 |
| W0448 | raptor-port/src/leavewar/ui/OilTracker.tsx | 537 | jsx-text | The window the tracker opens on. Anyone can widen or narrow it while looking. | 6 |
| W0449 | raptor-port/src/leavewar/ui/OilTracker.tsx | 539 | jsx-text | ‹ Back to the tracker | 6 |
| W0450 | raptor-port/src/leavewar/ui/OilTracker.tsx | 572 | jsx-text | (a.date | 6 |
| W0451 | raptor-port/src/leavewar/ui/OilTracker.tsx | 601 | jsx-line | Changing the amount, between a half day and any other, moves nothing: AM / PM keep their place, left empty | 6,4 |
| W0452 | raptor-port/src/leavewar/ui/OilTracker.tsx | 618 | literal | S DATE IS SHOWN, NEVER CHANGED (D260 | 6 |
| W0453 | raptor-port/src/leavewar/ui/OilTracker.tsx | 621 | attr:aria-label | Reason | 6 |
| W0454 | raptor-port/src/leavewar/ui/OilTracker.tsx | 621 | attr:placeholder | reason | 6 |
| W0455 | raptor-port/src/leavewar/ui/OilTracker.tsx | 622 | attr:aria-label | Given by | 6 |
| W0456 | raptor-port/src/leavewar/ui/OilTracker.tsx | 622 | attr:placeholder | given by (optional) | 6 |
| W0457 | raptor-port/src/leavewar/ui/OilTracker.tsx | 624 | jsx-text | Save | 6 |
| W0458 | raptor-port/src/leavewar/ui/OilTracker.tsx | 625 | jsx-text | Cancel | 6 |
| W0459 | raptor-port/src/leavewar/ui/OilTracker.tsx | 648 | literal | Tap to edit this credit | 7 |
| W0460 | raptor-port/src/leavewar/ui/OilTracker.tsx | 654 | jsx-text | Auto | 6 |
| W0461 | raptor-port/src/leavewar/ui/OilTracker.tsx | 802 | attr:label | OIL tracker | 6,1 |
| W0462 | raptor-port/src/leavewar/ui/OilTracker.tsx | 805 | jsx-line | Apart, they had no fill of their own and stood a few pixels off one another and off the list, so a list drawn past | 6 |
| W0463 | raptor-port/src/leavewar/ui/OilTracker.tsx | 819 | jsx-text | Show | 6 |
| W0464 | raptor-port/src/leavewar/ui/OilTracker.tsx | 831 | attr:title | Pick a date range | 6 |
| W0465 | raptor-port/src/leavewar/ui/OilTracker.tsx | 834 | jsx-text | Range | 6 |
| W0466 | raptor-port/src/leavewar/ui/OilTracker.tsx | 837 | attr:title | What the boxes mean | 6 |
| W0467 | raptor-port/src/leavewar/ui/OilTracker.tsx | 838 | attr:title | Settings | 6 |
| W0468 | raptor-port/src/leavewar/ui/OilTracker.tsx | 845 | jsx-text | Done | 6 |
| W0469 | raptor-port/src/leavewar/ui/OilTracker.tsx | 850 | jsx-text | = earned on a weekend or PH), and what's left, bottom-right. Days taken show as red lines — the oldest credit is used first. A red box is a day taken with none left. Used-up and expired credits fold into the | 7,4 |
| W0470 | raptor-port/src/leavewar/ui/OilTracker.tsx | 850 | jsx-text | Archive | 6 |
| W0471 | raptor-port/src/leavewar/ui/OilTracker.tsx | 868 | literal | Hide the used-up credits | 7 |
| W0472 | raptor-port/src/leavewar/ui/OilTracker.tsx | 868 | literal | Show the used-up credits | 7 |
| W0473 | raptor-port/src/leavewar/ui/OilTracker.tsx | 878 | jsx-text | Name | 6 |
| W0474 | raptor-port/src/leavewar/ui/OilTracker.tsx | 879 | jsx-text | Bal | 6 |
| W0475 | raptor-port/src/leavewar/ui/OilTracker.tsx | 880 | jsx-text | Credits · oldest first → | 7 |
| W0476 | raptor-port/src/leavewar/ui/OilTracker.tsx | 886 | jsx-text | Nothing in this window. | 6 |
| W0477 | raptor-port/src/leavewar/ui/OilTracker.tsx | 889 | literal | OIL credits · ${namesOf(selIds)} | 7,1 |
| W0478 | raptor-port/src/leavewar/ui/OilTracker.tsx | 892 | jsx-text | Tap a name to credit OIL · hold and drag down the names to pick several | 7,1 |
| W0479 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 55 | jsx-text | (m.from | 6 |
| W0480 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 60 | literal | Those dates leave ${period.name}, which runs ${shortSpan(period.start, period.end)}. | 6 |
| W0481 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 61 | literal | The end date is before the start date. | 6 |
| W0482 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 62 | literal | Only an admin can open or close dates. | 6,3 |
| W0483 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 182 | literal | Pick the first and last day | 6,4 |
| W0484 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 184 | jsx-text | Close these days | 6,4 |
| W0485 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 185 | jsx-text | Cancel | 6 |
| W0486 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 195 | attr:label | Open for bidding | 6 |
| W0487 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 199 | attr:aria-label | Close | 6 |
| W0488 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 206 | literal | Months — tap to open or close a month, hold and drag across months | 6 |
| W0489 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 206 | literal | Months open for bidding | 6 |
| W0490 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 226 | attr:aria-label | ${word} — ${isPast(i) ? 'past' : st === 'open' ? 'open' : st === 'part' ? 'open in part' : 'closed'} | 6 |
| W0491 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 238 | jsx-text | Nothing is open, so bidding is closed. | 6 |
| W0492 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 257 | attr:aria-label | ${stretchLabel(s)}, ${days} — change its days | 6,4 |
| W0493 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 268 | attr:title | Exact days | 6,4 |
| W0494 | raptor-port/src/leavewar/ui/OpenDatesSheet.tsx | 269 | attr:aria-label | Exact days of ${stretchLabel(s)} | 6,4 |
| W0495 | raptor-port/src/leavewar/ui/OutcomeChips.tsx | 19 | literal | Transfer to Sqn | 6 |
| W0496 | raptor-port/src/leavewar/ui/OutcomeChips.tsx | 31 | attr:aria-label | Posting | 6 |
| W0497 | raptor-port/src/leavewar/ui/OutcomeChips.tsx | 38 | literal | Comes with the shared database | 6 |
| W0498 | raptor-port/src/leavewar/ui/outcomewords.ts | 19 | literal | On ${day}: becomes SANS. | 6,5,4 |
| W0499 | raptor-port/src/leavewar/ui/outcomewords.ts | 20 | literal | On ${day}: off the manpower, nothing else. | 6,4 |
| W0500 | raptor-port/src/leavewar/ui/personleave.ts | 149 | jsx-text | (a.date | 6 |
| W0501 | raptor-port/src/leavewar/ui/personleave.ts | 254 | jsx-text | (a.from | 6 |
| W0502 | raptor-port/src/leavewar/ui/personleave.ts | 254 | jsx-text | b.from ? 1 : a.key | 6 |
| W0503 | raptor-port/src/leavewar/ui/personleave.ts | 261 | jsx-text | = y0 : l.from | 6 |
| W0504 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 49 | jsx-line | LVE: ['242,200,110', '#FFF1CF', 0.22], OIL: ['70,196,108', '#DDF8E6', 0.38], MED: ['236,104,140', '#FFD0DD', 0.26], | 6,1 |
| W0505 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 50 | jsx-line | CCL: ['138,150,255', '#DCE0FF', 0.32], FCL: ['138,150,255', '#DCE0FF', 0.32], PL: ['138,150,255', '#DCE0FF', 0.32], | 6 |
| W0506 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 51 | jsx-line | EL: ['138,150,255', '#DCE0FF', 0.32], CL: ['138,150,255', '#DCE0FF', 0.32], | 6 |
| W0507 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 223 | attr:label | ${name} LVE App bal | 6 |
| W0508 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 226 | attr:label | ${name} LVE carried forward | 6 |
| W0509 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 232 | attr:label | ${name}'s leave | 6 |
| W0510 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 235 | attr:aria-label | Close | 6 |
| W0511 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 239 | jsx-text | Balances | 7 |
| W0512 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 248 | jsx-text | App bal | 6 |
| W0513 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 249 | jsx-text | Pending | 6 |
| W0514 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 250 | jsx-text | War bal | 6 |
| W0515 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 265 | attr:aria-label | ${name}'s OIL tracker: ${figWords(oil)} | 6,1 |
| W0516 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 273 | jsx-text | days | 6,4 |
| W0517 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 283 | attr:label | ${name} ${k} | 6 |
| W0518 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 295 | jsx-text | Leave | 6 |
| W0519 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 301 | attr:aria-label | Which year's leave | 6 |
| W0520 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 329 | literal | View the document | 6 |
| W0521 | raptor-port/src/leavewar/ui/PersonWindow.tsx | 329 | literal | View ${l.docN} documents | 6 |
| W0522 | raptor-port/src/leavewar/ui/PlacedLine.tsx | 28 | jsx-text | Placed | 6 |
| W0523 | raptor-port/src/leavewar/ui/RemarksSheet.tsx | 47 | attr:label | Edit the note on this leave | 6 |
| W0524 | raptor-port/src/leavewar/ui/RemarksSheet.tsx | 53 | attr:aria-label | Close | 6 |
| W0525 | raptor-port/src/leavewar/ui/ReqNameForm.tsx | 22 | attr:label | Rename ${now} | 6 |
| W0526 | raptor-port/src/leavewar/ui/ReqNameForm.tsx | 25 | attr:aria-label | Close | 6 |
| W0527 | raptor-port/src/leavewar/ui/ReqNameForm.tsx | 28 | jsx-text | Name | 6 |
| W0528 | raptor-port/src/leavewar/ui/ReqNameForm.tsx | 39 | jsx-text | Save | 6 |
| W0529 | raptor-port/src/leavewar/ui/ReqNameForm.tsx | 40 | jsx-text | Cancel | 6 |
| W0530 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 82 | literal | Required P and W | 6 |
| W0531 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 95 | literal | This change could not be saved. | 6 |
| W0532 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 114 | attr:label | Required figures for the picked days | 6,4 |
| W0533 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 122 | attr:aria-label | Close | 6 |
| W0534 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 126 | jsx-text | Number | 6 |
| W0535 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 142 | jsx-text | Apply to | 6 |
| W0536 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 143 | jsx-text | These days | 6,4 |
| W0537 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 147 | jsx-text | Clear | 6 |
| W0538 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 147 | literal | Take away the figure that starts running on this date | 6 |
| W0539 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 147 | literal | Take the typed figures off these days | 6,4 |
| W0540 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 148 | jsx-text | Apply | 6 |
| W0541 | raptor-port/src/leavewar/ui/ReqPanel.tsx | 159 | literal | ${dayLabel(plan.nf[0]!)} is a no-fly day — it is left alone. | 6,2,4 |
| W0542 | raptor-port/src/leavewar/ui/ReqWords.tsx | 66 | attr:aria-label | Remarks and document | 6 |
| W0543 | raptor-port/src/leavewar/ui/ReqWords.tsx | 72 | attr:aria-label | Remarks | 6 |
| W0544 | raptor-port/src/leavewar/ui/ReqWords.tsx | 124 | jsx-text | Document | 6 |
| W0545 | raptor-port/src/leavewar/ui/ReqWords.tsx | 212 | literal | That could not be saved — change it on the Inputs page. | 6,5 |
| W0546 | raptor-port/src/leavewar/ui/select.ts | 245 | jsx-text | = GestureBase | 6 |
| W0547 | raptor-port/src/leavewar/ui/select.ts | 275 | jsx-text | (wrap: HTMLElement, spec: GestureSpec | 6 |
| W0548 | raptor-port/src/leavewar/ui/select.ts | 360 | jsx-text | r.right - w ? BR : 0) \| (y | 6 |
| W0549 | raptor-port/src/leavewar/ui/select.ts | 390 | jsx-text | r.right - EDGE) dx = EDGE_STEP; else if (lastX | 6 |
| W0550 | raptor-port/src/leavewar/ui/select.ts | 391 | jsx-text | vBot - EDGE) dy = EDGE_STEP; else if (lastY | 6 |
| W0551 | raptor-port/src/leavewar/ui/select.ts | 414 | jsx-text | now - (enteredAt.get(b) ?? now) | 6 |
| W0552 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 187 | literal | Type how many days | 6,4 |
| W0553 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 263 | literal | Nothing could be ${verb}. Those cells are ${why}. | 6 |
| W0554 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 399 | literal | ${already} already approved. | 6 |
| W0555 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 404 | literal | ${refused} ${bid === 'approved' ? 'not approved' : 'not changed'}: ${reasons(why, res.whyBy)}. | 6,3 |
| W0556 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 406 | literal | ${rest} skipped (no bid, or filed on the Inputs page). | 6,5 |
| W0557 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 408 | literal | None of those could be decided — a decision needs a bid, not a leave filed on the Inputs page. | 6,5 |
| W0558 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 408 | literal | Nothing to decide —${was} | 6 |
| W0559 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 417 | attr:label | Selected days | 6,4 |
| W0560 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 422 | attr:aria-label | Cancel | 6 |
| W0561 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 431 | attr:aria-label | Actions | 6 |
| W0562 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 434 | jsx-text | Approve | 6 |
| W0563 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 435 | jsx-text | Refuse | 6,3 |
| W0564 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 450 | attr:aria-label | Duration | 6 |
| W0565 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 461 | attr:aria-label | Which leave | 6 |
| W0566 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 488 | attr:label | Grant OIL | 6,1 |
| W0567 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 488 | attr:title | Grant OIL — one grant on each day picked, one reason for all | 6,1,4 |
| W0568 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 504 | attr:aria-label | Reason | 6 |
| W0569 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 504 | attr:placeholder | why — any reason | 6 |
| W0570 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 506 | attr:aria-label | Given by | 6 |
| W0571 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 506 | attr:placeholder | given by (optional) | 6 |
| W0572 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 518 | jsx-text | PI from | 6 |
| W0573 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 520 | attr:label | Post ${people(sel.people[0])} in from | 6 |
| W0574 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 544 | jsx-text | PO from | 6 |
| W0575 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 546 | attr:label | Post ${people(sel.people[0])} out from | 6 |
| W0576 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 567 | attr:label | Delete ${who}? | 6 |
| W0577 | raptor-port/src/leavewar/ui/SelectSheet.tsx | 570 | jsx-text | Delete | 6 |
| W0578 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 223 | attr:label | Settings | 6 |
| W0579 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 224 | literal | All as recommended | 6 |
| W0580 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 230 | jsx-text | SETTINGS | 6 |
| W0581 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 231 | attr:aria-label | Close | 6 |
| W0582 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 242 | jsx-text | Year | 6 |
| W0583 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 246 | attr:title | Open the Calendar — set each date day flying, night flying or no fly, and the year's holidays | 6,4 |
| W0584 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 248 | jsx-text | Calendar… | 6 |
| W0585 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 252 | attr:title | Every event on the Event rows, in the period in View | 6 |
| W0586 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 254 | jsx-text | Events… | 6 |
| W0587 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 260 | jsx-text | Manning | 6 |
| W0588 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 264 | attr:title | Add a manning counter — pick who it counts and when it turns amber or red | 7 |
| W0589 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 266 | jsx-text | ＋ Counter | 7 |
| W0590 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 271 | literal | At most ${MAX_EVENT_ROWS} event rows | 6 |
| W0591 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 271 | literal | Add another event row | 6 |
| W0592 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 273 | jsx-text | ＋ Event row | 6 |
| W0593 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 279 | literal | Clear the last event row before removing it | 6 |
| W0594 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 279 | literal | Remove the last event row | 6 |
| W0595 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 281 | jsx-text | － Event row | 6 |
| W0596 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 291 | jsx-text | Order | 6 |
| W0597 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 294 | attr:title | Drag people and category blocks on the grid | 6 |
| W0598 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 302 | literal | Put every row back in the default order — each group as listed below, pilots above WSOs, then by CAT and callsign | 6 |
| W0599 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 302 | literal | The roster is already in the default order | 6 |
| W0600 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 308 | jsx-text | Reset order | 6 |
| W0601 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 313 | jsx-text | Groups | 6 |
| W0602 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 337 | attr:title | Drag to move ${label(d)} | 6 |
| W0603 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 348 | attr:aria-label | Pick a colour for ${label(d)} | 6 |
| W0604 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 362 | jsx-text | shown · counted | 6 |
| W0605 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 368 | literal | Hide SANS again | 6,5 |
| W0606 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 368 | literal | Remove the ${label(d)} group | 6 |
| W0607 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 382 | attr:aria-label | Colour for ${label(d)} | 6 |
| W0608 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 415 | jsx-text | last | 6 |
| W0609 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 432 | jsx-text | nobody — every one of them is claimed higher up | 6 |
| W0610 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 436 | jsx-text | Also fit it, but shown higher up | 6 |
| W0611 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 443 | jsx-text | Who wins | 6 |
| W0612 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 452 | jsx-text | Add a group | 6 |
| W0613 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 458 | attr:title | Put SANS aircrew on the Leave War, as their own group at the foot | 6,5,4 |
| W0614 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 474 | jsx-text | every group is already shown | 6 |
| W0615 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 485 | jsx-text | Who wins when someone fits two | 6 |
| W0616 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 492 | literal | A custom order is set, so it no longer follows the page. Drag to change it. | 6 |
| W0617 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 493 | literal | Right now this follows the page order (higher on the grid wins). Drag a group here to set your own order instead. | 6 |
| W0618 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 509 | attr:title | Drag to change where ${label(d)} ranks | 6 |
| W0619 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 523 | jsx-line | Match the page order | 6 |
| W0620 | raptor-port/src/leavewar/ui/SettingsSheet.tsx | 532 | jsx-line | Back to the standard groups | 6 |
| W0621 | raptor-port/src/leavewar/ui/Sheet.tsx | 568 | jsx-text | [...p.querySelectorAll | 6 |
| W0622 | raptor-port/src/leavewar/ui/SheetActions.tsx | 15 | literal | Pick this up and put it on another day | 6,4 |
| W0623 | raptor-port/src/leavewar/ui/SheetActions.tsx | 38 | jsx-text | Delete — | 6 |
| W0624 | raptor-port/src/leavewar/ui/SheetActions.tsx | 38 | jsx-text | sure? | 6 |
| W0625 | raptor-port/src/leavewar/ui/WarSheet.tsx | 21 | literal | Those dates overlap a leave war that already exists. A day can only belong to one. | 6,4 |
| W0626 | raptor-port/src/leavewar/ui/WarSheet.tsx | 22 | literal | The end date is before the start date. | 6 |
| W0627 | raptor-port/src/leavewar/ui/WarSheet.tsx | 23 | literal | Give it a name. | 6 |
| W0628 | raptor-port/src/leavewar/ui/WarSheet.tsx | 24 | literal | Only an admin can create a leave war. | 6,3 |
| W0629 | raptor-port/src/leavewar/ui/WarSheet.tsx | 83 | literal | (${shortSpan(clash.start, clash.end)}). A day can only belong to one leave war. | 6,4 |
| W0630 | raptor-port/src/leavewar/ui/WarSheet.tsx | 87 | literal | That leave war could not be created. | 6 |
| W0631 | raptor-port/src/leavewar/ui/WarSheet.tsx | 91 | attr:label | New leave war | 6 |
| W0632 | raptor-port/src/leavewar/ui/WarSheet.tsx | 93 | jsx-text | NEW LEAVE WAR | 6 |
| W0633 | raptor-port/src/leavewar/ui/WarSheet.tsx | 94 | attr:aria-label | Cancel | 6 |
| W0634 | raptor-port/src/leavewar/ui/WarSheet.tsx | 100 | jsx-text | Name | 6 |
| W0635 | raptor-port/src/leavewar/ui/WarSheet.tsx | 105 | attr:placeholder | JUL - SEP 26 | 6 |
| W0636 | raptor-port/src/leavewar/ui/WarSheet.tsx | 113 | jsx-line | After I select start date it will allow me to click the next date as | 6 |
| W0637 | raptor-port/src/leavewar/ui/WarSheet.tsx | 115 | jsx-line | Two native pickers cannot show a range at all — the first has closed | 6 |
| W0638 | raptor-port/src/leavewar/ui/WarSheet.tsx | 118 | jsx-text | Dates | 6 |
| W0639 | raptor-port/src/leavewar/ui/WarSheet.tsx | 134 | jsx-text | Starts in draft. Any span, down to a single month. | 6 |
| W0640 | raptor-port/src/state/accounts.ts | 202 | jsx-text | (), seenName = new Set | 3 |
| W0641 | raptor-port/src/state/accounts.ts | 202 | jsx-text | (), seenPid = new Set | 3 |
| W0642 | raptor-port/src/state/accounts.ts | 408 | literal | At least one admin of ${num} must keep access | 3 |
| W0643 | raptor-port/src/state/accounts.ts | 411 | literal | Make another admin of ${num} first. | 3 |
| W0644 | raptor-port/src/state/accounts.ts | 411 | literal | Only a master admin or an admin of ${num} can make another. | 3 |
| W0645 | raptor-port/src/state/accounts.ts | 427 | literal | He is ${num}'s. Only an admin of ${num} can change his account. | 3 |
| W0646 | raptor-port/src/state/accounts.ts | 444 | literal | This sign-in holds a right in ${num}. Only a master admin can link it to another person. | 3 |
| W0647 | raptor-port/src/state/accounts.ts | 446 | literal | This sign-in holds a right in ${num}. Only a master admin or an admin of ${num} can link it to another person. | 3 |
| W0648 | raptor-port/src/state/accounts.ts | 467 | literal | He is ${num}'s. Only an admin of ${num} can change him. | 3 |
| W0649 | raptor-port/src/state/accounts.ts | 545 | literal | Type the sign-in name (the defence mail address) | 3 |
| W0650 | raptor-port/src/state/accounts.ts | 546 | literal | A sign-in name is at most ${MAX_SIGNIN} characters | 3 |
| W0651 | raptor-port/src/state/accounts.ts | 553 | literal | Pick the callsign or name this account belongs to | 3 |
| W0652 | raptor-port/src/state/accounts.ts | 560 | literal | At least one admin must keep access | 3 |
| W0653 | raptor-port/src/state/accounts.ts | 565 | literal | Only an admin can add an account | 3 |
| W0654 | raptor-port/src/state/accounts.ts | 567 | literal | Pick member or admin | 3 |
| W0655 | raptor-port/src/state/accounts.ts | 577 | literal | Only an admin can change an account | 3 |
| W0656 | raptor-port/src/state/accounts.ts | 579 | literal | That account is gone | 3 |
| W0657 | raptor-port/src/state/accounts.ts | 580 | literal | You can't change your own account — ask another admin | 3 |
| W0658 | raptor-port/src/state/accounts.ts | 653 | literal | Only a master admin can do that | 3 |
| W0659 | raptor-port/src/state/accounts.ts | 655 | literal | You can't change your own account — ask another master admin | 3 |
| W0660 | raptor-port/src/state/accounts.ts | 656 | literal | He is a master admin already | 3 |
| W0661 | raptor-port/src/state/accounts.ts | 656 | literal | He is not a master admin | 3 |
| W0662 | raptor-port/src/state/accounts.ts | 676 | literal | Only an admin can approve a request | 3 |
| W0663 | raptor-port/src/state/accounts.ts | 678 | literal | That request is gone | 3 |
| W0664 | raptor-port/src/state/accounts.ts | 690 | literal | Only an admin can decline a request | 3 |
| W0665 | raptor-port/src/state/accounts.ts | 703 | literal | You cannot ask for access from here | 3 |
| W0666 | raptor-port/src/state/accounts.ts | 705 | literal | Sign in first | 3 |
| W0667 | raptor-port/src/state/accounts.ts | 706 | literal | This sign-in already has an account — sign out and in again | 3 |
| W0668 | raptor-port/src/state/accounts.ts | 707 | literal | You have already asked — an admin will answer it | 3 |
| W0669 | raptor-port/src/state/accounts.ts | 732 | literal | You can't delete your own account — ask another admin | 3 |
| W0670 | raptor-port/src/state/accounts.ts | 733 | literal | You can't delete yourself — ask another admin | 3 |
| W0671 | raptor-port/src/state/accounts.ts | 919 | jsx-text | (), names = new Set | 3 |
| W0672 | raptor-port/src/state/accounts.ts | 919 | jsx-text | (), pids = new Set | 3 |
| W0673 | raptor-port/src/state/accounts.ts | 921 | literal | That would leave an account unreadable — it can’t be undone now. | 3 |
| W0674 | raptor-port/src/state/accounts.ts | 923 | literal | That would give the sign-in name ${nm} two accounts — it can’t be undone now. | 3 |
| W0675 | raptor-port/src/state/accounts.ts | 924 | literal | That would give ${people[a.pid]?.cs \|\| 'one person'} two accounts — it can’t be undone now. | 3 |
| W0676 | raptor-port/src/state/accounts.ts | 927 | literal | That account’s person is no longer on the roster — it can’t be undone now. | 3 |
| W0677 | raptor-port/src/state/accounts.ts | 976 | literal | Only an admin can add a person | 3 |
| W0678 | raptor-port/src/state/changebatch.ts | 56 | jsx-text | (a.at | 4 |
| W0679 | raptor-port/src/state/changebatch.ts | 56 | jsx-text | b.at ? 1 : a.id | 4 |
| W0680 | raptor-port/src/state/changelines.ts | 240 | jsx-text | , backToBid: Set | 4 |
| W0681 | raptor-port/src/state/changelines.ts | 242 | jsx-text | (), came = new Map | 4 |
| W0682 | raptor-port/src/state/changelines.ts | 242 | jsx-text | (), both: Array | 4 |
| W0683 | raptor-port/src/state/changelines.ts | 346 | jsx-text | ; approvedFor: Set | 4 |
| W0684 | raptor-port/src/state/changelines.ts | 346 | jsx-text | ; backToBid: Set | 4 |
| W0685 | raptor-port/src/state/changelines.ts | 364 | jsx-text | ; now: Set | 4 |
| W0686 | raptor-port/src/state/changelines.ts | 364 | jsx-text | ; changes: Array | 4 |
| W0687 | raptor-port/src/state/changelines.ts | 483 | literal | Leave War · ${cs(e.personId)} · ${String(e.counter \|\| '').toUpperCase()} ${+e.amount > 0 ? '+' : ''}${e.amount}${iso(e.date) ? ' ' + dayWord(e.date) : ''}${e.reason ? ' — ' + e.reason : ''} | 4 |
| W0688 | raptor-port/src/state/changelines.ts | 563 | literal | Balances ${on ? 'locked' : 'unlocked'} for members | 3 |
| W0689 | raptor-port/src/state/cutoff.ts | 53 | jsx-text | ; s: Record | 4 |
| W0690 | raptor-port/src/state/cutoff.ts | 94 | literal | Choose days before, or a weekday. | 4 |
| W0691 | raptor-port/src/state/cutoff.ts | 97 | literal | The number of days must be a whole number from ${s.lo} to ${s.hi}. | 4 |
| W0692 | raptor-port/src/state/cutoff.ts | 100 | literal | Choose a weekday. | 4 |
| W0693 | raptor-port/src/state/cutoff.ts | 101 | literal | The number of weeks must be from ${w.lo} to ${w.hi}. | 4 |
| W0694 | raptor-port/src/state/cutoff.ts | 117 | literal | Only an admin can change the late cut-off. | 3 |
| W0695 | raptor-port/src/state/cutoff.ts | 148 | literal | This change could not be saved. | 4 |
| W0696 | raptor-port/src/state/demoseed.ts | 122 | literal | Medically down till 9 Jul | 4 |
| W0697 | raptor-port/src/state/demoseed.ts | 127 | literal | Grounded — may still work, till 19 Jun | 4 |
| W0698 | raptor-port/src/state/demoseed.ts | 129 | literal | Medically up 20 Jun | 4 |
| W0699 | raptor-port/src/state/demoseed.ts | 137 | jsx-text | Attending medical officer&#8217;s certification | 4 |
| W0700 | raptor-port/src/state/demoseed.ts | 138 | jsx-text | Signed &#183; Medical Centre | 2 |
| W0701 | raptor-port/src/state/docs.ts | 53 | jsx-text | void): Promise | 4 |
| W0702 | raptor-port/src/state/docs.ts | 91 | literal | No file was chosen | 4 |
| W0703 | raptor-port/src/state/docs.ts | 92 | literal | That file is not a photo or a PDF | 4 |
| W0704 | raptor-port/src/state/docs.ts | 93 | literal | That file is over 8 MB — attach a smaller photo or PDF | 4 |
| W0705 | raptor-port/src/state/flyplan-model.suite.ts | 50 | literal | "every Thursday from a date onward, no end" holds from that date and not before | 4 |
| W0706 | raptor-port/src/state/flyplan-model.ts | 26 | jsx-text | ; rules: FlyRule[]; runs: Record | 4 |
| W0707 | raptor-port/src/state/flyplan-model.ts | 189 | jsx-text | SeatCount, tones: Tones = DEFAULT_TONES): Record | 4 |
| W0708 | raptor-port/src/state/flyplan.ts | 71 | jsx-text | b.from ? 1 : a.id | 4 |
| W0709 | raptor-port/src/state/flyplan.ts | 89 | literal | This change could not be saved. | 4 |
| W0710 | raptor-port/src/state/flyplan.ts | 97 | literal | The setting could not be saved. Try again. | 4 |
| W0711 | raptor-port/src/state/flyplan.ts | 114 | literal | Pick at least one day. | 4 |
| W0712 | raptor-port/src/state/flyplan.ts | 145 | literal | Choose the weekday, what kind of day it is, and the date it starts — an end date cannot be before the start. | 4 |
| W0713 | raptor-port/src/state/flyplan.ts | 150 | literal | That rule is no longer there. | 4 |
| W0714 | raptor-port/src/state/flyplan.ts | 166 | literal | Choose a valid calendar date. | 4 |
| W0715 | raptor-port/src/state/flyplan.ts | 167 | literal | A required figure is a whole number of zero or more. | 4 |
| W0716 | raptor-port/src/state/flyplan.ts | 184 | literal | No figure starts on that date. | 4 |
| W0717 | raptor-port/src/state/flyplan.ts | 192 | literal | Use whole numbers of 1 or more, each above the last: yellow, then amber, then red. | 4 |
| W0718 | raptor-port/src/state/flyplan.ts | 221 | jsx-text | (), o: new Set | 4 |
| W0719 | raptor-port/src/state/flyplan.ts | 221 | jsx-text | (), a: new Set | 4 |
| W0720 | raptor-port/src/state/history.ts | 148 | literal | Nothing to undo | 4 |
| W0721 | raptor-port/src/state/history.ts | 149 | literal | Nothing to redo | 4 |
| W0722 | raptor-port/src/state/holderbase.ts | 39 | jsx-text | ; c: Record | 4 |
| W0723 | raptor-port/src/state/holderbase.ts | 39 | jsx-text | ; ad: Record | 4 |
| W0724 | raptor-port/src/state/inputgate-hook.ts | 21 | jsx-text | , persons: ReadonlySet | 5 |
| W0725 | raptor-port/src/state/memberfile.ts | 29 | literal | This change could not be saved. | 3 |
| W0726 | raptor-port/src/state/memberfile.ts | 41 | literal | The setting could not be saved. Try again. | 3 |
| W0727 | raptor-port/src/state/mission-roles.ts | 61 | literal | Mission roles require a typed command | 4 |
| W0728 | raptor-port/src/state/mission-roles.ts | 64 | literal | Invalid mission-role record | 4 |
| W0729 | raptor-port/src/state/mission-roles.ts | 66 | literal | Invalid mission-role answer | 4 |
| W0730 | raptor-port/src/state/mission-roles.ts | 83 | literal | Published · ${verIdLabel(ver)} | 2 |
| W0731 | raptor-port/src/state/mission-roles.ts | 131 | literal | ${name\|\|'Someone else'} changed this mission role. Select Remarks to try again. | 4 |
| W0732 | raptor-port/src/state/mission-roles.ts | 141 | literal | Mission-role copies require a fresh-identity structure command | 4 |
| W0733 | raptor-port/src/state/mission-roles.ts | 143 | literal | Only a scheduler can copy mission roles | 4 |
| W0734 | raptor-port/src/state/mission-roles.ts | 148 | literal | Mission-role copy identity collision | 4 |
| W0735 | raptor-port/src/state/mission-roles.ts | 153 | literal | Invalid mission-role seed | 4 |
| W0736 | raptor-port/src/state/mission-roles.ts | 161 | literal | Invalid mission-role creation scope | 4 |
| W0737 | raptor-port/src/state/notices.ts | 643 | jsx-text | Omit | 9 |
| W0738 | raptor-port/src/state/notices.ts | 895 | literal | Your SANS availability | 5,9 |
| W0739 | raptor-port/src/state/notices.ts | 1046 | jsx-text | (who.length | 9 |
| W0740 | raptor-port/src/state/notices.ts | 1059 | literal | You were added | 9 |
| W0741 | raptor-port/src/state/notices.ts | 1060 | literal | You were taken off | 9 |
| W0742 | raptor-port/src/state/notices.ts | 1063 | literal | Taken off the programme | 9 |
| W0743 | raptor-port/src/state/notices.ts | 1064 | literal | Back on the programme | 9 |
| W0744 | raptor-port/src/state/notices.ts | 1065 | literal | Filed under Unavailable | 5,9 |
| W0745 | raptor-port/src/state/notices.ts | 1066 | literal | Taken out of Unavailable | 5,9 |
| W0746 | raptor-port/src/state/notices.ts | 1074 | literal | Renamed — was ${p.was} | 9 |
| W0747 | raptor-port/src/state/notices.ts | 1077 | literal | Inputs need an OIL answer | 1,5,9 |
| W0748 | raptor-port/src/state/notices.ts | 1161 | literal | Your SANS date moved to ${to}. | 5,9 |
| W0749 | raptor-port/src/state/notices.ts | 1163 | literal | You're no longer posted out as SANS. | 5,9 |
| W0750 | raptor-port/src/state/notices.ts | 1172 | literal | It comes back if you're SANS ${that} again. | 5,9 |
| W0751 | raptor-port/src/state/notices.ts | 1175 | literal | You're active until then, so the SANS availability you filed for ${list} is hidden. ${back} | 5,9 |
| W0752 | raptor-port/src/state/notices.ts | 1177 | literal | You're active again, so the SANS availability you filed for ${list} is hidden. ${back} | 5,9 |
| W0753 | raptor-port/src/state/notices.ts | 1215 | literal | You're SANS from ${noticeDay(from)}. | 5,9,4 |
| W0754 | raptor-port/src/state/notices.ts | 1215 | literal | Your SANS availability is needed. | 5,9 |
| W0755 | raptor-port/src/state/people-settings-commit.ts | 381 | literal | Mission-role rows require the typed annotation command | 4 |
| W0756 | raptor-port/src/state/people-settings-commit.ts | 388 | literal | SANS calendar settings require the typed settings command | 5 |
| W0757 | raptor-port/src/state/people-settings-commit.ts | 389 | literal | The flying plan is written only by its typed commands | 2 |
| W0758 | raptor-port/src/state/people-settings-commit.ts | 390 | literal | Units, places, homes and rights are written only by their typed commands | 4 |
| W0759 | raptor-port/src/state/perms.ts | 80 | literal | ScheduleWeek family, DayDraft, RowPerson | 3,4 |
| W0760 | raptor-port/src/state/perms.ts | 96 | literal | LeaveLedger (an OIL award: counter oil, amount above 0) | 1,3 |
| W0761 | raptor-port/src/state/perms.ts | 97 | literal | LeaveOpening, LeaveLedger, LeaveCounter | 3 |
| W0762 | raptor-port/src/state/perms.ts | 104 | literal | Course, Syllabus, TrainingEvent, EventPrerequisite, Layout, CoursePlan, Enrolment, Attempt | 3 |
| W0763 | raptor-port/src/state/perms.ts | 1083 | jsx-text | new Map | 3 |
| W0764 | raptor-port/src/state/perms.ts | 1764 | jsx-text | ReadonlyArray | 3 |
| W0765 | raptor-port/src/state/perms.ts | 1942 | jsx-text | ; rawA: Map | 3 |
| W0766 | raptor-port/src/state/perms.ts | 1960 | jsx-text | (), is = new Map | 3 |
| W0767 | raptor-port/src/state/perms.ts | 1986 | jsx-text | any): Set | 3 |
| W0768 | raptor-port/src/state/perms.ts | 2386 | literal | Plan left on an account made a member (${ACCOUNT_ROW}${y.id}) | 2,3 |
| W0769 | raptor-port/src/state/perms.ts | 2576 | literal | Plan given, changed or taken by one who is not a master admin (${id}) | 2,3 |
| W0770 | raptor-port/src/state/perms.ts | 2981 | jsx-text | boolean) \| null, used: Set | 3 |
| W0771 | raptor-port/src/state/person-delete.ts | 151 | literal | That is not a person | 4 |
| W0772 | raptor-port/src/state/person-delete.ts | 165 | literal | The week of ${CURWEEK} can't be changed — the delete was not made | 4 |
| W0773 | raptor-port/src/state/person-delete.ts | 182 | literal | The week of ${localOf(v)} can't be changed — the delete was not made | 4 |
| W0774 | raptor-port/src/state/person-delete.ts | 183 | literal | The week of ${localOf(v)} can't be read — the delete was not made | 4 |
| W0775 | raptor-port/src/state/person-delete.ts | 335 | jsx-text | (), after = new Set | 4 |
| W0776 | raptor-port/src/state/person-delete.ts | 497 | literal | Only an admin can delete someone | 3 |
| W0777 | raptor-port/src/state/quals-write.ts | 53 | literal | You can only edit your own row | 4 |
| W0778 | raptor-port/src/state/quals-write.ts | 54 | literal | Only an admin can change a callsign | 3 |
| W0779 | raptor-port/src/state/quals-write.ts | 55 | literal | Only an admin can tick Management | 3 |
| W0780 | raptor-port/src/state/quals-write.ts | 56 | literal | Only an admin can appoint a scheduler | 3,4 |
| W0781 | raptor-port/src/state/quals-write.ts | 61 | literal | That person is not on the roster | 4 |
| W0782 | raptor-port/src/state/quals-write.ts | 135 | literal | That did not save | 4 |
| W0783 | raptor-port/src/state/reports.ts | 34 | literal | Inputs & calendar | 5 |
| W0784 | raptor-port/src/state/reports.ts | 37 | literal | Warnings & checks | 4 |
| W0785 | raptor-port/src/state/reports.ts | 38 | literal | Display & layout | 4 |
| W0786 | raptor-port/src/state/reports.ts | 39 | literal | Speed & loading | 4 |
| W0787 | raptor-port/src/state/roster-add.ts | 40 | literal | Personnel (ground crew) | 4 |
| W0788 | raptor-port/src/state/roster-add.ts | 59 | literal | A callsign or name is at most ${MAX_CS} letters — use a short form | 4 |
| W0789 | raptor-port/src/state/roster-add.ts | 77 | literal | Type the callsign or name | 4 |
| W0790 | raptor-port/src/state/roster-add.ts | 107 | literal | Initials are at most ${MAX_INITIALS} letters | 4 |
| W0791 | raptor-port/src/state/roster-add.ts | 108 | literal | Pick pilot, WSO or personnel | 4 |
| W0792 | raptor-port/src/state/roster-add.ts | 139 | literal | You are not allowed to do that | 4 |
| W0793 | raptor-port/src/state/roster-add.ts | 140 | literal | That did not save | 4 |
| W0794 | raptor-port/src/state/roster-add.ts | 150 | literal | Only an admin can add someone | 3 |
| W0795 | raptor-port/src/state/roster-restore.ts | 90 | literal | ${String(next.cs).trim()} is taken on the roster now — rename one of them first. | 4 |
| W0796 | raptor-port/src/state/roster-restore.ts | 96 | literal | ${live.cs} is on the schedule, an input or the Leave War — take him off first. | 5,4 |
| W0797 | raptor-port/src/state/sched-commit.ts | 246 | jsx-text | ; rx: Map | 4 |
| W0798 | raptor-port/src/state/sched-commit.ts | 262 | jsx-text | (), restoredPersons = new Set | 4 |
| W0799 | raptor-port/src/state/sched-commit.ts | 489 | jsx-text | ; made: Set | 4 |
| W0800 | raptor-port/src/state/sched-commit.ts | 723 | literal | Couldn’t save that — try again | 4 |
| W0801 | raptor-port/src/state/sched-commit.ts | 893 | jsx-text | @pp: | 4 |
| W0802 | raptor-port/src/state/sched-commit.ts | 894 | jsx-text | @dm: | 4 |
| W0803 | raptor-port/src/state/store.ts | 1032 | literal | You are ${unitNum(home)}'s from today. | 4 |
| W0804 | raptor-port/src/state/store.ts | 1032 | literal | This can't be saved in ${unitNum(world)}'s ${page}. | 4 |
| W0805 | raptor-port/src/state/store.ts | 1034 | literal | This change could not be saved. | 4 |
| W0806 | raptor-port/src/state/typing-hold.ts | 44 | literal | This change could not be saved. | 4 |
| W0807 | raptor-port/src/state/units-model.ts | 124 | jsx-text | (a.id | 4 |
| W0808 | raptor-port/src/state/units-model.ts | 137 | jsx-text | (a.from | 4 |
| W0809 | raptor-port/src/state/units-model.ts | 137 | jsx-text | b.from ? 1 : a.id | 4 |
| W0810 | raptor-port/src/state/units-model.ts | 262 | jsx-text | ; units: Iterable | 4 |
| W0811 | raptor-port/src/state/units-model.ts | 262 | jsx-text | ; made?: ReadonlySet | 4 |
| W0812 | raptor-port/src/state/units.ts | 169 | literal | Only a master admin gives Plan or makes a master admin. | 2,3 |
| W0813 | raptor-port/src/state/units.ts | 183 | literal | The setting could not be saved. Try again. | 4 |
| W0814 | raptor-port/src/state/units.ts | 201 | literal | A home is written only inside the command that makes the person | 4 |
| W0815 | raptor-port/src/state/units.ts | 216 | literal | Type the squadron number — letters and digits, at most 12 | 3 |
| W0816 | raptor-port/src/state/units.ts | 217 | literal | Squadron ${num} is already set up | 3 |
| W0817 | raptor-port/src/state/units.ts | 218 | literal | Pick the place the squadron is at | 3 |
| W0818 | raptor-port/src/state/units.ts | 225 | literal | Name the squadron's first admin. | 3 |
| W0819 | raptor-port/src/state/units.ts | 227 | literal | He moves squadron tomorrow — give this after the move | 3 |
| W0820 | raptor-port/src/state/units.ts | 228 | literal | This change could not be saved. | 4 |
| W0821 | raptor-port/src/state/units.ts | 249 | literal | That squadron is gone | 3 |
| W0822 | raptor-port/src/state/units.ts | 250 | literal | Pick the place the squadron is moving to | 3 |
| W0823 | raptor-port/src/state/units.ts | 252 | literal | The squadron is already there | 3 |
| W0824 | raptor-port/src/state/units.ts | 264 | literal | Type the place's name — at most ${MAX_PLACE_NAME} characters | 4 |
| W0825 | raptor-port/src/state/units.ts | 265 | literal | Pick the place’s time zone | 4 |
| W0826 | raptor-port/src/state/units.ts | 266 | literal | That place is gone | 4 |
| W0827 | raptor-port/src/state/units.ts | 281 | literal | That is his own squadron — his role there is set on his account | 3 |
| W0828 | raptor-port/src/state/units.ts | 284 | literal | He already has that | 4 |
| W0829 | raptor-port/src/state/units.ts | 310 | literal | He has no right there to take away | 4 |
| W0830 | raptor-port/src/state/units.ts | 344 | literal | You can't move yourself to another squadron — ask another admin | 3 |
| W0831 | raptor-port/src/state/units.ts | 355 | literal | That is already his squadron | 3 |
| W0832 | raptor-port/src/state/view.ts | 836 | literal | No warnings this week ✓ | 4 |
| W0833 | raptor-port/src/state/view.ts | 836 | literal | Nothing flagged this week ✓ | 4 |
| W0834 | raptor-port/src/state/view.ts | 1441 | literal | Unavailable · <span class="mono" style="color:var(--ink-3)">${esc(PEOPLE[who]?PEOPLE[who].cs:String(who))}</span> | 5 |
| W0835 | raptor-port/src/state/weekrows.ts | 113 | jsx-text | ): Record | 4 |
| W0836 | raptor-port/src/state/weekrows.ts | 193 | jsx-text | (), rx = new Map | 4 |
| W0837 | raptor-port/src/state/weekrows.ts | 251 | jsx-text | , rx: Map | 4 |
| W0838 | raptor-port/src/state/weekrows.ts | 295 | jsx-text | = [], rx: Array | 4 |
| W0839 | raptor-port/src/tracker/App.jsx | 55 | jsx-text | Flow chart | 8 |
| W0840 | raptor-port/src/tracker/App.jsx | 56 | jsx-text | Info | 8 |
| W0841 | raptor-port/src/tracker/App.jsx | 57 | jsx-text | Show All | 8 |
| W0842 | raptor-port/src/tracker/App.jsx | 159 | jsx-text | Couldn’t finish upgrading your Tracker data | 8 |
| W0843 | raptor-port/src/tracker/App.jsx | 165 | jsx-text | Loading… | 8 |
| W0844 | raptor-port/src/tracker/App.jsx | 176 | jsx-text | No course yet | 8 |
| W0845 | raptor-port/src/tracker/App.jsx | 177 | jsx-text | Add the first course, or bring charts and students in from a file. | 8 |
| W0846 | raptor-port/src/tracker/App.jsx | 179 | jsx-text | + Add a course | 8 |
| W0847 | raptor-port/src/tracker/App.jsx | 180 | jsx-text | Import a file… | 8 |
| W0848 | raptor-port/src/tracker/App.jsx | 200 | attr:title | Show the bar | 8 |
| W0849 | raptor-port/src/tracker/App.jsx | 203 | jsx-text | Show bar | 8 |
| W0850 | raptor-port/src/tracker/App.jsx | 225 | literal | “X” is marked N.A., so it cannot be failed. | 8 |
| W0851 | raptor-port/src/tracker/App.jsx | 226 | literal | No students on this chart yet | 8 |
| W0852 | raptor-port/src/tracker/App.jsx | 240 | jsx-text | Marking is off. | 8 |
| W0853 | raptor-port/src/tracker/App.jsx | 241 | jsx-text | Turn off | 8 |
| W0854 | raptor-port/src/tracker/app/core.js | 94 | literal | You have unsaved chart edits on “ | 8 |
| W0855 | raptor-port/src/tracker/app/core.js | 226 | jsx-text | Type: | 8 |
| W0856 | raptor-port/src/tracker/app/core.js | 227 | jsx-text | Crew: | 8,4 |
| W0857 | raptor-port/src/tracker/app/core.js | 228 | jsx-text | Prerequisites: | 8 |
| W0858 | raptor-port/src/tracker/app/core.js | 229 | jsx-text | ' + escapeId(d.name) + ' | 8 |
| W0859 | raptor-port/src/tracker/app/core.js | 233 | literal | No details yet — tap Edit details. | 8 |
| W0860 | raptor-port/src/tracker/app/core.js | 234 | literal | No details yet — ☰ Show All → Edit to add them. | 8 |
| W0861 | raptor-port/src/tracker/app/core.js | 235 | literal | No details yet — turn ⓘ off, then tap the ball and ✎ Edit details. | 8 |
| W0862 | raptor-port/src/tracker/app/core.js | 236 | literal | No details yet — tap the ball, then ✎ Edit details. | 8 |
| W0863 | raptor-port/src/tracker/app/core.js | 237 | jsx-text | ' + none + ' | 8 |
| W0864 | raptor-port/src/tracker/app/core.js | 441 | jsx-text | :enr: | 8 |
| W0865 | raptor-port/src/tracker/app/core.js | 471 | literal | This change could not be saved. | 8 |
| W0866 | raptor-port/src/tracker/app/core.js | 965 | literal | Select: drag a box on empty space to pick several balls, then drag any of them to move the group. | 8 |
| W0867 | raptor-port/src/tracker/app/core.js | 1263 | literal | A name can't contain a colon (:), because the app uses it to file the record. | 8 |
| W0868 | raptor-port/src/tracker/app/core.js | 1441 | literal | ” contains a colon, which the Tracker can no longer file, so it could not finish upgrading. Reload to try again. | 8 |
| W0869 | raptor-port/src/tracker/app/core.js | 1442 | literal | A course named “ | 8 |
| W0870 | raptor-port/src/tracker/app/core.js | 1442 | literal | ” clashes with a name the Tracker reserves, so it could not finish upgrading. Reload to try again. | 8 |
| W0871 | raptor-port/src/tracker/app/core.js | 1443 | literal | A course in your saved Tracker data has an invalid id, so it could not finish upgrading. Reload to try again. | 8 |
| W0872 | raptor-port/src/tracker/app/core.js | 1513 | literal | The Tracker could not finish upgrading your data. Reload to try again. | 8 |
| W0873 | raptor-port/src/tracker/app/core.js | 1700 | literal | Two different saved chart layouts were found for the same syllabus, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed. | 8 |
| W0874 | raptor-port/src/tracker/app/core.js | 1733 | literal | Two different saved layouts point at the same syllabus, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed. | 8 |
| W0875 | raptor-port/src/tracker/app/core.js | 1747 | literal | Two saved layout positions point at the same event under the new ids, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed. | 8 |
| W0876 | raptor-port/src/tracker/app/core.js | 1931 | literal | The Tracker could not finish upgrading your syllabus data (the saved upgrade record was unreadable). Reload to try again. | 8 |
| W0877 | raptor-port/src/tracker/app/core.js | 1949 | literal | The Tracker could not finish upgrading your syllabus data. Reload to try again. | 8 |
| W0878 | raptor-port/src/tracker/app/core.js | 2147 | literal | The crew list for this course is still being moved to the new student records, so it cannot be changed yet. Nothing has been lost — reload the page and it will finish, then try again. | 8,4 |
| W0879 | raptor-port/src/tracker/app/core.js | 2325 | jsx-text | ' + escapeId(nameOf(s)) + ': | 8 |
| W0880 | raptor-port/src/tracker/app/core.js | 2326 | jsx-text | Failed' + (gl ? '' : ' (' + escapeId(nameOf(s)) + ')') + ': | 8 |
| W0881 | raptor-port/src/tracker/app/core.js | 2327 | jsx-text | ' + rows.join(' | 8 |
| W0882 | raptor-port/src/tracker/app/core.js | 2638 | literal | Now click the crossing line to | 8 |
| W0883 | raptor-port/src/tracker/app/core.js | 2776 | literal | " fill="none" stroke=" | 8 |
| W0884 | raptor-port/src/tracker/app/core.js | 2778 | literal | " fill="none" stroke="transparent" stroke-width="12"/> | 8 |
| W0885 | raptor-port/src/tracker/app/core.js | 2955 | literal | Line drawn. Loose ends stay unlinked until you connect them. | 8 |
| W0886 | raptor-port/src/tracker/app/core.js | 2958 | jsx-text | l.id === id); if (i | 8 |
| W0887 | raptor-port/src/tracker/app/core.js | 2966 | literal | Line deleted — any prerequisites it created are removed with it. | 8 |
| W0888 | raptor-port/src/tracker/app/core.js | 3033 | literal | A link can’t start and end on the same event. | 8 |
| W0889 | raptor-port/src/tracker/app/core.js | 3034 | literal | That link already exists. | 8 |
| W0890 | raptor-port/src/tracker/app/core.js | 3035 | literal | That would create a loop. | 8 |
| W0891 | raptor-port/src/tracker/app/core.js | 3254 | literal | Move: drag a ball (snap-aligns to others). Drag empty space to pan. | 8 |
| W0892 | raptor-port/src/tracker/app/core.js | 3254 | literal | Connect: click the prerequisite first, then the event that depends on it. | 8 |
| W0893 | raptor-port/src/tracker/app/core.js | 3254 | literal | Delete: removes whatever is selected — selected events or the selected line. With nothing selected, click an event, a drawn line, or a prerequisite arrow to delete it. Undo restores them. | 8 |
| W0894 | raptor-port/src/tracker/app/core.js | 3254 | literal | Text: click a ball to edit its text / type / number. | 8 |
| W0895 | raptor-port/src/tracker/app/core.js | 3254 | literal | Edit lines: blue N/E/S/W points appear on every ball. Click a line, then drag its ends onto a blue point to snap/reconnect. | 8 |
| W0896 | raptor-port/src/tracker/app/core.js | 3254 | literal | Merge: click one line, then a crossing line — the hop is removed and near-parallel drawn lines snap flush into one straight run. Works on drawn lines and prerequisite arrows. | 8 |
| W0897 | raptor-port/src/tracker/app/core.js | 3254 | literal | Unmerge: click one line, then a crossing line — the crossing gets an inverted-U hop. Drawn lines cross flat until you do this. | 8 |
| W0898 | raptor-port/src/tracker/app/core.js | 3480 | literal | Remove link | 8 |
| W0899 | raptor-port/src/tracker/app/core.js | 3545 | literal | Bend added — drag the blue square to shape it. | 8 |
| W0900 | raptor-port/src/tracker/app/core.js | 3619 | literal | End left loose — nothing linked yet. | 8 |
| W0901 | raptor-port/src/tracker/app/core.js | 3641 | literal | Now click where it ends — on a ball port, on another line, or in empty space to leave it loose. Loose ends (amber dots) are junction points — other lines snap onto them, and everything meeting there flows top to bottom. | 8 |
| W0902 | raptor-port/src/tracker/app/core.js | 4096 | jsx-text | -20 : dy | 8 |
| W0903 | raptor-port/src/tracker/app/core.js | 4274 | literal | That link would create a loop (“ | 8 |
| W0904 | raptor-port/src/tracker/app/core.js | 4279 | literal | Name for the new | 8 |
| W0905 | raptor-port/src/tracker/app/core.js | 4281 | literal | An event with that name already exists. | 8 |
| W0906 | raptor-port/src/tracker/app/core.js | 4286 | literal | ” was deleted from this chart and that is not saved yet. Press ✓ Save changes first (its marks are removed then), or Undo to bring it back. | 8 |
| W0907 | raptor-port/src/tracker/app/core.js | 4324 | literal | selected — drag any one of them to move the group. | 8 |
| W0908 | raptor-port/src/tracker/app/core.js | 4403 | literal | No such event: | 8 |
| W0909 | raptor-port/src/tracker/app/core.js | 4404 | literal | An event cannot be its own prerequisite. | 8 |
| W0910 | raptor-port/src/tracker/app/core.js | 4416 | literal | Those links would create a loop. | 8 |
| W0911 | raptor-port/src/tracker/app/core.js | 4523 | literal | Current — no flex required | 8 |
| W0912 | raptor-port/src/tracker/app/core.js | 4528 | literal | Short Refresher Course | 8 |
| W0913 | raptor-port/src/tracker/app/core.js | 4558 | literal | Only an admin can change the flex settings. | 8,3 |
| W0914 | raptor-port/src/tracker/app/core.js | 4566 | literal | The flex settings could not be saved. Try again. | 8 |
| W0915 | raptor-port/src/tracker/app/core.js | 4574 | literal | No flight date set | 8 |
| W0916 | raptor-port/src/tracker/app/core.js | 4587 | literal | No currency date set | 8 |
| W0917 | raptor-port/src/tracker/app/core.js | 4588 | literal | Landing Current — No IP Required | 8 |
| W0918 | raptor-port/src/tracker/app/core.js | 4589 | literal | Landing Not Current — IP Required | 8 |
| W0919 | raptor-port/src/tracker/app/core.js | 4642 | literal | That day hasn’t come yet — pick today or earlier. | 8,4 |
| W0920 | raptor-port/src/tracker/app/core.js | 4643 | literal | That day isn’t finished — type the whole day, or clear the box for today. | 8,4 |
| W0921 | raptor-port/src/tracker/app/core.js | 4661 | literal | Last Flown (Syllabus) | 8 |
| W0922 | raptor-port/src/tracker/app/core.js | 4670 | literal | Last Flown (Currency) | 8 |
| W0923 | raptor-port/src/tracker/app/core.js | 4709 | jsx-text | (x.startIso | 8 |
| W0924 | raptor-port/src/tracker/app/core.js | 4775 | jsx-text | (x.start | 8 |
| W0925 | raptor-port/src/tracker/app/core.js | 4844 | jsx-text | 0.3 ? 'start' : Math.cos(mid) | 8 |
| W0926 | raptor-port/src/tracker/app/core.js | 4929 | literal | No students on this chart yet — add one with + Add in the Students card to start marking. Event details: ☰ Show All → Edit. | 8 |
| W0927 | raptor-port/src/tracker/app/core.js | 5095 | literal | ” is marked N.A., so it cannot be failed. | 8 |
| W0928 | raptor-port/src/tracker/app/core.js | 5302 | jsx-text | Failed on: | 8 |
| W0929 | raptor-port/src/tracker/app/core.js | 5412 | literal | Add a crew member | 8,3,4 |
| W0930 | raptor-port/src/tracker/app/core.js | 5412 | literal | Or type a callsign | 8 |
| W0931 | raptor-port/src/tracker/app/core.js | 5412 | literal | From the squadron roster | 8,3 |
| W0932 | raptor-port/src/tracker/app/core.js | 5423 | literal | A student named | 8 |
| W0933 | raptor-port/src/tracker/app/core.js | 5423 | literal | is already on this course, linked to a different person on the roster. Remove them first, or pick the other name. | 8 |
| W0934 | raptor-port/src/tracker/app/core.js | 5606 | literal | is already on this course. Pick a different name. | 8 |
| W0935 | raptor-port/src/tracker/app/core.js | 5713 | literal | Your saved Tracker data holds a syllabus with an id this version does not recognise, so it could not be opened safely. Reload to try again. | 8 |
| W0936 | raptor-port/src/tracker/app/core.js | 5798 | literal | You have unsaved flow edits on “ | 8 |
| W0937 | raptor-port/src/tracker/app/core.js | 5804 | literal | Discard them and switch to “ | 8 |
| W0938 | raptor-port/src/tracker/app/core.js | 5889 | literal | Discard them and switch to course “ | 8 |
| W0939 | raptor-port/src/tracker/app/core.js | 5898 | literal | Discard them and add a course? | 8 |
| W0940 | raptor-port/src/tracker/app/core.js | 5899 | literal | New course name (e.g. 26BBSG): | 8 |
| W0941 | raptor-port/src/tracker/app/core.js | 5901 | literal | ” is a name the app reserves internally — pick a different course name. | 8 |
| W0942 | raptor-port/src/tracker/app/core.js | 5902 | literal | A course named | 8 |
| W0943 | raptor-port/src/tracker/app/core.js | 5902 | literal | already exists. | 8 |
| W0944 | raptor-port/src/tracker/app/core.js | 5922 | literal | Discard them and rename the course? | 8 |
| W0945 | raptor-port/src/tracker/app/core.js | 5925 | literal | Rename course “ | 8 |
| W0946 | raptor-port/src/tracker/app/core.js | 5954 | literal | Keep at least one course. | 8 |
| W0947 | raptor-port/src/tracker/app/core.js | 5955 | literal | Discard them and delete the course? | 8 |
| W0948 | raptor-port/src/tracker/app/core.js | 5958 | literal | Delete course | 8 |
| W0949 | raptor-port/src/tracker/app/core.js | 5990 | literal | Must be a JSON array | 8 |
| W0950 | raptor-port/src/tracker/app/core.js | 6199 | literal | Yes — save them on both | 8 |
| W0951 | raptor-port/src/tracker/app/core.js | 6199 | literal | No — only in the copy | 8 |
| W0952 | raptor-port/src/tracker/app/core.js | 6203 | literal | Name for the duplicated syllabus: | 8 |
| W0953 | raptor-port/src/tracker/app/core.js | 6205 | literal | A syllabus with that name already exists. | 8 |
| W0954 | raptor-port/src/tracker/app/core.js | 6249 | literal | Discard them and add a new syllabus? | 8 |
| W0955 | raptor-port/src/tracker/app/core.js | 6250 | literal | Name for the new (empty) syllabus: | 8 |
| W0956 | raptor-port/src/tracker/app/core.js | 6270 | literal | Empty sheet ready — Syllabus ✎ → Edit chart layout, then use + Flight / + Acad / + Test / + Sim / + CFT/IAT/EPT to add events. | 8 |
| W0957 | raptor-port/src/tracker/app/core.js | 6285 | literal | Rename syllabus “ | 8 |
| W0958 | raptor-port/src/tracker/app/core.js | 6287 | literal | A syllabus named “ | 8 |
| W0959 | raptor-port/src/tracker/app/core.js | 6287 | literal | ” already exists. | 8 |
| W0960 | raptor-port/src/tracker/app/core.js | 6310 | literal | Keep at least one syllabus. | 8 |
| W0961 | raptor-port/src/tracker/app/core.js | 6314 | literal | Revert edits only | 8 |
| W0962 | raptor-port/src/tracker/app/core.js | 6332 | literal | Delete syllabus “ | 8 |
| W0963 | raptor-port/src/tracker/app/core.js | 6509 | literal | Arrow at the finish end. | 8 |
| W0964 | raptor-port/src/tracker/app/core.js | 6509 | literal | Arrow at the start end. | 8 |
| W0965 | raptor-port/src/tracker/app/core.js | 6509 | literal | No arrow — using the direction it was drawn in. | 8 |
| W0966 | raptor-port/src/tracker/app/core.js | 6512 | literal | Select a line first — Line or Edit lines, then click the line. | 8 |
| W0967 | raptor-port/src/tracker/app/core.js | 6518 | literal | All balls selected — change the Font box to resize their labels. | 8 |
| W0968 | raptor-port/src/tracker/app/core.js | 6539 | literal | lines drawn on this chart. | 8 |
| W0969 | raptor-port/src/tracker/app/core.js | 6540 | literal | Reset your manual moves and return to the course-map layout for this syllabus? | 8 |
| W0970 | raptor-port/src/tracker/app/core.js | 6556 | literal | Delete these | 8 |
| W0971 | raptor-port/src/tracker/app/core.js | 6930 | literal | The students could not be brought in: the syllabus “ | 8 |
| W0972 | raptor-port/src/tracker/app/core.js | 6930 | literal | ” in the file is a different chart than the one already here. Nothing has been changed. | 8 |
| W0973 | raptor-port/src/tracker/app/core.js | 6966 | literal | That file could not be brought in: a course named “ | 8 |
| W0974 | raptor-port/src/tracker/app/core.js | 6966 | literal | ” clashes with a name the app reserves internally. Rename it in the file, then import again — nothing has been changed. | 8 |
| W0975 | raptor-port/src/tracker/app/core.js | 6967 | literal | That file could not be brought in: a course in it has an invalid id. Nothing has been changed. | 8 |
| W0976 | raptor-port/src/tracker/app/core.js | 6970 | literal | The courses could not be brought in: “ | 8 |
| W0977 | raptor-port/src/tracker/app/core.js | 6970 | literal | ” in the file is a different course than the one already here. Rename one of them, then import again — nothing has been changed. | 8 |
| W0978 | raptor-port/src/tracker/app/core.js | 7015 | literal | The students could not be brought in: “ | 8 |
| W0979 | raptor-port/src/tracker/app/core.js | 7015 | literal | . Rename one of them, then import again — no students or marks have been changed. | 8 |
| W0980 | raptor-port/src/tracker/app/core.js | 7136 | literal | Save, then export | 8 |
| W0981 | raptor-port/src/tracker/app/core.js | 7136 | literal | Export without them | 8 |
| W0982 | raptor-port/src/tracker/app/core.js | 7153 | literal | Tick charts, students, or both. | 8 |
| W0983 | raptor-port/src/tracker/app/core.js | 7154 | literal | Tick at least one syllabus. | 8 |
| W0984 | raptor-port/src/tracker/app/core.js | 7181 | literal | Exported as “ | 8 |
| W0985 | raptor-port/src/tracker/app/core.js | 7183 | literal | It CONTAINS student names and marks, with | 8 |
| W0986 | raptor-port/src/tracker/app/core.js | 7184 | literal | It contains | 8 |
| W0987 | raptor-port/src/tracker/app/core.js | 7184 | literal | — no student names or marks. | 8 |
| W0988 | raptor-port/src/tracker/app/core.js | 7213 | literal | Discard them and bring the file in? | 8 |
| W0989 | raptor-port/src/tracker/app/core.js | 7214 | literal | That file is not readable as JSON. | 8 |
| W0990 | raptor-port/src/tracker/app/core.js | 7219 | literal | That file holds no charts and no students. | 8 |
| W0991 | raptor-port/src/tracker/app/core.js | 7239 | literal | Skip this one | 8 |
| W0992 | raptor-port/src/tracker/app/core.js | 7246 | literal | Name for the incoming syllabus: | 8 |
| W0993 | raptor-port/src/tracker/app/core.js | 7248 | literal | That name is blank or already taken. | 8 |
| W0994 | raptor-port/src/tracker/app/core.js | 7347 | literal | The students could not be brought in. | 8 |
| W0995 | raptor-port/src/tracker/app/core.js | 7359 | literal | Everyone’s marks are untouched. It is saved. | 8 |
| W0996 | raptor-port/src/tracker/app/core.js | 7360 | literal | Nothing was brought in. | 8 |
| W0997 | raptor-port/src/tracker/app/core.js | 7416 | literal | The Tracker could not finish upgrading your data — the browser did not keep what was written. Reload to try again. | 8 |
| W0998 | raptor-port/src/tracker/app/core.js | 7426 | literal | The Tracker could not finish upgrading your syllabus data — the browser did not keep what was written. Reload to try again. | 8 |
| W0999 | raptor-port/src/tracker/app/courseIds.js | 54 | literal | The courses in that file are inconsistent: | 8 |
| W1000 | raptor-port/src/tracker/app/courseIds.js | 54 | literal | , so it has not been opened. | 8 |
| W1001 | raptor-port/src/tracker/app/fileFormat.js | 62 | literal | The syllabus list in the | 8 |
| W1002 | raptor-port/src/tracker/app/fileFormat.js | 62 | literal | of that file is damaged, so it has not been opened. | 8 |
| W1003 | raptor-port/src/tracker/app/fileFormat.js | 65 | literal | A syllabus in the | 8 |
| W1004 | raptor-port/src/tracker/app/fileFormat.js | 65 | literal | of that file has no id or name, so it has not been opened. | 8 |
| W1005 | raptor-port/src/tracker/app/fileFormat.js | 66 | literal | A syllabus in that file has an invalid id ( | 8 |
| W1006 | raptor-port/src/tracker/app/fileFormat.js | 66 | literal | ), so it has not been opened. | 8 |
| W1007 | raptor-port/src/tracker/app/fileFormat.js | 67 | literal | That file names a built-in syllabus ( | 8 |
| W1008 | raptor-port/src/tracker/app/fileFormat.js | 67 | literal | ) this app does not ship, so it has not been opened. | 8 |
| W1009 | raptor-port/src/tracker/app/fileFormat.js | 68 | literal | That file lists syllabus id | 8 |
| W1010 | raptor-port/src/tracker/app/fileFormat.js | 68 | literal | twice, so it has not been opened. | 8 |
| W1011 | raptor-port/src/tracker/app/fileFormat.js | 69 | literal | That file lists the syllabus label “ | 8 |
| W1012 | raptor-port/src/tracker/app/fileFormat.js | 69 | literal | ” twice, so it has not been opened. | 8 |
| W1013 | raptor-port/src/tracker/app/fileFormat.js | 79 | literal | Give all six From days. | 8,4 |
| W1014 | raptor-port/src/tracker/app/fileFormat.js | 81 | literal | Each From day must be later than the one above it. | 8,4 |
| W1015 | raptor-port/src/tracker/app/fileFormat.js | 122 | literal | in that file contains a colon (:), which the app cannot file, so it has not been opened. | 8 |
| W1016 | raptor-port/src/tracker/app/fileFormat.js | 126 | literal | The charts in that file are damaged, so it has not been opened. | 8 |
| W1017 | raptor-port/src/tracker/app/fileFormat.js | 128 | literal | The list of chart names in that file is damaged, so it has not been opened. | 8 |
| W1018 | raptor-port/src/tracker/app/fileFormat.js | 134 | literal | The chart positions in that file are damaged, so it has not been opened. | 8 |
| W1019 | raptor-port/src/tracker/app/fileFormat.js | 136 | literal | The event details in that file are damaged, so it has not been opened. | 8 |
| W1020 | raptor-port/src/tracker/app/fileFormat.js | 144 | literal | The list of deleted charts in that file is damaged, so it has not been opened. | 8 |
| W1021 | raptor-port/src/tracker/app/fileFormat.js | 149 | literal | The flex settings in that file are damaged, so it has not been opened. | 8 |
| W1022 | raptor-port/src/tracker/app/fileFormat.js | 173 | literal | The charts in that file reference “ | 8 |
| W1023 | raptor-port/src/tracker/app/fileFormat.js | 173 | literal | ”, which is not a valid syllabus id, so it has not been opened. | 8 |
| W1024 | raptor-port/src/tracker/app/fileFormat.js | 174 | literal | The charts in that file name a built-in syllabus ( | 8 |
| W1025 | raptor-port/src/tracker/app/fileFormat.js | 175 | literal | The charts in that file reference the syllabus “ | 8 |
| W1026 | raptor-port/src/tracker/app/fileFormat.js | 175 | literal | ” but do not describe it, so it has not been opened. | 8 |
| W1027 | raptor-port/src/tracker/app/fileFormat.js | 180 | literal | ” chart in that file is damaged, so it has not been opened. | 8 |
| W1028 | raptor-port/src/tracker/app/fileFormat.js | 183 | literal | ” chart in that file has an event with no name, so it has not been opened. | 8 |
| W1029 | raptor-port/src/tracker/app/fileFormat.js | 185 | literal | , so it has not been opened. | 8 |
| W1030 | raptor-port/src/tracker/app/fileFormat.js | 214 | literal | The people in that file are damaged, so it has not been opened. | 8 |
| W1031 | raptor-port/src/tracker/app/fileFormat.js | 221 | literal | The list of courses in that file is damaged, so it has not been opened. | 8 |
| W1032 | raptor-port/src/tracker/app/fileFormat.js | 233 | literal | The course “ | 8 |
| W1033 | raptor-port/src/tracker/app/fileFormat.js | 233 | literal | ” in that file uses a name the app reserves, so it has not been opened. | 8 |
| W1034 | raptor-port/src/tracker/app/fileFormat.js | 234 | literal | ” is listed twice in that file, so it has not been opened. | 8 |
| W1035 | raptor-port/src/tracker/app/fileFormat.js | 241 | literal | ” in that file has an invalid id, so it has not been opened. | 8 |
| W1036 | raptor-port/src/tracker/app/fileFormat.js | 242 | literal | That file lists course id | 8 |
| W1037 | raptor-port/src/tracker/app/fileFormat.js | 248 | literal | The courses in that file are damaged, so it has not been opened. | 8 |
| W1038 | raptor-port/src/tracker/app/fileFormat.js | 267 | literal | ” in that file is damaged, so it has not been opened. | 8 |
| W1039 | raptor-port/src/tracker/app/fileFormat.js | 277 | literal | The crew list for “ | 8,4 |
| W1040 | raptor-port/src/tracker/app/fileFormat.js | 277 | literal | ” is damaged, so that file has not been opened. | 8 |
| W1041 | raptor-port/src/tracker/app/fileFormat.js | 290 | literal | The crew list on course “ | 8,4 |
| W1042 | raptor-port/src/tracker/app/fileFormat.js | 290 | literal | ”, so that file has not been opened. | 8 |
| W1043 | raptor-port/src/tracker/app/fileFormat.js | 299 | literal | two names, so it has not been opened. | 8 |
| W1044 | raptor-port/src/tracker/app/fileFormat.js | 305 | literal | ” are damaged, so that file has not been opened. | 8 |
| W1045 | raptor-port/src/tracker/app/fileFormat.js | 322 | literal | The links in that file are damaged, so it has not been opened. | 8 |
| W1046 | raptor-port/src/tracker/app/fileFormat.js | 325 | literal | The links for course “ | 8 |
| W1047 | raptor-port/src/tracker/app/fileFormat.js | 325 | literal | ” in that file are damaged, so it has not been opened. | 8 |
| W1048 | raptor-port/src/tracker/app/fileFormat.js | 336 | literal | That file is not an OCU Tracker file. | 8 |
| W1049 | raptor-port/src/tracker/app/fileFormat.js | 338 | literal | That file was written by a newer version of the app. | 8 |
| W1050 | raptor-port/src/tracker/app/fileStore.js | 13 | literal | OCU Tracker file | 8 |
| W1051 | raptor-port/src/tracker/app/fileTransfer.js | 17 | literal | These student marks were saved by an older version and can’t be brought in safely. Import the charts, then re-enter marks — or export a fresh backup from the current app and import that. | 8 |
| W1052 | raptor-port/src/tracker/app/fileTransfer.js | 21 | literal | Student marks not brought in: they belong to a chart this file doesn’t carry. Export a fresh backup that includes its charts, and import that. | 8 |
| W1053 | raptor-port/src/tracker/app/fileTransfer.js | 59 | literal | That file could not be brought in: the syllabus “ | 8 |
| W1054 | raptor-port/src/tracker/app/fileTransfer.js | 59 | literal | ” is a different chart than one already here. Rename one, then import again — nothing has been changed. | 8 |
| W1055 | raptor-port/src/tracker/app/ids.js | 25 | literal | The people in that file are inconsistent: | 8 |
| W1056 | raptor-port/src/tracker/app/ids.js | 25 | literal | , so it has not been opened. | 8 |
| W1057 | raptor-port/src/tracker/app/rows.js | 125 | jsx-text | (a.key | 8 |
| W1058 | raptor-port/src/tracker/app/sylIds.js | 33 | literal | Default July 26 | 8 |
| W1059 | raptor-port/src/tracker/app/sylIds.js | 92 | literal | The charts in that file are inconsistent: | 8 |
| W1060 | raptor-port/src/tracker/app/sylIds.js | 92 | literal | , so it has not been opened. | 8 |
| W1061 | raptor-port/src/tracker/components/ArrangeTools.jsx | 10 | jsx-text | Move | 8 |
| W1062 | raptor-port/src/tracker/components/ArrangeTools.jsx | 11 | jsx-text | Select | 8 |
| W1063 | raptor-port/src/tracker/components/ArrangeTools.jsx | 12 | jsx-text | Connect | 8 |
| W1064 | raptor-port/src/tracker/components/ArrangeTools.jsx | 13 | jsx-text | Delete | 8 |
| W1065 | raptor-port/src/tracker/components/ArrangeTools.jsx | 23 | jsx-text | Text | 8 |
| W1066 | raptor-port/src/tracker/components/ArrangeTools.jsx | 24 | jsx-text | Line | 8 |
| W1067 | raptor-port/src/tracker/components/ArrangeTools.jsx | 25 | jsx-text | Edit lines | 8 |
| W1068 | raptor-port/src/tracker/components/ArrangeTools.jsx | 37 | jsx-text | Font | 8 |
| W1069 | raptor-port/src/tracker/components/ArrangeTools.jsx | 75 | attr:title | The tool in use — Tools ▾ has the rest | 8 |
| W1070 | raptor-port/src/tracker/components/ArrangeTools.jsx | 77 | attr:title | Fit the whole flow in view | 8 |
| W1071 | raptor-port/src/tracker/components/ArrangeTools.jsx | 77 | jsx-text | Fit | 8 |
| W1072 | raptor-port/src/tracker/components/ArrangeTools.jsx | 79 | attr:title | Every chart tool | 8 |
| W1073 | raptor-port/src/tracker/components/ArrangeTools.jsx | 79 | jsx-text | Tools ▾ | 8 |
| W1074 | raptor-port/src/tracker/components/ArrangeTools.jsx | 94 | attr:title | Select a line — drawn or prerequisite — then cycle: arrow at end → arrow at other end → no arrow | 8 |
| W1075 | raptor-port/src/tracker/components/ArrangeTools.jsx | 94 | jsx-text | Arrow | 8 |
| W1076 | raptor-port/src/tracker/components/ArrangeTools.jsx | 95 | attr:title | Click one line then a crossing line: the hop is removed, and near-parallel drawn lines snap flush into one straight run. Drawn lines are merged by default. | 8 |
| W1077 | raptor-port/src/tracker/components/ArrangeTools.jsx | 95 | jsx-text | Merge | 8 |
| W1078 | raptor-port/src/tracker/components/ArrangeTools.jsx | 96 | attr:title | Click one line then a crossing line to give the crossing an inverted-U hop. Works on drawn lines as well as prerequisite arrows. | 8 |
| W1079 | raptor-port/src/tracker/components/ArrangeTools.jsx | 96 | jsx-text | Unmerge | 8 |
| W1080 | raptor-port/src/tracker/components/ArrangeTools.jsx | 98 | attr:title | Select every ball so the font box applies to all | 8 |
| W1081 | raptor-port/src/tracker/components/ArrangeTools.jsx | 98 | jsx-text | Select all | 8 |
| W1082 | raptor-port/src/tracker/components/ArrangeTools.jsx | 108 | attr:title | Put every event back where the chart says it goes | 8 |
| W1083 | raptor-port/src/tracker/components/ArrangeTools.jsx | 108 | jsx-text | Reset layout | 8 |
| W1084 | raptor-port/src/tracker/components/ArrangeTools.jsx | 110 | attr:title | Open the full event list to edit names, types, crew and prerequisites | 8,4 |
| W1085 | raptor-port/src/tracker/components/ArrangeTools.jsx | 110 | jsx-text | Edit events | 8 |
| W1086 | raptor-port/src/tracker/components/ArrangeTools.jsx | 111 | jsx-text | Double-click any pokéball on the chart to edit that event directly. | 8 |
| W1087 | raptor-port/src/tracker/components/FlexSettings.jsx | 96 | attr:aria-label | Flex settings | 8 |
| W1088 | raptor-port/src/tracker/components/FlexSettings.jsx | 100 | attr:title | Close | 8 |
| W1089 | raptor-port/src/tracker/components/FlexSettings.jsx | 100 | attr:aria-label | Close Flex settings | 8 |
| W1090 | raptor-port/src/tracker/components/FlexSettings.jsx | 104 | attr:aria-label | Track flex | 8 |
| W1091 | raptor-port/src/tracker/components/FlexSettings.jsx | 107 | jsx-text | Off: the flex bar and the Legend's flex part go, for everyone. | 8,10 |
| W1092 | raptor-port/src/tracker/components/FlexSettings.jsx | 108 | jsx-text | Days since the last syllabus flight | 8,4 |
| W1093 | raptor-port/src/tracker/components/FlexSettings.jsx | 110 | jsx-text | From | 8 |
| W1094 | raptor-port/src/tracker/components/FlexSettings.jsx | 110 | jsx-text | Flex | 8 |
| W1095 | raptor-port/src/tracker/components/FlexSettings.jsx | 126 | jsx-text | Cancel | 8 |
| W1096 | raptor-port/src/tracker/components/FlexSettings.jsx | 127 | jsx-text | Save | 8 |
| W1097 | raptor-port/src/tracker/components/Header.jsx | 166 | attr:title | Find an event on the chart | 8 |
| W1098 | raptor-port/src/tracker/components/Header.jsx | 167 | attr:aria-label | Find an event | 8 |
| W1099 | raptor-port/src/tracker/components/Header.jsx | 172 | attr:placeholder | Find event… | 8 |
| W1100 | raptor-port/src/tracker/components/Header.jsx | 172 | attr:aria-label | Find event | 8 |
| W1101 | raptor-port/src/tracker/components/Header.jsx | 217 | attr:title | Save your changes to the syllabus — events, prerequisites and lines | 8 |
| W1102 | raptor-port/src/tracker/components/Header.jsx | 217 | jsx-text | ✓ Save changes ● | 8 |
| W1103 | raptor-port/src/tracker/components/Header.jsx | 237 | jsx-text | Multi-student · single platform · | 8 |
| W1104 | raptor-port/src/tracker/components/Header.jsx | 246 | jsx-text | Crew | 8,4 |
| W1105 | raptor-port/src/tracker/components/Header.jsx | 254 | jsx-text | Course | 8 |
| W1106 | raptor-port/src/tracker/components/Header.jsx | 259 | attr:title | Edit courses — add, rename, reorder or delete | 8 |
| W1107 | raptor-port/src/tracker/components/Header.jsx | 260 | jsx-text | + Add course | 8 |
| W1108 | raptor-port/src/tracker/components/Header.jsx | 261 | attr:title | Rename the current course | 8 |
| W1109 | raptor-port/src/tracker/components/Header.jsx | 261 | jsx-text | Rename course | 8 |
| W1110 | raptor-port/src/tracker/components/Header.jsx | 262 | attr:title | Change the order courses appear in the dropdown | 8 |
| W1111 | raptor-port/src/tracker/components/Header.jsx | 262 | jsx-text | Reorder courses | 8 |
| W1112 | raptor-port/src/tracker/components/Header.jsx | 264 | attr:title | Delete the current course | 8 |
| W1113 | raptor-port/src/tracker/components/Header.jsx | 264 | jsx-text | Delete course | 8 |
| W1114 | raptor-port/src/tracker/components/Header.jsx | 268 | literal | Edit chart layout | 8 |
| W1115 | raptor-port/src/tracker/components/Header.jsx | 273 | jsx-text | Syllabus | 8 |
| W1116 | raptor-port/src/tracker/components/Header.jsx | 278 | attr:title | Edit the syllabus — chart layout, duplicate, rename, reorder or delete | 8 |
| W1117 | raptor-port/src/tracker/components/Header.jsx | 279 | attr:title | Draw and move events, prerequisites and lines on the chart | 8 |
| W1118 | raptor-port/src/tracker/components/Header.jsx | 285 | attr:title | Make a copy of the current syllabus — the same events, lines and layout — with no students or marks | 8 |
| W1119 | raptor-port/src/tracker/components/Header.jsx | 285 | jsx-text | Duplicate syllabus | 8 |
| W1120 | raptor-port/src/tracker/components/Header.jsx | 286 | attr:title | Create a new, empty syllabus — no events, no marks — to draw from scratch | 8 |
| W1121 | raptor-port/src/tracker/components/Header.jsx | 286 | jsx-text | + Add syllabus | 8 |
| W1122 | raptor-port/src/tracker/components/Header.jsx | 287 | attr:title | Rename the current syllabus (built-ins included) | 8 |
| W1123 | raptor-port/src/tracker/components/Header.jsx | 287 | jsx-text | Rename syllabus | 8 |
| W1124 | raptor-port/src/tracker/components/Header.jsx | 288 | attr:title | Change the order syllabi appear in the dropdown | 8 |
| W1125 | raptor-port/src/tracker/components/Header.jsx | 288 | jsx-text | Reorder syllabi | 8 |
| W1126 | raptor-port/src/tracker/components/Header.jsx | 290 | attr:title | Delete the current syllabus, built-in or custom. Deleted built-ins can be restored from Reorder. | 8 |
| W1127 | raptor-port/src/tracker/components/Header.jsx | 290 | jsx-text | Delete syllabus | 8 |
| W1128 | raptor-port/src/tracker/components/Header.jsx | 297 | attr:title | Show each event's title, type, crew & prerequisites on hover (tap on a phone) — marking is off while this is on | 8,4 |
| W1129 | raptor-port/src/tracker/components/Header.jsx | 307 | attr:title | Show name, crew & prerequisites for every event | 8,4 |
| W1130 | raptor-port/src/tracker/components/Header.jsx | 307 | jsx-text | Show All | 8 |
| W1131 | raptor-port/src/tracker/components/Header.jsx | 319 | literal | is it possible to just have 1 button? | 8 |
| W1132 | raptor-port/src/tracker/components/Header.jsx | 320 | attr:title | Bring a file in, or export a copy | 8 |
| W1133 | raptor-port/src/tracker/components/Header.jsx | 320 | jsx-text | File | 8 |
| W1134 | raptor-port/src/tracker/components/Header.jsx | 321 | attr:title | Bring flow charts in from a file — and, if it holds them, students & marks (it asks first) | 8 |
| W1135 | raptor-port/src/tracker/components/Header.jsx | 321 | jsx-text | Import… | 8 |
| W1136 | raptor-port/src/tracker/components/Header.jsx | 322 | attr:title | Save a copy of the Tracker's data to a file — a backup, or a chart to hand over | 8 |
| W1137 | raptor-port/src/tracker/components/Header.jsx | 322 | jsx-text | Export… | 8 |
| W1138 | raptor-port/src/tracker/components/Header.jsx | 339 | attr:title | Hide this bar to make more room for the chart | 8 |
| W1139 | raptor-port/src/tracker/components/Legend.jsx | 21 | literal | A failure — one red tick each | 8,10 |
| W1140 | raptor-port/src/tracker/components/Legend.jsx | 22 | literal | Blue edge — the student picked in Crew | 8,10,4 |
| W1141 | raptor-port/src/tracker/components/Legend.jsx | 23 | literal | Gold ring — can be flown next | 8,10 |
| W1142 | raptor-port/src/tracker/components/Legend.jsx | 24 | literal | Turquoise ring — found by Find event | 8,10 |
| W1143 | raptor-port/src/tracker/components/Legend.jsx | 49 | jsx-text | Flex — days since the last syllabus flight | 8,10,4 |
| W1144 | raptor-port/src/tracker/components/Legend.jsx | 101 | literal | What the balls, bars and flex mean | 8,10 |
| W1145 | raptor-port/src/tracker/components/Legend.jsx | 101 | literal | What the balls and bars mean | 8,10 |
| W1146 | raptor-port/src/tracker/components/Legend.jsx | 102 | jsx-text | Legend | 8,10 |
| W1147 | raptor-port/src/tracker/components/Legend.jsx | 109 | attr:aria-label | What the chart is telling you | 8,10 |
| W1148 | raptor-port/src/tracker/components/Legend.jsx | 114 | jsx-text | The centre — the kind of event | 8,10 |
| W1149 | raptor-port/src/tracker/components/Legend.jsx | 118 | jsx-text | The ring — one slice per student | 8,10 |
| W1150 | raptor-port/src/tracker/components/Legend.jsx | 123 | jsx-text | Currency — days since the last flight | 8,10,4 |
| W1151 | raptor-port/src/tracker/components/Legend.jsx | 125 | jsx-text | Any syllabus flight counts, or a non-syllabus flight put in Last Flown (Currency). | 8,10 |
| W1152 | raptor-port/src/tracker/components/legendSamples.js | 12 | literal | CFT / IAT / EPT | 8,10 |
| W1153 | raptor-port/src/tracker/components/Modals.jsx | 77 | attr:placeholder | Search by callsign | 8 |
| W1154 | raptor-port/src/tracker/components/Modals.jsx | 197 | literal | Tick at least one syllabus. | 8 |
| W1155 | raptor-port/src/tracker/components/Modals.jsx | 239 | jsx-text | Edit poke-ball | 8 |
| W1156 | raptor-port/src/tracker/components/Modals.jsx | 240 | jsx-text | Text | 8 |
| W1157 | raptor-port/src/tracker/components/Modals.jsx | 241 | jsx-text | Colour / type | 8 |
| W1158 | raptor-port/src/tracker/components/Modals.jsx | 243 | jsx-text | Flight (blue) | 8 |
| W1159 | raptor-port/src/tracker/components/Modals.jsx | 244 | jsx-text | Acad / Spec (green) | 8 |
| W1160 | raptor-port/src/tracker/components/Modals.jsx | 245 | jsx-text | Test (red) | 8 |
| W1161 | raptor-port/src/tracker/components/Modals.jsx | 246 | jsx-text | Sim (amber) | 8 |
| W1162 | raptor-port/src/tracker/components/Modals.jsx | 247 | jsx-text | CFT/IAT/EPT (purple) | 8 |
| W1163 | raptor-port/src/tracker/components/Modals.jsx | 250 | attr:placeholder | optional | 8 |
| W1164 | raptor-port/src/tracker/components/Modals.jsx | 250 | jsx-text | Number (badge) | 8 |
| W1165 | raptor-port/src/tracker/components/Modals.jsx | 251 | attr:placeholder | e.g. IP / UW, UP / IW | 8 |
| W1166 | raptor-port/src/tracker/components/Modals.jsx | 251 | jsx-text | Crew | 8,4 |
| W1167 | raptor-port/src/tracker/components/Modals.jsx | 252 | attr:placeholder | comma-separated event IDs — draws the arrows | 8 |
| W1168 | raptor-port/src/tracker/components/Modals.jsx | 252 | jsx-text | Prereq links | 8 |
| W1169 | raptor-port/src/tracker/components/Modals.jsx | 253 | attr:placeholder | free text shown in the details bubble | 8 |
| W1170 | raptor-port/src/tracker/components/Modals.jsx | 253 | jsx-text | Prerequisites (note) | 8 |
| W1171 | raptor-port/src/tracker/components/Modals.jsx | 254 | jsx-text | Prereq links drive the arrows on the chart and what counts as available. The note is the wording shown under Crew in the details bubble — leave it blank to fall back to the links. | 8,5,4 |
| W1172 | raptor-port/src/tracker/components/Modals.jsx | 256 | jsx-text | Delete ball | 8 |
| W1173 | raptor-port/src/tracker/components/Modals.jsx | 257 | jsx-text | Cancel | 8 |
| W1174 | raptor-port/src/tracker/components/Modals.jsx | 257 | jsx-text | Save | 8 |
| W1175 | raptor-port/src/tracker/components/Modals.jsx | 301 | jsx-text | Name | 8 |
| W1176 | raptor-port/src/tracker/components/Modals.jsx | 302 | jsx-text | Type / format | 8 |
| W1177 | raptor-port/src/tracker/components/Modals.jsx | 303 | attr:placeholder | e.g. 1.5 Hrs | 8 |
| W1178 | raptor-port/src/tracker/components/Modals.jsx | 303 | jsx-text | Hours | 8 |
| W1179 | raptor-port/src/tracker/components/Modals.jsx | 304 | attr:placeholder | e.g. UP/UW, IP/IW/FSI | 8 |
| W1180 | raptor-port/src/tracker/components/Modals.jsx | 305 | attr:placeholder | e.g. AVI-02, AVI-03, AVI-04 | 8 |
| W1181 | raptor-port/src/tracker/components/Modals.jsx | 305 | jsx-text | Prerequisites | 8 |
| W1182 | raptor-port/src/tracker/components/Modals.jsx | 308 | attr:title | Put the source document's wording back in the boxes — Save keeps it, Cancel doesn't | 8 |
| W1183 | raptor-port/src/tracker/components/Modals.jsx | 308 | jsx-text | Reset to doc | 8 |
| W1184 | raptor-port/src/tracker/components/Modals.jsx | 330 | jsx-text | Edit events / flow | 8 |
| W1185 | raptor-port/src/tracker/components/Modals.jsx | 359 | literal | This sets the order of the Syllabus dropdown for every course. | 8 |
| W1186 | raptor-port/src/tracker/components/Modals.jsx | 367 | literal | This sets the order of the Course dropdown, and everyone sharing this tracker sees it. | 8 |
| W1187 | raptor-port/src/tracker/components/Modals.jsx | 378 | literal | This also sets which slice of every ball belongs to whom — first in the list is the first slice. | 8 |
| W1188 | raptor-port/src/tracker/components/Modals.jsx | 537 | attr:title | Move up | 8 |
| W1189 | raptor-port/src/tracker/components/Modals.jsx | 538 | attr:title | Move down | 8 |
| W1190 | raptor-port/src/tracker/components/Modals.jsx | 546 | literal | Deleted courses — restore to bring one back into the dropdown, with its students and marks. | 8 |
| W1191 | raptor-port/src/tracker/components/Modals.jsx | 547 | literal | Deleted built-in syllabi — restore to bring one back into the dropdown. | 8 |
| W1192 | raptor-port/src/tracker/components/Modals.jsx | 551 | jsx-text | deleted | 8 |
| W1193 | raptor-port/src/tracker/components/Modals.jsx | 552 | jsx-text | Restore | 8 |
| W1194 | raptor-port/src/tracker/components/Modals.jsx | 552 | literal | Restore this course | 8 |
| W1195 | raptor-port/src/tracker/components/Modals.jsx | 552 | literal | Restore this built-in syllabus | 8 |
| W1196 | raptor-port/src/tracker/components/Modals.jsx | 559 | attr:title | Sort A to Z | 8 |
| W1197 | raptor-port/src/tracker/components/Modals.jsx | 561 | jsx-text | Save order | 8 |
| W1198 | raptor-port/src/tracker/components/Modals.jsx | 587 | jsx-text | Export | 8 |
| W1199 | raptor-port/src/tracker/components/Modals.jsx | 601 | literal | ⚠ This copy will contain real names and marks. Only send it to someone entitled to see them. | 8 |
| W1200 | raptor-port/src/tracker/components/Modals.jsx | 602 | literal | Names and marks stay out — safe to send. | 8 |
| W1201 | raptor-port/src/tracker/components/Modals.jsx | 610 | jsx-text | All | 8 |
| W1202 | raptor-port/src/tracker/components/Modals.jsx | 611 | jsx-text | None | 8 |
| W1203 | raptor-port/src/tracker/components/Pop.jsx | 24 | literal | Done on (when marked) | 8 |
| W1204 | raptor-port/src/tracker/components/Pop.jsx | 36 | attr:label | Done on | 8 |
| W1205 | raptor-port/src/tracker/components/Pop.jsx | 54 | jsx-text | Fails: | 8 |
| W1206 | raptor-port/src/tracker/components/Pop.jsx | 55 | attr:title | One fewer failure | 8 |
| W1207 | raptor-port/src/tracker/components/Pop.jsx | 57 | attr:title | Record another failure on the day below | 8,4 |
| W1208 | raptor-port/src/tracker/components/Pop.jsx | 59 | jsx-text | Failed on | 8 |
| W1209 | raptor-port/src/tracker/components/Pop.jsx | 214 | jsx-text | Not done | 8 |
| W1210 | raptor-port/src/tracker/components/Pop.jsx | 215 | jsx-text | DCO | 8 |
| W1211 | raptor-port/src/tracker/components/Pop.jsx | 216 | jsx-text | DPCO | 8 |
| W1212 | raptor-port/src/tracker/components/Pop.jsx | 217 | jsx-text | Marginal | 8 |
| W1213 | raptor-port/src/tracker/components/Pop.jsx | 219 | jsx-text | Close | 8 |
| W1214 | raptor-port/src/tracker/components/Pop.jsx | 224 | jsx-text | Edit details | 8 |
| W1215 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 36 | jsx-text | Name | 8 |
| W1216 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 37 | jsx-text | Type / format | 8 |
| W1217 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 38 | attr:placeholder | e.g. 1.5 Hrs | 8 |
| W1218 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 38 | jsx-text | Hours | 8 |
| W1219 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 39 | attr:placeholder | e.g. UP/UW, IP/IW/FSI | 8 |
| W1220 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 39 | jsx-text | Crew | 8,4 |
| W1221 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 40 | jsx-text | Prerequisites | 8 |
| W1222 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 42 | attr:title | Put the source document's wording back in the boxes — Save keeps it, Cancel doesn't | 8 |
| W1223 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 42 | jsx-text | Reset to doc | 8 |
| W1224 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 43 | jsx-text | Cancel | 8 |
| W1225 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 44 | jsx-text | Save | 8 |
| W1226 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 92 | attr:title | ${core.nameOf(core.active)}: ${label \|\| 'not done'} | 8 |
| W1227 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 96 | jsx-text | Type: | 8 |
| W1228 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 97 | jsx-text | Crew: | 8,4 |
| W1229 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 98 | jsx-text | Prerequisites: | 8 |
| W1230 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 102 | jsx-text | Edit | 8 |
| W1231 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 117 | jsx-text | All events | 8 |
| W1232 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 117 | jsx-text | — name, crew &amp; prerequisites | 8,4 |
| W1233 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 119 | attr:placeholder | filter… | 8 |
| W1234 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 119 | attr:aria-label | Filter the events | 8 |
| W1235 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 120 | jsx-text | Close | 8 |
| W1236 | raptor-port/src/tracker/components/ShowAllPanel.jsx | 122 | jsx-text | No matches. | 8 |
| W1237 | raptor-port/src/tracker/components/SidePanel.jsx | 54 | literal | Change lull period | 8 |
| W1238 | raptor-port/src/tracker/components/SidePanel.jsx | 54 | literal | Set lull period | 8 |
| W1239 | raptor-port/src/tracker/components/SidePanel.jsx | 55 | attr:aria-label | Close | 8 |
| W1240 | raptor-port/src/tracker/components/SidePanel.jsx | 59 | jsx-text | Start | 8 |
| W1241 | raptor-port/src/tracker/components/SidePanel.jsx | 59 | jsx-text | — now pick the last day. | 8,4 |
| W1242 | raptor-port/src/tracker/components/SidePanel.jsx | 60 | jsx-text | Pick the first day of the period. | 8,4 |
| W1243 | raptor-port/src/tracker/components/SidePanel.jsx | 64 | attr:aria-label | Previous month | 8 |
| W1244 | raptor-port/src/tracker/components/SidePanel.jsx | 66 | attr:aria-label | Next month | 8 |
| W1245 | raptor-port/src/tracker/components/SidePanel.jsx | 73 | jsx-text | Changing month does not pick a day. Escape closes without saving. | 8,4 |
| W1246 | raptor-port/src/tracker/components/SidePanel.jsx | 98 | jsx-text | Select all | 8 |
| W1247 | raptor-port/src/tracker/components/SidePanel.jsx | 108 | jsx-text | Nobody else on this course yet. | 8 |
| W1248 | raptor-port/src/tracker/components/SidePanel.jsx | 111 | jsx-text | Cancel | 8 |
| W1249 | raptor-port/src/tracker/components/SidePanel.jsx | 112 | jsx-text | Copy | 8 |
| W1250 | raptor-port/src/tracker/components/SidePanel.jsx | 174 | attr:title | ${label} — ${core.ordinal(i + 1)} failure on ${id}${date ? ' · ' + core.fmt(core.parseD(date)) : ' · date not recorded'} | 8 |
| W1251 | raptor-port/src/tracker/components/SidePanel.jsx | 215 | jsx-text | A failure is recorded from the ball’s pop-up (Fails +), on the day in its “Failed on” box. Escape closes this. | 8,4 |
| W1252 | raptor-port/src/tracker/components/SidePanel.jsx | 234 | literal | No. of Down Days: | 8,4 |
| W1253 | raptor-port/src/tracker/components/SidePanel.jsx | 240 | jsx-text | Set the course start to count them. | 8 |
| W1254 | raptor-port/src/tracker/components/SidePanel.jsx | 277 | jsx-text | still running · counted to today | 8,4 |
| W1255 | raptor-port/src/tracker/components/SidePanel.jsx | 282 | jsx-text | No medical inputs since the course start. | 8,5 |
| W1256 | raptor-port/src/tracker/components/SidePanel.jsx | 299 | jsx-text | Students | 8 |
| W1257 | raptor-port/src/tracker/components/SidePanel.jsx | 301 | attr:title | Change the order crew appear in the dropdown and which slice of every ball is theirs | 8,4 |
| W1258 | raptor-port/src/tracker/components/SidePanel.jsx | 301 | jsx-text | Reorder | 8 |
| W1259 | raptor-port/src/tracker/components/SidePanel.jsx | 302 | jsx-text | + Add | 8 |
| W1260 | raptor-port/src/tracker/components/SidePanel.jsx | 314 | attr:title | Rename this student | 8 |
| W1261 | raptor-port/src/tracker/components/SidePanel.jsx | 314 | attr:title | Remove this student | 8 |
| W1262 | raptor-port/src/tracker/components/SidePanel.jsx | 337 | jsx-text | Currency &amp; flex | 8 |
| W1263 | raptor-port/src/tracker/components/SidePanel.jsx | 349 | attr:title | Last Flown (Syllabus) | 8 |
| W1264 | raptor-port/src/tracker/components/SidePanel.jsx | 350 | attr:title | Last Flown (Currency) | 8 |
| W1265 | raptor-port/src/tracker/components/SidePanel.jsx | 351 | attr:title | Course start | 8 |
| W1266 | raptor-port/src/tracker/components/SidePanel.jsx | 352 | jsx-text | No. of Down Days | 8,4 |
| W1267 | raptor-port/src/tracker/components/SidePanel.jsx | 355 | jsx-text | Days since syllabus | 8,4 |
| W1268 | raptor-port/src/tracker/components/SidePanel.jsx | 356 | jsx-text | Days since currency | 8,4 |
| W1269 | raptor-port/src/tracker/components/SidePanel.jsx | 363 | jsx-text | Flex requirement uses days since last | 8,4 |
| W1270 | raptor-port/src/tracker/components/SidePanel.jsx | 363 | jsx-text | syllabus | 8 |
| W1271 | raptor-port/src/tracker/components/SidePanel.jsx | 363 | jsx-text | flight, so updating currency won’t change it. | 8 |
| W1272 | raptor-port/src/tracker/components/SidePanel.jsx | 391 | jsx-text | Pace &amp; expected end | 8 |
| W1273 | raptor-port/src/tracker/components/SidePanel.jsx | 397 | jsx-text | Set pace | 8 |
| W1274 | raptor-port/src/tracker/components/SidePanel.jsx | 400 | jsx-text | /wk | 8 |
| W1275 | raptor-port/src/tracker/components/SidePanel.jsx | 403 | jsx-text | projected end | 8 |
| W1276 | raptor-port/src/tracker/components/SidePanel.jsx | 408 | jsx-text | End date A | 8 |
| W1277 | raptor-port/src/tracker/components/SidePanel.jsx | 410 | jsx-text | req. pace | 8 |
| W1278 | raptor-port/src/tracker/components/SidePanel.jsx | 413 | jsx-text | End date B | 8 |
| W1279 | raptor-port/src/tracker/components/SidePanel.jsx | 418 | jsx-text | Baseline 2 events/wk. Both end-date paces exclude this student’s lull periods. | 8 |
| W1280 | raptor-port/src/tracker/components/SidePanel.jsx | 448 | attr:title | Every failure with its date | 8 |
| W1281 | raptor-port/src/tracker/components/SidePanel.jsx | 448 | jsx-text | Failures | 8 |
| W1282 | raptor-port/src/tracker/components/SidePanel.jsx | 456 | jsx-text | none | 8 |
| W1283 | raptor-port/src/tracker/components/SidePanel.jsx | 466 | jsx-text | Lull periods | 8 |
| W1284 | raptor-port/src/tracker/components/SidePanel.jsx | 477 | attr:title | Tap to change these dates | 8 |
| W1285 | raptor-port/src/tracker/components/SidePanel.jsx | 483 | attr:aria-label | Remove this lull period | 8 |
| W1286 | raptor-port/src/tracker/components/SidePanel.jsx | 490 | jsx-text | + Set lull period | 8 |
| W1287 | raptor-port/src/tracker/components/SidePanel.jsx | 492 | attr:title | Copy these periods onto other students | 8 |
| W1288 | raptor-port/src/tracker/components/SidePanel.jsx | 492 | jsx-text | Copy to… | 8 |
| W1289 | raptor-port/src/tracker/components/SidePanel.jsx | 522 | attr:title | Nobody to reorder yet | 8 |
| W1290 | raptor-port/src/tracker/components/SidePanel.jsx | 524 | jsx-text | No students on this course yet. Add one to start tracking progress. | 8 |
| W1291 | raptor-port/src/tracker/components/SidePanel.jsx | 535 | jsx-text | core.rowOf(e.id) | 8 |
| W1292 | raptor-port/src/tracker/components/SidePanel.jsx | 545 | jsx-text | Overall | 8 |
| W1293 | raptor-port/src/tracker/components/SidePanel.jsx | 547 | jsx-text | Complete | 8 |
| W1294 | raptor-port/src/tracker/components/SidePanel.jsx | 548 | jsx-text | Done | 8 |
| W1295 | raptor-port/src/tracker/components/SidePanel.jsx | 549 | jsx-text | Remaining | 8 |
| W1296 | raptor-port/src/tracker/components/SidePanel.jsx | 565 | jsx-text | Next event (flow-based) | 8 |
| W1297 | raptor-port/src/tracker/components/SidePanel.jsx | 577 | literal | Can be flown next | 8 |
| W1298 | raptor-port/src/tracker/components/SidePanel.jsx | 577 | literal | Not yet — earlier events have to be done first | 8 |
| W1299 | raptor-port/src/tracker/components/SidePanel.jsx | 585 | jsx-text | Two chips = the flow branches; either can be flown next. Faded and dashed = coming up, but something has to be done first. | 8 |
| W1300 | raptor-port/src/tracker/components/SidePanel.jsx | 590 | jsx-text | Plannable now | 8 |
| W1301 | raptor-port/src/tracker/components/SidePanel.jsx | 590 | jsx-text | (shows up to 5 rows) | 8 |
| W1302 | raptor-port/src/tracker/components/SidePanel.jsx | 594 | jsx-text | none within reach | 8 |
| W1303 | raptor-port/src/tracker/components/ZoomControls.jsx | 6 | attr:title | Zoom the info panel out to screenshot everything | 8 |
| W1304 | raptor-port/src/tracker/components/ZoomControls.jsx | 7 | jsx-text | Panel | 8 |
| W1305 | raptor-port/src/tracker/components/ZoomControls.jsx | 8 | attr:title | Zoom out | 8 |
| W1306 | raptor-port/src/tracker/components/ZoomControls.jsx | 10 | attr:title | Zoom in | 8 |
| W1307 | raptor-port/src/tracker/components/ZoomControls.jsx | 11 | attr:title | Reset zoom | 8 |
| W1308 | raptor-port/src/tracker/components/ZoomControls.jsx | 11 | jsx-text | reset | 8 |
| W1309 | raptor-port/src/tracker/components/ZoomControls.jsx | 18 | attr:title | Zoom the flow chart | 8 |
| W1310 | raptor-port/src/tracker/components/ZoomControls.jsx | 19 | jsx-text | Chart | 8 |
| W1311 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air-to-Air Mission Tasks | 8 |
| W1312 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Introduction to Ground Controlled Intercept (GCI) /ACI Support | 8 |
| W1313 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Offensive Basic Fighter Manoeuvres (OBFM) | 8 |
| W1314 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Defensive Basic Fighter Manoeuvres (DBFM) | 8 |
| W1315 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | High Aspect and All Aspect Basic Fighter Manoeuvres (HA/AABFM) | 8 |
| W1316 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Low Altitude Awareness Training (LAAT) | 8 |
| W1317 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvring (ACM) | 8 |
| W1318 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | BVR to WVR transition | 8 |
| W1319 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Targeting Pod | 8 |
| W1320 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Programmable Armament Control Set (PACS) | 8 |
| W1321 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | HUD A/A Displays | 8 |
| W1322 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Course Introduction and Aircraft Overview | 8 |
| W1323 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Environmental, Canopy, and Steps | 8 |
| W1324 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Warnings and Cautions | 8,4 |
| W1325 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Emergency Procedures and Abnormal Operations | 8 |
| W1326 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvring Sims-1 | 8 |
| W1327 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | UP/UW, IP/IW/FSI, 1 x flight lead if flown in AMT if available | 8,5 |
| W1328 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvring Sims-2 | 8 |
| W1329 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvre-1 | 8 |
| W1330 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IW | 8 |
| W1331 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvre-2 | 8 |
| W1332 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air Combat Manoeuvre-3 | 8 |
| W1333 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | ACM * Applicable to Track 2 as well | 8 |
| W1334 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | P/ W, UP / IP OR IW | 8 |
| W1335 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | ST-10 (for Track 1 only), BFM | 8 |
| W1336 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/G Programmable Armament Control Set (PACS) | 8 |
| W1337 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Strafe and Non-Computed Deliveries | 8 |
| W1338 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Suspension Equipment and Training Ordnance | 8 |
| W1339 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/G Radar Introduction | 8 |
| W1340 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | APG-63(v)3 A/G Introduction | 8 |
| W1341 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Modes, Controls, and Displays | 8 |
| W1342 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Sniper Targeting Pod Introduction | 8 |
| W1343 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Sniper Targeting Pod | 8 |
| W1344 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/G SYS-Y Operations | 8 |
| W1345 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Advanced Digital Map System | 8 |
| W1346 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | General Purpose Bombs | 8 |
| W1347 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Laser Guided Bombs | 8 |
| W1348 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Advanced Handling Characteristics | 8 |
| W1349 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IP | 8 |
| W1350 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Multipurpose Colour Displays | 8 |
| W1351 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Up Front Control (UFC) | 8 |
| W1352 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Avionics Phase Review I | 8 |
| W1353 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | ADI, HSI, and HUD | 8 |
| W1354 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Embedded Global Positioning System / Inertial Navigation System (EGI) | 8 |
| W1355 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | OWS, DVR, HUD Title, and MC / DTM | 8 |
| W1356 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Radar Altimeter and Autopilot | 8 |
| W1357 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Avionics Phase Review II | 8 |
| W1358 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Built-In Test (BIT) | 8 |
| W1359 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Digital Map System | 8 |
| W1360 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Degraded Avionics Operations | 8 |
| W1361 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Avionics Phase Review III | 8 |
| W1362 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-1 | 8 |
| W1363 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-2 | 8 |
| W1364 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / IW, UP / UW (If cleared crew solo) or IP / UW, UP / IW | 8,4 |
| W1365 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | BFM-1, Crew Solo Checklist, Flown within 7 days of check flight for first crew solo | 8,4 |
| W1366 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-3 | 8 |
| W1367 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-4 | 8 |
| W1368 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | BFM-3 Crew Solo Checklist (if req), Flown within 7 days of check flight for first crew solo or flown within 14 days for subsequent crew solo | 8,4 |
| W1369 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-5 | 8 |
| W1370 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-6 | 8 |
| W1371 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / IW, UP / IW | 8 |
| W1372 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic Fighting Manoeuvres-7 | 8 |
| W1373 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / IW, UP / UW (Crew Solo) | 8,4 |
| W1374 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | BFM * Applicable to Track 2 as well | 8 |
| W1375 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, P / W | 8 |
| W1376 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Cockpit Familiarisation Trainer-01 | 8 |
| W1377 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Cockpit Familiarisation Trainer-02 | 8 |
| W1378 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Cockpit Familiarisation Trainer-03 | 8 |
| W1379 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Cockpit Familiarisation Trainer-04 | 8 |
| W1380 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Defensive Counter Air Sims-1 | 8 |
| W1381 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | AMT (Preferred) / OFT | 8 |
| W1382 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Defensive Counter Air-1 | 8 |
| W1383 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | 6 x F-15SG (2-ship plus 4 adversaries, can be effective 2v2 due to fallout). Live flight preferred but can be accomplished in AMT. | 8 |
| W1384 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / IW, UP / UW (Crew solo) | 8,4 |
| W1385 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Emergency Procedures Evaluation | 8 |
| W1386 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Purpose: Introduce students to local life support operations | 8 |
| W1387 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Purpose: Introduce F-15SG ejection seat procedures | 8,4 |
| W1388 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | General Electronic Attack | 8 |
| W1389 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-01 | 8 |
| W1390 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-02 | 8 |
| W1391 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-03 | 8 |
| W1392 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-04 | 8 |
| W1393 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-05 | 8 |
| W1394 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-06 | 8 |
| W1395 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-07 | 8 |
| W1396 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-08 | 8 |
| W1397 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-09 | 8 |
| W1398 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-10 | 8 |
| W1399 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-11 | 8 |
| W1400 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Integrated Avionics Trainer-12 | 8 |
| W1401 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Instrument Emergency Procedures Evaluation + Proficiency Check | 8 |
| W1402 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Introduction to JMP | 8 |
| W1403 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Mission Planning | 8 |
| W1404 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/G Mission Planning | 8 |
| W1405 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Low Altitude Step Down Training Sims-1 | 8 |
| W1406 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Low Altitude Stepdown Training-1 | 8 |
| W1407 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Low Altitude Stepdown Training-2 | 8 |
| W1408 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Low Altitude Stepdown Training-3 | 8 |
| W1409 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Night Transition Sims-1 | 8 |
| W1410 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | AMT (Preferred) / OFT/AMT | 8 |
| W1411 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Introduction to the NVG Training Course | 8 |
| W1412 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Task Management and Crew Coordination | 8,4 |
| W1413 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Aircraft Handling Characteristics (AHC) | 8 |
| W1414 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air-to-Ground chart and low-level planning/preparation | 8 |
| W1415 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Close Air Support (CAS) Procedures | 8 |
| W1416 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Tactical weapons delivery planning | 8 |
| W1417 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Radar Introduction | 8 |
| W1418 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Modes, Switchology, and Displays | 8 |
| W1419 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Radar Target Identification | 8 |
| W1420 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | A/A Radar Employment | 8 |
| W1421 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-1 | 8 |
| W1422 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-2 | 8 |
| W1423 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-3 | 8 |
| W1424 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-4 | 8 |
| W1425 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-5 | 8 |
| W1426 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-6 | 8 |
| W1427 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Sims-7 | 8 |
| W1428 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IW *Can be conducted in AMT | 8 |
| W1429 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics Sims-1 | 8 |
| W1430 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics Sims-2 | 8 |
| W1431 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP/IW, UP/UW 2 x CT Crew | 8,4 |
| W1432 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics-1 | 8 |
| W1433 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics-2 | 8 |
| W1434 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / IW, UP / UW (element lead to be instructor pair) IP / UW, UP / IW or IP (if non crew solo) | 8,4 |
| W1435 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics Night-1 | 8 |
| W1436 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IW (IP if 5.0 NVG hours not achieved) | 8 |
| W1437 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Lecture / Demo | 8 |
| W1438 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Instrument Refresher (ATC BRF) | 8 |
| W1439 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Local Area Orientation / Transition Phase Briefing | 8 |
| W1440 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | F-15SG Simulator Orientation | 8 |
| W1441 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Lecture / Orientation | 8 |
| W1442 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Crew Resource Management (CRM) (Removed from syllabus) | 8,4 |
| W1443 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | AHC/BFM/INT Module Briefing | 8 |
| W1444 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | ACM / LASDT Module Briefing | 8 |
| W1445 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Day Air-to-Air Refuelling Briefing | 8,4 |
| W1446 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | TI/DCA Module Briefing | 8 |
| W1447 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | BSA Module Briefing and Range Pattern Academics | 8 |
| W1448 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | NTR/SAN Module Briefing | 8 |
| W1449 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Tactics Module Briefing | 8 |
| W1450 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | F-15SG Supervised Preflight | 8 |
| W1451 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air-to-Air Missiles / Gun Inspection | 8 |
| W1452 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Air-to-Ground Weapons Inspection | 8 |
| W1453 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Aerial Attack Manoeuvring | 8 |
| W1454 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Tactical Intercept Sims-1 | 8 |
| W1455 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Tactical Intercept Sims-2 | 8 |
| W1456 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Tactical Intercept Sims-3 | 8 |
| W1457 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP/IW, UP/UW, in element, MP/MW, MP/MW in the other element | 8 |
| W1458 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IW (Either element) *UP / UW if conducted in AMT | 8 |
| W1459 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Transition Sims-Local Area Operations | 8 |
| W1460 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | IP / UW, UP / IP (Senior IP for UP) | 8 |
| W1461 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Transition-4 (Refer to BCTM TR-5(P)) | 8 |
| W1462 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | TR-4 (P), IEPE, Min 9 hrs on type | 8 |
| W1463 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | TR-5 (P), IEPE, Min 9 hours on type | 8 |
| W1464 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Surface Attack Night-1 | 8 |
| W1465 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Classroom Time: 0.5 Hr (LASDT module briefing) | 8 |
| W1466 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Classroom Time: 0.5 Hr (ACM module briefing) | 8 |
| W1467 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Dissimilar/Day Air-to-Air Refresher (as per A/G - A/A 2026 course map) | 8,4 |
| W1468 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Day/Night Air-to-Air Refresher (as per A/G - A/A 2026 course map) | 8,4 |
| W1469 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | FDL/SYS Y Introduction | 8 |
| W1470 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Basic FDL Exercise | 8 |
| W1471 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Instrument / Local Procedures Quiz (Pilot) | 8 |
| W1472 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Instrument / Local Procedures Quiz (WSO) | 8 |
| W1473 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Indirect Pop-Up / LAT Attacks | 8 |
| W1474 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | NVG Lab (ANVIL) to replace NVG-01-08 | 8 |
| W1475 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | DAAR. NTR-2. NAAR Can be accomplished anytime after Demo Pro night formation | 8 |
| W1476 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | INT(S)-2, TR-4 (could be accomplished on TR-4 after demo pro basic formation, with appropriate supervision) | 8 |
| W1477 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Day Air-to-Air Refresher-1 | 8,4 |
| W1478 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Day Air-to-Air Refresher-2 | 8,4 |
| W1479 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Night Air-to-Air Refresher-1 | 8 |
| W1480 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | DAAR-2, NTR-2 (can be accomplished anytime after demo pro night formation) | 8 |
| W1481 | raptor-port/src/tracker/data/eventInfo.js | 2 | literal | Night Air-to-Air Refresher-2 | 8 |
| W1482 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Basic Fighting Manoeuvres-5 (Refer to BCTM BFM-7) | 8 |
| W1483 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | IP / W, UP / IW or IP | 8 |
| W1484 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Low Altitude Stepdown Training-1 (Refer to BCTM LASDT-2) | 8 |
| W1485 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Low Altitude Stepdown Training-2 (Refer to BCTM LASDT-3) | 8 |
| W1486 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | IP / UW, P / IP or IW | 8 |
| W1487 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Tactical Intercept-1 (Refer to BCTM TI-1, TI-2) | 8 |
| W1488 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Tactical Intercept-2 (Refer to BCTM TI-3) | 8 |
| W1489 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | IP / UW, UP / IW (Either element) | 8 |
| W1490 | raptor-port/src/tracker/data/eventInfo.js | 7 | literal | Surface Attack-5 (Refer to BCTM SA-6) | 8 |
| W1491 | raptor-port/src/tracker/data/syllabi.js | 2 | literal | Instruments / Radar / EW | 8 |
| W1492 | raptor-port/src/tracker/data/syllabi.js | 2 | literal | Transition (Sim + Flight) | 8 |
| W1493 | raptor-port/src/tracker/data/syllabi.js | 2 | literal | BFM / ACM / Intercept | 8 |
| W1494 | raptor-port/src/tracker/data/syllabi.js | 2 | literal | Surface Attack / Night | 8 |
| W1495 | raptor-port/src/tracker/peoplewire.ts | 73 | jsx-text | (x.startIso | 8 |
| W1496 | raptor-port/src/ui/AccessScreen.tsx | 40 | attr:aria-label | TALON | 4 |
| W1497 | raptor-port/src/ui/AccessScreen.tsx | 91 | literal | Not sent yet | 4 |
| W1498 | raptor-port/src/ui/AccessScreen.tsx | 102 | jsx-text | Request sent | 4 |
| W1499 | raptor-port/src/ui/AccessScreen.tsx | 104 | jsx-text | An admin approves | 3 |
| W1500 | raptor-port/src/ui/AccessScreen.tsx | 106 | jsx-text | You're on the schedule | 4 |
| W1501 | raptor-port/src/ui/AccessScreen.tsx | 108 | literal | View the schedule | 4 |
| W1502 | raptor-port/src/ui/AccessScreen.tsx | 111 | jsx-text | Signed in as | 2 |
| W1503 | raptor-port/src/ui/AccessScreen.tsx | 142 | jsx-text | Sign out | 4 |
| W1504 | raptor-port/src/ui/AccessScreen.tsx | 148 | jsx-text | Your access is suspended | 4 |
| W1505 | raptor-port/src/ui/AccessScreen.tsx | 150 | jsx-text | Ask an admin to enable it when you’re back. | 3 |
| W1506 | raptor-port/src/ui/AccessScreen.tsx | 173 | jsx-text | Request access | 4 |
| W1507 | raptor-port/src/ui/AccessScreen.tsx | 175 | jsx-text | You're not on the squadron's list yet. Tell the admins who you are and they'll give you access. | 3 |
| W1508 | raptor-port/src/ui/AccessScreen.tsx | 179 | attr:placeholder | callsign or name | 4 |
| W1509 | raptor-port/src/ui/AccessScreen.tsx | 182 | jsx-text | Initials | 4 |
| W1510 | raptor-port/src/ui/AccessScreen.tsx | 183 | attr:placeholder | initials | 4 |
| W1511 | raptor-port/src/ui/AccessScreen.tsx | 185 | jsx-text | Pilot, WSO or personnel | 4 |
| W1512 | raptor-port/src/ui/AccessScreen.tsx | 188 | jsx-text | Pick… | 4 |
| W1513 | raptor-port/src/ui/AccessScreen.tsx | 193 | jsx-text | CAT | 4 |
| W1514 | raptor-port/src/ui/AdminPage.tsx | 44 | literal | Sign-in and roster | 3,10 |
| W1515 | raptor-port/src/ui/AdminPage.tsx | 45 | literal | Duty, day & wave templates | 3,10,4 |
| W1516 | raptor-port/src/ui/AdminPage.tsx | 46 | literal | Storage & cleanup | 3,10 |
| W1517 | raptor-port/src/ui/AdminPage.tsx | 90 | literal | This change could not be saved. | 3,10 |
| W1518 | raptor-port/src/ui/AdminPage.tsx | 106 | jsx-text | Period | 3,10 |
| W1519 | raptor-port/src/ui/AdminPage.tsx | 107 | attr:aria-label | Which period to clear | 3,10 |
| W1520 | raptor-port/src/ui/AdminPage.tsx | 114 | jsx-text | Anything older than a date | 3,10 |
| W1521 | raptor-port/src/ui/AdminPage.tsx | 115 | jsx-text | A specific date | 3,10 |
| W1522 | raptor-port/src/ui/AdminPage.tsx | 116 | jsx-text | A date range | 3,10 |
| W1523 | raptor-port/src/ui/AdminPage.tsx | 119 | jsx-text | Dates | 3,10 |
| W1524 | raptor-port/src/ui/AdminPage.tsx | 123 | literal | Tap the first day, then the last. | 3,10,4 |
| W1525 | raptor-port/src/ui/AdminPage.tsx | 171 | attr:aria-label | Move ${label} up | 3,10 |
| W1526 | raptor-port/src/ui/AdminPage.tsx | 172 | attr:aria-label | Move ${label} down | 3,10 |
| W1527 | raptor-port/src/ui/AdminPage.tsx | 180 | jsx-text | Section order | 3,10 |
| W1528 | raptor-port/src/ui/AdminPage.tsx | 185 | jsx-text | The order the day’s panels show in. The schedule sections apply on both Edit Schedule and the Scheduler Board; the crew lists (Personal Inputs, Available crew, SANS, Unavailable) reorder on the Scheduler Board only. A d… | 3,5,10,4 |
| W1529 | raptor-port/src/ui/AdminPage.tsx | 186 | jsx-text | Reset to standard order | 3,10 |
| W1530 | raptor-port/src/ui/AdminPage.tsx | 187 | jsx-text | Flying-wave order | 3,10,4 |
| W1531 | raptor-port/src/ui/AdminPage.tsx | 194 | literal | A new wave added to a schedule that isn’t signed off lands in this order (e.g. SC on top). It never re-orders a day already planned, or a signed-off day. | 2,3,10,4 |
| W1532 | raptor-port/src/ui/AdminPage.tsx | 195 | literal | Off — a new wave is added at the bottom. Move a wave type to set the order new waves are placed in on a fresh schedule. | 3,10,4 |
| W1533 | raptor-port/src/ui/AdminPage.tsx | 197 | jsx-text | Turn off wave order | 3,10,4 |
| W1534 | raptor-port/src/ui/AdminPage.tsx | 247 | jsx-text | Admin tools are for schedulers. Ask an admin to change users or templates. | 3,10,4 |
| W1535 | raptor-port/src/ui/AdminPage.tsx | 255 | attr:aria-label | Admin categories | 3,10 |
| W1536 | raptor-port/src/ui/AdminPage.tsx | 256 | jsx-text | Admin | 3,10 |
| W1537 | raptor-port/src/ui/AdminPage.tsx | 273 | attr:aria-label | Back to categories | 3,10 |
| W1538 | raptor-port/src/ui/AdminPage.tsx | 291 | jsx-text | Default arrangement | 3,10 |
| W1539 | raptor-port/src/ui/AdminPage.tsx | 294 | jsx-text | Duty templates… | 3,10,4 |
| W1540 | raptor-port/src/ui/AdminPage.tsx | 295 | jsx-text | A duty template is a saved duty block — its rows and times — that "+ Block" copies onto any day as a plain, conflict-checked desk. | 3,10,4 |
| W1541 | raptor-port/src/ui/AdminPage.tsx | 296 | jsx-text | Day templates… | 3,10,4 |
| W1542 | raptor-port/src/ui/AdminPage.tsx | 297 | jsx-text | A day template is a whole captured day — waves, duties, sims and ground rows — recaptured off a real day and re-applied from the day-templates picker. | 3,10,4 |
| W1543 | raptor-port/src/ui/AdminPage.tsx | 298 | jsx-text | Wave templates… | 3,10,4 |
| W1544 | raptor-port/src/ui/AdminPage.tsx | 299 | jsx-text | A wave template is a saved flying wave — its rule-set and lines — that "+ Wave" drops onto any day. | 3,10,4 |
| W1545 | raptor-port/src/ui/AdminPage.tsx | 310 | jsx-text | Old clutter | 3,10 |
| W1546 | raptor-port/src/ui/AdminPage.tsx | 311 | literal | Clear old clutter… | 3,10 |
| W1547 | raptor-port/src/ui/AdminPage.tsx | 312 | literal | No old clutter in that period | 3,10 |
| W1548 | raptor-port/src/ui/AdminPage.tsx | 313 | literal | Removes only old calendar pucks and day notes in the chosen period. It never deletes a leave, medical or duty entry (so no balance changes), never a saved week, and never the week you're viewing. Anything only partly in… | 3,10,4 |
| W1549 | raptor-port/src/ui/AdminPage.tsx | 336 | jsx-text | Edit history | 3,10 |
| W1550 | raptor-port/src/ui/AdminPage.tsx | 337 | literal | Clear edit history… | 3,10 |
| W1551 | raptor-port/src/ui/AdminPage.tsx | 338 | literal | No edits on record in that period | 3,10 |
| W1552 | raptor-port/src/ui/AdminPage.tsx | 339 | literal | Permanently removes entries from the edit history — the record of who changed what — made in the chosen period. The schedule itself is not touched. | 3,10,4 |
| W1553 | raptor-port/src/ui/ALPanel.tsx | 21 | jsx-text | Amendments | 2 |
| W1554 | raptor-port/src/ui/ALPanel.tsx | 26 | literal | Changes are on unpublished days — publish the day first | 2,4 |
| W1555 | raptor-port/src/ui/ALPanel.tsx | 26 | literal | No pending changes | 4 |
| W1556 | raptor-port/src/ui/ALPanel.tsx | 61 | literal | Return to the live copy of ${dowShort(di)} before publishing — you're viewing a past version | 2 |
| W1557 | raptor-port/src/ui/ALPanel.tsx | 61 | literal | Sign off ${signMissing(di).join(', ')} before publishing AL${seq} | 2 |
| W1558 | raptor-port/src/ui/ALPanel.tsx | 70 | jsx-text | a.iso === b.iso ? +a.seq - +b.seq : (a.iso | 4 |
| W1559 | raptor-port/src/ui/ALPanel.tsx | 74 | attr:title | ${esc(dowShort(a.di) + ': ' + sigTitle)} | 4 |
| W1560 | raptor-port/src/ui/ALPanel.tsx | 77 | jsx-text | No amendments published yet. | 2 |
| W1561 | raptor-port/src/ui/AvailWindow.tsx | 50 | jsx-line | AVAILWIN, setAvailTab, AVAILWIN_FOOT, AVAILWIN_FOOTID, setAvailFoot, | 5 |
| W1562 | raptor-port/src/ui/AvailWindow.tsx | 223 | literal | This row is no longer on the schedule. | 5,4 |
| W1563 | raptor-port/src/ui/AvailWindow.tsx | 225 | literal | This row is cancelled, so nobody is worked out for it. | 5 |
| W1564 | raptor-port/src/ui/AvailWindow.tsx | 226 | literal | This row is information only, so nobody is worked out for it. | 5 |
| W1565 | raptor-port/src/ui/AvailWindow.tsx | 227 | literal | There is no ALL or ALL AVAIL puck on this row any more. | 5 |
| W1566 | raptor-port/src/ui/AvailWindow.tsx | 228 | literal | This row has no usable start and end times, so nobody can be worked out for it. | 5 |
| W1567 | raptor-port/src/ui/AvailWindow.tsx | 279 | literal | This is the day as it was issued. Change who earns on the working copy. | 5,4 |
| W1568 | raptor-port/src/ui/AvailWindow.tsx | 280 | literal | Only a scheduler can change who earns | 5,4 |
| W1569 | raptor-port/src/ui/AvailWindow.tsx | 289 | literal | This event earns nobody any OIL. Turn the event back on first. | 1,5 |
| W1570 | raptor-port/src/ui/AvailWindow.tsx | 325 | literal | ${cs} — nothing else on the programme at that time. | 5 |
| W1571 | raptor-port/src/ui/AvailWindow.tsx | 345 | literal | Who earned OIL on the day as it was issued. | 1,5,4 |
| W1572 | raptor-port/src/ui/AvailWindow.tsx | 347 | literal | Nothing on this day earns. Turn off the switch to change men one by one. | 5,4 |
| W1573 | raptor-port/src/ui/AvailWindow.tsx | 348 | literal | This event earns nobody. Turn it back on to switch men one by one. | 5 |
| W1574 | raptor-port/src/ui/AvailWindow.tsx | 352 | literal | Tap a puck to stop a man earning from this event. | 5 |
| W1575 | raptor-port/src/ui/AvailWindow.tsx | 355 | literal | Tap a puck for why. | 5 |
| W1576 | raptor-port/src/ui/AvailWindow.tsx | 365 | attr:aria-label | ${m && m.lbl.found ? m.lbl.name : name} — who is available | 5 |
| W1577 | raptor-port/src/ui/AvailWindow.tsx | 380 | attr:title | Close | 5 |
| W1578 | raptor-port/src/ui/AvailWindow.tsx | 388 | jsx-text | Who&rsquo;s available | 5 |
| W1579 | raptor-port/src/ui/AvailWindow.tsx | 392 | jsx-text | Who earns OIL | 1,5 |
| W1580 | raptor-port/src/ui/AvailWindow.tsx | 408 | jsx-text | This version is no longer available. | 5 |
| W1581 | raptor-port/src/ui/board-html.ts | 66 | attr:title | ${ro?'':'Drag to move this row'} | 4 |
| W1582 | raptor-port/src/ui/board-html.ts | 92 | attr:title | Sort this section | 4 |
| W1583 | raptor-port/src/ui/board-html.ts | 131 | attr:title | SANS availability | 5,4 |
| W1584 | raptor-port/src/ui/board-html.ts | 132 | attr:title | ${esc(v)} | 4 |
| W1585 | raptor-port/src/ui/board-html.ts | 141 | jsx-text | No personal inputs submitted for this day. | 5,4 |
| W1586 | raptor-port/src/ui/board-html.ts | 149 | attr:title | ${esc(inp.type)} | 4 |
| W1587 | raptor-port/src/ui/board-html.ts | 178 | attr:title | Add a note line | 4 |
| W1588 | raptor-port/src/ui/board-html.ts | 178 | jsx-text | + Note | 4 |
| W1589 | raptor-port/src/ui/board-html.ts | 179 | jsx-text | Nothing yet — “+ Note” adds a line that every viewer sees at the top of the day. | 4 |
| W1590 | raptor-port/src/ui/board-html.ts | 189 | jsx-text | `+sbGrip(ro)+` | 4 |
| W1591 | raptor-port/src/ui/board-html.ts | 191 | attr:title | Remove this note | 4 |
| W1592 | raptor-port/src/ui/board-html.ts | 201 | attr:title | Add a squadron-wide item | 3,4 |
| W1593 | raptor-port/src/ui/board-html.ts | 201 | jsx-text | + Item | 4 |
| W1594 | raptor-port/src/ui/board-html.ts | 204 | jsx-text | Nothing squadron-wide yet — “+ Item” adds a mass brief, PT, safety stand-down and the like. | 3,4 |
| W1595 | raptor-port/src/ui/board-html.ts | 216 | jsx-text | Item | 4 |
| W1596 | raptor-port/src/ui/board-html.ts | 216 | jsx-text | Start | 4 |
| W1597 | raptor-port/src/ui/board-html.ts | 216 | jsx-text | End | 4 |
| W1598 | raptor-port/src/ui/board-html.ts | 216 | jsx-text | People | 4 |
| W1599 | raptor-port/src/ui/board-html.ts | 216 | jsx-text | Rmks | 4 |
| W1600 | raptor-port/src/ui/board-html.ts | 266 | attr:title | Info only — not checked against the rules, and earns no OIL | 1,4 |
| W1601 | raptor-port/src/ui/board-html.ts | 268 | attr:title | ${x.cx?'Restore this item':'Cancel this item (CX)'} | 4 |
| W1602 | raptor-port/src/ui/board-html.ts | 269 | attr:title | ${x.info?'Info only — tap to check this item against the rules again':'Info only — show this item on the programme, never check it against the rules, and never earn OIL from it'} | 1,4 |
| W1603 | raptor-port/src/ui/board-html.ts | 270 | attr:title | ${x.flag?'Clear the red box':'Red box — flag for the next scheduler'} | 4 |
| W1604 | raptor-port/src/ui/board-html.ts | 271 | attr:title | Remove this item | 4 |
| W1605 | raptor-port/src/ui/board-html.ts | 274 | literal | e.g. CFG visit shifts SODB right by 15 min — brief the duty crew. | 4 |
| W1606 | raptor-port/src/ui/board-html.ts | 396 | attr:placeholder | ${ph} | 4 |
| W1607 | raptor-port/src/ui/board-html.ts | 417 | attr:title | ${o.cx?'Restore '+what:'Cancel '+what+' (CX)'} | 4 |
| W1608 | raptor-port/src/ui/board-html.ts | 418 | attr:title | ${o.info?'Info only — tap to check this item against the rules again':'Info only — show this item on the programme, never check it against the rules, and never earn OIL from it'} | 1,4 |
| W1609 | raptor-port/src/ui/board-html.ts | 419 | attr:title | ${o.flag?'Clear the red box':'Red box — flag for the next scheduler'} | 4 |
| W1610 | raptor-port/src/ui/board-html.ts | 420 | attr:title | Remove ${what} | 4 |
| W1611 | raptor-port/src/ui/board-html.ts | 426 | jsx-text | Role | 4 |
| W1612 | raptor-port/src/ui/board-html.ts | 431 | attr:title | Add a duty block | 4 |
| W1613 | raptor-port/src/ui/board-html.ts | 431 | jsx-text | + Block | 4 |
| W1614 | raptor-port/src/ui/board-html.ts | 432 | jsx-text | No duty blocks yet — “+ Block” adds one. | 4 |
| W1615 | raptor-port/src/ui/board-html.ts | 435 | attr:title | Add a duty row | 4 |
| W1616 | raptor-port/src/ui/board-html.ts | 435 | jsx-text | + Row | 4 |
| W1617 | raptor-port/src/ui/board-html.ts | 436 | attr:title | Remove this block and its rows | 4 |
| W1618 | raptor-port/src/ui/board-html.ts | 436 | jsx-text | ✕ Block | 4 |
| W1619 | raptor-port/src/ui/board-html.ts | 465 | literal | e.g. SDO swapped — Bane has the PHA at 1700, Pike covers the last hour. | 4 |
| W1620 | raptor-port/src/ui/board-html.ts | 489 | jsx-text | Sims | 4 |
| W1621 | raptor-port/src/ui/board-html.ts | 493 | attr:title | Add an AMT block — BRIEF, BOX and DEBRIEF together | 4 |
| W1622 | raptor-port/src/ui/board-html.ts | 493 | attr:title | Add a ${title} row | 4 |
| W1623 | raptor-port/src/ui/board-html.ts | 535 | attr:title | Empty seat — tap or drop a puck to fill | 4 |
| W1624 | raptor-port/src/ui/board-html.ts | 558 | attr:title | ${lbl} — tap or drop a puck to fill | 4 |
| W1625 | raptor-port/src/ui/board-html.ts | 563 | attr:title | Instructor / observer — tap or drop a puck to fill | 4 |
| W1626 | raptor-port/src/ui/board-html.ts | 589 | literal | e.g. OFT 2 u/s Thu PM — 4-ship EP profile pushed to next week. Divot still owes an AMT EP. | 4 |
| W1627 | raptor-port/src/ui/board-html.ts | 635 | attr:title | Add a personal input (meeting, course…) — it goes straight onto the Ground Programme | 5,4 |
| W1628 | raptor-port/src/ui/board-html.ts | 635 | attr:title | Add a ground item | 4 |
| W1629 | raptor-port/src/ui/board-html.ts | 635 | jsx-text | + Inputs | 5,4 |
| W1630 | raptor-port/src/ui/board-html.ts | 638 | jsx-text | requestOfBox(d,x)))s+=` | 4 |
| W1631 | raptor-port/src/ui/board-html.ts | 639 | jsx-text | No ground items yet — “+ Item” adds one. | 4 |
| W1632 | raptor-port/src/ui/board-html.ts | 649 | literal | e.g. Two medicals already at 1030 — keep the next one clear of the wave brief. | 4 |
| W1633 | raptor-port/src/ui/board-html.ts | 838 | jsx-text | No personal inputs for this day. | 5,4 |
| W1634 | raptor-port/src/ui/board-html.ts | 844 | jsx-text | A rejected input flags nothing until accepted again. Delete it here if it should go entirely. | 5,4 |
| W1635 | raptor-port/src/ui/board-html.ts | 859 | attr:title | Add an unavailability (leave, medical, overseas duty) — pick a date range in the dialog | 5,4 |
| W1636 | raptor-port/src/ui/board-html.ts | 859 | jsx-text | + Add | 4 |
| W1637 | raptor-port/src/ui/board-html.ts | 861 | jsx-text | Nil — everybody is available today. | 5,4 |
| W1638 | raptor-port/src/ui/board-html.ts | 884 | attr:title | Add a SANS availability for this day | 5,4 |
| W1639 | raptor-port/src/ui/board-html.ts | 889 | jsx-text | No SANS availability filed for this day. | 5,4 |
| W1640 | raptor-port/src/ui/board.ts | 62 | literal | This event earns nobody any OIL. Turn the event back on first. | 1,4 |
| W1641 | raptor-port/src/ui/board.ts | 148 | attr:title | Save this day, or apply a saved one | 4 |
| W1642 | raptor-port/src/ui/board.ts | 179 | attr:title | Drag to reorder this wave | 4 |
| W1643 | raptor-port/src/ui/board.ts | 179 | attr:aria-label | Reorder this wave | 4 |
| W1644 | raptor-port/src/ui/board.ts | 183 | attr:aria-label | Wave | 4 |
| W1645 | raptor-port/src/ui/board.ts | 184 | jsx-text | · night | 4 |
| W1646 | raptor-port/src/ui/board.ts | 191 | jsx-text | Traffic | 4 |
| W1647 | raptor-port/src/ui/board.ts | 194 | attr:title | Add an ${REPORTING_LABEL} line to this wave | 4 |
| W1648 | raptor-port/src/ui/board.ts | 194 | attr:title | Add a line to this wave | 4 |
| W1649 | raptor-port/src/ui/board.ts | 194 | jsx-text | + Line | 4 |
| W1650 | raptor-port/src/ui/board.ts | 195 | attr:title | Remove this whole wave | 4 |
| W1651 | raptor-port/src/ui/board.ts | 195 | jsx-text | ✕ Wave | 4 |
| W1652 | raptor-port/src/ui/board.ts | 213 | jsx-text | MSN | 4 |
| W1653 | raptor-port/src/ui/board.ts | 213 | jsx-text | FCP | 4 |
| W1654 | raptor-port/src/ui/board.ts | 213 | jsx-text | RCP | 4 |
| W1655 | raptor-port/src/ui/board.ts | 213 | jsx-text | Notes | 4 |
| W1656 | raptor-port/src/ui/board.ts | 214 | jsx-text | Empty wave — add a line, or remove the wave. | 4 |
| W1657 | raptor-port/src/ui/board.ts | 253 | attr:title | ${esc(fltNoLenMsg(f, w))} | 4 |
| W1658 | raptor-port/src/ui/board.ts | 274 | attr:placeholder | ${esc(s)} | 4 |
| W1659 | raptor-port/src/ui/board.ts | 333 | attr:title | Part of the line above — its OIL switch is on the first row | 1,4 |
| W1660 | raptor-port/src/ui/board.ts | 338 | attr:aria-label | Rally | 4 |
| W1661 | raptor-port/src/ui/board.ts | 343 | attr:aria-label | Published Remarks — read only | 2,4 |
| W1662 | raptor-port/src/ui/board.ts | 352 | attr:title | Remove ${esc(lab)} | 4 |
| W1663 | raptor-port/src/ui/board.ts | 353 | attr:title | Stores configuration | 4 |
| W1664 | raptor-port/src/ui/board.ts | 358 | attr:title | ${cxOn ? 'Restore this line' : 'Cancel this line (CX)'} | 4 |
| W1665 | raptor-port/src/ui/board.ts | 359 | attr:title | ${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'} | 4 |
| W1666 | raptor-port/src/ui/board.ts | 360 | attr:title | Add another aircraft to this formation | 4 |
| W1667 | raptor-port/src/ui/board.ts | 361 | attr:title | Remove this line | 4 |
| W1668 | raptor-port/src/ui/board.ts | 376 | jsx-text | AREA | 4 |
| W1669 | raptor-port/src/ui/board.ts | 391 | attr:title | Add a flying wave | 4 |
| W1670 | raptor-port/src/ui/board.ts | 391 | jsx-text | Flying waves | 4 |
| W1671 | raptor-port/src/ui/board.ts | 391 | jsx-text | + Wave | 4 |
| W1672 | raptor-port/src/ui/board.ts | 431 | attr:title | Drag to reorder this section | 4 |
| W1673 | raptor-port/src/ui/board.ts | 431 | attr:aria-label | Reorder this section | 4 |
| W1674 | raptor-port/src/ui/board.ts | 505 | attr:title | Show / hide the day's checks | 4 |
| W1675 | raptor-port/src/ui/board.ts | 511 | literal | No conflicts flagged for ${esc(d.dow)} ✓ | 4 |
| W1676 | raptor-port/src/ui/board.ts | 542 | attr:title | ${hid ? 'Hidden — it flags no puck and is not counted. ' : ''}Jump to the puck that caused this | 4 |
| W1677 | raptor-port/src/ui/board.ts | 546 | attr:title | ${hid ? 'Flag this again' : 'Hide this warning — it flags no puck and is not counted; it comes back if the situation changes'} | 4 |
| W1678 | raptor-port/src/ui/board.ts | 554 | attr:title | Creates the ${esc(mkPeriod(w, di))} leave war period, with nothing open for bidding, and takes you to the Leave War to open its dates | 4 |
| W1679 | raptor-port/src/ui/board.ts | 557 | jsx-text | No conflicts flagged for this day ✓ | 4 |
| W1680 | raptor-port/src/ui/board.ts | 849 | literal | Every section on ${d.dow} sorted | 4 |
| W1681 | raptor-port/src/ui/board.ts | 850 | literal | Already in order | 4 |
| W1682 | raptor-port/src/ui/board.ts | 939 | literal | Nothing on this day earns OIL, including anything added later | 1,4 |
| W1683 | raptor-port/src/ui/board.ts | 939 | literal | This day can earn OIL again, and the marks underneath are back | 1,4 |
| W1684 | raptor-port/src/ui/board.ts | 998 | literal | Ground programme back to time order | 4 |
| W1685 | raptor-port/src/ui/board.ts | 1011 | literal | Red box: flagged for the next scheduler | 4 |
| W1686 | raptor-port/src/ui/board.ts | 1011 | literal | Red box cleared | 4 |
| W1687 | raptor-port/src/ui/board.ts | 1082 | literal | Programme item added | 4 |
| W1688 | raptor-port/src/ui/board.ts | 1109 | literal | This item is info only: no longer checked against the rules, and earns nobody any OIL | 1,4 |
| W1689 | raptor-port/src/ui/board.ts | 1109 | literal | This item is checked against the rules again and can earn OIL | 1,4 |
| W1690 | raptor-port/src/ui/board.ts | 1139 | literal | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | 1,4 |
| W1691 | raptor-port/src/ui/board.ts | 1139 | literal | Back to editing the schedule | 4 |
| W1692 | raptor-port/src/ui/board.ts | 1150 | literal | Duty block removed | 4 |
| W1693 | raptor-port/src/ui/board.ts | 1161 | literal | Duty row added | 4 |
| W1694 | raptor-port/src/ui/board.ts | 1168 | literal | Duty row removed | 4 |
| W1695 | raptor-port/src/ui/board.ts | 1186 | literal | Sim row added | 4 |
| W1696 | raptor-port/src/ui/board.ts | 1200 | literal | AMT block added (BRIEF / BOX / DEBRIEF) | 4 |
| W1697 | raptor-port/src/ui/board.ts | 1207 | literal | Sim row removed | 4 |
| W1698 | raptor-port/src/ui/board.ts | 1223 | literal | Ground item added | 4 |
| W1699 | raptor-port/src/ui/board.ts | 1255 | literal | Ground item removed | 4 |
| W1700 | raptor-port/src/ui/board.ts | 1575 | literal | Add a wave first | 4 |
| W1701 | raptor-port/src/ui/board.ts | 1628 | literal | SPARE is checked for availability, SC currency, front seat and overlapping SC seats or the SC desk only | 5,4 |
| W1702 | raptor-port/src/ui/board.ts | 1714 | attr:title | Edit the duty templates | 4 |
| W1703 | raptor-port/src/ui/board.ts | 1714 | jsx-text | Add a duty block | 4 |
| W1704 | raptor-port/src/ui/board.ts | 1716 | jsx-text | Empty block | 4 |
| W1705 | raptor-port/src/ui/board.ts | 1726 | literal | Duty block added · ${blk.label \|\| 'DUTY'} | 4 |
| W1706 | raptor-port/src/ui/board.ts | 1749 | attr:title | ${esc(why)} | 4 |
| W1707 | raptor-port/src/ui/board.ts | 1750 | jsx-text | No saved templates yet — save this day to start the library. | 4 |
| W1708 | raptor-port/src/ui/board.ts | 1752 | jsx-text | + Save this day as a template | 4 |
| W1709 | raptor-port/src/ui/board.ts | 1759 | literal | Template library is full — delete one before saving another | 4 |
| W1710 | raptor-port/src/ui/board.ts | 1765 | literal | Saved as "${t.title}" | 4 |
| W1711 | raptor-port/src/ui/board.ts | 1778 | literal | Applying "${t ? t.title : 'template'}" replaces your unpublished edits on ${d.dow} — open Templates and pick it again to confirm | 2,4 |
| W1712 | raptor-port/src/ui/board.ts | 1789 | literal | Applied "${t ? t.title : 'template'}" to ${d.dow} | 4 |
| W1713 | raptor-port/src/ui/board.ts | 1790 | literal | Day template "${t ? t.title : 'template'}" applied | 4 |
| W1714 | raptor-port/src/ui/board.ts | 1815 | literal | "${t.name}" is already the live ${d.dow} | 4 |
| W1715 | raptor-port/src/ui/board.ts | 1839 | literal | Nothing is pending: it matches ${the(cv)}. | 4 |
| W1716 | raptor-port/src/ui/board.ts | 1892 | attr:title | Rename or delete ${esc(name)} | 4 |
| W1717 | raptor-port/src/ui/board.ts | 1897 | literal | Live working copy | 4 |
| W1718 | raptor-port/src/ui/board.ts | 1902 | jsx-text | Issued · read-only | 4 |
| W1719 | raptor-port/src/ui/board.ts | 1903 | jsx-text | read-only — look, don't change | 4 |
| W1720 | raptor-port/src/ui/board.ts | 1907 | jsx-text | This day is published — the issued versions don't change. Switching plans marks the differences as the next AL. | 2,4 |
| W1721 | raptor-port/src/ui/board.ts | 1910 | jsx-text | + Alt Plan | 2,4 |
| W1722 | raptor-port/src/ui/board.ts | 1928 | literal | Plan "${t.name}" created — a copy of the day as it stood | 2,4 |
| W1723 | raptor-port/src/ui/board.ts | 1953 | jsx-text | Role | 4 |
| W1724 | raptor-port/src/ui/board.ts | 1955 | jsx-text | Or just type \u2014 the box takes any text. | 4 |
| W1725 | raptor-port/src/ui/board.ts | 1972 | attr:title | Manage flying waves | 4 |
| W1726 | raptor-port/src/ui/board.ts | 1985 | jsx-text | Flying wave | 4 |
| W1727 | raptor-port/src/ui/board.ts | 1988 | jsx-text | Templates | 4 |
| W1728 | raptor-port/src/ui/board.ts | 1996 | jsx-text | Manage | 4 |
| W1729 | raptor-port/src/ui/board.ts | 1998 | jsx-text | ` + kindRow + ` | 4 |
| W1730 | raptor-port/src/ui/board.ts | 2000 | jsx-text | SC \u00b7 AVALON \u00b7 BB sit outside the day's flying count until they fly \u2014 two waves of four plus an SC standing by reads | 4 |
| W1731 | raptor-port/src/ui/board.ts | 2051 | literal | Desktop layout: pan sideways to read the whole day | 4 |
| W1732 | raptor-port/src/ui/boardland.ts | 66 | jsx-text | 1; if (old[tails[mid]!]! | 4 |
| W1733 | raptor-port/src/ui/boardland.ts | 84 | jsx-text | new Set | 4 |
| W1734 | raptor-port/src/ui/boardland.ts | 98 | jsx-text | string[]): Array | 4 |
| W1735 | raptor-port/src/ui/caldrag.ts | 94 | literal | Only a scheduler can move planning sections | 4 |
| W1736 | raptor-port/src/ui/caldrag.ts | 114 | literal | Only a scheduler can move someone else's input | 5,4 |
| W1737 | raptor-port/src/ui/calpick.ts | 62 | jsx-text | (s.iso | 4 |
| W1738 | raptor-port/src/ui/changesmodel.ts | 404 | jsx-text | isNewToMe(r)): Record | 4 |
| W1739 | raptor-port/src/ui/ChangesWindow.tsx | 81 | attr:aria-label | new to you | 4 |
| W1740 | raptor-port/src/ui/ChangesWindow.tsx | 89 | attr:title | Go to this change | 4 |
| W1741 | raptor-port/src/ui/ChangesWindow.tsx | 90 | attr:title | This change has no place on this page to go to | 4 |
| W1742 | raptor-port/src/ui/ChangesWindow.tsx | 188 | attr:aria-label | Changes | 4 |
| W1743 | raptor-port/src/ui/ChangesWindow.tsx | 190 | attr:aria-label | Show the changes — ${n} change${n === 1 ? '' : 's'} | 4 |
| W1744 | raptor-port/src/ui/ChangesWindow.tsx | 192 | jsx-text | Show ▴ | 4 |
| W1745 | raptor-port/src/ui/ChangesWindow.tsx | 194 | attr:title | Close — History off | 4 |
| W1746 | raptor-port/src/ui/ChangesWindow.tsx | 194 | attr:aria-label | Close | 4 |
| W1747 | raptor-port/src/ui/ChangesWindow.tsx | 201 | literal | Published · nothing waiting to go out | 2 |
| W1748 | raptor-port/src/ui/ChangesWindow.tsx | 201 | literal | Not yet published | 2 |
| W1749 | raptor-port/src/ui/ChangesWindow.tsx | 237 | attr:title | Hide the list — see the schedule | 4 |
| W1750 | raptor-port/src/ui/ChangesWindow.tsx | 237 | attr:aria-label | Hide the list | 4 |
| W1751 | raptor-port/src/ui/ChangesWindow.tsx | 237 | jsx-text | Hide ▾ | 4 |
| W1752 | raptor-port/src/ui/ChangesWindow.tsx | 242 | jsx-text | History on: Tap a gold dot on the schedule | 4 |
| W1753 | raptor-port/src/ui/ChangesWindow.tsx | 258 | attr:aria-label | Which day | 4 |
| W1754 | raptor-port/src/ui/ChangesWindow.tsx | 259 | jsx-text | Week | 4 |
| W1755 | raptor-port/src/ui/ChangesWindow.tsx | 268 | jsx-text | Group by | 4 |
| W1756 | raptor-port/src/ui/ChangesWindow.tsx | 269 | jsx-text | Item | 4 |
| W1757 | raptor-port/src/ui/ChangesWindow.tsx | 270 | jsx-text | Who | 4 |
| W1758 | raptor-port/src/ui/ChangesWindow.tsx | 285 | literal | Nothing new to you on ${(DAYS as any)[di]?.dow \|\| 'this day'}. | 4 |
| W1759 | raptor-port/src/ui/ChangesWindow.tsx | 285 | literal | Nothing new to you this week. | 4 |
| W1760 | raptor-port/src/ui/ChangesWindow.tsx | 286 | literal | No changes on ${(DAYS as any)[di]?.dow \|\| 'this day'} yet. | 4 |
| W1761 | raptor-port/src/ui/ChangesWindow.tsx | 286 | literal | No changes this week yet. | 4 |
| W1762 | raptor-port/src/ui/ChangesWindow.tsx | 296 | jsx-text | NEW | 4 |
| W1763 | raptor-port/src/ui/ChangesWindow.tsx | 327 | jsx-text | Read only — every change and who made it, for everyone to see. | 4 |
| W1764 | raptor-port/src/ui/ChangesWindow.tsx | 329 | jsx-text | Tap a change to go to it — the window stays open. | 4 |
| W1765 | raptor-port/src/ui/CutFields.tsx | 34 | attr:aria-label | The cut-off is set as | 4 |
| W1766 | raptor-port/src/ui/CutFields.tsx | 35 | jsx-text | Days before | 4 |
| W1767 | raptor-port/src/ui/CutFields.tsx | 36 | jsx-text | A weekday | 4 |
| W1768 | raptor-port/src/ui/CutFields.tsx | 40 | jsx-text | Days before the week starts | 4 |
| W1769 | raptor-port/src/ui/CutFields.tsx | 46 | attr:aria-label | Weekday | 4 |
| W1770 | raptor-port/src/ui/CutFields.tsx | 49 | attr:aria-label | Weeks before | 4 |
| W1771 | raptor-port/src/ui/DateBox.tsx | 116 | attr:aria-label | ${p.label}: ${has ? sayDateY(p.value) : 'no date picked'} | 4 |
| W1772 | raptor-port/src/ui/DateCal.tsx | 527 | attr:aria-label | ${MONTHS[ym.m - 1]} ${ym.y} — ${lists ? 'show the dates' : 'choose the month and year'} | 4 |
| W1773 | raptor-port/src/ui/DateCal.tsx | 532 | literal | Jump to a date | 4 |
| W1774 | raptor-port/src/ui/DateCal.tsx | 533 | attr:aria-label | Go to today | 4 |
| W1775 | raptor-port/src/ui/DateCal.tsx | 537 | attr:aria-label | Previous month | 4 |
| W1776 | raptor-port/src/ui/DateCal.tsx | 538 | attr:aria-label | Next month | 4 |
| W1777 | raptor-port/src/ui/DateCal.tsx | 552 | attr:aria-label | ${MONTHS[ym.m - 1]} ${ym.y} | 4 |
| W1778 | raptor-port/src/ui/DaysWindow.tsx | 195 | attr:title | Calendar | 4 |
| W1779 | raptor-port/src/ui/DaysWindow.tsx | 208 | attr:aria-label | Previous month | 4 |
| W1780 | raptor-port/src/ui/DaysWindow.tsx | 210 | attr:aria-label | Next month | 4 |
| W1781 | raptor-port/src/ui/DaysWindow.tsx | 211 | jsx-text | Today | 4 |
| W1782 | raptor-port/src/ui/DaysWindow.tsx | 215 | literal | Tap a date’s button to step: day, night, no fly. Tap a weekday’s heading for every such day. | 4 |
| W1783 | raptor-port/src/ui/DaysWindow.tsx | 216 | literal | Click D, N or NF on a date. Click a weekday’s heading to set every such day from a date onward. | 4 |
| W1784 | raptor-port/src/ui/DaysWindow.tsx | 226 | attr:aria-label | Every ${WD_LONG[i]}… | 4 |
| W1785 | raptor-port/src/ui/DaysWindow.tsx | 245 | attr:title | Set for this date | 4 |
| W1786 | raptor-port/src/ui/DaysWindow.tsx | 257 | attr:aria-label | ${sayDate(iso)}: ${SAY[cur]}. Tap for ${SAY[nextCls(cur, a.weekend)]} | 4 |
| W1787 | raptor-port/src/ui/DaysWindow.tsx | 269 | attr:aria-label | ${sayDate(iso)}: ${SAY[b.cls]} | 4 |
| W1788 | raptor-port/src/ui/DayTplModal.tsx | 19 | jsx-line | DAYTPL_CFG, renameDayTpl, delDayTpl, dayTplSave, dayTplReset, dayTplSummary, | 4 |
| W1789 | raptor-port/src/ui/DayTplModal.tsx | 65 | attr:aria-label | Close | 4 |
| W1790 | raptor-port/src/ui/DayTplModal.tsx | 65 | jsx-text | Day templates | 4 |
| W1791 | raptor-port/src/ui/DayTplModal.tsx | 76 | attr:aria-label | Template name | 4 |
| W1792 | raptor-port/src/ui/DayTplModal.tsx | 81 | jsx-line | No day templates saved yet — open a day's "Templates" menu and choose | 4 |
| W1793 | raptor-port/src/ui/DayTplModal.tsx | 82 | literal | Save this day as a template | 4 |
| W1794 | raptor-port/src/ui/DayTplModal.tsx | 93 | literal | All day templates deleted | 4 |
| W1795 | raptor-port/src/ui/DayTplModal.tsx | 94 | jsx-text | Reset — delete all | 4 |
| W1796 | raptor-port/src/ui/DayTplModal.tsx | 101 | literal | "${title}" template deleted | 4 |
| W1797 | raptor-port/src/ui/DayTplModal.tsx | 102 | jsx-text | Delete template | 4 |
| W1798 | raptor-port/src/ui/DayTplModal.tsx | 103 | jsx-text | Done | 4 |
| W1799 | raptor-port/src/ui/DocConfirm.tsx | 42 | attr:aria-label | Close | 4 |
| W1800 | raptor-port/src/ui/DocConfirm.tsx | 45 | jsx-text | Attach the approval from the leave app now, or file it and attach it later. | 4 |
| W1801 | raptor-port/src/ui/DocConfirm.tsx | 48 | jsx-text | Attach one now, or file it without — for when the record genuinely isn’t available yet. | 5 |
| W1802 | raptor-port/src/ui/DocConfirm.tsx | 53 | jsx-text | No document | 4 |
| W1803 | raptor-port/src/ui/DocConfirm.tsx | 54 | jsx-text | Upload | 4 |
| W1804 | raptor-port/src/ui/DocViewer.tsx | 154 | attr:aria-label | Close | 4 |
| W1805 | raptor-port/src/ui/DocViewer.tsx | 168 | attr:aria-label | Previous document | 4 |
| W1806 | raptor-port/src/ui/DocViewer.tsx | 171 | attr:aria-label | Next document | 4 |
| W1807 | raptor-port/src/ui/DocViewer.tsx | 179 | jsx-text | No document on file for this entry | 4 |
| W1808 | raptor-port/src/ui/DocViewer.tsx | 182 | jsx-text | Upchit | 4 |
| W1809 | raptor-port/src/ui/DocViewer.tsx | 183 | jsx-text | Edit input | 5 |
| W1810 | raptor-port/src/ui/DraftsModal.tsx | 86 | literal | Another plan on this day already has that name | 2,4 |
| W1811 | raptor-port/src/ui/DraftsModal.tsx | 86 | literal | A plan needs a name | 2 |
| W1812 | raptor-port/src/ui/DraftsModal.tsx | 95 | attr:aria-label | Close | 4 |
| W1813 | raptor-port/src/ui/DraftsModal.tsx | 106 | attr:aria-label | Plan name | 2 |
| W1814 | raptor-port/src/ui/DraftsModal.tsx | 117 | literal | "${t!.name}" is the live ${d ? d.dow : 'day'} — its differences from the issued schedule go out as the next AL. | 2,4 |
| W1815 | raptor-port/src/ui/DraftsModal.tsx | 120 | literal | "${t!.name}" is the live ${d ? d.dow : 'day'} — publishing the day publishes it. | 2,4 |
| W1816 | raptor-port/src/ui/DraftsModal.tsx | 121 | literal | A stored alternative — Select makes it the live ${d ? d.dow : 'day'}. The selected plan is what publishes. | 2,4 |
| W1817 | raptor-port/src/ui/DraftsModal.tsx | 125 | jsx-line | No plans on this day yet — choose "+ Alt Plan" in the plans | 2,4 |
| W1818 | raptor-port/src/ui/DraftsModal.tsx | 131 | literal | This plan is the live day — switch to another plan first | 2,4 |
| W1819 | raptor-port/src/ui/DraftsModal.tsx | 131 | literal | Delete this plan | 2 |
| W1820 | raptor-port/src/ui/DraftsModal.tsx | 154 | literal | "${name}" plan deleted | 2 |
| W1821 | raptor-port/src/ui/DraftsModal.tsx | 155 | jsx-text | Delete plan | 2 |
| W1822 | raptor-port/src/ui/DraftsModal.tsx | 157 | literal | Already the live day | 4 |
| W1823 | raptor-port/src/ui/DraftsModal.tsx | 157 | literal | Make this plan the live day | 2,4 |
| W1824 | raptor-port/src/ui/DraftsModal.tsx | 167 | jsx-text | Select | 4 |
| W1825 | raptor-port/src/ui/DraftsModal.tsx | 168 | jsx-text | Done | 4 |
| W1826 | raptor-port/src/ui/drag.ts | 291 | literal | A jet line carries two — FCP and RCP | 4 |
| W1827 | raptor-port/src/ui/drag.ts | 468 | literal | Already in that seat | 4 |
| W1828 | raptor-port/src/ui/Drawer.tsx | 89 | jsx-text | Menu | 4 |
| W1829 | raptor-port/src/ui/Drawer.tsx | 103 | jsx-text | Account | 3 |
| W1830 | raptor-port/src/ui/Drawer.tsx | 110 | jsx-text | Signed in as | 2 |
| W1831 | raptor-port/src/ui/Drawer.tsx | 114 | literal | Switch to the member view | 3 |
| W1832 | raptor-port/src/ui/Drawer.tsx | 114 | literal | Back to the admin view | 3 |
| W1833 | raptor-port/src/ui/Drawer.tsx | 116 | jsx-text | Logout | 4 |
| W1834 | raptor-port/src/ui/DutyTplModal.tsx | 10 | jsx-line | DUTYTPL_CFG, MAX_ROWS, addTpl, delTpl, renameTpl, addTplRow, delTplRow, | 4 |
| W1835 | raptor-port/src/ui/DutyTplModal.tsx | 28 | literal | An ordinary desk — every row is checked like any duty. | 4 |
| W1836 | raptor-port/src/ui/DutyTplModal.tsx | 29 | literal | The SC desk — checked like any duty, and a man on it cannot also stand SC MAIN or SPARE in the same hours. | 4 |
| W1837 | raptor-port/src/ui/DutyTplModal.tsx | 34 | literal | The AVALON desk — until the AVALON flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated. | 1,4 |
| W1838 | raptor-port/src/ui/DutyTplModal.tsx | 35 | literal | The BB desk — the same rules as the AVALON desk: until the BB flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if… | 1,4 |
| W1839 | raptor-port/src/ui/DutyTplModal.tsx | 90 | attr:aria-label | Close | 4 |
| W1840 | raptor-port/src/ui/DutyTplModal.tsx | 90 | jsx-text | Duty templates | 4 |
| W1841 | raptor-port/src/ui/DutyTplModal.tsx | 101 | jsx-text | + New | 4 |
| W1842 | raptor-port/src/ui/DutyTplModal.tsx | 103 | attr:aria-label | Template name | 4 |
| W1843 | raptor-port/src/ui/DutyTplModal.tsx | 107 | jsx-text | None | 4 |
| W1844 | raptor-port/src/ui/DutyTplModal.tsx | 109 | jsx-text | AVALON | 4 |
| W1845 | raptor-port/src/ui/DutyTplModal.tsx | 114 | jsx-text | Role | 4 |
| W1846 | raptor-port/src/ui/DutyTplModal.tsx | 114 | jsx-text | Start | 4 |
| W1847 | raptor-port/src/ui/DutyTplModal.tsx | 114 | jsx-text | End | 4 |
| W1848 | raptor-port/src/ui/DutyTplModal.tsx | 118 | attr:aria-label | Move up | 4 |
| W1849 | raptor-port/src/ui/DutyTplModal.tsx | 120 | attr:aria-label | Move down | 4 |
| W1850 | raptor-port/src/ui/DutyTplModal.tsx | 133 | attr:aria-label | Remove this role | 4 |
| W1851 | raptor-port/src/ui/DutyTplModal.tsx | 140 | jsx-text | + Add role | 4 |
| W1852 | raptor-port/src/ui/DutyTplModal.tsx | 151 | literal | Duty templates reset to defaults | 4 |
| W1853 | raptor-port/src/ui/DutyTplModal.tsx | 152 | jsx-text | Reset to defaults | 4 |
| W1854 | raptor-port/src/ui/DutyTplModal.tsx | 161 | literal | "${title}" template deleted | 4 |
| W1855 | raptor-port/src/ui/DutyTplModal.tsx | 162 | jsx-text | Delete template | 4 |
| W1856 | raptor-port/src/ui/DutyTplModal.tsx | 163 | jsx-text | Done | 4 |
| W1857 | raptor-port/src/ui/edgescroll.ts | 60 | jsx-text | hi - EDGE ? EDGE_STEP : p | 4 |
| W1858 | raptor-port/src/ui/edgescroll.ts | 147 | jsx-text | r.right - w ? 1 : x | 4 |
| W1859 | raptor-port/src/ui/EditWeek.tsx | 272 | attr:title | Aircrew palette | 4 |
| W1860 | raptor-port/src/ui/EveryWeekday.tsx | 30 | literal | No flying set | 4 |
| W1861 | raptor-port/src/ui/EveryWeekday.tsx | 57 | literal | This change could not be saved. | 4 |
| W1862 | raptor-port/src/ui/EveryWeekday.tsx | 60 | literal | Choose the date it starts. | 4 |
| W1863 | raptor-port/src/ui/EveryWeekday.tsx | 61 | literal | Choose the date it ends, or pick No end. | 4 |
| W1864 | raptor-port/src/ui/EveryWeekday.tsx | 62 | literal | It cannot end before it starts. | 4 |
| W1865 | raptor-port/src/ui/EveryWeekday.tsx | 69 | attr:title | Every ${name} | 4 |
| W1866 | raptor-port/src/ui/EveryWeekday.tsx | 70 | jsx-text | Flying | 4 |
| W1867 | raptor-port/src/ui/EveryWeekday.tsx | 81 | jsx-text | : c.cls === 'night' ? | 4 |
| W1868 | raptor-port/src/ui/EveryWeekday.tsx | 86 | literal | S OWN DATE BOX, opening the app | 4 |
| W1869 | raptor-port/src/ui/EveryWeekday.tsx | 89 | jsx-text | From | 4 |
| W1870 | raptor-port/src/ui/EveryWeekday.tsx | 92 | jsx-text | Until | 4 |
| W1871 | raptor-port/src/ui/EveryWeekday.tsx | 94 | jsx-text | No end | 4 |
| W1872 | raptor-port/src/ui/EveryWeekday.tsx | 95 | jsx-text | A date | 4 |
| W1873 | raptor-port/src/ui/EveryWeekday.tsx | 100 | attr:label | The date it ends | 4 |
| W1874 | raptor-port/src/ui/EveryWeekday.tsx | 106 | literal | Every ${name} from ${fromSaid} onward is ${A_DAY[cls]}, until you change it here. A single ${name} can still be set by itself. | 4 |
| W1875 | raptor-port/src/ui/EveryWeekday.tsx | 110 | jsx-text | Cancel | 4 |
| W1876 | raptor-port/src/ui/EveryWeekday.tsx | 111 | jsx-text | Save | 4 |
| W1877 | raptor-port/src/ui/EveryWeekday.tsx | 124 | attr:aria-label | Remove: ${LEAD[r.cls]} from ${sayDateY(r.from)} | 4 |
| W1878 | raptor-port/src/ui/EveryWeekday.tsx | 126 | jsx-text | Remove | 4 |
| W1879 | raptor-port/src/ui/export.ts | 74 | literal | Working draft — not yet signed | 2 |
| W1880 | raptor-port/src/ui/export.ts | 76 | literal | Published — ${verLabel(ver)} | 2 |
| W1881 | raptor-port/src/ui/floatwin.ts | 83 | jsx-text | 0 : a.scrollTop + a.clientHeight | 4 |
| W1882 | raptor-port/src/ui/FloatWindow.tsx | 269 | attr:title | Close | 4 |
| W1883 | raptor-port/src/ui/FloatWindow.tsx | 269 | attr:aria-label | Close ${title} | 4 |
| W1884 | raptor-port/src/ui/HelpPage.tsx | 39 | jsx-text | NEW | 10 |
| W1885 | raptor-port/src/ui/HelpPage.tsx | 72 | literal | Describe the problem first — a sentence is plenty | 10 |
| W1886 | raptor-port/src/ui/HelpPage.tsx | 74 | literal | Report sent — thank you | 10 |
| W1887 | raptor-port/src/ui/HelpPage.tsx | 81 | jsx-text | Help | 10 |
| W1888 | raptor-port/src/ui/HelpPage.tsx | 83 | jsx-text | Report a problem | 10 |
| W1889 | raptor-port/src/ui/HelpPage.tsx | 84 | literal | Send it here | 10 |
| W1890 | raptor-port/src/ui/HelpPage.tsx | 85 | jsx-text | Spotted something wrong, or something that could work better? The schedulers see every report. | 10,4 |
| W1891 | raptor-port/src/ui/HelpPage.tsx | 86 | jsx-text | Category | 10 |
| W1892 | raptor-port/src/ui/HelpPage.tsx | 87 | attr:aria-label | What the report is about | 10 |
| W1893 | raptor-port/src/ui/HelpPage.tsx | 90 | jsx-text | What happened | 10 |
| W1894 | raptor-port/src/ui/HelpPage.tsx | 92 | attr:placeholder | What were you doing, and what went wrong? | 10 |
| W1895 | raptor-port/src/ui/HelpPage.tsx | 93 | jsx-text | Send report | 10 |
| W1896 | raptor-port/src/ui/HelpPage.tsx | 95 | jsx-text | Your reports | 10 |
| W1897 | raptor-port/src/ui/HelpPage.tsx | 100 | jsx-text | Bug reports | 10 |
| W1898 | raptor-port/src/ui/HelpPage.tsx | 103 | literal | ${rows.length} report${rows.length === 1 ? '' : 's'}, newest first. | 10 |
| W1899 | raptor-port/src/ui/HelpPage.tsx | 104 | literal | No reports yet. | 10 |
| W1900 | raptor-port/src/ui/histbubble.ts | 396 | jsx-text | `).join('') + ` | 4 |
| W1901 | raptor-port/src/ui/histbubble.ts | 409 | attr:aria-label | Show every change to this detail | 4 |
| W1902 | raptor-port/src/ui/hlchips-model.ts | 13 | literal | Cat A (4-ship FL) | 4 |
| W1903 | raptor-port/src/ui/hlchips-model.ts | 13 | literal | Cat B (2-ship FL) | 4 |
| W1904 | raptor-port/src/ui/hlchips-model.ts | 13 | literal | Cat C (operational wingman) | 4 |
| W1905 | raptor-port/src/ui/hlchips-model.ts | 13 | literal | Cat D (wingman) | 4 |
| W1906 | raptor-port/src/ui/hlchips-model.ts | 17 | literal | SANS — staff-assigned & NS aircrew | 2,5,4 |
| W1907 | raptor-port/src/ui/hlchips-model.ts | 17 | literal | Instructors (IW / IP / IR / FI) | 4 |
| W1908 | raptor-port/src/ui/hlchips-model.ts | 18 | literal | All flight leads (Cat A & B) | 4 |
| W1909 | raptor-port/src/ui/hlchips-model.ts | 18 | literal | Supervisors — Cat A & B | 4 |
| W1910 | raptor-port/src/ui/hlchips-model.ts | 21 | literal | SC Day current | 4 |
| W1911 | raptor-port/src/ui/hlchips-model.ts | 21 | literal | SC Night current | 4 |
| W1912 | raptor-port/src/ui/hlchips-model.ts | 22 | literal | Day AAR qualified | 4 |
| W1913 | raptor-port/src/ui/hlchips-model.ts | 22 | literal | Night AAR qualified | 4 |
| W1914 | raptor-port/src/ui/hlchips-model.ts | 22 | literal | TF (terrain-following) qualified | 4 |
| W1915 | raptor-port/src/ui/hlchips.tsx | 33 | attr:title | ${glabel} filters — tap to ${open ? 'collapse' : 'expand'} | 4 |
| W1916 | raptor-port/src/ui/HolidaysPanel.tsx | 70 | literal | A leave period already covers part of ${year} — open the Leave War and extend it instead. | 4 |
| W1917 | raptor-port/src/ui/HolidaysPanel.tsx | 71 | literal | The ${year} leave period could not be created. | 4 |
| W1918 | raptor-port/src/ui/HolidaysPanel.tsx | 92 | literal | Row ${r.row}: the same holiday as row ${same}. | 4 |
| W1919 | raptor-port/src/ui/HolidaysPanel.tsx | 97 | literal | — create it, then import again. | 4 |
| W1920 | raptor-port/src/ui/HolidaysPanel.tsx | 157 | literal | The holidays changed since this sheet was read — check the lines, then press Add again. | 4 |
| W1921 | raptor-port/src/ui/HolidaysPanel.tsx | 187 | jsx-text | Holidays | 4 |
| W1922 | raptor-port/src/ui/HolidaysPanel.tsx | 188 | attr:aria-label | Previous year | 4 |
| W1923 | raptor-port/src/ui/HolidaysPanel.tsx | 190 | attr:aria-label | Next year | 4 |
| W1924 | raptor-port/src/ui/HolidaysPanel.tsx | 191 | jsx-text | + Add | 4 |
| W1925 | raptor-port/src/ui/HolidaysPanel.tsx | 193 | jsx-text | Public holidays and Off days, the whole year. | 4 |
| W1926 | raptor-port/src/ui/HolidaysPanel.tsx | 197 | literal | No leave period covers ${year} yet. | 4 |
| W1927 | raptor-port/src/ui/HolidaysPanel.tsx | 199 | literal | No leave period covers ${gaps.map(gapSaid).join(' or ')} ${String(year).slice(-2)} yet. | 4 |
| W1928 | raptor-port/src/ui/HolidaysPanel.tsx | 200 | jsx-text | Create it | 4 |
| W1929 | raptor-port/src/ui/HolidaysPanel.tsx | 231 | jsx-text | Cancel | 4 |
| W1930 | raptor-port/src/ui/HolidaysPanel.tsx | 248 | attr:aria-label | Change: ${h.name}, ${when(h.from, h.to)}, ${KIND_SAID[h.kind]} | 4 |
| W1931 | raptor-port/src/ui/HolidaysPanel.tsx | 261 | attr:title | Save the ${year} holidays as a sheet to fill in | 4 |
| W1932 | raptor-port/src/ui/HolidaysPanel.tsx | 262 | jsx-text | Export sheet | 4 |
| W1933 | raptor-port/src/ui/HolidaysPanel.tsx | 264 | attr:title | Bring in holidays from a filled sheet — you see them before anything is added | 4 |
| W1934 | raptor-port/src/ui/HolidaysPanel.tsx | 265 | jsx-text | Import sheet | 4 |
| W1935 | raptor-port/src/ui/HolidaysPanel.tsx | 308 | literal | Pick its day — or its first and last day — on the calendar. | 4 |
| W1936 | raptor-port/src/ui/HolidaysPanel.tsx | 330 | literal | Saved: ${name.trim() \|\| holidayWord(kind)}, ${when(d.from, d.to)}. | 4 |
| W1937 | raptor-port/src/ui/HolidaysPanel.tsx | 355 | jsx-text | Kind | 4 |
| W1938 | raptor-port/src/ui/HolidaysPanel.tsx | 371 | jsx-text | Name | 4 |
| W1939 | raptor-port/src/ui/HolidaysPanel.tsx | 377 | jsx-text | On grid | 4 |
| W1940 | raptor-port/src/ui/HolidaysPanel.tsx | 382 | attr:title | What the calendars and the Leave War grid print for it — one to three letters or digits | 4 |
| W1941 | raptor-port/src/ui/HolidaysPanel.tsx | 387 | jsx-text | Dates | 4 |
| W1942 | raptor-port/src/ui/HolidaysPanel.tsx | 399 | jsx-text | It is kept here, and saved by itself as soon as a leave period covers it. | 4 |
| W1943 | raptor-port/src/ui/HolidaysPanel.tsx | 409 | attr:aria-label | Delete this ${KIND_SAID[line.kind]} | 4 |
| W1944 | raptor-port/src/ui/HolidaysPanel.tsx | 409 | jsx-text | Delete | 4 |
| W1945 | raptor-port/src/ui/HolidaysPanel.tsx | 413 | jsx-text | Save and add another | 4 |
| W1946 | raptor-port/src/ui/HolidaysPanel.tsx | 414 | jsx-text | Save | 4 |
| W1947 | raptor-port/src/ui/html.ts | 202 | literal | This day's published schedule was created by an older version of the app and can't be shown here. It has not changed — open it on the device that created it. | 2,4 |
| W1948 | raptor-port/src/ui/html.ts | 210 | literal | This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page. | 4 |
| W1949 | raptor-port/src/ui/html.ts | 215 | attr:title | Day details | 4 |
| W1950 | raptor-port/src/ui/html.ts | 318 | literal | Live working copy | 4 |
| W1951 | raptor-port/src/ui/html.ts | 319 | literal | Viewing ${draftVerLabel(di,DPREV.get(di))} — tap to switch plan or look at another version | 2 |
| W1952 | raptor-port/src/ui/html.ts | 321 | literal | Switch between your plans, or look back at an issued version | 2 |
| W1953 | raptor-port/src/ui/html.ts | 322 | attr:title | ${esc(title)} | 4 |
| W1954 | raptor-port/src/ui/html.ts | 336 | attr:title | ${esc(DAYS[di]?.dow\|\|'')} is still a working draft — not yet published | 2,4 |
| W1955 | raptor-port/src/ui/html.ts | 336 | jsx-text | DRAFT | 4 |
| W1956 | raptor-port/src/ui/html.ts | 354 | attr:title | ${title} | 4 |
| W1957 | raptor-port/src/ui/html.ts | 368 | attr:title | ${esc(lbl)} | 4 |
| W1958 | raptor-port/src/ui/html.ts | 370 | jsx-text | Signed | 2 |
| W1959 | raptor-port/src/ui/html.ts | 371 | jsx-text | name(r[0],r[1])).join('')+` | 4 |
| W1960 | raptor-port/src/ui/html.ts | 387 | attr:title | All four have signed this working copy — it has not been published yet; the published schedule stays as-is until you publish | 2,4 |
| W1961 | raptor-port/src/ui/html.ts | 387 | jsx-text | Not yet published | 2 |
| W1962 | raptor-port/src/ui/html.ts | 388 | attr:title | This working copy has edits that have not been signed and published yet — the published schedule stays as-is until you publish | 2,4 |
| W1963 | raptor-port/src/ui/html.ts | 388 | jsx-text | Not yet signed | 2 |
| W1964 | raptor-port/src/ui/html.ts | 404 | attr:title | This day has alternate drafts — pick one to view | 4 |
| W1965 | raptor-port/src/ui/html.ts | 426 | attr:title | This day is published — view the issued schedule or the working draft | 2,4 |
| W1966 | raptor-port/src/ui/html.ts | 428 | jsx-text | Working draft — not issued | 4 |
| W1967 | raptor-port/src/ui/html.ts | 432 | jsx-text | FCP (pilot) | 4 |
| W1968 | raptor-port/src/ui/html.ts | 432 | jsx-text | RCP (WSO) | 4 |
| W1969 | raptor-port/src/ui/html.ts | 432 | jsx-text | Personnel (ground crew) | 4 |
| W1970 | raptor-port/src/ui/html.ts | 433 | jsx-text | Level: | 4 |
| W1971 | raptor-port/src/ui/html.ts | 434 | jsx-text | OCU | 4 |
| W1972 | raptor-port/src/ui/html.ts | 439 | jsx-text | IWSO | 4 |
| W1973 | raptor-port/src/ui/html.ts | 441 | jsx-text | IR exmr | 4 |
| W1974 | raptor-port/src/ui/html.ts | 442 | jsx-text | FWI | 4 |
| W1975 | raptor-port/src/ui/html.ts | 443 | jsx-text | you | 4 |
| W1976 | raptor-port/src/ui/html.ts | 444 | jsx-text | selected | 4 |
| W1977 | raptor-port/src/ui/html.ts | 445 | jsx-text | Flags: | 4 |
| W1978 | raptor-port/src/ui/html.ts | 446 | jsx-text | conflict | 4 |
| W1979 | raptor-port/src/ui/html.ts | 447 | jsx-text | crew pairing — not authorised | 4 |
| W1980 | raptor-port/src/ui/html.ts | 448 | jsx-text | crew rest | 4 |
| W1981 | raptor-port/src/ui/html.ts | 449 | jsx-text | days in a row | 4 |
| W1982 | raptor-port/src/ui/html.ts | 450 | jsx-text | qual / illegal seat | 4 |
| W1983 | raptor-port/src/ui/html.ts | 451 | jsx-text | double turn | 4 |
| W1984 | raptor-port/src/ui/html.ts | 452 | jsx-text | tight turn | 4 |
| W1985 | raptor-port/src/ui/html.ts | 453 | jsx-text | advisory — shift + ground | 4 |
| W1986 | raptor-port/src/ui/html.ts | 454 | jsx-text | crew pairing — needs approval | 4 |
| W1987 | raptor-port/src/ui/html.ts | 455 | jsx-text | misses flight brief | 4 |
| W1988 | raptor-port/src/ui/html.ts | 456 | jsx-text | misses sim brief | 4 |
| W1989 | raptor-port/src/ui/html.ts | 457 | jsx-text | misses flight debrief | 4 |
| W1990 | raptor-port/src/ui/html.ts | 458 | jsx-text | misses sim debrief | 4 |
| W1991 | raptor-port/src/ui/html.ts | 459 | jsx-text | long day | 4 |
| W1992 | raptor-port/src/ui/html.ts | 488 | attr:title | ${esc(p.cs)}${oilTtl(oil)} | 1 |
| W1993 | raptor-port/src/ui/html.ts | 536 | literal | Crew rest — ${trace.dow\|\|'the next day'} is broken by this day: he had to leave by ${trace.leaveBy} | 4 |
| W1994 | raptor-port/src/ui/html.ts | 537 | literal | Consecutive days — ${trace.run.dow\|\|'next Monday'} is his ${ordinal(trace.run.n)} day in a row: a break day is due before then | 4 |
| W1995 | raptor-port/src/ui/html.ts | 539 | attr:title | ${esc(trFlag?trLbl:wlbl(CHIP_LABEL[flag]\|\|flag))} | 4 |
| W1996 | raptor-port/src/ui/html.ts | 553 | literal | Personnel · ground crew | 4 |
| W1997 | raptor-port/src/ui/html.ts | 555 | attr:title | ${ttl}${oilTtl(oil)} | 1 |
| W1998 | raptor-port/src/ui/html.ts | 583 | attr:title | Earns nothing from this event | 4 |
| W1999 | raptor-port/src/ui/html.ts | 585 | attr:title | ${amt==='FO'?'A full day of OIL':amt==='HO'?'Half a day of OIL':'No measurable hours yet'} | 1,4 |
| W2000 | raptor-port/src/ui/html.ts | 606 | jsx-text | Name | 4 |
| W2001 | raptor-port/src/ui/html.ts | 606 | jsx-text | Start | 4 |
| W2002 | raptor-port/src/ui/html.ts | 606 | jsx-text | End | 4 |
| W2003 | raptor-port/src/ui/html.ts | 606 | jsx-text | People | 4 |
| W2004 | raptor-port/src/ui/html.ts | 606 | jsx-text | Rmks | 4 |
| W2005 | raptor-port/src/ui/html.ts | 730 | literal | This schedule was issued before the app kept a record of who was behind this puck | 4 |
| W2006 | raptor-port/src/ui/html.ts | 733 | literal | All ${sum.n} earn — some a full day, some half a day — tap to see each one | 4 |
| W2007 | raptor-port/src/ui/html.ts | 734 | literal | Some of these men earn OIL and some do not — tap to see each one | 1 |
| W2008 | raptor-port/src/ui/html.ts | 735 | literal | All ${sum.n} earn ${sum.bar==='FO'?'a full day':'half a day'} — tap to see each one | 4 |
| W2009 | raptor-port/src/ui/html.ts | 736 | literal | None of these ${sum.n} earn OIL today — tap to see each one | 1,4 |
| W2010 | raptor-port/src/ui/html.ts | 750 | attr:title | ${esc(ttl)} | 4 |
| W2011 | raptor-port/src/ui/html.ts | 770 | jsx-text | + add | 4 |
| W2012 | raptor-port/src/ui/html.ts | 850 | jsx-text | Notes | 4 |
| W2013 | raptor-port/src/ui/html.ts | 864 | literal | Public: goes out with the next amendment — tap to keep it scheduler-only | 2,4 |
| W2014 | raptor-port/src/ui/html.ts | 864 | literal | Scheduler-only: goes out with the next amendment — tap to show it on the view-only schedule | 2,3,4 |
| W2015 | raptor-port/src/ui/html.ts | 865 | literal | Showing on the view-only schedule — tap to keep it scheduler-only | 3,4 |
| W2016 | raptor-port/src/ui/html.ts | 865 | literal | Show this note on the view-only schedule | 3,4 |
| W2017 | raptor-port/src/ui/html.ts | 918 | jsx-text | ids.length?` | 4 |
| W2018 | raptor-port/src/ui/html.ts | 918 | jsx-text | `+[...ids].sort(byCrew).map(pk).join('')+` | 4 |
| W2019 | raptor-port/src/ui/html.ts | 918 | jsx-text | — none free — | 4 |
| W2020 | raptor-port/src/ui/html.ts | 919 | jsx-text | 0?hhmm(w.s):'AM', b=w.e | 4 |
| W2021 | raptor-port/src/ui/html.ts | 936 | jsx-text | Available crew | 5,4 |
| W2022 | raptor-port/src/ui/html.ts | 943 | jsx-text | all of them are under Available all day ↓ | 5,4 |
| W2023 | raptor-port/src/ui/html.ts | 946 | jsx-text | `+(allA.length?grid(allA):` | 4 |
| W2024 | raptor-port/src/ui/html.ts | 946 | jsx-text | Everyone is on the programme. | 4 |
| W2025 | raptor-port/src/ui/html.ts | 1003 | attr:title | ${esc(rmk)} | 4 |
| W2026 | raptor-port/src/ui/html.ts | 1006 | attr:title | Edit this input — times, type, remarks or delete | 5 |
| W2027 | raptor-port/src/ui/html.ts | 1022 | jsx-text | SANS Avail | 5 |
| W2028 | raptor-port/src/ui/html.ts | 1029 | jsx-text | `).join('')+(o.bombs?` | 4 |
| W2029 | raptor-port/src/ui/html.ts | 1091 | attr:title | Jump to the day the run breaks | 4 |
| W2030 | raptor-port/src/ui/html.ts | 1092 | attr:title | As published — that day has changed since | 2,4 |
| W2031 | raptor-port/src/ui/html.ts | 1093 | attr:title | Next week's Monday — load it to see the breach itself | 4 |
| W2032 | raptor-port/src/ui/html.ts | 1116 | attr:title | Jump to the line on this day that caused it | 4 |
| W2033 | raptor-port/src/ui/html.ts | 1118 | attr:title | Next week's ${esc(t.dow\|\|'Monday')} — load it to see the breach itself | 4 |
| W2034 | raptor-port/src/ui/html.ts | 1121 | jsx-text | — had to leave by | 4 |
| W2035 | raptor-port/src/ui/html.ts | 1170 | attr:title | This warning is not on the signed version — publishing this day adds it | 2,4 |
| W2036 | raptor-port/src/ui/html.ts | 1170 | jsx-text | new once signed | 2 |
| W2037 | raptor-port/src/ui/html.ts | 1193 | jsx-text | ✓ No issues | 4 |
| W2038 | raptor-port/src/ui/html.ts | 1211 | attr:title | ${hid?'Hidden — it flags no puck and is not counted. ':''}Jump to the puck that caused this | 4 |
| W2039 | raptor-port/src/ui/html.ts | 1216 | attr:title | ${hid?'Flag this again':'Hide this warning — it flags no puck and is not counted; it comes back if the situation changes'} | 4 |
| W2040 | raptor-port/src/ui/html.ts | 1223 | attr:title | Creates the ${esc(mkPeriod(w,di))} leave war period, with nothing open for bidding, and takes you to the Leave War to open its dates | 4 |
| W2041 | raptor-port/src/ui/html.ts | 1231 | attr:title | On the signed version — publishing this day removes it | 2,4 |
| W2042 | raptor-port/src/ui/html.ts | 1233 | jsx-text | goes away once signed | 2 |
| W2043 | raptor-port/src/ui/html.ts | 1248 | jsx-text | The same aircrew are lit dashed on every other day they appear | 4 |
| W2044 | raptor-port/src/ui/html.ts | 1281 | jsx-text | (prev day) | 4 |
| W2045 | raptor-port/src/ui/html.ts | 1343 | attr:title | Remove this ${REPORTING_LABEL} line | 4 |
| W2046 | raptor-port/src/ui/html.ts | 1344 | attr:title | Drag to move this line | 4 |
| W2047 | raptor-port/src/ui/html.ts | 1380 | attr:title | ${esc(xs.map((i:any)=>i.msg).join(' '))} | 4 |
| W2048 | raptor-port/src/ui/html.ts | 1382 | jsx-text | B','TO | 4 |
| W2049 | raptor-port/src/ui/html.ts | 1388 | jsx-text | B','START | 4 |
| W2050 | raptor-port/src/ui/html.ts | 1414 | attr:title | ${esc(cxText(o))} | 4 |
| W2051 | raptor-port/src/ui/html.ts | 1427 | attr:title | ${esc(cxText(inp))} | 4 |
| W2052 | raptor-port/src/ui/html.ts | 1429 | attr:title | Flagged for the next scheduler | 4 |
| W2053 | raptor-port/src/ui/html.ts | 1437 | attr:title | Info only — not checked against the rules, and earns no OIL | 1 |
| W2054 | raptor-port/src/ui/html.ts | 1461 | attr:title | ${role} — this row flies, so it is fully cross-checked. Click to make this line ${sp?'MAIN':'SPARE'}. | 4 |
| W2055 | raptor-port/src/ui/html.ts | 1462 | literal | ${who}checked for availability, SC currency, the front seat and another ${whole?'seat or the desk':'SC seat or the SC desk'} in the same hours only. | 5,4 |
| W2056 | raptor-port/src/ui/html.ts | 1464 | literal | MAIN — ${four('')} Click to make this line SPARE. | 4 |
| W2057 | raptor-port/src/ui/html.ts | 1465 | literal | MAIN — fully cross-checked. Click to make this line SPARE. | 4 |
| W2058 | raptor-port/src/ui/html.ts | 1480 | attr:title | Tick if this row is activated to fly: its crew rest, OIL and warnings then count it as a flight. | 1,4 |
| W2059 | raptor-port/src/ui/html.ts | 1480 | jsx-text | FLIES | 4 |
| W2060 | raptor-port/src/ui/html.ts | 1481 | attr:title | Flies: ticked by hand. Tap to take the tick off. | 4 |
| W2061 | raptor-port/src/ui/html.ts | 1481 | jsx-text | ✓ FLIES | 4 |
| W2062 | raptor-port/src/ui/html.ts | 1482 | literal | Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX. | 4 |
| W2063 | raptor-port/src/ui/html.ts | 1482 | literal | Flies: activated to fly. | 4 |
| W2064 | raptor-port/src/ui/html.ts | 1483 | attr:title | ${why} | 4 |
| W2065 | raptor-port/src/ui/html.ts | 1535 | attr:title | ${esc(lateNote(l))} | 4 |
| W2066 | raptor-port/src/ui/html.ts | 1535 | jsx-text | LATE | 4 |
| W2067 | raptor-port/src/ui/html.ts | 1550 | attr:title | ${off?'LATE mark hidden here and on the week — tap to show it again':'Tap to hide this LATE mark from the board and the week (the Inputs page keeps it)'} | 5,4 |
| W2068 | raptor-port/src/ui/html.ts | 1596 | attr:title | Rejected from the day — flags nothing until accepted again | 4 |
| W2069 | raptor-port/src/ui/html.ts | 1692 | attr:aria-label | something new to you | 4 |
| W2070 | raptor-port/src/ui/html.ts | 1695 | attr:title | See the ${nd} change${nd>1?'s':''} waiting to go out as AL${nextSeq(di)} on ${d.dow}, and go to each | 2 |
| W2071 | raptor-port/src/ui/html.ts | 1696 | attr:title | ${nd} change${nd>1?'s':''} on this day — ahead of the issued schedule until you publish an AL | 2,4 |
| W2072 | raptor-port/src/ui/html.ts | 1698 | attr:title | ${cc.fresh} change${cc.fresh>1?'s':''} on ${d.dow} new to you — see who made ${cc.fresh>1?'them':'it'}, and go to each | 4 |
| W2073 | raptor-port/src/ui/html.ts | 1700 | attr:title | Every change on ${d.dow} and who made it | 4 |
| W2074 | raptor-port/src/ui/html.ts | 1708 | attr:title | A stored draft — not the issued schedule | 4 |
| W2075 | raptor-port/src/ui/html.ts | 1708 | jsx-text | Draft | 4 |
| W2076 | raptor-port/src/ui/html.ts | 1710 | attr:title | ${d.dow} is published, but this is the working draft — not what was issued | 2 |
| W2077 | raptor-port/src/ui/html.ts | 1710 | jsx-text | Working draft | 4 |
| W2078 | raptor-port/src/ui/html.ts | 1712 | attr:title | ${sgOK?'Publish '+d.dow+' — approve this day only':'Sign off '+signMissing(di).join(', ')+' before publishing '+d.dow} | 2,4 |
| W2079 | raptor-port/src/ui/html.ts | 1712 | jsx-text | Publish day | 2,4 |
| W2080 | raptor-port/src/ui/html.ts | 1730 | literal | Sign off ${signMissing(di).join(', ')} before publishing AL${alN} | 2 |
| W2081 | raptor-port/src/ui/html.ts | 1747 | attr:title | ${back?`Withdraw ${esc(verLabel(cv))} on ${d.dow}. ${esc(backName)} comes back and credits less OIL, and some of ${esc(verLabel(cv))}’s OIL is already spent on the Leave War. Tap to confirm.`:`Withdraw ${esc(verLabel(cv… | 1,2 |
| W2082 | raptor-port/src/ui/html.ts | 1747 | jsx-text | Withdraw — confirm | 4 |
| W2083 | raptor-port/src/ui/html.ts | 1747 | literal | Withdraw ${esc(verLabel(cv))} on ${d.dow}. Its OIL credits are already spent on the Leave War, and republishing restores them. Tap to confirm. | 1,2 |
| W2084 | raptor-port/src/ui/html.ts | 1748 | attr:title | Unpublish ${d.dow} — pull ${esc(verLabel(cv))} back to a working copy to correct it; republishing reissues the same version | 2 |
| W2085 | raptor-port/src/ui/html.ts | 1748 | jsx-text | Unpublish | 2 |
| W2086 | raptor-port/src/ui/html.ts | 1752 | attr:title | ${d.dow} — approval, AL versions, advisories | 2 |
| W2087 | raptor-port/src/ui/html.ts | 1811 | attr:title | Return to your live working copy | 4 |
| W2088 | raptor-port/src/ui/html.ts | 1811 | jsx-text | ← Back to live copy | 4 |
| W2089 | raptor-port/src/ui/html.ts | 1819 | attr:title | Make this plan your live working copy — your current one is stowed under its own name | 2 |
| W2090 | raptor-port/src/ui/html.ts | 1819 | jsx-text | Switch to this plan | 2 |
| W2091 | raptor-port/src/ui/html.ts | 1822 | attr:title | This discards your ${pend} unpublished edit${pend===1?'':'s'} on the working copy — the issued versions stay unchanged | 2 |
| W2092 | raptor-port/src/ui/html.ts | 1822 | attr:title | Keep your current working copy | 4 |
| W2093 | raptor-port/src/ui/html.ts | 1822 | jsx-text | Keep editing | 4 |
| W2094 | raptor-port/src/ui/html.ts | 1823 | attr:title | Load this issued version onto your working copy to edit — nothing is published until you Publish AL, and the issued versions stay unchanged | 2 |
| W2095 | raptor-port/src/ui/html.ts | 1823 | jsx-text | Load onto working copy | 4 |
| W2096 | raptor-port/src/ui/html.ts | 1826 | jsx-text | Viewing | 4 |
| W2097 | raptor-port/src/ui/html.ts | 1839 | attr:title | Show this day's crew in the aircrew panel | 4 |
| W2098 | raptor-port/src/ui/html.ts | 1839 | attr:title | Open scheduler board | 4 |
| W2099 | raptor-port/src/ui/html.ts | 1840 | attr:title | Save this day, or apply a saved template | 4 |
| W2100 | raptor-port/src/ui/html.ts | 1840 | jsx-text | Templates | 4 |
| W2101 | raptor-port/src/ui/html.ts | 1841 | attr:title | Aircraft per wave · standalone lines after the slash | 4 |
| W2102 | raptor-port/src/ui/html.ts | 1887 | jsx-text | Common Programme | 4 |
| W2103 | raptor-port/src/ui/html.ts | 1911 | jsx-text | Nothing squadron-wide yet — add notes and programme items from the scheduler board. | 3,4 |
| W2104 | raptor-port/src/ui/html.ts | 1921 | jsx-text | Flying waves | 4 |
| W2105 | raptor-port/src/ui/html.ts | 1923 | jsx-text | No flying — ground day. | 4 |
| W2106 | raptor-port/src/ui/html.ts | 1932 | attr:title | Drag to reorder this wave | 4 |
| W2107 | raptor-port/src/ui/html.ts | 1932 | attr:aria-label | Reorder this wave | 4 |
| W2108 | raptor-port/src/ui/html.ts | 1933 | attr:title | ${esc((SAWAVE[w.kind]\|\|{}).note\|\|'Standalone — outside the day\u2019s flying count')} | 4 |
| W2109 | raptor-port/src/ui/html.ts | 1934 | attr:title | Add an ${REPORTING_LABEL} line to this wave | 4 |
| W2110 | raptor-port/src/ui/html.ts | 1934 | jsx-text | Traffic | 4 |
| W2111 | raptor-port/src/ui/html.ts | 1943 | jsx-text | SHIFT | 4 |
| W2112 | raptor-port/src/ui/html.ts | 1943 | jsx-text | FCP / RCP | 4 |
| W2113 | raptor-port/src/ui/html.ts | 1943 | jsx-text | RMKS | 4 |
| W2114 | raptor-port/src/ui/html.ts | 1944 | jsx-text | MSN | 4 |
| W2115 | raptor-port/src/ui/html.ts | 2016 | attr:title | ${esc(fltNoLenMsg(f,w))} | 4 |
| W2116 | raptor-port/src/ui/html.ts | 2031 | attr:title | Remove ${esc(lab)} | 4 |
| W2117 | raptor-port/src/ui/html.ts | 2032 | attr:title | Stores configuration | 4 |
| W2118 | raptor-port/src/ui/html.ts | 2079 | jsx-text | AREA | 4 |
| W2119 | raptor-port/src/ui/html.ts | 2092 | jsx-text | Duties | 4 |
| W2120 | raptor-port/src/ui/html.ts | 2121 | jsx-text | Sims | 4 |
| W2121 | raptor-port/src/ui/html.ts | 2163 | jsx-text | Ground Programme | 4 |
| W2122 | raptor-port/src/ui/html.ts | 2163 | jsx-text | requestOfBox(d,x))?` | 4 |
| W2123 | raptor-port/src/ui/html.ts | 2239 | jsx-text | A rejected input flags nothing until accepted again. Delete it here if it should go entirely. | 5 |
| W2124 | raptor-port/src/ui/html.ts | 2243 | jsx-text | Nil | 4 |
| W2125 | raptor-port/src/ui/html.ts | 2281 | jsx-text | Unavailable | 5 |
| W2126 | raptor-port/src/ui/html.ts | 2314 | attr:title | Drag to reorder this section | 4 |
| W2127 | raptor-port/src/ui/html.ts | 2314 | attr:aria-label | Reorder this section | 4 |
| W2128 | raptor-port/src/ui/html.ts | 2315 | jsx-text | bit.replace(/( | 4 |
| W2129 | raptor-port/src/ui/html.ts | 2355 | jsx-text | all day | 4 |
| W2130 | raptor-port/src/ui/html.ts | 2378 | attr:title | SANS availability | 5 |
| W2131 | raptor-port/src/ui/html.ts | 2410 | literal | To take an input off, press Reject on it in Personal Inputs below. | 5 |
| W2132 | raptor-port/src/ui/html.ts | 2445 | jsx-text | lSeat(di,p.id,p.key,ed)).join(''),key+'.+',ed,ppl.length | 4 |
| W2133 | raptor-port/src/ui/html.ts | 2471 | attr:title | Take its row off ${esc(other)}'s ground programme | 4 |
| W2134 | raptor-port/src/ui/html.ts | 2474 | attr:title | Take it back out of Unavailable, into Personal Inputs | 5 |
| W2135 | raptor-port/src/ui/html.ts | 2474 | jsx-text | Reject | 4 |
| W2136 | raptor-port/src/ui/html.ts | 2475 | attr:title | ${inp.acc==='u'?'Take it back out of Unavailable, into Personal Inputs':'Take its row off the ground programme'} | 5 |
| W2137 | raptor-port/src/ui/html.ts | 2475 | literal | Take its row off the ground programme | 4 |
| W2138 | raptor-port/src/ui/html.ts | 2483 | attr:title | Its row is on the ground programme of ${esc(w)} — load that week to change it | 4 |
| W2139 | raptor-port/src/ui/html.ts | 2485 | attr:title | ${ttl} | 4 |
| W2140 | raptor-port/src/ui/html.ts | 2496 | literal | Accept into the ground programme | 4 |
| W2141 | raptor-port/src/ui/html.ts | 2496 | literal | File under Unavailable | 5 |
| W2142 | raptor-port/src/ui/html.ts | 2498 | literal | Accept onto the Common Programme | 4 |
| W2143 | raptor-port/src/ui/html.ts | 2516 | jsx-text | Sign-off | 2 |
| W2144 | raptor-port/src/ui/html.ts | 2525 | attr:title | ${esc(lbl)}${sch?' — appointed schedulers only':''}${v&&PEOPLE[v]?' — '+esc(PEOPLE[v].name\|\|PEOPLE[v].cs):''} | 4 |
| W2145 | raptor-port/src/ui/html.ts | 2527 | attr:aria-label | ${esc(lbl)} — ${esc((DAYS[di]\|\|{}).dow\|\|'')} | 4 |
| W2146 | raptor-port/src/ui/html.ts | 2531 | jsx-text | Clear | 4 |
| W2147 | raptor-port/src/ui/html.ts | 2540 | literal | Signed — this day can be published | 2,4 |
| W2148 | raptor-port/src/ui/html.ts | 2544 | literal | Published at ${esc(verLabel(cv))} · ${chg} change${chg>1?'s':''} to publish — Publish AL${nextSeq(di)} | 2 |
| W2149 | raptor-port/src/ui/html.ts | 2545 | literal | Published at ${esc(verLabel(cv))} — no changes to publish | 2 |
| W2150 | raptor-port/src/ui/html.ts | 2587 | jsx-text | No amendment has touched this day yet | 2,4 |
| W2151 | raptor-port/src/ui/html.ts | 2593 | jsx-text | `:chg?` | 4 |
| W2152 | raptor-port/src/ui/html.ts | 2595 | jsx-text | What this day is tasking | 4 |
| W2153 | raptor-port/src/ui/html.ts | 2600 | literal | Leave / downchit | 4 |
| W2154 | raptor-port/src/ui/html.ts | 2600 | literal | Free all day | 4 |
| W2155 | raptor-port/src/ui/html.ts | 2602 | jsx-text | Issues on this day | 4 |
| W2156 | raptor-port/src/ui/html.ts | 2603 | jsx-text | Nothing flagged — this day is clean ✓ | 4 |
| W2157 | raptor-port/src/ui/html.ts | 2615 | attr:title | ${w.off?'Hidden — it flags no puck and is not counted. ':''}Jump to the puck that caused this | 4 |
| W2158 | raptor-port/src/ui/icons.tsx | 268 | jsx-text | TALON | 4 |
| W2159 | raptor-port/src/ui/inputcard-model.ts | 153 | jsx-text | string, people: Record | 5 |
| W2160 | raptor-port/src/ui/InputCard.tsx | 81 | jsx-text | LATE | 5 |
| W2161 | raptor-port/src/ui/InputCard.tsx | 82 | jsx-text | OIL? | 1,5 |
| W2162 | raptor-port/src/ui/InputCard.tsx | 83 | attr:title | View the document | 5 |
| W2163 | raptor-port/src/ui/InputCard.tsx | 84 | jsx-text | No document | 5 |
| W2164 | raptor-port/src/ui/inputedit.tsx | 170 | literal | Blocked: ${cs} is ${numOf(to)}'s from ${noticeDay(d)}. Only ${cs} or an admin of both ${numOf(from)} and ${numOf(to)} can change leave that runs across his move. | 3,5,9,4 |
| W2165 | raptor-port/src/ui/inputedit.tsx | 263 | literal | The whole day | 5,4 |
| W2166 | raptor-port/src/ui/inputedit.tsx | 265 | literal | Afternoon and evening — 12:01 onwards | 5 |
| W2167 | raptor-port/src/ui/inputedit.tsx | 266 | literal | Type your own start and end time | 5 |
| W2168 | raptor-port/src/ui/inputedit.tsx | 319 | literal | SANS Availability is for SANS aircrew only | 5,4 |
| W2169 | raptor-port/src/ui/inputedit.tsx | 345 | literal | ${p.cs} is SANS from ${isoDayWords(next)}. Take him out of this offer to add earlier days. | 5,4 |
| W2170 | raptor-port/src/ui/inputedit.tsx | 349 | literal | Tick at least one of Fly / AMT / OFT | 5 |
| W2171 | raptor-port/src/ui/inputedit.tsx | 397 | literal | Saved ${noticeRun(t.from, draft.end)}. ${out} ${t.left.length === 1 ? 'was' : 'were'} left out because ${subject} SANS from ${noticeDay(t.from)}. | 5,9,4 |
| W2172 | raptor-port/src/ui/inputedit.tsx | 432 | literal | A SANS availability is already filed for one of these days — edit that entry instead of adding another | 5,4 |
| W2173 | raptor-port/src/ui/inputedit.tsx | 461 | literal | An upchit is a single date — pick the day he is medically up | 5,4 |
| W2174 | raptor-port/src/ui/inputedit.tsx | 478 | literal | There is no medical-down entry to upchit — file the medical input first | 5 |
| W2175 | raptor-port/src/ui/inputedit.tsx | 485 | literal | That medical-down period is already closed — edit the existing upchit instead | 5 |
| W2176 | raptor-port/src/ui/inputedit.tsx | 488 | literal | An upchit is already filed for that day — edit that entry instead | 5,4 |
| W2177 | raptor-port/src/ui/inputedit.tsx | 508 | literal | An upchit is filed for ${hit.date} — edit or delete that entry first | 5 |
| W2178 | raptor-port/src/ui/inputedit.tsx | 614 | literal | The statuses you kept cover every day of this entry — nothing left to file | 5,4 |
| W2179 | raptor-port/src/ui/inputedit.tsx | 755 | literal | Give the input a start and end time, or tick All day | 5,4 |
| W2180 | raptor-port/src/ui/inputedit.tsx | 772 | literal | Give the input a start and end that are not the same time | 5 |
| W2181 | raptor-port/src/ui/inputedit.tsx | 780 | literal | Pick the date first | 5 |
| W2182 | raptor-port/src/ui/inputedit.tsx | 787 | literal | A medical entry stays medical — delete it instead if it was filed in error | 5 |
| W2183 | raptor-port/src/ui/inputedit.tsx | 790 | literal | An upchit stays an upchit — delete it instead if it was filed in error | 5 |
| W2184 | raptor-port/src/ui/inputedit.tsx | 811 | literal | The end date has to fall on or after the start date | 5 |
| W2185 | raptor-port/src/ui/inputedit.tsx | 837 | literal | Keep at least one document on this entry. Add the replacement before removing the last file. | 5 |
| W2186 | raptor-port/src/ui/inputedit.tsx | 982 | literal | Nobody has answered the OIL question for ${oilDayLabel(iso)} | 1,5,4 |
| W2187 | raptor-port/src/ui/inputedit.tsx | 1139 | literal | Filing for other people is switched off — you can file this only for yourself | 5 |
| W2188 | raptor-port/src/ui/inputedit.tsx | 1141 | literal | You can file ${what} only for yourself | 5 |
| W2189 | raptor-port/src/ui/inputedit.tsx | 1174 | literal | Sign in with your own account to file an input | 3,5 |
| W2190 | raptor-port/src/ui/inputedit.tsx | 1262 | literal | An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead | 5 |
| W2191 | raptor-port/src/ui/inputedit.tsx | 1315 | literal | That input is no longer there — nothing was saved | 5 |
| W2192 | raptor-port/src/ui/inputedit.tsx | 1336 | literal | You can only edit your own inputs | 5 |
| W2193 | raptor-port/src/ui/inputedit.tsx | 1346 | literal | Open this input’s own window to change who is in it | 5 |
| W2194 | raptor-port/src/ui/inputedit.tsx | 1357 | literal | Only a scheduler can move an input to another person | 5,4 |
| W2195 | raptor-port/src/ui/inputedit.tsx | 1373 | literal | A scheduler has moved this input, so only a scheduler can change it to ${inpType(draft.type)} | 5,4 |
| W2196 | raptor-port/src/ui/inputedit.tsx | 1709 | literal | Blocked: nothing was kept | 5 |
| W2197 | raptor-port/src/ui/inputedit.tsx | 1710 | literal | Blocked: that change is not yours to make | 5 |
| W2198 | raptor-port/src/ui/inputedit.tsx | 1713 | literal | Blocked: ${why.replace(/[.\s]+$/, '')}. Nothing was saved${several ? ' for anyone: take that person off the list, or change it' : ''}. | 5 |
| W2199 | raptor-port/src/ui/inputedit.tsx | 1779 | jsx-text | ReturnType | 5 |
| W2200 | raptor-port/src/ui/inputedit.tsx | 1855 | literal | That input is no longer there — nothing was changed | 5 |
| W2201 | raptor-port/src/ui/inputedit.tsx | 1867 | literal | Unavailable is a real person’s day — ${PEOPLE[personId].cs} cannot take it | 5,4 |
| W2202 | raptor-port/src/ui/inputedit.tsx | 1871 | literal | An ${PEOPLE[from].cs} input can only be changed in its own window. Open it to change who it is for. | 5 |
| W2203 | raptor-port/src/ui/inputedit.tsx | 2094 | literal | That input is no longer there | 5 |
| W2204 | raptor-port/src/ui/inputedit.tsx | 2105 | literal | You can only delete your own inputs | 5 |
| W2205 | raptor-port/src/ui/inputedit.tsx | 2155 | literal | Filing for other people is switched off — an admin can change this. | 3,5 |
| W2206 | raptor-port/src/ui/inputedit.tsx | 2159 | literal | A scheduler has changed who is in this — ask an admin to change it for everyone | 3,5,4 |
| W2207 | raptor-port/src/ui/inputedit.tsx | 2161 | literal | Only ${PEOPLE[by] ? PEOPLE[by].cs : 'whoever filed it'} — who filed it — or an admin can ${what} | 3,5 |
| W2208 | raptor-port/src/ui/inputedit.tsx | 2238 | literal | Pick at least one person | 5 |
| W2209 | raptor-port/src/ui/inputedit.tsx | 2261 | literal | This input could not be saved | 5 |
| W2210 | raptor-port/src/ui/inputedit.tsx | 2274 | literal | A scheduler has moved this input under Unavailable, so only a scheduler can put ALL AVAIL or ALL in it | 5,4 |
| W2211 | raptor-port/src/ui/inputedit.tsx | 2560 | literal | Fly / OFT / AMT | 5 |
| W2212 | raptor-port/src/ui/inputscal-model.ts | 199 | jsx-text | = first, tail: item.b | 5 |
| W2213 | raptor-port/src/ui/InputsCal.tsx | 531 | jsx-text | Math.abs(dy)) live.current.step(dx | 5 |
| W2214 | raptor-port/src/ui/InputsCal.tsx | 982 | literal | Only ${PEOPLE[one] ? PEOPLE[one].cs : 'its owner'} or an admin can delete this input | 3,5 |
| W2215 | raptor-port/src/ui/InputsCal.tsx | 1003 | literal | That input is no longer there | 5 |
| W2216 | raptor-port/src/ui/InputsCal.tsx | 1004 | literal | Input deleted for ${everyoneIn(it)} | 5 |
| W2217 | raptor-port/src/ui/InputsCal.tsx | 1013 | literal | You are out of this input | 5 |
| W2218 | raptor-port/src/ui/InputsCal.tsx | 1028 | jsx-text | + Note | 5 |
| W2219 | raptor-port/src/ui/InputsCal.tsx | 1036 | attr:placeholder | Day title… | 5,4 |
| W2220 | raptor-port/src/ui/InputsCal.tsx | 1037 | attr:aria-label | Day title | 5,4 |
| W2221 | raptor-port/src/ui/InputsCal.tsx | 1050 | jsx-text | + Input | 5 |
| W2222 | raptor-port/src/ui/InputsCal.tsx | 1074 | attr:aria-label | Add people to this note | 5 |
| W2223 | raptor-port/src/ui/InputsCal.tsx | 1074 | attr:title | Add people | 5 |
| W2224 | raptor-port/src/ui/InputsCal.tsx | 1075 | literal | Add words to this note | 5 |
| W2225 | raptor-port/src/ui/InputsCal.tsx | 1077 | attr:aria-label | Delete note | 5 |
| W2226 | raptor-port/src/ui/InputsCal.tsx | 1077 | attr:title | Delete this note | 5 |
| W2227 | raptor-port/src/ui/InputsCal.tsx | 1083 | attr:title | Drag to reorder | 5 |
| W2228 | raptor-port/src/ui/InputsCal.tsx | 1092 | attr:aria-label | Edit planning note | 5 |
| W2229 | raptor-port/src/ui/InputsCal.tsx | 1153 | attr:aria-label | New planning note | 5 |
| W2230 | raptor-port/src/ui/InputsCal.tsx | 1154 | attr:placeholder | e.g. brief the new guy | 5 |
| W2231 | raptor-port/src/ui/InputsCal.tsx | 1158 | jsx-text | + people | 5 |
| W2232 | raptor-port/src/ui/InputsCal.tsx | 1168 | literal | No inputs match on this day. | 5,4 |
| W2233 | raptor-port/src/ui/InputsCal.tsx | 1169 | literal | No inputs on this day. Tap + Input to add one. | 5,4 |
| W2234 | raptor-port/src/ui/InputsCal.tsx | 1176 | jsx-text | Clear filters | 5 |
| W2235 | raptor-port/src/ui/InputsCal.tsx | 1195 | attr:label | Delete this input? | 5 |
| W2236 | raptor-port/src/ui/InputsCal.tsx | 1197 | literal | Delete this input for ${it.ph ? '' : 'all '}${everyoneIn(it)}? | 5 |
| W2237 | raptor-port/src/ui/InputsCal.tsx | 1197 | literal | Take yourself out of this input? | 5 |
| W2238 | raptor-port/src/ui/InputsCal.tsx | 1257 | literal | SANS · Pilots | 5 |
| W2239 | raptor-port/src/ui/InputsCal.tsx | 1265 | literal | Already on this row | 5 |
| W2240 | raptor-port/src/ui/InputsCal.tsx | 1278 | attr:aria-label | Close | 5 |
| W2241 | raptor-port/src/ui/InputsCal.tsx | 1281 | jsx-text | For the note: | 5 |
| W2242 | raptor-port/src/ui/InputsCal.tsx | 1293 | attr:title | ${glabel} filters — fade everyone not in them | 5 |
| W2243 | raptor-port/src/ui/InputsCal.tsx | 1312 | jsx-text | Cancel | 5 |
| W2244 | raptor-port/src/ui/InputsCal.tsx | 1329 | attr:aria-label | Previous month | 5 |
| W2245 | raptor-port/src/ui/InputsCal.tsx | 1333 | attr:aria-label | Next month | 5 |
| W2246 | raptor-port/src/ui/InputsCal.tsx | 1334 | jsx-text | Today | 5,4 |
| W2247 | raptor-port/src/ui/InputsCal.tsx | 1338 | literal | HOW THIS WORKS | 5 |
| W2248 | raptor-port/src/ui/InputsCal.tsx | 1350 | jsx-text | absence | 5 |
| W2249 | raptor-port/src/ui/InputsCal.tsx | 1351 | jsx-text | duty | 5,4 |
| W2250 | raptor-port/src/ui/InputsCal.tsx | 1354 | literal | Show the month compact | 5 |
| W2251 | raptor-port/src/ui/InputsCal.tsx | 1354 | literal | Show every input | 5 |
| W2252 | raptor-port/src/ui/InputsCal.tsx | 1360 | jsx-text | Tap a day to open it. Tap a | 5,4 |
| W2253 | raptor-port/src/ui/InputsCal.tsx | 1360 | jsx-text | bar | 5 |
| W2254 | raptor-port/src/ui/InputsCal.tsx | 1360 | jsx-text | to edit it, drag to move it. | 5 |
| W2255 | raptor-port/src/ui/InputsCal.tsx | 1361 | jsx-text | Several days: | 5,4 |
| W2256 | raptor-port/src/ui/InputsCal.tsx | 1361 | jsx-text | drag across them (phone: hold, then drag). | 5 |
| W2257 | raptor-port/src/ui/InputsCal.tsx | 1362 | jsx-text | no-fly · green public holiday · grey Off day. | 5,4 |
| W2258 | raptor-port/src/ui/InputsCal.tsx | 1447 | attr:title | ${more} more on ${fmtDay(week[c])} — open the day | 5,4 |
| W2259 | raptor-port/src/ui/InputsPage.tsx | 87 | attr:label | Posted out / archived | 5 |
| W2260 | raptor-port/src/ui/InputsPage.tsx | 98 | attr:label | Deleted | 5 |
| W2261 | raptor-port/src/ui/InputsPage.tsx | 447 | literal | OIL decision updated | 1,5 |
| W2262 | raptor-port/src/ui/InputsPage.tsx | 500 | jsx-text | pins.indexOf(r) | 5 |
| W2263 | raptor-port/src/ui/InputsPage.tsx | 552 | attr:title | Sort by ${label.toLowerCase()} | 5 |
| W2264 | raptor-port/src/ui/InputsPage.tsx | 590 | attr:aria-label | Inputs | 5 |
| W2265 | raptor-port/src/ui/InputsPage.tsx | 593 | literal | Leave, medical, duties and other commitments | 5 |
| W2266 | raptor-port/src/ui/InputsPage.tsx | 593 | literal | SANS availability — who has committed, and how many more are needed | 5 |
| W2267 | raptor-port/src/ui/InputsPage.tsx | 594 | literal | Who is medically down, owing an upchit, or upchitted | 5 |
| W2268 | raptor-port/src/ui/InputsPage.tsx | 596 | jsx-text | : t === 'sans' ? | 5 |
| W2269 | raptor-port/src/ui/InputsPage.tsx | 600 | attr:title | Medically down now | 5 |
| W2270 | raptor-port/src/ui/InputsPage.tsx | 601 | attr:title | Owing an upchit | 5 |
| W2271 | raptor-port/src/ui/InputsPage.tsx | 617 | attr:aria-label | Show inputs as | 5 |
| W2272 | raptor-port/src/ui/InputsPage.tsx | 618 | attr:title | Calendar — a whole month at a glance | 5 |
| W2273 | raptor-port/src/ui/InputsPage.tsx | 618 | attr:aria-label | Calendar | 5 |
| W2274 | raptor-port/src/ui/InputsPage.tsx | 620 | attr:title | List | 5 |
| W2275 | raptor-port/src/ui/InputsPage.tsx | 636 | jsx-text | Today | 5,4 |
| W2276 | raptor-port/src/ui/InputsPage.tsx | 648 | attr:title | Filters | 5 |
| W2277 | raptor-port/src/ui/InputsPage.tsx | 652 | attr:aria-label | Person | 5 |
| W2278 | raptor-port/src/ui/InputsPage.tsx | 653 | jsx-text | Everyone | 5 |
| W2279 | raptor-port/src/ui/InputsPage.tsx | 659 | attr:aria-label | Type | 5 |
| W2280 | raptor-port/src/ui/InputsPage.tsx | 660 | jsx-text | All types | 5 |
| W2281 | raptor-port/src/ui/InputsPage.tsx | 662 | attr:aria-label | Search inputs | 5 |
| W2282 | raptor-port/src/ui/InputsPage.tsx | 669 | attr:title | Inputs calendar settings — the late cut-off, who may file for other people, the Calendar | 5 |
| W2283 | raptor-port/src/ui/InputsPage.tsx | 670 | attr:aria-label | Inputs calendar settings | 5 |
| W2284 | raptor-port/src/ui/InputsPage.tsx | 677 | jsx-text | Clear filters | 5 |
| W2285 | raptor-port/src/ui/InputsPage.tsx | 693 | jsx-text | + Input | 5 |
| W2286 | raptor-port/src/ui/InputsPage.tsx | 726 | jsx-text | Weeks ahead | 5 |
| W2287 | raptor-port/src/ui/InputsPage.tsx | 741 | literal | Give a number of weeks between ${LOOK_MIN} and ${LOOK_MAX} | 5 |
| W2288 | raptor-port/src/ui/InputsPage.tsx | 741 | literal | This change could not be saved. | 5 |
| W2289 | raptor-port/src/ui/InputsPage.tsx | 746 | literal | Everyone now opens on ${lookaheadLabel(inputsLookahead()).toLowerCase()} | 5 |
| W2290 | raptor-port/src/ui/InputsPage.tsx | 748 | jsx-text | Save | 5 |
| W2291 | raptor-port/src/ui/InputsPage.tsx | 749 | jsx-text | Cancel | 5 |
| W2292 | raptor-port/src/ui/InputsPage.tsx | 783 | literal | I don't need an export to excel function for inputs. U can remove it. | 5 |
| W2293 | raptor-port/src/ui/InputsPage.tsx | 784 | literal | Export to Excel | 5 |
| W2294 | raptor-port/src/ui/InputsPage.tsx | 881 | attr:label | Name | 5 |
| W2295 | raptor-port/src/ui/InputsPage.tsx | 884 | attr:title | Open this input | 5 |
| W2296 | raptor-port/src/ui/InputsPage.tsx | 885 | attr:label | Start | 5 |
| W2297 | raptor-port/src/ui/InputsPage.tsx | 885 | attr:label | End | 5 |
| W2298 | raptor-port/src/ui/InputsPage.tsx | 899 | jsx-line | BESIDE .intag, never inside it, so .intag's textContent | 5 |
| W2299 | raptor-port/src/ui/InputsPage.tsx | 917 | jsx-text | SANS Avail | 5 |
| W2300 | raptor-port/src/ui/InputsPage.tsx | 917 | jsx-text | ability | 5 |
| W2301 | raptor-port/src/ui/InputsPage.tsx | 918 | jsx-text | Appoint | 5 |
| W2302 | raptor-port/src/ui/InputsPage.tsx | 918 | jsx-text | ment | 5 |
| W2303 | raptor-port/src/ui/InputsPage.tsx | 920 | attr:title | Available for | 5 |
| W2304 | raptor-port/src/ui/InputsPage.tsx | 929 | attr:label | Remarks | 5 |
| W2305 | raptor-port/src/ui/InputsPage.tsx | 930 | jsx-text | LATE | 5 |
| W2306 | raptor-port/src/ui/InputsPage.tsx | 932 | attr:label | Modified | 5 |
| W2307 | raptor-port/src/ui/InputsPage.tsx | 940 | attr:title | View the document | 5 |
| W2308 | raptor-port/src/ui/InputsPage.tsx | 945 | jsx-text | No document | 5 |
| W2309 | raptor-port/src/ui/InputsPage.tsx | 964 | attr:title | Change the OIL decision | 1,5 |
| W2310 | raptor-port/src/ui/InputsPage.tsx | 965 | jsx-text | OIL | 1,5 |
| W2311 | raptor-port/src/ui/InputsPage.tsx | 975 | attr:title | Nobody has answered the OIL question for ${oilDayLabel(oilUnansweredDay(r))} — tap to answer it | 1,5,4 |
| W2312 | raptor-port/src/ui/InputsPage.tsx | 976 | attr:aria-label | Answer the OIL question for ${oilDayLabel(oilUnansweredDay(r))} | 1,5,4 |
| W2313 | raptor-port/src/ui/InputsPage.tsx | 977 | jsx-text | OIL? | 1,5 |
| W2314 | raptor-port/src/ui/InputsPage.tsx | 985 | attr:title | ${oilSignNote(oilSignDay(r))} — tap to answer it | 5,4 |
| W2315 | raptor-port/src/ui/InputsPage.tsx | 986 | attr:aria-label | Answer the OIL question for ${oilDayLabel(oilSignDay(r))} | 1,5,4 |
| W2316 | raptor-port/src/ui/InputsPage.tsx | 998 | literal | No inputs between 10 Oct → 24 Oct. Change the dates, or pick 'All dates'. | 5 |
| W2317 | raptor-port/src/ui/InputsPage.tsx | 1000 | literal | No inputs ${rangeWords(range.from, range.to)}. Try ${RANGE_ALL}. | 5 |
| W2318 | raptor-port/src/ui/InputsPage.tsx | 1001 | literal | No inputs match. | 5 |
| W2319 | raptor-port/src/ui/InputsSettings.tsx | 66 | literal | The cut-off could not be saved. Try again. | 5 |
| W2320 | raptor-port/src/ui/InputsSettings.tsx | 68 | literal | The setting could not be saved. Try again. | 5 |
| W2321 | raptor-port/src/ui/InputsSettings.tsx | 83 | attr:title | Inputs calendar settings | 5 |
| W2322 | raptor-port/src/ui/InputsSettings.tsx | 85 | jsx-text | Calendar | 5 |
| W2323 | raptor-port/src/ui/InputsSettings.tsx | 87 | jsx-text | Calendar… | 5 |
| W2324 | raptor-port/src/ui/InputsSettings.tsx | 92 | jsx-text | Day, night or no-fly dates, and holidays. | 5,4 |
| W2325 | raptor-port/src/ui/InputsSettings.tsx | 95 | jsx-text | Late cut-off for inputs | 5 |
| W2326 | raptor-port/src/ui/InputsSettings.tsx | 97 | jsx-text | Later than this is LATE. Medical is never late. | 5 |
| W2327 | raptor-port/src/ui/InputsSettings.tsx | 99 | jsx-text | Filing for other people | 5 |
| W2328 | raptor-port/src/ui/InputsSettings.tsx | 102 | jsx-text | Members may file duties for others | 3,5 |
| W2329 | raptor-port/src/ui/InputsSettings.tsx | 104 | jsx-text | Never leave, medical or SANS. | 5 |
| W2330 | raptor-port/src/ui/InputsSettings.tsx | 108 | jsx-text | Cancel | 5 |
| W2331 | raptor-port/src/ui/InputsSettings.tsx | 109 | jsx-text | Save | 5 |
| W2332 | raptor-port/src/ui/InputWindow.tsx | 63 | attr:aria-label | Duration | 5 |
| W2333 | raptor-port/src/ui/InputWindow.tsx | 77 | attr:aria-label | SANS availability | 5 |
| W2334 | raptor-port/src/ui/InputWindow.tsx | 128 | attr:title | Open ${doc ? doc.name : 'the document'} | 5 |
| W2335 | raptor-port/src/ui/InputWindow.tsx | 130 | attr:aria-label | Remove ${doc ? doc.name : 'document'} | 5 |
| W2336 | raptor-port/src/ui/InputWindow.tsx | 135 | literal | Attach another file (photo or PDF) | 5 |
| W2337 | raptor-port/src/ui/InputWindow.tsx | 135 | literal | Attach the supporting document (photo or PDF) | 5 |
| W2338 | raptor-port/src/ui/InputWindow.tsx | 376 | literal | That input was removed while its window was open, so the window has closed | 5 |
| W2339 | raptor-port/src/ui/InputWindow.tsx | 390 | literal | Changed while this window was open: people — | 5 |
| W2340 | raptor-port/src/ui/InputWindow.tsx | 431 | literal | Choose which to keep first — your change, or the one made while this window was open | 5 |
| W2341 | raptor-port/src/ui/InputWindow.tsx | 572 | literal | Input added for ${howMany(ppl)} | 5 |
| W2342 | raptor-port/src/ui/InputWindow.tsx | 592 | literal | Input filed under Unavailable | 5 |
| W2343 | raptor-port/src/ui/InputWindow.tsx | 592 | literal | Input added to the ${progOf([...ppl, draft && draft.person])} | 5 |
| W2344 | raptor-port/src/ui/InputWindow.tsx | 673 | literal | Pick a start date on the calendar first | 5 |
| W2345 | raptor-port/src/ui/InputWindow.tsx | 703 | literal | A medical entry is one person’s own. Take the other people out and save, then change its kind. | 5 |
| W2346 | raptor-port/src/ui/InputWindow.tsx | 797 | literal | Input deleted for ${n} | 5 |
| W2347 | raptor-port/src/ui/InputWindow.tsx | 822 | literal | You are out of this input | 5 |
| W2348 | raptor-port/src/ui/InputWindow.tsx | 921 | jsx-text | Person | 5 |
| W2349 | raptor-port/src/ui/InputWindow.tsx | 933 | attr:label | Posted out / archived | 5 |
| W2350 | raptor-port/src/ui/InputWindow.tsx | 950 | jsx-text | Type | 5 |
| W2351 | raptor-port/src/ui/InputWindow.tsx | 988 | literal | Duty & other commitments | 5,4 |
| W2352 | raptor-port/src/ui/InputWindow.tsx | 996 | jsx-text | Title | 5 |
| W2353 | raptor-port/src/ui/InputWindow.tsx | 1018 | attr:aria-label | Attached to | 5 |
| W2354 | raptor-port/src/ui/InputWindow.tsx | 1018 | attr:placeholder | Squadron, job or exercise | 3,5 |
| W2355 | raptor-port/src/ui/InputWindow.tsx | 1029 | jsx-text | Goes to | 5 |
| W2356 | raptor-port/src/ui/InputWindow.tsx | 1039 | literal | Rejected by a scheduler | 5,4 |
| W2357 | raptor-port/src/ui/InputWindow.tsx | 1040 | literal | A scheduler moved it here: ${(draft.goes ?? 'g') === 'u' ? 'counted as away on the Leave War' : 'still counted in the Leave War’s manning'} | 5,4 |
| W2358 | raptor-port/src/ui/InputWindow.tsx | 1041 | literal | Counted as away on the Leave War | 5 |
| W2359 | raptor-port/src/ui/InputWindow.tsx | 1041 | literal | Still counted in the Leave War’s manning | 5 |
| W2360 | raptor-port/src/ui/InputWindow.tsx | 1050 | jsx-text | Date | 5 |
| W2361 | raptor-port/src/ui/InputWindow.tsx | 1052 | attr:label | Upchit date | 5 |
| W2362 | raptor-port/src/ui/InputWindow.tsx | 1061 | jsx-text | Availability | 5 |
| W2363 | raptor-port/src/ui/InputWindow.tsx | 1081 | jsx-text | all day | 5,4 |
| W2364 | raptor-port/src/ui/InputWindow.tsx | 1083 | attr:aria-label | Start time | 5 |
| W2365 | raptor-port/src/ui/InputWindow.tsx | 1085 | attr:aria-label | End time | 5 |
| W2366 | raptor-port/src/ui/InputWindow.tsx | 1097 | jsx-text | Document | 5 |
| W2367 | raptor-port/src/ui/InputWindow.tsx | 1120 | jsx-text | Remarks | 5 |
| W2368 | raptor-port/src/ui/InputWindow.tsx | 1152 | jsx-text | Dates | 5 |
| W2369 | raptor-port/src/ui/InputWindow.tsx | 1174 | jsx-text | OIL | 1,5 |
| W2370 | raptor-port/src/ui/InputWindow.tsx | 1178 | jsx-text | Change… | 5 |
| W2371 | raptor-port/src/ui/InputWindow.tsx | 1194 | jsx-text | Answer… | 5 |
| W2372 | raptor-port/src/ui/InputWindow.tsx | 1204 | literal | S WINDOW (owner D729 — the design vet | 5 |
| W2373 | raptor-port/src/ui/InputWindow.tsx | 1205 | literal | I don't like too wordy interface | 5 |
| W2374 | raptor-port/src/ui/InputWindow.tsx | 1206 | jsx-line | Save adds one input covering the whole date range." and a saved one "To change its dates, tap the new | 5 |
| W2375 | raptor-port/src/ui/InputWindow.tsx | 1217 | literal | Choose the dates and your available hours. Save adds one input covering the whole date range. | 5 |
| W2376 | raptor-port/src/ui/InputWindow.tsx | 1220 | literal | Pick the day he is fit for full duty and attach the upchit document — the medical entry ends the day before, and a summary asks before anything is changed. | 5,4 |
| W2377 | raptor-port/src/ui/InputWindow.tsx | 1222 | literal | Pick the dates on the calendar. A leave syncs to the Inputs page and Leave War. | 5 |
| W2378 | raptor-port/src/ui/InputWindow.tsx | 1224 | literal | Added on ${when}, straight onto the ${progOf([...ppl, draft && draft.person])}. For a multi-day span, use the Inputs page. | 5,4 |
| W2379 | raptor-port/src/ui/InputWindow.tsx | 1225 | literal | Added on ${when}. For a multi-day span, use the Inputs page. | 5,4 |
| W2380 | raptor-port/src/ui/InputWindow.tsx | 1229 | literal | Date changes apply to ${howMany(recPpl)}. | 5 |
| W2381 | raptor-port/src/ui/InputWindow.tsx | 1229 | literal | Date changes apply to all ${recPpl.length}. | 5 |
| W2382 | raptor-port/src/ui/InputWindow.tsx | 1231 | literal | To change its dates, delete it and add it again on the SANS calendar. | 5 |
| W2383 | raptor-port/src/ui/InputWindow.tsx | 1233 | literal | The dates are changed on the Inputs page. | 5 |
| W2384 | raptor-port/src/ui/InputWindow.tsx | 1234 | literal | The person and the dates are changed on the Inputs page. | 5 |
| W2385 | raptor-port/src/ui/InputWindow.tsx | 1241 | attr:label | Take yourself out? | 5 |
| W2386 | raptor-port/src/ui/InputWindow.tsx | 1243 | jsx-text | Take me out | 5 |
| W2387 | raptor-port/src/ui/InputWindow.tsx | 1244 | jsx-text | Stay in | 5 |
| W2388 | raptor-port/src/ui/InputWindow.tsx | 1250 | attr:label | Delete for everyone? | 5 |
| W2389 | raptor-port/src/ui/InputWindow.tsx | 1252 | jsx-text | Delete | 5 |
| W2390 | raptor-port/src/ui/InputWindow.tsx | 1253 | jsx-text | Keep | 5 |
| W2391 | raptor-port/src/ui/InputWindow.tsx | 1268 | attr:aria-label | View the document | 5 |
| W2392 | raptor-port/src/ui/InputWindow.tsx | 1274 | literal | Only ${who \|\| 'its owner'} or an admin can change this. | 3,5 |
| W2393 | raptor-port/src/ui/InputWindow.tsx | 1352 | attr:label | Unsaved changes | 5 |
| W2394 | raptor-port/src/ui/InputWindow.tsx | 1355 | jsx-text | Discard and open | 5 |
| W2395 | raptor-port/src/ui/InputWindow.tsx | 1356 | jsx-text | Keep editing | 5 |
| W2396 | raptor-port/src/ui/InputWindow.tsx | 1368 | jsx-text | This input has unsaved changes. Close it and lose them? | 5 |
| W2397 | raptor-port/src/ui/InputWindow.tsx | 1370 | jsx-text | Discard and close | 5 |
| W2398 | raptor-port/src/ui/InputWindow.tsx | 1380 | jsx-text | Changed while this window was open | 5 |
| W2399 | raptor-port/src/ui/InputWindow.tsx | 1386 | jsx-text | Keep mine | 5 |
| W2400 | raptor-port/src/ui/InputWindow.tsx | 1393 | jsx-text | Take theirs | 5 |
| W2401 | raptor-port/src/ui/InputWindow.tsx | 1412 | attr:aria-label | Close | 5 |
| W2402 | raptor-port/src/ui/insights-html.ts | 18 | jsx-text | Sorties | 10 |
| W2403 | raptor-port/src/ui/insights-html.ts | 19 | jsx-text | Formations | 10 |
| W2404 | raptor-port/src/ui/insights-html.ts | 20 | jsx-text | Aircrew flying | 10,4 |
| W2405 | raptor-port/src/ui/insights-html.ts | 22 | jsx-text | Flying load · sorties this week | 10 |
| W2406 | raptor-port/src/ui/insights-html.ts | 23 | jsx-text | Blue | 10 |
| W2407 | raptor-port/src/ui/insights-html.ts | 23 | jsx-text | Red | 10 |
| W2408 | raptor-port/src/ui/insights-html.ts | 23 | jsx-text | Total-only rows include unanswered mission roles. | 10 |
| W2409 | raptor-port/src/ui/insights-html.ts | 27 | attr:title | Standby rows that flew | 10 |
| W2410 | raptor-port/src/ui/insights-html.ts | 28 | attr:title | ${esc(p?.name \|\| '')} | 10 |
| W2411 | raptor-port/src/ui/insights-html.ts | 44 | jsx-text | Work hours · report to debrief, this week | 10 |
| W2412 | raptor-port/src/ui/insights-html.ts | 45 | jsx-text | Nothing scheduled this week. | 10,4 |
| W2413 | raptor-port/src/ui/insights-html.ts | 48 | attr:title | ${esc((p && p.name) \|\| '')} | 10 |
| W2414 | raptor-port/src/ui/insights-html.ts | 50 | attr:title | ${w.days} day${w.days > 1 ? 's' : ''} on the programme | 10,4 |
| W2415 | raptor-port/src/ui/insights-html.ts | 53 | jsx-text | `).join('') : ' | 10 |
| W2416 | raptor-port/src/ui/insights-html.ts | 53 | jsx-text | everyone is scheduled | 10,4 |
| W2417 | raptor-port/src/ui/insights-html.ts | 55 | jsx-text | Conflicts by type | 10 |
| W2418 | raptor-port/src/ui/insights-html.ts | 57 | jsx-text | No conflicts flagged. ✓ | 10 |
| W2419 | raptor-port/src/ui/insights-html.ts | 58 | jsx-text | By day | 10,4 |
| W2420 | raptor-port/src/ui/insights-html.ts | 59 | jsx-text | clear | 10 |
| W2421 | raptor-port/src/ui/interactions.ts | 87 | literal | Showing the working draft — the change is on it | 4 |
| W2422 | raptor-port/src/ui/interactions.ts | 91 | literal | That warning is no longer raised on this day | 4 |
| W2423 | raptor-port/src/ui/interactions.ts | 222 | literal | That detail is no longer on this day | 4 |
| W2424 | raptor-port/src/ui/interactions.ts | 223 | literal | That seat is empty now | 4 |
| W2425 | raptor-port/src/ui/interactions.ts | 225 | literal | That input is not shown on this day | 5,4 |
| W2426 | raptor-port/src/ui/interactions.ts | 228 | literal | That detail is shown on the week, not on the board | 4 |
| W2427 | raptor-port/src/ui/interactions.ts | 229 | literal | That detail is shown on the scheduler board — open the day there to see it | 4 |
| W2428 | raptor-port/src/ui/interactions.ts | 375 | attr:title | ${pen ? 'Done editing the list' : 'Edit the list'} | 4 |
| W2429 | raptor-port/src/ui/interactions.ts | 380 | attr:aria-label | Name for ${esc(lab)} | 4 |
| W2430 | raptor-port/src/ui/interactions.ts | 381 | attr:title | Move up | 4 |
| W2431 | raptor-port/src/ui/interactions.ts | 382 | attr:title | Move down | 4 |
| W2432 | raptor-port/src/ui/interactions.ts | 383 | attr:title | Remove ${esc(lab)} from the list | 4 |
| W2433 | raptor-port/src/ui/interactions.ts | 385 | attr:placeholder | e.g. LGB | 4 |
| W2434 | raptor-port/src/ui/interactions.ts | 385 | attr:aria-label | New store name | 4 |
| W2435 | raptor-port/src/ui/interactions.ts | 386 | jsx-text | Add | 4 |
| W2436 | raptor-port/src/ui/interactions.ts | 387 | jsx-text | The list is the squadron's, not this jet's — it survives a reload. Removing one keeps every jet that carries it. | 3 |
| W2437 | raptor-port/src/ui/interactions.ts | 467 | literal | ${lab} removed from the list. Every jet carrying it keeps it. Add it back and the chips return. | 4 |
| W2438 | raptor-port/src/ui/interactions.ts | 591 | literal | Remove ${lab} from the list | 4 |
| W2439 | raptor-port/src/ui/interactions.ts | 1045 | literal | Only a scheduler can accept inputs | 5,4 |
| W2440 | raptor-port/src/ui/interactions.ts | 1048 | literal | That input is no longer there | 5 |
| W2441 | raptor-port/src/ui/interactions.ts | 1068 | literal | Can't tell whether ${cs}'s ${inpLabel(inp)} already has a row on another week — load that week first | 4 |
| W2442 | raptor-port/src/ui/interactions.ts | 1246 | literal | Only a scheduler can change the LATE marks | 4 |
| W2443 | raptor-port/src/ui/interactions.ts | 1262 | literal | LATE mark hidden. The Inputs page still shows it. | 5 |
| W2444 | raptor-port/src/ui/interactions.ts | 1262 | literal | LATE mark shown | 4 |
| W2445 | raptor-port/src/ui/interactions.ts | 1281 | literal | Only a scheduler can edit ${REPORTING_LABEL} | 4 |
| W2446 | raptor-port/src/ui/interactions.ts | 1341 | literal | Only a scheduler can add inputs from here | 5,4 |
| W2447 | raptor-port/src/ui/interactions.ts | 1345 | literal | That day is not loaded | 4 |
| W2448 | raptor-port/src/ui/interactions.ts | 1352 | literal | No SANS aircrew on the roster | 5,4 |
| W2449 | raptor-port/src/ui/interactions.ts | 1352 | literal | No crew on the roster to file an input for | 5,4 |
| W2450 | raptor-port/src/ui/interactions.ts | 1386 | literal | Only a scheduler can edit inputs from here | 5,4 |
| W2451 | raptor-port/src/ui/interactions.ts | 1553 | literal | Some of ${DAYS[di]?.dow \|\| 'this day'}’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm. | 1,2,4 |
| W2452 | raptor-port/src/ui/interactions.ts | 1554 | literal | Withdrawing ${wl} brings back ${verName(back)}’s OIL for ${dow}. Some of ${wl}’s OIL credits are already spent on the Leave War, and ${verName(back)} credits less. Tap again to confirm. | 1 |
| W2453 | raptor-port/src/ui/interactions.ts | 1564 | literal | That day can’t be unpublished right now. | 2,4 |
| W2454 | raptor-port/src/ui/interactions.ts | 1575 | literal | ${dow} unpublished. It is a draft again, and publishing reissues the ${wl}. | 2 |
| W2455 | raptor-port/src/ui/interactions.ts | 1576 | literal | ${dow}: ${wl} withdrawn. Its changes are back on the working copy as pending, and ${verLabel(now)} is the issued schedule. Publishing reissues ${wl}. | 2,4 |
| W2456 | raptor-port/src/ui/interactions.ts | 1578 | literal | Its OIL credits are withdrawn from the Leave War until it is republished. | 1,2 |
| W2457 | raptor-port/src/ui/interactions.ts | 1579 | literal | The Leave War credits ${verLabel(back)}’s OIL for the day until ${wl} is republished. | 1,2,4 |
| W2458 | raptor-port/src/ui/interactions.ts | 1620 | literal | That plan is no longer available | 2,5 |
| W2459 | raptor-port/src/ui/interactions.ts | 1662 | literal | ${DAYS[di].dow} is already at ${verLabel(ver) === 'Original' ? 'the Original' : verLabel(ver)}. | 4 |
| W2460 | raptor-port/src/ui/interactions.ts | 1678 | literal | That version is no longer available | 5 |
| W2461 | raptor-port/src/ui/interactions.ts | 1701 | literal | Viewers still see ${the(dayCurVer(di))}. | 4 |
| W2462 | raptor-port/src/ui/interactions.ts | 1702 | literal | ${left} request${left === 1 ? ' stays' : 's stay'} as filed because ${left === 1 ? 'it covers' : 'they cover'} another day. | 4 |
| W2463 | raptor-port/src/ui/interactions.ts | 1707 | literal | ${what} is on ${dayList(m.days)}'s programme now, pending there. | 4 |
| W2464 | raptor-port/src/ui/interactions.ts | 1707 | literal | ${what} is on ${dayList(m.days)} again too. | 4 |
| W2465 | raptor-port/src/ui/interactions.ts | 1841 | literal | Only a scheduler can create a leave war period | 4 |
| W2466 | raptor-port/src/ui/interactions.ts | 1845 | literal | The ${yr} leave war period is created. Open its dates for bidding here. | 4 |
| W2467 | raptor-port/src/ui/interactions.ts | 1849 | literal | A leave war already covers part of ${yr}. Open the Leave War and extend it instead. | 4 |
| W2468 | raptor-port/src/ui/interactions.ts | 1851 | literal | The ${yr} period could not be created | 4 |
| W2469 | raptor-port/src/ui/interactions.ts | 1858 | literal | Only a scheduler can hide a warning | 4 |
| W2470 | raptor-port/src/ui/interactions.ts | 1873 | literal | Warning flagged again | 4 |
| W2471 | raptor-port/src/ui/interactions.ts | 1873 | literal | Warning hidden: no flag, not counted. It returns if the warning changes. | 4 |
| W2472 | raptor-port/src/ui/interactions.ts | 1888 | literal | Only a scheduler can change this | 4 |
| W2473 | raptor-port/src/ui/interactions.ts | 1904 | literal | Note made public. It goes out with the next amendment. | 2 |
| W2474 | raptor-port/src/ui/interactions.ts | 1904 | literal | Note made scheduler-only. It goes out with the next amendment. | 2,4 |
| W2475 | raptor-port/src/ui/interactions.ts | 1905 | literal | Note now shows on the view-only schedule | 3,4 |
| W2476 | raptor-port/src/ui/interactions.ts | 1905 | literal | Note is scheduler-only again | 4 |
| W2477 | raptor-port/src/ui/interactions.ts | 2060 | literal | Line is SPARE now: it flies, so it is still fully cross-checked | 4 |
| W2478 | raptor-port/src/ui/interactions.ts | 2060 | literal | Line is SPARE now: standing by, checked for availability and currency only | 5 |
| W2479 | raptor-port/src/ui/interactions.ts | 2061 | literal | Line is MAIN now: fully cross-checked | 4 |
| W2480 | raptor-port/src/ui/logic-html.ts | 39 | literal | Crew rest and the working day | 10,4 |
| W2481 | raptor-port/src/ui/logic-html.ts | 41 | literal | Days in a row | 10,4 |
| W2482 | raptor-port/src/ui/logic-html.ts | 42 | literal | Long work day | 10,4 |
| W2483 | raptor-port/src/ui/logic-html.ts | 43 | literal | Default rally before take-off | 10 |
| W2484 | raptor-port/src/ui/logic-html.ts | 46 | literal | Brief before take-off | 10 |
| W2485 | raptor-port/src/ui/logic-html.ts | 47 | literal | Step before take-off | 10 |
| W2486 | raptor-port/src/ui/logic-html.ts | 48 | literal | Dekit after landing | 10 |
| W2487 | raptor-port/src/ui/logic-html.ts | 49 | literal | Debrief after landing | 10 |
| W2488 | raptor-port/src/ui/logic-html.ts | 54 | literal | EP sim brief | 10 |
| W2489 | raptor-port/src/ui/logic-html.ts | 58 | literal | Rows with no end time | 10 |
| W2490 | raptor-port/src/ui/logic-html.ts | 62 | literal | Any other row | 10 |
| W2491 | raptor-port/src/ui/logic-html.ts | 64 | literal | Standby (SC, AVALON, BB) | 10 |
| W2492 | raptor-port/src/ui/logic-html.ts | 65 | literal | SC day window | 10,4 |
| W2493 | raptor-port/src/ui/logic-html.ts | 66 | literal | SC MAIN conflicts | 10 |
| W2494 | raptor-port/src/ui/logic-html.ts | 66 | literal | s conflict with each shows: a red warning or an amber advisory. Once his shift flies, every conflict is red. | 10,4 |
| W2495 | raptor-port/src/ui/logic-html.ts | 69 | literal | Inputs late cut-off | 5,10 |
| W2496 | raptor-port/src/ui/logic-html.ts | 70 | literal | SANS late cut-off | 5,10 |
| W2497 | raptor-port/src/ui/logic-html.ts | 71 | literal | Members file for others | 3,10 |
| W2498 | raptor-port/src/ui/logic-html.ts | 74 | literal | Full day of OIL | 1,10,4 |
| W2499 | raptor-port/src/ui/logic-html.ts | 77 | literal | Track Blue and Red sorties | 10 |
| W2500 | raptor-port/src/ui/logic-html.ts | 77 | literal | flying bars into Blue and Red, and asks Blue or Red under a formation. | 10 |
| W2501 | raptor-port/src/ui/logic-html.ts | 92 | jsx-text | `).join('') + ` | 10 |
| W2502 | raptor-port/src/ui/logic-html.ts | 105 | literal | Rest runs from the end of the day before to the first thing today: his in-time or rally, his B where neither is typed, or anything earlier, such as a meeting. | 10,4 |
| W2503 | raptor-port/src/ui/logic-html.ts | 108 | literal | The day before ends at its last commitment of any kind. A flight ends at landing plus the debrief (${T('debrief')}), or, where no landing is typed, at the assumed landing (A flight, ${T('fltLen')} after take-off) plus t… | 10,4 |
| W2504 | raptor-port/src/ui/logic-html.ts | 109 | literal | An input counts only if it is a duty or commitment, other than Personal or SANS Availability, with typed times. | 5,10,4 |
| W2505 | raptor-port/src/ui/logic-html.ts | 110 | literal | Exactly ${T('crewRest')} is legal. A day with no flying asks for no rest. | 10,4 |
| W2506 | raptor-port/src/ui/logic-html.ts | 111 | literal | A LATE SHOW remark keeps the warning. The ring is dashed while rest still clears by step, solid after. | 10,4 |
| W2507 | raptor-port/src/ui/logic-html.ts | 112 | literal | Monday checks last Sunday. A Sunday that breaks Monday shows a "Breaks Monday" box. | 10,4 |
| W2508 | raptor-port/src/ui/logic-html.ts | 113 | literal | A flying line with no times yet is not measured, but a typed brief, in-time or landing on it still counts. | 10 |
| W2509 | raptor-port/src/ui/logic-html.ts | 114 | literal | An SC SPARE standing by carries no crew rest either way, but one that flies carries it as any flyer does. A shift reports at its start, or at its B or R where one is earlier than the start. | 10,4 |
| W2510 | raptor-port/src/ui/logic-html.ts | 118 | literal | On the programme more than ${lgV(VCONF.maxRun)} days in a row. | 10,4 |
| W2511 | raptor-port/src/ui/logic-html.ts | 120 | literal | Any tasking counts: a flight, a duty, a sim, a ground or programme row. | 10,4 |
| W2512 | raptor-port/src/ui/logic-html.ts | 121 | literal | Leave or a downchit resets the count. | 10 |
| W2513 | raptor-port/src/ui/logic-html.ts | 126 | literal | Two things at once | 10 |
| W2514 | raptor-port/src/ui/logic-html.ts | 130 | literal | A row whose end reads earlier than its start runs into the next day. | 10,4 |
| W2515 | raptor-port/src/ui/logic-html.ts | 134 | literal | In-time, rally, brief, take-off and landing are not in that order. | 10 |
| W2516 | raptor-port/src/ui/logic-html.ts | 136 | literal | The order is in-time, rally, brief, take-off, landing. Equal times are fine. | 10 |
| W2517 | raptor-port/src/ui/logic-html.ts | 137 | literal | The B on the line is what is checked. A blank B is checked as the suggested brief, take-off less ${T('briefLead')}. | 10 |
| W2518 | raptor-port/src/ui/logic-html.ts | 138 | literal | Out of order is red, but it never stops a day being published. | 2,10,4 |
| W2519 | raptor-port/src/ui/logic-html.ts | 142 | literal | A clock later than take-off means the day before. | 10,4 |
| W2520 | raptor-port/src/ui/logic-html.ts | 143 | literal | A line with no clock, RALLY AFTER IN TIME included, sets no time. | 10 |
| W2521 | raptor-port/src/ui/logic-html.ts | 145 | literal | The app cannot read the clock on an In-time line. | 10 |
| W2522 | raptor-port/src/ui/logic-html.ts | 148 | literal | Less than ${turn} from landing to the next take-off (Tight turn, or Dekit plus Step if longer). | 10 |
| W2523 | raptor-port/src/ui/logic-html.ts | 150 | literal | s take-off and landing are the same time. A flying line still earns its OIL from the report before it and the debrief after it, and none if it has neither. A standby shift with no length earns none. One that flies with … | 1,10 |
| W2524 | raptor-port/src/ui/logic-html.ts | 156 | literal | Qualifications and currency | 10 |
| W2525 | raptor-port/src/ui/logic-html.ts | 158 | literal | An OCU pilot with a CAT A–D WSO, or the reverse. An instructor in either seat clears it. | 10,4 |
| W2526 | raptor-port/src/ui/logic-html.ts | 164 | literal | s remarks needs one in that aircraft. | 10 |
| W2527 | raptor-port/src/ui/logic-html.ts | 165 | literal | s currency: night on a night wave, day otherwise. NAAR or DAAR says it outright. | 10,4 |
| W2528 | raptor-port/src/ui/logic-html.ts | 166 | literal | s currency warning, but an instructor pilot without the mark is flagged instead. | 10,4 |
| W2529 | raptor-port/src/ui/logic-html.ts | 168 | literal | Night after day | 10,4 |
| W2530 | raptor-port/src/ui/logic-html.ts | 168 | literal | NAAR needs DAAR, and SC NIGHT needs SC DAY. On Quals, removing the day one removes the night one. | 10,4 |
| W2531 | raptor-port/src/ui/logic-html.ts | 176 | literal | A standby shift takes exactly its written hours: no step, dekit, brief or debrief. | 10 |
| W2532 | raptor-port/src/ui/logic-html.ts | 178 | literal | A standby row that flies | 10 |
| W2533 | raptor-port/src/ui/logic-html.ts | 179 | literal | A standby shift that flies has no START or END, so its crew rest and OIL cannot be worked out. | 1,10,4 |
| W2534 | raptor-port/src/ui/logic-html.ts | 180 | literal | s in-time) or R (its rally), whichever is earlier, and something sits between it and the shift start. That time also starts his crew rest, his long day and his OIL. | 1,10,4 |
| W2535 | raptor-port/src/ui/logic-html.ts | 181 | literal | Arming an SC seat | 10,4 |
| W2536 | raptor-port/src/ui/logic-html.ts | 183 | literal | Leave, downchits and inputs | 5,10 |
| W2537 | raptor-port/src/ui/logic-html.ts | 184 | literal | An input closes its hours | 5,10 |
| W2538 | raptor-port/src/ui/logic-html.ts | 184 | literal | Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme closes nothing. | 5,10,4 |
| W2539 | raptor-port/src/ui/logic-html.ts | 188 | literal | A seat with no times | 10,4 |
| W2540 | raptor-port/src/ui/logic-html.ts | 190 | literal | Standing SC SPARE | 10 |
| W2541 | raptor-port/src/ui/logic-html.ts | 190 | literal | A man on local leave may still stand SC SPARE. Overseas leave or duty (OL, OD) or a medical code (HL, OML, ATT C, ATT B) may not: that is a warning. A row that flies has no such allowance. | 10,4 |
| W2542 | raptor-port/src/ui/logic-html.ts | 195 | literal | Weekend and holiday work earns OIL | 1,10,4 |
| W2543 | raptor-port/src/ui/logic-html.ts | 195 | literal | Work on a weekend or public holiday earns OIL once the day is published: a full day or a half, by Full day of OIL. | 1,2,10,4 |
| W2544 | raptor-port/src/ui/logic-html.ts | 197 | literal | Weekend or holiday work earns OIL once the day is published. | 1,2,10,4 |
| W2545 | raptor-port/src/ui/logic-html.ts | 198 | literal | A man's day runs from his first report to his last end, gaps included: ${lgV(ruleFmt('oilFullMin', VCONF.oilFullMin))} or more is a full day (FO), less is a half (HO). | 10,4 |
| W2546 | raptor-port/src/ui/logic-html.ts | 202 | literal | A flight runs from its in-time or rally, whichever is earlier (Default rally before take-off where neither is entered), to landing plus the debrief. With no landing typed, it lands at its assumed landing (A flight). | 10 |
| W2547 | raptor-port/src/ui/logic-html.ts | 204 | literal | Any other row the scheduler adds with no times, or no end time, earns nothing, but a request answered yes earns over its own times. An Off day earns nothing. | 10,4 |
| W2548 | raptor-port/src/ui/logic-html.ts | 205 | literal | SC SPARE, AVALON and BB rows that do not fly earn only if switched on in OIL Earn. A row that flies earns by default, from its B or R if earlier than its START, otherwise from its START, to its END. | 1,10 |
| W2549 | raptor-port/src/ui/logic-html.ts | 206 | literal | Until its wave flies, a desk made from an AVALON or BB template earns only if switched on in OIL Earn. Once the wave flies, the desk earns by default. | 1,10,4 |
| W2550 | raptor-port/src/ui/logic-html.ts | 207 | literal | A Duty & commitments input earns once its OIL question is answered yes. | 1,5,10,4 |
| W2551 | raptor-port/src/ui/logic-html.ts | 208 | literal | A published day keeps its OIL until it is published again. | 1,2,10,4 |
| W2552 | raptor-port/src/ui/logic-html.ts | 210 | literal | On a weekend or holiday, a row with someone on it and no usable times earns nobody on it any OIL. The warning names the row. | 1,10,4 |
| W2553 | raptor-port/src/ui/logic-html.ts | 211 | literal | A weekend or holiday with someone to earn is not published yet. Nobody earns until it is. | 2,10,4 |
| W2554 | raptor-port/src/ui/logic-html.ts | 212 | literal | No Leave War period covers this weekend or holiday, so its work earns nobody OIL. The day offers to create the period, before and after it is published. | 1,2,10,4 |
| W2555 | raptor-port/src/ui/logic-html.ts | 213 | literal | A day published as a working day that the Leave War now calls a public holiday earns nothing until it is published again. | 2,10,4 |
| W2556 | raptor-port/src/ui/logic-html.ts | 214 | literal | A day published as a holiday that the Leave War no longer calls one keeps its OIL until it is published again, which withdraws it. | 1,2,10,4 |
| W2557 | raptor-port/src/ui/logic-html.ts | 215 | literal | A weekend or holiday published before the app counted an ALL AVAIL on a duty desk, sim or extra people line shows a pending change. Publish it again and the men behind that puck get their OIL. | 1,2,5,10,4 |
| W2558 | raptor-port/src/ui/logic-html.ts | 218 | literal | Several problems on one puck | 10 |
| W2559 | raptor-port/src/ui/logic-html.ts | 218 | literal | It shows the most serious flag, in this order, and its ring the most serious colour. A red box round the whole puck marks a conflict, a crew-rest breach, a qualification problem or a missed brief. | 10,4 |
| W2560 | raptor-port/src/ui/LogicPage.tsx | 36 | literal | Published days keep their old settings until published again. | 2,10,4 |
| W2561 | raptor-port/src/ui/LogicPage.tsx | 37 | literal | A changed late cut-off moves the LATE marks at once, on published days too. | 2,10,4 |
| W2562 | raptor-port/src/ui/LogicPage.tsx | 38 | literal | Only an admin can change them. | 3,10 |
| W2563 | raptor-port/src/ui/LogicPage.tsx | 91 | literal | Fired this week | 10 |
| W2564 | raptor-port/src/ui/LogicPage.tsx | 93 | jsx-text | String(h).replace(/ | 10 |
| W2565 | raptor-port/src/ui/LogicPage.tsx | 98 | attr:aria-label | ${esc(s.name)}${s.kind === 'window' ? (k === 'scDayFrom' ? ' opens' : ' closes') : ''} | 10,4 |
| W2566 | raptor-port/src/ui/LogicPage.tsx | 105 | attr:aria-label | ${esc(s.name)}: ${esc(s.value!())}, opens the ${s.door === 'sans' ? 'SANS' : 'Inputs'} calendar settings | 5,10 |
| W2567 | raptor-port/src/ui/LogicPage.tsx | 109 | attr:aria-label | ${esc(s.name)} | 10 |
| W2568 | raptor-port/src/ui/LogicPage.tsx | 129 | jsx-text | `).join('') + ` | 10 |
| W2569 | raptor-port/src/ui/LogicPage.tsx | 132 | attr:aria-label | Reset ${esc(s.name)} to standard | 10 |
| W2570 | raptor-port/src/ui/LogicPage.tsx | 132 | jsx-text | Reset | 10 |
| W2571 | raptor-port/src/ui/LogicPage.tsx | 157 | jsx-text | How it works | 10 |
| W2572 | raptor-port/src/ui/LogicPage.tsx | 174 | jsx-text | Settings | 10 |
| W2573 | raptor-port/src/ui/LogicPage.tsx | 175 | jsx-text | The checks | 10 |
| W2574 | raptor-port/src/ui/LogicPage.tsx | 354 | literal | A shift against ${KIND_LABEL[k]} is now ${c.checked ? 'a Warning' : 'an Advisory'} | 10,4 |
| W2575 | raptor-port/src/ui/LogicPage.tsx | 426 | jsx-text | Logic | 10 |
| W2576 | raptor-port/src/ui/LogicPage.tsx | 427 | attr:placeholder | Search | 10 |
| W2577 | raptor-port/src/ui/LogicPage.tsx | 427 | attr:aria-label | Search the rules | 10 |
| W2578 | raptor-port/src/ui/LogicPage.tsx | 432 | attr:aria-label | Show | 10 |
| W2579 | raptor-port/src/ui/LogicPage.tsx | 441 | jsx-text | Edit | 10 |
| W2580 | raptor-port/src/ui/LogicPage.tsx | 441 | literal | Editing rules — the schedule rechecks as you type | 10,4 |
| W2581 | raptor-port/src/ui/LogicPage.tsx | 444 | jsx-text | Done | 10 |
| W2582 | raptor-port/src/ui/LogicPage.tsx | 454 | literal | A page's controls are one row | 10 |
| W2583 | raptor-port/src/ui/LogicPage.tsx | 455 | jsx-text | Reset to standard | 10 |
| W2584 | raptor-port/src/ui/LogicPage.tsx | 455 | jsx-text | Reset all | 10 |
| W2585 | raptor-port/src/ui/LogicPage.tsx | 458 | jsx-line | Since D2005 a published day is checked by every setting it was published under, so the note says that, not only | 2,10,4 |
| W2586 | raptor-port/src/ui/Login.tsx | 27 | literal | Incorrect username or password. | 3 |
| W2587 | raptor-port/src/ui/Login.tsx | 48 | attr:aria-label | TALON | 3 |
| W2588 | raptor-port/src/ui/Login.tsx | 52 | jsx-text | raining · | 3 |
| W2589 | raptor-port/src/ui/Login.tsx | 52 | jsx-text | vailability | 3 |
| W2590 | raptor-port/src/ui/Login.tsx | 53 | jsx-text | exus | 3 |
| W2591 | raptor-port/src/ui/Login.tsx | 58 | jsx-text | Username | 3 |
| W2592 | raptor-port/src/ui/Login.tsx | 60 | attr:placeholder | username | 3 |
| W2593 | raptor-port/src/ui/Login.tsx | 62 | jsx-text | Password | 3 |
| W2594 | raptor-port/src/ui/Login.tsx | 63 | attr:placeholder | password | 3 |
| W2595 | raptor-port/src/ui/Login.tsx | 66 | jsx-text | Sign in | 3 |
| W2596 | raptor-port/src/ui/Login.tsx | 75 | jsx-text | build | 3 |
| W2597 | raptor-port/src/ui/Login.tsx | 75 | jsx-text | 29JUL·B55 | 3 |
| W2598 | raptor-port/src/ui/Login.tsx | 76 | jsx-text | React port | 3 |
| W2599 | raptor-port/src/ui/Login.tsx | 76 | jsx-text | . The single-file reference (build 29JUL·B55) is being ported engine-first: the validation engine, the amendment machinery and the state store are across with their regression assertions; the screens are arriving surfac… | 2,3 |
| W2600 | raptor-port/src/ui/MedClashConfirm.tsx | 96 | attr:aria-label | Close | 4 |
| W2601 | raptor-port/src/ui/MedClashConfirm.tsx | 101 | literal | Days covered by another status — choose who holds them | 4 |
| W2602 | raptor-port/src/ui/MedClashConfirm.tsx | 102 | jsx-text | A day holds one status: choose who holds these days | 4 |
| W2603 | raptor-port/src/ui/MedClashConfirm.tsx | 123 | jsx-text | Left over after it: | 4 |
| W2604 | raptor-port/src/ui/MedClashConfirm.tsx | 125 | jsx-text | — will be removed | 4 |
| W2605 | raptor-port/src/ui/MedClashConfirm.tsx | 126 | jsx-text | — kept on file | 4 |
| W2606 | raptor-port/src/ui/MedClashConfirm.tsx | 129 | jsx-text | Remove those days | 4 |
| W2607 | raptor-port/src/ui/MedClashConfirm.tsx | 131 | jsx-text | Keep them | 4 |
| W2608 | raptor-port/src/ui/MedClashConfirm.tsx | 139 | jsx-text | Cancel | 4 |
| W2609 | raptor-port/src/ui/MedClashConfirm.tsx | 141 | jsx-text | Save | 4 |
| W2610 | raptor-port/src/ui/MedicalView.tsx | 109 | literal | Tap to view ${n} documents | 4 |
| W2611 | raptor-port/src/ui/MedicalView.tsx | 109 | literal | Tap to view the document | 4 |
| W2612 | raptor-port/src/ui/MedicalView.tsx | 125 | attr:aria-label | ${n} documents | 4 |
| W2613 | raptor-port/src/ui/MedicalView.tsx | 131 | literal | No need for the time/ date or who it's filed from | 4 |
| W2614 | raptor-port/src/ui/MedicalView.tsx | 238 | literal | A page's controls are one row | 4 |
| W2615 | raptor-port/src/ui/MedicalView.tsx | 248 | jsx-text | + Medical | 4 |
| W2616 | raptor-port/src/ui/MedicalView.tsx | 250 | attr:title | See the medical state as of another date | 4 |
| W2617 | raptor-port/src/ui/MedicalView.tsx | 258 | jsx-text | Today | 4 |
| W2618 | raptor-port/src/ui/MedicalView.tsx | 265 | attr:aria-label | Back to list | 4 |
| W2619 | raptor-port/src/ui/MedicalView.tsx | 273 | attr:aria-label | Close the date picker | 4 |
| W2620 | raptor-port/src/ui/MedicalView.tsx | 276 | attr:aria-label | Pick the as-of date | 4 |
| W2621 | raptor-port/src/ui/MedicalView.tsx | 278 | attr:aria-label | Previous month | 4 |
| W2622 | raptor-port/src/ui/MedicalView.tsx | 281 | attr:aria-label | Next month | 4 |
| W2623 | raptor-port/src/ui/MedicalView.tsx | 307 | jsx-text | Medically Down | 4 |
| W2624 | raptor-port/src/ui/MedicalView.tsx | 312 | jsx-text | Nobody is medically down on this date. | 4 |
| W2625 | raptor-port/src/ui/MedicalView.tsx | 317 | jsx-text | Pending Upchit | 4 |
| W2626 | raptor-port/src/ui/MedicalView.tsx | 322 | jsx-text | Nobody is owing an upchit. | 4 |
| W2627 | raptor-port/src/ui/MedicalView.tsx | 325 | jsx-text | Upchit Complete | 4 |
| W2628 | raptor-port/src/ui/MedicalView.tsx | 326 | jsx-text | the past 30 days, newest first | 4 |
| W2629 | raptor-port/src/ui/MedicalView.tsx | 331 | jsx-text | No upchits in the past 30 days. | 4 |
| W2630 | raptor-port/src/ui/MedMoveConfirm.tsx | 36 | literal | That input is no longer there — nothing was changed | 5 |
| W2631 | raptor-port/src/ui/mission-role-offer.ts | 144 | jsx-text | Mission or remarks mention DS or RED. | 4 |
| W2632 | raptor-port/src/ui/mission-role-offer.ts | 144 | jsx-text | Blue | 4 |
| W2633 | raptor-port/src/ui/mission-role-offer.ts | 144 | jsx-text | Red | 4 |
| W2634 | raptor-port/src/ui/mission-role-offer.ts | 144 | jsx-text | Later | 4 |
| W2635 | raptor-port/src/ui/Modals.tsx | 62 | attr:aria-label | Close | 4 |
| W2636 | raptor-port/src/ui/Modals.tsx | 163 | attr:aria-label | Airspace line ${i + 1} | 4 |
| W2637 | raptor-port/src/ui/Modals.tsx | 164 | jsx-text | No traffic booked yet — add a row. | 4 |
| W2638 | raptor-port/src/ui/Modals.tsx | 170 | jsx-text | `).join('') : ' | 4 |
| W2639 | raptor-port/src/ui/Modals.tsx | 170 | jsx-text | No traffic booked. | 4 |
| W2640 | raptor-port/src/ui/Modals.tsx | 207 | jsx-text | Add row | 4 |
| W2641 | raptor-port/src/ui/Modals.tsx | 208 | jsx-text | Done | 4 |
| W2642 | raptor-port/src/ui/MonthJump.tsx | 64 | attr:aria-label | ${name} ${p.y} — choose the month and year | 4 |
| W2643 | raptor-port/src/ui/MonthJump.tsx | 75 | attr:label | Choose the month and year | 4 |
| W2644 | raptor-port/src/ui/MoveBand.tsx | 21 | jsx-text | Close | 4 |
| W2645 | raptor-port/src/ui/navfold.ts | 11 | literal | (pointer: coarse) and (orientation: landscape) and (max-height: 500px) | 4 |
| W2646 | raptor-port/src/ui/navfold.ts | 30 | jsx-text | ('#topnav'), mark = bar.querySelector | 4 |
| W2647 | raptor-port/src/ui/OilConfirm.tsx | 79 | literal | FO — a full day | 4 |
| W2648 | raptor-port/src/ui/OilConfirm.tsx | 79 | literal | HO — half a day | 4 |
| W2649 | raptor-port/src/ui/OilConfirm.tsx | 80 | literal | FO, a full day | 4 |
| W2650 | raptor-port/src/ui/OilConfirm.tsx | 80 | literal | HO, half a day | 4 |
| W2651 | raptor-port/src/ui/OilConfirm.tsx | 132 | attr:aria-label | Close | 4 |
| W2652 | raptor-port/src/ui/OilConfirm.tsx | 137 | jsx-text | Each confirmed day earns | 4 |
| W2653 | raptor-port/src/ui/OilConfirm.tsx | 137 | jsx-text | of OIL. Which days does it deserve? | 1,4 |
| W2654 | raptor-port/src/ui/OilConfirm.tsx | 140 | literal | Only some days… | 4 |
| W2655 | raptor-port/src/ui/OilConfirm.tsx | 150 | literal | No days selected — tap a day to credit it | 4 |
| W2656 | raptor-port/src/ui/OilConfirm.tsx | 154 | jsx-text | of OIL? | 1 |
| W2657 | raptor-port/src/ui/OilConfirm.tsx | 160 | literal | CHOOSE AN OPTION ABOVE | 4 |
| W2658 | raptor-port/src/ui/oilday.ts | 46 | literal | Only a scheduler answers from this list | 4 |
| W2659 | raptor-port/src/ui/oilday.ts | 63 | literal | OIL answered for 1 input | 1,5,4 |
| W2660 | raptor-port/src/ui/oilday.ts | 63 | literal | OIL answered for ${n} inputs | 1,5,4 |
| W2661 | raptor-port/src/ui/oilday.ts | 77 | jsx-text | (xs.length | 4 |
| W2662 | raptor-port/src/ui/oilday.ts | 80 | literal | Already published as a working day: ${said}. Publish it again so the crew on it earn OIL for the holiday. | 1,2,4 |
| W2663 | raptor-port/src/ui/oilday.ts | 81 | literal | Already published as working days: ${said}. Publish them again so the crew on them earn OIL for the holiday. | 1,2,4 |
| W2664 | raptor-port/src/ui/OilDayList.tsx | 68 | jsx-text | waiting for your answer | 4 |
| W2665 | raptor-port/src/ui/OilDayList.tsx | 74 | literal | ${name} is now a public holiday. | 4 |
| W2666 | raptor-port/src/ui/OilDayList.tsx | 74 | literal | ${noticeRun(from, to)} is now a public holiday. | 9,4 |
| W2667 | raptor-port/src/ui/OilDayList.tsx | 74 | literal | ${noticeRun(from, to)} are now public holidays. | 9,4 |
| W2668 | raptor-port/src/ui/OilDayList.tsx | 77 | jsx-text | Close | 4 |
| W2669 | raptor-port/src/ui/OilDayList.tsx | 80 | jsx-text | Later | 4 |
| W2670 | raptor-port/src/ui/OilDayList.tsx | 81 | jsx-text | Save | 4 |
| W2671 | raptor-port/src/ui/OilDayList.tsx | 127 | attr:title | OIL — ${noticeRun(from, to)} | 1,9,4 |
| W2672 | raptor-port/src/ui/OilDayList.tsx | 132 | jsx-text | Nothing left to answer. | 4 |
| W2673 | raptor-port/src/ui/OilDayList.tsx | 140 | jsx-text | Yes to all | 4 |
| W2674 | raptor-port/src/ui/OilDayList.tsx | 141 | jsx-text | No to all | 4 |
| W2675 | raptor-port/src/ui/oilmode.ts | 319 | literal | The OIL question for this ${what} has not been answered yet, so by default nobody behind it earns. ${how} | 1 |
| W2676 | raptor-port/src/ui/oilmode.ts | 320 | literal | Whoever filed this ${what} answered No to OIL, so by default nobody behind it earns. ${how} | 1 |
| W2677 | raptor-port/src/ui/oilmode.ts | 535 | literal | Nothing on this day earns. Turn off the switch first. | 4 |
| W2678 | raptor-port/src/ui/oilmode.ts | 543 | jsx-text | OIL EARN | 1 |
| W2679 | raptor-port/src/ui/oilmode.ts | 543 | jsx-text | THIS DAY | 4 |
| W2680 | raptor-port/src/ui/oilmode.ts | 548 | attr:title | Leave OIL mode and edit the schedule again | 1,4 |
| W2681 | raptor-port/src/ui/oilmode.ts | 548 | jsx-text | ✓ OIL done | 1 |
| W2682 | raptor-port/src/ui/oilmode.ts | 549 | attr:title | Show who earns OIL on this day, and change it | 1,4 |
| W2683 | raptor-port/src/ui/oilmode.ts | 556 | attr:title | Anything added to this day later earns no OIL either. | 1,4 |
| W2684 | raptor-port/src/ui/oilmode.ts | 556 | jsx-text | No OIL earned | 1 |
| W2685 | raptor-port/src/ui/oilmode.ts | 562 | literal | Nothing on this day earns OIL. Turn off the switch and each man earns as he did before. | 1,4 |
| W2686 | raptor-port/src/ui/oilmode.ts | 563 | literal | Tap a puck to take a man off that event · tap an item to stop the whole item earning | 4 |
| W2687 | raptor-port/src/ui/oilmode.ts | 576 | attr:title | This row has not been saved yet — once the day is saved it can be switched on its own | 4 |
| W2688 | raptor-port/src/ui/oilmode.ts | 612 | attr:title | This request is off the programme, so nobody earns from it | 4 |
| W2689 | raptor-port/src/ui/oilmode.ts | 613 | attr:title | This request follows the answer of whoever filed it — tap the count to switch one person | 4 |
| W2690 | raptor-port/src/ui/oilmode.ts | 617 | attr:title | This request has one answer for everyone on it — tap a puck on this row${claimPh(claim) ? ', or the count,' : ''} to switch one person, not the row itself | 4 |
| W2691 | raptor-port/src/ui/oilmode.ts | 622 | attr:title | ${esc(OIL_OPEN_END)} | 4 |
| W2692 | raptor-port/src/ui/oilmode.ts | 623 | attr:title | Nothing on this row can earn OIL, so there is nothing to switch off | 1 |
| W2693 | raptor-port/src/ui/oilmode.ts | 639 | literal | Nothing on this day earns — the day blanket is on | 4 |
| W2694 | raptor-port/src/ui/oilmode.ts | 640 | literal | Earns nothing — tap to let it earn again | 4 |
| W2695 | raptor-port/src/ui/oilmode.ts | 641 | literal | Set to earn — tap to stop this item earning | 4 |
| W2696 | raptor-port/src/ui/oilmode.ts | 642 | literal | Part of this row earns — tap to make all of it earn | 4 |
| W2697 | raptor-port/src/ui/oilmode.ts | 643 | literal | This kind of event earns nothing — tap to make it earn | 4 |
| W2698 | raptor-port/src/ui/oilmode.ts | 644 | literal | Earns OIL — tap to stop this item earning | 1 |
| W2699 | raptor-port/src/ui/oilmode.ts | 658 | attr:title | ${esc(ttl)} | 4 |
| W2700 | raptor-port/src/ui/oilmode.ts | 715 | attr:title | ${esc(p.cs)} — ${esc(w)} | 4 |
| W2701 | raptor-port/src/ui/oilmode.ts | 767 | attr:title | ${esc(p.cs)} — ${PLACEHOLDER_WHY} | 4 |
| W2702 | raptor-port/src/ui/oilmode.ts | 769 | attr:title | ${esc(p.cs)} — ${esc(inertWhy(di, item))} | 4 |
| W2703 | raptor-port/src/ui/oilmode.ts | 777 | attr:title | ${esc(p.cs)} — ${why}, so this cannot be changed here | 4 |
| W2704 | raptor-port/src/ui/oilmode.ts | 960 | literal | No OIL worked out — this row has no end time | 1 |
| W2705 | raptor-port/src/ui/oilmode.ts | 964 | literal | Leave OIL Earn before moving anyone — the day cannot change while you are deciding what it earns | 1,4 |
| W2706 | raptor-port/src/ui/oilmode.ts | 967 | literal | No start time — give it a time to count who can attend | 4 |
| W2707 | raptor-port/src/ui/oilmode.ts | 968 | literal | It starts and ends at the same time — give it an end to count who can attend | 4 |
| W2708 | raptor-port/src/ui/oilsign.ts | 52 | literal | Sign-off cleared · ${label} | 2 |
| W2709 | raptor-port/src/ui/oilsign.ts | 63 | literal | All signed — no changes to publish right now | 2 |
| W2710 | raptor-port/src/ui/oilwait.ts | 29 | literal | Not swapped — OIL not answered | 1 |
| W2711 | raptor-port/src/ui/oilwait.ts | 30 | literal | Not added — OIL not answered | 1 |
| W2712 | raptor-port/src/ui/oilwait.ts | 31 | literal | Not moved — OIL not answered | 1 |
| W2713 | raptor-port/src/ui/oilwait.ts | 33 | literal | Don’t put back | 4 |
| W2714 | raptor-port/src/ui/oilwait.ts | 33 | literal | Not put back — OIL not answered | 1 |
| W2715 | raptor-port/src/ui/oilwait.ts | 36 | literal | Not filed — OIL not answered | 1 |
| W2716 | raptor-port/src/ui/oilwait.ts | 39 | literal | Not un-cancelled — OIL not answered | 1 |
| W2717 | raptor-port/src/ui/oilwait.ts | 41 | literal | Not changed — OIL not answered | 1 |
| W2718 | raptor-port/src/ui/oilwait.ts | 45 | literal | That row has changed — not swapped | 4 |
| W2719 | raptor-port/src/ui/oilwait.ts | 46 | literal | That row has changed — not added | 4 |
| W2720 | raptor-port/src/ui/oilwait.ts | 47 | literal | That has changed — not moved | 4 |
| W2721 | raptor-port/src/ui/oilwait.ts | 48 | literal | That input has changed — not put back | 5 |
| W2722 | raptor-port/src/ui/oilwait.ts | 49 | literal | That input has changed — not filed | 5 |
| W2723 | raptor-port/src/ui/oilwait.ts | 50 | literal | That input has changed — not un-cancelled | 5 |
| W2724 | raptor-port/src/ui/oilwait.ts | 51 | literal | That input has changed — left as it is | 5 |
| W2725 | raptor-port/src/ui/OilWaitSheet.tsx | 124 | jsx-text | rest.length ? | 4 |
| W2726 | raptor-port/src/ui/OilWaitSheet.tsx | 125 | jsx-text | Answer OIL | 1 |
| W2727 | raptor-port/src/ui/owncal.ts | 84 | jsx-text | (pucks: any[], titles: Record | 4 |
| W2728 | raptor-port/src/ui/pagedownload.ts | 16 | jsx-text | Promise | 4 |
| W2729 | raptor-port/src/ui/pagedownload.ts | 35 | jsx-text | (), seen = new Set | 4 |
| W2730 | raptor-port/src/ui/pageload.tsx | 39 | jsx-text | It didn't download. Check your signal, then retry. | 4 |
| W2731 | raptor-port/src/ui/pageload.tsx | 41 | jsx-text | Retry | 4 |
| W2732 | raptor-port/src/ui/palette-html.ts | 95 | attr:title | ${esc(note)} | 4 |
| W2733 | raptor-port/src/ui/palette-html.ts | 98 | jsx-text | `:(gWhy?` | 4 |
| W2734 | raptor-port/src/ui/palette-html.ts | 124 | jsx-text | Planning | 4 |
| W2735 | raptor-port/src/ui/palette-html.ts | 125 | attr:title | Cancel | 4 |
| W2736 | raptor-port/src/ui/palette-html.ts | 200 | attr:title | Previous day | 4 |
| W2737 | raptor-port/src/ui/palette-html.ts | 202 | attr:title | Next day | 4 |
| W2738 | raptor-port/src/ui/palette-html.ts | 248 | jsx-text | Placeholders | 4 |
| W2739 | raptor-port/src/ui/palette-html.ts | 253 | attr:title | ${esc(why?`${PEOPLE[id].cs} — ${why}`:`${PEOPLE[id].cs} — a placeholder, never validated`)} | 4 |
| W2740 | raptor-port/src/ui/palette-html.ts | 300 | attr:title | ${esc(rmk)} | 4 |
| W2741 | raptor-port/src/ui/pan.ts | 680 | literal | PULL past Monday ${Math.round(pullPeak)}, no touch seen → PREV WEEK | 4 |
| W2742 | raptor-port/src/ui/pan.ts | 686 | literal | PULL past Sunday +${Math.round(pullPeak - max)}, no touch seen → NEXT WEEK | 4 |
| W2743 | raptor-port/src/ui/pan.ts | 754 | jsx-text | now - t | 4 |
| W2744 | raptor-port/src/ui/pan.ts | 878 | jsx-text | NAV_ZONE + 40 : x | 4 |
| W2745 | raptor-port/src/ui/peek.ts | 67 | attr:title | ${esc(p.cs)} | 4 |
| W2746 | raptor-port/src/ui/peek.ts | 95 | jsx-text | PEOPLE[id] ? peekSeat(id) : ` | 4 |
| W2747 | raptor-port/src/ui/peek.ts | 123 | attr:title | ${esc(fltNoLenMsg(f, w))} | 4 |
| W2748 | raptor-port/src/ui/peek.ts | 147 | jsx-text | AREA | 4 |
| W2749 | raptor-port/src/ui/peek.ts | 159 | jsx-text | SHIFT | 4 |
| W2750 | raptor-port/src/ui/peek.ts | 159 | jsx-text | FCP / RCP | 4 |
| W2751 | raptor-port/src/ui/peek.ts | 159 | jsx-text | RMKS | 4 |
| W2752 | raptor-port/src/ui/peek.ts | 160 | jsx-text | MSN | 4 |
| W2753 | raptor-port/src/ui/peek.ts | 170 | jsx-text | Common Programme | 4 |
| W2754 | raptor-port/src/ui/peek.ts | 173 | jsx-text | Name | 4 |
| W2755 | raptor-port/src/ui/peek.ts | 173 | jsx-text | Start | 4 |
| W2756 | raptor-port/src/ui/peek.ts | 173 | jsx-text | End | 4 |
| W2757 | raptor-port/src/ui/peek.ts | 173 | jsx-text | People | 4 |
| W2758 | raptor-port/src/ui/peek.ts | 173 | jsx-text | Rmks | 4 |
| W2759 | raptor-port/src/ui/peek.ts | 189 | jsx-text | Duties | 4 |
| W2760 | raptor-port/src/ui/peek.ts | 203 | jsx-text | Sims | 4 |
| W2761 | raptor-port/src/ui/peek.ts | 247 | jsx-text | Ground Programme | 4 |
| W2762 | raptor-port/src/ui/peek.ts | 274 | jsx-text | Next week: click a day to load it | 4 |
| W2763 | raptor-port/src/ui/peek.ts | 279 | jsx-text | No flying — ground day. | 4 |
| W2764 | raptor-port/src/ui/pendlist.ts | 367 | literal | A blank brief — its suggested lead | 4 |
| W2765 | raptor-port/src/ui/pendlist.ts | 370 | literal | What this day shows | 4 |
| W2766 | raptor-port/src/ui/pendlist.ts | 395 | literal | A shared input | 5 |
| W2767 | raptor-port/src/ui/pendlist.ts | 521 | literal | What this day earns | 4 |
| W2768 | raptor-port/src/ui/pendlist.ts | 545 | literal | Still a ${oilAmtWord(now)} of OIL. | 1 |
| W2769 | raptor-port/src/ui/pendlist.ts | 545 | literal | OIL changes: ${oilAmtWord(was)} → ${oilAmtWord(now)}. | 1 |
| W2770 | raptor-port/src/ui/pendlist.ts | 563 | literal | OIL on this day · Logic values changed since it was published | 1,2,10,4 |
| W2771 | raptor-port/src/ui/pendlist.ts | 669 | attr:title | Go to this row | 4 |
| W2772 | raptor-port/src/ui/pendlist.ts | 675 | attr:title | Go to this change | 4 |
| W2773 | raptor-port/src/ui/pendlist.ts | 676 | attr:title | This change has no place of its own on the schedule to go to | 4 |
| W2774 | raptor-port/src/ui/pendlist.ts | 678 | jsx-text | Waiting to go out as | 4 |
| W2775 | raptor-port/src/ui/pendlist.ts | 679 | jsx-text | Nothing is waiting to go out. | 4 |
| W2776 | raptor-port/src/ui/peoplepick-model.ts | 43 | literal | Whoever is free that day | 4 |
| W2777 | raptor-port/src/ui/peoplepick-model.ts | 58 | literal | This input already has ${cs(ph)} | 5 |
| W2778 | raptor-port/src/ui/peoplepick-model.ts | 65 | literal | File it for me only | 4 |
| W2779 | raptor-port/src/ui/PeoplePick.tsx | 192 | jsx-text | hi + 1 : r.top | 4 |
| W2780 | raptor-port/src/ui/PeoplePick.tsx | 220 | attr:aria-label | Person | 4 |
| W2781 | raptor-port/src/ui/PeoplePick.tsx | 241 | literal | File it for me only | 4 |
| W2782 | raptor-port/src/ui/PeoplePick.tsx | 280 | jsx-text | All | 4 |
| W2783 | raptor-port/src/ui/printpdf.ts | 44 | literal | CS / Mission | 4 |
| W2784 | raptor-port/src/ui/printpdf.ts | 68 | jsx-text | No flying programmed. | 4 |
| W2785 | raptor-port/src/ui/printpdf.ts | 99 | jsx-text | RESTRICTED | 4 |
| W2786 | raptor-port/src/ui/QualsPage.tsx | 162 | attr:title | ${esc(title)} | 4 |
| W2787 | raptor-port/src/ui/QualsPage.tsx | 172 | literal | Sort by callsign | 4 |
| W2788 | raptor-port/src/ui/QualsPage.tsx | 173 | literal | Sort by initials | 4 |
| W2789 | raptor-port/src/ui/QualsPage.tsx | 174 | literal | Sort by flight — groups each flight together | 4 |
| W2790 | raptor-port/src/ui/QualsPage.tsx | 175 | literal | Sort by CAT — most senior first | 4 |
| W2791 | raptor-port/src/ui/QualsPage.tsx | 178 | literal | Appointed scheduler — may sign SKED CK, PLANNED BY and APPROVED BY | 4 |
| W2792 | raptor-port/src/ui/QualsPage.tsx | 179 | literal | SC DAY — may be planned on an SC shift inside 07:00–19:00 | 4 |
| W2793 | raptor-port/src/ui/QualsPage.tsx | 180 | literal | SC NIGHT — may be planned on an SC shift reaching outside 07:00–19:00. Needs SC DAY first | 4 |
| W2794 | raptor-port/src/ui/QualsPage.tsx | 181 | literal | DAAR — day air-to-air refuelling (front seat only) | 4 |
| W2795 | raptor-port/src/ui/QualsPage.tsx | 182 | literal | NAAR — night air-to-air refuelling. Needs DAAR first | 4 |
| W2796 | raptor-port/src/ui/QualsPage.tsx | 183 | literal | TF — terrain following | 4 |
| W2797 | raptor-port/src/ui/QualsPage.tsx | 190 | attr:title | ${esc(what)} · drag to move${WIRED[c.k] ? ' · used by ' + WIRED[c.k] : ''} | 4 |
| W2798 | raptor-port/src/ui/QualsPage.tsx | 198 | attr:title | Remove ${esc(c.h)} | 4 |
| W2799 | raptor-port/src/ui/QualsPage.tsx | 201 | jsx-text | Remarks | 4 |
| W2800 | raptor-port/src/ui/QualsPage.tsx | 209 | literal | Personnel (ground crew) | 4 |
| W2801 | raptor-port/src/ui/QualsPage.tsx | 237 | attr:aria-label | ${CALLSIGN_LABEL} for ${esc(p.cs)} | 4 |
| W2802 | raptor-port/src/ui/QualsPage.tsx | 240 | attr:aria-label | Initials for ${esc(p.cs)} | 4 |
| W2803 | raptor-port/src/ui/QualsPage.tsx | 243 | attr:aria-label | Flight for ${esc(p.cs)} | 4 |
| W2804 | raptor-port/src/ui/QualsPage.tsx | 246 | attr:aria-label | Remarks for ${esc(p.cs)} | 4 |
| W2805 | raptor-port/src/ui/QualsPage.tsx | 249 | attr:title | ${esc(p.name \|\| '')} | 4 |
| W2806 | raptor-port/src/ui/QualsPage.tsx | 252 | attr:aria-label | CAT for ${esc(p.cs)} | 4 |
| W2807 | raptor-port/src/ui/QualsPage.tsx | 255 | attr:title | ${esc(p.cs)} is a WSO — AAR is a front-seat qualification | 4 |
| W2808 | raptor-port/src/ui/QualsPage.tsx | 263 | attr:title | ${esc(p.cs)} is cleared to instruct ${esc(c.h)} from the back seat | 4 |
| W2809 | raptor-port/src/ui/QualsPage.tsx | 267 | attr:title | ${adminOnly} | 3 |
| W2810 | raptor-port/src/ui/QualsPage.tsx | 538 | literal | ${c.h} is read by ${WIRED[k]}. Press REMOVE? to take it off the LoX — who already holds it is kept. | 4 |
| W2811 | raptor-port/src/ui/QualsPage.tsx | 545 | literal | ${c.h} removed from the LoX. Nobody's record changed. Add it back and the ticks return. | 4 |
| W2812 | raptor-port/src/ui/QualsPage.tsx | 563 | literal | A qualification needs a letter or a number in its name | 4 |
| W2813 | raptor-port/src/ui/QualsPage.tsx | 908 | jsx-text | [...document.querySelectorAll | 4 |
| W2814 | raptor-port/src/ui/QualsPage.tsx | 1155 | jsx-text | Edit | 4 |
| W2815 | raptor-port/src/ui/QualsPage.tsx | 1157 | jsx-text | Done | 4 |
| W2816 | raptor-port/src/ui/QualsPage.tsx | 1176 | jsx-text | Export to Excel | 4 |
| W2817 | raptor-port/src/ui/QualsPage.tsx | 1176 | jsx-text | Export | 4 |
| W2818 | raptor-port/src/ui/QualsPage.tsx | 1181 | attr:aria-label | Filter people | 4 |
| W2819 | raptor-port/src/ui/QualsPage.tsx | 1181 | attr:placeholder | filter | 4 |
| W2820 | raptor-port/src/ui/QualsPage.tsx | 1189 | jsx-text | Add qualification | 4 |
| W2821 | raptor-port/src/ui/QualsPage.tsx | 1190 | attr:placeholder | e.g. LOW LEVEL | 4 |
| W2822 | raptor-port/src/ui/QualsPage.tsx | 1193 | jsx-text | Add | 4 |
| W2823 | raptor-port/src/ui/QualsPage.tsx | 1197 | literal | Similar to a LoX and integrated with the board… | 4 |
| W2824 | raptor-port/src/ui/QualsPage.tsx | 1198 | literal | Set which quals your squadron uses | 3 |
| W2825 | raptor-port/src/ui/QualsPage.tsx | 1204 | jsx-line | The four seat buttons keep their ids so every caller and test that | 4 |
| W2826 | raptor-port/src/ui/QualsPage.tsx | 1210 | jsx-text | Viewing | 4 |
| W2827 | raptor-port/src/ui/QualsPage.tsx | 1211 | attr:aria-label | Which people to show | 4 |
| W2828 | raptor-port/src/ui/QualsPage.tsx | 1212 | jsx-text | Pilots | 4 |
| W2829 | raptor-port/src/ui/QualsPage.tsx | 1213 | jsx-text | WSOs | 4 |
| W2830 | raptor-port/src/ui/QualsPage.tsx | 1214 | jsx-text | Personnel | 4 |
| W2831 | raptor-port/src/ui/QualsPage.tsx | 1215 | jsx-text | All | 4 |
| W2832 | raptor-port/src/ui/QualsPage.tsx | 1218 | attr:title | Add a new person on Admin → Users | 3 |
| W2833 | raptor-port/src/ui/QualsPage.tsx | 1219 | jsx-text | + Add person | 4 |
| W2834 | raptor-port/src/ui/QualsPage.tsx | 1226 | jsx-text | — quals and CAT as he left them. | 4 |
| W2835 | raptor-port/src/ui/QualsPage.tsx | 1227 | jsx-text | Check his quals | 4 |
| W2836 | raptor-port/src/ui/QualsPage.tsx | 1228 | jsx-text | Later | 4 |
| W2837 | raptor-port/src/ui/QualsPage.tsx | 1238 | jsx-line | React never touches it after mount and the drag machine's classes | 4 |
| W2838 | raptor-port/src/ui/reqdoor.ts | 103 | literal | This input already has ${csOf(id)} | 5 |
| W2839 | raptor-port/src/ui/reqdoor.ts | 156 | jsx-text | ReturnType | 4 |
| W2840 | raptor-port/src/ui/reqdoor.ts | 278 | literal | Putting ${csOf(pid)} in place of ${csOf(at)} | 4 |
| W2841 | raptor-port/src/ui/reqdoor.ts | 278 | literal | Adding ${csOf(pid)} to ${inpLabel(p.inp)} | 4 |
| W2842 | raptor-port/src/ui/reqdoor.ts | 306 | literal | ${cs} is the last on this input. Take the input off the programme, or delete it in its own window. | 5 |
| W2843 | raptor-port/src/ui/reqdoor.ts | 382 | literal | Moving ${csOf(pid)} to ${inpLabel(b.inp)} | 4 |
| W2844 | raptor-port/src/ui/reqdoor.ts | 452 | literal | Taking “information only” off ${inputWho(x)}'s ${inpLabel(x)} | 5 |
| W2845 | raptor-port/src/ui/reqdoor.ts | 486 | literal | This item is checked against the rules again and can earn OIL | 1 |
| W2846 | raptor-port/src/ui/sanscal-model.ts | 102 | literal | ${c.weeks > 1 ? ' the week' : ''}. | 4 |
| W2847 | raptor-port/src/ui/sanscal-model.ts | 103 | literal | the week starts. | 4 |
| W2848 | raptor-port/src/ui/SansCal.tsx | 77 | literal | Still needed: ${seat(c.need.p, 'pilots')}, ${seat(c.need.w, 'WSOs')}. | 4 |
| W2849 | raptor-port/src/ui/SansCal.tsx | 78 | literal | Still needed: ${seat(null, 'pilots')}, ${seat(null, 'WSOs')}. | 4 |
| W2850 | raptor-port/src/ui/SansCal.tsx | 79 | literal | No required figure. | 4 |
| W2851 | raptor-port/src/ui/SansCal.tsx | 79 | literal | No leave period covers this date. | 4 |
| W2852 | raptor-port/src/ui/SansCal.tsx | 80 | literal | ${who} committed: ${[mine.f ? 'fly' : '', mine.o ? 'OFT' : '', mine.a ? 'AMT' : ''].filter(Boolean).join(', ')}. | 4 |
| W2853 | raptor-port/src/ui/SansCal.tsx | 119 | attr:title | Ring one SANS person’s days | 5,4 |
| W2854 | raptor-port/src/ui/SansCal.tsx | 121 | attr:aria-label | Highlight one SANS person | 5 |
| W2855 | raptor-port/src/ui/SansCal.tsx | 122 | jsx-text | No highlight | 4 |
| W2856 | raptor-port/src/ui/SansCal.tsx | 129 | jsx-text | No SANS aircrew on the roster. | 5,4 |
| W2857 | raptor-port/src/ui/SansCal.tsx | 302 | attr:aria-label | Previous month | 4 |
| W2858 | raptor-port/src/ui/SansCal.tsx | 306 | attr:aria-label | Next month | 4 |
| W2859 | raptor-port/src/ui/SansCal.tsx | 307 | jsx-text | Today | 4 |
| W2860 | raptor-port/src/ui/SansCal.tsx | 314 | attr:title | SANS calendar settings — day colours, the late cut-off, the Calendar | 5,4 |
| W2861 | raptor-port/src/ui/SansCal.tsx | 315 | attr:aria-label | SANS calendar settings | 5 |
| W2862 | raptor-port/src/ui/SansCal.tsx | 322 | literal | Compact words if need be | 4 |
| W2863 | raptor-port/src/ui/SansCal.tsx | 325 | attr:title | Pilots · WSOs still needed to fly | 4 |
| W2864 | raptor-port/src/ui/SansCal.tsx | 325 | attr:aria-label | Pilots, then WSOs, still needed to fly | 4 |
| W2865 | raptor-port/src/ui/SansCal.tsx | 336 | jsx-text | Tap a day to see who has committed, and to add or change yours. | 4 |
| W2866 | raptor-port/src/ui/SansCal.tsx | 337 | jsx-text | The coloured pair is how many more are needed to fly: | 4 |
| W2867 | raptor-port/src/ui/SansCal.tsx | 337 | jsx-text | pilots, then WSOs | 4 |
| W2868 | raptor-port/src/ui/SansCal.tsx | 338 | jsx-text | fly · | 4 |
| W2869 | raptor-port/src/ui/SansCal.tsx | 338 | jsx-text | OFT · | 4 |
| W2870 | raptor-port/src/ui/SansCal.tsx | 338 | jsx-text | AMT: the SANS who have committed. | 5 |
| W2871 | raptor-port/src/ui/SansCal.tsx | 339 | jsx-text | is a no-fly day. Green is a public holiday. Grey is an Off day. | 4 |
| W2872 | raptor-port/src/ui/SansCal.tsx | 340 | literal | Remove one commitment a day each | 4 |
| W2873 | raptor-port/src/ui/SansDay.tsx | 59 | literal | No flying set | 4 |
| W2874 | raptor-port/src/ui/SansDay.tsx | 103 | attr:aria-label | ${PEOPLE[e.id] ? PEOPLE[e.id].cs : e.id}, ${e.letters \|\| 'no activity'}, ${e.hours} | 4 |
| W2875 | raptor-port/src/ui/SansDay.tsx | 110 | jsx-text | LATE | 4 |
| W2876 | raptor-port/src/ui/SansDay.tsx | 116 | literal | B and sans day should follow | 5,4 |
| W2877 | raptor-port/src/ui/SansDay.tsx | 140 | jsx-text | Figure | 4 |
| W2878 | raptor-port/src/ui/SansDay.tsx | 140 | jsx-text | Pilots | 4 |
| W2879 | raptor-port/src/ui/SansDay.tsx | 140 | jsx-text | WSOs | 4 |
| W2880 | raptor-port/src/ui/SansDay.tsx | 142 | jsx-text | Required to fly | 4 |
| W2881 | raptor-port/src/ui/SansDay.tsx | 143 | jsx-text | Available | 5,4 |
| W2882 | raptor-port/src/ui/SansDay.tsx | 144 | jsx-text | SANS committed to fly | 5,4 |
| W2883 | raptor-port/src/ui/SansDay.tsx | 145 | jsx-text | Still needed | 4 |
| W2884 | raptor-port/src/ui/SansDay.tsx | 152 | jsx-text | No leave period covers this date, so who is available is not known. | 5,4 |
| W2885 | raptor-port/src/ui/SansDay.tsx | 154 | jsx-text | + Commitment | 4 |
| W2886 | raptor-port/src/ui/SansDay.tsx | 156 | attr:title | Set this month’s day, night and no-fly days, and the year’s holidays | 4 |
| W2887 | raptor-port/src/ui/SansDay.tsx | 157 | jsx-text | Calendar… | 4 |
| W2888 | raptor-port/src/ui/SansDay.tsx | 163 | jsx-text | No commitments yet. | 4 |
| W2889 | raptor-port/src/ui/SansDay.tsx | 166 | literal | OFT or AMT only · ${g.otherN} | 4 |
| W2890 | raptor-port/src/ui/SansSettings.tsx | 69 | literal | Use whole numbers of 1 or more, each above the last: yellow, then amber, then red. | 4 |
| W2891 | raptor-port/src/ui/SansSettings.tsx | 73 | literal | The colours could not be saved. Try again. | 4 |
| W2892 | raptor-port/src/ui/SansSettings.tsx | 75 | literal | The cut-off could not be saved. Try again. | 4 |
| W2893 | raptor-port/src/ui/SansSettings.tsx | 99 | attr:title | SANS calendar settings | 5 |
| W2894 | raptor-port/src/ui/SansSettings.tsx | 101 | jsx-text | Calendar | 4 |
| W2895 | raptor-port/src/ui/SansSettings.tsx | 103 | jsx-text | Calendar… | 4 |
| W2896 | raptor-port/src/ui/SansSettings.tsx | 104 | jsx-text | Day flying, night flying or no fly for each date, and the year’s holidays. | 4 |
| W2897 | raptor-port/src/ui/SansSettings.tsx | 107 | jsx-text | Day colours · by how many more are needed | 4 |
| W2898 | raptor-port/src/ui/SansSettings.tsx | 111 | jsx-text | Pilots and WSOs still needed, added together. A day that needs nobody has no colour. | 4 |
| W2899 | raptor-port/src/ui/SansSettings.tsx | 113 | jsx-text | Late cut-off for SANS commitments | 5 |
| W2900 | raptor-port/src/ui/SansSettings.tsx | 118 | jsx-text | Cancel | 4 |
| W2901 | raptor-port/src/ui/SansSettings.tsx | 119 | jsx-text | Save | 4 |
| W2902 | raptor-port/src/ui/SaveStatus.tsx | 99 | jsx-text | Retry | 4 |
| W2903 | raptor-port/src/ui/SaveStatus.tsx | 112 | jsx-text | Saving… | 4 |
| W2904 | raptor-port/src/ui/SchedBoard.tsx | 101 | jsx-text | moreRef.current?.querySelector | 4 |
| W2905 | raptor-port/src/ui/SchedBoard.tsx | 464 | jsx-text | ' + boardHTML(di, true) + ' | 4 |
| W2906 | raptor-port/src/ui/SchedBoard.tsx | 482 | attr:title | Return to your live working copy | 4 |
| W2907 | raptor-port/src/ui/SchedBoard.tsx | 482 | jsx-text | ← Back to live copy | 4 |
| W2908 | raptor-port/src/ui/SchedBoard.tsx | 485 | literal | ${glyphSvg(EYE_INNER, 'pveye')} Viewing plan <b>${esc(draftVerLabel(di, ver))}</b> — read-only. Switch to it to make it your working copy. | 2,4 |
| W2909 | raptor-port/src/ui/SchedBoard.tsx | 486 | attr:title | Make this plan your live working copy — your current one is stowed under its own name | 2,4 |
| W2910 | raptor-port/src/ui/SchedBoard.tsx | 486 | jsx-text | Switch to this plan | 2,4 |
| W2911 | raptor-port/src/ui/SchedBoard.tsx | 489 | attr:title | This discards your ${pend} unpublished edit${pend === 1 ? '' : 's'} on the working copy — the issued versions stay unchanged | 2,4 |
| W2912 | raptor-port/src/ui/SchedBoard.tsx | 489 | attr:title | Keep your current working copy | 4 |
| W2913 | raptor-port/src/ui/SchedBoard.tsx | 489 | jsx-text | Keep editing | 4 |
| W2914 | raptor-port/src/ui/SchedBoard.tsx | 490 | attr:title | Load this issued version onto your working copy to edit — nothing is published until you Publish AL, and the issued versions stay unchanged | 2,4 |
| W2915 | raptor-port/src/ui/SchedBoard.tsx | 490 | jsx-text | Load onto working copy | 4 |
| W2916 | raptor-port/src/ui/SchedBoard.tsx | 520 | jsx-line | The bar was four stacked rows and 166px of a 780px screen: title, the | 4 |
| W2917 | raptor-port/src/ui/SchedBoard.tsx | 527 | jsx-line | The labels are still in the DOM — `.bl` is display:none under 820px, | 4 |
| W2918 | raptor-port/src/ui/SchedBoard.tsx | 537 | attr:title | Jump to a date | 4 |
| W2919 | raptor-port/src/ui/SchedBoard.tsx | 540 | jsx-text | Calendar | 4 |
| W2920 | raptor-port/src/ui/SchedBoard.tsx | 553 | attr:title | today | 4 |
| W2921 | raptor-port/src/ui/SchedBoard.tsx | 554 | jsx-text | · scheduler board | 4 |
| W2922 | raptor-port/src/ui/SchedBoard.tsx | 560 | jsx-line | They flank the DAY STRIP rather than sitting at the two ends of the | 4 |
| W2923 | raptor-port/src/ui/SchedBoard.tsx | 582 | attr:title | Previous day | 4 |
| W2924 | raptor-port/src/ui/SchedBoard.tsx | 614 | attr:aria-label | Highlight filters | 4 |
| W2925 | raptor-port/src/ui/SchedBoard.tsx | 614 | attr:title | Highlight by category / quals | 4 |
| W2926 | raptor-port/src/ui/SchedBoard.tsx | 620 | attr:aria-label | More — Sort all and the layout | 4 |
| W2927 | raptor-port/src/ui/SchedBoard.tsx | 620 | attr:title | Sort all · Phone / Desktop layout | 4 |
| W2928 | raptor-port/src/ui/SchedBoard.tsx | 643 | jsx-text | Insights | 10,4 |
| W2929 | raptor-port/src/ui/SchedBoard.tsx | 646 | jsx-text | Sort all | 4 |
| W2930 | raptor-port/src/ui/SchedBoard.tsx | 652 | attr:placeholder | name / callsign | 4 |
| W2931 | raptor-port/src/ui/SchedBoard.tsx | 652 | attr:aria-label | Search by name or callsign | 4 |
| W2932 | raptor-port/src/ui/SchedBoard.tsx | 654 | attr:title | Next day | 4 |
| W2933 | raptor-port/src/ui/SchedBoard.tsx | 675 | jsx-line | The accent TINT is his too: "since settings usually have some blue | 4 |
| W2934 | raptor-port/src/ui/SchedBoard.tsx | 679 | jsx-line | Earn stays, lit green, as the way out. Drawn only where the day can | 4 |
| W2935 | raptor-port/src/ui/SchedBoard.tsx | 691 | attr:title | Save this day, or apply a saved one | 4 |
| W2936 | raptor-port/src/ui/SchedBoard.tsx | 692 | jsx-text | Templates | 4 |
| W2937 | raptor-port/src/ui/SchedBoard.tsx | 695 | literal | Leave OIL mode and edit the schedule again | 1,4 |
| W2938 | raptor-port/src/ui/SchedBoard.tsx | 695 | literal | Show who earns OIL on this day, and change it | 1,4 |
| W2939 | raptor-port/src/ui/SchedBoard.tsx | 696 | literal | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | 1,4 |
| W2940 | raptor-port/src/ui/SchedBoard.tsx | 696 | literal | Back to editing the schedule | 4 |
| W2941 | raptor-port/src/ui/SchedBoard.tsx | 698 | jsx-text | OIL Earn | 1,4 |
| W2942 | raptor-port/src/ui/SchedBoard.tsx | 714 | attr:title | Reorder every section on this day back into its own reading order, waves and duty blocks included — one confirm, one undo step | 4 |
| W2943 | raptor-port/src/ui/SchedBoard.tsx | 726 | jsx-line | Kept identical to Shell.tsx's copy on purpose: two buttons, one | 10,4 |
| W2944 | raptor-port/src/ui/SchedBoard.tsx | 738 | jsx-line | The list is the SECOND button. It was nearly a chevron inside | 4 |
| W2945 | raptor-port/src/ui/SchedBoard.tsx | 744 | jsx-line | THE LIST IS NOT A SECOND BUTTON, and that is measured, not | 4 |
| W2946 | raptor-port/src/ui/SchedBoard.tsx | 759 | literal | Close the changes — and stop showing who changed each detail | 4 |
| W2947 | raptor-port/src/ui/SchedBoard.tsx | 759 | literal | Show the changes, and who changed each detail — hover it, or tap it on a phone | 4 |
| W2948 | raptor-port/src/ui/SchedBoard.tsx | 761 | jsx-text | History | 4 |
| W2949 | raptor-port/src/ui/SchedBoard.tsx | 785 | jsx-text | Done | 4 |
| W2950 | raptor-port/src/ui/SchedBoard.tsx | 786 | literal | What does tick or close do? is it the same function? | 4 |
| W2951 | raptor-port/src/ui/SchedBoard.tsx | 795 | jsx-line | INSIDE .sb-top deliberately: the bar's ResizeObserver republishes | 2,4 |
| W2952 | raptor-port/src/ui/SchedBoard.tsx | 806 | attr:title | Highlight | 4 |
| W2953 | raptor-port/src/ui/SchedBoard.tsx | 807 | literal | S WARNING ([SAVE-NOTE-COVERS], D587): the board lies over the top bar, so the bar | 10,4 |
| W2954 | raptor-port/src/ui/SchedBoard.tsx | 828 | jsx-line | Inputs, Unavailable and SANS panels, so the summary was a | 5,4 |
| W2955 | raptor-port/src/ui/SchedBoard.tsx | 844 | attr:aria-label | Crew panel width | 4 |
| W2956 | raptor-port/src/ui/SchedBoard.tsx | 845 | attr:title | Drag to widen the panel. Double-click puts it back. | 4 |
| W2957 | raptor-port/src/ui/SchedBoard.tsx | 849 | attr:title | Drag to resize the checks panel | 4 |
| W2958 | raptor-port/src/ui/SchedBoard.tsx | 851 | attr:title | Aircrew palette | 4 |
| W2959 | raptor-port/src/ui/SchedBoard.tsx | 851 | jsx-text | AIRCREW | 4 |
| W2960 | raptor-port/src/ui/SchedBoard.tsx | 907 | attr:aria-label | Close | 4 |
| W2961 | raptor-port/src/ui/SchedBoard.tsx | 909 | jsx-text | CX DUE | 4 |
| W2962 | raptor-port/src/ui/SchedBoard.tsx | 910 | attr:aria-label | Reason for cancellation | 4 |
| W2963 | raptor-port/src/ui/SchedBoard.tsx | 912 | jsx-text | Reads | 4 |
| W2964 | raptor-port/src/ui/SchedBoard.tsx | 912 | jsx-text | on the line. Leave it blank for a plain CX. | 4 |
| W2965 | raptor-port/src/ui/SchedBoard.tsx | 916 | attr:title | Add, rename or remove the quick reasons | 4 |
| W2966 | raptor-port/src/ui/SchedBoard.tsx | 916 | jsx-text | Edit | 4 |
| W2967 | raptor-port/src/ui/SchedBoard.tsx | 919 | jsx-text | Cancel reasons | 4 |
| W2968 | raptor-port/src/ui/SchedBoard.tsx | 933 | attr:aria-label | Move up | 4 |
| W2969 | raptor-port/src/ui/SchedBoard.tsx | 934 | attr:aria-label | Move down | 4 |
| W2970 | raptor-port/src/ui/SchedBoard.tsx | 935 | attr:aria-label | Remove reason | 4 |
| W2971 | raptor-port/src/ui/SchedBoard.tsx | 938 | jsx-text | No quick reasons — add one below, or reset to the standard set. | 4 |
| W2972 | raptor-port/src/ui/SchedBoard.tsx | 941 | attr:placeholder | Add a reason… | 4 |
| W2973 | raptor-port/src/ui/SchedBoard.tsx | 941 | attr:aria-label | New cancel reason | 4 |
| W2974 | raptor-port/src/ui/SchedBoard.tsx | 943 | jsx-text | Add | 4 |
| W2975 | raptor-port/src/ui/SchedBoard.tsx | 951 | jsx-text | Un-cancel | 4 |
| W2976 | raptor-port/src/ui/SchedBoard.tsx | 992 | jsx-text | Cancel | 4 |
| W2977 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 20 | jsx-text | (null), opener=useRef | 10,4 |
| W2978 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 20 | jsx-text | (null), item=useRef | 10,4 |
| W2979 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 26 | jsx-text | setPhone(window.innerWidth | 10,4 |
| W2980 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 53 | jsx-text | wrapper.current?.querySelector | 10,4 |
| W2981 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 70 | attr:aria-label | More schedule options | 10,4 |
| W2982 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 74 | attr:aria-label | Schedule options | 10,4 |
| W2983 | raptor-port/src/ui/ScheduleInsightsMenu.tsx | 76 | jsx-text | Insights | 10,4 |
| W2984 | raptor-port/src/ui/SecDefaultSnackbar.tsx | 53 | literal | Saved as the default section order for every day | 4 |
| W2985 | raptor-port/src/ui/SecDefaultSnackbar.tsx | 58 | jsx-text | Use this section order as the default for every day? | 4 |
| W2986 | raptor-port/src/ui/SecDefaultSnackbar.tsx | 59 | jsx-text | Set as default | 4 |
| W2987 | raptor-port/src/ui/SecDefaultSnackbar.tsx | 60 | jsx-text | Not now | 4 |
| W2988 | raptor-port/src/ui/Shell.tsx | 364 | attr:aria-label | Menu | 10 |
| W2989 | raptor-port/src/ui/Shell.tsx | 368 | jsx-text | Edit Schedule | 10,4 |
| W2990 | raptor-port/src/ui/Shell.tsx | 370 | jsx-text | View-only Sched | 3,10,4 |
| W2991 | raptor-port/src/ui/Shell.tsx | 372 | jsx-text | Inputs | 5,10 |
| W2992 | raptor-port/src/ui/Shell.tsx | 374 | jsx-text | Quals | 10 |
| W2993 | raptor-port/src/ui/Shell.tsx | 376 | jsx-text | Logic | 10 |
| W2994 | raptor-port/src/ui/Shell.tsx | 378 | jsx-text | Leave War | 10 |
| W2995 | raptor-port/src/ui/Shell.tsx | 384 | jsx-text | Tracker | 10 |
| W2996 | raptor-port/src/ui/Shell.tsx | 389 | jsx-text | Help | 10 |
| W2997 | raptor-port/src/ui/Shell.tsx | 402 | literal | Only while editing | 10 |
| W2998 | raptor-port/src/ui/Shell.tsx | 431 | literal | Changes — ${wn} new to you this week | 10 |
| W2999 | raptor-port/src/ui/Shell.tsx | 431 | literal | Changes — every change this week, and who made it | 10 |
| W3000 | raptor-port/src/ui/Shell.tsx | 432 | literal | Changes, ${wn} new to you this week | 10 |
| W3001 | raptor-port/src/ui/Shell.tsx | 443 | literal | N issues · N warning · tap to review | 10,4 |
| W3002 | raptor-port/src/ui/Shell.tsx | 455 | jsx-line | Tapping it with a bug alert live goes straight to the Help page, | 10 |
| W3003 | raptor-port/src/ui/Shell.tsx | 458 | jsx-line | Otherwise the tap acknowledges the current view's alert, as | 10 |
| W3004 | raptor-port/src/ui/Shell.tsx | 479 | attr:title | Week insights | 10 |
| W3005 | raptor-port/src/ui/Shell.tsx | 479 | jsx-text | Insights | 10 |
| W3006 | raptor-port/src/ui/Shell.tsx | 481 | jsx-line | SBDAY itself, plus CURPAGE and the leftover selection/highlight/preview | 10,4 |
| W3007 | raptor-port/src/ui/Shell.tsx | 488 | jsx-text | Logout | 10 |
| W3008 | raptor-port/src/ui/Shell.tsx | 493 | literal | SABER · ADMIN | 3,10 |
| W3009 | raptor-port/src/ui/Shell.tsx | 494 | jsx-line | MEMBER": a tap switches him to the member view and back, state/store.ts | 3,10 |
| W3010 | raptor-port/src/ui/Shell.tsx | 498 | literal | Switch to the member view | 3,10 |
| W3011 | raptor-port/src/ui/Shell.tsx | 498 | literal | Back to the admin view | 3,10 |
| W3012 | raptor-port/src/ui/Shell.tsx | 501 | literal | Signed in as ${mineCs} | 2,10 |
| W3013 | raptor-port/src/ui/Shell.tsx | 527 | attr:aria-label | Jump to a date | 10 |
| W3014 | raptor-port/src/ui/Shell.tsx | 544 | attr:title | Highlight | 10 |
| W3015 | raptor-port/src/ui/Shell.tsx | 546 | attr:aria-label | Highlight filters | 10 |
| W3016 | raptor-port/src/ui/Shell.tsx | 555 | attr:placeholder | name / callsign | 10 |
| W3017 | raptor-port/src/ui/Shell.tsx | 555 | attr:aria-label | Search by name or callsign | 10 |
| W3018 | raptor-port/src/ui/Shell.tsx | 560 | jsx-text | Legend — colours &amp; flags | 10 |
| W3019 | raptor-port/src/ui/Shell.tsx | 565 | attr:title | ${d.dow} | 10 |
| W3020 | raptor-port/src/ui/Shell.tsx | 606 | attr:title | Export to Excel (CSV) | 10 |
| W3021 | raptor-port/src/ui/Shell.tsx | 613 | attr:title | Export as PDF (print) | 10 |
| W3022 | raptor-port/src/ui/Shell.tsx | 618 | literal | Print dialog opened — choose "Save as PDF" | 10 |
| W3023 | raptor-port/src/ui/Shell.tsx | 656 | attr:aria-label | Hide or show the aircrew panel | 10,4 |
| W3024 | raptor-port/src/ui/Shell.tsx | 657 | jsx-text | CREW | 10,4 |
| W3025 | raptor-port/src/ui/Shell.tsx | 675 | literal | Welcome back — check your quals and CAT | 10 |
| W3026 | raptor-port/src/ui/Shell.tsx | 712 | attr:aria-label | Scroll days left | 10,4 |
| W3027 | raptor-port/src/ui/Shell.tsx | 713 | attr:aria-label | Scroll days right | 10,4 |
| W3028 | raptor-port/src/ui/Shell.tsx | 714 | attr:aria-label | Scroll the week sideways | 10 |
| W3029 | raptor-port/src/ui/Shell.tsx | 715 | attr:aria-label | Scroll left | 10 |
| W3030 | raptor-port/src/ui/Shell.tsx | 717 | attr:aria-label | Scroll right | 10 |
| W3031 | raptor-port/src/ui/topbits.tsx | 40 | attr:title | Toggle 1-second sync (for publishing / meetings) | 2 |
| W3032 | raptor-port/src/ui/topbits.tsx | 105 | attr:aria-label | Notifications | 9 |
| W3033 | raptor-port/src/ui/topbits.tsx | 108 | jsx-text | Nothing new | 4 |
| W3034 | raptor-port/src/ui/topbits.tsx | 132 | jsx-text | Mark all read | 4 |
| W3035 | raptor-port/src/ui/topbits.tsx | 156 | attr:aria-label | Undo | 4 |
| W3036 | raptor-port/src/ui/topbits.tsx | 158 | attr:aria-label | Redo | 4 |
| W3037 | raptor-port/src/ui/topstate.ts | 76 | literal | Weekend/PH work — confirm your OIL | 1 |
| W3038 | raptor-port/src/ui/topstate.ts | 135 | literal | That input is gone | 5 |
| W3039 | raptor-port/src/ui/topstate.ts | 170 | literal | Undo — ${us.undoLabel} | 4 |
| W3040 | raptor-port/src/ui/topstate.ts | 171 | literal | Redo — ${us.redoLabel} | 4 |
| W3041 | raptor-port/src/ui/topstate.ts | 175 | literal | Left OIL Earn without undoing. The next undo would change the day itself. | 1,4 |
| W3042 | raptor-port/src/ui/topstate.ts | 191 | literal | Undo ${t.undoWhat()} (Ctrl+Z) | 4 |
| W3043 | raptor-port/src/ui/topstate.ts | 191 | literal | Nothing to undo | 4 |
| W3044 | raptor-port/src/ui/topstate.ts | 192 | literal | Redo ${t.redoWhat()} (Ctrl+Y) | 4 |
| W3045 | raptor-port/src/ui/topstate.ts | 192 | literal | Nothing to redo | 4 |
| W3046 | raptor-port/src/ui/TypeLegend.tsx | 63 | attr:title | What do these mean? | 10 |
| W3047 | raptor-port/src/ui/TypeLegend.tsx | 65 | jsx-text | What each type means | 10 |
| W3048 | raptor-port/src/ui/UpchitConfirm.tsx | 62 | attr:aria-label | Close | 4 |
| W3049 | raptor-port/src/ui/UpchitConfirm.tsx | 72 | jsx-text | , its days given back | 4 |
| W3050 | raptor-port/src/ui/UpchitConfirm.tsx | 73 | jsx-text | removed | 4 |
| W3051 | raptor-port/src/ui/UpchitConfirm.tsx | 73 | jsx-text | — it would only cover fit days | 4 |
| W3052 | raptor-port/src/ui/UpchitConfirm.tsx | 76 | jsx-text | Close the pending medical-down period — no current entry needs shortening. | 4 |
| W3053 | raptor-port/src/ui/UpchitConfirm.tsx | 79 | jsx-text | Still on file after it — choose for each | 4 |
| W3054 | raptor-port/src/ui/UpchitConfirm.tsx | 88 | jsx-text | Keep | 4 |
| W3055 | raptor-port/src/ui/UpchitConfirm.tsx | 90 | jsx-text | Remove | 4 |
| W3056 | raptor-port/src/ui/UpchitConfirm.tsx | 96 | literal | Choose Keep or Remove for each entry above | 4 |
| W3057 | raptor-port/src/ui/UpchitConfirm.tsx | 100 | jsx-text | Cancel | 4 |
| W3058 | raptor-port/src/ui/UsersPanel.tsx | 32 | jsx-line | ACCESS_REQS, accountOfPid, linkablePeople, addAccount, updateAccount, | 3 |
| W3059 | raptor-port/src/ui/UsersPanel.tsx | 37 | jsx-line | SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, CS_TOO_LONG, callsignProblem, nextFreeCallsign, type NewPerson, | 4 |
| W3060 | raptor-port/src/ui/UsersPanel.tsx | 56 | attr:aria-label | The callsign or name this account belongs to | 3 |
| W3061 | raptor-port/src/ui/UsersPanel.tsx | 57 | jsx-text | Pick a callsign or name… | 4 |
| W3062 | raptor-port/src/ui/UsersPanel.tsx | 64 | attr:aria-label | Member or admin | 3 |
| W3063 | raptor-port/src/ui/UsersPanel.tsx | 65 | jsx-text | Member — own inputs, quals and bids | 3,5 |
| W3064 | raptor-port/src/ui/UsersPanel.tsx | 66 | jsx-text | Admin — schedules and manages | 3,4 |
| W3065 | raptor-port/src/ui/UsersPanel.tsx | 74 | jsx-text | Post in | 4 |
| W3066 | raptor-port/src/ui/UsersPanel.tsx | 86 | jsx-text | Person | 4 |
| W3067 | raptor-port/src/ui/UsersPanel.tsx | 87 | attr:aria-label | Someone on the roster, or a new person | 4 |
| W3068 | raptor-port/src/ui/UsersPanel.tsx | 89 | jsx-text | On the roster | 4 |
| W3069 | raptor-port/src/ui/UsersPanel.tsx | 91 | jsx-text | New person | 4 |
| W3070 | raptor-port/src/ui/UsersPanel.tsx | 97 | jsx-text | void; csRef?: React.Ref | 4 |
| W3071 | raptor-port/src/ui/UsersPanel.tsx | 107 | jsx-text | Initials | 4 |
| W3072 | raptor-port/src/ui/UsersPanel.tsx | 111 | jsx-text | Pilot, WSO or personnel | 4 |
| W3073 | raptor-port/src/ui/UsersPanel.tsx | 114 | jsx-text | Pick… | 4 |
| W3074 | raptor-port/src/ui/UsersPanel.tsx | 118 | jsx-text | CAT | 4 |
| W3075 | raptor-port/src/ui/UsersPanel.tsx | 120 | jsx-text | None — personnel | 4 |
| W3076 | raptor-port/src/ui/UsersPanel.tsx | 136 | literal | If it is someone else, choose New person and give them another callsign or name. | 4 |
| W3077 | raptor-port/src/ui/UsersPanel.tsx | 149 | literal | It is your own account: if it is you on a new sign-in, another admin must change its sign-in on your row — you can't change your own. | 3 |
| W3078 | raptor-port/src/ui/UsersPanel.tsx | 150 | literal | If it is them on a new sign-in, change the sign-in on ${p.cs}'s row — that answers this request. | 3 |
| W3079 | raptor-port/src/ui/UsersPanel.tsx | 153 | literal | He typed ${r.cs} — ${p.cs} is on the roster. Pick them if this is them. | 4 |
| W3080 | raptor-port/src/ui/UsersPanel.tsx | 154 | literal | He typed ${r.cs} — that is ${p.cs}. Pick them if this is them. | 4 |
| W3081 | raptor-port/src/ui/UsersPanel.tsx | 163 | literal | An archived man is already ${r.cs.trim()} — this makes a new person. If it is him, restore him first (▸ Archived), then give him his sign-in on his row. | 3 |
| W3082 | raptor-port/src/ui/UsersPanel.tsx | 178 | jsx-text | Nobody is waiting for access. | 4 |
| W3083 | raptor-port/src/ui/UsersPanel.tsx | 189 | jsx-text | asked as | 4 |
| W3084 | raptor-port/src/ui/UsersPanel.tsx | 193 | literal | Give access · Refuse | 3 |
| W3085 | raptor-port/src/ui/UsersPanel.tsx | 194 | jsx-text | Give access | 4 |
| W3086 | raptor-port/src/ui/UsersPanel.tsx | 195 | jsx-text | Refuse | 3 |
| W3087 | raptor-port/src/ui/UsersPanel.tsx | 211 | jsx-text | Role | 4 |
| W3088 | raptor-port/src/ui/UsersPanel.tsx | 219 | literal | Add person and give access | 4 |
| W3089 | raptor-port/src/ui/UsersPanel.tsx | 220 | jsx-text | Cancel | 4 |
| W3090 | raptor-port/src/ui/UsersPanel.tsx | 255 | literal | Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone. | 3,4 |
| W3091 | raptor-port/src/ui/UsersPanel.tsx | 268 | jsx-text | you | 4 |
| W3092 | raptor-port/src/ui/UsersPanel.tsx | 286 | literal | Your own account — another admin can change it | 3 |
| W3093 | raptor-port/src/ui/UsersPanel.tsx | 332 | jsx-text | Sign-in (defence mail) | 3 |
| W3094 | raptor-port/src/ui/UsersPanel.tsx | 333 | attr:placeholder | name@mail | 4 |
| W3095 | raptor-port/src/ui/UsersPanel.tsx | 341 | jsx-text | Save | 4 |
| W3096 | raptor-port/src/ui/UsersPanel.tsx | 354 | jsx-text | Give sign-in | 3 |
| W3097 | raptor-port/src/ui/UsersPanel.tsx | 356 | jsx-text | Archive | 4 |
| W3098 | raptor-port/src/ui/UsersPanel.tsx | 359 | literal | Tap again to delete ${callsign} | 4 |
| W3099 | raptor-port/src/ui/UsersPanel.tsx | 377 | attr:title | Restore or delete ${callsign} | 4 |
| W3100 | raptor-port/src/ui/UsersPanel.tsx | 407 | literal | That did not save | 4 |
| W3101 | raptor-port/src/ui/UsersPanel.tsx | 430 | jsx-text | Save name | 4 |
| W3102 | raptor-port/src/ui/UsersPanel.tsx | 446 | jsx-text | Sign-in | 3 |
| W3103 | raptor-port/src/ui/UsersPanel.tsx | 446 | jsx-text | Roster | 4 |
| W3104 | raptor-port/src/ui/UsersPanel.tsx | 535 | jsx-text | Waiting for access | 4 |
| W3105 | raptor-port/src/ui/UsersPanel.tsx | 541 | attr:placeholder | Find a callsign or sign-in | 3 |
| W3106 | raptor-port/src/ui/UsersPanel.tsx | 548 | jsx-text | Nobody matches. | 4 |
| W3107 | raptor-port/src/ui/UsersPanel.tsx | 566 | jsx-text | Add a person | 4 |
| W3108 | raptor-port/src/ui/UsersPanel.tsx | 571 | attr:placeholder | blank if he won't use the app | 4 |
| W3109 | raptor-port/src/ui/UsersPanel.tsx | 578 | literal | Add person and sign-in | 3 |
| W3110 | raptor-port/src/ui/UsersPanel.tsx | 579 | jsx-text | Makes his Quals row, and his sign-in if you give one. The Leave War counts him from the post-in date. | 3 |
| W3111 | raptor-port/src/ui/WaveTplModal.tsx | 26 | jsx-line | WAVETPL_CFG, WAVE_BUILTIN, MAX_WLINES, kindIsStandby, kindNote, | 4 |
| W3112 | raptor-port/src/ui/WaveTplModal.tsx | 106 | attr:aria-label | Close | 4 |
| W3113 | raptor-port/src/ui/WaveTplModal.tsx | 106 | jsx-text | Flying waves | 4 |
| W3114 | raptor-port/src/ui/WaveTplModal.tsx | 111 | jsx-text | Wave types | 4 |
| W3115 | raptor-port/src/ui/WaveTplModal.tsx | 112 | jsx-text | Show or hide what appears in | 4 |
| W3116 | raptor-port/src/ui/WaveTplModal.tsx | 112 | jsx-text | + Wave | 4 |
| W3117 | raptor-port/src/ui/WaveTplModal.tsx | 112 | jsx-text | . Built-in types can be hidden but not deleted. | 4 |
| W3118 | raptor-port/src/ui/WaveTplModal.tsx | 118 | jsx-text | Built-in type | 4 |
| W3119 | raptor-port/src/ui/WaveTplModal.tsx | 128 | jsx-text | Templates | 4 |
| W3120 | raptor-port/src/ui/WaveTplModal.tsx | 132 | literal | Hidden from + Wave | 4 |
| W3121 | raptor-port/src/ui/WaveTplModal.tsx | 135 | jsx-text | + New | 4 |
| W3122 | raptor-port/src/ui/WaveTplModal.tsx | 140 | jsx-text | No wave templates yet. | 4 |
| W3123 | raptor-port/src/ui/WaveTplModal.tsx | 141 | jsx-text | Build a wave you set up often — a package of flying lines, or a standby shift — save it here, and it appears in | 4 |
| W3124 | raptor-port/src/ui/WaveTplModal.tsx | 141 | jsx-text | to drop onto any day in one tap. | 4 |
| W3125 | raptor-port/src/ui/WaveTplModal.tsx | 142 | jsx-text | + New wave template | 4 |
| W3126 | raptor-port/src/ui/WaveTplModal.tsx | 148 | attr:placeholder | Template name | 4 |
| W3127 | raptor-port/src/ui/WaveTplModal.tsx | 153 | attr:aria-label | Rule-set | 4 |
| W3128 | raptor-port/src/ui/WaveTplModal.tsx | 165 | jsx-text | + Add line | 4 |
| W3129 | raptor-port/src/ui/WaveTplModal.tsx | 174 | literal | Wave templates cleared | 4 |
| W3130 | raptor-port/src/ui/WaveTplModal.tsx | 175 | jsx-text | Clear all | 4 |
| W3131 | raptor-port/src/ui/WaveTplModal.tsx | 182 | literal | "${title}" template deleted | 4 |
| W3132 | raptor-port/src/ui/WaveTplModal.tsx | 183 | jsx-text | Delete template | 4 |
| W3133 | raptor-port/src/ui/WaveTplModal.tsx | 184 | jsx-text | Done | 4 |
| W3134 | raptor-port/src/ui/WaveTplModal.tsx | 197 | literal | Hidden from + Wave — tap to show | 4 |
| W3135 | raptor-port/src/ui/WaveTplModal.tsx | 197 | literal | Shown in + Wave — tap to hide | 4 |
| W3136 | raptor-port/src/ui/WaveTplModal.tsx | 214 | attr:aria-label | Move up | 4 |
| W3137 | raptor-port/src/ui/WaveTplModal.tsx | 216 | attr:aria-label | Move down | 4 |
| W3138 | raptor-port/src/ui/WaveTplModal.tsx | 219 | attr:placeholder | Callsign | 4 |
| W3139 | raptor-port/src/ui/WaveTplModal.tsx | 221 | attr:title | Remove this line | 4 |
| W3140 | raptor-port/src/ui/WaveTplModal.tsx | 225 | attr:placeholder | Mission | 4 |
| W3141 | raptor-port/src/ui/WaveTplModal.tsx | 227 | attr:aria-label | Take-off | 4 |
| W3142 | raptor-port/src/ui/WaveTplModal.tsx | 231 | attr:aria-label | Landing | 4 |
| W3143 | raptor-port/src/ui/WaveTplModal.tsx | 237 | attr:title | Switch this line between MAIN and SPARE | 4 |
| W3144 | raptor-port/src/ui/WeekCal.tsx | 80 | jsx-text | boxRef.current?.querySelector | 4 |
| W3145 | raptor-port/src/ui/WeekCal.tsx | 109 | attr:aria-label | Jump to a date | 4 |
| W3146 | raptor-port/src/ui/WeekCal.tsx | 113 | attr:aria-label | Close | 4 |
| W3147 | raptor-port/src/ui/WeekCal.tsx | 116 | jsx-text | Tap any day to go to it. | 4 |
| W3148 | raptor-port/src/ui/WelcomeBack.tsx | 31 | jsx-text | — check your quals and CAT. | 4 |
| W3149 | raptor-port/src/ui/WelcomeBack.tsx | 32 | jsx-text | Check my quals | 4 |
| W3150 | raptor-port/src/ui/WelcomeBack.tsx | 33 | jsx-text | Later | 4 |

## List 2b — the notification register's rows (G-R)

Source: `raptor-port/docs/notifications-register.md`. Each row's words also live in the source (see list 2a); slice 9 owns them.

| Id | Register line | Section | Row # | Row (cells) | Slice |
|---|---|---|---|---|---|
| GR001 | 32 | Built — the bell's notices today | B1 | each person in an input ‖ it is deleted ‖ *Deleted* ‖ — ‖ the bell (D769) | 9 |
| GR002 | 33 | Built — the bell's notices today | B2 | a person ‖ he is put in an input, or one is filed for him ‖ *You were added* ‖ the input ‖ D769 | 9 |
| GR003 | 34 | Built — the bell's notices today | B3 | a person ‖ he is taken out of an input ‖ *You were taken off* ‖ the input ‖ D769 | 9 |
| GR004 | 35 | Built — the bell's notices today | B4 | its people ‖ an input is cancelled, or brought back ‖ *Cancelled — reason* / *Un-cancelled* ‖ the input ‖ D760 | 9 |
| GR005 | 36 | Built — the bell's notices today | B5 | its people ‖ an input is taken off the programme, or put back ‖ *Taken off the programme* / *Back on the programme* ‖ the day ‖ D769 | 9 |
| GR006 | 37 | Built — the bell's notices today | B6 | its people ‖ filed under Unavailable, or taken out ‖ *Filed under Unavailable* / *Taken out of Unavailable* ‖ the day ‖ D815 | 9 |
| GR007 | 38 | Built — the bell's notices today | B7 | its people ‖ its days or hours move ‖ *Now Tue 14 – Wed 15 Jul 08:00* ‖ the input ‖ D769 | 9 |
| GR008 | 39 | Built — the bell's notices today | B8 | its people ‖ others are put in or taken out ‖ *Saber, Ranger added* / *… taken off* ‖ the input ‖ D769 | 9 |
| GR009 | 40 | Built — the bell's notices today | B9 | its people ‖ it is renamed, or its remark changes ‖ *Renamed — was …* / *Remark changed* ‖ the input ‖ D769 | 9 |
| GR010 | 41 | Built — the bell's notices today | B10 | the filer, or the schedulers — since the reshape (21 Nov 26; his D2195, D2202) the admins of today of the holiday's OWN squadron only: an admin at home there, or a plain admin holding Plan of it; a master admin through his home squadron only (D2198); never another squadron's, even at the same place (`leavewar/sync.ts holidayTodo` → `state/accounts.ts adminsOf`). *(Was, multi-squadron step 4, 18 Nov 26: the schedulers of every squadron at the holiday's place, each where his own squadron had an input to answer — D21… | 9 |
| GR011 | 42 | Built — the bell's notices today | B11 | the filer ‖ an OIL question nobody answered for an ALL / ALL AVAIL input ‖ the input's line ‖ the question ‖ D711 | 9 |
| GR012 | 43 | Built — the bell's notices today | B12 | the admins of today of the man's own squadron — every admin who can sign in at home there, and a plain admin holding Plan of it (D2202); a master admin through his home squadron only (D2198) — never another squadron's, never the man himself (`leavewar/sync.ts postingAdmins` → `state/accounts.ts adminsOf`, since the reshape, 21 Nov 26; was `ownSchedulerIds`, the home admins of the squadron whose Leave War the posting was set in — multi-squadron step 4, 18 Nov 26) (the posting pass, `leavewar/sync.ts runPoOutcomes`;… | 9 |
| GR013 | 44 | Built — the bell's notices today | B13 | the man himself only — never an admin's bell (the agent's reading, told to him) ‖ **from the moment his SANS posting is saved (his D2340, 23 Nov 26 — narrowing D2338, which waited for its date)**, while he is named on our programme on a day from its date — from today, in the weeks the app holds (the week loaded and his squadron's saved weeks) — with no SANS availability filed for it; worked out from the schedule as it stands, never stored, as B12's "off the manpower" line is (`leavewar/sansunfiled.ts`, through `le… | 9 |
| GR014 | 45 | Built — the bell's notices today | R1 | a member ‖ the Leave War decides his leave: a bid approved or refused, an approved leave put back to a bid, moved or deleted, a bid replaced by a clashing input; days decided together are one line; an Ack tells nothing (Ack goes with the overhaul — D1158) ‖ ***Your leave*** *Mon 19 – Wed 21 Jan · LL approved · Saber* ‖ the grid, at that day ‖ D1142 — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts decisionTells` / `openingTells`, `leavewar/sync.ts tellWar` / `tellBidding` / `… | 9 |
| GR015 | 46 | Built — the bell's notices today | P2 | a member — **ruled 27 Oct 26 (D1422)**, built with M4 ‖ an admin enters leave on his row with "Approve what I enter" ticked (D1147) — it lands approved, with no bid of his ‖ ***Your leave*** *Mon 9 Mar · LL added and approved · Saber* ‖ the grid, at that day ‖ the full mock-up (picture 7) — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts decisionTells` / `openingTells`, `leavewar/sync.ts tellWar` / `tellBidding` / `warNoticesReversed` / `endedLines` / `alsoSince`, `state/noti… | 9 |
| GR016 | 47 | Built — the bell's notices today | P4 | every member — **ruled 22 Oct 26 (D1214)** ‖ the admin opens months for leave (shortens a "Not open yet" lock — Q5) ‖ ***Leave War*** *Apr – Jun open for leave · Saber* ‖ the grid, at the first open day ‖ the full mock-up (picture 11) — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts decisionTells` / `openingTells`, `leavewar/sync.ts tellWar` / `tellBidding` / `warNoticesReversed` / `endedLines` / `alsoSince`, `state/notices.ts`) | 9 |
| GR017 | 48 | Built — the bell's notices today | P7 | every member — **ruled 22 Oct 26 (D1214)**; a tap opens the Leave War with that period in view ‖ bidding closes: an open stretch is closed or shortened, or its last day passes (round 3's question 5, his question on a closed stretch, 21 Oct 26) ‖ ***Leave War*** *bidding closed · 1 Apr – 30 Jun · Saber* ‖ the Leave War, the chip's list ("Last open 1 Apr – 30 Jun · closed by Saber, 15 Mar") ‖ the full mock-up (Q5), proposed — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts deci… | 9 |
| GR018 | 49 | Built — the bell's notices today | P8 | a member who has read the approval — **ruled 22 Oct 26 (D1216)** ‖ an admin's Undo takes back an approval the bell already told him of (the red team, 22 Oct 26 — today the line is withdrawn silently, D148) ‖ ***Your leave*** *Tue 10 – Wed 11 Feb · approval of LL taken back · Saber* ‖ the grid, at that day ‖ the design note §10.3 Q11, his to answer — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts decisionTells` / `openingTells`, `leavewar/sync.ts tellWar` / `tellBidding` / `w… | 9 |
| GR019 | 50 | Built — the bell's notices today | P9 | the admins ‖ a member withdraws a waiting bid, or files leave on the Inputs page that lands on the war (the red team, 22 Oct 26 — today neither tells an admin) ‖ shown in Approvals' "Also since you last looked" group, not as a bell line — the agent's reading (D1199 option A) ‖ the grid, at that day ‖ the design note §10.1, D1199 — **BUILT 27 Oct 26 with the Leave War overhaul's M4** (PR 581; `leavewar/state/store.ts decisionTells` / `openingTells`, `leavewar/sync.ts tellWar` / `tellBidding` / `warNoticesReversed` … | 9 |
| GR020 | 51 | Built — the bell's notices today | P11 | a member — **built 27 Oct 26 with M4, as D1142 names it** ("a bid replaced by a clashing input") ‖ a leave or a medical filed on the Inputs page by someone else replaces his pending bid ‖ the Inputs door's own line, naming the bid: ***LL*** *Tue 10 Feb · You were added · replaces your LL bid · Saber* — one line, never a second from the war; his own filing over his own bid tells him nothing (the spec's reading 5) ‖ the input ‖ D1142; the M4 spec §2 9.3a | 9 |
| GR021 | 69 | Ruled, not built yet | — | — ‖ none since 27 Oct 26: the Leave War's ruled lines (R1, P2, P4, P7, P8, P9) were built with its M4 and moved up whole ‖ — ‖ — ‖ — | 9 |
| GR022 | 70 | Ruled, not built yet | — | The borrowing squadron's schedulers ‖ A borrowed man made unavailable at home (leave, medical), posted out, archived, deleted or taken back while they plan him; two people overwriting one shared thing (the overwritten told) ‖ To be drawn, with the squadron mark (D2202) ‖ — ‖ D2206, 18 Nov 26 | 9 |
| GR023 | 71 | Ruled, not built yet | — | Everyone ‖ Always ‖ Each person chooses which kinds of line reach his bell; a few that need him to act stay always on (an access request waiting for an admin among them) — which ones, put to him with the drawing; built after the multi-squadron batches, drawn first ‖ — ‖ D2200, 18 Nov 26 | 9 |
| GR024 | 77 | Proposed — the agent's, his to strike | P1 | a member ‖ the day before a leave of his starts that has no document attached (a leave filed on the Inputs page asks for it, never a stop — D1150) ‖ ***Your leave*** *Mon 19 Jan · LL · no form attached yet* ‖ the leave, its Document row ‖ his own words, D1150 | 9 |
| GR025 | 78 | Proposed — the agent's, his to strike | P3 | a member with a waiting request ‖ a lock is laid over its days (D1156), so he can no longer change it ‖ ***Your leave*** *Tue 10 Feb · LL waiting · locked: Exercise week* ‖ the day panel ‖ the full mock-up (picture 9 — Drifter's OIL on a locked day) | 9 |
| GR026 | 79 | Proposed — the agent's, his to strike | P5 | ~~the admins~~ ‖ ~~a new request waits for approval~~ — **struck 22 Oct 26 (D1208; no option to turn it on — D1219):** he does not want the admin flooded with notifications of new requests, during bidding or after; what waits shows on the Approvals count when he opens the Leave War ‖ — ‖ — ‖ the full mock-up (picture 10) | 9 |
| GR027 | 80 | Proposed — the agent's, his to strike | P6 | ~~a member~~ ‖ ~~a leave of his filed on the Inputs page is decided in Approvals (if Q6 is answered yes)~~ — **struck 21 Oct 26 (D1166):** Inputs-page leave is never decided in Approvals; it lands approved ‖ — ‖ — ‖ the full mock-up (Q6) | 9 |
| GR028 | 81 | Proposed — the agent's, his to strike | P10 | a member — **proposed 27 Oct 26 (the M4 spec's reading 9), built with M4, his to strike** ‖ an admin moves or deletes his PENDING bid (not in D1142's list, which names a decided bid and approved leave — the spec's fresh read, finding 11) ‖ ***Your leave*** *Tue 27 Jan · LL bid moved to Thu 29 Jan · Saber* / *… LL bid deleted · Saber* ‖ the grid, at that day ‖ the M4 spec §2 9.7 | 9 |
| GR029 | 82 | Proposed — the agent's, his to strike | P12 | a member — **ruled 28 Oct 26 (D1460)**, built with M4 the same day ‖ someone else changes the kind of his pending leave bid on the Leave War (reading R15 struck) ‖ ***Your leave*** *Tue 10 Feb · LL bid changed to OL · Saber* (the agent's words, worded as the bell's other bid lines, his to change) ‖ the grid at that day ‖ his question of 28 Oct 26 | 9 |
| GR030 | 83 | Proposed — the agent's, his to strike | P13 | a member — **proposed 28 Oct 26 (the M5a build spec's reading 8, D1492), NOT BUILT in M5a, his to strike** ‖ an admin changes his typed leave balance (App bal or its carried-forward part, on the Balances page or in his person window); his own typing never tells him, and the change is already a line in the change history (D1479's `lw.balance`) ‖ ***Your leave balance*** *LVE balance 18 → 20 · Saber* (the agent's words, in the history line's form, worded as the bell's other lines, his to change) ‖ his person window … | 9 |
| GR031 | 84 | Proposed — the agent's, his to strike | P15 | every admin who can sign in, of both squadrons — never the man himself ‖ a man's posting out to another squadron within the app runs on its date (the future "Transfer to Sqn" outcome — D281, D1100) ‖ ***Ranger*** *Mon 16 Nov · Posted out · now with 149* (D58: the bare number, never "Sqn"; corrected by chat 102, owed since chat 98) — the posting line's own form (B12) ‖ his row on Admin → Users of the squadron that has him now; taken back, both squadrons' admins are told (D2215) ‖ his look at the Post out sheet, 5 N… | 9 |

## List 3a — drawings dated 4 Nov 26 on (G-D)

Drawings of screens already built and since changed are out of scope (plan §1); this list is every dated drawing, the slice helper marks which are built. "Cited by" = rulings whose full row names the drawing.

| Id | Drawing | Date | Title | Cited by | Slice (guess) |
|---|---|---|---|---|---|
| GD001 | raptor-port/docs/mock/2026-11-04-topbar-names/ | 2026-11-04 | TALON Top Bar Names | D1643 | 10 |
| GD002 | raptor-port/docs/mock/2026-11-05-access-wait/ | 2026-11-05 |  | D1656, D1654 | 4 |
| GD003 | raptor-port/docs/mock/2026-11-05-backlog-sizing/ | 2026-11-05 | Raptor — the backlog, sized |  | 4 |
| GD004 | raptor-port/docs/mock/2026-11-05-cr4-d1708/ | 2026-11-05 | Inputs row — your answer A, drawn |  | 5 |
| GD005 | raptor-port/docs/mock/2026-11-05-font-inherit/ | 2026-11-05 | Box Letters Fix |  | 4 |
| GD006 | raptor-port/docs/mock/2026-11-05-keys-windows/ | 2026-11-05 | Keyboard and windows | D1652, D1646, D1645, D1648, D1647 | 4 |
| GD007 | raptor-port/docs/mock/2026-11-05-member-guest-build/ | 2026-11-05 |  | D1664 | 3 |
| GD008 | raptor-port/docs/mock/2026-11-05-member-guest/ | 2026-11-05 |  | D1664, D1649, D1651 | 3 |
| GD009 | raptor-port/docs/mock/2026-11-05-notsaved-refusal/ | 2026-11-05 | "Not saved" refusals: one look of their own | D1668 | 3 |
| GD010 | raptor-port/docs/mock/2026-11-05-postout-bell/ | 2026-11-05 | Posting Out Bell | D1690 | 9 |
| GD011 | raptor-port/docs/mock/2026-11-05-save-band/ | 2026-11-05 |  | D1655 | 4 |
| GD012 | raptor-port/docs/mock/2026-11-05-taken-back-sans/ | 2026-11-05 | Posting Taken Back and the SANS Line | D1697, D1699 | 5 |
| GD013 | raptor-port/docs/mock/2026-11-06-lw-cell-combos/ | 2026-11-06 | Leave War — two or more entries on one day |  | 4 |
| GD014 | raptor-port/docs/mock/2026-11-08-chat20-tracker-questions.html | 2026-11-08 | Two Tracker Questions |  | 4 |
| GD015 | raptor-port/docs/mock/2026-11-08-lw-pin-last-frame/ | 2026-11-08 | Pinned Dates Row Blink |  | 4 |
| GD016 | raptor-port/docs/mock/2026-11-08-not-kept-band/ | 2026-11-08 |  |  | 4 |
| GD017 | raptor-port/docs/mock/2026-11-12-approvals-scroll/ | 2026-11-12 |  |  | 4 |
| GD018 | raptor-port/docs/mock/2026-11-15-warn-words/ | 2026-11-15 | Warning Words |  | 4 |
| GD019 | raptor-port/docs/mock/2026-11-16-legend-tab-strip/ | 2026-11-16 |  | D2082 | 10 |
| GD020 | raptor-port/docs/mock/2026-11-16-legend-words/ | 2026-11-16 |  | D2081, D2078 | 10 |
| GD021 | raptor-port/docs/mock/2026-11-16-multi-sqn-r1/ | 2026-11-16 |  |  | 3 |
| GD022 | raptor-port/docs/mock/2026-11-16-multi-sqn-r2/ | 2026-11-16 | Two Squadrons · Round 2 |  | 3 |
| GD023 | raptor-port/docs/mock/2026-11-17-caps-r1/ | 2026-11-17 | CAPS and Ops Limits · Round 1 |  | 4 |
| GD024 | raptor-port/docs/mock/2026-11-17-held-fixes/ | 2026-11-17 | Held Schedule Fixes |  | 4 |
| GD025 | raptor-port/docs/mock/2026-11-17-lw-balances-align/ | 2026-11-17 | Balances and Hover Ring | D2156 | 4 |
| GD026 | raptor-port/docs/mock/2026-11-17-lw-grid-hover/ | 2026-11-17 | Leave War Grid Highlight | D2157 | 4 |
| GD027 | raptor-port/docs/mock/2026-11-17-lw-oil-editor/ | 2026-11-17 | OIL Award Editor |  | 1 |
| GD028 | raptor-port/docs/mock/2026-11-17-multi-sqn-b1/ | 2026-11-17 | Squadrons, batch 1 | D2190 | 3 |
| GD029 | raptor-port/docs/mock/2026-11-17-multi-sqn-fable/ | 2026-11-17 | Two Squadrons · Fable's Read |  | 3 |
| GD030 | raptor-port/docs/mock/2026-11-17-multi-sqn-r3/ | 2026-11-17 | Two Squadrons · Round 3 |  | 3 |
| GD031 | raptor-port/docs/mock/2026-11-17-multi-sqn-r4/ | 2026-11-17 | Two Squadrons · Round 4 |  | 3 |
| GD032 | raptor-port/docs/mock/2026-11-17-multi-sqn-r5/ | 2026-11-17 | Two Squadrons · Round 5 |  | 3 |
| GD033 | raptor-port/docs/mock/2026-11-17-multi-sqn-r6/ | 2026-11-17 | Two Squadrons · Round 6 |  | 3 |
| GD034 | raptor-port/docs/mock/2026-11-17-multi-sqn-r7/ | 2026-11-17 | Two squadrons: round 7 | D2185, D2164, D2149 | 3 |
| GD035 | raptor-port/docs/mock/2026-11-17-trk-small/ | 2026-11-17 | Tracker Small Fixes |  | 4 |
| GD036 | raptor-port/docs/mock/2026-11-19-multi-sqn-pieces/ | 2026-11-19 | Two Squadrons · New Pieces | D2225, D2218, D2217, D2211, D2219, D2213 | 3 |
| GD037 | raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/ | 2026-11-20 | Two Squadrons · Fix Plan Questions | D2243, D2241, D2240 | 2,3 |
| GD038 | raptor-port/docs/mock/2026-11-21-msq-r1-r7/ | 2026-11-21 | Refusal Words Questions |  | 3 |
| GD039 | raptor-port/docs/mock/2026-11-21-msq-r8-r12/ | 2026-11-21 | Plan Holder Questions |  | 2,3 |
| GD040 | raptor-port/docs/mock/2026-11-22-msq-morning-questions/ | 2026-11-22 | Two Squadrons · Open Questions | D2263, D2262, D2265, D2261 | 3 |
| GD041 | raptor-port/docs/mock/2026-11-22-oil-unanswered-publish/ | 2026-11-22 | Unanswered OIL at Sign-off | D2299, D2297, D2312 | 1,2 |
| GD042 | raptor-port/docs/mock/2026-11-22-sans-readings/ | 2026-11-22 | SANS readings 2 to 4 | D2327 | 5 |
| GD043 | raptor-port/docs/mock/2026-11-22-sched-right-edge/ | 2026-11-22 | Edit Schedule right edge | D2293 | 4 |
| GD044 | raptor-port/docs/mock/2026-11-23-sans-before-shading/ | 2026-11-23 | SANS Days Before His Date | D2346 | 5,4 |
| GD045 | raptor-port/docs/mock/2026-11-24-sans-words/ | 2026-11-24 | SANS Wordings | D2421 | 5 |

## List 3b — ruled, not built (G-N)

Lines of the area pages (`.claude/rules/decisions/*.md`) under a "Not built" heading or saying "not built". "Drawing / spec" = a mock-up or superpowers path named in the line or in the full row of a ruling it cites. The register's own not-built rows are in list 2b.

| Id | Page | Line | Why listed | The line | Rulings cited | Drawing / spec named | Slice |
|---|---|---|---|---|---|---|---|
| GN001 | .claude/rules/decisions/design.md | 91 | says not built | - The claw's round (three claws drawn, held, faded, drawn again from nothing, a dark moment between; the overlapping round not built) and the start-up claw's plain 0.2 s fade where it stands, both logos briefly on screen, the glide onto the logo not built [D1617, D1618]. | D1617, D1618 |  | 4 |
| GN002 | .claude/rules/decisions/how-we-work.md | 112 | says not built | - The app's speed is a job of its own, in this order: a hidden timing readout to measure the real slow computer; then the week drawing the days in view first, with both schedule pages kept ready; then no file re-checks on repeat visits; the sign-in card shown early is not built, the app having no sign-in once in Power Apps (the agent's reading); the other ideas wait, filed — [APP-SPEED] [D2480]. | D2480 |  | 3,4 |
| GN003 | .claude/rules/decisions/inputs.md | 79 | under a "Not built" heading | - A date clicked on the Inputs or SANS calendar while a new input's window is open never looks picked while doing nothing: the click changes something the person can see, or nothing lights; what it does is his choice first (`[INP-CAL-CLICK-BEHIND-NEW]`) [D1298]. | D1298 |  | 5 |
| GN004 | .claude/rules/decisions/inputs.md | 82 | says not built | - The Inputs list's cards keep their top line's right-hand marks as today — LATE, the document and the hours, each just before what follows it; the three-column layout once drawn is not built [D1721]. | D1721 |  | 5,4 |
| GN005 | .claude/rules/decisions/inputs.md | 157 | says not built | - A run of SANS availability days that starts before his SANS date saves from that date on, the earlier days left out with a short note saying why — drawn for him first; a run with no SANS day of his is still refused; not built [D2388, D2340]. | D2388, D2340 |  | 3,5,4 |
| GN006 | .claude/rules/decisions/inputs.md | 158 | says not built | - The SANS calendar's words, settled: "Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul."; on his own days before his SANS date the greyed "+ Commitment" says "You're SANS from Fri 17 Jul." (no admin version: an admin's is never grey); a shared offer's refusal says "Take him out of this offer to add earlier days."; not built [D2394, D2420, D2421, D2560, D2564]. | D2394, D2420, D2421, D2560, D2564 | mock/2026-11-24-sans-words/; superpowers/briefs/2026-11-23-sans-questions-fable.md | 3,5,4 |
| GN007 | .claude/rules/decisions/leave-war.md | 111 | under a "Not built" heading | - An entry saved for a person id that names nobody waits for the database step, where every entry must point at a real person record; no guard before then [D2315]. | D2315 |  | 4 |
| GN008 | .claude/rules/decisions/leave-war.md | 112 | under a "Not built" heading | - In the "New leave war" window the Name fills itself from the dates picked, in the periods' own form ("JAN - MAR 27", one month "JAN 27", "DEC 26 - FEB 27" across a year's end), and follows the dates whenever they change; a name typed by hand is kept, an emptied box follows again (the agent's readings); built on pull request 801 — [LW-WAR-AUTONAME] [D2158]. | D2158 |  | 4 |
| GN009 | .claude/rules/decisions/leave-war.md | 113 | under a "Not built" heading | - The app was looked over for every place where a tap makes the control just tapped, or the one to tap next, move, each place shown to him with its picture before it changes; only the war's below-zero line ("Tap the same leave again to go ahead") is fixed, the line now just above the leave buttons — every other place stays as it is, its design fine, the Delete question of the several-people window among them — [LW-BELOW-ZERO-JUMP] [D2030, D2031, D2037]. | D2030, D2031, D2037 |  | 4 |
| GN010 | .claude/rules/decisions/leave-war.md | 114 | under a "Not built" heading | - The below-zero line stands just above the leave buttons, not under them, in the several-people window and the one-day window, so the leave tapped stays under the finger (live 14 Nov 26, pull request 764), the one place of the look-over fixed [D2031, D2030, D2037]. | D2031, D2030, D2037 |  | 4 |
| GN011 | .claude/rules/decisions/leave-war.md | 115 | says not built | - Full editing of every entry on the war is not built — an overseas duty, a course, an Attach, an Other, a medical and leave filed on the Inputs page moved, deleted and their days and remarks changed there, a day of two or more entries opening the window that adds more, each entry with its own Move and Delete, drawn first, the Inputs page's own rules holding (its full row adds them); until it is, the war's windows say where each entry is changed — [LW-FUL… | D1724 | superpowers/plans/2026-11-06-lw-full-editing.md | 5,4 |
| GN012 | .claude/rules/decisions/leave-war.md | 116 | says not built | - On a PC the Approvals page is to scroll as the Balances page does — the page filling the screen, only its list scrolling under a title, chips, Approve all and headings that stay; on a phone it stays as today, the whole page scrolling, so more requests are seen at once; drawn 12 Nov 26, not built — [APPROVALS-SCROLL-INSIDE] [D1986, D2006]. | D1986, D2006 |  | 4 |
| GN013 | .claude/rules/decisions/leave-war.md | 117 | under a "Not built" heading | - On a PC a short list's card on the Approvals page still reaches the foot of the screen, empty below the last request, as Balances does — [APPROVALS-SCROLL-INSIDE] [D2008]. | D2008 |  | 4 |
| GN014 | .claude/rules/decisions/leave-war.md | 118 | under a "Not built" heading | - On a phone the Balances page stays as it is: its list scrolls inside the page under headings and names that hold, and its pinch shrinks only the rows, never the top part — leave it [D2007]. | D2007 |  | 4 |
| GN015 | .claude/rules/decisions/leave-war.md | 119 | under a "Not built" heading | - Each man's flight label is kept, not dropped, because he intends an option to sort the Leave War by flight; until that option is designed nothing about the label changes on screen [D1001]. | D1001 | superpowers/briefs/2026-10-18-sixteen-questions.md | 2 |
| GN016 | .claude/rules/decisions/leave-war.md | 318 | says not built | - People and accounts' — the war follows the signed-in callsign, never "View as"; a posting out's four outcomes on its sheet, a man posted out as SANS moving into the SANS group only while SANS is on the war, a man back from overseas returning as he was, the transfer not built, made only by this sheet on its date; a post-in date asked, Archive as "posted out from today", every stint he has kept: D166, D229, D280, D281, D2087, D283, D284, D308, D320, D323,… | D166, D229, D280, D281, D2087, D283, D284, D308 | mock/new-person-account.html; mock/one-door.html; mock/post-out.html; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-09-27-one-door-plan.md | 2,3,5,4 |
| GN017 | .claude/rules/decisions/oil.md | 63 | says not built | - A swap waits: its buttons "Don't swap" and "Swap", Swap greyed until Yes or No is picked; unanswered, both pucks flash and a bar stays until tapped — "Not swapped — OIL not answered · Answer OIL · OK", one line in the band under the top bar; "Answer OIL" reopens the question, "OK" only closes the bar. Every waiting door keeps that bar, naming what was not done ("Not added", "Not filed", "Not un-cancelled"); nobody else is told of a swap or add not made … | D783, D831, D840 | mock/oil-notify.html; mock/2026-10-12-oil-notify/; mock/oil-band-14oct.html | 1,10 |
| GN018 | .claude/rules/decisions/people-accounts.md | 142 | under a "Not built" heading | - One app for every squadron and aircraft type (F-15, F-16, F-35), each squadron configuring it inside the app, an aircraft-type setting carrying its rules [D1100, D1101]. | D1100, D1101 |  | 3 |
| GN019 | .claude/rules/decisions/people-accounts.md | 143 | under a "Not built" heading | - Detachments and squadrons sharing people come at the end, after the F-15 app's faults are fixed; work before then avoids what would have to be redone [D1100, D1101]. | D1100, D1101 |  | 3 |
| GN020 | .claude/rules/decisions/people-accounts.md | 144 | under a "Not built" heading | - Deployed separately for each aircraft type, each with its own database; the squadrons of one type, detachments included, share that type's database [D1101, D1100]. | D1101, D1100 |  | 3 |
| GN021 | .claude/rules/decisions/people-accounts.md | 145 | under a "Not built" heading | - Not settled: his 5 Nov 26 direction (below) names one database for many squadrons, not aircraft types, so by its words does not end the split by type; IT's 8 Nov 26 answer (one production environment for code apps, so no database per type today) was put to him, recommended: no change now, settled when a second type joins; `[AIRCRAFT-TYPE-SETTING]`, `[MULTI-SQN-DESIGN]` (the agent's reading) [D1101, D1695]. | D1101, D1695 |  | 3,4 |
| GN022 | .claude/rules/decisions/people-accounts.md | 146 | under a "Not built" heading | - His direction: one app, one database for many squadrons — a master admin makes each in Admin, its admins its detachments; a person's one primary squadron is set with his account, "Request access" asking it, telling its admins; an admin may give him others to view only, never at sign-up, filing inputs and leave only in his primary; a day planned half in each of two squadrons [D1695, D2087, D2093, D2094, D2160, D2165, D2184, D2195]. | D1695, D2087, D2093, D2094, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,5,4 |
| GN023 | .claude/rules/decisions/people-accounts.md | 147 | under a "Not built" heading | - A master admin makes squadrons, names each new one's first admin and acts as an admin of every squadron; only a master admin makes another; Admin → Users lists the admin's own squadron, a man of the other found by search to be given View, nothing else of his row changeable; View shows the other's schedule pages and Logic read only, never its bell [D2191, D2093, D2094, D2160, D2165, D2184, D2195, D2198, D2199, D2250, D2201]. | D2191, D2093, D2094, D2160, D2165, D2184, D2195, D2198 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,9,10,4 |
| GN024 | .claude/rules/decisions/people-accounts.md | 148 | under a "Not built" heading | - A squadron's admins make admins of their own squadron only, never of another; another squadron is View only, unless a master admin gives him Plan (below) [D2192, D2191, D2198, D2199, D2250, D2201]. | D2192, D2191, D2198, D2199, D2250, D2201 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3 |
| GN025 | .claude/rules/decisions/people-accounts.md | 149 | under a "Not built" heading | - View never reaches another squadron's Inputs, Quals, Leave War or Tracker, even read only — a master admin and a Plan holder work there as its admins: on those pages a member sees mostly his own, and the war's leave and balances are its people's [D2252, D2132, D2197, D2201, D2191, D2198, D2199, D2250]. | D2252, D2132, D2197, D2201, D2191, D2198, D2199, D2250 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,5 |
| GN026 | .claude/rules/decisions/people-accounts.md | 150 | under a "Not built" heading | - In the member view a Plan holder or master admin is a member of his own squadron with View of what he could edit: on that schedule he stays, read only; his own pages are his own squadron's [D2253, D292, D2252]. | D2253, D292, D2252 |  | 2,3,4 |
| GN027 | .claude/rules/decisions/people-accounts.md | 151 | under a "Not built" heading | - A master admin edits every page of every squadron: a squadron picked in the "Schedules" menu moves every page to it, Admin → Users too; his own inputs and leave stay filed in his primary [D2197, D2132, D2191, D2198, D1695, D2199, D2250, D2201]. | D2197, D2132, D2191, D2198, D1695, D2199, D2250, D2201 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,5,4 |
| GN028 | .claude/rules/decisions/people-accounts.md | 152 | under a "Not built" heading | - A master admin's bell carries his primary squadron's lines by default, every other squadron's off, his to switch on (the agent's reading) [D2198, D2191, D227, D2199, D2250, D2201]. | D2198, D2191, D227, D2199, D2250, D2201 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md; superpowers/plans/2026-09-26-accounts-new-person-plan.md | 3,9 |
| GN029 | .claude/rules/decisions/people-accounts.md | 153 | under a "Not built" heading | - Each person chooses which notifications reach his bell, a few that need him to act always on; built after the multi-squadron batches, drawn first [D2200, D2198]. | D2200, D2198 |  | 3,9 |
| GN030 | .claude/rules/decisions/people-accounts.md | 154 | under a "Not built" heading | - A master admin may give a named admin "Plan" of another squadron — on his row in Admin → Users, off by default, a master admin's alone to give, ended by his move or by his own squadron's admin making him a member: full access to it, as its own admins have, the row's line saying so in plain words, not by that comparison [D2211, D2199, D2250, D2201, D2192, D2191, D2198, D785]. | D2211, D2199, D2250, D2201, D2192, D2191, D2198, D785 | mock/2026-11-19-multi-sqn-pieces/page.html; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3 |
| GN031 | .claude/rules/decisions/people-accounts.md | 155 | under a "Not built" heading | - While he holds Plan his bell carries that squadron's admin lines, on by default, his to switch off; a line from a squadron other than his primary shows which [D2202, D2198]. | D2202, D2198 |  | 2,3,9 |
| GN032 | .claude/rules/decisions/people-accounts.md | 156 | under a "Not built" heading | - A person who moves to another squadron loses every View and Plan he held of others [D2203, D2087]. | D2203, D2087 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 2,3 |
| GN033 | .claude/rules/decisions/people-accounts.md | 157 | under a "Not built" heading | - Only a master admin changes a master's account; a sign-in waits for the last person's pending save, drawn first [D2205]. | D2205 |  | 3 |
| GN034 | .claude/rules/decisions/people-accounts.md | 158 | under a "Not built" heading | - The transfer: only the Leave War's Post out moves his primary squadron, on its date. Neighbouring squadrons plan each other's people as a matter of course, not only during a posting [D281, D2087, D282, D1100, D1101]. | D281, D2087, D282, D1100, D1101 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 2,3 |
| GN035 | .claude/rules/decisions/people-accounts.md | 159 | under a "Not built" heading | - A community is the squadrons flying one aircraft type (F-15, F-16): callsigns unique within a community, not across the app; a guest flyer from another community is always marked — an orange corner on his puck (option A) [D288, D289, D296]. | D288, D289, D296 | mock/post-out.html | 3 |
| GN036 | .claude/rules/decisions/people-accounts.md | 161 | under a "Not built" heading | - A dedicated check of all built and planned so far for an admin with Plan left out or let in wrongly, its faults fixed before the reshape build [D2242]. | D2242 |  | 2,3 |
| GN037 | .claude/rules/decisions/people-accounts.md | 162 | under a "Not built" heading | - At a move, built at the Transfer step, new words drawn first: held schedule windows say his sentence naming the page; a course, medical or Delete across it its own sentence; 149's war starts him empty and 142's keeps counting his hidden leave until his leave is carried; the mover may take it back before its day; a meeting naming him stays where filed; a group OIL credit gives the lawful ones, naming who was left; Balances gets the band [D2265]. | D2265 | mock/2026-11-22-msq-morning-questions/page.html | 1,3,4 |
| GN038 | .claude/rules/decisions/people-accounts.md | 163 | under a "Not built" heading | - On a man's move: an ALL AVAIL meeting stays where filed, as does one naming him [D2265]; sign-off boxes offer the day's people, and after them, in SKED CK, PLANNED BY and APPROVED BY, a Plan holder of the squadron and a master admin who carry the Scheduler tick [D2245]; no one puts his leave in his old war after it; his View and Plan end at his move day's start; his old war's row striped from then, the new one's before; an open window gets the drawn ban… | D2265, D2245, D2243 | mock/2026-11-22-msq-morning-questions/page.html; mock/2026-11-20-multi-sqn-reshape/; superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md | 2,3,5,4 |
| GN039 | .claude/rules/decisions/scheduler.md | 92 | says not built | - Cross-week dragging is not built and the work is not filed: on Edit Schedule a carried man stops at Monday and Sunday and is never carried into another week [D1573, D1529]. | D1573, D1529 |  | 4 |
| GN040 | .claude/rules/decisions/scheduler.md | 103 | says not built | - When his SANS posting or tick changes, his bell says plainly what changed and what it means — "Your SANS date moved to Sat 18 Jul. · Saber" then why his filed days are hidden — and the reminder he read simply goes, with no take-back line; not built [D2391, D1699, D2423, D2437]. | D2391, D1699, D2423, D2437 | mock/2026-11-05-taken-back-sans/; superpowers/briefs/2026-11-23-sans-questions-fable.md | 5,9,4 |
| GN041 | .claude/rules/decisions/scheduler.md | 104 | says not built | - The SANS reminder, once read, lights his bell again only for a day not in it when he read it — a day he saw, taken off and put back, does not — and reaches every SANS man planned with nothing filed ("Your SANS availability is needed." where no date is ahead); a "hidden" sentence goes once untrue; the demo-week gap left; not built [D2394, D2420, D2421, D2560, D2564]. | D2394, D2420, D2421, D2560, D2564 | mock/2026-11-24-sans-words/; superpowers/briefs/2026-11-23-sans-questions-fable.md | 5,9,4 |
| GN042 | .claude/rules/decisions/scheduler.md | 105 | says not built | - The SANS reminder counts a day only where he is in a flying seat or a sim with nothing filed — never a ground row, a duty desk or all hands; a day whose filing he deleted himself lights it as D2560 gives; a scheduler putting him on anything else tells him by a line of its own as soon as planned, drawn first; not built [D2564, D2565, D2566, D2390, D2394, D2420, D2421]. | D2560, D2564, D2565, D2566, D2390, D2394, D2420, D2421 | mock/2026-11-24-sans-words/; superpowers/briefs/2026-11-23-sans-questions-fable.md | 5,4 |
| GN043 | .claude/rules/decisions/scheduler.md | 123 | says not built | - A clash line between a flight and another item shows the end of the flight that causes the clash — its step time where the item falls in the step before take-off, its dekit time where it falls after landing ("Conflict: RU (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00") — both worked from the Logic page's step and dekit settings; not built — [WARN-WORDS-STANDALONE] [D2058]. | D2058 | superpowers/specs/2026-11-15-warn-words-standalone.md | 10,4 |
| GN044 | .claude/rules/decisions/scheduler.md | 131 | says not built | - In the rewording "Tight turning" keeps its name, never "Tight crew rest", and the crew-rest warning keeps his 22 Aug 26 order of facts with what the rest needs added ("needs 12h", from the Logic setting); not built — [WARN-WORDS-STANDALONE] [D2068, D2069]. | D2068, D2069 | superpowers/specs/2026-11-15-warn-words-standalone.md | 10,4 |
| GN045 | .claude/rules/decisions/scheduler.md | 133 | says not built | - A flight with no landing typed is assumed to land a set flight length after take-off — a Logic setting, starting at 60 minutes — and every check that reads the landing uses it, the warning saying "assumed it landed 13:00 (take-off + 1h)"; not built — [WARN-WORDS-STANDALONE] [D2046, D2047]. | D2046, D2047 |  | 10,4 |
| GN046 | .claude/rules/decisions/scheduler.md | 134 | says not built | - A flight with its take-off typed and no landing counts in Insights' hours and the long-day note up to its assumed landing, no longer nothing; not built — [WARN-WORDS-STANDALONE] [D1936, D2053]. | D1936, D2053 | superpowers/briefs/2026-11-08-review-8nov-jobs-fable.md | 10,4 |
| GN047 | .claude/rules/decisions/scheduler.md | 158 | says not built | - Where a Logic change makes a published day pending through its OIL, the pending list says what moved and whether the OIL changed — "RU crew: start 10:00 → 10:30, still a full day of OIL"; not built — [WARN-WORDS-STANDALONE] [D2054]. | D2054 |  | 1,2,10,4 |
| GN048 | .claude/rules/decisions/scheduler.md | 175 | under a "Not built" heading | - An admin is to set ahead the date a man joins the active pool — back from overseas, or SANS becoming active — every part of the app treating him as active from it by itself, so he can be planned on those days early; one dated status record a man, one sheet, its main door Admin → Users, the war's posting sheet and the Quals SANS tick opening it; first SANS → active, back from overseas, posting out; before the date the schedule marks him "Active from 20 J… | D2344, D2345 |  | 3,5,4 |
| GN049 | .claude/rules/decisions/scheduler.md | 176 | says not built | - When an ALL AVAIL or ALL crowd changes on a published day the change is highlighted in the amendment's colour, hollow while waiting, solid once out: every change tags the puck; a man who joined wears the tag in the window, one who left stays there crossed out until it goes out; not built — [ALL-AVAIL-WINDOW-FLAGS] [D2333, D2429, D2430]. | D2333, D2429, D2430 |  | 2,5,4 |
| GN050 | .claude/rules/decisions/scheduler.md | 177 | under a "Not built" heading | - A man borrowed by another squadron for a day stays in his own squadron's ALL AVAIL crowd, unless taken out by hand or busy at that time with an event in the other squadron or his own; the borrowing squadron's ALL AVAIL counts him too on a day it has planned him — only between squadrons at the same place and of the same aircraft type (type segregation a later build); design only, built with borrowing — [MULTI-SQN-DESIGN] [D2332]. | D2332 |  | 3,5,4 |
| GN051 | .claude/rules/decisions/scheduler.md | 178 | says not built | - A scheduler can take a person out of an ALL AVAIL crowd by hand, as a puck comes off a seat — dragged onto empty space or right-clicked, no ✕ — out of that one item only, its count and its OIL both, staying crossed out in the window; on a published day pending, "Reaper → taken out"; put back by the same gesture or Undo; ALL the same; redrawn first, not built — [ALL-AVAIL-REMOVE-BY-HAND] [D2330, D2431, D2432, D2433, D2434, D2435, D2436]. | D2330, D2431, D2432, D2433, D2434, D2435, D2436 |  | 1,2,5,4 |
| GN052 | .claude/rules/decisions/scheduler.md | 179 | under a "Not built" heading | - The squadrons and detachments below are built now, in batches, before the database step, each batch's agreed design shown to him again with its mock-up before it starts; a line saying "design only" is built in its batch [D2187, D2188]; the batches' order is the agent's to choose, the best sequence to build, his answer the order below [D2189, D2190]. | D2187, D2188, D2189, D2190 | mock/2026-11-17-multi-sqn-b1/img/; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN053 | .claude/rules/decisions/scheduler.md | 180 | under a "Not built" heading | - The build's order: the squadrons foundation, detachments, borrowing and shared waves, Transfer to Sqn and Post out from Admin → Users, then the whole-app check; the demo's 149 at Home base with 142; batch 1's new pieces built as drawn — "+ New squadron", the "Home squadron" line and choice, each squadron's own Off days [D2190, D2189]. | D2190, D2189 | mock/2026-11-17-multi-sqn-b1/img/; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN054 | .claude/rules/decisions/scheduler.md | 181 | under a "Not built" heading | - A detachment is a temporary unit under a name of its own (149's could be "249"), with its own manpower and schedule; an option moves people between the two; no conflicts are flagged across a squadron and its detachment, and no man is planned in two locations — design only, [MULTI-SQN-DESIGN] [D2088, D2092]. When it is over an admin closes it, its old programme still to be seen — one step since D2103, its people home from the next day [D2095, D2103, D216… | D2088, D2092, D2103, D2095, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN055 | .claude/rules/decisions/scheduler.md | 182 | under a "Not built" heading | - Every squadron and detachment has a place, and a man is at one place on any day: units at the same place may share people and are checked against each other; units at different places never are, and the app refuses to plan a man at a place he is not at, and warns when a later change leaves one there — design only [D2092, D2160, D2165, D2184, D2195]. | D2092, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN056 | .claude/rules/decisions/scheduler.md | 183 | under a "Not built" heading | - Borrowing: a scheduler picks the other squadron's man — its SANS people included [D2145] — freely, with no request, where both squadrons are at the same place; every pick shows at once on his home squadron's schedule — one row a stretch of time, named by what he is on, "ACADEMICS · 149" over a small "ATTACH", made by itself, the event itself not shown there [D2149] — and rings its schedulers' bell; the home squadron is never asked first; a formation of … | D2145, D2149, D2091, D2098 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,5,9,4 |
| GN057 | .claude/rules/decisions/scheduler.md | 184 | under a "Not built" heading | - The Attach input stays as today, filed by hand for a man attached elsewhere, such as staff work — still in his squadron, not available; beside it the row made by itself from the other squadron's plan stays, worked out and never an input, and never counts him out on the Leave War as the hand-filed one does — design only [D2144, D2098, D2149, D2160, D2165, D2184, D2195]. | D2144, D2098, D2149, D2160, D2165, D2184, D2195 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,5,4 |
| GN058 | .claude/rules/decisions/scheduler.md | 185 | under a "Not built" heading | - Each squadron's own SANS people may be borrowed by the other squadron to fly, as any of its men are, his home schedule showing his automatic row, "ATTACH" under it — design only [D2145, D2091, D2098, D2149]. | D2145, D2091, D2098, D2149 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,5,4 |
| GN059 | .claude/rules/decisions/scheduler.md | 186 | under a "Not built" heading | - No bell line about one squadron's own business reaches the other's people; one crosses only where the matter concerns both — a borrowed man, a move between them, a detachment, a shared place — each squadron told only of its own people and days; the rule for every future feature [D2194, D2195]. Ruled to cross: a borrowed man unavailable at home (any input, D2219), posted out, archived, deleted or taken back while the other plans him; two people overwriti… | D2194, D2195, D2219, D2206 | mock/2026-11-19-multi-sqn-pieces/page.html; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 1,2,3,5,9,4 |
| GN060 | .claude/rules/decisions/scheduler.md | 187 | under a "Not built" heading | - The cross-squadron bell lines name "149's RU formation", never "your RU", say what to do ("Replace him.", "Fill his place."), and never call a person "taken back"; a posted-out borrowed man is taken off by the app [D2213]. | D2213 | mock/2026-11-19-multi-sqn-pieces/page.html | 3,9,4 |
| GN061 | .claude/rules/decisions/scheduler.md | 188 | under a "Not built" heading | - For a borrowed man, any home input that takes him away tells the borrowing schedulers; he is told when either squadron plans, moves or takes him off; his home schedulers when the other publishes [D2219, D2206, D2213]. | D2219, D2206, D2213 | mock/2026-11-19-multi-sqn-pieces/page.html | 2,3,5,4 |
| GN062 | .claude/rules/decisions/scheduler.md | 189 | under a "Not built" heading | - Crossing too: a transfer read "Posted in · from 142" by the receiving side, told it could not run; Plan given or removed; a shared wave removed; a detachment closed early; a shared place's time zone or a squadron leaving it — each squadron told of its own [D2220, D2194, D2195]. | D2220, D2194, D2195 | superpowers/briefs/2026-11-19-multi-sqn-bells-fable.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN063 | .claude/rules/decisions/scheduler.md | 190 | under a "Not built" heading | - Each squadron owns its own public-holiday list, never shared, even at one place; a holiday it adds never touches another squadron's days, OIL or bell — its form names only its own published days; a detachment has a list of its own, which may start as a copy of its squadron's, then be edited [D2195, D2160, D2184, D2165, D2204]. | D2195, D2160, D2184, D2165, D2204 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 1,2,3,9,4 |
| GN064 | .claude/rules/decisions/scheduler.md | 191 | under a "Not built" heading | - Only a master admin sets the time zone of a place more than one squadron sits on; a place one squadron alone sits on stays its own admins' to set (the agent's reading) [D2196, D2119, D2160, D2165, D2184, D2195]. | D2196, D2119, D2160, D2165, D2184, D2195 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN065 | .claude/rules/decisions/scheduler.md | 192 | under a "Not built" heading | - A SANS man may be transferred as anyone is, by "Transfer to Sqn", arriving still SANS with his SANS availability records, no SANS chip offered for him — design only [D2163, D2136, D2160, D2165, D2184, D2195]. | D2163, D2136, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 5,4 |
| GN066 | .claude/rules/decisions/scheduler.md | 193 | under a "Not built" heading | - His lean for two squadrons flying together at home: one wave may hold formations of both; a 142 formation shows on 142's own schedule too and may be changed by either squadron's scheduler, as a line that concerns both, 142 still planning the rest of its day; conflicts are flagged across the two, being at the same place, and warned afterwards too — design only [D2089, D2092, D2114, D2149, D2160, D2165, D2184, D2195]. The count at the top of the day keeps… | D2089, D2092, D2114, D2149, D2160, D2165, D2184, D2195 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN067 | .claude/rules/decisions/scheduler.md | 194 | under a "Not built" heading | - Where a schedule shows another squadron's lines they are marked as that squadron's — 149's shows which lines are 142's — the mark drawn for him first [D2090]; its first drawing, a plain "142" after the callsign, was turned down as ugly, and of the cleaner looks redrawn he chose look 2, its week tag since lined up under the mission on both devices [D2099, D2104, D2127]. | D2090, D2099, D2104, D2127 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN068 | .claude/rules/decisions/scheduler.md | 195 | under a "Not built" heading | - The purple names on his paper schedules are not asked about again: the design draws nothing from them and plans no mark for them [D2100]. | D2100 |  | 2,4 |
| GN069 | .claude/rules/decisions/scheduler.md | 196 | under a "Not built" heading | - A man is put on a detachment by a new input, DET, naming the detachment and taking effect at once like every input; on the Leave War he still counts as his squadron's manpower; the overseas duty input stays for duties away such as a staff trip, which count him out as today — design only [D2101, D2146, D2184, D2195]. | D2101, D2146, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,5,4 |
| GN070 | .claude/rules/decisions/scheduler.md | 197 | under a "Not built" heading | - An admin ends a detachment with one "Close detachment": its schedules kept under "Past detachments", read only for new planning, a past day still taking a correcting amendment; the closing day stays the detachment's, its people's DET ending then, home from the next day; its card says plainly, line by line and only what applies, all the press touches, no amendment label, a range past 3 days [D2095, D2103, D2139, D2160, D2165, D2184, D2195]. | D2095, D2103, D2139, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN071 | .claude/rules/decisions/scheduler.md | 198 | under a "Not built" heading | - Closing early clears every row of its published days after today, publishes the next amendment on each — no four names, one line "Cleared when … was closed" — then ends their DET, dropping days ahead never published; the home days that go pending are left to the home scheduler; Close is not a step of Undo, "Keep open" its safety [D2142, D2160, D2165, D2184, D2195]. | D2142, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,4 |
| GN072 | .claude/rules/decisions/scheduler.md | 199 | under a "Not built" heading | - Another squadron's line wears look 2: on the week a grey "142" badge under the mission, its left edge on the mission's first letter, alike on a desktop and a phone (smaller on a phone); on the Scheduler Board the badge on the callsign box's top-right corner, adding no height; the formation one shade lighter [D2099, D2104, D2127, D2117, D2128]. | D2099, D2104, D2127, D2117, D2128 |  | 3,4 |
| GN073 | .claude/rules/decisions/scheduler.md | 200 | under a "Not built" heading | - A schedule shows its own lines wherever planned, plus any line of a shared wave a scheduler ticks to show; the other squadron's line shown there is marked and read only, unless it concerns both squadrons — one squadron's own line in the other's wave [D2105, D2114, D2149]. | D2105, D2114, D2149 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN074 | .claude/rules/decisions/scheduler.md | 201 | under a "Not built" heading | - A shared wave is published and signed by its own squadron, the other's lines included; elsewhere it carries that squadron's badge and status, outside that schedule's signature; each squadron adds its own lines, 142 joining through "+ Wave", "Join a 149 wave" [D2106]. | D2106 |  | 2,3,4 |
| GN075 | .claude/rules/decisions/scheduler.md | 202 | under a "Not built" heading | - The other squadron's pick shows on the man's home day with its grey badge once that squadron publishes it, never pending on the home day nor in its signature, a change not yet published faint beside it, the home schedulers' bell rung each time; the man is told by his own bell and sees, read only, the published line he is on [D2160, D2165, D2184, D2195]. | D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,9,4 |
| GN076 | .claude/rules/decisions/scheduler.md | 203 | under a "Not built" heading | - At home people and sims are checked across both squadrons; jets stay each squadron's own [D2108]; airspace may be shared, two flights in one airspace never a clash, inside one squadron or across two, so no airspace check is built [D2166]; the other squadron's sim sessions at the same place show on yours by themselves, with its grey badge, and two sessions overlapping on one sim are warned, from one squadron or two [D2181]. | D2108, D2166, D2181 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN077 | .claude/rules/decisions/scheduler.md | 204 | under a "Not built" heading | - 142 and 149 each keep a Tracker of their own, a detachment using its parent squadron's, so no syllabus chart is shared across squadrons [D2167]. | D2167 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN078 | .claude/rules/decisions/scheduler.md | 205 | under a "Not built" heading | - A man on DET is taken off the SC DAY and SC NIGHT counts, being away from home, and SC, AVALON and BB cannot be planned for him [D2168]. | D2168 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 4 |
| GN079 | .claude/rules/decisions/scheduler.md | 206 | under a "Not built" heading | - A SANS man may be put on DET like anyone; to be planned at the detachment he must also mark himself available for those days, as today [D2169]. | D2169 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 5,4 |
| GN080 | .claude/rules/decisions/scheduler.md | 207 | under a "Not built" heading | - A man on DET sees both his home squadron's schedule and the detachment's, the whole time he is on it [D2180]. | D2180 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN081 | .claude/rules/decisions/scheduler.md | 208 | under a "Not built" heading | - A DET may name either squadron's open detachment, the man staying his own squadron's; onto the other squadron's it is filed by him or his own squadron's schedulers, never by the other squadron alone, its bell telling the detachment's schedulers [D2160, D2165, D2184, D2195]. | D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,9,4 |
| GN082 | .claude/rules/decisions/scheduler.md | 209 | under a "Not built" heading | - A detachment's sign-off boxes offer anyone of its own squadron qualified for each box, wherever he is, those at the detachment listed first, never the other squadron's [D2184, D2195]. | D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN083 | .claude/rules/decisions/scheduler.md | 210 | under a "Not built" heading | - Insights shows a man on DET as at the detachment ("249"), never "not flying", each schedule's figures its own and labelled so, with one figure of his weekly hours across every schedule [D2184, D2195]. | D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 9,10,4 |
| GN084 | .claude/rules/decisions/scheduler.md | 211 | under a "Not built" heading | - Posting out a man on DET works as today, the sheet first listing what it ends; a man who joins after a detachment day is published leaves that day as it is, his home days marked changed [D2184, D2195]. | D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,4 |
| GN085 | .claude/rules/decisions/scheduler.md | 212 | under a "Not built" heading | - Round 7's changes from the reviews, R12–R35, are designed as written; the design note §Round 7 lists them [D2184, D2195]. | D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,4 |
| GN086 | .claude/rules/decisions/scheduler.md | 213 | under a "Not built" heading | - A man on DET still counts on count rows such as Available, only the standby rows leaving him out; a SANS man's DET window offers "Available for all these days", each day still changeable; Post out opens from Admin → Users for everyone, as well as from the Leave War [D2182]. | D2182 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,5,4 |
| GN087 | .claude/rules/decisions/scheduler.md | 214 | under a "Not built" heading | - A line is judged by the Logic settings of the schedule it sits in, whoever flies it, OIL's full-day line aside [D2109, D2160, D2165, D2184, D2195]; crew rest stays each squadron's admin's to edit, and where a man's two lines sit in two schedules whose crew rest differs, the stricter of the two judges, whichever line comes first [D2122, D2161]. | D2109, D2160, D2165, D2184, D2195, D2122, D2161 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 1,3,10,4 |
| GN088 | .claude/rules/decisions/scheduler.md | 215 | under a "Not built" heading | - A line that concerns both squadrons — one squadron's own line in the other's wave — may be changed by either scheduler, from either schedule; the rest only by its own squadron's; the other's line holding our man stays the other's: we take him off by deleting his row at home, its window's Delete reading "Take him off …", fields not changeable, the other told [D2114, D2149]. | D2114, D2149 | mock/2026-11-17-multi-sqn-r7/draw-q4.mjs; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,4 |
| GN089 | .claude/rules/decisions/scheduler.md | 216 | under a "Not built" heading | - "✕ Wave" asks at the button only when the wave holds the other squadron's lines, Remove wave or Keep; a wave of its own lines goes at once [D2113]. | D2113 |  | 3,4 |
| GN090 | .claude/rules/decisions/scheduler.md | 217 | under a "Not built" heading | - "+ Line" stays in the wave's head and never moves as lines are added; each new line goes at the wave's foot, in the order made, and a "3 new ↓" count beside the button brings new lines out of view into view on a tap, showing only while one is out of view and going once all have been seen [D2115, D2125]; its number counts down as he scrolls new lines into view by hand, and a tap after the just-added ring has faded plays the ring again as the lines come i… | D2115, D2125, D2137, D2138 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 4 |
| GN091 | .claude/rules/decisions/scheduler.md | 218 | under a "Not built" heading | - In the "+ Wave" menu each wave under "Join a 149 wave" shows its take-off and formations, a joined one reads "joined" in grey, and a day with no 149 wave reads one grey line saying so [D2126]. | D2126 |  | 4 |
| GN092 | .claude/rules/decisions/scheduler.md | 219 | under a "Not built" heading | - The new detachment's short-name box asks for the squadron number, a faded "249" inside it as the example [D2116]. | D2116 |  | 3,4 |
| GN093 | .claude/rules/decisions/scheduler.md | 220 | under a "Not built" heading | - His lean: a squadron's new place takes effect when it is saved, as a new account does, with no "From" date, counting from the next day's start so no day is split [D2119, D2160, D2165, D2184, D2195]. | D2119, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN094 | .claude/rules/decisions/scheduler.md | 221 | under a "Not built" heading | - A man's own DET input stays the way onto a detachment, so he can put himself on it if the scheduler misses it — he may file it and lengthen it, not shorten or delete it over a day he is planned on there, which a scheduler does [D2184, D2195]; an open detachment's row shows "People · N" and "+ Put people on it", the Inputs page's several-people picker filing one DET input for them all [D2120, D2131, D2146]. | D2184, D2195, D2120, D2131, D2146 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 5,4 |
| GN095 | .claude/rules/decisions/scheduler.md | 222 | under a "Not built" heading | - The look of a shared wave at each step of signing is redrawn: a schedule never reads as published while its own squadron has not signed it; the other squadron's badge stays in the wave's title, and the grey line under it no longer says whose wave it is but is one sentence by state, "Not yet published by 149.", "RU goes out when 149 publishes." once 142 has published, "Published by 149.", and a fourth below [D2160, D2165, D2184, D2195]; the day head's st… | D2160, D2165, D2184, D2195, D2121, D2124, D2129 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN096 | .claude/rules/decisions/scheduler.md | 223 | under a "Not built" heading | - A line changed in the other squadron's wave after both published adds a fourth sentence, "RU changed · goes out when 149 publishes", its cells dotted and 149's schedulers told [D2124, D2160, D2165, D2184, D2195]. | D2124, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN097 | .claude/rules/decisions/scheduler.md | 224 | under a "Not built" heading | - When the other squadron has no wave that day, "+ Wave" says so and 142 plans in a wave of its own, which 149 may join; 142 never adds a line to 149's schedule [D2130]. | D2130 |  | 2,3,4 |
| GN098 | .claude/rules/decisions/scheduler.md | 225 | under a "Not built" heading | - Where a person may see several schedules, the TALON mark is a "149 ▾" button opening "Schedules"; the schedule pages and Logic follow the pick, Inputs, Quals, the Leave War and the Tracker stay on his own squadron — for a master admin, and an admin given Plan of it, every page follows, each his to edit [D2197, D2201]; the board's bar shows the squadron's number beside its day title [D2132, D2197, D2201]. | D2197, D2201, D2132 | superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,5,10,4 |
| GN099 | .claude/rules/decisions/scheduler.md | 226 | under a "Not built" heading | - The other squadron's free people stand in a group of their own at the foot of Edit Schedule's and the board's crew lists, each showing when he is free [D2133]. | D2133 |  | 3,4 |
| GN100 | .claude/rules/decisions/scheduler.md | 227 | under a "Not built" heading | - A detachment's "To" is its planned end, never a close by itself, the bell reminding its admins that day; closing it early ends its people's DET that day, the bell telling each [D2134, D2135, D2146, D2184, D2195]. | D2134, D2135, D2146, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,9,4 |
| GN101 | .claude/rules/decisions/scheduler.md | 228 | under a "Not built" heading | - A transfer may be set months ahead, so the sheet's lines on what the date affects are today's figures, worked out again when it opens, headed "As of today:" [D2162]; it has no choices: on the date he joins as a member, his access, admin rights and Scheduler tick in the old squadron end, its lines keep him as a borrowed man, and the bell tells both squadrons' admins, when it is set and on the date [D2147, D2136, D2160, D2165, D2163, D2184, D2195]. | D2162, D2147, D2136, D2160, D2165, D2163, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,9,4 |
| GN102 | .claude/rules/decisions/scheduler.md | 229 | under a "Not built" heading | - A transfer is refused at once, never left waiting, where he would leave his squadron with no admin, as is any later step that would cause it; a DET across the date is no reason to refuse it [D2184, D2195]. | D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,4 |
| GN103 | .claude/rules/decisions/scheduler.md | 230 | under a "Not built" heading | - He carries his sign-in, callsign, inputs, medical records, currencies, leave and OIL, a SANS man his SANS availability [D2163]; approved leave arrives approved, marked so; undecided bids move or wait as requests; quals the new squadron does not list stay greyed; he stays on his Tracker course; whose man he is reads from his stints by date; a past date is refused; Undo cancels it only before the date [D2136, D2160, D2165, D2184, D2195]. | D2163, D2136, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 1,3,5,4 |
| GN104 | .claude/rules/decisions/scheduler.md | 231 | under a "Not built" heading | - Access to the other squadron is View only, unless a master admin gives an admin Plan of it — full access, as its own admins (the People & accounts page); an admin of a squadron is made only by its own admins, an admin with Plan of it, or a master admin [D2094, D2160, D2165, D2184, D2195, D2199, D2250, D2201, D2241]. | D2094, D2160, D2165, D2184, D2195, D2199, D2250, D2201 | mock/2026-11-20-multi-sqn-reshape/page.html; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN105 | .claude/rules/decisions/scheduler.md | 232 | under a "Not built" heading | - OIL for a day worked for both squadrons is one credit from one span across both latest published days, judged by his own squadron's settings; a published day keeps the Logic values it went out with; where his two published days kept different full-day values, the one they already carry stands until his own squadron publishes that day again, its card showing old and new OIL [D2183]; each squadron keeps its own public-holiday list and Off day, even at one… | D2183, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 1,2,3,10,4 |
| GN106 | .claude/rules/decisions/scheduler.md | 233 | under a "Not built" heading | - Every date turn goes by home's date, a detachment's schedule typed in its local times — but each place, home included, is set by its time zone, picked by name and shown as GMT+X: Close keeps a detachment day already begun there, crew rest across two places adds the difference, postings and the late mark stay on home's date [D2165]; no Reject of a DET at home; one man, one place is checked afterwards too, a red warning and the schedulers told, a move, Cl… | D2165, D2092, D2119, D2160, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 4 |
| GN107 | .claude/rules/decisions/scheduler.md | 234 | under a "Not built" heading | - Crew rest, days in a row and the long day follow the man across places, a DET's last day ending at 24:00; a detachment's ALL AVAIL counts its men there; crew rest, the long day and turn time judge by the line's schedule, days in a row and Insights' hours by his own squadron's; a squadron per Tracker course [D2092, D2109, D2160, D2165, D2184, D2195]. | D2092, D2109, D2160, D2165, D2184, D2195 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 3,5,10,4 |
| GN108 | .claude/rules/decisions/scheduler.md | 235 | under a "Not built" heading | - Two schedulers on one shared line across two squadrons: no lock, unlike a squadron's own day (one editor, D2212); the editing mark shows across both squadrons, the later save stands, the one replaced is told, and Publish warns while the other edits [D1751, D2212, D2160, D2165, D2184, D2195]. | D2212, D1751, D2160, D2165, D2184, D2195 | mock/day-lock.html; superpowers/specs/2026-11-16-multi-sqn-detachment-design.md; superpowers/plans/2026-11-17-multi-sqn-build-batches.md | 2,3,4 |
| GN109 | .claude/rules/decisions/scheduler.md | 236 | under a "Not built" heading | - Admin gains a "Squadrons" page as drawn, and "Request access" asks the squadron first, as drawn [D2110, D2111]. | D2110, D2111 |  | 3,4 |
| GN110 | .claude/rules/decisions/scheduler.md | 237 | under a "Not built" heading | - Escape closes the changes window when it was the last thing opened, as it does the other windows [D2112]. | D2112 |  | 4 |
| GN111 | .claude/rules/decisions/scheduler.md | 238 | under a "Not built" heading | - His lean: where two squadrons each put an ALL AVAIL event at the same time, the app flags no conflict and does not decide which one a man attends — left to the people; design only [D2097]. | D2097 | superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | 3,5,4 |
| GN112 | .claude/rules/decisions/scheduler.md | 239 | under a "Not built" heading | - Caps and ops limits is a weekly form: each person fills it in at the start of the week, cleared by itself every week; one button shows who has completed it, those flying above all; a click switches the check off; its detail asked in rounds when its batch is planned; paused until he calls for it — [CAPS-OPS-LIMITS] [D2084, D2186]. | D2084, D2186 |  | 4 |
| GN113 | .claude/rules/decisions/scheduler.md | 240 | under a "Not built" heading | - The "+ Block" menu calling the built-in Standard block "BB desk" is a small fix for later, its right name put to him — [BLOCK-MENU-BB-DESK] [D2021]. | D2021 |  | 4 |
| GN114 | .claude/rules/decisions/scheduler.md | 241 | under a "Not built" heading | - The day lock is a simple mark, not a hard lock: a day shows who is editing it, set when he starts and cleared once his work is saved, so two people never edit it at once by accident, the app letting only its editor change it (below); the database itself refuses nobody, since the app is used within the unit — at the database step, [DB-SYNC-MODEL] [D1751, D2212]. | D1751, D2212 | mock/day-lock.html | 2,3,4 |
| GN115 | .claude/rules/decisions/scheduler.md | 242 | under a "Not built" heading | - One editor per day, his choice over both editing with a flag when overwritten: while one scheduler holds a day, the app lets everyone else only read it, "<callsign> – editing" showing; the change counter's refusal and the "replaced by a later save" line only catch two taking it at the same instant [D2212, D1751]. | D2212, D1751 | mock/day-lock.html | 3,4 |
| GN116 | .claude/rules/decisions/scheduler.md | 243 | under a "Not built" heading | - His (D2212): the 30 minutes, "Done editing", sign-out; the rest the agent's reading of D1751: once the app is in the database a scheduler edits a day by taking it — one day or several, by ✎ Edit or by a change on a day no one holds — others seeing "<callsign> – editing" and reading it only; it frees after 30 minutes with no change by its holder on that day (a warning at 25), or at once when he closes the page or signs out; changes save as made and "Done… | D2212, D1751, D355, D356, D451, D454 | mock/day-lock.html | 4 |
| GN117 | .claude/rules/decisions/scheduler.md | 244 | under a "Not built" heading | - Others' changes arrive by themselves every 30 seconds, and fast sync (every second) switches itself off after 20 minutes or when the page is left, with a note, one tap turning it back on — [DB-SYNC-MODEL] [D452, D356]. | D452, D356 |  | 4 |
| GN118 | .claude/rules/decisions/scheduler.md | 245 | under a "Not built" heading | - An admin may take a day over but asks the holder first (his D2212); the rest by the same reading of D1751, not yet checked with him ("Saber asks to take over Tuesday" — Hand over / Keep editing), no answer in a minute handing it over, Keep editing telling the asker, who may still "Take over anyway" (asked again, noted in the history), every take-over first saving the day as a saved plan "<callsign> — at take-over HH:MM" — [DB-SYNC-MODEL] [D2212, D454, D… | D2212, D1751, D454, D451, D355 | mock/day-lock.html | 2,3,4 |
| GN119 | .claude/rules/decisions/scheduler.md | 246 | under a "Not built" heading | - The change history and every other record of who did something show the person's name as it was at the time and keep the person himself underneath, so his record can still be found after a rename — the rest at the database step, [DB-ONE-MASTER-FIXES] [D1589]. | D1589 | superpowers/specs/2026-11-03-data-one-master-check.md | 4 |
| GN120 | .claude/rules/decisions/scheduler.md | 247 | under a "Not built" heading | - Before the app is put out for testing, signing in always opens on today's date; until then it may open on the demo week's date, because the demo data is what is being worked on — [LOGIN-OPENS-TODAY] [D1383]. | D1383 |  | 2,3,4 |
| GN121 | .claude/rules/decisions/scheduler.md | 248 | under a "Not built" heading | - A flying line with only its front seat (FCP) filled works as fully as a two-seat line, its checks, marks, counts and pages included, so the app can serve F-16 squadrons (some jets single-seat) and F-35 squadrons (all single-seat); an admin switch hiding the back seat (RCP), one of the aircraft-type settings that carry a type's rules, is his idea, designed with him first, and the rules a single-seat jet needs are new rules, designed with him later — [SIN… | D1099, D1100, D1101 | superpowers/specs/2026-10-21-single-seat.md | 2,3,4 |
| GN122 | .claude/rules/decisions/scheduler.md | 249 | under a "Not built" heading | - A crossed-out man's reason in the crew list says each fact once: where the kind's meaning and his own remark repeat a fact it is said once, and a fact only one of them carries stays; done later, not in the right-panel job, on its own or with the words pass, his to place — [CREW-REASON-TWICE] [D1121]. | D1121 |  | 4 |
| GN123 | .claude/rules/decisions/scheduler.md | 250 | under a "Not built" heading | - A "?" where a row has no timing or no end time is a future job, scoped with him first — [ROW-NO-TIME-MARK]; the "~" was declined [D361, D360]. | D361, D360 | superpowers/plans/2026-09-28-small-fixes-batch-plan.md | 4 |
| GN124 | .claude/rules/decisions/scheduler.md | 251 | says not built | - An Admin "Display" area of section fold defaults is not built: put it to him again only when Admin or the section folds are next touched — [ADMIN-DISPLAY] [D161]. | D161 |  | 3,4 |
| GN125 | .claude/rules/decisions/scheduler.md | 311 | says not built | - Week navigation: on a phone the week pages step day to day by swipe, continuous across weeks, never locked to one day; the cross between weeks glides as two frozen copies over the real week, which stays painted beneath; the cross stays as built on the phone and the desktop, the swipe past Monday or Sunday still sliding into the other week, and the end cards are not built; detail: `performance.md` §Compositor layers, the fresh-add box and the cross-week … | D1577 | superpowers/plans/2026-11-03-week-cross-end-cards.md | 4 |
| GN126 | .claude/rules/decisions/scheduler.md | 342 | says not built | - The wordings reworked by the writing guide are the ones built, as its page gives them — the passing notes N1–N4, N7, N10, N11, N14, N16, N19, N24 and N26, the clash note's words and the OIL question's words; N8 is not built, N33 stays removed, and the two bars he ruled with a dash keep it; the words: `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` [D837, D839]. | D837, D839 | superpowers/briefs/2026-10-13-wording-recheck.md | 1,4 |
| GN127 | .claude/rules/decisions/scheduler.md | 373 | says not built | - The ALL AVAIL window shows just the available people — plain pucks, no flags or reasons, no tap for why, nothing at its foot — save the amber mark and reason where the item falls in a man's flight or sim brief or debrief (a flag unrelated to the item's time misleads); not built, today every flag shows — [ALL-AVAIL-WINDOW-FLAGS] [D40, D41, D1106, D2331, D2425, D2426]. | D1106, D2331, D2425, D2426 |  | 5,4 |
| GN128 | .claude/rules/decisions/scheduler.md | 374 | says not built | - That mark never says he "misses" it — the brief is often planned earlier, or the debrief after, so he can attend: it states the overlap, "OPS BRIEF 15:30–16:30 overlaps VL BFM debrief 15:00–17:00", in the warning list too; drafted, Fable-adjusted and drawn first, not built [D2424, D2427, D2331, D2425, D2426]. | D2424, D2427, D2331, D2425, D2426 |  | 4 |
| GN129 | .claude/rules/decisions/scheduler.md | 375 | says not built | - With OIL Earn on, the earning side the same, "Tap a puck to stop a man earning from this event." kept; not built [D2428, D2426]. | D2428, D2426 |  | 1,4 |
| GN130 | .claude/rules/decisions/scheduler.md | 451 | says not built | - Deleting a man lists everything the delete took away, one line each — his "deleted" line, each future input, bid and OIL award, each on its own day — never a credit the schedule earned; the notes he was taken off are to be named too, one line a note (not built: `[DELETE-LIST-CAL-NOTES]`) [D337, D710]. | D337, D710 |  | 1,5,4 |
| GN131 | .claude/rules/decisions/scheduler.md | 456 | says not built | - Also, not built: input and holiday lines get it too; the SANS untick's reads "You're SANS again."; a Redo's adds "again"; a Post out date moved earlier gives two lines; "…is no longer a public holiday" opens nothing; two changes, the first in the title [D2561]; bell lines stay instant, no settling time [D2562]; an input's "Deleted" line too, drawn first [D2563]. | D2561, D2562, D2563 |  | 5,9,4 |
| GN132 | .claude/rules/decisions/scheduler.md | 512 | says not built | - Saturday and Sunday start with no flying set; a no-fly day still shows and takes OFT and AMT commitments; the Leave War's panel for a picked block of people's days stays up with the grid behind it working, and the war's other windows wait for their own job — not built, `[LW-WINDOWS-NONBLOCKING]` [D642, D641]. | D642, D641 | superpowers/specs/2026-10-07-inputs-sans-redesign.md | 4 |

## List 3c — specs and plans with a still-open backlog item (G-S)

Open = the file names a `[ITEM-ID]` that is an item heading in `OUTSTANDING.md` today (finished items are in the archive). This lists them all, including ones whose item is long open or whose work has partly shipped; the slice helper decides which describe unbuilt or part-built work.

| Id | File | Title | Open item(s) named | Slice (guess) |
|---|---|---|---|---|
| GS001 | raptor-port/docs/superpowers/specs/2026-09-12-amendment-core-build-brief.md | Amendment / scheduling model — design brief (frozen, build-ready) | EOD DB-STEP | 2,4 |
| GS002 | raptor-port/docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md | Amendment engine — CORE build plan (test-first) | EOD | 2 |
| GS003 | raptor-port/docs/superpowers/specs/2026-09-12-amendment-model-design-brief.md | Amendment / scheduling model — design brief (frozen, build-ready) | DB-STEP | 2,4 |
| GS004 | raptor-port/docs/superpowers/specs/2026-09-12-amendment-phase2-implementation-plan.md | Amendment engine — Phase 2 implementation plan (the coupled record rewrite) | EOD | 2 |
| GS005 | raptor-port/docs/superpowers/specs/2026-09-12-amendment-phase2-quarantine-redesign.md | Amendment Phase 2 — the legacy-book QUARANTINE, redesign brief | AMEND | 2 |
| GS006 | raptor-port/docs/superpowers/specs/2026-09-13-architecture-rootcause-plan.md | Whole-app architectural root-cause plan (13 Sep 26) | GLOBAL-UNDO DB-STEP ARCH-STACK | 2 |
| GS007 | raptor-port/docs/superpowers/specs/2026-09-13-stable-ids-step1a-review-log.md | 1A stable-ids — plan review log (append-only) | TRK-DISK | 2 |
| GS008 | raptor-port/docs/superpowers/specs/2026-09-13-stable-ids-step1a-spec.md | [ARCH-STACK] Step 1A — stable ids (scheduler side): input filing-by-id + note ids | ARCH-STACK TRK-DISK | 5,4 |
| GS009 | raptor-port/docs/superpowers/specs/2026-09-13-sync-delete-undo-integrity-spec.md | Sync / delete-undo integrity — round-3 spec & record (13 Sep 26) | GLOBAL-UNDO | 4 |
| GS010 | raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md | [TRK-CSID] Phase 1 — stable hidden ids for Tracker COURSES (spec) | ARCH-STACK TRK-DISK | 4 |
| GS011 | raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-syllabus-ids-spec.md | [TRK-CSID] Phase 2 — stable hidden ids for Tracker SYLLABUSES (spec) | ARCH-STACK TRK-DISK DB-STEP | 4 |
| GS012 | raptor-port/docs/superpowers/specs/2026-09-14-arch-stack-1c-personid-spec.md | [ARCH-STACK] Step 1C — `who → personId` (the last piece of "stable ids") | ARCH-STACK DB-STEP XFER TRK-DISK | 4 |
| GS013 | raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md | Live flagging on the published schedule — PLAN v2 (build spec) | FLAG-EXPORT | 2,4 |
| GS014 | raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md | [ARCH-STACK] Step 2 — the one write/command layer — DESIGN (Rev 5, 16 Sep 26 — BUILT; Rev 5.1 corrections 17 Sep 26) | ARCH-STACK GLOBAL-UNDO DB-STEP | 4 |
| GS015 | raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-review-log.md | [ARCH-STACK] Step 2 — command-layer design — review log | ARCH-STACK | 4 |
| GS016 | raptor-port/docs/superpowers/specs/2026-09-16-flag-export.md | [FLAG-EXPORT] — export the PUBLISHED schedule + a report-grade PDF | FLAG-EXPORT | 2,4 |
| GS017 | raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-2-followup1-scheduler-routing-plan.md | [ARCH-STACK] Step 2 — follow-up #1: route the REMAINING scheduler writes through commit() | ARCH-STACK | 2,4 |
| GS018 | raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-2-followup1-scheduler-routing-review-log.md | Review log — [ARCH-STACK] Step 2 follow-up #1 (scheduler routing) plan | ARCH-STACK | 2,4 |
| GS019 | raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md | [ARCH-STACK] Step 3 — one global undo — DESIGN (Rev 6, 18 Sep 26 — BUILD-READY) | ARCH-STACK GLOBAL-UNDO | 4 |
| GS020 | raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md | [CMDL-FINISH] Finish the command layer for Leave War + Tracker — ARCH-STACK step 2 completion — DESIGN (Rev 4 — LOCKED 17 Sep 26, round-4 A… | GLOBAL-UNDO | 4 |
| GS021 | raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-review-log.md | [CMDL-FINISH] — plan-review log | GLOBAL-UNDO | 2 |
| GS022 | raptor-port/docs/superpowers/specs/2026-09-17-doc-correctness-sweep.md | Correctness sweep of the build-critical documents — 17 Sep 26 | GLOBAL-UNDO FLAG-EXPORT | 4 |
| GS023 | raptor-port/docs/superpowers/specs/2026-09-18-global-undo-phase2-cutover-plan.md | [GLOBAL-UNDO] Phase 2 — scheduler + Leave War cutover — BUILD PLAN (for red-team, 18 Sep 26) | GLOBAL-UNDO | 2,4 |
| GS024 | raptor-port/docs/superpowers/specs/2026-09-19-arch-stack-4-clash-catalogue.md | ARCH-STACK step 4 — Leave War clash catalogue (19 Sep 26) | LEAVE-YEAR RECALL XFER DB-STEP | 4 |
| GS025 | raptor-port/docs/superpowers/specs/2026-09-19-arch-stack-4-one-absence-design.md | ARCH-STACK step 4 — ONE absence record (design, Rev 10, 19 Sep 26) | TRK-DISK DB-STEP | 4 |
| GS026 | raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md | The one-absence model — every behaviour the owner ruled, in plain words (20 Sep 26) | LEAVE-YEAR LW-COMMIT-MANNING HUMAN-RETEST | 4 |
| GS027 | raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md | [OIL-AUTO-REMOVE] — owner decisions and the design as it stands (21 Sep 26) | LW-COMMIT-MANNING | 1 |
| GS028 | raptor-port/docs/superpowers/specs/2026-09-21-oil-award-add-review-log.md | [OIL-AWARD-ADD] / N16 — design review log | LW-COMMIT-MANNING | 1 |
| GS029 | raptor-port/docs/superpowers/specs/2026-09-22-backlog-process-attack.md | FABLE'S ATTACK ON D29 — the backlog process fix (22 Sep 26) | GLOBAL-UNDO LW-WEEKDAY-WORK | 4 |
| GS030 | raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-final-read-fable.md | [OIL-SEATS-CAN-EARN] — the final code read, Fable 5.1 | GLOBAL-UNDO | 1,4 |
| GS031 | raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md | The amendment behaviour register — every rule the amendment system must obey (24 Sep 26) | HUMAN-RETEST AMEND EOD FLAG-EXPORT GLOBAL-UNDO UNDO-POSTING-RECORD | 2 |
| GS032 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-backlog-classification.md | Spring clean — the backlog classified, the old priority block read, the live order (Fable, read-only, 24 Sep 26) | ARCH-STACK AMEND EOD DB-STEP RECALL GLOBAL-UNDO XFER TRK-DISK | 4 |
| GS033 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-handoff-classification.md | Spring clean — `HANDOFF.md` classified, unit by unit (Fable, read-only, 24 Sep 26) | HUMAN-RETEST GLOBAL-UNDO DB-STEP AMEND ADMIN-DISPLAY FLAG-EXPORT USER-GUIDE | 4 |
| GS034 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-meaning-astra.md | Spring clean — Astra's meaning check (D138, D70), 24 Sep 26 | PERF-RESIDUALS | 4 |
| GS035 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-meaning-fable.md | Spring clean — Fable's meaning check (D138), 24 Sep 26 | TRK-DISK | 4 |
| GS036 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-moves-report.md | Spring clean — the moves report (evidence for the D138 meaning check, 24 Sep 26) | HUMAN-RETEST REPO-PRIVATE BACKLOG-ORDER LW-WEEKDAY-WORK DB-STEP AMEND ARCH-STACK DOC-POINTERS-CODE | 4 |
| GS037 | raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-plan.md | The spring clean — plan, move map and checks (24 Sep 26) | DOC-POINTERS-CODE | 2 |
| GS038 | raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md | What changes a PUBLISHED day's face when an input goes in — the sweep (25 Sep 26) | AMEND | 2,5,4 |
| GS039 | raptor-port/docs/superpowers/specs/2026-09-26-accounts-new-person-redteam-r1-fable.md | Fable red team — `[ACCOUNTS-NEW-PERSON]` plan, round 1 (26 Sep 26) | HUMAN-RETEST | 2,3 |
| GS040 | raptor-port/docs/superpowers/specs/2026-09-27-post-out-outcomes-redteam-r2-fable.md | Red team, round 2 — the `[POST-OUT-OUTCOMES]` plan (Fable 5.1, 27 Sep 26) | DB-READINESS | 2 |
| GS041 | raptor-port/docs/superpowers/specs/2026-09-28-draft-pending-plan-review-log.md | [DRAFT-PENDING] plan — review log (round 1, 28 Sep 26) | DB-READINESS | 2 |
| GS042 | raptor-port/docs/superpowers/specs/2026-09-28-small-fixes-final-read-fable.md | Small-fixes batch — the final code read (Fable, blind) — 28 Sep 26 | PLAN-BANNER-DOOR | 4 |
| GS043 | raptor-port/docs/superpowers/specs/2026-09-29-oil-award-plan-redteam-astra.md | Red-team report: OIL award one-kind plan | DB-READINESS | 1,2 |
| GS044 | raptor-port/docs/superpowers/specs/2026-09-29-oil-award-plan-redteam-fable.md | Red team of the `[OIL-AWARD-IS-A-GRANT]` plan — Fable 5.1, 29 Sep 26 | DB-READINESS | 1,2 |
| GS045 | raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md | Five recommended skills, read at the source — what we fuse, where, and what we skip (D486, 2 Oct 26) | SKILL-FUSION CODE-TIDY-AUDIT DB-STEP WORD-LIST IT-QUESTIONS | 4 |
| GS046 | raptor-port/docs/superpowers/specs/2026-10-03-insights-mission-mix.md | Insights mission mix — approved design and branch implementation, 3 Oct 26 | FEATURE-WISHLIST | 10 |
| GS047 | raptor-port/docs/superpowers/specs/2026-10-03-workflow-ui-scope.md | Workflow UI scope — 3 Oct 26 | VH-SHEETS-IPHONE | 4 |
| GS048 | raptor-port/docs/superpowers/specs/2026-10-05-caps-ops-limits.md | Caps and ops limits — cancelled new-chat design draft, 5 Oct 2026 | REST-FIRST-CREW-HINT SANS-PREVIOUS-REPORT-OFFER | 4 |
| GS049 | raptor-port/docs/superpowers/specs/2026-10-07-expired-guide-text.md | Expired text in the working guides — what moves out, and what the guides say after (`[START-CONTEXT-AUDIT]` options 5 and 6, D609) | START-CONTEXT-AUDIT FEATURE-WISHLIST | 4 |
| GS050 | raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md | The Inputs calendar and the SANS availability calendar — his direction of 7 Oct 26 | LW-WINDOWS-NONBLOCKING | 5 |
| GS051 | raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md | What a new chat loads at its start — the measurement, and the options (`[START-CONTEXT-AUDIT]` step 1 and 2, D602) | START-CONTEXT-AUDIT STACK-LEFTOVERS | 4 |
| GS052 | raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md | Compacting when ready — the design (`[COMPACT-WHEN-MOD]`, D868, D870) | COMPACT-WHEN-MOD | 4 |
| GS053 | raptor-port/docs/superpowers/specs/2026-10-15-overnight-skill-draft.md | Overnight — the unattended run as one command (RAPTOR, internal) | NO-ASTRA-LIST COMPACT-WHEN-MOD | 4 |
| GS054 | raptor-port/docs/superpowers/specs/2026-10-16-words-pass.md | The whole-app words pass — rounds, and his answers (D808) | UI-SLEEK-PASS | 4 |
| GS055 | raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md | The Leave War overhaul — design note (D1140, 21 Oct 26) | LW-OVERHAUL LW-SORT-BY-FLIGHT LEAVE-YEAR NOTIFY-REGISTER LW-EVENTS-LANE NOTICE-RETENTION LW-COMMIT-MANNING | 4 |
| GS056 | raptor-port/docs/superpowers/specs/2026-10-21-single-seat.md | Single-seat jets — the app works with only the front seat filled (his intent, 21 Oct 26 — D1099) | SINGLE-SEAT | 4 |
| GS057 | raptor-port/docs/superpowers/specs/2026-10-29-drawing-check-guide-wording.md | The drawing check — the guide wording to put to him (D1494, 29 Oct 26) | NO-ASTRA-LIST | 4 |
| GS058 | raptor-port/docs/superpowers/specs/2026-11-03-data-one-master-check.md | What does not read the one table — the check of 3 Nov 26 (D1580) | DB-OIL-OWN-TABLE DB-ONE-MASTER-FIXES LW-OIL-OPENING-AWARD LW-SORT-BY-FLIGHT ARCH-STACK | 4 |
| GS059 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md | The rules check — every warning rule checked against the app (11 Nov 26) | ENGINE-RULES-REVIEW SINGLE-SEAT | 4 |
| GS060 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-1.md | Family 1 — report times: in-times, rallies, briefs and where a day starts (W1–W13) — results | ENGINE-RULES-REVIEW | 4 |
| GS061 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-2.md | Family 2 — standby lines (SC, AVALON, BB) and standby lines that fly (W14–W26) | ENGINE-RULES-REVIEW | 4 |
| GS062 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-3.md | Family 3 — crew rest, the run of days, the long work day and turns (W27–W39) — results | ENGINE-RULES-REVIEW | 4 |
| GS063 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-4.md | Family 4 — availability, absences and inputs against a seat (W40–W53) — results (11 Nov 26) | ROW-NO-TIME-MARK | 5,4 |
| GS064 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-5.md | Family 5 — Seats, crew pairing, qualifications and placeholders (W54–W61) | ENGINE-RULES-REVIEW SINGLE-SEAT | 4 |
| GS065 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-6.md | Family 6 — hidden warnings and the issue counts (W62–W67), rules-first review, 11 Nov 26 | FLAG-EXPORT | 4 |
| GS066 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-7.md | Family 7 — the published day, amendments and what a frozen day reads (W68–W78) | ENGINE-RULES-REVIEW | 2,4 |
| GS067 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-9.md | Family 9 — OIL: which seats and which people earn (W88–W96) — results | ENGINE-RULES-REVIEW | 1,4 |
| GS068 | raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-worklist.md | Worklist — the rules-first review of the rules engine ([ENGINE-RULES-REVIEW], D1983) | ENGINE-RULES-REVIEW SINGLE-SEAT | 4 |
| GS069 | raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md | More than one squadron, and detachments — the design, round by round | MULTI-SQN-DESIGN IT-QUESTIONS SANS-CHIP-ON-SANS SIM-OVERLAP-WARN | 3 |
| GS070 | raptor-port/docs/superpowers/specs/2026-11-17-caps-design.md | Caps and ops limits — design, round 1 (17 Nov 26) | CAPS-OPS-LIMITS | 4 |
| GS071 | raptor-port/docs/superpowers/specs/leavewar-sync.md | Leave War ⇄ RAPTOR sync — the design | ARCH-STACK | 4 |
| GS072 | raptor-port/docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md | ARCH-STACK step 4 — build log (one absence record) | LEAVE-YEAR | 2 |
| GS073 | raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md | [HUMAN-RETEST] the absence record, walked with [S4-HUNT-REST] — the plan (26 Sep 26) | HUMAN-RETEST ARCH-STACK LW-WEEKDAY-WORK LW-COMMIT-MANNING LEAVE-YEAR | 2 |
| GS074 | raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md | Plan — `[ACCOUNTS]`: accounts in the app now, shaped as the defence-mail sign-in will be (D165, D166, D200, D202, D204, D210), 26 Sep 26 | HUMAN-RETEST | 2,3 |
| GS075 | raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md | Plan — `[POST-OUT-OUTCOMES]`: a posting out says which it is; accounts suspended and deleted; the archived man's callsign; the admin's memb… | XFER | 2,3 |
| GS076 | raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md | Plan — the change-recording re-test, with `[UNDO-ROSTER-SETTINGS]`, D148 and `[UNDO-TOPBAR]` (28 Sep 26) | UNDO-POSTING-RECORD GLOBAL-UNDO HIST-PER-PAGE | 2,10 |
| GS077 | raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md | The rulings slim-down — plan (D390, 28 Sep 26) | RULING-HOME-HOOK | 2 |
| GS078 | raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md | [OIL-AWARD-IS-A-GRANT] with D400 — one kind of hand-given OIL, "earned" and "awarded" shown apart (plan, 29 Sep 26) | DB-READINESS | 1,2 |
| GS079 | raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md | [DB-READINESS] group A — the table-shaping half (plan v4 — final, 30 Sep 26) | DB-READINESS IT-QUESTIONS ELOG-LINE-AFTER-COMMAND UNDO-PUBLISH-ERASES-ISSUANCE TRK-IMPORT-ONE-GROUP TRK-FIRST-ORDER-PLACE ACCOUNTS-SEED-FIRST-WRITE SETTINGS-LIST-ROWS | 2 |
| GS080 | raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md | [DB-READINESS] group A, phase 6 — what a day shows, worked out on read (plan v2, 30 Sep 26 — after round 1; step (c) v3, 1 Oct 26 — after r… | DB-READINESS | 2,4 |
| GS081 | raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md | [DB-READINESS] group A, phase 7 — the small OIL follow-ups (plan, 1 Oct 26) | DB-READINESS COUNT-CHIP-PHONE-TAP | 1,2 |
| GS082 | raptor-port/docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md | [WARN-HIDE-KEPT] A hidden warning: kept for everyone, no flag, struck out, not counted (plan, 1 Oct 26) | DB-READINESS | 2,4 |
| GS083 | raptor-port/docs/superpowers/plans/2026-10-02-codex-check-framework-review.md | Codex-only check framework — D499, 2 Oct 26 | CI-FAIL-PICTURES | 2 |
| GS084 | raptor-port/docs/superpowers/plans/2026-10-02-rally-code-inspection-2.md | Rally/workspan — independent final code inspection, round 2 of 2 | REST-FIRST-CREW-HINT | 2 |
| GS085 | raptor-port/docs/superpowers/plans/2026-10-03-css-split-coordination.md | CSS split coordination and independent scenarios — 3 Oct 26 | REST-FIRST-CREW-HINT SANS-PREVIOUS-REPORT-OFFER VH-SHEETS-IPHONE | 2 |
| GS086 | raptor-port/docs/superpowers/plans/2026-10-03-rally-review-fixes-inspection-2.md | Rally review fixes — independent Astra inspection 2, 3 Oct 2026 | SANS-PREVIOUS-REPORT-OFFER | 2 |
| GS087 | raptor-port/docs/superpowers/plans/2026-10-06-oil-work-start-plan.md | `[OIL-WORK-START]` — the build plan (D591, D592) — 6 Oct 26 | EOD | 1,2 |
| GS088 | raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md | The Inputs calendar and the SANS availability calendar — the build plan (D617–D641) — 7 Oct 26 | LW-WINDOWS-NONBLOCKING | 2,5 |
| GS089 | raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md | One rule for every input's row, one record for every input — the plan (`[ALL-AVAIL-AS-MEMBER]`; D750, D753–D762 — 11 Oct 26) | NO-ASTRA-LIST UI-SLEEK-PASS NOTICE-RETENTION | 2,3,5 |
| GS090 | raptor-port/docs/superpowers/plans/2026-10-14-oil-uncancel-load-plan.md | The small OIL job — plan and working notes (the night of 14 Oct 26) | NO-ASTRA-LIST | 1,2 |
| GS091 | raptor-port/docs/superpowers/plans/2026-10-17-tracker-batch-triage.md | The Tracker batch — the triage of its open items (17 Oct 26, the night's run) | FEATURE-WISHLIST TRK-DISK DB-STEP TRK-IMPORT-ONE-GROUP TRK-FIRST-ORDER-PLACE TRK-ASYNC-STALE | 2 |
| GS092 | raptor-port/docs/superpowers/plans/2026-10-19-standby-flies-redteam.md | [STANDBY-FLIES] — red team of the plan (19 Oct 26) | ROW-NO-TIME-MARK EOD | 2 |
| GS093 | raptor-port/docs/superpowers/plans/2026-10-21-night-vetting.md | The night of 21 Oct 26 — vetting the small fixes (three readers, read-only) | STACK-LEFTOVERS CODE-TIDY-AUDIT DOC-POINTERS-CODE | 2 |
| GS094 | raptor-port/docs/superpowers/plans/2026-10-22-leave-war-overhaul-build-plan.md | The Leave War overhaul — the build plan (for his approval) | LW-EVENTS-LANE NO-ASTRA-LIST | 2 |
| GS095 | raptor-port/docs/superpowers/plans/2026-10-22-leave-war-overhaul-code-map.md | The Leave War overhaul — the code map (night of 21–22 Oct 26) | NOTICE-RETENTION | 2 |
| GS096 | raptor-port/docs/superpowers/plans/2026-10-24-lw-m3-build-spec.md | The Leave War overhaul's M3 — placing leave: the build spec (night of 23–24 Oct 26) | NO-ASTRA-LIST LW-OVERHAUL | 2 |
| GS097 | raptor-port/docs/superpowers/plans/2026-10-27-backlog-tidy.md | The backlog tidy of 27 Oct 26 (the night of 26–27 Oct 26, job 3 — D1024) | LW-BID-BUBBLE LW-NIGHT1025-OLDER LOGIN-NOT-AT-TOP LW-OVERHAUL NOTIFY-REGISTER UI-CONSISTENCY-LOOK LW-PICK-HELD-MARK INP-CAL-CLICK-BEHIND-NEW | 2 |
| GS098 | raptor-port/docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md | The Leave War overhaul's M4 — deciding: the build spec (27 Oct 26) | NO-ASTRA-LIST NOTICE-RETENTION LW-NIGHT1025-OLDER LW-OVERHAUL | 2 |
| GS099 | raptor-port/docs/superpowers/plans/2026-10-28-lw-m5-plan.md | The Leave War overhaul's M5 — "the rest": the plan (28 Oct 26) | LEAVE-YEAR LW-OVERHAUL | 2 |
| GS100 | raptor-port/docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md | The Leave War overhaul's M5a — a person's leave figures: the build spec (28 Oct 26) | LEAVE-YEAR NO-ASTRA-LIST LW-OIL-OPENING-AWARD LW-OVERHAUL | 2 |
| GS101 | raptor-port/docs/superpowers/plans/2026-10-28-lw-whole-leave-build-spec.md | [LW-WHOLE-LEAVE-WINDOW] — build spec (28 Oct 26) | NO-ASTRA-LIST | 2 |
| GS102 | raptor-port/docs/superpowers/plans/2026-10-29-lw-m5b-build-spec.md | The Leave War overhaul's M5b — the admin's set-up: the build spec (29 Oct 26) | NO-ASTRA-LIST LW-OVERHAUL | 2,3 |
| GS103 | raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md | The M365 move plan — the SWiFT kit set against Raptor (31 Oct 26) | IT-QUESTIONS DB-READINESS REVIEW-LAYERS DB-SYNC-MODEL DB-STEP RESTRICTED-ENV-WORKFLOW AIRCRAFT-TYPE-SETTING CODE-APPS-RESEARCH | 2 |
| GS104 | raptor-port/docs/superpowers/plans/2026-10-31-scorecard-1.md | Scorecard 1 — the baseline (31 Oct 26) | REVIEW-LAYERS | 2 |
| GS105 | raptor-port/docs/superpowers/plans/2026-11-05-backlog-sizing.md | The backlog sized — what the agent can finish alone, in overnight jobs (5 Nov 26) | LW-NIGHT1025-OLDER DOC-POINTERS-CODE STACK-LEFTOVERS WORD-LIST REPO-TIDY UI-CONSISTENCY-LOOK | 2 |
| GS106 | raptor-port/docs/superpowers/plans/2026-11-06-lw-full-editing.md | Full editing on the Leave War (his D1724, 6 Nov 26) — brief | LW-FULL-EDITING | 2 |
| GS107 | raptor-port/docs/superpowers/plans/2026-11-06-rules-diet.md | The rules diet — brief (D1718, 6 Nov 26; started 7 Nov 26 — D1732) | RULES-DIET | 2 |
| GS108 | raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md | The rules diet — the plan, with sizes before and after (D1732, 7 Nov 26) | RULES-DIET RULING-HOME-HOOK ITFLOW-OIL-RESHOOT LW-FULL-EDITING TRK-DOWN-DAYS-CANCELLED TRK-NO-TYPED-STUDENT TRK-TRIAL-TESTS SCHED-PAGE-LEFTOVERS | 2 |
| GS109 | raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-sample-how-we-work.md | DRAFT — the general rulings ("how we work") as a "how it works now" page (rules-diet sample, v3, 7 Nov 26) | NO-ASTRA-LIST | 2 |
| GS110 | raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md | The pictures round's build — D1780–D1793 (his "All as recommended", 8 Nov 26) | UI-CONSISTENCY-LOOK | 2 |
| GS111 | raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-design-guide.md | [SKILLS-TIGHTEN] step 1 — the design guide: what would leave, what would be said shorter (10 Nov 26, chat 56) | UI-SLEEK-PASS SKILL-FUSION-WRITING WORD-LIST | 2 |
| GS112 | raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-overnight.md | [SKILLS-TIGHTEN] step 3 — the overnight skill: what would leave, what would be said shorter (10 Nov 26, chat 60) | NO-ASTRA-LIST OVERNIGHT-RETRY-TRIAL | 2 |
| GS113 | raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-session-handoff.md | [SKILLS-TIGHTEN] step 2 — the session-handoff skill: what would leave, what would be said shorter (10 Nov 26, chat 59) | REVIEW-LAYERS | 2 |
| GS114 | raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md | The multi-squadron and detachment build — the batch plan (chat 106, 17 Nov 26) | MULTI-SQN-DESIGN SIM-OVERLAP-WARN AIRCRAFT-TYPE-SETTING | 2,3 |
| GS115 | raptor-port/docs/superpowers/plans/2026-11-19-multi-sqn-b1-rest-files.md | Batch 1's remaining pieces — which files each touches, and what can run side by side (19 Nov 26, chat 111) | MSQ-FIXREAD4-OPEN | 2,3 |
| GS116 | raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md | Batch 1's open multi-squadron faults — the reshape plan (20 Nov 26) | MSQ-FIXREAD17-OPEN MULTI-SQN-DESIGN MSQ-PLAN-AUDIT | 2,3 |
| GS117 | raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md | The app's speed — the measurements of 24 Nov 26, the order of work and the ideas that wait ([APP-SPEED], D2480) | APP-SPEED PERF-RESIDUALS DB-STEP | 2 |
| GS118 | raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md | The readings lapse — the fix to the method (his D2567) — plan, 24 Nov 26 | READINGS-LAPSE-FIX UNASKED-READINGS-SWEEP | 2 |
| GS119 | raptor-port/docs/superpowers/plans/2026-11-24-rulings-audit-plan.md | The rulings audit — plan (his D2567; backlog [READINGS-LAPSE-FIX] step 2, [UNASKED-READINGS-SWEEP] folded in) | READINGS-LAPSE-FIX UNASKED-READINGS-SWEEP | 2 |

## Sort of the full rows' readings (R) — orders the work only, settles nothing

Each reading by itself (D2338): the row's text is cut into sentences and clauses; a clause is a reading when it uses "agent's / builder's / our reading", "the reading", "a reading" or "reading of". Its class is only what the same clause (or an immediately following clause that begins "Told / Not told") says: *the row says told*, *the row says not told*, *silent*, or *mixed* (both kinds of word in one clause — the helper reads it). The word lists are in the script, not a judgment. Slices 11 (scheduler, inputs, oil) and 12 (the rest) take them.

| Area | the row says not told | silent | the row says told | mixed (both words in one clause) | total |
|---|---|---|---|---|---|
| design | 1 | 22 | 15 | 0 | 38 |
| how-we-work | 6 | 104 | 96 | 4 | 210 |
| inputs | 2 | 65 | 59 | 0 | 126 |
| it-flow-guide | 0 | 1 | 0 | 0 | 1 |
| leave-war | 9 | 216 | 63 | 2 | 290 |
| oil | 0 | 15 | 11 | 0 | 26 |
| people-accounts | 1 | 32 | 62 | 1 | 96 |
| scheduler | 20 | 133 | 132 | 3 | 288 |
| tracker | 3 | 11 | 19 | 0 | 33 |

| Id | Row | Area (file) | Date | Class | The reading (clause) | Slice |
|---|---|---|---|---|---|---|
| R0001 | D2056 | design | 15 Nov 26 | the row says not told | the one cure left, B — every page scrolling inside a box of its own — costs Chrome's folding bars (about 30–80 points less page) and pull-down-to-reload. \| Cure B is not built: he keeps the screen space, and the few frames of page showing above the top bar when a flick springs a page past its end are accepted. The agent's reading, not checked: this closes `[TOPBAR-LOOSE-APPROV… | 12 |
| R0002 | D2040 | design | 14 Nov 26 | silent | recommended: keep both, and switch the checker off for these two exact things only. \| The just-added box and the input boxes' font stay as they are, and the design checker no longer raises them. The agent's reading: switched off by the checker's narrowest setting — one value each (`side-tab` and `overused-font` "Inter"), with this ruling as its reason — not the whole rule or f… | 12 |
| R0003 | D1873 | design | 8 Nov 26 | silent | The agent's readings: the fix is built on the pinned row's branch (`claude/lw-pin-last-frame`, pull request 694), since he looks at it on that preview and the pinned dates row sits right under the bar, so the two go live together on his "merge live" | 12 |
| R0004 | D1700 | design | 5 Nov 26 | silent | any new mark a person could mistake for another on its bar or page is redrawn before it is built (the agent's reading, lesson 70's other half). It is lesson 70's other half (one thing, one icon | 12 |
| R0005 | D1700 | design | 5 Nov 26 | the row says told | The agent's readings, told to him: the Leave War's OIL tab already wears the same plain clock, on another page — named and put to him with OIL Earn, since an OIL mark should be one mark | 12 |
| R0006 | D1680 | design | 5 Nov 26 | silent | The agent's readings: all nine lines are written out (the ninth, the old day pop-up's boxes, is drawn nowhere and changes nothing seen) | 12 |
| R0007 | D1667 | design | 5 Nov 26 | silent | a document too big to store keeps its own words. The agent's readings, drawn for him before anything is built: the schedule's "Not saved — that change was refused, and nothing was kept" reads "Blocked: nothing was kept" | 12 |
| R0008 | D1666 | design | 5 Nov 26 | silent | without it the app saves as always, and nobody else is touched. The agent's readings: reading what is saved still works (the week, the people), so the app opens as usual | 12 |
| R0009 | D1664 | design | 5 Nov 26 | silent | The agent's reading, as drawn: the first step's dot an amber ring with "!", the line to the second step and the second step plain (not yet where he is). \| `raptor-port/docs/ui-contracts.md` (the access screens, D1664) | 12 |
| R0010 | D1663 | design | 5 Nov 26 | the row says told | "For not saved can we also standardise the design for the whole app?" — said while the member / guest build was being checked (`claude/member-guest-checks`, pull request 638), the strip look of D1655 just built \| His direction: the "Not saved" design is one design across the whole app. The agent's reading, put to him with pictures before anything changes (D1613, D853): the fai… | 12 |
| R0011 | D1654 | design | 5 Nov 26 | silent | the agent's reading, drawn for his look: laid over the whole card so it thins out across the tear line. The softened fade is drawn as `raptor-port/docs/mock/2026-11-05-access-wait/img/C-diag-phone.png`, not yet seen by him: the pass and the foot one surface, the dashed tear the only divider. | 12 |
| R0012 | D1650 | design | 5 Nov 26 | silent | "Signed in as …" stays, small, as the one fact nothing else says — the agent's reading, shown in the drawing. \| filed as [ACCESS-WAIT-LOOK] | 12 |
| R0013 | D1643 | design | 4 Nov 26 | silent | The agent's reading, not his words: "a phone held sideways" is a touch screen with no fine pointer, wider than it is tall and under about 500 tall (`pointer: coarse` and a landscape orientation) | 12 |
| R0014 | D1635 | design | 4 Nov 26 | silent | The agent's readings: no words added to the card or the sign-in (the "Retry asks you to sign in" line is not built — the sign-in page goes at the move) | 12 |
| R0015 | D1633 | design | 4 Nov 26 | silent | The agent's reading: the update check and the stylesheet re-fetch built for the in-place retry are no longer needed and go. \| `raptor-port/docs/ui-contracts.md` §The loading claw while a slow page opens (D1633) | 12 |
| R0016 | D1632 | design | 4 Nov 26 | silent | The agent's reading: it is told to a screen reader as the claw's words are (D1631's spoken words, [TALON-CLAW-SPOKEN]). \| `raptor-port/docs/ui-contracts.md` §The loading claw while a slow page opens (D1632) | 12 |
| R0017 | D1626 | design | 3 Nov 26 | silent | the input window's "Close it and lose them?" (✕ and Escape) is built so, and every similar question in the app follows it. "Similar" is the agent's reading: a confirmation or a choice the app puts up because a control was pressed (close, delete, discard, open another over unsaved work) — the card hangs from the control pressed | 12 |
| R0018 | D1618 | design | 4 Nov 26 | the row says told | the hand-over of D1616 is not built. The agent's reading, stated to him with the record: "No change" is the mock-up's own label for today's look, so it is read as that pick, not as a report on the iPhone look | 12 |
| R0019 | D1615 | design | 3 Nov 26 | silent | The agent's reading, for the build: it starts 0.2 s into its round, as the page claw does since his first recording, so the first frame already shows a part of the claw (the order's lesson 22) | 12 |
| R0020 | D1607 | design | 3 Nov 26 | the row says told | The agent's readings, put to him before the build: the claw stands in that page area, the top bar staying | 12 |
| R0021 | D1606 | design | 3 Nov 26 | silent | The home-screen name is the agent's reading of "a short TALON under the app's icon": the page's `apple-mobile-web-app-title`, checked only in the page, not on his phone. | 12 |
| R0022 | D1591 | design | 3 Nov 26 | silent | the agent's reading: drawn by the browser itself from the logo's own lines (no library to download), placed in the first page the browser receives so it shows before the app's code arrives — motion.dev only if it adds nothing to the load. | 12 |
| R0023 | D1590 | design | 3 Nov 26 | the row says told | the talon logo stays. Agent's reading, not his words, put to him in the plan: "everything in the app" is what a person sees or receives — the screens, the tab's title, the sign-in, prints, PDFs and exports, the help text | 12 |
| R0024 | D1567 | design | 2 Nov 26 | the row says told | Sometimes I get stuck and I can’t zoom out if the page zooms in." — with his iPhone screen recording of 2 Nov 26 \| On a phone the page itself never zooms: only the grids that zoom by their own pinch (the Leave War grid and its OIL tab, Quals, the Scheduler Board’s desktop layout) zoom, and a pinch anywhere else does nothing, so the page can never be left zoomed in with no way … | 12 |
| R0025 | D1518 | design | 29 Oct 26 | silent | The agent's reading: it holds on a phone and on a desktop, for every such part in the app, a heading row included — each bug check of a screen with a pinned part checks it zoomed in and out and scrolled, on his iPhone's engine | 12 |
| R0026 | D1138 | design | 21 Oct 26 | the row says told | the pages without a title stay without one. The agent's reading, told to him: Logic's name is 18px, weight 700 on a desktop (16px on a phone) | 12 |
| R0027 | D1134 | design | 21 Oct 26 | the row says told | only a ✎ inside help text, or after an edited chart's name in the Tracker's Syllabus list, stays typed. The agent's readings, told to him: (1) "the same icon designs" is read as one pencil everywhere, his picture's | 12 |
| R0028 | D1127 | design | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) the coloured emoji magnifier goes everywhere — it is an emoji on his iPhone too | 12 |
| R0029 | D1122 | design | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) "the design skill" is the app's own design guide (`raptor-port/docs/design-practices.md`) — the outside design skill's files are not edited (D70) | 12 |
| R0030 | D926 | design | 15 Oct 26 | the row says told | All as recommended" — the morning after the night of 15 Oct 26, shown the night's report with two picture pages, each ending "All as recommended" (the agent's reading, told to him: his one "All as recommended" answers both pages, as the report said it would) — the one-row page (https://claude.ai/artifact/1CFVksBEx3WMSg9t994FU1), questions 2 and 3. \| The design guide carries "a… | 12 |
| R0031 | D876 | design | 15 Oct 26 | silent | the design guide's "one mark, one look" wording (version 2, after one fresh reader) with five clauses named as the agent's readings | 12 |
| R0032 | D876 | design | 15 Oct 26 | silent | the point's closing line names him as approving the readings. | 12 |
| R0033 | D850 | design | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) "design it" means the result itself is the feedback — the new thing appears and is marked for a few seconds as the Scheduler Board marks a row just added, a changed value shows changed, a removed thing is gone with Undo lit | 12 |
| R0034 | D726 | design | 10 Oct 26 | silent | Asking the design guide to vet the Inputs calendar and the Inputs list — "every component including the text" — and for a mock-up of what it would improve: "I don’t like too wordy interface as well" \| The app's screens are not wordy: a label, a hint or a line of small print earns its place or goes — fewer words on screen, the same information. The agent's readings, to tell him… | 12 |
| R0035 | D672 | design | 8 Oct 26 | silent | The agent's readings, to tell him — what each page did, and does now: (1) the Leave War: D670 | 12 |
| R0036 | D349 | design | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (a) Escape and a tap outside still close the board as today | 12 |
| R0037 | D348 | design | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) "notification, notification" is the bell and the sync dot (the two round buttons at the bar's right) | 12 |
| R0038 | D347 | design | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the Leave War's pair leaves its Period row for the app's top bar, where Edit Schedule's pair sits (after the bell | 12 |
| R0039 | D2611 | how-we-work | 24 Nov 26 | silent | "Make sure all the other chats know that u are review this and it affects any new notes or words or bells. or old ones" (24 Nov 26, to chat 173, while the readings audit and the checking fix were starting) \| Every other chat is told that the readings review is running and that it covers the app's notes, words and bell lines, new and old: until the checking fix is live, a chat … | 12 |
| R0040 | D2611 | how-we-work | 24 Nov 26 | silent | old ones are the audit's, any it finds coming to him. The agent's reading: told by a message to each live chat and a line in the handoff file, so a chat started later sees it too. \| Stated on `.claude/rules/decisions/how-we-work.md` (§Order of work, beside D2567, D2610) | 12 |
| R0041 | D2610 | how-we-work | 24 Nov 26 | silent | I recommend yes" and "The audit's size: core first" — after he asked whether questions come only where there are differences, and was told: a match is silent, a clash with a clear ruling is a fault on the fix list, only a choice he never made comes as a question, and only where it changes what a person sees or gets) \| [READINGS-LAPSE-FIX] goes ahead as Fable's two plans give, … | 12 |
| R0042 | D2610 | how-we-work | 24 Nov 26 | silent | (2) the audit runs its core first — OIL, the published schedule, who may do what, SANS and inputs, the bell, and every builder's reading left in the code — the rest waiting until the core shows how big the problem is | 12 |
| R0043 | D2610 | how-we-work | 24 Nov 26 | mixed (both words in one clause) | a low-harm question comes in one list he can take whole, never round after round. The agent's readings, told to him: a clash with a clear ruling is filed as a fault, not asked | 12 |
| R0044 | D2610 | how-we-work | 24 Nov 26 | mixed (both words in one clause) | a reading that changes nothing a person sees or gets is not put to him. \| The plans `raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md` and `raptor-port/docs/superpowers/plans/2026-11-24-rulings-audit-plan.md` | 12 |
| R0045 | D2567 | how-we-work | 24 Nov 26 | silent | So we should also ask fable to plan and review and ask opus to be the workers for it" (24 Nov 26, to chat 169, after the investigation of why the SANS reminder counted ground rows) \| Fable fixes the lapse that let a builder's reading pass as his rule through every layer — it reads the investigation, finds the best fix, the rules made clearer if needed — and plans and reviews a… | 12 |
| R0046 | D2567 | how-we-work | 24 Nov 26 | silent | the chat: a session of its own (the agent's reading of "another chat or this chat"). | 12 |
| R0047 | D2444 | how-we-work | 24 Nov 26 | silent | that walk is listed among the reads owed for him to call or drop. The agent's readings: it settles the case D2443 left open, by D90's rule that such a case goes to him | 12 |
| R0048 | D2480 | how-we-work | 24 Nov 26 | the row says told | the sign-in card shown early is not built, the app having no sign-in once in Power Apps. The agent's readings, told to him: (1) "not built" for the early sign-in card is the agent's reading of his remark: it was the fourth idea, recommended as a cheap extra, and his remark confirms its gain ends at the move | 12 |
| R0049 | D2443 | how-we-work | 24 Nov 26 | the row says told | the walk goes ahead and is listed in [NO-ASTRA-LIST] for him to call or drop. Every walk's scenarios are designed by Astra and a fresh, blind Fable helper, each blind to the other, the host combining the two lists — whatever the work's risk, not only on high-risk work. The agent's readings, told to him, his to change: "the walk" is every check of the WALK or FULL tier, so a WA… | 12 |
| R0050 | D2441 | how-we-work | 24 Nov 26 | silent | I mean opus can write it first then fable reviews and adjusts it" (24 Nov 26, to the settings health-check chat, just after D2440) \| The words people read in the app — notifications, bell messages, notes, hints, warnings and rule text — are a Fable job: Opus writes the first draft, then a fresh Fable helper reviews and adjusts it before it reaches him. The agent's readings, no… | 12 |
| R0051 | D2440 | how-we-work | 24 Nov 26 | silent | for work the agent does not rank high risk, Fable is still used only on his call (D903). The agent's readings: D903 is not changed — D2258 is his standing call of Fable under it, as D2255's row reads it, and this ruling says that call has no end date | 12 |
| R0052 | D2393 | how-we-work | 23 Nov 26 | silent | he calls it for that. The agent's reading: an Opus chat drafting words for him may hand them to a Fable helper to reword before they go to him, on his word each time (Fable is on call only — D903, D2255). \| Stated on `.claude/rules/decisions/how-we-work.md` §Models and readers. | 12 |
| R0053 | D2269 | how-we-work | 22 Nov 26 | silent | "I want fable to build this cus many times opus did not do a good job for tough designs like this. can we do this task in a separate new chat" (22 Nov 26, to chat 132, of letting Edit Schedule's days run to the window's right edge under the folded CREW tab) \| A tough screen-design build — layout and how a screen fits together, such as Edit Schedule's right edge under the CREW … | 12 |
| R0054 | D2290 | how-we-work | 22 Nov 26 | the row says not told | How copies are made today is not checked (the agent's reading). | 12 |
| R0055 | D2264 | how-we-work | 22 Nov 26 | the row says told | "ok that would be good to use the server timing when we go to the database step." (22 Nov 26, to chat 132, after being shown that today each device decides "today" by its own clock, so two men on one detachment, one phone on home time and one on local, see different days for hours) \| At the database step the app takes the time from the server — read when a person signs in — ne… | 12 |
| R0056 | D2259 | how-we-work | 21 Nov 26 | the row says told | the fixes may go to parallel chats, the agent choosing each one's model. The agent's readings, told to him: it is his call of Fable for a wider read (D903, D1934) | 12 |
| R0057 | D2258 | how-we-work | 21 Nov 26 | silent | Medium (Opus, Astra reading) — screens, pages and lists built on the core's answers | 12 |
| R0058 | D2258 | how-we-work | 21 Nov 26 | silent | The agent's readings: it narrows D2255 and D2257 (Fable no longer does everything besides the walk) | 12 |
| R0059 | D2257 | how-we-work | 21 Nov 26 | the row says told | a Fable reader or designer is always a fresh, blind helper. The agent's readings, told to him: "likewise" gives D2255 the same end as D2256 — his word to change back — and "for the rest" is every job that is not the walk, on this build and after it | 12 |
| R0060 | D2256 | how-we-work | 21 Nov 26 | the row says told | then the walkers are Sonnet only again, as D787 ruled. The agent's readings, told to him: it narrows D787 and the walking part of D588 and D595 for the time being — D787's reason was the cost of an Opus walk, which his D2255 and D1033 set aside while his allowance resets last | 12 |
| R0061 | D2255 | how-we-work | 21 Nov 26 | the row says told | a Fable reader is always a fresh, blind helper, never the chat that wrote the piece. The agent's readings, told to him: it narrows D2244 (the chat in Opus, Opus building) for what is left of the reshape, until he says otherwise | 12 |
| R0062 | D2254 | how-we-work | 21 Nov 26 | the row says told | a copy for moving them is one private file on his PC, outside the project. The agent's readings, told to him: on the same PC the notes and the file stay where they are, so the private file is a backup | 12 |
| R0063 | D2244 | how-we-work | 20 Nov 26 | silent | recommended Opus, high, building, Fable reading the core's rights change mid-build and in the final read) \| The reshape build (D2238): Opus, high thinking, builds and the chat starts in Opus, not Fable | 12 |
| R0064 | D2244 | how-we-work | 20 Nov 26 | the row says told | the four-reader fix read at the end stands (D2236). The agent's readings, told to him: his call of Fable is for this build only (D903, D1770 — Fable reads nothing unless he calls for it) | 12 |
| R0065 | D2238 | how-we-work | 20 Nov 26 | the row says told | The agent's readings, told to him: the plan is written first and nothing of the reshape is built before its read | 12 |
| R0066 | D2237 | how-we-work | 20 Nov 26 | the row says told | recommended: one whole read of them by the readers who never had, rather than re-reading the past rounds) \| The multi-squadron build's three core files (`state/perms.ts`, `state/notices.ts`, `state/units.ts`) are read whole, as they stand, by a fresh Opus reader, the security reader and Astra, blind to each other, beside fix read 17 — the catch-up for the rounds that ran witho… | 12 |
| R0067 | D2236 | how-we-work | 20 Nov 26 | the row says told | The agent's reading, told to him: Astra's stops stay accepted under D2232. \| the general page `.claude/rules/decisions/how-we-work.md` §Models and readers (D2236) | 12 |
| R0068 | D2235 | how-we-work | 20 Nov 26 | the row says told | The agent's readings, told to him: "the rest" is the batch's app code changed against `main` outside the three sampled files (about 3,200 lines in 80 files, tests excluded), each reader given all of it with the same brief in the fix reads' shape | 12 |
| R0069 | D2234 | how-we-work | 20 Nov 26 | the row says told | The agent's readings, told to him: the sample is one slice of the batch's own code, not only the latest fixes — the cross-squadron rules at the commit gate and the bell (`state/perms.ts`, `state/notices.ts`, `state/units.ts`), the riskiest part — read blind with a brief in the fix reads' shape | 12 |
| R0070 | D2233 | how-we-work | 20 Nov 26 | the row says told | The agent's readings, told to him: "a repeat" is judged by the host when it reproduces a finding — the same harm by the same door, even if the reader names it afresh — and named as such in the fix brief | 12 |
| R0071 | D2232 | how-we-work | 20 Nov 26 | the row says told | recommended: accept, since Astra still saves real findings before it stops and three other readers cover the rest) \| When Astra's service stops it mid-read in the multi-squadron build's fix reads, the stop is accepted: the findings it saved before the stop are reproduced like any reader's, no other reader takes its seat, and its brief is never reworded to get past the stop. Th… | 12 |
| R0072 | D2231 | how-we-work | 20 Nov 26 | the row says told | "Approve" (20 Nov 26, to chat 121 — the skill-notes review of 20 Nov 26, its drafts fixed after Astra's and a fresh, blind Opus reader's reads, put to him with the four places the fixes changed what he had approved) \| His final approval of the 20 Nov 26 skill-notes review's drafts, as fixed after Astra's and the fresh Opus reader's reads: they are installed on the review branc… | 12 |
| R0073 | D2230 | how-we-work | 20 Nov 26 | the row says told | the reviewers' recipe and briefs, the records and the tools) \| His go stands for the jobs the skill-notes reviews of 13 Oct and 20 Nov 26 filed: the 20 Nov review's four rounds approved whole, as recommended. The agent's readings, told to him: the guide drafts still go to Astra and a fresh, blind Opus reader before his final approval (D1761, D1770), and live only on his "merge… | 12 |
| R0074 | D2229 | how-we-work | 20 Nov 26 | the row says told | recommended a trial at 600,000 beside cutting what a job loads at its start) \| Every chat in this project compacts at about 600,000 tokens, a trial: the project's compaction window 600,000, so the first note comes at about 450,000, the hold until the state is saved from about 540,000, the app's own compaction at about 576,000, and the guard never holds past about 612,000. The … | 12 |
| R0075 | D2224 | how-we-work | 19 Nov 26 | the row says told | The agent's readings, told to him: "bug checks" means each code read of the build's bug checks — a batch's FULL read and each fix read after it — not the walks (Sonnet's, D588) nor a plan's red team | 12 |
| R0076 | D2210 | how-we-work | 19 Nov 26 | the row says told | "Just call Astra 6.1 cus the new model Astra 6.2 just came out and I heard it's unreliable" (19 Nov 26, to chat 109, told that tonight's Astra reads ran on GPT-6 Astra and that his PC's Codex default is GPT-6.1 Sol) \| Astra's reads run on GPT-6 Astra, named by hand in every Codex call (`-m gpt-6-astra`), never on the new GPT-6.2 Astra, until he says otherwise. The agent's read… | 12 |
| R0077 | D2209 | how-we-work | 19 Nov 26 | the row says told | one narrow question is added — does that change record cover every table the app uses. The agent's readings, told to him: the risk is a signed-in person saving outside the app's screens from the browser's developer tools, with his own near-full access (the code-apps research, §Security) | 12 |
| R0078 | D2188 | how-we-work | 17 Nov 26 | the row says told | "I want u to show me again what we agreed on with the mock up specific to what we are building for this turn before we start for each batch" (17 Nov 26, to chat 105, with D2186 and D2187) \| Before each batch of the multi-squadron and detachment build starts, he is shown again what was agreed for that batch, with a mock-up of just what that batch builds, and the build starts on… | 12 |
| R0079 | D2187 | how-we-work | 17 Nov 26 | the row says told | The agent's readings, told to him: until the database step the build saves in the browser as the whole app does today — both squadrons can be seen and worked on one PC, but another person's PC sees nothing of it until the database | 12 |
| R0080 | D2185 | how-we-work | 17 Nov 26 | silent | Fixed the same day: round 7's page, 23 places rewritten (the agent's reading of which name he meant, from his picture). \| `.claude/rules/decisions/how-we-work.md` §Showing him, on D2164's line (D2185) | 12 |
| R0081 | D2164 | how-we-work | 17 Nov 26 | silent | The agent's readings: a ruling number may stand only as a small grey reference after an item, never inside its sentence | 12 |
| R0082 | D2159 | how-we-work | 17 Nov 26 | silent | "the next chat is going to be round 7. all changes in round 6 will be normal colour any new changes will be highlighted. so i know through the codex review what is new" (17 Nov 26, to chat 100, planning the multi-squadron design's round 7) \| In each new round of a mock-up or questions page, what earlier rounds changed is shown in the normal colour and only what is new since th… | 12 |
| R0083 | D2148 | how-we-work | 17 Nov 26 | silent | The agent's readings: "the ruling" means the rulings page's size limit he was just told of | 12 |
| R0084 | D2143 | how-we-work | 17 Nov 26 | the row says told | The agent's reading, told to him: for the squadrons design each proposal names what it does to the other squadron's schedule, published days and their sign-offs, OIL, the Leave War's manning, inputs, the bell and Undo, as the standing order to weigh the whole ecosystem (28 Aug 26) and `raptor-port/docs/feature-impact.md` already ask. \| How we work `.claude/rules/decisions/how-… | 12 |
| R0085 | D2140 | how-we-work | 17 Nov 26 | the row says told | The agent's reading, told to him: the chat was 89% full | 12 |
| R0086 | D2043 | how-we-work | 14 Nov 26 | the row says not told | nothing is installed or adopted without his word. The agent's reading, not checked with him: the trial waits behind the jobs in hand (the rules check's batch first) and is a cheaper-model job only where D588 allows. \| `.claude/rules/decisions/how-we-work.md` §Order of work (D2043) | 12 |
| R0087 | D2032 | how-we-work | 13 Nov 26 | silent | a push that changes the app still builds its preview, and a merge its live app. The agent's readings: "only notes" is to follow the notes-only list of the shipping rule as far as Vercel can tell it from the changed files — the build decides the exact list and says it | 12 |
| R0088 | D1987 | how-we-work | 11 Nov 26 | silent | "For all the rules u are about to put in the list in the repo or anywhere make sure its concise, clear and not with a lot of words" — to chat 64, as it recorded D1984 to D1986 and saved his rules-check answers for the next chat to record. \| Every rule written into the rulings list, the repo or anywhere is concise and clear, in few words. The agent's reading: it holds for a pag… | 12 |
| R0089 | D1980 | how-we-work | 10 Nov 26 | silent | The agent's readings: (1) "at night" is every unattended run, as D596's own reading has it — an `/overnight` run or a job he leaves while away | 12 |
| R0090 | D1979 | how-we-work | 10 Nov 26 | silent | its four densest paragraphs are not reworded. The agent's readings: (1) the list is the plan file named in the next cell, its sections B, C and D | 12 |
| R0091 | D1978 | how-we-work | 10 Nov 26 | silent | "As recommended" — to chat 59's list for the session-handoff skill ([SKILLS-TIGHTEN] step 2: what would leave, what is stated two or three times, what is said shorter, and five places where the skill has fallen behind a later ruling), which asked whether to go ahead as recommended and named the third correction, the one addition, as the part he might hold back \| The session-ha… | 12 |
| R0092 | D1975 | how-we-work | 10 Nov 26 | the row says told | filed as a job of its own, the design guide first. The agent's readings, told to him: "remove" is moved whole to an archive, never deleted (D138, D141) | 12 |
| R0093 | D1973 | how-we-work | 10 Nov 26 | the row says told | a job opens either page by hand before changing what it governs. The agent's reading, told to him: his words hand the choice over rather than answer yes | 12 |
| R0094 | D1960 | how-we-work | 10 Nov 26 | silent | The agent's readings: nothing a job must read is cut (D68) | 12 |
| R0095 | D1951 | how-we-work | 10 Nov 26 | silent | never a nearer picture of the other device. The agent's reading, from the skill note behind the question (731): name the device and width of his picture before answering, and where the case needs data the demo lacks, set it up through the app's own windows rather than swap in another picture. \| The How we work page, `.claude/rules/decisions/how-we-work.md` (D1951), under Showi… | 12 |
| R0096 | D1949 | how-we-work | 10 Nov 26 | the row says not told | The agent's reading, not asked: the job changes what loads, so Astra and a fresh Opus reader read it, each blind (D1739, D1761), and it goes live on his "merge live" (D1737) | 12 |
| R0097 | D1934 | how-we-work | 8 Nov 26 | silent | So we dont waste so much tokens on fable?" — typed in chat 37 (about 23:00), after it had started fourteen Fable readers and Astra on every pull request merged that day under D1933 \| A review of a day's merged work starts with a small handful of checks on the riskiest code — the app's own checks and a few reads — and Fable reads nothing wider until that handful shows a fault a… | 12 |
| R0098 | D1941 | how-we-work | 8 Nov 26 | silent | the exact detail of what is built (screen words, sizes, places, button order) lives in the app and its tests, and his words, the history and the agent's readings in the full rows, never deleted | 12 |
| R0099 | D1941 | how-we-work | 8 Nov 26 | silent | Tonight: the agent's readings that read as his rule, and any statement whose meaning changed, are fixed on the three trimmed pages | 12 |
| R0100 | D1941 | how-we-work | 8 Nov 26 | silent | the readers' other findings, detail moved to the rows, are held, not restored. The agent's readings: the test for a line is "without it, would a fresh model likely do the wrong thing, and would no test catch it?" | 12 |
| R0101 | D1932 | how-we-work | 8 Nov 26 | silent | No further area is converted until the six pages are back under their old sizes and he has seen the measure. The agent's reading of "fix it", not yet confirmed by him: trim the pages (the copies of other areas' rules, the agent's readings spelled out, the settled lists go back to pointers, then tighter wording) rather than undo them to the old lists | 12 |
| R0102 | D1930 | how-we-work | 8 Nov 26 | silent | The agent's reading: built by a fresh chat (33), not chat 27. | 12 |
| R0103 | D1797 | how-we-work | 8 Nov 26 | the row says told | if it works, every chat adopts it: the chats open now run each walk not yet started in the cloud, and the walking instructions for every later chat say so once the working-guide change is read and he approves it. The agent's readings, told to him: (1) "works" means a cloud walker builds the app, runs a walk with pictures he and the host can open, and is started by a chat on it… | 12 |
| R0104 | D1794 | how-we-work | 8 Nov 26 | the row says told | I dont want to spend more than the current plan i subscribed" — after he upgraded Vercel to Pro that morning (Vercel had begun refusing builds at the free plan's 100 a day), on being told that Pro also bills each build beyond its included usage \| Vercel is on its Pro plan from 8 Nov 26, and he will not spend more on it than the plan he subscribed to: US$20 a month, its include… | 12 |
| R0105 | D1763 | how-we-work | 8 Nov 26 | silent | Sol 6.1 is not added as a third reader, not even inside D1743's window. It confirms the agent's reading the page held (D1738, D1739, D1743) and changes no ruling: D1743's call for Sol 6.1 where a second reader fits stands elsewhere until Mon 9 Nov 26 19:00, and where two readers are required the second seat stays as D1770 sets it. \| `.claude/rules/decisions/how-we-work.md` (§R… | 12 |
| R0106 | D1770 | how-we-work | 8 Nov 26 | the row says told | The agent's readings, told to him: Sol 6.1 is not named, so after Mon 9 Nov 26 19:00 he is called only when he calls for him (D1734), and where two readers are required the fresh, blind Opus reader keeps the second seat (as D1739 has it for the rules diet) | 12 |
| R0107 | D1761 | how-we-work | 8 Nov 26 | the row says told | "3 call in Astra" — his answer, 8 Nov 26, to chat 2's morning question on a working-guide change read without Astra and Sol 6.1, where the page held the agent's reading that a fresh, blind Opus reader reads it and the reads it went without go on the owed list, recommended to be confirmed \| Every working-guide change is read by Astra before his approval, one round, never by its… | 12 |
| R0108 | D1761 | how-we-work | 8 Nov 26 | silent | It replaces the agent's reading on the step-4 page (a fresh, blind Opus reader alone, the reads owed listed). \| `.claude/rules/decisions/how-we-work.md` (§Models and readers, and the Impeccable line — D1761) | 12 |
| R0109 | D1746 | how-we-work | 7 Nov 26 | silent | The agent's readings: (1) the merge lock is the checks lock's own script run on a folder of its own — RAPTOR_GATE_LOCK set to `C:/Users/User/.raptor-merge-lock`, then `gatelock.mjs take` and `release` — so a merge never waits behind a check run | 12 |
| R0110 | D1753 | how-we-work | 8 Nov 26 | the row says told | if the IT side later sets a different one for their tables, the app's table names are changed once to match theirs. The agent's readings, told to him: (1) the short code is the few letters the database puts in front of every table and column name | 12 |
| R0111 | D1752 | how-we-work | 8 Nov 26 | the row says told | The agent's readings, told to him: (1) the IT side's audit is their own record of every change, which the button never touched, so removing it hides nothing and keeps the app's history in step with theirs | 12 |
| R0112 | D1749 | how-we-work | 7 Nov 26 | the row says told | nothing of the database is built there before that step. The agent's readings, told to him: (1) D473, D1662 and D1682 stand — before the database step only the hosting trial (the app with no database) goes on that account, once he has it (not yet, his "3. not yet") | 12 |
| R0113 | D1745 | how-we-work | 7 Nov 26 | the row says told | "Nvm it’s not a hard deadline disregard rushing" — his answer, in chat 1 (reading the M365 data package), when asked what "ready by February 2027" means: live with real data, built and running on a test M365, or the tables handed to the IT side \| February 2027 is not a deadline: the M365 and database work is planned by what it needs, never squeezed to a date, and no step is ru… | 12 |
| R0114 | D1744 | how-we-work | 7 Nov 26 | silent | each chat says its number when it reports to him, and the handoff file keeps the next free number. The agent's reading: the number leads the chat's title, which the app shows in its list of chats (for example "1 · M365 package"), and the chat that starts another gives it the next free number from the handoff file | 12 |
| R0115 | D1742 | how-we-work | 7 Nov 26 | silent | The agent's readings: (1) merging otherwise stays as it is — his look before anything goes live by day, "auto merge live" for a night or run he leaves alone (D1093) | 12 |
| R0116 | D1740 | how-we-work | 7 Nov 26 | the row says told | "Approve it" — his answer when the skill-notes short form's wording was put to him, with the file, after Astra's and a fresh Opus reader's blind reads and every finding fixed (`raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step2-short-texts.md` part E) \| The skill-notes short form's wording is approved as drafted and read: every chat gets `.claude/skills/task-obser… | 12 |
| R0117 | D1739 | how-we-work | 7 Nov 26 | silent | Like needing to rephrase and summarise things so that it doesn’t change its meaning" — after being told the skill-notes guide is cut to its short form in the rules diet's step 2, read by a fresh reader \| — NARROWED 8 Nov 26 BY D1761: text a diet step moves whole out of a working guide is a guide change, so Astra reads it too (the agent's reading). Every step of the rules diet … | 12 |
| R0118 | D1739 | how-we-work | 7 Nov 26 | the row says told | The agent's readings, told to him: (1) what rewords nothing keeps the one fresh Opus reader (D1736) — text moved whole (D138) and step 1's checks and scripts | 12 |
| R0119 | D1738 | how-we-work | 7 Nov 26 | the row says told | The agent's reading, told to him: if Astra cannot run (his ChatGPT plan's limits), he is told before the page goes on, rather than it going on without that read. \| `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §8 question 4, §7 step 5b (D1738) | 12 |
| R0120 | D1735 | how-we-work | 7 Nov 26 | the row says told | The agent's readings, told to him: the work runs in the plan's order (§7) — the checks and scripts, the moves, reading by section, the every-chat layer, OIL first as a full trial, the smaller areas, then a measure and a report to him before the Inputs, scheduler and Leave War pages — about 21 to 23 chats | 12 |
| R0121 | D1734 | how-we-work | 7 Nov 26 | silent | The agent's readings: his naming Astra for the rules diet (D1732) is such a call | 12 |
| R0122 | D1732 | how-we-work | 7 Nov 26 | silent | The agent's readings: (0) Opus with high thinking, in a fresh chat, is the agent's advice, not his words | 12 |
| R0123 | D1733 | how-we-work | 7 Nov 26 | silent | each older one moves whole to its archive file, so a new chat no longer reads about 50 stale entries each headed "latest". The agent's readings: 85 lines moved whole and unchanged by the move tool (D138), the file from about 52,000 to 21,000 characters | 12 |
| R0124 | D1671 | how-we-work | 7 Nov 26 | the row says told | backstop about 612,000), a trial. Every chat in this project compacts at about 400,000 tokens: the project's autoCompactWindow is 400,000, not 880,000, so the first reminder (about 300,000), the hold until the state is saved (from about 360,000) and the app's own compaction (about 384,000) all come with it. The agent's readings, told to him: the compaction hooks read the setti… | 12 |
| R0125 | D1682 | how-we-work | 5 Nov 26 | silent | "I havent got the test account yet. so ill let u know when im ready to start it on the m365" — to the agent's proposal of the M365 hosting trial as the next task \| The M365 hosting trial (D1532) waits until he has his test account and says he is ready: no chat starts it, plans it or asks him about it before then. The agent's reading: D1532's "at a good stopping point, the agen… | 12 |
| R0126 | D1580 | how-we-work | 3 Nov 26 | silent | Agent's reading, not his words: it is the direction `raptor-port/docs/architecture-direction.md` already sets (ONE database, one record per fact — the one absence record, [ARCH-STACK] step 4 | 12 |
| R0127 | D1571 | how-we-work | 2 Nov 26 | the row says told | "2" — "Later, at the database step", to the agent's question whether to run a small two-table test of the table setup script's sign-in in his personal environment now \| — ANSWERED 7 Nov 26 BY D1749: the table setup is the IT side's own kit, run first in his own test account at the database step, and the handover is the table list in the kit's format, not a managed package — re… | 12 |
| R0128 | D1570 | how-we-work | 2 Nov 26 | the row says told | no licence stands in the way of the move. The agent's readings, told to him: (1) Premium is what Microsoft's code-apps page requires of every end user (checked 2 Nov 26, learn.microsoft.com "Power Apps code apps overview") | 12 |
| R0129 | D1557 | how-we-work | 2 Nov 26 | silent | I seriously wonder we need to revisit how you walk" \| Every walk of a screen includes a plain-user round: the area's everyday tasks done start to finish as a user would, pressing every control that opens or closes something, then every other place that should show the result looked at — the Inputs page, the schedule, the bell, the person window, another year or period — with p… | 12 |
| R0130 | D1554 | how-we-work | 1 Nov 26 | the row says told | The agent's readings, told to him: (1) the trim is its own documents-only job in a fresh chat, beside the Leave War's next batch, each move checked for meaning by one fresh reader (D138, D971) | 12 |
| R0131 | D1540 | how-we-work | 31 Oct 26 | silent | he switches it on himself in GitHub's settings, from the steps the agent gives him. The agent's readings, not yet checked with him: (1) it answers D1535's third reading (a required check was a separate setting, not yet approved) | 12 |
| R0132 | D1539 | how-we-work | 31 Oct 26 | silent | this is his permission to change the project's hooks and settings for the session run, read by one fresh reader before it is switched on. The agent's readings, not yet checked with him: (1) the GitHub check runs `npm run lint:changed` against `main` and fails on a new finding, its first red proved on a planted finding | 12 |
| R0133 | D1537 | how-we-work | 31 Oct 26 | silent | So it's robust" (the M365 plan's point 16): strict checking for the app, the rules engine left as it is, protected by the original's 728 tests \| The app's code moves to strict checking of every value's kind — new code strict from the start, the screens, saved data and the Leave War fixed area by area as each is next worked on — but the rules engine stays word for word, its che… | 12 |
| R0134 | D1536 | how-we-work | 31 Oct 26 | silent | the PPCoE gets a clean copy, this project kept whole. The agent's readings, not yet checked with him: (1) the aircraft-type setting is built at the database step or at hand-over, not now (filed as [AIRCRAFT-TYPE-SETTING]) | 12 |
| R0135 | D1535 | how-we-work | 31 Oct 26 | the row says told | "sure u can have github secret scanning" — to the agent's report that GitHub's own secret scanning and push protection are off on the project (free on a public one) and are his to approve, beside the new secrets scan (D1408) \| — ANSWERED 31 Oct 26 BY D1540: the project's own secrets scan becomes a required check on `main`. GitHub's own secret scanning is switched on for the pr… | 12 |
| R0136 | D1534 | how-we-work | 31 Oct 26 | silent | the other areas' remaining findings ride with each area's next batch (D490). The agent's readings, not yet checked with him: (1) his words that the Tracker's current screens stay and more things will be linked to it are why the whole Tracker is in the batch | 12 |
| R0137 | D1533 | how-we-work | 31 Oct 26 | silent | the night's run with every outside connection off is no longer required. The agent's readings, not yet checked with him: (1) "as mentioned" covers the findings sent for the score — the kit's own way, its usage tracking off as the kit has it | 12 |
| R0138 | D1532 | how-we-work | 31 Oct 26 | the row says told | at a good stopping point in the Tracker's work the app is first put on his own M365 subscription with no database — a hosting trial: it runs inside Power Apps and still saves in the browser as today, so he can test it there himself. The agent's readings, told to him: (0) he tests Microsoft's sign-in, his iPhone and the Power Apps player there | 12 |
| R0139 | D1531 | how-we-work | 31 Oct 26 | silent | it changes nothing in the app, runs with its tracking off, and comes from the same public package store as the app's other building tools. The agent's readings: (1) this is a permission to run and count, not a ruling that new code follows its rules — that waits for him once the plan shows the count | 12 |
| R0140 | D1530 | how-we-work | 31 Oct 26 | mixed (both words in one clause) | Vercel and the public project stay as they are until he says otherwise. The agent's readings, told to him: (1) "for now" means until he raises it again — the agent does not put these three back to him unasked | 12 |
| R0141 | D1530 | how-we-work | 31 Oct 26 | the row says not told | (4) the kit's own files, marked OFFICIAL (CLOSED) and "inside MINDEF/SAF only", are not put into the public project — the agent's reading of keeping the project public, not checked with him. | 12 |
| R0142 | D1508 | how-we-work | 29 Oct 26 | silent | The agent's reading: the look is its own job in a fresh session, so the M5b branch's fixes are not held up. | 12 |
| R0143 | D1496 | how-we-work | 29 Oct 26 | silent | "Also I would like all mockups to standardise the design to the rest of the app." — said with his "Yes" to the drawing check (D1495), after its page showed M5a's drawings and build differing part by part \| Every mock-up's design is standardised to the rest of the app: each part drawn the way the app already draws that kind of part, so a design is the app's own, not a new look.… | 12 |
| R0144 | D1494 | how-we-work | 29 Oct 26 | the row says told | "All as recommended." — to building a drawing check as its own job, after he asked whether updating Impeccable would stop builds drifting from their drawings and was told it would not \| A drawing check is built as its own job: a script that measures a built screen against its approved drawing — where each part sits, its size, colour and text alignment — at his iPhone's and a d… | 12 |
| R0145 | D1478 | how-we-work | 28 Oct 26 | silent | The agent's readings: the check is a side-by-side picture of the approved drawing and the new one, made before the page is published, every difference named on it | 12 |
| R0146 | D1443 | how-we-work | 28 Oct 26 | the row says told | "Shouldnt u tell me what jobs u are doing too?" — two hours into the night of 27–28 Oct 26, whose message named the work (carry on M4's bug check) and was started, as the overnight guide allows, without laying out its jobs \| When his overnight message names the work, the agent still tells him the night's jobs before it starts — numbered, in order, each with what he will have i… | 12 |
| R0147 | D1426 | how-we-work | 27 Oct 26 | the row says not told | an outright fault (words breaking, something covered or off screen, a wrong behaviour) is fixed without asking. The agent's reading: this narrows D1424 for a difference found after the build: nothing is put back to the drawing until he has seen it | 12 |
| R0148 | D1424 | how-we-work | 27 Oct 26 | mixed (both words in one clause) | a departure is made only on purpose, for a better design, and is named to him with its picture and its reason — never left for him to find. The agent's reading: his second message allows a better idea without asking first, so a deliberate departure goes ahead and is shown to him at the latest with the work's look, named as a departure | 12 |
| R0149 | D1417 | how-we-work | 27 Oct 26 | the row says told | The agent's readings, told to him: (1) the fresh reader is handed only his words, the option he picked and the line | 12 |
| R0150 | D1416 | how-we-work | 27 Oct 26 | the row says told | The agent's readings, told to him: (1) a whole night ran that way, weekly use going from 13% to 16% for its first three jobs | 12 |
| R0151 | D1415 | how-we-work | 27 Oct 26 | the row says told | The agent's readings, told to him: (1) he was told the cost first — a night that runs to the limit can leave him no allowance between the night's end and the reset — and chose it | 12 |
| R0152 | D1411 | how-we-work | 27 Oct 26 | silent | The agent's reading: "touches" is any change to `src/state/perms.ts`, the sign-in, the accounts pages or a rule of who sees a medical or personal record. | 12 |
| R0153 | D1410 | how-we-work | 27 Oct 26 | silent | a change that catches fewer is not kept. (That last clause is the agent's reading of what the score is for | 12 |
| R0154 | D1407 | how-we-work | 27 Oct 26 | silent | anything that changes the app still waits for his word. "Only notes" (the agent's reading, from the page's "rulings, handoffs, backlog, evidence sheets" | 12 |
| R0155 | D1297 | how-we-work | 24 Oct 26 | the row says not told | U should learn it and fix your debugging automatically" — the morning of his iPhone look at the Leave War M3 build, after asking whether a full walk had been done before the day-line fault (D1296) \| Every fault he finds that a bug check's walk missed is learned from by itself, the same day, without asking him: why the walk missed it is written as a lesson in the bug-check orde… | 12 |
| R0156 | D1104 | how-we-work | 21 Oct 26 | the row says told | efficiency is judged by the weekly usage figure, not a token count, and no work is cut to save allowance (D1033). The agent's readings, told to him: (1) Low means, a job: one builder helper, one Sonnet walker, one fresh Opus reader (the reader must not be the builder, D67) | 12 |
| R0157 | D1281 | how-we-work | 23 Oct 26 | silent | The agent's readings: "right after" is within about 100 ms of the lift, with the pointer left where it pressed (an iPhone keeps the pressed thing "hovered" until the next tap) | 12 |
| R0158 | D1273 | how-we-work | 23 Oct 26 | the row says told | and the host saves tokens by cropping a picture to the area that matters before opening it, never by handing a deciding picture to Sonnet. The agent's reading: a crop keeps the whole of the place being judged (a fault and what is beside it), and a whole screen is opened only when the question is about the whole screen — as his D1222 already says of the pictures put to him. \| `… | 12 |
| R0159 | D1271 | how-we-work | 23 Oct 26 | silent | The agent's reading: picking or cropping pictures for his look may go to Sonnet | 12 |
| R0160 | D1237 | how-we-work | 22 Oct 26 | silent | answered and older rounds go below it. The agent's readings: the list is rebuilt at every new version, so nothing he asked about sits inside an older section | 12 |
| R0161 | D1222 | how-we-work | 22 Oct 26 | silent | a whole screen is shown only when the question is about the whole screen. The agent's readings: a before / after pair differs in only the thing asked (as the Q9 pair, `raptor-port/docs/mock/lw-overhaul/full/r11-q9-`) | 12 |
| R0162 | D1195 | how-we-work | 21 Oct 26 | silent | The agent's readings: a new chat checks it at its start and, where it is off, switches it on for itself | 12 |
| R0163 | D1124 | how-we-work | 21 Oct 26 | silent | The agent's readings, to tell him: (1) a look changes nothing (the design guide's rule 7) — findings in rounds of at most four, each with its picture | 12 |
| R0164 | D1097 | how-we-work | 21 Oct 26 | silent | "anyway could u send me notification whenever u are completed and need my next step or just need my input or question etc." — sent mid-job (the Insights and Logic small fixes). \| The agent sends him a phone notification whenever it stops and needs him — the work finished and waiting on his next step, or a question, an answer, a look or any other input from him — and not for pr… | 12 |
| R0165 | D1093 | how-we-work | 20 Oct 26 | silent | work outside that run still waits for his "merge live". A correction of the agent's narrow reading of D1092 (only the three jobs). | 12 |
| R0166 | D1093 | how-we-work | 20 Oct 26 | silent | The agent's reading: a records-only pull request of that run merges on its documents guard's green, as the jobs did on their whole run's. \| `.claude/rules/shipping.md` (§"Done" means LIVE — D1093) | 12 |
| R0167 | D1091 | how-we-work | 20 Oct 26 | silent | the pictures stay in the project and its history, nothing deleted. The agent's reading: "don't download" is for the check machines, the place the time is lost | 12 |
| R0168 | D1033 | how-we-work | 19 Oct 26 | silent | the reading below that kept the 90% stop where the reset falls after the run would end no longer holds. Using up his weekly allowance before it resets is his aim: work is not held back, cut down or stopped early to save allowance that would reset anyway | 12 |
| R0169 | D1033 | how-we-work | 19 Oct 26 | the row says told | The agent's readings, told to him: it holds for every run, not only tonight's | 12 |
| R0170 | D1024 | how-we-work | 18 Oct 26 | silent | finished work leaves it for the archive, and the stories of how work went live stay in git, the evidence sheets and the archive. The agent's reading: it holds for every later change to the list, not only this tidy | 12 |
| R0171 | D994 | how-we-work | 18 Oct 26 | the row says told | meanwhile the agent goes on with work that needs no answer or look from him. He chose to do the small things next ("Ok can I do the small things next", the same day) — setting aside D490's "small finds ride with their area's feature batch" for this job, the agent's reading told to him | 12 |
| R0172 | D991 | how-we-work | 18 Oct 26 | the row says told | The agent's readings, told to him: it weighs for the big step on the chart (the iPhone's own scrolling, 120 frames) over the small one (held at 60 in Chrome on his iPhone), but replacing D990's order is still put to him | 12 |
| R0173 | D976 | how-we-work | 17 Oct 26 | silent | and the push-and-lock guard is built as proposed, read by one fresh reader before it is switched on — his permission to change the project's hooks and settings for it. The agent's readings: (1) the guide wording is the one committed after the fresh reader's four findings were fixed (D70, D790) | 12 |
| R0174 | D975 | how-we-work | 17 Oct 26 | silent | So I'm just pasting the prompt u hand me" (this chat's switch to its branch had been refused because the last chat still held it) \| No handoff asks him to pick a branch or tick a worktree, since the new-chat screen has neither: the outgoing chat releases its branch as its last step once everything is pushed, and the opening line he pastes makes the new chat switch to that bran… | 12 |
| R0175 | D971 | how-we-work | 17 Oct 26 | silent | one fresh reader checks each before it moves, and a ruling the later one only narrows stays. The agent's readings: (1) "restates in full" means every point the earlier ruling still requires — each "if", "until", "except" and example that still applies — is said by the later ruling or rulings | 12 |
| R0176 | D970 | how-we-work | 17 Oct 26 | silent | no word is changed for it, and the rulings already written are turned into ordinary letters the same way. The agent's readings: (1) the change is the letter case only — a check compares every changed line with its old text in lower case and must find them equal, so no word is added, dropped or moved (D138) | 12 |
| R0177 | D969 | how-we-work | 17 Oct 26 | silent | the scheduler split waits for a new measure. The agent's readings: (1) B is the standing rule (DECISIONS.md step 2) carried out — each full row opened and read sentence by sentence before its SPENT mark | 12 |
| R0178 | D942 | how-we-work | 16 Oct 26 | the row says told | the editing hint already removed (D938) stays removed, as its own one-off ruling. The agent's readings, told to him: (1) "this lesson" is the line put to him — the guide's §9, lesson 1 — and the strike is the one D941 gave him | 12 |
| R0179 | D941 | how-we-work | 16 Oct 26 | silent | The agent's readings: (1) a lesson that narrows a rule already in the guide says so in its line, and the rule it narrows gets a pointer to it | 12 |
| R0180 | D921 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: (1) the same pictures as D853's — his phone's size, the place outlined | 12 |
| R0181 | D886 | how-we-work | 15 Oct 26 | silent | The agent's reading: "next time" is his next sitting at the PC, not a fixed date | 12 |
| R0182 | D885 | how-we-work | 15 Oct 26 | silent | and the next /overnight run tries the overloaded-retry setting for one night, checked the next morning before it is kept. The agent's readings: the command is his to type (an agent cannot run it) | 12 |
| R0183 | D884 | how-we-work | 15 Oct 26 | silent | The agent's readings: the state is already written to the repo at every commit and handed back after any compaction (the compaction set-up, D870), so an idle compaction loses only what was not yet written | 12 |
| R0184 | D878 | how-we-work | 15 Oct 26 | silent | the design guide's "one mark, one look" wording (version 2, after one fresh reader) with five clauses named as the agent's readings | 12 |
| R0185 | D878 | how-we-work | 15 Oct 26 | the row says told | this is his permission to change the project's hooks for that fix, which is tested and read by one fresh reader before it is switched on. The agent's readings, told to him: the first note at about 75% of the app's room (about 660,000, some 185,000 before the compaction at about 845,000), the guard's window from there to the compaction point | 12 |
| R0186 | D874 | how-we-work | 15 Oct 26 | the row says told | The agent's reading, told to him: the judgement is the agent's — a step finished and pushed with the next one large enough to be worth a fresh start is such a point, mid-job included | 12 |
| R0187 | D872 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: "off" is a mark the agent sets at the start of an unattended run and clears when he is back (it lapses by itself after sixteen hours) | 12 |
| R0188 | D871 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: (1) "nearly done" means the work left fits in the room left before the app's own compaction, with the handoff written — the agent says its judgement in one line when it asks | 12 |
| R0189 | D870 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: whatever cannot be shown to work in the desktop app falls back to the simpler half (the lowered point, the state saved at every clean point), and nothing in it may make compaction later than the app's own 97%. \| `raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md` (the design — D870) | 12 |
| R0190 | D868 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: (1) the agent cannot press "compact" itself today | 12 |
| R0191 | D867 | how-we-work | 15 Oct 26 | the row says told | The agent's readings, told to him: (1) "how many jobs we can do" — each recommended job carries a rough time (from the walk ledger, or marked a guess) and the list says which fit in his hours | 12 |
| R0192 | D853 | how-we-work | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the picture is of the real app at his phone's size (and a desktop's where the two differ), the area outlined, enlarged where it is small | 12 |
| R0193 | D852 | how-we-work | 14 Oct 26 | the row says told | and it names other places in the app the same improvement would apply. The agent's readings, told to him: (1) "note" is a ruling recorded the moment he says it (D13) with the general point behind it written beside the particular fix | 12 |
| R0194 | D847 | how-we-work | 14 Oct 26 | the row says told | the never-delete list stands whole again. — NARROWED 16 Oct 26 BY D938 AND D941: "never a delete candidate: an instruction for a gesture nothing on screen suggests" does not cover how a row is edited on a scheduler's working screen — his design lesson 1 (the guide's §9). THE DESIGN GUIDE'S RULE FOR TEXT THAT ONLY EXPLAINS WHAT THE SCREEN ALREADY MAKES PLAIN (D846) IS APPROVED … | 12 |
| R0195 | D846 | how-we-work | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the two texts go from every form of the OIL question (one day, several days, a change that waits) in the batch of the three builds | 12 |
| R0196 | D835 | how-we-work | 13 Oct 26 | the row says told | and the guide is read again with the tool he sent beside it before he approves it. The agent's readings, told to him: (1) "perhaps … could" is a direction the agent recommends, not yet a change: until that step is approved the plain-language rule governs every message to him as it does today | 12 |
| R0197 | D822 | how-we-work | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) the first two are built now, as one small pull request (his go for this standing setting) | 12 |
| R0198 | D821 | how-we-work | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) "cleaner like Apple" is taken as Apple's CLEANLINESS — fewer boxes and lines, a clear order of importance, the same thing in the same place on every screen, one obvious main button — and NOT its light colours, its single accent or its airy empty space: the Raptor look stays dark, its colours keep their meanings, and a working screen stays… | 12 |
| R0199 | D820 | how-we-work | 13 Oct 26 | silent | What it changes for design work (the agent's reading): a scheduler's screen is designed for the DESKTOP first and must stay usable on a phone for a small correction — not the other way round | 12 |
| R0200 | D819 | how-we-work | 13 Oct 26 | the row says told | and for a design job — a new screen or control, a restyle, a look over something built, a pass over a page's words, a mock-up — the design skill (Impeccable) is used without being asked for, on top of the guide, his rulings winning where they meet. The agent's readings, told to him: (1) "merge live" was for pull request 500, the only one open | 12 |
| R0201 | D813 | how-we-work | 13 Oct 26 | the row says told | then: "Because that also affects the calendar design". \| The combined design guide (D812) is written first, and the interface jobs come after it and are judged against it — the calendar's design included. The agent's readings, told to him: (1) the order is: the Unavailable button's check closed (D804) → the guide drafted and read → the design page (the clash note D805, the sho… | 12 |
| R0202 | D812 | how-we-work | 13 Oct 26 | silent | The agent's readings: (1) "automatic" is built two ways at once — a short rule file that loads by itself whenever an interface file is opened, and the design guide's own project record, which it reads every time it is asked for | 12 |
| R0203 | D808 | how-we-work | 13 Oct 26 | silent | The agent's readings: (1) it is the words half of the sleek-interface job already filed, and is done with it or just before it — one sweep, page by page, each change shown before and after | 12 |
| R0204 | D802 | how-we-work | 13 Oct 26 | silent | The agent's reading, to tell him: which rulings count as "the Inputs pages" is decided ruling by ruling from what each governs, and a ruling that governs both stays in the scheduler's file with the other file pointing at it. \| DONE 13 Oct 26 on the branch claude/inputs-rulings-file: `.claude/rules/decisions/inputs.md`, its full rows kept beside it in the full-text folder (101 … | 12 |
| R0205 | D811 | how-we-work | 13 Oct 26 | silent | The agent's readings, to tell him: (1) "all" is points 1 to 5 | 12 |
| R0206 | D811 | how-we-work | 13 Oct 26 | silent | the agent’s reading of which answer is right when a fresh chat continues a branch (tick it, after the old chat lets go of the branch — git allows a branch in one folder at a time) is written into the handoff guide, and skill note 352 closes on it | 12 |
| R0207 | D790 | how-we-work | 13 Oct 26 | silent | The agent’s readings, to tell him: (1) "fresh" is an Opus reader that did not write the code and has not seen the walk’s or any other reader’s report, given the same brief | 12 |
| R0208 | D787 | how-we-work | 13 Oct 26 | silent | The agent’s readings, to tell him: the host (Opus) still opens the walkers’ pictures, reproduces every finding and may run a SHORT look itself where the sizing step says a helper is not worth starting (the checking guide’s §7.0) — that is the host’s own check, not an Opus walker | 12 |
| R0209 | D785 | how-we-work | 13 Oct 26 | silent | The agent's readings, to tell him: a member, a guest and a man with no sign-in stay in scope as people who are NOT schedulers (what they must not see or do) | 12 |
| R0210 | D774 | how-we-work | 12 Oct 26 | the row says told | The agent's reading, told to him: the small tidy-ups and finds that were to ride with that batch are not started by it either | 12 |
| R0211 | D766 | how-we-work | 12 Oct 26 | silent | The agent's readings, to tell him: (1) two steps need his look at a PICTURE before their screens are built (D541 | 12 |
| R0212 | D766 | how-we-work | 12 Oct 26 | silent | (4) that "smart compact" holds for every unattended run, not only this night's, is the agent's reading. \| `.claude/rules/doc-structure.md` (§In his workflow — Unattended runs, D766) | 12 |
| R0213 | D765 | how-we-work | 12 Oct 26 | silent | The agent's readings, to tell him: (1) "later" is after `[ALL-AVAIL-AS-MEMBER]` merges — the job is filed as `OUTSTANDING.md` `[UI-SLEEK-PASS]`, his to place in the order | 12 |
| R0214 | D761 | how-we-work | 11 Oct 26 | silent | The agent's readings, to tell him: (1) the list is `OUTSTANDING.md` `[NO-ASTRA-LIST]`, added to in the same change that lets a job go ahead on one reader | 12 |
| R0215 | D754 | how-we-work | 11 Oct 26 | the row says told | The agent's readings, to tell him: (1) it holds for every design question put to him, not only the ALL AVAIL one it was said about | 12 |
| R0216 | D667 | how-we-work | 8 Oct 26 | silent | The agent's readings, to tell him: (1) the agent cannot start a compaction itself — the app does it when the chat is full — so what it does is keep `HANDOFF.md` and the backlog true at every commit, so nothing a compaction drops is lost | 12 |
| R0217 | D625 | how-we-work | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) checked on the publisher's site, version by version: 4.1.2 and 4.1.3 still ship `hook.mjs` and the script files | 12 |
| R0218 | D623 | how-we-work | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) so Impeccable stays on the version in the repo (v4.1.1) for now: the full update to v4.5.0 — tried on 7 Oct 26 on a throwaway branch and undone, nothing committed — replaces about a hundred readable script files with one 17 MB Windows program and rewrites the two automatic checks in `.claude/settings.json` to run it (it changed those sett… | 12 |
| R0219 | D611 | how-we-work | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "agree" is to the recommendation as put — leave the scheduler's rulings whole | 12 |
| R0220 | D610 | how-we-work | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "those data" is the calendar work — the branch `codex/inputs-sans-calendar` (on his PC and on GitHub, checked 7 Oct 26), its handoff block, its rulings D567–D585 and its evidence, all of which live on that branch and not on `main` | 12 |
| R0221 | D608 | how-we-work | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "Approve" takes the four parked points as recommended — D607's reading (1) ("Opus" is the planning model: the host when it is Opus, an Opus helper otherwise) and reading (2) (the step sizes the walk and removes nothing else from a bug check) are now his | 12 |
| R0222 | D607 | how-we-work | 7 Oct 26 | silent | The agent's readings, not his words until he answers: (1) "Opus" is the planning model — the host when the host is Opus, an Opus helper otherwise — and it writes five short lines in the evidence sheet before any walker starts (the type, what only a walk could find, what the record says, the walk chosen, the row added afterwards), telling him the size in the tier block | 12 |
| R0223 | D596 | how-we-work | 5 Oct 26 | silent | (4) the agent's reading, not his words: this holds for every unattended run, not only that night's. \| `.claude/rules/doc-structure.md` §In his workflow (the "Unattended runs" bullet — D596) | 12 |
| R0224 | D595 | how-we-work | 5 Oct 26 | silent | he can overrule. In full, with the agent's readings: (1) the walker trial under way was cut at once — the Sonnet walker's share went from twelve scenarios to seven, the ones where the old Rally build's known faults live | 12 |
| R0225 | D595 | how-we-work | 5 Oct 26 | silent | (5) the agent's reading, not his words: the same economy for any later model comparison — a handful of scenarios, one pass each — and the one Astra / Sol / Fable side-by-side (D590 (5)) is untouched: it is one read each of three small fixes, and its question, whether Sol keeps the seat, stays his. | 12 |
| R0226 | D590 | how-we-work | 5 Oct 26 | silent | Offered A (Astra, Sol second on risky work, one side-by-side with Fable), B (Astra only), C (Astra plus Fable on risky work), he answered "A" \| — NARROWED 8 Nov 26 BY D1761: a changed working guide's second reader is the fresh, blind Opus reader beside Astra (the agent's reading) | 12 |
| R0227 | D590 | how-we-work | 5 Oct 26 | the row says told | Sol 6.1 keeps the second seat. In full, with the agent's readings told to him: (1) Opus 5.5 still plans and builds, and still reviews whatever Codex plans or builds (D67 (1), (3)) | 12 |
| R0228 | D590 | how-we-work | 5 Oct 26 | the row says told | his answer is a new ruling on whether Sol keeps the seat — the agent's reading is that the Opus-written fixes inside the Codex stack that touch the published record (the Insights fixes of 3 Oct 26) can be that change, small as they are | 12 |
| R0229 | D588 | how-we-work | 5 Oct 26 | the row says told | "he rules after each report" no longer holds. In full, with the agent's readings told to him: (1) from now a walk's helpers are Sonnet 5.5, each in its own world, returning pictures and a filled table | 12 |
| R0230 | D499 | how-we-work | 2 Oct 26 | silent | Codex execution narrows a reading of the standing order that repeats an identical full lifecycle solely for viewport size | 12 |
| R0231 | D493 | how-we-work | 2 Oct 26 | the row says told | its schedule link stays whole. The readings he was told: nothing on screen changes for any of them | 12 |
| R0232 | D491 | how-we-work | 3 Oct 26 | the row says told | three pieces of it go into our own guides with `[SKILL-FUSION]` — a word list (screen name, meaning, code name), two lines in the debugging guide, one line in the tidiness audit's brief — and Astra drafts the word list and runs its tidiness read before the reset. The agent's reading, told to him: "all" covers both questions put, and the tidiness read's before-or-after-the-rese… | 12 |
| R0233 | D490 | how-we-work | 2 Oct 26 | silent | and one whole-app check is run at the end, once the features are in and before the database step. The agent's reading: each batch still gets its one check sized by its riskiest change (D485) | 12 |
| R0234 | D489 | how-we-work | 2 Oct 26 | the row says told | and "a reviewer's claim is a finding only with a concrete failure, its cause and its fix". The agent's reading, told to him: one "yes" taken as yes to all three, as each was listed under item 1 | 12 |
| R0235 | D487 | how-we-work | 2 Oct 26 | silent | "if we go with this will the app drastically change? because im ok with how the size of the buttons are now." — asked of proposal 2 of the skills read (D486): five look-and-feel checks beside Impeccable, one of them a phone tap target of at least 44 × 44 \| The size of the app's buttons stays as it is: no look-and-feel check or polish pass makes a button bigger or smaller witho… | 12 |
| R0236 | D486 | how-we-work | 2 Oct 26 | silent | build after his allowance resets (D484), the skill change read by Fable and Astra first (D70) \| Of the five skills the article recommends none is installed whole: their best practices, read at the source, are fused into our own guides — the harder questioning into the planning step, and a one-off code-tidiness audit before the database step, delivered as a report for him to ru… | 12 |
| R0237 | D485 | how-we-work | 2 Oct 26 | the row says told | the agent recommended it as a standing rule \| Related features are built together on one branch and get one bug check for the lot, sized by the riskiest change in the batch — not a dedicated check per feature. The agent's reading, told to him: each feature is still built with its own tests and the PC's checks as it goes | 12 |
| R0238 | D353 | how-we-work | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (a) "side questions" includes a classification, a wording, a what-should-happen question put to a reviewer mid-job | 12 |
| R0239 | D350 | how-we-work | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the greyed button's words are the agent's, shown on his look card | 12 |
| R0240 | D390 | how-we-work | 28 Sep 26 | silent | the full rows stand. — NARROWED 28 Sep 26 BY D391: the guide step goes now, in a fresh chat on its own branch, leaving the one row the small-fixes branch edits untouched. Every ruling loads as one short line — its number, its date, the rule — and its full row (his words, the readings, where it lives) sits whole, byte for byte, in a full-text file beside it, searched and never … | 12 |
| R0241 | D390 | how-we-work | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his one word approves the proposal's questions 1–3 as recommended | 12 |
| R0242 | D302 | how-we-work | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: each chat repeats what it promised in its own HANDOFF block (the next chat or device reads it there) | 12 |
| R0243 | D228 | how-we-work | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "both" = the absence-record re-test AND the small-fixes batch, with `[BG-GUARD-FALSE]` folded into the batch \| `.claude/rules/shipping.md` §The checks | 12 |
| R0244 | D141 | how-we-work | 24 Sep 26 | the row says told | The agent’s reading, stated to him so he can correct it: the document gate keeps a CEILING per read-every-session file only as a TRIPWIRE — crossing it means "look at what is in this file that does not belong here", never "cut to a number" | 12 |
| R0245 | D140 | how-we-work | 24 Sep 26 | the row says told | The agent’s reading, stated to him so he can correct it: the always-read layer is the project guide, the rules files and the How-we-work rulings | 12 |
| R0246 | D137 | how-we-work | 24 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: one file per area under `.claude/rules/` (the app's own mechanism for loading a rules file when files that match it are touched — How we work loads always) | 12 |
| R0247 | D70 | how-we-work | 23 Sep 26 | silent | "Do u recommend for fable and Astra to also review the skills?" — told yes, one round each on the finished drafts, before he approves anything — then "Ok" \| — NARROWED 8 Nov 26 BY D1761: a changed working guide is read by Astra every time, his call, beside a fresh, blind Opus reader (the agent's reading) | 12 |
| R0248 | D53 | how-we-work | 22 Sep 26 | silent | So the writing half of the rule worked and the READING half was missing. Three specific errors, named so they can be checked for: (1) the session was handed “read DECISIONS.md D48–D49” and grepped for exactly those two instead of reading the file | 12 |
| R0249 | D2388 | inputs | 23 Nov 26 | the row says told | The agent's readings, told to him and not changed by him: every way of picking days on the SANS calendar alike (a drag, a finger drag, the keys, the others) | 11 |
| R0250 | D2346 | inputs | 23 Nov 26 | silent | The agent's readings shown in the drawing and not changed by him: his view only, the admin's unchanged | 11 |
| R0251 | D2343 | inputs | 23 Nov 26 | silent | The agent's readings, to be shown in the drawing: shaded only for the man himself (an admin's view unchanged), only while his SANS starts on a date ahead, the shading gone from that date. \| the Inputs page, §Built — The SANS calendar (D2343, D2346 | 11 |
| R0252 | D2263 | inputs | 22 Nov 26 | silent | The agent's readings: built today without the note (the night's fix, "inputs" item 6) | 11 |
| R0253 | D1943 | inputs | 9 Nov 26 | silent | merged on his "merge live". The agent's readings: this is the word D1942 said each other area waits for, Inputs alone | 11 |
| R0254 | D1842 | inputs | 8 Nov 26 | silent | the same right end is drawn at every desktop width (the agent's reading from the stylesheet, not walked at other widths). | 11 |
| R0255 | D1787 | inputs | 8 Nov 26 | the row says told | The safety for smaller screens came from his question that evening ("how would 8 look like for a smaller screen if i choose A") and was added to the page minutes before his answer: the agent's reading is that his answer includes it, to be confirmed at his look. | 11 |
| R0256 | D1708 | inputs | 5 Nov 26 | the row says told | The agent's readings: drawn and shown to him before it is built (D1625 — https://claude.ai/artifact/4384HywiC1SR3q9mUtw4eT, pictures `docs/img/handpass/2026-11-05-cr4-d1708/` | 11 |
| R0257 | D1702 | inputs | 5 Nov 26 | silent | The agent's readings: built as a wrapper round Filters, the fields and the gear, `display:contents` at a phone's width so D693's phone row is untouched | 11 |
| R0258 | D1582 | inputs | 3 Nov 26 | the row says told | "the rest of the questions as recommended" — the 3 Nov 26 re-check page (https://claude.ai/artifact/KH1P4ZVUbd15T3sP6sgD1h), Q3 \| Undo and Redo name the input they take back by its person and kind — "Undid: Drifter's ISR brief", "Undo — Ranger's OL" — and several at once by their count, "Undid: 3 inputs", never "a personal input". Where the input has its own title, the title s… | 11 |
| R0259 | D1578 | inputs | 3 Nov 26 | the row says told | and it was asked of a weekend, so a public holiday no period covers, which earns OIL the same way, is the agent's reading to follow the same rule, his to correct.) Answers Q2 of the 3 Nov 26 re-check page (https://claude.ai/artifact/KH1P4ZVUbd15T3sP6sgD1h), in place of the recommendation put to him there (the input's OIL question naming the missing period and offering "Create … | 11 |
| R0260 | D1560 | inputs | 2 Nov 26 | the row says told | drawn with the design skill and put to him with pictures before it is built. The agent's readings: (1) the app's own picker is reused, not a new one (D1496) | 11 |
| R0261 | D1386 | inputs | 26 Oct 26 | silent | The agent's readings, to draw: one control on the calendar's top row, the same on a phone and a desktop | 11 |
| R0262 | D1385 | inputs | 26 Oct 26 | silent | The agent's reading: the window and its own padding narrow, not the cards' insides | 11 |
| R0263 | D1384 | inputs | 26 Oct 26 | silent | The agent's readings, to show him in the build's picture: an absence's square filled in its colour (OL deep amber, LL light amber, OIL chartreuse, medical red, a course purple, an overseas duty slate) | 11 |
| R0264 | D1377 | inputs | 25 Oct 26 | silent | it is more than a new name for "Fly with", which never counted on the war. Confirms D1374 and D1373 after his reading of them as a rename | 11 |
| R0265 | D1377 | inputs | 25 Oct 26 | silent | The agent’s reading: every other rule a "Fly with" had on the schedule (striking him from the crew list for its hours, its OIL question) is unchanged, as built (`raptor-port/src/engine/inputs.ts` isAway reads an Attach the same under Unavailable as on the programme — checked 25 Oct 26). | 11 |
| R0266 | D1373 | inputs | 25 Oct 26 | silent | The agent's reading: the "To" box is free words, optional | 11 |
| R0267 | D1367 | inputs | 25 Oct 26 | silent | Looks nicer", then "As in buttons" — looking at the questions page's Q1 drawing A (the Inputs page's window for an Other, a "Goes to" row of two buttons, Ground Programme · Unavailable, drawn in the window's plain Duration-button look) \| — ANSWERED 25 Oct 26 BY D1369: the look is C, the picked button solid in its colour, ordinary letters. In the Inputs page's window for an Oth… | 11 |
| R0268 | D1300 | inputs | 24 Oct 26 | silent | The agent's readings: the phone keeps its layout (a window there stands in the middle, D997) | 11 |
| R0269 | D1293 | inputs | 24 Oct 26 | silent | The agent's readings: the cards keep their look and words, only their side margins change | 11 |
| R0270 | D1280 | inputs | 23 Oct 26 | silent | recommended yes \| On a phone the Inputs page's tab row (Inputs · SANS · Medical) sits 4px under the app's top bar, as the Leave War's does — the smaller gap — so the tabs stand in the same place on both pages. The agent's readings: the tab bars themselves were already alike (44px, tabs 36px — measured, `raptor-port/scripts/handpass/lw-m2-tabrows.mjs`) | 11 |
| R0271 | D1179 | inputs | 21 Oct 26 | silent | The agent's readings, drawn for him and his to strike: each family heading becomes a choice ("All leave", "All medical", and "All duty & commitments" too, so the three behave alike) | 11 |
| R0272 | D1125 | inputs | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) D687 still holds — on a desktop the switch stands at the right end on the Calendar and on the List, the same place (the phone already had it there, D705) | 11 |
| R0273 | D1123 | inputs | 21 Oct 26 | silent | The agent's readings, to tell him: (1) D687 still holds — Inputs' Calendar / List switch never moves between the Calendar and the List | 11 |
| R0274 | D1096 | inputs | 20 Oct 26 | silent | (That "all" reaches places beyond the three named is the agent's reading.) Widens D1095. | 11 |
| R0275 | D1095 | inputs | 20 Oct 26 | silent | a last day in the loaded week's own year still carries no year. The point behind it (D852), the agent's reading: fewer characters for the same fact, as the Inputs list's Changed column already prints "1 Jan 26". | 11 |
| R0276 | D999 | inputs | 18 Oct 26 | silent | The agent's readings, to tell him: (1) the downchit's first end is remembered when the upchit first cuts it, so it can never be stretched further than it was filed | 11 |
| R0277 | D996 | inputs | 18 Oct 26 | silent | The agent's readings, to tell him: (1) "standardise" is read as this window for certain | 11 |
| R0278 | D977 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him: (1) a short card has a little empty room inside its box | 11 |
| R0279 | D968 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him: (1) "default medical" is the kind "+ Medical" opens on — the window is otherwise unchanged and he can still pick any kind | 11 |
| R0280 | D967 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him on the page: (1) Q1 A — from two documents, one drawing and the number, in every section, so five documents read "5", never five drawings | 11 |
| R0281 | D965 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him: (1) the kind takes its section's colour, as it does today | 11 |
| R0282 | D963 | inputs | 17 Oct 26 | the row says told | the button takes the place of D962's title. The agent's reading, told to him: his "Ok" is read as yes to two doors, the agent's recommendation — he may correct it. | 11 |
| R0283 | D961 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him: (1) "3 names on a row" is three cards a row at a phone's width | 11 |
| R0284 | D960 | inputs | 17 Oct 26 | the row says told | The agent's readings, told to him: (1) Medically Down's line becomes the period, "15–17 Jul" (one day: "17 Jul" | 11 |
| R0285 | D953 | inputs | 17 Oct 26 | the row says told | The agent's reading, to tell him: a one-day duty or other commitment already saved follows the new default (no date) — a published day carrying one reads "1 pending" once (demo data, D56) | 11 |
| R0286 | D952 | inputs | 17 Oct 26 | the row says told | The agent's readings, to put to him with the picture before it is built (D853, D541): (1) the switch is the grey date after the Remarks box in the input's window — a tap turns it off (shown struck through) or on | 11 |
| R0287 | D948 | inputs | 16 Oct 26 | the row says told | The agent's readings, told to him on the page: (1) an input already saved keeps its words, and a typed-in date token in its remark is read as the date, not printed twice | 11 |
| R0288 | D927 | inputs | 15 Oct 26 | the row says told | All as recommended" — the morning after the night of 15 Oct 26, shown the night's report with two picture pages, each ending "All as recommended" (the agent's reading, told to him: his one "All as recommended" answers both pages, as the report said it would) — the one-row page, question 1. \| The Medical tab is built as drawn (D912): its "Medical" heading goes and the "as of" d… | 11 |
| R0289 | D920 | inputs | 15 Oct 26 | the row says told | The agent's readings, told to him with the drawing: (1) the Dates block (the calendar and the line under it that repeats the dates) moves to sit straight after Remarks, so everything that stood between them — SANS availability's F / O / A, When, a medical kind's Document, Remarks — is above it | 11 |
| R0290 | D919 | inputs | 15 Oct 26 | the row says told | the box keeps its full width and a tap on the pencil is a tap on the box. The agent's readings, told to him with the drawing: (1) the pencil shows wherever the title box shows — a commitment kind (D716), a new input and a saved one — and not on an input its reader may only read | 11 |
| R0291 | D917 | inputs | 15 Oct 26 | silent | SANS "+ Commitment", which is SANS availability). The agent's readings, to tell him: (1) every door that opens a NEW input — the List's "+ Input", a day or a dragged run on the Inputs calendar | 11 |
| R0292 | D900 | inputs | 15 Oct 26 | silent | the Tracker's ⇅ Reorder list and the people picker's drag across faces scroll their list. The agent's readings, to settle in the build: the same band, hold and feel as their twins | 11 |
| R0293 | D897 | inputs | 15 Oct 26 | silent | The agent's readings, to settle in the build and tell him: the hold before a turn is the app's own (the SANS / Inputs calendar's month turn), and which edge counts (the foot and top, or the sides) is drawn for him first. | 11 |
| R0294 | D893 | inputs | 15 Oct 26 | silent | built on the same branch, one "merge live". The agent's reading: the edge and the speed are the app's existing ones | 11 |
| R0295 | D861 | inputs | 15 Oct 26 | silent | a man dragged off an input's row stays silent. The agent's readings: (1) "same thing no glow" is read with D860 (the same morning): the bar's mark is the board's ring, and the quick cyan landing flash that came before it on a bar that wears the ring is dropped there — a bar that lands WITHOUT wearing the ring (a drag, an Undo) keeps its landing flash as before, which is older … | 11 |
| R0296 | D854 | inputs | 14 Oct 26 | the row says told | The agent's readings, told to him: each note stays where the guide's three cases call for one — the changed input out of view, a warning to give with the change (the amber "already on …" note, a refusal) | 11 |
| R0297 | D851 | inputs | 14 Oct 26 | the row says told | The agent's readings, told to him: the mark is the board's own (the blue box of about six seconds), not a new quick flash — his to change | 11 |
| R0298 | D849 | inputs | 14 Oct 26 | the row says told | The agent's readings, told to him: (2) is D771 built as it was worded | 11 |
| R0299 | D848 | inputs | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the fact moves into the sheet's own heading — "A day holds one status: choose who holds these days", in place of "Days covered by another status — choose who holds them" — put to him as a picture before it is final | 11 |
| R0300 | D795 | inputs | 13 Oct 26 | silent | The agent's readings, to tell him: the field is the same on a desktop — one control everywhere, not a phone-only one (D754) | 11 |
| R0301 | D786 | inputs | 13 Oct 26 | silent | The agent’s readings, to tell him: the swipe is for a phone (touch) only — a desktop keeps the arrows | 11 |
| R0302 | D777 | inputs | 12 Oct 26 | silent | The month's bars get nothing. The agent's readings, to tell him at the build: it is shown to whoever may answer the question | 11 |
| R0303 | D773 | inputs | 12 Oct 26 | the row says told | The agent's readings, told to him: only the Inputs page's export goes — the Quals page's export and the schedule's own export and print are not inputs and stay | 11 |
| R0304 | D771 | inputs | 12 Oct 26 | silent | The agent's readings: (1) it shows for everyone who can open the input — its people, its filer, a scheduler, a reader | 11 |
| R0305 | D770 | inputs | 12 Oct 26 | silent | For the cx I also want u to strike through the title and the reason for e.g in this case is cx is red" — question 4 of the report: a man who is the only named person beside ALL AVAIL. \| A person who is the only named person in an input that also holds ALL AVAIL or ALL reads the input and may take himself out, but does not change it for everyone — whoever filed it, or a schedul… | 11 |
| R0306 | D770 | inputs | 12 Oct 26 | silent | The agent's reading: an input for one person with nobody and no placeholder beside him stays his own in full, whoever filed it (D655). \| `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` (§10, step 3 — R19, D770) | 11 |
| R0307 | D763 | inputs | 11 Oct 26 | silent | The agent's readings, to tell him: (1) "whoever filed it" keeps its limits — the kinds a member may file for others, the members' switch on, and only until a scheduler has put someone in beside others (D755 (3)) | 11 |
| R0308 | D732 | inputs | 10 Oct 26 | silent | The agent's reading, to tell him: "put back" is the title as last saved, and Escape also takes the keyboard out of the box (as it puts a note box away), so the next Escape is the day's. \| `raptor-port/docs/ui-contracts.md` ("ESCAPE WHILE A NOTE IS TYPED LEAVES THE NOTE BOX ONLY" — the title box's sentences there, D732: as built) | 11 |
| R0309 | D729 | inputs | 10 Oct 26 | silent | The agent's readings, to tell him: (1) "yes to all" takes V4's lighter timed bar too, which the page had left to his taste — his to correct on the preview | 11 |
| R0310 | D728 | inputs | 10 Oct 26 | silent | and later, as its own job, the app stops writing "till <date>" into remarks and every screen prints it from the input's own dates. The agent's readings, to tell him: (1) step 1 is the CARD only — the opened day's and the phone list's | 11 |
| R0311 | D727 | inputs | 10 Oct 26 | silent | B, every name with the kind in small grey capitals — and, at his asking, how the calendar and the phone's list look under each (they do not change), the agent recommending B: "A." \| On the desktop Inputs list a shared input names everyone in it — never "Drifter +3" — and the kind keeps its pill there (drawing A). The agent's readings, to tell him: (1) the names run A to Z and … | 11 |
| R0312 | D725 | inputs | 10 Oct 26 | silent | Asked, at the close of the input card's check, whether the small days of the calendar in an input's window on a phone (about 26 by 20 points — the list's pencil, now gone, had bigger ones) should be made bigger, the agent recommending yes: "1 ok bigger" \| On a phone the days of the calendar in an input's window are made bigger — a finger's size, as the inputs list's pencil cal… | 11 |
| R0313 | D724 | inputs | 10 Oct 26 | silent | every name of a shared input): "Seems like multiple inputs it’s better to put who made that input yeah" — and, a minute later, to make it plain: "As in multiple people in 1 input it’s better to show who made that input yeah" \| On the card of an input filed for several people, who filed it is always said — "By Saber" — even where the filer is one of the people in it. The agent'… | 11 |
| R0314 | D723 | inputs | 10 Oct 26 | silent | The agent's readings, to tell him: (1) it settles the open choices of D718–D720 as the pick drew them — the kind as small grey capitals, not a pill | 11 |
| R0315 | D722 | inputs | 10 Oct 26 | silent | Looking at the mock-up's "A · one line" card, where a title stood after the names and the kind on the same line (circled: "Flight safety brief" at the right of the second line): "Why don't flight safety brief, the title always start on the left as a new row" \| On an input's card the title always starts at the left, on a row of its own — never trailing after the names and the k… | 11 |
| R0316 | D721 | inputs | 10 Oct 26 | silent | not built until he chooses. The agent's readings, to tell him: (1) it is D719's rule (nothing cut off by what stands at its right | 11 |
| R0317 | D720 | inputs | 9 Oct 26 | silent | We can save space there" \| On an input's card the small print says "By Saber" — not "for Ranger": the card already names the person it is for, and the room is saved. The agent's readings, to tell him: (1) it holds wherever the card already names the person — the opened day on the Inputs calendar and the SANS calendar, and the Inputs list | 11 |
| R0318 | D719 | inputs | 9 Oct 26 | the row says told | Ideas are put to him as a proper mock-up before anything is built. The agent's readings, to tell him: (1) it governs the card wherever it is drawn — the opened day and the Inputs list (D718) | 11 |
| R0319 | D712 | inputs | 9 Oct 26 | silent | "Fly with" is unchanged. ALL / ALL AVAIL is not offered for a "Fly with" or a "Personal" input — only for Training, meeting, appointment, duty and other. The agent’s readings, to tell him: (1) he asked whether to leave them instead | 11 |
| R0320 | D705 | inputs | 9 Oct 26 | silent | the calendar / list switch moves to their right. The agent’s readings, to tell him: (1) D687 still holds — the switch is in the same place on the Calendar and on the List — so it goes to the right end of the row, beside the filter button and the gear, where the List (which has no arrows) can keep it too | 11 |
| R0321 | D704 | inputs | 9 Oct 26 | silent | Remove one commitment a day each." \| "One commitment a day each." Is removed from the SANS calendar’s "How this works": its last line is the late cut-off alone, the cut-off in bold (D691). The agent’s reading, to tell him: only the sentence goes — the rule itself is unchanged: a SANS man still has one commitment a day, and the app still says so where a second one is refused. \|… | 11 |
| R0322 | D701 | inputs | 9 Oct 26 | silent | a day opened on the SANS calendar is laid out the same way. The agent’s readings, to tell him: (1) D629 is kept — who placed it and when is still on every input, without the words "Placed by" and without the year (an input from another year would show its year — the agent’s call) | 11 |
| R0323 | D698 | inputs | 9 Oct 26 | silent | Do this for the sans and inputs calander" \| On the Inputs calendar and the SANS calendar the row of buttons under the three tabs — the calendar / list switch, the month’s arrows and name, today, the filter or highlight button, the gear — is drawn as tall as the tabs above it, not taller. The agent’s readings, to tell him: (1) measured, the two rows already take the same room (… | 11 |
| R0324 | D697 | inputs | 9 Oct 26 | silent | the key’s words are shortened to fit. The agent’s readings, to tell him: (1) the key reads "Pilots · WSOs still needed: 1–2, 3–4, 5+" today and is too long for the line | 11 |
| R0325 | D696 | inputs | 9 Oct 26 | the row says told | a drawing with ways to do it is put to him before it is built. The agent’s readings, to tell him: (1) it is the same wish as D688 (nobody should scroll a long way) applied to the inputs themselves | 11 |
| R0326 | D695 | inputs | 9 Oct 26 | silent | The agent’s reading, to tell him: a note with neither words nor people is not kept — as an empty note is not kept today. \| BUILT 9 Oct 26 on the branch claude/day-window-compact (not merged): `raptor-port/docs/ui-contracts.md` (the bullet naming D684, D688, D689, D690, D692, D694, D695), `raptor-port/docs/data-schema.md` (PLANPUCKS — D684, D695) | 11 |
| R0327 | D694 | inputs | 9 Oct 26 | silent | the room is found by moving the six dots, and the box’s left edge, a little to the left. The agent’s reading, to tell him: the pucks keep their size and stay four across | 11 |
| R0328 | D693 | inputs | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) it moved because the folded-away fields stand between the two buttons, and opened they take a whole line — pushing the gear under them | 11 |
| R0329 | D692 | inputs | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) the words line was tall because the pencil and the cross beside it were drawn at a full finger’s size | 11 |
| R0330 | D691 | inputs | 9 Oct 26 | silent | With a picture from his iPhone of "How this works" open on the Inputs calendar, its fifth line reading "File by the end of the Wednesday two weeks before the week.": "For point 5 u should bold the late input date which is in this case Wednesday two weeks etc" \| In "How this works", the late cut-off as it is set is in bold — "the end of the Wednesday two weeks before" — so the … | 11 |
| R0331 | D689 | inputs | 9 Oct 26 | silent | nothing new to learn. The agent’s reading, to tell him: the other ways a row of pucks has today come with it — a right-click on a desktop takes a person off, and a puck dragged onto an empty place moves there. \| BUILT 9 Oct 26 on the branch claude/day-window-compact (not merged): `raptor-port/docs/ui-contracts.md` (the bullet naming D684, D688, D689, D690, D692, D694, D695) | 11 |
| R0332 | D688 | inputs | 9 Oct 26 | silent | Because there will be many inputs too I don’t want people to scroll massively down" \| In a day opened on the Inputs calendar, a note and its people are drawn compact: what stands above the day’s inputs must not push them far down the window — a day will hold many inputs, and nobody should have to scroll a long way to reach them. The agent’s readings, to tell him: (1) it is a t… | 11 |
| R0333 | D687 | inputs | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) it jumped because the month’s arrows and "Today" stand before it on the Calendar and are not there on the List | 11 |
| R0334 | D685 | inputs | 9 Oct 26 | silent | With a picture from his iPhone of the people picker ("Several people", four pucks picked in a run): "I should be able to drag to select multiple pucks" \| In the people picker, dragging across the pucks picks every puck the finger or the mouse passes over — not one tap for each. The agent’s readings, to tell him: (1) the drag does what its FIRST puck does: begun on a puck that … | 11 |
| R0335 | D684 | inputs | 9 Oct 26 | the row says told | a picture is put to him before it is built. The agent’s readings, to tell him: (1) today a note is words only and a pucks row is people only, each its own block with its own button (his asks of 22–24 Aug 26) | 11 |
| R0336 | D683 | inputs | 9 Oct 26 | silent | and "+ Note" and "+ Pucks" sit in the window’s top bar, to the right of the date. The agent’s readings, to tell him: (1) "tall" is the height the window already reaches when it is pulled up by its bar | 11 |
| R0337 | D681 | inputs | 9 Oct 26 | the row says told | Told, first on the calendar check’s look card, "a shared input’s dates can’t be changed once it is saved (only dragged, or deleted and filed again) … I’d build that before merge live — say if you agree": "2 agree" \| A saved shared input’s dates can be changed — in the input’s own window, by whoever may change the input, for everyone in it at once — and this is built before the… | 11 |
| R0338 | D675 | inputs | 8 Oct 26 | silent | Is there another better name to name it" — the agent offered "Flying days" (its pick), "Flying calendar", "Day types" — then: "Change it to Calendar instead of days" \| The window that sets each date's day, night or no fly and the year's holidays is called "Calendar" on screen — not "days". The agent's readings, to tell him: (1) it renames what he SEES: the window's title, and … | 11 |
| R0339 | D671 | inputs | 8 Oct 26 | silent | As shown on the right picture?" \| The holiday form in days picks its dates on the same one-calendar picker as the Leave War's Event sheet — a tap for the start, a tap for the end — not two date boxes. The agent's readings, to tell him: (1) it is the Leave War's own picker, the same part and the same rules — one tap is one day, a second tap on a later day makes the run, a tap b… | 11 |
| R0340 | D664 | inputs | 7 Oct 26 | the row says told | It should be a full screen of the phone" \| — NARROWED 26 Oct 26 BY D1386: while the Inputs calendar is expanded, the month grows past the screen's height and the page scrolls. On a phone the calendar — the SANS calendar and the Inputs calendar alike — is never a short box scrolled inside the page: the month takes the phone's full screen, down to its foot. The agent's readings,… | 11 |
| R0341 | D659 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the heading is not drawn at all for a squadron with no ground crew on its roster | 11 |
| R0342 | D658 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the admin's group filing is on the SANS calendar's "+ Commitment", where the picker offers SANS people only (D620: SANS availability is filed there and nowhere else) | 11 |
| R0343 | D656 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the switch reads "Several people" — his "however u think is better phrased" | 11 |
| R0344 | D655 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "one shared group input" is what he SEES and DOES — one entry on the month, one line in the List, a change to its dates, times or remarks changes it for everyone, a man leaves by being taken off its list | 11 |
| R0345 | D655 | inputs | 7 Oct 26 | silent | an admin may file it for several SANS people (reading 4 stands). — NARROWED 7 Oct 26 BY D660: reading 3 is reversed — whoever files an input for other people answers the OIL question for all of them at the save | 11 |
| R0346 | D653 | inputs | 7 Oct 26 | the row says told | Then now we can have more space to show inputs" — and, on the drawing of the month stretched to the foot of the screen with thin bars, six inputs a day: "This looks good but take note different phone have different vertical height on their screen so u should cater for that change" \| — NARROWED 26 Oct 26 BY D1386: while the Inputs calendar is expanded, the month grows past the … | 11 |
| R0347 | D652 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the box is filled by itself from the name's initials ("National Day" → "ND") and he can type over it, exactly as on the Event sheet — the same rule, the same check, one piece of code | 11 |
| R0348 | D651 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) read from the code: the edge is the schedule's own, deliberately the brightest thing on the puck, so SANS read at a glance | 11 |
| R0349 | D650 | inputs | 7 Oct 26 | the row says told | On the SANS day redrawn with the schedule's puck, drawn large: "The puck is abit too big able to make it smaller to be proportionate" \| The puck on the SANS day is smaller — in proportion with the letters and the small print beside it, not the biggest thing on the row. The agent's readings, told to him: (1) the drawing had scaled the schedule's puck up by about two thirds | 11 |
| R0350 | D649 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) read from the running app, not from memory (D634): the schedule's puck is ONE fixed size, the callsign on its seat's colour (a pilot olive, a WSO green) with the chip joined to its right end in the CAT's colour — an instructor purple, A red, B amber, C cyan, D blue, OCU violet | 11 |
| R0351 | D648 | inputs | 7 Oct 26 | the row says told | it does not open full screen, but on a phone it can be pulled up by its top bar to nearly the full screen and back down. The agent's readings, told to him: (1) not full screen by default because D641 keeps the calendar behind the window usable, and a full-screen window leaves nothing behind it | 11 |
| R0352 | D648 | inputs | 7 Oct 26 | silent | (6) the same holds for a day opened on the Inputs calendar — every input listed, the list scrolling (the agent's reading, to tell him). | 11 |
| R0353 | D647 | inputs | 7 Oct 26 | the row says told | Because I might want to know which sans is like an instructor etc." \| On the SANS calendar's opened day each committed person is shown as his puck with his CAT — not a bare name — so an instructor is told from the rest at a glance. The agent's readings, told to him: (1) the puck is the app's own — the callsign in his seat's colour with his CAT chip beside it, as the Leave War … | 11 |
| R0354 | D646 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the whole fold is cut to five short lines, the same on the Inputs calendar | 11 |
| R0355 | D639 | inputs | 7 Oct 26 | the row says not told | Of the readings drawn without asking — "the late cut-off is the END of that day": "The 3rd one yes as well". \| The late cut-off is set behind each calendar's own settings gear — the SANS calendar and the Inputs calendar each have their own — and the Logic page lists both | 11 |
| R0356 | D639 | inputs | 7 Oct 26 | the row says told | The agent's readings: (1) the Logic page lists both cut-offs and opens the same setting — one setting, two ways in (as put to him) | 11 |
| R0357 | D638 | inputs | 7 Oct 26 | the row says not told | Of the readings drawn without asking — "a public holiday or Off day shows its tag in place of the day button": "The last one I agree". \| On the days month a phone date carries one button that steps day, night, no fly and a desktop date three buttons | 11 |
| R0358 | D638 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) a day has exactly ONE class — day, night or no fly | 11 |
| R0359 | D635 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the build uses the gear the app already has (the Leave War's settings button), not a new drawing | 11 |
| R0360 | D633 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) repeating no-fly days still need a way now the normal week is gone: recommended, the weekday's own heading on the month ("THU") sets every such day from a date onward, with no end — drawn | 11 |
| R0361 | D632 | inputs | 7 Oct 26 | the row says told | it is drawn for him to pick, not yet chosen. The agent's readings, told to him: (1) for the desktop only — the phone's bars stay as drawn | 11 |
| R0362 | D631 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) he is right, and the agent's earlier pick is withdrawn as the ONLY way in: the day's sheet on the Leave War (D627, reading 3) is fine for one day and tiring for a year — it stays as the quick door for a single day | 11 |
| R0363 | D631 | inputs | 7 Oct 26 | silent | — NARROWED 7 Oct 26 BY D633: the "normal week" part of the recommended shape (readings 2 and 3) is NOT taken — the month carries a select button on every day instead, and the required pilots and WSOs are set on the Leave War's columns | 11 |
| R0364 | D630 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the colours are the first set's exactly — the wash, the coloured pair, the figures in the app's usual soft grey with zeros dimmed | 11 |
| R0365 | D629 | inputs | 7 Oct 26 | the row says told | the card says the period as a range instead. Every input and every SANS commitment shows, in small print, who placed it and on what day and at what time. The agent's readings, told to him: (1) one quiet line where an entry is opened or listed (the day's list, the editor's foot) — never on the month's cells or bars, which have no room | 11 |
| R0366 | D628 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) today it is one figure on the Logic page for every input — due 14 days before its week's Monday — and a downchit and an upchit are never late | 11 |
| R0367 | D627 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the Leave War already has the record for holidays and Off days — a word typed on a day's Event row, "PH" (the column reads light green | 11 |
| R0368 | D626 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "the rest" is what the first page showed and he did not speak of: the Highlight picker that rings one person's days in cyan and underlines the letters he offered, with no second chooser for F, O or A (answers D619's open question) | 11 |
| R0369 | D622 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) for this squadron, where every aircraft has two seats, typing one number fills both — his reference's single "pax required" — and either figure can then be changed by itself | 11 |
| R0370 | D621 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the Inputs calendar already draws each input as a chip in its day and a tap on the day lists them — the Google-style bar is a different drawing of the same records (one bar running across the days an input covers), to be compared with today's chips on a phone and on a desktop | 11 |
| R0371 | D620 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) this answers what was put to him the same morning — product choices come to him with a picture first | 11 |
| R0372 | D619 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) its name — "Highlight" or "Filter" — is left to the agent: "Highlight", because nothing is hidden and the day's totals never change | 11 |
| R0373 | D618 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the colour follows the day's TOTAL still needed, pilots and WSOs together — his reference reads that way (1 or 2 yellow, 3 or 4 amber, 5 and more red) — to confirm | 11 |
| R0374 | D617 | inputs | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) every pair on a date is pilots first, WSOs second — this answers what was put to him that morning about the two numbers | 11 |
| R0375 | D411 | it-flow-guide | 29 Sep 26 | silent | the deck also covers the alternate-plan flow (saved plans: making one, switching, bringing one out) and shows the work flow — how the journeys follow one another, from inputs filed to a day published and amended. The agent's reading of "the work flow", said to him in the report: one slide after the map, the life of a day across the roles (members file inputs and bids → the sch… | 12 |
| R0376 | D2172 | leave-war | 17 Nov 26 | the row says told | "the rest looks good" — his look at chat 103's look page (https://claude.ai/artifact/RzRMgu2PZc8H8oyYfw3Mw9) of the four Leave War items, beside his row-tint suggestion (D2171) \| His look at the four Leave War items is done, apart from the row tint (D2171): the five departures from the drawings stay as built. The agent's reading, put to him to confirm in the same reply: the pa… | 12 |
| R0377 | D2171 | leave-war | 17 Nov 26 | the row says not told | The agent's reading, not checked with him: his own highlighted row keeps its own highlight. \| The Leave War page, `.claude/rules/decisions/leave-war.md` | 12 |
| R0378 | D2158 | leave-war | 17 Nov 26 | the row says told | The agent's readings, told to him: a name he types himself is kept when the dates change afterwards, and a box he empties follows the dates again | 12 |
| R0379 | D2156 | leave-war | 17 Nov 26 | the row says not told | changes how D1253's and D1482's amber pending figures show on the Balances page (no minus, the dashed tag in place of a figure after the box) — the person window's tiles are not part of it (the agent's reading, not asked). | 12 |
| R0380 | D2153 | leave-war | 17 Nov 26 | silent | "/impeccable can u create another chat to fix the alignment of this page like the title. with the numbers below. think of a neater layout." then, when a new chat could not be started from his phone, "ok why dont u fix this design here instead for the balances." — with his desktop picture of the Balances page (the Balances view): the column headings not over their figures and b… | 12 |
| R0381 | D2151 | leave-war | 17 Nov 26 | the row says told | drawn for him first, not built. The agent's readings, told to him: a phone has no mouse, so its tap keeps the cyan mark it already wears (D1289) and nothing new is added there | 12 |
| R0382 | D2037 | leave-war | 14 Nov 26 | silent | the several-people window's Delete rising 35px when its "sure?" line appears) and leaving the rest with reasons. \| The look-over for controls that move under a tap is closed with only the Leave War's below-zero line fixed: every other place it found stays as it is, the four recommended fixes among them, since he finds their design fine. The agent's reading: "leave all out" lea… | 12 |
| R0383 | D2031 | leave-war | 13 Nov 26 | silent | "the fix is good for the line above the buttons" — to chat 69, on the before and after pictures of the Leave War's several-people window and one-day window, where the below-zero line ("That takes … Tap the same leave again to go ahead.") had been moved from under the leave buttons to just above them (D2030's fix, pull request 764). \| In the Leave War's windows the below-zero l… | 12 |
| R0384 | D2030 | leave-war | 13 Nov 26 | silent | the Leave War's below-zero line, where the leave buttons rise when it appears, is the first, fixed so the buttons stay where they are. The agent's readings, the fix recommended to him in the reply: the jump breaks his standing rule of 2 Sep 26 (a control tapped repeatedly must not move under him), so it is a fault to fix, not a new look to design — the line keeps its words and… | 12 |
| R0385 | D2025 | leave-war | 13 Nov 26 | mixed (both words in one clause) | or start the plan for the larger change now — the agent picking the trial link. \| The top bar coming loose on the Approvals and Quals pages in Chrome on his iPhone is taken up next time, not in the builds his answers of 13 Nov 26 ordered. The agent's readings, not checked with him: "next time" is a later chat, after those builds | 12 |
| R0386 | D2008 | leave-war | 13 Nov 26 | silent | Recommended yes, with the drawings' pictures 4 and 6. \| On a PC a short list on the Approvals page still has its card reach the foot of the screen, empty below the last request, as the Balances page does, so the card's edge stays put when a month is picked. On a phone the page stays as today (D2006), so this is the PC's layout only — the agent's reading. | 12 |
| R0387 | D1986 | leave-war | 11 Nov 26 | silent | "can u make the approvals scroll similar to the balances as well" — to chat 64, with his picture of the Leave War's Approvals page on his PC, straight after trying the Balances page's scroll fix on its preview and finding it fixed. \| The Leave War's Approvals page is to scroll as the Balances page does. The agent's reading, not yet checked with him: the page fills the screen u… | 12 |
| R0388 | D1985 | leave-war | 11 Nov 26 | the row says told | this is the second: on a phone he closes the event window by tapping the grid beside it and at once taps the same spot again, and the second tap opens that day — recommended: keep it. \| On a phone, after a Leave War event window is closed by a tap on the grid beside it, a tap on the same spot at once opens that day: keep it, as the one-day window has had it since 6 Nov 26. The… | 12 |
| R0389 | D1984 | leave-war | 11 Nov 26 | the row says told | this is the first: on a phone the Events list's ✕ stands on the spot where the top bar's bell is, so a quick double tap on it closes the list and the second tap opens the bell's list — recommended: leave it. \| On a phone a quick double tap on the Leave War's Events list's ✕ may open the bell's list, because the bell stands under that ✕: leave it — the top bar stays pressable. … | 12 |
| R0390 | D1963 | leave-war | 10 Nov 26 | the row says told | The agent's readings, told to him: his recordings alone did not show 15 better (two blank stretches against five on the live app, within how hard he pulled), so it is built on his own side-by-side look | 12 |
| R0391 | D1962 | leave-war | 10 Nov 26 | the row says told | "Nvm it’s very weird to have the page dead stop." — to chat 52, on the trial link where the page does not spring past its ends, offered as a possible cure for the swipe-down flash and the blank dates on his iPhone. \| A page keeps its spring past its top and foot on his iPhone: the page is never made to stop dead at its ends to cure a fault, since that feels very weird. The age… | 12 |
| R0392 | D1961 | leave-war | 10 Nov 26 | the row says told | the flash on a swipe down — the top bar and the pinned dates gone for a few frames, the grid drawn up to the screen's top — is to be fixed, because it makes the app feel cheap. The agent's readings, told to him: "left as it is" is its reading of "most users won't do that" — not chased further unless he says | 12 |
| R0393 | D1947 | leave-war | 9 Nov 26 | silent | merged on his "merge live". The agent's readings: this is the word D1942 said the Leave War waits for | 12 |
| R0394 | D1871 | leave-war | 8 Nov 26 | silent | the job goes on to its walk, reads and merge (D1796). The agent's reading: his iPhone is the judge D1789's "stops if scrolling gets slower" names | 12 |
| R0395 | D1870 | leave-war | 8 Nov 26 | the row says told | The agent's reading: his answer takes the page's recommendation for question 3 ("yes only if you see the blink on the live app and it is gone on the trial") | 12 |
| R0396 | D1730 | leave-war | 6 Nov 26 | the row says told | The agent's reading, his to strike: the stack of cards keeps its grey back card, as he chose it in D1727 — the review's idea of colouring it was put to him with the agent's lean to keep it, and he did not take it up — confirmed in his words the same evening: "The grey2 is ok". \| `raptor-port/docs/superpowers/plans/2026-11-06-lw-cell-combos.md` (D1730) | 12 |
| R0397 | D1728 | leave-war | 6 Nov 26 | silent | The agent's readings, his to strike: the bare "PO" on an empty gone day stays (D1720 — his words were said of the days holding entries) | 12 |
| R0398 | D1727 | leave-war | 6 Nov 26 | the row says told | The agent's readings, his to strike: the agent flagged at once that the turned PO strip takes about a third of the day's width, so on a posted-out or last day holding two entries the codes do not fit (about 2,800 of 23,940 combinations measured) — how those days look is put to him before the build (on a two-entry PO day, D's yellow line or stripes is the agent's recommendation) | 12 |
| R0399 | D1726 | leave-war | 6 Nov 26 | silent | The agent's readings, his to strike: the cause is the iPhone's smallest-letter floor (9px), which today keeps a box whose letters are set at 10px at 9px under any zoom below 0.9 | 12 |
| R0400 | D1725 | leave-war | 6 Nov 26 | silent | Like how it looks like on the leave war full day vs half day etc. also when u click on it how it looks like how the user interface is and how to navigate to edit it etc" — while the D1722 fix was being built, after D1723 and D1724 \| Every build and walk of the Leave War's entries — this fix, [LW-CELL-COMBOS] and [LW-FULL-EDITING] — covers every combination of entries on a day … | 12 |
| R0401 | D1724 | leave-war | 6 Nov 26 | silent | Replaces the agent's reading "change it on the Inputs page" (D1548, D1553, D1565's readings — never his ruling). | 12 |
| R0402 | D1722 | leave-war | 6 Nov 26 | silent | Built wider, by his D1725 the same hour (the agent's reading, his to strike): an admin's tap on a posted-out day that holds ANYTHING — an Inputs entry, leave, an OIL award, two entries — opens what the same day opens on any other day | 12 |
| R0403 | D1720 | leave-war | 6 Nov 26 | silent | The agent's reading: a tap on such a day opens what a tap on leave there opens, for the admin and the man himself — checked at the build's walk. \| `raptor-port/docs/ui-contracts.md` (§Every SANS man's name… the bullet before it — D1720) | 12 |
| R0404 | D1681 | leave-war | 5 Nov 26 | silent | "as recommended" — to the page's question on the Leave War's Auto-approve switch (recommended: match) \| The Leave War bid windows' Auto-approve switch takes the app's letters, semi-bold, as the window's title and the Inputs window's "Several people" do. The agent's readings: the hold written in the [CSS-FONT-INHERIT] build is taken out, so the switch follows `.pp-sw`'s written… | 12 |
| R0405 | D1630 | leave-war | 4 Nov 26 | silent | Replaces D1629's reading of a faint dash for an empty box. ‹ › open the next day with its figure highlighted again. | 12 |
| R0406 | D1629 | leave-war | 4 Nov 26 | silent | The agent's readings (not yet checked with him | 12 |
| R0407 | D1584 | leave-war | 3 Nov 26 | the row says told | the line is wanted whatever the phone's turn (agent's reading). \| `raptor-port/docs/handpass/2026-11-03-inputs-seen-recheck.md` §His answers | 12 |
| R0408 | D1565 | leave-war | 2 Nov 26 | silent | The agent's readings, as shown on the page: the entry itself is still changed on the Inputs page (D1548) | 12 |
| R0409 | D1555 | leave-war | 2 Nov 26 | the row says told | "2 as recommended" — his answer to the night of 1–2 Nov 26's question (filed as [LW-DELETE-POSTING-MOVE-ASK]): should a Delete posting's date also bar a Move of his already-approved leave? \| A posting out with the Delete outcome refuses approving his leave from its date (D1545) but not moving leave of his already approved: Move and the drag window may carry it onto days from t… | 12 |
| R0410 | D1553 | leave-war | 1 Nov 26 | silent | The agent's readings, shown on the page: (1) a day holding something the war placed beside the Inputs entries (a bid, an award) still opens the day's list, each entry with its buttons | 12 |
| R0411 | D1548 | leave-war | 31 Oct 26 | silent | The agent's readings, not yet checked with him: (1) what the war would refuse on such a day — a leave over a medical or another leave — is not offered or is greyed, as D1543 has it, drawn for him first | 12 |
| R0412 | D1544 | leave-war | 31 Oct 26 | silent | Refuse and Delete stay. The agent's readings, not yet checked with him: (1) the same in the bid window and the day's list, wherever the refused bid's Approve stands | 12 |
| R0413 | D1543 | leave-war | 31 Oct 26 | silent | Pick PM to place the afternoon." — as leave filed on the Inputs page already offers only the free half. The agent's readings: (1) the afternoon held, the words mirror it ("The afternoon is LL. | 12 |
| R0414 | D1542 | leave-war | 31 Oct 26 | silent | The agent's readings: (1) "no row" is any man the war's grid does not draw — a SANS man while SANS is off, an archived man | 12 |
| R0415 | D1541 | leave-war | 31 Oct 26 | silent | The agent's readings, not yet checked with him: (1) for a posting out as Overseas Sqn, Transfer or with no outcome chosen | 12 |
| R0416 | D1520 | leave-war | 29 Oct 26 | silent | [n] carried fwd · till <date>". The agent's reading, from the page he answered: phone only (up to 700 wide, the window's phone rule), the tile's top row one line taller there | 12 |
| R0417 | D1517 | leave-war | 29 Oct 26 | silent | above 1100 they stand side by side in the window twice as wide. The agent's reading: his "merge live" to the page that recommended keeping it is his yes to that recommendation (two lists side by side there left a name no room and cut the ✕ off — the fresh code read's R1) | 12 |
| R0418 | D1516 | leave-war | 29 Oct 26 | silent | The agent's reading: the redraw approved with it ("As recommended" to the page that put it for a last look). \| `raptor-port/docs/ui-contracts.md` §The Leave War's Events list (D1516) | 12 |
| R0419 | D1514 | leave-war | 29 Oct 26 | silent | The agent's readings: each section headed with its name and count, as the Settings window's own section heading | 12 |
| R0420 | D1513 | leave-war | 29 Oct 26 | silent | The agent's readings: on a phone and a desktop alike | 12 |
| R0421 | D1512 | leave-war | 29 Oct 26 | silent | "theres no edit icon or cross icon" — beside his colleague's two lists (an Edit and a Remove button on every line) and the mock-up of the Events list split into Holidays and Squadron events (question 3, option A) \| Each line of the Leave War's Events list shows plainly how to edit it and how to delete it — a control a person can see on the line itself, not only a tap on the li… | 12 |
| R0422 | D1512 | leave-war | 29 Oct 26 | silent | The agent's readings, drawn for him as question 5 before anything is built: (1) the edit control is the app's one pencil (D1134) and opens the event's own window, as the tap does | 12 |
| R0423 | D1511 | leave-war | 29 Oct 26 | silent | a desktop keeps the floating window. The agent's reading of "at the top": the D1264 full page from the top — checked against the app, where `Sheet`'s `page` form does exactly that. | 12 |
| R0424 | D1506 | leave-war | 29 Oct 26 | silent | It should go back from OIL to the inital page" — his iPhone pictures: the Approvals page, Saber's person window opened from it, its OIL figure pressed, the OIL tracker, its ✕, the grid \| The OIL tracker opened from the Leave War's Approvals page closes back onto that page as he left it — its lit lines, its dots, the dates picked and its place in the list — not onto the grid. I… | 12 |
| R0425 | D1506 | leave-war | 29 Oct 26 | silent | The agent's readings: as with the Balances page (D1503), every way in from that page — the OIL line of a person window opened there (his case), his own person window opened by My leave (his next message the same minute: "And from approvals, my leave, oil, and it should go back to the inital page") and the OIL tab pressed while the page is up | 12 |
| R0426 | D1505 | leave-war | 29 Oct 26 | silent | "can u move the title up abit by default so that we don't see some leaking of text behind the title at the top part as circled" — his iPhone picture of the Balances page, the boxes' bottom edges of the first row showing in a thin band above the column headings \| On a phone the Balances page's row of column headings sits flush under the page's bar, at rest and at every zoom, so… | 12 |
| R0427 | D1504 | leave-war | 29 Oct 26 | silent | at the lift both stay so. The agent's reading: the same holds for the OIL tracker's headings, which share the pinch's set-up — checked there and fixed with it if they show the same. | 12 |
| R0428 | D1503 | leave-war | 29 Oct 26 | silent | "Weird that when u click into OIL from balances it goes into OIL page but when u exit it goes into leave war page and not back to the same balances page" — his iPhone recording: the Balances page, an OIL figure pressed, the OIL tracker, its ✕, the grid \| The OIL tracker opened from the Balances page closes back onto the Balances page as he left it — the same view, place in the… | 12 |
| R0429 | D1502 | leave-war | 29 Oct 26 | silent | The agent's readings, his to change: (1) the column cannot be deleted on Quals, as it is what the war reads | 12 |
| R0430 | D1501 | leave-war | 29 Oct 26 | silent | The agent's readings, his to change: (1) the file is a plain spreadsheet file the app writes and reads itself, no new library (the builder's call, M5 plan §4), columns From, To, Name, Kind (PH or Off day), On grid | 12 |
| R0431 | D1500 | leave-war | 29 Oct 26 | silent | The agent's readings, his to change: (1) each line is drawn as a line of the Calendar window's Holidays list, its kind the square and word a tap on a filled event cell already shows | 12 |
| R0432 | D1500 | leave-war | 29 Oct 26 | silent | — NARROWED 29 Oct 26 BY D1512: each line also shows an edit icon and a cross icon on the line itself (the tap stays — the agent's reading). \| `raptor-port/docs/superpowers/plans/2026-10-28-lw-m5-plan.md` §7 (D1500) | 12 |
| R0433 | D1499 | leave-war | 29 Oct 26 | silent | The agent's readings, his to change: (1) 215 words become 104 | 12 |
| R0434 | D1497 | leave-war | 29 Oct 26 | silent | The agent's reading: the row's 6px is whatever stands above it on the locked page (not looked into) | 12 |
| R0435 | D1493 | leave-war | 29 Oct 26 | silent | "All as recommended." — to the M5a drawing-differences page (A–G and the readings R1–R11, each with its recommendation), after his "Merge live after u check" \| M5a's drawing differences are settled as recommended: the desktop person window back to its drawn place, its leave lines flat rows with only the dot for new, the Balances names set left, a member's locked amber figures … | 12 |
| R0436 | D1493 | leave-war | 29 Oct 26 | silent | The agent's readings: (1) A, B, D and E are fixed on M5a's branch before its merge, each checked beside its drawing | 12 |
| R0437 | D1493 | leave-war | 29 Oct 26 | silent | (2) R1–R11 are the readings listed on the page (tabs dropping icons at 701–760 wide | 12 |
| R0438 | D1492 | leave-war | 28 Oct 26 | the row says told | "as recommended" — M5a's build spec page (`raptor-port/docs/mock/lw-overhaul/m5-questions.html`, version 16), its 24 readings "built as recommended, yours to strike" \| The 24 readings of the Leave War M5a build spec stand as put to him, none struck: among them CCL, FCL, PL, EL and CL come down by themselves as approved, a balance changes only by its box, approved leave and 1 J… | 12 |
| R0439 | D1490 | leave-war | 28 Oct 26 | silent | The agent's reading, for the build: each grade given, and each grade's days, are kept with the day they took effect (the spec's §3). | 12 |
| R0440 | D1483 | leave-war | 28 Oct 26 | the row says told | four tabs share the top row with ⚙ in round 19's tighter spacing, and on a narrow iPhone (375 wide) the tabs drop their icons. The agent's reading (corrected 28 Oct 26 on the fresh reader's check — the page told him only of 375 wide): the cut-off is under 400 wide, so his 402-wide iPhone keeps the icons (drawn: `m5b-b5-tabs-402`). | 12 |
| R0441 | D1481 | leave-war | 28 Oct 26 | silent | The agent's reading: drawn as built, `raptor-port/docs/mock/lw-overhaul/full/m5a/m5a-p7-myleave-today.png`. | 12 |
| R0442 | D1480 | leave-war | 28 Oct 26 | silent | The agent's readings, as drawn: a half day reads "Thu 29 Jan, AM · 0.5" | 12 |
| R0443 | D1479 | leave-war | 28 Oct 26 | silent | The agent's readings: the app keeps the typed figure and its date and takes off each approval after it (what was D1472's question 1 reading A) | 12 |
| R0444 | D1477 | leave-war | 28 Oct 26 | silent | The agent's readings: after a press, the pressed month stays lit while the grid sits where the jump left it (at the year's end the grid cannot bring December to the left edge) | 12 |
| R0445 | D1476 | leave-war | 28 Oct 26 | silent | "Follow the schedule" — answering the agent's question on his page (`raptor-port/docs/mock/lw-overhaul/m5-questions.html`, the names as pucks): the schedule's lighter colours as drawn (recommended), or the Leave War's darker name colours of 4 Sep 26 \| The Leave War grid's name pucks take the schedule's own puck colours — its olive for a pilot, its green for a WSO, its light pu… | 12 |
| R0446 | D1476 | leave-war | 28 Oct 26 | silent | The agent's readings: the 4 Sep 26 settled note (a full-width seat bar, in deeper hex than the flight line's pucks) is replaced for the grid's names: the puck keeps the schedule's own size and look, as drawn (`raptor-port/docs/img/handpass/2026-10-28-lw-name-pucks/-puck2.png`) | 12 |
| R0447 | D1472 | leave-war | 28 Oct 26 | silent | The agent's readings, to check with him at M5a's drawings: a leave counts by the date it falls on, on or after the day App bal was typed | 12 |
| R0448 | D1471 | leave-war | 28 Oct 26 | the row says told | The agent's readings, to draw and put to him: the puck's own letters, chip and fade where a long name does not fit | 12 |
| R0449 | D1470 | leave-war | 28 Oct 26 | silent | "and ground personnel is going to be G instead" — his four iPhone pictures of 28 Oct 26, 15:42–15:43: the M5 questions page's Leave War drawings, the Scheduler Board's crew list, and the live Leave War grid on a phone with "Led…", "Re…", "Co…" cut short beside separate OCU and GND badges \| On the Leave War ground personnel's chip reads "G", not "GND". The agent's readings: its… | 12 |
| R0450 | D1469 | leave-war | 28 Oct 26 | silent | Same colour as well" — his four iPhone pictures of 28 Oct 26, 15:42–15:43: the M5 questions page's Leave War drawings, the Scheduler Board's crew list, and the live Leave War grid on a phone with "Led…", "Re…", "Co…" cut short beside separate OCU and GND badges \| On the Leave War an OCU man's chip reads "O", in the same colour as his puck's OCU chip on the schedule, not "OCU".… | 12 |
| R0451 | D1468 | leave-war | 28 Oct 26 | silent | "Can we just make the leave war to be puck style like the chip is now merged with the name." — his four iPhone pictures of 28 Oct 26, 15:42–15:43: the M5 questions page's Leave War drawings, the Scheduler Board's crew list, and the live Leave War grid on a phone with "Led…", "Re…", "Co…" cut short beside separate OCU and GND badges \| On the Leave War grid each person's name is… | 12 |
| R0452 | D1464 | leave-war | 28 Oct 26 | silent | it goes when he picks another filter or leaves Approvals. The agent's reading of D1421 (a decided line stays where it is) carried to the month chips of D1439 and D1444. \| `raptor-port/docs/handpass/2026-10-27-lw-m4.md` (§13 — D1464) | 12 |
| R0453 | D1463 | leave-war | 28 Oct 26 | silent | what it does, where it sits and that it is remembered are unchanged (D1147, D1186, D1187, D1302). The agent's readings: its words are shown in one place only, the title bar of the one-day and the drag windows | 12 |
| R0454 | D1462 | leave-war | 28 Oct 26 | silent | not cyan. The agent's readings: 13px, semi-bold, the app's white (var(--ink)) | 12 |
| R0455 | D1461 | leave-war | 28 Oct 26 | silent | The agent's readings: the row's choice shows only on a leave of more than one day | 12 |
| R0456 | D1460 | leave-war | 28 Oct 26 | the row says told | I think the user should be informed. if not they might get a shock when they see a published schedule if its not there yeah." (28 Oct 26, about 09:45) — his reading of R15 on his M4 page (https://claude.ai/artifact/DSp8hQJq2EsAWK7asmx6Hj) ("an admin's re-type of a member's pending bid tells him nothing"), which D1447 had let stand \| A member is told by his bell when someone el… | 12 |
| R0457 | D1460 | leave-war | 28 Oct 26 | silent | reading R15 is struck. The agent's readings, checked today: the other changes by someone else already tell him — a decision, an approved leave sent back, moved or deleted (D1142), his pending bid moved or deleted (the register's P10), a bid replaced by an input (P11), an Undo of a decision he read (D1216) | 12 |
| R0458 | D1448 | leave-war | 28 Oct 26 | silent | how that one day is reached is drawn for him with options before anything is built. The agent's readings, checked today: Approvals already decides a several-day request as one line (`raptor-port/src/leavewar/state/store.ts` decideRequests), while a tap on one of its days on the grid opens the bid window for that day alone (decideRequestById) | 12 |
| R0459 | D1447 | leave-war | 28 Oct 26 | silent | "all as recommended" (28 Oct 26, about 05:00) — his M4 page (version 7, https://claude.ai/artifact/DSp8hQJq2EsAWK7asmx6Hj), its readings to strike: R12–R17 and R19 (version 6's) and R20, R21 (the night's), none struck \| — NARROWED 31 Oct 26 BY D1541: R20 is struck — the posting-out date refuses no leave (a Delete posting keeps its refusal from its date, the agent's reading) | 12 |
| R0460 | D1447 | leave-war | 28 Oct 26 | the row says told | R21 stands. — NARROWED 28 Oct 26 BY D1460: R15 is struck — a member is told when someone else re-types his pending bid. The readings put to him on the M4 page stand as built: R12–R17 and R19 (version 6), and R20 — a man's leave is refused only on days from his posting-out date on, whether or not the posting has run, a day before it approving — and R21 — a man deleted on Admin … | 12 |
| R0461 | D1446 | leave-war | 28 Oct 26 | silent | "all as recommended" (28 Oct 26) — his M4 page (version 7, https://claude.ai/artifact/DSp8hQJq2EsAWK7asmx6Hj), question 22 (recommended: keep the build's words), shown his drawing r22-1-desk's "PO 1 Mar" beside the build's "posting out 1 Mar · Overseas Sqn" under a man's puck in Approvals \| Under a man posting out, the Leave War's Approvals list keeps the build's words — "post… | 12 |
| R0462 | D1445 | leave-war | 28 Oct 26 | silent | "all as recommended" (28 Oct 26) — his M4 page (version 7, https://claude.ai/artifact/DSp8hQJq2EsAWK7asmx6Hj), question 21 (recommended: the drawings' darker shade on both), told that the slim bar's fill is one shade lighter than both drawings (the app's raised grey #20262E, the drawings #161B22) \| The Leave War's slim Approvals bar takes the darker fill of his drawings r22-4-… | 12 |
| R0463 | D1444 | leave-war | 28 Oct 26 | silent | it goes when he picks another filter or leaves Approvals. The agent's readings: the drawing is `img/handpass/2026-10-27-lw-m4/d1439/` (`scripts/handpass/lw-m4-d1439-mock.mjs`), its measures the build's first check (63px saved with two months at 402, 390, 360) | 12 |
| R0464 | D1441 | leave-war | 28 Oct 26 | silent | the desktop's buttons are unchanged. The agent's readings: the letter size and weight are measured off the drawing, and the buttons then measure the drawing's own | 12 |
| R0465 | D1440 | leave-war | 28 Oct 26 | the row says told | "As recommended" (28 Oct 26) — his answer to his M4 side-by-side page (version 6, https://claude.ai/artifact/DSp8hQJq2EsAWK7asmx6Hj), question 17 (recommended: back to the drawing, as on the desktop), told that the page's first version had wrongly called the phone's slim bar a match \| On a phone the Leave War's slim Approvals bar on the grid goes back to his drawing r22-6-phon… | 12 |
| R0466 | D1439 | leave-war | 27 Oct 26 | silent | Pick dates… and Approve all keep their row. — NARROWED 28 Oct 26 BY D1464: a month's chip does not go with its last request while that request, just decided, is still on the list — it stays, dimmed, until he picks another filter or leaves Approvals. The agent's readings: the chips keep their size (D487) | 12 |
| R0467 | D1438 | leave-war | 27 Oct 26 | silent | Fix the phone too." — with his desktop picture of the Approvals list \| In the Leave War's Approvals list, on a desktop and a phone, a name stands at the left of its puck, DAYS and LVE BAL and their figures are set to the left, and LOWEST AVAIL lines its numbers up in one column, its heading over the numbers, each row's name (W, P, OPS P) before its number. The agent's readings… | 12 |
| R0468 | D1437 | leave-war | 27 Oct 26 | silent | Check the desktop too" — with his picture of the Approvals list on his phone (the column headings DAYS · LVE BAL · LOWEST AVAIL · PLACED over a request's second line, "1 day 14 W 17") \| In the Leave War's Approvals list each column's heading stands exactly over its figures, on a phone and on a desktop: a figure set to the left starts where its heading starts, one set to the … | 12 |
| R0469 | D1435 | leave-war | 27 Oct 26 | the row says told | "all as recommended" (27 Oct 26) — his answer to the M4 side-by-side page, question 15 (recommended: narrower buttons on a phone) — his word under D487 for these two buttons \| On a phone Approve and Refuse in the Leave War's Approvals list are made a little narrower, with less padding at their sides and the same height, so on a narrow phone a line's date stays on one line and … | 12 |
| R0470 | D1433 | leave-war | 27 Oct 26 | silent | keep the build's ages) \| The bell's Leave War bidding lines start with a capital, "Bidding closed", as his drawing writes them, and keep the ages the bell writes for every notice ("now", "2 min", "1 h", "yesterday", "2 d"), not the drawing's "5m", "1d". The agent's reading: every bell line that begins with the word bidding takes the capital, open and closed alike | 12 |
| R0471 | D1432 | leave-war | 27 Oct 26 | the row says told | "all as recommended" (27 Oct 26) — his answer to the M4 side-by-side page, question 11 (recommended: back to the drawing) \| On a desktop the Leave War's slim Approvals bar on the grid goes back to his drawing: compact, about half as wide, no cyan outline, "Back ▴" as plain cyan words and a plain ✕. The agent's readings: the phone's slim bar is unchanged | 12 |
| R0472 | D1430 | leave-war | 27 Oct 26 | silent | the build's "+N pending in <period> ›" link stays. The agent's readings: the header as drawn — "15 pending · 3 new since you last looked, Wed 7 Jan 16:40", the time being when "new" counts from | 12 |
| R0473 | D1429 | leave-war | 27 Oct 26 | the row says told | "Maybe move lower avail and placed abit more space to the right. dont wanna confused the lve bal numbers on the left" — on his drawing r22-2's column headings (LVE BAL · LOWEST AVAIL · PLACED, circled), his answer to question 4 of the M4 side-by-side page (recommended: back to the drawing's packed columns) \| On a desktop the Leave War's Approvals columns go back to his drawing… | 12 |
| R0474 | D1428 | leave-war | 27 Oct 26 | silent | a second tap on the lit button still sends it back to pending (D1421). The agent's reading: the store already decides an approved leave straight to refused (the bid windows' path) | 12 |
| R0475 | D1427 | leave-war | 27 Oct 26 | silent | lit, the drawing's green and red with dark words. The agent's reading: the colours as measured off the drawings (at rest fill #12161B, edge #27303B, words #7EE2A0 and #FF8A92 | 12 |
| R0476 | D1423 | leave-war | 27 Oct 26 | silent | then Pick dates… at the left and Approve all at the right — with every chip's words on one line, never a fourth row. — NARROWED 28 Oct 26 BY D1444 (building D1439): on a phone only the months holding requests show, on the row of New and All, a picked month or one with a line still on the page staying. The agent's reading: the first build kept the drawing's three rows but "New … | 12 |
| R0477 | D1422 | leave-war | 27 Oct 26 | the row says told | The agent's reading: written by the admin's place-and-approve command as D1142's lines are, so his Undo takes it as D1216 says | 12 |
| R0478 | D1421 | leave-war | 27 Oct 26 | silent | the tab's count and "Approve all" count only what is still pending. The agent's readings, on the page: "leaving" is choosing another tab or the page, or ✕ on the slim bar and then elsewhere — a tap on a request's dates with the slim bar up is not leaving (the lit lines survive Back) | 12 |
| R0479 | D1397 | leave-war | 26 Oct 26 | silent | The agent's readings: "0.5" with its zero, as he wrote it, since the pick stands alone with no whole number before it | 12 |
| R0480 | D1394 | leave-war | 26 Oct 26 | silent | The agent's reading: offered as on the one-day window (an admin's | 12 |
| R0481 | D1391 | leave-war | 26 Oct 26 | the row says told | The agent's reading, put to him with the picture: Grant OIL asks only FO (a day — Days for more than one) or HO (half a day). | 12 |
| R0482 | D1389 | leave-war | 26 Oct 26 | the row says not told | The agent's reading: the same holds for any later move of it back under Unavailable — it then counts him out again, as every commitment there does (D1357). | 12 |
| R0483 | D1388 | leave-war | 26 Oct 26 | the row says told | The agent's readings, told to him: a member's retyping of his Other into a kind that lands elsewhere by itself (an Attach, under Unavailable) is held the same way once a scheduler has moved it | 12 |
| R0484 | D1388 | leave-war | 26 Oct 26 | the row says told | The agent's readings, put to him in the closing report: it holds for every input a scheduler moved, not only an Other | 12 |
| R0485 | D1382 | leave-war | 26 Oct 26 | silent | The agent's readings, to show him in the build's picture: the order runs down each column as it does today (Required P, Available P, Required W, Available W, then the manning rows) | 12 |
| R0486 | D1380 | leave-war | 25 Oct 26 | the row says not told | where he is attached (its "To") is not asked on the Leave War and is added on the Inputs page. The agent’s reading: the window’s Remarks go into the Attach’s remarks, as an Other’s do | 12 |
| R0487 | D1379 | leave-war | 25 Oct 26 | silent | a member’s bid window gets a ⋯ in the row under the leaves holding only Attach. The agent’s readings: a member files it only on his own row, on the dates the war lets him file an overseas duty, with no approval and no document (D1318). | 12 |
| R0488 | D1378 | leave-war | 25 Oct 26 | silent | The agent’s reading: like the war’s Other, the same kind already on that half is left as it is and said. | 12 |
| R0489 | D1358 | leave-war | 25 Oct 26 | silent | The agent's readings: on a phone the Manning rows still open by themselves with it (D1227, D1258) | 12 |
| R0490 | D1357 | leave-war | 25 Oct 26 | silent | The agent's readings: a course and an overseas duty count him out wherever they sit, as built | 12 |
| R0491 | D1356 | leave-war | 25 Oct 26 | the row says told | The agent's readings, put to him with the page: a member who picks Unavailable lowers the Leave War's count himself, with no admin between (his words above) | 12 |
| R0492 | D1355 | leave-war | 25 Oct 26 | silent | The agent's readings: checked today — nothing is lit on a refused bid in either window (`docs/img/handpass/2026-10-24-lw-r2/questions/q1-today-.png`) | 12 |
| R0493 | D1354 | leave-war | 25 Oct 26 | silent | The agent's readings: checked today — the approved leave opens `RemarksSheet` (labelled rows, a 68 px light box, its own Save) and the closed day its own window (labelled rows, a one-line box), pictured `q2-today-a-.png`, `q2-today-b-.png` | 12 |
| R0494 | D1353 | leave-war | 25 Oct 26 | silent | The agent's readings: checked today — the day opens the day's list, read only for a member (`docs/img/handpass/2026-10-24-lw-r2/rewalk/u7b-list-phone.png` and the round 2 sheet's R-F3), while a half-day leave's day opens its window with the free half lit (`r1-today-window-phone.png`) | 12 |
| R0495 | D1352 | leave-war | 25 Oct 26 | the row says told | The agent's reading: checked today — on Thu 10 Dec a whole-day UNA took Available P 28 → 27 and the SANS calendar's pilots still needed 2 → 3, yellow to orange (`r3-today-before-.png`, `r3-today-after-.png`). \| `raptor-port/docs/handpass/2026-10-24-lw-round2.md` (his answers — D1350 to D1353) | 12 |
| R0496 | D1351 | leave-war | 25 Oct 26 | silent | The agent's readings: checked today — an OD filed from the one-day window raised "This bid turns Available P red." (`r2-today-od-phone.png` | 12 |
| R0497 | D1350 | leave-war | 25 Oct 26 | the row says told | The agent's reading: checked today — Mon 30 Nov holding an approved morning LL, OD pressed: a whole-day OD beside the morning's leave (`r1-today-window-phone.png`, `r1-today-cell-phone.png`). \| `raptor-port/docs/handpass/2026-10-24-lw-round2.md` (his answers — D1350 to D1353) | 12 |
| R0498 | D1349 | leave-war | 25 Oct 26 | silent | the grey becomes a question of an Other's colour. His direction, drawn for him before anything is built: UNA drawn grey, and its button moved into the bid window's ⋯ menu, while Grant OIL (+OIL), which is commonly used, takes UNA's third place in the row under the leaves. The agent's readings: it changes D1325 (UNA deep teal) and D1326 / D1338 (the row's third place UNA for an… | 12 |
| R0499 | D1346 | leave-war | 25 Oct 26 | silent | The agent's reading: checked today — next-door bids with the same leave and words are one run (`store.ts setRequestWords`) and an approval files such a run as one input (`sync.ts doorApprove`) | 12 |
| R0500 | D1345 | leave-war | 25 Oct 26 | silent | a row already red that goes further down raises it again. The agent's readings: checked today — `Matrix.tsx raiseIfWorse` raises it only when a row's LEVEL worsens (ok to amber, amber to red), so a red row going 27 → 26 raises nothing | 12 |
| R0501 | D1344 | leave-war | 25 Oct 26 | the row says not told | "this bid turns available P red. the box is in amber can u make it red." — his report on the branch's build \| The manning bubble is drawn in the colour of the worst level it names: red when it says a row turns red, amber when it says amber. The agent's reading: today its box is amber whatever it says (`Matrix.tsx`, the bubble's style) — not checked further. | 12 |
| R0502 | D1341 | leave-war | 25 Oct 26 | silent | The agent's reading: what the box shows before anything is typed, where the days' remarks differ, is still his question (asked the same day: will it show both?). | 12 |
| R0503 | D1339 | leave-war | 25 Oct 26 | silent | The agent's readings: checked today — a run of bids placed together already shares its words (`store.ts setRequestWords` changes every bid of the run), and an approval files a run as one input with one remark (`sync.ts doorApprove`) | 12 |
| R0504 | D1333 | leave-war | 24 Oct 26 | the row says not told | remarks shown read only wrap the same way. The agent's readings: it starts one line tall, as drawn, and grows a line at a time as the words wrap (not checked against any limit — none is set) | 12 |
| R0505 | D1332 | leave-war | 24 Oct 26 | silent | The agent's reading: his next message asked what change 6 is, so "looks good" is not read as his word for that size change | 12 |
| R0506 | D1331 | leave-war | 24 Oct 26 | silent | The agent's readings, drawn by `raptor-port/scripts/handpass/lw-q6-half-am.mjs`: with AM lit the leave buttons read "<LL", "<OL" as they already do today whenever AM is picked (run, Drifter, Fri 6 Nov) | 12 |
| R0507 | D1330 | leave-war | 24 Oct 26 | silent | The agent's readings, drawn: the lit look as drawn by `raptor-port/scripts/handpass/lw-twoday-look.mjs` (the Approve fill stronger, its edge solid green — a new look: today an approved leave's Approve looks like any other) | 12 |
| R0508 | D1329 | leave-war | 24 Oct 26 | silent | the approved leave's "Back to bid" is shortened to fit, drawn for him to pick how. — ANSWERED 24 Oct 26 BY D1330: A — the bid window's own row, Approve lit on an approved leave, a second tap sending it back to waiting. The agent's readings, drawn: (A, recommended) the row the bid window already has — Approve shown lit on an approved leave, a second tap on it sending the leave … | 12 |
| R0509 | D1328 | leave-war | 24 Oct 26 | silent | The agent's readings, drawn: "Morning · approved", "Afternoon · change it on the Inputs page", the remark and the document as they are | 12 |
| R0510 | D1327 | leave-war | 24 Oct 26 | silent | the reading below that the box "keeps the kind's words beside it" is withdrawn. As said: "<LL" in leave's gold, "HO" in OIL given's green | 12 |
| R0511 | D1327 | leave-war | 24 Oct 26 | silent | The agent's readings: the box keeps the kind's words beside it ("local leave, morning · approved") | 12 |
| R0512 | D1326 | leave-war | 24 Oct 26 | silent | The agent's readings, drawn for him: a member, who has none of the three, sees the place empty | 12 |
| R0513 | D1321 | leave-war | 24 Oct 26 | silent | The agent's reading: the calendar's small key under the month shows a filled square for an absence and an outlined one for a duty. | 12 |
| R0514 | D1322 | leave-war | 24 Oct 26 | silent | The agent's readings: "pink" covers magenta and rose | 12 |
| R0515 | D1320 | leave-war | 24 Oct 26 | silent | Also Grant OIL is green" — with his picture of round 3's drawing of the bid window's ⋯ opened (Grant OIL, Post out, Post in in the Also buttons' hatched grey look), the ⋯ a bare grey glyph beside ✕ \| In the bid window, "Grant OIL" is drawn in the green of OIL given — the FO and HO boxes' green — not the grey of the posting buttons beside it. The agent's readings: it is the col… | 12 |
| R0516 | D1318 | leave-war | 24 Oct 26 | silent | and they ask for no document. The agent's readings, to draw for him in round 2: each is saved as the Inputs-page input it is (one record, seen on the Inputs calendar and the schedule), not as a bid | 12 |
| R0517 | D1316 | leave-war | 24 Oct 26 | the row says told | the leaves and FO / HO keep their colours as built. — NARROWED 24 Oct 26 BY D1322: no pink — the OIL taken leaves the magenta for another colour, his to pick. The agent's reading, told to him: "Q2" read as set C, the one choice the page put for Q1 and Q2 together (D1309 redrew them as sets C and D) | 12 |
| R0518 | D1315 | leave-war | 24 Oct 26 | silent | round 3's changes carry to the window such a day opens. The agent's readings: today a day holding two entries opens the day's list (one card per entry, each with its own buttons — checked on the demo's Thu 5 Feb, a morning LL and an afternoon HO award), not the bid window | 12 |
| R0519 | D1314 | leave-war | 24 Oct 26 | silent | The agent's readings: on a day already holding the bid (D1296) the same — only rows standing amber or red, else "No manning row is amber or red" | 12 |
| R0520 | D1313 | leave-war | 24 Oct 26 | silent | The agent's readings, drawn for him: each row stays a pair — its name, then its figures — with a dot between pairs | 12 |
| R0521 | D1312 | leave-war | 24 Oct 26 | silent | a real squadron's store still starts with none (D669). The agent's readings: the six are six of the eleven the demo carried until D669, word for word (Crew sets, IP, IWSO, OPSP, OPSW, SXO — `leavewar/testing/eleven.ts`) | 12 |
| R0522 | D1307 | leave-war | 24 Oct 26 | silent | Who may change them is unchanged (the member his own, an admin any) — the agent's reading, checked against D418 and `perms.ts` at the build. | 12 |
| R0523 | D1302 | leave-war | 24 Oct 26 | silent | The agent's readings: remembered per admin on that device, as the Manning fold is (D1258) | 12 |
| R0524 | D1301 | leave-war | 24 Oct 26 | silent | The agent's reading: each round is redrawn with the answers before it in place. \| `raptor-port/docs/superpowers/briefs/2026-10-25-lw-questions-v7.md` (the questions in order, D1301 — first homed in the claude/lw-m3-placing-leave handoff block, removed once that branch merged) | 12 |
| R0525 | D1296 | leave-war | 24 Oct 26 | silent | Instead of the misleading no manning row turns red or amber?" — with his four iPhone pictures of pull request 569: Saber's 2 Dec before the bid ("Available P 28 → 27 · red"), the bubble after it, the grid's Available P 27 in red, and the reopened window reading "No manning row turns amber or red" \| A bid window opened on a day that already holds the bid shows that day's mannin… | 12 |
| R0526 | D1295 | leave-war | 24 Oct 26 | silent | Or maybe like arrow down and a + how many number for inputs etc" — with his iPhone picture of pull request 569's day panel (Mon 30 Nov, "AWAY · 19", nine shown, the rest below the panel's foot with nothing saying so) \| — ANSWERED 8 Nov 26 BY D1788: the cue is the bell's grey foot, not pressable, counting the lines not wholly in view. When the Leave War's day panel lists more t… | 12 |
| R0527 | D1294 | leave-war | 24 Oct 26 | silent | no rest of the finger is needed first. The agent's readings: the cause is the drag's hold — a finger must rest 180 thousandths of a second, and one that moves more than about 8 points before then is taken for a scroll (`leavewar/ui/OpenDatesSheet.tsx` HOLD_MS) | 12 |
| R0528 | D1292 | leave-war | 24 Oct 26 | silent | its ✕ still takes it off. The agent's readings: it is M3's named leftover ("a document chip's name does not open the file yet") | 12 |
| R0529 | D1290 | leave-war | 24 Oct 26 | the row says told | days already in view do not move. The agent's readings, to be shown to him with a picture before it is built: the scroll is the grid's own, smooth (D991), and only as far as needed | 12 |
| R0530 | D1289 | leave-war | 24 Oct 26 | the row says told | The agent's readings, to be shown to him with a picture before it is built (D541, D853): the mark is the grid's existing selection wash and ring (`matrix.css .selcell`), never a new colour | 12 |
| R0531 | D1288 | leave-war | 23 Oct 26 | silent | The agent's readings, not his words: the same holds for a desktop's Ctrl+scroll and where the dates are frozen under the top bar (his picture) | 12 |
| R0532 | D1287 | leave-war | 23 Oct 26 | silent | The agent's readings, not his words: the pinned parts still grow and shrink with the days and stay over their own rows and columns | 12 |
| R0533 | D1286 | leave-war | 23 Oct 26 | the row says told | The agent's readings, told to him on the page: every desktop in the squadron has a mouse or trackpad | 12 |
| R0534 | D1285 | leave-war | 23 Oct 26 | the row says told | The agent's readings, told to him on the page: so that the Leave War zooms one way everywhere | 12 |
| R0535 | D1284 | leave-war | 23 Oct 26 | the row says told | "All as recommended" — to the four pinch-zoom questions put to him with pictures at his iPhone's size (his page https://claude.ai/artifact/Lb6KypdQGnGA167rVJY9M6, source `raptor-port/docs/img/mock/lw-pinch/questions-page.html`, after his screen recording of the frozen date row drifting under Safari's pinch) \| Q3, answer A: The Leave War grid zooms in no further than today's + … | 12 |
| R0536 | D1283 | leave-war | 23 Oct 26 | the row says told | The agent's readings, told to him on the page: a desktop's Ctrl+scroll or trackpad pinch keeps the same limits (D1228) | 12 |
| R0537 | D1282 | leave-war | 23 Oct 26 | the row says told | The agent's readings, told to him on the page: the pinch is the app's own one body (`raptor-port/src/ui/pinchzoom.ts`), the frozen row stretched with the grid as Quals' pinned heading row is (checked: `raptor-port/src/ui/QualsPage.tsx`, its `also` and paused follow) | 12 |
| R0538 | D1279 | leave-war | 23 Oct 26 | silent | The agent's readings: the two boxes take the taller one's height, My leave's two lines (about 32px at 390 wide), not a fixed number, so wider letters keep them equal | 12 |
| R0539 | D1278 | leave-war | 23 Oct 26 | silent | The agent's readings: measured against the drawing at 390 wide, the rows' padding and My leave's minimum height are what made them taller (checked in `raptor-port/src/leavewar/ui/chrome.css`, the phone block at 700 and under) | 12 |
| R0540 | D1267 | leave-war | 23 Oct 26 | silent | with nothing open for him his grid draws as normal and the chip reads "Bidding closed". Confirms the agent's reading recorded under D1177 ("with nothing open the grid shows as normal"), now his ruling | 12 |
| R0541 | D1266 | leave-war | 23 Oct 26 | the row says not told | The agent's reading: re-read today on a timer at midnight and when the page is shown again (a phone that slept). | 12 |
| R0542 | D1264 | leave-war | 23 Oct 26 | silent | with it, his ask to drag across months, already D1169 and built \| On a phone the Leave War's "Open for bidding" window opens as a full page from the top of the screen, its month buttons at the top, so they stay in one place however the list of open stretches below them grows or shrinks. The agent's readings, his to strike: a phone only (his pictures | 12 |
| R0543 | D1263 | leave-war | 22 Oct 26 | silent | The agent's reading: not reachable today in one browser (the admin's closing sits on the one shared timeline above the member's step) | 12 |
| R0544 | D1259 | leave-war | 22 Oct 26 | the row says told | The agent's readings, told to him: with G1 (D1256) the Event rows stand under the Manning rows, above the people, so nothing parts a Manning figure from its date | 12 |
| R0545 | D1258 | leave-war | 22 Oct 26 | silent | The agent's readings: the red count stays on the Manning button while folded (D1243), so folding hides no warning | 12 |
| R0546 | D1257 | leave-war | 22 Oct 26 | silent | The agent's readings: the date heading that stays at the top when the grid scrolls is then the dates alone, shorter by the band's height. | 12 |
| R0547 | D1256 | leave-war | 22 Oct 26 | silent | The agent's readings: the Event rows (kept full, D1259) stand under the Manning rows | 12 |
| R0548 | D1255 | leave-war | 22 Oct 26 | silent | The agent's readings: an admin cannot type OIL there either | 12 |
| R0549 | D1254 | leave-war | 22 Oct 26 | silent | The agent's readings, as drawn: the grid bar reads [▾ Manning · 1 red ›] · the open dates · … · Legend (D1243) | 12 |
| R0550 | D1253 | leave-war | 22 Oct 26 | silent | The agent's readings: tight on a phone (five tiles across), so it is checked on his iPhone when built. | 12 |
| R0551 | D1252 | leave-war | 22 Oct 26 | silent | The agent's readings: the pending figure is written with its minus, "−1", as LVE's "−2.5" is | 12 |
| R0552 | D1251 | leave-war | 22 Oct 26 | silent | the word "Pending" is a grey label like the others. On the Leave War's balance tiles and balances page every pending figure is amber — LVE's "Pending" as much as another kind's "1 pending" — so a figure still waiting on a decision reads the same everywhere. The agent's readings: amber already means "look at this" in the app (the design guide's colour table: an advisory, a late… | 12 |
| R0553 | D1249 | leave-war | 22 Oct 26 | silent | B5 as recommended. b4 as recommended. p as recommended" — B5 ("No grade 2" on the balances page: recommended, take it out) \| The balances page has no "No grade" chip: a person with no grade shows "No grade" in amber in his own row, where his grade is set, and nothing else counts them. The agent's readings: the Grades window keeps no count of them either | 12 |
| R0554 | D1248 | leave-war | 22 Oct 26 | silent | The agent's readings: the year is the page's year picker | 12 |
| R0555 | D1247 | leave-war | 22 Oct 26 | silent | The agent's readings: still one switch for everyone | 12 |
| R0556 | D1246 | leave-war | 22 Oct 26 | silent | The agent's readings: a whole number stays whole (17, not 17.0) | 12 |
| R0557 | D1245 | leave-war | 22 Oct 26 | silent | The agent's readings: the LVE figure beside each name stays as it is today (its two small lines) | 12 |
| R0558 | D1244 | leave-war | 22 Oct 26 | silent | The agent's readings: the period list is today's native list, so "+ New period" is its last choice and choosing it opens the same new-period window "+" opens today | 12 |
| R0559 | D1243 | leave-war | 22 Oct 26 | silent | The agent's readings: with no red day the right half goes and the button reads "Manning" alone | 12 |
| R0560 | D1242 | leave-war | 22 Oct 26 | the row says told | The agent's readings, to draw and put to him: "their balances" is his own row only (D1203) | 12 |
| R0561 | D1240 | leave-war | 22 Oct 26 | the row says told | whether the under-manned chip ("Under 1 day") stays is put to him with the answer to what it is. The agent's readings, to draw: "Under 1 day" counts the days in the period where a Manning or Available row is amber or red (D1213) and a tap jumps the grid to the next one — the grid runs a whole year, so those days are out of sight | 12 |
| R0562 | D1239 | leave-war | 22 Oct 26 | silent | The agent's readings, drawn for him: LVE's line reads left to right, each label left over its own figure — App bal · Pending · War bal — Pending written "−2½" and War bal the bold one, with no floating "−" or "=" between them | 12 |
| R0563 | D1238 | leave-war | 22 Oct 26 | silent | "3 taken" beside the LVE box. The person window's balance tiles are laid out on one grid so everything lines up: every tile's kind label on one line, every main figure on one line, every small line on one line, and inside LVE each label stands right over its own figure, the figures sharing one right edge. The agent's readings, drawn for him: LVE's label becomes the same colour… | 12 |
| R0564 | D1236 | leave-war | 22 Oct 26 | silent | its design keeps to the app's standard ways, its speed and the fewest taps. The agent's readings, drawn for him: the phone works as the grid does (D1228, lesson 17): the names stay put while the figures slide sideways, a cut column at the right edge shows there is more, and a pinch zooms the list out until every column fits | 12 |
| R0565 | D1235 | leave-war | 22 Oct 26 | silent | The agent's readings, to check with him when the 1 Jan step is built: a person with no grade gets only the roll-over, nothing added | 12 |
| R0566 | D1234 | leave-war | 22 Oct 26 | silent | The agent's readings, drawn for him: each line a grip, its name in a box, how many people hold it, its "+ days" box and a ✕ | 12 |
| R0567 | D1233 | leave-war | 22 Oct 26 | the row says told | "Perhaps state that it's Auto + LVE on 1st Jan or something similar that u think its better to convert the message" — with his picture of round 14's balances page, the column heading "GRADE · DAYS ON 1 JAN" ringed \| On the balances page a grade's figure says what the app does with it — it is added to LVE by itself every 1 Jan — not what it is: the heading reads "GRADE · AUTO +… | 12 |
| R0568 | D1231 | leave-war | 22 Oct 26 | silent | The agent's readings, as drawn: the dates replace a separate "Show on grid ›" on every line, the "also since you last looked" lines included (no room for a third button beside Approve and Refuse) | 12 |
| R0569 | D1230 | leave-war | 22 Oct 26 | silent | grades and the lock stay an admin's. The Leave War gets one page where an admin enters and updates every person's balances and sets each person's leave grade — designed the app's own way with the design skill (Impeccable), red-teamed against the colleague's version for a cleaner, aligned, more intuitive layout, and drawn for him before anything is built. The agent's readings: … | 12 |
| R0570 | D1229 | leave-war | 22 Oct 26 | silent | these five are where it starts. Every person on the Leave War has a leave grade, set by hand by an admin — Senior pilot, Junior pilot, Senior WSO, Junior WSO or Ops A — and on every 1 January the app adds that year's annual leave by grade by itself: 36, 33, 21, 18 and 14 days. The agent's readings: the year's unused leave becomes carried-forward leave the same day (D1218), use… | 12 |
| R0571 | D1227 | leave-war | 22 Oct 26 | silent | The agent's readings: the bubble is the bid window's day line (D1144) said once more where he lands, gone at his next tap | 12 |
| R0572 | D1226 | leave-war | 22 Oct 26 | silent | The agent's reading: on approval the tick goes into the Input with the remarks, so the Inputs page shows the same. | 12 |
| R0573 | D1223 | leave-war | 22 Oct 26 | silent | the app gets no Leave-War-only role. The agent's readings: nothing is built for it (Admin → Users already makes an admin, D785 — a scheduler is always an admin) | 12 |
| R0574 | D1218 | leave-war | 22 Oct 26 | the row says told | This is what my app shows." — with his phone picture of the official leave app's "View quota": Carried forward leave 4 (valid 1 Jan – 31 Dec 2026, balance 4 days), Annual leave 36 (valid 1 Jan 2026 – 31 Dec 2027, balance 36 days), Ordinary medical leave "Available" \| — ANSWERED 22 Oct 26 BY D1224: leave always uses the carried-forward days first. The Leave War reflects carried… | 12 |
| R0575 | D1217 | leave-war | 22 Oct 26 | the row says told | and the person window names its two LVE figures plainly — the balance the official leave app shows, and the Leave War's balance after the days pending — with the days pending counted in days (2½), never in requests. The agent's readings, to draw and put to him: the two figures are labelled "App bal" (what he types, from the official leave app) and "War bal" (that, less the day… | 12 |
| R0576 | D1215 | leave-war | 22 Oct 26 | silent | The agent's reading: under question 10's "+ SANS", a squadron that never adds SANS has them excluded exactly as today | 12 |
| R0577 | D1214 | leave-war | 22 Oct 26 | silent | The agent's reading: "in view" is the grid scrolled to the first open day of that stretch (for a close, the stretch that closed), as the page's own landing does. | 12 |
| R0578 | D1212 | leave-war | 22 Oct 26 | the row says told | The agent's readings, put to him with a picture: the places today are the bid window (both rows) and the drag-selection sheet ("How much") | 12 |
| R0579 | D1211 | leave-war | 22 Oct 26 | silent | A member may still correct a wrong input of his for a past day on the Inputs page, and the scheduler then publishes another end-of-day version to bring the published schedule up to date. The agent's readings: the second half is how the app already works — a member's change to an input on a published day is a pending change for the admin until the next amendment or end-of-day v… | 12 |
| R0580 | D1210 | leave-war | 22 Oct 26 | the row says told | But by default it follows what the input area inputs like till date check box. but it should also allow a place to input remarks. in the event that its still pending because info is not updated by the user" — his reply to round 6's question 5 (may a member delete his own waiting bid on a day since closed), with the picture of that bid's window (`full/r7-09-closed-bid-phone.png… | 12 |
| R0581 | D1208 | leave-war | 22 Oct 26 | the row says told | So should we have a role for it?" — his reply to question 1 of the overhaul's round 6 (D1199, "since your last visit") \| The person running the Leave War is not flooded with notifications of new leave requests — not while bidding is open (he closes the bids, then approves) and not afterwards, when ad-hoc leave is daily operations. The agent's readings, put to him the same morn… | 12 |
| R0582 | D1205 | leave-war | 21 Oct 26 | silent | Fix it." — with his phone picture of the Leave War's Settings window (Calendar, Counters & rows, Roster order, the groups list, Add a group), sent during the night's /overnight run \| — ANSWERED 29 Oct 26 BY D1499: the redesigned window was drawn in M5b round 1 and approved as drawn. The Leave War's Settings window is redesigned to be clean, intuitive and far less wordy — the s… | 12 |
| R0583 | D1203 | leave-war | 21 Oct 26 | the row says told | The agent's readings, to draw and put to him: the lock is the admin's, set for everyone at once (one switch, for example when the year's balances are confirmed) unless he wants it per person | 12 |
| R0584 | D1202 | leave-war | 21 Oct 26 | silent | The agent's reading: with both set, amber shows only above red | 12 |
| R0585 | D1201 | leave-war | 21 Oct 26 | silent | The agent's readings, to draw: the seven balances (LVE, OIL, CCL, FCL, PL, EL, CL) as one compact grid, left large and taken small, medical days taken beside them | 12 |
| R0586 | D1198 | leave-war | 21 Oct 26 | silent | "11 is this necessary?" then "ok remove 11" — round 5 of the Leave War full mock-up, question 11 (the day panel's manning rows stacked, one a line) \| — NARROWED 26 Oct 26 BY D1382: the figures stand in columns of at most four rows, left, then middle, then right. Question 11 is removed: the Leave War's day panel lays out its figures as his design lessons 20 and 29 already say —… | 12 |
| R0587 | D1197 | leave-war | 21 Oct 26 | silent | the grid's drag-select stays. The agent's readings, drawn for him: each line as D1178–D1181, D1184, D1189 and D1192 describe it — red under Required, amber at his setting (D1190, D1191) | 12 |
| R0588 | D1196 | leave-war | 21 Oct 26 | silent | The agent's reading: an admin's only | 12 |
| R0589 | D1194 | leave-war | 21 Oct 26 | silent | "Perhaps colour code the row faintly so that people know which row is for which row for required and available" — after D1193 (the Required rows renamed) \| The Leave War's Required and Available rows are tinted faintly so each Required row reads as the pair of its Available row — the pilots' pair one tint, the WSOs' pair another. The agent's readings, drawn for him: the two ti… | 12 |
| R0590 | D1193 | leave-war | 21 Oct 26 | silent | The agent's readings, to draw for him: the name is changed where the Available rows' is, in a small window a tap on the row's name opens | 12 |
| R0591 | D1192 | leave-war | 21 Oct 26 | silent | "If the input causes multiple counters to go amber or red, it will show on the lowest avail" — with the Approvals list drawn in columns for round 4, question 7 (one amber Manning row named after the lowest Available figure) \| In the Leave War's Approvals list, every Manning row a request turns amber or red shows in the line's "Lowest Avail" column, in its colour — not only one… | 12 |
| R0592 | D1191 | leave-war | 21 Oct 26 | the row says told | "like a number +/- the stated number" — his answer to how the Available rows' amber point (D1190) is set, after being told it could be a margin above that day's Required (recommended) or a fixed number as the other counters have \| The Available P and W rows' amber point is set as a number plus or minus that day's Required figure, not as a fixed number — so it follows each day'… | 12 |
| R0593 | D1190 | leave-war | 21 Oct 26 | mixed (both words in one clause) | "Perhaps I should have an amber criteria to set in the rows of avail P and W for now." then "Like in a setting" — after being told the Available P and W rows have no amber of their own, only red where under that day's Required (round 4, question 7's colours) \| The Available P and Available W rows get an amber point he sets in a setting. His words carried "perhaps" and "for now… | 12 |
| R0594 | D1190 | leave-war | 21 Oct 26 | the row says told | The agent's readings, to put to him with a picture: its purpose, so a day running short shows amber before it turns red | 12 |
| R0595 | D1189 | leave-war | 21 Oct 26 | silent | "I think the data should align horizontally seems like the middle is very cluttered" — with his picture of the Approvals list drawn for round 4, question 7 (each line's figures run together in one sentence: "1 day · LVE Bal 14 · lowest Avail W 17 · placed by Static, 2 Jan") \| In the Leave War's Approvals list each line's figures stand in columns that line up from line to line … | 12 |
| R0596 | D1188 | leave-war | 21 Oct 26 | silent | B: beside the open dates) \| — NARROWED 8 Nov 26 BY D1787: "+ Input", like "+ Medical" (D1300), stands left on a phone and right on a desktop. A button stands in the same place on a phone as on a desktop — not on the left of one and the right of the other — so question 10's Approvals is redrawn in one place on both. The agent's readings: "the same place" means the same side and… | 12 |
| R0597 | D1187 | leave-war | 21 Oct 26 | silent | The agent's readings: the rows below it move up one (the window is a row shorter) | 12 |
| R0598 | D1186 | leave-war | 21 Oct 26 | silent | The agent's readings: "default" means ticked each time the window opens, not remembered from the last time (9b's B) | 12 |
| R0599 | D1185 | leave-war | 21 Oct 26 | silent | the person window's line keeps the name "Balances". No second balances list on the Leave War: the "Figures" drawer, its heading and the person window's line are called "Balances", the days-used columns staying inside it — and the Balances heading is made plainly clickable, not a faint label. The agent's readings, drawn for him: the heading is drawn as a button in the look of t… | 12 |
| R0600 | D1184 | leave-war | 21 Oct 26 | silent | The agent's readings, drawn for him: the months are the period's month buttons as the "Open for bidding" window has them (D1168 — two rows of six on a phone), a month with nothing waiting dimmed | 12 |
| R0601 | D1183 | leave-war | 21 Oct 26 | silent | "Perhaps also include the colour coding of the leave etc we agreed on just now" — with his picture of the admin's bid window drawn for round 4, question 9 (its "Which leave" buttons all one grey) \| In the Leave War's bid windows each leave button wears its kind's colour of look F (D1175) — LL light amber, OL deep amber, OIL green, the other leave blue — so the button and the b… | 12 |
| R0602 | D1181 | leave-war | 21 Oct 26 | silent | The agent's reading: the same words wherever the overhaul shows a member's balance beside a request. | 12 |
| R0603 | D1180 | leave-war | 21 Oct 26 | silent | Also indicate the puck of the user. so that we know its what cat, wso or pilot or sans." — round 4 of the Leave War full mock-up, question 7 (the Approvals list), with his picture of the Inputs list's type filter \| In the Leave War's Approvals list each request shows its kind as the grid's coloured box (look F, D1175 — LL light amber, OL deep amber, OIL green…) and the person … | 12 |
| R0604 | D1178 | leave-war | 21 Oct 26 | silent | "for 7. the gryphon app shows files which is what we call documents, perhaps u can put an icon there for the admin to review as well when theres a document." — round 4 of the Leave War full mock-up, question 7 (the Approvals list), with his picture of the Inputs list's type filter \| In the Leave War's Approvals list a request that carries a document shows a document icon on it… | 12 |
| R0605 | D1177 | leave-war | 21 Oct 26 | silent | The agent's readings, drawn for him and his to strike: the open days keep today's green outline and the closed days dim with a small lock while anything is open | 12 |
| R0606 | D1176 | leave-war | 21 Oct 26 | silent | The agent's reading: the note itself — and the rest of the closed look (the chip "Bidding closed", the grid as normal) — is the agent's design shown with question 5, built only if question 5 keeps "say what is open" (question 5 kept it — D1177) | 12 |
| R0607 | D1176 | leave-war | 21 Oct 26 | silent | when it shows (a tap on any day not open, whether or not another stretch is open) is the agent's reading too. | 12 |
| R0608 | D1175 | leave-war | 21 Oct 26 | the row says told | The agent's readings, told to him: the gold dotted "moved" edge and the amber clash corner get a thin dark outline so they show on amber leave, checked on his phone at the build | 12 |
| R0609 | D1174 | leave-war | 21 Oct 26 | silent | The agent's readings: the "+ New" beside it stays | 12 |
| R0610 | D1173 | leave-war | 21 Oct 26 | silent | The agent's readings: the counter window's "Viewing as" title (whose figures a column shows) is not this chip and is left. | 12 |
| R0611 | D1172 | leave-war | 21 Oct 26 | silent | The agent's readings: the icon is a line drawing in the app's own icon style (D919), never an emoji | 12 |
| R0612 | D1169 | leave-war | 21 Oct 26 | silent | The agent's readings: it works as the app's other drag-picks do (the people picker's drag across faces, D685 | 12 |
| R0613 | D1168 | leave-war | 21 Oct 26 | silent | exact days, the rare case, stay behind the pencil and the calendar. The agent's readings, drawn for him: a second tap closes the month | 12 |
| R0614 | D1168 | leave-war | 21 Oct 26 | silent | The agent's reading of his point — the common action is one tap, the rare precise one sits behind the pencil — is the design guide's lesson 24. | 12 |
| R0615 | D1167 | leave-war | 21 Oct 26 | silent | The agent's readings: the cases are leave during a course or overseas duty, leave beside ATT B, and an FO given by hand on a leave day (the clash rules of 20 Sep 26) | 12 |
| R0616 | D1166 | leave-war | 21 Oct 26 | silent | The agent's readings: the 19 Sep 26 arrangement ("asked verbally, told yes" — Inputs-page leave lands approved) stands | 12 |
| R0617 | D1164 | leave-war | 21 Oct 26 | silent | an FO stays a whole-day box (D1160). (That an FO stays a whole-day box is the agent's reading, from D1160.) Narrows D1160's reading that an award given by hand is a whole-day box (for HO only). | 12 |
| R0618 | D1164 | leave-war | 21 Oct 26 | silent | The agent's readings, said to him with the picture: an HO the admin gives by hand takes the half he picks, the morning unless he picks the afternoon | 12 |
| R0619 | D1162 | leave-war | 21 Oct 26 | silent | The agent's reading: the colours drawn for question 2 give OD its own family as overseas duty. \| `raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` §5 (D1162) | 12 |
| R0620 | D1160 | leave-war | 21 Oct 26 | silent | The agent's readings, drawn for him before anything is built: "pucks" in his words are the coloured boxes in the cells | 12 |
| R0621 | D1160 | leave-war | 21 Oct 26 | silent | The agent's reading of his point — how much of a thing is shown by how much room it fills — is the design guide's lesson 21. | 12 |
| R0622 | D1159 | leave-war | 21 Oct 26 | the row says told | "maybe use this instead for document to standardise it", with his picture of the input window's Document button (an upload arrow and the word "Document") — round 2 of the Leave War full mock-up, his answer to question 3, of the bid window's drawn "Add a photo or PDF" button \| Wherever the Leave War overhaul lets a person add a document — the bid window, an entry already placed… | 12 |
| R0623 | D1159 | leave-war | 21 Oct 26 | silent | The agent's reading of his point — one action, one control, the same everywhere — is the design guide's lesson 22. | 12 |
| R0624 | D1158 | leave-war | 21 Oct 26 | the row says not told | The agent's readings: an Ack already stored is demo data (D56) and is read as waiting, not checked against the code | 12 |
| R0625 | D1155 | leave-war | 21 Oct 26 | silent | and the Leave War gets a list of the squadron's events with their types, where events are added. The agent's readings: an Excel or CSV sheet, chosen in the design | 12 |
| R0626 | D1154 | leave-war | 21 Oct 26 | silent | the SANS calendar's need follows what they count, and the screen says how. The agent's readings: D640 already makes them ordinary count rows he renames and re-defines | 12 |
| R0627 | D1152 | leave-war | 21 Oct 26 | silent | The list view is easier to see the inputs and there should be an approval all button too" — his list of 22 points after round 1 of the Leave War overhaul (21 Oct 26), point 13 \| The Leave War gets an Approvals list: everything awaiting approval in one list, its count rising with each new request not yet approved, with Approve on each line and an Approve all. The agent's readin… | 12 |
| R0628 | D1150 | leave-war | 21 Oct 26 | silent | a leave filed on the Inputs page asks for its document as a medical one does, never as a hard stop. The agent's readings: the reminder a day before the leave starts is a later job, in D1151's register | 12 |
| R0629 | D1149 | leave-war | 21 Oct 26 | silent | "I also want an option to create Management and select management as a grouping and they are usually placed at the top of the leave war." — his list of 22 points after round 1 of the Leave War overhaul (21 Oct 26), point 8 \| — NARROWED 21 Oct 26 BY D1200: the group comes from a Management tick column on Quals, not people picked on the war. The Leave War's groups can include a … | 12 |
| R0630 | D1148 | leave-war | 21 Oct 26 | silent | a year picker shows this year and ahead by default, and a past year's leave stays kept and shows when that year is picked from the drop-down. The agent's readings: the same window as D1141's list for one's own leave. \| `raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` §5 (D1148) | 12 |
| R0631 | D1147 | leave-war | 21 Oct 26 | silent | "I liked approve what I enter tick box option for admin" — his list of 22 points after round 1 of the Leave War overhaul (21 Oct 26), point 5 \| — NARROWED 21 Oct 26 BY D1186, D1187: the tick is on by default each time the window opens (not off), and sits in the window's title bar. — NARROWED 28 Oct 26 BY D1463: the switch reads "Auto-approve". An admin's bid window carries an … | 12 |
| R0632 | D1146 | leave-war | 21 Oct 26 | the row says not told | two halves stay top and bottom. A Leave War day holding two entries shows both in its cell, one above the other, as the colleague's entry 1 and entry 2 do, not one code with a "+n" corner. The agent's readings: a member is not asked to pick a slot (the note's §3), the second entry takes the second place by itself | 12 |
| R0633 | D1145 | leave-war | 21 Oct 26 | silent | and a day's cell draws the AM in its top half and the PM in its bottom half, as the colleague's app does. The agent's readings: the split cell replaces today's `<LL` and `LL>` marks in the build | 12 |
| R0634 | D1144 | leave-war | 21 Oct 26 | the row says told | The agent's readings, told to him with the picture: the rows named in their amber or red | 12 |
| R0635 | D1144 | leave-war | 21 Oct 26 | silent | The agent's reading of his point — a list read at a glance is stacked and aligned, never run together in a sentence — is the design guide's lesson 20. | 12 |
| R0636 | D1143 | leave-war | 21 Oct 26 | the row says told | "A · Phone and desktop (Recommended)" — round 1 of the Leave War overhaul, question 3, with the picture of a day panel drawn on the real app (https://claude.ai/artifact/QcbaMs6TKV2xcySMXiGXYH#q3) \| On the Leave War, phone and desktop, a tap on a date's heading opens that day from the foot, as the Inputs and SANS calendars' day does: ‹ › to step, its figures (Available P and W,… | 12 |
| R0637 | D1142 | leave-war | 21 Oct 26 | the row says told | a tap takes the grid to it. The agent's readings, told to him on the page: the wording follows D769 (the leave first, its dates, what happened and who) | 12 |
| R0638 | D1117 | leave-war | 21 Oct 26 | the row says told | built as its own job in a fresh chat, its questions and pictures first. The agent's readings, told to him: the − / + buttons stay beside it (D159's phone opening one step out stands until he rules otherwise) | 12 |
| R0639 | D1016 | leave-war | 18 Oct 26 | silent | The agent's readings, to tell him: (1) "as recommended" covers the two questions the pictures raised (the gap: yes | 12 |
| R0640 | D892 | leave-war | 15 Oct 26 | silent | The agent's reading: the edge and the speed are the app's existing ones (the war's own drag selection's, `select.ts`), not new numbers | 12 |
| R0641 | D890 | leave-war | 15 Oct 26 | silent | The agent's reading: it covers every row of the Leave War grid in Rearrange — a man's row, a group heading, the Manning block's rows — the same gesture on the same screen | 12 |
| R0642 | D883 | leave-war | 15 Oct 26 | silent | The agent's reading: it holds for a group heading's landing line too, and on a phone as on a desktop (not yet checked on either). | 12 |
| R0643 | D882 | leave-war | 15 Oct 26 | silent | The agent's reading: "all your recommendations" is round 2's four, the message answering round 2 | 12 |
| R0644 | D881 | leave-war | 15 Oct 26 | silent | the Tracker's gold "can fly next" and turquoise "search found" rings. The agent's reading: "for all" is the four places he was shown in round 1 — places 5 to 8 (today's day card, the Rearrange button while on, a SANS puck's stripe, the Leave War's landing line) are round 2 and not yet ruled. | 12 |
| R0645 | D827 | leave-war | 13 Oct 26 | silent | The agent's readings: (1) seen on HIS iPhone before it is called done — the drawing is in a Windows browser's letters | 12 |
| R0646 | D823 | leave-war | 13 Oct 26 | the row says told | the neater drawing is put to him before it is built. The agent's readings, told to him: (1) "this" is option A — his picture is its busy case | 12 |
| R0647 | D805 | leave-war | 13 Oct 26 | the row says told | a picture is put to him before anything is built. The agent's readings: (1) a phone only is what he named — the desktop's strip is looked at beside it and shown, not changed unless he says | 12 |
| R0648 | D679 | leave-war | 8 Oct 26 | silent | The agent's readings, to hold in the build: (1) "a phone" is the width at which the top area changes today (the chip's own-line rule, D365) | 12 |
| R0649 | D678 | leave-war | 8 Oct 26 | silent | its bug check `raptor-port/docs/handpass/2026-10-08-lw-phone-header.md`). The agent's readings, confirmed by the build's own pictures (measured: 97px saved at 390 wide — the grid starts 182px down where it started at 279 — eleven names on screen where six fitted, counted the way the drawing counted them): (1) on a phone the words "Period" and "Stage" go — the buttons beside th… | 12 |
| R0650 | D676 | leave-war | 8 Oct 26 | silent | The agent's readings, to tell him: (1) the cross wears the counter window's own red — a red outline and a pale red cross on the row's dark ground, brighter under a mouse | 12 |
| R0651 | D674 | leave-war | 8 Oct 26 | silent | (Filed first as `[LW-COUNTERS-AMONG-FIXED]`, the next chat's first job — it changes how the rows' order is saved, so it was built tests-first on its own.) BUILT 8 Oct 26, the same day (`[LW-COUNTERS-AMONG-FIXED]`, archived). All four readings held as told. | 12 |
| R0652 | D674 | leave-war | 8 Oct 26 | silent | The agent's readings, to tell him: (1) the four fixed rows keep their own order among themselves and still carry no grip and no cross — only counters move | 12 |
| R0653 | D673 | leave-war | 8 Oct 26 | silent | The agent's readings, to tell him: (1) "Save counter" (and "Add counter", and "Save" on an Available row's window) is the filled blue the app's other Save buttons wear — the Event sheet's Save beside it is that blue | 12 |
| R0654 | D670 | leave-war | 8 Oct 26 | silent | the grid jumps to that day only when it is out of view. The agent's readings, to tell him: (1) "in view" means the day's column is drawn and wholly between the frozen name columns and the grid's right edge — a column half under the frozen columns or cut off at the right counts as out of view, and the grid jumps | 12 |
| R0655 | D669 | leave-war | 8 Oct 26 | silent | The agent's readings, to tell him — each a default he can change: (1) "no default" holds for the demo squadron too: the block opens with only the four Required / Available rows until someone makes a counter | 12 |
| R0656 | D418 | leave-war | 29 Sep 26 | silent | with no Published stage, an approved leave offers a member its remarks at any time, and he changes the leave itself on the Inputs page (D1166) — the agent's reading of question 5's table. The Leave War stays as built on three counts — an approved leave reaches inputs at approve | 12 |
| R0657 | D352 | leave-war | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the new type is registered with the Leave War's other commands and given its row in `perms.ts` (admin-only, as the stage is today — the 27 Aug 26 "moving the cycle stage forward is admin-only"), or every stage move would be refused | 12 |
| R0658 | D335 | leave-war | 27 Sep 26 | silent | How many's "Pick a range" is another calendar, for placing leave over several days \| — NARROWED 24 Oct 26 BY D1332: "Pick a range" ends the Duration row (round 3), no longer a row of its own at the window's top. — NARROWED 22 Oct 26 BY D1212: the "how many" row is labelled "Date". The one-day sheet keeps "how many" (Just this day / Pick a range), at its top. A range picked the… | 12 |
| R0659 | D333 | leave-war | 27 Sep 26 | silent | The proposal adds the Move button there too, only on his own bids and only while bidding is open" \| — NARROWED 21 Oct 26 BY D1177: the stages go — a member moves his own bid while it waits and its days are open. A member gets move on his own bid while bidding is open — on the one-day sheet and the day's list, as the drag already lets him. Who may move is the store's one rule a… | 12 |
| R0660 | D331 | leave-war | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his five answers approve the mock-up `raptor-port/docs/mock/lw-move-standard.html` as the design of record for `[LW-MOVE-STANDARD]` with these picks, and with its "What I read into your words" list (one rule for who may move on every sheet | 12 |
| R0661 | D266 | leave-war | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) its Move is the one standard Move of D264 | 12 |
| R0662 | D265 | leave-war | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the landing rules are unchanged — it lands only where its own half is free, refused whole with its reason otherwise | 12 |
| R0663 | D264 | leave-war | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) a mock-up of the real sheets first, desktop and phone (the house rule for a visual change) — the layout is his to approve from it, nothing built before | 12 |
| R0664 | D262 | leave-war | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (a) it covers both one-day sheets that carry a Move today (the bid sheet's decision row and the decide sheet) | 12 |
| R0665 | D262 | leave-war | 27 Sep 26 | silent | Left for him: the tap list's per-record Move… keeps its date box (reading (a)) — `OUTSTANDING.md` `[LW-MOVE-TAPLIST-ASK]` — ANSWERED 27 Sep 26 BY D266 (the day's list moves by the move mode too | 12 |
| R0666 | D2314 | oil | 22 Nov 26 | silent | the agent's reading of "as recommended": Fable's two-name wording, and the agent's own "Training for ALL AVAIL", the pick the agent recommended for that line) \| The publish note names an unanswered input by who it is for: one person "Ranger's Training", two people "Ranger and Hex's Training", three or more "Training for 3 people", and an input for ALL AVAIL "Training for ALL A… | 11 |
| R0667 | D2314 | oil | 22 Nov 26 | the row says told | an input holding ALL AVAIL beside named people reads "Training for ALL AVAIL" too — the agent's reading, told to him. \| the OIL page (`.claude/rules/decisions/oil.md`, its OIL-question line) | 11 |
| R0668 | D2312 | oil | 22 Nov 26 | silent | Ace's CUR CK goes in when you press Save or Later." and "Later signs without an answer: nobody on it earns OIL, and Saturday won't ask again.") \| The two lines D2294's list adds are cut to the fewest words that keep what a scheduler must know: answer before signing, the name goes in on Save or Later, and Later means nobody on it earns OIL. The agent's reading: the reason (an a… | 11 |
| R0669 | D2262 | oil | 22 Nov 26 | silent | The agent's readings: today the save refuses the answer ("Blocked: nothing was kept") and "Yes to all" fails whole (checked: the night's reader proof, `raptor-port/src/ui/oilday.ts` saveOilDay writes the whole input, the save check wants an admin of every squadron) | 11 |
| R0670 | D1094 | oil | 20 Oct 26 | the row says told | Shown the OIL batch built and checked, with its new words marked as his to keep or change, he answered "Merge love", then "Merge live" \| The OIL batch's new words stand as built — the Unpublish warning, done note and armed button's title when an amendment is withdrawn, and the same-time line's "earns nobody any OIL" sentence — and the batch goes live on this "merge live". The … | 11 |
| R0671 | D978 | oil | 17 Oct 26 | the row says told | both as built, and [OIL-CONFIRM-DAYGRID] goes live on this "merge live". The agent's readings, told to him: a desktop keeps the calendar's box, as in the input's window | 11 |
| R0672 | D923 | oil | 15 Oct 26 | silent | which days earn OIL is decided as before. The agent's readings, to tell him: (1) the many-days tap is a way of its own for this one place — every other calendar still picks one date or one run | 11 |
| R0673 | D863 | oil | 15 Oct 26 | silent | he wrote: "Shorten it". \| The note after "Load onto working copy" is short plain sentences: what the day is back to, what viewers still see, what else came back or stayed out, and how many inputs need an OIL answer — and it no longer repeats the edits thrown away, which the confirming button has just said. The agent's readings: (1) every fact the long note gave stays, except t… | 11 |
| R0674 | D818 | oil | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) the load happens at once, as today — it is not a door that waits (many inputs at once | 11 |
| R0675 | D818 | oil | 13 Oct 26 | the row says told | — NARROWED 15 Oct 26 BY D862 (reading (2): the list opens for the days that need the answer) AND D863 (reading (3): the note is short plain sentences). [AS BUILT, 14 Oct 26 (night) — two readings differ from the ones above and are PUT TO HIM, not ruled (the check's sheet, §0 items 2 and 4): reading (3) — the note keeps the load's older sentence and adds his tail ("Friday: Orig… | 11 |
| R0676 | D816 | oil | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) taking the information-only mark off is treated the same (D814's reading 1) | 11 |
| R0677 | D814 | oil | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) "information only" (the scheduler's ⓘ on the input's row) is treated the same, for the same reason — it earns nobody OIL (D760 | 11 |
| R0678 | D804 | oil | 13 Oct 26 | silent | The agent's readings, each checked against the app as it is on the Inputs batch's branch: (1) leave and medical inputs never ask and never earn — AS BUILT (`raptor-port/src/engine/inputs.ts oilAsks`). | 11 |
| R0679 | D804 | oil | 13 Oct 26 | the row says told | The agent's reading, told to him | 11 |
| R0680 | D793 | oil | 13 Oct 26 | silent | The agent’s readings, to tell him: (1) the door is the scheduler’s "Accept" on the input’s card or line, where the input then needs an answer and the reader is a scheduler | 11 |
| R0681 | D783 | oil | 12 Oct 26 | silent | The agent's readings, to tell him at the build: the same list opens from the Leave War's Event row when it makes the holiday | 11 |
| R0682 | D782 | oil | 12 Oct 26 | silent | The agent's readings, to confirm on the picture: it is what the holiday's "these inputs now need an answer" opens, and what the scheduler's bell line opens | 11 |
| R0683 | D781 | oil | 12 Oct 26 | silent | The agent's readings, to confirm on the picture: "if the admin already answers for everyone" means the admin is offered the answer at the moment he declares the holiday — a control to draw | 11 |
| R0684 | D606 | oil | 7 Oct 26 | silent | a blank B leaves the shift its written start to end. It overrules the agent's reading (10) under D592 (withdrawn there). | 11 |
| R0685 | D606 | oil | 7 Oct 26 | silent | The agent's readings, not his words until he answers (each tested as built): (1) the EARLIER of the B and the shift's written start is used — a B typed later than the start does not shorten the shift (the same guard the crew-rest and long-day checks already put on it, 24 Aug 26) | 11 |
| R0686 | D606 | oil | 7 Oct 26 | silent | D592's full row (reading (10) withdrawn) | 11 |
| R0687 | D592 | oil | 5 Oct 26 | the row says told | BUILT 6 Oct 26 (`[OIL-WORK-START]`). The agent's readings made in the build, each put to him on the check's look card — not his words until he answers: (6) a time entered LATER than the nominal one shortens the day (take-off 12:00, in-time 10:00 → the day starts 10:00) — D591's "the actual intime/rally time … not the nominal report timing", and what the work-hours bar does | 11 |
| R0688 | D261 | oil | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his OWN award only, read only (no Edit, no Clear) | 11 |
| R0689 | D260 | oil | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the bid sheet's one-day Clear follows the same rule — it removes the award with the rest, and on a day holding an award it names it and asks once before it goes | 11 |
| R0690 | D49 | oil | 22 Sep 26 | silent | Third time the owner’s knowledge of the squadron corrected the agent’s reading of the code — after D36 (the availability window) and D44 (membership frozen on every day). | 11 |
| R0691 | D43 | oil | 22 Sep 26 | silent | SUPERSEDES the "default OFF for the placeholder" reading of D27, and supersedes the agent’s plan (§5 step 3, "the placeholder seats default off") and BOTH reviewers’ recommendations — Fable wanted off everywhere, the agent wanted the two existing seats left paying and the rest off. | 11 |
| R0692 | D2328 | people-accounts | 22 Nov 26 | silent | the agent had recommended keeping that) \| A man shows on any day by what he actually is on that day, for a posting in as for a posting out: before his post-in date he is not ours — a SANS man named on our programme included, so ALL AVAIL leaves him out until that date — and a posting out changes him only from its own date. It answers question (o) of [FABLE-READ-FAULTS] against… | 12 |
| R0693 | D2328 | people-accounts | 22 Nov 26 | the row says told | The agent's readings, told to him so he can correct them: (1) "until he becomes a SANS" is read as "until the day he joins us" — in the example he was already ticked SANS and the date still to come was his post-in date | 12 |
| R0694 | D2327 | people-accounts | 22 Nov 26 | the row says told | Merge live" (to chat 140's three readings of D2313, each shown to him on the real app with its recommendation, on the page raptor-port/docs/mock/2026-11-22-sans-readings/index.html: 2 the tick taken off then put back, 3 how his SANS ends, 4 the two places that go by today) \| — NARROWED 23 Nov 26 BY D2340: who may be filed for SANS availability goes by the day filed, not by tod… | 12 |
| R0695 | D2327 | people-accounts | 22 Nov 26 | the row says told | Each was the agent's reading in D2313's row until this answer | 12 |
| R0696 | D2327 | people-accounts | 22 Nov 26 | silent | Astra's other reading of the re-tick (SANS straight through from the posting's date) is set aside. | 12 |
| R0697 | D2313 | people-accounts | 22 Nov 26 | silent | Fable's reading, checked by it in the code, not by the agent: a hand tick today carries no date and reaches back over every day, so one tick can turn old published days pending and wipe their four sign-offs. | 12 |
| R0698 | D2313 | people-accounts | 22 Nov 26 | the row says told | a hand re-tick after a hand untick counts from its own day — the posting's days are kept by the untick as an ended stretch, and the days between stay a regular's, so a day published in that gap is left alone (the agent's reading after the blind Opus read of 22 Nov 26, told to him | 12 |
| R0699 | D2313 | people-accounts | 22 Nov 26 | silent | left on today's tick, the agent's reading: who may file SANS availability, the Quals tick itself and the Leave War's row (D283, D321, D1692). | 12 |
| R0700 | D2313 | people-accounts | 22 Nov 26 | silent | — ANSWERED 22 Nov 26 BY D2327: the agent's readings confirmed by him — a tick put back counts from its own day, the days between an ordinary man's | 12 |
| R0701 | D2270 | people-accounts | 22 Nov 26 | the row says told | filters only hide rows, the list stays A to Z and never reorders itself (D322). The agent's reading, told to him: drawn first and put to him with the multi-squadron batch that builds the master admin's squadron menu (D2197), built with it. \| the People & accounts page `.claude/rules/decisions/people-accounts.md` §Admin → Users (D2270) | 12 |
| R0702 | D2265 | people-accounts | 22 Nov 26 | the row says told | the Balances page at the swap gets the band. The agent's reading, told to him: his "All outstanding questions as recommended" takes each line's own recommendation now, as the page offered ("Later: all as recommended takes the recommendation in each line"), not only the group's "settle at the Transfer step" | 12 |
| R0703 | D2261 | people-accounts | 22 Nov 26 | the row says told | The agent's reading, told to him and confirmed by him the same day ("b10 ok"): B10 is answered with it — Hunter's ✕ on 142's Tue 14 stays refused, its words to say who can ("Not saved: Ranger is 149's from Thu 16 Jul. | 12 |
| R0704 | D2260 | people-accounts | 21 Nov 26 | the row says told | recommended: refuse it, so the mark is always taken off on purpose by a master admin) \| A master admin's role is never changed to member while he holds the mark: the change is refused, in words that say the mark comes off first — "Saber is a master admin — take that off first" — so the mark is only ever taken off on purpose, by a master admin. The agent's readings, told to him… | 12 |
| R0705 | D2253 | people-accounts | 21 Nov 26 | silent | The agent's readings: on that squadron's Edit Schedule the switch lands him on its View-only Sched, as it does today | 12 |
| R0706 | D2251 | people-accounts | 21 Nov 26 | the row says told | "and the players should be informed when their account status changes" (21 Nov 26, to chat 128, in the same message as D2250) \| A person is told, on his own bell, whenever his account's status changes — made an admin or a member, suspended or enabled, given or losing View or Plan of a squadron (a move or a change to member ending it included), made or unmade a master admin. Th… | 12 |
| R0707 | D2249 | people-accounts | 21 Nov 26 | the row says told | the agent's reading that his "As proposed" answers both of the page's questions, told to him) \| Nobody moves himself to another squadron: the refusal reads "You can't move yourself to another squadron — ask another admin" | 12 |
| R0708 | D2247 | people-accounts | 21 Nov 26 | silent | where it has none of its own, a Plan holder counts. A Plan holder keeps his full access (D2201) — this is only the last-admin check: D2184 Q10's "no admin" read as "no admin of its own", the agent's reading in the reshape plan §5.3 and §14 item 1, now his. | 12 |
| R0709 | D2245 | people-accounts | 21 Nov 26 | silent | The agent's reading: offered while his Plan holds that day, a master admin always | 12 |
| R0710 | D2246 | people-accounts | 21 Nov 26 | silent | The agent's reading: "an admin of 150" counts an admin at home there or by Plan (D2241). \| The People & accounts page (§Many squadrons) | 12 |
| R0711 | D2242 | people-accounts | 20 Nov 26 | the row says told | I want u to make sure u check the work and the bugs u might have missed out" (20 Nov 26, to chat 125, after D2241 — the agent's sentences had named only the master admin where an admin with Plan may act too) \| A dedicated check is run of everything built and planned for the many-squadron work so far — the app, the reshape plan, the documents and the drawings — for every place … | 12 |
| R0712 | D2241 | people-accounts | 20 Nov 26 | the row says told | The agent's readings, told to him: a master admin may give one admin Plan of several squadrons (149, 150 and more), each on its own | 12 |
| R0713 | D2240 | people-accounts | 20 Nov 26 | the row says told | The agent's readings, told to him: the app's own on-screen words already say "master admin" (checked 20 Nov 26: the re-link refusal in `state/accounts.ts` | 12 |
| R0714 | D2239 | people-accounts | 20 Nov 26 | the row says told | The agent's readings, told to him: "Request access" asking the person's squadron (D2094, step 5) is still needed, so his request reaches that squadron's admins — the app knows the squadron from his pick | 12 |
| R0715 | D2228 | people-accounts | 20 Nov 26 | silent | The agent's reading: "that man's admin" is read on the input's own days, as D2225's days are (the named man's home on each day, the filer an admin of that squadron today) | 12 |
| R0716 | D2225 | people-accounts | 19 Nov 26 | silent | The agent's reading: "still the filer's squadron's" means the named man's home on that day is the filer's squadron. \| the People & accounts page `.claude/rules/decisions/people-accounts.md` §Posting out (D2225) | 12 |
| R0717 | D2223 | people-accounts | 19 Nov 26 | silent | The agent's reading: the master stays an admin everywhere, so a master filer is still told. \| the People & accounts page `.claude/rules/decisions/people-accounts.md` §Posting out (D2223) | 12 |
| R0718 | D2221 | people-accounts | 19 Nov 26 | silent | a man's leave across a move may be changed by each squadron's admin for the days that are his squadron's. The agent's readings: which of "takes" or "ends" applies is settled at the Transfer batch's design and drawn first | 12 |
| R0719 | D2218 | people-accounts | 19 Nov 26 | the row says told | The agent's readings, told to him: the change history keeps everything | 12 |
| R0720 | D2215 | people-accounts | 19 Nov 26 | the row says told | The agent's reading, told to him: his answer rests on the posting going to 149 | 12 |
| R0721 | D2214 | people-accounts | 19 Nov 26 | the row says told | The agent's readings, told to him: once, not on each retry | 12 |
| R0722 | D2211 | people-accounts | 19 Nov 26 | the row says told | then, offered A "Full access to 149, every page: its schedule and publishing, its settings, its people and their sign-ins." (recommended) or B "Full access to 149: every page, every setting.": "A" (19 Nov 26, to chat 109) \| The line under "Plan 149" on a person's row in Admin → Users reads "Full access to 149, every page: its schedule and publishing, its settings, its people a… | 12 |
| R0723 | D2205 | people-accounts | 18 Nov 26 | silent | and his yes to a one-line pull request to `main` removing the escaped NUL in the engine's overlay file, behaviour unchanged, so this branch's code check can compare — merged on his "merge live" (M1, a one-off). The agent's readings: an admin given Plan of 149 counts as "an admin of 149" in those words (D2201) | 12 |
| R0724 | D2203 | people-accounts | 18 Nov 26 | silent | old rights never follow him. The agent's readings: "moves" is his primary squadron changing — a posting from one squadron to another (D2087) | 12 |
| R0725 | D2202 | people-accounts | 18 Nov 26 | silent | each line shows which squadron it is from — 142 or 149. The agent's readings: the squadron is shown on every line from a squadron other than his primary, for a master admin's bell too (D2198), so two squadrons' lines never read alike | 12 |
| R0726 | D2201 | people-accounts | 18 Nov 26 | silent | The agent's readings: Plan is given and taken away by a master admin only (D2199) | 12 |
| R0727 | D2200 | people-accounts | 18 Nov 26 | the row says told | Built after the multi-squadron batches, as a job of its own, drawn and shown to him first (D1625). The agent's readings: which lines stay always on is put to him with the drawing | 12 |
| R0728 | D2199 | people-accounts | 18 Nov 26 | silent | everyone else of his squadron keeps View only of the other. The agent's readings: the switch is for planning the other squadron's schedule — he edits its schedule pages as its own schedulers do, publishing included | 12 |
| R0729 | D2198 | people-accounts | 18 Nov 26 | the row says told | every other squadron's are off by default. The agent's readings: "by default" means he may switch another squadron's on (and his own off) himself — how, and where the switch sits, is drawn and shown to him first (D1625) | 12 |
| R0730 | D2197 | people-accounts | 18 Nov 26 | silent | The agent's readings: its recommendation had named an admin given access to another squadron too — by D2192 there is none (another squadron is View only), so this covers the master | 12 |
| R0731 | D2192 | people-accounts | 18 Nov 26 | silent | only a master admin makes another master admin. His "No" sets aside the agent's reading that a man of the other squadron could be made its admin as a step apart from View: across squadrons a man gets View only (D2160 Q5, D2191), admin rights only in his own squadron, the master an admin everywhere (D2191). | 12 |
| R0732 | D2192 | people-accounts | 18 Nov 26 | silent | The agent's reading: "another person" is a person of that squadron | 12 |
| R0733 | D2191 | people-accounts | 17 Nov 26 | the row says told | The agent's readings, put to him on the page and answered. | 12 |
| R0734 | D2136 | people-accounts | 17 Nov 26 | mixed (both words in one clause) | The agent's reading, not yet put to him: the picker lists the squadrons made in Admin → Squadrons (D2110), his own left out | 12 |
| R0735 | D2094 | people-accounts | 16 Nov 26 | silent | The agent's readings: "Request access" today asks no squadron (as built, one squadron) | 12 |
| R0736 | D2093 | people-accounts | 16 Nov 26 | silent | The agent's readings: an admin given access to both squadrons still cannot make a third | 12 |
| R0737 | D2087 | people-accounts | 16 Nov 26 | silent | D281's transfer by the admin's hand elsewhere in the app is narrowed by "only through the post-out function" — the agent's reading. | 12 |
| R0738 | D1971 | people-accounts | 10 Nov 26 | the row says told | The agent's readings, told to him: (1) inside the app an admin already creates each account and sets admin or member on Admin → Users (D165, D166 — as built), and that part needs nothing from the IT side | 12 |
| R0739 | D1695 | people-accounts | 5 Nov 26 | silent | The agent's reading: nothing is built now (D473) | 12 |
| R0740 | D1653 | people-accounts | 5 Nov 26 | silent | IT enters them, and a member-only account tests them. Joining stays one choice for the admin (member or admin): the app puts the person into the matching group, which carries the role — the agent's reading, to check in the hosting trial and with the IT side. \| filed as [DB-SECURITY-ROLES] | 12 |
| R0741 | D1547 | people-accounts | 31 Oct 26 | silent | it does not wait for anyone to accept it. The agent's readings, not yet checked with him: (1) every outcome alike, Delete included (its two taps at the sheet stay — D287, D1102) | 12 |
| R0742 | D1510 | people-accounts | 29 Oct 26 | silent | The agent's reading: refused at the screen, the Quals write and the commit gate alike | 12 |
| R0743 | D1108 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) what a pinch zooms (the table, not the top bar or the row of buttons), how far, and whether the zoom is kept are put to him with pictures first, in the same round as D1107's | 12 |
| R0744 | D1105 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) the row's pending words show wherever they show today — Admin → Users and the Leave War | 12 |
| R0745 | D1102 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) a date in the future deletes no one at once, so it is saved as today, with no ask | 12 |
| R0746 | D1101 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) the two F-15 squadrons share the F-15 database, so lending a man between them by day or period (D1100) stays inside one system | 12 |
| R0747 | D1100 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him: (a) it extends D281/D282 (neighbouring squadrons plan each other's men | 12 |
| R0748 | D1110 | people-accounts | 21 Oct 26 | the row says told | The agent's readings, told to him on the page: (1) "stays on Quals" means it goes back to normal when he leaves the page | 12 |
| R0749 | D993 | people-accounts | 18 Oct 26 | the row says told | The agent's readings, told to him: the "120 frames fix" is the browser moving the row (the Leave War's scroll-linked follow), not the app's code each frame | 12 |
| R0750 | D937 | people-accounts | 16 Oct 26 | the row says told | and Quals opens at its top — its row of buttons in sight — wherever it is opened from, as the Inputs page does. The agent's readings, told to him: "on a phone" is the width "Export" already uses (480 or less), the full words "Save changes" kept for a screen reader, as Export's | 12 |
| R0751 | D935 | people-accounts | 16 Oct 26 | the row says not told | The agent's readings: "+ Add person" alone on its row was named on the page, not asked — it stays as it is | 12 |
| R0752 | D327 | people-accounts | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his question is a yes to the recommendation | 12 |
| R0753 | D326 | people-accounts | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: it covers a posting with no outcome (D303) and a SANS posting (D283 — he stays on the roster too), "posted out 14 Oct · SANS" | 12 |
| R0754 | D323 | people-accounts | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) a posting that already closed his stint (it has run) keeps its date — Archive does not move it | 12 |
| R0755 | D320 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a stint opens on a post-in date and closes on a posting-out date | 12 |
| R0756 | D310 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a mock-up first (the house rule for a visual change), then the build and a FULL check | 12 |
| R0757 | D308 | people-accounts | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) "posted in" is every door that puts a man on the roster — Admin → Users' New person (added by the admin, or approving a request as New person) and Quals' Restore / Restore as (back from overseas) | 12 |
| R0758 | D300 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the same for the post-IN button ("Post in from <date>" → "Post in"), whose date also sits in its own box — NARROWED 21 Oct 26 BY D1105: for the Delete outcome the line says the app deletes him automatically, and his row reads "· auto delete" until the date. \| `raptor-port/docs/mock/post-out.html` §1 | 12 |
| R0759 | D298 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the same word everywhere the act is named (the post-out chip, the account editor's second tap, the confirm line) \| `raptor-port/docs/mock/post-out.html` §1 | 12 |
| R0760 | D295 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a rename box on each archived row (admin only), and when Restore meets a taken callsign it offers that same box on the spot ("Ace is taken — give him another callsign"), so the rename and the restore are one step \| `raptor-port/docs/mock/post-out.html` §6 | 12 |
| R0761 | D294 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: one short line under the chips says what the chosen one does on the date (the words the buttons dropped) | 12 |
| R0762 | D292 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: on a phone the switch sits in the drawer's account line, since the badge is not on the phone bar \| `OUTSTANDING.md` `[POST-OUT-OUTCOMES]` | 12 |
| R0763 | D289 | people-accounts | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: on a puck the mark is not text but a small colour mark (the way the CAT and SANS already ride the puck's edges), with "Viper · F-16" in full wherever there is room — the lists, the pickers, a tap or hover | 12 |
| R0764 | D287 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) everything that is his goes with him — his Quals row, his account, his inputs, his Leave War leave and OIL — so nothing is left stored that no screen shows | 12 |
| R0765 | D287 | people-accounts | 26 Sep 26 | silent | D280's row (reading (2) set aside) | 12 |
| R0766 | D286 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) Restore refuses while the name is taken and says so ("Viper is taken on the roster — rename one of them first"), never renaming anyone by itself | 12 |
| R0767 | D285 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the screens that name the state follow the words — the account's tag "switched off" becomes "suspended", and the sign-in screen "Your access is switched off" becomes "Your access is suspended" \| `OUTSTANDING.md` `[POST-OUT-OUTCOMES]` | 12 |
| R0768 | D284 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) "fresh" still applies to someone who LEFT FLYING FOR GOOD (his account deleted, D229) and is ever taken back | 12 |
| R0769 | D283 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "the SANS column" is the SANS group at the foot of the grid (the Leave War's rows are people, grouped) | 12 |
| R0770 | D282 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) both ways — 142 may plan 149's people too | 12 |
| R0771 | D281 | people-accounts | 26 Sep 26 | silent | Because our sqns are local and near one another." — with D229, after "Transferring to another sqn is something we will implement in the future" \| — NARROWED 16 Nov 26 BY D2087: only the Leave War's Post out moves a man to the other squadron, on its date — no other transfer by hand in the app (the agent's reading of "only through the post-out function"). — WIDENED 26 Sep 26 BY … | 12 |
| R0772 | D281 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "plan" means put on the other squadron's schedule (its pucks, its crew lists), not edit his leave or quals, which stay his own squadron's \| `OUTSTANDING.md` `[XFER]` (future, with `[DB-STEP]`) | 12 |
| R0773 | D280 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) suspend IS today's "Switch off / Switch on" on Admin → Users (D204) — what changes is its words and that a posting out can do it on the date | 12 |
| R0774 | D229 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the post-out sheet asks which of the outcomes it is, and the app does it on the posting-out date as the archive does today | 12 |
| R0775 | D227 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "on screen" is Admin → Users itself — on a desktop the Admin tab shows it at once | 12 |
| R0776 | D224 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his message carried the handoff line's template choice "[or: change X]" unfilled, with no change named — read as approved as drawn | 12 |
| R0777 | D223 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his "ok" took the recommendation — "remove it" reverses this \| `raptor-port/docs/engine-rules.md` §Auth / roles (the sign-in) | 12 |
| R0778 | D222 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a new LABEL on the one field, not an extra field \| `OUTSTANDING.md` `[ACCOUNTS-NEW-PERSON]` | 12 |
| R0779 | D219 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: it is ONE field — the label on his puck, what every screen shows for him — relabelled wherever the app asks for or heads it: the sign-up, Admin → Users (add, approve, the account editor) and the Quals column head | 12 |
| R0780 | D216 | people-accounts | 26 Sep 26 | the row says told | The agent's reading, stated to him on the mock-up so he can correct it: the admin's top-bar bell lights (desktop and phone) the way it does for a new bug report | 12 |
| R0781 | D214 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: the same "New person" choice is offered when approving a request, filled from the callsign and name he typed | 12 |
| R0782 | D214 | people-accounts | 26 Sep 26 | silent | Re-stated by him the same hour: "in the admin page i think the admin should also be able to create a callsign and type it, likewise to add initials, add CAT etc, pilot wso or personnel. so same as when the person signs in" — the agent's reading of "same as when the person signs in": the admin types a new callsign as the person does on Request access | 12 |
| R0783 | D211 | people-accounts | 26 Sep 26 | silent | keep as today — every member sees the type, the remarks and the documents, his 27 Aug 26 rule), after Astra's read of the `[ACCOUNTS]` plan found his 27 Aug 26 "anyone may view any attachment" and the database brief's "medical details for the person and admins only" pointing different ways \| — NARROWED 26 Sep 26 BY D213: a guest sees medical inputs too (reading (2) below set a… | 12 |
| R0784 | D211 | people-accounts | 26 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the change history (D169, `[DRAFT-PENDING]`) shows a medical change in full to members too | 12 |
| R0785 | D204 | people-accounts | 26 Sep 26 | the row says told | The agent's reading of the second half, stated to him so he can correct it: while waiting he sees the waiting screen | 12 |
| R0786 | D166 | people-accounts | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: permissions work, so the FULL bug check | 12 |
| R0787 | D165 | people-accounts | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: two layers — (1) getting INTO the app at all is granted in the organisation's Microsoft set-up (a security group / the environment's security roles) by whoever administers that environment, which may or may not be him | 12 |
| R0788 | D2428 | scheduler | 24 Nov 26 | the row says told | not built. The agent's reading of his reply as a yes — his question restates the rule — told to him the same turn: no red marks on either side | 11 |
| R0789 | D2423 | scheduler | 24 Nov 26 | the row says not told | an act that was no Undo is not called undone. The agent's reading, not checked with him: his "perhaps" is taken as his word, the agent recommending it because "undone" is the Undo button's own word | 11 |
| R0790 | D2422 | scheduler | 24 Nov 26 | the row says not told | no meaning, no behaviour and no word he ruled changes. The agent's reading, not checked with him: "the words" covers both pages and their questions, since both reached him in the same message | 11 |
| R0791 | D2420 | scheduler | 24 Nov 26 | the row says told | The agent's readings, told to him: it covers a man ahead of his SANS date too (Ranger's line goes with the others) | 11 |
| R0792 | D2342 | scheduler | 23 Nov 26 | silent | The agent's reading, as chat 147 recommended: past three days the line says "and 2 more" after the dates, as part of the list. \| the design guide, §9 lesson 99 (D2342) | 11 |
| R0793 | D2341 | scheduler | 23 Nov 26 | the row says told | The agent's readings, told to him in the closing report: the line is written by the posting's take-back inside the same command (sync.ts takeBack, his D1693, D1699, D1710), once a man and posting | 11 |
| R0794 | D2341 | scheduler | 23 Nov 26 | silent | the rule is a reading, so whatever ends a day's SANS hides its filing — a Quals untick or an archive too — but only a posting's take-back writes the line | 11 |
| R0795 | D2340 | scheduler | 23 Nov 26 | the row says told | The agent's readings, told to him in the closing report: a filing is accepted when he is SANS on at least one of its days, its other days hidden (D2341) [that reading REPLACED by D2388, 23 Nov 26: the days from his SANS date are saved, the earlier ones left out with a short note saying why — as built until then, the whole run refused], and one with none is refused with "<calls… | 11 |
| R0796 | D2340 | scheduler | 23 Nov 26 | silent | Built without a drawing first on his message to build it and send the preview link (the agent's reading, as his D2339). \| the scheduler's page, §Crew and pucks (D2340) | 11 |
| R0797 | D2338 | scheduler | 22 Nov 26 | the row says told | The agent's readings, told to him: the bell line goes to the man himself only, not before the posting's date (he cannot file before it, D2327), one line naming the days | 11 |
| R0798 | D2333 | scheduler | 22 Nov 26 | the row says told | The agent's readings and what the drawing must settle, told to him: the mark follows the amendment marks already ruled — hollow while waiting, solid once the amendment has gone out, the ALn tag's colour (D92, D93) | 11 |
| R0799 | D2332 | scheduler | 22 Nov 26 | the row says told | The agent's readings, told to him: (1) "include him in 149 programme" is read as his OWN squadron's ALL AVAIL (149's) — he is still 149's man | 11 |
| R0800 | D2332 | scheduler | 22 Nov 26 | silent | ANSWERED by him the same evening — "Yes" to "should the borrowing squadron's own ALL AVAIL items count him too, because it has planned him that day?": on a day another squadron has planned him, that squadron's ALL AVAIL counts him too, as it counts a SANS man planned with us (the same time-clash and by-hand exceptions — the agent's reading). AND ITS LIMIT, his next message: "I… | 11 |
| R0801 | D2332 | scheduler | 22 Nov 26 | silent | The same aircraft type is new: the app has no aircraft type per squadron yet, so until type segregation is built — a later job, his "may" — the place alone can be checked (the agent's reading). \| the scheduler's page (`.claude/rules/decisions/scheduler.md`, §Not built yet, the squadrons' lines) | 11 |
| R0802 | D2331 | scheduler | 22 Nov 26 | the row says told | The agent's reading, told to him: the window answers one question, who is free at that time, and a man whose own item overlaps the event is already left out of it, so no flag of a man in the list can be about the event's time — the recommendation is plain pucks, no flags, no reasons and no "N men are flagged" line there, every flag staying on the schedule and in the day's issu… | 11 |
| R0803 | D2331 | scheduler | 22 Nov 26 | silent | The agent's reading of "the words below": both lines at the foot ("who is free as things stand now" and "Tap a puck for why. | 11 |
| R0804 | D2329 | scheduler | 22 Nov 26 | the row says told | The agent's reading, told to him: "whenever that day is looked at" is the agent's — he gave the answer for 18 Jul and did not say from when | 11 |
| R0805 | D2296 | scheduler | 22 Nov 26 | silent | recommended: fix it in the same job \| On a desktop, a schedule page opened from the other schedule page opens straight on the carried day, in both directions — the week never slides across from Monday to reach it. The agent's readings: the day's place is D2295's | 11 |
| R0806 | D2295 | scheduler | 22 Nov 26 | the row says told | a phone is unchanged. The agent's readings, told to him in the report: he was shown Edit Schedule opened from View-only Sched | 11 |
| R0807 | D2295 | scheduler | 22 Nov 26 | silent | no longer only the agent's reading. \| the scheduler's page §The week on Edit Schedule (D2295) | 11 |
| R0808 | D2293 | scheduler | 22 Nov 26 | silent | the day arrows still step one day, each landing where it did. The agent's readings: as drawn on the page of 22 Nov 26 (`raptor-port/docs/mock/2026-11-22-sched-right-edge/`, the exact rule in `draw.mjs`) | 11 |
| R0809 | D2212 | scheduler | 19 Nov 26 | silent | the change counter's refusal and the "replaced by a later save" bell line stay only for two taking a day at the same instant. — ANSWERS the open part of D1751 (the simple mark): its firmness, which the agent's reading had set out, is now his for the parts named | 11 |
| R0810 | D2212 | scheduler | 19 Nov 26 | silent | the take-over's further detail (one minute, "Take over anyway", the saved plan) stays the agent's reading. | 11 |
| R0811 | D2212 | scheduler | 19 Nov 26 | the row says told | The agent's readings, told to him: the block is the app's, not the database's (no add-ons, D1751), so a person going round the app could ignore it — the IT side's accepted risk (D2209) | 11 |
| R0812 | D2219 | scheduler | 19 Nov 26 | the row says told | The last part is the agent's reading of D2160 over D2091, told to him and taken as recommended. | 11 |
| R0813 | D2213 | scheduler | 19 Nov 26 | the row says told | The agent's readings, told to him: a formation is always named "149's RU formation", never "your RU" | 11 |
| R0814 | D2206 | scheduler | 18 Nov 26 | silent | and when two people change one shared thing at once the later save stands and the one overwritten is told (B10) — a planner and that squadron's own scheduler included (D2201). The agent's readings: the lines follow D2194's rule (a matter concerning both) | 11 |
| R0815 | D2204 | scheduler | 18 Nov 26 | silent | it replaces the agent's reading recorded with D2195 (a detachment uses its own squadron's list). | 11 |
| R0816 | D2204 | scheduler | 18 Nov 26 | silent | The agent's readings: the detachment's own admins keep its list, as a squadron's admins keep theirs (D2195) | 11 |
| R0817 | D2196 | scheduler | 18 Nov 26 | silent | a squadron's own admins cannot change it. The agent's reading: a place only one squadron sits on stays its own admins' to set, as drawn | 11 |
| R0818 | D2195 | scheduler | 18 Nov 26 | the row says told | The agent's reading, put to him: a detachment uses its own squadron's list, as F1 had it use home's (his D2204 replaces this reading: a detachment has a list of its own, which may start as a copy of its squadron's). | 11 |
| R0819 | D2194 | scheduler | 18 Nov 26 | the row says told | The standing rule for every future feature. The agent's reading, put to him with the holiday line: when 149 adds a holiday at the place both share, 142's admins are told of 142's own published days it puts out of date, 149's of 149's, never of the other's. | 11 |
| R0820 | D2189 | scheduler | 17 Nov 26 | the row says told | The agent's reading, told to him: the order is set in the batch plan, red-teamed by Astra and a fresh, blind Opus reader before batch 1, and he is told it plainly with its reasons. \| the scheduler page `.claude/rules/decisions/scheduler.md` §Not built yet (D2189) | 11 |
| R0821 | D2170 | scheduler | 17 Nov 26 | the row says told | The agent's reading, told to him: a drag comes to rest on a whole month or year as the wheel does, with a short glide after a quick flick | 11 |
| R0822 | D2180 | scheduler | 17 Nov 26 | silent | The agent's readings: home stays as he sees it today (his own squadron, never lost by going away) | 11 |
| R0823 | D2168 | scheduler | 17 Nov 26 | silent | The agent's readings: it matches Q15's recommendation for team rows | 11 |
| R0824 | D2166 | scheduler | 17 Nov 26 | silent | The agent's reading: his "no" answers the airspace half of Q11 | 11 |
| R0825 | D2165 | scheduler | 17 Nov 26 | the row says told | The agent's readings, told to him: a named zone, not a typed offset, so a clock change during an exercise and half-hour zones are right by themselves | 11 |
| R0826 | D2163 | scheduler | 17 Nov 26 | the row says told | Knock-on effects worked through (D2143), the agent's readings: SANS people are on the Leave War only when an admin adds the SANS group there ("+ SANS", D1221, D1499), so the door for a SANS man not on the war is open — put to him as round 7's Q23 | 11 |
| R0827 | D2160 | scheduler | 17 Nov 26 | silent | a detachment uses its own squadron's, the agent's reading). — NARROWED 17 Nov 26 BY D2184: the transfer's refusals are no longer checked again on the date with the transfer waiting: the last-admin case is refused at once, the DET case dropped (round 7's Q10, Q18). — NARROWED 17 Nov 26 BY D2165: each place, home included, is set by its named time zone (GMT+X) | 11 |
| R0828 | D2160 | scheduler | 17 Nov 26 | silent | Q6 leaves the Attach input's Leave War count as it is, by the agent's reading: that rule governs the Attach input, and the automatic row is no input (D2144) | 11 |
| R0829 | D2149 | scheduler | 17 Nov 26 | silent | Narrows D2114 (the agent's reading "or holds men of both" is dropped, so 142 can no longer change VL's mission, times or 149's crew), D2098 (the row is named by the item, not "Attach · 149": "Attach · 149" over "ATTACH" said it twice) and D2144 (the automatic row's name). | 11 |
| R0830 | D2147 | scheduler | 17 Nov 26 | mixed (both words in one clause) | Knock-on effects worked through (D2143), the agent's readings, not yet put to him, to draw in round 7: (1) the lines start "Today:" and are worked out again each time the sheet is opened | 11 |
| R0831 | D2146 | scheduler | 17 Nov 26 | the row says told | Knock-on effects worked through (D2143), the agent's readings, to draw and put to him in round 7: (1) at home a man on DET shows under Unavailable as one row titled by the detachment, "DET" small under it, and cannot be planned there | 11 |
| R0832 | D2145 | scheduler | 17 Nov 26 | the row says told | Knock-on effects worked through (D2143), the agent's readings, to draw and put to him in round 7: (1) the other squadron's schedule shows his SANS availability for the day in its own SANS availability panel, marked with his squadron's badge (look 2, D2127), so it can pick him | 11 |
| R0833 | D2144 | scheduler | 17 Nov 26 | the row says told | open for round 7, the agent's reading: a hand Attach whose "To" box names one of the app's squadrons would double the automatic row — warn and point to borrowing, put to him, not decided. | 11 |
| R0834 | D2139 | scheduler | 17 Nov 26 | the row says told | The agent's reading, put to him with new words: one short line for each thing that happens, the people first, and the published days round 6's Q2 would withdraw named on it | 11 |
| R0835 | D2138 | scheduler | 17 Nov 26 | silent | The agent's reading: the ring is the one just-added look (design.md's D876), about six seconds, the same as on a press. | 11 |
| R0836 | D2135 | scheduler | 17 Nov 26 | the row says told | the agent's reading that this covers the round-3 items listed there, told to him) \| — NARROWED 17 Nov 26 BY D2146: closing ends its people's DET that day. Closing a detachment early ends its people's overseas duty that day, and the bell tells each of them. Was the agent's reading | 11 |
| R0837 | D2130 | scheduler | 17 Nov 26 | silent | Round 4's item 4a (149 has no wave that day) — "all as recommended" (17 Nov 26, to chat 94, of round 5's page) \| When the other squadron has no wave that day, 142 cannot add a line to 149's schedule: "+ Wave" says 149 has no wave that day, 142 plans in a wave of its own, and 149 may join it. Was the agent's reading of D2106 and D2114 | 11 |
| R0838 | D2126 | scheduler | 17 Nov 26 | silent | with no 149 wave that day the section is one grey line, "149 has no wave on Mon 13 Jul." The agent's reading: his "1 yes" answered step 1 of the agent's message, which held this and D2125's count, both. | 11 |
| R0839 | D2119 | scheduler | 17 Nov 26 | silent | The agent's reading: the place list and its question card stay as drawn. | 11 |
| R0840 | D2114 | scheduler | 17 Nov 26 | silent | the other's line holding our man stays the other's, and we only take our man off it. The agent's reading: a line concerns both when it is one squadron's line in the other's wave, or holds men of both | 11 |
| R0841 | D2101 | scheduler | 17 Nov 26 | silent | the choice may stay "None", an ordinary overseas duty as today — a staff trip overseas that is no detachment. The agent's reading: "A1 a" is his pick of option (a), asked on the condition that an overseas duty with no detachment stays possible | 11 |
| R0842 | D2100 | scheduler | 17 Nov 26 | the row says not told | On round 2's questions page, question B7 (what the purple names on his two paper schedules mean, a question of fact asked so the app could show the same): "b7 disregard it" \| The purple names on his paper schedules are not asked about again: the multi-squadron design draws nothing from them, and no mark is planned for what they showed. The agent's reading: "disregard" drops th… | 11 |
| R0843 | D2099 | scheduler | 17 Nov 26 | silent | What the picture showed, the agent's reading: the number stood in large plain letters beside the callsign, not as a tag, and on a phone it fell to a line of its own under RU. | 11 |
| R0844 | D2098 | scheduler | 16 Nov 26 | the row says told | The agent's readings, told to him or to confirm with the picture in round 2: the row stands under Unavailable where the Attach input stands today (the inputs page's D1373, D1374 — "Attach · 145 Sqn" | 11 |
| R0845 | D2096 | scheduler | 16 Nov 26 | silent | The agent's readings: the count is the day's badge, which today reads the aircraft in each wave ("6 × 6" for two waves of six — `src/ui/html.ts`, `dayCount`), so with two waves it would read each squadron's own run of waves, drawn for him first (D1625) | 11 |
| R0846 | D2095 | scheduler | 16 Nov 26 | silent | The agent's readings, to check with him in round 2 with a picture: closing sends its people back to their squadron from that day | 11 |
| R0847 | D2092 | scheduler | 16 Nov 26 | the row says not told | The agent's readings: "checked against each other" means the checks about a man — crew rest, double booking, days in a row, leave, medical — read everything he is on at his place, on either schedule (the review's "the checks follow the man", recommended to him and not asked as a question of its own — round 2 confirms it, with whose Logic settings judge a borrowed man's line) | 11 |
| R0848 | D2091 | scheduler | 16 Nov 26 | silent | The agent's readings: the words on the home schedule and the bell line's words are drawn for him first (D1625) and join the notifications register when built | 11 |
| R0849 | D2090 | scheduler | 16 Nov 26 | silent | What the two pictures show, the agent's reading, to confirm with him: each schedule marks the other's lines only in the remark ("142 LINE", "149 LINE") | 11 |
| R0850 | D2089 | scheduler | 16 Nov 26 | silent | the checks about a man read everything he is on there (the agent's reading). His lean for two squadrons flying together at home: one wave may hold formations of both squadrons | 11 |
| R0851 | D2088 | scheduler | 16 Nov 26 | silent | no conflicts are flagged across a squadron and its detachment, and no man is planned in two locations. The agent's reading, to check with him: "no man planned in two locations" is a refusal, not a warning — a man is at one place at a time, so the place he is at decides which schedule may hold him. | 11 |
| R0852 | D2081 | scheduler | 16 Nov 26 | the row says told | His "merge live" followed at once: the agent's reading, told to him — the checked batch goes live now and the strip is a change of its own, drawn for him first (D1625). \| On a phone, Edit Schedule's Legend leaves a strip at its right for the parked AIRCREW tab, so no name runs under it | 11 |
| R0853 | D2080 | scheduler | 16 Nov 26 | silent | Its assumed hour still stands for every other check, as D2073's does (the agent's reading). \| the scheduler page `.claude/rules/decisions/scheduler.md` §Warnings | 11 |
| R0854 | D2079 | scheduler | 16 Nov 26 | the row says told | with D2080 the desk part names the standby templates (the agent's reading, told to him in the closing report). \| the scheduler page `.claude/rules/decisions/scheduler.md` §Warnings | 11 |
| R0855 | D2073 | scheduler | 16 Nov 26 | the row says not told | the "only an SC template" reading stands for every other desk. A duty desk made from an SC shift template, with its START typed and its END blank, is left out of crew rest until its END is typed, as an SC wave line is (D2055) — never counted as ending an hour after its START. The agent's reading, not checked with him: only a desk made from an SC shift template, not every duty … | 11 |
| R0856 | D2071 | scheduler | 16 Nov 26 | the row says told | "Yes" — to chat 82's two last points, put together: "Is the one-sentence Logic note right: 'Published days keep their old settings until published again.'" and "Are the words approved?" (the agent's reading: yes to both, told to him). \| — NARROWED 16 Nov 26 BY D2074: the seat warning reads "Illegal seat", not "Wrong seat". The reworded warnings are approved, with his answers o… | 11 |
| R0857 | D2070 | scheduler | 16 Nov 26 | the row says told | The agent's readings, told to him: the other checks' short names follow the new labels as the page's question 3 recommended | 11 |
| R0858 | D2061 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked with him: how a standby that does not fly is checked stays as built — he was not asked about it and nothing changes: an SC MAIN shift raises the amber note against a ground or programme item and the red clash against a flight, a sim, another shift or a duty post | 11 |
| R0859 | D2058 | scheduler | 15 Nov 26 | the row says told | It answers the page's question 1 (T/O only, or T/O and landing) — the agent's reading, told to him. | 11 |
| R0860 | D2057 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked with him: the pending list's new words (D2054) are drawn with the rest. \| the scheduler page `.claude/rules/decisions/scheduler.md` §Warnings and the rules engine (the D2045 line) | 11 |
| R0861 | D2055 | scheduler | 15 Nov 26 | the row says not told | the shift's own warning that its crew rest cannot be worked out stays. The agent's reading, not checked: the same for a shift that flies. | 11 |
| R0862 | D2053 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked: OIL reads the same assumed landing (D2046's "every check"). | 11 |
| R0863 | D2051 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked with him: they are the pattern Fable starts from for the other warnings — a short label, the items and their times, "assumed" — Fable still putting every wording to him on pictures before a build | 11 |
| R0864 | D2050 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked with him: the line's words stay exactly as built. \| the scheduler page `.claude/rules/decisions/scheduler.md` §Warnings and the rules engine (the D2045 line) | 11 |
| R0865 | D2049 | scheduler | 15 Nov 26 | the row says not told | none of chat 81's proposed wordings is approved, and he is not satisfied with them: they are examples only, never a starting point to keep. The agent's reading, not checked with him: Fable drafts the words and puts them to him on pictures before any build (D1625) | 11 |
| R0866 | D2048 | scheduler | 15 Nov 26 | the row says not told | short and concise stands. The standalone warnings (D2045) are short and concise, in the squadron's own words — "clash", not "booked for two things at once". The agent's reading, not checked with him: the same goes for the other warnings (a short label first — Clash, Tight turn, Double turn — then the items and their times), and the aviation short forms already on the app's scr… | 11 |
| R0867 | D2046 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked: the tight turn, the debrief, the crew rest, the long day and OIL all read the assumed landing. | 11 |
| R0868 | D2045 | scheduler | 15 Nov 26 | the row says not told | The agent's reading, not checked with him: it covers the whole warning list, not only the five on that day. | 11 |
| R0869 | D2026 | scheduler | 13 Nov 26 | silent | "Activated means u are recalled from standby to work." — to chat 66, which had asked what "activated" means to him in the AVALON or BB desk's duty-template note, "Switch it on in OIL Earn if activated" (the night of 12 Nov 26's question 15, asked again 13 Nov 26). \| In the AVALON or BB desk's note, "activated" means a man on standby recalled to work. The agent's reading: the n… | 11 |
| R0870 | D2014 | scheduler | 13 Nov 26 | the row says not told | The agent's readings, not asked: whether the day then reads pending follows D592 | 11 |
| R0871 | D2014 | scheduler | 13 Nov 26 | silent | the app's own reading of the kept settings, D2005's build). | 11 |
| R0872 | D2009 | scheduler | 13 Nov 26 | silent | Recommended A, the agent's own pick, the files giving none. \| The Logic page's check "On leave + flying" is to be named "On leave + planned", and its twin "Downchit + flying" "Downchit + planned": one name, true on every row, since a row such as a briefing is not a flight. The agent's reading: only the check's name on the Logic page changes | 11 |
| R0873 | D2010 | scheduler | 13 Nov 26 | silent | "Mon took off 12:00 with no landing typed, assumed landed 13:00 (take-off + 1h), +2h debrief → ended 15:00". Where a day's last flight has no landing typed, the crew-rest warning is to read "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00" — never "landed" at the take-off time. The agent's reading: the same words wherever … | 11 |
| R0874 | D2022 | scheduler | 13 Nov 26 | silent | the "rally after in-time" note with no clock no longer shows. They are the build's readings of D1990, D1991, D1997 and D1995, now his. \| `.claude/rules/decisions/scheduler.md` (D2022). | 11 |
| R0875 | D1983 | scheduler | 11 Nov 26 | silent | the reads of any fix as ever (Astra and a fresh, blind Opus reader). The agent's reading: the standing brief `raptor-port/docs/superpowers/briefs/rules-first-red-team.md` is its method | 11 |
| R0876 | D2005 | scheduler | 12 Nov 26 | the row says not told | The agent's readings, not checked with him: a changed setting does not clear a flag on a published day either | 11 |
| R0877 | D2004 | scheduler | 11 Nov 26 | the row says not told | The agent's reading, not checked with him: "PH" stands for any event the Leave War tags a public holiday, whatever its name. | 11 |
| R0878 | D1991 | scheduler | 11 Nov 26 | silent | The agent's reading: F1 is fixed so | 11 |
| R0879 | D1988 | scheduler | 11 Nov 26 | the row says told | The agent's reading, told to him: a faint rally tapped in is a typed rally, so it can turn the day red. | 11 |
| R0880 | D1944 | scheduler | 9 Nov 26 | silent | read by Astra and a fresh Opus reader, blind. The agent's readings: this is the word D1942 said the scheduler waits for | 11 |
| R0881 | D1936 | scheduler | 8 Nov 26 | silent | and the board-layout test that skips itself when its box already sits above the keyboard is fixed to always prove the case, filed as [E2E-BOARD-KEYS-SKIP]. The agent's readings: the zero count was a change he had not been told of, now told and kept | 11 |
| R0882 | D1780 | scheduler | 8 Nov 26 | the row says told | the agent's reading, told to him: it follows D1643 (one row of bar on a phone on its side), though that rule is about the app's own top bar. | 11 |
| R0883 | D1751 | scheduler | 8 Nov 26 | the row says told | The agent's readings, told to him, not yet checked with him: (1) the rest of the lock stands, each part only a write to the same mark, nothing for the IT side to set up — taking a day by its ✎ Edit or by a change (D355, D451), freeing it on Done editing, closing the page, signing out or 30 minutes with no change (D356), an admin's take-over asking the holder first (D454) | 11 |
| R0884 | D1693 | scheduler | 5 Nov 26 | the row says told | If it's undo it should retract it" — to question 2 of the posting-out bell line (option 2 recommended: as the Leave War's Undo does, D1216) \| — NARROWED 24 Nov 26 BY D2437: a read line taken back is answered by a new line saying what is true now, nothing struck and no "taken back" — every bell line. — NARROWED 5 Nov 26 BY D1710: a posting out that ran and is then changed on it… | 11 |
| R0885 | D1644 | scheduler | 4 Nov 26 | silent | "skip the pdf until i say so" — after the agent recommended [PDF-PRINT-TWICE] as the next job \| The PDF export work is not started until he says so: [PDF-PRINT-TWICE] (his iPhone printing the working copy) and [FLAG-EXPORT] (the published day only, the nicer report) wait for his word. The agent's reading: "the pdf" covers both PDF export items, since both change what Export as… | 11 |
| R0886 | D1592 | scheduler | 3 Nov 26 | silent | Agent's reading, checked against the code: it follows the way a hidden warning rides its day and the issued face draws the hides it went out with (D469, D471 | 11 |
| R0887 | D1588 | scheduler | 3 Nov 26 | silent | built with the next Inputs batch. — ANSWERED 3 Nov 26 BY D1592: on a day already published, the choice waits for the next amendment like any other change there. Narrows the screen rule of Aug 26 that kept the flag session-only "on the LATEOFF precedent" (`raptor-port/docs/ui-contracts.md` §the scheduler notes) — the agent's reading then, not his words. | 11 |
| R0888 | D1588 | scheduler | 3 Nov 26 | the row says told | Agent's reading, not his words, for the build to put to him: whether making a note public on an already-published day waits for an amendment, as other changes there do (D45). \| `raptor-port/docs/ui-contracts.md` (the scheduler notes' flag, marked) | 11 |
| R0889 | D1586 | scheduler | 3 Nov 26 | silent | a tap on the dimmed chip brings it back for everyone. Narrows the late-input mark's settled entry of 21 Aug 26 (§Settled before this list → The late-input mark, "It CAN be dropped per input"): its session-only registry `LATEOFF` (state/view.ts), cleared on sign-in and on a week change, was the agent's reading of his ask, not his words | 11 |
| R0890 | D1529 | scheduler | 31 Oct 26 | silent | The agent's readings, as on the page: (1) the wait is about half a second, before the first step and between steps — a new number, said to him, since the guide prefers existing ones | 11 |
| R0891 | D1528 | scheduler | 30 Oct 26 | mixed (both words in one clause) | The agent's reading of his question: yes — he was told so and it was fixed as a fault (D1426: an outright fault is fixed without asking). | 11 |
| R0892 | D1527 | scheduler | 30 Oct 26 | silent | the slim tab and its slide stay as D1526. The agent's reading: "the old one" is his close-up — the arrow before D1526 at rest: opacity 0.75 over `rgba(20,24,29,.82)` with a 5px blur, `var(--edge)` border, `var(--ink-2)` arrow. | 11 |
| R0893 | D1526 | scheduler | 30 Oct 26 | silent | The agent's reading of "still slightly transparent": the open arrow keeps today's frosted glass and is not made fully solid on its blue hover — it stays a little see-through (0.9, where today's hover goes to 1), so what is behind still shows faintly | 11 |
| R0894 | D1522 | scheduler | 30 Oct 26 | silent | and a design in which the arrows block nothing behind them is looked for with the design skill and drawn for him, before and after, before anything changes. The agent's reading: "keep it the same" is the arrows' look today (frosted glass at 0.82 with a blur, brightening under the pointer, `raptor-port/src/ui/scheduler/03-week.css` `.week-nav`) | 11 |
| R0895 | D1442 | scheduler | 28 Oct 26 | silent | its words stay as they are. The agent's readings: the bar's own look is otherwise unchanged (it has no cyan outline today) | 11 |
| R0896 | D1107 | scheduler | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) "the phone desktop version" is the board's desktop layout chosen on a phone (D548) | 11 |
| R0897 | D1106 | scheduler | 21 Oct 26 | the row says told | The agent's reading, told to him: built on pull request 558's branch (`claude/look-keys-1021`), where the night first built it and took it out for want of this answer | 11 |
| R0898 | D1099 | scheduler | 21 Oct 26 | the row says told | an admin switch hiding the back seat (RCP) is his idea, designed with him first. The agent's readings, told to him: (1) today's checks read the back seat in several places (the pilot/WSO pairing rules, a passenger in the back seat, air-to-air refuelling training needing an instructor behind the pilot, flagged today when the back seat is empty) — read in the schedule's checks 2… | 11 |
| R0899 | D1121 | scheduler | 21 Oct 26 | the row says told | The agent's readings, told to him: the same sentence is the note a tap on him raises and the ALL AVAIL window's reason, so the change covers every place it is said | 11 |
| R0900 | D1120 | scheduler | 21 Oct 26 | the row says told | The agent's readings, told to him: (1) a standby row that flies — its B or R typed, or its Flies tick (D1043–D1045, D1061) — is a flight, so its man is tasked and faded as any flier | 11 |
| R0901 | D1119 | scheduler | 21 Oct 26 | the row says told | The agent's readings, told to him: the SANS count counts the men drawn free, as the other sections' counts do | 11 |
| R0902 | D1118 | scheduler | 21 Oct 26 | silent | A man on ATT B who is also tasked that day keeps today's faded look (the agent's reading — the picture's case was a man with nothing else that day). | 11 |
| R0903 | D1116 | scheduler | 21 Oct 26 | the row says told | The agent's reading, told to him: only the heading row is held | 11 |
| R0904 | D1112 | scheduler | 21 Oct 26 | the row says told | With two iPhone pictures of the preview of pull request 561 (the board's desktop layout, the issues list circled, then the crew list circled): "Can the width of the warnings be wider to fit the width?", then "This is slightly different from the desktop" \| In the Scheduler Board's desktop layout on a phone, the side column is laid out as on a desktop: the issues list uses the c… | 11 |
| R0905 | D1111 | scheduler | 21 Oct 26 | the row says told | Can u make it the same as the rest" \| In the Scheduler Board's desktop layout on a phone, the sign-off box scrolls away with the day as it does on a desktop, never frozen above it. The agent's reading, told to him: checked in the code — on a desktop the whole board column scrolls (the sign-off, the issues bar and the panels together, 10-board-history.css), while the desktop la… | 11 |
| R0906 | D1109 | scheduler | 21 Oct 26 | the row says told | The agent's readings, told to him on the page: (1) "the day" is everything under the bar — the panels, the waves, the side column with the issues and the crew list | 11 |
| R0907 | D1085 | scheduler | 20 Oct 26 | silent | a flying wave keeps TO and LD. The agent's readings: only the headings change — the boxes, their order and what they hold stay as built (D1029, D1040) | 11 |
| R0908 | D1083 | scheduler | 20 Oct 26 | the row says told | on a phone the START over END heading is drawn in smaller letters so it fits its column. The agent's readings, told to him: "everywhere" is the week's three screens, the pictures he chose from | 11 |
| R0909 | D1067 | scheduler | 19 Oct 26 | the row says told | the Flies chip keeps the badge's size on the board. The agent's reading of "as recommended" — the recommendation was to leave all three | 11 |
| R0910 | D1067 | scheduler | 19 Oct 26 | the row says told | told to him with the reading. \| `raptor-port/docs/handpass/2026-10-19-standby-flies.md` (§13, W-B2 / C F3, R-1, R-5) | 11 |
| R0911 | D1066 | scheduler | 19 Oct 26 | silent | rows that only stand by are unchanged, and the Scheduler Board's tap button keeps its size. The agent's readings: smaller on the week everywhere, so it looks the same on every width (on a desktop it still fits beside the badge) | 11 |
| R0912 | D1065 | scheduler | 19 Oct 26 | silent | typing replaces it, a typed time shows as today, and the flying lines keep their faint suggested times. The agent's readings, told with the drawing: the week already shows such a dash in an empty R on a standby line, so the board is made to match | 11 |
| R0913 | D1064 | scheduler | 19 Oct 26 | silent | Edit Schedule's week and View-only Sched show nothing on a row that does not fly, and all three screens show the lit "✓ FLIES" on a row that flies. The agent's reading: a row is ticked or unticked by hand on the board only | 11 |
| R0914 | D1062 | scheduler | 19 Oct 26 | silent | an ordinary flying line with nobody on it still counts (D1009). The agent's reading: "nobody seated" means neither seat holds a person or a placeholder. | 11 |
| R0915 | D1045 | scheduler | 19 Oct 26 | silent | a rally is never typed on a standby line that will not fly, and one that does not fly is cancelled (CX), which takes it out. The agent's reading: a cancelled line (CX) or row is not work today, so it neither counts nor earns — checked against the engine's cancel rule (a cancelled formation or jet is skipped in OIL, `oil.ts`), the flying count (`waves.ts dayCount`) and the warn… | 11 |
| R0916 | D1041 | scheduler | 19 Oct 26 | the row says told | on an SC SPARE, AVALON or BB line, which stay outside the warnings, it is shown, printed and exported only, and an empty box counts for nothing. — CHANGED 19 Oct 26 BY D1044, D1045: a rally (or B) typed on an SC SPARE, AVALON or BB line now makes the line fly — every row a jet, in the day's flying count and Insights as well as crew rest and OIL, its day ending at END with no d… | 11 |
| R0917 | D1040 | scheduler | 19 Oct 26 | silent | their take-off and landing boxes stay as they are. The agent's reading: the same on the week and the board as on a flying line (D1026, D1029). | 11 |
| R0918 | D1039 | scheduler | 19 Oct 26 | silent | View-only Sched's printed suggested brief (D1030) follows the same rule on those three lines — the agent's reading. | 11 |
| R0919 | D1034 | scheduler | 19 Oct 26 | silent | The build leaves the reading of typed lines unchanged | 11 |
| R0920 | D1032 | scheduler | 19 Oct 26 | silent | Until he answers, the build leaves the reading of typed lines as it is. | 11 |
| R0921 | D1032 | scheduler | 19 Oct 26 | silent | that a published day's change waits (D45) and that an earlier event of his own starts his day sooner (D498) are the agent's readings. | 11 |
| R0922 | D1030 | scheduler | 19 Oct 26 | the row says told | one tap puts it in, highlighted, so whatever is typed next replaces it at once — the scheduler never deletes it first. The agent's readings, told to him with the picture and not objected to: Escape takes a just-placed suggestion back out (D1011) | 11 |
| R0923 | D1029 | scheduler | 19 Oct 26 | silent | Where the switch falls is the agent's reading: wherever the board today puts the pucks on their own row (a phone, up to 820 wide) it stacks | 11 |
| R0924 | D1028 | scheduler | 19 Oct 26 | the row says told | The agent's readings, put to him with the mock-up (not yet his): one tap on the empty box puts the suggestion in, selected, so typing replaces it at once | 11 |
| R0925 | D1027 | scheduler | 19 Oct 26 | the row says told | that it is a suggestion, not filled in by itself, is the agent's reading.") Part of it is already there (checked in the code, `engine/rules.ts`): the Logic page's "Nominal report before T/O", 3 hours by default, is today where a formation's day starts when no in-time or rally is typed (D592) and the time the "+ In-time / Rally" button fills in (D510). | 11 |
| R0926 | D1026 | scheduler | 19 Oct 26 | silent | The agent's readings, to confirm with the mock-up (D853, D541): "normal" is the week's flight table (View-only Sched), where today the column is B / TO with LD alone beside it | 11 |
| R0927 | D1026 | scheduler | 19 Oct 26 | the row says not told | A formation's own rally counts as an entered rally for OIL, the earliest applicable in-time or rally still deciding the report start (D591, D505 — the agent's reading, not checked against the code). | 11 |
| R0928 | D1017 | scheduler | 18 Oct 26 | silent | The agent's readings, to tell him: (1) option A was the recommendation | 11 |
| R0929 | D997 | scheduler | 18 Oct 26 | silent | The agent's readings, to tell him: (1) "1." is read as the first option, the recommendation with its three exceptions | 11 |
| R0930 | D995 | scheduler | 18 Oct 26 | silent | the agent's reading of the point behind it (D852): a short window over the schedule reads better in the middle of the screen than hanging from its foot. | 11 |
| R0931 | D995 | scheduler | 18 Oct 26 | silent | The agent's readings, to tell him: (1) "those windows" are the ones that batch moved: the schedule's input window from every door (a Personal Inputs line, an Unavailable row, the board's "+ Inputs" and "+ Add"), checked against the batch's own walk | 11 |
| R0932 | D958 | scheduler | 17 Oct 26 | silent | The agent's reading: the short word "Common" stands where "Ground" stood, every other word kept. \| `OUTSTANDING.md` [ALLAVAIL-COMMON] (D958) | 11 |
| R0933 | D957 | scheduler | 17 Oct 26 | silent | (recommended: yes, the same words): "Yes as recommended" \| Where an ALL AVAIL / ALL input stands on the Common Programme (D955), the same line as the Ground Programme's stands under the Common Programme's heading — "to take an input off, press reject on it in Personal Inputs below." — only on a day where such an input stands there, on the Scheduler Board and Edit Schedule's we… | 11 |
| R0934 | D955 | scheduler | 17 Oct 26 | the row says told | The agent's reading, told to him on the page: a published day already carrying one reads "1 pending" once when it moves (demo data, D56). | 11 |
| R0935 | D947 | scheduler | 16 Oct 26 | silent | The agent's readings: (1) the line takes the removed-input note's own small style, as drawn | 11 |
| R0936 | D945 | scheduler | 16 Oct 26 | the row says told | The agent's readings, told to him: (1) where the input's row stands on another day the button reads "Reject · Tue", as "Undo · Tue" does today (checked: `raptor-port/src/ui/html.ts`, the accept buttons) | 11 |
| R0937 | D938 | scheduler | 16 Oct 26 | the row says told | The agent's readings, told to him: (1) it answers question 2's moved line only | 11 |
| R0938 | D933 | scheduler | 15 Oct 26 | silent | The agent's reading, checked in the engine (validate.ts, the crew-rest rest window): the rest runs to the earliest of his in-time, his B where no in-time is typed, or anything earlier that day, such as a meeting — so the line names the in-time first and the rest stays in its fold. \| `raptor-port/docs/superpowers/specs/2026-10-15-logic-page-lines.md` (D933 — the crew-rest line,… | 11 |
| R0939 | D932 | scheduler | 15 Oct 26 | silent | The agent's readings: the rewritten page already reads its numbers live | 11 |
| R0940 | D931 | scheduler | 15 Oct 26 | silent | The agent's readings: a line so short that a user cannot tell what it means (a bare list of letters, a line that leans on the name above it) is rewritten as a plain sentence | 11 |
| R0941 | D929 | scheduler | 15 Oct 26 | silent | The agent's readings: a setting's one line names what else moves with it (the brief time moves the suggested B | 11 |
| R0942 | D928 | scheduler | 15 Oct 26 | the row says told | All as recommended" — the morning after the night of 15 Oct 26, shown the night's report with two picture pages, each ending "All as recommended" (the agent's reading, told to him: his one "All as recommended" answers both pages, as the report said it would) — the Logic page (https://claude.ai/artifact/QaySHx83mqvS9Dcr1Z7gYN), its four questions. \| The Logic page is built as d… | 11 |
| R0943 | D925 | scheduler | 15 Oct 26 | silent | The agent's readings: "what is affected" is one line of consequence in the app's words under each setting, never a description of the code | 11 |
| R0944 | D877 | scheduler | 15 Oct 26 | silent | the design guide's "one mark, one look" wording (version 2, after one fresh reader) with five clauses named as the agent's readings | 11 |
| R0945 | D877 | scheduler | 15 Oct 26 | the row says told | The agent's readings, told to him: built as its own small job with its check and his look on his iPhone before it goes live | 11 |
| R0946 | D860 | scheduler | 15 Oct 26 | silent | Fix that visual". \| The just-added mark is one look everywhere — the Scheduler Board's plain blue ring with no glow, on the inputs pages too — and it sits on the edge of the thing added: a note added on the board is ringed round its own box, not round its whole row. The agent's readings: (1) every input mark loses its glow — the opened day's card, the month's bar, the Inputs L… | 11 |
| R0947 | D845 | scheduler | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the ALL AVAIL window's hint follows it — "Nothing on this day earns. | 11 |
| R0948 | D844 | scheduler | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the switch's name is written as the app writes a control's name in a sentence, in curly double quotes, as "“+ Wave” above adds the first" does | 11 |
| R0949 | D842 | scheduler | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) it shows only when an answer is both picked and has the keyboard, so on a phone or with a mouse there was never more than one ring | 11 |
| R0950 | D841 | scheduler | 14 Oct 26 | the row says told | The agent's readings, told to him: (1) the edge goes amber only while a bar is up and returns to that page's own when the bars go | 11 |
| R0951 | D840 | scheduler | 14 Oct 26 | mixed (both words in one clause) | The agent's readings, told to him: (1) where the letters are too wide for the line, the bar's letters and the room round them go a step smaller until it fits — no word is cut and the buttons never drop under the words (not checked on his iPhone: the pictures are in a Windows browser's narrower letters) | 11 |
| R0952 | D839 | scheduler | 14 Oct 26 | silent | The agent's readings: (1) row 10's one word ("can raise the credit") goes into the OIL question's small print | 11 |
| R0953 | D838 | scheduler | 14 Oct 26 | silent | The agent's readings: (1) N5, N18, N20, N21 and every "Only a scheduler can …" have no dash joining thoughts and are left | 11 |
| R0954 | D837 | scheduler | 14 Oct 26 | silent | The agent's readings, carried from D829: (1) the tests that pin each sentence are re-expressed with the build | 11 |
| R0955 | D836 | scheduler | 14 Oct 26 | silent | The agent's readings: (1) he approved it from the page's twelve checks in plain terms and their examples — the full text is the design guide's, read three times by a fresh Opus reader and Fable (D832, D835) | 11 |
| R0956 | D834 | scheduler | 13 Oct 26 | silent | Told that the writing guide's second draft was with its readers and that "fewer dashes" was the agent's reading of his "less -" (two thoughts joined by a word or a full stop): "- just feels very AI. | 11 |
| R0957 | D834 | scheduler | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) the order when two thoughts meet: the linking word (so, because, but) or a full stop first | 11 |
| R0958 | D833 | scheduler | 13 Oct 26 | the row says told | And a few minutes later, two messages: "U can use skill or guides online to help you design and shape this" · "And reviews on what’s good". \| The writing guide is a standing companion to the design guide and the design skill, used every time text in the app is written or changed — its aim: intuitive, clean, simple, smooth, less verbose, more human, with fewer dashes — and the … | 11 |
| R0959 | D833 | scheduler | 13 Oct 26 | silent | (2) "less -" is fewer dashes (the long dash the app's notes lean on) — said to him as a reading, his to correct | 11 |
| R0960 | D831 | scheduler | 13 Oct 26 | silent | The agent's readings: (1) "ok" is yes to the recommendation as worded — the band, and drawn first | 11 |
| R0961 | D828 | scheduler | 13 Oct 26 | silent | the desktop's note stays as it is. The agent's readings: (1) the cause is how the note is centred, so the rise-in movement keeps in step with the new place | 11 |
| R0962 | D825 | scheduler | 13 Oct 26 | the row says told | The agent's readings, told to him: (1) he named no wording, so every one on the page is redone to this rule — the passing notes and the clash note's lines alike ("weekend/PH work" and "the day holds" come back) | 11 |
| R0963 | D824 | scheduler | 13 Oct 26 | the row says told | The other don't have and I like the others which doesn't have that blue ring". \| On the app's one date calendar the picked date is the plain bright disc with no ring round it — a ring shows only while a keyboard is on a date, never after a tap or a click. The agent's readings, told to him: (1) the ring in that picture is the keyboard's place marker — as built it shows only whe… | 11 |
| R0964 | D815 | scheduler | 13 Oct 26 | silent | The agent's readings: (1) the other bell lines are unchanged — an input taken off the programme and put back on it still read as they did | 11 |
| R0965 | D809 | scheduler | 13 Oct 26 | the row says told | a picture is put to him before it is built. The agent's readings: (1) "editable" is every setting a scheduler can change on the page — the numbers, switches, words and lists | 11 |
| R0966 | D800 | scheduler | 13 Oct 26 | silent | step two may start. It answers the builder's reading the code read left to him ("the new calendar itself does not turn its month on a swipe" — the owner's to decide). | 11 |
| R0967 | D800 | scheduler | 13 Oct 26 | silent | The agent's readings, to tell him: in a run (Admin's "A date range") a swipe turns the month and keeps the run | 11 |
| R0968 | D797 | scheduler | 13 Oct 26 | the row says told | The two steps (the agent's reading of "2 step", told to him): STEP ONE — the Calendar window's swipe (D795) and the calendar over the form for every date box that is still the phone's own ("Every <weekday>", Post in, Admin's dates with its range, the upchit date, the Leave War's four posting dates) | 11 |
| R0969 | D796 | scheduler | 13 Oct 26 | silent | The agent's readings, to tell him: "applicable" is every place a date or a run of dates is PICKED — the Leave War's range calendar (a leave bid, a new period, the bidding dates, an event, an OIL credit, the OIL tracker's range), the holiday form's, the calendar in an input's own window, the schedule's week picker, and the phone's own date boxes (a new person's Post in, Admin's… | 11 |
| R0970 | D776 | scheduler | 12 Oct 26 | the row says told | The agent's readings, told to him — to confirm at the build: (1) ALL AVAIL / ALL is still not offered for a Personal input (D712 is not changed) | 11 |
| R0971 | D769 | scheduler | 12 Oct 26 | silent | The agent's readings: (1) a line reads, for example, "Range brief · Wed 15 Jul" over "Cancelled — WX · Saber" | 11 |
| R0972 | D778 | scheduler | 12 Oct 26 | silent | The agent’s readings, to tell him at the build: not counted in work hours either, as today | 11 |
| R0973 | D767 | scheduler | 12 Oct 26 | silent | The agent's readings, to tell him: (1) the names, the hours, the LATE mark and "By Saber" are untouched, and the remark follows the reason in the ordinary muted grey | 11 |
| R0974 | D762 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) on an input with one person, that person answers as today | 11 |
| R0975 | D760 | scheduler | 11 Oct 26 | the row says not told | The agent's readings, to tell him: (1) a cancelled input earns nobody OIL and is not checked against the rules, as a cancelled row today | 11 |
| R0976 | D757 | scheduler | 11 Oct 26 | the row says told | The agent's readings, to tell him: (1) it is the behaviour, not the wording: the exact words of each note, bell line and refusal are settled in the plan and shown to him as pictures before any visual build (D541's rule for a visual change) | 11 |
| R0977 | D756 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) what is one person's own stays his, as a line of that list — that he is in it, his own OIL answer or switch, his clash checks, his bell, his Leave War line | 11 |
| R0978 | D755 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (a) two routes to the same people give the same row, the same card and the same OIL rule — pinned by a test | 11 |
| R0979 | D753 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) "the answer given for the input" is the one whoever filed it gave for everyone (D660, D682) — never one man's own changed answer (D744) | 11 |
| R0980 | D751 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) the same holds for every item of the grey kind, not the long work day alone | 11 |
| R0981 | D748 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) the window opened there shows the people picker with everyone lit, saves for everyone in one step, its Delete asks "for all", and its OIL lines count everyone | 11 |
| R0982 | D747 | scheduler | 11 Oct 26 | silent | The agent's readings, to tell him: (1) the red line of a cancelled row is drawn the same way and moves with them, so all three stand in one place | 11 |
| R0983 | D743 | scheduler | 10 Oct 26 | the row says told | The agent's readings, told to him on the page: (7) the empty line the app keeps under the pucks when they exactly fill their line stays, as on every row today | 11 |
| R0984 | D742 | scheduler | 10 Oct 26 | the row says told | The agent's readings, told to him: (1) what is true today, read in the code: a time or a remark typed on an input's row under Personal Inputs or on the Unavailable list ALREADY changes the input itself (it goes through the input's own save, `raptor-port/src/ui/inputedit.tsx setInpField`) | 11 |
| R0985 | D740 | scheduler | 10 Oct 26 | silent | The agent's readings, to tell him: (1) it is about the row's TIME and REMARK boxes | 11 |
| R0986 | D739 | scheduler | 10 Oct 26 | silent | Whether a ONE-man request's row follows was asked again and answered the same day — yes: D740. The agent's readings, to tell him: (1) what stays the row's own: the marks only a scheduler makes — a red box, a CX, the info-only flag, a placeholder puck (D468, D46) | 11 |
| R0987 | D737 | scheduler | 10 Oct 26 | the row says told | The agent's reading, told to him: it holds for whatever kind lands on the Unavailable list, not only the three named in the question. | 11 |
| R0988 | D736 | scheduler | 10 Oct 26 | the row says told | The agent's readings, told to him: (1) it is the same unit as a request's row and its filing counting one (D114) and each man taken off or added to a crowd counting one (D113) — it refines the unit of D109, nothing else | 11 |
| R0989 | D735 | scheduler | 10 Oct 26 | the row says told | The agent's reading, told to him: with D734, taking him off the row takes him out of the input | 11 |
| R0990 | D734 | scheduler | 10 Oct 26 | the row says told | The agent's readings, told to him: (1) his answer was a lean with a question | 11 |
| R0991 | D731 | scheduler | 10 Oct 26 | silent | The agent's readings, to tell him: (a) "yes to all" is also his word to START the batch — the night's permission of D730 had lapsed ("the batch is his to start"), and the reply he answered said the ten ready faults and his approved answers would be built as one batch | 11 |
| R0992 | D717 | scheduler | 9 Oct 26 | the row says told | The agent's readings, to tell him: (1) on a desktop the kind was to stand small BESIDE the title — as told to him before his yes | 11 |
| R0993 | D713 | scheduler | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) so Event follows the rules Training, Appointment and Duty follow today — a red clash across a standby shift, not Meeting’s amber | 11 |
| R0994 | D711 | scheduler | 9 Oct 26 | silent | (4) an OIL question nobody answered goes to the filer’s bell, and only his. The agent’s readings, to tell him: (1) narrows D660 / D682 for this one kind of input — in a shared input each man still changes his own answer | 11 |
| R0995 | D710 | scheduler | 9 Oct 26 | silent | The agent’s reading, to tell him: with it, an ordinary change to a note gets a readable line in the changes window too — the same missing piece. \| `OUTSTANDING.md` `[DELETE-LIST-CAL-NOTES]` (his yes — D710) | 11 |
| R0996 | D706 | scheduler | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) it changes the SANS calendar settings, the Inputs calendar settings and Add / Change a holiday | 11 |
| R0997 | D702 | scheduler | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) "whoever is free at filing but … realtime" is read as ONE input that carries the placeholder, the people behind it worked out fresh each time it is looked at — not a list of names copied in and then kept in step | 11 |
| R0998 | D686 | scheduler | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) it holds for every window of the calendar job (a day opened, the new-input and input windows, "Calendar", the settings windows), not only the one in his picture | 11 |
| R0999 | D682 | scheduler | 9 Oct 26 | silent | the scheduler’s refusal on the day still wins. It confirms the reading told on 8 Oct 26 and seen in the walk (walker G, X-04), and stands beside D660: the LATEST answer is the one that counts, whoever gave it. | 11 |
| R1000 | D682 | scheduler | 9 Oct 26 | silent | The agent’s readings, to tell him: (1) "again" is any time the question comes back to the filer — he changes the hours or the dates so the old answer no longer fits, he adds a man, or he opens the OIL question himself | 11 |
| R1001 | D716 | scheduler | 9 Oct 26 | silent | The agent's readings, to tell him: (a) "As recommended" answers these four questions only — it is NOT taken as his yes to the five readings of the ALL AVAIL / Event check, which still wait | 11 |
| R1002 | D668 | scheduler | 8 Oct 26 | silent | The agent's readings, to tell him: (1) no control for renaming them is built | 11 |
| R1003 | D665 | scheduler | 8 Oct 26 | silent | The agent's readings, to tell him: (1) they are the LAST rows of the block, under the squadron's own counts, and fold away with the Manning button as those do | 11 |
| R1004 | D663 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) it is how the window GROUPS: the history still keeps a line for each man, so a later change to one man alone shows as its own line under the item, naming him, and "Group by: Who" is unchanged | 11 |
| R1005 | D661 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) it is about what the SCHEDULE draws - the Ground Programme and the Personal Inputs rows on the week and the board | 11 |
| R1006 | D660 | scheduler | 7 Oct 26 | silent | Told the reading "nobody answers another man's OIL question | 11 |
| R1007 | D660 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) one question at the save, and its answer is written onto every man's record - the days and hours are the same for all, so the amount is too | 11 |
| R1008 | D645 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) a short form is up to three letters with no space — measured in the running app, "NO L" keeps the day's width but its space wraps it onto a second line and makes the whole Event row taller, so No Leave starts as "NL" (his "NO L" was the question | 11 |
| R1009 | D644 | scheduler | 7 Oct 26 | silent | The agent's readings, to tell him: (1) the word proposed is "Presets", with "Edit presets" for the button — "Saved" and "Quick picks" offered beside it | 11 |
| R1010 | D642 | scheduler | 7 Oct 26 | silent | the Leave War's panel for a picked block of people's days is brought into line with D641 in this job — it stays up and the grid behind it works — and the war's other windows are left for a job of their own. It settles the last two readings of the fourth set and changes D641's reading (5). | 11 |
| R1011 | D642 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) a blank weekend shows no sun, no moon and no "NF", and a dash for the required figure | 11 |
| R1012 | D641 | scheduler | 7 Oct 26 | silent | The agent's readings, to tell him: (1) "those pop up windows" are the windows with a title of their own drawn for the two calendars and for the Leave War's new rows — the panel for picked cells, the settings window, "Every Thursday", adding a holiday, a day opened on a calendar, an input or a commitment being filed | 11 |
| R1013 | D640 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the Leave War's count rows already take a free name and a choice of who they count — by seat, by CAT (with "everyone except", OCU among the CATs) and by quals — so the two Available rows are two such rows, ready-made (pilots | 11 |
| R1014 | D637 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) "skipped" means a running figure gives such a day no required number | 11 |
| R1015 | D636 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) he wrote "P avail and W avail": the AVAILABLE rows are worked out by the app from who is on leave, a course and the like, and cannot be typed — the agent reads him as meaning the two REQUIRED rows | 11 |
| R1016 | D634 | scheduler | 7 Oct 26 | the row says told | The agent's readings, told to him: (1) the real sheet already does what the drawing was for — it sets No Leave, an Off day or a public holiday on one day or a range — so nothing new is needed there | 11 |
| R1017 | D605 | scheduler | 6 Oct 26 | the row says told | a part-day absence against a seat with no times stays silent (nothing to compare) — built 6 Oct 26 on `Claude/blank-times-absence-picker-2cebae`, not yet merged. The agent's readings, told to him: (1) "4" is step 4 of that report's "what you do now" — this question — and "as recommended" is the answer YES | 11 |
| R1018 | D598 | scheduler | 6 Oct 26 | silent | The agent's readings: there is no cap on how many stand, since each needs its own typed edit | 11 |
| R1019 | D597 | scheduler | 6 Oct 26 | the row says told | The agent's reading, from the question as put to him: the same on the PHONE's Scheduler Board, where no button follows its last box. | 11 |
| R1020 | D529 | scheduler | 3 Oct 26 | the row says told | The agent's reading, told to him as "your own edit": an edit that removes or adds an aircraft and so leaves one formation needing an answer asks once too | 11 |
| R1021 | D511 | scheduler | 3 Oct 26 | the row says told | a rally is the formation's own box, so the word RALLY in this text no longer makes a rally. The agent's readings, told to him: the button writes the time, then the words as set | 11 |
| R1022 | D488 | scheduler | 2 Oct 26 | silent | the agent recommended removing it \| The "Discard marks" button is removed from the amendments box: a day not yet published keeps its change marks until it is published, which clears them as now. The agent's reading: nothing replaces it | 11 |
| R1023 | D478 | scheduler | 1 Oct 26 | the row says told | a change to Mission or Remarks wording still waits. One rule, day by day, the same on every page — so D477's question of "which page" falls away: the agent's reading, told to him, is that this holds on Edit Schedule and the Scheduler Board too (a scheduler's changes waiting on a published day do not move Insights until he publishes them | 11 |
| R1024 | D472 | scheduler | 1 Oct 26 | the row says told | The hidden will be noticed only if u open the issues dropdown and see the strike through and darken issue and realise that there's a hidden/muted issue" — to the last open reading of D469 / D471, put to him as: the day's count line ("3 issues · 1 warning — tap to review") with one of the three hidden — "2 issues · 1 hidden" (the agent's lean) or "3 issues"? \| A hidden warning … | 11 |
| R1025 | D471 | scheduler | 1 Oct 26 | silent | Still open (reading 1): whether the day's own count of problems still counts a hidden one — he asked what "N issues" is | 11 |
| R1026 | D367 | scheduler | 29 Sep 26 | the row says told | The agent's readings, stated to him: (1) a single name too long for a line breaks inside the word, as the board's boxes do (W6LI / NE) | 11 |
| R1027 | D361 | scheduler | 29 Sep 26 | the row says told | a "?" where a row has no timing or no end time is a future job, filed. The agent's readings, stated to him: (1) the "~" mark (option 2) is declined | 11 |
| R1028 | D360 | scheduler | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the ALL AVAIL window names the assumed hour ("18:30–19:30 · no end time, an hour assumed") | 11 |
| R1029 | D344 | scheduler | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his exact wording and punctuation — a colon, a capital T, no full stop — on the changes window's hint line | 11 |
| R1030 | D340 | scheduler | 28 Sep 26 | silent | Narrows D168 (its "Where = by the day's own sections" — the agent's reading, drawn on the approved mock-up `raptor-port/docs/mock/changes-window.html` §C and built in `[DRAFT-PENDING]`): the sections give way to items, his newer word winning (D90). | 11 |
| R1031 | D339 | scheduler | 28 Sep 26 | the row says told | built in ANOTHER chat (his words) — the agent's reading, stated to him: a fresh chat on its own branch from `main` once PR #451 has merged (or on the same branch if he prefers it before the merge) \| `OUTSTANDING.md` `[HIST-PHONE-HIDE]` (the build, its place, the mock-up) | 11 |
| R1032 | D337 | scheduler | 28 Sep 26 | silent | Sets aside Fable's reading (his one "deleted" line only) — WIDENED 9 Oct 26 BY D710: the list also names each planning note the man was taken off, one line a note — a small later job. \| `raptor-port/docs/engine-rules.md` §The edit log (the war records a non-war command takes — `crossLines`) | 11 |
| R1033 | D278 | scheduler | 27 Sep 26 | silent | Leave it?" \| A placeholder (ALL / ALL AVAIL) may stand on a row twice — "one man, once per row" (D271) is about men. Confirms the agent's reading stated with D271's build: a placeholder is not a man and stays silent wherever it may stand (D33) \| `raptor-port/src/engine/avail.ts` (`rowTwice`, its comment) | 11 |
| R1034 | D275 | scheduler | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: everything `[VIEW-ARROW-OVER-LIST]` added goes — the 54px padding and its scroll-padding, `weekInset` in every landing, its own tests — and the five older landing tests go back to measuring from the week box's edge | 11 |
| R1035 | D272 | scheduler | 27 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "question 2 yes" answers Q2b, the only item still open under Question 2 (Q2 itself was his yes earlier the same day, D270), and re-confirms D270 \| BUILT 27 Sep 26 with D270: `raptor-port/src/ui/scheduler.css` (the purple ring rule steps aside for `.oilglow`), pinned by `raptor-port/src/ui/flagglow-css.test.ts` | 11 |
| R1036 | D271 | scheduler | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) a man on two DIFFERENT rows at once is still only warned, as today | 11 |
| R1037 | D270 | scheduler | 27 Sep 26 | silent | and no mark glows since D880–D882, D887. Narrows the agent's reading of D164 ("the purple 'this is you' fill and ring stay") for a flagged puck. | 11 |
| R1038 | D270 | scheduler | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) the dotted "causes tomorrow's breach" ring is a flag too: flagged by it, his puck shows the dotted ring alone, as another man's does | 11 |
| R1039 | D263 | scheduler | 27 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) built INTO the one changes window (`[DRAFT-PENDING]`, D168), not today's history list, which that window replaces — so it is not built twice | 11 |
| R1040 | D188 | scheduler | 26 Sep 26 | silent | "Q6yes" — to the `[LEAVE-LATE-PUBLISHED]` look card's Q6: "My reading of D185: 'a lapsed qualification' is live — SC currency, AAR currency, AAR instructor clearance and an illegal seat | 11 |
| R1041 | D188 | scheduler | 26 Sep 26 | silent | Right?" \| Confirmed: the agent's reading of D185, as built. Live on a published face: the warnings the app marks with its Qualification flag (an illegal seat, SC currency, AAR currency, an AAR instructor not cleared) and the crew-rest check's tight-turn note beside its breach | 11 |
| R1042 | D188 | scheduler | 26 Sep 26 | silent | Closes the reading D185's row left open for him \| `raptor-port/src/engine/validate.ts` (`LIVE_ON_FACE`) | 11 |
| R1043 | D187 | scheduler | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: looking at the day's CURRENT published version shows exactly what View-only Sched shows (the warnings it went out with, with the live ones — D183–D185 — on top) | 11 |
| R1044 | D185 | scheduler | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: (a) "2 & 3" are items 2 and 3 of that list — so medical is NOT made live (he chose the same for it in D179, against the same recommendation) | 11 |
| R1045 | D185 | scheduler | 26 Sep 26 | the row says told | The agent's reading WIDENED at the build, 26 Sep 26 (overnight), stated to him on the look card so he can correct it: (d) "a lapsed qualification" = the warnings the app marks with its Qualification flag — an illegal seat (`QUAL`), SC currency (`SC_QUAL`), AAR currency (`AAR_QUAL`) and an AAR instructor not cleared (`AAR_INSTR`) | 11 |
| R1046 | D184 | scheduler | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: (1) it covers the consecutive-days warning (`DAYS_RUN`) on the published day itself and its "7" mark (the RUN trace, already live under D183) | 11 |
| R1047 | D183 | scheduler | 26 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the mark is not stored with the published version and is not compared, so a change to the next day that moves it does NOT make the published day pending or take its four down — the break itself is the NEXT day's warning, pending there if that day is published | 11 |
| R1048 | D179 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "everything" also takes in a rule setting the admin changes (its effect on a published day's warnings waits for a re-issue, as D48 already holds the day's OIL) | 11 |
| R1049 | D177 | scheduler | 25 Sep 26 | silent | Like change the published schedule when an input goes in" \| — WIDENED 25 Sep 26 BY D178: every member input change after publishing (filed, edited, deleted, moved) is pending, not only a late leave. — ITS MEDICAL SENTENCE SET ASIDE 25 Sep 26 BY D179 (confirmed by D185): a medical downchit freezes on the published face too and reads pending — the reading below that it "stays li… | 11 |
| R1050 | D177 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: it covers every Unavailable-type input filed after publishing (leave, OD, courses) — NOT a medical downchit, which stays live on the published face the moment it is filed (a safety fact, never versioned — the standing exception in `raptor-port/src/engine/events.ts`) | 11 |
| R1051 | D176 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a dormant request still covering the day and woken back to a live one (retyped, so it flags again) stays a change — only its going away is not \| BUILT on the branch claude/request-one-row: `raptor-port/src/engine/publish.ts` (`filingSame`, read by `filingDelta` and `filingKey`), `raptor-port/docs/engine-rules.md` §Publis… | 11 |
| R1052 | D174 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the request stays silenced as today (taken off, flags nothing — 26 Aug 26) | 11 |
| R1053 | D170 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: on a PUBLISHED day the window also still says what will go out as the next ALn (the pending count, unchanged) | 11 |
| R1054 | D169 | scheduler | 25 Sep 26 | silent | This is because I want to shame admins who abuse their authority to try to plan themselves with easier lives and I want full transparency." — answering the agent's recommendation that the full change history be for admins only \| Members see the FULL change history too — who changed what, on every day — from View-only Sched, by opening the live working copy. — NARROWED 26 Sep 2… | 11 |
| R1055 | D169 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: members READ it (no "Mark all as seen" affects anyone but themselves | 11 |
| R1056 | D168 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: two views inside it — what is new to you, and every change — and on a published day the list also says what will go out as the next ALn | 11 |
| R1057 | D167 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a scheduler's tool — members, who do not edit the schedule, do not get it (put to him) | 11 |
| R1058 | D119 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: ordered by when each change was last made (the edit record's time), newest at the top | 11 |
| R1059 | D117 | scheduler | 25 Sep 26 | the row says told | "Can u also allow the history list to instead just show all days, i can select which day to view in that week" — during his look at PR #435 \| The edit history list shows the whole week, with a day picker to narrow it to one day. The agent's reading, stated to him so he can correct it: it opens on all days of the loaded week, newest first as now | 11 |
| R1060 | D116 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: one History mode shared by the board and the edit week, so turning it on in one place is on in the other | 11 |
| R1061 | D114 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the mirror act — accepting a request onto a published day (its row added + its filing) — is also ONE, by the same reason | 11 |
| R1062 | D111 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the ORIG tag only — the AL tags and the dashed DRAFT stay as they are | 11 |
| R1063 | D110 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the finished look is still his pick — refined variants of A are drawn on the same page, each beside real AL3 (green) and AL4 (white) days, and none may take an AL colour or look like a button \| the mock-up `raptor-port/docs/mock/orig-tag.html` | 11 |
| R1064 | D109 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a man (or a placeholder puck) taken off one place and put on another place of the SAME day pairs into one move, and the pending list's line reads "Warden: MET + NOTAM BRIEF → SODB" | 11 |
| R1065 | D107 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: the pending list's tap (D99, D100) is the same gesture, so ONE "take me to this change" serves both and lands on the page you are on, with the same brief mark | 11 |
| R1066 | D103 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him: he took the recommendation as written | 11 |
| R1067 | D102 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: A only — B (the ⓘ panel's list of every version) is not taken | 11 |
| R1068 | D101 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him: he took the recommendation as written \| `OUTSTANDING-ARCHIVE.md` `[AMEND-REISSUE-DOOR]` | 11 |
| R1069 | D99 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: each item says what changed and where, and — from his idea of the same day — who changed it and when, where the app knows (see the item's limits) | 11 |
| R1070 | D98 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his principle answers question 7 "yes" | 11 |
| R1071 | D96 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: refused with its reason on screen at every door that applies a template (the house rule for a refusal) | 11 |
| R1072 | D95 | scheduler | 25 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: all four sign-offs of each version (CUR CK, SKED CK, PLANNED BY, APPROVED BY) — "who signed off" | 11 |
| R1073 | D93 | scheduler | 24 Sep 26 | the row says told | The agent's reading, stated to him: it answers the page's first question only — whether the board should draw the dashed and dotted rings (`[BOARD-RING-STROKES]`) is still put to him \| the mock-up | 11 |
| R1074 | D91 | scheduler | 24 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: it covers the whole item, so an emptied COCKPIT seat also stays as it is (the week shows the "ALn" badge once issued | 11 |
| R1075 | D65 | scheduler | 23 Sep 26 | the row says told | The agent's reading of one case he did not name, stated to him: with the mode ON but the window on its "who's available" tab, the tap does NOT highlight either — his words key it to the mode ("when not in oil earn mode"), and inside the mode no tap selects \| `raptor-port/src/ui/AvailWindow.tsx` | 11 |
| R1076 | D1942 | tracker | 9 Nov 26 | silent | no other area changes until he says, one at a time. The agent's readings: "looks good" answers the page's question as "open it" | 12 |
| R1077 | D1935 | tracker | 8 Nov 26 | silent | and Find's ✕ on any window up to 1050 wide, a narrow desktop too, empties the box and puts Find away, as built — both kept, D1790's and D1791's rows marked. The agent's readings: he answered point 2 before seeing a picture, so the picture of what the app does (chat 9's walk, its s03-phone-B and s03-pc-B) went to him with the report | 12 |
| R1078 | D1931 | tracker | 8 Nov 26 | the row says not told | The agent's readings, not checked with him: (1) the + Add window without its typed box, and the words it shows when the search matches nobody or the roster is empty, are drawn for him before they are built (D1625) | 12 |
| R1079 | D1861 | tracker | 8 Nov 26 | silent | "Yes to both" — the second of chat 10's two recommendations of 8 Nov 26, with the picture of a phone on its side (Astra's reading 6, "his to decide") \| On a screen too short for the Tracker's marking window, such as a phone on its side, the chart lifts the event tapped as high as it may go and the window opens under it, scrolling inside itself, as built: the event stays in vie… | 12 |
| R1080 | D1538 | tracker | 31 Oct 26 | the row says told | It will live in this app." — said while [REACT-DOCTOR-CLEANUP] was being built, after the agent told him the Tracker's code had been kept as copied partly so it could one day go back out as its own app \| The Tracker is no longer to be exported back out as a standalone app: it lives in Raptor for good, as one of its tabs. The agent's readings, not yet checked with him: (1) this… | 12 |
| R1081 | D1406 | tracker | 27 Oct 26 | the row says not told | "A touch screen" is the agent's reading of "on a phone": a screen whose only pointer is a finger (an iPhone, an iPad) — a touch-screen laptop with a mouse keeps its bars | 12 |
| R1082 | D1018 | tracker | 18 Oct 26 | silent | The agent's readings, to tell him: (1) the desktop's colour strip under the Tracker's bar moves into the Legend pop-out, so a phone gets a legend too | 12 |
| R1083 | D1014 | tracker | 18 Oct 26 | the row says told | The agent's readings, to tell him: (1) a member sees the icon's window read-only, or no icon — put to him with the picture | 12 |
| R1084 | D1006 | tracker | 18 Oct 26 | the row says told | But if a global switch is turned off for flex then all details related to it will disappear on the app." — the flex half \| The flex can be set: its figures can be edited, and one switch for the whole Tracker turns flex off — then everything about flex disappears from the app (its bar, its windows and words, and its part of the legend). The agent's reading, to tell him: "the fl… | 12 |
| R1085 | D1005 | tracker | 18 Oct 26 | silent | But if a global switch is turned off for flex then all details related to it will disappear on the app." — the dates half \| — ANSWERED 8 Nov 26 BY D1931: "can't be a typed student" removes typed students from + Add too, not only the typed down-days box — the agent's reading (2) below is set aside. Every Tracker student is a man on the roster, so his down days always come from … | 12 |
| R1086 | D1005 | tracker | 18 Oct 26 | silent | a syllabus flight moves both the IP requirement and the flex. The agent's readings, to tell him: (1) his "a last flown currency will affect the ip requirement and flex" is read as a SYLLABUS flight's date, which is how the app works today (a syllabus date sets both dates | 12 |
| R1087 | D1004 | tracker | 18 Oct 26 | the row says told | The agent's reading, to tell him: whether a non-syllabus flight graded on the chart already moves "Last currency" by itself, or it is typed, is checked in the build and put to him if it does not. \| `raptor-port/docs/superpowers/specs/2026-10-18-trk-down-days.md` (D1004) | 12 |
| R1088 | D1003 | tracker | 18 Oct 26 | silent | and for a student who is a man on the roster the typed "No. of Down Days" box goes entirely. The agent's readings, to tell him: (1) "3 typed where" is his question, answered in the chat (the Info panel's number box), not an answer | 12 |
| R1089 | D992 | tracker | 18 Oct 26 | the row says told | The agent's readings, told to him: while zooming in the chart looks a little soft until the lift, as in Photos or Maps | 12 |
| R1090 | D987 | tracker | 17 Oct 26 | the row says told | My readings, told to him: it holds for all four ends and for the Info half as for the chart (one behaviour everywhere, D754) | 12 |
| R1091 | D985 | tracker | 17 Oct 26 | silent | "I want the scroll to have acceleration and deceleration when I scroll on my phone", then "Yes as mentioned" — to the agent's reading that he meant the two places the Tracker moves the view itself, and that it is built in a fresh chat once pull request 530 is live \| On a phone, a finger scroll of the Tracker's chart and of its Info half glides like the phone's own scrolling: i… | 12 |
| R1092 | D984 | tracker | 17 Oct 26 | the row says told | My reading, told to him: the same holds on the left, where a chart wider than its box has empty space to its left too (the version he saw in B's pictures held both) | 12 |
| R1093 | D981 | tracker | 17 Oct 26 | the row says not told | this is what D299's "a course still running" means. The agent's readings, not checked against the build (nothing of it exists yet): "leaves" is his place on that course's student list, as D299 says | 12 |
| R1094 | D924 | tracker | 15 Oct 26 | the row says told | and "Drag a row, or use ▲/▼." Is deleted from all three windows, each one's second sentence kept. The agent's readings, as drawn and told to him: a finger takes a row by its grip only, so a finger elsewhere scrolls the list | 12 |
| R1095 | D922 | tracker | 15 Oct 26 | silent | Same as the rest of the app with the same animation we recently implemented" \| The Tracker's ⇅ reorder windows (courses, syllabi, crew) let a finger drag a row on a phone, as a mouse does on a desktop, with the app's own drag look: one landing line a gap, the list scrolling at its edge (the design guide §5A, D895). The agent's readings, to tell him: (1) "the same animation" is… | 12 |
| R1096 | D801 | tracker | 13 Oct 26 | silent | The agent's readings, to tell him: a date is saved the moment it is picked, as today | 12 |
| R1097 | D377 | tracker | 29 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: his "Looks good" answers the look card as a whole \| the look card `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §11 (answered) | 12 |
| R1098 | D377 | tracker | 29 Sep 26 | silent | `.claude/decisions-full/tracker.md` D376 (reading 5 confirmed) | 12 |
| R1099 | D376 | tracker | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) "a person" is the person the account belongs to (a callsign rename keeps his place) | 12 |
| R1100 | D374 | tracker | 28 Sep 26 | the row says told | The agent's readings, stated to him so he can correct them: (1) "today" is the squadron's calendar day (Singapore time — the day the app already puts in the Done on and Failed on boxes by default, `isoToday`), not the device's clock (corrected by the agent the same hour, before the build, from "the device's own date") | 12 |
| R1101 | D373 | tracker | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: "short screen" is a window under about 500px tall | 12 |
| R1102 | D372 | tracker | 28 Sep 26 | the row says told | Import) stands. The agent's readings, stated to him so he can correct them: (1) keystrokes into one box within two seconds are one step, as for the date boxes (R109) | 12 |
| R1103 | D371 | tracker | 28 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: a failure with no day recorded (its day box emptied) sorts after every dated one, in the order it was recorded | 12 |
| R1104 | D129 | tracker | 23 Sep 26 | the row says told | The agent's reading, stated to him: it is the logout that asks (the Raptor Logout, which ends the Tracker's session through its one existing seam) | 12 |
| R1105 | D123 | tracker | 23 Sep 26 | the row says told | The agent's reading, stated to him: it is worked out from the flights marked done, so correcting a flight to an earlier day, or un-marking it, pulls Last Flown back to the latest flight still flown (today it can never come back down — once to a future day). | 12 |
| R1106 | D122 | tracker | 23 Sep 26 | the row says told | The agent's reading, stated to him: an import brings in the file's OWN detail edits and never overwrites a detail here with the shipped wording (today the export carries the whole shipped table, so importing one chart put shipped values back over edits on other charts). | 12 |
| R1107 | D121 | tracker | 23 Sep 26 | the row says told | The agent's reading, stated to him so he can correct it: everything else in the Tracker was already everyone's, so "the same access authority" can only change the File menu. | 12 |
| R1108 | D120 | tracker | 23 Sep 26 | the row says told | What it makes MORE important — the agent's reading, stated to him so he can correct it: that round trip is now the ONE path by which his hand-drawn charts survive, so a CURRENT export or import that loses or changes a ball, a line, a position, a font, a chart name or any event detail is a real finding, and the highest one. | 12 |
