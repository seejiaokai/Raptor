/* AUDIT FOLLOW-UP — the guard rails on a brief time (owner, 12 Aug 26: "for 2
   u can put guard rails to deny such inputs").

   The audit found that a brief typed LATER than its own take-off inverts the
   brief window (brief..T/O), so overlap() stops matching anything inside the
   real brief slot and the line's "no time for the flight brief" check goes
   silently dark. The engine deliberately does NOT reinterpret such a value —
   a bad time stays a VISIBLE bad time (brieftime.test.ts pins that) — so the
   fix closes both ways IN, at the one write path both surfaces share:

   - typing the brief after the take-off is REFUSED (txtSet returns false and
     each caller reverts its own cell), and
   - moving the TAKE-OFF earlier past an existing brief is ALLOWED — the
     take-off is the primary fact — but the stranded brief is cleared, visibly
     and through the funnel, so the line falls back to the suggested lead the
     way a blank B always has.

   The small-hours case must survive both: a 00:30 launch legitimately briefs
   the previous evening, which events.ts's preflight roll already handles. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { txtSet, txtGet } from './slots'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { HOOKS } from './hooks'
import { ELOG, elogClear, elogFor } from './editlog'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let said: string[] = []
const realToast = HOOKS.toast

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  elogClear()
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)); }) as any
  validate()
})
afterEach(() => { HOOKS.toast = realToast })

/* Monday's first flying line, addressed the way both surfaces address it. */
const F = () => DAYS[0].waves[0].formations[0]
const P = 'ff:0.0.0'

describe('a brief typed after its own take-off is refused', () => {
  it('the write is rejected, the model keeps the old value, and the reason is said', () => {
    const f: any = F()
    f.to = '08:40'; f.br = '07:00'
    expect(txtSet(`${P}.br`, '20:00'), 'the write is refused').toBe(false)
    expect(f.br, 'the model never moved').toBe('07:00')
    expect(said.join(' '), 'and it says why, naming the take-off').toMatch(/brief cannot be after the 08:40/i)
  })

  it('nothing is marked pending and nothing reaches the changes list', () => {
    const f: any = F()
    f.to = '08:40'; f.br = '07:00'
    txtSet(`${P}.br`, '20:00')
    expect(SCHED.pending[`${P}.br`], 'a refused write is not an amendment').toBeUndefined()
    expect(ELOG.rows.length, 'nor a line in the changes list').toBe(0)
  })

  it('an ordinary earlier brief still goes in', () => {
    const f: any = F()
    f.to = '08:40'; f.br = ''
    expect(txtSet(`${P}.br`, '07:10')).toBe(true)
    expect(f.br).toBe('07:10')
    expect(said, 'nothing to complain about').toEqual([])
  })

  it('a brief EQUAL to the take-off is left alone — the bar is "later", not "not earlier"', () => {
    const f: any = F()
    f.to = '08:40'; f.br = ''
    expect(txtSet(`${P}.br`, '08:40')).toBe(true)
    expect(f.br).toBe('08:40')
  })

  /* the legitimate case the roll exists for: a small-hours take-off briefs the
     PREVIOUS evening, so the clock reads later while the time is earlier */
  it('a small-hours take-off still accepts an evening brief', () => {
    const f: any = F()
    f.to = '00:30'; f.ld = '02:00'; f.br = ''
    expect(VCONF.briefLead, 'the roll only applies while the lead crosses midnight').toBeGreaterThan(30)
    expect(txtSet(`${P}.br`, '22:10'), 'accepted — it is the evening before').toBe(true)
    expect(f.br).toBe('22:10')
    expect(said).toEqual([])
  })

  /* a shift briefs nothing and every consumer gates on that first, so its B is
     inert either way — the guard must not start refusing values there */
  it('a standalone wave accepts anything typed in its inert B', () => {
    const w: any = DAYS[0].waves[0]
    w.standalone = true; w.kind = 'sc'
    const f: any = F()
    f.to = '07:00'; f.br = ''
    expect(txtSet(`${P}.br`, '19:00')).toBe(true)
    expect(f.br).toBe('19:00')
    expect(said).toEqual([])
  })
})

describe('moving the take-off earlier past an existing brief', () => {
  it('the take-off goes in, and the stranded brief is cleared with the reason said', () => {
    const f: any = F()
    f.to = '12:00'; f.br = '10:30'
    expect(txtSet(`${P}.to`, '09:00'), 'the take-off is never refused').toBe(true)
    expect(f.to).toBe('09:00')
    expect(f.br, 'the brief it stranded is cleared').toBe('')
    expect(said.join(' ')).toMatch(/10:30 brief was after the new take-off/i)
  })

  it('the clear goes through the funnel — marked pending, and in the changes list', () => {
    const f: any = F()
    f.to = '12:00'; f.br = '10:30'
    txtSet(`${P}.to`, '09:00')
    expect(SCHED.pending[`${P}.br`], 'the cleared brief is an amendment of its own').toBeTruthy()
    const r = elogFor(`${P}.br`)
    expect(r, 'and it is in the changes list').toBeTruthy()
    expect(r!.from).toBe('10:30')
    expect(r!.to, 'an emptied field logs as the placeholder the log prints').toBe('—')
  })

  it('a take-off that still sits after its brief leaves it alone', () => {
    const f: any = F()
    f.to = '12:00'; f.br = '10:30'
    expect(txtSet(`${P}.to`, '11:00')).toBe(true)
    expect(f.br, 'still a real brief').toBe('10:30')
    expect(said).toEqual([])
  })

  it('a take-off moving INTO the small hours keeps an evening brief, which now rolls', () => {
    const f: any = F()
    f.to = '03:00'; f.br = '22:10'                 // already the previous evening's brief
    expect(txtSet(`${P}.to`, '00:30')).toBe(true)
    expect(f.br, 'legitimate — the roll owns this case').toBe('22:10')
    expect(said).toEqual([])
  })

  it('a line with no brief at all is untouched by a retime', () => {
    const f: any = F()
    f.to = '12:00'; f.br = ''
    expect(txtSet(`${P}.to`, '09:00')).toBe(true)
    expect(txtGet(`${P}.br`)).toBe('')
    expect(said).toEqual([])
  })
})

describe('what the guard buys: the brief check cannot be silenced from the UI', () => {
  /* the audit's original repro, driven through the write path both surfaces
     use rather than by assigning to the model: the meeting keeps flagging,
     because the value that would have silenced it never lands. */
  it('a meeting inside the real brief slot keeps flagging after the typo is attempted', () => {
    const f: any = F()
    f.to = '08:40'; f.ld = '10:05'; f.br = ''
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 360, e: 450, type: 'Meeting', remarks: '', mod: '' })
    const flagged = () => validate().all
      .filter((x: any) => x.code === 'NO_BRIEF' && (x.who || []).includes('split') && x.di === 0).length
    expect(flagged(), 'it flags to begin with').toBeGreaterThan(0)
    expect(txtSet(`${P}.br`, '20:00'), 'the silencing value is refused').toBe(false)
    expect(flagged(), 'so the warning is still there').toBeGreaterThan(0)
  })
})
