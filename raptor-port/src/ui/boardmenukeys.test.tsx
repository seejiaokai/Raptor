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

/* THE FRESH READ'S FINDINGS (5 Nov 26, `docs/handpass/parts/kw1105/read-opus.md`), each red on the code it read */
describe('the read\'s F1 — a role picked from its list: the role box shows the pick, the caret back in it', () => {
  it('↓ into the list, Enter on a role: the box, with the keys in it again, reads the role picked', async () => {
    await click(date(2))
    if (!$('#sbBoard [data-rolepick]')) { await click($('#sbBoard [data-dwadd]')); await click($('.wavemenu [data-blktpl=""]')) }
    const box = $('#sbBoard [data-rolepick]') as HTMLInputElement
    const addr = box.dataset.rolepick!
    box.focus()
    await key('ArrowDown')
    expect(menu(), 'the role list is up').toBeTruthy()
    const role = at().dataset.rolev!
    await pressByKeys(at())
    await act(async () => { await new Promise(r => setTimeout(r, 20)) })
    const now = at() as HTMLInputElement
    expect(now.dataset.rolepick, 'the keys are back in the role box').toBe(addr)
    expect(now.value, 'and it reads the role picked, not the words it had').toBe(role)
  })
  it('a pick by the mouse in Chromium (the item holds the keys as its click runs): the box reads the role picked', async () => {
    await click(date(3))
    if (!$('#sbBoard [data-rolepick]')) { await click($('#sbBoard [data-dwadd]')); await click($('.wavemenu [data-blktpl=""]')) }
    const box = $('#sbBoard [data-rolepick]') as HTMLInputElement
    box.focus()
    await click(box)
    const item = [...menu().querySelectorAll<HTMLElement>('[data-rolev]')].reverse()[0]!
    const role = item.dataset.rolev!
    item.focus()                                        // Chromium's mousedown on a button
    await click(item)
    await act(async () => { await new Promise(r => setTimeout(r, 20)) })
    const shown = [...document.querySelectorAll<HTMLInputElement>(`#sbBoard [data-rolepick="${box.dataset.rolepick}"]`)][0]!
    expect(shown.value, 'the role box shows the pick').toBe(role)
  })
})

describe('the read\'s F2 — a chip pressed by the keys closes what stands over the board first', () => {
  it('the Traffic window over Wednesday: Enter on Friday\'s chip closes it, then opens Friday', async () => {
    const pops = await import('./pops')
    await click(date(2))
    await click($('#sbBoard [data-air]'))
    expect(pops.AIRKEY, 'the Traffic window is up').not.toBe(null)
    $('#sbDays [data-sbtab="4"]').focus()
    await key('Enter')
    expect(view.SBDAY).toBe(4)
    expect(pops.AIRKEY, 'the window closed first').toBe(null)
  })
  it('a menu opened by the mouse over Wednesday: Enter on a chip takes it away', async () => {
    await click(date(2))
    await click($('#sbBoard [data-dwadd]'))
    expect(menu()).toBeTruthy()
    $('#sbDays [data-sbtab="5"]').focus()
    await key(' ')
    expect(view.SBDAY).toBe(5)
    expect(menu(), 'the menu went').toBeNull()
  })
})

