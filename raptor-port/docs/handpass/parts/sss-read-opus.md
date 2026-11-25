# Blind Opus read — c182: standby lines never ask a SANS man; untimed sims strike; D2585; D2587

Head: no handoff block, walk report, evidence sheet or other reader's report was opened or pasted into my context. I read
the brief, the four diffs (ee6c9b0a7, 6acc639d9, c02d68793, cdb605dff) and the exported copy's code. Nothing was written to
the app's source or the repo. One proof test is in my scratch folder (named under O1).

## Findings

### O1 — An untimed OFT / AMT seat: the crew list strikes "SANS — not offering OFT", the warning list stays silent (the same case on a flight warns). Medium-low. Confirmed by reading; proof test written.

- **Setup.** Mon 13 Jul. Ipman is SANS and filed "Fly only" for the day. A new OFT row is added with no times (start and
  end blank).
- **Action.** Arm the OFT front seat, then drop Ipman on it.
- **What shows.** The crew list strikes him with "SANS — not offering OFT" (c02d68793, D2585). The drop's note is the
  fallback toast with the same words (drag.ts barDrop). After the drop, no amber "A" on his seat, no line on the warning
  list, and the day publishes clean.
- **The same case on a flight.** A new flying line with no times, Ipman filed "OFT only". The crew list strikes him
  ("SANS — not offering Fly"), AND the warning list says "SANS: not offering Fly today. Planned on … (no times yet)" with
  the amber "A". The case D2585's own "When" cites is exactly this agreement.
- **What should show.** The picker and the warning list agree, as they do for the flight, the timed sim (str typed, end
  blank, also checked) and every case D2585 names. The standing rule in avail.ts's SANS block and in validate.ts says the
  two "must not drift". D2585 made the crew list strike before times are typed, and that new strike has no warning-list
  partner for sims. Before c02d68793 both were silent for an untimed sim.
- **Cause.** `raptor-port/src/engine/validate.ts` lines ~1538–1541. `sansChecks` reads only `day.fly` and the sim
  entries of `day.events`. A sim with no start is pushed to `day.blank`, not `day.events` (events.ts ~459:
  `if(!sw){blank.push({id,label:'Sim '+s.label,key:'s:'+di+'.'+k+'.'+ri,kind:'sim'});return;}`). An untimed flight
  stays in `day.fly` with NaN times, so it is checked. The untimed sim is never checked.
- **A related test that models this wrongly.** `raptor-port/src/leavewar/sans-planned-r5.test.ts` (~line 111) builds
  "what the warning list reads for SANS availability" including `b.blank.filter(sim)`, but the validator never reads
  `blank`. Today it changes no result because every sim row in that test has times. An untimed-sim row with
  `counts: true` would pass that assertion while the warning list stays silent.
- **Not D2579 territory.** D2579 is about nothing filed (`none`), which stays silent for flights and sims alike. This is
  `not-offered`, which the warning list already raises for an untimed flight.
- **Fix, step by step:**
  1. In `validate.ts`, right after the `day.events.forEach(...)` that pushes sim entries into `sansChecks`, add:
     `(day.blank||[]).forEach((e:any)=>{ const m=/^s:\d+\.(amt|oft)\./.exec(String(e.key||'')+'.'); if(!m||e.kind!=='sim')return; sansChecks.push({id:e.id,domain:m[1],s:NaN,en:NaN,label:e.label,key:e.key}); });`
     The blank key is the row key `s:di.oft.ri`, with no trailing dot. That is why `'.'` is appended before the regex, or
     you can use `/^s:\d+\.(amt|oft)\.\d+$/` on the bare key.
  2. Nothing else changes in the loop. `'none'` stays silent (D2579 not built). `'window'` is already dropped by
     `noWin(c.s,c.en)`. Only `'not-offered'` raises.
  3. The words: `whatAt(rowName({label,kind:'sim'}),NaN,NaN)` prints the bare row name. To match the flight's
     "(no times yet)", append it when `!isFinite(c.s)`. Words are his: put the exact sentence to the wording reader /
     Fable per D2441 before shipping. The current "not offering …" stem is accepted as built (the brief).
  4. Fix the r5 test's `checked` set to read what the validator reads (step 1's shape), and add an untimed OFT row to
     `ROWS` with `counts: true`.
  5. The drop's note then comes from the drop delta (dropflag) in the validator's words, as for the flight. Check that
     the toast does not now say it twice.
- **Proof test:** `C:/Users/User/AppData/Local/Temp/claude/b8a1837cdd4dc44d/c542647c-a1a9-4e36-8c81-abd9e17ec092/scratchpad/c182-opus-proofs/sans-untimed-sim-warn.test.ts`.
  Copy it into `raptor-port/src/engine/` and run it alone. Expected today:
  - the untimed-flight control and the start-only OFT control pass;
  - the two untimed OFT / AMT cases fail on "the warning list" (0 instead of 1).
