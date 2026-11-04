// @vitest-environment jsdom
/* THE SCHEDULER BOARD BY THE KEYS (owner D1646, 5 Nov 26 — "Go" on the mock-up page's question 2; [BOARD-KEYS-LEFT]).
   · A board menu — + Block, Templates, the plans selector, a jet's stores, + Wave, the duty role list — opened by Enter or
     ↓ on its button puts the keys on its first item; ↑ ↓ move through it, round the ends; Enter picks, the keys back on its
     button; opened by the mouse it opens exactly as before, the keys where they were. In the stores menu a store pressed by
     the keys keeps them, though the menu draws its buttons again.
   · The board's day chips and week chips, and Edit Schedule's day name, are stops for the keys, pressed by Enter and Space;
     the keys stay on the chip they pressed when the strip is drawn again.
   · While the board is open Tab stays on it: round from its last stop to its first and back, and a Tab from the page behind
     comes back onto it.
   · Escape closes the Sort all box, the board staying.
   Driven through the real App, the keys sent where the keyboard is: a button pressed by the keys is a keydown on it and
   then its click, as a browser sends them. Every case is red on the code before this change but the mouse's, a pin. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { askSortAll, SORTALL } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const key = async (k: string, o: KeyboardEventInit = {}) => {
  let ev!: KeyboardEvent
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o })
    at.dispatchEvent(ev)
  })
  return ev
}
/* a button pressed by the keys: Enter goes down on it, and the browser turns that into its click */
const pressByKeys = async (el: HTMLElement) => {
  el.focus()
  const ev = await key('Enter')
  if (!ev.defaultPrevented) await click(document.activeElement)
}
const date = (di: number) => $(`#eWeek .day[data-day="${di}"] .dt.sb-open`)
const boardOpen = () => view.SBDAY != null && !($('#schedBoard') as any).hidden
const at = () => document.activeElement as HTMLElement
const menu = () => $('.wavemenu')
const items = () => [...menu().querySelectorAll<HTMLElement>('button')].filter(b => !(b as HTMLButtonElement).disabled)
/* the keys are on this control — or on the one a string redraw put in its place (the same marks) */
const keysOn = (el: HTMLElement) => {
  const a = at()
  return !!a && a.tagName === el.tagName && a.id === el.id && JSON.stringify({ ...a.dataset }) === JSON.stringify({ ...el.dataset })
}

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
beforeEach(async () => {
  $$('.wavemenu').forEach(m => m.remove())
  if (SORTALL != null) await click($('#sortAllCancel'))
  if (view.SBDAY != null) await click($('#sbDone'))
  at()?.blur?.()
})

const MENUS: [string, string][] = [
  ['+ Block', '#sbBoard [data-dwadd]'],
  ['Templates', '#sbTpl'],
  ['the plans selector', '#schedBoard [data-planmenu]'],
  ["a jet's stores", '#sbBoard [data-stcfg]'],
  ['+ Wave', '#sbBoard [data-wvadd]'],
]

describe('[D1646] a board menu opened by the keys puts them on its first item', () => {
  for (const [name, sel] of MENUS) {
    it(`${name}: Enter opens it on its first pick; ↓ and ↑ move through it, round the ends; Escape back to its button`, async () => {
      await click(date(2))
      const b = $(sel)
      expect(b, `${name}'s button`).toBeTruthy()
      await pressByKeys(b)
      expect(menu(), 'the menu is up').toBeTruthy()
      const list = items()
      const first = list.find(x => x.classList.contains('wm')) || list[0]
      expect(at(), 'the keys are on its first pick').toBe(first)
      if (list.length > 1) {
        const i = list.indexOf(first!)
        await key('ArrowDown')
        expect(at(), '↓ to the next').toBe(list[(i + 1) % list.length])
        await key('ArrowUp')
        expect(at(), '↑ back').toBe(first)
        list[list.length - 1]!.focus()
        await key('ArrowDown')
        expect(at(), 'round from the last to the first').toBe(list[0])
      }
      await key('Escape')
      expect(menu()).toBeNull()
      expect(keysOn(b), 'the keys back on its button').toBe(true)
    })
    it(`${name}: ↓ on its button opens it on its first pick`, async () => {
      await click(date(2))
      const b = $(sel)
      b.focus()
      await key('ArrowDown')
      expect(menu(), '↓ opened the menu').toBeTruthy()
      expect(menu().contains(at()) && at().tagName === 'BUTTON', 'the keys are in it').toBe(true)
      await key('Escape')
    })
  }

  it('opened by the mouse it opens as before: the keys stay where they were (a pin)', async () => {
    await click(date(2))
    const b = $('#sbBoard [data-dwadd]')
    b.focus()
    await click(b)
    expect(menu()).toBeTruthy()
    expect(at(), 'the keys still on + Block').toBe(b)
  })

  it('a pick made by the keys gives them back to the menu\'s button (the plans selector: back to the live copy)', async () => {
    await click(date(2))
    const b = $('#schedBoard [data-planmenu]')
    await pressByKeys(b)
    const pick = at()
    expect(menu().contains(pick)).toBe(true)
    await pressByKeys(pick)
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(menu(), 'the pick closed the menu').toBeNull()
    expect(keysOn(b), 'the keys back on the plans selector').toBe(true)
  })

  it('the stores menu: a store pressed by the keys keeps them, though the menu draws its buttons again', async () => {
    await click(date(2))
    await pressByKeys($('#sbBoard [data-stcfg]'))
    const first = at()
    const k = first.dataset.cfg
    expect(k, 'the keys on the first store').toBeTruthy()
    await pressByKeys(first)
    expect(menu(), 'the menu stays').toBeTruthy()
    expect(at().dataset.cfg, 'the keys on the store they pressed').toBe(k)
    await pressByKeys(at())                            // pressed again: back as it was
    await key('Escape')
  })

  it('the duty role list: ↓ in the role box opens it on its first role', async () => {
    await click(date(2))
    if (!$('#sbBoard [data-rolepick]')) {
      await click($('#sbBoard [data-dwadd]'))
      await click($('.wavemenu [data-blktpl=""]'))
    }
    const box = $('#sbBoard [data-rolepick]')
    expect(box, 'a duty role box').toBeTruthy()
    box.focus()
    await key('ArrowDown')
    expect(menu(), 'the role list is up').toBeTruthy()
    expect(at().dataset.rolev, 'the keys on its first role').toBeTruthy()
    await key('Escape')
    expect(menu()).toBeNull()
  })
})

