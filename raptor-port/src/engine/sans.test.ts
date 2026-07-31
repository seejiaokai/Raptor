/* Ported from reference/tfin.js — group L, the SANS proficiency rule (§1a).
   Deliberately unwired in the reference; the helper itself is pinned here. */
import { describe, expect, it } from 'vitest'
import { sanStatus } from './people'

describe('SANS proficiency rule (tfin L)', () => {
  const s = (id: string) => sanStatus(id)

  it('sanStatus returns null for non-SANS', () => {
    expect(s('bane')).toBeFalsy()
  })

  it('SANS baseline: 6 for proficiency, 3 for allowance', () => {
    const b = s('bullet')
    expect(b && b.needProf === 6 && b.needAllow === 3).toBe(true)
  })

  it('surplus sorties do NOT carry forward', () => {
    const b = s('bullet')
    expect(b && b.flown === 7 && b.needProf === 6 && b.proficiencyMet && b.missedQtrs === 0).toBe(true)
  })

  it('3 sorties earns allowance but not proficiency', () => {
    const bd = s('badger')
    expect(bd && bd.allowanceMet && !bd.proficiencyMet && bd.sev === 'warn').toBe(true)
  })

  it('a short quarter counts as missed', () => {
    const bd = s('badger')
    expect(bd && bd.missedQtrs === 1).toBe(true)
  })

  it('shortfall carries forward into the next quarter', () => {
    const c = s('cards')
    expect(c && c.needProf === 12 && c.needAllow === 9).toBe(true)
  })

  it('more than 2 short quarters puts them out of flying', () => {
    const c = s('cards')
    expect(c && c.outOfFlying && c.sev === 'out').toBe(true)
  })

  it('missing allowance is worse than missing proficiency', () => {
    const y = s('yeti')
    expect(y && !y.allowanceMet && y.sev === 'hard' && !y.outOfFlying).toBe(true)
  })

  it('exactly 6 meets proficiency', () => {
    const v = s('vinci')
    expect(v && v.proficiencyMet && v.sev === 'ok' && v.missedQtrs === 0).toBe(true)
  })

  it('out-of-flying is the most severe tier', () => {
    expect(['ok', 'warn', 'hard', 'out'].indexOf(s('cards')!.sev)).toBe(3)
  })
})
