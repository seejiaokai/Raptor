// @vitest-environment jsdom
/* D2005, THE TWO BLIND READS' FINDINGS, PINNED — part 2 (12 Nov 26): the crew list's two cross-day questions (days in a
   row, crew rest forward) and the dotted run mark agree with the validator, each day judged by its own settings. Written
   by the fresh Opus reader as proof tests, red on the first build. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './engine/data'
import { INPUTS } from './engine/inputs'
import { SCHED, setSign, setDayApproved } from './engine/publish'
import { VCONF, SHIFT_HARD } from './engine/rules'
import { HOOKS } from './engine/hooks'
import { validate, workingWarn, officialWarn, crossDayIfPlaced } from './engine/validate'
import { setSlotVal } from './engine/slots'
import { setSession } from './state/auth'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, s: { ...SHIFT_HARD }, val: HOOKS.validated }
const MON = 0, TUE = 1, WED = 2
const day = (di: number): any => DAYS[di]
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ws = (b: any, di: number) => (((b.byDay || [])[di] || {}).warns || []) as any[]
const has = (b: any, di: number, code: string, id?: string) => ws(b, di).some((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60, epBrief: 15, simDebrief: 30, amtDebrief: 30, simLen: 90, openEnd: 60, scDayFrom: 420, scDayTo: 1140 })
  Object.assign(SHIFT_HARD, saved.s)
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  setSession({ user: 'ad', role: 'admin' } as any)
})
afterEach(() => {
  HOOKS.validated = saved.val
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  Object.assign(SHIFT_HARD, saved.s)
  validate(); setSession(null)
})

describe('F3 — the run trace\'s words and the picker\'s run question read today\'s limit; the validator the judged day\'s', () => {
  it('a: the dotted run mark carries the words of the warning it points at', () => {
    HOOKS.validated = null
    VCONF.maxRun = 5
    for (const di of [0, 1, 2, 3, 4, 5]) day(di).waves.push(wave([form()]))
    day(1).waves[0].formations[0].aircraft[0].p = ''       // Tuesday off: a run of four, Wed..Sat
    publish(5)
    VCONF.maxRun = 6; validate()
    day(1).waves[0].formations[0].aircraft[0].p = 'bane'   // straight onto the array, then validate — six in a row ending Saturday
    validate()
    const satW = ws(workingWarn(), 5).find((w: any) => w.code === 'DAYS_RUN')
    const tr = (workingWarn().traces || []).filter((t: any) => t.w && t.w.code === 'DAYS_RUN' && t.w.di === 5)
    expect(!!satW, 'premise: Saturday (published at 5, untouched) breaks at six').toBe(true)
    expect(tr.map((t: any) => t.w.msg), 'every mark carries the warning\'s own words').toEqual(tr.map(() => satW.msg))
  })
  it('b: placing Ranger on Wednesday — the picker says what the validator then flags', () => {
    HOOKS.validated = null
    VCONF.maxRun = 5
    for (const di of [0, 1, 3, 4, 5]) day(di).waves.push(wave([form()]))
    day(WED).waves.push(wave([form({ aircraft: [ac('')] })]))
    publish(5)
    VCONF.maxRun = 6; validate()
    const said = crossDayIfPlaced('bane', `${WED}.0.0.0.p`)
    expect(setSlotVal(`${WED}.0.0.0.p`, 'bane')).toBe(true); validate()
    const flagged = has(workingWarn(), 5, 'DAYS_RUN', 'bane')
    expect({ flagged, pickerSays: said }, 'the picker and the validator agree').toEqual({ flagged, pickerSays: flagged ? expect.stringMatching(/day in a row/) : '' })
  })
  it('c: crew rest forward — placing Ranger on Monday\'s LATE before a Tuesday published at 13h, the setting since put back to 12h', () => {
    HOOKS.validated = null
    VCONF.crewRest = 13 * 60
    /* a crewman already on LATE: the picker clones his leg (an empty formation has nothing to clone and answers
       nothing by design — restIfPlaced, the drop's own check catching it after) */
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00', aircraft: [ac('', 'stiff')] })]))
    day(TUE).waves.push(wave([form({ br: '09:40' })]))
    publish(TUE)
    VCONF.crewRest = 12 * 60; validate()
    const said = crossDayIfPlaced('bane', `${MON}.0.0.0.p`)
    expect(setSlotVal(`${MON}.0.0.0.p`, 'bane')).toBe(true); validate()
    const flagged = has(workingWarn(), TUE, 'CREW_REST', 'bane')
    const onFace = has(officialWarn(), TUE, 'CREW_REST', 'bane')
    expect({ flagged, onFace, pickerSays: said }, 'the picker and the validator agree').toEqual({ flagged, onFace, pickerSays: flagged ? expect.stringMatching(/crew rest/) : '' })
  })
})
