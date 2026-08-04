/* Restore-a-published-version: the dayKeys walker must speak the same key
   grammar as slots.ts, and restoreDayVersion is a ROLLBACK — the version
   becomes the live document immediately, wearing exactly its issued marks;
   unpublished edits on the day are discarded and counted. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { HOOKS } from './hooks'
import { SCHED, signOf, setDayApproved, alIssue, unpublishAL, dayCurVer, dayApproved } from './publish'
import { setSlotVal, txtSet, slotVal, txtGet } from './slots'
import { dayKeys, restoreDayVersion } from './restore'

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
/* restore mutates DAYS[0] wholesale — every test starts from the pristine day */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))

beforeEach(() => {
  DAYS[0] = JSON.parse(JSON.stringify(D0))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
})

describe('the dayKeys walker', () => {
  it('covers every prefix of the slot-key grammar', () => {
    DAYS[0].dutywaves[0].rows[0].more = ['pike']   // exercise .xN overflow
    const m = dayKeys(DAYS[0], 0)
    for (const k of ['0.0.0.0.p', '0.0.0.0.w', 'fr:0.0.0.0', 'st:0.0.0.0',
      'ff:0.0.0.cs', 'ff:0.0.0.to', 'ar:0.0.0', 'at:0.0.0',
      'wl:0.0', 'it:0.0', 'tr:0.0', 'dn:0.0', 'sn:0', 'pn:0', 'dtn:0', 'gn:0',
      'ap:0.0.prog', 'a:0.1.0', 'dl:0.0', 'dr:0.0.0.role', 'd:0.0.0', 'd:0.0.0.x0',
      'sr:0.amt.0.label', 's:0.amt.1.pax.0', 's:0.oft.0.p', 'gr:0.0.prog', 'g:0.0'])
      expect(m.has(k), k).toBe(true)
    expect(m.get('0.0.0.0.p')).toBe('stiff')
    expect(m.get('d:0.0.0.x0')).toBe('pike')
  })

  it('null-aware areas: an unset area is not the same as an empty one', () => {
    const a = dayKeys(DAYS[0], 0).get('ar:0.0.0')
    DAYS[0].waves[0].formations[0].aircraft[0].area = ''
    expect(dayKeys(DAYS[0], 0).get('ar:0.0.0')).not.toBe(a)
  })

  it('row state without a text key rides the row composite (cx / flag)', () => {
    const before = dayKeys(DAYS[0], 0).get('fr:0.0.0.0')
    DAYS[0].waves[0].formations[0].aircraft[0].cx = true
    expect(dayKeys(DAYS[0], 0).get('fr:0.0.0.0')).not.toBe(before)
  })
})

