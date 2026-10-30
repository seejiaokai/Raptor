// @vitest-environment jsdom
/* THE TRAFFIC WINDOW AND THE BAR OVER IT ([TRAFFIC-WIN-COVERS-UNDO], 30 Oct 26 — ui/Modals.tsx AirPop).
   The window's veil covered the top bar, so its Undo and Redo could not be pressed while it was open (the walk of 21 Oct 26;
   a browser cannot be fooled about that — e2e/board-escape-traffic.spec.ts proves the press lands). The bar stays
   pressable now, and what that makes reachable is pinned here, through the real App and the real buttons:
   · Undo and Redo keep the window open and read the change back into its list — and the next line typed is logged
     against what the undo left, never against the value it took away;
   · any other control of the bar closes the window first (the bell, a page tab);
   · a page change and a week change close it (an undo can land on either);
   · an undo that puts a wave back in front of this one leaves the window on ITS wave; one that takes the wave away closes
     the window, without throwing.
   Each is red on `main`, where the veil kept every one of these routes out of reach — the press here is a plain DOM click,
   which jsdom (no layout) lets through, so `main` shows what the press would have done had it landed. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { shiftWeek } from './weeknav'
import { elogFor, elogClear } from '../engine/editlog'
import { AIRKEY, setAirKey } from './pops'
import { installGlobalUndo } from '../state/undo-wire'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const goPage = async (p: string) => click($$('.nav a[data-page]').find(a => a.dataset.page === p)!)
/* a flying wave of the day, by its place */
const flyWave = (di: number) => DAYS[di].waves.findIndex((w: any) => w && !w.sa)
const openAir = async (di: number, gi: number) => {
  await click($(`#eWeek [data-air="${di}|${gi}"]`))
  expect(($('#airpop') as any).hidden, 'the Traffic window is open').toBe(false)
}
const lines = () => $$('#airBody [data-airi]').map(b => (b as HTMLInputElement).value)
/* a line typed and left, as a person does it: each key into the list, then the box left (its blur saves) */
const typeLine = async (i: number, v: string) => {
  const b = $(`#airBody [data-airi="${i}"]`) as HTMLInputElement
  b.focus(); b.value = v
  await act(async () => { b.dispatchEvent(new Event('input', { bubbles: true })) })
  await act(async () => { b.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); b.blur() })
}
const airOpen = () => AIRKEY != null && !($('#airpop') as any).hidden

beforeAll(async () => {
  initStore()
  /* the Undo / Redo buttons drive the one timeline — installed as main.tsx does, or they stay inert */
  installGlobalUndo()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await goPage('editsched')
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  elogClear()
  if (AIRKEY != null) await act(async () => { setAirKey(null); notify() })
  if (view.CURPAGE !== 'editsched') await goPage('editsched')
})

describe('the top bar\'s Undo and Redo, with the window open', () => {
  it('Undo takes back the line just added, the window stays open and shows it gone; Redo puts it back', async () => {
    const gi = flyWave(0)
    await openAir(0, gi)
    const before = lines()
    await click($('#airAdd'))
    expect(lines().length).toBe(before.length + 1)
    await click($('#undoBtn'))
    expect(airOpen(), 'the window stays open through Undo').toBe(true)
    expect(lines(), 'the list read back: the added line is gone').toEqual(before)
    await click($('#redoBtn'))
    expect(airOpen()).toBe(true)
    expect(lines().length, 'Redo puts it back').toBe(before.length + 1)
    await click($('#undoBtn'))
    await click($('#airDone'))
  })

  it('the next line typed after an Undo is logged against what the Undo left — not the value it took away', async () => {
    const gi = flyWave(1)
    await openAir(1, gi)
    await click($('#airAdd'))                         // a line to work on, kept
    const base = lines()
    const i = base.length - 1
    await typeLine(i, 'FIRST TRY')
    await click($('#undoBtn'))                        // the typing taken back: the line reads as it was
    expect(lines()[i]).toBe(base[i])
    await typeLine(i, 'SECOND TRY')
    const row = elogFor(`tr:1.${gi}`)
    expect(row, 'the second line typed reached the log').toBeTruthy()
    expect(row!.from, 'its "before" is the list the Undo left').toBe(base.join(' · '))
    expect(row!.from).not.toContain('FIRST TRY')
    await click($('#undoBtn')); await click($('#undoBtn'))
    await click($('#airDone'))
  })
})

