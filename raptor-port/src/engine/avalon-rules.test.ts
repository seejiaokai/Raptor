/* THE AVALON RULES OF 7 SEP 26 (owner — "Avalon main will also be checked
   for SC NIGHT qual … u still cannot put a wso in the front seat … they should
   also not be planned as a main and a spare the same timing … or be planned on
   a duty for Avalon and planned as Avalon main or spare … for sc duties desk
   they are also not allowed to be planned as the same time as main or spare").

   overnight.test.ts pins AVALON's ONE check of 11 Aug 26 (availability, the
   ATT B desk carve-out, the midnight tail). This file pins what was added ON
   TOP of it on 7 Sep 26, plus the SC-desk rule, and re-pins the availability
   rule against a TEMPLATE-minted desk (blockFromTpl) — the desk a scheduler
   actually places now, which used to come out plain and fully cross-checked.

   Fixture: the seed Tuesday + makeStandalone('avalon') (rows 0–1 MAIN,
   2–3 SPARE, one NIGHT shift 19:00–07:00) + the seeded AVALON duty template.
   split is a pilot (FCP, IP — SC NIGHT current) free on the seed Tuesday;
   ignite is a pilot (FCP, CAT C — no SC NIGHT); glass is a WSO (RCP, IW);
   torque is ground crew. Every warning read below is anchored to this file's
   own wave or desk, so seed noise cannot leak in. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, scQualOK } from './people'
import { validate } from './validate'
import { makeStandalone } from './waves'
import { avSeatHit, scSeatHit } from './events'
import { blockFromTpl, dutyTplReset } from './dutytpl'
import { slotBar } from './avail'
import { dayOilCredits } from './oil'
import { SCHED } from './publish'

const TUE = 1
const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let av: any, gi = -1, desk: any, dwi = -1

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  dutyTplReset()
  const d: any = DAYS[TUE]
  av = makeStandalone('avalon')
  d.waves.push(av); gi = d.waves.length - 1
  desk = blockFromTpl('avalon')
  d.dutywaves = d.dutywaves || []
  d.dutywaves.push(desk); dwi = d.dutywaves.length - 1
})

const F = () => av.formations[0]
const SEAT = (ai: number, seat: 'p' | 'w') => `${TUE}.${gi}.0.${ai}.${seat}`
const DESK = (ri: number) => `d:${TUE}.${dwi}.${ri}`
const ours = (x: any) => {
  const k = String(x.key || '')
  return k === `${TUE}.${gi}.0` || k.indexOf(`${TUE}.${gi}.0.`) === 0 || k.indexOf(`d:${TUE}.${dwi}.`) === 0
}
const warns = (id: string, code?: string) => validate().all.filter((x: any) =>
  x.di === TUE && (x.who || []).includes(id) && ours(x) && (!code || x.code === code))

describe('AVALON MAIN is checked for SC NIGHT currency', () => {
  it('a pilot without SC NIGHT on a MAIN seat is a hard SC_QUAL, anchored on his seat', () => {
    expect(scQualOK('ignite', 'night')).toBe(false)
    F().aircraft[0].p = 'ignite'
    const h = warns('ignite', 'SC_QUAL')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].sev).toBe('hard')
    expect(h[0].key).toBe(SEAT(0, 'p'))
    expect(h[0].msg).toMatch(/SC NIGHT/)
    expect(h[0].msg).toMatch(/AVALON/)
  })
  it('a pilot WITH SC NIGHT on a MAIN seat raises nothing', () => {
    expect(scQualOK('split', 'night')).toBe(true)
    F().aircraft[0].p = 'split'
    expect(warns('split')).toEqual([])
  })
  it('the same pilot on a SPARE seat is NOT checked — the owner named MAIN only', () => {
    F().aircraft[2].p = 'ignite'
    expect(warns('ignite', 'SC_QUAL')).toEqual([])
  })
  it('a WSO in the MAIN rear seat is checked too — MAIN is the seat, not the pilot', () => {
    const q = PEOPLE.glass.quals
    const was = q.scNight
    q.scNight = false
    try {
      F().aircraft[1].w = 'glass'
      const h = warns('glass', 'SC_QUAL')
      expect(h.length, JSON.stringify(h)).toBe(1)
      expect(h[0].key).toBe(SEAT(1, 'w'))
    } finally { q.scNight = was }
  })
  it('the crew picker refuses the same man with the same words', () => {
    expect(slotBar('ignite', SEAT(0, 'p'))).toMatch(/not SC NIGHT current/)
    expect(slotBar('split', SEAT(0, 'p'))).toBe('')
    expect(slotBar('ignite', SEAT(2, 'p'))).not.toMatch(/SC NIGHT/)
  })
})

describe('the AVALON front seat is pilots-only, MAIN and SPARE alike', () => {
  it('a WSO in a MAIN front seat is a hard QUAL, anchored on the seat, naming AVALON', () => {
    F().aircraft[0].p = 'glass'
    const h = warns('glass', 'QUAL')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].sev).toBe('hard')
    expect(h[0].key).toBe(SEAT(0, 'p'))
    expect(h[0].msg).toMatch(/WSO/)
    expect(h[0].msg).toMatch(/AVALON/)
    expect(h[0].msg).toMatch(/MAIN/)
  })
  it('a WSO in a SPARE front seat is the same red', () => {
    F().aircraft[2].p = 'glass'
    const h = warns('glass', 'QUAL')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].key).toBe(SEAT(2, 'p'))
    expect(h[0].msg).toMatch(/SPARE/)
  })
  it('a WSO in the rear seat is his proper place — nothing', () => {
    F().aircraft[0].w = 'glass'
    expect(warns('glass', 'QUAL')).toEqual([])
  })
  it('ground crew in a front seat is barred too — the picker already refuses it', () => {
    F().aircraft[0].p = 'torque'
    const h = warns('torque', 'QUAL')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].msg).toMatch(/ground crew/)
    expect(slotBar('torque', SEAT(0, 'p'))).toMatch(/ground crew/)
    expect(slotBar('glass', SEAT(0, 'p'))).toMatch(/WSO/)
  })
})

describe('one man in two AVALON places in the same hours', () => {
  it('MAIN + SPARE on the same shift is a hard DOUBLE_BOOK, said once, naming both', () => {
    F().aircraft[0].p = 'split'
    F().aircraft[2].p = 'split'
    const h = warns('split', 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].sev).toBe('hard')
    expect(h[0].msg).toMatch(/AVALON/)
    expect(h[0].msg).toMatch(/MAIN/)
    expect(h[0].msg).toMatch(/SPARE/)
  })
  it('a MAIN seat + the AVALON desk is the same red', () => {
    F().aircraft[0].p = 'split'
    desk.rows[0].id = 'split'                         // SXO 19:00–07:00
    const h = warns('split', 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].msg).toMatch(/SXO duty/)
    expect(h[0].msg).toMatch(/AVALON NIGHT MAIN/)
  })
  it('a SPARE seat + the AVALON desk is the same red', () => {
    F().aircraft[3].w = 'glass'
    desk.rows[1].id = 'glass'                         // OPS O
    const h = warns('glass', 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].msg).toMatch(/SPARE/)
    expect(h[0].msg).toMatch(/OPS O duty/)
  })
  it('two AVALON desk roles in the same hours are one man in two places too', () => {
    desk.rows[0].id = 'split'
    desk.rows[1].id = 'split'
    const h = warns('split', 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBe(1)
  })
  it('a desk retyped to the DAY beside the night shift is two clean commitments — no conflict', () => {
    F().aircraft[0].p = 'split'
    desk.rows[0].id = 'split'
    desk.rows[0].str = '07:00'; desk.rows[0].end = '19:00'
    expect(warns('split', 'DOUBLE_BOOK')).toEqual([])
  })
  it('avSeatHit is half-open, honours selfKey, and walks seats AND the desk — the body the picker shares', () => {
    F().aircraft[0].p = 'split'
    expect(avSeatHit(TUE, 'split', 420, 1140, 'x')).toBeNull()             // 07:00–19:00 abuts, no shared minute
    const hit = avSeatHit(TUE, 'split', 1140, 1860, 'x')
    expect(hit).toBeTruthy()
    expect(hit.role).toBe('MAIN')
    expect(hit.key).toBe(SEAT(0, 'p'))
    expect(avSeatHit(TUE, 'split', 1140, 1860, SEAT(0, 'p'))).toBeNull()   // the seat being planned into
    F().aircraft[0].p = ''
    desk.rows[2].id = 'split'                                              // RUNNER
    const dh = avSeatHit(TUE, 'split', 1140, 1860, 'x')
    expect(dh.role).toBe('DUTY')
    expect(dh.key).toBe(DESK(2))
    expect(avSeatHit(TUE, 'split', 1140, 1860, DESK(2))).toBeNull()
  })
  it('the crew picker bars the second place with the same body', () => {
    F().aircraft[0].p = 'split'
    expect(slotBar('split', SEAT(2, 'p'))).toMatch(/already on AVALON NIGHT MAIN/)
    expect(slotBar('split', DESK(0))).toMatch(/already on AVALON NIGHT MAIN/)
    F().aircraft[0].p = ''
    desk.rows[0].id = 'split'
    expect(slotBar('split', SEAT(0, 'p'))).toMatch(/already on SXO duty/)
    expect(slotBar('split', SEAT(0, 'p'))).toMatch(/19:00–07:00/)
  })
})

describe('the availability check still holds, against the desk a scheduler actually places', () => {
  it('ATT B / ATT C / HL on a jet seat — hard DNIF_FLY, MAIN or SPARE', () => {
    F().aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'ATT B', remarks: '' })
    expect(warns('split', 'DNIF_FLY').length).toBe(1)
    F().aircraft[2].w = 'glass'
    INPUTS.push({ person: 'glass', date: 'Jul 14', allday: true, type: 'HL', remarks: '' })
    expect(warns('glass', 'DNIF_FLY').length).toBe(1)
    F().aircraft[1].p = 'ignite'
    INPUTS.push({ person: 'ignite', date: 'Jul 14', allday: true, type: 'ATT C', remarks: '' })
    expect(warns('ignite', 'DNIF_FLY').length).toBe(1)
  })
  it('the template desk: ATT B mans it with nothing raised; HL / OML / ATT C / OL / OD all flag', () => {
    desk.rows[0].id = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'ATT B', remarks: '' })
    expect(warns('split')).toEqual([])
    ;[['glass', 'HL', 1], ['ignite', 'OML', 2], ['xray', 'ATT C', 3]].forEach(([id, t, ri]: any) => {
      desk.rows[ri].id = id
      INPUTS.push({ person: id, date: 'Jul 14', allday: true, type: t, remarks: '' })
      expect(warns(id, 'DNIF_FLY').length, `${t} on the desk`).toBe(1)
    })
    desk.rows[3].id = 'rocky'
    INPUTS.push({ person: 'rocky', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    expect(warns('rocky', 'LEAVE_FLY').length).toBe(1)
  })
  it('the template desk raises NOTHING else — no clash with his own sortie, no LL, no course', () => {
    /* split flies nothing on the seed Tuesday, so give him a real sortie
       across the desk's morning half: a plain desk would DOUBLE_BOOK it */
    const w0 = DAYS[TUE].waves[0]
    w0.formations[0].aircraft[0].p = 'split'
    w0.formations[0].to = '05:00'; w0.formations[0].ld = '06:30'
    desk.rows[0].id = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'LL', remarks: '' })
    expect(warns('split'), 'nothing anchored to the AVALON desk').toEqual([])
  })
  it('the morning half reads TOMORROW: OD from Wednesday flags a Tuesday-night MAIN', () => {
    F().aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 15', allday: true, type: 'OD', remarks: '' })
    expect(warns('split', 'LEAVE_FLY').length).toBe(1)
  })
})