describe('the read\'s F3 — Tab out of a menu\'s end closes it, the keys back on its button', () => {
  it('+ Block by Enter, Tab past its last item: the menu goes, the keys on + Block; Shift+Tab before its first the same', async () => {
    await click(date(2))
    const b = $('#sbBoard [data-dwadd]')
    await pressByKeys(b)
    expect(menu().contains(at())).toBe(true)
    const list = items()
    list[list.length - 1]!.focus()
    await key('Tab')
    expect(menu(), 'the menu went').toBeNull()
    expect(keysOn(b), 'the keys on its button, on the board').toBe(true)
    await pressByKeys($('#sbBoard [data-dwadd]'))
    items()[0]!.focus()
    await key('Tab', { shiftKey: true })
    expect(menu(), 'Shift+Tab before its first: the menu went').toBeNull()
  })
  it('inside the menu Tab is the browser\'s own (the stores menu\'s editor is a little form): the menu stays', async () => {
    await click(date(2))
    await pressByKeys($('#sbBoard [data-dwadd]'))
    const ev = await key('Tab')
    expect(ev.defaultPrevented, 'not taken').toBe(false)
    expect(menu(), 'the menu stays').toBeTruthy()
    await key('Escape')
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

/* [BOARD-KEYS-LEFT]'s roll-call of 7 Nov 26 — two board menus D1646's batch did not reach, both drawn only at a phone's width
   (820 or less: a narrow window at a desk, a tablet with a keyboard): the ⋯ menu beside the highlighter (Insights, Sort all,
   the layout switch — SchedBoard.tsx) and the day bar's Templates (board.ts — the desktop bar's Templates is #sbTpl). Each
   now takes the keys as the board's other menus do. Every case but the mouse's pin is red on the code before. */
describe('[D1646] the board\'s ⋯ menu by the keys', () => {
  const more = () => $('#sbMore')
  const moreMenu = () => $('#sbMoreMenu')
  const moreItems = () => [...moreMenu().querySelectorAll<HTMLElement>('button')].filter(b => !(b as HTMLButtonElement).disabled)
  const mouseClick = async (el: HTMLElement) => {
    await act(async () => { el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    el.focus()
    await click(el)
  }
  it('Enter on ⋯ opens it on its first item; ↓ and ↑ move round it; Escape closes it, the keys back on ⋯', async () => {
    await click(date(2))
    await pressByKeys(more())
    expect(moreMenu(), 'the menu is up').toBeTruthy()
    const list = moreItems()
    expect(list.length, 'Insights, Sort all, the layout switch').toBe(3)
    expect(at(), 'the keys on its first item').toBe(list[0])
    await key('ArrowDown')
    expect(at(), '↓ to the next').toBe(list[1])
    await key('ArrowUp')
    expect(at(), '↑ back').toBe(list[0])
    await key('ArrowUp')
    expect(at(), 'round from the first to the last').toBe(list[2])
    await key('ArrowDown')
    expect(at(), 'and round from the last to the first').toBe(list[0])
    await key('Escape')
    expect(moreMenu(), 'Escape closed it').toBeNull()
    expect(at(), 'the keys back on ⋯').toBe(more())
    expect(boardOpen(), 'the board stays').toBe(true)
  })
  it('↓ on ⋯ opens it on its first item', async () => {
    await click(date(2))
    more().focus()
    await key('ArrowDown')
    expect(moreMenu(), '↓ opened it').toBeTruthy()
    expect(at(), 'the keys on its first item').toBe(moreItems()[0])
    await key('Escape')
  })
  it('opened by the mouse it opens as before: the keys stay on ⋯ (a pin)', async () => {
    await click(date(2))
    await mouseClick(more())
    expect(moreMenu()).toBeTruthy()
    expect(at(), 'the keys still on ⋯').toBe(more())
    await key('Escape')
  })
  it('a pick by the keys gives them back to ⋯ (the layout switch, pressed twice back as it was)', async () => {
    await click(date(2))
    await pressByKeys(more())
    const sw = moreItems()[2]!
    await pressByKeys(sw)
    expect(moreMenu(), 'the pick closed the menu').toBeNull()
    expect(at(), 'the keys back on ⋯').toBe(more())
    await pressByKeys(more())
    await pressByKeys(moreItems()[2]!)
    expect(at()).toBe(more())
  })
  it('Insights picked by the keys: closed by Escape, the keys come back to ⋯', async () => {
    await click(date(2))
    await pressByKeys(more())
    await pressByKeys(moreItems()[0]!)
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(($('#insightModal') as any).hidden, 'Insights is up').toBe(false)
    await key('Escape')
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(($('#insightModal') as any).hidden, 'Insights closed').toBe(true)
    expect(boardOpen(), 'the board stays').toBe(true)
    expect(at(), 'the keys back on ⋯').toBe(more())
  })
  it('the keys leaving the menu (a Tab out of its end) close it', async () => {
    await click(date(2))
    await pressByKeys(more())
    const list = moreItems()
    list[list.length - 1]!.focus()
    await act(async () => { $('#searchB').focus() })
    expect(moreMenu(), 'the menu went with the keys').toBeNull()
  })
  /* THE TWO READS OF 8 NOV 26 (docs/superpowers/briefs/2026-11-08-board-keys-read-*.md) */
  it('Astra 1: ↓ on ⋯ with another board menu up closes that one first — one menu at a time, one Escape', async () => {
    await click(date(2))
    await mouseClick($('#sbBoard [data-dwadd]'))
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })     // its click-outside is listening by now
    expect(menu(), '+ Block\'s menu is up').toBeTruthy()
    more().focus()
    await key('ArrowDown')
    expect(menu(), '+ Block\'s menu went as ⋯ opened').toBeNull()
    expect(moreMenu(), '⋯ is up').toBeTruthy()
    expect(at(), 'the keys on its first item').toBe(moreItems()[0])
    await key('Escape')
    expect(moreMenu(), 'Escape closed it').toBeNull()
    expect(at(), 'the keys back on ⋯').toBe(more())
    expect(boardOpen(), 'the board stays').toBe(true)
  })
  it('Opus Q2: a held Enter opens the menu but does not pick — its repeat, landing on the first item, is ignored', async () => {
    await click(date(2))
    await pressByKeys(more())
    expect(at()).toBe(moreItems()[0])
    const rep = await key('Enter', { repeat: true })
    expect(rep.defaultPrevented, 'the repeat presses nothing').toBe(true)
    expect(moreMenu(), 'the menu still up').toBeTruthy()
    const one = await key('Enter')
    expect(one.defaultPrevented, 'a fresh Enter still picks').toBe(false)
    await key('Escape')
  })
  it('Opus 3: Sort all picked by the keys — the keys come back to ⋯ when its box closes', async () => {
    await click(date(2))
    await pressByKeys(more())
    await pressByKeys(moreItems().find(b => b.id === 'sbMoreSort')!)
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(SORTALL, 'the Sort all box is up').not.toBeNull()
    await key('Escape')
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(SORTALL, 'Escape closed it, nothing sorted').toBeNull()
    expect(boardOpen(), 'the board stays').toBe(true)
    expect(at(), 'the keys back on ⋯').toBe(more())
  })
  it('Opus 3: the arrows step over an item that cannot be pressed (Sort all on a day being looked back at)', async () => {
    await click(date(2))
    await pressByKeys(more())
    ;($('#sbMoreSort') as HTMLButtonElement).disabled = true
    await key('ArrowDown')
    expect(at().id, '↓ from Insights skips Sort all').toBe('sbMoreWide')
    await key('ArrowUp')
    expect(at().id).toBe('sbMoreInsights')
    await key('Escape')
  })
  it('Opus 3: Space on ⋯ opens it on its first item, as Enter does', async () => {
    await click(date(2))
    more().focus()
    await key(' ')
    await click(more())                          // Space presses a button as it comes up
    expect(moreMenu()).toBeTruthy()
    expect(at(), 'the keys on its first item').toBe(moreItems()[0])
    await key('Escape')
  })
  it('Opus 3: a pick by the mouse does not move the keys onto ⋯ (the ring is for the keys only)', async () => {
    await click(date(2))
    await mouseClick(more())
    const sw = moreItems()[2]!
    await mouseClick(sw)
    expect(moreMenu(), 'the pick closed the menu').toBeNull()
    expect(at(), 'the app did not put the keys on ⋯').not.toBe(more())
    await mouseClick(more()); await mouseClick(moreItems()[2]!)        // the layout back as it was
  })
  it('Opus Q3: a window widened past a phone\'s width with the menu up closes it, so the next Escape is the board\'s', async () => {
    const was = window.matchMedia
    let wide = false
    const heard: (() => void)[] = []
    ;(window as any).matchMedia = (q: string) => ({ media: q, get matches() { return /min-width/.test(q) ? wide : false },
      addEventListener: (_: string, f: () => void) => heard.push(f), removeEventListener: (_: string, f: () => void) => { const i = heard.indexOf(f); if (i >= 0) heard.splice(i, 1) },
      addListener() {}, removeListener() {} })
    try {
      await click(date(2))
      await pressByKeys(more())
      expect(moreMenu()).toBeTruthy()
      wide = true
      await act(async () => { heard.slice().forEach(f => f()) })
      expect(moreMenu(), 'the ⋯ is no longer drawn, and its menu went with it').toBeNull()
    } finally { (window as any).matchMedia = was }
  })
})

describe('[D1646] the day bar\'s Templates (a phone\'s width) by the keys', () => {
  it('↓ on it opens its menu on its first pick', async () => {
    await click(date(2))
    const b = $('#sbBoard [data-daytpladd]')
    expect(b, 'the day bar\'s Templates').toBeTruthy()
    b.focus()
    await key('ArrowDown')
    expect(menu(), '↓ opened the menu').toBeTruthy()
    expect(menu().contains(at()) && at().tagName === 'BUTTON', 'the keys are in it').toBe(true)
    await key('Escape')
    expect(keysOn(b), 'the keys back on Templates').toBe(true)
  })
  it('the reads (Astra 2, Opus 2): ↓ on it with ANOTHER board menu up opens its own, never goes into the other', async () => {
    await click(date(2))
    await click($('#sbBoard [data-dwadd]'))
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    expect(menu(), '+ Block\'s menu is up').toBeTruthy()
    const b = $('#sbBoard [data-daytpladd]')
    b.focus()
    await key('ArrowDown')
    expect($$('.wavemenu').length, 'one menu').toBe(1)
    expect(menu().querySelector('[data-daytplsave]'), 'and it is the day\'s Templates').toBeTruthy()
    expect(menu().contains(at()) && at().tagName === 'BUTTON', 'the keys are in it').toBe(true)
    await key('Escape')
    expect(keysOn(b), 'the keys back on Templates').toBe(true)
  })
  it('Opus Q2: a held Enter on + Block opens its menu and adds nothing — the repeat on its first pick is ignored', async () => {
    await click(date(2))
    await pressByKeys($('#sbBoard [data-dwadd]'))
    expect(menu().contains(at()), 'the keys on its first pick').toBe(true)
    const rep = await key('Enter', { repeat: true })
    expect(rep.defaultPrevented, 'the repeat presses nothing').toBe(true)
    expect(menu(), 'the menu still up').toBeTruthy()
    await key('Escape')
  })
})
