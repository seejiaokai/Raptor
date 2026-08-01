// @vitest-environment jsdom
/* The scheduler board — tfin's board group ("sched board opens", "sched lines
   render", "sched roster render", "sched wave title select", "sched
   setSlotVal", "the board shows the open day's strip", "board inputs panel")
   and the R group (CX carries a reason, B28), driven through the React app. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { slotVal, setSlotVal } from '../engine/slots'
import { isStandalone } from '../engine/waves'
import { SBDAY, afterSchedMutate } from '../state/view'
import * as view from '../state/view'
import { cxText } from './html'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const change = async (el: Element, value: string) => {
  await act(async () => {
    (el as HTMLInputElement).value = value
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('the scheduler board (tfin board group)', () => {
  it('a day head on the edit week opens the board', async () => {
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
    expect(SBDAY).toBe(0)
    expect(($('#schedBoard') as any).hidden).toBe(false)
  })

  it('sched lines render', () => {
    expect($$('#sbBoard .sb-line').length).toBeGreaterThanOrEqual(1)
  })

  it('sched roster render', () => {
    expect($$('#sbRoster .rpuck').length).toBeGreaterThan(10)
  })

  it('sched wave title select', () => {
    expect($$('#sbBoard .sb-wtitle').length).toBeGreaterThanOrEqual(1)
  })

  it("the board shows the open day's strip, inside the scrolling board", () => {
    const el = $('#sbSignBar')
    expect(el).toBeTruthy()
    expect(el.querySelectorAll('select[data-sign]').length).toBe(4)
    expect(el.closest('.sb-top')).toBeFalsy()
    expect(el.closest('#sbBoard')).toBeTruthy()
    /* B27 — the strip is the board's FIRST child so it scrolls with the day */
    expect($('#sbBoard').firstElementChild).toBe(el)
  })

  it('board inputs panel, banded by time of day', () => {
    expect($$('#sbInputs .sbi-row').length).toBeGreaterThanOrEqual(1)
    expect($$('#sbInputs .sbi-band').length).toBeGreaterThanOrEqual(1)
    expect(/morning/i.test($('#sbInputs').textContent!)).toBe(true)
  })

  it('sched setSlotVal — a board slot round-trips through the funnel', () => {
    const slot = document.querySelector('#sbBoard .seat[data-slot]') || document.querySelector('#sbBoard .sb-slot.empty[data-slot]')
    expect(slot).toBeTruthy()
    const key = (slot as HTMLElement).dataset.slot!
    const before = slotVal(key)
    setSlotVal(key, 'bane')
    expect(slotVal(key)).toBe('bane')
    setSlotVal(key, before || '')
  })

  it('the day tabs switch the board day, and a cross-day switch disarms', async () => {
    /* arm an empty seat on day 0 through the board's own click handler */
    const empty = document.querySelector('#sbBoard .sb-slot.empty[data-slot],#sbBoard .seat[data-slot]:empty') as HTMLElement | null
    if (empty) {
      await click(empty)
      expect(view.ARM).toBeTruthy()
    }
    await click($('#sbDays [data-sbtab="1"]'))
    expect(SBDAY).toBe(1)
    expect(/Tue|TUE/i.test($('#sbDay').textContent!)).toBe(true)
    expect(view.ARM).toBe(null)
    await click($('#sbDays [data-sbtab="0"]'))
    expect(SBDAY).toBe(0)
  })

  it('+ Line seeds the new line from the last one on the LAST wave', async () => {
    const d = DAYS[0]
    const w = d.waves[d.waves.length - 1]
    const nBefore = w.formations.length
    const last = w.formations[w.formations.length - 1]
    await click($('#sbAddLine'))
    expect(w.formations.length).toBe(nBefore + 1)
    const f = w.formations[w.formations.length - 1]
    expect(f.to).toBe(last.to)
    expect(f.cs).toBe(last.cs)
    expect(f.aircraft.length).toBe(1)
    /* the seed key is marked pending so the line can be published */
    expect(SCHED.pending[`ff:0.${d.waves.length - 1}.${w.formations.length - 1}.cs`]).toBeTruthy()
    /* put it back */
    w.formations.pop()
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('+ Wave opens the kind menu: a flying wave and the three standalone kinds', async () => {
    await click($('#sbAddGo'))
    const menu = $('.wavemenu')
    expect(menu).toBeTruthy()
    const kinds = [...menu.querySelectorAll('[data-wmkind]')].map(b => (b as HTMLElement).dataset.wmkind)
    expect(kinds).toEqual(['', 'sc', 'avalon', 'bb'])
    /* no day chips when opened from the board — the day is already chosen */
    expect(menu.querySelector('[data-wmday]')).toBeFalsy()
  })

  it('choosing Flying wave adds one, and its label key is marked pending', async () => {
    const d = DAYS[0], nBefore = d.waves.length
    await click($('.wavemenu [data-wmkind=""]'))
    expect(d.waves.length).toBe(nBefore + 1)
    expect(SCHED.pending[`wl:0.${d.waves.length - 1}`]).toBeTruthy()
    expect($('.wavemenu')).toBeFalsy()
  })

  it('✕ Wave removes it again', async () => {
    const d = DAYS[0], nBefore = d.waves.length
    await click($(`#sbBoard [data-gdel="0.${nBefore - 1}"]`))
    expect(d.waves.length).toBe(nBefore - 1)
  })

  it('an AVALON wave arrives complete WITH its duty block, and deleting it removes both', async () => {
    const d = DAYS[0]
    const nW = d.waves.length, nDW = (d.dutywaves || []).length
    await click($('#sbAddGo'))
    await click($('.wavemenu [data-wmkind="avalon"]'))
    expect(d.waves.length).toBe(nW + 1)
    expect(isStandalone(d.waves[d.waves.length - 1])).toBeTruthy()
    expect(d.dutywaves.length).toBe(nDW + 1)
    await click($(`#sbBoard [data-gdel="0.${d.waves.length - 1}"]`))
    expect(d.waves.length).toBe(nW)
    expect(d.dutywaves.length).toBe(nDW)
  })

  it('a board field commits through the text funnel and earns a pending mark', async () => {
    const inp = document.querySelector('#sbBoard input[data-bfld^="ff:"][data-bfld$=".msn"]') as HTMLInputElement
    expect(inp).toBeTruthy()
    const key = inp.dataset.bfld!, before = inp.value
    await change(inp, 'BFM 2V2')
    expect(SCHED.pending[key]).toBeTruthy()
    const d = DAYS[0]
    const [, gi, li] = key.replace('ff:', '').split('.').map(Number)
    expect(d.waves[gi!].formations[li!].msn).toBe('BFM 2V2')
    await change(document.querySelector(`#sbBoard input[data-bfld="${key}"]`) as HTMLInputElement, before)
  })

  it('the red-box flag toggles on a line', async () => {
    const btn = document.querySelector('#sbBoard [data-lflag]') as HTMLElement
    const key = btn.dataset.lflag!
    const [di, gi, li, ai] = key.split('.').map(Number)
    const a = DAYS[di!].waves[gi!].formations[li!].aircraft[ai!]
    expect(!!a.flag).toBe(false)
    await click(btn)
    expect(a.flag).toBe(true)
    expect(document.querySelector('#sbBoard .sb-line.redbox')).toBeTruthy()
    await click(document.querySelector(`#sbBoard [data-lflag="${key}"]`))
    expect(a.flag).toBe(false)
  })

  it('deleting a line renumbers the keys under it (shiftAircraft/shiftFormation)', async () => {
    /* seed: two fresh single-aircraft lines on the last wave; a name on the
       SECOND must survive the delete of the first under a DECREMENTED key */
    const d = DAYS[0]
    const gi = d.waves.length - 1
    const w = d.waves[gi]
    await click($('#sbAddLine'))
    await click($('#sbAddLine'))
    const li = w.formations.length - 1        // the second new line
    setSlotVal(`0.${gi}.${li}.0.p`, 'bane')
    await act(async () => { afterSchedMutate(); notify() })
    const wasLines = w.formations.length
    /* delete the FIRST of the two new lines — one aircraft, so the whole
       formation goes and everything after it renumbers */
    await click(document.querySelector(`#sbBoard [data-ldel="0.${gi}.${li - 1}.0"]`))
    expect(w.formations.length).toBe(wasLines - 1)
    expect(slotVal(`0.${gi}.${li - 1}.0.p`)).toBe('bane')
    /* clean up */
    setSlotVal(`0.${gi}.${li - 1}.0.p`, '')
    w.formations.pop()
    await act(async () => { afterSchedMutate(); notify() })
  })
})

