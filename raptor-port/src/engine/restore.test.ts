/* Restore-a-published-version: the dayKeys walker must speak the same key
   grammar as slots.ts, and restoreDayVersion must mark exactly what moved —
   the revert is an honest amendment, not a history rewrite. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { HOOKS } from './hooks'
import { SCHED, signOf, setDayApproved, alIssue, daySnapOf } from './publish'
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
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}
})

describe('the dayKeys walker', () => {
  it('covers every prefix of the slot-key grammar', () => {
    DAYS[0].dutywaves[0].rows[0].more = ['pike']   // exercise .xN overflow
    const m = dayKeys(DAYS[0], 0)
    for (const k of ['0.0.0.0.p', '0.0.0.0.w', 'fr:0.0.0.0', 'st:0.0.0.0',
      'ff:0.0.0.cs', 'ff:0.0.0.to', 'ar:0.0.0', 'at:0.0.0',
      'wl:0.0', 'it:0.0', 'tr:0.0', 'dn:0.0', 'sn:0',
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

  it('restoring an untouched day is a zero-change restore, not a lie', () => {
    sign(0); setDayApproved(0, 1)
    expect(restoreDayVersion(0, 'orig')).toBe(0)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('marks exactly the keys that moved; equal keys keep their AL colours', () => {
    sign(0); setDayApproved(0, 1)
    setSlotVal('0.0.0.0.p', 'casper')
    txtSet('dn:0.0', 'NEW NOTE')
    /* an already-published mark on a key the restore does NOT touch */
    SCHED.changes['dn:0.1'] = 1
    const n = restoreDayVersion(0, 'orig')
    expect(n).toBe(2)
    expect(slotVal('0.0.0.0.p')).toBe('stiff')
    expect(txtGet('dn:0.0')).toBe(D0.notes[0])
    expect(SCHED.pending['0.0.0.0.p']).toBe(1)
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.changes['dn:0.1']).toBe(1)     // untouched key keeps its colour
    expect(SCHED.pending['dn:0.1']).toBeUndefined()
  })

  it('a wave added after the issue disappears with NO marks for its dead keys', () => {
    sign(0); setDayApproved(0, 1)
    DAYS[0].waves.push(JSON.parse(JSON.stringify(DAYS[0].waves[0])))
    const n = restoreDayVersion(0, 'orig')
    expect(DAYS[0].waves.length).toBe(D0.waves.length)
    /* the delete rule: no pending mark may point at an address that is gone */
    expect(n).toBe(0)
    expect(Object.keys(SCHED.pending).filter(k => /(^|:)0\.2\./.test(k))).toEqual([])
  })

  it('a row removed after the issue comes back, marked', () => {
    sign(0); setDayApproved(0, 1)
    DAYS[0].notes.pop()
    const n = restoreDayVersion(0, 'orig')
    expect(DAYS[0].notes.length).toBe(D0.notes.length)
    expect(n).toBe(1)
    expect(SCHED.pending[`dn:0.${D0.notes.length - 1}`]).toBe(1)
  })

  it('restores an AL version, and today stays with the calendar', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'AL1 TEXT'); sign(0)
    alIssue(1, ['dn:0.0'])
    txtSet('dn:0.0', 'LATER LIVE TEXT')
    DAYS[0].today = false                     // the week rolled on
    expect(restoreDayVersion(0, 1)).toBe(1)
    expect(txtGet('dn:0.0')).toBe('AL1 TEXT')
    expect(DAYS[0].today).toBe(false)         // not resurrected from the snapshot
    /* the restored key lost its AL1 colour — it is pending again */
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.changes['dn:0.0']).toBeUndefined()
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
