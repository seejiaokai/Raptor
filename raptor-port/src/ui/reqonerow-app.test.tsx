// @vitest-environment jsdom
/* ONE REQUEST, ONE ROW, driven through the whole app (owner, D175, 25 Sep 26) — the two doors a scheduler taps on the
   day's preview banner: "Load onto working copy" on an issued version, and "Switch to this plan" on a parked plan. Each
   must leave out a row whose request now stands on another day, and SAY so in the sentence it shows and records in Edit
   history. The engine half is pinned in reqonerow.test.tsx; this pins the words each door says. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { acceptInput, unacceptInput } from '../engine/slots'
import { draftDup, dayDrafts } from '../engine/drafts'
import { SCHED, signOf, setDayApproved, dayCurVer } from '../engine/publish'
import { elogClear, elogRows } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const click = async (el: Element | null | undefined) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const MON = 0, TUE = 1
let host: HTMLDivElement, root: Root, pristine: string, inputs0: string
const toasts: string[] = []
const publishDay = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }
/* a Meeting for Bane on Monday and Tuesday, accepted onto Monday */
const twoDay = () => {
  const inp: any = { person: 'bane', date: 'Jul 13', endDate: 'Jul 14', allday: true, type: 'Meeting', remarks: 'req one row app', mod: '2026-07-01' }
  INPUTS.push(inp); acceptInput(MON, inp, 'g'); return inp
}
const rowsOf = (inp: any) => DAYS.flatMap((d: any, di: number) => ((d && d.ground) || []).filter((r: any) => r && r.src === inpId(inp)).map(() => di))

beforeAll(async () => {
  initStore()
  pristine = JSON.stringify(DAYS); inputs0 = JSON.stringify(INPUTS)
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched'))
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  toasts.length = 0
  await act(async () => {
    DAYS.length = 0; JSON.parse(pristine).forEach((d: any) => DAYS.push(d))
    INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
    SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
    view.DPREV.clear(); view.VWORK.clear(); view.setRestArm(null, null)
    view.setPage('editsched')
    elogClear()
    notify()
  })
})

describe('the doors say which request\'s row they left out, and where it stands (D175)', () => {
  it('"Load onto working copy": one tap (nothing to discard), the row stays out, and the sentence names it', async () => {
    const inp = twoDay()
    await act(async () => { publishDay(MON); publishDay(TUE); unacceptInput(MON, inp); acceptInput(TUE, inp, 'g'); notify() })
    await act(async () => { view.setDayPreview(MON, dayCurVer(MON)); notify() })
    const rst = $$('button[data-restore]').find(b => b.dataset.restore === String(MON))
    expect(rst?.textContent, 'nothing the load would discard, so no second tap').not.toMatch(/Discard/)
    await click(rst)
    expect(rowsOf(inp), 'one request, one row').toEqual([TUE])
    const said = toasts.join(' | ')
    expect(said).toMatch(/loaded onto the working copy/)
    expect(said, 'whose, what and where').toContain(`${(PEOPLE as any).bane.cs} · Meeting left out — it is on Tuesday's programme`)
    expect(elogRows()[0]?.lbl, 'the same sentence in Edit history').toContain('left out — it is on Tuesday')
  })
  it('"Switch to this plan" on the preview banner: the plan\'s copy of the row stays out, and the sentence names it', async () => {
    const inp = twoDay()
    await act(async () => { draftDup(MON); unacceptInput(MON, inp); acceptInput(TUE, inp, 'g'); notify() })
    const planA = dayDrafts(MON)[0]!
    await act(async () => { view.setDayPreview(MON, 'd:' + planA.id); notify() })
    const go = $$('button[data-draftgo]').find(b => b.dataset.draftgo === String(MON) && b.dataset.draftid === planA.id)
    await click(go)
    expect(rowsOf(inp)).toEqual([TUE])
    expect(toasts.join(' | ')).toMatch(/switched to plan[\s\S]*Meeting left out — it is on Tuesday's programme/)
  })
  /* the plan editor's "Select" — its own door (Astra's roll-call row, 25 Sep 26): the day's plans selector → ✎ → Select */
  it('the plan editor\'s "Select": the same leave-out, the same sentence', async () => {
    const inp = twoDay()
    await act(async () => { draftDup(MON); unacceptInput(MON, inp); acceptInput(TUE, inp, 'g'); notify() })
    const planA = dayDrafts(MON)[0]!
    await click($$(`#eWeek [data-planmenu="${MON}"]`)[0])
    await click($$(`.wavemenu [data-planedit="${planA.id}"]`)[0])
    const sel = $$('#draftsModal button').find(b => b.textContent === 'Select')
    await click(sel)
    expect(rowsOf(inp)).toEqual([TUE])
    expect(toasts.join(' | ')).toMatch(/Switched to "Plan A"[\s\S]*Meeting left out — it is on Tuesday's programme/)
    await click($$('#draftsModal button').find(b => b.textContent === 'Done'))
  })
})