describe('CX carries a reason (tfin R group, B28)', () => {
  const cxBtn = () => document.querySelector('#sbBoard .mbtn[data-lcx]') as HTMLElement

  it('the CX button opens a box, it does not toggle silently', async () => {
    await click(cxBtn())
    expect(($('#cxPop') as any).hidden).toBe(false)
    /* nothing is cancelled just by opening it */
    expect($$('#sbBoard .cxtag').length).toBe(0)
  })

  it('it asks for a reason under a CX DUE label', () => {
    expect(/CX DUE/.test($('#cxPop .cxlead').textContent!)).toBe(true)
    expect($('#cxReason')).toBeTruthy()
  })

  it('it offers the usual reasons', () => {
    expect($$('#cxQuick [data-cxq]').length).toBeGreaterThanOrEqual(6)
  })

  it('Un-cancel is hidden on a line that is not cancelled, and the action button says what it will do', () => {
    expect(($('#cxUn') as any).hidden).toBe(true)
    expect(/Cancel line/.test($('#cxSave').textContent!)).toBe(true)
  })

  it('a quick reason fills the field', async () => {
    await click($('#cxQuick [data-cxq]'))
    expect(($('#cxReason') as HTMLInputElement).value.length).toBeGreaterThan(0)
  })

  it('saving cancels the line and keeps the reason', async () => {
    ;($('#cxReason') as HTMLInputElement).value = 'U/S AIRCRAFT'
    await click($('#cxSave'))
    expect(($('#cxPop') as any).hidden).toBe(true)
    const tags = [...document.querySelectorAll('.cxtag')].map(x => x.textContent)
    expect(tags.some(x => x === 'CX DUE U/S AIRCRAFT')).toBe(true)
  })

  it('cxText falls back to a plain CX with no reason', () => {
    expect(cxText({ cx: true })).toBe('CX')
    expect(cxText({ cx: true, cxr: 'WX' })).toBe('CX DUE WX')
  })

  it('re-clicking CX reopens the box to edit the reason', async () => {
    await click(cxBtn())
    expect(($('#cxPop') as any).hidden).toBe(false)
    expect(($('#cxReason') as HTMLInputElement).value).toBe('U/S AIRCRAFT')
    expect(($('#cxUn') as any).hidden).toBe(false)
    expect(/Save reason/.test($('#cxSave').textContent!)).toBe(true)
  })

  it('Un-cancel restores the line and drops the reason', async () => {
    await click($('#cxUn'))
    expect($$('#sbBoard .cxtag').length).toBe(0)
  })
})

describe('board lifecycle', () => {
  it('the wave-title select renames the wave and sets the night flag', async () => {
    const sel = document.querySelector('#sbBoard .sb-wtitle[data-wsel]') as HTMLSelectElement
    const [di, gi] = sel.dataset.wsel!.split('.').map(Number)
    const w = DAYS[di!].waves[gi!]
    const before = { label: w.label, night: w.night }
    await change(sel, 'Night wave')
    expect(w.night).toBe(true)
    await change(document.querySelector(`#sbBoard .sb-wtitle[data-wsel="${di}.${gi}"]`) as HTMLSelectElement,
      before.night ? 'Night wave' : '1st wave')
    w.label = before.label; w.night = before.night
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('Done closes the board', async () => {
    await click($('#sbDone'))
    expect(SBDAY).toBe(null)
    expect(($('#schedBoard') as any).hidden).toBe(true)
  })

  it('logout closes the scheduler board', async () => {
    await act(async () => { openScheduler(0) })
    expect(($('#schedBoard') as any).hidden).toBe(false)
    await click($('#logout'))
    expect(SBDAY).toBe(null)
    expect($('#schedBoard')).toBeFalsy()
    /* back in for any later suites */
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
