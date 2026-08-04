/* Ported from reference/tfin.js — the per-day sign-off / publish-day /
   amendment-level flow (B22/B26/B47/B49) and the B53 #14 history stamp.
   The reference drives these through buttons; the same model contracts are
   driven here through the engine (with the UI hooks left as no-ops). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE, isScheduler } from './people'
import { SCHED, signOf, signMissing, daySigned, signClear, signNames, signPeople, setDayApproved, dayApproved, publishableKeys, pendDays, dayPendCount, canPublishAL, alUnsignedDays, publishAL, publishALDay, unpublishAL, discardPending, alIssue, alCount, alDays, alUsed, nextAL, markEdit, pendCount, alColor, alAttr } from './publish'
import { noteChange } from './slots'

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}
})

describe('per-day sign-off (tfin B22/B24)', () => {
  it('the strip has the four roles', () => {
    expect(signMissing(0)).toEqual(['CUR CK', 'SKED CK', 'PLANNED BY', 'APPROVED BY'])
  })

  it('the three scheduling roles offer ONLY appointed schedulers', () => {
    expect(signPeople(true).every(id => isScheduler(id))).toBe(true)
  })

  it('CUR CK stays open to everyone', () => {
    const cur = signPeople(false), sk = signPeople(true)
    expect(cur.length).toBeGreaterThan(sk.length)
    expect(cur.some(id => !isScheduler(id))).toBe(true)
    expect(sk.length > 0 && sk.every(v => cur.includes(v))).toBe(true)
  })

  it('some schedulers are appointed', () => {
    expect(signPeople(true).length).toBeGreaterThan(3)
  })

  it('a name already signed stays offered even if the appointment was withdrawn', () => {
    const keep = PEOPLE.ignite.quals.sched
    PEOPLE.ignite.quals.sched = false
    expect(signPeople(true, 'ignite')).toContain('ignite')
    PEOPLE.ignite.quals.sched = keep
  })

  it('nor through the model — a locked day cannot be published', () => {
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(false)
  })

  it('three of four is still locked', () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
  })

  it('all four unlocks the day, and signing one day leaves the others locked', () => {
    sign(0)
    expect(daySigned(0)).toBe(true)
    expect(daySigned(1)).toBe(false)
  })

  it('a withdrawn appointment invalidates the signature', () => {
    sign(0)
    const keep = PEOPLE.pump.quals.sched
    PEOPLE.pump.quals.sched = false
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
    PEOPLE.pump.quals.sched = keep
  })
})

describe('publishing a day (tfin B26/B47)', () => {
  it('a signed day publishes, spends its signature, and takes only its own pending', () => {
    noteChange('0.0.0.0.p'); noteChange('dn:1.0')
    sign(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    /* the signature is spent on the issue */
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    /* day 0's pending went out with the day; day 1's is untouched */
    expect(SCHED.pending['0.0.0.0.p']).toBeUndefined()
    expect(SCHED.pending['dn:1.0']).toBe(1)
  })

  it('reopening a day voids its signature too', () => {
    sign(0); setDayApproved(0, true); sign(0)
    setDayApproved(0, false)
    expect(dayApproved(0)).toBe(false)
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
  })

  it('signNames records callsigns for the record', () => {
    sign(0)
    expect(signNames(0)).toEqual({ cur: 'Ignite', sked: 'Bane', plan: 'Stiff', appr: 'Pump' })
  })
})

