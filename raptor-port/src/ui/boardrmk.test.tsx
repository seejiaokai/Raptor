// @vitest-environment jsdom
/* THE ONE REMARKS BOX ASKED OPEN (owner, 12 Aug 26 — measured).

   On a phone a c6r row (duty/sim/ground) ran 109px in four stacked lines —
   role+times, people, remarks, control strip — and 13 of the 25 such rows on
   a Monday carried an EMPTY remarks box in that third line: ~30px apiece,
   27% of the row, for nothing. board-html.ts's sbRmk now marks that input
   `.rmkin.empty` whenever it holds nothing (scheduler.css hides it under
   820px), and sbRowCtl rides a "+" onto the row's own control strip to ask
   for it back — state/view.ts's RMKOPEN holds which ONE row asked, since
   the panel is a re-hung string and a class set by hand would be wiped by
   the next repaint.

   jsdom has no layout engine, so what this file CAN prove is the markup and
   the wiring: which input carries `.empty`, that the "+" clears it for its
   OWN row only, that a row already carrying a remark never had it, that
   typing one drops it on its own, and — the "pure UI state" contract this
   whole feature turns on — that asking for the box back is not a schedule
   write: no edit-log row, nothing marked pending. What it looks like painted
   is `e2e/geometry.spec.ts`. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { ELOG, elogClear } from '../engine/editlog'
import { openScheduler } from './board'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

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
/* the rmkadd handler defers its focus a macrotask out (same idiom as
   textedit.ts's txtCommit) — this waits past it */
const settle = async () => { await act(async () => { await new Promise(r => setTimeout(r, 5)) }) }

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

beforeEach(async () => {
  /* every duty row on DAYS[0] starts with no rmks in the fixture data, so
     each test clears whatever the last one wrote back to blank and drops
     any reveal before opening the board fresh */
  DAYS[0].dutywaves[0].rows.forEach((r: any) => { delete r.rmks })
  view.setRmkOpen(null)
  elogClear()
  SCHED.pending = {}
  await act(async () => { openScheduler(0); notify() })
})

const dutyRow = (ri: number) => $(`#sbBoard .sb-panel.duty .sb-arow.c6r[data-move="mv:d.0.0.${ri}"]`)
const rmkIn = (ri: number) => dutyRow(ri).querySelector('.rmkin') as HTMLInputElement
const rmkAdd = (ri: number) => dutyRow(ri).querySelector('[data-rmkadd]') as HTMLButtonElement

describe('an empty duty remarks box, and the + that reveals it', () => {
  it('an empty remarks input carries .empty, and its row carries a + button', () => {
    expect(DAYS[0].dutywaves[0].rows.length, 'the fixture needs at least two rows for the next test').toBeGreaterThanOrEqual(2)
    const inp = rmkIn(0)
    expect(inp.classList.contains('empty')).toBe(true)
    const btn = rmkAdd(0)
    expect(btn).toBeTruthy()
    expect(btn.dataset.rmkadd).toBe('dr:0.0.0.rmks')
  })

  it('clicking + clears .empty on that row only, and focuses its input', async () => {
    expect(rmkIn(0).classList.contains('empty')).toBe(true)
    expect(rmkIn(1).classList.contains('empty')).toBe(true)
    await click(rmkAdd(0))
    await settle()
    expect(rmkIn(0).classList.contains('empty'), 'the asked-for row is revealed').toBe(false)
    expect(rmkIn(1).classList.contains('empty'), 'every other row keeps its empty box hidden').toBe(true)
    expect(document.activeElement, 'focus lands on the revealed input, after the repaint').toBe(rmkIn(0))
  })

  it('a row with a remark never carries .empty', async () => {
    DAYS[0].dutywaves[0].rows[0].rmks = 'Covering the late brief'
    await act(async () => { notify() })
    expect(rmkIn(0).classList.contains('empty')).toBe(false)
  })

  it('typing a remark drops .empty on its own repaint, no + needed', async () => {
    expect(rmkIn(0).classList.contains('empty')).toBe(true)
    await change(rmkIn(0), 'Standing in for Bane')
    expect(rmkIn(0).classList.contains('empty'), 'the funnel commit already re-hung the panel').toBe(false)
    expect(DAYS[0].dutywaves[0].rows[0].rmks).toBe('Standing in for Bane')
  })

  it('is pure UI state — no edit-log row, nothing marked pending', async () => {
    expect(ELOG.rows.length, 'a clean slate to measure from').toBe(0)
    const pendingBefore = Object.keys(SCHED.pending).length
    await click(rmkAdd(0))
    await settle()
    expect(ELOG.rows.length, 'revealing an empty box writes nothing to the changes list').toBe(0)
    expect(Object.keys(SCHED.pending).length, 'and marks nothing pending').toBe(pendingBefore)
    expect(SCHED.pending['dr:0.0.0.rmks']).toBeFalsy()
  })
})
