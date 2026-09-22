/* [OIL-SEATS-CAN-EARN] STEP 8, AS THE OWNER RULED IT — a flying line whose
   times cannot be right SAYS SO, and still pays the man.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 8
   (finding C2) — **overruled in part, see D49**.

   WHAT THE PLAN ASKED FOR, AND WHY IT IS NOT BUILT. Both reviewers found that a
   flight typed with the SAME take-off and landing minute still pays half a day:
   the rules add three hours of report before take-off and two of debrief after
   landing, so a sortie of no minutes comes out as a five-hour day. They read
   that as the app paying off its own padding, and the plan's step 8 was to
   refuse it.

   **D49 (owner, 22 Sep 26): "It should still earn — leave it as it is."** The
   man reported and debriefed; he was at work whatever the times say. That is the
   squadron's own fact and the code could not supply it — the third time his
   knowledge of how the squadron runs has corrected a reading of the code, after
   D36 (the availability window) and D44 (membership frozen on every day). So
   nothing about what such a line earns changes, and this file PINS that, because
   without a test naming the ruling the next reviewer finds the same "defect" and
   fixes it.

   WHAT IS KEPT: the day has to SAY the times look wrong, so somebody corrects
   them. Two different sentences, because they are two different facts:

   · TAKE-OFF AND LANDING THE SAME — it pays, but the sortie length cannot be
     read and one of the two times is almost certainly a slip. An ADVISORY on
     the line, on any day, because a nought-minute sortie is wrong on a Tuesday
     too.
   · NO READABLE TIMES AT ALL — it pays nothing, and used to say nothing. That
     is the exact trap the owner raised on 20 Sep 26 about a duty desk ("I would
     also like u to give the warning On the day itself"); a flying line was never
     added to that list. Weekend and holiday only, like the rest of it, because
     those are the only days that earn.

   AN OVERNIGHT LINE IS NOT A MISTAKE (D42) and must stay silent. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { dayOilWork, dayOilCredits, dayOilBlind, blindDesks, oilCapableItems, rowItemKey } from './oil'
import { validate } from './validate'
import { makeStandalone } from './waves'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, MON = 0
const earningDay = HOOKS.oilEarningDay

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  HOOKS.oilEarningDay = earningDay
})

/* ONE flying line on an otherwise stripped day, so "he earns nothing" can only
   mean this line — the seed Saturday carries flying, duty and sim work */
const onlyLine = (di: number, to: string, ld: string, crew = 'bane') => {
  Object.assign(DAYS[di] as any, {
    waves: [{ label: 'WAVE 1', formations: [{ cs: 'RAP 1', msn: 'X', to, ld, aircraft: [{ p: crew, w: '' }] }] }],
    dutywaves: [], sims: {}, ground: [], allhands: [],
  })
  ensureRowIds(DAYS)
  return (DAYS[di] as any).waves[0].formations[0]
}
const credits = (di: number) => dayOilCredits(DAYS[di], { expandAll: () => [] })
const advOn = (di: number, code: string) => (validate().byDay[di]?.warns ?? []).filter((w: any) => w.code === code)

describe('D49 — a nought-minute sortie STILL earns, and this pin is the ruling', () => {
  it('take-off and landing at the same minute pays the man his half day', () => {
    onlyLine(SAT, '09:00', '09:00')
    expect(credits(SAT).bane, 'he reported at 0600 and debriefed until 1100 — he was at work').toBe(0.5)
  })

  it('the line still offers its earn switch — it is not an event that cannot earn', () => {
    const f = onlyLine(SAT, '09:00', '09:00')
    expect(oilCapableItems(DAYS[SAT]).has(rowItemKey(f.rid))).toBe(true)
  })

  it('THE CONTROL: an ordinary line and an overnight line are untouched', () => {
    onlyLine(SAT, '09:00', '11:00')
    expect(credits(SAT).bane, 'report to debrief around a two-hour sortie').toBe(1)
    onlyLine(SAT, '23:00', '01:00')
    expect(credits(SAT).bane, 'D42 — it earns the day it sits on').toBe(1)
  })
})

