// @vitest-environment jsdom
/* SCRATCH — the Fable read of D804, 13 Oct 26. Deleted before the read ends; never committed. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, signShown, setSign, dayPendingItems } from '../engine/publish'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { NOTICES } from '../state/notices'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { commitSetDayApproved } from '../state/sched-commit'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, inputWho, oilSignDay } from './inputedit'
import * as pops from './pops'
import { setDrag } from './drag'
import { answerOilWait, leaveOilWait } from './oilwait'
import { routeClick } from './interactions'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const SAT = 5
const SAT_ISO = '2026-07-18'
const toast = HOOKS.toast
let SAID: string[] = []

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  NOTICES.length = 0
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); view.disarmSlot()
  view.setOilWait(null); view.setOilBar(null)
  pops.setInpEdit(null); pops.setOilAsk(null)
  stashClear()
}
async function boot(be = new MemoryBackend()) {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')
  setPage('editsched'); setBoardDay(SAT)
  return wb
}
const TITLE = 'Range safety brief'
const rec = () => { const l = INPUTS.filter((x: any) => x.title === TITLE) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
const ground = () => ((DAYS[SAT] as any).ground || []) as any[]
const riOf = () => ground().findIndex((g: any) => g && g.src === String(inpId(rec())))
const DRAFT = (over: any = {}) => ({ ...draftOf({ person: 'bane', type: 'Other', title: TITLE, date: 'Jul 18', yr: 2026, allday: false, s: 840, e: 900, remarks: '' }), ...over })
const file = (ppl: string[], oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(over), ppl, oil ? { oil } : undefined)).toBe(true)
const press = (dest: 'g' | 'x' | 'u') => {
  const b = document.createElement('button')
  b.dataset.acc = dest; b.dataset.accd = String(SAT); b.dataset.acck = String(inpId(rec()))
  document.body.appendChild(b)
  try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
}
const sign = () => { const g = signOf(SAT); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const signed = () => { const g: any = signShown(SAT); return !!(g.cur && g.sked && g.plan && g.appr) }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''; setDrag(null) })

describe('scratch — D804 "→ Unavail" probes', () => {
  it('PUBLISHED day: asked, nothing pending and signed; answered, the filing waits to go out and the sign-offs fall; one Undo puts it all back', async () => {
    await boot()
    file(['bane'])
    expect(riOf()).toBeGreaterThanOrEqual(0)
    press('x')
    expect(rec().acc).toBe('r')
    sign(); commitSetDayApproved(SAT, true)
    /* the live boxes sign the NEXT issue — bound to the content as it stands now (setSign) */
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane'); setSign(SAT, 'plan', 'stiff'); setSign(SAT, 'appr', 'pump')
    expect(dayPendingItems(SAT).length, 'premise: nothing pending').toBe(0)
    expect(signed(), 'premise: signed').toBe(true)
    press('u')
    expect(view.OILWAIT!.kind).toBe('file')
    expect(dayPendingItems(SAT).length, 'asked: still nothing pending').toBe(0)
    expect(signed(), 'asked: still signed').toBe(true)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(rec().acc).toBe('u')
    const items = dayPendingItems(SAT)
    // eslint-disable-next-line no-console
    console.log('PENDING AFTER FILE+ANSWER:', JSON.stringify(items.map((x: any) => ({ k: x.kind, t: x.text || x.title || x.what })), null, 0))
    expect(items.length, 'answered: the filing waits to go out').toBeGreaterThan(0)
    expect(signed(), 'answered: sign-offs fall (D103)').toBe(false)
    globalUndo()
    expect(rec().acc, 'one Undo: taken off again').toBe('r')
    expect(rec().oil || {}).toEqual({})
    expect(dayPendingItems(SAT).length, 'and nothing pending again').toBe(0)
  })

  it('a SHARED Other: the question is headed for everyone; answered, the one record is under Unavailable with one answer', async () => {
    await boot()
    file(['pike', 'bane', 'split'])
    press('x')
    expect(rec().acc).toBe('r')
    press('u')
    expect(view.OILWAIT!.kind).toBe('file')
    expect(view.OILWAIT!.gate.who).toBe(inputWho(rec()))
    expect(view.OILWAIT!.lead).toBe(`Filing 3 people's ${TITLE} under Unavailable`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(rec().acc).toBe('u')
    expect(idsOf(rec()).map(String).sort()).toEqual(['bane', 'pike', 'split'])
    expect(rec().oil).toEqual({ [SAT_ISO]: 0.5 })
    expect(SAID.join(' | ')).toContain(`3 people's ${TITLE} filed under Unavailable`)
  })

  it('not answered then left under Unavailable another way: the "OIL?" sign still stands on a u-filed Other with no answer', async () => {
    await boot()
    file(['bane'])
    press('x'); press('u'); leaveOilWait()
    expect(rec().acc).toBe('r')
    // file it with a No, then take the No away by hand: the sign must read on a 'u' record
    press('u'); expect(answerOilWait({ [SAT_ISO]: 0 })).toBe(true)
    expect(rec().acc).toBe('u')
    expect(oilSignDay(rec()), 'a No is an answer: no sign').toBe('')
  })

  it('a CANCELLED Other (cx on the input) taken off and filed under Unavailable: is the OIL question asked for something that can never earn?', async () => {
    await boot()
    file(['bane'])
    const r = rec(); r.cx = true; r.cxr = 'WX'
    press('x')
    expect(rec().acc).toBe('r')
    press('u')
    // eslint-disable-next-line no-console
    console.log('CX CASE — question asked?', !!view.OILWAIT, 'acc:', rec().acc)
  })
})
