// @vitest-environment jsdom
/* THE AMENDMENT BATCH, driven through the whole app (25 Sep 26, D112) — the gestures: "N pending ▾" opens the list
   of what will go out and a row takes the view to its change (D99, D100); Edit history's row lands on the page you
   are on and never opens the board from Edit Schedule (D107). jsdom has no layout, so WHERE things land on screen
   is the walk's (docs/handpass/2026-09-25-amendment-batch.md) and e2e's question; this pins what each gesture does. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot } from '../state/store'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { elogClear } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { setHistList } from './pops'
import { closePendList } from './pendlist'
import { openScheduler, closeScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (s: string) => document.querySelector(s) as HTMLElement | null
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const settle = async () => act(async () => { await new Promise(r => setTimeout(r, 20)) })
const MON = 0
let host: HTMLDivElement, root: Root, pristine: string
const toasts: string[] = []

beforeAll(async () => {
  initStore()
  pristine = JSON.stringify(DAYS)
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterAll(async () => {
  closePendList()
  await act(async () => { root.unmount() })
  host.remove()
})
/* Monday published with the OPS-O desk empty; then Mamba moved from SDO to OPS-O through the app's own write —
   his D109 case, which is one change waiting to go out */
beforeEach(async () => {
  closePendList(); toasts.length = 0
  await act(async () => {
    DAYS.length = 0; JSON.parse(pristine).forEach((d: any) => DAYS.push(d))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
    SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
    view.DPREV.clear(); view.VWORK.clear()
    if (view.SBDAY != null) view.setBoardDay(null)
    view.setPage('editsched')
    elogClear()
    writeSlot(`d:${MON}.0.2`, '')
    const g = signOf(MON); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(MON, true)
    writeSlot(`d:${MON}.0.2`, 'mamba'); writeSlot(`d:${MON}.0.0`, '')
    notify()
  })
})

const monHead = () => $(`#eWeek .day[data-day="${MON}"] .day-head`)

describe('"N pending ▾" opens what will go out, and a row takes the view there (D99, D100, D104)', () => {
  it('the day head\'s count is a button on the edit week, and the list names the one change — who moved, from where to where', async () => {
    const btn = monHead()?.querySelector('[data-pendlist]') as HTMLElement
    expect(btn, 'the count is a button').toBeTruthy()
    expect(btn.textContent).toMatch(/^1\s*pending/)
    await click(btn)
    const list = $('#pendList')
    expect(list, 'the list is open').toBeTruthy()
    expect(list!.querySelector('.pl-head')?.textContent).toMatch(/Waiting to go out as AL1 · 1 change$/)
    const rows = list!.querySelectorAll('.pl-item')
    expect(rows.length).toBe(1)
    const t = rows[0]!.textContent || ''
    expect(t).toContain(PEOPLE.mamba.cs)
    expect(t).toContain('SDO'); expect(t).toContain('OPS-O')
    expect(rows[0]!.querySelector('.pl-who')?.textContent, 'made in this sitting: who and when, not "earlier"').not.toMatch(/earlier/)
  })

  it('a change the edit record does not hold (made before this page was opened) reads "earlier" (D100\'s mock-up)', async () => {
    elogClear()
    await click(monHead()!.querySelector('[data-pendlist]'))
    expect($('#pendList .pl-who')?.textContent).toBe('earlier')
  })

  it('a tap on the row closes the list and marks the change ON THE WEEK — it never opens the board (D107)', async () => {
    await click(monHead()!.querySelector('[data-pendlist]'))
    await click($('#pendList button.pl-item'))
    expect($('#pendList'), 'the list closes').toBeNull()
    await settle()
    expect(view.SBDAY, 'still on Edit Schedule').toBeNull()
    const seat = $(`#eWeek .day[data-day="${MON}"] [data-slot="d:${MON}.0.2"]`)
    expect(seat?.classList.contains('chgflash'), 'the OPS-O desk wears the brief mark').toBe(true)
  })

  it('a tap anywhere outside closes it, and so does Escape (the standing popup rule)', async () => {
    await click(monHead()!.querySelector('[data-pendlist]'))
    await act(async () => { document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })) })
    expect($('#pendList')).toBeNull()
    await click(monHead()!.querySelector('[data-pendlist]'))
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect($('#pendList')).toBeNull()
  })

  it('the count stays a plain chip where the list does not belong: View-only Sched, a preview, a draft day', async () => {
    await act(async () => { view.VWORK.add(MON); view.setPage('viewsched'); notify() })
    const vh = $(`#vWeek .day[data-day="${MON}"] .day-head`)
    expect(vh?.querySelector('.dpend'), 'the viewer\'s working-draft peek shows the count').toBeTruthy()
    expect(vh?.querySelector('[data-pendlist]'), '…but it is not the scheduler\'s button').toBeNull()
    await act(async () => { view.VWORK.clear(); view.setPage('editsched'); notify() })
    await act(async () => { view.setDayPreview(MON, SCHED.orig[MON].id); notify() })
    expect(monHead()?.querySelector('[data-pendlist]'), 'under a preview').toBeNull()
    await act(async () => { view.setDayPreview(MON, null); notify() })
    await act(async () => { writeSlot('d:1.0.0', ''); notify() })       // Tuesday is a draft day
    expect($(`#eWeek .day[data-day="1"] .day-head [data-pendlist]`), 'a draft day').toBeNull()
  })
})

describe('Edit history keeps him on the page he is on (D107)', () => {
  it('from Edit Schedule a row goes to the change on the WEEK, marks it, and does not open the board', async () => {
    await act(async () => { view.setHistMode(true); setHistList('all'); notify() })
    const row = $$('#histBody [data-hkey]').find(b => b.dataset.hkey === `d:${MON}.0.2`)
    expect(row, 'the OPS-O change is a button').toBeTruthy()
    await click(row!)
    await settle()
    expect(view.SBDAY, 'the board did not open').toBeNull()
    expect($(`#eWeek .day[data-day="${MON}"] [data-slot="d:${MON}.0.2"]`)?.classList.contains('chgflash')).toBe(true)
    await act(async () => { view.setHistMode(false); notify() })
  })
})

describe('a phone keyboard never shows the page behind the board (item 11, his bug report 25 Sep 26)', () => {
  it('the board follows the visible area as the keyboard shrinks and pans it, and the page behind is not painted', async () => {
    const vv: any = new EventTarget(); Object.assign(vv, { offsetTop: 0, offsetLeft: 0, height: 800, width: 390, scale: 1 })
    const had = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    try {
      await act(async () => { openScheduler(MON); notify() })
      const b = $('#schedBoard')!
      expect(b.style.height, 'sized to what is visible').toBe('800px')
      expect(document.body.classList.contains('sb-open'), 'the page behind is not painted').toBe(true)
      vv.offsetTop = 120; vv.height = 420                        // the keyboard comes up and the view pans
      await act(async () => { vv.dispatchEvent(new Event('resize')); vv.dispatchEvent(new Event('scroll')) })
      expect(b.style.top).toBe('120px'); expect(b.style.height).toBe('420px')
      vv.scale = 2                                               // a pinch zoom is left alone
      await act(async () => { vv.dispatchEvent(new Event('resize')) })
      expect(b.style.height, 'zoomed with the page, as always').toBe('')
      await act(async () => { closeScheduler(); notify() })
      expect(document.body.classList.contains('sb-open')).toBe(false)
    } finally {
      if (had) Object.defineProperty(window, 'visualViewport', had); else delete (window as any).visualViewport
    }
  })
})
