/* Ported from reference/tfin.js — the B42 leave taxonomy (LL / OL / OIL). */
import { describe, expect, it } from 'vitest'
import { LEAVE_TYPES, INPUT_TYPES, isLeave, isLocalLeave, isDownchit, isOffType, isOffer, offWord, inputCoversDate } from './inputs'
import { validate } from './validate'

describe('leave is LL / OL / OIL (tfin B42)', () => {
  it('the three leave types replace the single Leave', () => {
    expect(INPUT_TYPES.slice(0, 3)).toEqual(['LL', 'OL', 'OIL'])
    expect(INPUT_TYPES).not.toContain('Leave')
    expect(INPUT_TYPES).not.toContain('TDY')
  })

  it('LL is local, OL is overseas, OIL is off in lieu', () => {
    expect(LEAVE_TYPES).toEqual({ LL: 'local leave', OL: 'overseas leave', OIL: 'off in lieu' })
  })

  it('all three read as leave, none of them as anything else', () => {
    expect(isLeave('LL') && isLeave('OL') && isLeave('OIL')).toBe(true)
    expect(isLeave('Leave')).toBe(false)
    expect(isLeave('Office')).toBe(false)
    expect(isLeave('')).toBe(false)
    expect(isLeave(' oil ')).toBe(true)
  })

  it('LL and OIL keep the man on the island, OL does not', () => {
    expect(isLocalLeave('LL') && isLocalLeave('OIL') && !isLocalLeave('OL')).toBe(true)
  })

  it('and a downchit is still its own thing', () => {
    expect(isDownchit('Downchit')).toBe(true)
    expect(isLeave('Downchit')).toBe(false)
    expect(isOffType('Downchit')).toBe(true)
    expect(isOffType('OIL')).toBe(true)
  })

  it('an offer to fly is not a clash (isOffer)', () => {
    expect(isOffer('Available fly') && isOffer('Available duty') && isOffer('Fly')).toBe(true)
    expect(isOffer('Office')).toBe(false)
  })

  it('offWord names the leave, with its remark', () => {
    expect(offWord({ type: 'LL', remarks: '' })).toBe('local leave (LL)')
    expect(offWord({ type: 'Downchit', remarks: 'MED' })).toBe('downchit — MED')
  })

  it('a ranged input covers every day of its range (inputCoversDate)', () => {
    const inp = { date: 'Jul 13', endDate: 'Jul 17', allday: true }
    expect(inputCoversDate(inp, 'Jul 13') && inputCoversDate(inp, 'Jul 15') && inputCoversDate(inp, 'Jul 17')).toBe(true)
    expect(inputCoversDate({ date: 'Jul 14' }, 'Jul 15')).toBe(false)
  })

  it('the roster really does carry leave to test against', () => {
    const W = validate()
    expect(W.all.some((x: any) => x.code === 'LEAVE_FLY' || x.code === 'DNIF_FLY')).toBe(true)
  })
})