describe('but the day SAYS the times cannot be right, so somebody fixes them', () => {
  it('a line taking off and landing at the same minute is flagged, on the line', () => {
    const f = onlyLine(SAT, '09:00', '09:00')
    const w = advOn(SAT, 'FLT_NO_LEN')
    expect(w, 'exactly one, on the line').toHaveLength(1)
    expect(w[0].msg).toContain('RAP 1')
    expect(w[0].msg).toContain('09:00')
    expect(w[0].sev, 'a warning, not a refusal — it still earns').toBe('adv')
    expect(String(w[0].key || ''), 'and tapping it lands on the landing time').toContain('.ld')
    expect(f.rid, 'the line is a real, addressable row').toBeTruthy()
  })

  it('it speaks on a WEEKDAY too — a nought-minute sortie is wrong on a Tuesday', () => {
    onlyLine(MON, '09:00', '09:00')
    expect(advOn(MON, 'FLT_NO_LEN')).toHaveLength(1)
  })

  it('AN EMPTY line is not a mistake — nobody is owed anything for it', () => {
    onlyLine(SAT, '09:00', '09:00', '')
    expect(advOn(SAT, 'FLT_NO_LEN')).toHaveLength(0)
  })

  it('THE CONTROLS: an ordinary line, an overnight line and a blank line stay quiet', () => {
    onlyLine(SAT, '09:00', '11:00')
    expect(advOn(SAT, 'FLT_NO_LEN'), 'an ordinary sortie').toHaveLength(0)
    onlyLine(SAT, '23:00', '01:00')
    expect(advOn(SAT, 'FLT_NO_LEN'), 'D42 — an overnight line is legitimate').toHaveLength(0)
    onlyLine(SAT, '', '')
    expect(advOn(SAT, 'FLT_NO_LEN'), 'a line with no times has a different problem').toHaveLength(0)
  })

  it('THE WHOLE SEED WEEK IS SILENT — nothing the squadron already has is flagged', () => {
    /* the control that matters for a NEW warning: it must not light up the
       demo week the moment it ships */
    const W = validate()
    const hits = W.all.filter((w: any) => w.code === 'FLT_NO_LEN')
    expect(hits, 'every seeded line has a real take-off and landing').toHaveLength(0)
  })

  it('a CANCELLED line says nothing — it is not work at all', () => {
    const f = onlyLine(SAT, '09:00', '09:00')
    f.cx = true
    expect(advOn(SAT, 'FLT_NO_LEN')).toHaveLength(0)
  })
})

describe('a flying line with NO readable times earns nothing, and no longer in silence', () => {
  it('it is named beside the desks, in the same list', () => {
    onlyLine(SAT, '', '')
    expect(credits(SAT).bane, 'money never comes from a guess').toBeUndefined()
    /* the list NAMES the line; the exact wrapper wording is G1's, pinned in
       its own block below rather than here */
    expect(dayOilBlind(DAYS[SAT]).join(' '), 'and now it says so').toContain('RAP 1')
  })

  it('and it reaches the day\'s own warning strip', () => {
    onlyLine(SAT, '', '')
    const w = advOn(SAT, 'OIL_NO_TIMES')
    expect(w).toHaveLength(1)
    expect(w[0].msg).toContain('RAP 1')
    expect(w[0].msg).toContain('nobody on it earns OIL for this day')
  })

  it('a line with a take-off and no landing is the same answer', () => {
    onlyLine(SAT, '09:00', '')
    expect(dayOilBlind(DAYS[SAT]).join(' ')).toContain('RAP 1')
  })

  it('THE CONTROLS: an empty line, a cancelled line and a properly timed one are all silent', () => {
    onlyLine(SAT, '', '', '')
    expect(dayOilBlind(DAYS[SAT]), 'an empty line is an empty line').toEqual([])
    const f = onlyLine(SAT, '', '')
    f.cx = true
    expect(dayOilBlind(DAYS[SAT]), 'a cancelled line is not work').toEqual([])
    onlyLine(SAT, '09:00', '11:00')
    expect(dayOilBlind(DAYS[SAT]), 'and a proper line has nothing to say').toEqual([])
  })

  it('a line with no callsign is named by its wave', () => {
    const f = onlyLine(SAT, '', '')
    f.cs = ''
    expect(dayOilBlind(DAYS[SAT]).join(' ')).toContain('WAVE 1')
  })
})

/* A NOUGHT-MINUTE SHIFT IS NOT A NOUGHT-MINUTE SORTIE — the independent code
   read, 22 Sep 26 (F1), reproduced here before it was acted on.

   D49 was ruled about an ordinary flying LINE: the man reported three hours
   before and debriefed for two after, so the half day is real work whatever the
   written times say. A STANDALONE wave — SC MAIN, SC SPARE, AVALON, BB — has no
   such padding: its window IS the written window. Typed 08:00–08:00 it measures
   nothing, offers no switch and pays nobody, which is D31 working exactly as
   ruled.

   What was wrong was the SCREEN. The same advisory fired on it, on the line and
   in the list, saying "the day still earns from the report and debrief" — which
   is true of a sortie and false of a shift — while the day's "nobody earns OIL"
   list did not name it. So on the wave the squadron actually works at weekends,
   a man's day silently earned nothing and the screen said the opposite. That is
   the one class of defect the owner asked for a warning about on 20 Sep 26. */
