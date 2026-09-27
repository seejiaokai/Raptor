/* THE CHANGE HISTORY IS A DURABLE, WEEK-SAFE RECORD ([DRAFT-PENDING], 28 Sep 26 — D168, D336 (b)).

   The one changes window reads the edit log across a whole week, for everyone, after a reload and a sign-out. Three
   things the session-only log never needed and the window cannot do without:
   1. every line knows its CALENDAR day. The log used to keep only `di`, a day of whichever week was loaded, so a
      Monday line made on the week of 13 Jul showed under the week of 20 Jul's Monday too — for new edits, not only old
      ones. The date is taken when the line is written, so switching weeks never moves it;
   2. every line has an identity that only rises (`seq`), kept across a reload, so "new to you" can point at it;
   3. it is saved and loaded back (D336 (b): the history outlives a sign-out — built on yes, on his look card). */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { storeBackend } from './hooks'
import { setCurWeek, CURWEEK } from './waves'
import {
  ELOG, elogClear, logEdit, logAction, elogLoad, elogFlush, elogWeekRows, elogFor, rowTouches,
} from './editlog'

let fake: Map<string, string>
let week0: string
beforeEach(() => {
  week0 = CURWEEK
  fake = new Map()
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { fake.set(k, v) } }
  elogClear()
})
afterEach(() => { setCurWeek(week0); storeBackend.impl = null; elogClear() })

describe('a line knows its calendar day', () => {
  it('a Monday line made on the week of 13 Jul stays on 13 Jul when the week of 20 Jul is loaded', () => {
    setCurWeek('13/07/2026')
    logAction(0, 'Note added')
    expect(ELOG.rows[0]!.date).toBe('2026-07-13')
    setCurWeek('20/07/2026')
    expect(elogWeekRows('20/07/2026').length).toBe(0)
    expect(elogWeekRows('13/07/2026').map(r => r.lbl)).toEqual(['Note added'])
  })

  it('a value edit takes the day of its key in the week loaded when it was made', () => {
    setCurWeek('13/07/2026')
    logEdit('dn:2.0', 'old note', 'new note')
    expect(ELOG.rows[0]!.date).toBe('2026-07-15')
  })

  it('the bubble on a detail never shows a line made on the same weekday of another week', () => {
    setCurWeek('13/07/2026')
    logEdit('dn:0.0', 'a', 'b')
    expect(elogFor('dn:0.0')).not.toBeNull()
    setCurWeek('20/07/2026')
    expect(elogFor('dn:0.0')).toBeNull()
  })

  it('an absence line spans its days, and shows in the week of every day it covers', () => {
    setCurWeek('13/07/2026')
    logAction(null, 'Leave War · Ranger · LL: approved', { date: '2026-07-19', end: '2026-07-21' })
    const r = ELOG.rows[0]!
    expect(rowTouches(r, '2026-07-19')).toBe(true)
    expect(rowTouches(r, '2026-07-20')).toBe(true)
    expect(rowTouches(r, '2026-07-22')).toBe(false)
    expect(elogWeekRows('13/07/2026').length).toBe(1)
    expect(elogWeekRows('20/07/2026').length).toBe(1)
  })
})

describe('an identity that only rises, and a record that is kept', () => {
  it('every line gets the next number, and the numbering carries on after a reload', () => {
    setCurWeek('13/07/2026')
    logAction(0, 'one'); logAction(1, 'two')
    const [a, b] = ELOG.rows
    expect(b!.seq).toBeGreaterThan(a!.seq)
    elogFlush()
    elogClear()
    expect(ELOG.rows.length).toBe(0)
    elogLoad()
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['one', 'two'])
    logAction(2, 'three')
    expect(ELOG.rows[2]!.seq).toBeGreaterThan(b!.seq)
  })

  it('keeps the newest 2,000 lines — the oldest leave first', () => {
    setCurWeek('13/07/2026')
    for (let i = 0; i < 2005; i++) logAction(0, 'x' + i)
    expect(ELOG.rows.length).toBe(2000)
    expect(ELOG.rows[0]!.lbl).toBe('x5')
  })

  it('a saved record with a broken line loads the good lines and drops the broken one', () => {
    fake.set('sqn142_elog', JSON.stringify({ v: 1, next: 9, rows: [
      { seq: 3, t: 1, who: 'Hex', pid: 'hex', di: 0, date: '2026-07-13', key: '', lbl: 'fine', from: '', to: '' },
      { seq: 'x', t: 1, lbl: 'broken' },
    ] }))
    elogLoad()
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['fine'])
    logAction(0, 'next')
    expect(ELOG.rows[1]!.seq).toBe(9)
  })
})
