// @vitest-environment jsdom
/* ESCAPE CLOSES THE ALL AVAIL WINDOW AND THE CHANGES WINDOW WHEN IT WAS THE LAST THING OPENED ([ALLAVAIL-ESCAPE]; the
   changes window by his D2112, 17 Nov 26 — "yes all as recommended"; the design guide §2: Escape closes what opened
   last, and the keys go back to the button that opened it). Both windows float over the schedule without blocking it
   (D38, D41, D167), so neither holds the keys, and Escape did nothing with either up. Now each joins the one Escape list
   (ui/sheetfocus.ts escCloses) as it opens: the newest answers — a window opened, re-opened or pressed later stands over
   one opened before — and whatever was opened over the window after it answers first: a question sheet, a seat armed
   after it, the bell's list, a schedule box the keys are in (D1011: its own Escape puts the old value back). Every case
   that closes a window is red on `main`, where Escape left both open.
   AND THE COUNT IS A PLACE A FINGER LANDS ([WEEK-AA-CHIP-PHONE], 17 Nov 26): WebKit sent a finger's tap on the week's
   count to the puck beside it, the one of the two the keys could land on, so the row armed and the window never opened.
   The count carries tabindex="-1" — a place the keys and a finger land, never a stop of the Tab route. Driven through
   the real App, the keys sent where the keyboard is, as boardescape.test.tsx does. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { ensureRowIds } from '../engine/rowids'
import { HOOKS } from '../engine/hooks'
import { AVAILWIN, setAvailWin, setBellList, BELLLIST } from './pops'
import { openScheduler } from './board'
import { forward, gone, _resetFloatWins } from './winorder'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const down = async (el: Element | null) => {
  expect(el, 'press target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })
}
/* a key pressed where the keyboard is, as a person presses it */
const key = async (k: string) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
  })
}
const TUE = 1
const DSNAP = JSON.stringify(DAYS)
/* a ground row carrying ALL AVAIL on Tuesday, so the week and the board draw its count */
const seedRow = async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  ;(DAYS[TUE] as any).ground = [...((DAYS[TUE] as any).ground || []), { prog: 'ALL AVAIL TEST', str: '12:30', end: '13:30', who: 'allavail' }]
  ensureRowIds(DAYS)
  await act(async () => { view.afterSchedMutate(); notify() })
}
/* who stands behind the puck — the Leave War's answer, which the test world does not run (as availwin.test.tsx sets it) */
const sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
const weekChip = () => $(`#eWeek .day[data-day="${TUE}"] [data-oilsent]`)
const boardChip = () => $('#sbBoard [data-oilsent]')
const availUp = () => !!AVAILWIN && !!$('.availwin:not([hidden])')
const chgUp = () => !!view.CHGWIN && !!$('.chgwin:not([hidden])')
const boardOpen = () => view.SBDAY != null && !($('#schedBoard') as any).hidden
const openChg = async () => { await click($('#chgBtn') || $$('button').find(b => b.querySelector('.chgnum') || /changes/i.test(b.getAttribute('aria-label') || '')) || null) }

beforeAll(async () => {
  HOOKS.oilSentinel = () => ['bane', 'freak']
  HOOKS.oilDayISO = (di: number) => `2026-07-${String(13 + di).padStart(2, '0')}`   // the demo week, Monday 13 Jul
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await act(async () => {
    setAvailWin(null); view.setChgWin(null); setBellList(false)
    if (view.ARM) view.disarmSlot()
    _resetFloatWins()
    notify()
  })
  if (view.SBDAY != null) await click($('#sbDone'))
  await seedRow()
})

