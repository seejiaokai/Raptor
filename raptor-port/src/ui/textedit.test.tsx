// @vitest-environment jsdom
/* Inline text editing, the day-details panel and Insights — the tfin H group
   and the blur/Enter/Escape commit semantics, driven through the React app. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { SCHED } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { validate, WARN } from '../engine/validate'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 10)) })

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('inline text editing (tfin text-funnel semantics)', () => {
  it('blur commits through txtSet, marks the key, and normalises whitespace', async () => {
    const el = $('#eWeek [data-txt="fr:0.0.0.0"]')
    expect(el).toBeTruthy()
    await act(async () => {
      el.textContent = '  NEW   REMARK  '
      el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    await settle()
    expect(txtGet('fr:0.0.0.0')).toBe('NEW REMARK')
    expect(SCHED.pending['fr:0.0.0.0']).toBe(1)
    await act(async () => { undo() })
  })

  it('a time field is normalised via parseHM/hhmm', async () => {
    const el = $('#eWeek [data-txt="ff:0.0.0.to"]')
    expect(el).toBeTruthy()
    const before = txtGet('ff:0.0.0.to')
    await act(async () => {
      el.textContent = '0935'
      el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    await settle()
    expect(txtGet('ff:0.0.0.to')).toBe('09:35')
    await act(async () => { undo() })
    expect(txtGet('ff:0.0.0.to')).toBe(before)
  })

  it('an unchanged commit marks nothing and heals drift in place', async () => {
    const el = $('#eWeek [data-txt="fr:0.0.0.0"]')
    const v = txtGet('fr:0.0.0.0')
    await act(async () => {
      el.innerHTML = `<span>${v}</span>`            // paste-style drift, same text
      el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    await settle()
    expect(SCHED.pending['fr:0.0.0.0']).toBeUndefined()
    expect(el.children.length).toBe(0)              // healed from the model
    expect(el.textContent).toBe(v)
  })

  it('Enter commits (everywhere, including sim notes), Escape restores', async () => {
    const el = $('#eWeek [data-txt="fr:0.0.0.0"]')
    let blurred = 0
    el.blur = () => { blurred++ }
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    })
    expect(blurred).toBe(1)
    const v = txtGet('fr:0.0.0.0')
    await act(async () => {
      el.textContent = 'ABANDONED'
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    expect(el.textContent).toBe(v)
    expect(blurred).toBe(2)
    /* the sim-notes block is a [data-txt] like everything else */
    expect($('#eWeek [data-txt^="sn:"]')).toBeTruthy()
  })
})

describe('the day-detail panel (tfin H)', () => {
  it('every day offers the info button, addressed to its own day', () => {
    expect($$('#vWeek [data-dayinfo]').length).toBeGreaterThanOrEqual($$('#vWeek .day').length)
  })

  it('opens on click with the approval strip, AL coverage and tasking grid', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    await click($('#vWeek [data-dayinfo]'))
    const body = $('#dayPopBody')
    expect(body).toBeTruthy()
    // the issues list scrolls INSIDE its own height so the footer Close button
    // stays pinned below it, not buried mid-list (owner, 26 Aug 26)
    expect((body as HTMLElement).style.overflow || (body as HTMLElement).style.overflowY).toBe('auto')
    expect(body.querySelector('.dip-stat')).toBeTruthy()
    expect(body.querySelector('.dip-als')).toBeTruthy()
    expect(body.querySelectorAll('.dip-r').length).toBeGreaterThanOrEqual(8)
    expect(['Waves', 'Formations', 'Aircraft lines', 'Sim rows', 'Duties', 'Ground items', 'Squadron-wide', 'Aircrew tasked']
      .every(k => body.textContent!.includes(k))).toBe(true)
  })

  it('panel lists that day\'s issues with the Warning/Advisory/Note wording', () => {
    validate()
    const di = 0
    const dw = (WARN.byDay[di] && WARN.byDay[di].warns) || []
    const body = $('#dayPopBody')
    expect(body.querySelectorAll('.dip-list .witem').length).toBe(dw.length)
    expect([...body.querySelectorAll('.dip-list .wcode')]
      .every(x => /^(Warning|Advisory|Note) · /.test(x.textContent!))).toBe(true)
  })

  it('the panel is read-only', () => {
    const body = $('#dayPopBody')
    expect(body.querySelectorAll('[data-fill], [draggable="true"], [data-drag], input, select, textarea').length).toBe(0)
  })

  it('a panel issue jumps to the puck and closes the panel', async () => {
    await click($('#dayPopBody .dip-list .witem[data-adv]'))
    expect($('#dayPop')!.hidden).toBe(true)
    expect($$('#vWeek .puck.wfoc').length).toBeGreaterThanOrEqual(1)
    await click($('#vWeek .dwclear'))
    for (let g = 0; g < 12; g++) { const s = $('#vWeek .dwbox.open .daywarn'); if (!s) break; await click(s) }
  })

  it('day panel closes', async () => {
    await click($('#vWeek [data-dayinfo]'))
    expect($('#dayPop')!.hidden).toBe(false)
    await click($('#dayPopClose'))
    expect($('#dayPop')!.hidden).toBe(true)
  })
})

describe('week insights (tfin)', () => {
  it('insights sorties', async () => {
    await click($('#insightBtn'))
    expect(/Sorties/.test($('#insightBody').textContent!)).toBe(true)
    expect($$('#insightBody .itile').length).toBe(4)
    await click($('#insightClose'))
    expect($('#insightModal')!.hidden).toBe(true)
  })
})
