// @vitest-environment jsdom
/* DutyTplModal — the duty-templates editor opened from TPLEDIT (pops.ts).
   Mounted directly, not through <App/>: the modal is self-contained and not
   yet wired into the app shell. Preamble follows audit-e-window-sort.test.tsx
   (a single component mounted standalone) plus the fake storeBackend from
   stores.test.tsx:8-19, wired so dutyTplSave()/dutyTplReset() never touch
   real localStorage. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DutyTplModal } from './DutyTplModal'
import { storeBackend, HOOKS } from '../engine/hooks'
import { DUTYTPL_CFG, dutyTplReset } from '../engine/dutytpl'
import { notify } from '../state/store'
import { setTplEdit } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* React-controlled inputs need the native value setter, or React's own
   change-detection swallows a same-string re-set — the same trick every
   other *.test.tsx in this folder uses for a text field. */
const type = async (el: Element, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
/* React delegates onFocus/onBlur through focusin/focusout at the root */
const focusIn = async (el: Element) =>
  await act(async () => { el.dispatchEvent(new FocusEvent('focusin', { bubbles: true })) })
const focusOut = async (el: Element) =>
  await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })

const mem: Record<string, string> = {}

beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<DutyTplModal />) })
})

/* every test opens on the standard three-template seed */
beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  dutyTplReset()
  await act(async () => { setTplEdit(true); notify() })
})

describe('opening the editor', () => {
  it('shows the three seeded template tabs', () => {
    const tabs = $$('.tpl-tab:not(.new)').map(b => b.textContent)
    expect(tabs).toEqual(['Standard', 'SC Shift', 'AVALON'])
  })

  it('renders nothing (a hidden shell) when TPLEDIT is off', async () => {
    await act(async () => { setTplEdit(false); notify() })
    expect($('#tplModal')?.hidden).toBe(true)
    expect($('.tpl-tabs')).toBeFalsy()
    await act(async () => { setTplEdit(true); notify() })   // leave it open for the next test
  })
})

describe('+ New', () => {
  it('adds a template and selects it', async () => {
    expect(DUTYTPL_CFG.length).toBe(3)
    await click($$('.tpl-tab.new')[0]!)
    expect(DUTYTPL_CFG.length).toBe(4)
    const added = DUTYTPL_CFG[3]!
    expect($('.tpl-name')).toHaveProperty('value', added.title)
    expect($$('.tpl-tab.on')[0]!.textContent).toBe(added.title)
  })
})

describe('renaming the selected template', () => {
  it('the .tpl-name input calls renameTpl on the selected template', async () => {
    const std = DUTYTPL_CFG[0]!
    await click($$('.tpl-tab:not(.new)')[0]!)   // select Standard
    await type($('.tpl-name'), 'Renamed Std')
    expect(std.title).toBe('Renamed Std')
    expect($$('.tpl-tab.on')[0]!.textContent).toBe('Renamed Std')
  })
})

describe('rows', () => {
  it('+ Add role adds a row to the selected template', async () => {
    await click($$('.tpl-tab:not(.new)')[0]!)   // Standard: 3 seeded rows
    const before = DUTYTPL_CFG[0]!.rows.length
    await click($('.addrow'))
    expect(DUTYTPL_CFG[0]!.rows.length).toBe(before + 1)
    expect($$('.trow').length).toBe(before + 1)
  })

  it('the row delete button removes one row', async () => {
    await click($$('.tpl-tab:not(.new)')[0]!)
    const before = DUTYTPL_CFG[0]!.rows.length
    await click($$('.trow .del')[0]!)
    expect(DUTYTPL_CFG[0]!.rows.length).toBe(before - 1)
    expect($$('.trow').length).toBe(before - 1)
  })
})