describe('a nought-minute SHIFT says the opposite of a nought-minute sortie', () => {
  /* EVERY STANDALONE KIND, not the one the finding happened to name. SC MAIN is
     the wave the squadron works most weekends, but SC SPARE, AVALON and BB have
     the same shape and the same absence of padding — and a test that walks one
     kind tests one kind (the standing order's §8.1). `spare` marks the aircraft,
     which is how the app tells a SPARE row from a MAIN one. */
  const saLine = (di: number, kind: string, to: string, ld: string,
                  { crew = 'bane', spare = false } = {}) => {
    /* MINTED THE WAY THE APP MINTS ONE (`makeStandalone`), never hand-built. A
       hand-built standalone wave is missing the flags the mint sets, and the
       money engine reads those — the first version of this fixture had an
       AVALON line paying by default, which is not what the app does and would
       have been a false finding about D24. The order's own rule: fixtures write
       the way the app writes. */
    const w = makeStandalone(kind)!
    const f = w.formations[0]
    f.to = to; f.ld = ld
    const a = spare ? (f.aircraft.find((x: any) => x.spare) || f.aircraft[0]) : f.aircraft[0]
    a.p = crew
    Object.assign(DAYS[di] as any, { waves: [w], dutywaves: [], sims: {}, ground: [], allhands: [] })
    ensureRowIds(DAYS)
    return f
  }
  const scLine = (di: number, to: string, ld: string, crew = 'bane') => saLine(di, 'sc', to, ld, { crew })
  const blindNames = (di: number) => dayOilBlind(DAYS[di]).map((b: any) => b.name || b.label || b.cs || String(b))

  it('THE FACT, unchanged: it measures nothing, offers no switch and pays nobody', () => {
    const f = scLine(SAT, '08:00', '08:00')
    expect(credits(SAT).bane, 'a shift has no report and no debrief to pad it').toBeUndefined()
    expect(oilCapableItems(DAYS[SAT]).has(rowItemKey(f.rid)), 'nothing to measure, so no switch — D31').toBe(false)
  })

  it('so the day must NAME it in the "nobody earns" list, beside the blank desks', () => {
    scLine(SAT, '08:00', '08:00')
    expect(blindNames(SAT).join(' '), 'the man is at work and his day earns nothing — say so').toContain('SC')
  })

  it('and the advisory must not promise the report and debrief it has not got', () => {
    scLine(SAT, '08:00', '08:00')
    const w = advOn(SAT, 'FLT_NO_LEN')
    expect(w, 'the times are still plainly wrong, so it is still flagged').toHaveLength(1)
    expect(w[0].msg, 'a shift earns nothing from padding it does not have')
      .not.toContain('still earns from the report and debrief')
    expect(w[0].msg, 'it says what is true of a shift instead').toMatch(/earns nobody/i)
  })

  it('THE CONTROL: an ordinary line with the same times keeps D49 whole', () => {
    onlyLine(SAT, '08:00', '08:00')
    expect(credits(SAT).bane, 'he reported and debriefed — the ruling').toBe(0.5)
    expect(blindNames(SAT).join(' '), 'and it is NOT in the nobody-earns list').not.toContain('RAP 1')
    expect(advOn(SAT, 'FLT_NO_LEN')[0].msg, 'and keeps the sortie sentence')
      .toContain('still earns from the report and debrief')
  })

  it('THE CONTROL: a shift with real times pays and is named nowhere', () => {
    scLine(SAT, '08:00', '14:00')
    expect(credits(SAT).bane, 'six hours is a half day').toBe(0.5)
    expect(advOn(SAT, 'FLT_NO_LEN'), 'nothing wrong with its times').toHaveLength(0)
    expect(blindNames(SAT).join(' ')).not.toContain('SC')
  })

  /* THE MATRIX — every standalone kind, and a SPARE as well as a MAIN. The
     finding named SC MAIN because that is the wave the squadron works; nothing
     about the fault is particular to it. */
  for (const [kind, what] of [['sc', 'SC MAIN'], ['avalon', 'AVALON'], ['bb', 'BB']] as const) {
    it(`${what}, typed to the same minute: pays nobody, says so, and is named`, () => {
      const f = saLine(SAT, kind, '08:00', '08:00')
      expect(credits(SAT).bane, 'no padding to pay from').toBeUndefined()
      expect(oilCapableItems(DAYS[SAT]).has(rowItemKey(f.rid)), 'nothing to measure, so no switch').toBe(false)
      /* by the name the app gives it — an AVALON line's callsign is 'AV', not
         'AVALON', and a list that named the wrong thing would help nobody */
      expect(blindNames(SAT).join(' '), "named in the day's nobody-earns list")
        .toContain(String(f.cs || what))
      expect(advOn(SAT, 'FLT_NO_LEN')[0].msg, 'and the sentence is the shift one').toMatch(/earns nobody/i)
    })
  }

  it('an SC SPARE is no different — it has the same absence of padding', () => {
    const f = saLine(SAT, 'sc', '08:00', '08:00', { spare: true })
    expect(credits(SAT).bane).toBeUndefined()
    expect(oilCapableItems(DAYS[SAT]).has(rowItemKey(f.rid))).toBe(false)
    expect(advOn(SAT, 'FLT_NO_LEN')[0].msg).toMatch(/earns nobody/i)
  })

  it('THE CONTROL: AVALON and BB with real times keep D24 — switchable, and off by default', () => {
    for (const kind of ['avalon', 'bb']) {
      const f = saLine(SAT, kind, '08:00', '14:00')
      expect(oilCapableItems(DAYS[SAT]).has(rowItemKey(f.rid)),
        `${kind} can be measured, so D24 says it offers the switch`).toBe(true)
      /* the DEFAULT is the span's own flag, not what the day would credit with
         every switch on — `dayOilCredits` measures, `dflt` is what it earns
         unless somebody says otherwise. Asserting the wrong one of those two
         read as an AVALON line paying by default, which it does not. */
      const span = dayOilWork(DAYS[SAT], { expandAll: () => [] }).bane
      expect(span && span[0].dflt, `${kind} reaches the walk and earns nothing until somebody says so`).toBe(false)
      expect(advOn(SAT, 'FLT_NO_LEN'), 'nothing wrong with its times').toHaveLength(0)
    }
  })
})

