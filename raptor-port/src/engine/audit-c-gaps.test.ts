/* AUDIT C — the seven MISSING-TEST gaps HANDOFF's 11 Aug input↔schedule sweep
   left open. Each block names its gap letter. Engine-boundary throughout:
   commitInputEdit / setInpField are driven directly (agent E owns the dialog).
   New file only — no source or existing test is touched. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, DATES, inputCoversDate } from './inputs'
import { inpKey, acceptInput, acceptedDay } from './slots'
import { validate } from './validate'
import { slotBar } from './avail'
import { dayOff } from './avail'
import { SCHED } from './publish'
import { HOOKS } from './hooks'
import { commitInputEdit, setInpField, draftOf } from '../ui/inputedit'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let toasts: string[] = []
const origToast = HOOKS.toast
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  toasts = []; HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  validate()
})
afterEach(() => { HOOKS.toast = origToast })

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))
const groundRowsWith = (key: string) => {
  const out: any[] = []
  DAYS.forEach((d: any, di: number) => ((d.ground || []) as any[]).forEach(r => { if (r.src === key) out.push({ di, r }) }))
  return out
}

/* ---- (a) commitInputEdit's keep / "moved outside the programmed week" ---- */
describe('gap (a): the accepted-row relink branches of commitInputEdit', () => {
  const seed = () => {
    INPUTS.push({ person: 'split', date: 'Jul 15', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'audit', mod: '' })
    const r = INPUTS[INPUTS.length - 1]
    // accepted onto Jul 16 (di 3) — NOT its start date, which is the trap acceptedDay exists for
    expect(acceptInput(3, r, 'g')).toBe(true)
    expect(acceptedDay(r)).toBe(3)
    return r
  }

  it('keep: an edit that still covers the accepted day keeps the row on THAT day', () => {
    const r = seed()
    const d = draftOf(r)
    d.start = '2026-07-14'            // Jul 14–17 still covers Jul 16
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.acc).toBe('g')
    expect(acceptedDay(r)).toBe(3)    // stayed on Jul 16, not moved to the new start date
    expect(groundRowsWith(inpKey(r)).length).toBe(1)
  })

  it('no keep: an edit off the accepted day moves the row to the new start date', () => {
    const r = seed()
    const d = draftOf(r)
    d.start = '2026-07-13'; d.end = '' // Jul 13 only — no longer covers Jul 16
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.acc).toBe('g')
    expect(acceptedDay(r)).toBe(0)
    expect(groundRowsWith(inpKey(r)).length).toBe(1)
  })

  it('moved outside the programmed week: row removed, no longer accepted, and it SAYS so', () => {
    const r = seed()
    const d = draftOf(r)
    d.start = '2026-07-20'; d.end = '' // past the last loaded DATES entry
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.acc).toBeUndefined()
    expect(groundRowsWith(inpKey(r))).toEqual([])
    // the toast string HANDOFF says only its definition mentions
    expect(toasts.some(t => /Moved outside the programmed week/.test(t)), toasts.join('|')).toBe(true)
  })
})

/* ---- (b) an endDate past the last loaded DATES entry ---------------------- */
describe('gap (b): an input whose endDate runs past the loaded week', () => {
  it('covers the loaded days it reaches and clamps at the week edge, without crashing', () => {
    DAYS[6].dutywaves[0].rows.push({ role: 'SXO', id: 'split', str: '0900', end: '1200' })
    INPUTS.push({ person: 'split', date: 'Jul 18', endDate: 'Jul 25', allday: true, type: 'OL', remarks: '', mod: '' })
    const r = INPUTS[INPUTS.length - 1]
    expect(inputCoversDate(r, 'Jul 18')).toBe(true)
    expect(inputCoversDate(r, 'Jul 19')).toBe(true)   // the last loaded day
    expect(inputCoversDate(r, 'Jul 17')).toBe(false)
    expect(() => validate()).not.toThrow()
    const h = hits('LEAVE_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.every((x: any) => x.di === 6)).toBe(true)
    expect(dayOff(DAYS[6]).has('split')).toBe(true)
    const bar = slotBar('split', `d:6.0.${DAYS[6].dutywaves[0].rows.length - 1}`)
    expect(bar, bar).toBeTruthy()
  })

  it('a span entirely beyond the week covers nothing and raises nothing', () => {
    DAYS[6].dutywaves[0].rows.push({ role: 'SXO', id: 'split', str: '0900', end: '1200' })
    INPUTS.push({ person: 'split', date: 'Jul 21', endDate: 'Jul 25', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(() => validate()).not.toThrow()
    expect(hits('LEAVE_FLY', 'split')).toEqual([])
    expect(dayOff(DAYS[6]).has('split')).toBe(false)
  })
})

/* ---- (c) two overlapping inputs for one person ---------------------------- */
describe('gap (c): two overlapping inputs for one person', () => {
  it('two DIFFERENT overlapping inputs each raise their own warning against the same sortie', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OML', remarks: '', mod: '' })
    const W = validate()
    // one voice per input — leave says leave, the downchit says downchit; sane
    expect(hits('LEAVE_FLY', 'split').length).toBeGreaterThan(0)
    expect(hits('DNIF_FLY', 'split').length).toBeGreaterThan(0)
    // and the two inputs are never reported as clashing with EACH OTHER
    const interInput = W.all.filter((x: any) => (x.who || []).includes('split')
      && x.code === 'DOUBLE_BOOK')
    expect(interInput, JSON.stringify(interInput)).toEqual([])
  })

  it('two IDENTICAL overlapping inputs collapse to one warning (the dedup)', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1).length).toBe(1)
  })
})

