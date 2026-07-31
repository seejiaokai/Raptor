/* Ported from reference/tfin.js — group F (validation engine), the B53 #8
   offer exemption, the T-group SC-currency flow and the X-group shift
   behaviour. Source-text pins are re-expressed against the live objects. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, isSpecial, scQualOK } from './people'
import { VCONF, SHIFT_HARD } from './rules'
import { validate, WARN, WCODE, CHIP_LABEL, CHIP_TEXT, chipText, SEVWORD, REST, restClear } from './validate'
import { collectEvents } from './events'
import { makeStandalone } from './waves'
import { setSlotVal, txtSet } from './slots'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

describe('validation engine (tfin F)', () => {
  it('validate returns WARN shape', () => {
    const W = validate()
    expect(W && Array.isArray(W.all) && Array.isArray(W.byDay) && !!W.sev && !!W.chip).toBe(true)
    expect(WARN).toBe(W)
  })

  it('byDay covers every day', () => {
    expect(validate().byDay.length).toBe(DAYS.length)
  })

  const SEV = ['hard', 'adv', 'note']
  const CODES = ['DOUBLE_BOOK', 'DNIF_FLY', 'LEAVE_FLY', 'INPUT_FLY', 'TURN', 'ILLEGAL_CREW', 'OCU_NO_IP', 'CREW_REST', 'QUAL',
    'NO_BRIEF', 'DEBRIEF', 'SIM_BRIEF', 'SIM_DEBRIEF', 'CREW_TIGHT', 'LONGDAY', 'DT_SUM']

  it('every warning has a known tier', () => {
    const W = validate()
    expect(W.all.every((x: any) => SEV.includes(x.sev)), [...new Set(W.all.map((x: any) => x.sev))].join(',')).toBe(true)
  })

  it('every warning has a known code', () => {
    const W = validate()
    const bad = [...new Set(W.all.map((x: any) => x.code))].filter(c => !CODES.includes(c as string) && c !== 'SC_QUAL' && c !== 'AAR_QUAL' && c !== 'SHIFT_SOFT')
    expect(bad, bad.join(',')).toEqual([])
  })

  it('WCODE covers all 16 codes', () => {
    expect(CODES.filter(c => !WCODE[c]), CODES.filter(c => !WCODE[c]).join(',')).toEqual([])
    expect(Object.keys(WCODE)).toContain('SC_QUAL')
    expect(Object.keys(WCODE)).toContain('AAR_QUAL')
    expect(Object.keys(WCODE)).toContain('SHIFT_SOFT')
  })

  it('CHIP_LABEL covers all 10 chips', () => {
    const chips = ['DT', 'TT', 'C', 'CR', 'Q', 'NB', 'DB', 'SB', 'SD', 'LD']
    expect(chips.filter(c => !CHIP_LABEL[c])).toEqual([])
  })

  it('chip glyphs print short (CHIP_TEXT)', () => {
    expect(chipText('CR')).toBe('R')
    expect(chipText('NB')).toBe('B'); expect(chipText('SB')).toBe('B')
    expect(chipText('DB')).toBe('D'); expect(chipText('SD')).toBe('D')
    expect(chipText('LD')).toBe('L')
    expect(CHIP_TEXT.DT).toBe('DT')
  })

  it('runtime tiers agree with the source', () => {
    const WANT: any = { TURN: 'adv', DOUBLE_BOOK: 'hard', NO_BRIEF: 'hard', DEBRIEF: 'adv', SIM_BRIEF: 'hard', SIM_DEBRIEF: 'adv',
      DT_SUM: 'hard', LONGDAY: 'note', CREW_REST: 'hard', CREW_TIGHT: 'adv', ILLEGAL_CREW: 'hard', QUAL: 'hard', OCU_NO_IP: 'adv' }
    const bad = validate().all.filter((x: any) => WANT[x.code] && WANT[x.code] !== x.sev)
    expect(bad, bad.map((x: any) => x.code + '=' + x.sev).join(',')).toEqual([])
  })

  it('SEVWORD is Warning/Advisory/Note', () => {
    expect(SEVWORD).toEqual({ hard: 'Warning', adv: 'Advisory', note: 'Note' })
  })

  it('VCONF thresholds unchanged', () => {
    const VC: any = { briefLead: 140, dur: 85, step: 60, dekit: 30, minTurn: 20, tightTurn: 120, crewRest: 720, debrief: 120,
      reportLead: 180, longDay: 720, epBrief: 15, simDebrief: 30, amtDebrief: 30 }
    const vbad = Object.keys(VC).filter(k => VCONF[k] !== VC[k])
    expect(vbad, vbad.join(',')).toEqual([])
  })

  it('a cockpit or a duty post beats a shift; ground and programme only advise (SHIFT_HARD)', () => {
    expect(SHIFT_HARD).toEqual({ fly: true, sim: true, duty: true, shift: true, ground: false, prog: false })
  })

  it('day warnings sorted hard → adv → note', () => {
    const W = validate()
    expect(W.byDay.every((g: any) => {
      if (!g || !g.warns) return true; const o: any = { hard: 0, adv: 1, note: 2 }
      return g.warns.every((x: any, i: number) => i === 0 || o[g.warns[i - 1].sev] <= o[x.sev])
    })).toBe(true)
  })

  it('sev index keyed by day then person', () => {
    const W = validate()
    expect(Object.keys(W.sev).every(k => /^\d+$/.test(k) && typeof W.sev[k] === 'object')).toBe(true)
  })

  it('ALL AVAIL sentinels never raise warnings', () => {
    const W = validate()
    const bad = W.all.filter((x: any) => (x.who || []).some((id: any) => isSpecial(id)))
    expect(bad, bad.map((x: any) => x.code).join(',')).toEqual([])
  })

  it('at least one warning of each tier in the seed', () => {
    const W = validate()
    expect(SEV.filter(s => !W.all.some((x: any) => x.sev === s))).toEqual([])
  })

  it('collectEvents skips cancelled lines', () => {
    const f = DAYS[0].waves[0].formations[0]
    const before = collectEvents()[0].fly.filter((e: any) => e.id === f.aircraft[0].p).length
    f.aircraft[0].cx = true
    const midway = collectEvents()[0].fly.filter((e: any) => e.id === f.aircraft[0].p).length
    f.cx = true
    const after = collectEvents()[0].fly.length
    expect(before).toBeGreaterThan(0)
    expect(midway).toBeLessThan(before)
    expect(after).toBeLessThan(collectEvents()[1].fly.length + before)
  })

  it('validate publishes when rest expires, per day per person (REST)', () => {
    validate()
    expect(REST[0]).toEqual({})              // Monday has no previous day
    expect(typeof REST[1]).toBe('object')
    expect(restClear(0, 'nobody')).toBe(null)
  })
})

describe('an offer is not a commitment (tfin B53 #8)', () => {
  it('an offer adds nothing where a meeting would', () => {
    const d = DAYS[0], ce = collectEvents()[0]
    const id = ((ce.fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    expect(id).toBeTruthy()
    const n = (t: string) => {
      INPUTS.push({ person: id, date: d.dt, allday: false, s: 300, e: 1380, type: t, remarks: '', mod: '' })
      const c = validate().all.filter((x: any) => (x.who || []).indexOf(id) >= 0
        && (x.code === 'NO_BRIEF' || x.code === 'DEBRIEF')).length
      INPUTS.pop(); return c
    }
    const base = validate().all.filter((x: any) => (x.who || []).indexOf(id) >= 0
      && (x.code === 'NO_BRIEF' || x.code === 'DEBRIEF')).length
    const offer = n('Available fly'), real = n('Meeting')
    validate()
    expect(offer).toBe(base)
    expect(real).toBeGreaterThan(base)
  })
})

describe('SC currency, staffed live (tfin T)', () => {
  const hits = () => validate().all.filter((x: any) => x.code === 'SC_QUAL')
  const ids = Object.keys(PEOPLE).filter(id => !PEOPLE[id].special)
  const dayOnly = ids.find(id => scQualOK(id, 'day') && !scQualOK(id, 'night'))
  const both = ids.find(id => scQualOK(id, 'day') && scQualOK(id, 'night'))

  it('the roster holds a day-only and a both-current body', () => {
    expect(!!dayOnly && !!both, 'dayOnly=' + dayOnly + ' both=' + both).toBe(true)
  })

  it('an empty SC raises nothing, and staffing follows the shift window', () => {
    DAYS[0].waves.push(makeStandalone('sc'))
    const gi = DAYS[0].waves.length - 1
    expect(hits(), hits().map((x: any) => x.msg).join(' | ')).toEqual([])
    const k = `0.${gi}.0.0.p`
    setSlotVal(k, both!)
    expect(hits()).toEqual([])                       // a both-current body is fine on the day shift
    setSlotVal(k, dayOnly!)
    expect(hits()).toEqual([])                       // a day-current body is fine on the day shift
    /* move the crew change past 19:00 — the same body is now on a night shift */
    txtSet(`ff:0.${gi}.0.ld`, '21:00')
    const h = hits()
    expect(h.length === 0 || h.every((x: any) => /SC NIGHT/.test(x.msg)),
      h.map((x: any) => x.msg).join(' | ')).toBe(true)
    expect(h.length).toBeGreaterThan(0)              // dayOnly is, by construction, not night-current
  })

  it('the AM and PM shifts abut and do not overlap (tfin X)', () => {
    DAYS[0].waves.push(makeStandalone('sc'))
    const forms = collectEvents()[0].forms.filter((f: any) => f.sc)
    const am = forms[forms.length - 2], pm = forms[forms.length - 1]
    expect(!!am && am.s === 7 * 60 && am.e === 13 * 60, am ? am.s + '-' + am.e : 'none').toBe(true)
    expect(!!pm && pm.s === 13 * 60 && pm.e === 19 * 60, pm ? pm.s + '-' + pm.e : 'none').toBe(true)
    expect(!(am.s < pm.e && pm.s < am.e)).toBe(true)
  })
})

describe('a downchit or OL closes an SC SPARE (tfin B53 #10)', () => {
  it('LL/OIL still leaves the spare slot open; a downchit closes it', () => {
    /* day 1 is Jul 14: nasty is on LL, shrek on OIL; sufa is downchit 13–17 */
    DAYS[1].waves.push(makeStandalone('sc'))
    const gi = DAYS[1].waves.length - 1
    const spare = DAYS[1].waves[gi].formations[0].aircraft[2]  // first SPARE line
    expect(spare.spare).toBe(true)
    spare.p = 'nasty'                                          // LL — may still stand SC SPARE
    let bad = validate().all.filter((x: any) => (x.who || []).includes('nasty')
      && (x.code === 'LEAVE_FLY' || x.code === 'DNIF_FLY'))
    expect(bad, bad.map((x: any) => x.msg).join(' | ')).toEqual([])
    spare.p = 'sufa'                                           // downchit — cannot
    bad = validate().all.filter((x: any) => (x.who || []).includes('sufa')
      && x.code === 'DNIF_FLY' && /SPARE/.test(x.msg))
    expect(bad.length).toBeGreaterThan(0)
  })
})