/* GUARD RAILS ON THE TIME CELLS (owner, 16 Aug 26 — "no guard rails on duty
   templates timings"). A time cell takes a clock time or nothing, refused on
   COMMIT (blur), not per keystroke — the same line txtSet draws on the
   schedule. Typing is free; leaving a malformed value reverts it and toasts. */
describe('time-cell guard rails', () => {
  const withToasts = async (fn: () => Promise<void>) => {
    const toasts: string[] = []
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await fn() } finally { HOOKS.toast = orig }
    return toasts
  }

  it('a malformed time is refused on blur, reverts to what was there, and toasts', async () => {
    await click($$('.tpl-tab:not(.new)')[1]!)     // SC Shift — first row is SXO AM 07:00/13:00
    const strIn = $$('.trow .tm')[0]!              // the row's start cell
    expect((strIn as HTMLInputElement).value).toBe('07:00')
    const toasts = await withToasts(async () => {
      await focusIn(strIn)                          // captures 07:00
      await type(strIn, '2500')                     // types freely — not refused mid-keystroke
      expect(DUTYTPL_CFG[1]!.rows[0]!.str).toBe('2500')   // raw value while editing
      await focusOut(strIn)                          // commit — refused
    })
    expect(DUTYTPL_CFG[1]!.rows[0]!.str).toBe('07:00')    // reverted
    expect(toasts.some(t => t.includes('is not a time'))).toBe(true)
  })

  it('a valid time is canonicalised to hh:mm on blur — the colon appears on its own', async () => {
    await click($$('.tpl-tab:not(.new)')[1]!)
    const endIn = $$('.trow .tm')[1]!              // the row's end cell
    await focusIn(endIn)
    await type(endIn, '700')
    await focusOut(endIn)
    expect(DUTYTPL_CFG[1]!.rows[0]!.end).toBe('07:00')
  })

  it('clearing a time to empty stays legal — that is how a row is left open', async () => {
    await click($$('.tpl-tab:not(.new)')[1]!)
    const strIn = $$('.trow .tm')[0]!
    await focusIn(strIn)
    await type(strIn, '')
    await focusOut(strIn)
    expect(DUTYTPL_CFG[1]!.rows[0]!.str).toBe('')
  })
})

describe('Delete template', () => {
  it('removes the selected template and selects another, and says so', async () => {
    await click($$('.tpl-tab:not(.new)')[1]!)   // select SC Shift
    expect(DUTYTPL_CFG.length).toBe(3)
    /* owner audit, 15 Aug 26 — this whole modal had zero toasts; the two
       destructive actions (this one and Reset below) now say what happened */
    const toasts: string[] = []
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await click($('.abtn.danger:not([style*="margin"])')!) } finally { HOOKS.toast = orig }
    expect(DUTYTPL_CFG.length).toBe(2)
    expect(DUTYTPL_CFG.some(t => t.title === 'SC Shift')).toBe(false)
    expect($$('.tpl-tab.on').length).toBe(1)
    expect(toasts).toContain('"SC Shift" template deleted')
  })

  it('deleting down to the last template re-adds one — the library is never empty', async () => {
    /* delete all three seeded templates one at a time via the Delete button */
    for (let i = 0; i < 3; i++) {
      await click($('.abtn.danger:not([style*="margin"])'))
    }
    expect(DUTYTPL_CFG.length).toBe(1)
    expect($$('.tpl-tab:not(.new)').length).toBe(1)
  })
})

describe('Reset to defaults', () => {
  it('restores the three seeded templates, selects the first, and says so', async () => {
    await click($$('.tpl-tab.new')[0]!)   // muddy the library first
    expect(DUTYTPL_CFG.length).toBe(4)
    const toasts: string[] = []
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await click($('.abtn.danger[style*="margin"]')) } finally { HOOKS.toast = orig }
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Standard', 'SC Shift', 'AVALON'])
    expect($$('.tpl-tab.on')[0]!.textContent).toBe('Standard')
    expect(toasts).toContain('Duty templates reset to defaults')
  })
})