describe('publishing an AL (tfin B49 / B26)', () => {
  it('pending edits only become publishable once their day is published', () => {
    noteChange('dn:0.0'); noteChange('dn:1.0')
    expect(publishableKeys()).toEqual([])
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')
    expect(publishableKeys()).toEqual(['dn:0.0'])
    expect(pendDays()).toEqual([0, 1])
    expect(dayPendCount(0)).toBe(1)
  })

  it('publishing an AL needs that day signed', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')
    expect(canPublishAL()).toBe(false)            // the publish spent the signature
    expect(alUnsignedDays()).toEqual([0])
    sign(0)
    expect(canPublishAL()).toBe(true)
    publishAL(1)
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(alUsed()).toEqual([1])
  })

  it('a per-day AL takes only that day\'s keys', () => {
    sign(0); setDayApproved(0, true)
    sign(1); setDayApproved(1, true)
    noteChange('dn:0.0'); noteChange('dn:1.0')
    sign(0)
    publishALDay(0)
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(SCHED.pending['dn:1.0']).toBe(1)       // held on the other day
    expect(pendCount()).toBe(1)
  })

  it('the published AL records a name per day and spends the signature again', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0'); sign(0)
    publishALDay(0)
    const rec = SCHED.als[0]
    expect(rec.n).toBe(1)
    expect(rec.sign[0].appr).toBe('Pump')
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    expect(dayApproved(0)).toBe(true)             // the day stays published
  })

  it('unpublish clears the AL marks back to pending', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0'); sign(0); publishALDay(0)
    unpublishAL(1)
    expect(SCHED.als).toEqual([])
    expect(SCHED.changes['dn:0.0']).toBeUndefined()
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.al).toBe(0)
  })

  it('discardPending clears the marks', () => {
    noteChange('dn:0.0'); discardPending()
    expect(pendCount()).toBe(0)
  })

  it('nextAL is the lowest unused number', () => {
    expect(nextAL()).toBe(1)
    SCHED.als = [{ n: 1, keys: [], sign: {} }, { n: 3, keys: [], sign: {} }]
    expect(nextAL()).toBe(2)
  })

  it('markEdit with no key re-marks nothing', () => {
    markEdit()
    expect(pendCount()).toBe(0)
  })

  it('alAttr marks pending and published items apart', () => {
    noteChange('dn:0.0')
    expect(alAttr('dn:0.0')).toContain('data-alp')
    SCHED.changes['dn:0.1'] = 2
    expect(alAttr('dn:0.1')).toContain('data-alc="2"')
    expect(alAttr('dn:9.9')).toBe('')
    expect(alAttr('')).toBe('')
  })

  it('AL colours follow the fixed sequence', () => {
    expect(alColor(1)).toBe('#3BC6E8')
    expect(alColor(3)).toBe('#3DE86B')
    expect(alColor(4)).toBe('#FFFFFF')
    expect(alColor(5)).toBe('#B388FF')   // purple
    expect(alColor(6)).toBe('#FF7FC4')   // pink
    expect(alColor(7)).toBe('#E5872B')   // orange
  })

  /* every colour is also a background the ALn tag is printed on in #08131b, so a
     dark entry makes its own tag unreadable — the AL5 magenta this replaced sat
     at 3.5:1. Pin the floor rather than the hexes alone, or the next recolour
     re-introduces the fault the recolour was for. */
  it('every AL colour carries its own tag in dark ink', () => {
    const lum = (hex: string) => {
      const ch = [1, 3, 5].map(i => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
    }
    const ink = lum('#08131b')
    for (let n = 1; n <= 7; n++) {
      const ratio = (lum(alColor(n)) + 0.05) / (ink + 0.05)
      expect(ratio, `AL${n} ${alColor(n)}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('an issued AL is history (tfin B53 #14)', () => {
  it('the issue stamps its own day list and item count', () => {
    sign(0)
    const { days } = alIssue(1, ['dn:0.0', 'dn:0.1'])
    expect(days).toEqual([0])
    expect(SCHED.als[0].n0).toBe(2)
    expect(SCHED.als[0].days).toEqual([0])
  })

  it('a delete cannot shrink an amendment that already went out', () => {
    SCHED.als = [{ n: 1, keys: ['dn:0.0', 'dn:0.1'], sign: {}, days: [0], n0: 2 }]
    const rec = SCHED.als[0]; rec.keys = []
    expect(alCount(rec)).toBe(2)
    expect(alDays(rec).join(',')).toBe('0')
  })
})
