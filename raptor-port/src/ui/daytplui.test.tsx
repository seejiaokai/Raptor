// @vitest-environment jsdom
/* Whole-day schedule templates — the UI half. The board's own "Templates"
   control, the edit week's day-sign strip entry point, the one popMenu-idiom
   picker both share (board.ts's dayTplMenu), and the manage modal
   (DayTplModal.tsx). Driven through the real App, the same shape
   board.test.tsx and editweek.test.tsx already use, so the render/role gates
   are exercised end to end rather than through a component mounted in
   isolation. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayApproved } from '../engine/publish'
import { DAYTPL_CFG, dayTplReset } from '../engine/daytpl'
import { HOOKS } from '../engine/hooks'
import { boardHTML } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
/* document-scoped, not host-scoped — the picker's .wavemenu box (popMenu,
   board.ts) is appended straight to document.body, outside the mounted App
   tree, the same reason board.test.tsx's own $/$$ read off document. */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const type = async (el: Element, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

/* the library is a persisted singleton — start every describe block from
   nothing so one test's saved template cannot leak into the next's assertion
   about an empty picker */
const resetLib = async () => { dayTplReset(); await act(async () => { notify() }) }

describe('the board entry point', () => {
  it('a Templates control sits at the top of the board content, in edit mode', async () => {
    await resetLib()
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect($('#sbBoard [data-daytpladd="0"]')).toBeTruthy()
  })

  it('is not rendered once editMode() goes false, even though the role is still admin', () => {
    const real = HOOKS.editMode
    HOOKS.editMode = () => false
    try {
      expect(boardHTML(0)).not.toContain('data-daytpladd=')
    } finally {
      HOOKS.editMode = real
    }
  })

  it('renders in edit mode (sanity, unchanged)', () => {
    expect(boardHTML(0)).toContain('data-daytpladd=')
  })
})

describe('the edit week entry point', () => {
  it('the day-head carries a Templates button, one per day', async () => {
    await resetLib()
    /* live days only — jsdom's default desktop width also mounts the inert
       next-week peek preview (ui/peek.ts), which carries no day-head controls.
       Templates + Drafts moved from the sign-off strip into the day-head's
       .dhtpl span (owner, 24 Aug 26). */
    expect($$('#eWeek .day-head .dhtpl [data-daytplopen]').length).toBe($$('#eWeek .day:not(.peek)').length)
  })

  it('the view-only page renders no day-sign strip at all, so no entry point either', async () => {
    await act(async () => { setPage('viewsched'); notify() })
    expect($('#vWeek .signoff.day-sign')).toBeFalsy()
    expect($('#vWeek [data-daytplopen]')).toBeFalsy()
    expect($('#vWeek [data-daytpladd]')).toBeFalsy()
    await act(async () => { setPage('editsched'); notify() })
  })
})

describe('the picker (dayTplMenu, opened from either entry point)', () => {
  it('an empty library offers only Save and Manage', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    expect($('.wavemenu').textContent).toContain('No saved templates yet')
    expect($('.wavemenu [data-daytplsave]')).toBeTruthy()
    expect($('.wavemenu [data-daytpledit]')).toBeTruthy()
    expect($$('.wavemenu [data-daytplpick]').length).toBe(0)
    document.body.click()   // close it
  })

  it('"Save this day as a template" mints one off the open day and opens the manage modal on it', async () => {
    await resetLib()
    const toasts: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try {
      await click($('#sbBoard [data-daytpladd="0"]'))
      await click($('.wavemenu [data-daytplsave]'))
      expect(DAYTPL_CFG.length).toBe(1)
      expect(DAYTPL_CFG[0]!.title).toBe('Template 1')
      expect(toasts.some(t => t.includes('Saved as "Template 1"'))).toBe(true)
      // the manage modal opened, pre-selected on the new template
      expect(($('#daytplModal') as any).hidden).toBe(false)
      expect($$('.tpl-tab.on')[0]!.textContent).toBe('Template 1')
      await click($('#daytplClose'))
    } finally {
      HOOKS.toast = real
    }
  })

  it('picking a template applies it and toasts its name', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    await click($('#daytplClose'))
    const t = DAYTPL_CFG[0]!
    // muddy day 1's own structure, then apply day 0's captured template onto it
    const toasts: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try {
      await click($('#eWeek .day[data-day="1"] .dt.sb-open'))
      await click($('#sbBoard [data-daytpladd="1"]'))
      await click($('.wavemenu [data-daytplpick]'))
      expect(DAYS[1].waves[0].formations[0].cs).toBe(DAYS[0].waves[0].formations[0].cs)
      expect(DAYS[1].waves[0].formations[0].aircraft[0].p).toBe('')   // crewless
      expect(toasts.some(s => s.includes(`Applied "${t.title}"`))).toBe(true)
    } finally {
      HOOKS.toast = real
    }
  })

  it('refuses a published day, with the reopen toast, and changes nothing', async () => {
    await resetLib()
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    await click($('#daytplClose'))
    const before = JSON.stringify(DAYS[2])
    const g = signOf(2)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(2, 1)
    expect(dayApproved(2)).toBe(true)
    const toasts: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try {
      await click($('#eWeek .day[data-day="2"] .dt.sb-open'))
      await click($('#sbBoard [data-daytpladd="2"]'))
      await click($('.wavemenu [data-daytplpick]'))
      expect(toasts).toEqual(['Reopen the day first'])
      expect(JSON.stringify(DAYS[2])).toBe(before)
    } finally {
      HOOKS.toast = real
      setDayApproved(2, 0)
    }
  })

  it('the week’s own Templates button opens the identical picker', async () => {
    await resetLib()
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    await click($('#daytplClose'))
    await click($('#eWeek [data-daytplopen="0"]'))
    expect($$('.wavemenu [data-daytplpick]').length).toBe(1)
    document.body.click()
  })
})

