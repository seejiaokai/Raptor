/* [WARN-HIDE-KEPT] (owner D469 / D472 / D475, 1 Oct 26) — A HIDDEN WARNING FLAGS NO PUCK AND IS NOT COUNTED: the engine
   half. "If it's hidden, the pucks shouldn't have flagging for that specific item." Every case runs the REAL validator
   on the demo week and hides through the working copy's own set, as the ✕ on a line does.
   Named for the plan (docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md §3.2) and its red team:
   - nothing hidden → the bundle every surface reads IS the raw one (the reference parity rests on this);
   - the replay, forced with nothing hidden, rebuilds the very maps the day loop wrote (Astra: the identity fast path
     proves nothing) — both demo weeks;
   - a hidden warning's flag goes and nobody else's; a man with two warnings keeps the flag of the one still showing;
     one warning naming four men drops all four chips; a hidden crew-rest breach drops the dotted mark on the day before;
   - the raw bundle is never touched (Fable F7) and the list keeps the warning at its index, carrying `off`;
   - a rename is not the situation changing; a different situation is. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DAYS } from './data'
import { PEOPLE } from './people'
import { validate, workingWarn, rawWarn, shownOf, sevOf, chipOf, traceOf, WARN } from './validate'
import { hideKey, shownWarns } from './warnhide'
import { markOrphans } from './markcheck'
import { weekBundle } from './weeks-data'
import { setCurWeek } from './waves'
import * as view from '../state/view'
import { setSession } from '../state/auth'

const DSNAP = JSON.stringify(DAYS)
const MON = 0, TUE = 1
const find = (di: number, code: string, id?: string) => ((rawWarn().byDay[di] || {}).warns || []).find((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
const hide = (w: any) => { view.WARNOFF.add(hideKey(w)); validate() }
const flagAgain = (w: any) => { view.WARNOFF.delete(hideKey(w)); validate() }
const pick = (b: any) => ({ sev: b.sev, chip: b.chip, dash: b.dash, trace: b.trace, fz: b.fz, lv: b.lv })

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' } as any)
  view.WARNOFF.clear(); validate()
})
afterEach(() => { view.WARNOFF.clear(); DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)); setCurWeek('13/07/2026'); validate() })

describe('nothing hidden — nothing changes', () => {
  it('the bundle every surface reads IS the raw one', () => {
    expect(workingWarn()).toBe(rawWarn())
    expect(WARN).toBe(rawWarn())
    expect(rawWarn().all.some((w: any) => 'off' in w)).toBe(false)
  })

  it('the replay, forced with nothing hidden, rebuilds the very maps the rules wrote — week 1', () => {
    const raw = rawWarn(), again = shownOf(raw, () => false, undefined, true)
    expect(again, 'the forced path really replays').not.toBe(raw)
    expect(pick(again)).toEqual(pick(raw))
    expect(again.byDay).toEqual(raw.byDay)
    expect(again.all).toEqual(raw.all)
  })

  it('…and week 2', () => {
    const wk2 = weekBundle('20/07/2026').days
    DAYS.length = 0; wk2.forEach((d: any) => DAYS.push(JSON.parse(JSON.stringify(d))))
    setCurWeek('20/07/2026'); validate()
    const raw = rawWarn(), again = shownOf(raw, () => false, undefined, true)
    expect(raw.marks.length, 'week 2 raises marks to replay').toBeGreaterThan(0)
    expect(pick(again)).toEqual(pick(raw))
  })

  it('every mark of both demo weeks belongs to a warning of its own day and code (the guard runs after every validate too)', () => {
    expect(markOrphans(rawWarn())).toEqual([])
    expect(rawWarn().marks.every((m: any) => !!m.code), 'no mark site is left without its warning code').toBe(true)
  })
})

describe('WH13 — the marks guard bites', () => {
  it('a mark filed under the wrong code, one naming no code, and a next-day mark whose warning is gone are each named', () => {
    const fake = {
      byDay: [{ di: 0, warns: [{ di: 0, code: 'DNIF_FLY', who: ['bane'], msg: 'm' }] }],
      marks: [{ k: 'sev', di: 0, id: 'bane', v: 'hard', code: 'INPUT_FLY' }, { k: 'chip', di: 0, id: 'bane', v: 'C' }, { k: 'chip', di: 0, id: 'bane', v: 'C', code: 'DNIF_FLY' }],
      traces: [{ pdi: 0, id: 'bane', t: {}, w: { di: 0, code: 'CREW_REST', who: ['bane'], msg: 'x' } }, { pdi: 6, id: 'bane', t: {}, w: { di: null, code: 'CREW_REST', who: ['bane'], msg: 'x' } }],
    }
    const bad = markOrphans(fake)
    expect(bad.length).toBe(3)
    expect(bad[0]).toMatch(/filed under INPUT_FLY/)
    expect(bad[1]).toMatch(/names no warning code/)
    expect(bad[2]).toMatch(/points at a CREW_REST warning on day 0 that is not there/)
  })
})

describe('WH3 (D469) — a hidden warning flags no puck', () => {
  it("Static's long work day, hidden: his ring and chip go, his line stays at its index carrying `off`, the raw warning is untouched", () => {
    const w = find(TUE, 'LONGDAY', 'wolf')
    expect(sevOf(TUE, 'wolf')).toBe('note'); expect(chipOf(TUE, 'wolf')).toBe('LD')
    const ix = rawWarn().byDay[TUE].warns.indexOf(w), n = rawWarn().byDay[TUE].warns.length
    hide(w)
    expect(sevOf(TUE, 'wolf'), 'no ring').toBeFalsy()
    expect(chipOf(TUE, 'wolf'), 'no chip').toBeFalsy()
    const shown = workingWarn().byDay[TUE].warns
    expect(shown.length, 'the list keeps every line').toBe(n)
    expect(shown[ix].off, 'the hidden one carries `off`, at its own index').toBe(true)
    expect(shown[ix]).not.toBe(w)
    expect('off' in w, 'the raw warning is never touched (Fable F7)').toBe(false)
    expect('off' in rawWarn().byDay[TUE].warns[ix], 'nor the raw bundle of the pass that hid it').toBe(false)
    expect(rawWarn().byDay[TUE].warns[ix].msg).toBe(w.msg)
    expect(shownWarns(shown).length, 'not counted (D472)').toBe(n - 1)
    expect(workingWarn().all.filter((x: any) => x.off).length, 'WARN.all carries the off copy').toBe(1)
    /* nobody else moved */
    expect(sevOf(TUE, 'salsa')).toBe('hard'); expect(chipOf(TUE, 'salsa')).toBe('C')
    expect(sevOf(TUE, 'casper')).toBe('hard')
    flagAgain(w)
    expect(sevOf(TUE, 'wolf')).toBe('note'); expect(chipOf(TUE, 'wolf')).toBe('LD')
    expect(workingWarn()).toBe(rawWarn())
  })

  it('a man with two warnings keeps the flag of the one still showing (Saint: the clash hidden → the amber of his brief)', () => {
    /* his red one — a clash with his appointment (an INPUT_FLY here; a DOUBLE_BOOK once the appointment has landed on
       the programme, as in the running app) — and his amber "no time for the brief" */
    const clash = rawWarn().byDay[TUE].warns.find((w: any) => w.sev === 'hard' && (w.who || []).includes('salsa')), brief = find(TUE, 'NO_BRIEF', 'salsa')
    expect(clash && brief).toBeTruthy()
    hide(clash)
    expect(sevOf(TUE, 'salsa'), 'red → amber').toBe('adv')
    expect(chipOf(TUE, 'salsa'), 'C → NB').toBe('NB')
    hide(brief)
    expect(sevOf(TUE, 'salsa')).toBeFalsy(); expect(chipOf(TUE, 'salsa')).toBeFalsy()
    flagAgain(clash)
    expect(sevOf(TUE, 'salsa')).toBe('hard'); expect(chipOf(TUE, 'salsa')).toBe('C')
  })

  it('one warning naming several men: hiding "4 people are double turning" drops every DT chip it raised, and nothing else', () => {
    const dt = find(MON, 'DT_SUM')
    expect(dt.who.length).toBeGreaterThan(1)
    const before = dt.who.map((id: string) => chipOf(MON, id))
    expect(before.includes('DT'), 'at least one of them wears the DT chip').toBe(true)
    hide(dt)
    dt.who.forEach((id: string, i: number) => {
      if (before[i] === 'DT') expect(chipOf(MON, id), `${id}'s DT chip goes`).toBeFalsy()
      else expect(chipOf(MON, id), `${id} keeps the higher chip of his other warning`).toBe(before[i])
    })
  })

  it("a hidden crew-rest breach drops its ring on the day AND the dotted mark on the day before (D475)", () => {
    const cr = find(TUE, 'CREW_REST', 'casper')
    expect(traceOf(MON, 'casper'), "Monday carries Outlaw's dotted mark").toBeTruthy()
    hide(cr)
    expect(sevOf(TUE, 'casper')).toBeFalsy()
    expect(traceOf(MON, 'casper'), 'the mark on the day before goes with it').toBeNull()
    flagAgain(cr)
    expect(traceOf(MON, 'casper')).toBeTruthy()
  })

  it('a hide of one warning leaves every unrelated next-day mark standing', () => {
    const before = JSON.stringify(rawWarn().trace)
    hide(find(TUE, 'LONGDAY', 'wolf'))
    expect(JSON.stringify(workingWarn().trace)).toBe(before)
  })
})

