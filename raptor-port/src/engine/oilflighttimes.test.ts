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
import { dayOilWork, dayOilCredits, dayOilBlind, oilCapableItems, rowItemKey } from './oil'
import { validate } from './validate'

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
    expect(dayOilBlind(DAYS[SAT]), 'and now it says so').toContain('RAP 1')
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
    expect(dayOilBlind(DAYS[SAT])).toContain('RAP 1')
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
    expect(dayOilBlind(DAYS[SAT])).toContain('WAVE 1')
  })
})
