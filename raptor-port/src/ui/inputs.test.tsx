// @vitest-environment jsdom
/* The Inputs page — tfin's inputs assertions plus the B26/B48 model rules
   driven through the page: role-gated add/delete, the undo stack, and the
   week revalidating when an input lands. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { validate } from '../engine/validate'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
})

describe('the Inputs page (tfin)', () => {
  it('inputs rows', () => {
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(4)
  })

  it('no TDY, and the retired types are gone', () => {
    const opts = [...($('#inType') as unknown as HTMLSelectElement).options].map(o => o.value)
    expect(opts).not.toContain('TDY')
    /* removed Aug 26 — Office was a desk marker nobody read, and the two
       "Available" types were offers rather than commitments */
    for (const dead of ['Office', 'Available fly', 'Available duty'])
      expect(opts).not.toContain(dead)
    expect(opts).toContain('Detachment')
  })

  it('the person filter is called Personnel, not All flights', () => {
    const first = ($('#inFPerson') as unknown as HTMLSelectElement).options[0]!
    expect(first.textContent).toBe('Personnel')
  })

  it('an admin add lands in INPUTS, the table, and the undo stack', async () => {
    const n = INPUTS.length
    await act(async () => {
      const rm = $('#inRemarks') as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(rm, 'PHASE4C TEST')
      rm.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].remarks).toBe('PHASE4C TEST')
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(5)
    /* personal inputs join the undo stack */
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  it('the ✕ deletes a row, and undo resurrects it', async () => {
    const n = INPUTS.length
    const first = INPUTS[0]
    await click($('#inBody .rmx'))
    expect(INPUTS.length).toBe(n - 1)
    expect(INPUTS[0]).not.toBe(first)
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  it('a member may not add or delete', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n)
    await click($('#inBody .rmx'))
    expect(INPUTS.length).toBe(n)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('the filters narrow the table', async () => {
    const all = $$('#inBody tr').length
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'Downchit')
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const narrowed = $$('#inBody tr').length
    expect(narrowed).toBeGreaterThan(0)
    expect(narrowed).toBeLessThan(all)
    expect($$('#inBody .intag').every(x => x.textContent === 'Downchit')).toBe(true)
  })

  it('an added downchit re-validates the week (reflow)', async () => {
    validate()
    const before = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    /* put a downchit on someone flying Monday — stiff flies both waves */
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'stiff', date: 'Jul 13', allday: true, type: 'Downchit', remarks: '', mod: 'now' }))
    })
    const after = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    expect(after).toBeGreaterThan(before)
    await act(async () => { undo() })
  })
})