describe('AVALON earns no OIL — seats and the template desk alike', () => {
  it('a MAIN seat, a SPARE seat and the desk change the day\'s credits not at all', () => {
    /* glass flies on the seed Tuesday and earns her sortie either way — the
       proof is that AVALON ADDS nothing, so compare against the untouched day */
    const before = JSON.stringify(dayOilCredits(DAYS[TUE]))
    F().aircraft[0].p = 'split'
    F().aircraft[2].p = 'ignite'
    desk.rows[0].id = 'glass'
    desk.rows[1].id = 'xray'
    expect(JSON.stringify(dayOilCredits(DAYS[TUE]))).toBe(before)
    expect(dayOilCredits(DAYS[TUE]).split).toBeUndefined()
  })
})

describe('rot guard — an empty AVALON wave and desk add nothing', () => {
  it('no warning anchors to either', () => {
    const all = validate().all.filter((x: any) => x.di === TUE && ours(x))
    expect(all).toEqual([])
  })
})

describe('an SC desk is one of the SC seats for the same-hours rule', () => {
  let sc: any, sgi = -1, sdesk: any, sdwi = -1
  beforeEach(() => {
    const d: any = DAYS[TUE]
    sc = makeStandalone('sc')
    d.waves.push(sc); sgi = d.waves.length - 1
    sdesk = blockFromTpl('sc')                        // SXO AM / OPS O AM / SXO PM / OPS O PM
    d.dutywaves.push(sdesk); sdwi = d.dutywaves.length - 1
  })
  const AM = () => sc.formations[0]
  const scWarns = (id: string, code: string) => validate().all.filter((x: any) =>
    x.di === TUE && (x.who || []).includes(id) && x.code === code
    && (String(x.key || '').indexOf(`${TUE}.${sgi}.`) === 0 || String(x.key || '').indexOf(`d:${TUE}.${sdwi}.`) === 0))

  it('SC SPARE AM + SXO AM desk is a hard DOUBLE_BOOK in the spare-rule voice', () => {
    AM().aircraft[2].p = 'split'
    sdesk.rows[0].id = 'split'
    const h = scWarns('split', 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBe(1)
    expect(h[0].msg).toMatch(/standing SC SPARE/)
    expect(h[0].msg).toMatch(/SXO AM duty/)
  })
  it('SC SPARE AM + SXO PM desk touch only at 13:00 — no conflict', () => {
    AM().aircraft[2].p = 'split'
    sdesk.rows[2].id = 'split'
    expect(scWarns('split', 'DOUBLE_BOOK')).toEqual([])
  })
  it('SC MAIN AM + SXO AM desk is the ordinary red — a main shift is an event', () => {
    AM().aircraft[0].p = 'split'
    sdesk.rows[0].id = 'split'
    expect(scWarns('split', 'DOUBLE_BOOK').length).toBeGreaterThan(0)
  })
  it('a spare against an ORDINARY desk in the same hours still raises nothing — spares stay free', () => {
    const std = blockFromTpl('std'); std.rows[0].str = '07:00'; std.rows[0].end = '13:00'; std.rows[0].id = 'split'
    DAYS[TUE].dutywaves.push(std)
    AM().aircraft[2].p = 'split'
    expect(validate().all.filter((x: any) => x.di === TUE && x.code === 'DOUBLE_BOOK' && (x.who || []).includes('split'))).toEqual([])
  })
  it('scSeatHit reports the desk with a spoken form, and the picker refuses both ways', () => {
    sdesk.rows[0].id = 'split'
    const hit = scSeatHit(TUE, 'split', 420, 780, 'x')
    expect(hit.role).toBe('DUTY')
    expect(hit.what).toBe('SXO AM duty')
    expect(hit.key).toBe(`d:${TUE}.${sdwi}.0`)
    expect(slotBar('split', `${TUE}.${sgi}.0.2.p`)).toMatch(/already on SXO AM duty/)
    sdesk.rows[0].id = ''
    AM().aircraft[2].p = 'split'
    expect(slotBar('split', `d:${TUE}.${sdwi}.0`)).toMatch(/already on .*SPARE/)
    expect(slotBar('split', `d:${TUE}.${sdwi}.2`)).toBe('')      // the PM desk abuts, still offered
  })
})
