/* AUDIT C — adversarial double-booking matrix (PR d7ab3df's two-sorties-at-once
   conflict) and slotBar's self-seat exclusion. Which combinations raise the
   hard DOUBLE_BOOK, which stay advisory, and whether a swap really is silent —
   pinned so a regression is visible. New file only. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { slotBar } from './avail'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))

describe('double-booking: the same man twice in the air', () => {
  it('FCP and RCP of the SAME jet — hard, named as "two seats at once"', () => {
    const a = DAYS[1].waves[0].formations[0].aircraft[0]
    a.p = 'split'; a.w = 'split'
    const h = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => /is in two seats on VL BFM at once/.test(x.msg))).toBe(true)
  })

  it('two aircraft of the SAME formation — hard, same wording (labels are shared)', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.aircraft[0].p = 'split'; f.aircraft[1].p = 'split'
    const h = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(h.length).toBeGreaterThan(0)
    expect(h.some((x: any) => /two seats on VL BFM at once/.test(x.msg))).toBe(true)
  })

  it('same wave, two formations airborne at once — hard clash, tight-turn advisory suppressed', () => {
    const w = DAYS[1].waves[0]
    w.formations[0].aircraft[0].p = 'split'
    w.formations[1].to = '09:30'; w.formations[1].ld = '10:30'   // airborne overlap with 08:40–10:05
    w.formations[1].aircraft[0].p = 'split'
    const db = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(db.length, JSON.stringify(db)).toBeGreaterThan(0)
    expect(db.some((x: any) => /VL BFM & RU BFM clash/.test(x.msg))).toBe(true)
    // the negative-minute "tight turn" this used to print is gone
    expect(hits('TURN', 'split').filter((x: any) => x.di === 1)).toEqual([])
    /* and he is NOT counted "double turning" — both legs are the same air
       time, so the clash is the whole story (owner, 21 Aug 26; this used to
       pin the opposite, when HANDOFF carried the over-count as deliberate) */
    expect(hits('DT_SUM', 'split').filter((x: any) => x.di === 1)).toEqual([])
  })

  it('a double-booked man carries the C chip, not DT — and no DT_SUM line', () => {
    const a = DAYS[1].waves[0].formations[0].aircraft[0]
    a.p = 'split'; a.w = 'split'
    const W = validate()
    expect(W.all.some((x: any) => x.code === 'DT_SUM' && (x.who || []).includes('split'))).toBe(false)
    expect(W.chip[1] && W.chip[1]['split']).toBe('C')
  })

  it('double-booked in the morning AND a genuine later leg — DT_SUM still names him', () => {
    /* one sequential pair is enough: the clash and the double turn are both
       true of this man, and each rule speaks for its own half */
    const w = DAYS[1].waves[0]
    w.formations[0].aircraft[0].p = 'split'                       // 08:40–10:05
    w.formations[1].to = '09:30'; w.formations[1].ld = '10:30'    // airborne overlap — the clash
    w.formations[1].aircraft[0].p = 'split'
    w.formations.push({ cs: 'ZZ', msn: 'TEST', to: '14:00', ld: '15:00', aircraft: [{ p: 'split', w: '', area: '', rmks: '', opts: {} }] })
    expect(hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1).length).toBeGreaterThan(0)
    expect(hits('DT_SUM', 'split').filter((x: any) => x.di === 1).length).toBe(1)
  })

  it('three sorties at once — every pair is named: three hard clashes', () => {
    const w = DAYS[1].waves[0]
    w.formations[0].aircraft[0].p = 'split'
    w.formations[1].to = '08:40'; w.formations[1].ld = '10:05'
    w.formations[1].aircraft[0].p = 'split'
    w.formations.push({ cs: 'ZZ', msn: 'TEST', to: '08:40', ld: '10:05', aircraft: [{ p: 'split', w: '', area: '', rmks: '', opts: {} }] })
    const db = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(db.length, db.map((x: any) => x.msg).join(' | ')).toBe(3)
    // all three legs share one air time, so no pair is a turn — no DT_SUM
    expect(hits('DT_SUM', 'split').filter((x: any) => x.di === 1)).toEqual([])
  })

  it('flying + sim overlap — hard DOUBLE_BOOK', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    DAYS[1].sims.oft.push({ label: 'EP-4', str: '0900', end: '1000', p: 'split', w: '' })
    const db = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(db.length, JSON.stringify(db)).toBeGreaterThan(0)
    expect(db.some((x: any) => /Sim EP-4/.test(x.msg))).toBe(true)
  })

  it('flying + duty post overlap — hard DOUBLE_BOOK', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    DAYS[1].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '0900', end: '1100' })
    const db = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(db.length, JSON.stringify(db)).toBeGreaterThan(0)
    expect(db.some((x: any) => /SDO duty/.test(x.msg))).toBe(true)
  })

  it('flying + ground event overlap — also the hard clash (ground is only soft against a SHIFT)', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    DAYS[1].ground.push({ prog: 'AUDIT BRIEF', str: '0900', end: '1000', who: 'Split' })
    const db = hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)
    expect(db.length, JSON.stringify(db)).toBeGreaterThan(0)
  })

  it('back-to-back legs (no airborne overlap) stay a turn, never a conflict', () => {
    const w = DAYS[1].waves[0]
    w.formations[0].aircraft[0].p = 'split'                       // 08:40–10:05
    w.formations[1].to = '10:30'; w.formations[1].ld = '11:30'    // 25 min turn — tight, legal
    w.formations[1].aircraft[0].p = 'split'
    expect(hits('DOUBLE_BOOK', 'split').filter((x: any) => x.di === 1)).toEqual([])
    expect(hits('TURN', 'split').filter((x: any) => x.di === 1).length).toBe(1)
    // sequential legs are the genuine article — DT_SUM names him
    expect(hits('DT_SUM', 'split').filter((x: any) => x.di === 1).length).toBe(1)
  })
})

describe('slotBar: the seat being planned into is excluded', () => {
  it('the man already in the seat is not barred by his own occupancy', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    validate()
    expect(slotBar('split', '1.0.0.0.p')).toBe('')
  })

  it('AFTER a swap is written (the drag order: write both, then ask) both men are silent', () => {
    /* drag.ts applyDrop writes BOTH seats, then barDrop revalidates and asks —
       so the engine contract behind "a swap stays silent" is: post-swap, each
       man asked about the seat he now HOLDS answers clear. */
    const f = DAYS[1].waves[0].formations[0]
    const a = f.aircraft[0].p, b = f.aircraft[1].p       // nact, casper
    f.aircraft[0].p = b; f.aircraft[1].p = a
    validate()
    expect(slotBar(b, '1.0.0.0.p')).toBe('')
    expect(slotBar(a, '1.0.0.1.p')).toBe('')
  })

  it('BEFORE the write, a man still sitting elsewhere at the same hour IS named — correctly', () => {
    /* the palette case: keyB armed, candidate still occupies keyA in the same
       window — he genuinely is busy, and the bar says where. Advisory only. */
    const f = DAYS[1].waves[0].formations[0]
    f.aircraft[0].p = 'split'                            // split at seat 0
    validate()
    const bar = slotBar('split', '1.0.0.1.p')            // asked about seat 1
    expect(bar, bar).toMatch(/already on VL BFM/)
  })
})