describe('WH10 — the key: tied to the situation, not to a label', () => {
  it('a rename of the man it names keeps the warning hidden', () => {
    const w = find(TUE, 'LONGDAY', 'wolf'), was = PEOPLE.wolf.cs
    hide(w)
    try {
      PEOPLE.wolf.cs = 'Statik'; validate()
      const now = find(TUE, 'LONGDAY', 'wolf')
      expect(now.msg, 'the words now carry the new callsign').toContain('Statik')
      expect(view.warnShown(now), 'still hidden').toBe(false)
      expect(sevOf(TUE, 'wolf')).toBeFalsy()
    } finally { PEOPLE.wolf.cs = was }
  })

  it('the key leads with the day, and a different day, rule, man or wording is a different warning', () => {
    const w = { di: 3, code: 'LONGDAY', who: ['wolf'], msg: `${PEOPLE.wolf.cs} has a long work day: 13h05` }
    expect(hideKey(w).split('|')[0]).toBe('3')
    expect(hideKey(w)).toContain('@wolf')
    expect(hideKey({ ...w, di: 4 })).not.toBe(hideKey(w))
    expect(hideKey({ ...w, code: 'TURN' })).not.toBe(hideKey(w))
    expect(hideKey({ ...w, who: ['bane'] })).not.toBe(hideKey(w))
    expect(hideKey({ ...w, msg: w.msg + ' → 14h00' })).not.toBe(hideKey(w))
  })
})
