// @vitest-environment jsdom
/* The "Set default order?" snackbar (owner, 29 Aug 26 pt.3). After a section drag
   it offers to make that day's order the squadron house default. Driven through the
   real component + store, the oilconfirm harness idiom. */
import { beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { SecDefaultSnackbar } from './SecDefaultSnackbar'
import { initStore, setSession, notify, moveSectionTo } from '../state/store'
import { DAYS } from '../engine/data'
import { secOrder, secDefault, secDefaultReset, SECTIONS } from '../engine'
import { setSecDefOffer, SECDEFOFFER } from './pops'

let root: any, host: HTMLElement

beforeEach(() => {
  initStore()
  setSession({ user: 'a', role: 'admin' } as any)
  secDefaultReset()
  setSecDefOffer(null)
  document.body.innerHTML = '<div id="root"></div>'
  host = document.getElementById('root')!
  root = createRoot(host)
})

const mount = () => act(() => { root.render(<SecDefaultSnackbar />) })
const click = (sel: string) => act(() => {
  ;(host.querySelector(sel) as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
})

describe('SecDefaultSnackbar', () => {
  it('is hidden with no offer, and shows the prompt when one is set', () => {
    mount()
    expect(host.querySelector('.secdef-snack[hidden]')).toBeTruthy()
    act(() => { setSecDefOffer(0); notify() })
    const bar = host.querySelector('.secdef-snack')!
    expect(bar.hasAttribute('hidden')).toBe(false)
    expect(bar.textContent).toContain('default')
  })

  it('"Set as default" saves that day\'s order as the house default and clears the offer', () => {
    /* arrange day 0 to a non-canonical order first */
    moveSectionTo(0, 'ground', 'prog')
    const want = secOrder(DAYS[0])
    expect(want).not.toEqual(SECTIONS)
    act(() => { setSecDefOffer(0); notify() })
    mount()
    click('.secdef-btn.yes')
    expect(secDefault()).toEqual(want)
    expect(SECDEFOFFER).toBe(null)
  })

  it('"Not now" dismisses without changing the house default', () => {
    moveSectionTo(0, 'ground', 'prog')
    act(() => { setSecDefOffer(0); notify() })
    mount()
    click('.secdef-btn:not(.yes)')
    expect(secDefault()).toEqual(SECTIONS)   // untouched
    expect(SECDEFOFFER).toBe(null)
  })
})
