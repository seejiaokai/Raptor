/* THE TWO SC SPARE RULES OF 31 AUG 26 (owner — "give a warning conflict if u
   are planned for MAIN and SPARE in the same time framing the coincides. If
   for e.g am is 0700-1300 and PM is 1300-1900. The 1300 is not a conflict.
   Same thing for SC SPARE, a wso can't be planned for FCP"). Clarified the
   same session: SPARE+SPARE in the same hours is the SAME red warning, and
   the seat rule is WSO-in-front-seat ONLY — the pilot-in-rear-seat mirror was
   offered and DECLINED, which the last test pins as an absence.

   scrole-rules.test.ts pins what the spare exemption switches OFF; this file
   pins the two checks added ON TOP of it. Same fixture idiom: the seed
   Tuesday plus makeStandalone('sc') — rows 0–1 MAIN, 2–3 SPARE. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, isInstrPilot } from './people'
import { validate } from './validate'
import { makeStandalone } from './waves'
import { scSeatHit } from './events'

const TUE = 1
const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let sc: any, gi = -1

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  sc = makeStandalone('sc')
  ;(DAYS[TUE] as any).waves.push(sc)
  gi = (DAYS[TUE] as any).waves.length - 1
})

const AM = () => sc.formations[0]
const PM = () => sc.formations[1]
const warns = (id: string, code?: string) => validate().all.filter((x: any) =>
  x.di === TUE && (x.who || []).includes(id) && (!code || x.code === code))

/* split is a PILOT (FCP, IP) — free on the seed Tuesday, so every flag below
   is this file's own doing; glass is a WSO (RCP, IW) for the seat rule */

describe('two SC seats in the same hours are one man in two places', () => {
  it('MAIN AM + SPARE AM is a hard conflict, said once, anchored on the spare seat', () => {
    AM().aircraft[0].p = 'split'                 // MAIN
    AM().aircraft[2].p = 'split'                 // SPARE, same 07:00–13:00
    const hits = warns('split', 'DOUBLE_BOOK')
    expect(hits.length, 'one clash prints once').toBe(1)
    expect(hits[0].sev).toBe('hard')
    expect(hits[0].msg).toContain('standing SC SPARE')
    expect(hits[0].msg).toContain('MAIN')
    /* anchored on the SPARE seat so the exempt-line ring (html.ts) finds it */
    expect(hits[0].key).toBe(`${TUE}.${gi}.0.2.p`)
  })

  it("MAIN AM + SPARE PM touch only at 13:00 — the owner's own example, no conflict", () => {
    AM().aircraft[0].p = 'split'                 // 07:00–13:00
    PM().aircraft[2].p = 'split'                 // 13:00–19:00
    expect(warns('split', 'DOUBLE_BOOK')).toEqual([])
  })

  it('SPARE + SPARE across two waves in the same hours is the same red, once', () => {
    const sc2: any = makeStandalone('sc')
    ;(DAYS[TUE] as any).waves.push(sc2)
    AM().aircraft[2].p = 'split'
    sc2.formations[0].aircraft[2].p = 'split'    // both AM 07:00–13:00
    const hits = warns('split', 'DOUBLE_BOOK')
    expect(hits.length, 'seen from both formations, printed once').toBe(1)
    expect(hits[0].sev).toBe('hard')
    expect(hits[0].msg).toContain('SPARE')
  })

  it('the same man on two spare rows of ONE shift is caught too', () => {
    AM().aircraft[2].p = 'split'
    AM().aircraft[3].p = 'split'
    expect(warns('split', 'DOUBLE_BOOK').length).toBe(1)
  })

  it('a spare against his own SORTIE still raises nothing — spares stay free for real flying', () => {
    AM().aircraft[2].w = 'glass'                 // glass flies VL BFM inside SC AM
    expect(warns('glass', 'DOUBLE_BOOK')).toEqual([])
  })

  it('scSeatHit is half-open and honours selfKey — the body the picker shares', () => {
    AM().aircraft[0].p = 'split'
    /* asked from the PM window (780–1140), the AM seat (420–780) is no hit */
    expect(scSeatHit(TUE, 'split', 780, 1140, 'x')).toBeNull()
    /* asked from an overlapping window it is — unless it IS the seat asked about */
    expect(scSeatHit(TUE, 'split', 600, 900, 'x')).toBeTruthy()
    expect(scSeatHit(TUE, 'split', 600, 900, `${TUE}.${gi}.0.0.p`)).toBeNull()
  })
})

describe('the spare front seat is pilots-only', () => {
  it('a WSO in a spare front seat is a hard QUAL, anchored on his seat', () => {
    AM().aircraft[2].p = 'glass'
    const hits = warns('glass', 'QUAL')
    expect(hits.length).toBe(1)
    expect(hits[0].sev).toBe('hard')
    expect(hits[0].msg).toContain('is a WSO — cannot fly FCP')
    expect(hits[0].msg).toContain('SPARE')
    expect(hits[0].key).toBe(`${TUE}.${gi}.0.2.p`)
  })

  it('a WSO in a spare REAR seat is his proper place — no QUAL', () => {
    AM().aircraft[2].w = 'glass'
    expect(warns('glass', 'QUAL')).toEqual([])
  })

  it('ground crew in a spare FRONT seat is barred too — the picker already refuses it, so the validator must agree', () => {
    const gnd = Object.keys(PEOPLE).find(id => PEOPLE[id].pers)!
    expect(gnd, 'the roster carries a ground-crew body').toBeTruthy()
    AM().aircraft[2].p = gnd
    const hits = warns(gnd, 'QUAL')
    expect(hits.length).toBe(1)
    expect(hits[0].msg).toContain('ground crew — cannot fly a front seat')
    /* but the rear seat is their proper place (incentive ride), no QUAL */
    AM().aircraft[2].p = ''
    AM().aircraft[3].w = gnd
    expect(warns(gnd, 'QUAL')).toEqual([])
  })

  it('a plain pilot in a spare REAR seat raises nothing — the mirror was offered and declined (owner, 31 Aug 26)', () => {
    const plain = Object.keys(PEOPLE).find(id =>
      !PEOPLE[id].special && !PEOPLE[id].pers && PEOPLE[id].seat === 'FCP' && !isInstrPilot(PEOPLE[id].q))!
    expect(plain, 'the roster carries a non-instructor pilot').toBeTruthy()
    AM().aircraft[2].w = plain
    expect(warns(plain, 'QUAL')).toEqual([])
  })
})

describe('rot guard — the seed stays blind to both rules', () => {
  it('an SC wave with empty seats adds no warning at all', () => {
    /* the untouched seed, re-validated with and without the empty wave: the
       new rules must fire only for seated spare rows, so a future seeded SC
       wave goes red HERE first, not in the parity suite */
    const withWave = validate().all.length
    ;(DAYS[TUE] as any).waves.pop()
    const without = validate().all.length
    expect(withWave).toBe(without)
  })
})