describe('Escape closes the ALL AVAIL window', () => {
  it('opened from the week\'s count: Escape closes it, and the keys are back on the count', async () => {
    const chip = weekChip()
    expect(chip, 'the week draws the count').toBeTruthy()
    chip.focus()   // what a press of the mouse or a finger does to a place the keys can land
    await click(chip)
    expect(availUp(), 'the window is open').toBe(true)
    await key('Escape')
    expect(availUp(), 'Escape closed it').toBe(false)
    const at = document.activeElement as HTMLElement | null
    expect(at && at.dataset && at.dataset.oilsent, 'the keys are on the count that opened it').toBe(chip.dataset.oilsent)
  })

  it('with the keys on the window\'s own ✕: Escape closes it', async () => {
    await click(weekChip())
    ;($('.availwin .win-x') as HTMLElement).focus()
    await key('Escape')
    expect(availUp()).toBe(false)
  })

  it('opened from the board\'s count: Escape closes the window and the board stays; the next Escape closes the board', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    await click(boardChip())
    expect(availUp()).toBe(true)
    await key('Escape')
    expect(availUp(), 'the window closed').toBe(false)
    expect(boardOpen(), 'the board stays').toBe(true)
    await key('Escape')
    expect(boardOpen(), 'the board closed').toBe(false)
  })

  it('a schedule box the keys are in keeps its own Escape (D1011); the next Escape, off the box, closes the window', async () => {
    await click(weekChip())
    const box = $(`#eWeek .day[data-day="${TUE}"] [data-txt]`)
    expect(box, 'a text box on the week').toBeTruthy()
    box.focus()
    await key('Escape')
    expect(availUp(), 'the window waits while the box answers').toBe(true)
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    await key('Escape')
    expect(availUp()).toBe(false)
  })

  it('a seat armed after it opened is put down first; the next Escape closes the window', async () => {
    await click(weekChip())
    await act(async () => { view.armSlot(`d:${TUE}.0.0`); notify() })
    expect(view.ARM).toBeTruthy()
    await key('Escape')
    expect(view.ARM, 'the seat is put down').toBe(null)
    expect(availUp(), 'the window stays').toBe(true)
    await key('Escape')
    expect(availUp()).toBe(false)
  })

  it('a seat armed BEFORE it opened waits: the window, the last thing opened, closes first', async () => {
    await act(async () => { view.armSlot(`d:${TUE}.0.0`); notify() })
    await click(weekChip())
    expect(availUp()).toBe(true)
    await key('Escape')
    expect(availUp(), 'the window closed').toBe(false)
    expect(view.ARM, 'the seat is still armed').toBeTruthy()
    await key('Escape')
    expect(view.ARM).toBe(null)
  })

  it('the bell\'s list opened over it closes first', async () => {
    await click(weekChip())
    await act(async () => { setBellList(true); notify() })
    await key('Escape')
    expect(BELLLIST, 'the bell\'s list closed').toBe(false)
    expect(availUp(), 'the window stays').toBe(true)
    await key('Escape')
    expect(availUp()).toBe(false)
  })
})

describe('Escape closes the changes window (D2112)', () => {
  it('opened from the board\'s History: Escape closes it and the board stays; the next Escape closes the board', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    await click($('#sbHist'))
    expect(chgUp(), 'the changes window is open').toBe(true)
    await key('Escape')
    expect(chgUp(), 'Escape closed it').toBe(false)
    expect(view.CHGWIN).toBe(null)
    expect(boardOpen(), 'the board stays').toBe(true)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })

  it('opened from a day\'s count on the week: Escape closes it', async () => {
    const day = $(`#eWeek .day[data-day="${TUE}"] [data-pendlist], #eWeek .day[data-day="${TUE}"] [data-chgday]`)
    if (day) await click(day)
    else await openChg()
    expect(chgUp()).toBe(true)
    await key('Escape')
    expect(chgUp()).toBe(false)
  })
})

describe('two windows up: the one opened or pressed last answers first', () => {
  it('ALL AVAIL then the changes window: Escape closes the changes window, then ALL AVAIL', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    await click(boardChip())
    await click($('#sbHist'))
    expect(availUp() && chgUp()).toBe(true)
    await key('Escape')
    expect(chgUp(), 'the changes window, opened last, closed').toBe(false)
    expect(availUp(), 'ALL AVAIL stays').toBe(true)
    await key('Escape')
    expect(availUp()).toBe(false)
    expect(boardOpen(), 'the board stays under both').toBe(true)
  })

  it('the changes window then ALL AVAIL: ALL AVAIL closes first', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    await click($('#sbHist'))
    await click(boardChip())
    await key('Escape')
    expect(availUp()).toBe(false)
    expect(chgUp()).toBe(true)
    await key('Escape')
    expect(chgUp()).toBe(false)
  })

  it('ALL AVAIL pressed after the changes window opened over it: ALL AVAIL closes first', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    await click(boardChip())
    await click($('#sbHist'))
    await down($('.availwin .win-body'))
    await key('Escape')
    expect(availUp(), 'the window pressed last closed').toBe(false)
    expect(chgUp()).toBe(true)
  })

  it('a window of the input kind brought in front after it (an input\'s own window) answers first; then ALL AVAIL closes', async () => {
    await click(weekChip())
    await act(async () => { forward('inputedit') })   // what the input's own window does as it opens (FloatWindow.tsx)
    await key('Escape')
    expect(availUp(), 'ALL AVAIL waits while the input window is in front').toBe(true)
    await act(async () => { gone('inputedit') })      // what it does as it closes
    await key('Escape')
    expect(availUp()).toBe(false)
  })
})

describe('the count is a place a finger lands, never a Tab stop', () => {
  it('every count the week and the board draw carries tabindex -1', async () => {
    await act(async () => { openScheduler(TUE); notify() })
    const chips = $$('[data-oilsent]')
    expect(chips.length, 'counts on the week and the board').toBeGreaterThan(1)
    for (const c of chips) expect(c.getAttribute('tabindex'), c.outerHTML.slice(0, 80)).toBe('-1')
  })
})
