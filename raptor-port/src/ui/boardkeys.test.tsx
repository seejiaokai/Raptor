// @vitest-environment jsdom
/* THE BOARD'S KEYBOARD LEFTOVERS (the night of 3 Nov 26 — [BOARD-OPEN-BY-KEYS], and [VEILED-WINDOWS-BAR]'s Escape part).
   · The day's date on Edit Schedule's week, which opens the Scheduler Board, was no stop for the keys and answered none:
     a keyboard user could not open the board. It is a stop now; Enter and Space open the board, the keys go onto it, and
     Escape or ✓ Done gives them back to the date.
   · The board's small menus (+ Block, Templates, the plans selector, a jet's stores, + Wave), the Traffic window and the
     day-details window did not close on Escape — with one of them up, Escape did nothing at all. Each closes on Escape now,
     and only it: the board under it stays, and the keys go back to the button that opened it.
   · The schedule's own Tab route walks text boxes only (D551–D555, D597) and does not change: the date is not one of its
     stops, and Shift+Tab from a day's first box does not land on it.
   Driven through the real App, the keys sent where the keyboard is, as boardescape.test.tsx and windowkeys.test.tsx do.
   Every case but the last describe's is red on the code before this change. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { AIRKEY } from './pops'

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
const key = async (k: string, o: KeyboardEventInit = {}) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }))
  })
}
/* the button is focused, then pressed — what it opens is a keyboard user's */
const pressKeyed = async (el: HTMLElement) => { el.focus(); await click(el) }
const date = (di: number) => $(`#eWeek .day[data-day="${di}"] .dt.sb-open`)
const boardOpen = () => view.SBDAY != null && !($('#schedBoard') as any).hidden
/* the keyboard is on this control — or on the one a string redraw put in its place (the same marks) */
const keysOn = (el: HTMLElement) => {
  const a = document.activeElement as HTMLElement | null
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
  if (AIRKEY != null) await click($('#airClose'))
  if (!($('#dayPop') as any).hidden) await click($('#dayPopClose'))
  if (view.SBDAY != null) await click($('#sbDone'))
  ;(document.activeElement as HTMLElement | null)?.blur?.()
})

describe("[BOARD-OPEN-BY-KEYS] the day's date opens the board by the keys", () => {
  it('is a stop for the keys, a button to a screen reader', () => {
    const d = date(2)
    expect(d, "the edit week's date").toBeTruthy()
    expect(d.tabIndex, 'a Tab stop').toBe(0)
    expect(d.getAttribute('role')).toBe('button')
  })

  it('Enter opens the board and puts the keys on it; Escape closes it and the keys are back on the date', async () => {
    const d = date(2)
    d.focus()
    expect(document.activeElement).toBe(d)
    await key('Enter')
    expect(boardOpen(), 'Enter opened the board').toBe(true)
    expect(view.SBDAY).toBe(2)
    expect($('#schedBoard').contains(document.activeElement), 'the keys are on the board, not the week behind it').toBe(true)
    await key('Escape')
    expect(boardOpen(), 'Escape closed it').toBe(false)
    expect(keysOn(d), 'the keys are back on the date').toBe(true)
  })

  it('Space opens it too; ✓ Done pressed by the keys gives the keys back to the date', async () => {
    const d = date(4)
    d.focus()
    await key(' ')
    expect(view.SBDAY, 'Space opened the board').toBe(4)
    $('#sbDone').focus()
    await click($('#sbDone'))
    expect(boardOpen()).toBe(false)
    expect(keysOn(d), 'the keys are back on the date').toBe(true)
  })

  it('a held key\'s repeat, or Enter with Ctrl, opens nothing', async () => {
    date(1).focus()
    await key('Enter', { repeat: true })
    expect(view.SBDAY).toBe(null)
    await key('Enter', { ctrlKey: true })
    expect(view.SBDAY).toBe(null)
  })
})

