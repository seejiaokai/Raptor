// @vitest-environment jsdom
/* THE LOAD'S MESSAGE WITH A MEMBER'S INPUT PENDING ([LEAVE-LATE-PUBLISHED], Fable's code read F5; the host's walk, 26 Sep
   26). A load ("Load onto working copy") never puts back a member's input — it is his record, and may cover other days —
   so the day still reads it pending afterwards, and the message must say why. Two doors, both driven through the real
   App's own button (data-restore on the preview bar):
     · nothing of the scheduler's to discard → the load short-circuits with "<day> is already at <version>", which read
       untrue beside "1 pending" until it said the input stays pending (the walk found this — the load's own sentence
       never ran);
     · a scheduler's edit as well → the load arms, then runs, and its sentence ends with the same clause. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayCurVer, dayShownPendCount } from '../engine/publish'
import { txtSet } from '../engine/slots'
import { validate } from '../engine/validate'
import { DPREV, VWORK, setDayPreview } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { commitNewInput } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
let pristine: string, inputs0: string
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const withToasts = async (fn: () => Promise<void>) => {
  const toasts: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  try { await fn() } finally { HOOKS.toast = real }
  return toasts
}
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const publish = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w; setDayApproved(di, true); validate() }
const leave = (remarks: string) => ({ person: 'salsa', type: 'LL', allday: true, half: '', start: '2026-07-13', end: '', sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
const loadBtn = () => $('#eWeek .day[data-day="0"] button[data-restore="0"]')

beforeAll(async () => {
  initStore()
  pristine = JSON.stringify(DAYS); inputs0 = JSON.stringify(INPUTS)
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click([...document.querySelectorAll('.nav a[data-page]')].find(a => (a as HTMLElement).dataset.page === 'editsched')!)
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(pristine).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  await act(async () => { validate(); notify() })
})

describe('"Load onto working copy" says a member\'s input change stays pending (Fable F5)', () => {
  it('only the member\'s leave pending: "already at Original" says the leave stays pending, and the day still reads 1', async () => {
    publish(0)
    expect(commitNewInput(leave('LOAD WALK LEAVE'))).toBe(true)
    await act(async () => { validate(); notify() })
    expect(dayShownPendCount(0)).toBe(1)
    await act(async () => { setDayPreview(0, dayCurVer(0)); notify() })
    const said = await withToasts(async () => { await click(loadBtn()) })
    expect(said.join(' | ')).toMatch(/Monday is already at Original · 1 member input changed since stays pending/)
    expect(dayShownPendCount(0)).toBe(1)
  })

  it('a scheduler\'s edit as well: the load runs, and its sentence ends with the same clause', async () => {
    publish(0)
    expect(commitNewInput(leave('LOAD WALK LEAVE 2'))).toBe(true)
    await act(async () => { txtSet('dn:0.0', 'A SCHEDULER EDIT'); validate(); notify() })
    await act(async () => { setDayPreview(0, dayCurVer(0)); notify() })
    const said = await withToasts(async () => {
      await click(loadBtn())                                        // arms (an edit would be discarded)
      if (loadBtn()) await click(loadBtn())                         // confirms
    })
    expect(said.join(' | ')).toMatch(/Original loaded onto the working copy.*1 member input changed since stays pending/)
    expect(dayShownPendCount(0), 'the scheduler\'s edit gone, the member\'s leave still waiting').toBe(1)
  })
})
