/* The edit log (owner, 11 Aug 26) — who changed which detail, when, and what
   it was before.

   The first two tests are the load-bearing ones, and they exist because the
   two funnel entry points call noteChange at OPPOSITE ends of the write:
   setSlotVal marks BEFORE it assigns (so the old value is still readable),
   txtSet marks AFTER (so it has to hand the old value over itself). Get that
   backwards and every typed field logs "0800 → 0800" — a defect that looks
   like nothing at all on screen, because the row is simply absent. */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from './data'
import { SCHED, markEdit } from './publish'
import { setSlotVal, txtSet, txtGet } from './slots'
import { HOOKS } from './hooks'
import { ELOG, elogClear, elogRows, elogFor, elogWhen, keyLabel, logEdit, logAction } from './editlog'

/* the first FCP seat of the first formation of day 0, and a text field on the
   same line — read off the grammar rather than hard-coded, so a change to the
   seed data cannot quietly make these tests address nothing */
const SEAT = '0.0.0.0.p'
const CS = 'ff:0.0.0.cs'

let who: any
beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}
  elogClear()
  who = HOOKS.whoami
  HOOKS.whoami = () => 'Tester'
})
afterEach(() => { HOOKS.whoami = who; vi.useRealTimers() })

describe('what gets recorded', () => {
  it('a SEAT records the callsign it was and the callsign it became', () => {
    setSlotVal(SEAT, 'bane')
    setSlotVal(SEAT, 'stiff')
    const rows = elogRows()
    expect(rows.length).toBe(2)
    /* newest first, and people read as callsigns — never as the ids the
       model actually holds */
    expect(rows[0]!.from).toBe('Bane')
    expect(rows[0]!.to).toBe('Stiff')
    expect(rows[1]!.to).toBe('Bane')
  })

  it('an emptied seat reads as an em dash, not as a blank', () => {
    setSlotVal(SEAT, 'bane')
    setSlotVal(SEAT, '')
    expect(elogRows()[0]!.to).toBe('—')
  })

  /* THE ORDERING PIN. txtSet assigns and then marks, so it must capture the
     old string itself; if it ever goes back to letting noteChange read the
     model, this test is what says so. */
  it('a TYPED FIELD records what it said before, not what it says now', () => {
    txtSet(CS, 'VIPER')
    txtSet(CS, 'MONSOON')
    expect(txtGet(CS)).toBe('MONSOON')
    const r = elogRows()[0]!
    expect(r.from).toBe('VIPER')
    expect(r.to).toBe('MONSOON')
  })

  it('a write that changes nothing records nothing', () => {
    setSlotVal(SEAT, 'bane')
    elogClear()
    setSlotVal(SEAT, 'bane')
    txtSet(CS, txtGet(CS))
    expect(elogRows().length).toBe(0)
  })

  /* every mutation ends with afterSchedMutate()'s bare markEdit(), and every
     board ADD marks a key it has no "before" for. Neither may leave a row. */
  it('a keyless mark, and a key with no values, record nothing', () => {
    markEdit()
    markEdit(CS)
    expect(elogRows().length).toBe(0)
  })

  it('the day is stamped on the row, so the list can be filtered by it', () => {
    setSlotVal('1.0.0.0.p', 'bane')
    setSlotVal(SEAT, 'stiff')
    expect(elogRows(0).length).toBe(1)
    expect(elogRows(1).length).toBe(1)
    expect(elogRows().length).toBe(2)
    expect(elogRows(0)[0]!.key).toBe(SEAT)
  })

  it('the name comes from the hook, so a server session can fill it later', () => {
    setSlotVal(SEAT, 'bane')
    expect(elogRows()[0]!.who).toBe('Tester')
  })

  it('a structural change is a sentence, with no pair of values', () => {
    logAction(2, 'Line removed')
    const r = elogRows()[0]!
    expect(r.key).toBe('')
    expect(r.lbl).toBe('Line removed')
    expect(r.di).toBe(2)
  })

  it('the log is bounded, and drops the OLDEST first', () => {
    const cap = ELOG.cap
    for (let i = 0; i < cap + 25; i++) logAction(0, 'edit ' + i)
    expect(ELOG.rows.length).toBe(cap)
    expect(ELOG.rows[0]!.lbl).toBe('edit 25')          // 0–24 fell off the front
    expect(elogRows()[0]!.lbl).toBe('edit ' + (cap + 24))
  })

  it('elogFor answers with the NEWEST entry for one detail, and null for a clean one', () => {
    setSlotVal(SEAT, 'bane')
    setSlotVal(SEAT, 'stiff')
    expect(elogFor(SEAT)!.to).toBe('Stiff')
    expect(elogFor('0.0.0.0.w')).toBe(null)
  })

  it('a text value that happens to BE a person id still reads as text', () => {
    /* the log decides by the key's grammar, not by whether PEOPLE has the
       string — a remark reading "bane" is a remark */
    txtSet('fr:0.0.0.0', 'bane')
    expect(elogRows()[0]!.to).toBe('bane')
  })
})

describe('what a detail is called', () => {
  it('a seat is named by the line it sits in', () => {
    const f = DAYS[0].waves[0].formations[0]
    expect(keyLabel('0.0.0.0.p')).toContain(f.cs)
    expect(keyLabel('0.0.0.0.p')).toContain('FCP')
    expect(keyLabel('0.0.0.0.w')).toContain('RCP')
  })
  it('the other families each name themselves', () => {
    expect(keyLabel('dn:0.0')).toBe('Day note')
    expect(keyLabel('ff:0.0.0.to')).toContain('take-off')
    expect(keyLabel('ar:0.0.0')).toContain('area')
    expect(keyLabel('st:0.0.0.0')).toContain('stores')
    expect(keyLabel('d:0.0.0')).toMatch(/^Duty · /)
    expect(keyLabel('g:0.0')).toMatch(/^Ground · /)
  })
  /* the label is frozen onto the row at log time precisely so this can never
     throw — a row deleted after it was edited must still list */
  it('an address that no longer resolves falls back rather than throwing', () => {
    expect(keyLabel('ff:99.9.9.cs')).toBe('Schedule')
    expect(keyLabel('nonsense')).toBe('Schedule')
  })
  it('a row renamed after the edit keeps the name it had AT the time', () => {
    txtSet(CS, 'VIPER')
    logEdit('0.0.0.0.p', 'bane', 'stiff')
    txtSet(CS, 'MONSOON')
    expect(elogFor('0.0.0.0.p')!.lbl).toContain('VIPER')
  })
})

describe('the time it shows', () => {
  /* CHANGED 11 Aug 26 on the owner's ask ("There is no date stated on the
     change too like for e.g 11/8"). It used to print the clock alone for
     anything changed today and add the date only once that stopped being
     true. The date is always there now — the rows are about SCHEDULE days, so
     a bare "14:32" beside "Monday" invites being read as 14:32 on the Monday
     being planned, and a tab left open past midnight stopped silently
     relabelling yesterday's work as today's. */
  it('is the date and the clock, today or not', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 11, 14, 32))
    const now = Date.now()
    expect(elogWhen(now, now)).toBe('11/8 14:32')
    const yesterday = new Date(2026, 7, 10, 9, 5).getTime()
    expect(elogWhen(yesterday, now)).toBe('10/8 09:05')
  })

  /* day/month, not month/day — the squadron reads dates the British way, as
     every other date on the app's surfaces does (DAYS' own `dt` strings) */
  it('puts the day before the month, and does not pad either', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 11, 3, 8, 7))
    expect(elogWhen(Date.now())).toBe('3/12 08:07')
  })
})
