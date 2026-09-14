/* THE LATE STAMP IS FROZEN AT THE WRITE (ARCH-STACK 1b).
   `mod` used to be stored as the literal 'now' and re-resolved to whatever
   "today" was every time it was read, so an input filed on time silently grew
   a LATE tag once the record was read back on a later day. This was harmless
   while INPUTS were session-only (a reload dropped them), but a real bug the
   moment they persist (the DB step). The fix freezes the stamp to today's ISO
   at the moment of the edit.

   This file pins the two halves that a later pass could undo:
     · nowStamp() is today's ISO, and inputStampISO reads a frozen stamp back
       unchanged (the legacy 'now' still resolves to today, as a fallback);
     · an on-time input does NOT flip to late when the clock moves past its
       deadline — the whole point of freezing. The same input carrying the old
       'now' sentinel WOULD flip, which is the bug we are proving gone. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nowStamp, inputStampISO, isLateInput, inputOwnDueISO } from './inputs'

const pad2 = (n: number) => String(n).padStart(2, '0')
const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
/* shift an ISO 'yyyy-mm-dd' by whole days, in UTC so no zone edge bites */
const shiftISO = (iso: string, days: number) => {
  const t = Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) + days * 86400000
  const d = new Date(t)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

afterEach(() => { vi.useRealTimers() })

describe('the late stamp is frozen at the write', () => {
  it('nowStamp() is today, and tracks a moved clock', () => {
    expect(nowStamp()).toBe(isoToday())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-20T09:00:00'))
    expect(nowStamp()).toBe('2026-07-20')
  })

  it('inputStampISO reads a frozen ISO back unchanged; legacy "now" still resolves to today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-20T09:00:00'))
    expect(inputStampISO({ mod: '2026-06-01' })).toBe('2026-06-01')   // frozen — read straight back
    expect(inputStampISO({ mod: 'now' })).toBe('2026-07-20')          // legacy fallback — today
    expect(inputStampISO({ mod: '' })).toBe('')                       // no stamp, never accuses
    expect(inputStampISO({ mod: undefined })).toBe('')
  })

  it('an on-time input does not flip to late after the clock passes its deadline', () => {
    const inp: any = { person: 'bane', type: 'LL', date: 'Jul 13', yr: 2026, allday: true, remarks: '' }
    const due = inputOwnDueISO(inp)
    expect(due).not.toBe('')                                          // the input's own deadline resolves
    const onTime = shiftISO(due, -1)                                  // filed the day before the deadline

    /* move "today" well past the deadline — the reload-a-week-later case */
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${shiftISO(due, 21)}T09:00:00`))

    /* frozen at write time (the fix): stays on time forever */
    expect(isLateInput({ ...inp, mod: onTime })).toBe(false)

    /* the OLD sentinel (the bug): the same on-time input reads late once the
       clock is past the deadline, because 'now' re-resolves to today */
    expect(isLateInput({ ...inp, mod: 'now' })).toBe(true)
  })

  it('a genuinely late frozen stamp is still late (the mark is not disabled)', () => {
    const inp: any = { person: 'bane', type: 'LL', date: 'Jul 13', yr: 2026, allday: true, remarks: '' }
    const due = inputOwnDueISO(inp)
    expect(isLateInput({ ...inp, mod: shiftISO(due, 1) })).toBe(true)   // one day after the deadline
    expect(isLateInput({ ...inp, mod: due })).toBe(false)               // the deadline day itself is on time
  })
})