/* ---- (d) a genuine half-day against a sortie's brief window --------------- */
describe('gap (d): an AM/PM half-day record through validate()', () => {
  it('AM leave eats the brief window of an early-afternoon sortie — advisory only', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '13:30'; f.ld = '14:30'; f.br = ''
    f.aircraft[0].p = 'split'
    // a REAL half-day record, exactly as the span picker writes one
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 0, e: 720, half: 'am', type: 'LL', remarks: '', mod: '' })
    const nb = hits('NO_BRIEF', 'split').filter((x: any) => x.di === 1)
    expect(nb.length, JSON.stringify(nb)).toBeGreaterThan(0)
    expect(nb.some((x: any) => /LL/.test(x.msg))).toBe(true)
    // the padded occupied window opens 12:30, after the AM half ends — no hard flag
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1)).toEqual([])
  })

  it('PM leave stays clear of a morning sortie that is all done by noon', () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '09:00'; f.ld = '10:00'; f.br = ''
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 721, e: 1439, half: 'pm', type: 'LL', remarks: '', mod: '' })
    const mine = validate().all.filter((x: any) => (x.who || []).includes('split') && x.di === 1
      && x.code !== 'LONGDAY')
    expect(mine, JSON.stringify(mine)).toEqual([])
  })
})

/* ---- (e) a TIMED tomorrow input inside a night sortie's debrief window ---- */
describe('gap (e): the midnight tail reaches the DEBRIEF window for every type', () => {
  const nightSortie = () => {
    const f = DAYS[0].waves[0].formations[0]
    f.to = '22:30'; f.ld = '00:30'; f.br = ''         // lands 00:30, debrief till 02:30
    f.aircraft[0].p = 'split'
    return f
  }

  it('a tomorrow Meeting 01:00–02:00 sits inside the debrief tail — DEBRIEF fires', () => {
    nightSortie()
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 60, e: 120, type: 'Meeting', remarks: '', mod: '' })
    const h = hits('DEBRIEF', 'split').filter((x: any) => x.di === 0)
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => /Meeting/.test(x.msg))).toBe(true)
  })

  it('a tomorrow timed OML in the same tail also fires DEBRIEF (not only the LEAVE/DNIF pins)', () => {
    nightSortie()
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 60, e: 120, type: 'OML', remarks: '', mod: '' })
    const h = hits('DEBRIEF', 'split').filter((x: any) => x.di === 0)
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
  })

  it('a tomorrow input starting exactly when the debrief ends stays quiet (half-open)', () => {
    nightSortie()                                      // debrief window 00:30–02:30 tomorrow
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 150, e: 240, type: 'Meeting', remarks: '', mod: '' })
    expect(hits('DEBRIEF', 'split').filter((x: any) => x.di === 0)).toEqual([])
  })
})

/* ---- (f) halfOf's PM boundary through the in-place cells ------------------ */
describe("gap (f): halfOf's boundaries through setInpField", () => {
  const seed = () => {
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'LL', remarks: '', mod: '' })
    return INPUTS[INPUTS.length - 1]
  }

  it('12:01–23:59 typed into the cells derives the PM label', () => {
    const r = seed()
    expect(setInpField(r, 'end', '23:59')).toBe(true)   // all-day → timed, start defaults to 00:00
    expect(r.s).toBe(0); expect(r.e).toBe(1439); expect(r.half).toBeUndefined()
    expect(setInpField(r, 'str', '12:01')).toBe(true)
    expect(r.s).toBe(721)
    expect(r.half).toBe('pm')
  })

  it('12:00–23:59 is NOT the PM half — the label clears at the boundary', () => {
    const r = seed()
    setInpField(r, 'end', '23:59')
    setInpField(r, 'str', '12:01')
    expect(r.half).toBe('pm')
    expect(setInpField(r, 'str', '12:00')).toBe(true)
    expect(r.half).toBeUndefined()
  })

  it('00:00–12:00 derives AM; nudging the end off the boundary clears it', () => {
    const r = seed()
    setInpField(r, 'str', '00:00')                      // → 00:00–23:59, no half
    expect(setInpField(r, 'end', '12:00')).toBe(true)
    expect(r.half).toBe('am')
    expect(setInpField(r, 'end', '12:01')).toBe(true)
    expect(r.half).toBeUndefined()
  })
})

/* ---- (g) an accepted input reassigned to a different person --------------- */
describe('gap (g): reassigning an accepted input to another person', () => {
  it('relinks the ground row to the new person — one row, new callsign, still accepted', () => {
    INPUTS.push({ person: 'split', date: 'Jul 15', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'audit', mod: '' })
    const r = INPUTS[INPUTS.length - 1]
    expect(acceptInput(2, r, 'g')).toBe(true)
    expect(groundRowsWith(inpKey(r))[0].r.who).toBe('Split')
    const d = draftOf(r)
    d.person = 'plasma'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.acc).toBe('g')
    expect(r.person).toBe('plasma')
    const rows = groundRowsWith(inpKey(r))
    expect(rows.length).toBe(1)                         // no orphan under the old key
    expect(rows[0].r.who).toBe('Plasma')
    // no ground row anywhere still points at the OLD content key
    const oldKey = `split|Jul 15|Meeting|600`
    expect(groundRowsWith(oldKey)).toEqual([])
    // and the validator now judges the NEW man against the row's hours
    DAYS[2].waves[0].formations[0].aircraft[0].w = 'plasma'
    const h = validate().all.filter((x: any) => (x.who || []).includes('plasma') && x.di === 2 && x.code === 'DOUBLE_BOOK')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
  })
})