describe('restoreDayVersion', () => {
  it('returns false for a version that does not exist', () => {
    expect(restoreDayVersion(0, 'orig')).toBe(false)
    expect(restoreDayVersion(0, 7)).toBe(false)
  })

  it('rolling back an untouched day discards nothing and stamps the version', () => {
    sign(0); setDayApproved(0, 1)
    expect(restoreDayVersion(0, 'orig')).toBe(0)
    expect(Object.keys(SCHED.pending)).toEqual([])
    expect(dayCurVer(0)).toBe('orig')
  })

  it('a rollback discards the day\'s pending edits (counted) and wears the version\'s own marks', () => {
    sign(0); setDayApproved(0, 1)
    setSlotVal('0.0.0.0.p', 'casper')
    txtSet('dn:0.0', 'NEW NOTE')
    /* a published mark on the day: the Original wore no marks, so it must go */
    SCHED.changes['dn:0.1'] = 1
    /* another day's marks are not this rollback's business */
    SCHED.changes['dn:1.0'] = 1; SCHED.pending['dn:1.1'] = 1
    const n = restoreDayVersion(0, 'orig')
    expect(n).toBe(2)                            // the two discarded pending edits
    expect(slotVal('0.0.0.0.p')).toBe('stiff')
    expect(txtGet('dn:0.0')).toBe(D0.notes[0])
    /* nothing pending, nothing coloured on day 0 — the day IS the Original again */
    expect(Object.keys(SCHED.pending)).toEqual(['dn:1.1'])
    expect(SCHED.changes['dn:0.1']).toBeUndefined()
    expect(SCHED.changes['dn:1.0']).toBe(1)      // other days untouched
    expect(SCHED.pending['dn:1.1']).toBe(1)
    expect(dayCurVer(0)).toBe('orig')
  })

  it('a wave added after the issue disappears — no pending, no marks', () => {
    sign(0); setDayApproved(0, 1)
    DAYS[0].waves.push(JSON.parse(JSON.stringify(DAYS[0].waves[0])))
    const n = restoreDayVersion(0, 'orig')
    expect(DAYS[0].waves.length).toBe(D0.waves.length)
    expect(n).toBe(0)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('a row removed after the issue comes back — clean, not marked', () => {
    sign(0); setDayApproved(0, 1)
    DAYS[0].notes.pop()
    restoreDayVersion(0, 'orig')
    expect(DAYS[0].notes.length).toBe(D0.notes.length)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('rolls back to an AL version wearing exactly its issued marks; today stays with the calendar', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'AL1 TEXT'); sign(0)
    alIssue(1, ['dn:0.0'])
    txtSet('dn:0.0', 'LATER LIVE TEXT')
    DAYS[0].today = false                     // the week rolled on
    expect(restoreDayVersion(0, 1)).toBe(1)   // the later live edit was discarded
    expect(txtGet('dn:0.0')).toBe('AL1 TEXT')
    expect(DAYS[0].today).toBe(false)         // not resurrected from the snapshot
    /* the day wears AL1's marks again — the rollback IS AL1, not an edit */
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(dayCurVer(0)).toBe(1)
    /* the day stays published; the AL record survives for the dropdown */
    expect(dayApproved(0)).toBe(true)
    expect(SCHED.als.length).toBe(1)
  })

  it('two days roll back independently', () => {
    const D1 = JSON.parse(JSON.stringify(DAYS[1]))
    try {
      sign(0); setDayApproved(0, 1)
      sign(1); setDayApproved(1, 1)
      txtSet('dn:0.0', 'DAY0 EDIT'); txtSet('dn:1.0', 'DAY1 EDIT')
      expect(restoreDayVersion(0, 'orig')).toBe(1)
      expect(txtGet('dn:0.0')).toBe(D0.notes[0])
      expect(txtGet('dn:1.0')).toBe('DAY1 EDIT')   // day 1 untouched, still pending
      expect(SCHED.pending['dn:1.0']).toBe(1)
      expect(dayCurVer(0)).toBe('orig')
    } finally { DAYS[1] = D1 }
  })

  it('unpublishing a LATER AL does not re-pend a day already rolled back past it', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'AL1 TEXT'); sign(0); alIssue(1, ['dn:0.0'])
    txtSet('dn:0.1', 'AL2 TEXT'); sign(0); alIssue(2, ['dn:0.1'])
    restoreDayVersion(0, 1)                    // the day no longer carries AL2 content
    expect(dayCurVer(0)).toBe(1)
    unpublishAL(2)
    /* AL2's key on this day was overwritten by the rollback — nothing to re-pend */
    expect(SCHED.pending['dn:0.1']).toBeUndefined()
    expect(dayCurVer(0)).toBe(1)               // cur untouched, still valid
  })

  it('pushes nothing to history itself — the UI caller owns the one undo step', () => {
    sign(0); setDayApproved(0, 1)
    setSlotVal('0.0.0.0.p', 'casper')
    let pushes = 0
    const h0 = HOOKS.histPush; HOOKS.histPush = () => { pushes++ }
    try { restoreDayVersion(0, 'orig') } finally { HOOKS.histPush = h0 }
    expect(pushes).toBe(0)
  })
})
