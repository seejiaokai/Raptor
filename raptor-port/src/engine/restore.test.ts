/* The dayKeys walker must speak the same key grammar as slots.ts. Phase 2
   removed restoreDayVersion (the in-place rollback take-back) — the only way to
   pull an old version forward is now loadVersionToWorkingCopy → publish the next
   AL (covered in drafts.test.ts). The walker itself STAYS: it is the executable
   documentation of the slot-key grammar. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { dayKeys } from './restore'

/* the walker never mutates DAYS, but a couple of cases poke it — clone-restore */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))
beforeEach(() => { DAYS[0] = JSON.parse(JSON.stringify(D0)) })

describe('the dayKeys walker', () => {
  it('covers every prefix of the slot-key grammar', () => {
    DAYS[0].dutywaves[0].rows[0].more = ['pike']   // exercise .xN overflow
    const m = dayKeys(DAYS[0], 0)
    for (const k of ['0.0.0.0.p', '0.0.0.0.w', 'fr:0.0.0.0', 'st:0.0.0.0',
      'ff:0.0.0.cs', 'ff:0.0.0.to', 'ar:0.0.0', 'at:0.0.0',
      'wl:0.0', 'it:0.0', 'tr:0.0', 'dn:0.0', 'sn:0', 'pn:0', 'dtn:0', 'gn:0',
      'ap:0.0.prog', 'ap:0.0.rmks', 'a:0.1.0', 'dl:0.0', 'dr:0.0.0.role', 'd:0.0.0', 'd:0.0.0.x0',
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

  it('the ⓘ info-only flag rides the row composite too — allhands and ground', () => {
    const g0 = dayKeys(DAYS[0], 0).get('gr:0.0.prog')
    DAYS[0].ground[0].info = true
    expect(dayKeys(DAYS[0], 0).get('gr:0.0.prog')).not.toBe(g0)
    const a0 = dayKeys(DAYS[0], 0).get('ap:0.4.prog')
    DAYS[0].allhands[4].info = true
    expect(dayKeys(DAYS[0], 0).get('ap:0.4.prog')).not.toBe(a0)
  })

  /* CANONICAL person compare (owner, 16 Aug 26) — a seed/pre-fix row can hold a
     person's id ('nact') where an app write stores his callsign ('Warden'). */
  it('resolves a callsign to its id so both spellings compare equal; free text passes through untouched', () => {
    const dayId = { ground: [{ prog: 'DUTY', who: 'nact' }] }
    const dayCs = { ground: [{ prog: 'DUTY', who: 'Warden' }] }
    const vId = dayKeys(dayId, 0).get('g:0.0')
    const vCs = dayKeys(dayCs, 0).get('g:0.0')
    expect(vId, 'the id form resolves to itself').toBe('nact')
    expect(vCs, 'the callsign form resolves to the same id').toBe('nact')
    expect(vCs).toBe(vId)

    const dayFree = { ground: [{ prog: 'DUTY', who: 'Guest Speaker' }] }
    expect(dayKeys(dayFree, 0).get('g:0.0'), 'not a recognised callsign — passes through as-is').toBe('Guest Speaker')
  })
})
