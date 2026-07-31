// @vitest-environment jsdom
/* The Logic tab — the tfin B50/B52 page assertions, driven through React:
   read-only rendering from the live engine objects, the documentation
   guards, search, and the admin edit flow. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { VCONF, SHIFT_HARD, RULE_SPEC, rulesReset } from '../engine/rules'
import { WCODE, WARN, validate } from '../engine/validate'
import { LEAVE_TYPES } from '../engine/inputs'
import { setLgEdit } from '../state/auth'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const text = () => $('#lgBody').textContent || ''

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'logic')!)
})

describe('the Logic tab, read-only (tfin B50)', () => {
  it('the Logic page exists and renders every group and rule', () => {
    expect($('#page-logic')).toBeTruthy()
    expect($$('#lgBody .lggrp').length).toBeGreaterThanOrEqual(9)
    expect($$('#lgBody .lgrule').length).toBeGreaterThanOrEqual(40)
  })

  it('it is read-only — nothing but the search box takes input', () => {
    expect($$('#page-logic input:not(#lgSearch), #page-logic select, #page-logic [contenteditable]').length).toBe(0)
  })

  it('the thresholds are read from the live VCONF, not copied', async () => {
    expect(/\b12h\b/.test(text())).toBe(true)
    const was = VCONF.crewRest
    await act(async () => { VCONF.crewRest = 600; notify() })
    expect(/\b10h\b/.test(text())).toBe(true)
    await act(async () => { VCONF.crewRest = was; notify() })
    expect(/\b12h\b/.test(text())).toBe(true)
  })

  it('every SETTING the engine carries is documented', () => {
    const t = text()
    const missing = Object.keys(VCONF).filter(k => t.indexOf('VCONF.' + k) < 0)
    expect(missing, missing.join(',')).toEqual([])
  })

  it('the clash matrix is read from SHIFT_HARD', () => {
    expect(Object.keys(SHIFT_HARD).filter(k => SHIFT_HARD[k]).length).toBe(4)
    expect(Object.keys(SHIFT_HARD).length).toBe(6)
    expect(/a flight/.test(text()) && /a ground event/.test(text())).toBe(true)
  })

  it('the leave taxonomy is read from LEAVE_TYPES', () => {
    expect(Object.keys(LEAVE_TYPES).every(k => text().indexOf(k) >= 0)).toBe(true)
  })

  it('every warning code the engine can raise is documented', () => {
    const shown = $$('#lgBody .lgsev .code').map(x => x.textContent)
    const missing = Object.keys(WCODE).filter(c => shown.indexOf(c) < 0)
    expect(missing, missing.join(',')).toEqual([])
  })

  it('the firing counts come from the live WARN', () => {
    validate()
    const n = $$('#lgBody .lgfired.on').length
    const codes = new Set((WARN.all || []).map((w: any) => w.code))
    expect(n).toBeGreaterThan(0)
    expect(n).toBeLessThanOrEqual(codes.size)
  })

  it('search narrows the list and clears back', async () => {
    const all = () => $$('#lgBody .lgrule').length
    const n0 = all()
    const inp = $('#lgSearch') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(inp, 'crew rest'); inp.dispatchEvent(new Event('input', { bubbles: true })) })
    const n1 = all()
    await act(async () => { setter.call(inp, ''); inp.dispatchEvent(new Event('input', { bubbles: true })) })
    expect(n1).toBeGreaterThan(0)
    expect(n1).toBeLessThan(n0)
    expect(all()).toBe(n0)
  })
})

describe('the thresholds are editable, and only by an admin (tfin B52)', () => {
  const setField = async (input: HTMLInputElement, v: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => {
      setter.call(input, v)
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await new Promise(r => setTimeout(r, 5))
    })
  }

  it('Edit rules opens live fields, a change reaches the engine, and the stamp goes up', async () => {
    await click($('#lgEdit'))
    const f = $('#lgBody input[data-lgset="crewRest"]') as HTMLInputElement
    expect(f).toBeTruthy()
    await setField(f, '10h')
    expect(VCONF.crewRest).toBe(600)
    expect(document.body.classList.contains('page-rules-off')).toBe(true)
    expect(/off standard/.test($('#lgCount').textContent || '')).toBe(true)
  })

  it('a value outside its bounds is refused', async () => {
    const f = $('#lgBody input[data-lgset="crewRest"]') as HTMLInputElement
    await setField(f, '3h')
    expect(VCONF.crewRest).toBe(600)         // unchanged — refused, not written
    expect(RULE_SPEC.crewRest.lo).toBeGreaterThan(180)
  })

  it('the clash matrix toggles write SHIFT_HARD', async () => {
    const c = $('#lgBody input[data-lgkind="ground"]') as HTMLInputElement
    expect(c).toBeTruthy()
    await act(async () => { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(SHIFT_HARD.ground).toBe(true)
  })

  it('reset restores the standard exactly', async () => {
    await click($('#lgReset'))
    expect(VCONF.crewRest).toBe(720)
    expect(SHIFT_HARD.ground).toBe(false)
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
    await click($('#lgDone'))
  })

  it('a member never renders an editable field', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); setLgEdit(true); notify() })
    expect($$('#lgBody [data-lgset], #lgBody [data-lgkind]').length).toBe(0)
    expect(($('#lgEdit') as HTMLElement).hidden).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); setLgEdit(false); notify(); rulesReset() })
  })
})

describe('the stamp does not need the Logic page (audit2 #6)', () => {
  it('a modified rule stamps the body from the banner path, on any page', async () => {
    const { VCONF } = await import('../engine/rules')
    const was = VCONF.crewRest
    await act(async () => { VCONF.crewRest = 600; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(true)
    await act(async () => { VCONF.crewRest = was; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
  })
})