describe("[VEILED-WINDOWS-BAR] the board's small menus close on Escape, the board staying", () => {
  const menus: [string, string][] = [
    ['+ Block', '#sbBoard [data-dwadd]'],
    ['Templates', '#sbTpl'],
    ['the plans selector', '#schedBoard [data-planmenu]'],
    ["a jet's stores", '#sbBoard [data-stcfg]'],
    ['+ Wave', '#sbBoard [data-wvadd]'],
  ]
  for (const [name, sel] of menus) {
    it(`${name}: Escape closes the menu only, and the keys are back on its button; the next Escape closes the board`, async () => {
      await click(date(2))
      expect(boardOpen()).toBe(true)
      const b = $(sel)
      expect(b, `${name}'s button on the board`).toBeTruthy()
      await pressKeyed(b)
      expect($('.wavemenu'), `${name}'s menu is up`).toBeTruthy()
      await key('Escape')
      expect($('.wavemenu'), 'the menu closed').toBeNull()
      expect(boardOpen(), 'the board stays under it').toBe(true)
      expect(keysOn(b), 'the keys are back on its button').toBe(true)
      await key('Escape')
      expect(boardOpen(), 'the next Escape closes the board').toBe(false)
    })
  }

  it('a menu opened on the week closes on Escape too (+ the week\'s Templates)', async () => {
    const b = $('#eWeek .day[data-day="1"] [data-daytplopen]')
    expect(b).toBeTruthy()
    await pressKeyed(b)
    expect($('.wavemenu')).toBeTruthy()
    await key('Escape')
    expect($('.wavemenu')).toBeNull()
    expect(keysOn(b)).toBe(true)
  })
})