describe('the manage modal (DayTplModal)', () => {
  it('shows a real empty state when the library has nothing', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytpledit]'))
    expect(($('#daytplModal') as any).hidden).toBe(false)
    expect($('#daytplModal .modal-body')!.textContent).toContain('No day templates saved yet')
    expect($('#daytplModal .abtn.danger[style*="margin"]')).toHaveProperty('disabled', true)
    await click($('#daytplClose'))
  })

  it('renames the selected template and shows its read-only summary', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))   // opens the modal pre-selected
    await type($('#daytplModal .tpl-name'), 'Ordinary Tuesday')
    expect(DAYTPL_CFG[0]!.title).toBe('Ordinary Tuesday')
    expect($$('#daytplModal .tpl-tab.on')[0]!.textContent).toBe('Ordinary Tuesday')
    expect($('#daytplModal .wm-note')!.textContent).toMatch(/wave.*duty block.*ground row.*sim/)
    await click($('#daytplClose'))
  })

  it('Delete removes the selected template, and says so', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    expect(DAYTPL_CFG.length).toBe(1)
    const title = DAYTPL_CFG[0]!.title
    /* owner audit, 15 Aug 26 — the picker menu's own Save/Duplicate already
       toast (above); this manage modal's two destructive actions did not */
    const toasts: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await click($('#daytplModal .abtn.danger:not([style*="margin"])')) } finally { HOOKS.toast = real }
    expect(DAYTPL_CFG.length).toBe(0)
    expect($('#daytplModal .modal-body')!.textContent).toContain('No day templates saved yet')
    expect(toasts).toContain(`"${title}" template deleted`)
    await click($('#daytplClose'))
  })

  it('Reset wipes the whole library, and says so', async () => {
    await resetLib()
    await click($('#sbBoard [data-daytpladd="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    await click($('#eWeek [data-daytplopen="0"]'))
    await click($('.wavemenu [data-daytplsave]'))
    expect(DAYTPL_CFG.length).toBe(2)
    const toasts: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await click($('#daytplModal .abtn.danger[style*="margin"]')) } finally { HOOKS.toast = real }
    expect(DAYTPL_CFG.length).toBe(0)
    expect(toasts).toContain('All day templates deleted')
    await click($('#daytplClose'))
  })

  it('renders nothing (a hidden shell) when DAYTPLEDIT is off', async () => {
    await resetLib()
    expect(($('#daytplModal') as any).hidden).toBe(true)
    expect($('#daytplModal .tpl-tabs')).toBeFalsy()
  })
})