describe('[D1646] the day and week chips, and Edit Schedule\'s day name, take the keys', () => {
  it('each chip is a stop, a button to a screen reader', async () => {
    await click(date(2))
    const chips = $$('#sbDays .sbday')
    expect(chips.length).toBe(9)
    for (const c of chips) { expect(c.tabIndex).toBe(0); expect(c.getAttribute('role')).toBe('button') }
  })
  it('Enter on a day chip opens that day, the keys staying on it; Space on › steps a week, the keys on ›', async () => {
    await click(date(2))
    $('#sbDays [data-sbtab="4"]').focus()
    await key('Enter')
    expect(view.SBDAY).toBe(4)
    expect(at().dataset.sbtab, 'the keys on the chip pressed').toBe('4')
    const wk = CURWEEK
    $('#sbDays [data-sbweek="1"]').focus()
    await key(' ')
    expect(CURWEEK, 'a week on').not.toBe(wk)
    expect(at().dataset.sbweek, 'the keys on ›').toBe('1')
    $('#sbDays [data-sbweek="-1"]').focus()
    await key('Enter')
    expect(CURWEEK, 'back').toBe(wk)
  })
  it('the day name is a stop; Enter shows that day\'s crew', async () => {
    const dn = $('#eWeek .day[data-day="3"] .dow.crewday')
    expect(dn.tabIndex).toBe(0)
    expect(dn.getAttribute('role')).toBe('button')
    dn.focus()
    await key('Enter')
    expect(view.ROSDAY).toBe(3)
    $('#eWeek .day[data-day="1"] .dow.crewday').focus()
    await key(' ')
    expect(view.ROSDAY).toBe(1)
  })
})

describe('[D1646] Tab stays on the board while it is open', () => {
  const stops = () => [...$('#schedBoard').querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"],[contenteditable=""]')]
    .filter(n => n.tabIndex >= 0 && !(n as HTMLButtonElement).disabled && !n.closest('[hidden], [inert]'))
  it('round from its last stop to its first, and back', async () => {
    await click(date(2))
    const s = stops()
    s[s.length - 1]!.focus()
    await key('Tab')
    expect(at(), 'Tab from the last stop: the first').toBe(s[0])
    await key('Tab', { shiftKey: true })
    expect(at(), 'Shift+Tab from the first: the last').toBe(s[s.length - 1])
  })
  it('a Tab from the page behind comes back onto the board', async () => {
    await click(date(2))
    $('#eWeek .day[data-day="0"] [data-daytplopen]').focus()
    await key('Tab')
    expect($('#schedBoard').contains(at()), 'the keys are on the board').toBe(true)
  })
})

describe('[D1646] Escape closes the Sort all box', () => {
  it('the box closes, the board stays, nothing sorted', async () => {
    await click(date(2))
    const was = JSON.stringify(DAYS[2])
    await act(async () => { askSortAll(2) })
    expect(($('#sortAllPop') as any).hidden).toBe(false)
    await key('Escape')
    expect(SORTALL, 'Escape closed it').toBe(null)
    expect(boardOpen(), 'the board stays').toBe(true)
    expect(JSON.stringify(DAYS[2]), 'nothing sorted').toBe(was)
  })
})