describe('[VEILED-WINDOWS-BAR] the Traffic and day-details windows close on Escape', () => {
  const flyWave = (di: number) => DAYS[di].waves.findIndex((w: any) => w && !w.sa)

  it('the Traffic window on the week: Escape closes it, the keys back on its Traffic button', async () => {
    const b = $(`#eWeek [data-air="1|${flyWave(1)}"]`)
    expect(b, 'a Traffic button on the week').toBeTruthy()
    await pressKeyed(b)
    expect(($('#airpop') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#airpop') as any).hidden, 'the window closed').toBe(true)
    expect(keysOn(b), 'the keys are back on the Traffic button').toBe(true)
  })

  it('a line being typed, then Escape: kept, as a press on ✕ keeps it, and the window closes', async () => {
    const gi = flyWave(1)
    await pressKeyed($(`#eWeek [data-air="1|${gi}"]`))
    await click($('#airAdd'))
    const boxes = $$('#airBody [data-airi]') as HTMLInputElement[]
    const line = boxes[boxes.length - 1]!
    line.focus()
    line.value = 'TYPED BY KEYS'
    await act(async () => { line.dispatchEvent(new Event('input', { bubbles: true })) })
    await key('Escape')
    expect(($('#airpop') as any).hidden).toBe(true)
    expect(DAYS[1].waves[gi].traffic, 'the line typed is kept').toContain('TYPED BY KEYS')
  })

  it('the Traffic window over the board: Escape closes it and only it, the keys on the board\'s Traffic button', async () => {
    await click(date(2))
    const b = $(`#sbBoard [data-air="2|${flyWave(2)}"]`)
    expect(b, "a Traffic button on the board").toBeTruthy()
    await pressKeyed(b)
    expect(($('#airpop') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#airpop') as any).hidden, 'the window closed').toBe(true)
    expect(boardOpen(), 'the board stays').toBe(true)
    expect(keysOn(b) && $('#sbBoard').contains(document.activeElement), "the keys are on the board's own Traffic button").toBe(true)
    await key('Escape')
    expect(boardOpen(), 'the next Escape closes the board').toBe(false)
  })

  it('the day-details window on the week: Escape closes it, the keys back on its ⓘ', async () => {
    const b = $('#eWeek .day[data-day="0"] .dinfobtn')
    expect(b, "the day's ⓘ").toBeTruthy()
    await pressKeyed(b)
    expect(($('#dayPop') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#dayPop') as any).hidden, 'the window closed').toBe(true)
    expect(keysOn(b)).toBe(true)
  })

  it('the day-details window over the board: Escape closes it, the board staying', async () => {
    await click(date(0))
    const b = $('#schedBoard .dinfobtn')
    expect(b, "the board's ⓘ").toBeTruthy()
    await pressKeyed(b)
    expect(($('#dayPop') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#dayPop') as any).hidden).toBe(true)
    expect(boardOpen(), 'the board stays').toBe(true)
    expect($('#schedBoard').contains(document.activeElement), "the keys are on the board's ⓘ").toBe(true)
  })
})

describe("the schedule's own Tab route is unchanged by the date's stop (D551–D555, D597)", () => {
  /* the route over one day's text boxes, Tab by Tab from its first, for its first 30 stops (each Tab saves and redraws, so a
     whole day is slow on a busy machine — and the date, which comes before every box, could only be met going back) */
  const walk = async (di: number) => {
    const day = $(`#eWeek .day[data-day="${di}"]`)
    const first = day.querySelector<HTMLElement>('[data-txt]')!
    first.focus()
    const seen: string[] = []
    for (let i = 0; i < 30; i++) {
      const a = document.activeElement as HTMLElement
      seen.push(a.tagName + JSON.stringify({ ...a.dataset }))
      if (!a.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]')) break
      await key('Tab')
      if (document.activeElement === a) break
    }
    return seen
  }

  it('the date is never one of its stops, and Shift+Tab from the first box does not land on it', async () => {
    const seen = await walk(0)
    expect(seen.length, 'the route walked the day').toBeGreaterThan(3)
    expect(seen.some(s => s.includes('"sbday"')), 'the date is not on the route').toBe(false)
    const first = $('#eWeek .day[data-day="0"] [data-txt]')
    first.focus()
    await key('Tab', { shiftKey: true })
    expect(document.activeElement, 'Shift+Tab from the first box').not.toBe(date(0))
    expect(view.SBDAY).toBe(null)
  }, 60000)
})

/* THE FRESH READ'S THREE FINDINGS (the night of 3 Nov 26, docs/handpass/parts/ws-read.md) — each red on e76f32440 */
describe('the fresh read: Escape in a box behind, the board box\'s Tab stop, the keys-open note', () => {
  it('a schedule box typed in behind the Traffic window: Escape is the box\'s (its old words back), the window stays', async () => {
    const gi = DAYS[1].waves.findIndex((w: any) => w && !w.sa)
    await pressKeyed($(`#eWeek [data-air="1|${gi}"]`))
    expect(($('#airpop') as any).hidden).toBe(false)
    const box = $('#eWeek .day[data-day="1"] [data-txt]')
    const was = box.textContent
    box.focus()
    box.textContent = 'TYPED BEHIND'
    await key('Escape')
    const now = $(`#eWeek .day[data-day="1"] [data-txt="${box.dataset.txt}"]`)
    expect(now.textContent, 'the box put its old words back').toBe(was)
    expect(($('#airpop') as any).hidden, 'the window stays').toBe(false)
    await key('Escape')
    expect(($('#airpop') as any).hidden, 'the next Escape closes the window').toBe(true)
  })

  it('a board box typed in under a board menu: Escape is the box\'s, the menu stays', async () => {
    await click(date(2))
    await pressKeyed($('#sbBoard [data-dwadd]'))
    expect($('.wavemenu')).toBeTruthy()
    const box = $('#sbBoard input.tm[data-bfld$=".to"]') as HTMLInputElement
    const was = box.value
    box.focus()
    box.value = '23:59'
    await key('Escape')
    expect(($(`#sbBoard input[data-bfld="${box.dataset.bfld}"]`) as HTMLInputElement).value, 'the old time is back').toBe(was)
    expect($('.wavemenu'), 'the menu stays').toBeTruthy()
    expect(boardOpen()).toBe(true)
  })

  it('opened by the keys, the board\'s box stops being a stop for the keys once they leave it', async () => {
    date(2).focus()
    await key('Enter')
    expect(document.activeElement).toBe($('#schedBoard'))
    $('#sbCal').focus()   // the keys leave the box — a Tab, or a press on the board's blank space and away
    expect($('#schedBoard').hasAttribute('tabindex'), 'no tabindex left on the board\'s box').toBe(false)
  })

  it('Enter on a date behind an already-open board leaves no note for the next open by the mouse', async () => {
    await click(date(1))
    expect(view.SBDAY).toBe(1)
    date(2).focus()
    await key('Enter')          // the board only changes its day
    expect(view.SBDAY).toBe(2)
    await click($('#sbDone'))
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    await click(date(3))        // opened by the mouse
    expect(view.SBDAY).toBe(3)
    expect(document.activeElement, 'a mouse open does not put the keys on the board\'s box').not.toBe($('#schedBoard'))
  })
})