- **The host's call:** if you judge the warning list's coverage of untimed sims a product question rather than a fault,
  it is a one-line question to him with this worked example ("Ipman, Fly only, put on an OFT with no times yet: struck
  on the crew list, nothing on the warning list"). My recommendation is to fix it, because the flight already warns.

### O2 — Observation, not a finding unless he rules otherwise: with NO seat picked, a SANS man with nothing filed is still struck for the whole day, even if the only places he could take that day need no filing (SC, AVALON, BB, a ground row, a desk).

- `ui/palette-html.ts whyOf` (no armKey) strikes on `sansDay && !sansAvailOn`. This is the "record-less SANS are struck
  by default" rule of 14 Aug 26, and it predates this change. D2420 already took away its printed line.
- D2584 Q4 reads as about the seat ("never strike him for nothing filed" on those lines). The armed path honours it. The
  unarmed path still crosses him out and keeps him out of "SANS Avail · N free".
- D2584's row says: "every other SANS man with nothing filed changes with these rules, and the 'N free' count". That
  might cover the unarmed count, or might not. I cannot settle it from the rows.
- Flagged so the host can check the drawing. No fix proposed.

## Explicit negatives — checked, nothing found

- **Coverage of `sansStby = scLine||avFly||avJet` over every standby row** (slotRules, avail.ts ~206–350):
  - SC MAIN and SC SPARE, flying or not, timed or blank: `scLine` (standalone && kind==='sc').
  - AVALON / BB not flying, MAIN and SPARE, BB with blank shift times: `avJet`, set before the hours are read.
  - AVALON / BB flying by typed B/R or by a row's Flies tick: `avFly` (and `scLine` via flyRow).
  - A cancelled shift or row: `scLine` for SC, `avJet` for AVALON / BB.
  - An append `.+` or overflow `.xN` is stripped first, and a flying line has neither.
  - None of the three can be set on a non-standalone wave, so an ordinary flight and a sim are never covered.
- **The three definitions agree:** validate's `e.shift`, daySansSeats' `w.standalone` and the crew list's `sansStby`.
  - `e.shift = isStandalone(w)` (events.ts ~425). Only SC MAIN and flying standby rows ever reach `day.fly`. SC SPARE
    and non-flying AVALON / BB return earlier.
  - A standalone wave always carries kind sc (noconf false) or avalon/bb (noconf true): makeStandalone, waveFromTpl
    (kindIsStandby keeps kind and noconf), and board.ts ~1347's conversion. No path makes a standalone wave of another
    kind, so no row is skipped by the bell and the warning list but struck by the crew list. Malformed old waves would
    be demo data (D56).
- **Standby desks (`d:` keys) and ground / all-hands rows:** domain is null, so never asked. daySansSeats never counts
  desks.
- **A sim's extra places** (`.+`, `.pax.N`, `.xN`, AMT `pax[]`, OFT `more[]`): slotRules strips `.+` and `.xN`, and the
  `s:` branch reads simKind from `a[1]` whatever follows, so all reach the sim domain. daySansSeats counts p, w, pax and
  more. They agree (D2586).
- **A sim with one time typed.**
  - Start only: `win()` gives simLen, so it is timed in both slotRules and events.ts (events, checked).
  - End only: `win(null,…)` is null in both, so it goes through the untimed block and `day.blank`.
  - The two sides treat each case the same way. Only O1's warning gap follows from it.
  - The timed and untimed blocks are exact complements (`slotStart/End != null` against `== null`).
- **The untimed block skipping later checks.** Seat bars, SC and AVALON same-hours walks, crew rest, AAR and the four
  absence blocks all run before it. Below it there is only the busy-at-this-hour scan (needs times), the whole-day
  activity hint and the cross-day rules. Returning the SANS reason first matches the timed block's existing order, so
  nothing is newly hidden in kind. Drops are never refused for it (warn only).
- **Cancelled rows.** daySansSeats skips `f.cx`, `a.cx` and `o.cx`, so the reminder never counts them (D2568). The
  crew-list strike on a cancelled seat stays as built (accepted).
- **`r.di`, `DAYS[r.di].dt`, `dayIso(CURWEEK,r.di)`:** both blocks and the validator use the same pair (dt for the
  filing, iso for "SANS on this day"). A seat key never names another week. The reminder's held weeks use year-carrying
  labels (pre-existing).
- **D2338 / D2340 (SANS from a date ahead):** `sansOnP(p, iso)` gates every path, so he is ordinary before the date.
  `sansNoneWhy` is used by the timed block, the untimed block and the unarmed crew list.
- **D2587's words:** one source (`sansNoneWhy`). No other copy of "no availability filed" in `src` outside notices'
  own bell words ("Tap to file for availability." kept, D2587). The unit tests and the phone-fit browser test follow
  the new words. The old sentence survives only in old walk scripts under `scripts/handpass/` and in archived sheets
  and lessons (history, not live).
- **Every reader of slotBar's answer** reads the same function:
  - the crew list's strike and "N free" (palette-html rank / whyOf / sansAvailHTML);
  - the column's shared reason;
  - the drag hover (drag.ts ~123, with fromKey);
  - the drop note (barDrop, view.ts ~1416);
  - the green rings (highlights.ts paintSelRings).
  No second copy of the SANS gate.
- **Other SANS warning emitters:** SANS_AVAIL is raised only in validate's sansChecks. The Logic line, dropflag and the
  reference parity only read it. Seed INPUTS carry no SANS records, so parity is unaffected.
- **The bell's mismatch line (D2584 Q1) and the SANS info line:** not built, so there is nothing to exclude standby from
  yet. When built, they must use the same standby test.
- **The Leave War's "SANS planned on our programme"** (sync.ts, via dayEngaged): a separate rule, about counting a man
  in the war's day, not about filing. Not touched, not in scope.

## Not read / limits

- I ran nothing. O1 needs the host to run the proof test.
- `state/flyplan.ts` (the war's SANS "committed to fly") was not read in depth.