/* WHAT THE DAY CALLS THE ROW IT IS NAMING — the follow-up code read, G1.
   `blindDesks` wraps a bare name as "the X desk has…", which is right for a
   duty desk's role name and wrong for everything else. The ground programme and
   the two sims already dodge it by naming themselves "the ground programme",
   "the AMT sim" — the `^the ` convention IS the wrapper's own test. The flying
   branch added a BARE name, so a flying line with no times became "the RAP 1
   desk" in the publish message, and the nought-minute shift this session added
   became "the SC desk".
   And the sentence itself was false for the new case: a shift typed 08:00–08:00
   HAS times. "No usable times" is true of both a blank pair and an equal one. */
describe('the day names a flying row as a flying row, and says what is actually wrong', () => {
  const saLine = (kind: string, to: string, ld: string) => {
    const w = makeStandalone(kind)!
    w.formations[0].to = to; w.formations[0].ld = ld
    w.formations[0].aircraft[0].p = 'bane'
    Object.assign(DAYS[SAT] as any, { waves: [w], dutywaves: [], sims: {}, ground: [], allhands: [] })
    ensureRowIds(DAYS)
  }
  const msg = (code: string) => (advOn(SAT, code)[0] || {}).msg || ''

  it('a SHIFT is called a shift, never a desk', () => {
    saLine('sc', '08:00', '08:00')
    expect(dayOilBlind(DAYS[SAT]).join(' '), 'it is a shift, and the wrapper must not call it a desk')
      .toMatch(/^the .*shift/i)
    expect(blindDesks(dayOilBlind(DAYS[SAT])).desk, 'so "the … desk has" is never reached').toBe(false)
  })

  it('an ordinary LINE is called a line, never a desk', () => {
    onlyLine(SAT, '', '')
    expect(dayOilBlind(DAYS[SAT]).join(' ')).toMatch(/^the .*line/i)
    expect(blindDesks(dayOilBlind(DAYS[SAT])).desk).toBe(false)
  })

  it('a shift with two typed times is not told it has NO times', () => {
    saLine('sc', '08:00', '08:00')
    const m = msg('OIL_NO_TIMES')
    expect(m, 'it is named').toMatch(/SC/)
    expect(m, 'but it has two times typed on it — that sentence would be false').not.toMatch(/has no times|have no times/)
    expect(m, 'what is true of both a blank pair and an equal one').toMatch(/no usable times/i)
  })

  it('THE CONTROL: a duty desk is still called a desk, and still reads as it did', () => {
    Object.assign(DAYS[SAT] as any, {
      waves: [], sims: {}, ground: [], allhands: [],
      dutywaves: [{ label: 'DUTIES', rows: [{ role: 'SDO', str: '', end: '', id: 'bane' }] }],
    })
    ensureRowIds(DAYS)
    expect(dayOilBlind(DAYS[SAT])).toEqual(['SDO'])
    expect(blindDesks(['SDO']).desk, 'the wrapper still fits a bare role name').toBe(true)
  })
})
