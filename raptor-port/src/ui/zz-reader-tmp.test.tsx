// @vitest-environment jsdom
/* THROWAWAY — a blind reader's proof, deleted after the run */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, setSign, setDayApproved, dayPendingItems, daySigned } from '../engine/publish'
import { validate, officialWarn, officialRaw, workSpan } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { buildDay } from '../engine/events'
import { fltOilWin } from '../engine/oil'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { VCONF } from '../engine/rules'

const FRI = 4
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true); validate() }
const signBound = (di: number) => { for (const [r, w] of FOUR) setSign(di, r, w) }
const line = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '08:00', ld: '15:30', br: '', rl: '', aircraft: [{ p: 'salsa', w: 'freak', rmks: '', opts: {} }], ...o })
const addVL = (intimes: string[], f: any = {}) => (DAYS[FRI] as any).waves.push({ label: 'FIRST WAVE', intimes, formations: [line(f)] })
const ld = (b: any, id: string) => (((b.byDay[FRI] || {}).warns || []) as any[]).find((w: any) => w.code === 'LONGDAY' && w.who.includes(id))

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('reader proof', () => {
  it('engine-rules.md says a published day "reads nothing pending" for the long-day note — a Logic default-rally change makes it pending', () => {
    addVL([])
    validate()
    publishDay(FRI); signBound(FRI)
    expect(daySigned(FRI)).toBe(true)
    expect(dayPendingItems(FRI).length).toBe(0)
    expect(ld(officialWarn(), 'salsa').msg).toContain('12h30')
    const was = VCONF.reportLead
    try {
      VCONF.reportLead = 120
      validate()
      console.log('FACE:', ld(officialWarn(), 'salsa')?.msg)
      console.log('RAW :', ld(officialRaw(), 'salsa')?.msg)
      console.log('PEND:', JSON.stringify(dayPendingItems(FRI).map((x: any) => x.kind)), 'signed:', daySigned(FRI))
      console.log('INSIGHTS salsa mins:', (computeInsights().hours.find((h: any) => h.id === 'salsa') || {}).mins)
      // the doc's claim
      expect(dayPendingItems(FRI).some((x: any) => x.kind === 'warn'), 'doc: "the day reads nothing pending for it"').toBe(false)
    } finally { VCONF.reportLead = was; validate() }
  })

  it('contrast: the same day with an in-time typed — the Logic change makes nothing pending', () => {
    addVL(['05:00 IN TIME'])
    validate()
    publishDay(FRI); signBound(FRI)
    const was = VCONF.reportLead
    try {
      VCONF.reportLead = 120
      validate()
      console.log('CONTRAST PEND:', JSON.stringify(dayPendingItems(FRI).map((x: any) => x.kind)), 'signed:', daySigned(FRI))
      expect(dayPendingItems(FRI).some((x: any) => x.kind === 'warn')).toBe(false)
    } finally { VCONF.reportLead = was; validate() }
  })

  it('no landing typed: work span counts reportLead + debrief, OIL counts nothing', () => {
    const wv = { label: 'FIRST WAVE', intimes: [], formations: [line({ to: '12:00', ld: '' })] }
    const b = buildDay({ dow: 'Fri', dt: 'Jul 17', waves: [wv], sims: { amt: [], oft: [] }, dutywaves: [], ground: [], allhands: [] }, 4, 'Jul 18', 'Jul 16')
    const w = workSpan(b.events.filter((e: any) => e.id === 'salsa'))
    const oil = fltOilWin(wv, wv.formations[0], VCONF.reportLead, VCONF.debrief)
    console.log('NO LANDING span:', JSON.stringify(w && { s: w.s, e: w.e, span: w.span }), 'oil:', JSON.stringify(oil))
    expect(w == null ? null : [w.s, w.e]).toEqual(oil)
  })
})