describe('any other control of the bar closes the window first', () => {
  it('the bell: the window closes, the bell\'s list opens', async () => {
    await openAir(0, flyWave(0))
    const bell = $('#notifyBell')
    expect(bell, 'the top bar\'s bell').toBeTruthy()
    await click(bell)
    expect(airOpen(), 'the Traffic window closed').toBe(false)
    await act(async () => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })) })
  })

  it('a page tab: the window closes and does not come back over the next page', async () => {
    await openAir(0, flyWave(0))
    await goPage('inputs')
    expect(view.CURPAGE).toBe('inputs')
    expect(AIRKEY, 'the window is closed, not hidden').toBe(null)
    await goPage('editsched')
    expect(airOpen(), 'and back on Edit Schedule it is not open').toBe(false)
  })
})

describe('a page or a week change closes it', () => {
  it('a page change by any route (the keys on a page tab, an undo landing elsewhere)', async () => {
    await openAir(0, flyWave(0))
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(AIRKEY).toBe(null)
  })

  it('a week change', async () => {
    await openAir(0, flyWave(0))
    const wk = CURWEEK
    await act(async () => { loadWeek(shiftWeek(wk, 1)) })
    expect(AIRKEY, 'the window for last week\'s wave is closed').toBe(null)
    await act(async () => { loadWeek(wk) })
  })

  /* the week change above is closed twice over: by the week reset, and by the wave's own id, which the next week's waves
     do not carry (airGo). This pins the first on its own — the registry entry a week swap runs — since a wave with no id
     (an old record) would be found by its place alone */
  it('the week reset itself closes it', async () => {
    await openAir(0, flyWave(0))
    await act(async () => { view.resetViewState('week'); notify() })
    expect(AIRKEY).toBe(null)
  })
})

describe('the window follows its wave', () => {
  it('an Undo that puts a deleted wave back in front of this one: the window stays on ITS wave', async () => {
    const di = 2
    const first = flyWave(di)
    const second = DAYS[di].waves.findIndex((w: any, j: number) => j > first && w && !w.sa)
    expect(second, 'two flying waves on the day').toBeGreaterThan(first)
    const keepRid = DAYS[di].waves[second].rid
    const keepLabel = DAYS[di].waves[second].label
    /* the first wave deleted through the board's own control, then the window opened on the one after it */
    await click($(`#eWeek .day[data-day="${di}"] .dt.sb-open`))
    await click($(`#sbBoard [data-gdel="${di}.${first}"]`))
    await act(async () => {})
    const now = DAYS[di].waves.findIndex((w: any) => w && w.rid === keepRid)
    expect(now, 'the second wave moved up one place').toBe(second - 1)
    await click($('#sbDone'))
    await openAir(di, now)
    expect($('#airTitle').textContent).toContain(keepLabel || '')
    await click($('#undoBtn'))                         // the deleted wave comes back in front of it
    expect(DAYS[di].waves.findIndex((w: any) => w && w.rid === keepRid), 'the undo put it back at its old place').toBe(second)
    expect(airOpen(), 'the window stays open').toBe(true)
    expect(AIRKEY, 'on its own wave, at its new place').toBe(`${di}|${second}`)
    expect($('#airTitle').textContent).toContain(keepLabel || '')
    await click($('#airDone'))
  })

  it('an Undo that takes the wave away: the window closes, nothing thrown', async () => {
    const di = 3
    await click($(`#eWeek .day[data-day="${di}"] .dt.sb-open`))
    const n = DAYS[di].waves.length
    await click($(`#sbBoard [data-wvadd="${di}"]`))
    await click($('.wavemenu [data-wmkind=""]'))
    await act(async () => {})
    expect(DAYS[di].waves.length, 'a wave added').toBe(n + 1)
    const gi = DAYS[di].waves.length - 1
    await click($('#sbDone'))
    await openAir(di, gi)
    await click($('#undoBtn'))                         // the wave's adding taken back
    expect(DAYS[di].waves.length).toBe(n)
    expect(airOpen(), 'the window went with its wave').toBe(false)
    expect(AIRKEY).toBe(null)
  })
})
