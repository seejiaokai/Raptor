// @vitest-environment jsdom
/* THE BOARD'S THREE WINDOWS AND THE KEYBOARD ([BOARD-MODALS-ESCAPE], [WINDOWS-KEEP-KEYS] — the night of 23–24 Oct 26).
   The Duty templates window (the "+ Block" menu's pencil), the Day templates window (Templates → Manage templates) and
   the Plans window (the plans menu → Manage plans) stayed open on Escape and took no keyboard: Tab walked on into the
   schedule behind them. Each now takes the keyboard when it opens, keeps Tab inside it, closes on Escape — leaving the
   Scheduler Board behind it open — and gives the keyboard back to the button that opened its menu, which the menu took
   away with it. Driven through the real App, as daytplui.test.tsx and draftsui.test.tsx are. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { SBDAY } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { setInpEdit, setDocView, INPEDIT } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* a key pressed where the keyboard is, as a person presses it */
const key = async (k: string, shift = false) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true, cancelable: true }))
  })
}
/* the button is focused, then pressed — the menu it opens is a keyboard user's */
const pressKeyed = async (el: HTMLElement) => { el.focus(); await click(el) }

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('the Duty templates window', () => {
  it('takes the keyboard, closes on Escape with the board left open, and gives the keyboard back to "+ Block"', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect(SBDAY).toBe(0)
    const opener = $('#sbBoard [data-dwadd="0"]')
    await pressKeyed(opener)
    await click($('.wavemenu [data-blkedit]'))
    const box = $('#tplModal .modal-box')
    expect(($('#tplModal') as any).hidden).toBe(false)
    expect(box.contains(document.activeElement)).toBe(true)
    await key('Escape')
    expect(($('#tplModal') as any).hidden).toBe(true)
    expect(SBDAY).toBe(0)                                // the board behind it stays open
    expect(document.activeElement).toBe(opener)
  })

  it('keeps Tab inside it, the ✕ last', async () => {
    await click($('#sbBoard [data-dwadd="0"]'))
    await click($('.wavemenu [data-blkedit]'))
    const box = $('#tplModal .modal-box')
    $('#tplClose').focus()                               // the last stop: Tab goes round to the first
    await key('Tab')
    expect(box.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).not.toBe($('#tplClose'))
    await key('Tab', true)                               // and back to the ✕
    expect(document.activeElement).toBe($('#tplClose'))
    await click($('#tplClose'))
  })
})

describe('the Day templates window', () => {
  it('closes on Escape and gives the keyboard back to the Templates button', async () => {
    const opener = $('#sbBoard [data-daytpladd="0"]')
    await pressKeyed(opener)
    await click($('.wavemenu [data-daytpledit]'))
    expect(($('#daytplModal') as any).hidden).toBe(false)
    expect($('#daytplModal .modal-box').contains(document.activeElement)).toBe(true)
    await key('Escape')
    expect(($('#daytplModal') as any).hidden).toBe(true)
    expect(SBDAY).toBe(0)
    expect(document.activeElement).toBe(opener)
  })
})

describe('the Plans window', () => {
  it('closes on Escape and gives the keyboard back to the plans selector', async () => {
    await click($('#sbDone'))
    expect(SBDAY).toBe(null)
    /* a day with plans: "+ Alt Plan" first, so the menu carries "Manage plans" */
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($('.wavemenu [data-plandup]'))
    const opener = $('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]')
    await pressKeyed(opener)
    await click($('.wavemenu [data-planmanage]'))
    expect(($('#draftsModal') as any).hidden).toBe(false)
    expect($('#draftsModal .modal-box').contains(document.activeElement)).toBe(true)
    await key('Escape')
    expect(($('#draftsModal') as any).hidden).toBe(true)
    /* the week is redrawn from strings: the selector may be a new button by now — the same one on screen */
    const now = document.activeElement as HTMLElement
    expect(now.dataset.planmenu).toBe('0')
    expect(now.closest('#eWeek .day[data-day="0"]')).toBeTruthy()
  })

  it('opened by a mouse, with the keyboard nowhere, it still closes on Escape', async () => {
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($('.wavemenu [data-planmanage]'))
    expect(($('#draftsModal') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#draftsModal') as any).hidden).toBe(true)
  })
})

/* [WINDOWS-KEEP-KEYS]: the larger windows took no keyboard and held none — Tab went on into the schedule behind them */
const holdsTab = async (box: HTMLElement) => {
  expect(box.contains(document.activeElement), 'the keyboard is in the window').toBe(true)
  for (let i = 0; i < 40; i++) {
    await key('Tab')
    expect(box.contains(document.activeElement), 'Tab stays in the window').toBe(true)
  }
  for (let i = 0; i < 5; i++) {
    await key('Tab', true)
    expect(box.contains(document.activeElement), 'Shift+Tab stays in the window').toBe(true)
  }
}

describe('the other windows keep the keyboard', () => {
  it('Week insights over the board: takes and holds it, Escape closes it and not the board, the keyboard back on its button', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect(SBDAY).toBe(0)
    const opener = $('#sbInsights')
    await pressKeyed(opener)
    await holdsTab($('#insightModal .modal-box'))
    await key('Escape')
    expect($('#insightModal').hidden).toBe(true)
    expect(SBDAY).toBe(0)
    expect(document.activeElement).toBe(opener)
  })

  it('Flying waves (the "+ Wave" menu’s ⚙): holds it, Escape closes it, the keyboard back on "+ Wave"', async () => {
    const opener = $('#sbBoard [data-wvadd="0"]')
    await pressKeyed(opener)
    await click($('.wavemenu [data-wvedit]'))
    await holdsTab($('#waveTplModal .modal-box'))
    await key('Escape')
    expect($('#waveTplModal').hidden).toBe(true)
    expect(SBDAY).toBe(0)
    expect(document.activeElement).toBe(opener)
    await click($('#sbDone'))
  })

  it('a request’s own window opened from the schedule: takes and holds it', async () => {
    const r = INPUTS[0]
    expect(r).toBeTruthy()
    await act(async () => { setInpEdit(r); notify() })
    await holdsTab($('#inpEditPop .inpedbox'))
    await act(async () => { setInpEdit(null); notify() })
    expect(INPEDIT).toBe(null)
  })

  it('the document viewer: takes and holds it', async () => {
    await act(async () => { setDocView({ row: { person: 'bane', type: 'OML', date: 'Jul 10' }, up: false }); notify() })
    await holdsTab($('#docViewPop .docviewbox'))
    await key('Escape')
    expect($('#docViewPop').hidden).toBe(true)
  })
})
